import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

/**
 * Authenticated SPA staff access. Never use the public anon or service-role
 * client for an admin mutation. Roles are sourced from admin_profiles, not
 * from user-controlled metadata.
 */
export async function requirePadelStaff() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) redirect("/auth/login")

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || !["staff", "admin", "super_admin"].includes(profile.role)) {
    redirect("/dashboard")
  }

  return supabase
}

export async function checkPadelStaffAccess() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return null

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || !["staff", "admin", "super_admin"].includes(profile.role)) {
    return null
  }
  return supabase
}
