"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Mail, Sprout, TrendingUp, Eye, EyeOff, Check, X, Loader2 } from "lucide-react"

export default function SignUpPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [role, setRole] = useState<"farmer" | "investor">("investor")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { signUp } = useAuth()
  const router = useRouter()

  const passwordValidation = {
    minLength: password.length >= 8,
    match: password === confirmPassword && confirmPassword.length > 0,
  }

  const isPasswordValid = passwordValidation.minLength && passwordValidation.match

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordValid) return

    setIsLoading(true)
    setError("")
    try {
      await signUp(fullName, email, role, password)
      // Redirect to verification page
      router.push("/verify")
    } catch (err: any) {
      console.error("Sign up error:", err)
      setError(err.response?.data?.message || "Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950 dark:via-slate-900 dark:to-amber-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>Join AgriYield and start your journey</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2 text-sm"
                >
                  <div
                    className={`flex items-center gap-2 ${passwordValidation.minLength ? "text-green-600" : "text-muted-foreground"}`}
                  >
                    {passwordValidation.minLength ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    <span>At least 8 characters</span>
                  </div>
                  {confirmPassword && (
                    <div
                      className={`flex items-center gap-2 ${passwordValidation.match ? "text-green-600" : "text-red-600"}`}
                    >
                      {passwordValidation.match ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      <span>Passwords match</span>
                    </div>
                  )}
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-sm text-red-600 bg-red-50 dark:bg-red-950 p-3 rounded-md"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-3">
                <Label>I want to join as</Label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole("farmer")}
                    className={`flex flex-col items-center gap-2 border-2 rounded-lg p-4 transition-all ${
                      role === "farmer"
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950 shadow-lg shadow-emerald-500/20"
                        : "border-border hover:border-emerald-300 dark:hover:border-emerald-700"
                    }`}
                  >
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
                        role === "farmer" ? "bg-emerald-500" : "bg-emerald-100 dark:bg-emerald-900"
                      }`}
                    >
                      <Sprout
                        className={`h-6 w-6 ${role === "farmer" ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`}
                      />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">Farmer</div>
                      <div className="text-xs text-muted-foreground">Tokenize farms</div>
                    </div>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole("investor")}
                    className={`flex flex-col items-center gap-2 border-2 rounded-lg p-4 transition-all ${
                      role === "investor"
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950 shadow-lg shadow-amber-500/20"
                        : "border-border hover:border-amber-300 dark:hover:border-amber-700"
                    }`}
                  >
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
                        role === "investor" ? "bg-amber-500" : "bg-amber-100 dark:bg-amber-900"
                      }`}
                    >
                      <TrendingUp
                        className={`h-6 w-6 ${role === "investor" ? "text-white" : "text-amber-600 dark:text-amber-400"}`}
                      />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">Investor</div>
                      <div className="text-xs text-muted-foreground">Earn returns</div>
                    </div>
                  </motion.button>
                </div>
              </div>

              <Button type="submit" className="w-full gradient-primary" disabled={isLoading || !isPasswordValid}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/signin" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
