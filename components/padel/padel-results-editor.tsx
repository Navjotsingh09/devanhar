'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FINISHING_POSITIONS, getPointsForPosition } from '@/lib/padel-ranking'
import { importTournamentResults, saveTournamentResults, type BulkTournamentResultInput, type TournamentResultInput } from '@/app/dashboard/padel/results/actions'

type PlayerOption = { id: string; first_name: string; last_name: string }

type ExistingResult = {
  finishing_position: string
  player_id: string
  partner_player_id: string | null
  points_awarded: number
  notes: string | null
  matches_played?: number
  match_wins?: number
  group_points_won?: number
  group_points_possible?: number
}

type RowState = {
  id: string
  finishing_position: string
  player_id: string
  partner_player_id: string
  notes: string
  matches_played: number
  match_wins: number
  group_points_won: number
  group_points_possible: number
}

const NONE = '__none__'

function createRow(finishingPosition: string): RowState {
  return {
    id: crypto.randomUUID(),
    finishing_position: finishingPosition,
    player_id: '',
    partner_player_id: '',
    notes: '',
    matches_played: 0,
    match_wins: 0,
    group_points_won: 0,
    group_points_possible: 0,
  }
}

function buildInitialRows(stages: string[], existing: ExistingResult[]): RowState[] {
  return existing
    .filter((result) => stages.includes(result.finishing_position))
    .map((result) => ({
      id: crypto.randomUUID(),
      finishing_position: result.finishing_position,
      player_id: result.player_id,
      partner_player_id: result.partner_player_id || '',
      notes: result.notes || '',
      matches_played: result.matches_played ?? 0,
      match_wins: result.match_wins ?? 0,
      group_points_won: result.group_points_won ?? 0,
      group_points_possible: result.group_points_possible ?? 0,
    }))
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
  const [rows, setRows] = useState<RowState[]>(() =>
    buildInitialRows(orderedStages.map((s) => s.value), existingResults)
  )
  const [importText, setImportText] = useState('')

  useEffect(() => {
    setRows(buildInitialRows(applicableStages, existingResults))
  }, [applicableStages, existingResults])

  const updateRow = (id: string, patch: Partial<RowState>) => {
    setRows((previous) => previous.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  const addRow = (stage: string) => setRows((previous) => [...previous, createRow(stage)])

  const removeRow = (id: string) => setRows((previous) => previous.filter((row) => row.id !== id))

  const playerName = (id: string) => {
    const p = players.find((pl) => pl.id === id)
    return p ? `${p.first_name} ${p.last_name}` : ''
  }

  const handleSave = () => {
    startTransition(async () => {
      const results: TournamentResultInput[] = rows
        .filter((row) => row.player_id)
        .map((row) => ({
          finishing_position: row.finishing_position,
          player_id: row.player_id,
          partner_player_id: row.partner_player_id || null,
          notes: row.notes || null,
          matches_played: row.matches_played,
          match_wins: row.match_wins,
          group_points_won: row.group_points_won,
          group_points_possible: row.group_points_possible,
        }))
      const result = await saveTournamentResults(tournamentId, results)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success('Results saved and leaderboard updated')
      router.refresh()
    })
  }

  const handleImport = () => {
    const lines = importText.trim().split(String.fromCharCode(10)).filter((line) => line.trim() !== "")
    const delimiter = importText.includes('	') ? '	' : ','
    const parsed = lines.map((line) => line.split(delimiter).map((cell) => cell.trim()))
    const data = parsed[0]?.[0]?.toLocaleLowerCase() === 'player_name' ? parsed.slice(1) : parsed
    if (data.length === 0 || data.some((row) => row.length !== 3 || row.some((cell) => cell === ''))) {
      toast.error('Paste three columns per team: player name, partner name, finishing position')
      return
    }
    const imported: BulkTournamentResultInput[] = data.map((row) => ({
      player_name: row[0],
      partner_name: row[1],
      finishing_position: row[2],
    }))
    startTransition(async () => {
      const result = await importTournamentResults(tournamentId, imported)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success('Imported ' + result.importedResults + ' verified player results. Rankings recalculated.')
      setImportText('')
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border p-4 space-y-3">
        <div>
          <h2 className="font-semibold">Bulk import teams</h2>
          <p className="text-sm text-muted-foreground">Paste CSV or tab-separated rows: player name, partner name, finishing position. Both players must already exist as unique approved profiles. The import replaces this tournament's results; names are never automatically merged or created.</p>
        </div>
        <textarea
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
          className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Gavindeep	Mandeep	winner"
        />
        <Button type="button" variant="outline" onClick={handleImport} disabled={isPending}>
          {isPending ? 'Importing...' : 'Import teams'}
        </Button>
      </div>
      {orderedStages.map((stage) => {
        const stageRows = rows.filter((row) => row.finishing_position === stage.value)
        return (
          <div key={stage.value} className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{stage.label}</h3>
              <span className="text-sm text-muted-foreground">{stage.points} pts per player</span>
            </div>
            {stageRows.map((row) => (
              <div key={row.id} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
                <div>
                  <Label>Player</Label>
                  <Select value={row.player_id || NONE} onValueChange={(value) => updateRow(row.id, { player_id: value === NONE ? '' : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>None</SelectItem>
                      {players.map((player) => (
                        <SelectItem key={player.id} value={player.id}>{player.first_name} {player.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Partner (optional, this event only)</Label>
                  <Select value={row.partner_player_id || NONE} onValueChange={(value) => updateRow(row.id, { partner_player_id: value === NONE ? '' : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select partner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>None</SelectItem>
                      {players.filter((player) => player.id !== row.player_id).map((player) => (
                        <SelectItem key={player.id} value={player.id}>{player.first_name} {player.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="outline" className="self-end" onClick={() => removeRow(row.id)}>
                  Remove
                </Button>
                {row.player_id && (
                  <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 md:col-span-3 sm:grid-cols-2 xl:grid-cols-4">
                    {([
                      { key: 'matches_played' as const, label: 'Matches played' },
                      { key: 'match_wins' as const, label: 'Match wins' },
                      { key: 'group_points_won' as const, label: 'Group points won' },
                      { key: 'group_points_possible' as const, label: 'Group points possible' },
                    ]).map((metric) => (
                      <label key={metric.key} className="space-y-1 text-xs font-medium">
                        <span>{metric.label}</span>
                        <input type="number" min="0" step="1" value={row[metric.key]}
                          onChange={(event) => updateRow(row.id, { [metric.key]: Number(event.target.value) })}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          aria-label={metric.label} />
                      </label>
                    ))}
                  </div>
                )}
                {row.player_id && (
                  <p className="text-xs text-muted-foreground md:col-span-2">
                    {playerName(row.player_id)}{row.partner_player_id && <> &amp; {playerName(row.partner_player_id)}</>}
                  </p>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addRow(stage.value)}>
              Add player
            </Button>
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
