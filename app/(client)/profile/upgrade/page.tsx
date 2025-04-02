'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/session-context';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { upgradeCustomer } from '@/lib/api-calls';
import { customerUpgradeSchema } from '@/lib/dto';
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Calendar, 
  Upload, 
  ArrowRight,
  Loader2
} from 'lucide-react';

type FormValues = z.infer<typeof customerUpgradeSchema>;

export default function ProfileUpgradePage() {
  const router = useRouter();
  const { isAuthenticated, user, customer, refreshSession } = useSession();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  const userId = customer?.id || user?._id || '';
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(customerUpgradeSchema.omit({ token: true, customer_id: true })),
    defaultValues: {
      dob: '',
      gender: 'male',
      place_of_birth: '',
      image: '',
    },
  });

  // Handle profile upgrade mutation
  const upgradeMutation = useMutation({
    mutationFn: (data: Omit<FormValues, 'token' | 'customer_id'>) => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      return upgradeCustomer({
        ...data,
        token,
        customer_id: userId,
      });
    },
    onSuccess: (response) => {
      if (response.data?.success) {
        toast.success('Profile upgraded successfully');
        refreshSession();
        router.push('/profile');
      } else if (response.error) {
        toast.error(response.error.message || 'Failed to upgrade profile');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'An unexpected error occurred');
    },
  });

  // Handle form submission
  const onSubmit = (data: Omit<FormValues, 'token' | 'customer_id'>) => {
    if (profileImage) {
      data.image = profileImage;
    }
    upgradeMutation.mutate(data);
  };

  // Mock image upload function
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server and get a URL
      // For this example, we'll just use a placeholder
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success('Image uploaded successfully');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Provide additional information to upgrade your account
          </p>
        </div>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              This information will be used to verify your identity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <Input
                            type="date"
                            placeholder="YYYY-MM-DD"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Your date of birth in YYYY-MM-DD format
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-6"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="male" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Male
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="female" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Female
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="place_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place of Birth</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <Input
                            placeholder="City, Country"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        The city and country where you were born
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="my-6" />

                <div className="space-y-3">
                  <FormLabel>Profile Photo</FormLabel>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6 text-center">
                    {profileImage ? (
                      <div className="space-y-3">
                        <div className="mx-auto h-24 w-24 relative rounded-full overflow-hidden">
                          <img 
                            src={profileImage} 
                            alt="Profile" 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Image uploaded successfully
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setProfileImage(null)}
                        >
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Drag and drop a photo, or click to browse
                        </p>
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="profileImage"
                          onChange={handleImageUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('profileImage')?.click()}
                        >
                          Upload Photo
                        </Button>
                      </div>
                    )}
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
                    disabled={upgradeMutation.isPending}
                  >
                    {upgradeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        Update Profile
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 