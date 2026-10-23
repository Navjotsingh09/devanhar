export type ProjectSpace = {
  id: string
  title: string
  publicPath?: string
  dashboardPath?: string
  children?: ProjectSpace[]
  tools?: { title: string; url: string }[]
}
export const projectSpaces: ProjectSpace[] = [
  { id:'singhs-camp',title:'Singhs Camp',publicPath:'/initiatives/singhs-camp',children:[
    {id:'singhs-camp-uk',title:'Singhs Camp UK',publicPath:'/initiatives/singhs-camp/uk'},
    {id:'singhs-camp-eu',title:'Singhs Camp EU',publicPath:'/initiatives/singhs-camp/eu'},
  ]},
  {id:'kaurs-camp',title:'Kaurs Camp',publicPath:'/initiatives/kaurs-camp',dashboardPath:'/dashboard/kaurs',children:[
    {id:'kaurs-camp-uk',title:'Kaurs Camp UK',publicPath:'/initiatives/kaurs-camp/uk'},
    {id:'kaurs-camp-eu',title:'Kaurs Camp EU',publicPath:'/initiatives/kaurs-camp/eu'},
  ]},
  {id:'kids-camps',title:'Kids Camps',publicPath:'/initiatives/kids-camps'},
  {id:'roots-residential',title:'Roots Residential',publicPath:'/initiatives/roots-residential',dashboardPath:'/dashboard/roots',tools:[
    {title:'Camp registration responses',url:'/dashboard/roots/forms/ee66544d-b6da-4dfd-a269-833b43d1a67b/responses'},
  ]},
  {id:'sikh-family-initiative',title:'Sikh Family Initiative',publicPath:'/initiatives/sikh-family-initiative',dashboardPath:'/dashboard/family-initiative',children:[
    {id:'sikh-family-retreat',title:'Sikh Family Retreat',publicPath:'/initiatives/sikh-family-retreat',dashboardPath:'/dashboard/family-initiative/retreat'},
    {id:'sikh-family-extravaganza',title:'Sikh Family Extravaganza',publicPath:'/initiatives/sikh-family-extravaganza',dashboardPath:'/dashboard/family-initiative/extravaganza'},
    {id:'wedding-fair',title:'Wedding Fair',publicPath:'/initiatives/wedding-fair',dashboardPath:'/dashboard/family-initiative/wedding-fair'},
  ]},
  {id:'sikhi-vidyala',title:'Sikhi Vidyala',publicPath:'/initiatives/sikhi-vidyala',dashboardPath:'/dashboard/vidyala',tools:[
    {title:'Webinar signups',url:'/dashboard/vidyala/webinar'},
    {title:'Interest registrations',url:'/dashboard/vidyala/interest'},
  ]},
  {id:'sikh-professional-network',title:'Sikh Professional Network',publicPath:'/initiatives/sikh-professional-network'},
  {id:'university-projects',title:'University Projects',publicPath:'/initiatives/university-projects'},
  {id:'khalsa-catalyst',title:'Khalsa Catalyst',publicPath:'/initiatives/khalsa-catalyst'},
  {id:'gurmat-academy',title:'Gurmat Academy',publicPath:'/initiatives/gurmat-academy'},
  {id:'punjab-education-support',title:'Punjab Education Support',publicPath:'/initiatives/punjab-education-support'},
  {id:'self-defence-academy',title:'Wrestling Academy',publicPath:'/wrestling'},
  {id:'forums',title:'Forums',publicPath:'/initiatives/forums'},
  {id:'sweb3',title:'SWeb3',publicPath:'/initiatives/sweb3'},
  {id:'newsletter',title:'Monthly Newsletter',dashboardPath:'/dashboard/newsletter'},
  {id:'wolfrun',title:'Wolf Run',publicPath:'/events/wolfrun',dashboardPath:'/dashboard/wolfrun',tools:[
    {title:'Runners',url:'/dashboard/wolfrun-runners'},
  ]},
]
export function projectSpacePath(space: ProjectSpace) { return space.dashboardPath || `/dashboard/projects/${space.id}` }
export function findProjectSpace(id: string) {
  for (const space of projectSpaces) {
    if (space.id === id) return {space,parent:null}
    const child=space.children?.find(child=>child.id===id)
    if(child) return {space:child,parent:space}
  }
  return null
}
