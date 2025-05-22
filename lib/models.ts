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
  _id: string;
  created_at: string;
  last_login: string;
  updated_at: string;
  email: string;
  user_type: string;
  full_name: string;
  phone_number?: string;
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
  product_use_case?: string;
  distributor_name?: string;
  secure_pin: Record<string, unknown>;
  has_pin: boolean;
  device_token?: string;
  id?: string;
  first_name?: string;
  last_name?: string;
  country?: string;
  group?: string;
  status?: string;
  kyc_tier?: string;
  date_of_birth?: string;
  customer_type?: string;
  source?: string;
  address?: {
    street: string;
  };
}

export interface ICreateUserResponse {
  success: boolean;
  data: IUser;
  message: string;
  token: string;
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
  _id: string;
  organization_id: string;
  tracking_id: string;
  currency: string;
  status: string;
  type: string;
  offer_rate: number;
  created_at: string;
  updated_at: string;
  invoice?: string;
  user_id: string;
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



export interface ICustomerUpgradeResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    status: string;
    kyc_tier: string;
    dob: string;
    gender: string;
    place_of_birth: string;
    updated_at: string;
  };
  message: string;
}

export interface IKycIdentityResponse {
  success: boolean;
  data: {
    id: string;
    status: string;
    verification_status: string;
    verification_message: string;
    customer_id: string;
    id_type: string;
    id_number: string;
    created_at: string;
  };
  message: string;
}

export interface IUpgradeTierResponse {
  success: boolean;
  data: {
    id: string;
    kyc_tier: string;
    status: string;
    updated_at: string;
  };
  message: string;
}

export interface IBeneficiary {
  _id: string;
  organization_id?: string;
  user_id?: string;
  environment?: string;
  currency: string;
  beneficiary_account_number: string;
  beneficiary_bank_code?: string;
  client_legal_entity?: string;
  beneficiary_account_type: string;
  beneficiary_bank_account_type?: string;
  beneficiary_country_code?: string;
  beneficiary_contact_number?: string;
  beneficiary_name: string;
  beneficiary_email?: string;
  beneficiary_address: string;
  beneficiary_city: string;
  beneficiary_state: string;
  destination_country: string;
  beneficiary_postcode: string;
  destination_currency: string;
  payout_method: string;
  routing_code_type1?: string;
  routing_code_value1?: string;
  routing_code_type2?: string;
  routing_code_value2?: string;
  created_at: string;
  updated_at: string;
}

export interface IBeneficiaryResponse {
  success: boolean;
  data: IBeneficiary;
  message: string;
}

export interface IBeneficiariesResponse {
  success: boolean;
  data: IBeneficiary[];
  message: string;
}

export interface ITransferPayoutResponse {
  success: boolean;
  data: {
    beneficiary_account: string;
    beneficiary_name: string;
    provider_ref: string;
    transaction_id: string;
  };
  message: string;
}

export interface ISourceOfFundsResponse {
  success: boolean;
  data: string[];
  message: string;
}

export interface IPurposeCodesResponse {
  success: boolean;
  data: Record<string, string>;
  message: string;
}

export interface ISupportedCurrency {
  _id: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface ISupportedCurrenciesResponse {
  success: boolean;
  data: ISupportedCurrency[];
  message: string;
}

export interface ISupportedCountry {
  code: string;
  name: string;
  currency: string;
}

export interface ISupportedCountriesResponse {
  success: boolean;
  data: Record<string, string>;
  message: string;
}

export interface ISenderDetails {
    AccountType: string;
    Address: string;
    ContactNumber: string;
    CountryCode: string;
    Dob: string; 
    IdentificationNumber: string;
    IdentificationType: string;
    Name: string; 
    Nationality: string;
    Postcode: string;
}

export interface ISenderDetailsResponse {
    success: boolean;
    data: ISenderDetails;
    message: string;
}

export interface ISignUpStageOneUserDetails {
  _id: string;
  created_at: string;
  last_login: string;
  updated_at: string;
  email: string;
  user_type: string;
  full_name: string;
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
    secret_key_live: string;
    public_key_live: string;
    secret_key_test: string;
    public_key_test: string;
    status: string;
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
  ip_address: string;
  verified_mail: boolean;
  distributor_name: string;
  secure_pin: Record<string, unknown>;
  has_pin: boolean;
  device_token: string;
}

export interface ISignUpStageOneDetails {
  _id: string;
  created_at: string;
  last_login: string;
  updated_at: string;
  email: string;
  password: string;
  userDetails: {
    success: boolean;
    data: ISignUpStageOneUserDetails;
    message: string;
    token: string;
  };
  __v: number;
}

export interface ISignUpStageOneResponse {
  StatusCode: number;
  Message: string;
  Data: {
    details: ISignUpStageOneDetails;
  };
}

export interface ITransfiListCurrenciesResponse {
  StatusCode: number;
  Message: string;
  Data: {
    details: string[];
  };
}


export interface ITransfiPaymentMethod {
  paymentCode: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  logoUrl: string;
  paymentType: string;
}

export interface ITransfiListPaymentMethodsResponse {
  StatusCode: number;
  Message: string;
  Data: {
    details: ITransfiPaymentMethod[];
  };
}

export interface ITransfiGetRatesRequest {
  AMOUNT: number;
  CURRENCY: string;
  SETTLEMENT_CURRENCY: string;
}

export interface ITransfiGetRatesResponse {
  StatusCode: number;
  Message: string;
  Data: {
    details: {
      fiatTicker: string;
      fiatAmount: number;
      withdrawAmount: number;
      exchangeRate: number;
      quoteId: string;
      fees: {
        processingFee: number;
        partnerFee: number;
        totalFee: number;
      };
    };
  };
}

export interface ITransfiPayinResponse {
  StatusCode: number;
  Message: string;
  Data: {
    details: {
      message: string;
      code: string;
    };
  };
}