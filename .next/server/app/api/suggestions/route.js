"use strict";(()=>{var e={};e.id=152,e.ids=[152],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},7796:(e,t,s)=>{s.r(t),s.d(t,{originalPathname:()=>d,patchFetch:()=>m,requestAsyncStorage:()=>g,routeModule:()=>l,serverHooks:()=>c,staticGenerationAsyncStorage:()=>p});var r={};s.r(r),s.d(r,{POST:()=>u});var o=s(9303),n=s(8716),i=s(670),a=s(7070);async function u(e){try{let t=e.headers.get("x-groq-api-key");if(!t||""===t.trim())return a.NextResponse.json({error:"API key required",message:"Please provide your Groq API key in settings"},{status:401});let{transcriptContext:s,systemPrompt:r}=await e.json();if(!s||""===s.trim())return a.NextResponse.json({error:"Transcript context required"},{status:400});let o=r||`You are an AI assistant helping someone during a live meeting or conversation. Your job is to generate exactly 3 helpful suggestions based on the conversation transcript.

Each suggestion must be one of these types:
- question: A relevant question to ask next
- talking_point: A useful point to bring up
- answer: A possible answer to a question that was asked
- fact_check: Verification or correction of something said
- clarification: Help clarify something confusing

Rules:
1. Return EXACTLY 3 suggestions
2. Each preview must deliver immediate value (don't just tease)
3. Adapt to the conversation context
4. Be concise and actionable
5. Return valid JSON only

Response format:
{
  "suggestions": [
    {
      "type": "question",
      "title": "Short title",
      "preview": "Full helpful content that delivers value"
    }
  ]
}`,n=`Based on this conversation transcript, generate exactly 3 helpful suggestions:

${s}

Remember: Return EXACTLY 3 suggestions in valid JSON format.`,i=new AbortController,u=setTimeout(()=>i.abort(),3e4);try{let e=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${t}`,"Content-Type":"application/json"},body:JSON.stringify({model:"llama-3.3-70b-versatile",messages:[{role:"system",content:o},{role:"user",content:n}],temperature:.7,max_tokens:1e3,response_format:{type:"json_object"}}),signal:i.signal});if(clearTimeout(u),!e.ok){let t=await e.text();if(console.error("Groq API error:",t),401===e.status)return a.NextResponse.json({error:"Invalid API key",message:"The provided API key is invalid or expired"},{status:401});if(429===e.status)return a.NextResponse.json({error:"Rate limit exceeded",message:"Too many requests. Please try again later."},{status:429});return a.NextResponse.json({error:"Suggestion generation failed",message:t||"Failed to generate suggestions"},{status:e.status})}let s=await e.json(),r=s.choices?.[0]?.message?.content;if(!r)throw Error("No content in response");let l=JSON.parse(r).suggestions||[];if(!Array.isArray(l)||0===l.length)throw Error("Invalid suggestions format");let g=l.slice(0,3).map((e,t)=>({id:`suggestion-${Date.now()}-${t}`,type:e.type||"talking_point",title:e.title||"Suggestion",preview:e.preview||""}));return a.NextResponse.json({suggestions:g})}catch(e){if(clearTimeout(u),e instanceof Error&&"AbortError"===e.name)return a.NextResponse.json({error:"Request timeout",message:"Suggestion generation timed out. Please try again."},{status:504});throw e}}catch(e){return console.error("Suggestions error:",e),a.NextResponse.json({error:"Internal server error",message:e instanceof Error?e.message:"Unknown error occurred"},{status:500})}}let l=new o.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/suggestions/route",pathname:"/api/suggestions",filename:"route",bundlePath:"app/api/suggestions/route"},resolvedPagePath:"C:\\Users\\prudh\\Downloads\\twinMIND\\src\\app\\api\\suggestions\\route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:g,staticGenerationAsyncStorage:p,serverHooks:c}=l,d="/api/suggestions/route";function m(){return(0,i.patchFetch)({serverHooks:c,staticGenerationAsyncStorage:p})}}};var t=require("../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[948,972],()=>s(7796));module.exports=r})();