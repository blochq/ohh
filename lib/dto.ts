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
  token: z.string(),
  amount: z.number(),
});

export type GetTransferFeeFormData = z.infer<typeof getTransferFeeSchema>;


