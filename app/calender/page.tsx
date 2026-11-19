import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { getCalendarFeed, parseCalendar } from "@/lib/devanhaar-calendar"
import { CalendarExplorer } from "@/components/calendar/calendar-explorer"

export const metadata: Metadata = {
  title:"Devanhaar Community Calendar | Events and Activities",
  description:"Discover Devanhaar events, view details, add individual events to your calendar or subscribe to the full community calendar.",
  alternates:{canonical:"https://devanhaar.com/calender"},
}
export const dynamic="force-dynamic"
export default async function CalendarPage() {
  let events: ReturnType<typeof parseCalendar>=[]
  let unavailable=false
  try { events=parseCalendar(await getCalendarFeed()) }
  catch(error) {console.error("[calendar] Outlook feed unavailable",error instanceof Error?error.message:"unknown");unavailable=true}
  return <div className="min-h-screen bg-[#f8fafc]">
    <Navbar/>
    <main className="pt-24 md:pt-28">
      <CalendarExplorer events={events} unavailable={unavailable}/>
    </main>
    <FooterSection/>
  </div>
}
