'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/context/session-context';
import { getAllTransactions } from '@/lib/api-calls';
import { Button } from "@/components/ui/button";
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
    <main className=" bg-white dark:bg-black relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-gray-100 dark:bg-gray-900 opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute top-[50%] right-[20%] w-[30%] h-[30%] bg-gray-200 dark:bg-gray-800 opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[30%] w-[40%] h-[30%] bg-gray-100 dark:bg-gray-900 opacity-30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-5xl mx-auto p-6 space-y-8 relative z-10">
    
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white">
            International Payments Made Easy
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Send money across borders quickly and securely
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black text-white dark:bg-white dark:text-black rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="p-6">
              <div className="flex items-center gap-2 text-2xl font-bold mb-2">
                <Send className="h-6 w-6" />
                Send Money
              </div>
              <p className="text-gray-300 dark:text-gray-700 text-base mb-6">
                Make an international transfer in minutes
              </p>
            
              <Button 
                asChild 
                variant="secondary" 
                className="w-full py-5 mt-4 bg-white hover:bg-gray-100 text-black dark:bg-black dark:text-white dark:hover:bg-gray-900 border-0 transition-transform duration-200 rounded-xl"
              >
                <Link href="/payment">
                  <span className="flex items-center justify-center text-base">
                    Start Transfer
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-200 border border-gray-200 dark:border-gray-800">
            <div className="p-6">
              <div className="flex items-center gap-2 text-2xl font-bold mb-2 text-black dark:text-white">
                <Users className="h-6 w-6" />
                Add Beneficiary
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-base mb-6">
                Save recipient details for faster transfers
              </p>
            
              <Button 
                asChild 
                variant="outline" 
                className="w-full py-5 mt-4 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 transition-transform duration-200 rounded-xl"
              >
                <Link href="/beneficiary/new">
                  <span className="flex items-center justify-center text-base">
                    Add New Recipient
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800">
          <div className="p-6 pb-4 flex flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-white">Recent Transactions</h2>
              <p className="text-gray-600 dark:text-gray-400 text-base">
                Your latest payment activities
              </p>
            </div>
            <Button variant="outline" asChild className="rounded-xl">
              <Link href="/transactions">
                View All
              </Link>
            </Button>
          </div>
          <div className="p-6 pt-0">
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
                          className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
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
                <Button asChild className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 rounded-xl">
                  <Link href="/payment">
                    Send your first payment
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800">
          <div className="p-6 pb-2 text-center">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Why Choose Us?</h2>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Experience seamless international transfers with our platform
            </p>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-8 mt-4">
              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-black dark:text-white" />
                </div>
                <h3 className="font-semibold text-lg text-black dark:text-white">Global Coverage</h3>
                <p className="text-gray-600 dark:text-gray-400">Send money to over 100+ countries worldwide</p>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-black dark:text-white" />
                </div>
                <h3 className="font-semibold text-lg text-black dark:text-white">Fast Transfers</h3>
                <p className="text-gray-600 dark:text-gray-400">Most transfers complete within 24 hours</p>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-black dark:text-white" />
                </div>
                <h3 className="font-semibold text-lg text-black dark:text-white">Secure & Reliable</h3>
                <p className="text-gray-600 dark:text-gray-400">Bank-grade security for your peace of mind</p>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[800px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between text-black dark:text-white">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  <span>Transaction Details</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsModalOpen(false)}
                  className="h-6 w-6 p-0 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
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
                      className="flex items-center gap-2 rounded-lg border-gray-200 dark:border-gray-700"
                      onClick={() => window.open(selectedTransaction.invoice, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                      Download Invoice
                    </Button>
                  )}
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-800" />

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction ID</p>
                      <p className="text-sm font-mono text-black dark:text-white">{selectedTransaction._id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tracking ID</p>
                      <p className="text-sm font-mono text-black dark:text-white">{selectedTransaction.tracking_id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Organization ID</p>
                      <p className="text-sm font-mono text-black dark:text-white">{selectedTransaction.organization_id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</p>
                      <p className="text-sm font-mono text-black dark:text-white">{selectedTransaction.user_id}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
                      <p className="text-sm capitalize text-black dark:text-white">{selectedTransaction.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Currency</p>
                      <p className="text-sm text-black dark:text-white">{selectedTransaction.currency}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</p>
                      <p className="text-sm font-semibold text-black dark:text-white">
                        {selectedTransaction.invoice ? `$${parseFloat(selectedTransaction.invoice).toFixed(2)}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Exchange Rate</p>
                      <p className="text-sm text-black dark:text-white">{selectedTransaction.offer_rate}</p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-800" />

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</p>
                    <p className="text-sm text-black dark:text-white">{formatDate(selectedTransaction.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                    <p className="text-sm text-black dark:text-white">{formatDate(selectedTransaction.updated_at)}</p>
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