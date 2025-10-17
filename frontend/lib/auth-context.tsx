"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authService, type UserProfile } from "./api/auth.service"

type UserRole = "farmer" | "investor" | null

interface User {
  id?: string
  fullName?: string
  email: string
  role: UserRole
  isVerified: boolean
  walletConnected: boolean
  walletAddress?: string
  hasSeenOnboarding?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (fullName: string, email: string, role: UserRole, password: string) => Promise<void>
  verifyEmail: (email: string, code: string) => Promise<void>
  verifyEmailWithToken: (token: string) => Promise<void>
  resendVerificationCode: (email: string) => Promise<void>
  connectWallet: (address: string) => Promise<void>
  refreshProfile: () => Promise<void>
  signOut: () => void
  markOnboardingComplete: () => void
  pendingVerificationEmail: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null)

  useEffect(() => {
    // Check for existing session and validate token
    const initAuth = async () => {
      const storedUser = authService.getStoredUser()
      const isAuthenticated = authService.isAuthenticated()
      const pendingEmail = localStorage.getItem('pending_verification_email')
      
      if (pendingEmail) {
        setPendingVerificationEmail(pendingEmail)
      }
      
      if (storedUser && isAuthenticated) {
        try {
          // Validate token by fetching profile
          const profile = await authService.getProfile()
          setUser({
            id: profile.id,
            fullName: profile.fullName,
            email: profile.email,
            role: profile.role,
            isVerified: profile.isVerified,
            walletConnected: !!profile.walletAddress,
            walletAddress: profile.walletAddress,
            hasSeenOnboarding: localStorage.getItem("onboardingComplete") === "true",
          })
        } catch (error) {
          // Token invalid or expired, clear auth data
          authService.signOut()
          setUser(null)
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authService.signIn({ email, password })
      setUser({
        id: response.user.id,
        fullName: response.user.fullName,
        email: response.user.email,
        role: response.user.role,
        isVerified: response.user.isVerified,
        walletConnected: !!response.user.walletAddress,
        walletAddress: response.user.walletAddress,
        hasSeenOnboarding: localStorage.getItem("onboardingComplete") === "true",
      })
    } catch (error: any) {
      // Check if it's a 403 error (email verification required)
      if (error.response?.status === 403) {
        setPendingVerificationEmail(email)
        localStorage.setItem('pending_verification_email', email)
        const verificationError = new Error('EMAIL_VERIFICATION_REQUIRED')
        throw verificationError
      }
      throw error
    }
  }

  const signUp = async (fullName: string, email: string, role: UserRole, password: string) => {
    if (!role) throw new Error("Role is required")
    
    try {
      await authService.signUp({ fullName, email, password, role })
      // Set pending email for verification
      setPendingVerificationEmail(email)
      localStorage.setItem('pending_verification_email', email)
      // Don't set user yet - they need to verify email first
    } catch (error) {
      throw error
    }
  }

  const verifyEmail = async (email: string, code: string) => {
    try {
      const response = await authService.verifyEmail(email, code)
      setUser({
        id: response.user.id,
        fullName: response.user.fullName,
        email: response.user.email,
        role: response.user.role,
        isVerified: response.user.isVerified,
        walletConnected: !!response.user.walletAddress,
        walletAddress: response.user.walletAddress,
        hasSeenOnboarding: false,
      })
      setPendingVerificationEmail(null)
    } catch (error) {
      throw error
    }
  }

  const verifyEmailWithToken = async (token: string) => {
    try {
      const response = await authService.verifyEmailWithToken(token)
      setUser({
        id: response.user.id,
        fullName: response.user.fullName,
        email: response.user.email,
        role: response.user.role,
        isVerified: response.user.isVerified,
        walletConnected: !!response.user.walletAddress,
        walletAddress: response.user.walletAddress,
        hasSeenOnboarding: false,
      })
      setPendingVerificationEmail(null)
    } catch (error) {
      throw error
    }
  }

  const resendVerificationCode = async (email: string) => {
    try {
      await authService.resendVerificationCode(email)
    } catch (error) {
      throw error
    }
  }

  const connectWallet = async (address: string) => {
    // Mock wallet connection - no backend API call
    if (user) {
      setUser({
        ...user,
        walletConnected: true,
        walletAddress: address,
      })
      // Store in localStorage for persistence
      const storedUser = localStorage.getItem('agriyield_user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        userData.walletAddress = address
        localStorage.setItem('agriyield_user', JSON.stringify(userData))
      }
    }
  }

  const refreshProfile = async () => {
    try {
      const profile = await authService.getProfile()
      setUser({
        id: profile.id,
        fullName: profile.fullName,
        email: profile.email,
        role: profile.role,
        isVerified: profile.isVerified,
        walletConnected: !!profile.walletAddress,
        walletAddress: profile.walletAddress,
        hasSeenOnboarding: user?.hasSeenOnboarding || localStorage.getItem("onboardingComplete") === "true",
      })
    } catch (error) {
      throw error
    }
  }

  const markOnboardingComplete = () => {
    if (user) {
      const updatedUser = { ...user, hasSeenOnboarding: true }
      setUser(updatedUser)
      localStorage.setItem("onboardingComplete", "true")
    }
  }

  const signOut = () => {
    authService.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        verifyEmail,
        verifyEmailWithToken,
        resendVerificationCode,
        connectWallet,
        refreshProfile,
        signOut,
        markOnboardingComplete,
        pendingVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
