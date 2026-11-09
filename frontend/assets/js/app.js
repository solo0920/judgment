(()=>{var Qn=Object.defineProperty;var rt=(e,t)=>{for(var s in t)Qn(e,s,{get:t[s],enumerable:!0})};var qs="judgment.api_base",As="http://127.0.0.1:9200",qe=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function ma(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function Ze(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${ma(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function Ls(e){let t=Ze(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function Ms(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?Ze(e.get("api")):null}catch{return null}}function Ts(){try{let e=window.localStorage.getItem(qs);return e===null?null:Ze(e)}catch{return null}}function js(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return Ze(e||"")}function et(){let e=Ms();if(e!==null)return e;let t=Ts();if(t!==null)return t;let s=js();return s||(window.location.protocol==="file:"?As:"")}function Gn(){if(Ms()!==null)return!0;let e=Ts();return e!==null?!!e:!!js()}function tt(){return Ms()!==null?"query":Ts()!==null?"storage":js()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function Jt(){return Gn()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!ma(window.location.hostname)}function Es(e){let t=Ze(e);try{t?window.localStorage.setItem(qs,t):window.localStorage.removeItem(qs)}catch{}return t}function it(e=et()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function Fe(e,t=et()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function Rs(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function ee(e,t={}){let s=et(),a=new AbortController,r=t.timeout===void 0?3e4:t.timeout,i=r>0?window.setTimeout(()=>a.abort(),r):null,o=Date.now(),l=performance.now(),p=t.requestId||ga(),b={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":p,"X-Judgment-Client-Started-At":String(o),...t.headers||{}},k;try{k=await fetch(Fe(e,s),{...t,headers:b,signal:a.signal})}catch(w){throw w.name==="AbortError"?new qe("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new qe(Rs(s),0,w)}finally{i&&window.clearTimeout(i)}let h=null;if((k.headers.get("content-type")||"").includes("application/json"))try{h=await k.json()}catch{h=null}else try{h=await k.text()}catch{h=null}let S=performance.now(),f=k.headers.get("X-Judgment-Request-Id")||p;if(t.trackClient!==!1&&f){let w=Math.round(performance.now()-l);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{fa({request_id:f,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:w,render_ms:Math.max(0,Math.round(performance.now()-S)),status:k.ok?"success":"failed"})})})}if(!k.ok){let w=h&&typeof h=="object"?h.detail||h.message:h,E=typeof w=="string"&&w?w:`\u4F3A\u670D\u5668\u56DE\u61C9 ${k.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new qe(E,k.status,w)}return h}function ga(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function fa(e){try{fetch(Fe("/api/performance/client",et()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),keepalive:!0}).catch(()=>{})}catch{}}async function va(e){let t=Ze(e);if(!Ls(t))throw new qe("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,r=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(Fe("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new qe(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof qe?i:i.name==="AbortError"?new qe("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new qe(Rs(t),0,i)}finally{window.clearTimeout(r)}}var J={health(){return ee("/api/health")},status(){return ee("/api/status",{trackClient:!1})},systemUsage(){return ee("/api/system-usage",{trackClient:!1})},indexVersions(){return ee("/api/index-versions",{trackClient:!1})},indexVersion(e){return ee(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return ee(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return ee(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return ee("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){let t=new URLSearchParams({repair:e?"true":"false"});return ee(`/api/index-alias/reconcile?${t.toString()}`,{trackClient:!1})},catalog(){return ee("/api/catalog")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return ee("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},schemaSuggest({database:e,table:t,column:s,query:a,limit:r=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(r)});return ee(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let r=new URLSearchParams({law_key:e});return t&&r.set("source_type",t),s&&r.set("version_id",String(s)),a&&r.set("article_no",String(a)),ee(`/api/law?${r.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),ee(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return ee("/api/test-mode",{trackClient:!1})},setTestMode(e){return ee("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return ee(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return ee("/api/test-runs/current",{trackClient:!1})},testRun(e){return ee(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return ee("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[r,i]of Object.entries(e))i==null||i===""||a.set(r,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),ee(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return ee("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return ee("/api/processing",{timeout:45e3,trackClient:!1})},questionBankStats(){return ee("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[r,i]of Object.entries(e))i==null||i===""||a.set(r,String(i));return a.set("limit",String(t)),a.set("offset",String(s)),ee(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return ee(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return ee("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateQuestionBankItem(e,t){return ee(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return ee(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return ee(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return ee("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return ee(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return ee("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return ee(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return ee("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return ee("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return ee(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return ee(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return ee(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return ee("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return ee(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return ee(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return ee(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return ee("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return ee(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return ee("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return ee(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return ee("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return ee("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return ee("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onToken:r=null,onTokenReset:i=null}={}){let o=et(),l=new AbortController,p=t?0:3e5,b=p>0?window.setTimeout(()=>l.abort(),p):null,k=Date.now(),h=performance.now(),y=ga(),S={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":y,"X-Judgment-Client-Started-At":String(k)},f;try{f=await fetch(Fe("/api/rag/query/stream",o),{method:"POST",headers:S,body:JSON.stringify({question:e}),signal:l.signal})}catch(te){throw te.name==="AbortError"?new qe("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new qe(Rs(o),0,te)}finally{b&&window.clearTimeout(b)}if(!f.ok){let te=null;try{te=await f.json()}catch{te=null}let R=te&&typeof te=="object"&&te.detail?String(te.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${f.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new qe(R,f.status,te)}if(!f.body)throw new qe("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let w=f.body.getReader(),E=new TextDecoder,I="",L=null,O=null;try{for(;;){let{value:te,done:R}=await w.read();if(R)break;I+=E.decode(te,{stream:!0});let N=I.indexOf(`

`);for(;N>=0;){let F=I.slice(0,N).replace(/\r/g,"");I=I.slice(N+2);let A="message",u=[];for(let g of F.split(`
`))g.startsWith("event:")?A=g.slice(6).trim():g.startsWith("data:")&&u.push(g.slice(5).trimStart());if(u.length){let g=null;try{g=JSON.parse(u.join(`
`))}catch{g=null}if(g)if(A==="step"&&typeof s=="function")try{s(g)}catch{}else if(A==="partial"){if(typeof a=="function")try{a(g)}catch{}}else if(A==="token"){if(typeof r=="function")try{r(String(g.text||""))}catch{}}else if(A==="token_reset"){if(typeof i=="function")try{i()}catch{}}else A==="result"?L=g:A==="error"&&(O=new qe(g.message||g.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,g))}N=I.indexOf(`

`)}}}finally{try{await w.cancel()}catch{}b&&window.clearTimeout(b)}if(O)throw O;if(!L)throw new qe("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let X=Math.round(performance.now()-h);return fa({request_id:y,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:X,render_ms:0,status:"success"}),L}};var zn={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Vn={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},Wn={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},Kn={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},ba={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',more:'<path d="M5 12h.01M12 12h.01M19 12h.01"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function n(e){return String(e??"").replace(/[&<>"']/g,t=>zn[t])}function m(e,t=16,s=""){let a=ba[e]||ba.info;return`<svg${s?` class="${n(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function d(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function ae(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function Cs(e){if(e instanceof Date)return e;if(typeof e=="number"){let r=new Date(e);return Number.isNaN(r.getTime())?null:r}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function He(e){let t=Cs(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?n(e):"\u2014"}function de(e){let t=Cs(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?n(e):"\u2014"}function wt(e){let t=Cs(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:He(t)}function W(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Ue(e){return Vn[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function ue(e,t){let s=Ue(e);return`<span class="badge ${Wn[s.tone]}"><span class="status-dot ${Kn[s.tone]}"></span>${n(t||s.label)}</span>`}function Yn(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${n(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function Qt(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function Gt(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return ue(String(e));case"source":return Yn(String(e));case"number":return`<span class="mono">${d(e)}</span>`;case"duration":return`<span class="mono">${W(e)}</span>`;case"datetime":return`<span class="mono">${de(e)}</span>`;case"date":return`<span class="mono">${He(e)}</span>`;case"url":{let s=String(e),a=Qt(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${n(s)}" target="_blank" rel="noopener noreferrer" title="${n(s)}">${m("external",10)}${n(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${n(s)}">${n(Qt(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(Qt(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(Qt(s,90))}</span>`}}}function ie({tone:e="info",title:t,text:s,iconName:a="info"}){let r=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${r==="i"?"i":m(r,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${n(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function je({iconName:e="search",title:t,text:s="",actions:a="",className:r=""}){return`<div class="empty-state ${r}">
    <span class="empty-icon">${m(e,24)}</span>
    <h3 class="empty-title">${n(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function re(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${n(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function j(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let r={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${r[t]||"i"}</span>
    <div class="toast-body">${n(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function _t(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function Je(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),r=URL.createObjectURL(a),i=document.createElement("a");i.href=r,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(r),1e3)}var ya="judgment.theme",Ns="nvidia",$a=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#171717","#0070f3","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#1d1d1f","#0071e3","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#5e6ad2","#010102","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#f24e1e","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#191918","#0075de","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],Ps=new Map($a.map(e=>[e.id,e]));function Xn(e){return Ps.has(e)}function Zn(e){return Ps.get(e)||Ps.get(Ns)}function er(){try{let e=window.localStorage.getItem(ya);return Xn(e)?e:Ns}catch{return Ns}}function ha(e,{persist:t=!0}={}){let s=Zn(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");a&&a.setAttribute("content",s.metaColor);let r=document.getElementById("theme-label");r&&(r.textContent=s.name);let i=document.getElementById("theme-swatches");if(i&&(i.innerHTML=s.swatches.map(o=>`<i class="style-swatch" style="--swatch:${n(o)}"></i>`).join("")),document.querySelectorAll(".theme-option").forEach(o=>{let l=o.dataset.themeId===s.id;o.classList.toggle("is-active",l),o.setAttribute("aria-checked",l?"true":"false")}),t)try{window.localStorage.setItem(ya,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}function tr(e){let t=$a.map((s,a)=>{let r=s.swatches.map(i=>`<i style="--swatch:${n(i)}"></i>`).join("");return`<button class="theme-option" type="button" role="menuitemradio"
        data-theme-id="${s.id}" aria-checked="false">
        <span class="theme-option-index">${String(a+1).padStart(2,"0")}</span>
        <span class="theme-option-body">
          <span class="theme-option-name">${n(s.name)}</span>
          <span class="theme-option-desc">${n(s.description)}</span>
        </span>
        <span class="theme-option-swatches" aria-hidden="true">${r}</span>
        <span class="theme-option-check" aria-hidden="true">${m("check",14)}</span>
      </button>`}).join("");e.innerHTML=`<div class="style-menu-head">
      <strong>\u9078\u64C7\u4ECB\u9762\u98A8\u683C</strong>
      <span>10 \u7A2E\u79D1\u6280\u54C1\u724C\u8A9E\u8A00</span>
    </div>${t}`}function wa(){let e=document.getElementById("style-picker"),t=document.getElementById("style-trigger"),s=document.getElementById("style-menu");if(!e||!t||!s)return;tr(s),ha(er(),{persist:!1});let a=()=>Array.from(s.querySelectorAll(".theme-option")),r=()=>{s.hidden=!1,t.setAttribute("aria-expanded","true");let o=s.querySelector(".theme-option.is-active")||a()[0];o&&o.focus()},i=({restoreFocus:o=!1}={})=>{s.hidden||(s.hidden=!0,t.setAttribute("aria-expanded","false"),o&&t.focus())};t.addEventListener("click",()=>{s.hidden?r():i({restoreFocus:!0})}),t.addEventListener("keydown",o=>{(o.key==="ArrowDown"||o.key==="ArrowUp")&&(o.preventDefault(),r())}),s.addEventListener("click",o=>{let l=o.target.closest(".theme-option");l&&(ha(l.dataset.themeId),i({restoreFocus:!0}))}),s.addEventListener("keydown",o=>{let l=a(),p=l.indexOf(document.activeElement);if(o.key==="Escape"){o.preventDefault(),i({restoreFocus:!0});return}if(o.key==="ArrowDown"||o.key==="ArrowUp"){o.preventDefault();let b=o.key==="ArrowDown"?1:-1,k=l[(p+b+l.length)%l.length];k&&k.focus();return}if(o.key==="Home"||o.key==="End"){o.preventDefault();let b=o.key==="Home"?l[0]:l[l.length-1];b&&b.focus()}}),document.addEventListener("pointerdown",o=>{e.contains(o.target)||i()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&i()})}var Zs={};rt(Zs,{render:()=>Mi});var sr="judgment-console";var Ee="query_history",st="settings";var Le={history:[],settings:new Map,nextId:1},zt=null,Me=!("indexedDB"in window);function ot(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function Qe(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function Ve(){return zt||(zt=new Promise((e,t)=>{if(!("indexedDB"in window)){Me=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(sr,1)}catch(a){Me=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(Ee)){let r=a.createObjectStore(Ee,{keyPath:"id",autoIncrement:!0});r.createIndex("created_at","created_at"),r.createIndex("kind","kind")}a.objectStoreNames.contains(st)||a.createObjectStore(st,{keyPath:"key"})},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{Me=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{Me=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),zt)}function _a(){return"indexedDB"in window}function ka(){return Me}function Vt(){return Me?"memory":"indexeddb"}function ar(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},turns:Array.isArray(e.turns)?e.turns:[],pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t,updated_at:e.updated_at||t}}async function nr(){try{let t=(await Ve()).transaction(Ee,"readwrite"),s=t.objectStore(Ee),a=await ot(s.count());if(a>120){let r=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let p=i.result;if(!p||r<=0){o();return}p.delete(),r-=1,p.continue()},i.onerror=()=>l(i.error)})}await Qe(t)}catch{Me=!0}}async function Tt(e){let t=ar(e);try{let a=(await Ve()).transaction(Ee,"readwrite"),r=a.objectStore(Ee),i=await ot(r.add(t));return await Qe(a),await nr(),i}catch{Me=!0;let a=Le.nextId++;return Le.history.push({id:a,...t}),Le.history.length>120&&Le.history.shift(),a}}async function jt(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let r=(await Ve()).transaction(Ee,"readwrite"),i=r.objectStore(Ee),o=await ot(i.get(s));if(!o)return await Qe(r),null;let l={...o,...t,id:s};return await ot(i.put(l)),await Qe(r),l}catch{Me=!0;let r=Le.history.findIndex(i=>Number(i.id)===s);return r===-1?null:(Le.history[r]={...Le.history[r],...t,id:s},Le.history[r])}}async function Sa(e){let t=Number(e);if(!Number.isFinite(t))return!1;try{let a=(await Ve()).transaction(Ee,"readwrite");return a.objectStore(Ee).delete(t),await Qe(a),!0}catch{Me=!0;let a=Le.history.findIndex(r=>Number(r.id)===t);return a===-1?!1:(Le.history.splice(a,1),!0)}}async function Wt({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let r=(await Ve()).transaction(Ee,"readonly"),i=r.objectStore(Ee),o=await ot(i.getAll());return await Qe(r),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,p)=>String(p.updated_at||p.created_at).localeCompare(String(l.updated_at||l.created_at))).slice(0,t)}catch{return Me=!0,Le.history.filter(r=>s?`${r.kind} ${r.title} ${r.detail}`.toLowerCase().includes(s):!0).slice().sort((r,i)=>String(i.updated_at||i.created_at).localeCompare(String(r.updated_at||r.created_at))).slice(0,t)}}async function xa(){try{let t=(await Ve()).transaction(Ee,"readwrite");t.objectStore(Ee).clear(),await Qe(t)}catch{Me=!0}Le.history=[]}async function Kt(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let r=(await Ve()).transaction(st,"readwrite");return r.objectStore(st).put(s),await Qe(r),s}catch{return Me=!0,Le.settings.set(s.key,s),s}}async function lt(e,t=null){try{let a=(await Ve()).transaction(st,"readonly"),r=a.objectStore(st),i=await ot(r.get(String(e)));return await Qe(a),i?i.value:t}catch{Me=!0;let a=Le.settings.get(String(e));return a?a.value:t}}async function qa({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await Ve()).transaction(st,"readonly"),r=a.objectStore(st),i=await ot(r.getAll());return await Qe(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return Me=!0,Array.from(Le.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function Aa(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var Ks={};rt(Ks,{render:()=>ui,renderTestFlowPanel:()=>xt});var rr={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},ir=new Set(["running","stopping"]);function Xt(e){let[t,s]=rr[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${n(t)}</span>`}function Yt(e){return String(e).padStart(2,"0")}function kt(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${Yt(t.getMonth()+1)}-${Yt(t.getDate())} ${Yt(t.getHours())}:${Yt(t.getMinutes())}`}function Rt(e){return ir.has(e)}function We(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function ct(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function at(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${n(e)}</span>
    <strong>${n(String(t))}</strong>
    ${s?`<small>${n(s)}</small>`:""}
  </div>`}function La(e={}){let t=e.score_components||e;return`<div class="bench-metrics">
    ${at("Law Recall",ct(t.law_recall))}
    ${at("Article Recall",ct(t.article_recall))}
    ${at("Citation Valid",ct(t.citation_valid_rate))}
    ${at("Judge",We(t.judge_overall))}
    ${at("Human",We(t.human_overall))}
    ${at("p50",W(e.duration_p50_ms))}
    ${at("p95",W(e.duration_p95_ms))}
    ${at("Success",`${d(e.success||0)} / ${d(e.total||0)}`)}
  </div>`}function Ma(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${n(s.replace(/^rag\./,""))}</span>
      <strong>${W(a.p50_ms)}</strong>
      <small>p95 ${W(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function Ta(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${ct(s.law_recall)}</span>
    <span>Article ${ct(s.article_recall)}</span>
    <span>Judge ${We(s.judge_overall)}</span>
    <span>p95 ${W(t.duration_p95_ms)}</span>`}function ja(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function Ea(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${n(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${n(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${n(e.status||"")}">${Xt(e.status)}</span>
      <span class="mono">${n(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${n(de(e.started_at))}</span>
      <span data-bench-slot="run-completed">${d(e.completed_cases||0)} / ${d(e.total_cases||0)} \u984C</span>
      <span>${n(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${n(ja(e))}">${Ta(e)}</span>
  </button>`}function Is(e,t=[]){let s=e.metrics||{},a=e.judge||{},r=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([b])=>b.startsWith("rag.")).map(([b,k])=>`<span class="chip">${n(b)} ${W(k)}</span>`).join(""),p=(e.law_sources||[]).map(b=>`<span class="chip">${n(b.law_name||"\u6CD5\u898F")} ${d((b.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${n(e.question)}</span>
      ${Xt(e.status)}
      <span class="bench-case-time">${W(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${We(i.deterministic)} \xB7 Judge ${We(i.judge)} \xB7 Human ${We(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${n((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${n(e.fingerprint||"")}">${m("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
      </div>
      <div class="bench-case-stages">${l||'<span class="qb-muted">\u6C92\u6709 stage timing</span>'}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${ct(s.law_recall)}</span>
        <span>Article recall ${ct(s.article_recall)}</span>
        <span>Citation ${s.citation_valid?"valid":"invalid"}</span>
        <span>Refusal ${s.refusal_correct===null?"\u2014":s.refusal_correct?"correct":"wrong"}</span>
      </div>
      <div class="chips">${p||'<span class="qb-muted">\u6C92\u6709\u6CD5\u898F\u4F86\u6E90</span>'}</div>
      <div class="bench-answer"><strong>\u56DE\u7B54</strong><p>${n(e.answer||"\u2014")}</p></div>
      <div class="bench-judge"><strong>LLM judge</strong><p>${n(a.rationale||a.reason||"\u2014")}</p><span>${[["correctness",a.correctness],["grounding",a.grounding],["citation",a.citation],["clarity",a.clarity],["overall",a.overall]].map(([b,k])=>`${b} ${k??"\u2014"}`).join(" \xB7 ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${e.id}">
        <div class="bench-human-grid">
          ${[["correctness","\u6B63\u78BA\u6027",r.scores?.correctness??4],["grounding","\u6709\u64DA\u6027",r.scores?.grounding??4],["citation","\u5F15\u7528",r.scores?.citation??4],["clarity","\u6E05\u695A",r.scores?.clarity??4],["overall","\u6574\u9AD4",r.overall??4]].map(([b,k,h])=>`<label class="field"><span class="field-label">${k} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${b}" value="${n(String(h))}" /></label>`).join("")}
        </div>
        <label class="field"><span class="field-label">\u4EBA\u5DE5\u6279\u6CE8</span><input class="input" name="comment" value="${n(r.comment||"")}" placeholder="\u56DE\u7B54\u54C1\u8CEA\u3001\u5F15\u7528\u6216\u4E8B\u5BE6\u932F\u8AA4" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${m("check",13)}<span>\u5132\u5B58\u4EBA\u5DE5\u8A55\u5206</span></button>
      </form>
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(b=>`<div class="bench-history-row"><span>${n(de(b.run?.started_at))}</span><span>${n(b.run?.config?.llm_model||"\u2014")}</span><span>Det ${We(b.metrics?.scores?.deterministic)}</span><span>Judge ${We(b.metrics?.scores?.judge)}</span><span>Human ${We(b.metrics?.scores?.human)}</span><span>${W(b.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function Bs(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function Ra(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${Is(e,t)}
  </details>`}function Ca(e){return`${Xt(e.status)}
    <span class="mono">${n(e.run_id)}</span>
    ${Rt(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${n(e.run_id)}">${m("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function or(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${n(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${m("activity",14)}${n(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${n((e.status||"")+":"+e.run_id)}">
        ${Ca(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${La(e.summary||{})}</div>
    <div data-bench-detail="stages">${Ma(e.summary||{})}</div>
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
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>Ra(a,t[a.fingerprint]||[])).join(""):ie({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function Na(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${m("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${n(e.run_id)}">${m("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function Pa(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),r=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,r-i):0,l=(t||[]).filter(f=>["success","failed"].includes(f.status)).map(f=>Number(f.duration_ms)||0).filter(f=>f>0),p=null;if(l.length)p=l.reduce((f,w)=>f+w,0)/l.length;else if(a>0){let f=Date.parse(e.updated_at||""),w=Number.isFinite(f)?f:i;Number.isFinite(w)&&w>i?p=(w-i)/a:o>0&&(p=o/a)}let b=(t||[]).find(f=>f.status==="running")||null,k=0;if(a<s&&p&&p>0){let f=b?Date.parse(b.started_at||""):NaN,w=Date.parse(e.updated_at||""),E=Number.isFinite(f)?f:w;Number.isFinite(E)&&(k=Math.max(0,Math.min(.95,(r-E)/p)))}let h=Math.min(s,a+k),y=s>0?Math.max(0,Math.min(100,h/s*100)):0,S=p===null?null:Math.max(0,s-h)*p;return{total:s,completed:a,elapsedMs:o,averageMs:p,progress:y,etaMs:S,ratePerMin:p?6e4/p:null,running:b}}function Ba(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${W(e)}`}function Ia(e,t=[]){let s=Pa(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${n(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${d(s.completed)} / ${d(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${Ba(s.etaMs)}</span>
      <span data-bench-slot="progress-rate">${s.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${s.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`}</span>
    </div>
    <div class="processing-bar processing-bar-lg bench-progress-bar${s.completed===0?" is-waiting":""}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.progress.toFixed(1)}" data-bench-slot="progress-bar">
      <span class="processing-bar-fill" data-bench-slot="progress-fill" style="width:${s.progress.toFixed(2)}%"></span>
    </div>
    <div class="bench-progress-foot">
      <span data-bench-slot="progress-elapsed">\u5DF2\u57F7\u884C ${W(s.elapsedMs)}</span>
      <span data-bench-slot="progress-average">${s.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${W(s.averageMs)}\uFF0F\u984C`}</span>
      <span>\u5373\u6642\u9810\u4F30 \xB7 \u6BCF\u5B8C\u6210\u4E00\u984C\u6821\u6B63</span>
    </div>
  </div>`}function lr(e){let t=e.models?.models||{},s=e.suites||[],a=Et(e),r=e.selectedRun;return`<section class="report-card bench-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("brain",14)}RAG Benchmark</span>
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
      <label class="field"><span class="field-label">Run \u6A19\u7C64</span><input class="input" name="label" value="${n(e.config.label||kt())}" /></label>
      <div class="qb-actions" data-bench-actions data-signature="${n(a?`${a.run_id}:${a.status}`:"")}">
        ${Na(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${n(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?Ia(a,Ds(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>Ea(i,r?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${r?or(r,e.history):""}
  </section>`}function Et(e){let t=(e.runs||[]).find(s=>Rt(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!Rt(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function Ds(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function Da(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:kt(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",pollTimer:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),r=u=>{let g=new FormData(u);return{label:String(g.get("label")||"").trim()||kt(),embedding_model:String(g.get("embedding_model")||""),llm_model:String(g.get("llm_model")||""),judge_model:String(g.get("judge_model")||""),top_k:Number(g.get("top_k")||4),score_threshold:Number(g.get("score_threshold")||.35),repeats:Number(g.get("repeats")||1),enable_law_retrieval:u.elements.enable_law_retrieval?.checked??!0,judge_enabled:u.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(u=>`${u.id}:${u.name}:${u.item_count}:${u.version}:${u.status}`)]:null,runs:(s.runs||[]).map(u=>`${u.run_id}:${u.label||""}:${u.suite_version||1}`)}),o=()=>{let g=a()?.querySelector("[data-bench-live]"),M=Et(s);if(!g||!M)return;let Q=Pa(M,Ds(s,M)),K=(G,H)=>{let V=g.querySelector(`[data-bench-slot="${G}"]`);V&&V.textContent!==H&&(V.textContent=H)};K("progress-count",`${d(Q.completed)} / ${d(Q.total)} \u984C`),K("progress-percent",`${Q.progress.toFixed(1)}%`),K("progress-eta",Ba(Q.etaMs)),K("progress-rate",Q.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${Q.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),K("progress-elapsed",`\u5DF2\u57F7\u884C ${W(Q.elapsedMs)}`),K("progress-average",Q.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${W(Q.averageMs)}\uFF0F\u984C`),K("progress-state",M.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let Y=g.querySelector('[data-bench-slot="progress-bar"]');Y&&(Y.setAttribute("aria-valuenow",Q.progress.toFixed(1)),Y.classList.toggle("is-waiting",Q.completed===0));let C=g.querySelector('[data-bench-slot="progress-fill"]');C&&(C.style.width=`${Q.progress.toFixed(2)}%`)},l=u=>{let g=u.querySelector("[data-bench-actions]");if(!g)return;let M=Et(s),Q=M?`${M.run_id}:${M.status}`:"";g.dataset.signature!==Q&&(g.dataset.signature=Q,g.innerHTML=Na(M))},p=u=>{let g=u.querySelector("[data-bench-live-wrap]");if(!g)return;let M=Et(s),Q=M?`${M.run_id}:${M.status}:${M.total_cases}`:"";g.dataset.signature!==Q&&(g.dataset.signature=Q,g.innerHTML=M?Ia(M,Ds(s,M)):"")},b=u=>{let g=u.querySelector("[data-bench-runs]");if(!g)return;let M=s.runs||[],Q=[...g.querySelectorAll("[data-run-id]")].map(Y=>Y.dataset.runId),K=M.map(Y=>Y.run_id);if(Q.join("|")!==K.join("|")){g.innerHTML=M.length?M.map(Y=>Ea(Y,s.selectedRun?.run_id===Y.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let Y of M){let C=g.querySelector(`[data-run-id="${Y.run_id}"]`);if(!C)continue;C.classList.toggle("is-active",s.selectedRun?.run_id===Y.run_id);let G=C.querySelector('[data-bench-slot="run-label"]');G&&G.textContent!==(Y.label||"RAG Benchmark")&&(G.textContent=Y.label||"RAG Benchmark");let H=C.querySelector('[data-bench-slot="run-status"]');H&&H.dataset.status!==(Y.status||"")&&(H.dataset.status=Y.status||"",H.innerHTML=Xt(Y.status));let V=C.querySelector('[data-bench-slot="run-completed"]');if(V){let ke=`${d(Y.completed_cases||0)} / ${d(Y.total_cases||0)} \u984C`;V.textContent!==ke&&(V.textContent=ke)}let se=C.querySelector('[data-bench-slot="run-scores"]'),ce=ja(Y);se&&se.dataset.signature!==ce&&(se.dataset.signature=ce,se.innerHTML=Ta(Y))}},k=u=>{let g=s.selectedRun;if(!g)return;let M=u.querySelector(`.bench-detail[data-run-id="${g.run_id}"]`);if(!M)return;let Q=M.querySelector("[data-bench-detail-actions]");if(Q){let se=`${g.status||""}:${g.run_id}`;Q.dataset.signature!==se&&(Q.dataset.signature=se,Q.innerHTML=Ca(g))}let K=M.querySelector('[data-bench-detail="metrics"]');if(K){let se=JSON.stringify(g.summary||{});K.dataset.signature!==se&&(K.dataset.signature=se,K.innerHTML=La(g.summary||{}))}let Y=M.querySelector('[data-bench-detail="stages"]');if(Y){let se=JSON.stringify((g.summary||{}).stages||{});Y.dataset.signature!==se&&(Y.dataset.signature=se,Y.innerHTML=Ma(g.summary||{}))}let C=M.querySelector("[data-bench-cases]");if(!C)return;let G=g.cases||[];if(!G.length)return;let H=C.querySelector(".notice");H&&H.remove();let V=new Map([...C.querySelectorAll("details.bench-case")].map(se=>[Number(se.dataset.resultId),se]));for(let se of G){let ce=s.history[se.fingerprint]||[],ke=Bs(se,ce),fe=V.get(Number(se.id));if(!fe){C.insertAdjacentHTML("beforeend",Ra(se,ce)),fe=C.lastElementChild,fe&&(fe._benchSignature=ke);continue}if(fe._benchSignature===ke||!s.forcedCaseIds.delete(Number(se.id))&&fe.contains(document.activeElement))continue;let z=fe.open;fe.innerHTML=Is(se,ce),fe.open=z,fe._benchSignature=ke}},h=()=>{Et(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},y=()=>{let u=a();u&&(l(u),p(u),b(u),k(u),o(),h())},S=u=>{let g=s.selectedRun;if(!g)return;let M=u.querySelector('[data-bench-detail="metrics"]');M&&(M.dataset.signature=JSON.stringify(g.summary||{}));let Q=u.querySelector('[data-bench-detail="stages"]');Q&&(Q.dataset.signature=JSON.stringify((g.summary||{}).stages||{}));let K=u.querySelector("[data-bench-cases]");if(!K)return;let Y=new Map((g.cases||[]).map(C=>[Number(C.id),C]));for(let C of K.querySelectorAll("details.bench-case")){let G=Y.get(Number(C.dataset.resultId));G&&(C._benchSignature=Bs(G,s.history[G.fingerprint]||[]))}},f=(u=!1)=>{let g=a();if(!g)return;let M=i();if(!u&&s.renderSignature===M){y();return}s.renderSignature=M,s.forcedCaseIds.clear(),g.innerHTML=lr(s),S(g),y()},w=async({refreshAll:u=!1}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||u;return}s.loading=!0;try{if(!s.referenceLoaded||u){let[G,H]=await Promise.all([J.benchmarkModels(),J.benchmarkSuites()]);s.models=G,s.suites=H.suites||[],s.indexVersion=G.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=G.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=G.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(G.models?.llm||[]).find(V=>V!==s.config.llm_model)||"")}let g=await J.benchmarkRuns(30);s.runs=g.runs||[];let M=s.activeRunId,Q=s.runs.find(G=>Rt(G.status))||null;s.activeRunId=Q?.run_id||"";let K=s.selectedRun?.run_id||"";K||(K=Q?.run_id||s.runs[0]?.run_id||"");let Y=!!(s.selectedRun&&M&&s.selectedRun.run_id===M);K&&(!s.selectedRun||s.selectedRun.run_id!==K||K===Q?.run_id||Y)?s.selectedRun=await J.benchmarkRun(K,!0):K||(s.selectedRun=null),s.loaded=!0,f()}catch(g){if(!s.loaded){s.renderSignature="";let M=a();M&&(M.innerHTML=ie({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:n(g.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let g=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,w({refreshAll:g})}else E()}},E=()=>{s.pollTimer&&window.clearTimeout(s.pollTimer),s.pollTimer=null,(s.runs||[]).some(u=>Rt(u.status))&&(s.pollTimer=window.setTimeout(()=>{w()},2500))},I=async u=>{try{s.selectedRun=await J.benchmarkRun(u,!0),f(),E()}catch(g){j(g.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},L=async u=>{!s.labelTouched&&u.elements.label&&(u.elements.label.value=kt());let g=r(u);s.config=g;let M=Number(u.elements.suite_id?.value||0);if(!M){j("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await J.startBenchmarkRun({suite_id:M,config:g,actor:"anonymous"}),j("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=kt(),s.labelTouched=!1,await w()}catch(Q){j(Q.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},O=async u=>{try{await J.stopBenchmarkRun(u),j("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await w()}catch(g){j(g.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},X=async u=>{let g=Number(u.dataset.resultId||0),M=new FormData(u),Q={};for(let K of["correctness","grounding","citation","clarity","overall"]){let Y=Number(M.get(`score_${K}`));Number.isFinite(Y)&&(Q[K]=Y)}try{await J.reviewBenchmarkResult(g,{reviewer:"anonymous",scores:Q,comment:String(M.get("comment")||"")}),j("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await J.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(g)),f()}catch(K){j(K.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},te=async u=>{if(u)try{let g=await J.benchmarkFingerprintHistory(u,50);s.history[u]=g.cases||[];let M=s.selectedRun,Q=a();if(!M||!Q)return;let K=(M.cases||[]).filter(Y=>Y.fingerprint===u);for(let Y of K){let C=Q.querySelector(`details.bench-case[data-result-id="${Y.id}"]`);if(!C)continue;let G=C.open;C.innerHTML=Is(Y,s.history[u]),C.open=G,C._benchSignature=Bs(Y,s.history[u])}}catch(g){j(g.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},R=async u=>{let g=u.target.closest("[data-bench-action]");if(!g)return;let M=g.dataset.benchAction;M==="open-run"?await I(g.dataset.runId||""):M==="stop"?await O(g.dataset.runId||""):M==="fingerprint-history"&&await te(g.dataset.fingerprint||"")},N=async u=>{let g=u.target.closest("[data-bench-form]");g&&(u.preventDefault(),g.dataset.benchForm==="run"?await L(g):g.dataset.benchForm==="human"&&await X(g))},F=u=>{u&&(u.elements.label&&u.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=r(u),u.elements.suite_id&&(s.selectedSuiteId=Number(u.elements.suite_id.value)||s.selectedSuiteId))},A=u=>{let g=u.target.closest('[data-bench-form="run"]');g&&F(g)};return e.addEventListener("click",R),e.addEventListener("submit",N),e.addEventListener("input",A),e.addEventListener("change",A),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=kt();let u=a()?.querySelector('input[name="label"]');u&&(u.value=s.config.label)}w({refreshAll:!s.referenceLoaded})},refresh(){return w({refreshAll:!0})},destroy(){e.removeEventListener("click",R),e.removeEventListener("submit",N),e.removeEventListener("input",A),e.removeEventListener("change",A),s.pollTimer&&window.clearTimeout(s.pollTimer),s.tickTimer&&window.clearInterval(s.tickTimer)}}}var Vs={};rt(Vs,{exportCsv:()=>ns,exportableResult:()=>rs,render:()=>Jr,renderReport:()=>ts,reportError:()=>as,reportLoading:()=>Ct});var za=[10,25,50,100],cr=500,dr=["law_name","law_level","law_category","law_modified_date","article_count"],ur=["jid","court_normalized","title","jdate","matched_laws","citation_count"],pr={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function ss(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function Zt(e,t){let s={};for(let a of e.fields||[]){let r=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?r:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{}}}function mr(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,r]of Object.entries(s))if(Array.isArray(r)&&!r.map(String).includes(String(t[a]??"")))return!1;return!0}function zs(e,t){return(e.fields||[]).filter(s=>mr(s,t))}function gr(e,t){return`filter-${e.id}-${t}`}function dt(e){return e==null?"":n(String(e))}function Os(e,t,s){let a=s[t.key],r=gr(e,t.key),i=t.help?`<span class="field-help">${n(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(p=>`<option value="${dt(p.value)}" ${String(p.value)===String(a??"")?"selected":""}>${n(p.label??p.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${r}" name="${n(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),p=(t.options||[]).map(b=>`<label class="multi-option">
          <input type="checkbox" name="${n(t.key)}" value="${dt(b.value)}" ${l.has(String(b.value))?"checked":""} />
          <span>${n(b.label??b.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${p}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${r}" name="${n(t.key)}"
        value="${dt(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${dt(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${r}" name="${n(t.key)}"
        value="${dt(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${r}" name="${n(t.key)}"
      value="${dt(a)}"
      placeholder="${dt(t.placeholder||"")}" />
    ${i}
  </div>`}function Fs(e,t,{focusTable:s=!1}={}){let a=zs(e,t.values),r=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(r.push(`<div class="field-row">${Os(e,o,t.values)}${Os(e,l,t.values)}</div>`),i+=1):r.push(Os(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
    <div class="filter-block">
      <div class="filter-head">
        <span class="filter-title">Metadata \u689D\u4EF6</span>
        <button class="filter-reset" type="button" data-action="reset">\u91CD\u8A2D</button>
      </div>
      <div class="filter-fields">${r.join("")}</div>
    </div>
    <div class="sidebar-actions">
      <button class="btn btn-primary" type="submit" id="run-query" ${s?'data-focus-table="true"':""}>
        ${m("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
      </button>
    </div>
  </form>`}function es(e,t,s){let a={...s.values};for(let r of zs(t,a))if(r.type==="checkbox"){let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=!!i?.checked}else if(r.type==="multiselect")a[r.key]=Array.from(e.querySelectorAll(`[name="${r.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=i?i.value:""}return a}function Va(e,t){let s={};for(let a of zs(e,t.values)){let r=t.values[a.key];a.type==="checkbox"?s[a.key]=!!r:a.type==="multiselect"?s[a.key]=Array.isArray(r)?r:[]:a.type==="number"?s[a.key]=r===""||r===null?"":Number(r):s[a.key]=r??""}return s}function Hs(e,t){let s=Va(e,t);return(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function Oa(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${ie({tone:t,title:`${ss(e)} ${Ue(e.status).label}`,text:n(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function fr(e,t){return`<div class="db-options" role="radiogroup" aria-label="\u9078\u64C7\u8CC7\u6599\u5EAB">
    ${e.map(s=>{let a=Ue(s.status);return`<label class="db-option">
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
  </div>`}function vr(e){return`<div class="sidebar-view-switch" role="tablist" aria-label="\u67E5\u8A62\u6216 schema">
    <button class="sidebar-view-button ${e==="query"?"is-active":""}"
      type="button" role="tab" aria-selected="${e==="query"}"
      data-action="sidebar-view" data-view="query">${m("search",13)}<span>\u67E5\u8A62</span></button>
    <button class="sidebar-view-button ${e==="schema"?"is-active":""}"
      type="button" role="tab" aria-selected="${e==="schema"}"
      data-action="sidebar-view" data-view="schema">${m("table",13)}<span>Schema</span></button>
  </div>`}function Us(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],r=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function Fa(e,t){return`<div class="category-options" role="radiogroup" aria-label="\u8CC7\u6599\u985E\u578B">
    ${e.map(s=>{let a=s.id===t,r=s.id==="judgment"&&s.count!==void 0?`${d(s.count)} \u7B46\u5DF2\u7BE9\u9078\u5224\u6C7A`:s.description||"";return`<label class="category-option${a?" is-selected":""}">
          <input type="radio" name="category" value="${n(s.id)}" ${a?"checked":""} />
          <span class="category-option-body">
            <span class="category-option-label">${n(s.label)}</span>
            <span class="category-option-desc">${n(r)}</span>
          </span>
        </label>`}).join("")}
  </div>`}function Ha(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||n(e.detail||"")}function br(e){return`<div class="report-empty">
    ${je({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:n({postgres:"\u9078\u64C7\u8CC7\u6599\u8868\u8207 metadata \u689D\u4EF6\uFF0C\u57F7\u884C\u5F8C\u6703\u7522\u751F SQL\u3001\u6458\u8981\u3001\u5206\u5E03\u8207\u8CC7\u6599\u5217\u3002",parquet:"\u9078\u64C7\u8CC7\u6599\u96C6\u8207\u56DE\u50B3\u6B04\u4F4D\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
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
  </div>`}function Ct(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(ss(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function as(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(ss(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${ie({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function hr(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,r=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${n(s.label||"\u672A\u5206\u985E")}">${n(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${r.toFixed(1)}%"></span></span>
          <span class="dist-value">${d(a)}</span>
        </div>`}).join("")}
  </div>`}function Wa(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function yr(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function $r(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function wr(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${n(String(t))}"
    title="\u6AA2\u8996\u300C${n(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${n(String(t))}${m("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var _r={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function kr(e,t,s,a=!1,r=!0,i=!1){let o=a?e.key:e.label||e.key,l=r?t?_r[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${n(o)}</th>`;let p=s?.key===l,b=p?s.direction:null,k=b==="asc"?"ascending":b==="desc"?"descending":"none",h=b==="asc"?"\u2191":b==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${k}">
    <button class="table-sort${p?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${n(l)}"
      title="\u4F9D${n(o)}\u6392\u5E8F">
      <span>${n(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${h}</span>
    </button>
  </th>`}function Sr(e,t){if(!Wa(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,r=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(r||""),lawName:String(t.law_name||"")}}function xr(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${n(s.lawKey)}"
    data-law-source="${n(s.sourceType)}"
    data-law-name="${n(s.lawName)}"
    title="\u6AA2\u8996\u300C${n(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(String(a))}${m("chevronRight",12,"law-link-icon")}</button>`}function Ka(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:r=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],p=(e.page-1)*e.page_size,b=Wa(e),k=yr(e),h=$r(e),y=e.meta?.sort||null,S=r?`<tr class="schema-search-row">
        <th scope="col" class="cell-index-head"></th>
        ${o.map(f=>`<th scope="col">
              <div class="schema-search-wrap">
                <input class="schema-search-input" type="search"
                  data-schema-search="${n(f.key)}"
                  value="${n(String(r[f.key]??""))}"
                  placeholder="\u641C\u5C0B ${n(f.key)}"
                  autocomplete="off" />
              </div>
            </th>`).join("")}
      </tr>`:"";return o.length?l.length?`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">${d(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${b?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":k?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":h?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${S}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(f=>kr(f,k,y,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((f,w)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${p+w+1}</td>
                ${o.map(E=>{if((k||h)&&E.key==="jid")return`<td class="cell-jid">${wr(f)}</td>`;let I=b&&E.key==="law_name"?Sr(e,f):null;if(I)return`<td>${xr(f,E,I)}</td>`;let O={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[E.type];return`<td${O?` class="${O}"`:""}>${Gt(f[E.key],E.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${je({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function qr(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${d(i)}\u2013${d(o)} / ${d(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${za.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${m("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${m("chevronRight",13)}</button>
    </div>
  </div>`}function Ya(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${n(t)}</div>`).join("")}</div>`}function ts(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],r=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",p=e.status||"ok",b=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${n(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${n(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${n(e.label||l)}
          ${ue(p)}
          <span class="chip">${n(b)}</span>
        </div>
        <div class="report-sub">
          ${d(i)} \u7B46\u7B26\u5408 \xB7
          ${W(e.duration_ms)} \xB7
          ${n(String(l).toUpperCase())} / ${n(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${m("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${m("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${ie({tone:p==="not_configured"?"info":p==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:""}

    ${a.length?`<div class="summary-strip">
            ${a.slice(0,4).map(k=>`<div class="summary-item">
                  <div class="summary-label">${n(k.label)}</div>
                  <div class="summary-value">${n(k.value)}</div>
                </div>`).join("")}
          </div>`:""}

    <div class="report-grid">
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u7D50\u679C\u5206\u5E03</span>
          <span class="muted" style="font-size:9.5px">${r.length} groups</span>
        </div>
        ${hr(r)}
      </div>
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5BE6\u969B\u67E5\u8A62\u8A9E\u53E5</span>
          <span class="muted" style="font-size:9.5px">${n(e.database==="indexeddb"?"client-side":"read-only")}</span>
        </div>
        <div class="query-box">
          <pre class="query-code">${n(o||"\u2014")}</pre>
          <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
            ${m("copy",12)}<span>\u8907\u88FD</span>
          </button>
        </div>
        ${Ya(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?Ka(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?qr({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function Ua(e){return`<div class="report-card schema-preview">
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
  </div>`}function Js(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let r=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${ie({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${n(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${n(t||e.table||"\u8CC7\u6599\u8868")}
          ${ue(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${n(String(e.database||""))} / ${n(String(e.table||"\u2014"))} \xB7 ${r.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${Ka({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${Ya(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${d(i.length)} \u7B46</span>
      <strong>\u5171 ${d(e.total)} \u7B46</strong>
    </div>
  </div>`}function Ja(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${n(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${ie({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function Ar(e){return`<div class="report-empty">
    ${je({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${ss(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function Qs(e){return e.is_current===!0?ue("ok","\u73FE\u884C"):e.law_abandon_note?ue("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?ue("empty","\u6B77\u53F2\u7248\u672C"):ue("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function be(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${n(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function ut(e){return e?He(e):"\u2014"}function Lr(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function Gs(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${n(e)}</span>
    </div>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </div>`:""}function Mr(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${n(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${m("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </details>`:""}function Tr(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let r=a?.name||a?.url||"";return r?a.url?`<a class="law-attachment" href="${n(a.url)}" target="_blank" rel="noopener noreferrer">
          ${m("file",12)}<span>${n(r)}</span>${m("external",11)}
        </a>`:`<span class="law-attachment">${m("file",12)}<span>${n(r)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${d(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function Xa(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function jr(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,r=s?`${d(a)} \u689D \xB7 ${d(s)} \u7AE0\u7BC0`:`${d(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${n(l)}</div>`;let p=pr[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${n(Xa(o.article_no))}">
        <div class="law-article-head">
          <span class="law-article-no">${n(o.article_no||"\u689D\u6587")}</span>
          ${p&&p!=="\u689D\u6587"?`<span class="chip">${n(p)}</span>`:""}
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
  </div>`}function Er(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function St(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${m("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function Rr(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${St()}
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
  </div>`}function Cr(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${St()}
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
  </div>`}function Nr(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let r=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",r,a.article_count_for_law?`${d(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${n(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${n(i)}</option>`}).join("")}
    </select>
  </label>`}function Pr(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let r={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${r[o]} ${d(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">\u7248\u672C\u8B8A\u66F4</span>
      <span class="muted">${n(i)}</span>
    </summary>
    <div class="law-version-change-list">
      ${a.length?a.slice(0,20).map(o=>{let l=o.change_type==="added"?"badge-ok":o.change_type==="removed"?"badge-danger":"badge-warn",p=o.before_content?`<details><summary>\u8B8A\u66F4\u524D</summary><pre>${n(o.before_content)}</pre></details>`:"",b=o.after_content?`<details><summary>\u8B8A\u66F4\u5F8C</summary><pre>${n(o.after_content)}</pre></details>`:"";return`<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${l}">${n(r[o.change_type]||o.change_type)}</span>
                    <strong>${n(o.article_no||o.article_key)}</strong>
                  </div>
                  ${p}${b}
                </div>`}).join(""):'<div class="report-empty-inline">\u6B64\u7248\u672C\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u8B8A\u66F4\u3002</div>'}
      ${e.changes_truncated?'<div class="report-empty-inline">\u50C5\u986F\u793A\u524D 20 \u7B46\u8B8A\u66F4\uFF1BAPI \u56DE\u50B3\u4E0A\u9650 200 \u7B46\u3002</div>':""}
    </div>
  </details>`}function Br(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let r=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(w=>w.article_type!=="C").length,l=Lr(e),p=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",b=e.meta?.snapshot||"",k=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",h=[l,p,k,b].filter(Boolean).join(" \xB7 "),y=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",S=e.version||{},f=[be("\u6CD5\u898F\u4F4D\u968E",n(e.law_level||"\u2014")),be("\u6CD5\u898F\u985E\u5225",n(e.law_category||"\u2014")),be("\u7570\u52D5\u65E5\u671F",ut(e.law_modified_date)),be("\u751F\u6548\u65E5\u671F",ut(e.law_effective_date)),be("\u689D\u6587\u6578",d(e.article_count)),be("\u8CC7\u6599\u72C0\u614B",Qs(e)),be("\u82F1\u8B6F\u540D\u7A31",n(e.eng_law_name||"\u2014")),be("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${n(e.law_key||"\u2014")}</span>`)];return S.first_seen_version_id!==null&&S.first_seen_version_id!==void 0&&f.push(be("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${n(S.first_seen_version_id)}`)),S.last_seen_version_id!==null&&S.last_seen_version_id!==void 0&&f.push(be("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${n(S.last_seen_version_id)}`)),S.last_seen_at&&f.push(be("\u6700\u5F8C\u6536\u9304\u6642\u9593",n(de(S.last_seen_at)))),S.selected_version_id!==null&&S.selected_version_id!==void 0&&f.push(be("\u689D\u6587\u7248\u672C",`#${n(S.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${St()}
      <span class="law-report-origin" title="${n(h)}">${n(h)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${n(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${n(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${n(i)}
            ${Qs(e)}
            <span class="chip">${n(y)}</span>
          </div>
          <div class="report-sub">
            ${n([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${d(e.article_count)} \u689D \xB7 \u7570\u52D5 ${ut(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${Nr(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">${m("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${r.length?`<div class="report-alert">${ie({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r.map(w=>n(w)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${d(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${ut(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${n(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${Qs(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${n(l)}</span>
        </div>
        <div class="law-meta-grid">${f.join("")}</div>
      </div>

      ${Pr(e)}
      ${Gs("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${Mr("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${Gs("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${Gs("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${Tr(e.attachments)}
      ${jr(e)}
    </div>
    ${o>100?Er():""}
  </div>`}function Ir(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${St()}
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
  </div>`}function Dr(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${St()}
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
  </div>`}function Or(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${n(t)}"
    data-law-source=""
    data-law-name="${n(t)}"
    title="\u6AA2\u8996\u300C${n(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(t)}${m("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function Fr(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let r=String(s.article_no||"").trim();r&&t.get(a).add(r)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${Or(s)}
          <span class="judgment-citation-articles">${[...a].map(r=>n(r)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function Hr(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",r=String(e.full_text||""),i=Number(e.full_text_length)||r.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[be("\u6848\u865F",n(e.jid||"\u2014")),be("\u5E74\u5EA6",n(e.jyear||"\u2014")),be("\u5B57\u5225",n(e.jcase||"\u2014")),be("\u865F\u78BC",n(e.jno||"\u2014")),be("\u6CD5\u9662",n(e.court||"\u2014")),be("\u6848\u7531",n(e.title||"\u2014")),be("\u88C1\u5224\u65E5\u671F",ut(e.jdate)),be("\u4F86\u6E90\u58D3\u7E2E\u6A94",n(e.source_archive||"\u2014")),be("\u5168\u6587\u9577\u5EA6",`${d(i)} \u5B57`),be("\u5F15\u7528\u6578",d(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(be("\u532F\u5165 Run",`#${n(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${St()}
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
            ${n(e.court||"\u2014")} \xB7 ${ut(e.jdate)} \xB7
            ${d(i)} \u5B57
          </div>
        </div>
        <div class="report-actions">
          ${e.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(e.pdf_url)}" target="_blank" rel="noopener noreferrer">${m("external",14)}<span>PDF</span></a>`:""}
        </div>
      </div>

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u88C1\u5224\u65E5\u671F</div>
          <div class="summary-value">${ut(e.jdate)}</div>
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
        ${Fr(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${d(i)} \u5B57</span>
        </div>
        ${r?`<div class="judgment-fulltext">${n(r)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function Qa(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function ns(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(Qa).join(",")],r=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([r+o+1,...t.map(l=>i[l.key])].map(Qa).join(","))}),`\uFEFF${a.join(`\r
`)}`}function rs(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,r]of Object.entries(t))a.startsWith("_")||(s[a]=r);return s})}}function Ur(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function Ga(e,t){let s=performance.now(),a=Va(e,t),r=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,p=[],b=[],k=[],h=[];if(r==="settings"){b=(await qa({keyword:i})).map(O=>({key:O.key,value:Aa(O.value),updated_at:O.updated_at})),k=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let L=new Map;b.forEach(O=>{let X=String(O.key||"").split(".")[0]||"\u5176\u4ED6";L.set(X,(L.get(X)||0)+1)}),h=Array.from(L.entries()).map(([O,X])=>({label:O,value:X})).sort((O,X)=>X.value-O.value)}else{b=(await Wt({keyword:i,limit:cr})).map(O=>({kind:Ur(O.kind),title:O.title,detail:O.detail,created_at:O.created_at})),k=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let L=new Map;b.forEach(O=>L.set(O.kind,(L.get(O.kind)||0)+1)),h=Array.from(L.entries()).map(([O,X])=>({label:O,value:X})).sort((O,X)=>X.value-O.value)}let y=b.length,S=(o-1)*l,f=b.slice(S,S+l),w=Math.round(performance.now()-s),E=ka();return E&&p.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:E?"degraded":"ok",message:E?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:r,columns:k,rows:f,total:y,page:o,page_size:l,duration_ms:w,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(y)},{label:"\u76EE\u524D\u9801\u9762",value:`${f.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:Vt()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${w} ms`}],distribution:h,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${r}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${S}`,warnings:p,meta:{store:r,filters:a,client_side:!0}}}async function Jr(e,t){let s=!1,a=null,r=[],i="law",o=null,l={},p=0,b=25,k="query",h=null,y=null,S=0,f=[],w=null,E=-1,I=0,L=null,O=null;e.innerHTML=`<section class="page data-page">
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
          ${m("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
  </section>`;let X=e.querySelector("#query-sidebar"),te=e.querySelector("#category-switch"),R=e.querySelector("#db-options-wrap"),N=e.querySelector("#sidebar-view-switch"),F=e.querySelector("#filter-area"),A=e.querySelector("#schema-area"),u=e.querySelector("#query-main"),g=e.querySelector("#schema-suggest-popover"),M=e.querySelector("#catalog-meta"),Q=e.querySelector("#refresh-catalog"),K=v=>r.find($=>$.id===v),Y=()=>K(i)?.databases||[],C=v=>Y().find($=>$.id===v),G=(v,$)=>`${v}:${$}`,H=(v,$=i)=>l[G($,v.id)],V=(v,$)=>{Kt(v,$).catch(()=>{})},se=()=>{if(!a){M.textContent="CATALOG \xB7 \u96E2\u7DDA",M.className="badge badge-danger badge-mono";return}let v=Y(),$=v.filter(T=>T.available).length,_=K(i);M.textContent=`CATALOG \xB7 ${_?.label||i} \xB7 ${$}/${v.length} \u53EF\u7528`,M.className="badge badge-neutral badge-mono"},ce=v=>{u.innerHTML=br(v)},ke=()=>{let v=L?.returnScroll??O?.returnScroll;L=null,O=null;let $=C(o),_=$?H($):null;k==="schema"&&y?.result?u.innerHTML=Js(y.result,pe($,y.tableId),{columnFilters:y.columnFilters||{},searchEnabled:$.id==="postgres"||$.id==="parquet"}):_?.result?u.innerHTML=ts(_.result):$&&ce($),typeof v=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:v,behavior:"smooth"}))},fe=(v="law-article-jump")=>{let $=u.querySelector(`#${v}`),_=Xa($?.value);if(!_){j("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),$?.focus();return}let D=[...u.querySelectorAll("[data-article-no]")].find(P=>P.dataset.articleNo===_);if(!D){j(`\u627E\u4E0D\u5230\u7B2C ${_} \u689D\u3002`,"warn");return}D.scrollIntoView({behavior:"instant",block:"center"}),D.classList.add("is-jump-target"),window.setTimeout(()=>D.classList.remove("is-jump-target"),2400)},Ke=async({lawKey:v,sourceType:$="",lawName:_="",versionId:T=""})=>{let D=C(o),P=D?H(D):null,U=k==="schema"?y?.result:null;if(!D||!P?.result&&!U||!v)return;let le=++p;L={seq:le,lawKey:v,sourceType:$,lawName:_,versionId:T?String(T):"",page:1,detail:null,database:D.id,returnScroll:window.scrollY},O=null,u.innerHTML=Rr(_||v),u.scrollIntoView({behavior:"smooth",block:"start"});try{let $e=await J.lawDetail(v,$,L.versionId);if(s||!L||L.seq!==le)return;L.detail=$e,L.page=1,u.innerHTML=Br($e,{database:L.database,lawPage:L.page})}catch($e){if(s||!L||L.seq!==le)return;u.innerHTML=Cr($e,_||v),j($e.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},z=async({jid:v})=>{let $=C(o),_=$?H($):null,T=k==="schema"?y?.result:null;if(!$||!_?.result&&!T||!v)return;let D=++p;L=null;let P=$.id==="parquet"?"parquet":"postgres";O={seq:D,jid:v,detail:null,database:$.id,source:P,returnScroll:window.scrollY},u.innerHTML=Ir(v),u.scrollIntoView({behavior:"smooth",block:"start"});try{let U=await J.judgmentDetail(v,P);if(s||!O||O.seq!==D)return;O.detail=U,u.innerHTML=Hr(U,{database:O.database})}catch(U){if(s||!O||O.seq!==D)return;u.innerHTML=Dr(U,v),j(U.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},ne=(v,$)=>`${i}:${v.id}:${$}`,pe=(v,$)=>(v.tables||[]).find(_=>_.id===$)?.label||$,Re=(v,$,{sort:_=null,columnFilters:T={}}={})=>{let D={column_filters:T};return v.id==="postgres"?(D.table=$,D.schema_preview=!0):v.id==="parquet"&&i==="judgment"?(D.table="judgment_documents",D.columns=ur):v.id==="parquet"&&(D.dataset="all",D.columns=dr),_?.key&&(D.sort=`${_.key}:${_.direction}`),D},nt=async(v,$,{sort:_=null,columnFilters:T={}}={})=>{if(!$)return;bt();let D=ne(v,$),P=++S;h={tableId:$},y={key:D,tableId:$,loading:!0,result:null,error:null,sort:_,columnFilters:T},A.innerHTML=Us(v,K(i)?.label||i,$),u.innerHTML=Ua(pe(v,$));try{let U;if(v.id==="indexeddb"){let le=Zt(v,10);le.values.store=$,le.page=1,U=await Ga(v,le)}else v.id==="qdrant"?U={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:$,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(U=await J.query({database:v.id,filters:Re(v,$,{sort:_,columnFilters:T}),page:1,pageSize:10}),_?.key&&(U.meta={...U.meta||{},sort:_}));if(s||P!==S)return;y={key:D,tableId:$,loading:!1,result:U,error:null,sort:_,columnFilters:T},k==="schema"&&h?.tableId===$&&(A.innerHTML=Us(v,K(i)?.label||i,$),u.innerHTML=Js(U,pe(v,$),{columnFilters:T,searchEnabled:v.id==="postgres"||v.id==="parquet"}))}catch(U){if(s||P!==S)return;y={key:D,tableId:$,loading:!1,result:null,error:U,sort:_,columnFilters:T},k==="schema"&&h?.tableId===$&&(u.innerHTML=Ja(U,pe(v,$)))}},ft=()=>{let v=C(o);if(!v)return null;if(k==="schema"&&y?.result)return{db:v,tableId:y.tableId,columnFilters:y.columnFilters||{},sort:y.sort||null,mode:"schema"};let $=v?H(v):null,_=$?.result;return _&&(v.id==="postgres"||v.id==="parquet")?{db:v,tableId:_.table,columnFilters:$.columnFilters||{},sort:$.sort||null,mode:"query"}:null},vt=(v,$,_)=>{if(!v)return;let T=`${v.db.id}:${v.tableId}:${$}`,D=ve.get(T);D&&(window.clearTimeout(D),ve.delete(T)),bt();let P={...v.columnFilters||{}},U=String(_||"").trim();if(U?P[$]=U:delete P[$],v.mode==="schema"){nt(v.db,v.tableId,{sort:v.sort,columnFilters:P});return}let le=H(v.db);le.columnFilters=P,le.page=1,Be(1)},ve=new Map,Ae=()=>{I+=1,f=[],w=null,E=-1,g&&(g.hidden=!0,g.innerHTML="")},bs=(v,$)=>{let _=String(v||""),T=_.toLocaleLowerCase(),D=String($||"").toLocaleLowerCase(),P=new Array(_.length).fill(!1),U=(he,Ce)=>{for(let _e=he;_e<he+Ce;_e+=1)_e>=0&&_e<P.length&&(P[_e]=!0)},le=T.indexOf(D);if(le>=0)for(;le>=0;)U(le,D.length),le=T.indexOf(D,le+D.length);else{let he=[];for(let Ce of D.match(/[一-鿿]{2,}/g)||[])for(let _e=0;_e<Ce.length-1;_e+=1)he.push(Ce.slice(_e,_e+2));he.push(...D.match(/[a-z0-9]+/g)||[]);for(let Ce of he){let _e=T.indexOf(Ce);for(;_e>=0;)U(_e,Ce.length),_e=T.indexOf(Ce,_e+Ce.length)}}let $e="",we=0;for(;we<_.length;)if(P[we]){let he=we;for(;he<_.length&&P[he];)he+=1;$e+=`<mark>${n(_.slice(we,he))}</mark>`,we=he}else{let he=we;for(;he<_.length&&!P[he];)he+=1;$e+=n(_.slice(we,he)),we=he}return $e||n(_)},hs=(v,$)=>{if(!g)return;let _=v.getBoundingClientRect(),T=Math.min(420,Math.max(220,_.width)),D=Math.min(360,34+$*30),P=_.bottom+4;P+D>window.innerHeight-8&&(P=Math.max(8,_.top-D-4));let U=Math.min(window.innerWidth-T-8,Math.max(8,_.left));g.style.width=`${T}px`,g.style.left=`${U}px`,g.style.top=`${P}px`},xe=v=>{if(!g)return;let $=[...g.querySelectorAll(".schema-suggest-item")];$.length&&(E=Math.max(0,Math.min($.length-1,v)),$.forEach((_,T)=>{_.classList.toggle("is-active",T===E)}),$[E].scrollIntoView({block:"nearest"}))},It=v=>{let $=f[v],_=w;!$||!_||(Ae(),vt(_,_.column,$))},Dt=async(v,$,_,T)=>{if(!v||!_.trim()){Ae();return}let D=++I;w={...v,column:$,input:T},E=-1;try{let P=await J.schemaSuggest({database:v.db.id,table:v.tableId,column:$,query:_,limit:1e3});if(D!==I||document.activeElement!==T||!g)return;let U=Array.isArray(P.values)?P.values:[];if(f=U,!U.length){Ae();return}let le=Number(P.total)>U.length?`\u5171 ${d(P.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${d(U.length)} \u500B`:`\u5171 ${d(P.total)} \u500B\u7B26\u5408`;g.innerHTML=`<div class="schema-suggest-head">${n(le)}</div>${U.map(($e,we)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${we}"
            title="${n($e)}">${bs($e,_)}</button>`).join("")}`,hs(T,U.length),g.hidden=!1}catch{Ae()}},bt=()=>{let v=document.activeElement;v instanceof HTMLElement&&v.matches("[data-schema-search]")&&v.blur(),Ae()},Ot=(v,{resetReport:$=!1}={})=>{bt();let _=H(v);if(te.innerHTML=Fa(r,i),R.innerHTML=fr(Y(),v.id),N.innerHTML=vr(k),k==="schema"?(F.hidden=!0,F.innerHTML="",A.hidden=!1,A.innerHTML=Us(v,K(i)?.label||i,h?.tableId||"")):(A.hidden=!0,A.innerHTML="",F.hidden=!1,F.innerHTML=`${Oa(v)}${Fs(v,_)}<div class="sidebar-note">${Ha(v)}</div>`),se(),k==="schema"){let T=h?ne(v,h.tableId):"";if(y&&y.key===T){let D=pe(v,y.tableId);y.loading?u.innerHTML=Ua(D):y.error?u.innerHTML=Ja(y.error,D):u.innerHTML=Js(y.result,D,{columnFilters:y.columnFilters||{},searchEnabled:v.id==="postgres"||v.id==="parquet"})}else u.innerHTML=Ar(v);return}$?ce(v):_.result?u.innerHTML=ts(_.result):ce(v)},Ft=(v,{persist:$=!0,resetReport:_=!1}={})=>{let T=Y(),D=T.find(U=>U.id===v)||T[0];if(!D)return;L=null,O=null,h=null,y=null,S+=1,o=D.id;let P=G(i,D.id);l[P]||(l[P]=Zt(D,b)),Ot(D,{resetReport:_}),$&&(V(`data.last_database.${i}`,D.id),V("data.last_category",i))},Lt=(v,{persist:$=!0,resetReport:_=!0,databaseId:T=null}={})=>{let D=K(v)||r[0];if(!D)return;i=D.id,L=null,O=null;let P=D.databases||[],U=T&&P.find(le=>le.id===T)||P.find(le=>le.id===o)||P[0];if(o=U?.id||null,!U){te.innerHTML=Fa(r,i),R.innerHTML=`<div class="sidebar-notice">${ie({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,F.innerHTML="",se();return}Ft(U.id,{persist:!1,resetReport:_}),$&&(V("data.last_category",D.id),V(`data.last_database.${D.id}`,U.id))},Ht=v=>{let $=H(v),_=F.querySelector("#data-filter-form");_&&($.values=es(_,v,$))},Be=async(v=null)=>{let $=C(o);if(!$)return;bt();let _=H($);Ht($),v!==null&&(_.page=v),(!Number.isFinite(_.page)||_.page<1)&&(_.page=1);let T=++p;L=null,O=null,u.innerHTML=Ct($);let D=F.querySelector("#run-query");re(D,!0,"\u67E5\u8A62\u4E2D\u2026");try{let P;if($.id==="indexeddb"?P=await Ga($,_):P=await J.query({database:$.id,filters:Hs($,_),page:_.page,pageSize:_.pageSize}),s||T!==p)return;P.meta={...P.meta||{},column_filters:_.columnFilters||{},searchable:$.id==="postgres"||$.id==="parquet",sort:_.sort||P.meta?.sort||null},_.result=P,_.page=Number(P.page)||_.page,_.pageSize=Number(P.page_size)||_.pageSize,u.innerHTML=ts(P);let U=K(i)?.label||i;await Tt({kind:"data",title:`${U} \xB7 ${$.label} \xB7 ${P.table||P.label||"query"}`,detail:`${d(P.total)} \u7B46 \xB7 ${W(P.duration_ms)}`,payload:{category:i,database:$.id,filters:Hs($,_),page:_.page,page_size:_.pageSize}}),V("data.last_query",{category:i,database:$.id,filters:Hs($,_),page:_.page,page_size:_.pageSize,at:new Date().toISOString()})}catch(P){if(s||T!==p)return;u.innerHTML=as(P,$),j(P.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&T===p&&re(D,!1)}},ht=async()=>{Q.disabled=!0,re(Q,!0,"\u6574\u7406\u4E2D\u2026");try{let[v,$,_,T,D]=await Promise.all([J.catalog(),lt("data.last_category","law"),lt("data.last_database.law","postgres"),lt("data.last_database.judgment","postgres"),lt("data.page_size",25)]);if(s)return;a=v,r=Array.isArray(a.categories)?a.categories:[],b=za.includes(Number(D))?Number(D):25;for(let le of r)for(let $e of le.databases||[]){let we=G(le.id,$e.id);l[we]||(l[we]=Zt($e,b))}let P=r.find(le=>le.id===$)||r[0];if(!P){te.innerHTML="",R.innerHTML=`<div class="sidebar-notice">${ie({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let U=P.id==="judgment"?T:_;if(i=P.id,o=null,Lt(P.id,{persist:!1,resetReport:!0,databaseId:U}),s)return;j("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(v){if(s)return;a=null,r=[],te.innerHTML="",se(),R.innerHTML=`<div class="sidebar-notice">${ie({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:n(v.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${m("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,u.innerHTML=`<div class="report-empty">${je({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(Q.disabled=!1,re(Q,!1))}};X.addEventListener("change",v=>{let $=v.target;if($.name==="category"){Lt($.value);return}if($.name==="database"){Ft($.value);return}let _=C(o);if(!_)return;let T=H(_),D=F.querySelector("#data-filter-form");!D||!$.name||(T.values=es(D,_,T),T.page=1,$.name==="table"&&(L=null,O=null,T.sort=null,T.columnFilters={},T.result=null,F.innerHTML=Fs(_,T),ce(_)))}),X.addEventListener("input",v=>{let $=C(o);if(!$)return;let _=F.querySelector("#data-filter-form");if(!_||!v.target.name||v.target.name==="table")return;let T=H($);T.values=es(_,$,T)}),X.addEventListener("submit",v=>{v.target.id==="data-filter-form"&&(v.preventDefault(),Be(1))}),X.addEventListener("click",v=>{let $=v.target.closest("[data-action]"),_=$?.dataset.action;if(_==="sidebar-view"){let T=C(o);if(!T)return;let D=H(T),P=F.querySelector("#data-filter-form");P&&k==="query"&&(D.values=es(P,T,D)),k=$.dataset.view==="schema"?"schema":"query",Ot(T);return}if(_==="select-schema-table"){let T=C(o);if(!T)return;nt(T,$.dataset.tableId||"");return}if(_==="reset"){let T=C(o);if(!T)return;L=null,O=null;let D=H(T);l[G(i,T.id)]=Zt(T,D.pageSize),F.innerHTML=`${Oa(T)}${Fs(T,l[G(i,T.id)])}<div class="sidebar-note">${Ha(T)}</div>`,ce(T),j("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}v.target.closest("#catalog-retry")&&ht()}),u.addEventListener("input",v=>{let $=v.target.closest("[data-schema-search]");if(!$)return;let _=ft();if(!_)return;let T=$.dataset.schemaSearch||"",D=$.value,P=`${_.mode}:${_.db.id}:${_.tableId}:${T}`,U=ve.get(P);if(U&&window.clearTimeout(U),!D.trim()){ve.delete(P),Ae(),vt(_,T,"");return}let le=window.setTimeout(()=>{ve.delete(P),Dt(_,T,D,$)},250);ve.set(P,le)}),u.addEventListener("keydown",v=>{let $=v.target.closest("[data-schema-search]");if(!$)return;let _=ft();if(_){if(v.key==="Escape"){Ae();return}if(v.key==="ArrowDown"||v.key==="ArrowUp"){if(!g||g.hidden)return;v.preventDefault();let T=v.key==="ArrowDown"?1:-1;xe(E<0?T>0?0:f.length-1:E+T);return}if(v.key==="Enter"){if(v.preventDefault(),g&&!g.hidden&&E>=0){It(E);return}vt(_,$.dataset.schemaSearch||"",$.value)}}}),g?.addEventListener("mousedown",v=>{v.preventDefault()}),g?.addEventListener("click",v=>{let $=v.target.closest("[data-schema-suggest-index]");$&&It(Number($.dataset.schemaSuggestIndex))});let Ut=v=>{v.target.closest("[data-schema-search]")||g?.contains(v.target)||Ae()};return document.addEventListener("click",Ut),window.addEventListener("scroll",Ae,!0),window.addEventListener("resize",Ae),u.addEventListener("keydown",v=>{v.target.matches(".law-jump-input")&&v.key==="Enter"&&(v.preventDefault(),fe(v.target.id))}),u.addEventListener("click",async v=>{let $=v.target.closest("[data-action]");if(!$)return;let _=$.dataset.action,T=C(o),D=T?H(T):null,P=D?.result;if(_==="back-to-results"){ke();return}if(_==="open-law"){Ke({lawKey:$.dataset.lawKey||"",sourceType:$.dataset.lawSource||"",lawName:$.dataset.lawName||""});return}if(_==="open-judgment"){z({jid:$.dataset.jid||""});return}if(_==="jump-article"){fe($.dataset.jumpInput||"law-article-jump");return}if(_==="sort-column"){let U=$.dataset.sortKey||"";if(!U||!T)return;if(k==="schema"&&y?.result){let we=y.sort,he=U==="jdate"||U==="law_modified_date"||U==="article_count"||U==="citation_count"||U==="full_text_length"||U==="created_at"||U==="updated_at",Ce=we?.key===U?we.direction==="asc"?"desc":"asc":he?"desc":"asc";nt(T,y.tableId,{sort:{key:U,direction:Ce},columnFilters:y.columnFilters||{}});return}if(!D)return;let le=D.sort,$e=le?.key===U?le.direction==="asc"?"desc":"asc":U==="jdate"?"desc":"asc";D.sort={key:U,direction:$e},Be(1);return}if(_==="retry"){Be(D?.page||1);return}if(P){if(_==="prev-page"){Be(Math.max(1,Number(P.page)-1));return}if(_==="next-page"){let U=Math.max(1,Math.ceil(Number(P.total)/Number(P.page_size)));Be(Math.min(U,Number(P.page)+1));return}if(_==="copy-query"){let U=await _t(P.query_text||"");j(U?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",U?"ok":"warn");return}if(_==="export-json"){let U=`${P.database}-${P.table||"query"}-page-${P.page}.json`;Je(U,JSON.stringify(rs(P),null,2),"application/json;charset=utf-8"),j(`\u5DF2\u532F\u51FA ${U}`,"ok");return}if(_==="export-csv"){let U=`${P.database}-${P.table||"query"}-page-${P.page}.csv`;Je(U,ns(P),"text/csv;charset=utf-8"),j(`\u5DF2\u532F\u51FA ${U}`,"ok")}}}),u.addEventListener("change",v=>{let $=v.target.closest("[data-action='select-law-version']");if($&&L){Ke({lawKey:L.lawKey,sourceType:L.sourceType,lawName:L.lawName,versionId:$.value});return}if(!v.target.matches("[data-page-size]"))return;let _=C(o);if(!_)return;let T=H(_);T.pageSize=Number(v.target.value)||25,T.page=1,V("data.page_size",T.pageSize),Be(1)}),Q.addEventListener("click",()=>{ht()}),await ht(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0;for(let v of ve.values())window.clearTimeout(v);ve.clear(),Ae(),document.removeEventListener("click",Ut),window.removeEventListener("scroll",Ae,!0),window.removeEventListener("resize",Ae)}}var tn=[10,25,50,100],Qr=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function Ws(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function Gr(e,t=e){return`<option value="${n(e)}">${n(t)}</option>`}function Nt(e,t,s,a,r=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${n(t)}</span>
      <span class="field-tag">${n(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${n(e)}">
      ${Gr("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${n(i)}" ${String(i)===String(a)?"selected":""}>${n(i)}</option>`).join("")}
    </select>
    ${r?`<span class="field-help">${n(r)}</span>`:""}
  </div>`}function zr(e,t){let s=Qr.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${Nt("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${Nt("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${Nt("model","\u6A21\u578B",e.models||[],t.model)}
    ${Nt("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${Nt("method","\u65B9\u6CD5",e.methods||[],t.method)}
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
    </div>`}function Za(){let e=document.getElementById("performance-filter-form");if(!e)return Ws();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function sn(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function Vr(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),r=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${r}.${i}`}function Wr(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"is-client":t.includes("judgment.rag")?"is-rag":t.includes("judgment.web.app")?"is-api":t.includes("judgment.web.query")?"is-data":t.includes("judgment.judgment_index")?"is-index":"is-other"}function Kr(e){let t=new Map(e.map(a=>[a.seq,a.parent_seq])),s=new Map;for(let a of e){if(Number.isInteger(a.depth)){s.set(a.seq,a.depth);continue}let r=0,i=a.parent_seq,o=0;for(;i&&t.has(i)&&o<20;)r+=1,i=t.get(i),o+=1;s.set(a.seq,r)}return s}function Yr(e){let t=Object.entries(e||{});if(!t.length)return'<span class="muted">\u7121\u53C3\u6578</span>';let s=t.slice(0,8),a=t.length-s.length;return`<div class="flow-param-list">${s.map(([r,i])=>`<span class="flow-param">
        <span class="flow-param-key">${n(r)}</span>
        <span class="flow-param-value">${n(sn(i))}</span>
      </span>`).join("")}${a>0?`<span class="flow-param-more">+${a}</span>`:""}</div>`}function Xr(e){let t=new Map,s=Math.max(0,Number(e[0]?.offset_ms)||0);return e.forEach((a,r)=>{let i=Math.max(0,Number(a.offset_ms)||0),o=Math.max(0,Number(a.duration_ms)||0),l=e[r+1],p=l?Math.max(i,Number(l.offset_ms)||i):null,b=p===null?i+o:p,k=Math.max(0,b-i),h=Math.max(0,b-s);t.set(a.seq,{offset:i,duration:o,lap:k,cumulative:h})}),t}function Zr(e,t,s,a){let r=a.get(e.seq)||{},i=Math.max(0,Number(r.duration)||0),o=Math.max(0,Number(r.offset)||0),l=Math.max(0,Number(r.lap)||0),p=Math.max(0,Number(r.cumulative)||0),b=Math.max(t,o+i,1),k=Math.min(100,o/b*100),h=Math.min(100-k,Math.max(.6,l/b*100)),y=s.get(e.seq)||0,f=Vr(e.started_at)||`+${o.toFixed(0)} ms`,w=e.started_at?`\u958B\u59CB\uFF1A${de(e.started_at)} \xB7 +${o.toFixed(1)} ms`:`\u958B\u59CB\uFF1A+${o.toFixed(1)} ms`;return`<div class="flow-segment ${e.status==="error"?"is-error":""}" style="--depth:${Math.min(y,8)}">
    <div class="flow-segment-head">
      <span class="flow-seq">#${n(String(e.seq??"\u2014"))}</span>
      <span class="flow-segment-name">${n(e.name||"unnamed")}</span>
      <span class="flow-segment-start" title="${n(w)}">${n(f)}</span>
      <span class="flow-segment-duration" title="\u8DDD\u4E0B\u4E00\u9EDE ${W(l)}\uFF1B\u7D2F\u8A08 ${W(p)}">${W(l)}</span>
      <span class="flow-segment-span" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${W(p)}</span>
    </div>
    <div class="flow-segment-loc">
      <span class="flow-segment-loc-text">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</span>
      <span class="flow-segment-mobile-cum" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${W(p)}</span>
    </div>
    <div class="flow-track" title="\u958B\u59CB +${o.toFixed(1)} ms \xB7 \u8DDD\u4E0B\u4E00\u9EDE ${W(l)} \xB7 \u7D2F\u8A08 ${W(p)}">
      <span class="flow-bar ${Wr(e)}" style="left:${k.toFixed(2)}%;width:${h.toFixed(2)}%"></span>
    </div>
    ${Yr(e.params)}
    ${e.error?`<div class="flow-segment-error">${n(e.error)}</div>`:""}
  </div>`}function ei(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},r=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?W(a.avg_total_ms??0):"\u2014",o=a.samples?W(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
                    <span class="perf-model-count">${d(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${W(l.avg_ms)}`:""}</span>
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
                    <span class="perf-seg-ms">${W(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function Ne(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),r=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(r).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:r?`${r}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function an(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function ti(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let r=Number(a.points_per_second)||0,i=Math.max(2,r/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${n(an(a))}</strong>
          <span>${n(de(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${n(`${d(a.indexed_count)} \u7B46 \xB7 ${Ne(a.duration_ms)} \xB7 ${d(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${r.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${d(a.indexed_count)} \u7B46 \xB7 ${Ne(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function si(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${n(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${n(`${s.label} ${Ne(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${n(s.key)}"></i>
            <span>${n(s.label)}</span>
            <strong>${Ne(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 Ollama Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function ai(e,t){let s=(Array.isArray(e)?e:[]).map(I=>({elapsed:Math.max(0,Number(I.elapsed_s)||0),indexed:Math.max(0,Number(I.indexed)||0)})).filter(I=>I.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(I=>I.elapsed),(Number(t)||0)/1e3,1),r=Math.max(...s.map(I=>I.indexed),1),i=760,o=150,l=12,p=12,b=i-l*2,k=o-p*2,h=s.map(I=>[l+I.elapsed/a*b,o-p-I.indexed/r*k]),y=h.map(([I,L],O)=>`${O===0?"M":"L"}${I.toFixed(1)},${L.toFixed(1)}`).join(" "),S=`${y} L${h[h.length-1][0].toFixed(1)},${o-p} L${h[0][0].toFixed(1)},${o-p} Z`,f=Math.max(1,Math.ceil(h.length/14)),w=h.map(([I,L],O)=>O%f===0||O===h.length-1?`<circle cx="${I.toFixed(1)}" cy="${L.toFixed(1)}" r="2.6" />`:"").join(""),E=[0,1,2,3].map(I=>{let L=p+k/3*I;return`<line x1="${l}" y1="${L.toFixed(1)}" x2="${i-l}" y2="${L.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${d(r)} \u7B46 \xB7 ${Ne(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${E}
      <path d="${S}" class="index-progress-area"></path>
      <path d="${y}" class="index-progress-line"></path>
      ${w}
      <line x1="${l}" y1="${o-p}" x2="${i-l}" y2="${o-p}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${p}" x2="${l}" y2="${o-p}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${Ne(a*500)}</span>
      <span>${Ne(a*1e3)}</span>
    </div>
  </div>`}function ni(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},r=t.coverage||{},i=r.total_judgments>0?`${d(r.indexed_judgments)} / ${d(r.total_judgments)}\uFF08${(100*r.indexed_judgments/r.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:d(t.indexed_count),note:`${d(t.batch_count)} \u6279 \xD7 ${d(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:Ne(t.duration_ms),note:`${d(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:Ne(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${Ne(t.batch_min_ms)} \xB7 \u6700\u6162 ${Ne(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${d(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${n(an(t))}</span>
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
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${Ne(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${ti(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${Ne(t.duration_ms)}</span>
        </div>
        ${si(t)}
      </div>
    </div>
    ${ai(t.progress,t.duration_ms)}
  </section>`}function ri(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${d(i)}\u2013${d(o)} / ${d(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${tn.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${m("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${m("chevronRight",13)}</button>
    </div>
  </div>`}function ii(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((f,w)=>Number(f.seq)-Number(w.seq)):[],r=s?.summary||{},i=Array.isArray(r.models)?r.models:[],o=s?.client||{},l=s?.metadata||{},p=l.question||"",b=l.answer||"",k=p||b?`<div class="perf-flow-qa">
          ${p?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${n(p)}</span></div>`:""}
          ${b?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${n(b)}</span></div>`:""}
        </div>`:"",h=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(f=>(Number(f.offset_ms)||0)+(Number(f.duration_ms)||0)),1),y=Kr(a),S=Xr(a);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${n(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${n(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${n(e.method||"")} ${n(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${de(e.started_at)}</span>
      <span class="perf-record-duration">${W(e.duration_ms)}</span>
      ${ue(e.status)}
      <span class="perf-record-chevron">${m("chevronRight",14)}</span>
    </summary>
    <div class="perf-record-body">
      <div class="perf-flow-meta">
        <span><strong>Request</strong> <span class="mono">${n(e.request_id||s?.request_id||"\u2014")}</span></span>
        <span><strong>Server</strong> ${W(e.duration_ms)}</span>
        ${o.total_ms?`<span><strong>Client \u5168\u6D41\u7A0B</strong> ${W(o.total_ms)}</span>`:""}
        ${o.render_ms!==void 0?`<span><strong>Render</strong> ${W(o.render_ms)}</span>`:""}
        <span><strong>Flow</strong> ${a.length} \u6BB5</span>
        ${a.length?"<span><strong>\u9EDE\u4F4D</strong> \u5340\u9593\uFF1D\u4E0B\u4E00\u9EDE\u958B\u59CB\uFF0D\u672C\u9EDE\u958B\u59CB\uFF1B\u7D2F\u8A08\uFF1D\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\uFF0C\u6700\u5F8C\u4E00\u9EDE\u70BA\u7E3D\u6642\u9593</span>":""}
      </div>
      ${k}
      ${i.length?`<div class="chips perf-record-models">${i.map(f=>`<span class="chip">${n(f)}</span>`).join("")}</div>`:""}
      ${a.length?`<div class="flow-axis"><span>0 ms</span><span>${W(h)}</span></div>
            <div class="flow-timeline">${a.map(f=>Zr(f,h,y,S)).join("")}</div>`:`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${n(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${n(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var Pt={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"},en={embedding:"EMB",retrieval:"\u6AA2\u7D22",context:"\u53D6\u6587",llm:"LLM",validation:"\u9A57\u8B49",overhead:"\u5176\u4ED6"};function nn(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}function oi(e){let t=String(e.status||"pending"),s=Math.max(0,Math.min(100,Number(e.progress)||0)),a=t==="pending"?0:t==="running"?Math.max(s,12):100,r=t==="running"?"\u57F7\u884C\u4E2D\u2026":t==="pending"?"\u7B49\u5F85":e.duration_ms?W(e.duration_ms):nn(t);return`<div class="test-flow-step is-${n(t)}">
    <div class="test-flow-step-head">
      <span class="test-flow-model" title="${n(e.model||"")}">${n(e.model||"\u2014")}</span>
      <span class="test-flow-step-meta">${n(r)}</span>
    </div>
    <div class="test-flow-step-loc">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</div>
    <div class="test-flow-track">
      <span class="test-flow-bar" style="width:${a}%"></span>
    </div>
    ${e.error_message?`<div class="test-flow-error">${n(e.error_message)}</div>`:""}
    ${e.details&&Object.keys(e.details).length?`<div class="test-flow-details">${n(Object.entries(e.details).slice(0,4).map(([i,o])=>`${i}=${sn(o)}`).join(" \xB7 "))}</div>`:""}
  </div>`}function li(e,t){if(!t.length)return"";let s=t.reduce((a,r)=>a+(Number(r.progress)||0),0)/t.length;return`<section class="test-flow-stage">
    <div class="test-flow-stage-head">
      <span class="test-flow-stage-title">${n(Pt[e]||e)}</span>
      <span class="test-flow-stage-meta">${t.length} \u500B\u7A0B\u5E8F \xB7 ${Math.round(s)}%</span>
    </div>
    <div class="test-flow-stage-steps">${t.map(oi).join("")}</div>
  </section>`}function rn(e,t){let s=Date.now(),a=new Map;for(let h of t){let y=Number(h.duration_ms)||0;if(h.status==="running"&&h.started_at){let S=Date.parse(h.started_at);Number.isFinite(S)&&(y=Math.max(y,s-S))}a.set(h.stage,(a.get(h.stage)||0)+y)}let r=Array.isArray(e.stage_order)?e.stage_order:Object.keys(Pt),i=[],o=new Set;for(let h of r)t.some(y=>y.stage===h)&&(o.add(h),i.push({stage:h,label:Pt[h]||h,short:en[h]||h,duration:a.get(h)||0}));for(let[h,y]of a)o.has(h)||i.push({stage:h,label:Pt[h]||h,short:en[h]||h,duration:y});let l=i.reduce((h,y)=>h+y.duration,0),p=Number(e.total_ms)||0,b=Math.max(l,p),k=Math.max(0,b-l);return k>1&&i.push({stage:"overhead",label:"\u5176\u4ED6\uFF0F\u6392\u7A0B",short:"\u5176\u4ED6",duration:k}),{entries:i,total:b||l,stepTotal:l}}function ci(e,t){let{entries:s,total:a}=rn(e,t),r=s.filter(o=>o.duration>0).map(o=>{let l=a?o.duration/a*100:0;return`<span class="test-flow-time-seg stage-${n(o.stage)}" style="width:${l.toFixed(2)}%" title="${n(o.label)} \xB7 ${W(o.duration)}\uFF08${l.toFixed(1)}%\uFF09">${l>=8?n(o.short):""}</span>`}).join(""),i=s.map(o=>{let l=a?o.duration/a*100:0;return`<span class="test-flow-legend-item">
        <i class="test-flow-dot stage-${n(o.stage)}"></i>
        <span>${n(o.label)}</span>
        <strong>${W(o.duration)}</strong>
        <em>${l.toFixed(1)}%</em>
      </span>`}).join("");return`<div class="test-flow-time">
    <div class="test-flow-total-head">
      <span>\u7E3D\u6D41\u7A0B\u6642\u9593\uFF08\u4F9D\u968E\u6BB5\uFF09</span>
      <span>${W(a)}${e.status==="running"?" \xB7 \u4F30\u7B97\u4E2D":""}</span>
    </div>
    <div class="test-flow-time-bar">
      ${r||'<span class="test-flow-time-empty">\u5C1A\u7121\u968E\u6BB5\u8017\u6642</span>'}
    </div>
    <div class="test-flow-legend">${i}</div>
    ${e.status==="running"?'<div class="test-flow-time-note">\u57F7\u884C\u4E2D\u7684\u968E\u6BB5\u4EE5\u958B\u59CB\u6642\u9593\u4F30\u7B97\uFF1B\u5B8C\u6210\u5F8C\u4EE5\u4F3A\u670D\u5668\u56DE\u5831\u7684 duration \u70BA\u6E96\u3002</div>':""}
  </div>`}function xt(e,t,s,a={}){let r=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(L=>`<option value="${n(L.run_id)}" ${L.run_id===s?"selected":""}>${n(nn(L.status))} \xB7 ${n((L.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${n(de(L.started_at))}</option>`)].join(""),o=r?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${m("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${m("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?ue(e.status):""}</div>
      <div class="test-flow-question">${e?n(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${je({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let p=Array.isArray(e.steps)?e.steps:[],b=new Map;for(let L of p)b.has(L.stage)||b.set(L.stage,[]),b.get(L.stage).push(L);let h=(Array.isArray(e.stage_order)?e.stage_order:Object.keys(Pt)).map(L=>li(L,b.get(L)||[])).join(""),y=e.models||{},S=rn(e,p),f=e.status==="running"?`${W(S.total)}\uFF08\u4F30\u7B97\uFF09`:W(e.total_ms),w=p.find(L=>L.stage==="llm"&&L.model===e.summary?.primary_model)||p.find(L=>L.stage==="llm"&&L.details?.answer_preview),E=e.answer||w?.details?.answer_preview||"",I=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${e.summary?.primary_model?`<span class="mono">${n(e.summary.primary_model)}</span>`:""}
    </div>
    <p>${E?n(E):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${n(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${n(de(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${f}</span>
      <span><strong>Embedding</strong> ${Array.isArray(y.embedding)?y.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(y.llm)?y.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${n(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${I}
    <div class="test-flow-stages">${h||'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}</div>
    <div class="test-flow-total">
      <div class="test-flow-total-head">
        <span>\u7E3D\u6D41\u7A0B\u9032\u5EA6</span>
        <span>${Number(e.progress)||0}%</span>
      </div>
      <div class="test-flow-track is-total ${e.status==="running"?"is-running":""}">
        <span class="test-flow-bar is-total" style="width:${Math.max(0,Math.min(100,Number(e.progress)||0))}%"></span>
      </div>
    </div>
    ${ci(e,p)}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":r?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${e.summary?.primary_model?`<span class="mono">primary=${n(e.summary.primary_model)}</span>`:""}
    </div>
  </div>`}function di(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},r=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${ue(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${d(e.total)} \u7B46\u7B26\u5408 \xB7 ${W(e.duration_ms)} \xB7
          \u6BCF\u6B21\u57F7\u884C\u6309\u9215\u7684\u5B8C\u6574 Flow
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${m("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${m("file",14)}<span>JSON</span></button>
      </div>
    </div>
    ${s.length?`<div class="summary-strip">${s.map(i=>`<div class="summary-item">
                <div class="summary-label">${n(i.label)}</div>
                <div class="summary-value">${n(i.value)}</div>
              </div>`).join("")}</div>`:""}
    ${ni(r)}
    ${ei(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>ii(i,o)).join(""):je({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${ri(e)}
    <details class="perf-query-details">
      <summary>\u67E5\u8A62\u8A9E\u53E5\u8207\u8B66\u544A</summary>
      <div class="query-box">
        <pre class="query-code">${n(e.query_text||"\u2014")}</pre>
        <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
          ${m("copy",12)}<span>\u8907\u88FD</span>
        </button>
      </div>
      ${Array.isArray(e.warnings)&&e.warnings.length?`<div class="warnings">${e.warnings.map(i=>`<div class="warning-line">${n(i)}</div>`).join("")}</div>`:""}
    </details>
  </div>`}async function ui(e,t){let s=!1,a=Ws(),r={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null;e.innerHTML=`<section class="page data-page performance-page">
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
          ${m("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
            <span class="status-tab-icon">${m("activity",15)}</span>
            <span class="status-tab-copy"><strong>\u6548\u80FD\u7E3D\u89BD</strong><small>Flow\u3001\u5340\u6BB5\u8017\u6642\u8207\u7D22\u5F15\u6548\u80FD</small></span>
          </button>
          <button class="status-tab" type="button" data-performance-tab="benchmark">
            <span class="status-tab-icon">${m("brain",15)}</span>
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
                    ${m("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
                  </button>
                </div>
              </form>
              <div class="sidebar-note">Flow \u5BEB\u5165 PostgreSQL \u7684 performance_records.flow\uFF08JSON\uFF09\uFF0C\u9810\u8A2D\u4FDD\u7559\u81F3\u5C11 90 \u5929\uFF1B\u53EF\u4F9D\u6A21\u578B\u3001\u7A0B\u5E8F\u3001\u6A21\u7D44\u8207\u8017\u6642\u7BE9\u9078\u3002</div>
            </aside>
            <section class="query-main" id="performance-main" aria-label="\u6548\u80FD\u5831\u8868" aria-live="polite">
              <div id="performance-test-flow"></div>
              <div id="performance-report">${Ct({label:"\u6548\u80FD\u5831\u8868"})}</div>
            </section>
          </div>
        </div>
        <div id="performance-panel-benchmark" hidden></div>
      </section>
    </div>
  </section>`;let p=e.querySelector("#performance-filter-fields"),b=e.querySelector("#performance-filter-form"),k=e.querySelector("#performance-test-flow"),h=e.querySelector("#performance-report"),y=e.querySelector("#performance-meta"),S=e.querySelector("#performance-refresh"),f=[...e.querySelectorAll("[data-performance-tab]")],w={overview:e.querySelector("#performance-panel-overview"),benchmark:e.querySelector("#performance-panel-benchmark")},E="overview",I=C=>{E=C;for(let G of f){let H=G.dataset.performanceTab===C;G.classList.toggle("is-active",H),H?G.setAttribute("aria-current","page"):G.removeAttribute("aria-current")}for(let[G,H]of Object.entries(w))H&&(H.hidden=G!==C);C==="benchmark"&&(y.textContent="BENCHMARK \xB7 RAG")},L=Da(e,{onNavigate:C=>I(C)}),O=C=>{I(C),C==="benchmark"&&L.show()};e.addEventListener("click",C=>{let G=C.target.closest("[data-performance-tab]");G&&O(G.dataset.performanceTab||"overview")});let X=null,te=[],R="",N=null,F="",A=()=>{p.innerHTML=zr(r,a)},u=()=>{let C=JSON.stringify({selected:R,tick:X?.status==="running"?Math.floor(Date.now()/1e3):0,runs:te.map(G=>`${G.run_id}:${G.status}`),run:X?{run_id:X.run_id,status:X.status,progress:X.progress,steps:(X.steps||[]).map(G=>`${G.stage}:${G.model}:${G.status}:${G.progress}`)}:null});C!==F&&(F=C,k.innerHTML=xt(X,te,R))},g=async()=>{try{let C=await J.testRuns(30);if(s)return;te=Array.isArray(C.runs)?C.runs:[]}catch{if(s)return;te=[]}},M=async()=>{try{let C=R?await J.testRun(R):await J.testRunCurrent();if(s)return;X=C.run||null,!R&&X&&X.status!=="running"&&!te.some(G=>G.run_id===X.run_id)&&await g(),u()}catch{if(s)return;X=null,u()}},Q=async()=>{s||(R||await M(),s||(N=window.setTimeout(Q,1500)))};k.addEventListener("change",async C=>{C.target.id==="test-run-select"&&(R=String(C.target.value||""),await M())}),k.addEventListener("click",async C=>{C.target.closest("#test-flow-refresh")&&(R="",await g(),await M())});let K=async(C=i)=>{i=Math.max(1,Number(C)||1),a=Za(),h.innerHTML=Ct({label:"\u6548\u80FD\u5831\u8868"});let G=e.querySelector("#performance-run");re(G,!0,"\u67E5\u8A62\u4E2D\u2026");try{let H=await J.performance(a,i,o);if(s)return;l=H,i=Number(H.page)||i,o=Number(H.page_size)||o,h.innerHTML=di(H),y.textContent=`PERFORMANCE \xB7 ${d(H.total)} \u7B46`,y.className="badge badge-neutral badge-mono"}catch(H){if(s)return;h.innerHTML=as(H,{label:"\u6548\u80FD\u5831\u8868"}),j(H.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||re(G,!1)}},Y=async()=>{try{r=await J.performanceOptions()}catch{r={processes:[],modules:[],statuses:[],methods:[],models:[]}}A()};return b.addEventListener("submit",C=>{C.preventDefault(),K(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=Ws(),i=1,A(),K(1)}),S.addEventListener("click",async()=>{if(E==="benchmark"){re(S,!0,"\u6574\u7406\u4E2D\u2026");try{await L.refresh()}finally{s||re(S,!1)}return}a=Za(),S.disabled=!0,re(S,!0,"\u6574\u7406\u4E2D\u2026"),await Y(),await g(),s||await M(),s||await K(1),s||(S.disabled=!1,re(S,!1))}),h.addEventListener("click",async C=>{let G=C.target.closest("[data-action]");if(!G||!l)return;let H=G.dataset.action;if(H==="retry"){K(i);return}if(H==="prev-page"){K(Math.max(1,Number(l.page)-1));return}if(H==="next-page"){let V=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));K(Math.min(V,Number(l.page)+1));return}if(H==="copy-query"){let V=await _t(l.query_text||"");j(V?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",V?"ok":"warn");return}if(H==="export-json"){let V=`performance-page-${l.page}.json`;Je(V,JSON.stringify(rs(l),null,2),"application/json;charset=utf-8"),j(`\u5DF2\u532F\u51FA ${V}`,"ok");return}if(H==="export-csv"){let V=`performance-page-${l.page}.csv`;Je(V,ns(l),"text/csv;charset=utf-8"),j(`\u5DF2\u532F\u51FA ${V}`,"ok")}}),h.addEventListener("change",C=>{C.target.matches("[data-page-size]")&&(o=Number(C.target.value)||25,tn.includes(o)||(o=25),K(1))}),await Promise.allSettled([Y(),g()]),s||(await M(),await K(1),Q()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,N&&window.clearTimeout(N),L.destroy()}}var pi=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function mi(){return`<div class="answer-placeholder">
    <span class="empty-icon">${m("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function Ys(){return`<section class="card answer-card rag-empty-answer">${mi()}</section>`}function on(e,t){return`<div class="rag-turn">
    <div class="rag-user-bubble">${n(e)}</div>
    <section class="card rag-assistant-turn" data-rag-answer>${t}</section>
  </div>`}function gi(e){return{status:e.status,answer:e.answer,answer_source:e.answer_source,notice:e.notice,citations:Array.isArray(e.citations)?e.citations:[],judgments:Array.isArray(e.judgments)?e.judgments:[],law_sources:Array.isArray(e.law_sources)?e.law_sources:[],matched_terms:Array.isArray(e.matched_terms)?e.matched_terms:[],law_answer:e.law_answer,law_framework:e.law_framework,llm_model:e.llm_model,embedding_model:e.embedding_model,duration_ms:e.duration_ms,show_sources:e.show_sources,test_run:e.test_run||null,partial:!1,streaming:!1}}var fi={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"Ollama embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"Ollama LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function vi(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`Ollama run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`Ollama embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:fi[t]||t||"backend step"}function ln(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function cn(e){let t=Number(e);return Number.isFinite(t)?`${d(Math.max(0,Math.round(t)))} ms`:"\u2014"}function Xs(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function bi(){return`<div class="rag-process is-open" id="rag-process">
    <div class="rag-process-control">
      <button type="button" class="rag-process-toggle" id="rag-process-toggle"
        aria-expanded="true" aria-controls="rag-process-body" title="\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B">
        <span class="rag-process-toggle-label-collapsed">\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
        <span class="rag-process-toggle-label-expanded">\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
        ${m("chevronDown",11)}
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
  </div>`}function hi(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),r=performance.now(),i=new Map,o=(y,S,f)=>{let w=y.querySelector(S);w&&(w.textContent=f)},l=y=>{if(y.failed){o(y.element,".rag-process-meta","\u5931\u6557");return}if(y.hasChildren){o(y.element,".rag-process-meta","");return}o(y.element,".rag-process-meta",cn(y.durationMs))},p=y=>{let S=y-1,f=[...i.values()].reverse();for(let w of f){if(S<0)break;w.depth<=S&&(w.hasChildren||(w.hasChildren=!0,w.element.dataset.hasChildren="true",w.finished&&l(w)),S=w.depth-1)}},b=y=>{if(!s)return null;let S=String(y?.seq??`step-${i.size+1}`),f=i.get(S);if(!f){let w=Math.max(0,Math.min(6,Number(y?.depth)||0));p(w);let E=document.createElement("div");E.className="rag-process-item is-running",E.dataset.processKey=S,E.style.setProperty("--depth",String(w)),E.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(E),f={element:E,depth:w,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(S,f)}return o(f.element,".rag-process-label",vi(y)),f.element.title=ln(y),f};return{step:y=>{let S=y?.segment;if(!S)return;let f=b(S);if(f){if(y.type==="segment_start"){f.element.classList.add("is-running"),o(f.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(y.type==="segment_end"){let w=S.status==="error";f.element.classList.remove("is-running"),f.element.classList.toggle("is-error",w),f.finished=!0,f.failed=w,f.durationMs=Number(S.duration_ms)||0,l(f),f.element.title=[ln(S),w&&S.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(y=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(w=>{w.classList.remove("is-running");let E=w.dataset.hasChildren==="true";o(w,".rag-process-meta",E?"":y?"\u5B8C\u6210":"\u4E2D\u65B7")});let S=s?.children.length||i.size,f=cn(Math.max(0,performance.now()-r));return a&&(a.textContent=y?`\u5B8C\u6210 \xB7 ${S} \u6B65 \xB7 ${f}`:`\u5931\u6557 \xB7 ${S} \u6B65`),t.classList.add("is-complete"),Xs(t,!1),t.outerHTML},collapse:()=>Xs(t,!1)}}function yi(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${m("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":bi()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${n(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function dn(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function is(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let r=String(e||"").trim();return r?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${n(t||r)}"
    data-source-type="${n(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${n(r)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${n(r)} \u7684\u5B8C\u6574\u689D\u6587">${n(a||r)}</button>`:""}function $i(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(l=>`<span>${n(l)}</span>`).join(""),r=(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(l=>is(l)).join(""),i=e.jid?` data-action="open-parquet-judgment"
        data-jid="${n(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${n(e.jid)}"`:"",o=e.pdf_url?`<a class="citation-link" href="${n(e.pdf_url)}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${m("external",11)}</a>`:"";return`<article class="citation">
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
  </article>`}function wi(e,t){let s=[e.law_level,e.law_category,e.article_count?`${d(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${n(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${m("external",11)}</a>`:"",r=e.law_key||e.law_name||"",i=r?` data-action="open-law-source"
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
  </article>`}function _i(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",r=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${n(s)}</span>`,a,e.law_category,e.article_count?`${d(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${He(e.law_modified_date)}`:""].filter(Boolean).map(S=>`<span>${S}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${n(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${n(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${n(o.entity||"")}\u300D\u7684\u5224\u6C7A ${d(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${d(o.law_count||0)} \u6B21</span>
      </div>`:"",p=e.law_key||"",b=e.source_type||"",k=(Array.isArray(e.articles)?e.articles:[]).map(S=>{let f=String(S.article_no||"");return`<div class="law-source-article"${p&&f?` data-action="open-law-source"
        data-law-key="${n(p)}"
        data-source-type="${n(b)}"
        data-article-no="${n(f)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${n(f)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} ${n(f)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${n(S.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${n(S.article_content||"")}</p>
      </div>`}).join(""),h=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${m("external",11)}</a>`:"",y=e.law_key?` data-action="open-law-source"
        data-law-key="${n(e.law_key)}"
        data-source-type="${n(e.source_type||"")}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u672C\u5730 Parquet \u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation law-source">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body"${y}>
      <h4 class="citation-name">${n(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${r}</div>
      ${i}
      ${l}
      ${k}
    </div>
    <div class="citation-links">${h}</div>
  </article>`}function ki(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function Si(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${n(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",r=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(r==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),p=s.index!=null?`<span class="law-answer-index">[${n(String(s.index))}]</span>`:"",b=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${n(a)}"
            data-source-type="${n(r)}"
            title="\u9EDE\u64CA\u958B\u555F ${n(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${n(i)} \u7684\u5B8C\u6574\u689D\u6587">${n(i)}</button>`:`<strong>${n(i)}</strong>`,k=Array.isArray(s.articles)?s.articles:[],h=k.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${k.map(y=>{let S=String(y.article_no||"").trim(),f=ki(y.article_content);return!a||!S?`<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${n(S||"\u689D\u6587")}</span>
                  <span class="law-answer-article-text">${n(f)}</span>
                </div>`:`<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${n(a)}"
                data-source-type="${n(r)}"
                data-article-no="${n(S)}"
                title="\u9EDE\u64CA\u67E5\u770B ${n(S)} \u7684\u5B8C\u6574\u5167\u5BB9"
                aria-label="\u958B\u555F ${n(i)} ${n(S)} \u7684\u5B8C\u6574\u689D\u6587">
                <span class="law-answer-article-no">${n(S)}</span>
                <span class="law-answer-article-text">${n(f)}</span>
              </button>`}).join("")}</div>`:"";return`<div class="law-answer-source">
        <div class="law-answer-source-head">
          ${b}
          <span class="law-answer-source-meta">\uFF08${n(o)}\uFF0C${d(l)} \u689D\uFF09</span>
          ${p}
        </div>
        ${h}
      </div>`}).join("")}</div>`}function xi(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let r=s.get(String(a));return r?.law_key?is(a,{lawKey:r.law_key,sourceType:r.source_type||""}):`<span class="chip">${n(a)}</span>`}).join("")}</div>`}function mn(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.law_sources)?e.law_sources:[],r=Array.isArray(e.matched_terms)?e.matched_terms:[],i=e.status||"preview",o=!!e.partial,l=!!e.streaming,p=!!e.show_sources||!o,b=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((H,V)=>$i(H,V)).join("")}</div>`:"",k=a.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${a.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${a.map((H,V)=>_i(H,V)).join("")}</div>`:"",h=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((H,V)=>wi(H,V)).join("")}</div>`:"",y=p?b+k+h:"";!y&&!o&&(y=`<div class="answer-divider"></div>
      ${je({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:i==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let S=xi(r,a),f=e.test_run,w=String(e.llm_model||f?.primary_model||"").trim(),E=String(e.embedding_model||"").trim(),I=[w?`LLM\uFF1A${w}`:"",E?`Embedding\uFF1A${E}`:""].filter(Boolean).join(" \xB7 "),L=e.answer_source==="structured",O=String(e.law_answer||"").trim(),X=e.law_framework||null,te=Array.isArray(X?.rows)?X.rows:[],R=Array.isArray(X?.sources)?X.sources:[],N=te.length>0,F=!!O&&!L&&!N,A=l||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",u=N?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${n(X.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${te.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${te.map(H=>`<tr>
                    <td>${n(H.law_name||"\u2014")}</td>
                    <td class="cell-number">${n(H.article_no||"\u2014")}</td>
                    <td>${n(H.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${R.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${R.map(H=>{let V=String(H?.law_name||H||"").trim(),se=H&&H.index!==null&&H.index!==void 0?` [${n(H.index)}]`:"";return is(V,{label:`${V}${se}`})}).join("")}
              </div>`:""}
      </div>`:"",g=e.answer_source==="llm"&&w?`<span class="answer-model" title="${n(I)}">${m("brain",11)}${n(w)}</span>`:L?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${m("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",M=l?`${w||"LLM"} \xB7 \u751F\u6210\u4E2D`:g?w||"structured":"retrieval",Q=f?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${ue(f.status)}
          <span class="mono">${n(f.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(f.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(f.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${n(f.primary_model||"\u2014")}</span>
          <span>${Number(f.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",Y=String(e.answer||"").trim()||(l?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":o?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),C=l?" data-partial-answer":"",G=l?" is-streaming":"";return`${u}
      ${F?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${o&&!p?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${a.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${Si(a,O)}</div>
            </div>`:""}
      <div class="answer-block">
        ${F||N?`<div class="answer-block-head">
                <span>${n(A)}</span>
                <span>${n(M)}</span>
              </div>`:""}
        <p class="answer-text${G}"${C}>${n(Y)}</p>
      </div>
      ${e.notice?`<div class="answer-notice">${n(e.notice)}</div>`:""}
      ${Q}
      ${S}
      ${y}`}function un(e,t,s=""){let a=t.status||"preview",r=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),p=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),b=t.answer_source==="structured",k=t.answer_source==="llm"&&o?`<span class="answer-model" title="${n(p)}">${m("brain",11)}${n(o)}</span>`:b?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${m("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${m("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${ue(a,r)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${k}
      </div>
      ${s}
    </div>
    <div class="answer-body">${mn(t)}</div>`}function qi(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${m("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${ie({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function Ai(e){let t=Array.isArray(e.turns)?e.turns:[],s=t.length?t[t.length-1].payload||{}:e.payload||{},a=Array.isArray(s.citations)?s.citations.length:0,r=Array.isArray(s.judgments)?s.judgments.length:0,i=Array.isArray(s.law_sources)?s.law_sources.length:0;return a+r+i}function Li(e,t,s,a=null){let r=e.id??s,i=Ai(e),o=t.get(String(e.project_id||"")),l=Array.isArray(e.turns)?e.turns:[],p=e.updated_at||e.created_at,b=a!=null&&String(a)===String(r);return`<div class="rag-history-item${e.pinned?" is-pinned":""}${b?" is-active":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${n(String(r))}">
      <span class="history-question">${n(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${n(wt(p))}</span>
        ${o?`<span>\xB7 ${n(o.name)}</span>`:""}
        <span>\xB7 ${i?`${i} \u7B46\u4F86\u6E90`:"\u7121\u5F15\u7528"}</span>
        ${l.length>1?`<span>\xB7 ${l.length} \u8F2A</span>`:""}
      </span>
    </button>
    <div class="rag-history-actions">
      <button class="rag-history-pin${e.pinned?" is-pinned":""}" type="button"
        data-rag-action="toggle-pin" data-history-id="${n(String(r))}"
        title="${e.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078\u6B64\u9805\u76EE"}"
        aria-label="${e.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078\u6B64\u9805\u76EE"}"
        aria-pressed="${e.pinned?"true":"false"}">${m("pin",13)}</button>
      <button class="rag-history-more" type="button"
        data-rag-action="open-history-menu" data-history-id="${n(String(r))}"
        title="\u66F4\u591A\u64CD\u4F5C" aria-label="\u66F4\u591A\u64CD\u4F5C" aria-haspopup="menu" aria-expanded="false">${m("more",14)}</button>
    </div>
  </div>`}function pn(e,t,s){let a=new Map;for(let i of t){let o=String(i.project_id||"");o&&a.set(o,(a.get(o)||0)+1)}let r=[`<button class="rag-project${s?"":" is-active"}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${s?"false":"true"}">
      <span class="rag-project-name">${m("grid",13)}<span>\u5168\u90E8</span></span>
      <span class="rag-project-count">${t.length}</span>
    </button>`];for(let i of e){let o=String(i.id),l=a.get(o)||0;r.push(`<button class="rag-project${s===o?" is-active":""}" type="button" data-rag-action="select-project" data-project-id="${n(o)}" aria-pressed="${s===o?"true":"false"}">
      <span class="rag-project-name">${m("folder",13)}<span>${n(i.name)}</span></span>
      <span class="rag-project-count">${l}</span>
    </button>`)}return e.length||r.push('<div class="rag-library-empty">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\u3002</div>'),r.push(`<div class="rag-project-add-wrap">
    <button class="rag-project-add" type="button" data-rag-action="show-project-form">${m("plus",13)}<span>\u5EFA\u7ACB\u5C08\u6848</span></button>
    <form class="rag-project-form" data-rag-form="project" hidden>
      <input class="input" type="text" name="project_name" maxlength="60" placeholder="\u5C08\u6848\u540D\u7A31" aria-label="\u5C08\u6848\u540D\u7A31" autocomplete="off" />
      <div class="rag-project-form-actions">
        <button class="btn btn-primary btn-sm" type="submit">\u5EFA\u7ACB</button>
        <button class="btn btn-ghost btn-sm" type="button" data-rag-action="cancel-project">\u53D6\u6D88</button>
      </div>
    </form>
  </div>`),r.join("")}async function Mi(e){let t=!1,s=[],a=!1,r=[],i=!1,o="",l=8,p="",b=0,k=null,h=[],y=!1,S=!1,f={embedding:[],llm:[]};e.innerHTML=`<section class="page rag-page">
    <div class="rag-layout">
      <aside class="rag-library" aria-label="\u5C0D\u8A71\u5EAB">
        <button class="rag-new-chat" type="button" data-rag-action="new-chat">
          <span class="rag-new-chat-mark">${m("plus",16)}</span>
          <span class="rag-new-chat-copy"><strong>\u65B0\u5C0D\u8A71</strong><small>\u958B\u59CB\u65B0\u7684\u6CD5\u5F8B\u6AA2\u7D22</small></span>
        </button>
        <div class="rag-library-context" id="rag-library-context" hidden></div>
        <section class="rag-library-section" data-rag-section="pinned">
          <button class="rag-library-head" type="button" data-rag-toggle="pinned" aria-expanded="true">
            <span class="rag-library-title">${m("pin",13)}\u5DF2\u91D8\u9078</span>
            <span class="rag-library-count" id="rag-pinned-count">0</span>
            ${m("chevronDown",12,"rag-library-chevron")}
          </button>
          <div class="rag-library-body" id="rag-pinned-body">
            <div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002</div>
          </div>
        </section>
        <section class="rag-library-section" data-rag-section="projects">
          <button class="rag-library-head" type="button" data-rag-toggle="projects" aria-expanded="true">
            <span class="rag-library-title">${m("folder",13)}\u5C08\u6848</span>
            <span class="rag-library-count" id="rag-projects-count">0</span>
            ${m("chevronDown",12,"rag-library-chevron")}
          </button>
          <div class="rag-library-body" id="rag-projects-body"></div>
        </section>
        <section class="rag-library-section rag-library-recent">
          <div class="rag-library-head is-static">
            <span class="rag-library-title">${m("history",13)}\u6700\u8FD1\u9805\u76EE <span class="rag-library-count" id="rag-recent-count">0</span></span>
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
            ${m("sparkles",16)}<span>\u958B\u59CB\u6AA2\u7D22</span>
          </button>
        </div>
      </form>
      <div class="example-chips" id="example-chips" aria-label="\u7BC4\u4F8B\u554F\u984C">
        ${pi.map(c=>`<button class="example-chip" type="button" data-question="${n(c)}">${n(c)}</button>`).join("")}
      </div>
    </header>

    <section class="rag-conversation" id="rag-conversation" aria-live="polite">
      <div class="rag-turns" id="rag-turns">
        ${Ys()}
      </div>
      <form class="rag-followup" id="rag-followup-form" hidden>
        <label class="sr-only" for="rag-followup-question">\u7E7C\u7E8C\u63D0\u554F</label>
        <textarea class="rag-followup-input" id="rag-followup-question" name="question" rows="1"
          maxlength="500" placeholder="\u7E7C\u7E8C\u554F\u4E0B\u4E00\u500B\u554F\u984C\u2026" aria-label="\u7E7C\u7E8C\u63D0\u554F"></textarea>
        <div class="rag-followup-actions">
          <span class="rag-followup-hint"><kbd>Enter</kbd> \u9001\u51FA \xB7 <kbd>Shift</kbd> + <kbd>Enter</kbd> \u63DB\u884C</span>
          <button class="btn btn-primary" type="submit" id="rag-followup-submit">
            ${m("sparkles",15)}<span>\u7E7C\u7E8C\u6AA2\u7D22</span>
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
  </section>`;let w=e.querySelector("#rag-form"),E=e.querySelector("#rag-question"),I=e.querySelector("#rag-submit"),L=e.querySelector(".rag-page"),O=e.querySelector("#rag-turns"),X=e.querySelector("#rag-followup-form"),te=e.querySelector("#rag-followup-question"),R=e.querySelector("#rag-followup-submit"),N=e.querySelector("#rag-history"),F=e.querySelector("#rag-storage-note"),A=e.querySelector("#rag-clear-history"),u=e.querySelector(".rag-library"),g=e.querySelector("#rag-pinned-body"),M=e.querySelector("#rag-projects-body"),Q=e.querySelector("#rag-pinned-count"),K=e.querySelector("#rag-projects-count"),Y=e.querySelector("#rag-recent-count"),C=e.querySelector("#rag-library-context"),G=e.querySelector("#rag-test-mode"),H=e.querySelector("#rag-test-flow"),V=e.querySelector("#rag-history-menu"),se=e.querySelector("#rag-judgment-dialog"),ce=e.querySelector("#rag-law-dialog"),ke=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};se?.addEventListener("close",ke),ce?.addEventListener("close",ke);let fe=null,Ke=null,z=null,ne=null,pe=()=>{E.style.height="auto",E.style.height=`${Math.min(E.scrollHeight,220)}px`},Re=()=>{te.style.height="auto",te.style.height=`${Math.min(te.scrollHeight,160)}px`},nt=c=>{y=!!c,L.classList.toggle("has-conversation",y)},ft=()=>{y&&(X.hidden=!1,Re())},vt=()=>{X.hidden=!0},ve=()=>{V.hidden&&!ne||(V.hidden=!0,V.innerHTML="",ne&&ne.setAttribute("aria-expanded","false"),z=null,ne=null)},Ae=(c,x)=>{let q=O.querySelector(".rag-empty-answer");q&&q.remove(),O.insertAdjacentHTML("beforeend",on(c,x));let B=O.lastElementChild,Z=B?.querySelector("[data-rag-answer]");return window.requestAnimationFrame(()=>{B?.scrollIntoView({behavior:"smooth",block:"start"})}),{turnElement:B,answerElement:Z}},bs=()=>{O.innerHTML=h.length?h.map(c=>on(c.question,un(c.question,c.payload||{},""))).join(""):Ys()},hs=c=>{let x=Array.isArray(c.turns)?c.turns:[];return x.length?(b+=1,Ye(),Ge(null),k=c.id??null,h=x.map(q=>({...q})),p=h[h.length-1]?.question||"",nt(!0),bs(),ft(),xe(),re(I,!1),re(R,!1),window.setTimeout(()=>{X.scrollIntoView({behavior:"smooth",block:"end"})},50),!0):!1},xe=()=>{if(t)return;if(ve(),!a){N.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',g.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',Q.textContent="0",Y.textContent="0",i&&(M.innerHTML=pn(r,[],o));return}let c=r.find(me=>String(me.id)===o)||null;o&&!c&&(o="");let x=new Map(r.map(me=>[String(me.id),me])),q=s.filter(me=>!!me.pinned),B=o?s.filter(me=>String(me.project_id||"")===o):s,Z=B.slice(0,l),oe=(me,Se)=>Li(me,x,Se,k);g.innerHTML=q.length?q.map(oe).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',M.innerHTML=pn(r,s,o),N.innerHTML=Z.length?Z.map(oe).join(""):`<div class="rag-library-empty">${o?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u9805\u76EE\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,B.length>l&&N.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${d(B.length-l)} \u7B46</button>`),Q.textContent=String(q.length),K.textContent=String(r.length),Y.textContent=String(B.length),c?(C.hidden=!1,C.innerHTML=`<span>${m("folder",12)}<strong>${n(c.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${m("x",12)}</button>`):(C.hidden=!0,C.innerHTML="")},It=async()=>{try{let c=await lt("rag.projects",[]);r=Array.isArray(c)?c.map(x=>({id:String(x?.id||""),name:String(x?.name||"").trim()})).filter(x=>x.id&&x.name):[]}catch{r=[]}i=!0,t||xe()},Dt=c=>{o=String(c||""),l=8,xe()},bt=()=>{let c=M.querySelector('[data-rag-form="project"]');c&&(c.hidden=!1,c.querySelector("input")?.focus())},Ot=()=>{let c=M.querySelector('[data-rag-form="project"]');c&&(c.hidden=!0,c.reset())},Ft=async c=>{let x=c.elements.project_name,q=String(x?.value||"").trim();if(!q){j("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),x?.focus();return}if(r.some(Z=>Z.name.toLowerCase()===q.toLowerCase())){j("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),x?.focus();return}let B=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;r=[...r,{id:B,name:q.slice(0,60),created_at:new Date().toISOString()}],o=B,l=8,await Kt("rag.projects",r),xe(),j(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${q}\u300D\u3002`,"ok")},Lt=async c=>{let x=s.find(Z=>String(Z.id)===String(c));if(!x)return;let q=!x.pinned;if(!await jt(x.id,{pinned:q})){j("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}x.pinned=q,xe(),j(q?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},Ht=()=>{b+=1,Ye(),Ge(null),p="",k=null,h=[],nt(!1),vt(),O.innerHTML=Ys(),E.value="",pe(),te.value="",Re(),re(I,!1),re(R,!1),xe(),se?.open&&se.close(),ce?.open&&ce.close(),E.focus(),window.scrollTo({top:0,behavior:"smooth"})},Be=c=>{if(!c||V.hidden)return;let x=c.getBoundingClientRect(),q=V.getBoundingClientRect(),B=6,Z=x.bottom+B;Z+q.height>window.innerHeight-8&&(Z=Math.max(8,x.top-q.height-B));let oe=x.right-q.width;oe=Math.max(8,Math.min(oe,window.innerWidth-q.width-8)),V.style.left=`${Math.round(oe)}px`,V.style.top=`${Math.round(Z)}px`},ht=c=>{V.innerHTML=`
      <button type="button" role="menuitem" data-menu-action="rename">${m("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${m("pin",13)}<span>${c.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${m("link",13)}<span>\u5206\u4EAB</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${m("trash",13)}<span>\u522A\u9664</span></button>`},Ut=c=>{let x=String(c.project_id||""),q=[{id:"",name:"\u672A\u5206\u985E"},...r.map(B=>({id:String(B.id),name:B.name}))];V.innerHTML=`
      <div class="rag-history-menu-head">${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${q.map(B=>`<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${n(B.id)}">
            <span class="rag-history-menu-check">${x===B.id?m("check",12):""}</span>
            <span>${n(B.name)}</span>
          </button>`).join("")}
      ${r.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${m("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},v=(c,x)=>{let q=s.find(B=>String(B.id)===String(x));q&&(ve(),z=String(q.id),ne=c,ht(q),V.hidden=!1,c.setAttribute("aria-expanded","true"),Be(c))},$=async c=>{let x=window.prompt("\u91CD\u65B0\u547D\u540D\u5C0D\u8A71",c.title||"");if(x===null)return;let q=x.trim();if(!q){j("\u540D\u7A31\u4E0D\u80FD\u7A7A\u767D\u3002","warn");return}if(q===c.title)return;if(!await jt(c.id,{title:q})){j("\u91CD\u65B0\u547D\u540D\u5931\u6557\u3002","danger");return}c.title=q,xe(),j("\u5C0D\u8A71\u5DF2\u91CD\u65B0\u547D\u540D\u3002","ok")},_=async c=>{let x=Array.isArray(c.turns)?c.turns:[],q=[`# ${c.title||"\u672A\u547D\u540D\u5C0D\u8A71"}`,""];if(x.length)for(let Z of x){q.push("## \u554F\u984C","",Z.question||"",""),q.push("## \u56DE\u7B54","",Z.payload?.answer||"\uFF08\u6C92\u6709\u56DE\u7B54\u5167\u5BB9\uFF09","");let oe=Array.isArray(Z.payload?.law_sources)?Z.payload.law_sources.map(me=>me.law_name).filter(Boolean):[];oe.length&&q.push(`\u5F15\u7528\uFF1A${[...new Set(oe)].join("\u3001")}`,"")}else q.push(c.title||"");let B=await _t(q.join(`
`));j(B?"\u5C0D\u8A71\u5167\u5BB9\u5DF2\u8907\u88FD\uFF0C\u53EF\u76F4\u63A5\u8CBC\u4E0A\u5206\u4EAB\u3002":"\u7121\u6CD5\u8907\u88FD\u5C0D\u8A71\u5167\u5BB9\u3002",B?"ok":"warn")},T=async c=>{if(!window.confirm(`\u522A\u9664\u5C0D\u8A71\u300C${c.title||"\u672A\u547D\u540D\u5C0D\u8A71"}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002`))return;if(!await Sa(c.id)){j("\u522A\u9664\u5931\u6557\u3002","danger");return}let q=k!==null&&String(k)===String(c.id);s=s.filter(B=>String(B.id)!==String(c.id)),q?Ht():xe(),j("\u5C0D\u8A71\u5DF2\u522A\u9664\u3002","ok")},D=async(c,x)=>{if(!await jt(c.id,{project_id:x})){j("\u79FB\u81F3\u5C08\u6848\u5931\u6557\u3002","danger");return}c.project_id=x;let B=r.find(Z=>String(Z.id)===String(x));xe(),j(B?`\u5DF2\u79FB\u81F3\u5C08\u6848\u300C${B.name}\u300D\u3002`:"\u5DF2\u79FB\u51FA\u5C08\u6848\u3002","ok")},P=async c=>{let x=c.target.closest("[data-menu-action]");if(!x)return;let q=s.find(Z=>String(Z.id)===z);if(!q){ve();return}let B=x.dataset.menuAction;B==="rename"?(ve(),await $(q)):B==="toggle-pin"?(ve(),await Lt(q.id)):B==="share"?(ve(),await _(q)):B==="move"?(Ut(q),Be(ne)):B==="assign-project"?(ve(),await D(q,x.dataset.projectId||"")):B==="back"?(ht(q),Be(ne)):B==="delete"&&(ve(),await T(q))},U=c=>{V.hidden||(typeof c.composedPath=="function"?c.composedPath():[]).includes(V)||V.contains(c.target)||c.target.closest('[data-rag-action="open-history-menu"]')||ve()},le=c=>{c.key==="Escape"&&ve()},$e=c=>{c.target instanceof Node&&V.contains(c.target)||ve()},we=async()=>{try{if(s=await Wt({limit:120}),t)return;a=!0,xe(),F.textContent=Vt()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;s=[],a=!0,xe(),N.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},he=async(c,x,q,B)=>{let Z=h,oe=k;Z.push({question:c,asked_at:new Date().toISOString(),payload:gi(x)});let me=Array.isArray(x.citations)?x.citations:[],Se=Array.isArray(x.judgments)?x.judgments:[],Ie={question:c,status:x.status,citations:me.map(Pe=>Pe.law_name),judgments:Se.map(Pe=>Pe.jid)},ze=`${x.status||"preview"} \xB7 ${Z.length} \u8F2A`,Oe=new Date().toISOString(),yt=Pe=>{B===b&&(k=Pe)};if(oe){if(!await jt(oe,{turns:Z,detail:ze,payload:Ie,updated_at:Oe})){let Mt=await Tt({kind:"rag",title:Z[0]?.question||c,detail:ze,project_id:q,turns:Z,payload:Ie,updated_at:Oe});yt(Mt)}}else{let Pe=await Tt({kind:"rag",title:Z[0]?.question||c,detail:ze,project_id:q,turns:Z,payload:Ie,updated_at:Oe});yt(Pe)}await we()},Ce=async()=>{try{let c=await J.status();if(t)return;let x=c.data||{},B=new Map((c.services||[]).map(Se=>[Se.id,Se])).get("rag"),Z=Number(x.judgment_indexed_count||0),oe=Number(x.judgment_count||0),me=e.querySelector("#rag-mode-notice");if(!me)return;B?.status==="operational"?me.innerHTML=ie({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${d(Z)} / ${d(oe)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`}):B?.status==="degraded"?me.innerHTML=ie({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:n(B.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002")}):me.innerHTML=ie({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:n(B?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002")})}catch(c){if(t)return;let x=e.querySelector("#rag-mode-notice");x&&(x.innerHTML=ie({tone:"warn",title:"\u7121\u6CD5\u53D6\u5F97 RAG \u670D\u52D9\u72C0\u614B",text:n(c.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u524D\u5F80\u7CFB\u7D71\u72C0\u614B\u9801\u67E5\u770B\u3002")}))}},_e=()=>{if(!G)return;if(!S){G.innerHTML="";return}let c=Array.isArray(f.embedding)?f.embedding.length:0,x=Array.isArray(f.llm)?f.llm.length:0;G.innerHTML=ie({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${c} \u500B embedding \u8207 ${x} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},On=async()=>{try{let c=await J.testMode();if(t)return;S=!!c.enabled,f=c.models||{embedding:[],llm:[]},_e()}catch{if(t)return;S=!1,_e()}},ca=c=>{S=!!c.detail?.enabled,f=c.detail?.models||{embedding:[],llm:[]},_e()};window.addEventListener("judgment:test-mode",ca);let Ge=c=>{H&&(Ke=c||null,H.innerHTML=c?xt(c,[],"",{showHistory:!1}):"")},Ye=()=>{fe&&(window.clearTimeout(fe),fe=null)},da=()=>{Ye();let c=async()=>{if(!t){try{let x=await J.testRunCurrent();if(t)return;let q=x.run;q&&q.status==="running"&&Ge(q)}catch{}t||(fe=window.setTimeout(c,1500))}};c()},Fn=async c=>{if(!c){Ge(null);return}try{let x=await J.testRun(c);if(t)return;Ge(x.run||null)}catch{t||j("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},Hn=async()=>{if(S)try{let c=await J.testRunCurrent();if(t)return;c.run?.status==="running"&&(Ge(c.run),da())}catch{}},ys=0,$s=(c,x)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${n(c)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${m("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${x}</div>`,Un=c=>{let x=(Array.isArray(c.matched_laws)?c.matched_laws:[]).map(oe=>is(oe)).join(""),q=[c.court,c.jdate,c.title?`\u6848\u7531\uFF1A${c.title}`:"",c.full_text_length?`${d(c.full_text_length)} \u5B57`:"",c.citation_count?`\u5F15\u7528 ${d(c.citation_count)} \u7B46`:""].filter(Boolean).map(oe=>`<span>${n(oe)}</span>`).join(""),B=c.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${n(String(c.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",Z=c.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(c.pdf_url)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return $s(c.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${n(c.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${q}
      </div>
      ${x?`<div class="chips" style="margin:8px 0 10px">${x}</div>`:""}
      <div class="judgment-dialog-source">${B}</div>
      <pre class="judgment-dialog-text">${n(c.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${Z}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},ua=async c=>{if(!se||!c)return;let x=++ys;se.open||se.showModal(),ke(),se.innerHTML=$s("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${n(c)}\u2026</span>
      </div>`);try{let q=await J.judgmentDetail(c,"parquet");if(t||x!==ys)return;se.innerHTML=Un(q)}catch(q){if(t||x!==ys)return;se.innerHTML=$s("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(q.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},ws=0,_s=(c,x)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${n(c)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${m("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${x}</div>`,Jn=(c,x="")=>{let q=String(c.selected_article_no||x||"").trim(),B=!!q,Z=Array.isArray(c.articles)?c.articles:[],oe=Z.map(Xe=>{let xs=String(Xe.article_content||"").trim();return xs?Xe.article_type==="C"?`<div class="law-chapter">${n(xs)}</div>`:`<article class="law-article" data-article-no="${n(dn(Xe.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${n(Xe.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${n(xs)}</div>
        </article>`:""}).join(""),me=(Array.isArray(c.warnings)?c.warnings:[]).map(Xe=>n(Xe)).join("<br />"),Se=c.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",Ie=c.meta?.articles_source,ze=Ie==="parquet"?"Parquet \u689D\u6587":Ie==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",Oe=c.meta?.snapshot||"",yt=[c.law_level,c.law_category,c.article_count?`${d(c.article_count)} \u689D`:"",c.law_modified_date?`\u7570\u52D5 ${He(c.law_modified_date)}`:""].filter(Boolean).map(Xe=>`<span>${n(Xe)}</span>`).join(""),Pe=c.law_url?`<a class="btn btn-secondary btn-sm" href="${n(c.law_url)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",Mt=!B&&c.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${n(c.law_histories)}</div>
        </details>`:"",ye=B?`<span class="badge badge-mono">${n(q)}</span>`:"",De=!B&&Z.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",$t=B?`${c.law_name||c.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${q}`:c.law_name||c.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return _s($t,`<div class="judgment-dialog-meta">
        <span class="badge ${c.source_type==="order"?"badge-warn":"badge-info"}">${n(Se)}</span>
        ${ye}
        ${yt}
      </div>
      <div class="judgment-dialog-source">${n([ze,Oe].filter(Boolean).join(" \xB7 "))}</div>
      ${me?`<div class="law-dialog-warning">${me}</div>`:""}
      ${Mt}
      ${De}
      <div class="law-dialog-articles">${oe||`<div class="report-empty-inline">${B?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${Pe}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},pa=(c,x)=>{let q=c?.querySelector(`#${x}`),B=dn(q?.value||"");if(!B){j("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),q?.focus();return}let Z=[...c?.querySelectorAll("[data-article-no]")||[]].find(oe=>oe.dataset.articleNo===B);if(!Z){j(`\u627E\u4E0D\u5230\u7B2C ${B} \u689D\u3002`,"warn");return}Z.scrollIntoView({behavior:"instant",block:"center"}),Z.classList.add("is-jump-target"),window.setTimeout(()=>Z.classList.remove("is-jump-target"),2400)},ks=async(c,x="",q="")=>{if(!ce||!c)return;let B=++ws;ce.open||ce.showModal(),ke(),ce.innerHTML=_s(q?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${n([c,q].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let Z=await J.lawDetail(c,x,"",q);if(t||B!==ws)return;ce.innerHTML=Jn(Z,q)}catch(Z){if(t||B!==ws)return;ce.innerHTML=_s("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(Z.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};ce?.addEventListener("click",c=>{let x=c.target.closest('[data-action="jump-law-article"]');if(x){pa(ce,x.dataset.jumpInput||"rag-law-article-jump");return}if(c.target.closest('[data-action="close-law-source"]')){ce.close();return}let q=ce.getBoundingClientRect();(c.clientX<q.left||c.clientX>q.right||c.clientY<q.top||c.clientY>q.bottom)&&ce.close()}),ce?.addEventListener("keydown",c=>{!c.target.matches(".law-jump-input")||c.key!=="Enter"||(c.preventDefault(),pa(ce,c.target.id))}),se?.addEventListener("click",c=>{let x=c.target.closest('[data-action="open-law-source"]');if(x){ks(x.dataset.lawKey||"",x.dataset.sourceType||"",x.dataset.articleNo||"");return}if(c.target.closest('[data-action="close-parquet-judgment"]')){se.close();return}let q=se.getBoundingClientRect();(c.clientX<q.left||c.clientX>q.right||c.clientY<q.top||c.clientY>q.bottom)&&se.close()}),O.addEventListener("click",c=>{let x=c.target.closest(".rag-process-toggle");if(x){let B=x.closest(".rag-process"),Z=x.getAttribute("aria-expanded")==="true";Xs(B,!Z);return}let q=c.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(q){if(q.dataset.action==="open-law-source"){ks(q.dataset.lawKey||"",q.dataset.sourceType||"",q.dataset.articleNo||"");return}ua(q.dataset.jid||"")}}),O.addEventListener("keydown",c=>{if(c.key!=="Enter"&&c.key!==" ")return;let x=c.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!x||x.closest("a, button"))){if(c.preventDefault(),x.dataset.action==="open-law-source"){ks(x.dataset.lawKey||"",x.dataset.sourceType||"",x.dataset.articleNo||"");return}ua(x.dataset.jid||"")}});let Ss=async(c,{fresh:x=!1,source:q="hero"}={})=>{let B=c.trim();if(!B){j("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),(q==="followup"?te:E).focus();return}(x||!y)&&(k=null,h=[],O.innerHTML="",xe());let Z=++b,oe=()=>t||Z!==b,me=o;p=B,nt(!0),vt(),q==="followup"?(te.value="",Re()):(E.value="",pe());let{answerElement:Se}=Ae(B,yi(B,S)),Ie=S?null:hi(Se);S?(Ge(null),da()):(Ye(),Ge(null)),re(I,!0,"\u6AA2\u7D22\u4E2D\u2026"),re(R,!0,"\u6AA2\u7D22\u4E2D\u2026");let ze=null,Oe="",yt=ye=>{if(oe()||!ye?.partial)return;let De=Se.querySelector(".answer-body");if(!De)return;ze=ye,Oe=String(ye.answer||""),De.innerHTML=mn(ye),Ie?.collapse?.();let $t=Se.querySelector(".answer-head-title");$t&&($t.textContent=ye.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},Pe=ye=>{if(oe()||!ye||!ze?.streaming)return;Oe+=ye;let De=Se.querySelector("[data-partial-answer]");De&&(De.textContent=Oe)},Mt=()=>{if(oe()||!ze?.streaming)return;Oe="";let ye=Se.querySelector("[data-partial-answer]");ye&&(ye.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")};try{let ye=S?await J.rag(B,{testMode:S}):await J.ragStream(B,{onStep:$t=>{oe()||Ie?.step($t)},onPartial:yt,onToken:Pe,onTokenReset:Mt});if(oe())return;Ye();let De=Ie?.finish(!0)||"";if(Se.innerHTML=un(B,ye,De),ye.test_run?.run_id?await Fn(ye.test_run.run_id):Ge(null),await he(B,ye,me,Z),oe())return;ft()}catch(ye){if(oe())return;Ye();let De=Ie?.finish(!1)||"";Se.innerHTML=qi(ye,De),ft(),j(ye.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{oe()||(Ye(),re(I,!1),re(R,!1))}};return w.addEventListener("submit",c=>{c.preventDefault(),Ss(E.value,{fresh:!0,source:"hero"})}),X.addEventListener("submit",c=>{c.preventDefault(),Ss(te.value,{fresh:!1,source:"followup"})}),E.addEventListener("input",pe),E.addEventListener("keydown",c=>{c.key==="Enter"&&!c.shiftKey&&!c.isComposing&&(c.preventDefault(),w.requestSubmit())}),te.addEventListener("input",Re),te.addEventListener("keydown",c=>{c.key==="Enter"&&!c.shiftKey&&!c.isComposing&&(c.preventDefault(),X.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",c=>{let x=c.target.closest("[data-question]");x&&(E.value=x.dataset.question,pe(),w.requestSubmit())}),u.addEventListener("click",async c=>{let x=c.target.closest("[data-rag-toggle]");if(x){let Se=x.closest(".rag-library-section").classList.toggle("is-collapsed");x.setAttribute("aria-expanded",String(!Se));return}let q=c.target.closest("[data-rag-action]"),B=q?.dataset.ragAction||"";if(B==="new-chat"){Ht();return}if(B==="open-history-menu"){v(q,q.dataset.historyId);return}if(B==="toggle-pin"){await Lt(q.dataset.historyId);return}if(B==="select-project"){Dt(q.dataset.projectId||"");return}if(B==="show-project-form"){bt();return}if(B==="cancel-project"){Ot();return}if(B==="more-recent"){l+=12,xe();return}if(B==="clear-project"){Dt("");return}let Z=c.target.closest("[data-history-open]");if(!Z)return;let oe=s.find(me=>String(me.id)===String(Z.dataset.historyId));oe&&(o=String(oe.project_id||""),xe(),!hs(oe)&&(k=null,h=[],Ss(oe.title,{fresh:!0,source:"history"})))}),u.addEventListener("submit",async c=>{let x=c.target.closest('[data-rag-form="project"]');x&&(c.preventDefault(),await Ft(x))}),V.addEventListener("click",P),document.addEventListener("click",U),document.addEventListener("keydown",le),window.addEventListener("scroll",$e,!0),window.addEventListener("resize",ve),A.addEventListener("click",async()=>{if(!s.length){j("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await xa(),await we(),j("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),pe(),await Promise.allSettled([Ce(),we(),It(),On()]),await Hn(),()=>{t=!0,Ye(),ve(),document.removeEventListener("click",U),document.removeEventListener("keydown",le),window.removeEventListener("scroll",$e,!0),window.removeEventListener("resize",ve),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",ca),p&&O.setAttribute("data-last-question",p)}}var ea={};rt(ea,{render:()=>so});var Ti=2e3,ji={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"}},gn={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},fn={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},wn={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"},os={judgment:"#a78bfa",law:"#22d3ee",order:"#f472b6",system:"#94a3b8"},Ei={extract:"file",raw_parquet:"cube",filter:"filter",postgres:"database",qdrant:"brain",download:"download",parse:"sliders"},Ri={raw_parquet:"\u539F\u59CB Parquet",postgres:"PostgreSQL"};function Bt(e){return ji[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Te(e,t){let s=Bt(e);return`<span class="badge ${gn[s.tone]||gn.idle}"><span class="status-dot ${fn[s.tone]||fn.idle}"></span>${n(t||s.label)}</span>`}function mt(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function vn(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":d(e)}function qt(e){return e&&e.color?String(e.color):"var(--accent)"}function ls(e,t=""){let s=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),a=e.status==="running"&&s===null,r=a?' aria-valuetext="\u9032\u5EA6\u672A\u77E5"':` aria-valuenow="${s??0}"`;return`<div class="processing-bar${a?" is-indeterminate":""}${t?` ${t}`:""}" role="progressbar" aria-valuemin="0" aria-valuemax="100"${r}>
    <span class="processing-bar-fill" style="width:${s??0}%;background:${n(qt(e))}"></span>
  </div>`}function Ci(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${ae(s)} / ${ae(a)}`:ae(s):a?`${d(s)} / ${d(a)} ${t}`:`${d(s)} ${t}`}function Ni(e){let t=[`<span>${n(Ci(e))}</span>`];return e.percent===null||e.percent===void 0?e.status==="running"&&t.push('<span class="mono">\u9032\u5EA6\u672A\u77E5</span>'):t.push(`<span class="mono">${mt(e.percent)}</span>`),e.duration_ms&&t.push(`<span class="mono">${W(e.duration_ms)}</span>`),t.join("")}function Pi(e){let s=(Array.isArray(e.stats)?e.stats:[]).map(r=>`<span class="processing-stage-stat"><span>${n(r.label)}</span><strong>${n(r.value)}</strong></span>`),a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&s.push(`<span class="processing-stage-stat"><span>\u7D22\u5F15\u8986\u84CB</span><strong>${d(a.indexed)} / ${d(a.total)}</strong></span>`),s.length?`<div class="processing-stage-stats">${s.join("")}</div>`:""}function Bi(e,{compact:t=!1,step:s=null}={}){let a=Bt(e.status),r=e.status==="running";return`<div class="processing-stage${t?" is-compact":""} is-${a.tone}${r?" is-live":""}" style="--stage-color:${n(qt(e))}"${r?' aria-current="step"':""}>
    <div class="processing-stage-head">
      ${s===null?"":`<span class="processing-stage-step">${String(s).padStart(2,"0")}</span>`}
      <span class="processing-stage-swatch" style="background:${n(qt(e))}"></span>
      <span class="processing-stage-label">${n(e.label||e.key)}</span>
      ${Te(e.status)}
    </div>
    ${ls(e)}
    <div class="processing-stage-meta">${Ni(e)}</div>
    ${e.message?`<div class="processing-stage-message" title="${n(e.message)}">${n(e.message)}</div>`:""}
    ${t?"":Pi(e)}
  </div>`}function _n(e){let t=Bt(e);return`<span class="flow-status is-${t.tone}"><span class="flow-status-dot"></span>${n(t.label)}</span>`}function bn(e,t){return t==null||t===""?"\u2014":e.unit==="bytes"?ae(t):d(t)}function Ii(e){let t=[{label:"\u76EE\u524D",value:bn(e,e.current)},{label:"\u7E3D\u91CF",value:bn(e,e.total)},{label:"\u767E\u5206\u6BD4",value:e.percent===null||e.percent===void 0?e.status==="running"?"\u8A08\u7B97\u4E2D":"\u2014":mt(e.percent)},{label:"\u8017\u6642",value:e.duration_ms?W(e.duration_ms):"\u2014"}],s=Array.isArray(e.stats)?e.stats:[];for(let r of s){if(t.length>=6)break;r&&r.label&&r.value&&t.push({label:String(r.label),value:String(r.value)})}let a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&!t.some(r=>r.label==="\u7D22\u5F15\u8986\u84CB")&&t.push({label:"\u7D22\u5F15\u8986\u84CB",value:`${d(a.indexed)} / ${d(a.total)}`}),t}function Di(e,t){let s=Bt(e.status),a=e.status==="running",r=Ii(e);return`<article class="flow-node is-${s.tone}${a?" is-live":""}" style="--stage-color:${n(qt(e))}"${a?' aria-current="step"':""}>
    <div class="flow-node-head">
      <span class="flow-node-icon">${m(Ei[e.key]||"cube",14)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">STEP ${String(t+1).padStart(2,"0")}</span>
        <strong>${n(Ri[e.key]||e.label||e.key)}</strong>
      </div>
      ${_n(e.status)}
    </div>
    <div class="flow-node-body">
      ${ls(e,"flow-progress")}
      <div class="flow-node-props">${r.map(i=>`<div class="flow-prop"><span>${n(i.label)}</span><strong>${n(i.value)}</strong></div>`).join("")}</div>
      ${e.message?`<div class="flow-node-note" title="${n(e.message)}">${n(e.message)}</div>`:""}
    </div>
  </article>`}function Oi(e,t,s,a){let r=qt(e),i=a||"#8b5cf6",o=e.status==="running",l=`${s}-${t}`,p=`flow-gradient-${l}`,b=`flow-marker-${l}`,k=t%2===0?"M2 60 C8 42 16 78 22 60":"M2 60 C8 78 16 42 22 60";return`<div class="flow-link${o?" is-live":""}" style="color:${n(r)}" aria-hidden="true">
    <svg viewBox="0 0 28 120" width="28" height="120" fill="none">
      <defs>
        <linearGradient id="${p}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${n(i)}"/>
          <stop offset="1" stop-color="${n(r)}"/>
        </linearGradient>
        <marker id="${b}" viewBox="0 0 8 8" refX="6.2" refY="4" markerWidth="4.6" markerHeight="4.6" orient="auto">
          <path d="M0 0 8 4 0 8Z" fill="${n(r)}"/>
        </marker>
      </defs>
      <path class="flow-link-line" d="${k}" stroke="url(#${p})" stroke-width="1.7" stroke-linecap="round" marker-end="url(#${b})"/>
      <circle class="flow-link-port" cx="2" cy="60" r="3.6" stroke="${n(i)}" stroke-width="1.5"/>
      <circle class="flow-link-port" cx="26" cy="60" r="3.6" stroke="${n(r)}" stroke-width="1.5"/>
    </svg>
  </div>`}function kn(e){if(!e)return"";let t=[];return e.started_at&&t.push(`\u958B\u59CB ${de(e.started_at)}`),e.duration_ms&&t.push(`\u8017\u6642 ${W(e.duration_ms)}`),e.pid&&t.push(`PID ${e.pid}`),t.join(" \xB7 ")}function Fi(e,{active:t,focus:s,status:a,runLine:r,runningStage:i}){let o=e.label||wn[e.key]||e.key;return`<div class="flow-source${t?" is-live":""}" style="--branch-accent:${os[e.key]||os.system}">
    <div class="flow-source-head">
      <span class="flow-source-icon">${m(e.icon||"database",15)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">SOURCE</span>
        <strong>${n(o)}</strong>
      </div>
      ${_n(a)}
    </div>
    <div class="flow-source-body">
      <p class="flow-source-desc">${n(e.description||"")}</p>
      <div class="flow-source-meta">${r}</div>
      ${i?`<div class="flow-source-current"><span class="flow-current-dot"></span>\u76EE\u524D\u968E\u6BB5\uFF1A<strong>${n(i.label||i.key)}</strong></div>`:""}
      ${s&&s.message?`<div class="flow-source-note" title="${n(s.message)}">${n(s.message)}</div>`:""}
    </div>
  </div>`}function Hi(e){let t=e.active_run,s=t||e.focus_run||e.last_run,a=t?"running":s?s.status:"idle",r=s?n(kn(s)||wt(s.started_at||s.finished_at)):"\u5C1A\u7121\u57F7\u884C\u7D00\u9304",i=Array.isArray(e.stages)?e.stages:[],o=i.find(h=>h.status==="running"),l=os[e.key]||os.system,p=String(e.key||"branch").replace(/[^a-zA-Z0-9_-]/g,""),b=Fi(e,{active:t,focus:s,status:a,runLine:r,runningStage:o}),k=i.length?i.map((h,y)=>{let S=y?qt(i[y-1]):l;return`${Oi(h,y,p,S)}${Di(h,y)}`}).join(""):'<div class="flow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u968E\u6BB5\u3002</div>';return`<article class="flow-lane" style="--branch-accent:${l}"><div class="flow-row">${b}${k}</div></article>`}function Ui(e){return`<div class="flow-canvas-open">
    <div class="processing-branches">${(Array.isArray(e.branches)?e.branches:[]).map(Hi).join("")}</div>
  </div>`}function pt(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${n(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function Ji(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},r=e.raw_backups||{},i=r.totals||{},o=e.state||{},l=e.capabilities||{},p=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",b=t.status==="operational",k=s.status==="operational",h=a.available!==!1,y=r.available!==!1,S=k?`${d(s.indexed)} / ${d(s.total)}`:Te(s.status||"unavailable"),f=k?`${mt(s.percent)} \xB7 \u5C1A\u9918 ${d(s.remaining)} \u7B46`:n(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),w=h?`${d(a.unprocessed)} / ${d(a.total)}`:Te("unavailable"),E=h?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${ae(a.unprocessed_bytes)} \u5F85\u8655\u7406`:n(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${pt("\u8655\u7406\u72C0\u614B",Te(e.status||"unknown"),`${n(p)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${pt("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",n(w),E)}
    ${pt("\u539F\u59CB Parquet \u5099\u4EFD",y?`${d(r.count)} \u6A94`:Te("unavailable"),y?`\u5171 ${d(i.row_count)} \u7B46 \xB7 ${ae(i.compressed_bytes)}`:n(r.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB Parquet \u5099\u4EFD\u3002"))}
    ${pt("PostgreSQL \u5224\u6C7A",b?d(t.judgment_count):Te("unavailable"),b?`\u6CD5\u898F ${vn(t.law_count)} \xB7 \u547D\u4EE4 ${vn(t.order_count)}`:n(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${pt("Qdrant \u7D22\u5F15",S,f)}
    ${pt("\u72C0\u614B\u6A94",Te(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${n(de(o.updated_at))}`:n(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${pt("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?n(l.start_blocked_reason):`\u672A\u8655\u7406 ${d(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${d(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${d(l.external_processes)} \u500B`:""}`)}
  </div>`}function Qi(e){if(e.available===!1)return ie({tone:"warn",title:"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304",text:n(e.error||"\u7121\u6CD5\u6383\u63CF .rar \u6A94\u6848\u3002")});let t=Number(e.total)||0,s=Number(e.processed)||0,a=Number(e.unprocessed)||0,r=t?100*s/t:null;return`<div class="processing-archive-summary">
    <div class="processing-archive-summary-head">
      <span class="mono">${n(e.data_dir||"")}</span>
      <span>${d(s)} / ${d(t)} \u5DF2\u8655\u7406 \xB7 ${d(a)} \u5F85\u8655\u7406 \xB7 ${ae(e.unprocessed_bytes)} \u5F85\u8655\u7406</span>
    </div>
    ${ls({percent:r,status:a?"pending":"success",color:"var(--success)"},"processing-bar-lg")}
    <div class="processing-archive-summary-meta">
      <span>\u58D3\u7E2E\u6A94\u532F\u5165\u8986\u84CB ${mt(r)}</span>
      <span>\u5168\u90E8 ${ae(e.total_bytes)}</span>
    </div>
  </div>`}function Gi(e){let t=e.stages||{},a=["extract","filter","postgres"].map(r=>t[r]).filter(Boolean).map(r=>Bi(r,{compact:!0}));return a.length?`<div class="processing-archive-stages">${a.join("")}</div>`:""}function zi(e){let t=e.status||"pending",s=t==="running",a=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),r=s&&a===null,i=[];return e.message&&i.push(e.message),e.error&&i.push(e.error),(e.scanned||e.matched||e.stored)&&i.push(`\u6383\u63CF ${d(e.scanned)} \xB7 \u547D\u4E2D ${d(e.matched)} \xB7 \u5BEB\u5165 ${d(e.stored)}`),`<div class="processing-archive is-${Bt(t).tone}">
    <div class="processing-archive-head">
      <span class="processing-archive-name mono">${n(e.name)}</span>
      <div class="processing-archive-bar-wrap">
        ${ls({percent:a,status:t,color:s?"var(--accent)":"var(--success)"})}
      </div>
      <span class="processing-archive-percent mono">${r?"\u9032\u884C\u4E2D":mt(a)}</span>
      ${Te(t)}
      <span class="processing-archive-size faint">${ae(e.size_bytes)}</span>
    </div>
    ${Gi(e)}
    ${i.length?`<div class="processing-archive-note">${i.map(o=>`<span>${n(o)}</span>`).join("")}</div>`:""}
  </div>`}function Vi(e){let t=e.archives||{},s=e.local_archives||{},a=Array.isArray(t.items)?t.items:[],r=t.run,i=`<div class="report-section-head">
    <div>
      <div class="report-kicker">ARCHIVE PIPELINE</div>
      <h2 class="report-section-title">\u5224\u6C7A\u58D3\u7E2E\u6A94</h2>
      <p class="processing-section-sub">\u6BCF\u500B\u58D3\u7E2E\u6A94\u540D\u7A31\u5F8C\u65B9\u5373\u6642\u986F\u793A\u8655\u7406\u9032\u5EA6\uFF1B\u672A\u53D6\u5F97\u53EF\u8A08\u7B97\u7684\u7E3D\u91CF\u6642\u6A19\u793A\u300C\u9032\u5EA6\u672A\u77E5\u300D\uFF0C\u4E0D\u4EE5\u63A8\u6E2C\u6578\u503C\u4EE3\u66FF\u3002</p>
    </div>
  </div>`,o=t.source==="run"?`${Te(r?r.status:"idle")} <span>\u76EE\u524D\u986F\u793A ${r?n(r.title||"\u5224\u6C7A\u532F\u5165"):"\u6700\u8FD1\u4E00\u6B21\u532F\u5165"} \u7684\u9010\u6A94\u9032\u5EA6${r&&r.started_at?` \xB7 ${n(kn(r))}`:""}</span>`:t.external?`${Te("running")} <span>${n(t.note||"\u5916\u90E8\u532F\u5165\u7A0B\u5E8F\u672A\u5BEB\u5165\u9010\u6A94\u72C0\u614B\uFF1B\u4EE5\u4E0B\u70BA PostgreSQL \u8986\u84CB\u7387\u3002")}</span>`:'<span class="faint">\u76EE\u524D\u6C92\u6709\u53EF\u8B80\u53D6\u7684\u532F\u5165 run \u72C0\u614B\uFF1B\u4EE5\u4E0B\u4EE5 PostgreSQL \u7684 source_archive \u5224\u5B9A\u662F\u5426\u5DF2\u8655\u7406\u3002</span>';return`<section class="report-card processing-card">
    <div class="report-head">${i}</div>
    <div class="report-section">
      ${Qi(s)}
      <div class="processing-archive-run">${o}</div>
      ${a.length?`<div class="processing-archive-list">${a.map(zi).join("")}</div>`:`<div class="processing-empty">\u627E\u4E0D\u5230 .rar \u58D3\u7E2E\u6A94\uFF1B\u8ACB\u78BA\u8A8D ${n(s.data_dir||"\u5224\u6C7A\u8CC7\u6599\u76EE\u9304")}\u3002</div>`}
    </div>
  </section>`}function Wi(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let r=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${n(o.color||"var(--accent)")}" title="${n(`${o.label} ${W(o.duration_ms)} (${mt(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${n(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${n(o.label)}</span>
        <span class="mono">${W(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${mt(o.percent)}</span>
        ${Te(o.status)}
      </div>`).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section">
      <div class="processing-timeline-label">
        <span>${n(t.label||"\u968E\u6BB5\u8017\u6642")}</span>
        <span class="mono">\u7E3D\u8A08 ${W(t.total_ms)}</span>
      </div>
      <div class="processing-stack" role="img" aria-label="\u968E\u6BB5\u8017\u6642\u6BD4\u4F8B">${r}</div>
      <div class="processing-legend">${i}</div>
    </div>
  </section>`}function Ki(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let r=t.map(i=>{let o=s.get(i.branch)||wn[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${n(o)}</span>
          <strong>${n(i.title||"\u8655\u7406")}</strong>
          ${Te(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${n(de(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?W(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${n(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${r}</div></div>
  </section>`}function Yi(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>ie({tone:s.tone||"info",title:s.title,text:n(s.message||"")})).join("")}</div>`:""}function hn(e){return`${Yi(e)}
    ${Ji(e)}
    <section class="processing-flow-section">
      <div class="processing-section-head">
        <div>
          <div class="report-kicker">PIPELINE CANVAS</div>
          <h2 class="report-section-title">\u8655\u7406\u6D41\u7A0B</h2>
          <p class="processing-section-sub">\u5224\u6C7A\u3001\u6CD5\u898F\u3001\u547D\u4EE4\u4E09\u689D\u6D41\u7A0B\u5373\u6642\u53CD\u6620\u76EE\u524D\u57F7\u884C\u968E\u6BB5\uFF1B\u66F2\u7DDA\u7531\u4F86\u6E90\u7BC0\u9EDE\u9023\u5230\u5404\u968E\u6BB5\uFF0C\u767C\u5149\u7BC0\u9EDE\u8207\u6D41\u52D5\u66F2\u7DDA\u8868\u793A\u76EE\u524D\u57F7\u884C\u4F4D\u7F6E\u3002</p>
        </div>
      </div>
      ${Ui(e)}
    </section>
    ${Vi(e)}
    ${Wi(e)}
    ${Ki(e)}`}function Xi(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${ie({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:n(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${n(de(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${m("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}var Sn={overview:"activity",full_update:"download",law_download:"layers",order_download:"file",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function Zi(e){let t=Array.isArray(e.workflows)?e.workflows:[];return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...t.map(s=>{let a=s.active_run||null,r=a||s.last_run||null;return{...s,activeRun:a,lastRun:r,status:r?.status||"idle"}})]}function yn(e,t){return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${Zi(e).map(a=>{let r=a.id===t,i=Sn[a.id]||"terminal";return`<button class="status-tab${r?" is-active":""}" type="button"
            data-processing-workflow="${n(a.id)}"
            ${r?'aria-current="page"':""}>
            <span class="status-tab-icon">${m(i,15)}</span>
            <span class="status-tab-copy">
              <strong>${n(a.label)}</strong>
              <small>${n(a.description||"")}</small>
            </span>
            ${Te(a.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${n(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function eo(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${Te(e.status)}
      <span class="mono">${n(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${n(de(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${W(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${n(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${n(t.log_path)}</strong>`:""}
    </div>
  </div>`}function to(e){let t=e.active_run||null,s=t||e.last_run||null,a=!!t,r=!!e.can_run&&!a,i=e.id==="full_update",o=Array.isArray(e.command)?e.command.join(" "):"";return`<div class="processing-workflow-panel">
    ${ie({tone:"info",title:e.label,text:e.description||""})}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m(Sn[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
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
          ${m("play",14)}<span>${a?"\u57F7\u884C\u4E2D":i?"\u57F7\u884C\u8CC7\u6599\u66F4\u65B0":"\u57F7\u884C\u6B64\u6D41\u7A0B"}</span>
        </button>
        ${t?`<button class="btn btn-secondary btn-sm processing-stop" type="button"
                data-processing-action="stop">${m("x",14)}<span>\u505C\u6B62</span></button>`:""}
      </div>
      <div class="side-card-foot">
        ${i?"\u6703\u4F9D\u5E8F\u57F7\u884C\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u8207\u53EF\u9078\u7684 Qdrant \u7D22\u5F15\u3002":"\u57F7\u884C\u7D50\u679C\u6703\u5BEB\u5165\u5171\u7528\u8655\u7406\u72C0\u614B\u6A94\uFF0C\u53EF\u5F9E\u8655\u7406\u7E3D\u89BD\u67E5\u770B\u3002"}
      </div>
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${Te(s?.status||"idle")}
      </div>
      ${eo(s)}
    </section>
  </div>`}function $n(e,t){if(t==="overview")return hn(e);let a=(Array.isArray(e.workflows)?e.workflows:[]).find(r=>r.id===t);return a?to(a):hn(e)}async function so(e){e.innerHTML=`<section class="page processing-page">
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
          ${m("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
        <button class="btn btn-secondary btn-sm processing-stop" type="button" data-processing-action="stop" id="processing-stop" hidden>
          ${m("x",14)}<span>\u505C\u6B62\u66F4\u65B0</span>
        </button>
        <button class="btn btn-primary btn-sm" type="button" data-processing-action="update" id="processing-update">
          ${m("download",14)}<span data-update-label>\u8CC7\u6599\u66F4\u65B0</span>
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
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-workflows"),r=e.querySelector("#processing-update"),i=e.querySelector("#processing-stop"),o=e.querySelector("#processing-refresh"),l=e.querySelector("#processing-index-toggle"),p=!1,b=!1,k=!1,h=null,y="",S="",f="overview",w=null,E=F=>{let A=F.capabilities||{},u=!!(l&&l.checked),g=u?A.can_start_update_with_index!==!1:A.can_start_update!==!1,M=u&&A.index_blocked_reason||A.start_blocked_reason;if(!k){r.disabled=!g,r.title=M||"\u6AA2\u67E5\u7DDA\u4E0A\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0C\u4E26\u8655\u7406\u672A\u532F\u5165\u7684\u5224\u6C7A\u58D3\u7E2E\u6A94\u3002";let Q=r.querySelector("[data-update-label]");Q&&(Q.textContent=g?"\u8CC7\u6599\u66F4\u65B0":A.active_update_id?"\u66F4\u65B0\u57F7\u884C\u4E2D":"\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D"),i.hidden=!A.can_stop_update,l&&(l.disabled=A.can_start_update===!1)}},I=async({silent:F=!1}={})=>{if(!(p||b)){b=!0,F||re(o,!0,"\u66F4\u65B0\u4E2D\u2026");try{let A=await J.processing();if(p)return;h=A;let u=yn(A,f);u!==S&&(a.innerHTML=u,S=u);let g=$n(A,f);g!==y&&(s.innerHTML=g,y=g);let M=s.querySelector("[data-processing-updated-at]");if(M){let Q=de(A.generated_at);M.textContent!==Q&&(M.textContent=Q)}E(A)}catch(A){if(p)return;let u=Xi(A.message,h);u!==y&&(s.innerHTML=u,y=u),F||j(A.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{b=!1,F||re(o,!1)}}},L=async F=>{if(!k){k=!0,re(F,!0,"\u555F\u52D5\u4E2D\u2026");try{let A=!!(l&&l.checked),u=await J.startProcessingUpdate(A);j(`\u5DF2\u555F\u52D5\u8CC7\u6599\u66F4\u65B0${A?"\uFF0C\u5B8C\u6210\u5F8C\u63A5\u7E8C Qdrant \u7D22\u5F15":""}\u3002`,"ok",6e3),u&&u.run_id&&console.info("processing update started",u),await I({silent:!0})}catch(A){j(A.message||"\u7121\u6CD5\u555F\u52D5\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{k=!1,re(F,!1),h&&E(h)}}},O=async(F,A)=>{if(!k){k=!0,re(F,!0,"\u555F\u52D5\u4E2D\u2026");try{let u=await J.startProcessingWorkflow(A);j("\u5DF2\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","ok",6e3),u&&u.run_id&&console.info("processing workflow started",u),await I({silent:!0})}catch(u){j(u.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{k=!1,re(F,!1),h&&E(h)}}},X=async F=>{if(!k){k=!0,re(F,!0,"\u505C\u6B62\u4E2D\u2026");try{let A=await J.stopProcessingUpdate();j(A.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3),await I({silent:!0})}catch(A){j(A.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{k=!1,re(F,!1),h&&E(h)}}},te=F=>{let A=F.target.closest("[data-processing-action]");if(!A||A.disabled)return;let u=A.dataset.processingAction;if(u==="refresh")I({silent:!1});else if(u==="update")L(A);else if(u==="run-workflow"){let g=A.dataset.workflowId||"";g==="full_update"?L(A):O(A,g)}else u==="stop"&&X(A)},R=F=>{F.target===l&&h&&E(h)},N=F=>{let A=F.target.closest("[data-processing-workflow]");if(A&&(f=A.dataset.processingWorkflow||"overview",h)){let u=yn(h,f);a.innerHTML=u,S=u;let g=$n(h,f);s.innerHTML=g,y=g}};return t.addEventListener("click",te),a.addEventListener("click",N),l&&l.addEventListener("change",R),await I({silent:!1}),w=window.setInterval(()=>{document.hidden||I({silent:!0})},Ti),()=>{p=!0,w!==null&&window.clearInterval(w),t.removeEventListener("click",te),a.removeEventListener("click",N),l&&l.removeEventListener("change",R)}}var na={};rt(na,{render:()=>ko});var qn={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u9000\u5F79",badge:"badge-neutral"}},ds={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},sa={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},xn={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function An(e){let t=qn[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${n(t.label)}</span>`}function aa(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function ao(e){return aa(e).map(t=>{let[s,a]=t.split("|").map(r=>r.trim());return{law_name:s||"",source_type:a||""}})}function no(e){return aa(e).map(t=>{let[s,a]=t.split("|").map(r=>r.trim());return{law_name:s||"",article_no:a||""}})}function ro(e){return aa(e).map(t=>({jid:t.trim()}))}function io(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function oo(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function lo(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function co(e){return(e?.tags||[]).join(", ")}function cs(e){return`<div class="qb-empty">${m("info",18)}<span>${n(e)}</span></div>`}function Ln(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),r=[...t.map(i=>`<span class="chip">${n(i)}</span>`),...s.map(i=>`<span class="chip">${n(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${n(i)}</span>`)];return r.length?`<div class="chips qb-labels">${r.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function uo(e){let t=!!e;return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${m(t?"edit":"plus",14)}${t?`\u7DE8\u8F2F\u984C\u76EE #${e.id}`:"\u65B0\u589E\u984C\u76EE"}</span>
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
          <select class="select" name="question_type">${Object.entries(ds).map(([s,a])=>`<option value="${s}" ${e?.question_type===s?"selected":""}>${a}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u96E3\u5EA6</span>
          <select class="select" name="difficulty">${Object.entries(sa).map(([s,a])=>`<option value="${s}" ${e?.difficulty===s?"selected":""}>${a}</option>`).join("")}</select>
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
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${n(io(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${n(oo(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${n(lo(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${n(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${n(co(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
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
        <button class="btn btn-primary" type="submit">${m("check",14)}<span>${t?"\u5132\u5B58\u65B0\u7248\u672C":"\u5EFA\u7ACB\u984C\u76EE"}</span></button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-create">\u6E05\u9664</button>
      </div>
      <div class="qb-form-hint">\u4FEE\u6539\u5DF2\u5B58\u5728\u7684\u984C\u76EE\u6703\u5EFA\u7ACB\u65B0\u7248\u672C\uFF1B\u5DF2\u6838\u51C6\u984C\u76EE\u4FEE\u6539\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002</div>
    </form>
    <details class="qb-import">
      <summary>${m("upload",14)}JSON \u6279\u6B21\u532F\u5165</summary>
      <p class="qb-muted">\u683C\u5F0F\uFF1A<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>\u3002\u76F8\u540C\u984C\u76EE fingerprint \u9810\u8A2D\u66F4\u65B0\u3002</p>
      <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${m("upload",13)}<span>\u532F\u5165 JSON</span></button>
      </div>
    </details>
  </section>`}function ta(e,{reviewMode:t=!1}={}){return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${n(e.question)}</strong>
        <span class="qb-meta">
          ${n(ds[e.question_type]||e.question_type)}
          \xB7 ${n(sa[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${An(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${n(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${Ln(e)}
    <div class="qb-item-foot">
      <span>\u66F4\u65B0 ${n(de(e.updated_at))}</span>
      ${e.reviewed_by?`<span>\u5BE9\u6838 ${n(e.reviewed_by)}</span>`:""}
      ${e.review_comment?`<span class="qb-comment">${n(e.review_comment)}</span>`:""}
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${m("edit",13)}<span>\u7DE8\u8F2F</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${e.id}">${m("shield",13)}<span>${t?"\u6279\u6CE8":"\u9A57\u6536"}</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
      </div>
    </div>
  </article>`}function po(e){return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}\u984C\u5EAB\u7BA1\u7406</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="new">${m("plus",13)}<span>\u65B0\u589E</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="revalidate">${m("refresh",13)}<span>\u91CD\u65B0\u9A57\u8B49</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="export">${m("download",13)}<span>\u532F\u51FA JSON</span></button>
      </div>
    </div>
    <form class="qb-filters" data-qb-form="filter">
      <input class="input" name="query" type="search" placeholder="\u641C\u5C0B\u984C\u76EE\u6216\u53C3\u8003\u7B54\u6848" value="${n(e.filters.query)}" />
      <select class="select" name="status">
        <option value="">\u5168\u90E8\u72C0\u614B</option>
        ${Object.entries(qn).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(ds).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(sa).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <input class="input" name="tag" placeholder="\u6A19\u7C64" value="${n(e.filters.tag)}" />
      <button class="btn btn-primary btn-sm" type="submit">${m("search",13)}<span>\u7BE9\u9078</span></button>
    </form>
    <div class="qb-list">
      ${e.items.length?e.items.map(t=>ta(t)).join(""):cs("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${d(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}function mo(e){let t=e.reviewDetail;return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("shield",14)}\u984C\u5EAB\u4EBA\u5DE5\u9A57\u6536\u6279\u6CE8</span>
      <span class="badge badge-warn">\u5F85\u5BE9 ${d(e.stats.pending_review||0)}</span>
    </div>
    <label class="field qb-reviewer-field">
      <span class="field-label">\u9A57\u6536\u8005\u540D\u7A31</span>
      <input class="input" id="qb-reviewer-name" value="${n(e.reviewer)}" placeholder="\u76EE\u524D\u4EFB\u4F55\u4EBA\u53EF\u9A57\u6536\uFF1BGoogle Auth \u5F8C\u6539\u7531\u7BA1\u7406\u8005" />
    </label>
    ${t?`<div class="qb-review-detail">
            <button class="btn btn-ghost btn-sm" type="button" data-qb-action="review-back">${m("chevronLeft",13)}<span>\u8FD4\u56DE\u5F85\u5BE9\u5217\u8868</span></button>
            ${ta(t,{reviewMode:!0})}
            ${Ln(t)}
            ${t.reference_answer?`<div class="qb-reference"><span class="summary-label">\u53C3\u8003\u7B54\u6848</span><p>${n(t.reference_answer)}</p></div>`:""}
            <form class="qb-review-form" data-qb-form="review" data-id="${t.id}">
              <div class="qb-score-grid">
                ${[["clarity","\u984C\u76EE\u6E05\u6670"],["labels","\u6CD5\u898F\uFF0F\u689D\u6587\u6A19\u8A3B"],["answer","\u53C3\u8003\u7B54\u6848"],["difficulty","\u96E3\u5EA6\u8207\u6A19\u7C64"],["overall","\u6574\u9AD4"]].map(([s,a])=>`<label class="field"><span class="field-label">${a} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${s}" value="4" /></label>`).join("")}
              </div>
              <label class="field"><span class="field-label">\u6279\u6CE8</span><textarea class="input" name="comment" rows="3" placeholder="\u6A19\u8A3B\u7406\u7531\u3001\u9700\u8981\u4FEE\u6539\u7684\u6B04\u4F4D\uFF0C\u6216\u9A57\u6536\u7D50\u8AD6\u3002"></textarea></label>
              <div class="qb-actions">
                <button class="btn btn-primary btn-sm" type="button" data-qb-action="decide" data-decision="approved">${m("check",13)}<span>\u6838\u51C6</span></button>
                <button class="btn btn-secondary btn-sm" type="button" data-qb-action="decide" data-decision="changes_requested">${m("edit",13)}<span>\u9000\u56DE\u4FEE\u6539</span></button>
                <button class="btn btn-ghost btn-sm" type="button" data-qb-action="decide" data-decision="rejected">${m("x",13)}<span>\u62D2\u7D55</span></button>
              </div>
            </form>
            ${t.reviews?.length?`<div class="qb-review-history"><span class="summary-label">\u5BE9\u6838\u7D00\u9304</span>${t.reviews.map(s=>`<div class="qb-review-row"><span>${n(s.reviewer||"\u533F\u540D")}</span>${An(s.decision==="approved"?"accepted":s.decision)}<span>${n(de(s.created_at))}</span><p>${n(s.comment||"\u2014")}</p></div>`).join("")}</div>`:""}
          </div>`:`<div class="qb-list">${e.reviewItems.length?e.reviewItems.map(s=>ta(s,{reviewMode:!0})).join(""):cs("\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u984C\u76EE\u3002")}</div>`}
  </section>`}function go(e){let t=e.editingSuite;return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("cube",14)}Benchmark \u984C\u5EAB</span>
      <span class="badge badge-info">${d(e.ready.length)} benchmark-ready</span>
    </div>
    <form class="qb-suite-form" data-qb-form="suite">
      <input type="hidden" name="suite_id" value="${t?.id||""}" />
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${n(t?.name||"Pilot 30")}" /></label>
        <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(xn).map(([s,a])=>`<option value="${s}" ${t?.tier===s?"selected":""}>${a}</option>`).join("")}</select></label>
      </div>
      <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${n(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
      <div class="qb-check-list">
        ${e.ready.length?e.ready.map(s=>{let a=t?t.items?.some(r=>Number(r.id)===Number(s.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${s.id}" ${a?"checked":""}/><span><strong>#${s.id}</strong> ${n(s.question)} <small>${n(ds[s.question_type]||s.question_type)}</small></span></label>`}).join(""):cs("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
      </div>
      <div class="qb-actions">
        <button class="btn btn-primary" type="submit">${m("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
        ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
      </div>
    </form>
    <div class="qb-list">
      ${e.suites.length?e.suites.map(s=>`<article class="qb-suite">
        <div class="qb-item-head">
          <div class="qb-item-title"><strong>${n(s.name)}</strong><span class="qb-meta">${n(xn[s.tier]||s.tier)} \xB7 v${s.version} \xB7 ${d(s.item_count)} \u984C</span></div>
          <span class="badge ${s.status==="frozen"?"badge-ok":"badge-neutral"}">${s.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
        </div>
        <div class="qb-suite-items">${(s.items||[]).slice(0,8).map(a=>`<span class="chip">#${a.id} ${n(a.question.slice(0,22))}${a.question.length>22?"\u2026":""}</span>`).join("")}${s.item_count>8?`<span class="qb-muted">+${s.item_count-8}</span>`:""}</div>
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${s.id}">${m("edit",13)}<span>\u7DE8\u8F2F\u984C\u76EE</span></button>
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${s.id}">${m("shield",13)}<span>\u51CD\u7D50</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${s.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
        </div>
      </article>`).join(""):cs("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
    </div>
  </section>`}function fo(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),r=Number(a?.value);Number.isFinite(r)&&(t[s]=Math.max(1,Math.min(5,Math.round(r))))}return t}function vo(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:ao(t.get("expected_laws")),expected_articles:no(t.get("expected_articles")),expected_judgments:ro(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function Mn(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},r={tab:"",editing:null,editingSuite:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tag:""},stats:{},suites:[],ready:[],reviewItems:[],reviewDetail:null,reviewer:(()=>{try{return window.localStorage.getItem("judgment.reviewer")||"anonymous"}catch{return"anonymous"}})()},i=R=>e.querySelector(`#quality-panel-${a[R]}`),o=R=>{r.reviewer=String(R||"").trim()||"anonymous";try{window.localStorage.setItem("judgment.reviewer",r.reviewer)}catch{}},l=()=>{s&&s(r.stats)},p=R=>{t&&t(R),f(R)},b=async()=>{try{r.stats=await J.questionBankStats()}catch{r.stats={}}l()},k=()=>{let R=i("create");R&&(R.innerHTML=uo(r.editing))},h=async()=>{let R=i("manage");if(R){R.innerHTML='<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026</span></div></section>';try{let N=await J.questionBankItems(r.filters,r.limit,r.offset);r.items=N.items||[],r.total=Number(N.total||0),r.stats=N.stats||r.stats,R.innerHTML=po(r),l()}catch(N){R.innerHTML=`<section class="report-card qb-card">${ie({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:n(N.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},y=async()=>{let R=i("suite");if(R){R.innerHTML='<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026</span></div></section>';try{let[N,F]=await Promise.all([J.benchmarkSuites(),J.benchmarkReadyQuestions(300)]);r.suites=N.suites||[],r.ready=F.items||[],R.innerHTML=go(r)}catch(N){R.innerHTML=`<section class="report-card qb-card">${ie({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:n(N.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},S=async()=>{let R=i("review");if(R){R.innerHTML='<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>\u8B80\u53D6\u5F85\u5BE9\u984C\u76EE\u4E2D\u2026</span></div></section>';try{let[N,F]=await Promise.all([J.questionBankItems({status:"pending_review"},100,0),J.questionBankItems({status:"changes_requested"},100,0)]);r.reviewItems=[...N.items||[],...F.items||[]],r.stats=N.stats||r.stats,r.reviewDetail&&(r.reviewDetail=await J.questionBankItem(r.reviewDetail.id)),R.innerHTML=mo(r);let A=R.querySelector("#qb-reviewer-name");A&&(A.value=r.reviewer,A.addEventListener("change",()=>o(A.value))),l()}catch(N){R.innerHTML=`<section class="report-card qb-card">${ie({tone:"danger",title:"\u5F85\u5BE9\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:n(N.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}};function f(R){r.tab=R;for(let N of Object.keys(a)){let F=i(N);F&&(F.hidden=N!==R)}R==="create"?k():R==="manage"?h():R==="suite"?y():R==="review"&&S()}let w=R=>{let N=r.items.find(F=>Number(F.id)===Number(R));r.reviewDetail=N||{id:Number(R)},p("review")},E=async R=>{let N=vo(R),F=Number(R.elements.item_id?.value||0);try{F?(await J.updateQuestionBankItem(F,{...N,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),j("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await J.createQuestionBankItem(N),j("\u984C\u76EE\u5DF2\u5EFA\u7ACB\u3002","ok")),r.editing=null,await b(),p("manage")}catch(A){let u=A.detail||A.payload?.detail,g=u?.errors?.join(" \xB7 ")||u?.message||A.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";j(g,"danger",8e3)}},I=async(R,N)=>{let F=Number(R.dataset.id||0);if(F)try{await J.reviewQuestionBankItem(F,{decision:N,reviewer:r.reviewer,rubric_scores:fo(R),comment:String(R.querySelector('[name="comment"]')?.value||"")}),j(N==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":N==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",N==="approved"?"ok":"info"),r.reviewDetail=null,await b(),await S()}catch(A){let u=A.detail||A.payload?.detail,g=u?.errors?.join(" \xB7 ")||u?.message||A.message||"\u9A57\u6536\u5931\u6557\u3002";j(g,"danger",8e3)}},L=async R=>{let N=new FormData(R),F=Number(N.get("suite_id")||0),A=Array.from(R.querySelectorAll('input[name="item_ids"]:checked')).map(g=>Number(g.value)),u={name:String(N.get("name")||"").trim(),tier:String(N.get("tier")||"core"),description:String(N.get("description")||"").trim(),item_ids:A};try{F?(await J.updateBenchmarkSuite(F,u),j("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await J.createBenchmarkSuite(u),j("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),r.editingSuite=null,await y()}catch(g){let M=g.detail||g.payload?.detail,Q=M?.errors?.join(" \xB7 ")||M?.message||g.message||"Suite \u5132\u5B58\u5931\u6557\u3002";j(Q,"danger",8e3)}},O=async R=>{let N=R.target.closest("[data-qb-action]")?.dataset.qbAction;if(!N)return;let F=R.target.closest("[data-qb-action]"),A=Number(F.dataset.id||0);if(N==="new"){r.editing=null,p("create");return}if(N==="reset-create"){r.editing=null,k();return}if(N==="edit"){let u=r.items.find(g=>Number(g.id)===A);if(!u)return;r.editing=u,p("create");return}if(N==="review"){w(A);return}if(N==="review-back"){r.reviewDetail=null,S();return}if(N==="delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${A}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await J.deleteQuestionBankItem(A),j("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await b(),await h()}catch(u){j(u.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(N==="revalidate"){try{let u=await J.revalidateQuestionBank();j(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${d(u.checked||0)} \u984C\uFF0C${d(u.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await b(),await h()}catch(u){j(u.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(N==="export"){try{let u=await J.exportQuestionBank({status:""});Je(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(u,null,2),"application/json;charset=utf-8")}catch(u){j(u.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(N==="import-json"){let u=e.querySelector("#qb-import-json");try{let g=JSON.parse(String(u?.value||"").trim()),M=await J.importQuestionBank(g);j(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${M.created}\u3001\u66F4\u65B0 ${M.updated}\u3001\u932F\u8AA4 ${(M.errors||[]).length}\u3002`,(M.errors||[]).length?"warn":"ok",8e3),u&&(u.value=""),await b(),await h()}catch(g){j(g.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(N==="prev"||N==="next"){r.offset=Math.max(0,r.offset+(N==="next"?r.limit:-r.limit)),await h();return}if(N==="suite-edit"){let u=r.suites.find(g=>Number(g.id)===A);if(!u)return;r.editingSuite=u,y();return}if(N==="suite-new"){r.editingSuite=null,y();return}if(N==="suite-freeze"){try{await J.updateBenchmarkSuite(A,{freeze:!0}),j("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),r.editingSuite=null,await y()}catch(u){j(u.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(N==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${A}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await J.deleteBenchmarkSuite(A),j("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),r.editingSuite=null,await y()}catch(u){j(u.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(N==="decide"){let u=F.closest("form[data-qb-form='review']");u&&await I(u,String(F.dataset.decision||""))}},X=async R=>{let N=R.target.closest("[data-qb-form]");if(!N)return;R.preventDefault();let F=N.dataset.qbForm;if(F==="create")await E(N);else if(F==="filter"){let A=new FormData(N);r.filters={query:String(A.get("query")||"").trim(),status:String(A.get("status")||""),question_type:String(A.get("question_type")||""),difficulty:String(A.get("difficulty")||""),tag:String(A.get("tag")||"").trim()},r.offset=0,await h()}else F==="suite"&&await L(N)};e.addEventListener("click",O),e.addEventListener("submit",X);let te=async()=>{await b(),r.tab==="create"?k():r.tab==="manage"?await h():r.tab==="suite"?await y():r.tab==="review"&&await S()};return b(),{show:f,refresh:te,destroy(){e.removeEventListener("click",O),e.removeEventListener("submit",X)},getStats:()=>r.stats}}function ps(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function Tn(e){return e==null?"\u2014":d(e)}function bo(e){return e.count?e.severity==="danger"?ue("failed","\u9700\u8655\u7406"):e.severity==="warn"?ue("warning","\u6CE8\u610F"):ue("preview","\u63D0\u793A"):ue("success","\u901A\u904E")}function ho(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function yo(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${ho(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${n(e.label)}</span>
      ${bo(e)}
    </div>
    <div class="quality-check-value">
      <strong>${d(t)}</strong>
      <span>\u7B46</span>
      <em>${n(ps(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${n(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function us(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
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
  </div>`}function $o(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},r=t.postgres_diff,i=r==null?"\u2014":r===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${d(Math.abs(r))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${d(t.vector_indexed)} / ${d(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${m("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${d(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${d(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${Tn(t.postgres_judgments)}</div>
      <div class="metric-foot">${n(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${n(ps(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${n(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${Tn(a.candidate_total)}</div>
      <div class="metric-foot">${d(a.candidate_archive_count)} / ${d(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function wo(e){return e.length?`<div class="table-wrap">
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
              <td class="cell-number">${n(ps(t.match_rate))}</td>
              <td class="cell-number">${d(t.short_text_rows)}</td>
              <td class="cell-number">${d(s)}</td>
              <td class="cell-number">${d(t.duplicate_content_rows)}</td>
              <td class="cell-date">${n(He(t.date_min))} \u2013 ${n(He(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:je({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function _o(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],r=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=ae(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${ue(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${d(t.rows)} \u7B46 \xB7 ${d(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${W(e.scan_ms||0)} \xB7
          ${n(de(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${m("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${ie({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(p=>n(p)).join("<br>")})}</div>`:""}
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
        <div class="summary-value">${n(ps(t.match_rate))}</div>
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
      <div class="quality-checks">${a.map(yo).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${$o(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${d(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${wo(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${us("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${us("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${us("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${us("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function ko(e){e.innerHTML=`<section class="page data-page quality-page">
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
          ${m("refresh",15)}<span>\u91CD\u65B0\u6383\u63CF</span>
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
            <span class="status-tab-icon">${m("activity",15)}</span>
            <span class="status-tab-copy"><strong>\u54C1\u8CEA\u7E3D\u89BD</strong><small>DuckDB \u539F\u59CB\u8CC7\u6599\u8207\u8986\u84CB\u6AA2\u67E5</small></span>
            <span class="badge badge-neutral" id="quality-badge-overview">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="create">
            <span class="status-tab-icon">${m("plus",15)}</span>
            <span class="status-tab-copy"><strong>\u984C\u5EAB\u65B0\u589E</strong><small>\u5EFA\u7ACB\u984C\u76EE\u3001\u6A19\u8A3B\u8207 JSON \u532F\u5165</small></span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="manage">
            <span class="status-tab-icon">${m("database",15)}</span>
            <span class="status-tab-copy"><strong>\u984C\u5EAB\u7BA1\u7406</strong><small>\u7248\u672C\u3001\u72C0\u614B\u3001\u6A19\u7C64\u8207\u522A\u9664</small></span>
            <span class="badge badge-neutral" id="quality-badge-manage">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="suite">
            <span class="status-tab-icon">${m("cube",15)}</span>
            <span class="status-tab-copy"><strong>Benchmark \u984C\u5EAB</strong><small>\u51CD\u7D50 suite \u8207 benchmark-ready \u984C\u76EE</small></span>
            <span class="badge badge-neutral" id="quality-badge-suite">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="review">
            <span class="status-tab-icon">${m("shield",15)}</span>
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),r=[...e.querySelectorAll("[data-quality-tab]")],i={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},o=null,l="overview",p=()=>{if(!o)return;t.innerHTML=_o(o),a.textContent=`DUCKDB \xB7 ${d(o.totals?.rows)} \u7B46 \xB7 ${W(o.scan_ms||0)}`;let f=e.querySelector("#quality-badge-overview");f&&(f.textContent=d(o.totals?.rows||0))},b=f=>{l=f==="overview"?"overview":f;for(let w of r){let E=w.dataset.qualityTab===l;w.classList.toggle("is-active",E),E?w.setAttribute("aria-current","page"):w.removeAttribute("aria-current")}for(let[w,E]of Object.entries(i))E&&(E.hidden=w!==l);l!=="overview"?a.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":o&&p()},k=Mn(e,{onNavigate:f=>b(f),onStats:f=>{let w=f||{},E=e.querySelector("#quality-badge-manage"),I=e.querySelector("#quality-badge-suite"),L=e.querySelector("#quality-badge-review");E&&(E.textContent=d(w.total||0)),I&&(I.textContent=d(w.benchmark_ready||0)),L&&(L.textContent=d((w.pending_review||0)+(w.changes_requested||0)))}}),h=f=>{b(f),f!=="overview"&&k.show(f)},y=async()=>{re(s,!0,"\u6383\u63CF\u4E2D\u2026");try{o=await J.quality(),p()}catch(f){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${ie({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:n(f.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",j("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{re(s,!1)}},S=async()=>{l==="overview"?await y():await k.refresh()};s.addEventListener("click",S),e.addEventListener("click",f=>{let w=f.target.closest("[data-quality-tab]");w&&h(w.dataset.qualityTab||"overview")}),t.addEventListener("click",f=>{!f.target.closest("[data-action='export-quality']")||!o||Je(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(o,null,2),"application/json;charset=utf-8")}),b("overview"),await y()}var ra={};rt(ra,{render:()=>Vo});var jn={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var Rn={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},Cn=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 Data \u2192 AI",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}];function So(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Ue(e).label,tone:Ue(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function xo(e){let t=Ue(e.status),s=jn[e.kind]||jn.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${d(e.latency_ms)} ms</span>`;return`<article class="service-card">
    <div class="service-top">
      <span class="service-icon">${m(s,14)}</span>
      <span class="service-name" title="${n(e.name)}">${n(e.name)}</span>
      <span class="service-kind">${n(e.kind||"")}</span>
    </div>
    <div class="service-status">
      <span class="status-dot ${t.tone==="ok"?"is-ok":t.tone==="warn"?"is-warn":t.tone==="danger"?"is-danger":"is-idle"}" aria-hidden="true"></span>
      ${n(t.label)}
      ${a}
    </div>
    <p class="service-detail" title="${n(e.detail||"")}">${n(e.detail||"")}</p>
  </article>`}function qo(e,t){return`<div class="arch-node ${e?"":"is-muted"}" ${e?"":'title="\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"'}>${n(t)}</div>`}function Ao(e,t){if(e==="IndexedDB")return _a();let a={PostgreSQL:"postgres",Parquet:"parquet",Qdrant:"qdrant",Embedding:"embedding",Retriever:"rag","RAG Engine":"rag",LLM:"llm"}[e];return a?t.find(i=>i.id===a)?.status==="operational":!0}function Lo(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>qo(Ao(l,t),l)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${n(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),r=[];return a.forEach((i,o)=>{o&&r.push(`<div class="arch-arrow" aria-hidden="true">${m("arrowRight",15)}</div>`),r.push(i)}),`<div class="arch-flow">${r.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${m("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>`}function Mo(e){return!Array.isArray(e)||!e.length?'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>':`<div class="endpoint-list">
    ${e.map(t=>`<div class="endpoint-row">
          <span class="endpoint-method">${n(t.method)}</span>
          <span class="endpoint-path" title="${n(t.path)}">${n(t.path)}</span>
          <span class="endpoint-label">${n(t.label||"")}</span>
        </div>`).join("")}
  </div>`}function ge(e,t){return`<div class="detail-row">
    <span class="detail-label">${n(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function To(e){return e?`<div class="detail-list">
    ${ge("\u7248\u672C ID",`<strong>#${d(e.id)}</strong>`)}
    ${ge("\u8CC7\u6599\u985E\u578B",ue("operational",e.source_type==="law"?"\u6CD5\u898F":"\u547D\u4EE4"))}
    ${ge("\u4F86\u6E90\u66F4\u65B0\u65E5",`<strong>${n(e.update_date||"\u2014")}</strong>`)}
    ${ge("\u6CD5\u898F / \u689D\u6587",`<strong>${d(e.law_count)} / ${d(e.article_count)}</strong>`)}
    ${ge("\u4E0B\u8F09\u6642\u9593",`<span class="mono">${de(e.downloaded_at)}</span>`)}
    ${ge("Parquet",`<code title="${n(e.parquet_path||"")}">${n(e.parquet_path||"\u2014")}</code>`)}
  </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}function jo(e){if(!Array.isArray(e)||!e.length)return je({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${n(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${Gt(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function Eo(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=new Map(s.map(w=>[w.id,w])),r=a.get("qdrant"),i=a.get("embedding"),o=a.get("rag"),l=a.get("llm"),p=Number(t.judgment_indexed_count||0),b=Number(t.judgment_count||0),k=b?(p/b*100).toFixed(1):"0.0",h=t.judgment_vector_points===null||t.judgment_vector_points===void 0?"\u2014":d(t.judgment_vector_points),y=Number(t.judgment_index_remaining||0),S=o?.status==="operational"?"RAG \u5C31\u7DD2":o?.status==="not_configured"?"\u672A\u8A2D\u5B9A":o?.status==="degraded"?"\u964D\u7D1A":"\u672A\u77E5",f=[["cube","Qdrant \u5411\u91CF\u7D22\u5F15",r],["layers",`Embedding\uFF08${t.judgment_vector_model||"\u2014"}\uFF09`,i],["brain","RAG \u56DE\u7B54\u7BA1\u7DDA",o],["sparkles","LLM \u6A21\u578B",l]];return`<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}RAG \u8CC7\u6599\u73FE\u6CC1</span>
      ${ue(o?.status,S)}
    </div>
    <div class="side-card-body">
      <div class="mini-stats">
        <div class="mini-stat">
          <div class="mini-stat-value">${d(b)}</div>
          <div class="mini-stat-label">\u5224\u6C7A</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${d(p)}</div>
          <div class="mini-stat-label">\u5DF2\u7D22\u5F15</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${k}%</div>
          <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
        </div>
      </div>
      <div class="side-status-list">
        ${f.map(([w,E,I])=>`<div class="side-status-row">
              <span>${m(w,13)}${n(E)}</span>
              ${ue(I?.status,I?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
            </div>`).join("")}
      </div>
      <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
        Collection\uFF1A${n(t.judgment_vector_collection||"\u2014")} \xB7
        ${h} points \xB7 \u5269\u9918 ${d(y)} \u7B46\u5F85\u7D22\u5F15
      </div>
    </div>
    <div class="side-card-foot">
      PostgreSQL \u5224\u6C7A\u6587\u4EF6\u3001Qdrant \u5411\u91CF\u7D22\u5F15\u8207 Ollama \u6A21\u578B\u72C0\u614B\u7686\u70BA\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u5C31\u7DD2\u6642\u6703\u660E\u78BA\u964D\u7D1A\u3002
    </div>
  </section>`}function Ro(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=So(e.status),r=s.find(b=>b.id==="qdrant"),i=s.find(b=>b.id==="rag"),o=s.find(b=>b.id==="llm"),l=tt(),p=Rn[l]||l;return`<section class="status-hero">
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
          <span>${m("clock",11)} \u6AA2\u67E5\u6642\u9593 ${de(e.checked_at)} \xB7 ${n(wt(e.checked_at))}</span>
          <span>${m("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${m("database",11)} ${d(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${m("layers",11)} ${d(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${n(p)}">${m("link",11)} ${n(it())}</span>
        </div>
      </div>
    </section>

    <div class="service-grid">${s.map(xo).join("")}</div>

    ${Eo(e)}

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

    ${r?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${ie({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${n(r?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${n(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${n(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}`}function Co(e){let t=Array.isArray(e.services)?e.services:[],s=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Data \u2192 Intelligence</div>
      </div>
      <span class="badge badge-neutral badge-mono">${d((s.flow||[]).length)} layers</span>
    </div>
    ${Lo(s,t)}
  </div>`}function No(e){let t=tt(),s=Rn[t]||t,a=Fe("/api/docs"),r=Fe("/api/openapi.json");return`<div class="status-columns is-single">
    <section class="card">
      <div class="side-card-head">
        <span class="side-card-title">${m("terminal",14)}API \u7AEF\u9EDE</span>
        <a href="${n(a)}" target="_blank" rel="noopener noreferrer" class="chip"
          >OpenAPI ${m("external",11)}</a>
      </div>
      ${Mo(e.endpoints)}
      <div class="side-card-foot">
        \u76EE\u524D API Base\uFF1A<code>${n(it())}</code>\uFF08${n(s)}\uFF09\u3002\u4E92\u52D5\u5F0F API \u6587\u4EF6\u4F4D\u65BC <a href="${n(a)}" target="_blank" rel="noopener noreferrer"><code>${n(a)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${n(r)}" target="_blank" rel="noopener noreferrer"><code>${n(r)}</code></a>\u3002
      </div>
    </section>
  </div>`}function Po(e){let t=e.data||{},s=Number(t.judgment_indexed_count||0),a=Number(t.judgment_count||0),r=a?(s/a*100).toFixed(1):"0.0",i=Number(t.judgment_index_remaining||0);return`<div class="status-summary">
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
          <span class="side-card-title">${m("layers",14)}\u6700\u65B0\u8CC7\u6599\u7248\u672C</span>
          ${ue("operational","Parquet")}
        </div>
        ${To(t.last_version)}
        <div class="side-card-foot">
          \u539F\u59CB Parquet \u5408\u8A08 ${ae(t.parquet_bytes)}\uFF1BPostgreSQL \u4FDD\u5B58 metadata \u8207\u7248\u672C\u72C0\u614B\u3002
        </div>
      </section>
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${m("database",14)}\u8CC7\u6599\u96C6\u7D71\u8A08</span>
          <span class="badge badge-neutral badge-mono">${d(t.parquet_files)} FILES</span>
        </div>
        <div class="detail-list">
          ${ge("\u73FE\u884C\u6CD5\u898F",`<strong>${d(t.law_count)}</strong>`)}
          ${ge("\u73FE\u884C\u547D\u4EE4",`<strong>${d(t.order_count)}</strong>`)}
          ${ge("\u689D\u6587\u7E3D\u6578",`<strong>${d(t.article_count)}</strong>`)}
          ${ge("\u539F\u59CB Parquet",`<strong>${ae(t.parquet_bytes)}</strong>`)}
          ${ge("\u5224\u6C7A\u6587\u4EF6",`<strong>${d(t.judgment_count)}</strong>`)}
          ${ge("\u5411\u91CF\u7D22\u5F15",`<strong>${d(t.judgment_indexed_count)}</strong> / ${d(t.judgment_count)}\uFF08${d(t.judgment_vector_points)} points\uFF09`)}
          ${ge("\u7D22\u5F15\u8986\u84CB",`<strong>${r}%</strong> \xB7 \u5269\u9918 ${d(i)} \u7B46`)}
          ${ge("\u7D22\u5F15\u7248\u672C",`<strong>#${d(t.judgment_vector_version_id)}</strong> \xB7 ${n(t.judgment_vector_version_status||"legacy")}`)}
          ${ge("Alias",`<code>${n(t.judgment_vector_alias||"\u2014")}</code> \u2192 <code>${n(t.judgment_vector_collection||"\u2014")}</code>`)}
          ${ge("\u7D22\u5F15\u6A21\u578B",`<code>${n(t.judgment_vector_model||"\u2014")}</code>`)}
          ${ge("\u6700\u8FD1\u7D22\u5F15",`<span class="mono">${de(t.judgment_indexed_at)}</span>`)}
        </div>
      </section>
    </div>`}function Bo(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${d(t.run_count)} TOTAL</span>
    </div>
    ${jo(e.recent_runs)}
  </section>`}function Io(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function Nn(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function gt(e,t,s,a,r){let i=Io(r);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${m(t,14)}${n(e)}</span>
      <strong>${n(s)}</strong>
    </div>
    ${Nn(r,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function Do(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${m("layers",14)}Docker</span>
        ${ue("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${n(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,p=o.service?0:1;return l-p||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${n(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${n(i.service)}</span>`:""}</td>
        <td>${ue(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
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
      <span class="side-card-title">${m("layers",14)}Docker \u5BB9\u5668\u4F7F\u7528\u8CC7\u6E90</span>
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
  </section>`}function Oo(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",r=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${ge("\u8CC7\u6599\u5EAB",`<code>${n(s.database||"\u2014")}</code>`)}
           ${ge("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${ae(s.storage_bytes)}</strong>`)}
           ${ge("Docker volume",`<strong>${ae(s.volume_bytes)}</strong>${s.volume_name?` <code>${n(s.volume_name)}</code>`:""}`)}
           ${ge("\u9023\u7DDA\u6578",`<strong>${d(s.connections)}</strong>`)}`:`${ge("Collection",`<code>${n(s.collection||"\u2014")}</code>`)}
           ${ge("Docker volume",`<strong>${ae(s.volume_bytes)}</strong>${s.volume_name?` <code>${n(s.volume_name)}</code>`:""}`)}
           ${ge("\u5411\u91CF\u9EDE\u6578",`<strong>${d(s.points_count)}</strong>`)}
           ${ge("Collections",`<strong>${d(s.collections)}</strong>`)}
           ${ge("Segments",`<strong>${d(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${n(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${n(s.kind||"")}</div>
          </div>
          ${ue(i)}
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
      </article>`}).join("")}</div>`}function At(e,t,s,a){let r=Number(t)||0,i=a?r/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${n(e)}</span>
      <strong>${ae(r)}</strong>
    </div>
    ${Nn(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function Fo(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},r=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},p=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${ae(p)}</span>
    </div>
    <div class="storage-list">
      ${At("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${n(s.frontend_path||"\u2014")}</span>`,p)}
      ${At("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${n(s.backend_path||"\u2014")}</span>`,p)}
      ${At("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",r.layers_bytes,`Images ${ae(r.images_bytes)} \xB7 Containers ${ae(r.containers_bytes)} \xB7 Build cache ${ae(r.build_cache_bytes)}`,p)}
      ${At("PostgreSQL volume",o.size_bytes,`<span class="mono">${n(o.name||"\u2014")}</span>`,p)}
      ${At("Qdrant volume",l.size_bytes,`<span class="mono">${n(l.name||"\u2014")}</span>`,p)}
      ${At("Parquet",a.total_bytes,`\u6CD5\u898F ${ae(a.law_bytes)} \xB7 \u5224\u6C7A ${ae(a.judgment_bytes)}`,p)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${ae(p)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function Ho(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},r=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),p=Array.isArray(e.disk)?e.disk:[],b=p[0]||{},k=Number(o.total_bytes||b.total||0),h=k?l/k*100:0,y=[s.load_1,s.load_5,s.load_15].map(w=>w??"\u2014").join(" / "),S=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":W(Number(t.uptime_seconds)*1e3),f=[b.label?gt("HDD \u5DF2\u4F7F\u7528","database",`${d(b.percent)}%`,`${ae(b.used)} / ${ae(b.total)} \xB7 \u5269\u9918 ${ae(b.free)}<br><span class="mono">${n(b.path||"")}</span>`,b.percent):"",l?gt("Judgment \u5143\u4EF6\u5408\u8A08","layers",ae(l),`\u7D04\u5360 HDD ${d(h)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,h):"",...p.slice(1).map(w=>gt(`\u786C\u789F \xB7 ${w.label}`,"layers",`${d(w.percent)}%`,`${ae(w.used)} / ${ae(w.total)} \xB7 \u5269\u9918 ${ae(w.free)}<br><span class="mono">${n(w.path||"")}</span>`,w.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${de(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${gt("CPU \u4F7F\u7528\u7387","cpu",`${d(s.percent)}%`,`${d(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${d(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${n(y)}`,s.percent)}
      ${gt("\u8A18\u61B6\u9AD4","server",`${d(a.percent)}%`,`${ae(a.used)} / ${ae(a.total)} \xB7 \u53EF\u7528 ${ae(a.available)}`,a.percent)}
      ${gt("Swap","layers",`${d(r.percent)}%`,`${ae(r.used)} / ${ae(r.total)}`,r.percent)}
      ${gt("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${d(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${n(S)}<br>${n(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${f||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${Fo(e)}
    ${Do(e)}
    ${Oo(e)}`}function En(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function Uo(e){return`<div class="report-card">
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
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Jo(e,t,s){let a=e?.data||{},r=e?Ue(e.status):null,i=s?Ue(s.status):null,o={overview:r?`<span class="badge ${r.tone==="ok"?"badge-ok":r.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${n(r.label)}</span>`:"",resources:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${n(i.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${d(a.version_count)}</span>`,runs:`<span class="badge badge-neutral badge-mono">${d(a.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${Cn.map(l=>{let p=l.id===t;return`<button class="status-tab${p?" is-active":""}" type="button"
          data-status-tab="${l.id}" ${p?'aria-current="page"':""}>
          <span class="status-tab-icon">${m(l.icon,15)}</span>
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
    </div>`}function Qo(e,t,s,a,r){return e==="resources"?s?Ho(s):a?En():r?Uo(r):En():e==="architecture"?Co(t):e==="api"?No(t):e==="data"?Po(t):e==="runs"?Bo(t):Ro(t)}function Go(){return`<div class="status-hero">
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
    </div>`}function zo(e){return`<div class="report-card">
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
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function Vo(e,t){let s=!1,a=null,r=null,i="overview",o=null,l=!1,p=null;e.innerHTML=`<section class="page status-page">
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
          ${m("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
      <section class="status-panel" id="status-content">${Go()}</section>
    </div>
  </section>`;let b=e.querySelector("#status-nav"),k=e.querySelector("#status-content"),h=e.querySelector("#refresh-status"),y=e.querySelector("#auto-refresh"),S=()=>{r&&(b.innerHTML=Jo(r,i,o),k.innerHTML=Qo(i,r,o,l,p))},f=async({quiet:I=!1}={})=>{if(!l){l=!0,p=null,i==="resources"&&S();try{let L=await J.systemUsage();if(s)return;o=L}catch(L){if(s)return;p=L,I||j(L.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{s||(l=!1,i==="resources"&&S())}}},w=async({quiet:I=!1}={})=>{I||(h.disabled=!0,re(h,!0,"\u6AA2\u67E5\u4E2D\u2026"));try{let L=await J.status();if(s)return;r=L,S(),I||j("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(L){if(s)return;k.innerHTML=zo(L),I||j(L.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(h.disabled=!1,re(h,!1))}},E=async({quiet:I=!1}={})=>{await w({quiet:I}),i==="resources"&&await f({quiet:I})};return b.addEventListener("click",I=>{let L=I.target.closest("[data-status-tab]");if(!L)return;let O=L.dataset.statusTab;Cn.some(X=>X.id===O)&&(i=O,S(),i==="resources"&&!o&&!l&&f())}),k.addEventListener("click",I=>{I.target.closest("#status-retry")&&w(),I.target.closest("#status-resources-retry")&&f()}),h.addEventListener("click",()=>E()),y.addEventListener("change",()=>{a&&(window.clearInterval(a),a=null),y.checked&&(a=window.setInterval(()=>E({quiet:!0}),3e4),j("\u5DF2\u555F\u7528\u6BCF 30 \u79D2\u81EA\u52D5\u66F4\u65B0\u3002","info",2200))}),await w({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,a&&window.clearInterval(a)}}var ia={};rt(ia,{render:()=>Ko});var Pn={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function Bn(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${n(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${n(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function Wo(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}`)}:null})}async function Ko(e,t){let s=!1,a=!1,r={embedding:[],llm:[]},i=!1,o=null,l=[],p="",b=null,k="";e.innerHTML=`<section class="page tests-page">
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
          ${m("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>

    <div class="tests-grid">
      <section class="card tests-card tests-api-card" aria-labelledby="tests-api-title">
        <form class="api-dialog-form tests-api-form" id="tests-api-form" novalidate>
          <div class="api-dialog-head">
            <span class="api-dialog-icon" aria-hidden="true">${m("link",17)}</span>
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
              ${m("activity",14)}<span>\u6E2C\u8A66\u9023\u7DDA</span>
            </button>
            <span class="grow"></span>
            <button class="btn btn-ghost btn-sm" type="button" id="tests-api-reset">\u6062\u5FA9\u9810\u8A2D</button>
            <button class="btn btn-primary btn-sm" type="submit" id="tests-api-save">
              ${m("check",14)}<span>\u5132\u5B58\u4E26\u91CD\u65B0\u8F09\u5165</span>
            </button>
          </div>
        </form>
      </section>

      <section class="card tests-card" aria-labelledby="tests-mode-title">
        <div class="tests-card-head">
          <span class="tests-card-icon">${m("terminal",16)}</span>
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
            ${m("sparkles",13)}<span>\u524D\u5F80 RAG \u63D0\u554F</span>
          </a>
          <a class="btn btn-secondary btn-sm" href="#/performance">
            ${m("activity",13)}<span>\u6548\u80FD Flow</span>
          </a>
        </div>
        <div class="tests-status" id="tests-mode-status" role="status"></div>
      </section>
    </div>

    <div id="tests-flow"></div>
  </section>`;let h=e.querySelector("#tests-mode-badge"),y=e.querySelector("#tests-mode-toggle"),S=e.querySelector("#tests-mode-summary"),f=e.querySelector("#tests-mode-models"),w=e.querySelector("#tests-mode-status"),E=e.querySelector("#tests-api-form"),I=e.querySelector("#tests-api-input"),L=e.querySelector("#tests-api-preview"),O=e.querySelector("#tests-api-status"),X=e.querySelector("#tests-api-note"),te=e.querySelector("#tests-api-test"),R=e.querySelector("#tests-api-reset"),N=e.querySelector("#tests-api-save"),F=e.querySelector("#tests-refresh"),A=e.querySelector("#tests-flow"),u=(z,ne,pe="")=>{z&&(z.textContent=ne,z.className=`tests-status${pe?` is-${pe}`:""}`)},g=(z,ne="")=>{O&&(O.textContent=z,O.className=`api-dialog-status${ne?` is-${ne}`:""}`)},M=()=>tt()==="query",Q=()=>{let z=Ze(I.value);return z||(window.location.protocol==="file:"?As:"")},K=()=>{let z=Q(),ne=et(),pe=Pn[tt()]||tt()||"\u540C\u6E90";L.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${n(it(ne))}</strong>${ne?`\uFF08${n(pe)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${n(Fe("/api/health",z))}`},Y=()=>{let z=tt(),ne=`\u76EE\u524D\u4F86\u6E90\uFF1A${Pn[z]||z||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,pe="";z==="query"?(pe="is-warn",ne="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):Jt()?(pe="is-warn",ne="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(z==="file-default"||window.location.protocol==="file:")&&(ne="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),X.textContent=ne,X.className=`api-dialog-note${pe?` ${pe}`:""}`;let Re=z==="query";N.disabled=Re,R.disabled=Re,I.readOnly=Re},C=()=>{if(!Ls(I.value))return g("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),I.focus(),null;let z=Q();return window.location.protocol==="https:"&&/^http:\/\//i.test(z)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(z)?(g("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),I.focus(),null):z},G=()=>{I.value=et(),K(),Y(),g("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},H=()=>{let z=Array.isArray(r.embedding)?r.embedding.length:0,ne=Array.isArray(r.llm)?r.llm.length:0;if(h&&(h.textContent=i?"\u5207\u63DB\u4E2D\u2026":a?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",h.className=`badge badge-mono ${i?"badge-info":a?"badge-warn":"badge-neutral"}`),y){y.disabled=i,y.classList.toggle("is-on",a),y.classList.toggle("is-off",!a&&!i),y.classList.toggle("is-busy",i),y.setAttribute("aria-checked",a?"true":"false"),y.setAttribute("aria-busy",i?"true":"false"),y.setAttribute("aria-label",i?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":a?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),y.title=i?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":a?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let pe=y.querySelector(".header-power-label");pe&&(pe.textContent=i?"\u2026":a?"ON":"OFF")}S&&(S.textContent=a?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${z} \u500B embedding \u8207 ${ne} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),f&&(f.innerHTML=Bn("Embedding",r.embedding)+Bn("LLM",r.llm))},V=async()=>{try{let z=await J.testMode();if(s)return;a=!!z.enabled,r=z.models||{embedding:[],llm:[]},u(w,"")}catch(z){if(s)return;a=!1,r={embedding:[],llm:[]},u(w,z.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}s||H()},se=async()=>{if(i)return;let z=!a;i=!0,H(),u(w,z?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let ne=await J.setTestMode(z);if(s)return;a=!!ne.enabled,r=ne.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:a,models:r}}));let pe=r.embedding?.length||0,Re=r.llm?.length||0;u(w,a?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${pe} \u500B embedding \u8207 ${Re} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),j(a?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${pe} \u500B embedding\u3001${Re} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",a?"ok":"info",6e3),await fe()}catch(ne){s||(u(w,ne.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),j(ne.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{i=!1,s||H()}},ce=()=>{if(!A)return;let z=Wo(o,l,p);z!==k&&(k=z,A.innerHTML=xt(o,l,p))},ke=async()=>{try{let z=await J.testRuns(30);if(s)return;l=Array.isArray(z.runs)?z.runs:[]}catch{if(s)return;l=[]}},fe=async()=>{try{let z=p?await J.testRun(p):await J.testRunCurrent();if(s)return;o=z.run||null,!p&&o&&o.status!=="running"&&!l.some(ne=>ne.run_id===o.run_id)&&await ke()}catch{if(s)return;o=null}s||ce()};I?.addEventListener("input",()=>{K(),g("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),te?.addEventListener("click",async()=>{let z=C();if(z!==null){re(te,!0,"\u6E2C\u8A66\u4E2D\u2026"),g(`\u6B63\u5728\u9023\u7DDA\u5230 ${it(z)||"\u540C\u6E90"}\u2026`);try{let ne=await va(z);if(s)return;g(`\u9023\u7DDA\u6210\u529F \xB7 v${ne.version} \xB7 ${ne.duration_ms} ms \xB7 GET ${Fe("/api/health",z)}`,"ok")}catch(ne){s||g(ne.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{s||re(te,!1)}}}),E?.addEventListener("submit",z=>{if(z.preventDefault(),M())return;let ne=C();ne!==null&&(Es(ne),j(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${it(ne)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),R?.addEventListener("click",()=>{M()||(Es(""),j("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),y?.addEventListener("click",se),A?.addEventListener("change",async z=>{z.target.id==="test-run-select"&&(p=String(z.target.value||""),await fe())}),A?.addEventListener("click",async z=>{z.target.closest("#test-flow-refresh")&&(p="",await ke(),await fe())}),F?.addEventListener("click",async()=>{re(F,!0,"\u66F4\u65B0\u4E2D\u2026"),G(),await Promise.allSettled([V(),ke()]),s||await fe(),s||(re(F,!1),j("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let Ke=z=>{a=!!z.detail?.enabled,r=z.detail?.models||{embedding:[],llm:[]},H()};return window.addEventListener("judgment:test-mode",Ke),G(),H(),await Promise.allSettled([V(),ke()]),await fe(),b=window.setInterval(async()=>{s||document.hidden||p||await fe()},2500),typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{s=!0,b&&window.clearInterval(b),window.removeEventListener("judgment:test-mode",Ke)}}var In="rag",vs={rag:{page:Zs,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:Vs,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:na,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:Ks,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:ea,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:ra,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:ia,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"}},ms=document.getElementById("app-main"),gs=null,fs=0;function Yo(){return`<div class="page-loading" aria-live="polite">
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-subtitle"></div>
    <div class="skeleton-grid">
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
    </div>
  </div>`}function la(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||In;return Object.prototype.hasOwnProperty.call(vs,t)?t:In}function Xo(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function Zo(e){return`<section class="page">
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
          <span class="notice-icon" aria-hidden="true">${m("alert",12)}</span>
          <div class="notice-body">
            <strong>\u7121\u6CD5\u5EFA\u7ACB\u9801\u9762</strong>
            <p>${n(e.message||"\u672A\u77E5\u932F\u8AA4")}</p>
          </div>
        </div>
        <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
          <button class="btn btn-secondary btn-sm" type="button" id="route-retry">
            ${m("refresh",14)}<span>\u91CD\u65B0\u8F09\u5165</span>
          </button>
        </div>
      </div>
    </div>
  </section>`}async function oa(){let e=la(),t=++fs;if(Xo(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof gs=="function"){try{gs()}catch{}gs=null}document.title=vs[e].title,ms.innerHTML=Yo(),ms.focus({preventScroll:!0}),window.scrollTo({top:0,behavior:"auto"});let s={route:e,navigate(a){vs[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===fs&&a&&(document.title=a)}};try{let a=await vs[e].page.render(ms,s);if(t!==fs){typeof a=="function"&&a();return}gs=typeof a=="function"?a:null}catch(a){if(t!==fs)return;console.error("Failed to render route",e,a),ms.innerHTML=Zo(a);let r=document.getElementById("route-retry");r&&r.addEventListener("click",()=>oa()),j("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function el(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable)||la()!=="rag")return;let a=document.getElementById("rag-question");a&&(e.preventDefault(),a.focus())})}function Dn(){wa(),el(),window.addEventListener("hashchange",oa),oa(),Jt()&&window.setTimeout(()=>{la()!=="tests"&&(window.location.hash="#/tests")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Dn):Dn();})();
