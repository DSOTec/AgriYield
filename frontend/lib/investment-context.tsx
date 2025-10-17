"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { investmentService, type Investment, type InvestmentSummary, type PortfolioMetrics } from "./api/investment.service"
import { useAuth } from "./auth-context"

interface InvestmentContextType {
  investments: Investment[]
  summary: InvestmentSummary | null
  portfolio: PortfolioMetrics[]
  isLoading: boolean
  createInvestment: (farmId: string, amount: number, duration?: number) => Promise<Investment>
  claimYield: (farmId: string) => Promise<void>
  processPayout: (investmentId: string) => Promise<void>
  refreshInvestments: () => Promise<void>
  refreshSummary: () => Promise<void>
  refreshPortfolio: () => Promise<void>
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined)

export function InvestmentProvider({ children }: { children: ReactNode }) {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [summary, setSummary] = useState<InvestmentSummary | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioMetrics[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const refreshInvestments = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    try {
      const data = await investmentService.getInvestmentsByInvestor(user.id)
      setInvestments(data)
    } catch (error) {
      console.error("Failed to fetch investments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSummary = async () => {
    if (!user?.id) return
    
    try {
      const data = await investmentService.getInvestorSummary(user.id)
      setSummary(data)
    } catch (error) {
      console.error("Failed to fetch summary:", error)
    }
  }

  const refreshPortfolio = async () => {
    if (!user?.id) return
    
    try {
      const data = await investmentService.getPortfolioMetrics(user.id)
      setPortfolio(data)
    } catch (error) {
      console.error("Failed to fetch portfolio:", error)
    }
  }

  const createInvestment = async (farmId: string, amount: number, duration?: number) => {
    if (!user?.id || !user?.walletAddress) {
      throw new Error("User ID and wallet address required")
    }

    const investment = await investmentService.createInvestment({
      farmId,
      investorId: user.id,
      amount,
      walletAddress: user.walletAddress,
      duration,
    })

    // Confirm the investment
    await investmentService.confirmInvestment(investment._id)

    // Refresh data
    await refreshInvestments()
    await refreshSummary()
    await refreshPortfolio()

    return investment
  }

  const claimYield = async (farmId: string) => {
    await investmentService.claimYield(farmId)
    
    // Refresh data
    await refreshInvestments()
    await refreshSummary()
  }

  const processPayout = async (investmentId: string) => {
    await investmentService.processPayou(investmentId)
    
    // Refresh data
    await refreshInvestments()
    await refreshSummary()
  }

  // Load investments on mount if user is logged in
  useEffect(() => {
    if (user?.id && user?.role === 'investor') {
      refreshInvestments()
      refreshSummary()
      refreshPortfolio()
    }
  }, [user?.id])

  return (
    <InvestmentContext.Provider
      value={{
        investments,
        summary,
        portfolio,
        isLoading,
        createInvestment,
        claimYield,
        processPayout,
        refreshInvestments,
        refreshSummary,
        refreshPortfolio,
      }}
    >
      {children}
    </InvestmentContext.Provider>
  )
}

export function useInvestment() {
  const context = useContext(InvestmentContext)
  if (context === undefined) {
    throw new Error("useInvestment must be used within InvestmentProvider")
  }
  return context
}
