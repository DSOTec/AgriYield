

import dotenv from "dotenv"

dotenv.config()

export const envConfig = {
  PORT: process.env.PORT || 8000,
  MONGODB_URI: process.env.MONGODB_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "7d",
  MAGIC_SECRET_KEY: process.env.MAGIC_SECRET_KEY || "",
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  
  // Email Configuration
  EMAIL_HOST: process.env.EMAIL_HOST || "",
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || "587"),
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "",
  //   PINATA_API_KEY: string
  //   PINATA_API_SECRET: string
  //   CONTRACT_FARM_REGISTRY: string
  //   CONTRACT_FARM_FUNDING: string
  //   CONTRACT_PROFIT_POOL: string
  //   MAGIC_API_KEY: string

}

const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "MAGIC_SECRET_KEY"]
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key])

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`)
}
