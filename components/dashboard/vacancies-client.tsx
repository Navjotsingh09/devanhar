"use client"

import { useState, useTransition, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { createVacancy, updateVacancy, deleteVacancy, toggleVacancy, updateApplicationStatus, deleteApplication, sendMessageToApplicant, saveInternalNotes } from "@/app/dashboard/vacancies/actions"
import { Plus, BriefcaseBusiness, Users, Eye, Pencil, Trash2, Mail, Send, FileText, ExternalLink, Linkedin, StickyNote, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Initiative { id: string; name: string }
type Row = Record<string, unknown>

interface Props {
  vacancies: Row[]
  applications: Row[]
  initiatives: Initiative[]
  messages: Row[]
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interviewed", label: "Interviewed" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
]

export function VacanciesClient({ vacancies, applications, initiatives, messages }: Props) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Row | null>(null)
  const [appTarget, setAppTarget] = useState<Row | null>(null)
  const [isPending, startTransition] = useTransition()

  const messagesByApp = useMemo(() => {
    const map = new Map<string, Row[]>()
    for (const m of messages) {
      const k = m.application_id as string
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(m)
    }
    return map
  }, [messages])

  const handleCreate = (formData: FormData) => {
    startTransition(async () => {
      try { await createVacancy(formData); toast.success("Vacancy created"); setCreateOpen(false) }
      catch (e) { toast.error(e instanceof Error ? e.message : "Failed to create vacancy") }
    })
  }
  const handleUpdate = (id: string, formData: FormData) => {
    startTransition(async () => {
      try { await updateVacancy(id, formData); toast.success("Vacancy updated"); setEditTarget(null) }
      catch (e) { toast.error(e instanceof Error ? e.message : "Failed to update") }
    })
  }
  const handleDelete = (id: string, title: string) => {
    if (!confirm("Delete vacancy \"" + title + "\"? This will also delete all its applications.")) return
    startTransition(async () => {
      try { await deleteVacancy(id); toast.success("Vacancy deleted") }
      catch (e) { toast.error(e instanceof Error ? e.message : "Failed to delete") }
    })
  }
  const handleToggle = (id: string, isActive: boolean) => {
    startTransition(async () => {
      try { await toggleVacancy(id, isActive); toast.success(isActive ? "Activated" : "Deactivated") }
      catch { toast.error("Failed to update") }
    })
  }
  const handleAppStatus = (id: string, status: string) => {
    startTransition(async () => {
      try { await updateApplicationStatus(id, status); toast.success("Status updated") }
      catch { toast.error("Failed to update status") }
    })
  }
  const handleDeleteApp = (id: string, name: string) => {
    if (!confirm("Delete application from " + name + "?")) return
    startTransition(async () => {
      try { await deleteApplication(id); toast.success("Application deleted"); setAppTarget(null) }
      catch { toast.error("Failed to delete") }
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1"><BriefcaseBusiness className="h-3 w-3" />{vacancies.filter((v) => v.is_active).length} Active</Badge>
          <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" />{applications.filter((a) => a.status === "pending").length} Pending</Badge>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus className="h-4 w-4" />New Vacancy</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Vacancy</DialogTitle>
              <DialogDescription>Add a new volunteer role or job opening</DialogDescription>
            </DialogHeader>
            <VacancyForm initiatives={initiatives} onSubmit={handleCreate} pending={isPending} submitLabel="Create" />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="vacancies" className="w-full">
        <TabsList>
          <TabsTrigger value="vacancies">Vacancies ({vacancies.length})</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="vacancies" className="mt-4">
          {vacancies.length === 0 ? (
            <EmptyState icon={<BriefcaseBusiness className="h-10 w-10 text-muted-foreground/50 mb-3" />} title="No vacancies yet" subtitle="Create your first vacancy to start receiving applications." />
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Initiative</TableHead>
                    <TableHead className="hidden md:table-cell">Apps</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vacancies.map((v) => {
                    const appCount = applications.filter((a) => a.vacancy_id === v.id).length
                    return (
                      <TableRow key={v.id as string}>
                        <TableCell className="font-medium text-foreground">{v.title as string}</TableCell>
                        <TableCell className="hidden md:table-cell"><Badge variant="outline" className="text-xs capitalize">{(v.vacancy_type as string)?.replace("_", " ")}</Badge></TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{(v.initiatives as Record<string, string>)?.name || "---"}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{appCount}</TableCell>
                        <TableCell><Switch checked={v.is_active as boolean} onCheckedChange={(c) => handleToggle(v.id as string, c)} disabled={isPending} /></TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditTarget(v)}><Pencil className="h-4 w-4" /><span className="sr-only">Edit</span></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(v.id as string, v.title as string)}><Trash2 className="h-4 w-4" /><span className="sr-only">Delete</span></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="mt-4">
          {applications.length === 0 ? (
            <EmptyState icon={<Users className="h-10 w-10 text-muted-foreground/50 mb-3" />} title="No applications yet" subtitle="Applications will appear here when candidates apply." />
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead className="hidden md:table-cell">Position</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id as string}>
                      <TableCell className="font-medium text-foreground">{app.full_name as string}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{(app.vacancies as Record<string, string>)?.title || "---"}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{app.email as string}</TableCell>
                      <TableCell>
                        <Select value={app.status as string} onValueChange={(v) => handleAppStatus(app.id as string, v)} disabled={isPending}>
                          <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{new Date(app.created_at as string).toLocaleDateString("en-GB")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAppTarget(app)} title="View"><Eye className="h-4 w-4" /><span className="sr-only">View</span></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteApp(app.id as string, app.full_name as string)} disabled={isPending} title="Delete"><Trash2 className="h-4 w-4" /><span className="sr-only">Delete</span></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Vacancy</DialogTitle>
            <DialogDescription>Update the role details</DialogDescription>
          </DialogHeader>
          {editTarget && (<VacancyForm initiatives={initiatives} initial={editTarget} onSubmit={(fd) => handleUpdate(editTarget.id as string, fd)} pending={isPending} submitLabel="Save changes" />)}
        </DialogContent>
      </Dialog>

      <Dialog open={!!appTarget} onOpenChange={(o) => !o && setAppTarget(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {appTarget && (<ApplicationDetail app={appTarget} messages={messagesByApp.get(appTarget.id as string) || []} onDelete={() => handleDeleteApp(appTarget.id as string, appTarget.full_name as string)} onStatusChange={(s) => handleAppStatus(appTarget.id as string, s)} />)}
        </DialogContent>
      </Dialog>
    </>
  )
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {icon}
      <p className="text-lg font-medium text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
}

function VacancyForm({ initiatives, initial, onSubmit, pending, submitLabel }: { initiatives: Initiative[]; initial?: Row; onSubmit: (fd: FormData) => void; pending: boolean; submitLabel: string }) {
  const v = initial || {}
  const closesAt = v.closes_at ? new Date(v.closes_at as string).toISOString().slice(0, 10) : ""
  return (
    <form action={onSubmit} className="flex flex-col gap-4 mt-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title" className="text-foreground">Title *</Label>
        <Input id="title" name="title" required defaultValue={(v.title as string) || ""} placeholder="e.g. Youth Camp Coordinator" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description" className="text-foreground">Short description *</Label>
        <Textarea id="description" name="description" required rows={3} defaultValue={(v.description as string) || ""} placeholder="One paragraph summary shown on the careers list..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="vacancy_type" className="text-foreground">Type *</Label>
          <Select name="vacancy_type" defaultValue={(v.vacancy_type as string) || "volunteer"}>
            <SelectTrigger id="vacancy_type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="volunteer">Volunteer</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="employment_basis" className="text-foreground">Basis</Label>
          <Select name="employment_basis" defaultValue={(v.employment_basis as string) || ""}>
            <SelectTrigger id="employment_basis"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="initiative_id" className="text-foreground">Initiative</Label>
          <Select name="initiative_id" defaultValue={(v.initiative_id as string) || ""}>
            <SelectTrigger id="initiative_id"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {initiatives.map((i) => (<SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="salary_range" className="text-foreground">Salary / stipend</Label>
          <Input id="salary_range" name="salary_range" defaultValue={(v.salary_range as string) || ""} placeholder="e.g. £30k-£35k" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="location" className="text-foreground">Location</Label>
          <Input id="location" name="location" defaultValue={(v.location as string) || ""} placeholder="e.g. London, UK" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="closes_at" className="text-foreground">Closing date</Label>
          <Input id="closes_at" name="closes_at" type="date" defaultValue={closesAt} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="responsibilities" className="text-foreground">Responsibilities</Label>
        <Textarea id="responsibilities" name="responsibilities" rows={3} defaultValue={(v.responsibilities as string) || ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="requirements" className="text-foreground">Requirements</Label>
        <Textarea id="requirements" name="requirements" rows={3} defaultValue={(v.requirements as string) || ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="how_to_apply" className="text-foreground">How to apply (optional override)</Label>
        <Textarea id="how_to_apply" name="how_to_apply" rows={2} defaultValue={(v.how_to_apply as string) || ""} placeholder="Leave blank to use the default apply form" />
      </div>
      <div className="flex items-center gap-3">
        <Switch id="is_remote" name="is_remote" value="true" defaultChecked={!!v.is_remote} />
        <Label htmlFor="is_remote" className="text-foreground">Remote position</Label>
      </div>
      <ApplicationConfigEditor config={(v.application_config as Record<string, boolean> | null) || null} />
      <Button type="submit" disabled={pending}>
        {pending ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>) : submitLabel}
      </Button>
    </form>
  )
}

function ApplicationDetail({ app, messages, onDelete, onStatusChange }: { app: Row; messages: Row[]; onDelete: () => void; onStatusChange: (status: string) => void }) {
  const [tab, setTab] = useState<"info" | "messages" | "notes">("info")
  const [sending, setSending] = useState(false)
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [internalNote, setInternalNote] = useState((app.internal_notes as string) || "")
  const [savingNote, setSavingNote] = useState(false)
  const [cvLoading, setCvLoading] = useState(false)

  const sendMsg = async () => {
    if (!subject.trim() || !body.trim()) { toast.error("Subject and body required"); return }
    setSending(true)
    try {
      await sendMessageToApplicant({ applicationId: app.id as string, subject, body })
      toast.success("Email sent")
      setSubject(""); setBody("")
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed") }
    finally { setSending(false) }
  }

  const saveNotes = async () => {
    setSavingNote(true)
    try { await saveInternalNotes(app.id as string, internalNote); toast.success("Notes saved") }
    catch { toast.error("Failed to save") }
    finally { setSavingNote(false) }
  }

  const openCv = async () => {
    if (!app.cv_url) return
    setCvLoading(true)
    try {
      const res = await fetch("/api/careers/cv-url?path=" + encodeURIComponent(app.cv_url as string))
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed")
      window.open(json.url, "_blank", "noopener")
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not open CV") }
    finally { setCvLoading(false) }
  }

  const openFile = async (path: string, label: string) => {
    try {
      const res = await fetch("/api/careers/cv-url?path=" + encodeURIComponent(path))
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed")
      window.open(json.url, "_blank", "noopener")
    } catch (e) { toast.error(e instanceof Error ? e.message : `Could not open ${label}`) }
  }

  const yesNo = (v: unknown) => v === true ? "Yes" : v === false ? "No" : null

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-foreground">{app.full_name as string}</DialogTitle>
        <DialogDescription>Application for {(app.vacancies as Record<string, string>)?.title || "(deleted vacancy)"}</DialogDescription>
      </DialogHeader>

      <div className="flex items-center gap-2 mt-2">
        <Select value={app.status as string} onValueChange={onStatusChange}>
          <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive ml-auto" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-1.5" /> Delete
        </Button>
      </div>

      <div className="border-b border-border mt-4">
        <div className="flex gap-1">
          <TabBtn active={tab === "info"} onClick={() => setTab("info")} icon={<FileText className="w-3.5 h-3.5" />} label="Details" />
          <TabBtn active={tab === "messages"} onClick={() => setTab("messages")} icon={<Mail className="w-3.5 h-3.5" />} label={"Messages (" + messages.length + ")"} />
          <TabBtn active={tab === "notes"} onClick={() => setTab("notes")} icon={<StickyNote className="w-3.5 h-3.5" />} label="Notes" />
        </div>
      </div>

      {tab === "info" && (
        <div className="flex flex-col gap-4 mt-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" value={app.email as string} />
            {app.phone ? <Field label="Phone" value={app.phone as string} /> : null}
            {app.date_of_birth ? <Field label="Date of birth" value={new Date(app.date_of_birth as string).toLocaleDateString("en-GB")} /> : null}
          </div>
          {(yesNo(app.right_to_work_uk) !== null || yesNo(app.has_filming_equipment) !== null || yesNo(app.can_attend_in_person) !== null || yesNo(app.can_travel_events) !== null) && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3">
              {yesNo(app.right_to_work_uk) !== null && <Field label="Right to work (UK)" value={yesNo(app.right_to_work_uk) as string} />}
              {yesNo(app.has_filming_equipment) !== null && <Field label="Filming equipment" value={yesNo(app.has_filming_equipment) as string} />}
              {yesNo(app.can_attend_in_person) !== null && <Field label="In-person meetings" value={yesNo(app.can_attend_in_person) as string} />}
              {yesNo(app.can_travel_events) !== null && <Field label="Travel for events" value={yesNo(app.can_travel_events) as string} />}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {app.linkedin_url ? (<a href={app.linkedin_url as string} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-muted"><Linkedin className="w-3.5 h-3.5" /> LinkedIn <ExternalLink className="w-3 h-3" /></a>) : null}
            {app.cv_url ? (<Button variant="outline" size="sm" className="h-7 text-xs" onClick={openCv} disabled={cvLoading}>{cvLoading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 mr-1.5" />} View CV</Button>) : null}
            {app.cover_letter_url ? (<Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openFile(app.cover_letter_url as string, "cover letter")}><FileText className="w-3.5 h-3.5 mr-1.5" /> View Cover Letter</Button>) : null}
            {app.portfolio_url ? (<Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openFile(app.portfolio_url as string, "portfolio")}><FileText className="w-3.5 h-3.5 mr-1.5" /> View Portfolio</Button>) : null}
          </div>
          {app.cover_letter ? (
            <div>
              <p className="text-muted-foreground mb-1.5 text-xs uppercase tracking-wider">Cover Letter</p>
              <p className="text-foreground bg-muted rounded-lg p-3 whitespace-pre-line">{app.cover_letter as string}</p>
            </div>
          ) : null}
          <p className="text-xs text-muted-foreground">Submitted {new Date(app.created_at as string).toLocaleString("en-GB")}</p>
        </div>
      )}

      {tab === "messages" && (
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No messages yet. Send the first one below.</p>
            ) : (
              messages.map((m) => (
                <div key={m.id as string} className={"rounded-lg p-3 text-sm " + (m.is_internal_note ? "bg-amber-50 border border-amber-200" : "bg-muted")}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-foreground">{m.is_internal_note ? "Internal note" : (m.subject as string) || "(no subject)"}</span>
                    <span className="text-xs text-muted-foreground">{new Date(m.created_at as string).toLocaleString("en-GB")}</span>
                  </div>
                  <p className="text-foreground whitespace-pre-line text-sm">{m.body as string}</p>
                  {!m.is_internal_note && (<p className="text-xs text-muted-foreground mt-1.5">{m.email_sent ? "Sent" : "Not sent"} - to {m.to_email as string}</p>)}
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <Label htmlFor="msg_subject" className="text-xs uppercase tracking-wider text-muted-foreground">Send email to applicant</Label>
            <Input id="msg_subject" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <Textarea placeholder="Message body. Replies go to careers inbox." rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
            <Button onClick={sendMsg} disabled={sending} className="self-start">
              {sending ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>) : (<><Send className="w-4 h-4 mr-2" /> Send email</>)}
            </Button>
          </div>
        </div>
      )}

      {tab === "notes" && (
        <div className="flex flex-col gap-3 mt-4">
          <Textarea placeholder="Internal notes (only visible to staff)" rows={8} value={internalNote} onChange={(e) => setInternalNote(e.target.value)} />
          <Button onClick={saveNotes} disabled={savingNote} className="self-start">
            {savingNote ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>) : "Save notes"}
          </Button>
        </div>
      )}

      <DialogFooter className="mt-4" />
    </>
  )
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={"inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors " + (active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
      {icon} {label}
    </button>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs uppercase tracking-wider">{label}</p>
      <p className="text-foreground font-medium">{value}</p>
    </div>
  )
}

const CONFIG_OPTIONS: { key: string; label: string }[] = [
  { key: "ask_dob", label: "Ask date of birth" },
  { key: "ask_right_to_work", label: "Ask right to work in the UK" },
  { key: "ask_filming_equipment", label: "Ask if applicant has filming equipment" },
  { key: "ask_in_person_meetings", label: "Ask about in-person meetings/events" },
  { key: "ask_travel_events", label: "Ask about travel for events/shoots" },
  { key: "require_portfolio", label: "Require portfolio / examples upload" },
  { key: "allow_cover_letter_upload", label: "Allow cover letter upload" },
]

function ApplicationConfigEditor({ config }: { config: Record<string, boolean> | null }) {
  const cfg = config || {}
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Application form questions</p>
      <p className="text-xs text-muted-foreground">Toggle which questions appear on the public apply form for this role.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {CONFIG_OPTIONS.map((opt) => (
          <label key={opt.key} className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name={`cfg_${opt.key}`} defaultChecked={!!cfg[opt.key]} />
            <span className="text-foreground">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
