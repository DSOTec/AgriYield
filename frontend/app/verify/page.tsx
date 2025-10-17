"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function VerifyPage() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(90)
  const [canResend, setCanResend] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const { verifyEmail, resendVerificationCode, pendingVerificationEmail, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  useEffect(() => {
    // If no pending email and no user, redirect to signin
    if (!pendingVerificationEmail && !user) {
      router.push("/signin")
    }
    // If user is already verified, redirect to dashboard
    if (user?.isVerified) {
      const dashboardPath = user.role === "farmer" ? "/dashboard/farmer" : "/dashboard/investor"
      router.push(dashboardPath)
    }
  }, [pendingVerificationEmail, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pendingVerificationEmail) return

    setIsLoading(true)
    setError("")
    try {
      await verifyEmail(pendingVerificationEmail, code)
      setIsVerified(true)
      toast.success("✓ Email verified successfully!")

      // Redirect to dashboard after brief delay
      setTimeout(() => {
        router.push("/signin")
      }, 1500)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Invalid verification code"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setCode(value)
    setError("")
  }

  const handleResend = useCallback(async () => {
    if (!canResend || !pendingVerificationEmail) return
    try {
      await resendVerificationCode(pendingVerificationEmail)
      setCountdown(90)
      setCanResend(false)
      toast.success("Verification code sent successfully")
    } catch (err: any) {
      toast.error("Failed to resend code. Please try again.")
    }
  }, [canResend, pendingVerificationEmail, resendVerificationCode])

  const handleChangeEmail = () => {
    router.push("/signup")
  }

  if (!pendingVerificationEmail) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950 dark:via-slate-900 dark:to-amber-950">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.5,
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="w-full max-w-md relative z-10"
      >
        <Link
          href="/signin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <Card className="border-emerald-200 dark:border-emerald-800 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <AnimatePresence mode="wait">
              {isVerified ? (
                <motion.div
                  key="verified"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.6, times: [0, 0.6, 1] }}
                  className="mx-auto h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4"
                >
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="mail"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4"
                >
                  <Mail className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </motion.div>
              )}
            </AnimatePresence>
            <CardTitle className="text-2xl font-bold">{isVerified ? "Verified!" : "Check your email"}</CardTitle>
            <CardDescription>
              {isVerified ? (
                "Redirecting to sign in..."
              ) : (
                <>
                  We sent a verification email to
                  <br />
                  <span className="font-medium text-foreground">{pendingVerificationEmail}</span>
                  <br />
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 block font-medium">
                    ✨ Click the magic link in your email for instant verification
                  </span>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    Or enter the 6-digit code below
                  </span>
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isVerified && (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      placeholder="000000"
                      value={code}
                      onChange={handleCodeChange}
                      required
                      className="text-center text-2xl tracking-widest font-mono"
                      maxLength={6}
                    />
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-red-500"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <Button type="submit" className="w-full gradient-primary" disabled={isLoading || code.length !== 6}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      "Verify Email"
                    )}
                  </Button>
                </form>

                <div className="mt-6 space-y-3">
                  <div className="text-center text-sm">
                    {countdown > 0 ? (
                      <p className="text-muted-foreground">
                        Resend code in{" "}
                        <span className="font-mono font-semibold text-foreground">
                          {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                        </span>
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        Didn't receive the code?{" "}
                        <button
                          type="button"
                          onClick={handleResend}
                          className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                        >
                          Resend
                        </button>
                      </p>
                    )}
                  </div>
                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={handleChangeEmail}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Change email address
                    </button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
