import { collectionAccountSchema, exchangeRateSchema, loginSchema, signupSchema } from "./dto";
import { IApiError, IApiResponse, ICollectionAccountResponse, ICreateUserResponse, IExchangeRateResponse, ILoginResponse, IValidationError } from "./models";
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

  export const createAddress = async (input: z.infer<typeof signupSchema>): Promise<IApiResponse<ICreateUserResponse>> => {
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
  
