import { PADEL_EVENT } from "@/components/padel/padel-event"
import { createClient } from "@/lib/supabase/server"

export type PublicPadelEvent = {
  id?: string
  name: string
  date: string
  isoDate?: string
  time: string
  venue: string
  address: string
  mapUrl: string
  feePerPerson: number
  teamFee: number
  description?: string
  registrationOpen: boolean
}

function formatDate(value: string) {
  return new Date(value + "T12:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export async function getPublicPadelEvent(): Promise<PublicPadelEvent> {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().slice(0, 10)
    const { data, error } = await supabase
      .from("padel_tournaments")
      .select("id, name, event_date, event_time, venue, address, map_url, fee_per_person, public_description, registration_open")
      .eq("is_public", true)
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(1)
      .maybeSingle()

    if (!error && data) {
      const fee = Number(data.fee_per_person ?? 50)
      return {
        id: data.id,
        name: data.name,
        date: formatDate(data.event_date),
        isoDate: data.event_date,
        time: data.event_time || "Time TBC",
        venue: data.venue || "Venue TBC",
        address: data.address || "",
        mapUrl: data.map_url || "",
        feePerPerson: fee,
        teamFee: fee * 2,
        description: data.public_description || undefined,
        registrationOpen: data.registration_open !== false,
      }
    }
  } catch {
    // Fall through to the established event so a missing migration never breaks the page.
  }

  return {
    name: PADEL_EVENT.name,
    date: PADEL_EVENT.date,
    time: PADEL_EVENT.time,
    venue: PADEL_EVENT.venue,
    address: PADEL_EVENT.address,
    mapUrl: PADEL_EVENT.mapUrl,
    feePerPerson: PADEL_EVENT.feePerPerson,
    teamFee: PADEL_EVENT.teamFee,
    registrationOpen: true,
  }
}
