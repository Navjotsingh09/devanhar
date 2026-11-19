import { NextResponse } from "next/server"
import { getCalendarFeed } from "@/lib/devanhaar-calendar"

export const dynamic="force-dynamic"
export async function GET() {
  try {
    const feed=await getCalendarFeed()
    return new NextResponse(feed,{headers:{"Content-Type":"text/calendar; charset=utf-8","Content-Disposition":'inline; filename="devanhaar-calendar.ics"',"Cache-Control":"public, max-age=60, s-maxage=300"}})
  } catch {
    return new NextResponse("Calendar temporarily unavailable",{status:503,headers:{"Cache-Control":"no-store"}})
  }
}
