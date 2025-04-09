'use client';
import { z } from 'zod';


export const signupSchema = z.object({
  First_name: z.string().min(1, 'First name is required'),
  Last_name: z.string().min(1, 'Last name is required'),
  Email: z.string().min(1, 'Email is required').email('Email is invalid'),
  Phone_number: z.string().optional(),
  Password: z.string().min(8, 'Password must be at least 8 characters'),
  Customer_type: z.string(),
});

export type SignupFormData = z.infer<typeof signupSchema>;


export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Email is invalid'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;


export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  error.issues.forEach(issue => {
    formattedErrors[issue.path[0].toString()] = issue.message;
  });
  return formattedErrors;
}

export const exchangeRateSchema = z.object({
  source_currency: z.string().min(3, "Source currency required").max(3),
  destination_currency: z.string().min(3, "Destination currency required").max(3),
  amount: z.number().positive("Amount must be positive"),
  token: z.string().min(1, "Token required"),
});

export type ExchangeRateFormData = z.infer<typeof exchangeRateSchema>;


export const collectionAccountSchema = z.object({
  amount: z.number(),
  token: z.string(),
});

export type CollectionAccountFormData = z.infer<typeof collectionAccountSchema>;


export const verifyPaymentSchema = z.object({
  reference: z.string(),
  amount: z.number(),
  token: z.string(),
});

export type VerifyPaymentFormData = z.infer<typeof verifyPaymentSchema>;

export const tokenSchema = z.object({
  token: z.string(),
});

export type TokenFormData = z.infer<typeof tokenSchema>;

export const transferSchema = z.object({
  account_number: z.string().length(10, "Account number must be 10 digits"),
  bank_code: z.string().min(1, "Bank code is required"),
  amount: z.number().positive("Amount must be positive"),
  narration: z.string().optional(),
  account_id: z.string().min(1, "Account ID required"),
  reference: z.string().min(1, "Reference required"),
  token: z.string().min(1, "Token required"),
  source_of_funds: z.string().min(1, "Source of funds is required"),
  purpose_code: z.string().min(1, "Purpose of transfer is required"),
  invoice: z.string().min(1, "Invoice data is required"),
});

export type TransferFormData = z.infer<typeof transferSchema>;

export const resolveAccountSchema = z.object({
  bank_code: z.string().min(1, "Bank code required"),
  account_number: z.string().length(10, "Account number must be 10 digits"),
  token: z.string().min(1, "Token required"),
});

export type ResolveAccountFormData = z.infer<typeof resolveAccountSchema>;

export const createUserSchema = z.object({
  Email: z.string(),
  full_name: z.string(),
  Password: z.string(),
  organization_name: z.string(),
  token: z.string(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

export const getSingleUserSchema = z.object({
  token: z.string(),
  user_id: z.string(),
});

export type GetSingleUserFormData = z.infer<typeof getSingleUserSchema>;

export const getSingleCustomerSchema = z.object({
  token: z.string(),
  customer_id: z.string(),
});

export type GetSingleCustomerFormData = z.infer<typeof getSingleCustomerSchema>;

export const createAccountSchema = z.object({
  token: z.string(),
  customer_id: z.string(),
  alias: z.string().default('business'),
});

export type CreateAccountFormData = z.infer<typeof createAccountSchema>;

export const getTransferFeeSchema = z.object({
  amount: z.number(),
  token: z.string(),
});

export type GetTransferFeeFormData = z.infer<typeof getTransferFeeSchema>;

export const getSingleTransactionSchema = z.object({
  token: z.string(),
  transaction_id: z.string(),
});

export type GetSingleTransactionFormData = z.infer<typeof getSingleTransactionSchema>;

export const getAllTransactionsSchema = z.object({
  token: z.string(),
});

export type GetAllTransactionsFormData = z.infer<typeof getAllTransactionsSchema>;

export const customerUpgradeSchema = z.object({
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format should be YYYY-MM-DD'),
  gender: z.enum(['male', 'female']),
  place_of_birth: z.string().min(2, 'Place of birth is required'),
  image: z.string().optional(),
  token: z.string(),
  customer_id: z.string(),
});

export type CustomerUpgradeFormData = z.infer<typeof customerUpgradeSchema>;

export const kycIdentitySchema = z.object({
  country_code: z.string(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format should be YYYY-MM-DD'),
  first_name: z.string().min(1, 'First name is required'),
  gender: z.enum(['Male', 'Female']),
  id_number: z.string().min(1, 'ID number is required'),
  id_type: z.enum(['bvn', 'nin', 'passport', 'drivers_license']),
  last_name: z.string().min(1, 'Last name is required'),
  token: z.string(),
  customer_id: z.string(),
});

export type KycIdentityFormData = z.infer<typeof kycIdentitySchema>;

export const upgradeTierSchema = z.object({
  token: z.string(),
  customer_id: z.string(),
});

export type UpgradeTierFormData = z.infer<typeof upgradeTierSchema>;

export const createBeneficiarySchema = z.object({
  currency: z.string().min(1, "Currency is required"),
  destination_country: z.string().min(1, "Destination country is required"),
  beneficiary_name: z.string().min(1, "Beneficiary name is required"),
  beneficiary_address: z.string().optional(),
  beneficiary_city: z.string().optional(),
  beneficiary_account_type: z.string().min(1, "Account type is required"),
  beneficiary_state: z.string().optional(),
  beneficiary_postcode: z.string().optional(),
  beneficiary_account_number: z.string().min(1, "Account number is required"),
  destination_currency: z.string().min(1, "Destination currency is required"),
  payout_method: z.string().min(1, "Payout method is required"),
  routing_code_type1: z.string().optional(),
  routing_code_value1: z.string().optional(),
  beneficiary_bank_name: z.string().optional(),
  beneficiary_bank_address: z.object({
      street: z.string().optional(),
      house_number: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
  }).optional(),
  beneficiary_country_code: z.string().optional(),
  beneficiary_email: z.string().email("Invalid email").optional(),
  beneficiary_contact_number: z.string().optional(),
  beneficiary_bank_account_type: z.string().optional(),
  routing_code_type2: z.string().optional(),
  routing_code_value2: z.string().optional(),
  token: z.string(),
});

export type CreateBeneficiaryFormData = z.infer<typeof createBeneficiarySchema>;

export const getBeneficiaryByIdSchema = z.object({
  token: z.string(),
  beneficiary_id: z.string(),
});

export type GetBeneficiaryByIdFormData = z.infer<typeof getBeneficiaryByIdSchema>;

// Define nested intermediary bank address schema for reuse
const intermediaryBankAddressSchema = z.object({
    street: z.string().optional(),
    house_number: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
});

export const transferPayoutSchema = z.object({
  currency: z.string(),
  amount: z.number(),
  purpose_code: z.string(),
  source_of_funds: z.string(),
  beneficiary_id: z.string(),
  payout_reference: z.string(),
  invoice:z.string(),
  environment: z.string(),
  token: z.string(),
  narration: z.string().optional(),
  intermediary_details: z.object({
      intermediary_bank_name: z.string().optional(),
      intermediary_account_number: z.string().optional(),
      intermediary_account_swift_code: z.string().optional(),
      intermediary_address: z.string().optional(),
      intermediary_bank_address: intermediaryBankAddressSchema.optional()
  }).optional(),
});

export type TransferPayoutFormData = z.infer<typeof transferPayoutSchema>;

export const getSourceOfFundsSchema = z.object({
  token: z.string().min(1, "Token required"),
});

export type GetSourceOfFundsFormData = z.infer<typeof getSourceOfFundsSchema>;

export const getPurposeCodesSchema = z.object({
  token: z.string().min(1, "Token required"),
});

export type GetPurposeCodesFormData = z.infer<typeof getPurposeCodesSchema>;

export const getSupportedCurrenciesSchema = z.object({
  token: z.string(),
});

export type GetSupportedCurrenciesFormData = z.infer<typeof getSupportedCurrenciesSchema>;

export const getSupportedCountriesSchema = z.object({
  token: z.string(),
  account_id: z.string(),
});

export type GetSupportedCountriesFormData = z.infer<typeof getSupportedCountriesSchema>;

// Combined Recipient + Transfer Info Schema for Recipient Page Form
export const RecipientFormData = z.object({
  narration: z.string().optional(),
  source_of_funds: z.string().min(1, "Source of funds is required"),
  purpose_code: z.string().min(1, "Purpose of transfer is required"),
  invoice: z.string().min(1, "Invoice data is required"),
});

export type RecipientFormData = z.infer<typeof RecipientFormData>;

export interface ISourceOfFundsResponse {
  data: string[];
}

export interface IPurposeCodesResponse {
  data: { [key: string]: string };
}

export const getSenderDetailsSchema = z.object({
  token: z.string().min(1, "Token required"),
});

export type GetSenderDetailsFormData = z.infer<typeof getSenderDetailsSchema>;




