'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { usePaymentContext } from '@/context/payment-context';
import { ArrowRight, ArrowLeft, RotateCw, Search, Printer } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getBankList, resolveAccount, transfer } from '@/lib/api-calls';
import { getAuthToken } from '@/lib/helper-function';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { resolveAccountSchema, TransferFormData } from '@/lib/dto';
import { transferSchema } from '@/lib/dto';



interface ReceiptData {
  date: string;
  transactionId: string;
  sender: {
    name: string;
  };
  recipient: {
    name: string;
    bank: string;
    accountNumber: string;
  };
  amount: {
    sent: number;
    sentCurrency: string;
    received: number;
    receivedCurrency: string;
    exchangeRate: number;
  };
  fee: number;
  status: string;
}



export default function RecipientPage() {
  const router = useRouter();
  const receiptRef = useRef<HTMLDivElement>(null);
  const { updateActivity, accountData, conversionData, exchangeRateData } = usePaymentContext();
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [bankCode, setBankCode] = useState<string>('');
  const [accountName, setAccountName] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  

  React.useEffect(() => {
    if (!accountData || !conversionData) {
      router.push('/payment');
    }
  }, [accountData, conversionData, router]);
  
  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      account_number: "",
      bank_code: "",
      amount: conversionData?.amount || 0,
      narration: "",
      account_id: "",
      reference: accountData?.reference,
      token: "",
    },
  });
  

  const { data: bankListData, isLoading: isLoadingBanks } = useQuery({
    queryKey: ['bankList'],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const input = { token };
      const response = await getBankList(input);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.validationErrors && response.validationErrors.length > 0) {
        throw new Error(response.validationErrors[0].message);
      }
      
      if (!response.data) {
        throw new Error('Failed to fetch bank list');
      }
      
      return response.data;
    },
    enabled: !!getAuthToken(),
  });
  

  const resolveAccountMutation = useMutation({
    mutationFn: async (data: z.infer<typeof resolveAccountSchema>) => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const input = {
        account_number: data.account_number,
        bank_code: data.bank_code,
        token
      };
      
      const response = await resolveAccount(input);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.validationErrors && response.validationErrors.length > 0) {
        throw new Error(response.validationErrors[0].message);
      }
      
      if (!response.data) {
        throw new Error('Failed to resolve account');
      }
      
      return response.data;
    }
  });
  

  const transferMutation = useMutation({
    mutationFn: async (data: z.infer<typeof transferSchema>) => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      

      
      const response = await transfer(data);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.validationErrors && response.validationErrors.length > 0) {
        throw new Error(response.validationErrors[0].message);
      }
      
      return response;
    }
  });
  
 
  const handleBankChange = (value: string) => {
    const selectedBankData = bankListData?.data.find(bank => bank.bank_name === value);
    if (selectedBankData) {
      setBankCode(selectedBankData.bank_code);
      form.setValue('bank_code', value);
    }
  };
  
  
  const handleResolveAccount = async () => {
    const accountNumber = form.getValues('account_number');
    
    if (!accountNumber || accountNumber.length < 5) {
      setResolveError('Please enter a valid account number');
      return;
    }
    
    if (!bankCode) {
      setResolveError('Please select a bank first');
      return;
    }
    
    setResolveError(null);
    updateActivity();
    
    try {
      const result = await resolveAccountMutation.mutateAsync({
        account_number: accountNumber,
        bank_code: bankCode,
        token: getAuthToken() || ""
      });
      console.log("result", result);
      
      if (result.data.account_name) {
        setAccountName(result.data.account_name);
      
        toast.success(`Account resolved: ${result.data.account_name}`);
      } else {
        setResolveError('Could not resolve account name');
      }
    } catch (error) {
      if (error instanceof Error) {
        setResolveError(error.message);
      } else {
        setResolveError('Failed to resolve account');
      }
    }
  };
  
  
  const handleTransfer = async () => {
    const values = form.getValues();
    
    if (!accountData || !conversionData || !bankCode) {
      toast.error("Missing required data for transfer");
      return;
    }
    
    setIsTransferring(true);
    updateActivity();
    
    try {
      const result = await transferMutation.mutateAsync({
        account_number: values.account_number,
        bank_code: bankCode,
        amount: conversionData.destinationAmount || conversionData.amount || 0,
        narration: values.narration,
        account_id: "",
        reference: values.reference,
        token: getAuthToken() || ""
      });
      
      if (result.data) {
        setTransferSuccess(true);
        
    
        const receipt: ReceiptData = {
          date: new Date().toISOString(),
          transactionId: Math.random().toString(36).substring(2, 15), // Usually would come from API
          sender: {
            name: "You", // Would usually be from user profile
          },
          recipient: {
            name: accountName || "",
            bank: bankCode,
            accountNumber: values.account_number
          },
          amount: {
            sent: conversionData.amount || 0,
            sentCurrency: "NGN",
            received: conversionData.destinationAmount || conversionData.amount || 0,
            receivedCurrency: conversionData.sourceCurrency || "USD",
            exchangeRate: conversionData.rate || (exchangeRateData?.data?.amount || 0),
          },
          fee: conversionData.fee || 0,
          status: "Completed"
        };
        
        setReceiptData(receipt);
        toast.success("Transfer completed successfully!");
      } else {
        toast.error("Transfer failed. Please try again.");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsTransferring(false);
    }
  };
  
  // Handle print receipt
  const handlePrintReceipt = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Transfer Receipt</title>');
        printWindow.document.write('<style>body{font-family:Arial,sans-serif;padding:20px} .receipt{border:1px solid #ddd;padding:20px;max-width:600px;margin:0 auto} h1{color:#333;font-size:24px;text-align:center} .logo{text-align:center;margin-bottom:20px} .info-row{display:flex;justify-content:space-between;margin-bottom:10px;border-bottom:1px solid #eee;padding-bottom:10px} .info-label{font-weight:bold;color:#555} .info-value{text-align:right} .amount{font-size:18px;color:#000;font-weight:bold} .footer{margin-top:30px;text-align:center;font-size:12px;color:#777} .status{text-align:center;margin:20px 0;padding:5px;font-weight:bold;color:white;background:#4CAF50}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(receiptRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">
      {!transferSuccess ? (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 bg-clip-text text-transparent">
              Recipient Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Enter the bank account details to complete your transfer
            </p>
          </div>
    
          <div className="mb-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center w-full max-w-xs">
                <div className="flex-1">
                  <div className="w-full bg-blue-600 h-1 rounded-full"></div>
                </div>
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white flex items-center justify-center text-sm font-medium shadow-md">
                    3
                  </div>
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 text-center font-medium">
                    Recipient
                  </div>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          
          <Card className="border-gray-200 dark:border-gray-800 shadow-md">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleTransfer)} className="space-y-8">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-900 dark:text-gray-100 border-b pb-2">
                    Bank Account Details
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {resolveError && (
                    <Alert variant="destructive">
                      <AlertDescription>{resolveError}</AlertDescription>
                    </Alert>
                  )}
                  
            
                  {conversionData && (
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">Transaction Summary</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-500 dark:text-gray-400">Sending:</div>
                        <div className="font-medium text-right">{conversionData.sourceAmount || 0} {conversionData.sourceCurrency || "USD"}</div>
                        
                        <div className="text-gray-500 dark:text-gray-400">Recipient gets:</div>
                        <div className="font-medium text-right">{conversionData.destinationAmount || conversionData.amount || 0} NGN</div>
                        
                        <div className="text-gray-500 dark:text-gray-400">Exchange rate:</div>
                        <div className="font-medium text-right">1 {conversionData.sourceCurrency || "USD"} = {conversionData.rate || (exchangeRateData?.data?.amount || 0)} NGN</div>
                        
                        {conversionData.fee > 0 && (
                          <>
                            <div className="text-gray-500 dark:text-gray-400">Fee:</div>
                            <div className="font-medium text-right">{conversionData.fee} {conversionData.sourceCurrency || "USD"}</div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="bank_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <Select onValueChange={handleBankChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              {isLoadingBanks ? (
                                <div className="flex items-center">
                                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                                  <span>Loading banks...</span>
                                </div>
                              ) : (
                                <SelectValue placeholder="Select bank" />
                              )}
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bankListData?.data?.map((bank) => (
                              <SelectItem key={bank.bank_name} value={bank.bank_code}>
                                {bank.bank_name}
                              </SelectItem>
                            )) || (
                              <SelectItem value="loading" disabled>
                                No banks available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="account_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <div className="flex space-x-2">
                            <FormControl className="flex-1">
                              <Input 
                                placeholder="Enter account number" 
                                {...field} 
                              />
                            </FormControl>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={handleResolveAccount}
                              disabled={resolveAccountMutation.isPending || !bankCode}
                            >
                              {resolveAccountMutation.isPending ? (
                                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Search className="mr-2 h-4 w-4" />
                              )}
                              Resolve
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                      />
                    
                      <p className='text-gray-500 dark:text-gray-400 text-sm'>{accountName}</p>
                    
                  
                  </div>
                  <FormField
                    control={form.control}
                    name="narration"
                    render={({   field }) => (
                      <FormItem>
                        <FormLabel>Narration</FormLabel>
                        <FormControl> 
                          <Input
                            type="text"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
              
                </CardContent>
                
                <CardFooter className="flex flex-col border-t pt-6 space-y-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    By clicking &quot;Transfer&quot;, you confirm that these account details are correct and you wish to proceed with the transaction.
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 w-full">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/payment/verify')}
                      className="w-full sm:w-auto"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    
                    <Button
                      type="submit"
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                      disabled={!accountName || isTransferring}
                    >
                      {isTransferring ? (
                        <>
                          <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Transfer
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-500 to-green-700 dark:from-green-400 dark:to-green-600 bg-clip-text text-transparent">
              Transfer Successful!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Your transfer has been completed successfully
            </p>
          </div>
          
          {receiptData && (
            <>
              <Card className="border-gray-200 dark:border-gray-800 shadow-md overflow-hidden" ref={receiptRef}>
                <div className="receipt">
                  <div className="logo py-4 text-center border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transfer Receipt</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Transaction ID: {receiptData.transactionId}</p>
                  </div>
                  
                  <CardContent className="pt-6 space-y-6">
                    <div className="status bg-green-600 text-white text-center py-2 rounded-md font-medium">
                      {receiptData.status}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Date & Time</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {new Date(receiptData.date).toLocaleDateString()} {new Date(receiptData.date).toLocaleTimeString()}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Transaction Type</h3>
                        <p className="text-gray-600 dark:text-gray-400">International Transfer</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 my-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-4">Amount</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">You sent</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{receiptData.amount.sent} {receiptData.amount.sentCurrency}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">Recipient gets</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{receiptData.amount.received} {receiptData.amount.receivedCurrency}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Exchange rate:</span>
                          <span className="text-gray-600 dark:text-gray-300">1 {receiptData.amount.sentCurrency} = {receiptData.amount.exchangeRate} {receiptData.amount.receivedCurrency}</span>
                        </div>
                        
                        {receiptData.fee > 0 && (
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-500 dark:text-gray-400">Fee:</span>
                            <span className="text-gray-600 dark:text-gray-300">{receiptData.fee} {receiptData.amount.sentCurrency}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Recipient</h3>
                        <p className="text-gray-900 dark:text-white font-medium">{receiptData.recipient.name}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{receiptData.recipient.bank}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Account: {receiptData.recipient.accountNumber}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
                      <p>Thank you for using our services.</p>
                      <p className="mt-1">If you have any questions, please contact our support.</p>
                    </div>
                  </CardContent>
                </div>
              </Card>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
                <Button
                  type="button" 
                  variant="outline"
                  onClick={handlePrintReceipt}
                  className="w-full sm:w-auto"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Receipt
                </Button>
                
                <Button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full sm:w-auto bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
} 