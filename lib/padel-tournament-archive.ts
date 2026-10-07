import { createClient } from "@/lib/supabase/server"

export type ArchivedPadelTournament = {
  id: string
  name: string
  event_date: string
  category: string | null
  status: string
  venue: string | null
  address: string | null
  event_time: string | null
  public_description: string | null
}

export type ArchivedPadelResult = {
  id: string
  player_id: string
  partner_player_id: string | null
  finishing_position: string
  points_awarded: number
  notes: string | null
  playerName: string
  partnerName: string | null
}

export async function getArchivedPadelTournaments(): Promise<ArchivedPadelTournament[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from("padel_tournaments")
    .select("id, name, event_date, category, status, venue, address, event_time, public_description")
    .lt("event_date", today)
    .order("event_date", { ascending: false })

  if (error || !data) return []
  return data as ArchivedPadelTournament[]
}

export async function getArchivedPadelTournament(id: string): Promise<ArchivedPadelTournament | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("padel_tournaments")
    .select("id, name, event_date, category, status, venue, address, event_time, public_description")
    .eq("id", id)
    .maybeSingle()

  if (error || !data) return null
  return data as ArchivedPadelTournament
}

export async function getArchivedPadelResults(tournamentId: string): Promise<ArchivedPadelResult[]> {
  const supabase = await createClient()
  const { data: results, error } = await supabase
    .from("padel_tournament_results")
    .select("id, player_id, partner_player_id, finishing_position, points_awarded, notes")
    .eq("tournament_id", tournamentId)
    .order("points_awarded", { ascending: false })

  if (error || !results?.length) return []

  const playerIds = Array.from(new Set(results.flatMap((r) => [r.player_id, r.partner_player_id].filter(Boolean)))) as string[]
  const { data: players } = await supabase
    .from("padel_players")
    .select("id, first_name, last_name")
    .in("id", playerIds)

  const names = new Map((players || []).map((p) => [p.id, `${p.first_name} ${p.last_name}`.trim()]))

  return results.map((r) => ({
    ...r,
    playerName: names.get(r.player_id) || "Player",
    partnerName: r.partner_player_id ? names.get(r.partner_player_id) || "Partner" : null,
  })) as ArchivedPadelResult[]
}

export function formatPadelArchiveDate(value: string) {
  return new Date(value + "T12:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatFinishingPosition(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}
