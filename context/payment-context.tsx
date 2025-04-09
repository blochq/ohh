'use client';

import { ICollectionAccount, IConversion, IExchangeRateResponse, IVerifyPaymentResponse, IBeneficiary } from '@/lib/models';
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define interface for Intermediary Details
export interface IIntermediaryBankAddress {
    street: string | undefined;
    house_number: string | undefined;
    city: string | undefined;
    state: string | undefined;
    country: string | undefined;
}
export interface IIntermediaryDetails {
    intermediary_bank_name: string | undefined;
    intermediary_account_number: string | undefined;
    intermediary_account_swift_code: string | undefined;
    intermediary_address: string | undefined;
    intermediary_bank_address: IIntermediaryBankAddress | undefined;
}

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

  destinationCountry: string | null;
  setDestinationCountry: (country: string | null) => void;

  selectedCurrency: string | null;
  setSelectedCurrency: (currency: string | null) => void;

  sourceOfFunds: string | null;
  setSourceOfFunds: (source: string | null) => void;
  purposeCode: string | null;
  setPurposeCode: (code: string | null) => void;
  invoiceBase64: string | null;
  setInvoiceBase64: (invoice: string | null) => void;
  invoiceFile: File | null;
  setInvoiceFile: (file: File | null) => void;
  narration: string | null;
  setNarration: (narration: string | null) => void;
  intermediaryDetails: IIntermediaryDetails | null;
  setIntermediaryDetails: (details: IIntermediaryDetails | null) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {

  const [conversionData, setConversionData] = useState<IConversion | null>(null);
  

  const [accountData, setAccountData] = useState<ICollectionAccount | null>(null);
  

  const [verificationData, setVerificationData] = useState<IVerifyPaymentResponse | null>(null);
  

  const [exchangeRateData, setExchangeRateData] = useState<IExchangeRateResponse | null>(null);
  
 
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<IBeneficiary | null>(null);
  
  const [destinationCountry, setDestinationCountry] = useState<string | null>(null);

  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  
  const [sourceOfFunds, setSourceOfFunds] = useState<string | null>(null);
  const [purposeCode, setPurposeCode] = useState<string | null>(null);
  const [invoiceBase64, setInvoiceBase64] = useState<string | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [narration, setNarration] = useState<string | null>(null);
  const [intermediaryDetails, setIntermediaryDetails] = useState<IIntermediaryDetails | null>(null);
  
  const updateActivity = () => {
    setLastActivityTime(Date.now());
  };
  
  const clearPaymentData = () => {
    setConversionData(null);
    setAccountData(null);
    setExchangeRateData(null);
    setVerificationData(null);
    setSourceOfFunds(null);
    setPurposeCode(null);
    setInvoiceBase64(null);
    setInvoiceFile(null);
    setNarration(null);
    setSelectedBeneficiary(null);
    setDestinationCountry(null);
    setSelectedCurrency(null);
    setIntermediaryDetails(null);
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
        destinationCountry,
        setDestinationCountry,
        selectedCurrency,
        setSelectedCurrency,
        sourceOfFunds,
        setSourceOfFunds,
        purposeCode,
        setPurposeCode,
        invoiceBase64,
        setInvoiceBase64,
        invoiceFile,
        setInvoiceFile,
        narration,
        setNarration,
        intermediaryDetails,
        setIntermediaryDetails,
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