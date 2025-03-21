export interface AuthResponse {
    success: boolean;
    data: {
      _id: string;
      created_at: string;
      last_login: string;
      updated_at: string;
      email: string;
      user_type: string;
      full_name: string;
      phone_number: string;
      organization_id: string;
      organizations: Array<{
        organization_id: string;
        organization_name: string;
        role: string;
        status: string;
        permissions: Record<string, unknown>;
        permission_configuration: {
          seek_approval_from_users: {
            user_id: string;
          };
        };
      }>;
      organization: {
        _id: string;
        name: string;
        email: string;
        created_at: string;
        updated_at: string;
        environment: string;
        public_key_live: string;
        secret_key_test: string;
        public_key_test: string;
        status: string;
        business_category: string;
        country: string;
        business_address: string;
        address: {
          street: string;
          city: string;
          state: string;
          country: string;
        };
        enabled_provider: boolean;
        rc_number: string;
        entity_type: string;
        created_by: string;
        archived: boolean;
        verified_kyb: boolean;
        preference: {
          settled_to_bank: boolean;
        };
        enabled_products: null | unknown;
        distributor_id: string;
      };
      meta_data: null | unknown;
      verified: boolean;
      access_code: string;
      operator_account_id: string;
      operator_type: string;
      accepted_terms: boolean;
      guide: {
        enabled_provider: boolean;
      };
      verified_mail: boolean;
      product_use_case: string;
      distributor_name: string;
      secure_pin: Record<string, unknown>;
      has_pin: boolean;
      device_token: string;
    };
    message: string;
    token: string;
  }
  
  export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    createdAt: string;
    updatedAt: string;
  }
  

  export interface ConversionResponse {
    status: string;
    message: string;
    data: {
      sourceCurrency: string;
      sourceAmount: number;
      destinationCurrency: string;
      destinationAmount: number;
      rate: number;
      fee: number;
    };
  }
  

  export interface CollectionAccountResponse {
    status: string;
    message: string;
    data: {
      accountNumber: string;
      accountName: string;
      bankName: string;
      reference: string;
      expiresAt: string;
    };
  }
  
 
  export interface PaymentVerificationResponse {
    status: string;
    message: string;
    data: {
      verified: boolean;
      amount: number;
      currency: string;
      reference: string;
      transactionDate: string;
    };
  }
  

  export interface BeneficiaryResponse {
    status: string;
    message: string;
    data: {
      id: string;
      beneficiaryName: string;
      beneficiaryAlias?: string;
      beneficiaryAddress: string;
      beneficiaryCity: string;
      beneficiaryState: string;
      beneficiaryPostcode: string;
      beneficiaryCountryCode: string;
      beneficiaryEmail?: string;
      beneficiaryContactNumber?: string;
      beneficiaryAccountType: 'Individual' | 'Corporate';
      beneficiaryBankAccountType: 'Current' | 'Saving' | 'Maestra' | 'Checking';
      beneficiaryAccountNumber: string;
      beneficiaryBankName: string;
      beneficiaryBankCode?: string;
      destinationCountry: string;
      destinationCurrency: string;
      payoutMethod: string;
      routingCodeType1?: string;
      routingCodeValue1?: string;
      createdAt: string;
      updatedAt: string;
    };
  }
  

  export interface PayoutResponse {
    status: string;
    message: string;
    data: {
      id: string;
      amount: number;
      fee: number;
      totalAmount: number;
      narration: string;
      reference: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      beneficiaryId: string;
      sourceOfFunds: string;
      purposeCode: string;
      createdAt: string;
      updatedAt: string;
    };
  }
  

  export interface Transaction {
    id: string;
    amount: number;
    fee: number;
    totalAmount: number;
    narration: string;
    reference: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    beneficiaryId: string;
    beneficiary: {
      beneficiaryName: string;
      destinationCountry: string;
      destinationCurrency: string;
      beneficiaryAccountNumber: string;
    };
    createdAt: string;
    updatedAt: string;
  }
  
  export interface TransactionsResponse {
    status: string;
    message: string;
    data: {
      transactions: Transaction[];
      meta: {
        total: number;
        page: number;
        limit: number;
      };
    };
  }
  
  export interface TransactionResponse {
    status: string;
    message: string;
    data: Transaction;
  }
  
  export interface TransactionStatusResponse {
    status: string;
    message: string;
    data: {
      status: 'pending' | 'processing' | 'completed' | 'failed';
      updatedAt: string;
    };
  }
  
  
  export type SourceOfFunds = 
    | 'Salary' 
    | 'Personal Savings' 
    | 'Personal Wealth' 
    | 'Retirement Funds' 
    | 'Business Owner/Shareholder' 
    | 'Loan Facility' 
    | 'Personal Account' 
    | 'Corporate Account';
  
  export type PurposeCode = 
    | 'IR001' | 'IR002' | 'IR003' | 'IR004' | 'IR005' | 'IR006' | 'IR007' | 'IR008' 
    | 'IR009' | 'IR010' | 'IR011' | 'IR012' | 'IR013' | 'IR014' | 'IR015' | 'IR016' 
    | 'IR017' | 'IR01801' | 'IR01802' | 'IR01803' | 'IR01804' | 'IR01805' | 'IR01806' 
    | 'IR01807' | 'IR01808' | 'IR01809' | 'IR01810' | 'IR01811'; 


    export interface IValidationError {
        field: string;
        rule: string;
        message: string;
      }
      
      export interface IApiError extends Error {
        code: string;
        message: string;
      }
      
      export interface IApiResponse<T> {
        data?: T;
        validationErrors?: IValidationError[];
        error?: Error;
      }

export interface IUser {
  id: string;
  full_name: string;
  phone_number: string;
  organization_id: string;
  email: string;
  country: string;
  group: string;
  status: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  kyc_tier: string;
  date_of_birth: string;
  customer_type: string;
  source: string;
  address: {
    street: string;
  };
}

export interface ICreateUserResponse {
  success: boolean;
  data: IUser;
  message: string;
}

export interface IOrganizationPermissionConfig {
  seek_approval_from_users: {
    user_id: string;
  };
}

export interface IUserOrganization {
  organization_id: string;
  organization_name: string;
  role: string;
  status: string;
  permissions: Record<string, unknown>;
  permission_configuration: IOrganizationPermissionConfig;
}

export interface IOrganizationAddress {
  street: string;
  city: string;
  state: string;
  country: string;
}

export interface IOrganizationPreference {
  settled_to_bank: boolean;
}

export interface IOrganization {
  _id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  environment: string;
  public_key_live: string;
  secret_key_test: string;
  public_key_test: string;
  status: string;
  business_category: string;
  country: string;
  business_address: string;
  address: IOrganizationAddress;
  enabled_provider: boolean;
  rc_number: string;
  entity_type: string;
  created_by: string;
  archived: boolean;
  verified_kyb: boolean;
  preference: IOrganizationPreference;
  enabled_products: null | unknown;
  distributor_id: string;
}

export interface IUserGuide {
  enabled_provider: boolean;
}

export interface ILoginResponseData {
  _id: string;
  created_at: string;
  last_login: string;
  updated_at: string;
  email: string;
  user_type: string;
  full_name: string;
  phone_number: string;
  organization_id: string;
  organizations: IUserOrganization[];
  organization: IOrganization;
  meta_data: null | unknown;
  verified: boolean;
  access_code: string;
  operator_account_id: string;
  operator_type: string;
  accepted_terms: boolean;
  guide: IUserGuide;
  verified_mail: boolean;
  product_use_case: string;
  distributor_name: string;
  secure_pin: Record<string, unknown>;
  has_pin: boolean;
  device_token: string;
}

export interface ILoginResponse {
  success: boolean;
  data: ILoginResponseData;
  message: string;
  token: string;
}


export interface IExchangeRateResponse {
    success: boolean;
    data: {
        amount: number;
        provider_name: string;
    };
    message: string;
}

export interface ICollectionAccount {
    accountName: string;
    accountNumber: string;
    bankName: string;
    reference: string;
}
      

export interface ICollectionAccountResponse {
    success: boolean;
    data: {
        "account name": string;
        "account number": string;
        bankName: string;
        reference: string;
    };
    message: string;
}

export interface IConversion {
  sourceCurrency: string;
  sourceAmount: number;
  destinationCurrency: string;
  destinationAmount: number;
  rate: number;
  fee: number;
  provider_name: string;
  amount: number;
}


export interface IVerifyPaymentResponse {
  success: boolean;
  message: string;
}

export interface IBankData {
  bank_name: string;
  short_code: string;
  bank_code: string;
}

export interface IBankListResponse {
  success: boolean;
  data: IBankData[];
  message: string;
}

export interface ITransferResponse {
  success: boolean;
  message: string;
}


export interface IResolveAccountResponse {
  success: boolean;
  data: {
    account_number: string;
    account_name: string;
  };
  message: string;
}

export interface ITransaction {
  transaction_id: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}


export interface ITransactionResponse {
  success: boolean;
  data: ITransaction[];
  message: string;
}
export interface ICustomer {
  id: string;
  email: string;
  status: string;
  kyc_tier: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  customer_type: string;
  address: string;
  dob: string;
}

export interface IAccount {
  id: string;
  name: string;
  preferred_bank: string;
  kyc_tier: string;
  created_at: string;
  updated_at: string;
  status: string;
  organization_id: string;
  balance: number;
  currency: string;
  frequency: number;
  meta_data: null | unknown;
  customer_id: string;
  customer: ICustomer;
  account_number: string;
  bank_name: string;
  type: string;
  collection_account: boolean;
  hide_account: boolean;
  SkipNumber: boolean;
  managers: null | unknown;
  external_account: Record<string, unknown>;
  alias: string;
  collection_rules: Record<string, unknown>;
}

export interface IAccountResponse {
  success: boolean;
  data: IAccount;
  message: string;
}

export interface ITransferFeeResponse {
  success: boolean;
  data: {
    transaction_fee: number;
    transaction_vat: number;
  };
  message: string;
}



