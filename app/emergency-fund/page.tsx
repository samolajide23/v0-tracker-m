"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-context"
import Navigation from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import {
  PiggyBank,
  Plus,
  Minus,
  Target,
  TrendingUp,
  ArrowLeft,
  Shield,
  Calendar,
  Settings,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

interface Contribution {
  id: string
  amount: number
  date: string
  type: "deposit" | "withdrawal"
  description: string
}

export default function EmergencyFundPage() {
  const { data, user, loading, updateEmergencyFund } = useSupabase()
  const [currentBalance, setCurrentBalance] = useState(0)
  const [monthlyExpenses, setMonthlyExpenses] = useState(0)
  const [targetMonths, setTargetMonths] = useState(6)
  const [contributions, setContributions] = useState<Contribution[]>([])

  // Load data from Supabase context
  useEffect(() => {
    if (data?.emergencyFund) {
      setCurrentBalance(data.emergencyFund.currentBalance || 0)
      setMonthlyExpenses(data.emergencyFund.monthlyExpenses || 0)
      setTargetMonths(data.emergencyFund.targetMonths || 6)
      setContributions(data.emergencyFund.contributions || [])
    }
  }, [data?.emergencyFund])

  const saveToDatabase = async (updates: any) => {
    if (!user) return
    
    const updatedFund = {
      currentBalance: updates.currentBalance ?? currentBalance,
      monthlyExpenses: updates.monthlyExpenses ?? monthlyExpenses,
      targetMonths: updates.targetMonths ?? targetMonths,
      contributions: updates.contributions ?? contributions,
    }
    
    await updateEmergencyFund(updatedFund)
  }

  const [newContribution, setNewContribution] = useState({
    amount: "",
    type: "deposit" as const,
    description: "",
  })

  const [newMonthlyExpenses, setNewMonthlyExpenses] = useState(monthlyExpenses.toString())
  const [newTargetMonths, setNewTargetMonths] = useState(targetMonths.toString())

  const goalAmount = monthlyExpenses * targetMonths
  const progressPercentage = Math.min((currentBalance / goalAmount) * 100, 100)
  const monthsCovered = currentBalance / monthlyExpenses
  const remainingAmount = Math.max(goalAmount - currentBalance, 0)

  const chartData = contributions.reduce((acc, contribution, index) => {
    const prevBalance = index === 0 ? 0 : acc[index - 1].balance
    const newBalance =
      contribution.type === "deposit" ? prevBalance + contribution.amount : prevBalance - contribution.amount

    acc.push({
      date: contribution.date,
      balance: newBalance,
      goal: goalAmount,
      month: new Date(contribution.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    })
    return acc
  }, [] as any[])

  const addContribution = async () => {
    if (!newContribution.amount || !newContribution.description) {
      return
    }

    const amount = Number.parseFloat(newContribution.amount)
    if (isNaN(amount) || amount <= 0) {
      return
    }

    const contribution: Contribution = {
      id: crypto.randomUUID(),
      amount,
      date: new Date().toISOString().split("T")[0],
      type: newContribution.type,
      description: newContribution.description,
    }

    const newContributions = [...contributions, contribution]
    setContributions(newContributions)

    const newBalance =
      newContribution.type === "deposit" ? currentBalance + amount : Math.max(currentBalance - amount, 0)

    setCurrentBalance(newBalance)

    await saveToDatabase({
      currentBalance: newBalance,
      contributions: newContributions,
      monthlyExpenses,
      targetMonths,
    })

    setNewContribution({ amount: "", type: "deposit", description: "" })
  }

  const updateSettings = async () => {
    const newExpenses = Number.parseFloat(newMonthlyExpenses)
    const newTarget = Number.parseInt(newTargetMonths)

    if (isNaN(newExpenses) || newExpenses <= 0 || isNaN(newTarget) || newTarget <= 0) {
      return
    }

    setMonthlyExpenses(newExpenses)
    setTargetMonths(newTarget)

    await saveToDatabase({
      currentBalance,
      contributions,
      monthlyExpenses: newExpenses,
      targetMonths: newTarget,
    })
  }

  const getStatusColor = () => {
    if (monthsCovered >= targetMonths) return "text-chart-4"
    if (monthsCovered >= 3) return "text-primary"
    if (monthsCovered >= 1) return "text-chart-3"
    return "text-destructive"
  }

  const getStatusMessage = () => {
    if (monthsCovered >= targetMonths) return "Fully funded! You're financially secure."
    if (monthsCovered >= 3) return "Good progress! You have a solid safety net."
    if (monthsCovered >= 1) return "Getting there! Keep building your emergency fund."
    return "Start building your emergency fund today."
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your emergency fund data...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to access your emergency fund.</p>
        </div>
      </div>
    )
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
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Emergency Fund Tracker</h1>
              <p className="text-muted-foreground mt-1">Build your financial safety net for unexpected expenses</p>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {monthsCovered >= targetMonths ? <CheckCircle className="h-5 w-5 text-chart-4" /> : null}
                  <div>
                    <h3 className="font-semibold text-lg">Emergency Fund Status</h3>
                    <p className="text-muted-foreground">{getStatusMessage()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getStatusColor()}`}>{monthsCovered.toFixed(1)} months</div>
                  <div className="text-sm text-muted-foreground">of expenses covered</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                <PiggyBank className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">${currentBalance.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">Your emergency savings</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Goal Amount</CardTitle>
                <Target className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">${goalAmount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">{targetMonths} months of expenses</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                <TrendingUp className="h-4 w-4 text-chart-3" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-3">${remainingAmount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">Left to reach goal</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progress</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{Math.round(progressPercentage)}%</div>
                <div className="text-xs text-muted-foreground mt-1">Of target achieved</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Emergency Fund Progress
                  <Badge variant={progressPercentage >= 100 ? "default" : "secondary"}>
                    {Math.round(progressPercentage)}% Complete
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current: ${currentBalance.toLocaleString()}</span>
                    <span>Goal: ${goalAmount.toLocaleString()}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-4" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-primary">{monthsCovered.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">Months Covered</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-secondary">{targetMonths}</div>
                    <div className="text-xs text-muted-foreground">Target Months</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Milestones</h4>
                  <div className="space-y-1">
                    <div
                      className={`flex items-center gap-2 text-sm ${monthsCovered >= 1 ? "text-chart-4" : "text-muted-foreground"}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${monthsCovered >= 1 ? "bg-chart-4" : "bg-muted-foreground"}`}
                      ></div>
                      1 Month: ${monthlyExpenses.toLocaleString()}
                    </div>
                    <div
                      className={`flex items-center gap-2 text-sm ${monthsCovered >= 3 ? "text-chart-4" : "text-muted-foreground"}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${monthsCovered >= 3 ? "bg-chart-4" : "bg-muted-foreground"}`}
                      ></div>
                      3 Months: ${(monthlyExpenses * 3).toLocaleString()}
                    </div>
                    <div
                      className={`flex items-center gap-2 text-sm ${monthsCovered >= 6 ? "text-chart-4" : "text-muted-foreground"}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${monthsCovered >= 6 ? "bg-chart-4" : "bg-muted-foreground"}`}
                      ></div>
                      6 Months: ${(monthlyExpenses * 6).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        `$${value?.toLocaleString()}`,
                        name === "balance" ? "Balance" : "Goal",
                      ]}
                    />
                    <Line type="monotone" dataKey="balance" stroke="#8884d8" strokeWidth={3} />
                    <Line type="monotone" dataKey="goal" stroke="#82ca9d" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="contributions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="contributions">Manage Contributions</TabsTrigger>
              <TabsTrigger value="settings">Fund Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="contributions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Transaction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="contribution-type">Type</Label>
                      <Select
                        value={newContribution.type}
                        onValueChange={(value: any) => setNewContribution({ ...newContribution, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deposit">Deposit</SelectItem>
                          <SelectItem value="withdrawal">Withdrawal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="contribution-amount">Amount</Label>
                      <Input
                        id="contribution-amount"
                        type="number"
                        placeholder="0.00"
                        value={newContribution.amount}
                        onChange={(e) => setNewContribution({ ...newContribution, amount: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contribution-description">Description</Label>
                      <Input
                        id="contribution-description"
                        placeholder="e.g., Monthly savings"
                        value={newContribution.description}
                        onChange={(e) => setNewContribution({ ...newContribution, description: e.target.value })}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addContribution} className="w-full">
                        {newContribution.type === "deposit" ? "Add Deposit" : "Record Withdrawal"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contributions
                      .slice()
                      .reverse()
                      .map((contribution) => (
                        <div
                          key={contribution.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {contribution.type === "deposit" ? (
                              <Plus className="h-4 w-4 text-chart-4" />
                            ) : (
                              <Minus className="h-4 w-4 text-destructive" />
                            )}
                            <div>
                              <div className="font-medium">{contribution.description}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(contribution.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`font-bold ${contribution.type === "deposit" ? "text-chart-4" : "text-destructive"}`}
                          >
                            {contribution.type === "deposit" ? "+" : "-"}${contribution.amount.toLocaleString()}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Emergency Fund Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="monthly-expenses">Monthly Expenses</Label>
                      <Input
                        id="monthly-expenses"
                        type="number"
                        value={newMonthlyExpenses}
                        onChange={(e) => setNewMonthlyExpenses(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Your total monthly living expenses</p>
                    </div>
                    <div>
                      <Label htmlFor="target-months">Target Months</Label>
                      <Select value={newTargetMonths} onValueChange={setNewTargetMonths}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 Months</SelectItem>
                          <SelectItem value="6">6 Months</SelectItem>
                          <SelectItem value="9">9 Months</SelectItem>
                          <SelectItem value="12">12 Months</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">Recommended: 3-6 months for most people</p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">New Goal Calculation</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Monthly Expenses: ${Number.parseFloat(newMonthlyExpenses || "0").toLocaleString()}</div>
                      <div>Target Months: {newTargetMonths}</div>
                      <div className="font-medium text-foreground">
                        New Goal: $
                        {(
                          Number.parseFloat(newMonthlyExpenses || "0") * Number.parseInt(newTargetMonths || "0")
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button>Update Settings</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Update Emergency Fund Settings?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will change your emergency fund goal from ${goalAmount.toLocaleString()} to $
                          {(
                            Number.parseFloat(newMonthlyExpenses || "0") * Number.parseInt(newTargetMonths || "0")
                          ).toLocaleString()}
                          . Your current balance will remain the same.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={updateSettings}>Update Settings</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
