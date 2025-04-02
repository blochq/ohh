'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/session-context';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  User,
  Settings,
  ShieldCheck,
  BriefcaseBusiness,
  LogOut,
  ArrowRight,
  ChevronRight,
  Wallet
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, customer, logout } = useSession();
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  const tierLevel = customer?.tier || 1;

  // Handle logout
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account details and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card className="md:col-span-2 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-gray-500" />
                  Account Information
                </CardTitle>
                <div className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800">
                  Tier {tierLevel}
                </div>
              </div>
              <CardDescription>
                Your personal account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                  <p>{customer?.name || user?.name || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                  <p>{user?.email || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</p>
                  <p>{customer?.phone || user?.phone || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Status</p>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <p>Active</p>
                  </div>
                </div>
                {customer?.dob && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</p>
                    <p>{customer.dob}</p>
                  </div>
                )}
                {customer?.gender && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</p>
                    <p>{customer.gender.charAt(0).toUpperCase() + customer.gender.slice(1)}</p>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Tier Benefits</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <div className="flex items-start">
                    <ShieldCheck className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{tierLevel === 1 ? 'Basic transfer limits' : 'Increased transfer limits'}</span>
                  </div>
                  <div className="flex items-start">
                    <Wallet className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{tierLevel === 1 ? 'Standard fees' : 'Reduced transaction fees'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/profile/upgrade')}
              >
                Complete Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Action Links Card */}
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-gray-500" />
                Account Management
              </CardTitle>
              <CardDescription>
                Upgrade and verify your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Link
                  href="/profile/upgrade"
                  className="flex items-center justify-between p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-3 text-gray-500" />
                    <div className="text-sm font-medium">Update Profile</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>

                <Link
                  href="/profile/identity"
                  className="flex items-center justify-between p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center">
                    <ShieldCheck className="h-5 w-5 mr-3 text-gray-500" />
                    <div className="text-sm font-medium">Verify Identity</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>

                <Link
                  href="/profile/tier-upgrade"
                  className="flex items-center justify-between p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center">
                    <BriefcaseBusiness className="h-5 w-5 mr-3 text-gray-500" />
                    <div className="text-sm font-medium">Upgrade Tier</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              </div>

              <Separator className="my-2" />

              <Button
                variant="ghost"
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-800"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Verification Status Card */}
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldCheck className="h-5 w-5 mr-2 text-gray-500" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Profile Information */}
                <div className="border rounded-md p-4 bg-white dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Profile Information</h3>
                    <div className={`h-2 w-2 rounded-full ${customer?.dob ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {customer?.dob ? 'Complete' : 'Incomplete'}
                  </p>
                  {!customer?.dob && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => router.push('/profile/upgrade')}
                    >
                      Complete
                    </Button>
                  )}
                </div>

                {/* Identity Verification */}
                <div className="border rounded-md p-4 bg-white dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Identity Verification</h3>
                    <div className={`h-2 w-2 rounded-full ${customer?.kyc_verified ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {customer?.kyc_verified ? 'Verified' : 'Not Verified'}
                  </p>
                  {!customer?.kyc_verified && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => router.push('/profile/identity')}
                    >
                      Verify Now
                    </Button>
                  )}
                </div>

                {/* Account Tier */}
                <div className="border rounded-md p-4 bg-white dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Account Tier</h3>
                    <div className={`h-2 w-2 rounded-full ${tierLevel > 1 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {tierLevel === 1 ? 'Standard (Tier 1)' : 'Premium (Tier 2)'}
                  </p>
                  {tierLevel === 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => router.push('/profile/tier-upgrade')}
                    >
                      Upgrade
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 text-sm text-gray-600 dark:text-gray-400">
                <p>Complete all verification steps to unlock the full capabilities of your account, including higher transfer limits and reduced fees.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 