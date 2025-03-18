'use client';

import React, { useState, useEffect } from 'react';
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
import { useMutation } from '@tanstack/react-query';
import { ExternalLink, Clock, ArrowRight, RotateCw } from 'lucide-react';
import { getExchangeRate } from '@/app/lib/api-calls';
import { exchangeRateSchema } from '@/app/lib/dto';
import { z } from 'zod';
import { toast } from 'sonner';

// Define the exchange rate result interface
interface ExchangeRateResult {
  success: boolean;
  data: {
    amount: number;
    provider_name: string;
    fee?: number;
    rate?: number;
    destinationAmount?: number;
  };
  message: string;
}

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
];

const countryCurrencyMap: Record<string, string> = {
  'US': 'USD',
  'CA': 'CAD',
  'GB': 'GBP',
  'AU': 'AUD',
  'DE': 'EUR',
  'FR': 'EUR',
  'JP': 'JPY',
};

// Session timeout in milliseconds (5 minutes)
const SESSION_TIMEOUT = 5 * 60 * 1000;

export default function PaymentPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const [showSessionWarning, setShowSessionWarning] = useState<boolean>(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number>(SESSION_TIMEOUT);
  const [exchangeRateResult, setExchangeRateResult] = useState<ExchangeRateResult | null>(null);

  const updateActivityTimer = () => {
    setLastActivityTime(Date.now());
    setShowSessionWarning(false);
  };

  useEffect(() => {
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    
    const resetTimer = () => {
      updateActivityTimer();
    };
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  useEffect(() => {
    const sessionCheckInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityTime;
      const remaining = Math.max(0, SESSION_TIMEOUT - elapsed);
      
      setSessionTimeLeft(remaining);
      
      if (remaining < 60000 && remaining > 0 && !showSessionWarning) {
        setShowSessionWarning(true);
        toast.warning("Your session will expire soon. Continue?", {
          action: {
            label: "Continue",
            onClick: () => updateActivityTimer()
          },
          duration: remaining
        });
      }
      
      if (remaining === 0) {
        toast.error("Your session has expired");
        clearInterval(sessionCheckInterval);
        router.push('/');
      }
    }, 1000);
    
    return () => {
      clearInterval(sessionCheckInterval);
    };
  }, [lastActivityTime, router, showSessionWarning]);

  const getAuthToken = (): string => {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '' 
      : '';
    return token;
  };

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
      if (data) {
        // Store data but don't redirect yet
        sessionStorage.setItem('conversionData', JSON.stringify(data));
        // Set the exchange rate result to display on the page
        setExchangeRateResult(data);
        toast.success("Exchange rate calculated successfully");
      }
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to calculate exchange rate. Please try again.');
    }
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    updateActivityTimer();
    // Reset exchange rate result when amount changes
    if (exchangeRateResult) {
      setExchangeRateResult(null);
    }
  };

  const handleCountryChange = (value: string) => {
    setCountry(value);
    updateActivityTimer();
    // Reset exchange rate result when country changes
    if (exchangeRateResult) {
      setExchangeRateResult(null);
    }
  };

  const handleCalculateExchangeRate = async (e: React.FormEvent) => {
    e.preventDefault();
    updateActivityTimer();
    
    if (!amount || !country) {
      setError('Please enter an amount and select a country');
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
    
    const currencyCode = countryCurrencyMap[country] || 'USD';
    
    exchangeRateMutation.mutate({
      currency: currencyCode,
      amount: parseFloat(amount),
      token
    });
  };
  
  const handleProceedToPayment = () => {
    updateActivityTimer();
    sessionStorage.setItem('conversionData', JSON.stringify(exchangeRateResult));
    router.push('/payment/collection-account');
  };

  // Format time for display (mm:ss)
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
            Enter the amount you want to send
          </p>
        </div>
        
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Enter the amount and select recipient&apos;s country
                </CardDescription>
              </div>
              {sessionTimeLeft < SESSION_TIMEOUT && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Session: {formatTimeLeft(sessionTimeLeft)}</span>
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
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">
                        {country ? (country === 'US' ? '$' : country === 'GB' ? '£' : country === 'JP' ? '¥' : '€') : '$'}
                      </span>
                    </div>
                    <Input
                      type="number"
                      id="amount"
                      className="pl-7"
                      placeholder="0.00"
                      min="100"
                      step="0.01"
                      value={amount}
                      onChange={handleAmountChange}
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Minimum amount: {country && countryCurrencyMap[country] ? countryCurrencyMap[country] : 'USD'} 100.00
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Sender&apos;s Country</Label>
                  <Select value={country} onValueChange={handleCountryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name} ({countryCurrencyMap[country.code]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100"
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

        {/* Exchange Rate Results */}
        {exchangeRateResult && (
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Exchange Rate Results</CardTitle>
              <CardDescription>Review your payment details before proceeding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">You send</p>
                  <p className="text-xl font-bold text-black dark:text-white mt-1">
                    {country && countryCurrencyMap[country] ? countryCurrencyMap[country] : 'USD'} {parseFloat(amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Naira equivalent</p>
                  <p className="text-xl font-bold text-black dark:text-white mt-1">
                    ₦ {exchangeRateResult.data?.destinationAmount ? 
                      exchangeRateResult.data.destinationAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 
                      (parseFloat(amount) * (exchangeRateResult.data?.rate || 750)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Exchange rate</p>
                  <p className="text-black dark:text-white mt-1">
                    1 {country && countryCurrencyMap[country] ? countryCurrencyMap[country] : 'USD'} = ₦ {(exchangeRateResult.data?.rate || 750).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fee</p>
                  <p className="text-black dark:text-white mt-1">
                    ₦ {(exchangeRateResult.data?.fee || parseFloat(amount) * 0.01).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pb-6">
              <Button
                onClick={handleProceedToPayment}
                className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100"
              >
                Proceed with Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        <Card className="border-l-4 border-gray-900 dark:border-white bg-gray-50 dark:bg-black">
          <CardHeader>
            <CardTitle className="text-lg">About Exchange Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Our exchange rates are updated in real-time to give you the best value when sending money to Nigeria. 
              We charge a transparent fee of 1% on the exchange rate.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}