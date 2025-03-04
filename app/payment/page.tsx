'use client';


import React, { useState } from 'react';
import Container from '../components/Container';
import Button from '../components/Button';
import { paymentService } from '../lib/api/services';
import { ConversionResponse } from '../lib/api/types';
import { useRouter } from 'next/navigation';

// Mock country data - in a real app, this would come from an API
const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
];

// Map country codes to currency codes
const countryCurrencyMap: Record<string, string> = {
  'US': 'USD', // United States - US Dollar
  'CA': 'CAD', // Canada - Canadian Dollar
  'GB': 'GBP', // United Kingdom - British Pound
  'AU': 'AUD', // Australia - Australian Dollar
  'DE': 'EUR', // Germany - Euro
  'FR': 'EUR', // France - Euro
  'JP': 'JPY', // Japan - Japanese Yen
};

export default function PaymentPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [, setConversionData] = useState<ConversionResponse['data'] | null>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(e.target.value);
  };

  const handleCalculateExchangeRate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !country) {
      setError('Please enter an amount and select a country');
      return;
    }
    
    if (parseFloat(amount) < 100) {
      setError('Minimum amount is $100.00');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the currency code based on the selected country
      const currencyCode = countryCurrencyMap[country] || 'USD';
      
      console.log(`Calculating exchange rate for ${currencyCode} ${amount}`);
      
      // Calculate exchange rate
      const response = await paymentService.calculateAmount(currencyCode, parseFloat(amount));
      
      console.log('Exchange rate calculation successful:', response);
      
      // Store conversion data in session storage for the next step
      if (response && response.data) {
        sessionStorage.setItem('conversionData', JSON.stringify(response.data));
        setConversionData(response.data);
        
        // Navigate to the next step
        router.push('/payment/collection-account');
      } else {
        throw new Error('Invalid response format from the server');
      }
    } catch (err: unknown) {
      console.error('Error calculating exchange rate:', err);
      
      // Provide a more specific error message if possible
      let errorMessage = 'Failed to calculate exchange rate. Please try again.';
      
      if (err instanceof Error) {
        // Check for specific error messages
        if (err.message.includes('404')) {
          errorMessage = 'The exchange rate service is currently unavailable. Please try again later.';
        } else if (err.message.includes('JSON')) {
          errorMessage = 'There was an issue with the server response. Please contact support.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">


      <Container maxWidth="full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-gradient">Send Payment</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Enter the amount you want to send
          </p>
        </div>
        
        <div className="container-card border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700 shadow-md">
          <form className="space-y-6" onSubmit={handleCalculateExchangeRate}>
            {error && (
              <div className="bg-error-100 text-error-700 p-3 rounded-md dark:bg-error-700 dark:bg-opacity-20 dark:text-error-500">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Amount in USD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    className="input-field pl-7 pr-12 py-3 text-base shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:text-white"
                    placeholder="0.00"
                    min="100"
                    step="0.01"
                    required
                    value={amount}
                    onChange={handleAmountChange}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <label htmlFor="currency" className="sr-only">Currency</label>
                    <div className="h-full py-0 pl-2 pr-4 flex items-center bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-sm">
                      USD
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Minimum amount: $100.00
                </p>
              </div>
              
              <div className="md:col-span-1">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Recipient&apos;s Country
                </label>
                <select
                  id="country"
                  name="country"
                  className="input-field py-3 text-base h-[42px] shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:text-white"
                  required
                  value={country}
                  onChange={handleCountryChange}
                >
                  <option value="" disabled>Select country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="pt-4 mt-6">
              <Button
                type="submit"
                fullWidth
                size="lg"
                className="mt-2 bg-brand-black text-white dark:bg-white dark:text-brand-black hover:bg-brand-blue-gray hover:text-white dark:hover:bg-brand-blue-gray dark:hover:text-white shadow-md"
                disabled={isLoading}
              >
                {isLoading ? 'Calculating...' : 'Calculate Exchange Rate'}
              </Button>
              <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                By proceeding, you agree to our <span className="text-primary-600 hover:text-primary-800 dark:text-white dark:hover:text-gray-300 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-primary-600 hover:text-primary-800 dark:text-white dark:hover:text-gray-300 hover:underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          </form>
        </div>

        {/* Exchange Rate Info Card */}
        <div className="mt-8 container-card bg-gray-50 dark:bg-black border-l-4 border-primary-500 p-4 md:p-6 shadow-md">
          <h3 className="font-medium mb-2 text-primary-700 dark:text-white">About Exchange Rates</h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
            Our exchange rates are updated in real-time to give you the best value for your international payments. 
            We charge a transparent fee of 1% on the exchange rate.
          </p>
        </div>
      </Container>
    </div>
  );
} 