'use client'

import { useState, useTransition } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { createVacancy, toggleVacancy, updateApplicationStatus } from '@/app/dashboard/vacancies/actions'
import { Plus, BriefcaseBusiness, Users, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface Initiative {
  id: string
  name: string
}

interface VacanciesClientProps {
  vacancies: Record<string, unknown>[]
  applications: Record<string, unknown>[]
  initiatives: Initiative[]
}

export function VacanciesClient({ vacancies, applications, initiatives }: VacanciesClientProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleCreate = (formData: FormData) => {
    startTransition(async () => {
      try {
        await createVacancy(formData)
        toast.success('Vacancy created')
        setCreateOpen(false)
      } catch {
        toast.error('Failed to create vacancy')
      }
    })
  }

  const handleToggle = (id: string, isActive: boolean) => {
    startTransition(async () => {
      try {
        await toggleVacancy(id, isActive)
        toast.success(isActive ? 'Vacancy activated' : 'Vacancy deactivated')
      } catch {
        toast.error('Failed to update vacancy')
      }
    })
  }

  const handleAppStatus = (id: string, status: string) => {
    startTransition(async () => {
      try {
        await updateApplicationStatus(id, status)
        toast.success('Status updated')
      } catch {
        toast.error('Failed to update status')
      }
    })
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1">
            <BriefcaseBusiness className="h-3 w-3" />
            {vacancies.filter(v => v.is_active).length} Active
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {applications.filter(a => a.status === 'pending').length} Pending
          </Badge>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Vacancy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Vacancy</DialogTitle>
              <DialogDescription>Add a new volunteer role or job opening</DialogDescription>
            </DialogHeader>
            <form action={handleCreate} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title" className="text-foreground">Title</Label>
                <Input id="title" name="title" required placeholder="e.g. Youth Camp Coordinator" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description" className="text-foreground">Description</Label>
                <Textarea id="description" name="description" required rows={3} placeholder="Role description..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="vacancy_type" className="text-foreground">Type</Label>
                  <Select name="vacancy_type" defaultValue="volunteer">
                    <SelectTrigger id="vacancy_type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="initiative_id" className="text-foreground">Initiative</Label>
                  <Select name="initiative_id">
                    <SelectTrigger id="initiative_id"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {initiatives.map(i => (
                        <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="location" className="text-foreground">Location</Label>
                <Input id="location" name="location" placeholder="e.g. London, UK" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="requirements" className="text-foreground">Requirements</Label>
                <Textarea id="requirements" name="requirements" rows={2} placeholder="Skills and requirements..." />
              </div>
              <div className="flex items-center gap-3">
                <Switch id="is_remote" name="is_remote" value="true" />
                <Label htmlFor="is_remote" className="text-foreground">Remote position</Label>
              </div>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Vacancy'}
              </Button>
            </form>
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
            <div className="flex flex-col items-center justify-center py-12">
              <BriefcaseBusiness className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-lg font-medium text-foreground">No vacancies yet</p>
              <p className="text-sm text-muted-foreground">Create your first vacancy to start receiving applications.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Initiative</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vacancies.map((v) => (
                    <TableRow key={v.id as string}>
                      <TableCell className="font-medium text-foreground">{v.title as string}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="text-xs capitalize">{(v.vacancy_type as string)?.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {(v.initiatives as Record<string, string>)?.name || '---'}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={v.is_active as boolean}
                          onCheckedChange={(checked) => handleToggle(v.id as string, checked)}
                          disabled={isPending}
                        />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {new Date(v.created_at as string).toLocaleDateString('en-GB')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="mt-4">
          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-lg font-medium text-foreground">No applications yet</p>
              <p className="text-sm text-muted-foreground">Applications will appear here when candidates apply.</p>
            </div>
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
                    <TableHead className="text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id as string}>
                      <TableCell className="font-medium text-foreground">{app.full_name as string}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {(app.vacancies as Record<string, string>)?.title || '---'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{app.email as string}</TableCell>
                      <TableCell>
                        <Select
                          value={app.status as string}
                          onValueChange={(v) => handleAppStatus(app.id as string, v)}
                          disabled={isPending}
                        >
                          <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="interviewed">Interviewed</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {new Date(app.created_at as string).toLocaleDateString('en-GB')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="text-foreground">{app.full_name as string}</DialogTitle>
                              <DialogDescription>Application for {(app.vacancies as Record<string, string>)?.title}</DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col gap-3 mt-2 text-sm">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-muted-foreground">Email</p>
                                  <p className="text-foreground font-medium">{app.email as string}</p>
                                </div>
                                {app.phone && (
                                  <div>
                                    <p className="text-muted-foreground">Phone</p>
                                    <p className="text-foreground font-medium">{app.phone as string}</p>
                                  </div>
                                )}
                              </div>
                              {app.cover_letter && (
                                <div>
                                  <p className="text-muted-foreground mb-1">Cover Letter</p>
                                  <p className="text-foreground bg-muted rounded-lg p-3">{app.cover_letter as string}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  )
}
