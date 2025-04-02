'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getSingleUser, getSingleCustomer } from '@/lib/api-calls';
import { IUser, ICustomer } from '@/lib/models';


interface SessionContextState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: IUser | null;
  customer: ICustomer | null;
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
      type: type === 'user' || type === 'customer' || type === 'owner' ? type as 'user' | 'customer' | 'owner' : null,
      userId,
      userName
    };
  };

  
  useEffect(() => {
    const { token, type, userName } = getSessionInfo();
    setIsAuthenticated(!!token);
    setUserType(type);
    setUserName(userName || null);
  }, []);


  const {
    data: userData,
    isLoading: isUserLoading,
  } = useQuery({
    queryKey: ['session-user', shouldRefetch],
    queryFn: async () => {
      const { token, type, userId } = getSessionInfo();
      
      if (!token || type !== 'user' || !userId) {
        return null;
      }

      try {
        const response = await getSingleUser({ token, user_id: userId });
        if (response.error) throw new Error(response.error.message);
        if (response.data?.data) {
          return response.data.data as unknown as IUser;
        }
        return null;
      } catch (error) {
        console.error('Failed to fetch user data', error);
        return null;
      }
    },
    enabled: isAuthenticated && userType === 'user' || userType === 'owner',
  });


  const {
    data: customerData,
    isLoading: isCustomerLoading,
  } = useQuery({
    queryKey: ['session-customer', shouldRefetch],
    queryFn: async () => {
      const { token, type, userId } = getSessionInfo();
      
      if (!token || type !== 'customer' || !userId) {
        return null;
      }

      try {
        const response = await getSingleCustomer({ token, customer_id: userId });
        if (response.error) throw new Error(response.error.message);
        if (response.data?.data) {
          return response.data.data as unknown as ICustomer;
        }
        return null;
      } catch (error) {
        console.error('Failed to fetch customer data', error);
        return null;
      }
    },
    enabled: isAuthenticated && userType === 'customer',
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
    (isAuthenticated && userType === 'user' && isUserLoading) || 
    (isAuthenticated && userType === 'customer' && isCustomerLoading) ||
    (isAuthenticated && userType === 'owner' && isUserLoading);


  const contextValue: SessionContextState = {
    isAuthenticated,
    isLoading,
    user: userData || null,
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