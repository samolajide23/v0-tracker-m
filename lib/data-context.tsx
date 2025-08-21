"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { getStorageData, setStorageData, type FinancialData } from "./storage"

interface DataContextType {
  data: FinancialData
  updateData: (updates: Partial<FinancialData>) => void
  refreshData: () => void
  isLoading: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FinancialData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshData = useCallback(() => {
    const freshData = getStorageData()
    setData(freshData)
    setIsLoading(false)
  }, [])

  const updateData = useCallback((updates: Partial<FinancialData>) => {
    setData((currentData) => {
      if (!currentData) return currentData
      const newData = { ...currentData, ...updates }
      setStorageData(newData)
      return newData
    })
  }, [])

  useEffect(() => {
    refreshData()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "financial-tracker-data" && e.newValue) {
        try {
          const newData = JSON.parse(e.newValue)
          setData(newData)
        } catch (error) {
          console.error("Error parsing storage data:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)

    const interval = setInterval(refreshData, 30000) // Refresh every 30 seconds

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [refreshData])

  if (!data) {
    return <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">Loading financial data...</div>
  }

  return <DataContext.Provider value={{ data, updateData, refreshData, isLoading }}>{children}</DataContext.Provider>
}

export function useFinancialData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useFinancialData must be used within a DataProvider")
  }
  return context
}
