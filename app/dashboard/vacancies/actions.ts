"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { sendApplicantMessage } from "@/lib/careers-email"

async function authed() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return { supabase, user }
}

function fieldsFromForm(formData: FormData) {
  const get = (k: string) => formData.get(k)
  const str = (k: string) => {
    const v = get(k)
    return typeof v === "string" && v.length > 0 ? v : null
  }
  return {
    title: String(get("title") || ""),
    description: str("description"),
    vacancy_type: String(get("vacancy_type") || "volunteer"),
    employment_basis: str("employment_basis"),
    location: str("location"),
    is_remote: get("is_remote") === "true" || get("is_remote") === "on",
    salary_range: str("salary_range"),
    requirements: str("requirements"),
    responsibilities: str("responsibilities"),
    how_to_apply: str("how_to_apply"),
    initiative_id: str("initiative_id"),
    closes_at: str("closes_at"),
  }
}

export async function createVacancy(formData: FormData) {
  const { supabase, user } = await authed()
  const fields = fieldsFromForm(formData)
  if (!fields.title) throw new Error("Title is required")

  const { error } = await supabase.from("vacancies").insert({
    ...fields,
    created_by: user.id,
  })
  if (error) throw new Error(error.message)

  await supabase.from("activity_log").insert({
    admin_id: user.id,
    action: `Created vacancy: ${fields.title}`,
    entity_type: "vacancy",
  })
  revalidatePath("/dashboard/vacancies")
  revalidatePath("/careers")
}

export async function updateVacancy(id: string, formData: FormData) {
  const { supabase, user } = await authed()
  const fields = fieldsFromForm(formData)
  if (!fields.title) throw new Error("Title is required")

  const { error } = await supabase
    .from("vacancies")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)

  await supabase.from("activity_log").insert({
    admin_id: user.id,
    action: `Updated vacancy: ${fields.title}`,
    entity_type: "vacancy",
    entity_id: id,
  })
  revalidatePath("/dashboard/vacancies")
  revalidatePath("/careers")
  revalidatePath(`/careers/${id}`)
}

export async function deleteVacancy(id: string) {
  const { supabase, user } = await authed()
  const { data: v } = await supabase.from("vacancies").select("title").eq("id", id).maybeSingle()
  const { error } = await supabase.from("vacancies").delete().eq("id", id)
  if (error) throw new Error(error.message)
  await supabase.from("activity_log").insert({
    admin_id: user.id,
    action: `Deleted vacancy: ${v?.title ?? id}`,
    entity_type: "vacancy",
    entity_id: id,
  })
  revalidatePath("/dashboard/vacancies")
  revalidatePath("/careers")
}

export async function toggleVacancy(id: string, isActive: boolean) {
  const { supabase } = await authed()
  const { error } = await supabase
    .from("vacancies")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/vacancies")
  revalidatePath("/careers")
}

export async function updateApplicationStatus(id: string, status: string) {
  const { supabase, user } = await authed()
  const { error } = await supabase
    .from("vacancy_applications")
    .update({ status, updated_at: new Date().toISOString(), reviewed_by: user.id })
    .eq("id", id)
  if (error) throw new Error(error.message)
  await supabase.from("activity_log").insert({
    admin_id: user.id,
    action: `Set application to ${status}`,
    entity_type: "vacancy_application",
    entity_id: id,
  })
  revalidatePath("/dashboard/vacancies")
}

export async function deleteApplication(id: string) {
  const { supabase, user } = await authed()
  const { error } = await supabase.from("vacancy_applications").delete().eq("id", id)
  if (error) throw new Error(error.message)
  await supabase.from("activity_log").insert({
    admin_id: user.id,
    action: `Deleted application`,
    entity_type: "vacancy_application",
    entity_id: id,
  })
  revalidatePath("/dashboard/vacancies")
}

export async function saveInternalNotes(id: string, notes: string) {
  const { supabase } = await authed()
  const { error } = await supabase
    .from("vacancy_applications")
    .update({ internal_notes: notes, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/vacancies")
}

export async function sendMessageToApplicant(opts: {
  applicationId: string
  subject: string
  body: string
  isInternalNote?: boolean
}) {
  const { supabase, user } = await authed()
  const { applicationId, subject, body, isInternalNote } = opts
  if (!body.trim()) throw new Error("Message body required")

  const { data: app } = await supabase
    .from("vacancy_applications")
    .select("id, full_name, email, vacancies(title)")
    .eq("id", applicationId)
    .maybeSingle()
  if (!app) throw new Error("Application not found")

  let emailSent = false
  if (!isInternalNote) {
    if (!subject.trim()) throw new Error("Subject required")
    const result = await sendApplicantMessage({
      to: app.email,
      applicantName: app.full_name,
      subject,
      body,
      vacancyTitle: (app.vacancies as unknown as { title?: string })?.title || "Devanhaar role",
    })
    emailSent = result.ok
    if (!result.ok) {
      throw new Error(result.error || "Failed to send email")
    }
  }

  const { error } = await supabase.from("vacancy_messages").insert({
    application_id: applicationId,
    admin_id: user.id,
    direction: "outbound",
    subject: isInternalNote ? null : subject,
    body,
    to_email: isInternalNote ? null : app.email,
    email_sent: emailSent,
    is_internal_note: !!isInternalNote,
  })
  if (error) throw new Error(error.message)

  await supabase.from("activity_log").insert({
    admin_id: user.id,
    action: isInternalNote ? "Added internal note" : `Emailed applicant: ${subject}`,
    entity_type: "vacancy_application",
    entity_id: applicationId,
  })

  revalidatePath("/dashboard/vacancies")
}
