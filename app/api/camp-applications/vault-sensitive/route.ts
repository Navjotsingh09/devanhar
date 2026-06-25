/**
 * GET  /api/camp-applications/vault-sensitive
 * Called daily by Vercel Cron (see vercel.json).
 *
 * For every camp_application where:
 *   - event_ends_at is set
 *   - event_ends_at + 30 days <= now()
 *   - sensitive_vaulted_at IS NULL  (not yet processed)
 *
 * The job:
 *   1. Reads the five sensitive fields from the active row
 *   2. AES-256-GCM encrypts them into a single blob
 *   3. Upserts the blob into camp_applications_vault
 *   4. Nulls the five fields in camp_applications
 *   5. Stamps sensitive_vaulted_at = now()
 *
 * Sensitive fields moved to vault:
 *   medical_requirements, dietary_requirements,
 *   emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { encryptSensitive } from "@/lib/vault-crypto"

export const dynamic = "force-dynamic"

const CRON_SECRET = process.env.CRON_SECRET

const SENSITIVE_FIELDS = [
  "medical_requirements",
  "dietary_requirements",
  "emergency_contact_name",
  "emergency_contact_phone",
  "emergency_contact_relationship",
] as const

type SensitiveKey = (typeof SENSITIVE_FIELDS)[number]

interface CampApplicationRow {
  id: string
  medical_requirements: string | null
  dietary_requirements: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_relationship: string | null
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase service credentials")
  return createClient(url, key)
}

// Called by Vercel Cron with Authorization: Bearer <CRON_SECRET>
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization")
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return runVault()
}

async function runVault() {
  const supabase = getSupabaseAdmin()

  // 30 days ago -- only process applications whose event ended at least 30 days back
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: apps, error: fetchError } = await supabase
    .from("camp_applications")
    .select(`id, ${SENSITIVE_FIELDS.join(", ")}`)
    .not("event_ends_at", "is", null)
    .lt("event_ends_at", cutoff)
    .is("sensitive_vaulted_at", null)

  if (fetchError) {
    console.error("[VaultSensitive] Fetch failed:", fetchError)
    return NextResponse.json({ error: "DB fetch failed" }, { status: 500 })
  }

  if (!apps || apps.length === 0) {
    return NextResponse.json({ vaulted: 0, message: "No eligible applications" })
  }

  const rows = apps as CampApplicationRow[]
  let vaulted = 0
  const failures: string[] = []

  for (const row of rows) {
    try {
      const sensitive: Record<SensitiveKey, string | null> = {
        medical_requirements: row.medical_requirements,
        dietary_requirements: row.dietary_requirements,
        emergency_contact_name: row.emergency_contact_name,
        emergency_contact_phone: row.emergency_contact_phone,
        emergency_contact_relationship: row.emergency_contact_relationship,
      }

      // Skip encryption if all fields are already null -- just stamp it
      const hasContent = Object.values(sensitive).some((v) => v !== null)
      if (!hasContent) {
        await supabase
          .from("camp_applications")
          .update({ sensitive_vaulted_at: new Date().toISOString() })
          .eq("id", row.id)
        vaulted++
        continue
      }

      const encrypted_blob = encryptSensitive(sensitive)

      // Upsert into vault
      const { error: vaultError } = await supabase
        .from("camp_applications_vault")
        .upsert(
          { application_id: row.id, encrypted_blob, vaulted_at: new Date().toISOString() },
          { onConflict: "application_id" },
        )

      if (vaultError) {
        failures.push(`${row.id}: vault upsert failed -- ${vaultError.message}`)
        continue
      }

      // Null the sensitive fields and stamp vaulted_at
      const { error: clearError } = await supabase
        .from("camp_applications")
        .update({
          medical_requirements: null,
          dietary_requirements: null,
          emergency_contact_name: null,
          emergency_contact_phone: null,
          emergency_contact_relationship: null,
          sensitive_vaulted_at: new Date().toISOString(),
        })
        .eq("id", row.id)

      if (clearError) {
        failures.push(`${row.id}: clear failed -- ${clearError.message}`)
        continue
      }

      vaulted++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      failures.push(`${row.id}: ${msg}`)
    }
  }

  if (failures.length > 0) {
    console.error("[VaultSensitive] Partial failures:", failures)
  }

  return NextResponse.json({
    vaulted,
    failed: failures.length,
    ...(failures.length > 0 && { failures }),
  })
}
