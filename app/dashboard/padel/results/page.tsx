import { getPadelAdminBasePath } from '@/lib/padel-admin-path'
import Link from 'next/link'
import { requirePadelStaff } from '@/lib/padel-admin'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ClipboardList } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getTournaments() {
  const supabase = await requirePadelStaff()
  const { data, error } = await supabase
    .from('padel_tournaments')
    .select('id, name, event_date')
    .order('event_date', { ascending: false })
  if (error) throw new Error('Unable to load SPA tournaments: ' + error.message)
  return data || []
}

export default async function PadelResultsIndexPage() {
  const basePath = await getPadelAdminBasePath()
  const tournaments = await getTournaments()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Padel Results</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a tournament to assign finishing positions and points.
        </p>
      </div>

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tournament</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments.map((tournament) => (
              <TableRow key={tournament.id}>
                <TableCell className="font-medium">{tournament.name}</TableCell>
                <TableCell className="text-muted-foreground">{tournament.event_date}</TableCell>
                <TableCell className="text-right">
                  <Link href={`${basePath}/tournaments/${tournament.id}/results`}>
                    <Button variant="outline" size="sm">
                      <ClipboardList className="h-4 w-4 mr-1" />
                      Enter results
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {tournaments.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No tournaments yet. Create one under Tournaments first.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
