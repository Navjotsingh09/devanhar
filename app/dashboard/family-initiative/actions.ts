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

export async function updateFamilyInitiativeStatus(id: string, status: InitiativeStatus, internalNotes?: string) {
  const { error } = await getSupabaseAdmin().from("family_initiative_bookings").update({ status, internal_notes: internalNotes?.trim() || null }).eq("id", id)
  if (error) throw new Error("Failed to update booking status")
  revalidatePath("/dashboard/family-initiative")
}

export async function deleteFamilyInitiativeBooking(id: string) {
  const { error } = await getSupabaseAdmin().from("family_initiative_bookings").delete().eq("id", id)
  if (error) throw new Error("Failed to delete booking")
  revalidatePath("/dashboard/family-initiative")
}
