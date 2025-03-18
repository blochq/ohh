export const getAuthToken = (): string => {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '' 
      : '';
    return token;
  };