import Link from 'next/link'
import { UserCircle2 } from 'lucide-react'
import type { RankMovement } from '@/lib/padel-ranking'

export type LeaderboardRow = {
  id: string
  display_name: string
  photo_url: string | null
  total_points: number
  ranking_points: number
  titles: number
  runner_up_finishes: number
  match_wins: number
  appearances: number
  pending_finishes: number
  win_percentage: number
  matches_played: number
  group_points_won_pct: number
  rank: number
  movement: RankMovement
}

function pct(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

export function PadelLeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        The leaderboard will appear here once tournament results have been recorded.
      </p>
    )
  }

  return (
    <>
      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border md:hidden">
        {rows.map((row) => (
          <Link key={row.id} href={`/initiatives/sikh-padel-association/leaderboard/${row.id}`} className="block px-4 py-4 transition-colors hover:bg-secondary/40">
            <div className="flex items-center gap-3">
              <span className="w-8 shrink-0 text-sm font-semibold text-foreground">#{row.rank}</span>
              {row.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.photo_url} alt={row.display_name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
              ) : (
                <UserCircle2 className="h-10 w-10 shrink-0 text-muted-foreground" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-foreground">{row.display_name}</span>
                <span className="block text-xs text-muted-foreground">{row.match_wins} wins · {pct(row.win_percentage)} win rate</span>
              </span>
              <span className="shrink-0 text-right text-sm font-semibold text-foreground">{row.ranking_points}<span className="block text-xs font-normal text-muted-foreground">pts</span></span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-md bg-secondary/40 px-2 py-2"><div className="font-semibold">{row.titles}</div><div className="text-muted-foreground">Titles</div></div>
              <div className="rounded-md bg-secondary/40 px-2 py-2"><div className="font-semibold">{row.runner_up_finishes}</div><div className="text-muted-foreground">R/U</div></div>
              <div className="rounded-md bg-secondary/40 px-2 py-2"><div className="font-semibold">{row.match_wins}</div><div className="text-muted-foreground">Wins</div></div>
              <div className="rounded-md bg-secondary/40 px-2 py-2"><div className="font-semibold">{pct(row.group_points_won_pct)}</div><div className="text-muted-foreground">Group pts</div></div>
            </div>
          </Link>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="bg-secondary/40">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rank</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Player</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Points</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Titles</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Runner-up</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Wins</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Win %</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Group pts won %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-4 py-3 font-semibold text-foreground">#{row.rank}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/initiatives/sikh-padel-association/leaderboard/${row.id}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    {row.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.photo_url} alt={row.display_name} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <UserCircle2 className="h-9 w-9 text-muted-foreground" />
                    )}
                    <span className="font-medium text-foreground">{row.display_name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-foreground">{row.ranking_points}</td>
                <td className="px-4 py-3 text-right">{row.titles}</td>
                <td className="px-4 py-3 text-right">{row.runner_up_finishes}</td>
                <td className="px-4 py-3 text-right">{row.match_wins}</td>
                <td className="px-4 py-3 text-right">{pct(row.win_percentage)}</td>
                <td className="px-4 py-3 text-right">{pct(row.group_points_won_pct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
