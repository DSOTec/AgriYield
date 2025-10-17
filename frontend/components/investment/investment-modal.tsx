"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, TrendingUp, Wallet, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useInvestment } from "@/lib/investment-context"
import { toast } from "sonner"

interface InvestmentModalProps {
  isOpen: boolean
  onClose: () => void
  farm: {
    _id: string
    name: string
    roi: number
    minInvestment?: number
    maxInvestment?: number
  }
}

export function InvestmentModal({ isOpen, onClose, farm }: InvestmentModalProps) {
  const [amount, setAmount] = useState("")
  const [duration, setDuration] = useState("12")
  const [isInvesting, setIsInvesting] = useState(false)
  const { user } = useAuth()
  const { createInvestment } = useInvestment()

  const calculateReturns = () => {
    const investmentAmount = parseFloat(amount) || 0
    const roi = farm.roi || 0
    const months = parseInt(duration) || 12
    
    const totalReturns = investmentAmount * (roi / 100) * (months / 12)
    const totalAmount = investmentAmount + totalReturns
    
    return {
      returns: totalReturns.toFixed(2),
      total: totalAmount.toFixed(2),
    }
  }

  const handleInvest = async () => {
    if (!user?.walletConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    const investmentAmount = parseFloat(amount)
    if (!investmentAmount || investmentAmount <= 0) {
      toast.error("Please enter a valid investment amount")
      return
    }

    if (farm.minInvestment && investmentAmount < farm.minInvestment) {
      toast.error(`Minimum investment is $${farm.minInvestment}`)
      return
    }

    if (farm.maxInvestment && investmentAmount > farm.maxInvestment) {
      toast.error(`Maximum investment is $${farm.maxInvestment}`)
      return
    }

    setIsInvesting(true)
    try {
      await createInvestment(farm._id, investmentAmount, parseInt(duration))
      
      toast.success("🎉 Investment successful!", {
        description: `You've invested $${amount} in ${farm.name}`,
      })
      
      onClose()
      setAmount("")
      setDuration("12")
    } catch (error: any) {
      console.error("Investment error:", error)
      toast.error(error.response?.data?.message || "Investment failed. Please try again.")
    } finally {
      setIsInvesting(false)
    }
  }

  const returns = calculateReturns()

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
                <TrendingUp className="h-6 w-6 text-emerald-600" />
                Invest in {farm.name}
              </DialogTitle>
              <DialogDescription>
                Enter your investment amount and duration to start earning yields
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-6">
              {/* Wallet Status */}
              {!user?.walletConnected && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-2"
                >
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200">Wallet Required</p>
                    <p className="text-amber-700 dark:text-amber-300">
                      Please connect your wallet before investing
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Investment Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Investment Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isInvesting}
                  min={farm.minInvestment || 0}
                  max={farm.maxInvestment}
                />
                {farm.minInvestment && (
                  <p className="text-xs text-muted-foreground">
                    Min: ${farm.minInvestment} {farm.maxInvestment && `• Max: $${farm.maxInvestment}`}
                  </p>
                )}
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (Months)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="12"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={isInvesting}
                  min="1"
                  max="60"
                />
              </div>

              {/* ROI Display */}
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Expected ROI</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {farm.roi}%
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Estimated Returns</span>
                  <span className="text-lg font-semibold">${returns.returns}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-emerald-200 dark:border-emerald-800">
                  <span className="text-sm font-medium">Total Amount</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    ${returns.total}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isInvesting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleInvest}
                  disabled={isInvesting || !user?.walletConnected || !amount}
                >
                  {isInvesting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Invest Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
