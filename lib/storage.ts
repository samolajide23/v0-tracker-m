export interface Transaction {
  id: string
  type: "income" | "expense" | "emergency_fund" | "debt_payment" | "savings_contribution" | "goal_contribution"
  category: string
  description: string
  amount: number
  date: string
  relatedId?: string // ID of related goal, debt, etc.
  metadata?: {
    goalName?: string
    debtName?: string
    frequency?: string
  }
}

export interface FinancialData {
  transactions: Transaction[]
  income: Array<{
    id: string
    source: string
    amount: number
    frequency: "monthly" | "weekly" | "yearly"
  }>
  expenses: Array<{
    id: string
    category: string
    description: string
    amount: number
    frequency: "monthly" | "weekly" | "yearly"
  }>
  emergencyFund: {
    currentBalance: number
    monthlyExpenses: number
    targetMonths: number
    contributions: Array<{
      id: string
      amount: number
      date: string
      type: "deposit" | "withdrawal"
      description: string
    }>
  }
  debts: {
    list: Array<{
      id: string
      name: string
      type: string
      balance: number
      interestRate: number
      minimumPayment: number
      color: string
    }>
    strategy: "avalanche" | "snowball"
    extraPayment: number
  }
  savingsGoals: Array<{
    id: string
    name: string
    category: string
    targetAmount: number
    currentAmount: number
    targetDate: string
    priority: "high" | "medium" | "low"
    color: string
    contributions: Array<{
      id: string
      amount: number
      date: string
      description: string
    }>
  }>
  visionBoard: {
    goals: Array<{
      id: string
      title: string
      category: string
      description: string
      targetDate: string
      priority: "high" | "medium" | "low"
      status: "not-started" | "in-progress" | "completed"
    }>
    habits: Array<{
      id: string
      name: string
      frequency: string
      streak: number
      lastCompleted: string
    }>
    inspirations: Array<{
      id: string
      type: "quote" | "image"
      content: string
      author?: string
    }>
  }
}

const STORAGE_KEY = "financial-tracker-data"

export const getStorageData = (): FinancialData => {
  if (typeof window === "undefined") {
    return getDefaultData()
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      if (!data.transactions) {
        data.transactions = []
      }
      return data
    }
  } catch (error) {
    console.error("Error loading financial data:", error)
  }

  return getDefaultData()
}

export const setStorageData = (data: FinancialData): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error("Error saving financial data:", error)
  }
}

export const addTransaction = (transaction: Omit<Transaction, "id" | "date">): void => {
  const data = getStorageData()
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
    date: new Date().toISOString().split("T")[0],
  }

  data.transactions = [newTransaction, ...data.transactions]
  setStorageData(data)
}

export const getTransactionsByType = (type: Transaction["type"]): Transaction[] => {
  const data = getStorageData()
  return data.transactions.filter((t) => t.type === type)
}

export const getTransactionsByDateRange = (startDate: string, endDate: string): Transaction[] => {
  const data = getStorageData()
  return data.transactions.filter((t) => t.date >= startDate && t.date <= endDate)
}

export const getDefaultData = (): FinancialData => ({
  transactions: [
    {
      id: "1",
      type: "emergency_fund",
      category: "Emergency Fund",
      description: "Initial emergency fund deposit",
      amount: 1000,
      date: "2024-01-15",
    },
    {
      id: "2",
      type: "savings_contribution",
      category: "Retirement",
      description: "401k contribution",
      amount: 1200,
      date: "2024-01-01",
      relatedId: "1",
      metadata: { goalName: "401(k) Retirement" },
    },
  ],
  income: [
    { id: "1", source: "Salary", amount: 5000, frequency: "monthly" },
    { id: "2", source: "Freelance", amount: 800, frequency: "monthly" },
  ],
  expenses: [
    { id: "1", category: "Housing", description: "Rent", amount: 1200, frequency: "monthly" },
    { id: "2", category: "Transportation", description: "Car Payment", amount: 350, frequency: "monthly" },
    { id: "3", category: "Food & Dining", description: "Groceries", amount: 400, frequency: "monthly" },
    { id: "4", category: "Bills & Utilities", description: "Electricity", amount: 120, frequency: "monthly" },
    { id: "5", category: "Entertainment", description: "Streaming Services", amount: 45, frequency: "monthly" },
  ],
  emergencyFund: {
    currentBalance: 8500,
    monthlyExpenses: 2800,
    targetMonths: 6,
    contributions: [
      { id: "1", amount: 1000, date: "2024-01-15", type: "deposit", description: "Initial emergency fund" },
      { id: "2", amount: 500, date: "2024-02-01", type: "deposit", description: "Monthly contribution" },
      { id: "3", amount: 500, date: "2024-03-01", type: "deposit", description: "Monthly contribution" },
      { id: "4", amount: 200, date: "2024-03-15", type: "withdrawal", description: "Car repair emergency" },
      { id: "5", amount: 500, date: "2024-04-01", type: "deposit", description: "Monthly contribution" },
    ],
  },
  debts: {
    list: [
      {
        id: "1",
        name: "Credit Card 1",
        type: "Credit Card",
        balance: 5000,
        interestRate: 18.99,
        minimumPayment: 150,
        color: "#ef4444",
      },
      {
        id: "2",
        name: "Credit Card 2",
        type: "Credit Card",
        balance: 2500,
        interestRate: 22.99,
        minimumPayment: 75,
        color: "#f59e0b",
      },
    ],
    strategy: "avalanche",
    extraPayment: 200,
  },
  savingsGoals: [
    {
      id: "1",
      name: "House Down Payment",
      category: "Housing",
      targetAmount: 50000,
      currentAmount: 15000,
      targetDate: "2025-12-31",
      priority: "high",
      color: "#10b981",
      contributions: [{ id: "1", amount: 1500, date: "2024-01-01", description: "Monthly house fund deposit" }],
    },
    {
      id: "2",
      name: "Vacation Fund",
      category: "Travel",
      targetAmount: 5000,
      currentAmount: 1200,
      targetDate: "2024-08-01",
      priority: "medium",
      color: "#06b6d4",
      contributions: [{ id: "1", amount: 400, date: "2024-01-01", description: "Vacation savings" }],
    },
  ],
  visionBoard: {
    goals: [
      {
        id: "1",
        title: "Achieve Financial Independence",
        category: "Financial",
        description: "Build enough passive income to cover all expenses",
        targetDate: "2030-12-31",
        priority: "high",
        status: "in-progress",
      },
    ],
    habits: [
      {
        id: "1",
        name: "Track daily expenses",
        frequency: "Daily",
        streak: 15,
        lastCompleted: "2024-01-20",
      },
    ],
    inspirations: [
      {
        id: "1",
        type: "quote",
        content: "Every dollar saved is a step toward financial freedom.",
        author: "Financial Wisdom",
      },
    ],
  },
})

export const calculateMonthlyAmount = (amount: number, frequency: "monthly" | "weekly" | "yearly"): number => {
  switch (frequency) {
    case "yearly":
      return amount / 12
    case "weekly":
      return amount * 4.33
    default:
      return amount
  }
}

export const calculateTotalMonthlyIncome = (income: FinancialData["income"]): number => {
  return income.reduce((sum, item) => sum + calculateMonthlyAmount(item.amount, item.frequency), 0)
}

export const calculateTotalMonthlyExpenses = (expenses: FinancialData["expenses"]): number => {
  return expenses.reduce((sum, item) => sum + calculateMonthlyAmount(item.amount, item.frequency), 0)
}

export const exportFinancialData = (): string => {
  const data = getStorageData()
  return JSON.stringify(data, null, 2)
}

export const importFinancialData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData) as FinancialData

    if (!data.transactions || !Array.isArray(data.transactions)) {
      throw new Error("Invalid data format: missing transactions array")
    }

    if (!data.income || !Array.isArray(data.income)) {
      throw new Error("Invalid data format: missing income array")
    }

    if (!data.expenses || !Array.isArray(data.expenses)) {
      throw new Error("Invalid data format: missing expenses array")
    }

    setStorageData(data)

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: STORAGE_KEY,
        newValue: JSON.stringify(data),
        storageArea: localStorage,
      }),
    )

    return true
  } catch (error) {
    console.error("Error importing financial data:", error)
    return false
  }
}

export const clearAllData = (): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(STORAGE_KEY)

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: STORAGE_KEY,
        newValue: null,
        storageArea: localStorage,
      }),
    )
  } catch (error) {
    console.error("Error clearing financial data:", error)
  }
}
