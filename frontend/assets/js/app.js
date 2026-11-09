(()=>{var gn=Object.defineProperty;var Ge=(e,t)=>{for(var s in t)gn(e,s,{get:t[s],enumerable:!0})};var rs="judgment.api_base",is="http://127.0.0.1:9200",be=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function Fs(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function Ie(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${Fs(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function os(e){let t=Ie(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function ls(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?Ie(e.get("api")):null}catch{return null}}function cs(){try{let e=window.localStorage.getItem(rs);return e===null?null:Ie(e)}catch{return null}}function ds(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return Ie(e||"")}function De(){let e=ls();if(e!==null)return e;let t=cs();if(t!==null)return t;let s=ds();return s||(window.location.protocol==="file:"?is:"")}function fn(){if(ls()!==null)return!0;let e=cs();return e!==null?!!e:!!ds()}function Oe(){return ls()!==null?"query":cs()!==null?"storage":ds()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function At(){return fn()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!Fs(window.location.hostname)}function us(e){let t=Ie(e);try{t?window.localStorage.setItem(rs,t):window.localStorage.removeItem(rs)}catch{}return t}function ze(e=De()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function Ae(e,t=De()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function ps(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function V(e,t={}){let s=De(),a=new AbortController,r=t.timeout===void 0?3e4:t.timeout,i=r>0?window.setTimeout(()=>a.abort(),r):null,o=Date.now(),c=performance.now(),g=t.requestId||Hs(),$={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":g,"X-Judgment-Client-Started-At":String(o),...t.headers||{}},S;try{S=await fetch(Ae(e,s),{...t,headers:$,signal:a.signal})}catch(_){throw _.name==="AbortError"?new be("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new be(ps(s),0,_)}finally{i&&window.clearTimeout(i)}let y=null;if((S.headers.get("content-type")||"").includes("application/json"))try{y=await S.json()}catch{y=null}else try{y=await S.text()}catch{y=null}let x=performance.now(),b=S.headers.get("X-Judgment-Request-Id")||g;if(t.trackClient!==!1&&b){let _=Math.round(performance.now()-c);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{Us({request_id:b,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:_,render_ms:Math.max(0,Math.round(performance.now()-x)),status:S.ok?"success":"failed"})})})}if(!S.ok){let _=y&&typeof y=="object"?y.detail||y.message:y,P=typeof _=="string"&&_?_:`\u4F3A\u670D\u5668\u56DE\u61C9 ${S.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new be(P,S.status,_)}return y}function Hs(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function Us(e){try{fetch(Ae("/api/performance/client",De()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),keepalive:!0}).catch(()=>{})}catch{}}async function Js(e){let t=Ie(e);if(!os(t))throw new be("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,r=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(Ae("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new be(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof be?i:i.name==="AbortError"?new be("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new be(ps(t),0,i)}finally{window.clearTimeout(r)}}var F={health(){return V("/api/health")},status(){return V("/api/status",{trackClient:!1})},systemUsage(){return V("/api/system-usage",{trackClient:!1})},indexVersions(){return V("/api/index-versions",{trackClient:!1})},indexVersion(e){return V(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return V(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return V(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return V("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){let t=new URLSearchParams({repair:e?"true":"false"});return V(`/api/index-alias/reconcile?${t.toString()}`,{trackClient:!1})},catalog(){return V("/api/catalog")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return V("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},schemaSuggest({database:e,table:t,column:s,query:a,limit:r=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(r)});return V(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let r=new URLSearchParams({law_key:e});return t&&r.set("source_type",t),s&&r.set("version_id",String(s)),a&&r.set("article_no",String(a)),V(`/api/law?${r.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),V(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return V("/api/test-mode",{trackClient:!1})},setTestMode(e){return V("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return V(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return V("/api/test-runs/current",{trackClient:!1})},testRun(e){return V(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return V("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[r,i]of Object.entries(e))i==null||i===""||a.set(r,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),V(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return V("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return V("/api/processing",{timeout:45e3,trackClient:!1})},questionBankStats(){return V("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[r,i]of Object.entries(e))i==null||i===""||a.set(r,String(i));return a.set("limit",String(t)),a.set("offset",String(s)),V(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return V(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return V("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateQuestionBankItem(e,t){return V(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return V(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return V(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return V("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return V(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return V("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return V(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return V("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return V("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return V(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return V(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return V(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return V("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return V(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return V(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return V(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return V("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return V(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return V("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return V(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return V("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return V("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return V("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onToken:r=null,onTokenReset:i=null}={}){let o=De(),c=new AbortController,g=t?0:3e5,$=g>0?window.setTimeout(()=>c.abort(),g):null,S=Date.now(),y=performance.now(),w=Hs(),x={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":w,"X-Judgment-Client-Started-At":String(S)},b;try{b=await fetch(Ae("/api/rag/query/stream",o),{method:"POST",headers:x,body:JSON.stringify({question:e}),signal:c.signal})}catch(Z){throw Z.name==="AbortError"?new be("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new be(ps(o),0,Z)}finally{$&&window.clearTimeout($)}if(!b.ok){let Z=null;try{Z=await b.json()}catch{Z=null}let R=Z&&typeof Z=="object"&&Z.detail?String(Z.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${b.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new be(R,b.status,Z)}if(!b.body)throw new be("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let _=b.body.getReader(),P=new TextDecoder,N="",M=null,D=null;try{for(;;){let{value:Z,done:R}=await _.read();if(R)break;N+=P.decode(Z,{stream:!0});let E=N.indexOf(`

`);for(;E>=0;){let B=N.slice(0,E).replace(/\r/g,"");N=N.slice(E+2);let L="message",p=[];for(let m of B.split(`
`))m.startsWith("event:")?L=m.slice(6).trim():m.startsWith("data:")&&p.push(m.slice(5).trimStart());if(p.length){let m=null;try{m=JSON.parse(p.join(`
`))}catch{m=null}if(m)if(L==="step"&&typeof s=="function")try{s(m)}catch{}else if(L==="partial"){if(typeof a=="function")try{a(m)}catch{}}else if(L==="token"){if(typeof r=="function")try{r(String(m.text||""))}catch{}}else if(L==="token_reset"){if(typeof i=="function")try{i()}catch{}}else L==="result"?M=m:L==="error"&&(D=new be(m.message||m.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,m))}E=N.indexOf(`

`)}}}finally{try{await _.cancel()}catch{}$&&window.clearTimeout($)}if(D)throw D;if(!M)throw new be("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let z=Math.round(performance.now()-y);return Us({request_id:w,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:z,render_ms:0,status:"success"}),M}};var vn={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},bn={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},hn={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},$n={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Qs={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function n(e){return String(e??"").replace(/[&<>"']/g,t=>vn[t])}function f(e,t=16,s=""){let a=Qs[e]||Qs.info;return`<svg${s?` class="${n(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function u(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function X(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function ms(e){if(e instanceof Date)return e;if(typeof e=="number"){let r=new Date(e);return Number.isNaN(r.getTime())?null:r}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function Le(e){let t=ms(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?n(e):"\u2014"}function ne(e){let t=ms(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?n(e):"\u2014"}function it(e){let t=ms(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:Le(t)}function G(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Me(e){return bn[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function re(e,t){let s=Me(e);return`<span class="badge ${hn[s.tone]}"><span class="status-dot ${$n[s.tone]}"></span>${n(t||s.label)}</span>`}function yn(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${n(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function Lt(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function Mt(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return re(String(e));case"source":return yn(String(e));case"number":return`<span class="mono">${u(e)}</span>`;case"duration":return`<span class="mono">${G(e)}</span>`;case"datetime":return`<span class="mono">${ne(e)}</span>`;case"date":return`<span class="mono">${Le(e)}</span>`;case"url":{let s=String(e),a=Lt(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${n(s)}" target="_blank" rel="noopener noreferrer" title="${n(s)}">${f("external",10)}${n(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${n(s)}">${n(Lt(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(Lt(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(Lt(s,90))}</span>`}}}function te({tone:e="info",title:t,text:s,iconName:a="info"}){let r=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${r==="i"?"i":f(r,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${n(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function ye({iconName:e="search",title:t,text:s="",actions:a="",className:r=""}){return`<div class="empty-state ${r}">
    <span class="empty-icon">${f(e,24)}</span>
    <h3 class="empty-title">${n(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function ae(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${n(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function C(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let r={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${r[t]||"i"}</span>
    <div class="toast-body">${n(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function Tt(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function Te(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),r=URL.createObjectURL(a),i=document.createElement("a");i.href=r,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(r),1e3)}var zs="judgment.theme",gs="nvidia",Vs=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#171717","#0070f3","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#1d1d1f","#0071e3","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#5e6ad2","#010102","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#f24e1e","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#191918","#0075de","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],fs=new Map(Vs.map(e=>[e.id,e]));function wn(e){return fs.has(e)}function _n(e){return fs.get(e)||fs.get(gs)}function kn(){try{let e=window.localStorage.getItem(zs);return wn(e)?e:gs}catch{return gs}}function Gs(e,{persist:t=!0}={}){let s=_n(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");a&&a.setAttribute("content",s.metaColor);let r=document.getElementById("theme-label");r&&(r.textContent=s.name);let i=document.getElementById("theme-swatches");if(i&&(i.innerHTML=s.swatches.map(o=>`<i class="style-swatch" style="--swatch:${n(o)}"></i>`).join("")),document.querySelectorAll(".theme-option").forEach(o=>{let c=o.dataset.themeId===s.id;o.classList.toggle("is-active",c),o.setAttribute("aria-checked",c?"true":"false")}),t)try{window.localStorage.setItem(zs,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}function Sn(e){let t=Vs.map((s,a)=>{let r=s.swatches.map(i=>`<i style="--swatch:${n(i)}"></i>`).join("");return`<button class="theme-option" type="button" role="menuitemradio"
        data-theme-id="${s.id}" aria-checked="false">
        <span class="theme-option-index">${String(a+1).padStart(2,"0")}</span>
        <span class="theme-option-body">
          <span class="theme-option-name">${n(s.name)}</span>
          <span class="theme-option-desc">${n(s.description)}</span>
        </span>
        <span class="theme-option-swatches" aria-hidden="true">${r}</span>
        <span class="theme-option-check" aria-hidden="true">${f("check",14)}</span>
      </button>`}).join("");e.innerHTML=`<div class="style-menu-head">
      <strong>\u9078\u64C7\u4ECB\u9762\u98A8\u683C</strong>
      <span>10 \u7A2E\u79D1\u6280\u54C1\u724C\u8A9E\u8A00</span>
    </div>${t}`}function Ws(){let e=document.getElementById("style-picker"),t=document.getElementById("style-trigger"),s=document.getElementById("style-menu");if(!e||!t||!s)return;Sn(s),Gs(kn(),{persist:!1});let a=()=>Array.from(s.querySelectorAll(".theme-option")),r=()=>{s.hidden=!1,t.setAttribute("aria-expanded","true");let o=s.querySelector(".theme-option.is-active")||a()[0];o&&o.focus()},i=({restoreFocus:o=!1}={})=>{s.hidden||(s.hidden=!0,t.setAttribute("aria-expanded","false"),o&&t.focus())};t.addEventListener("click",()=>{s.hidden?r():i({restoreFocus:!0})}),t.addEventListener("keydown",o=>{(o.key==="ArrowDown"||o.key==="ArrowUp")&&(o.preventDefault(),r())}),s.addEventListener("click",o=>{let c=o.target.closest(".theme-option");c&&(Gs(c.dataset.themeId),i({restoreFocus:!0}))}),s.addEventListener("keydown",o=>{let c=a(),g=c.indexOf(document.activeElement);if(o.key==="Escape"){o.preventDefault(),i({restoreFocus:!0});return}if(o.key==="ArrowDown"||o.key==="ArrowUp"){o.preventDefault();let $=o.key==="ArrowDown"?1:-1,S=c[(g+$+c.length)%c.length];S&&S.focus();return}if(o.key==="Home"||o.key==="End"){o.preventDefault();let $=o.key==="Home"?c[0]:c[c.length-1];$&&$.focus()}}),document.addEventListener("pointerdown",o=>{e.contains(o.target)||i()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&i()})}var js={};Ge(js,{render:()=>Kr});var xn="judgment-console";var xe="query_history",Fe="settings";var _e={history:[],settings:new Map,nextId:1},jt=null,we=!("indexedDB"in window);function Ve(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function Re(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function He(){return jt||(jt=new Promise((e,t)=>{if(!("indexedDB"in window)){we=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(xn,1)}catch(a){we=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(xe)){let r=a.createObjectStore(xe,{keyPath:"id",autoIncrement:!0});r.createIndex("created_at","created_at"),r.createIndex("kind","kind")}a.objectStoreNames.contains(Fe)||a.createObjectStore(Fe,{keyPath:"key"})},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{we=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{we=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),jt)}function Ks(){return"indexedDB"in window}function Ys(){return we}function Et(){return we?"memory":"indexeddb"}function qn(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t}}async function An(){try{let t=(await He()).transaction(xe,"readwrite"),s=t.objectStore(xe),a=await Ve(s.count());if(a>120){let r=a-120,i=s.index("created_at").openCursor();await new Promise((o,c)=>{i.onsuccess=()=>{let g=i.result;if(!g||r<=0){o();return}g.delete(),r-=1,g.continue()},i.onerror=()=>c(i.error)})}await Re(t)}catch{we=!0}}async function Rt(e){let t=qn(e);try{let a=(await He()).transaction(xe,"readwrite"),r=a.objectStore(xe),i=await Ve(r.add(t));return await Re(a),await An(),i}catch{we=!0;let a=_e.nextId++;return _e.history.push({id:a,...t}),_e.history.length>120&&_e.history.shift(),a}}async function Xs(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let r=(await He()).transaction(xe,"readwrite"),i=r.objectStore(xe),o=await Ve(i.get(s));if(!o)return await Re(r),null;let c={...o,...t,id:s};return await Ve(i.put(c)),await Re(r),c}catch{we=!0;let r=_e.history.findIndex(i=>Number(i.id)===s);return r===-1?null:(_e.history[r]={..._e.history[r],...t,id:s},_e.history[r])}}async function Ct({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let r=(await He()).transaction(xe,"readonly"),i=r.objectStore(xe),o=await Ve(i.getAll());return await Re(r),o.filter(c=>s?`${c.kind} ${c.title} ${c.detail}`.toLowerCase().includes(s):!0).sort((c,g)=>String(g.created_at).localeCompare(String(c.created_at))).slice(0,t)}catch{return we=!0,_e.history.filter(r=>s?`${r.kind} ${r.title} ${r.detail}`.toLowerCase().includes(s):!0).slice().sort((r,i)=>String(i.created_at).localeCompare(String(r.created_at))).slice(0,t)}}async function Zs(){try{let t=(await He()).transaction(xe,"readwrite");t.objectStore(xe).clear(),await Re(t)}catch{we=!0}_e.history=[]}async function Nt(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let r=(await He()).transaction(Fe,"readwrite");return r.objectStore(Fe).put(s),await Re(r),s}catch{return we=!0,_e.settings.set(s.key,s),s}}async function We(e,t=null){try{let a=(await He()).transaction(Fe,"readonly"),r=a.objectStore(Fe),i=await Ve(r.get(String(e)));return await Re(a),i?i.value:t}catch{we=!0;let a=_e.settings.get(String(e));return a?a.value:t}}async function ea({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await He()).transaction(Fe,"readonly"),r=a.objectStore(Fe),i=await Ve(r.getAll());return await Re(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,c)=>String(o.key).localeCompare(String(c.key)))}catch{return we=!0,Array.from(_e.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function ta(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var Ms={};Ge(Ms,{render:()=>Cr,renderTestFlowPanel:()=>ct});var Ln={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},Mn=new Set(["running","stopping"]);function Bt(e){let[t,s]=Ln[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${n(t)}</span>`}function Pt(e){return String(e).padStart(2,"0")}function ot(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${Pt(t.getMonth()+1)}-${Pt(t.getDate())} ${Pt(t.getHours())}:${Pt(t.getMinutes())}`}function ht(e){return Mn.has(e)}function Ce(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function Ke(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function Ue(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${n(e)}</span>
    <strong>${n(String(t))}</strong>
    ${s?`<small>${n(s)}</small>`:""}
  </div>`}function sa(e={}){let t=e.score_components||e;return`<div class="bench-metrics">
    ${Ue("Law Recall",Ke(t.law_recall))}
    ${Ue("Article Recall",Ke(t.article_recall))}
    ${Ue("Citation Valid",Ke(t.citation_valid_rate))}
    ${Ue("Judge",Ce(t.judge_overall))}
    ${Ue("Human",Ce(t.human_overall))}
    ${Ue("p50",G(e.duration_p50_ms))}
    ${Ue("p95",G(e.duration_p95_ms))}
    ${Ue("Success",`${u(e.success||0)} / ${u(e.total||0)}`)}
  </div>`}function aa(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${n(s.replace(/^rag\./,""))}</span>
      <strong>${G(a.p50_ms)}</strong>
      <small>p95 ${G(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function na(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${Ke(s.law_recall)}</span>
    <span>Article ${Ke(s.article_recall)}</span>
    <span>Judge ${Ce(s.judge_overall)}</span>
    <span>p95 ${G(t.duration_p95_ms)}</span>`}function ra(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function ia(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${n(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${n(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${n(e.status||"")}">${Bt(e.status)}</span>
      <span class="mono">${n(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${n(ne(e.started_at))}</span>
      <span data-bench-slot="run-completed">${u(e.completed_cases||0)} / ${u(e.total_cases||0)} \u984C</span>
      <span>${n(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${n(ra(e))}">${na(e)}</span>
  </button>`}function bs(e,t=[]){let s=e.metrics||{},a=e.judge||{},r=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},c=Object.entries(o).filter(([$])=>$.startsWith("rag.")).map(([$,S])=>`<span class="chip">${n($)} ${G(S)}</span>`).join(""),g=(e.law_sources||[]).map($=>`<span class="chip">${n($.law_name||"\u6CD5\u898F")} ${u(($.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${n(e.question)}</span>
      ${Bt(e.status)}
      <span class="bench-case-time">${G(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${Ce(i.deterministic)} \xB7 Judge ${Ce(i.judge)} \xB7 Human ${Ce(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${n((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${n(e.fingerprint||"")}">${f("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
      </div>
      <div class="bench-case-stages">${c||'<span class="qb-muted">\u6C92\u6709 stage timing</span>'}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${Ke(s.law_recall)}</span>
        <span>Article recall ${Ke(s.article_recall)}</span>
        <span>Citation ${s.citation_valid?"valid":"invalid"}</span>
        <span>Refusal ${s.refusal_correct===null?"\u2014":s.refusal_correct?"correct":"wrong"}</span>
      </div>
      <div class="chips">${g||'<span class="qb-muted">\u6C92\u6709\u6CD5\u898F\u4F86\u6E90</span>'}</div>
      <div class="bench-answer"><strong>\u56DE\u7B54</strong><p>${n(e.answer||"\u2014")}</p></div>
      <div class="bench-judge"><strong>LLM judge</strong><p>${n(a.rationale||a.reason||"\u2014")}</p><span>${[["correctness",a.correctness],["grounding",a.grounding],["citation",a.citation],["clarity",a.clarity],["overall",a.overall]].map(([$,S])=>`${$} ${S??"\u2014"}`).join(" \xB7 ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${e.id}">
        <div class="bench-human-grid">
          ${[["correctness","\u6B63\u78BA\u6027",r.scores?.correctness??4],["grounding","\u6709\u64DA\u6027",r.scores?.grounding??4],["citation","\u5F15\u7528",r.scores?.citation??4],["clarity","\u6E05\u695A",r.scores?.clarity??4],["overall","\u6574\u9AD4",r.overall??4]].map(([$,S,y])=>`<label class="field"><span class="field-label">${S} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${$}" value="${n(String(y))}" /></label>`).join("")}
        </div>
        <label class="field"><span class="field-label">\u4EBA\u5DE5\u6279\u6CE8</span><input class="input" name="comment" value="${n(r.comment||"")}" placeholder="\u56DE\u7B54\u54C1\u8CEA\u3001\u5F15\u7528\u6216\u4E8B\u5BE6\u932F\u8AA4" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${f("check",13)}<span>\u5132\u5B58\u4EBA\u5DE5\u8A55\u5206</span></button>
      </form>
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map($=>`<div class="bench-history-row"><span>${n(ne($.run?.started_at))}</span><span>${n($.run?.config?.llm_model||"\u2014")}</span><span>Det ${Ce($.metrics?.scores?.deterministic)}</span><span>Judge ${Ce($.metrics?.scores?.judge)}</span><span>Human ${Ce($.metrics?.scores?.human)}</span><span>${G($.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function vs(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function oa(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${bs(e,t)}
  </details>`}function la(e){return`${Bt(e.status)}
    <span class="mono">${n(e.run_id)}</span>
    ${ht(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${n(e.run_id)}">${f("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function Tn(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${n(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${f("activity",14)}${n(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${n((e.status||"")+":"+e.run_id)}">
        ${la(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${sa(e.summary||{})}</div>
    <div data-bench-detail="stages">${aa(e.summary||{})}</div>
    <div class="bench-run-config">
      <span><strong>Suite</strong> v${e.suite_version} \xB7 ${u((e.suite_snapshot?.items||[]).length)} \u984C</span>
      <span><strong>Embedding</strong> ${n(e.config?.embedding_model||"\u2014")}</span>
      <span><strong>LLM</strong> ${n(e.config?.llm_model||"\u2014")}</span>
      <span><strong>Judge</strong> ${n(e.config?.judge_model||"\u2014")}</span>
      <span><strong>Index</strong> ${n(e.index_version?.physical_collection||"\u2014")}</span>
      <span><strong>Top K</strong> ${n(String(e.config?.top_k??"\u2014"))}</span>
      <span><strong>Law retrieval</strong> ${e.config?.enable_law_retrieval?"on":"off"}</span>
      <span><strong>Config hash</strong> <span class="mono">${n((e.config_hash||"").slice(0,16))}</span></span>
    </div>
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>oa(a,t[a.fingerprint]||[])).join(""):te({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function ca(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${f("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${n(e.run_id)}">${f("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function da(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),r=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,r-i):0,c=(t||[]).filter(b=>["success","failed"].includes(b.status)).map(b=>Number(b.duration_ms)||0).filter(b=>b>0),g=null;if(c.length)g=c.reduce((b,_)=>b+_,0)/c.length;else if(a>0){let b=Date.parse(e.updated_at||""),_=Number.isFinite(b)?b:i;Number.isFinite(_)&&_>i?g=(_-i)/a:o>0&&(g=o/a)}let $=(t||[]).find(b=>b.status==="running")||null,S=0;if(a<s&&g&&g>0){let b=$?Date.parse($.started_at||""):NaN,_=Date.parse(e.updated_at||""),P=Number.isFinite(b)?b:_;Number.isFinite(P)&&(S=Math.max(0,Math.min(.95,(r-P)/g)))}let y=Math.min(s,a+S),w=s>0?Math.max(0,Math.min(100,y/s*100)):0,x=g===null?null:Math.max(0,s-y)*g;return{total:s,completed:a,elapsedMs:o,averageMs:g,progress:w,etaMs:x,ratePerMin:g?6e4/g:null,running:$}}function ua(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${G(e)}`}function pa(e,t=[]){let s=da(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${n(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${u(s.completed)} / ${u(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${ua(s.etaMs)}</span>
      <span data-bench-slot="progress-rate">${s.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${s.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`}</span>
    </div>
    <div class="processing-bar processing-bar-lg bench-progress-bar${s.completed===0?" is-waiting":""}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.progress.toFixed(1)}" data-bench-slot="progress-bar">
      <span class="processing-bar-fill" data-bench-slot="progress-fill" style="width:${s.progress.toFixed(2)}%"></span>
    </div>
    <div class="bench-progress-foot">
      <span data-bench-slot="progress-elapsed">\u5DF2\u57F7\u884C ${G(s.elapsedMs)}</span>
      <span data-bench-slot="progress-average">${s.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${G(s.averageMs)}\uFF0F\u984C`}</span>
      <span>\u5373\u6642\u9810\u4F30 \xB7 \u6BCF\u5B8C\u6210\u4E00\u984C\u6821\u6B63</span>
    </div>
  </div>`}function jn(e){let t=e.models?.models||{},s=e.suites||[],a=bt(e),r=e.selectedRun;return`<section class="report-card bench-card">
    <div class="side-card-head">
      <span class="side-card-title">${f("brain",14)}RAG Benchmark</span>
      <span class="badge ${e.indexVersion?.physical_collection?"badge-ok":"badge-warn"}">${n(e.indexVersion?.physical_collection||"\u7D22\u5F15\u672A\u8A2D\u5B9A")}</span>
    </div>
    <form class="bench-form" data-bench-form="run">
      <div class="bench-form-grid">
        <label class="field"><span class="field-label">Benchmark \u984C\u5EAB</span><select class="select" name="suite_id">${s.map(i=>`<option value="${i.id}" ${e.selectedSuiteId===i.id?"selected":""}>${n(i.name)} \xB7 ${u(i.item_count)} \u984C</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Embedding</span><select class="select" name="embedding_model">${(t.embedding||[]).map(i=>`<option value="${n(i)}" ${i===e.config.embedding_model?"selected":""}>${n(i)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">LLM</span><select class="select" name="llm_model">${(t.llm||[]).map(i=>`<option value="${n(i)}" ${i===e.config.llm_model?"selected":""}>${n(i)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Judge model</span><select class="select" name="judge_model"><option value="">\u4E0D\u57F7\u884C LLM judge</option>${(t.llm||[]).map(i=>`<option value="${n(i)}" ${i===e.config.judge_model?"selected":""}>${n(i)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Top K</span><input class="input" type="number" min="1" max="20" name="top_k" value="${n(String(e.config.top_k||4))}" /></label>
        <label class="field"><span class="field-label">Score threshold</span><input class="input" type="number" min="0" max="1" step="0.01" name="score_threshold" value="${n(String(e.config.score_threshold||.35))}" /></label>
        <label class="field"><span class="field-label">\u91CD\u8907\u6B21\u6578</span><input class="input" type="number" min="1" max="5" name="repeats" value="${n(String(e.config.repeats||1))}" /></label>
        <label class="checkbox-field bench-check"><input type="checkbox" name="enable_law_retrieval" ${e.config.enable_law_retrieval?"checked":""} /><span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22</span></label>
        <label class="checkbox-field bench-check"><input type="checkbox" name="judge_enabled" ${e.config.judge_enabled?"checked":""} /><span>LLM judge</span></label>
      </div>
      <label class="field"><span class="field-label">Run \u6A19\u7C64</span><input class="input" name="label" value="${n(e.config.label||ot())}" /></label>
      <div class="qb-actions" data-bench-actions data-signature="${n(a?`${a.run_id}:${a.status}`:"")}">
        ${ca(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${n(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?pa(a,hs(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>ia(i,r?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${r?Tn(r,e.history):""}
  </section>`}function bt(e){let t=(e.runs||[]).find(s=>ht(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!ht(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function hs(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function ma(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:ot(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",pollTimer:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),r=p=>{let m=new FormData(p);return{label:String(m.get("label")||"").trim()||ot(),embedding_model:String(m.get("embedding_model")||""),llm_model:String(m.get("llm_model")||""),judge_model:String(m.get("judge_model")||""),top_k:Number(m.get("top_k")||4),score_threshold:Number(m.get("score_threshold")||.35),repeats:Number(m.get("repeats")||1),enable_law_retrieval:p.elements.enable_law_retrieval?.checked??!0,judge_enabled:p.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(p=>`${p.id}:${p.name}:${p.item_count}:${p.version}:${p.status}`)]:null,runs:(s.runs||[]).map(p=>`${p.run_id}:${p.label||""}:${p.suite_version||1}`)}),o=()=>{let m=a()?.querySelector("[data-bench-live]"),T=bt(s);if(!m||!T)return;let U=da(T,hs(s,T)),H=(J,I)=>{let K=m.querySelector(`[data-bench-slot="${J}"]`);K&&K.textContent!==I&&(K.textContent=I)};H("progress-count",`${u(U.completed)} / ${u(U.total)} \u984C`),H("progress-percent",`${U.progress.toFixed(1)}%`),H("progress-eta",ua(U.etaMs)),H("progress-rate",U.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${U.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),H("progress-elapsed",`\u5DF2\u57F7\u884C ${G(U.elapsedMs)}`),H("progress-average",U.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${G(U.averageMs)}\uFF0F\u984C`),H("progress-state",T.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let O=m.querySelector('[data-bench-slot="progress-bar"]');O&&(O.setAttribute("aria-valuenow",U.progress.toFixed(1)),O.classList.toggle("is-waiting",U.completed===0));let j=m.querySelector('[data-bench-slot="progress-fill"]');j&&(j.style.width=`${U.progress.toFixed(2)}%`)},c=p=>{let m=p.querySelector("[data-bench-actions]");if(!m)return;let T=bt(s),U=T?`${T.run_id}:${T.status}`:"";m.dataset.signature!==U&&(m.dataset.signature=U,m.innerHTML=ca(T))},g=p=>{let m=p.querySelector("[data-bench-live-wrap]");if(!m)return;let T=bt(s),U=T?`${T.run_id}:${T.status}:${T.total_cases}`:"";m.dataset.signature!==U&&(m.dataset.signature=U,m.innerHTML=T?pa(T,hs(s,T)):"")},$=p=>{let m=p.querySelector("[data-bench-runs]");if(!m)return;let T=s.runs||[],U=[...m.querySelectorAll("[data-run-id]")].map(O=>O.dataset.runId),H=T.map(O=>O.run_id);if(U.join("|")!==H.join("|")){m.innerHTML=T.length?T.map(O=>ia(O,s.selectedRun?.run_id===O.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let O of T){let j=m.querySelector(`[data-run-id="${O.run_id}"]`);if(!j)continue;j.classList.toggle("is-active",s.selectedRun?.run_id===O.run_id);let J=j.querySelector('[data-bench-slot="run-label"]');J&&J.textContent!==(O.label||"RAG Benchmark")&&(J.textContent=O.label||"RAG Benchmark");let I=j.querySelector('[data-bench-slot="run-status"]');I&&I.dataset.status!==(O.status||"")&&(I.dataset.status=O.status||"",I.innerHTML=Bt(O.status));let K=j.querySelector('[data-bench-slot="run-completed"]');if(K){let ve=`${u(O.completed_cases||0)} / ${u(O.total_cases||0)} \u984C`;K.textContent!==ve&&(K.textContent=ve)}let ee=j.querySelector('[data-bench-slot="run-scores"]'),fe=ra(O);ee&&ee.dataset.signature!==fe&&(ee.dataset.signature=fe,ee.innerHTML=na(O))}},S=p=>{let m=s.selectedRun;if(!m)return;let T=p.querySelector(`.bench-detail[data-run-id="${m.run_id}"]`);if(!T)return;let U=T.querySelector("[data-bench-detail-actions]");if(U){let ee=`${m.status||""}:${m.run_id}`;U.dataset.signature!==ee&&(U.dataset.signature=ee,U.innerHTML=la(m))}let H=T.querySelector('[data-bench-detail="metrics"]');if(H){let ee=JSON.stringify(m.summary||{});H.dataset.signature!==ee&&(H.dataset.signature=ee,H.innerHTML=sa(m.summary||{}))}let O=T.querySelector('[data-bench-detail="stages"]');if(O){let ee=JSON.stringify((m.summary||{}).stages||{});O.dataset.signature!==ee&&(O.dataset.signature=ee,O.innerHTML=aa(m.summary||{}))}let j=T.querySelector("[data-bench-cases]");if(!j)return;let J=m.cases||[];if(!J.length)return;let I=j.querySelector(".notice");I&&I.remove();let K=new Map([...j.querySelectorAll("details.bench-case")].map(ee=>[Number(ee.dataset.resultId),ee]));for(let ee of J){let fe=s.history[ee.fingerprint]||[],ve=vs(ee,fe),pe=K.get(Number(ee.id));if(!pe){j.insertAdjacentHTML("beforeend",oa(ee,fe)),pe=j.lastElementChild,pe&&(pe._benchSignature=ve);continue}if(pe._benchSignature===ve||!s.forcedCaseIds.delete(Number(ee.id))&&pe.contains(document.activeElement))continue;let Q=pe.open;pe.innerHTML=bs(ee,fe),pe.open=Q,pe._benchSignature=ve}},y=()=>{bt(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},w=()=>{let p=a();p&&(c(p),g(p),$(p),S(p),o(),y())},x=p=>{let m=s.selectedRun;if(!m)return;let T=p.querySelector('[data-bench-detail="metrics"]');T&&(T.dataset.signature=JSON.stringify(m.summary||{}));let U=p.querySelector('[data-bench-detail="stages"]');U&&(U.dataset.signature=JSON.stringify((m.summary||{}).stages||{}));let H=p.querySelector("[data-bench-cases]");if(!H)return;let O=new Map((m.cases||[]).map(j=>[Number(j.id),j]));for(let j of H.querySelectorAll("details.bench-case")){let J=O.get(Number(j.dataset.resultId));J&&(j._benchSignature=vs(J,s.history[J.fingerprint]||[]))}},b=(p=!1)=>{let m=a();if(!m)return;let T=i();if(!p&&s.renderSignature===T){w();return}s.renderSignature=T,s.forcedCaseIds.clear(),m.innerHTML=jn(s),x(m),w()},_=async({refreshAll:p=!1}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||p;return}s.loading=!0;try{if(!s.referenceLoaded||p){let[J,I]=await Promise.all([F.benchmarkModels(),F.benchmarkSuites()]);s.models=J,s.suites=I.suites||[],s.indexVersion=J.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=J.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=J.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(J.models?.llm||[]).find(K=>K!==s.config.llm_model)||"")}let m=await F.benchmarkRuns(30);s.runs=m.runs||[];let T=s.activeRunId,U=s.runs.find(J=>ht(J.status))||null;s.activeRunId=U?.run_id||"";let H=s.selectedRun?.run_id||"";H||(H=U?.run_id||s.runs[0]?.run_id||"");let O=!!(s.selectedRun&&T&&s.selectedRun.run_id===T);H&&(!s.selectedRun||s.selectedRun.run_id!==H||H===U?.run_id||O)?s.selectedRun=await F.benchmarkRun(H,!0):H||(s.selectedRun=null),s.loaded=!0,b()}catch(m){if(!s.loaded){s.renderSignature="";let T=a();T&&(T.innerHTML=te({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:n(m.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let m=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,_({refreshAll:m})}else P()}},P=()=>{s.pollTimer&&window.clearTimeout(s.pollTimer),s.pollTimer=null,(s.runs||[]).some(p=>ht(p.status))&&(s.pollTimer=window.setTimeout(()=>{_()},2500))},N=async p=>{try{s.selectedRun=await F.benchmarkRun(p,!0),b(),P()}catch(m){C(m.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},M=async p=>{!s.labelTouched&&p.elements.label&&(p.elements.label.value=ot());let m=r(p);s.config=m;let T=Number(p.elements.suite_id?.value||0);if(!T){C("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await F.startBenchmarkRun({suite_id:T,config:m,actor:"anonymous"}),C("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=ot(),s.labelTouched=!1,await _()}catch(U){C(U.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},D=async p=>{try{await F.stopBenchmarkRun(p),C("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await _()}catch(m){C(m.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},z=async p=>{let m=Number(p.dataset.resultId||0),T=new FormData(p),U={};for(let H of["correctness","grounding","citation","clarity","overall"]){let O=Number(T.get(`score_${H}`));Number.isFinite(O)&&(U[H]=O)}try{await F.reviewBenchmarkResult(m,{reviewer:"anonymous",scores:U,comment:String(T.get("comment")||"")}),C("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await F.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(m)),b()}catch(H){C(H.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},Z=async p=>{if(p)try{let m=await F.benchmarkFingerprintHistory(p,50);s.history[p]=m.cases||[];let T=s.selectedRun,U=a();if(!T||!U)return;let H=(T.cases||[]).filter(O=>O.fingerprint===p);for(let O of H){let j=U.querySelector(`details.bench-case[data-result-id="${O.id}"]`);if(!j)continue;let J=j.open;j.innerHTML=bs(O,s.history[p]),j.open=J,j._benchSignature=vs(O,s.history[p])}}catch(m){C(m.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},R=async p=>{let m=p.target.closest("[data-bench-action]");if(!m)return;let T=m.dataset.benchAction;T==="open-run"?await N(m.dataset.runId||""):T==="stop"?await D(m.dataset.runId||""):T==="fingerprint-history"&&await Z(m.dataset.fingerprint||"")},E=async p=>{let m=p.target.closest("[data-bench-form]");m&&(p.preventDefault(),m.dataset.benchForm==="run"?await M(m):m.dataset.benchForm==="human"&&await z(m))},B=p=>{p&&(p.elements.label&&p.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=r(p),p.elements.suite_id&&(s.selectedSuiteId=Number(p.elements.suite_id.value)||s.selectedSuiteId))},L=p=>{let m=p.target.closest('[data-bench-form="run"]');m&&B(m)};return e.addEventListener("click",R),e.addEventListener("submit",E),e.addEventListener("input",L),e.addEventListener("change",L),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=ot();let p=a()?.querySelector('input[name="label"]');p&&(p.value=s.config.label)}_({refreshAll:!s.referenceLoaded})},refresh(){return _({refreshAll:!0})},destroy(){e.removeEventListener("click",R),e.removeEventListener("submit",E),e.removeEventListener("input",L),e.removeEventListener("change",L),s.pollTimer&&window.clearTimeout(s.pollTimer),s.tickTimer&&window.clearInterval(s.tickTimer)}}}var As={};Ge(As,{exportCsv:()=>Ut,exportableResult:()=>Jt,render:()=>mr,renderReport:()=>Ot,reportError:()=>Ht,reportLoading:()=>$t});var wa=[10,25,50,100],En=500,Rn=["law_name","law_level","law_category","law_modified_date","article_count"],Cn=["jid","court_normalized","title","jdate","matched_laws","citation_count"],Nn={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function Ft(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function It(e,t){let s={};for(let a of e.fields||[]){let r=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?r:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{}}}function Pn(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,r]of Object.entries(s))if(Array.isArray(r)&&!r.map(String).includes(String(t[a]??"")))return!1;return!0}function qs(e,t){return(e.fields||[]).filter(s=>Pn(s,t))}function Bn(e,t){return`filter-${e.id}-${t}`}function Ye(e){return e==null?"":n(String(e))}function $s(e,t,s){let a=s[t.key],r=Bn(e,t.key),i=t.help?`<span class="field-help">${n(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
      <label class="checkbox-field" for="${r}">
        <input type="checkbox" id="${r}" name="${n(t.key)}" ${a?"checked":""} />
        <span class="checkbox-copy">
          <strong>${n(t.label)}</strong>
          ${t.help?`<span>${n(t.help)}</span>`:""}
        </span>
      </label>
    </div>`;let o=`<label class="field-label" for="${r}">
      <span>${n(t.label)}</span>
      <span class="field-tag">${n(t.key)}</span>
    </label>`;if(t.type==="select"){let c=(t.options||[]).map(g=>`<option value="${Ye(g.value)}" ${String(g.value)===String(a??"")?"selected":""}>${n(g.label??g.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${r}" name="${n(t.key)}">${c}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let c=new Set((Array.isArray(a)?a:[]).map(String)),g=(t.options||[]).map($=>`<label class="multi-option">
          <input type="checkbox" name="${n(t.key)}" value="${Ye($.value)}" ${c.has(String($.value))?"checked":""} />
          <span>${n($.label??$.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${g}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${r}" name="${n(t.key)}"
        value="${Ye(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${Ye(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${r}" name="${n(t.key)}"
        value="${Ye(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${r}" name="${n(t.key)}"
      value="${Ye(a)}"
      placeholder="${Ye(t.placeholder||"")}" />
    ${i}
  </div>`}function ys(e,t,{focusTable:s=!1}={}){let a=qs(e,t.values),r=[];for(let i=0;i<a.length;i+=1){let o=a[i],c=a[i+1];o.type==="date"&&c&&c.type==="date"?(r.push(`<div class="field-row">${$s(e,o,t.values)}${$s(e,c,t.values)}</div>`),i+=1):r.push($s(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
    <div class="filter-block">
      <div class="filter-head">
        <span class="filter-title">Metadata \u689D\u4EF6</span>
        <button class="filter-reset" type="button" data-action="reset">\u91CD\u8A2D</button>
      </div>
      <div class="filter-fields">${r.join("")}</div>
    </div>
    <div class="sidebar-actions">
      <button class="btn btn-primary" type="submit" id="run-query" ${s?'data-focus-table="true"':""}>
        ${f("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
      </button>
    </div>
  </form>`}function Dt(e,t,s){let a={...s.values};for(let r of qs(t,a))if(r.type==="checkbox"){let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=!!i?.checked}else if(r.type==="multiselect")a[r.key]=Array.from(e.querySelectorAll(`[name="${r.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=i?i.value:""}return a}function _a(e,t){let s={};for(let a of qs(e,t.values)){let r=t.values[a.key];a.type==="checkbox"?s[a.key]=!!r:a.type==="multiselect"?s[a.key]=Array.isArray(r)?r:[]:a.type==="number"?s[a.key]=r===""||r===null?"":Number(r):s[a.key]=r??""}return s}function ws(e,t){let s=_a(e,t);return(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function ga(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${te({tone:t,title:`${Ft(e)} ${Me(e.status).label}`,text:n(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function In(e,t){return`<div class="db-options" role="radiogroup" aria-label="\u9078\u64C7\u8CC7\u6599\u5EAB">
    ${e.map(s=>{let a=Me(s.status);return`<label class="db-option">
          <input type="radio" name="database" value="${n(s.id)}" ${s.id===t?"checked":""} />
          <span class="db-option-body">
            <span class="db-option-top">
              <span class="db-option-name">${n(s.label)}</span>
              <span class="db-option-radio" aria-hidden="true"></span>
            </span>
            <span class="db-option-desc">${n(s.description||"")}</span>
            <span class="db-option-state">
              <span class="status-dot ${a.tone==="ok"?"is-ok":a.tone==="warn"?"is-warn":a.tone==="danger"?"is-danger":"is-idle"}" aria-hidden="true"></span>
              ${n(s.shortLabel||a.label)} \xB7 ${n(a.label)}
            </span>
          </span>
        </label>`}).join("")}
  </div>`}function Dn(e){return`<div class="sidebar-view-switch" role="tablist" aria-label="\u67E5\u8A62\u6216 schema">
    <button class="sidebar-view-button ${e==="query"?"is-active":""}"
      type="button" role="tab" aria-selected="${e==="query"}"
      data-action="sidebar-view" data-view="query">${f("search",13)}<span>\u67E5\u8A62</span></button>
    <button class="sidebar-view-button ${e==="schema"?"is-active":""}"
      type="button" role="tab" aria-selected="${e==="schema"}"
      data-action="sidebar-view" data-view="schema">${f("table",13)}<span>Schema</span></button>
  </div>`}function _s(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],r=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
            data-action="select-schema-table"
            data-table-id="${n(i.id)}">
            <span class="schema-item-top">
              <span class="schema-item-name">${n(i.label||i.id)}</span>
              <span class="schema-item-action">${e.id==="qdrant"?"\u6AA2\u8996":"\u9810\u89BD"}</span>
            </span>
            <span class="schema-item-id mono">${n(i.id)}</span>
            <span class="schema-item-desc">${n(i.description||"")}</span>
          </button>`).join(""):'<div class="report-empty-inline">\u9019\u500B\u8CC7\u6599\u5EAB\u6C92\u6709\u53EF\u986F\u793A\u7684\u8CC7\u6599\u8868\u3002</div>';return`<div class="schema-panel">
    <div class="filter-head">
      <span class="filter-title">${n(t||"\u8CC7\u6599\u8868")} \xB7 Schema</span>
      <span class="field-tag">${n(e.label||e.id)}</span>
    </div>
    <div class="schema-list">${r}</div>
    <div class="sidebar-note">\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u5728\u53F3\u5074\u9810\u89BD\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002</div>
  </div>`}function fa(e,t){return`<div class="category-options" role="radiogroup" aria-label="\u8CC7\u6599\u985E\u578B">
    ${e.map(s=>{let a=s.id===t,r=s.id==="judgment"&&s.count!==void 0?`${u(s.count)} \u7B46\u5DF2\u7BE9\u9078\u5224\u6C7A`:s.description||"";return`<label class="category-option${a?" is-selected":""}">
          <input type="radio" name="category" value="${n(s.id)}" ${a?"checked":""} />
          <span class="category-option-body">
            <span class="category-option-label">${n(s.label)}</span>
            <span class="category-option-desc">${n(r)}</span>
          </span>
        </label>`}).join("")}
  </div>`}function va(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||n(e.detail||"")}function On(e){return`<div class="report-empty">
    ${ye({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:n({postgres:"\u9078\u64C7\u8CC7\u6599\u8868\u8207 metadata \u689D\u4EF6\uFF0C\u57F7\u884C\u5F8C\u6703\u7522\u751F SQL\u3001\u6458\u8981\u3001\u5206\u5E03\u8207\u8CC7\u6599\u5217\u3002",parquet:"\u9078\u64C7\u8CC7\u6599\u96C6\u8207\u56DE\u50B3\u6B04\u4F4D\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
    <div class="query-hint-grid">
      <div class="query-hint">
        <strong>01 \xB7 \u9078\u64C7\u8CC7\u6599\u5EAB</strong>
        <span>\u4F7F\u7528\u5DE6\u5074 radio \u5207\u63DB PostgreSQL\u3001Parquet\u3001Qdrant \u6216 IndexedDB\u3002</span>
      </div>
      <div class="query-hint">
        <strong>02 \xB7 \u8A2D\u5B9A metadata</strong>
        <span>\u6B04\u4F4D\u6703\u4F9D\u8CC7\u6599\u5EAB\u8207\u8CC7\u6599\u8868\u52D5\u614B\u6539\u8B8A\uFF0C\u91CD\u8A2D\u53EF\u56DE\u5230\u9810\u8A2D\u503C\u3002</span>
      </div>
      <div class="query-hint">
        <strong>03 \xB7 \u57F7\u884C\u67E5\u8A62</strong>
        <span>\u53F3\u5074\u7522\u751F\u6458\u8981\u3001\u5206\u5E03\u3001\u5BE6\u969B\u67E5\u8A62\u8A9E\u53E5\u8207\u53EF\u532F\u51FA\u7684\u8CC7\u6599\u8868\u3002</span>
      </div>
    </div>
  </div>`}function $t(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(Ft(e))} \u67E5\u8A62\u4E2D</div>
        <div class="report-sub">\u6B63\u5728\u5957\u7528 metadata \u689D\u4EF6\u4E26\u6574\u7406\u5831\u8868\u2026</div>
      </div>
      <span class="spinner" aria-hidden="true"></span>
    </div>
    <div class="report-loading">
      <div class="skeleton skeleton-line" style="width:94%"></div>
      <div class="skeleton skeleton-line" style="width:82%"></div>
      <div class="skeleton skeleton-line" style="width:88%"></div>
      <div class="skeleton skeleton-line" style="width:56%;margin-bottom:0"></div>
    </div>
  </div>`}function Ht(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(Ft(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${te({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${f("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Fn(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,r=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${n(s.label||"\u672A\u5206\u985E")}">${n(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${r.toFixed(1)}%"></span></span>
          <span class="dist-value">${u(a)}</span>
        </div>`}).join("")}
  </div>`}function ka(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function Hn(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function Un(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function Jn(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${n(String(t))}"
    title="\u6AA2\u8996\u300C${n(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${n(String(t))}${f("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var Qn={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function Gn(e,t,s,a=!1,r=!0,i=!1){let o=a?e.key:e.label||e.key,c=r?t?Qn[e.key]||e.key:i?e.key:null:null;if(!c)return`<th scope="col">${n(o)}</th>`;let g=s?.key===c,$=g?s.direction:null,S=$==="asc"?"ascending":$==="desc"?"descending":"none",y=$==="asc"?"\u2191":$==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${S}">
    <button class="table-sort${g?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${n(c)}"
      title="\u4F9D${n(o)}\u6392\u5E8F">
      <span>${n(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${y}</span>
    </button>
  </th>`}function zn(e,t){if(!ka(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,r=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(r||""),lawName:String(t.law_name||"")}}function Vn(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${n(s.lawKey)}"
    data-law-source="${n(s.sourceType)}"
    data-law-name="${n(s.lawName)}"
    title="\u6AA2\u8996\u300C${n(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(String(a))}${f("chevronRight",12,"law-link-icon")}</button>`}function Sa(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:r=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],c=Array.isArray(e.rows)?e.rows:[],g=(e.page-1)*e.page_size,$=ka(e),S=Hn(e),y=Un(e),w=e.meta?.sort||null,x=r?`<tr class="schema-search-row">
        <th scope="col" class="cell-index-head"></th>
        ${o.map(b=>`<th scope="col">
              <div class="schema-search-wrap">
                <input class="schema-search-input" type="search"
                  data-schema-search="${n(b.key)}"
                  value="${n(String(r[b.key]??""))}"
                  placeholder="\u641C\u5C0B ${n(b.key)}"
                  autocomplete="off" />
              </div>
            </th>`).join("")}
      </tr>`:"";return o.length?c.length?`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">${u(c.length)} rows \xB7 \u7B2C ${e.page} \u9801${$?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":S?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":y?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${x}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(b=>Gn(b,S,w,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${c.map((b,_)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${g+_+1}</td>
                ${o.map(P=>{if((S||y)&&P.key==="jid")return`<td class="cell-jid">${Jn(b)}</td>`;let N=$&&P.key==="law_name"?zn(e,b):null;if(N)return`<td>${Vn(b,P,N)}</td>`;let D={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[P.type];return`<td${D?` class="${D}"`:""}>${Mt(b[P.key],P.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${ye({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function Wn(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${u(i)}\u2013${u(o)} / ${u(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${wa.map(c=>`<option value="${c}" ${c===s?"selected":""}>${c}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${f("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${f("chevronRight",13)}</button>
    </div>
  </div>`}function xa(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${n(t)}</div>`).join("")}</div>`}function Ot(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],r=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",c=e.database||"",g=e.status||"ok",$=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${n(c)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${n(String(c).toUpperCase())}</div>
        <div class="report-title">
          ${n(e.label||c)}
          ${re(g)}
          <span class="chip">${n($)}</span>
        </div>
        <div class="report-sub">
          ${u(i)} \u7B46\u7B26\u5408 \xB7
          ${G(e.duration_ms)} \xB7
          ${n(String(c).toUpperCase())} / ${n(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${f("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${f("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${te({tone:g==="not_configured"?"info":g==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:""}

    ${a.length?`<div class="summary-strip">
            ${a.slice(0,4).map(S=>`<div class="summary-item">
                  <div class="summary-label">${n(S.label)}</div>
                  <div class="summary-value">${n(S.value)}</div>
                </div>`).join("")}
          </div>`:""}

    <div class="report-grid">
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u7D50\u679C\u5206\u5E03</span>
          <span class="muted" style="font-size:9.5px">${r.length} groups</span>
        </div>
        ${Fn(r)}
      </div>
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5BE6\u969B\u67E5\u8A62\u8A9E\u53E5</span>
          <span class="muted" style="font-size:9.5px">${n(e.database==="indexeddb"?"client-side":"read-only")}</span>
        </div>
        <div class="query-box">
          <pre class="query-code">${n(o||"\u2014")}</pre>
          <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
            ${f("copy",12)}<span>\u8907\u88FD</span>
          </button>
        </div>
        ${xa(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?Sa(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?Wn({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function ba(e){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${n(e||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u6B63\u5728\u8B80\u53D6\u6B04\u4F4D\u8207\u524D 10 \u7B46\u8CC7\u6599\u2026</div>
      </div>
      <span class="spinner" aria-hidden="true"></span>
    </div>
    <div class="report-loading">
      <div class="skeleton skeleton-line" style="width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>
  </div>`}function ks(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let r=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${te({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${n(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${n(t||e.table||"\u8CC7\u6599\u8868")}
          ${re(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${n(String(e.database||""))} / ${n(String(e.table||"\u2014"))} \xB7 ${r.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${Sa({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${xa(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${u(i.length)} \u7B46</span>
      <strong>\u5171 ${u(e.total)} \u7B46</strong>
    </div>
  </div>`}function ha(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${n(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${te({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function Kn(e){return`<div class="report-empty">
    ${ye({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${Ft(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function Ss(e){return e.is_current===!0?re("ok","\u73FE\u884C"):e.law_abandon_note?re("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?re("empty","\u6B77\u53F2\u7248\u672C"):re("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function ue(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${n(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function Xe(e){return e?Le(e):"\u2014"}function Yn(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function xs(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${n(e)}</span>
    </div>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </div>`:""}function Xn(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${n(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${f("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </details>`:""}function Zn(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let r=a?.name||a?.url||"";return r?a.url?`<a class="law-attachment" href="${n(a.url)}" target="_blank" rel="noopener noreferrer">
          ${f("file",12)}<span>${n(r)}</span>${f("external",11)}
        </a>`:`<span class="law-attachment">${f("file",12)}<span>${n(r)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${u(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function qa(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function er(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,r=s?`${u(a)} \u689D \xB7 ${u(s)} \u7AE0\u7BC0`:`${u(a)} \u689D`,i=t.map(o=>{let c=String(o.article_content||"").trim();if(!c)return"";if(o.article_type==="C")return`<div class="law-chapter">${n(c)}</div>`;let g=Nn[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${n(qa(o.article_no))}">
        <div class="law-article-head">
          <span class="law-article-no">${n(o.article_no||"\u689D\u6587")}</span>
          ${g&&g!=="\u689D\u6587"?`<span class="chip">${n(g)}</span>`:""}
        </div>
        <div class="law-article-text">${n(c)}</div>
      </article>`}).join("");return`<div class="report-section law-articles-section">
    <div class="report-section-head">
      <span class="report-section-title">\u689D\u6587\u5167\u5BB9</span>
      <div class="law-article-controls">
        <span class="muted">${r}</span>
        <div class="law-article-jump">
          <input class="input law-article-jump-input law-jump-input" id="law-article-jump"
            type="text" inputmode="numeric" autocomplete="off"
            placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="jump-article" data-jump-input="law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
        </div>
      </div>
    </div>
    ${i?`<div class="law-article-list">${i}</div>`:'<div class="report-empty-inline">\u9019\u500B\u6CD5\u898F\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u5167\u5BB9\u3002</div>'}
  </div>`}function tr(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function lt(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${f("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function sr(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${lt()}
      <span class="law-report-origin">\u6B63\u5728\u8F09\u5165\u6CD5\u898F\u5831\u8868\u2026</span>
    </div>
    <div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT</div>
          <div class="report-title">${n(e||"\u6CD5\u898F")}</div>
          <div class="report-sub">\u6B63\u5728\u53D6\u5F97 metadata \u8207\u6700\u65B0 Parquet \u689D\u6587\u2026</div>
        </div>
        <span class="spinner" aria-hidden="true"></span>
      </div>
      <div class="report-loading">
        <div class="skeleton skeleton-line" style="width:92%"></div>
        <div class="skeleton skeleton-line" style="width:78%"></div>
        <div class="skeleton skeleton-line" style="width:86%"></div>
      </div>
    </div>
  </div>`}function ar(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${lt()}
      <span class="law-report-origin">\u6CD5\u898F\u5831\u8868\u8F09\u5165\u5931\u6557</span>
    </div>
    <div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT</div>
          <div class="report-title">${n(t||"\u6CD5\u898F")}</div>
          <div class="report-sub">\u7121\u6CD5\u53D6\u5F97\u9019\u500B\u6CD5\u898F\u7684\u5B8C\u6574\u5831\u8868\u3002</div>
        </div>
      </div>
      <div class="report-section">
        ${te({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function nr(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let r=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",r,a.article_count_for_law?`${u(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${n(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${n(i)}</option>`}).join("")}
    </select>
  </label>`}function rr(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,c)=>o+(Number(c)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let r={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${r[o]} ${u(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">\u7248\u672C\u8B8A\u66F4</span>
      <span class="muted">${n(i)}</span>
    </summary>
    <div class="law-version-change-list">
      ${a.length?a.slice(0,20).map(o=>{let c=o.change_type==="added"?"badge-ok":o.change_type==="removed"?"badge-danger":"badge-warn",g=o.before_content?`<details><summary>\u8B8A\u66F4\u524D</summary><pre>${n(o.before_content)}</pre></details>`:"",$=o.after_content?`<details><summary>\u8B8A\u66F4\u5F8C</summary><pre>${n(o.after_content)}</pre></details>`:"";return`<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${c}">${n(r[o.change_type]||o.change_type)}</span>
                    <strong>${n(o.article_no||o.article_key)}</strong>
                  </div>
                  ${g}${$}
                </div>`}).join(""):'<div class="report-empty-inline">\u6B64\u7248\u672C\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u8B8A\u66F4\u3002</div>'}
      ${e.changes_truncated?'<div class="report-empty-inline">\u50C5\u986F\u793A\u524D 20 \u7B46\u8B8A\u66F4\uFF1BAPI \u56DE\u50B3\u4E0A\u9650 200 \u7B46\u3002</div>':""}
    </div>
  </details>`}function ir(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let r=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(_=>_.article_type!=="C").length,c=Yn(e),g=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",$=e.meta?.snapshot||"",S=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",y=[c,g,S,$].filter(Boolean).join(" \xB7 "),w=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",x=e.version||{},b=[ue("\u6CD5\u898F\u4F4D\u968E",n(e.law_level||"\u2014")),ue("\u6CD5\u898F\u985E\u5225",n(e.law_category||"\u2014")),ue("\u7570\u52D5\u65E5\u671F",Xe(e.law_modified_date)),ue("\u751F\u6548\u65E5\u671F",Xe(e.law_effective_date)),ue("\u689D\u6587\u6578",u(e.article_count)),ue("\u8CC7\u6599\u72C0\u614B",Ss(e)),ue("\u82F1\u8B6F\u540D\u7A31",n(e.eng_law_name||"\u2014")),ue("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${n(e.law_key||"\u2014")}</span>`)];return x.first_seen_version_id!==null&&x.first_seen_version_id!==void 0&&b.push(ue("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${n(x.first_seen_version_id)}`)),x.last_seen_version_id!==null&&x.last_seen_version_id!==void 0&&b.push(ue("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${n(x.last_seen_version_id)}`)),x.last_seen_at&&b.push(ue("\u6700\u5F8C\u6536\u9304\u6642\u9593",n(ne(x.last_seen_at)))),x.selected_version_id!==null&&x.selected_version_id!==void 0&&b.push(ue("\u689D\u6587\u7248\u672C",`#${n(x.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${lt()}
      <span class="law-report-origin" title="${n(y)}">${n(y)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${n(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${n(String(t||c).toUpperCase())}</div>
          <div class="report-title">
            ${n(i)}
            ${Ss(e)}
            <span class="chip">${n(w)}</span>
          </div>
          <div class="report-sub">
            ${n([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${u(e.article_count)} \u689D \xB7 \u7570\u52D5 ${Xe(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${nr(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">${f("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${r.length?`<div class="report-alert">${te({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r.map(_=>n(_)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${u(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${Xe(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${n(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${Ss(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${n(c)}</span>
        </div>
        <div class="law-meta-grid">${b.join("")}</div>
      </div>

      ${rr(e)}
      ${xs("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${Xn("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${xs("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${xs("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${Zn(e.attachments)}
      ${er(e)}
    </div>
    ${o>100?tr():""}
  </div>`}function or(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${lt()}
      <span class="law-report-origin">\u6B63\u5728\u8F09\u5165\u5224\u6C7A\u539F\u6587\u2026</span>
    </div>
    <div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">JUDGMENT REPORT</div>
          <div class="report-title">${n(e||"\u5224\u6C7A")}</div>
          <div class="report-sub">\u6B63\u5728\u53D6\u5F97\u5224\u6C7A\u5168\u6587\u8207\u5F15\u7528\u8CC7\u6599\u2026</div>
        </div>
        <span class="spinner" aria-hidden="true"></span>
      </div>
      <div class="report-loading">
        <div class="skeleton skeleton-line" style="width:92%"></div>
        <div class="skeleton skeleton-line" style="width:78%"></div>
        <div class="skeleton skeleton-line" style="width:86%"></div>
      </div>
    </div>
  </div>`}function lr(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${lt()}
      <span class="law-report-origin">\u5224\u6C7A\u539F\u6587\u8F09\u5165\u5931\u6557</span>
    </div>
    <div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">JUDGMENT REPORT</div>
          <div class="report-title">${n(t||"\u5224\u6C7A")}</div>
          <div class="report-sub">\u7121\u6CD5\u53D6\u5F97\u9019\u7B46\u5224\u6C7A\u7684\u5B8C\u6574\u5167\u5BB9\u3002</div>
        </div>
      </div>
      <div class="report-section">
        ${te({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function cr(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${n(t)}"
    data-law-source=""
    data-law-name="${n(t)}"
    title="\u6AA2\u8996\u300C${n(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(t)}${f("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function dr(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let r=String(s.article_no||"").trim();r&&t.get(a).add(r)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${cr(s)}
          <span class="judgment-citation-articles">${[...a].map(r=>n(r)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function ur(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",r=String(e.full_text||""),i=Number(e.full_text_length)||r.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),c=[ue("\u6848\u865F",n(e.jid||"\u2014")),ue("\u5E74\u5EA6",n(e.jyear||"\u2014")),ue("\u5B57\u5225",n(e.jcase||"\u2014")),ue("\u865F\u78BC",n(e.jno||"\u2014")),ue("\u6CD5\u9662",n(e.court||"\u2014")),ue("\u6848\u7531",n(e.title||"\u2014")),ue("\u88C1\u5224\u65E5\u671F",Xe(e.jdate)),ue("\u4F86\u6E90\u58D3\u7E2E\u6A94",n(e.source_archive||"\u2014")),ue("\u5168\u6587\u9577\u5EA6",`${u(i)} \u5B57`),ue("\u5F15\u7528\u6578",u(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&c.push(ue("\u532F\u5165 Run",`#${n(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${lt()}
      <span class="law-report-origin" title="${n(o)}">${n(o)}</span>
    </div>
    <div class="report-card law-report-card judgment-report-card" data-database="${n(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">JUDGMENT REPORT \xB7 ${n(String(t).toUpperCase())}</div>
          <div class="report-title">
            ${n(a)}
            <span class="chip">\u5224\u6C7A\u6587\u4EF6</span>
          </div>
          <div class="report-sub">
            ${n(e.court||"\u2014")} \xB7 ${Xe(e.jdate)} \xB7
            ${u(i)} \u5B57
          </div>
        </div>
        <div class="report-actions">
          ${e.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(e.pdf_url)}" target="_blank" rel="noopener noreferrer">${f("external",14)}<span>PDF</span></a>`:""}
        </div>
      </div>

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u88C1\u5224\u65E5\u671F</div>
          <div class="summary-value">${Xe(e.jdate)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u9662</div>
          <div class="summary-value summary-value-text">${n(e.court||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u547D\u4E2D\u6CD5\u898F</div>
          <div class="summary-value">${u(s.length)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u5F15\u7528\u6578</div>
          <div class="summary-value">${u(e.citation_count)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${n(e.jid||"")}</span>
        </div>
        <div class="law-meta-grid">${c.join("")}</div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u547D\u4E2D\u6CD5\u898F\u8207\u5F15\u7528</span>
          <span class="muted">${u(s.length)} \u6CD5\u898F \xB7 ${u(e.citation_count)} \u5F15\u7528</span>
        </div>
        ${dr(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${u(i)} \u5B57</span>
        </div>
        ${r?`<div class="judgment-fulltext">${n(r)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function $a(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function Ut(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map($a).join(",")],r=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([r+o+1,...t.map(c=>i[c.key])].map($a).join(","))}),`\uFEFF${a.join(`\r
`)}`}function Jt(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,r]of Object.entries(t))a.startsWith("_")||(s[a]=r);return s})}}function pr(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function ya(e,t){let s=performance.now(),a=_a(e,t),r=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,c=t.pageSize,g=[],$=[],S=[],y=[];if(r==="settings"){$=(await ea({keyword:i})).map(D=>({key:D.key,value:ta(D.value),updated_at:D.updated_at})),S=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let M=new Map;$.forEach(D=>{let z=String(D.key||"").split(".")[0]||"\u5176\u4ED6";M.set(z,(M.get(z)||0)+1)}),y=Array.from(M.entries()).map(([D,z])=>({label:D,value:z})).sort((D,z)=>z.value-D.value)}else{$=(await Ct({keyword:i,limit:En})).map(D=>({kind:pr(D.kind),title:D.title,detail:D.detail,created_at:D.created_at})),S=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let M=new Map;$.forEach(D=>M.set(D.kind,(M.get(D.kind)||0)+1)),y=Array.from(M.entries()).map(([D,z])=>({label:D,value:z})).sort((D,z)=>z.value-D.value)}let w=$.length,x=(o-1)*c,b=$.slice(x,x+c),_=Math.round(performance.now()-s),P=Ys();return P&&g.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:P?"degraded":"ok",message:P?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:r,columns:S,rows:b,total:w,page:o,page_size:c,duration_ms:_,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(w)},{label:"\u76EE\u524D\u9801\u9762",value:`${b.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:Et()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${_} ms`}],distribution:y,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${r}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${c} OFFSET ${x}`,warnings:g,meta:{store:r,filters:a,client_side:!0}}}async function mr(e,t){let s=!1,a=null,r=[],i="law",o=null,c={},g=0,$=25,S="query",y=null,w=null,x=0,b=[],_=null,P=-1,N=0,M=null,D=null;e.innerHTML=`<section class="page data-page">
    <div class="page-header">
      <div class="data-page-heading">
        <div class="eyebrow">DATA EXPLORER</div>
        <div class="data-title-line">
          <h1 class="page-title">\u8CC7\u6599\u5EAB\u67E5\u8A62\u8207\u5831\u8868</h1>
          <p class="page-subtitle data-page-subtitle">\u5F9E\u5DE6\u5074\u5207\u63DB\u300C\u6CD5\u898F\u547D\u4EE4\u300D\u6216\u300C\u5224\u6C7A\u300D\uFF0C\u518D\u9078\u64C7\u8CC7\u6599\u5EAB\u8207\u8CC7\u6599\u8868\uFF1B\u5224\u6C7A\u53EA\u5305\u542B\u547D\u4E2D\u91D1\u878D\u6CD5\u898F\u6E05\u55AE\u7684\u6587\u4EF6\u3002</p>
        </div>
      </div>
      <div class="page-actions">
        <span class="badge badge-neutral badge-mono" id="catalog-meta">CATALOG \xB7 \u8B80\u53D6\u4E2D</span>
        <button class="btn btn-secondary" type="button" id="refresh-catalog">
          ${f("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    <div class="data-layout">
      <aside class="card query-sidebar" id="query-sidebar" aria-label="\u67E5\u8A62\u689D\u4EF6">
        <div id="category-switch"></div>
        <div id="db-options-wrap">
          <div style="padding:16px">
            <div class="skeleton skeleton-line" style="width:86%"></div>
            <div class="skeleton skeleton-line" style="width:62%"></div>
          </div>
        </div>
        <div id="sidebar-view-switch"></div>
        <div id="filter-area"></div>
        <div id="schema-area" hidden></div>
      </aside>
      <section class="query-main" id="query-main" aria-label="\u67E5\u8A62\u5831\u8868" aria-live="polite">
        <div class="report-card">
          <div class="report-loading">
            <div class="skeleton skeleton-line" style="width:88%"></div>
            <div class="skeleton skeleton-line" style="width:70%"></div>
            <div class="skeleton skeleton-line" style="width:80%"></div>
          </div>
        </div>
      </section>
    </div>
    <div id="schema-suggest-popover" class="schema-suggest-popover" hidden></div>
  </section>`;let z=e.querySelector("#query-sidebar"),Z=e.querySelector("#category-switch"),R=e.querySelector("#db-options-wrap"),E=e.querySelector("#sidebar-view-switch"),B=e.querySelector("#filter-area"),L=e.querySelector("#schema-area"),p=e.querySelector("#query-main"),m=e.querySelector("#schema-suggest-popover"),T=e.querySelector("#catalog-meta"),U=e.querySelector("#refresh-catalog"),H=v=>r.find(l=>l.id===v),O=()=>H(i)?.databases||[],j=v=>O().find(l=>l.id===v),J=(v,l)=>`${v}:${l}`,I=(v,l=i)=>c[J(l,v.id)],K=(v,l)=>{Nt(v,l).catch(()=>{})},ee=()=>{if(!a){T.textContent="CATALOG \xB7 \u96E2\u7DDA",T.className="badge badge-danger badge-mono";return}let v=O(),l=v.filter(h=>h.available).length,d=H(i);T.textContent=`CATALOG \xB7 ${d?.label||i} \xB7 ${l}/${v.length} \u53EF\u7528`,T.className="badge badge-neutral badge-mono"},fe=v=>{p.innerHTML=On(v)},ve=()=>{let v=M?.returnScroll??D?.returnScroll;M=null,D=null;let l=j(o),d=l?I(l):null;S==="schema"&&w?.result?p.innerHTML=ks(w.result,de(l,w.tableId),{columnFilters:w.columnFilters||{},searchEnabled:l.id==="postgres"||l.id==="parquet"}):d?.result?p.innerHTML=Ot(d.result):l&&fe(l),typeof v=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:v,behavior:"smooth"}))},pe=(v="law-article-jump")=>{let l=p.querySelector(`#${v}`),d=qa(l?.value);if(!d){C("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),l?.focus();return}let k=[...p.querySelectorAll("[data-article-no]")].find(q=>q.dataset.articleNo===d);if(!k){C(`\u627E\u4E0D\u5230\u7B2C ${d} \u689D\u3002`,"warn");return}k.scrollIntoView({behavior:"instant",block:"center"}),k.classList.add("is-jump-target"),window.setTimeout(()=>k.classList.remove("is-jump-target"),2400)},Ne=async({lawKey:v,sourceType:l="",lawName:d="",versionId:h=""})=>{let k=j(o),q=k?I(k):null,A=S==="schema"?w?.result:null;if(!k||!q?.result&&!A||!v)return;let W=++g;M={seq:W,lawKey:v,sourceType:l,lawName:d,versionId:h?String(h):"",page:1,detail:null,database:k.id,returnScroll:window.scrollY},D=null,p.innerHTML=sr(d||v),p.scrollIntoView({behavior:"smooth",block:"start"});try{let ie=await F.lawDetail(v,l,M.versionId);if(s||!M||M.seq!==W)return;M.detail=ie,M.page=1,p.innerHTML=ir(ie,{database:M.database,lawPage:M.page})}catch(ie){if(s||!M||M.seq!==W)return;p.innerHTML=ar(ie,d||v),C(ie.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},Q=async({jid:v})=>{let l=j(o),d=l?I(l):null,h=S==="schema"?w?.result:null;if(!l||!d?.result&&!h||!v)return;let k=++g;M=null;let q=l.id==="parquet"?"parquet":"postgres";D={seq:k,jid:v,detail:null,database:l.id,source:q,returnScroll:window.scrollY},p.innerHTML=or(v),p.scrollIntoView({behavior:"smooth",block:"start"});try{let A=await F.judgmentDetail(v,q);if(s||!D||D.seq!==k)return;D.detail=A,p.innerHTML=ur(A,{database:D.database})}catch(A){if(s||!D||D.seq!==k)return;p.innerHTML=lr(A,v),C(A.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},se=(v,l)=>`${i}:${v.id}:${l}`,de=(v,l)=>(v.tables||[]).find(d=>d.id===l)?.label||l,Se=(v,l,{sort:d=null,columnFilters:h={}}={})=>{let k={column_filters:h};return v.id==="postgres"?(k.table=l,k.schema_preview=!0):v.id==="parquet"&&i==="judgment"?(k.table="judgment_documents",k.columns=Cn):v.id==="parquet"&&(k.dataset="all",k.columns=Rn),d?.key&&(k.sort=`${d.key}:${d.direction}`),k},pt=async(v,l,{sort:d=null,columnFilters:h={}}={})=>{if(!l)return;Pe();let k=se(v,l),q=++x;y={tableId:l},w={key:k,tableId:l,loading:!0,result:null,error:null,sort:d,columnFilters:h},L.innerHTML=_s(v,H(i)?.label||i,l),p.innerHTML=ba(de(v,l));try{let A;if(v.id==="indexeddb"){let W=It(v,10);W.values.store=l,W.page=1,A=await ya(v,W)}else v.id==="qdrant"?A={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:l,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(A=await F.query({database:v.id,filters:Se(v,l,{sort:d,columnFilters:h}),page:1,pageSize:10}),d?.key&&(A.meta={...A.meta||{},sort:d}));if(s||q!==x)return;w={key:k,tableId:l,loading:!1,result:A,error:null,sort:d,columnFilters:h},S==="schema"&&y?.tableId===l&&(L.innerHTML=_s(v,H(i)?.label||i,l),p.innerHTML=ks(A,de(v,l),{columnFilters:h,searchEnabled:v.id==="postgres"||v.id==="parquet"}))}catch(A){if(s||q!==x)return;w={key:k,tableId:l,loading:!1,result:null,error:A,sort:d,columnFilters:h},S==="schema"&&y?.tableId===l&&(p.innerHTML=ha(A,de(v,l)))}},st=()=>{let v=j(o);if(!v)return null;if(S==="schema"&&w?.result)return{db:v,tableId:w.tableId,columnFilters:w.columnFilters||{},sort:w.sort||null,mode:"schema"};let l=v?I(v):null,d=l?.result;return d&&(v.id==="postgres"||v.id==="parquet")?{db:v,tableId:d.table,columnFilters:l.columnFilters||{},sort:l.sort||null,mode:"query"}:null},mt=(v,l,d)=>{if(!v)return;let h=`${v.db.id}:${v.tableId}:${l}`,k=qe.get(h);k&&(window.clearTimeout(k),qe.delete(h)),Pe();let q={...v.columnFilters||{}},A=String(d||"").trim();if(A?q[l]=A:delete q[l],v.mode==="schema"){pt(v.db,v.tableId,{sort:v.sort,columnFilters:q});return}let W=I(v.db);W.columnFilters=q,W.page=1,Ee(1)},qe=new Map,me=()=>{N+=1,b=[],_=null,P=-1,m&&(m.hidden=!0,m.innerHTML="")},je=(v,l)=>{let d=String(v||""),h=d.toLocaleLowerCase(),k=String(l||"").toLocaleLowerCase(),q=new Array(d.length).fill(!1),A=(le,ge)=>{for(let Y=le;Y<le+ge;Y+=1)Y>=0&&Y<q.length&&(q[Y]=!0)},W=h.indexOf(k);if(W>=0)for(;W>=0;)A(W,k.length),W=h.indexOf(k,W+k.length);else{let le=[];for(let ge of k.match(/[一-鿿]{2,}/g)||[])for(let Y=0;Y<ge.length-1;Y+=1)le.push(ge.slice(Y,Y+2));le.push(...k.match(/[a-z0-9]+/g)||[]);for(let ge of le){let Y=h.indexOf(ge);for(;Y>=0;)A(Y,ge.length),Y=h.indexOf(ge,Y+ge.length)}}let ie="",oe=0;for(;oe<d.length;)if(q[oe]){let le=oe;for(;le<d.length&&q[le];)le+=1;ie+=`<mark>${n(d.slice(oe,le))}</mark>`,oe=le}else{let le=oe;for(;le<d.length&&!q[le];)le+=1;ie+=n(d.slice(oe,le)),oe=le}return ie||n(d)},kt=(v,l)=>{if(!m)return;let d=v.getBoundingClientRect(),h=Math.min(420,Math.max(220,d.width)),k=Math.min(360,34+l*30),q=d.bottom+4;q+k>window.innerHeight-8&&(q=Math.max(8,d.top-k-4));let A=Math.min(window.innerWidth-h-8,Math.max(8,d.left));m.style.width=`${h}px`,m.style.left=`${A}px`,m.style.top=`${q}px`},ss=v=>{if(!m)return;let l=[...m.querySelectorAll(".schema-suggest-item")];l.length&&(P=Math.max(0,Math.min(l.length-1,v)),l.forEach((d,h)=>{d.classList.toggle("is-active",h===P)}),l[P].scrollIntoView({block:"nearest"}))},St=v=>{let l=b[v],d=_;!l||!d||(me(),mt(d,d.column,l))},gt=async(v,l,d,h)=>{if(!v||!d.trim()){me();return}let k=++N;_={...v,column:l,input:h},P=-1;try{let q=await F.schemaSuggest({database:v.db.id,table:v.tableId,column:l,query:d,limit:1e3});if(k!==N||document.activeElement!==h||!m)return;let A=Array.isArray(q.values)?q.values:[];if(b=A,!A.length){me();return}let W=Number(q.total)>A.length?`\u5171 ${u(q.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${u(A.length)} \u500B`:`\u5171 ${u(q.total)} \u500B\u7B26\u5408`;m.innerHTML=`<div class="schema-suggest-head">${n(W)}</div>${A.map((ie,oe)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${oe}"
            title="${n(ie)}">${je(ie,d)}</button>`).join("")}`,kt(h,A.length),m.hidden=!1}catch{me()}},Pe=()=>{let v=document.activeElement;v instanceof HTMLElement&&v.matches("[data-schema-search]")&&v.blur(),me()},xt=(v,{resetReport:l=!1}={})=>{Pe();let d=I(v);if(Z.innerHTML=fa(r,i),R.innerHTML=In(O(),v.id),E.innerHTML=Dn(S),S==="schema"?(B.hidden=!0,B.innerHTML="",L.hidden=!1,L.innerHTML=_s(v,H(i)?.label||i,y?.tableId||"")):(L.hidden=!0,L.innerHTML="",B.hidden=!1,B.innerHTML=`${ga(v)}${ys(v,d)}<div class="sidebar-note">${va(v)}</div>`),ee(),S==="schema"){let h=y?se(v,y.tableId):"";if(w&&w.key===h){let k=de(v,w.tableId);w.loading?p.innerHTML=ba(k):w.error?p.innerHTML=ha(w.error,k):p.innerHTML=ks(w.result,k,{columnFilters:w.columnFilters||{},searchEnabled:v.id==="postgres"||v.id==="parquet"})}else p.innerHTML=Kn(v);return}l?fe(v):d.result?p.innerHTML=Ot(d.result):fe(v)},ft=(v,{persist:l=!0,resetReport:d=!1}={})=>{let h=O(),k=h.find(A=>A.id===v)||h[0];if(!k)return;M=null,D=null,y=null,w=null,x+=1,o=k.id;let q=J(i,k.id);c[q]||(c[q]=It(k,$)),xt(k,{resetReport:d}),l&&(K(`data.last_database.${i}`,k.id),K("data.last_category",i))},at=(v,{persist:l=!0,resetReport:d=!0,databaseId:h=null}={})=>{let k=H(v)||r[0];if(!k)return;i=k.id,M=null,D=null;let q=k.databases||[],A=h&&q.find(W=>W.id===h)||q.find(W=>W.id===o)||q[0];if(o=A?.id||null,!A){Z.innerHTML=fa(r,i),R.innerHTML=`<div class="sidebar-notice">${te({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,B.innerHTML="",ee();return}ft(A.id,{persist:!1,resetReport:d}),l&&(K("data.last_category",k.id),K(`data.last_database.${k.id}`,A.id))},vt=v=>{let l=I(v),d=B.querySelector("#data-filter-form");d&&(l.values=Dt(d,v,l))},Ee=async(v=null)=>{let l=j(o);if(!l)return;Pe();let d=I(l);vt(l),v!==null&&(d.page=v),(!Number.isFinite(d.page)||d.page<1)&&(d.page=1);let h=++g;M=null,D=null,p.innerHTML=$t(l);let k=B.querySelector("#run-query");ae(k,!0,"\u67E5\u8A62\u4E2D\u2026");try{let q;if(l.id==="indexeddb"?q=await ya(l,d):q=await F.query({database:l.id,filters:ws(l,d),page:d.page,pageSize:d.pageSize}),s||h!==g)return;q.meta={...q.meta||{},column_filters:d.columnFilters||{},searchable:l.id==="postgres"||l.id==="parquet",sort:d.sort||q.meta?.sort||null},d.result=q,d.page=Number(q.page)||d.page,d.pageSize=Number(q.page_size)||d.pageSize,p.innerHTML=Ot(q);let A=H(i)?.label||i;await Rt({kind:"data",title:`${A} \xB7 ${l.label} \xB7 ${q.table||q.label||"query"}`,detail:`${u(q.total)} \u7B46 \xB7 ${G(q.duration_ms)}`,payload:{category:i,database:l.id,filters:ws(l,d),page:d.page,page_size:d.pageSize}}),K("data.last_query",{category:i,database:l.id,filters:ws(l,d),page:d.page,page_size:d.pageSize,at:new Date().toISOString()})}catch(q){if(s||h!==g)return;p.innerHTML=Ht(q,l),C(q.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&h===g&&ae(k,!1)}},nt=async()=>{U.disabled=!0,ae(U,!0,"\u6574\u7406\u4E2D\u2026");try{let[v,l,d,h,k]=await Promise.all([F.catalog(),We("data.last_category","law"),We("data.last_database.law","postgres"),We("data.last_database.judgment","postgres"),We("data.page_size",25)]);if(s)return;a=v,r=Array.isArray(a.categories)?a.categories:[],$=wa.includes(Number(k))?Number(k):25;for(let W of r)for(let ie of W.databases||[]){let oe=J(W.id,ie.id);c[oe]||(c[oe]=It(ie,$))}let q=r.find(W=>W.id===l)||r[0];if(!q){Z.innerHTML="",R.innerHTML=`<div class="sidebar-notice">${te({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let A=q.id==="judgment"?h:d;if(i=q.id,o=null,at(q.id,{persist:!1,resetReport:!0,databaseId:A}),s)return;C("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(v){if(s)return;a=null,r=[],Z.innerHTML="",ee(),R.innerHTML=`<div class="sidebar-notice">${te({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:n(v.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${f("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,p.innerHTML=`<div class="report-empty">${ye({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(U.disabled=!1,ae(U,!1))}};z.addEventListener("change",v=>{let l=v.target;if(l.name==="category"){at(l.value);return}if(l.name==="database"){ft(l.value);return}let d=j(o);if(!d)return;let h=I(d),k=B.querySelector("#data-filter-form");!k||!l.name||(h.values=Dt(k,d,h),h.page=1,l.name==="table"&&(M=null,D=null,h.sort=null,h.columnFilters={},h.result=null,B.innerHTML=ys(d,h),fe(d)))}),z.addEventListener("input",v=>{let l=j(o);if(!l)return;let d=B.querySelector("#data-filter-form");if(!d||!v.target.name||v.target.name==="table")return;let h=I(l);h.values=Dt(d,l,h)}),z.addEventListener("submit",v=>{v.target.id==="data-filter-form"&&(v.preventDefault(),Ee(1))}),z.addEventListener("click",v=>{let l=v.target.closest("[data-action]"),d=l?.dataset.action;if(d==="sidebar-view"){let h=j(o);if(!h)return;let k=I(h),q=B.querySelector("#data-filter-form");q&&S==="query"&&(k.values=Dt(q,h,k)),S=l.dataset.view==="schema"?"schema":"query",xt(h);return}if(d==="select-schema-table"){let h=j(o);if(!h)return;pt(h,l.dataset.tableId||"");return}if(d==="reset"){let h=j(o);if(!h)return;M=null,D=null;let k=I(h);c[J(i,h.id)]=It(h,k.pageSize),B.innerHTML=`${ga(h)}${ys(h,c[J(i,h.id)])}<div class="sidebar-note">${va(h)}</div>`,fe(h),C("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}v.target.closest("#catalog-retry")&&nt()}),p.addEventListener("input",v=>{let l=v.target.closest("[data-schema-search]");if(!l)return;let d=st();if(!d)return;let h=l.dataset.schemaSearch||"",k=l.value,q=`${d.mode}:${d.db.id}:${d.tableId}:${h}`,A=qe.get(q);if(A&&window.clearTimeout(A),!k.trim()){qe.delete(q),me(),mt(d,h,"");return}let W=window.setTimeout(()=>{qe.delete(q),gt(d,h,k,l)},250);qe.set(q,W)}),p.addEventListener("keydown",v=>{let l=v.target.closest("[data-schema-search]");if(!l)return;let d=st();if(d){if(v.key==="Escape"){me();return}if(v.key==="ArrowDown"||v.key==="ArrowUp"){if(!m||m.hidden)return;v.preventDefault();let h=v.key==="ArrowDown"?1:-1;ss(P<0?h>0?0:b.length-1:P+h);return}if(v.key==="Enter"){if(v.preventDefault(),m&&!m.hidden&&P>=0){St(P);return}mt(d,l.dataset.schemaSearch||"",l.value)}}}),m?.addEventListener("mousedown",v=>{v.preventDefault()}),m?.addEventListener("click",v=>{let l=v.target.closest("[data-schema-suggest-index]");l&&St(Number(l.dataset.schemaSuggestIndex))});let rt=v=>{v.target.closest("[data-schema-search]")||m?.contains(v.target)||me()};return document.addEventListener("click",rt),window.addEventListener("scroll",me,!0),window.addEventListener("resize",me),p.addEventListener("keydown",v=>{v.target.matches(".law-jump-input")&&v.key==="Enter"&&(v.preventDefault(),pe(v.target.id))}),p.addEventListener("click",async v=>{let l=v.target.closest("[data-action]");if(!l)return;let d=l.dataset.action,h=j(o),k=h?I(h):null,q=k?.result;if(d==="back-to-results"){ve();return}if(d==="open-law"){Ne({lawKey:l.dataset.lawKey||"",sourceType:l.dataset.lawSource||"",lawName:l.dataset.lawName||""});return}if(d==="open-judgment"){Q({jid:l.dataset.jid||""});return}if(d==="jump-article"){pe(l.dataset.jumpInput||"law-article-jump");return}if(d==="sort-column"){let A=l.dataset.sortKey||"";if(!A||!h)return;if(S==="schema"&&w?.result){let oe=w.sort,le=A==="jdate"||A==="law_modified_date"||A==="article_count"||A==="citation_count"||A==="full_text_length"||A==="created_at"||A==="updated_at",ge=oe?.key===A?oe.direction==="asc"?"desc":"asc":le?"desc":"asc";pt(h,w.tableId,{sort:{key:A,direction:ge},columnFilters:w.columnFilters||{}});return}if(!k)return;let W=k.sort,ie=W?.key===A?W.direction==="asc"?"desc":"asc":A==="jdate"?"desc":"asc";k.sort={key:A,direction:ie},Ee(1);return}if(d==="retry"){Ee(k?.page||1);return}if(q){if(d==="prev-page"){Ee(Math.max(1,Number(q.page)-1));return}if(d==="next-page"){let A=Math.max(1,Math.ceil(Number(q.total)/Number(q.page_size)));Ee(Math.min(A,Number(q.page)+1));return}if(d==="copy-query"){let A=await Tt(q.query_text||"");C(A?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",A?"ok":"warn");return}if(d==="export-json"){let A=`${q.database}-${q.table||"query"}-page-${q.page}.json`;Te(A,JSON.stringify(Jt(q),null,2),"application/json;charset=utf-8"),C(`\u5DF2\u532F\u51FA ${A}`,"ok");return}if(d==="export-csv"){let A=`${q.database}-${q.table||"query"}-page-${q.page}.csv`;Te(A,Ut(q),"text/csv;charset=utf-8"),C(`\u5DF2\u532F\u51FA ${A}`,"ok")}}}),p.addEventListener("change",v=>{let l=v.target.closest("[data-action='select-law-version']");if(l&&M){Ne({lawKey:M.lawKey,sourceType:M.sourceType,lawName:M.lawName,versionId:l.value});return}if(!v.target.matches("[data-page-size]"))return;let d=j(o);if(!d)return;let h=I(d);h.pageSize=Number(v.target.value)||25,h.page=1,K("data.page_size",h.pageSize),Ee(1)}),U.addEventListener("click",()=>{nt()}),await nt(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0;for(let v of qe.values())window.clearTimeout(v);qe.clear(),me(),document.removeEventListener("click",rt),window.removeEventListener("scroll",me,!0),window.removeEventListener("resize",me)}}var Ma=[10,25,50,100],gr=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function Ls(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function fr(e,t=e){return`<option value="${n(e)}">${n(t)}</option>`}function yt(e,t,s,a,r=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${n(t)}</span>
      <span class="field-tag">${n(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${n(e)}">
      ${fr("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${n(i)}" ${String(i)===String(a)?"selected":""}>${n(i)}</option>`).join("")}
    </select>
    ${r?`<span class="field-help">${n(r)}</span>`:""}
  </div>`}function vr(e,t){let s=gr.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${yt("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${yt("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${yt("model","\u6A21\u578B",e.models||[],t.model)}
    ${yt("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${yt("method","\u65B9\u6CD5",e.methods||[],t.method)}
    <div class="field">
      <label class="field-label" for="performance-keyword">
        <span>\u95DC\u9375\u5B57</span>
        <span class="field-tag">keyword</span>
      </label>
      <input class="input" type="text" id="performance-keyword" name="keyword"
        value="${n(t.keyword)}" placeholder="\u7A0B\u5E8F\u3001\u6A21\u7D44\u3001\u8DEF\u5F91\u6216 Request ID" />
    </div>
    <div class="field-row">
      <div class="field">
        <label class="field-label" for="performance-from_date">
          <span>\u65E5\u671F\u8D77</span>
          <span class="field-tag">from_date</span>
        </label>
        <input class="input" type="date" id="performance-from_date" name="from_date"
          value="${n(t.from_date)}" />
      </div>
      <div class="field">
        <label class="field-label" for="performance-to_date">
          <span>\u65E5\u671F\u8FC4</span>
          <span class="field-tag">to_date</span>
        </label>
        <input class="input" type="date" id="performance-to_date" name="to_date"
          value="${n(t.to_date)}" />
      </div>
    </div>
    <div class="field">
      <label class="field-label" for="performance-min_duration">
        <span>\u8017\u6642\u4E0B\u9650\uFF08ms\uFF09</span>
        <span class="field-tag">min_duration</span>
      </label>
      <input class="input" type="number" min="0" step="1" id="performance-min_duration"
        name="min_duration" value="${n(t.min_duration)}" placeholder="\u4F8B\u5982 100" />
    </div>
    <div class="field">
      <label class="field-label" for="performance-sort">
        <span>\u6392\u5E8F</span>
        <span class="field-tag">sort</span>
      </label>
      <select class="select" id="performance-sort" name="sort">${s}</select>
    </div>`}function Aa(){let e=document.getElementById("performance-filter-form");if(!e)return Ls();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Ta(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function br(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),r=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${r}.${i}`}function hr(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"is-client":t.includes("judgment.rag")?"is-rag":t.includes("judgment.web.app")?"is-api":t.includes("judgment.web.query")?"is-data":t.includes("judgment.judgment_index")?"is-index":"is-other"}function $r(e){let t=new Map(e.map(a=>[a.seq,a.parent_seq])),s=new Map;for(let a of e){if(Number.isInteger(a.depth)){s.set(a.seq,a.depth);continue}let r=0,i=a.parent_seq,o=0;for(;i&&t.has(i)&&o<20;)r+=1,i=t.get(i),o+=1;s.set(a.seq,r)}return s}function yr(e){let t=Object.entries(e||{});if(!t.length)return'<span class="muted">\u7121\u53C3\u6578</span>';let s=t.slice(0,8),a=t.length-s.length;return`<div class="flow-param-list">${s.map(([r,i])=>`<span class="flow-param">
        <span class="flow-param-key">${n(r)}</span>
        <span class="flow-param-value">${n(Ta(i))}</span>
      </span>`).join("")}${a>0?`<span class="flow-param-more">+${a}</span>`:""}</div>`}function wr(e){let t=new Map,s=Math.max(0,Number(e[0]?.offset_ms)||0);return e.forEach((a,r)=>{let i=Math.max(0,Number(a.offset_ms)||0),o=Math.max(0,Number(a.duration_ms)||0),c=e[r+1],g=c?Math.max(i,Number(c.offset_ms)||i):null,$=g===null?i+o:g,S=Math.max(0,$-i),y=Math.max(0,$-s);t.set(a.seq,{offset:i,duration:o,lap:S,cumulative:y})}),t}function _r(e,t,s,a){let r=a.get(e.seq)||{},i=Math.max(0,Number(r.duration)||0),o=Math.max(0,Number(r.offset)||0),c=Math.max(0,Number(r.lap)||0),g=Math.max(0,Number(r.cumulative)||0),$=Math.max(t,o+i,1),S=Math.min(100,o/$*100),y=Math.min(100-S,Math.max(.6,c/$*100)),w=s.get(e.seq)||0,b=br(e.started_at)||`+${o.toFixed(0)} ms`,_=e.started_at?`\u958B\u59CB\uFF1A${ne(e.started_at)} \xB7 +${o.toFixed(1)} ms`:`\u958B\u59CB\uFF1A+${o.toFixed(1)} ms`;return`<div class="flow-segment ${e.status==="error"?"is-error":""}" style="--depth:${Math.min(w,8)}">
    <div class="flow-segment-head">
      <span class="flow-seq">#${n(String(e.seq??"\u2014"))}</span>
      <span class="flow-segment-name">${n(e.name||"unnamed")}</span>
      <span class="flow-segment-start" title="${n(_)}">${n(b)}</span>
      <span class="flow-segment-duration" title="\u8DDD\u4E0B\u4E00\u9EDE ${G(c)}\uFF1B\u7D2F\u8A08 ${G(g)}">${G(c)}</span>
      <span class="flow-segment-span" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${G(g)}</span>
    </div>
    <div class="flow-segment-loc">
      <span class="flow-segment-loc-text">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</span>
      <span class="flow-segment-mobile-cum" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${G(g)}</span>
    </div>
    <div class="flow-track" title="\u958B\u59CB +${o.toFixed(1)} ms \xB7 \u8DDD\u4E0B\u4E00\u9EDE ${G(c)} \xB7 \u7D2F\u8A08 ${G(g)}">
      <span class="flow-bar ${hr(e)}" style="left:${S.toFixed(2)}%;width:${y.toFixed(2)}%"></span>
    </div>
    ${yr(e.params)}
    ${e.error?`<div class="flow-segment-error">${n(e.error)}</div>`:""}
  </div>`}function kr(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},r=Math.max(...t.map(c=>Number(c.avg_ms)||0),1),i=a.samples?G(a.avg_total_ms??0):"\u2014",o=a.samples?G(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
    <div class="perf-stat-grid">
      <div class="perf-stat">
        <span class="perf-stat-value">${u(e?.avg_segments??0)}</span>
        <span class="perf-stat-label">\u5E73\u5747\u6BB5\u6578\uFF08\u6A23\u672C\uFF09</span>
      </div>
      <div class="perf-stat">
        <span class="perf-stat-value">${u(e?.max_segments??0)}</span>
        <span class="perf-stat-label">\u6700\u5927\u6BB5\u6578</span>
      </div>
      <div class="perf-stat">
        <span class="perf-stat-value">${u(e?.sample_size??0)}</span>
        <span class="perf-stat-label">Flow \u6A23\u672C</span>
      </div>
      <div class="perf-stat">
        <span class="perf-stat-value">${i}</span>
        <span class="perf-stat-label">\u5E73\u5747 Client \u5168\u6D41\u7A0B</span>
      </div>
      <div class="perf-stat">
        <span class="perf-stat-value">${o}</span>
        <span class="perf-stat-label">\u5E73\u5747\u524D\u7AEF Render</span>
      </div>
    </div>
    <div class="perf-flow-stats-grid">
      <div class="perf-flow-stat-panel">
        <div class="report-section-head">
          <span class="report-section-title">\u6A21\u578B\u4F7F\u7528\u6B21\u6578</span>
          <span class="muted" style="font-size:9.5px">flow.summary.models</span>
        </div>
        ${s.length?`<div class="perf-model-list">${s.map(c=>`<div class="perf-model-row">
                    <span class="chip">${n(c.label||"\u2014")}</span>
                    <span class="perf-model-count">${u(c.value)} \u6B21${c.avg_ms?` \xB7 \u5E73\u5747 ${G(c.avg_ms)}`:""}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u65B0\u7684 Flow \u6703\u5F9E params.model \u81EA\u52D5\u5F59\u6574\u3002</p>'}
      </div>
      <div class="perf-flow-stat-panel">
        <div class="report-section-head">
          <span class="report-section-title">\u6700\u6162\u5340\u6BB5\uFF08\u5E73\u5747\uFF09</span>
          <span class="muted" style="font-size:9.5px">\u6700\u8FD1 ${u(e?.sample_size??0)} \u7B46</span>
        </div>
        ${t.length?`<div class="perf-seg-list">${t.slice(0,6).map(c=>`<div class="perf-seg-row">
                    <span class="perf-seg-name" title="${n(c.label)}">${n(c.label)}</span>
                    <span class="perf-seg-track"><span style="width:${Math.max(2,(Number(c.avg_ms)||0)/r*100).toFixed(1)}%"></span></span>
                    <span class="perf-seg-ms">${G(c.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function ke(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),r=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(r).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:r?`${r}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function ja(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function Sr(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let r=Number(a.points_per_second)||0,i=Math.max(2,r/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${n(ja(a))}</strong>
          <span>${n(ne(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${n(`${u(a.indexed_count)} \u7B46 \xB7 ${ke(a.duration_ms)} \xB7 ${u(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${r.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${u(a.indexed_count)} \u7B46 \xB7 ${ke(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function xr(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${n(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${n(`${s.label} ${ke(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${n(s.key)}"></i>
            <span>${n(s.label)}</span>
            <strong>${ke(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 Ollama Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function qr(e,t){let s=(Array.isArray(e)?e:[]).map(N=>({elapsed:Math.max(0,Number(N.elapsed_s)||0),indexed:Math.max(0,Number(N.indexed)||0)})).filter(N=>N.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(N=>N.elapsed),(Number(t)||0)/1e3,1),r=Math.max(...s.map(N=>N.indexed),1),i=760,o=150,c=12,g=12,$=i-c*2,S=o-g*2,y=s.map(N=>[c+N.elapsed/a*$,o-g-N.indexed/r*S]),w=y.map(([N,M],D)=>`${D===0?"M":"L"}${N.toFixed(1)},${M.toFixed(1)}`).join(" "),x=`${w} L${y[y.length-1][0].toFixed(1)},${o-g} L${y[0][0].toFixed(1)},${o-g} Z`,b=Math.max(1,Math.ceil(y.length/14)),_=y.map(([N,M],D)=>D%b===0||D===y.length-1?`<circle cx="${N.toFixed(1)}" cy="${M.toFixed(1)}" r="2.6" />`:"").join(""),P=[0,1,2,3].map(N=>{let M=g+S/3*N;return`<line x1="${c}" y1="${M.toFixed(1)}" x2="${i-c}" y2="${M.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${u(r)} \u7B46 \xB7 ${ke(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${P}
      <path d="${x}" class="index-progress-area"></path>
      <path d="${w}" class="index-progress-line"></path>
      ${_}
      <line x1="${c}" y1="${o-g}" x2="${i-c}" y2="${o-g}" class="index-chart-axis"></line>
      <line x1="${c}" y1="${g}" x2="${c}" y2="${o-g}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${ke(a*500)}</span>
      <span>${ke(a*1e3)}</span>
    </div>
  </div>`}function Ar(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},r=t.coverage||{},i=r.total_judgments>0?`${u(r.indexed_judgments)} / ${u(r.total_judgments)}\uFF08${(100*r.indexed_judgments/r.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:u(t.indexed_count),note:`${u(t.batch_count)} \u6279 \xD7 ${u(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:ke(t.duration_ms),note:`${u(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:ke(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${ke(t.batch_min_ms)} \xB7 \u6700\u6162 ${ke(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${u(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${n(ja(t))}</span>
    </div>
    <div class="index-perf-summary">
      ${o.map(c=>`<div class="index-perf-stat">
            <div class="summary-label">${n(c.label)}</div>
            <div class="index-perf-value">${n(c.value)}</div>
            <div class="index-perf-note">${n(c.note)}</div>
          </div>`).join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${n(ne(t.started_at))}</span>
      <span><strong>batch</strong> ${u(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${u(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${u(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${n(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${ke(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${Sr(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${ke(t.duration_ms)}</span>
        </div>
        ${xr(t)}
      </div>
    </div>
    ${qr(t.progress,t.duration_ms)}
  </section>`}function Lr(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${u(i)}\u2013${u(o)} / ${u(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Ma.map(c=>`<option value="${c}" ${c===s?"selected":""}>${c}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${f("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${f("chevronRight",13)}</button>
    </div>
  </div>`}function Mr(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((b,_)=>Number(b.seq)-Number(_.seq)):[],r=s?.summary||{},i=Array.isArray(r.models)?r.models:[],o=s?.client||{},c=s?.metadata||{},g=c.question||"",$=c.answer||"",S=g||$?`<div class="perf-flow-qa">
          ${g?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${n(g)}</span></div>`:""}
          ${$?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${n($)}</span></div>`:""}
        </div>`:"",y=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(b=>(Number(b.offset_ms)||0)+(Number(b.duration_ms)||0)),1),w=$r(a),x=wr(a);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${n(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${n(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${n(e.method||"")} ${n(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${ne(e.started_at)}</span>
      <span class="perf-record-duration">${G(e.duration_ms)}</span>
      ${re(e.status)}
      <span class="perf-record-chevron">${f("chevronRight",14)}</span>
    </summary>
    <div class="perf-record-body">
      <div class="perf-flow-meta">
        <span><strong>Request</strong> <span class="mono">${n(e.request_id||s?.request_id||"\u2014")}</span></span>
        <span><strong>Server</strong> ${G(e.duration_ms)}</span>
        ${o.total_ms?`<span><strong>Client \u5168\u6D41\u7A0B</strong> ${G(o.total_ms)}</span>`:""}
        ${o.render_ms!==void 0?`<span><strong>Render</strong> ${G(o.render_ms)}</span>`:""}
        <span><strong>Flow</strong> ${a.length} \u6BB5</span>
        ${a.length?"<span><strong>\u9EDE\u4F4D</strong> \u5340\u9593\uFF1D\u4E0B\u4E00\u9EDE\u958B\u59CB\uFF0D\u672C\u9EDE\u958B\u59CB\uFF1B\u7D2F\u8A08\uFF1D\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\uFF0C\u6700\u5F8C\u4E00\u9EDE\u70BA\u7E3D\u6642\u9593</span>":""}
      </div>
      ${S}
      ${i.length?`<div class="chips perf-record-models">${i.map(b=>`<span class="chip">${n(b)}</span>`).join("")}</div>`:""}
      ${a.length?`<div class="flow-axis"><span>0 ms</span><span>${G(y)}</span></div>
            <div class="flow-timeline">${a.map(b=>_r(b,y,w,x)).join("")}</div>`:`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${n(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${n(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var wt={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"},La={embedding:"EMB",retrieval:"\u6AA2\u7D22",context:"\u53D6\u6587",llm:"LLM",validation:"\u9A57\u8B49",overhead:"\u5176\u4ED6"};function Ea(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}function Tr(e){let t=String(e.status||"pending"),s=Math.max(0,Math.min(100,Number(e.progress)||0)),a=t==="pending"?0:t==="running"?Math.max(s,12):100,r=t==="running"?"\u57F7\u884C\u4E2D\u2026":t==="pending"?"\u7B49\u5F85":e.duration_ms?G(e.duration_ms):Ea(t);return`<div class="test-flow-step is-${n(t)}">
    <div class="test-flow-step-head">
      <span class="test-flow-model" title="${n(e.model||"")}">${n(e.model||"\u2014")}</span>
      <span class="test-flow-step-meta">${n(r)}</span>
    </div>
    <div class="test-flow-step-loc">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</div>
    <div class="test-flow-track">
      <span class="test-flow-bar" style="width:${a}%"></span>
    </div>
    ${e.error_message?`<div class="test-flow-error">${n(e.error_message)}</div>`:""}
    ${e.details&&Object.keys(e.details).length?`<div class="test-flow-details">${n(Object.entries(e.details).slice(0,4).map(([i,o])=>`${i}=${Ta(o)}`).join(" \xB7 "))}</div>`:""}
  </div>`}function jr(e,t){if(!t.length)return"";let s=t.reduce((a,r)=>a+(Number(r.progress)||0),0)/t.length;return`<section class="test-flow-stage">
    <div class="test-flow-stage-head">
      <span class="test-flow-stage-title">${n(wt[e]||e)}</span>
      <span class="test-flow-stage-meta">${t.length} \u500B\u7A0B\u5E8F \xB7 ${Math.round(s)}%</span>
    </div>
    <div class="test-flow-stage-steps">${t.map(Tr).join("")}</div>
  </section>`}function Ra(e,t){let s=Date.now(),a=new Map;for(let y of t){let w=Number(y.duration_ms)||0;if(y.status==="running"&&y.started_at){let x=Date.parse(y.started_at);Number.isFinite(x)&&(w=Math.max(w,s-x))}a.set(y.stage,(a.get(y.stage)||0)+w)}let r=Array.isArray(e.stage_order)?e.stage_order:Object.keys(wt),i=[],o=new Set;for(let y of r)t.some(w=>w.stage===y)&&(o.add(y),i.push({stage:y,label:wt[y]||y,short:La[y]||y,duration:a.get(y)||0}));for(let[y,w]of a)o.has(y)||i.push({stage:y,label:wt[y]||y,short:La[y]||y,duration:w});let c=i.reduce((y,w)=>y+w.duration,0),g=Number(e.total_ms)||0,$=Math.max(c,g),S=Math.max(0,$-c);return S>1&&i.push({stage:"overhead",label:"\u5176\u4ED6\uFF0F\u6392\u7A0B",short:"\u5176\u4ED6",duration:S}),{entries:i,total:$||c,stepTotal:c}}function Er(e,t){let{entries:s,total:a}=Ra(e,t),r=s.filter(o=>o.duration>0).map(o=>{let c=a?o.duration/a*100:0;return`<span class="test-flow-time-seg stage-${n(o.stage)}" style="width:${c.toFixed(2)}%" title="${n(o.label)} \xB7 ${G(o.duration)}\uFF08${c.toFixed(1)}%\uFF09">${c>=8?n(o.short):""}</span>`}).join(""),i=s.map(o=>{let c=a?o.duration/a*100:0;return`<span class="test-flow-legend-item">
        <i class="test-flow-dot stage-${n(o.stage)}"></i>
        <span>${n(o.label)}</span>
        <strong>${G(o.duration)}</strong>
        <em>${c.toFixed(1)}%</em>
      </span>`}).join("");return`<div class="test-flow-time">
    <div class="test-flow-total-head">
      <span>\u7E3D\u6D41\u7A0B\u6642\u9593\uFF08\u4F9D\u968E\u6BB5\uFF09</span>
      <span>${G(a)}${e.status==="running"?" \xB7 \u4F30\u7B97\u4E2D":""}</span>
    </div>
    <div class="test-flow-time-bar">
      ${r||'<span class="test-flow-time-empty">\u5C1A\u7121\u968E\u6BB5\u8017\u6642</span>'}
    </div>
    <div class="test-flow-legend">${i}</div>
    ${e.status==="running"?'<div class="test-flow-time-note">\u57F7\u884C\u4E2D\u7684\u968E\u6BB5\u4EE5\u958B\u59CB\u6642\u9593\u4F30\u7B97\uFF1B\u5B8C\u6210\u5F8C\u4EE5\u4F3A\u670D\u5668\u56DE\u5831\u7684 duration \u70BA\u6E96\u3002</div>':""}
  </div>`}function ct(e,t,s,a={}){let r=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(M=>`<option value="${n(M.run_id)}" ${M.run_id===s?"selected":""}>${n(Ea(M.status))} \xB7 ${n((M.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${n(ne(M.started_at))}</option>`)].join(""),o=r?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${f("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${f("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,c=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?re(e.status):""}</div>
      <div class="test-flow-question">${e?n(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${c}
      ${ye({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let g=Array.isArray(e.steps)?e.steps:[],$=new Map;for(let M of g)$.has(M.stage)||$.set(M.stage,[]),$.get(M.stage).push(M);let y=(Array.isArray(e.stage_order)?e.stage_order:Object.keys(wt)).map(M=>jr(M,$.get(M)||[])).join(""),w=e.models||{},x=Ra(e,g),b=e.status==="running"?`${G(x.total)}\uFF08\u4F30\u7B97\uFF09`:G(e.total_ms),_=g.find(M=>M.stage==="llm"&&M.model===e.summary?.primary_model)||g.find(M=>M.stage==="llm"&&M.details?.answer_preview),P=e.answer||_?.details?.answer_preview||"",N=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${e.summary?.primary_model?`<span class="mono">${n(e.summary.primary_model)}</span>`:""}
    </div>
    <p>${P?n(P):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${c}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${n(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${n(ne(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${b}</span>
      <span><strong>Embedding</strong> ${Array.isArray(w.embedding)?w.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(w.llm)?w.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${n(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${N}
    <div class="test-flow-stages">${y||'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}</div>
    <div class="test-flow-total">
      <div class="test-flow-total-head">
        <span>\u7E3D\u6D41\u7A0B\u9032\u5EA6</span>
        <span>${Number(e.progress)||0}%</span>
      </div>
      <div class="test-flow-track is-total ${e.status==="running"?"is-running":""}">
        <span class="test-flow-bar is-total" style="width:${Math.max(0,Math.min(100,Number(e.progress)||0))}%"></span>
      </div>
    </div>
    ${Er(e,g)}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":r?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${e.summary?.primary_model?`<span class="mono">primary=${n(e.summary.primary_model)}</span>`:""}
    </div>
  </div>`}function Rr(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},r=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${re(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${u(e.total)} \u7B46\u7B26\u5408 \xB7 ${G(e.duration_ms)} \xB7
          \u6BCF\u6B21\u57F7\u884C\u6309\u9215\u7684\u5B8C\u6574 Flow
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${f("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${f("file",14)}<span>JSON</span></button>
      </div>
    </div>
    ${s.length?`<div class="summary-strip">${s.map(i=>`<div class="summary-item">
                <div class="summary-label">${n(i.label)}</div>
                <div class="summary-value">${n(i.value)}</div>
              </div>`).join("")}</div>`:""}
    ${Ar(r)}
    ${kr(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>Mr(i,o)).join(""):ye({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${Lr(e)}
    <details class="perf-query-details">
      <summary>\u67E5\u8A62\u8A9E\u53E5\u8207\u8B66\u544A</summary>
      <div class="query-box">
        <pre class="query-code">${n(e.query_text||"\u2014")}</pre>
        <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
          ${f("copy",12)}<span>\u8907\u88FD</span>
        </button>
      </div>
      ${Array.isArray(e.warnings)&&e.warnings.length?`<div class="warnings">${e.warnings.map(i=>`<div class="warning-line">${n(i)}</div>`).join("")}</div>`:""}
    </details>
  </div>`}async function Cr(e,t){let s=!1,a=Ls(),r={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,c=null;e.innerHTML=`<section class="page data-page performance-page">
    <div class="page-header">
      <div class="data-page-heading">
        <div class="eyebrow">PERFORMANCE</div>
        <div class="data-title-line">
          <h1 class="page-title">\u6548\u80FD\u5831\u8868</h1>
          <p class="page-subtitle data-page-subtitle">\u8A18\u9304\u6BCF\u6B21\u57F7\u884C\u6309\u9215\u5F9E\u63A5\u6536\u547D\u4EE4\u5230\u56DE\u50B3\u7D50\u679C\u7684\u5B8C\u6574 Flow\uFF1A\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u3001\u6A21\u578B\u8207\u5340\u6BB5\u8017\u6642\u3002</p>
        </div>
      </div>
      <div class="page-actions">
        <span class="badge badge-neutral badge-mono" id="performance-meta">PERFORMANCE \xB7 \u8B80\u53D6\u4E2D</span>
        <button class="btn btn-secondary" type="button" id="performance-refresh">
          ${f("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    <div class="status-layout performance-layout">
      <aside class="status-sidebar performance-sidebar" aria-label="\u6548\u80FD\u5831\u8868\u529F\u80FD">
        <div class="status-sidebar-head">
          <div class="eyebrow">PERFORMANCE</div>
          <div class="status-sidebar-title">\u6548\u80FD\u8207 Benchmark</div>
        </div>
        <nav class="status-tab-list" aria-label="\u6548\u80FD\u5831\u8868\u529F\u80FD">
          <button class="status-tab is-active" type="button" data-performance-tab="overview" aria-current="page">
            <span class="status-tab-icon">${f("activity",15)}</span>
            <span class="status-tab-copy"><strong>\u6548\u80FD\u7E3D\u89BD</strong><small>Flow\u3001\u5340\u6BB5\u8017\u6642\u8207\u7D22\u5F15\u6548\u80FD</small></span>
          </button>
          <button class="status-tab" type="button" data-performance-tab="benchmark">
            <span class="status-tab-icon">${f("brain",15)}</span>
            <span class="status-tab-copy"><strong>RAG Benchmark</strong><small>\u984C\u5EAB\u3001\u6A21\u578B\u3001\u8A55\u5206\u8207\u540C\u984C\u6B77\u53F2</small></span>
          </button>
        </nav>
        <div class="status-sidebar-foot">
          <span>Benchmark \u7D22\u5F15</span>
          <span class="mono">judgments_current</span>
        </div>
      </aside>
      <section class="status-panel performance-panel">
        <div id="performance-panel-overview">
          <div class="data-layout performance-data-layout">
            <aside class="card query-sidebar" aria-label="\u6548\u80FD\u7BE9\u9078">
              <form id="performance-filter-form" autocomplete="off">
                <div class="filter-block">
                  <div class="filter-head">
                    <span class="filter-title">Metadata \u689D\u4EF6</span>
                    <button class="filter-reset" type="button" data-action="reset">\u91CD\u8A2D</button>
                  </div>
                  <div class="filter-fields" id="performance-filter-fields">
                    <div class="skeleton skeleton-line" style="width:90%"></div>
                    <div class="skeleton skeleton-line" style="width:72%"></div>
                  </div>
                </div>
                <div class="sidebar-actions">
                  <button class="btn btn-primary" type="submit" id="performance-run">
                    ${f("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
                  </button>
                </div>
              </form>
              <div class="sidebar-note">Flow \u5BEB\u5165 PostgreSQL \u7684 performance_records.flow\uFF08JSON\uFF09\uFF0C\u9810\u8A2D\u4FDD\u7559\u81F3\u5C11 90 \u5929\uFF1B\u53EF\u4F9D\u6A21\u578B\u3001\u7A0B\u5E8F\u3001\u6A21\u7D44\u8207\u8017\u6642\u7BE9\u9078\u3002</div>
            </aside>
            <section class="query-main" id="performance-main" aria-label="\u6548\u80FD\u5831\u8868" aria-live="polite">
              <div id="performance-test-flow"></div>
              <div id="performance-report">${$t({label:"\u6548\u80FD\u5831\u8868"})}</div>
            </section>
          </div>
        </div>
        <div id="performance-panel-benchmark" hidden></div>
      </section>
    </div>
  </section>`;let g=e.querySelector("#performance-filter-fields"),$=e.querySelector("#performance-filter-form"),S=e.querySelector("#performance-test-flow"),y=e.querySelector("#performance-report"),w=e.querySelector("#performance-meta"),x=e.querySelector("#performance-refresh"),b=[...e.querySelectorAll("[data-performance-tab]")],_={overview:e.querySelector("#performance-panel-overview"),benchmark:e.querySelector("#performance-panel-benchmark")},P="overview",N=j=>{P=j;for(let J of b){let I=J.dataset.performanceTab===j;J.classList.toggle("is-active",I),I?J.setAttribute("aria-current","page"):J.removeAttribute("aria-current")}for(let[J,I]of Object.entries(_))I&&(I.hidden=J!==j);j==="benchmark"&&(w.textContent="BENCHMARK \xB7 RAG")},M=ma(e,{onNavigate:j=>N(j)}),D=j=>{N(j),j==="benchmark"&&M.show()};e.addEventListener("click",j=>{let J=j.target.closest("[data-performance-tab]");J&&D(J.dataset.performanceTab||"overview")});let z=null,Z=[],R="",E=null,B="",L=()=>{g.innerHTML=vr(r,a)},p=()=>{let j=JSON.stringify({selected:R,tick:z?.status==="running"?Math.floor(Date.now()/1e3):0,runs:Z.map(J=>`${J.run_id}:${J.status}`),run:z?{run_id:z.run_id,status:z.status,progress:z.progress,steps:(z.steps||[]).map(J=>`${J.stage}:${J.model}:${J.status}:${J.progress}`)}:null});j!==B&&(B=j,S.innerHTML=ct(z,Z,R))},m=async()=>{try{let j=await F.testRuns(30);if(s)return;Z=Array.isArray(j.runs)?j.runs:[]}catch{if(s)return;Z=[]}},T=async()=>{try{let j=R?await F.testRun(R):await F.testRunCurrent();if(s)return;z=j.run||null,!R&&z&&z.status!=="running"&&!Z.some(J=>J.run_id===z.run_id)&&await m(),p()}catch{if(s)return;z=null,p()}},U=async()=>{s||(R||await T(),s||(E=window.setTimeout(U,1500)))};S.addEventListener("change",async j=>{j.target.id==="test-run-select"&&(R=String(j.target.value||""),await T())}),S.addEventListener("click",async j=>{j.target.closest("#test-flow-refresh")&&(R="",await m(),await T())});let H=async(j=i)=>{i=Math.max(1,Number(j)||1),a=Aa(),y.innerHTML=$t({label:"\u6548\u80FD\u5831\u8868"});let J=e.querySelector("#performance-run");ae(J,!0,"\u67E5\u8A62\u4E2D\u2026");try{let I=await F.performance(a,i,o);if(s)return;c=I,i=Number(I.page)||i,o=Number(I.page_size)||o,y.innerHTML=Rr(I),w.textContent=`PERFORMANCE \xB7 ${u(I.total)} \u7B46`,w.className="badge badge-neutral badge-mono"}catch(I){if(s)return;y.innerHTML=Ht(I,{label:"\u6548\u80FD\u5831\u8868"}),C(I.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||ae(J,!1)}},O=async()=>{try{r=await F.performanceOptions()}catch{r={processes:[],modules:[],statuses:[],methods:[],models:[]}}L()};return $.addEventListener("submit",j=>{j.preventDefault(),H(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=Ls(),i=1,L(),H(1)}),x.addEventListener("click",async()=>{if(P==="benchmark"){ae(x,!0,"\u6574\u7406\u4E2D\u2026");try{await M.refresh()}finally{s||ae(x,!1)}return}a=Aa(),x.disabled=!0,ae(x,!0,"\u6574\u7406\u4E2D\u2026"),await O(),await m(),s||await T(),s||await H(1),s||(x.disabled=!1,ae(x,!1))}),y.addEventListener("click",async j=>{let J=j.target.closest("[data-action]");if(!J||!c)return;let I=J.dataset.action;if(I==="retry"){H(i);return}if(I==="prev-page"){H(Math.max(1,Number(c.page)-1));return}if(I==="next-page"){let K=Math.max(1,Math.ceil(Number(c.total)/Number(c.page_size)));H(Math.min(K,Number(c.page)+1));return}if(I==="copy-query"){let K=await Tt(c.query_text||"");C(K?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",K?"ok":"warn");return}if(I==="export-json"){let K=`performance-page-${c.page}.json`;Te(K,JSON.stringify(Jt(c),null,2),"application/json;charset=utf-8"),C(`\u5DF2\u532F\u51FA ${K}`,"ok");return}if(I==="export-csv"){let K=`performance-page-${c.page}.csv`;Te(K,Ut(c),"text/csv;charset=utf-8"),C(`\u5DF2\u532F\u51FA ${K}`,"ok")}}),y.addEventListener("change",j=>{j.target.matches("[data-page-size]")&&(o=Number(j.target.value)||25,Ma.includes(o)||(o=25),H(1))}),await Promise.allSettled([O(),m()]),s||(await T(),await H(1),U()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,E&&window.clearTimeout(E),M.destroy()}}var Nr=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function Ca(){return`<div class="answer-placeholder">
    <span class="empty-icon">${f("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}var Pr={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"Ollama embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"Ollama LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function Br(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`Ollama run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`Ollama embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:Pr[t]||t||"backend step"}function Na(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function Pa(e){let t=Number(e);return Number.isFinite(t)?`${u(Math.max(0,Math.round(t)))} ms`:"\u2014"}function Ts(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function Ir(){return`<div class="rag-process is-open" id="rag-process">
    <div class="rag-process-control">
      <button type="button" class="rag-process-toggle" id="rag-process-toggle"
        aria-expanded="true" aria-controls="rag-process-body" title="\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B">
        <span class="rag-process-toggle-label-collapsed">\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
        <span class="rag-process-toggle-label-expanded">\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
        ${f("chevronDown",11)}
      </button>
      <span class="rag-process-summary" id="rag-process-summary">\u57F7\u884C\u4E2D\u2026</span>
    </div>
    <div class="rag-process-body" id="rag-process-body">
      <div class="rag-process-list" id="rag-process-list">
        <div class="rag-process-item is-running" data-process-key="frontend" style="--depth:0">
          <span class="rag-process-dot"></span>
          <span class="rag-process-label">frontend HTTP request \u2192 FastAPI</span>
          <span class="rag-process-meta">\u9001\u51FA</span>
        </div>
      </div>
      <div class="rag-process-hint">\u986F\u793A\u6CD5\u898F\u7D50\u679C\u6642\u6703\u5148\u6536\u5408\uFF1B\u9EDE\u64CA\u6309\u9215\u53EF\u5C55\u958B\u5B8C\u6574\u6D41\u7A0B\u3002</div>
    </div>
  </div>`}function Dr(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),r=performance.now(),i=new Map,o=(w,x,b)=>{let _=w.querySelector(x);_&&(_.textContent=b)},c=w=>{if(w.failed){o(w.element,".rag-process-meta","\u5931\u6557");return}if(w.hasChildren){o(w.element,".rag-process-meta","");return}o(w.element,".rag-process-meta",Pa(w.durationMs))},g=w=>{let x=w-1,b=[...i.values()].reverse();for(let _ of b){if(x<0)break;_.depth<=x&&(_.hasChildren||(_.hasChildren=!0,_.element.dataset.hasChildren="true",_.finished&&c(_)),x=_.depth-1)}},$=w=>{if(!s)return null;let x=String(w?.seq??`step-${i.size+1}`),b=i.get(x);if(!b){let _=Math.max(0,Math.min(6,Number(w?.depth)||0));g(_);let P=document.createElement("div");P.className="rag-process-item is-running",P.dataset.processKey=x,P.style.setProperty("--depth",String(_)),P.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(P),b={element:P,depth:_,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(x,b)}return o(b.element,".rag-process-label",Br(w)),b.element.title=Na(w),b};return{step:w=>{let x=w?.segment;if(!x)return;let b=$(x);if(b){if(w.type==="segment_start"){b.element.classList.add("is-running"),o(b.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(w.type==="segment_end"){let _=x.status==="error";b.element.classList.remove("is-running"),b.element.classList.toggle("is-error",_),b.finished=!0,b.failed=_,b.durationMs=Number(x.duration_ms)||0,c(b),b.element.title=[Na(x),_&&x.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(w=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(_=>{_.classList.remove("is-running");let P=_.dataset.hasChildren==="true";o(_,".rag-process-meta",P?"":w?"\u5B8C\u6210":"\u4E2D\u65B7")});let x=s?.children.length||i.size,b=Pa(Math.max(0,performance.now()-r));return a&&(a.textContent=w?`\u5B8C\u6210 \xB7 ${x} \u6B65 \xB7 ${b}`:`\u5931\u6557 \xB7 ${x} \u6B65`),t.classList.add("is-complete"),Ts(t,!1),t.outerHTML},collapse:()=>Ts(t,!1)}}function Or(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${f("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":Ir()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${n(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function Ba(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Qt(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let r=String(e||"").trim();return r?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${n(t||r)}"
    data-source-type="${n(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${n(r)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${n(r)} \u7684\u5B8C\u6574\u689D\u6587">${n(a||r)}</button>`:""}function Fr(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(c=>`<span>${n(c)}</span>`).join(""),r=(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(c=>Qt(c)).join(""),i=e.jid?` data-action="open-parquet-judgment"
        data-jid="${n(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${n(e.jid)}"`:"",o=e.pdf_url?`<a class="citation-link" href="${n(e.pdf_url)}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${f("external",11)}</a>`:"";return`<article class="citation">
    <span class="citation-index">[${e.index??t+1}]</span>
    <div class="citation-body">
      <div class="citation-head"${i}>
        <h4 class="citation-name">${n(e.jid||"\u672A\u77E5\u6848\u865F")}</h4>
        <div class="citation-meta">${a||"<span>\u5224\u6C7A metadata</span>"}</div>
        ${e.title?`<div class="citation-meta"><span>\u6848\u7531\uFF1A${n(e.title)}</span></div>`:""}
      </div>
      ${r?`<div class="chips" style="margin-top:8px">${r}</div>`:""}
      ${e.snippet?`<p class="citation-snippet">${n(e.snippet)}</p>`:""}
    </div>
    <div class="citation-links">${o}</div>
  </article>`}function Hr(e,t){let s=[e.law_level,e.law_category,e.article_count?`${u(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${n(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${f("external",11)}</a>`:"",r=e.law_key||e.law_name||"",i=r?` data-action="open-law-source"
        data-law-key="${n(r)}"
        data-source-type=""
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body"${i}>
      <h4 class="citation-name">${n(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${s||"<span>\u6CD5\u898F metadata</span>"}</div>
      ${e.snippet?`<p class="citation-snippet">${n(e.snippet)}</p>`:""}
    </div>
    ${a}
  </article>`}function Ur(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",r=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${n(s)}</span>`,a,e.law_category,e.article_count?`${u(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${Le(e.law_modified_date)}`:""].filter(Boolean).map(x=>`<span>${x}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${n(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${n(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,c=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${n(o.entity||"")}\u300D\u7684\u5224\u6C7A ${u(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${u(o.law_count||0)} \u6B21</span>
      </div>`:"",g=e.law_key||"",$=e.source_type||"",S=(Array.isArray(e.articles)?e.articles:[]).map(x=>{let b=String(x.article_no||"");return`<div class="law-source-article"${g&&b?` data-action="open-law-source"
        data-law-key="${n(g)}"
        data-source-type="${n($)}"
        data-article-no="${n(b)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${n(b)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} ${n(b)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${n(x.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${n(x.article_content||"")}</p>
      </div>`}).join(""),y=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${f("external",11)}</a>`:"",w=e.law_key?` data-action="open-law-source"
        data-law-key="${n(e.law_key)}"
        data-source-type="${n(e.source_type||"")}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u672C\u5730 Parquet \u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation law-source">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body"${w}>
      <h4 class="citation-name">${n(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${r}</div>
      ${i}
      ${c}
      ${S}
    </div>
    <div class="citation-links">${y}</div>
  </article>`}function Jr(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function Qr(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${n(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",r=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(r==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),c=Number(s.article_count||0),g=s.index!=null?`<span class="law-answer-index">[${n(String(s.index))}]</span>`:"",$=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${n(a)}"
            data-source-type="${n(r)}"
            title="\u9EDE\u64CA\u958B\u555F ${n(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${n(i)} \u7684\u5B8C\u6574\u689D\u6587">${n(i)}</button>`:`<strong>${n(i)}</strong>`,S=Array.isArray(s.articles)?s.articles:[],y=S.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${S.map(w=>{let x=String(w.article_no||"").trim(),b=Jr(w.article_content);return!a||!x?`<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${n(x||"\u689D\u6587")}</span>
                  <span class="law-answer-article-text">${n(b)}</span>
                </div>`:`<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${n(a)}"
                data-source-type="${n(r)}"
                data-article-no="${n(x)}"
                title="\u9EDE\u64CA\u67E5\u770B ${n(x)} \u7684\u5B8C\u6574\u5167\u5BB9"
                aria-label="\u958B\u555F ${n(i)} ${n(x)} \u7684\u5B8C\u6574\u689D\u6587">
                <span class="law-answer-article-no">${n(x)}</span>
                <span class="law-answer-article-text">${n(b)}</span>
              </button>`}).join("")}</div>`:"";return`<div class="law-answer-source">
        <div class="law-answer-source-head">
          ${$}
          <span class="law-answer-source-meta">\uFF08${n(o)}\uFF0C${u(c)} \u689D\uFF09</span>
          ${g}
        </div>
        ${y}
      </div>`}).join("")}</div>`}function Gr(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let r=s.get(String(a));return r?.law_key?Qt(a,{lawKey:r.law_key,sourceType:r.source_type||""}):`<span class="chip">${n(a)}</span>`}).join("")}</div>`}function Oa(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.law_sources)?e.law_sources:[],r=Array.isArray(e.matched_terms)?e.matched_terms:[],i=e.status||"preview",o=!!e.partial,c=!!e.streaming,g=!!e.show_sources||!o,$=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((I,K)=>Fr(I,K)).join("")}</div>`:"",S=a.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${a.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${a.map((I,K)=>Ur(I,K)).join("")}</div>`:"",y=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((I,K)=>Hr(I,K)).join("")}</div>`:"",w=g?$+S+y:"";!w&&!o&&(w=`<div class="answer-divider"></div>
      ${ye({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:i==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let x=Gr(r,a),b=e.test_run,_=String(e.llm_model||b?.primary_model||"").trim(),P=String(e.embedding_model||"").trim(),N=[_?`LLM\uFF1A${_}`:"",P?`Embedding\uFF1A${P}`:""].filter(Boolean).join(" \xB7 "),M=e.answer_source==="structured",D=String(e.law_answer||"").trim(),z=e.law_framework||null,Z=Array.isArray(z?.rows)?z.rows:[],R=Array.isArray(z?.sources)?z.sources:[],E=Z.length>0,B=!!D&&!M&&!E,L=c||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",p=E?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${n(z.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${Z.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${Z.map(I=>`<tr>
                    <td>${n(I.law_name||"\u2014")}</td>
                    <td class="cell-number">${n(I.article_no||"\u2014")}</td>
                    <td>${n(I.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${R.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${R.map(I=>{let K=String(I?.law_name||I||"").trim(),ee=I&&I.index!==null&&I.index!==void 0?` [${n(I.index)}]`:"";return Qt(K,{label:`${K}${ee}`})}).join("")}
              </div>`:""}
      </div>`:"",m=e.answer_source==="llm"&&_?`<span class="answer-model" title="${n(N)}">${f("brain",11)}${n(_)}</span>`:M?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${f("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",T=c?`${_||"LLM"} \xB7 \u751F\u6210\u4E2D`:m?_||"structured":"retrieval",U=b?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${re(b.status)}
          <span class="mono">${n(b.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(b.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(b.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${n(b.primary_model||"\u2014")}</span>
          <span>${Number(b.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",O=String(e.answer||"").trim()||(c?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":o?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),j=c?" data-partial-answer":"",J=c?" is-streaming":"";return`${p}
      ${B?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${o&&!g?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${a.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${Qr(a,D)}</div>
            </div>`:""}
      <div class="answer-block">
        ${B||E?`<div class="answer-block-head">
                <span>${n(L)}</span>
                <span>${n(T)}</span>
              </div>`:""}
        <p class="answer-text${J}"${j}>${n(O)}</p>
      </div>
      ${e.notice?`<div class="answer-notice">${n(e.notice)}</div>`:""}
      ${U}
      ${x}
      ${w}`}function zr(e,t,s=""){let a=t.status||"preview",r=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),c=String(t.embedding_model||"").trim(),g=[o?`LLM\uFF1A${o}`:"",c?`Embedding\uFF1A${c}`:""].filter(Boolean).join(" \xB7 "),$=t.answer_source==="structured",S=t.answer_source==="llm"&&o?`<span class="answer-model" title="${n(g)}">${f("brain",11)}${n(o)}</span>`:$?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${f("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${f("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${re(a,r)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${S}
      </div>
      ${s}
    </div>
    <div class="answer-body">${Oa(t)}</div>`}function Vr(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${f("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${te({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function Wr(e){let t=e.payload||{},s=Array.isArray(t.citations)?t.citations.length:0,a=Array.isArray(t.judgments)?t.judgments.length:0,r=Array.isArray(t.law_sources)?t.law_sources.length:0;return s+a+r}function Ia(e,t,s){let a=e.id??s,r=Wr(e),i=t.get(String(e.project_id||""));return`<div class="rag-history-item${e.pinned?" is-pinned":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${n(String(a))}">
      <span class="history-question">${n(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${n(it(e.created_at))}</span>
        ${i?`<span>\xB7 ${n(i.name)}</span>`:""}
        <span>\xB7 ${r?`${r} \u7B46\u4F86\u6E90`:"\u7121\u5F15\u7528"}</span>
      </span>
    </button>
    <button class="rag-history-pin${e.pinned?" is-pinned":""}" type="button"
      data-rag-action="toggle-pin" data-history-id="${n(String(a))}"
      title="${e.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078\u6B64\u9805\u76EE"}"
      aria-label="${e.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078\u6B64\u9805\u76EE"}"
      aria-pressed="${e.pinned?"true":"false"}">${f("pin",13)}</button>
  </div>`}function Da(e,t,s){let a=new Map;for(let i of t){let o=String(i.project_id||"");o&&a.set(o,(a.get(o)||0)+1)}let r=[`<button class="rag-project${s?"":" is-active"}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${s?"false":"true"}">
      <span class="rag-project-name">${f("grid",13)}<span>\u5168\u90E8</span></span>
      <span class="rag-project-count">${t.length}</span>
    </button>`];for(let i of e){let o=String(i.id),c=a.get(o)||0;r.push(`<button class="rag-project${s===o?" is-active":""}" type="button" data-rag-action="select-project" data-project-id="${n(o)}" aria-pressed="${s===o?"true":"false"}">
      <span class="rag-project-name">${f("folder",13)}<span>${n(i.name)}</span></span>
      <span class="rag-project-count">${c}</span>
    </button>`)}return e.length||r.push('<div class="rag-library-empty">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\u3002</div>'),r.push(`<div class="rag-project-add-wrap">
    <button class="rag-project-add" type="button" data-rag-action="show-project-form">${f("plus",13)}<span>\u5EFA\u7ACB\u5C08\u6848</span></button>
    <form class="rag-project-form" data-rag-form="project" hidden>
      <input class="input" type="text" name="project_name" maxlength="60" placeholder="\u5C08\u6848\u540D\u7A31" aria-label="\u5C08\u6848\u540D\u7A31" autocomplete="off" />
      <div class="rag-project-form-actions">
        <button class="btn btn-primary btn-sm" type="submit">\u5EFA\u7ACB</button>
        <button class="btn btn-ghost btn-sm" type="button" data-rag-action="cancel-project">\u53D6\u6D88</button>
      </div>
    </form>
  </div>`),r.join("")}async function Kr(e){let t=!1,s=[],a=!1,r=[],i=!1,o="",c=8,g="",$=0,S=!1,y={embedding:[],llm:[]};e.innerHTML=`<section class="page rag-page">
    <div class="rag-layout">
      <aside class="rag-library" aria-label="\u5C0D\u8A71\u5EAB">
        <button class="rag-new-chat" type="button" data-rag-action="new-chat">
          <span class="rag-new-chat-mark">${f("plus",16)}</span>
          <span class="rag-new-chat-copy"><strong>\u65B0\u5C0D\u8A71</strong><small>\u958B\u59CB\u65B0\u7684\u6CD5\u5F8B\u6AA2\u7D22</small></span>
        </button>
        <div class="rag-library-context" id="rag-library-context" hidden></div>
        <section class="rag-library-section" data-rag-section="pinned">
          <button class="rag-library-head" type="button" data-rag-toggle="pinned" aria-expanded="true">
            <span class="rag-library-title">${f("pin",13)}\u5DF2\u91D8\u9078</span>
            <span class="rag-library-count" id="rag-pinned-count">0</span>
            ${f("chevronDown",12,"rag-library-chevron")}
          </button>
          <div class="rag-library-body" id="rag-pinned-body">
            <div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002</div>
          </div>
        </section>
        <section class="rag-library-section" data-rag-section="projects">
          <button class="rag-library-head" type="button" data-rag-toggle="projects" aria-expanded="true">
            <span class="rag-library-title">${f("folder",13)}\u5C08\u6848</span>
            <span class="rag-library-count" id="rag-projects-count">0</span>
            ${f("chevronDown",12,"rag-library-chevron")}
          </button>
          <div class="rag-library-body" id="rag-projects-body"></div>
        </section>
        <section class="rag-library-section rag-library-recent">
          <div class="rag-library-head is-static">
            <span class="rag-library-title">${f("history",13)}\u6700\u8FD1\u9805\u76EE <span class="rag-library-count" id="rag-recent-count">0</span></span>
            <button class="btn btn-ghost btn-sm" type="button" id="rag-clear-history">\u6E05\u9664</button>
          </div>
          <div class="rag-library-body" id="rag-history">
            <div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>
          </div>
          <div class="rag-library-foot" id="rag-storage-note">
            \u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002
          </div>
        </section>
      </aside>
      <div class="rag-workspace">
        <header class="rag-hero">
      <span class="eyebrow">JUDGMENT \xB7 LEGAL RAG</span>
      <h1 class="rag-title">\u8B93\u6BCF\u4E00\u500B\u7B54\u6848\uFF0C\u90FD\u80FD\u56DE\u5230\u6CD5\u898F\u8207\u5224\u6C7A</h1>
      <p class="rag-lead">\u4EE5\u91D1\u878D\u6CD5\u898F\u7684\u73FE\u884C\u689D\u6587\u8207\u5224\u6C7A\u7247\u6BB5\u70BA\u6AA2\u7D22\u57FA\u790E\u3002
        \u5148\u5F9E Qdrant \u6AA2\u7D22\u76F8\u4F3C\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\uFF1B\u82E5\u7D22\u5F15\u6216\u6A21\u578B\u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u53EF\u9A57\u8B49\u7684\u6AA2\u7D22\u7D50\u679C\u3002</p>
      <div id="rag-mode-notice">${te({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
      <div id="rag-test-mode"></div>
      <form class="ask-card" id="rag-form" autocomplete="off">
        <label class="sr-only" for="rag-question">\u8F38\u5165\u6CD5\u5F8B\u554F\u984C</label>
        <textarea class="ask-input" id="rag-question" name="question" rows="3"
          maxlength="500" placeholder="\u4F8B\u5982\uFF1A\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F"
          aria-describedby="rag-input-help"></textarea>
        <div class="ask-footer">
          <div class="ask-hints" id="rag-input-help">
            <span><kbd>Enter</kbd> \u9001\u51FA</span>
            <span><kbd>Shift</kbd> + <kbd>Enter</kbd> \u63DB\u884C</span>
            <span>\u6700\u591A 500 \u5B57 \xB7 \u5FEB\u901F\u6A21\u5F0F\u7D04 2\u201310 \u79D2</span>
          </div>
          <button class="btn btn-primary btn-lg ask-submit" type="submit" id="rag-submit">
            ${f("sparkles",16)}<span>\u958B\u59CB\u6AA2\u7D22</span>
          </button>
        </div>
      </form>
      <div class="example-chips" id="example-chips" aria-label="\u7BC4\u4F8B\u554F\u984C">
        ${Nr.map(l=>`<button class="example-chip" type="button" data-question="${n(l)}">${n(l)}</button>`).join("")}
      </div>
    </header>

    <div class="rag-grid">
      <section class="card answer-card" id="answer-card" aria-live="polite">
        ${Ca()}
      </section>

      <aside class="rag-side">
        <section class="card">
          <div class="side-card-head">
            <span class="side-card-title">${f("database",14)}\u8CC7\u6599\u73FE\u6CC1</span>
            <span id="rag-stats-mode" class="badge badge-neutral badge-mono">\u8B80\u53D6\u4E2D</span>
          </div>
          <div class="side-card-body" id="rag-stats">
            <div class="skeleton skeleton-line" style="width:88%"></div>
            <div class="skeleton skeleton-line" style="width:64%"></div>
            <div class="skeleton skeleton-line" style="width:74%"></div>
          </div>
          <div class="side-card-foot">
            PostgreSQL \u5224\u6C7A\u6587\u4EF6\u3001Qdrant \u5411\u91CF\u7D22\u5F15\u8207 Ollama \u6A21\u578B\u72C0\u614B\u7686\u70BA\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u5C31\u7DD2\u6642\u6703\u660E\u78BA\u964D\u7D1A\u3002
          </div>
        </section>
      </aside>
    </div>
      </div>
    </div>
    <div id="rag-test-flow" class="rag-test-flow"></div>
    <dialog id="rag-judgment-dialog" class="judgment-dialog"></dialog>
    <dialog id="rag-law-dialog" class="judgment-dialog law-dialog"></dialog>
  </section>`;let w=e.querySelector("#rag-form"),x=e.querySelector("#rag-question"),b=e.querySelector("#rag-submit"),_=e.querySelector("#answer-card"),P=e.querySelector("#rag-stats"),N=e.querySelector("#rag-stats-mode"),M=e.querySelector("#rag-history"),D=e.querySelector("#rag-storage-note"),z=e.querySelector("#rag-clear-history"),Z=e.querySelector(".rag-library"),R=e.querySelector("#rag-pinned-body"),E=e.querySelector("#rag-projects-body"),B=e.querySelector("#rag-pinned-count"),L=e.querySelector("#rag-projects-count"),p=e.querySelector("#rag-recent-count"),m=e.querySelector("#rag-library-context"),T=e.querySelector("#rag-test-mode"),U=e.querySelector("#rag-test-flow"),H=e.querySelector("#rag-judgment-dialog"),O=e.querySelector("#rag-law-dialog"),j=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};H?.addEventListener("close",j),O?.addEventListener("close",j);let J=null,I=null,K=()=>{x.style.height="auto",x.style.height=`${Math.min(x.scrollHeight,220)}px`},ee=()=>{if(t)return;if(!a){M.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',R.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',B.textContent="0",p.textContent="0",i&&(E.innerHTML=Da(r,[],o));return}let l=r.find(A=>String(A.id)===o)||null;o&&!l&&(o="");let d=new Map(r.map(A=>[String(A.id),A])),h=s.filter(A=>!!A.pinned),k=o?s.filter(A=>String(A.project_id||"")===o):s,q=k.slice(0,c);R.innerHTML=h.length?h.map((A,W)=>Ia(A,d,W)).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',E.innerHTML=Da(r,s,o),M.innerHTML=q.length?q.map((A,W)=>Ia(A,d,W)).join(""):`<div class="rag-library-empty">${o?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u9805\u76EE\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,k.length>c&&M.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${u(k.length-c)} \u7B46</button>`),B.textContent=String(h.length),L.textContent=String(r.length),p.textContent=String(k.length),l?(m.hidden=!1,m.innerHTML=`<span>${f("folder",12)}<strong>${n(l.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${f("x",12)}</button>`):(m.hidden=!0,m.innerHTML="")},fe=async()=>{try{let l=await We("rag.projects",[]);r=Array.isArray(l)?l.map(d=>({id:String(d?.id||""),name:String(d?.name||"").trim()})).filter(d=>d.id&&d.name):[]}catch{r=[]}i=!0,t||ee()},ve=l=>{o=String(l||""),c=8,ee()},pe=()=>{let l=E.querySelector('[data-rag-form="project"]');l&&(l.hidden=!1,l.querySelector("input")?.focus())},Ne=()=>{let l=E.querySelector('[data-rag-form="project"]');l&&(l.hidden=!0,l.reset())},Q=async l=>{let d=l.elements.project_name,h=String(d?.value||"").trim();if(!h){C("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),d?.focus();return}if(r.some(q=>q.name.toLowerCase()===h.toLowerCase())){C("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),d?.focus();return}let k=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;r=[...r,{id:k,name:h.slice(0,60),created_at:new Date().toISOString()}],o=k,c=8,await Nt("rag.projects",r),ee(),C(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${h}\u300D\u3002`,"ok")},se=async l=>{let d=s.find(q=>String(q.id)===String(l));if(!d)return;let h=!d.pinned;if(!await Xs(d.id,{pinned:h})){C("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}d.pinned=h,ee(),C(h?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},de=()=>{$+=1,je(),me(null),g="",x.value="",K(),_.innerHTML=Ca(),ae(b,!1),H?.open&&H.close(),O?.open&&O.close(),x.focus(),window.scrollTo({top:0,behavior:"smooth"})},Se=async()=>{try{if(s=await Ct({limit:120}),t)return;a=!0,ee(),D.textContent=Et()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;s=[],a=!0,ee(),M.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},pt=async()=>{try{let l=await F.status();if(t)return;let d=l.data||{},h=new Map((l.services||[]).map($e=>[$e.id,$e])),k=h.get("qdrant"),q=h.get("embedding"),A=h.get("rag"),W=h.get("llm"),ie=Number(d.judgment_indexed_count||0),oe=Number(d.judgment_count||0),le=oe?(ie/oe*100).toFixed(1):"0.0",ge=d.judgment_vector_points===null||d.judgment_vector_points===void 0?"\u2014":u(d.judgment_vector_points);P.innerHTML=`<div class="mini-stats">
          <div class="mini-stat">
            <div class="mini-stat-value">${u(oe)}</div>
            <div class="mini-stat-label">\u5224\u6C7A</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-value">${u(ie)}</div>
            <div class="mini-stat-label">\u5DF2\u7D22\u5F15</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-value">${le}%</div>
            <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
          </div>
        </div>
        <div class="side-status-list">
          <div class="side-status-row">
            <span>${f("cube",13)}Qdrant \u5411\u91CF\u7D22\u5F15</span>
            ${re(k?.status,k?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${f("layers",13)}Embedding\uFF08${n(d.judgment_vector_model||"\u2014")}\uFF09</span>
            ${re(q?.status,q?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${f("brain",13)}RAG \u56DE\u7B54\u7BA1\u7DDA</span>
            ${re(A?.status,A?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${f("sparkles",13)}LLM \u6A21\u578B</span>
            ${re(W?.status,W?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
        </div>
        <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
          Collection\uFF1A${n(d.judgment_vector_collection||"\u2014")} \xB7
          ${ge} points \xB7 \u5269\u9918 ${u(d.judgment_index_remaining)} \u7B46\u5F85\u7D22\u5F15
        </div>`;let Y=e.querySelector("#rag-mode-notice");Y&&(A?.status==="operational"?Y.innerHTML=te({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${u(ie)} / ${u(oe)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`}):A?.status==="degraded"?Y.innerHTML=te({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:n(A.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002")}):Y.innerHTML=te({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:n(A?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002")})),N.className=`badge ${A?.status==="operational"?"badge-ok":A?.status==="not_configured"?"badge-neutral":"badge-warn"} badge-mono`,N.textContent=A?.status==="operational"?"RAG \u5C31\u7DD2":A?.status==="not_configured"?"\u672A\u8A2D\u5B9A":"\u964D\u7D1A"}catch{if(t)return;P.innerHTML='<p class="muted" style="font-size:11px">\u76EE\u524D\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002</p>',N.className="badge badge-danger badge-mono",N.textContent="\u96E2\u7DDA"}},st=()=>{if(!T)return;if(!S){T.innerHTML="";return}let l=Array.isArray(y.embedding)?y.embedding.length:0,d=Array.isArray(y.llm)?y.llm.length:0;T.innerHTML=te({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${l} \u500B embedding \u8207 ${d} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},mt=async()=>{try{let l=await F.testMode();if(t)return;S=!!l.enabled,y=l.models||{embedding:[],llm:[]},st()}catch{if(t)return;S=!1,st()}},qe=l=>{S=!!l.detail?.enabled,y=l.detail?.models||{embedding:[],llm:[]},st()};window.addEventListener("judgment:test-mode",qe);let me=l=>{U&&(I=l||null,U.innerHTML=l?ct(l,[],"",{showHistory:!1}):"")},je=()=>{J&&(window.clearTimeout(J),J=null)},kt=()=>{je();let l=async()=>{if(!t){try{let d=await F.testRunCurrent();if(t)return;let h=d.run;h&&h.status==="running"&&me(h)}catch{}t||(J=window.setTimeout(l,1500))}};l()},ss=async l=>{if(!l){me(null);return}try{let d=await F.testRun(l);if(t)return;me(d.run||null)}catch{t||C("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},St=async()=>{if(S)try{let l=await F.testRunCurrent();if(t)return;l.run?.status==="running"&&(me(l.run),kt())}catch{}},gt=0,Pe=(l,d)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${n(l)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${f("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${d}</div>`,xt=l=>{let d=(Array.isArray(l.matched_laws)?l.matched_laws:[]).map(A=>Qt(A)).join(""),h=[l.court,l.jdate,l.title?`\u6848\u7531\uFF1A${l.title}`:"",l.full_text_length?`${u(l.full_text_length)} \u5B57`:"",l.citation_count?`\u5F15\u7528 ${u(l.citation_count)} \u7B46`:""].filter(Boolean).map(A=>`<span>${n(A)}</span>`).join(""),k=l.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${n(String(l.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",q=l.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(l.pdf_url)}" target="_blank" rel="noopener noreferrer">${f("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return Pe(l.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${n(l.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${h}
      </div>
      ${d?`<div class="chips" style="margin:8px 0 10px">${d}</div>`:""}
      <div class="judgment-dialog-source">${k}</div>
      <pre class="judgment-dialog-text">${n(l.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${q}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},ft=async l=>{if(!H||!l)return;let d=++gt;H.open||H.showModal(),j(),H.innerHTML=Pe("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${n(l)}\u2026</span>
      </div>`);try{let h=await F.judgmentDetail(l,"parquet");if(t||d!==gt)return;H.innerHTML=xt(h)}catch(h){if(t||d!==gt)return;H.innerHTML=Pe("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(h.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},at=0,vt=(l,d)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${n(l)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${f("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${d}</div>`,Ee=(l,d="")=>{let h=String(l.selected_article_no||d||"").trim(),k=!!h,q=Array.isArray(l.articles)?l.articles:[],A=q.map(Be=>{let ns=String(Be.article_content||"").trim();return ns?Be.article_type==="C"?`<div class="law-chapter">${n(ns)}</div>`:`<article class="law-article" data-article-no="${n(Ba(Be.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${n(Be.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${n(ns)}</div>
        </article>`:""}).join(""),W=(Array.isArray(l.warnings)?l.warnings:[]).map(Be=>n(Be)).join("<br />"),ie=l.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",oe=l.meta?.articles_source,le=oe==="parquet"?"Parquet \u689D\u6587":oe==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",ge=l.meta?.snapshot||"",Y=[l.law_level,l.law_category,l.article_count?`${u(l.article_count)} \u689D`:"",l.law_modified_date?`\u7570\u52D5 ${Le(l.law_modified_date)}`:""].filter(Boolean).map(Be=>`<span>${n(Be)}</span>`).join(""),$e=l.law_url?`<a class="btn btn-secondary btn-sm" href="${n(l.law_url)}" target="_blank" rel="noopener noreferrer">${f("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",Je=!k&&l.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${n(l.law_histories)}</div>
        </details>`:"",qt=k?`<span class="badge badge-mono">${n(h)}</span>`:"",as=!k&&q.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",Qe=k?`${l.law_name||l.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${h}`:l.law_name||l.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return vt(Qe,`<div class="judgment-dialog-meta">
        <span class="badge ${l.source_type==="order"?"badge-warn":"badge-info"}">${n(ie)}</span>
        ${qt}
        ${Y}
      </div>
      <div class="judgment-dialog-source">${n([le,ge].filter(Boolean).join(" \xB7 "))}</div>
      ${W?`<div class="law-dialog-warning">${W}</div>`:""}
      ${Je}
      ${as}
      <div class="law-dialog-articles">${A||`<div class="report-empty-inline">${k?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${$e}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},nt=(l,d)=>{let h=l?.querySelector(`#${d}`),k=Ba(h?.value||"");if(!k){C("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),h?.focus();return}let q=[...l?.querySelectorAll("[data-article-no]")||[]].find(A=>A.dataset.articleNo===k);if(!q){C(`\u627E\u4E0D\u5230\u7B2C ${k} \u689D\u3002`,"warn");return}q.scrollIntoView({behavior:"instant",block:"center"}),q.classList.add("is-jump-target"),window.setTimeout(()=>q.classList.remove("is-jump-target"),2400)},rt=async(l,d="",h="")=>{if(!O||!l)return;let k=++at;O.open||O.showModal(),j(),O.innerHTML=vt(h?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${n([l,h].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let q=await F.lawDetail(l,d,"",h);if(t||k!==at)return;O.innerHTML=Ee(q,h)}catch(q){if(t||k!==at)return;O.innerHTML=vt("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(q.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};O?.addEventListener("click",l=>{let d=l.target.closest('[data-action="jump-law-article"]');if(d){nt(O,d.dataset.jumpInput||"rag-law-article-jump");return}if(l.target.closest('[data-action="close-law-source"]')){O.close();return}let h=O.getBoundingClientRect();(l.clientX<h.left||l.clientX>h.right||l.clientY<h.top||l.clientY>h.bottom)&&O.close()}),O?.addEventListener("keydown",l=>{!l.target.matches(".law-jump-input")||l.key!=="Enter"||(l.preventDefault(),nt(O,l.target.id))}),H?.addEventListener("click",l=>{let d=l.target.closest('[data-action="open-law-source"]');if(d){rt(d.dataset.lawKey||"",d.dataset.sourceType||"",d.dataset.articleNo||"");return}if(l.target.closest('[data-action="close-parquet-judgment"]')){H.close();return}let h=H.getBoundingClientRect();(l.clientX<h.left||l.clientX>h.right||l.clientY<h.top||l.clientY>h.bottom)&&H.close()}),_.addEventListener("click",l=>{let d=l.target.closest(".rag-process-toggle");if(d){let k=d.closest(".rag-process"),q=d.getAttribute("aria-expanded")==="true";Ts(k,!q);return}let h=l.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(h){if(h.dataset.action==="open-law-source"){rt(h.dataset.lawKey||"",h.dataset.sourceType||"",h.dataset.articleNo||"");return}ft(h.dataset.jid||"")}}),_.addEventListener("keydown",l=>{if(l.key!=="Enter"&&l.key!==" ")return;let d=l.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!d||d.closest("a, button"))){if(l.preventDefault(),d.dataset.action==="open-law-source"){rt(d.dataset.lawKey||"",d.dataset.sourceType||"",d.dataset.articleNo||"");return}ft(d.dataset.jid||"")}});let v=async l=>{let d=l.trim();if(!d){C("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),x.focus();return}let h=++$,k=()=>t||h!==$,q=o;g=d,x.value=d,K(),_.innerHTML=Or(d,S);let A=S?null:Dr(_);S?(me(null),kt()):(je(),me(null)),ae(b,!0,"\u6AA2\u7D22\u4E2D\u2026");let W=null,ie="",oe=Y=>{if(k()||!Y?.partial)return;let $e=_.querySelector(".answer-body");if(!$e)return;W=Y,ie=String(Y.answer||""),$e.innerHTML=Oa(Y),A?.collapse?.();let Je=_.querySelector(".answer-head-title");Je&&(Je.textContent=Y.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},le=Y=>{if(k()||!Y||!W?.streaming)return;ie+=Y;let $e=_.querySelector("[data-partial-answer]");$e&&($e.textContent=ie)},ge=()=>{if(k()||!W?.streaming)return;ie="";let Y=_.querySelector("[data-partial-answer]");Y&&(Y.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")};try{let Y=S?await F.rag(d,{testMode:S}):await F.ragStream(d,{onStep:Qe=>{k()||A?.step(Qe)},onPartial:oe,onToken:le,onTokenReset:ge});if(k())return;je();let $e=A?.finish(!0)||"";_.innerHTML=zr(d,Y,$e),Y.test_run?.run_id?await ss(Y.test_run.run_id):me(null);let Je=Array.isArray(Y.citations)?Y.citations:[],qt=Array.isArray(Y.judgments)?Y.judgments:[],as=Je.length+qt.length;await Rt({kind:"rag",title:d,detail:`${Y.status||"preview"} \xB7 ${as} \u7B46\u4F86\u6E90`,project_id:q,payload:{question:d,status:Y.status,citations:Je.map(Qe=>Qe.law_name),judgments:qt.map(Qe=>Qe.jid)}}),await Se()}catch(Y){if(k())return;je();let $e=A?.finish(!1)||"";_.innerHTML=Vr(Y,$e),C(Y.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{k()||(je(),ae(b,!1))}};return w.addEventListener("submit",l=>{l.preventDefault(),v(x.value)}),x.addEventListener("input",K),x.addEventListener("keydown",l=>{l.key==="Enter"&&!l.shiftKey&&!l.isComposing&&(l.preventDefault(),w.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",l=>{let d=l.target.closest("[data-question]");d&&(x.value=d.dataset.question,K(),w.requestSubmit())}),Z.addEventListener("click",async l=>{let d=l.target.closest("[data-rag-toggle]");if(d){let ie=d.closest(".rag-library-section").classList.toggle("is-collapsed");d.setAttribute("aria-expanded",String(!ie));return}let h=l.target.closest("[data-rag-action]"),k=h?.dataset.ragAction||"";if(k==="new-chat"){de();return}if(k==="toggle-pin"){await se(h.dataset.historyId);return}if(k==="select-project"){ve(h.dataset.projectId||"");return}if(k==="show-project-form"){pe();return}if(k==="cancel-project"){Ne();return}if(k==="more-recent"){c+=12,ee();return}if(k==="clear-project"){ve("");return}let q=l.target.closest("[data-history-open]");if(!q)return;let A=s.find(W=>String(W.id)===String(q.dataset.historyId));A&&(o=String(A.project_id||""),ee(),x.value=A.title,K(),v(A.title))}),Z.addEventListener("submit",async l=>{let d=l.target.closest('[data-rag-form="project"]');d&&(l.preventDefault(),await Q(d))}),z.addEventListener("click",async()=>{if(!s.length){C("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await Zs(),await Se(),C("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),K(),await Promise.allSettled([pt(),Se(),fe(),mt()]),await St(),()=>{t=!0,je(),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",qe),g&&_.setAttribute("data-last-question",g)}}var Es={};Ge(Es,{render:()=>ki});var Yr=2e3,Xr={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"}},Fa={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},Ha={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Va={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"},Gt={judgment:"#a78bfa",law:"#22d3ee",order:"#f472b6",system:"#94a3b8"},Zr={extract:"file",raw_parquet:"cube",filter:"filter",postgres:"database",qdrant:"brain",download:"download",parse:"sliders"},ei={raw_parquet:"\u539F\u59CB Parquet",postgres:"PostgreSQL"};function _t(e){return Xr[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function he(e,t){let s=_t(e);return`<span class="badge ${Fa[s.tone]||Fa.idle}"><span class="status-dot ${Ha[s.tone]||Ha.idle}"></span>${n(t||s.label)}</span>`}function et(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function Ua(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":u(e)}function dt(e){return e&&e.color?String(e.color):"var(--accent)"}function zt(e,t=""){let s=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),a=e.status==="running"&&s===null,r=a?' aria-valuetext="\u9032\u5EA6\u672A\u77E5"':` aria-valuenow="${s??0}"`;return`<div class="processing-bar${a?" is-indeterminate":""}${t?` ${t}`:""}" role="progressbar" aria-valuemin="0" aria-valuemax="100"${r}>
    <span class="processing-bar-fill" style="width:${s??0}%;background:${n(dt(e))}"></span>
  </div>`}function ti(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${X(s)} / ${X(a)}`:X(s):a?`${u(s)} / ${u(a)} ${t}`:`${u(s)} ${t}`}function si(e){let t=[`<span>${n(ti(e))}</span>`];return e.percent===null||e.percent===void 0?e.status==="running"&&t.push('<span class="mono">\u9032\u5EA6\u672A\u77E5</span>'):t.push(`<span class="mono">${et(e.percent)}</span>`),e.duration_ms&&t.push(`<span class="mono">${G(e.duration_ms)}</span>`),t.join("")}function ai(e){let s=(Array.isArray(e.stats)?e.stats:[]).map(r=>`<span class="processing-stage-stat"><span>${n(r.label)}</span><strong>${n(r.value)}</strong></span>`),a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&s.push(`<span class="processing-stage-stat"><span>\u7D22\u5F15\u8986\u84CB</span><strong>${u(a.indexed)} / ${u(a.total)}</strong></span>`),s.length?`<div class="processing-stage-stats">${s.join("")}</div>`:""}function ni(e,{compact:t=!1,step:s=null}={}){let a=_t(e.status),r=e.status==="running";return`<div class="processing-stage${t?" is-compact":""} is-${a.tone}${r?" is-live":""}" style="--stage-color:${n(dt(e))}"${r?' aria-current="step"':""}>
    <div class="processing-stage-head">
      ${s===null?"":`<span class="processing-stage-step">${String(s).padStart(2,"0")}</span>`}
      <span class="processing-stage-swatch" style="background:${n(dt(e))}"></span>
      <span class="processing-stage-label">${n(e.label||e.key)}</span>
      ${he(e.status)}
    </div>
    ${zt(e)}
    <div class="processing-stage-meta">${si(e)}</div>
    ${e.message?`<div class="processing-stage-message" title="${n(e.message)}">${n(e.message)}</div>`:""}
    ${t?"":ai(e)}
  </div>`}function Wa(e){let t=_t(e);return`<span class="flow-status is-${t.tone}"><span class="flow-status-dot"></span>${n(t.label)}</span>`}function Ja(e,t){return t==null||t===""?"\u2014":e.unit==="bytes"?X(t):u(t)}function ri(e){let t=[{label:"\u76EE\u524D",value:Ja(e,e.current)},{label:"\u7E3D\u91CF",value:Ja(e,e.total)},{label:"\u767E\u5206\u6BD4",value:e.percent===null||e.percent===void 0?e.status==="running"?"\u8A08\u7B97\u4E2D":"\u2014":et(e.percent)},{label:"\u8017\u6642",value:e.duration_ms?G(e.duration_ms):"\u2014"}],s=Array.isArray(e.stats)?e.stats:[];for(let r of s){if(t.length>=6)break;r&&r.label&&r.value&&t.push({label:String(r.label),value:String(r.value)})}let a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&!t.some(r=>r.label==="\u7D22\u5F15\u8986\u84CB")&&t.push({label:"\u7D22\u5F15\u8986\u84CB",value:`${u(a.indexed)} / ${u(a.total)}`}),t}function ii(e,t){let s=_t(e.status),a=e.status==="running",r=ri(e);return`<article class="flow-node is-${s.tone}${a?" is-live":""}" style="--stage-color:${n(dt(e))}"${a?' aria-current="step"':""}>
    <div class="flow-node-head">
      <span class="flow-node-icon">${f(Zr[e.key]||"cube",14)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">STEP ${String(t+1).padStart(2,"0")}</span>
        <strong>${n(ei[e.key]||e.label||e.key)}</strong>
      </div>
      ${Wa(e.status)}
    </div>
    <div class="flow-node-body">
      ${zt(e,"flow-progress")}
      <div class="flow-node-props">${r.map(i=>`<div class="flow-prop"><span>${n(i.label)}</span><strong>${n(i.value)}</strong></div>`).join("")}</div>
      ${e.message?`<div class="flow-node-note" title="${n(e.message)}">${n(e.message)}</div>`:""}
    </div>
  </article>`}function oi(e,t,s,a){let r=dt(e),i=a||"#8b5cf6",o=e.status==="running",c=`${s}-${t}`,g=`flow-gradient-${c}`,$=`flow-marker-${c}`,S=t%2===0?"M2 60 C8 42 16 78 22 60":"M2 60 C8 78 16 42 22 60";return`<div class="flow-link${o?" is-live":""}" style="color:${n(r)}" aria-hidden="true">
    <svg viewBox="0 0 28 120" width="28" height="120" fill="none">
      <defs>
        <linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${n(i)}"/>
          <stop offset="1" stop-color="${n(r)}"/>
        </linearGradient>
        <marker id="${$}" viewBox="0 0 8 8" refX="6.2" refY="4" markerWidth="4.6" markerHeight="4.6" orient="auto">
          <path d="M0 0 8 4 0 8Z" fill="${n(r)}"/>
        </marker>
      </defs>
      <path class="flow-link-line" d="${S}" stroke="url(#${g})" stroke-width="1.7" stroke-linecap="round" marker-end="url(#${$})"/>
      <circle class="flow-link-port" cx="2" cy="60" r="3.6" stroke="${n(i)}" stroke-width="1.5"/>
      <circle class="flow-link-port" cx="26" cy="60" r="3.6" stroke="${n(r)}" stroke-width="1.5"/>
    </svg>
  </div>`}function Ka(e){if(!e)return"";let t=[];return e.started_at&&t.push(`\u958B\u59CB ${ne(e.started_at)}`),e.duration_ms&&t.push(`\u8017\u6642 ${G(e.duration_ms)}`),e.pid&&t.push(`PID ${e.pid}`),t.join(" \xB7 ")}function li(e,{active:t,focus:s,status:a,runLine:r,runningStage:i}){let o=e.label||Va[e.key]||e.key;return`<div class="flow-source${t?" is-live":""}" style="--branch-accent:${Gt[e.key]||Gt.system}">
    <div class="flow-source-head">
      <span class="flow-source-icon">${f(e.icon||"database",15)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">SOURCE</span>
        <strong>${n(o)}</strong>
      </div>
      ${Wa(a)}
    </div>
    <div class="flow-source-body">
      <p class="flow-source-desc">${n(e.description||"")}</p>
      <div class="flow-source-meta">${r}</div>
      ${i?`<div class="flow-source-current"><span class="flow-current-dot"></span>\u76EE\u524D\u968E\u6BB5\uFF1A<strong>${n(i.label||i.key)}</strong></div>`:""}
      ${s&&s.message?`<div class="flow-source-note" title="${n(s.message)}">${n(s.message)}</div>`:""}
    </div>
  </div>`}function ci(e){let t=e.active_run,s=t||e.focus_run||e.last_run,a=t?"running":s?s.status:"idle",r=s?n(Ka(s)||it(s.started_at||s.finished_at)):"\u5C1A\u7121\u57F7\u884C\u7D00\u9304",i=Array.isArray(e.stages)?e.stages:[],o=i.find(y=>y.status==="running"),c=Gt[e.key]||Gt.system,g=String(e.key||"branch").replace(/[^a-zA-Z0-9_-]/g,""),$=li(e,{active:t,focus:s,status:a,runLine:r,runningStage:o}),S=i.length?i.map((y,w)=>{let x=w?dt(i[w-1]):c;return`${oi(y,w,g,x)}${ii(y,w)}`}).join(""):'<div class="flow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u968E\u6BB5\u3002</div>';return`<article class="flow-lane" style="--branch-accent:${c}"><div class="flow-row">${$}${S}</div></article>`}function di(e){return`<div class="flow-canvas-open">
    <div class="processing-branches">${(Array.isArray(e.branches)?e.branches:[]).map(ci).join("")}</div>
  </div>`}function Ze(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${n(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function ui(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},r=e.raw_backups||{},i=r.totals||{},o=e.state||{},c=e.capabilities||{},g=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",$=t.status==="operational",S=s.status==="operational",y=a.available!==!1,w=r.available!==!1,x=S?`${u(s.indexed)} / ${u(s.total)}`:he(s.status||"unavailable"),b=S?`${et(s.percent)} \xB7 \u5C1A\u9918 ${u(s.remaining)} \u7B46`:n(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),_=y?`${u(a.unprocessed)} / ${u(a.total)}`:he("unavailable"),P=y?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${X(a.unprocessed_bytes)} \u5F85\u8655\u7406`:n(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${Ze("\u8655\u7406\u72C0\u614B",he(e.status||"unknown"),`${n(g)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${Ze("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",n(_),P)}
    ${Ze("\u539F\u59CB Parquet \u5099\u4EFD",w?`${u(r.count)} \u6A94`:he("unavailable"),w?`\u5171 ${u(i.row_count)} \u7B46 \xB7 ${X(i.compressed_bytes)}`:n(r.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB Parquet \u5099\u4EFD\u3002"))}
    ${Ze("PostgreSQL \u5224\u6C7A",$?u(t.judgment_count):he("unavailable"),$?`\u6CD5\u898F ${Ua(t.law_count)} \xB7 \u547D\u4EE4 ${Ua(t.order_count)}`:n(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${Ze("Qdrant \u7D22\u5F15",x,b)}
    ${Ze("\u72C0\u614B\u6A94",he(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${n(ne(o.updated_at))}`:n(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${Ze("\u5F85\u8655\u7406\u5DE5\u4F5C",c.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",c.start_blocked_reason?n(c.start_blocked_reason):`\u672A\u8655\u7406 ${u(c.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${u(c.index_backlog)} \u7B46${c.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${u(c.external_processes)} \u500B`:""}`)}
  </div>`}function pi(e){if(e.available===!1)return te({tone:"warn",title:"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304",text:n(e.error||"\u7121\u6CD5\u6383\u63CF .rar \u6A94\u6848\u3002")});let t=Number(e.total)||0,s=Number(e.processed)||0,a=Number(e.unprocessed)||0,r=t?100*s/t:null;return`<div class="processing-archive-summary">
    <div class="processing-archive-summary-head">
      <span class="mono">${n(e.data_dir||"")}</span>
      <span>${u(s)} / ${u(t)} \u5DF2\u8655\u7406 \xB7 ${u(a)} \u5F85\u8655\u7406 \xB7 ${X(e.unprocessed_bytes)} \u5F85\u8655\u7406</span>
    </div>
    ${zt({percent:r,status:a?"pending":"success",color:"var(--success)"},"processing-bar-lg")}
    <div class="processing-archive-summary-meta">
      <span>\u58D3\u7E2E\u6A94\u532F\u5165\u8986\u84CB ${et(r)}</span>
      <span>\u5168\u90E8 ${X(e.total_bytes)}</span>
    </div>
  </div>`}function mi(e){let t=e.stages||{},a=["extract","filter","postgres"].map(r=>t[r]).filter(Boolean).map(r=>ni(r,{compact:!0}));return a.length?`<div class="processing-archive-stages">${a.join("")}</div>`:""}function gi(e){let t=e.status||"pending",s=t==="running",a=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),r=s&&a===null,i=[];return e.message&&i.push(e.message),e.error&&i.push(e.error),(e.scanned||e.matched||e.stored)&&i.push(`\u6383\u63CF ${u(e.scanned)} \xB7 \u547D\u4E2D ${u(e.matched)} \xB7 \u5BEB\u5165 ${u(e.stored)}`),`<div class="processing-archive is-${_t(t).tone}">
    <div class="processing-archive-head">
      <span class="processing-archive-name mono">${n(e.name)}</span>
      <div class="processing-archive-bar-wrap">
        ${zt({percent:a,status:t,color:s?"var(--accent)":"var(--success)"})}
      </div>
      <span class="processing-archive-percent mono">${r?"\u9032\u884C\u4E2D":et(a)}</span>
      ${he(t)}
      <span class="processing-archive-size faint">${X(e.size_bytes)}</span>
    </div>
    ${mi(e)}
    ${i.length?`<div class="processing-archive-note">${i.map(o=>`<span>${n(o)}</span>`).join("")}</div>`:""}
  </div>`}function fi(e){let t=e.archives||{},s=e.local_archives||{},a=Array.isArray(t.items)?t.items:[],r=t.run,i=`<div class="report-section-head">
    <div>
      <div class="report-kicker">ARCHIVE PIPELINE</div>
      <h2 class="report-section-title">\u5224\u6C7A\u58D3\u7E2E\u6A94</h2>
      <p class="processing-section-sub">\u6BCF\u500B\u58D3\u7E2E\u6A94\u540D\u7A31\u5F8C\u65B9\u5373\u6642\u986F\u793A\u8655\u7406\u9032\u5EA6\uFF1B\u672A\u53D6\u5F97\u53EF\u8A08\u7B97\u7684\u7E3D\u91CF\u6642\u6A19\u793A\u300C\u9032\u5EA6\u672A\u77E5\u300D\uFF0C\u4E0D\u4EE5\u63A8\u6E2C\u6578\u503C\u4EE3\u66FF\u3002</p>
    </div>
  </div>`,o=t.source==="run"?`${he(r?r.status:"idle")} <span>\u76EE\u524D\u986F\u793A ${r?n(r.title||"\u5224\u6C7A\u532F\u5165"):"\u6700\u8FD1\u4E00\u6B21\u532F\u5165"} \u7684\u9010\u6A94\u9032\u5EA6${r&&r.started_at?` \xB7 ${n(Ka(r))}`:""}</span>`:t.external?`${he("running")} <span>${n(t.note||"\u5916\u90E8\u532F\u5165\u7A0B\u5E8F\u672A\u5BEB\u5165\u9010\u6A94\u72C0\u614B\uFF1B\u4EE5\u4E0B\u70BA PostgreSQL \u8986\u84CB\u7387\u3002")}</span>`:'<span class="faint">\u76EE\u524D\u6C92\u6709\u53EF\u8B80\u53D6\u7684\u532F\u5165 run \u72C0\u614B\uFF1B\u4EE5\u4E0B\u4EE5 PostgreSQL \u7684 source_archive \u5224\u5B9A\u662F\u5426\u5DF2\u8655\u7406\u3002</span>';return`<section class="report-card processing-card">
    <div class="report-head">${i}</div>
    <div class="report-section">
      ${pi(s)}
      <div class="processing-archive-run">${o}</div>
      ${a.length?`<div class="processing-archive-list">${a.map(gi).join("")}</div>`:`<div class="processing-empty">\u627E\u4E0D\u5230 .rar \u58D3\u7E2E\u6A94\uFF1B\u8ACB\u78BA\u8A8D ${n(s.data_dir||"\u5224\u6C7A\u8CC7\u6599\u76EE\u9304")}\u3002</div>`}
    </div>
  </section>`}function vi(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">ELAPSED COMPOSITION</div>
      <h2 class="report-section-title">\u6574\u9AD4\u8655\u7406\u6642\u9593</h2>
      <p class="processing-section-sub">\u9577\u5EA6\u4F9D\u5F8C\u7AEF\u8A18\u9304\u7684\u5BE6\u969B\u968E\u6BB5\u8017\u6642\u6BD4\u4F8B\u6392\u5217\uFF1B\u672A\u57F7\u884C\u6216\u7121\u6CD5\u53D6\u5F97\u7684\u968E\u6BB5\u4E0D\u6703\u88AB\u8A08\u5165\u3002</p>
    </div>
  </div>`;if(!t.available||!s.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section">
        <div class="processing-empty">${n(t.label||"\u5C1A\u7121\u53EF\u8A08\u7B97\u7684\u968E\u6BB5\u8017\u6642\uFF1B\u57F7\u884C\u8CC7\u6599\u66F4\u65B0\u6216\u7D22\u5F15\u5F8C\u6703\u986F\u793A\u3002")}</div>
      </div>
    </section>`;let r=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${n(o.color||"var(--accent)")}" title="${n(`${o.label} ${G(o.duration_ms)} (${et(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${n(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${n(o.label)}</span>
        <span class="mono">${G(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${et(o.percent)}</span>
        ${he(o.status)}
      </div>`).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section">
      <div class="processing-timeline-label">
        <span>${n(t.label||"\u968E\u6BB5\u8017\u6642")}</span>
        <span class="mono">\u7E3D\u8A08 ${G(t.total_ms)}</span>
      </div>
      <div class="processing-stack" role="img" aria-label="\u968E\u6BB5\u8017\u6642\u6BD4\u4F8B">${r}</div>
      <div class="processing-legend">${i}</div>
    </div>
  </section>`}function bi(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let r=t.map(i=>{let o=s.get(i.branch)||Va[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${n(o)}</span>
          <strong>${n(i.title||"\u8655\u7406")}</strong>
          ${he(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${n(ne(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?G(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${n(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${r}</div></div>
  </section>`}function hi(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>te({tone:s.tone||"info",title:s.title,text:n(s.message||"")})).join("")}</div>`:""}function Qa(e){return`${hi(e)}
    ${ui(e)}
    <section class="processing-flow-section">
      <div class="processing-section-head">
        <div>
          <div class="report-kicker">PIPELINE CANVAS</div>
          <h2 class="report-section-title">\u8655\u7406\u6D41\u7A0B</h2>
          <p class="processing-section-sub">\u5224\u6C7A\u3001\u6CD5\u898F\u3001\u547D\u4EE4\u4E09\u689D\u6D41\u7A0B\u5373\u6642\u53CD\u6620\u76EE\u524D\u57F7\u884C\u968E\u6BB5\uFF1B\u66F2\u7DDA\u7531\u4F86\u6E90\u7BC0\u9EDE\u9023\u5230\u5404\u968E\u6BB5\uFF0C\u767C\u5149\u7BC0\u9EDE\u8207\u6D41\u52D5\u66F2\u7DDA\u8868\u793A\u76EE\u524D\u57F7\u884C\u4F4D\u7F6E\u3002</p>
        </div>
      </div>
      ${di(e)}
    </section>
    ${fi(e)}
    ${vi(e)}
    ${bi(e)}`}function $i(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${te({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:n(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${n(ne(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${f("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}var Ya={overview:"activity",full_update:"download",law_download:"layers",order_download:"file",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function yi(e){let t=Array.isArray(e.workflows)?e.workflows:[];return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...t.map(s=>{let a=s.active_run||null,r=a||s.last_run||null;return{...s,activeRun:a,lastRun:r,status:r?.status||"idle"}})]}function Ga(e,t){return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${yi(e).map(a=>{let r=a.id===t,i=Ya[a.id]||"terminal";return`<button class="status-tab${r?" is-active":""}" type="button"
            data-processing-workflow="${n(a.id)}"
            ${r?'aria-current="page"':""}>
            <span class="status-tab-icon">${f(i,15)}</span>
            <span class="status-tab-copy">
              <strong>${n(a.label)}</strong>
              <small>${n(a.description||"")}</small>
            </span>
            ${he(a.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${n(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function wi(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${he(e.status)}
      <span class="mono">${n(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${n(ne(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${G(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${n(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${n(t.log_path)}</strong>`:""}
    </div>
  </div>`}function _i(e){let t=e.active_run||null,s=t||e.last_run||null,a=!!t,r=!!e.can_run&&!a,i=e.id==="full_update",o=Array.isArray(e.command)?e.command.join(" "):"";return`<div class="processing-workflow-panel">
    ${te({tone:"info",title:e.label,text:e.description||""})}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${f(Ya[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
        <span class="badge badge-neutral badge-mono">${n(e.branch||"")}</span>
      </div>
      <div class="processing-workflow-command-grid">
        <span>\u7A0B\u5F0F</span><code>${n(e.program||"\u2014")}</code>
        <span>Shell\uFF0F\u5165\u53E3</span><code>${n(e.script||"\u2014")}</code>
        <span>\u5BE6\u969B\u547D\u4EE4</span><code class="processing-workflow-command">${n(o||"\u2014")}</code>
      </div>
      <div class="processing-workflow-actions">
        <button class="btn btn-primary btn-sm" type="button"
          data-processing-action="run-workflow"
          data-workflow-id="${n(e.id)}"
          ${r?"":"disabled"}>
          ${f("play",14)}<span>${a?"\u57F7\u884C\u4E2D":i?"\u57F7\u884C\u8CC7\u6599\u66F4\u65B0":"\u57F7\u884C\u6B64\u6D41\u7A0B"}</span>
        </button>
        ${t?`<button class="btn btn-secondary btn-sm processing-stop" type="button"
                data-processing-action="stop">${f("x",14)}<span>\u505C\u6B62</span></button>`:""}
      </div>
      <div class="side-card-foot">
        ${i?"\u6703\u4F9D\u5E8F\u57F7\u884C\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u8207\u53EF\u9078\u7684 Qdrant \u7D22\u5F15\u3002":"\u57F7\u884C\u7D50\u679C\u6703\u5BEB\u5165\u5171\u7528\u8655\u7406\u72C0\u614B\u6A94\uFF0C\u53EF\u5F9E\u8655\u7406\u7E3D\u89BD\u67E5\u770B\u3002"}
      </div>
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${f("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${he(s?.status||"idle")}
      </div>
      ${wi(s)}
    </section>
  </div>`}function za(e,t){if(t==="overview")return Qa(e);let a=(Array.isArray(e.workflows)?e.workflows:[]).find(r=>r.id===t);return a?_i(a):Qa(e)}async function ki(e){e.innerHTML=`<section class="page processing-page">
    <div class="page-header">
      <div>
        <div class="page-kicker">DATA PIPELINE</div>
        <h1 class="page-title">\u8CC7\u6599\u8655\u7406</h1>
        <p class="page-subtitle">\u5373\u6642\u8FFD\u8E64\u5224\u6C7A\u3001\u6CD5\u898F\u8207\u547D\u4EE4\u7684\u8655\u7406\u9032\u5EA6\uFF0C\u6AA2\u67E5\u672C\u6A5F\u672A\u8655\u7406\u58D3\u7E2E\u6A94\uFF0C\u4E26\u53EF\u63A5\u7E8C\u7DDA\u4E0A\u8CC7\u6599\u66F4\u65B0\u3002</p>
      </div>
      <div class="page-actions processing-actions">
        <label class="processing-index-toggle" title="\u52FE\u9078\u5F8C\uFF0C\u8CC7\u6599\u66F4\u65B0\u5B8C\u6210\u532F\u5165\u8207 Parquet \u6703\u63A5\u7E8C\u53EF\u4E2D\u65B7\u7E8C\u8DD1\u7684 Qdrant \u7D22\u5F15">
          <input type="checkbox" id="processing-index-toggle" />
          <span>\u5B8C\u6210\u5F8C\u63A5\u7E8C Qdrant \u7D22\u5F15</span>
        </label>
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh" id="processing-refresh">
          ${f("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
        <button class="btn btn-secondary btn-sm processing-stop" type="button" data-processing-action="stop" id="processing-stop" hidden>
          ${f("x",14)}<span>\u505C\u6B62\u66F4\u65B0</span>
        </button>
        <button class="btn btn-primary btn-sm" type="button" data-processing-action="update" id="processing-update">
          ${f("download",14)}<span data-update-label>\u8CC7\u6599\u66F4\u65B0</span>
        </button>
      </div>
    </div>
    <div class="status-layout processing-layout">
      <aside class="status-sidebar processing-sidebar" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
        <div id="processing-workflows">
          <div class="status-sidebar-head">
            <div class="eyebrow">DATA WORKFLOWS</div>
            <div class="skeleton skeleton-line" style="width:90px;height:18px"></div>
          </div>
          ${Array.from({length:7}).map(()=>'<div class="skeleton skeleton-line" style="width:100%;height:48px;margin-top:8px"></div>').join("")}
        </div>
      </aside>
      <section class="status-panel" id="processing-root">
        <div class="processing-loading" role="status">
          <span class="spinner" aria-hidden="true"></span>
          <span>\u6B63\u5728\u8B80\u53D6\u8655\u7406\u72C0\u614B\u2026</span>
        </div>
      </section>
    </div>
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-workflows"),r=e.querySelector("#processing-update"),i=e.querySelector("#processing-stop"),o=e.querySelector("#processing-refresh"),c=e.querySelector("#processing-index-toggle"),g=!1,$=!1,S=!1,y=null,w="",x="",b="overview",_=null,P=B=>{let L=B.capabilities||{},p=!!(c&&c.checked),m=p?L.can_start_update_with_index!==!1:L.can_start_update!==!1,T=p&&L.index_blocked_reason||L.start_blocked_reason;if(!S){r.disabled=!m,r.title=T||"\u6AA2\u67E5\u7DDA\u4E0A\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0C\u4E26\u8655\u7406\u672A\u532F\u5165\u7684\u5224\u6C7A\u58D3\u7E2E\u6A94\u3002";let U=r.querySelector("[data-update-label]");U&&(U.textContent=m?"\u8CC7\u6599\u66F4\u65B0":L.active_update_id?"\u66F4\u65B0\u57F7\u884C\u4E2D":"\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D"),i.hidden=!L.can_stop_update,c&&(c.disabled=L.can_start_update===!1)}},N=async({silent:B=!1}={})=>{if(!(g||$)){$=!0,B||ae(o,!0,"\u66F4\u65B0\u4E2D\u2026");try{let L=await F.processing();if(g)return;y=L;let p=Ga(L,b);p!==x&&(a.innerHTML=p,x=p);let m=za(L,b);m!==w&&(s.innerHTML=m,w=m);let T=s.querySelector("[data-processing-updated-at]");if(T){let U=ne(L.generated_at);T.textContent!==U&&(T.textContent=U)}P(L)}catch(L){if(g)return;let p=$i(L.message,y);p!==w&&(s.innerHTML=p,w=p),B||C(L.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{$=!1,B||ae(o,!1)}}},M=async B=>{if(!S){S=!0,ae(B,!0,"\u555F\u52D5\u4E2D\u2026");try{let L=!!(c&&c.checked),p=await F.startProcessingUpdate(L);C(`\u5DF2\u555F\u52D5\u8CC7\u6599\u66F4\u65B0${L?"\uFF0C\u5B8C\u6210\u5F8C\u63A5\u7E8C Qdrant \u7D22\u5F15":""}\u3002`,"ok",6e3),p&&p.run_id&&console.info("processing update started",p),await N({silent:!0})}catch(L){C(L.message||"\u7121\u6CD5\u555F\u52D5\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{S=!1,ae(B,!1),y&&P(y)}}},D=async(B,L)=>{if(!S){S=!0,ae(B,!0,"\u555F\u52D5\u4E2D\u2026");try{let p=await F.startProcessingWorkflow(L);C("\u5DF2\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","ok",6e3),p&&p.run_id&&console.info("processing workflow started",p),await N({silent:!0})}catch(p){C(p.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{S=!1,ae(B,!1),y&&P(y)}}},z=async B=>{if(!S){S=!0,ae(B,!0,"\u505C\u6B62\u4E2D\u2026");try{let L=await F.stopProcessingUpdate();C(L.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3),await N({silent:!0})}catch(L){C(L.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{S=!1,ae(B,!1),y&&P(y)}}},Z=B=>{let L=B.target.closest("[data-processing-action]");if(!L||L.disabled)return;let p=L.dataset.processingAction;if(p==="refresh")N({silent:!1});else if(p==="update")M(L);else if(p==="run-workflow"){let m=L.dataset.workflowId||"";m==="full_update"?M(L):D(L,m)}else p==="stop"&&z(L)},R=B=>{B.target===c&&y&&P(y)},E=B=>{let L=B.target.closest("[data-processing-workflow]");if(L&&(b=L.dataset.processingWorkflow||"overview",y)){let p=Ga(y,b);a.innerHTML=p,x=p;let m=za(y,b);s.innerHTML=m,w=m}};return t.addEventListener("click",Z),a.addEventListener("click",E),c&&c.addEventListener("change",R),await N({silent:!1}),_=window.setInterval(()=>{document.hidden||N({silent:!0})},Yr),()=>{g=!0,_!==null&&window.clearInterval(_),t.removeEventListener("click",Z),a.removeEventListener("click",E),c&&c.removeEventListener("change",R)}}var Ps={};Ge(Ps,{render:()=>Ui});var Za={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u9000\u5F79",badge:"badge-neutral"}},Wt={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},Cs={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},Xa={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function en(e){let t=Za[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${n(t.label)}</span>`}function Ns(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function Si(e){return Ns(e).map(t=>{let[s,a]=t.split("|").map(r=>r.trim());return{law_name:s||"",source_type:a||""}})}function xi(e){return Ns(e).map(t=>{let[s,a]=t.split("|").map(r=>r.trim());return{law_name:s||"",article_no:a||""}})}function qi(e){return Ns(e).map(t=>({jid:t.trim()}))}function Ai(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function Li(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function Mi(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function Ti(e){return(e?.tags||[]).join(", ")}function Vt(e){return`<div class="qb-empty">${f("info",18)}<span>${n(e)}</span></div>`}function tn(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),r=[...t.map(i=>`<span class="chip">${n(i)}</span>`),...s.map(i=>`<span class="chip">${n(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${n(i)}</span>`)];return r.length?`<div class="chips qb-labels">${r.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function ji(e){let t=!!e;return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${f(t?"edit":"plus",14)}${t?`\u7DE8\u8F2F\u984C\u76EE #${e.id}`:"\u65B0\u589E\u984C\u76EE"}</span>
      ${t?'<button class="btn btn-ghost btn-sm" type="button" data-qb-action="new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
    </div>
    <form class="qb-form" data-qb-form="create" id="qb-create-form">
      <input type="hidden" name="item_id" value="${t?e.id:""}" />
      <label class="field qb-wide">
        <span class="field-label">\u984C\u76EE <span class="field-tag">question</span></span>
        <textarea class="input" name="question" rows="3" required placeholder="\u4F8B\u5982\uFF1A\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F">${n(e?.question||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u984C\u578B</span>
          <select class="select" name="question_type">${Object.entries(Wt).map(([s,a])=>`<option value="${s}" ${e?.question_type===s?"selected":""}>${a}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u96E3\u5EA6</span>
          <select class="select" name="difficulty">${Object.entries(Cs).map(([s,a])=>`<option value="${s}" ${e?.difficulty===s?"selected":""}>${a}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u53EF\u898B\u6027</span>
          <select class="select" name="visibility">
            <option value="shared" ${e?.visibility!=="holdout"?"selected":""}>\u5171\u7528</option>
            <option value="holdout" ${e?.visibility==="holdout"?"selected":""}>Holdout</option>
          </select>
        </label>
      </div>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u9810\u671F\u6CD5\u898F\uFF0F\u547D\u4EE4 <span class="field-tag">\u6BCF\u884C\u4E00\u7B46\uFF0C\u53EF\u52A0 |law/order</span></span>
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${n(Ai(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${n(Li(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${n(Mi(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${n(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${n(Ti(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
        </label>
        <label class="field"><span class="field-label">\u5099\u8A3B</span>
          <input class="input" name="notes" value="${n(e?.notes||"")}" placeholder="\u4F86\u6E90\u3001\u6A19\u8A3B\u7406\u7531\u6216\u5F85\u78BA\u8A8D\u4E8B\u9805" />
        </label>
      </div>
      <label class="checkbox-field qb-checkbox">
        <input type="checkbox" name="must_refuse" ${e?.rubric?.must_refuse?"checked":""} />
        <span>\u6B64\u984C\u61C9\u6B63\u78BA\u62D2\u7D55\u56DE\u7B54\uFF08\u7121\u8CC7\u6599\uFF0F\u8D85\u51FA\u7BC4\u570D\uFF09</span>
      </label>
      <div class="qb-actions">
        <button class="btn btn-primary" type="submit">${f("check",14)}<span>${t?"\u5132\u5B58\u65B0\u7248\u672C":"\u5EFA\u7ACB\u984C\u76EE"}</span></button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-create">\u6E05\u9664</button>
      </div>
      <div class="qb-form-hint">\u4FEE\u6539\u5DF2\u5B58\u5728\u7684\u984C\u76EE\u6703\u5EFA\u7ACB\u65B0\u7248\u672C\uFF1B\u5DF2\u6838\u51C6\u984C\u76EE\u4FEE\u6539\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002</div>
    </form>
    <details class="qb-import">
      <summary>${f("upload",14)}JSON \u6279\u6B21\u532F\u5165</summary>
      <p class="qb-muted">\u683C\u5F0F\uFF1A<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>\u3002\u76F8\u540C\u984C\u76EE fingerprint \u9810\u8A2D\u66F4\u65B0\u3002</p>
      <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${f("upload",13)}<span>\u532F\u5165 JSON</span></button>
      </div>
    </details>
  </section>`}function Rs(e,{reviewMode:t=!1}={}){return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${n(e.question)}</strong>
        <span class="qb-meta">
          ${n(Wt[e.question_type]||e.question_type)}
          \xB7 ${n(Cs[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${en(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${n(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${tn(e)}
    <div class="qb-item-foot">
      <span>\u66F4\u65B0 ${n(ne(e.updated_at))}</span>
      ${e.reviewed_by?`<span>\u5BE9\u6838 ${n(e.reviewed_by)}</span>`:""}
      ${e.review_comment?`<span class="qb-comment">${n(e.review_comment)}</span>`:""}
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${f("edit",13)}<span>\u7DE8\u8F2F</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${e.id}">${f("shield",13)}<span>${t?"\u6279\u6CE8":"\u9A57\u6536"}</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${f("trash",13)}<span>\u522A\u9664</span></button>
      </div>
    </div>
  </article>`}function Ei(e){return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${f("database",14)}\u984C\u5EAB\u7BA1\u7406</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="new">${f("plus",13)}<span>\u65B0\u589E</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="revalidate">${f("refresh",13)}<span>\u91CD\u65B0\u9A57\u8B49</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="export">${f("download",13)}<span>\u532F\u51FA JSON</span></button>
      </div>
    </div>
    <form class="qb-filters" data-qb-form="filter">
      <input class="input" name="query" type="search" placeholder="\u641C\u5C0B\u984C\u76EE\u6216\u53C3\u8003\u7B54\u6848" value="${n(e.filters.query)}" />
      <select class="select" name="status">
        <option value="">\u5168\u90E8\u72C0\u614B</option>
        ${Object.entries(Za).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(Wt).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(Cs).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <input class="input" name="tag" placeholder="\u6A19\u7C64" value="${n(e.filters.tag)}" />
      <button class="btn btn-primary btn-sm" type="submit">${f("search",13)}<span>\u7BE9\u9078</span></button>
    </form>
    <div class="qb-list">
      ${e.items.length?e.items.map(t=>Rs(t)).join(""):Vt("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${u(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}function Ri(e){let t=e.reviewDetail;return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${f("shield",14)}\u984C\u5EAB\u4EBA\u5DE5\u9A57\u6536\u6279\u6CE8</span>
      <span class="badge badge-warn">\u5F85\u5BE9 ${u(e.stats.pending_review||0)}</span>
    </div>
    <label class="field qb-reviewer-field">
      <span class="field-label">\u9A57\u6536\u8005\u540D\u7A31</span>
      <input class="input" id="qb-reviewer-name" value="${n(e.reviewer)}" placeholder="\u76EE\u524D\u4EFB\u4F55\u4EBA\u53EF\u9A57\u6536\uFF1BGoogle Auth \u5F8C\u6539\u7531\u7BA1\u7406\u8005" />
    </label>
    ${t?`<div class="qb-review-detail">
            <button class="btn btn-ghost btn-sm" type="button" data-qb-action="review-back">${f("chevronLeft",13)}<span>\u8FD4\u56DE\u5F85\u5BE9\u5217\u8868</span></button>
            ${Rs(t,{reviewMode:!0})}
            ${tn(t)}
            ${t.reference_answer?`<div class="qb-reference"><span class="summary-label">\u53C3\u8003\u7B54\u6848</span><p>${n(t.reference_answer)}</p></div>`:""}
            <form class="qb-review-form" data-qb-form="review" data-id="${t.id}">
              <div class="qb-score-grid">
                ${[["clarity","\u984C\u76EE\u6E05\u6670"],["labels","\u6CD5\u898F\uFF0F\u689D\u6587\u6A19\u8A3B"],["answer","\u53C3\u8003\u7B54\u6848"],["difficulty","\u96E3\u5EA6\u8207\u6A19\u7C64"],["overall","\u6574\u9AD4"]].map(([s,a])=>`<label class="field"><span class="field-label">${a} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${s}" value="4" /></label>`).join("")}
              </div>
              <label class="field"><span class="field-label">\u6279\u6CE8</span><textarea class="input" name="comment" rows="3" placeholder="\u6A19\u8A3B\u7406\u7531\u3001\u9700\u8981\u4FEE\u6539\u7684\u6B04\u4F4D\uFF0C\u6216\u9A57\u6536\u7D50\u8AD6\u3002"></textarea></label>
              <div class="qb-actions">
                <button class="btn btn-primary btn-sm" type="button" data-qb-action="decide" data-decision="approved">${f("check",13)}<span>\u6838\u51C6</span></button>
                <button class="btn btn-secondary btn-sm" type="button" data-qb-action="decide" data-decision="changes_requested">${f("edit",13)}<span>\u9000\u56DE\u4FEE\u6539</span></button>
                <button class="btn btn-ghost btn-sm" type="button" data-qb-action="decide" data-decision="rejected">${f("x",13)}<span>\u62D2\u7D55</span></button>
              </div>
            </form>
            ${t.reviews?.length?`<div class="qb-review-history"><span class="summary-label">\u5BE9\u6838\u7D00\u9304</span>${t.reviews.map(s=>`<div class="qb-review-row"><span>${n(s.reviewer||"\u533F\u540D")}</span>${en(s.decision==="approved"?"accepted":s.decision)}<span>${n(ne(s.created_at))}</span><p>${n(s.comment||"\u2014")}</p></div>`).join("")}</div>`:""}
          </div>`:`<div class="qb-list">${e.reviewItems.length?e.reviewItems.map(s=>Rs(s,{reviewMode:!0})).join(""):Vt("\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u984C\u76EE\u3002")}</div>`}
  </section>`}function Ci(e){let t=e.editingSuite;return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${f("cube",14)}Benchmark \u984C\u5EAB</span>
      <span class="badge badge-info">${u(e.ready.length)} benchmark-ready</span>
    </div>
    <form class="qb-suite-form" data-qb-form="suite">
      <input type="hidden" name="suite_id" value="${t?.id||""}" />
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${n(t?.name||"Pilot 30")}" /></label>
        <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(Xa).map(([s,a])=>`<option value="${s}" ${t?.tier===s?"selected":""}>${a}</option>`).join("")}</select></label>
      </div>
      <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${n(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
      <div class="qb-check-list">
        ${e.ready.length?e.ready.map(s=>{let a=t?t.items?.some(r=>Number(r.id)===Number(s.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${s.id}" ${a?"checked":""}/><span><strong>#${s.id}</strong> ${n(s.question)} <small>${n(Wt[s.question_type]||s.question_type)}</small></span></label>`}).join(""):Vt("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
      </div>
      <div class="qb-actions">
        <button class="btn btn-primary" type="submit">${f("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
        ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
      </div>
    </form>
    <div class="qb-list">
      ${e.suites.length?e.suites.map(s=>`<article class="qb-suite">
        <div class="qb-item-head">
          <div class="qb-item-title"><strong>${n(s.name)}</strong><span class="qb-meta">${n(Xa[s.tier]||s.tier)} \xB7 v${s.version} \xB7 ${u(s.item_count)} \u984C</span></div>
          <span class="badge ${s.status==="frozen"?"badge-ok":"badge-neutral"}">${s.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
        </div>
        <div class="qb-suite-items">${(s.items||[]).slice(0,8).map(a=>`<span class="chip">#${a.id} ${n(a.question.slice(0,22))}${a.question.length>22?"\u2026":""}</span>`).join("")}${s.item_count>8?`<span class="qb-muted">+${s.item_count-8}</span>`:""}</div>
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${s.id}">${f("edit",13)}<span>\u7DE8\u8F2F\u984C\u76EE</span></button>
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${s.id}">${f("shield",13)}<span>\u51CD\u7D50</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${s.id}">${f("trash",13)}<span>\u522A\u9664</span></button>
        </div>
      </article>`).join(""):Vt("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
    </div>
  </section>`}function Ni(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),r=Number(a?.value);Number.isFinite(r)&&(t[s]=Math.max(1,Math.min(5,Math.round(r))))}return t}function Pi(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:Si(t.get("expected_laws")),expected_articles:xi(t.get("expected_articles")),expected_judgments:qi(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function sn(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},r={tab:"",editing:null,editingSuite:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tag:""},stats:{},suites:[],ready:[],reviewItems:[],reviewDetail:null,reviewer:(()=>{try{return window.localStorage.getItem("judgment.reviewer")||"anonymous"}catch{return"anonymous"}})()},i=R=>e.querySelector(`#quality-panel-${a[R]}`),o=R=>{r.reviewer=String(R||"").trim()||"anonymous";try{window.localStorage.setItem("judgment.reviewer",r.reviewer)}catch{}},c=()=>{s&&s(r.stats)},g=R=>{t&&t(R),b(R)},$=async()=>{try{r.stats=await F.questionBankStats()}catch{r.stats={}}c()},S=()=>{let R=i("create");R&&(R.innerHTML=ji(r.editing))},y=async()=>{let R=i("manage");if(R){R.innerHTML='<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026</span></div></section>';try{let E=await F.questionBankItems(r.filters,r.limit,r.offset);r.items=E.items||[],r.total=Number(E.total||0),r.stats=E.stats||r.stats,R.innerHTML=Ei(r),c()}catch(E){R.innerHTML=`<section class="report-card qb-card">${te({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:n(E.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},w=async()=>{let R=i("suite");if(R){R.innerHTML='<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026</span></div></section>';try{let[E,B]=await Promise.all([F.benchmarkSuites(),F.benchmarkReadyQuestions(300)]);r.suites=E.suites||[],r.ready=B.items||[],R.innerHTML=Ci(r)}catch(E){R.innerHTML=`<section class="report-card qb-card">${te({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:n(E.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},x=async()=>{let R=i("review");if(R){R.innerHTML='<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>\u8B80\u53D6\u5F85\u5BE9\u984C\u76EE\u4E2D\u2026</span></div></section>';try{let[E,B]=await Promise.all([F.questionBankItems({status:"pending_review"},100,0),F.questionBankItems({status:"changes_requested"},100,0)]);r.reviewItems=[...E.items||[],...B.items||[]],r.stats=E.stats||r.stats,r.reviewDetail&&(r.reviewDetail=await F.questionBankItem(r.reviewDetail.id)),R.innerHTML=Ri(r);let L=R.querySelector("#qb-reviewer-name");L&&(L.value=r.reviewer,L.addEventListener("change",()=>o(L.value))),c()}catch(E){R.innerHTML=`<section class="report-card qb-card">${te({tone:"danger",title:"\u5F85\u5BE9\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:n(E.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}};function b(R){r.tab=R;for(let E of Object.keys(a)){let B=i(E);B&&(B.hidden=E!==R)}R==="create"?S():R==="manage"?y():R==="suite"?w():R==="review"&&x()}let _=R=>{let E=r.items.find(B=>Number(B.id)===Number(R));r.reviewDetail=E||{id:Number(R)},g("review")},P=async R=>{let E=Pi(R),B=Number(R.elements.item_id?.value||0);try{B?(await F.updateQuestionBankItem(B,{...E,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),C("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await F.createQuestionBankItem(E),C("\u984C\u76EE\u5DF2\u5EFA\u7ACB\u3002","ok")),r.editing=null,await $(),g("manage")}catch(L){let p=L.detail||L.payload?.detail,m=p?.errors?.join(" \xB7 ")||p?.message||L.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";C(m,"danger",8e3)}},N=async(R,E)=>{let B=Number(R.dataset.id||0);if(B)try{await F.reviewQuestionBankItem(B,{decision:E,reviewer:r.reviewer,rubric_scores:Ni(R),comment:String(R.querySelector('[name="comment"]')?.value||"")}),C(E==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":E==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",E==="approved"?"ok":"info"),r.reviewDetail=null,await $(),await x()}catch(L){let p=L.detail||L.payload?.detail,m=p?.errors?.join(" \xB7 ")||p?.message||L.message||"\u9A57\u6536\u5931\u6557\u3002";C(m,"danger",8e3)}},M=async R=>{let E=new FormData(R),B=Number(E.get("suite_id")||0),L=Array.from(R.querySelectorAll('input[name="item_ids"]:checked')).map(m=>Number(m.value)),p={name:String(E.get("name")||"").trim(),tier:String(E.get("tier")||"core"),description:String(E.get("description")||"").trim(),item_ids:L};try{B?(await F.updateBenchmarkSuite(B,p),C("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await F.createBenchmarkSuite(p),C("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),r.editingSuite=null,await w()}catch(m){let T=m.detail||m.payload?.detail,U=T?.errors?.join(" \xB7 ")||T?.message||m.message||"Suite \u5132\u5B58\u5931\u6557\u3002";C(U,"danger",8e3)}},D=async R=>{let E=R.target.closest("[data-qb-action]")?.dataset.qbAction;if(!E)return;let B=R.target.closest("[data-qb-action]"),L=Number(B.dataset.id||0);if(E==="new"){r.editing=null,g("create");return}if(E==="reset-create"){r.editing=null,S();return}if(E==="edit"){let p=r.items.find(m=>Number(m.id)===L);if(!p)return;r.editing=p,g("create");return}if(E==="review"){_(L);return}if(E==="review-back"){r.reviewDetail=null,x();return}if(E==="delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${L}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await F.deleteQuestionBankItem(L),C("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await $(),await y()}catch(p){C(p.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(E==="revalidate"){try{let p=await F.revalidateQuestionBank();C(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${u(p.checked||0)} \u984C\uFF0C${u(p.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await $(),await y()}catch(p){C(p.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(E==="export"){try{let p=await F.exportQuestionBank({status:""});Te(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(p,null,2),"application/json;charset=utf-8")}catch(p){C(p.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(E==="import-json"){let p=e.querySelector("#qb-import-json");try{let m=JSON.parse(String(p?.value||"").trim()),T=await F.importQuestionBank(m);C(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${T.created}\u3001\u66F4\u65B0 ${T.updated}\u3001\u932F\u8AA4 ${(T.errors||[]).length}\u3002`,(T.errors||[]).length?"warn":"ok",8e3),p&&(p.value=""),await $(),await y()}catch(m){C(m.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(E==="prev"||E==="next"){r.offset=Math.max(0,r.offset+(E==="next"?r.limit:-r.limit)),await y();return}if(E==="suite-edit"){let p=r.suites.find(m=>Number(m.id)===L);if(!p)return;r.editingSuite=p,w();return}if(E==="suite-new"){r.editingSuite=null,w();return}if(E==="suite-freeze"){try{await F.updateBenchmarkSuite(L,{freeze:!0}),C("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),r.editingSuite=null,await w()}catch(p){C(p.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(E==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${L}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await F.deleteBenchmarkSuite(L),C("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),r.editingSuite=null,await w()}catch(p){C(p.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(E==="decide"){let p=B.closest("form[data-qb-form='review']");p&&await N(p,String(B.dataset.decision||""))}},z=async R=>{let E=R.target.closest("[data-qb-form]");if(!E)return;R.preventDefault();let B=E.dataset.qbForm;if(B==="create")await P(E);else if(B==="filter"){let L=new FormData(E);r.filters={query:String(L.get("query")||"").trim(),status:String(L.get("status")||""),question_type:String(L.get("question_type")||""),difficulty:String(L.get("difficulty")||""),tag:String(L.get("tag")||"").trim()},r.offset=0,await y()}else B==="suite"&&await M(E)};e.addEventListener("click",D),e.addEventListener("submit",z);let Z=async()=>{await $(),r.tab==="create"?S():r.tab==="manage"?await y():r.tab==="suite"?await w():r.tab==="review"&&await x()};return $(),{show:b,refresh:Z,destroy(){e.removeEventListener("click",D),e.removeEventListener("submit",z)},getStats:()=>r.stats}}function Yt(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function an(e){return e==null?"\u2014":u(e)}function Bi(e){return e.count?e.severity==="danger"?re("failed","\u9700\u8655\u7406"):e.severity==="warn"?re("warning","\u6CE8\u610F"):re("preview","\u63D0\u793A"):re("success","\u901A\u904E")}function Ii(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function Di(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${Ii(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${n(e.label)}</span>
      ${Bi(e)}
    </div>
    <div class="quality-check-value">
      <strong>${u(t)}</strong>
      <span>\u7B46</span>
      <em>${n(Yt(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${n(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function Kt(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
      <div class="index-chart-head"><span>${n(e)}</span><span>${n(t)}</span></div>
      <div class="index-chart-empty">DuckDB \u6383\u63CF\u5F8C\u6C92\u6709\u53EF\u5448\u73FE\u7684\u8CC7\u6599\u3002</div>
    </div>`;let r=Math.max(...a.map(i=>Number(i.value)||0),1);return`<div class="index-chart-card">
    <div class="index-chart-head"><span>${n(e)}</span><span>${n(t)}</span></div>
    <div class="distribution">
      ${a.map(i=>{let o=Number(i.value)||0,c=Math.max(1.5,o/r*100);return`<div class="dist-row">
            <span class="dist-label" title="${n(i.label||"\u672A\u5206\u985E")}">${n(i.label||"\u672A\u5206\u985E")}</span>
            <span class="dist-track"><span class="dist-bar" style="width:${c.toFixed(2)}%"></span></span>
            <span class="dist-value">${u(o)}</span>
          </div>`}).join("")}
    </div>
  </div>`}function Oi(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},r=t.postgres_diff,i=r==null?"\u2014":r===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${u(Math.abs(r))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${u(t.vector_indexed)} / ${u(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${f("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${u(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${u(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${f("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${an(t.postgres_judgments)}</div>
      <div class="metric-foot">${n(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${f("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${n(Yt(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${n(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${f("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${an(a.candidate_total)}</div>
      <div class="metric-foot">${u(a.candidate_archive_count)} / ${u(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function Fi(e){return e.length?`<div class="table-wrap">
    <table class="data-table is-compact quality-archive-table">
      <thead>
        <tr>
          <th scope="col">\u58D3\u7E2E\u6A94</th>
          <th scope="col" class="cell-number">\u7B46\u6578</th>
          <th scope="col" class="cell-number">\u5019\u9078</th>
          <th scope="col" class="cell-number">\u7CBE\u78BA\u547D\u4E2D</th>
          <th scope="col" class="cell-number">\u547D\u4E2D\u7387</th>
          <th scope="col" class="cell-number">\u904E\u77ED</th>
          <th scope="col" class="cell-number" title="\u7F3A\u5C11\u6CD5\u9662\u3001\u6B63\u898F\u5316\u6CD5\u9662\u3001\u88C1\u5224\u65E5\u671F\u6216\u6848\u7531\u7684\u6B04\u4F4D\u6B21\u6578">\u7F3A\u4E2D\u7E7C</th>
          <th scope="col" class="cell-number">\u91CD\u8907\u5167\u5BB9</th>
          <th scope="col">\u65E5\u671F\u7BC4\u570D</th>
        </tr>
      </thead>
      <tbody>
        ${e.map(t=>{let s=(Number(t.missing_court_rows)||0)+(Number(t.missing_normalized_rows)||0)+(Number(t.missing_date_rows)||0)+(Number(t.invalid_date_rows)||0)+(Number(t.missing_title_rows)||0),a=t.candidate_count===null||t.candidate_count===void 0?"\u2014":u(t.candidate_count);return`<tr>
              <td class="cell-jid">
                <span class="mono">${n(t.archive||"\u2014")}</span>
                ${t.version?`<span class="chip">v${n(t.version)}</span>`:""}
              </td>
              <td class="cell-number">${u(t.rows)}</td>
              <td class="cell-number">${a}</td>
              <td class="cell-number">${u(t.matched_rows)}</td>
              <td class="cell-number">${n(Yt(t.match_rate))}</td>
              <td class="cell-number">${u(t.short_text_rows)}</td>
              <td class="cell-number">${u(s)}</td>
              <td class="cell-number">${u(t.duplicate_content_rows)}</td>
              <td class="cell-date">${n(Le(t.date_min))} \u2013 ${n(Le(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:ye({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function Hi(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],r=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],c=X(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${re(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${u(t.rows)} \u7B46 \xB7 ${u(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${c} \xB7 \u6383\u63CF ${G(e.scan_ms||0)} \xB7
          ${n(ne(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${f("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${te({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(g=>n(g)).join("<br>")})}</div>`:""}
    <div class="summary-strip quality-summary-strip">
      <div class="summary-item">
        <div class="summary-label">\u539F\u59CB\u7B46\u6578</div>
        <div class="summary-value">${u(t.rows)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">\u7CBE\u78BA\u547D\u4E2D</div>
        <div class="summary-value">${u(t.matched_rows)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">\u547D\u4E2D\u7387</div>
        <div class="summary-value">${n(Yt(t.match_rate))}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">\u91CD\u8907\u6848\u865F</div>
        <div class="summary-value">${u(t.duplicate_jid_rows)}</div>
      </div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u54C1\u8CEA\u6AA2\u67E5</span>
        <span class="muted" style="font-size:9.5px">
          ${u(r.ok_count)} \u9805\u901A\u904E \xB7
          ${u(r.warning_count)} \u9805\u6CE8\u610F \xB7
          ${u(r.danger_count)} \u9805\u9700\u8655\u7406 \xB7
          ${u(r.info_count)} \u9805\u63D0\u793A
        </span>
      </div>
      <div class="quality-checks">${a.map(Di).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${Oi(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${u(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${Fi(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${Kt("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${Kt("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${Kt("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${Kt("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function Ui(e){e.innerHTML=`<section class="page data-page quality-page">
    <div class="page-header">
      <div class="data-page-heading">
        <div class="eyebrow">DATA QUALITY</div>
        <div class="data-title-line">
          <h1 class="page-title">\u8CC7\u6599\u54C1\u8CEA</h1>
          <p class="page-subtitle data-page-subtitle">
            DuckDB \u76F4\u63A5\u6383\u63CF\u539F\u59CB\u5224\u6C7A Parquet\uFF0C\u6AA2\u67E5\u6848\u865F\u3001\u5168\u6587\u3001\u4E2D\u7E7C\u8CC7\u6599\u3001\u5F15\u7528\u4E00\u81F4\u6027\u8207 archive \u7D71\u8A08\uFF1B\u6578\u503C\u4E0D\u8DB3\u6642\u986F\u793A\u300C\u2014\u300D\uFF0C\u4E0D\u4EE5\u63A8\u6E2C\u88DC\u9F4A\u3002
          </p>
        </div>
      </div>
      <div class="page-actions">
        <span class="badge badge-neutral badge-mono" id="quality-meta">DUCKDB \xB7 \u8B80\u53D6\u4E2D</span>
        <button class="btn btn-secondary" type="button" id="quality-refresh">
          ${f("refresh",15)}<span>\u91CD\u65B0\u6383\u63CF</span>
        </button>
      </div>
    </div>
    <div class="status-layout quality-layout">
      <aside class="status-sidebar quality-sidebar" aria-label="\u8CC7\u6599\u54C1\u8CEA\u529F\u80FD">
        <div class="status-sidebar-head">
          <div class="eyebrow">DATA QUALITY</div>
          <div class="status-sidebar-title">\u54C1\u8CEA\u8207\u984C\u5EAB</div>
        </div>
        <nav class="status-tab-list" aria-label="\u8CC7\u6599\u54C1\u8CEA\u529F\u80FD">
          <button class="status-tab is-active" type="button" data-quality-tab="overview" aria-current="page">
            <span class="status-tab-icon">${f("activity",15)}</span>
            <span class="status-tab-copy"><strong>\u54C1\u8CEA\u7E3D\u89BD</strong><small>DuckDB \u539F\u59CB\u8CC7\u6599\u8207\u8986\u84CB\u6AA2\u67E5</small></span>
            <span class="badge badge-neutral" id="quality-badge-overview">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="create">
            <span class="status-tab-icon">${f("plus",15)}</span>
            <span class="status-tab-copy"><strong>\u984C\u5EAB\u65B0\u589E</strong><small>\u5EFA\u7ACB\u984C\u76EE\u3001\u6A19\u8A3B\u8207 JSON \u532F\u5165</small></span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="manage">
            <span class="status-tab-icon">${f("database",15)}</span>
            <span class="status-tab-copy"><strong>\u984C\u5EAB\u7BA1\u7406</strong><small>\u7248\u672C\u3001\u72C0\u614B\u3001\u6A19\u7C64\u8207\u522A\u9664</small></span>
            <span class="badge badge-neutral" id="quality-badge-manage">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="suite">
            <span class="status-tab-icon">${f("cube",15)}</span>
            <span class="status-tab-copy"><strong>Benchmark \u984C\u5EAB</strong><small>\u51CD\u7D50 suite \u8207 benchmark-ready \u984C\u76EE</small></span>
            <span class="badge badge-neutral" id="quality-badge-suite">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="review">
            <span class="status-tab-icon">${f("shield",15)}</span>
            <span class="status-tab-copy"><strong>\u984C\u5EAB\u4EBA\u5DE5\u9A57\u6536\u6279\u6CE8</strong><small>\u5F85\u5BE9\u3001\u6279\u6CE8\u3001\u6838\u51C6\u8207\u9000\u56DE</small></span>
            <span class="badge badge-warn" id="quality-badge-review">\u2014</span>
          </button>
        </nav>
        <div class="status-sidebar-foot">
          <span>\u984C\u76EE\u9A57\u8B49</span>
          <span class="mono">\u73FE\u884C\u6CD5\u898F\u689D\u6587 + \u5224\u6C7A jid</span>
        </div>
      </aside>
      <section class="status-panel quality-panel">
        <div id="quality-panel-overview">
          <div id="quality-content"><div class="report-card">
            <div class="report-head">
              <div class="report-title-group">
                <div class="report-kicker">DUCKDB DATA QUALITY</div>
                <div class="report-title">\u8B80\u53D6\u539F\u59CB Parquet \u7D71\u8A08</div>
                <div class="report-sub">\u6B63\u5728\u6383\u63CF\u6700\u65B0 manifest \u8207\u67E5\u8A62\u6B04\u4F4D\u2026</div>
              </div>
              <span class="spinner" aria-hidden="true"></span>
            </div>
            <div class="report-loading">
              <div class="skeleton skeleton-line" style="width:92%"></div>
              <div class="skeleton skeleton-line" style="width:84%"></div>
              <div class="skeleton skeleton-line" style="width:68%;margin-bottom:0"></div>
            </div>
          </div></div>
        </div>
        <div id="quality-panel-question-create" hidden></div>
        <div id="quality-panel-question-manage" hidden></div>
        <div id="quality-panel-benchmark-bank" hidden></div>
        <div id="quality-panel-question-review" hidden></div>
      </section>
    </div>
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),r=[...e.querySelectorAll("[data-quality-tab]")],i={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},o=null,c="overview",g=()=>{if(!o)return;t.innerHTML=Hi(o),a.textContent=`DUCKDB \xB7 ${u(o.totals?.rows)} \u7B46 \xB7 ${G(o.scan_ms||0)}`;let b=e.querySelector("#quality-badge-overview");b&&(b.textContent=u(o.totals?.rows||0))},$=b=>{c=b==="overview"?"overview":b;for(let _ of r){let P=_.dataset.qualityTab===c;_.classList.toggle("is-active",P),P?_.setAttribute("aria-current","page"):_.removeAttribute("aria-current")}for(let[_,P]of Object.entries(i))P&&(P.hidden=_!==c);c!=="overview"?a.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":o&&g()},S=sn(e,{onNavigate:b=>$(b),onStats:b=>{let _=b||{},P=e.querySelector("#quality-badge-manage"),N=e.querySelector("#quality-badge-suite"),M=e.querySelector("#quality-badge-review");P&&(P.textContent=u(_.total||0)),N&&(N.textContent=u(_.benchmark_ready||0)),M&&(M.textContent=u((_.pending_review||0)+(_.changes_requested||0)))}}),y=b=>{$(b),b!=="overview"&&S.show(b)},w=async()=>{ae(s,!0,"\u6383\u63CF\u4E2D\u2026");try{o=await F.quality(),g()}catch(b){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${te({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:n(b.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",C("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{ae(s,!1)}},x=async()=>{c==="overview"?await w():await S.refresh()};s.addEventListener("click",x),e.addEventListener("click",b=>{let _=b.target.closest("[data-quality-tab]");_&&y(_.dataset.qualityTab||"overview")}),t.addEventListener("click",b=>{!b.target.closest("[data-action='export-quality']")||!o||Te(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(o,null,2),"application/json;charset=utf-8")}),$("overview"),await w()}var Bs={};Ge(Bs,{render:()=>go});var nn={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var on={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},ln=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 Data \u2192 AI",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}];function Ji(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Me(e).label,tone:Me(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function Qi(e){let t=Me(e.status),s=nn[e.kind]||nn.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${u(e.latency_ms)} ms</span>`;return`<article class="service-card">
    <div class="service-top">
      <span class="service-icon">${f(s,14)}</span>
      <span class="service-name" title="${n(e.name)}">${n(e.name)}</span>
      <span class="service-kind">${n(e.kind||"")}</span>
    </div>
    <div class="service-status">
      <span class="status-dot ${t.tone==="ok"?"is-ok":t.tone==="warn"?"is-warn":t.tone==="danger"?"is-danger":"is-idle"}" aria-hidden="true"></span>
      ${n(t.label)}
      ${a}
    </div>
    <p class="service-detail" title="${n(e.detail||"")}">${n(e.detail||"")}</p>
  </article>`}function Gi(e,t){return`<div class="arch-node ${e?"":"is-muted"}" ${e?"":'title="\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"'}>${n(t)}</div>`}function zi(e,t){if(e==="IndexedDB")return Ks();let a={PostgreSQL:"postgres",Parquet:"parquet",Qdrant:"qdrant",Embedding:"embedding",Retriever:"rag","RAG Engine":"rag",LLM:"llm"}[e];return a?t.find(i=>i.id===a)?.status==="operational":!0}function Vi(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(c=>Gi(zi(c,t),c)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${n(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),r=[];return a.forEach((i,o)=>{o&&r.push(`<div class="arch-arrow" aria-hidden="true">${f("arrowRight",15)}</div>`),r.push(i)}),`<div class="arch-flow">${r.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${f("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>`}function Wi(e){return!Array.isArray(e)||!e.length?'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>':`<div class="endpoint-list">
    ${e.map(t=>`<div class="endpoint-row">
          <span class="endpoint-method">${n(t.method)}</span>
          <span class="endpoint-path" title="${n(t.path)}">${n(t.path)}</span>
          <span class="endpoint-label">${n(t.label||"")}</span>
        </div>`).join("")}
  </div>`}function ce(e,t){return`<div class="detail-row">
    <span class="detail-label">${n(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function Ki(e){return e?`<div class="detail-list">
    ${ce("\u7248\u672C ID",`<strong>#${u(e.id)}</strong>`)}
    ${ce("\u8CC7\u6599\u985E\u578B",re("operational",e.source_type==="law"?"\u6CD5\u898F":"\u547D\u4EE4"))}
    ${ce("\u4F86\u6E90\u66F4\u65B0\u65E5",`<strong>${n(e.update_date||"\u2014")}</strong>`)}
    ${ce("\u6CD5\u898F / \u689D\u6587",`<strong>${u(e.law_count)} / ${u(e.article_count)}</strong>`)}
    ${ce("\u4E0B\u8F09\u6642\u9593",`<span class="mono">${ne(e.downloaded_at)}</span>`)}
    ${ce("Parquet",`<code title="${n(e.parquet_path||"")}">${n(e.parquet_path||"\u2014")}</code>`)}
  </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}function Yi(e){if(!Array.isArray(e)||!e.length)return ye({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${n(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${Mt(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function Xi(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=Ji(e.status),r=s.find($=>$.id==="qdrant"),i=s.find($=>$.id==="rag"),o=s.find($=>$.id==="llm"),c=Oe(),g=on[c]||c;return`<section class="status-hero">
      <div class="status-hero-main">
        <div class="overall-row">
          <span class="overall-badge ${a.tone==="warn"?"is-warn":a.tone==="danger"?"is-danger":""}">
            <span class="status-dot ${a.tone==="ok"?"is-ok":a.tone==="warn"?"is-warn":"is-danger"}" aria-hidden="true"></span>
            ${n(a.label)}
          </span>
          <span class="badge badge-neutral badge-mono">v${n(e.version||"\u2014")}</span>
          <span class="badge badge-neutral badge-mono">${n(e.environment||"\u2014")}</span>
        </div>
        <h2 class="status-headline">${n(a.headline)}</h2>
        <p class="status-copy">${n(a.copy)}</p>
        <div class="status-meta">
          <span>${f("clock",11)} \u6AA2\u67E5\u6642\u9593 ${ne(e.checked_at)} \xB7 ${n(it(e.checked_at))}</span>
          <span>${f("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${f("database",11)} ${u(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${f("layers",11)} ${u(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${n(g)}">${f("link",11)} ${n(ze())}</span>
        </div>
      </div>
    </section>

    <div class="service-grid">${s.map(Qi).join("")}</div>

    <div class="status-summary">
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u6CD5\u898F</div>
        <div class="metric-value">${u(t.law_count)}</div>
        <div class="metric-foot">source_type = law</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u547D\u4EE4</div>
        <div class="metric-value">${u(t.order_count)}</div>
        <div class="metric-foot">source_type = order</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u689D\u6587\u7E3D\u6578</div>
        <div class="metric-value">${u(t.article_count)}</div>
        <div class="metric-foot">\u73FE\u884C\u7248\u672C\u5408\u8A08</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u8CC7\u6599\u7248\u672C</div>
        <div class="metric-value">${u(t.version_count)}</div>
        <div class="metric-foot">\u539F\u59CB Parquet \u7248\u672C</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u4E0B\u8F09\u57F7\u884C</div>
        <div class="metric-value">${u(t.run_count)}</div>
        <div class="metric-foot">\u542B\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557</div>
      </div>
    </div>

    ${r?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${te({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${n(r?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${n(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${n(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}

  }`}function Zi(e){let t=Array.isArray(e.services)?e.services:[],s=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Data \u2192 Intelligence</div>
      </div>
      <span class="badge badge-neutral badge-mono">${u((s.flow||[]).length)} layers</span>
    </div>
    ${Vi(s,t)}
  </div>`}function eo(e){let t=Oe(),s=on[t]||t,a=Ae("/api/docs"),r=Ae("/api/openapi.json");return`<div class="status-columns is-single">
    <section class="card">
      <div class="side-card-head">
        <span class="side-card-title">${f("terminal",14)}API \u7AEF\u9EDE</span>
        <a href="${n(a)}" target="_blank" rel="noopener noreferrer" class="chip"
          >OpenAPI ${f("external",11)}</a>
      </div>
      ${Wi(e.endpoints)}
      <div class="side-card-foot">
        \u76EE\u524D API Base\uFF1A<code>${n(ze())}</code>\uFF08${n(s)}\uFF09\u3002\u4E92\u52D5\u5F0F API \u6587\u4EF6\u4F4D\u65BC <a href="${n(a)}" target="_blank" rel="noopener noreferrer"><code>${n(a)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${n(r)}" target="_blank" rel="noopener noreferrer"><code>${n(r)}</code></a>\u3002
      </div>
    </section>
  </div>`}function to(e){let t=e.data||{};return`<div class="status-summary">
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u6CD5\u898F</div>
        <div class="metric-value">${u(t.law_count)}</div>
        <div class="metric-foot">source_type = law</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u547D\u4EE4</div>
        <div class="metric-value">${u(t.order_count)}</div>
        <div class="metric-foot">source_type = order</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u689D\u6587\u7E3D\u6578</div>
        <div class="metric-value">${u(t.article_count)}</div>
        <div class="metric-foot">\u73FE\u884C\u7248\u672C\u5408\u8A08</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u8CC7\u6599\u7248\u672C</div>
        <div class="metric-value">${u(t.version_count)}</div>
        <div class="metric-foot">\u539F\u59CB Parquet \u7248\u672C</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u5224\u6C7A\u7D22\u5F15</div>
        <div class="metric-value">${u(t.judgment_indexed_count)}</div>
        <div class="metric-foot">/ ${u(t.judgment_count)} \u7B46\u5224\u6C7A</div>
      </div>
    </div>
    <div class="status-columns is-single">
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${f("layers",14)}\u6700\u65B0\u8CC7\u6599\u7248\u672C</span>
          ${re("operational","Parquet")}
        </div>
        ${Ki(t.last_version)}
        <div class="side-card-foot">
          \u539F\u59CB Parquet \u5408\u8A08 ${X(t.parquet_bytes)}\uFF1BPostgreSQL \u4FDD\u5B58 metadata \u8207\u7248\u672C\u72C0\u614B\u3002
        </div>
      </section>
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${f("database",14)}\u8CC7\u6599\u96C6\u7D71\u8A08</span>
          <span class="badge badge-neutral badge-mono">${u(t.parquet_files)} FILES</span>
        </div>
        <div class="detail-list">
          ${ce("\u73FE\u884C\u6CD5\u898F",`<strong>${u(t.law_count)}</strong>`)}
          ${ce("\u73FE\u884C\u547D\u4EE4",`<strong>${u(t.order_count)}</strong>`)}
          ${ce("\u689D\u6587\u7E3D\u6578",`<strong>${u(t.article_count)}</strong>`)}
          ${ce("\u539F\u59CB Parquet",`<strong>${X(t.parquet_bytes)}</strong>`)}
          ${ce("\u5224\u6C7A\u6587\u4EF6",`<strong>${u(t.judgment_count)}</strong>`)}
          ${ce("\u5411\u91CF\u7D22\u5F15",`<strong>${u(t.judgment_indexed_count)}</strong> / ${u(t.judgment_count)}\uFF08${u(t.judgment_vector_points)} points\uFF09`)}
          ${ce("\u7D22\u5F15\u7248\u672C",`<strong>#${u(t.judgment_vector_version_id)}</strong> \xB7 ${n(t.judgment_vector_version_status||"legacy")}`)}
          ${ce("Alias",`<code>${n(t.judgment_vector_alias||"\u2014")}</code> \u2192 <code>${n(t.judgment_vector_collection||"\u2014")}</code>`)}
          ${ce("\u7D22\u5F15\u6A21\u578B",`<code>${n(t.judgment_vector_model||"\u2014")}</code>`)}
          ${ce("\u6700\u8FD1\u7D22\u5F15",`<span class="mono">${ne(t.judgment_indexed_at)}</span>`)}
        </div>
      </section>
    </div>`}function so(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${f("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${u(t.run_count)} TOTAL</span>
    </div>
    ${Yi(e.recent_runs)}
  </section>`}function ao(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function cn(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function tt(e,t,s,a,r){let i=ao(r);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${f(t,14)}${n(e)}</span>
      <strong>${n(s)}</strong>
    </div>
    ${cn(r,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function no(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${f("layers",14)}Docker</span>
        ${re("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${n(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let c=i.service?0:1,g=o.service?0:1;return c-g||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${n(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${n(i.service)}</span>`:""}</td>
        <td>${re(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
        <td class="cell-number">${i.cpu_percent===null||i.cpu_percent===void 0?"\u2014":`${u(i.cpu_percent)}%`}</td>
        <td class="cell-number">${X(i.memory_used)}${i.memory_limit?` / ${X(i.memory_limit)}`:""}</td>
        <td class="mono">${n(i.net_io||"\u2014")}</td>
        <td class="mono">${n(i.block_io||"\u2014")}</td>
        <td class="cell-number">${u(i.pids)}</td>
      </tr>`).join(""),r=(t.system||[]).map(i=>`<span class="resource-docker-pill">
        <strong>${n(i.type||"\u2014")}</strong>
        <span>${u(i.count)} \xB7 ${n(i.size||"\u2014")}</span>
      </span>`).join("");return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${f("layers",14)}Docker \u5BB9\u5668\u4F7F\u7528\u8CC7\u6E90</span>
      <span class="badge badge-ok badge-mono">${u(s.length)} \u500B\u5BB9\u5668</span>
    </div>
    ${r?`<div class="resource-docker-system">${r}</div>`:""}
    ${a?`<div class="table-wrap resource-table-wrap">
            <table class="data-table is-compact">
              <thead><tr>
                <th scope="col">\u5BB9\u5668</th><th scope="col">\u72C0\u614B</th><th scope="col">CPU</th>
                <th scope="col">RAM</th><th scope="col">Net I/O</th><th scope="col">Block I/O</th>
                <th scope="col">PIDs</th>
              </tr></thead>
              <tbody>${a}</tbody>
            </table>
          </div>`:'<div class="report-empty-inline">\u76EE\u524D\u6C92\u6709\u57F7\u884C\u4E2D\u7684\u5BB9\u5668\u3002</div>'}
    <div class="side-card-foot">${n(t.detail||"Docker \u8CC7\u6E90\u7D71\u8A08")}</div>
  </section>`}function ro(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",r=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${ce("\u8CC7\u6599\u5EAB",`<code>${n(s.database||"\u2014")}</code>`)}
           ${ce("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${X(s.storage_bytes)}</strong>`)}
           ${ce("Docker volume",`<strong>${X(s.volume_bytes)}</strong>${s.volume_name?` <code>${n(s.volume_name)}</code>`:""}`)}
           ${ce("\u9023\u7DDA\u6578",`<strong>${u(s.connections)}</strong>`)}`:`${ce("Collection",`<code>${n(s.collection||"\u2014")}</code>`)}
           ${ce("Docker volume",`<strong>${X(s.volume_bytes)}</strong>${s.volume_name?` <code>${n(s.volume_name)}</code>`:""}`)}
           ${ce("\u5411\u91CF\u9EDE\u6578",`<strong>${u(s.points_count)}</strong>`)}
           ${ce("Collections",`<strong>${u(s.collections)}</strong>`)}
           ${ce("Segments",`<strong>${u(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${n(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${n(s.kind||"")}</div>
          </div>
          ${re(i)}
        </div>
        <div class="resource-db-metrics">
          <div><span>CPU</span><strong>${s.cpu_percent===null||s.cpu_percent===void 0?"\u2014":`${u(s.cpu_percent)}%`}</strong></div>
          <div><span>RAM</span><strong>${X(s.memory_used)}</strong><small>${s.memory_limit?` / ${X(s.memory_limit)}`:""}</small></div>
          <div><span>\u5BB9\u5668</span><strong class="mono">${n(s.container||"\u2014")}</strong><small>${n(s.container_status||"\u2014")}</small></div>
        </div>
        <div class="detail-list">${o}</div>
        ${r.length?`<div class="resource-table-wrap">
                <table class="data-table is-compact">
                  <thead><tr><th scope="col">\u8CC7\u6599\u8868</th><th scope="col">\u5927\u5C0F</th></tr></thead>
                  <tbody>${r.map(c=>`<tr>
                        <td class="mono">${n(c.name||"\u2014")}</td>
                        <td class="cell-number">${X(c.bytes)}</td>
                      </tr>`).join("")}</tbody>
                </table>
              </div>`:""}
        <div class="side-card-foot">${n(s.detail||"")}</div>
      </article>`}).join("")}</div>`}function ut(e,t,s,a){let r=Number(t)||0,i=a?r/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${n(e)}</span>
      <strong>${X(r)}</strong>
    </div>
    ${cn(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function io(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},r=t.docker||{},i=t.volumes||{},o=i.postgres||{},c=i.qdrant||{},g=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${f("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${X(g)}</span>
    </div>
    <div class="storage-list">
      ${ut("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${n(s.frontend_path||"\u2014")}</span>`,g)}
      ${ut("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${n(s.backend_path||"\u2014")}</span>`,g)}
      ${ut("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",r.layers_bytes,`Images ${X(r.images_bytes)} \xB7 Containers ${X(r.containers_bytes)} \xB7 Build cache ${X(r.build_cache_bytes)}`,g)}
      ${ut("PostgreSQL volume",o.size_bytes,`<span class="mono">${n(o.name||"\u2014")}</span>`,g)}
      ${ut("Qdrant volume",c.size_bytes,`<span class="mono">${n(c.name||"\u2014")}</span>`,g)}
      ${ut("Parquet",a.total_bytes,`\u6CD5\u898F ${X(a.law_bytes)} \xB7 \u5224\u6C7A ${X(a.judgment_bytes)}`,g)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${X(g)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function oo(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},r=t.swap||{},i=e.storage||{},o=i.filesystem||{},c=Number(i.judgment_total_bytes||0),g=Array.isArray(e.disk)?e.disk:[],$=g[0]||{},S=Number(o.total_bytes||$.total||0),y=S?c/S*100:0,w=[s.load_1,s.load_5,s.load_15].map(_=>_??"\u2014").join(" / "),x=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":G(Number(t.uptime_seconds)*1e3),b=[$.label?tt("HDD \u5DF2\u4F7F\u7528","database",`${u($.percent)}%`,`${X($.used)} / ${X($.total)} \xB7 \u5269\u9918 ${X($.free)}<br><span class="mono">${n($.path||"")}</span>`,$.percent):"",c?tt("Judgment \u5143\u4EF6\u5408\u8A08","layers",X(c),`\u7D04\u5360 HDD ${u(y)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,y):"",...g.slice(1).map(_=>tt(`\u786C\u789F \xB7 ${_.label}`,"layers",`${u(_.percent)}%`,`${X(_.used)} / ${X(_.total)} \xB7 \u5269\u9918 ${X(_.free)}<br><span class="mono">${n(_.path||"")}</span>`,_.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${ne(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${tt("CPU \u4F7F\u7528\u7387","cpu",`${u(s.percent)}%`,`${u(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${u(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${n(w)}`,s.percent)}
      ${tt("\u8A18\u61B6\u9AD4","server",`${u(a.percent)}%`,`${X(a.used)} / ${X(a.total)} \xB7 \u53EF\u7528 ${X(a.available)}`,a.percent)}
      ${tt("Swap","layers",`${u(r.percent)}%`,`${X(r.used)} / ${X(r.total)}`,r.percent)}
      ${tt("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${u(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${n(x)}<br>${n(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${b||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${io(e)}
    ${no(e)}
    ${ro(e)}`}function rn(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function lo(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SYSTEM RESOURCE USAGE</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${te({tone:"danger",title:"\u8CC7\u6E90 API \u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-resources-retry">
          ${f("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function co(e,t,s){let a=e?.data||{},r=e?Me(e.status):null,i=s?Me(s.status):null,o={overview:r?`<span class="badge ${r.tone==="ok"?"badge-ok":r.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${n(r.label)}</span>`:"",resources:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${n(i.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${u(a.version_count)}</span>`,runs:`<span class="badge badge-neutral badge-mono">${u(a.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${ln.map(c=>{let g=c.id===t;return`<button class="status-tab${g?" is-active":""}" type="button"
          data-status-tab="${c.id}" ${g?'aria-current="page"':""}>
          <span class="status-tab-icon">${f(c.icon,15)}</span>
          <span class="status-tab-copy">
            <strong>${n(c.label)}</strong>
            <small>${n(c.hint)}</small>
          </span>
          ${o[c.id]||""}
        </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u6AA2\u67E5\u6642\u9593</span>
      <span class="mono">${n(e?ne(e.checked_at):"\u2014")}</span>
    </div>`}function uo(e,t,s,a,r){return e==="resources"?s?oo(s):a?rn():r?lo(r):rn():e==="architecture"?Zi(t):e==="api"?eo(t):e==="data"?to(t):e==="runs"?so(t):Xi(t)}function po(){return`<div class="status-hero">
      <div style="width:100%">
        <div class="skeleton skeleton-line" style="width:180px;height:26px"></div>
        <div class="skeleton skeleton-line" style="width:min(520px,88%);height:30px;margin-top:14px"></div>
        <div class="skeleton skeleton-line" style="width:min(640px,94%);margin-top:12px"></div>
      </div>
    </div>
    <div class="service-grid">
      ${Array.from({length:8}).map(()=>'<div class="skeleton" style="height:104px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="status-summary">
      ${Array.from({length:5}).map(()=>'<div class="skeleton" style="height:88px;border-radius:var(--radius-md)"></div>').join("")}
    </div>`}function mo(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u5FEB\u53D6\u6216\u63A8\u6E2C\u7684\u670D\u52D9\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${te({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${f("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function go(e,t){let s=!1,a=null,r=null,i="overview",o=null,c=!1,g=null;e.innerHTML=`<section class="page status-page">
    <div class="page-header">
      <div>
        <div class="eyebrow">OBSERVABILITY</div>
        <h1 class="page-title">\u7CFB\u7D71\u67B6\u69CB\u8207\u670D\u52D9\u72C0\u614B</h1>
        <p class="page-subtitle">\u6AA2\u8996\u524D\u7AEF\u3001FastAPI\u3001PostgreSQL\u3001Parquet \u8207 AI \u5143\u4EF6\u7684\u5373\u6642\u5065\u5EB7\u72C0\u614B\uFF0C
          \u4E26\u5F9E\u5DE6\u5074\u5206\u985E\u5207\u63DB\u670D\u52D9\u7E3D\u89BD\u3001\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528\u3001\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u4E0B\u8F09\u7D00\u9304\u3002</p>
      </div>
      <div class="page-actions">
        <label class="auto-refresh">
          <input type="checkbox" id="auto-refresh" />
          \u81EA\u52D5\u66F4\u65B0 30s
        </label>
        <button class="btn btn-secondary" type="button" id="refresh-status">
          ${f("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    <div class="status-layout">
      <aside class="status-sidebar" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
        <div id="status-nav">
          <div class="status-sidebar-head">
            <div class="eyebrow">STATUS SECTIONS</div>
            <div class="skeleton skeleton-line" style="width:90px;height:18px"></div>
          </div>
          ${Array.from({length:6}).map(()=>'<div class="skeleton skeleton-line" style="width:100%;height:52px;margin-top:8px"></div>').join("")}
        </div>
      </aside>
      <section class="status-panel" id="status-content">${po()}</section>
    </div>
  </section>`;let $=e.querySelector("#status-nav"),S=e.querySelector("#status-content"),y=e.querySelector("#refresh-status"),w=e.querySelector("#auto-refresh"),x=()=>{r&&($.innerHTML=co(r,i,o),S.innerHTML=uo(i,r,o,c,g))},b=async({quiet:N=!1}={})=>{if(!c){c=!0,g=null,i==="resources"&&x();try{let M=await F.systemUsage();if(s)return;o=M}catch(M){if(s)return;g=M,N||C(M.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{s||(c=!1,i==="resources"&&x())}}},_=async({quiet:N=!1}={})=>{N||(y.disabled=!0,ae(y,!0,"\u6AA2\u67E5\u4E2D\u2026"));try{let M=await F.status();if(s)return;r=M,x(),N||C("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(M){if(s)return;S.innerHTML=mo(M),N||C(M.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(y.disabled=!1,ae(y,!1))}},P=async({quiet:N=!1}={})=>{await _({quiet:N}),i==="resources"&&await b({quiet:N})};return $.addEventListener("click",N=>{let M=N.target.closest("[data-status-tab]");if(!M)return;let D=M.dataset.statusTab;ln.some(z=>z.id===D)&&(i=D,x(),i==="resources"&&!o&&!c&&b())}),S.addEventListener("click",N=>{N.target.closest("#status-retry")&&_(),N.target.closest("#status-resources-retry")&&b()}),y.addEventListener("click",()=>P()),w.addEventListener("change",()=>{a&&(window.clearInterval(a),a=null),w.checked&&(a=window.setInterval(()=>P({quiet:!0}),3e4),C("\u5DF2\u555F\u7528\u6BCF 30 \u79D2\u81EA\u52D5\u66F4\u65B0\u3002","info",2200))}),await _({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,a&&window.clearInterval(a)}}var Is={};Ge(Is,{render:()=>vo});var dn={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function un(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${n(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${n(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function fo(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}`)}:null})}async function vo(e,t){let s=!1,a=!1,r={embedding:[],llm:[]},i=!1,o=null,c=[],g="",$=null,S="";e.innerHTML=`<section class="page tests-page">
    <div class="page-header">
      <div>
        <div class="eyebrow">SYSTEM TEST</div>
        <h1 class="page-title">\u7CFB\u7D71\u6E2C\u8A66</h1>
        <p class="page-subtitle">\u5408\u4F75\u5F8C\u7AEF API \u9023\u7DDA\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u591A\u6A21\u578B\u6E2C\u8A66 Flow\u3002
          \u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002</p>
      </div>
      <div class="page-actions">
        <span class="badge badge-neutral badge-mono" id="tests-mode-badge">\u8B80\u53D6\u4E2D</span>
        <button class="btn btn-secondary" type="button" id="tests-refresh">
          ${f("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>

    <div class="tests-grid">
      <section class="card tests-card tests-api-card" aria-labelledby="tests-api-title">
        <form class="api-dialog-form tests-api-form" id="tests-api-form" novalidate>
          <div class="api-dialog-head">
            <span class="api-dialog-icon" aria-hidden="true">${f("link",17)}</span>
            <div class="api-dialog-heading">
              <div class="api-dialog-title" id="tests-api-title">\u5F8C\u7AEF API \u9023\u7DDA</div>
              <p class="api-dialog-copy">\u524D\u7AEF\u662F\u7D14\u975C\u614B\u6A94\u6848\uFF0C\u53EF\u5F9E\u672C\u6A5F\u6A94\u6848\u3001Cloudflare Pages \u6216\u4EFB\u4F55\u975C\u614B\u4E3B\u6A5F\u958B\u555F\uFF0C\u518D\u9023\u5230 FastAPI \u5F8C\u7AEF\u3002Cloudflare \u90E8\u7F72\u8ACB\u4F7F\u7528 cloudflared \u63D0\u4F9B\u7684 HTTPS \u4F4D\u5740\u3002</p>
            </div>
          </div>
          <label class="field" for="tests-api-input">
            <span class="field-label">API Base URL <span class="field-tag">runtime</span></span>
            <input class="input mono" id="tests-api-input" name="api-base" type="url"
              inputmode="url" autocomplete="url" spellcheck="false"
              placeholder="http://127.0.0.1:9200" />
            <span class="field-help">\u7559\u7A7A\u4EE3\u8868\u540C\u6E90\uFF1B\u4EE5 file:// \u958B\u555F\u6642\u7559\u7A7A\u6703\u4F7F\u7528 http://127.0.0.1:9200\u3002</span>
          </label>
          <div class="api-dialog-preview" id="tests-api-preview"></div>
          <div class="api-dialog-status" id="tests-api-status" role="status"></div>
          <div class="api-dialog-note" id="tests-api-note"></div>
          <div class="api-dialog-actions">
            <button class="btn btn-secondary btn-sm" type="button" id="tests-api-test">
              ${f("activity",14)}<span>\u6E2C\u8A66\u9023\u7DDA</span>
            </button>
            <span class="grow"></span>
            <button class="btn btn-ghost btn-sm" type="button" id="tests-api-reset">\u6062\u5FA9\u9810\u8A2D</button>
            <button class="btn btn-primary btn-sm" type="submit" id="tests-api-save">
              ${f("check",14)}<span>\u5132\u5B58\u4E26\u91CD\u65B0\u8F09\u5165</span>
            </button>
          </div>
        </form>
      </section>

      <section class="card tests-card" aria-labelledby="tests-mode-title">
        <div class="tests-card-head">
          <span class="tests-card-icon">${f("terminal",16)}</span>
          <div>
            <div class="tests-card-title" id="tests-mode-title">\u6E2C\u8A66\u6A21\u5F0F</div>
            <div class="tests-card-copy">\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u7D50\u679C\u5BEB\u5165\u6E2C\u8A66 Flow\u3002</div>
          </div>
        </div>
        <div class="tests-mode-row">
          <button class="header-power test-mode-switch" id="tests-mode-toggle"
            type="button" role="switch" aria-checked="false"
            aria-label="\u6E2C\u8A66\u6A21\u5F0F\u958B\u95DC" title="\u6E2C\u8A66\u6A21\u5F0F" disabled>
            <span class="header-power-label">\u2026</span>
            <span class="header-power-knob" aria-hidden="true"></span>
          </button>
          <div class="tests-mode-summary" id="tests-mode-summary">\u6B63\u5728\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\u2026</div>
        </div>
        <div class="tests-models" id="tests-mode-models"></div>
        <div class="tests-actions">
          <a class="btn btn-primary btn-sm" href="#/rag">
            ${f("sparkles",13)}<span>\u524D\u5F80 RAG \u63D0\u554F</span>
          </a>
          <a class="btn btn-secondary btn-sm" href="#/performance">
            ${f("activity",13)}<span>\u6548\u80FD Flow</span>
          </a>
        </div>
        <div class="tests-status" id="tests-mode-status" role="status"></div>
      </section>
    </div>

    <div id="tests-flow"></div>
  </section>`;let y=e.querySelector("#tests-mode-badge"),w=e.querySelector("#tests-mode-toggle"),x=e.querySelector("#tests-mode-summary"),b=e.querySelector("#tests-mode-models"),_=e.querySelector("#tests-mode-status"),P=e.querySelector("#tests-api-form"),N=e.querySelector("#tests-api-input"),M=e.querySelector("#tests-api-preview"),D=e.querySelector("#tests-api-status"),z=e.querySelector("#tests-api-note"),Z=e.querySelector("#tests-api-test"),R=e.querySelector("#tests-api-reset"),E=e.querySelector("#tests-api-save"),B=e.querySelector("#tests-refresh"),L=e.querySelector("#tests-flow"),p=(Q,se,de="")=>{Q&&(Q.textContent=se,Q.className=`tests-status${de?` is-${de}`:""}`)},m=(Q,se="")=>{D&&(D.textContent=Q,D.className=`api-dialog-status${se?` is-${se}`:""}`)},T=()=>Oe()==="query",U=()=>{let Q=Ie(N.value);return Q||(window.location.protocol==="file:"?is:"")},H=()=>{let Q=U(),se=De(),de=dn[Oe()]||Oe()||"\u540C\u6E90";M.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${n(ze(se))}</strong>${se?`\uFF08${n(de)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${n(Ae("/api/health",Q))}`},O=()=>{let Q=Oe(),se=`\u76EE\u524D\u4F86\u6E90\uFF1A${dn[Q]||Q||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,de="";Q==="query"?(de="is-warn",se="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):At()?(de="is-warn",se="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(Q==="file-default"||window.location.protocol==="file:")&&(se="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),z.textContent=se,z.className=`api-dialog-note${de?` ${de}`:""}`;let Se=Q==="query";E.disabled=Se,R.disabled=Se,N.readOnly=Se},j=()=>{if(!os(N.value))return m("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),N.focus(),null;let Q=U();return window.location.protocol==="https:"&&/^http:\/\//i.test(Q)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(Q)?(m("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),N.focus(),null):Q},J=()=>{N.value=De(),H(),O(),m("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},I=()=>{let Q=Array.isArray(r.embedding)?r.embedding.length:0,se=Array.isArray(r.llm)?r.llm.length:0;if(y&&(y.textContent=i?"\u5207\u63DB\u4E2D\u2026":a?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",y.className=`badge badge-mono ${i?"badge-info":a?"badge-warn":"badge-neutral"}`),w){w.disabled=i,w.classList.toggle("is-on",a),w.classList.toggle("is-off",!a&&!i),w.classList.toggle("is-busy",i),w.setAttribute("aria-checked",a?"true":"false"),w.setAttribute("aria-busy",i?"true":"false"),w.setAttribute("aria-label",i?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":a?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),w.title=i?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":a?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let de=w.querySelector(".header-power-label");de&&(de.textContent=i?"\u2026":a?"ON":"OFF")}x&&(x.textContent=a?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${Q} \u500B embedding \u8207 ${se} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),b&&(b.innerHTML=un("Embedding",r.embedding)+un("LLM",r.llm))},K=async()=>{try{let Q=await F.testMode();if(s)return;a=!!Q.enabled,r=Q.models||{embedding:[],llm:[]},p(_,"")}catch(Q){if(s)return;a=!1,r={embedding:[],llm:[]},p(_,Q.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}s||I()},ee=async()=>{if(i)return;let Q=!a;i=!0,I(),p(_,Q?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let se=await F.setTestMode(Q);if(s)return;a=!!se.enabled,r=se.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:a,models:r}}));let de=r.embedding?.length||0,Se=r.llm?.length||0;p(_,a?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${de} \u500B embedding \u8207 ${Se} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),C(a?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${de} \u500B embedding\u3001${Se} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",a?"ok":"info",6e3),await pe()}catch(se){s||(p(_,se.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),C(se.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{i=!1,s||I()}},fe=()=>{if(!L)return;let Q=fo(o,c,g);Q!==S&&(S=Q,L.innerHTML=ct(o,c,g))},ve=async()=>{try{let Q=await F.testRuns(30);if(s)return;c=Array.isArray(Q.runs)?Q.runs:[]}catch{if(s)return;c=[]}},pe=async()=>{try{let Q=g?await F.testRun(g):await F.testRunCurrent();if(s)return;o=Q.run||null,!g&&o&&o.status!=="running"&&!c.some(se=>se.run_id===o.run_id)&&await ve()}catch{if(s)return;o=null}s||fe()};N?.addEventListener("input",()=>{H(),m("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),Z?.addEventListener("click",async()=>{let Q=j();if(Q!==null){ae(Z,!0,"\u6E2C\u8A66\u4E2D\u2026"),m(`\u6B63\u5728\u9023\u7DDA\u5230 ${ze(Q)||"\u540C\u6E90"}\u2026`);try{let se=await Js(Q);if(s)return;m(`\u9023\u7DDA\u6210\u529F \xB7 v${se.version} \xB7 ${se.duration_ms} ms \xB7 GET ${Ae("/api/health",Q)}`,"ok")}catch(se){s||m(se.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{s||ae(Z,!1)}}}),P?.addEventListener("submit",Q=>{if(Q.preventDefault(),T())return;let se=j();se!==null&&(us(se),C(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${ze(se)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),R?.addEventListener("click",()=>{T()||(us(""),C("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),w?.addEventListener("click",ee),L?.addEventListener("change",async Q=>{Q.target.id==="test-run-select"&&(g=String(Q.target.value||""),await pe())}),L?.addEventListener("click",async Q=>{Q.target.closest("#test-flow-refresh")&&(g="",await ve(),await pe())}),B?.addEventListener("click",async()=>{ae(B,!0,"\u66F4\u65B0\u4E2D\u2026"),J(),await Promise.allSettled([K(),ve()]),s||await pe(),s||(ae(B,!1),C("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let Ne=Q=>{a=!!Q.detail?.enabled,r=Q.detail?.models||{embedding:[],llm:[]},I()};return window.addEventListener("judgment:test-mode",Ne),J(),I(),await Promise.allSettled([K(),ve()]),await pe(),$=window.setInterval(async()=>{s||document.hidden||g||await pe()},2500),typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{s=!0,$&&window.clearInterval($),window.removeEventListener("judgment:test-mode",Ne)}}var pn="rag",ts={rag:{page:js,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:As,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:Ps,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:Ms,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:Es,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:Bs,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:Is,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"}},Xt=document.getElementById("app-main"),Zt=null,es=0;function bo(){return`<div class="page-loading" aria-live="polite">
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-subtitle"></div>
    <div class="skeleton-grid">
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
    </div>
  </div>`}function Os(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||pn;return Object.prototype.hasOwnProperty.call(ts,t)?t:pn}function ho(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function $o(e){return`<section class="page">
    <div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">CONSOLE ERROR</div>
          <div class="report-title">\u9801\u9762\u8F09\u5165\u5931\u6557</div>
          <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u66FF\u4EE3\u6216\u63A8\u6E2C\u8CC7\u6599\u3002</div>
        </div>
      </div>
      <div class="report-section">
        <div class="notice notice-danger" role="alert">
          <span class="notice-icon" aria-hidden="true">${f("alert",12)}</span>
          <div class="notice-body">
            <strong>\u7121\u6CD5\u5EFA\u7ACB\u9801\u9762</strong>
            <p>${n(e.message||"\u672A\u77E5\u932F\u8AA4")}</p>
          </div>
        </div>
        <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
          <button class="btn btn-secondary btn-sm" type="button" id="route-retry">
            ${f("refresh",14)}<span>\u91CD\u65B0\u8F09\u5165</span>
          </button>
        </div>
      </div>
    </div>
  </section>`}async function Ds(){let e=Os(),t=++es;if(ho(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof Zt=="function"){try{Zt()}catch{}Zt=null}document.title=ts[e].title,Xt.innerHTML=bo(),Xt.focus({preventScroll:!0}),window.scrollTo({top:0,behavior:"auto"});let s={route:e,navigate(a){ts[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===es&&a&&(document.title=a)}};try{let a=await ts[e].page.render(Xt,s);if(t!==es){typeof a=="function"&&a();return}Zt=typeof a=="function"?a:null}catch(a){if(t!==es)return;console.error("Failed to render route",e,a),Xt.innerHTML=$o(a);let r=document.getElementById("route-retry");r&&r.addEventListener("click",()=>Ds()),C("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function yo(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable)||Os()!=="rag")return;let a=document.getElementById("rag-question");a&&(e.preventDefault(),a.focus())})}function mn(){Ws(),yo(),window.addEventListener("hashchange",Ds),Ds(),At()&&window.setTimeout(()=>{Os()!=="tests"&&(window.location.hash="#/tests")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",mn):mn();})();
