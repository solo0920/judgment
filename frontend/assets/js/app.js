(()=>{var Xn=Object.defineProperty;var ot=(e,t)=>{for(var s in t)Xn(e,s,{get:t[s],enumerable:!0})};var Ls="judgment.api_base",Ms="http://127.0.0.1:9200",Ae=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function va(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function tt(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${va(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function Ts(e){let t=tt(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function js(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?tt(e.get("api")):null}catch{return null}}function Es(){try{let e=window.localStorage.getItem(Ls);return e===null?null:tt(e)}catch{return null}}function Ns(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return tt(e||"")}function st(){let e=js();if(e!==null)return e;let t=Es();if(t!==null)return t;let s=Ns();return s||(window.location.protocol==="file:"?Ms:"")}function Zn(){if(js()!==null)return!0;let e=Es();return e!==null?!!e:!!Ns()}function at(){return js()!==null?"query":Es()!==null?"storage":Ns()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function zt(){return Zn()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!va(window.location.hostname)}function Rs(e){let t=tt(e);try{t?window.localStorage.setItem(Ls,t):window.localStorage.removeItem(Ls)}catch{}return t}function lt(e=st()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function Je(e,t=st()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function Cs(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function te(e,t={}){let s=st(),a=new AbortController,r=t.timeout===void 0?3e4:t.timeout,i=r>0?window.setTimeout(()=>a.abort(),r):null,o=Date.now(),l=performance.now(),m=t.requestId||ba(),f={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":m,"X-Judgment-Client-Started-At":String(o),...t.headers||{}},S;try{S=await fetch(Je(e,s),{...t,headers:f,signal:a.signal})}catch($){throw $.name==="AbortError"?new Ae("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new Ae(Cs(s),0,$)}finally{i&&window.clearTimeout(i)}let w=null;if((S.headers.get("content-type")||"").includes("application/json"))try{w=await S.json()}catch{w=null}else try{w=await S.text()}catch{w=null}let b=performance.now(),u=S.headers.get("X-Judgment-Request-Id")||m;if(t.trackClient!==!1&&u){let $=Math.round(performance.now()-l);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{ha({request_id:u,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:$,render_ms:Math.max(0,Math.round(performance.now()-b)),status:S.ok?"success":"failed"})})})}if(!S.ok){let $=w&&typeof w=="object"?w.detail||w.message:w,I=typeof $=="string"&&$?$:`\u4F3A\u670D\u5668\u56DE\u61C9 ${S.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new Ae(I,S.status,$)}return w}function ba(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function ha(e){try{fetch(Je("/api/performance/client",st()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),keepalive:!0}).catch(()=>{})}catch{}}async function $a(e){let t=tt(e);if(!Ts(t))throw new Ae("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,r=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(Je("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new Ae(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof Ae?i:i.name==="AbortError"?new Ae("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new Ae(Cs(t),0,i)}finally{window.clearTimeout(r)}}var G={health(){return te("/api/health")},status(){return te("/api/status",{trackClient:!1})},systemUsage(){return te("/api/system-usage",{trackClient:!1})},indexVersions(){return te("/api/index-versions",{trackClient:!1})},indexVersion(e){return te(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return te(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return te(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return te("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){let t=new URLSearchParams({repair:e?"true":"false"});return te(`/api/index-alias/reconcile?${t.toString()}`,{trackClient:!1})},catalog(){return te("/api/catalog")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return te("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},schemaSuggest({database:e,table:t,column:s,query:a,limit:r=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(r)});return te(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let r=new URLSearchParams({law_key:e});return t&&r.set("source_type",t),s&&r.set("version_id",String(s)),a&&r.set("article_no",String(a)),te(`/api/law?${r.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),te(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return te("/api/test-mode",{trackClient:!1})},setTestMode(e){return te("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return te(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return te("/api/test-runs/current",{trackClient:!1})},testRun(e){return te(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return te("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[r,i]of Object.entries(e))i==null||i===""||a.set(r,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),te(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return te("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return te("/api/processing",{timeout:45e3,trackClient:!1})},questionBankStats(){return te("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[r,i]of Object.entries(e))i==null||i===""||a.set(r,String(i));return a.set("limit",String(t)),a.set("offset",String(s)),te(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return te(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return te("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateQuestionBankItem(e,t){return te(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return te(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return te(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return te("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return te(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return te("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return te(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return te("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},benchmarkSuiteLatestAnswers(e){return te(`/api/benchmark/suites/${encodeURIComponent(e)}/latest-answers`,{timeout:45e3,trackClient:!1})},removeBenchmarkSuiteItem(e,t){return te(`/api/benchmark/suites/${encodeURIComponent(e)}/items/${encodeURIComponent(t)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return te("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return te(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return te(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return te(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return te("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return te(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return te(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return te(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return te("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return te(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return te("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return te(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return te("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return te("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return te("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onToken:r=null,onTokenReset:i=null}={}){let o=st(),l=new AbortController,m=t?0:3e5,f=m>0?window.setTimeout(()=>l.abort(),m):null,S=Date.now(),w=performance.now(),_=ba(),b={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":_,"X-Judgment-Client-Started-At":String(S)},u;try{u=await fetch(Je("/api/rag/query/stream",o),{method:"POST",headers:b,body:JSON.stringify({question:e}),signal:l.signal})}catch(ee){throw ee.name==="AbortError"?new Ae("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new Ae(Cs(o),0,ee)}finally{f&&window.clearTimeout(f)}if(!u.ok){let ee=null;try{ee=await u.json()}catch{ee=null}let re=ee&&typeof ee=="object"&&ee.detail?String(ee.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${u.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new Ae(re,u.status,ee)}if(!u.body)throw new Ae("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let $=u.body.getReader(),I=new TextDecoder,z="",E=null,B=null;try{for(;;){let{value:ee,done:re}=await $.read();if(re)break;z+=I.decode(ee,{stream:!0});let se=z.indexOf(`

`);for(;se>=0;){let U=z.slice(0,se).replace(/\r/g,"");z=z.slice(se+2);let F="message",h=[];for(let y of U.split(`
`))y.startsWith("event:")?F=y.slice(6).trim():y.startsWith("data:")&&h.push(y.slice(5).trimStart());if(h.length){let y=null;try{y=JSON.parse(h.join(`
`))}catch{y=null}if(y)if(F==="step"&&typeof s=="function")try{s(y)}catch{}else if(F==="partial"){if(typeof a=="function")try{a(y)}catch{}}else if(F==="token"){if(typeof r=="function")try{r(String(y.text||""))}catch{}}else if(F==="token_reset"){if(typeof i=="function")try{i()}catch{}}else F==="result"?E=y:F==="error"&&(B=new Ae(y.message||y.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,y))}se=z.indexOf(`

`)}}}finally{try{await $.cancel()}catch{}f&&window.clearTimeout(f)}if(B)throw B;if(!E)throw new Ae("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let V=Math.round(performance.now()-w);return ha({request_id:_,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:V,render_ms:0,status:"success"}),E}};var er={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},tr={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},sr={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},ar={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},ya={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',more:'<circle cx="4.2" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="19.8" cy="12" r="2.6" fill="currentColor" stroke="none"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function n(e){return String(e??"").replace(/[&<>"']/g,t=>er[t])}function p(e,t=16,s=""){let a=ya[e]||ya.info;return`<svg${s?` class="${n(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function d(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function ae(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function Is(e){if(e instanceof Date)return e;if(typeof e=="number"){let r=new Date(e);return Number.isNaN(r.getTime())?null:r}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function Ge(e){let t=Is(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?n(e):"\u2014"}function de(e){let t=Is(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?n(e):"\u2014"}function _t(e){let t=Is(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:Ge(t)}function Y(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Qe(e){return tr[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function pe(e,t){let s=Qe(e);return`<span class="badge ${sr[s.tone]}"><span class="status-dot ${ar[s.tone]}"></span>${n(t||s.label)}</span>`}function nr(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${n(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function Vt(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function Wt(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return pe(String(e));case"source":return nr(String(e));case"number":return`<span class="mono">${d(e)}</span>`;case"duration":return`<span class="mono">${Y(e)}</span>`;case"datetime":return`<span class="mono">${de(e)}</span>`;case"date":return`<span class="mono">${Ge(e)}</span>`;case"url":{let s=String(e),a=Vt(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${n(s)}" target="_blank" rel="noopener noreferrer" title="${n(s)}">${p("external",10)}${n(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${n(s)}">${n(Vt(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(Vt(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(Vt(s,90))}</span>`}}}function ie({tone:e="info",title:t,text:s,iconName:a="info"}){let r=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${r==="i"?"i":p(r,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${n(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function Ne({iconName:e="search",title:t,text:s="",actions:a="",className:r=""}){return`<div class="empty-state ${r}">
    <span class="empty-icon">${p(e,24)}</span>
    <h3 class="empty-title">${n(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function ne(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${n(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function R(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let r={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${r[t]||"i"}</span>
    <div class="toast-body">${n(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function kt(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function ze(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),r=URL.createObjectURL(a),i=document.createElement("a");i.href=r,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(r),1e3)}var _a="judgment.theme",Ps="nvidia",ka=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#171717","#0070f3","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#1d1d1f","#0071e3","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#5e6ad2","#010102","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#f24e1e","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#191918","#0075de","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],Bs=new Map(ka.map(e=>[e.id,e]));function rr(e){return Bs.has(e)}function ir(e){return Bs.get(e)||Bs.get(Ps)}function or(){try{let e=window.localStorage.getItem(_a);return rr(e)?e:Ps}catch{return Ps}}function wa(e,{persist:t=!0}={}){let s=ir(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");if(a&&a.setAttribute("content",s.metaColor),document.querySelectorAll(".theme-option").forEach(r=>{let i=r.dataset.themeId===s.id;r.classList.toggle("is-active",i),r.setAttribute("aria-checked",i?"true":"false")}),t)try{window.localStorage.setItem(_a,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}function lr(e){let t=ka.map((s,a)=>{let r=s.swatches.map(i=>`<i style="--swatch:${n(i)}"></i>`).join("");return`<button class="theme-option" type="button" role="menuitemradio"
        data-theme-id="${s.id}" aria-checked="false">
        <span class="theme-option-index">${String(a+1).padStart(2,"0")}</span>
        <span class="theme-option-body">
          <span class="theme-option-name">${n(s.name)}</span>
          <span class="theme-option-desc">${n(s.description)}</span>
        </span>
        <span class="theme-option-swatches" aria-hidden="true">${r}</span>
        <span class="theme-option-check" aria-hidden="true">${p("check",14)}</span>
      </button>`}).join("");e.innerHTML=`<div class="style-menu-head">
      <strong>\u9078\u64C7\u4ECB\u9762\u98A8\u683C</strong>
      <span>10 \u7A2E\u79D1\u6280\u54C1\u724C\u8A9E\u8A00</span>
    </div>${t}`}function Sa(){let e=document.getElementById("style-picker"),t=document.getElementById("style-trigger"),s=document.getElementById("style-menu");if(!e||!t||!s)return;lr(s),wa(or(),{persist:!1});let a=()=>Array.from(s.querySelectorAll(".theme-option")),r=()=>{s.hidden=!1,t.setAttribute("aria-expanded","true");let o=s.querySelector(".theme-option.is-active")||a()[0];o&&o.focus()},i=({restoreFocus:o=!1}={})=>{s.hidden||(s.hidden=!0,t.setAttribute("aria-expanded","false"),o&&t.focus())};t.addEventListener("click",()=>{s.hidden?r():i({restoreFocus:!0})}),t.addEventListener("keydown",o=>{(o.key==="ArrowDown"||o.key==="ArrowUp")&&(o.preventDefault(),r())}),s.addEventListener("click",o=>{let l=o.target.closest(".theme-option");l&&(wa(l.dataset.themeId),i({restoreFocus:!0}))}),s.addEventListener("keydown",o=>{let l=a(),m=l.indexOf(document.activeElement);if(o.key==="Escape"){o.preventDefault(),i({restoreFocus:!0});return}if(o.key==="ArrowDown"||o.key==="ArrowUp"){o.preventDefault();let f=o.key==="ArrowDown"?1:-1,S=l[(m+f+l.length)%l.length];S&&S.focus();return}if(o.key==="Home"||o.key==="End"){o.preventDefault();let f=o.key==="Home"?l[0]:l[l.length-1];f&&f.focus()}}),document.addEventListener("pointerdown",o=>{e.contains(o.target)||i()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&i()})}var ta={};ot(ta,{render:()=>Ii});var cr="judgment-console";var Re="query_history",nt="settings";var Me={history:[],settings:new Map,nextId:1},Kt=null,Te=!("indexedDB"in window);function ct(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function Ve(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function Ye(){return Kt||(Kt=new Promise((e,t)=>{if(!("indexedDB"in window)){Te=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(cr,1)}catch(a){Te=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(Re)){let r=a.createObjectStore(Re,{keyPath:"id",autoIncrement:!0});r.createIndex("created_at","created_at"),r.createIndex("kind","kind")}a.objectStoreNames.contains(nt)||a.createObjectStore(nt,{keyPath:"key"})},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{Te=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{Te=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),Kt)}function xa(){return"indexedDB"in window}function qa(){return Te}function Yt(){return Te?"memory":"indexeddb"}function dr(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},turns:Array.isArray(e.turns)?e.turns:[],pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t,updated_at:e.updated_at||t}}async function ur(){try{let t=(await Ye()).transaction(Re,"readwrite"),s=t.objectStore(Re),a=await ct(s.count());if(a>120){let r=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let m=i.result;if(!m||r<=0){o();return}m.delete(),r-=1,m.continue()},i.onerror=()=>l(i.error)})}await Ve(t)}catch{Te=!0}}async function Et(e){let t=dr(e);try{let a=(await Ye()).transaction(Re,"readwrite"),r=a.objectStore(Re),i=await ct(r.add(t));return await Ve(a),await ur(),i}catch{Te=!0;let a=Me.nextId++;return Me.history.push({id:a,...t}),Me.history.length>120&&Me.history.shift(),a}}async function Nt(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let r=(await Ye()).transaction(Re,"readwrite"),i=r.objectStore(Re),o=await ct(i.get(s));if(!o)return await Ve(r),null;let l={...o,...t,id:s};return await ct(i.put(l)),await Ve(r),l}catch{Te=!0;let r=Me.history.findIndex(i=>Number(i.id)===s);return r===-1?null:(Me.history[r]={...Me.history[r],...t,id:s},Me.history[r])}}async function Aa(e){let t=Number(e);if(!Number.isFinite(t))return!1;try{let a=(await Ye()).transaction(Re,"readwrite");return a.objectStore(Re).delete(t),await Ve(a),!0}catch{Te=!0;let a=Me.history.findIndex(r=>Number(r.id)===t);return a===-1?!1:(Me.history.splice(a,1),!0)}}async function Xt({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let r=(await Ye()).transaction(Re,"readonly"),i=r.objectStore(Re),o=await ct(i.getAll());return await Ve(r),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,m)=>String(m.updated_at||m.created_at).localeCompare(String(l.updated_at||l.created_at))).slice(0,t)}catch{return Te=!0,Me.history.filter(r=>s?`${r.kind} ${r.title} ${r.detail}`.toLowerCase().includes(s):!0).slice().sort((r,i)=>String(i.updated_at||i.created_at).localeCompare(String(r.updated_at||r.created_at))).slice(0,t)}}async function La(){try{let t=(await Ye()).transaction(Re,"readwrite");t.objectStore(Re).clear(),await Ve(t)}catch{Te=!0}Me.history=[]}async function Zt(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let r=(await Ye()).transaction(nt,"readwrite");return r.objectStore(nt).put(s),await Ve(r),s}catch{return Te=!0,Me.settings.set(s.key,s),s}}async function dt(e,t=null){try{let a=(await Ye()).transaction(nt,"readonly"),r=a.objectStore(nt),i=await ct(r.get(String(e)));return await Ve(a),i?i.value:t}catch{Te=!0;let a=Me.settings.get(String(e));return a?a.value:t}}async function Ma({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await Ye()).transaction(nt,"readonly"),r=a.objectStore(nt),i=await ct(r.getAll());return await Ve(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return Te=!0,Array.from(Me.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function Ta(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var Xs={};ot(Xs,{render:()=>hi,renderTestFlowPanel:()=>qt});var pr={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},mr=new Set(["running","stopping"]);function ts(e){let[t,s]=pr[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${n(t)}</span>`}function es(e){return String(e).padStart(2,"0")}function St(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${es(t.getMonth()+1)}-${es(t.getDate())} ${es(t.getHours())}:${es(t.getMinutes())}`}function Ct(e){return mr.has(e)}function Xe(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function ut(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function rt(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${n(e)}</span>
    <strong>${n(String(t))}</strong>
    ${s?`<small>${n(s)}</small>`:""}
  </div>`}function ja(e={}){let t=e.score_components||e;return`<div class="bench-metrics">
    ${rt("Law Recall",ut(t.law_recall))}
    ${rt("Article Recall",ut(t.article_recall))}
    ${rt("Citation Valid",ut(t.citation_valid_rate))}
    ${rt("Judge",Xe(t.judge_overall))}
    ${rt("Human",Xe(t.human_overall))}
    ${rt("p50",Y(e.duration_p50_ms))}
    ${rt("p95",Y(e.duration_p95_ms))}
    ${rt("Success",`${d(e.success||0)} / ${d(e.total||0)}`)}
  </div>`}function Ea(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${n(s.replace(/^rag\./,""))}</span>
      <strong>${Y(a.p50_ms)}</strong>
      <small>p95 ${Y(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function Na(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${ut(s.law_recall)}</span>
    <span>Article ${ut(s.article_recall)}</span>
    <span>Judge ${Xe(s.judge_overall)}</span>
    <span>p95 ${Y(t.duration_p95_ms)}</span>`}function Ra(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function Ca(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${n(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${n(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${n(e.status||"")}">${ts(e.status)}</span>
      <span class="mono">${n(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${n(de(e.started_at))}</span>
      <span data-bench-slot="run-completed">${d(e.completed_cases||0)} / ${d(e.total_cases||0)} \u984C</span>
      <span>${n(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${n(Ra(e))}">${Na(e)}</span>
  </button>`}function Os(e,t=[]){let s=e.metrics||{},a=e.judge||{},r=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([f])=>f.startsWith("rag.")).map(([f,S])=>`<span class="chip">${n(f)} ${Y(S)}</span>`).join(""),m=(e.law_sources||[]).map(f=>`<span class="chip">${n(f.law_name||"\u6CD5\u898F")} ${d((f.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${n(e.question)}</span>
      ${ts(e.status)}
      <span class="bench-case-time">${Y(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${Xe(i.deterministic)} \xB7 Judge ${Xe(i.judge)} \xB7 Human ${Xe(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${n((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${n(e.fingerprint||"")}">${p("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
      </div>
      <div class="bench-case-stages">${l||'<span class="qb-muted">\u6C92\u6709 stage timing</span>'}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${ut(s.law_recall)}</span>
        <span>Article recall ${ut(s.article_recall)}</span>
        <span>Citation ${s.citation_valid?"valid":"invalid"}</span>
        <span>Refusal ${s.refusal_correct===null?"\u2014":s.refusal_correct?"correct":"wrong"}</span>
      </div>
      <div class="chips">${m||'<span class="qb-muted">\u6C92\u6709\u6CD5\u898F\u4F86\u6E90</span>'}</div>
      <div class="bench-answer"><strong>\u56DE\u7B54</strong><p>${n(e.answer||"\u2014")}</p></div>
      <div class="bench-judge"><strong>LLM judge</strong><p>${n(a.rationale||a.reason||"\u2014")}</p><span>${[["correctness",a.correctness],["grounding",a.grounding],["citation",a.citation],["clarity",a.clarity],["overall",a.overall]].map(([f,S])=>`${f} ${S??"\u2014"}`).join(" \xB7 ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${e.id}">
        <div class="bench-human-grid">
          ${[["correctness","\u6B63\u78BA\u6027",r.scores?.correctness??4],["grounding","\u6709\u64DA\u6027",r.scores?.grounding??4],["citation","\u5F15\u7528",r.scores?.citation??4],["clarity","\u6E05\u695A",r.scores?.clarity??4],["overall","\u6574\u9AD4",r.overall??4]].map(([f,S,w])=>`<label class="field"><span class="field-label">${S} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${f}" value="${n(String(w))}" /></label>`).join("")}
        </div>
        <label class="field"><span class="field-label">\u4EBA\u5DE5\u6279\u6CE8</span><input class="input" name="comment" value="${n(r.comment||"")}" placeholder="\u56DE\u7B54\u54C1\u8CEA\u3001\u5F15\u7528\u6216\u4E8B\u5BE6\u932F\u8AA4" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${p("check",13)}<span>\u5132\u5B58\u4EBA\u5DE5\u8A55\u5206</span></button>
      </form>
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(f=>`<div class="bench-history-row"><span>${n(de(f.run?.started_at))}</span><span>${n(f.run?.config?.llm_model||"\u2014")}</span><span>Det ${Xe(f.metrics?.scores?.deterministic)}</span><span>Judge ${Xe(f.metrics?.scores?.judge)}</span><span>Human ${Xe(f.metrics?.scores?.human)}</span><span>${Y(f.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function Ds(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function Ia(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${Os(e,t)}
  </details>`}function Pa(e){return`${ts(e.status)}
    <span class="mono">${n(e.run_id)}</span>
    ${Ct(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${n(e.run_id)}">${p("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function gr(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${n(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${p("activity",14)}${n(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${n((e.status||"")+":"+e.run_id)}">
        ${Pa(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${ja(e.summary||{})}</div>
    <div data-bench-detail="stages">${Ea(e.summary||{})}</div>
    <div class="bench-run-config">
      <span><strong>Suite</strong> v${e.suite_version} \xB7 ${d((e.suite_snapshot?.items||[]).length)} \u984C</span>
      <span><strong>Embedding</strong> ${n(e.config?.embedding_model||"\u2014")}</span>
      <span><strong>LLM</strong> ${n(e.config?.llm_model||"\u2014")}</span>
      <span><strong>Judge</strong> ${n(e.config?.judge_model||"\u2014")}</span>
      <span><strong>Index</strong> ${n(e.index_version?.physical_collection||"\u2014")}</span>
      <span><strong>Top K</strong> ${n(String(e.config?.top_k??"\u2014"))}</span>
      <span><strong>Law retrieval</strong> ${e.config?.enable_law_retrieval?"on":"off"}</span>
      <span><strong>Config hash</strong> <span class="mono">${n((e.config_hash||"").slice(0,16))}</span></span>
    </div>
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>Ia(a,t[a.fingerprint]||[])).join(""):ie({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function Ba(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${p("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${n(e.run_id)}">${p("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function Da(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),r=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,r-i):0,l=(t||[]).filter(u=>["success","failed"].includes(u.status)).map(u=>Number(u.duration_ms)||0).filter(u=>u>0),m=null;if(l.length)m=l.reduce((u,$)=>u+$,0)/l.length;else if(a>0){let u=Date.parse(e.updated_at||""),$=Number.isFinite(u)?u:i;Number.isFinite($)&&$>i?m=($-i)/a:o>0&&(m=o/a)}let f=(t||[]).find(u=>u.status==="running")||null,S=0;if(a<s&&m&&m>0){let u=f?Date.parse(f.started_at||""):NaN,$=Date.parse(e.updated_at||""),I=Number.isFinite(u)?u:$;Number.isFinite(I)&&(S=Math.max(0,Math.min(.95,(r-I)/m)))}let w=Math.min(s,a+S),_=s>0?Math.max(0,Math.min(100,w/s*100)):0,b=m===null?null:Math.max(0,s-w)*m;return{total:s,completed:a,elapsedMs:o,averageMs:m,progress:_,etaMs:b,ratePerMin:m?6e4/m:null,running:f}}function Oa(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${Y(e)}`}function Fa(e,t=[]){let s=Da(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${n(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${d(s.completed)} / ${d(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${Oa(s.etaMs)}</span>
      <span data-bench-slot="progress-rate">${s.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${s.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`}</span>
    </div>
    <div class="processing-bar processing-bar-lg bench-progress-bar${s.completed===0?" is-waiting":""}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.progress.toFixed(1)}" data-bench-slot="progress-bar">
      <span class="processing-bar-fill" data-bench-slot="progress-fill" style="width:${s.progress.toFixed(2)}%"></span>
    </div>
    <div class="bench-progress-foot">
      <span data-bench-slot="progress-elapsed">\u5DF2\u57F7\u884C ${Y(s.elapsedMs)}</span>
      <span data-bench-slot="progress-average">${s.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${Y(s.averageMs)}\uFF0F\u984C`}</span>
      <span>\u5373\u6642\u9810\u4F30 \xB7 \u6BCF\u5B8C\u6210\u4E00\u984C\u6821\u6B63</span>
    </div>
  </div>`}function fr(e){let t=e.models?.models||{},s=e.suites||[],a=Rt(e),r=e.selectedRun;return`<section class="report-card bench-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("brain",14)}RAG Benchmark</span>
      <span class="badge ${e.indexVersion?.physical_collection?"badge-ok":"badge-warn"}">${n(e.indexVersion?.physical_collection||"\u7D22\u5F15\u672A\u8A2D\u5B9A")}</span>
    </div>
    <form class="bench-form" data-bench-form="run">
      <div class="bench-form-grid">
        <label class="field"><span class="field-label">Benchmark \u984C\u5EAB</span><select class="select" name="suite_id">${s.map(i=>`<option value="${i.id}" ${e.selectedSuiteId===i.id?"selected":""}>${n(i.name)} \xB7 ${d(i.item_count)} \u984C</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Embedding</span><select class="select" name="embedding_model">${(t.embedding||[]).map(i=>`<option value="${n(i)}" ${i===e.config.embedding_model?"selected":""}>${n(i)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">LLM</span><select class="select" name="llm_model">${(t.llm||[]).map(i=>`<option value="${n(i)}" ${i===e.config.llm_model?"selected":""}>${n(i)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Judge model</span><select class="select" name="judge_model"><option value="">\u4E0D\u57F7\u884C LLM judge</option>${(t.llm||[]).map(i=>`<option value="${n(i)}" ${i===e.config.judge_model?"selected":""}>${n(i)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Top K</span><input class="input" type="number" min="1" max="20" name="top_k" value="${n(String(e.config.top_k||4))}" /></label>
        <label class="field"><span class="field-label">Score threshold</span><input class="input" type="number" min="0" max="1" step="0.01" name="score_threshold" value="${n(String(e.config.score_threshold||.35))}" /></label>
        <label class="field"><span class="field-label">\u91CD\u8907\u6B21\u6578</span><input class="input" type="number" min="1" max="5" name="repeats" value="${n(String(e.config.repeats||1))}" /></label>
        <label class="checkbox-field bench-check"><input type="checkbox" name="enable_law_retrieval" ${e.config.enable_law_retrieval?"checked":""} /><span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22</span></label>
        <label class="checkbox-field bench-check"><input type="checkbox" name="judge_enabled" ${e.config.judge_enabled?"checked":""} /><span>LLM judge</span></label>
      </div>
      <label class="field"><span class="field-label">Run \u6A19\u7C64</span><input class="input" name="label" value="${n(e.config.label||St())}" /></label>
      <div class="qb-actions" data-bench-actions data-signature="${n(a?`${a.run_id}:${a.status}`:"")}">
        ${Ba(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${n(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?Fa(a,Fs(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>Ca(i,r?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${r?gr(r,e.history):""}
  </section>`}function Rt(e){let t=(e.runs||[]).find(s=>Ct(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!Ct(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function Fs(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function Ha(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:St(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",pollTimer:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),r=h=>{let y=new FormData(h);return{label:String(y.get("label")||"").trim()||St(),embedding_model:String(y.get("embedding_model")||""),llm_model:String(y.get("llm_model")||""),judge_model:String(y.get("judge_model")||""),top_k:Number(y.get("top_k")||4),score_threshold:Number(y.get("score_threshold")||.35),repeats:Number(y.get("repeats")||1),enable_law_retrieval:h.elements.enable_law_retrieval?.checked??!0,judge_enabled:h.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(h=>`${h.id}:${h.name}:${h.item_count}:${h.version}:${h.status}`)]:null,runs:(s.runs||[]).map(h=>`${h.run_id}:${h.label||""}:${h.suite_version||1}`)}),o=()=>{let y=a()?.querySelector("[data-bench-live]"),C=Rt(s);if(!y||!C)return;let Q=Da(C,Fs(s,C)),W=(T,A)=>{let M=y.querySelector(`[data-bench-slot="${T}"]`);M&&M.textContent!==A&&(M.textContent=A)};W("progress-count",`${d(Q.completed)} / ${d(Q.total)} \u984C`),W("progress-percent",`${Q.progress.toFixed(1)}%`),W("progress-eta",Oa(Q.etaMs)),W("progress-rate",Q.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${Q.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),W("progress-elapsed",`\u5DF2\u57F7\u884C ${Y(Q.elapsedMs)}`),W("progress-average",Q.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${Y(Q.averageMs)}\uFF0F\u984C`),W("progress-state",C.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let x=y.querySelector('[data-bench-slot="progress-bar"]');x&&(x.setAttribute("aria-valuenow",Q.progress.toFixed(1)),x.classList.toggle("is-waiting",Q.completed===0));let g=y.querySelector('[data-bench-slot="progress-fill"]');g&&(g.style.width=`${Q.progress.toFixed(2)}%`)},l=h=>{let y=h.querySelector("[data-bench-actions]");if(!y)return;let C=Rt(s),Q=C?`${C.run_id}:${C.status}`:"";y.dataset.signature!==Q&&(y.dataset.signature=Q,y.innerHTML=Ba(C))},m=h=>{let y=h.querySelector("[data-bench-live-wrap]");if(!y)return;let C=Rt(s),Q=C?`${C.run_id}:${C.status}:${C.total_cases}`:"";y.dataset.signature!==Q&&(y.dataset.signature=Q,y.innerHTML=C?Fa(C,Fs(s,C)):"")},f=h=>{let y=h.querySelector("[data-bench-runs]");if(!y)return;let C=s.runs||[],Q=[...y.querySelectorAll("[data-run-id]")].map(x=>x.dataset.runId),W=C.map(x=>x.run_id);if(Q.join("|")!==W.join("|")){y.innerHTML=C.length?C.map(x=>Ca(x,s.selectedRun?.run_id===x.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let x of C){let g=y.querySelector(`[data-run-id="${x.run_id}"]`);if(!g)continue;g.classList.toggle("is-active",s.selectedRun?.run_id===x.run_id);let T=g.querySelector('[data-bench-slot="run-label"]');T&&T.textContent!==(x.label||"RAG Benchmark")&&(T.textContent=x.label||"RAG Benchmark");let A=g.querySelector('[data-bench-slot="run-status"]');A&&A.dataset.status!==(x.status||"")&&(A.dataset.status=x.status||"",A.innerHTML=ts(x.status));let M=g.querySelector('[data-bench-slot="run-completed"]');if(M){let ge=`${d(x.completed_cases||0)} / ${d(x.total_cases||0)} \u984C`;M.textContent!==ge&&(M.textContent=ge)}let J=g.querySelector('[data-bench-slot="run-scores"]'),Z=Ra(x);J&&J.dataset.signature!==Z&&(J.dataset.signature=Z,J.innerHTML=Na(x))}},S=h=>{let y=s.selectedRun;if(!y)return;let C=h.querySelector(`.bench-detail[data-run-id="${y.run_id}"]`);if(!C)return;let Q=C.querySelector("[data-bench-detail-actions]");if(Q){let J=`${y.status||""}:${y.run_id}`;Q.dataset.signature!==J&&(Q.dataset.signature=J,Q.innerHTML=Pa(y))}let W=C.querySelector('[data-bench-detail="metrics"]');if(W){let J=JSON.stringify(y.summary||{});W.dataset.signature!==J&&(W.dataset.signature=J,W.innerHTML=ja(y.summary||{}))}let x=C.querySelector('[data-bench-detail="stages"]');if(x){let J=JSON.stringify((y.summary||{}).stages||{});x.dataset.signature!==J&&(x.dataset.signature=J,x.innerHTML=Ea(y.summary||{}))}let g=C.querySelector("[data-bench-cases]");if(!g)return;let T=y.cases||[];if(!T.length)return;let A=g.querySelector(".notice");A&&A.remove();let M=new Map([...g.querySelectorAll("details.bench-case")].map(J=>[Number(J.dataset.resultId),J]));for(let J of T){let Z=s.history[J.fingerprint]||[],ge=Ds(J,Z),ye=M.get(Number(J.id));if(!ye){g.insertAdjacentHTML("beforeend",Ia(J,Z)),ye=g.lastElementChild,ye&&(ye._benchSignature=ge);continue}if(ye._benchSignature===ge||!s.forcedCaseIds.delete(Number(J.id))&&ye.contains(document.activeElement))continue;let De=ye.open;ye.innerHTML=Os(J,Z),ye.open=De,ye._benchSignature=ge}},w=()=>{Rt(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},_=()=>{let h=a();h&&(l(h),m(h),f(h),S(h),o(),w())},b=h=>{let y=s.selectedRun;if(!y)return;let C=h.querySelector('[data-bench-detail="metrics"]');C&&(C.dataset.signature=JSON.stringify(y.summary||{}));let Q=h.querySelector('[data-bench-detail="stages"]');Q&&(Q.dataset.signature=JSON.stringify((y.summary||{}).stages||{}));let W=h.querySelector("[data-bench-cases]");if(!W)return;let x=new Map((y.cases||[]).map(g=>[Number(g.id),g]));for(let g of W.querySelectorAll("details.bench-case")){let T=x.get(Number(g.dataset.resultId));T&&(g._benchSignature=Ds(T,s.history[T.fingerprint]||[]))}},u=(h=!1)=>{let y=a();if(!y)return;let C=i();if(!h&&s.renderSignature===C){_();return}s.renderSignature=C,s.forcedCaseIds.clear(),y.innerHTML=fr(s),b(y),_()},$=async({refreshAll:h=!1}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||h;return}s.loading=!0;try{if(!s.referenceLoaded||h){let[T,A]=await Promise.all([G.benchmarkModels(),G.benchmarkSuites()]);s.models=T,s.suites=A.suites||[],s.indexVersion=T.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=T.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=T.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(T.models?.llm||[]).find(M=>M!==s.config.llm_model)||"")}let y=await G.benchmarkRuns(30);s.runs=y.runs||[];let C=s.activeRunId,Q=s.runs.find(T=>Ct(T.status))||null;s.activeRunId=Q?.run_id||"";let W=s.selectedRun?.run_id||"";W||(W=Q?.run_id||s.runs[0]?.run_id||"");let x=!!(s.selectedRun&&C&&s.selectedRun.run_id===C);W&&(!s.selectedRun||s.selectedRun.run_id!==W||W===Q?.run_id||x)?s.selectedRun=await G.benchmarkRun(W,!0):W||(s.selectedRun=null),s.loaded=!0,u()}catch(y){if(!s.loaded){s.renderSignature="";let C=a();C&&(C.innerHTML=ie({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:n(y.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let y=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,$({refreshAll:y})}else I()}},I=()=>{s.pollTimer&&window.clearTimeout(s.pollTimer),s.pollTimer=null,(s.runs||[]).some(h=>Ct(h.status))&&(s.pollTimer=window.setTimeout(()=>{$()},2500))},z=async h=>{try{s.selectedRun=await G.benchmarkRun(h,!0),u(),I()}catch(y){R(y.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},E=async h=>{!s.labelTouched&&h.elements.label&&(h.elements.label.value=St());let y=r(h);s.config=y;let C=Number(h.elements.suite_id?.value||0);if(!C){R("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await G.startBenchmarkRun({suite_id:C,config:y,actor:"anonymous"}),R("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=St(),s.labelTouched=!1,await $()}catch(Q){R(Q.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},B=async h=>{try{await G.stopBenchmarkRun(h),R("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await $()}catch(y){R(y.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},V=async h=>{let y=Number(h.dataset.resultId||0),C=new FormData(h),Q={};for(let W of["correctness","grounding","citation","clarity","overall"]){let x=Number(C.get(`score_${W}`));Number.isFinite(x)&&(Q[W]=x)}try{await G.reviewBenchmarkResult(y,{reviewer:"anonymous",scores:Q,comment:String(C.get("comment")||"")}),R("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await G.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(y)),u()}catch(W){R(W.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},ee=async h=>{if(h)try{let y=await G.benchmarkFingerprintHistory(h,50);s.history[h]=y.cases||[];let C=s.selectedRun,Q=a();if(!C||!Q)return;let W=(C.cases||[]).filter(x=>x.fingerprint===h);for(let x of W){let g=Q.querySelector(`details.bench-case[data-result-id="${x.id}"]`);if(!g)continue;let T=g.open;g.innerHTML=Os(x,s.history[h]),g.open=T,g._benchSignature=Ds(x,s.history[h])}}catch(y){R(y.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},re=async h=>{let y=h.target.closest("[data-bench-action]");if(!y)return;let C=y.dataset.benchAction;C==="open-run"?await z(y.dataset.runId||""):C==="stop"?await B(y.dataset.runId||""):C==="fingerprint-history"&&await ee(y.dataset.fingerprint||"")},se=async h=>{let y=h.target.closest("[data-bench-form]");y&&(h.preventDefault(),y.dataset.benchForm==="run"?await E(y):y.dataset.benchForm==="human"&&await V(y))},U=h=>{h&&(h.elements.label&&h.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=r(h),h.elements.suite_id&&(s.selectedSuiteId=Number(h.elements.suite_id.value)||s.selectedSuiteId))},F=h=>{let y=h.target.closest('[data-bench-form="run"]');y&&U(y)};return e.addEventListener("click",re),e.addEventListener("submit",se),e.addEventListener("input",F),e.addEventListener("change",F),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=St();let h=a()?.querySelector('input[name="label"]');h&&(h.value=s.config.label)}$({refreshAll:!s.referenceLoaded})},refresh(){return $({refreshAll:!0})},destroy(){e.removeEventListener("click",re),e.removeEventListener("submit",se),e.removeEventListener("input",F),e.removeEventListener("change",F),s.pollTimer&&window.clearTimeout(s.pollTimer),s.tickTimer&&window.clearInterval(s.tickTimer)}}}var Ks={};ot(Ks,{exportCsv:()=>os,exportableResult:()=>ls,render:()=>Yr,renderReport:()=>ns,reportError:()=>is,reportLoading:()=>It});var Ka=[10,25,50,100],vr=500,br=["law_name","law_level","law_category","law_modified_date","article_count"],hr=["jid","court_normalized","title","jdate","matched_laws","citation_count"],$r={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function rs(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function ss(e,t){let s={};for(let a of e.fields||[]){let r=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?r:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{}}}function yr(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,r]of Object.entries(s))if(Array.isArray(r)&&!r.map(String).includes(String(t[a]??"")))return!1;return!0}function Ws(e,t){return(e.fields||[]).filter(s=>yr(s,t))}function wr(e,t){return`filter-${e.id}-${t}`}function pt(e){return e==null?"":n(String(e))}function Hs(e,t,s){let a=s[t.key],r=wr(e,t.key),i=t.help?`<span class="field-help">${n(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(m=>`<option value="${pt(m.value)}" ${String(m.value)===String(a??"")?"selected":""}>${n(m.label??m.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${r}" name="${n(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),m=(t.options||[]).map(f=>`<label class="multi-option">
          <input type="checkbox" name="${n(t.key)}" value="${pt(f.value)}" ${l.has(String(f.value))?"checked":""} />
          <span>${n(f.label??f.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${m}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${r}" name="${n(t.key)}"
        value="${pt(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${pt(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${r}" name="${n(t.key)}"
        value="${pt(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${r}" name="${n(t.key)}"
      value="${pt(a)}"
      placeholder="${pt(t.placeholder||"")}" />
    ${i}
  </div>`}function Us(e,t,{focusTable:s=!1}={}){let a=Ws(e,t.values),r=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(r.push(`<div class="field-row">${Hs(e,o,t.values)}${Hs(e,l,t.values)}</div>`),i+=1):r.push(Hs(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
    <div class="filter-block">
      <div class="filter-head">
        <span class="filter-title">Metadata \u689D\u4EF6</span>
        <button class="filter-reset" type="button" data-action="reset">\u91CD\u8A2D</button>
      </div>
      <div class="filter-fields">${r.join("")}</div>
    </div>
    <div class="sidebar-actions">
      <button class="btn btn-primary" type="submit" id="run-query" ${s?'data-focus-table="true"':""}>
        ${p("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
      </button>
    </div>
  </form>`}function as(e,t,s){let a={...s.values};for(let r of Ws(t,a))if(r.type==="checkbox"){let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=!!i?.checked}else if(r.type==="multiselect")a[r.key]=Array.from(e.querySelectorAll(`[name="${r.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=i?i.value:""}return a}function Ya(e,t){let s={};for(let a of Ws(e,t.values)){let r=t.values[a.key];a.type==="checkbox"?s[a.key]=!!r:a.type==="multiselect"?s[a.key]=Array.isArray(r)?r:[]:a.type==="number"?s[a.key]=r===""||r===null?"":Number(r):s[a.key]=r??""}return s}function Js(e,t){let s=Ya(e,t);return(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function Ua(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${ie({tone:t,title:`${rs(e)} ${Qe(e.status).label}`,text:n(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function _r(e,t){return`<div class="db-options" role="radiogroup" aria-label="\u9078\u64C7\u8CC7\u6599\u5EAB">
    ${e.map(s=>{let a=Qe(s.status);return`<label class="db-option">
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
  </div>`}function kr(e){return`<div class="sidebar-view-switch" role="tablist" aria-label="\u67E5\u8A62\u6216 schema">
    <button class="sidebar-view-button ${e==="query"?"is-active":""}"
      type="button" role="tab" aria-selected="${e==="query"}"
      data-action="sidebar-view" data-view="query">${p("search",13)}<span>\u67E5\u8A62</span></button>
    <button class="sidebar-view-button ${e==="schema"?"is-active":""}"
      type="button" role="tab" aria-selected="${e==="schema"}"
      data-action="sidebar-view" data-view="schema">${p("table",13)}<span>Schema</span></button>
  </div>`}function Gs(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],r=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function Ja(e,t){return`<div class="category-options" role="radiogroup" aria-label="\u8CC7\u6599\u985E\u578B">
    ${e.map(s=>{let a=s.id===t,r=s.id==="judgment"&&s.count!==void 0?`${d(s.count)} \u7B46\u5DF2\u7BE9\u9078\u5224\u6C7A`:s.description||"";return`<label class="category-option${a?" is-selected":""}">
          <input type="radio" name="category" value="${n(s.id)}" ${a?"checked":""} />
          <span class="category-option-body">
            <span class="category-option-label">${n(s.label)}</span>
            <span class="category-option-desc">${n(r)}</span>
          </span>
        </label>`}).join("")}
  </div>`}function Ga(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||n(e.detail||"")}function Sr(e){return`<div class="report-empty">
    ${Ne({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:n({postgres:"\u9078\u64C7\u8CC7\u6599\u8868\u8207 metadata \u689D\u4EF6\uFF0C\u57F7\u884C\u5F8C\u6703\u7522\u751F SQL\u3001\u6458\u8981\u3001\u5206\u5E03\u8207\u8CC7\u6599\u5217\u3002",parquet:"\u9078\u64C7\u8CC7\u6599\u96C6\u8207\u56DE\u50B3\u6B04\u4F4D\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
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
  </div>`}function It(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(rs(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function is(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(rs(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${ie({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${p("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function xr(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,r=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${n(s.label||"\u672A\u5206\u985E")}">${n(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${r.toFixed(1)}%"></span></span>
          <span class="dist-value">${d(a)}</span>
        </div>`}).join("")}
  </div>`}function Xa(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function qr(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function Ar(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function Lr(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${n(String(t))}"
    title="\u6AA2\u8996\u300C${n(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${n(String(t))}${p("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var Mr={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function Tr(e,t,s,a=!1,r=!0,i=!1){let o=a?e.key:e.label||e.key,l=r?t?Mr[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${n(o)}</th>`;let m=s?.key===l,f=m?s.direction:null,S=f==="asc"?"ascending":f==="desc"?"descending":"none",w=f==="asc"?"\u2191":f==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${S}">
    <button class="table-sort${m?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${n(l)}"
      title="\u4F9D${n(o)}\u6392\u5E8F">
      <span>${n(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${w}</span>
    </button>
  </th>`}function jr(e,t){if(!Xa(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,r=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(r||""),lawName:String(t.law_name||"")}}function Er(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${n(s.lawKey)}"
    data-law-source="${n(s.sourceType)}"
    data-law-name="${n(s.lawName)}"
    title="\u6AA2\u8996\u300C${n(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(String(a))}${p("chevronRight",12,"law-link-icon")}</button>`}function Za(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:r=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],m=(e.page-1)*e.page_size,f=Xa(e),S=qr(e),w=Ar(e),_=e.meta?.sort||null,b=r?`<tr class="schema-search-row">
        <th scope="col" class="cell-index-head"></th>
        ${o.map(u=>`<th scope="col">
              <div class="schema-search-wrap">
                <input class="schema-search-input" type="search"
                  data-schema-search="${n(u.key)}"
                  value="${n(String(r[u.key]??""))}"
                  placeholder="\u641C\u5C0B ${n(u.key)}"
                  autocomplete="off" />
              </div>
            </th>`).join("")}
      </tr>`:"";return o.length?l.length?`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">${d(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${f?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":S?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":w?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${b}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(u=>Tr(u,S,_,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((u,$)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${m+$+1}</td>
                ${o.map(I=>{if((S||w)&&I.key==="jid")return`<td class="cell-jid">${Lr(u)}</td>`;let z=f&&I.key==="law_name"?jr(e,u):null;if(z)return`<td>${Er(u,I,z)}</td>`;let B={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[I.type];return`<td${B?` class="${B}"`:""}>${Wt(u[I.key],I.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${Ne({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function Nr(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${d(i)}\u2013${d(o)} / ${d(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Ka.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${p("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${p("chevronRight",13)}</button>
    </div>
  </div>`}function en(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${n(t)}</div>`).join("")}</div>`}function ns(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],r=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",m=e.status||"ok",f=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${n(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${n(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${n(e.label||l)}
          ${pe(m)}
          <span class="chip">${n(f)}</span>
        </div>
        <div class="report-sub">
          ${d(i)} \u7B46\u7B26\u5408 \xB7
          ${Y(e.duration_ms)} \xB7
          ${n(String(l).toUpperCase())} / ${n(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${p("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${p("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${ie({tone:m==="not_configured"?"info":m==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:""}

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
        ${xr(r)}
      </div>
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5BE6\u969B\u67E5\u8A62\u8A9E\u53E5</span>
          <span class="muted" style="font-size:9.5px">${n(e.database==="indexeddb"?"client-side":"read-only")}</span>
        </div>
        <div class="query-box">
          <pre class="query-code">${n(o||"\u2014")}</pre>
          <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
            ${p("copy",12)}<span>\u8907\u88FD</span>
          </button>
        </div>
        ${en(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?Za(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?Nr({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function Qa(e){return`<div class="report-card schema-preview">
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
  </div>`}function Qs(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let r=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${ie({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${n(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${n(t||e.table||"\u8CC7\u6599\u8868")}
          ${pe(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${n(String(e.database||""))} / ${n(String(e.table||"\u2014"))} \xB7 ${r.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${Za({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${en(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${d(i.length)} \u7B46</span>
      <strong>\u5171 ${d(e.total)} \u7B46</strong>
    </div>
  </div>`}function za(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${n(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${ie({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function Rr(e){return`<div class="report-empty">
    ${Ne({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${rs(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function zs(e){return e.is_current===!0?pe("ok","\u73FE\u884C"):e.law_abandon_note?pe("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?pe("empty","\u6B77\u53F2\u7248\u672C"):pe("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function ve(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${n(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function mt(e){return e?Ge(e):"\u2014"}function Cr(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function Vs(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${n(e)}</span>
    </div>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </div>`:""}function Ir(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${n(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${p("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </details>`:""}function Pr(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let r=a?.name||a?.url||"";return r?a.url?`<a class="law-attachment" href="${n(a.url)}" target="_blank" rel="noopener noreferrer">
          ${p("file",12)}<span>${n(r)}</span>${p("external",11)}
        </a>`:`<span class="law-attachment">${p("file",12)}<span>${n(r)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${d(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function tn(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Br(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,r=s?`${d(a)} \u689D \xB7 ${d(s)} \u7AE0\u7BC0`:`${d(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${n(l)}</div>`;let m=$r[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${n(tn(o.article_no))}">
        <div class="law-article-head">
          <span class="law-article-no">${n(o.article_no||"\u689D\u6587")}</span>
          ${m&&m!=="\u689D\u6587"?`<span class="chip">${n(m)}</span>`:""}
        </div>
        <div class="law-article-text">${n(l)}</div>
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
  </div>`}function Dr(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function xt(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${p("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function Or(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${xt()}
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
  </div>`}function Fr(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${xt()}
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
        ${ie({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function Hr(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let r=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",r,a.article_count_for_law?`${d(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${n(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${n(i)}</option>`}).join("")}
    </select>
  </label>`}function Ur(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let r={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${r[o]} ${d(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">\u7248\u672C\u8B8A\u66F4</span>
      <span class="muted">${n(i)}</span>
    </summary>
    <div class="law-version-change-list">
      ${a.length?a.slice(0,20).map(o=>{let l=o.change_type==="added"?"badge-ok":o.change_type==="removed"?"badge-danger":"badge-warn",m=o.before_content?`<details><summary>\u8B8A\u66F4\u524D</summary><pre>${n(o.before_content)}</pre></details>`:"",f=o.after_content?`<details><summary>\u8B8A\u66F4\u5F8C</summary><pre>${n(o.after_content)}</pre></details>`:"";return`<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${l}">${n(r[o.change_type]||o.change_type)}</span>
                    <strong>${n(o.article_no||o.article_key)}</strong>
                  </div>
                  ${m}${f}
                </div>`}).join(""):'<div class="report-empty-inline">\u6B64\u7248\u672C\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u8B8A\u66F4\u3002</div>'}
      ${e.changes_truncated?'<div class="report-empty-inline">\u50C5\u986F\u793A\u524D 20 \u7B46\u8B8A\u66F4\uFF1BAPI \u56DE\u50B3\u4E0A\u9650 200 \u7B46\u3002</div>':""}
    </div>
  </details>`}function Jr(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let r=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter($=>$.article_type!=="C").length,l=Cr(e),m=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",f=e.meta?.snapshot||"",S=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",w=[l,m,S,f].filter(Boolean).join(" \xB7 "),_=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",b=e.version||{},u=[ve("\u6CD5\u898F\u4F4D\u968E",n(e.law_level||"\u2014")),ve("\u6CD5\u898F\u985E\u5225",n(e.law_category||"\u2014")),ve("\u7570\u52D5\u65E5\u671F",mt(e.law_modified_date)),ve("\u751F\u6548\u65E5\u671F",mt(e.law_effective_date)),ve("\u689D\u6587\u6578",d(e.article_count)),ve("\u8CC7\u6599\u72C0\u614B",zs(e)),ve("\u82F1\u8B6F\u540D\u7A31",n(e.eng_law_name||"\u2014")),ve("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${n(e.law_key||"\u2014")}</span>`)];return b.first_seen_version_id!==null&&b.first_seen_version_id!==void 0&&u.push(ve("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${n(b.first_seen_version_id)}`)),b.last_seen_version_id!==null&&b.last_seen_version_id!==void 0&&u.push(ve("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${n(b.last_seen_version_id)}`)),b.last_seen_at&&u.push(ve("\u6700\u5F8C\u6536\u9304\u6642\u9593",n(de(b.last_seen_at)))),b.selected_version_id!==null&&b.selected_version_id!==void 0&&u.push(ve("\u689D\u6587\u7248\u672C",`#${n(b.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${xt()}
      <span class="law-report-origin" title="${n(w)}">${n(w)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${n(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${n(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${n(i)}
            ${zs(e)}
            <span class="chip">${n(_)}</span>
          </div>
          <div class="report-sub">
            ${n([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${d(e.article_count)} \u689D \xB7 \u7570\u52D5 ${mt(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${Hr(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">${p("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${r.length?`<div class="report-alert">${ie({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r.map($=>n($)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${d(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${mt(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${n(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${zs(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${n(l)}</span>
        </div>
        <div class="law-meta-grid">${u.join("")}</div>
      </div>

      ${Ur(e)}
      ${Vs("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${Ir("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${Vs("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${Vs("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${Pr(e.attachments)}
      ${Br(e)}
    </div>
    ${o>100?Dr():""}
  </div>`}function Gr(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${xt()}
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
  </div>`}function Qr(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${xt()}
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
        ${ie({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function zr(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${n(t)}"
    data-law-source=""
    data-law-name="${n(t)}"
    title="\u6AA2\u8996\u300C${n(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(t)}${p("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function Vr(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let r=String(s.article_no||"").trim();r&&t.get(a).add(r)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${zr(s)}
          <span class="judgment-citation-articles">${[...a].map(r=>n(r)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function Wr(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",r=String(e.full_text||""),i=Number(e.full_text_length)||r.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[ve("\u6848\u865F",n(e.jid||"\u2014")),ve("\u5E74\u5EA6",n(e.jyear||"\u2014")),ve("\u5B57\u5225",n(e.jcase||"\u2014")),ve("\u865F\u78BC",n(e.jno||"\u2014")),ve("\u6CD5\u9662",n(e.court||"\u2014")),ve("\u6848\u7531",n(e.title||"\u2014")),ve("\u88C1\u5224\u65E5\u671F",mt(e.jdate)),ve("\u4F86\u6E90\u58D3\u7E2E\u6A94",n(e.source_archive||"\u2014")),ve("\u5168\u6587\u9577\u5EA6",`${d(i)} \u5B57`),ve("\u5F15\u7528\u6578",d(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(ve("\u532F\u5165 Run",`#${n(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${xt()}
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
            ${n(e.court||"\u2014")} \xB7 ${mt(e.jdate)} \xB7
            ${d(i)} \u5B57
          </div>
        </div>
        <div class="report-actions">
          ${e.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(e.pdf_url)}" target="_blank" rel="noopener noreferrer">${p("external",14)}<span>PDF</span></a>`:""}
        </div>
      </div>

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u88C1\u5224\u65E5\u671F</div>
          <div class="summary-value">${mt(e.jdate)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u9662</div>
          <div class="summary-value summary-value-text">${n(e.court||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u547D\u4E2D\u6CD5\u898F</div>
          <div class="summary-value">${d(s.length)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u5F15\u7528\u6578</div>
          <div class="summary-value">${d(e.citation_count)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${n(e.jid||"")}</span>
        </div>
        <div class="law-meta-grid">${l.join("")}</div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u547D\u4E2D\u6CD5\u898F\u8207\u5F15\u7528</span>
          <span class="muted">${d(s.length)} \u6CD5\u898F \xB7 ${d(e.citation_count)} \u5F15\u7528</span>
        </div>
        ${Vr(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${d(i)} \u5B57</span>
        </div>
        ${r?`<div class="judgment-fulltext">${n(r)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function Va(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function os(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(Va).join(",")],r=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([r+o+1,...t.map(l=>i[l.key])].map(Va).join(","))}),`\uFEFF${a.join(`\r
`)}`}function ls(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,r]of Object.entries(t))a.startsWith("_")||(s[a]=r);return s})}}function Kr(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function Wa(e,t){let s=performance.now(),a=Ya(e,t),r=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,m=[],f=[],S=[],w=[];if(r==="settings"){f=(await Ma({keyword:i})).map(B=>({key:B.key,value:Ta(B.value),updated_at:B.updated_at})),S=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let E=new Map;f.forEach(B=>{let V=String(B.key||"").split(".")[0]||"\u5176\u4ED6";E.set(V,(E.get(V)||0)+1)}),w=Array.from(E.entries()).map(([B,V])=>({label:B,value:V})).sort((B,V)=>V.value-B.value)}else{f=(await Xt({keyword:i,limit:vr})).map(B=>({kind:Kr(B.kind),title:B.title,detail:B.detail,created_at:B.created_at})),S=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let E=new Map;f.forEach(B=>E.set(B.kind,(E.get(B.kind)||0)+1)),w=Array.from(E.entries()).map(([B,V])=>({label:B,value:V})).sort((B,V)=>V.value-B.value)}let _=f.length,b=(o-1)*l,u=f.slice(b,b+l),$=Math.round(performance.now()-s),I=qa();return I&&m.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:I?"degraded":"ok",message:I?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:r,columns:S,rows:u,total:_,page:o,page_size:l,duration_ms:$,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(_)},{label:"\u76EE\u524D\u9801\u9762",value:`${u.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:Yt()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${$} ms`}],distribution:w,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${r}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${b}`,warnings:m,meta:{store:r,filters:a,client_side:!0}}}async function Yr(e,t){let s=!1,a=null,r=[],i="law",o=null,l={},m=0,f=25,S="query",w=null,_=null,b=0,u=[],$=null,I=-1,z=0,E=null,B=null;e.innerHTML=`<section class="page data-page">
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
          ${p("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
  </section>`;let V=e.querySelector("#query-sidebar"),ee=e.querySelector("#category-switch"),re=e.querySelector("#db-options-wrap"),se=e.querySelector("#sidebar-view-switch"),U=e.querySelector("#filter-area"),F=e.querySelector("#schema-area"),h=e.querySelector("#query-main"),y=e.querySelector("#schema-suggest-popover"),C=e.querySelector("#catalog-meta"),Q=e.querySelector("#refresh-catalog"),W=v=>r.find(k=>k.id===v),x=()=>W(i)?.databases||[],g=v=>x().find(k=>k.id===v),T=(v,k)=>`${v}:${k}`,A=(v,k=i)=>l[T(k,v.id)],M=(v,k)=>{Zt(v,k).catch(()=>{})},J=()=>{if(!a){C.textContent="CATALOG \xB7 \u96E2\u7DDA",C.className="badge badge-danger badge-mono";return}let v=x(),k=v.filter(N=>N.available).length,q=W(i);C.textContent=`CATALOG \xB7 ${q?.label||i} \xB7 ${k}/${v.length} \u53EF\u7528`,C.className="badge badge-neutral badge-mono"},Z=v=>{h.innerHTML=Sr(v)},ge=()=>{let v=E?.returnScroll??B?.returnScroll;E=null,B=null;let k=g(o),q=k?A(k):null;S==="schema"&&_?.result?h.innerHTML=Qs(_.result,Ee(k,_.tableId),{columnFilters:_.columnFilters||{},searchEnabled:k.id==="postgres"||k.id==="parquet"}):q?.result?h.innerHTML=ns(q.result):k&&Z(k),typeof v=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:v,behavior:"smooth"}))},ye=(v="law-article-jump")=>{let k=h.querySelector(`#${v}`),q=tn(k?.value);if(!q){R("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),k?.focus();return}let D=[...h.querySelectorAll("[data-article-no]")].find(P=>P.dataset.articleNo===q);if(!D){R(`\u627E\u4E0D\u5230\u7B2C ${q} \u689D\u3002`,"warn");return}D.scrollIntoView({behavior:"instant",block:"center"}),D.classList.add("is-jump-target"),window.setTimeout(()=>D.classList.remove("is-jump-target"),2400)},it=async({lawKey:v,sourceType:k="",lawName:q="",versionId:N=""})=>{let D=g(o),P=D?A(D):null,H=S==="schema"?_?.result:null;if(!D||!P?.result&&!H||!v)return;let ce=++m;E={seq:ce,lawKey:v,sourceType:k,lawName:q,versionId:N?String(N):"",page:1,detail:null,database:D.id,returnScroll:window.scrollY},B=null,h.innerHTML=Or(q||v),h.scrollIntoView({behavior:"smooth",block:"start"});try{let we=await G.lawDetail(v,k,E.versionId);if(s||!E||E.seq!==ce)return;E.detail=we,E.page=1,h.innerHTML=Jr(we,{database:E.database,lawPage:E.page})}catch(we){if(s||!E||E.seq!==ce)return;h.innerHTML=Fr(we,q||v),R(we.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},De=async({jid:v})=>{let k=g(o),q=k?A(k):null,N=S==="schema"?_?.result:null;if(!k||!q?.result&&!N||!v)return;let D=++m;E=null;let P=k.id==="parquet"?"parquet":"postgres";B={seq:D,jid:v,detail:null,database:k.id,source:P,returnScroll:window.scrollY},h.innerHTML=Gr(v),h.scrollIntoView({behavior:"smooth",block:"start"});try{let H=await G.judgmentDetail(v,P);if(s||!B||B.seq!==D)return;B.detail=H,h.innerHTML=Wr(H,{database:B.database})}catch(H){if(s||!B||B.seq!==D)return;h.innerHTML=Qr(H,v),R(H.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},xe=(v,k)=>`${i}:${v.id}:${k}`,Ee=(v,k)=>(v.tables||[]).find(q=>q.id===k)?.label||k,K=(v,k,{sort:q=null,columnFilters:N={}}={})=>{let D={column_filters:N};return v.id==="postgres"?(D.table=k,D.schema_preview=!0):v.id==="parquet"&&i==="judgment"?(D.table="judgment_documents",D.columns=hr):v.id==="parquet"&&(D.dataset="all",D.columns=br),q?.key&&(D.sort=`${q.key}:${q.direction}`),D},oe=async(v,k,{sort:q=null,columnFilters:N={}}={})=>{if(!k)return;ht();let D=xe(v,k),P=++b;w={tableId:k},_={key:D,tableId:k,loading:!0,result:null,error:null,sort:q,columnFilters:N},F.innerHTML=Gs(v,W(i)?.label||i,k),h.innerHTML=Qa(Ee(v,k));try{let H;if(v.id==="indexeddb"){let ce=ss(v,10);ce.values.store=k,ce.page=1,H=await Wa(v,ce)}else v.id==="qdrant"?H={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:k,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(H=await G.query({database:v.id,filters:K(v,k,{sort:q,columnFilters:N}),page:1,pageSize:10}),q?.key&&(H.meta={...H.meta||{},sort:q}));if(s||P!==b)return;_={key:D,tableId:k,loading:!1,result:H,error:null,sort:q,columnFilters:N},S==="schema"&&w?.tableId===k&&(F.innerHTML=Gs(v,W(i)?.label||i,k),h.innerHTML=Qs(H,Ee(v,k),{columnFilters:N,searchEnabled:v.id==="postgres"||v.id==="parquet"}))}catch(H){if(s||P!==b)return;_={key:D,tableId:k,loading:!1,result:null,error:H,sort:q,columnFilters:N},S==="schema"&&w?.tableId===k&&(h.innerHTML=za(H,Ee(v,k)))}},be=()=>{let v=g(o);if(!v)return null;if(S==="schema"&&_?.result)return{db:v,tableId:_.tableId,columnFilters:_.columnFilters||{},sort:_.sort||null,mode:"schema"};let k=v?A(v):null,q=k?.result;return q&&(v.id==="postgres"||v.id==="parquet")?{db:v,tableId:q.table,columnFilters:k.columnFilters||{},sort:k.sort||null,mode:"query"}:null},Ce=(v,k,q)=>{if(!v)return;let N=`${v.db.id}:${v.tableId}:${k}`,D=fe.get(N);D&&(window.clearTimeout(D),fe.delete(N)),ht();let P={...v.columnFilters||{}},H=String(q||"").trim();if(H?P[k]=H:delete P[k],v.mode==="schema"){oe(v.db,v.tableId,{sort:v.sort,columnFilters:P});return}let ce=A(v.db);ce.columnFilters=P,ce.page=1,Fe(1)},fe=new Map,Le=()=>{z+=1,u=[],$=null,I=-1,y&&(y.hidden=!0,y.innerHTML="")},$s=(v,k)=>{let q=String(v||""),N=q.toLocaleLowerCase(),D=String(k||"").toLocaleLowerCase(),P=new Array(q.length).fill(!1),H=(he,Ie)=>{for(let ke=he;ke<he+Ie;ke+=1)ke>=0&&ke<P.length&&(P[ke]=!0)},ce=N.indexOf(D);if(ce>=0)for(;ce>=0;)H(ce,D.length),ce=N.indexOf(D,ce+D.length);else{let he=[];for(let Ie of D.match(/[一-鿿]{2,}/g)||[])for(let ke=0;ke<Ie.length-1;ke+=1)he.push(Ie.slice(ke,ke+2));he.push(...D.match(/[a-z0-9]+/g)||[]);for(let Ie of he){let ke=N.indexOf(Ie);for(;ke>=0;)H(ke,Ie.length),ke=N.indexOf(Ie,ke+Ie.length)}}let we="",_e=0;for(;_e<q.length;)if(P[_e]){let he=_e;for(;he<q.length&&P[he];)he+=1;we+=`<mark>${n(q.slice(_e,he))}</mark>`,_e=he}else{let he=_e;for(;he<q.length&&!P[he];)he+=1;we+=n(q.slice(_e,he)),_e=he}return we||n(q)},ys=(v,k)=>{if(!y)return;let q=v.getBoundingClientRect(),N=Math.min(420,Math.max(220,q.width)),D=Math.min(360,34+k*30),P=q.bottom+4;P+D>window.innerHeight-8&&(P=Math.max(8,q.top-D-4));let H=Math.min(window.innerWidth-N-8,Math.max(8,q.left));y.style.width=`${N}px`,y.style.left=`${H}px`,y.style.top=`${P}px`},qe=v=>{if(!y)return;let k=[...y.querySelectorAll(".schema-suggest-item")];k.length&&(I=Math.max(0,Math.min(k.length-1,v)),k.forEach((q,N)=>{q.classList.toggle("is-active",N===I)}),k[I].scrollIntoView({block:"nearest"}))},Ft=v=>{let k=u[v],q=$;!k||!q||(Le(),Ce(q,q.column,k))},Ht=async(v,k,q,N)=>{if(!v||!q.trim()){Le();return}let D=++z;$={...v,column:k,input:N},I=-1;try{let P=await G.schemaSuggest({database:v.db.id,table:v.tableId,column:k,query:q,limit:1e3});if(D!==z||document.activeElement!==N||!y)return;let H=Array.isArray(P.values)?P.values:[];if(u=H,!H.length){Le();return}let ce=Number(P.total)>H.length?`\u5171 ${d(P.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${d(H.length)} \u500B`:`\u5171 ${d(P.total)} \u500B\u7B26\u5408`;y.innerHTML=`<div class="schema-suggest-head">${n(ce)}</div>${H.map((we,_e)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${_e}"
            title="${n(we)}">${$s(we,q)}</button>`).join("")}`,ys(N,H.length),y.hidden=!1}catch{Le()}},ht=()=>{let v=document.activeElement;v instanceof HTMLElement&&v.matches("[data-schema-search]")&&v.blur(),Le()},Ut=(v,{resetReport:k=!1}={})=>{ht();let q=A(v);if(ee.innerHTML=Ja(r,i),re.innerHTML=_r(x(),v.id),se.innerHTML=kr(S),S==="schema"?(U.hidden=!0,U.innerHTML="",F.hidden=!1,F.innerHTML=Gs(v,W(i)?.label||i,w?.tableId||"")):(F.hidden=!0,F.innerHTML="",U.hidden=!1,U.innerHTML=`${Ua(v)}${Us(v,q)}<div class="sidebar-note">${Ga(v)}</div>`),J(),S==="schema"){let N=w?xe(v,w.tableId):"";if(_&&_.key===N){let D=Ee(v,_.tableId);_.loading?h.innerHTML=Qa(D):_.error?h.innerHTML=za(_.error,D):h.innerHTML=Qs(_.result,D,{columnFilters:_.columnFilters||{},searchEnabled:v.id==="postgres"||v.id==="parquet"})}else h.innerHTML=Rr(v);return}k?Z(v):q.result?h.innerHTML=ns(q.result):Z(v)},Jt=(v,{persist:k=!0,resetReport:q=!1}={})=>{let N=x(),D=N.find(H=>H.id===v)||N[0];if(!D)return;E=null,B=null,w=null,_=null,b+=1,o=D.id;let P=T(i,D.id);l[P]||(l[P]=ss(D,f)),Ut(D,{resetReport:q}),k&&(M(`data.last_database.${i}`,D.id),M("data.last_category",i))},Tt=(v,{persist:k=!0,resetReport:q=!0,databaseId:N=null}={})=>{let D=W(v)||r[0];if(!D)return;i=D.id,E=null,B=null;let P=D.databases||[],H=N&&P.find(ce=>ce.id===N)||P.find(ce=>ce.id===o)||P[0];if(o=H?.id||null,!H){ee.innerHTML=Ja(r,i),re.innerHTML=`<div class="sidebar-notice">${ie({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,U.innerHTML="",J();return}Jt(H.id,{persist:!1,resetReport:q}),k&&(M("data.last_category",D.id),M(`data.last_database.${D.id}`,H.id))},Gt=v=>{let k=A(v),q=U.querySelector("#data-filter-form");q&&(k.values=as(q,v,k))},Fe=async(v=null)=>{let k=g(o);if(!k)return;ht();let q=A(k);Gt(k),v!==null&&(q.page=v),(!Number.isFinite(q.page)||q.page<1)&&(q.page=1);let N=++m;E=null,B=null,h.innerHTML=It(k);let D=U.querySelector("#run-query");ne(D,!0,"\u67E5\u8A62\u4E2D\u2026");try{let P;if(k.id==="indexeddb"?P=await Wa(k,q):P=await G.query({database:k.id,filters:Js(k,q),page:q.page,pageSize:q.pageSize}),s||N!==m)return;P.meta={...P.meta||{},column_filters:q.columnFilters||{},searchable:k.id==="postgres"||k.id==="parquet",sort:q.sort||P.meta?.sort||null},q.result=P,q.page=Number(P.page)||q.page,q.pageSize=Number(P.page_size)||q.pageSize,h.innerHTML=ns(P);let H=W(i)?.label||i;await Et({kind:"data",title:`${H} \xB7 ${k.label} \xB7 ${P.table||P.label||"query"}`,detail:`${d(P.total)} \u7B46 \xB7 ${Y(P.duration_ms)}`,payload:{category:i,database:k.id,filters:Js(k,q),page:q.page,page_size:q.pageSize}}),M("data.last_query",{category:i,database:k.id,filters:Js(k,q),page:q.page,page_size:q.pageSize,at:new Date().toISOString()})}catch(P){if(s||N!==m)return;h.innerHTML=is(P,k),R(P.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&N===m&&ne(D,!1)}},$t=async()=>{Q.disabled=!0,ne(Q,!0,"\u6574\u7406\u4E2D\u2026");try{let[v,k,q,N,D]=await Promise.all([G.catalog(),dt("data.last_category","law"),dt("data.last_database.law","postgres"),dt("data.last_database.judgment","postgres"),dt("data.page_size",25)]);if(s)return;a=v,r=Array.isArray(a.categories)?a.categories:[],f=Ka.includes(Number(D))?Number(D):25;for(let ce of r)for(let we of ce.databases||[]){let _e=T(ce.id,we.id);l[_e]||(l[_e]=ss(we,f))}let P=r.find(ce=>ce.id===k)||r[0];if(!P){ee.innerHTML="",re.innerHTML=`<div class="sidebar-notice">${ie({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let H=P.id==="judgment"?N:q;if(i=P.id,o=null,Tt(P.id,{persist:!1,resetReport:!0,databaseId:H}),s)return;R("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(v){if(s)return;a=null,r=[],ee.innerHTML="",J(),re.innerHTML=`<div class="sidebar-notice">${ie({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:n(v.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${p("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,h.innerHTML=`<div class="report-empty">${Ne({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(Q.disabled=!1,ne(Q,!1))}};V.addEventListener("change",v=>{let k=v.target;if(k.name==="category"){Tt(k.value);return}if(k.name==="database"){Jt(k.value);return}let q=g(o);if(!q)return;let N=A(q),D=U.querySelector("#data-filter-form");!D||!k.name||(N.values=as(D,q,N),N.page=1,k.name==="table"&&(E=null,B=null,N.sort=null,N.columnFilters={},N.result=null,U.innerHTML=Us(q,N),Z(q)))}),V.addEventListener("input",v=>{let k=g(o);if(!k)return;let q=U.querySelector("#data-filter-form");if(!q||!v.target.name||v.target.name==="table")return;let N=A(k);N.values=as(q,k,N)}),V.addEventListener("submit",v=>{v.target.id==="data-filter-form"&&(v.preventDefault(),Fe(1))}),V.addEventListener("click",v=>{let k=v.target.closest("[data-action]"),q=k?.dataset.action;if(q==="sidebar-view"){let N=g(o);if(!N)return;let D=A(N),P=U.querySelector("#data-filter-form");P&&S==="query"&&(D.values=as(P,N,D)),S=k.dataset.view==="schema"?"schema":"query",Ut(N);return}if(q==="select-schema-table"){let N=g(o);if(!N)return;oe(N,k.dataset.tableId||"");return}if(q==="reset"){let N=g(o);if(!N)return;E=null,B=null;let D=A(N);l[T(i,N.id)]=ss(N,D.pageSize),U.innerHTML=`${Ua(N)}${Us(N,l[T(i,N.id)])}<div class="sidebar-note">${Ga(N)}</div>`,Z(N),R("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}v.target.closest("#catalog-retry")&&$t()}),h.addEventListener("input",v=>{let k=v.target.closest("[data-schema-search]");if(!k)return;let q=be();if(!q)return;let N=k.dataset.schemaSearch||"",D=k.value,P=`${q.mode}:${q.db.id}:${q.tableId}:${N}`,H=fe.get(P);if(H&&window.clearTimeout(H),!D.trim()){fe.delete(P),Le(),Ce(q,N,"");return}let ce=window.setTimeout(()=>{fe.delete(P),Ht(q,N,D,k)},250);fe.set(P,ce)}),h.addEventListener("keydown",v=>{let k=v.target.closest("[data-schema-search]");if(!k)return;let q=be();if(q){if(v.key==="Escape"){Le();return}if(v.key==="ArrowDown"||v.key==="ArrowUp"){if(!y||y.hidden)return;v.preventDefault();let N=v.key==="ArrowDown"?1:-1;qe(I<0?N>0?0:u.length-1:I+N);return}if(v.key==="Enter"){if(v.preventDefault(),y&&!y.hidden&&I>=0){Ft(I);return}Ce(q,k.dataset.schemaSearch||"",k.value)}}}),y?.addEventListener("mousedown",v=>{v.preventDefault()}),y?.addEventListener("click",v=>{let k=v.target.closest("[data-schema-suggest-index]");k&&Ft(Number(k.dataset.schemaSuggestIndex))});let Qt=v=>{v.target.closest("[data-schema-search]")||y?.contains(v.target)||Le()};return document.addEventListener("click",Qt),window.addEventListener("scroll",Le,!0),window.addEventListener("resize",Le),h.addEventListener("keydown",v=>{v.target.matches(".law-jump-input")&&v.key==="Enter"&&(v.preventDefault(),ye(v.target.id))}),h.addEventListener("click",async v=>{let k=v.target.closest("[data-action]");if(!k)return;let q=k.dataset.action,N=g(o),D=N?A(N):null,P=D?.result;if(q==="back-to-results"){ge();return}if(q==="open-law"){it({lawKey:k.dataset.lawKey||"",sourceType:k.dataset.lawSource||"",lawName:k.dataset.lawName||""});return}if(q==="open-judgment"){De({jid:k.dataset.jid||""});return}if(q==="jump-article"){ye(k.dataset.jumpInput||"law-article-jump");return}if(q==="sort-column"){let H=k.dataset.sortKey||"";if(!H||!N)return;if(S==="schema"&&_?.result){let _e=_.sort,he=H==="jdate"||H==="law_modified_date"||H==="article_count"||H==="citation_count"||H==="full_text_length"||H==="created_at"||H==="updated_at",Ie=_e?.key===H?_e.direction==="asc"?"desc":"asc":he?"desc":"asc";oe(N,_.tableId,{sort:{key:H,direction:Ie},columnFilters:_.columnFilters||{}});return}if(!D)return;let ce=D.sort,we=ce?.key===H?ce.direction==="asc"?"desc":"asc":H==="jdate"?"desc":"asc";D.sort={key:H,direction:we},Fe(1);return}if(q==="retry"){Fe(D?.page||1);return}if(P){if(q==="prev-page"){Fe(Math.max(1,Number(P.page)-1));return}if(q==="next-page"){let H=Math.max(1,Math.ceil(Number(P.total)/Number(P.page_size)));Fe(Math.min(H,Number(P.page)+1));return}if(q==="copy-query"){let H=await kt(P.query_text||"");R(H?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",H?"ok":"warn");return}if(q==="export-json"){let H=`${P.database}-${P.table||"query"}-page-${P.page}.json`;ze(H,JSON.stringify(ls(P),null,2),"application/json;charset=utf-8"),R(`\u5DF2\u532F\u51FA ${H}`,"ok");return}if(q==="export-csv"){let H=`${P.database}-${P.table||"query"}-page-${P.page}.csv`;ze(H,os(P),"text/csv;charset=utf-8"),R(`\u5DF2\u532F\u51FA ${H}`,"ok")}}}),h.addEventListener("change",v=>{let k=v.target.closest("[data-action='select-law-version']");if(k&&E){it({lawKey:E.lawKey,sourceType:E.sourceType,lawName:E.lawName,versionId:k.value});return}if(!v.target.matches("[data-page-size]"))return;let q=g(o);if(!q)return;let N=A(q);N.pageSize=Number(v.target.value)||25,N.page=1,M("data.page_size",N.pageSize),Fe(1)}),Q.addEventListener("click",()=>{$t()}),await $t(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0;for(let v of fe.values())window.clearTimeout(v);fe.clear(),Le(),document.removeEventListener("click",Qt),window.removeEventListener("scroll",Le,!0),window.removeEventListener("resize",Le)}}var nn=[10,25,50,100],Xr=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function Ys(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function Zr(e,t=e){return`<option value="${n(e)}">${n(t)}</option>`}function Pt(e,t,s,a,r=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${n(t)}</span>
      <span class="field-tag">${n(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${n(e)}">
      ${Zr("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${n(i)}" ${String(i)===String(a)?"selected":""}>${n(i)}</option>`).join("")}
    </select>
    ${r?`<span class="field-help">${n(r)}</span>`:""}
  </div>`}function ei(e,t){let s=Xr.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${Pt("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${Pt("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${Pt("model","\u6A21\u578B",e.models||[],t.model)}
    ${Pt("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${Pt("method","\u65B9\u6CD5",e.methods||[],t.method)}
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
    </div>`}function sn(){let e=document.getElementById("performance-filter-form");if(!e)return Ys();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function rn(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function ti(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),r=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${r}.${i}`}function si(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"is-client":t.includes("judgment.rag")?"is-rag":t.includes("judgment.web.app")?"is-api":t.includes("judgment.web.query")?"is-data":t.includes("judgment.judgment_index")?"is-index":"is-other"}function ai(e){let t=new Map(e.map(a=>[a.seq,a.parent_seq])),s=new Map;for(let a of e){if(Number.isInteger(a.depth)){s.set(a.seq,a.depth);continue}let r=0,i=a.parent_seq,o=0;for(;i&&t.has(i)&&o<20;)r+=1,i=t.get(i),o+=1;s.set(a.seq,r)}return s}function ni(e){let t=Object.entries(e||{});if(!t.length)return'<span class="muted">\u7121\u53C3\u6578</span>';let s=t.slice(0,8),a=t.length-s.length;return`<div class="flow-param-list">${s.map(([r,i])=>`<span class="flow-param">
        <span class="flow-param-key">${n(r)}</span>
        <span class="flow-param-value">${n(rn(i))}</span>
      </span>`).join("")}${a>0?`<span class="flow-param-more">+${a}</span>`:""}</div>`}function ri(e){let t=new Map,s=Math.max(0,Number(e[0]?.offset_ms)||0);return e.forEach((a,r)=>{let i=Math.max(0,Number(a.offset_ms)||0),o=Math.max(0,Number(a.duration_ms)||0),l=e[r+1],m=l?Math.max(i,Number(l.offset_ms)||i):null,f=m===null?i+o:m,S=Math.max(0,f-i),w=Math.max(0,f-s);t.set(a.seq,{offset:i,duration:o,lap:S,cumulative:w})}),t}function ii(e,t,s,a){let r=a.get(e.seq)||{},i=Math.max(0,Number(r.duration)||0),o=Math.max(0,Number(r.offset)||0),l=Math.max(0,Number(r.lap)||0),m=Math.max(0,Number(r.cumulative)||0),f=Math.max(t,o+i,1),S=Math.min(100,o/f*100),w=Math.min(100-S,Math.max(.6,l/f*100)),_=s.get(e.seq)||0,u=ti(e.started_at)||`+${o.toFixed(0)} ms`,$=e.started_at?`\u958B\u59CB\uFF1A${de(e.started_at)} \xB7 +${o.toFixed(1)} ms`:`\u958B\u59CB\uFF1A+${o.toFixed(1)} ms`;return`<div class="flow-segment ${e.status==="error"?"is-error":""}" style="--depth:${Math.min(_,8)}">
    <div class="flow-segment-head">
      <span class="flow-seq">#${n(String(e.seq??"\u2014"))}</span>
      <span class="flow-segment-name">${n(e.name||"unnamed")}</span>
      <span class="flow-segment-start" title="${n($)}">${n(u)}</span>
      <span class="flow-segment-duration" title="\u8DDD\u4E0B\u4E00\u9EDE ${Y(l)}\uFF1B\u7D2F\u8A08 ${Y(m)}">${Y(l)}</span>
      <span class="flow-segment-span" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${Y(m)}</span>
    </div>
    <div class="flow-segment-loc">
      <span class="flow-segment-loc-text">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</span>
      <span class="flow-segment-mobile-cum" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${Y(m)}</span>
    </div>
    <div class="flow-track" title="\u958B\u59CB +${o.toFixed(1)} ms \xB7 \u8DDD\u4E0B\u4E00\u9EDE ${Y(l)} \xB7 \u7D2F\u8A08 ${Y(m)}">
      <span class="flow-bar ${si(e)}" style="left:${S.toFixed(2)}%;width:${w.toFixed(2)}%"></span>
    </div>
    ${ni(e.params)}
    ${e.error?`<div class="flow-segment-error">${n(e.error)}</div>`:""}
  </div>`}function oi(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},r=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?Y(a.avg_total_ms??0):"\u2014",o=a.samples?Y(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
    <div class="perf-stat-grid">
      <div class="perf-stat">
        <span class="perf-stat-value">${d(e?.avg_segments??0)}</span>
        <span class="perf-stat-label">\u5E73\u5747\u6BB5\u6578\uFF08\u6A23\u672C\uFF09</span>
      </div>
      <div class="perf-stat">
        <span class="perf-stat-value">${d(e?.max_segments??0)}</span>
        <span class="perf-stat-label">\u6700\u5927\u6BB5\u6578</span>
      </div>
      <div class="perf-stat">
        <span class="perf-stat-value">${d(e?.sample_size??0)}</span>
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
        ${s.length?`<div class="perf-model-list">${s.map(l=>`<div class="perf-model-row">
                    <span class="chip">${n(l.label||"\u2014")}</span>
                    <span class="perf-model-count">${d(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${Y(l.avg_ms)}`:""}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u65B0\u7684 Flow \u6703\u5F9E params.model \u81EA\u52D5\u5F59\u6574\u3002</p>'}
      </div>
      <div class="perf-flow-stat-panel">
        <div class="report-section-head">
          <span class="report-section-title">\u6700\u6162\u5340\u6BB5\uFF08\u5E73\u5747\uFF09</span>
          <span class="muted" style="font-size:9.5px">\u6700\u8FD1 ${d(e?.sample_size??0)} \u7B46</span>
        </div>
        ${t.length?`<div class="perf-seg-list">${t.slice(0,6).map(l=>`<div class="perf-seg-row">
                    <span class="perf-seg-name" title="${n(l.label)}">${n(l.label)}</span>
                    <span class="perf-seg-track"><span style="width:${Math.max(2,(Number(l.avg_ms)||0)/r*100).toFixed(1)}%"></span></span>
                    <span class="perf-seg-ms">${Y(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function Be(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),r=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(r).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:r?`${r}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function on(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function li(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let r=Number(a.points_per_second)||0,i=Math.max(2,r/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${n(on(a))}</strong>
          <span>${n(de(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${n(`${d(a.indexed_count)} \u7B46 \xB7 ${Be(a.duration_ms)} \xB7 ${d(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${r.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${d(a.indexed_count)} \u7B46 \xB7 ${Be(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function ci(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${n(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${n(`${s.label} ${Be(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${n(s.key)}"></i>
            <span>${n(s.label)}</span>
            <strong>${Be(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 Ollama Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function di(e,t){let s=(Array.isArray(e)?e:[]).map(z=>({elapsed:Math.max(0,Number(z.elapsed_s)||0),indexed:Math.max(0,Number(z.indexed)||0)})).filter(z=>z.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(z=>z.elapsed),(Number(t)||0)/1e3,1),r=Math.max(...s.map(z=>z.indexed),1),i=760,o=150,l=12,m=12,f=i-l*2,S=o-m*2,w=s.map(z=>[l+z.elapsed/a*f,o-m-z.indexed/r*S]),_=w.map(([z,E],B)=>`${B===0?"M":"L"}${z.toFixed(1)},${E.toFixed(1)}`).join(" "),b=`${_} L${w[w.length-1][0].toFixed(1)},${o-m} L${w[0][0].toFixed(1)},${o-m} Z`,u=Math.max(1,Math.ceil(w.length/14)),$=w.map(([z,E],B)=>B%u===0||B===w.length-1?`<circle cx="${z.toFixed(1)}" cy="${E.toFixed(1)}" r="2.6" />`:"").join(""),I=[0,1,2,3].map(z=>{let E=m+S/3*z;return`<line x1="${l}" y1="${E.toFixed(1)}" x2="${i-l}" y2="${E.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${d(r)} \u7B46 \xB7 ${Be(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${I}
      <path d="${b}" class="index-progress-area"></path>
      <path d="${_}" class="index-progress-line"></path>
      ${$}
      <line x1="${l}" y1="${o-m}" x2="${i-l}" y2="${o-m}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${m}" x2="${l}" y2="${o-m}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${Be(a*500)}</span>
      <span>${Be(a*1e3)}</span>
    </div>
  </div>`}function ui(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},r=t.coverage||{},i=r.total_judgments>0?`${d(r.indexed_judgments)} / ${d(r.total_judgments)}\uFF08${(100*r.indexed_judgments/r.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:d(t.indexed_count),note:`${d(t.batch_count)} \u6279 \xD7 ${d(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:Be(t.duration_ms),note:`${d(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:Be(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${Be(t.batch_min_ms)} \xB7 \u6700\u6162 ${Be(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${d(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${n(on(t))}</span>
    </div>
    <div class="index-perf-summary">
      ${o.map(l=>`<div class="index-perf-stat">
            <div class="summary-label">${n(l.label)}</div>
            <div class="index-perf-value">${n(l.value)}</div>
            <div class="index-perf-note">${n(l.note)}</div>
          </div>`).join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${n(de(t.started_at))}</span>
      <span><strong>batch</strong> ${d(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${d(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${d(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${n(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${Be(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${li(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${Be(t.duration_ms)}</span>
        </div>
        ${ci(t)}
      </div>
    </div>
    ${di(t.progress,t.duration_ms)}
  </section>`}function pi(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${d(i)}\u2013${d(o)} / ${d(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${nn.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${p("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${p("chevronRight",13)}</button>
    </div>
  </div>`}function mi(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((u,$)=>Number(u.seq)-Number($.seq)):[],r=s?.summary||{},i=Array.isArray(r.models)?r.models:[],o=s?.client||{},l=s?.metadata||{},m=l.question||"",f=l.answer||"",S=m||f?`<div class="perf-flow-qa">
          ${m?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${n(m)}</span></div>`:""}
          ${f?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${n(f)}</span></div>`:""}
        </div>`:"",w=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(u=>(Number(u.offset_ms)||0)+(Number(u.duration_ms)||0)),1),_=ai(a),b=ri(a);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${n(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${n(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${n(e.method||"")} ${n(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${de(e.started_at)}</span>
      <span class="perf-record-duration">${Y(e.duration_ms)}</span>
      ${pe(e.status)}
      <span class="perf-record-chevron">${p("chevronRight",14)}</span>
    </summary>
    <div class="perf-record-body">
      <div class="perf-flow-meta">
        <span><strong>Request</strong> <span class="mono">${n(e.request_id||s?.request_id||"\u2014")}</span></span>
        <span><strong>Server</strong> ${Y(e.duration_ms)}</span>
        ${o.total_ms?`<span><strong>Client \u5168\u6D41\u7A0B</strong> ${Y(o.total_ms)}</span>`:""}
        ${o.render_ms!==void 0?`<span><strong>Render</strong> ${Y(o.render_ms)}</span>`:""}
        <span><strong>Flow</strong> ${a.length} \u6BB5</span>
        ${a.length?"<span><strong>\u9EDE\u4F4D</strong> \u5340\u9593\uFF1D\u4E0B\u4E00\u9EDE\u958B\u59CB\uFF0D\u672C\u9EDE\u958B\u59CB\uFF1B\u7D2F\u8A08\uFF1D\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\uFF0C\u6700\u5F8C\u4E00\u9EDE\u70BA\u7E3D\u6642\u9593</span>":""}
      </div>
      ${S}
      ${i.length?`<div class="chips perf-record-models">${i.map(u=>`<span class="chip">${n(u)}</span>`).join("")}</div>`:""}
      ${a.length?`<div class="flow-axis"><span>0 ms</span><span>${Y(w)}</span></div>
            <div class="flow-timeline">${a.map(u=>ii(u,w,_,b)).join("")}</div>`:`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${n(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${n(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var Bt={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"},an={embedding:"EMB",retrieval:"\u6AA2\u7D22",context:"\u53D6\u6587",llm:"LLM",validation:"\u9A57\u8B49",overhead:"\u5176\u4ED6"};function ln(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}function gi(e){let t=String(e.status||"pending"),s=Math.max(0,Math.min(100,Number(e.progress)||0)),a=t==="pending"?0:t==="running"?Math.max(s,12):100,r=t==="running"?"\u57F7\u884C\u4E2D\u2026":t==="pending"?"\u7B49\u5F85":e.duration_ms?Y(e.duration_ms):ln(t);return`<div class="test-flow-step is-${n(t)}">
    <div class="test-flow-step-head">
      <span class="test-flow-model" title="${n(e.model||"")}">${n(e.model||"\u2014")}</span>
      <span class="test-flow-step-meta">${n(r)}</span>
    </div>
    <div class="test-flow-step-loc">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</div>
    <div class="test-flow-track">
      <span class="test-flow-bar" style="width:${a}%"></span>
    </div>
    ${e.error_message?`<div class="test-flow-error">${n(e.error_message)}</div>`:""}
    ${e.details&&Object.keys(e.details).length?`<div class="test-flow-details">${n(Object.entries(e.details).slice(0,4).map(([i,o])=>`${i}=${rn(o)}`).join(" \xB7 "))}</div>`:""}
  </div>`}function fi(e,t){if(!t.length)return"";let s=t.reduce((a,r)=>a+(Number(r.progress)||0),0)/t.length;return`<section class="test-flow-stage">
    <div class="test-flow-stage-head">
      <span class="test-flow-stage-title">${n(Bt[e]||e)}</span>
      <span class="test-flow-stage-meta">${t.length} \u500B\u7A0B\u5E8F \xB7 ${Math.round(s)}%</span>
    </div>
    <div class="test-flow-stage-steps">${t.map(gi).join("")}</div>
  </section>`}function cn(e,t){let s=Date.now(),a=new Map;for(let w of t){let _=Number(w.duration_ms)||0;if(w.status==="running"&&w.started_at){let b=Date.parse(w.started_at);Number.isFinite(b)&&(_=Math.max(_,s-b))}a.set(w.stage,(a.get(w.stage)||0)+_)}let r=Array.isArray(e.stage_order)?e.stage_order:Object.keys(Bt),i=[],o=new Set;for(let w of r)t.some(_=>_.stage===w)&&(o.add(w),i.push({stage:w,label:Bt[w]||w,short:an[w]||w,duration:a.get(w)||0}));for(let[w,_]of a)o.has(w)||i.push({stage:w,label:Bt[w]||w,short:an[w]||w,duration:_});let l=i.reduce((w,_)=>w+_.duration,0),m=Number(e.total_ms)||0,f=Math.max(l,m),S=Math.max(0,f-l);return S>1&&i.push({stage:"overhead",label:"\u5176\u4ED6\uFF0F\u6392\u7A0B",short:"\u5176\u4ED6",duration:S}),{entries:i,total:f||l,stepTotal:l}}function vi(e,t){let{entries:s,total:a}=cn(e,t),r=s.filter(o=>o.duration>0).map(o=>{let l=a?o.duration/a*100:0;return`<span class="test-flow-time-seg stage-${n(o.stage)}" style="width:${l.toFixed(2)}%" title="${n(o.label)} \xB7 ${Y(o.duration)}\uFF08${l.toFixed(1)}%\uFF09">${l>=8?n(o.short):""}</span>`}).join(""),i=s.map(o=>{let l=a?o.duration/a*100:0;return`<span class="test-flow-legend-item">
        <i class="test-flow-dot stage-${n(o.stage)}"></i>
        <span>${n(o.label)}</span>
        <strong>${Y(o.duration)}</strong>
        <em>${l.toFixed(1)}%</em>
      </span>`}).join("");return`<div class="test-flow-time">
    <div class="test-flow-total-head">
      <span>\u7E3D\u6D41\u7A0B\u6642\u9593\uFF08\u4F9D\u968E\u6BB5\uFF09</span>
      <span>${Y(a)}${e.status==="running"?" \xB7 \u4F30\u7B97\u4E2D":""}</span>
    </div>
    <div class="test-flow-time-bar">
      ${r||'<span class="test-flow-time-empty">\u5C1A\u7121\u968E\u6BB5\u8017\u6642</span>'}
    </div>
    <div class="test-flow-legend">${i}</div>
    ${e.status==="running"?'<div class="test-flow-time-note">\u57F7\u884C\u4E2D\u7684\u968E\u6BB5\u4EE5\u958B\u59CB\u6642\u9593\u4F30\u7B97\uFF1B\u5B8C\u6210\u5F8C\u4EE5\u4F3A\u670D\u5668\u56DE\u5831\u7684 duration \u70BA\u6E96\u3002</div>':""}
  </div>`}function qt(e,t,s,a={}){let r=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(E=>`<option value="${n(E.run_id)}" ${E.run_id===s?"selected":""}>${n(ln(E.status))} \xB7 ${n((E.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${n(de(E.started_at))}</option>`)].join(""),o=r?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${p("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${p("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?pe(e.status):""}</div>
      <div class="test-flow-question">${e?n(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${Ne({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let m=Array.isArray(e.steps)?e.steps:[],f=new Map;for(let E of m)f.has(E.stage)||f.set(E.stage,[]),f.get(E.stage).push(E);let w=(Array.isArray(e.stage_order)?e.stage_order:Object.keys(Bt)).map(E=>fi(E,f.get(E)||[])).join(""),_=e.models||{},b=cn(e,m),u=e.status==="running"?`${Y(b.total)}\uFF08\u4F30\u7B97\uFF09`:Y(e.total_ms),$=m.find(E=>E.stage==="llm"&&E.model===e.summary?.primary_model)||m.find(E=>E.stage==="llm"&&E.details?.answer_preview),I=e.answer||$?.details?.answer_preview||"",z=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${e.summary?.primary_model?`<span class="mono">${n(e.summary.primary_model)}</span>`:""}
    </div>
    <p>${I?n(I):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${n(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${n(de(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${u}</span>
      <span><strong>Embedding</strong> ${Array.isArray(_.embedding)?_.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(_.llm)?_.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${n(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${z}
    <div class="test-flow-stages">${w||'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}</div>
    <div class="test-flow-total">
      <div class="test-flow-total-head">
        <span>\u7E3D\u6D41\u7A0B\u9032\u5EA6</span>
        <span>${Number(e.progress)||0}%</span>
      </div>
      <div class="test-flow-track is-total ${e.status==="running"?"is-running":""}">
        <span class="test-flow-bar is-total" style="width:${Math.max(0,Math.min(100,Number(e.progress)||0))}%"></span>
      </div>
    </div>
    ${vi(e,m)}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":r?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${e.summary?.primary_model?`<span class="mono">primary=${n(e.summary.primary_model)}</span>`:""}
    </div>
  </div>`}function bi(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},r=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${pe(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${d(e.total)} \u7B46\u7B26\u5408 \xB7 ${Y(e.duration_ms)} \xB7
          \u6BCF\u6B21\u57F7\u884C\u6309\u9215\u7684\u5B8C\u6574 Flow
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${p("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${p("file",14)}<span>JSON</span></button>
      </div>
    </div>
    ${s.length?`<div class="summary-strip">${s.map(i=>`<div class="summary-item">
                <div class="summary-label">${n(i.label)}</div>
                <div class="summary-value">${n(i.value)}</div>
              </div>`).join("")}</div>`:""}
    ${ui(r)}
    ${oi(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>mi(i,o)).join(""):Ne({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${pi(e)}
    <details class="perf-query-details">
      <summary>\u67E5\u8A62\u8A9E\u53E5\u8207\u8B66\u544A</summary>
      <div class="query-box">
        <pre class="query-code">${n(e.query_text||"\u2014")}</pre>
        <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
          ${p("copy",12)}<span>\u8907\u88FD</span>
        </button>
      </div>
      ${Array.isArray(e.warnings)&&e.warnings.length?`<div class="warnings">${e.warnings.map(i=>`<div class="warning-line">${n(i)}</div>`).join("")}</div>`:""}
    </details>
  </div>`}async function hi(e,t){let s=!1,a=Ys(),r={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null;e.innerHTML=`<section class="page data-page performance-page">
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
          ${p("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
            <span class="status-tab-icon">${p("activity",15)}</span>
            <span class="status-tab-copy"><strong>\u6548\u80FD\u7E3D\u89BD</strong><small>Flow\u3001\u5340\u6BB5\u8017\u6642\u8207\u7D22\u5F15\u6548\u80FD</small></span>
          </button>
          <button class="status-tab" type="button" data-performance-tab="benchmark">
            <span class="status-tab-icon">${p("brain",15)}</span>
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
                    ${p("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
                  </button>
                </div>
              </form>
              <div class="sidebar-note">Flow \u5BEB\u5165 PostgreSQL \u7684 performance_records.flow\uFF08JSON\uFF09\uFF0C\u9810\u8A2D\u4FDD\u7559\u81F3\u5C11 90 \u5929\uFF1B\u53EF\u4F9D\u6A21\u578B\u3001\u7A0B\u5E8F\u3001\u6A21\u7D44\u8207\u8017\u6642\u7BE9\u9078\u3002</div>
            </aside>
            <section class="query-main" id="performance-main" aria-label="\u6548\u80FD\u5831\u8868" aria-live="polite">
              <div id="performance-test-flow"></div>
              <div id="performance-report">${It({label:"\u6548\u80FD\u5831\u8868"})}</div>
            </section>
          </div>
        </div>
        <div id="performance-panel-benchmark" hidden></div>
      </section>
    </div>
  </section>`;let m=e.querySelector("#performance-filter-fields"),f=e.querySelector("#performance-filter-form"),S=e.querySelector("#performance-test-flow"),w=e.querySelector("#performance-report"),_=e.querySelector("#performance-meta"),b=e.querySelector("#performance-refresh"),u=[...e.querySelectorAll("[data-performance-tab]")],$={overview:e.querySelector("#performance-panel-overview"),benchmark:e.querySelector("#performance-panel-benchmark")},I="overview",z=g=>{I=g;for(let T of u){let A=T.dataset.performanceTab===g;T.classList.toggle("is-active",A),A?T.setAttribute("aria-current","page"):T.removeAttribute("aria-current")}for(let[T,A]of Object.entries($))A&&(A.hidden=T!==g);g==="benchmark"&&(_.textContent="BENCHMARK \xB7 RAG")},E=Ha(e,{onNavigate:g=>z(g)}),B=g=>{z(g),g==="benchmark"&&E.show()};e.addEventListener("click",g=>{let T=g.target.closest("[data-performance-tab]");T&&B(T.dataset.performanceTab||"overview")});let V=null,ee=[],re="",se=null,U="",F=()=>{m.innerHTML=ei(r,a)},h=()=>{let g=JSON.stringify({selected:re,tick:V?.status==="running"?Math.floor(Date.now()/1e3):0,runs:ee.map(T=>`${T.run_id}:${T.status}`),run:V?{run_id:V.run_id,status:V.status,progress:V.progress,steps:(V.steps||[]).map(T=>`${T.stage}:${T.model}:${T.status}:${T.progress}`)}:null});g!==U&&(U=g,S.innerHTML=qt(V,ee,re))},y=async()=>{try{let g=await G.testRuns(30);if(s)return;ee=Array.isArray(g.runs)?g.runs:[]}catch{if(s)return;ee=[]}},C=async()=>{try{let g=re?await G.testRun(re):await G.testRunCurrent();if(s)return;V=g.run||null,!re&&V&&V.status!=="running"&&!ee.some(T=>T.run_id===V.run_id)&&await y(),h()}catch{if(s)return;V=null,h()}},Q=async()=>{s||(re||await C(),s||(se=window.setTimeout(Q,1500)))};S.addEventListener("change",async g=>{g.target.id==="test-run-select"&&(re=String(g.target.value||""),await C())}),S.addEventListener("click",async g=>{g.target.closest("#test-flow-refresh")&&(re="",await y(),await C())});let W=async(g=i)=>{i=Math.max(1,Number(g)||1),a=sn(),w.innerHTML=It({label:"\u6548\u80FD\u5831\u8868"});let T=e.querySelector("#performance-run");ne(T,!0,"\u67E5\u8A62\u4E2D\u2026");try{let A=await G.performance(a,i,o);if(s)return;l=A,i=Number(A.page)||i,o=Number(A.page_size)||o,w.innerHTML=bi(A),_.textContent=`PERFORMANCE \xB7 ${d(A.total)} \u7B46`,_.className="badge badge-neutral badge-mono"}catch(A){if(s)return;w.innerHTML=is(A,{label:"\u6548\u80FD\u5831\u8868"}),R(A.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||ne(T,!1)}},x=async()=>{try{r=await G.performanceOptions()}catch{r={processes:[],modules:[],statuses:[],methods:[],models:[]}}F()};return f.addEventListener("submit",g=>{g.preventDefault(),W(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=Ys(),i=1,F(),W(1)}),b.addEventListener("click",async()=>{if(I==="benchmark"){ne(b,!0,"\u6574\u7406\u4E2D\u2026");try{await E.refresh()}finally{s||ne(b,!1)}return}a=sn(),b.disabled=!0,ne(b,!0,"\u6574\u7406\u4E2D\u2026"),await x(),await y(),s||await C(),s||await W(1),s||(b.disabled=!1,ne(b,!1))}),w.addEventListener("click",async g=>{let T=g.target.closest("[data-action]");if(!T||!l)return;let A=T.dataset.action;if(A==="retry"){W(i);return}if(A==="prev-page"){W(Math.max(1,Number(l.page)-1));return}if(A==="next-page"){let M=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));W(Math.min(M,Number(l.page)+1));return}if(A==="copy-query"){let M=await kt(l.query_text||"");R(M?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",M?"ok":"warn");return}if(A==="export-json"){let M=`performance-page-${l.page}.json`;ze(M,JSON.stringify(ls(l),null,2),"application/json;charset=utf-8"),R(`\u5DF2\u532F\u51FA ${M}`,"ok");return}if(A==="export-csv"){let M=`performance-page-${l.page}.csv`;ze(M,os(l),"text/csv;charset=utf-8"),R(`\u5DF2\u532F\u51FA ${M}`,"ok")}}),w.addEventListener("change",g=>{g.target.matches("[data-page-size]")&&(o=Number(g.target.value)||25,nn.includes(o)||(o=25),W(1))}),await Promise.allSettled([x(),y()]),s||(await C(),await W(1),Q()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,se&&window.clearTimeout(se),E.destroy()}}var $i=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function yi(){return`<div class="answer-placeholder">
    <span class="empty-icon">${p("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function Zs(){return`<section class="card answer-card rag-empty-answer">${yi()}</section>`}function dn(e,t){return`<div class="rag-turn">
    <div class="rag-user-bubble">${n(e)}</div>
    <section class="card rag-assistant-turn" data-rag-answer>${t}</section>
  </div>`}function wi(e){return{status:e.status,answer:e.answer,answer_source:e.answer_source,notice:e.notice,citations:Array.isArray(e.citations)?e.citations:[],judgments:Array.isArray(e.judgments)?e.judgments:[],law_sources:Array.isArray(e.law_sources)?e.law_sources:[],matched_terms:Array.isArray(e.matched_terms)?e.matched_terms:[],law_answer:e.law_answer,law_framework:e.law_framework,llm_model:e.llm_model,embedding_model:e.embedding_model,duration_ms:e.duration_ms,show_sources:e.show_sources,test_run:e.test_run||null,partial:!1,streaming:!1}}var _i={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"Ollama embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"Ollama LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function ki(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`Ollama run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`Ollama embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:_i[t]||t||"backend step"}function un(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function pn(e){let t=Number(e);return Number.isFinite(t)?`${d(Math.max(0,Math.round(t)))} ms`:"\u2014"}function ea(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function Si(){return`<div class="rag-process is-open" id="rag-process">
    <div class="rag-process-control">
      <button type="button" class="rag-process-toggle" id="rag-process-toggle"
        aria-expanded="true" aria-controls="rag-process-body" title="\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B">
        <span class="rag-process-toggle-label-collapsed">\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
        <span class="rag-process-toggle-label-expanded">\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
        ${p("chevronDown",11)}
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
  </div>`}function xi(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),r=performance.now(),i=new Map,o=(_,b,u)=>{let $=_.querySelector(b);$&&($.textContent=u)},l=_=>{if(_.failed){o(_.element,".rag-process-meta","\u5931\u6557");return}if(_.hasChildren){o(_.element,".rag-process-meta","");return}o(_.element,".rag-process-meta",pn(_.durationMs))},m=_=>{let b=_-1,u=[...i.values()].reverse();for(let $ of u){if(b<0)break;$.depth<=b&&($.hasChildren||($.hasChildren=!0,$.element.dataset.hasChildren="true",$.finished&&l($)),b=$.depth-1)}},f=_=>{if(!s)return null;let b=String(_?.seq??`step-${i.size+1}`),u=i.get(b);if(!u){let $=Math.max(0,Math.min(6,Number(_?.depth)||0));m($);let I=document.createElement("div");I.className="rag-process-item is-running",I.dataset.processKey=b,I.style.setProperty("--depth",String($)),I.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(I),u={element:I,depth:$,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(b,u)}return o(u.element,".rag-process-label",ki(_)),u.element.title=un(_),u};return{step:_=>{let b=_?.segment;if(!b)return;let u=f(b);if(u){if(_.type==="segment_start"){u.element.classList.add("is-running"),o(u.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(_.type==="segment_end"){let $=b.status==="error";u.element.classList.remove("is-running"),u.element.classList.toggle("is-error",$),u.finished=!0,u.failed=$,u.durationMs=Number(b.duration_ms)||0,l(u),u.element.title=[un(b),$&&b.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(_=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach($=>{$.classList.remove("is-running");let I=$.dataset.hasChildren==="true";o($,".rag-process-meta",I?"":_?"\u5B8C\u6210":"\u4E2D\u65B7")});let b=s?.children.length||i.size,u=pn(Math.max(0,performance.now()-r));return a&&(a.textContent=_?`\u5B8C\u6210 \xB7 ${b} \u6B65 \xB7 ${u}`:`\u5931\u6557 \xB7 ${b} \u6B65`),t.classList.add("is-complete"),ea(t,!1),t.outerHTML},collapse:()=>ea(t,!1)}}function qi(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${p("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":Si()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${n(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function mn(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function cs(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let r=String(e||"").trim();return r?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${n(t||r)}"
    data-source-type="${n(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${n(r)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${n(r)} \u7684\u5B8C\u6574\u689D\u6587">${n(a||r)}</button>`:""}function Ai(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(l=>`<span>${n(l)}</span>`).join(""),r=(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(l=>cs(l)).join(""),i=e.jid?` data-action="open-parquet-judgment"
        data-jid="${n(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${n(e.jid)}"`:"",o=e.pdf_url?`<a class="citation-link" href="${n(e.pdf_url)}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${p("external",11)}</a>`:"";return`<article class="citation">
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
  </article>`}function Li(e,t){let s=[e.law_level,e.law_category,e.article_count?`${d(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${n(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${p("external",11)}</a>`:"",r=e.law_key||e.law_name||"",i=r?` data-action="open-law-source"
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
  </article>`}function Mi(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",r=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${n(s)}</span>`,a,e.law_category,e.article_count?`${d(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${Ge(e.law_modified_date)}`:""].filter(Boolean).map(b=>`<span>${b}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${n(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${n(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${n(o.entity||"")}\u300D\u7684\u5224\u6C7A ${d(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${d(o.law_count||0)} \u6B21</span>
      </div>`:"",m=e.law_key||"",f=e.source_type||"",S=(Array.isArray(e.articles)?e.articles:[]).map(b=>{let u=String(b.article_no||"");return`<div class="law-source-article"${m&&u?` data-action="open-law-source"
        data-law-key="${n(m)}"
        data-source-type="${n(f)}"
        data-article-no="${n(u)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${n(u)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} ${n(u)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${n(b.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${n(b.article_content||"")}</p>
      </div>`}).join(""),w=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${p("external",11)}</a>`:"",_=e.law_key?` data-action="open-law-source"
        data-law-key="${n(e.law_key)}"
        data-source-type="${n(e.source_type||"")}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u672C\u5730 Parquet \u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation law-source">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body"${_}>
      <h4 class="citation-name">${n(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${r}</div>
      ${i}
      ${l}
      ${S}
    </div>
    <div class="citation-links">${w}</div>
  </article>`}function Ti(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function ji(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${n(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",r=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(r==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),m=s.index!=null?`<span class="law-answer-index">[${n(String(s.index))}]</span>`:"",f=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${n(a)}"
            data-source-type="${n(r)}"
            title="\u9EDE\u64CA\u958B\u555F ${n(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${n(i)} \u7684\u5B8C\u6574\u689D\u6587">${n(i)}</button>`:`<strong>${n(i)}</strong>`,S=Array.isArray(s.articles)?s.articles:[],w=S.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${S.map(_=>{let b=String(_.article_no||"").trim(),u=Ti(_.article_content);return!a||!b?`<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${n(b||"\u689D\u6587")}</span>
                  <span class="law-answer-article-text">${n(u)}</span>
                </div>`:`<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${n(a)}"
                data-source-type="${n(r)}"
                data-article-no="${n(b)}"
                title="\u9EDE\u64CA\u67E5\u770B ${n(b)} \u7684\u5B8C\u6574\u5167\u5BB9"
                aria-label="\u958B\u555F ${n(i)} ${n(b)} \u7684\u5B8C\u6574\u689D\u6587">
                <span class="law-answer-article-no">${n(b)}</span>
                <span class="law-answer-article-text">${n(u)}</span>
              </button>`}).join("")}</div>`:"";return`<div class="law-answer-source">
        <div class="law-answer-source-head">
          ${f}
          <span class="law-answer-source-meta">\uFF08${n(o)}\uFF0C${d(l)} \u689D\uFF09</span>
          ${m}
        </div>
        ${w}
      </div>`}).join("")}</div>`}function Ei(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let r=s.get(String(a));return r?.law_key?cs(a,{lawKey:r.law_key,sourceType:r.source_type||""}):`<span class="chip">${n(a)}</span>`}).join("")}</div>`}function vn(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.law_sources)?e.law_sources:[],r=Array.isArray(e.matched_terms)?e.matched_terms:[],i=e.status||"preview",o=!!e.partial,l=!!e.streaming,m=!!e.show_sources||!o,f=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((A,M)=>Ai(A,M)).join("")}</div>`:"",S=a.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${a.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${a.map((A,M)=>Mi(A,M)).join("")}</div>`:"",w=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((A,M)=>Li(A,M)).join("")}</div>`:"",_=m?f+S+w:"";!_&&!o&&(_=`<div class="answer-divider"></div>
      ${Ne({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:i==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let b=Ei(r,a),u=e.test_run,$=String(e.llm_model||u?.primary_model||"").trim(),I=String(e.embedding_model||"").trim(),z=[$?`LLM\uFF1A${$}`:"",I?`Embedding\uFF1A${I}`:""].filter(Boolean).join(" \xB7 "),E=e.answer_source==="structured",B=String(e.law_answer||"").trim(),V=e.law_framework||null,ee=Array.isArray(V?.rows)?V.rows:[],re=Array.isArray(V?.sources)?V.sources:[],se=ee.length>0,U=!!B&&!E&&!se,F=l||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",h=se?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${n(V.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${ee.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${ee.map(A=>`<tr>
                    <td>${n(A.law_name||"\u2014")}</td>
                    <td class="cell-number">${n(A.article_no||"\u2014")}</td>
                    <td>${n(A.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${re.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${re.map(A=>{let M=String(A?.law_name||A||"").trim(),J=A&&A.index!==null&&A.index!==void 0?` [${n(A.index)}]`:"";return cs(M,{label:`${M}${J}`})}).join("")}
              </div>`:""}
      </div>`:"",y=e.answer_source==="llm"&&$?`<span class="answer-model" title="${n(z)}">${p("brain",11)}${n($)}</span>`:E?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${p("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",C=l?`${$||"LLM"} \xB7 \u751F\u6210\u4E2D`:y?$||"structured":"retrieval",Q=u?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${pe(u.status)}
          <span class="mono">${n(u.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(u.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(u.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${n(u.primary_model||"\u2014")}</span>
          <span>${Number(u.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",x=String(e.answer||"").trim()||(l?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":o?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),g=l?" data-partial-answer":"",T=l?" is-streaming":"";return`${h}
      ${U?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${o&&!m?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${a.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${ji(a,B)}</div>
            </div>`:""}
      <div class="answer-block">
        ${U||se?`<div class="answer-block-head">
                <span>${n(F)}</span>
                <span>${n(C)}</span>
              </div>`:""}
        <p class="answer-text${T}"${g}>${n(x)}</p>
      </div>
      ${e.notice?`<div class="answer-notice">${n(e.notice)}</div>`:""}
      ${Q}
      ${b}
      ${_}`}function gn(e,t,s=""){let a=t.status||"preview",r=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),m=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),f=t.answer_source==="structured",S=t.answer_source==="llm"&&o?`<span class="answer-model" title="${n(m)}">${p("brain",11)}${n(o)}</span>`:f?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${p("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${p("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${pe(a,r)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${S}
      </div>
      ${s}
    </div>
    <div class="answer-body">${vn(t)}</div>`}function Ni(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${p("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${ie({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function Ri(e){let t=Array.isArray(e.turns)?e.turns:[],s=t.length?t[t.length-1].payload||{}:e.payload||{},a=Array.isArray(s.citations)?s.citations.length:0,r=Array.isArray(s.judgments)?s.judgments.length:0,i=Array.isArray(s.law_sources)?s.law_sources.length:0;return a+r+i}function Ci(e,t,s,a=null){let r=e.id??s,i=Ri(e),o=t.get(String(e.project_id||"")),l=Array.isArray(e.turns)?e.turns:[],m=e.updated_at||e.created_at,f=a!=null&&String(a)===String(r);return`<div class="rag-history-item${e.pinned?" is-pinned":""}${f?" is-active":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${n(String(r))}">
      <span class="history-question">${n(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${n(_t(m))}</span>
        ${o?`<span>\xB7 ${n(o.name)}</span>`:""}
        <span>\xB7 ${i?`${i} \u7B46\u4F86\u6E90`:"\u7121\u5F15\u7528"}</span>
        ${l.length>1?`<span>\xB7 ${l.length} \u8F2A</span>`:""}
      </span>
    </button>
    <div class="rag-history-actions">
      <button class="rag-history-pin${e.pinned?" is-pinned":""}" type="button"
        data-rag-action="toggle-pin" data-history-id="${n(String(r))}"
        data-tooltip="${e.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}"
        aria-label="${e.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078\u6B64\u9805\u76EE"}"
        aria-pressed="${e.pinned?"true":"false"}">${p("pin",14)}</button>
      <button class="rag-history-more" type="button"
        data-rag-action="open-history-menu" data-history-id="${n(String(r))}"
        title="\u66F4\u591A\u64CD\u4F5C" aria-label="\u66F4\u591A\u64CD\u4F5C" aria-haspopup="menu" aria-expanded="false">${p("more",14)}</button>
    </div>
  </div>`}function fn(e,t,s){let a=new Map;for(let i of t){let o=String(i.project_id||"");o&&a.set(o,(a.get(o)||0)+1)}let r=[`<button class="rag-project${s?"":" is-active"}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${s?"false":"true"}">
      <span class="rag-project-name">${p("grid",13)}<span>\u5168\u90E8</span></span>
      <span class="rag-project-count">${t.length}</span>
    </button>`];for(let i of e){let o=String(i.id),l=a.get(o)||0;r.push(`<button class="rag-project${s===o?" is-active":""}" type="button" data-rag-action="select-project" data-project-id="${n(o)}" aria-pressed="${s===o?"true":"false"}">
      <span class="rag-project-name">${p("folder",13)}<span>${n(i.name)}</span></span>
      <span class="rag-project-count">${l}</span>
    </button>`)}return e.length||r.push('<div class="rag-library-empty">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\u3002</div>'),r.push(`<div class="rag-project-add-wrap">
    <button class="rag-project-add" type="button" data-rag-action="show-project-form">${p("plus",13)}<span>\u5EFA\u7ACB\u5C08\u6848</span></button>
    <form class="rag-project-form" data-rag-form="project" hidden>
      <input class="input" type="text" name="project_name" maxlength="60" placeholder="\u5C08\u6848\u540D\u7A31" aria-label="\u5C08\u6848\u540D\u7A31" autocomplete="off" />
      <div class="rag-project-form-actions">
        <button class="btn btn-primary btn-sm" type="submit">\u5EFA\u7ACB</button>
        <button class="btn btn-ghost btn-sm" type="button" data-rag-action="cancel-project">\u53D6\u6D88</button>
      </div>
    </form>
  </div>`),r.join("")}async function Ii(e){let t=!1,s=[],a=!1,r=[],i=!1,o="",l=8,m="",f=0,S=null,w=[],_=!1,b=!1,u={embedding:[],llm:[]};e.innerHTML=`<section class="page rag-page">
    <div class="rag-layout">
      <aside class="rag-library" aria-label="\u5C0D\u8A71\u5EAB">
        <button class="rag-new-chat" type="button" data-rag-action="new-chat">
          <span class="rag-new-chat-mark">${p("plus",16)}</span>
          <span class="rag-new-chat-copy"><strong>\u65B0\u5C0D\u8A71</strong><small>\u958B\u59CB\u65B0\u7684\u6CD5\u5F8B\u6AA2\u7D22</small></span>
        </button>
        <div class="rag-library-context" id="rag-library-context" hidden></div>
        <section class="rag-library-section" data-rag-section="pinned">
          <button class="rag-library-head" type="button" data-rag-toggle="pinned" aria-expanded="true">
            <span class="rag-library-title">${p("pin",13)}\u5DF2\u91D8\u9078</span>
            <span class="rag-library-count" id="rag-pinned-count">0</span>
            ${p("chevronDown",12,"rag-library-chevron")}
          </button>
          <div class="rag-library-body" id="rag-pinned-body">
            <div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002</div>
          </div>
        </section>
        <section class="rag-library-section" data-rag-section="projects">
          <button class="rag-library-head" type="button" data-rag-toggle="projects" aria-expanded="true">
            <span class="rag-library-title">${p("folder",13)}\u5C08\u6848</span>
            <span class="rag-library-count" id="rag-projects-count">0</span>
            ${p("chevronDown",12,"rag-library-chevron")}
          </button>
          <div class="rag-library-body" id="rag-projects-body"></div>
        </section>
        <section class="rag-library-section rag-library-recent">
          <div class="rag-library-head is-static">
            <span class="rag-library-title">${p("history",13)}\u6700\u8FD1\u9805\u76EE <span class="rag-library-count" id="rag-recent-count">0</span></span>
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
      <div id="rag-mode-notice">${ie({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
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
            ${p("sparkles",16)}<span>\u958B\u59CB\u6AA2\u7D22</span>
          </button>
        </div>
      </form>
      <div class="example-chips" id="example-chips" aria-label="\u7BC4\u4F8B\u554F\u984C">
        ${$i.map(c=>`<button class="example-chip" type="button" data-question="${n(c)}">${n(c)}</button>`).join("")}
      </div>
    </header>

    <section class="rag-conversation" id="rag-conversation" aria-live="polite">
      <div class="rag-turns" id="rag-turns">
        ${Zs()}
      </div>
      <form class="rag-followup" id="rag-followup-form" hidden>
        <label class="sr-only" for="rag-followup-question">\u7E7C\u7E8C\u63D0\u554F</label>
        <textarea class="rag-followup-input" id="rag-followup-question" name="question" rows="1"
          maxlength="500" placeholder="\u7E7C\u7E8C\u554F\u4E0B\u4E00\u500B\u554F\u984C\u2026" aria-label="\u7E7C\u7E8C\u63D0\u554F"></textarea>
        <div class="rag-followup-actions">
          <span class="rag-followup-hint"><kbd>Enter</kbd> \u9001\u51FA \xB7 <kbd>Shift</kbd> + <kbd>Enter</kbd> \u63DB\u884C</span>
          <button class="btn btn-primary" type="submit" id="rag-followup-submit">
            ${p("sparkles",15)}<span>\u7E7C\u7E8C\u6AA2\u7D22</span>
          </button>
        </div>
      </form>
    </section>
      </div>
    </div>
    <div id="rag-test-flow" class="rag-test-flow"></div>
    <div class="rag-history-menu" id="rag-history-menu" role="menu" hidden></div>
    <dialog id="rag-judgment-dialog" class="judgment-dialog"></dialog>
    <dialog id="rag-law-dialog" class="judgment-dialog law-dialog"></dialog>
  </section>`;let $=e.querySelector("#rag-form"),I=e.querySelector("#rag-question"),z=e.querySelector("#rag-submit"),E=e.querySelector(".rag-page"),B=e.querySelector("#rag-turns"),V=e.querySelector("#rag-followup-form"),ee=e.querySelector("#rag-followup-question"),re=e.querySelector("#rag-followup-submit"),se=e.querySelector("#rag-history"),U=e.querySelector("#rag-storage-note"),F=e.querySelector("#rag-clear-history"),h=e.querySelector(".rag-library"),y=e.querySelector("#rag-pinned-body"),C=e.querySelector("#rag-projects-body"),Q=e.querySelector("#rag-pinned-count"),W=e.querySelector("#rag-projects-count"),x=e.querySelector("#rag-recent-count"),g=e.querySelector("#rag-library-context"),T=e.querySelector("#rag-test-mode"),A=e.querySelector("#rag-test-flow"),M=e.querySelector("#rag-history-menu"),J=e.querySelector("#rag-judgment-dialog"),Z=e.querySelector("#rag-law-dialog"),ge=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};J?.addEventListener("close",ge),Z?.addEventListener("close",ge);let ye=null,it=null,De=null,xe=null,Ee=()=>{I.style.height="auto",I.style.height=`${Math.min(I.scrollHeight,220)}px`},K=()=>{ee.style.height="auto",ee.style.height=`${Math.min(ee.scrollHeight,160)}px`},oe=c=>{_=!!c,E.classList.toggle("has-conversation",_)},be=()=>{_&&(V.hidden=!1,K())},Ce=()=>{V.hidden=!0},fe=()=>{M.hidden&&!xe||(M.hidden=!0,M.innerHTML="",xe&&xe.setAttribute("aria-expanded","false"),De=null,xe=null)},Le=(c,L)=>{let j=B.querySelector(".rag-empty-answer");j&&j.remove(),B.insertAdjacentHTML("beforeend",dn(c,L));let O=B.lastElementChild,X=O?.querySelector("[data-rag-answer]");return window.requestAnimationFrame(()=>{O?.scrollIntoView({behavior:"smooth",block:"start"})}),{turnElement:O,answerElement:X}},$s=()=>{B.innerHTML=w.length?w.map(c=>dn(c.question,gn(c.question,c.payload||{},""))).join(""):Zs()},ys=c=>{let L=Array.isArray(c.turns)?c.turns:[];return L.length?(f+=1,Ze(),We(null),S=c.id??null,w=L.map(j=>({...j})),m=w[w.length-1]?.question||"",oe(!0),$s(),be(),qe(),ne(z,!1),ne(re,!1),window.setTimeout(()=>{V.scrollIntoView({behavior:"smooth",block:"end"})},50),!0):!1},qe=()=>{if(t)return;if(fe(),!a){se.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',y.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',Q.textContent="0",x.textContent="0",i&&(C.innerHTML=fn(r,[],o));return}let c=r.find(ue=>String(ue.id)===o)||null;o&&!c&&(o="");let L=new Map(r.map(ue=>[String(ue.id),ue])),j=s.filter(ue=>!!ue.pinned),O=s.filter(ue=>!ue.pinned),X=o?O.filter(ue=>String(ue.project_id||"")===o):O,le=X.slice(0,l),Se=(ue,Pe)=>Ci(ue,L,Pe,S);y.innerHTML=j.length?j.map(Se).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',C.innerHTML=fn(r,s,o),se.innerHTML=le.length?le.map(Se).join(""):`<div class="rag-library-empty">${o?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u672A\u91D8\u9078\u7684\u9805\u76EE\u3002":j.length?"\u6700\u8FD1\u7684\u9805\u76EE\u90FD\u5DF2\u91D8\u9078\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,X.length>l&&se.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${d(X.length-l)} \u7B46</button>`),Q.textContent=String(j.length),W.textContent=String(r.length),x.textContent=String(X.length),c?(g.hidden=!1,g.innerHTML=`<span>${p("folder",12)}<strong>${n(c.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${p("x",12)}</button>`):(g.hidden=!0,g.innerHTML="")},Ft=async()=>{try{let c=await dt("rag.projects",[]);r=Array.isArray(c)?c.map(L=>({id:String(L?.id||""),name:String(L?.name||"").trim()})).filter(L=>L.id&&L.name):[]}catch{r=[]}i=!0,t||qe()},Ht=c=>{o=String(c||""),l=8,qe()},ht=()=>{let c=C.querySelector('[data-rag-form="project"]');c&&(c.hidden=!1,c.querySelector("input")?.focus())},Ut=()=>{let c=C.querySelector('[data-rag-form="project"]');c&&(c.hidden=!0,c.reset())},Jt=async c=>{let L=c.elements.project_name,j=String(L?.value||"").trim();if(!j){R("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),L?.focus();return}if(r.some(X=>X.name.toLowerCase()===j.toLowerCase())){R("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),L?.focus();return}let O=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;r=[...r,{id:O,name:j.slice(0,60),created_at:new Date().toISOString()}],o=O,l=8,await Zt("rag.projects",r),qe(),R(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${j}\u300D\u3002`,"ok")},Tt=async c=>{let L=s.find(X=>String(X.id)===String(c));if(!L)return;let j=!L.pinned;if(!await Nt(L.id,{pinned:j})){R("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}L.pinned=j,qe(),R(j?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},Gt=()=>{f+=1,Ze(),We(null),m="",S=null,w=[],oe(!1),Ce(),B.innerHTML=Zs(),I.value="",Ee(),ee.value="",K(),ne(z,!1),ne(re,!1),qe(),J?.open&&J.close(),Z?.open&&Z.close(),I.focus(),window.scrollTo({top:0,behavior:"smooth"})},Fe=c=>{if(!c||M.hidden)return;let L=c.getBoundingClientRect(),j=M.getBoundingClientRect(),O=6,X=L.bottom+O;X+j.height>window.innerHeight-8&&(X=Math.max(8,L.top-j.height-O));let le=L.right-j.width;le=Math.max(8,Math.min(le,window.innerWidth-j.width-8)),M.style.left=`${Math.round(le)}px`,M.style.top=`${Math.round(X)}px`},$t=c=>{M.innerHTML=`
      <button type="button" role="menuitem" data-menu-action="rename">${p("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${p("pin",13)}<span>${c.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${p("link",13)}<span>\u5206\u4EAB</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${p("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${p("trash",13)}<span>\u522A\u9664</span></button>`},Qt=c=>{let L=String(c.project_id||""),j=[{id:"",name:"\u672A\u5206\u985E"},...r.map(O=>({id:String(O.id),name:O.name}))];M.innerHTML=`
      <div class="rag-history-menu-head">${p("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${j.map(O=>`<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${n(O.id)}">
            <span class="rag-history-menu-check">${L===O.id?p("check",12):""}</span>
            <span>${n(O.name)}</span>
          </button>`).join("")}
      ${r.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${p("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},v=(c,L)=>{let j=s.find(O=>String(O.id)===String(L));j&&(fe(),De=String(j.id),xe=c,$t(j),M.hidden=!1,c.setAttribute("aria-expanded","true"),Fe(c))},k=async c=>{let L=window.prompt("\u91CD\u65B0\u547D\u540D\u5C0D\u8A71",c.title||"");if(L===null)return;let j=L.trim();if(!j){R("\u540D\u7A31\u4E0D\u80FD\u7A7A\u767D\u3002","warn");return}if(j===c.title)return;if(!await Nt(c.id,{title:j})){R("\u91CD\u65B0\u547D\u540D\u5931\u6557\u3002","danger");return}c.title=j,qe(),R("\u5C0D\u8A71\u5DF2\u91CD\u65B0\u547D\u540D\u3002","ok")},q=async c=>{let L=Array.isArray(c.turns)?c.turns:[],j=[`# ${c.title||"\u672A\u547D\u540D\u5C0D\u8A71"}`,""];if(L.length)for(let X of L){j.push("## \u554F\u984C","",X.question||"",""),j.push("## \u56DE\u7B54","",X.payload?.answer||"\uFF08\u6C92\u6709\u56DE\u7B54\u5167\u5BB9\uFF09","");let le=Array.isArray(X.payload?.law_sources)?X.payload.law_sources.map(Se=>Se.law_name).filter(Boolean):[];le.length&&j.push(`\u5F15\u7528\uFF1A${[...new Set(le)].join("\u3001")}`,"")}else j.push(c.title||"");let O=await kt(j.join(`
`));R(O?"\u5C0D\u8A71\u5167\u5BB9\u5DF2\u8907\u88FD\uFF0C\u53EF\u76F4\u63A5\u8CBC\u4E0A\u5206\u4EAB\u3002":"\u7121\u6CD5\u8907\u88FD\u5C0D\u8A71\u5167\u5BB9\u3002",O?"ok":"warn")},N=async c=>{if(!window.confirm(`\u522A\u9664\u5C0D\u8A71\u300C${c.title||"\u672A\u547D\u540D\u5C0D\u8A71"}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002`))return;if(!await Aa(c.id)){R("\u522A\u9664\u5931\u6557\u3002","danger");return}let j=S!==null&&String(S)===String(c.id);s=s.filter(O=>String(O.id)!==String(c.id)),j?Gt():qe(),R("\u5C0D\u8A71\u5DF2\u522A\u9664\u3002","ok")},D=async(c,L)=>{if(!await Nt(c.id,{project_id:L})){R("\u79FB\u81F3\u5C08\u6848\u5931\u6557\u3002","danger");return}c.project_id=L;let O=r.find(X=>String(X.id)===String(L));qe(),R(O?`\u5DF2\u79FB\u81F3\u5C08\u6848\u300C${O.name}\u300D\u3002`:"\u5DF2\u79FB\u51FA\u5C08\u6848\u3002","ok")},P=async c=>{let L=c.target.closest("[data-menu-action]");if(!L)return;let j=s.find(X=>String(X.id)===De);if(!j){fe();return}let O=L.dataset.menuAction;O==="rename"?(fe(),await k(j)):O==="toggle-pin"?(fe(),await Tt(j.id)):O==="share"?(fe(),await q(j)):O==="move"?(Qt(j),Fe(xe)):O==="assign-project"?(fe(),await D(j,L.dataset.projectId||"")):O==="back"?($t(j),Fe(xe)):O==="delete"&&(fe(),await N(j))},H=c=>{M.hidden||(typeof c.composedPath=="function"?c.composedPath():[]).includes(M)||M.contains(c.target)||c.target.closest('[data-rag-action="open-history-menu"]')||fe()},ce=c=>{c.key==="Escape"&&fe()},we=c=>{c.target instanceof Node&&M.contains(c.target)||fe()},_e=async()=>{try{if(s=await Xt({limit:120}),t)return;a=!0,qe(),U.textContent=Yt()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;s=[],a=!0,qe(),se.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},he=async(c,L,j,O)=>{let X=w,le=S;X.push({question:c,asked_at:new Date().toISOString(),payload:wi(L)});let Se=Array.isArray(L.citations)?L.citations:[],ue=Array.isArray(L.judgments)?L.judgments:[],Pe={question:c,status:L.status,citations:Se.map(Oe=>Oe.law_name),judgments:ue.map(Oe=>Oe.jid)},Ke=`${L.status||"preview"} \xB7 ${X.length} \u8F2A`,Ue=new Date().toISOString(),yt=Oe=>{O===f&&(S=Oe)};if(le){if(!await Nt(le,{turns:X,detail:Ke,payload:Pe,updated_at:Ue})){let jt=await Et({kind:"rag",title:X[0]?.question||c,detail:Ke,project_id:j,turns:X,payload:Pe,updated_at:Ue});yt(jt)}}else{let Oe=await Et({kind:"rag",title:X[0]?.question||c,detail:Ke,project_id:j,turns:X,payload:Pe,updated_at:Ue});yt(Oe)}await _e()},Ie=async()=>{try{let c=await G.status();if(t)return;let L=c.data||{},O=new Map((c.services||[]).map(ue=>[ue.id,ue])).get("rag"),X=Number(L.judgment_indexed_count||0),le=Number(L.judgment_count||0),Se=e.querySelector("#rag-mode-notice");if(!Se)return;O?.status==="operational"?Se.innerHTML=ie({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${d(X)} / ${d(le)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`}):O?.status==="degraded"?Se.innerHTML=ie({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:n(O.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002")}):Se.innerHTML=ie({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:n(O?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002")})}catch(c){if(t)return;let L=e.querySelector("#rag-mode-notice");L&&(L.innerHTML=ie({tone:"warn",title:"\u7121\u6CD5\u53D6\u5F97 RAG \u670D\u52D9\u72C0\u614B",text:n(c.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u524D\u5F80\u7CFB\u7D71\u72C0\u614B\u9801\u67E5\u770B\u3002")}))}},ke=()=>{if(!T)return;if(!b){T.innerHTML="";return}let c=Array.isArray(u.embedding)?u.embedding.length:0,L=Array.isArray(u.llm)?u.llm.length:0;T.innerHTML=ie({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${c} \u500B embedding \u8207 ${L} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},zn=async()=>{try{let c=await G.testMode();if(t)return;b=!!c.enabled,u=c.models||{embedding:[],llm:[]},ke()}catch{if(t)return;b=!1,ke()}},pa=c=>{b=!!c.detail?.enabled,u=c.detail?.models||{embedding:[],llm:[]},ke()};window.addEventListener("judgment:test-mode",pa);let We=c=>{A&&(it=c||null,A.innerHTML=c?qt(c,[],"",{showHistory:!1}):"")},Ze=()=>{ye&&(window.clearTimeout(ye),ye=null)},ma=()=>{Ze();let c=async()=>{if(!t){try{let L=await G.testRunCurrent();if(t)return;let j=L.run;j&&j.status==="running"&&We(j)}catch{}t||(ye=window.setTimeout(c,1500))}};c()},Vn=async c=>{if(!c){We(null);return}try{let L=await G.testRun(c);if(t)return;We(L.run||null)}catch{t||R("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},Wn=async()=>{if(b)try{let c=await G.testRunCurrent();if(t)return;c.run?.status==="running"&&(We(c.run),ma())}catch{}},ws=0,_s=(c,L)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${n(c)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${p("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${L}</div>`,Kn=c=>{let L=(Array.isArray(c.matched_laws)?c.matched_laws:[]).map(le=>cs(le)).join(""),j=[c.court,c.jdate,c.title?`\u6848\u7531\uFF1A${c.title}`:"",c.full_text_length?`${d(c.full_text_length)} \u5B57`:"",c.citation_count?`\u5F15\u7528 ${d(c.citation_count)} \u7B46`:""].filter(Boolean).map(le=>`<span>${n(le)}</span>`).join(""),O=c.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${n(String(c.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",X=c.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(c.pdf_url)}" target="_blank" rel="noopener noreferrer">${p("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return _s(c.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${n(c.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${j}
      </div>
      ${L?`<div class="chips" style="margin:8px 0 10px">${L}</div>`:""}
      <div class="judgment-dialog-source">${O}</div>
      <pre class="judgment-dialog-text">${n(c.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${X}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},ga=async c=>{if(!J||!c)return;let L=++ws;J.open||J.showModal(),ge(),J.innerHTML=_s("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${n(c)}\u2026</span>
      </div>`);try{let j=await G.judgmentDetail(c,"parquet");if(t||L!==ws)return;J.innerHTML=Kn(j)}catch(j){if(t||L!==ws)return;J.innerHTML=_s("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(j.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},ks=0,Ss=(c,L)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${n(c)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${p("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${L}</div>`,Yn=(c,L="")=>{let j=String(c.selected_article_no||L||"").trim(),O=!!j,X=Array.isArray(c.articles)?c.articles:[],le=X.map(et=>{let As=String(et.article_content||"").trim();return As?et.article_type==="C"?`<div class="law-chapter">${n(As)}</div>`:`<article class="law-article" data-article-no="${n(mn(et.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${n(et.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${n(As)}</div>
        </article>`:""}).join(""),Se=(Array.isArray(c.warnings)?c.warnings:[]).map(et=>n(et)).join("<br />"),ue=c.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",Pe=c.meta?.articles_source,Ke=Pe==="parquet"?"Parquet \u689D\u6587":Pe==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",Ue=c.meta?.snapshot||"",yt=[c.law_level,c.law_category,c.article_count?`${d(c.article_count)} \u689D`:"",c.law_modified_date?`\u7570\u52D5 ${Ge(c.law_modified_date)}`:""].filter(Boolean).map(et=>`<span>${n(et)}</span>`).join(""),Oe=c.law_url?`<a class="btn btn-secondary btn-sm" href="${n(c.law_url)}" target="_blank" rel="noopener noreferrer">${p("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",jt=!O&&c.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${n(c.law_histories)}</div>
        </details>`:"",$e=O?`<span class="badge badge-mono">${n(j)}</span>`:"",He=!O&&X.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",wt=O?`${c.law_name||c.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${j}`:c.law_name||c.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return Ss(wt,`<div class="judgment-dialog-meta">
        <span class="badge ${c.source_type==="order"?"badge-warn":"badge-info"}">${n(ue)}</span>
        ${$e}
        ${yt}
      </div>
      <div class="judgment-dialog-source">${n([Ke,Ue].filter(Boolean).join(" \xB7 "))}</div>
      ${Se?`<div class="law-dialog-warning">${Se}</div>`:""}
      ${jt}
      ${He}
      <div class="law-dialog-articles">${le||`<div class="report-empty-inline">${O?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${Oe}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},fa=(c,L)=>{let j=c?.querySelector(`#${L}`),O=mn(j?.value||"");if(!O){R("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),j?.focus();return}let X=[...c?.querySelectorAll("[data-article-no]")||[]].find(le=>le.dataset.articleNo===O);if(!X){R(`\u627E\u4E0D\u5230\u7B2C ${O} \u689D\u3002`,"warn");return}X.scrollIntoView({behavior:"instant",block:"center"}),X.classList.add("is-jump-target"),window.setTimeout(()=>X.classList.remove("is-jump-target"),2400)},xs=async(c,L="",j="")=>{if(!Z||!c)return;let O=++ks;Z.open||Z.showModal(),ge(),Z.innerHTML=Ss(j?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${n([c,j].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let X=await G.lawDetail(c,L,"",j);if(t||O!==ks)return;Z.innerHTML=Yn(X,j)}catch(X){if(t||O!==ks)return;Z.innerHTML=Ss("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(X.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};Z?.addEventListener("click",c=>{let L=c.target.closest('[data-action="jump-law-article"]');if(L){fa(Z,L.dataset.jumpInput||"rag-law-article-jump");return}if(c.target.closest('[data-action="close-law-source"]')){Z.close();return}let j=Z.getBoundingClientRect();(c.clientX<j.left||c.clientX>j.right||c.clientY<j.top||c.clientY>j.bottom)&&Z.close()}),Z?.addEventListener("keydown",c=>{!c.target.matches(".law-jump-input")||c.key!=="Enter"||(c.preventDefault(),fa(Z,c.target.id))}),J?.addEventListener("click",c=>{let L=c.target.closest('[data-action="open-law-source"]');if(L){xs(L.dataset.lawKey||"",L.dataset.sourceType||"",L.dataset.articleNo||"");return}if(c.target.closest('[data-action="close-parquet-judgment"]')){J.close();return}let j=J.getBoundingClientRect();(c.clientX<j.left||c.clientX>j.right||c.clientY<j.top||c.clientY>j.bottom)&&J.close()}),B.addEventListener("click",c=>{let L=c.target.closest(".rag-process-toggle");if(L){let O=L.closest(".rag-process"),X=L.getAttribute("aria-expanded")==="true";ea(O,!X);return}let j=c.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(j){if(j.dataset.action==="open-law-source"){xs(j.dataset.lawKey||"",j.dataset.sourceType||"",j.dataset.articleNo||"");return}ga(j.dataset.jid||"")}}),B.addEventListener("keydown",c=>{if(c.key!=="Enter"&&c.key!==" ")return;let L=c.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!L||L.closest("a, button"))){if(c.preventDefault(),L.dataset.action==="open-law-source"){xs(L.dataset.lawKey||"",L.dataset.sourceType||"",L.dataset.articleNo||"");return}ga(L.dataset.jid||"")}});let qs=async(c,{fresh:L=!1,source:j="hero"}={})=>{let O=c.trim();if(!O){R("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),(j==="followup"?ee:I).focus();return}(L||!_)&&(S=null,w=[],B.innerHTML="",qe());let X=++f,le=()=>t||X!==f,Se=o;m=O,oe(!0),Ce(),j==="followup"?(ee.value="",K()):(I.value="",Ee());let{answerElement:ue}=Le(O,qi(O,b)),Pe=b?null:xi(ue);b?(We(null),ma()):(Ze(),We(null)),ne(z,!0,"\u6AA2\u7D22\u4E2D\u2026"),ne(re,!0,"\u6AA2\u7D22\u4E2D\u2026");let Ke=null,Ue="",yt=$e=>{if(le()||!$e?.partial)return;let He=ue.querySelector(".answer-body");if(!He)return;Ke=$e,Ue=String($e.answer||""),He.innerHTML=vn($e),Pe?.collapse?.();let wt=ue.querySelector(".answer-head-title");wt&&(wt.textContent=$e.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},Oe=$e=>{if(le()||!$e||!Ke?.streaming)return;Ue+=$e;let He=ue.querySelector("[data-partial-answer]");He&&(He.textContent=Ue)},jt=()=>{if(le()||!Ke?.streaming)return;Ue="";let $e=ue.querySelector("[data-partial-answer]");$e&&($e.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")};try{let $e=b?await G.rag(O,{testMode:b}):await G.ragStream(O,{onStep:wt=>{le()||Pe?.step(wt)},onPartial:yt,onToken:Oe,onTokenReset:jt});if(le())return;Ze();let He=Pe?.finish(!0)||"";if(ue.innerHTML=gn(O,$e,He),$e.test_run?.run_id?await Vn($e.test_run.run_id):We(null),await he(O,$e,Se,X),le())return;be()}catch($e){if(le())return;Ze();let He=Pe?.finish(!1)||"";ue.innerHTML=Ni($e,He),be(),R($e.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{le()||(Ze(),ne(z,!1),ne(re,!1))}};return $.addEventListener("submit",c=>{c.preventDefault(),qs(I.value,{fresh:!0,source:"hero"})}),V.addEventListener("submit",c=>{c.preventDefault(),qs(ee.value,{fresh:!1,source:"followup"})}),I.addEventListener("input",Ee),I.addEventListener("keydown",c=>{c.key==="Enter"&&!c.shiftKey&&!c.isComposing&&(c.preventDefault(),$.requestSubmit())}),ee.addEventListener("input",K),ee.addEventListener("keydown",c=>{c.key==="Enter"&&!c.shiftKey&&!c.isComposing&&(c.preventDefault(),V.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",c=>{let L=c.target.closest("[data-question]");L&&(I.value=L.dataset.question,Ee(),$.requestSubmit())}),h.addEventListener("click",async c=>{let L=c.target.closest("[data-rag-toggle]");if(L){let ue=L.closest(".rag-library-section").classList.toggle("is-collapsed");L.setAttribute("aria-expanded",String(!ue));return}let j=c.target.closest("[data-rag-action]"),O=j?.dataset.ragAction||"";if(O==="new-chat"){Gt();return}if(O==="open-history-menu"){v(j,j.dataset.historyId);return}if(O==="toggle-pin"){await Tt(j.dataset.historyId);return}if(O==="select-project"){Ht(j.dataset.projectId||"");return}if(O==="show-project-form"){ht();return}if(O==="cancel-project"){Ut();return}if(O==="more-recent"){l+=12,qe();return}if(O==="clear-project"){Ht("");return}let X=c.target.closest("[data-history-open]");if(!X)return;let le=s.find(Se=>String(Se.id)===String(X.dataset.historyId));le&&(o=String(le.project_id||""),qe(),!ys(le)&&(S=null,w=[],qs(le.title,{fresh:!0,source:"history"})))}),h.addEventListener("submit",async c=>{let L=c.target.closest('[data-rag-form="project"]');L&&(c.preventDefault(),await Jt(L))}),M.addEventListener("click",P),document.addEventListener("click",H),document.addEventListener("keydown",ce),window.addEventListener("scroll",we,!0),window.addEventListener("resize",fe),F.addEventListener("click",async()=>{if(!s.length){R("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await La(),await _e(),R("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),Ee(),await Promise.allSettled([Ie(),_e(),Ft(),zn()]),await Wn(),()=>{t=!0,Ze(),fe(),document.removeEventListener("click",H),document.removeEventListener("keydown",ce),window.removeEventListener("scroll",we,!0),window.removeEventListener("resize",fe),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",pa),m&&B.setAttribute("data-last-question",m)}}var sa={};ot(sa,{render:()=>co});var Pi=2e3,Bi={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"}},bn={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},hn={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Sn={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"},ds={judgment:"#a78bfa",law:"#22d3ee",order:"#f472b6",system:"#94a3b8"},Di={extract:"file",raw_parquet:"cube",filter:"filter",postgres:"database",qdrant:"brain",download:"download",parse:"sliders"},Oi={raw_parquet:"\u539F\u59CB Parquet",postgres:"PostgreSQL"};function Dt(e){return Bi[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function je(e,t){let s=Dt(e);return`<span class="badge ${bn[s.tone]||bn.idle}"><span class="status-dot ${hn[s.tone]||hn.idle}"></span>${n(t||s.label)}</span>`}function ft(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function $n(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":d(e)}function At(e){return e&&e.color?String(e.color):"var(--accent)"}function us(e,t=""){let s=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),a=e.status==="running"&&s===null,r=a?' aria-valuetext="\u9032\u5EA6\u672A\u77E5"':` aria-valuenow="${s??0}"`;return`<div class="processing-bar${a?" is-indeterminate":""}${t?` ${t}`:""}" role="progressbar" aria-valuemin="0" aria-valuemax="100"${r}>
    <span class="processing-bar-fill" style="width:${s??0}%;background:${n(At(e))}"></span>
  </div>`}function Fi(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${ae(s)} / ${ae(a)}`:ae(s):a?`${d(s)} / ${d(a)} ${t}`:`${d(s)} ${t}`}function Hi(e){let t=[`<span>${n(Fi(e))}</span>`];return e.percent===null||e.percent===void 0?e.status==="running"&&t.push('<span class="mono">\u9032\u5EA6\u672A\u77E5</span>'):t.push(`<span class="mono">${ft(e.percent)}</span>`),e.duration_ms&&t.push(`<span class="mono">${Y(e.duration_ms)}</span>`),t.join("")}function Ui(e){let s=(Array.isArray(e.stats)?e.stats:[]).map(r=>`<span class="processing-stage-stat"><span>${n(r.label)}</span><strong>${n(r.value)}</strong></span>`),a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&s.push(`<span class="processing-stage-stat"><span>\u7D22\u5F15\u8986\u84CB</span><strong>${d(a.indexed)} / ${d(a.total)}</strong></span>`),s.length?`<div class="processing-stage-stats">${s.join("")}</div>`:""}function Ji(e,{compact:t=!1,step:s=null}={}){let a=Dt(e.status),r=e.status==="running";return`<div class="processing-stage${t?" is-compact":""} is-${a.tone}${r?" is-live":""}" style="--stage-color:${n(At(e))}"${r?' aria-current="step"':""}>
    <div class="processing-stage-head">
      ${s===null?"":`<span class="processing-stage-step">${String(s).padStart(2,"0")}</span>`}
      <span class="processing-stage-swatch" style="background:${n(At(e))}"></span>
      <span class="processing-stage-label">${n(e.label||e.key)}</span>
      ${je(e.status)}
    </div>
    ${us(e)}
    <div class="processing-stage-meta">${Hi(e)}</div>
    ${e.message?`<div class="processing-stage-message" title="${n(e.message)}">${n(e.message)}</div>`:""}
    ${t?"":Ui(e)}
  </div>`}function xn(e){let t=Dt(e);return`<span class="flow-status is-${t.tone}"><span class="flow-status-dot"></span>${n(t.label)}</span>`}function yn(e,t){return t==null||t===""?"\u2014":e.unit==="bytes"?ae(t):d(t)}function Gi(e){let t=[{label:"\u76EE\u524D",value:yn(e,e.current)},{label:"\u7E3D\u91CF",value:yn(e,e.total)},{label:"\u767E\u5206\u6BD4",value:e.percent===null||e.percent===void 0?e.status==="running"?"\u8A08\u7B97\u4E2D":"\u2014":ft(e.percent)},{label:"\u8017\u6642",value:e.duration_ms?Y(e.duration_ms):"\u2014"}],s=Array.isArray(e.stats)?e.stats:[];for(let r of s){if(t.length>=6)break;r&&r.label&&r.value&&t.push({label:String(r.label),value:String(r.value)})}let a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&!t.some(r=>r.label==="\u7D22\u5F15\u8986\u84CB")&&t.push({label:"\u7D22\u5F15\u8986\u84CB",value:`${d(a.indexed)} / ${d(a.total)}`}),t}function Qi(e,t){let s=Dt(e.status),a=e.status==="running",r=Gi(e);return`<article class="flow-node is-${s.tone}${a?" is-live":""}" style="--stage-color:${n(At(e))}"${a?' aria-current="step"':""}>
    <div class="flow-node-head">
      <span class="flow-node-icon">${p(Di[e.key]||"cube",14)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">STEP ${String(t+1).padStart(2,"0")}</span>
        <strong>${n(Oi[e.key]||e.label||e.key)}</strong>
      </div>
      ${xn(e.status)}
    </div>
    <div class="flow-node-body">
      ${us(e,"flow-progress")}
      <div class="flow-node-props">${r.map(i=>`<div class="flow-prop"><span>${n(i.label)}</span><strong>${n(i.value)}</strong></div>`).join("")}</div>
      ${e.message?`<div class="flow-node-note" title="${n(e.message)}">${n(e.message)}</div>`:""}
    </div>
  </article>`}function zi(e,t,s,a){let r=At(e),i=a||"#8b5cf6",o=e.status==="running",l=`${s}-${t}`,m=`flow-gradient-${l}`,f=`flow-marker-${l}`,S=t%2===0?"M2 60 C8 42 16 78 22 60":"M2 60 C8 78 16 42 22 60";return`<div class="flow-link${o?" is-live":""}" style="color:${n(r)}" aria-hidden="true">
    <svg viewBox="0 0 28 120" width="28" height="120" fill="none">
      <defs>
        <linearGradient id="${m}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${n(i)}"/>
          <stop offset="1" stop-color="${n(r)}"/>
        </linearGradient>
        <marker id="${f}" viewBox="0 0 8 8" refX="6.2" refY="4" markerWidth="4.6" markerHeight="4.6" orient="auto">
          <path d="M0 0 8 4 0 8Z" fill="${n(r)}"/>
        </marker>
      </defs>
      <path class="flow-link-line" d="${S}" stroke="url(#${m})" stroke-width="1.7" stroke-linecap="round" marker-end="url(#${f})"/>
      <circle class="flow-link-port" cx="2" cy="60" r="3.6" stroke="${n(i)}" stroke-width="1.5"/>
      <circle class="flow-link-port" cx="26" cy="60" r="3.6" stroke="${n(r)}" stroke-width="1.5"/>
    </svg>
  </div>`}function qn(e){if(!e)return"";let t=[];return e.started_at&&t.push(`\u958B\u59CB ${de(e.started_at)}`),e.duration_ms&&t.push(`\u8017\u6642 ${Y(e.duration_ms)}`),e.pid&&t.push(`PID ${e.pid}`),t.join(" \xB7 ")}function Vi(e,{active:t,focus:s,status:a,runLine:r,runningStage:i}){let o=e.label||Sn[e.key]||e.key;return`<div class="flow-source${t?" is-live":""}" style="--branch-accent:${ds[e.key]||ds.system}">
    <div class="flow-source-head">
      <span class="flow-source-icon">${p(e.icon||"database",15)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">SOURCE</span>
        <strong>${n(o)}</strong>
      </div>
      ${xn(a)}
    </div>
    <div class="flow-source-body">
      <p class="flow-source-desc">${n(e.description||"")}</p>
      <div class="flow-source-meta">${r}</div>
      ${i?`<div class="flow-source-current"><span class="flow-current-dot"></span>\u76EE\u524D\u968E\u6BB5\uFF1A<strong>${n(i.label||i.key)}</strong></div>`:""}
      ${s&&s.message?`<div class="flow-source-note" title="${n(s.message)}">${n(s.message)}</div>`:""}
    </div>
  </div>`}function Wi(e){let t=e.active_run,s=t||e.focus_run||e.last_run,a=t?"running":s?s.status:"idle",r=s?n(qn(s)||_t(s.started_at||s.finished_at)):"\u5C1A\u7121\u57F7\u884C\u7D00\u9304",i=Array.isArray(e.stages)?e.stages:[],o=i.find(w=>w.status==="running"),l=ds[e.key]||ds.system,m=String(e.key||"branch").replace(/[^a-zA-Z0-9_-]/g,""),f=Vi(e,{active:t,focus:s,status:a,runLine:r,runningStage:o}),S=i.length?i.map((w,_)=>{let b=_?At(i[_-1]):l;return`${zi(w,_,m,b)}${Qi(w,_)}`}).join(""):'<div class="flow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u968E\u6BB5\u3002</div>';return`<article class="flow-lane" style="--branch-accent:${l}"><div class="flow-row">${f}${S}</div></article>`}function Ki(e){return`<div class="flow-canvas-open">
    <div class="processing-branches">${(Array.isArray(e.branches)?e.branches:[]).map(Wi).join("")}</div>
  </div>`}function gt(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${n(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function Yi(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},r=e.raw_backups||{},i=r.totals||{},o=e.state||{},l=e.capabilities||{},m=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",f=t.status==="operational",S=s.status==="operational",w=a.available!==!1,_=r.available!==!1,b=S?`${d(s.indexed)} / ${d(s.total)}`:je(s.status||"unavailable"),u=S?`${ft(s.percent)} \xB7 \u5C1A\u9918 ${d(s.remaining)} \u7B46`:n(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),$=w?`${d(a.unprocessed)} / ${d(a.total)}`:je("unavailable"),I=w?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${ae(a.unprocessed_bytes)} \u5F85\u8655\u7406`:n(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${gt("\u8655\u7406\u72C0\u614B",je(e.status||"unknown"),`${n(m)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${gt("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",n($),I)}
    ${gt("\u539F\u59CB Parquet \u5099\u4EFD",_?`${d(r.count)} \u6A94`:je("unavailable"),_?`\u5171 ${d(i.row_count)} \u7B46 \xB7 ${ae(i.compressed_bytes)}`:n(r.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB Parquet \u5099\u4EFD\u3002"))}
    ${gt("PostgreSQL \u5224\u6C7A",f?d(t.judgment_count):je("unavailable"),f?`\u6CD5\u898F ${$n(t.law_count)} \xB7 \u547D\u4EE4 ${$n(t.order_count)}`:n(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${gt("Qdrant \u7D22\u5F15",b,u)}
    ${gt("\u72C0\u614B\u6A94",je(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${n(de(o.updated_at))}`:n(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${gt("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?n(l.start_blocked_reason):`\u672A\u8655\u7406 ${d(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${d(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${d(l.external_processes)} \u500B`:""}`)}
  </div>`}function Xi(e){if(e.available===!1)return ie({tone:"warn",title:"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304",text:n(e.error||"\u7121\u6CD5\u6383\u63CF .rar \u6A94\u6848\u3002")});let t=Number(e.total)||0,s=Number(e.processed)||0,a=Number(e.unprocessed)||0,r=t?100*s/t:null;return`<div class="processing-archive-summary">
    <div class="processing-archive-summary-head">
      <span class="mono">${n(e.data_dir||"")}</span>
      <span>${d(s)} / ${d(t)} \u5DF2\u8655\u7406 \xB7 ${d(a)} \u5F85\u8655\u7406 \xB7 ${ae(e.unprocessed_bytes)} \u5F85\u8655\u7406</span>
    </div>
    ${us({percent:r,status:a?"pending":"success",color:"var(--success)"},"processing-bar-lg")}
    <div class="processing-archive-summary-meta">
      <span>\u58D3\u7E2E\u6A94\u532F\u5165\u8986\u84CB ${ft(r)}</span>
      <span>\u5168\u90E8 ${ae(e.total_bytes)}</span>
    </div>
  </div>`}function Zi(e){let t=e.stages||{},a=["extract","filter","postgres"].map(r=>t[r]).filter(Boolean).map(r=>Ji(r,{compact:!0}));return a.length?`<div class="processing-archive-stages">${a.join("")}</div>`:""}function eo(e){let t=e.status||"pending",s=t==="running",a=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),r=s&&a===null,i=[];return e.message&&i.push(e.message),e.error&&i.push(e.error),(e.scanned||e.matched||e.stored)&&i.push(`\u6383\u63CF ${d(e.scanned)} \xB7 \u547D\u4E2D ${d(e.matched)} \xB7 \u5BEB\u5165 ${d(e.stored)}`),`<div class="processing-archive is-${Dt(t).tone}">
    <div class="processing-archive-head">
      <span class="processing-archive-name mono">${n(e.name)}</span>
      <div class="processing-archive-bar-wrap">
        ${us({percent:a,status:t,color:s?"var(--accent)":"var(--success)"})}
      </div>
      <span class="processing-archive-percent mono">${r?"\u9032\u884C\u4E2D":ft(a)}</span>
      ${je(t)}
      <span class="processing-archive-size faint">${ae(e.size_bytes)}</span>
    </div>
    ${Zi(e)}
    ${i.length?`<div class="processing-archive-note">${i.map(o=>`<span>${n(o)}</span>`).join("")}</div>`:""}
  </div>`}function to(e){let t=e.archives||{},s=e.local_archives||{},a=Array.isArray(t.items)?t.items:[],r=t.run,i=`<div class="report-section-head">
    <div>
      <div class="report-kicker">ARCHIVE PIPELINE</div>
      <h2 class="report-section-title">\u5224\u6C7A\u58D3\u7E2E\u6A94</h2>
      <p class="processing-section-sub">\u6BCF\u500B\u58D3\u7E2E\u6A94\u540D\u7A31\u5F8C\u65B9\u5373\u6642\u986F\u793A\u8655\u7406\u9032\u5EA6\uFF1B\u672A\u53D6\u5F97\u53EF\u8A08\u7B97\u7684\u7E3D\u91CF\u6642\u6A19\u793A\u300C\u9032\u5EA6\u672A\u77E5\u300D\uFF0C\u4E0D\u4EE5\u63A8\u6E2C\u6578\u503C\u4EE3\u66FF\u3002</p>
    </div>
  </div>`,o=t.source==="run"?`${je(r?r.status:"idle")} <span>\u76EE\u524D\u986F\u793A ${r?n(r.title||"\u5224\u6C7A\u532F\u5165"):"\u6700\u8FD1\u4E00\u6B21\u532F\u5165"} \u7684\u9010\u6A94\u9032\u5EA6${r&&r.started_at?` \xB7 ${n(qn(r))}`:""}</span>`:t.external?`${je("running")} <span>${n(t.note||"\u5916\u90E8\u532F\u5165\u7A0B\u5E8F\u672A\u5BEB\u5165\u9010\u6A94\u72C0\u614B\uFF1B\u4EE5\u4E0B\u70BA PostgreSQL \u8986\u84CB\u7387\u3002")}</span>`:'<span class="faint">\u76EE\u524D\u6C92\u6709\u53EF\u8B80\u53D6\u7684\u532F\u5165 run \u72C0\u614B\uFF1B\u4EE5\u4E0B\u4EE5 PostgreSQL \u7684 source_archive \u5224\u5B9A\u662F\u5426\u5DF2\u8655\u7406\u3002</span>';return`<section class="report-card processing-card">
    <div class="report-head">${i}</div>
    <div class="report-section">
      ${Xi(s)}
      <div class="processing-archive-run">${o}</div>
      ${a.length?`<div class="processing-archive-list">${a.map(eo).join("")}</div>`:`<div class="processing-empty">\u627E\u4E0D\u5230 .rar \u58D3\u7E2E\u6A94\uFF1B\u8ACB\u78BA\u8A8D ${n(s.data_dir||"\u5224\u6C7A\u8CC7\u6599\u76EE\u9304")}\u3002</div>`}
    </div>
  </section>`}function so(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let r=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${n(o.color||"var(--accent)")}" title="${n(`${o.label} ${Y(o.duration_ms)} (${ft(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${n(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${n(o.label)}</span>
        <span class="mono">${Y(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${ft(o.percent)}</span>
        ${je(o.status)}
      </div>`).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section">
      <div class="processing-timeline-label">
        <span>${n(t.label||"\u968E\u6BB5\u8017\u6642")}</span>
        <span class="mono">\u7E3D\u8A08 ${Y(t.total_ms)}</span>
      </div>
      <div class="processing-stack" role="img" aria-label="\u968E\u6BB5\u8017\u6642\u6BD4\u4F8B">${r}</div>
      <div class="processing-legend">${i}</div>
    </div>
  </section>`}function ao(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let r=t.map(i=>{let o=s.get(i.branch)||Sn[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${n(o)}</span>
          <strong>${n(i.title||"\u8655\u7406")}</strong>
          ${je(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${n(de(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?Y(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${n(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${r}</div></div>
  </section>`}function no(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>ie({tone:s.tone||"info",title:s.title,text:n(s.message||"")})).join("")}</div>`:""}function wn(e){return`${no(e)}
    ${Yi(e)}
    <section class="processing-flow-section">
      <div class="processing-section-head">
        <div>
          <div class="report-kicker">PIPELINE CANVAS</div>
          <h2 class="report-section-title">\u8655\u7406\u6D41\u7A0B</h2>
          <p class="processing-section-sub">\u5224\u6C7A\u3001\u6CD5\u898F\u3001\u547D\u4EE4\u4E09\u689D\u6D41\u7A0B\u5373\u6642\u53CD\u6620\u76EE\u524D\u57F7\u884C\u968E\u6BB5\uFF1B\u66F2\u7DDA\u7531\u4F86\u6E90\u7BC0\u9EDE\u9023\u5230\u5404\u968E\u6BB5\uFF0C\u767C\u5149\u7BC0\u9EDE\u8207\u6D41\u52D5\u66F2\u7DDA\u8868\u793A\u76EE\u524D\u57F7\u884C\u4F4D\u7F6E\u3002</p>
        </div>
      </div>
      ${Ki(e)}
    </section>
    ${to(e)}
    ${so(e)}
    ${ao(e)}`}function ro(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${ie({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:n(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${n(de(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${p("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}var An={overview:"activity",full_update:"download",law_download:"layers",order_download:"file",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function io(e){let t=Array.isArray(e.workflows)?e.workflows:[];return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...t.map(s=>{let a=s.active_run||null,r=a||s.last_run||null;return{...s,activeRun:a,lastRun:r,status:r?.status||"idle"}})]}function _n(e,t){return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${io(e).map(a=>{let r=a.id===t,i=An[a.id]||"terminal";return`<button class="status-tab${r?" is-active":""}" type="button"
            data-processing-workflow="${n(a.id)}"
            ${r?'aria-current="page"':""}>
            <span class="status-tab-icon">${p(i,15)}</span>
            <span class="status-tab-copy">
              <strong>${n(a.label)}</strong>
              <small>${n(a.description||"")}</small>
            </span>
            ${je(a.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${n(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function oo(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${je(e.status)}
      <span class="mono">${n(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${n(de(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${Y(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${n(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${n(t.log_path)}</strong>`:""}
    </div>
  </div>`}function lo(e){let t=e.active_run||null,s=t||e.last_run||null,a=!!t,r=!!e.can_run&&!a,i=e.id==="full_update",o=Array.isArray(e.command)?e.command.join(" "):"";return`<div class="processing-workflow-panel">
    ${ie({tone:"info",title:e.label,text:e.description||""})}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${p(An[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
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
          ${p("play",14)}<span>${a?"\u57F7\u884C\u4E2D":i?"\u57F7\u884C\u8CC7\u6599\u66F4\u65B0":"\u57F7\u884C\u6B64\u6D41\u7A0B"}</span>
        </button>
        ${t?`<button class="btn btn-secondary btn-sm processing-stop" type="button"
                data-processing-action="stop">${p("x",14)}<span>\u505C\u6B62</span></button>`:""}
      </div>
      <div class="side-card-foot">
        ${i?"\u6703\u4F9D\u5E8F\u57F7\u884C\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u8207\u53EF\u9078\u7684 Qdrant \u7D22\u5F15\u3002":"\u57F7\u884C\u7D50\u679C\u6703\u5BEB\u5165\u5171\u7528\u8655\u7406\u72C0\u614B\u6A94\uFF0C\u53EF\u5F9E\u8655\u7406\u7E3D\u89BD\u67E5\u770B\u3002"}
      </div>
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${je(s?.status||"idle")}
      </div>
      ${oo(s)}
    </section>
  </div>`}function kn(e,t){if(t==="overview")return wn(e);let a=(Array.isArray(e.workflows)?e.workflows:[]).find(r=>r.id===t);return a?lo(a):wn(e)}async function co(e){e.innerHTML=`<section class="page processing-page">
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
          ${p("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
        <button class="btn btn-secondary btn-sm processing-stop" type="button" data-processing-action="stop" id="processing-stop" hidden>
          ${p("x",14)}<span>\u505C\u6B62\u66F4\u65B0</span>
        </button>
        <button class="btn btn-primary btn-sm" type="button" data-processing-action="update" id="processing-update">
          ${p("download",14)}<span data-update-label>\u8CC7\u6599\u66F4\u65B0</span>
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
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-workflows"),r=e.querySelector("#processing-update"),i=e.querySelector("#processing-stop"),o=e.querySelector("#processing-refresh"),l=e.querySelector("#processing-index-toggle"),m=!1,f=!1,S=!1,w=null,_="",b="",u="overview",$=null,I=U=>{let F=U.capabilities||{},h=!!(l&&l.checked),y=h?F.can_start_update_with_index!==!1:F.can_start_update!==!1,C=h&&F.index_blocked_reason||F.start_blocked_reason;if(!S){r.disabled=!y,r.title=C||"\u6AA2\u67E5\u7DDA\u4E0A\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0C\u4E26\u8655\u7406\u672A\u532F\u5165\u7684\u5224\u6C7A\u58D3\u7E2E\u6A94\u3002";let Q=r.querySelector("[data-update-label]");Q&&(Q.textContent=y?"\u8CC7\u6599\u66F4\u65B0":F.active_update_id?"\u66F4\u65B0\u57F7\u884C\u4E2D":"\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D"),i.hidden=!F.can_stop_update,l&&(l.disabled=F.can_start_update===!1)}},z=async({silent:U=!1}={})=>{if(!(m||f)){f=!0,U||ne(o,!0,"\u66F4\u65B0\u4E2D\u2026");try{let F=await G.processing();if(m)return;w=F;let h=_n(F,u);h!==b&&(a.innerHTML=h,b=h);let y=kn(F,u);y!==_&&(s.innerHTML=y,_=y);let C=s.querySelector("[data-processing-updated-at]");if(C){let Q=de(F.generated_at);C.textContent!==Q&&(C.textContent=Q)}I(F)}catch(F){if(m)return;let h=ro(F.message,w);h!==_&&(s.innerHTML=h,_=h),U||R(F.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{f=!1,U||ne(o,!1)}}},E=async U=>{if(!S){S=!0,ne(U,!0,"\u555F\u52D5\u4E2D\u2026");try{let F=!!(l&&l.checked),h=await G.startProcessingUpdate(F);R(`\u5DF2\u555F\u52D5\u8CC7\u6599\u66F4\u65B0${F?"\uFF0C\u5B8C\u6210\u5F8C\u63A5\u7E8C Qdrant \u7D22\u5F15":""}\u3002`,"ok",6e3),h&&h.run_id&&console.info("processing update started",h),await z({silent:!0})}catch(F){R(F.message||"\u7121\u6CD5\u555F\u52D5\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{S=!1,ne(U,!1),w&&I(w)}}},B=async(U,F)=>{if(!S){S=!0,ne(U,!0,"\u555F\u52D5\u4E2D\u2026");try{let h=await G.startProcessingWorkflow(F);R("\u5DF2\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","ok",6e3),h&&h.run_id&&console.info("processing workflow started",h),await z({silent:!0})}catch(h){R(h.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{S=!1,ne(U,!1),w&&I(w)}}},V=async U=>{if(!S){S=!0,ne(U,!0,"\u505C\u6B62\u4E2D\u2026");try{let F=await G.stopProcessingUpdate();R(F.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3),await z({silent:!0})}catch(F){R(F.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{S=!1,ne(U,!1),w&&I(w)}}},ee=U=>{let F=U.target.closest("[data-processing-action]");if(!F||F.disabled)return;let h=F.dataset.processingAction;if(h==="refresh")z({silent:!1});else if(h==="update")E(F);else if(h==="run-workflow"){let y=F.dataset.workflowId||"";y==="full_update"?E(F):B(F,y)}else h==="stop"&&V(F)},re=U=>{U.target===l&&w&&I(w)},se=U=>{let F=U.target.closest("[data-processing-workflow]");if(F&&(u=F.dataset.processingWorkflow||"overview",w)){let h=_n(w,u);a.innerHTML=h,b=h;let y=kn(w,u);s.innerHTML=y,_=y}};return t.addEventListener("click",ee),a.addEventListener("click",se),l&&l.addEventListener("change",re),await z({silent:!1}),$=window.setInterval(()=>{document.hidden||z({silent:!0})},Pi),()=>{m=!0,$!==null&&window.clearInterval($),t.removeEventListener("click",ee),a.removeEventListener("click",se),l&&l.removeEventListener("change",re)}}var oa={};ot(oa,{render:()=>Ro});var na={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u9000\u5F79",badge:"badge-neutral"}},vt={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},ra={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},Ln={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function Tn(e){let t=na[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${n(t.label)}</span>`}function ia(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function uo(e){return ia(e).map(t=>{let[s,a]=t.split("|").map(r=>r.trim());return{law_name:s||"",source_type:a||""}})}function po(e){return ia(e).map(t=>{let[s,a]=t.split("|").map(r=>r.trim());return{law_name:s||"",article_no:a||""}})}function mo(e){return ia(e).map(t=>({jid:t.trim()}))}function go(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function fo(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function vo(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function bo(e){return(e?.tags||[]).join(", ")}function Lt(e){return`<div class="qb-empty">${p("info",18)}<span>${n(e)}</span></div>`}function jn(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),r=[...t.map(i=>`<span class="chip">${n(i)}</span>`),...s.map(i=>`<span class="chip">${n(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${n(i)}</span>`)];return r.length?`<div class="chips qb-labels">${r.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function ho(e){let t=!!e;return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${p(t?"edit":"plus",14)}${t?`\u7DE8\u8F2F\u984C\u76EE #${e.id}`:"\u65B0\u589E\u984C\u76EE"}</span>
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
          <select class="select" name="question_type">${Object.entries(vt).map(([s,a])=>`<option value="${s}" ${e?.question_type===s?"selected":""}>${a}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u96E3\u5EA6</span>
          <select class="select" name="difficulty">${Object.entries(ra).map(([s,a])=>`<option value="${s}" ${e?.difficulty===s?"selected":""}>${a}</option>`).join("")}</select>
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
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${n(go(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${n(fo(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${n(vo(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${n(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${n(bo(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
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
        <button class="btn btn-primary" type="submit">${p("check",14)}<span>${t?"\u5132\u5B58\u65B0\u7248\u672C":"\u5EFA\u7ACB\u984C\u76EE"}</span></button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-create">\u6E05\u9664</button>
      </div>
      <div class="qb-form-hint">\u4FEE\u6539\u5DF2\u5B58\u5728\u7684\u984C\u76EE\u6703\u5EFA\u7ACB\u65B0\u7248\u672C\uFF1B\u5DF2\u6838\u51C6\u984C\u76EE\u4FEE\u6539\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002</div>
    </form>
    <details class="qb-import">
      <summary>${p("upload",14)}JSON \u6279\u6B21\u532F\u5165</summary>
      <p class="qb-muted">\u683C\u5F0F\uFF1A<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>\u3002\u76F8\u540C\u984C\u76EE fingerprint \u9810\u8A2D\u66F4\u65B0\u3002</p>
      <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${p("upload",13)}<span>\u532F\u5165 JSON</span></button>
      </div>
    </details>
  </section>`}function aa(e,{reviewMode:t=!1}={}){return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${n(e.question)}</strong>
        <span class="qb-meta">
          ${n(vt[e.question_type]||e.question_type)}
          \xB7 ${n(ra[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${Tn(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${n(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${jn(e)}
    <div class="qb-item-foot">
      <span>\u66F4\u65B0 ${n(de(e.updated_at))}</span>
      ${e.reviewed_by?`<span>\u5BE9\u6838 ${n(e.reviewed_by)}</span>`:""}
      ${e.review_comment?`<span class="qb-comment">${n(e.review_comment)}</span>`:""}
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${p("edit",13)}<span>\u7DE8\u8F2F</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${e.id}">${p("shield",13)}<span>${t?"\u6279\u6CE8":"\u9A57\u6536"}</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${p("trash",13)}<span>\u522A\u9664</span></button>
      </div>
    </div>
  </article>`}function $o(e){return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("database",14)}\u984C\u5EAB\u7BA1\u7406</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="new">${p("plus",13)}<span>\u65B0\u589E</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="revalidate">${p("refresh",13)}<span>\u91CD\u65B0\u9A57\u8B49</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="export">${p("download",13)}<span>\u532F\u51FA JSON</span></button>
      </div>
    </div>
    <form class="qb-filters" data-qb-form="filter">
      <input class="input" name="query" type="search" placeholder="\u641C\u5C0B\u984C\u76EE\u6216\u53C3\u8003\u7B54\u6848" value="${n(e.filters.query)}" />
      <select class="select" name="status">
        <option value="">\u5168\u90E8\u72C0\u614B</option>
        ${Object.entries(na).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(vt).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(ra).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <input class="input" name="tag" placeholder="\u6A19\u7C64" value="${n(e.filters.tag)}" />
      <button class="btn btn-primary btn-sm" type="submit">${p("search",13)}<span>\u7BE9\u9078</span></button>
    </form>
    <div class="qb-list">
      ${e.items.length?e.items.map(t=>aa(t)).join(""):Lt("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${d(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}function yo(e){let t=e.reviewDetail;return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("shield",14)}\u984C\u5EAB\u4EBA\u5DE5\u9A57\u6536\u6279\u6CE8</span>
      <span class="badge badge-warn">\u5F85\u5BE9 ${d(e.stats.pending_review||0)}</span>
    </div>
    <label class="field qb-reviewer-field">
      <span class="field-label">\u9A57\u6536\u8005\u540D\u7A31</span>
      <input class="input" id="qb-reviewer-name" value="${n(e.reviewer)}" placeholder="\u76EE\u524D\u4EFB\u4F55\u4EBA\u53EF\u9A57\u6536\uFF1BGoogle Auth \u5F8C\u6539\u7531\u7BA1\u7406\u8005" />
    </label>
    ${t?`<div class="qb-review-detail">
            <button class="btn btn-ghost btn-sm" type="button" data-qb-action="review-back">${p("chevronLeft",13)}<span>\u8FD4\u56DE\u5F85\u5BE9\u5217\u8868</span></button>
            ${aa(t,{reviewMode:!0})}
            ${jn(t)}
            ${t.reference_answer?`<div class="qb-reference"><span class="summary-label">\u53C3\u8003\u7B54\u6848</span><p>${n(t.reference_answer)}</p></div>`:""}
            <form class="qb-review-form" data-qb-form="review" data-id="${t.id}">
              <div class="qb-score-grid">
                ${[["clarity","\u984C\u76EE\u6E05\u6670"],["labels","\u6CD5\u898F\uFF0F\u689D\u6587\u6A19\u8A3B"],["answer","\u53C3\u8003\u7B54\u6848"],["difficulty","\u96E3\u5EA6\u8207\u6A19\u7C64"],["overall","\u6574\u9AD4"]].map(([s,a])=>`<label class="field"><span class="field-label">${a} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${s}" value="4" /></label>`).join("")}
              </div>
              <label class="field"><span class="field-label">\u6279\u6CE8</span><textarea class="input" name="comment" rows="3" placeholder="\u6A19\u8A3B\u7406\u7531\u3001\u9700\u8981\u4FEE\u6539\u7684\u6B04\u4F4D\uFF0C\u6216\u9A57\u6536\u7D50\u8AD6\u3002"></textarea></label>
              <div class="qb-actions">
                <button class="btn btn-primary btn-sm" type="button" data-qb-action="decide" data-decision="approved">${p("check",13)}<span>\u6838\u51C6</span></button>
                <button class="btn btn-secondary btn-sm" type="button" data-qb-action="decide" data-decision="changes_requested">${p("edit",13)}<span>\u9000\u56DE\u4FEE\u6539</span></button>
                <button class="btn btn-ghost btn-sm" type="button" data-qb-action="decide" data-decision="rejected">${p("x",13)}<span>\u62D2\u7D55</span></button>
              </div>
            </form>
            ${t.reviews?.length?`<div class="qb-review-history"><span class="summary-label">\u5BE9\u6838\u7D00\u9304</span>${t.reviews.map(s=>`<div class="qb-review-row"><span>${n(s.reviewer||"\u533F\u540D")}</span>${Tn(s.decision==="approved"?"accepted":s.decision)}<span>${n(de(s.created_at))}</span><p>${n(s.comment||"\u2014")}</p></div>`).join("")}</div>`:""}
          </div>`:`<div class="qb-list">${e.reviewItems.length?e.reviewItems.map(s=>aa(s,{reviewMode:!0})).join(""):Lt("\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u984C\u76EE\u3002")}</div>`}
  </section>`}function Ot(e){if(e==null||e==="")return"";let t=Number(e);return Number.isFinite(t)?`${Math.round(t*100)}%`:""}function wo(e){if(!e||typeof e!="object")return"\u5F15\u7528";let t=String(e.jid||"").trim();if(t)return t;let s=String(e.law_name||"").trim(),a=String(e.article_no||"").trim(),r=`${s} ${a}`.trim();return r||String(e.title||e.text||"\u5F15\u7528").slice(0,80)}function _o(e){let t=e?.metrics||{},s=t.scores||{},a=[["\u6CD5\u898F\u53EC\u56DE",Ot(t.law_recall)],["\u689D\u6587\u53EC\u56DE",Ot(t.article_recall)],["\u898F\u5247\u5206",Ot(s.deterministic)],["Judge",Ot(s.judge)],["\u4EBA\u5DE5",Ot(s.human)]].filter(([,r])=>r);return a.length?`<div class="qb-bank-stats">${a.map(([r,i])=>`<span class="qb-bank-stat"><span>${n(r)}</span><strong>${n(i)}</strong></span>`).join("")}</div>`:""}function ko(e){let t=Array.isArray(e?.law_sources)?e.law_sources:[],s=Array.isArray(e?.citations)?e.citations:[],a=t.length?`<div class="qb-bank-sources">${t.map(i=>{let o=String(i.law_name||"\u672A\u547D\u540D\u6CD5\u898F"),l=(i.articles||[]).map(f=>String(f.article_no||"").trim()).filter(Boolean),m=`<strong>${n(o)}</strong>${l.length?`<small>${n(l.join("\u3001"))}</small>`:""}`;return i.law_url?`<a class="qb-bank-law" href="${n(i.law_url)}" target="_blank" rel="noreferrer">${m}</a>`:`<span class="qb-bank-law">${m}</span>`}).join("")}</div>`:"",r=s.length?`<div class="qb-bank-sources qb-bank-citations">${s.map(i=>`<span class="chip chip-mono">${n(wo(i))}</span>`).join("")}</div>`:"";return!a&&!r?"":`<div class="qb-bank-answer-block">
    <div class="qb-bank-section-label"><span>\u5F15\u7528\u4F86\u6E90</span><span>${d(t.length+s.length)} \u7B46</span></div>
    ${a}${r}
  </div>`}function En(e,t){if(!e)return`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${p("history",20)}</span>
      <strong>\u5C1A\u7121 RAG \u7B54\u6848</strong>
      <span>\u8DD1\u4E00\u6B21 Benchmark \u5F8C\uFF0C\u6700\u8FD1\u4E00\u6B21\u6210\u529F\u56DE\u7B54\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</span>
    </div>`;let s=Number(e.item_version||0),a=Number(t?.version||0),r=s&&a&&s!==a?`<span class="badge badge-warn">\u7B54\u6848 v${s} \xB7 \u984C\u76EE v${a}</span>`:"",i=e.answer_source==="llm"?"LLM \u751F\u6210":e.answer_source==="structured"?"\u6CD5\u898F\u8CC7\u6599\u5EAB":String(e.answer_source||"RAG");return`<div class="qb-bank-answer-meta">
      <span class="badge badge-ok"><span class="status-dot is-ok"></span>RAG \u5B8C\u6210</span>
      <span class="badge badge-neutral">${n(i)}</span>
      ${r}
      <span class="mono">${n(e.run_label||e.run_id||"")}</span>
      <span>${n(de(e.finished_at))}</span>
      <span>${n(Y(e.duration_ms))}</span>
      ${e.llm_model?`<span class="mono">${n(e.llm_model)}</span>`:""}
    </div>
    <div class="qb-bank-answer-block">
      <div class="qb-bank-section-label"><span>\u56DE\u7B54</span><span>${d(String(e.answer||"").length)} \u5B57</span></div>
      <p class="qb-bank-answer-text">${n(String(e.answer||"").trim()||"\uFF08\u7A7A\u767D\u56DE\u7B54\uFF09")}</p>
    </div>
    ${ko(e)}
    ${_o(e)}`}function Nn(e,t){let s=e.selectedSuiteId,a=t&&e.suiteAnswers?.[String(s)]?.[String(t.id)]||null;return t?`<div class="qb-bank-answer-head">
      <div class="qb-bank-answer-heading">
        <span class="qb-bank-answer-kicker">${p("sparkles",12)}RAG \u6700\u8FD1\u4E00\u6B21\u7B54\u6848</span>
        <strong class="qb-bank-answer-question">#${t.id} ${n(t.question)}</strong>
      </div>
      ${a?`<span class="qb-bank-answer-state">${n(vt[t.question_type]||t.question_type)} \xB7 v${t.version}</span>`:""}
    </div>
    ${En(a,t)}`:`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${p("cube",20)}</span>
      <strong>\u9078\u64C7\u984C\u76EE</strong>
      <span>\u5F9E\u5DE6\u5074\u6E05\u55AE\u9078\u64C7\u4E00\u984C\uFF0C\u67E5\u770B\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`}function Rn(e){return`<span class="qb-bank-actions">
    <button class="qb-bank-icon" type="button" data-qb-action="edit" data-id="${e.id}" title="\u7DE8\u8F2F\u984C\u76EE" aria-label="\u7DE8\u8F2F\u984C\u76EE #${e.id}">${p("edit",13)}</button>
    <button class="qb-bank-icon is-danger" type="button" data-qb-action="delete" data-id="${e.id}" title="\u5F9E\u984C\u5EAB\u79FB\u9664" aria-label="\u5F9E\u984C\u5EAB\u79FB\u9664 #${e.id}">${p("trash",13)}</button>
  </span>`}function So(e,t,{selected:s,hasAnswer:a}){return`<div class="qb-bank-row${s?" is-active":""}" data-id="${e.id}">
    <button class="qb-bank-select" type="button" data-qb-action="select-bank-item" data-id="${e.id}" aria-pressed="${s?"true":"false"}">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <span class="qb-bank-item-copy">
        <strong>${n(e.question)}</strong>
        <small>${n(vt[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${a?"\u5DF2\u6709 RAG \u7B54\u6848":"\u5C1A\u7121 RAG \u7B54\u6848"}</small>
      </span>
    </button>
    ${Rn(e)}
  </div>`}function xo(e,t,s){return`<article class="qb-bank-full-item" data-id="${e.id}">
    <div class="qb-bank-full-head">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <div class="qb-bank-full-title">
        <strong>${n(e.question)}</strong>
        <small>${n(vt[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${n(na[e.status]?.label||e.status||"")}</small>
      </div>
      ${Rn(e)}
    </div>
    ${En(s,e)}
  </article>`}function Mn(e){let t=e.editingSuite,s=Array.isArray(e.suites)?e.suites:[],a=s.find(b=>Number(b.id)===Number(e.selectedSuiteId))||s[0]||null,r=Array.isArray(a?.items)?a.items:[],i=e.suiteAnswers?.[String(a?.id)]||{},o=r.find(b=>Number(b.id)===Number(e.selectedBankItemId))||null,l=!!e.suiteAnswersLoading,m=String(e.suiteAnswersError||""),f=!!e.suiteManageOpen||!s.length,S=e.bankTab==="full"?"full":"split",w=s.length?`<div class="qb-bank-tabs" role="tablist" aria-label="Benchmark \u984C\u5EAB\u6AA2\u8996">
        <button class="qb-bank-tab${S==="split"?" is-active":""}" type="button" role="tab" aria-selected="${S==="split"?"true":"false"}" data-qb-action="bank-tab" data-tab="split">${p("grid",13)}<span>Benchmark \u984C\u5EAB</span><span class="badge badge-neutral">${d(r.length)}</span></button>
        <button class="qb-bank-tab${S==="full"?" is-active":""}" type="button" role="tab" aria-selected="${S==="full"?"true":"false"}" data-qb-action="bank-tab" data-tab="full">${p("table",13)}<span>\u984C\u5EAB\u5168\u5217\u8868</span><span class="badge badge-neutral">${d(r.length)}</span></button>
      </div>`:"",_="";if(!s.length)_=`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${p("cube",20)}</span>
      <strong>\u5C1A\u672A\u5EFA\u7ACB Benchmark \u984C\u5EAB</strong>
      <span>\u5C55\u958B\u4E0B\u65B9 Suite \u8A2D\u5B9A\u4E26\u5EFA\u7ACB\u984C\u5EAB\u5F8C\uFF0C\u5C31\u80FD\u5728\u9019\u88E1\u700F\u89BD\u984C\u76EE\u8207\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`;else if(l)_='<div class="qb-bank-loading"><span class="spinner" aria-hidden="true"></span><span>\u8B80\u53D6\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u4E2D\u2026</span></div>';else{let b=m?ie({tone:"warn",title:"\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u8B80\u53D6\u5931\u6557",text:n(m)}):"";S==="full"?_=`${b}<div class="qb-bank-full" data-qb-bank-view="full">${r.length?r.map((u,$)=>xo(u,$,i[String(u.id)]||null)).join(""):Lt("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>`:_=`${b}<div class="qb-bank-split" data-qb-bank-view="split">
        <div class="qb-bank-list" data-qb-bank-list>${r.length?r.map((u,$)=>So(u,$,{selected:Number(u.id)===Number(o?.id),hasAnswer:!!i[String(u.id)]})).join(""):Lt("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>
        <div class="qb-bank-answer-pane" data-qb-bank-answer>${Nn(e,o)}</div>
      </div>`}return`<section class="report-card qb-card qb-bank-card">
    <div class="side-card-head qb-bank-head">
      <div class="qb-bank-heading">
        <span class="side-card-title">${p("cube",14)}Benchmark \u984C\u5EAB</span>
        <span class="qb-bank-sub">${a?`${n(a.name)} \xB7 v${a.version} \xB7 ${d(a.item_count)} \u984C`:"\u5C1A\u672A\u5EFA\u7ACB suite"}</span>
      </div>
      <div class="qb-bank-controls">
        ${s.length?`<label class="qb-suite-picker"><span>Suite</span><select class="select" data-qb-suite-select aria-label="\u9078\u64C7 benchmark suite">${s.map(b=>`<option value="${b.id}" ${Number(b.id)===Number(a?.id)?"selected":""}>${n(b.name)} \xB7 ${d(b.item_count)} \u984C</option>`).join("")}</select></label>`:""}
        ${a?`<span class="badge ${a.status==="frozen"?"badge-ok":"badge-neutral"}">${a.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>`:""}
      </div>
    </div>
    ${w}
    ${_}
    <details class="qb-suite-manage" ${f?"open":""}>
      <summary>${p("sliders",14)}Suite \u8A2D\u5B9A\u8207\u7248\u672C <span class="qb-muted">${d(s.length)} \u500B suite \xB7 ${d(e.ready.length)} \u984C benchmark-ready</span></summary>
      <div class="qb-suite-manage-body">
        <form class="qb-suite-form" data-qb-form="suite">
          <input type="hidden" name="suite_id" value="${t?.id||""}" />
          <div class="qb-form-grid">
            <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${n(t?.name||"Pilot 30")}" /></label>
            <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(Ln).map(([b,u])=>`<option value="${b}" ${t?.tier===b?"selected":""}>${u}</option>`).join("")}</select></label>
          </div>
          <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${n(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
          <div class="qb-check-list">
            ${e.ready.length?e.ready.map(b=>{let u=t?t.items?.some($=>Number($.id)===Number(b.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${b.id}" ${u?"checked":""}/><span><strong>#${b.id}</strong> ${n(b.question)} <small>${n(vt[b.question_type]||b.question_type)}</small></span></label>`}).join(""):Lt("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
          </div>
          <div class="qb-actions">
            <button class="btn btn-primary" type="submit">${p("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
            ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
          </div>
        </form>
        <div class="qb-list">
          ${s.length?s.map(b=>`<article class="qb-suite">
            <div class="qb-item-head">
              <div class="qb-item-title"><strong>${n(b.name)}</strong><span class="qb-meta">${n(Ln[b.tier]||b.tier)} \xB7 v${b.version} \xB7 ${d(b.item_count)} \u984C</span></div>
              <span class="badge ${b.status==="frozen"?"badge-ok":"badge-neutral"}">${b.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
            </div>
            <div class="qb-suite-items">${(b.items||[]).slice(0,8).map(u=>`<span class="chip">#${u.id} ${n(u.question.slice(0,22))}${u.question.length>22?"\u2026":""}</span>`).join("")}${b.item_count>8?`<span class="qb-muted">+${b.item_count-8}</span>`:""}</div>
            <div class="qb-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${b.id}">${p("edit",13)}<span>\u7DE8\u8F2F suite</span></button>
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${b.id}">${p("shield",13)}<span>\u51CD\u7D50</span></button>
              <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${b.id}">${p("trash",13)}<span>\u522A\u9664</span></button>
            </div>
          </article>`).join(""):Lt("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
        </div>
      </div>
    </details>
  </section>`}function qo(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),r=Number(a?.value);Number.isFinite(r)&&(t[s]=Math.max(1,Math.min(5,Math.round(r))))}return t}function Ao(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:uo(t.get("expected_laws")),expected_articles:po(t.get("expected_articles")),expected_judgments:mo(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function Cn(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},r={tab:"",editing:null,editingFrom:"",editingSuite:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tag:""},stats:{},suites:[],ready:[],selectedSuiteId:null,selectedBankItemId:null,bankTab:"split",suiteAnswers:{},suiteAnswersLoading:!1,suiteAnswersError:"",suiteManageOpen:!1,reviewItems:[],reviewDetail:null,reviewer:(()=>{try{return window.localStorage.getItem("judgment.reviewer")||"anonymous"}catch{return"anonymous"}})()},i=x=>e.querySelector(`#quality-panel-${a[x]}`),o=x=>{r.reviewer=String(x||"").trim()||"anonymous";try{window.localStorage.setItem("judgment.reviewer",r.reviewer)}catch{}},l=()=>{s&&s(r.stats)},m=x=>{t&&t(x),ee(x)},f=async()=>{try{r.stats=await G.questionBankStats()}catch{r.stats={}}l()},S=()=>{let x=i("create");x&&(x.innerHTML=ho(r.editing))},w=()=>{let x=Array.isArray(r.suites)?r.suites:[];if(!x.length)return r.selectedSuiteId=null,r.selectedBankItemId=null,null;let g=x.find(A=>Number(A.id)===Number(r.selectedSuiteId));g||(g=x[0],r.selectedSuiteId=g.id,r.selectedBankItemId=null);let T=Array.isArray(g.items)?g.items:[];return T.some(A=>Number(A.id)===Number(r.selectedBankItemId))||(r.selectedBankItemId=T[0]?.id??null),g},_=()=>{let x=i("suite");x&&(x.innerHTML=Mn(r))},b=0,u=async(x,{force:g=!1}={})=>{if(!x)return;let T=++b;if(!g&&r.suiteAnswers[String(x)]){r.suiteAnswersLoading=!1,r.suiteAnswersError="",_();return}r.suiteAnswersLoading=!0,r.suiteAnswersError="",_();try{let A=await G.benchmarkSuiteLatestAnswers(x);if(T!==b)return;r.suiteAnswers[String(x)]=A.answers||{}}catch(A){if(T!==b)return;r.suiteAnswersError=A.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}finally{T===b&&(r.suiteAnswersLoading=!1,_())}},$=async x=>{r.selectedSuiteId=x,r.selectedBankItemId=null,r.suiteAnswersError="";let g=w();if(!g){_();return}await u(g.id)},I=x=>{r.bankTab=x==="full"?"full":"split",_()},z=()=>{let x=i("suite");if(!x)return;let g=w(),A=(Array.isArray(g?.items)?g.items:[]).find(J=>Number(J.id)===Number(r.selectedBankItemId))||null;for(let J of x.querySelectorAll(".qb-bank-row")){let Z=Number(J.dataset.id)===Number(r.selectedBankItemId);J.classList.toggle("is-active",Z);let ge=J.querySelector("[data-qb-action='select-bank-item']");ge&&ge.setAttribute("aria-pressed",Z?"true":"false")}let M=x.querySelector("[data-qb-bank-answer]");M&&(M.innerHTML=Nn(r,A))},E=async()=>{let x=i("manage");if(x){x.innerHTML='<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026</span></div></section>';try{let g=await G.questionBankItems(r.filters,r.limit,r.offset);r.items=g.items||[],r.total=Number(g.total||0),r.stats=g.stats||r.stats,x.innerHTML=$o(r),l()}catch(g){x.innerHTML=`<section class="report-card qb-card">${ie({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:n(g.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},B=async({refreshAnswers:x=!1}={})=>{let g=i("suite");if(g){g.innerHTML='<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026</span></div></section>';try{let[T,A]=await Promise.all([G.benchmarkSuites(),G.benchmarkReadyQuestions(300)]);r.suites=T.suites||[],r.ready=A.items||[];let M=w();if(r.suiteAnswersError="",r.suiteAnswersLoading=!1,M&&(x||!r.suiteAnswers[String(M.id)]))try{let J=await G.benchmarkSuiteLatestAnswers(M.id);r.suiteAnswers[String(M.id)]=J.answers||{}}catch(J){r.suiteAnswersError=J.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}g.innerHTML=Mn(r)}catch(T){g.innerHTML=`<section class="report-card qb-card">${ie({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:n(T.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},V=async()=>{let x=i("review");if(x){x.innerHTML='<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>\u8B80\u53D6\u5F85\u5BE9\u984C\u76EE\u4E2D\u2026</span></div></section>';try{let[g,T]=await Promise.all([G.questionBankItems({status:"pending_review"},100,0),G.questionBankItems({status:"changes_requested"},100,0)]);r.reviewItems=[...g.items||[],...T.items||[]],r.stats=g.stats||r.stats,r.reviewDetail&&(r.reviewDetail=await G.questionBankItem(r.reviewDetail.id)),x.innerHTML=yo(r);let A=x.querySelector("#qb-reviewer-name");A&&(A.value=r.reviewer,A.addEventListener("change",()=>o(A.value))),l()}catch(g){x.innerHTML=`<section class="report-card qb-card">${ie({tone:"danger",title:"\u5F85\u5BE9\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:n(g.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}};function ee(x){r.tab=x;for(let g of Object.keys(a)){let T=i(g);T&&(T.hidden=g!==x)}x==="create"?S():x==="manage"?E():x==="suite"?B():x==="review"&&V()}let re=x=>{let g=r.items.find(T=>Number(T.id)===Number(x));r.reviewDetail=g||{id:Number(x)},m("review")},se=async x=>{let g=Ao(x),T=Number(x.elements.item_id?.value||0);try{T?(await G.updateQuestionBankItem(T,{...g,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),R("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await G.createQuestionBankItem(g),R("\u984C\u76EE\u5DF2\u5EFA\u7ACB\u3002","ok")),r.editing=null;let A=["manage","suite","review"].includes(r.editingFrom)?r.editingFrom:"manage";r.editingFrom="",r.suiteAnswers={},await f(),m(A)}catch(A){let M=A.detail||A.payload?.detail,J=M?.errors?.join(" \xB7 ")||M?.message||A.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";R(J,"danger",8e3)}},U=async(x,g)=>{let T=Number(x.dataset.id||0);if(T)try{await G.reviewQuestionBankItem(T,{decision:g,reviewer:r.reviewer,rubric_scores:qo(x),comment:String(x.querySelector('[name="comment"]')?.value||"")}),R(g==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":g==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",g==="approved"?"ok":"info"),r.reviewDetail=null,await f(),await V()}catch(A){let M=A.detail||A.payload?.detail,J=M?.errors?.join(" \xB7 ")||M?.message||A.message||"\u9A57\u6536\u5931\u6557\u3002";R(J,"danger",8e3)}},F=async x=>{let g=new FormData(x),T=Number(g.get("suite_id")||0),A=Array.from(x.querySelectorAll('input[name="item_ids"]:checked')).map(J=>Number(J.value)),M={name:String(g.get("name")||"").trim(),tier:String(g.get("tier")||"core"),description:String(g.get("description")||"").trim(),item_ids:A};try{T?(await G.updateBenchmarkSuite(T,M),R("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await G.createBenchmarkSuite(M),R("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),r.editingSuite=null,r.suiteManageOpen=!0,r.suiteAnswers={},await B()}catch(J){let Z=J.detail||J.payload?.detail,ge=Z?.errors?.join(" \xB7 ")||Z?.message||J.message||"Suite \u5132\u5B58\u5931\u6557\u3002";R(ge,"danger",8e3)}},h=async x=>{let g=x.target.closest("[data-qb-action]")?.dataset.qbAction;if(!g)return;let T=x.target.closest("[data-qb-action]"),A=Number(T.dataset.id||0);if(g==="bank-tab"){I(T.dataset.tab);return}if(g==="select-bank-item"){r.selectedBankItemId=A,z();return}if(g==="new"){r.editing=null,r.editingFrom="",m("create");return}if(g==="reset-create"){r.editing=null,S();return}if(g==="edit"){let M=r.suites.find(ge=>Number(ge.id)===Number(r.selectedSuiteId)),Z=[...r.items,...r.reviewItems,...M?.items||[],...r.reviewDetail?[r.reviewDetail]:[]].find(ge=>Number(ge.id)===A);if(!Z)return;r.editing=Z,r.editingFrom=r.tab,m("create");return}if(g==="review"){re(A);return}if(g==="review-back"){r.reviewDetail=null,V();return}if(g==="delete"){if(r.tab==="suite"){let M=w();if(!M||!(M.items||[]).find(Z=>Number(Z.id)===A)||!window.confirm(`\u78BA\u5B9A\u5F9E\u300C${M.name}\u300D\u79FB\u9664\u984C\u76EE #${A}\uFF1F\u984C\u76EE\u4ECD\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u7BA1\u7406\u4E2D\u3002`))return;try{await G.removeBenchmarkSuiteItem(M.id,A),R("\u5DF2\u5F9E Benchmark \u984C\u5EAB\u79FB\u9664\u3002","info"),delete r.suiteAnswers[String(M.id)],Number(r.selectedBankItemId)===A&&(r.selectedBankItemId=null),await B()}catch(Z){R(Z.message||"\u79FB\u9664\u5931\u6557\u3002","danger")}return}if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${A}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await G.deleteQuestionBankItem(A),R("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await f(),await E()}catch(M){R(M.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(g==="revalidate"){try{let M=await G.revalidateQuestionBank();R(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${d(M.checked||0)} \u984C\uFF0C${d(M.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await f(),await E()}catch(M){R(M.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(g==="export"){try{let M=await G.exportQuestionBank({status:""});ze(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(M,null,2),"application/json;charset=utf-8")}catch(M){R(M.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(g==="import-json"){let M=e.querySelector("#qb-import-json");try{let J=JSON.parse(String(M?.value||"").trim()),Z=await G.importQuestionBank(J);R(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${Z.created}\u3001\u66F4\u65B0 ${Z.updated}\u3001\u932F\u8AA4 ${(Z.errors||[]).length}\u3002`,(Z.errors||[]).length?"warn":"ok",8e3),M&&(M.value=""),await f(),await E()}catch(J){R(J.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(g==="prev"||g==="next"){r.offset=Math.max(0,r.offset+(g==="next"?r.limit:-r.limit)),await E();return}if(g==="suite-edit"){let M=r.suites.find(J=>Number(J.id)===A);if(!M)return;r.editingSuite=M,r.suiteManageOpen=!0,B();return}if(g==="suite-new"){r.editingSuite=null,r.suiteManageOpen=!0,B();return}if(g==="suite-freeze"){try{await G.updateBenchmarkSuite(A,{freeze:!0}),R("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),r.editingSuite=null,r.suiteManageOpen=!0,await B()}catch(M){R(M.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(g==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${A}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await G.deleteBenchmarkSuite(A),R("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),r.editingSuite=null,r.suiteAnswers={},r.suiteManageOpen=!0,await B()}catch(M){R(M.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(g==="decide"){let M=T.closest("form[data-qb-form='review']");M&&await U(M,String(T.dataset.decision||""))}},y=async x=>{let g=x.target.closest("[data-qb-form]");if(!g)return;x.preventDefault();let T=g.dataset.qbForm;if(T==="create")await se(g);else if(T==="filter"){let A=new FormData(g);r.filters={query:String(A.get("query")||"").trim(),status:String(A.get("status")||""),question_type:String(A.get("question_type")||""),difficulty:String(A.get("difficulty")||""),tag:String(A.get("tag")||"").trim()},r.offset=0,await E()}else T==="suite"&&await F(g)},C=async x=>{let g=x.target.closest?.("[data-qb-suite-select]");if(!g)return;let T=Number(g.value||0);!T||T===Number(r.selectedSuiteId)||await $(T)},Q=x=>{let g=x.target;g?.matches?.(".qb-suite-manage")&&(r.suiteManageOpen=!!g.open)};e.addEventListener("click",h),e.addEventListener("submit",y),e.addEventListener("change",C),e.addEventListener("toggle",Q,!0);let W=async()=>{await f(),r.tab==="create"?S():r.tab==="manage"?await E():r.tab==="suite"?await B({refreshAnswers:!0}):r.tab==="review"&&await V()};return f(),{show:ee,refresh:W,destroy(){e.removeEventListener("click",h),e.removeEventListener("submit",y),e.removeEventListener("change",C),e.removeEventListener("toggle",Q,!0)},getStats:()=>r.stats}}function ms(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function In(e){return e==null?"\u2014":d(e)}function Lo(e){return e.count?e.severity==="danger"?pe("failed","\u9700\u8655\u7406"):e.severity==="warn"?pe("warning","\u6CE8\u610F"):pe("preview","\u63D0\u793A"):pe("success","\u901A\u904E")}function Mo(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function To(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${Mo(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${n(e.label)}</span>
      ${Lo(e)}
    </div>
    <div class="quality-check-value">
      <strong>${d(t)}</strong>
      <span>\u7B46</span>
      <em>${n(ms(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${n(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function ps(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
      <div class="index-chart-head"><span>${n(e)}</span><span>${n(t)}</span></div>
      <div class="index-chart-empty">DuckDB \u6383\u63CF\u5F8C\u6C92\u6709\u53EF\u5448\u73FE\u7684\u8CC7\u6599\u3002</div>
    </div>`;let r=Math.max(...a.map(i=>Number(i.value)||0),1);return`<div class="index-chart-card">
    <div class="index-chart-head"><span>${n(e)}</span><span>${n(t)}</span></div>
    <div class="distribution">
      ${a.map(i=>{let o=Number(i.value)||0,l=Math.max(1.5,o/r*100);return`<div class="dist-row">
            <span class="dist-label" title="${n(i.label||"\u672A\u5206\u985E")}">${n(i.label||"\u672A\u5206\u985E")}</span>
            <span class="dist-track"><span class="dist-bar" style="width:${l.toFixed(2)}%"></span></span>
            <span class="dist-value">${d(o)}</span>
          </div>`}).join("")}
    </div>
  </div>`}function jo(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},r=t.postgres_diff,i=r==null?"\u2014":r===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${d(Math.abs(r))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${d(t.vector_indexed)} / ${d(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${p("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${d(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${d(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${p("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${In(t.postgres_judgments)}</div>
      <div class="metric-foot">${n(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${p("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${n(ms(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${n(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${p("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${In(a.candidate_total)}</div>
      <div class="metric-foot">${d(a.candidate_archive_count)} / ${d(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function Eo(e){return e.length?`<div class="table-wrap">
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
        ${e.map(t=>{let s=(Number(t.missing_court_rows)||0)+(Number(t.missing_normalized_rows)||0)+(Number(t.missing_date_rows)||0)+(Number(t.invalid_date_rows)||0)+(Number(t.missing_title_rows)||0),a=t.candidate_count===null||t.candidate_count===void 0?"\u2014":d(t.candidate_count);return`<tr>
              <td class="cell-jid">
                <span class="mono">${n(t.archive||"\u2014")}</span>
                ${t.version?`<span class="chip">v${n(t.version)}</span>`:""}
              </td>
              <td class="cell-number">${d(t.rows)}</td>
              <td class="cell-number">${a}</td>
              <td class="cell-number">${d(t.matched_rows)}</td>
              <td class="cell-number">${n(ms(t.match_rate))}</td>
              <td class="cell-number">${d(t.short_text_rows)}</td>
              <td class="cell-number">${d(s)}</td>
              <td class="cell-number">${d(t.duplicate_content_rows)}</td>
              <td class="cell-date">${n(Ge(t.date_min))} \u2013 ${n(Ge(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:Ne({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function No(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],r=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=ae(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${pe(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${d(t.rows)} \u7B46 \xB7 ${d(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${Y(e.scan_ms||0)} \xB7
          ${n(de(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${p("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${ie({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(m=>n(m)).join("<br>")})}</div>`:""}
    <div class="summary-strip quality-summary-strip">
      <div class="summary-item">
        <div class="summary-label">\u539F\u59CB\u7B46\u6578</div>
        <div class="summary-value">${d(t.rows)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">\u7CBE\u78BA\u547D\u4E2D</div>
        <div class="summary-value">${d(t.matched_rows)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">\u547D\u4E2D\u7387</div>
        <div class="summary-value">${n(ms(t.match_rate))}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">\u91CD\u8907\u6848\u865F</div>
        <div class="summary-value">${d(t.duplicate_jid_rows)}</div>
      </div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u54C1\u8CEA\u6AA2\u67E5</span>
        <span class="muted" style="font-size:9.5px">
          ${d(r.ok_count)} \u9805\u901A\u904E \xB7
          ${d(r.warning_count)} \u9805\u6CE8\u610F \xB7
          ${d(r.danger_count)} \u9805\u9700\u8655\u7406 \xB7
          ${d(r.info_count)} \u9805\u63D0\u793A
        </span>
      </div>
      <div class="quality-checks">${a.map(To).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${jo(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${d(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${Eo(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${ps("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${ps("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${ps("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${ps("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function Ro(e){e.innerHTML=`<section class="page data-page quality-page">
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
          ${p("refresh",15)}<span>\u91CD\u65B0\u6383\u63CF</span>
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
            <span class="status-tab-icon">${p("activity",15)}</span>
            <span class="status-tab-copy"><strong>\u54C1\u8CEA\u7E3D\u89BD</strong><small>DuckDB \u539F\u59CB\u8CC7\u6599\u8207\u8986\u84CB\u6AA2\u67E5</small></span>
            <span class="badge badge-neutral" id="quality-badge-overview">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="create">
            <span class="status-tab-icon">${p("plus",15)}</span>
            <span class="status-tab-copy"><strong>\u984C\u5EAB\u65B0\u589E</strong><small>\u5EFA\u7ACB\u984C\u76EE\u3001\u6A19\u8A3B\u8207 JSON \u532F\u5165</small></span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="manage">
            <span class="status-tab-icon">${p("database",15)}</span>
            <span class="status-tab-copy"><strong>\u984C\u5EAB\u7BA1\u7406</strong><small>\u7248\u672C\u3001\u72C0\u614B\u3001\u6A19\u7C64\u8207\u522A\u9664</small></span>
            <span class="badge badge-neutral" id="quality-badge-manage">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="suite">
            <span class="status-tab-icon">${p("cube",15)}</span>
            <span class="status-tab-copy"><strong>Benchmark \u984C\u5EAB</strong><small>\u51CD\u7D50 suite \u8207 benchmark-ready \u984C\u76EE</small></span>
            <span class="badge badge-neutral" id="quality-badge-suite">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="review">
            <span class="status-tab-icon">${p("shield",15)}</span>
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),r=[...e.querySelectorAll("[data-quality-tab]")],i={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},o=null,l="overview",m=()=>{if(!o)return;t.innerHTML=No(o),a.textContent=`DUCKDB \xB7 ${d(o.totals?.rows)} \u7B46 \xB7 ${Y(o.scan_ms||0)}`;let u=e.querySelector("#quality-badge-overview");u&&(u.textContent=d(o.totals?.rows||0))},f=u=>{l=u==="overview"?"overview":u;for(let $ of r){let I=$.dataset.qualityTab===l;$.classList.toggle("is-active",I),I?$.setAttribute("aria-current","page"):$.removeAttribute("aria-current")}for(let[$,I]of Object.entries(i))I&&(I.hidden=$!==l);l!=="overview"?a.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":o&&m()},S=Cn(e,{onNavigate:u=>f(u),onStats:u=>{let $=u||{},I=e.querySelector("#quality-badge-manage"),z=e.querySelector("#quality-badge-suite"),E=e.querySelector("#quality-badge-review");I&&(I.textContent=d($.total||0)),z&&(z.textContent=d($.benchmark_ready||0)),E&&(E.textContent=d(($.pending_review||0)+($.changes_requested||0)))}}),w=u=>{f(u),u!=="overview"&&S.show(u)},_=async()=>{ne(s,!0,"\u6383\u63CF\u4E2D\u2026");try{o=await G.quality(),m()}catch(u){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${ie({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:n(u.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",R("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{ne(s,!1)}},b=async()=>{l==="overview"?await _():await S.refresh()};s.addEventListener("click",b),e.addEventListener("click",u=>{let $=u.target.closest("[data-quality-tab]");$&&w($.dataset.qualityTab||"overview")}),t.addEventListener("click",u=>{!u.target.closest("[data-action='export-quality']")||!o||ze(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(o,null,2),"application/json;charset=utf-8")}),f("overview"),await _()}var ca={};ot(ca,{render:()=>rl});var gs={};ot(gs,{render:()=>la});var Pn={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function Bn(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${n(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${n(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function Co(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}`)}:null})}async function la(e,t,{embedded:s=!1}={}){let a=!1,r=!1,i={embedding:[],llm:[]},o=!1,l=null,m=[],f="",S=null,w="",_=`<div class="page-actions">
      <span class="badge badge-neutral badge-mono" id="tests-mode-badge">\u8B80\u53D6\u4E2D</span>
      <button class="btn btn-secondary" type="button" id="tests-refresh">
        ${p("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
      </button>
    </div>`,b=s?`<div class="tests-embed-head">
        <div>
          <div class="eyebrow">SYSTEM TEST</div>
          <div class="tests-embed-title">\u7CFB\u7D71\u6E2C\u8A66</div>
          <div class="tests-embed-copy">\u5F8C\u7AEF API \u9023\u7DDA\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u591A\u6A21\u578B\u6E2C\u8A66 Flow\u3002\u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\u3002</div>
        </div>
        ${_}
      </div>`:`<div class="page-header">
      <div>
        <div class="eyebrow">SYSTEM TEST</div>
        <h1 class="page-title">\u7CFB\u7D71\u6E2C\u8A66</h1>
        <p class="page-subtitle">\u5408\u4F75\u5F8C\u7AEF API \u9023\u7DDA\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u591A\u6A21\u578B\u6E2C\u8A66 Flow\u3002
          \u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002</p>
      </div>
      ${_}
    </div>`;e.innerHTML=`<section class="${s?"tests-page tests-page-embedded":"page tests-page"}">
    ${b}

    <div class="tests-grid">
      <section class="card tests-card tests-api-card" aria-labelledby="tests-api-title">
        <form class="api-dialog-form tests-api-form" id="tests-api-form" novalidate>
          <div class="api-dialog-head">
            <span class="api-dialog-icon" aria-hidden="true">${p("link",17)}</span>
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
              ${p("activity",14)}<span>\u6E2C\u8A66\u9023\u7DDA</span>
            </button>
            <span class="grow"></span>
            <button class="btn btn-ghost btn-sm" type="button" id="tests-api-reset">\u6062\u5FA9\u9810\u8A2D</button>
            <button class="btn btn-primary btn-sm" type="submit" id="tests-api-save">
              ${p("check",14)}<span>\u5132\u5B58\u4E26\u91CD\u65B0\u8F09\u5165</span>
            </button>
          </div>
        </form>
      </section>

      <section class="card tests-card" aria-labelledby="tests-mode-title">
        <div class="tests-card-head">
          <span class="tests-card-icon">${p("terminal",16)}</span>
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
            ${p("sparkles",13)}<span>\u524D\u5F80 RAG \u63D0\u554F</span>
          </a>
          <a class="btn btn-secondary btn-sm" href="#/performance">
            ${p("activity",13)}<span>\u6548\u80FD Flow</span>
          </a>
        </div>
        <div class="tests-status" id="tests-mode-status" role="status"></div>
      </section>
    </div>

    <div id="tests-flow"></div>
  </section>`;let u=e.querySelector("#tests-mode-badge"),$=e.querySelector("#tests-mode-toggle"),I=e.querySelector("#tests-mode-summary"),z=e.querySelector("#tests-mode-models"),E=e.querySelector("#tests-mode-status"),B=e.querySelector("#tests-api-form"),V=e.querySelector("#tests-api-input"),ee=e.querySelector("#tests-api-preview"),re=e.querySelector("#tests-api-status"),se=e.querySelector("#tests-api-note"),U=e.querySelector("#tests-api-test"),F=e.querySelector("#tests-api-reset"),h=e.querySelector("#tests-api-save"),y=e.querySelector("#tests-refresh"),C=e.querySelector("#tests-flow"),Q=(K,oe,be="")=>{K&&(K.textContent=oe,K.className=`tests-status${be?` is-${be}`:""}`)},W=(K,oe="")=>{re&&(re.textContent=K,re.className=`api-dialog-status${oe?` is-${oe}`:""}`)},x=()=>at()==="query",g=()=>{let K=tt(V.value);return K||(window.location.protocol==="file:"?Ms:"")},T=()=>{let K=g(),oe=st(),be=Pn[at()]||at()||"\u540C\u6E90";ee.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${n(lt(oe))}</strong>${oe?`\uFF08${n(be)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${n(Je("/api/health",K))}`},A=()=>{let K=at(),oe=`\u76EE\u524D\u4F86\u6E90\uFF1A${Pn[K]||K||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,be="";K==="query"?(be="is-warn",oe="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):zt()?(be="is-warn",oe="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(K==="file-default"||window.location.protocol==="file:")&&(oe="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),se.textContent=oe,se.className=`api-dialog-note${be?` ${be}`:""}`;let Ce=K==="query";h.disabled=Ce,F.disabled=Ce,V.readOnly=Ce},M=()=>{if(!Ts(V.value))return W("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),V.focus(),null;let K=g();return window.location.protocol==="https:"&&/^http:\/\//i.test(K)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(K)?(W("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),V.focus(),null):K},J=()=>{V.value=st(),T(),A(),W("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},Z=()=>{let K=Array.isArray(i.embedding)?i.embedding.length:0,oe=Array.isArray(i.llm)?i.llm.length:0;if(u&&(u.textContent=o?"\u5207\u63DB\u4E2D\u2026":r?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",u.className=`badge badge-mono ${o?"badge-info":r?"badge-warn":"badge-neutral"}`),$){$.disabled=o,$.classList.toggle("is-on",r),$.classList.toggle("is-off",!r&&!o),$.classList.toggle("is-busy",o),$.setAttribute("aria-checked",r?"true":"false"),$.setAttribute("aria-busy",o?"true":"false"),$.setAttribute("aria-label",o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":r?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),$.title=o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":r?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let be=$.querySelector(".header-power-label");be&&(be.textContent=o?"\u2026":r?"ON":"OFF")}I&&(I.textContent=r?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${K} \u500B embedding \u8207 ${oe} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),z&&(z.innerHTML=Bn("Embedding",i.embedding)+Bn("LLM",i.llm))},ge=async()=>{try{let K=await G.testMode();if(a)return;r=!!K.enabled,i=K.models||{embedding:[],llm:[]},Q(E,"")}catch(K){if(a)return;r=!1,i={embedding:[],llm:[]},Q(E,K.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}a||Z()},ye=async()=>{if(o)return;let K=!r;o=!0,Z(),Q(E,K?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let oe=await G.setTestMode(K);if(a)return;r=!!oe.enabled,i=oe.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:r,models:i}}));let be=i.embedding?.length||0,Ce=i.llm?.length||0;Q(E,r?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${be} \u500B embedding \u8207 ${Ce} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),R(r?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${be} \u500B embedding\u3001${Ce} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",r?"ok":"info",6e3),await xe()}catch(oe){a||(Q(E,oe.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),R(oe.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{o=!1,a||Z()}},it=()=>{if(!C)return;let K=Co(l,m,f);K!==w&&(w=K,C.innerHTML=qt(l,m,f))},De=async()=>{try{let K=await G.testRuns(30);if(a)return;m=Array.isArray(K.runs)?K.runs:[]}catch{if(a)return;m=[]}},xe=async()=>{try{let K=f?await G.testRun(f):await G.testRunCurrent();if(a)return;l=K.run||null,!f&&l&&l.status!=="running"&&!m.some(oe=>oe.run_id===l.run_id)&&await De()}catch{if(a)return;l=null}a||it()};V?.addEventListener("input",()=>{T(),W("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),U?.addEventListener("click",async()=>{let K=M();if(K!==null){ne(U,!0,"\u6E2C\u8A66\u4E2D\u2026"),W(`\u6B63\u5728\u9023\u7DDA\u5230 ${lt(K)||"\u540C\u6E90"}\u2026`);try{let oe=await $a(K);if(a)return;W(`\u9023\u7DDA\u6210\u529F \xB7 v${oe.version} \xB7 ${oe.duration_ms} ms \xB7 GET ${Je("/api/health",K)}`,"ok")}catch(oe){a||W(oe.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{a||ne(U,!1)}}}),B?.addEventListener("submit",K=>{if(K.preventDefault(),x())return;let oe=M();oe!==null&&(Rs(oe),R(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${lt(oe)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),F?.addEventListener("click",()=>{x()||(Rs(""),R("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),$?.addEventListener("click",ye),C?.addEventListener("change",async K=>{K.target.id==="test-run-select"&&(f=String(K.target.value||""),await xe())}),C?.addEventListener("click",async K=>{K.target.closest("#test-flow-refresh")&&(f="",await De(),await xe())}),y?.addEventListener("click",async()=>{ne(y,!0,"\u66F4\u65B0\u4E2D\u2026"),J(),await Promise.allSettled([ge(),De()]),a||await xe(),a||(ne(y,!1),R("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let Ee=K=>{r=!!K.detail?.enabled,i=K.detail?.models||{embedding:[],llm:[]},Z()};return window.addEventListener("judgment:test-mode",Ee),J(),Z(),await Promise.allSettled([ge(),De()]),await xe(),S=window.setInterval(async()=>{a||document.hidden||f||await xe()},2500),!s&&typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{a=!0,S&&window.clearInterval(S),window.removeEventListener("judgment:test-mode",Ee)}}var Dn={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var Hn={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},Un=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"tests",label:"\u7CFB\u7D71\u6E2C\u8A66",hint:"API\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u6A21\u578B Flow",icon:"terminal"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 Data \u2192 AI",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}];function Io(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Qe(e).label,tone:Qe(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function Po(e){let t=Qe(e.status),s=Dn[e.kind]||Dn.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${d(e.latency_ms)} ms</span>`;return`<article class="service-card">
    <div class="service-top">
      <span class="service-icon">${p(s,14)}</span>
      <span class="service-name" title="${n(e.name)}">${n(e.name)}</span>
      <span class="service-kind">${n(e.kind||"")}</span>
    </div>
    <div class="service-status">
      <span class="status-dot ${t.tone==="ok"?"is-ok":t.tone==="warn"?"is-warn":t.tone==="danger"?"is-danger":"is-idle"}" aria-hidden="true"></span>
      ${n(t.label)}
      ${a}
    </div>
    <p class="service-detail" title="${n(e.detail||"")}">${n(e.detail||"")}</p>
  </article>`}function Bo(e,t){return`<div class="arch-node ${e?"":"is-muted"}" ${e?"":'title="\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"'}>${n(t)}</div>`}function Do(e,t){if(e==="IndexedDB")return xa();let a={PostgreSQL:"postgres",Parquet:"parquet",Qdrant:"qdrant",Embedding:"embedding",Retriever:"rag","RAG Engine":"rag",LLM:"llm"}[e];return a?t.find(i=>i.id===a)?.status==="operational":!0}function Oo(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>Bo(Do(l,t),l)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${n(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),r=[];return a.forEach((i,o)=>{o&&r.push(`<div class="arch-arrow" aria-hidden="true">${p("arrowRight",15)}</div>`),r.push(i)}),`<div class="arch-flow">${r.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${p("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>`}function Fo(e){return!Array.isArray(e)||!e.length?'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>':`<div class="endpoint-list">
    ${e.map(t=>`<div class="endpoint-row">
          <span class="endpoint-method">${n(t.method)}</span>
          <span class="endpoint-path" title="${n(t.path)}">${n(t.path)}</span>
          <span class="endpoint-label">${n(t.label||"")}</span>
        </div>`).join("")}
  </div>`}function me(e,t){return`<div class="detail-row">
    <span class="detail-label">${n(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function Ho(e){return e?`<div class="detail-list">
    ${me("\u7248\u672C ID",`<strong>#${d(e.id)}</strong>`)}
    ${me("\u8CC7\u6599\u985E\u578B",pe("operational",e.source_type==="law"?"\u6CD5\u898F":"\u547D\u4EE4"))}
    ${me("\u4F86\u6E90\u66F4\u65B0\u65E5",`<strong>${n(e.update_date||"\u2014")}</strong>`)}
    ${me("\u6CD5\u898F / \u689D\u6587",`<strong>${d(e.law_count)} / ${d(e.article_count)}</strong>`)}
    ${me("\u4E0B\u8F09\u6642\u9593",`<span class="mono">${de(e.downloaded_at)}</span>`)}
    ${me("Parquet",`<code title="${n(e.parquet_path||"")}">${n(e.parquet_path||"\u2014")}</code>`)}
  </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}function Uo(e){if(!Array.isArray(e)||!e.length)return Ne({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${n(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${Wt(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function Jo(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=new Map(s.map($=>[$.id,$])),r=a.get("qdrant"),i=a.get("embedding"),o=a.get("rag"),l=a.get("llm"),m=Number(t.judgment_indexed_count||0),f=Number(t.judgment_count||0),S=f?(m/f*100).toFixed(1):"0.0",w=t.judgment_vector_points===null||t.judgment_vector_points===void 0?"\u2014":d(t.judgment_vector_points),_=Number(t.judgment_index_remaining||0),b=o?.status==="operational"?"RAG \u5C31\u7DD2":o?.status==="not_configured"?"\u672A\u8A2D\u5B9A":o?.status==="degraded"?"\u964D\u7D1A":"\u672A\u77E5",u=[["cube","Qdrant \u5411\u91CF\u7D22\u5F15",r],["layers",`Embedding\uFF08${t.judgment_vector_model||"\u2014"}\uFF09`,i],["brain","RAG \u56DE\u7B54\u7BA1\u7DDA",o],["sparkles","LLM \u6A21\u578B",l]];return`<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("database",14)}RAG \u8CC7\u6599\u73FE\u6CC1</span>
      ${pe(o?.status,b)}
    </div>
    <div class="side-card-body">
      <div class="mini-stats">
        <div class="mini-stat">
          <div class="mini-stat-value">${d(f)}</div>
          <div class="mini-stat-label">\u5224\u6C7A</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${d(m)}</div>
          <div class="mini-stat-label">\u5DF2\u7D22\u5F15</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${S}%</div>
          <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
        </div>
      </div>
      <div class="side-status-list">
        ${u.map(([$,I,z])=>`<div class="side-status-row">
              <span>${p($,13)}${n(I)}</span>
              ${pe(z?.status,z?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
            </div>`).join("")}
      </div>
      <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
        Collection\uFF1A${n(t.judgment_vector_collection||"\u2014")} \xB7
        ${w} points \xB7 \u5269\u9918 ${d(_)} \u7B46\u5F85\u7D22\u5F15
      </div>
    </div>
    <div class="side-card-foot">
      PostgreSQL \u5224\u6C7A\u6587\u4EF6\u3001Qdrant \u5411\u91CF\u7D22\u5F15\u8207 Ollama \u6A21\u578B\u72C0\u614B\u7686\u70BA\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u5C31\u7DD2\u6642\u6703\u660E\u78BA\u964D\u7D1A\u3002
    </div>
  </section>`}function Go(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=Io(e.status),r=s.find(f=>f.id==="qdrant"),i=s.find(f=>f.id==="rag"),o=s.find(f=>f.id==="llm"),l=at(),m=Hn[l]||l;return`<section class="status-hero">
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
          <span>${p("clock",11)} \u6AA2\u67E5\u6642\u9593 ${de(e.checked_at)} \xB7 ${n(_t(e.checked_at))}</span>
          <span>${p("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${p("database",11)} ${d(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${p("layers",11)} ${d(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${n(m)}">${p("link",11)} ${n(lt())}</span>
        </div>
      </div>
    </section>

    <div class="service-grid">${s.map(Po).join("")}</div>

    ${Jo(e)}

    <div class="status-summary">
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u6CD5\u898F</div>
        <div class="metric-value">${d(t.law_count)}</div>
        <div class="metric-foot">source_type = law</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u547D\u4EE4</div>
        <div class="metric-value">${d(t.order_count)}</div>
        <div class="metric-foot">source_type = order</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u689D\u6587\u7E3D\u6578</div>
        <div class="metric-value">${d(t.article_count)}</div>
        <div class="metric-foot">\u73FE\u884C\u7248\u672C\u5408\u8A08</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u8CC7\u6599\u7248\u672C</div>
        <div class="metric-value">${d(t.version_count)}</div>
        <div class="metric-foot">\u539F\u59CB Parquet \u7248\u672C</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u4E0B\u8F09\u57F7\u884C</div>
        <div class="metric-value">${d(t.run_count)}</div>
        <div class="metric-foot">\u542B\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557</div>
      </div>
    </div>

    ${r?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${ie({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${n(r?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${n(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${n(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}`}function Qo(e){let t=Array.isArray(e.services)?e.services:[],s=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Data \u2192 Intelligence</div>
      </div>
      <span class="badge badge-neutral badge-mono">${d((s.flow||[]).length)} layers</span>
    </div>
    ${Oo(s,t)}
  </div>`}function zo(e){let t=at(),s=Hn[t]||t,a=Je("/api/docs"),r=Je("/api/openapi.json");return`<div class="status-columns is-single">
    <section class="card">
      <div class="side-card-head">
        <span class="side-card-title">${p("terminal",14)}API \u7AEF\u9EDE</span>
        <a href="${n(a)}" target="_blank" rel="noopener noreferrer" class="chip"
          >OpenAPI ${p("external",11)}</a>
      </div>
      ${Fo(e.endpoints)}
      <div class="side-card-foot">
        \u76EE\u524D API Base\uFF1A<code>${n(lt())}</code>\uFF08${n(s)}\uFF09\u3002\u4E92\u52D5\u5F0F API \u6587\u4EF6\u4F4D\u65BC <a href="${n(a)}" target="_blank" rel="noopener noreferrer"><code>${n(a)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${n(r)}" target="_blank" rel="noopener noreferrer"><code>${n(r)}</code></a>\u3002
      </div>
    </section>
  </div>`}function Vo(e){let t=e.data||{},s=Number(t.judgment_indexed_count||0),a=Number(t.judgment_count||0),r=a?(s/a*100).toFixed(1):"0.0",i=Number(t.judgment_index_remaining||0);return`<div class="status-summary">
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u6CD5\u898F</div>
        <div class="metric-value">${d(t.law_count)}</div>
        <div class="metric-foot">source_type = law</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u547D\u4EE4</div>
        <div class="metric-value">${d(t.order_count)}</div>
        <div class="metric-foot">source_type = order</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u689D\u6587\u7E3D\u6578</div>
        <div class="metric-value">${d(t.article_count)}</div>
        <div class="metric-foot">\u73FE\u884C\u7248\u672C\u5408\u8A08</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u8CC7\u6599\u7248\u672C</div>
        <div class="metric-value">${d(t.version_count)}</div>
        <div class="metric-foot">\u539F\u59CB Parquet \u7248\u672C</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u5224\u6C7A\u7D22\u5F15</div>
        <div class="metric-value">${d(t.judgment_indexed_count)}</div>
        <div class="metric-foot">/ ${d(t.judgment_count)} \u7B46\u5224\u6C7A \xB7 \u8986\u84CB ${r}%</div>
      </div>
    </div>
    <div class="status-columns is-single">
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${p("layers",14)}\u6700\u65B0\u8CC7\u6599\u7248\u672C</span>
          ${pe("operational","Parquet")}
        </div>
        ${Ho(t.last_version)}
        <div class="side-card-foot">
          \u539F\u59CB Parquet \u5408\u8A08 ${ae(t.parquet_bytes)}\uFF1BPostgreSQL \u4FDD\u5B58 metadata \u8207\u7248\u672C\u72C0\u614B\u3002
        </div>
      </section>
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${p("database",14)}\u8CC7\u6599\u96C6\u7D71\u8A08</span>
          <span class="badge badge-neutral badge-mono">${d(t.parquet_files)} FILES</span>
        </div>
        <div class="detail-list">
          ${me("\u73FE\u884C\u6CD5\u898F",`<strong>${d(t.law_count)}</strong>`)}
          ${me("\u73FE\u884C\u547D\u4EE4",`<strong>${d(t.order_count)}</strong>`)}
          ${me("\u689D\u6587\u7E3D\u6578",`<strong>${d(t.article_count)}</strong>`)}
          ${me("\u539F\u59CB Parquet",`<strong>${ae(t.parquet_bytes)}</strong>`)}
          ${me("\u5224\u6C7A\u6587\u4EF6",`<strong>${d(t.judgment_count)}</strong>`)}
          ${me("\u5411\u91CF\u7D22\u5F15",`<strong>${d(t.judgment_indexed_count)}</strong> / ${d(t.judgment_count)}\uFF08${d(t.judgment_vector_points)} points\uFF09`)}
          ${me("\u7D22\u5F15\u8986\u84CB",`<strong>${r}%</strong> \xB7 \u5269\u9918 ${d(i)} \u7B46`)}
          ${me("\u7D22\u5F15\u7248\u672C",`<strong>#${d(t.judgment_vector_version_id)}</strong> \xB7 ${n(t.judgment_vector_version_status||"legacy")}`)}
          ${me("Alias",`<code>${n(t.judgment_vector_alias||"\u2014")}</code> \u2192 <code>${n(t.judgment_vector_collection||"\u2014")}</code>`)}
          ${me("\u7D22\u5F15\u6A21\u578B",`<code>${n(t.judgment_vector_model||"\u2014")}</code>`)}
          ${me("\u6700\u8FD1\u7D22\u5F15",`<span class="mono">${de(t.judgment_indexed_at)}</span>`)}
        </div>
      </section>
    </div>`}function Wo(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${p("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${d(t.run_count)} TOTAL</span>
    </div>
    ${Uo(e.recent_runs)}
  </section>`}function Ko(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function Jn(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function bt(e,t,s,a,r){let i=Ko(r);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${p(t,14)}${n(e)}</span>
      <strong>${n(s)}</strong>
    </div>
    ${Jn(r,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function Yo(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${p("layers",14)}Docker</span>
        ${pe("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${n(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,m=o.service?0:1;return l-m||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${n(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${n(i.service)}</span>`:""}</td>
        <td>${pe(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
        <td class="cell-number">${i.cpu_percent===null||i.cpu_percent===void 0?"\u2014":`${d(i.cpu_percent)}%`}</td>
        <td class="cell-number">${ae(i.memory_used)}${i.memory_limit?` / ${ae(i.memory_limit)}`:""}</td>
        <td class="mono">${n(i.net_io||"\u2014")}</td>
        <td class="mono">${n(i.block_io||"\u2014")}</td>
        <td class="cell-number">${d(i.pids)}</td>
      </tr>`).join(""),r=(t.system||[]).map(i=>`<span class="resource-docker-pill">
        <strong>${n(i.type||"\u2014")}</strong>
        <span>${d(i.count)} \xB7 ${n(i.size||"\u2014")}</span>
      </span>`).join("");return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${p("layers",14)}Docker \u5BB9\u5668\u4F7F\u7528\u8CC7\u6E90</span>
      <span class="badge badge-ok badge-mono">${d(s.length)} \u500B\u5BB9\u5668</span>
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
  </section>`}function Xo(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",r=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${me("\u8CC7\u6599\u5EAB",`<code>${n(s.database||"\u2014")}</code>`)}
           ${me("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${ae(s.storage_bytes)}</strong>`)}
           ${me("Docker volume",`<strong>${ae(s.volume_bytes)}</strong>${s.volume_name?` <code>${n(s.volume_name)}</code>`:""}`)}
           ${me("\u9023\u7DDA\u6578",`<strong>${d(s.connections)}</strong>`)}`:`${me("Collection",`<code>${n(s.collection||"\u2014")}</code>`)}
           ${me("Docker volume",`<strong>${ae(s.volume_bytes)}</strong>${s.volume_name?` <code>${n(s.volume_name)}</code>`:""}`)}
           ${me("\u5411\u91CF\u9EDE\u6578",`<strong>${d(s.points_count)}</strong>`)}
           ${me("Collections",`<strong>${d(s.collections)}</strong>`)}
           ${me("Segments",`<strong>${d(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${n(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${n(s.kind||"")}</div>
          </div>
          ${pe(i)}
        </div>
        <div class="resource-db-metrics">
          <div><span>CPU</span><strong>${s.cpu_percent===null||s.cpu_percent===void 0?"\u2014":`${d(s.cpu_percent)}%`}</strong></div>
          <div><span>RAM</span><strong>${ae(s.memory_used)}</strong><small>${s.memory_limit?` / ${ae(s.memory_limit)}`:""}</small></div>
          <div><span>\u5BB9\u5668</span><strong class="mono">${n(s.container||"\u2014")}</strong><small>${n(s.container_status||"\u2014")}</small></div>
        </div>
        <div class="detail-list">${o}</div>
        ${r.length?`<div class="resource-table-wrap">
                <table class="data-table is-compact">
                  <thead><tr><th scope="col">\u8CC7\u6599\u8868</th><th scope="col">\u5927\u5C0F</th></tr></thead>
                  <tbody>${r.map(l=>`<tr>
                        <td class="mono">${n(l.name||"\u2014")}</td>
                        <td class="cell-number">${ae(l.bytes)}</td>
                      </tr>`).join("")}</tbody>
                </table>
              </div>`:""}
        <div class="side-card-foot">${n(s.detail||"")}</div>
      </article>`}).join("")}</div>`}function Mt(e,t,s,a){let r=Number(t)||0,i=a?r/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${n(e)}</span>
      <strong>${ae(r)}</strong>
    </div>
    ${Jn(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function Zo(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},r=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},m=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${p("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${ae(m)}</span>
    </div>
    <div class="storage-list">
      ${Mt("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${n(s.frontend_path||"\u2014")}</span>`,m)}
      ${Mt("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${n(s.backend_path||"\u2014")}</span>`,m)}
      ${Mt("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",r.layers_bytes,`Images ${ae(r.images_bytes)} \xB7 Containers ${ae(r.containers_bytes)} \xB7 Build cache ${ae(r.build_cache_bytes)}`,m)}
      ${Mt("PostgreSQL volume",o.size_bytes,`<span class="mono">${n(o.name||"\u2014")}</span>`,m)}
      ${Mt("Qdrant volume",l.size_bytes,`<span class="mono">${n(l.name||"\u2014")}</span>`,m)}
      ${Mt("Parquet",a.total_bytes,`\u6CD5\u898F ${ae(a.law_bytes)} \xB7 \u5224\u6C7A ${ae(a.judgment_bytes)}`,m)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${ae(m)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function el(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},r=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),m=Array.isArray(e.disk)?e.disk:[],f=m[0]||{},S=Number(o.total_bytes||f.total||0),w=S?l/S*100:0,_=[s.load_1,s.load_5,s.load_15].map($=>$??"\u2014").join(" / "),b=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":Y(Number(t.uptime_seconds)*1e3),u=[f.label?bt("HDD \u5DF2\u4F7F\u7528","database",`${d(f.percent)}%`,`${ae(f.used)} / ${ae(f.total)} \xB7 \u5269\u9918 ${ae(f.free)}<br><span class="mono">${n(f.path||"")}</span>`,f.percent):"",l?bt("Judgment \u5143\u4EF6\u5408\u8A08","layers",ae(l),`\u7D04\u5360 HDD ${d(w)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,w):"",...m.slice(1).map($=>bt(`\u786C\u789F \xB7 ${$.label}`,"layers",`${d($.percent)}%`,`${ae($.used)} / ${ae($.total)} \xB7 \u5269\u9918 ${ae($.free)}<br><span class="mono">${n($.path||"")}</span>`,$.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${de(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${bt("CPU \u4F7F\u7528\u7387","cpu",`${d(s.percent)}%`,`${d(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${d(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${n(_)}`,s.percent)}
      ${bt("\u8A18\u61B6\u9AD4","server",`${d(a.percent)}%`,`${ae(a.used)} / ${ae(a.total)} \xB7 \u53EF\u7528 ${ae(a.available)}`,a.percent)}
      ${bt("Swap","layers",`${d(r.percent)}%`,`${ae(r.used)} / ${ae(r.total)}`,r.percent)}
      ${bt("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${d(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${n(b)}<br>${n(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${u||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${Zo(e)}
    ${Yo(e)}
    ${Xo(e)}`}function On(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function tl(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SYSTEM RESOURCE USAGE</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${ie({tone:"danger",title:"\u8CC7\u6E90 API \u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-resources-retry">
          ${p("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function sl(e,t,s){let a=e?.data||{},r=e?Qe(e.status):null,i=s?Qe(s.status):null,o={overview:r?`<span class="badge ${r.tone==="ok"?"badge-ok":r.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${n(r.label)}</span>`:"",resources:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${n(i.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${d(a.version_count)}</span>`,tests:'<span class="badge badge-neutral badge-mono">TEST</span>',runs:`<span class="badge badge-neutral badge-mono">${d(a.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${Un.map(l=>{let m=l.id===t;return`<button class="status-tab${m?" is-active":""}" type="button"
          data-status-tab="${l.id}" ${m?'aria-current="page"':""}>
          <span class="status-tab-icon">${p(l.icon,15)}</span>
          <span class="status-tab-copy">
            <strong>${n(l.label)}</strong>
            <small>${n(l.hint)}</small>
          </span>
          ${o[l.id]||""}
        </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u6AA2\u67E5\u6642\u9593</span>
      <span class="mono">${n(e?de(e.checked_at):"\u2014")}</span>
    </div>`}function al(e,t,s,a,r){return e==="resources"?s?el(s):a?On():r?tl(r):On():e==="architecture"?Qo(t):e==="api"?zo(t):e==="data"?Vo(t):e==="runs"?Wo(t):Go(t)}function nl(){return`<div class="status-hero">
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
    </div>`}function Fn(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u5FEB\u53D6\u6216\u63A8\u6E2C\u7684\u670D\u52D9\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${ie({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${p("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function rl(e,t){let s=!1,a=null,r=null,i="overview",o=null,l=!1,m=null,f=!1,S=!1,w=null,_=0;e.innerHTML=`<section class="page status-page">
    <div class="page-header">
      <div>
        <div class="eyebrow">OBSERVABILITY</div>
        <h1 class="page-title">\u7CFB\u7D71\u67B6\u69CB\u8207\u670D\u52D9\u72C0\u614B</h1>
        <p class="page-subtitle">\u6AA2\u8996\u524D\u7AEF\u3001FastAPI\u3001PostgreSQL\u3001Parquet \u8207 AI \u5143\u4EF6\u7684\u5373\u6642\u5065\u5EB7\u72C0\u614B\uFF0C
          \u4E26\u5F9E\u5DE6\u5074\u5206\u985E\u5207\u63DB\u670D\u52D9\u7E3D\u89BD\u3001\u7CFB\u7D71\u6E2C\u8A66\u3001\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528\u3001\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u4E0B\u8F09\u7D00\u9304\u3002</p>
      </div>
      <div class="page-actions">
        <label class="auto-refresh">
          <input type="checkbox" id="auto-refresh" />
          \u81EA\u52D5\u66F4\u65B0 30s
        </label>
        <button class="btn btn-secondary" type="button" id="refresh-status">
          ${p("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
          ${Array.from({length:7}).map(()=>'<div class="skeleton skeleton-line" style="width:100%;height:52px;margin-top:8px"></div>').join("")}
        </div>
      </aside>
      <section class="status-panel" id="status-content">${nl()}</section>
    </div>
  </section>`;let b=e.querySelector("#status-nav"),u=e.querySelector("#status-content"),$=e.querySelector("#refresh-status"),I=e.querySelector("#auto-refresh"),z=()=>{if(_+=1,typeof w=="function")try{w()}catch{}w=null,f=!1,S=!1},E=async()=>{let se=++_;S=!0,u.innerHTML="";try{let U=await la(u,{setTitle:()=>{}},{embedded:!0});if(se!==_||i!=="tests"){typeof U=="function"&&U();return}w=typeof U=="function"?U:null,f=!0}catch(U){se===_&&i==="tests"&&(u.innerHTML=Fn(U))}finally{se===_&&(S=!1)}},B=()=>{if(r){if(b.innerHTML=sl(r,i,o),i==="tests"){!f&&!S&&E();return}z(),u.innerHTML=al(i,r,o,l,m)}},V=async({quiet:se=!1}={})=>{if(!l){l=!0,m=null,i==="resources"&&B();try{let U=await G.systemUsage();if(s)return;o=U}catch(U){if(s)return;m=U,se||R(U.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{s||(l=!1,i==="resources"&&B())}}},ee=async({quiet:se=!1}={})=>{se||($.disabled=!0,ne($,!0,"\u6AA2\u67E5\u4E2D\u2026"));try{let U=await G.status();if(s)return;r=U,B(),se||R("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(U){if(s)return;i!=="tests"&&(u.innerHTML=Fn(U)),se||R(U.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||($.disabled=!1,ne($,!1))}},re=async({quiet:se=!1}={})=>{if(await ee({quiet:se}),i==="resources"&&await V({quiet:se}),!se&&i==="tests"){let U=u.querySelector("#tests-refresh");U&&U.click()}};return b.addEventListener("click",se=>{let U=se.target.closest("[data-status-tab]");if(!U)return;let F=U.dataset.statusTab;Un.some(h=>h.id===F)&&(i=F,B(),i==="resources"&&!o&&!l&&V())}),u.addEventListener("click",se=>{se.target.closest("#status-retry")&&ee(),se.target.closest("#status-resources-retry")&&V()}),$.addEventListener("click",()=>re()),I.addEventListener("change",()=>{a&&(window.clearInterval(a),a=null),I.checked&&(a=window.setInterval(()=>re({quiet:!0}),3e4),R("\u5DF2\u555F\u7528\u6BCF 30 \u79D2\u81EA\u52D5\u66F4\u65B0\u3002","info",2200))}),await ee({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,z(),a&&window.clearInterval(a)}}var Gn="rag",hs={rag:{page:ta,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:Ks,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:oa,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:Xs,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:sa,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:ca,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:gs,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"}},fs=document.getElementById("app-main"),vs=null,bs=0;function il(){return`<div class="page-loading" aria-live="polite">
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-subtitle"></div>
    <div class="skeleton-grid">
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
    </div>
  </div>`}function ua(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||Gn;return Object.prototype.hasOwnProperty.call(hs,t)?t:Gn}function ol(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function ll(e){return`<section class="page">
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
          <span class="notice-icon" aria-hidden="true">${p("alert",12)}</span>
          <div class="notice-body">
            <strong>\u7121\u6CD5\u5EFA\u7ACB\u9801\u9762</strong>
            <p>${n(e.message||"\u672A\u77E5\u932F\u8AA4")}</p>
          </div>
        </div>
        <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
          <button class="btn btn-secondary btn-sm" type="button" id="route-retry">
            ${p("refresh",14)}<span>\u91CD\u65B0\u8F09\u5165</span>
          </button>
        </div>
      </div>
    </div>
  </section>`}async function da(){let e=ua(),t=++bs;if(ol(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof vs=="function"){try{vs()}catch{}vs=null}document.title=hs[e].title,fs.innerHTML=il(),fs.focus({preventScroll:!0}),window.scrollTo({top:0,behavior:"auto"});let s={route:e,navigate(a){hs[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===bs&&a&&(document.title=a)}};try{let a=await hs[e].page.render(fs,s);if(t!==bs){typeof a=="function"&&a();return}vs=typeof a=="function"?a:null}catch(a){if(t!==bs)return;console.error("Failed to render route",e,a),fs.innerHTML=ll(a);let r=document.getElementById("route-retry");r&&r.addEventListener("click",()=>da()),R("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function cl(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable)||ua()!=="rag")return;let a=document.getElementById("rag-question");a&&(e.preventDefault(),a.focus())})}function Qn(){Sa(),cl(),window.addEventListener("hashchange",da),da(),zt()&&window.setTimeout(()=>{ua()!=="tests"&&(window.location.hash="#/tests")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Qn):Qn();})();
