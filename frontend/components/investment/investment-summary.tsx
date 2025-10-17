"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, PieChart, CheckCircle } from "lucide-react"
import { InvestmentSummary as ISummary } from "@/lib/api/investment.service"

interface InvestmentSummaryProps {
  summary: ISummary
}

export function InvestmentSummary({ summary }: InvestmentSummaryProps) {
  const stats = [
    {
      title: "Total Invested",
      value: `$${summary.totalAmount.toLocaleString()}`,
      icon: DollarSign,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Total Returns",
      value: `$${summary.totalReturns.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      title: "Active Investments",
      value: summary.activeInvestments.toString(),
      icon: PieChart,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      title: "Completed",
      value: summary.completedInvestments.toString(),
      icon: CheckCircle,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.title === "Total Returns" && summary.averageROI > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Avg ROI: {summary.averageROI.toFixed(2)}%
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
