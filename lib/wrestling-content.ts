export type WrestlingSession = {day:string;time:string;venue:string;group:string}
export type WrestlingMedia = {src:string;alt:string;caption:string;type:'image'|'video'}

/** Supplied academy copy. Timetable and academy media await the project lead's files. */
export const wrestlingContent = {
 title:'Devanhaar Wrestling Academy',
 introduction:'A community-led freestyle wrestling initiative reconnecting the next generation with the wrestling heritage of the Sikh and Punjabi community.',
 overview:'We bring physical training and community together. The academy aims to provide an accessible, supportive and challenging environment where individuals can develop their wrestling abilities, strengthen their physical and mental wellbeing, and build lasting connections within the sangat.',
 heritage:[
  {title:'The akhara tradition',name:'Guru Angad Dev Ji',body:'Guru Angad Dev Ji promoted physical training and wrestling akharas, recognising the place of strength, discipline and wellbeing in community life.'},
  {title:'The Sant-Sipahi ideal',name:'Guru Hargobind Sahib Ji',body:'Guru Hargobind Sahib Ji emphasised the Sant-Sipahi — Saint-Soldier — ideal, bringing physical strength, courage and resilience alongside spiritual development.'},
 ],
 sessions:[] as WrestlingSession[],
 media:[] as WrestlingMedia[],
}
