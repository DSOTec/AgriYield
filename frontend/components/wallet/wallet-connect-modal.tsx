"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, Loader2 } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState("")
  const { connectWallet } = useAuth()

  const generateMockWallet = () => {
    // Generate a random Ethereum-like address
    const randomHex = Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')
    return `0x${randomHex}`
  }

  const handleConnect = async () => {
    if (!walletAddress) {
      setError("Please enter a wallet address or generate one")
      return
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      setError("Invalid wallet address format. Must be 0x followed by 40 hex characters")
      return
    }

    setConnecting(true)
    setError(null)
    
    try {
      // Connect wallet to backend
      await connectWallet(walletAddress.toLowerCase())
      
      setConnecting(false)
      onClose()
    } catch (err: any) {
      console.error("Wallet connection error:", err)
      setError(err.response?.data?.message || err.message || "Failed to connect wallet. Please try again.")
      setConnecting(false)
    }
  }

  const handleGenerateWallet = () => {
    const newWallet = generateMockWallet()
    setWalletAddress(newWallet)
    setError(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Wallet className="h-6 w-6 text-emerald-600" />
                Connect Wallet
              </DialogTitle>
              <DialogDescription>Enter or generate a mock wallet address for testing</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="wallet-address">Wallet Address</Label>
                <Input
                  id="wallet-address"
                  type="text"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="font-mono text-sm"
                  disabled={connecting}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a valid Ethereum address (0x + 40 hex characters)
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleGenerateWallet}
                  disabled={connecting}
                >
                  Generate Random Wallet
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleConnect}
                  disabled={connecting || !walletAddress}
                >
                  {connecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Connecting...
                    </>
                  ) : (
                    "Connect Wallet"
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400"
              >
                {error}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm"
            >
              <p className="text-amber-800 dark:text-amber-200 font-medium mb-1">
                🧪 Mock Wallet Mode
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-xs">
                This is a testing environment. Generate a random wallet or enter any valid Ethereum address format for testing purposes.
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
