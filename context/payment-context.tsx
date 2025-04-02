'use client';

import { ICollectionAccount, IConversion, IExchangeRateResponse, IVerifyPaymentResponse, IBeneficiary } from '@/lib/models';
import React, { createContext, useContext, useState, ReactNode } from 'react';



interface PaymentContextType {
 
  conversionData: IConversion | null;
  setConversionData: (data: IConversion | null) => void;
  

  accountData: ICollectionAccount | null;
  setAccountData: (data: ICollectionAccount | null) => void;

  exchangeRateData: IExchangeRateResponse | null;
  setExchangeRateData: (data: IExchangeRateResponse | null) => void;
  
    verificationData: IVerifyPaymentResponse | null;
    setVerificationData: (data: IVerifyPaymentResponse | null) => void;
  
 

  lastActivityTime: number;
  updateActivity: () => void;
  
  
  clearPaymentData: () => void;

  selectedBeneficiary: IBeneficiary | null;
  setSelectedBeneficiary: (beneficiary: IBeneficiary | null) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {

  const [conversionData, setConversionData] = useState<IConversion | null>(null);
  

  const [accountData, setAccountData] = useState<ICollectionAccount | null>(null);
  

  const [verificationData, setVerificationData] = useState<IVerifyPaymentResponse | null>(null);
  

  const [exchangeRateData, setExchangeRateData] = useState<IExchangeRateResponse | null>(null);
  
 
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<IBeneficiary | null>(null);
  
  const updateActivity = () => {
    setLastActivityTime(Date.now());
  };
  
  const clearPaymentData = () => {
    setConversionData(null);
    setAccountData(null);
    setExchangeRateData(null);
    setVerificationData(null);
  };
  
  return (
    <PaymentContext.Provider
      value={{
        conversionData,
        setConversionData,
        accountData,
        setAccountData,
        exchangeRateData,
        setExchangeRateData,
        verificationData,
        setVerificationData,
        lastActivityTime,
        updateActivity,
        clearPaymentData,
        selectedBeneficiary,
        setSelectedBeneficiary,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentContext = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePaymentContext must be used within a PaymentProvider');
  }
  return context;
}; 