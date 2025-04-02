'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { Loader2 } from 'lucide-react';
import { initiateTransferPayout, getSourceOfFunds, getPurposeCodes } from '@/lib/api-calls';
import { transferPayoutSchema, getSourceOfFundsSchema, getPurposeCodesSchema } from '@/lib/dto';
import { z } from 'zod';
import { toast } from 'sonner';
import { usePaymentContext } from '@/context/payment-context';
import { getAuthToken } from '@/lib/helper-function';

const formSchema = transferPayoutSchema.omit({ token: true });

export default function ConfirmationPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
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
    },
  });

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
    <div className="min-h-screen bg-white dark:bg-black p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 bg-clip-text text-transparent">
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

        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
            <CardDescription>
              Please review and confirm your transfer information
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Beneficiary</h3>
                  <p className="mt-1 text-lg font-medium">{selectedBeneficiary.beneficiary_name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedBeneficiary.beneficiary_account_number}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</h3>
                  <p className="mt-1 text-lg font-medium">
                    {conversionData?.destinationAmount.toLocaleString()} {selectedBeneficiary.destination_currency}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Exchange Rate: {exchangeRateData?.data.amount}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Destination</h3>
                  <p className="mt-1 text-lg font-medium">{selectedBeneficiary.destination_country}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedBeneficiary.beneficiary_city}, {selectedBeneficiary.beneficiary_state}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Time</h3>
                  <p className="mt-1 text-lg font-medium">1-2 Business Days</p>
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
                          <FormLabel>Source of Funds</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
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
                          <FormLabel>Purpose of Transfer</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
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

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="border-gray-200 dark:border-gray-800"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100"
                      disabled={transferMutation.isPending}
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
          </CardContent>
        </Card>

        <Card className="border-l-4 border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg">Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Please ensure all information is correct before confirming your transfer. 
              Once confirmed, the transfer cannot be cancelled.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 