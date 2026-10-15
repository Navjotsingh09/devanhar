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
  detailsComplete: boolean
  dataUnavailable?: boolean
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
      const hasCompletePublicDetails = Boolean(
        data.event_time?.trim() && data.venue?.trim() && data.address?.trim()
      )

      return {
        id: data.id,
        name: data.name,
        date: formatDate(data.event_date),
        isoDate: data.event_date,
        time: data.event_time || "",
        venue: data.venue || "",
        address: data.address || "",
        mapUrl: data.map_url || "",
        feePerPerson: fee,
        teamFee: fee * 2,
        description: data.public_description || undefined,
        registrationOpen: data.registration_open !== false && hasCompletePublicDetails,
        detailsComplete: hasCompletePublicDetails,
      }
    }
  } catch {
    // Fail closed: never advertise an old tournament as open during an outage.
  }

  return {
    name: "Upcoming SPA tournament",
    date: "To be announced",
    time: "",
    venue: "",
    address: "",
    mapUrl: "",
    feePerPerson: PADEL_EVENT.feePerPerson,
    teamFee: PADEL_EVENT.teamFee,
    registrationOpen: false,
    detailsComplete: false,
    dataUnavailable: true,
  }
}
