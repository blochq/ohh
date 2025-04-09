'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { usePaymentContext } from '@/context/payment-context';
import { ArrowRight, ArrowLeft, Upload, FileText, X, RotateCw, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getSourceOfFunds, getPurposeCodes, getSenderDetails } from '@/lib/api-calls';
import { getAuthToken } from '@/lib/helper-function';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSourceOfFundsSchema, getPurposeCodesSchema, RecipientFormData, getSenderDetailsSchema } from '@/lib/dto';
import { useSession } from '@/context/session-context';

// Helper component for displaying sender details
const DetailItem = ({ label, value }: { label: string, value?: string | null }) => {
  return (
    <div className="flex justify-between text-sm">
      <p className="text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-medium text-gray-900 dark:text-gray-100 text-right">{value}</p>
    </div>
  );
};

// Helper function to format date (e.g., YYYY-MM-DD)
const formatDate = (dateString?: string | null): string | null => {
  if (!dateString) return null;

  // Explicitly check for the Go time.Date zero value string representation
  if (dateString.startsWith('time.Date(1, time.January, 1')) {
    return 'N/A'; // Or null, or however you want to represent an unset/zero date
  }

  try {
    const date = new Date(dateString);
    // Check if the date is valid after trying standard parsing
    if (isNaN(date.getTime())) {
        console.warn("Invalid or unparseable date string for DOB:", dateString);
        // Handle other potential zero/invalid values if necessary
        if (dateString.startsWith('0001-01-01')) { // Check for ISO zero time too
             return 'N/A'; 
        }
        return dateString; // Return original string if parsing fails
    }
    // Format to YYYY-MM-DD
    const year = date.getFullYear();
    if (year < 1900) return 'N/A'; // Handle very old/invalid years

    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return dateString; // Fallback to original string on unexpected error
  }
};

export default function RecipientPage() {
  const router = useRouter();
  const {
    updateActivity,
    conversionData,
    setSourceOfFunds,
    setPurposeCode,
    setInvoiceBase64,
    setInvoiceFile,
    sourceOfFunds: contextSourceOfFunds,
    purposeCode: contextPurposeCode,
    invoiceFile: contextInvoiceFile,
    selectedBeneficiary,
    setNarration,
  } = usePaymentContext();

  const { userName } = useSession();

  const [isEncoding, setIsEncoding] = useState<boolean>(false);
  const [localInvoiceFile, setLocalInvoiceFile] = useState<File | null>(contextInvoiceFile);

  const token = getAuthToken();

  const { data: sourceOfFundsData } = useQuery({
    queryKey: ['sourceOfFunds', token],
    queryFn: async () => {
      if (!token) throw new Error('Authentication required');
      const input: z.infer<typeof getSourceOfFundsSchema> = { token };
      const response = await getSourceOfFunds(input);
      if (response.error) throw new Error(response.error.message || 'Failed to fetch source of funds');
      return response.data;
    },
    enabled: !!token,
  });

  const { data: purposeCodesData } = useQuery({
    queryKey: ['purposeCodes', token],
    queryFn: async () => {
      if (!token) throw new Error('Authentication required');
      const input: z.infer<typeof getPurposeCodesSchema> = { token };
      const response = await getPurposeCodes(input);
      if (response.error) throw new Error(response.error.message || 'Failed to fetch purpose codes');
      return response.data;
    },
    enabled: !!token,
  });

  const { data: senderDetails, isLoading: isLoadingSender, error: senderError } = useQuery({
    queryKey: ['senderDetails', token],
    queryFn: async () => {
        if (!token) throw new Error('Authentication required');
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

  const form = useForm<RecipientFormData>({
    resolver: zodResolver(RecipientFormData),
    defaultValues: {
      narration: "",
      source_of_funds: contextSourceOfFunds || "",
      purpose_code: contextPurposeCode || "",
      invoice: contextInvoiceFile ? 'uploaded' : '',
    },
  });
  
  useEffect(() => {
    if (!selectedBeneficiary || !conversionData) {
      toast.error("Missing beneficiary or conversion details. Please start again.");
      router.push('/payment');
    }
  }, [selectedBeneficiary, conversionData, router]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64 string'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

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
      setLocalInvoiceFile(file);
      setInvoiceFile(file);
      setIsEncoding(true);
      try {
        const base64 = await fileToBase64(file);
        setInvoiceBase64(base64);
        form.setValue('invoice', base64, { shouldValidate: true });
        toast.success('Invoice uploaded successfully');
      } catch (error) {
        toast.error('Failed to process invoice file');
        setLocalInvoiceFile(null);
        setInvoiceFile(null);
        setInvoiceBase64(null);
        form.setValue('invoice', '', { shouldValidate: true });
        console.error("Invoice processing error:", error);
      } finally {
        setIsEncoding(false);
      }
    }
  };

  const clearInvoice = () => {
    setLocalInvoiceFile(null);
    setInvoiceFile(null);
    setInvoiceBase64(null);
    form.setValue('invoice', '', { shouldValidate: true });
    const fileInput = document.getElementById('invoiceUploadRecipient') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const onSubmit = (data: RecipientFormData) => {
    if (isLoadingSender || senderError || !senderDetails?.data) {
        toast.error("Sender details are not loaded or contain errors. Cannot proceed.");
      return;
    }

    if (!localInvoiceFile || !form.getValues('invoice')) {
      toast.error("Please upload an invoice before proceeding.");
      form.trigger('invoice');
      return;
    }

    setSourceOfFunds(data.source_of_funds);
    setPurposeCode(data.purpose_code);
    setNarration(data.narration || null);
    
    updateActivity();
    router.push('/confirmation');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-gray-100 dark:bg-gray-900 opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute top-[50%] right-[20%] w-[30%] h-[30%] bg-gray-200 dark:bg-gray-800 opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[30%] w-[40%] h-[30%] bg-gray-100 dark:bg-gray-900 opacity-30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">
            Confirm Sender Details & Transfer Info
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Review your details and provide the required transfer information.
          </p>
        </div>

        <Card className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-800">
                 <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <CardTitle className="text-2xl font-bold text-black dark:text-white">Your Details & Transfer Info</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">Confirm your information and provide transfer details.</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-8">
                <section>
                  <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Sender Information</h3>
                  <div className="space-y-2 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                    {isLoadingSender ? (
                      <div className="flex items-center justify-center py-4">
                         <RotateCw className="mr-2 h-4 w-4 animate-spin text-gray-500 dark:text-gray-400" />
                         <p className="text-sm text-gray-500 dark:text-gray-400">Loading your details...</p>
                      </div>
                    ) : senderError ? (
                      <Alert variant="destructive">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Could not load your details. Error: {(senderError as Error).message}
                        </AlertDescription>
                      </Alert>
                    ) : senderDetails?.data ? (
                       <> 
                        <DetailItem label="Name" value={userName || senderDetails.data.Name} />
                        <DetailItem label="Address" value={senderDetails.data.Address ? `${senderDetails.data.Address}${senderDetails.data.Postcode ? `, ${senderDetails.data.Postcode}` : ''} ${senderDetails.data.CountryCode ? `(${senderDetails.data.CountryCode})` : ''}` : null} />
                        <DetailItem label="Contact Number" value={senderDetails.data.ContactNumber} />
                        <DetailItem label="Nationality" value={senderDetails.data.Nationality} />
                        <DetailItem label="Date of Birth" value={formatDate(senderDetails.data.Dob)} />
                        <DetailItem label="Account Type" value={senderDetails.data.AccountType} />
                        <DetailItem 
                          label={`ID Type`}
                          value={senderDetails.data.IdentificationType}
                         />
                        <DetailItem 
                          label={`ID Number`}
                          value={senderDetails.data.IdentificationNumber}
                         />
                      </>
                    ) : (
                      <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">Sender details not found.</p>
                    )}
                  </div>
                </section>
                
                <section className="border-t border-gray-200 dark:border-gray-800 pt-8">
                   <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Transfer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="source_of_funds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-black dark:text-white">Source of Funds</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!sourceOfFundsData?.data}>
                              <FormControl>
                                <SelectTrigger className="border-gray-200 dark:border-gray-800">
                                  <SelectValue placeholder="Select source of funds" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {sourceOfFundsData?.data 
                                  ? sourceOfFundsData.data
                                      .filter(source => source !== '')
                                      .map((source) => (
                                  <SelectItem key={source} value={source}>
                                    {source}
                                  </SelectItem>
                                      ))
                                  : <div className="p-2 text-sm text-gray-500 dark:text-gray-400">Loading sources...</div>
                                }
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
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!purposeCodesData?.data}>
                              <FormControl>
                                <SelectTrigger className="border-gray-200 dark:border-gray-800">
                                  <SelectValue placeholder="Select purpose" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {purposeCodesData?.data 
                                  ? Object.entries(purposeCodesData.data)
                                      .filter(([code]) => code !== '')
                                      .map(([code, description]) => (
                                  <SelectItem key={code} value={code}>
                                          {description} ({code})
                                  </SelectItem>
                                      ))
                                  : <div className="p-2 text-sm text-gray-500 dark:text-gray-400">Loading purposes...</div>
                                }
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="narration"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2"> 
                            <FormLabel className="text-black dark:text-white">Narration (Optional)</FormLabel>
                            <FormControl> 
                              <Input
                                type="text"
                                placeholder="Add a note for the recipient or your records"
                                {...field}
                                className="border-gray-200 dark:border-gray-800"
                              />
                            </FormControl>
                             <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                </section>
                
                <section className="border-t border-gray-200 dark:border-gray-800 pt-8">
                  <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Invoice Upload</h3>
                   <FormField
                    control={form.control}
                    name="invoice"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-black dark:text-white">Upload Supporting Document</FormLabel>
                        <FormDescription>
                          An invoice or other supporting document is required (PDF, JPEG, PNG, max 5MB).
                        </FormDescription>
                        <FormControl>
                          <div className="space-y-4">
                            {!localInvoiceFile ? (
                              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6 text-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors duration-200 cursor-pointer"
                                onClick={() => document.getElementById('invoiceUploadRecipient')?.click()}
                                onDrop={(e: React.DragEvent<HTMLDivElement>) => { 
                                  e.preventDefault(); 
                                  handleInvoiceUpload({ target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>); 
                                }}
                                onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
                                >
                                <div className="space-y-3">
                                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Drag and drop or click to upload
                                  </p>
                                  <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    id="invoiceUploadRecipient"
                                    onChange={handleInvoiceUpload}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-300 dark:border-gray-700"
                                    onClick={(e) => { 
                                      e.stopPropagation();
                                      document.getElementById('invoiceUploadRecipient')?.click();
                                    }}
                                    disabled={isEncoding}
                                  >
                                    {isEncoding ? (
                                      <>
                                        <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                      </>
                                    ) : (
                                      'Choose File'
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 flex items-center justify-between border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center overflow-hidden mr-2">
                                  <FileText className="h-6 w-6 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                                  <div className="flex-grow min-w-0">
                                    <p className="text-sm font-medium text-black dark:text-white truncate" title={localInvoiceFile.name}>
                                      {localInvoiceFile.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {(localInvoiceFile.size / 1024).toFixed(1)} KB
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={clearInvoice}
                                  className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 h-8 w-8 flex-shrink-0"
                                  aria-label="Remove invoice"
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
                </section>
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-200 dark:border-gray-800 pt-6 space-y-4 sm:space-y-0">
                 <p className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                  Review details carefully before proceeding.
                 </p>
                 <Button
                    type="submit"
                    className="w-full sm:w-auto bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 rounded-xl py-3 px-6 text-base"
                    disabled={isLoadingSender || !!senderError || !localInvoiceFile || !form.formState.isValid || isEncoding}
                  >
                    Continue to Confirmation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
} 