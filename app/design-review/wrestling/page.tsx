import Link from 'next/link'
export const metadata={title:'Wrestling Academy — design review',robots:{index:false,follow:false}}
export default async function Review({searchParams}:{searchParams:Promise<{viewport?:string}>}){
 const query=await searchParams,view=['desktop','tablet','mobile'].includes(query.viewport||'')?query.viewport!:'desktop'
 const widths={desktop:'100%',tablet:'768px',mobile:'390px'}
 return <main className="min-h-screen bg-slate-100 p-4 md:p-6"><div className="mx-auto mb-5 flex max-w-[1440px] flex-wrap items-center justify-between gap-4"><div><h1 className="font-semibold">Wrestling Academy · Draft review</h1><p className="mt-1 text-xs text-slate-600">Academy photos and confirmed class details are still needed.</p></div><nav aria-label="Preview width" className="flex gap-2">{(['desktop','tablet','mobile'] as const).map(size=><Link key={size} href={`?viewport=${size}`} aria-current={view===size?'page':undefined} className={`rounded border px-3 py-2 text-xs capitalize ${view===size?'bg-slate-900 text-white':'bg-white'}`}>{size}</Link>)}</nav></div><div className="overflow-x-auto"><iframe title={`${view} Wrestling Academy preview`} src="/wrestling" style={{width:widths[view as keyof typeof widths],maxWidth:'none'}} className="mx-auto block h-[85vh] border bg-white shadow-sm"/></div></main>
}
