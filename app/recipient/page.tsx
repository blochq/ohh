import React from 'react';
import Container from '../components/Container';
import Button from '../components/Button';
import Input from '../components/Input';
import Logo from '../components/Logo';
import Link from 'next/link';

export default function RecipientPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">
      <header className="flex justify-between items-center mb-8 pt-4">
        <Logo size="md" className="text-gradient" />
        <Link 
          href="/payment/result" 
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
          Back
        </Link>
      </header>

      <Container maxWidth="full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2  dark:text-white">Recipient Details</h1>
          <p className="text-gray-600 dark:text-white">
            Enter the bank account details of your recipient
          </p>
        </div>
        
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center w-full max-w-xs">
              <div className="flex-1">
                <div className="w-full bg-primary-500 h-1 rounded-full"></div>
              </div>
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full text-white dark:text-black flex items-center justify-center text-sm font-medium shadow-md">
                  3
                </div>
                <div className="mt-2 text-xs text-primary-700 text-center font-medium">
                  Recipient
                </div>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 h-1 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container-card shadow-md">
          <form className="space-y-8">
            <div className="md:grid md:grid-cols-5 md:gap-8">
              {/* Personal Information Section - Takes up 2/5 on desktop */}
              <div className="md:col-span-2">
                <fieldset className="space-y-4">
                  <legend className="text-lg font-medium mb-4 text-primary-700 border-b pb-2">Personal Information</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className=' bg-white dark:bg-brand-black'
                      placeholder="Enter first name"
                    />
                    
                    <Input
                      label="Last Name"
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className=' bg-white dark:bg-brand-black'
                      placeholder="Enter last name"
                    />
                  </div>
                  
                  <Input
                    label="Email Address"
                    id="email"
                    name="email"
                    type="email"
                      required
                    className=' bg-white dark:bg-brand-black'
                    placeholder="recipient@example.com"
                  />
                  
                  <div>
                    <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                      Purpose of Payment
                    </label>
                    <select
                      id="purpose"
                      name="purpose"
                      className="input-field py-3 text-base bg-white dark:bg-brand-black"
                      required
                    >
                      <option value="" disabled selected>Select purpose</option>
                      <option value="family">Family Support</option>
                      <option value="business">Business</option>
                      <option value="education">Education</option>
                      <option value="medical">Medical</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </fieldset>
              </div>
              
              {/* Vertical divider visible only on desktop */}
              <div className="hidden md:block md:col-span-1">
                <div className="h-full w-px bg-gradient-to-b from-primary-100 via-primary-300 to-primary-100 mx-auto"></div>
              </div>
              
              {/* Bank Details Section - Takes up 2/5 on desktop */}
              <div className="md:col-span-2 pt-6 md:pt-0">
                <fieldset className="space-y-4 md:border-0 md:pt-0 pt-6 border-t">
                  <legend className="text-lg font-medium mb-4 text-primary-700 border-b pb-2">Bank Account Details</legend>
                  
                  <div>
                    <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <select
                      id="bankName"
                      name="bankName"
                      className="input-field py-3 text-base bg-white dark:bg-brand-black"
                      required
                    >
                      <option value="" disabled selected>Select bank</option>
                      <option value="chase">Chase Bank</option>
                      <option value="boa">Bank of America</option>
                      <option value="wellsfargo">Wells Fargo</option>
                      <option value="citi">Citibank</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
                        Account Type
                      </label>
                      <select
                        id="accountType"
                        name="accountType"
                        className="input-field py-3 text-base bg-white dark:bg-brand-black"
                        required
                      >
                        <option value="" disabled selected>Select type</option>
                        <option value="checking">Checking</option>
                        <option value="savings">Savings</option>
                      </select>
                    </div>
                    
                    <Input
                      label="Routing Number"
                      id="routingNumber"
                      name="routingNumber"
                      type="text"
                      required
                      placeholder="9 digits"
                      pattern="[0-9]{9}"
                      className=' bg-white dark:bg-brand-black'
                    />
                  </div>
                  
                  <Input
                    label="Account Number"
                    id="accountNumber"
                    name="accountNumber"
                    type="text"
                    required
                    placeholder="Enter account number"
                    className=' bg-white dark:bg-brand-black'
                  />
                  
                  <Input
                    label="Confirm Account Number"
                    id="confirmAccountNumber"
                    name="confirmAccountNumber"
                    type="text"
                    required
                    placeholder="Re-enter account number"
                    className=' bg-white dark:bg-brand-black'
                  />
                </fieldset>
              </div>
            </div>
            
            <div className="pt-6 border-t">
              <div className="flex items-start mb-6">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="focus:ring-primary-500 h-5 w-5 text-primary-600 border-gray-300 rounded bg-white dark:bg-brand-black"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-gray-700 dark:text-white">
                    I confirm that these details are correct
                  </label>
                  <p className="text-gray-500">
                    I understand that providing incorrect details may result in failed transfers.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <Link href="/payment/result">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full sm:w-auto hover-lift bg-white dark:bg-brand-black text-brand-gray dark:text-white"
                  >
                    Back
                  </Button>
                </Link>
                
                <Link href="/confirmation">
                  <Button
                    type="button"
                    className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 hover-lift shadow-md"
                  >
                    Continue
                  </Button>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
} 