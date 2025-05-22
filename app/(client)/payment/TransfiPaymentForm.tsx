"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { usePaymentContext } from "@/context/payment-context";
import { ITransfiPaymentMethod, ITransfiGetRatesResponse, IApiResponse, ITransfiListCurrenciesResponse, ITransfiListPaymentMethodsResponse } from "@/lib/models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getAuthToken } from "@/lib/helper-function";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { RotateCw } from 'lucide-react';

// MOCK MODE FLAG
const MOCK_MODE = true;

// --- Mock Data ---
const mockApiResponseCurrencies: IApiResponse<ITransfiListCurrenciesResponse> = {
  data: {
    StatusCode: 200,
    Message: "success",
    Data: { details: ["BRL", "CLP", "CNY", "COP", "EGP", "EUR", "IDR", "KES", "MXN", "NGN", "PHP", "USD", "VND", "XAF", "ZAR", "ZMW"] }
  }
};

const mockApiResponsePaymentMethods: IApiResponse<ITransfiListPaymentMethodsResponse> = {
  data: {
    StatusCode: 200,
    Message: "success",
    Data: {
      details: [
        {
          paymentCode: "sepa_pull", name: "Open Banking", minAmount: 1, maxAmount: 100000,
          logoUrl: "https://common-payment-methods-logo.s3.ap-southeast-1.amazonaws.com/SepaQR.svg", paymentType: "bank_transfer"
        },
        {
          paymentCode: "sepa_bank_va", name: "SEPA Bank Transfer", minAmount: 1, maxAmount: 100000,
          logoUrl: "https://common-payment-methods-logo.s3.ap-southeast-1.amazonaws.com/SepaBank.svg", paymentType: "bank_transfer"
        },
      ]
    }
  }
};

const mockApiResponseRates: IApiResponse<ITransfiGetRatesResponse> = {
  data: {
    StatusCode: 200,
    Message: "success",
    Data: {
      details: {
        fiatTicker: "EUR",
        fiatAmount: 1000,
        withdrawAmount: 1080, 
        exchangeRate: 1.08,
        quoteId: "mock-quote-id-123",
        fees: { processingFee: 0, partnerFee: 0, totalFee: 0 }
      }
    }
  }
};

// --- Mock API Functions ---
const mockGetTransfiCurrencies = async (): Promise<IApiResponse<ITransfiListCurrenciesResponse>> => {
  await new Promise(res => setTimeout(res, 500));
  return mockApiResponseCurrencies;
};

const mockGetTransfiPaymentMethods = async ({ token: _token, currency: _currency }: {token: string| null, currency: string }): Promise<IApiResponse<ITransfiListPaymentMethodsResponse>> => {
  await new Promise(res => setTimeout(res, 500));
  // In a real mock, you might filter methods by _currency argument if needed
  // console.log("Mock fetching payment methods for currency:", _currency, "with token:", _token);
  return mockApiResponsePaymentMethods;
};

const mockGetTransfiRates = async ({ token: _token, amount, currency, settlementCurrency: _settlementCurrency }: {token: string | null, amount: number, currency: string, settlementCurrency: string }): Promise<IApiResponse<ITransfiGetRatesResponse>> => {
  await new Promise(res => setTimeout(res, 500));
  // console.log("Mock getting rates with token:", _token, "settlementCurrency:", _settlementCurrency);
  const response = JSON.parse(JSON.stringify(mockApiResponseRates)); 
  if (response.data) {
    response.data.Data.details.fiatAmount = amount;
    response.data.Data.details.fiatTicker = currency;
    const rate = currency === "EUR" ? 1.08 : 1.05;
    response.data.Data.details.withdrawAmount = amount * rate;
    response.data.Data.details.exchangeRate = rate;
    response.data.Data.details.quoteId = `mock-quote-${Date.now()}`;
  }
  return response;
};

export default function TransfiPaymentForm({ onPay }: { onPay?: (quoteId: string) => void }) {
  const {
    transfiCurrency,
    setTransfiCurrency,
    transfiPaymentMethod,
    setTransfiPaymentMethod,
    transfiQuote,
    setTransfiQuote,
  } = usePaymentContext();

  const [amount, setAmount] = useState<string>("");
  const [settlementCurrency, _setSettlementCurrency] = useState<string>("USDT");
  const token = getAuthToken();

  const { data: currenciesResponse, isLoading: isCurrenciesLoading, error: currenciesError } = useQuery<
    IApiResponse<ITransfiListCurrenciesResponse>,
    Error
  >({
    queryKey: ["transfi-currencies", token],
    queryFn: () =>
      MOCK_MODE
        ? mockGetTransfiCurrencies()
        : import("@/lib/api-calls").then(mod => mod.getTransfiCurrencies({ token })),
    enabled: !!token || MOCK_MODE,
  });

  const { data: paymentMethodsResponse, isLoading: isPaymentMethodsLoading, error: paymentMethodsError } = useQuery<
    IApiResponse<ITransfiListPaymentMethodsResponse>,
    Error
  >({
    queryKey: ["transfi-payment-methods", transfiCurrency, token],
    queryFn: () => {
      if (!transfiCurrency) throw new Error("Currency not selected");
      return MOCK_MODE
        ? mockGetTransfiPaymentMethods({ token, currency: transfiCurrency })
        : import("@/lib/api-calls").then(mod => mod.getTransfiPaymentMethods({ token, currency: transfiCurrency! }));
    },
    enabled: !!transfiCurrency && (!!token || MOCK_MODE),
  });

  const ratesMutation = useMutation<
    IApiResponse<ITransfiGetRatesResponse>,
    Error,
    { amount: number; currency: string; settlementCurrency: string }
  >({
    mutationFn: (variables) => {
      if (!token && !MOCK_MODE) throw new Error("Authentication token is missing.");
      return MOCK_MODE
        ? mockGetTransfiRates({ token, ...variables })
        : import("@/lib/api-calls").then(mod => mod.getTransfiRates({
          token,
          AMOUNT: variables.amount,
          CURRENCY: variables.currency,
          SETTLEMENT_CURRENCY: variables.settlementCurrency,
        }));
    },
    onSuccess: (response) => {
      if (response.data?.Data.details) {
        setTransfiQuote(response.data.Data.details);
        toast.success("Rates calculated successfully!");
      } else {
        toast.error(response.data?.Message || "Failed to get rate details.");
        setTransfiQuote(null);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to calculate rates.");
      setTransfiQuote(null);
    },
  });

  useEffect(() => {
    setTransfiPaymentMethod(null);
    setTransfiQuote(null);
  }, [transfiCurrency, setTransfiPaymentMethod, setTransfiQuote]);

  const handleCalculateRate = () => {
    if (!amount || !transfiCurrency || !settlementCurrency) {
      toast.error("Please fill in amount and select currency/payment method.");
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }
    if (!transfiPaymentMethod){
        toast.error("Please select a payment method.");
        return;
    }
    ratesMutation.mutate({ amount: numericAmount, currency: transfiCurrency, settlementCurrency });
  };

  const currencies = currenciesResponse?.data?.Data.details || [];
  const paymentMethods = paymentMethodsResponse?.data?.Data.details || [];

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>Select currency, payment method, and enter amount to get rates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="transfi-currency">Select Currency</Label>
          <Select
            value={transfiCurrency || undefined}
            onValueChange={(val) => setTransfiCurrency(val)}
            disabled={isCurrenciesLoading}
          >
            <SelectTrigger id="transfi-currency" className="w-full">
              <SelectValue placeholder={isCurrenciesLoading ? "Loading currencies..." : "Select currency"} />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((cur: string) => (
                <SelectItem key={cur} value={cur}>{cur}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currenciesError && <p className="text-red-500 text-sm mt-1">Error: {currenciesError.message}</p>}
        </div>

        <div>
          <Label htmlFor="transfi-payment-method">Select Payment Method</Label>
          <Select
            value={transfiPaymentMethod?.paymentCode || undefined}
            onValueChange={(val) => {
              const method = paymentMethods.find((m: ITransfiPaymentMethod) => m.paymentCode === val);
              setTransfiPaymentMethod(method || null);
              setTransfiQuote(null);
            }}
            disabled={!transfiCurrency || isPaymentMethodsLoading}
          >
            <SelectTrigger id="transfi-payment-method" className="w-full">
              <SelectValue placeholder={
                !transfiCurrency ? "Select currency first"
                : isPaymentMethodsLoading ? "Loading methods..."
                : "Select payment method"
              } />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method: ITransfiPaymentMethod) => (
                <SelectItem key={method.paymentCode} value={method.paymentCode}>
                  <div className="flex items-center space-x-2">
                    {method.logoUrl && <Image src={method.logoUrl} alt={method.name} width={24} height={24} className="inline-block rounded" />}
                    <span>{method.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {paymentMethodsError && <p className="text-red-500 text-sm mt-1">Error: {paymentMethodsError.message}</p>}
        </div>

        <div>
          <Label htmlFor="amount">Amount ({transfiCurrency || 'XXX'})</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setTransfiQuote(null);
            }}
            disabled={!transfiPaymentMethod}
            className="w-full"
          />
        </div>

        <Button
          onClick={handleCalculateRate}
          disabled={!amount || !transfiPaymentMethod || ratesMutation.isPending}
          className="w-full"
        >
          {ratesMutation.isPending ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : 'Calculate Rate'}
        </Button>

        {ratesMutation.isError && (
           <p className="text-red-500 text-sm mt-1">Error calculating rates: {ratesMutation.error?.message}</p>
        )}

        {transfiQuote && (
          <div className="mt-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-800 space-y-2">
            <h3 className="text-lg font-semibold">Rate Quotation</h3>
            <p><strong>Paying:</strong> {transfiQuote.fiatAmount.toFixed(2)} {transfiQuote.fiatTicker}</p>
            <p><strong>You Get (approx.):</strong> {transfiQuote.withdrawAmount.toFixed(2)} {settlementCurrency}</p>
            <p><strong>Rate:</strong> 1 {transfiQuote.fiatTicker} ≈ {transfiQuote.exchangeRate.toFixed(6)} {settlementCurrency}</p>
            {transfiQuote.fees && <p><strong>Total Fee:</strong> {transfiQuote.fees.totalFee.toFixed(2)} {transfiQuote.fiatTicker}</p>}
            <p className="text-xs text-gray-500 pt-2">Quote ID: {transfiQuote.quoteId}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end pt-6">
        <Button
          type="button"
          className="min-w-[150px]"
          disabled={!transfiQuote || ratesMutation.isPending}
          onClick={() => onPay && transfiQuote?.quoteId && onPay(transfiQuote.quoteId)}
        >
          {ratesMutation.isPending ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : 'Proceed to Pay'}
        </Button>
      </CardFooter>
    </Card>
  );
} 