import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucketName = process.env.SUPABASE_CAMP_UPLOAD_BUCKET || "camp-applications"
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "heic", "heif", "pdf"]
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase service role credentials")
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const initiativeSlug = String(formData.get("initiative_slug") || "singhs-camp")

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin"
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json(
        { error: "Unsupported file type. Allowed formats: JPG, JPEG, PNG, WEBP, HEIC, HEIF, PDF." },
        { status: 400 }
      )
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Maximum allowed size is 10MB." },
        { status: 400 }
      )
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const filePath = initiativeSlug + "/" + Date.now() + "-" + safeName

    const supabase = getSupabaseAdmin()
    const arrayBuffer = await file.arrayBuffer()

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, new Uint8Array(arrayBuffer), {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      })

    if (error) {
      console.error("[Camp ID Upload] Supabase storage error:", error)
      return NextResponse.json({ error: "Failed to upload: " + error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, file_path: filePath }, { status: 201 })
  } catch (error) {
    console.error("[Camp ID Upload] Error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
