'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Reply, StickyNote, Send, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface ReplyComposerProps {
  submissionId?: string
  emergencyId?: string
  recipientName: string
  recipientEmail: string | null
}

export function ReplyComposer({ submissionId, emergencyId, recipientName, recipientEmail }: ReplyComposerProps) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sendEmail, setSendEmail] = useState(true)
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!body.trim()) {
      toast.error('Please enter a message')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          emergencyId,
          subject,
          bodyText: body,
          sendEmail: sendEmail && !isInternalNote,
          isInternalNote,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (data.emailSent) {
        toast.success('Reply sent via email')
      } else if (isInternalNote) {
        toast.success('Internal note saved')
      } else {
        toast.success('Reply saved (email not configured - reply stored in database)')
      }

      setOpen(false)
      setSubject('')
      setBody('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reply')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Reply className="h-4 w-4" />
          <span className="sr-only">Reply</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            {isInternalNote ? <StickyNote className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
            {isInternalNote ? 'Internal Note' : 'Reply to'} {recipientName}
          </DialogTitle>
          <DialogDescription>
            {recipientEmail
              ? `Reply will be sent to ${recipientEmail}`
              : 'No email address available - reply will be stored in the system only'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {/* Toggle between reply and internal note */}
          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="internal-note" className="text-sm text-foreground cursor-pointer">Internal note only</Label>
            </div>
            <Switch
              id="internal-note"
              checked={isInternalNote}
              onCheckedChange={setIsInternalNote}
            />
          </div>

          {!isInternalNote && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="subject" className="text-foreground">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Re: Your enquiry to Devanhaar"
                />
              </div>
              {recipientEmail && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Send via email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!process.env.NEXT_PUBLIC_RESEND_CONFIGURED && (
                      <Badge variant="outline" className="text-xs">Requires Resend API key</Badge>
                    )}
                    <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="reply-body" className="text-foreground">
              {isInternalNote ? 'Note' : 'Message'}
            </Label>
            <Textarea
              id="reply-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={isInternalNote ? 'Add internal notes...' : 'Type your reply...'}
              rows={5}
            />
          </div>

          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading
              ? 'Sending...'
              : isInternalNote
                ? 'Save Note'
                : 'Send Reply'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
