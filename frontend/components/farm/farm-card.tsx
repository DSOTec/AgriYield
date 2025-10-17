"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, TrendingUp, Calendar, DollarSign } from "lucide-react"
import { Farm } from "@/lib/api/farm.service"
import Link from "next/link"
import { useState } from "react"
import { InvestmentModal } from "@/components/investment/investment-modal"

interface FarmCardProps {
  farm: Farm
  showInvestButton?: boolean
}

export function FarmCard({ farm, showInvestButton = true }: FarmCardProps) {
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false)

  const fundingPercentage = farm.targetAmount > 0 
    ? ((farm.currentAmount || 0) / farm.targetAmount) * 100 
    : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
      case 'verified':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
      case 'completed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'delisted':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="h-full flex flex-col border-2 hover:shadow-xl transition-shadow overflow-hidden">
          {/* Farm Image */}
          <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-amber-100 dark:from-emerald-900 dark:to-amber-900">
            {farm.imageUrl ? (
              <img
                src={farm.imageUrl}
                alt={farm.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                🌾
              </div>
            )}
            <div className="absolute top-3 right-3">
              <Badge className={getStatusColor(farm.status)}>
                {farm.status}
              </Badge>
            </div>
          </div>

          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <Link href={`/farm/${farm._id}`} className="flex-1">
                <h3 className="text-xl font-bold hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-1">
                  {farm.name}
                </h3>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {farm.description}
            </p>
          </CardHeader>

          <CardContent className="flex-1 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{farm.location}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>ROI</span>
                </div>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {farm.expectedROI}%
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Duration</span>
                </div>
                <p className="text-lg font-bold">
                  {farm.duration} months
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Funding Progress</span>
                <span className="font-semibold">{fundingPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={fundingPercentage} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>${(farm.currentAmount || 0).toLocaleString()} raised</span>
                <span>Goal: ${farm.targetAmount.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-0">
            {showInvestButton && farm.status === 'active' ? (
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setIsInvestModalOpen(true)}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Invest Now
              </Button>
            ) : (
              <Link href={`/farm/${farm._id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      </motion.div>

      {showInvestButton && (
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
    </>
  )
}
