'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getAllTransactions } from '@/lib/api-calls';
import { ITransaction } from '@/lib/models';
import { getAllTransactionsSchema } from '@/lib/dto';
import { z } from 'zod';
import { formatCurrency, getAuthToken } from '@/lib/helper-function';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Send, ArrowLeft, ArrowRight, AlertCircle, Download, Receipt } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export default function TransactionsPage() {
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<ITransaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = getAuthToken();

  const { data: transactionsData, isLoading, error, refetch } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      if (!token) throw new Error('Authentication required');
      const input: z.infer<typeof getAllTransactionsSchema> = { token };
      const response = await getAllTransactions(input);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (transactionsData?.data) {
      setTransactions(transactionsData.data);
    }
  }, [transactionsData]);

  const totalCount = transactionsData?.data?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

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

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handleTransactionClick = (transaction: ITransaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 bg-clip-text text-transparent">
              Transaction History
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View all your international payments
            </p>
          </div>
          <Button asChild className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100">
            <Link href="/payment">
              <Send className="mr-2 h-4 w-4" />
              New Payment
            </Link>
          </Button>
        </div>

        {/* Transactions Table */}
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your payment history and status updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading transactions...</p>
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <AlertCircle className="h-10 w-10 text-gray-900 dark:text-gray-100 mx-auto mb-2" />
                <p className="text-gray-800 dark:text-gray-200 mb-4">Failed to load transactions</p>
                <Button onClick={() => refetch()} variant="outline" size="sm" className="border-gray-200 dark:border-gray-800">
                  Retry
                </Button>
              </div>
            ) : transactions.length > 0 ? (
              <>
                <div className="rounded-md border border-gray-200 dark:border-gray-800">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 dark:border-gray-800">
                        <TableHead>Date</TableHead>
                        <TableHead>Tracking ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction._id} className="border-gray-200 dark:border-gray-800">
                          <TableCell className="font-medium">
                            {formatDate(transaction.created_at)}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {transaction.tracking_id}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(transaction.offer_rate/100)}
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
                </div>
                
                {/* Pagination */}
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing page {page} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={page === 1}
                      onClick={handlePreviousPage}
                      className="border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={page === totalPages}
                      onClick={handleNextPage}
                      className="border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900"
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">You haven&apos;t made any transactions yet</p>
                <Button asChild className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100">
                  <Link href="/payment">
                    Send your first payment
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>


      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                <span>Transaction Details</span>
              </div>
              
            </DialogTitle>
            <DialogDescription>
              Complete information about your transaction
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Status Section */}
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

              {/* Transaction Details Grid */}
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
                     {formatCurrency(selectedTransaction.offer_rate/100)}
                    </p>
                  </div>
                  
                </div>
              </div>

              <Separator />

              {/* Timestamps */}
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
  );
} 