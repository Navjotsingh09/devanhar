export const PADEL_EVENT = {
  date: "6 September",
  time: "11am–5pm",
  venue: "Wellness Suite, Rocket Padel",
  address: "2 The Drive, Ilford IG1 3PS",
  mapUrl: "https://www.google.com/search?q=Rocket+Padel+Ilford+2+The+Drive+Ilford+IG1+3PS",
  feePerPerson: 50,
  teamFee: 100,
  name: "Sikh Padel Association — 6 September",
} as const

// Set once the current event's live Tournify link is known; the season leaderboard
// page shows a "live scores" link only when this is non-null (no fabricated URLs).
export const PADEL_LIVE_SCORES_URL: string | null = null

export const PREVIOUS_PADEL_EVENT = {
  date: "4 July",
  fullDate: "Saturday 4 July 2026",
  tournamentNumber: "01",
  venue: "Tyseley / Core Padel Birmingham",
  venueDetail: "Core Padel, Redfern Road, Tyseley, Birmingham",
  purpose: "Fundraising in support of Devanhaar",
  leaderboardUrl:
    "https://tournifyapp.com/live/sikhpadelassociation?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZnRzaATqlSdwZG9mAmZkaWQWUMYUXq62fzslQtrICXTMdB_j34MAFGV4dG4DYWVtAjExAHNydGMGYXBwX2lkDzEyNDAyNDU3NDI4NzQxNAABp9kRlWJB4zw3QhDFCTr_FkAVxeMwQJlHej0Ndu_BHr00yu9O2ENUENFt4QsB_aem_JsF0nH0ZmbaptO6UmWfeZQ",
} as const
