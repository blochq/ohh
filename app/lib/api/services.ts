import { apiRequest } from './client';
import {
  AuthResponse,
  ConversionResponse,
  CollectionAccountResponse,
  PaymentVerificationResponse,
  BeneficiaryResponse,
  PayoutResponse,
  TransactionsResponse,
  TransactionResponse,
  TransactionStatusResponse,
  SourceOfFunds,
  PurposeCode
} from './types';

// Auth Service
export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/v1/users/auth', {
      method: 'POST',
      body: { email, password },
      requiresAuth: false
    });

    // Save token and user data if login was successful
    if (response.success && response.token) {
      authService.saveAuthToken(response.token);
      
      // Save user details to localStorage for personalization
      if (typeof window !== 'undefined' && response.data) {
        localStorage.setItem('user_data', JSON.stringify({
          id: response.data._id,
          email: response.data.email,
          fullName: response.data.full_name,
          phoneNumber: response.data.phone_number,
          organizationId: response.data.organization_id,
          organizationName: response.data.organization?.name || '',
          lastLogin: response.data.last_login
        }));
      }
    }

    return response;
  },
  
  // Store token in localStorage after successful login
  saveAuthToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },
  
  // Clear token on logout
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('auth_token');
    }
    return false;
  },
  
  // Get user data from localStorage
  getUserData: (): Record<string, unknown> | null => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          return null;
        }
      }
    }
    return null;
  }
};

// Define the beneficiary data interface
interface BeneficiaryData {
  currency: string;
  beneficiaryAccountType: 'Individual' | 'Corporate';
  beneficiaryBankAccountType: 'Current' | 'Saving' | 'Maestra' | 'Checking';
  beneficiaryName: string;
  beneficiaryAddress: string;
  beneficiaryCity: string;
  beneficiaryState: string;
  beneficiaryPostcode: string;
  beneficiaryAccountNumber: string;
  destinationCurrency: string;
  destinationCountry: string;
  payoutMethod: string;
  routingCodeType1?: string;
  routingCodeValue1?: string;
  beneficiaryAlias?: string;
  beneficiaryCountryCode?: string;
  beneficiaryEmail?: string;
  beneficiaryContactNumber?: string;
  remitterBeneficiaryRelationship?: string;
  beneficiaryBankName?: string;
  beneficiaryBankCode?: string;
  beneficiaryIdentificationType?: string;
  beneficiaryIdentificationValue?: string;
}

// Define the payout data interface
interface PayoutData {
  beneficiaryId: string;
  amount: number;
  narration: string;
  sourceOfFunds: SourceOfFunds;
  purposeCode: PurposeCode;
}

// Payment Service
export const paymentService = {
  // P2: Calculate amount
  calculateAmount: async (currency: string, amount: number): Promise<ConversionResponse> => {
    try {
      // Call the API endpoint
      return await apiRequest<ConversionResponse>(`/v1/otc/new-convert-amount/${currency}/${amount}`, {
        method: 'GET'
      });
    } catch (error) {
      console.error('Error calculating amount:', error);
      throw error;
    }
  },
  
  // P2.1: Create collection account
  requestCollectionAccount: async (providerName: string, amount: number): Promise<CollectionAccountResponse> => {
    try {
      // Call the API endpoint
      return await apiRequest<CollectionAccountResponse>(`/v1/otc/request-account/${providerName}/${amount}`, {
        method: 'POST',
        body: {}
      });
    } catch (error) {
      console.error('Error requesting collection account:', error);
      throw error;
    }
  },
  
  // P3: Verify payment
  verifyPayment: async (reference: string, amount: number): Promise<PaymentVerificationResponse> => {
    try {
      // Call the API endpoint
      return await apiRequest<PaymentVerificationResponse>(`/v1/otc/complete-payment/${reference}/verification/${amount}`, {
        method: 'POST',
        body: { reference }
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },
  
  // P5: Create beneficiary
  createBeneficiary: async (beneficiaryData: BeneficiaryData): Promise<BeneficiaryResponse> => {
    // Format the data to match the API's expected format
    const formattedData: Record<string, unknown> = {
      currency: beneficiaryData.currency,
      beneficiary_account_type: beneficiaryData.beneficiaryAccountType,
      beneficiary_bank_account_type: beneficiaryData.beneficiaryBankAccountType,
      beneficiary_name: beneficiaryData.beneficiaryName,
      beneficiary_address: beneficiaryData.beneficiaryAddress,
      beneficiary_city: beneficiaryData.beneficiaryCity,
      beneficiary_state: beneficiaryData.beneficiaryState,
      beneficiary_postcode: beneficiaryData.beneficiaryPostcode,
      beneficiary_account_number: beneficiaryData.beneficiaryAccountNumber,
      destination_currency: beneficiaryData.destinationCurrency,
      destination_country: beneficiaryData.destinationCountry,
      payout_method: beneficiaryData.payoutMethod
    };
    
    // Add optional fields if they exist
    if (beneficiaryData.routingCodeType1) {
      formattedData['routing_code_type1'] = beneficiaryData.routingCodeType1;
    }
    
    if (beneficiaryData.routingCodeValue1) {
      formattedData['routing_code_value1'] = beneficiaryData.routingCodeValue1;
    }
    
    if (beneficiaryData.beneficiaryAlias) {
      formattedData['beneficiary_alias'] = beneficiaryData.beneficiaryAlias;
    }
    
    if (beneficiaryData.beneficiaryCountryCode) {
      formattedData['beneficiary_country_code'] = beneficiaryData.beneficiaryCountryCode;
    }
    
    if (beneficiaryData.beneficiaryEmail) {
      formattedData['beneficiary_email'] = beneficiaryData.beneficiaryEmail;
    }
    
    if (beneficiaryData.beneficiaryContactNumber) {
      formattedData['beneficiary_contact_number'] = beneficiaryData.beneficiaryContactNumber;
    }
    
    if (beneficiaryData.remitterBeneficiaryRelationship) {
      formattedData['remitter_beneficiary_relationship'] = beneficiaryData.remitterBeneficiaryRelationship;
    }
    
    if (beneficiaryData.beneficiaryBankName) {
      formattedData['beneficiary_bank_name'] = beneficiaryData.beneficiaryBankName;
    }
    
    if (beneficiaryData.beneficiaryBankCode) {
      formattedData['beneficiary_bank_code'] = beneficiaryData.beneficiaryBankCode;
    }
    
    if (beneficiaryData.beneficiaryIdentificationType) {
      formattedData['beneficiary_identification_type'] = beneficiaryData.beneficiaryIdentificationType;
    }
    
    if (beneficiaryData.beneficiaryIdentificationValue) {
      formattedData['beneficiary_identification_value'] = beneficiaryData.beneficiaryIdentificationValue;
    }
    
    return apiRequest<BeneficiaryResponse>('/v1/beneficiaries', {
      method: 'POST',
      body: formattedData
    });
  },
  
  // P6: Initiate payout
  initiatePayout: async (payoutData: PayoutData): Promise<PayoutResponse> => {
    // Ensure the data is properly formatted
    const formattedData: Record<string, unknown> = {
      beneficiary_id: payoutData.beneficiaryId,
      amount: payoutData.amount,
      narration: payoutData.narration,
      source_of_funds: payoutData.sourceOfFunds,
      purpose_code: payoutData.purposeCode
    };
    
    return apiRequest<PayoutResponse>('/v1/transfers/payouts', {
      method: 'POST',
      body: formattedData
    });
  }
};

// Transaction Service
export const transactionService = {
  // P1: Get all transactions
  getAllTransactions: async (page: number = 1, limit: number = 10): Promise<TransactionsResponse> => {
    return apiRequest<TransactionsResponse>(`/v1/transactions/all-payout?page=${page}&limit=${limit}`, {
      method: 'GET'
    });
  },
  
  // P2: Get all transactions by status
  getAllTransactionsByStatus: async (): Promise<TransactionsResponse> => {
    return apiRequest<TransactionsResponse>('/v1/transactions/verify/all-payout-status', {
      method: 'GET'
    });
  },
  
  // P3: Get a single transaction
  getTransaction: async (id: string): Promise<TransactionResponse> => {
    return apiRequest<TransactionResponse>(`/v1/transactions/retrieve/payouts/${id}`, {
      method: 'GET'
    });
  },
  
  // P4: Get a single transaction status
  getTransactionStatus: async (id: string): Promise<TransactionStatusResponse> => {
    return apiRequest<TransactionStatusResponse>(`/v1/transactions/payout-status/${id}`, {
      method: 'GET'
    });
  }
}; 