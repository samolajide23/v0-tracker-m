"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Heart,
  Plus,
  Minus,
  ArrowLeft,
  Star,
  Briefcase,
  DollarSign,
  Users,
  BookOpen,
  Dumbbell,
  Plane,
  Quote,
  ImageIcon,
  CheckCircle,
  Circle,
} from "lucide-react"
import Link from "next/link"

interface VisionGoal {
  id: string
  title: string
  description: string
  category: string
  targetDate: string
  priority: "high" | "medium" | "low"
  status: "not-started" | "in-progress" | "completed"
  milestones: string[]
  color: string
  icon: any
}

interface Habit {
  id: string
  name: string
  category: string
  frequency: "daily" | "weekly"
  streak: number
  completedDates: string[]
  color: string
}

interface Inspiration {
  id: string
  type: "quote" | "image"
  content: string
  author?: string
  category: string
}

const goalCategories = [
  { name: "Financial", icon: DollarSign, color: "#10b981" },
  { name: "Career", icon: Briefcase, color: "#8b5cf6" },
  { name: "Health", icon: Dumbbell, color: "#ef4444" },
  { name: "Relationships", icon: Users, color: "#ec4899" },
  { name: "Education", icon: BookOpen, color: "#f59e0b" },
  { name: "Travel", icon: Plane, color: "#06b6d4" },
  { name: "Personal", icon: Heart, color: "#6366f1" },
]

export default function VisionBoardPage() {
  const [goals, setGoals] = useState<VisionGoal[]>([
    {
      id: "1",
      title: "Achieve Financial Independence",
      description: "Build enough passive income to cover all living expenses",
      category: "Financial",
      targetDate: "2030-12-31",
      priority: "high",
      status: "in-progress",
      milestones: ["Save $100k", "Invest in index funds", "Build emergency fund", "Pay off all debt"],
      color: "#10b981",
      icon: DollarSign,
    },
    {
      id: "2",
      title: "Get Promoted to Senior Manager",
      description: "Advance my career and take on more leadership responsibilities",
      category: "Career",
      targetDate: "2025-06-01",
      priority: "high",
      status: "in-progress",
      milestones: ["Complete leadership training", "Lead major project", "Expand team", "Improve performance metrics"],
      color: "#8b5cf6",
      icon: Briefcase,
    },
    {
      id: "3",
      title: "Run a Marathon",
      description: "Complete a full 26.2 mile marathon race",
      category: "Health",
      targetDate: "2025-10-01",
      priority: "medium",
      status: "not-started",
      milestones: ["Run 5K consistently", "Complete 10K race", "Build to half marathon", "Train for full marathon"],
      color: "#ef4444",
      icon: Dumbbell,
    },
  ])

  const [habits, setHabits] = useState<Habit[]>([
    {
      id: "1",
      name: "Morning Meditation",
      category: "Health",
      frequency: "daily",
      streak: 12,
      completedDates: [],
      color: "#ef4444",
    },
    {
      id: "2",
      name: "Read for 30 minutes",
      category: "Education",
      frequency: "daily",
      streak: 8,
      completedDates: [],
      color: "#f59e0b",
    },
    {
      id: "3",
      name: "Review weekly budget",
      category: "Financial",
      frequency: "weekly",
      streak: 4,
      completedDates: [],
      color: "#10b981",
    },
  ])

  const [inspirations, setInspirations] = useState<Inspiration[]>([
    {
      id: "1",
      type: "quote",
      content: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
      category: "Personal",
    },
    {
      id: "2",
      type: "quote",
      content: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      category: "Career",
    },
    {
      id: "3",
      type: "quote",
      content: "Your body can do it. It's your mind you have to convince.",
      author: "Unknown",
      category: "Health",
    },
  ])

  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "Personal",
    targetDate: "",
    priority: "medium" as const,
    milestones: "",
  })

  const [newHabit, setNewHabit] = useState({
    name: "",
    category: "Personal",
    frequency: "daily" as const,
  })

  const [newInspiration, setNewInspiration] = useState({
    type: "quote" as const,
    content: "",
    author: "",
    category: "Personal",
  })

  const addGoal = () => {
    if (newGoal.title && newGoal.description && newGoal.targetDate) {
      const category = goalCategories.find((cat) => cat.name === newGoal.category) || goalCategories[6]
      const goal: VisionGoal = {
        id: Date.now().toString(),
        title: newGoal.title,
        description: newGoal.description,
        category: newGoal.category,
        targetDate: newGoal.targetDate,
        priority: newGoal.priority,
        status: "not-started",
        milestones: newGoal.milestones
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean),
        color: category.color,
        icon: category.icon,
      }

      setGoals([...goals, goal])
      setNewGoal({
        title: "",
        description: "",
        category: "Personal",
        targetDate: "",
        priority: "medium",
        milestones: "",
      })
    }
  }

  const addHabit = () => {
    if (newHabit.name) {
      const category = goalCategories.find((cat) => cat.name === newHabit.category) || goalCategories[6]
      const habit: Habit = {
        id: Date.now().toString(),
        name: newHabit.name,
        category: newHabit.category,
        frequency: newHabit.frequency,
        streak: 0,
        completedDates: [],
        color: category.color,
      }

      setHabits([...habits, habit])
      setNewHabit({ name: "", category: "Personal", frequency: "daily" })
    }
  }

  const addInspiration = () => {
    if (newInspiration.content) {
      const inspiration: Inspiration = {
        id: Date.now().toString(),
        type: newInspiration.type,
        content: newInspiration.content,
        author: newInspiration.author || undefined,
        category: newInspiration.category,
      }

      setInspirations([...inspirations, inspiration])
      setNewInspiration({ type: "quote", content: "", author: "", category: "Personal" })
    }
  }

  const toggleGoalStatus = (goalId: string) => {
    setGoals(
      goals.map((goal) => {
        if (goal.id === goalId) {
          const statusOrder = ["not-started", "in-progress", "completed"]
          const currentIndex = statusOrder.indexOf(goal.status)
          const nextIndex = (currentIndex + 1) % statusOrder.length
          return { ...goal, status: statusOrder[nextIndex] as any }
        }
        return goal
      }),
    )
  }

  const toggleHabitCompletion = (habitId: string) => {
    const today = new Date().toISOString().split("T")[0]
    setHabits(
      habits.map((habit) => {
        if (habit.id === habitId) {
          const isCompleted = habit.completedDates.includes(today)
          const newCompletedDates = isCompleted
            ? habit.completedDates.filter((date) => date !== today)
            : [...habit.completedDates, today]

          return {
            ...habit,
            completedDates: newCompletedDates,
            streak: isCompleted ? Math.max(0, habit.streak - 1) : habit.streak + 1,
          }
        }
        return habit
      }),
    )
  }

  const removeGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id))
  }

  const removeHabit = (id: string) => {
    setHabits(habits.filter((habit) => habit.id !== id))
  }

  const removeInspiration = (id: string) => {
    setInspirations(inspirations.filter((inspiration) => inspiration.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-chart-4"
      case "in-progress":
        return "text-primary"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-chart-4" />
      case "in-progress":
        return <Circle className="h-4 w-4 text-primary" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive"
      case "medium":
        return "bg-primary"
      default:
        return "bg-muted-foreground"
    }
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
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Future Vision Board</h1>
            <p className="text-muted-foreground mt-1">Visualize your dreams and track your personal transformation</p>
          </div>
        </div>

        {/* Inspirational Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <Star className="h-8 w-8 mx-auto text-primary" />
              <h2 className="font-serif text-xl font-bold">Your Future Awaits</h2>
              <p className="text-muted-foreground">
                Dream big, set goals, build habits, and transform your life one step at a time.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vision Board Tabs */}
        <Tabs defaultValue="goals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="goals">Life Goals</TabsTrigger>
            <TabsTrigger value="habits">Daily Habits</TabsTrigger>
            <TabsTrigger value="inspiration">Inspiration</TabsTrigger>
            <TabsTrigger value="vision">Vision Board</TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-4">
            {/* Add Goal Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Life Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goal-title">Goal Title</Label>
                    <Input
                      id="goal-title"
                      placeholder="e.g., Learn Spanish fluently"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
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
                </div>
                <div>
                  <Label htmlFor="goal-description">Description</Label>
                  <Textarea
                    id="goal-description"
                    placeholder="Describe your goal and why it's important to you..."
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="goal-date">Target Date</Label>
                    <Input
                      id="goal-date"
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-priority">Priority</Label>
                    <Select
                      value={newGoal.priority}
                      onValueChange={(value: any) => setNewGoal({ ...newGoal, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addGoal} className="w-full">
                      Add Goal
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="goal-milestones">Milestones (comma-separated)</Label>
                  <Input
                    id="goal-milestones"
                    placeholder="e.g., Complete beginner course, Practice daily, Take proficiency test"
                    value={newGoal.milestones}
                    onChange={(e) => setNewGoal({ ...newGoal, milestones: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Goals List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {goals.map((goal) => {
                const IconComponent = goal.icon
                const daysUntilTarget = Math.ceil(
                  (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                )
                return (
                  <Card key={goal.id} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5" style={{ color: goal.color }} />
                          <div>
                            <CardTitle className="text-lg">{goal.title}</CardTitle>
                            <Badge variant="outline" className="mt-1">
                              {goal.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(goal.priority)}`}></div>
                          <Button variant="ghost" size="sm" onClick={() => toggleGoalStatus(goal.id)}>
                            {getStatusIcon(goal.status)}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{goal.description}</p>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Target Date</div>
                          <div className="font-medium">{new Date(goal.targetDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Days Remaining</div>
                          <div
                            className={`font-medium ${daysUntilTarget < 30 ? "text-destructive" : "text-foreground"}`}
                          >
                            {daysUntilTarget > 0 ? daysUntilTarget : "Overdue"}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-2">Milestones</div>
                        <div className="space-y-1">
                          {goal.milestones.map((milestone, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Circle className="h-3 w-3 text-muted-foreground" />
                              <span>{milestone}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <Badge
                          variant={
                            goal.status === "completed"
                              ? "default"
                              : goal.status === "in-progress"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {goal.status.replace("-", " ").toUpperCase()}
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
                                Are you sure you want to remove "{goal.title}" from your vision board?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeGoal(goal.id)}>Remove</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="habits" className="space-y-4">
            {/* Add Habit Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Daily Habit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="habit-name">Habit Name</Label>
                    <Input
                      id="habit-name"
                      placeholder="e.g., Drink 8 glasses of water"
                      value={newHabit.name}
                      onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="habit-category">Category</Label>
                    <Select
                      value={newHabit.category}
                      onValueChange={(value) => setNewHabit({ ...newHabit, category: value })}
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
                    <Label htmlFor="habit-frequency">Frequency</Label>
                    <Select
                      value={newHabit.frequency}
                      onValueChange={(value: any) => setNewHabit({ ...newHabit, frequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addHabit} className="w-full">
                      Add Habit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Habits List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {habits.map((habit) => {
                const today = new Date().toISOString().split("T")[0]
                const isCompletedToday = habit.completedDates.includes(today)
                return (
                  <Card key={habit.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{habit.name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleHabitCompletion(habit.id)}
                          className={isCompletedToday ? "text-chart-4" : "text-muted-foreground"}
                        >
                          {isCompletedToday ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">{habit.category}</Badge>
                        <Badge variant="secondary">{habit.frequency}</Badge>
                      </div>

                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold" style={{ color: habit.color }}>
                          {habit.streak}
                        </div>
                        <div className="text-sm text-muted-foreground">Day Streak</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {isCompletedToday ? "Completed today!" : "Mark as done"}
                        </span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Minus className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Habit</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove "{habit.name}" from your habits?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeHabit(habit.id)}>Remove</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="inspiration" className="space-y-4">
            {/* Add Inspiration Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Inspiration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="inspiration-type">Type</Label>
                    <Select
                      value={newInspiration.type}
                      onValueChange={(value: any) => setNewInspiration({ ...newInspiration, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quote">Quote</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="inspiration-category">Category</Label>
                    <Select
                      value={newInspiration.category}
                      onValueChange={(value) => setNewInspiration({ ...newInspiration, category: value })}
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
                    <Label htmlFor="inspiration-author">Author (optional)</Label>
                    <Input
                      id="inspiration-author"
                      placeholder="e.g., Maya Angelou"
                      value={newInspiration.author}
                      onChange={(e) => setNewInspiration({ ...newInspiration, author: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addInspiration} className="w-full">
                      Add Inspiration
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="inspiration-content">{newInspiration.type === "quote" ? "Quote" : "Image URL"}</Label>
                  <Textarea
                    id="inspiration-content"
                    placeholder={
                      newInspiration.type === "quote"
                        ? "Enter an inspiring quote..."
                        : "Enter image URL or description..."
                    }
                    value={newInspiration.content}
                    onChange={(e) => setNewInspiration({ ...newInspiration, content: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Inspiration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inspirations.map((inspiration) => (
                <Card key={inspiration.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {inspiration.type === "quote" ? (
                          <Quote className="h-5 w-5 text-primary" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-secondary" />
                        )}
                        <Badge variant="outline">{inspiration.category}</Badge>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Minus className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Inspiration</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove this inspiration from your board?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeInspiration(inspiration.id)}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {inspiration.type === "quote" ? (
                      <div className="space-y-2">
                        <blockquote className="italic text-foreground">"{inspiration.content}"</blockquote>
                        {inspiration.author && (
                          <cite className="text-sm text-muted-foreground">— {inspiration.author}</cite>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-full h-32 bg-muted/50 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">{inspiration.content}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="vision" className="space-y-4">
            {/* Vision Board Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Your Vision Board
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Goals Summary */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Life Goals</h3>
                    {goals.slice(0, 3).map((goal) => {
                      const IconComponent = goal.icon
                      return (
                        <div key={goal.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <IconComponent className="h-5 w-5" style={{ color: goal.color }} />
                          <div>
                            <div className="font-medium text-sm">{goal.title}</div>
                            <div className="text-xs text-muted-foreground">{goal.category}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Habits Summary */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Daily Habits</h3>
                    {habits.slice(0, 3).map((habit) => (
                      <div key={habit.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: habit.color }}></div>
                        <div>
                          <div className="font-medium text-sm">{habit.name}</div>
                          <div className="text-xs text-muted-foreground">{habit.streak} day streak</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Inspiration Summary */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Daily Inspiration</h3>
                    {inspirations.slice(0, 2).map((inspiration) => (
                      <div key={inspiration.id} className="p-3 bg-muted/50 rounded-lg">
                        {inspiration.type === "quote" ? (
                          <div>
                            <blockquote className="text-sm italic">"{inspiration.content}"</blockquote>
                            {inspiration.author && (
                              <cite className="text-xs text-muted-foreground">— {inspiration.author}</cite>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm">{inspiration.content}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Goals Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {goals.filter((g) => g.status === "completed").length}/{goals.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Goals Completed</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Habit Streaks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-chart-4">{Math.max(...habits.map((h) => h.streak), 0)}</div>
                    <div className="text-sm text-muted-foreground">Longest Streak</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Inspiration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary">{inspirations.length}</div>
                    <div className="text-sm text-muted-foreground">Saved Items</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
