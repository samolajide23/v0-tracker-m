"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import {
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  BarChart3,
  PieChartIcon,
  Target,
  AlertCircle,
  CheckCircle,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import { useSupabase } from "@/lib/supabase-context"

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("12months")
  const [selectedReport, setSelectedReport] = useState("overview")
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  })

  const { data, loading } = useSupabase()

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
      </div>
    )
  }

  const monthlyIncome = (data?.incomes || []).reduce((sum, income) => {
    const multiplier = income.frequency === "weekly" ? 4.33 : income.frequency === "yearly" ? 1 / 12 : 1
    return sum + (income.amount || 0) * multiplier
  }, 0)

  const monthlyExpenses = (data?.expenses || []).reduce((sum, expense) => {
    const multiplier = expense.frequency === "weekly" ? 4.33 : expense.frequency === "yearly" ? 1 / 12 : 1
    return sum + (expense.amount || 0) * multiplier
  }, 0)

  const totalSavings = (data?.savingsGoals || []).reduce((sum, goal) => sum + (goal.currentAmount || 0), 0)
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0
  const emergencyFund = data?.emergencyFund?.currentBalance || 0
  const totalDebt = (data?.debts || []).reduce((sum, debt) => sum + (debt.balance || 0), 0)

  const expenseCategories = (data?.expenses || []).reduce(
    (acc, expense) => {
      const existing = acc.find((cat) => cat.name === expense.category)
      if (existing) {
        existing.value += expense.amount || 0
      } else {
        acc.push({
          name: expense.category,
          value: expense.amount || 0,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        })
      }
      return acc
    },
    [] as { name: string; value: number; color: string }[],
  )

  const goalProgress =
    (data?.savingsGoals || []).map((goal) => ({
      name: goal.name,
      target: goal.targetAmount,
      current: goal.currentAmount,
      progress: goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0,
    }))

  const monthlyData = (data?.transactions || [])
    .reduce((acc, transaction) => {
      const month = new Date(transaction.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
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
          netWorth: 0, // This would need more complex calculation
        })
      }

      return acc
    }, [] as any[])
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

  const debtPayoff =
    (data?.debts || []).map((debt) => ({
      name: debt.name,
      balance: debt.balance,
      type: debt.type,
      interestRate: debt.interestRate,
      minimumPayment: debt.minimumPayment,
    }))

  const exportToCSV = (data: any[], filename: string) => {
    const csvContent = [Object.keys(data[0]).join(","), ...data.map((row) => Object.values(row).join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${filename}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const exportMonthlyReport = () => {
    exportToCSV(monthlyData, "monthly-financial-report")
  }

  const exportExpenseReport = () => {
    exportToCSV(expenseCategories, "expense-categories-report")
  }

  const exportGoalsReport = () => {
    exportToCSV(goalProgress, "goals-progress-report")
  }

  const exportAllData = () => {
    const dataStr = JSON.stringify(data, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `financial-tracker-backup-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportStatus({ type: "error", message: "Import functionality not available with Supabase backend." })
    event.target.value = ""
  }

  const handleClearAllData = () => {
    setImportStatus({ type: "error", message: "Clear data functionality not available with Supabase backend." })
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
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Reports & Analytics</h1>
              <p className="text-muted-foreground mt-1">Comprehensive financial insights and data management</p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="12months">Last 12 Months</SelectItem>
                  <SelectItem value="ytd">Year to Date</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportAllData}>
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
            </div>
          </div>

          {importStatus.type && (
            <Alert
              className={importStatus.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
            >
              {importStatus.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{importStatus.message}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Export Data</Label>
                  <Button onClick={exportAllData} className="w-full bg-transparent" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Backup
                  </Button>
                  <p className="text-xs text-muted-foreground">Export all your financial data as a JSON backup file</p>
                </div>

                <div className="space-y-2">
                  <Label>Import Data</Label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-muted file:text-muted-foreground"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Import financial data from a backup file</p>
                </div>

                <div className="space-y-2">
                  <Label>Clear Data</Label>
                  <Button onClick={handleClearAllData} className="w-full" variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                  <p className="text-xs text-muted-foreground">Permanently delete all financial data</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                <DollarSign className="h-4 w-4 text-chart-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-4">${monthlyIncome.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">From {data?.incomes?.length || 0} sources</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">${monthlyExpenses.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">{data?.expenses?.length || 0} expense items</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                <Target className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{savingsRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  ${(monthlyIncome - monthlyExpenses).toLocaleString()}/month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                <TrendingUp className="h-4 w-4 text-chart-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-4">${totalSavings.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">Across {data?.savingsGoals?.length || 0} goals</div>
              </CardContent>
            </Card>
          </div>

          {/* Reports Tabs */}
          <Tabs defaultValue="financial-overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="financial-overview">Financial Overview</TabsTrigger>
              <TabsTrigger value="expense-analysis">Expense Analysis</TabsTrigger>
              <TabsTrigger value="goals-progress">Goals Progress</TabsTrigger>
              <TabsTrigger value="debt-tracking">Debt Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="financial-overview" className="space-y-4">
              {/* Income vs Expenses Trend */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Income vs Expenses Trend
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={exportMonthlyReport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, ""]} />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} name="Income" />
                      <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} name="Expenses" />
                      <Line type="monotone" dataKey="savings" stroke="#8b5cf6" strokeWidth={3} name="Savings" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Net Worth Growth */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Net Worth Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, "Net Worth"]} />
                      <Area type="monotone" dataKey="netWorth" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Summary Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Monthly Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Month</th>
                          <th className="text-right p-2">Income</th>
                          <th className="text-right p-2">Expenses</th>
                          <th className="text-right p-2">Savings</th>
                          <th className="text-right p-2">Savings Rate</th>
                          <th className="text-right p-2">Net Worth</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyData.map((month, index) => {
                          const savingsRate = (month.savings / month.income) * 100
                          return (
                            <tr key={index} className="border-b">
                              <td className="p-2 font-medium">{month.month}</td>
                              <td className="p-2 text-right text-chart-4">${month.income.toLocaleString()}</td>
                              <td className="p-2 text-right text-destructive">${month.expenses.toLocaleString()}</td>
                              <td className="p-2 text-right text-primary">${month.savings.toLocaleString()}</td>
                              <td className="p-2 text-right">
                                <Badge variant={savingsRate >= 20 ? "default" : "secondary"}>
                                  {savingsRate.toFixed(1)}%
                                </Badge>
                              </td>
                              <td className="p-2 text-right font-medium">${month.netWorth.toLocaleString()}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expense-analysis" className="space-y-4">
              {/* Expense Categories Pie Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Expense Categories Breakdown
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={exportExpenseReport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={expenseCategories}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expenseCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="space-y-3">
                      <h3 className="font-semibold">Category Details</h3>
                      {expenseCategories.map((category, index) => {
                        const total = expenseCategories.reduce((sum, cat) => sum + cat.value, 0)
                        const percentage = (category.value / total) * 100
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                              <span className="font-medium">{category.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">${category.value.toLocaleString()}</div>
                              <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expense Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Expense Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, "Expenses"]} />
                      <Bar dataKey="expenses" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals-progress" className="space-y-4">
              {/* Goals Progress Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Goals Progress Overview
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={exportGoalsReport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={goalProgress} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip formatter={(value) => [`${value}%`, "Progress"]} />
                      <Bar dataKey="progress" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Goals Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Goals Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {goalProgress.map((goal, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{goal.name}</span>
                          <Badge variant={goal.progress >= 50 ? "default" : "secondary"}>
                            {goal.progress}% Complete
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Current: ${goal.current.toLocaleString()}</span>
                          <span>Target: ${goal.target.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${goal.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Remaining: ${(goal.target - goal.current).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="debt-tracking" className="space-y-4">
              {/* Debt Payoff Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Debt Payoff Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={debtPayoff}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, ""]} />
                      <Legend />
                      <Line type="monotone" dataKey="creditCard" stroke="#ef4444" strokeWidth={2} name="Credit Card" />
                      <Line type="monotone" dataKey="carLoan" stroke="#06b6d4" strokeWidth={2} name="Car Loan" />
                      <Line
                        type="monotone"
                        dataKey="studentLoan"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        name="Student Loan"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Debt Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {debtPayoff.length > 0 ? (
                  debtPayoff.map((debt, index) => (
                    <Card key={debt.id || index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{debt.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-destructive">${debt.balance.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Interest Rate: {debt.interestRate}%
                        </div>
                        <div className="mt-2">
                          <div className="text-xs text-muted-foreground">Minimum Payment</div>
                          <div className="text-sm font-medium">${debt.minimumPayment.toLocaleString()}/month</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-3">
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">No debt data available</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
