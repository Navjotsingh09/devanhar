import {PageCopyProvider} from './page-copy-provider'
import {applyPageCopy} from '@/lib/cms/copy-node'
import type {PageCopy} from '@/lib/cms/copy-schema'
export function withPageCopy(children:React.ReactNode,copy:PageCopy){return <PageCopyProvider copy={copy}>{applyPageCopy(children,copy)}</PageCopyProvider>}
