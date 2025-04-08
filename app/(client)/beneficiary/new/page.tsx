'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { createBeneficiarySchema, getRequiredFieldsByCurrency, getSupportedCurrenciesSchema, getSupportedCountriesSchema } from '@/lib/dto';
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
import { ISupportedCountry, ISupportedCurrency, IBeneficiary } from '@/lib/models';
import { usePaymentContext } from '@/context/payment-context';

const FALLBACK_COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD' }
];

const formSchema = createBeneficiarySchema.omit({ token: true });

type BeneficiaryFormData = z.infer<typeof formSchema>;

export default function NewBeneficiaryPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const token = getAuthToken();
  const [supportedCountries, setSupportedCountries] = useState<ISupportedCountry[]>([]);
  const [supportedCurrencies, setSupportedCurrencies] = useState<ISupportedCurrency[]>([]);
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const { 
    selectedCurrency: contextCurrency, 
    destinationCountry: contextCountry, 
    setSelectedBeneficiary
  } = usePaymentContext();

  const cameFromPaymentFlow = !!contextCurrency;

  const form = useForm<BeneficiaryFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: contextCurrency || 'NGN',
      destination_country: contextCountry || '',
      beneficiary_name: '',
      beneficiary_address: '',
      beneficiary_city: '',
      beneficiary_account_type: '',
      beneficiary_state: '',
      beneficiary_postcode: '',
      beneficiary_account_number: '',
      destination_currency: contextCurrency || 'NGN',
      payout_method: 'Wallet',
      routing_code_type1: '',
      routing_code_value1: '',
      beneficiary_country_code: '',
      beneficiary_bank_account_type: '',
      beneficiary_bank_code: '',
      beneficiary_email: '',
      beneficiary_contact_number: '',
      routing_code_type2: '',
      routing_code_value2: '',
    },
  });

  const isFieldRequired = (fieldName: keyof BeneficiaryFormData): boolean => {
    return requiredFields.includes(fieldName);
  };

  useEffect(() => {
    const currency = form.watch('currency');
    if (currency) {
      form.setValue('destination_currency', currency);
      const fields = getRequiredFieldsByCurrency(currency);
      setRequiredFields(fields);
    } else {
      setRequiredFields([]);
    }
  }, [form.watch('currency'), form.setValue]);

  useEffect(() => {
    const initialCurrency = form.getValues('currency');
    if (initialCurrency) {
      const fields = getRequiredFieldsByCurrency(initialCurrency);
      setRequiredFields(fields);
    }
  }, []);

  const createBeneficiaryMutation = useMutation({
    mutationFn: async (data: BeneficiaryFormData) => {
      if (!token) {
        throw new Error('Authentication required');
      }
      const input = { ...data, token };
      const response = await createBeneficiary(input);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      if (response.validationErrors && response.validationErrors.length > 0) {
        throw new Error(response.validationErrors[0].message);
      }
      if (!response.data?.data) {
        throw new Error('Beneficiary data not found in response');
      }
      return response.data.data as IBeneficiary;
    },
    onSuccess: (createdBeneficiary) => {
      if (cameFromPaymentFlow) {
        toast.success('Beneficiary created, proceeding to confirmation.');
        setSelectedBeneficiary(createdBeneficiary);
        router.push('/recipient');
      } else {
        toast.success('Beneficiary created successfully');
        router.push('/beneficiary');
      }
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
      const transformedCountries = Object.entries(countriesData.data)
        .filter(([key]) => key.endsWith('_code'))
        .map(([key, code]) => {
          const countryName = key.replace('_code', '');
          const currency = countriesData.data[countryName];
          return {
            code: code as string,
            name: countryName,
            currency: currency as string
          };
        })
        .filter(country => country.code && country.name && country.currency);
      
      setSupportedCountries(transformedCountries);
    } else if (countriesError) {
      setSupportedCountries(FALLBACK_COUNTRIES);
      toast.warning('Using fallback country list');
    }
  }, [currenciesData, countriesData, countriesError]);

  const onSubmit = (data: BeneficiaryFormData) => {
    createBeneficiaryMutation.mutate(data);
  };

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
            Add New Beneficiary
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Enter the details of your beneficiary. Required fields are marked with *
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800">
          <div className="p-6 pb-4">
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
                <h2 className="text-2xl font-bold text-black dark:text-white">Beneficiary Details</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Fill in the information below to add a new beneficiary
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black dark:text-white">Currency *</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                            }} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="border-gray-200 dark:border-gray-800">
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

                  <FormField
                    control={form.control}
                    name="beneficiary_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black dark:text-white">
                          Beneficiary Name {isFieldRequired('beneficiary_name') && '*'} 
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} className="border-gray-200 dark:border-gray-800 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300" />
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
                        <FormLabel className="text-black dark:text-white">
                          Destination Country {isFieldRequired('destination_country') && '*'} 
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-gray-200 dark:border-gray-800">
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
                    name="beneficiary_country_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black dark:text-white">
                          Country Code {isFieldRequired('beneficiary_country_code') && '*'} 
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter country code" {...field} className="border-gray-200 dark:border-gray-800 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300" />
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
                        <FormLabel className="text-black dark:text-white">
                          Address {isFieldRequired('beneficiary_address') && '*'} 
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter address" {...field} className="border-gray-200 dark:border-gray-800 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300" />
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
                        <FormLabel className="text-black dark:text-white">
                          City {isFieldRequired('beneficiary_city') && '*'} 
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} className="border-gray-200 dark:border-gray-800 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300" />
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
                        <FormLabel className="text-black dark:text-white">
                          State {isFieldRequired('beneficiary_state') && '*'} 
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter state" {...field} className="border-gray-200 dark:border-gray-800 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300" />
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
                        <FormLabel className="text-black dark:text-white">
                          Postcode {isFieldRequired('beneficiary_postcode') && '*'} 
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter postcode" {...field} className="border-gray-200 dark:border-gray-800 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300" />
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
                        <FormLabel className="text-black dark:text-white">
                          Account Number {isFieldRequired('beneficiary_account_number') && '*'} 
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter account number" {...field} className="border-gray-200 dark:border-gray-800 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="beneficiary_account_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black dark:text-white">
                          Account Type {isFieldRequired('beneficiary_account_type') && '*'} 
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-gray-200 dark:border-gray-800">
                                <SelectValue placeholder="Select account type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="personal">Personal</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="beneficiary_bank_account_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black dark:text-white">
                          Bank Account Type {isFieldRequired('beneficiary_bank_account_type') && '*'} 
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-gray-200 dark:border-gray-800">
                                <SelectValue placeholder="Select bank account type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="savings">Savings</SelectItem>
                              <SelectItem value="checking">Checking</SelectItem>
                              <SelectItem value="current">Current</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="beneficiary_bank_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black dark:text-white">
                          Bank Code {isFieldRequired('beneficiary_bank_code') && '*'} 
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter bank code" {...field} className="border-gray-200 dark:border-gray-800 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="beneficiary_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black dark:text-white">
                          Email {isFieldRequired('beneficiary_email') && '*'} 
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email" type="email" {...field} className="border-gray-200 dark:border-gray-800 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="beneficiary_contact_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black dark:text-white">
                          Contact Number {isFieldRequired('beneficiary_contact_number') && '*'} 
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact number" {...field} className="border-gray-200 dark:border-gray-800 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300" />
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
                        <FormLabel className="text-black dark:text-white">
                          Destination Currency {isFieldRequired('destination_currency') && '*'} 
                        </FormLabel>
                        <FormControl>
                          <Input 
                            readOnly
                            className="border-gray-200 dark:border-gray-800 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300 bg-gray-50 dark:bg-gray-800"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payout_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black dark:text-white">
                          Payout Method {isFieldRequired('payout_method') && '*'} 
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-gray-200 dark:border-gray-800">
                                <SelectValue placeholder="Select payout method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Wallet">Wallet</SelectItem>
                              <SelectItem value="BankTransfer">Bank Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="routing_code_type1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black dark:text-white">
                          Routing Code Type {isFieldRequired('routing_code_type1') && '*'} 
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-gray-200 dark:border-gray-800">
                                <SelectValue placeholder="Select routing code type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="aba">ABA (US)</SelectItem>
                              <SelectItem value="sort_code">Sort Code (UK)</SelectItem>
                              <SelectItem value="bic_swift">BIC/SWIFT</SelectItem>
                              <SelectItem value="ifsc">IFSC (India)</SelectItem>
                              <SelectItem value="bsb">BSB (Australia)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="routing_code_value1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black dark:text-white">
                          Routing Code Value {isFieldRequired('routing_code_value1') && '*'} 
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter routing code" {...field} className="border-gray-200 dark:border-gray-800 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="routing_code_type2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black dark:text-white">
                          Secondary Routing Code Type {isFieldRequired('routing_code_type2') && '*'} 
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-gray-200 dark:border-gray-800">
                                <SelectValue placeholder="Select routing code type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="branch_code">Branch Code</SelectItem>
                              <SelectItem value="transit_number">Transit Number</SelectItem>
                              <SelectItem value="bank_code">Bank Code</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="routing_code_value2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black dark:text-white">
                          Secondary Routing Code Value {isFieldRequired('routing_code_value2') && '*'} 
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter routing code" {...field} className="border-gray-200 dark:border-gray-800 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300" />
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
                    className="border-gray-200 dark:border-gray-800 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 rounded-xl"
                    disabled={createBeneficiaryMutation.isPending}
                  >
                    {createBeneficiaryMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {cameFromPaymentFlow ? 'Saving...' : 'Creating...'}
                      </>
                    ) : (
                      cameFromPaymentFlow ? 'Save & Continue' : 'Create Beneficiary'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border-l-4 border-t border-r border-b border-gray-200 dark:border-gray-800 border-l-gray-900 dark:border-l-white">
          <div className="p-6 pb-4">
            <h2 className="text-lg font-bold text-black dark:text-white">Important Information</h2>
          </div>
          <div className="p-6 pt-0">
            <p className="text-gray-600 dark:text-gray-400">
              Please ensure all information is accurate before submitting. 
              Different currencies require different information for transfers.
              Fields marked with * are required for the selected currency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 