import { DEVICE_LABELS, type BookingDevice } from '@/lib/booking-device'
type Booking = { booking_device?:string|null; created_at:string;payment_status?:string|null;paid_at?:string|null;payment_reminder_sent_at?:string|null;children_attending?:unknown;adults_attending?:unknown;city?:string|null;country?:string|null }
type Interest = { form_data?:Record<string,unknown>|null }
export function FamilyBookingInsights({bookings,interests=[]}:{bookings:Booking[];interests?:Interest[]}) {
 const attendees=bookings.reduce((sum,row)=>sum+(Array.isArray(row.children_attending)?row.children_attending.length:0)+(Array.isArray(row.adults_attending)?row.adults_attending.length:0),0)
 const groups=interests.reduce((sum,row)=>{const n=Number(row.form_data?.number_of_people_in_group);return sum+(Number.isFinite(n)&&n>0?n:0)},0)
 return <section className="space-y-4 rounded-2xl border bg-card p-5">
  <h2 className="text-lg font-semibold">Booking and device insights</h2>
  <div className="grid gap-3 sm:grid-cols-3">{[[bookings.length,'Detailed bookings'],[attendees,'People named on bookings'],[groups,'People in interest groups']].map(([value,label])=><div key={String(label)} className="rounded-xl bg-muted/50 p-4"><p className="text-2xl font-bold">{value}</p><p className="mt-1 text-sm text-muted-foreground">{label}</p></div>)}</div>
  <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr>{['Device','Interest forms','Bookings','Verified paid','Paid within 24 hours','Paid before a logged reminder'].map(label=><th key={label} className="border-b p-3 font-semibold">{label}</th>)}</tr></thead><tbody>
  {(Object.keys(DEVICE_LABELS) as BookingDevice[]).map(device=>{
   const subset=bookings.filter(row=>(row.booking_device||'unknown')===device)
   const paid=subset.filter(row=>row.payment_status==='paid')
   const quick=paid.filter(row=>row.paid_at && Date.parse(row.paid_at)>=Date.parse(row.created_at)&&Date.parse(row.paid_at)-Date.parse(row.created_at)<=86400000)
   const noReminder=paid.filter(row=>row.paid_at && (!row.payment_reminder_sent_at||Date.parse(row.paid_at)<Date.parse(row.payment_reminder_sent_at)))
   return <tr key={device} className="border-b last:border-0"><td className="p-3 font-medium">{DEVICE_LABELS[device]}</td><td className="p-3">{interests.filter(row=>(row.form_data?.booking_device||'unknown')===device).length}</td><td className="p-3">{subset.length}</td><td className="p-3">{paid.length}</td><td className="p-3">{quick.length}</td><td className="p-3">{noReminder.length}</td></tr>
  })}
  </tbody></table></div>
  <p className="text-xs leading-5 text-muted-foreground">Device type is an estimate recorded for new submissions. Older records remain “Not recorded”. Laptop and desktop computers are grouped together. Interest registrations do not take payment or confirm a place. Payment comparisons include verified payments with a saved payment date; reminders sent outside the dashboard need to be logged.</p>
 </section>
}
