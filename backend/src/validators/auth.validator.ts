import { z } from "zod"

export const signupPasswordSchema = z.object({
    email: z.string().email("Invalid email format"),
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["investor", "farmer"], {
        errorMap: () => ({ message: "Role must be either 'investor' or 'farmer'" }),
    }),
    farmName: z.string().optional(),
    farmDescription: z.string().max(1000, "Description too long").optional(),
    location: z.string().optional(),
    nin: z.string().optional(),
})

export const signinPasswordSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
})

export const signupSchema = z.object({
    email: z.string().email("Invalid email format"),
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
    role: z.enum(["investor", "farmer"], {
        errorMap: () => ({ message: "Role must be either 'investor' or 'farmer'" }),
    }),
    farmName: z.string().optional(),
    farmDescription: z.string().max(1000, "Description too long").optional(),
    location: z.string().optional(),
    nin: z.string().optional(),
    magicToken: z.string().min(1, "Magic token is required"),
})

export const signinSchema = z.object({
    magicToken: z.string().min(1, "Magic token is required"),
})

export const connectWalletSchema = z.object({
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address format"),
})

export const verifyEmailSchema = z.object({
    email: z.string().email("Invalid email format"),
    code: z.string().length(6, "Verification code must be 6 digits"),
})

export const resendVerificationSchema = z.object({
    email: z.string().email("Invalid email format"),
})

export const validateFarmerFields = (data: any) => {
    if (data.role === "farmer") {
        if (!data.farmName || data.farmName.trim() === "") {
            throw new Error("Farm name is required for farmer registration")
        }
        if (!data.location || data.location.trim() === "") {
            throw new Error("Location is required for farmer registration")
        }
    }
}
