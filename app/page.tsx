"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Navigation from "@/components/navigation"
import {
  DollarSign,
  TrendingUp,
  Target,
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Star,
  BarChart3,
} from "lucide-react"
import { useSupabase } from "@/lib/supabase-context"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const { user, data, loading } = useSupabase()
  const router = useRouter()

  if (!user && !loading) {
    router.push("/auth/login")
    return null
  }

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

  const netIncome = monthlyIncome - monthlyExpenses

  const emergencyFund = data?.emergencyFund?.currentBalance || 0
  const emergencyGoal = data?.emergencyFund?.goalAmount || 0
  const emergencyProgress = emergencyGoal > 0 ? (emergencyFund / emergencyGoal) * 100 : 0

  const totalDebt = (data?.debts || []).reduce((sum, debt) => sum + (debt.balance || 0), 0)
  const totalSavingsGoals = (data?.savingsGoals || []).reduce((sum, goal) => sum + (goal.targetAmount || 0), 0)
  const currentSavings = (data?.savingsGoals || []).reduce((sum, goal) => sum + (goal.currentAmount || 0), 0)
  const savingsProgress = totalSavingsGoals > 0 ? (currentSavings / totalSavingsGoals) * 100 : 0

  const motivationalQuotes = [
    "Every dollar saved is a step toward financial freedom.",
    "Your future self will thank you for the choices you make today.",
    "Small consistent actions lead to big financial wins.",
    "Invest in your dreams, one dollar at a time.",
  ]

  const todaysQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]

  return (
    <div className="min-h-screen bg-background p-3 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        <Navigation />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              Financial Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Track your progress and transform your future
            </p>
          </div>
          <div className="flex gap-2 flex-col sm:flex-row">
            <Link href="/reports">
              <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
                View Reports
              </Button>
            </Link>
            <Link href="/income-expenses">
              <Button size="sm" className="w-full sm:w-auto">
                Add Transaction
              </Button>
            </Link>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 dark:from-green-950/20 dark:to-blue-950/20 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Real-time Sync:</strong> Your financial data is securely stored in the cloud and automatically
                syncs across all your devices in real-time.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Monthly Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-primary">${monthlyIncome.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                From {data?.incomes?.length || 0} sources
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Monthly Expenses</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-destructive">${monthlyExpenses.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                {data?.expenses?.length || 0} expense items
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Net Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-xl md:text-2xl font-bold ${netIncome >= 0 ? "text-chart-4" : "text-destructive"}`}>
                ${netIncome.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">Available for savings & goals</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total Debt</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-destructive">${totalDebt.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {data?.debts?.length || 0} debts to pay off
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <PiggyBank className="h-5 w-5 text-primary" />
                  Emergency Fund
                </CardTitle>
                <Badge variant="secondary" className="self-start sm:self-center">
                  {Math.round(emergencyProgress)}% Complete
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-xs md:text-sm">
                <span>Current: ${emergencyFund.toLocaleString()}</span>
                <span>Goal: ${emergencyGoal.toLocaleString()}</span>
              </div>
              <Progress value={emergencyProgress} className="h-2 md:h-3" />
              <p className="text-xs text-muted-foreground">
                ${(emergencyGoal - emergencyFund).toLocaleString()} remaining to reach your{" "}
                {data?.emergencyFund?.targetMonths || 6}-month emergency fund
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Target className="h-5 w-5 text-secondary" />
                  Savings Goals
                </CardTitle>
                <Badge variant="outline" className="self-start sm:self-center">
                  {Math.round(savingsProgress)}% Complete
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-xs md:text-sm">
                <span>Saved: ${currentSavings.toLocaleString()}</span>
                <span>Target: ${totalSavingsGoals.toLocaleString()}</span>
              </div>
              <Progress value={savingsProgress} className="h-2 md:h-3" />
              <p className="text-xs text-muted-foreground">
                {data?.savingsGoals?.length || 0} active goals • ${(totalSavingsGoals - currentSavings).toLocaleString()}{" "}
                remaining
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              <Link href="/income-expenses">
                <Button
                  variant="outline"
                  className="h-16 md:h-20 flex-col gap-1 md:gap-2 bg-transparent w-full text-xs md:text-sm"
                >
                  <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
                  Manage Income
                </Button>
              </Link>
              <Link href="/income-expenses">
                <Button
                  variant="outline"
                  className="h-16 md:h-20 flex-col gap-1 md:gap-2 bg-transparent w-full text-xs md:text-sm"
                >
                  <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
                  Track Expenses
                </Button>
              </Link>
              <Link href="/emergency-fund">
                <Button
                  variant="outline"
                  className="h-16 md:h-20 flex-col gap-1 md:gap-2 bg-transparent w-full text-xs md:text-sm"
                >
                  <PiggyBank className="h-4 w-4 md:h-5 md:w-5" />
                  Emergency Fund
                </Button>
              </Link>
              <Link href="/debt-payoff">
                <Button
                  variant="outline"
                  className="h-16 md:h-20 flex-col gap-1 md:gap-2 bg-transparent w-full text-xs md:text-sm"
                >
                  <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
                  Debt Payoff
                </Button>
              </Link>
              <Link href="/savings-goals">
                <Button
                  variant="outline"
                  className="h-16 md:h-20 flex-col gap-1 md:gap-2 bg-transparent w-full text-xs md:text-sm"
                >
                  <Target className="h-4 w-4 md:h-5 md:w-5" />
                  Savings Goals
                </Button>
              </Link>
              <Link href="/vision-board">
                <Button
                  variant="outline"
                  className="h-16 md:h-20 flex-col gap-1 md:gap-2 bg-transparent w-full text-xs md:text-sm"
                >
                  <Star className="h-4 w-4 md:h-5 md:w-5" />
                  Vision Board
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="text-base md:text-lg">Recent Activity</CardTitle>
              <Link href="/transactions">
                <Button variant="outline" size="sm" className="self-start sm:self-center bg-transparent">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View All Transactions
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3">
              {(data?.transactions || []).slice(0, 3).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-2 md:p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        transaction.type === "income" || transaction.type === "savings"
                          ? "bg-chart-4"
                          : "bg-destructive"
                      }`}
                    ></div>
                    <span className="text-xs md:text-sm truncate">{transaction.description}</span>
                  </div>
                  <span
                    className={`text-xs md:text-sm font-medium flex-shrink-0 ml-2 ${
                      transaction.type === "income" || transaction.type === "savings"
                        ? "text-chart-4"
                        : "text-destructive"
                    }`}
                  >
                    {transaction.type === "income" || transaction.type === "savings" ? "+" : "-"}$
                    {transaction.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              {(data?.transactions || []).length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No transactions yet. Start by adding your income and expenses!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
