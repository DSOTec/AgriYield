"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Plus, Leaf } from "lucide-react"
import { useFarm } from "@/lib/farm-context"
import { FarmCard } from "@/components/farm/farm-card"
import Link from "next/link"

export default function MyFarmsPage() {
  const { myFarms, isLoading } = useFarm()
  const [activeTab, setActiveTab] = useState("all")

  const filteredFarms = myFarms.filter((farm) => {
    if (activeTab === "all") return true
    return farm.status === activeTab
  })

  const statusCounts = {
    all: myFarms.length,
    pending: myFarms.filter((f) => f.status === "pending").length,
    verified: myFarms.filter((f) => f.status === "verified").length,
    active: myFarms.filter((f) => f.status === "active").length,
    completed: myFarms.filter((f) => f.status === "completed").length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Farms</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track your farm listings
            </p>
          </div>
          <Link href="/dashboard/farmer/create-farm">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Farm
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
            <TabsTrigger value="verified">Verified ({statusCounts.verified})</TabsTrigger>
            <TabsTrigger value="active">Active ({statusCounts.active})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({statusCounts.completed})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredFarms.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Leaf className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No farms found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {activeTab === "all"
                      ? "Create your first farm to start attracting investors"
                      : `You don't have any ${activeTab} farms yet`}
                  </p>
                  <Link href="/dashboard/farmer/create-farm">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Farm
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFarms.map((farm) => (
                  <FarmCard key={farm._id} farm={farm} showInvestButton={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
