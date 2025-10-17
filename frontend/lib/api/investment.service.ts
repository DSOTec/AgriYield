import { apiClient } from './client'

export interface Investment {
  _id: string
  farmId: string
  investorId: string
  amount: number
  walletAddress: string
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  roi: number
  duration: number
  startDate?: Date
  endDate?: Date
  nextPayoutDate?: Date
  totalPaidOut?: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateInvestmentPayload {
  farmId: string
  investorId: string
  amount: number
  walletAddress: string
  duration?: number
}

export interface InvestmentSummary {
  totalInvestments: number
  totalAmount: number
  activeInvestments: number
  completedInvestments: number
  totalReturns: number
  averageROI: number
}

export interface PortfolioMetrics {
  farmId: string
  farmName: string
  totalInvested: number
  totalReturns: number
  roi: number
  status: string
  investmentCount: number
}

export interface PayoutResponse {
  success: boolean
  message: string
  payout?: {
    amount: number
    date: Date
  }
}

class InvestmentService {
  /**
   * Create new investment
   */
  async createInvestment(payload: CreateInvestmentPayload): Promise<Investment> {
    const response = await apiClient.post<Investment>('/investments', payload)
    return response.data
  }

  /**
   * Get all investments
   */
  async getAllInvestments(): Promise<Investment[]> {
    const response = await apiClient.get<Investment[]>('/investments')
    return response.data
  }

  /**
   * Get investment by ID
   */
  async getInvestmentById(id: string): Promise<Investment> {
    const response = await apiClient.get<Investment>(`/investments/${id}`)
    return response.data
  }

  /**
   * Update investment
   */
  async updateInvestment(id: string, data: Partial<Investment>): Promise<Investment> {
    const response = await apiClient.put<Investment>(`/investments/${id}`, data)
    return response.data
  }

  /**
   * Delete investment
   */
  async deleteInvestment(id: string): Promise<void> {
    await apiClient.delete(`/investments/${id}`)
  }

  /**
   * Activate investment
   */
  async activateInvestment(id: string): Promise<Investment> {
    const response = await apiClient.put<Investment>(`/investments/${id}/activate`)
    return response.data
  }

  /**
   * Mark investment as complete
   */
  async completeInvestment(id: string): Promise<Investment> {
    const response = await apiClient.put<Investment>(`/investments/${id}/complete`)
    return response.data
  }

  /**
   * Process payout for investment
   */
  async processPayou(id: string): Promise<PayoutResponse> {
    const response = await apiClient.post<PayoutResponse>(`/investments/${id}/payout`)
    return response.data
  }

  /**
   * Calculate next payout date
   */
  async calculatePayout(id: string): Promise<{ nextPayoutDate: Date }> {
    const response = await apiClient.post<{ nextPayoutDate: Date }>(`/investments/${id}/calculate-payout`)
    return response.data
  }

  /**
   * Get investments by investor ID
   */
  async getInvestmentsByInvestor(investorId: string): Promise<Investment[]> {
    const response = await apiClient.get<Investment[]>(`/investments/investor/${investorId}`)
    return response.data
  }

  /**
   * Get investor investment summary
   */
  async getInvestorSummary(investorId: string): Promise<InvestmentSummary> {
    const response = await apiClient.get<InvestmentSummary>(`/investments/investor/${investorId}/summary`)
    return response.data
  }

  /**
   * Get investments by farm ID
   */
  async getInvestmentsByFarm(farmId: string): Promise<Investment[]> {
    const response = await apiClient.get<Investment[]>(`/investments/farm/${farmId}`)
    return response.data
  }

  /**
   * Get investments due for payout
   */
  async getDuePayouts(): Promise<Investment[]> {
    const response = await apiClient.get<Investment[]>('/investments/due-payouts')
    return response.data
  }

  /**
   * Claim yield for a specific farm
   */
  async claimYield(farmId: string): Promise<PayoutResponse> {
    const response = await apiClient.post<PayoutResponse>(`/investments/${farmId}/claim-yield`)
    return response.data
  }

  /**
   * Confirm investment payment
   */
  async confirmInvestment(investmentId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>('/investments/confirm', {
      investmentId
    })
    return response.data
  }

  /**
   * Get detailed investment info for a farm
   */
  async getFarmInvestmentDetails(farmId: string): Promise<{
    totalInvested: number
    investorCount: number
    averageInvestment: number
    investments: Investment[]
  }> {
    const response = await apiClient.get(`/investments/farm/${farmId}/details`)
    return response.data
  }

  /**
   * Get investor portfolio metrics per farm
   */
  async getPortfolioMetrics(investorId: string): Promise<PortfolioMetrics[]> {
    const response = await apiClient.get<PortfolioMetrics[]>(`/investments/portfolio/${investorId}`)
    return response.data
  }
}

export const investmentService = new InvestmentService()
