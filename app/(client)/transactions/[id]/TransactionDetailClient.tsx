'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getSingleTransaction } from '@/lib/api-calls';
import { getAuthToken } from '@/lib/helper-function';
import { ITransaction } from '@/lib/models';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  RefreshCw, 
  ChevronLeft, 
  ExternalLink, 
  Printer, 
  Download 
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";

interface TransactionDetailClientProps {
  id: string;
}

export default function TransactionDetailClient({ id }: TransactionDetailClientProps) {
  const router = useRouter();


  const {
    data: transactionData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await getSingleTransaction({ 
        token, 
        reference: id 
      });
      
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
  });

 
  const refreshStatusMutation = useMutation({
    mutationFn: async () => {
      const token = getAuthToken();
      if (!token) throw new Error('Authentication required');
      
      return await getSingleTransaction({ token, reference: id });
    },
    onSuccess: () => {
      refetch();
    },
  });

 
  const transaction = transactionData?.data as ITransaction | undefined;


  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'completed':
        return "default";
      case 'pending':
        return "secondary";
      case 'processing':
        return "outline";
      case 'failed':
        return "destructive";
      default:
        return "outline";
    }
  };

  // Mock function to print receipt
  const printReceipt = () => {
    window.print();
  };

  // Mock function to download receipt
  const downloadReceipt = () => {
    alert('Download functionality will be implemented soon');
  };

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-8">
      {/* Back Navigation */}
      <Button 
        variant="ghost" 
        className="mb-6 pl-0 hover:bg-transparent hover:text-blue-600 dark:hover:text-blue-400"
        onClick={() => router.push('/transactions')}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Transactions
      </Button>

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-400 bg-clip-text text-transparent">
          Transaction Details
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View the details of your payment
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading transaction details...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500 mb-4">Failed to load transaction details</p>
            <Button 
              variant="outline"
              onClick={() => refetch()}
              className="mr-2"
            >
              Retry
            </Button>
            <Button 
              variant="default"
              onClick={() => router.push('/transactions')}
            >
              Back to Transactions
            </Button>
          </CardContent>
        </Card>
      ) : transaction ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Transaction Details Card */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>Payment Summary</CardTitle>
                  <CardDescription>
                    Reference: {transaction.transaction_id}
                  </CardDescription>
                </div>
                <div className="flex items-center">
                  <Badge variant={getStatusBadgeVariant(transaction.status)}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="ml-2"
                    onClick={() => refreshStatusMutation.mutate()}
                    disabled={refreshStatusMutation.isPending}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshStatusMutation.isPending ? 'animate-spin' : ''}`} />
                    <span className="sr-only">Refresh status</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="shadow-none border-gray-200 dark:border-gray-800">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Amount</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(transaction.amount)}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-none border-gray-200 dark:border-gray-800">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date</p>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(transaction.created_at)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Transaction Details */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Transaction Details</h3>
                  <Separator className="mb-4" />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Transaction ID</span>
                      <span className="text-gray-900 dark:text-white font-medium">{transaction.transaction_id}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Status</span>
                      <Badge variant={getStatusBadgeVariant(transaction.status)}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Created</span>
                      <span className="text-gray-900 dark:text-white">{formatDate(transaction.created_at)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Updated</span>
                      <span className="text-gray-900 dark:text-white">{formatDate(transaction.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Card */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                  asChild
                >
                  <Link href="/payment">
                    <Send className="mr-2 h-4 w-4" />
                    New Payment
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={printReceipt}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Receipt
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={downloadReceipt}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  If you have any questions about this transaction, our support team is available 24/7 to assist you.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/support">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Contact Support
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Transaction not found</p>
            <Button 
              onClick={() => router.push('/transactions')}
            >
              View All Transactions
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 