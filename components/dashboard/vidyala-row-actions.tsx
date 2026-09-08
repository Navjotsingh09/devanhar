'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Archive, Trash2, Mail, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { archiveSubmission, deleteSubmission, sendVidyalaMessage } from '@/app/dashboard/submissions/actions'

type VidyalaSourceTable = 'vidyala_applications' | 'register_interest'

interface VidyalaRowActionsProps {
  id: string
  sourceTable: VidyalaSourceTable
  status: string
  recipientLabel: string
}

export function VidyalaRowActions({ id, sourceTable, status, recipientLabel }: VidyalaRowActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [messageOpen, setMessageOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const handleArchive = () => {
    const confirmed = window.confirm('Archive ' + recipientLabel + '? It will remain in the dashboard and can be found using the Archived filter.')
    if (!confirmed) return
    startTransition(async () => {
      try {
        await archiveSubmission(id, sourceTable)
        toast.success('Archived')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to archive')
      }
    })
  }

  const handleDelete = () => {
    const confirmed = window.confirm('Permanently delete ' + recipientLabel + '? This cannot be undone.')
    if (!confirmed) return
    startTransition(async () => {
      try {
        await deleteSubmission(id, sourceTable)
        toast.success('Deleted')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete')
      }
    })
  }

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error('Message body is required')
      return
    }
    startTransition(async () => {
      try {
        await sendVidyalaMessage({ id, sourceTable, subject: subject.trim() || 'Message from Sikhi Vidyala', message: message.trim() })
        toast.success('Message sent')
        setMessageOpen(false)
        setSubject('')
        setMessage('')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to send message')
      }
    })
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        title="Send message"
        onClick={() => setMessageOpen(true)}
        disabled={isPending}
      >
        <Mail className="h-4 w-4" />
        <span className="sr-only">Send message</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        title="Archive"
        onClick={handleArchive}
        disabled={isPending || status === 'archived'}
      >
        <Archive className="h-4 w-4" />
        <span className="sr-only">Archive</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        title="Delete"
        onClick={handleDelete}
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>

      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send message</DialogTitle>
            <DialogDescription>Sends an email to {recipientLabel}.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="vidyala-message-subject">Subject</Label>
              <Input
                id="vidyala-message-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Message from Sikhi Vidyala"
              />
            </div>
            <div>
              <Label htmlFor="vidyala-message-body">Message</Label>
              <Textarea
                id="vidyala-message-body"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Write your message..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageOpen(false)} disabled={isPending}>Cancel</Button>
            <Button onClick={handleSendMessage} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
