'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/session-context';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { upgradeTier } from '@/lib/api-calls';
import { getAuthToken } from '@/lib/helper-function';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowRight,
  Loader2,
  ShieldCheck,
  DollarSign,
  BriefcaseBusiness,
  CheckCircle2,
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
} from "@/components/ui/alert-dialog";

export default function TierUpgradePage() {
  const router = useRouter();
  const { isAuthenticated, user, customer, refreshSession } = useSession();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  const userId = customer?.id || user?._id || '';
  const currentTier = customer?.tier || 1;
  
  // Handle tier upgrade mutation
  const upgradeMutation = useMutation({
    mutationFn: () => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      return upgradeTier({
        token,
        customer_id: userId,
      });
    },
    onSuccess: (response) => {
      if (response.data?.success) {
        toast.success('Account upgraded to Tier 2 successfully');
        refreshSession();
        router.push('/profile');
      } else if (response.error) {
        toast.error(response.error.message || 'Failed to upgrade account tier');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'An unexpected error occurred');
    },
  });

  // Handle upgrade request
  const handleUpgradeRequest = () => {
    setShowConfirmDialog(true);
  };

  // Submit tier upgrade after confirmation
  const handleConfirmUpgrade = () => {
    upgradeMutation.mutate();
    setShowConfirmDialog(false);
  };

  // Check if upgrade is allowed (only T1 can upgrade to T2)
  const canUpgrade = currentTier === 1;

  // Tier features
  const tierFeatures = {
    tier1: [
      'Basic transfer limits',
      'Standard transaction fees',
      'Email support',
      'Normal processing times'
    ],
    tier2: [
      'Increased transfer limits (up to 5x)',
      'Reduced transaction fees',
      'Priority email and chat support',
      'Faster processing times',
      'Access to premium currency rates'
    ]
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Account Tier Upgrade
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upgrade your account tier to access enhanced features and benefits
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Tier */}
          <Card className={`border-gray-200 dark:border-gray-800 ${currentTier === 1 ? "" : "border-black dark:border-white"}`}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-gray-500" />
                Tier 1 - Standard
              </CardTitle>
              <CardDescription>
                Your current account level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Standard tier with basic features for everyday transfers
                </div>
                <Separator />
                <ul className="space-y-2">
                  {tierFeatures.tier1.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-gray-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              {currentTier === 1 && (
                <div className="w-full rounded-md bg-gray-100 dark:bg-gray-900 px-3 py-1 text-center text-sm">
                  Current Tier
                </div>
              )}
            </CardFooter>
          </Card>

          {/* Upgrade Tier */}
          <Card className={`border-gray-200 dark:border-gray-800 ${currentTier === 2 ? "border-black dark:border-white" : ""}`}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BriefcaseBusiness className="h-5 w-5 mr-2 text-amber-500" />
                Tier 2 - Premium
              </CardTitle>
              <CardDescription>
                Enhanced features and higher limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Premium tier with enhanced features and priority service
                </div>
                <Separator />
                <ul className="space-y-2">
                  {tierFeatures.tier2.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              {currentTier === 2 ? (
                <div className="w-full rounded-md bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-center text-sm">
                  Current Tier
                </div>
              ) : (
                <Button
                  onClick={handleUpgradeRequest}
                  className="w-full bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                  disabled={!canUpgrade || upgradeMutation.isPending}
                >
                  {upgradeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Upgrading...
                    </>
                  ) : (
                    <>
                      Upgrade to Tier 2
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <Card className="border-gray-200 dark:border-gray-800 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Tier Upgrade Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                To upgrade to Tier 2, you must have completed the following:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Complete your profile information</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Verify your identity with a government-issued ID</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Complete at least 3 successful transactions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Have an account in good standing for at least 30 days</span>
                </li>
              </ul>
              
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-md p-4 mt-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-medium">Important Note</p>
                    <p className="mt-1">
                      Tier upgrades are subject to review. Your application may take 1-2 business days to process. 
                      You will receive an email notification once your upgrade is approved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push('/profile')}
            >
              Back to Profile
            </Button>
          </CardFooter>
        </Card>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Confirm Account Tier Upgrade
              </AlertDialogTitle>
              <AlertDialogDescription>
                You are about to upgrade your account to Tier 2. This will provide you with 
                higher transfer limits, reduced fees, and priority support. 
                The upgrade process may take 1-2 business days to complete.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmUpgrade}
                className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                Confirm Upgrade
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
} 