'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft } from 'lucide-react';
import { createBeneficiary, getSupportedCurrencies, getSupportedCountries } from '@/lib/api-calls';
import { createBeneficiarySchema, getSupportedCurrenciesSchema, getSupportedCountriesSchema } from '@/lib/dto';
import { z } from 'zod';
import { toast } from 'sonner';
import { getAuthToken } from '@/lib/helper-function';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ISupportedCountry, ISupportedCurrency } from '@/lib/models';

const FALLBACK_COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD' }
];

const formSchema = createBeneficiarySchema.omit({ token: true });

export default function NewBeneficiaryPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const token = getAuthToken();
  const [supportedCountries, setSupportedCountries] = useState<ISupportedCountry[]>([]);
  const [supportedCurrencies, setSupportedCurrencies] = useState<ISupportedCurrency[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: 'NGN',
      destination_country: '',
      beneficiary_name: '',
      beneficiary_address: '',
      beneficiary_city: '',
      beneficiary_account_type: '',
      beneficiary_state: '',
      beneficiary_postcode: '',
      beneficiary_account_number: '',
      destination_currency: '',
      payout_method: 'Wallet',
      routing_code_type1: '',
      routing_code_value1: '',
    },
  });

  const createBeneficiaryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (!token) {
        throw new Error('Authentication required');
      }

      const input = {
        ...data,
        token,
      };

      const response = await createBeneficiary(input);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.validationErrors && response.validationErrors.length > 0) {
        throw new Error(response.validationErrors[0].message);
      }
      
      return response.data;
    },
    onSuccess: () => {
      toast.success('Beneficiary created successfully');
      router.push('/beneficiary');
    },
    onError: (error: Error) => {
      setError(error.message);
      toast.error('Failed to create beneficiary');
    },
  });

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

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createBeneficiaryMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 bg-clip-text text-transparent">
            Add New Beneficiary
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Enter the details of your beneficiary
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>Beneficiary Details</CardTitle>
                <CardDescription>
                  Fill in the information below to add a new beneficiary
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="beneficiary_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Beneficiary Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="destination_country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination Country</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {supportedCountries.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                  {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="beneficiary_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="beneficiary_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="beneficiary_state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="beneficiary_postcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postcode</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter postcode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="beneficiary_account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter account number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="destination_currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination Currency</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {supportedCurrencies.map((currency) => (
                                <SelectItem key={currency._id} value={currency.currency}>
                                  {currency.currency}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
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
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100"
                    disabled={createBeneficiaryMutation.isPending}
                  >
                    {createBeneficiaryMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Beneficiary'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg">Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Please ensure all information is accurate before submitting. 
              The beneficiary&apos;s details will be used for future transfers.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 