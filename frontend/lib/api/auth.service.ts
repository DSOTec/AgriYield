import apiClient from './client'

export interface SignUpData {
  fullName: string
  email: string
  password: string
  role: 'farmer' | 'investor'
}

export interface SignInData {
  email: string
  password: string
}

export interface ConnectWalletData {
  walletAddress: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    fullName: string
    email: string
    role: 'farmer' | 'investor'
    walletAddress?: string
    isVerified: boolean
    createdAt: string
  }
}

export interface UserProfile {
  id: string
  fullName: string
  email: string
  role: 'farmer' | 'investor'
  walletAddress?: string
  isVerified: boolean
  createdAt: string
}

class AuthService {
  /**
   * Register a new user
   */
  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signup-password', {
      email: data.email,
      name: data.fullName,
      password: data.password,
      role: data.role,
      farmName: data.role === 'farmer' ? data.fullName + "'s Farm" : undefined,
      location: data.role === 'farmer' ? 'Nigeria' : undefined,
    })
    
    // Don't store token yet - user needs to verify email first
    // Store email for verification page
    localStorage.setItem('pending_verification_email', data.email)
    
    return response.data
  }

  /**
   * Sign in existing user
   */
  async signIn(data: SignInData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signin-password', data)
    
    // Store token and user data only if verified
    if (response.data.token) {
      localStorage.setItem('agriyield_token', response.data.token)
      localStorage.setItem('agriyield_user', JSON.stringify(response.data.user))
    }
    
    return response.data
  }

  /**
   * Verify email with code
   */
  async verifyEmail(email: string, code: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/verify-email', {
      email,
      code,
    })
    
    // Store token and user data after successful verification
    if (response.data.token) {
      localStorage.setItem('agriyield_token', response.data.token)
      localStorage.setItem('agriyield_user', JSON.stringify(response.data.user))
      localStorage.removeItem('pending_verification_email')
    }
    
    return response.data
  }

  /**
   * Resend verification code
   */
  async resendVerificationCode(email: string): Promise<void> {
    await apiClient.post('/auth/resend-verification', { email })
  }

  /**
   * Verify email with magic link token
   */
  async verifyEmailWithToken(token: string): Promise<AuthResponse> {
    const response = await apiClient.get<AuthResponse>(`/auth/verify-token/${token}`)
    
    // Store token and user data after successful verification
    if (response.data.token) {
      localStorage.setItem('agriyield_token', response.data.token)
      localStorage.setItem('agriyield_user', JSON.stringify(response.data.user))
      localStorage.removeItem('pending_verification_email')
    }
    
    return response.data
  }

  /**
   * Connect MetaMask wallet to user account
   */
  async connectWallet(walletAddress: string): Promise<UserProfile> {
    const response = await apiClient.post<UserProfile>('/auth/connect-wallet', {
      walletAddress,
    })
    
    // Update stored user data
    localStorage.setItem('agriyield_user', JSON.stringify(response.data))
    
    return response.data
  }

  /**
   * Get authenticated user profile
   */
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/auth/profile')
    
    // Update stored user data
    localStorage.setItem('agriyield_user', JSON.stringify(response.data))
    
    return response.data
  }

  /**
   * Sign out user
   */
  signOut(): void {
    localStorage.removeItem('agriyield_token')
    localStorage.removeItem('agriyield_user')
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('agriyield_token')
  }

  /**
   * Get stored user data
   */
  getStoredUser(): UserProfile | null {
    const userData = localStorage.getItem('agriyield_user')
    return userData ? JSON.parse(userData) : null
  }
}

export const authService = new AuthService()
export default authService
