'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {  getSingleCustomer } from '@/lib/api-calls';
import { IUser } from '@/lib/models';


interface SessionContextState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: IUser | null;
  customer: IUser | null;
  userName: string | null;
  userType: 'user' | 'customer' | 'owner' | null;
  logout: () => void;
  refreshSession: () => void;
}


const SessionContext = createContext<SessionContextState>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  customer: null,
  userType: null,
  userName: null,
  logout: () => {},
  refreshSession: () => {},
});


export const useSession = () => useContext(SessionContext);


export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userType, setUserType] = useState<'user' | 'customer' | 'owner' | null>(null);
  const [shouldRefetch, setShouldRefetch] = useState<number>(0);
  const [userName, setUserName] = useState<string | null>(null);

  const getSessionInfo = () => {
    if (typeof window === 'undefined') return { token: null, type: null, userId: null };
    
    const token = sessionStorage.getItem('token');
    const type = sessionStorage.getItem('userType');
    const userId = sessionStorage.getItem('userId');
    const userName = sessionStorage.getItem('userName');

    return { 
      token, 
      type,
      userId,
      userName
    };
  };

  
  useEffect(() => {
    const { token, type, userName } = getSessionInfo();
    setIsAuthenticated(!!token);
    setUserType(type as 'user' | 'customer' | 'owner' | null);
    setUserName(userName || null);
  }, []);




  const {
    data: customerData,
    isLoading: isCustomerLoading,
  } = useQuery({
    queryKey: ['session-customer', shouldRefetch],
    queryFn: async () => {
      const { token, userId } = getSessionInfo();
      
      if (!token || !userId) {
        return null;
      }

      try {
        const response = await getSingleCustomer({ token, customer_id: userId });
        if (response.error) throw new Error(response.error.message);

        console.log("response.data?.data", response.data?.data)
        if (response.data?.data) {
          return response.data.data 
        }
        return null;
      } catch (error) {
        console.error('Failed to fetch customer data', error);
        return null;
      }
    },
    enabled: isAuthenticated,
  });

  
  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userType');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('organizationId');
    
    setIsAuthenticated(false);
    setUserType(null);
    
    router.push('/auth/login');
    
    toast.success('Logged out successfully');
  };


  const refreshSession = () => {
    setShouldRefetch(prev => prev + 1);
  };


  const isLoading = 
    (isAuthenticated  && isCustomerLoading) 


  const contextValue: SessionContextState = {
    isAuthenticated,
    isLoading,
    user: customerData || null,
    customer: customerData || null,
    userType,
    userName,
    logout,
    refreshSession,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
} 