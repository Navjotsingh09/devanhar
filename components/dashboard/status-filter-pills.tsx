"use client"
type StatusTone = "neutral" | "confirmed" | "pending" | "attention"
export type StatusFilterOption = { value: string; label: string; count: number; tone?: StatusTone }
const toneClasses: Record<StatusTone, string> = { neutral: "data-[state=active]:bg-foreground data-[state=active]:border-foreground data-[state=active]:text-background", confirmed: "data-[state=active]:bg-green-100 data-[state=active]:border-green-400 data-[state=active]:text-green-800", pending: "data-[state=active]:bg-amber-100 data-[state=active]:border-amber-400 data-[state=active]:text-amber-800", attention: "data-[state=active]:bg-red-100 data-[state=active]:border-red-400 data-[state=active]:text-red-800" }
export function statusFilterClass(tone: StatusTone = "neutral") { return `rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium transition ${toneClasses[tone]}` }
