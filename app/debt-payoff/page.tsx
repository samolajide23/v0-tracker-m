"use client"

import { useState, useMemo, useEffect } from "react"
import { getStorageData, setStorageData } from "@/lib/storage"
import Navigation from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
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
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts"
import { CreditCard, Plus, Minus, TrendingDown, ArrowLeft, Clock, DollarSign, Zap, Snowflake } from "lucide-react"
import Link from "next/link"

interface Debt {
  id: string
  name: string
  type: string
  balance: number
  interestRate: number
  minimumPayment: number
  color: string
}

interface PayoffPlan {
  debt: Debt
  monthsToPayoff: number
  totalInterest: number
  order: number
}

export default function DebtPayoffPage() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [strategy, setStrategy] = useState<"avalanche" | "snowball">("avalanche")
  const [extraPayment, setExtraPayment] = useState(0)

  useEffect(() => {
    const data = getStorageData()
    setDebts(data.debts?.list || [])
    setStrategy(data.debts?.strategy || "avalanche")
    setExtraPayment(data.debts?.extraPayment || 0)
  }, [])

  const saveToStorage = (updates: any) => {
    const data = getStorageData()
    data.debts = { ...data.debts, ...updates }
    setStorageData(data)
  }

  const [newDebt, setNewDebt] = useState({
    name: "",
    type: "Credit Card",
    balance: "",
    interestRate: "",
    minimumPayment: "",
  })

  const debtTypes = ["Credit Card", "Auto Loan", "Student Loan", "Personal Loan", "Mortgage", "Other"]
  const debtColors = ["#ef4444", "#f59e0b", "#06b6d4", "#8b5cf6", "#10b981", "#ec4899"]

  const payoffPlans = useMemo(() => {
    const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0)
    const totalAvailablePayment = totalMinimumPayments + extraPayment

    const sortedDebts = [...debts].sort((a, b) => {
      if (strategy === "avalanche") {
        return b.interestRate - a.interestRate
      } else {
        return a.balance - b.balance
      }
    })

    const plans: PayoffPlan[] = []
    let remainingExtraPayment = extraPayment
    let cumulativeMonths = 0

    sortedDebts.forEach((debt, index) => {
      const extraForThisDebt = index === 0 ? remainingExtraPayment : 0
      const monthlyPayment = debt.minimumPayment + extraForThisDebt

      const monthlyRate = debt.interestRate / 100 / 12
      let months: number
      let totalInterest: number

      if (monthlyRate === 0) {
        months = Math.ceil(debt.balance / monthlyPayment)
        totalInterest = 0
      } else {
        months = Math.ceil(-Math.log(1 - (debt.balance * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate))
        totalInterest = months * monthlyPayment - debt.balance
      }

      plans.push({
        debt,
        monthsToPayoff: months + cumulativeMonths,
        totalInterest,
        order: index + 1,
      })

      cumulativeMonths += months
      remainingExtraPayment += debt.minimumPayment
    })

    return plans
  }, [debts, strategy, extraPayment])

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0)
  const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0)
  const totalInterest = payoffPlans.reduce((sum, plan) => sum + plan.totalInterest, 0)
  const payoffTimeMonths = Math.max(...payoffPlans.map((plan) => plan.monthsToPayoff))
  const payoffTimeYears = Math.floor(payoffTimeMonths / 12)
  const remainingMonths = payoffTimeMonths % 12

  const timelineData = useMemo(() => {
    const data = []
    let remainingBalance = totalDebt

    for (let month = 0; month <= payoffTimeMonths && month <= 60; month += 3) {
      const monthlyReduction = (totalMinimumPayments + extraPayment) * 0.8
      remainingBalance = Math.max(0, totalDebt - monthlyReduction * month)

      data.push({
        month,
        balance: Math.round(remainingBalance),
        year: `Year ${Math.floor(month / 12) + 1}`,
      })
    }

    return data
  }, [totalDebt, totalMinimumPayments, extraPayment, payoffTimeMonths])

  const addDebt = () => {
    if (newDebt.name && newDebt.balance && newDebt.interestRate && newDebt.minimumPayment) {
      const balance = Number.parseFloat(newDebt.balance)
      const interestRate = Number.parseFloat(newDebt.interestRate)
      const minimumPayment = Number.parseFloat(newDebt.minimumPayment)

      if (balance <= 0 || interestRate < 0 || minimumPayment <= 0) {
        alert("Please enter valid positive numbers for all fields")
        return
      }

      const debt: Debt = {
        id: Date.now().toString(),
        name: newDebt.name,
        type: newDebt.type,
        balance,
        interestRate,
        minimumPayment,
        color: debtColors[debts.length % debtColors.length],
      }

      const newDebts = [...debts, debt]
      setDebts(newDebts)
      saveToStorage({
        list: newDebts,
        strategy,
        extraPayment,
      })

      setNewDebt({ name: "", type: "Credit Card", balance: "", interestRate: "", minimumPayment: "" })
    }
  }

  const removeDebt = (id: string) => {
    const newDebts = debts.filter((debt) => debt.id !== id)
    setDebts(newDebts)
    saveToStorage({
      list: newDebts,
      strategy,
      extraPayment,
    })
  }

  const updateStrategy = (newStrategy: "avalanche" | "snowball") => {
    setStrategy(newStrategy)
    saveToStorage({
      list: debts,
      strategy: newStrategy,
      extraPayment,
    })
  }

  const updateExtraPayment = (amount: number) => {
    setExtraPayment(amount)
    saveToStorage({
      list: debts,
      strategy,
      extraPayment: amount,
    })
  }

  const calculateSavings = () => {
    const minimumOnlyPlans = debts.map((debt) => {
      const monthlyRate = debt.interestRate / 100 / 12
      let months: number
      let totalInterest: number

      if (monthlyRate === 0) {
        months = Math.ceil(debt.balance / debt.minimumPayment)
        totalInterest = 0
      } else {
        months = Math.ceil(
          -Math.log(1 - (debt.balance * monthlyRate) / debt.minimumPayment) / Math.log(1 + monthlyRate),
        )
        totalInterest = months * debt.minimumPayment - debt.balance
      }

      return { totalInterest, months }
    })

    const minimumOnlyInterest = minimumOnlyPlans.reduce((sum, plan) => sum + plan.totalInterest, 0)
    const minimumOnlyMonths = Math.max(...minimumOnlyPlans.map((plan) => plan.months))

    return {
      interestSaved: minimumOnlyInterest - totalInterest,
      timeSaved: minimumOnlyMonths - payoffTimeMonths,
    }
  }

  const savings = calculateSavings()

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
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Debt Payoff System</h1>
              <p className="text-muted-foreground mt-1">
                Strategic debt elimination with Avalanche and Snowball methods
              </p>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Payoff Strategy</h3>
                  <div className="flex gap-2">
                    <Button
                      variant={strategy === "avalanche" ? "default" : "outline"}
                      onClick={() => updateStrategy("avalanche")}
                      className="flex items-center gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      Avalanche (High Interest First)
                    </Button>
                    <Button
                      variant={strategy === "snowball" ? "default" : "outline"}
                      onClick={() => updateStrategy("snowball")}
                      className="flex items-center gap-2"
                    >
                      <Snowflake className="h-4 w-4" />
                      Snowball (Small Balance First)
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <Label htmlFor="extra-payment">Extra Monthly Payment</Label>
                    <Input
                      id="extra-payment"
                      type="number"
                      min="0"
                      value={extraPayment}
                      onChange={(e) => updateExtraPayment(Number(e.target.value) || 0)}
                      className="w-32"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
                <CreditCard className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">${totalDebt.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">{debts.length} debts to pay off</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payoff Time</CardTitle>
                <Clock className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {payoffTimeYears}y {remainingMonths}m
                </div>
                <div className="text-xs text-muted-foreground mt-1">With current strategy</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Interest</CardTitle>
                <DollarSign className="h-4 w-4 text-chart-3" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-3">${totalInterest.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">Interest to be paid</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interest Saved</CardTitle>
                <TrendingDown className="h-4 w-4 text-chart-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-4">${savings.interestSaved.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">vs minimum payments only</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Debt Payoff Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" label={{ value: "Months", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: "Balance ($)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, "Remaining Balance"]} />
                  <Line type="monotone" dataKey="balance" stroke="#8884d8" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Tabs defaultValue="payoff-plan" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="payoff-plan">Payoff Plan</TabsTrigger>
              <TabsTrigger value="manage-debts">Manage Debts</TabsTrigger>
            </TabsList>

            <TabsContent value="payoff-plan" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {strategy === "avalanche" ? <Zap className="h-5 w-5" /> : <Snowflake className="h-5 w-5" />}
                    {strategy === "avalanche" ? "Debt Avalanche" : "Debt Snowball"} Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {strategy === "avalanche"
                      ? "Pay minimums on all debts, then put extra money toward the debt with the highest interest rate. This saves the most money on interest."
                      : "Pay minimums on all debts, then put extra money toward the smallest balance. This provides psychological wins and momentum."}
                  </p>

                  <div className="space-y-3">
                    {payoffPlans.map((plan, index) => (
                      <div key={plan.debt.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {plan.order}
                          </Badge>
                          <div>
                            <div className="font-medium">{plan.debt.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ${plan.debt.balance.toLocaleString()} at {plan.debt.interestRate}% APR
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{plan.monthsToPayoff} months</div>
                          <div className="text-sm text-muted-foreground">
                            ${plan.totalInterest.toLocaleString()} interest
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Debts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {debts.map((debt) => {
                      const progress = ((totalDebt - debt.balance) / totalDebt) * 100
                      return (
                        <div key={debt.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: debt.color }}></div>
                              <div>
                                <div className="font-medium">{debt.name}</div>
                                <div className="text-sm text-muted-foreground">{debt.type}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">${debt.balance.toLocaleString()}</div>
                              <div className="text-sm text-muted-foreground">{debt.interestRate}% APR</div>
                            </div>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Min payment: ${debt.minimumPayment}</span>
                            <span>{debt.interestRate}% interest</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manage-debts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Debt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="debt-name">Debt Name</Label>
                      <Input
                        id="debt-name"
                        placeholder="e.g., Chase Credit Card"
                        value={newDebt.name}
                        onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="debt-type">Type</Label>
                      <Select value={newDebt.type} onValueChange={(value) => setNewDebt({ ...newDebt, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {debtTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="debt-balance">Balance</Label>
                      <Input
                        id="debt-balance"
                        type="number"
                        placeholder="0.00"
                        value={newDebt.balance}
                        onChange={(e) => setNewDebt({ ...newDebt, balance: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="debt-interest">Interest Rate (%)</Label>
                      <Input
                        id="debt-interest"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newDebt.interestRate}
                        onChange={(e) => setNewDebt({ ...newDebt, interestRate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="debt-minimum">Min Payment</Label>
                      <Input
                        id="debt-minimum"
                        type="number"
                        placeholder="0.00"
                        value={newDebt.minimumPayment}
                        onChange={(e) => setNewDebt({ ...newDebt, minimumPayment: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={addDebt} className="mt-4">
                    Add Debt
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Debts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {debts.map((debt) => (
                      <div key={debt.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: debt.color }}></div>
                          <div>
                            <div className="font-medium">{debt.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {debt.type} • {debt.interestRate}% APR • ${debt.minimumPayment} min payment
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-destructive">${debt.balance.toLocaleString()}</span>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Minus className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Debt</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove "{debt.name}" from your debt list? This action cannot
                                  be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => removeDebt(debt.id)}>Remove</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
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
