'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AnimatedLayout from '../components/AnimatedLayout';
import AnimatedButton from '../components/AnimatedButton';
import { AnimatedSelectField } from '../components/AnimatedFormField';
import { containerVariants, itemVariants, fadeInVariants } from '../../lib/utils/transitions';
import kycService, { KycDocumentUploadData, KycStatus } from '../../lib/api/services/kyc';

// Document types
type DocumentType = 'passport' | 'idCard' | 'driverLicense';

// Document status
type DocumentStatus = 'pending' | 'uploading' | 'uploaded' | 'verified' | 'rejected';

interface DocumentFile {
  file: File;
  preview: string;
  status: DocumentStatus;
  message?: string;
}

interface KycFormData {
  documentType: DocumentType;
  frontDocument: DocumentFile | null;
  backDocument: DocumentFile | null;
  selfieDocument: DocumentFile | null;
}

// Document type options for select field
const documentTypeOptions = [
  { value: 'passport', label: 'Passport' },
  { value: 'idCard', label: 'National ID Card' },
  { value: 'driverLicense', label: 'Driver\'s License' },
];

export default function KycPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<KycFormData>({
    documentType: 'passport',
    frontDocument: null,
    backDocument: null,
    selfieDocument: null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [kycStatus, setKycStatus] = useState<KycStatus>('pending');
  
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  
  // Check KYC status on page load
  useEffect(() => {
    const checkKycStatus = async () => {
      try {
        const response = await kycService.checkStatus();
        if (response.status !== 'not_started') {
          setIsSubmitted(true);
          setKycStatus(response.status);
        }
      } catch (err) {
        // If there's an error, assume the user hasn't started KYC yet
        console.error('Error checking KYC status:', err);
      }
    };
    
    checkKycStatus();
  }, []);
  
  const handleDocumentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const documentType = e.target.value as DocumentType;
    setFormData({
      ...formData,
      documentType
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, documentKey: 'frontDocument' | 'backDocument' | 'selfieDocument') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const preview = URL.createObjectURL(file);
    
    setFormData({
      ...formData,
      [documentKey]: {
        file,
        preview,
        status: 'uploaded'
      }
    });
    
    // Clear error when user uploads a file
    if (errors[documentKey]) {
      setErrors({
        ...errors,
        [documentKey]: ''
      });
    }
  };
  
  const triggerFileInput = (inputRef: { current: HTMLInputElement | null }) => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.frontDocument) {
      newErrors.frontDocument = 'Front side of document is required';
    }
    
    if (formData.documentType !== 'passport' && !formData.backDocument) {
      newErrors.backDocument = 'Back side of document is required';
    }
    
    if (!formData.selfieDocument) {
      newErrors.selfieDocument = 'Selfie with document is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setServerError(null);
    
    try {
      // Prepare the document data for upload
      if (!formData.frontDocument || !formData.selfieDocument) {
        throw new Error('Required documents are missing');
      }
      
      const documentData: KycDocumentUploadData = {
        documentType: formData.documentType,
        frontDocument: formData.frontDocument.file,
        selfieDocument: formData.selfieDocument.file
      };
      
      // Add back document if required and available
      if (formData.documentType !== 'passport' && formData.backDocument) {
        documentData.backDocument = formData.backDocument.file;
      }
      
      // Upload documents
      const response = await kycService.uploadDocuments(documentData);
      
      // Set as submitted and update status
      setIsSubmitted(true);
      setKycStatus(response.status);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload documents. Please try again.';
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleComplete = () => {
    // Redirect to dashboard
    router.push('/dashboard');
  };
  
  const renderUploadForm = () => (
    <motion.form 
      className="space-y-6" 
      onSubmit={handleSubmit}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div variants={itemVariants}>
        <AnimatedSelectField
          label="Document Type"
          id="documentType"
          name="documentType"
          options={documentTypeOptions}
          value={formData.documentType}
          onChange={handleDocumentTypeChange}
          helperText="Choose the type of document you want to upload"
          delay={0.1}
        />
      </motion.div>
      
      <motion.div 
        className="border-t border-gray-200 dark:border-gray-800 pt-6"
        variants={itemVariants}
      >
        <h3 className="text-lg font-medium text-brand-black dark:text-white mb-4">Upload Documents</h3>
        
        <div className="space-y-6">
          {/* Front Document Upload */}
          <motion.div variants={itemVariants} custom={1} transition={{ delay: 0.2 }}>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Front Side of {formData.documentType === 'passport' ? 'Passport' : formData.documentType === 'idCard' ? 'ID Card' : 'Driver\'s License'}
            </label>
            
            <input
              type="file"
              ref={frontInputRef}
              className="hidden"
              accept="image/*"
              title="Upload front side of document"
              onChange={(e) => handleFileChange(e, 'frontDocument')}
            />
            
            {formData.frontDocument ? (
              <motion.div 
                className="relative border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <img 
                  src={formData.frontDocument.preview} 
                  alt="Front document preview" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <AnimatedButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => triggerFileInput(frontInputRef)}
                  >
                    Change
                  </AnimatedButton>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 ${
                  errors.frontDocument ? 'border-error-500 dark:border-error-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                onClick={() => triggerFileInput(frontInputRef)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload front side</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PNG, JPG, or JPEG (max. 5MB)</p>
              </motion.div>
            )}
            
            {errors.frontDocument && (
              <motion.p 
                className="mt-1 text-sm text-error-600 dark:text-error-500"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {errors.frontDocument}
              </motion.p>
            )}
          </motion.div>
          
          {/* Back Document Upload (not required for passport) */}
          {formData.documentType !== 'passport' && (
            <motion.div 
              variants={itemVariants} 
              custom={2} 
              transition={{ delay: 0.3 }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                Back Side of {formData.documentType === 'idCard' ? 'ID Card' : 'Driver\'s License'}
              </label>
              
              <input
                type="file"
                ref={backInputRef}
                className="hidden"
                accept="image/*"
                title="Upload back side of document"
                onChange={(e) => handleFileChange(e, 'backDocument')}
              />
              
              {formData.backDocument ? (
                <motion.div 
                  className="relative border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <img 
                    src={formData.backDocument.preview} 
                    alt="Back document preview" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <AnimatedButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => triggerFileInput(backInputRef)}
                    >
                      Change
                    </AnimatedButton>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 ${
                    errors.backDocument ? 'border-error-500 dark:border-error-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                  onClick={() => triggerFileInput(backInputRef)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload back side</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PNG, JPG, or JPEG (max. 5MB)</p>
                </motion.div>
              )}
              
              {errors.backDocument && (
                <motion.p 
                  className="mt-1 text-sm text-error-600 dark:text-error-500"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {errors.backDocument}
                </motion.p>
              )}
            </motion.div>
          )}
          
          {/* Selfie with Document */}
          <motion.div variants={itemVariants} custom={3} transition={{ delay: 0.4 }}>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Selfie with Document
            </label>
            
            <input
              type="file"
              ref={selfieInputRef}
              className="hidden"
              accept="image/*"
              title="Upload selfie with document"
              onChange={(e) => handleFileChange(e, 'selfieDocument')}
            />
            
            {formData.selfieDocument ? (
              <motion.div 
                className="relative border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <img 
                  src={formData.selfieDocument.preview} 
                  alt="Selfie preview" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <AnimatedButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => triggerFileInput(selfieInputRef)}
                  >
                    Change
                  </AnimatedButton>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 ${
                  errors.selfieDocument ? 'border-error-500 dark:border-error-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                onClick={() => triggerFileInput(selfieInputRef)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload selfie with document</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PNG, JPG, or JPEG (max. 5MB)</p>
              </motion.div>
            )}
            
            {errors.selfieDocument && (
              <motion.p 
                className="mt-1 text-sm text-error-600 dark:text-error-500"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {errors.selfieDocument}
              </motion.p>
            )}
            
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Take a selfie while holding your ID document next to your face
            </p>
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div 
        className="border-t border-gray-200 dark:border-gray-800 pt-6"
        variants={itemVariants}
      >
        <h3 className="text-lg font-medium text-brand-black dark:text-white mb-4">Guidelines for Document Upload</h3>
        
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <motion.li variants={itemVariants} custom={1}>Make sure your document is fully visible and not cut off</motion.li>
          <motion.li variants={itemVariants} custom={2}>Ensure all text on the document is clearly readable</motion.li>
          <motion.li variants={itemVariants} custom={3}>Remove any glare or shadows from the document</motion.li>
          <motion.li variants={itemVariants} custom={4}>For the selfie, make sure your face and the document are clearly visible</motion.li>
          <motion.li variants={itemVariants} custom={5}>Files must be less than 5MB in size</motion.li>
        </ul>
      </motion.div>
      
      <motion.div 
        className="pt-4 mt-6"
        variants={itemVariants}
      >
        <AnimatedButton
          type="submit"
          fullWidth
          size="lg"
          className="mt-2"
          disabled={isLoading}
          isLoading={isLoading}
          loadingText="Uploading Documents..."
        >
          Submit Documents
        </AnimatedButton>
      </motion.div>
    </motion.form>
  );
  
  const renderVerificationStatus = () => (
    <motion.div 
      className="text-center py-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {kycStatus === 'approved' ? (
        <>
          <motion.div 
            className="w-16 h-16 bg-success-100 dark:bg-success-700 dark:bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ 
              scale: 1,
              transition: {
                type: 'spring',
                stiffness: 200,
                damping: 10,
                delay: 0.2
              }
            }}
          >
            <svg className="w-8 h-8 text-success-700 dark:text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          
          <motion.h2 
            className="text-xl font-semibold mb-2 text-brand-black dark:text-white"
            variants={itemVariants}
          >
            Identity Verified!
          </motion.h2>
          
          <motion.p 
            className="text-gray-600 dark:text-gray-300 mb-6"
            variants={itemVariants}
          >
            Your identity has been successfully verified. You can now use all features of our platform.
          </motion.p>
          
          <motion.div variants={itemVariants}>
            <AnimatedButton
              type="button"
              size="lg"
              onClick={handleComplete}
            >
              Go to Dashboard
            </AnimatedButton>
          </motion.div>
        </>
      ) : (
        <>
          <motion.div 
            className="w-16 h-16 bg-primary-100 dark:bg-primary-700 dark:bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ 
              scale: 1,
              transition: {
                type: 'spring',
                stiffness: 200,
                damping: 10,
                delay: 0.2
              }
            }}
          >
            <svg className="w-8 h-8 text-primary-700 dark:text-primary-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          
          <motion.h2 
            className="text-xl font-semibold mb-2 text-brand-black dark:text-white"
            variants={itemVariants}
          >
            Documents Under Review
          </motion.h2>
          
          <motion.p 
            className="text-gray-600 dark:text-gray-300 mb-6"
            variants={itemVariants}
          >
            Your documents have been submitted and are currently being reviewed. This process typically takes 1-2 business days.
          </motion.p>
          
          <motion.div 
            className="flex justify-center"
            variants={itemVariants}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-black dark:border-white"></div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
  
  const getSubtitle = () => {
    if (!isSubmitted) {
      return 'Please upload your identification documents to verify your identity';
    } else if (kycStatus === 'approved') {
      return 'Your identity has been verified successfully!';
    } else {
      return 'Your documents are being reviewed';
    }
  };
  
  return (
    <AnimatedLayout
      title="Identity Verification"
      subtitle={getSubtitle()}
    >
      <motion.div
        className="container-card border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700 shadow-md"
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {serverError && (
          <motion.div 
            className="bg-error-100 text-error-700 p-3 rounded-md mb-6 dark:bg-error-700 dark:bg-opacity-20 dark:text-error-500"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {serverError}
          </motion.div>
        )}
        
        <AnimatePresence mode="wait">
          {!isSubmitted ? renderUploadForm() : renderVerificationStatus()}
        </AnimatePresence>
      </motion.div>
    </AnimatedLayout>
  );
} 