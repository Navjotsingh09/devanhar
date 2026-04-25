"use client"

import { CampApplicationForm } from "@/components/camp-application-form"

export default function CampFormPreviewPage() {
  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-3xl mx-auto px-4 mb-4">
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-900">
          <strong>Preview only</strong> &mdash; isolated view of the camp application form.
          Step 5 (Travel &amp; Payment) includes the Sevadaar Yes/No question. Promo codes (e.g. <code className="bg-yellow-100 px-1 rounded">TRAVEL50</code>) are entered on the Stripe Checkout page after submitting.
        </div>
      </div>
      <CampApplicationForm onClose={() => { window.location.reload() }} />
    </div>
  )
}
