export interface Beneficiary {
  beneficiaryName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  country: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'processing' | 'failed';
  createdAt: string;
  updatedAt: string;
  beneficiary?: Beneficiary;
  description?: string;
  reference: string;
}

export interface TransactionResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
  };
  message: string;
} 