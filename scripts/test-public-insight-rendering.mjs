import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {loadTypeScript as load} from './helpers/load-typescript.mjs'

const post={id:'published',slug:'published-insight',title:'Published insight',description:'Public summary',content:'Public body',pillar:'Develop',date:'2026-10-28',readTime:'3 min',persisted:true,status:'published',coverImage:'/media/file/published/cover.jpg',metadata:{seoTitle:'Published SEO'}}
const cookieTrap={'@/lib/blog-images':{getUploadedBlogCovers:async()=>{throw new Error('Public rendering attempted a cookie-bound cover lookup')}}}
const publicData={getPublishedBlogPostBySlug:async()=>post,getPublishedBlogPosts:async()=>[post,{...post,id:'related',slug:'related'}]}
function detail(data=publicData){return load('app/insights/[slug]/page.tsx',{...cookieTrap,'@/lib/blog':{getAllSlugs:()=>[post.slug]},'@/lib/blog-db':data,'@/components/cms/insight-content':{InsightContent:()=>null},'next/navigation':{notFound(){throw new Error('not-found')}}})}

test('published article metadata and detail render without cookie-bound legacy cover reads',async()=>{
 const route=detail(),params=Promise.resolve({slug:post.slug}),metadata=await route.generateMetadata({params}),body=await route.default({params})
 assert.equal(metadata.title,'Published SEO');assert.equal(body.props.post,post);assert.equal(body.props.related[0].slug,'related');assert.equal(body.props.uploadedCovers,undefined)
})
test('unpublished article remains not-found without consulting legacy covers',async()=>{
 const route=detail({...publicData,getPublishedBlogPostBySlug:async()=>undefined})
 await assert.rejects(route.default({params:Promise.resolve({slug:'private-draft'})}),/not-found/)
})
test('public Insights listing uses each published article cover without a session lookup',async()=>{
 const Link=({children,...props})=>React.createElement('a',props,children),Image=({fill,unoptimized,priority,...props})=>React.createElement('img',props)
 const route=load('app/insights/page.tsx',{...cookieTrap,'@/lib/blog-db':publicData,'next/image':{default:Image,__esModule:true},'next/link':{default:Link,__esModule:true},'@/components/navbar':{Navbar:()=>null},'@/components/footer-section':{FooterSection:()=>null},'@/components/cms/native-page-sections':{NativePageSections:()=>null},'@/lib/cms/copy-server':{getPublicPageCopy:async()=>({})},'@/components/cms/page-copy-server':{withPageCopy:(node)=>node},'@/lib/cms/page-seo-server':{getMigratedPageMetadata:async()=>({})}})
 const html=renderToStaticMarkup(await route.default())
 assert.ok(html.includes('Published insight'));assert.ok(html.includes('/media/file/published/cover.jpg'));assert.ok(html.includes('/insights/published-insight'))
})
