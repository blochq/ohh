'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePaymentContext } from '../context/PaymentContext';
import { toast } from 'sonner';

// Session timeout in milliseconds (5 minutes)
const SESSION_TIMEOUT = 5 * 60 * 1000;

export function SessionChecker() {
  const router = useRouter();
  const { lastActivityTime, updateActivity } = usePaymentContext();
  const [showSessionWarning, setShowSessionWarning] = useState<boolean>(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number>(SESSION_TIMEOUT);

  useEffect(() => {
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    
    const resetTimer = () => {
      updateActivity();
      setShowSessionWarning(false);
    };
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [updateActivity]);

  useEffect(() => {
    const sessionCheckInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityTime;
      const remaining = Math.max(0, SESSION_TIMEOUT - elapsed);
      
      setSessionTimeLeft(remaining);
      
      if (remaining < 60000 && remaining > 0 && !showSessionWarning) {
        setShowSessionWarning(true);
        toast.warning("Your session will expire soon. Continue?", {
          action: {
            label: "Continue",
            onClick: () => {
              updateActivity();
              setShowSessionWarning(false);
            }
          },
          duration: remaining
        });
      }
      
      if (remaining === 0) {
        toast.error("Your session has expired");
        clearInterval(sessionCheckInterval);
        router.push('/');
      }
    }, 1000);
    
    return () => {
      clearInterval(sessionCheckInterval);
    };
  }, [lastActivityTime, router, showSessionWarning, updateActivity]);

  return null; // This component doesn't render anything
}

// Export a function to get the formatted time left for display in other components
export function formatTimeLeft(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function getSessionTimeLeft(lastActivityTime: number): number {
  const now = Date.now();
  const elapsed = now - lastActivityTime;
  return Math.max(0, SESSION_TIMEOUT - elapsed);
}

export { SESSION_TIMEOUT }; 