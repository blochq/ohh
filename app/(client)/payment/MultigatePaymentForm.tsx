'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQuery } from '@tanstack/react-query';
import { ExternalLink, Clock, ArrowRight, RotateCw } from 'lucide-react';
import { getExchangeRate, getTransferFee, getSupportedCurrencies, getSupportedCountries } from '@/lib/api-calls';
import { exchangeRateSchema, getTransferFeeSchema, getSupportedCurrenciesSchema, getSupportedCountriesSchema } from '@/lib/dto';
import { z } from 'zod';
import { toast } from 'sonner';
import { usePaymentContext } from '@/context/payment-context';
import { IConversion, ISupportedCurrency, ISupportedCountry } from '@/lib/models'; 
import { getAuthToken } from '@/lib/helper-function';

const RATE_VALIDITY_DURATION = 1 * 60 * 1000;

const FALLBACK_COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD' }
];

export default function MultigatePaymentForm() {
  const router = useRouter();
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showSessionWarning, setShowSessionWarning] = useState<boolean>(false);
  const [rateTimeLeft, setRateTimeLeft] = useState<number>(RATE_VALIDITY_DURATION);
  const [rateCalculationTimestamp, setRateCalculationTimestamp] = useState<number | null>(null);
  const [transferFee, setTransferFee] = useState<{fee: number, vat: number} | null>(null);
  const [supportedCountries, setSupportedCountries] = useState<ISupportedCountry[]>([]);
  const [supportedCurrencies, setSupportedCurrencies] = useState<ISupportedCurrency[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const {
    exchangeRateData,
    setExchangeRateData,
    conversionData,
    setConversionData,
    updateActivity,
    destinationCountry,
    setDestinationCountry,
    selectedCurrency,
    setSelectedCurrency
  } = usePaymentContext();

  const currentDestinationCountry = destinationCountry || '';
  const currentSelectedCurrency = selectedCurrency || '';

  const token = getAuthToken();

  const { data: currenciesData } = useQuery({
    queryKey: ['supportedCurrencies'],
    queryFn: async () => {
      if (!token) throw new Error('Authentication required');
      const input: z.infer<typeof getSupportedCurrenciesSchema> = { token };
      const response = await getSupportedCurrencies(input);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    enabled: !!token,
  });

  const { data: countriesData, error: countriesError } = useQuery({
    queryKey: ['supportedCountries'],
    queryFn: async () => {
      if (!token) throw new Error('Authentication required');
      const input: z.infer<typeof getSupportedCountriesSchema> = { 
        token,
        account_id: '677b05091a76dcbc1b5341c5'
      };
      const response = await getSupportedCountries(input);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (currenciesData?.data) {
      setSupportedCurrencies(currenciesData.data);
    }
    if (countriesData?.data) {
      // Transform the API response into the required format
      const transformedCountries = Object.entries(countriesData.data)
        .filter(([key]) => key.endsWith('_code')) // Only get country codes
        .map(([key, code]) => {
          const countryName = key.replace('_code', '');
          const currency = countriesData.data[countryName];
          return {
            code: code as string,
            name: countryName,
            currency: currency as string
          };
        })
        .filter(country => country.code && country.name && country.currency); // Filter out invalid entries
      
      setSupportedCountries(transformedCountries);
    } else if (countriesError) {
      // Fallback to United States if API fails
      setSupportedCountries(FALLBACK_COUNTRIES);
      toast.warning('Using fallback country list');
    }
  }, [currenciesData, countriesData, countriesError]);

  useEffect(() => {
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    
    const generalActivityReset = () => {
      updateActivity();
    };
    
    events.forEach(event => {
      window.addEventListener(event, generalActivityReset);
    });
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, generalActivityReset);
      });
    };
  }, [updateActivity]);

  useEffect(() => {
    if (!rateCalculationTimestamp || !exchangeRateData) {
      setRateTimeLeft(RATE_VALIDITY_DURATION);
      setShowSessionWarning(false);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSinceCalculation = now - rateCalculationTimestamp;
      const remaining = Math.max(0, RATE_VALIDITY_DURATION - elapsedSinceCalculation);
      
      setRateTimeLeft(remaining);
      
      if (remaining < 30000 && remaining > 0 && !showSessionWarning) {
        setShowSessionWarning(true);
        toast.warning("Exchange rate will expire soon. Complete your transaction.", {
          duration: remaining > 5000 ? remaining - 2000 : remaining,
        });
      } else if (remaining === 0 && showSessionWarning) {
        setShowSessionWarning(false);
      }
      
      if (remaining === 0) {
        toast.error("Exchange rate has expired. Please recalculate.");
        setExchangeRateData(null);
        setTransferFee(null);
        setConversionData(null);
        setRateCalculationTimestamp(null);
        setError("Exchange rate has expired. Please calculate again.");
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [rateCalculationTimestamp, exchangeRateData, showSessionWarning, setExchangeRateData, setTransferFee, setConversionData, updateActivity]);

  const transferFeeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof getTransferFeeSchema>) => {
      const response = await getTransferFee(data);
      if (response.error) {
        throw new Error(response.error.message);
      }
      if (response.validationErrors && response.validationErrors.length > 0) {
        throw new Error(response.validationErrors[0].message);
      }
      return response.data;
    },
    onSuccess: (data) => {
      if (data && data.data) {
        setTransferFee({
          fee: data.data.transaction_fee,
          vat: data.data.transaction_vat
        });
      }
    },
    onError: (error: Error) => {
      console.error('Failed to fetch transfer fee:', error);
    }
  });

  const exchangeRateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof exchangeRateSchema>) => {
      const response = await getExchangeRate(data);
      if (response.error) {
        throw new Error(response.error.message);
      }
      if (response.validationErrors && response.validationErrors.length > 0) {
        throw new Error(response.validationErrors[0].message);
      }
      return response.data;
    },
    onSuccess: (data) => {
      if (data && data.success) {

        transferFeeMutation.mutate({
          token,
          amount: data.data.amount
        });


        setExchangeRateData({
          data: {
            amount: (data.data.amount/100),
            provider_name: data.data.provider_name
          },
          success: true,
          message: 'Exchange rate calculated successfully'
        });
        if (data.data) {
          setRateCalculationTimestamp(Date.now());
          setShowSessionWarning(false);
          const convData: IConversion = {
            sourceCurrency: 'NGN',
            sourceAmount: data.data.amount/100,
            destinationCurrency: selectedCurrency as string,
            destinationAmount: parseFloat(amount),
            rate: (data.data.amount/100) / parseFloat(amount),
            fee: (transferFee?.fee || 0) + (transferFee?.vat || 0),
            provider_name: data.data.provider_name,
            amount: (data.data.amount/100 ) 
          };
          setConversionData(convData);
          
  
        }
        
        toast.success("Exchange rate calculated successfully");

        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to calculate exchange rate. Please try again.');
    }
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    updateActivity();
    if (exchangeRateData) {
      setExchangeRateData(null);
      setTransferFee(null);
      setRateCalculationTimestamp(null);
      setShowSessionWarning(false);
    }
  };

  const handleDestinationCountryChange = (value: string) => {
    setDestinationCountry(value);
    updateActivity();
  
    if (exchangeRateData) {
      setExchangeRateData(null);
      setTransferFee(null);
      setRateCalculationTimestamp(null);
      setShowSessionWarning(false);
    }
  };
  

  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
    updateActivity();
  
    if (exchangeRateData) {
      setExchangeRateData(null);
      setTransferFee(null);
      setRateCalculationTimestamp(null);
      setShowSessionWarning(false);
    }
  };

  const handleCalculateExchangeRate = async (e: React.FormEvent) => {
    e.preventDefault();
    updateActivity();
    
    if (!amount || !currentDestinationCountry || !currentSelectedCurrency) {
      setError('Please enter an amount and select both destination country and currency');
      return;
    }
    
    if (parseFloat(amount) < 100) {
      setError('Minimum amount is 100.00');
      return;
    }
    
    setError(null);
    
    const token = getAuthToken();
    if (!token) {
      setError('You must be logged in to proceed');
      return;
    }
    
    exchangeRateMutation.mutate({
      source_currency: 'NGN',
      destination_currency: currentSelectedCurrency as string,
      amount: parseFloat(amount),
      token
    });
  };
  
  const handleProceedToPayment = () => {
    updateActivity();
    if (rateTimeLeft === 0) {
      toast.error("Cannot proceed, exchange rate has expired. Please recalculate.");
      return;
    }
    router.push('/payment/collection-account');
  };


  const formatTimeLeft = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };




  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 bg-clip-text text-transparent">
            Send Payment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Enter the amount and select destination details
          </p>
        </div>
        
        <Card className="border-gray-200 dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all duration-200">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Enter the amount and select destination country and currency
                </CardDescription>
              </div>
              {exchangeRateData && rateCalculationTimestamp && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Rate valid for: {formatTimeLeft(rateTimeLeft)}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculateExchangeRate} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currentSelectedCurrency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedCurrencies.map((currency) => (
                        <SelectItem key={currency._id} value={currency.currency}>
                          {currency.currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinationCountry">Destination Country</Label>
                  <Select value={currentDestinationCountry} onValueChange={handleDestinationCountryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination country" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedCountries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">
                        {currentSelectedCurrency || '$'}
                      </span>
                    </div>
                    <Input
                      type="number"
                      id="amount"
                      className="pl-[50px]"
                      placeholder="0.00"
                      min="100"
                      step="0.01"
                      value={amount}
                      onChange={handleAmountChange}
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Minimum amount: {currentSelectedCurrency || 'USD'} 100.00
                  </p>
                </div>
                



              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full py-5 mt-4  bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100"
                  disabled={exchangeRateMutation.isPending}
                >
                  {exchangeRateMutation.isPending ? (
                    <>
                      <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : 'Calculate Exchange Rate'}
                </Button>
                <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                  By proceeding, you agree to our{' '}
                  <Button variant="link" className="px-1 h-auto text-xs">
                    Terms of Service
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                  {' '}and{' '}
                  <Button variant="link" className="px-1 h-auto text-xs">
                    Privacy Policy
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {exchangeRateData && (
          <Card ref={resultsRef} className="border-gray-200 dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all duration-200 scroll-mt-4">
            <CardHeader>
              <CardTitle>Exchange Rate Results</CardTitle>
              <CardDescription>Review your payment details before proceeding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">You send (NGN)</p>
                  <p className="text-xl font-bold text-black dark:text-white mt-1">
                    ₦ {exchangeRateData.data?.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Recipient gets</p>
                  <p className="text-xl font-bold text-black dark:text-white mt-1">
                    {currentSelectedCurrency} {parseFloat(amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Exchange rate</p>
                  <p className="text-black dark:text-white mt-1">
                    1 {currentSelectedCurrency} = ₦ {(conversionData?.rate || 750).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>


              </div>
            </CardContent>
            <CardFooter className="flex justify-center pb-6">
              <Button
                onClick={handleProceedToPayment}
                disabled={transferFeeMutation.isPending || rateTimeLeft === 0 || !exchangeRateData}
                className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100"
              >
                Proceed with Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        <Card className="  shadow-xl hover:shadow-2xl transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg">About Exchange Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Our exchange rates are updated in real-time to give you the best value when sending money internationally. 
              Fees include transaction processing costs and VAT as required by local regulations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 