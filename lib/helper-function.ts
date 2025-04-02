export const getAuthToken = (): string => {
    const token = typeof window !== 'undefined' 
      ? sessionStorage.getItem('token') || '' 
      : '';
   
    return token;
  };

  export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };