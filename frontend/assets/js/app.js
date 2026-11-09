(()=>{var sn=Object.defineProperty;var We=(e,t)=>{for(var s in t)sn(e,s,{get:t[s],enumerable:!0})};var Kt="judgment.api_base",Yt="http://127.0.0.1:9200",_e=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function Rs(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function Ue(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${Rs(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function Xt(e){let t=Ue(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function Zt(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?Ue(e.get("api")):null}catch{return null}}function es(){try{let e=window.localStorage.getItem(Kt);return e===null?null:Ue(e)}catch{return null}}function ts(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return Ue(e||"")}function Je(){let e=Zt();if(e!==null)return e;let t=es();if(t!==null)return t;let s=ts();return s||(window.location.protocol==="file:"?Yt:"")}function an(){if(Zt()!==null)return!0;let e=es();return e!==null?!!e:!!ts()}function Qe(){return Zt()!==null?"query":es()!==null?"storage":ts()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function wt(){return an()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!Rs(window.location.hostname)}function ss(e){let t=Ue(e);try{t?window.localStorage.setItem(Kt,t):window.localStorage.removeItem(Kt)}catch{}return t}function Ke(e=Je()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function Ne(e,t=Je()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function as(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function Y(e,t={}){let s=Je(),a=new AbortController,r=t.timeout===void 0?3e4:t.timeout,i=r>0?window.setTimeout(()=>a.abort(),r):null,o=Date.now(),l=performance.now(),p=t.requestId||Ns(),g={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":p,"X-Judgment-Client-Started-At":String(o),...t.headers||{}},k;try{k=await fetch(Ne(e,s),{...t,headers:g,signal:a.signal})}catch(w){throw w.name==="AbortError"?new _e("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new _e(as(s),0,w)}finally{i&&window.clearTimeout(i)}let y=null;if((k.headers.get("content-type")||"").includes("application/json"))try{y=await k.json()}catch{y=null}else try{y=await k.text()}catch{y=null}let S=performance.now(),v=k.headers.get("X-Judgment-Request-Id")||p;if(t.trackClient!==!1&&v){let w=Math.round(performance.now()-l);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{Cs({request_id:v,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:w,render_ms:Math.max(0,Math.round(performance.now()-S)),status:k.ok?"success":"failed"})})})}if(!k.ok){let w=y&&typeof y=="object"?y.detail||y.message:y,C=typeof w=="string"&&w?w:`\u4F3A\u670D\u5668\u56DE\u61C9 ${k.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new _e(C,k.status,w)}return y}function Ns(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function Cs(e){try{fetch(Ne("/api/performance/client",Je()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),keepalive:!0}).catch(()=>{})}catch{}}async function Ps(e){let t=Ue(e);if(!Xt(t))throw new _e("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,r=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(Ne("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new _e(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof _e?i:i.name==="AbortError"?new _e("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new _e(as(t),0,i)}finally{window.clearTimeout(r)}}var U={health(){return Y("/api/health")},status(){return Y("/api/status",{trackClient:!1})},systemUsage(){return Y("/api/system-usage",{trackClient:!1})},indexVersions(){return Y("/api/index-versions",{trackClient:!1})},indexVersion(e){return Y(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return Y(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return Y(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return Y("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){let t=new URLSearchParams({repair:e?"true":"false"});return Y(`/api/index-alias/reconcile?${t.toString()}`,{trackClient:!1})},catalog(){return Y("/api/catalog")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return Y("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},schemaSuggest({database:e,table:t,column:s,query:a,limit:r=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(r)});return Y(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let r=new URLSearchParams({law_key:e});return t&&r.set("source_type",t),s&&r.set("version_id",String(s)),a&&r.set("article_no",String(a)),Y(`/api/law?${r.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),Y(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return Y("/api/test-mode",{trackClient:!1})},setTestMode(e){return Y("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return Y(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return Y("/api/test-runs/current",{trackClient:!1})},testRun(e){return Y(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return Y("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[r,i]of Object.entries(e))i==null||i===""||a.set(r,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),Y(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return Y("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return Y("/api/processing",{timeout:45e3,trackClient:!1})},questionBankStats(){return Y("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[r,i]of Object.entries(e))i==null||i===""||a.set(r,String(i));return a.set("limit",String(t)),a.set("offset",String(s)),Y(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return Y(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return Y("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateQuestionBankItem(e,t){return Y(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return Y(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return Y(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return Y("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return Y(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return Y("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return Y(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return Y("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return Y("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return Y(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return Y(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return Y(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return Y("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return Y(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return Y(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return Y(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return Y("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return Y(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return Y("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return Y(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return Y("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return Y("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return Y("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onToken:r=null,onTokenReset:i=null}={}){let o=Je(),l=new AbortController,p=t?0:3e5,g=p>0?window.setTimeout(()=>l.abort(),p):null,k=Date.now(),y=performance.now(),h=Ns(),S={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":h,"X-Judgment-Client-Started-At":String(k)},v;try{v=await fetch(Ne("/api/rag/query/stream",o),{method:"POST",headers:S,body:JSON.stringify({question:e}),signal:l.signal})}catch(ee){throw ee.name==="AbortError"?new _e("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new _e(as(o),0,ee)}finally{g&&window.clearTimeout(g)}if(!v.ok){let ee=null;try{ee=await v.json()}catch{ee=null}let M=ee&&typeof ee=="object"&&ee.detail?String(ee.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${v.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new _e(M,v.status,ee)}if(!v.body)throw new _e("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let w=v.body.getReader(),C=new TextDecoder,T="",x=null,O=null;try{for(;;){let{value:ee,done:M}=await w.read();if(M)break;T+=C.decode(ee,{stream:!0});let j=T.indexOf(`

`);for(;j>=0;){let D=T.slice(0,j).replace(/\r/g,"");T=T.slice(j+2);let q="message",d=[];for(let u of D.split(`
`))u.startsWith("event:")?q=u.slice(6).trim():u.startsWith("data:")&&d.push(u.slice(5).trimStart());if(d.length){let u=null;try{u=JSON.parse(d.join(`
`))}catch{u=null}if(u)if(q==="step"&&typeof s=="function")try{s(u)}catch{}else if(q==="partial"){if(typeof a=="function")try{a(u)}catch{}}else if(q==="token"){if(typeof r=="function")try{r(String(u.text||""))}catch{}}else if(q==="token_reset"){if(typeof i=="function")try{i()}catch{}}else q==="result"?x=u:q==="error"&&(O=new _e(u.message||u.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,u))}j=T.indexOf(`

`)}}}finally{try{await w.cancel()}catch{}g&&window.clearTimeout(g)}if(O)throw O;if(!x)throw new _e("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let K=Math.round(performance.now()-y);return Cs({request_id:h,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:K,render_ms:0,status:"success"}),x}};var nn={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},rn={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},on={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},ln={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Bs={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function n(e){return String(e??"").replace(/[&<>"']/g,t=>nn[t])}function f(e,t=16,s=""){let a=Bs[e]||Bs.info;return`<svg${s?` class="${n(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function c(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function Z(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function ns(e){if(e instanceof Date)return e;if(typeof e=="number"){let r=new Date(e);return Number.isNaN(r.getTime())?null:r}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function Ce(e){let t=ns(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?n(e):"\u2014"}function oe(e){let t=ns(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?n(e):"\u2014"}function rt(e){let t=ns(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:Ce(t)}function V(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Pe(e){return rn[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function le(e,t){let s=Pe(e);return`<span class="badge ${on[s.tone]}"><span class="status-dot ${ln[s.tone]}"></span>${n(t||s.label)}</span>`}function cn(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${n(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function _t(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function kt(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return le(String(e));case"source":return cn(String(e));case"number":return`<span class="mono">${c(e)}</span>`;case"duration":return`<span class="mono">${V(e)}</span>`;case"datetime":return`<span class="mono">${oe(e)}</span>`;case"date":return`<span class="mono">${Ce(e)}</span>`;case"url":{let s=String(e),a=_t(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${n(s)}" target="_blank" rel="noopener noreferrer" title="${n(s)}">${f("external",10)}${n(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${n(s)}">${n(_t(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(_t(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(_t(s,90))}</span>`}}}function te({tone:e="info",title:t,text:s,iconName:a="info"}){let r=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${r==="i"?"i":f(r,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${n(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function qe({iconName:e="search",title:t,text:s="",actions:a="",className:r=""}){return`<div class="empty-state ${r}">
    <span class="empty-icon">${f(e,24)}</span>
    <h3 class="empty-title">${n(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function ae(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${n(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function B(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let r={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${r[t]||"i"}</span>
    <div class="toast-body">${n(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function St(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function Be(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),r=URL.createObjectURL(a),i=document.createElement("a");i.href=r,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(r),1e3)}var Ds="judgment.theme",rs="nvidia",Os=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#171717","#0070f3","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#1d1d1f","#0071e3","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#5e6ad2","#010102","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#f24e1e","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#191918","#0075de","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],is=new Map(Os.map(e=>[e.id,e]));function dn(e){return is.has(e)}function un(e){return is.get(e)||is.get(rs)}function pn(){try{let e=window.localStorage.getItem(Ds);return dn(e)?e:rs}catch{return rs}}function Is(e,{persist:t=!0}={}){let s=un(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");a&&a.setAttribute("content",s.metaColor);let r=document.getElementById("theme-label");r&&(r.textContent=s.name);let i=document.getElementById("theme-swatches");if(i&&(i.innerHTML=s.swatches.map(o=>`<i class="style-swatch" style="--swatch:${n(o)}"></i>`).join("")),document.querySelectorAll(".theme-option").forEach(o=>{let l=o.dataset.themeId===s.id;o.classList.toggle("is-active",l),o.setAttribute("aria-checked",l?"true":"false")}),t)try{window.localStorage.setItem(Ds,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}function mn(e){let t=Os.map((s,a)=>{let r=s.swatches.map(i=>`<i style="--swatch:${n(i)}"></i>`).join("");return`<button class="theme-option" type="button" role="menuitemradio"
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
    </div>${t}`}function Fs(){let e=document.getElementById("style-picker"),t=document.getElementById("style-trigger"),s=document.getElementById("style-menu");if(!e||!t||!s)return;mn(s),Is(pn(),{persist:!1});let a=()=>Array.from(s.querySelectorAll(".theme-option")),r=()=>{s.hidden=!1,t.setAttribute("aria-expanded","true");let o=s.querySelector(".theme-option.is-active")||a()[0];o&&o.focus()},i=({restoreFocus:o=!1}={})=>{s.hidden||(s.hidden=!0,t.setAttribute("aria-expanded","false"),o&&t.focus())};t.addEventListener("click",()=>{s.hidden?r():i({restoreFocus:!0})}),t.addEventListener("keydown",o=>{(o.key==="ArrowDown"||o.key==="ArrowUp")&&(o.preventDefault(),r())}),s.addEventListener("click",o=>{let l=o.target.closest(".theme-option");l&&(Is(l.dataset.themeId),i({restoreFocus:!0}))}),s.addEventListener("keydown",o=>{let l=a(),p=l.indexOf(document.activeElement);if(o.key==="Escape"){o.preventDefault(),i({restoreFocus:!0});return}if(o.key==="ArrowDown"||o.key==="ArrowUp"){o.preventDefault();let g=o.key==="ArrowDown"?1:-1,k=l[(p+g+l.length)%l.length];k&&k.focus();return}if(o.key==="Home"||o.key==="End"){o.preventDefault();let g=o.key==="Home"?l[0]:l[l.length-1];g&&g.focus()}}),document.addEventListener("pointerdown",o=>{e.contains(o.target)||i()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&i()})}var _s={};We(_s,{render:()=>Or});var gn="judgment-console";var Ie="query_history",Ge="settings";var Fe={history:[],settings:new Map,nextId:1},xt=null,Ae=!("indexedDB"in window);function ut(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function Ye(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function Xe(){return xt||(xt=new Promise((e,t)=>{if(!("indexedDB"in window)){Ae=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(gn,1)}catch(a){Ae=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(Ie)){let r=a.createObjectStore(Ie,{keyPath:"id",autoIncrement:!0});r.createIndex("created_at","created_at"),r.createIndex("kind","kind")}a.objectStoreNames.contains(Ge)||a.createObjectStore(Ge,{keyPath:"key"})},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{Ae=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{Ae=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),xt)}function Hs(){return"indexedDB"in window}function Us(){return Ae}function qt(){return Ae?"memory":"indexeddb"}function vn(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},created_at:t}}async function fn(){try{let t=(await Xe()).transaction(Ie,"readwrite"),s=t.objectStore(Ie),a=await ut(s.count());if(a>120){let r=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let p=i.result;if(!p||r<=0){o();return}p.delete(),r-=1,p.continue()},i.onerror=()=>l(i.error)})}await Ye(t)}catch{Ae=!0}}async function At(e){let t=vn(e);try{let a=(await Xe()).transaction(Ie,"readwrite"),r=a.objectStore(Ie),i=await ut(r.add(t));return await Ye(a),await fn(),i}catch{Ae=!0;let a=Fe.nextId++;return Fe.history.push({id:a,...t}),Fe.history.length>120&&Fe.history.shift(),a}}async function Lt({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let r=(await Xe()).transaction(Ie,"readonly"),i=r.objectStore(Ie),o=await ut(i.getAll());return await Ye(r),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,p)=>String(p.created_at).localeCompare(String(l.created_at))).slice(0,t)}catch{return Ae=!0,Fe.history.filter(r=>s?`${r.kind} ${r.title} ${r.detail}`.toLowerCase().includes(s):!0).slice().sort((r,i)=>String(i.created_at).localeCompare(String(r.created_at))).slice(0,t)}}async function Js(){try{let t=(await Xe()).transaction(Ie,"readwrite");t.objectStore(Ie).clear(),await Ye(t)}catch{Ae=!0}Fe.history=[]}async function Qs(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let r=(await Xe()).transaction(Ge,"readwrite");return r.objectStore(Ge).put(s),await Ye(r),s}catch{return Ae=!0,Fe.settings.set(s.key,s),s}}async function pt(e,t=null){try{let a=(await Xe()).transaction(Ge,"readonly"),r=a.objectStore(Ge),i=await ut(r.get(String(e)));return await Ye(a),i?i.value:t}catch{Ae=!0;let a=Fe.settings.get(String(e));return a?a.value:t}}async function Gs({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await Xe()).transaction(Ge,"readonly"),r=a.objectStore(Ge),i=await ut(r.getAll());return await Ye(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return Ae=!0,Array.from(Fe.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function zs(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var ys={};We(ys,{render:()=>kr,renderTestFlowPanel:()=>lt});var bn={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},hn=new Set(["running","stopping"]);function Tt(e){let[t,s]=bn[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${n(t)}</span>`}function Mt(e){return String(e).padStart(2,"0")}function it(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${Mt(t.getMonth()+1)}-${Mt(t.getDate())} ${Mt(t.getHours())}:${Mt(t.getMinutes())}`}function gt(e){return hn.has(e)}function He(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function Ze(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function ze(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${n(e)}</span>
    <strong>${n(String(t))}</strong>
    ${s?`<small>${n(s)}</small>`:""}
  </div>`}function Vs(e={}){let t=e.score_components||e;return`<div class="bench-metrics">
    ${ze("Law Recall",Ze(t.law_recall))}
    ${ze("Article Recall",Ze(t.article_recall))}
    ${ze("Citation Valid",Ze(t.citation_valid_rate))}
    ${ze("Judge",He(t.judge_overall))}
    ${ze("Human",He(t.human_overall))}
    ${ze("p50",V(e.duration_p50_ms))}
    ${ze("p95",V(e.duration_p95_ms))}
    ${ze("Success",`${c(e.success||0)} / ${c(e.total||0)}`)}
  </div>`}function Ws(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${n(s.replace(/^rag\./,""))}</span>
      <strong>${V(a.p50_ms)}</strong>
      <small>p95 ${V(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function Ks(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${Ze(s.law_recall)}</span>
    <span>Article ${Ze(s.article_recall)}</span>
    <span>Judge ${He(s.judge_overall)}</span>
    <span>p95 ${V(t.duration_p95_ms)}</span>`}function Ys(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function Xs(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${n(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${n(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${n(e.status||"")}">${Tt(e.status)}</span>
      <span class="mono">${n(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${n(oe(e.started_at))}</span>
      <span data-bench-slot="run-completed">${c(e.completed_cases||0)} / ${c(e.total_cases||0)} \u984C</span>
      <span>${n(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${n(Ys(e))}">${Ks(e)}</span>
  </button>`}function ls(e,t=[]){let s=e.metrics||{},a=e.judge||{},r=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([g])=>g.startsWith("rag.")).map(([g,k])=>`<span class="chip">${n(g)} ${V(k)}</span>`).join(""),p=(e.law_sources||[]).map(g=>`<span class="chip">${n(g.law_name||"\u6CD5\u898F")} ${c((g.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${n(e.question)}</span>
      ${Tt(e.status)}
      <span class="bench-case-time">${V(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${He(i.deterministic)} \xB7 Judge ${He(i.judge)} \xB7 Human ${He(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${n((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${n(e.fingerprint||"")}">${f("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
      </div>
      <div class="bench-case-stages">${l||'<span class="qb-muted">\u6C92\u6709 stage timing</span>'}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${Ze(s.law_recall)}</span>
        <span>Article recall ${Ze(s.article_recall)}</span>
        <span>Citation ${s.citation_valid?"valid":"invalid"}</span>
        <span>Refusal ${s.refusal_correct===null?"\u2014":s.refusal_correct?"correct":"wrong"}</span>
      </div>
      <div class="chips">${p||'<span class="qb-muted">\u6C92\u6709\u6CD5\u898F\u4F86\u6E90</span>'}</div>
      <div class="bench-answer"><strong>\u56DE\u7B54</strong><p>${n(e.answer||"\u2014")}</p></div>
      <div class="bench-judge"><strong>LLM judge</strong><p>${n(a.rationale||a.reason||"\u2014")}</p><span>${[["correctness",a.correctness],["grounding",a.grounding],["citation",a.citation],["clarity",a.clarity],["overall",a.overall]].map(([g,k])=>`${g} ${k??"\u2014"}`).join(" \xB7 ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${e.id}">
        <div class="bench-human-grid">
          ${[["correctness","\u6B63\u78BA\u6027",r.scores?.correctness??4],["grounding","\u6709\u64DA\u6027",r.scores?.grounding??4],["citation","\u5F15\u7528",r.scores?.citation??4],["clarity","\u6E05\u695A",r.scores?.clarity??4],["overall","\u6574\u9AD4",r.overall??4]].map(([g,k,y])=>`<label class="field"><span class="field-label">${k} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${g}" value="${n(String(y))}" /></label>`).join("")}
        </div>
        <label class="field"><span class="field-label">\u4EBA\u5DE5\u6279\u6CE8</span><input class="input" name="comment" value="${n(r.comment||"")}" placeholder="\u56DE\u7B54\u54C1\u8CEA\u3001\u5F15\u7528\u6216\u4E8B\u5BE6\u932F\u8AA4" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${f("check",13)}<span>\u5132\u5B58\u4EBA\u5DE5\u8A55\u5206</span></button>
      </form>
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(g=>`<div class="bench-history-row"><span>${n(oe(g.run?.started_at))}</span><span>${n(g.run?.config?.llm_model||"\u2014")}</span><span>Det ${He(g.metrics?.scores?.deterministic)}</span><span>Judge ${He(g.metrics?.scores?.judge)}</span><span>Human ${He(g.metrics?.scores?.human)}</span><span>${V(g.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function os(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function Zs(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${ls(e,t)}
  </details>`}function ea(e){return`${Tt(e.status)}
    <span class="mono">${n(e.run_id)}</span>
    ${gt(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${n(e.run_id)}">${f("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function $n(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${n(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${f("activity",14)}${n(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${n((e.status||"")+":"+e.run_id)}">
        ${ea(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${Vs(e.summary||{})}</div>
    <div data-bench-detail="stages">${Ws(e.summary||{})}</div>
    <div class="bench-run-config">
      <span><strong>Suite</strong> v${e.suite_version} \xB7 ${c((e.suite_snapshot?.items||[]).length)} \u984C</span>
      <span><strong>Embedding</strong> ${n(e.config?.embedding_model||"\u2014")}</span>
      <span><strong>LLM</strong> ${n(e.config?.llm_model||"\u2014")}</span>
      <span><strong>Judge</strong> ${n(e.config?.judge_model||"\u2014")}</span>
      <span><strong>Index</strong> ${n(e.index_version?.physical_collection||"\u2014")}</span>
      <span><strong>Top K</strong> ${n(String(e.config?.top_k??"\u2014"))}</span>
      <span><strong>Law retrieval</strong> ${e.config?.enable_law_retrieval?"on":"off"}</span>
      <span><strong>Config hash</strong> <span class="mono">${n((e.config_hash||"").slice(0,16))}</span></span>
    </div>
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>Zs(a,t[a.fingerprint]||[])).join(""):te({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function ta(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${f("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${n(e.run_id)}">${f("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function sa(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),r=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,r-i):0,l=(t||[]).filter(v=>["success","failed"].includes(v.status)).map(v=>Number(v.duration_ms)||0).filter(v=>v>0),p=null;if(l.length)p=l.reduce((v,w)=>v+w,0)/l.length;else if(a>0){let v=Date.parse(e.updated_at||""),w=Number.isFinite(v)?v:i;Number.isFinite(w)&&w>i?p=(w-i)/a:o>0&&(p=o/a)}let g=(t||[]).find(v=>v.status==="running")||null,k=0;if(a<s&&p&&p>0){let v=g?Date.parse(g.started_at||""):NaN,w=Date.parse(e.updated_at||""),C=Number.isFinite(v)?v:w;Number.isFinite(C)&&(k=Math.max(0,Math.min(.95,(r-C)/p)))}let y=Math.min(s,a+k),h=s>0?Math.max(0,Math.min(100,y/s*100)):0,S=p===null?null:Math.max(0,s-y)*p;return{total:s,completed:a,elapsedMs:o,averageMs:p,progress:h,etaMs:S,ratePerMin:p?6e4/p:null,running:g}}function aa(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${V(e)}`}function na(e,t=[]){let s=sa(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${n(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${c(s.completed)} / ${c(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${aa(s.etaMs)}</span>
      <span data-bench-slot="progress-rate">${s.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${s.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`}</span>
    </div>
    <div class="processing-bar processing-bar-lg bench-progress-bar${s.completed===0?" is-waiting":""}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.progress.toFixed(1)}" data-bench-slot="progress-bar">
      <span class="processing-bar-fill" data-bench-slot="progress-fill" style="width:${s.progress.toFixed(2)}%"></span>
    </div>
    <div class="bench-progress-foot">
      <span data-bench-slot="progress-elapsed">\u5DF2\u57F7\u884C ${V(s.elapsedMs)}</span>
      <span data-bench-slot="progress-average">${s.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${V(s.averageMs)}\uFF0F\u984C`}</span>
      <span>\u5373\u6642\u9810\u4F30 \xB7 \u6BCF\u5B8C\u6210\u4E00\u984C\u6821\u6B63</span>
    </div>
  </div>`}function yn(e){let t=e.models?.models||{},s=e.suites||[],a=mt(e),r=e.selectedRun;return`<section class="report-card bench-card">
    <div class="side-card-head">
      <span class="side-card-title">${f("brain",14)}RAG Benchmark</span>
      <span class="badge ${e.indexVersion?.physical_collection?"badge-ok":"badge-warn"}">${n(e.indexVersion?.physical_collection||"\u7D22\u5F15\u672A\u8A2D\u5B9A")}</span>
    </div>
    <form class="bench-form" data-bench-form="run">
      <div class="bench-form-grid">
        <label class="field"><span class="field-label">Benchmark \u984C\u5EAB</span><select class="select" name="suite_id">${s.map(i=>`<option value="${i.id}" ${e.selectedSuiteId===i.id?"selected":""}>${n(i.name)} \xB7 ${c(i.item_count)} \u984C</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Embedding</span><select class="select" name="embedding_model">${(t.embedding||[]).map(i=>`<option value="${n(i)}" ${i===e.config.embedding_model?"selected":""}>${n(i)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">LLM</span><select class="select" name="llm_model">${(t.llm||[]).map(i=>`<option value="${n(i)}" ${i===e.config.llm_model?"selected":""}>${n(i)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Judge model</span><select class="select" name="judge_model"><option value="">\u4E0D\u57F7\u884C LLM judge</option>${(t.llm||[]).map(i=>`<option value="${n(i)}" ${i===e.config.judge_model?"selected":""}>${n(i)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Top K</span><input class="input" type="number" min="1" max="20" name="top_k" value="${n(String(e.config.top_k||4))}" /></label>
        <label class="field"><span class="field-label">Score threshold</span><input class="input" type="number" min="0" max="1" step="0.01" name="score_threshold" value="${n(String(e.config.score_threshold||.35))}" /></label>
        <label class="field"><span class="field-label">\u91CD\u8907\u6B21\u6578</span><input class="input" type="number" min="1" max="5" name="repeats" value="${n(String(e.config.repeats||1))}" /></label>
        <label class="checkbox-field bench-check"><input type="checkbox" name="enable_law_retrieval" ${e.config.enable_law_retrieval?"checked":""} /><span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22</span></label>
        <label class="checkbox-field bench-check"><input type="checkbox" name="judge_enabled" ${e.config.judge_enabled?"checked":""} /><span>LLM judge</span></label>
      </div>
      <label class="field"><span class="field-label">Run \u6A19\u7C64</span><input class="input" name="label" value="${n(e.config.label||it())}" /></label>
      <div class="qb-actions" data-bench-actions data-signature="${n(a?`${a.run_id}:${a.status}`:"")}">
        ${ta(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${n(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?na(a,cs(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>Xs(i,r?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${r?$n(r,e.history):""}
  </section>`}function mt(e){let t=(e.runs||[]).find(s=>gt(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!gt(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function cs(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function ra(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:it(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",pollTimer:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),r=d=>{let u=new FormData(d);return{label:String(u.get("label")||"").trim()||it(),embedding_model:String(u.get("embedding_model")||""),llm_model:String(u.get("llm_model")||""),judge_model:String(u.get("judge_model")||""),top_k:Number(u.get("top_k")||4),score_threshold:Number(u.get("score_threshold")||.35),repeats:Number(u.get("repeats")||1),enable_law_retrieval:d.elements.enable_law_retrieval?.checked??!0,judge_enabled:d.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(d=>`${d.id}:${d.name}:${d.item_count}:${d.version}:${d.status}`)]:null,runs:(s.runs||[]).map(d=>`${d.run_id}:${d.label||""}:${d.suite_version||1}`)}),o=()=>{let u=a()?.querySelector("[data-bench-live]"),A=mt(s);if(!u||!A)return;let H=sa(A,cs(s,A)),G=(J,I)=>{let X=u.querySelector(`[data-bench-slot="${J}"]`);X&&X.textContent!==I&&(X.textContent=I)};G("progress-count",`${c(H.completed)} / ${c(H.total)} \u984C`),G("progress-percent",`${H.progress.toFixed(1)}%`),G("progress-eta",aa(H.etaMs)),G("progress-rate",H.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${H.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),G("progress-elapsed",`\u5DF2\u57F7\u884C ${V(H.elapsedMs)}`),G("progress-average",H.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${V(H.averageMs)}\uFF0F\u984C`),G("progress-state",A.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let W=u.querySelector('[data-bench-slot="progress-bar"]');W&&(W.setAttribute("aria-valuenow",H.progress.toFixed(1)),W.classList.toggle("is-waiting",H.completed===0));let E=u.querySelector('[data-bench-slot="progress-fill"]');E&&(E.style.width=`${H.progress.toFixed(2)}%`)},l=d=>{let u=d.querySelector("[data-bench-actions]");if(!u)return;let A=mt(s),H=A?`${A.run_id}:${A.status}`:"";u.dataset.signature!==H&&(u.dataset.signature=H,u.innerHTML=ta(A))},p=d=>{let u=d.querySelector("[data-bench-live-wrap]");if(!u)return;let A=mt(s),H=A?`${A.run_id}:${A.status}:${A.total_cases}`:"";u.dataset.signature!==H&&(u.dataset.signature=H,u.innerHTML=A?na(A,cs(s,A)):"")},g=d=>{let u=d.querySelector("[data-bench-runs]");if(!u)return;let A=s.runs||[],H=[...u.querySelectorAll("[data-run-id]")].map(W=>W.dataset.runId),G=A.map(W=>W.run_id);if(H.join("|")!==G.join("|")){u.innerHTML=A.length?A.map(W=>Xs(W,s.selectedRun?.run_id===W.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let W of A){let E=u.querySelector(`[data-run-id="${W.run_id}"]`);if(!E)continue;E.classList.toggle("is-active",s.selectedRun?.run_id===W.run_id);let J=E.querySelector('[data-bench-slot="run-label"]');J&&J.textContent!==(W.label||"RAG Benchmark")&&(J.textContent=W.label||"RAG Benchmark");let I=E.querySelector('[data-bench-slot="run-status"]');I&&I.dataset.status!==(W.status||"")&&(I.dataset.status=W.status||"",I.innerHTML=Tt(W.status));let X=E.querySelector('[data-bench-slot="run-completed"]');if(X){let he=`${c(W.completed_cases||0)} / ${c(W.total_cases||0)} \u984C`;X.textContent!==he&&(X.textContent=he)}let ne=E.querySelector('[data-bench-slot="run-scores"]'),be=Ys(W);ne&&ne.dataset.signature!==be&&(ne.dataset.signature=be,ne.innerHTML=Ks(W))}},k=d=>{let u=s.selectedRun;if(!u)return;let A=d.querySelector(`.bench-detail[data-run-id="${u.run_id}"]`);if(!A)return;let H=A.querySelector("[data-bench-detail-actions]");if(H){let ne=`${u.status||""}:${u.run_id}`;H.dataset.signature!==ne&&(H.dataset.signature=ne,H.innerHTML=ea(u))}let G=A.querySelector('[data-bench-detail="metrics"]');if(G){let ne=JSON.stringify(u.summary||{});G.dataset.signature!==ne&&(G.dataset.signature=ne,G.innerHTML=Vs(u.summary||{}))}let W=A.querySelector('[data-bench-detail="stages"]');if(W){let ne=JSON.stringify((u.summary||{}).stages||{});W.dataset.signature!==ne&&(W.dataset.signature=ne,W.innerHTML=Ws(u.summary||{}))}let E=A.querySelector("[data-bench-cases]");if(!E)return;let J=u.cases||[];if(!J.length)return;let I=E.querySelector(".notice");I&&I.remove();let X=new Map([...E.querySelectorAll("details.bench-case")].map(ne=>[Number(ne.dataset.resultId),ne]));for(let ne of J){let be=s.history[ne.fingerprint]||[],he=os(ne,be),ge=X.get(Number(ne.id));if(!ge){E.insertAdjacentHTML("beforeend",Zs(ne,be)),ge=E.lastElementChild,ge&&(ge._benchSignature=he);continue}if(ge._benchSignature===he||!s.forcedCaseIds.delete(Number(ne.id))&&ge.contains(document.activeElement))continue;let Q=ge.open;ge.innerHTML=ls(ne,be),ge.open=Q,ge._benchSignature=he}},y=()=>{mt(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},h=()=>{let d=a();d&&(l(d),p(d),g(d),k(d),o(),y())},S=d=>{let u=s.selectedRun;if(!u)return;let A=d.querySelector('[data-bench-detail="metrics"]');A&&(A.dataset.signature=JSON.stringify(u.summary||{}));let H=d.querySelector('[data-bench-detail="stages"]');H&&(H.dataset.signature=JSON.stringify((u.summary||{}).stages||{}));let G=d.querySelector("[data-bench-cases]");if(!G)return;let W=new Map((u.cases||[]).map(E=>[Number(E.id),E]));for(let E of G.querySelectorAll("details.bench-case")){let J=W.get(Number(E.dataset.resultId));J&&(E._benchSignature=os(J,s.history[J.fingerprint]||[]))}},v=(d=!1)=>{let u=a();if(!u)return;let A=i();if(!d&&s.renderSignature===A){h();return}s.renderSignature=A,s.forcedCaseIds.clear(),u.innerHTML=yn(s),S(u),h()},w=async({refreshAll:d=!1}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||d;return}s.loading=!0;try{if(!s.referenceLoaded||d){let[J,I]=await Promise.all([U.benchmarkModels(),U.benchmarkSuites()]);s.models=J,s.suites=I.suites||[],s.indexVersion=J.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=J.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=J.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(J.models?.llm||[]).find(X=>X!==s.config.llm_model)||"")}let u=await U.benchmarkRuns(30);s.runs=u.runs||[];let A=s.activeRunId,H=s.runs.find(J=>gt(J.status))||null;s.activeRunId=H?.run_id||"";let G=s.selectedRun?.run_id||"";G||(G=H?.run_id||s.runs[0]?.run_id||"");let W=!!(s.selectedRun&&A&&s.selectedRun.run_id===A);G&&(!s.selectedRun||s.selectedRun.run_id!==G||G===H?.run_id||W)?s.selectedRun=await U.benchmarkRun(G,!0):G||(s.selectedRun=null),s.loaded=!0,v()}catch(u){if(!s.loaded){s.renderSignature="";let A=a();A&&(A.innerHTML=te({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:n(u.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let u=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,w({refreshAll:u})}else C()}},C=()=>{s.pollTimer&&window.clearTimeout(s.pollTimer),s.pollTimer=null,(s.runs||[]).some(d=>gt(d.status))&&(s.pollTimer=window.setTimeout(()=>{w()},2500))},T=async d=>{try{s.selectedRun=await U.benchmarkRun(d,!0),v(),C()}catch(u){B(u.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},x=async d=>{!s.labelTouched&&d.elements.label&&(d.elements.label.value=it());let u=r(d);s.config=u;let A=Number(d.elements.suite_id?.value||0);if(!A){B("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await U.startBenchmarkRun({suite_id:A,config:u,actor:"anonymous"}),B("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=it(),s.labelTouched=!1,await w()}catch(H){B(H.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},O=async d=>{try{await U.stopBenchmarkRun(d),B("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await w()}catch(u){B(u.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},K=async d=>{let u=Number(d.dataset.resultId||0),A=new FormData(d),H={};for(let G of["correctness","grounding","citation","clarity","overall"]){let W=Number(A.get(`score_${G}`));Number.isFinite(W)&&(H[G]=W)}try{await U.reviewBenchmarkResult(u,{reviewer:"anonymous",scores:H,comment:String(A.get("comment")||"")}),B("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await U.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(u)),v()}catch(G){B(G.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},ee=async d=>{if(d)try{let u=await U.benchmarkFingerprintHistory(d,50);s.history[d]=u.cases||[];let A=s.selectedRun,H=a();if(!A||!H)return;let G=(A.cases||[]).filter(W=>W.fingerprint===d);for(let W of G){let E=H.querySelector(`details.bench-case[data-result-id="${W.id}"]`);if(!E)continue;let J=E.open;E.innerHTML=ls(W,s.history[d]),E.open=J,E._benchSignature=os(W,s.history[d])}}catch(u){B(u.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},M=async d=>{let u=d.target.closest("[data-bench-action]");if(!u)return;let A=u.dataset.benchAction;A==="open-run"?await T(u.dataset.runId||""):A==="stop"?await O(u.dataset.runId||""):A==="fingerprint-history"&&await ee(u.dataset.fingerprint||"")},j=async d=>{let u=d.target.closest("[data-bench-form]");u&&(d.preventDefault(),u.dataset.benchForm==="run"?await x(u):u.dataset.benchForm==="human"&&await K(u))},D=d=>{d&&(d.elements.label&&d.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=r(d),d.elements.suite_id&&(s.selectedSuiteId=Number(d.elements.suite_id.value)||s.selectedSuiteId))},q=d=>{let u=d.target.closest('[data-bench-form="run"]');u&&D(u)};return e.addEventListener("click",M),e.addEventListener("submit",j),e.addEventListener("input",q),e.addEventListener("change",q),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=it();let d=a()?.querySelector('input[name="label"]');d&&(d.value=s.config.label)}w({refreshAll:!s.referenceLoaded})},refresh(){return w({refreshAll:!0})},destroy(){e.removeEventListener("click",M),e.removeEventListener("submit",j),e.removeEventListener("input",q),e.removeEventListener("change",q),s.pollTimer&&window.clearTimeout(s.pollTimer),s.tickTimer&&window.clearInterval(s.tickTimer)}}}var hs={};We(hs,{exportCsv:()=>Pt,exportableResult:()=>Bt,render:()=>sr,renderReport:()=>Rt,reportError:()=>Ct,reportLoading:()=>vt});var ma=[10,25,50,100],wn=500,_n=["law_name","law_level","law_category","law_modified_date","article_count"],kn=["jid","court_normalized","title","jdate","matched_laws","citation_count"],Sn={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function Nt(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function jt(e,t){let s={};for(let a of e.fields||[]){let r=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?r:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{}}}function xn(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,r]of Object.entries(s))if(Array.isArray(r)&&!r.map(String).includes(String(t[a]??"")))return!1;return!0}function bs(e,t){return(e.fields||[]).filter(s=>xn(s,t))}function qn(e,t){return`filter-${e.id}-${t}`}function et(e){return e==null?"":n(String(e))}function ds(e,t,s){let a=s[t.key],r=qn(e,t.key),i=t.help?`<span class="field-help">${n(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(p=>`<option value="${et(p.value)}" ${String(p.value)===String(a??"")?"selected":""}>${n(p.label??p.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${r}" name="${n(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),p=(t.options||[]).map(g=>`<label class="multi-option">
          <input type="checkbox" name="${n(t.key)}" value="${et(g.value)}" ${l.has(String(g.value))?"checked":""} />
          <span>${n(g.label??g.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${p}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${r}" name="${n(t.key)}"
        value="${et(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${et(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${r}" name="${n(t.key)}"
        value="${et(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${r}" name="${n(t.key)}"
      value="${et(a)}"
      placeholder="${et(t.placeholder||"")}" />
    ${i}
  </div>`}function us(e,t,{focusTable:s=!1}={}){let a=bs(e,t.values),r=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(r.push(`<div class="field-row">${ds(e,o,t.values)}${ds(e,l,t.values)}</div>`),i+=1):r.push(ds(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
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
  </form>`}function Et(e,t,s){let a={...s.values};for(let r of bs(t,a))if(r.type==="checkbox"){let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=!!i?.checked}else if(r.type==="multiselect")a[r.key]=Array.from(e.querySelectorAll(`[name="${r.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=i?i.value:""}return a}function ga(e,t){let s={};for(let a of bs(e,t.values)){let r=t.values[a.key];a.type==="checkbox"?s[a.key]=!!r:a.type==="multiselect"?s[a.key]=Array.isArray(r)?r:[]:a.type==="number"?s[a.key]=r===""||r===null?"":Number(r):s[a.key]=r??""}return s}function ps(e,t){let s=ga(e,t);return(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function ia(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${te({tone:t,title:`${Nt(e)} ${Pe(e.status).label}`,text:n(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function An(e,t){return`<div class="db-options" role="radiogroup" aria-label="\u9078\u64C7\u8CC7\u6599\u5EAB">
    ${e.map(s=>{let a=Pe(s.status);return`<label class="db-option">
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
  </div>`}function Ln(e){return`<div class="sidebar-view-switch" role="tablist" aria-label="\u67E5\u8A62\u6216 schema">
    <button class="sidebar-view-button ${e==="query"?"is-active":""}"
      type="button" role="tab" aria-selected="${e==="query"}"
      data-action="sidebar-view" data-view="query">${f("search",13)}<span>\u67E5\u8A62</span></button>
    <button class="sidebar-view-button ${e==="schema"?"is-active":""}"
      type="button" role="tab" aria-selected="${e==="schema"}"
      data-action="sidebar-view" data-view="schema">${f("table",13)}<span>Schema</span></button>
  </div>`}function ms(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],r=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function oa(e,t){return`<div class="category-options" role="radiogroup" aria-label="\u8CC7\u6599\u985E\u578B">
    ${e.map(s=>{let a=s.id===t,r=s.id==="judgment"&&s.count!==void 0?`${c(s.count)} \u7B46\u5DF2\u7BE9\u9078\u5224\u6C7A`:s.description||"";return`<label class="category-option${a?" is-selected":""}">
          <input type="radio" name="category" value="${n(s.id)}" ${a?"checked":""} />
          <span class="category-option-body">
            <span class="category-option-label">${n(s.label)}</span>
            <span class="category-option-desc">${n(r)}</span>
          </span>
        </label>`}).join("")}
  </div>`}function la(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||n(e.detail||"")}function Mn(e){return`<div class="report-empty">
    ${qe({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:n({postgres:"\u9078\u64C7\u8CC7\u6599\u8868\u8207 metadata \u689D\u4EF6\uFF0C\u57F7\u884C\u5F8C\u6703\u7522\u751F SQL\u3001\u6458\u8981\u3001\u5206\u5E03\u8207\u8CC7\u6599\u5217\u3002",parquet:"\u9078\u64C7\u8CC7\u6599\u96C6\u8207\u56DE\u50B3\u6B04\u4F4D\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
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
  </div>`}function vt(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(Nt(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function Ct(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(Nt(t))} \u67E5\u8A62\u5931\u6557</div>
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
  </div>`}function Tn(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,r=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${n(s.label||"\u672A\u5206\u985E")}">${n(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${r.toFixed(1)}%"></span></span>
          <span class="dist-value">${c(a)}</span>
        </div>`}).join("")}
  </div>`}function va(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function jn(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function En(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function Rn(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${n(String(t))}"
    title="\u6AA2\u8996\u300C${n(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${n(String(t))}${f("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var Nn={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function Cn(e,t,s,a=!1,r=!0,i=!1){let o=a?e.key:e.label||e.key,l=r?t?Nn[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${n(o)}</th>`;let p=s?.key===l,g=p?s.direction:null,k=g==="asc"?"ascending":g==="desc"?"descending":"none",y=g==="asc"?"\u2191":g==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${k}">
    <button class="table-sort${p?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${n(l)}"
      title="\u4F9D${n(o)}\u6392\u5E8F">
      <span>${n(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${y}</span>
    </button>
  </th>`}function Pn(e,t){if(!va(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,r=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(r||""),lawName:String(t.law_name||"")}}function Bn(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${n(s.lawKey)}"
    data-law-source="${n(s.sourceType)}"
    data-law-name="${n(s.lawName)}"
    title="\u6AA2\u8996\u300C${n(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(String(a))}${f("chevronRight",12,"law-link-icon")}</button>`}function fa(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:r=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],p=(e.page-1)*e.page_size,g=va(e),k=jn(e),y=En(e),h=e.meta?.sort||null,S=r?`<tr class="schema-search-row">
        <th scope="col" class="cell-index-head"></th>
        ${o.map(v=>`<th scope="col">
              <div class="schema-search-wrap">
                <input class="schema-search-input" type="search"
                  data-schema-search="${n(v.key)}"
                  value="${n(String(r[v.key]??""))}"
                  placeholder="\u641C\u5C0B ${n(v.key)}"
                  autocomplete="off" />
              </div>
            </th>`).join("")}
      </tr>`:"";return o.length?l.length?`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">${c(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${g?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":k?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":y?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${S}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(v=>Cn(v,k,h,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((v,w)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${p+w+1}</td>
                ${o.map(C=>{if((k||y)&&C.key==="jid")return`<td class="cell-jid">${Rn(v)}</td>`;let T=g&&C.key==="law_name"?Pn(e,v):null;if(T)return`<td>${Bn(v,C,T)}</td>`;let O={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[C.type];return`<td${O?` class="${O}"`:""}>${kt(v[C.key],C.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${qe({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function In(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${ma.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${f("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${f("chevronRight",13)}</button>
    </div>
  </div>`}function ba(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${n(t)}</div>`).join("")}</div>`}function Rt(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],r=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",p=e.status||"ok",g=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${n(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${n(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${n(e.label||l)}
          ${le(p)}
          <span class="chip">${n(g)}</span>
        </div>
        <div class="report-sub">
          ${c(i)} \u7B46\u7B26\u5408 \xB7
          ${V(e.duration_ms)} \xB7
          ${n(String(l).toUpperCase())} / ${n(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${f("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${f("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${te({tone:p==="not_configured"?"info":p==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:""}

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
        ${Tn(r)}
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
        ${ba(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?fa(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?In({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function ca(e){return`<div class="report-card schema-preview">
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
  </div>`}function gs(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let r=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${te({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${n(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${n(t||e.table||"\u8CC7\u6599\u8868")}
          ${le(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${n(String(e.database||""))} / ${n(String(e.table||"\u2014"))} \xB7 ${r.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${fa({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${ba(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${c(i.length)} \u7B46</span>
      <strong>\u5171 ${c(e.total)} \u7B46</strong>
    </div>
  </div>`}function da(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${n(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${te({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function Dn(e){return`<div class="report-empty">
    ${qe({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${Nt(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function vs(e){return e.is_current===!0?le("ok","\u73FE\u884C"):e.law_abandon_note?le("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?le("empty","\u6B77\u53F2\u7248\u672C"):le("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function me(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${n(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function tt(e){return e?Ce(e):"\u2014"}function On(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function fs(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${n(e)}</span>
    </div>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </div>`:""}function Fn(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${n(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${f("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </details>`:""}function Hn(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let r=a?.name||a?.url||"";return r?a.url?`<a class="law-attachment" href="${n(a.url)}" target="_blank" rel="noopener noreferrer">
          ${f("file",12)}<span>${n(r)}</span>${f("external",11)}
        </a>`:`<span class="law-attachment">${f("file",12)}<span>${n(r)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${c(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function ha(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Un(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,r=s?`${c(a)} \u689D \xB7 ${c(s)} \u7AE0\u7BC0`:`${c(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${n(l)}</div>`;let p=Sn[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${n(ha(o.article_no))}">
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
  </div>`}function Jn(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function ot(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${f("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function Qn(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${ot()}
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
  </div>`}function Gn(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${ot()}
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
  </div>`}function zn(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let r=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",r,a.article_count_for_law?`${c(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${n(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${n(i)}</option>`}).join("")}
    </select>
  </label>`}function Vn(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let r={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${r[o]} ${c(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">\u7248\u672C\u8B8A\u66F4</span>
      <span class="muted">${n(i)}</span>
    </summary>
    <div class="law-version-change-list">
      ${a.length?a.slice(0,20).map(o=>{let l=o.change_type==="added"?"badge-ok":o.change_type==="removed"?"badge-danger":"badge-warn",p=o.before_content?`<details><summary>\u8B8A\u66F4\u524D</summary><pre>${n(o.before_content)}</pre></details>`:"",g=o.after_content?`<details><summary>\u8B8A\u66F4\u5F8C</summary><pre>${n(o.after_content)}</pre></details>`:"";return`<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${l}">${n(r[o.change_type]||o.change_type)}</span>
                    <strong>${n(o.article_no||o.article_key)}</strong>
                  </div>
                  ${p}${g}
                </div>`}).join(""):'<div class="report-empty-inline">\u6B64\u7248\u672C\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u8B8A\u66F4\u3002</div>'}
      ${e.changes_truncated?'<div class="report-empty-inline">\u50C5\u986F\u793A\u524D 20 \u7B46\u8B8A\u66F4\uFF1BAPI \u56DE\u50B3\u4E0A\u9650 200 \u7B46\u3002</div>':""}
    </div>
  </details>`}function Wn(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let r=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(w=>w.article_type!=="C").length,l=On(e),p=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",g=e.meta?.snapshot||"",k=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",y=[l,p,k,g].filter(Boolean).join(" \xB7 "),h=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",S=e.version||{},v=[me("\u6CD5\u898F\u4F4D\u968E",n(e.law_level||"\u2014")),me("\u6CD5\u898F\u985E\u5225",n(e.law_category||"\u2014")),me("\u7570\u52D5\u65E5\u671F",tt(e.law_modified_date)),me("\u751F\u6548\u65E5\u671F",tt(e.law_effective_date)),me("\u689D\u6587\u6578",c(e.article_count)),me("\u8CC7\u6599\u72C0\u614B",vs(e)),me("\u82F1\u8B6F\u540D\u7A31",n(e.eng_law_name||"\u2014")),me("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${n(e.law_key||"\u2014")}</span>`)];return S.first_seen_version_id!==null&&S.first_seen_version_id!==void 0&&v.push(me("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${n(S.first_seen_version_id)}`)),S.last_seen_version_id!==null&&S.last_seen_version_id!==void 0&&v.push(me("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${n(S.last_seen_version_id)}`)),S.last_seen_at&&v.push(me("\u6700\u5F8C\u6536\u9304\u6642\u9593",n(oe(S.last_seen_at)))),S.selected_version_id!==null&&S.selected_version_id!==void 0&&v.push(me("\u689D\u6587\u7248\u672C",`#${n(S.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${ot()}
      <span class="law-report-origin" title="${n(y)}">${n(y)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${n(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${n(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${n(i)}
            ${vs(e)}
            <span class="chip">${n(h)}</span>
          </div>
          <div class="report-sub">
            ${n([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${c(e.article_count)} \u689D \xB7 \u7570\u52D5 ${tt(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${zn(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">${f("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${r.length?`<div class="report-alert">${te({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r.map(w=>n(w)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${c(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${tt(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${n(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${vs(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${n(l)}</span>
        </div>
        <div class="law-meta-grid">${v.join("")}</div>
      </div>

      ${Vn(e)}
      ${fs("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${Fn("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${fs("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${fs("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${Hn(e.attachments)}
      ${Un(e)}
    </div>
    ${o>100?Jn():""}
  </div>`}function Kn(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${ot()}
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
  </div>`}function Yn(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${ot()}
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
  </div>`}function Xn(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${n(t)}"
    data-law-source=""
    data-law-name="${n(t)}"
    title="\u6AA2\u8996\u300C${n(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(t)}${f("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function Zn(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let r=String(s.article_no||"").trim();r&&t.get(a).add(r)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${Xn(s)}
          <span class="judgment-citation-articles">${[...a].map(r=>n(r)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function er(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",r=String(e.full_text||""),i=Number(e.full_text_length)||r.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[me("\u6848\u865F",n(e.jid||"\u2014")),me("\u5E74\u5EA6",n(e.jyear||"\u2014")),me("\u5B57\u5225",n(e.jcase||"\u2014")),me("\u865F\u78BC",n(e.jno||"\u2014")),me("\u6CD5\u9662",n(e.court||"\u2014")),me("\u6848\u7531",n(e.title||"\u2014")),me("\u88C1\u5224\u65E5\u671F",tt(e.jdate)),me("\u4F86\u6E90\u58D3\u7E2E\u6A94",n(e.source_archive||"\u2014")),me("\u5168\u6587\u9577\u5EA6",`${c(i)} \u5B57`),me("\u5F15\u7528\u6578",c(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(me("\u532F\u5165 Run",`#${n(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${ot()}
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
            ${n(e.court||"\u2014")} \xB7 ${tt(e.jdate)} \xB7
            ${c(i)} \u5B57
          </div>
        </div>
        <div class="report-actions">
          ${e.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(e.pdf_url)}" target="_blank" rel="noopener noreferrer">${f("external",14)}<span>PDF</span></a>`:""}
        </div>
      </div>

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u88C1\u5224\u65E5\u671F</div>
          <div class="summary-value">${tt(e.jdate)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u9662</div>
          <div class="summary-value summary-value-text">${n(e.court||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u547D\u4E2D\u6CD5\u898F</div>
          <div class="summary-value">${c(s.length)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u5F15\u7528\u6578</div>
          <div class="summary-value">${c(e.citation_count)}</div>
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
          <span class="muted">${c(s.length)} \u6CD5\u898F \xB7 ${c(e.citation_count)} \u5F15\u7528</span>
        </div>
        ${Zn(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${c(i)} \u5B57</span>
        </div>
        ${r?`<div class="judgment-fulltext">${n(r)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function ua(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function Pt(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(ua).join(",")],r=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([r+o+1,...t.map(l=>i[l.key])].map(ua).join(","))}),`\uFEFF${a.join(`\r
`)}`}function Bt(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,r]of Object.entries(t))a.startsWith("_")||(s[a]=r);return s})}}function tr(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function pa(e,t){let s=performance.now(),a=ga(e,t),r=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,p=[],g=[],k=[],y=[];if(r==="settings"){g=(await Gs({keyword:i})).map(O=>({key:O.key,value:zs(O.value),updated_at:O.updated_at})),k=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let x=new Map;g.forEach(O=>{let K=String(O.key||"").split(".")[0]||"\u5176\u4ED6";x.set(K,(x.get(K)||0)+1)}),y=Array.from(x.entries()).map(([O,K])=>({label:O,value:K})).sort((O,K)=>K.value-O.value)}else{g=(await Lt({keyword:i,limit:wn})).map(O=>({kind:tr(O.kind),title:O.title,detail:O.detail,created_at:O.created_at})),k=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let x=new Map;g.forEach(O=>x.set(O.kind,(x.get(O.kind)||0)+1)),y=Array.from(x.entries()).map(([O,K])=>({label:O,value:K})).sort((O,K)=>K.value-O.value)}let h=g.length,S=(o-1)*l,v=g.slice(S,S+l),w=Math.round(performance.now()-s),C=Us();return C&&p.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:C?"degraded":"ok",message:C?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:r,columns:k,rows:v,total:h,page:o,page_size:l,duration_ms:w,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(h)},{label:"\u76EE\u524D\u9801\u9762",value:`${v.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:qt()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${w} ms`}],distribution:y,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${r}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${S}`,warnings:p,meta:{store:r,filters:a,client_side:!0}}}async function sr(e,t){let s=!1,a=null,r=[],i="law",o=null,l={},p=0,g=25,k="query",y=null,h=null,S=0,v=[],w=null,C=-1,T=0,x=null,O=null;e.innerHTML=`<section class="page data-page">
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
  </section>`;let K=e.querySelector("#query-sidebar"),ee=e.querySelector("#category-switch"),M=e.querySelector("#db-options-wrap"),j=e.querySelector("#sidebar-view-switch"),D=e.querySelector("#filter-area"),q=e.querySelector("#schema-area"),d=e.querySelector("#query-main"),u=e.querySelector("#schema-suggest-popover"),A=e.querySelector("#catalog-meta"),H=e.querySelector("#refresh-catalog"),G=m=>r.find($=>$.id===m),W=()=>G(i)?.databases||[],E=m=>W().find($=>$.id===m),J=(m,$)=>`${m}:${$}`,I=(m,$=i)=>l[J($,m.id)],X=(m,$)=>{Qs(m,$).catch(()=>{})},ne=()=>{if(!a){A.textContent="CATALOG \xB7 \u96E2\u7DDA",A.className="badge badge-danger badge-mono";return}let m=W(),$=m.filter(L=>L.available).length,_=G(i);A.textContent=`CATALOG \xB7 ${_?.label||i} \xB7 ${$}/${m.length} \u53EF\u7528`,A.className="badge badge-neutral badge-mono"},be=m=>{d.innerHTML=Mn(m)},he=()=>{let m=x?.returnScroll??O?.returnScroll;x=null,O=null;let $=E(o),_=$?I($):null;k==="schema"&&h?.result?d.innerHTML=gs(h.result,b($,h.tableId),{columnFilters:h.columnFilters||{},searchEnabled:$.id==="postgres"||$.id==="parquet"}):_?.result?d.innerHTML=Rt(_.result):$&&be($),typeof m=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:m,behavior:"smooth"}))},ge=(m="law-article-jump")=>{let $=d.querySelector(`#${m}`),_=ha($?.value);if(!_){B("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),$?.focus();return}let N=[...d.querySelectorAll("[data-article-no]")].find(R=>R.dataset.articleNo===_);if(!N){B(`\u627E\u4E0D\u5230\u7B2C ${_} \u689D\u3002`,"warn");return}N.scrollIntoView({behavior:"instant",block:"center"}),N.classList.add("is-jump-target"),window.setTimeout(()=>N.classList.remove("is-jump-target"),2400)},De=async({lawKey:m,sourceType:$="",lawName:_="",versionId:L=""})=>{let N=E(o),R=N?I(N):null,F=k==="schema"?h?.result:null;if(!N||!R?.result&&!F||!m)return;let ie=++p;x={seq:ie,lawKey:m,sourceType:$,lawName:_,versionId:L?String(L):"",page:1,detail:null,database:N.id,returnScroll:window.scrollY},O=null,d.innerHTML=Qn(_||m),d.scrollIntoView({behavior:"smooth",block:"start"});try{let $e=await U.lawDetail(m,$,x.versionId);if(s||!x||x.seq!==ie)return;x.detail=$e,x.page=1,d.innerHTML=Wn($e,{database:x.database,lawPage:x.page})}catch($e){if(s||!x||x.seq!==ie)return;d.innerHTML=Gn($e,_||m),B($e.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},Q=async({jid:m})=>{let $=E(o),_=$?I($):null,L=k==="schema"?h?.result:null;if(!$||!_?.result&&!L||!m)return;let N=++p;x=null;let R=$.id==="parquet"?"parquet":"postgres";O={seq:N,jid:m,detail:null,database:$.id,source:R,returnScroll:window.scrollY},d.innerHTML=Kn(m),d.scrollIntoView({behavior:"smooth",block:"start"});try{let F=await U.judgmentDetail(m,R);if(s||!O||O.seq!==N)return;O.detail=F,d.innerHTML=er(F,{database:O.database})}catch(F){if(s||!O||O.seq!==N)return;d.innerHTML=Yn(F,m),B(F.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},se=(m,$)=>`${i}:${m.id}:${$}`,b=(m,$)=>(m.tables||[]).find(_=>_.id===$)?.label||$,P=(m,$,{sort:_=null,columnFilters:L={}}={})=>{let N={column_filters:L};return m.id==="postgres"?(N.table=$,N.schema_preview=!0):m.id==="parquet"&&i==="judgment"?(N.table="judgment_documents",N.columns=kn):m.id==="parquet"&&(N.dataset="all",N.columns=_n),_?.key&&(N.sort=`${_.key}:${_.direction}`),N},z=async(m,$,{sort:_=null,columnFilters:L={}}={})=>{if(!$)return;je();let N=se(m,$),R=++S;y={tableId:$},h={key:N,tableId:$,loading:!0,result:null,error:null,sort:_,columnFilters:L},q.innerHTML=ms(m,G(i)?.label||i,$),d.innerHTML=ca(b(m,$));try{let F;if(m.id==="indexeddb"){let ie=jt(m,10);ie.values.store=$,ie.page=1,F=await pa(m,ie)}else m.id==="qdrant"?F={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:$,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(F=await U.query({database:m.id,filters:P(m,$,{sort:_,columnFilters:L}),page:1,pageSize:10}),_?.key&&(F.meta={...F.meta||{},sort:_}));if(s||R!==S)return;h={key:N,tableId:$,loading:!1,result:F,error:null,sort:_,columnFilters:L},k==="schema"&&y?.tableId===$&&(q.innerHTML=ms(m,G(i)?.label||i,$),d.innerHTML=gs(F,b(m,$),{columnFilters:L,searchEnabled:m.id==="postgres"||m.id==="parquet"}))}catch(F){if(s||R!==S)return;h={key:N,tableId:$,loading:!1,result:null,error:F,sort:_,columnFilters:L},k==="schema"&&y?.tableId===$&&(d.innerHTML=da(F,b(m,$)))}},de=()=>{let m=E(o);if(!m)return null;if(k==="schema"&&h?.result)return{db:m,tableId:h.tableId,columnFilters:h.columnFilters||{},sort:h.sort||null,mode:"schema"};let $=m?I(m):null,_=$?.result;return _&&(m.id==="postgres"||m.id==="parquet")?{db:m,tableId:_.table,columnFilters:$.columnFilters||{},sort:$.sort||null,mode:"query"}:null},ue=(m,$,_)=>{if(!m)return;let L=`${m.db.id}:${m.tableId}:${$}`,N=ce.get(L);N&&(window.clearTimeout(N),ce.delete(L)),je();let R={...m.columnFilters||{}},F=String(_||"").trim();if(F?R[$]=F:delete R[$],m.mode==="schema"){z(m.db,m.tableId,{sort:m.sort,columnFilters:R});return}let ie=I(m.db);ie.columnFilters=R,ie.page=1,ye(1)},ce=new Map,ve=()=>{T+=1,v=[],w=null,C=-1,u&&(u.hidden=!0,u.innerHTML="")},Oe=(m,$)=>{let _=String(m||""),L=_.toLocaleLowerCase(),N=String($||"").toLocaleLowerCase(),R=new Array(_.length).fill(!1),F=(fe,Ee)=>{for(let Se=fe;Se<fe+Ee;Se+=1)Se>=0&&Se<R.length&&(R[Se]=!0)},ie=L.indexOf(N);if(ie>=0)for(;ie>=0;)F(ie,N.length),ie=L.indexOf(N,ie+N.length);else{let fe=[];for(let Ee of N.match(/[一-鿿]{2,}/g)||[])for(let Se=0;Se<Ee.length-1;Se+=1)fe.push(Ee.slice(Se,Se+2));fe.push(...N.match(/[a-z0-9]+/g)||[]);for(let Ee of fe){let Se=L.indexOf(Ee);for(;Se>=0;)F(Se,Ee.length),Se=L.indexOf(Ee,Se+Ee.length)}}let $e="",we=0;for(;we<_.length;)if(R[we]){let fe=we;for(;fe<_.length&&R[fe];)fe+=1;$e+=`<mark>${n(_.slice(we,fe))}</mark>`,we=fe}else{let fe=we;for(;fe<_.length&&!R[fe];)fe+=1;$e+=n(_.slice(we,fe)),we=fe}return $e||n(_)},re=(m,$)=>{if(!u)return;let _=m.getBoundingClientRect(),L=Math.min(420,Math.max(220,_.width)),N=Math.min(360,34+$*30),R=_.bottom+4;R+N>window.innerHeight-8&&(R=Math.max(8,_.top-N-4));let F=Math.min(window.innerWidth-L-8,Math.max(8,_.left));u.style.width=`${L}px`,u.style.left=`${F}px`,u.style.top=`${R}px`},ke=m=>{if(!u)return;let $=[...u.querySelectorAll(".schema-suggest-item")];$.length&&(C=Math.max(0,Math.min($.length-1,m)),$.forEach((_,L)=>{_.classList.toggle("is-active",L===C)}),$[C].scrollIntoView({block:"nearest"}))},Me=m=>{let $=v[m],_=w;!$||!_||(ve(),ue(_,_.column,$))},Te=async(m,$,_,L)=>{if(!m||!_.trim()){ve();return}let N=++T;w={...m,column:$,input:L},C=-1;try{let R=await U.schemaSuggest({database:m.db.id,table:m.tableId,column:$,query:_,limit:1e3});if(N!==T||document.activeElement!==L||!u)return;let F=Array.isArray(R.values)?R.values:[];if(v=F,!F.length){ve();return}let ie=Number(R.total)>F.length?`\u5171 ${c(R.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${c(F.length)} \u500B`:`\u5171 ${c(R.total)} \u500B\u7B26\u5408`;u.innerHTML=`<div class="schema-suggest-head">${n(ie)}</div>${F.map(($e,we)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${we}"
            title="${n($e)}">${Oe($e,_)}</button>`).join("")}`,re(L,F.length),u.hidden=!1}catch{ve()}},je=()=>{let m=document.activeElement;m instanceof HTMLElement&&m.matches("[data-schema-search]")&&m.blur(),ve()},Re=(m,{resetReport:$=!1}={})=>{je();let _=I(m);if(ee.innerHTML=oa(r,i),M.innerHTML=An(W(),m.id),j.innerHTML=Ln(k),k==="schema"?(D.hidden=!0,D.innerHTML="",q.hidden=!1,q.innerHTML=ms(m,G(i)?.label||i,y?.tableId||"")):(q.hidden=!0,q.innerHTML="",D.hidden=!1,D.innerHTML=`${ia(m)}${us(m,_)}<div class="sidebar-note">${la(m)}</div>`),ne(),k==="schema"){let L=y?se(m,y.tableId):"";if(h&&h.key===L){let N=b(m,h.tableId);h.loading?d.innerHTML=ca(N):h.error?d.innerHTML=da(h.error,N):d.innerHTML=gs(h.result,N,{columnFilters:h.columnFilters||{},searchEnabled:m.id==="postgres"||m.id==="parquet"})}else d.innerHTML=Dn(m);return}$?be(m):_.result?d.innerHTML=Rt(_.result):be(m)},$t=(m,{persist:$=!0,resetReport:_=!1}={})=>{let L=W(),N=L.find(F=>F.id===m)||L[0];if(!N)return;x=null,O=null,y=null,h=null,S+=1,o=N.id;let R=J(i,N.id);l[R]||(l[R]=jt(N,g)),Re(N,{resetReport:_}),$&&(X(`data.last_database.${i}`,N.id),X("data.last_category",i))},yt=(m,{persist:$=!0,resetReport:_=!0,databaseId:L=null}={})=>{let N=G(m)||r[0];if(!N)return;i=N.id,x=null,O=null;let R=N.databases||[],F=L&&R.find(ie=>ie.id===L)||R.find(ie=>ie.id===o)||R[0];if(o=F?.id||null,!F){ee.innerHTML=oa(r,i),M.innerHTML=`<div class="sidebar-notice">${te({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,D.innerHTML="",ne();return}$t(F.id,{persist:!1,resetReport:_}),$&&(X("data.last_category",N.id),X(`data.last_database.${N.id}`,F.id))},Wt=m=>{let $=I(m),_=D.querySelector("#data-filter-form");_&&($.values=Et(_,m,$))},ye=async(m=null)=>{let $=E(o);if(!$)return;je();let _=I($);Wt($),m!==null&&(_.page=m),(!Number.isFinite(_.page)||_.page<1)&&(_.page=1);let L=++p;x=null,O=null,d.innerHTML=vt($);let N=D.querySelector("#run-query");ae(N,!0,"\u67E5\u8A62\u4E2D\u2026");try{let R;if($.id==="indexeddb"?R=await pa($,_):R=await U.query({database:$.id,filters:ps($,_),page:_.page,pageSize:_.pageSize}),s||L!==p)return;R.meta={...R.meta||{},column_filters:_.columnFilters||{},searchable:$.id==="postgres"||$.id==="parquet",sort:_.sort||R.meta?.sort||null},_.result=R,_.page=Number(R.page)||_.page,_.pageSize=Number(R.page_size)||_.pageSize,d.innerHTML=Rt(R);let F=G(i)?.label||i;await At({kind:"data",title:`${F} \xB7 ${$.label} \xB7 ${R.table||R.label||"query"}`,detail:`${c(R.total)} \u7B46 \xB7 ${V(R.duration_ms)}`,payload:{category:i,database:$.id,filters:ps($,_),page:_.page,page_size:_.pageSize}}),X("data.last_query",{category:i,database:$.id,filters:ps($,_),page:_.page,page_size:_.pageSize,at:new Date().toISOString()})}catch(R){if(s||L!==p)return;d.innerHTML=Ct(R,$),B(R.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&L===p&&ae(N,!1)}},Ve=async()=>{H.disabled=!0,ae(H,!0,"\u6574\u7406\u4E2D\u2026");try{let[m,$,_,L,N]=await Promise.all([U.catalog(),pt("data.last_category","law"),pt("data.last_database.law","postgres"),pt("data.last_database.judgment","postgres"),pt("data.page_size",25)]);if(s)return;a=m,r=Array.isArray(a.categories)?a.categories:[],g=ma.includes(Number(N))?Number(N):25;for(let ie of r)for(let $e of ie.databases||[]){let we=J(ie.id,$e.id);l[we]||(l[we]=jt($e,g))}let R=r.find(ie=>ie.id===$)||r[0];if(!R){ee.innerHTML="",M.innerHTML=`<div class="sidebar-notice">${te({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let F=R.id==="judgment"?L:_;if(i=R.id,o=null,yt(R.id,{persist:!1,resetReport:!0,databaseId:F}),s)return;B("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(m){if(s)return;a=null,r=[],ee.innerHTML="",ne(),M.innerHTML=`<div class="sidebar-notice">${te({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:n(m.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${f("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,d.innerHTML=`<div class="report-empty">${qe({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(H.disabled=!1,ae(H,!1))}};K.addEventListener("change",m=>{let $=m.target;if($.name==="category"){yt($.value);return}if($.name==="database"){$t($.value);return}let _=E(o);if(!_)return;let L=I(_),N=D.querySelector("#data-filter-form");!N||!$.name||(L.values=Et(N,_,L),L.page=1,$.name==="table"&&(x=null,O=null,L.sort=null,L.columnFilters={},L.result=null,D.innerHTML=us(_,L),be(_)))}),K.addEventListener("input",m=>{let $=E(o);if(!$)return;let _=D.querySelector("#data-filter-form");if(!_||!m.target.name||m.target.name==="table")return;let L=I($);L.values=Et(_,$,L)}),K.addEventListener("submit",m=>{m.target.id==="data-filter-form"&&(m.preventDefault(),ye(1))}),K.addEventListener("click",m=>{let $=m.target.closest("[data-action]"),_=$?.dataset.action;if(_==="sidebar-view"){let L=E(o);if(!L)return;let N=I(L),R=D.querySelector("#data-filter-form");R&&k==="query"&&(N.values=Et(R,L,N)),k=$.dataset.view==="schema"?"schema":"query",Re(L);return}if(_==="select-schema-table"){let L=E(o);if(!L)return;z(L,$.dataset.tableId||"");return}if(_==="reset"){let L=E(o);if(!L)return;x=null,O=null;let N=I(L);l[J(i,L.id)]=jt(L,N.pageSize),D.innerHTML=`${ia(L)}${us(L,l[J(i,L.id)])}<div class="sidebar-note">${la(L)}</div>`,be(L),B("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}m.target.closest("#catalog-retry")&&Ve()}),d.addEventListener("input",m=>{let $=m.target.closest("[data-schema-search]");if(!$)return;let _=de();if(!_)return;let L=$.dataset.schemaSearch||"",N=$.value,R=`${_.mode}:${_.db.id}:${_.tableId}:${L}`,F=ce.get(R);if(F&&window.clearTimeout(F),!N.trim()){ce.delete(R),ve(),ue(_,L,"");return}let ie=window.setTimeout(()=>{ce.delete(R),Te(_,L,N,$)},250);ce.set(R,ie)}),d.addEventListener("keydown",m=>{let $=m.target.closest("[data-schema-search]");if(!$)return;let _=de();if(_){if(m.key==="Escape"){ve();return}if(m.key==="ArrowDown"||m.key==="ArrowUp"){if(!u||u.hidden)return;m.preventDefault();let L=m.key==="ArrowDown"?1:-1;ke(C<0?L>0?0:v.length-1:C+L);return}if(m.key==="Enter"){if(m.preventDefault(),u&&!u.hidden&&C>=0){Me(C);return}ue(_,$.dataset.schemaSearch||"",$.value)}}}),u?.addEventListener("mousedown",m=>{m.preventDefault()}),u?.addEventListener("click",m=>{let $=m.target.closest("[data-schema-suggest-index]");$&&Me(Number($.dataset.schemaSuggestIndex))});let Es=m=>{m.target.closest("[data-schema-search]")||u?.contains(m.target)||ve()};return document.addEventListener("click",Es),window.addEventListener("scroll",ve,!0),window.addEventListener("resize",ve),d.addEventListener("keydown",m=>{m.target.matches(".law-jump-input")&&m.key==="Enter"&&(m.preventDefault(),ge(m.target.id))}),d.addEventListener("click",async m=>{let $=m.target.closest("[data-action]");if(!$)return;let _=$.dataset.action,L=E(o),N=L?I(L):null,R=N?.result;if(_==="back-to-results"){he();return}if(_==="open-law"){De({lawKey:$.dataset.lawKey||"",sourceType:$.dataset.lawSource||"",lawName:$.dataset.lawName||""});return}if(_==="open-judgment"){Q({jid:$.dataset.jid||""});return}if(_==="jump-article"){ge($.dataset.jumpInput||"law-article-jump");return}if(_==="sort-column"){let F=$.dataset.sortKey||"";if(!F||!L)return;if(k==="schema"&&h?.result){let we=h.sort,fe=F==="jdate"||F==="law_modified_date"||F==="article_count"||F==="citation_count"||F==="full_text_length"||F==="created_at"||F==="updated_at",Ee=we?.key===F?we.direction==="asc"?"desc":"asc":fe?"desc":"asc";z(L,h.tableId,{sort:{key:F,direction:Ee},columnFilters:h.columnFilters||{}});return}if(!N)return;let ie=N.sort,$e=ie?.key===F?ie.direction==="asc"?"desc":"asc":F==="jdate"?"desc":"asc";N.sort={key:F,direction:$e},ye(1);return}if(_==="retry"){ye(N?.page||1);return}if(R){if(_==="prev-page"){ye(Math.max(1,Number(R.page)-1));return}if(_==="next-page"){let F=Math.max(1,Math.ceil(Number(R.total)/Number(R.page_size)));ye(Math.min(F,Number(R.page)+1));return}if(_==="copy-query"){let F=await St(R.query_text||"");B(F?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",F?"ok":"warn");return}if(_==="export-json"){let F=`${R.database}-${R.table||"query"}-page-${R.page}.json`;Be(F,JSON.stringify(Bt(R),null,2),"application/json;charset=utf-8"),B(`\u5DF2\u532F\u51FA ${F}`,"ok");return}if(_==="export-csv"){let F=`${R.database}-${R.table||"query"}-page-${R.page}.csv`;Be(F,Pt(R),"text/csv;charset=utf-8"),B(`\u5DF2\u532F\u51FA ${F}`,"ok")}}}),d.addEventListener("change",m=>{let $=m.target.closest("[data-action='select-law-version']");if($&&x){De({lawKey:x.lawKey,sourceType:x.sourceType,lawName:x.lawName,versionId:$.value});return}if(!m.target.matches("[data-page-size]"))return;let _=E(o);if(!_)return;let L=I(_);L.pageSize=Number(m.target.value)||25,L.page=1,X("data.page_size",L.pageSize),ye(1)}),H.addEventListener("click",()=>{Ve()}),await Ve(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0;for(let m of ce.values())window.clearTimeout(m);ce.clear(),ve(),document.removeEventListener("click",Es),window.removeEventListener("scroll",ve,!0),window.removeEventListener("resize",ve)}}var wa=[10,25,50,100],ar=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function $s(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function nr(e,t=e){return`<option value="${n(e)}">${n(t)}</option>`}function ft(e,t,s,a,r=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${n(t)}</span>
      <span class="field-tag">${n(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${n(e)}">
      ${nr("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${n(i)}" ${String(i)===String(a)?"selected":""}>${n(i)}</option>`).join("")}
    </select>
    ${r?`<span class="field-help">${n(r)}</span>`:""}
  </div>`}function rr(e,t){let s=ar.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${ft("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${ft("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${ft("model","\u6A21\u578B",e.models||[],t.model)}
    ${ft("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${ft("method","\u65B9\u6CD5",e.methods||[],t.method)}
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
    </div>`}function $a(){let e=document.getElementById("performance-filter-form");if(!e)return $s();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function _a(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function ir(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),r=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${r}.${i}`}function or(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"is-client":t.includes("judgment.rag")?"is-rag":t.includes("judgment.web.app")?"is-api":t.includes("judgment.web.query")?"is-data":t.includes("judgment.judgment_index")?"is-index":"is-other"}function lr(e){let t=new Map(e.map(a=>[a.seq,a.parent_seq])),s=new Map;for(let a of e){if(Number.isInteger(a.depth)){s.set(a.seq,a.depth);continue}let r=0,i=a.parent_seq,o=0;for(;i&&t.has(i)&&o<20;)r+=1,i=t.get(i),o+=1;s.set(a.seq,r)}return s}function cr(e){let t=Object.entries(e||{});if(!t.length)return'<span class="muted">\u7121\u53C3\u6578</span>';let s=t.slice(0,8),a=t.length-s.length;return`<div class="flow-param-list">${s.map(([r,i])=>`<span class="flow-param">
        <span class="flow-param-key">${n(r)}</span>
        <span class="flow-param-value">${n(_a(i))}</span>
      </span>`).join("")}${a>0?`<span class="flow-param-more">+${a}</span>`:""}</div>`}function dr(e){let t=new Map,s=Math.max(0,Number(e[0]?.offset_ms)||0);return e.forEach((a,r)=>{let i=Math.max(0,Number(a.offset_ms)||0),o=Math.max(0,Number(a.duration_ms)||0),l=e[r+1],p=l?Math.max(i,Number(l.offset_ms)||i):null,g=p===null?i+o:p,k=Math.max(0,g-i),y=Math.max(0,g-s);t.set(a.seq,{offset:i,duration:o,lap:k,cumulative:y})}),t}function ur(e,t,s,a){let r=a.get(e.seq)||{},i=Math.max(0,Number(r.duration)||0),o=Math.max(0,Number(r.offset)||0),l=Math.max(0,Number(r.lap)||0),p=Math.max(0,Number(r.cumulative)||0),g=Math.max(t,o+i,1),k=Math.min(100,o/g*100),y=Math.min(100-k,Math.max(.6,l/g*100)),h=s.get(e.seq)||0,v=ir(e.started_at)||`+${o.toFixed(0)} ms`,w=e.started_at?`\u958B\u59CB\uFF1A${oe(e.started_at)} \xB7 +${o.toFixed(1)} ms`:`\u958B\u59CB\uFF1A+${o.toFixed(1)} ms`;return`<div class="flow-segment ${e.status==="error"?"is-error":""}" style="--depth:${Math.min(h,8)}">
    <div class="flow-segment-head">
      <span class="flow-seq">#${n(String(e.seq??"\u2014"))}</span>
      <span class="flow-segment-name">${n(e.name||"unnamed")}</span>
      <span class="flow-segment-start" title="${n(w)}">${n(v)}</span>
      <span class="flow-segment-duration" title="\u8DDD\u4E0B\u4E00\u9EDE ${V(l)}\uFF1B\u7D2F\u8A08 ${V(p)}">${V(l)}</span>
      <span class="flow-segment-span" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${V(p)}</span>
    </div>
    <div class="flow-segment-loc">
      <span class="flow-segment-loc-text">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</span>
      <span class="flow-segment-mobile-cum" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${V(p)}</span>
    </div>
    <div class="flow-track" title="\u958B\u59CB +${o.toFixed(1)} ms \xB7 \u8DDD\u4E0B\u4E00\u9EDE ${V(l)} \xB7 \u7D2F\u8A08 ${V(p)}">
      <span class="flow-bar ${or(e)}" style="left:${k.toFixed(2)}%;width:${y.toFixed(2)}%"></span>
    </div>
    ${cr(e.params)}
    ${e.error?`<div class="flow-segment-error">${n(e.error)}</div>`:""}
  </div>`}function pr(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},r=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?V(a.avg_total_ms??0):"\u2014",o=a.samples?V(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
    <div class="perf-stat-grid">
      <div class="perf-stat">
        <span class="perf-stat-value">${c(e?.avg_segments??0)}</span>
        <span class="perf-stat-label">\u5E73\u5747\u6BB5\u6578\uFF08\u6A23\u672C\uFF09</span>
      </div>
      <div class="perf-stat">
        <span class="perf-stat-value">${c(e?.max_segments??0)}</span>
        <span class="perf-stat-label">\u6700\u5927\u6BB5\u6578</span>
      </div>
      <div class="perf-stat">
        <span class="perf-stat-value">${c(e?.sample_size??0)}</span>
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
                    <span class="perf-model-count">${c(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${V(l.avg_ms)}`:""}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u65B0\u7684 Flow \u6703\u5F9E params.model \u81EA\u52D5\u5F59\u6574\u3002</p>'}
      </div>
      <div class="perf-flow-stat-panel">
        <div class="report-section-head">
          <span class="report-section-title">\u6700\u6162\u5340\u6BB5\uFF08\u5E73\u5747\uFF09</span>
          <span class="muted" style="font-size:9.5px">\u6700\u8FD1 ${c(e?.sample_size??0)} \u7B46</span>
        </div>
        ${t.length?`<div class="perf-seg-list">${t.slice(0,6).map(l=>`<div class="perf-seg-row">
                    <span class="perf-seg-name" title="${n(l.label)}">${n(l.label)}</span>
                    <span class="perf-seg-track"><span style="width:${Math.max(2,(Number(l.avg_ms)||0)/r*100).toFixed(1)}%"></span></span>
                    <span class="perf-seg-ms">${V(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function Le(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),r=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(r).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:r?`${r}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function ka(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function mr(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let r=Number(a.points_per_second)||0,i=Math.max(2,r/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${n(ka(a))}</strong>
          <span>${n(oe(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${n(`${c(a.indexed_count)} \u7B46 \xB7 ${Le(a.duration_ms)} \xB7 ${c(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${r.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${c(a.indexed_count)} \u7B46 \xB7 ${Le(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function gr(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${n(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${n(`${s.label} ${Le(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${n(s.key)}"></i>
            <span>${n(s.label)}</span>
            <strong>${Le(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 Ollama Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function vr(e,t){let s=(Array.isArray(e)?e:[]).map(T=>({elapsed:Math.max(0,Number(T.elapsed_s)||0),indexed:Math.max(0,Number(T.indexed)||0)})).filter(T=>T.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(T=>T.elapsed),(Number(t)||0)/1e3,1),r=Math.max(...s.map(T=>T.indexed),1),i=760,o=150,l=12,p=12,g=i-l*2,k=o-p*2,y=s.map(T=>[l+T.elapsed/a*g,o-p-T.indexed/r*k]),h=y.map(([T,x],O)=>`${O===0?"M":"L"}${T.toFixed(1)},${x.toFixed(1)}`).join(" "),S=`${h} L${y[y.length-1][0].toFixed(1)},${o-p} L${y[0][0].toFixed(1)},${o-p} Z`,v=Math.max(1,Math.ceil(y.length/14)),w=y.map(([T,x],O)=>O%v===0||O===y.length-1?`<circle cx="${T.toFixed(1)}" cy="${x.toFixed(1)}" r="2.6" />`:"").join(""),C=[0,1,2,3].map(T=>{let x=p+k/3*T;return`<line x1="${l}" y1="${x.toFixed(1)}" x2="${i-l}" y2="${x.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${c(r)} \u7B46 \xB7 ${Le(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${C}
      <path d="${S}" class="index-progress-area"></path>
      <path d="${h}" class="index-progress-line"></path>
      ${w}
      <line x1="${l}" y1="${o-p}" x2="${i-l}" y2="${o-p}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${p}" x2="${l}" y2="${o-p}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${Le(a*500)}</span>
      <span>${Le(a*1e3)}</span>
    </div>
  </div>`}function fr(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},r=t.coverage||{},i=r.total_judgments>0?`${c(r.indexed_judgments)} / ${c(r.total_judgments)}\uFF08${(100*r.indexed_judgments/r.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:c(t.indexed_count),note:`${c(t.batch_count)} \u6279 \xD7 ${c(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:Le(t.duration_ms),note:`${c(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:Le(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${Le(t.batch_min_ms)} \xB7 \u6700\u6162 ${Le(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${c(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${n(ka(t))}</span>
    </div>
    <div class="index-perf-summary">
      ${o.map(l=>`<div class="index-perf-stat">
            <div class="summary-label">${n(l.label)}</div>
            <div class="index-perf-value">${n(l.value)}</div>
            <div class="index-perf-note">${n(l.note)}</div>
          </div>`).join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${n(oe(t.started_at))}</span>
      <span><strong>batch</strong> ${c(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${c(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${c(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${n(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${Le(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${mr(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${Le(t.duration_ms)}</span>
        </div>
        ${gr(t)}
      </div>
    </div>
    ${vr(t.progress,t.duration_ms)}
  </section>`}function br(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${wa.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${f("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${f("chevronRight",13)}</button>
    </div>
  </div>`}function hr(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((v,w)=>Number(v.seq)-Number(w.seq)):[],r=s?.summary||{},i=Array.isArray(r.models)?r.models:[],o=s?.client||{},l=s?.metadata||{},p=l.question||"",g=l.answer||"",k=p||g?`<div class="perf-flow-qa">
          ${p?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${n(p)}</span></div>`:""}
          ${g?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${n(g)}</span></div>`:""}
        </div>`:"",y=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(v=>(Number(v.offset_ms)||0)+(Number(v.duration_ms)||0)),1),h=lr(a),S=dr(a);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${n(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${n(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${n(e.method||"")} ${n(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${oe(e.started_at)}</span>
      <span class="perf-record-duration">${V(e.duration_ms)}</span>
      ${le(e.status)}
      <span class="perf-record-chevron">${f("chevronRight",14)}</span>
    </summary>
    <div class="perf-record-body">
      <div class="perf-flow-meta">
        <span><strong>Request</strong> <span class="mono">${n(e.request_id||s?.request_id||"\u2014")}</span></span>
        <span><strong>Server</strong> ${V(e.duration_ms)}</span>
        ${o.total_ms?`<span><strong>Client \u5168\u6D41\u7A0B</strong> ${V(o.total_ms)}</span>`:""}
        ${o.render_ms!==void 0?`<span><strong>Render</strong> ${V(o.render_ms)}</span>`:""}
        <span><strong>Flow</strong> ${a.length} \u6BB5</span>
        ${a.length?"<span><strong>\u9EDE\u4F4D</strong> \u5340\u9593\uFF1D\u4E0B\u4E00\u9EDE\u958B\u59CB\uFF0D\u672C\u9EDE\u958B\u59CB\uFF1B\u7D2F\u8A08\uFF1D\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\uFF0C\u6700\u5F8C\u4E00\u9EDE\u70BA\u7E3D\u6642\u9593</span>":""}
      </div>
      ${k}
      ${i.length?`<div class="chips perf-record-models">${i.map(v=>`<span class="chip">${n(v)}</span>`).join("")}</div>`:""}
      ${a.length?`<div class="flow-axis"><span>0 ms</span><span>${V(y)}</span></div>
            <div class="flow-timeline">${a.map(v=>ur(v,y,h,S)).join("")}</div>`:`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${n(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${n(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var bt={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"},ya={embedding:"EMB",retrieval:"\u6AA2\u7D22",context:"\u53D6\u6587",llm:"LLM",validation:"\u9A57\u8B49",overhead:"\u5176\u4ED6"};function Sa(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}function $r(e){let t=String(e.status||"pending"),s=Math.max(0,Math.min(100,Number(e.progress)||0)),a=t==="pending"?0:t==="running"?Math.max(s,12):100,r=t==="running"?"\u57F7\u884C\u4E2D\u2026":t==="pending"?"\u7B49\u5F85":e.duration_ms?V(e.duration_ms):Sa(t);return`<div class="test-flow-step is-${n(t)}">
    <div class="test-flow-step-head">
      <span class="test-flow-model" title="${n(e.model||"")}">${n(e.model||"\u2014")}</span>
      <span class="test-flow-step-meta">${n(r)}</span>
    </div>
    <div class="test-flow-step-loc">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</div>
    <div class="test-flow-track">
      <span class="test-flow-bar" style="width:${a}%"></span>
    </div>
    ${e.error_message?`<div class="test-flow-error">${n(e.error_message)}</div>`:""}
    ${e.details&&Object.keys(e.details).length?`<div class="test-flow-details">${n(Object.entries(e.details).slice(0,4).map(([i,o])=>`${i}=${_a(o)}`).join(" \xB7 "))}</div>`:""}
  </div>`}function yr(e,t){if(!t.length)return"";let s=t.reduce((a,r)=>a+(Number(r.progress)||0),0)/t.length;return`<section class="test-flow-stage">
    <div class="test-flow-stage-head">
      <span class="test-flow-stage-title">${n(bt[e]||e)}</span>
      <span class="test-flow-stage-meta">${t.length} \u500B\u7A0B\u5E8F \xB7 ${Math.round(s)}%</span>
    </div>
    <div class="test-flow-stage-steps">${t.map($r).join("")}</div>
  </section>`}function xa(e,t){let s=Date.now(),a=new Map;for(let y of t){let h=Number(y.duration_ms)||0;if(y.status==="running"&&y.started_at){let S=Date.parse(y.started_at);Number.isFinite(S)&&(h=Math.max(h,s-S))}a.set(y.stage,(a.get(y.stage)||0)+h)}let r=Array.isArray(e.stage_order)?e.stage_order:Object.keys(bt),i=[],o=new Set;for(let y of r)t.some(h=>h.stage===y)&&(o.add(y),i.push({stage:y,label:bt[y]||y,short:ya[y]||y,duration:a.get(y)||0}));for(let[y,h]of a)o.has(y)||i.push({stage:y,label:bt[y]||y,short:ya[y]||y,duration:h});let l=i.reduce((y,h)=>y+h.duration,0),p=Number(e.total_ms)||0,g=Math.max(l,p),k=Math.max(0,g-l);return k>1&&i.push({stage:"overhead",label:"\u5176\u4ED6\uFF0F\u6392\u7A0B",short:"\u5176\u4ED6",duration:k}),{entries:i,total:g||l,stepTotal:l}}function wr(e,t){let{entries:s,total:a}=xa(e,t),r=s.filter(o=>o.duration>0).map(o=>{let l=a?o.duration/a*100:0;return`<span class="test-flow-time-seg stage-${n(o.stage)}" style="width:${l.toFixed(2)}%" title="${n(o.label)} \xB7 ${V(o.duration)}\uFF08${l.toFixed(1)}%\uFF09">${l>=8?n(o.short):""}</span>`}).join(""),i=s.map(o=>{let l=a?o.duration/a*100:0;return`<span class="test-flow-legend-item">
        <i class="test-flow-dot stage-${n(o.stage)}"></i>
        <span>${n(o.label)}</span>
        <strong>${V(o.duration)}</strong>
        <em>${l.toFixed(1)}%</em>
      </span>`}).join("");return`<div class="test-flow-time">
    <div class="test-flow-total-head">
      <span>\u7E3D\u6D41\u7A0B\u6642\u9593\uFF08\u4F9D\u968E\u6BB5\uFF09</span>
      <span>${V(a)}${e.status==="running"?" \xB7 \u4F30\u7B97\u4E2D":""}</span>
    </div>
    <div class="test-flow-time-bar">
      ${r||'<span class="test-flow-time-empty">\u5C1A\u7121\u968E\u6BB5\u8017\u6642</span>'}
    </div>
    <div class="test-flow-legend">${i}</div>
    ${e.status==="running"?'<div class="test-flow-time-note">\u57F7\u884C\u4E2D\u7684\u968E\u6BB5\u4EE5\u958B\u59CB\u6642\u9593\u4F30\u7B97\uFF1B\u5B8C\u6210\u5F8C\u4EE5\u4F3A\u670D\u5668\u56DE\u5831\u7684 duration \u70BA\u6E96\u3002</div>':""}
  </div>`}function lt(e,t,s,a={}){let r=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(x=>`<option value="${n(x.run_id)}" ${x.run_id===s?"selected":""}>${n(Sa(x.status))} \xB7 ${n((x.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${n(oe(x.started_at))}</option>`)].join(""),o=r?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${f("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${f("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?le(e.status):""}</div>
      <div class="test-flow-question">${e?n(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${qe({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let p=Array.isArray(e.steps)?e.steps:[],g=new Map;for(let x of p)g.has(x.stage)||g.set(x.stage,[]),g.get(x.stage).push(x);let y=(Array.isArray(e.stage_order)?e.stage_order:Object.keys(bt)).map(x=>yr(x,g.get(x)||[])).join(""),h=e.models||{},S=xa(e,p),v=e.status==="running"?`${V(S.total)}\uFF08\u4F30\u7B97\uFF09`:V(e.total_ms),w=p.find(x=>x.stage==="llm"&&x.model===e.summary?.primary_model)||p.find(x=>x.stage==="llm"&&x.details?.answer_preview),C=e.answer||w?.details?.answer_preview||"",T=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${e.summary?.primary_model?`<span class="mono">${n(e.summary.primary_model)}</span>`:""}
    </div>
    <p>${C?n(C):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${n(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${n(oe(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${v}</span>
      <span><strong>Embedding</strong> ${Array.isArray(h.embedding)?h.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(h.llm)?h.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${n(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${T}
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
    ${wr(e,p)}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":r?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${e.summary?.primary_model?`<span class="mono">primary=${n(e.summary.primary_model)}</span>`:""}
    </div>
  </div>`}function _r(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},r=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${le(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${c(e.total)} \u7B46\u7B26\u5408 \xB7 ${V(e.duration_ms)} \xB7
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
    ${fr(r)}
    ${pr(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>hr(i,o)).join(""):qe({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${br(e)}
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
  </div>`}async function kr(e,t){let s=!1,a=$s(),r={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null;e.innerHTML=`<section class="page data-page performance-page">
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
              <div id="performance-report">${vt({label:"\u6548\u80FD\u5831\u8868"})}</div>
            </section>
          </div>
        </div>
        <div id="performance-panel-benchmark" hidden></div>
      </section>
    </div>
  </section>`;let p=e.querySelector("#performance-filter-fields"),g=e.querySelector("#performance-filter-form"),k=e.querySelector("#performance-test-flow"),y=e.querySelector("#performance-report"),h=e.querySelector("#performance-meta"),S=e.querySelector("#performance-refresh"),v=[...e.querySelectorAll("[data-performance-tab]")],w={overview:e.querySelector("#performance-panel-overview"),benchmark:e.querySelector("#performance-panel-benchmark")},C="overview",T=E=>{C=E;for(let J of v){let I=J.dataset.performanceTab===E;J.classList.toggle("is-active",I),I?J.setAttribute("aria-current","page"):J.removeAttribute("aria-current")}for(let[J,I]of Object.entries(w))I&&(I.hidden=J!==E);E==="benchmark"&&(h.textContent="BENCHMARK \xB7 RAG")},x=ra(e,{onNavigate:E=>T(E)}),O=E=>{T(E),E==="benchmark"&&x.show()};e.addEventListener("click",E=>{let J=E.target.closest("[data-performance-tab]");J&&O(J.dataset.performanceTab||"overview")});let K=null,ee=[],M="",j=null,D="",q=()=>{p.innerHTML=rr(r,a)},d=()=>{let E=JSON.stringify({selected:M,tick:K?.status==="running"?Math.floor(Date.now()/1e3):0,runs:ee.map(J=>`${J.run_id}:${J.status}`),run:K?{run_id:K.run_id,status:K.status,progress:K.progress,steps:(K.steps||[]).map(J=>`${J.stage}:${J.model}:${J.status}:${J.progress}`)}:null});E!==D&&(D=E,k.innerHTML=lt(K,ee,M))},u=async()=>{try{let E=await U.testRuns(30);if(s)return;ee=Array.isArray(E.runs)?E.runs:[]}catch{if(s)return;ee=[]}},A=async()=>{try{let E=M?await U.testRun(M):await U.testRunCurrent();if(s)return;K=E.run||null,!M&&K&&K.status!=="running"&&!ee.some(J=>J.run_id===K.run_id)&&await u(),d()}catch{if(s)return;K=null,d()}},H=async()=>{s||(M||await A(),s||(j=window.setTimeout(H,1500)))};k.addEventListener("change",async E=>{E.target.id==="test-run-select"&&(M=String(E.target.value||""),await A())}),k.addEventListener("click",async E=>{E.target.closest("#test-flow-refresh")&&(M="",await u(),await A())});let G=async(E=i)=>{i=Math.max(1,Number(E)||1),a=$a(),y.innerHTML=vt({label:"\u6548\u80FD\u5831\u8868"});let J=e.querySelector("#performance-run");ae(J,!0,"\u67E5\u8A62\u4E2D\u2026");try{let I=await U.performance(a,i,o);if(s)return;l=I,i=Number(I.page)||i,o=Number(I.page_size)||o,y.innerHTML=_r(I),h.textContent=`PERFORMANCE \xB7 ${c(I.total)} \u7B46`,h.className="badge badge-neutral badge-mono"}catch(I){if(s)return;y.innerHTML=Ct(I,{label:"\u6548\u80FD\u5831\u8868"}),B(I.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||ae(J,!1)}},W=async()=>{try{r=await U.performanceOptions()}catch{r={processes:[],modules:[],statuses:[],methods:[],models:[]}}q()};return g.addEventListener("submit",E=>{E.preventDefault(),G(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=$s(),i=1,q(),G(1)}),S.addEventListener("click",async()=>{if(C==="benchmark"){ae(S,!0,"\u6574\u7406\u4E2D\u2026");try{await x.refresh()}finally{s||ae(S,!1)}return}a=$a(),S.disabled=!0,ae(S,!0,"\u6574\u7406\u4E2D\u2026"),await W(),await u(),s||await A(),s||await G(1),s||(S.disabled=!1,ae(S,!1))}),y.addEventListener("click",async E=>{let J=E.target.closest("[data-action]");if(!J||!l)return;let I=J.dataset.action;if(I==="retry"){G(i);return}if(I==="prev-page"){G(Math.max(1,Number(l.page)-1));return}if(I==="next-page"){let X=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));G(Math.min(X,Number(l.page)+1));return}if(I==="copy-query"){let X=await St(l.query_text||"");B(X?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",X?"ok":"warn");return}if(I==="export-json"){let X=`performance-page-${l.page}.json`;Be(X,JSON.stringify(Bt(l),null,2),"application/json;charset=utf-8"),B(`\u5DF2\u532F\u51FA ${X}`,"ok");return}if(I==="export-csv"){let X=`performance-page-${l.page}.csv`;Be(X,Pt(l),"text/csv;charset=utf-8"),B(`\u5DF2\u532F\u51FA ${X}`,"ok")}}),y.addEventListener("change",E=>{E.target.matches("[data-page-size]")&&(o=Number(E.target.value)||25,wa.includes(o)||(o=25),G(1))}),await Promise.allSettled([W(),u()]),s||(await A(),await G(1),H()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,j&&window.clearTimeout(j),x.destroy()}}var Sr=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function xr(){return`<div class="answer-placeholder">
    <span class="empty-icon">${f("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}var qr={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"Ollama embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"Ollama LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function Ar(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`Ollama run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`Ollama embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:qr[t]||t||"backend step"}function qa(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function Aa(e){let t=Number(e);return Number.isFinite(t)?`${c(Math.max(0,Math.round(t)))} ms`:"\u2014"}function ws(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function Lr(){return`<div class="rag-process is-open" id="rag-process">
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
  </div>`}function Mr(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),r=performance.now(),i=new Map,o=(h,S,v)=>{let w=h.querySelector(S);w&&(w.textContent=v)},l=h=>{if(h.failed){o(h.element,".rag-process-meta","\u5931\u6557");return}if(h.hasChildren){o(h.element,".rag-process-meta","");return}o(h.element,".rag-process-meta",Aa(h.durationMs))},p=h=>{let S=h-1,v=[...i.values()].reverse();for(let w of v){if(S<0)break;w.depth<=S&&(w.hasChildren||(w.hasChildren=!0,w.element.dataset.hasChildren="true",w.finished&&l(w)),S=w.depth-1)}},g=h=>{if(!s)return null;let S=String(h?.seq??`step-${i.size+1}`),v=i.get(S);if(!v){let w=Math.max(0,Math.min(6,Number(h?.depth)||0));p(w);let C=document.createElement("div");C.className="rag-process-item is-running",C.dataset.processKey=S,C.style.setProperty("--depth",String(w)),C.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(C),v={element:C,depth:w,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(S,v)}return o(v.element,".rag-process-label",Ar(h)),v.element.title=qa(h),v};return{step:h=>{let S=h?.segment;if(!S)return;let v=g(S);if(v){if(h.type==="segment_start"){v.element.classList.add("is-running"),o(v.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(h.type==="segment_end"){let w=S.status==="error";v.element.classList.remove("is-running"),v.element.classList.toggle("is-error",w),v.finished=!0,v.failed=w,v.durationMs=Number(S.duration_ms)||0,l(v),v.element.title=[qa(S),w&&S.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(h=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(w=>{w.classList.remove("is-running");let C=w.dataset.hasChildren==="true";o(w,".rag-process-meta",C?"":h?"\u5B8C\u6210":"\u4E2D\u65B7")});let S=s?.children.length||i.size,v=Aa(Math.max(0,performance.now()-r));return a&&(a.textContent=h?`\u5B8C\u6210 \xB7 ${S} \u6B65 \xB7 ${v}`:`\u5931\u6557 \xB7 ${S} \u6B65`),t.classList.add("is-complete"),ws(t,!1),t.outerHTML},collapse:()=>ws(t,!1)}}function Tr(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${f("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":Lr()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${n(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function La(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function It(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let r=String(e||"").trim();return r?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${n(t||r)}"
    data-source-type="${n(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${n(r)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${n(r)} \u7684\u5B8C\u6574\u689D\u6587">${n(a||r)}</button>`:""}function jr(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(l=>`<span>${n(l)}</span>`).join(""),r=(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(l=>It(l)).join(""),i=e.jid?` data-action="open-parquet-judgment"
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
  </article>`}function Er(e,t){let s=[e.law_level,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${n(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${f("external",11)}</a>`:"",r=e.law_key||e.law_name||"",i=r?` data-action="open-law-source"
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
  </article>`}function Rr(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",r=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${n(s)}</span>`,a,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${Ce(e.law_modified_date)}`:""].filter(Boolean).map(S=>`<span>${S}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${n(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${n(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${n(o.entity||"")}\u300D\u7684\u5224\u6C7A ${c(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${c(o.law_count||0)} \u6B21</span>
      </div>`:"",p=e.law_key||"",g=e.source_type||"",k=(Array.isArray(e.articles)?e.articles:[]).map(S=>{let v=String(S.article_no||"");return`<div class="law-source-article"${p&&v?` data-action="open-law-source"
        data-law-key="${n(p)}"
        data-source-type="${n(g)}"
        data-article-no="${n(v)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${n(v)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} ${n(v)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${n(S.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${n(S.article_content||"")}</p>
      </div>`}).join(""),y=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${f("external",11)}</a>`:"",h=e.law_key?` data-action="open-law-source"
        data-law-key="${n(e.law_key)}"
        data-source-type="${n(e.source_type||"")}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u672C\u5730 Parquet \u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation law-source">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body"${h}>
      <h4 class="citation-name">${n(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${r}</div>
      ${i}
      ${l}
      ${k}
    </div>
    <div class="citation-links">${y}</div>
  </article>`}function Nr(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function Cr(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${n(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",r=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(r==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),p=s.index!=null?`<span class="law-answer-index">[${n(String(s.index))}]</span>`:"",g=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${n(a)}"
            data-source-type="${n(r)}"
            title="\u9EDE\u64CA\u958B\u555F ${n(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${n(i)} \u7684\u5B8C\u6574\u689D\u6587">${n(i)}</button>`:`<strong>${n(i)}</strong>`,k=Array.isArray(s.articles)?s.articles:[],y=k.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${k.map(h=>{let S=String(h.article_no||"").trim(),v=Nr(h.article_content);return!a||!S?`<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${n(S||"\u689D\u6587")}</span>
                  <span class="law-answer-article-text">${n(v)}</span>
                </div>`:`<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${n(a)}"
                data-source-type="${n(r)}"
                data-article-no="${n(S)}"
                title="\u9EDE\u64CA\u67E5\u770B ${n(S)} \u7684\u5B8C\u6574\u5167\u5BB9"
                aria-label="\u958B\u555F ${n(i)} ${n(S)} \u7684\u5B8C\u6574\u689D\u6587">
                <span class="law-answer-article-no">${n(S)}</span>
                <span class="law-answer-article-text">${n(v)}</span>
              </button>`}).join("")}</div>`:"";return`<div class="law-answer-source">
        <div class="law-answer-source-head">
          ${g}
          <span class="law-answer-source-meta">\uFF08${n(o)}\uFF0C${c(l)} \u689D\uFF09</span>
          ${p}
        </div>
        ${y}
      </div>`}).join("")}</div>`}function Pr(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let r=s.get(String(a));return r?.law_key?It(a,{lawKey:r.law_key,sourceType:r.source_type||""}):`<span class="chip">${n(a)}</span>`}).join("")}</div>`}function Ma(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.law_sources)?e.law_sources:[],r=Array.isArray(e.matched_terms)?e.matched_terms:[],i=e.status||"preview",o=!!e.partial,l=!!e.streaming,p=!!e.show_sources||!o,g=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((I,X)=>jr(I,X)).join("")}</div>`:"",k=a.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${a.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${a.map((I,X)=>Rr(I,X)).join("")}</div>`:"",y=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((I,X)=>Er(I,X)).join("")}</div>`:"",h=p?g+k+y:"";!h&&!o&&(h=`<div class="answer-divider"></div>
      ${qe({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:i==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let S=Pr(r,a),v=e.test_run,w=String(e.llm_model||v?.primary_model||"").trim(),C=String(e.embedding_model||"").trim(),T=[w?`LLM\uFF1A${w}`:"",C?`Embedding\uFF1A${C}`:""].filter(Boolean).join(" \xB7 "),x=e.answer_source==="structured",O=String(e.law_answer||"").trim(),K=e.law_framework||null,ee=Array.isArray(K?.rows)?K.rows:[],M=Array.isArray(K?.sources)?K.sources:[],j=ee.length>0,D=!!O&&!x&&!j,q=l||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",d=j?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${n(K.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${ee.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${ee.map(I=>`<tr>
                    <td>${n(I.law_name||"\u2014")}</td>
                    <td class="cell-number">${n(I.article_no||"\u2014")}</td>
                    <td>${n(I.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${M.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${M.map(I=>{let X=String(I?.law_name||I||"").trim(),ne=I&&I.index!==null&&I.index!==void 0?` [${n(I.index)}]`:"";return It(X,{label:`${X}${ne}`})}).join("")}
              </div>`:""}
      </div>`:"",u=e.answer_source==="llm"&&w?`<span class="answer-model" title="${n(T)}">${f("brain",11)}${n(w)}</span>`:x?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${f("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",A=l?`${w||"LLM"} \xB7 \u751F\u6210\u4E2D`:u?w||"structured":"retrieval",H=v?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${le(v.status)}
          <span class="mono">${n(v.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(v.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(v.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${n(v.primary_model||"\u2014")}</span>
          <span>${Number(v.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",W=String(e.answer||"").trim()||(l?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":o?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),E=l?" data-partial-answer":"",J=l?" is-streaming":"";return`${d}
      ${D?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${o&&!p?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${a.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${Cr(a,O)}</div>
            </div>`:""}
      <div class="answer-block">
        ${D||j?`<div class="answer-block-head">
                <span>${n(q)}</span>
                <span>${n(A)}</span>
              </div>`:""}
        <p class="answer-text${J}"${E}>${n(W)}</p>
      </div>
      ${e.notice?`<div class="answer-notice">${n(e.notice)}</div>`:""}
      ${H}
      ${S}
      ${h}`}function Br(e,t,s=""){let a=t.status||"preview",r=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),p=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),g=t.answer_source==="structured",k=t.answer_source==="llm"&&o?`<span class="answer-model" title="${n(p)}">${f("brain",11)}${n(o)}</span>`:g?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${f("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${f("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${le(a,r)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${k}
      </div>
      ${s}
    </div>
    <div class="answer-body">${Ma(t)}</div>`}function Ir(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${f("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${te({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function Dr(e){return e.length?e.map((t,s)=>{let a=Array.isArray(t.payload?.citations)?t.payload.citations.length:0,r=Array.isArray(t.payload?.judgments)?t.payload.judgments.length:0,i=Array.isArray(t.payload?.law_sources)?t.payload.law_sources.length:0,o=a+r+i;return`<button class="history-item" type="button" data-history-index="${s}">
        <span class="history-question">${n(t.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
        <span class="history-meta">
          <span>${n(rt(t.created_at))}</span>
          <span>\xB7</span>
          <span>${o?`${o} \u7B46\u4F86\u6E90`:"\u7121\u5F15\u7528"}</span>
        </span>
      </button>`}).join(""):'<div class="history-empty">\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002</div>'}async function Or(e){let t=!1,s=[],a="",r=!1,i={embedding:[],llm:[]};e.innerHTML=`<section class="page rag-page">
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
        ${Sr.map(b=>`<button class="example-chip" type="button" data-question="${n(b)}">${n(b)}</button>`).join("")}
      </div>
    </header>

    <div class="rag-grid">
      <section class="card answer-card" id="answer-card" aria-live="polite">
        ${xr()}
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

        <section class="card">
          <div class="side-card-head">
            <span class="side-card-title">${f("history",14)}\u6700\u8FD1\u63D0\u554F</span>
            <button class="btn btn-ghost btn-sm" type="button" id="rag-clear-history">\u6E05\u9664</button>
          </div>
          <div class="history-list" id="rag-history">
            <div class="history-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>
          </div>
          <div class="side-card-foot" id="rag-storage-note">
            \u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002
          </div>
        </section>
      </aside>
    </div>
    <div id="rag-test-flow" class="rag-test-flow"></div>
    <dialog id="rag-judgment-dialog" class="judgment-dialog"></dialog>
    <dialog id="rag-law-dialog" class="judgment-dialog law-dialog"></dialog>
  </section>`;let o=e.querySelector("#rag-form"),l=e.querySelector("#rag-question"),p=e.querySelector("#rag-submit"),g=e.querySelector("#answer-card"),k=e.querySelector("#rag-stats"),y=e.querySelector("#rag-stats-mode"),h=e.querySelector("#rag-history"),S=e.querySelector("#rag-storage-note"),v=e.querySelector("#rag-clear-history"),w=e.querySelector("#rag-test-mode"),C=e.querySelector("#rag-test-flow"),T=e.querySelector("#rag-judgment-dialog"),x=e.querySelector("#rag-law-dialog"),O=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};T?.addEventListener("close",O),x?.addEventListener("close",O);let K=null,ee=null,M=()=>{l.style.height="auto",l.style.height=`${Math.min(l.scrollHeight,220)}px`},j=async()=>{try{if(s=await Lt({limit:6}),t)return;h.innerHTML=Dr(s),S.textContent=qt()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;h.innerHTML='<div class="history-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},D=async()=>{try{let b=await U.status();if(t)return;let P=b.data||{},z=new Map((b.services||[]).map(je=>[je.id,je])),de=z.get("qdrant"),ue=z.get("embedding"),ce=z.get("rag"),ve=z.get("llm"),Oe=Number(P.judgment_indexed_count||0),re=Number(P.judgment_count||0),ke=re?(Oe/re*100).toFixed(1):"0.0",Me=P.judgment_vector_points===null||P.judgment_vector_points===void 0?"\u2014":c(P.judgment_vector_points);k.innerHTML=`<div class="mini-stats">
          <div class="mini-stat">
            <div class="mini-stat-value">${c(re)}</div>
            <div class="mini-stat-label">\u5224\u6C7A</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-value">${c(Oe)}</div>
            <div class="mini-stat-label">\u5DF2\u7D22\u5F15</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-value">${ke}%</div>
            <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
          </div>
        </div>
        <div class="side-status-list">
          <div class="side-status-row">
            <span>${f("cube",13)}Qdrant \u5411\u91CF\u7D22\u5F15</span>
            ${le(de?.status,de?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${f("layers",13)}Embedding\uFF08${n(P.judgment_vector_model||"\u2014")}\uFF09</span>
            ${le(ue?.status,ue?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${f("brain",13)}RAG \u56DE\u7B54\u7BA1\u7DDA</span>
            ${le(ce?.status,ce?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${f("sparkles",13)}LLM \u6A21\u578B</span>
            ${le(ve?.status,ve?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
        </div>
        <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
          Collection\uFF1A${n(P.judgment_vector_collection||"\u2014")} \xB7
          ${Me} points \xB7 \u5269\u9918 ${c(P.judgment_index_remaining)} \u7B46\u5F85\u7D22\u5F15
        </div>`;let Te=e.querySelector("#rag-mode-notice");Te&&(ce?.status==="operational"?Te.innerHTML=te({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${c(Oe)} / ${c(re)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`}):ce?.status==="degraded"?Te.innerHTML=te({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:n(ce.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002")}):Te.innerHTML=te({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:n(ce?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002")})),y.className=`badge ${ce?.status==="operational"?"badge-ok":ce?.status==="not_configured"?"badge-neutral":"badge-warn"} badge-mono`,y.textContent=ce?.status==="operational"?"RAG \u5C31\u7DD2":ce?.status==="not_configured"?"\u672A\u8A2D\u5B9A":"\u964D\u7D1A"}catch{if(t)return;k.innerHTML='<p class="muted" style="font-size:11px">\u76EE\u524D\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002</p>',y.className="badge badge-danger badge-mono",y.textContent="\u96E2\u7DDA"}},q=()=>{if(!w)return;if(!r){w.innerHTML="";return}let b=Array.isArray(i.embedding)?i.embedding.length:0,P=Array.isArray(i.llm)?i.llm.length:0;w.innerHTML=te({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${b} \u500B embedding \u8207 ${P} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},d=async()=>{try{let b=await U.testMode();if(t)return;r=!!b.enabled,i=b.models||{embedding:[],llm:[]},q()}catch{if(t)return;r=!1,q()}},u=b=>{r=!!b.detail?.enabled,i=b.detail?.models||{embedding:[],llm:[]},q()};window.addEventListener("judgment:test-mode",u);let A=b=>{C&&(ee=b||null,C.innerHTML=b?lt(b,[],"",{showHistory:!1}):"")},H=()=>{K&&(window.clearTimeout(K),K=null)},G=()=>{H();let b=async()=>{if(!t){try{let P=await U.testRunCurrent();if(t)return;let z=P.run;z&&z.status==="running"&&A(z)}catch{}t||(K=window.setTimeout(b,1500))}};b()},W=async b=>{if(!b){A(null);return}try{let P=await U.testRun(b);if(t)return;A(P.run||null)}catch{t||B("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},E=async()=>{if(r)try{let b=await U.testRunCurrent();if(t)return;b.run?.status==="running"&&(A(b.run),G())}catch{}},J=0,I=(b,P)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${n(b)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${f("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${P}</div>`,X=b=>{let P=(Array.isArray(b.matched_laws)?b.matched_laws:[]).map(ce=>It(ce)).join(""),z=[b.court,b.jdate,b.title?`\u6848\u7531\uFF1A${b.title}`:"",b.full_text_length?`${c(b.full_text_length)} \u5B57`:"",b.citation_count?`\u5F15\u7528 ${c(b.citation_count)} \u7B46`:""].filter(Boolean).map(ce=>`<span>${n(ce)}</span>`).join(""),de=b.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${n(String(b.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",ue=b.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(b.pdf_url)}" target="_blank" rel="noopener noreferrer">${f("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return I(b.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${n(b.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${z}
      </div>
      ${P?`<div class="chips" style="margin:8px 0 10px">${P}</div>`:""}
      <div class="judgment-dialog-source">${de}</div>
      <pre class="judgment-dialog-text">${n(b.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${ue}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},ne=async b=>{if(!T||!b)return;let P=++J;T.open||T.showModal(),O(),T.innerHTML=I("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${n(b)}\u2026</span>
      </div>`);try{let z=await U.judgmentDetail(b,"parquet");if(t||P!==J)return;T.innerHTML=X(z)}catch(z){if(t||P!==J)return;T.innerHTML=I("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(z.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},be=0,he=(b,P)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${n(b)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${f("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${P}</div>`,ge=(b,P="")=>{let z=String(b.selected_article_no||P||"").trim(),de=!!z,ue=Array.isArray(b.articles)?b.articles:[],ce=ue.map(ye=>{let Ve=String(ye.article_content||"").trim();return Ve?ye.article_type==="C"?`<div class="law-chapter">${n(Ve)}</div>`:`<article class="law-article" data-article-no="${n(La(ye.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${n(ye.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${n(Ve)}</div>
        </article>`:""}).join(""),ve=(Array.isArray(b.warnings)?b.warnings:[]).map(ye=>n(ye)).join("<br />"),Oe=b.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",re=b.meta?.articles_source,ke=re==="parquet"?"Parquet \u689D\u6587":re==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",Me=b.meta?.snapshot||"",Te=[b.law_level,b.law_category,b.article_count?`${c(b.article_count)} \u689D`:"",b.law_modified_date?`\u7570\u52D5 ${Ce(b.law_modified_date)}`:""].filter(Boolean).map(ye=>`<span>${n(ye)}</span>`).join(""),je=b.law_url?`<a class="btn btn-secondary btn-sm" href="${n(b.law_url)}" target="_blank" rel="noopener noreferrer">${f("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",Re=!de&&b.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${n(b.law_histories)}</div>
        </details>`:"",$t=de?`<span class="badge badge-mono">${n(z)}</span>`:"",yt=!de&&ue.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",Wt=de?`${b.law_name||b.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${z}`:b.law_name||b.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return he(Wt,`<div class="judgment-dialog-meta">
        <span class="badge ${b.source_type==="order"?"badge-warn":"badge-info"}">${n(Oe)}</span>
        ${$t}
        ${Te}
      </div>
      <div class="judgment-dialog-source">${n([ke,Me].filter(Boolean).join(" \xB7 "))}</div>
      ${ve?`<div class="law-dialog-warning">${ve}</div>`:""}
      ${Re}
      ${yt}
      <div class="law-dialog-articles">${ce||`<div class="report-empty-inline">${de?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${je}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},De=(b,P)=>{let z=b?.querySelector(`#${P}`),de=La(z?.value||"");if(!de){B("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),z?.focus();return}let ue=[...b?.querySelectorAll("[data-article-no]")||[]].find(ce=>ce.dataset.articleNo===de);if(!ue){B(`\u627E\u4E0D\u5230\u7B2C ${de} \u689D\u3002`,"warn");return}ue.scrollIntoView({behavior:"instant",block:"center"}),ue.classList.add("is-jump-target"),window.setTimeout(()=>ue.classList.remove("is-jump-target"),2400)},Q=async(b,P="",z="")=>{if(!x||!b)return;let de=++be;x.open||x.showModal(),O(),x.innerHTML=he(z?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${n([b,z].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let ue=await U.lawDetail(b,P,"",z);if(t||de!==be)return;x.innerHTML=ge(ue,z)}catch(ue){if(t||de!==be)return;x.innerHTML=he("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(ue.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};x?.addEventListener("click",b=>{let P=b.target.closest('[data-action="jump-law-article"]');if(P){De(x,P.dataset.jumpInput||"rag-law-article-jump");return}if(b.target.closest('[data-action="close-law-source"]')){x.close();return}let z=x.getBoundingClientRect();(b.clientX<z.left||b.clientX>z.right||b.clientY<z.top||b.clientY>z.bottom)&&x.close()}),x?.addEventListener("keydown",b=>{!b.target.matches(".law-jump-input")||b.key!=="Enter"||(b.preventDefault(),De(x,b.target.id))}),T?.addEventListener("click",b=>{let P=b.target.closest('[data-action="open-law-source"]');if(P){Q(P.dataset.lawKey||"",P.dataset.sourceType||"",P.dataset.articleNo||"");return}if(b.target.closest('[data-action="close-parquet-judgment"]')){T.close();return}let z=T.getBoundingClientRect();(b.clientX<z.left||b.clientX>z.right||b.clientY<z.top||b.clientY>z.bottom)&&T.close()}),g.addEventListener("click",b=>{let P=b.target.closest(".rag-process-toggle");if(P){let de=P.closest(".rag-process"),ue=P.getAttribute("aria-expanded")==="true";ws(de,!ue);return}let z=b.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(z){if(z.dataset.action==="open-law-source"){Q(z.dataset.lawKey||"",z.dataset.sourceType||"",z.dataset.articleNo||"");return}ne(z.dataset.jid||"")}}),g.addEventListener("keydown",b=>{if(b.key!=="Enter"&&b.key!==" ")return;let P=b.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!P||P.closest("a, button"))){if(b.preventDefault(),P.dataset.action==="open-law-source"){Q(P.dataset.lawKey||"",P.dataset.sourceType||"",P.dataset.articleNo||"");return}ne(P.dataset.jid||"")}});let se=async b=>{let P=b.trim();if(!P){B("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),l.focus();return}a=P,l.value=P,M(),g.innerHTML=Tr(P,r);let z=r?null:Mr(g);r?(A(null),G()):(H(),A(null)),ae(p,!0,"\u6AA2\u7D22\u4E2D\u2026");let de=null,ue="",ce=re=>{if(t||!re?.partial)return;let ke=g.querySelector(".answer-body");if(!ke)return;de=re,ue=String(re.answer||""),ke.innerHTML=Ma(re),z?.collapse?.();let Me=g.querySelector(".answer-head-title");Me&&(Me.textContent=re.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},ve=re=>{if(t||!re||!de?.streaming)return;ue+=re;let ke=g.querySelector("[data-partial-answer]");ke&&(ke.textContent=ue)},Oe=()=>{if(t||!de?.streaming)return;ue="";let re=g.querySelector("[data-partial-answer]");re&&(re.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")};try{let re=r?await U.rag(P,{testMode:r}):await U.ragStream(P,{onStep:Re=>z?.step(Re),onPartial:ce,onToken:ve,onTokenReset:Oe});if(t)return;H();let ke=z?.finish(!0)||"";g.innerHTML=Br(P,re,ke),re.test_run?.run_id?await W(re.test_run.run_id):A(null);let Me=Array.isArray(re.citations)?re.citations:[],Te=Array.isArray(re.judgments)?re.judgments:[],je=Me.length+Te.length;await At({kind:"rag",title:P,detail:`${re.status||"preview"} \xB7 ${je} \u7B46\u4F86\u6E90`,payload:{question:P,status:re.status,citations:Me.map(Re=>Re.law_name),judgments:Te.map(Re=>Re.jid)}}),await j()}catch(re){if(H(),t)return;let ke=z?.finish(!1)||"";g.innerHTML=Ir(re,ke),B(re.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{H(),t||ae(p,!1)}};return o.addEventListener("submit",b=>{b.preventDefault(),se(l.value)}),l.addEventListener("input",M),l.addEventListener("keydown",b=>{b.key==="Enter"&&!b.shiftKey&&!b.isComposing&&(b.preventDefault(),o.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",b=>{let P=b.target.closest("[data-question]");P&&(l.value=P.dataset.question,M(),o.requestSubmit())}),h.addEventListener("click",b=>{let P=b.target.closest("[data-history-index]");if(!P)return;let z=s[Number(P.dataset.historyIndex)];z&&(l.value=z.title,M(),se(z.title))}),v.addEventListener("click",async()=>{if(!s.length){B("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await Js(),await j(),B("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),M(),await Promise.allSettled([D(),j(),d()]),await E(),()=>{t=!0,H(),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",u),a&&g.setAttribute("data-last-question",a)}}var ks={};We(ks,{render:()=>mi});var Fr=2e3,Hr={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"}},Ta={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},ja={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Ba={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"},Dt={judgment:"#a78bfa",law:"#22d3ee",order:"#f472b6",system:"#94a3b8"},Ur={extract:"file",raw_parquet:"cube",filter:"filter",postgres:"database",qdrant:"brain",download:"download",parse:"sliders"},Jr={raw_parquet:"\u539F\u59CB Parquet",postgres:"PostgreSQL"};function ht(e){return Hr[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function xe(e,t){let s=ht(e);return`<span class="badge ${Ta[s.tone]||Ta.idle}"><span class="status-dot ${ja[s.tone]||ja.idle}"></span>${n(t||s.label)}</span>`}function at(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function Ea(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":c(e)}function ct(e){return e&&e.color?String(e.color):"var(--accent)"}function Ot(e,t=""){let s=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),a=e.status==="running"&&s===null,r=a?' aria-valuetext="\u9032\u5EA6\u672A\u77E5"':` aria-valuenow="${s??0}"`;return`<div class="processing-bar${a?" is-indeterminate":""}${t?` ${t}`:""}" role="progressbar" aria-valuemin="0" aria-valuemax="100"${r}>
    <span class="processing-bar-fill" style="width:${s??0}%;background:${n(ct(e))}"></span>
  </div>`}function Qr(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${Z(s)} / ${Z(a)}`:Z(s):a?`${c(s)} / ${c(a)} ${t}`:`${c(s)} ${t}`}function Gr(e){let t=[`<span>${n(Qr(e))}</span>`];return e.percent===null||e.percent===void 0?e.status==="running"&&t.push('<span class="mono">\u9032\u5EA6\u672A\u77E5</span>'):t.push(`<span class="mono">${at(e.percent)}</span>`),e.duration_ms&&t.push(`<span class="mono">${V(e.duration_ms)}</span>`),t.join("")}function zr(e){let s=(Array.isArray(e.stats)?e.stats:[]).map(r=>`<span class="processing-stage-stat"><span>${n(r.label)}</span><strong>${n(r.value)}</strong></span>`),a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&s.push(`<span class="processing-stage-stat"><span>\u7D22\u5F15\u8986\u84CB</span><strong>${c(a.indexed)} / ${c(a.total)}</strong></span>`),s.length?`<div class="processing-stage-stats">${s.join("")}</div>`:""}function Vr(e,{compact:t=!1,step:s=null}={}){let a=ht(e.status),r=e.status==="running";return`<div class="processing-stage${t?" is-compact":""} is-${a.tone}${r?" is-live":""}" style="--stage-color:${n(ct(e))}"${r?' aria-current="step"':""}>
    <div class="processing-stage-head">
      ${s===null?"":`<span class="processing-stage-step">${String(s).padStart(2,"0")}</span>`}
      <span class="processing-stage-swatch" style="background:${n(ct(e))}"></span>
      <span class="processing-stage-label">${n(e.label||e.key)}</span>
      ${xe(e.status)}
    </div>
    ${Ot(e)}
    <div class="processing-stage-meta">${Gr(e)}</div>
    ${e.message?`<div class="processing-stage-message" title="${n(e.message)}">${n(e.message)}</div>`:""}
    ${t?"":zr(e)}
  </div>`}function Ia(e){let t=ht(e);return`<span class="flow-status is-${t.tone}"><span class="flow-status-dot"></span>${n(t.label)}</span>`}function Ra(e,t){return t==null||t===""?"\u2014":e.unit==="bytes"?Z(t):c(t)}function Wr(e){let t=[{label:"\u76EE\u524D",value:Ra(e,e.current)},{label:"\u7E3D\u91CF",value:Ra(e,e.total)},{label:"\u767E\u5206\u6BD4",value:e.percent===null||e.percent===void 0?e.status==="running"?"\u8A08\u7B97\u4E2D":"\u2014":at(e.percent)},{label:"\u8017\u6642",value:e.duration_ms?V(e.duration_ms):"\u2014"}],s=Array.isArray(e.stats)?e.stats:[];for(let r of s){if(t.length>=6)break;r&&r.label&&r.value&&t.push({label:String(r.label),value:String(r.value)})}let a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&!t.some(r=>r.label==="\u7D22\u5F15\u8986\u84CB")&&t.push({label:"\u7D22\u5F15\u8986\u84CB",value:`${c(a.indexed)} / ${c(a.total)}`}),t}function Kr(e,t){let s=ht(e.status),a=e.status==="running",r=Wr(e);return`<article class="flow-node is-${s.tone}${a?" is-live":""}" style="--stage-color:${n(ct(e))}"${a?' aria-current="step"':""}>
    <div class="flow-node-head">
      <span class="flow-node-icon">${f(Ur[e.key]||"cube",14)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">STEP ${String(t+1).padStart(2,"0")}</span>
        <strong>${n(Jr[e.key]||e.label||e.key)}</strong>
      </div>
      ${Ia(e.status)}
    </div>
    <div class="flow-node-body">
      ${Ot(e,"flow-progress")}
      <div class="flow-node-props">${r.map(i=>`<div class="flow-prop"><span>${n(i.label)}</span><strong>${n(i.value)}</strong></div>`).join("")}</div>
      ${e.message?`<div class="flow-node-note" title="${n(e.message)}">${n(e.message)}</div>`:""}
    </div>
  </article>`}function Yr(e,t,s,a){let r=ct(e),i=a||"#8b5cf6",o=e.status==="running",l=`${s}-${t}`,p=`flow-gradient-${l}`,g=`flow-marker-${l}`,k=t%2===0?"M2 60 C8 42 16 78 22 60":"M2 60 C8 78 16 42 22 60";return`<div class="flow-link${o?" is-live":""}" style="color:${n(r)}" aria-hidden="true">
    <svg viewBox="0 0 28 120" width="28" height="120" fill="none">
      <defs>
        <linearGradient id="${p}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${n(i)}"/>
          <stop offset="1" stop-color="${n(r)}"/>
        </linearGradient>
        <marker id="${g}" viewBox="0 0 8 8" refX="6.2" refY="4" markerWidth="4.6" markerHeight="4.6" orient="auto">
          <path d="M0 0 8 4 0 8Z" fill="${n(r)}"/>
        </marker>
      </defs>
      <path class="flow-link-line" d="${k}" stroke="url(#${p})" stroke-width="1.7" stroke-linecap="round" marker-end="url(#${g})"/>
      <circle class="flow-link-port" cx="2" cy="60" r="3.6" stroke="${n(i)}" stroke-width="1.5"/>
      <circle class="flow-link-port" cx="26" cy="60" r="3.6" stroke="${n(r)}" stroke-width="1.5"/>
    </svg>
  </div>`}function Da(e){if(!e)return"";let t=[];return e.started_at&&t.push(`\u958B\u59CB ${oe(e.started_at)}`),e.duration_ms&&t.push(`\u8017\u6642 ${V(e.duration_ms)}`),e.pid&&t.push(`PID ${e.pid}`),t.join(" \xB7 ")}function Xr(e,{active:t,focus:s,status:a,runLine:r,runningStage:i}){let o=e.label||Ba[e.key]||e.key;return`<div class="flow-source${t?" is-live":""}" style="--branch-accent:${Dt[e.key]||Dt.system}">
    <div class="flow-source-head">
      <span class="flow-source-icon">${f(e.icon||"database",15)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">SOURCE</span>
        <strong>${n(o)}</strong>
      </div>
      ${Ia(a)}
    </div>
    <div class="flow-source-body">
      <p class="flow-source-desc">${n(e.description||"")}</p>
      <div class="flow-source-meta">${r}</div>
      ${i?`<div class="flow-source-current"><span class="flow-current-dot"></span>\u76EE\u524D\u968E\u6BB5\uFF1A<strong>${n(i.label||i.key)}</strong></div>`:""}
      ${s&&s.message?`<div class="flow-source-note" title="${n(s.message)}">${n(s.message)}</div>`:""}
    </div>
  </div>`}function Zr(e){let t=e.active_run,s=t||e.focus_run||e.last_run,a=t?"running":s?s.status:"idle",r=s?n(Da(s)||rt(s.started_at||s.finished_at)):"\u5C1A\u7121\u57F7\u884C\u7D00\u9304",i=Array.isArray(e.stages)?e.stages:[],o=i.find(y=>y.status==="running"),l=Dt[e.key]||Dt.system,p=String(e.key||"branch").replace(/[^a-zA-Z0-9_-]/g,""),g=Xr(e,{active:t,focus:s,status:a,runLine:r,runningStage:o}),k=i.length?i.map((y,h)=>{let S=h?ct(i[h-1]):l;return`${Yr(y,h,p,S)}${Kr(y,h)}`}).join(""):'<div class="flow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u968E\u6BB5\u3002</div>';return`<article class="flow-lane" style="--branch-accent:${l}"><div class="flow-row">${g}${k}</div></article>`}function ei(e){return`<div class="flow-canvas-open">
    <div class="processing-branches">${(Array.isArray(e.branches)?e.branches:[]).map(Zr).join("")}</div>
  </div>`}function st(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${n(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function ti(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},r=e.raw_backups||{},i=r.totals||{},o=e.state||{},l=e.capabilities||{},p=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",g=t.status==="operational",k=s.status==="operational",y=a.available!==!1,h=r.available!==!1,S=k?`${c(s.indexed)} / ${c(s.total)}`:xe(s.status||"unavailable"),v=k?`${at(s.percent)} \xB7 \u5C1A\u9918 ${c(s.remaining)} \u7B46`:n(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),w=y?`${c(a.unprocessed)} / ${c(a.total)}`:xe("unavailable"),C=y?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${Z(a.unprocessed_bytes)} \u5F85\u8655\u7406`:n(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${st("\u8655\u7406\u72C0\u614B",xe(e.status||"unknown"),`${n(p)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${st("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",n(w),C)}
    ${st("\u539F\u59CB Parquet \u5099\u4EFD",h?`${c(r.count)} \u6A94`:xe("unavailable"),h?`\u5171 ${c(i.row_count)} \u7B46 \xB7 ${Z(i.compressed_bytes)}`:n(r.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB Parquet \u5099\u4EFD\u3002"))}
    ${st("PostgreSQL \u5224\u6C7A",g?c(t.judgment_count):xe("unavailable"),g?`\u6CD5\u898F ${Ea(t.law_count)} \xB7 \u547D\u4EE4 ${Ea(t.order_count)}`:n(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${st("Qdrant \u7D22\u5F15",S,v)}
    ${st("\u72C0\u614B\u6A94",xe(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${n(oe(o.updated_at))}`:n(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${st("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?n(l.start_blocked_reason):`\u672A\u8655\u7406 ${c(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${c(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${c(l.external_processes)} \u500B`:""}`)}
  </div>`}function si(e){if(e.available===!1)return te({tone:"warn",title:"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304",text:n(e.error||"\u7121\u6CD5\u6383\u63CF .rar \u6A94\u6848\u3002")});let t=Number(e.total)||0,s=Number(e.processed)||0,a=Number(e.unprocessed)||0,r=t?100*s/t:null;return`<div class="processing-archive-summary">
    <div class="processing-archive-summary-head">
      <span class="mono">${n(e.data_dir||"")}</span>
      <span>${c(s)} / ${c(t)} \u5DF2\u8655\u7406 \xB7 ${c(a)} \u5F85\u8655\u7406 \xB7 ${Z(e.unprocessed_bytes)} \u5F85\u8655\u7406</span>
    </div>
    ${Ot({percent:r,status:a?"pending":"success",color:"var(--success)"},"processing-bar-lg")}
    <div class="processing-archive-summary-meta">
      <span>\u58D3\u7E2E\u6A94\u532F\u5165\u8986\u84CB ${at(r)}</span>
      <span>\u5168\u90E8 ${Z(e.total_bytes)}</span>
    </div>
  </div>`}function ai(e){let t=e.stages||{},a=["extract","filter","postgres"].map(r=>t[r]).filter(Boolean).map(r=>Vr(r,{compact:!0}));return a.length?`<div class="processing-archive-stages">${a.join("")}</div>`:""}function ni(e){let t=e.status||"pending",s=t==="running",a=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),r=s&&a===null,i=[];return e.message&&i.push(e.message),e.error&&i.push(e.error),(e.scanned||e.matched||e.stored)&&i.push(`\u6383\u63CF ${c(e.scanned)} \xB7 \u547D\u4E2D ${c(e.matched)} \xB7 \u5BEB\u5165 ${c(e.stored)}`),`<div class="processing-archive is-${ht(t).tone}">
    <div class="processing-archive-head">
      <span class="processing-archive-name mono">${n(e.name)}</span>
      <div class="processing-archive-bar-wrap">
        ${Ot({percent:a,status:t,color:s?"var(--accent)":"var(--success)"})}
      </div>
      <span class="processing-archive-percent mono">${r?"\u9032\u884C\u4E2D":at(a)}</span>
      ${xe(t)}
      <span class="processing-archive-size faint">${Z(e.size_bytes)}</span>
    </div>
    ${ai(e)}
    ${i.length?`<div class="processing-archive-note">${i.map(o=>`<span>${n(o)}</span>`).join("")}</div>`:""}
  </div>`}function ri(e){let t=e.archives||{},s=e.local_archives||{},a=Array.isArray(t.items)?t.items:[],r=t.run,i=`<div class="report-section-head">
    <div>
      <div class="report-kicker">ARCHIVE PIPELINE</div>
      <h2 class="report-section-title">\u5224\u6C7A\u58D3\u7E2E\u6A94</h2>
      <p class="processing-section-sub">\u6BCF\u500B\u58D3\u7E2E\u6A94\u540D\u7A31\u5F8C\u65B9\u5373\u6642\u986F\u793A\u8655\u7406\u9032\u5EA6\uFF1B\u672A\u53D6\u5F97\u53EF\u8A08\u7B97\u7684\u7E3D\u91CF\u6642\u6A19\u793A\u300C\u9032\u5EA6\u672A\u77E5\u300D\uFF0C\u4E0D\u4EE5\u63A8\u6E2C\u6578\u503C\u4EE3\u66FF\u3002</p>
    </div>
  </div>`,o=t.source==="run"?`${xe(r?r.status:"idle")} <span>\u76EE\u524D\u986F\u793A ${r?n(r.title||"\u5224\u6C7A\u532F\u5165"):"\u6700\u8FD1\u4E00\u6B21\u532F\u5165"} \u7684\u9010\u6A94\u9032\u5EA6${r&&r.started_at?` \xB7 ${n(Da(r))}`:""}</span>`:t.external?`${xe("running")} <span>${n(t.note||"\u5916\u90E8\u532F\u5165\u7A0B\u5E8F\u672A\u5BEB\u5165\u9010\u6A94\u72C0\u614B\uFF1B\u4EE5\u4E0B\u70BA PostgreSQL \u8986\u84CB\u7387\u3002")}</span>`:'<span class="faint">\u76EE\u524D\u6C92\u6709\u53EF\u8B80\u53D6\u7684\u532F\u5165 run \u72C0\u614B\uFF1B\u4EE5\u4E0B\u4EE5 PostgreSQL \u7684 source_archive \u5224\u5B9A\u662F\u5426\u5DF2\u8655\u7406\u3002</span>';return`<section class="report-card processing-card">
    <div class="report-head">${i}</div>
    <div class="report-section">
      ${si(s)}
      <div class="processing-archive-run">${o}</div>
      ${a.length?`<div class="processing-archive-list">${a.map(ni).join("")}</div>`:`<div class="processing-empty">\u627E\u4E0D\u5230 .rar \u58D3\u7E2E\u6A94\uFF1B\u8ACB\u78BA\u8A8D ${n(s.data_dir||"\u5224\u6C7A\u8CC7\u6599\u76EE\u9304")}\u3002</div>`}
    </div>
  </section>`}function ii(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let r=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${n(o.color||"var(--accent)")}" title="${n(`${o.label} ${V(o.duration_ms)} (${at(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${n(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${n(o.label)}</span>
        <span class="mono">${V(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${at(o.percent)}</span>
        ${xe(o.status)}
      </div>`).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section">
      <div class="processing-timeline-label">
        <span>${n(t.label||"\u968E\u6BB5\u8017\u6642")}</span>
        <span class="mono">\u7E3D\u8A08 ${V(t.total_ms)}</span>
      </div>
      <div class="processing-stack" role="img" aria-label="\u968E\u6BB5\u8017\u6642\u6BD4\u4F8B">${r}</div>
      <div class="processing-legend">${i}</div>
    </div>
  </section>`}function oi(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let r=t.map(i=>{let o=s.get(i.branch)||Ba[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${n(o)}</span>
          <strong>${n(i.title||"\u8655\u7406")}</strong>
          ${xe(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${n(oe(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?V(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${n(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${r}</div></div>
  </section>`}function li(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>te({tone:s.tone||"info",title:s.title,text:n(s.message||"")})).join("")}</div>`:""}function Na(e){return`${li(e)}
    ${ti(e)}
    <section class="processing-flow-section">
      <div class="processing-section-head">
        <div>
          <div class="report-kicker">PIPELINE CANVAS</div>
          <h2 class="report-section-title">\u8655\u7406\u6D41\u7A0B</h2>
          <p class="processing-section-sub">\u5224\u6C7A\u3001\u6CD5\u898F\u3001\u547D\u4EE4\u4E09\u689D\u6D41\u7A0B\u5373\u6642\u53CD\u6620\u76EE\u524D\u57F7\u884C\u968E\u6BB5\uFF1B\u66F2\u7DDA\u7531\u4F86\u6E90\u7BC0\u9EDE\u9023\u5230\u5404\u968E\u6BB5\uFF0C\u767C\u5149\u7BC0\u9EDE\u8207\u6D41\u52D5\u66F2\u7DDA\u8868\u793A\u76EE\u524D\u57F7\u884C\u4F4D\u7F6E\u3002</p>
        </div>
      </div>
      ${ei(e)}
    </section>
    ${ri(e)}
    ${ii(e)}
    ${oi(e)}`}function ci(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${te({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:n(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${n(oe(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${f("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}var Oa={overview:"activity",full_update:"download",law_download:"layers",order_download:"file",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function di(e){let t=Array.isArray(e.workflows)?e.workflows:[];return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...t.map(s=>{let a=s.active_run||null,r=a||s.last_run||null;return{...s,activeRun:a,lastRun:r,status:r?.status||"idle"}})]}function Ca(e,t){return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${di(e).map(a=>{let r=a.id===t,i=Oa[a.id]||"terminal";return`<button class="status-tab${r?" is-active":""}" type="button"
            data-processing-workflow="${n(a.id)}"
            ${r?'aria-current="page"':""}>
            <span class="status-tab-icon">${f(i,15)}</span>
            <span class="status-tab-copy">
              <strong>${n(a.label)}</strong>
              <small>${n(a.description||"")}</small>
            </span>
            ${xe(a.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${n(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function ui(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${xe(e.status)}
      <span class="mono">${n(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${n(oe(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${V(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${n(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${n(t.log_path)}</strong>`:""}
    </div>
  </div>`}function pi(e){let t=e.active_run||null,s=t||e.last_run||null,a=!!t,r=!!e.can_run&&!a,i=e.id==="full_update",o=Array.isArray(e.command)?e.command.join(" "):"";return`<div class="processing-workflow-panel">
    ${te({tone:"info",title:e.label,text:e.description||""})}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${f(Oa[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
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
        ${xe(s?.status||"idle")}
      </div>
      ${ui(s)}
    </section>
  </div>`}function Pa(e,t){if(t==="overview")return Na(e);let a=(Array.isArray(e.workflows)?e.workflows:[]).find(r=>r.id===t);return a?pi(a):Na(e)}async function mi(e){e.innerHTML=`<section class="page processing-page">
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
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-workflows"),r=e.querySelector("#processing-update"),i=e.querySelector("#processing-stop"),o=e.querySelector("#processing-refresh"),l=e.querySelector("#processing-index-toggle"),p=!1,g=!1,k=!1,y=null,h="",S="",v="overview",w=null,C=D=>{let q=D.capabilities||{},d=!!(l&&l.checked),u=d?q.can_start_update_with_index!==!1:q.can_start_update!==!1,A=d&&q.index_blocked_reason||q.start_blocked_reason;if(!k){r.disabled=!u,r.title=A||"\u6AA2\u67E5\u7DDA\u4E0A\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0C\u4E26\u8655\u7406\u672A\u532F\u5165\u7684\u5224\u6C7A\u58D3\u7E2E\u6A94\u3002";let H=r.querySelector("[data-update-label]");H&&(H.textContent=u?"\u8CC7\u6599\u66F4\u65B0":q.active_update_id?"\u66F4\u65B0\u57F7\u884C\u4E2D":"\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D"),i.hidden=!q.can_stop_update,l&&(l.disabled=q.can_start_update===!1)}},T=async({silent:D=!1}={})=>{if(!(p||g)){g=!0,D||ae(o,!0,"\u66F4\u65B0\u4E2D\u2026");try{let q=await U.processing();if(p)return;y=q;let d=Ca(q,v);d!==S&&(a.innerHTML=d,S=d);let u=Pa(q,v);u!==h&&(s.innerHTML=u,h=u);let A=s.querySelector("[data-processing-updated-at]");if(A){let H=oe(q.generated_at);A.textContent!==H&&(A.textContent=H)}C(q)}catch(q){if(p)return;let d=ci(q.message,y);d!==h&&(s.innerHTML=d,h=d),D||B(q.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{g=!1,D||ae(o,!1)}}},x=async D=>{if(!k){k=!0,ae(D,!0,"\u555F\u52D5\u4E2D\u2026");try{let q=!!(l&&l.checked),d=await U.startProcessingUpdate(q);B(`\u5DF2\u555F\u52D5\u8CC7\u6599\u66F4\u65B0${q?"\uFF0C\u5B8C\u6210\u5F8C\u63A5\u7E8C Qdrant \u7D22\u5F15":""}\u3002`,"ok",6e3),d&&d.run_id&&console.info("processing update started",d),await T({silent:!0})}catch(q){B(q.message||"\u7121\u6CD5\u555F\u52D5\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{k=!1,ae(D,!1),y&&C(y)}}},O=async(D,q)=>{if(!k){k=!0,ae(D,!0,"\u555F\u52D5\u4E2D\u2026");try{let d=await U.startProcessingWorkflow(q);B("\u5DF2\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","ok",6e3),d&&d.run_id&&console.info("processing workflow started",d),await T({silent:!0})}catch(d){B(d.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{k=!1,ae(D,!1),y&&C(y)}}},K=async D=>{if(!k){k=!0,ae(D,!0,"\u505C\u6B62\u4E2D\u2026");try{let q=await U.stopProcessingUpdate();B(q.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3),await T({silent:!0})}catch(q){B(q.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{k=!1,ae(D,!1),y&&C(y)}}},ee=D=>{let q=D.target.closest("[data-processing-action]");if(!q||q.disabled)return;let d=q.dataset.processingAction;if(d==="refresh")T({silent:!1});else if(d==="update")x(q);else if(d==="run-workflow"){let u=q.dataset.workflowId||"";u==="full_update"?x(q):O(q,u)}else d==="stop"&&K(q)},M=D=>{D.target===l&&y&&C(y)},j=D=>{let q=D.target.closest("[data-processing-workflow]");if(q&&(v=q.dataset.processingWorkflow||"overview",y)){let d=Ca(y,v);a.innerHTML=d,S=d;let u=Pa(y,v);s.innerHTML=u,h=u}};return t.addEventListener("click",ee),a.addEventListener("click",j),l&&l.addEventListener("change",M),await T({silent:!1}),w=window.setInterval(()=>{document.hidden||T({silent:!0})},Fr),()=>{p=!0,w!==null&&window.clearInterval(w),t.removeEventListener("click",ee),a.removeEventListener("click",j),l&&l.removeEventListener("change",M)}}var As={};We(As,{render:()=>Ri});var Ha={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u9000\u5F79",badge:"badge-neutral"}},Ht={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},xs={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},Fa={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function Ua(e){let t=Ha[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${n(t.label)}</span>`}function qs(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function gi(e){return qs(e).map(t=>{let[s,a]=t.split("|").map(r=>r.trim());return{law_name:s||"",source_type:a||""}})}function vi(e){return qs(e).map(t=>{let[s,a]=t.split("|").map(r=>r.trim());return{law_name:s||"",article_no:a||""}})}function fi(e){return qs(e).map(t=>({jid:t.trim()}))}function bi(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function hi(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function $i(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function yi(e){return(e?.tags||[]).join(", ")}function Ft(e){return`<div class="qb-empty">${f("info",18)}<span>${n(e)}</span></div>`}function Ja(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),r=[...t.map(i=>`<span class="chip">${n(i)}</span>`),...s.map(i=>`<span class="chip">${n(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${n(i)}</span>`)];return r.length?`<div class="chips qb-labels">${r.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function wi(e){let t=!!e;return`<section class="report-card qb-card">
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
          <select class="select" name="question_type">${Object.entries(Ht).map(([s,a])=>`<option value="${s}" ${e?.question_type===s?"selected":""}>${a}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u96E3\u5EA6</span>
          <select class="select" name="difficulty">${Object.entries(xs).map(([s,a])=>`<option value="${s}" ${e?.difficulty===s?"selected":""}>${a}</option>`).join("")}</select>
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
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${n(bi(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${n(hi(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${n($i(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${n(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${n(yi(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
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
  </section>`}function Ss(e,{reviewMode:t=!1}={}){return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${n(e.question)}</strong>
        <span class="qb-meta">
          ${n(Ht[e.question_type]||e.question_type)}
          \xB7 ${n(xs[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${Ua(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${n(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${Ja(e)}
    <div class="qb-item-foot">
      <span>\u66F4\u65B0 ${n(oe(e.updated_at))}</span>
      ${e.reviewed_by?`<span>\u5BE9\u6838 ${n(e.reviewed_by)}</span>`:""}
      ${e.review_comment?`<span class="qb-comment">${n(e.review_comment)}</span>`:""}
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${f("edit",13)}<span>\u7DE8\u8F2F</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${e.id}">${f("shield",13)}<span>${t?"\u6279\u6CE8":"\u9A57\u6536"}</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${f("trash",13)}<span>\u522A\u9664</span></button>
      </div>
    </div>
  </article>`}function _i(e){return`<section class="report-card qb-card">
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
        ${Object.entries(Ha).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(Ht).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(xs).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <input class="input" name="tag" placeholder="\u6A19\u7C64" value="${n(e.filters.tag)}" />
      <button class="btn btn-primary btn-sm" type="submit">${f("search",13)}<span>\u7BE9\u9078</span></button>
    </form>
    <div class="qb-list">
      ${e.items.length?e.items.map(t=>Ss(t)).join(""):Ft("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${c(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}function ki(e){let t=e.reviewDetail;return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${f("shield",14)}\u984C\u5EAB\u4EBA\u5DE5\u9A57\u6536\u6279\u6CE8</span>
      <span class="badge badge-warn">\u5F85\u5BE9 ${c(e.stats.pending_review||0)}</span>
    </div>
    <label class="field qb-reviewer-field">
      <span class="field-label">\u9A57\u6536\u8005\u540D\u7A31</span>
      <input class="input" id="qb-reviewer-name" value="${n(e.reviewer)}" placeholder="\u76EE\u524D\u4EFB\u4F55\u4EBA\u53EF\u9A57\u6536\uFF1BGoogle Auth \u5F8C\u6539\u7531\u7BA1\u7406\u8005" />
    </label>
    ${t?`<div class="qb-review-detail">
            <button class="btn btn-ghost btn-sm" type="button" data-qb-action="review-back">${f("chevronLeft",13)}<span>\u8FD4\u56DE\u5F85\u5BE9\u5217\u8868</span></button>
            ${Ss(t,{reviewMode:!0})}
            ${Ja(t)}
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
            ${t.reviews?.length?`<div class="qb-review-history"><span class="summary-label">\u5BE9\u6838\u7D00\u9304</span>${t.reviews.map(s=>`<div class="qb-review-row"><span>${n(s.reviewer||"\u533F\u540D")}</span>${Ua(s.decision==="approved"?"accepted":s.decision)}<span>${n(oe(s.created_at))}</span><p>${n(s.comment||"\u2014")}</p></div>`).join("")}</div>`:""}
          </div>`:`<div class="qb-list">${e.reviewItems.length?e.reviewItems.map(s=>Ss(s,{reviewMode:!0})).join(""):Ft("\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u984C\u76EE\u3002")}</div>`}
  </section>`}function Si(e){let t=e.editingSuite;return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${f("cube",14)}Benchmark \u984C\u5EAB</span>
      <span class="badge badge-info">${c(e.ready.length)} benchmark-ready</span>
    </div>
    <form class="qb-suite-form" data-qb-form="suite">
      <input type="hidden" name="suite_id" value="${t?.id||""}" />
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${n(t?.name||"Pilot 30")}" /></label>
        <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(Fa).map(([s,a])=>`<option value="${s}" ${t?.tier===s?"selected":""}>${a}</option>`).join("")}</select></label>
      </div>
      <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${n(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
      <div class="qb-check-list">
        ${e.ready.length?e.ready.map(s=>{let a=t?t.items?.some(r=>Number(r.id)===Number(s.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${s.id}" ${a?"checked":""}/><span><strong>#${s.id}</strong> ${n(s.question)} <small>${n(Ht[s.question_type]||s.question_type)}</small></span></label>`}).join(""):Ft("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
      </div>
      <div class="qb-actions">
        <button class="btn btn-primary" type="submit">${f("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
        ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
      </div>
    </form>
    <div class="qb-list">
      ${e.suites.length?e.suites.map(s=>`<article class="qb-suite">
        <div class="qb-item-head">
          <div class="qb-item-title"><strong>${n(s.name)}</strong><span class="qb-meta">${n(Fa[s.tier]||s.tier)} \xB7 v${s.version} \xB7 ${c(s.item_count)} \u984C</span></div>
          <span class="badge ${s.status==="frozen"?"badge-ok":"badge-neutral"}">${s.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
        </div>
        <div class="qb-suite-items">${(s.items||[]).slice(0,8).map(a=>`<span class="chip">#${a.id} ${n(a.question.slice(0,22))}${a.question.length>22?"\u2026":""}</span>`).join("")}${s.item_count>8?`<span class="qb-muted">+${s.item_count-8}</span>`:""}</div>
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${s.id}">${f("edit",13)}<span>\u7DE8\u8F2F\u984C\u76EE</span></button>
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${s.id}">${f("shield",13)}<span>\u51CD\u7D50</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${s.id}">${f("trash",13)}<span>\u522A\u9664</span></button>
        </div>
      </article>`).join(""):Ft("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
    </div>
  </section>`}function xi(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),r=Number(a?.value);Number.isFinite(r)&&(t[s]=Math.max(1,Math.min(5,Math.round(r))))}return t}function qi(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:gi(t.get("expected_laws")),expected_articles:vi(t.get("expected_articles")),expected_judgments:fi(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function Qa(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},r={tab:"",editing:null,editingSuite:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tag:""},stats:{},suites:[],ready:[],reviewItems:[],reviewDetail:null,reviewer:(()=>{try{return window.localStorage.getItem("judgment.reviewer")||"anonymous"}catch{return"anonymous"}})()},i=M=>e.querySelector(`#quality-panel-${a[M]}`),o=M=>{r.reviewer=String(M||"").trim()||"anonymous";try{window.localStorage.setItem("judgment.reviewer",r.reviewer)}catch{}},l=()=>{s&&s(r.stats)},p=M=>{t&&t(M),v(M)},g=async()=>{try{r.stats=await U.questionBankStats()}catch{r.stats={}}l()},k=()=>{let M=i("create");M&&(M.innerHTML=wi(r.editing))},y=async()=>{let M=i("manage");if(M){M.innerHTML='<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026</span></div></section>';try{let j=await U.questionBankItems(r.filters,r.limit,r.offset);r.items=j.items||[],r.total=Number(j.total||0),r.stats=j.stats||r.stats,M.innerHTML=_i(r),l()}catch(j){M.innerHTML=`<section class="report-card qb-card">${te({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:n(j.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},h=async()=>{let M=i("suite");if(M){M.innerHTML='<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026</span></div></section>';try{let[j,D]=await Promise.all([U.benchmarkSuites(),U.benchmarkReadyQuestions(300)]);r.suites=j.suites||[],r.ready=D.items||[],M.innerHTML=Si(r)}catch(j){M.innerHTML=`<section class="report-card qb-card">${te({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:n(j.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},S=async()=>{let M=i("review");if(M){M.innerHTML='<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>\u8B80\u53D6\u5F85\u5BE9\u984C\u76EE\u4E2D\u2026</span></div></section>';try{let[j,D]=await Promise.all([U.questionBankItems({status:"pending_review"},100,0),U.questionBankItems({status:"changes_requested"},100,0)]);r.reviewItems=[...j.items||[],...D.items||[]],r.stats=j.stats||r.stats,r.reviewDetail&&(r.reviewDetail=await U.questionBankItem(r.reviewDetail.id)),M.innerHTML=ki(r);let q=M.querySelector("#qb-reviewer-name");q&&(q.value=r.reviewer,q.addEventListener("change",()=>o(q.value))),l()}catch(j){M.innerHTML=`<section class="report-card qb-card">${te({tone:"danger",title:"\u5F85\u5BE9\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:n(j.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}};function v(M){r.tab=M;for(let j of Object.keys(a)){let D=i(j);D&&(D.hidden=j!==M)}M==="create"?k():M==="manage"?y():M==="suite"?h():M==="review"&&S()}let w=M=>{let j=r.items.find(D=>Number(D.id)===Number(M));r.reviewDetail=j||{id:Number(M)},p("review")},C=async M=>{let j=qi(M),D=Number(M.elements.item_id?.value||0);try{D?(await U.updateQuestionBankItem(D,{...j,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),B("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await U.createQuestionBankItem(j),B("\u984C\u76EE\u5DF2\u5EFA\u7ACB\u3002","ok")),r.editing=null,await g(),p("manage")}catch(q){let d=q.detail||q.payload?.detail,u=d?.errors?.join(" \xB7 ")||d?.message||q.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";B(u,"danger",8e3)}},T=async(M,j)=>{let D=Number(M.dataset.id||0);if(D)try{await U.reviewQuestionBankItem(D,{decision:j,reviewer:r.reviewer,rubric_scores:xi(M),comment:String(M.querySelector('[name="comment"]')?.value||"")}),B(j==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":j==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",j==="approved"?"ok":"info"),r.reviewDetail=null,await g(),await S()}catch(q){let d=q.detail||q.payload?.detail,u=d?.errors?.join(" \xB7 ")||d?.message||q.message||"\u9A57\u6536\u5931\u6557\u3002";B(u,"danger",8e3)}},x=async M=>{let j=new FormData(M),D=Number(j.get("suite_id")||0),q=Array.from(M.querySelectorAll('input[name="item_ids"]:checked')).map(u=>Number(u.value)),d={name:String(j.get("name")||"").trim(),tier:String(j.get("tier")||"core"),description:String(j.get("description")||"").trim(),item_ids:q};try{D?(await U.updateBenchmarkSuite(D,d),B("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await U.createBenchmarkSuite(d),B("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),r.editingSuite=null,await h()}catch(u){let A=u.detail||u.payload?.detail,H=A?.errors?.join(" \xB7 ")||A?.message||u.message||"Suite \u5132\u5B58\u5931\u6557\u3002";B(H,"danger",8e3)}},O=async M=>{let j=M.target.closest("[data-qb-action]")?.dataset.qbAction;if(!j)return;let D=M.target.closest("[data-qb-action]"),q=Number(D.dataset.id||0);if(j==="new"){r.editing=null,p("create");return}if(j==="reset-create"){r.editing=null,k();return}if(j==="edit"){let d=r.items.find(u=>Number(u.id)===q);if(!d)return;r.editing=d,p("create");return}if(j==="review"){w(q);return}if(j==="review-back"){r.reviewDetail=null,S();return}if(j==="delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${q}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await U.deleteQuestionBankItem(q),B("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await g(),await y()}catch(d){B(d.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(j==="revalidate"){try{let d=await U.revalidateQuestionBank();B(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${c(d.checked||0)} \u984C\uFF0C${c(d.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await g(),await y()}catch(d){B(d.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(j==="export"){try{let d=await U.exportQuestionBank({status:""});Be(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(d,null,2),"application/json;charset=utf-8")}catch(d){B(d.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(j==="import-json"){let d=e.querySelector("#qb-import-json");try{let u=JSON.parse(String(d?.value||"").trim()),A=await U.importQuestionBank(u);B(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${A.created}\u3001\u66F4\u65B0 ${A.updated}\u3001\u932F\u8AA4 ${(A.errors||[]).length}\u3002`,(A.errors||[]).length?"warn":"ok",8e3),d&&(d.value=""),await g(),await y()}catch(u){B(u.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(j==="prev"||j==="next"){r.offset=Math.max(0,r.offset+(j==="next"?r.limit:-r.limit)),await y();return}if(j==="suite-edit"){let d=r.suites.find(u=>Number(u.id)===q);if(!d)return;r.editingSuite=d,h();return}if(j==="suite-new"){r.editingSuite=null,h();return}if(j==="suite-freeze"){try{await U.updateBenchmarkSuite(q,{freeze:!0}),B("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),r.editingSuite=null,await h()}catch(d){B(d.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(j==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${q}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await U.deleteBenchmarkSuite(q),B("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),r.editingSuite=null,await h()}catch(d){B(d.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(j==="decide"){let d=D.closest("form[data-qb-form='review']");d&&await T(d,String(D.dataset.decision||""))}},K=async M=>{let j=M.target.closest("[data-qb-form]");if(!j)return;M.preventDefault();let D=j.dataset.qbForm;if(D==="create")await C(j);else if(D==="filter"){let q=new FormData(j);r.filters={query:String(q.get("query")||"").trim(),status:String(q.get("status")||""),question_type:String(q.get("question_type")||""),difficulty:String(q.get("difficulty")||""),tag:String(q.get("tag")||"").trim()},r.offset=0,await y()}else D==="suite"&&await x(j)};e.addEventListener("click",O),e.addEventListener("submit",K);let ee=async()=>{await g(),r.tab==="create"?k():r.tab==="manage"?await y():r.tab==="suite"?await h():r.tab==="review"&&await S()};return g(),{show:v,refresh:ee,destroy(){e.removeEventListener("click",O),e.removeEventListener("submit",K)},getStats:()=>r.stats}}function Jt(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function Ga(e){return e==null?"\u2014":c(e)}function Ai(e){return e.count?e.severity==="danger"?le("failed","\u9700\u8655\u7406"):e.severity==="warn"?le("warning","\u6CE8\u610F"):le("preview","\u63D0\u793A"):le("success","\u901A\u904E")}function Li(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function Mi(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${Li(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${n(e.label)}</span>
      ${Ai(e)}
    </div>
    <div class="quality-check-value">
      <strong>${c(t)}</strong>
      <span>\u7B46</span>
      <em>${n(Jt(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${n(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function Ut(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
      <div class="index-chart-head"><span>${n(e)}</span><span>${n(t)}</span></div>
      <div class="index-chart-empty">DuckDB \u6383\u63CF\u5F8C\u6C92\u6709\u53EF\u5448\u73FE\u7684\u8CC7\u6599\u3002</div>
    </div>`;let r=Math.max(...a.map(i=>Number(i.value)||0),1);return`<div class="index-chart-card">
    <div class="index-chart-head"><span>${n(e)}</span><span>${n(t)}</span></div>
    <div class="distribution">
      ${a.map(i=>{let o=Number(i.value)||0,l=Math.max(1.5,o/r*100);return`<div class="dist-row">
            <span class="dist-label" title="${n(i.label||"\u672A\u5206\u985E")}">${n(i.label||"\u672A\u5206\u985E")}</span>
            <span class="dist-track"><span class="dist-bar" style="width:${l.toFixed(2)}%"></span></span>
            <span class="dist-value">${c(o)}</span>
          </div>`}).join("")}
    </div>
  </div>`}function Ti(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},r=t.postgres_diff,i=r==null?"\u2014":r===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${c(Math.abs(r))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${c(t.vector_indexed)} / ${c(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${f("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${c(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${c(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${f("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${Ga(t.postgres_judgments)}</div>
      <div class="metric-foot">${n(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${f("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${n(Jt(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${n(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${f("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${Ga(a.candidate_total)}</div>
      <div class="metric-foot">${c(a.candidate_archive_count)} / ${c(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function ji(e){return e.length?`<div class="table-wrap">
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
        ${e.map(t=>{let s=(Number(t.missing_court_rows)||0)+(Number(t.missing_normalized_rows)||0)+(Number(t.missing_date_rows)||0)+(Number(t.invalid_date_rows)||0)+(Number(t.missing_title_rows)||0),a=t.candidate_count===null||t.candidate_count===void 0?"\u2014":c(t.candidate_count);return`<tr>
              <td class="cell-jid">
                <span class="mono">${n(t.archive||"\u2014")}</span>
                ${t.version?`<span class="chip">v${n(t.version)}</span>`:""}
              </td>
              <td class="cell-number">${c(t.rows)}</td>
              <td class="cell-number">${a}</td>
              <td class="cell-number">${c(t.matched_rows)}</td>
              <td class="cell-number">${n(Jt(t.match_rate))}</td>
              <td class="cell-number">${c(t.short_text_rows)}</td>
              <td class="cell-number">${c(s)}</td>
              <td class="cell-number">${c(t.duplicate_content_rows)}</td>
              <td class="cell-date">${n(Ce(t.date_min))} \u2013 ${n(Ce(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:qe({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function Ei(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],r=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=Z(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${le(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${c(t.rows)} \u7B46 \xB7 ${c(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${V(e.scan_ms||0)} \xB7
          ${n(oe(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${f("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${te({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(p=>n(p)).join("<br>")})}</div>`:""}
    <div class="summary-strip quality-summary-strip">
      <div class="summary-item">
        <div class="summary-label">\u539F\u59CB\u7B46\u6578</div>
        <div class="summary-value">${c(t.rows)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">\u7CBE\u78BA\u547D\u4E2D</div>
        <div class="summary-value">${c(t.matched_rows)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">\u547D\u4E2D\u7387</div>
        <div class="summary-value">${n(Jt(t.match_rate))}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">\u91CD\u8907\u6848\u865F</div>
        <div class="summary-value">${c(t.duplicate_jid_rows)}</div>
      </div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u54C1\u8CEA\u6AA2\u67E5</span>
        <span class="muted" style="font-size:9.5px">
          ${c(r.ok_count)} \u9805\u901A\u904E \xB7
          ${c(r.warning_count)} \u9805\u6CE8\u610F \xB7
          ${c(r.danger_count)} \u9805\u9700\u8655\u7406 \xB7
          ${c(r.info_count)} \u9805\u63D0\u793A
        </span>
      </div>
      <div class="quality-checks">${a.map(Mi).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${Ti(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${c(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${ji(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${Ut("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${Ut("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${Ut("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${Ut("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function Ri(e){e.innerHTML=`<section class="page data-page quality-page">
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),r=[...e.querySelectorAll("[data-quality-tab]")],i={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},o=null,l="overview",p=()=>{if(!o)return;t.innerHTML=Ei(o),a.textContent=`DUCKDB \xB7 ${c(o.totals?.rows)} \u7B46 \xB7 ${V(o.scan_ms||0)}`;let v=e.querySelector("#quality-badge-overview");v&&(v.textContent=c(o.totals?.rows||0))},g=v=>{l=v==="overview"?"overview":v;for(let w of r){let C=w.dataset.qualityTab===l;w.classList.toggle("is-active",C),C?w.setAttribute("aria-current","page"):w.removeAttribute("aria-current")}for(let[w,C]of Object.entries(i))C&&(C.hidden=w!==l);l!=="overview"?a.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":o&&p()},k=Qa(e,{onNavigate:v=>g(v),onStats:v=>{let w=v||{},C=e.querySelector("#quality-badge-manage"),T=e.querySelector("#quality-badge-suite"),x=e.querySelector("#quality-badge-review");C&&(C.textContent=c(w.total||0)),T&&(T.textContent=c(w.benchmark_ready||0)),x&&(x.textContent=c((w.pending_review||0)+(w.changes_requested||0)))}}),y=v=>{g(v),v!=="overview"&&k.show(v)},h=async()=>{ae(s,!0,"\u6383\u63CF\u4E2D\u2026");try{o=await U.quality(),p()}catch(v){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${te({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:n(v.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",B("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{ae(s,!1)}},S=async()=>{l==="overview"?await h():await k.refresh()};s.addEventListener("click",S),e.addEventListener("click",v=>{let w=v.target.closest("[data-quality-tab]");w&&y(w.dataset.qualityTab||"overview")}),t.addEventListener("click",v=>{!v.target.closest("[data-action='export-quality']")||!o||Be(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(o,null,2),"application/json;charset=utf-8")}),g("overview"),await h()}var Ls={};We(Ls,{render:()=>ao});var za={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var Wa={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},Ka=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 Data \u2192 AI",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}];function Ni(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Pe(e).label,tone:Pe(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function Ci(e){let t=Pe(e.status),s=za[e.kind]||za.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${c(e.latency_ms)} ms</span>`;return`<article class="service-card">
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
  </article>`}function Pi(e,t){return`<div class="arch-node ${e?"":"is-muted"}" ${e?"":'title="\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"'}>${n(t)}</div>`}function Bi(e,t){if(e==="IndexedDB")return Hs();let a={PostgreSQL:"postgres",Parquet:"parquet",Qdrant:"qdrant",Embedding:"embedding",Retriever:"rag","RAG Engine":"rag",LLM:"llm"}[e];return a?t.find(i=>i.id===a)?.status==="operational":!0}function Ii(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>Pi(Bi(l,t),l)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${n(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),r=[];return a.forEach((i,o)=>{o&&r.push(`<div class="arch-arrow" aria-hidden="true">${f("arrowRight",15)}</div>`),r.push(i)}),`<div class="arch-flow">${r.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${f("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>`}function Di(e){return!Array.isArray(e)||!e.length?'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>':`<div class="endpoint-list">
    ${e.map(t=>`<div class="endpoint-row">
          <span class="endpoint-method">${n(t.method)}</span>
          <span class="endpoint-path" title="${n(t.path)}">${n(t.path)}</span>
          <span class="endpoint-label">${n(t.label||"")}</span>
        </div>`).join("")}
  </div>`}function pe(e,t){return`<div class="detail-row">
    <span class="detail-label">${n(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function Oi(e){return e?`<div class="detail-list">
    ${pe("\u7248\u672C ID",`<strong>#${c(e.id)}</strong>`)}
    ${pe("\u8CC7\u6599\u985E\u578B",le("operational",e.source_type==="law"?"\u6CD5\u898F":"\u547D\u4EE4"))}
    ${pe("\u4F86\u6E90\u66F4\u65B0\u65E5",`<strong>${n(e.update_date||"\u2014")}</strong>`)}
    ${pe("\u6CD5\u898F / \u689D\u6587",`<strong>${c(e.law_count)} / ${c(e.article_count)}</strong>`)}
    ${pe("\u4E0B\u8F09\u6642\u9593",`<span class="mono">${oe(e.downloaded_at)}</span>`)}
    ${pe("Parquet",`<code title="${n(e.parquet_path||"")}">${n(e.parquet_path||"\u2014")}</code>`)}
  </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}function Fi(e){if(!Array.isArray(e)||!e.length)return qe({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${n(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${kt(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function Hi(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=Ni(e.status),r=s.find(g=>g.id==="qdrant"),i=s.find(g=>g.id==="rag"),o=s.find(g=>g.id==="llm"),l=Qe(),p=Wa[l]||l;return`<section class="status-hero">
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
          <span>${f("clock",11)} \u6AA2\u67E5\u6642\u9593 ${oe(e.checked_at)} \xB7 ${n(rt(e.checked_at))}</span>
          <span>${f("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${f("database",11)} ${c(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${f("layers",11)} ${c(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${n(p)}">${f("link",11)} ${n(Ke())}</span>
        </div>
      </div>
    </section>

    <div class="service-grid">${s.map(Ci).join("")}</div>

    <div class="status-summary">
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u6CD5\u898F</div>
        <div class="metric-value">${c(t.law_count)}</div>
        <div class="metric-foot">source_type = law</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u547D\u4EE4</div>
        <div class="metric-value">${c(t.order_count)}</div>
        <div class="metric-foot">source_type = order</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u689D\u6587\u7E3D\u6578</div>
        <div class="metric-value">${c(t.article_count)}</div>
        <div class="metric-foot">\u73FE\u884C\u7248\u672C\u5408\u8A08</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u8CC7\u6599\u7248\u672C</div>
        <div class="metric-value">${c(t.version_count)}</div>
        <div class="metric-foot">\u539F\u59CB Parquet \u7248\u672C</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u4E0B\u8F09\u57F7\u884C</div>
        <div class="metric-value">${c(t.run_count)}</div>
        <div class="metric-foot">\u542B\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557</div>
      </div>
    </div>

    ${r?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${te({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${n(r?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${n(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${n(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}

  }`}function Ui(e){let t=Array.isArray(e.services)?e.services:[],s=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Data \u2192 Intelligence</div>
      </div>
      <span class="badge badge-neutral badge-mono">${c((s.flow||[]).length)} layers</span>
    </div>
    ${Ii(s,t)}
  </div>`}function Ji(e){let t=Qe(),s=Wa[t]||t,a=Ne("/api/docs"),r=Ne("/api/openapi.json");return`<div class="status-columns is-single">
    <section class="card">
      <div class="side-card-head">
        <span class="side-card-title">${f("terminal",14)}API \u7AEF\u9EDE</span>
        <a href="${n(a)}" target="_blank" rel="noopener noreferrer" class="chip"
          >OpenAPI ${f("external",11)}</a>
      </div>
      ${Di(e.endpoints)}
      <div class="side-card-foot">
        \u76EE\u524D API Base\uFF1A<code>${n(Ke())}</code>\uFF08${n(s)}\uFF09\u3002\u4E92\u52D5\u5F0F API \u6587\u4EF6\u4F4D\u65BC <a href="${n(a)}" target="_blank" rel="noopener noreferrer"><code>${n(a)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${n(r)}" target="_blank" rel="noopener noreferrer"><code>${n(r)}</code></a>\u3002
      </div>
    </section>
  </div>`}function Qi(e){let t=e.data||{};return`<div class="status-summary">
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u6CD5\u898F</div>
        <div class="metric-value">${c(t.law_count)}</div>
        <div class="metric-foot">source_type = law</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u547D\u4EE4</div>
        <div class="metric-value">${c(t.order_count)}</div>
        <div class="metric-foot">source_type = order</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u689D\u6587\u7E3D\u6578</div>
        <div class="metric-value">${c(t.article_count)}</div>
        <div class="metric-foot">\u73FE\u884C\u7248\u672C\u5408\u8A08</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u8CC7\u6599\u7248\u672C</div>
        <div class="metric-value">${c(t.version_count)}</div>
        <div class="metric-foot">\u539F\u59CB Parquet \u7248\u672C</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u5224\u6C7A\u7D22\u5F15</div>
        <div class="metric-value">${c(t.judgment_indexed_count)}</div>
        <div class="metric-foot">/ ${c(t.judgment_count)} \u7B46\u5224\u6C7A</div>
      </div>
    </div>
    <div class="status-columns is-single">
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${f("layers",14)}\u6700\u65B0\u8CC7\u6599\u7248\u672C</span>
          ${le("operational","Parquet")}
        </div>
        ${Oi(t.last_version)}
        <div class="side-card-foot">
          \u539F\u59CB Parquet \u5408\u8A08 ${Z(t.parquet_bytes)}\uFF1BPostgreSQL \u4FDD\u5B58 metadata \u8207\u7248\u672C\u72C0\u614B\u3002
        </div>
      </section>
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${f("database",14)}\u8CC7\u6599\u96C6\u7D71\u8A08</span>
          <span class="badge badge-neutral badge-mono">${c(t.parquet_files)} FILES</span>
        </div>
        <div class="detail-list">
          ${pe("\u73FE\u884C\u6CD5\u898F",`<strong>${c(t.law_count)}</strong>`)}
          ${pe("\u73FE\u884C\u547D\u4EE4",`<strong>${c(t.order_count)}</strong>`)}
          ${pe("\u689D\u6587\u7E3D\u6578",`<strong>${c(t.article_count)}</strong>`)}
          ${pe("\u539F\u59CB Parquet",`<strong>${Z(t.parquet_bytes)}</strong>`)}
          ${pe("\u5224\u6C7A\u6587\u4EF6",`<strong>${c(t.judgment_count)}</strong>`)}
          ${pe("\u5411\u91CF\u7D22\u5F15",`<strong>${c(t.judgment_indexed_count)}</strong> / ${c(t.judgment_count)}\uFF08${c(t.judgment_vector_points)} points\uFF09`)}
          ${pe("\u7D22\u5F15\u7248\u672C",`<strong>#${c(t.judgment_vector_version_id)}</strong> \xB7 ${n(t.judgment_vector_version_status||"legacy")}`)}
          ${pe("Alias",`<code>${n(t.judgment_vector_alias||"\u2014")}</code> \u2192 <code>${n(t.judgment_vector_collection||"\u2014")}</code>`)}
          ${pe("\u7D22\u5F15\u6A21\u578B",`<code>${n(t.judgment_vector_model||"\u2014")}</code>`)}
          ${pe("\u6700\u8FD1\u7D22\u5F15",`<span class="mono">${oe(t.judgment_indexed_at)}</span>`)}
        </div>
      </section>
    </div>`}function Gi(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${f("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${c(t.run_count)} TOTAL</span>
    </div>
    ${Fi(e.recent_runs)}
  </section>`}function zi(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function Ya(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function nt(e,t,s,a,r){let i=zi(r);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${f(t,14)}${n(e)}</span>
      <strong>${n(s)}</strong>
    </div>
    ${Ya(r,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function Vi(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${f("layers",14)}Docker</span>
        ${le("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${n(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,p=o.service?0:1;return l-p||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${n(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${n(i.service)}</span>`:""}</td>
        <td>${le(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
        <td class="cell-number">${i.cpu_percent===null||i.cpu_percent===void 0?"\u2014":`${c(i.cpu_percent)}%`}</td>
        <td class="cell-number">${Z(i.memory_used)}${i.memory_limit?` / ${Z(i.memory_limit)}`:""}</td>
        <td class="mono">${n(i.net_io||"\u2014")}</td>
        <td class="mono">${n(i.block_io||"\u2014")}</td>
        <td class="cell-number">${c(i.pids)}</td>
      </tr>`).join(""),r=(t.system||[]).map(i=>`<span class="resource-docker-pill">
        <strong>${n(i.type||"\u2014")}</strong>
        <span>${c(i.count)} \xB7 ${n(i.size||"\u2014")}</span>
      </span>`).join("");return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${f("layers",14)}Docker \u5BB9\u5668\u4F7F\u7528\u8CC7\u6E90</span>
      <span class="badge badge-ok badge-mono">${c(s.length)} \u500B\u5BB9\u5668</span>
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
  </section>`}function Wi(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",r=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${pe("\u8CC7\u6599\u5EAB",`<code>${n(s.database||"\u2014")}</code>`)}
           ${pe("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${Z(s.storage_bytes)}</strong>`)}
           ${pe("Docker volume",`<strong>${Z(s.volume_bytes)}</strong>${s.volume_name?` <code>${n(s.volume_name)}</code>`:""}`)}
           ${pe("\u9023\u7DDA\u6578",`<strong>${c(s.connections)}</strong>`)}`:`${pe("Collection",`<code>${n(s.collection||"\u2014")}</code>`)}
           ${pe("Docker volume",`<strong>${Z(s.volume_bytes)}</strong>${s.volume_name?` <code>${n(s.volume_name)}</code>`:""}`)}
           ${pe("\u5411\u91CF\u9EDE\u6578",`<strong>${c(s.points_count)}</strong>`)}
           ${pe("Collections",`<strong>${c(s.collections)}</strong>`)}
           ${pe("Segments",`<strong>${c(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${n(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${n(s.kind||"")}</div>
          </div>
          ${le(i)}
        </div>
        <div class="resource-db-metrics">
          <div><span>CPU</span><strong>${s.cpu_percent===null||s.cpu_percent===void 0?"\u2014":`${c(s.cpu_percent)}%`}</strong></div>
          <div><span>RAM</span><strong>${Z(s.memory_used)}</strong><small>${s.memory_limit?` / ${Z(s.memory_limit)}`:""}</small></div>
          <div><span>\u5BB9\u5668</span><strong class="mono">${n(s.container||"\u2014")}</strong><small>${n(s.container_status||"\u2014")}</small></div>
        </div>
        <div class="detail-list">${o}</div>
        ${r.length?`<div class="resource-table-wrap">
                <table class="data-table is-compact">
                  <thead><tr><th scope="col">\u8CC7\u6599\u8868</th><th scope="col">\u5927\u5C0F</th></tr></thead>
                  <tbody>${r.map(l=>`<tr>
                        <td class="mono">${n(l.name||"\u2014")}</td>
                        <td class="cell-number">${Z(l.bytes)}</td>
                      </tr>`).join("")}</tbody>
                </table>
              </div>`:""}
        <div class="side-card-foot">${n(s.detail||"")}</div>
      </article>`}).join("")}</div>`}function dt(e,t,s,a){let r=Number(t)||0,i=a?r/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${n(e)}</span>
      <strong>${Z(r)}</strong>
    </div>
    ${Ya(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function Ki(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},r=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},p=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${f("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${Z(p)}</span>
    </div>
    <div class="storage-list">
      ${dt("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${n(s.frontend_path||"\u2014")}</span>`,p)}
      ${dt("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${n(s.backend_path||"\u2014")}</span>`,p)}
      ${dt("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",r.layers_bytes,`Images ${Z(r.images_bytes)} \xB7 Containers ${Z(r.containers_bytes)} \xB7 Build cache ${Z(r.build_cache_bytes)}`,p)}
      ${dt("PostgreSQL volume",o.size_bytes,`<span class="mono">${n(o.name||"\u2014")}</span>`,p)}
      ${dt("Qdrant volume",l.size_bytes,`<span class="mono">${n(l.name||"\u2014")}</span>`,p)}
      ${dt("Parquet",a.total_bytes,`\u6CD5\u898F ${Z(a.law_bytes)} \xB7 \u5224\u6C7A ${Z(a.judgment_bytes)}`,p)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${Z(p)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function Yi(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},r=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),p=Array.isArray(e.disk)?e.disk:[],g=p[0]||{},k=Number(o.total_bytes||g.total||0),y=k?l/k*100:0,h=[s.load_1,s.load_5,s.load_15].map(w=>w??"\u2014").join(" / "),S=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":V(Number(t.uptime_seconds)*1e3),v=[g.label?nt("HDD \u5DF2\u4F7F\u7528","database",`${c(g.percent)}%`,`${Z(g.used)} / ${Z(g.total)} \xB7 \u5269\u9918 ${Z(g.free)}<br><span class="mono">${n(g.path||"")}</span>`,g.percent):"",l?nt("Judgment \u5143\u4EF6\u5408\u8A08","layers",Z(l),`\u7D04\u5360 HDD ${c(y)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,y):"",...p.slice(1).map(w=>nt(`\u786C\u789F \xB7 ${w.label}`,"layers",`${c(w.percent)}%`,`${Z(w.used)} / ${Z(w.total)} \xB7 \u5269\u9918 ${Z(w.free)}<br><span class="mono">${n(w.path||"")}</span>`,w.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${oe(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${nt("CPU \u4F7F\u7528\u7387","cpu",`${c(s.percent)}%`,`${c(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${c(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${n(h)}`,s.percent)}
      ${nt("\u8A18\u61B6\u9AD4","server",`${c(a.percent)}%`,`${Z(a.used)} / ${Z(a.total)} \xB7 \u53EF\u7528 ${Z(a.available)}`,a.percent)}
      ${nt("Swap","layers",`${c(r.percent)}%`,`${Z(r.used)} / ${Z(r.total)}`,r.percent)}
      ${nt("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${c(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${n(S)}<br>${n(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${v||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${Ki(e)}
    ${Vi(e)}
    ${Wi(e)}`}function Va(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function Xi(e){return`<div class="report-card">
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
  </div>`}function Zi(e,t,s){let a=e?.data||{},r=e?Pe(e.status):null,i=s?Pe(s.status):null,o={overview:r?`<span class="badge ${r.tone==="ok"?"badge-ok":r.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${n(r.label)}</span>`:"",resources:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${n(i.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${c(a.version_count)}</span>`,runs:`<span class="badge badge-neutral badge-mono">${c(a.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${Ka.map(l=>{let p=l.id===t;return`<button class="status-tab${p?" is-active":""}" type="button"
          data-status-tab="${l.id}" ${p?'aria-current="page"':""}>
          <span class="status-tab-icon">${f(l.icon,15)}</span>
          <span class="status-tab-copy">
            <strong>${n(l.label)}</strong>
            <small>${n(l.hint)}</small>
          </span>
          ${o[l.id]||""}
        </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u6AA2\u67E5\u6642\u9593</span>
      <span class="mono">${n(e?oe(e.checked_at):"\u2014")}</span>
    </div>`}function eo(e,t,s,a,r){return e==="resources"?s?Yi(s):a?Va():r?Xi(r):Va():e==="architecture"?Ui(t):e==="api"?Ji(t):e==="data"?Qi(t):e==="runs"?Gi(t):Hi(t)}function to(){return`<div class="status-hero">
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
    </div>`}function so(e){return`<div class="report-card">
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
  </div>`}async function ao(e,t){let s=!1,a=null,r=null,i="overview",o=null,l=!1,p=null;e.innerHTML=`<section class="page status-page">
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
      <section class="status-panel" id="status-content">${to()}</section>
    </div>
  </section>`;let g=e.querySelector("#status-nav"),k=e.querySelector("#status-content"),y=e.querySelector("#refresh-status"),h=e.querySelector("#auto-refresh"),S=()=>{r&&(g.innerHTML=Zi(r,i,o),k.innerHTML=eo(i,r,o,l,p))},v=async({quiet:T=!1}={})=>{if(!l){l=!0,p=null,i==="resources"&&S();try{let x=await U.systemUsage();if(s)return;o=x}catch(x){if(s)return;p=x,T||B(x.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{s||(l=!1,i==="resources"&&S())}}},w=async({quiet:T=!1}={})=>{T||(y.disabled=!0,ae(y,!0,"\u6AA2\u67E5\u4E2D\u2026"));try{let x=await U.status();if(s)return;r=x,S(),T||B("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(x){if(s)return;k.innerHTML=so(x),T||B(x.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(y.disabled=!1,ae(y,!1))}},C=async({quiet:T=!1}={})=>{await w({quiet:T}),i==="resources"&&await v({quiet:T})};return g.addEventListener("click",T=>{let x=T.target.closest("[data-status-tab]");if(!x)return;let O=x.dataset.statusTab;Ka.some(K=>K.id===O)&&(i=O,S(),i==="resources"&&!o&&!l&&v())}),k.addEventListener("click",T=>{T.target.closest("#status-retry")&&w(),T.target.closest("#status-resources-retry")&&v()}),y.addEventListener("click",()=>C()),h.addEventListener("change",()=>{a&&(window.clearInterval(a),a=null),h.checked&&(a=window.setInterval(()=>C({quiet:!0}),3e4),B("\u5DF2\u555F\u7528\u6BCF 30 \u79D2\u81EA\u52D5\u66F4\u65B0\u3002","info",2200))}),await w({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,a&&window.clearInterval(a)}}var Ms={};We(Ms,{render:()=>ro});var Xa={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function Za(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${n(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${n(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function no(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}`)}:null})}async function ro(e,t){let s=!1,a=!1,r={embedding:[],llm:[]},i=!1,o=null,l=[],p="",g=null,k="";e.innerHTML=`<section class="page tests-page">
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
  </section>`;let y=e.querySelector("#tests-mode-badge"),h=e.querySelector("#tests-mode-toggle"),S=e.querySelector("#tests-mode-summary"),v=e.querySelector("#tests-mode-models"),w=e.querySelector("#tests-mode-status"),C=e.querySelector("#tests-api-form"),T=e.querySelector("#tests-api-input"),x=e.querySelector("#tests-api-preview"),O=e.querySelector("#tests-api-status"),K=e.querySelector("#tests-api-note"),ee=e.querySelector("#tests-api-test"),M=e.querySelector("#tests-api-reset"),j=e.querySelector("#tests-api-save"),D=e.querySelector("#tests-refresh"),q=e.querySelector("#tests-flow"),d=(Q,se,b="")=>{Q&&(Q.textContent=se,Q.className=`tests-status${b?` is-${b}`:""}`)},u=(Q,se="")=>{O&&(O.textContent=Q,O.className=`api-dialog-status${se?` is-${se}`:""}`)},A=()=>Qe()==="query",H=()=>{let Q=Ue(T.value);return Q||(window.location.protocol==="file:"?Yt:"")},G=()=>{let Q=H(),se=Je(),b=Xa[Qe()]||Qe()||"\u540C\u6E90";x.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${n(Ke(se))}</strong>${se?`\uFF08${n(b)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${n(Ne("/api/health",Q))}`},W=()=>{let Q=Qe(),se=`\u76EE\u524D\u4F86\u6E90\uFF1A${Xa[Q]||Q||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,b="";Q==="query"?(b="is-warn",se="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):wt()?(b="is-warn",se="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(Q==="file-default"||window.location.protocol==="file:")&&(se="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),K.textContent=se,K.className=`api-dialog-note${b?` ${b}`:""}`;let P=Q==="query";j.disabled=P,M.disabled=P,T.readOnly=P},E=()=>{if(!Xt(T.value))return u("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),T.focus(),null;let Q=H();return window.location.protocol==="https:"&&/^http:\/\//i.test(Q)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(Q)?(u("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),T.focus(),null):Q},J=()=>{T.value=Je(),G(),W(),u("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},I=()=>{let Q=Array.isArray(r.embedding)?r.embedding.length:0,se=Array.isArray(r.llm)?r.llm.length:0;if(y&&(y.textContent=i?"\u5207\u63DB\u4E2D\u2026":a?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",y.className=`badge badge-mono ${i?"badge-info":a?"badge-warn":"badge-neutral"}`),h){h.disabled=i,h.classList.toggle("is-on",a),h.classList.toggle("is-off",!a&&!i),h.classList.toggle("is-busy",i),h.setAttribute("aria-checked",a?"true":"false"),h.setAttribute("aria-busy",i?"true":"false"),h.setAttribute("aria-label",i?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":a?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),h.title=i?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":a?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let b=h.querySelector(".header-power-label");b&&(b.textContent=i?"\u2026":a?"ON":"OFF")}S&&(S.textContent=a?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${Q} \u500B embedding \u8207 ${se} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),v&&(v.innerHTML=Za("Embedding",r.embedding)+Za("LLM",r.llm))},X=async()=>{try{let Q=await U.testMode();if(s)return;a=!!Q.enabled,r=Q.models||{embedding:[],llm:[]},d(w,"")}catch(Q){if(s)return;a=!1,r={embedding:[],llm:[]},d(w,Q.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}s||I()},ne=async()=>{if(i)return;let Q=!a;i=!0,I(),d(w,Q?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let se=await U.setTestMode(Q);if(s)return;a=!!se.enabled,r=se.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:a,models:r}}));let b=r.embedding?.length||0,P=r.llm?.length||0;d(w,a?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${b} \u500B embedding \u8207 ${P} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),B(a?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${b} \u500B embedding\u3001${P} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",a?"ok":"info",6e3),await ge()}catch(se){s||(d(w,se.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),B(se.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{i=!1,s||I()}},be=()=>{if(!q)return;let Q=no(o,l,p);Q!==k&&(k=Q,q.innerHTML=lt(o,l,p))},he=async()=>{try{let Q=await U.testRuns(30);if(s)return;l=Array.isArray(Q.runs)?Q.runs:[]}catch{if(s)return;l=[]}},ge=async()=>{try{let Q=p?await U.testRun(p):await U.testRunCurrent();if(s)return;o=Q.run||null,!p&&o&&o.status!=="running"&&!l.some(se=>se.run_id===o.run_id)&&await he()}catch{if(s)return;o=null}s||be()};T?.addEventListener("input",()=>{G(),u("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),ee?.addEventListener("click",async()=>{let Q=E();if(Q!==null){ae(ee,!0,"\u6E2C\u8A66\u4E2D\u2026"),u(`\u6B63\u5728\u9023\u7DDA\u5230 ${Ke(Q)||"\u540C\u6E90"}\u2026`);try{let se=await Ps(Q);if(s)return;u(`\u9023\u7DDA\u6210\u529F \xB7 v${se.version} \xB7 ${se.duration_ms} ms \xB7 GET ${Ne("/api/health",Q)}`,"ok")}catch(se){s||u(se.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{s||ae(ee,!1)}}}),C?.addEventListener("submit",Q=>{if(Q.preventDefault(),A())return;let se=E();se!==null&&(ss(se),B(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${Ke(se)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),M?.addEventListener("click",()=>{A()||(ss(""),B("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),h?.addEventListener("click",ne),q?.addEventListener("change",async Q=>{Q.target.id==="test-run-select"&&(p=String(Q.target.value||""),await ge())}),q?.addEventListener("click",async Q=>{Q.target.closest("#test-flow-refresh")&&(p="",await he(),await ge())}),D?.addEventListener("click",async()=>{ae(D,!0,"\u66F4\u65B0\u4E2D\u2026"),J(),await Promise.allSettled([X(),he()]),s||await ge(),s||(ae(D,!1),B("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let De=Q=>{a=!!Q.detail?.enabled,r=Q.detail?.models||{embedding:[],llm:[]},I()};return window.addEventListener("judgment:test-mode",De),J(),I(),await Promise.allSettled([X(),he()]),await ge(),g=window.setInterval(async()=>{s||document.hidden||p||await ge()},2500),typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{s=!0,g&&window.clearInterval(g),window.removeEventListener("judgment:test-mode",De)}}var en="rag",Vt={rag:{page:_s,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:hs,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:As,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:ys,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:ks,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:Ls,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:Ms,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"}},Qt=document.getElementById("app-main"),Gt=null,zt=0;function io(){return`<div class="page-loading" aria-live="polite">
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-subtitle"></div>
    <div class="skeleton-grid">
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
    </div>
  </div>`}function js(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||en;return Object.prototype.hasOwnProperty.call(Vt,t)?t:en}function oo(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function lo(e){return`<section class="page">
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
  </section>`}async function Ts(){let e=js(),t=++zt;if(oo(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof Gt=="function"){try{Gt()}catch{}Gt=null}document.title=Vt[e].title,Qt.innerHTML=io(),Qt.focus({preventScroll:!0}),window.scrollTo({top:0,behavior:"auto"});let s={route:e,navigate(a){Vt[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===zt&&a&&(document.title=a)}};try{let a=await Vt[e].page.render(Qt,s);if(t!==zt){typeof a=="function"&&a();return}Gt=typeof a=="function"?a:null}catch(a){if(t!==zt)return;console.error("Failed to render route",e,a),Qt.innerHTML=lo(a);let r=document.getElementById("route-retry");r&&r.addEventListener("click",()=>Ts()),B("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function co(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable)||js()!=="rag")return;let a=document.getElementById("rag-question");a&&(e.preventDefault(),a.focus())})}function tn(){Fs(),co(),window.addEventListener("hashchange",Ts),Ts(),wt()&&window.setTimeout(()=>{js()!=="tests"&&(window.location.hash="#/tests")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",tn):tn();})();
