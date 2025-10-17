import jwt from "jsonwebtoken"
import { User, type IUser } from "../models/user.model"
import { envConfig } from "../config/env"
import { verifyMagicToken } from "../config/magic"
import { isAddress } from "ethers"
import { emailService } from "./emailService"

export interface RegisterUserPayload {
  email: string
  name: string
  role: "investor" | "farmer"
  farmName?: string
  farmDescription?: string
  location?: string
  nin?: string
  magicToken?: string
  password?: string
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export class AuthService {
  static async registerUser(payload: RegisterUserPayload): Promise<IUser> {
    try {
      const existingUser = await User.findOne({ email: payload.email })
      if (existingUser) throw new Error("User with this email already exists")

      if (payload.role === "farmer" && (!payload.farmName || !payload.location))
        throw new Error("Farm name and location are required for farmer registration")

      const user = await User.create({
        email: payload.email,
        name: payload.name,
        role: payload.role,
        farmName: payload.farmName,
        farmDescription: payload.farmDescription,
        location: payload.location,
        nin: payload.nin,
        magicToken: payload.magicToken,
        isActive: true,
      })

      const userObject = user.toObject()
      delete userObject.magicToken
      delete userObject.password
      return userObject as IUser
    } catch (error: any) {
      throw new Error(`User registration failed: ${error.message}`)
    }
  }

  static async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email: email.toLowerCase() }).select("-password -magicToken")
    } catch (error: any) {
      throw new Error(`Failed to fetch user by email: ${error.message}`)
    }
  }

  static async getUserById(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id).select("-password -magicToken")
    } catch (error: any) {
      throw new Error(`Failed to fetch user by ID: ${error.message}`)
    }
  }

  static async updateUserWallet(userId: string, walletAddress: string): Promise<IUser | null> {
    try {
      if (!this.isValidWalletAddress(walletAddress))
        throw new Error("Invalid wallet address format")

      const existingWallet = await User.findOne({
        walletAddress: walletAddress.toLowerCase(),
        _id: { $ne: userId },
      })
      if (existingWallet)
        throw new Error("This wallet is already connected to another account")

      const user = await User.findByIdAndUpdate(
        userId,
        { walletAddress: walletAddress.toLowerCase() },
        { new: true, runValidators: true }
      ).select("-password -magicToken")

      if (!user) throw new Error("User not found")
      return user
    } catch (error: any) {
      throw new Error(`Failed to update wallet: ${error.message}`)
    }
  }

  static generateToken(userId: string, email: string, role: string): string {
    try {
      const payload: JWTPayload = { userId, email, role }
      const secret = envConfig.JWT_SECRET
      if (!secret) throw new Error("JWT_SECRET not defined")

      return jwt.sign(payload, secret, {
        expiresIn: (envConfig.JWT_EXPIRY || "7d") as jwt.SignOptions["expiresIn"],
      })
    } catch (error: any) {
      throw new Error(`Token generation failed: ${error.message}`)
    }
  }

  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, envConfig.JWT_SECRET) as JWTPayload
    } catch (error: any) {
      if (error.name === "TokenExpiredError") throw new Error("Token has expired")
      if (error.name === "JsonWebTokenError") throw new Error("Invalid token")
      throw new Error(`Token verification failed: ${error.message}`)
    }
  }

  static async authenticateWithMagic(didToken: string): Promise<any> {
    try {
      return await verifyMagicToken(didToken)
    } catch (error: any) {
      throw new Error(`Magic authentication failed: ${error.message}`)
    }
  }

  static async loginWithMagic(didToken: string): Promise<{
    user: IUser
    token: string
    isNewUser: boolean
  }> {
    try {
      const magicMetadata = await this.authenticateWithMagic(didToken)
      if (!magicMetadata.email) throw new Error("Email not found in Magic metadata")

      const user = await User.findOne({ email: magicMetadata.email.toLowerCase() })
      if (!user) throw new Error("User not found. Please complete registration first.")

      user.lastLoginAt = new Date()
      await user.save()

      const token = this.generateToken(String(user._id), user.email, user.role)
      const userObject = user.toObject()
      delete userObject.magicToken
      delete userObject.password

      return { user: userObject as IUser, token, isNewUser: false }
    } catch (error: any) {
      throw new Error(`Magic login failed: ${error.message}`)
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<IUser>): Promise<IUser | null> {
    try {
      const allowedUpdates = ["name", "profileImageUrl", "farmName", "farmDescription", "location"]
      const filteredUpdates: any = {}
      Object.keys(updates).forEach((key) => {
        if (allowedUpdates.includes(key)) filteredUpdates[key] = (updates as any)[key]
      })

      return await User.findByIdAndUpdate(userId, filteredUpdates, {
        new: true,
        runValidators: true,
      }).select("-password -magicToken")
    } catch (error: any) {
      throw new Error(`Profile update failed: ${error.message}`)
    }
  }

  static async deactivateUser(userId: string): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { isActive: false },
        { new: true }
      ).select("-password -magicToken")
    } catch (error: any) {
      throw new Error(`Account deactivation failed: ${error.message}`)
    }
  }

  private static isValidWalletAddress(address: string): boolean {
    return isAddress(address)
  }

  static async userExists(email: string): Promise<boolean> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() })
      return !!user
    } catch {
      return false
    }
  }

  static async getUserStats(userId: string): Promise<{
    totalInvestments?: number
    activeFarms?: number
    accountAge: number
  }> {
    try {
      const user = await User.findById(userId)
      if (!user) throw new Error("User not found")

      const accountAge = Math.floor(
        (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )
      return { accountAge }
    } catch (error: any) {
      throw new Error(`Failed to get user stats: ${error.message}`)
    }
  }

  /**
   * Generate 6-digit verification code
   */
  private static generateVerificationCode(): string {
    // Default verification code for testing
    return "123456"
  }

  /**
   * Generate secure verification token for magic link
   */
  private static generateVerificationToken(): string {
    const crypto = require('crypto')
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Register user with email/password (traditional auth)
   */
  static async registerUserWithPassword(payload: RegisterUserPayload): Promise<IUser> {
    try {
      const existingUser = await User.findOne({ email: payload.email })
      if (existingUser) throw new Error("User with this email already exists")

      if (payload.role === "farmer" && (!payload.farmName || !payload.location))
        throw new Error("Farm name and location are required for farmer registration")

      if (!payload.password) throw new Error("Password is required")

      // Generate verification code and magic link token
      const verificationCode = this.generateVerificationCode()
      const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      const verificationToken = this.generateVerificationToken()
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      const user = await User.create({
        email: payload.email,
        name: payload.name,
        password: payload.password,
        role: payload.role,
        farmName: payload.farmName,
        farmDescription: payload.farmDescription,
        location: payload.location,
        nin: payload.nin,
        verified: false, // Require verification
        verificationCode,
        verificationCodeExpiry,
        verificationToken,
        verificationTokenExpiry,
        isActive: true,
      })

      // Send verification email with both code and magic link
      try {
        await emailService.sendVerificationEmail(user.email, verificationCode, user.name, verificationToken)
        console.log(`[AUTH] Verification email sent to ${user.email}`)
      } catch (error) {
        console.error(`[AUTH] Failed to send verification email:`, error)
        // Continue even if email fails - code is logged to console
      }

      const userObject = user.toObject()
      delete userObject.magicToken
      delete userObject.password
      delete userObject.verificationCode
      delete userObject.verificationCodeExpiry
      return userObject as IUser
    } catch (error: any) {
      throw new Error(`User registration failed: ${error.message}`)
    }
  }

  /**
   * Verify email with code
   */
  static async verifyEmail(email: string, code: string): Promise<IUser> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() })
        .select("+verificationCode +verificationCodeExpiry")
      
      if (!user) throw new Error("User not found")
      if (user.verified) throw new Error("Email already verified")
      if (!user.verificationCode) throw new Error("No verification code found")
      if (!user.verificationCodeExpiry || user.verificationCodeExpiry < new Date()) {
        throw new Error("Verification code has expired")
      }
      if (user.verificationCode !== code) throw new Error("Invalid verification code")

      // Verify user
      user.verified = true
      user.verificationCode = undefined
      user.verificationCodeExpiry = undefined
      user.verificationToken = undefined
      user.verificationTokenExpiry = undefined
      await user.save()

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(user.email, user.name, user.role)
        console.log(`[AUTH] Welcome email sent to ${user.email}`)
      } catch (error) {
        console.error(`[AUTH] Failed to send welcome email:`, error)
      }

      const userObject = user.toObject()
      delete userObject.magicToken
      delete userObject.password
      delete userObject.verificationCode
      delete userObject.verificationCodeExpiry
      delete userObject.verificationToken
      delete userObject.verificationTokenExpiry
      return userObject as IUser
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  /**
   * Verify email with magic link token
   */
  static async verifyEmailWithToken(token: string): Promise<IUser> {
    try {
      const user = await User.findOne({ verificationToken: token })
        .select("+verificationToken +verificationTokenExpiry")
      
      if (!user) throw new Error("Invalid verification link")
      if (user.verified) throw new Error("Email already verified")
      if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
        throw new Error("Verification link has expired")
      }

      // Verify user
      user.verified = true
      user.verificationCode = undefined
      user.verificationCodeExpiry = undefined
      user.verificationToken = undefined
      user.verificationTokenExpiry = undefined
      await user.save()

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(user.email, user.name, user.role)
        console.log(`[AUTH] Welcome email sent to ${user.email}`)
      } catch (error) {
        console.error(`[AUTH] Failed to send welcome email:`, error)
      }

      const userObject = user.toObject()
      delete userObject.magicToken
      delete userObject.password
      delete userObject.verificationCode
      delete userObject.verificationCodeExpiry
      delete userObject.verificationToken
      delete userObject.verificationTokenExpiry
      return userObject as IUser
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  /**
   * Resend verification code
   */
  static async resendVerificationCode(email: string): Promise<void> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() })
      if (!user) throw new Error("User not found")
      if (user.verified) throw new Error("Email already verified")

      const verificationCode = this.generateVerificationCode()
      const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000)
      const verificationToken = this.generateVerificationToken()
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

      user.verificationCode = verificationCode
      user.verificationCodeExpiry = verificationCodeExpiry
      user.verificationToken = verificationToken
      user.verificationTokenExpiry = verificationTokenExpiry
      await user.save()

      // Send verification email with both code and magic link
      try {
        await emailService.sendVerificationEmail(user.email, verificationCode, user.name, verificationToken)
        console.log(`[AUTH] Verification email resent to ${user.email}`)
      } catch (error) {
        console.error(`[AUTH] Failed to resend verification email:`, error)
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  /**
   * Login with email/password (traditional auth)
   */
  static async loginWithPassword(email: string, password: string): Promise<{
    user: IUser
    token: string
    requiresVerification: boolean
  }> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select("+password")
      if (!user) throw new Error("User not found")

      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) throw new Error("Invalid password")

      // Check if email is verified
      if (!user.verified) {
        const userObject = user.toObject()
        delete userObject.magicToken
        delete userObject.password
        return { 
          user: userObject as IUser, 
          token: "", 
          requiresVerification: true 
        }
      }

      user.lastLoginAt = new Date()
      await user.save()

      const token = this.generateToken(String(user._id), user.email, user.role)
      const userObject = user.toObject()
      delete userObject.magicToken
      delete userObject.password

      return { user: userObject as IUser, token, requiresVerification: false }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}

export default AuthService
