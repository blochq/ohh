import { collectionAccountSchema, createAccountSchema, createUserSchema, customerUpgradeSchema, exchangeRateSchema, getAllTransactionsSchema, getSingleCustomerSchema, getSingleTransactionSchema, getSingleUserSchema, getTransferFeeSchema, kycIdentitySchema, loginSchema, resolveAccountSchema, signupSchema, tokenSchema, transferSchema, upgradeTierSchema, verifyPaymentSchema, createBeneficiarySchema, getBeneficiaryByIdSchema, transferPayoutSchema, getSourceOfFundsSchema, getPurposeCodesSchema, getSupportedCurrenciesSchema, getSupportedCountriesSchema, getSenderDetailsSchema, signUpStageOneSchema, kybSchema, getTransfiRatesSchema, transfiPayinSchema, getTransfiPaymentMethodsSchema } from "./dto";
import { IAccountResponse, IApiError, IApiResponse, IBankListResponse, ICollectionAccountResponse, ICreateUserResponse, ICustomerUpgradeResponse, IExchangeRateResponse, IKycIdentityResponse, ILoginResponse, IResolveAccountResponse, ITransferFeeResponse, ITransferResponse, ITransactionResponse, IUpgradeTierResponse, IValidationError, IVerifyPaymentResponse, IBeneficiaryResponse, IBeneficiariesResponse, ITransferPayoutResponse, ISourceOfFundsResponse, IPurposeCodesResponse, ISupportedCurrenciesResponse, ISupportedCountriesResponse, ISenderDetailsResponse, ISignUpStageOneResponse, ITransfiListCurrenciesResponse, ITransfiListPaymentMethodsResponse, ITransfiGetRatesResponse, ITransfiPayinResponse } from "@/lib/models";
import { z } from "zod";


async function handleValidationResponse (response: Response) {
    // Read the response body ONCE
    const responseData = await response.json(); 
    
    // Assuming the structure for validation errors is within responseData directly or under an 'error' key
    // Adjust the following based on the actual structure of your 4xx error responses
    let validationErrors: { code: string; message: string; path: string[] }[] = [];
    let issues: IValidationError[] = [];

    if (responseData && Array.isArray(responseData.error)) {
        // Handle structure like { error: [...] }
        validationErrors = responseData.error;
    } else if (Array.isArray(responseData)) {
        // Handle structure like [...] (assuming it's directly the IValidationError array)
        // This part might need refinement based on your actual API response for validation errors
        issues = responseData as IValidationError[]; 
        // If issues are directly in responseData, maybe you don't need the loop below?
        // Or perhaps you need to extract code/message/path differently here.
    }

    // Process the validation errors if they were found in the expected structure
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        issues.push({
          rule: error.code,
          message: error.message,
          field: error.path[0],
        });
      });
    } else if (issues.length === 0) {
        // If neither structure matched and we have no issues, log a warning or handle as appropriate
        console.warn("Could not parse validation errors from response:", responseData);
        // You might want to return a generic error message here
        return [{ rule: 'parsing_error', message: 'Could not parse validation errors', field: 'unknown' }];
    }
  
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
    return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/v1/otc/new-convert-amount/${input.source_currency}/${input.amount}`, {
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
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/v1/users/${input.customer_id}`, {
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
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${input.token}`,

    },
  }));
};


export const getAllTransactions = async (input: z.infer<typeof getAllTransactionsSchema>): Promise<IApiResponse<ITransactionResponse>> => {
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/v1/payout", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${input.token}`,
    },
  }));
};

export const getSingleTransaction = async (input: z.infer<typeof getSingleTransactionSchema>): Promise<IApiResponse<ITransactionResponse>> => {
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/v1/transactions/retrieve/payouts/${input.transaction_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${input.token}`,
    },
  }));
};

export const upgradeCustomer = async (input: z.infer<typeof customerUpgradeSchema>): Promise<IApiResponse<ICustomerUpgradeResponse>> => {
  const { token, customer_id, ...data } = input;
  
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/v1/customers/upgrade/${customer_id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  }));
};

export const verifyKycIdentity = async (input: z.infer<typeof kycIdentitySchema>): Promise<IApiResponse<IKycIdentityResponse>> => {
  const { token, customer_id, ...data } = input;
  
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/v1/kyc/identity/${customer_id}`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  }));
};

export const upgradeTier = async (input: z.infer<typeof upgradeTierSchema>): Promise<IApiResponse<IUpgradeTierResponse>> => {
  const { token, customer_id } = input;
  
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/v1/customers/upgrade/t2/${customer_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  }));
};

export const createBeneficiary = async (input: z.infer<typeof createBeneficiarySchema>): Promise<IApiResponse<IBeneficiaryResponse>> => {
  const { token, ...data } = input;
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/v1/beneficiaries", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  }));
};

export const getBeneficiaries = async (input: z.infer<typeof tokenSchema>): Promise<IApiResponse<IBeneficiariesResponse>> => {
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/v1/beneficiaries", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${input.token}`,
    },
  }));
};

export const getBeneficiaryById = async (input: z.infer<typeof getBeneficiaryByIdSchema>): Promise<IApiResponse<IBeneficiaryResponse>> => {
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/v1/beneficiaries/${input.beneficiary_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${input.token}`,
    },
  }));
};

export const initiateTransferPayout = async (input: z.infer<typeof transferPayoutSchema>): Promise<IApiResponse<ITransferPayoutResponse>> => {
  const { token, ...data } = input;
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/v1/transfers/payouts", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  }));
};

export const getSourceOfFunds = async (input: z.infer<typeof getSourceOfFundsSchema>): Promise<IApiResponse<ISourceOfFundsResponse>> => {
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/v1/transfers/source-of-fund", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${input.token}`,
    },
  }));
};

export const getPurposeCodes = async (input: z.infer<typeof getPurposeCodesSchema>): Promise<IApiResponse<IPurposeCodesResponse>> => {
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/v1/transfers/purpose-codes", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${input.token}`,
    },
  }));
};

export const getSupportedCurrencies = async (input: z.infer<typeof getSupportedCurrenciesSchema>): Promise<IApiResponse<ISupportedCurrenciesResponse>> => {
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/v1/otc/supported-currencies", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${input.token}`,
    },
  }));
};

export const getSupportedCountries = async (input: z.infer<typeof getSupportedCountriesSchema>): Promise<IApiResponse<ISupportedCountriesResponse>> => {
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/v1/all-currencies", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${input.token}`,
    },
  }));
};

export const getSenderDetails = async (input: z.infer<typeof getSenderDetailsSchema>): Promise<IApiResponse<ISenderDetailsResponse>> => {
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/v1/transfers/sender", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${input.token}`,
    },
  }));
};

export const signUpStageOne = async (input: z.infer<typeof signUpStageOneSchema>): Promise<IApiResponse<ISignUpStageOneResponse>> => {
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/signUp", {
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
  }));
};

export const submitKyb = async (input: z.infer<typeof kybSchema>): Promise<IApiResponse<IKybResponse>> => {
  const { token, ...data } = input;
  return handleApiCalls(await fetch(process.env.NEXT_PUBLIC_API_URL + "/docKYB", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, 
    },
  }));
};


export const getTransfiCurrencies = async (input: z.infer<typeof tokenSchema>): Promise<IApiResponse<ITransfiListCurrenciesResponse>> => {
  return handleApiCalls(await fetch(`${process.env.NEXT_PUBLIC_API_URL}/onRamp/trans/list-currencies`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${input.token}`,
    },
  }));
};

export const getTransfiPaymentMethods = async (input: z.infer<typeof getTransfiPaymentMethodsSchema>): Promise<IApiResponse<ITransfiListPaymentMethodsResponse>> => {
  return handleApiCalls(await fetch(`${process.env.NEXT_PUBLIC_API_URL}/onRamp/trans/list-payment-methods/:${input.currency}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization":`Bearer ${input.token}`,
    },
  }));
};


export const getTransfiRates = async (input: z.infer<typeof getTransfiRatesSchema>): Promise<IApiResponse<ITransfiGetRatesResponse> > => {
  return handleApiCalls(await fetch(`${process.env.NEXT_PUBLIC_API_URL}/onRamp/trans/get-rates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 
      'Authorization': `Bearer ${input.token}` },
    body: JSON.stringify(input),
  }));
};

export const transfiPayin = async (input: z.infer<typeof transfiPayinSchema>): Promise<IApiResponse<ITransfiPayinResponse>> => {
  return handleApiCalls(await fetch(`${process.env.NEXT_PUBLIC_API_URL}/onRamp/trans/payin`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${input.token}` 
    },
    body: JSON.stringify(input),
  }));
};
