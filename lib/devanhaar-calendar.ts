import "server-only"

export const CALENDAR_URL = "https://outlook.office365.com/owa/calendar/708ca9ae63014816a96b05d4ff5568f8@devanhaar2.onmicrosoft.com/c5d779ead5724fe1bedba074bbdfde9a13368011100720940220/calendar.ics"
export const CALENDAR_FEED_PATH = "/calender/feed.ics"
export type PublicCalendarEvent = { id: string; uid: string; title: string; description: string; location: string; url: string; start: string; end: string; allDay: boolean; recurrence: boolean }
type RawEvent = { [key: string]: string[] }
const MAX_BYTES = 3_000_000

export async function getCalendarFeed(): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch(CALENDAR_URL, { next: { revalidate: 300 }, signal: controller.signal, headers: { Accept: "text/calendar" } })
    if (!response.ok) throw new Error("The Outlook calendar is temporarily unavailable.")
    const size = Number(response.headers.get("content-length") || 0)
    if (size > MAX_BYTES) throw new Error("The calendar feed is too large.")
    const body = await response.text()
    if (body.length > MAX_BYTES || !body.includes("BEGIN:VCALENDAR")) throw new Error("The Outlook feed did not return a valid calendar.")
    return body
  } finally { clearTimeout(timeout) }
}

function unfold(source: string): string[] {
  return source.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n[ \t]/g, "").split("\n")
}
function value(field: string): string { return field.includes(":") ? field.slice(field.indexOf(":") + 1) : "" }
function decode(text: string): string {
  return text.replace(/\\[nN]/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\").trim()
}
function get(event: RawEvent, key: string): string {
  const match = Object.keys(event).find(k => k.split(";")[0] === key)
  return match ? value(event[match][0]) : ""
}
function field(event: RawEvent, key: string): { key: string; val: string } | null {
  const k = Object.keys(event).find(k => k.split(";")[0] === key)
  return k ? { key: k, val: value(event[k][0]) } : null
}
function zonedEpoch(year: number, month: number, day: number, h: number, m: number, s: number, tz: string): number {
  const desired = Date.UTC(year, month - 1, day, h, m, s)
  let estimate = desired
  for (let i = 0; i < 3; i++) {
    const formatter = new Intl.DateTimeFormat("en-GB", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23", minute: "2-digit", second: "2-digit" })
    const parts = Object.fromEntries(formatter.formatToParts(new Date(estimate)).map(part => [part.type, part.value]))
    const actual = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second))
    estimate += desired - actual
  }
  return estimate
}
function parseDate(spec: { key: string; val: string } | null): { date: Date; allDay: boolean } | null {
  if (!spec) return null
  const str = spec.val.trim()
  const hit = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(str)
  if (!hit) return null
  const [, y, mo, d, hh, mm, ss, utc] = hit
  const allDay = !hh || spec.key.includes("VALUE=DATE;") || spec.key.endsWith("VALUE=DATE")
  const tzMatch = /TZID="?([^;"]+)/.exec(spec.key)
  let epoch = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(hh || 0), Number(mm || 0), Number(ss || 0))
  if (hh && !utc && tzMatch) {
    try { epoch = zonedEpoch(Number(y), Number(mo), Number(d), Number(hh), Number(mm), Number(ss || 0), tzMatch[1]) }
    catch { /* Unknown Outlook timezone: display the supplied wall clock in UTC rather than inventing an offset. */ }
  }
  const date = new Date(epoch)
  if (Number.isNaN(date.getTime())) return null
  return { date, allDay }
}
function rawEvents(feed: string): RawEvent[] {
  const entries: RawEvent[] = []
  let current: RawEvent | null = null
  for (const line of unfold(feed)) {
    if (line === "BEGIN:VEVENT") { current = {}; continue }
    if (line === "END:VEVENT") { if (current) entries.push(current); current = null; continue }
    if (!current) continue
    const pos = line.indexOf(":")
    if (pos < 1) continue
    const key = line.slice(0,pos).toUpperCase()
    ;(current[key] ||= []).push(line)
  }
  return entries
}
function plusMonths(date: Date, n: number): Date {
  const result = new Date(date)
  result.setUTCDate(1)
  result.setUTCMonth(result.getUTCMonth() + n)
  return result
}
function expand(master: RawEvent, start: Date, end: Date, horizonStart: Date, horizonEnd: Date): {start: Date; end: Date}[] {
  const rule = get(master, "RRULE")
  if (!rule) return [{start,end}]
  const kv = Object.fromEntries(rule.split(";").map(pair => pair.split("=", 2)))
  const frequency = kv.FREQ
  const step = Math.max(1,Math.min(365,Number(kv.INTERVAL)||1))
  const count = Math.min(3000, Math.max(1, Number(kv.COUNT)||3000))
  const until = kv.UNTIL ? parseDate({key:"UNTIL",val:kv.UNTIL})?.date : null
  const byDay = (kv.BYDAY||"").split(",").filter(x=>/^(MO|TU|WE|TH|FR|SA|SU)$/.test(x))
  const weekday = ["SU","MO","TU","WE","TH","FR","SA"]
  const duration = end.getTime()-start.getTime()
  const results: {start:Date;end:Date}[]=[]
  let occurrence = 0
  let cursor = new Date(start)
  const windowEnd = Math.min(horizonEnd.getTime(),start.getTime()+1000*60*60*24*365*4)
  for(let index=0;index<1600 && cursor.getTime() <= windowEnd && occurrence<count;index++) {
    const elapsedDays = Math.floor((Date.UTC(cursor.getUTCFullYear(),cursor.getUTCMonth(),cursor.getUTCDate())-Date.UTC(start.getUTCFullYear(),start.getUTCMonth(),start.getUTCDate()))/86400000)
    const intervalWeek = Math.floor(elapsedDays/7)
    let eligible=false
    if(frequency==="DAILY") eligible=elapsedDays % step===0
    else if(frequency==="WEEKLY") eligible=intervalWeek % step===0 && (byDay.length?byDay.includes(weekday[cursor.getUTCDay()]):cursor.getUTCDay()===start.getUTCDay())
    else if(frequency==="MONTHLY") {
      const monthDiff=(cursor.getUTCFullYear()-start.getUTCFullYear())*12+cursor.getUTCMonth()-start.getUTCMonth()
      eligible=monthDiff%step===0 && cursor.getUTCDate()===Number(kv.BYMONTHDAY||start.getUTCDate())
    } else if(frequency==="YEARLY") eligible=(cursor.getUTCFullYear()-start.getUTCFullYear())%step===0 && cursor.getUTCMonth()===start.getUTCMonth() && cursor.getUTCDate()===start.getUTCDate()
    else return [{start,end}]
    if(eligible && cursor.getTime()>=start.getTime()) {
      if(until && cursor.getTime()>until.getTime()) break
      occurrence++
      if(cursor.getTime()+duration >= horizonStart.getTime() && cursor.getTime()<=horizonEnd.getTime()) results.push({start:new Date(cursor),end:new Date(cursor.getTime()+duration)})
    }
    cursor = new Date(cursor.getTime()+86400000)
  }
  return results
}
export function parseCalendar(feed: string, now = new Date()): PublicCalendarEvent[] {
  const startWindow = new Date(now.getTime()-86400000*30)
  const endWindow = new Date(now.getTime()+86400000*365)
  const rows = rawEvents(feed)
  const exceptions = new Set(rows.filter(e=>!!get(e,"RECURRENCE-ID")).map(e=>get(e,"UID")+"|"+(parseDate(field(e,"RECURRENCE-ID"))?.date.toISOString()||"")))
  const events: PublicCalendarEvent[] = []
  for(const row of rows) {
    if(get(row,"STATUS").toUpperCase()==="CANCELLED") continue
    const startField=parseDate(field(row,"DTSTART"))
    const endField=parseDate(field(row,"DTEND"))
    if(!startField) continue
    const start=startField.date
    const end=endField?.date || new Date(start.getTime()+(startField.allDay?86400000:3600000))
    const uid=get(row,"UID") || start.toISOString()+get(row,"SUMMARY")
    const recurrent=!!get(row,"RRULE")
    const instances=get(row,"RECURRENCE-ID")?[{start,end}]:expand(row,start,end,startWindow,endWindow)
    const exclusion=new Set(Object.keys(row).filter(k=>k.split(";")[0]==="EXDATE").flatMap(k=>(row[k]||[]).flatMap(line=>value(line).split(",").map(t=>parseDate({key:k,val:t})?.date.toISOString()).filter(Boolean))))
    for(const instance of instances) {
      if(instance.end < startWindow || instance.start > endWindow) continue
      if(exclusion.has(instance.start.toISOString()) || (!get(row,"RECURRENCE-ID") && exceptions.has(uid+"|"+instance.start.toISOString()))) continue
      events.push({
        id: uid+"|"+instance.start.toISOString(),uid,
        title:decode(get(row,"SUMMARY"))||"Devanhaar event",
        description:decode(get(row,"DESCRIPTION")),
        location:decode(get(row,"LOCATION")),
        url: /^https:\/\//i.test(get(row,"URL"))?get(row,"URL"):"",
        start:instance.start.toISOString(), end:instance.end.toISOString(),
        allDay:startField.allDay,recurrence:recurrent,
      })
    }
  }
  return events.sort((a,b)=>a.start.localeCompare(b.start)).slice(0,500)
}
export function singleEventIcs(event: PublicCalendarEvent): string {
  const esc=(s:string)=>s.replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;")
  const stamp=(d:string)=>new Date(d).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"")
  const start=event.allDay?event.start.slice(0,10).replace(/-/g,""):stamp(event.start)
  const end=event.allDay?event.end.slice(0,10).replace(/-/g,""):stamp(event.end)
  return [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Devanhaar//Event Calendar//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH",
    "BEGIN:VEVENT","UID:"+esc(event.id)+"@devanhaar.com","DTSTAMP:"+stamp(new Date().toISOString()),
    (event.allDay?"DTSTART;VALUE=DATE:":"DTSTART:")+start,(event.allDay?"DTEND;VALUE=DATE:":"DTEND:")+end,
    "SUMMARY:"+esc(event.title),"DESCRIPTION:"+esc(event.description),"LOCATION:"+esc(event.location),
    ...(event.url?["URL:"+event.url]:[]),"END:VEVENT","END:VCALENDAR",""
  ].join("\r\n")
}
