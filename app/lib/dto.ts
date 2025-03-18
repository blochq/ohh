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


