"use client"

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Shield, ShieldCheck, User, Info } from 'lucide-react'
import { updateUserRole } from '@/app/dashboard/users/actions'
import { toast } from 'sonner'

interface Profile {
  id: string
  full_name: string | null
  role: string
  created_at: string
}

interface UsersClientProps {
  profiles: Profile[]
  currentUserId: string
}

const roleConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; variant: 'default' | 'secondary' | 'outline' }> = {
  super_admin: { label: 'Super Admin', icon: ShieldCheck, variant: 'default' },
  admin: { label: 'Admin', icon: Shield, variant: 'default' },
  staff: { label: 'Staff', icon: User, variant: 'secondary' },
  volunteer: { label: 'Staff', icon: User, variant: 'secondary' },
}

export function UsersClient({ profiles, currentUserId }: UsersClientProps) {
  const [isPending, startTransition] = useTransition()

  const handleRoleChange = (userId: string, newRole: string) => {
    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole as 'admin' | 'staff')
        toast.success('User role updated successfully')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to update role')
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Access Levels Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Admin</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>&bull; Full dashboard access</li>
              <li>&bull; Manage users &amp; roles</li>
              <li>&bull; Manage vacancies</li>
              <li>&bull; Access settings</li>
              <li>&bull; View activity log</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Staff</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>&bull; View submissions</li>
              <li>&bull; Respond to emergencies</li>
              <li>&bull; View vacancies &amp; applications</li>
              <li>&bull; View activity log</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="flex items-start gap-3 py-4">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Donations &amp; Sales</p>
            <p>All donations and shop sales are managed through <a href="https://donationmanager.co.uk" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline underline-offset-2">donationmanager.co.uk</a>. Webhook events are automatically received at <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/api/webhooks/donationmanager</code>.</p>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>{profiles.length} registered user{profiles.length !== 1 ? 's' : ''}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Change Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => {
                const config = roleConfig[profile.role] || roleConfig.staff
                const isCurrentUser = profile.id === currentUserId
                const isSuperAdmin = profile.role === 'super_admin'

                return (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <config.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{profile.full_name || 'Unnamed'}</p>
                          {isCurrentUser && (
                            <span className="text-xs text-muted-foreground">(You)</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell className="text-right">
                      {isCurrentUser || isSuperAdmin ? (
                        <span className="text-xs text-muted-foreground">
                          {isCurrentUser ? 'Cannot edit own role' : 'Protected'}
                        </span>
                      ) : (
                        <Select
                          defaultValue={profile.role === 'volunteer' ? 'staff' : profile.role}
                          onValueChange={(val) => handleRoleChange(profile.id, val)}
                          disabled={isPending}
                        >
                          <SelectTrigger className="w-[130px] ml-auto">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
