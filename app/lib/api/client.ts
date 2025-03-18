export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dev.one.blochq.io';

if (typeof window !== 'undefined') {
  console.log('API Configuration:', {
    API_BASE_URL
  });
}

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  requiresAuth?: boolean;
}

const getAuthToken = (): string | null => {
  return typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
};

export async function apiRequest<T>(
  endpoint: string, 
  options: RequestOptions 
): Promise<T> {
  const { method = 'GET', body, requiresAuth = true } = options;
  

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  const requestOptions: RequestInit = {
    method,
    headers,
    redirect: 'follow'
  };
  
  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, requestOptions);
    const responseText = await response.text();
    
    if (!responseText.trim()) {
      throw new Error(`Empty response from server (Status: ${response.status})`);
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        throw new Error(`Received HTML instead of JSON (Status: ${response.status})`);
      }
      
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown JSON parse error';
      throw new Error(`Failed to parse JSON: ${errorMessage} (Status: ${response.status})`);
    }
    
    if (!response.ok) {
      const errorMsg = data.message || data.error || `HTTP error ${response.status}: ${response.statusText}`;
      throw new Error(errorMsg);
    }
    
    return data as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
} 