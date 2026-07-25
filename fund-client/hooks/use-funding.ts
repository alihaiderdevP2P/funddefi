"use client"

import { useState, useEffect, useCallback } from "react"
import { fundingAPI, type Funding } from "@/lib/api"
import websocketService from "@/lib/websocket"

export function useFunding(campaignId?: string, userId?: string) {
  const [fundings, setFundings] = useState<Funding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFundings = useCallback(async () => {
    try {
      setLoading(true)
      let response

      if (campaignId) {
        response = await fundingAPI.getByCampaign(campaignId)
      } else if (userId) {
        response = await fundingAPI.getAll(userId)
      } else {
        response = await fundingAPI.getMyFundings()
      }

      setFundings(response)
      setError(null)
    } catch (err) {
      setError("Failed to fetch fundings")
      console.error("Error fetching fundings:", err)
    } finally {
      setLoading(false)
    }
  }, [campaignId, userId])

  useEffect(() => {
    fetchFundings()
  }, [fetchFundings])

  useEffect(() => {
    if (!campaignId) return

    const handleNewFunding = (data: { campaignId?: string }) => {
      if (data.campaignId === campaignId) fetchFundings()
    }

    websocketService.onNewFunding(handleNewFunding)
    return () => websocketService.off("new-funding", handleNewFunding)
  }, [campaignId, fetchFundings])

  const createFunding = async (fundingData: {
    amount: number
    transactionHash: string
    campaignId: string
    rewardId?: string
    message?: string
    backerInfo?: {
      name?: string
      email?: string
      address?: string
    }
  }) => {
    try {
      const response = await fundingAPI.create(fundingData)
      setFundings((prev) => [response, ...prev])
      return response
    } catch (err) {
      console.error("Error creating funding:", err)
      throw err
    }
  }

  return {
    fundings,
    loading,
    error,
    createFunding,
    refetch: fetchFundings as () => Promise<void>,
  }
}

/** @deprecated Use usePlatformStats for real-time WebSocket updates */
export { usePlatformStats as useFundingStats } from "./use-platform-stats"
