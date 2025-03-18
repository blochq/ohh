import { apiRequest } from '../client';

export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId: string;
}

export interface VerifyEmailData {
  email: string;
  code: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  verified: boolean;
}

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected';
  };
}

const authService = {
  /**
   * Register a new user
   */
  async registerUser(userData: RegisterUserData): Promise<RegisterResponse> {
    return apiRequest<RegisterResponse>({
      endpoint: '/v1/customers/',
      method: 'POST',
      body: userData as unknown as Record<string, unknown>,
      requiresAuth: false
    });
  },

  /**
   * Verify user email with OTP code
   */
  async verifyEmail(verifyData: VerifyEmailData): Promise<VerifyEmailResponse> {
    return apiRequest<VerifyEmailResponse>({
      endpoint: '/v1/customers/verify-email',
      method: 'POST',
      body: verifyData as unknown as Record<string, unknown>,
      requiresAuth: false
    });
  },

  /**
   * Resend verification code to user email
   */
  async resendVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>({
      endpoint: '/v1/users/resend-verification',
      method: 'POST',
      body: { email } as unknown as Record<string, unknown>,
      requiresAuth: false
    });
  },

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<UserProfile> {
    return apiRequest<UserProfile>({
      endpoint: '/v1/users/profile',
      method: 'GET',
      requiresAuth: true
    });
  },

  /**
   * Update user profile
   */
  async updateUserProfile(profileData: UpdateProfileData): Promise<UserProfile> {
    return apiRequest<UserProfile>({
      endpoint: '/v1/users/profile',
      method: 'PUT',
      body: profileData as unknown as Record<string, unknown>,
      requiresAuth: true
    });
  },

  /**
   * Login user
   */
  async login(loginData: LoginData): Promise<LoginResponse> {
    const response = await apiRequest<LoginResponse>({
      endpoint: '/v1/users/login',
      method: 'POST',
      body: loginData as unknown as Record<string, unknown>,
      requiresAuth: false
    });
    
    // Store token in localStorage for future requests
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  }
};

export default authService; 