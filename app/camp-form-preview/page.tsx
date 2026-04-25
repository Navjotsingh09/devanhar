"use client"

import { CampApplicationForm } from "@/components/camp-application-form"

export default function CampFormPreviewPage() {
  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-3xl mx-auto px-4 mb-4">
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-900">
          <strong>Preview only</strong> &mdash; isolated view of the camp application form.
          Navigate to <strong>Step 5 (Travel &amp; Payment)</strong> to see the new
          Sevadaar checkbox and discount code field. Try code <code className="bg-yellow-100 px-1 rounded">SEVA50</code>.
        </div>
      </div>
      <CampApplicationForm onClose={() => { window.location.reload() }} showDiscountPreview />
    </div>
  )
}
