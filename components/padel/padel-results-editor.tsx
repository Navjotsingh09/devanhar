'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FINISHING_POSITIONS, getPointsForPosition } from '@/lib/padel-ranking'
import { saveTournamentResults, type TournamentResultInput } from '@/app/dashboard/padel/results/actions'

type PlayerOption = { id: string; first_name: string; last_name: string }

type ExistingResult = {
  finishing_position: string
  player_id: string
  partner_player_id: string | null
  points_awarded: number
  notes: string | null
}

type RowState = {
  player_id: string
  partner_player_id: string
  points_awarded: number
  notes: string
}

const NONE = '__none__'

function buildInitialRows(stages: string[], existing: ExistingResult[]): Record<string, RowState> {
  const rows: Record<string, RowState> = {}
  for (const stage of stages) {
    const match = existing.find((r) => r.finishing_position === stage)
    rows[stage] = {
      player_id: match?.player_id || '',
      partner_player_id: match?.partner_player_id || '',
      points_awarded: match?.points_awarded ?? getPointsForPosition(stage),
      notes: match?.notes || '',
    }
  }
  return rows
}

export function PadelResultsEditor({
  tournamentId,
  applicableStages,
  players,
  existingResults,
}: {
  tournamentId: string
  applicableStages: string[]
  players: PlayerOption[]
  existingResults: ExistingResult[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const orderedStages = FINISHING_POSITIONS.filter((p) => applicableStages.includes(p.value))
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    buildInitialRows(orderedStages.map((s) => s.value), existingResults)
  )

  const updateRow = (stage: string, patch: Partial<RowState>) => {
    setRows((prev) => ({ ...prev, [stage]: { ...prev[stage], ...patch } }))
  }

  const playerName = (id: string) => {
    const p = players.find((pl) => pl.id === id)
    return p ? `${p.first_name} ${p.last_name}` : ''
  }

  const handleSave = () => {
    startTransition(async () => {
      const results: TournamentResultInput[] = orderedStages
        .filter((stage) => rows[stage.value].player_id)
        .map((stage) => {
          const row = rows[stage.value]
          return {
            finishing_position: stage.value,
            player_id: row.player_id,
            partner_player_id: row.partner_player_id || null,
            points_awarded: Number(row.points_awarded) || 0,
            notes: row.notes || null,
          }
        })
      const result = await saveTournamentResults(tournamentId, results)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success('Results saved and leaderboard updated')
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {orderedStages.map((stage) => {
        const row = rows[stage.value]
        return (
          <div key={stage.value} className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{stage.label}</h3>
              <span className="text-sm text-muted-foreground">Default {stage.points} pts</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Player</Label>
                <Select value={row.player_id || NONE} onValueChange={(v) => updateRow(stage.value, { player_id: v === NONE ? '' : v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>— None —</SelectItem>
                    {players.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Partner (optional, this event only)</Label>
                <Select value={row.partner_player_id || NONE} onValueChange={(v) => updateRow(stage.value, { partner_player_id: v === NONE ? '' : v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select partner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>— None —</SelectItem>
                    {players.filter((p) => p.id !== row.player_id).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Points (editable)</Label>
                <Input
                  type="number"
                  value={row.points_awarded}
                  onChange={(e) => updateRow(stage.value, { points_awarded: Number(e.target.value) })}
                />
              </div>
            </div>
            {row.player_id && (
              <p className="text-xs text-muted-foreground">
                {playerName(row.player_id)}{row.partner_player_id ? ` & ${playerName(row.partner_player_id)}` : ''}
              </p>
            )}
          </div>
        )
      })}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? 'Saving…' : 'Save results'}
        </Button>
      </div>
    </div>
  )
}
