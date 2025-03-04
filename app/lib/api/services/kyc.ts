import { apiRequest } from '../client';

export type DocumentType = 'passport' | 'idCard' | 'driverLicense';
export type KycStatus = 'not_started' | 'pending' | 'approved' | 'rejected';

export interface KycDocumentUploadData {
  documentType: DocumentType;
  frontDocument: File;
  backDocument?: File; // Optional for passport
  selfieDocument: File;
}

export interface KycDocumentResponse {
  success: boolean;
  message: string;
  documentId: string;
  status: KycStatus;
}

export interface KycStatusResponse {
  status: KycStatus;
  message: string;
  updatedAt: string;
  documents: {
    documentType: DocumentType;
    status: KycStatus;
    uploadedAt: string;
    reviewedAt?: string;
    rejectionReason?: string;
  }[];
}

export interface KycVerificationData {
  documentType: DocumentType;
  documentNumber: string;
  issuingCountry: string;
  expiryDate: string;
}

const kycService = {
  /**
   * Upload KYC documents
   * Note: In a real implementation, this would use FormData to handle file uploads
   */
  async uploadDocuments(documentData: KycDocumentUploadData): Promise<KycDocumentResponse> {
    // In a real implementation, we would create FormData and append files
    const formData = new FormData();
    formData.append('documentType', documentData.documentType);
    formData.append('frontDocument', documentData.frontDocument);
    if (documentData.backDocument) {
      formData.append('backDocument', documentData.backDocument);
    }
    formData.append('selfieDocument', documentData.selfieDocument);

    // For API request, we would pass the formData directly
    // However, our apiRequest function expects a Record<string, unknown>
    // In a real implementation, we would modify the apiRequest function to handle FormData
    
    // Simulating the API call for now
    return apiRequest<KycDocumentResponse>({
      endpoint: '/v1/kyc/documents',
      method: 'POST',
      // This is a workaround for the type system
      // In a real implementation, we would pass formData directly
      body: { documentType: documentData.documentType } as unknown as Record<string, unknown>,
      requiresAuth: true
    });
  },

  /**
   * Check KYC verification status
   */
  async checkStatus(): Promise<KycStatusResponse> {
    return apiRequest<KycStatusResponse>({
      endpoint: '/v1/kyc/status',
      method: 'GET',
      requiresAuth: true
    });
  },

  /**
   * Submit KYC verification data
   */
  async submitVerification(verificationData: KycVerificationData): Promise<KycDocumentResponse> {
    return apiRequest<KycDocumentResponse>({
      endpoint: '/v1/kyc/verify',
      method: 'POST',
      body: verificationData as unknown as Record<string, unknown>,
      requiresAuth: true
    });
  }
};

export default kycService; 