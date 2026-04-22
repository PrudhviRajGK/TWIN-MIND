"use strict";(()=>{var e={};e.id=744,e.ids=[744],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6592:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>d,patchFetch:()=>g,requestAsyncStorage:()=>p,routeModule:()=>c,serverHooks:()=>u,staticGenerationAsyncStorage:()=>l});var n={};r.r(n),r.d(n,{POST:()=>i});var o=r(9303),s=r(8716),a=r(670);async function i(e){try{let t=e.headers.get("x-groq-api-key");if(!t||""===t.trim())return new Response(JSON.stringify({error:"API key required",message:"Please provide your Groq API key in settings"}),{status:401,headers:{"Content-Type":"application/json"}});let{message:r,transcriptContext:n,systemPrompt:o}=await e.json();if(!r||""===r.trim())return new Response(JSON.stringify({error:"Message required"}),{status:400,headers:{"Content-Type":"application/json"}});let s=o||`You are an AI meeting copilot assistant. Your role is to help users during live conversations and meetings by:

1. Clarifying topics and concepts discussed
2. Answering questions about the conversation
3. Providing insights and context
4. Offering detailed explanations
5. Fact-checking and verifying information
6. Suggesting next steps or actions

Guidelines:
- Be concise but thorough
- Reference the conversation context when relevant
- Provide actionable insights
- Be professional and helpful
- If you're unsure, acknowledge it
- Focus on being a helpful meeting companion

Always consider the full conversation context when responding.`,a=r;n&&n.trim()&&(a=`Conversation context:
${n}

User question: ${r}`);let i=new TextEncoder,c=new ReadableStream({async start(e){try{let r=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${t}`,"Content-Type":"application/json"},body:JSON.stringify({model:"llama-3.3-70b-versatile",messages:[{role:"system",content:s},{role:"user",content:a}],temperature:.7,max_tokens:2e3,stream:!0})});if(!r.ok){let t=await r.text();console.error("Groq API error:",t),e.enqueue(i.encode(`data: ${JSON.stringify({error:!0,message:"Failed to generate response"})}

`)),e.close();return}let n=r.body?.getReader();if(!n)throw Error("No response body");let o=new TextDecoder,c="";for(;;){let{done:t,value:r}=await n.read();if(t){e.close();break}let s=(c+=o.decode(r,{stream:!0})).split("\n");for(let t of(c=s.pop()||"",s))if(t.startsWith("data: ")){let r=t.slice(6);if("[DONE]"===r){e.close();return}try{let t=JSON.parse(r),n=t.choices?.[0]?.delta?.content;n&&e.enqueue(i.encode(`data: ${JSON.stringify({content:n})}

`))}catch(e){}}}}catch(t){console.error("Streaming error:",t),e.enqueue(i.encode(`data: ${JSON.stringify({error:!0,message:t instanceof Error?t.message:"Unknown error"})}

`)),e.close()}}});return new Response(c,{headers:{"Content-Type":"text/event-stream","Cache-Control":"no-cache",Connection:"keep-alive"}})}catch(e){return console.error("Chat error:",e),new Response(JSON.stringify({error:"Internal server error",message:e instanceof Error?e.message:"Unknown error occurred"}),{status:500,headers:{"Content-Type":"application/json"}})}}let c=new o.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/chat/route",pathname:"/api/chat",filename:"route",bundlePath:"app/api/chat/route"},resolvedPagePath:"C:\\Users\\prudh\\Downloads\\twinMIND\\src\\app\\api\\chat\\route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:p,staticGenerationAsyncStorage:l,serverHooks:u}=c,d="/api/chat/route";function g(){return(0,a.patchFetch)({serverHooks:u,staticGenerationAsyncStorage:l})}},9303:(e,t,r)=>{e.exports=r(517)}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),n=t.X(0,[948],()=>r(6592));module.exports=n})();