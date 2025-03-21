'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AnimatedLayout from '../../components/AnimatedLayout';
import AnimatedButton from '../../components/AnimatedButton';
import { containerVariants, itemVariants, scaleVariants } from '../../../lib/utils/transitions';
import authService from '../../../lib/api/services/auth';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resendDisabled, setResendDisabled] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  useEffect(() => {
    // Get email from session storage
    const storedEmail = sessionStorage.getItem('userEmail');
    if (!storedEmail) {
      // Redirect to signup if no email is found
      router.push('/auth/signup');
      return;
    }
    
    setEmail(storedEmail);
    
    // Focus on first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [router]);
  
  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);
  
  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Clear error when user types
    if (error) {
      setError(null);
    }
    
    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Only allow numbers
    if (!/^\d+$/.test(pastedData)) return;
    
    // Fill OTP inputs with pasted data
    const newOtp = [...otp];
    for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    // Focus on the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex(val => !val);
    if (nextEmptyIndex !== -1 && nextEmptyIndex < 6 && inputRefs.current[nextEmptyIndex]) {
      inputRefs.current[nextEmptyIndex].focus();
    } else if (inputRefs.current[5]) {
      inputRefs.current[5].focus();
    }
  };
  
  const handleResendCode = async () => {
    if (resendDisabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.resendVerificationCode(email);
      
      if (response.success) {
        // Disable resend button for 60 seconds
        setResendDisabled(true);
        setCountdown(60);
      } else {
        setError(response.message || 'Failed to resend verification code. Please try again.');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend verification code. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if OTP is complete
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete verification code');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.verifyEmail({
        email,
        code: otpValue
      });
      
      if (response.success && response.verified) {
        // Redirect to onboarding page
        router.push('/onboarding');
      } else {
        setError(response.message || 'Invalid verification code. Please try again.');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AnimatedLayout
      title="Verify Your Email"
      subtitle={`We've sent a verification code to ${email}`}
      maxWidth="sm"
    >
      <motion.div
        className="container-card border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700 shadow-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {error && (
          <motion.div 
            className="bg-error-100 text-error-700 p-3 rounded-md mb-6 dark:bg-error-700 dark:bg-opacity-20 dark:text-error-500"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {error}
          </motion.div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <motion.div variants={itemVariants}>
            <label htmlFor="otp-input" className="block text-sm font-medium text-gray-700 dark:text-white mb-3">
              Enter Verification Code
            </label>
            
            <div className="flex justify-between gap-2" id="otp-input">
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  type="text"
                  maxLength={1}
                  className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue-light focus:ring-opacity-50 dark:bg-gray-900 dark:border-gray-800 dark:text-white"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  ref={(el) => {
                    if (el) {
                      inputRefs.current[index] = el;
                    }
                  }}
                  aria-label={`Digit ${index + 1} of verification code`}
                  title={`Digit ${index + 1}`}
                  variants={scaleVariants}
                  custom={index}
                  transition={{ delay: 0.1 * index }}
                />
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            className="text-center"
            variants={itemVariants}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Didn&apos;t receive the code?
            </p>
            <motion.button
              type="button"
              className={`text-sm font-medium ${
                resendDisabled
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-brand-blue hover:text-brand-blue-dark dark:text-brand-blue-light cursor-pointer'
              }`}
              onClick={handleResendCode}
              disabled={resendDisabled || isLoading}
              whileHover={!resendDisabled ? { scale: 1.05 } : undefined}
              whileTap={!resendDisabled ? { scale: 0.95 } : undefined}
            >
              {resendDisabled
                ? `Resend code in ${countdown}s`
                : isLoading
                ? 'Sending...'
                : 'Resend Code'}
            </motion.button>
          </motion.div>
          
          <motion.div 
            className="pt-4"
            variants={itemVariants}
          >
            <AnimatedButton
              type="submit"
              fullWidth
              size="lg"
              className="mt-2"
              disabled={isLoading}
              isLoading={isLoading}
              loadingText="Verifying..."
            >
              Verify Email
            </AnimatedButton>
          </motion.div>
        </form>
      </motion.div>
    </AnimatedLayout>
  );
} 