"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormError } from "@/components/ui/form-error"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
  DollarSign,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  Home,
  Car,
  ShoppingCart,
  Utensils,
  Gamepad2,
  CreditCard,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import { useSupabase } from "@/lib/supabase-context"
import { validateIncomeData, validateExpenseData } from "@/lib/validation"

interface IncomeItem {
  id: string
  source: string
  amount: number
  frequency: "monthly" | "weekly" | "yearly"
}

interface ExpenseItem {
  id: string
  category: string
  description: string
  amount: number
  frequency: "monthly" | "weekly" | "yearly"
}

const expenseCategories = [
  { name: "Housing", icon: Home, color: "#8b5cf6" },
  { name: "Transportation", icon: Car, color: "#06b6d4" },
  { name: "Food & Dining", icon: Utensils, color: "#10b981" },
  { name: "Shopping", icon: ShoppingCart, color: "#f59e0b" },
  { name: "Entertainment", icon: Gamepad2, color: "#ef4444" },
  { name: "Bills & Utilities", icon: CreditCard, color: "#6366f1" },
]

export default function IncomeExpensesPage() {
  const { data, loading, updateIncomes, updateExpenses, addTransaction } = useSupabase()
  const [newIncome, setNewIncome] = useState({ source: "", amount: "", frequency: "monthly" as const })
  const [newExpense, setNewExpense] = useState({
    category: "",
    description: "",
    amount: "",
    frequency: "monthly" as const,
  })
  const [incomeErrors, setIncomeErrors] = useState<string[]>([])
  const [expenseErrors, setExpenseErrors] = useState<string[]>([])

  if (loading) {
    return <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">Loading...</div>
  }

  const totalMonthlyIncome = data.incomes.reduce((sum, item) => {
    const monthlyAmount =
      item.frequency === "yearly" ? item.amount / 12 : item.frequency === "weekly" ? item.amount * 4.33 : item.amount
    return sum + monthlyAmount
  }, 0)

  const totalMonthlyExpenses = data.expenses.reduce((sum, item) => {
    const monthlyAmount =
      item.frequency === "yearly" ? item.amount / 12 : item.frequency === "weekly" ? item.amount * 4.33 : item.amount
    return sum + monthlyAmount
  }, 0)

  const leftoverBalance = totalMonthlyIncome - totalMonthlyExpenses

  const expensesByCategory = expenseCategories
    .map((category) => {
      const categoryExpenses = data.expenses.filter((item) => item.category === category.name)
      const total = categoryExpenses.reduce((sum, item) => {
        const monthlyAmount =
          item.frequency === "yearly"
            ? item.amount / 12
            : item.frequency === "weekly"
              ? item.amount * 4.33
              : item.amount
        return sum + monthlyAmount
      }, 0)
      return {
        name: category.name,
        value: total,
        color: category.color,
        icon: category.icon,
      }
    })
    .filter((item) => item.value > 0)

  const addIncome = async () => {
    const validation = validateIncomeData(newIncome.source, newIncome.amount)

    if (!validation.isValid) {
      setIncomeErrors(validation.errors)
      return
    }

    setIncomeErrors([])

    const newIncomeItem = {
      id: crypto.randomUUID(),
      source: newIncome.source,
      amount: Number.parseFloat(newIncome.amount),
      frequency: newIncome.frequency,
    }

    await updateIncomes([...data.incomes, newIncomeItem])
    await addTransaction({
      type: "income",
      amount: Number.parseFloat(newIncome.amount),
      description: `${newIncome.source} (${newIncome.frequency})`,
      category: "Income",
      date: new Date().toISOString().split("T")[0],
    })

    setNewIncome({ source: "", amount: "", frequency: "monthly" })
  }

  const addExpense = async () => {
    const validation = validateExpenseData(newExpense.category, newExpense.description, newExpense.amount)

    if (!validation.isValid) {
      setExpenseErrors(validation.errors)
      return
    }

    setExpenseErrors([])

    const newExpenseItem = {
      id: crypto.randomUUID(),
      category: newExpense.category,
      amount: Number.parseFloat(newExpense.amount),
      frequency: newExpense.frequency,
    }

    await updateExpenses([...data.expenses, newExpenseItem])
    await addTransaction({
      type: "expense",
      amount: Number.parseFloat(newExpense.amount),
      description: `${newExpense.description} (${newExpense.frequency})`,
      category: newExpense.category,
      date: new Date().toISOString().split("T")[0],
    })

    setNewExpense({ category: "", description: "", amount: "", frequency: "monthly" })
  }

  const removeIncome = async (id: string) => {
    await updateIncomes(data.incomes.filter((item) => item.id !== id))
  }

  const removeExpense = async (id: string) => {
    await updateExpenses(data.expenses.filter((item) => item.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Income & Expense Tracker</h1>
              <p className="text-muted-foreground mt-1">Manage your monthly cash flow and spending patterns</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Monthly Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-chart-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-4">${totalMonthlyIncome.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Monthly Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">${totalMonthlyExpenses.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leftover Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${leftoverBalance >= 0 ? "text-chart-4" : "text-destructive"}`}>
                  ${leftoverBalance.toLocaleString()}
                </div>
                <Badge variant={leftoverBalance >= 0 ? "default" : "destructive"} className="mt-2">
                  {leftoverBalance >= 0 ? "Surplus" : "Deficit"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={expensesByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                    <Bar dataKey="value" fill="#8884d8">
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="income" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="income">Income Sources</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>

            <TabsContent value="income" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Income Source
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="income-source">Source</Label>
                      <Input
                        id="income-source"
                        placeholder="e.g., Salary, Freelance"
                        value={newIncome.source}
                        onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                        className={incomeErrors.length > 0 ? "border-destructive" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="income-amount">Amount</Label>
                      <Input
                        id="income-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={newIncome.amount}
                        onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                        className={incomeErrors.length > 0 ? "border-destructive" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="income-frequency">Frequency</Label>
                      <Select
                        value={newIncome.frequency}
                        onValueChange={(value: any) => setNewIncome({ ...newIncome, frequency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addIncome} className="w-full">
                        Add Income
                      </Button>
                    </div>
                  </div>
                  <FormError errors={incomeErrors} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Income Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.incomes.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-medium">{item.source}</div>
                          <div className="text-sm text-muted-foreground">{item.frequency}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-chart-4">${item.amount.toLocaleString()}</span>
                          <Button variant="outline" size="sm" onClick={() => removeIncome(item.id)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {data.incomes.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No income sources added yet. Add your first income source above.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Expense
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="expense-category">Category</Label>
                      <Select
                        value={newExpense.category}
                        onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                      >
                        <SelectTrigger className={expenseErrors.length > 0 ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseCategories.map((category) => (
                            <SelectItem key={category.name} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="expense-description">Description</Label>
                      <Input
                        id="expense-description"
                        placeholder="e.g., Rent, Groceries"
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                        className={expenseErrors.length > 0 ? "border-destructive" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expense-amount">Amount</Label>
                      <Input
                        id="expense-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        className={expenseErrors.length > 0 ? "border-destructive" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expense-frequency">Frequency</Label>
                      <Select
                        value={newExpense.frequency}
                        onValueChange={(value: any) => setNewExpense({ ...newExpense, frequency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addExpense} className="w-full">
                        Add Expense
                      </Button>
                    </div>
                  </div>
                  <FormError errors={expenseErrors} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.expenses.map((item) => {
                      const category = expenseCategories.find((cat) => cat.name === item.category)
                      const IconComponent = category?.icon || CreditCard
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <IconComponent className="h-5 w-5" style={{ color: category?.color }} />
                            <div>
                              <div className="font-medium">{item.category}</div>
                              <div className="text-sm text-muted-foreground">{item.frequency}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-destructive">${item.amount.toLocaleString()}</span>
                            <Button variant="outline" size="sm" onClick={() => removeExpense(item.id)}>
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                    {data.expenses.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No expenses added yet. Add your first expense above.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
