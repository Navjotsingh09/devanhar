import { NextRequest, NextResponse } from "next/server"

const ADMIN_EMAIL = process.env.CONTACT_NOTIFICATION_EMAIL || "admin@devanhaar.com"
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Devanhaar <noreply@devanhaar.com>"

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, subject, message, source_page, form_fields } = body as {
      name?: string
      email?: string
      subject?: string
      message?: string
      source_page?: string
      form_fields?: Record<string, string>
    }

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const safeName = escapeHtml(name.trim())
    const safeEmail = escapeHtml(email.trim())
    const safeSubject = escapeHtml((subject || "Website Enquiry").trim())
    const safeMessage = escapeHtml((message || "").trim())
    const safePage = escapeHtml((source_page || "Unknown").trim())

    // Build extra fields HTML for event forms
    let extraFieldsHtml = ""
    if (form_fields && typeof form_fields === "object") {
      const entries = Object.entries(form_fields).filter(([, v]) => v != null && String(v).trim() !== "")
      if (entries.length > 0) {
        extraFieldsHtml = entries
          .map(([k, v]) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;font-size:13px;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px">${escapeHtml(String(v))}</td></tr>`)
          .join("")
        extraFieldsHtml = `<h3 style="margin:24px 0 8px;font-size:14px;color:#333">Additional Fields</h3><table style="width:100%;border-collapse:collapse">${extraFieldsHtml}</table>`
      }
    }

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto">
        <div style="background:#f8f8f8;border-radius:12px;padding:24px;margin-bottom:16px">
          <h2 style="margin:0 0 4px;font-size:18px;color:#111">New Form Submission</h2>
          <p style="margin:0;font-size:13px;color:#888">From: <strong style="color:#d4a017">${safePage}</strong></p>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;font-size:13px;white-space:nowrap">Name</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px">${safeName}</td></tr>
          <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;font-size:13px;white-space:nowrap">Email</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
          <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;font-size:13px;white-space:nowrap">Subject</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px">${safeSubject}</td></tr>
        </table>
        ${safeMessage ? `<div style="margin:20px 0;padding:16px;background:#fafafa;border-radius:8px;border-left:3px solid #d4a017"><p style="margin:0;font-size:13px;color:#333;white-space:pre-wrap">${safeMessage}</p></div>` : ""}
        ${extraFieldsHtml}
        <p style="margin:24px 0 0;font-size:11px;color:#aaa">This submission was sent from the <strong>${safePage}</strong> page on devanhaar.vercel.app</p>
      </div>
    `

    const text = `New Form Submission\nSource: ${source_page || "Unknown"}\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject || "Website Enquiry"}\n${message ? `Message: ${message}\n` : ""}${form_fields ? Object.entries(form_fields).map(([k, v]) => `${k}: ${v}`).join("\n") : ""}`

    if (!process.env.RESEND_API_KEY) {
      console.log("[contact] RESEND_API_KEY not set, logging submission:", { name, email, source_page })
      return NextResponse.json({ success: true, fallback: true })
    }

    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      replyTo: email.trim(),
      subject: `[${source_page || "Website"}] ${subject || "New Enquiry"} — ${name}`,
      html,
      text,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[contact] Error sending notification:", err)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
