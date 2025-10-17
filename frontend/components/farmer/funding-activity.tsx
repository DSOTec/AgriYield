"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Users, DollarSign, TrendingUp, CheckCircle } from "lucide-react"
import { investmentService, Investment } from "@/lib/api/investment.service"
import { toast } from "sonner"

interface FundingActivityProps {
  farmId: string
  fundingGoal?: number
}

export function FundingActivity({ farmId, fundingGoal = 100000 }: FundingActivityProps) {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [completingId, setCompletingId] = useState<string | null>(null)

  useEffect(() => {
    loadInvestments()
  }, [farmId])

  const loadInvestments = async () => {
    setIsLoading(true)
    try {
      const data = await investmentService.getInvestmentsByFarm(farmId)
      setInvestments(data)
    } catch (error) {
      console.error("Failed to load investments:", error)
      toast.error("Failed to load funding activity")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteInvestment = async (investmentId: string) => {
    setCompletingId(investmentId)
    try {
      await investmentService.completeInvestment(investmentId)
      toast.success("Investment marked as complete")
      await loadInvestments()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to complete investment")
    } finally {
      setCompletingId(null)
    }
  }

  const totalFunding = investments.reduce((sum, inv) => sum + inv.amount, 0)
  const fundingProgress = (totalFunding / fundingGoal) * 100
  const activeInvestors = investments.filter((inv) => inv.status === "active").length

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Funding Overview */}
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Funding Activity
          </CardTitle>
          <CardDescription>Track your farm's investment progress</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Raised</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ${totalFunding.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Funding Goal</p>
              <p className="text-2xl font-bold">${fundingGoal.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active Investors</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                {activeInvestors}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{fundingProgress.toFixed(1)}%</span>
            </div>
            <Progress value={fundingProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Investors List */}
      <Card>
        <CardHeader>
          <CardTitle>Investors</CardTitle>
          <CardDescription>
            {investments.length} {investments.length === 1 ? 'investor' : 'investors'} supporting your farm
          </CardDescription>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No investments yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {investments.map((investment, index) => (
                <motion.div
                  key={investment._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Investor #{investment.investorId.slice(-6)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(investment.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold">${investment.amount.toLocaleString()}</p>
                      <Badge
                        variant={investment.status === 'active' ? 'default' : 'secondary'}
                        className={
                          investment.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                            : ''
                        }
                      >
                        {investment.status}
                      </Badge>
                    </div>
                    {investment.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompleteInvestment(investment._id)}
                        disabled={completingId === investment._id}
                      >
                        {completingId === investment._id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Completing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Complete
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
