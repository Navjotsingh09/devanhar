import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

const MAX_FILE_SIZE = 4 * 1024 * 1024 // 4 MB


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const section = searchParams.get("section")
  if (!section) {
    return NextResponse.json({ error: "section is required" }, { status: 400 })
  }

  const category = searchParams.get("category")
  const supabase = await createClient()
  let query = supabase
    .from("site_images")
    .select("*")
    .eq("section", section)
    .order("created_at", { ascending: false })

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ images: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const section = formData.get("section") as string | null
  const category = formData.get("category") as string | null
  const label = formData.get("label") as string | null
  const altText = formData.get("alt_text") as string | null

  if (!file || !section) {
    return NextResponse.json({ error: "file and section are required" }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 4 MB." },
      { status: 413 }
    )
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
  const storagePath = section + "/" + (category ? category + "/" : "") + Date.now() + "-" + sanitizedName

  const bytes = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from("site-images")
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: "Storage upload failed: " + uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from("site-images")
    .getPublicUrl(storagePath)

  const { data: record, error: dbError } = await supabase
    .from("site_images")
    .insert({
      section,
      category,
      label,
      alt_text: altText,
      url: publicUrl,
      storage_path: storagePath,
      uploaded_by: user.id,
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: "Database insert failed: " + dbError.message }, { status: 500 })
  }
  return NextResponse.json({ image: record })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  const { data: image } = await supabase
    .from("site_images")
    .select("storage_path")
    .eq("id", id)
    .single()

  if (image) {
    await supabase.storage
      .from("site-images")
      .remove([image.storage_path])
  }

  const { error } = await supabase
    .from("site_images")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
