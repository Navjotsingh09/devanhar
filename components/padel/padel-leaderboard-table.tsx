'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Minus, Search, Share2, Sparkles } from 'lucide-react'
import type { RankMovement } from '@/lib/padel-ranking'

export type LeaderboardRow = {
  id: string
  first_name: string
  last_name: string
  photo_url: string | null
  country_code: string
  total_points: number
  rank: number
  titles: number
  runner_up_finishes: number
  match_wins: number
  matches_played: number
  win_percentage: number
  group_points_won_percentage: number
  movement: RankMovement
}

const PAGE_SIZE = 12

function countryFlag(countryCode: string) {
  const normalized = countryCode.toUpperCase()
  if (!/^[A-Z]{2}$/.test(normalized)) return '🏳️'
  return String.fromCodePoint(...[...normalized].map((char) => 127397 + char.charCodeAt(0)))
}

function playerName(row: LeaderboardRow) {
  return [row.first_name, row.last_name].filter(Boolean).join(' ').trim()
}

function MovementBadge({ movement }: { movement: RankMovement }) {
  if (movement === 'up') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#e9f4ee] px-2.5 py-1 text-[10px] font-semibold text-[#2f7d5a]">
        <ArrowUp className="h-3 w-3" /> Up
      </span>
    )
  }
  if (movement === 'down') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#fbecec] px-2.5 py-1 text-[10px] font-semibold text-[#b84a4a]">
        <ArrowDown className="h-3 w-3" /> Down
      </span>
    )
  }
  if (movement === 'new') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#fff4df] px-2.5 py-1 text-[10px] font-semibold text-[#a66d08]">
        <Sparkles className="h-3 w-3" /> New
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#f4f4f6] px-2.5 py-1 text-[10px] font-semibold text-[#6a6d77]">
      <Minus className="h-3 w-3" /> Same
    </span>
  )
}

function TopPlayerCard({ row, leader }: { row: LeaderboardRow; leader?: boolean }) {
  const classes =
    'rounded-[14px] border p-4 shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-transform hover:-translate-y-0.5 ' +
    (leader
      ? 'border-[#0f2940] bg-[#0f2940] text-white'
      : 'border-[#dedfe3] bg-white text-[#0f2940]')

  return (
    <Link
      href={'/initiatives/sikh-padel-association/leaderboard/' + row.id}
      className={classes}
    >
      <div className="flex items-center justify-between">
        <span
          className={
            'text-[26px] font-bold leading-none ' +
            (leader ? 'text-[#e6a429]' : 'text-[#0f2940]')
          }
        >
          #{row.rank}
        </span>
        <MovementBadge movement={row.movement} />
      </div>
      <p className="mt-4 text-[13px] font-semibold">
        {countryFlag(row.country_code)} {playerName(row)}
      </p>
      <p className="mt-2 text-xl font-bold">{row.total_points.toLocaleString()} pts</p>
      <p className={'mt-1 text-[10px] ' + (leader ? 'text-[#b9c8d1]' : 'text-[#6a6d77]')}>
        {row.titles} {row.titles === 1 ? 'title' : 'titles'} · {Math.round(row.win_percentage)}% win
      </p>
    </Link>
  )
}

export function PadelLeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('ALL')
  const [page, setPage] = useState(1)

  const countries = useMemo(
    () => Array.from(new Set(rows.map((row) => row.country_code))).sort(),
    [rows]
  )

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return rows.filter((row) => {
      const matchesName =
        normalizedQuery.length === 0 ||
        playerName(row).toLocaleLowerCase().includes(normalizedQuery)
      const matchesCountry = country === 'ALL' || row.country_code === country
      return matchesName && matchesCountry
    })
  }, [rows, query, country])

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageRows = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const topPlayers = rows.slice(0, 3)

  function updateQuery(value: string) {
    setQuery(value)
    setPage(1)
  }

  function updateCountry(value: string) {
    setCountry(value)
    setPage(1)
  }

  async function shareRankings() {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: 'SPA player rankings', url })
      return
    }
    await navigator.clipboard.writeText(url)
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-[14px] border border-[#dedfe3] bg-white px-6 py-16 text-center text-[#6a6d77]">
        The leaderboard will appear here once tournament results have been recorded.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#0f2940] md:text-[22px]">Top players</h2>
          <p className="text-[10px] font-medium text-[#6a6d77]">Official SPA ranking</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {topPlayers.map((row, index) => (
            <TopPlayerCard key={row.id} row={row} leader={index === 0} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="flex h-11 w-full items-center gap-2 rounded-full border border-[#dedfe3] bg-white px-4 md:max-w-[360px]">
          <Search className="h-4 w-4 text-[#6a6d77]" />
          <input
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Search by player name"
            className="w-full bg-transparent text-sm text-[#15171c] outline-none placeholder:text-[#6a6d77]"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <select
            value={country}
            onChange={(event) => updateCountry(event.target.value)}
            className="h-11 rounded-full border border-[#dedfe3] bg-white px-4 text-xs font-semibold text-[#0f2940] outline-none"
            aria-label="Filter leaderboard by nationality"
          >
            <option value="ALL">All nationalities</option>
            {countries.map((code) => (
              <option key={code} value={code}>
                {countryFlag(code)} {code === 'GB' ? 'United Kingdom' : code === 'NO' ? 'Norway' : code}
              </option>
            ))}
          </select>
          <Link
            href="#ranking-method"
            className="inline-flex h-11 items-center rounded-full border border-[#dedfe3] bg-white px-4 text-xs font-semibold text-[#0f2940]"
          >
            Ranking rules
          </Link>
          <button
            type="button"
            onClick={shareRankings}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0f2940] px-4 text-xs font-semibold text-white"
          >
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
        </div>
      </section>

      <div className="space-y-2 md:hidden">
        {pageRows.map((row) => (
          <Link
            key={row.id}
            href={'/initiatives/sikh-padel-association/leaderboard/' + row.id}
            className="flex items-center gap-3 rounded-[14px] border border-[#dedfe3] bg-white p-3"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#f4f4f6] text-xs font-bold text-[#0f2940]">
              #{row.rank}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-[#0f2940]">
                {countryFlag(row.country_code)} {playerName(row)}
              </span>
              <span className="mt-1 block text-[10px] text-[#6a6d77]">
                {row.titles} titles · {row.match_wins} wins · {Math.round(row.win_percentage)}% win
              </span>
            </span>
            <span className="shrink-0 text-right text-sm font-bold text-[#0f2940]">
              {row.total_points.toLocaleString()}
              <span className="block text-[9px] font-medium text-[#6a6d77]">points</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-[14px] border border-[#dedfe3] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.06)] md:block">
        <div className="grid grid-cols-[55px_minmax(240px,1fr)_95px_75px_95px_75px_90px_110px_78px] bg-[#f4f4f6] px-4 py-2.5 text-[9px] font-bold text-[#6a6d77]">
          <span>RANK</span>
          <span>PLAYER</span>
          <span>POINTS</span>
          <span>TITLES</span>
          <span>RUNNER-UP</span>
          <span>WINS</span>
          <span>WIN %</span>
          <span>GROUP PTS %</span>
          <span>MOVE</span>
        </div>
        {pageRows.map((row) => (
          <Link
            key={row.id}
            href={'/initiatives/sikh-padel-association/leaderboard/' + row.id}
            className="grid grid-cols-[55px_minmax(240px,1fr)_95px_75px_95px_75px_90px_110px_78px] items-center border-t border-[#dedfe3] px-4 py-3 text-[11px] transition-colors hover:bg-[#fafafb]"
          >
            <span className="font-semibold text-[#15171c]">{row.rank}</span>
            <span className="font-semibold text-[#0f2940]">
              {countryFlag(row.country_code)} {playerName(row)}
            </span>
            <span>{row.total_points.toLocaleString()}</span>
            <span>{row.titles}</span>
            <span>{row.runner_up_finishes}</span>
            <span>{row.match_wins}</span>
            <span>{Math.round(row.win_percentage)}%</span>
            <span>{Math.round(row.group_points_won_percentage)}%</span>
            <MovementBadge movement={row.movement} />
          </Link>
        ))}
      </div>

      {filteredRows.length === 0 ? (
        <div className="rounded-[14px] border border-[#dedfe3] bg-white px-6 py-10 text-center text-sm text-[#6a6d77]">
          No players match those filters.
        </div>
      ) : null}

      <div className="flex flex-col gap-3 text-[10px] text-[#6a6d77] sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing {(currentPage - 1) * PAGE_SIZE + 1}–
          {Math.min(currentPage * PAGE_SIZE, filteredRows.length)} of {filteredRows.length} players
        </span>
        {pageCount > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-full border border-[#dedfe3] bg-white px-3 py-2 font-semibold text-[#0f2940] disabled:opacity-40"
            >
              ← Previous
            </button>
            <span className="font-semibold text-[#0f2940]">
              {currentPage} / {pageCount}
            </span>
            <button
              type="button"
              disabled={currentPage === pageCount}
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              className="rounded-full border border-[#dedfe3] bg-white px-3 py-2 font-semibold text-[#0f2940] disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
