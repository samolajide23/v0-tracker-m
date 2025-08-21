"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DollarSign, PiggyBank, CreditCard, Target, Star, BarChart3, Home, Menu, X } from "lucide-react"

const navigationItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/income-expenses", label: "Income & Expenses", icon: DollarSign },
  { href: "/emergency-fund", label: "Emergency Fund", icon: PiggyBank },
  { href: "/debt-payoff", label: "Debt Payoff", icon: CreditCard },
  { href: "/savings-goals", label: "Savings Goals", icon: Target },
  { href: "/vision-board", label: "Vision Board", icon: Star },
  { href: "/transactions", label: "Transactions", icon: BarChart3 },
  { href: "/reports", label: "Reports", icon: BarChart3 },
]

export default function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const NavigationContent = () => (
    <>
      {navigationItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
            <Button
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2 w-full justify-start md:w-auto md:justify-center"
            >
              <Icon className="h-4 w-4" />
              <span className="md:hidden lg:inline">{item.label}</span>
            </Button>
          </Link>
        )
      })}
    </>
  )

  return (
    <>
      <div className="md:hidden mb-4">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Financial Tracker</h2>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">Navigation</h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <NavigationContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </Card>
      </div>

      <Card className="p-4 mb-6 hidden md:block">
        <nav className="flex flex-wrap gap-2 justify-center lg:justify-start">
          <NavigationContent />
        </nav>
      </Card>
    </>
  )
}
