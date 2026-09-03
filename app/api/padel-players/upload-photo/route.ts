import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucketName = process.env.SUPABASE_PADEL_PLAYER_PHOTO_BUCKET || "padel-player-photos"
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"]
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

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

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin"
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json(
        { error: "Unsupported file type. Allowed formats: JPG, PNG, WEBP." },
        { status: 400 }
      )
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Maximum allowed size is 5MB." },
        { status: 400 }
      )
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const filePath = "players/" + Date.now() + "-" + safeName

    const supabase = getSupabaseAdmin()
    const arrayBuffer = await file.arrayBuffer()

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, new Uint8Array(arrayBuffer), {
        contentType: file.type || "image/jpeg",
        upsert: false,
      })

    if (error) {
      console.error("[Padel Player Photo Upload] Supabase storage error:", error)
      return NextResponse.json({ error: "Failed to upload: " + error.message }, { status: 500 })
    }

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath)

    return NextResponse.json(
      { success: true, file_path: filePath, public_url: publicUrlData.publicUrl },
      { status: 201 }
    )
  } catch (error) {
    console.error("[Padel Player Photo Upload] Error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
