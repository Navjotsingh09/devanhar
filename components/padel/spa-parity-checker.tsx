"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type Player = { id: string; name: string; rank: number; points: number }
type SpreadsheetPlayer = { rank: number; name: string; points: number }
type Issue = { kind: string; details: string }

function normalizeName(value: string) {
  return value.normalize("NFKC").trim().replace(/\\s+/g, " ").toLocaleLowerCase("en-GB")
}

function splitSpreadsheetRow(line: string, separator: string) {
  const cells: string[] = []
  let field = ""
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        field += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === separator && !inQuotes) {
      cells.push(field.trim())
      field = ""
    } else {
      field += char
    }
  }
  cells.push(field.trim())
  return cells
}

function parseSpreadsheet(value: string) {
  const issues: Issue[] = []
  const lines = value.split(/\\r?\\n/).filter((line) => line.trim())
  const separator = lines[0]?.includes("\\t") ? "\\t" : ","
  const entries: SpreadsheetPlayer[] = []

  lines.forEach((line, index) => {
    const cells = splitSpreadsheetRow(line, separator)
    if (index === 0 && /^(rank|position|ranking|#)$/i.test(cells[0] || "")) return
    if (cells.length < 3) {
      issues.push({ kind: "Invalid row", details: `Row ${index + 1} needs Rank, Player, Points` })
      return
    }
    const rank = Number(cells[0]?.replace(/^#/, ""))
    const points = Number(cells[2]?.replace(/[, ]/g, ""))
    const name = cells[1]?.trim() || ""
    if (!Number.isInteger(rank) || rank < 1 || !Number.isFinite(points) || !name) {
      issues.push({ kind: "Invalid row", details: `Row ${index + 1}: invalid rank, name or points` })
      return
    }
    entries.push({ rank, name, points })
  })
  return { entries, issues }
}

export function SPAParityChecker({ leaderboard }: { leaderboard: Player[] }) {
  const [spreadsheetText, setSpreadsheetText] = useState("")

  const report = useMemo(() => {
    if (!spreadsheetText.trim()) return null
    const parsed = parseSpreadsheet(spreadsheetText)
    const issues = [...parsed.issues]
    const liveByName = new Map<string, Player[]>()
    for (const row of leaderboard) {
      const name = normalizeName(row.name)
      liveByName.set(name, [...(liveByName.get(name) || []), row])
    }

    const checked = new Set<string>()
    const sourceSeen = new Set<string>()
    for (const entry of parsed.entries) {
      const key = normalizeName(entry.name)
      if (sourceSeen.has(key)) {
        issues.push({ kind: "Duplicate source name", details: `${entry.name}: needs confirmed identity resolution` })
        continue
      }
      sourceSeen.add(key)
      const matches = liveByName.get(key) || []
      if (matches.length === 0) {
        issues.push({ kind: "Missing player", details: `${entry.name} is not on the live leaderboard` })
      } else if (matches.length > 1) {
        issues.push({ kind: "Ambiguous identity", details: `${entry.name} matches multiple database records` })
      } else {
        const found = matches[0]
        checked.add(found.id)
        if (found.rank !== entry.rank) {
          issues.push({ kind: "Rank mismatch", details: `${entry.name}: spreadsheet #${entry.rank}, system #${found.rank}` })
        }
        if (found.points !== entry.points) {
          issues.push({ kind: "Points mismatch", details: `${entry.name}: spreadsheet ${entry.points}, system ${found.points}` })
        }
      }
    }

    for (const row of leaderboard) {
      if (!checked.has(row.id)) {
        issues.push({ kind: "Extra/unchecked player", details: `${row.name}: #${row.rank}, ${row.points} points` })
      }
    }

    if (parsed.entries.length !== 99) {
      issues.push({ kind: "Source count", details: `Spreadsheet has ${parsed.entries.length} rows; expected 99` })
    }

    return { sourceCount: parsed.entries.length, checkedCount: checked.size, issues }
  }, [leaderboard, spreadsheetText])

  return (
    <section className="space-y-4 rounded-xl border bg-card p-5">
      <div>
        <h2 className="text-lg font-semibold">Spreadsheet parity checker</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste the approved source spreadsheet as three columns: Rank, Player, Points.
          CSV and tab-separated rows are supported. This is a read-only check; no ranks,
          identities or points are changed.
        </p>
      </div>
      <Textarea rows={7} value={spreadsheetText} onChange={(event) => setSpreadsheetText(event.target.value)}
        placeholder={`Rank,Player,Points\\n1,Example Player,1000\\n2,Another Player,700`}
        className="font-mono text-xs" />
      {report && (
        <div className="space-y-3">
          <div role="status" className={`rounded-lg border p-4 text-sm ${report.issues.length === 0 ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-amber-300 bg-amber-50 text-amber-950"}`}>
            <strong>{report.issues.length === 0 ? "Exact comparison passed" : `${report.issues.length} parity issue(s) found`}</strong>
            <p className="mt-1">{report.checkedCount} unique players compared with {report.sourceCount} spreadsheet rows.
              {report.issues.length === 0 ? " Names, points, and dense ranks match. Final human approval is still required before publication." : " Resolve these issues before approving the leaderboard."}</p>
          </div>
          {report.issues.length > 0 && (
            <div className="max-h-72 overflow-auto rounded-lg border">
              <ul className="divide-y text-sm">
                {report.issues.map((issue, index) => (
                  <li key={index} className="px-4 py-2"><span className="font-medium">{issue.kind}:</span> {issue.details}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <Button variant="outline" type="button" onClick={() => setSpreadsheetText("")} disabled={!spreadsheetText}>
        Clear comparison
      </Button>
    </section>
  )
}
