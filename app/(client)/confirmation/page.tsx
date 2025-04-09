'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, Info, FileText } from 'lucide-react';
import { initiateTransferPayout, getSenderDetails } from '@/lib/api-calls';
import { transferPayoutSchema, getSenderDetailsSchema } from '@/lib/dto';
import { z } from 'zod';
import { toast } from 'sonner';
import { usePaymentContext } from '@/context/payment-context';
import { getAuthToken } from '@/lib/helper-function';
import { useSession } from '@/context/session-context';

// Helper component for displaying details
const DetailItem = ({ label, value, className }: { label: string, value?: string | number | null, className?: string }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className={`flex justify-between text-sm ${className}`}>
      <p className="text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-medium text-gray-900 dark:text-gray-100 text-right">{value}</p>
    </div>
  );
};

// Helper to format currency
const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
  } catch (e) {
    console.warn(`Failed to format currency ${currency}`, e);
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export default function ConfirmationPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const token = getAuthToken();
  const { 
    selectedBeneficiary, 
    conversionData, 
    sourceOfFunds, 
    purposeCode, 
    narration, 
    invoiceFile, 
    invoiceBase64,
    clearPaymentData,
    accountData
    
  } = usePaymentContext();
  const { userName } = useSession();

  // Fetch Sender Details for display
  const { data: senderDetails, isLoading: isLoadingSender, error: senderError } = useQuery({
    queryKey: ['senderDetails', token],
    queryFn: async () => {
        if (!token) throw new Error('Authentication required for sender details');
        const input: z.infer<typeof getSenderDetailsSchema> = { token };
        const response = await getSenderDetails(input);
        if (response.error) {
            const errorMessage = (response.error as Error).message || 'Failed to fetch sender details'; 
            throw new Error(errorMessage);
        }
        if (!response.data) {
            throw new Error('No sender data received');
        }
        return response.data;
    },
    enabled: !!token, 
    retry: 1,
  });


  useEffect(() => {
    if (!selectedBeneficiary || !conversionData || !sourceOfFunds || !purposeCode || !invoiceBase64) {
      toast.error("Missing required transfer details. Please start the process again.");
      router.push('/dashboard');
    }
  }, [selectedBeneficiary, conversionData, sourceOfFunds, purposeCode, invoiceBase64, router]);

  const transferMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('Authentication required');
      if (!selectedBeneficiary || !conversionData || !sourceOfFunds || !purposeCode || !invoiceBase64) {
        throw new Error('Missing required transfer details in context.');
      }
      
      const input = {
          currency: selectedBeneficiary.destination_currency || '',
          amount: conversionData.destinationAmount || 0,
          purpose_code: purposeCode,
          source_of_funds: sourceOfFunds,
          payout_reference: accountData?.reference || '',
          beneficiary_id: selectedBeneficiary._id || '',
          environment: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ? 'live' : 'test',
          invoice: invoiceBase64,
          token: token,
      };

      const validation = transferPayoutSchema.safeParse(input);
      if (!validation.success) {
          console.error("Final payload validation failed:", validation.error.flatten().fieldErrors);
          const errorFields = Object.keys(validation.error.flatten().fieldErrors).join(', ');
          throw new Error(`Transfer data validation failed. Please check: ${errorFields}`);
      }

      const response = await initiateTransferPayout(validation.data);
      if (response.error) {
           const apiError = response.error as Error;
           throw new Error(apiError.message || 'Failed to initiate transfer payout.');
      }
      if (!response.data) {
        throw new Error('No data received from transfer payout API.')
      }
      return response.data;
    },
    onSuccess: (data) => {
      const reference = data.data.provider_ref
      toast.success(`Transfer initiated successfully! Reference: ${reference}`);
      clearPaymentData();
      router.push(`/dashboard`);
    },
    onError: (error: Error) => {
      setError(error.message || 'An unexpected error occurred during transfer.');
      toast.error(`Transfer Failed: ${error.message}`);
    },
  });

  const handleConfirm = () => {
    setError(null);
    transferMutation.mutate();
  };

  const canConfirm = !transferMutation.isPending && 
                     !!selectedBeneficiary && 
                     !!conversionData && 
                     !!sourceOfFunds && 
                     !!purposeCode && 
                     !!invoiceBase64 &&
                     !isLoadingSender &&
                     !senderError;

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
     
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-gray-100 dark:bg-gray-900 opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute top-[50%] right-[20%] w-[30%] h-[30%] bg-gray-200 dark:bg-gray-800 opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[30%] w-[40%] h-[30%] bg-gray-100 dark:bg-gray-900 opacity-30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-4xl mx-auto p-4 space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">
            Confirm Your Transfer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Please review all transfer details carefully before confirming.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800">
          <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-black dark:text-white">Transfer Summary</h2>
          </div>

          <div className="p-6 space-y-6">
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Sender Details</h3>
              {isLoadingSender ? (
                <div className="flex items-center justify-center py-2">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-gray-500 dark:text-gray-400" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading sender details...</p>
                </div>
              ) : senderError ? (
                  <Alert variant="destructive" className="text-sm">
                      <Info className="h-4 w-4"/>
                      <AlertDescription>Could not load sender details. Error: {(senderError as Error).message}</AlertDescription>
                  </Alert>
              ) : senderDetails?.data ? (
                  <>
                      <DetailItem label="Name" value={userName || senderDetails.data.Name} />
                      <DetailItem label="Address" value={senderDetails.data.Address ? `${senderDetails.data.Address}${senderDetails.data.Postcode ? `, ${senderDetails.data.Postcode}` : ''} ${senderDetails.data.CountryCode ? `(${senderDetails.data.CountryCode})` : ''}` : null} />
                  </>
              ) : (
                   <p className="text-sm text-gray-500 dark:text-gray-400">Sender details unavailable.</p>
              )}
            </div>

            {selectedBeneficiary && (
              <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Recipient Details</h3>
                  <DetailItem label="Name" value={selectedBeneficiary.beneficiary_name} />
                  <DetailItem label="Account Number" value={selectedBeneficiary.beneficiary_account_number} />
                  <DetailItem label="Country" value={selectedBeneficiary.destination_country} />
              </div>
            )}

            {conversionData && (
                <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Amount Details</h3>
                    <DetailItem label="Amount Receiving" value={formatCurrency(conversionData.destinationAmount || 0, selectedBeneficiary?.destination_currency || 'USD')} />
                    {conversionData.sourceCurrency && conversionData.amount && conversionData.sourceCurrency !== selectedBeneficiary?.destination_currency && (
                        <DetailItem label="Amount Sent" value={formatCurrency(conversionData.amount, conversionData.sourceCurrency)} />
                    )}
                    {conversionData.rate && (
                         <DetailItem label="Exchange Rate" value={`1 ${conversionData.sourceCurrency} = ${conversionData.rate.toFixed(4)} ${selectedBeneficiary?.destination_currency}`} />
                    )}
                     {conversionData.fee && (
                         <DetailItem label="Transfer Fee" value={formatCurrency(conversionData.fee, conversionData.sourceCurrency || 'USD')} />
                    )}
                </div>
            )}

            <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Transfer Information</h3>
                <DetailItem label="Source of Funds" value={sourceOfFunds} />
                <DetailItem label="Purpose Code" value={purposeCode} />
                {narration && <DetailItem label="Narration" value={narration} className="text-wrap" />}
            </div>

            <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Supporting Document</h3>
                {invoiceFile ? (
                   <div className="flex items-center text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                       <FileText className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0"/>
                       <span className="text-gray-700 dark:text-gray-300 truncate" title={invoiceFile.name}>{invoiceFile.name}</span>
                   </div>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No invoice uploaded.</p>
                )}
             </div>

          </div>

          <div className="p-6 mt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-gray-200 dark:border-gray-800 rounded-xl"
              disabled={transferMutation.isPending}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 rounded-xl min-w-[150px]"
              disabled={!canConfirm}
            >
              {transferMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Transfer'
              )}
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border-l-4 border-t border-r border-b border-gray-200 dark:border-gray-800 border-l-red-600 dark:border-l-red-500 mt-8">
          <div className="p-6 pb-4">
            <h2 className="text-lg font-bold text-black dark:text-white flex items-center">
                <Info className="h-5 w-5 mr-2 text-red-600 dark:text-red-500"/> Important Information
            </h2>
          </div>
          <div className="p-6 pt-0">
            <p className="text-gray-600 dark:text-gray-400">
              Please ensure all information is correct before confirming. 
              Transfers are typically processed quickly and <span className="font-semibold">may not be cancellable</span> once confirmed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 