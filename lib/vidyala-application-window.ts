// Vidyala applications close automatically from this date (UK time).
export const VIDYALA_APPLICATION_CLOSE_DATE = "2026-10-02"

export function isVidyalaApplicationsClosed(now: Date = new Date()): boolean {
  return now >= new Date(`${VIDYALA_APPLICATION_CLOSE_DATE}T00:00:00+01:00`)
}
