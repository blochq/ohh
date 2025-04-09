'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getAllTransactions } from '@/lib/api-calls';
import { ITransaction } from '@/lib/models';
import { getAllTransactionsSchema } from '@/lib/dto';
import { z } from 'zod';
import { formatCurrency, getAuthToken } from '@/lib/helper-function';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
// We would need to add html2canvas as a dependency for JPG export
// import html2canvas from 'html2canvas';

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
import { 
  Send, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  Download, 
  Receipt, 
  Share2, 
  FileDown, 
  ImageDown, 
  Copy, 
  Check
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function TransactionsPageContent() {
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<ITransaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  const receiptRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const transactionIdFromUrl = searchParams.get('transaction_id');
    if (transactionIdFromUrl && transactions.length > 0) {
      const transactionToOpen = transactions.find(t => t._id === transactionIdFromUrl);
      if (transactionToOpen) {
        setSelectedTransaction(transactionToOpen);
        setIsModalOpen(true);
      }
    }
  }, [transactions, searchParams]);

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

  // Enhanced PDF Download Function
  const handlePrintPdf = () => {
    const content = receiptRef.current;
    if (content) {
      const printWindow = window.open('', '', 'height=800,width=600');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Transaction Receipt</title>');
        // Add more robust styling here for a better PDF output
        printWindow.document.write(`
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 0; 
              margin: 0; 
              color: #333;
            }
            
            .receipt-wrapper {
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
            }
            
            .receipt-container { 
              border: 1px solid #e5e7eb; 
              border-radius: 12px; 
              padding: 32px; 
              box-shadow: 0 4px 6px rgba(0,0,0,0.05);
              background-color: #fff;
            }
            
            .receipt-header { 
              text-align: center; 
              margin-bottom: 32px; 
              position: relative;
            }
            
            .company-logo {
              height: 40px;
              margin-bottom: 16px;
              /* You would add your actual logo image here */
            }
            
            .receipt-title {
              font-size: 24px;
              font-weight: 700;
              margin: 0 0 8px 0;
              color: #111;
            }
            
            .receipt-subtitle {
              color: #6b7280;
              font-size: 14px;
              margin: 0;
            }
            
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 600;
              margin-top: 8px;
            }
            
            .status-completed {
              background-color: #d1fae5;
              color: #065f46;
            }
            
            .status-pending {
              background-color: #fef3c7;
              color: #92400e;
            }
            
            .status-processing {
              background-color: #dbeafe;
              color: #1e40af;
            }
            
            .status-failed {
              background-color: #fee2e2;
              color: #b91c1c;
            }
            
            .detail-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 24px; 
              margin-bottom: 32px;
              border: 1px solid #f3f4f6;
              border-radius: 8px;
              padding: 16px;
              background-color: #f9fafb;
            }
            
            .detail-item { 
              margin-bottom: 16px;
            }
            
            .detail-item .label { 
              color: #6b7280; 
              font-size: 12px; 
              font-weight: 500;
              margin-bottom: 4px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            
            .detail-item .value { 
              font-weight: 600; 
              font-size: 16px;
              color: #111827;
            }
            
            .amount-value {
              font-size: 24px;
              font-weight: 700;
              color: #111827;
            }
            
            .separator { 
              border: none; 
              border-top: 1px solid #e5e7eb; 
              margin: 32px 0; 
            }
            
            .footer-note { 
              margin-top: 32px; 
              text-align: center; 
              font-size: 14px; 
              color: #6b7280;
            }
            
            .receipt-stamp {
              margin-top: 40px;
              text-align: center;
              font-size: 14px;
              color: #6b7280;
            }
            
            .receipt-stamp .stamp-icon {
              width: 48px;
              height: 48px;
              margin: 0 auto 8px auto;
              background-color: #f3f4f6;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .receipt-date {
              margin-top: 16px;
              font-size: 12px;
              color: #9ca3af;
              text-align: center;
            }
          </style>
        `);
        
        // Create a modified version of the receipt for printing
        // with additional styling and branding elements
        const today = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        const status = selectedTransaction?.status.toLowerCase() || '';
        let statusClass = 'status-pending';
        if (status === 'completed') statusClass = 'status-completed';
        else if (status === 'processing') statusClass = 'status-processing';
        else if (status === 'failed') statusClass = 'status-failed';
        
        printWindow.document.write('</head><body><div class="receipt-wrapper">');
        printWindow.document.write(`
          <div class="receipt-container">
            <div class="receipt-header">
              <!-- Your company logo could go here -->
              <div class="company-logo">Payment Platform</div>
              <h1 class="receipt-title">Transaction Receipt</h1>
              <p class="receipt-subtitle">Transaction details for your records</p>
              <div class="status-badge ${statusClass}">
                ${selectedTransaction?.status ? selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1) : 'Unknown'}
              </div>
            </div>
            
            <div class="detail-grid">
              <div class="detail-item">
                <p class="label">Amount</p>
                <p class="value amount-value">${formatCurrency(selectedTransaction?.offer_rate ? selectedTransaction.offer_rate / 100 : 0)}</p>
              </div>
              <div class="detail-item">
                <p class="label">Transaction ID</p>
                <p class="value">${selectedTransaction?._id || 'N/A'}</p>
              </div>
              <div class="detail-item">
                <p class="label">Date</p>
                <p class="value">${formatDate(selectedTransaction?.created_at || '')}</p>
              </div>
              <div class="detail-item">
                <p class="label">Tracking ID</p>
                <p class="value">${selectedTransaction?.tracking_id || 'N/A'}</p>
              </div>
              <div class="detail-item">
                <p class="label">Currency</p>
                <p class="value">${selectedTransaction?.currency || 'N/A'}</p>
              </div>
              <div class="detail-item">
                <p class="label">Type</p>
                <p class="value">${selectedTransaction?.type || 'N/A'}</p>
              </div>
            </div>
            
            <hr class="separator" />
            
            <p class="footer-note">
              Thank you for using our payment platform. Please keep this receipt for your records.
            </p>
            
            <div class="receipt-stamp">
              <div class="stamp-icon">✓</div>
              <p>Official Transaction Record</p>
            </div>
            
            <p class="receipt-date">Generated on ${today}</p>
          </div>
        `);
        
        printWindow.document.write('</div></body></html>');
        printWindow.document.close();
        printWindow.focus();
        
        // Timeout helps ensure content is loaded before print dialog
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      } else {
        toast.error("Could not open print window. Please check browser settings.");
      }
    } else {
      toast.error("Receipt content not available.");
    }
  };

  // Implement JPG Download with html2canvas
  const handleDownloadJpg = async () => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && receiptRef.current) {
      toast.loading("Generating JPG image...");
      
      try {
        // Dynamically import html2canvas
        const html2canvas = (await import('html2canvas')).default;
        
        // Render the receipt element to a canvas
        const canvas = await html2canvas(receiptRef.current, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            // Set link attributes
            link.download = `transaction-receipt-${selectedTransaction?._id || 'download'}.jpg`;
            link.href = url;
            
            // Append, click and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            URL.revokeObjectURL(url);
            toast.dismiss();
            toast.success("JPG downloaded successfully!");
          } else {
            toast.dismiss();
            toast.error("Failed to generate JPG.");
          }
        }, 'image/jpeg', 0.95); // High quality JPEG
        
      } catch (err) {
        console.error("Error generating canvas:", err);
        toast.dismiss();
        toast.error(`Could not generate JPG image: ${(err as Error).message}`);
      }
    } else {
      toast.error("Receipt content not available.");
    }
  };

  // Enhanced Copy to Clipboard for sharing
  const copyToClipboard = () => {
    if (!selectedTransaction) return;
    
    const receiptText = `
Transaction Receipt
------------------
ID: ${selectedTransaction._id}
Amount: ${formatCurrency(selectedTransaction.offer_rate / 100)}
Status: ${selectedTransaction.status}
Date: ${formatDate(selectedTransaction.created_at)}
Currency: ${selectedTransaction.currency}
Type: ${selectedTransaction.type}
Tracking ID: ${selectedTransaction.tracking_id}
------------------
Generated from Payment Platform
`;

    navigator.clipboard.writeText(receiptText).then(() => {
      setCopied(true);
      toast.success("Receipt details copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("Could not copy text: ", err);
      toast.error("Failed to copy to clipboard.");
    });
  };

  // Enhanced Share Function
  const handleShare = async () => {
    if (!selectedTransaction) return;
    
    const shareData = {
      title: 'Transaction Receipt',
      text: `Transaction Receipt\n\nAmount: ${formatCurrency(selectedTransaction.offer_rate / 100)}\nID: ${selectedTransaction._id}\nStatus: ${selectedTransaction.status}\nDate: ${formatDate(selectedTransaction.created_at)}\n\nThank you for using our service.`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Receipt shared successfully!');
      } else {
        // If Web Share API isn't available, we'll show a message
        // encouraging to use the Copy button instead
        toast.info('Direct sharing not supported on this browser. Use the "Copy to Clipboard" option instead.');
      }
    } catch (err) {
      console.error("Error sharing receipt:", err);
      toast.error(`Could not share receipt: ${(err as Error).message}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 relative z-10">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-gray-100 dark:bg-gray-900 opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute top-[50%] right-[20%] w-[30%] h-[30%] bg-gray-200 dark:bg-gray-800 opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[30%] w-[40%] h-[30%] bg-gray-100 dark:bg-gray-900 opacity-30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">
            Transaction History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and manage all your international payments
          </p>
        </div>

        <div className="flex justify-end mb-6">
          <Button asChild className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 rounded-xl">
            <Link href="/payment">
              <Send className="mr-2 h-4 w-4" />
              New Payment
            </Link>
          </Button>
        </div>

        {/* Transactions Table */}
        <div className=" backdrop-blur-sm bg-white/70 dark:bg-black/70 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 pb-4">
            <h2 className="text-2xl font-bold text-black dark:text-white">Recent Transactions</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your payment history and status updates
            </p>
          </div>
          <div className="p-6 pt-0">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading transactions...</p>
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <AlertCircle className="h-10 w-10 text-gray-900 dark:text-gray-100 mx-auto mb-2" />
                <p className="text-gray-800 dark:text-gray-200 mb-4">Failed to load transactions</p>
                <Button onClick={() => refetch()} variant="outline" size="sm" className="border-gray-200 dark:border-gray-800 rounded-lg">
                  Retry
                </Button>
              </div>
            ) : transactions.length > 0 ? (
              <>
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                        <TableHead className="font-medium text-gray-700 dark:text-gray-300">Date</TableHead>
                        <TableHead className="font-medium text-gray-700 dark:text-gray-300">Tracking ID</TableHead>
                        <TableHead className="font-medium text-gray-700 dark:text-gray-300">Amount</TableHead>
                        <TableHead className="font-medium text-gray-700 dark:text-gray-300">Status</TableHead>
                        <TableHead className="text-right font-medium text-gray-700 dark:text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow 
                          key={transaction._id} 
                          className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors cursor-pointer"
                          onClick={() => handleTransactionClick(transaction)}
                        >
                          <TableCell className="font-medium text-black dark:text-white">
                            {formatDate(transaction.created_at)}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                            {transaction.tracking_id}
                          </TableCell>
                          <TableCell className="text-black dark:text-white font-semibold">
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
                              className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
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
                      className="border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={page === totalPages}
                      onClick={handleNextPage}
                      className="border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center bg-gray-50/50 dark:bg-gray-900/20 rounded-xl border border-gray-200 dark:border-gray-800">
                <p className="text-gray-600 dark:text-gray-400 mb-4">You haven&apos;t made any transactions yet</p>
                <Button asChild className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 rounded-xl">
                  <Link href="/payment">
                    Send your first payment
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[650px] bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-0">
          <DialogHeader className="p-6 pb-4 border-b border-gray-200 dark:border-gray-800">
            <DialogTitle className="flex items-center text-black dark:text-white text-xl">
              <Receipt className="h-5 w-5 mr-2" />
              <span>Transaction Receipt</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Summary of your transaction details.
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                <div ref={receiptRef} className="receipt-container bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="receipt-header mb-6 text-center">
                        <h2 className="text-2xl font-semibold text-black dark:text-white">Transaction Completed</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Status: 
                           <span className={`font-medium ml-1 ${getStatusBadgeClass(selectedTransaction.status)} px-2 py-0.5 rounded text-xs`}> 
                                {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)} 
                           </span>
                        </p>
                    </div>

                    <div className="detail-grid grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
                         <div className="detail-item space-y-3">
                             <div>
                                <p className="label text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</p>
                                <p className="value text-lg font-bold text-black dark:text-white">{formatCurrency(selectedTransaction.offer_rate / 100)}</p>
                             </div>
                             <div>
                                <p className="label text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</p>
                                <p className="value text-sm text-black dark:text-white">{formatDate(selectedTransaction.created_at)}</p>
                             </div>
                            <div>
                                <p className="label text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Currency</p>
                                <p className="value text-sm text-black dark:text-white">{selectedTransaction.currency}</p>
                            </div>
                         </div>
                         <div className="detail-item space-y-3">
                             <div>
                                <p className="label text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transaction ID</p>
                                <p className="value text-sm font-mono text-black dark:text-white">{selectedTransaction._id}</p>
                            </div>
                             <div>
                                <p className="label text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tracking ID</p>
                                <p className="value text-sm font-mono text-black dark:text-white">{selectedTransaction.tracking_id}</p>
                            </div>
                             <div>
                                <p className="label text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</p>
                                <p className="value text-sm capitalize text-black dark:text-white">{selectedTransaction.type}</p>
                             </div>
                         </div>
                    </div>

                     <hr className="border-gray-200 dark:border-gray-700 my-6" />
                     
                     <p className="footer-note text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
                         Thank you for using our service.
                     </p>
                </div>
            </div>
          )}
          
          {selectedTransaction && (
              <DialogFooter className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex flex-wrap justify-center sm:justify-end gap-3">
                  {/* Improved Share Button with Popover */}
                  <Popover>
                      <PopoverTrigger asChild>
                          <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 rounded-lg border-gray-300 dark:border-gray-700"
                          >
                              <Share2 className="h-4 w-4" /> Share
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-3" align="end">
                          <div className="space-y-3">
                              <h4 className="font-medium text-sm">Share Options</h4>
                              <div className="flex flex-col gap-2">
                                  <Button 
                                      onClick={handleShare} 
                                      variant="ghost" 
                                      size="sm" 
                                      className="justify-start"
                                      disabled={!navigator.share}
                                  >
                                      <Share2 className="h-4 w-4 mr-2" /> Share directly
                                  </Button>
                                  <Button 
                                      onClick={copyToClipboard} 
                                      variant="ghost" 
                                      size="sm" 
                                      className="justify-start"
                                  >
                                      {copied ? (
                                          <><Check className="h-4 w-4 mr-2" /> Copied!</>
                                      ) : (
                                          <><Copy className="h-4 w-4 mr-2" /> Copy to clipboard</>
                                      )}
                                  </Button>
                              </div>
                          </div>
                      </PopoverContent>
                  </Popover>
                  
                  {/* Download Buttons */}
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrintPdf}
                      className="flex items-center gap-2 rounded-lg border-gray-300 dark:border-gray-700"
                  >
                      <FileDown className="h-4 w-4" /> Download PDF
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadJpg}
                      className="flex items-center gap-2 rounded-lg border-gray-300 dark:border-gray-700"
                  >
                      <ImageDown className="h-4 w-4" /> Download JPG
                  </Button>
                   {selectedTransaction.invoice && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2 rounded-lg border-gray-300 dark:border-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                        onClick={() => window.open(selectedTransaction.invoice!, '_blank')}
                      >
                        <Download className="h-4 w-4" /> Download Invoice
                      </Button>
                    )}
              </DialogFooter>
          )}  
        </DialogContent>
      </Dialog>
      
       {/* Print Styles (Hidden on screen) */}
       <style jsx global>{`
         @media print {
           body * {
             visibility: hidden;
           }
           .receipt-container, .receipt-container * {
             visibility: visible;
           }
           .receipt-container {
             position: absolute;
             left: 0;
             top: 0;
             width: 100%;
             margin: 0;
             padding: 20px;
             border: none;
             box-shadow: none;
           }
           button { 
             display: none !important;
           }
         }
      `}</style>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div>Loading transactions...</div>}>
      <TransactionsPageContent />
    </Suspense>
  );
} 