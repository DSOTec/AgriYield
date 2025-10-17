"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { farmService, type Farm, type FarmFilters, type FarmSummary } from "./api/farm.service"
import { useAuth } from "./auth-context"

interface FarmContextType {
  farms: Farm[]
  myFarms: Farm[]
  pendingFarms: Farm[]
  isLoading: boolean
  createFarm: (payload: any) => Promise<Farm>
  updateFarm: (id: string, payload: any) => Promise<Farm>
  deleteFarm: (id: string) => Promise<void>
  verifyFarm: (id: string) => Promise<Farm>
  delistFarm: (id: string) => Promise<Farm>
  getFarmById: (id: string) => Promise<Farm>
  getFarmSummary: (id: string) => Promise<FarmSummary>
  searchFarms: (params: any) => Promise<Farm[]>
  refreshFarms: (filters?: FarmFilters) => Promise<void>
  refreshMyFarms: () => Promise<void>
  refreshPendingFarms: () => Promise<void>
}

const FarmContext = createContext<FarmContextType | undefined>(undefined)

export function FarmProvider({ children }: { children: ReactNode }) {
  const [farms, setFarms] = useState<Farm[]>([])
  const [myFarms, setMyFarms] = useState<Farm[]>([])
  const [pendingFarms, setPendingFarms] = useState<Farm[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const refreshFarms = async (filters?: FarmFilters) => {
    setIsLoading(true)
    try {
      const data = await farmService.getAllFarms(filters)
      setFarms(data)
    } catch (error) {
      console.error("Failed to fetch farms:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshMyFarms = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const data = await farmService.getFarmerFarms(user.id)
      setMyFarms(data)
    } catch (error) {
      console.error("Failed to fetch my farms:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshPendingFarms = async () => {
    setIsLoading(true)
    try {
      const data = await farmService.getPendingFarms()
      setPendingFarms(data)
    } catch (error) {
      console.error("Failed to fetch pending farms:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createFarm = async (payload: any) => {
    const farm = await farmService.createFarm(payload)
    await refreshMyFarms()
    return farm
  }

  const updateFarm = async (id: string, payload: any) => {
    const farm = await farmService.updateFarm(id, payload)
    await refreshMyFarms()
    await refreshFarms()
    return farm
  }

  const deleteFarm = async (id: string) => {
    await farmService.deleteFarm(id)
    await refreshMyFarms()
    await refreshFarms()
  }

  const verifyFarm = async (id: string) => {
    const farm = await farmService.verifyFarm(id)
    await refreshPendingFarms()
    await refreshFarms()
    return farm
  }

  const delistFarm = async (id: string) => {
    const farm = await farmService.delistFarm(id)
    await refreshFarms()
    return farm
  }

  const getFarmById = async (id: string) => {
    return await farmService.getFarmById(id)
  }

  const getFarmSummary = async (id: string) => {
    return await farmService.getFarmSummary(id)
  }

  const searchFarms = async (params: any) => {
    return await farmService.searchFarms(params)
  }

  // Load farms on mount
  useEffect(() => {
    refreshFarms({ verified: true, status: 'active' })
  }, [])

  // Load farmer's farms if user is a farmer
  useEffect(() => {
    if (user?.id && user?.role === 'farmer') {
      refreshMyFarms()
    }
  }, [user?.id, user?.role])

  // Load pending farms if user is admin
  useEffect(() => {
    if (user?.role === 'admin') {
      refreshPendingFarms()
    }
  }, [user?.role])

  return (
    <FarmContext.Provider
      value={{
        farms,
        myFarms,
        pendingFarms,
        isLoading,
        createFarm,
        updateFarm,
        deleteFarm,
        verifyFarm,
        delistFarm,
        getFarmById,
        getFarmSummary,
        searchFarms,
        refreshFarms,
        refreshMyFarms,
        refreshPendingFarms,
      }}
    >
      {children}
    </FarmContext.Provider>
  )
}

export function useFarm() {
  const context = useContext(FarmContext)
  if (context === undefined) {
    throw new Error("useFarm must be used within FarmProvider")
  }
  return context
}
