
import { applyPageCopy } from '@/lib/cms/copy-node'
import type {PageCopy} from '@/lib/cms/copy-schema'
import {registerCopyComponent} from '@/lib/cms/copy-node'
interface ScrollingGalleryProps {
  images: string[]
  heading?: string
}

export async function ScrollingGallery({cmsCopy = {},  images, heading }: (ScrollingGalleryProps) & {cmsCopy?:PageCopy}) {


  if (!images || images.length === 0) return null
  const loop = [...images, ...images]

  return applyPageCopy(((
    <section data-cms-section="2199e44e91d0ec98" className="py-20 md:py-28 border-t border-border overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl mb-10 md:mb-14">
        {heading ? (
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {heading}
          </h2>
        ) : null}
      </div>
      <div className="relative w-full">
        <div className="flex gap-5 animate-[scroll-x_240s_linear_infinite] w-max">
          {loop.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative h-64 md:h-80 w-[18rem] md:w-[26rem] flex-shrink-0 rounded-2xl overflow-hidden bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes scroll-x {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )), cmsCopy)
}

registerCopyComponent(ScrollingGallery)
