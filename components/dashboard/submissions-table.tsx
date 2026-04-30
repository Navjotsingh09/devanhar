'use client'

import { useState, useTransition } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { updateSubmissionStatus, updateSubmissionNotes, captureApplicationPayment, cancelApplicationPayment } from '@/app/dashboard/submissions/actions'
import { Eye, StickyNote, CheckCircle, XCircle, Download, Search } from 'lucide-react'
import { toast } from 'sonner'
import { ReplyComposer } from '@/components/dashboard/reply-composer'
import { Input } from '@/components/ui/input'

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
  source_table: 'form_submissions' | 'camp_applications'
}

function formatFieldValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join(', ')
  if (value && typeof value === 'object') return JSON.stringify(value)
  return String(value)
}


const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string; badge: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  new:                     { label: 'New',              dot: 'bg-blue-500',    bg: 'bg-blue-50 dark:bg-blue-950',       text: 'text-blue-700 dark:text-blue-300',    badge: 'default' },
  in_review:               { label: 'In Review',       dot: 'bg-amber-500',   bg: 'bg-amber-50 dark:bg-amber-950',     text: 'text-amber-700 dark:text-amber-300',  badge: 'secondary' },
  replied:                 { label: 'Replied',          dot: 'bg-sky-500',     bg: 'bg-sky-50 dark:bg-sky-950',         text: 'text-sky-700 dark:text-sky-300',      badge: 'outline' },
  resolved:                { label: 'Resolved',         dot: 'bg-gray-400',    bg: 'bg-gray-50 dark:bg-gray-900',       text: 'text-gray-600 dark:text-gray-400',    badge: 'outline' },
  archived:                { label: 'Archived',         dot: 'bg-gray-400',    bg: 'bg-gray-50 dark:bg-gray-900',       text: 'text-gray-500 dark:text-gray-500',    badge: 'secondary' },
  pending:                 { label: 'Pending',          dot: 'bg-yellow-500',  bg: 'bg-yellow-50 dark:bg-yellow-950',   text: 'text-yellow-700 dark:text-yellow-300', badge: 'default' },
  payment_pending:         { label: 'Awaiting Payment', dot: 'bg-orange-500',  bg: 'bg-orange-50 dark:bg-orange-950',   text: 'text-orange-700 dark:text-orange-300', badge: 'secondary' },
  payment_authorized:      { label: 'Payment Auth',    dot: 'bg-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-950',   text: 'text-indigo-700 dark:text-indigo-300', badge: 'secondary' },
  payment_support_review:  { label: 'Payment Support',  dot: 'bg-purple-500',  bg: 'bg-purple-50 dark:bg-purple-950',   text: 'text-purple-700 dark:text-purple-300', badge: 'secondary' },
  paid:                    { label: 'Paid',             dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-300', badge: 'outline' },
  approved:                { label: 'Approved',         dot: 'bg-green-500',   bg: 'bg-green-50 dark:bg-green-950',     text: 'text-green-700 dark:text-green-300',  badge: 'outline' },
  declined:                { label: 'Declined',         dot: 'bg-red-500',     bg: 'bg-red-50 dark:bg-red-950',         text: 'text-red-700 dark:text-red-300',      badge: 'destructive' },
}

function getStatus(status: string) {
  return statusConfig[status] || { label: status, dot: 'bg-gray-400', bg: 'bg-gray-50', text: 'text-gray-600', badge: 'default' as const }
}

function StatusPill({ status }: { status: string }) {
  const s = getStatus(status)
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

export function SubmissionsTable({ submissions }: { submissions: Submission[] }) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [notesDialog, setNotesDialog] = useState<Submission | null>(null)
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Distinct statuses present in this list (so the dropdown only shows relevant options)
  const availableStatuses = Array.from(new Set(submissions.map((s) => s.status))).sort()

  const filteredSubmissions = submissions.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      const hay = `${s.full_name} ${s.email} ${s.phone ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  const handleExportCsv = () => {
    if (filteredSubmissions.length === 0) {
      toast.error('Nothing to export')
      return
    }

    const formDataKeys = new Set<string>()
    filteredSubmissions.forEach((s) => {
      Object.keys(s.form_data || {}).forEach((k) => formDataKeys.add(k))
    })
    const formDataCols = Array.from(formDataKeys).sort()

    const baseCols = ['id', 'source', 'full_name', 'email', 'phone', 'status', 'project', 'created_at', 'message', 'internal_notes']
    const headers = [...baseCols, ...formDataCols]

    const escape = (val: unknown): string => {
      if (val == null) return ''
      let s: string
      if (typeof val === 'object') s = JSON.stringify(val)
      else s = String(val)
      if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`
      return s
    }

    const rows = filteredSubmissions.map((s) => {
      const row: Record<string, unknown> = {
        id: s.id,
        source: s.source_table,
        full_name: s.full_name,
        email: s.email,
        phone: s.phone,
        status: s.status,
        project: s.initiatives?.name ?? '',
        created_at: s.created_at,
        message: s.message,
        internal_notes: s.internal_notes,
      }
      formDataCols.forEach((k) => {
        row[k] = s.form_data?.[k]
      })
      return headers.map((h) => escape(row[h])).join(',')
    })

    const csv = '\ufeff' + [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const ts = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `submissions-${statusFilter}-${ts}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${filteredSubmissions.length} row${filteredSubmissions.length === 1 ? '' : 's'}`)
  }

  const handleStatusChange = (id: string, status: string, sourceTable: 'form_submissions' | 'camp_applications' = 'form_submissions') => {
    startTransition(async () => {
      try {
        // For camp applications, approve/decline must go through Stripe so the
        // payment is actually captured (or the auth released). A plain status
        // update would leave the payment in an authorized-but-uncaptured state.
        if (sourceTable === 'camp_applications' && status === 'approved') {
          await captureApplicationPayment(id)
          toast.success('Approved — payment captured')
          return
        }
        if (sourceTable === 'camp_applications' && status === 'declined') {
          await cancelApplicationPayment(id)
          toast.success('Declined — funds released')
          return
        }
        await updateSubmissionStatus(id, status, sourceTable)
        toast.success('Status updated')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to update status')
      }
    })
  }

  const handleApprove = (id: string) => {
    startTransition(async () => {
      try { await captureApplicationPayment(id); toast.success('Approved - payment captured') } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to approve') }
    })
  }

  const handleDecline = (id: string) => {
    startTransition(async () => {
      try { await cancelApplicationPayment(id); toast.success('Declined - funds released') } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to decline') }
    })
  }

  const handleSaveNotes = () => {
    if (!notesDialog) return
    startTransition(async () => {
      try {
        await updateSubmissionNotes(notesDialog.id, notes, notesDialog.source_table)
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
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between mb-3">
        <div className="flex flex-1 gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses ({submissions.length})</SelectItem>
              {availableStatuses.map((s) => {
                const cfg = getStatus(s)
                const count = submissions.filter((x) => x.status === s).length
                return (
                  <SelectItem key={s} value={s}>
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                      {cfg.label} ({count})
                    </span>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {filteredSubmissions.length} of {submissions.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={filteredSubmissions.length === 0}
            className="h-9"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Project</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                  No submissions match the current filter.
                </TableCell>
              </TableRow>
            ) : filteredSubmissions.map((sub) => (
              <TableRow key={sub.id + sub.source_table}>
                <TableCell className="font-medium text-foreground">
                  {sub.full_name}
                  {sub.source_table === 'camp_applications' && (
                    <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0">Camp</Badge>
                  )}
                  {sub.source_table === 'camp_applications' && sub.form_data?.is_sevadaar === true && (
                    <Badge
                      variant="outline"
                      className="ml-1 text-[10px] px-1 py-0 border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300"
                      title="Applicant claims to be a Sevadaar - verify before issuing discount code"
                    >
                      Sevadaar
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="text-xs">{sub.initiatives?.name || 'General'}</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{sub.email}</TableCell>
                <TableCell>
                  <Select
                    value={sub.status}
                    onValueChange={(v) => handleStatusChange(sub.id, v, sub.source_table)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="h-auto w-auto border-0 bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:ml-1 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:opacity-50">
                      <StatusPill status={sub.status} />
                    </SelectTrigger>
                    <SelectContent>
                      {sub.source_table === 'camp_applications' ? (
                        <>
                          <SelectItem value="pending"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-yellow-500" />Pending</span></SelectItem>
                          <SelectItem value="in_review"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" />In Review</span></SelectItem>
                          <SelectItem value="payment_pending"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-500" />Awaiting Payment</span></SelectItem>
                          <SelectItem value="payment_authorized"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-500" />Payment Authorized</span></SelectItem>
                          <SelectItem value="payment_support_review"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-purple-500" />Payment Support</span></SelectItem>
                          <SelectItem value="paid"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Paid</span></SelectItem>
                          <SelectItem value="approved"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500" />Approved</span></SelectItem>
                          <SelectItem value="declined"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500" />Declined</span></SelectItem>
                          <SelectItem value="archived"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-gray-400" />Archived</span></SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="new"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500" />New</span></SelectItem>
                          <SelectItem value="in_review"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" />In Review</span></SelectItem>
                          <SelectItem value="replied"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-500" />Replied</span></SelectItem>
                          <SelectItem value="resolved"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-gray-400" />Resolved</span></SelectItem>
                          <SelectItem value="archived"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-gray-400" />Archived</span></SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                  {sub.source_table === 'camp_applications' && sub.status !== 'declined' && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleApprove(sub.id)}
                        disabled={isPending}
                        title={sub.status === 'approved' ? 'Re-run Stripe capture' : 'Approve - capture payment'}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="sr-only">{sub.status === 'approved' ? 'Re-capture payment' : 'Approve'}</span>
                      </Button>
                      {sub.status !== 'approved' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDecline(sub.id)} disabled={isPending} title="Decline - release funds">
                          <XCircle className="h-4 w-4" />
                          <span className="sr-only">Decline</span>
                        </Button>
                      )}
                    </>
                  )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedSubmission(sub)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
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
                              <p className="text-muted-foreground">Project</p>
                              <p className="text-foreground font-medium">{sub.initiatives?.name || 'General'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Status</p>
                              <StatusPill status={sub.status} />
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
                                {Object.entries(sub.form_data).filter(([, v]) => v != null && v !== '' && String(v) !== 'null').map(([key, value]) => (
                                  <div key={key} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-3 py-1 border-b border-border last:border-0">
                                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                                    {key === 'id_document_url' && typeof value === 'string' && value.length > 0 ? (
                                      <a
                                        href={`/api/camp-applications/view-id?path=${encodeURIComponent(String(value))}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-foreground font-medium underline break-all sm:text-right"
                                      >
                                        View Document
                                      </a>
                                    ) : (
                                      <span className="text-foreground font-medium break-words sm:text-right">{formatFieldValue(value)}</span>
                                    )}
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
                          {sub.source_table === 'camp_applications' && sub.status !== 'declined' && (
                            <div className="flex gap-2 pt-2">
                              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleApprove(sub.id)} disabled={isPending}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {sub.status === 'approved' ? 'Re-run Stripe Capture' : 'Approve & Capture Payment'}
                              </Button>
                              {sub.status !== 'approved' && (
                                <Button variant="destructive" className="flex-1" onClick={() => handleDecline(sub.id)} disabled={isPending}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Decline & Release Funds
                                </Button>
                              )}
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
