'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  Send,
  Globe,
  Clock
} from "lucide-react";

export default function Dashboard() {
  return (
    <main className="min-h-screen p-6 bg-white dark:bg-black">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 bg-clip-text text-transparent">
            International Payments Made Easy
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Send money across borders quickly and securely
          </p>
        </div>

        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-black text-white dark:bg-white dark:text-black hover:shadow-xl transition-all duration-200 group border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Send className="h-6 w-6" />
                Send Money
              </CardTitle>
              <CardDescription className="text-gray-300 dark:text-gray-700 text-base">
                Make an international transfer in minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                asChild 
                variant="secondary" 
                className="w-full mt-4 bg-white hover:bg-gray-100 text-black dark:bg-black dark:text-white dark:hover:bg-gray-900 border-0 group-hover:translate-y-[-2px] transition-transform duration-200"
              >
                <Link href="/payment">
                  <span className="flex items-center justify-center text-base">
                    Start Transfer
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-200 bg-white dark:bg-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="h-6 w-6" />
                Add Beneficiary
              </CardTitle>
              <CardDescription className="text-base">
                Save recipient details for faster transfers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                asChild 
                variant="outline" 
                className="w-full mt-4 hover:bg-gray-50 dark:hover:bg-gray-900 border-gray-200 dark:border-gray-800 hover:translate-y-[-2px] transition-transform duration-200"
              >
                <Link href="/beneficiaries/new">
                  <span className="flex items-center justify-center text-base">
                    Add New Recipient
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="mt-12 border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Why Choose Us?</CardTitle>
            <CardDescription className="text-base">
              Experience seamless international transfers with our platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8 mt-4">
              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg">Global Coverage</h3>
                <p className="text-gray-600 dark:text-gray-400">Send money to over 100+ countries worldwide</p>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg">Fast Transfers</h3>
                <p className="text-gray-600 dark:text-gray-400">Most transfers complete within 24 hours</p>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg">Secure & Reliable</h3>
                <p className="text-gray-600 dark:text-gray-400">Bank-grade security for your peace of mind</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 