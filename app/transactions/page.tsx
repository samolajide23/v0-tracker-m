"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-context"
import Navigation from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Filter,
  Download,
  Search,
  PiggyBank,
  CreditCard,
  Target,
} from "lucide-react"
import Link from "next/link"

const transactionTypeColors = {
  income: "#10b981",
  expense: "#ef4444",
  emergency_fund: "#06b6d4",
  debt_payment: "#f59e0b",
  savings_contribution: "#8b5cf6",
  goal_contribution: "#ec4899",
}

const transactionTypeIcons = {
  income: TrendingUp,
  expense: TrendingDown,
  emergency_fund: PiggyBank,
  debt_payment: CreditCard,
  savings_contribution: Target,
  goal_contribution: Target,
}

export default function TransactionsPage() {
  const { data, loading } = useSupabase()
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])
  const [filterType, setFilterType] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })

  useEffect(() => {
    setFilteredTransactions(data.transactions || [])
  }, [data.transactions])

  useEffect(() => {
    let filtered = data.transactions || []

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType)
    }

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter((t) => t.category === filterCategory)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by date range
    if (dateRange.start) {
      filtered = filtered.filter((t) => t.date >= dateRange.start)
    }
    if (dateRange.end) {
      filtered = filtered.filter((t) => t.date <= dateRange.end)
    }

    setFilteredTransactions(filtered)
  }, [data.transactions, filterType, filterCategory, searchTerm, dateRange])

  if (loading) {
    return <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">Loading...</div>
  }

  // Calculate summary statistics
  const totalIncome = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const totalSavings = filteredTransactions
    .filter((t) => ["emergency_fund", "savings_contribution", "goal_contribution"].includes(t.type))
    .reduce((sum, t) => sum + t.amount, 0)
  const netCashFlow = totalIncome - totalExpenses

  // Get unique categories for filter
  const categories = Array.from(new Set(data.transactions.map((t) => t.category)))

  // Chart data for spending trends
  const monthlyData = data.transactions.reduce((acc, transaction) => {
    const month = new Date(transaction.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    const existing = acc.find((item) => item.month === month)

    if (existing) {
      if (transaction.type === "income") {
        existing.income += transaction.amount
      } else if (transaction.type === "expense") {
        existing.expenses += transaction.amount
      } else {
        existing.savings += transaction.amount
      }
    } else {
      acc.push({
        month,
        income: transaction.type === "income" ? transaction.amount : 0,
        expenses: transaction.type === "expense" ? transaction.amount : 0,
        savings: ["emergency_fund", "savings_contribution", "goal_contribution"].includes(transaction.type)
          ? transaction.amount
          : 0,
      })
    }

    return acc
  }, [] as any[])

  // Category breakdown
  const categoryData = categories
    .map((category) => ({
      category,
      amount: filteredTransactions.filter((t) => t.category === category).reduce((sum, t) => sum + t.amount, 0),
      count: filteredTransactions.filter((t) => t.category === category).length,
    }))
    .sort((a, b) => b.amount - a.amount)

  const exportTransactions = () => {
    const csvContent = [
      ["Date", "Type", "Category", "Description", "Amount"],
      ...filteredTransactions.map((t) => [t.date, t.type, t.category, t.description, t.amount.toString()]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Transaction History</h1>
              <p className="text-muted-foreground mt-1">Complete record of all your financial activities</p>
            </div>
            <Button onClick={exportTransactions} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-chart-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-4">${totalIncome.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">In selected period</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">${totalExpenses.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">In selected period</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                <PiggyBank className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">${totalSavings.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">Emergency fund + goals</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
                <DollarSign className={`h-4 w-4 ${netCashFlow >= 0 ? "text-chart-4" : "text-destructive"}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netCashFlow >= 0 ? "text-chart-4" : "text-destructive"}`}>
                  ${netCashFlow.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Income minus expenses</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="type-filter">Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expenses</SelectItem>
                      <SelectItem value="emergency_fund">Emergency Fund</SelectItem>
                      <SelectItem value="debt_payment">Debt Payments</SelectItem>
                      <SelectItem value="savings_contribution">Savings</SelectItem>
                      <SelectItem value="goal_contribution">Goal Contributions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category-filter">Category</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, ""]} />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="savings" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, "Amount"]} />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Transaction List */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History ({filteredTransactions.length} transactions)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredTransactions.map((transaction) => {
                  const isPositive = ["income", "emergency_fund", "savings_contribution", "goal_contribution"].includes(
                    transaction.type,
                  )

                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/20">
                          <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {transaction.type.replace("_", " ")}
                            </Badge>
                            <span>{transaction.category}</span>
                            <span>•</span>
                            <span>{new Date(transaction.date).toLocaleDateString()}</span>
                            {transaction.metadata?.goalName && (
                              <>
                                <span>•</span>
                                <span>{transaction.metadata.goalName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`font-bold ${isPositive ? "text-chart-4" : "text-destructive"}`}>
                        {isPositive ? "+" : "-"}${transaction.amount.toLocaleString()}
                      </div>
                    </div>
                  )
                })}
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions found. Start by adding income or expenses.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
