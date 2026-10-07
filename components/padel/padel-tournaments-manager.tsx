'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, ClipboardList, Globe2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
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
  event_time: string | null
  venue: string | null
  address: string | null
  map_url: string | null
  fee_per_person: number
  public_description: string | null
  is_public: boolean
  registration_open: boolean
}

type FormState = {
  name: string
  event_date: string
  category: string
  applicable_stages: string[]
  event_time: string
  venue: string
  address: string
  map_url: string
  fee_per_person: string
  public_description: string
  is_public: boolean
  registration_open: boolean
}

const emptyForm: FormState = {
  name: '',
  event_date: '',
  category: '',
  applicable_stages: FINISHING_POSITIONS.map((p) => p.value),
  event_time: '',
  venue: '',
  address: '',
  map_url: '',
  fee_per_person: '50',
  public_description: '',
  is_public: false,
  registration_open: true,
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
      event_time: tournament.event_time || '',
      venue: tournament.venue || '',
      address: tournament.address || '',
      map_url: tournament.map_url || '',
      fee_per_person: String(tournament.fee_per_person ?? 50),
      public_description: tournament.public_description || '',
      is_public: Boolean(tournament.is_public),
      registration_open: tournament.registration_open !== false,
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
      const input = {
        name: form.name,
        event_date: form.event_date,
        category: form.category || null,
        applicable_stages: form.applicable_stages,
        event_time: form.event_time || null,
        venue: form.venue || null,
        address: form.address || null,
        map_url: form.map_url || null,
        fee_per_person: Number(form.fee_per_person || 50),
        public_description: form.public_description || null,
        is_public: form.is_public,
        registration_open: form.registration_open,
      }
      const result = editingId ? await updateTournament(editingId, input) : await createTournament(input)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success(form.is_public ? 'Tournament saved and published to website' : editingId ? 'Tournament updated' : 'Tournament created')
      setDialogOpen(false)
      router.refresh()
    })
  }

  const handleDelete = (tournament: PadelTournamentRow) => {
    if (!confirm(`Delete "${tournament.name}"? This removes its results too.`)) return
    startTransition(async () => {
      const result = await deleteTournament(tournament.id)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success('Tournament deleted')
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Add tournament</Button>
      </div>

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Stages</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments.map((tournament) => (
              <TableRow key={tournament.id}>
                <TableCell className="font-medium">
                  <div>{tournament.name}</div>
                  <div className="text-xs text-muted-foreground">{tournament.category || 'No category'}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">{tournament.event_date}</TableCell>
                <TableCell>
                  {tournament.is_public ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                      <Globe2 className="h-3 w-3" /> Live
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Hidden</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{tournament.venue || '—'}</TableCell>
                <TableCell className="text-muted-foreground">{tournament.applicable_stages.length} stages</TableCell>
                <TableCell className="text-right space-x-1">
                  <Link href={`/dashboard/padel/tournaments/${tournament.id}/results`}>
                    <Button variant="ghost" size="icon" title="Enter results"><ClipboardList className="h-4 w-4" /></Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(tournament)} disabled={isPending}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(tournament)} disabled={isPending}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {tournaments.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No tournaments yet. Add your first tournament to get started.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editingId ? 'Edit tournament' : 'Add tournament'}</DialogTitle></DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Tournament details</h3>
              <div>
                <Label htmlFor="name">Tournament name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="event_date">Event date</Label>
                  <Input id="event_date" type="date" value={form.event_date} onChange={(e) => setForm((p) => ({ ...p, event_date: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="category">Category (optional)</Label>
                  <Input id="category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="e.g. Open, Women's" />
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border p-4">
              <div>
                <h3 className="text-sm font-semibold">Live website details</h3>
                <p className="mt-1 text-xs text-muted-foreground">These fields power the public Sikh Padel Association page and registration information.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label htmlFor="event_time">Time</Label><Input id="event_time" value={form.event_time} onChange={(e)=>setForm(p=>({...p,event_time:e.target.value}))} placeholder="e.g. 11am–5pm" /></div>
                <div><Label htmlFor="fee">Fee per player (£)</Label><Input id="fee" type="number" min="0" step="0.01" value={form.fee_per_person} onChange={(e)=>setForm(p=>({...p,fee_per_person:e.target.value}))} /></div>
              </div>
              <div><Label htmlFor="venue">Venue</Label><Input id="venue" value={form.venue} onChange={(e)=>setForm(p=>({...p,venue:e.target.value}))} placeholder="e.g. Plaza Padel Amsterdam" /></div>
              <div><Label htmlFor="address">Address</Label><Input id="address" value={form.address} onChange={(e)=>setForm(p=>({...p,address:e.target.value}))} /></div>
              <div><Label htmlFor="map_url">Map URL</Label><Input id="map_url" type="url" value={form.map_url} onChange={(e)=>setForm(p=>({...p,map_url:e.target.value}))} placeholder="https://..." /></div>
              <div>
                <Label htmlFor="public_description">Public description</Label>
                <textarea id="public_description" rows={3} value={form.public_description} onChange={(e)=>setForm(p=>({...p,public_description:e.target.value}))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Short description shown on the live page." />
              </div>
              <label className="flex items-start gap-3 rounded-lg border p-3">
                <Checkbox checked={form.is_public} onCheckedChange={(v)=>setForm(p=>({...p,is_public:v===true}))} />
                <span><span className="block text-sm font-medium">Publish on website</span><span className="block text-xs text-muted-foreground">Makes this the current public tournament. Publishing one automatically hides the previous current tournament.</span></span>
              </label>
              <label className="flex items-start gap-3 rounded-lg border p-3">
                <Checkbox checked={form.registration_open} onCheckedChange={(v)=>setForm(p=>({...p,registration_open:v===true}))} />
                <span><span className="block text-sm font-medium">Registration open</span><span className="block text-xs text-muted-foreground">Controls whether visitors can open the registration form.</span></span>
              </label>
            </div>

            <div>
              <Label>Applicable finishing-position stages</Label>
              <p className="text-xs text-muted-foreground mb-2">Untick any stage this tournament format skips.</p>
              <div className="grid grid-cols-2 gap-2">
                {FINISHING_POSITIONS.map((stage) => (
                  <label key={stage.value} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={form.applicable_stages.includes(stage.value)} onCheckedChange={() => toggleStage(stage.value)} />
                    {stage.label} ({stage.points} pts)
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isPending}>{form.is_public ? 'Save & publish' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
