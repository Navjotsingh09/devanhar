"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

type InitiativeStatus = "pending" | "confirmed" | "waitlisted" | "declined" | "archived"

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  if (!url || !key) throw new Error("Supabase service role configuration is missing")
  return createClient(url, key)
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] || character)
}

export async function updateFamilyInitiativeStatus(id: string, status: InitiativeStatus, internalNotes?: string) {
  const supabase = getSupabaseAdmin()
  const { data: booking, error: bookingError } = await supabase.from("family_initiative_bookings").select("status, contact_name, email, estimated_total_pence, travel_option").eq("id", id).single()
  if (bookingError || !booking) throw new Error("Booking not found")
  const { error } = await supabase.from("family_initiative_bookings").update({ status, internal_notes: internalNotes?.trim() || null }).eq("id", id)
  if (error) throw new Error("Failed to update booking status")
  if (status === "confirmed" && booking.status !== "confirmed" && booking.email && process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend")
      const resend = new Resend(process.env.RESEND_API_KEY)
      const name = booking.contact_name || "there"
      const total = booking.estimated_total_pence == null ? "" : `£${(booking.estimated_total_pence / 100).toFixed(2)}`
      const travel = booking.travel_option === "transport" ? "Door entry with transport" : "Door entry"
      const text = `Dear ${name},

Your Family Fun Day - Summer Extravaganza booking for 31 August 2026 has been confirmed by the Sikh Family Initiative team.

${total ? `Booking total: ${total}
` : ""}Entry option: ${travel}

We look forward to welcoming you. The team will contact you if any further details are needed.

Warm regards,
The Sikh Family Initiative Team`
      const html = `<p>Dear ${escapeHtml(name)},</p><p>Your <strong>Family Fun Day - Summer Extravaganza</strong> booking for 31 August 2026 has been confirmed by the Sikh Family Initiative team.</p>${total ? `<p><strong>Booking total:</strong> ${total}</p>` : ""}<p><strong>Entry option:</strong> ${escapeHtml(travel)}</p><p>We look forward to welcoming you. The team will contact you if any further details are needed.</p><p>Warm regards,<br>The Sikh Family Initiative Team</p>`
      await resend.emails.send({ from: "Sikh Family Initiative <noreply@devanhaar.com>", to: booking.email, subject: "Your Family Fun Day booking is confirmed", text, html })
    } catch (emailError) {
      console.warn("[family-initiative] Confirmation email failed:", emailError)
    }
  }
  revalidatePath("/dashboard/family-initiative")
}

export async function deleteFamilyInitiativeBooking(id: string) {
  const { error } = await getSupabaseAdmin().from("family_initiative_bookings").delete().eq("id", id)
  if (error) throw new Error("Failed to delete booking")
  revalidatePath("/dashboard/family-initiative")
}
