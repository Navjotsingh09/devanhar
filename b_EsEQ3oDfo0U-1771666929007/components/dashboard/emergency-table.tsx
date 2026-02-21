'use client'

import { useState, useTransition } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { updateEmergencyStatus, addResolutionNotes } from '@/app/dashboard/emergency/actions'
import { Eye, StickyNote, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { ReplyComposer } from '@/components/dashboard/reply-composer'

interface EmergencyRequest {
  id: string
  caller_name: string
  caller_phone: string
  caller_email: string | null
  location: string | null
  description: string
  urgency: string
  status: string
  resolution_notes: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

const urgencyStyles: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-700 border-red-300',
  high: 'bg-orange-500/15 text-orange-700 border-orange-300',
  medium: 'bg-yellow-500/15 text-yellow-700 border-yellow-300',
  low: 'bg-green-500/15 text-green-700 border-green-300',
}

export function EmergencyTable({ requests }: { requests: EmergencyRequest[] }) {
  const [notesDialog, setNotesDialog] = useState<EmergencyRequest | null>(null)
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = (id: string, status: string) => {
    startTransition(async () => {
      try {
        await updateEmergencyStatus(id, status)
        toast.success('Status updated')
      } catch {
        toast.error('Failed to update status')
      }
    })
  }

  const handleSaveNotes = () => {
    if (!notesDialog) return
    startTransition(async () => {
      try {
        await addResolutionNotes(notesDialog.id, notes)
        toast.success('Resolution notes saved')
        setNotesDialog(null)
      } catch {
        toast.error('Failed to save notes')
      }
    })
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Phone className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-lg font-medium text-foreground">No emergency requests</p>
        <p className="text-sm text-muted-foreground mt-1">Emergency requests from the helpline will appear here.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Urgency</TableHead>
              <TableHead>Caller</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden lg:table-cell">Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id} className={req.urgency === 'critical' ? 'bg-red-500/5' : ''}>
                <TableCell>
                  <Badge className={`text-xs border ${urgencyStyles[req.urgency] || ''}`}>
                    {req.urgency}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-foreground">{req.caller_name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <a href={`tel:${req.caller_phone}`} className="text-sm text-accent hover:underline flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {req.caller_phone}
                  </a>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {req.location ? (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {req.location}
                    </span>
                  ) : (
                    '---'
                  )}
                </TableCell>
                <TableCell>
                  <Select
                    value={req.status}
                    onValueChange={(v) => handleStatusChange(req.id, v)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="h-7 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="acknowledged">Acknowledged</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                  {new Date(req.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  {' '}
                  {new Date(req.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="text-foreground">Emergency Request Details</DialogTitle>
                          <DialogDescription>
                            From {req.caller_name} - {new Date(req.created_at).toLocaleString('en-GB')}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 mt-2">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Phone</p>
                              <a href={`tel:${req.caller_phone}`} className="text-foreground font-medium hover:text-accent">
                                {req.caller_phone}
                              </a>
                            </div>
                            {req.caller_email && (
                              <div>
                                <p className="text-muted-foreground">Email</p>
                                <p className="text-foreground font-medium">{req.caller_email}</p>
                              </div>
                            )}
                            {req.location && (
                              <div>
                                <p className="text-muted-foreground">Location</p>
                                <p className="text-foreground font-medium">{req.location}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-muted-foreground">Urgency</p>
                              <Badge className={`text-xs border ${urgencyStyles[req.urgency]}`}>{req.urgency}</Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Description</p>
                            <p className="text-sm text-foreground bg-muted rounded-lg p-3">{req.description}</p>
                          </div>
                          {req.resolution_notes && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Resolution Notes</p>
                              <p className="text-sm text-foreground bg-accent/20 rounded-lg p-3">{req.resolution_notes}</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <ReplyComposer
                      emergencyId={req.id}
                      recipientName={req.caller_name}
                      recipientEmail={req.caller_email}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setNotesDialog(req)
                        setNotes(req.resolution_notes || '')
                      }}
                    >
                      <StickyNote className="h-4 w-4" />
                      <span className="sr-only">Add resolution notes</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Resolution Notes Dialog */}
      <Dialog open={!!notesDialog} onOpenChange={(open) => !open && setNotesDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Resolution Notes</DialogTitle>
            <DialogDescription>
              Add resolution details for {notesDialog?.caller_name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Label htmlFor="resolution-notes" className="text-foreground">Notes</Label>
            <Textarea
              id="resolution-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the resolution or actions taken..."
              rows={4}
            />
            <Button onClick={handleSaveNotes} disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Notes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
