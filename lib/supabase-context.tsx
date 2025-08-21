"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "./supabase/client"
import type { User } from "@supabase/supabase-js"

interface FinancialData {
  incomes: Array<{
    id: string
    source: string
    amount: number
    frequency: "weekly" | "monthly" | "yearly"
  }>
  expenses: Array<{
    id: string
    category: string
    amount: number
    frequency: "weekly" | "monthly" | "yearly"
  }>
  emergencyFund: {
    currentBalance: number
    goalAmount: number
    targetMonths: number
    monthlyExpenses: number
  }
  debts: Array<{
    id: string
    name: string
    balance: number
    interestRate: number
    minimumPayment: number
    type: string
  }>
  savingsGoals: Array<{
    id: string
    name: string
    targetAmount: number
    currentAmount: number
    targetDate: string
    category: string
  }>
  transactions: Array<{
    id: string
    type: "income" | "expense" | "transfer" | "debt_payment" | "savings"
    amount: number
    description: string
    category: string
    date: string
  }>
}

interface SupabaseContextType {
  user: User | null
  data: FinancialData
  loading: boolean
  updateIncomes: (incomes: FinancialData["incomes"]) => Promise<void>
  updateExpenses: (expenses: FinancialData["expenses"]) => Promise<void>
  updateEmergencyFund: (fund: FinancialData["emergencyFund"]) => Promise<void>
  updateDebts: (debts: FinancialData["debts"]) => Promise<void>
  updateSavingsGoals: (goals: FinancialData["savingsGoals"]) => Promise<void>
  addTransaction: (transaction: Omit<FinancialData["transactions"][0], "id">) => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

const defaultData: FinancialData = {
  incomes: [],
  expenses: [],
  emergencyFund: { currentBalance: 0, goalAmount: 0, targetMonths: 6, monthlyExpenses: 0 },
  debts: [],
  savingsGoals: [],
  transactions: [],
}

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [data, setData] = useState<FinancialData>(defaultData)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserData(session.user.id)
      } else {
        setLoading(false)
      }
    }).catch((error) => {
      console.error("Error getting session:", error)
      setLoading(false)
    })

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        // Loading timeout reached, setting loading to false
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeout)

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadUserData(session.user.id)
      } else {
        setData(defaultData)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return

    // Set up real-time subscriptions
    const channels = [
      supabase
        .channel("income_entries")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "income_entries", filter: `user_id=eq.${user.id}` },
          () => loadUserData(user.id),
        ),
      supabase
        .channel("expense_entries")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "expense_entries", filter: `user_id=eq.${user.id}` },
          () => loadUserData(user.id),
        ),
      supabase
        .channel("emergency_funds")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "emergency_funds", filter: `user_id=eq.${user.id}` },
          () => loadUserData(user.id),
        ),
      supabase
        .channel("debt_entries")
        .on("postgres_changes", { event: "*", schema: "public", table: "debt_entries", filter: `user_id=eq.${user.id}` }, () =>
          loadUserData(user.id),
        ),
      supabase
        .channel("savings_goals")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "savings_goals", filter: `user_id=eq.${user.id}` },
          () => loadUserData(user.id),
        ),
      supabase
        .channel("transactions")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${user.id}` },
          () => loadUserData(user.id),
        ),
    ]

    channels.forEach((channel) => channel.subscribe())

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel))
    }
  }, [user])

  const loadUserData = async (userId: string) => {
    try {
      // Try to load data with individual error handling for each table
      const incomesRes = await supabase.from("income_entries").select("*").eq("user_id", userId)
      const expensesRes = await supabase.from("expense_entries").select("*").eq("user_id", userId)
      const emergencyRes = await supabase.from("emergency_funds").select("*").eq("user_id", userId).single()
      const debtsRes = await supabase.from("debt_entries").select("*").eq("user_id", userId)
      const goalsRes = await supabase.from("savings_goals").select("*").eq("user_id", userId)
      const transactionsRes = await supabase.from("transactions").select("*").eq("user_id", userId).order("date", { ascending: false })

      setData({
        incomes: (incomesRes.data || []).map(income => ({
          id: income.id,
          source: income.description,
          amount: income.amount,
          frequency: income.frequency
        })),
        expenses: (expensesRes.data || []).map(expense => ({
          id: expense.id,
          category: expense.description,
          amount: expense.amount,
          frequency: expense.frequency
        })),
        emergencyFund: emergencyRes.data ? {
          currentBalance: emergencyRes.data.current_balance,
          goalAmount: emergencyRes.data.target_months * (emergencyRes.data.monthly_expenses || 0),
          targetMonths: emergencyRes.data.target_months,
          monthlyExpenses: emergencyRes.data.monthly_expenses
        } : defaultData.emergencyFund,
        debts: (debtsRes.data || []).map(debt => ({
          id: debt.id,
          name: debt.name,
          balance: debt.balance,
          interestRate: debt.interest_rate,
          minimumPayment: debt.minimum_payment,
          type: debt.debt_type
        })),
        savingsGoals: (goalsRes.data || []).map(goal => ({
          id: goal.id,
          name: goal.name,
          targetAmount: goal.target_amount,
          currentAmount: goal.current_amount,
          targetDate: goal.target_date,
          category: goal.category
        })),
        transactions: (transactionsRes.data || []).map(transaction => ({
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          date: transaction.date
        })),
      })
    } catch (error) {
      console.error("Error loading user data:", error)
      // Set default data on error
      setData(defaultData)
    } finally {
      setLoading(false)
    }
  }

  const updateIncomes = async (incomes: FinancialData["incomes"]) => {
    if (!user) return

    // Delete existing incomes
    await supabase.from("income_entries").delete().eq("user_id", user.id)

    // Insert new incomes
    if (incomes.length > 0) {
      await supabase.from("income_entries").insert(incomes.map((income) => ({ 
        description: income.source,
        amount: income.amount,
        frequency: income.frequency,
        user_id: user.id 
      })))
    }
  }

  const updateExpenses = async (expenses: FinancialData["expenses"]) => {
    if (!user) return

    await supabase.from("expense_entries").delete().eq("user_id", user.id)

    if (expenses.length > 0) {
      await supabase.from("expense_entries").insert(expenses.map((expense) => ({ 
        description: expense.category,
        amount: expense.amount,
        category: expense.category,
        frequency: expense.frequency,
        user_id: user.id 
      })))
    }
  }

  const updateEmergencyFund = async (fund: FinancialData["emergencyFund"]) => {
    if (!user) return

    await supabase.from("emergency_funds").upsert({
      user_id: user.id,
      current_balance: fund.currentBalance,
      goal_amount: fund.goalAmount,
      target_months: fund.targetMonths,
      monthly_expenses: fund.monthlyExpenses,
    })
  }

  const updateDebts = async (debts: FinancialData["debts"]) => {
    if (!user) return

    await supabase.from("debt_entries").delete().eq("user_id", user.id)

    if (debts.length > 0) {
      await supabase.from("debt_entries").insert(
        debts.map((debt) => ({
          name: debt.name,
          balance: debt.balance,
          interest_rate: debt.interestRate,
          minimum_payment: debt.minimumPayment,
          debt_type: debt.type,
          user_id: user.id,
        })),
      )
    }
  }

  const updateSavingsGoals = async (goals: FinancialData["savingsGoals"]) => {
    if (!user) return

    await supabase.from("savings_goals").delete().eq("user_id", user.id)

    if (goals.length > 0) {
      await supabase.from("savings_goals").insert(
        goals.map((goal) => ({
          ...goal,
          user_id: user.id,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount,
          target_date: goal.targetDate,
        })),
      )
    }
  }

  const addTransaction = async (transaction: Omit<FinancialData["transactions"][0], "id">) => {
    if (!user) return

    await supabase.from("transactions").insert({
      ...transaction,
      user_id: user.id,
      id: crypto.randomUUID(),
    })
  }

  const signIn = async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({ email, password })
    
    if (!result.error && result.data.session) {
      setUser(result.data.session.user)
      await loadUserData(result.data.session.user.id)
    }
    
    return result
  }

  const signUp = async (email: string, password: string) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
      },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <SupabaseContext.Provider
      value={{
        user,
        data,
        loading,
        updateIncomes,
        updateExpenses,
        updateEmergencyFund,
        updateDebts,
        updateSavingsGoals,
        addTransaction,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context
}
