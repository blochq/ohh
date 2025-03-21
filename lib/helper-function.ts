export const getAuthToken = (): string => {
    const token = typeof window !== 'undefined' 
      ? sessionStorage.getItem('authToken') || '' 
      : '';
   
    return token;
  };