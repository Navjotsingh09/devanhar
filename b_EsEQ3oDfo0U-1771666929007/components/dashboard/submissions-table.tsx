'use client'

import { useState, useTransition } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { updateSubmissionStatus, updateSubmissionNotes } from '@/app/dashboard/submissions/actions'
import { Eye, StickyNote } from 'lucide-react'
import { toast } from 'sonner'
import { ReplyComposer } from '@/components/dashboard/reply-composer'

interface Submission {
  id: string
  full_name: string
  email: string
  phone: string | null
  message: string | null
  form_data: Record<string, unknown>
  status: string
  internal_notes: string | null
  created_at: string
  initiatives: { name: string; slug: string } | null
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  new: 'default',
  in_review: 'secondary',
  replied: 'outline',
  resolved: 'outline',
  archived: 'secondary',
}

export function SubmissionsTable({ submissions }: { submissions: Submission[] }) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [notesDialog, setNotesDialog] = useState<Submission | null>(null)
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = (id: string, status: string) => {
    startTransition(async () => {
      try {
        await updateSubmissionStatus(id, status)
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
        await updateSubmissionNotes(notesDialog.id, notes)
        toast.success('Notes saved')
        setNotesDialog(null)
      } catch {
        toast.error('Failed to save notes')
      }
    })
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-foreground">No submissions found</p>
        <p className="text-sm text-muted-foreground mt-1">Submissions will appear here when users submit forms on the website.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Initiative</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium text-foreground">{sub.full_name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="text-xs">{sub.initiatives?.name || 'General'}</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{sub.email}</TableCell>
                <TableCell>
                  <Select
                    value={sub.status}
                    onValueChange={(v) => handleStatusChange(sub.id, v)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="h-7 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedSubmission(sub)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="text-foreground">Submission Details</DialogTitle>
                          <DialogDescription>
                            From {selectedSubmission?.full_name || sub.full_name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 mt-2">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Email</p>
                              <p className="text-foreground font-medium">{sub.email}</p>
                            </div>
                            {sub.phone && (
                              <div>
                                <p className="text-muted-foreground">Phone</p>
                                <p className="text-foreground font-medium">{sub.phone}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-muted-foreground">Initiative</p>
                              <p className="text-foreground font-medium">{sub.initiatives?.name || 'General'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Status</p>
                              <Badge variant={statusColors[sub.status] || 'default'}>{sub.status}</Badge>
                            </div>
                          </div>
                          {sub.message && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Message</p>
                              <p className="text-sm text-foreground bg-muted rounded-lg p-3">{sub.message}</p>
                            </div>
                          )}
                          {sub.form_data && Object.keys(sub.form_data).length > 0 && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Form Data</p>
                              <div className="bg-muted rounded-lg p-3 text-sm">
                                {Object.entries(sub.form_data).map(([key, value]) => (
                                  <div key={key} className="flex justify-between py-1 border-b border-border last:border-0">
                                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                                    <span className="text-foreground font-medium">{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {sub.internal_notes && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Internal Notes</p>
                              <p className="text-sm text-foreground bg-accent/20 rounded-lg p-3">{sub.internal_notes}</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <ReplyComposer
                      submissionId={sub.id}
                      recipientName={sub.full_name}
                      recipientEmail={sub.email}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setNotesDialog(sub)
                        setNotes(sub.internal_notes || '')
                      }}
                    >
                      <StickyNote className="h-4 w-4" />
                      <span className="sr-only">Add notes</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Notes Dialog */}
      <Dialog open={!!notesDialog} onOpenChange={(open) => !open && setNotesDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Internal Notes</DialogTitle>
            <DialogDescription>
              Add private notes for {notesDialog?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Label htmlFor="notes" className="text-foreground">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes here..."
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
