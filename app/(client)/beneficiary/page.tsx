'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
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
    <div className="max-w-5xl mx-auto  space-y-8 relative z-10">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-gray-100 dark:bg-gray-900 opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute top-[50%] right-[20%] w-[30%] h-[30%] bg-gray-200 dark:bg-gray-800 opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[30%] w-[40%] h-[30%] bg-gray-100 dark:bg-gray-900 opacity-30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-4xl mx-auto p-4 space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">
            Select Beneficiary
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Choose a beneficiary or add a new one
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800">
          <div className="p-6 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-black dark:text-white">Your Beneficiaries</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Select a beneficiary to continue with your transfer
                </p>
              </div>
              <Button
                onClick={handleAddNewBeneficiary}
                className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 rounded-xl"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Button>
            </div>
          </div>
          
          <div className="p-6 pt-0">
            {beneficiariesData?.data && beneficiariesData.data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {beneficiariesData.data.map((beneficiary, index) => (
                  <div
                    key={beneficiary._id + index}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-900 dark:hover:border-white rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all p-6"
                    onClick={() => handleSelectBeneficiary(beneficiary)}
                  >
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-black dark:text-white">
                        {beneficiary.beneficiary_name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {beneficiary.beneficiary_account_number}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          {beneficiary.destination_country}
                        </span>
                        <span className="text-black dark:text-white font-medium">
                          {beneficiary.destination_currency}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  You haven&apos;t added any beneficiaries yet
                </p>
                <Button
                  onClick={handleAddNewBeneficiary}
                  className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Beneficiary
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border-l-4 border-t border-r border-b border-gray-200 dark:border-gray-800 border-l-gray-900 dark:border-l-white">
          <div className="p-6 pb-4">
            <h2 className="text-lg font-bold text-black dark:text-white">About Beneficiaries</h2>
          </div>
          <div className="p-6 pt-0">
            <p className="text-gray-600 dark:text-gray-400">
              Save your beneficiaries to make future transfers faster and easier. 
              You can add multiple beneficiaries for different countries and currencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 