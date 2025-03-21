'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePaymentContext } from '@/context/payment-context';
import { useMutation } from '@tanstack/react-query';
import { verifyPayment } from '@/lib/api-calls';
import { verifyPaymentSchema } from '@/lib/dto';
import { z } from 'zod';
import { getAuthToken } from '@/lib/helper-function';



export default function VerifyPaymentPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  

  const {
    accountData,
    conversionData,
    verificationData,
    setVerificationData,
    updateActivity
  } = usePaymentContext();
  
  useEffect(() => {
    if (!accountData || !conversionData) {
      router.push('/payment');
      return;
    }
  }, [router, accountData, conversionData]);
  

  const verifyPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!accountData || !conversionData) {
        throw new Error('Missing account or conversion data');
      }
      
      updateActivity();
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const input: z.infer<typeof verifyPaymentSchema> = {
        reference: accountData.reference,
        amount: conversionData.amount,
        token
      };
      
   
      
      const response = await verifyPayment(input);
      

      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data?.success || response.validationErrors && response.validationErrors?.length > 0) {
        throw new Error(response.validationErrors?.[0]?.message || 'Invalid response format from the server');
      }
      
      if (!response.data) {
        throw new Error('Invalid response format from the server');
      }
      
 
      
      return response.data;
    },
    onSuccess: (data) => {
  
      setVerificationData(data);
      
      if (data.success) {
        toast.success('Payment verified successfully');
        router.push('/recipient');
      } else {
        toast.error('Payment not verified');
        setError('Payment not verified yet. Please make sure you have completed the transfer and try again.');
      }
    },
    onError: (error: Error) => {
      console.error('Error verifying payment:', error);
      
     
      let errorMessage = 'Failed to verify payment. Please try again.';
      
      if (error.message.includes('404')) {
        errorMessage = 'The payment verification service is currently unavailable. Please try again later.';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'There was an issue with the server response. Please contact support.';
      } else {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    }
  });
  
  const handleVerifyPayment = () => {
    verifyPaymentMutation.mutate();
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 bg-clip-text text-transparent">
            Verify Your Payment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Confirm that you&apos;ve completed the bank transfer
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>
              Check the status of your payment
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {verificationData ? (
              <div className="flex flex-col items-center justify-center p-6">
                {verificationData.success ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
                    </div>
                    <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Payment Verified!</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your payment of {conversionData?.amount} {conversionData?.sourceCurrency} has been verified.
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Payment Not Verified</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      We haven&apos;t received your payment yet. Please make sure you&apos;ve completed the transfer.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-6">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Click the button below to verify your payment once you&apos;ve completed the bank transfer.
                </p>
                <Button
                  onClick={handleVerifyPayment}
                  disabled={verifyPaymentMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {verifyPaymentMutation.isPending ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </span>
                  ) : 'Verify Payment'}
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
              It may take a few minutes for your payment to be verified after you&apos;ve completed the transfer.
            </p>
            
            {verificationData?.success && (
              <Button
                onClick={() => {
                  updateActivity();
                  router.push('/recipient');
                }}
                className="w-full md:w-auto mx-auto"
              >
                Continue to Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <Card className="border-l-4 border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg">Important</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Please ensure you&apos;ve made the payment to the correct account. If you encounter any issues with verification, please contact our support team.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 