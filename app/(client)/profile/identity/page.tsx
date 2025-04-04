'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/session-context';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { verifyKycIdentity } from '@/lib/api-calls';
import { kycIdentitySchema } from '@/lib/dto';
import { getAuthToken } from '@/lib/helper-function';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Upload, 
  ArrowRight,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type FormValues = z.infer<typeof kycIdentitySchema>;

const ID_TYPES = [
  { value: 'passport', label: 'International Passport' },
  { value: 'drivers_license', label: 'Driver\'s License' },
  { value: 'national_id', label: 'National ID Card' },
  { value: 'voters_card', label: 'Voter\'s Card' },
];

export default function KycIdentityPage() {
  const router = useRouter();
  const { isAuthenticated, user, customer, refreshSession } = useSession();
  const [idFrontImage, setIdFrontImage] = useState<string | null>(null);
  const [idBackImage, setIdBackImage] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState<Omit<FormValues, 'token' | 'customer_id'> | null>(null);
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  const userId = customer?.id || user?._id || '';
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(kycIdentitySchema.omit({ token: true, customer_id: true })),
    defaultValues: {
      id_number: '',
      back_image: '',
    },
  });

  // Handle KYC verification mutation
  const kycMutation = useMutation({
    mutationFn: (data: Omit<FormValues, 'token' | 'customer_id'>) => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      return verifyKycIdentity({
        ...data,
        token,
        customer_id: userId,
      });
    },
    onSuccess: (response) => {
      if (response.data?.success) {
        toast.success('Identity verified successfully');
        refreshSession();
        router.push('/profile');
      } else if (response.error) {
        toast.error(response.error.message || 'Failed to verify identity');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'An unexpected error occurred');
    },
  });

  // Handle form submission
  const onSubmit = (data: Omit<FormValues, 'token' | 'customer_id'>) => {
    if (idFrontImage) {
      data.front_image = idFrontImage;
    }
    if (idBackImage) {
      data.back_image = idBackImage;
    }
    
    setFormData(data);
    setShowConfirmDialog(true);
  };

  // Submit verification after confirmation
  const handleConfirmSubmit = () => {
    if (formData) {
      kycMutation.mutate(formData);
      setShowConfirmDialog(false);
    }
  };

  // Mock image upload functions
  const handleFrontImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server and get a URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdFrontImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success('Front image uploaded successfully');
    }
  };

  const handleBackImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server and get a URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdBackImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success('Back image uploaded successfully');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Identity Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Verify your identity to unlock additional features
          </p>
        </div>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Identification Document</CardTitle>
            <CardDescription>
              Please provide a valid government-issued ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="id_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ID type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ID_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the type of identification document
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="id_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <Input
                            placeholder="Enter your ID number"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        The number on your identification document
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="my-6" />

                <div className="space-y-6">
                  {/* Front Image Upload */}
                  <div className="space-y-3">
                    <FormLabel>ID Front Image</FormLabel>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6 text-center">
                      {idFrontImage ? (
                        <div className="space-y-3">
                          <div className="mx-auto max-w-sm">
                            <img 
                              src={idFrontImage} 
                              alt="ID Front" 
                              className="w-full h-auto object-contain max-h-60" 
                            />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Front image uploaded successfully
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIdFrontImage(null)}
                          >
                            Change Image
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Upload a clear image of the front of your ID
                          </p>
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="frontImage"
                            onChange={handleFrontImageUpload}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('frontImage')?.click()}
                          >
                            Upload Front Image
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Back Image Upload */}
                  <div className="space-y-3">
                    <FormLabel>ID Back Image (Optional for Passport)</FormLabel>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6 text-center">
                      {idBackImage ? (
                        <div className="space-y-3">
                          <div className="mx-auto max-w-sm">
                            <img 
                              src={idBackImage} 
                              alt="ID Back" 
                              className="w-full h-auto object-contain max-h-60" 
                            />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Back image uploaded successfully
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIdBackImage(null)}
                          >
                            Change Image
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Upload a clear image of the back of your ID
                          </p>
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="backImage"
                            onChange={handleBackImageUpload}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('backImage')?.click()}
                          >
                            Upload Back Image
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="mr-2"
                    onClick={() => router.push('/profile')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                    disabled={kycMutation.isPending}
                  >
                    {kycMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify Identity
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                Confirm Identity Verification
              </AlertDialogTitle>
              <AlertDialogDescription>
                Please ensure all information provided is accurate and the images are clear. 
                This information will be used to verify your identity and cannot be changed once submitted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmSubmit}
                className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                Confirm and Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
} 