import React from 'react';
import Container from '../components/Container';
import Button from '../components/Button';
import Logo from '../components/Logo';
import Link from 'next/link';

// Mock country data - in a real app, this would come from an API
const countries = [
  { code: 'us', name: 'United States' },
  { code: 'ca', name: 'Canada' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'au', name: 'Australia' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'jp', name: 'Japan' },
];

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary-50 p-4">
      <header className="flex justify-between items-center mb-8 pt-4">
        <Logo size="md" className="text-gradient" />
        <Link 
          href="/dashboard" 
          className="text-sm text-primary-600 hover:text-primary-800 hover:underline flex items-center transition-colors"
        >
          <svg 
            className="w-4 h-4 mr-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          Back to Dashboard
        </Link>
      </header>

      <Container maxWidth="full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-gradient">Send Payment</h1>
          <p className="text-gray-600">
            Enter the amount you want to send
          </p>
        </div>
        
        <div className="container-card shadow-md">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount in USD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    className="input-field pl-7 pr-12 py-3 text-base shadow-sm"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <label htmlFor="currency" className="sr-only">Currency</label>
                    <div className="h-full py-0 pl-2 pr-4 flex items-center bg-white text-gray-500 text-sm">
                      USD
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Minimum amount: $100.00
                </p>
              </div>
              
              <div className="md:col-span-1">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient&apos;s Country
                </label>
                <select
                  id="country"
                  name="country"
                  className="input-field py-3 text-base h-[42px] shadow-sm"
                  required
                >
                  <option value="" disabled selected>Select country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="pt-4 mt-6">
              <Link href="/payment/result">
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  className="mt-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 hover-lift shadow-md"
                >
                  Calculate Exchange Rate
                </Button>
              </Link>
              <p className="mt-4 text-xs text-center text-gray-500">
                By proceeding, you agree to our <span className="text-primary-600 hover:text-primary-800 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-primary-600 hover:text-primary-800 hover:underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          </form>
        </div>

        {/* Exchange Rate Info Card */}
        <div className="mt-8 container-card bg-gray-50 border-l-4 border-primary-500 p-4 md:p-6 shadow-md">
          <h3 className="font-medium mb-2 text-primary-700">About Exchange Rates</h3>
          <p className="text-sm md:text-base text-gray-600">
            Our exchange rates are updated in real-time to give you the best value for your international payments. 
            We charge a transparent fee of 1% on the exchange rate.
          </p>
        </div>
      </Container>
    </div>
  );
} 