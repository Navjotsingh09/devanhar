import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import XLSX from 'xlsx'
function load(path, modules={}) {
 const js=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText
 const module={exports:{}};vm.runInNewContext(js,{module,exports:module.exports,Intl,require:n=>modules[n]});return module.exports
}
const ranking=load('lib/padel-ranking.ts');const countries=load('lib/countries.ts')
const importer=load('lib/spa-workbook-import.ts',{'./padel-ranking':ranking,'./countries':countries})
const workbook=process.env.SPA_WORKBOOK_PATH
const book=XLSX.readFile(workbook)
const sheets=Object.fromEntries(book.SheetNames.map(n=>[n,XLSX.utils.sheet_to_json(book.Sheets[n],{header:1,raw:true,defval:null})]))
const payload=importer.parseSPAWorkbookSheets(sheets)
if(process.env.SPA_PAYLOAD_PATH)fs.writeFileSync(process.env.SPA_PAYLOAD_PATH,JSON.stringify(payload))
test('Actual four-tab workbook parses all 99 immutable players and 104 paired results',()=>{
 assert.equal(payload.players.length,99);assert.equal(payload.results.length,104)
})
test('Import rejects duplicate identities, mismatched partners and impossible statistics',()=>{
 for(const mutate of [p=>p.players.push(p.players[0]),p=>p.results[0].partner_canonical_id=p.results[0].canonical_player_id,p=>p.results[0].match_wins=999]){
  const p=JSON.parse(JSON.stringify(payload));mutate(p);assert.throws(()=>importer.validateSPAWorkbookImport(p))
 }
})
test('Official rules and every required tab are mandatory',()=>{
 const changed=JSON.parse(JSON.stringify(sheets));changed['Points rules'][1][1]=123;assert.throws(()=>importer.parseSPAWorkbookSheets(changed))
 const missing={...sheets};delete missing['Developer notes'];assert.throws(()=>importer.parseSPAWorkbookSheets(missing))
})
test('Database standings reproduce every handoff rank and total',()=>{
 const live=JSON.parse(fs.readFileSync(process.env.SPA_LIVE_STATE_PATH,'utf8'))
 const fixture=JSON.parse(fs.readFileSync('data/spa-handoff-2026.json','utf8'))
 const parity=load('lib/spa-handoff.ts',{'@/data/spa-handoff-2026.json':fixture})
 const rows=live.players.map(p=>({...p,display_name:[p.first_name,p.last_name].filter(Boolean).join(' '),total_points:0,titles:0,runner_up_finishes:0,match_wins:0,matches_played:0,group_points_won:0,group_points_possible:0}))
 for(const r of live.results){const p=rows.find(p=>p.id===r.player_id);if(!p)continue;p.total_points+=r.points_awarded;p.titles+=Number(r.finishing_position==='winner');p.runner_up_finishes+=Number(r.finishing_position==='runner_up');for(const k of ['match_wins','matches_played','group_points_won','group_points_possible'])p[k]+=r[k]}
 const report=parity.checkSPAWorkbookParity(ranking.computeDenseRanks(rows));assert.equal(report.passed,true,report.issues.join('\n'))
})
