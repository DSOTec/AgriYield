import { Router } from "express"
import { AuthController } from "../controllers/auth.controller"
import { validate } from "../middleware/validation.middleware"
import { authenticate } from "../middleware/auth.middleware"
import { signupSchema, signinSchema, connectWalletSchema, signupPasswordSchema, signinPasswordSchema, verifyEmailSchema, resendVerificationSchema } from "../validators/auth.validator"

const router = Router()

/**
 * @swagger
 * api/auth/signup-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register with email/password
 *     description: Register a new user with traditional email/password authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [investor, farmer]
 *               farmName:
 *                 type: string
 *               farmDescription:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post("/signup-password", validate(signupPasswordSchema), AuthController.signupPassword)

/**
 * @swagger
 * api/auth/signin-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Sign in with email/password
 *     description: Authenticate user with traditional email/password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sign in successful
 */
router.post("/signin-password", validate(signinPasswordSchema), AuthController.signinPassword)

/**
 * @swagger
 * api/auth/verify-email:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify email with code
 *     description: Verify user email address with 6-digit verification code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 */
router.post("/verify-email", validate(verifyEmailSchema), AuthController.verifyEmail)

/**
 * @swagger
 * api/auth/resend-verification:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Resend verification code
 *     description: Resend verification code to user email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 */
router.post("/resend-verification", validate(resendVerificationSchema), AuthController.resendVerification)

/**
 * @swagger
 * api/auth/verify-token/{token}:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Verify email with magic link token
 *     description: Verify user email address using magic link token from email
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token from magic link
 *     responses:
 *       200:
 *         description: Email verified successfully
 */
router.get("/verify-token/:token", AuthController.verifyToken)

/**
 * @swagger
 * api/auth/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Register a new user account (investor or farmer) with Magic authentication
 *     operationId: signup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - role
 *               - magicToken
 *               - farmName
 *               - farmDescription
 *               - location
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               name:
 *                 type: string
 *                 description: User full name
 *               role:
 *                 type: string
 *                 enum: [investor, farmer]
 *                 description: User role
 *               farmName:
 *                 type: string
 *                 description: Farm name (required if role is farmer)
 *               farmDescription:
 *                 type: string
 *                 description: Farm description (required if role is farmer)
 *               location:
 *                 type: string
 *                 description: Farm location (required if role is farmer)
 *               nin:
 *                 type: string
 *                 description: National Identification Number (optional)
 *               magicToken:
 *                 type: string
 *                 description: Magic authentication token
 *           example:
 *             email: farmer@example.com
 *             name: John Doe
 *             role: farmer
 *             farmName: Green Valley Farm
 *             farmDescription: Organic vegetable farming
 *             location: Lagos, Nigeria
 *             nin: "12345678901"
 *             magicToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         role:
 *                           type: string
 *                         farmName:
 *                           type: string
 *                         location:
 *                           type: string
 *                         verified:
 *                           type: boolean
 *                         kycStatus:
 *                           type: string
 *                     token:
 *                       type: string
 *             example:
 *               success: true
 *               message: User registered successfully
 *               data:
 *                 user:
 *                   id: "507f1f77bcf86cd799439011"
 *                   email: farmer@example.com
 *                   name: John Doe
 *                   role: farmer
 *                   farmName: Green Valley Farm
 *                   location: Lagos, Nigeria
 *                   verified: false
 *                   kycStatus: pending
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid input or email mismatch
 *       409:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
router.post("/signup", validate(signupSchema), AuthController.signup)

/**
 * @swagger
 * api/auth/signin:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Sign in user
 *     description: Sign in existing user with Magic authentication token
 *     operationId: signin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - magicToken
 *             properties:
 *               magicToken:
 *                 type: string
 *                 description: Magic authentication token
 *           example:
 *             magicToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Sign in successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         role:
 *                           type: string
 *                         farmName:
 *                           type: string
 *                         location:
 *                           type: string
 *                         walletAddress:
 *                           type: string
 *                         verified:
 *                           type: boolean
 *                         kycStatus:
 *                           type: string
 *                         profileImageUrl:
 *                           type: string
 *                     token:
 *                       type: string
 *                     isNewUser:
 *                       type: boolean
 *             example:
 *               success: true
 *               message: Sign in successful
 *               data:
 *                 user:
 *                   id: "507f1f77bcf86cd799439011"
 *                   email: farmer@example.com
 *                   name: John Doe
 *                   role: farmer
 *                   farmName: Green Valley Farm
 *                   location: Lagos, Nigeria
 *                   walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE"
 *                   verified: true
 *                   kycStatus: approved
 *                   profileImageUrl: "https://cdn.example.com/profile.jpg"
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 isNewUser: false
 *       404:
 *         description: User not found
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Server error
 */
router.post("/signin", validate(signinSchema), AuthController.signin)

/**
 * @swagger
 * api/auth/connect-wallet:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Connect wallet to user account
 *     description: Connect a blockchain wallet address to authenticated user account
 *     operationId: connectWallet
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 description: Ethereum or blockchain wallet address
 *           example:
 *             walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE"
 *     responses:
 *       200:
 *         description: Wallet connected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         role:
 *                           type: string
 *                         walletAddress:
 *                           type: string
 *             example:
 *               success: true
 *               message: Wallet connected successfully
 *               data:
 *                 user:
 *                   id: "507f1f77bcf86cd799439011"
 *                   email: farmer@example.com
 *                   name: John Doe
 *                   role: farmer
 *                   walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE"
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 *       409:
 *         description: Wallet already connected
 *       500:
 *         description: Server error
 */
router.post("/connect-wallet", authenticate, validate(connectWalletSchema), AuthController.connectWallet)

/**
 * @swagger
 * api/auth/profile:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get user profile
 *     description: Retrieve authenticated user profile information and stats
 *     operationId: getProfile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         role:
 *                           type: string
 *                         profileImageUrl:
 *                           type: string
 *                         walletAddress:
 *                           type: string
 *                         farmName:
 *                           type: string
 *                         farmDescription:
 *                           type: string
 *                         location:
 *                           type: string
 *                         verified:
 *                           type: boolean
 *                         kycStatus:
 *                           type: string
 *                         isActive:
 *                           type: boolean
 *                         lastLoginAt:
 *                           type: string
 *                           format: date-time
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                     stats:
 *                       type: object
 *                       description: User statistics
 *             example:
 *               success: true
 *               message: Profile retrieved successfully
 *               data:
 *                 user:
 *                   id: "507f1f77bcf86cd799439011"
 *                   email: farmer@example.com
 *                   name: John Doe
 *                   role: farmer
 *                   profileImageUrl: "https://cdn.example.com/profile.jpg"
 *                   walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE"
 *                   farmName: Green Valley Farm
 *                   farmDescription: Organic vegetable farming
 *                   location: Lagos, Nigeria
 *                   verified: true
 *                   kycStatus: approved
 *                   isActive: true
 *                   lastLoginAt: "2025-10-15T10:30:00Z"
 *                   createdAt: "2025-01-20T08:15:00Z"
 *                 stats:
 *                   totalListings: 5
 *                   activeListings: 3
 *                   totalRevenue: 250000
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/profile", authenticate, AuthController.getProfile)

export default router