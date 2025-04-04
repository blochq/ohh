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
  currency: z.string(),
  amount: z.number(),
  token: z.string(),
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
  account_number: z.string(),
  bank_code: z.string(),
  amount: z.number(),
  token: z.string(),
  narration: z.string(),
  account_id: z.string(),
  reference: z.string(),
});



export type TransferFormData = z.infer<typeof transferSchema>;

export const resolveAccountSchema = z.object({
  account_number: z.string(),
  bank_code: z.string(),
  token: z.string(),
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
  reference: z.string(),
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
  // Always required fields
  beneficiary_name: z.string().min(1, "Beneficiary name is required"),
  destination_country: z.string().min(1, "Destination country is required"),
  beneficiary_account_type: z.string().min(1, "Account type is required"),
  destination_currency: z.string().min(1, "Destination currency is required"),
  payout_method: z.string().min(1, "Payout method is required"),
  beneficiary_account_number: z.string().min(1, "Account number is required"),
  
  // Optional fields that might be required based on currency
  beneficiary_address: z.string().optional(),
  beneficiary_city: z.string().optional(),
  beneficiary_state: z.string().optional(),
  beneficiary_postcode: z.string().optional(),
  beneficiary_country_code: z.string().optional(),
  beneficiary_bank_code: z.string().optional(),
  beneficiary_email: z.string().email("Invalid email").optional(),
  beneficiary_contact_number: z.string().optional(),
  beneficiary_bank_account_type: z.string().optional(),
  routing_code_type1: z.string().optional(),
  routing_code_value1: z.string().optional(),
  routing_code_type2: z.string().optional(),
  routing_code_value2: z.string().optional(),
  token: z.string(),
});

// Helper function to get required fields based on currency
export const getRequiredFieldsByCurrency = (currency: string): string[] => {
  switch (currency) {
    case "USD":
      return [
        "destination_country",
        "beneficiary_name",
        "beneficiary_address",
        "beneficiary_city",
        "beneficiary_account_type",
        "beneficiary_state",
        "beneficiary_postcode",
        "beneficiary_account_number",
        "destination_currency",
        "payout_method",
        "routing_code_type1",
        "routing_code_value1"
      ];
    case "EUR":
      return [
        "destination_country",
        "beneficiary_name",
        "beneficiary_country_code",
        "beneficiary_account_type",
        "beneficiary_account_number",
        "destination_currency",
        "payout_method",
        "beneficiary_address",
        "beneficiary_city",
        "routing_code_type1",
        "routing_code_value1"
      ];
    case "GBP":
      return [
        "destination_country",
        "beneficiary_name",
        "beneficiary_country_code",
        "beneficiary_account_type",
        "beneficiary_account_number",
        "destination_currency",
        "payout_method",
        "routing_code_type1",
        "routing_code_value1"
      ];
    case "CAD":
      return [
        "destination_country",
        "beneficiary_name",
        "beneficiary_address",
        "beneficiary_city",
        "beneficiary_state",
        "beneficiary_postcode",
        "beneficiary_country_code",
        "beneficiary_account_type",
        "beneficiary_account_number",
        "beneficiary_bank_code",
        "destination_currency",
        "payout_method",
        "routing_code_type1",
        "routing_code_value1"
      ];
    case "ZAR":
      return [
        "destination_country",
        "beneficiary_name",
        "beneficiary_country_code",
        "beneficiary_email",
        "beneficiary_bank_account_type",
        "beneficiary_account_type",
        "beneficiary_contact_number",
        "beneficiary_account_number",
        "beneficiary_bank_code",
        "destination_currency",
        "payout_method"
      ];
    case "JPY":
      return [
        "destination_country",
        "beneficiary_name",
        "beneficiary_address",
        "beneficiary_city",
        "beneficiary_country_code",
        "beneficiary_bank_account_type",
        "beneficiary_account_type",
        "beneficiary_account_number",
        "destination_currency",
        "payout_method",
        "routing_code_type2",
        "routing_code_value2"
      ];
    case "CNY":
      return [
        "destination_country",
        "beneficiary_account_type",
        "beneficiary_country_code",
        "beneficiary_account_number",
        "destination_currency",
        "payout_method"
      ];
    case "CHF":
      return [
        "destination_country",
        "beneficiary_name",
        "beneficiary_address",
        "beneficiary_city",
        "beneficiary_country_code",
        "beneficiary_account_type",
        "beneficiary_account_number",
        "routing_code_type1",
        "routing_code_value1",
        "destination_currency",
        "payout_method"
      ];
    case "KRW":
      return [
        "destination_country",
        "beneficiary_name",
        "beneficiary_country_code",
        "beneficiary_email",
        "beneficiary_account_type",
        "beneficiary_contact_number",
        "beneficiary_account_number",
        "beneficiary_bank_code",
        "destination_currency",
        "payout_method"
      ];
    case "AUD":
      return [
        "destination_country",
        "beneficiary_name",
        "beneficiary_address",
        "beneficiary_city",
        "beneficiary_country_code",
        "beneficiary_account_type",
        "beneficiary_postcode",
        "beneficiary_account_number",
        "routing_code_type1",
        "routing_code_value1",
        "destination_currency",
        "payout_method"
      ];
    case "NGN":
      return [
        "currency",
        "beneficiary_account_number",
        "beneficiary_bank_code"
      ];
    default:
      return [
        "destination_country",
        "beneficiary_name",
        "beneficiary_account_number",
        "destination_currency",
        "payout_method"
      ];
  }
};

export const getDynamicBeneficiaryValidation = (data: z.infer<typeof createBeneficiarySchema>, currency: string): boolean => {
  const requiredFields = getRequiredFieldsByCurrency(currency);
  

  for (const field of requiredFields) {
    if (field !== 'token' && field !== 'currency' && !data[field as keyof typeof data]) {
      return false;
    }
  }
  return true;
};


export const validateBeneficiaryForm = (data: z.infer<typeof createBeneficiarySchema>, currency: string): { valid: boolean, errors: Record<string, string> } => {
  const requiredFields = getRequiredFieldsByCurrency(currency);
  const errors: Record<string, string> = {};
  
 
  requiredFields.forEach(field => {
    if (field !== 'token' && field !== 'currency' && !data[field as keyof typeof data]) {
      errors[field] = `${field.replace(/_/g, ' ')} is required for ${currency}`;
    }
  });
  
  return { 
    valid: Object.keys(errors).length === 0,
    errors
  };
};

export type CreateBeneficiaryFormData = z.infer<typeof createBeneficiarySchema>;

export const getBeneficiaryByIdSchema = z.object({
  token: z.string(),
  beneficiary_id: z.string(),
});

export type GetBeneficiaryByIdFormData = z.infer<typeof getBeneficiaryByIdSchema>;

export const transferPayoutSchema = z.object({
  currency: z.string(),
  amount: z.number(),
  purpose_code: z.string(),
  source_of_funds: z.string(),
  beneficiary_id: z.string(),
  environment: z.string(),
  token: z.string(),
});

export type TransferPayoutFormData = z.infer<typeof transferPayoutSchema>;

export const getSourceOfFundsSchema = z.object({
  token: z.string(),
});

export type GetSourceOfFundsFormData = z.infer<typeof getSourceOfFundsSchema>;

export const getPurposeCodesSchema = z.object({
  token: z.string(),
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




