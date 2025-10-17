"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "farmer" | "investor"
  requireWallet?: boolean
}

export function ProtectedRoute({ children, requiredRole, requireWallet = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading) {
        console.log("[ProtectedRoute] Auth check:", { user, requiredRole })
        
        // Not signed in - redirect to sign in
        if (!user) {
          console.log("[ProtectedRoute] No user found, redirecting to signin")
          setIsRedirecting(true)
          router.replace("/signin")
          return
        }

        // Wrong role - redirect to correct dashboard
        if (requiredRole && user.role !== requiredRole) {
          console.log("[ProtectedRoute] Wrong role, redirecting to correct dashboard")
          setIsRedirecting(true)
          const correctDashboard = user.role === "farmer" ? "/dashboard/farmer" : "/dashboard/investor"
          router.replace(correctDashboard)
          return
        }

        // Wallet required but not connected - stay on page but show message
        if (requireWallet && !user.walletConnected) {
          // Allow access but components can check wallet status
          return
        }
        
        console.log("[ProtectedRoute] Auth check passed, rendering children")
      }
    }

    checkAuth()
  }, [user, isLoading, router, requiredRole, requireWallet])

  // Show loading state
  if (isLoading || isRedirecting) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950 dark:via-slate-900 dark:to-amber-950"
      >
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-12 w-12 mx-auto text-emerald-600 dark:text-emerald-400" />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground font-medium"
          >
            {isRedirecting ? "Redirecting..." : "Loading..."}
          </motion.p>
        </div>
      </motion.div>
    )
  }

  // Not authenticated or wrong role - show loading while redirecting
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950 dark:via-slate-900 dark:to-amber-950"
      >
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-12 w-12 mx-auto text-emerald-600 dark:text-emerald-400" />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground font-medium"
          >
            Redirecting...
          </motion.p>
        </div>
      </motion.div>
    )
  }

  // Authenticated and authorized - render children
  return <>{children}</>
}
