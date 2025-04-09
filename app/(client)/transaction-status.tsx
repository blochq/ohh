// 'use client';

// import React, { useEffect, useState, useRef, Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { Button } from "@/components/ui/button";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// import { useQuery } from '@tanstack/react-query';
// import { Loader2, Info, CheckCircle2, XCircle, Clock, Download, ArrowLeft, Receipt } from 'lucide-react';
// import { getSingleTransaction } from '@/lib/api-calls';
// import { getSingleTransactionSchema } from '@/lib/dto';
// import { ITransaction } from '@/lib/models'; // Assuming ITransaction is the correct type
// import { z } from 'zod';
// import { toast } from 'sonner';
// import { getAuthToken } from '@/lib/helper-function';

// // Helper component for displaying details
// const DetailItem = ({ label, value, className }: { label: string, value?: string | number | null, className?: string }) => {
//     if (value === null || value === undefined || value === '') return null;
//     return (
//         <div className={`flex justify-between items-center text-sm py-2 ${className}`}>
//             <p className="text-gray-500 dark:text-gray-400">{label}</p>
//             <p className="font-medium text-gray-900 dark:text-gray-100 text-right">{value}</p>
//         </div>
//     );
// };

// // Helper to format currency
// const formatCurrency = (amount: number, currency: string) => {
//     try {
//         return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
//     } catch (e) {
//         console.warn(`Failed to format currency ${currency}`, e);
//         return `${currency} ${amount.toFixed(2)}`;
//     }
// };

// // Helper to format dates
// const formatDateTime = (dateString?: string | null): string | null => {
//     if (!dateString) return null;
//     try {
//         const date = new Date(dateString);
//         if (isNaN(date.getTime())) return dateString; 
//         return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
//     } catch (error) {
//         console.error("Error formatting date:", error);
//         return dateString;
//     }
// };

// function StatusBadge({ status }: { status: string }) {
//     let colorClasses = '';
//     let Icon = Clock;

//     switch (status?.toLowerCase()) {
//         case 'completed':
//         case 'success': // Assuming 'success' might be a status
//             colorClasses = 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
//             Icon = CheckCircle2;
//             break;
//         case 'failed':
//         case 'error': // Assuming 'error' might be a status
//             colorClasses = 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
//             Icon = XCircle;
//             break;
//         case 'pending':
//             colorClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
//             Icon = Clock;
//             break;
//         case 'processing':
//             colorClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
//             Icon = Loader2; // Using Loader2 for processing might need animation class
//             break;
//         default:
//             colorClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
//             Icon = Info;
//     }

//     return (
//         <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClasses}`}>
//             <Icon className={`h-4 w-4 mr-1.5 ${status?.toLowerCase() === 'processing' ? 'animate-spin' : ''}`} />
//             {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
//         </div>
//     );
// }


// function TransactionStatusContent() {
//     const router = useRouter();
//     const searchParams = useSearchParams();
//     const transactionRef = searchParams.get('ref');
//     const token = getAuthToken();
//     const receiptRef = useRef<HTMLDivElement>(null);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         if (!transactionRef) {
//             setError("Transaction reference is missing from URL.");
//             toast.error("Transaction reference missing.");
//             // Optional: redirect back or to transactions list after a delay
//             // setTimeout(() => router.push('/transactions'), 3000);
//         }
//     }, [transactionRef, router]);

//     const { data: transaction, isLoading, error: queryError } = useQuery<ITransaction | null, Error>({
//         queryKey: ['transactionStatus', transactionRef, token],
//         queryFn: async () => {
//             if (!token) throw new Error('Authentication required.');
//             if (!transactionRef) throw new Error('Transaction reference is required.');

//             const input: z.infer<typeof getSingleTransactionSchema> = { token, reference: transactionRef };
//             const response = await getSingleTransaction(input);

//             if (response.error) {
//                 throw new Error((response.error as Error).message || 'Failed to fetch transaction details.');
//             }
//             // Assuming the API returns { data: { data: ITransaction[] | ITransaction } }
//             // Adjust based on the actual structure. If it's always an array for single fetch:
//             const nestedData = response.data?.data;
//             if (Array.isArray(nestedData)) {
//                 return nestedData[0] || null; // Return the first transaction or null if array is empty
//             } else if (nestedData) {
//                  return nestedData as ITransaction; // Return the object if it's not an array
//             } 
//             return null; // Return null if no data found
//         },
//         enabled: !!token && !!transactionRef, 
//         retry: 1, 
//         refetchInterval: (data) => { // data here is ITransaction | null
//             return status === 'pending' || status === 'processing' ? 5000 : false; 
//         },
//     });

//     const displayError = error || queryError?.message;

//     const handlePrintReceipt = () => {
//         if (receiptRef.current) {
//             const printWindow = window.open('', '', 'height=600,width=800');
//             if (printWindow) {
//                 printWindow.document.write('<html><head><title>Transaction Receipt</title>');
//                 // Add more robust styling here if needed
//                 printWindow.document.write('<style>body{font-family: sans-serif; padding: 20px;} .receipt-item{display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;} .label{color: #555;} .value{font-weight: bold;}</style>');
//                 printWindow.document.write('</head><body>');
//                 printWindow.document.write('<h1>Transaction Receipt</h1>');
//                 printWindow.document.write(receiptRef.current.innerHTML);
//                 printWindow.document.write('</body></html>');
//                 printWindow.document.close();
//                 printWindow.focus();
//                  // Timeout helps ensure content is loaded before print dialog
//                 setTimeout(() => {
//                   printWindow.print();
//                   printWindow.close();
//                 }, 250);
//             } else {
//                 toast.error("Could not open print window. Please check your browser settings.");
//             }
//         } else {
//             toast.error("Receipt content not available.");
//         }
//     };


//     return (
//         <div className="min-h-screen bg-white dark:bg-black p-4 relative overflow-hidden">
//             {/* Background elements */}
//             <div className="absolute inset-0 overflow-hidden pointer-events-none">
//                 <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-gray-100 dark:bg-gray-900 opacity-30 rounded-full blur-3xl"></div>
//                 <div className="absolute top-[50%] right-[20%] w-[30%] h-[30%] bg-gray-200 dark:bg-gray-800 opacity-30 rounded-full blur-3xl"></div>
//                 <div className="absolute bottom-[10%] left-[30%] w-[40%] h-[30%] bg-gray-100 dark:bg-gray-900 opacity-30 rounded-full blur-3xl"></div>
//             </div>

//             <div className="max-w-4xl mx-auto space-y-8 relative z-10">
//                 <div className="flex items-center space-x-4">
//                     <Button
//                         type="button"
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => router.back()}
//                         className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
//                         aria-label="Go back"
//                     >
//                         <ArrowLeft className="h-4 w-4" />
//                     </Button>
//                     <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
//                         Transaction Status
//                     </h1>
//                 </div>

//                 {displayError && (
//                     <Alert variant="destructive">
//                         <Info className="h-4 w-4" />
//                         <AlertTitle>Error</AlertTitle>
//                         <AlertDescription>{displayError}</AlertDescription>
//                     </Alert>
//                 )}

//                 {isLoading && !displayError && (
//                     <Card className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800">
//                         <CardContent className="pt-6 flex items-center justify-center space-x-2">
//                             <Loader2 className="h-5 w-5 animate-spin text-gray-500 dark:text-gray-400" />
//                             <p className="text-gray-500 dark:text-gray-400">Loading transaction details...</p>
//                         </CardContent>
//                     </Card>
//                 )}

//                 {!isLoading && transaction && (
//                     <>
//                         <Card className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800">
//                             <CardHeader>
//                                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                                     <div>
//                                         <CardTitle className="text-2xl font-bold text-black dark:text-white">
//                                             Reference: {transaction.reference}
//                                         </CardTitle>
//                                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                                             Status updated: {formatDateTime(transaction.updatedAt)}
//                                         </p>
//                                     </div>
//                                     <StatusBadge status={transaction.status} />
//                                 </div>
//                             </CardHeader>
//                             <CardContent className="space-y-4 divide-y divide-gray-200 dark:divide-gray-700">
//                                 {/* Receipt Data Container (Hidden for Print) */}
//                                 <div ref={receiptRef} style={{ display: 'none' }}>
//                                     <h2>Transaction Details</h2>
//                                     <div className="receipt-item">
//                                         <span className='label'>Reference:</span> <span className='value'>{transaction.reference}</span>
//                                     </div>
//                                     <div className="receipt-item">
//                                         <span className='label'>Status:</span> <span className='value'>{transaction.status}</span>
//                                     </div>
//                                      <div className="receipt-item">
//                                         <span className='label'>Date:</span> <span className='value'>{formatDateTime(transaction.createdAt)}</span>
//                                     </div>
//                                     <div className="receipt-item">
//                                         <span className='label'>Amount:</span> <span className='value'>{formatCurrency(transaction.amount, transaction.currency)}</span> {/* Adjust currency source if needed */}
//                                     </div>
//                                     {/* Access beneficiary details safely */}
//                                     {transaction.beneficiary && (
//                                         <>
//                                              <div className="receipt-item">
//                                                 <span className='label'>Recipient:</span> <span className='value'>{transaction.beneficiary.beneficiaryName}</span>
//                                              </div>
//                                              <div className="receipt-item">
//                                                 <span className='label'>Recipient Account:</span> <span className='value'>{transaction.beneficiary.beneficiaryAccountNumber}</span>
//                                              </div>
//                                              <div className="receipt-item">
//                                                 <span className='label'>Destination:</span> <span className='value'>{transaction.beneficiary.destinationCountry} / {transaction.beneficiary.destinationCurrency}</span>
//                                              </div>
//                                         </>
//                                     )}
//                                      {transaction. && (
//                                         <div className="receipt-item">
//                                             <span className='label'>Narration:</span> <span className='value'>{transaction.narration}</span>
//                                         </div>
//                                     )}
//                                      <div className="receipt-item">
//                                         <span className='label'>Fee:</span> <span className='value'>{formatCurrency(transaction.fee || 0, transaction.currency)}</span>
//                                     </div>
//                                 </div>

//                                 {/* Displayed Details */}
//                                 <div className="pt-4">
//                                     <DetailItem label="Date Initiated" value={formatDateTime(transaction.createdAt)} />
//                                     {/* Adjust currency source if needed, maybe from beneficiary? */}
//                                     <DetailItem label="Amount Sent" value={formatCurrency(transaction.amount, transaction.currency || transaction.beneficiary?.destinationCurrency || 'USD')} />
//                                     {transaction.fee !== undefined && transaction.fee !== null && (
//                                         <DetailItem label="Transfer Fee" value={formatCurrency(transaction.fee, transaction.currency || transaction.beneficiary?.destinationCurrency || 'USD')} />
//                                     )}
//                                     {/* Access beneficiary details safely */}
//                                     {transaction.beneficiary && (
//                                         <>
//                                              <DetailItem label="Recipient Name" value={transaction.beneficiary.beneficiaryName} />
//                                              <DetailItem label="Recipient Account" value={`...${transaction.beneficiary.beneficiaryAccountNumber?.slice(-4)}`} />
//                                              <DetailItem label="Destination Country" value={transaction.beneficiary.destinationCountry} />
//                                              <DetailItem label="Destination Currency" value={transaction.beneficiary.destinationCurrency} />
//                                         </>
//                                     )}
//                                     {transaction.narration && (
//                                         <DetailItem label="Narration" value={transaction.narration} className="text-wrap" />
//                                     )}
//                                      {/* Add other fields from ITransaction if available and relevant */}
//                                      {/* Example: <DetailItem label="Provider Reference" value={transaction.provider_ref} /> */}

//                                 </div>
//                             </CardContent>
//                              <CardFooter className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
//                                 <Button
//                                     variant="outline"
//                                     onClick={handlePrintReceipt}
//                                     disabled={!transaction || transaction.status?.toLowerCase() === 'failed'}
//                                     className="w-full sm:w-auto"
//                                 >
//                                     <Download className="mr-2 h-4 w-4" /> Download Receipt
//                                 </Button>
//                                 <Button
//                                     variant="outline"
//                                     onClick={() => router.push('/transactions')}
//                                     className="w-full sm:w-auto"
//                                 >
//                                     <Receipt className="mr-2 h-4 w-4" /> View All Transactions
//                                 </Button>
//                                  <Button
//                                     onClick={() => router.push('/send-money')}
//                                      className="w-full sm:w-auto"
//                                 >
//                                     Make Another Transfer
//                                 </Button>
//                             </CardFooter>
//                         </Card>

//                          {/* Info box based on status */}
//                         {transaction?.status?.toLowerCase() === 'pending' || transaction?.status?.toLowerCase() === 'processing' ? (
//                             <Alert variant="default" className="mt-6">
//                                 <Clock className="h-4 w-4" />
//                                 <AlertTitle>Processing</AlertTitle>
//                                 <AlertDescription>
//                                     Your transfer is currently being processed. The status will update automatically.
//                                 </AlertDescription>
//                             </Alert>
//                         ) : transaction?.status?.toLowerCase() === 'failed' ? (
//                              <Alert variant="destructive" className="mt-6">
//                                 <XCircle className="h-4 w-4" />
//                                 <AlertTitle>Transfer Failed</AlertTitle>
//                                 <AlertDescription>
//                                     Unfortunately, your transfer could not be completed. Please contact support if the issue persists.
//                                     {/* You might want to add specific error messages from the transaction data if available */}
//                                     {/* {transaction.failureReason && ` Reason: ${transaction.failureReason}`} */}
//                                 </AlertDescription>
//                             </Alert>
//                         ) : null}
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }


// // Wrap the component in Suspense for useSearchParams
// export default function TransactionStatusPage() {
//     return (
//         <Suspense fallback={<div>Loading...</div>}>
//             <TransactionStatusContent />
//         </Suspense>
//     );
// }

export default function TransactionStatusPage() {
    return <div>Transaction Status</div>;
}
