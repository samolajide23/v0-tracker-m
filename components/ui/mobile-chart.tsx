"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ResponsiveContainer } from "recharts"
import { Maximize2, Minimize2 } from "lucide-react"

interface MobileChartProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function MobileChart({ title, children, className }: MobileChartProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm md:text-base">{title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="md:hidden">
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={isExpanded ? 400 : 250} className="transition-all duration-300">
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
