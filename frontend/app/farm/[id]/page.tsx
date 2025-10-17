"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, MapPin, TrendingUp, Calendar, DollarSign, User, ArrowLeft } from "lucide-react"
import { useFarm } from "@/lib/farm-context"
import { useAuth } from "@/lib/auth-context"
import { Farm } from "@/lib/api/farm.service"
import { InvestmentModal } from "@/components/investment/investment-modal"
import { FundingActivity } from "@/components/farmer/funding-activity"
import Link from "next/link"
import { toast } from "sonner"

export default function FarmDetailsPage() {
  const params = useParams()
  const farmId = params.id as string
  const [farm, setFarm] = useState<Farm | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const { getFarmById, verifyFarm } = useFarm()
  const { user } = useAuth()

  useEffect(() => {
    loadFarm()
  }, [farmId])

  const loadFarm = async () => {
    setIsLoading(true)
    try {
      const data = await getFarmById(farmId)
      setFarm(data)
    } catch (error) {
      console.error("Failed to load farm:", error)
      toast.error("Failed to load farm details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!farm) return
    
    setIsVerifying(true)
    try {
      await verifyFarm(farm._id)
      toast.success("✅ Farm verified successfully")
      await loadFarm()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to verify farm")
    } finally {
      setIsVerifying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!farm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Farm not found</h1>
        <Link href="/farms">
          <Button>Browse Farms</Button>
        </Link>
      </div>
    )
  }

  const fundingPercentage = farm.targetAmount > 0 
    ? ((farm.currentAmount || 0) / farm.targetAmount) * 100 
    : 0

  const isOwner = user?.id === farm.farmerId
  const isAdmin = user?.role === 'admin'
  const canInvest = farm.status === 'active' && !isOwner

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950 dark:via-slate-900 dark:to-amber-950">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Link
          href="/farms"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Farms
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="relative h-64 rounded-lg overflow-hidden mb-6 bg-gradient-to-br from-emerald-100 to-amber-100 dark:from-emerald-900 dark:to-amber-900">
                  {farm.imageUrl ? (
                    <img src={farm.imageUrl} alt={farm.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl">🌾</div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge>{farm.status}</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{farm.name}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{farm.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{farm.farmerName || 'Farmer'}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{farm.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>ROI</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">{farm.expectedROI}%</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>Duration</span>
                    </div>
                    <p className="text-2xl font-bold">{farm.duration}mo</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span>Target</span>
                    </div>
                    <p className="text-2xl font-bold">${farm.targetAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-sm text-muted-foreground mb-1">Crop</div>
                    <p className="text-xl font-bold">{farm.cropType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isOwner && <FundingActivity farmId={farm._id} fundingGoal={farm.targetAmount} />}
          </div>

          <div className="space-y-6">
            <Card className="border-2 border-emerald-200 dark:border-emerald-800">
              <CardHeader>
                <CardTitle>Investment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Funding Progress</span>
                    <span className="font-semibold">{fundingPercentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={fundingPercentage} className="h-3" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>${(farm.currentAmount || 0).toLocaleString()}</span>
                    <span>${farm.targetAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Expected ROI</span>
                    <span className="text-lg font-bold text-emerald-600">{farm.expectedROI}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="font-semibold">{farm.duration} months</span>
                  </div>
                </div>

                {canInvest && (
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4"
                    onClick={() => setIsInvestModalOpen(true)}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Invest Now
                  </Button>
                )}

                {isAdmin && farm.status === 'pending' && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                    onClick={handleVerify}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Farm'
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {canInvest && (
        <InvestmentModal
          isOpen={isInvestModalOpen}
          onClose={() => setIsInvestModalOpen(false)}
          farm={{
            _id: farm._id,
            name: farm.name,
            roi: farm.expectedROI,
            minInvestment: 100,
            maxInvestment: farm.targetAmount - (farm.currentAmount || 0),
          }}
        />
      )}
    </div>
  )
}
