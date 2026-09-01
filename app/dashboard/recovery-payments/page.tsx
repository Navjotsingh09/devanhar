import { createClient } from "@supabase/supabase-js"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

type RecoveryPayment = {
  id: string
  source: "stripe" | "donation_manager"
  occurred_at: string | null
  amount: number | null
  currency: string | null
  payment_status: string | null
  description: string | null
  customer_name: string | null
  customer_email: string | null
  payment_reference: string | null
  linked_record_type: string | null
  linked_record_id: string | null
}

async function getPayments() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  )
  const { data, error } = await supabase
    .from("recovery_payment_ledger")
    .select("id, source, occurred_at, amount, currency, payment_status, description, customer_name, customer_email, payment_reference, linked_record_type, linked_record_id")
    .order("occurred_at", { ascending: false })

  if (error) {
    console.error("[dashboard/recovery-payments] fetch error:", error)
    return []
  }

  return (data ?? []) as RecoveryPayment[]
}

export default async function RecoveryPaymentsPage() {
  const payments = await getPayments()
  const stripeCount = payments.filter((payment) => payment.source === "stripe").length
  const donationManagerCount = payments.length - stripeCount

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Recovered Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Historical payment evidence recovered from Stripe and Donation Manager.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total recovered</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{payments.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Stripe</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stripeCount}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Donation Manager</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{donationManagerCount}</p></CardContent></Card>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[850px] text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Contact</th><th className="px-4 py-3 font-medium">Description</th><th className="px-4 py-3 font-medium">Amount</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Source</th><th className="px-4 py-3 font-medium">Original link</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap px-4 py-3">{payment.occurred_at ? new Date(payment.occurred_at).toLocaleDateString("en-GB") : "Unknown"}</td>
                <td className="px-4 py-3"><p>{payment.customer_name || "Unknown"}</p><p className="text-xs text-muted-foreground">{payment.customer_email || "No email"}</p></td>
                <td className="max-w-xs px-4 py-3"><p className="truncate">{payment.description || "No description"}</p><p className="text-xs text-muted-foreground">{payment.payment_reference || "No reference"}</p></td>
                <td className="whitespace-nowrap px-4 py-3">{payment.amount == null ? "Unknown" : new Intl.NumberFormat("en-GB", { style: "currency", currency: payment.currency || "GBP" }).format(payment.amount)}</td>
                <td className="px-4 py-3"><Badge variant="secondary">{payment.payment_status || "unknown"}</Badge></td>
                <td className="px-4 py-3"><Badge variant="outline">{payment.source === "donation_manager" ? "Donation Manager" : "Stripe"}</Badge></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{payment.linked_record_type && payment.linked_record_id ? `${payment.linked_record_type}: ${payment.linked_record_id}` : "No source record link"}</td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>No recovered payment records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
