import {readdirSync,writeFileSync,mkdirSync} from 'node:fs'
import {spawnSync} from 'node:child_process'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'

// Offline behavioural regressions. This does not sign in, publish content,
// alter accounts, submit public forms or execute database migrations.
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const excluded=[{file:'scripts/test-spa-import.mjs',reason:'Requires the original SPA source workbook, which is not included in this checkout.'}]
const files=readdirSync(resolve(root,'scripts')).filter(n=>/^test-.*\.mjs$/.test(n)).map(n=>'scripts/'+n).filter(n=>!excluded.some(e=>e.file===n)).sort()
const startedAt=new Date().toISOString()
const result=spawnSync(process.execPath,['--test','--test-reporter=tap',...files],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024,timeout:180000})
const output=(result.stdout??'')+(result.stderr??'')
const count=name=>Number(output.match(new RegExp('^# '+name+' (\\d+)\\s*$','m'))?.[1]??0)
const report={startedAt,finishedAt:new Date().toISOString(),scope:'Offline code regressions, not authenticated browser or production acceptance',passed:result.status===0&&!result.error,exitCode:result.status,error:result.error?.message??null,tests:count('tests'),pass:count('pass'),fail:count('fail'),skipped:count('skipped'),files,excluded,notCoveredByThisRun:['Live database migration and permission verification; consult the latest release record','Authenticated Super Admin and Admin browser scenarios','Production deployment and post-release verification']}
const destination=resolve(process.argv[2]??'/tmp/devanhaar-admin-acceptance.json')
mkdirSync(dirname(destination),{recursive:true})
writeFileSync(destination,JSON.stringify(report,null,2)+'\n')
writeFileSync(destination.replace(/\.json$/,'')+'.tap',output)
console.log(JSON.stringify({...report,report:destination},null,2))
if(!report.passed){console.error(output.slice(-12000));process.exitCode=1}
