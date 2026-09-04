import Link from 'next/link'
import { UserCircle2, ArrowUp, ArrowDown, Minus, Sparkles } from 'lucide-react'
import type { RankMovement } from '@/lib/padel-ranking'

export type LeaderboardRow = {
  id: string
  first_name: string
  last_name: string
  photo_url: string | null
  total_points: number
  rank: number
  movement: RankMovement
}

function MovementBadge({ movement }: { movement: RankMovement }) {
  if (movement === 'up') return <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium"><ArrowUp className="h-3 w-3" />Up</span>
  if (movement === 'down') return <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium"><ArrowDown className="h-3 w-3" />Down</span>
  if (movement === 'new') return <span className="inline-flex items-center gap-1 text-[hsl(43,100%,29%)] text-xs font-medium"><Sparkles className="h-3 w-3" />New</span>
  return <span className="inline-flex items-center gap-1 text-muted-foreground text-xs font-medium"><Minus className="h-3 w-3" />Same</span>
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
          <Link key={row.id} href={`/initiatives/sikh-padel-association/leaderboard/${row.id}`} className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-secondary/40">
            <span className="w-8 shrink-0 text-sm font-semibold text-foreground">#{row.rank}</span>
            {row.photo_url ? (
              <img src={row.photo_url} alt={`${row.first_name} ${row.last_name}`} className="h-10 w-10 shrink-0 rounded-full object-cover" />
            ) : (
              <UserCircle2 className="h-10 w-10 shrink-0 text-muted-foreground" />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-foreground">{row.first_name} {row.last_name}</span>
              <MovementBadge movement={row.movement} />
            </span>
            <span className="shrink-0 text-right text-sm font-semibold text-foreground">{row.total_points}<span className="block text-xs font-normal text-muted-foreground">pts</span></span>
          </Link>
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
      <table className="w-full text-sm">
        <thead className="bg-secondary/40">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rank</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Player</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Movement</th>
            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Points</th>
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
                    <img src={row.photo_url} alt={`${row.first_name} ${row.last_name}`} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <UserCircle2 className="h-9 w-9 text-muted-foreground" />
                  )}
                  <span className="font-medium text-foreground">{row.first_name} {row.last_name}</span>
                </Link>
              </td>
              <td className="px-4 py-3"><MovementBadge movement={row.movement} /></td>
              <td className="px-4 py-3 text-right font-semibold text-foreground">{row.total_points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  )
}
