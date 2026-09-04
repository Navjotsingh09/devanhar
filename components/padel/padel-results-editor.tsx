'use client'

import { useState, useTransition } from 'react'
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
}

type RowState = {
  id: string
  finishing_position: string
  player_id: string
  partner_player_id: string
  notes: string
}

const NONE = '__none__'

function createRow(finishingPosition: string): RowState {
  return {
    id: crypto.randomUUID(),
    finishing_position: finishingPosition,
    player_id: '',
    partner_player_id: '',
    notes: '',
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
    const lines = importText.trim().split(/?
/).filter((line) => line.trim() !== '')
    const delimiter = importText.includes('	') ? '	' : ','
    const parsed = lines.map((line) => line.split(delimiter).map((cell) => cell.trim()))
    const data = parsed[0]?.[0]?.toLocaleLowerCase() === 'player_first_name' ? parsed.slice(1) : parsed
    if (data.length === 0 || data.some((row) => row.length !== 5 || row.some((cell) => cell === ''))) {
      toast.error('Paste five columns per team: player first name, player last name, partner first name, partner last name, finishing position')
      return
    }
    const imported: BulkTournamentResultInput[] = data.map((row) => ({
      player_first_name: row[0],
      player_last_name: row[1],
      partner_first_name: row[2],
      partner_last_name: row[3],
      finishing_position: row[4],
    }))
    startTransition(async () => {
      const result = await importTournamentResults(tournamentId, imported)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success('Imported ' + result.importedResults + ' player results and ' + result.importedPlayers + ' new profiles')
      setImportText('')
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border p-4 space-y-3">
        <div>
          <h2 className="font-semibold">Bulk import teams</h2>
          <p className="text-sm text-muted-foreground">Paste CSV or tab-separated rows: player first name, player last name, partner first name, partner last name, finishing position.</p>
        </div>
        <textarea
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
          className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Gavindeep	Singh	Mandeep	Kaur	winner"
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
