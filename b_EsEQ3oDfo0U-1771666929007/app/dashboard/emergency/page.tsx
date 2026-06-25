import { createClient } from '@/lib/supabase/server'
import { EmergencyTable } from '@/components/dashboard/emergency-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Phone, AlertTriangle, Clock, CheckCircle } from 'lucide-react'

async function getEmergencyData() {
  const supabase = await createClient()

  const { data: allRequests } = await supabase
    .from('emergency_requests')
    .select('*')
    .order('created_at', { ascending: false })

  const requests = allRequests ?? []
  const activeCount = requests.filter(r => ['new', 'acknowledged', 'in_progress'].includes(r.status)).length
  const criticalCount = requests.filter(r => r.urgency === 'critical' && !['resolved', 'closed'].includes(r.status)).length
  const resolvedCount = requests.filter(r => ['resolved', 'closed'].includes(r.status)).length

  return { requests, activeCount, criticalCount, resolvedCount }
}

export default async function EmergencyPage() {
  const { requests, activeCount, criticalCount, resolvedCount } = await getEmergencyData()

  const activeRequests = requests.filter(r => ['new', 'acknowledged', 'in_progress'].includes(r.status))
  const resolvedRequests = requests.filter(r => ['resolved', 'closed'].includes(r.status))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">24x7 Sikh Emergency Line</h1>
        <p className="text-muted-foreground">Manage and track emergency helpline requests</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-destructive/30">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{criticalCount}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{resolvedCount}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active" className="gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            Active ({activeCount})
          </TabsTrigger>
          <TabsTrigger value="resolved" className="gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            Resolved ({resolvedCount})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({requests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <EmergencyTable requests={activeRequests} />
        </TabsContent>
        <TabsContent value="resolved" className="mt-4">
          <EmergencyTable requests={resolvedRequests} />
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          <EmergencyTable requests={requests} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
