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
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, ArrowRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { getCollectionAccount } from '@/lib/api-calls';
import { collectionAccountSchema } from '@/lib/dto';
import { z } from 'zod';
import { getAuthToken } from '@/lib/helper-function';
import { usePaymentContext } from '@/context/payment-context';
import { ICollectionAccount } from '@/lib/models';



export default function CollectionAccountPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
 
  const {
    conversionData,
    accountData,
    setAccountData,
    updateActivity
  } = usePaymentContext();
  
  
  useEffect(() => {
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    
    const resetGeneralActivity = () => {
      updateActivity();
    };
    
    events.forEach(event => {
      window.addEventListener(event, resetGeneralActivity);
    });
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetGeneralActivity);
      });
    };
  }, [updateActivity]);
  


  useEffect(() => {
    if (!conversionData) {
      router.push('/payment');
      return;
    }
  }, [router, conversionData]);
  

  const { data, isLoading } = useQuery<ICollectionAccount>({
    queryKey: ['collectionAccount', conversionData?.amount],
    queryFn: async () => {
      if (!conversionData) {
        throw new Error('Conversion data not found');
      }
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      console.log("conversionData", conversionData);
      
      const input: z.infer<typeof collectionAccountSchema> = {
        amount: conversionData.amount || conversionData.sourceAmount,
        token
      };
      
      const response = await getCollectionAccount(input);
      console.log("response", response);
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data?.success) {
        throw new Error('Failed to get collection account');
      }
      
     
      const apiData = response.data;
      
      const accountData: ICollectionAccount = {
        accountName: apiData.data["account name"],
        accountNumber: apiData.data["account number"],
        bankName: apiData.data.bankName,
        reference: apiData.data.reference
      };
      
     
      setAccountData(accountData);
      
      return accountData;
    },
    enabled: !!conversionData && !!getAuthToken(),
    retry: 1,
    staleTime: 5 * 60 * 1000, 
  });
  
  useEffect(() => {
    if (!isLoading && !data && !accountData && !error) {
      setError('Failed to get collection account details');
    }
  }, [isLoading, data, accountData, error]);
  
  const handleContinue = () => {
    updateActivity();
    router.push('/payment/verify');
  };
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
    updateActivity();
  };
  

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black p-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 bg-clip-text text-transparent">
              Make Your Payment
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Generating payment details...
            </p>
          </div>
          
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>Please wait while we prepare your payment details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex justify-center py-12">
                <RefreshCw className="h-12 w-12 animate-spin text-gray-400" />
              </div>
              
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  

  const displayAccountData = accountData || data;
  
  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 bg-clip-text text-transparent">
            Make Your Payment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Transfer funds to the account details below
          </p>
        </div>
        
    
        
        <Card className=" shadow-xl hover:shadow-2xl transition-all duration-200 dark:bg-black">
          {displayAccountData && conversionData && (
            <div>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Payment Summary</CardTitle>
                    <CardDescription>Review your payment details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                        <p className="text-xl font-bold text-black dark:text-white">
                          {conversionData.destinationCurrency} {conversionData.destinationAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Exchange rate</p>
                        <p className="text-black dark:text-white">
                          1 {conversionData.destinationCurrency} = ₦ {conversionData.rate.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Fee</p>
                        <p className="text-black dark:text-white">
                          ₦ {conversionData.fee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total amount to send</p>
                        <p className="text-xl font-bold text-black dark:text-white">
                          ₦ {(conversionData.amount + conversionData.fee).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-lg text-black dark:text-white">Bank Transfer Details</h3>
                  
                  <div className="space-y-4 mt-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800">
                      <span className="text-gray-500 dark:text-gray-400">Bank Name</span>
                      <span className="font-medium text-black dark:text-white">{displayAccountData.bankName}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800">
                      <span className="text-gray-500 dark:text-gray-400">Account Number</span>
                      <div className="flex items-center">
                        <span className="font-medium text-black dark:text-white mr-2">{displayAccountData.accountNumber}</span>
                        <Button 
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(displayAccountData.accountNumber, 'Account number')}
                          className="h-8 w-8 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy account number</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800">
                      <span className="text-gray-500 dark:text-gray-400">Account Name</span>
                      <div className="flex items-center">
                        <span className="font-medium text-black dark:text-white mr-2">{displayAccountData.accountName}</span>
                        <Button 
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(displayAccountData.accountName, 'Account name')}
                          className="h-8 w-8 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy account name</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800">
                      <span className="text-gray-500 dark:text-gray-400">Reference</span>
                      <div className="flex items-center">
                        <span className="font-medium text-black dark:text-white mr-2">{displayAccountData.reference}</span>
                        <Button 
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(displayAccountData.reference, 'Reference')}
                          className="h-8 w-8 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy reference</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center pt-6">
                <Button
                  onClick={handleContinue}
                  className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100"
                >
                 I have made the payment, Continue to Verification
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </div>
          )}
        </Card>
        
        <Card className=" shadow-xl hover:shadow-2xl transition-all duration-200 dark:bg-black">
          <CardHeader>
            <CardTitle className="text-lg">Important</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Please include the exact reference when making your payment. Transfers typically take 1-2 business days to process.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 