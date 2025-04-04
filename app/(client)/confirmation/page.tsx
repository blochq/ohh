'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, Upload, X, FileText } from 'lucide-react';
import { initiateTransferPayout, getSourceOfFunds, getPurposeCodes } from '@/lib/api-calls';
import { transferPayoutSchema, getSourceOfFundsSchema, getPurposeCodesSchema } from '@/lib/dto';
import { z } from 'zod';
import { toast } from 'sonner';
import { usePaymentContext } from '@/context/payment-context';
import { getAuthToken } from '@/lib/helper-function';
import { Input } from "@/components/ui/input";

const formSchema = transferPayoutSchema.omit({ token: true });

export default function ConfirmationPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceBase64, setInvoiceBase64] = useState<string | null>(null);
  const [isEncoding, setIsEncoding] = useState<boolean>(false);
  const token = getAuthToken();
  const { selectedBeneficiary, exchangeRateData, conversionData } = usePaymentContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: selectedBeneficiary?.destination_currency || '',
      amount: conversionData?.destinationAmount || 0,
      purpose_code: '',
      source_of_funds: '',
      beneficiary_id: selectedBeneficiary?._id || '',
      environment: 'test',
      invoice: '',
    },
  });

  // Function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Get only the base64 part (remove the data:application/pdf;base64, prefix)
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  // Handle invoice file upload
  const handleInvoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return;
      }
      
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        toast.error('Only PDF, JPEG, and PNG files are supported');
        return;
      }
      
      setInvoiceFile(file);
      setIsEncoding(true);
      
      try {
        const base64 = await fileToBase64(file);
        setInvoiceBase64(base64);
        form.setValue('invoice', base64);
        toast.success('Invoice uploaded successfully');
      } catch (error) {
        toast.error('Failed to upload invoice');
        console.error(error);
      } finally {
        setIsEncoding(false);
      }
    }
  };

  // Clear uploaded invoice
  const clearInvoice = () => {
    setInvoiceFile(null);
    setInvoiceBase64(null);
    form.setValue('invoice', '');
  };

  const { data: sourceOfFundsData } = useQuery({
    queryKey: ['sourceOfFunds'],
    queryFn: async () => {
      if (!token) throw new Error('Authentication required');
      const input: z.infer<typeof getSourceOfFundsSchema> = { token };
      const response = await getSourceOfFunds(input);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    enabled: !!token,
  });

  const { data: purposeCodesData } = useQuery({
    queryKey: ['purposeCodes'],
    queryFn: async () => {
      if (!token) throw new Error('Authentication required');
      const input: z.infer<typeof getPurposeCodesSchema> = { token };
      const response = await getPurposeCodes(input);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    enabled: !!token,
  });

  const transferMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (!token) throw new Error('Authentication required');
      if (!data.invoice) throw new Error('Invoice is required');
      
      const input = { ...data, token };
      const response = await initiateTransferPayout(input);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Transfer initiated successfully');
      router.push('/transactions');
    },
    onError: (error: Error) => {
      setError(error.message);
      toast.error('Failed to initiate transfer');
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!invoiceBase64) {
      toast.error('Please upload an invoice');
      return;
    }
    transferMutation.mutate(data);
  };

  if (!selectedBeneficiary) {
    return (
      <div className="min-h-screen bg-white dark:bg-black p-4">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>No beneficiary selected. Please go back and select a beneficiary.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-gray-100 dark:bg-gray-900 opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute top-[50%] right-[20%] w-[30%] h-[30%] bg-gray-200 dark:bg-gray-800 opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[30%] w-[40%] h-[30%] bg-gray-100 dark:bg-gray-900 opacity-30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-4xl mx-auto p-4 space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">
            Confirm Transfer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Review your transfer details before proceeding
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800">
          <div className="p-6 pb-4">
            <h2 className="text-2xl font-bold text-black dark:text-white">Transfer Details</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please review and confirm your transfer information
            </p>
          </div>

          <div className="p-6 pt-0">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Beneficiary</h3>
                  <p className="mt-1 text-lg font-medium text-black dark:text-white">{selectedBeneficiary.beneficiary_name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedBeneficiary.beneficiary_account_number}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</h3>
                  <p className="mt-1 text-lg font-medium text-black dark:text-white">
                    {conversionData?.destinationAmount.toLocaleString()} {selectedBeneficiary.destination_currency}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Exchange Rate: {exchangeRateData?.data.amount}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Destination</h3>
                  <p className="mt-1 text-lg font-medium text-black dark:text-white">{selectedBeneficiary.destination_country}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedBeneficiary.beneficiary_city}, {selectedBeneficiary.beneficiary_state}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Time</h3>
                  <p className="mt-1 text-lg font-medium text-black dark:text-white">1-2 Business Days</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Estimated delivery time</p>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="source_of_funds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">Source of Funds</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-gray-200 dark:border-gray-800">
                                <SelectValue placeholder="Select source of funds" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sourceOfFundsData?.data.map((source) => (
                                <SelectItem key={source} value={source}>
                                  {source}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="purpose_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">Purpose of Transfer</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-gray-200 dark:border-gray-800">
                                <SelectValue placeholder="Select purpose" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {purposeCodesData?.data && Object.entries(purposeCodesData.data).map(([code, description]) => (
                                <SelectItem key={code} value={code}>
                                  {description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Invoice Upload */}
                  <FormField
                    control={form.control}
                    name="invoice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black dark:text-white">Upload Invoice</FormLabel>
                        <FormDescription>
                          Please upload an invoice or supporting document (PDF, JPEG, PNG, max 5MB)
                        </FormDescription>
                        <FormControl>
                          <div className="space-y-4">
                            {!invoiceFile ? (
                              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6 text-center">
                                <div className="space-y-3">
                                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Drag and drop or click to upload
                                  </p>
                                  <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    id="invoiceUpload"
                                    {...field}
                                    onChange={handleInvoiceUpload}
                                    value=""
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('invoiceUpload')?.click()}
                                  >
                                    {isEncoding ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                      </>
                                    ) : (
                                      'Upload Invoice'
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 flex items-center justify-between">
                                <div className="flex items-center">
                                  <FileText className="h-6 w-6 text-gray-500 mr-3" />
                                  <div>
                                    <p className="text-sm font-medium text-black dark:text-white">
                                      {invoiceFile.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {(invoiceFile.size / 1024).toFixed(1)} KB
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={clearInvoice}
                                  className="text-gray-500 hover:text-red-500"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="border-gray-200 dark:border-gray-800 rounded-xl"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 rounded-xl"
                      disabled={transferMutation.isPending || isEncoding || !invoiceBase64}
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
                </form>
              </Form>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border-l-4 border-t border-r border-b border-gray-200 dark:border-gray-800 border-l-gray-900 dark:border-l-white">
          <div className="p-6 pb-4">
            <h2 className="text-lg font-bold text-black dark:text-white">Important Information</h2>
          </div>
          <div className="p-6 pt-0">
            <p className="text-gray-600 dark:text-gray-400">
              Please ensure all information is correct before confirming your transfer. 
              Once confirmed, the transfer cannot be cancelled. An invoice or supporting document is required for regulatory compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 