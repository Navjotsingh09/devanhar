import {PageCopyProvider} from './page-copy-provider'
import {applyPageCopy} from '@/lib/cms/copy-node'
import {isPageCopyEnvelope,type PageCopy} from '@/lib/cms/copy-schema'
import {CmsContentSections} from './page-renderer'
import {getPublishedBlogPosts} from '@/lib/blog-db'
async function Additions({copy}:{copy:PageCopy}){if(!isPageCopyEnvelope(copy)||!copy.additions.length)return null;const posts=copy.additions.some(s=>s.type==='insights')?await getPublishedBlogPosts():[];return <CmsContentSections sections={copy.additions} posts={posts}/>}
export function withPageCopy(children:React.ReactNode,copy:PageCopy){return <PageCopyProvider copy={copy} additions={<Additions copy={copy}/>}>{applyPageCopy(children,copy)}</PageCopyProvider>}
