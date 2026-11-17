'use client'

import { useState, useTransition } from 'react'
import { isPadelRegistrationOpen, isAmsterdamPadelTournament } from '@/lib/padel-registration-state'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, ClipboardList, Globe2, CalendarDays, MapPin, UsersRound, PauseCircle, PlayCircle, LockKeyhole, EyeOff, CircleCheck, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { FINISHING_POSITIONS } from '@/lib/padel-ranking'
import { createTournament, updateTournament, deleteTournament, setTournamentRegistrationState } from '@/app/dashboard/padel/tournaments/actions'

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
  payment_url: string | null
  map_url: string | null
  fee_per_person: number
  public_description: string | null
  is_public: boolean
  registration_open: boolean
  updated_at?: string | null
}

type FormState = {
  name: string
  event_date: string
  category: string
  applicable_stages: string[]
  event_time: string
  venue: string
  address: string
  payment_url: string
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
  payment_url: '',
  map_url: '',
  fee_per_person: '50',
  public_description: '',
  is_public: false,
  registration_open: true,
}

export function PadelTournamentsManager({ tournaments, basePath = "/dashboard/padel" }: { tournaments: PadelTournamentRow[]; basePath?: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [pendingStateChange, setPendingStateChange] = useState<{ tournament: PadelTournamentRow; action: 'pause' | 'close' | 'resume' } | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<PadelTournamentRow | null>(null)
  const [filter, setFilter] = useState<'all' | 'public' | 'accepting'>('all')
  const today = new Date().toISOString().slice(0, 10)
  const acceptingCount = tournaments.filter(t => t.event_date >= today && isPadelRegistrationOpen(t)).length
  const publishedCount = tournaments.filter(t => t.is_public).length
  const shown = tournaments.filter(t => filter === 'all' || (filter === 'public' ? t.is_public : t.event_date >= today && isPadelRegistrationOpen(t)))
  const readableDate = (date: string) => new Date(date + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

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
      payment_url: tournament.payment_url || '',
      map_url: tournament.map_url || '',
      fee_per_person: String(tournament.fee_per_person ?? 50),
      public_description: tournament.public_description || '',
      is_public: Boolean(tournament.is_public),
      registration_open: isPadelRegistrationOpen(tournament),
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
        payment_url: form.payment_url || null,
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

  const confirmRegistrationState = () => {
    if (!pendingStateChange) return
    const { tournament, action } = pendingStateChange
    startTransition(async () => {
      const result = await setTournamentRegistrationState(tournament.id, action)
      if ('error' in result) { toast.error(result.error); return }
      toast.success(action === 'resume' ? 'Applications reopened — the form is available again.' : action === 'pause' ? 'New applications stopped. Existing entries are safe.' : 'Applications closed. Existing entries are safe.')
      setPendingStateChange(null)
      router.refresh()
    })
  }

  const confirmDelete = () => {
    if (!pendingDeletion) return
    startTransition(async () => {
      const result = await deleteTournament(pendingDeletion.id)
      if ('error' in result) { toast.error(result.error); return }
      toast.success('Tournament deleted')
      setPendingDeletion(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Total tournaments', number: tournaments.length, detail: 'Historic and upcoming', icon: CalendarDays },
          { label: 'On the website', number: publishedCount, detail: 'Publicly visible tournament', icon: Globe2 },
          { label: 'Accepting applications', number: acceptingCount, detail: 'Upcoming registrations open', icon: UsersRound },
        ].map(item => <div key={item.label} className="rounded-2xl border border-[#dedfe4] bg-white p-4 shadow-[0_3px_12px_rgba(15,41,64,0.035)]">
          <div className="flex items-center justify-between gap-3"><span className="text-xs font-medium text-[#697587]">{item.label}</span><item.icon className="h-4 w-4 text-[#9a7919]" /></div>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#102940]">{item.number}</p>
          <p className="mt-1 text-xs text-[#697587]">{item.detail}</p>
        </div>)}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter tournaments">
          {([
            ['all', 'All tournaments'],
            ['public', 'On website'],
            ['accepting', 'Applications open'],
          ] as const).map(([value, label]) =>
            <Button key={value} type="button" size="sm" variant={filter === value ? 'default' : 'outline'} className="rounded-full" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</Button>
          )}
        </div>
        <Button onClick={openCreate} className="rounded-full bg-[#eab328] text-[#122638] hover:bg-[#d9a51c]"><Plus className="mr-1.5 h-4 w-4" /> Add tournament</Button>
      </div>

      <div className="space-y-3">
        {shown.map(tournament => {
          const accepting = isPadelRegistrationOpen(tournament)
          const expired = tournament.event_date < today
          const amsterdam = isAmsterdamPadelTournament(tournament)
          const statusLabel = expired ? 'Event finished' : accepting ? 'Applications open' : amsterdam ? 'Applications closed' : 'Not accepting applications'
          const statusClass = accepting && !expired ? 'bg-[#eaf7ee] text-[#17683d]' : expired ? 'bg-[#f0f1f3] text-[#657284]' : 'bg-[#fff2df] text-[#95590e]'
          return <article key={tournament.id} className="overflow-hidden rounded-2xl border border-[#dfe2e7] bg-white shadow-[0_5px_20px_rgba(15,41,64,0.04)]">
            <div className="flex flex-wrap items-start justify-between gap-4 p-5 md:p-6">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold tracking-tight text-[#102940]">{tournament.name}</h3>
                  {tournament.is_public ? <span className="inline-flex items-center gap-1 rounded-full bg-[#e9f4ee] px-2.5 py-1 text-[11px] font-semibold text-[#236444]"><Globe2 className="h-3 w-3" /> Published</span>
                    : <span className="inline-flex items-center gap-1 rounded-full bg-[#f2f3f5] px-2.5 py-1 text-[11px] font-medium text-[#677386]"><EyeOff className="h-3 w-3" /> Not published</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#637185]">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{readableDate(tournament.event_date)}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{tournament.venue || 'Venue not set'}</span>
                  <span className="inline-flex items-center gap-1.5"><CircleCheck className="h-4 w-4" />{tournament.applicable_stages.length} scoring stages</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-full" asChild><Link href={`${basePath}/tournaments/${tournament.id}/results`}><ClipboardList className="mr-1.5 h-4 w-4" />Results</Link></Button>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => openEdit(tournament)} disabled={isPending}><Pencil className="mr-1.5 h-4 w-4" />Edit</Button>
                <Button variant="ghost" size="icon" aria-label={`Delete ${tournament.name}`} title="Delete tournament" onClick={() => setPendingDeletion(tournament)} disabled={isPending} className="text-[#a74444] hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="flex flex-col gap-4 border-t border-[#e7e9ed] bg-[#fafbfc] px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>{statusLabel}</span>
                  {!tournament.is_public && <span className="text-xs text-[#687587]">This event is not advertised on the public SPA page.</span>}
                </div>
                <p className="max-w-lg text-xs leading-relaxed text-[#667487]">
                  {expired ? 'The event date has passed. New online applications should stay closed.' : accepting ? 'Visitors can submit new applications. Existing applications remain in the organiser dashboard.' : 'New applications are blocked. Previously received applications and payment records are retained.'}
                </p>
              </div>
              {!expired && <div className="flex shrink-0 flex-wrap gap-2">
                {accepting ? <>
                  <Button size="sm" variant="outline" className="rounded-full" disabled={isPending} onClick={() => setPendingStateChange({ tournament, action: 'pause' })}><PauseCircle className="mr-1.5 h-4 w-4" />Pause intake</Button>
                  <Button size="sm" variant="outline" className="rounded-full border-[#d9a99b] text-[#a3452c] hover:bg-[#fff0eb]" disabled={isPending} onClick={() => setPendingStateChange({ tournament, action: 'close' })}><LockKeyhole className="mr-1.5 h-4 w-4" />Close applications</Button>
                </> : <Button size="sm" className="rounded-full bg-[#102940] text-white hover:bg-[#204664]" disabled={isPending} onClick={() => setPendingStateChange({ tournament, action: 'resume' })}><PlayCircle className="mr-1.5 h-4 w-4" />Reopen applications</Button>}
              </div>}
            </div>
          </article>
        })}
        {!shown.length && <div className="rounded-2xl border border-dashed border-[#cdd3dc] p-10 text-center">
          <CalendarDays className="mx-auto mb-3 h-7 w-7 text-[#8c97a7]" />
          <p className="font-semibold text-[#102940]">No matching tournaments</p>
          <p className="mt-1 text-sm text-[#687587]">{filter === 'all' ? 'Create a tournament to get started.' : 'Try another filter to view your tournaments.'}</p>
        </div>}
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-[#dce4e9] bg-[#f4f8fa] p-4 text-xs leading-relaxed text-[#516477]">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p><strong className="text-[#102940]">About application controls:</strong> Pause and Close both stop new registrations immediately; the current database stores these as the same off state. Reopen explicitly resumes intake. None of these actions removes existing applications. Publishing a tournament is a separate setting.</p>
      </div>

      <Dialog open={Boolean(pendingStateChange)} onOpenChange={open => { if (!open && !isPending) setPendingStateChange(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{pendingStateChange?.action === 'resume' ? 'Reopen applications?' : pendingStateChange?.action === 'pause' ? 'Pause new applications?' : 'Close applications?'}</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm text-[#627083]">
            <p className="font-semibold text-[#102940]">{pendingStateChange?.tournament.name}</p>
            <p>{pendingStateChange?.action === 'resume'
              ? 'This will allow new submissions through the public registration form and API again. Make sure the event is ready to accept applications.'
              : 'New applications will stop immediately, including direct API submissions. Existing applications and payment records will not be deleted.'}</p>
            {pendingStateChange?.action === 'pause' && <p className="rounded-lg bg-[#fff5e3] p-3 text-xs text-[#7b541b]">Pause and Close currently have the same saved state. The difference is your operational intention; use Reopen to accept applications again.</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={isPending} onClick={() => setPendingStateChange(null)}>Cancel</Button>
            <Button disabled={isPending} onClick={confirmRegistrationState}>{isPending ? 'Saving…' : pendingStateChange?.action === 'resume' ? 'Yes, reopen' : pendingStateChange?.action === 'pause' ? 'Pause applications' : 'Close applications'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(pendingDeletion)} onOpenChange={open => { if (!open && !isPending) setPendingDeletion(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Delete tournament?</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm text-[#647186]"><p className="font-semibold text-[#102940]">{pendingDeletion?.name}</p><p>Deleting a tournament is permanent. Tournaments with recorded results cannot be deleted because they affect official rankings.</p></div>
          <DialogFooter>
            <Button variant="outline" disabled={isPending} onClick={() => setPendingDeletion(null)}>Keep tournament</Button>
            <Button variant="destructive" disabled={isPending} onClick={confirmDelete}>{isPending ? 'Deleting…' : 'Delete tournament'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <div><Label htmlFor="payment_url">Tournament payment link</Label><Input id="payment_url" type="url" value={form.payment_url} onChange={(e)=>setForm(p=>({...p,payment_url:e.target.value}))} placeholder="https://www.totalgiving.co.uk/appeal/.../donate" /><p className="mt-1 text-xs text-muted-foreground">Used after registration and in the payment email.</p></div>
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
                <span><span className="block text-sm font-medium">Registration open</span><span className="block text-xs text-muted-foreground">Controls whether visitors can open the registration form. Use the Pause / Close / Resume buttons in the tournament table for immediate changes.</span></span>
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
