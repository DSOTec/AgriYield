"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, TrendingUp, Wallet, PieChart } from "lucide-react"
import { useInvestment } from "@/lib/investment-context"
import { InvestmentCard } from "@/components/investment/investment-card"
import { InvestmentSummary } from "@/components/investment/investment-summary"

export default function InvestmentsPage() {
  const { investments, summary, isLoading } = useInvestment()
  const [activeTab, setActiveTab] = useState("all")

  const filteredInvestments = investments.filter((inv) => {
    if (activeTab === "all") return true
    if (activeTab === "active") return inv.status === "active"
    if (activeTab === "completed") return inv.status === "completed"
    if (activeTab === "pending") return inv.status === "pending"
    return true
  })

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Investments</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your farm investments
            </p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <TrendingUp className="h-4 w-4 mr-2" />
            Explore Farms
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <InvestmentSummary summary={summary} />
        </motion.div>
      )}

      {/* Investments Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({investments.length})</TabsTrigger>
            <TabsTrigger value="active">
              Active ({investments.filter((i) => i.status === "active").length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({investments.filter((i) => i.status === "completed").length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({investments.filter((i) => i.status === "pending").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredInvestments.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <PieChart className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No investments found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {activeTab === "all"
                      ? "Start investing in farms to see them here"
                      : `You don't have any ${activeTab} investments yet`}
                  </p>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Browse Farms
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInvestments.map((investment) => (
                  <InvestmentCard
                    key={investment._id}
                    investment={investment}
                    farmName={`Farm #${investment.farmId.slice(-6)}`}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
