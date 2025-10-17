"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar, DollarSign, Loader2 } from "lucide-react"
import { Investment } from "@/lib/api/investment.service"
import { useState } from "react"
import { useInvestment } from "@/lib/investment-context"
import { toast } from "sonner"

interface InvestmentCardProps {
  investment: Investment
  farmName?: string
}

export function InvestmentCard({ investment, farmName }: InvestmentCardProps) {
  const [isClaiming, setIsClaiming] = useState(false)
  const { claimYield } = useInvestment()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const handleClaimYield = async () => {
    setIsClaiming(true)
    try {
      await claimYield(investment.farmId)
      toast.success("🎉 Yield claimed successfully!", {
        description: "Your AGT tokens have been transferred to your wallet",
      })
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to claim yield")
    } finally {
      setIsClaiming(false)
    }
  }

  const canClaimYield = investment.status === 'active' && investment.nextPayoutDate && 
    new Date(investment.nextPayoutDate) <= new Date()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{farmName || 'Farm Investment'}</CardTitle>
            <Badge className={getStatusColor(investment.status)}>
              {investment.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>Amount Invested</span>
              </div>
              <p className="text-xl font-bold">${investment.amount.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>ROI</span>
              </div>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {investment.roi}%
              </p>
            </div>
          </div>

          {investment.nextPayoutDate && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Next Payout</span>
              </div>
              <p className="text-sm font-medium">
                {new Date(investment.nextPayoutDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}

          {investment.totalPaidOut !== undefined && investment.totalPaidOut > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Paid Out</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ${investment.totalPaidOut.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {canClaimYield && (
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={handleClaimYield}
              disabled={isClaiming}
            >
              {isClaiming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Claiming...
                </>
              ) : (
                'Claim Yield'
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
