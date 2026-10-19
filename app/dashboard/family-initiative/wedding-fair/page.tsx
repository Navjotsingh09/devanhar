import { requireProgramme } from "@/lib/staff-programme-server"
import { FamilyInterestTable, type FamilyInterestSubmission } from "@/components/family-initiative/family-interest-table"

export const dynamic = "force-dynamic"
export const metadata = { title: "Wedding Fair | Sikh Family Initiative | Dashboard" }

async function getData(): Promise<FamilyInterestSubmission[]> {
  const supabase = await requireProgramme('family')
  const { data } = await supabase.from("form_submissions").select("id, full_name, email, phone, form_data, created_at").order("created_at", { ascending: false }).limit(5000)
  return (data || []).filter((row: any) => String(row.form_data?.project || "").toLowerCase() === "wedding fair") as FamilyInterestSubmission[]
}

export default async function WeddingFairDashboardPage() {
  const interests = await getData()
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Sikh Family Initiative</p>
        <h1 className="mt-2 text-2xl font-bold">Wedding Fair</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage Wedding Fair interest registrations and future booking records from one place.</p>
      </div>
      <section className="space-y-3">
        <div><h2 className="text-lg font-semibold">Interest registrations ({interests.length})</h2></div>
        <FamilyInterestTable submissions={interests} emptyLabel="No Wedding Fair interest registrations yet." />
      </section>
    </div>
  )
}
