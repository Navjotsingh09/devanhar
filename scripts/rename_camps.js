const fs=require("fs");
const files=["components/hero-option-a.tsx","components/camp-application-form.tsx","components/site-footer.tsx","components/projects-page-content.tsx","components/platform-section.tsx","components/team-section.tsx","components/team-page-content.tsx","components/media-page-content.tsx","components/testimonials-section.tsx","components/shop-content.tsx","components/donate-content.tsx","components/wolfrun/wolfrun-content.tsx","components/wolfrun/fundraiser-page-content.tsx","components/initiative-page-layout.tsx","app/initiatives/singhs-camp/singhs-camp-content.tsx","app/initiatives/singhs-camp/page.tsx","app/initiatives/singhs-camp-eu/page.tsx","app/initiatives/kaurs-camp/page.tsx","app/page.tsx","app/projects/page.tsx","app/media/page.tsx","app/donate/page.tsx","app/events/wolfrun/page.tsx","lib/resend-email.ts","lib/camp-applicant-emails.ts","lib/camp-application-notifier.ts","lib/blog.ts","lib/site-images.ts","app/api/camp-applications/route.ts","app/api/webhooks/beacon/route.ts"];
let n=0;
for(const f of files){
  try{
    let c=fs.readFileSync(f,"utf8");
    const o=c;
    c=c.replace(/Singhs Camp EU/g,"___SCE___");
    c=c.replace(/Singhs Camp Pack/g,"___SCP___");
    c=c.replace(/Kaurs Camp Pack/g,"___KCP___");
    c=c.replace(/Singhs Camp/g,"Singhs Camp UK");
    c=c.replace(/Kaurs Camp/g,"Kaurs Camp UK");
    c=c.replace(/___SCE___/g,"Singhs Camp EU");
    c=c.replace(/___SCP___/g,"Singhs Pack");
    c=c.replace(/___KCP___/g,"Kaurs Pack");
    c=c.replace(/Singhs Camp UK UK/g,"Singhs Camp UK");
    c=c.replace(/Kaurs Camp UK UK/g,"Kaurs Camp UK");
    if(c!==o){fs.writeFileSync(f,c);console.log("Updated: "+f);n++}
  }catch(e){console.log("Skip: "+f+" "+e.message)}
}
console.log("Done: "+n+" files updated");
