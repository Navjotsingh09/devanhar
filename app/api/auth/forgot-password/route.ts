import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const SITE_URL = "https://devanhaar.com"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const rawEmail = typeof body?.email === "string" ? body.email : ""
    const email = rawEmail.trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ error: "Please enter your email address." }, { status: 400 })
    }
    if (!email.endsWith("@devanhaar.com")) {
      return NextResponse.json(
        { error: "Access is restricted to Devanhaar staff. Please use your @devanhaar.com email address." },
        { status: 403 },
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Server is not configured for password resets." }, { status: 500 })
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: `${SITE_URL}/auth/update-password` },
    })

    if (error) {
      const msg = (error.message || "").toLowerCase()
      if (msg.includes("not found") || msg.includes("no user") || msg.includes("user_not_found")) {
        return NextResponse.json({ ok: true })
      }
      console.error("forgot-password generateLink error:", error.message)
      return NextResponse.json({ error: "Could not generate a reset link. Please try again." }, { status: 500 })
    }

    const actionLink = data?.properties?.action_link
    if (!actionLink) {
      return NextResponse.json({ error: "Could not generate a reset link." }, { status: 500 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Email service is not configured." }, { status: 500 })
    }

    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: "Devanhaar <noreply@devanhaar.com>",
      to: email,
      subject: "Reset your Devanhaar dashboard password",
      text: [
        "Hello,",
        "",
        "We received a request to reset the password for your Devanhaar dashboard account.",
        "",
        "Use the link below to choose a new password. This link will expire in 1 hour.",
        "",
        actionLink,
        "",
        "If you did not request this, you can safely ignore this email - your password will not change.",
        "",
        "Devanhaar",
      ].join("\n"),
      html:
        '<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1f2937;line-height:1.6">' +
        "<p>Hello,</p>" +
        "<p>We received a request to reset the password for your <strong>Devanhaar dashboard</strong> account.</p>" +
        "<p>Click the button below to choose a new password. This link will expire in <strong>1 hour</strong>.</p>" +
        `<p style="text-align:center;margin:32px 0"><a href="${actionLink}" style="background:#f59e0b;color:#000;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:10px;display:inline-block">Reset password</a></p>` +
        '<p style="font-size:13px;color:#6b7280">If the button does not work, copy and paste this link into your browser:</p>' +
        `<p style="font-size:13px;word-break:break-all"><a href="${actionLink}">${actionLink}</a></p>` +
        '<p style="font-size:13px;color:#6b7280">If you did not request this, you can safely ignore this email.</p>' +
        '<p style="margin-top:24px">Devanhaar</p>' +
        "</div>",
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("forgot-password error:", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
