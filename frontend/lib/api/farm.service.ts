import { apiClient } from './client'

export interface Farm {
  _id: string
  name: string
  description: string
  location: string
  cropType: string
  farmerId: string
  farmerName?: string
  expectedROI: number
  duration: number
  targetAmount: number
  currentAmount?: number
  imageUrl?: string
  images?: string[]
  status: 'pending' | 'verified' | 'active' | 'delisted' | 'completed'
  verified: boolean
  verifiedAt?: Date
  delistedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateFarmPayload {
  name: string
  description: string
  location: string
  cropType: string
  expectedROI: number
  duration: number
  targetAmount: number
  imageUrl?: string
  images?: string[]
}

export interface UpdateFarmPayload {
  name?: string
  description?: string
  location?: string
  cropType?: string
  expectedROI?: number
  duration?: number
  targetAmount?: number
  imageUrl?: string
  images?: string[]
}

export interface FarmFilters {
  cropType?: string
  location?: string
  minROI?: number
  maxROI?: number
  minDuration?: number
  maxDuration?: number
  status?: string
  verified?: boolean
}

export interface FarmSummary {
  farm: Farm
  totalInvestments: number
  totalInvestors: number
  totalAmountRaised: number
  averageROI: number
  harvestYield?: number
  completionPercentage: number
}

export interface SearchParams {
  query?: string
  location?: string
  cropType?: string
  minROI?: number
  maxROI?: number
}

class FarmService {
  /**
   * Create a new farm (farmer only)
   */
  async createFarm(payload: CreateFarmPayload): Promise<Farm> {
    const response = await apiClient.post<Farm>('/farms', payload)
    return response.data
  }

  /**
   * Get all farms with optional filtering
   */
  async getAllFarms(filters?: FarmFilters): Promise<Farm[]> {
    const response = await apiClient.get<Farm[]>('/farms', { params: filters })
    return response.data
  }

  /**
   * Search farms by location, crops, or type
   */
  async searchFarms(params: SearchParams): Promise<Farm[]> {
    const response = await apiClient.get<Farm[]>('/farms/search', { params })
    return response.data
  }

  /**
   * Get farm by ID
   */
  async getFarmById(id: string): Promise<Farm> {
    const response = await apiClient.get<Farm>(`/farms/${id}`)
    return response.data
  }

  /**
   * Update farm details
   */
  async updateFarm(id: string, payload: UpdateFarmPayload): Promise<Farm> {
    const response = await apiClient.put<Farm>(`/farms/${id}`, payload)
    return response.data
  }

  /**
   * Delete farm
   */
  async deleteFarm(id: string): Promise<void> {
    await apiClient.delete(`/farms/${id}`)
  }

  /**
   * Get farm summary (investments + harvest data)
   */
  async getFarmSummary(id: string): Promise<FarmSummary> {
    const response = await apiClient.get<FarmSummary>(`/farms/${id}/summary`)
    return response.data
  }

  /**
   * Verify farm (admin only)
   */
  async verifyFarm(id: string): Promise<Farm> {
    const response = await apiClient.put<Farm>(`/farms/${id}/verify`)
    return response.data
  }

  /**
   * Get all farms created by a farmer
   */
  async getFarmerFarms(farmerId: string): Promise<Farm[]> {
    const response = await apiClient.get<Farm[]>(`/farms/farmer/${farmerId}`)
    return response.data
  }

  /**
   * Get all pending farms (admin only)
   */
  async getPendingFarms(): Promise<Farm[]> {
    const response = await apiClient.get<Farm[]>('/farms/pending')
    return response.data
  }

  /**
   * Delist farm (admin or automated when expired)
   */
  async delistFarm(id: string): Promise<Farm> {
    const response = await apiClient.put<Farm>(`/farms/${id}/delist`)
    return response.data
  }
}

export const farmService = new FarmService()
