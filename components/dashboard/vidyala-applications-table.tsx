'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, Filter, Plus, Search, X } from 'lucide-react'
import { VidyalaRowActions } from '@/components/dashboard/vidyala-row-actions'
import { VidyalaApplicationDetailDialog } from '@/components/dashboard/vidyala-application-detail-dialog'

export interface VidyalaApplicationRow {
  id: number
  initiative_id: string | null
  first_name: string
  middle_name: string | null
  last_name: string
  date_of_birth: string
  email: string
  phone: string
  address: string
  id_document_url: string | null
  has_dbs_check: boolean | null
  dbs_certificate_url: string | null
  emergency_contact_1_name: string
  emergency_contact_1_relationship: string
  emergency_contact_1_phone: string
  emergency_contact_2_name: string | null
  emergency_contact_2_relationship: string | null
  emergency_contact_2_phone: string | null
  is_amritdhari: boolean | null
  sikhi_journey: string | null
  english_ability: string | null
  panjabi_ability: string | null
  can_commit: boolean | null
  funding_option: string | null
  accommodation_option: string | null
  requires_visa: boolean | null
  requires_visa_support: boolean | null
  motivation: string | null
  current_seva: string | null
  what_to_learn: string | null
  continue_parchaar: boolean | null
  how_heard: string | null
  page_url: string | null
  source: string | null
  medium: string | null
  status: string
  internal_notes: string | null
  created_at: string
  updated_at: string | null
}

type FilterKind = 'text' | 'boolean' | 'status' | 'date'

type FilterField = {
  key: keyof VidyalaApplicationRow
  label: string
  group: string
  kind: FilterKind
}

const FILTER_FIELDS: FilterField[] = [
  { key: 'first_name', label: 'First name', group: 'Personal details', kind: 'text' },
  { key: 'middle_name', label: 'Middle name', group: 'Personal details', kind: 'text' },
  { key: 'last_name', label: 'Last name', group: 'Personal details', kind: 'text' },
  { key: 'date_of_birth', label: 'Date of birth', group: 'Personal details', kind: 'date' },
  { key: 'email', label: 'Email', group: 'Personal details', kind: 'text' },
  { key: 'phone', label: 'Phone', group: 'Personal details', kind: 'text' },
  { key: 'address', label: 'Address', group: 'Personal details', kind: 'text' },

  { key: 'has_dbs_check', label: 'Has DBS check', group: 'Documents', kind: 'boolean' },

  { key: 'emergency_contact_1_name', label: 'Emergency contact 1 name', group: 'Emergency contacts', kind: 'text' },
  { key: 'emergency_contact_1_relationship', label: 'Emergency contact 1 relationship', group: 'Emergency contacts', kind: 'text' },
  { key: 'emergency_contact_1_phone', label: 'Emergency contact 1 phone', group: 'Emergency contacts', kind: 'text' },
  { key: 'emergency_contact_2_name', label: 'Emergency contact 2 name', group: 'Emergency contacts', kind: 'text' },
  { key: 'emergency_contact_2_relationship', label: 'Emergency contact 2 relationship', group: 'Emergency contacts', kind: 'text' },
  { key: 'emergency_contact_2_phone', label: 'Emergency contact 2 phone', group: 'Emergency contacts', kind: 'text' },

  { key: 'is_amritdhari', label: 'Amritdhari', group: 'Sikhi journey', kind: 'boolean' },
  { key: 'sikhi_journey', label: 'Sikhi journey', group: 'Sikhi journey', kind: 'text' },
  { key: 'english_ability', label: 'English ability', group: 'Sikhi journey', kind: 'text' },
  { key: 'panjabi_ability', label: 'Panjabi ability', group: 'Sikhi journey', kind: 'text' },

  { key: 'can_commit', label: 'Can commit', group: 'Commitment & practical', kind: 'boolean' },
  { key: 'funding_option', label: 'Funding option', group: 'Commitment & practical', kind: 'text' },
  { key: 'accommodation_option', label: 'Accommodation option', group: 'Commitment & practical', kind: 'text' },
  { key: 'requires_visa', label: 'Requires visa', group: 'Commitment & practical', kind: 'boolean' },
  { key: 'requires_visa_support', label: 'Requires visa support', group: 'Commitment & practical', kind: 'boolean' },

  { key: 'motivation', label: 'Motivation', group: 'Application questions', kind: 'text' },
  { key: 'current_seva', label: 'Current seva', group: 'Application questions', kind: 'text' },
  { key: 'what_to_learn', label: 'What they want to learn', group: 'Application questions', kind: 'text' },
  { key: 'continue_parchaar', label: 'Continue parchaar', group: 'Application questions', kind: 'boolean' },
  { key: 'how_heard', label: 'How heard about Vidyala', group: 'Application questions', kind: 'text' },

  { key: 'status', label: 'Application status', group: 'Admin', kind: 'status' },
  { key: 'created_at', label: 'Application date', group: 'Admin', kind: 'date' },
  { key: 'source', label: 'Source', group: 'Tracking', kind: 'text' },
  { key: 'medium', label: 'Medium', group: 'Tracking', kind: 'text' },
]

type ActiveFilter = {
  id: string
  field: keyof VidyalaApplicationRow
  value: string
}

function normalise(value: unknown) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value ? 'yes' : 'no'
  return String(value).trim().toLocaleLowerCase()
}

function filterMatches(application: VidyalaApplicationRow, filter: ActiveFilter) {
  const config = FILTER_FIELDS.find((item) => item.key === filter.field)
  if (!config || !filter.value) return true

  const raw = application[filter.field]

  if (config.kind === 'boolean') {
    if (filter.value === 'blank') return raw === null || raw === undefined
    return Boolean(raw) === (filter.value === 'yes')
  }

  if (config.kind === 'date') {
    const date = raw ? new Date(String(raw)).toISOString().slice(0, 10) : ''
    return date === filter.value
  }

  if (config.kind === 'status') {
    return normalise(raw) === normalise(filter.value)
  }

  return normalise(raw).includes(normalise(filter.value))
}
function displayFilterValue(application: VidyalaApplicationRow, filter: ActiveFilter) {
  const config = FILTER_FIELDS.find((item) => item.key === filter.field)
  const raw = application[filter.field]

  if (!config) return ''
  if (config.kind === 'boolean') {
    if (raw === null || raw === undefined) return 'Not answered'
    return raw ? 'Yes' : 'No'
  }
  if (config.kind === 'date') {
    if (!raw) return 'Not answered'
    return new Date(String(raw)).toLocaleDateString('en-GB')
  }
  if (raw === null || raw === undefined || String(raw).trim() === '') return 'Not answered'
  return String(raw)
}

function activeFilterLabel(filter: ActiveFilter) {
  return FILTER_FIELDS.find((item) => item.key === filter.field)?.label || String(filter.field)
}


function FilterValueInput({
  field,
  value,
  onChange,
}: {
  field: keyof VidyalaApplicationRow
  value: string
  onChange: (value: string) => void
}) {
  const config = FILTER_FIELDS.find((item) => item.key === field)

  if (config?.kind === 'boolean') {
    return (
      <Select value={value || '__any__'} onValueChange={(next) => onChange(next === '__any__' ? '' : next)}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Any answer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__any__">Any answer</SelectItem>
          <SelectItem value="yes">Yes</SelectItem>
          <SelectItem value="no">No</SelectItem>
          <SelectItem value="blank">Not answered</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  if (config?.kind === 'status') {
    return (
      <Select value={value || '__any__'} onValueChange={(next) => onChange(next === '__any__' ? '' : next)}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Any status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__any__">Any status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="declined">Declined</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  if (config?.kind === 'date') {
    return <Input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="w-full md:w-[180px]" />
  }

  return (
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Contains..."
      className="w-full md:w-[220px]"
    />
  )
}

export function VidyalaApplicationsTable({ applications }: { applications: VidyalaApplicationRow[] }) {
  const [viewing, setViewing] = useState<VidyalaApplicationRow | null>(null)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<ActiveFilter[]>([])

  const filteredApplications = useMemo(() => {
    const query = normalise(search)

    return applications.filter((application) => {
      if (query) {
        const searchable = [
          application.first_name,
          application.middle_name,
          application.last_name,
          application.email,
          application.phone,
          application.address,
          application.emergency_contact_1_name,
          application.emergency_contact_1_relationship,
          application.emergency_contact_1_phone,
          application.emergency_contact_2_name,
          application.emergency_contact_2_relationship,
          application.emergency_contact_2_phone,
          application.sikhi_journey,
          application.english_ability,
          application.panjabi_ability,
          application.funding_option,
          application.accommodation_option,
          application.motivation,
          application.current_seva,
          application.what_to_learn,
          application.how_heard,
          application.status,
          application.source,
          application.medium,
        ].map(normalise).join(' ')

        if (!searchable.includes(query)) return false
      }

      return filters.every((filter) => filterMatches(application, filter))
    })
  }, [applications, filters, search])

  const addFilter = () => {
    setFilters((current) => [
      ...current,
      { id: crypto.randomUUID(), field: 'motivation', value: '' },
    ])
    setShowFilters(true)
  }

  const updateFilter = (id: string, patch: Partial<ActiveFilter>) => {
    setFilters((current) => current.map((filter) => filter.id === id ? { ...filter, ...patch } : filter))
  }

  const removeFilter = (id: string) => {
    setFilters((current) => current.filter((filter) => filter.id !== id))
  }

  return (
    <>
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search names, contact details or any written answer..."
              className="pl-9"
            />
          </div>

          <Button type="button" variant="outline" onClick={() => setShowFilters((value) => !value)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {filters.length > 0 && <span className="ml-2 rounded-full bg-foreground px-2 py-0.5 text-xs text-background">{filters.length}</span>}
          </Button>

          <Button type="button" variant="outline" onClick={addFilter}>
            <Plus className="mr-2 h-4 w-4" /> Add filter
          </Button>

          {(filters.length > 0 || search) && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setFilters([])
                setSearch('')
              }}
            >
              Clear all
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Filter application answers</h3>
                <p className="text-xs text-muted-foreground">Add multiple filters to narrow applications. Filters are combined together.</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowFilters(false)}>Hide</Button>
            </div>

            {filters.length === 0 ? (
              <button
                type="button"
                onClick={addFilter}
                className="w-full rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground hover:bg-muted/40"
              >
                + Add your first question filter
              </button>
            ) : (
              filters.map((filter) => (
                <div key={filter.id} className="grid gap-2 rounded-lg bg-background p-2 md:grid-cols-[minmax(240px,1fr)_minmax(180px,1fr)_auto]">
                  <Select
                    value={String(filter.field)}
                    onValueChange={(field) => updateFilter(filter.id, { field: field as keyof VidyalaApplicationRow, value: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[360px]">
                      {Array.from(new Set(FILTER_FIELDS.map((item) => item.group))).map((group) => (
                        <div key={group}>
                          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{group}</div>
                          {FILTER_FIELDS.filter((item) => item.group === group).map((item) => (
                            <SelectItem key={String(item.key)} value={String(item.key)}>{item.label}</SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>

                  <FilterValueInput
                    field={filter.field}
                    value={filter.value}
                    onChange={(value) => updateFilter(filter.id, { value })}
                  />

                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFilter(filter.id)} title="Remove filter">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">Showing {filteredApplications.length} of {applications.length}</span>
                {filters.filter((filter) => filter.value).map((filter) => (
                  <span key={filter.id} className="rounded-full border border-border bg-background px-2.5 py-1 text-foreground">
                    {activeFilterLabel(filter)}: {filter.value === 'blank' ? 'Not answered' : filter.value}
                  </span>
                ))}
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={addFilter}><Plus className="mr-1 h-3.5 w-3.5" />Add another</Button>
            </div>
          </div>
        )}
      </div>

      {applications.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center border border-border rounded-xl">No Vidyala applications yet.</p>
      ) : filteredApplications.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center border border-border rounded-xl">No applications match the current search and filters.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="bg-muted/50 text-left">
                <th className="px-4 py-3 font-semibold text-foreground">Applicant</th>
                <th className="px-4 py-3 font-semibold text-foreground">Email</th>
                <th className="px-4 py-3 font-semibold text-foreground">Phone</th>
                <th className="px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="px-4 py-3 font-semibold text-foreground">Applied</th>
                {filters.some((filter) => filter.value) && (
                  <th className="px-4 py-3 font-semibold text-foreground">Matching answer</th>
                )}
                <th className="px-4 py-3 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredApplications.map((application) => {
                const name = application.first_name + ' ' + (application.middle_name ? application.middle_name + ' ' : '') + application.last_name
                return (
                  <tr key={application.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{name}</td>
                    <td className="px-4 py-3"><a href={'mailto:' + application.email} className="text-blue-600 hover:underline">{application.email}</a></td>
                    <td className="px-4 py-3 text-muted-foreground">{application.phone}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{application.status}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(application.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    {filters.some((filter) => filter.value) && (
                      <td className="px-4 py-3">
                        <div className="space-y-1.5">
                          {filters.filter((filter) => filter.value).map((filter) => (
                            <div key={filter.id} className="max-w-[360px]">
                              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{activeFilterLabel(filter)}</div>
                              <div className="truncate text-sm text-foreground" title={displayFilterValue(application, filter)}>
                                {displayFilterValue(application, filter)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="View full application"
                          onClick={() => setViewing(application)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View full application</span>
                        </Button>
                        <VidyalaRowActions
                          id={String(application.id)}
                          sourceTable="vidyala_applications"
                          status={application.status}
                          recipientLabel={name}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <VidyalaApplicationDetailDialog application={viewing} onOpenChange={(open) => { if (!open) setViewing(null) }} />
    </>
  )
}
