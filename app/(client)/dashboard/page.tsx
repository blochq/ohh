'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/context/session-context';
import { getAllTransactions } from '@/lib/api-calls';
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
  Clock,
  AlertCircle,
  X,
  Download,
  Receipt
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ITransaction } from '@/lib/models';
import { formatCurrency, getAuthToken } from '@/lib/helper-function';

export default function Dashboard() {
  const { isAuthenticated } = useSession();
  const [selectedTransaction, setSelectedTransaction] = useState<ITransaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const token = getAuthToken();

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

  const getStatusBadgeClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    error: transactionsError
  } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: async () => {
      if (!isAuthenticated) return null;
      
    
      
      const response = await getAllTransactions({ 
        token, 
      });
      
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    enabled: isAuthenticated && !!token,
  });

  useEffect(() => {
    if (transactionsData?.data) {
      setTransactions(transactionsData.data);
    }
  }, [transactionsData]);

  const handleTransactionClick = (transaction: ITransaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen p-6 bg-white dark:bg-black">
      <div className="max-w-5xl mx-auto space-y-8">
    
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 bg-clip-text text-transparent">
            International Payments Made Easy
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Send money across borders quickly and securely
          </p>
        </div>

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

        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Recent Transactions</CardTitle>
              <CardDescription className="text-base">
                Your latest payment activities
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/transactions">
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingTransactions ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[150px]" />
                    </div>
                    <Skeleton className="h-8 w-[80px]" />
                  </div>
                ))}
              </div>
            ) : transactionsError ? (
              <div className="py-8 text-center">
                <AlertCircle className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Unable to load transactions</p>
                <Button variant="ghost" size="sm" className="mt-2">
                  Retry
                </Button>
              </div>
            ) : transactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 5).map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell className="font-medium">
                        {formatDate(transaction.created_at)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(transaction.offer_rate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(transaction.status)} className={getStatusBadgeClass(transaction.status)}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleTransactionClick(transaction)}
                          className="hover:bg-gray-100 dark:hover:bg-gray-900"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">No transactions found</p>
                <Button asChild className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100">
                  <Link href="/payment">
                    Send your first payment
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

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
                  <Globe className="h-6 w-6 text-gray-900 dark:text-gray-100" />
                </div>
                <h3 className="font-semibold text-lg">Global Coverage</h3>
                <p className="text-gray-600 dark:text-gray-400">Send money to over 100+ countries worldwide</p>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-gray-900 dark:text-gray-100" />
                </div>
                <h3 className="font-semibold text-lg">Fast Transfers</h3>
                <p className="text-gray-600 dark:text-gray-400">Most transfers complete within 24 hours</p>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-gray-900 dark:text-gray-100" />
                </div>
                <h3 className="font-semibold text-lg">Secure & Reliable</h3>
                <p className="text-gray-600 dark:text-gray-400">Bank-grade security for your peace of mind</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  <span>Transaction Details</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsModalOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
              <DialogDescription>
                Complete information about your transaction
              </DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                    <Badge variant={getStatusBadgeVariant(selectedTransaction.status)} className={`mt-1 ${getStatusBadgeClass(selectedTransaction.status)}`}>
                      {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                    </Badge>
                  </div>
                  {selectedTransaction.invoice && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => window.open(selectedTransaction.invoice, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                      Download Invoice
                    </Button>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction ID</p>
                      <p className="text-sm font-mono">{selectedTransaction._id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tracking ID</p>
                      <p className="text-sm font-mono">{selectedTransaction.tracking_id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Organization ID</p>
                      <p className="text-sm font-mono">{selectedTransaction.organization_id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</p>
                      <p className="text-sm font-mono">{selectedTransaction.user_id}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
                      <p className="text-sm capitalize">{selectedTransaction.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Currency</p>
                      <p className="text-sm">{selectedTransaction.currency}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</p>
                      <p className="text-sm font-semibold">
                        {selectedTransaction.invoice ? `$${parseFloat(selectedTransaction.invoice).toFixed(2)}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Exchange Rate</p>
                      <p className="text-sm">{selectedTransaction.offer_rate}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</p>
                    <p className="text-sm">{formatDate(selectedTransaction.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                    <p className="text-sm">{formatDate(selectedTransaction.updated_at)}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
} 