'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { FINISHING_POSITIONS } from '@/lib/padel-ranking'
import { createTournament, updateTournament, deleteTournament } from '@/app/dashboard/padel/tournaments/actions'

export type PadelTournamentRow = {
  id: string
  name: string
  event_date: string
  category: string | null
  applicable_stages: string[]
  status: string
}

type FormState = {
  name: string
  event_date: string
  category: string
  applicable_stages: string[]
}

const emptyForm: FormState = {
  name: '',
  event_date: '',
  category: '',
  applicable_stages: FINISHING_POSITIONS.map((p) => p.value),
}

export function PadelTournamentsManager({ tournaments }: { tournaments: PadelTournamentRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (tournament: PadelTournamentRow) => {
    setEditingId(tournament.id)
    setForm({
      name: tournament.name,
      event_date: tournament.event_date,
      category: tournament.category || '',
      applicable_stages: tournament.applicable_stages,
    })
    setDialogOpen(true)
  }

  const toggleStage = (stage: string) => {
    setForm((prev) => ({
      ...prev,
      applicable_stages: prev.applicable_stages.includes(stage)
        ? prev.applicable_stages.filter((s) => s !== stage)
        : [...prev.applicable_stages, stage],
    }))
  }

  const handleSave = () => {
    startTransition(async () => {
      try {
        const input = {
          name: form.name,
          event_date: form.event_date,
          category: form.category || null,
          applicable_stages: form.applicable_stages,
        }
        if (editingId) {
          await updateTournament(editingId, input)
          toast.success('Tournament updated')
        } else {
          await createTournament(input)
          toast.success('Tournament created')
        }
        setDialogOpen(false)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to save tournament')
      }
    })
  }

  const handleDelete = (tournament: PadelTournamentRow) => {
    if (!confirm(`Delete "${tournament.name}"? This removes its results too.`)) return
    startTransition(async () => {
      try {
        await deleteTournament(tournament.id)
        toast.success('Tournament deleted')
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to delete tournament')
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Add tournament
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stages</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments.map((tournament) => (
              <TableRow key={tournament.id}>
                <TableCell className="font-medium">{tournament.name}</TableCell>
                <TableCell className="text-muted-foreground">{tournament.event_date}</TableCell>
                <TableCell className="text-muted-foreground">{tournament.category || '—'}</TableCell>
                <TableCell className="text-muted-foreground">{tournament.applicable_stages.length} stages</TableCell>
                <TableCell className="text-right space-x-1">
                  <Link href={`/dashboard/padel/tournaments/${tournament.id}/results`}>
                    <Button variant="ghost" size="icon" title="Enter results">
                      <ClipboardList className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(tournament)} disabled={isPending}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(tournament)} disabled={isPending}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {tournaments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No tournaments yet. Add your first tournament to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit tournament' : 'Add tournament'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Tournament name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="event_date">Event date</Label>
                <Input id="event_date" type="date" value={form.event_date} onChange={(e) => setForm((p) => ({ ...p, event_date: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="category">Category (optional)</Label>
                <Input id="category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="e.g. Open, Women's" />
              </div>
            </div>
            <div>
              <Label>Applicable finishing-position stages</Label>
              <p className="text-xs text-muted-foreground mb-2">Untick any stage this tournament format skips (e.g. Round of 16).</p>
              <div className="grid grid-cols-2 gap-2">
                {FINISHING_POSITIONS.map((stage) => (
                  <label key={stage.value} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.applicable_stages.includes(stage.value)}
                      onCheckedChange={() => toggleStage(stage.value)}
                    />
                    {stage.label} ({stage.points} pts)
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
