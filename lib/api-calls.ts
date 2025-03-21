import { collectionAccountSchema, createAccountSchema, createUserSchema, exchangeRateSchema, getSingleCustomerSchema, getSingleUserSchema, getTransferFeeSchema, loginSchema, resolveAccountSchema, signupSchema, tokenSchema, transferSchema, verifyPaymentSchema } from "./dto";
import { IAccountResponse, IApiError, IApiResponse, IBankListResponse, ICollectionAccountResponse, ICreateUserResponse, IExchangeRateResponse, ILoginResponse, IResolveAccountResponse, ITransferFeeResponse, ITransferResponse, IValidationError, IVerifyPaymentResponse } from "@/lib/models";
import { z } from "zod";


async function handleValidationResponse (response: Response) {
    const issues = await response.json() as IValidationError[];
    const data = await response.json() as { error: { code: string; message: string; path: string[] }[] };
    const validationErrors = data.error;
  
    validationErrors.forEach(error => {
      issues.push({
        rule: error.code,
        message: error.message,
        field: error.path[0],
      });
    });
  
    return issues;
  }
  
  async function handleServerError (response: Response) {
    const data = await response.json() as IApiError;
  
    return data;
  }
  
  async function handleApiCalls<T> (response: Response): Promise<IApiResponse<T>> {
    try {
      if (response.status >= 400 && response.status <= 499) {
        return { validationErrors: await handleValidationResponse(response) };
      }
  
      if (response.status >= 500) {
        return { error: await handleServerError(response) };
      }
  
      return { data: await response.json() as T };
    } catch (error) {
      console.error("api call error", error);
  
      return { ...(error ? { error } : {}) } as IApiResponse<T>;
    }
  }

  export const createCustomer = async (input: z.infer<typeof signupSchema>): Promise<IApiResponse<ICreateUserResponse>> => {
    return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/v1/customers", {
      method: "POST",
      body: JSON.stringify(input),
      headers: {
        "Content-Type": "application/json",
      },
    }));
  };

  export const login = async (input: z.infer<typeof loginSchema>): Promise<IApiResponse<ILoginResponse>> => {
    return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/v1/users/auth", {
      method: "POST",
      body: JSON.stringify(input),
      headers: {
        "Content-Type": "application/json",
      },
    }));
    
  };

  export const getExchangeRate = async (input: z.infer<typeof exchangeRateSchema>): Promise<IApiResponse<IExchangeRateResponse>> => {
    return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/v1/otc/new-convert-amount/${input.currency}/${input.amount}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${input.token}`,
      },
    }));
  };

  export const getCollectionAccount = async (input: z.infer<typeof collectionAccountSchema>): Promise<IApiResponse<ICollectionAccountResponse>> => {
    return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/v1/otc/request-account/multigate/${input.amount}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${input.token}`,
      },
    }));
  };
  

  export const verifyPayment = async (input: z.infer<typeof verifyPaymentSchema>): Promise<IApiResponse<IVerifyPaymentResponse>> => {
    return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/v1/otc/complete-payment/${input.reference}/verification/${input.amount}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${input.token}`,
      },
    }));
  };

  export const getBankList = async (input: z.infer<typeof tokenSchema>): Promise<IApiResponse<IBankListResponse>> => {
    return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/v1/banks", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${input.token}`,
      },
    }));
  };

  export const transfer = async (input: z.infer<typeof transferSchema>): Promise<IApiResponse<ITransferResponse>> => {
    return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/v1/transfers", {
      method: "POST",
      body: JSON.stringify(input),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${input.token}`,
      },
    }));
  };

  export const resolveAccount = async (input: z.infer<typeof resolveAccountSchema>): Promise<IApiResponse<IResolveAccountResponse>> => {
    return handleApiCalls(await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/resolve-account?account_number=${input.account_number}&bank_code=${input.bank_code}`, 
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${input.token}`,
        },
      }
    ));
  };


  export const createUser = async (input: z.infer<typeof createUserSchema>): Promise<IApiResponse<ICreateUserResponse>> => {
    return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/v1/users", {
      method: "POST",
      body: JSON.stringify(input),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${input.token}`,
      },
    }));
  };

  export const getSingleUser = async (input: z.infer<typeof getSingleUserSchema>): Promise<IApiResponse<ICreateUserResponse>> => {
    return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/v1/users/${input.user_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${input.token}`,
      },
    }));
  };

export const getSingleCustomer = async (input: z.infer<typeof getSingleCustomerSchema>): Promise<IApiResponse<ICreateUserResponse>> => {
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/v1/customers/${input.customer_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${input.token}`,
    },
  }));
};

export const createAccount = async (input: z.infer<typeof createAccountSchema>): Promise<IApiResponse<IAccountResponse>> => {
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/v1/accounts`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${input.token}`,
    },
  }));
};

export const getTransferFee = async (input: z.infer<typeof getTransferFeeSchema>): Promise<IApiResponse<ITransferFeeResponse>> => {
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/v1/transfers/fee`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${input.token}`,
    },
  }));
};


export const getAllCustomers = async (input: z.infer<typeof tokenSchema>): Promise<IApiResponse<ICreateUserResponse>> => {
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/v1/customers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${input.token}`,
    },
  }));
};


