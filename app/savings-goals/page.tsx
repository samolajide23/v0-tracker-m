"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-context"
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
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import {
  Target,
  Plus,
  Minus,
  TrendingUp,
  ArrowLeft,
  Calendar,
  DollarSign,
  Home,
  Car,
  GraduationCap,
  Plane,
  Building,
  Heart,
} from "lucide-react"
import Link from "next/link"

interface SavingsGoal {
  id: string
  name: string
  category: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  monthlyContribution: number
  color: string
  icon: any
}

interface Contribution {
  id: string
  goalId: string
  amount: number
  date: string
  description: string
}

const goalCategories = [
  { name: "Retirement", icon: Building, color: "#8b5cf6" },
  { name: "House", icon: Home, color: "#10b981" },
  { name: "Car", icon: Car, color: "#06b6d4" },
  { name: "Education", icon: GraduationCap, color: "#f59e0b" },
  { name: "Travel", icon: Plane, color: "#ef4444" },
  { name: "Wedding", icon: Heart, color: "#ec4899" },
  { name: "Other", icon: Target, color: "#6366f1" },
]

export default function SavingsGoalsPage() {
  const { data, user, loading, updateSavingsGoals } = useSupabase()
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [contributions, setContributions] = useState<Contribution[]>([])

  // Load data from Supabase context
  useEffect(() => {
    if (data?.savingsGoals) {
      setGoals(data.savingsGoals.map(goal => ({
        ...goal,
        icon: goalCategories.find(cat => cat.name === goal.category)?.icon || Target
      })))
    }
  }, [data?.savingsGoals])

  const saveToDatabase = async (newGoals: SavingsGoal[]) => {
    if (!user) return
    
    await updateSavingsGoals(newGoals.map(goal => ({
      id: goal.id,
      name: goal.name,
      category: goal.category,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate,
      monthlyContribution: goal.monthlyContribution,
      color: goal.color,
    })))
  }

  const [newGoal, setNewGoal] = useState({
    name: "",
    category: "Retirement",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
    monthlyContribution: "",
  })

  const [newContribution, setNewContribution] = useState({
    goalId: "",
    amount: "",
    description: "",
  })

  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalMonthlyContributions = goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0)

  const goalsWithProjections = goals.map((goal) => {
    const monthsToTarget = Math.ceil(
      (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    )
    const projectedAmount = goal.currentAmount + goal.monthlyContribution * monthsToTarget
    const isOnTrack = projectedAmount >= goal.targetAmount

    return {
      ...goal,
      monthsToTarget,
      projectedAmount,
      isOnTrack,
      progressPercentage: Math.min((goal.currentAmount / goal.targetAmount) * 100, 100),
    }
  })

  const goalDistribution = goals.map((goal) => ({
    name: goal.name,
    value: goal.currentAmount,
    color: goal.color,
  }))

  const progressData = goalsWithProjections.map((goal) => ({
    name: goal.name,
    current: goal.currentAmount,
    target: goal.targetAmount,
    projected: goal.projectedAmount,
  }))

  const addGoal = async () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.currentAmount || !newGoal.targetDate || !newGoal.monthlyContribution) {
      return
    }

    const targetAmount = Number.parseFloat(newGoal.targetAmount)
    const currentAmount = Number.parseFloat(newGoal.currentAmount)
    const monthlyContribution = Number.parseFloat(newGoal.monthlyContribution)

    if (isNaN(targetAmount) || targetAmount <= 0 || isNaN(currentAmount) || currentAmount < 0 || isNaN(monthlyContribution) || monthlyContribution < 0) {
      return
    }

    const category = goalCategories.find((cat) => cat.name === newGoal.category)
    const goal: SavingsGoal = {
      id: crypto.randomUUID(),
      name: newGoal.name,
      category: newGoal.category,
      targetAmount,
      currentAmount,
      targetDate: newGoal.targetDate,
      monthlyContribution,
      color: category?.color || "#6366f1",
      icon: category?.icon || Target,
    }

    const newGoals = [...goals, goal]
    setGoals(newGoals)
    await saveToDatabase(newGoals)

    setNewGoal({
      name: "",
      category: "Retirement",
      targetAmount: "",
      currentAmount: "",
      targetDate: "",
      monthlyContribution: "",
    })
  }

  const addContribution = async () => {
    if (!newContribution.goalId || !newContribution.amount || !newContribution.description) {
      return
    }

    const amount = Number.parseFloat(newContribution.amount)
    if (isNaN(amount) || amount <= 0) {
      return
    }

    const contribution: Contribution = {
      id: crypto.randomUUID(),
      goalId: newContribution.goalId,
      amount,
      date: new Date().toISOString().split("T")[0],
      description: newContribution.description,
    }

    const newContributions = [...contributions, contribution]
    setContributions(newContributions)

    const updatedGoals = goals.map((goal) =>
      goal.id === newContribution.goalId
        ? { ...goal, currentAmount: goal.currentAmount + amount }
        : goal
    )

    setGoals(updatedGoals)
    await saveToDatabase(updatedGoals)

    setNewContribution({ goalId: "", amount: "", description: "" })
  }

  const removeGoal = async (id: string) => {
    const newGoals = goals.filter((goal) => goal.id !== id)
    setGoals(newGoals)
    await saveToDatabase(newGoals)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your savings goals...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to access your savings goals.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Savings & Goals Tracker</h1>
            <p className="text-muted-foreground mt-1">Track retirement, personal goals, and build your future wealth</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
              <DollarSign className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-4">${totalSaved.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">Across all goals</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Target</CardTitle>
              <Target className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">${totalTarget.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">Combined goal amount</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${totalMonthlyContributions.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">Total monthly contributions</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{Math.round((totalSaved / totalTarget) * 100)}%</div>
              <div className="text-xs text-muted-foreground mt-1">Of total goals achieved</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Savings Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Savings Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={goalDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {goalDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, "Amount Saved"]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Progress Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Goal Progress Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      `$${value?.toLocaleString()}`,
                      name === "current" ? "Current" : "Target",
                    ]}
                  />
                  <Bar dataKey="current" fill="#8884d8" />
                  <Bar dataKey="target" fill="#82ca9d" opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Goals Management */}
        <Tabs defaultValue="goals-overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="goals-overview">Goals Overview</TabsTrigger>
            <TabsTrigger value="add-contribution">Add Contribution</TabsTrigger>
            <TabsTrigger value="manage-goals">Manage Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="goals-overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {goalsWithProjections.map((goal) => {
                const IconComponent = goal.icon
                return (
                  <Card key={goal.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5" style={{ color: goal.color }} />
                          {goal.name}
                        </CardTitle>
                        <Badge variant={goal.isOnTrack ? "default" : "destructive"}>
                          {goal.isOnTrack ? "On Track" : "Behind"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Saved: ${goal.currentAmount.toLocaleString()}</span>
                        <span>Goal: ${goal.targetAmount.toLocaleString()}</span>
                      </div>
                      <Progress value={goal.progressPercentage} className="h-3" />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Target Date</div>
                          <div className="font-medium">{new Date(goal.targetDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Monthly Contribution</div>
                          <div className="font-medium">${goal.monthlyContribution.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Required Monthly</div>
                          <div className={`font-medium ${goal.isOnTrack ? "text-chart-4" : "text-destructive"}`}>
                            ${goal.monthlyContribution.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Projected Completion</div>
                          <div className="font-medium">{new Date(goal.targetDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Remaining: </span>
                          <span className="font-medium">${goal.targetAmount - goal.currentAmount}</span>
                          <span className="text-muted-foreground"> in </span>
                          <span className="font-medium">{goal.monthsToTarget} months</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="add-contribution" className="space-y-4">
            {/* Add Contribution Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Contribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="contribution-goal">Goal</Label>
                    <Select
                      value={newContribution.goalId}
                      onValueChange={(value) => setNewContribution({ ...newContribution, goalId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {goals.map((goal) => (
                          <SelectItem key={goal.id} value={goal.id}>
                            {goal.name}
                          </SelectItem>
                        ))}
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
                      Add Contribution
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Contributions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Contributions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contributions
                    .slice()
                    .reverse()
                    .slice(0, 10)
                    .map((contribution) => {
                      const goal = goals.find((g) => g.id === contribution.goalId)
                      return (
                        <div
                          key={contribution.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: goal?.color }}></div>
                            <div>
                              <div className="font-medium">{contribution.description}</div>
                              <div className="text-sm text-muted-foreground">
                                {goal?.name} • {new Date(contribution.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="font-bold text-chart-4">+${contribution.amount.toLocaleString()}</div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage-goals" className="space-y-4">
            {/* Add Goal Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="goal-name">Goal Name</Label>
                    <Input
                      id="goal-name"
                      placeholder="e.g., Dream Vacation"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-category">Category</Label>
                    <Select
                      value={newGoal.category}
                      onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {goalCategories.map((category) => (
                          <SelectItem key={category.name} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="goal-target">Target Amount</Label>
                    <Input
                      id="goal-target"
                      type="number"
                      placeholder="0.00"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-current">Current Amount</Label>
                    <Input
                      id="goal-current"
                      type="number"
                      placeholder="0.00"
                      value={newGoal.currentAmount}
                      onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-monthly">Monthly Contribution</Label>
                    <Input
                      id="goal-monthly"
                      type="number"
                      placeholder="0.00"
                      value={newGoal.monthlyContribution}
                      onChange={(e) => setNewGoal({ ...newGoal, monthlyContribution: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={addGoal} className="mt-4">
                  Add Goal
                </Button>
              </CardContent>
            </Card>

            {/* Goals List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {goals.map((goal) => {
                    const IconComponent = goal.icon
                    const progress = (goal.currentAmount / goal.targetAmount) * 100
                    return (
                      <div key={goal.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5" style={{ color: goal.color }} />
                          <div>
                            <div className="font-medium">{goal.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {goal.category} • ${goal.currentAmount.toLocaleString()} of $
                              {goal.targetAmount.toLocaleString()} • {Math.round(progress)}%
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={progress >= 100 ? "default" : "secondary"}>
                            {new Date(goal.targetDate).toLocaleDateString()}
                          </Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Minus className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Goal</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove "{goal.name}" from your goals? This will also remove
                                  all associated contributions.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => removeGoal(goal.id)}>Remove</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
