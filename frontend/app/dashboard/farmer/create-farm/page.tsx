"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Leaf, ArrowLeft } from "lucide-react"
import { useFarm } from "@/lib/farm-context"
import { toast } from "sonner"
import Link from "next/link"

const farmSchema = z.object({
  name: z.string().min(3, "Farm name must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(3, "Location is required"),
  cropType: z.string().min(2, "Crop type is required"),
  expectedROI: z.number().min(1, "ROI must be at least 1%").max(100, "ROI cannot exceed 100%"),
  duration: z.number().min(1, "Duration must be at least 1 month").max(60, "Duration cannot exceed 60 months"),
  targetAmount: z.number().min(1000, "Target amount must be at least $1,000"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

type FarmFormData = z.infer<typeof farmSchema>

export default function CreateFarmPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createFarm } = useFarm()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FarmFormData>({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      expectedROI: 15,
      duration: 12,
      targetAmount: 10000,
    },
  })

  const onSubmit = async (data: FarmFormData) => {
    setIsSubmitting(true)
    try {
      await createFarm(data)
      
      toast.success("🌾 Farm submitted for review!", {
        description: "Your farm will be verified by our team shortly.",
      })
      
      router.push("/dashboard/farmer/my-farms")
    } catch (error: any) {
      console.error("Farm creation error:", error)
      toast.error(error.response?.data?.message || "Failed to create farm. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/dashboard/farmer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900">
            <Leaf className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Create New Farm</h1>
            <p className="text-muted-foreground mt-1">
              List your farm to attract investors
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Farm Details</CardTitle>
            <CardDescription>
              Provide accurate information about your farm to attract investors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Farm Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Farm Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Green Valley Maize Farm"
                  {...register("name")}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your farm, farming practices, and what makes it unique..."
                  rows={4}
                  {...register("description")}
                  disabled={isSubmitting}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Location & Crop Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Lagos, Nigeria"
                    {...register("location")}
                    disabled={isSubmitting}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-600">{errors.location.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cropType">Crop Type *</Label>
                  <Input
                    id="cropType"
                    placeholder="e.g., Maize, Rice, Cassava"
                    {...register("cropType")}
                    disabled={isSubmitting}
                  />
                  {errors.cropType && (
                    <p className="text-sm text-red-600">{errors.cropType.message}</p>
                  )}
                </div>
              </div>

              {/* ROI & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expectedROI">Expected ROI (%) *</Label>
                  <Input
                    id="expectedROI"
                    type="number"
                    step="0.1"
                    {...register("expectedROI", { valueAsNumber: true })}
                    disabled={isSubmitting}
                  />
                  {errors.expectedROI && (
                    <p className="text-sm text-red-600">{errors.expectedROI.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Months) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    {...register("duration", { valueAsNumber: true })}
                    disabled={isSubmitting}
                  />
                  {errors.duration && (
                    <p className="text-sm text-red-600">{errors.duration.message}</p>
                  )}
                </div>
              </div>

              {/* Target Amount */}
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Funding Amount (USD) *</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  placeholder="10000"
                  {...register("targetAmount", { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
                {errors.targetAmount && (
                  <p className="text-sm text-red-600">{errors.targetAmount.message}</p>
                )}
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Farm Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/farm-image.jpg"
                  {...register("imageUrl")}
                  disabled={isSubmitting}
                />
                {errors.imageUrl && (
                  <p className="text-sm text-red-600">{errors.imageUrl.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Provide a URL to an image of your farm
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Create Farm"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
