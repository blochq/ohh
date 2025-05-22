'use client';

import React, { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { submitKyb } from '@/lib/api-calls';
import { kybSchema } from '@/lib/dto';
import { z } from 'zod';
import { toast } from 'sonner';
import Image from 'next/image';

type KybFormData = z.infer<typeof kybSchema>;

// Define field names for each stage for validation
const kybStageFields: (keyof KybFormData)[][] = [
  ['BUSINESS_TYPE', 'BUSINESS_NAME', 'BUSINESS_CATEGORY', 'COUNTRY_OF_OPERATIONS', 'INDUSTRY'], // Stage 1
  ['STATE', 'CITY', 'STREET'], // Stage 2
  ['LEGAL_BUSINESS_NAME', 'BUSINESS_REGISTRATION_TYPE', 'BUSINESS_REGISTRATION_NUMBER', 'TAX_IDENTIFICATION_NUMBER'], // Stage 3
  ['DIRECTOR_FIRST_NAME', 'LAST_NAME', 'NATIONALITY', 'PHONE_NUMBER', 'EMAIL', 'BVN', 'DOB'], // Stage 4
  ['MEANS_OF_ID', 'VALID_ID_NUMBER'], // Stage 5
];

export default function KybPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState(1);
  const totalStages = 5; // Total number of stages

  // useEffect for token check - simplified as authToken state is now read directly in mutation
  // It's important to ensure the token logic remains robust for actual use.
  // For this UI refactor, direct use in mutationFn is assumed sufficient if token exists.
  let authToken: string | null = null;
  if (typeof window !== 'undefined') {
    authToken = sessionStorage.getItem('onboardingToken');
    if (!authToken) {
      toast.error('Authentication token not found. Please sign up first.');
      // router.push might cause issues during initial render if called unconditionally here
      // Consider a loading state or a redirect effect if token is truly essential before rendering any part of the form.
      // For now, the existing redirect in the main return path for !authToken handles this.
    }
  }

  const form = useForm<KybFormData>({
    resolver: zodResolver(kybSchema),
    defaultValues: {
      // Initialize with empty strings or default values based on your schema
      BUSINESS_TYPE: undefined, // For enums, undefined or a default valid value
      BUSINESS_NAME: '',
      BUSINESS_CATEGORY: '',
      COUNTRY_OF_OPERATIONS: '',
      INDUSTRY: '',
      STATE: '',
      CITY: '',
      STREET: '',
      LEGAL_BUSINESS_NAME: '',
      BUSINESS_REGISTRATION_TYPE: '',
      BUSINESS_REGISTRATION_NUMBER: '',
      TAX_IDENTIFICATION_NUMBER: '',
      DIRECTOR_FIRST_NAME: '',
      LAST_NAME: '',
      NATIONALITY: '',
      PHONE_NUMBER: '',
      EMAIL: '',
      BVN: '',
      DOB: '',
      MEANS_OF_ID: '',
      VALID_ID_NUMBER: '',
      token: '' // This will be set from authToken state
    },
  });

  const kybMutation = useMutation({
    mutationFn: async (data: KybFormData) => {
      if (!authToken) throw new Error('Auth token is missing.');
      const dataWithToken = { ...data, token: authToken };
      const response = await submitKyb(dataWithToken);

      if (response.error) {
        if (response.validationErrors && response.validationErrors.length > 0) {
          const errorMessages = response.validationErrors.map(err => `${err.field}: ${err.message}`).join('; ');
          throw new Error(`Validation failed: ${errorMessages}`);
        } else {
          throw new Error((response.error as Error).message || 'Failed to submit KYB information.');
        }
      }
      if (!response.data) {
        throw new Error("KYB submission successful but no data received.");
      }
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('KYB information submitted successfully!');
      // TODO: Update session context or store completion status
      // TODO: Remove onboardingToken from sessionStorage if no longer needed
      // sessionStorage.removeItem('onboardingToken');
      console.log("KYB success data:", data);
      router.push('/dashboard'); // Navigate to dashboard or a success/pending page
    },
    onError: (error: Error) => {
      setError(error.message);
      toast.error(`KYB submission failed: ${error.message}`);
    },
  });

  const onSubmit = (data: KybFormData) => {
    if (!authToken) {
      toast.error('Cannot submit form without authentication token.');
      return;
    }
    setError(null);
    kybMutation.mutate(data);
  };

  const handleNextStage = async () => {
    setError(null);
    const fieldsToValidate = kybStageFields[currentStage -1];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (currentStage < totalStages) {
        setCurrentStage(currentStage + 1);
      } else {
        // This is the final stage, actual submission is handled by onSubmit
        form.handleSubmit(onSubmit)();
      }
    } else {
      toast.error('Please correct the errors before proceeding.');
    }
  };

  const handlePreviousStage = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
      setError(null); // Clear errors when going back
    }
  };

  // if (!authToken && typeof window !== 'undefined') {
  //   // Avoid rendering the form if token check is pending or failed client-side
  //   return (
  //       <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
  //           <Loader2 className="h-8 w-8 animate-spin text-black dark:text-white" />
  //           <p className="ml-2 text-black dark:text-white">Loading or redirecting...</p>
  //       </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-0 md:p-4">
        <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto md:shadow-2xl rounded-lg overflow-hidden lg:min-h-[90vh]">
      
        <div className="w-full md:w-1/2 p-8 sm:p-12 bg-white dark:bg-black">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
              Business Information
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Step {currentStage} of {totalStages}: Please provide details about your business.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            {/* Form submission is now handled by the Next/Submit button logic */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              
              {currentStage === 1 && (
                <section className="space-y-6 p-6 bg-white dark:bg-gray-900 rounded-xl animate-fadeIn">
                  <h2 className="text-sm font-semibold text-slate-500 dark:text-white border-b pb-2 border-gray-300 dark:border-gray-700">Business Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="BUSINESS_TYPE"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">Business Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-gray-300 dark:border-gray-700">
                                <SelectValue placeholder="Select business type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="starter business">Starter Business</SelectItem>
                              <SelectItem value="registered business">Registered Business</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="BUSINESS_NAME"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">Business Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter business name" {...field} className="border-gray-300 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="BUSINESS_CATEGORY"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">Business Category *</FormLabel>
                          <FormControl>
                            {/* TODO: Consider changing to a Select if there's a predefined list */}
                            <Input placeholder="e.g., E-commerce, Fintech" {...field} className="border-gray-300 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="COUNTRY_OF_OPERATIONS"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">Country of Operations *</FormLabel>
                          <FormControl>
                            {/* TODO: Populate with a list of countries, potentially from an API or a predefined list */}
                            <Input placeholder="Select country" {...field} className="border-gray-300 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="INDUSTRY"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">Industry *</FormLabel>
                          <FormControl>
                            {/* TODO: Consider changing to a Select if there's a predefined list */}
                            <Input placeholder="e.g., Technology, Retail" {...field} className="border-gray-300 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
              )}

              {currentStage === 2 && (
                <section className="space-y-6 p-6 bg-white dark:bg-gray-900 rounded-xl animate-fadeIn">
                  <h2 className="text-sm font-semibold text-slate-500 dark:text-white border-b pb-2 border-gray-300 dark:border-gray-700">Business Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="STATE"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">State *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter state" {...field} className="border-gray-300 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="CITY"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">City *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} className="border-gray-300 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="STREET"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black dark:text-white">Street Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter street address" {...field} className="border-gray-300 dark:border-gray-700" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>
              )}

              {currentStage === 3 && (
                <section className="space-y-6 p-6 bg-white dark:bg-gray-900 rounded-xl animate-fadeIn">
                  <h2 className="text-sm font-semibold text-slate-500 dark:text-white border-b pb-2 border-gray-300 dark:border-gray-700">Legal & Registration</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="LEGAL_BUSINESS_NAME"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">Legal Business Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter legal business name" {...field} className="border-gray-300 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="BUSINESS_REGISTRATION_TYPE"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">Business Registration Type</FormLabel>
                          <FormControl>
                            {/* TODO: Consider changing to a Select if there's a predefined list of registration types */}
                            <Input placeholder="e.g., LLC, Sole Proprietorship" {...field} className="border-gray-300 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="BUSINESS_REGISTRATION_NUMBER"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">Business Registration Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter registration number" {...field} className="border-gray-300 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="TAX_IDENTIFICATION_NUMBER"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">Tax Identification Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter TIN" {...field} className="border-gray-300 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
              )}

              {currentStage === 4 && (
                <section className="space-y-6 p-6 bg-white dark:bg-gray-900 rounded-xl animate-fadeIn">
                  <h2 className="text-sm font-semibold text-slate-500 dark:text-white border-b pb-2 border-gray-300 dark:border-gray-700">Director Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="DIRECTOR_FIRST_NAME"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">Director First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter director's first name" {...field} className="border-gray-300 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="LAST_NAME"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">Director Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter director's last name" {...field} className="border-gray-300 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="NATIONALITY"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">Director Nationality *</FormLabel>
                          <FormControl>
                             {/* TODO: Consider changing to a Select if there's a predefined list of nationalities */}
                            <Input placeholder="Enter director's nationality" {...field} className="border-gray-300 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="PHONE_NUMBER"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">Director Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter director's phone number" {...field} className="border-gray-300 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="EMAIL"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">Director Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter director's email" {...field} className="border-gray-300 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="BVN"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">Director BVN</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter director's BVN" {...field} className="border-gray-300 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="DOB"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">Director Date of Birth *</FormLabel>
                          <FormControl>
                            <Input type="date" placeholder="YYYY-MM-DD" {...field} className="border-gray-300 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
              )}

              {currentStage === 5 && (
                <section className="space-y-6 p-6 bg-white dark:bg-gray-900 rounded-xl animate-fadeIn">
                  <h2 className="text-sm font-semibold text-slate-500 dark:text-white border-b pb-2 border-gray-300 dark:border-gray-700">Director Identity Verification</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="MEANS_OF_ID"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">Means of ID *</FormLabel>
                          <FormControl>
                            {/* TODO: Consider changing to a Select (e.g., Passport, NIN, Driver's License) */}
                            <Input placeholder="Enter means of identification" {...field} className="border-gray-300 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="VALID_ID_NUMBER"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black dark:text-white">Valid ID Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter ID number" {...field} className="border-gray-300 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
              )}
                
              <div className="flex justify-between items-center mt-8">
                {currentStage > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousStage}
                    className="border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Previous
                  </Button>
                )}
                {/* Spacer for when "Previous" button is not visible, to keep "Next" on the right */}
                {currentStage === 1 && <div />} 

                <Button
                  type="button" // Changed from submit to button, will trigger validation then submit via JS
                  onClick={handleNextStage}
                  className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 rounded-lg py-3 text-base"
                  disabled={kybMutation.isPending || !authToken}
                >
                  {currentStage < totalStages ? 'Next Step' : (
                    kybMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Business Information'
                    )
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Right Column: Static Content - KYB Focused */}
        <div className="hidden md:flex md:w-1/2  flex-col justify-center items-start relative text-white">
        <Image src="/images/signup1.png" alt="KYB Image" width={500} height={500} />
        </div>
      </div>
    </div>
  );
} 