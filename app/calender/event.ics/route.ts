import { NextRequest, NextResponse } from "next/server"
import { getCalendarFeed,parseCalendar,singleEventIcs } from "@/lib/devanhaar-calendar"

export const dynamic="force-dynamic"
export async function GET(request:NextRequest) {
  const id=request.nextUrl.searchParams.get("id")
  if(!id || id.length>600) return new NextResponse("Missing event",{status:400})
  try {
    const event=parseCalendar(await getCalendarFeed()).find(item=>item.id===id)
    if(!event) return new NextResponse("Event not found",{status:404})
    return new NextResponse(singleEventIcs(event),{headers:{"Content-Type":"text/calendar; charset=utf-8","Content-Disposition":'attachment; filename="devanhaar-event.ics"',"Cache-Control":"private, no-store"}})
  } catch {return new NextResponse("Calendar temporarily unavailable",{status:503})}
}
