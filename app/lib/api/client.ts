// Base API client for making requests to the Blochq API

// Allow configuring the API base URL through environment variables
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dev.one.blochq.io';

// Log the current configuration
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

// Get the auth token from localStorage (client-side only)
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

export async function apiRequest<T>(
  endpoint: string, 
  options: RequestOptions 
): Promise<T> {
  // Ensure method is extracted properly and has a default value
  const { method = 'GET', body, requiresAuth = true } = options;
  
  // Ensure endpoint starts with a slash but doesn't create a double slash
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Fix double slashes in the URL path
  const cleanEndpoint = formattedEndpoint.replace(/\/+/g, '/');
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  
  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add auth token if required
  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  console.log('Making API request:', {
    url,
    method,
    headers: { ...headers, Authorization: headers.Authorization ? '(token set)' : '(no token)' },
    body
  });
  
  // Build request options
  const requestOptions: RequestInit = {
    method,
    headers,
    // Allow redirects - the API seems to expect this
    redirect: 'follow'
  };
  
  // Add body for non-GET requests
  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, requestOptions);
    
    // For debugging
    console.log('Response status:', response.status, response.statusText);
    console.log('Response type:', response.type);
    
    // Get the response text first to inspect it
    const responseText = await response.text();
    
    // Log the raw response for debugging
    console.log('Raw response:', responseText);
    
    // If the response is empty, handle it gracefully
    if (!responseText.trim()) {
      console.error('Empty response received');
      throw new Error(`Empty response received from the server (Status: ${response.status})`);
    }
    
    let data;
    try {
      // Try to parse the JSON
      data = JSON.parse(responseText);
    } catch (parseError: unknown) {
      console.error('JSON parse error:', parseError);
      console.error('Response that failed to parse:', responseText);
      
      // If the response starts with "<!DOCTYPE" or "<html", it's likely an HTML error page
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        throw new Error(`Received HTML instead of JSON. The API endpoint might be incorrect or the server returned an error page. (Status: ${response.status})`);
      }
      
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown JSON parse error';
      throw new Error(`Failed to parse JSON response: ${errorMessage} (Status: ${response.status})`);
    }
    
    // Check if the request was successful
    if (!response.ok) {
      const errorMsg = data.message || data.error || `HTTP error ${response.status}: ${response.statusText}`;
      console.error('API error:', errorMsg, data);
      throw new Error(errorMsg);
    }
    
    return data as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
} 