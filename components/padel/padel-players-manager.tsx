'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UserCircle2, Pencil, Trash2, Ban, CheckCircle2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { preparePhotoForUpload } from '@/lib/image-compression'
import { createPlayer, updatePlayer, setPlayerActive, deletePlayer } from '@/app/dashboard/padel/players/actions'

export type PadelPlayerRow = {
  id: string
  first_name: string
  last_name: string
  photo_url: string | null
  gender: string | null
  city_country: string | null
  is_active: boolean
  total_points: number
}

type FormState = {
  first_name: string
  last_name: string
  gender: string
  city_country: string
  photo_url: string
}

const emptyForm: FormState = { first_name: '', last_name: '', gender: '', city_country: '', photo_url: '' }

export function PadelPlayersManager({ players }: { players: PadelPlayerRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (player: PadelPlayerRow) => {
    setEditingId(player.id)
    setForm({
      first_name: player.first_name,
      last_name: player.last_name,
      gender: player.gender || '',
      city_country: player.city_country || '',
      photo_url: player.photo_url || '',
    })
    setDialogOpen(true)
  }

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const prepared = await preparePhotoForUpload(file)
      const body = new FormData()
      body.append('file', prepared)
      const res = await fetch('/api/padel-players/upload-photo', { method: 'POST', body })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Upload failed')
      setForm((prev) => ({ ...prev, photo_url: json.public_url }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Photo upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = () => {
    startTransition(async () => {
      const input = {
        first_name: form.first_name,
        last_name: form.last_name,
        gender: form.gender || null,
        city_country: form.city_country || null,
        photo_url: form.photo_url || null,
      }
      const result = editingId ? await updatePlayer(editingId, input) : await createPlayer(input)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success(editingId ? 'Player updated' : 'Player added')
      setDialogOpen(false)
      router.refresh()
    })
  }

  const handleToggleActive = (player: PadelPlayerRow) => {
    startTransition(async () => {
      const result = await setPlayerActive(player.id, !player.is_active)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success(player.is_active ? 'Player deactivated' : 'Player reactivated')
      router.refresh()
    })
  }

  const handleDelete = (player: PadelPlayerRow) => {
    if (!confirm(`Delete ${player.first_name} ${player.last_name}? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deletePlayer(player.id)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success('Player deleted')
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Add player
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Total points</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <TableRow key={player.id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={player.photo_url || undefined} alt={player.first_name} />
                    <AvatarFallback><UserCircle2 className="h-6 w-6 text-muted-foreground" /></AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{player.first_name} {player.last_name}</TableCell>
                <TableCell className="text-muted-foreground">{player.city_country || '—'}</TableCell>
                <TableCell className="font-semibold">{player.total_points}</TableCell>
                <TableCell>
                  <span className={player.is_active ? 'text-green-600' : 'text-muted-foreground'}>
                    {player.is_active ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(player)} disabled={isPending}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleToggleActive(player)} disabled={isPending}>
                    {player.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(player)} disabled={isPending}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {players.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No players yet. Add your first player to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit player' : 'Add player'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={form.photo_url || undefined} alt="Preview" />
                <AvatarFallback><UserCircle2 className="h-10 w-10 text-muted-foreground" /></AvatarFallback>
              </Avatar>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? 'Uploading…' : 'Upload photo'}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="first_name">First name</Label>
                <Input id="first_name" value={form.first_name} onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="last_name">Last name</Label>
                <Input id="last_name" value={form.last_name} onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={form.gender || undefined} onValueChange={(v) => setForm((p) => ({ ...p, gender: v }))}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city_country">City / Country (optional)</Label>
                <Input id="city_country" value={form.city_country} onChange={(e) => setForm((p) => ({ ...p, city_country: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isPending || uploading}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
