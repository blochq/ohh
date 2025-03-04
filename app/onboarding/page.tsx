'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedLayout from '../components/AnimatedLayout';
import AnimatedButton from '../components/AnimatedButton';
import AnimatedFormField, { AnimatedSelectField } from '../components/AnimatedFormField';
import { containerVariants, itemVariants, slideInLeftVariants, slideInRightVariants } from '../lib/utils/transitions';
import authService, { UpdateProfileData } from '../lib/api/services/auth';

// Onboarding steps
type OnboardingStep = 'personal' | 'address' | 'phone' | 'complete';

// Form data interface
interface OnboardingFormData {
  // Personal information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  
  // Address information
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  
  // Phone information
  phone: string;
}

// Country options for select field
const countryOptions = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'JP', label: 'Japan' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'IN', label: 'India' },
  { value: 'BR', label: 'Brazil' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('personal');
  const [formData, setFormData] = useState<OnboardingFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(25);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  
  useEffect(() => {
    // Get user data from session storage or API
    const fetchUserData = async () => {
      try {
        // Try to get user profile from API
        const userProfile = await authService.getUserProfile();
        
        // Update form data with existing profile information
        setFormData({
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          dateOfBirth: userProfile.dateOfBirth || '',
          address: userProfile.address || {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: ''
          },
          phone: userProfile.phone || ''
        });
      } catch (err) {
        console.error('Error fetching user profile:', err);

        // If API fails, try to get from session storage
        const storedEmail = sessionStorage.getItem('userEmail');
        if (!storedEmail) {
          // Redirect to login if no user data is found
          router.push('/auth/login');
        }
      }
    };
    
    fetchUserData();
  }, [router]);
  
  useEffect(() => {
    // Update progress based on current step
    switch (currentStep) {
      case 'personal':
        setProgress(25);
        break;
      case 'address':
        setProgress(50);
        break;
      case 'phone':
        setProgress(75);
        break;
      case 'complete':
        setProgress(100);
        break;
    }
  }, [currentStep]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested address fields
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validatePersonalInfo = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      // Check if user is at least 18 years old
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        newErrors.dateOfBirth = 'You must be at least 18 years old';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateAddressInfo = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street address is required';
    }
    
    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }
    
    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State/Province is required';
    }
    
    if (!formData.address.postalCode.trim()) {
      newErrors['address.postalCode'] = 'Postal code is required';
    }
    
    if (!formData.address.country.trim()) {
      newErrors['address.country'] = 'Country is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validatePhoneInfo = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s\-()]{8,20}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 'personal':
        isValid = validatePersonalInfo();
        if (isValid) {
          setDirection('forward');
          setCurrentStep('address');
        }
        break;
      case 'address':
        isValid = validateAddressInfo();
        if (isValid) {
          setDirection('forward');
          setCurrentStep('phone');
        }
        break;
      case 'phone':
        isValid = validatePhoneInfo();
        if (isValid) {
          saveOnboardingData();
        }
        break;
    }
  };
  
  const handleBack = () => {
    switch (currentStep) {
      case 'address':
        setDirection('backward');
        setCurrentStep('personal');
        break;
      case 'phone':
        setDirection('backward');
        setCurrentStep('address');
        break;
    }
  };
  
  const saveOnboardingData = async () => {
    setIsLoading(true);
    setServerError(null);
    
    try {
      // Prepare profile data for update
      const profileData: UpdateProfileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        phone: formData.phone
      };
      
      // Update user profile
      await authService.updateUserProfile(profileData);
      
      // Move to completion step
      setDirection('forward');
      setCurrentStep('complete');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile information. Please try again.';
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleComplete = () => {
    // Redirect to KYC page
    router.push('/kyc');
  };
  
  const renderPersonalInfoStep = () => (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-semibold mb-4 text-brand-black dark:text-white">Personal Information</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Please provide your personal details to get started
        </p>
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <AnimatedFormField
            label="First Name"
            id="firstName"
            name="firstName"
            type="text"
            placeholder="John"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            delay={0.1}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <AnimatedFormField
            label="Last Name"
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Doe"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            delay={0.2}
          />
        </motion.div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <AnimatedFormField
          label="Date of Birth"
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          error={errors.dateOfBirth}
          helperText="You must be at least 18 years old to use our services"
          max={new Date().toISOString().split('T')[0]} // Prevent future dates
          delay={0.3}
        />
      </motion.div>
    </motion.div>
  );
  
  const renderAddressStep = () => (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-semibold mb-4 text-brand-black dark:text-white">Address Information</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Please provide your current residential address
        </p>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <AnimatedFormField
          label="Street Address"
          id="street"
          name="address.street"
          type="text"
          placeholder="123 Main St"
          value={formData.address.street}
          onChange={handleChange}
          error={errors['address.street']}
          delay={0.1}
        />
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <AnimatedFormField
            label="City"
            id="city"
            name="address.city"
            type="text"
            placeholder="New York"
            value={formData.address.city}
            onChange={handleChange}
            error={errors['address.city']}
            delay={0.2}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <AnimatedFormField
            label="State/Province"
            id="state"
            name="address.state"
            type="text"
            placeholder="NY"
            value={formData.address.state}
            onChange={handleChange}
            error={errors['address.state']}
            delay={0.3}
          />
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <AnimatedFormField
            label="Postal Code"
            id="postalCode"
            name="address.postalCode"
            type="text"
            placeholder="10001"
            value={formData.address.postalCode}
            onChange={handleChange}
            error={errors['address.postalCode']}
            delay={0.4}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <AnimatedSelectField
            label="Country"
            id="country"
            name="address.country"
            options={countryOptions}
            value={formData.address.country}
            onChange={handleChange}
            error={errors['address.country']}
            delay={0.5}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
  
  const renderPhoneStep = () => (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-semibold mb-4 text-brand-black dark:text-white">Phone Verification</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Please provide your phone number for verification
        </p>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <AnimatedFormField
          label="Phone Number"
          id="phone"
          name="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          helperText="Include country code (e.g., +1 for US)"
          delay={0.1}
        />
      </motion.div>
    </motion.div>
  );
  
  const renderCompletionStep = () => (
    <motion.div 
      className="text-center py-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div 
        className="w-16 h-16 bg-success-100 dark:bg-success-700 dark:bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          transition: { 
            delay: 0.2,
            duration: 0.5,
            type: 'spring',
            stiffness: 200,
            damping: 10
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
        Profile Completed!
      </motion.h2>
      
      <motion.p 
        className="text-gray-600 dark:text-gray-300 mb-6"
        variants={itemVariants}
      >
        Your profile has been successfully set up. The next step is to verify your identity.
      </motion.p>
      
      <motion.div variants={itemVariants}>
        <AnimatedButton
          type="button"
          size="lg"
          className="bg-brand-black text-white dark:bg-white dark:text-brand-black hover:bg-brand-blue-gray hover:text-white dark:hover:bg-brand-blue-gray dark:hover:text-white shadow-md"
          onClick={handleComplete}
        >
          Continue to Identity Verification
        </AnimatedButton>
      </motion.div>
    </motion.div>
  );
  
  const getStepContent = () => {
    const variants = direction === 'forward' ? slideInRightVariants : slideInLeftVariants;
    
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
        >
          {currentStep === 'personal' && renderPersonalInfoStep()}
          {currentStep === 'address' && renderAddressStep()}
          {currentStep === 'phone' && renderPhoneStep()}
          {currentStep === 'complete' && renderCompletionStep()}
        </motion.div>
      </AnimatePresence>
    );
  };
  
  return (
    <AnimatedLayout
      title="Complete Your Profile"
      subtitle="Let's set up your account to get started"
    >
      {/* Progress bar */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <motion.div 
            className="bg-brand-blue h-2.5 rounded-full transition-all duration-300 ease-in-out" 
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <motion.span 
            animate={{ 
              color: progress >= 25 ? 'var(--color-brand-blue)' : undefined,
              fontWeight: progress >= 25 ? 600 : 400
            }}
          >
            Personal
          </motion.span>
          <motion.span 
            animate={{ 
              color: progress >= 50 ? 'var(--color-brand-blue)' : undefined,
              fontWeight: progress >= 50 ? 600 : 400
            }}
          >
            Address
          </motion.span>
          <motion.span 
            animate={{ 
              color: progress >= 75 ? 'var(--color-brand-blue)' : undefined,
              fontWeight: progress >= 75 ? 600 : 400
            }}
          >
            Phone
          </motion.span>
          <motion.span 
            animate={{ 
              color: progress >= 100 ? 'var(--color-brand-blue)' : undefined,
              fontWeight: progress >= 100 ? 600 : 400
            }}
          >
            Complete
          </motion.span>
        </div>
      </motion.div>
      
      <motion.div 
        className="container-card border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700 shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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
        
        {getStepContent()}
        
        {currentStep !== 'complete' && (
          <motion.div 
            className="flex justify-between mt-8 pt-4 border-t border-gray-200 dark:border-gray-800"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <AnimatedButton
                type="button"
                variant="secondary"
                size="md"
                onClick={handleBack}
                disabled={currentStep === 'personal' || isLoading}
                className={currentStep === 'personal' ? 'invisible' : ''}
              >
                Back
              </AnimatedButton>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <AnimatedButton
                type="button"
                size="md"
                onClick={handleNext}
                disabled={isLoading}
                isLoading={isLoading}
                loadingText="Processing..."
              >
                {currentStep === 'phone' ? 'Complete Profile' : 'Continue'}
              </AnimatedButton>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatedLayout>
  );
} 