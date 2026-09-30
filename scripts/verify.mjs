import { readFile,readdir,stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { sampleIdentity,demoEvents,confirmDemo,registrationSchema } from '../src/demoService.ts';
assert.equal(confirmDemo([]).ok,false);
assert.equal(confirmDemo([9999]).ok,false);
assert.equal(confirmDemo([demoEvents[0].id]).ok,true);
assert.match(confirmDemo([1]).message,/No booking/);
await registrationSchema.validate(sampleIdentity);
await assert.rejects(()=>registrationSchema.validate({...sampleIdentity,name:''}));
await assert.rejects(()=>registrationSchema.validate({...sampleIdentity,phone:'invalid'}));
async function walk(root){let files=[];for(const e of await readdir(root,{withFileTypes:true})){let p=root+'/'+e.name;files.push(...(e.isDirectory()?await walk(p):[p]));}return files;}
const assets=await walk('dist');for(const f of assets)assert.ok((await stat(f)).size<25*1024*1024,`${f} exceeds Pages cap`);
for(const p of await walk('src')){if(!/\.(tsx?|css|scss)$/.test(p))continue;let s=await readFile(p,'utf8');assert.ok(!/https:\/\/res\.cloudinary|bits-oasis\.org\/2026\/main|axios\.|GoogleLogin|GoogleOAuthProvider|useCookies|(?:local|session)Storage\./.test(s),`Legacy remote dependency: ${p}`);for(const m of s.matchAll(/url\(["']?(\/fonts\/[^"')]+)["']?\)/g))await stat('public'+m[1]);}
assert.equal((await readFile('index.html','utf8')).match(/rel="canonical"/g).length,1);
console.log(`PASS: sample form validation, empty/invalid/valid demo confirmation, ${assets.length} deployment assets below 25 MiB, fonts, local artwork, no legacy APIs/OAuth/storage, single canonical.`);
