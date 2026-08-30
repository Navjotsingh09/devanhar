"use client"

import { useState } from "react"
import { Bus, CalendarDays, Clock3, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const eventDetails = [
  { icon: MapPin, text: "Hilston Park, Newcastle, Monmouth, Gwent, Wales, NP25 5NY" },
  { icon: CalendarDays, text: "Bank Holiday Monday, 31 August 2026" },
  { icon: Clock3, text: "12pm-6pm" },
]

export function TransportFullyBookedNotice() {
  const [open, setOpen] = useState(true)

  return (
    <>
      <aside className="mt-16 border-b border-amber-300 bg-amber-50 text-slate-950 md:mt-20" aria-label="Important transport update">
        <div className="container mx-auto flex max-w-5xl items-start gap-3 px-6 py-4 lg:px-12">
          <Bus className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
          <div>
            <p className="font-bold">Transport now fully booked</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">
              You can still book for the Family Fun Day if you can make your own way to Hilston Park.
            </p>
          </div>
        </div>
      </aside>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto border-amber-300 p-0">
          <div className="bg-amber-50 px-6 pb-5 pt-7 sm:px-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-slate-950">
              <Bus className="h-6 w-6" aria-hidden="true" />
            </div>
            <DialogHeader className="pr-6 text-left">
              <DialogTitle className="text-2xl leading-tight text-slate-950">
                Transport now fully booked
              </DialogTitle>
              <DialogDescription className="pt-2 text-base leading-relaxed text-slate-700">
                All places on the organised transport to the Fun Family Summer Extravaganza are now fully booked.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-5 px-6 pb-6 sm:px-8 sm:pb-8">
            <p className="leading-relaxed text-foreground">
              You can still book to attend the event if you are able to make your own way to Hilston Park.
            </p>
            <ul className="space-y-3 border-y border-border py-5">
              {eventDetails.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(43,100%,29%)]" aria-hidden="true" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <DialogFooter>
              <DialogClose asChild>
                <Button className="w-full bg-[hsl(43,100%,29%)] text-white hover:bg-[hsl(43,100%,25%)] sm:w-auto">
                  Continue to event booking
                </Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
