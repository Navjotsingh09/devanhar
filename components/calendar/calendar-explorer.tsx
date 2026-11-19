"use client"
import { useMemo, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, ArrowUpRight, Download, Link2, Search, CalendarPlus, RefreshCw, Info } from "lucide-react"
import type { PublicCalendarEvent } from "@/lib/devanhaar-calendar"

const feedUrl="https://devanhaar.com/calender/feed.ics"
const weekdays=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
const formatter=(date:string, options:Intl.DateTimeFormatOptions)=>new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/London",...options}).format(new Date(date))
function dateKey(iso:string) {return formatter(iso,{year:"numeric",month:"2-digit",day:"2-digit"}).split("/").reverse().join("-")}
function googleUrl(event:PublicCalendarEvent) {
  const stamp=(s:string)=>s.replace(/[-:]/g,"").replace(/\.\d{3}/,"")
  const start=event.allDay?event.start.slice(0,10).replace(/-/g,""):stamp(event.start)
  const end=event.allDay?event.end.slice(0,10).replace(/-/g,""):stamp(event.end)
  const query=new URLSearchParams({action:"TEMPLATE",text:event.title,dates:start+"/"+end,details:event.description,location:event.location})
  return "https://calendar.google.com/calendar/render?"+query.toString()
}
function outlookUrl(event:PublicCalendarEvent) {
  const query=new URLSearchParams({path:"/calendar/action/compose",rru:"addevent",subject:event.title,startdt:event.start,enddt:event.end,body:event.description,location:event.location})
  return "https://outlook.live.com/calendar/0/deeplink/compose?"+query.toString()
}
function eventDate(event:PublicCalendarEvent) {
  if(event.allDay) {
    const start=formatter(event.start,{day:"numeric",month:"short",year:"numeric"})
    const endDate=new Date(new Date(event.end).getTime()-86400000)
    const last=formatter(endDate.toISOString(),{day:"numeric",month:"short",year:"numeric"})
    return start===last ? start+" · All day" : start+" – "+last+" · All day"
  }
  const a=formatter(event.start,{weekday:"short",day:"numeric",month:"short",year:"numeric"})
  const b=formatter(event.start,{hour:"2-digit",minute:"2-digit"})
  const c=formatter(event.end,{hour:"2-digit",minute:"2-digit"})
  return a+" · "+b+"–"+c+" (UK)"
}
export function CalendarExplorer({events,unavailable}:{events:PublicCalendarEvent[];unavailable:boolean}) {
  const today=new Date()
  const initialYear=Number(new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/London",year:"numeric"}).format(today))
  const initialMonth=Number(new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/London",month:"numeric"}).format(today))-1
  const [month,setMonth]=useState(new Date(Date.UTC(initialYear,initialMonth,1)))
  const [selected,setSelected]=useState<string|null>(null)
  const [search,setSearch]=useState("")
  const [view,setView]=useState<"month"|"list">("month")
  const [copied,setCopied]=useState(false)
  const filtered=useMemo(()=>events.filter(e=>[e.title,e.location,e.description].join(" ").toLowerCase().includes(search.trim().toLowerCase())),[events,search])
  const current=filtered.filter(e=>{const d=dateKey(e.start);return Number(d.slice(0,4))===month.getUTCFullYear() && Number(d.slice(5,7))===month.getUTCMonth()+1})
  const selectedEvent=filtered.find(e=>e.id===selected)||null
  const monthLabel=new Intl.DateTimeFormat("en-GB",{month:"long",year:"numeric",timeZone:"UTC"}).format(month)
  const dayOne=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth(),1))
  const offset=(dayOne.getUTCDay()+6)%7
  const length=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()+1,0)).getUTCDate()
  const days=Array.from({length:Math.ceil((offset+length)/7)*7},(_,i)=>i-offset+1)
  const todayKey=dateKey(today.toISOString())
  function changeMonth(n:number){setMonth(new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()+n,1)));setSelected(null)}
  async function copy(){try{await navigator.clipboard.writeText(feedUrl);setCopied(true);setTimeout(()=>setCopied(false),2500)}catch{}}
  return <div>
    <section className="relative overflow-hidden bg-[#102b45] text-white">
      <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full bg-[#d6a849]/15 blur-3xl"/>
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase"><CalendarDays className="h-4 w-4 text-[#f2cd6c]"/> Devanhaar Community</div>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">Our events calendar</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 md:text-lg">Discover what’s happening across Devanhaar. Explore upcoming events, save a date or subscribe to follow new additions and changes.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a className="inline-flex items-center gap-2 rounded-full bg-[#efbd3f] px-5 py-3 text-sm font-bold text-[#142c42] hover:bg-[#f7ca58]" href={feedUrl}><CalendarPlus className="h-4 w-4"/>Subscribe to full calendar</a>
          <a className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-semibold hover:bg-white/10" href={"https://calendar.google.com/calendar/u/0/r?cid="+encodeURIComponent(feedUrl)} target="_blank" rel="noopener noreferrer">Add to Google Calendar <ArrowUpRight className="h-4 w-4"/></a>
        </div>
      </div>
    </section>
    <div className="mx-auto max-w-7xl space-y-7 px-5 py-10 md:px-8 md:py-14">
      <section className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-[1fr_auto] md:items-center md:p-6" aria-label="Subscribe to Devanhaar calendar">
        <div><h2 className="text-xl font-semibold text-[#152c44]">Never miss a Devanhaar event</h2><p className="mt-1 text-sm leading-6 text-slate-600">Subscribe once to keep the calendar in your app. Unlike downloading an individual event, a subscription can refresh when the organiser updates Outlook. Refresh timing depends on your calendar app.</p></div>
        <div className="flex flex-wrap gap-2">
          <a className="rounded-lg bg-[#16334d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#274c69]" href={"webcal://devanhaar.com/calender/feed.ics"}>Subscribe in calendar app</a>
          <button onClick={copy} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium text-[#16334d] hover:bg-slate-50" type="button"><Link2 className="h-4 w-4"/>{copied?"Copied!":"Copy subscription link"}</button>
        </div>
      </section>
      {unavailable && <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status"><Info className="h-5 w-5 shrink-0"/> The Outlook calendar is temporarily unavailable. Please try refreshing later. No events have been invented or substituted.</div>}
      {!unavailable && events.length===0 && <div className="rounded-xl border bg-white p-5 text-sm text-slate-600">There are no published events within the upcoming calendar window.</div>}
      <section className="rounded-2xl border bg-white shadow-sm" aria-label="Devanhaar events">
        <div className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div><h2 className="text-2xl font-semibold text-[#152c44]">Explore events</h2><p className="mt-1 text-sm text-slate-500">Times shown in UK local time</p></div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative"><span className="sr-only">Search events</span><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500"/><input className="w-48 rounded-lg border py-2 pl-9 pr-3 text-sm text-[#16334d] outline-offset-2 md:w-56" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search events"/></label>
            <div className="inline-flex rounded-lg border p-1" role="group" aria-label="Calendar view"><button type="button" aria-pressed={view==="month"} className={"rounded-md px-3 py-1.5 text-sm "+(view==="month"?"bg-[#16334d] text-white":"text-slate-600")} onClick={()=>setView("month")}>Month</button><button type="button" aria-pressed={view==="list"} className={"rounded-md px-3 py-1.5 text-sm "+(view==="list"?"bg-[#16334d] text-white":"text-slate-600")} onClick={()=>setView("list")}>List</button></div>
          </div>
        </div>
        <div className="flex items-center justify-between border-b px-5 py-4 md:px-6"><h3 className="text-lg font-semibold text-[#152c44]">{monthLabel}</h3><div className="flex items-center gap-2"><button type="button" className="rounded-lg border p-2 hover:bg-slate-50" onClick={()=>changeMonth(-1)} aria-label="Previous month"><ChevronLeft className="h-4 w-4"/></button><button type="button" className="rounded-lg border px-3 py-2 text-xs hover:bg-slate-50" onClick={()=>{setMonth(new Date(Date.UTC(initialYear,initialMonth,1)));setSelected(null)}}>Today</button><button type="button" className="rounded-lg border p-2 hover:bg-slate-50" onClick={()=>changeMonth(1)} aria-label="Next month"><ChevronRight className="h-4 w-4"/></button></div></div>
        {view==="month"?
          <div className="p-3 md:p-5"><div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">{weekdays.map(day=><div key={day} className="py-3">{day}</div>)}</div><div className="grid grid-cols-7 gap-1">{days.map((day,i)=>{
            const valid=day>0&&day<=length
            const key=valid?month.getUTCFullYear()+"-"+String(month.getUTCMonth()+1).padStart(2,"0")+"-"+String(day).padStart(2,"0"):""
            const matching=valid?filtered.filter(e=>dateKey(e.start)===key):[]
            return <div key={i} className={"min-h-20 rounded-lg border p-1.5 md:min-h-28 md:p-2 "+(!valid?"bg-slate-50/60":"bg-white")+(key===todayKey?" border-[#ca9730]":" border-slate-100")}>
              {valid&&<><div className={"mb-1 text-xs font-medium "+(key===todayKey?"text-[#a36a13]":"text-slate-600")}>{day}</div>{matching.slice(0,3).map(e=><button key={e.id} type="button" onClick={()=>setSelected(e.id)} className="mb-1 w-full truncate rounded bg-[#eaf1f6] px-1.5 py-1 text-left text-[10px] font-medium text-[#153a57] hover:bg-[#d5e5ef] md:text-xs" title={e.title}>{e.title}</button>)}{matching.length>3&&<span className="text-[10px] text-slate-500">+{matching.length-3} more</span>}</>}
            </div>
          })}</div></div>:
          <div className="divide-y px-5 md:px-6">{current.length===0?<p className="py-12 text-center text-sm text-slate-500">No events this month. Explore another month.</p>:current.map(e=><button key={e.id} className="flex w-full items-center justify-between gap-5 py-4 text-left hover:bg-slate-50" onClick={()=>setSelected(e.id)} type="button"><div><p className="font-semibold text-[#15334d]">{e.title}</p><p className="mt-1 text-sm text-slate-500">{eventDate(e)}{e.location?" · "+e.location:""}</p></div><ChevronRight className="h-4 w-4 shrink-0 text-slate-500"/></button>)}</div>}
        {view==="month"&&current.length===0&&<p className="px-5 pb-6 text-center text-sm text-slate-500">No events shown for {monthLabel}.</p>}
      </section>
      <section className="grid gap-5 md:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border bg-white p-5 shadow-sm md:p-6"><h2 className="text-xl font-semibold text-[#152c44]">Upcoming events</h2><div className="mt-4 divide-y">{filtered.filter(e=>new Date(e.end).getTime()>=today.getTime()).slice(0,8).map(e=><button className="flex w-full items-start gap-4 py-4 text-left hover:bg-slate-50" key={e.id} onClick={()=>setSelected(e.id)} type="button"><span className="mt-1 rounded-lg bg-[#fdf4db] p-2 text-[#a8791e]"><CalendarDays className="h-5 w-5"/></span><span className="flex-1"><span className="block font-semibold text-[#15334d]">{e.title}</span><span className="mt-1 block text-sm text-slate-500">{eventDate(e)}{e.location?" · "+e.location:""}</span></span><ChevronRight className="mt-2 h-4 w-4 text-slate-500"/></button>)}{filtered.filter(e=>new Date(e.end).getTime()>=today.getTime()).length===0&&<p className="py-8 text-sm text-slate-500">No upcoming events are currently published.</p>}</div></div>
        <aside className="self-start rounded-2xl bg-[#f4eee2] p-6"><RefreshCw className="h-6 w-6 text-[#a8791e]"/><h2 className="mt-4 text-lg font-semibold text-[#15334d]">How subscriptions work</h2><p className="mt-3 text-sm leading-7 text-[#43546a]">Choose “Subscribe in calendar app” or copy the subscription link into Google, Apple Calendar or Outlook. New and updated events will appear when your calendar service refreshes. An individual event download is a one-time copy, not a live subscription.</p></aside>
      </section>
    </div>
    {selectedEvent&&<div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}>
      <section role="dialog" aria-modal="true" aria-label={selectedEvent.title} className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl md:p-8">
        <div className="flex items-start justify-between gap-4"><span className="rounded-full bg-[#fdf4db] px-3 py-1 text-xs font-bold text-[#9a721f]">Devanhaar event</span><button type="button" onClick={()=>setSelected(null)} className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100" aria-label="Close event details">Close ✕</button></div>
        <h2 className="mt-5 text-2xl font-semibold text-[#15334d] md:text-3xl">{selectedEvent.title}</h2>
        <div className="mt-5 space-y-3 text-sm text-[#45566a]"><p className="flex items-start gap-2"><Clock3 className="mt-0.5 h-4 w-4 shrink-0"/>{eventDate(selectedEvent)}</p>{selectedEvent.location&&<p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0"/>{selectedEvent.location}</p>}</div>
        {selectedEvent.description&&<p className="mt-6 whitespace-pre-wrap break-words border-t pt-5 text-sm leading-7 text-slate-700">{selectedEvent.description}</p>}
        {selectedEvent.url&&<a className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700 underline" href={selectedEvent.url} target="_blank" rel="noopener noreferrer">Event website <ArrowUpRight className="h-4 w-4"/></a>}
        <div className="mt-7 border-t pt-5"><p className="mb-3 text-sm font-semibold text-[#15334d]">Add this event to your calendar</p><div className="flex flex-wrap gap-2"><a className="inline-flex items-center gap-2 rounded-lg bg-[#16334d] px-4 py-2.5 text-sm font-semibold text-white" href={"/calender/event.ics?id="+encodeURIComponent(selectedEvent.id)}><Download className="h-4 w-4"/>Apple / ICS</a><a className="rounded-lg border px-4 py-2.5 text-sm font-medium" href={googleUrl(selectedEvent)} target="_blank" rel="noopener noreferrer">Google Calendar</a><a className="rounded-lg border px-4 py-2.5 text-sm font-medium" href={outlookUrl(selectedEvent)} target="_blank" rel="noopener noreferrer">Outlook</a></div><p className="mt-3 text-xs text-slate-500">This adds only the selected date. Subscribe to the full calendar to receive subsequent changes.</p></div>
      </section>
    </div>}
  </div>
}
