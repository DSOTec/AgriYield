import type { Request, Response } from "express"
import { AuthService } from "../services/authService"
import { validateFarmerFields } from "../validators/auth.validator"
import type { AuthRequest } from "../middleware/auth.middleware"

export class AuthController {

    /**
     * POST /auth/signup-password
     * Register a new user with email/password (traditional auth)
     */
    static async signupPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email, name, password, role, farmName, farmDescription, location, nin } = req.body

            // Validate farmer fields
            if (role === "farmer") {
                if (!farmName || farmName.trim() === "") {
                    res.status(400).json({
                        success: false,
                        message: "Farm name is required for farmer registration",
                    })
                    return
                }
                if (!location || location.trim() === "") {
                    res.status(400).json({
                        success: false,
                        message: "Location is required for farmer registration",
                    })
                    return
                }
            }

            // Check if user already exists
            const existingUser = await AuthService.userExists(email)
            if (existingUser) {
                res.status(409).json({
                    success: false,
                    message: "User with this email already exists",
                })
                return
            }

            // Register user with password
            const user = await AuthService.registerUserWithPassword({
                email,
                name,
                password,
                role,
                farmName,
                farmDescription,
                location,
                nin,
            })

            // Generate JWT token
            const token = AuthService.generateToken(String(user._id), user.email, user.role)
            console.log(token)

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.name,
                    role: user.role,
                    farmName: user.farmName,
                    location: user.location,
                    walletAddress: user.walletAddress,
                    isVerified: user.verified,
                    createdAt: user.createdAt,
                },
            })
        } catch (error: any) {
            console.error("Signup error:", error)
            res.status(500).json({
                success: false,
                message: error.message || "Registration failed",
            })
        }
    }

    /**
     * POST /auth/signin-password
     * Sign in with email/password (traditional auth)
     */
    static async signinPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body

            // Authenticate user
            const { user, token, requiresVerification } = await AuthService.loginWithPassword(email, password)

            if (requiresVerification) {
                res.status(403).json({
                    success: false,
                    message: "Email verification required",
                    requiresVerification: true,
                    user: {
                        email: user.email,
                        isVerified: user.verified,
                    },
                })
                return
            }

            res.status(200).json({
                success: true,
                message: "Sign in successful",
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.name,
                    role: user.role,
                    farmName: user.farmName,
                    location: user.location,
                    walletAddress: user.walletAddress,
                    isVerified: user.verified,
                    createdAt: user.createdAt,
                },
            })
        } catch (error: any) {
            console.error("Signin error:", error)

            if (error.message.includes("User not found")) {
                res.status(404).json({
                    success: false,
                    message: "User not found. Please sign up first.",
                })
                return
            }

            if (error.message.includes("Invalid password")) {
                res.status(401).json({
                    success: false,
                    message: "Invalid email or password",
                })
                return
            }

            res.status(401).json({
                success: false,
                message: error.message || "Authentication failed",
            })
        }
    }

    /**
     * POST /auth/verify-email
     * Verify email with verification code
     */
    static async verifyEmail(req: Request, res: Response): Promise<void> {
        try {
            const { email, code } = req.body

            const user = await AuthService.verifyEmail(email, code)

            // Generate JWT token after verification
            const token = AuthService.generateToken(String(user._id), user.email, user.role)

            res.status(200).json({
                success: true,
                message: "Email verified successfully",
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.name,
                    role: user.role,
                    farmName: user.farmName,
                    location: user.location,
                    walletAddress: user.walletAddress,
                    isVerified: user.verified,
                    createdAt: user.createdAt,
                },
            })
        } catch (error: any) {
            console.error("Verify email error:", error)

            if (error.message.includes("expired")) {
                res.status(400).json({
                    success: false,
                    message: "Verification code has expired. Please request a new one.",
                })
                return
            }

            if (error.message.includes("Invalid")) {
                res.status(400).json({
                    success: false,
                    message: "Invalid verification code",
                })
                return
            }

            res.status(400).json({
                success: false,
                message: error.message || "Email verification failed",
            })
        }
    }

    /**
     * POST /auth/resend-verification
     * Resend verification code
     */
    static async resendVerification(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body

            await AuthService.resendVerificationCode(email)

            res.status(200).json({
                success: true,
                message: "Verification code sent successfully",
            })
        } catch (error: any) {
            console.error("Resend verification error:", error)

            res.status(400).json({
                success: false,
                message: error.message || "Failed to resend verification code",
            })
        }
    }

    /**
     * GET /auth/verify-token/:token
     * Verify email with magic link token
     */
    static async verifyToken(req: Request, res: Response): Promise<void> {
        try {
            const { token } = req.params

            const user = await AuthService.verifyEmailWithToken(token)

            // Generate JWT token after verification
            const jwtToken = AuthService.generateToken(String(user._id), user.email, user.role)

            res.status(200).json({
                success: true,
                message: "Email verified successfully",
                token: jwtToken,
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.name,
                    role: user.role,
                    farmName: user.farmName,
                    location: user.location,
                    walletAddress: user.walletAddress,
                    isVerified: user.verified,
                    createdAt: user.createdAt,
                },
            })
        } catch (error: any) {
            console.error("Verify token error:", error)

            if (error.message.includes("expired")) {
                res.status(400).json({
                    success: false,
                    message: "Verification link has expired. Please request a new one.",
                })
                return
            }

            if (error.message.includes("Invalid")) {
                res.status(400).json({
                    success: false,
                    message: "Invalid verification link",
                })
                return
            }

            res.status(400).json({
                success: false,
                message: error.message || "Email verification failed",
            })
        }
    }

    /**
     * POST /auth/signup
     * Register a new user (investor or farmer)
     */
    static async signup(req: Request, res: Response): Promise<void> {
        try {
            const { email, name, role, farmName, farmDescription, location, nin, magicToken } = req.body

            validateFarmerFields(req.body)

            const magicMetadata = await AuthService.authenticateWithMagic(magicToken)

            if (magicMetadata.email.toLowerCase() !== email.toLowerCase()) {
                res.status(400).json({
                    success: false,
                    message: "Email mismatch with Magic authentication",
                })
                return
            }

            // Check if user already exists
            const existingUser = await AuthService.userExists(email)
            if (existingUser) {
                res.status(409).json({
                    success: false,
                    message: "User with this email already exists",
                })
                return
            }

            // Register user
            const user = await AuthService.registerUser({
                email,
                name,
                role,
                farmName,
                farmDescription,
                location,
                nin,
                magicToken,
            })

            // Generate JWT token
            const token = AuthService.generateToken(String(user._id), user.email, user.role)

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        farmName: user.farmName,
                        location: user.location,
                        verified: user.verified,
                        kycStatus: user.kycStatus,
                    },
                    token,
                },
            })
        } catch (error: any) {
            console.error("Signup error:", error)
            res.status(500).json({
                success: false,
                message: error.message || "Registration failed",
            })
        }
    }


    /**
     * POST /auth/signin
     * Sign in existing user with Magic token
     */
    static async signin(req: Request, res: Response): Promise<void> {
        try {
            const { magicToken } = req.body

            // Authenticate with Magic and get user
            const { user, token, isNewUser } = await AuthService.loginWithMagic(magicToken)

            res.status(200).json({
                success: true,
                message: "Sign in successful",
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        farmName: user.farmName,
                        location: user.location,
                        walletAddress: user.walletAddress,
                        verified: user.verified,
                        kycStatus: user.kycStatus,
                        profileImageUrl: user.profileImageUrl,
                    },
                    token,
                    isNewUser,
                },
            })
        } catch (error: any) {
            console.error("Signin error:", error)

            if (error.message.includes("User not found")) {
                res.status(404).json({
                    success: false,
                    message: "User not found. Please sign up first.",
                })
                return
            }

            res.status(401).json({
                success: false,
                message: error.message || "Authentication failed",
            })
        }
    }

    /**
     * POST /auth/connect-wallet
     * Connect wallet address to user account (protected)
     */
    static async connectWallet(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { walletAddress } = req.body
            const userId = req.user?.userId

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required",
                })
                return
            }

            // Update user wallet
            const updatedUser = await AuthService.updateUserWallet(userId, walletAddress)

            if (!updatedUser) {
                res.status(404).json({
                    success: false,
                    message: "User not found",
                })
                return
            }

            res.status(200).json({
                success: true,
                message: "Wallet connected successfully",
                data: {
                    user: {
                        id: updatedUser._id,
                        email: updatedUser.email,
                        name: updatedUser.name,
                        role: updatedUser.role,
                        walletAddress: updatedUser.walletAddress,
                    },
                },
            })
        } catch (error: any) {
            console.error("Connect wallet error:", error)

            if (error.message.includes("already connected")) {
                res.status(409).json({
                    success: false,
                    message: error.message,
                })
                return
            }

            res.status(500).json({
                success: false,
                message: error.message || "Failed to connect wallet",
            })
        }
    }

    /**
     * GET /auth/profile
     * Get authenticated user profile (protected)
     */
    static async getProfile(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required",
                })
                return
            }

            // Get user by ID
            const user = await AuthService.getUserById(userId)

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "User not found",
                })
                return
            }

            const stats = await AuthService.getUserStats(userId)

            res.status(200).json({
                success: true,
                message: "Profile retrieved successfully",
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        profileImageUrl: user.profileImageUrl,
                        walletAddress: user.walletAddress,
                        farmName: user.farmName,
                        farmDescription: user.farmDescription,
                        location: user.location,
                        verified: user.verified,
                        kycStatus: user.kycStatus,
                        isActive: user.isActive,
                        lastLoginAt: user.lastLoginAt,
                        createdAt: user.createdAt,
                    },
                    stats,
                },
            })
        } catch (error: any) {
            console.error(" Get profile error:", error)
            res.status(500).json({
                success: false,
                message: error.message || "Failed to retrieve profile",
            })
        }
    }
}
