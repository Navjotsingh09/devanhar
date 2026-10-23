
import { applyPageCopy } from '@/lib/cms/copy-node'
import type {PageCopy} from '@/lib/cms/copy-schema'
import {registerCopyComponent} from '@/lib/cms/copy-node'
import OurStoryNarrative from "./our-story-narrative"

export async function OurStorySection({ cmsCopy = {} }: {cmsCopy?:PageCopy} = {}) {


  return applyPageCopy((<OurStoryNarrative />), cmsCopy)
}

registerCopyComponent(OurStorySection)
