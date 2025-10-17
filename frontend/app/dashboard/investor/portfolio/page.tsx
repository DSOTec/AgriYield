"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp, DollarSign, PieChart as PieChartIcon } from "lucide-react"
import { useInvestment } from "@/lib/investment-context"

export default function PortfolioPage() {
  const { portfolio, summary, isLoading } = useInvestment()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold">Investment Portfolio</h1>
        <p className="text-muted-foreground mt-1">
          Detailed breakdown of your investments across farms
        </p>
      </motion.div>

      {/* Portfolio Overview */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="border-2 border-emerald-200 dark:border-emerald-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                ${(summary.totalAmount + summary.totalReturns).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Principal + Returns
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {summary.averageROI.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all investments
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Farms</CardTitle>
              <PieChartIcon className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {portfolio.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Diversified portfolio
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Farm Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Breakdown by Farm</CardTitle>
            <CardDescription>
              Your investment distribution across different farms
            </CardDescription>
          </CardHeader>
          <CardContent>
            {portfolio.length === 0 ? (
              <div className="text-center py-12">
                <PieChartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No portfolio data available yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {portfolio.map((item, index) => (
                  <motion.div
                    key={item.farmId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.farmName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.investmentCount} {item.investmentCount === 1 ? 'investment' : 'investments'}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-lg font-bold">
                        ${item.totalInvested.toLocaleString()}
                      </p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        +${item.totalReturns.toLocaleString()} ({item.roi.toFixed(2)}%)
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
