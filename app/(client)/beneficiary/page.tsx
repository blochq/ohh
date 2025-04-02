'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { Plus, Loader2 } from 'lucide-react';
import { getBeneficiaries } from '@/lib/api-calls';
import { tokenSchema } from '@/lib/dto';
import { z } from 'zod';
import { usePaymentContext } from '@/context/payment-context';
import { getAuthToken } from '@/lib/helper-function';
import { IBeneficiary } from '@/lib/models';

export default function BeneficiaryPage() {
  const router = useRouter();
  const { setSelectedBeneficiary } = usePaymentContext();
  
  const token = getAuthToken();

  const { data: beneficiariesData, isLoading } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: async () => {
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const input: z.infer<typeof tokenSchema> = { token };
      const response = await getBeneficiaries(input);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.validationErrors && response.validationErrors.length > 0) {
        throw new Error(response.validationErrors[0].message);
      }
      
      return response.data;
    },
    enabled: !!token,
  });

  const handleSelectBeneficiary = (beneficiary: IBeneficiary) => {
    setSelectedBeneficiary(beneficiary);
    router.push('/confirmation');
  };

  const handleAddNewBeneficiary = () => {
    router.push('/beneficiary/new');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black p-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 bg-clip-text text-transparent">
              Select Beneficiary
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Loading your beneficiaries...
            </p>
          </div>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 bg-clip-text text-transparent">
            Select Beneficiary
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Choose a beneficiary or add a new one
          </p>
        </div>
        
     

        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Your Beneficiaries</CardTitle>
                <CardDescription>
                  Select a beneficiary to continue with your transfer
                </CardDescription>
              </div>
              <Button
                onClick={handleAddNewBeneficiary}
                className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {beneficiariesData?.data && beneficiariesData.data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {beneficiariesData.data.map((beneficiary, index) => (
                  <Card
                    key={beneficiary._id + index}
                    className="border-gray-200 dark:border-gray-800 hover:border-gray-900 dark:hover:border-white cursor-pointer transition-colors"
                    onClick={() => handleSelectBeneficiary(beneficiary)}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {beneficiary.beneficiary_name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {beneficiary.beneficiary_account_number}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            {beneficiary.destination_country}
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {beneficiary.destination_currency}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  You haven&apos;t added any beneficiaries yet
                </p>
                <Button
                  onClick={handleAddNewBeneficiary}
                  className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Beneficiary
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg">About Beneficiaries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Save your beneficiaries to make future transfers faster and easier. 
              You can add multiple beneficiaries for different countries and currencies.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 