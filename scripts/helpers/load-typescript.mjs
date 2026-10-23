import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import {createRequire} from 'node:module'
import ts from 'typescript'
const require=createRequire(import.meta.url)
export function loadTypeScript(file,mocks={},cache=new Map()){
 file=path.resolve(file)
 if(cache.has(file))return cache.get(file).exports
 const module={exports:{}};cache.set(file,module)
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
 const importModule=name=>{
  if(name in mocks)return mocks[name]
  if(name==='server-only')return {}
  if(name.endsWith('.css'))return {}
  if(name.startsWith('.')||name.startsWith('@/')){
   const base=name.startsWith('@/')?path.resolve(name.slice(2)):path.resolve(path.dirname(file),name)
   for(const candidate of [base,base+'.ts',base+'.tsx',base+'.json',base+'/index.ts'])if(fs.existsSync(candidate)&&fs.statSync(candidate).isFile())return candidate.endsWith('.json')?JSON.parse(fs.readFileSync(candidate,'utf8')):loadTypeScript(candidate,mocks,cache)
  }
  return require(name)
 }
 vm.runInNewContext(code,{module,exports:module.exports,require:importModule,URL,Request,Response,Headers,Buffer,Date,console,process,WeakSet,Set,Map,Object,JSON,Uint8Array,crypto:globalThis.crypto},{filename:file})
 return module.exports
}
