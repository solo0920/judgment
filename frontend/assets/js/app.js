(()=>{var mc=Object.defineProperty;var us=(e,t)=>{for(var s in t)mc(e,s,{get:t[s],enumerable:!0})};var Kn="judgment.api_base",Ts="judgment.admin_token",Xn="http://127.0.0.1:9200",qt=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function ki(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function ps(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${ki(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function Zn(e){let t=ps(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function er(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?ps(e.get("api")):null}catch{return null}}function tr(){try{let e=window.localStorage.getItem(Kn);return e===null?null:ps(e)}catch{return null}}function sr(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return ps(e||"")}function ts(){let e=er();if(e!==null)return e;let t=tr();if(t!==null)return t;let s=sr();return s||(window.location.protocol==="file:"?Xn:"")}function gc(){if(er()!==null)return!0;let e=tr();return e!==null?!!e:!!sr()}function Qt(){return er()!==null?"query":tr()!==null?"storage":sr()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function za(){return gc()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!ki(window.location.hostname)}function ar(e){let t=ps(e);try{t?window.localStorage.setItem(Kn,t):window.localStorage.removeItem(Kn)}catch{}return t}function Ua(){try{let e=String(window.sessionStorage.getItem(Ts)||"").trim();if(e)return e;let t=String(window.localStorage.getItem(Ts)||"").trim();return t?(window.sessionStorage.setItem(Ts,t),window.localStorage.removeItem(Ts),t):""}catch{return""}}function Ga(e){let t=String(e||"").trim();try{t?window.sessionStorage.setItem(Ts,t):window.sessionStorage.removeItem(Ts),window.localStorage.removeItem(Ts)}catch{}return t}function Yn(){return Qt()==="query"?"":Ua()}function _s(e=ts()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function $t(e,t=ts()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function _i(){return Qt()==="query"?"":ts()}async function fc(){let e=Yn(),t={Accept:"application/json"};e&&(t["X-Judgment-Admin-Token"]=e);try{let s=await fetch($t("/api/auth/sse-ticket"),{method:"POST",headers:t,credentials:"include"});if(!s.ok)return"";let a=await s.json();return String(a.ticket||"")}catch{return""}}function Mt(e,t,{onError:s=null,onProgress:a=null}={}){if(document.body.classList.contains("is-demo-visitor"))return()=>{};let n=(Array.isArray(e)?e:[e]).map(v=>String(v||"").trim()).filter(Boolean);if(!n.length||typeof EventSource>"u")return()=>{};let i=null,o=0,l=!1,d=null,m=v=>{let u={};try{u=JSON.parse(v.data||"{}")}catch{u={}}u.initial&&o<=1&&!u.snapshot||t?.(u.topic||n[0],u)},f=v=>{let u={};try{u=JSON.parse(v.data||"{}")}catch{u={}}a?.(u.topic||n[0],u)},y=async()=>{if(l)return;let v=await fc();if(l)return;let u=new URLSearchParams({topic:n.join(",")});v&&u.set("ticket",v),i=new EventSource($t(`/api/events/stream?${u.toString()}`),{withCredentials:!0}),i.onopen=()=>{o+=1,d&&(window.clearTimeout(d),d=null)},i.addEventListener("refresh",m),i.addEventListener("progress",f),i.onerror=()=>{s?.(),!(l||!i)&&(i.close(),i=null,!d&&(d=window.setTimeout(()=>{d=null,y()},3e3)))}};return y(),()=>{l=!0,d&&(window.clearTimeout(d),d=null),i&&(i.removeEventListener("refresh",m),i.removeEventListener("progress",f),i.close(),i=null)}}var Oa=new Map,Ha=new Map;function bc({cached:e=!1}={}){let t=e?"/api/quality?cached=1":"/api/quality",s=Ha.get(t);if(s)return s;let a=ee(t,{timeout:18e4,trackClient:!1});Ha.set(t,a);let n=()=>window.setTimeout(()=>{Ha.get(t)===a&&Ha.delete(t)},1500);return a.then(n,n),a}function hc({cached:e=!1,slim:t=!1}={}){let s=new URLSearchParams;e&&s.set("cached","1"),t&&s.set("slim","1");let a=s.toString(),n=`/api/processing${a?`?${a}`:""}`,i=Oa.get(n);if(i)return i;let o=ee(n,{timeout:45e3,trackClient:!1});Oa.set(n,o);let l=()=>window.setTimeout(()=>{Oa.get(n)===o&&Oa.delete(n)},1500);return o.then(l,l),o}function nr(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function ee(e,t={}){let{base:s,...a}=t,n=s!==void 0?ps(s):ts(),i=new AbortController,o=t.timeout===void 0?3e4:t.timeout,l=o>0?window.setTimeout(()=>i.abort(),o):null,d=Date.now(),m=performance.now(),f=t.requestId||Si(),y={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":f,"X-Judgment-Client-Started-At":String(d),...Yn()?{"X-Judgment-Admin-Token":Yn()}:{},...t.headers||{}},v;try{v=await fetch($t(e,n),{...a,headers:y,credentials:"include",signal:i.signal})}catch(A){throw A.name==="AbortError"?new qt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new qt(nr(n),0,A)}finally{l&&window.clearTimeout(l)}let u=null;if((v.headers.get("content-type")||"").includes("application/json"))try{u=await v.json()}catch{u=null}else try{u=await v.text()}catch{u=null}let w=performance.now(),k=v.headers.get("X-Judgment-Request-Id")||f;if(t.trackClient!==!1&&k){let A=Math.round(performance.now()-m);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{xi({request_id:k,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:A,render_ms:Math.max(0,Math.round(performance.now()-w)),status:v.ok?"success":"failed"})})})}if(!v.ok){v.status===403&&u&&typeof u=="object"&&["demo_closed","demo_hard_disabled"].includes(u.code)&&window.dispatchEvent(new CustomEvent("judgment:demo-denied",{detail:u}));let A=u&&typeof u=="object"?u.detail||u.message:u,S=typeof A=="string"&&A?A:`\u4F3A\u670D\u5668\u56DE\u61C9 ${v.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new qt(S,v.status,A)}return u}function Si(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function xi(e){if(!document.body.classList.contains("is-demo-visitor"))try{fetch($t("/api/performance/client",ts()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),credentials:"include",keepalive:!0}).catch(()=>{})}catch{}}async function Ai(e){let t=ps(e);if(!Zn(t))throw new qt("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,n=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch($t("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new qt(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof qt?i:i.name==="AbortError"?new qt("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new qt(nr(t),0,i)}finally{window.clearTimeout(n)}}var Q={health(){return ee("/api/health")},authMe(){return ee("/api/auth/me",{base:_i(),trackClient:!1})},authLogout(){return ee("/api/auth/logout",{method:"POST",base:_i(),trackClient:!1})},demoStatus(){return ee("/api/demo/status",{timeout:15e3,trackClient:!1})},adminDemo(){return ee("/api/admin/demo",{timeout:15e3,trackClient:!1})},updateDemo(e){return ee("/api/admin/demo",{method:"PUT",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},closeDemo(){return ee("/api/admin/demo/close",{method:"POST",body:JSON.stringify({}),timeout:3e4,trackClient:!1})},demoAudit(e=20){let t=new URLSearchParams({limit:String(e)});return ee(`/api/admin/demo/audit?${t.toString()}`,{timeout:15e3,trackClient:!1})},status(){return ee("/api/status",{trackClient:!1})},ollamaHosts(){return ee("/api/llama-server/hosts",{timeout:3e4,trackClient:!1})},addOllamaHost(e){return ee("/api/llama-server/hosts",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},updateOllamaHost(e,t){return ee(`/api/llama-server/hosts/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},deleteOllamaHost(e){return ee(`/api/llama-server/hosts/${encodeURIComponent(e)}`,{method:"DELETE",timeout:3e4,trackClient:!1})},activateOllamaHost(e){return ee(`/api/llama-server/hosts/${encodeURIComponent(e)}/activate`,{method:"POST",timeout:3e4,trackClient:!1})},deactivateOllamaHosts(){return ee("/api/llama-server/hosts/deactivate",{method:"POST",timeout:3e4,trackClient:!1})},reorderOllamaHosts(e){return ee("/api/llama-server/hosts/reorder",{method:"POST",body:JSON.stringify({host_ids:e}),timeout:3e4,trackClient:!1})},checkOllamaCapabilities(){return ee("/api/llama-server/hosts/capabilities/test",{method:"POST",timeout:18e4,trackClient:!1})},selectOllamaModel(e,t){return ee(`/api/llama-server/hosts/${encodeURIComponent(e)}/models/select`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},clearOllamaModel(e,t){return ee(`/api/llama-server/hosts/${encodeURIComponent(e)}/models/clear`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},systemUsage(){return ee("/api/system-usage",{trackClient:!1})},indexVersions(){return ee("/api/index-versions",{trackClient:!1})},indexVersion(e){return ee(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return ee(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return ee(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return ee("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){return ee("/api/index-alias/reconcile",{method:"POST",body:JSON.stringify({repair:!!e}),trackClient:!1})},catalog(){return ee("/api/catalog")},homeSummary(){return ee("/api/home")},judgmentStats(){return ee("/api/judgment-stats")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return ee("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},dataSuggest({kind:e,query:t="",limit:s=12}){let a=new URLSearchParams({kind:e,query:t,limit:String(s)});return ee(`/api/data/suggest?${a.toString()}`,{timeout:45e3,trackClient:!1})},schemaSuggest({database:e,table:t,column:s,query:a,limit:n=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(n)});return ee(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let n=new URLSearchParams({law_key:e});return t&&n.set("source_type",t),s&&n.set("version_id",String(s)),a&&n.set("article_no",String(a)),ee(`/api/law?${n.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),ee(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return ee("/api/test-mode",{trackClient:!1})},llmModels(){return ee("/api/llm/models",{timeout:6e4,trackClient:!1})},testLlmModels(){return ee("/api/llm/models/test",{method:"POST",timeout:12e4,trackClient:!1})},rerankStatus(){return ee("/api/rerank/status",{timeout:6e4,trackClient:!1})},testReranker(){return ee("/api/rerank/test",{method:"POST",timeout:12e4,trackClient:!1})},selectLlmModel(e,t=null){return ee("/api/llm/model",{method:"POST",body:JSON.stringify({model:e,host_id:t}),timeout:3e4,trackClient:!1})},setTestMode(e){return ee("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return ee(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return ee("/api/test-runs/current",{trackClient:!1})},testRun(e){return ee(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return ee("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))i==null||i===""||a.set(n,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),ee(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality({cached:e=!1}={}){return bc({cached:e})},demoQuality(){return ee("/api/demo/quality",{timeout:2e4,trackClient:!1})},processing({cached:e=!1,slim:t=!1}={}){return hc({cached:e,slim:t})},demoProcessing(){return ee("/api/demo/processing",{timeout:2e4,trackClient:!1})},processingActive(){return ee("/api/processing/active",{timeout:3e3,trackClient:!1})},judgmentDownloadStatus(){return ee("/api/judgment-download/status",{timeout:3e4,trackClient:!1})},versioningSummary(){return ee("/api/versioning/summary",{trackClient:!1})},updatesStatus(){return ee("/api/updates/status",{trackClient:!1})},checkCourts(){return ee("/api/courts/check",{timeout:6e4,trackClient:!1})},checkLawVersions(){return ee("/api/law-versions/check",{timeout:6e4,trackClient:!1})},checkUpdates(e=[]){let t=Array.isArray(e)&&e.length?{source_types:e}:{};return ee("/api/updates/check",{method:"POST",body:JSON.stringify(t),timeout:12e4,trackClient:!1})},versioningSnapshots(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.limit&&t.set("limit",String(e.limit)),ee(`/api/versioning/judgments/snapshots?${t.toString()}`,{trackClient:!1})},versioningChanges(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit)),ee(`/api/versioning/judgments/changes?${t.toString()}`,{trackClient:!1})},versioningJudgment(e){return ee(`/api/versioning/judgments/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVersion(e){return ee(`/api/versioning/judgments/versions/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVector(e,t){return ee(`/api/versioning/judgments/${encodeURIComponent(e)}/vectors/${encodeURIComponent(t)}`,{trackClient:!1})},versioningAudit(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit||500)),ee(`/api/versioning/audit?${t.toString()}`,{trackClient:!1})},questionBankStats(){return ee("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))if(!(i==null||i==="")){if(Array.isArray(i)){for(let o of i)o==null||o===""||a.append(n,String(o));continue}a.set(n,String(i))}return a.set("limit",String(t)),a.set("offset",String(s)),ee(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankTags(e="",t=12){let s=new URLSearchParams({query:e,limit:String(t)});return ee(`/api/question-bank/tags?${s.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return ee(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return ee("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},createQuestionBankItemWithAI(e){return ee("/api/question-bank/ai-items",{method:"POST",body:JSON.stringify(e),timeout:42e4,trackClient:!1})},updateQuestionBankItem(e,t){return ee(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return ee(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},restoreQuestionBankItem(e){return ee(`/api/question-bank/items/${encodeURIComponent(e)}/restore`,{method:"POST",timeout:45e3,trackClient:!1})},submitQuestionBankItemForReview(e){return ee(`/api/question-bank/items/${encodeURIComponent(e)}/submit`,{method:"POST",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return ee(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return ee("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return ee(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return ee("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return ee(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return ee("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},benchmarkSuiteLatestAnswers(e){return ee(`/api/benchmark/suites/${encodeURIComponent(e)}/latest-answers`,{timeout:45e3,trackClient:!1})},removeBenchmarkSuiteItem(e,t){return ee(`/api/benchmark/suites/${encodeURIComponent(e)}/items/${encodeURIComponent(t)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return ee("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return ee(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return ee(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return ee(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return ee("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return ee(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return ee(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return ee(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return ee("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return ee(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return ee("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return ee(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return ee("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return ee("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return ee("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},ragShareCreate(e){return ee("/api/rag/share",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},ragShareGet(e){return ee(`/api/rag/share/${encodeURIComponent(e)}`,{timeout:3e4,trackClient:!1})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onQueued:n=null,onToken:i=null,onTokenReset:o=null}={}){let l=ts(),d=new AbortController,m=t?0:3e5,f=m>0?window.setTimeout(()=>d.abort(),m):null,y=Date.now(),v=performance.now(),u=Si(),b={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":u,"X-Judgment-Client-Started-At":String(y)},w;try{w=await fetch($t("/api/rag/query/stream",l),{method:"POST",headers:b,body:JSON.stringify({question:e}),credentials:"include",signal:d.signal})}catch(G){throw G.name==="AbortError"?new qt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new qt(nr(l),0,G)}finally{f&&window.clearTimeout(f)}if(!w.ok){let G=null;try{G=await w.json()}catch{G=null}let fe=G&&typeof G=="object"&&G.detail?String(G.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${w.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new qt(fe,w.status,G)}if(!w.body)throw new qt("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let k=w.body.getReader(),A=new TextDecoder,S="",$=null,T=null;try{for(;;){let{value:G,done:fe}=await k.read();if(fe)break;S+=A.decode(G,{stream:!0});let ye=S.indexOf(`

`);for(;ye>=0;){let ie=S.slice(0,ye).replace(/\r/g,"");S=S.slice(ye+2);let L="message",q=[];for(let j of ie.split(`
`))j.startsWith("event:")?L=j.slice(6).trim():j.startsWith("data:")&&q.push(j.slice(5).trimStart());if(q.length){let j=null;try{j=JSON.parse(q.join(`
`))}catch{j=null}if(j)if(L==="step"&&typeof s=="function")try{s(j)}catch{}else if(L==="partial"){if(typeof a=="function")try{a(j)}catch{}}else if(L==="queued"){if(typeof n=="function")try{n(j)}catch{}}else if(L==="token"){if(typeof i=="function")try{i(String(j.text||""))}catch{}}else if(L==="token_reset"){if(typeof o=="function")try{o()}catch{}}else L==="result"?$=j:L==="error"&&(T=new qt(j.message||j.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,j))}ye=S.indexOf(`

`)}}}finally{try{await k.cancel()}catch{}f&&window.clearTimeout(f)}if(T)throw T;if(!$)throw new qt("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let K=Math.round(performance.now()-v);return xi({request_id:u,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:K,render_ms:0,status:"success"}),$&&typeof $=="object"&&($._client_request_id=u),$}};var vc={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},$c={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},yc={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},wc={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},qi={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',share:'<path d="M12 16V4"/><path d="m8 8 4-4 4 4"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/><path d="M12 8H7.5a2.5 2.5 0 1 1 0-5H12"/><path d="M12 8h4.5a2.5 2.5 0 1 0 0-5H12"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',palette:'<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10h-4Z"/><circle cx="7.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/><circle cx="10" cy="6.8" r=".8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="6.8" r=".8" fill="currentColor" stroke="none"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',more:'<circle cx="4.2" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="19.8" cy="12" r="2.6" fill="currentColor" stroke="none"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function r(e){return String(e??"").replace(/[&<>"']/g,t=>vc[t])}function It(e,t="#"){let s=String(e??"").trim();if(!s)return t;if(s.startsWith("#"))return s;if(s.startsWith("//")||s.startsWith("/\\"))return t;if(s.startsWith("/"))return s;try{let a=new URL(s,window.location.origin);return["http:","https:"].includes(a.protocol)?s:t}catch{return t}}function p(e,t=16,s=""){let a=qi[e]||qi.info;return`<svg${s?` class="${r(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function c(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function Ce(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function rr(e){if(e instanceof Date)return e;if(typeof e=="number"){let n=new Date(e);return Number.isNaN(n.getTime())?null:n}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function Jt(e){let t=rr(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?r(e):"\u2014"}function $e(e){let t=rr(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?r(e):"\u2014"}function fa(e){let t=rr(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:Jt(t)}function ge(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Wt(e){return $c[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function at(e,t){let s=Wt(e);return`<span class="badge ${yc[s.tone]}"><span class="status-dot ${wc[s.tone]}"></span>${r(t||s.label)}</span>`}function _c(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${r(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function Qa(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function Wa(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return at(String(e));case"source":return _c(String(e));case"number":return`<span class="mono">${c(e)}</span>`;case"duration":return`<span class="mono">${ge(e)}</span>`;case"datetime":return`<span class="mono">${$e(e)}</span>`;case"date":return`<span class="mono">${Jt(e)}</span>`;case"url":{let s=String(e),a=Qa(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${r(It(s))}" target="_blank" rel="noopener noreferrer" title="${r(s)}">${p("external",10)}${r(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${r(s)}">${r(Qa(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(Qa(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(Qa(s,90))}</span>`}}}function Ge({tone:e="info",title:t,text:s,iconName:a="info"}){let n=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${n==="i"?"i":p(n,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${r(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function yt({iconName:e="search",title:t,text:s="",actions:a="",className:n=""}){return`<div class="empty-state ${n}">
    <span class="empty-icon">${p(e,24)}</span>
    <h3 class="empty-title">${r(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function Re(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${r(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function R(e,t="info",s=4200,a={}){let n=document.getElementById("toast-region");if(!n)return null;let{detail:i="",actionLabel:o="",onAction:l=null}=a&&typeof a=="object"?a:{},d={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},m=document.createElement("div");m.className=`toast toast-${t}`,m.setAttribute("role",t==="danger"?"alert":"status"),m.innerHTML=`<span class="toast-mark" aria-hidden="true">${d[t]||"i"}</span>
    <div class="toast-body">${r(e)}${i?`<span class="toast-detail">${r(i)}</span>`:""}</div>
    ${o?`<button class="toast-action" type="button">${r(o)}</button>`:""}
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let f=()=>{m.isConnected&&(m.classList.add("is-leaving"),window.setTimeout(()=>m.remove(),190))};m.querySelector(".toast-close").addEventListener("click",f);let y=m.querySelector(".toast-action");return y&&typeof l=="function"&&y.addEventListener("click",v=>{v.preventDefault(),l(),f()}),n.appendChild(m),s>0&&window.setTimeout(f,s),m}async function ks(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function Vt(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),n=URL.createObjectURL(a),i=document.createElement("a");i.href=n,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(n),1e3)}function ms(e,t){try{let s=JSON.parse(window.localStorage.getItem(e)||"null");return!s||!Object.prototype.hasOwnProperty.call(s,"value")||Date.now()-Number(s.saved_at||0)>t?null:s.value}catch{return null}}function os(e,t){try{window.localStorage.setItem(e,JSON.stringify({value:t,saved_at:Date.now()}))}catch{}}function Va({name:e,label:t,value:s=4}={}){let a=Math.max(1,Math.min(5,Math.round(Number(s)||4)));return`<div class="field qb-score-field" data-score-field>
    <span class="field-label">${r(t||"")}</span>
    <div class="qb-score-cells" role="radiogroup" aria-label="${r(t||"")}\u5206\u6578">
      ${[1,2,3,4,5].map(n=>`<button class="qb-score-cell${n===a?" is-active":""}" type="button" role="radio" aria-checked="${n===a?"true":"false"}" data-score-cell data-score="${n}" aria-label="${r(t||"")} ${n} \u5206">${n}</button>`).join("")}
    </div>
    <input type="hidden" name="${r(e||"")}" value="${a}" data-score-input />
  </div>`}function Ja(){Ja.installed||(Ja.installed=!0,document.addEventListener("click",e=>{let t=e.target.closest?.("[data-score-cell]");if(!t)return;let s=t.closest("[data-score-field]");if(!s)return;let a=Math.max(1,Math.min(5,Math.round(Number(t.dataset.score)||0)));s.querySelectorAll("[data-score-cell]").forEach(i=>{let o=Number(i.dataset.score)===a;i.classList.toggle("is-active",o),i.setAttribute("aria-checked",o?"true":"false")});let n=s.querySelector("[data-score-input]");n&&(n.value=String(a))}))}var kc=`
  <svg class="auth-google-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z"/>
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.58A10 10 0 0 0 12 22Z"/>
    <path fill="#FBBC05" d="M6.41 13.92A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.92V7.5H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.5l3.35-2.58Z"/>
    <path fill="#EA4335" d="M12 6.04c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.5l3.35 2.58C7.2 7.8 9.4 6.04 12 6.04Z"/>
  </svg>`,Sc={google_not_configured:"Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A GOOGLE_CLIENT_ID \u8207 GOOGLE_CLIENT_SECRET\u3002",state_mismatch:"\u767B\u5165\u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u767B\u5165\u3002",access_denied:"\u4F60\u53D6\u6D88\u4E86 Google \u767B\u5165\u3002",email_unverified:"\u9019\u500B Google \u5E33\u865F\u7684\u96FB\u5B50\u90F5\u4EF6\u5C1A\u672A\u9A57\u8B49\u3002",not_allowed:"\u9019\u500B Google \u5E33\u865F\u6C92\u6709\u7BA1\u7406\u54E1\u6B0A\u9650\u3002",oauth_failed:"Google \u767B\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"},Ft=null;function xc(){return Qt()==="query"?"":ts()}function Ac(){let e=xc(),t=`${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;return $t(`/api/auth/google/start?next=${encodeURIComponent(t)}`,e)}function Mi(e){let t=String(e?.name||"").trim();if(t)return t;let s=String(e?.email||"").trim();return s?s.split("@")[0]:"\u5DF2\u767B\u5165"}function qc(e){return Mi(e).slice(0,1).toUpperCase()||"A"}function ir(){let e=Ft?.querySelector("#auth-menu"),t=Ft?.querySelector("#auth-user-trigger");e&&(e.hidden=!0),t&&t.setAttribute("aria-expanded","false")}function Li(e={}){let t=!!e.google_enabled;Ft.innerHTML=`
    <a class="auth-login${t?"":" is-disabled"}"
       id="auth-login"
       href="${r(Ac())}"
       aria-label="\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165"
       title="${t?"\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165":"Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A"}"
       ${t?"":'aria-disabled="true"'}>
      ${kc}
      <span>\u767B\u5165</span>
    </a>`,t||Ft.querySelector("#auth-login")?.addEventListener("click",a=>{a.preventDefault(),R("Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A GOOGLE_CLIENT_ID \u8207 GOOGLE_CLIENT_SECRET\u3002","warn",5200)})}function Mc(e){let t=Mi(e),s=String(e?.email||""),a=e?.admin?"\u7BA1\u7406\u54E1":"\u4F7F\u7528\u8005";Ft.innerHTML=`
    <div class="auth-user">
      <button type="button"
              class="auth-user-trigger"
              id="auth-user-trigger"
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="\u5DF2\u767B\u5165\uFF1A${r(s||t)}\uFF0C\u958B\u555F\u5E33\u865F\u9078\u55AE"
              title="${r(s||t)}">
        <span class="auth-avatar" aria-hidden="true">${r(qc(e))}</span>
        <span class="auth-user-copy">
          <span class="auth-user-name">${r(t)}</span>
          <span class="auth-user-role">${r(a)}</span>
        </span>
        <svg class="auth-chevron" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
             stroke-linejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      <div class="auth-menu" id="auth-menu" role="menu" hidden>
        <div class="auth-menu-head">
          <span class="auth-menu-name">${r(t)}</span>
          <span class="auth-menu-email">${r(s)}</span>
        </div>
        ${e?.admin?'<a class="auth-menu-item" id="auth-admin-settings" href="#/admin" role="menuitem">\u7BA1\u7406\u8A2D\u5B9A</a>':""}
        <button type="button" class="auth-menu-item" id="auth-logout" role="menuitem">
          \u767B\u51FA
        </button>
      </div>
    </div>`;let n=Ft.querySelector("#auth-user-trigger"),i=Ft.querySelector("#auth-menu");n?.addEventListener("click",o=>{o.stopPropagation();let l=!!i?.hidden;i&&(i.hidden=!l),n.setAttribute("aria-expanded",l?"true":"false")}),Ft.querySelector("#auth-admin-settings")?.addEventListener("click",()=>{ir()}),Ft.querySelector("#auth-logout")?.addEventListener("click",async o=>{let l=o.currentTarget;l.disabled=!0,l.textContent="\u767B\u51FA\u4E2D\u2026";try{await Q.authLogout(),R("\u5DF2\u767B\u51FA\u3002","ok",2400),await ji(),window.dispatchEvent(new CustomEvent("judgment:auth-changed"))}catch(d){l.disabled=!1,l.textContent="\u767B\u51FA",R(d.message||"\u767B\u51FA\u5931\u6557\u3002","danger",5200)}})}function or(e){e?.authenticated?Mc(e):Li(e||{google_enabled:!1})}async function ji(){if(Ft)try{let e=await Q.authMe();e?.authenticated&&Ga(""),or(e)}catch{Li({google_enabled:!1})}}function Lc(){let e;try{e=new URL(window.location.href)}catch{return}let t=e.searchParams.get("auth"),s=e.searchParams.get("auth_error");!t&&!s||(e.searchParams.delete("auth"),e.searchParams.delete("auth_error"),window.history.replaceState(null,"",`${e.pathname}${e.search}${e.hash}`),t==="ok"?R("\u5DF2\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165\u3002","ok",3600):s&&R(Sc[s]||"Google \u767B\u5165\u5931\u6557\u3002","danger",6e3))}function Ka(e){Ft&&or(e)}function lr({user:e=null}={}){Ft=document.getElementById("auth-slot"),Ft&&(Lc(),document.addEventListener("click",t=>{t.target.closest(".auth-user")||ir()}),document.addEventListener("keydown",t=>{t.key==="Escape"&&ir()}),e?or(e):ji())}var Ti="judgment.theme",cr="nvidia",Ya=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#0070f3","#171717","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#0066cc","#1d1d1f","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#17171d","#5e6ad2","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#0d99ff","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#0075de","#191918","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],dr=new Map(Ya.map(e=>[e.id,e]));function jc(e){return dr.has(e)}function Tc(e){return dr.get(e)||dr.get(cr)}function ur(){try{let e=window.localStorage.getItem(Ti);return jc(e)?e:cr}catch{return cr}}function pr(e,{persist:t=!0}={}){let s=Tc(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");if(a&&a.setAttribute("content",s.metaColor),document.querySelectorAll(".theme-option").forEach(n=>{let i=n.dataset.themeId===s.id;n.classList.toggle("is-active",i),n.setAttribute("aria-checked",i?"true":"false")}),t)try{window.localStorage.setItem(Ti,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}var Xa="judgment.fontSizes.v1",hr="judgment.appearance",Ii=new Set(["light","dark","system"]),Ei="light",ba=window.matchMedia("(prefers-color-scheme: dark)"),Ec="font-size",va=[{id:"page-title",label:"\u9801\u9762\u6A19\u984C",hint:"\u5404\u9801\u6700\u4E0A\u65B9\u7684 h1 \u6A19\u984C",selectors:[".page-title"],defaultPx:40,min:20,max:72},{id:"home-title",label:"\u9996\u9801\u4E3B\u8996\u89BA\u6A19\u984C",hint:"\u9996\u9801\u6700\u5927\u7684\u4E3B\u6A19\u984C",selectors:[".home-title"],defaultPx:88,min:40,max:140},{id:"section-title",label:"\u5340\u584A\u6A19\u984C",hint:"\u5831\u8868\u3001\u5361\u7247\u8207\u5340\u584A\u6A19\u984C",selectors:[".section-title",".report-title",".side-card-title",".filter-title",".tests-card-title",".status-sidebar-title",".judgment-dialog-head h2"],defaultPx:16,min:10,max:36},{id:"body",label:"\u5167\u6587\u8207\u8AAA\u660E",hint:"\u6BB5\u843D\u3001\u56DE\u7B54\u3001\u8AAA\u660E\u8207\u6458\u8981\u6587\u5B57",selectors:[".answer-text",".page-subtitle",".report-sub",".home-lead",".empty-text",".notice-body p",".citation-snippet",".side-card-body",".detail-list",".field-help",".report-empty-inline",".processing-section-sub",".summary-value-text",".status-summary",".warnings",".law-dialog-warning"],defaultPx:14,min:8,max:28},{id:"table",label:"\u8868\u683C\u5167\u5BB9",hint:"\u8CC7\u6599\u8868\u683C\u7684\u8868\u982D\u8207\u5132\u5B58\u683C",selectors:[".data-table th",".data-table td"],defaultPx:12,min:8,max:24},{id:"meta",label:"\u6A19\u7C64\u8207\u8F14\u52A9\u6587\u5B57",hint:"badge\u3001chip\u3001\u6B04\u4F4D\u6A19\u7C64\u8207 metadata",selectors:[".badge",".chip",".citation-meta",".citation-index",".answer-section-label",".report-kicker",".report-section-title",".eyebrow",".field-label",".summary-label",".metric-label",".footer-bottom",".nav-update-badge"],defaultPx:10,min:7,max:20},{id:"button",label:"\u6309\u9215\u8207\u5C0E\u89BD",hint:"\u64CD\u4F5C\u6309\u9215\u3001\u9801\u9996\u5C0E\u89BD\u8207\u9023\u7D50",selectors:[".btn",".nav-link",".page-btn",".law-link",".judgment-link",".theme-option-name",".theme-option-desc"],defaultPx:13,min:9,max:24},{id:"form",label:"\u8868\u55AE\u8207\u8F38\u5165",hint:"\u8F38\u5165\u6846\u3001\u4E0B\u62C9\u9078\u55AE\u8207 textarea",selectors:["input","textarea","select",".input",".field-input"],defaultPx:14,min:9,max:28},{id:"mono",label:"\u7A0B\u5F0F\u78BC\u8207\u6578\u503C",hint:"\u7B49\u5BEC\u6587\u5B57\u3001\u67E5\u8A62\u8A9E\u53E5\u8207\u7D71\u8A08\u6578\u503C",selectors:[".mono",".cell-mono",".cell-number",".query-code","code",".metric-value",".summary-value",".perf-stat-value",".mini-stat-value"],defaultPx:13,min:8,max:30},{id:"law-page",label:"\u6CD5\u898F\u689D\u6587\uFF08\u9801\u9762\uFF09",hint:"\u6CD5\u898F\u6AA2\u7D22\u7D50\u679C\u8207\u6CD5\u898F\u4F86\u6E90\u5361\u689D\u6587",selectors:[".law-answer-article-text",".law-answer-article-no",".law-source-article-text",".law-source-article-no",".law-article-text",".law-article-no"],excludeAncestors:[".law-dialog"],defaultPx:12,min:9,max:28},{id:"law-dialog",label:"\u6CD5\u898F\u689D\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u6309\u4E0B\u689D\u6587\u5F8C\u958B\u555F\u7684\u6CD5\u898F dialog",selectors:[".law-dialog .law-article-text",".law-dialog .law-article-no",".law-dialog .law-chapter"],defaultPx:16,min:10,max:32},{id:"judgment-dialog",label:"\u5224\u6C7A\u5168\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u5224\u6C7A\u539F\u6587 dialog \u7684\u5168\u6587\u5340\u584A",selectors:[".judgment-dialog-text"],defaultPx:23,min:12,max:48}],Xs=new Map(va.map(e=>[e.id,e])),ha=new WeakMap,gs=Oi(),Ct={...gs},fs=Bi(),mr=new Set,Ys=null,Ks=null,Lt=null,Es=null,Ni=null,Ss=Ec,xs=!1,gr=null,fr=!1,Za="";function Di(e,t,s){return Math.min(s,Math.max(t,e))}function vr(e){return Math.round(e*10)/10}function tn(e){return Number.isInteger(e)?String(e):e.toFixed(1)}function Bi(){try{let e=window.localStorage.getItem(hr);return Ii.has(e)?e:Ei}catch{return Ei}}function Nc(){return fs==="system"?ba.matches?"dark":"light":fs}function Fi(){document.querySelectorAll("[data-appearance-option]").forEach(e=>{let t=e.dataset.appearanceOption===fs;e.classList.toggle("is-active",t),e.setAttribute("aria-pressed",t?"true":"false")})}function en({persist:e=!1}={}){if(document.documentElement.dataset.appearance=Nc(),document.documentElement.dataset.appearanceMode=fs,Fi(),e)try{window.localStorage.setItem(hr,fs)}catch{}}function Rc(e){Ii.has(e)&&(fs=e,en({persist:!0}))}function Ri(){fs==="system"&&en()}typeof ba.addEventListener=="function"?ba.addEventListener("change",Ri):typeof ba.addListener=="function"&&ba.addListener(Ri);function Oi(){let e=null;try{e=JSON.parse(window.localStorage.getItem(Xa)||"null")}catch{e=null}if(!e||typeof e!="object"||Array.isArray(e))return{};let t={};for(let s of va){let a=Number(e[s.id]);Number.isFinite(a)&&(t[s.id]=vr(Di(a,s.min,s.max)))}return t}function Cc(){try{return Object.keys(gs).length?window.localStorage.setItem(Xa,JSON.stringify(gs)):window.localStorage.removeItem(Xa),!0}catch{return!1}}function ya(e){let t=new Set;for(let s of e.selectors)document.querySelectorAll(s).forEach(a=>{a.closest(".settings-sidebar")||Array.isArray(e.excludeAncestors)&&e.excludeAncestors.some(n=>a.closest(n))||t.add(a)});return Array.from(t)}function Hi(){if(!Za)return;let e=Xs.get(Za);if(e)for(let t of ya(e))t.classList.add("font-size-highlight")}function zi(e){if(Zs(),!Xs.get(e))return;Za=e;let s=Lt.querySelector(`.font-size-row[data-font-group="${e}"]`);s&&s.classList.add("is-previewing"),Hi()}function Zs(){Za="",Lt.querySelectorAll(".font-size-row.is-previewing").forEach(e=>e.classList.remove("is-previewing")),document.querySelectorAll(".font-size-highlight").forEach(e=>e.classList.remove("font-size-highlight"))}function Pc(e){if(ha.has(e))return ha.get(e);let t={inline:e.style.fontSize||"",computed:parseFloat(window.getComputedStyle(e).fontSize)||0};return ha.set(e,t),t}function Ic(e){let t=ha.get(e);t&&(t.inline?e.style.fontSize=t.inline:e.style.removeProperty("font-size"))}function Dc(e){let t=Ct[e.id];if(Number.isFinite(t))for(let s of ya(e))Pc(s),s.style.fontSize=`${t}px`}function Bc(e){for(let t of ya(e))Ic(t)}function As(){for(let e of mr){let t=Xs.get(e);t&&Bc(t)}mr=new Set;for(let e of va)Number.isFinite(Ct[e.id])&&(Dc(e),mr.add(e.id));Hi()}function Ui(){As(),xs&&Ss==="font-size"&&$a()}function Gi(){fr||(fr=!0,window.requestAnimationFrame(()=>{fr=!1,As()}))}function Fc(){gr||!document.body||(gr=new MutationObserver(e=>{if(Object.keys(Ct).length){for(let t of e)if(t.type==="childList"&&(t.addedNodes.length||t.removedNodes.length)){Gi();return}}}),gr.observe(document.body,{childList:!0,subtree:!0}))}function Oc(e){let t=e.filter(s=>typeof s.getClientRects=="function"&&s.getClientRects().length);return t.length?t:e}function Hc(){let e=va.filter(t=>ya(t).length>0||Number.isFinite(Ct[t.id]));return e.length?e:va}function sn(e){let t=Ct[e.id];if(Number.isFinite(t))return t;let a=Oc(ya(e)).map(o=>{let l=ha.get(o);return l&&l.computed?l.computed:parseFloat(window.getComputedStyle(o).fontSize)||0}).filter(o=>o>0).sort((o,l)=>o-l);if(!a.length)return e.defaultPx;let n=Math.floor(a.length/2),i=a.length%2?a[n]:(a[n-1]+a[n])/2;return vr(i)}function zc(){let e=[{id:"font-size",label:"\u5B57\u578B\u5927\u5C0F",hint:"\u8ABF\u6574\u5404\u6587\u5B57\u5340\u584A",glyph:'<span class="settings-option-aa" aria-hidden="true">Aa</span>'},{id:"theme",label:"\u4ECB\u9762\u98A8\u683C",hint:"\u5207\u63DB\u54C1\u724C\u8996\u89BA\u8A9E\u8A00",glyph:p("palette",15)}];Es.innerHTML=e.map(t=>`<button class="settings-option${Ss===t.id?" is-active":""}" type="button" role="tab"
        data-settings-panel="${t.id}"
        aria-selected="${Ss===t.id?"true":"false"}">
        <span class="settings-option-icon">${t.glyph}</span>
        <span class="settings-option-copy">
          <strong>${r(t.label)}</strong>
          <small>${r(t.hint)}</small>
        </span>
        ${p("chevronRight",12,"settings-option-chevron")}
      </button>`).join("")}function $a(){Zs();let e=Hc(),t=e.map(s=>{let a=tn(sn(s));return`<section class="font-size-row" data-font-group="${s.id}">
      <div class="font-size-row-head">
        <div class="font-size-row-copy">
          <strong>${r(s.label)}</strong>
          <small>${r(s.hint)}</small>
        </div>
        <label class="font-size-number">
          <input class="input font-size-number-input" type="number"
            min="${s.min}" max="${s.max}" step="0.1"
            value="${a}" aria-label="${r(s.label)} font size" />
          <span>px</span>
        </label>
      </div>
      <input class="font-size-slider" type="range"
        min="${s.min}" max="${s.max}" step="0.1" value="${a}"
        aria-label="${r(s.label)} font size slider" />
      <div class="font-size-preview" style="font-size:${a}px">
        \u5B57\u578B\u9810\u89BD Aa 123 \xB7 ${r(s.label)}
      </div>
    </section>`}).join("");Lt.innerHTML=`<div class="settings-panel-head">
      <div>
        <h3>\u5B57\u578B\u5927\u5C0F</h3>
        <p>\u62C9\u52D5\u6ED1\u687F\u6216\u76F4\u63A5\u8F38\u5165\u6578\u503C\uFF1B\u6E05\u55AE\u53EA\u5217\u51FA\u76EE\u524D\u9801\u9762\u51FA\u73FE\u7684\u6587\u5B57\u5340\u584A\uFF0C\u8B8A\u66F4\u6703\u7ACB\u5373\u5957\u7528\u3002</p>
      </div>
      <span class="badge badge-info">${e.length} \u500B\u5340\u584A</span>
    </div>
    <div class="font-size-list">${t}</div>
    <div class="settings-actions">
      <button class="btn btn-primary btn-sm" type="button" data-settings-action="save">\u5132\u5B58</button>
      <button class="btn btn-secondary btn-sm" type="button" data-settings-action="cancel">\u53D6\u6D88</button>
      <button class="btn btn-ghost btn-sm" type="button" data-settings-action="reset">\u56DE\u5FA9\u9810\u8A2D\u503C</button>
    </div>`}function Uc(){Zs();let e=ur(),t=Ya.map((n,i)=>{let o=n.swatches.map(l=>`<i style="--swatch:${r(l)}"></i>`).join("");return`<button class="theme-option${n.id===e?" is-active":""}" type="button" role="menuitemradio"
      data-theme-id="${r(n.id)}"
      data-theme="${r(n.id)}"
      aria-checked="${n.id===e?"true":"false"}">
      <span class="theme-option-index">${String(i+1).padStart(2,"0")}</span>
      <span class="theme-option-body">
        <span class="theme-option-name">${r(n.name)}</span>
        <span class="theme-option-desc">${r(n.description)}</span>
      </span>
      <span class="theme-option-active-preview" aria-hidden="true">
        ${p("sliders",11)}
        <span>\u4F5C\u7528\u4E2D</span>
        <span class="theme-option-active-preview-badge">2</span>
      </span>
      <span class="theme-option-swatches" aria-hidden="true">${o}</span>
      <span class="theme-option-check" aria-hidden="true">${p("check",14)}</span>
    </button>`}).join(""),a=`<div class="appearance-switch" role="group" aria-label="\u660E\u6697\u6A21\u5F0F">
    ${[{id:"light",label:"\u4EAE"},{id:"dark",label:"\u6697"},{id:"system",label:"\u7CFB\u7D71"}].map(n=>`<button class="appearance-option" type="button"
          data-appearance-option="${n.id}"
          aria-pressed="${fs===n.id?"true":"false"}"
          title="${n.id==="system"?"\u8DDF\u96A8\u7CFB\u7D71\u660E\u6697":`${n.label}\u8272\u6A21\u5F0F`}">${n.label}</button>`).join("")}
  </div>`;Lt.innerHTML=`<div class="settings-panel-head">
      <div>
        <h3>\u4ECB\u9762\u98A8\u683C</h3>
        <p>\u9078\u64C7\u4E3B\u63A7\u53F0\u7684\u54C1\u724C\u8996\u89BA\u8A9E\u8A00\uFF1B\u4E3B\u984C\u6703\u7ACB\u5373\u5957\u7528\u4E26\u4FDD\u7559\u3002</p>
      </div>
      <div class="settings-panel-head-actions">
        <span class="badge badge-info">${Ya.length} \u7A2E</span>
        ${a}
      </div>
    </div>
    <div class="settings-theme-list" role="menu" aria-label="\u4ECB\u9762\u98A8\u683C">${t}</div>`,Fi()}function Gc(){Es.querySelectorAll("[data-settings-panel]").forEach(e=>{let t=e.dataset.settingsPanel===Ss;e.classList.toggle("is-active",t),e.setAttribute("aria-selected",t?"true":"false")})}function $r(e=Ss){Ss=e==="theme"?"theme":"font-size",Gc(),Ss==="theme"?Uc():$a()}function Ci(e,t,s){let a=Number(t);if(!Number.isFinite(a))return;let n=vr(Di(a,e.min,e.max));Ct[e.id]=n;let i=s?.querySelector(".font-size-slider");i&&(i.value=String(n));let o=s?.querySelector(".font-size-preview");o&&(o.style.fontSize=`${n}px`),Gi()}function Qc(){Lt.querySelectorAll(".font-size-row").forEach(e=>{let t=Xs.get(e.dataset.fontGroup);if(!t)return;let s=Ct[t.id]??sn(t),a=e.querySelector(".font-size-number-input");a&&(a.value=tn(s));let n=e.querySelector(".font-size-slider");n&&(n.value=String(s));let i=e.querySelector(".font-size-preview");i&&(i.style.fontSize=`${s}px`)})}function Pi(e){let t=e.target.closest(".font-size-row");if(!t)return;let s=Xs.get(t.dataset.fontGroup);if(!s)return;let a=e.target.classList.contains("font-size-number-input");if(!(a&&e.target.value==="")){if(e.type==="input"&&a){let n=Number(e.target.value);if(!Number.isFinite(n))return;Ci(s,n,t);return}if(Ci(s,e.target.value,t),e.type==="input"){let n=t.querySelector(".font-size-number-input");n&&document.activeElement!==n&&(n.value=tn(Ct[s.id]??sn(s)))}}}function Jc(e){if(!e.target.classList.contains("font-size-number-input"))return;let t=e.target.closest(".font-size-row"),s=t?Xs.get(t.dataset.fontGroup):null;if(!s)return;let a=Ct[s.id]??sn(s);e.target.value=tn(a)}function Wc(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||zi(t.dataset.fontGroup)}function Vc(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Zs()}function Kc(e){let t=e.target.closest(".font-size-row");t&&zi(t.dataset.fontGroup)}function Yc(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Zs()}function Xc(e){let t=e.target.closest("[data-settings-panel]");if(t){$r(t.dataset.settingsPanel);return}let s=e.target.closest("[data-settings-action]");if(s){let i=s.dataset.settingsAction;if(i==="save"){gs={...Ct};let o=Cc();Qc(),R(o?"\u5B57\u578B\u5927\u5C0F\u5DF2\u5132\u5B58\u3002":"\u5B57\u578B\u5927\u5C0F\u5DF2\u5957\u7528\uFF0C\u4F46\u700F\u89BD\u5668\u7121\u6CD5\u5132\u5B58\u8A2D\u5B9A\u3002",o?"ok":"warn");return}if(i==="cancel"){Ct={...gs},As(),$a(),R("\u5DF2\u53D6\u6D88\u672A\u5132\u5B58\u7684\u5B57\u578B\u8B8A\u66F4\u3002","info");return}i==="reset"&&(Ct={},As(),$a(),R("\u5DF2\u56DE\u5FA9\u9810\u8A2D\u5B57\u578B\uFF1B\u6309\u300C\u5132\u5B58\u300D\u4FDD\u7559\u8B8A\u66F4\u3002","info"));return}let a=e.target.closest("[data-appearance-option]");if(a){Rc(a.dataset.appearanceOption);return}let n=e.target.closest(".theme-option");n&&pr(n.dataset.themeId)}function Zc(){xs||(xs=!0,Ct={...gs},document.body.classList.add("settings-open"),Ys.removeAttribute("inert"),Ys.setAttribute("aria-hidden","false"),Ks.setAttribute("aria-expanded","true"),$r(Ss),As(),window.requestAnimationFrame(()=>{let e=Es.querySelector(".settings-option.is-active")||Es.querySelector(".settings-option");e&&e.focus({preventScroll:!0})}))}function br({restoreFocus:e=!0}={}){xs&&(xs=!1,Zs(),Ct={...gs},As(),document.body.classList.remove("settings-open"),e&&Ks.focus({preventScroll:!0}),Ys.setAttribute("aria-hidden","true"),Ys.setAttribute("inert",""),Ks.setAttribute("aria-expanded","false"))}function Qi(){Ys=document.getElementById("settings-sidebar"),Ks=document.getElementById("settings-trigger"),Lt=document.getElementById("settings-panel"),Es=document.getElementById("settings-options"),Ni=document.getElementById("settings-close"),!(!Ys||!Ks||!Lt||!Es)&&(en(),pr(ur(),{persist:!1}),zc(),$a(),Fc(),As(),Ks.addEventListener("click",()=>{xs?br():Zc()}),Ni?.addEventListener("click",()=>br()),Es.addEventListener("click",e=>{let t=e.target.closest("[data-settings-panel]");t&&$r(t.dataset.settingsPanel)}),Lt.addEventListener("click",Xc),Lt.addEventListener("input",Pi),Lt.addEventListener("change",Pi),Lt.addEventListener("blur",Jc,!0),Lt.addEventListener("pointerover",Wc),Lt.addEventListener("pointerout",Vc),Lt.addEventListener("focusin",Kc),Lt.addEventListener("focusout",Yc),Lt.addEventListener("keydown",e=>{e.key==="Enter"&&e.target.classList.contains("font-size-number-input")&&(e.preventDefault(),e.target.blur())}),document.addEventListener("keydown",e=>{e.key==="Escape"&&xs&&br()}),window.addEventListener("storage",e=>{if(e.key===hr){fs=Bi(),en();return}e.key===Xa&&(gs=Oi(),xs||(Ct={...gs},As()))}))}var Wi=["rag","data","quality","performance","processing","status"],rn={rag:"RAG \u63D0\u554F",data:"\u8CC7\u6599\u5EAB",quality:"\u8CC7\u6599\u54C1\u8CEA",performance:"\u6548\u80FD\u5831\u8868",processing:"\u8CC7\u6599\u8655\u7406",status:"\u7CFB\u7D71\u72C0\u614B"},Je={loaded:!1,admin:!1,enabled:!1,features:{},expiresAt:null,reason:"",me:null},Vi="judgment.demo_context.v1",ed=300*1e3;function Ki(){try{let e=JSON.parse(window.localStorage.getItem(Vi)||"null");return!e||typeof e!="object"||Date.now()-Number(e.saved_at||0)>ed||typeof e.admin!="boolean"?null:e}catch{return null}}function Yi(e){return e&&(Je.admin=!!e.admin,Je.enabled=!!e.enabled,Je.features=e.features||{},Je.expiresAt=e.expiresAt||null,Je.reason=e.reason||"",Je.me=e.me||null,Je.loaded=!0),Je}function td(){try{window.localStorage.setItem(Vi,JSON.stringify({admin:Je.admin,enabled:Je.enabled,features:Je.features,expiresAt:Je.expiresAt,reason:Je.reason,me:Je.me,saved_at:Date.now()}))}catch{}}function ta(){return!!Je.admin}function Kt(){return!Je.admin}function Xi(){return!!Je.enabled}function yr(e){return Je.admin?!0:e==="home"?Je.enabled:!!(Je.enabled&&Je.features?.[e])}function sd(e){return rn[e]||e}function on(e){if(!e)return"\u2014";let t=Date.parse(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.round((t-Date.now())/1e3));if(s<=0)return"\u5DF2\u5230\u671F";let a=Math.floor(s/3600),n=Math.floor(s%3600/60);return a>0?`${a} \u5C0F\u6642 ${n} \u5206`:`${Math.max(1,n)} \u5206`}async function ln(){let e=await Promise.allSettled([Q.authMe()]),t=e[0].status==="fulfilled"?e[0].value:null,s=t?.demo||await Q.demoStatus().catch(()=>null);return Je.admin=!!t?.admin,Je.enabled=!!s?.enabled,Je.features=s?.features||{},Je.expiresAt=s?.expires_at||null,Je.reason=s?.reason||"",Je.me=t,Je.loaded=!0,td(),Je.admin&&(Je.enabled=!1),Je}function Rs(){let e=!Je.admin,t=!!Je.enabled;document.body.classList.toggle("is-demo-visitor",e&&t),document.body.classList.toggle("is-demo-closed",e&&!t),document.body.classList.toggle("is-admin",Je.admin),document.querySelectorAll("[data-route]").forEach(a=>{let n=a.dataset.route||"";if(!e){a.hidden=!1;return}if(n==="tests"){a.hidden=!0;return}a.hidden=!Je.enabled||!yr(n)});let s=document.getElementById("demo-banner");s&&(e&&t?(s.hidden=!1,s.innerHTML=`<span class="demo-banner-dot" aria-hidden="true"></span>
      <strong>\u5C55\u793A\u6A21\u5F0F</strong>
      <span>\u5269\u9918 ${r(on(Je.expiresAt))}</span>
      <span class="demo-banner-note">\u53EF\u700F\u89BD\u5B8C\u6574\u8CC7\u6599\u9801\uFF1B\u7BA1\u7406\u64CD\u4F5C\u5DF2\u9396\u5B9A</span>`):(s.hidden=!0,s.innerHTML=""))}function Zi(e){e.innerHTML=`<section class="page demo-closed-page">
    <div class="demo-state-card">
      <div class="demo-state-mark">${p("shield",22)}</div>
      <div class="eyebrow">DEMO MODE</div>
      <h1 class="page-title">\u5C55\u793A\u76EE\u524D\u672A\u958B\u653E</h1>
      <p class="page-subtitle">
        \u6B64\u7DB2\u7AD9\u50C5\u5728\u9762\u8A66\u5C55\u793A\u671F\u9593\u66AB\u6642\u958B\u653E\u3002\u82E5\u4F60\u662F\u7BA1\u7406\u8005\uFF0C\u8ACB\u7531\u53F3\u4E0A\u89D2\u767B\u5165\u3002
      </p>
      <div class="demo-state-actions">
        <a class="btn btn-secondary" href="https://github.com/solo0920/judgment" target="_blank" rel="noopener noreferrer">\u67E5\u770B\u5C08\u6848</a>
      </div>
    </div>
  </section>`}function wr(e,t){e.innerHTML=`<section class="page demo-closed-page">
    <div class="demo-state-card">
      <div class="demo-state-mark">${p("shield",22)}</div>
      <div class="eyebrow">DEMO MODE</div>
      <h1 class="page-title">\u6B64\u529F\u80FD\u76EE\u524D\u672A\u958B\u653E\u5C55\u793A</h1>
      <p class="page-subtitle">
        ${r(t==="tests"?"\u7CFB\u7D71\u6E2C\u8A66":sd(t))}\u76EE\u524D\u7531\u7BA1\u7406\u8005\u95DC\u9589\uFF1B\u5C55\u793A\u671F\u9593\u4ECD\u53EF\u5207\u63DB\u5176\u4ED6\u5DF2\u958B\u653E\u529F\u80FD\u3002
      </p>
      <div class="demo-state-actions">
        <a class="btn btn-primary" href="#/home">\u56DE\u5230\u9996\u9801</a>
      </div>
    </div>
  </section>`}function cn(){return`<section class="page demo-closed-page">
    <div class="demo-state-card">
      <div class="demo-state-mark">${p("shield",22)}</div>
      <div class="eyebrow">ADMIN ONLY</div>
      <h1 class="page-title">\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650</h1>
      <p class="page-subtitle">\u8ACB\u7531\u53F3\u4E0A\u89D2\u4EE5\u7BA1\u7406\u8005 Google \u5E33\u865F\u767B\u5165\u3002</p>
    </div>
  </section>`}function Cs(e,t){return`<div class="demo-lock-card">
    <span class="demo-lock-icon">${p("shield",18)}</span>
    <div class="demo-lock-copy">
      <strong>${r(e||"\u6B64\u529F\u80FD\u7531\u7BA1\u7406\u8005\u64CD\u4F5C")}</strong>
      <p>${r(t||"\u5C55\u793A\u6A21\u5F0F\u50C5\u63D0\u4F9B\u6AA2\u8996\uFF0C\u57F7\u884C\u3001\u8A2D\u5B9A\u8207\u7BA1\u7406\u6309\u9215\u5DF2\u9396\u5B9A\u3002")}</p>
      <span class="badge badge-neutral badge-mono">\u5C55\u793A\u6A21\u5F0F \xB7 \u552F\u8B80</span>
    </div>
  </div>`}var jt=null,wa=0,Ns=null,ea={x:0,y:0};function ad(){return jt?.isConnected||(jt=document.createElement("div"),jt.className="demo-lock-tooltip",jt.setAttribute("role","tooltip"),jt.hidden=!0,document.body.appendChild(jt)),jt}function eo(){if(!jt||jt.hidden)return;let e=18,t=jt.getBoundingClientRect(),s=ea.x+e,a=ea.y+14;s+t.width>window.innerWidth-8&&(s=ea.x-t.width-e),a+t.height>window.innerHeight-8&&(a=ea.y-t.height-14),jt.style.transform=`translate3d(${Math.round(Math.max(8,s))}px, ${Math.round(Math.max(8,a))}px, 0)`}function nd(e){let t=String(e?.dataset.demoLockTooltip||"").trim();if(!t)return;let s=ad();s.textContent=t,s.hidden=!1,eo()}function an(){wa&&(window.clearTimeout(wa),wa=0),Ns=null,jt&&(jt.hidden=!0)}function Ji(e,t,s){!e||Ns===e||(an(),Ns=e,ea={x:t,y:s},wa=window.setTimeout(()=>{wa=0,Ns===e&&nd(e)},200))}function nn(){nn.installed||(nn.installed=!0,document.addEventListener("pointerover",e=>{let t=e.target.closest?.("[data-demo-lock-tooltip]");t&&Ji(t,e.clientX,e.clientY)}),document.addEventListener("pointermove",e=>{Ns&&(ea={x:e.clientX,y:e.clientY},jt&&!jt.hidden&&eo())}),document.addEventListener("pointerout",e=>{if(!Ns)return;let t=e.relatedTarget;t&&Ns.contains?.(t)||an()}),document.addEventListener("focusin",e=>{let t=e.target.closest?.("[data-demo-lock-tooltip]");if(!t)return;let s=t.getBoundingClientRect();Ji(t,s.right,s.top)}),document.addEventListener("focusout",()=>an()),window.addEventListener("scroll",an,{capture:!0,passive:!0}))}var _r={};us(_r,{render:()=>ld});var rd=[{hours:2,label:"2 \u5C0F\u6642"},{hours:24,label:"24 \u5C0F\u6642"},{hours:168,label:"7 \u5929"}];function id(e,t){return`<label class="demo-toggle-row" for="demo-feature-${e}">
    <span class="demo-toggle-copy">
      <strong>${r(rn[e]||e)}</strong>
      <small>${t?"\u8A2A\u5BA2\u53EF\u4F7F\u7528\u6B64\u529F\u80FD\u7684\u552F\u8B80\uFF0F\u516C\u958B\u90E8\u5206":"\u76EE\u524D\u672A\u958B\u653E\u7D66\u8A2A\u5BA2"}</small>
    </span>
    <span class="demo-switch">
      <input type="checkbox" id="demo-feature-${e}" data-demo-feature="${e}" aria-label="${r(rn[e]||e)}" ${t?"checked":""} />
      <span aria-hidden="true"></span>
    </span>
  </label>`}function od(e){return e?.length?`<div class="demo-audit-list">${e.map(t=>`<div class="demo-audit-row">
        <span>${r(t.created_at||"\u2014")}</span>
        <strong>${r(t.action||"\u2014")}</strong>
        <small>${r(t.actor_email||"\u2014")}</small>
      </div>`).join("")}</div>`:'<div class="demo-empty">\u5C1A\u7121\u5207\u63DB\u7D00\u9304\u3002</div>'}async function ld(e){if(!ta()){e.innerHTML=cn();return}e.innerHTML=`<section class="page admin-page">
    <div class="page-header">
      <div class="data-page-heading">
        <div class="eyebrow">ADMIN SETTINGS</div>
        <div class="data-title-line">
          <h1 class="page-title">\u7BA1\u7406\u8A2D\u5B9A</h1>
          <p class="page-subtitle data-page-subtitle">\u63A7\u5236\u9762\u8A66\u5C55\u793A\u671F\u9593\u5C0D\u5916\u958B\u653E\u7684\u529F\u80FD\uFF1B\u95DC\u9589\u7E3D\u958B\u95DC\u5F8C\uFF0C\u8A2A\u5BA2\u4E0B\u4E00\u500B\u8ACB\u6C42\u5373\u5931\u6548\u3002</p>
        </div>
      </div>
      <div class="page-actions">
        <span class="badge badge-neutral badge-mono" id="demo-admin-badge">DEMO \xB7 \u8B80\u53D6\u4E2D</span>
      </div>
    </div>
    <div class="status-layout admin-layout">
      <aside class="status-sidebar" aria-label="\u7BA1\u7406\u8A2D\u5B9A\u5206\u985E">
        <div class="status-sidebar-head">
          <div class="eyebrow">ADMIN</div>
          <div class="status-sidebar-title">\u8A2D\u5B9A\u5206\u985E</div>
        </div>
        <nav class="status-tab-list">
          <button class="status-tab is-active" type="button" aria-current="page">
            <span class="status-tab-icon">${p("sliders",15)}</span>
            <span class="status-tab-copy"><strong>\u5C55\u793A\u6A21\u5F0F</strong><small>\u7E3D\u958B\u95DC\u3001\u529F\u80FD\u8207\u5230\u671F</small></span>
          </button>
        </nav>
        <div class="status-sidebar-foot">
          <span>\u7BA1\u7406\u54E1</span>
          <span class="mono">solo4study@gmail.com</span>
        </div>
      </aside>
      <section class="status-panel" id="demo-admin-panel">
        <div class="processing-loading"><span class="spinner"></span><span>\u8B80\u53D6\u5C55\u793A\u8A2D\u5B9A\u2026</span></div>
      </section>
    </div>
  </section>`;let t=e.querySelector("#demo-admin-panel"),s=e.querySelector("#demo-admin-badge"),a=null,n=0,i=()=>{let d=t.querySelector("[data-demo-remaining]");d&&(d.textContent=on(a?.effective?.expires_at))},o=()=>{if(!a)return;let d=a.stored||{},m=a.effective||{},f=a.usage||{},y=d.features||{},v=!!m.enabled,u=!!a.hard_disabled;s.textContent=v?"DEMO \xB7 \u5DF2\u958B\u555F":"DEMO \xB7 \u5DF2\u95DC\u9589",s.classList.toggle("badge-ok",v),s.classList.toggle("badge-danger",!v),t.innerHTML=`<div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">DEMO MODE</div>
          <div class="report-title">\u5C55\u793A\u6A21\u5F0F</div>
          <div class="report-sub">
            \u5BE6\u969B\u751F\u6548\uFF1A<strong>${v?"\u958B\u555F":"\u95DC\u9589"}</strong>
            ${m.reason?` \xB7 \u539F\u56E0\uFF1A${r(m.reason)}`:""}
          </div>
        </div>
        <div class="demo-status-pill ${v?"is-on":"is-off"}">${v?"ON":"OFF"}</div>
      </div>
      <div class="report-section">
        ${u?`<div class="notice notice-danger" role="alert">
                <span class="notice-icon" aria-hidden="true">${p("alert",12)}</span>
                <div class="notice-body"><strong>\u74B0\u5883\u8B8A\u6578\u5F37\u5236\u95DC\u9589</strong>
                <p>JUDGMENT_DEMO_HARD_DISABLE=1\uFF0CDB \u958B\u95DC\u76EE\u524D\u7121\u6548\u3002</p></div>
              </div>`:""}
        <div class="demo-admin-stats">
          <div><span>\u5269\u9918\u6642\u9593</span><strong data-demo-remaining>${r(on(m.expires_at))}</strong></div>
          <div><span>\u4ECA\u65E5\u63D0\u554F</span><strong>${c(f.requests||0)}</strong></div>
          <div><span>\u4ECA\u65E5 tokens</span><strong>${c(f.tokens||0)}</strong></div>
          <div><span>\u8A2D\u5B9A\u7248\u672C</span><strong>${c(d.version||0)}</strong></div>
        </div>

        <div class="demo-master-row">
          <div>
            <strong>\u7E3D\u958B\u95DC\uFF08\u5132\u5B58\u5F8C\u751F\u6548\uFF09</strong>
            <small>\u95DC\u9589\u6642\u53EA\u4FDD\u7559\u9996\u9801\u975C\u614B\u9801\u8207\u7BA1\u7406\u8005\u767B\u5165\uFF1B\u8A2A\u5BA2 API \u5168\u90E8\u62D2\u7D55\u3002\u529F\u80FD\u65D7\u6A19\u4ECD\u53EF\u5148\u8A2D\u5B9A\u4E26\u5132\u5B58\u3002</small>
          </div>
          <span class="demo-switch demo-switch-lg">
            <input type="checkbox" id="demo-enabled" aria-label="\u5C55\u793A\u6A21\u5F0F\u7E3D\u958B\u95DC" ${d.enabled?"checked":""} />
            <span aria-hidden="true"></span>
          </span>
        </div>

        <div class="demo-feature-list">
          ${Wi.map(S=>id(S,!!y[S])).join("")}
        </div>

        <div class="demo-open-controls">
          <label class="field-label" for="demo-duration">\u958B\u653E\u6642\u9593</label>
          <select class="select" id="demo-duration">
            ${rd.map(S=>`<option value="${S.hours}">${S.label}</option>`).join("")}
          </select>
          <button class="btn btn-secondary" type="button" id="demo-save">
            ${p("check",15)}<span>\u5132\u5B58\u8A2D\u5B9A</span>
          </button>
          <button class="btn btn-success" type="button" id="demo-open">
            ${p("play",15)}<span>\u958B\u555F\u5C55\u793A</span>
          </button>
          <button class="btn btn-danger" type="button" id="demo-close">
            ${p("x",15)}<span>\u7ACB\u5373\u95DC\u9589\u5C55\u793A</span>
          </button>
        </div>
        <p class="demo-open-hint">
          \u300C\u5132\u5B58\u8A2D\u5B9A\u300D\u53EA\u4FDD\u5B58\u529F\u80FD\u65D7\u6A19\u8207\u671F\u9650\uFF0C\u4E0D\u6703\u6539\u8B8A\u76EE\u524D\u958B\u95DC\uFF1B\u300C\u958B\u555F\u5C55\u793A\u300D\u6703\u4F9D\u4E0A\u65B9\u65D7\u6A19\u7ACB\u5373\u5C0D\u8A2A\u5BA2\u958B\u653E\u3002
        </p>

        <div class="demo-admin-section">
          <div class="report-section-head"><span class="report-section-title">\u6700\u8FD1\u5207\u63DB\u7D00\u9304</span></div>
          ${od(a.audit)}
        </div>
      </div>
    </div>`;let b=t.querySelector("#demo-enabled"),w=[...t.querySelectorAll("[data-demo-feature]")],k=()=>Object.fromEntries(w.map(S=>[S.dataset.demoFeature,S.checked])),A=async(S,{enabled:$,label:T})=>{S.disabled=!0;let K=Number(t.querySelector("#demo-duration")?.value||2),G=k();if($&&!Object.values(G).some(Boolean)){R("\u8ACB\u81F3\u5C11\u958B\u555F\u4E00\u500B\u529F\u80FD\uFF0C\u624D\u80FD\u958B\u555F\u5C55\u793A\u3002","warn",5200),S.disabled=!1;return}try{a=await Q.updateDemo({enabled:$,duration_hours:$?K:null,features:G,version:a?.stored?.version}),R(T,"ok",3200),o()}catch(fe){R(fe.message||"\u7121\u6CD5\u66F4\u65B0\u5C55\u793A\u8A2D\u5B9A\u3002","danger",6e3)}finally{S.disabled=!1}};t.querySelector("#demo-save")?.addEventListener("click",S=>{A(S.currentTarget,{enabled:!!b?.checked,label:b?.checked?"\u5C55\u793A\u8A2D\u5B9A\u5DF2\u5132\u5B58\uFF0C\u5C55\u793A\u4ECD\u7DAD\u6301\u958B\u555F\u3002":"\u5C55\u793A\u8A2D\u5B9A\u5DF2\u5132\u5B58\uFF0C\u5C55\u793A\u4ECD\u7DAD\u6301\u95DC\u9589\u3002"})}),t.querySelector("#demo-open")?.addEventListener("click",S=>{A(S.currentTarget,{enabled:!0,label:"\u5C55\u793A\u6A21\u5F0F\u5DF2\u958B\u555F\u3002"})}),t.querySelector("#demo-close")?.addEventListener("click",async S=>{let $=S.currentTarget;$.disabled=!0;try{a=await Q.closeDemo(),R("\u5C55\u793A\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok",3200),o()}catch(T){R(T.message||"\u7121\u6CD5\u95DC\u9589\u5C55\u793A\u6A21\u5F0F\u3002","danger",6e3)}finally{$.disabled=!1}}),n&&window.clearInterval(n),n=window.setInterval(i,1e3)};return await(async()=>{try{a=await Q.adminDemo(),o()}catch(d){t.innerHTML=`<div class="report-card"><div class="report-head">
        <div class="report-title-group"><div class="report-kicker">ADMIN SETTINGS</div>
        <div class="report-title">\u7121\u6CD5\u8B80\u53D6\u5C55\u793A\u8A2D\u5B9A</div>
        <div class="report-sub">${r(d.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}</div></div>
      </div></div>`}})(),()=>{n&&window.clearInterval(n),n=0}}var Tr={};us(Tr,{render:()=>wd});function cd(e){let t=e&&typeof e=="object"?e:{},s=t.judgment_total,a=t.financial_total,n=Number(s),i=Number(a),o=s!=null&&Number.isFinite(n)&&n>=0,l=a!=null&&Number.isFinite(i)&&i>=0;return{total:o?n:null,financial:l?i:null,ratio:o&&l&&n>0?i/n*100:null}}function ls(e,{loading:t=!1}={}){let s=cd(e),a=t?"\u8B80\u53D6\u4E2D\u2026":c(s.total),n=t?"\u8B80\u53D6\u4E2D\u2026":c(s.financial),i=t?"\u8B80\u53D6\u4E2D\u2026":s.ratio===null?"\u2014":`${s.ratio.toFixed(1)}%`;return`<div class="processing-summary-card">
    <span class="processing-summary-label">\u5224\u6C7A\u7E3D\u4EF6\u6578</span>
    <span class="processing-summary-value mono" data-judgment-stat="total">${a}</span>
    <span class="processing-summary-hint">\u5168\u90E8\u5DF2\u5099\u4EFD\u5224\u6C7A</span>
  </div>
  <div class="processing-summary-card">
    <span class="processing-summary-label">\u91D1\u878D\u76F8\u95DC\u7E3D\u4EF6\u6578</span>
    <span class="processing-summary-value mono" data-judgment-stat="financial">${n}</span>
    <span class="processing-summary-hint">PostgreSQL current \u5224\u6C7A</span>
  </div>
  <div class="processing-summary-card is-ratio">
    <span class="processing-summary-label">JUDGMENT COVERAGE \xB7 \u91D1\u878D\u6848\u4EF6\u4F54\u6BD4</span>
    <span class="processing-summary-value mono" data-judgment-stat="ratio">${i}</span>
    <span class="processing-summary-hint">\u91D1\u878D\u76F8\u95DC\u5224\u6C7A\u5360\u5168\u90E8\u5DF2\u5099\u4EFD\u5224\u6C7A\u7684\u6BD4\u4F8B\u3002</span>
  </div>`}var kr=11,dd=15e3,to="judgment.home.summary.v1",dn=new Set,ud=[{route:"rag",icon:"message",kicker:"RAG",title:"RAG \u63D0\u554F",summary:"\u7528\u81EA\u7136\u8A9E\u8A00\u627E\u5230\u76F8\u4F3C\u5224\u6C7A\u8207\u73FE\u884C\u6CD5\u898F\uFF0C\u56DE\u7B54\u9644\u4E0A\u53EF\u56DE\u6EAF\u7684\u5F15\u7528\u3002",metric:"Citations first",tone:"feature",wide:!0,metricKey:"rag"},{route:"data",icon:"database",kicker:"EXPLORE",title:"\u8CC7\u6599\u5EAB\u67E5\u8A62",summary:"\u8DE8 PostgreSQL\u3001Parquet\u3001Qdrant \u8207 IndexedDB \u6AA2\u8996\u539F\u59CB\u8CC7\u6599\u3002",metric:"4 \u7A2E\u8CC7\u6599\u4F86\u6E90",tone:"blue",metricKey:"data"},{route:"quality",icon:"shield",kicker:"QUALITY",title:"\u8CC7\u6599\u54C1\u8CEA",summary:"\u7528 DuckDB \u6AA2\u67E5\u539F\u59CB\u5224\u6C7A\u7684\u91CD\u8907\u3001\u7F3A\u6F0F\u8207\u5F15\u7528\u4E00\u81F4\u6027\u3002",metric:"DuckDB native",tone:"green",metricKey:"quality"},{route:"performance",icon:"activity",kicker:"OBSERVE",title:"\u6548\u80FD\u5831\u8868",summary:"\u5F9E\u55AE\u6B21 RAG \u5230\u7D22\u5F15\u5EFA\u7F6E\uFF0C\u8FFD\u8E64\u6BCF\u500B\u968E\u6BB5\u7684\u8017\u6642\u8207\u74F6\u9838\u3002",metric:"Flow \xB7 Waterfall",tone:"amber",metricKey:"performance"},{route:"processing",icon:"sliders",kicker:"PIPELINE",title:"\u8CC7\u6599\u8655\u7406",summary:"\u4E0B\u8F09\u3001\u532F\u5165\u3001\u5099\u4EFD\u8207\u7D22\u5F15\uFF0C\u96C6\u4E2D\u7BA1\u7406\u8CC7\u6599\u751F\u547D\u9031\u671F\u3002",metric:"End-to-end",tone:"violet",metricKey:"processing"},{route:"status",icon:"server",kicker:"STATUS",title:"\u7CFB\u7D71\u72C0\u614B",summary:"\u6AA2\u8996\u670D\u52D9\u5065\u5EB7\u3001\u8F09\u5165 Pipeline\u3001\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207 API \u76EE\u9304\u3002",metric:"10 \u670D\u52D9\u5143\u4EF6",tone:"slate",metricKey:"status"},{route:"tests",icon:"check",kicker:"VERIFY",title:"\u7CFB\u7D71\u6E2C\u8A66",summary:"\u8A2D\u5B9A API Base\uFF0C\u6E2C\u8A66 LLM \u6A21\u578B\u8207 Reranker \u670D\u52D9\u3002",metric:"LLM \xB7 Reranker",tone:"rose",metricKey:"tests"}];function sa(e,t=1){let s=Number(e);return Number.isFinite(s)?`${s.toFixed(t)}%`:"\u2014"}function xr(e){let t=e?.year_min,s=e?.year_max;return!t&&!s?"\u2014":t&&s&&t!==s?`${t}\u2013${s}`:String(t||s)}function ao(e){let t=Number(e?.year_span);return Number.isFinite(t)&&t>0?`${t} \u5E74`:"\u2014"}function pd(e){return`<a class="home-tile tone-${r(e.tone)}${e.wide?" is-wide":""}" href="#/${e.route}">
    <span class="home-tile-watermark" aria-hidden="true">${p(e.icon,148)}</span>
    <span class="home-tile-head">
      <span class="home-tile-icon">${p(e.icon,22)}</span>
      <span class="home-tile-kicker">${r(e.kicker)}</span>
    </span>
    <span class="home-tile-copy">
      <strong>${r(e.title)}</strong>
      <span>${r(e.summary)}</span>
    </span>
    <span class="home-tile-foot">
      <span class="home-tile-metric" data-home-tile-metric="${r(e.metricKey)}">${r(e.metric)}</span>
      <span class="home-tile-cta">\u63A2\u7D22 ${p("arrowRight",13)}</span>
    </span>
  </a>`}function Ar(e,{loading:t=!1}={}){let s=e?.laws||{},a=n=>t?"\u8B80\u53D6\u4E2D\u2026":c(n);return`<div class="processing-summary-card">
    <span class="processing-summary-label">\u6CD5\u898F</span>
    <span class="processing-summary-value mono" data-home-law-stat="law">${a(s.law_count)}</span>
    <span class="processing-summary-hint">\u5168\u570B\u6CD5\u898F\u8CC7\u6599\u5EAB current \u7248\u672C</span>
  </div>
  <div class="processing-summary-card">
    <span class="processing-summary-label">\u547D\u4EE4</span>
    <span class="processing-summary-value mono" data-home-law-stat="order">${a(s.order_count)}</span>
    <span class="processing-summary-hint">\u73FE\u884C\u547D\u4EE4\u8207\u7D30\u5247</span>
  </div>
  <div class="processing-summary-card is-ratio">
    <span class="processing-summary-label">\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587</span>
    <span class="processing-summary-value mono" data-home-law-stat="articles">${a(s.article_count)}</span>
    <span class="processing-summary-hint">${t?"\u689D\u6587\u7D22\u5F15\u4F86\u6E90":`\u6CD5\u898F ${c(s.law_article_count)} \xB7 \u547D\u4EE4 ${c(s.order_article_count)}`}</span>
  </div>`}function md(e,{loading:t=!1}={}){if(t)return`<div class="home-live-rows is-loading">
      <span class="skeleton skeleton-line"></span>
      <span class="skeleton skeleton-line"></span>
      <span class="skeleton skeleton-line"></span>
      <span class="skeleton skeleton-line"></span>
    </div>`;let s=e?.laws||{},a=e?.judgments||{},n=e?.rag?.judgment_index||{};return`<div class="home-live-rows">
    <div class="home-live-row">
      <span class="home-live-label">\u6CD5\u898F\uFF0F\u547D\u4EE4</span>
      <span class="home-live-value mono">${c(s.law_count)} <i>/</i> ${c(s.order_count)}</span>
    </div>
    <div class="home-live-row">
      <span class="home-live-label">\u91D1\u878D\u5224\u6C7A</span>
      <span class="home-live-value mono" data-home-live="judgments">${c(a.financial_total)}</span>
    </div>
    <div class="home-live-row">
      <span class="home-live-label">\u88C1\u5224\u5E74\u4EFD</span>
      <span class="home-live-value mono">${r(xr(a))} <i>\xB7</i> ${r(ao(a))}</span>
    </div>
    <div class="home-live-row">
      <span class="home-live-label">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15</span>
      <span class="home-live-value mono">${c(n.indexed)} <i>\xB7</i> ${r(sa(n.coverage_pct))}</span>
    </div>
  </div>`}function pn(e,{loading:t=!1,error:s="",generatedAt:a=""}={}){return s?`<div class="home-live-error" role="status">
      <span class="home-live-error-icon">${p("alert",18)}</span>
      <div>
        <strong>\u5373\u6642\u6458\u8981\u66AB\u6642\u7121\u6CD5\u53D6\u5F97</strong>
        <p>${r(s)}</p>
        <button class="btn btn-secondary btn-sm" type="button" id="home-retry">
          ${p("refresh",13)}<span>\u91CD\u65B0\u8F09\u5165</span>
        </button>
      </div>
    </div>`:`${md(e,{loading:t})}
    <div class="home-live-foot">
      <span class="home-live-source">${p("link",12)}\u53F8\u6CD5\u9662 OpenData \xB7 \u5168\u570B\u6CD5\u898F\u8CC7\u6599\u5EAB</span>
      <span class="home-live-time">${t||!a?"\u540C\u6B65\u4E2D\u2026":`\u66F4\u65B0 ${$e(a)}`}</span>
    </div>`}function qr(e,{loading:t=!1}={}){if(t)return`<span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>
      <span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>
      <span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>`;let s=e?.judgments||{},a=e?.raw||{},n=e?.rag?.judgment_index||{};return`<span class="home-fact">
      <span class="home-fact-label">\u539F\u59CB\u5224\u6C7A\u5099\u4EFD</span>
      <strong>${c(a.raw_total)}</strong>
      <small>${c(a.archive_count)} \u500B archive \xB7 \u53F8\u6CD5\u9662 OpenData</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">\u91D1\u878D\u5224\u6C7A\u5E74\u4EFD</span>
      <strong>${r(xr(s))}</strong>
      <small>${r(ao(s))} \xB7 ${c(s.financial_total)} \u7B46 current</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">\u5411\u91CF\u7D22\u5F15\u8986\u84CB</span>
      <strong>${r(sa(n.coverage_pct))}</strong>
      <small>${c(n.indexed)} / ${c(n.total)} \u7B46 \xB7 ${r(n.model||"\u2014")}</small>
    </span>`}function un(e,t){let s=t?.laws||{},a=t?.judgments||{},n=t?.raw||{},i=t?.sources||{};if(e==="opendata"){let l=i.opendata||{};return`<article class="home-source-card">
      <div class="home-source-head">
        <span class="home-source-icon">${p("cloud",20)}</span>
        <div>
          <strong>${r(l.label||"\u53F8\u6CD5\u9662\u8CC7\u6599\u958B\u653E\u5E73\u81FA")}</strong>
          <small>\u88C1\u5224\u66F8\u539F\u59CB\u8CC7\u6599</small>
        </div>
        <a class="home-source-link" href="${r(It(l.url,"https://opendata.judicial.gov.tw/"))}" target="_blank" rel="noopener noreferrer">${p("external",12)}\u4F86\u6E90</a>
      </div>
      <p class="home-source-copy">\u5224\u6C7A\u5168\u6587\u3001\u6848\u865F\u3001\u6CD5\u9662\u3001\u88C1\u5224\u65E5\u671F\u8207 PDF \u9023\u7D50\u7686\u4FDD\u7559\u539F\u59CB\u6B04\u4F4D\uFF1B\u532F\u5165\u524D\u5148\u5BEB\u5165\u4E0D\u53EF\u8B8A\u7684 raw Parquet \u5099\u4EFD\u3002</p>
      <dl class="home-source-facts">
        <div><dt>\u539F\u59CB\u5224\u6C7A</dt><dd>${c(n.raw_total)}</dd></div>
        <div><dt>Archive</dt><dd>${c(n.archive_count)}</dd></div>
        <div><dt>\u88C1\u5224\u5E74\u4EFD</dt><dd>${r(xr(a))}</dd></div>
        <div><dt>\u5206\u985E\u4EE3\u78BC</dt><dd>${r(l.category||"051")}</dd></div>
      </dl>
      <div class="home-source-flow"><span>RAR</span>${p("arrowRight",11)}<span>raw Parquet</span>${p("arrowRight",11)}<span>PostgreSQL</span></div>
    </article>`}let o=i.laws||{};return`<article class="home-source-card">
    <div class="home-source-head">
      <span class="home-source-icon">${p("layers",20)}</span>
      <div>
        <strong>${r(o.label||"\u5168\u570B\u6CD5\u898F\u8CC7\u6599\u5EAB")}</strong>
        <small>\u6CD5\u898F\u3001\u547D\u4EE4\u8207\u689D\u6587\u7248\u672C</small>
      </div>
      <a class="home-source-link" href="${r(It(o.url,"https://law.moj.gov.tw/"))}" target="_blank" rel="noopener noreferrer">${p("external",12)}\u4F86\u6E90</a>
    </div>
    <p class="home-source-copy">\u4EE5\u5B98\u65B9 JSON \u7AEF\u9EDE\u4E0B\u8F09\u73FE\u884C\u6CD5\u898F\u8207\u547D\u4EE4\uFF0C\u4FDD\u7559\u7248\u672C\u3001\u689D\u6587\u8207\u8B8A\u66F4\u4E8B\u4EF6\uFF1B\u5224\u6C7A\u5F15\u7528\u53EF\u56DE\u5230\u5C0D\u61C9\u689D\u865F\u3002</p>
    <dl class="home-source-facts">
      <div><dt>\u6CD5\u898F</dt><dd>${c(s.law_count)}</dd></div>
      <div><dt>\u547D\u4EE4</dt><dd>${c(s.order_count)}</dd></div>
      <div><dt>\u689D\u6587</dt><dd>${c(s.article_count)}</dd></div>
      <div><dt>\u8CC7\u6599\u7248\u672C</dt><dd>${c(s.version_count)}</dd></div>
    </dl>
    <div class="home-source-flow"><span>ZIP</span>${p("arrowRight",11)}<span>Parquet</span>${p("arrowRight",11)}<span>PostgreSQL</span>${p("arrowRight",11)}<span>Qdrant</span></div>
  </article>`}function Mr(e,{loading:t=!1,error:s=""}={}){if(t)return'<div class="home-laws-loading skeleton skeleton-card"></div>';if(s)return`<div class="home-laws-error" role="status">${p("alert",16)}<span>${r(s)}</span></div>`;let a=e?.financial_laws||{},n=Array.isArray(a.laws)?a.laws:[],i=Number(a.count)||n.length,o=Math.ceil(i/kr)||0,l=String(a.source_sha256||""),d=l?`${l.slice(0,12)}\u2026`:"\u2014",m=a.modified_at?Jt(a.modified_at):"\u2014";return`<details class="home-laws" id="home-laws">
    <summary class="home-laws-summary">
      <span class="home-laws-count">${c(i)}</span>
      <span class="home-laws-title">
        <strong>\u91D1\u878D\u6CD5\u898F\u6E05\u55AE</strong>
        <small>${r(a.source_path||"documents/\u91D1\u878D\u6CD5\u898F.md")} \xB7 ${kr} \u6B04 \xD7 ${o} \u5217</small>
      </span>
      <span class="home-laws-toggle">
        <span>\u5C55\u958B\u6E05\u55AE</span>${p("chevronDown",14)}
      </span>
    </summary>
    <div class="home-laws-body">
      <div class="home-laws-toolbar">
        <span>\u4F86\u6E90 ${r(a.source_path||"documents/\u91D1\u878D\u6CD5\u898F.md")} \xB7 SHA-256 <span class="mono">${r(d)}</span> \xB7 \u4FEE\u6539 ${r(m)}</span>
        <button class="btn btn-secondary btn-sm" type="button" id="home-laws-download">
          ${p("download",13)}<span>\u4E0B\u8F09\u6E05\u55AE</span>
        </button>
      </div>
      ${n.length?`<div class="home-laws-grid" style="--home-law-columns:${kr}" role="list">
              ${n.map((f,y)=>`<span class="home-law" role="listitem" title="${r(f)}">
                    <span class="home-law-index">${String(y+1).padStart(2,"0")}</span>
                    <span class="home-law-name">${r(f)}</span>
                  </span>`).join("")}
            </div>`:'<p class="home-laws-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u6CD5\u898F\u540D\u7A31\u3002</p>'}
    </div>
  </details>`}function Lr(e,{loading:t=!1,error:s=""}={}){if(t)return`<div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>`;if(s)return`<div class="home-rag-error">${p("alert",16)}<span>${r(s)}</span></div>`;let a=e?.rag||{},n=a.judgment_index||{},i=a.legal_index||{},o=a.models||{},l=Number(n.coverage_pct),d=Number.isFinite(l)?Math.max(0,Math.min(100,l)):0;return`<article class="home-rag-card">
      <span class="home-rag-kicker">JUDGMENT RETRIEVAL</span>
      <strong class="home-rag-value mono">${c(n.indexed)}<small> / ${c(n.total)}</small></strong>
      <span class="home-rag-label">\u5DF2\u7D22\u5F15 / \u91D1\u878D\u5224\u6C7A</span>
      <span class="home-rag-progress" role="img" aria-label="\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u8986\u84CB ${r(sa(n.coverage_pct))}"><span style="width:${d.toFixed(1)}%"></span></span>
      <span class="home-rag-meta">${r(sa(n.coverage_pct))} \xB7 ${r(n.model||"\u2014")} \xB7 ${r(n.alias||"\u2014")} \u2192 ${r(n.collection||"\u2014")}</span>
      <a class="home-rag-link" href="#/rag">\u958B\u59CB\u63D0\u554F ${p("arrowRight",12)}</a>
    </article>
    <article class="home-rag-card">
      <span class="home-rag-kicker">LEGAL GROUNDING</span>
      <strong class="home-rag-value mono">${c(i.points_count)}<small> \u689D\u6587</small></strong>
      <span class="home-rag-label">\u6CD5\u898F\uFF0F\u547D\u4EE4\u5411\u91CF\u7D22\u5F15</span>
      <span class="home-rag-progress" role="img" aria-label="\u6CD5\u898F\u547D\u4EE4\u7D22\u5F15 ${c(i.points_count)} \u689D\u6587"><span style="width:${Number(i.points_count)>0?"100":"0"}%"></span></span>
      <span class="home-rag-meta">${c(i.current_article_count??i.article_count)} \u73FE\u884C\u689D\u6587 \xB7 ${r(i.model||"\u2014")} \xB7 ${r(i.collection||"\u2014")}${i.version_id?` \xB7 v${i.version_id}`:""}</span>
      <a class="home-rag-link" href="#/data">\u67E5\u770B\u8CC7\u6599 ${p("arrowRight",12)}</a>
    </article>
    <article class="home-rag-card">
      <span class="home-rag-kicker">LLM \xB7 RERANK</span>
      <strong class="home-rag-value mono">${r(o.llm||"\u2014")}</strong>
      <span class="home-rag-label">\u56DE\u7B54\u6A21\u578B</span>
      <span class="home-rag-chips">
        <span class="home-chip">Embedding ${r(o.embedding||"\u2014")}</span>
        <span class="home-chip ${o.rerank_enabled?"is-on":""}">Rerank ${o.rerank_enabled?"\u555F\u7528":"\u505C\u7528"}</span>
      </span>
      <span class="home-rag-meta">${r(o.rerank||"\u2014")} \xB7 \u56DE\u7B54\u5FC5\u9808\u9644\u5F15\u7528\u7DE8\u865F\uFF0C\u7F3A\u5C11\u6709\u6548\u5F15\u7528\u6642\u964D\u7D1A\u70BA\u6AA2\u7D22\u7D50\u679C\u3002</span>
      <a class="home-rag-link" href="#/performance">\u67E5\u770B RAG Pipeline ${p("arrowRight",12)}</a>
    </article>`}function gd(){return`<ol class="home-rag-flow" aria-label="RAG \u57F7\u884C\u6D41\u7A0B">
    ${[["01","\u554F\u984C","1\u2013500 \u5B57","message"],["02","Embedding","bge-m3","brain"],["03","\u6AA2\u7D22","\u5224\u6C7A + \u6CD5\u898F\uFF0F\u547D\u4EE4","database"],["04","Rerank","cross-encoder","sliders"],["05","LLM","\u4F9D\u6AA2\u7D22\u5167\u5BB9\u56DE\u7B54","sparkles"],["06","\u5F15\u7528","[n] \u2192 \u539F\u59CB\u4F86\u6E90","link"]].map(([t,s,a,n])=>`<li class="home-rag-step">
          <span class="home-rag-step-icon">${p(n,17)}</span>
          <span class="home-rag-step-copy">
            <small>${t}</small>
            <strong>${r(s)}</strong>
            <span>${r(a)}</span>
          </span>
        </li>`).join("")}
  </ol>`}function fd(){return`<div class="home-trace">
    <div class="home-trace-row">
      <span class="home-trace-label">\u5224\u6C7A\u5F15\u7528</span>
      <span class="home-trace-path">
        <span class="home-trace-node">\u56DE\u7B54 [n]</span>${p("arrowRight",11)}
        <span class="home-trace-node">\u6848\u865F \xB7 \u6CD5\u9662 \xB7 \u65E5\u671F</span>${p("arrowRight",11)}
        <span class="home-trace-node">PDF / \u539F\u59CB Parquet \u5168\u6587</span>${p("arrowRight",11)}
        <a class="home-trace-node is-link" href="#/data">PostgreSQL</a>
      </span>
    </div>
    <div class="home-trace-row">
      <span class="home-trace-label">\u6CD5\u898F\u5F15\u7528</span>
      <span class="home-trace-path">
        <span class="home-trace-node">\u56DE\u7B54 [n]</span>${p("arrowRight",11)}
        <span class="home-trace-node">\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 \u689D\u865F</span>${p("arrowRight",11)}
        <a class="home-trace-node is-link" href="#/data">\u689D\u6587\u7248\u672C\u8207\u4F86\u6E90</a>${p("arrowRight",11)}
        <a class="home-trace-node is-link" href="https://law.moj.gov.tw/" target="_blank" rel="noopener noreferrer">\u5168\u570B\u6CD5\u898F\u8CC7\u6599\u5EAB ${p("external",10)}</a>
      </span>
    </div>
    <p class="home-trace-note">RAG \u53EA\u6839\u64DA\u5BE6\u969B\u6AA2\u7D22\u5230\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u8207\u5224\u6C7A\u7247\u6BB5\u751F\u6210\u56DE\u7B54\uFF1B\u6C92\u6709\u6709\u6548\u4F86\u6E90\u6642\u986F\u793A\u6AA2\u7D22\u7D50\u679C\uFF0C\u4E0D\u4EE5\u63A8\u6E2C\u88DC\u9F4A\u3002</p>
  </div>`}function Sr(e){return e==="failed"?"\u5931\u6557":e==="skipped"?"\u7565\u904E":e==="running"?"\u57F7\u884C\u4E2D":e==="pending"?"\u7B49\u5F85":"\u5B8C\u6210"}function bd(e,t,s,a,n,i){let o=String(e.status||"success"),l=o==="skipped"||o==="pending",d=Math.max(0,Number(e.duration_ms)||0),m=l?"\u2014":ge(d),f=o==="failed"?"var(--danger)":e.color||"#64748b",y=[`is-${o}`,o==="failed"?"is-error":"",l?"is-missing":"",i&&e.key===i?"is-slowest":""].filter(Boolean).join(" "),v=String(e.key||`stage-${t}`),u=[["\u72C0\u614B",Sr(o),!0],["\u958B\u59CB",e.started_at?$e(e.started_at):"\u2014",!0],["\u7D50\u675F",e.finished_at?$e(e.finished_at):"\u2014",!0],["\u8017\u6642",m,!0],["\u5360\u6574\u9AD4",sa(n),!0],["\u8AAA\u660E",e.message||e.caption||"",!1]].map(([w,k,A])=>A||k?`<span class="rag-wf-detail"><span>${r(w)}</span><strong>${r(String(k||"\u2014"))}</strong></span>`:"").join(""),b=l?"":`<span class="rag-wf-bar is-sequential" style="left:${s.toFixed(3)}%;width:${a.toFixed(4)}%;top:0;height:12px;--bar-color:${r(f)}" aria-hidden="true"></span>`;return`<details class="rag-wf-stage home-wf-stage ${y}${dn.has(v)?" is-open":""}" data-home-wf-stage="${r(v)}"${dn.has(v)?" open":""} style="--stage-color:${r(e.color||"#64748b")}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong><span class="home-wf-step">${String(t+1).padStart(2,"0")}</span> ${r(e.label||e.key||"\u968E\u6BB5")}${i&&e.key===i?' <span class="home-wf-slow">\u6700\u6162</span>':""}</strong>${e.caption?`<small>${r(e.caption)}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${r(m)} \xB7 ${r(Sr(o))} <span class="rag-wf-chevron">${p("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${e.label||e.key}\uFF1A${Sr(o)}\uFF0C\u8017\u6642 ${m}\uFF0C\u5360\u6574\u9AD4 ${sa(n)}`)}">${b}</span>
    </summary>
    <div class="rag-wf-details">${u}</div>
  </details>`}function jr(e,{loading:t=!1,error:s="",clientMs:a=null}={}){if(t)return`<div class="report-card home-wf-loading" aria-live="polite">
      <div class="side-card-head index-runtime-head">
        <span class="side-card-title">${p("activity",14)}\u9996\u9801\u5373\u6642\u8CC7\u6599\u8F09\u5165 Pipeline</span>
        <span class="home-wf-loading-label">\u91CF\u6E2C\u4E2D\u2026</span>
      </div>
      <div class="home-wf-loading-body">
        <span class="skeleton skeleton-line"></span>
        <span class="skeleton skeleton-line"></span>
        <span class="skeleton skeleton-line"></span>
      </div>
    </div>`;if(s)return`<div class="report-card home-wf-error" role="status">
      <div class="side-card-head index-runtime-head">
        <span class="side-card-title">${p("activity",14)}\u9996\u9801\u5373\u6642\u8CC7\u6599\u8F09\u5165 Pipeline</span>
      </div>
      <div class="home-wf-error-body">${p("alert",16)}<span>${r(s)}</span></div>
    </div>`;let n=e?.pipeline,i=Array.isArray(n?.stages)?n.stages:[];if(!n||!i.length)return`<div class="report-card home-wf-error">
      <div class="side-card-head index-runtime-head">
        <span class="side-card-title">${p("activity",14)}\u9996\u9801\u5373\u6642\u8CC7\u6599\u8F09\u5165 Pipeline</span>
      </div>
      <div class="home-wf-error-body">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u968E\u6BB5\u8A08\u6642\u3002</div>
    </div>`;let o=Math.max(0,Number(n.total_ms)||i.reduce((S,$)=>S+(Number($.duration_ms)||0),0)),l=Math.max(0,Number(a)||0),d=Math.max(0,l-o),m=Math.max(o,i.reduce((S,$)=>S+(Number($.duration_ms)||0),0),1),f=i.reduce((S,$)=>(Number($.duration_ms)||0)>(Number(S?.duration_ms)||0)?$:S,i[0]),y=1.25,v=i.map(S=>String(S.status||"success")==="skipped"?0:Math.max((Number(S.duration_ms)||0)/m*100,y)),u=v.reduce((S,$)=>S+$,0),b=u>100?100/u:1,w=0,k=i.map((S,$)=>{let T=["skipped","pending"].includes(String(S.status||"success")),K=T?0:v[$]*b,G=w;T||(w+=K);let fe=m>0?(Number(S.duration_ms)||0)/m*100:0;return bd(S,$,G,K,fe,f?.key)}).join(""),A=i.filter(S=>S.status==="failed").length;return`<section class="report-card status-wf-card home-wf-card" data-home-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${p("activity",14)}\u9996\u9801\u5373\u6642\u8CC7\u6599\u8F09\u5165 Pipeline</span>
      <span class="home-wf-links">
        <a class="home-wf-link" href="#/status">\u5B8C\u6574\u670D\u52D9 Pipeline ${p("arrowRight",11)}</a>
        <a class="home-wf-link" href="#/performance">RAG Flow ${p("arrowRight",11)}</a>
      </span>
    </div>
    <div class="index-runtime-metrics home-wf-metrics">
      <span class="index-runtime-metric" title="\u5F8C\u7AEF /api/home \u5F9E\u7B2C\u4E00\u500B\u67E5\u8A62\u5230\u56DE\u61C9\u7D44\u88DD\u5B8C\u6210\u7684\u968E\u6BB5\u7E3D\u8017\u6642\u3002"><span>\u968E\u6BB5\u7E3D\u8017\u6642</span><strong>${r(ge(o))}</strong></span>
      <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u5F9E\u9001\u51FA\u8ACB\u6C42\u5230\u6536\u5230\u56DE\u61C9\u7684\u5BE6\u969B\u5F80\u8FD4\u6642\u9593\u3002"><span>HTTP \u5F80\u8FD4</span><strong>${r(l?ge(l):"\u2014")}</strong></span>
      <span class="index-runtime-metric" title="HTTP \u5F80\u8FD4\u6263\u6389\u5F8C\u7AEF\u968E\u6BB5\u7E3D\u8017\u6642\u5F8C\u7684\u50B3\u8F38\u8207\u6392\u968A\u6642\u9593\u3002"><span>\u50B3\u8F38\uFF0F\u6392\u968A</span><strong>${r(l?ge(d):"\u2014")}</strong></span>
      <span class="index-runtime-metric" title="\u672C\u6B21\u8F09\u5165\u8017\u6642\u6700\u9577\u7684\u968E\u6BB5\uFF0C\u4E5F\u5C31\u662F\u76EE\u524D\u6700\u660E\u986F\u7684\u74F6\u9838\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${f?.label||"\u2014"} \xB7 ${ge(f?.duration_ms||0)}`)}</strong></span>
      <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${c(i.length-A)} / ${c(i.length)}${A?` \xB7 \u5931\u6557 ${c(A)}`:""}</strong></span>
      <span class="index-runtime-metric" title="\u672C\u6B21\u6458\u8981\u7684\u7522\u751F\u6642\u9593\u3002"><span>\u66F4\u65B0\u6642\u9593</span><strong>${r(n.finished_at?$e(n.finished_at):"\u2014")}</strong></span>
    </div>
    <div class="status-wf-chart">
      <div class="rag-wf-axis"><span>0 ms</span><span>${r(ge(o))}</span></div>
      <div class="rag-wf-stages">${k}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u5BE6\u969B\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0Cbar \u9577\u5EA6\u70BA\u8A72\u968E\u6BB5\u8017\u6642\u5360\u6BD4\uFF1B\u6A19\u793A\u300C\u6700\u6162\u300D\u7684\u968E\u6BB5\u5373\u672C\u6B21\u8F09\u5165\u74F6\u9838\u3002\u9EDE\u64CA\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u3001\u5360\u6BD4\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function hd(e){return`<div class="home-source-error">${p("alert",16)}<span>${r(e)}</span></div>`}function vd(){let e=ud.map(pd).join("");return`<section class="page home-page" id="home-page">
    <div class="home-hero">
      <div class="home-hero-copy">
        <span class="home-eyebrow">JUDICIAL OPEN DATA \xB7 FINANCIAL LAW RAG</span>
        <h1 class="home-title">\u8B93\u91D1\u878D\u6CD5\u898F\uFF0C<span>\u56DE\u5230\u5224\u6C7A\u8207\u689D\u6587\u3002</span></h1>
        <p class="home-lead">\u4EE5\u91D1\u878D\u6CD5\u898F\u6E05\u55AE\u3001\u73FE\u884C\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587\u8207\u53F8\u6CD5\u9662\u5224\u6C7A\u5168\u6587\u70BA\u57FA\u790E\u3002
          Qdrant \u627E\u51FA\u76F8\u4F3C\u5224\u6C7A\uFF0CLLM \u4F9D\u5BE6\u969B\u6AA2\u7D22\u5167\u5BB9\u751F\u6210\u9644\u5F15\u7528\u7DE8\u865F\u7684\u56DE\u7B54\uFF1B\u6BCF\u500B\u5F15\u7528\u90FD\u80FD\u56DE\u5230\u539F\u59CB\u6CD5\u898F\u3001\u547D\u4EE4\u6216\u5224\u6C7A\u3002</p>
        <form class="home-ask" id="home-ask-form" autocomplete="off">
          <label class="sr-only" for="home-question">\u8F38\u5165\u6CD5\u5F8B\u554F\u984C</label>
          <div class="home-ask-box">
            <textarea class="home-ask-input" id="home-question" name="question" rows="1"
              maxlength="500" placeholder="\u554F\u4E00\u500B\u6CD5\u5F8B\u554F\u984C\uFF0C\u4F8B\u5982\uFF1A\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F"
              aria-describedby="home-ask-help"></textarea>
            <button class="btn btn-primary home-ask-submit" type="submit">
              ${p("sparkles",16)}<span>\u958B\u59CB\u6AA2\u7D22</span>
            </button>
          </div>
          <div class="home-ask-help" id="home-ask-help">
            <span><kbd>Enter</kbd> \u9001\u51FA</span>
            <span><kbd>Shift</kbd> + <kbd>Enter</kbd> \u63DB\u884C</span>
            <span>\u9001\u51FA\u5F8C\u5728 RAG \u63D0\u554F\u4E2D\u958B\u555F</span>
          </div>
        </form>
        <div class="home-hero-meta">
          <span>${p("shield",13)}\u5F15\u7528\u53EF\u8FFD\u6EAF</span>
          <span>${p("database",13)}\u6CD5\u898F\uFF0B\u547D\u4EE4\uFF0B\u5224\u6C7A</span>
          <span>${p("activity",13)}Pipeline waterfall</span>
        </div>
      </div>
      <aside class="home-live-card" id="home-live-card" aria-label="\u5373\u6642\u8CC7\u6599\u6458\u8981">
        <div class="home-live-head">
          <span class="home-live-kicker">LIVE DATASET</span>
          <button class="home-live-refresh" type="button" id="home-refresh" aria-label="\u91CD\u65B0\u6574\u7406\u9996\u9801\u5373\u6642\u8CC7\u6599">
            ${p("refresh",14)}
          </button>
        </div>
        <div id="home-live-body" aria-live="polite">${pn(null,{loading:!0})}</div>
      </aside>
    </div>

    <section class="home-section home-metrics-section" aria-labelledby="home-metrics-title">
      <div class="home-section-head">
        <div>
          <span class="home-kicker">LIVE METRICS</span>
          <h2 id="home-metrics-title">\u91CD\u8981\u6578\u64DA\uFF0C\u8207\u5176\u4ED6\u9801\u9762\u540C\u6B65\u3002</h2>
        </div>
        <p>\u6240\u6709\u6578\u5B57\u90FD\u4F86\u81EA PostgreSQL\u3001Qdrant \u8207\u6700\u65B0 manifest\uFF1B\u8207\u8CC7\u6599\u5EAB\u3001\u8655\u7406\u7E3D\u89BD\u8207\u7CFB\u7D71\u72C0\u614B\u9801\u4F7F\u7528\u76F8\u540C\u5B9A\u7FA9\uFF0C\u4E0D\u786C\u7DE8\u78BC\u3002</p>
      </div>
      <div class="processing-summary judgment-stats-cards home-metric-grid">
        <div class="home-metric-group" id="home-judgment-stats">
          ${ls(null,{loading:!0})}
        </div>
        <div class="home-metric-group" id="home-law-metrics">
          ${Ar(null,{loading:!0})}
        </div>
      </div>
      <div class="home-metric-strip" id="home-metric-strip">
        ${qr(null,{loading:!0})}
      </div>
    </section>

    <section class="home-section home-rag-section" aria-labelledby="home-rag-title">
      <div class="home-section-head">
        <div>
          <span class="home-kicker">RAG CAPABILITY</span>
          <h2 id="home-rag-title">\u5F9E\u554F\u984C\uFF0C\u5230\u53EF\u4EE5\u9A57\u8B49\u7684\u5F15\u7528\u3002</h2>
        </div>
        <p>\u5224\u6C7A\u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4F7F\u7528\u7368\u7ACB\u5411\u91CF\u7D22\u5F15\uFF1B\u5FC5\u8981\u6642\u4EE5 reranker \u91CD\u65B0\u6392\u5E8F\uFF0C\u518D\u4EA4\u7D66 LLM \u751F\u6210\u56DE\u7B54\u3002</p>
      </div>
      ${gd()}
      <div class="home-rag-values" id="home-rag-values">
        ${Lr(null,{loading:!0})}
      </div>
      ${fd()}
    </section>

    <section class="home-section home-source-section" aria-labelledby="home-source-title">
      <div class="home-section-head">
        <div>
          <span class="home-kicker">PROVENANCE</span>
          <h2 id="home-source-title">\u6BCF\u4E00\u7B46\u8CC7\u6599\uFF0C\u90FD\u6709\u4F86\u6E90\u3002</h2>
        </div>
        <p>\u5224\u6C7A\u4F86\u81EA\u53F8\u6CD5\u9662\u8CC7\u6599\u958B\u653E\u5E73\u81FA\uFF0C\u6CD5\u898F\uFF0F\u547D\u4EE4\u4F86\u81EA\u5168\u570B\u6CD5\u898F\u8CC7\u6599\u5EAB\uFF1B\u4E0B\u8F09\u3001\u7248\u672C\u8207\u532F\u5165\u72C0\u614B\u53EF\u5728\u8CC7\u6599\u8655\u7406\u9801\u8FFD\u8E64\u3002</p>
      </div>
      <div class="home-source-grid" id="home-source-grid">
        ${un("opendata",null)}
        ${un("laws",null)}
      </div>
      <div id="home-laws-slot">
        ${Mr(null,{loading:!0})}
      </div>
    </section>

    <section class="home-section home-wf-section" aria-labelledby="home-wf-title">
      <div class="home-section-head">
        <div>
          <span class="home-kicker">PIPELINE WATERFALL</span>
          <h2 id="home-wf-title">\u8F09\u5165\u6642\u9593\u82B1\u5728\u54EA\u88E1\uFF0C\u4E00\u773C\u770B\u898B\u3002</h2>
        </div>
        <p>\u4E0B\u5716\u662F\u672C\u6B21 <span class="mono">GET /api/home</span> \u7684\u5BE6\u969B\u968E\u6BB5\u8A08\u6642\uFF1B\u6700\u6162\u968E\u6BB5\u6703\u88AB\u6A19\u793A\u51FA\u4F86\uFF0C\u65B9\u4FBF\u76F4\u63A5\u5B9A\u4F4D bottleneck\u3002</p>
      </div>
      <div id="home-waterfall-slot">
        ${jr(null,{loading:!0})}
      </div>
    </section>

    <section class="home-section home-feature-section" aria-labelledby="home-feature-title">
      <div class="home-section-head">
        <div>
          <span class="home-kicker">EXPLORE THE CONSOLE</span>
          <h2 id="home-feature-title">\u4E00\u5957\u7CFB\u7D71\uFF0C\u5F9E\u63D0\u554F\u8D70\u5230\u8CC7\u6599\u7DAD\u904B\u3002</h2>
        </div>
        <p>\u6BCF\u500B\u5DE5\u4F5C\u5340\u90FD\u9023\u5230\u53EF\u9A57\u8B49\u7684\u8CC7\u6599\u4F86\u6E90\u8207\u6A21\u578B\u670D\u52D9\uFF0C\u6C92\u6709\u6A21\u64EC\u8CC7\u6599\uFF0C\u4E5F\u4E0D\u4EE5\u63A8\u6E2C\u88DC\u9F4A\u3002</p>
      </div>
      <div class="home-tile-grid">${e}</div>
    </section>

    <section class="home-trust" aria-label="\u7CFB\u7D71\u539F\u5247">
      <div class="home-trust-item">
        <span class="home-trust-icon">${p("shield",18)}</span>
        <strong>\u4F86\u6E90\u512A\u5148</strong>
        <p>\u56DE\u7B54\u53EA\u6839\u64DA\u6AA2\u7D22\u5230\u7684\u6CD5\u898F\u3001\u547D\u4EE4\u8207\u5224\u6C7A\u7247\u6BB5\u751F\u6210\uFF0C\u5F15\u7528\u7DE8\u865F\u53EF\u56DE\u5230\u539F\u59CB\u8CC7\u6599\u3002</p>
      </div>
      <div class="home-trust-item">
        <span class="home-trust-icon">${p("server",18)}</span>
        <strong>\u672C\u6A5F\u6A21\u578B</strong>
        <p>\u900F\u904E llama-server \u4F7F\u7528\u672C\u6A5F\u6216\u5340\u7DB2\u6A21\u578B\uFF0C\u6A21\u578B\u8207\u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u90FD\u53EF\u8ABF\u6574\u3002</p>
      </div>
      <div class="home-trust-item">
        <span class="home-trust-icon">${p("layers",18)}</span>
        <strong>\u7248\u672C\u53EF\u8FFD\u6EAF</strong>
        <p>\u6CD5\u898F\u3001\u5224\u6C7A\u8207\u5411\u91CF\u7D22\u5F15\u4FDD\u7559\u7248\u672C\u8207\u66F4\u65B0\u7D00\u9304\uFF0C\u8CC7\u6599\u8B8A\u66F4\u4E0D\u6703\u9ED8\u9ED8\u6D88\u5931\u3002</p>
      </div>
    </section>
  </section>`}function $d(e,t){let s=t?.laws||{},a=t?.judgments||{},n=t?.raw||{},i=t?.rag?.judgment_index||{},o={rag:`${c(i.indexed)} \u7B46\u7D22\u5F15`,data:`${c(s.law_count)} \u6CD5\u898F \xB7 ${c(s.order_count)} \u547D\u4EE4`,quality:`${c(n.raw_total)} \u539F\u59CB\u5224\u6C7A`,processing:`${c(n.archive_count)} archive`,performance:"Flow \xB7 Waterfall",status:"10 \u670D\u52D9\u5143\u4EF6",tests:"LLM \xB7 Reranker"};e.querySelectorAll("[data-home-tile-metric]").forEach(l=>{let d=l.dataset.homeTileMetric;d&&o[d]&&(l.textContent=o[d])})}function so(e,t,{clientMs:s=null}={}){let a=t?.data||{},n=t?.generated_at||"",i=e.querySelector("#home-live-body");i&&(i.innerHTML=pn(a,{generatedAt:n}));let o=e.querySelector("#home-judgment-stats"),l=a.judgments||{};o&&(o.innerHTML=ls({judgment_total:l.raw_total,financial_total:l.financial_total,financial_ratio:l.financial_ratio}));let d=e.querySelector("#home-law-metrics");d&&(d.innerHTML=Ar(a));let m=e.querySelector("#home-metric-strip");m&&(m.innerHTML=qr(a));let f=e.querySelector("#home-rag-values");f&&(f.innerHTML=Lr(a));let y=e.querySelector("#home-source-grid");y&&(y.innerHTML=`${un("opendata",a)}${un("laws",a)}`);let v=e.querySelector("#home-laws-slot");if(v){let w=!!v.querySelector("#home-laws")?.open;v.innerHTML=Mr(a);let k=v.querySelector("#home-laws");k&&w&&(k.open=!0)}let u=e.querySelector("#home-waterfall-slot");u&&(u.innerHTML=jr({...a,pipeline:t?.pipeline},{clientMs:s})),$d(e,a)}function yd(e,t){let s=e.querySelector("#home-live-body");s&&(s.innerHTML=pn(null,{error:t}));let a=e.querySelector("#home-judgment-stats");a&&(a.innerHTML=ls(null));let n=e.querySelector("#home-law-metrics");n&&(n.innerHTML=Ar(null));let i=e.querySelector("#home-metric-strip");i&&(i.innerHTML=qr(null));let o=e.querySelector("#home-rag-values");o&&(o.innerHTML=Lr(null,{error:t}));let l=e.querySelector("#home-source-grid");l&&(l.innerHTML=hd(t));let d=e.querySelector("#home-laws-slot");d&&(d.innerHTML=Mr(null,{error:t}));let m=e.querySelector("#home-waterfall-slot");m&&(m.innerHTML=jr(null,{error:t}))}async function wd(e,t){let s=!1,a=!1,n=!1,i=null,o=null,l=null,d=null,m=0;e.innerHTML=vd();let f=e.querySelector("#home-ask-form"),y=e.querySelector("#home-question"),v=e.querySelector("#home-refresh"),u=()=>{let $=String(y?.value||"").trim().slice(0,500);if(!$){y?.focus();return}try{window.sessionStorage.setItem("judgment.pending_question",$)}catch{}window.__judgmentPendingQuestion=$,t&&typeof t.navigate=="function"?t.navigate("rag"):window.location.hash="#/rag"},b=()=>{y&&(y.style.height="auto",y.style.height=`${Math.min(y.scrollHeight,140)}px`)},w=$=>{v&&(v.disabled=$,v.classList.toggle("is-loading",$),v.setAttribute("aria-busy",$?"true":"false"))},k=async({quiet:$=!1}={})=>{if(s)return;if(a){n=!0;return}if(a=!0,m=Date.now(),w(!0),!$){let K=e.querySelector("#home-live-body");K&&(K.innerHTML=pn(null,{loading:!0}))}let T=performance.now();try{let K=await Q.homeSummary();if(s||!e.isConnected)return;o=K?.data||null,l=K?.data?.financial_laws||null,os(to,K),so(e,K,{clientMs:Math.round(performance.now()-T)})}catch(K){if(s||!e.isConnected)return;yd(e,K.message||"\u7121\u6CD5\u53D6\u5F97\u9996\u9801\u5373\u6642\u8CC7\u6599\u3002")}finally{a=!1,w(!1),n&&!s&&(n=!1,k({quiet:!0}))}};y?.addEventListener("input",b),f?.addEventListener("submit",$=>{$.preventDefault(),u()}),y?.addEventListener("keydown",$=>{$.key==="Enter"&&!$.shiftKey&&!$.isComposing&&($.preventDefault(),u())});let A=()=>{if(s||d)return;let $=Math.max(0,dd-(Date.now()-m));if($===0){k({quiet:!0});return}d=window.setTimeout(()=>{d=null,s||k({quiet:!0})},$)};e.addEventListener("click",$=>{if($.target.closest("#home-refresh")||$.target.closest("#home-retry")){d&&(window.clearTimeout(d),d=null),k();return}if($.target.closest("#home-laws-download")){let T=l?.content||`${(l?.laws||[]).join(`
`)}
`;T.trim()&&Vt("\u91D1\u878D\u6CD5\u898F.md",T)}}),e.addEventListener("toggle",$=>{let T=$.target.closest?.("[data-home-wf-stage]");if(!T||!e.contains(T))return;let K=T.dataset.homeWfStage||"";K&&(T.open?dn.add(K):dn.delete(K))},!0),b(),y?.focus({preventScroll:!0});let S=ms(to,300*1e3);if(S?(o=S?.data||null,l=S?.data?.financial_laws||null,so(e,S,{clientMs:0}),k({quiet:!0})):await k(),!s)try{i=Mt("processing",($,T)=>{s||T?.initial||A()},{onError:()=>{}})}catch{i=null}return()=>{s=!0,d&&(window.clearTimeout(d),d=null),typeof i=="function"&&i(),i=null}}var si={};us(si,{render:()=>up});var no="judgment-console";var wt="query_history",ss="settings",as="audit_events";var pt={history:[],settings:new Map,audit:[],nextId:1},mn=null,bt=!("indexedDB"in window);function Ot(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function Dt(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function Ht(){return mn||(mn=new Promise((e,t)=>{if(!("indexedDB"in window)){bt=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(no,2)}catch(a){bt=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(wt)){let n=a.createObjectStore(wt,{keyPath:"id",autoIncrement:!0});n.createIndex("created_at","created_at"),n.createIndex("kind","kind")}if(a.objectStoreNames.contains(ss)||a.createObjectStore(ss,{keyPath:"key"}),!a.objectStoreNames.contains(as)){let n=a.createObjectStore(as,{keyPath:"key"});n.createIndex("created_at","created_at"),n.createIndex("dataset","dataset"),n.createIndex("jid","jid"),n.createIndex("issue_month","issue_month")}},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{bt=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{bt=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),mn)}function ro(){return"indexedDB"in window}function io(){return bt}function _a(){return bt?"memory":"indexeddb"}function _d(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},turns:Array.isArray(e.turns)?e.turns:[],pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t,updated_at:e.updated_at||t}}async function kd(){try{let t=(await Ht()).transaction(wt,"readwrite"),s=t.objectStore(wt),a=await Ot(s.count());if(a>120){let n=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let d=i.result;if(!d||n<=0){o();return}d.delete(),n-=1,d.continue()},i.onerror=()=>l(i.error)})}await Dt(t)}catch{bt=!0}}async function ka(e){let t=_d(e);try{let a=(await Ht()).transaction(wt,"readwrite"),n=a.objectStore(wt),i=await Ot(n.add(t));return await Dt(a),await kd(),i}catch{bt=!0;let a=pt.nextId++;return pt.history.push({id:a,...t}),pt.history.length>120&&pt.history.shift(),a}}async function Sa(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let n=(await Ht()).transaction(wt,"readwrite"),i=n.objectStore(wt),o=await Ot(i.get(s));if(!o)return await Dt(n),null;let l={...o,...t,id:s};return await Ot(i.put(l)),await Dt(n),l}catch{bt=!0;let n=pt.history.findIndex(i=>Number(i.id)===s);return n===-1?null:(pt.history[n]={...pt.history[n],...t,id:s},pt.history[n])}}async function oo(e){let t=Number(e);if(!Number.isFinite(t))return!1;try{let a=(await Ht()).transaction(wt,"readwrite");return a.objectStore(wt).delete(t),await Dt(a),!0}catch{bt=!0;let a=pt.history.findIndex(n=>Number(n.id)===t);return a===-1?!1:(pt.history.splice(a,1),!0)}}async function gn({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let n=(await Ht()).transaction(wt,"readonly"),i=n.objectStore(wt),o=await Ot(i.getAll());return await Dt(n),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,d)=>String(d.updated_at||d.created_at).localeCompare(String(l.updated_at||l.created_at))).slice(0,t)}catch{return bt=!0,pt.history.filter(n=>s?`${n.kind} ${n.title} ${n.detail}`.toLowerCase().includes(s):!0).slice().sort((n,i)=>String(i.updated_at||i.created_at).localeCompare(String(n.updated_at||n.created_at))).slice(0,t)}}async function lo(){try{let t=(await Ht()).transaction(wt,"readwrite");t.objectStore(wt).clear(),await Dt(t)}catch{bt=!0}pt.history=[]}function Sd(e){let t=Number(e.id??e.event_id??0)||0,s=String(e.dataset||e.kind||"judgment"),a=String(e.key||`${s}:${t||`${Date.now()}:${Math.random().toString(36).slice(2)}`}`),n=String(e.jid||""),i=String(e.issue_month||""),o=String(e.change_type||""),l=String(e.detected_at||e.created_at||new Date().toISOString());return{key:a,event_id:t,dataset:s,jid:n,issue_month:i,change_type:o,title:String(e.title||n||i||"\u7248\u672C\u8B8A\u66F4"),detail:String(e.detail||[o,i,n].filter(Boolean).join(" \xB7 ")),created_at:l,payload:e}}async function xd(){try{let t=(await Ht()).transaction(as,"readwrite"),s=t.objectStore(as),a=await Ot(s.count());if(a>2e3){let n=a-2e3,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let d=i.result;if(!d||n<=0){o();return}d.delete(),n-=1,d.continue()},i.onerror=()=>l(i.error)})}await Dt(t)}catch{bt=!0}}async function co(e){let t=(Array.isArray(e)?e:[]).filter(s=>s&&typeof s=="object").map(Sd);if(!t.length)return 0;try{let a=(await Ht()).transaction(as,"readwrite"),n=a.objectStore(as);for(let i of t)await Ot(n.put(i));return await Dt(a),await xd(),t.length}catch{bt=!0;let a=new Map(pt.audit.map(n=>[n.key,n]));for(let n of t)a.set(n.key,n);return pt.audit=Array.from(a.values()).sort((n,i)=>String(i.created_at).localeCompare(String(n.created_at))).slice(0,2e3),t.length}}async function uo({keyword:e="",limit:t=200}={}){let s=e.trim().toLowerCase(),a=n=>s?`${n.dataset} ${n.jid} ${n.issue_month} ${n.change_type} ${n.detail}`.toLowerCase().includes(s):!0;try{let i=(await Ht()).transaction(as,"readonly"),o=i.objectStore(as),l=await Ot(o.getAll());return await Dt(i),l.filter(a).sort((d,m)=>String(m.created_at).localeCompare(String(d.created_at))).slice(0,t)}catch{return bt=!0,pt.audit.filter(a).slice().sort((i,o)=>String(o.created_at).localeCompare(String(i.created_at))).slice(0,t)}}async function po(){let e={name:no,version:2,supported:"indexedDB"in window,mode:_a(),degraded:bt,stores:[wt,ss,as],caps:{history:120,audit:2e3},usage_bytes:null,quota_bytes:null};if(typeof navigator<"u"&&navigator.storage?.estimate)try{let t=await navigator.storage.estimate();e.usage_bytes=Number.isFinite(t.usage)?t.usage:null,e.quota_bytes=Number.isFinite(t.quota)?t.quota:null}catch{}try{let s=(await Ht()).transaction([wt,ss,as],"readonly"),a=Dt(s),[n,i,o]=await Promise.all([Ot(s.objectStore(wt).count()),Ot(s.objectStore(ss).count()),Ot(s.objectStore(as).count()),a]);return{...e,available:!0,counts:{query_history:n,settings:i,audit_events:o},total:n+i+o}}catch{return bt=!0,{...e,available:!1,degraded:!0,mode:"memory",counts:{query_history:pt.history.length,settings:pt.settings.size,audit_events:pt.audit.length},total:pt.history.length+pt.settings.size+pt.audit.length}}}async function xa(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let n=(await Ht()).transaction(ss,"readwrite");return n.objectStore(ss).put(s),await Dt(n),s}catch{return bt=!0,pt.settings.set(s.key,s),s}}async function qs(e,t=null){try{let a=(await Ht()).transaction(ss,"readonly"),n=a.objectStore(ss),i=await Ot(n.get(String(e)));return await Dt(a),i?i.value:t}catch{bt=!0;let a=pt.settings.get(String(e));return a?a.value:t}}async function mo({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await Ht()).transaction(ss,"readonly"),n=a.objectStore(ss),i=await Ot(n.getAll());return await Dt(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return bt=!0,Array.from(pt.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function go(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var Wr={};us(Wr,{buildFlowWaterfallStages:()=>Mn,render:()=>Du,renderRagPipelineWaterfall:()=>qn,renderTestFlowPanel:()=>ia,renderWaterfallStages:()=>ra});var Ad={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},qd=new Set(["running","stopping"]);function hn(e){let[t,s]=Ad[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${r(t)}</span>`}function fn(e){return String(e).padStart(2,"0")}function aa(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${fn(t.getMonth()+1)}-${fn(t.getDate())} ${fn(t.getHours())}:${fn(t.getMinutes())}`}function bn(e){return qd.has(e)}function bs(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function Ps(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function Ms(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${r(e)}</span>
    <strong>${r(String(t))}</strong>
    ${s?`<small>${r(s)}</small>`:""}
  </div>`}function fo(e={}){let t=e.score_components||e,s=e.gate||{},a=String(s.status||""),n=a==="pass"?"Gate \u901A\u904E":a==="fail"?"Gate \u5931\u6557":a==="no_data"?"Gate \u7121\u8CC7\u6599":"";return`${n?`<span class="badge ${a==="pass"?"badge-ok":a==="fail"?"badge-danger":"badge-neutral"}">${r(n)}</span>`:""}<div class="bench-metrics">
    ${Ms("Law Recall",Ps(t.law_recall))}
    ${Ms("Article Recall",Ps(t.article_recall))}
    ${Ms("Citation Valid",Ps(t.citation_valid_rate))}
    ${Ms("Judge",bs(t.judge_overall))}
    ${Ms("Human",bs(t.human_overall))}
    ${Ms("p50",ge(e.duration_p50_ms))}
    ${Ms("p95",ge(e.duration_p95_ms))}
    ${Ms("Success",`${c(e.success||0)} / ${c(e.total||0)}`)}
  </div>`}function bo(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${r(s.replace(/^rag\./,""))}</span>
      <strong>${ge(a.p50_ms)}</strong>
      <small>p95 ${ge(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function ho(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${Ps(s.law_recall)}</span>
    <span>Article ${Ps(s.article_recall)}</span>
    <span>Judge ${bs(s.judge_overall)}</span>
    <span>p95 ${ge(t.duration_p95_ms)}</span>`}function vo(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function $o(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${r(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${r(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${r(e.status||"")}">${hn(e.status)}</span>
      <span class="mono">${r(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${r($e(e.started_at))}</span>
      <span data-bench-slot="run-completed">${c(e.completed_cases||0)} / ${c(e.total_cases||0)} \u984C</span>
      <span>${r(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${r(vo(e))}">${ho(e)}</span>
  </button>`}function Nr(e,t=[]){let s=e.metrics||{},a=e.judge||{},n=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([m])=>m.startsWith("rag.")).map(([m,f])=>`<span class="chip">${r(m)} ${ge(f)}</span>`).join(""),d=(e.law_sources||[]).map(m=>`<span class="chip">${r(m.law_name||"\u6CD5\u898F")} ${c((m.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${r(e.question)}</span>
      ${hn(e.status)}
      <span class="bench-case-time">${ge(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${bs(i.deterministic)} \xB7 Judge ${bs(i.judge)} \xB7 Human ${bs(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${r((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${r(e.fingerprint||"")}">${p("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
      </div>
      <div class="bench-case-stages">${l||'<span class="qb-muted">\u6C92\u6709 stage timing</span>'}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${Ps(s.law_recall)}</span>
        <span>Article recall ${Ps(s.article_recall)}</span>
        <span>Citation ${s.citation_valid?"valid":"invalid"}</span>
        <span>Refusal ${s.refusal_correct===null?"\u2014":s.refusal_correct?"correct":"wrong"}</span>
      </div>
      <div class="chips">${d||'<span class="qb-muted">\u6C92\u6709\u6CD5\u898F\u4F86\u6E90</span>'}</div>
      <div class="bench-answer"><strong>\u56DE\u7B54</strong><p>${r(e.answer||"\u2014")}</p></div>
      <div class="bench-judge"><strong>LLM judge</strong><p>${r(a.rationale||a.reason||"\u2014")}</p><span>${[["correctness",a.correctness],["grounding",a.grounding],["citation",a.citation],["clarity",a.clarity],["overall",a.overall]].map(([m,f])=>`${m} ${f??"\u2014"}`).join(" \xB7 ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${e.id}">
        <div class="bench-human-grid">
          ${[["correctness","\u6B63\u78BA\u6027",n.scores?.correctness??4],["grounding","\u6709\u64DA\u6027",n.scores?.grounding??4],["citation","\u5F15\u7528",n.scores?.citation??4],["clarity","\u6E05\u695A",n.scores?.clarity??4],["overall","\u6574\u9AD4",n.overall??4]].map(([m,f,y])=>Va({name:`score_${m}`,label:f,value:y})).join("")}
        </div>
        <label class="field"><span class="field-label">\u4EBA\u5DE5\u6279\u6CE8</span><input class="input" name="comment" value="${r(n.comment||"")}" placeholder="\u56DE\u7B54\u54C1\u8CEA\u3001\u5F15\u7528\u6216\u4E8B\u5BE6\u932F\u8AA4" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${p("check",13)}<span>\u5132\u5B58\u4EBA\u5DE5\u8A55\u5206</span></button>
      </form>
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(m=>`<div class="bench-history-row"><span>${r($e(m.run?.started_at))}</span><span>${r(m.run?.config?.llm_model||"\u2014")}</span><span>Det ${bs(m.metrics?.scores?.deterministic)}</span><span>Judge ${bs(m.metrics?.scores?.judge)}</span><span>Human ${bs(m.metrics?.scores?.human)}</span><span>${ge(m.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function Er(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function yo(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${Nr(e,t)}
  </details>`}function wo(e){return`${hn(e.status)}
    <span class="mono">${r(e.run_id)}</span>
    ${bn(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${p("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function Md(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${r(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${p("activity",14)}${r(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${r((e.status||"")+":"+e.run_id)}">
        ${wo(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${fo(e.summary||{})}</div>
    <div data-bench-detail="stages">${bo(e.summary||{})}</div>
    <div class="bench-run-config">
      <span><strong>Suite</strong> v${e.suite_version} \xB7 ${c((e.suite_snapshot?.items||[]).length)} \u984C</span>
      <span><strong>Embedding</strong> ${r(e.config?.embedding_model||"\u2014")}</span>
      <span><strong>LLM</strong> ${r(e.config?.llm_model||"\u2014")}</span>
      <span><strong>Judge</strong> ${r(e.config?.judge_model||"\u2014")}</span>
      <span><strong>Index</strong> ${r(e.index_version?.physical_collection||"\u2014")}</span>
      <span><strong>Top K</strong> ${r(String(e.config?.top_k??"\u2014"))}</span>
      <span><strong>Law retrieval</strong> ${e.config?.enable_law_retrieval?"on":"off"}</span>
      <span><strong>Config hash</strong> <span class="mono">${r((e.config_hash||"").slice(0,16))}</span></span>
    </div>
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>yo(a,t[a.fingerprint]||[])).join(""):Ge({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function _o(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${p("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${p("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function ko(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),n=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,n-i):0,l=(t||[]).filter(b=>["success","failed"].includes(b.status)).map(b=>Number(b.duration_ms)||0).filter(b=>b>0),d=null;if(l.length)d=l.reduce((b,w)=>b+w,0)/l.length;else if(a>0){let b=Date.parse(e.updated_at||""),w=Number.isFinite(b)?b:i;Number.isFinite(w)&&w>i?d=(w-i)/a:o>0&&(d=o/a)}let m=(t||[]).find(b=>b.status==="running")||null,f=0;if(a<s&&d&&d>0){let b=m?Date.parse(m.started_at||""):NaN,w=Date.parse(e.updated_at||""),k=Number.isFinite(b)?b:w;Number.isFinite(k)&&(f=Math.max(0,Math.min(.95,(n-k)/d)))}let y=Math.min(s,a+f),v=s>0?Math.max(0,Math.min(100,y/s*100)):0,u=d===null?null:Math.max(0,s-y)*d;return{total:s,completed:a,elapsedMs:o,averageMs:d,progress:v,etaMs:u,ratePerMin:d?6e4/d:null,running:m}}function So(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${ge(e)}`}function xo(e,t=[]){let s=ko(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${r(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${c(s.completed)} / ${c(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${So(s.etaMs)}</span>
      <span data-bench-slot="progress-rate">${s.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${s.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`}</span>
    </div>
    <div class="processing-bar processing-bar-lg bench-progress-bar${s.completed===0?" is-waiting":""}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.progress.toFixed(1)}" data-bench-slot="progress-bar">
      <span class="processing-bar-fill" data-bench-slot="progress-fill" style="width:${s.progress.toFixed(2)}%"></span>
    </div>
    <div class="bench-progress-foot">
      <span data-bench-slot="progress-elapsed">\u5DF2\u57F7\u884C ${ge(s.elapsedMs)}</span>
      <span data-bench-slot="progress-average">${s.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${ge(s.averageMs)}\uFF0F\u984C`}</span>
      <span>\u5373\u6642\u9810\u4F30 \xB7 \u6BCF\u5B8C\u6210\u4E00\u984C\u6821\u6B63</span>
    </div>
  </div>`}function Ld(e){let t=e.models?.models||{},s=e.suites||[],a=Aa(e),n=e.selectedRun;return`<section class="report-card bench-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("brain",14)}RAG Benchmark</span>
      <span class="badge ${e.indexVersion?.physical_collection?"badge-ok":"badge-warn"}">${r(e.indexVersion?.physical_collection||"\u7D22\u5F15\u672A\u8A2D\u5B9A")}</span>
    </div>
    <form class="bench-form" data-bench-form="run">
      <div class="bench-form-grid">
        <label class="field"><span class="field-label">Benchmark \u984C\u5EAB</span><select class="select" name="suite_id">${s.map(i=>`<option value="${i.id}" ${e.selectedSuiteId===i.id?"selected":""}>${r(i.name)} \xB7 ${c(i.item_count)} \u984C</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Embedding</span><select class="select" name="embedding_model">${(t.embedding||[]).map(i=>`<option value="${r(i)}" ${i===e.config.embedding_model?"selected":""}>${r(i)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">LLM</span><select class="select" name="llm_model">${(t.llm||[]).map(i=>`<option value="${r(i)}" ${i===e.config.llm_model?"selected":""}>${r(i)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Judge model</span><select class="select" name="judge_model"><option value="">\u4E0D\u57F7\u884C LLM judge</option>${(t.llm||[]).map(i=>`<option value="${r(i)}" ${i===e.config.judge_model?"selected":""}>${r(i)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Top K</span><input class="input" type="number" min="1" max="20" name="top_k" value="${r(String(e.config.top_k||4))}" /></label>
        <label class="field"><span class="field-label">Score threshold</span><input class="input" type="number" min="0" max="1" step="0.01" name="score_threshold" value="${r(String(e.config.score_threshold||.35))}" /></label>
        <label class="field"><span class="field-label">\u91CD\u8907\u6B21\u6578</span><input class="input" type="number" min="1" max="5" name="repeats" value="${r(String(e.config.repeats||1))}" /></label>
        <label class="checkbox-field bench-check"><input type="checkbox" name="enable_law_retrieval" ${e.config.enable_law_retrieval?"checked":""} /><span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22</span></label>
        <label class="checkbox-field bench-check"><input type="checkbox" name="judge_enabled" ${e.config.judge_enabled?"checked":""} /><span>LLM judge</span></label>
      </div>
      <label class="field"><span class="field-label">Run \u6A19\u7C64</span><input class="input" name="label" value="${r(e.config.label||aa())}" /></label>
      <div class="qb-actions" data-bench-actions data-signature="${r(a?`${a.run_id}:${a.status}`:"")}">
        ${_o(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${r(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?xo(a,Rr(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>$o(i,n?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${n?Md(n,e.history):""}
  </section>`}function Aa(e){let t=(e.runs||[]).find(s=>bn(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!bn(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function Rr(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function Ao(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:aa(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",refreshStream:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),n=L=>{let q=new FormData(L);return{label:String(q.get("label")||"").trim()||aa(),embedding_model:String(q.get("embedding_model")||""),llm_model:String(q.get("llm_model")||""),judge_model:String(q.get("judge_model")||""),top_k:Number(q.get("top_k")||4),score_threshold:Number(q.get("score_threshold")||.35),repeats:Number(q.get("repeats")||1),enable_law_retrieval:L.elements.enable_law_retrieval?.checked??!0,judge_enabled:L.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(L=>`${L.id}:${L.name}:${L.item_count}:${L.version}:${L.status}`)]:null,runs:(s.runs||[]).map(L=>`${L.run_id}:${L.label||""}:${L.suite_version||1}`)}),o=()=>{let q=a()?.querySelector("[data-bench-live]"),j=Aa(s);if(!q||!j)return;let V=ko(j,Rr(s,j)),de=(qe,F)=>{let ke=q.querySelector(`[data-bench-slot="${qe}"]`);ke&&ke.textContent!==F&&(ke.textContent=F)};de("progress-count",`${c(V.completed)} / ${c(V.total)} \u984C`),de("progress-percent",`${V.progress.toFixed(1)}%`),de("progress-eta",So(V.etaMs)),de("progress-rate",V.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${V.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),de("progress-elapsed",`\u5DF2\u57F7\u884C ${ge(V.elapsedMs)}`),de("progress-average",V.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${ge(V.averageMs)}\uFF0F\u984C`),de("progress-state",j.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let z=q.querySelector('[data-bench-slot="progress-bar"]');z&&(z.setAttribute("aria-valuenow",V.progress.toFixed(1)),z.classList.toggle("is-waiting",V.completed===0));let Z=q.querySelector('[data-bench-slot="progress-fill"]');Z&&(Z.style.width=`${V.progress.toFixed(2)}%`)},l=L=>{let q=L.querySelector("[data-bench-actions]");if(!q)return;let j=Aa(s),V=j?`${j.run_id}:${j.status}`:"";q.dataset.signature!==V&&(q.dataset.signature=V,q.innerHTML=_o(j))},d=L=>{let q=L.querySelector("[data-bench-live-wrap]");if(!q)return;let j=Aa(s),V=j?`${j.run_id}:${j.status}:${j.total_cases}`:"";q.dataset.signature!==V&&(q.dataset.signature=V,q.innerHTML=j?xo(j,Rr(s,j)):"")},m=L=>{let q=L.querySelector("[data-bench-runs]");if(!q)return;let j=s.runs||[],V=[...q.querySelectorAll("[data-run-id]")].map(z=>z.dataset.runId),de=j.map(z=>z.run_id);if(V.join("|")!==de.join("|")){q.innerHTML=j.length?j.map(z=>$o(z,s.selectedRun?.run_id===z.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let z of j){let Z=q.querySelector(`[data-run-id="${z.run_id}"]`);if(!Z)continue;Z.classList.toggle("is-active",s.selectedRun?.run_id===z.run_id);let qe=Z.querySelector('[data-bench-slot="run-label"]');qe&&qe.textContent!==(z.label||"RAG Benchmark")&&(qe.textContent=z.label||"RAG Benchmark");let F=Z.querySelector('[data-bench-slot="run-status"]');F&&F.dataset.status!==(z.status||"")&&(F.dataset.status=z.status||"",F.innerHTML=hn(z.status));let ke=Z.querySelector('[data-bench-slot="run-completed"]');if(ke){let Pe=`${c(z.completed_cases||0)} / ${c(z.total_cases||0)} \u984C`;ke.textContent!==Pe&&(ke.textContent=Pe)}let ne=Z.querySelector('[data-bench-slot="run-scores"]'),Se=vo(z);ne&&ne.dataset.signature!==Se&&(ne.dataset.signature=Se,ne.innerHTML=ho(z))}},f=L=>{let q=s.selectedRun;if(!q)return;let j=L.querySelector(`.bench-detail[data-run-id="${q.run_id}"]`);if(!j)return;let V=j.querySelector("[data-bench-detail-actions]");if(V){let ne=`${q.status||""}:${q.run_id}`;V.dataset.signature!==ne&&(V.dataset.signature=ne,V.innerHTML=wo(q))}let de=j.querySelector('[data-bench-detail="metrics"]');if(de){let ne=JSON.stringify(q.summary||{});de.dataset.signature!==ne&&(de.dataset.signature=ne,de.innerHTML=fo(q.summary||{}))}let z=j.querySelector('[data-bench-detail="stages"]');if(z){let ne=JSON.stringify((q.summary||{}).stages||{});z.dataset.signature!==ne&&(z.dataset.signature=ne,z.innerHTML=bo(q.summary||{}))}let Z=j.querySelector("[data-bench-cases]");if(!Z)return;let qe=q.cases||[];if(!qe.length)return;let F=Z.querySelector(".notice");F&&F.remove();let ke=new Map([...Z.querySelectorAll("details.bench-case")].map(ne=>[Number(ne.dataset.resultId),ne]));for(let ne of qe){let Se=s.history[ne.fingerprint]||[],Pe=Er(ne,Se),Le=ke.get(Number(ne.id));if(!Le){Z.insertAdjacentHTML("beforeend",yo(ne,Se)),Le=Z.lastElementChild,Le&&(Le._benchSignature=Pe);continue}if(Le._benchSignature===Pe||!s.forcedCaseIds.delete(Number(ne.id))&&Le.contains(document.activeElement))continue;let he=Le.open;Le.innerHTML=Nr(ne,Se),Le.open=he,Le._benchSignature=Pe}},y=()=>{Aa(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},v=()=>{let L=a();L&&(l(L),d(L),m(L),f(L),o(),y())},u=L=>{let q=s.selectedRun;if(!q)return;let j=L.querySelector('[data-bench-detail="metrics"]');j&&(j.dataset.signature=JSON.stringify(q.summary||{}));let V=L.querySelector('[data-bench-detail="stages"]');V&&(V.dataset.signature=JSON.stringify((q.summary||{}).stages||{}));let de=L.querySelector("[data-bench-cases]");if(!de)return;let z=new Map((q.cases||[]).map(Z=>[Number(Z.id),Z]));for(let Z of de.querySelectorAll("details.bench-case")){let qe=z.get(Number(Z.dataset.resultId));qe&&(Z._benchSignature=Er(qe,s.history[qe.fingerprint]||[]))}},b=(L=!1)=>{let q=a();if(!q)return;let j=i();if(!L&&s.renderSignature===j){v();return}s.renderSignature=j,s.forcedCaseIds.clear(),q.innerHTML=Ld(s),u(q),v()},w=async({refreshAll:L=!1,runs:q=null}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||L;return}s.loading=!0;try{if(!s.referenceLoaded||L){let[F,ke]=await Promise.all([Q.benchmarkModels(),Q.benchmarkSuites()]);s.models=F,s.suites=ke.suites||[],s.indexVersion=F.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=F.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=F.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(F.models?.llm||[]).find(ne=>ne!==s.config.llm_model)||"")}let j=q?{runs:q}:await Q.benchmarkRuns(30);s.runs=j.runs||[];let V=s.activeRunId,de=s.runs.find(F=>bn(F.status))||null;s.activeRunId=de?.run_id||"";let z=s.selectedRun?.run_id||"";z||(z=de?.run_id||s.runs[0]?.run_id||"");let Z=!!(s.selectedRun&&V&&s.selectedRun.run_id===V);z&&(!s.selectedRun||s.selectedRun.run_id!==z||z===de?.run_id||Z)?s.selectedRun=await Q.benchmarkRun(z,!0):z||(s.selectedRun=null),s.loaded=!0,b()}catch(j){if(!s.loaded){s.renderSignature="";let V=a();V&&(V.innerHTML=Ge({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:r(j.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let j=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,w({refreshAll:j})}}},k=()=>{s.refreshStream||(s.refreshStream=Mt("benchmark",(L,q)=>{s.loading||w({runs:q?.snapshot?.runs||null})}))},A=async L=>{try{s.selectedRun=await Q.benchmarkRun(L,!0),b()}catch(q){R(q.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},S=async L=>{!s.labelTouched&&L.elements.label&&(L.elements.label.value=aa());let q=n(L);s.config=q;let j=Number(L.elements.suite_id?.value||0);if(!j){R("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await Q.startBenchmarkRun({suite_id:j,config:q,actor:"anonymous"}),R("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=aa(),s.labelTouched=!1,await w()}catch(V){R(V.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},$=async L=>{try{await Q.stopBenchmarkRun(L),R("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await w()}catch(q){R(q.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},T=async L=>{let q=Number(L.dataset.resultId||0),j=new FormData(L),V={};for(let de of["correctness","grounding","citation","clarity","overall"]){let z=Number(j.get(`score_${de}`));Number.isFinite(z)&&(V[de]=z)}try{await Q.reviewBenchmarkResult(q,{reviewer:"anonymous",scores:V,comment:String(j.get("comment")||"")}),R("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await Q.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(q)),b()}catch(de){R(de.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},K=async L=>{if(L)try{let q=await Q.benchmarkFingerprintHistory(L,50);s.history[L]=q.cases||[];let j=s.selectedRun,V=a();if(!j||!V)return;let de=(j.cases||[]).filter(z=>z.fingerprint===L);for(let z of de){let Z=V.querySelector(`details.bench-case[data-result-id="${z.id}"]`);if(!Z)continue;let qe=Z.open;Z.innerHTML=Nr(z,s.history[L]),Z.open=qe,Z._benchSignature=Er(z,s.history[L])}}catch(q){R(q.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},G=async L=>{let q=L.target.closest("[data-bench-action]");if(!q)return;let j=q.dataset.benchAction;j==="open-run"?await A(q.dataset.runId||""):j==="stop"?await $(q.dataset.runId||""):j==="fingerprint-history"&&await K(q.dataset.fingerprint||"")},fe=async L=>{let q=L.target.closest("[data-bench-form]");q&&(L.preventDefault(),q.dataset.benchForm==="run"?await S(q):q.dataset.benchForm==="human"&&await T(q))},ye=L=>{L&&(L.elements.label&&L.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=n(L),L.elements.suite_id&&(s.selectedSuiteId=Number(L.elements.suite_id.value)||s.selectedSuiteId))},ie=L=>{let q=L.target.closest('[data-bench-form="run"]');q&&ye(q)};return e.addEventListener("click",G),e.addEventListener("submit",fe),e.addEventListener("input",ie),e.addEventListener("change",ie),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=aa();let L=a()?.querySelector('input[name="label"]');L&&(L.value=s.config.label)}k(),w({refreshAll:!s.referenceLoaded})},refresh(){return k(),w({refreshAll:!0})},destroy(){e.removeEventListener("click",G),e.removeEventListener("submit",fe),e.removeEventListener("input",ie),e.removeEventListener("change",ie),s.refreshStream&&s.refreshStream(),s.refreshStream=null,s.tickTimer&&window.clearInterval(s.tickTimer)}}}var Hr={};us(Hr,{exportCsv:()=>kn,exportableResult:()=>Sn,render:()=>pu,renderReport:()=>yn,reportError:()=>_n,reportLoading:()=>qa});var Ro=[10,25,50,100],qo=500,jd=["law_name","law_level","law_category","law_modified_date","article_count"],Td=["jid","court_normalized","title","jdate","matched_laws","citation_count"],Ed={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function wn(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function vn(e,t){let s={};for(let a of e.fields||[]){let n=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?n:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{},fuzzyTerms:[]}}function Nd(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,n]of Object.entries(s))if(Array.isArray(n)&&!n.map(String).includes(String(t[a]??"")))return!1;return!0}function Or(e,t){return(e.fields||[]).filter(s=>Nd(s,t))}function Rd(e,t){return`filter-${e.id}-${t}`}function Is(e){return e==null?"":r(String(e))}function Cr(e,t,s){let a=s[t.key],n=Rd(e,t.key),i=t.help?`<span class="field-help">${r(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
      <label class="checkbox-field" for="${n}">
        <input type="checkbox" id="${n}" name="${r(t.key)}" ${a?"checked":""} />
        <span class="checkbox-copy">
          <strong>${r(t.label)}</strong>
          ${t.help?`<span>${r(t.help)}</span>`:""}
        </span>
      </label>
    </div>`;let o=`<label class="field-label" for="${n}">
      <span>${r(t.label)}</span>
      <span class="field-tag">${r(t.key)}</span>
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(d=>`<option value="${Is(d.value)}" ${String(d.value)===String(a??"")?"selected":""}>${r(d.label??d.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${n}" name="${r(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),d=(t.options||[]).map(m=>`<label class="multi-option">
          <input type="checkbox" name="${r(t.key)}" value="${Is(m.value)}" ${l.has(String(m.value))?"checked":""} />
          <span>${r(m.label??m.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${d}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${n}" name="${r(t.key)}"
        value="${Is(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${Is(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${n}" name="${r(t.key)}"
        value="${Is(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${n}" name="${r(t.key)}"
      value="${Is(a)}"
      placeholder="${Is(t.placeholder||"")}" />
    ${i}
  </div>`}function Mo(e,t,{focusTable:s=!1}={}){let a=Or(e,t.values),n=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(n.push(`<div class="field-row">${Cr(e,o,t.values)}${Cr(e,l,t.values)}</div>`),i+=1):n.push(Cr(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
    <div class="filter-block">
      <div class="filter-head">
        <span class="filter-title">Metadata \u689D\u4EF6</span>
        <button class="filter-reset" type="button" data-action="reset">\u91CD\u8A2D</button>
      </div>
      <div class="filter-fields">${n.join("")}</div>
    </div>
    <div class="sidebar-actions">
      <button class="btn btn-primary" type="submit" id="run-query" ${s?'data-focus-table="true"':""}>
        ${p("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
      </button>
    </div>
  </form>`}function $n(e,t,s){let a={...s.values};for(let n of Or(t,a))if(n.type==="checkbox"){let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=!!i?.checked}else if(n.type==="multiselect")a[n.key]=Array.from(e.querySelectorAll(`[name="${n.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=i?i.value:""}return a}function Co(e,t){let s={};for(let a of Or(e,t.values)){let n=t.values[a.key];a.type==="checkbox"?s[a.key]=!!n:a.type==="multiselect"?s[a.key]=Array.isArray(n)?n:[]:a.type==="number"?s[a.key]=n===""||n===null?"":Number(n):s[a.key]=n??""}return s}function Pr(e,t){let s=Co(e,t);return Array.isArray(t.fuzzyTerms)&&t.fuzzyTerms.length&&(s.keywords=[...t.fuzzyTerms]),(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function Cd(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${Ge({tone:t,title:`${wn(e)} ${Wt(e.status).label}`,text:r(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function Pd(e,t){return`<label class="field data-source-field">
    <span class="field-label">\u8CC7\u6599\u4F86\u6E90</span>
    <select class="select" name="database">
      ${e.map(s=>{let a=Wt(s.status);return`<option value="${r(s.id)}" ${s.id===t?"selected":""}>${r(s.label)} \xB7 ${r(a.label)}</option>`}).join("")}
    </select>
  </label>`}function Lo(e,t){return`<nav class="data-nav" aria-label="\u8CC7\u6599\u67E5\u8A62\u529F\u80FD">
    ${[{id:"law",label:"\u67E5\u8A62\u6CD5\u898F\u547D\u4EE4",hint:"Fuzzy \u6CD5\u898F\u540D\u7A31\u3001\u985E\u5225\u8207\u547D\u4EE4",icon:"file"},{id:"judgment",label:"\u67E5\u8A62\u5224\u6C7A",hint:"Fuzzy \u6CD5\u9662\u3001\u6848\u865F\u8207\u6848\u7531",icon:"layers"},{id:"schema",label:"\u8CC7\u6599\u5EAB Schema",hint:"\u8CC7\u6599\u8868\u3001\u6B04\u4F4D\u8207\u9810\u89BD",icon:"table"}].map(a=>{let n=a.id==="schema"?t==="schema":t==="query"&&e===a.id;return`<button class="data-nav-item${n?" is-active":""}" type="button"
          data-action="data-nav" data-tab="${a.id}" ${n?'aria-current="page"':""}>
          <span class="data-nav-icon">${p(a.icon,15)}</span>
          <span class="data-nav-copy">
            <strong>${r(a.label)}</strong>
            <small>${r(a.hint)}</small>
          </span>
        </button>`}).join("")}
  </nav>`}function Id(e,t,s){if(t.id!=="postgres"&&t.id!=="parquet")return"";let a=Array.isArray(s.fuzzyTerms)?s.fuzzyTerms:[],n=e==="law"?"Fuzzy \u6CD5\u898F\uFF0F\u547D\u4EE4":"Fuzzy \u5224\u6C7A",i=e==="law"?"\u8F38\u5165\u6CD5\u898F\u540D\u7A31\u6216\u76F8\u8FD1\u5B57\u2026":"\u8F38\u5165\u6CD5\u9662\u3001\u6848\u865F\u3001\u6848\u7531\u6216\u76F8\u8FD1\u5B57\u2026";return`<div class="data-fuzzy" data-data-fuzzy data-fuzzy-kind="${e}">
    <div class="data-fuzzy-head">
      <span class="filter-title">${n}</span>
      <span class="field-tag">\u591A\u689D\u4EF6 AND</span>
    </div>
    <div class="data-fuzzy-row">
      <div class="data-fuzzy-values">
        ${a.length?a.map(o=>`<span class="chip data-fuzzy-chip">${r(o)}<button class="data-fuzzy-remove" type="button" data-action="remove-fuzzy-term" data-term="${r(o)}" aria-label="\u79FB\u9664 ${r(o)}">${p("x",9)}</button></span>`).join(""):`<span class="data-fuzzy-placeholder">${i}</span>`}
      </div>
      <button class="data-fuzzy-add" type="button" data-action="open-fuzzy" aria-label="\u52A0\u5165 fuzzy \u689D\u4EF6" aria-haspopup="listbox">${p("plus",13)}</button>
    </div>
    <div class="data-fuzzy-popover" data-data-fuzzy-popover hidden>
      <input class="input" type="search" data-data-fuzzy-search placeholder="${i}" autocomplete="off" />
      <div class="data-fuzzy-results" data-data-fuzzy-results role="listbox" aria-live="polite"></div>
    </div>
  </div>`}function Ir(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],n=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
            data-action="select-schema-table"
            data-table-id="${r(i.id)}">
            <span class="schema-item-top">
              <span class="schema-item-name">${r(i.label||i.id)}</span>
              <span class="schema-item-action">${e.id==="qdrant"?"\u6AA2\u8996":"\u9810\u89BD"}</span>
            </span>
            <span class="schema-item-id mono">${r(i.id)}</span>
            <span class="schema-item-desc">${r(i.description||"")}</span>
          </button>`).join(""):'<div class="report-empty-inline">\u9019\u500B\u8CC7\u6599\u5EAB\u6C92\u6709\u53EF\u986F\u793A\u7684\u8CC7\u6599\u8868\u3002</div>';return`<div class="schema-panel">
    <div class="filter-head">
      <span class="filter-title">${r(t||"\u8CC7\u6599\u8868")} \xB7 Schema</span>
      <span class="field-tag">${r(e.label||e.id)}</span>
    </div>
    <div class="schema-list">${n}</div>
    <div class="sidebar-note">\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u5728\u53F3\u5074\u9810\u89BD\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002</div>
  </div>`}function Dd(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||r(e.detail||"")}function Bd(e){return`<div class="report-empty">
    ${yt({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:r({postgres:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u6CD5\u898F\u6216\u5224\u6C7A\u689D\u4EF6\uFF0C\u518D\u8996\u9700\u8981\u5C55\u958B\u9032\u968E metadata \u689D\u4EF6\u3002",parquet:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u689D\u4EF6\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\uFF1B\u53EF\u5C55\u958B\u9032\u968E\u689D\u4EF6\u8ABF\u6574\u6B04\u4F4D\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
    <div class="query-hint-grid">
      <div class="query-hint">
        <strong>01 \xB7 \u9078\u64C7\u529F\u80FD</strong>
        <span>\u5DE6\u5074\u5207\u63DB\u67E5\u8A62\u6CD5\u898F\u547D\u4EE4\u3001\u67E5\u8A62\u5224\u6C7A\u6216\u8CC7\u6599\u5EAB Schema\u3002</span>
      </div>
      <div class="query-hint">
        <strong>02 \xB7 \u52A0\u5165 fuzzy \u689D\u4EF6</strong>
        <span>\u8F38\u5165\u76F8\u8FD1\u5B57\u4E26\u5F9E suggestion \u9078\u64C7\uFF0C\u6309 + \u53EF\u52A0\u5165\u591A\u500B\u689D\u4EF6\uFF08AND\uFF09\u3002</span>
      </div>
      <div class="query-hint">
        <strong>03 \xB7 \u6AA2\u8996\u7D50\u679C</strong>
        <span>\u53F3\u5074\u7522\u751F\u6458\u8981\u3001\u5206\u5E03\u3001\u5BE6\u969B\u67E5\u8A62\u8A9E\u53E5\u8207\u53EF\u532F\u51FA\u7684\u8CC7\u6599\u8868\u3002</span>
      </div>
    </div>
  </div>`}function qa(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(wn(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function _n(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(wn(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Ge({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${p("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Fd(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,n=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${r(s.label||"\u672A\u5206\u985E")}">${r(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${n.toFixed(1)}%"></span></span>
          <span class="dist-value">${c(a)}</span>
        </div>`}).join("")}
  </div>`}function Po(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function Od(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function Hd(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function zd(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${r(String(t))}"
    title="\u6AA2\u8996\u300C${r(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${r(String(t))}${p("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var Ud={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function Gd(e,t,s,a=!1,n=!0,i=!1){let o=a?e.key:e.label||e.key,l=n?t?Ud[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${r(o)}</th>`;let d=s?.key===l,m=d?s.direction:null,f=m==="asc"?"ascending":m==="desc"?"descending":"none",y=m==="asc"?"\u2191":m==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${f}">
    <button class="table-sort${d?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${r(l)}"
      title="\u4F9D${r(o)}\u6392\u5E8F">
      <span>${r(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${y}</span>
    </button>
  </th>`}function Qd(e,t){if(!Po(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,n=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(n||""),lawName:String(t.law_name||"")}}function Jd(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${r(s.lawKey)}"
    data-law-source="${r(s.sourceType)}"
    data-law-name="${r(s.lawName)}"
    title="\u6AA2\u8996\u300C${r(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(String(a))}${p("chevronRight",12,"law-link-icon")}</button>`}function Io(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:n=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],d=(e.page-1)*e.page_size,m=Po(e),f=Od(e),y=Hd(e),v=e.meta?.sort||null,u=n?`<tr class="schema-search-row">
        <th scope="col" class="cell-index-head"></th>
        ${o.map(b=>`<th scope="col">
              <div class="schema-search-wrap">
                <input class="schema-search-input" type="search"
                  data-schema-search="${r(b.key)}"
                  value="${r(String(n[b.key]??""))}"
                  placeholder="\u641C\u5C0B ${r(b.key)}"
                  autocomplete="off" />
              </div>
            </th>`).join("")}
      </tr>`:"";return o.length?l.length?`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">${c(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${m?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":f?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":y?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${u}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(b=>Gd(b,f,v,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((b,w)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${d+w+1}</td>
                ${o.map(k=>{if((f||y)&&k.key==="jid")return`<td class="cell-jid">${zd(b)}</td>`;let A=m&&k.key==="law_name"?Qd(e,b):null;if(A)return`<td>${Jd(b,k,A)}</td>`;let $={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[k.type];return`<td${$?` class="${$}"`:""}>${Wa(b[k.key],k.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${yt({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function Wd(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Ro.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${p("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${p("chevronRight",13)}</button>
    </div>
  </div>`}function Do(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${r(t)}</div>`).join("")}</div>`}function yn(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],n=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",d=e.status||"ok",m=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${r(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${r(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${r(e.label||l)}
          ${at(d)}
          <span class="chip">${r(m)}</span>
        </div>
        <div class="report-sub">
          ${c(i)} \u7B46\u7B26\u5408 \xB7
          ${ge(e.duration_ms)} \xB7
          ${r(String(l).toUpperCase())} / ${r(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${p("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${p("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${Ge({tone:d==="not_configured"?"info":d==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:""}

    ${a.length?`<div class="summary-strip">
            ${a.slice(0,4).map(f=>`<div class="summary-item">
                  <div class="summary-label">${r(f.label)}</div>
                  <div class="summary-value">${r(f.value)}</div>
                </div>`).join("")}
          </div>`:""}

    <div class="report-grid">
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u7D50\u679C\u5206\u5E03</span>
          <span class="muted" style="font-size:9.5px">${n.length} groups</span>
        </div>
        ${Fd(n)}
      </div>
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5BE6\u969B\u67E5\u8A62\u8A9E\u53E5</span>
          <span class="muted" style="font-size:9.5px">${r(e.database==="indexeddb"?"client-side":"read-only")}</span>
        </div>
        <div class="query-box">
          <pre class="query-code">${r(o||"\u2014")}</pre>
          <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
            ${p("copy",12)}<span>\u8907\u88FD</span>
          </button>
        </div>
        ${Do(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?Io(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?Wd({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function jo(e){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${r(e||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u6B63\u5728\u8B80\u53D6\u6B04\u4F4D\u8207\u524D 10 \u7B46\u8CC7\u6599\u2026</div>
      </div>
      <span class="spinner" aria-hidden="true"></span>
    </div>
    <div class="report-loading">
      <div class="skeleton skeleton-line" style="width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>
  </div>`}function Dr(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let n=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${Ge({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${r(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${r(t||e.table||"\u8CC7\u6599\u8868")}
          ${at(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${r(String(e.database||""))} / ${r(String(e.table||"\u2014"))} \xB7 ${n.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${Io({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${Do(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${c(i.length)} \u7B46</span>
      <strong>\u5171 ${c(e.total)} \u7B46</strong>
    </div>
  </div>`}function To(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${r(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${Ge({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function Vd(e){return`<div class="report-empty">
    ${yt({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${wn(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function Br(e){return e.is_current===!0?at("ok","\u73FE\u884C"):e.law_abandon_note?at("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?at("empty","\u6B77\u53F2\u7248\u672C"):at("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function mt(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${r(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function Ds(e){return e?Jt(e):"\u2014"}function Kd(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function Fr(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${r(e)}</span>
    </div>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </div>`:""}function Yd(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${r(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${p("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </details>`:""}function Xd(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let n=a?.name||a?.url||"";return n?a.url?`<a class="law-attachment" href="${r(It(a.url))}" target="_blank" rel="noopener noreferrer">
          ${p("file",12)}<span>${r(n)}</span>${p("external",11)}
        </a>`:`<span class="law-attachment">${p("file",12)}<span>${r(n)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${c(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function Bo(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Zd(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,n=s?`${c(a)} \u689D \xB7 ${c(s)} \u7AE0\u7BC0`:`${c(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${r(l)}</div>`;let d=Ed[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${r(Bo(o.article_no))}">
        <div class="law-article-head">
          <span class="law-article-no">${r(o.article_no||"\u689D\u6587")}</span>
          ${d&&d!=="\u689D\u6587"?`<span class="chip">${r(d)}</span>`:""}
        </div>
        <div class="law-article-text">${r(l)}</div>
      </article>`}).join("");return`<div class="report-section law-articles-section">
    <div class="report-section-head">
      <span class="report-section-title">\u689D\u6587\u5167\u5BB9</span>
      <div class="law-article-controls">
        <span class="muted">${n}</span>
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
  </div>`}function eu(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function na(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${p("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function tu(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${na()}
      <span class="law-report-origin">\u6B63\u5728\u8F09\u5165\u6CD5\u898F\u5831\u8868\u2026</span>
    </div>
    <div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT</div>
          <div class="report-title">${r(e||"\u6CD5\u898F")}</div>
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
  </div>`}function su(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${na()}
      <span class="law-report-origin">\u6CD5\u898F\u5831\u8868\u8F09\u5165\u5931\u6557</span>
    </div>
    <div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT</div>
          <div class="report-title">${r(t||"\u6CD5\u898F")}</div>
          <div class="report-sub">\u7121\u6CD5\u53D6\u5F97\u9019\u500B\u6CD5\u898F\u7684\u5B8C\u6574\u5831\u8868\u3002</div>
        </div>
      </div>
      <div class="report-section">
        ${Ge({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function au(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let n=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",n,a.article_count_for_law?`${c(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${r(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${r(i)}</option>`}).join("")}
    </select>
  </label>`}function nu(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let n={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${n[o]} ${c(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">\u7248\u672C\u8B8A\u66F4</span>
      <span class="muted">${r(i)}</span>
    </summary>
    <div class="law-version-change-list">
      ${a.length?a.slice(0,20).map(o=>{let l=o.change_type==="added"?"badge-ok":o.change_type==="removed"?"badge-danger":"badge-warn",d=o.before_content?`<details><summary>\u8B8A\u66F4\u524D</summary><pre>${r(o.before_content)}</pre></details>`:"",m=o.after_content?`<details><summary>\u8B8A\u66F4\u5F8C</summary><pre>${r(o.after_content)}</pre></details>`:"";return`<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${l}">${r(n[o.change_type]||o.change_type)}</span>
                    <strong>${r(o.article_no||o.article_key)}</strong>
                  </div>
                  ${d}${m}
                </div>`}).join(""):'<div class="report-empty-inline">\u6B64\u7248\u672C\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u8B8A\u66F4\u3002</div>'}
      ${e.changes_truncated?'<div class="report-empty-inline">\u50C5\u986F\u793A\u524D 20 \u7B46\u8B8A\u66F4\uFF1BAPI \u56DE\u50B3\u4E0A\u9650 200 \u7B46\u3002</div>':""}
    </div>
  </details>`}function ru(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let n=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(w=>w.article_type!=="C").length,l=Kd(e),d=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",m=e.meta?.snapshot||"",f=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",y=[l,d,f,m].filter(Boolean).join(" \xB7 "),v=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",u=e.version||{},b=[mt("\u6CD5\u898F\u4F4D\u968E",r(e.law_level||"\u2014")),mt("\u6CD5\u898F\u985E\u5225",r(e.law_category||"\u2014")),mt("\u7570\u52D5\u65E5\u671F",Ds(e.law_modified_date)),mt("\u751F\u6548\u65E5\u671F",Ds(e.law_effective_date)),mt("\u689D\u6587\u6578",c(e.article_count)),mt("\u8CC7\u6599\u72C0\u614B",Br(e)),mt("\u82F1\u8B6F\u540D\u7A31",r(e.eng_law_name||"\u2014")),mt("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${r(e.law_key||"\u2014")}</span>`)];return u.first_seen_version_id!==null&&u.first_seen_version_id!==void 0&&b.push(mt("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${r(u.first_seen_version_id)}`)),u.last_seen_version_id!==null&&u.last_seen_version_id!==void 0&&b.push(mt("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${r(u.last_seen_version_id)}`)),u.last_seen_at&&b.push(mt("\u6700\u5F8C\u6536\u9304\u6642\u9593",r($e(u.last_seen_at)))),u.selected_version_id!==null&&u.selected_version_id!==void 0&&b.push(mt("\u689D\u6587\u7248\u672C",`#${r(u.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${na()}
      <span class="law-report-origin" title="${r(y)}">${r(y)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${r(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${r(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${r(i)}
            ${Br(e)}
            <span class="chip">${r(v)}</span>
          </div>
          <div class="report-sub">
            ${r([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${c(e.article_count)} \u689D \xB7 \u7570\u52D5 ${Ds(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${au(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">${p("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${n.length?`<div class="report-alert">${Ge({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n.map(w=>r(w)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${c(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${Ds(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${r(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${Br(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${r(l)}</span>
        </div>
        <div class="law-meta-grid">${b.join("")}</div>
      </div>

      ${nu(e)}
      ${Fr("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${Yd("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${Fr("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${Fr("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${Xd(e.attachments)}
      ${Zd(e)}
    </div>
    ${o>100?eu():""}
  </div>`}function iu(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${na()}
      <span class="law-report-origin">\u6B63\u5728\u8F09\u5165\u5224\u6C7A\u539F\u6587\u2026</span>
    </div>
    <div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">JUDGMENT REPORT</div>
          <div class="report-title">${r(e||"\u5224\u6C7A")}</div>
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
  </div>`}function ou(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${na()}
      <span class="law-report-origin">\u5224\u6C7A\u539F\u6587\u8F09\u5165\u5931\u6557</span>
    </div>
    <div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">JUDGMENT REPORT</div>
          <div class="report-title">${r(t||"\u5224\u6C7A")}</div>
          <div class="report-sub">\u7121\u6CD5\u53D6\u5F97\u9019\u7B46\u5224\u6C7A\u7684\u5B8C\u6574\u5167\u5BB9\u3002</div>
        </div>
      </div>
      <div class="report-section">
        ${Ge({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function lu(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${r(t)}"
    data-law-source=""
    data-law-name="${r(t)}"
    title="\u6AA2\u8996\u300C${r(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(t)}${p("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function cu(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let n=String(s.article_no||"").trim();n&&t.get(a).add(n)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${lu(s)}
          <span class="judgment-citation-articles">${[...a].map(n=>r(n)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function du(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",n=String(e.full_text||""),i=Number(e.full_text_length)||n.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[mt("\u6848\u865F",r(e.jid||"\u2014")),mt("\u5E74\u5EA6",r(e.jyear||"\u2014")),mt("\u5B57\u5225",r(e.jcase||"\u2014")),mt("\u865F\u78BC",r(e.jno||"\u2014")),mt("\u6CD5\u9662",r(e.court||"\u2014")),mt("\u6848\u7531",r(e.title||"\u2014")),mt("\u88C1\u5224\u65E5\u671F",Ds(e.jdate)),mt("\u4F86\u6E90\u58D3\u7E2E\u6A94",r(e.source_archive||"\u2014")),mt("\u5168\u6587\u9577\u5EA6",`${c(i)} \u5B57`),mt("\u5F15\u7528\u6578",c(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(mt("\u532F\u5165 Run",`#${r(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${na()}
      <span class="law-report-origin" title="${r(o)}">${r(o)}</span>
    </div>
    <div class="report-card law-report-card judgment-report-card" data-database="${r(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">JUDGMENT REPORT \xB7 ${r(String(t).toUpperCase())}</div>
          <div class="report-title">
            ${r(a)}
            <span class="chip">\u5224\u6C7A\u6587\u4EF6</span>
          </div>
          <div class="report-sub">
            ${r(e.court||"\u2014")} \xB7 ${Ds(e.jdate)} \xB7
            ${c(i)} \u5B57
          </div>
        </div>
        <div class="report-actions">
          ${e.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(e.pdf_url)}" target="_blank" rel="noopener noreferrer">${p("external",14)}<span>PDF</span></a>`:""}
        </div>
      </div>

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u88C1\u5224\u65E5\u671F</div>
          <div class="summary-value">${Ds(e.jdate)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u9662</div>
          <div class="summary-value summary-value-text">${r(e.court||"\u2014")}</div>
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
          <span class="muted" style="font-size:9.5px">${r(e.jid||"")}</span>
        </div>
        <div class="law-meta-grid">${l.join("")}</div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u547D\u4E2D\u6CD5\u898F\u8207\u5F15\u7528</span>
          <span class="muted">${c(s.length)} \u6CD5\u898F \xB7 ${c(e.citation_count)} \u5F15\u7528</span>
        </div>
        ${cu(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${c(i)} \u5B57</span>
        </div>
        ${n?`<div class="judgment-fulltext">${r(n)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function Eo(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function kn(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(Eo).join(",")],n=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([n+o+1,...t.map(l=>i[l.key])].map(Eo).join(","))}),`\uFEFF${a.join(`\r
`)}`}function Sn(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,n]of Object.entries(t))a.startsWith("_")||(s[a]=n);return s})}}function uu(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function No(e,t){let s=performance.now(),a=Co(e,t),n=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,d=[],m=[],f=[],y=[];if(n==="audit_events"){try{let $=Number(await qs("audit.last_event_id",0))||0,T=await Q.versioningAudit({since_id:$,limit:500}),K=Array.isArray(T?.events)?T.events:[];K.length&&await co(K.map(fe=>({...fe,dataset:"judgment"})));let G=Number(T?.latest_event_id||0);G>$&&await xa("audit.last_event_id",G)}catch($){d.push(`\u7248\u672C audit \u540C\u6B65\u5931\u6557\uFF1A${$.message||$}`)}m=(await uo({keyword:i,limit:qo})).map($=>({created_at:$.created_at,dataset:$.dataset,issue_month:$.issue_month,change_type:$.change_type,jid:$.jid,detail:$.detail})),f=[{key:"created_at",label:"\u6642\u9593",type:"datetime"},{key:"dataset",label:"\u8CC7\u6599\u96C6",type:"text"},{key:"issue_month",label:"\u6708\u4EFD",type:"mono"},{key:"change_type",label:"\u8B8A\u66F4",type:"status"},{key:"jid",label:"\u6848\u865F",type:"mono"},{key:"detail",label:"\u6458\u8981",type:"longtext"}];let S=new Map;m.forEach($=>S.set($.change_type||"unknown",(S.get($.change_type||"unknown")||0)+1)),y=Array.from(S.entries()).map(([$,T])=>({label:$,value:T})).sort(($,T)=>T.value-$.value)}else if(n==="settings"){m=(await mo({keyword:i})).map($=>({key:$.key,value:go($.value),updated_at:$.updated_at})),f=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let S=new Map;m.forEach($=>{let T=String($.key||"").split(".")[0]||"\u5176\u4ED6";S.set(T,(S.get(T)||0)+1)}),y=Array.from(S.entries()).map(([$,T])=>({label:$,value:T})).sort(($,T)=>T.value-$.value)}else{m=(await gn({keyword:i,limit:qo})).map($=>({kind:uu($.kind),title:$.title,detail:$.detail,created_at:$.created_at})),f=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let S=new Map;m.forEach($=>S.set($.kind,(S.get($.kind)||0)+1)),y=Array.from(S.entries()).map(([$,T])=>({label:$,value:T})).sort(($,T)=>T.value-$.value)}let v=m.length,u=(o-1)*l,b=m.slice(u,u+l),w=Math.round(performance.now()-s),k=io();return k&&d.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:k?"degraded":"ok",message:k?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:n,columns:f,rows:b,total:v,page:o,page_size:l,duration_ms:w,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(v)},{label:"\u76EE\u524D\u9801\u9762",value:`${b.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:_a()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${w} ms`}],distribution:y,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${n}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${u}`,warnings:d,meta:{store:n,filters:a,client_side:!0}}}async function pu(e,t){let s=!1,a=null,n=[],i="law",o=null,l={},d=0,m=25,f="query",y=null,v=null,u=0,b=[],w=null,k=-1,A=0,S=0,$=null,T=null,K=null;e.innerHTML=`<section class="page data-page">
    <div class="page-header">
      <div class="data-page-heading">
        <div class="eyebrow">DATA EXPLORER</div>
        <div class="data-title-line">
          <h1 class="page-title">\u8CC7\u6599\u5EAB\u67E5\u8A62\u8207\u5831\u8868</h1>
          <p class="page-subtitle data-page-subtitle">\u5DE6\u5074\u9078\u64C7\u300C\u67E5\u8A62\u6CD5\u898F\u547D\u4EE4\u300D\u3001\u300C\u67E5\u8A62\u5224\u6C7A\u300D\u6216\u300C\u8CC7\u6599\u5EAB Schema\u300D\uFF1B\u67E5\u8A62\u652F\u63F4 fuzzy \u591A\u689D\u4EF6\uFF08AND\uFF09\uFF0C\u4E5F\u53EF\u5C55\u958B\u9032\u968E metadata \u7BE9\u9078\u3002</p>
        </div>
      </div>
      <div class="page-actions">
        <span class="badge badge-neutral badge-mono" id="catalog-meta">CATALOG \xB7 \u8B80\u53D6\u4E2D</span>
        <button class="btn btn-secondary" type="button" id="refresh-catalog">
          ${p("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    <div class="processing-summary judgment-stats-cards" id="data-judgment-stats" aria-label="\u91D1\u878D\u6848\u4EF6\u4F54\u6BD4">
      ${ls(null,{loading:!0})}
    </div>
    <div class="data-layout">
      <aside class="card query-sidebar" id="query-sidebar" aria-label="\u8CC7\u6599\u67E5\u8A62\u529F\u80FD">
        <div id="data-nav"></div>
        <div id="db-options-wrap">
          <div style="padding:16px">
            <div class="skeleton skeleton-line" style="width:86%"></div>
            <div class="skeleton skeleton-line" style="width:62%"></div>
          </div>
        </div>
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
  </section>`;let G=e.querySelector("#query-sidebar"),fe=e.querySelector("#data-nav"),ye=e.querySelector("#db-options-wrap"),ie=e.querySelector("#filter-area"),L=e.querySelector("#schema-area"),q=e.querySelector("#query-main"),j=e.querySelector("#schema-suggest-popover"),V=e.querySelector("#catalog-meta"),de=e.querySelector("#refresh-catalog"),z=e.querySelector("#data-judgment-stats"),Z=x=>n.find(N=>N.id===x),qe=()=>Z(i)?.databases||[],F=x=>qe().find(N=>N.id===x),ke=(x,N)=>`${x}:${N}`,ne=(x,N=i)=>l[ke(N,x.id)],Se=(x,N)=>{xa(x,N).catch(()=>{})},Pe=()=>{if(!a){V.textContent="CATALOG \xB7 \u96E2\u7DDA",V.className="badge badge-danger badge-mono";return}let x=qe(),N=x.filter(O=>O.available).length,P=Z(i);V.textContent=`CATALOG \xB7 ${P?.label||i} \xB7 ${N}/${x.length} \u53EF\u7528`,V.className="badge badge-neutral badge-mono"},Le=x=>{q.innerHTML=Bd(x)},Ze=()=>{let x=T?.returnScroll??K?.returnScroll;T=null,K=null;let N=F(o),P=N?ne(N):null;f==="schema"&&v?.result?q.innerHTML=Dr(v.result,je(N,v.tableId),{columnFilters:v.columnFilters||{},searchEnabled:N.id==="postgres"||N.id==="parquet"}):P?.result?q.innerHTML=yn(P.result):N&&Le(N),typeof x=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:x,behavior:"smooth"}))},he=(x="law-article-jump")=>{let N=q.querySelector(`#${x}`),P=Bo(N?.value);if(!P){R("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),N?.focus();return}let Y=[...q.querySelectorAll("[data-article-no]")].find(se=>se.dataset.articleNo===P);if(!Y){R(`\u627E\u4E0D\u5230\u7B2C ${P} \u689D\u3002`,"warn");return}Y.scrollIntoView({behavior:"instant",block:"center"}),Y.classList.add("is-jump-target"),window.setTimeout(()=>Y.classList.remove("is-jump-target"),2400)},oe=async({lawKey:x,sourceType:N="",lawName:P="",versionId:O=""})=>{let Y=F(o),se=Y?ne(Y):null,me=f==="schema"?v?.result:null;if(!Y||!se?.result&&!me||!x)return;let Ue=++d;T={seq:Ue,lawKey:x,sourceType:N,lawName:P,versionId:O?String(O):"",page:1,detail:null,database:Y.id,returnScroll:window.scrollY},K=null,q.innerHTML=tu(P||x),q.scrollIntoView({behavior:"smooth",block:"start"});try{let Be=await Q.lawDetail(x,N,T.versionId);if(s||!T||T.seq!==Ue)return;T.detail=Be,T.page=1,q.innerHTML=ru(Be,{database:T.database,lawPage:T.page})}catch(Be){if(s||!T||T.seq!==Ue)return;q.innerHTML=su(Be,P||x),R(Be.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},ce=async({jid:x})=>{let N=F(o),P=N?ne(N):null,O=f==="schema"?v?.result:null;if(!N||!P?.result&&!O||!x)return;let Y=++d;T=null;let se=N.id==="parquet"?"parquet":"postgres";K={seq:Y,jid:x,detail:null,database:N.id,source:se,returnScroll:window.scrollY},q.innerHTML=iu(x),q.scrollIntoView({behavior:"smooth",block:"start"});try{let me=await Q.judgmentDetail(x,se);if(s||!K||K.seq!==Y)return;K.detail=me,q.innerHTML=du(me,{database:K.database})}catch(me){if(s||!K||K.seq!==Y)return;q.innerHTML=ou(me,x),R(me.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},ve=(x,N)=>`${i}:${x.id}:${N}`,je=(x,N)=>(x.tables||[]).find(P=>P.id===N)?.label||N,Te=(x,N,{sort:P=null,columnFilters:O={}}={})=>{let Y={column_filters:O};return x.id==="postgres"?(Y.table=N,Y.schema_preview=!0):x.id==="parquet"&&i==="judgment"?(Y.table="judgment_documents",Y.columns=Td):x.id==="parquet"&&(Y.dataset="all",Y.columns=jd),P?.key&&(Y.sort=`${P.key}:${P.direction}`),Y},C=async(x,N,{sort:P=null,columnFilters:O={},quiet:Y=!1}={})=>{if(!N)return;nt();let se=ve(x,N),me=++u,Ue=!!(Y&&v?.result&&v.key===se);y={tableId:N},v={key:se,tableId:N,loading:!0,result:null,error:null,sort:P,columnFilters:O},Ue?q.setAttribute("aria-busy","true"):(L.innerHTML=Ir(x,Z(i)?.label||i,N),q.innerHTML=jo(je(x,N)));try{let Be;if(x.id==="indexeddb"){let Ie=vn(x,10);Ie.values.store=N,Ie.page=1,Be=await No(x,Ie)}else x.id==="qdrant"?Be={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:N,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(Be=await Q.query({database:x.id,filters:Te(x,N,{sort:P,columnFilters:O}),page:1,pageSize:10}),P?.key&&(Be.meta={...Be.meta||{},sort:P}));if(s||me!==u)return;v={key:se,tableId:N,loading:!1,result:Be,error:null,sort:P,columnFilters:O},q.removeAttribute("aria-busy"),f==="schema"&&y?.tableId===N&&(L.innerHTML=Ir(x,Z(i)?.label||i,N),q.innerHTML=Dr(Be,je(x,N),{columnFilters:O,searchEnabled:x.id==="postgres"||x.id==="parquet"}))}catch(Be){if(s||me!==u)return;v={key:se,tableId:N,loading:!1,result:null,error:Be,sort:P,columnFilters:O},q.removeAttribute("aria-busy"),f==="schema"&&y?.tableId===N&&(q.innerHTML=To(Be,je(x,N)))}},D=()=>{let x=F(o);if(!x)return null;if(f==="schema"&&v?.result)return{db:x,tableId:v.tableId,columnFilters:v.columnFilters||{},sort:v.sort||null,mode:"schema"};let N=x?ne(x):null,P=N?.result;return P&&(x.id==="postgres"||x.id==="parquet")?{db:x,tableId:P.table,columnFilters:N.columnFilters||{},sort:N.sort||null,mode:"query"}:null},W=(x,N,P)=>{if(!x)return;let O=`${x.db.id}:${x.tableId}:${N}`,Y=I.get(O);Y&&(window.clearTimeout(Y),I.delete(O)),nt();let se={...x.columnFilters||{}},me=String(P||"").trim();if(me?se[N]=me:delete se[N],x.mode==="schema"){C(x.db,x.tableId,{sort:x.sort,columnFilters:se,quiet:!0});return}let Ue=ne(x.db);Ue.columnFilters=se,Ue.page=1,Ke(1)},I=new Map,H=()=>{(!j||j.hidden)&&!b.length&&!w||(A+=1,b=[],w=null,k=-1,j&&(j.hidden=!0,j.innerHTML=""))},J=(x,N)=>{let P=String(x||""),O=P.toLocaleLowerCase(),Y=String(N||"").toLocaleLowerCase(),se=new Array(P.length).fill(!1),me=(Ye,rt)=>{for(let lt=Ye;lt<Ye+rt;lt+=1)lt>=0&&lt<se.length&&(se[lt]=!0)},Ue=O.indexOf(Y);if(Ue>=0)for(;Ue>=0;)me(Ue,Y.length),Ue=O.indexOf(Y,Ue+Y.length);else{let Ye=[];for(let rt of Y.match(/[一-鿿]{2,}/g)||[])for(let lt=0;lt<rt.length-1;lt+=1)Ye.push(rt.slice(lt,lt+2));Ye.push(...Y.match(/[a-z0-9]+/g)||[]);for(let rt of Ye){let lt=O.indexOf(rt);for(;lt>=0;)me(lt,rt.length),lt=O.indexOf(rt,lt+rt.length)}}let Be="",Ie=0;for(;Ie<P.length;)if(se[Ie]){let Ye=Ie;for(;Ye<P.length&&se[Ye];)Ye+=1;Be+=`<mark>${r(P.slice(Ie,Ye))}</mark>`,Ie=Ye}else{let Ye=Ie;for(;Ye<P.length&&!se[Ye];)Ye+=1;Be+=r(P.slice(Ie,Ye)),Ie=Ye}return Be||r(P)},we=(x,N)=>{if(!j)return;let P=x.getBoundingClientRect(),O=Math.min(420,Math.max(220,P.width)),Y=Math.min(360,34+N*30),se=P.bottom+4;se+Y>window.innerHeight-8&&(se=Math.max(8,P.top-Y-4));let me=Math.min(window.innerWidth-O-8,Math.max(8,P.left));j.style.width=`${O}px`,j.style.left=`${me}px`,j.style.top=`${se}px`},Oe=x=>{if(!j)return;let N=[...j.querySelectorAll(".schema-suggest-item")];N.length&&(k=Math.max(0,Math.min(N.length-1,x)),N.forEach((P,O)=>{P.classList.toggle("is-active",O===k)}),N[k].scrollIntoView({block:"nearest"}))},Ve=x=>{let N=b[x],P=w;!N||!P||(H(),W(P,P.column,N))},ct=async(x,N,P,O)=>{if(!x||!P.trim()){H();return}let Y=++A;w={...x,column:N,input:O},k=-1;try{let se=await Q.schemaSuggest({database:x.db.id,table:x.tableId,column:N,query:P,limit:1e3});if(Y!==A||document.activeElement!==O||!j)return;let me=Array.isArray(se.values)?se.values:[];if(b=me,!me.length){H();return}let Ue=Number(se.total)>me.length?`\u5171 ${c(se.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${c(me.length)} \u500B`:`\u5171 ${c(se.total)} \u500B\u7B26\u5408`;j.innerHTML=`<div class="schema-suggest-head">${r(Ue)}</div>${me.map((Be,Ie)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${Ie}"
            title="${r(Be)}">${J(Be,P)}</button>`).join("")}`,we(O,me.length),j.hidden=!1}catch{H()}},nt=()=>{let x=document.activeElement;x instanceof HTMLElement&&x.matches("[data-schema-search]")&&x.blur(),H()},tt=(x,{resetReport:N=!1}={})=>{nt();let P=ne(x);if(fe.innerHTML=Lo(i,f),ye.innerHTML=Pd(qe(),x.id),f==="schema")ie.hidden=!0,ie.innerHTML="",L.hidden=!1,L.innerHTML=`<div class="schema-category-switch" role="tablist" aria-label="Schema \u985E\u5225">
        ${["law","judgment"].map(O=>{let Y=n.find(se=>se.id===O);return Y?`<button class="chip${i===O?" is-active":""}" type="button" role="tab" aria-selected="${i===O}" data-action="schema-category" data-category="${O}">${r(Y.label)}</button>`:""}).join("")}
      </div>${Ir(x,Z(i)?.label||i,y?.tableId||"")}`;else{L.hidden=!0,L.innerHTML="",ie.hidden=!1;let O=Id(i,x,P),Y=Mo(x,P);ie.innerHTML=`${Cd(x)}${O?`${O}<details class="data-advanced"><summary>\u9032\u968E metadata \u689D\u4EF6</summary>${Y}</details>`:Y}<div class="sidebar-note">${Dd(x)}</div>`}if(Pe(),f==="schema"){let O=y?ve(x,y.tableId):"";if(v&&v.key===O){let Y=je(x,v.tableId);v.loading?q.innerHTML=jo(Y):v.error?q.innerHTML=To(v.error,Y):q.innerHTML=Dr(v.result,Y,{columnFilters:v.columnFilters||{},searchEnabled:x.id==="postgres"||x.id==="parquet"})}else q.innerHTML=Vd(x);return}N?Le(x):P.result?q.innerHTML=yn(P.result):Le(x)},et=(x,{persist:N=!0,resetReport:P=!1}={})=>{let O=qe(),Y=O.find(me=>me.id===x)||O[0];if(!Y)return;T=null,K=null,y=null,v=null,u+=1,o=Y.id;let se=ke(i,Y.id);l[se]||(l[se]=vn(Y,m)),tt(Y,{resetReport:P}),N&&(Se(`data.last_database.${i}`,Y.id),Se("data.last_category",i))},pe=(x,{persist:N=!0,resetReport:P=!0,databaseId:O=null}={})=>{let Y=Z(x)||n[0];if(!Y)return;i=Y.id,T=null,K=null;let se=Y.databases||[],me=O&&se.find(Ue=>Ue.id===O)||se.find(Ue=>Ue.id===o)||se[0];if(o=me?.id||null,!me){fe.innerHTML=Lo(i,f),ye.innerHTML=`<div class="sidebar-notice">${Ge({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,ie.innerHTML="",Pe();return}et(me.id,{persist:!1,resetReport:P}),N&&(Se("data.last_category",Y.id),Se(`data.last_database.${Y.id}`,me.id))},ze=x=>{let N=ne(x),P=ie.querySelector("#data-filter-form");P&&(N.values=$n(P,x,N))},Ke=async(x=null,{quiet:N=!1}={})=>{let P=F(o);if(!P)return;nt();let O=ne(P);ze(P),x!==null&&(O.page=x),(!Number.isFinite(O.page)||O.page<1)&&(O.page=1);let Y=++d;T=null,K=null;let se=q.querySelector(".report-card"),me=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!se?q.setAttribute("aria-busy","true"):(q.removeAttribute("aria-busy"),q.innerHTML=qa(P));let Be=ie.querySelector("#run-query");N||Re(Be,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Ie;if(P.id==="indexeddb"?Ie=await No(P,O):Ie=await Q.query({database:P.id,filters:Pr(P,O),page:O.page,pageSize:O.pageSize}),s||Y!==d)return;if(Ie.meta={...Ie.meta||{},column_filters:O.columnFilters||{},searchable:P.id==="postgres"||P.id==="parquet",sort:O.sort||Ie.meta?.sort||null},O.result=Ie,O.page=Number(Ie.page)||O.page,O.pageSize=Number(Ie.page_size)||O.pageSize,q.removeAttribute("aria-busy"),q.innerHTML=yn(Ie),me!==null){let rt=q.querySelector("[data-page-size]");rt&&(rt.value=String(O.pageSize),rt.focus({preventScroll:!0}))}let Ye=Z(i)?.label||i;await ka({kind:"data",title:`${Ye} \xB7 ${P.label} \xB7 ${Ie.table||Ie.label||"query"}`,detail:`${c(Ie.total)} \u7B46 \xB7 ${ge(Ie.duration_ms)}`,payload:{category:i,database:P.id,filters:Pr(P,O),page:O.page,page_size:O.pageSize}}),Se("data.last_query",{category:i,database:P.id,filters:Pr(P,O),page:O.page,page_size:O.pageSize,at:new Date().toISOString()})}catch(Ie){if(s||Y!==d)return;q.removeAttribute("aria-busy"),q.innerHTML=_n(Ie,P),R(Ie.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&Y===d&&Re(Be,!1)}},ut=(x,N)=>{let P=x?.querySelector("[data-data-fuzzy-results]");P&&(P.innerHTML=N.length?N.map(O=>`<button class="data-fuzzy-option" type="button" role="option" data-action="select-fuzzy-term" data-term="${r(O.value)}"><span>${r(O.label||O.value)}</span><small>${r(O.meta||"")}</small></button>`).join(""):'<div class="data-fuzzy-empty">\u6C92\u6709\u76F8\u8FD1\u7D50\u679C\uFF1B\u6309 Enter \u53EF\u76F4\u63A5\u52A0\u5165\u76EE\u524D\u8F38\u5165\u7684\u95DC\u9375\u5B57\u3002</div>')},vt=async(x,N="")=>{if(!x)return;let P=F(o),O=P?ne(P):null;if(!O)return;let Y=x.dataset.fuzzyKind||i,se=x.querySelector("[data-data-fuzzy-results]"),me=++S;se&&(se.innerHTML='<div class="data-fuzzy-loading"><span class="spinner"></span><span>\u641C\u5C0B\u76F8\u8FD1\u7D50\u679C\u2026</span></div>');try{let Ue=await Q.dataSuggest({kind:Y,query:N,limit:12});if(me!==S)return;let Be=(Ue.suggestions||[]).filter(Ie=>!O.fuzzyTerms.includes(Ie.value));ut(x,Be)}catch(Ue){if(me!==S)return;se&&(se.innerHTML=`<div class="data-fuzzy-empty">${r(Ue.message||"\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},te=(x,{focus:N=!1}={})=>{if(!x)return;let P=x.querySelector("[data-data-fuzzy-popover]"),O=x.querySelector("[data-data-fuzzy-search]");!P||!O||(P.hidden&&(P.hidden=!1,O.value="",vt(x,"")),N&&(O.focus(),O.select()))},xe=x=>{$&&(window.clearTimeout($),$=null);let N=x?.querySelector("[data-data-fuzzy-popover]");N&&(N.hidden=!0)},De=async x=>{let N=F(o);if(!N)return;let P=ne(N),O=String(x||"").trim();!O||P.fuzzyTerms.includes(O)||(P.fuzzyTerms=[...P.fuzzyTerms,O],xe(ie.querySelector("[data-data-fuzzy]")),tt(N),await Ke(1))},Qe=async x=>{let N=F(o);if(!N)return;let P=ne(N),O=String(x||"").trim();P.fuzzyTerms=P.fuzzyTerms.filter(Y=>Y!==O),tt(N),await Ke(1)},Et=async()=>{de.disabled=!0,Re(de,!0,"\u6574\u7406\u4E2D\u2026");try{let x=ms("judgment.catalog.v1",6e5),[N,P,O,Y,se]=await Promise.all([x?Promise.resolve(x):Q.catalog(),qs("data.last_category","law"),qs("data.last_database.law","postgres"),qs("data.last_database.judgment","postgres"),qs("data.page_size",25)]);if(s)return;x||os("judgment.catalog.v1",N),a=N,z&&(z.innerHTML=ls(a.judgment_stats)),n=Array.isArray(a.categories)?a.categories:[],m=Ro.includes(Number(se))?Number(se):25;for(let Ye of n)for(let rt of Ye.databases||[]){let lt=ke(Ye.id,rt.id);l[lt]||(l[lt]=vn(rt,m))}let me=n.find(Ye=>Ye.id===P)||n[0];if(!me){fe.innerHTML="",ye.innerHTML=`<div class="sidebar-notice">${Ge({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let Ue=me.id==="judgment"?Y:O;if(i=me.id,o=null,pe(me.id,{persist:!1,resetReport:!0,databaseId:Ue}),s)return;let Be=F(o),Ie=Be?ne(Be):null;Be&&Ie&&f==="query"&&!Ie.result&&(Be.id==="postgres"||Be.id==="parquet")&&Ke(1),R("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(x){if(s)return;a=null,n=[],fe.innerHTML="",z&&(z.innerHTML=ls(null)),Pe(),ye.innerHTML=`<div class="sidebar-notice">${Ge({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:r(x.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${p("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,q.innerHTML=`<div class="report-empty">${yt({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(de.disabled=!1,Re(de,!1))}};G.addEventListener("change",x=>{let N=x.target;if(N.name==="category"){pe(N.value);return}if(N.name==="database"){et(N.value);let se=F(o),me=se?ne(se):null;se&&me&&!me.result&&f==="query"&&(se.id==="postgres"||se.id==="parquet")&&Ke(1);return}let P=F(o);if(!P)return;let O=ne(P),Y=ie.querySelector("#data-filter-form");!Y||!N.name||(O.values=$n(Y,P,O),O.page=1,N.name==="table"&&(T=null,K=null,O.sort=null,O.columnFilters={},O.result=null,ie.innerHTML=Mo(P,O),Le(P)))}),G.addEventListener("input",x=>{let N=x.target.closest("[data-data-fuzzy-search]");if(N){let se=N.closest("[data-data-fuzzy]");$&&window.clearTimeout($),$=window.setTimeout(()=>{vt(se,N.value)},160);return}let P=F(o);if(!P)return;let O=ie.querySelector("#data-filter-form");if(!O||!x.target.name||x.target.name==="table")return;let Y=ne(P);Y.values=$n(O,P,Y)}),G.addEventListener("keydown",x=>{let N=x.target.closest("[data-data-fuzzy-search]");if(!N)return;let P=N.closest("[data-data-fuzzy]");if(x.key==="Escape")x.preventDefault(),xe(P),N.blur();else if(x.key==="Enter"){x.preventDefault();let O=P?.querySelector("[data-action='select-fuzzy-term']");O?O.click():De(N.value)}else x.key==="ArrowDown"&&(x.preventDefault(),P?.querySelector("[data-action='select-fuzzy-term']")?.focus())}),G.addEventListener("mouseover",x=>{let N=x.target.closest("[data-action='open-fuzzy']");N&&te(N.closest("[data-data-fuzzy]"))}),G.addEventListener("mouseout",x=>{let N=x.target.closest("[data-data-fuzzy]");N&&(x.relatedTarget&&N.contains(x.relatedTarget)||xe(N))}),G.addEventListener("submit",x=>{x.target.id==="data-filter-form"&&(x.preventDefault(),Ke(1))}),G.addEventListener("click",async x=>{let N=ie.querySelector("[data-data-fuzzy] [data-data-fuzzy-popover]:not([hidden])")?.closest("[data-data-fuzzy]");N&&!x.target.closest("[data-data-fuzzy]")&&xe(N);let P=x.target.closest("[data-action]"),O=P?.dataset.action;if(O==="data-nav"){let Y=P.dataset.tab,se=F(o);if(Y==="schema"){if(f!=="schema"){if(se){let Ie=ne(se),Ye=ie.querySelector("#data-filter-form");Ye&&(Ie.values=$n(Ye,se,Ie))}f="schema",se&&tt(se)}return}let me=Y==="judgment"?"judgment":"law";f==="schema"&&(f="query"),i!==me?pe(me,{databaseId:o,resetReport:!1}):se&&tt(se);let Ue=F(o),Be=Ue?ne(Ue):null;Ue&&Be&&!Be.result&&(Ue.id==="postgres"||Ue.id==="parquet")&&Ke(1);return}if(O==="open-fuzzy"){te(P.closest("[data-data-fuzzy]"),{focus:!0});return}if(O==="select-fuzzy-term"){await De(P.dataset.term);return}if(O==="remove-fuzzy-term"){await Qe(P.dataset.term);return}if(O==="schema-category"){f="schema",pe(P.dataset.category||"law",{resetReport:!0});return}if(O==="select-schema-table"){let Y=F(o);if(!Y)return;C(Y,P.dataset.tableId||"");return}if(O==="reset"){let Y=F(o);if(!Y)return;T=null,K=null;let se=ne(Y);l[ke(i,Y.id)]=vn(Y,se.pageSize),tt(Y),Le(Y),R("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}x.target.closest("#catalog-retry")&&Et()}),q.addEventListener("input",x=>{let N=x.target.closest("[data-schema-search]");if(!N)return;let P=D();if(!P)return;let O=N.dataset.schemaSearch||"",Y=N.value,se=`${P.mode}:${P.db.id}:${P.tableId}:${O}`,me=I.get(se);if(me&&window.clearTimeout(me),!Y.trim()){I.delete(se),H(),W(P,O,"");return}let Ue=window.setTimeout(()=>{I.delete(se),ct(P,O,Y,N)},250);I.set(se,Ue)}),q.addEventListener("keydown",x=>{let N=x.target.closest("[data-schema-search]");if(!N)return;let P=D();if(P){if(x.key==="Escape"){H();return}if(x.key==="ArrowDown"||x.key==="ArrowUp"){if(!j||j.hidden)return;x.preventDefault();let O=x.key==="ArrowDown"?1:-1;Oe(k<0?O>0?0:b.length-1:k+O);return}if(x.key==="Enter"){if(x.preventDefault(),j&&!j.hidden&&k>=0){Ve(k);return}W(P,N.dataset.schemaSearch||"",N.value)}}}),j?.addEventListener("mousedown",x=>{x.preventDefault()}),j?.addEventListener("click",x=>{let N=x.target.closest("[data-schema-suggest-index]");N&&Ve(Number(N.dataset.schemaSuggestIndex))});let ht=x=>{x.target.closest("[data-schema-search]")||j?.contains(x.target)||H()};return document.addEventListener("click",ht),window.addEventListener("scroll",H,{capture:!0,passive:!0}),window.addEventListener("resize",H),q.addEventListener("keydown",x=>{x.target.matches(".law-jump-input")&&x.key==="Enter"&&(x.preventDefault(),he(x.target.id))}),q.addEventListener("click",async x=>{let N=x.target.closest("[data-action]");if(!N)return;let P=N.dataset.action,O=F(o),Y=O?ne(O):null,se=Y?.result;if(P==="back-to-results"){Ze();return}if(P==="open-law"){oe({lawKey:N.dataset.lawKey||"",sourceType:N.dataset.lawSource||"",lawName:N.dataset.lawName||""});return}if(P==="open-judgment"){ce({jid:N.dataset.jid||""});return}if(P==="jump-article"){he(N.dataset.jumpInput||"law-article-jump");return}if(P==="sort-column"){let me=N.dataset.sortKey||"";if(!me||!O)return;if(f==="schema"&&v?.result){let Ie=v.sort,Ye=me==="jdate"||me==="law_modified_date"||me==="article_count"||me==="citation_count"||me==="full_text_length"||me==="created_at"||me==="updated_at",rt=Ie?.key===me?Ie.direction==="asc"?"desc":"asc":Ye?"desc":"asc";C(O,v.tableId,{sort:{key:me,direction:rt},columnFilters:v.columnFilters||{},quiet:!0});return}if(!Y)return;let Ue=Y.sort,Be=Ue?.key===me?Ue.direction==="asc"?"desc":"asc":me==="jdate"?"desc":"asc";Y.sort={key:me,direction:Be},Ke(1,{quiet:!0});return}if(P==="retry"){Ke(Y?.page||1);return}if(se){if(P==="prev-page"){Ke(Math.max(1,Number(se.page)-1),{quiet:!0});return}if(P==="next-page"){let me=Math.max(1,Math.ceil(Number(se.total)/Number(se.page_size)));Ke(Math.min(me,Number(se.page)+1),{quiet:!0});return}if(P==="copy-query"){let me=await ks(se.query_text||"");R(me?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",me?"ok":"warn");return}if(P==="export-json"){let me=`${se.database}-${se.table||"query"}-page-${se.page}.json`;Vt(me,JSON.stringify(Sn(se),null,2),"application/json;charset=utf-8"),R(`\u5DF2\u532F\u51FA ${me}`,"ok");return}if(P==="export-csv"){let me=`${se.database}-${se.table||"query"}-page-${se.page}.csv`;Vt(me,kn(se),"text/csv;charset=utf-8"),R(`\u5DF2\u532F\u51FA ${me}`,"ok")}}}),q.addEventListener("change",x=>{let N=x.target.closest("[data-action='select-law-version']");if(N&&T){oe({lawKey:T.lawKey,sourceType:T.sourceType,lawName:T.lawName,versionId:N.value});return}if(!x.target.matches("[data-page-size]"))return;let P=F(o);if(!P)return;let O=ne(P);O.pageSize=Number(x.target.value)||25,O.page=1,Se("data.page_size",O.pageSize),Ke(1,{quiet:!0})}),de.addEventListener("click",()=>{Et()}),await Et(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0,$&&window.clearTimeout($);for(let x of I.values())window.clearTimeout(x);I.clear(),H(),document.removeEventListener("click",ht),window.removeEventListener("scroll",H,{capture:!0}),window.removeEventListener("resize",H)}}var Jo=[10,25,50,100],mu=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function zr(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function gu(e,t=e){return`<option value="${r(e)}">${r(t)}</option>`}function Ma(e,t,s,a,n=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${r(t)}</span>
      <span class="field-tag">${r(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${r(e)}">
      ${gu("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${r(i)}" ${String(i)===String(a)?"selected":""}>${r(i)}</option>`).join("")}
    </select>
    ${n?`<span class="field-help">${r(n)}</span>`:""}
  </div>`}function fu(e,t){let s=mu.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${Ma("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${Ma("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${Ma("model","\u6A21\u578B",e.models||[],t.model)}
    ${Ma("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${Ma("method","\u65B9\u6CD5",e.methods||[],t.method)}
    <div class="field">
      <label class="field-label" for="performance-keyword">
        <span>\u95DC\u9375\u5B57</span>
        <span class="field-tag">keyword</span>
      </label>
      <input class="input" type="text" id="performance-keyword" name="keyword"
        value="${r(t.keyword)}" placeholder="\u7A0B\u5E8F\u3001\u6A21\u7D44\u3001\u8DEF\u5F91\u6216 Request ID" />
    </div>
    <div class="field-row">
      <div class="field">
        <label class="field-label" for="performance-from_date">
          <span>\u65E5\u671F\u8D77</span>
          <span class="field-tag">from_date</span>
        </label>
        <input class="input" type="date" id="performance-from_date" name="from_date"
          value="${r(t.from_date)}" />
      </div>
      <div class="field">
        <label class="field-label" for="performance-to_date">
          <span>\u65E5\u671F\u8FC4</span>
          <span class="field-tag">to_date</span>
        </label>
        <input class="input" type="date" id="performance-to_date" name="to_date"
          value="${r(t.to_date)}" />
      </div>
    </div>
    <div class="field">
      <label class="field-label" for="performance-min_duration">
        <span>\u8017\u6642\u4E0B\u9650\uFF08ms\uFF09</span>
        <span class="field-tag">min_duration</span>
      </label>
      <input class="input" type="number" min="0" step="1" id="performance-min_duration"
        name="min_duration" value="${r(t.min_duration)}" placeholder="\u4F8B\u5982 100" />
    </div>
    <div class="field">
      <label class="field-label" for="performance-sort">
        <span>\u6392\u5E8F</span>
        <span class="field-tag">sort</span>
      </label>
      <select class="select" id="performance-sort" name="sort">${s}</select>
    </div>`}function Fo(){let e=document.getElementById("performance-filter-form");if(!e)return zr();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Oo(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function Ho(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),n=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${n}.${i}`}function bu(e,t){if(!e)return"";let s=new Date(e);return Number.isNaN(s.getTime())?"":new Date(s.getTime()+Math.max(0,Number(t)||0)).toISOString()}var hu=[{key:"parsing",label:"Parsing",hint:"\u8F38\u5165\u9577\u5EA6\u3001\u89E3\u6790\u6642\u9593",names:["rag.parse_question"],color:"#64748b"},{key:"embedding",label:"Embedding",hint:"Model\u3001Token\u3001Batch\u3001\u8017\u6642",names:["rag.embed_query"],color:"#3984c6"},{key:"qdrant",label:"Qdrant Search",hint:"Collection\u3001Filter\u3001Top K\u3001\u8017\u6642",names:["rag.qdrant_search"],color:"#d97706"},{key:"reranker",label:"Reranker",hint:"Model\u3001\u5019\u9078\u7B46\u6578\u3001\u8017\u6642",names:["rag.rerank"],color:"#8b5cf6"},{key:"context",label:"Context",hint:"Chunk \u6578\u3001Token \u6578\u3001\u8017\u6642",names:["rag.context"],fallbackNames:["rag.fetch_documents","rag.build_citations"],color:"#64748b"},{key:"llm",label:"LLM",hint:"Model\u3001Input/Output Token\u3001TTFT\u3001\u8017\u6642",names:["rag.llm_request"],color:"#16a34a"}],An={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"};function Wo(e){let t=e?.metadata?.rag_response||{},s=String(t.status||e?.metadata?.rag_status||e?.status||"");return s==="operational"||s==="success"?{label:"Completed",tone:"ok"}:s==="retrieval_only"?{label:"Abstain",tone:"warn"}:s==="preview"?{label:"Preview",tone:"info"}:s==="failed"||s==="error"?{label:"Failed",tone:"danger"}:{label:s||"Unknown",tone:"idle"}}function Ur(e){let t=Math.max(0,Number(e?.offset_ms)||0),s=Math.max(0,Number(e?.duration_ms)||0),a=Math.max(t,Number(e?.end_offset_ms)||t+s);return{...e,offset:t,end:a,duration:Math.max(s,a-t)}}function Vo(e,t=0){let s=Array.isArray(e?.segments)?[...e.segments].sort((f,y)=>Number(f.offset_ms||0)-Number(y.offset_ms||0)):[],a=Math.max(Number(e?.total_ms)||0,Number(t)||0,...s.map(f=>Ur(f).end),1),n=hu.map(f=>{let y=s.filter(w=>f.names.includes(w.name));!y.length&&f.fallbackNames&&(y=s.filter(w=>f.fallbackNames.includes(w.name)));let v=y.map(Ur),u=v.length?Math.min(...v.map(w=>w.offset)):null,b=v.length?Math.max(...v.map(w=>w.end)):null;return{...f,spans:v,start:u,end:b,duration:u===null?null:b-u}});for(let f of n){if(f.key!=="embedding"&&f.key!=="llm")continue;let y=[];for(let b of f.spans){let w=b.metadata||{},k=Number(w.load_duration_ms),A=Number.isFinite(k)&&k>0?k:0,S=Math.max(0,Number(b.duration)||0);y.push({...b,offset:b.offset,end:b.offset+A,duration:A,metadata:{...w,source_stage:f.label,model_load_ms:A,request_duration_ms:S,warm_duration_ms:Math.max(0,S-A),cold_start:A>=100},params:{...b.params||{},source_stage:f.label}})}if(!y.length)continue;let v=y.reduce((b,w)=>b+w.duration,0),u=f.spans.reduce((b,w)=>b+Math.max(0,Number(w.duration)||0),0);f.loadInfo={spans:y,total:v,requestTotal:u,ratio:u>0?Math.min(1,Math.max(0,v/u)):0}}let i=[...n],o=Math.max(0,...i.flatMap(f=>f.spans.map(y=>y.end))),l=e?.metadata?.rag_response||{},d=Wo(e),m=Math.min(a,o);return i.push({key:"response",label:"Response",hint:"\u7E3D\u8017\u6642\u3001\u5F15\u7528\u6578\u3001\u6210\u529F\u6216 Abstain",color:"#0f766e",spans:[{offset:m,end:a,duration:Math.max(0,a-m),status:d.tone==="danger"?"error":"ok",metadata:l,params:{},started_at:e?.started_at,finished_at:e?.finished_at}],start:m,end:a,duration:Math.max(0,a-m),responseMetadata:l}),vu(i,a),{total:a,stages:i,response:l,traceStatus:d,requestId:e?.request_id||"",startedAt:e?.started_at,finishedAt:e?.finished_at,client:e?.client||{},models:Array.isArray(e?.summary?.models)?e.summary.models:[],hasLoad:i.some(f=>!!f.loadInfo)}}function vu(e,t){let s=e.reduce((i,o)=>i+Math.max(0,Number(o.duration)||0),0),a=s>0?t/s:1,n=0;for(let i of e){let o=Math.max(0,Number(i.duration)||0)*a;i.displayStart=n,i.displayDuration=o,i.displayEnd=n+o;let l=i.spans[0]||null,d=[],m=!1;if(l){let y=Math.max(0,Number(l.duration)||0),v=i.loadInfo?Math.max(0,Number(i.loadInfo.total)||0):0;if(i.loadInfo&&v>0&&i.spans.length===1&&y>0){let u=Math.min(l.end,l.offset+v),b=Math.max(0,u-l.offset),w=Math.max(0,l.end-u);if(b>0&&w>0){let k=bu(l.started_at,b),A={...l,offset:l.offset,end:u,duration:b,finished_at:k,metadata:{...l.metadata||{},source_stage:i.label,model_load_ms:b,request_duration_ms:y,warm_duration_ms:Math.max(0,y-b),cold_start:b>=100},params:{...l.params||{},source_stage:i.label}},S={...l,offset:u,end:l.end,duration:w,started_at:k,finished_at:l.finished_at};d.push({kind:"load",label:"Model Load",span:A,duration:b}),d.push({kind:"stage",label:`${i.label} \u63A8\u8AD6`,span:S,duration:w}),m=!0}}m||d.push({kind:"stage",label:i.label,span:l,duration:y})}i.detailSegments=d;let f=[];if(l&&o>0)if(m){let[y,v]=d,u=y.duration+v.duration,b=u>0?o*(y.duration/u):0,w={...i,key:"model_load",label:`Model Load \xB7 ${i.label}`,spans:[y.span],duration:y.duration},k={...i,label:`${i.label} \u63A8\u8AD6`,spans:[v.span],duration:v.duration};f.push({offset:n,duration:b,color:"#0ea5e9",kind:"load",tip:xn(w,y.span)}),f.push({offset:n+b,duration:Math.max(0,o-b),color:i.color,kind:"stage",tip:xn(k,v.span,{includeLoad:!1})})}else f.push({offset:n,duration:o,color:i.color,kind:"stage",tip:xn(i,l)});i.displaySegments=f,n+=o}}function Gr(e,{includeLoad:t=!0}={}){let s=[],a=(f,y)=>{y==null||y===""||s.push([f,String(y)])},n=e.spans[0]||null;if(!n)return a("\u72C0\u614B","\u6B64\u7D00\u9304\u6C92\u6709\u9019\u500B span"),s;let i=n.params||{},o=n.metadata||{},l=Ko(n),d=Qr(n),m=(f,y)=>{let v=Number(f?.load_duration_ms);if(!Number.isFinite(v))return;let u=Math.max(0,v);a("Model Load",ge(u)),a("\u51B7\u555F\u52D5",u>=100?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09");let b=Math.max(0,Number(y)||0);if(b>0){let w=Math.max(0,b-u);a("\u6263\u9664\u8F09\u5165\u5F8C",ge(w)),a("\u8F09\u5165\u5360\u6BD4",`${(u/b*100).toFixed(u/b>=.1?0:1)}%`)}};if(e.key==="response")return a("Trace \u72C0\u614B",e.responseMetadata.status||"\u2014"),a("Answer source",e.responseMetadata.answer_source||"\u2014"),a("Abstain",e.responseMetadata.abstain?"\u662F":"\u5426"),a("\u5F15\u7528\u7E3D\u6578",e.responseMetadata.citation_count??"\u2014"),a("\u5224\u6C7A\uFF0F\u6CD5\u898F\u5F15\u7528",`${e.responseMetadata.judgment_citations??"\u2014"} / ${e.responseMetadata.law_citations??"\u2014"}`),a("\u7E3D\u8017\u6642",ge(e.duration)),s;if(a("\u958B\u59CB",`${Ho(n.started_at)||"\u2014"} \xB7 +${n.offset.toFixed(1)} ms`),a("\u7D50\u675F",`${Ho(n.finished_at)||"\u2014"} \xB7 +${n.end.toFixed(1)} ms`),a("\u8017\u6642",ge(n.duration)),e.key==="parsing")a("\u8F38\u5165\u9577\u5EA6",o.input_length??i.input_length),a("\u6B63\u898F\u5316\u9577\u5EA6",o.normalized_length??i.normalized_length),a("\u79FB\u9664\u7A7A\u767D",o.trimmed_chars);else if(e.key==="embedding")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.active_base_url||o.base_url),a("Input tokens",o.prompt_eval_count),a("Batch",o.batch),a("\u5411\u91CF\u7DAD\u5EA6",o.dimensions),a("Fallback",o.fallback_used?"\u662F":"\u5426"),t&&m(o,n.duration);else if(e.key==="qdrant")a("Collection",o.collection||i.collection),o.filter&&a("Filter",Oo(o.filter)),a("Top K",o.top_k??i.limit),a("Hits",o.hits),a("Unique judgments",o.unique_judgments),a("Top score",o.top_score);else if(e.key==="reranker")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Rerank \u72C0\u614B",o.status),a("Fallback",o.fallback_used?"\u662F":"\u5426"),a("\u5019\u9078\u7B46\u6578",o.candidates),a("\u9078\u7528\u7B46\u6578",o.selected),a("Top score",o.top_score),Array.isArray(o.errors)&&o.errors.length&&a("\u932F\u8AA4",o.errors.join(" \xB7 "));else if(e.key==="context")a("Chunks",o.chunks),a("\u5224\u6C7A chunks",o.judgment_chunks),a("\u6CD5\u898F chunks",o.law_chunks),a("Token \u4F30\u7B97",o.token_estimate),a("Context \u5B57\u5143",o.context_chars),a("\u6587\u4EF6\u6578",o.documents);else if(e.key==="llm")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Input tokens",o.input_tokens),a("Output tokens",o.output_tokens),a("TTFT",o.ttft_ms===null||o.ttft_ms===void 0?"\u2014":ge(o.ttft_ms)),a("API \u7E3D\u8017\u6642",o.total_duration_ms===null||o.total_duration_ms===void 0?"\u2014":ge(o.total_duration_ms)),t&&m(o,n.duration),a("Strict retry",o.strict?"\u662F":"\u5426");else if(e.key==="model_load"){if(a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("\u4F86\u6E90\u968E\u6BB5",o.source_stage),a("\u51B7\u555F\u52D5",o.cold_start?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09"),a("\u6A21\u578B\u547C\u53EB\u7E3D\u8017\u6642",o.request_duration_ms===null||o.request_duration_ms===void 0?"\u2014":ge(o.request_duration_ms)),a("\u8F09\u5165\u8017\u6642",o.model_load_ms===null||o.model_load_ms===void 0?"\u2014":ge(o.model_load_ms)),a("\u6263\u9664\u8F09\u5165\u5F8C\u6D41\u7A0B\u6642\u9593",o.warm_duration_ms===null||o.warm_duration_ms===void 0?"\u2014":ge(o.warm_duration_ms)),Number(o.request_duration_ms)>0&&Number(o.model_load_ms)>=0){let f=Number(o.model_load_ms)/Number(o.request_duration_ms)*100;a("\u8F09\u5165\u5360\u6BD4",`${f.toFixed(f>=10?0:1)}%`)}o.eval_duration_ms!==null&&o.eval_duration_ms!==void 0&&a("\u63A8\u8AD6\u8017\u6642",ge(o.eval_duration_ms))}else if(e.key==="segment"||e.key==="test_stage")if(a("Model",d||o.model||i.model),a("\u72C0\u614B",o.status||n.status),e.key==="test_stage")a("\u9032\u5EA6",o.progress===null||o.progress===void 0?"":`${Number(o.progress)||0}%`),n.error&&a("\u932F\u8AA4",n.error);else{n.error&&a("\u932F\u8AA4",n.error);for(let[f,y]of Object.entries(i).slice(0,10))a(f,Oo(y))}return e.spans.length>1&&(e.key==="model_load"?a("\u5404\u6A21\u578B\u8F09\u5165",e.spans.map(f=>`${f.metadata?.source_stage||"model"} ${Qr(f)} ${ge(f.metadata?.model_load_ms||0)}`).join(" \xB7 ")):(a("Span \u6578",e.spans.length),a("Span \u660E\u7D30",e.spans.map((f,y)=>`#${y+1} +${f.offset.toFixed(0)}ms/${ge(f.duration)}`).join(" \xB7 ")))),n.module&&a("Module",n.module),n.function&&a("Function",n.function),s}function $u(e){let t=String(e||"").trim();if(!t)return"";try{return new URL(t.includes("://")?t:`http://${t}`).hostname||t}catch{return t}}function Ko(e){let t=e?.metadata||{},s=String(t.provider_name||"").trim();if(s)return s;let a=String(t.active_base_url||t.base_url||e?.params?.url||"").trim();return $u(a)}function yu(e){let t=e?.metadata||{};return String(t.model||e?.params?.model||"").trim()}function Qr(e){let t=Ko(e),s=yu(e);return s?t?`${t}:${s}`:s:""}function wu(e){let t=new Set;for(let s of e?.spans||[]){let a=Qr(s);a&&t.add(a)}return[...t]}function xn(e,t,s={}){let a=Gr({...e,spans:[t]},s);return[String(e.label||""),...a.map(([n,i])=>`${n}: ${i}`)].join(`
`)}function _u(e,t){let s=e.spans||[],a=wu(e),n=Array.isArray(e.displaySegments)?e.displaySegments:null,i=7,o=Math.max(1,Math.min(4,s.length)),l=s.length>1,d=n?12:l?Math.max(12,o*i):12,m=n?n.map(k=>{if(Number(k.duration)<=0)return"";let A=Math.max(0,Math.min(100,k.offset/t*100)),S=Math.min(100-A,k.duration/t*100);return`<span class="rag-wf-bar is-sequential${k.kind==="load"?" is-load":""}" style="left:${A.toFixed(3)}%;width:${S.toFixed(4)}%;top:0;height:12px;--bar-color:${k.color}"
            data-rag-wf-tip="${r(k.tip)}"
            aria-label="${r(k.tip)}" role="img"></span>`}).join(""):s.slice(0,4).map((k,A)=>{if(Number(k.duration)<=0)return"";let S=Math.max(0,Math.min(100,k.offset/t*100)),$=Math.max(.35,Math.min(100-S,k.duration/t*100)),T=l?A*i:0,K=l?6:12,G=xn(e,k);return`<span class="rag-wf-bar" style="left:${S.toFixed(3)}%;width:${$.toFixed(3)}%;top:${T}px;height:${K}px"
            data-rag-wf-tip="${r(G)}"
            aria-label="${r(G)}" role="img"></span>`}).join(""),f=Array.isArray(e.detailSegments)?e.detailSegments:[],y=f.length>1?f.map(k=>{let A=k.kind==="load"?{...e,key:"model_load",label:`Model Load \xB7 ${e.label}`,spans:[k.span],duration:k.duration}:{...e,label:`${e.label} \u63A8\u8AD6`,spans:[k.span],duration:k.duration},S=Gr(A,{includeLoad:k.kind!=="stage"});return`<div class="rag-wf-detail-group">
              <div class="rag-wf-detail-group-head">
                <strong>${r(k.label)}</strong>
                <span>${r(ge(k.duration))}</span>
              </div>
              <div class="rag-wf-detail-grid">${S.map(([$,T])=>`<span class="rag-wf-detail"><span>${r($)}</span><strong>${r(T)}</strong></span>`).join("")}</div>
            </div>`}).join(""):"",v=Gr(e).map(([k,A])=>`<span class="rag-wf-detail"><span>${r(k)}</span><strong>${r(A)}</strong></span>`).join(""),u=f.length>1?`<div class="rag-wf-details is-split">${y}</div>`:`<div class="rag-wf-details">${v}</div>`,b=s.length?s.some(k=>k.status==="error")?"is-error":"":"is-missing",w=s.length?ge(e.duration):"\u672A\u8A18\u9304";return`<details class="rag-wf-stage ${b}" style="--stage-color:${e.color}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong>${r(e.label)}</strong><small>${r(e.hint)}</small>${a.length?`<small class="rag-wf-model-line">${r(a.join(" \xB7 "))}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${w} \xB7 ${s.length?`${s.length} span`:"\u2014"} <span class="rag-wf-chevron">${p("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:${d}px">${m}</span>
    </summary>
    ${u}
  </details>`}function Yo(e,t,s=!1){let a=e.response||{},n=e.client||{},i=e.models||[];return`<div class="rag-wf-summary">
      <span>\u7E3D\u8017\u6642 <strong>${r(ge(e.total))}</strong></span>
      <span>Server <strong>${r(ge(t))}</strong></span>
      ${n.total_ms?`<span>Client <strong>${r(ge(n.total_ms))}</strong></span>`:""}
      ${n.render_ms!==void 0?`<span>Render <strong>${r(ge(n.render_ms))}</strong></span>`:""}
      <span>\u5F15\u7528 <strong>${r(String(a.citation_count??"\u2014"))}</strong></span>
      <span>Abstain <strong>${a.abstain?"\u662F":"\u5426"}</strong></span>
      ${i.length?`<span>Model <strong>${r(i.join(" \xB7 "))}</strong></span>`:""}
      ${s?'<span class="rag-wf-updating">\u66F4\u65B0\u4E2D\u2026</span>':""}
    </div>`}function ra(e,t,s="\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\uFF0C\u67E5\u770B\u53C3\u6578\u3001Token\u3001TTFT\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u4F86\u6E90\u6578\u91CF\u3002Waterfall \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u5E73\u884C\u57F7\u884C\u7684 span \u6703\u4F9D\u5BE6\u969B\u6642\u9593\u91CD\u758A\u986F\u793A\u3002",{legend:a=""}={}){return`<div class="rag-wf-axis"><span>0 ms</span><span>${r(ge(t))}</span></div>
    ${a}
    <div class="rag-wf-stages">${(e||[]).map(n=>_u(n,t)).join("")}</div>
    <p class="rag-wf-hint">${r(s)}</p>`}function Xo(e){let t=(e.stages||[]).some(n=>n.loadInfo),s=t?'<div class="rag-wf-legend"><span><i class="is-load"></i>Model Load\uFF08\u968E\u6BB5 bar \u524D\u6BB5\uFF09</span></div>':"",a=t?"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\uFF1BEmbedding\uFF0FLLM \u7684\u85CD\u8272\u524D\u6BB5\u70BA Model Load\uFF0C\u5F8C\u6BB5\u70BA\u63A8\u8AD6\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001Token \u8207\u8F09\u5165\u5360\u6BD4\u53EF\u5C55\u958B\u67E5\u770B\u3002":"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207 Token \u53EF\u5C55\u958B\u67E5\u770B\u3002";return ra(e.stages,e.total,a,{legend:s})}function qn(e,{serverDurationMs:t=0,loading:s=!1,embedded:a=!1}={}){if(!e||typeof e!="object")return"";let n=Vo(e,t),i=n.traceStatus;return`<section class="report-card rag-wf-card${a?" rag-wf-embedded":""}">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${An[i.tone]||An.idle}">${r(i.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(n.requestId||"\u2014")}</span>
          \xB7 ${r($e(n.startedAt))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <a class="btn btn-secondary btn-sm" href="#/performance">
          ${p("activity",14)}<span>\u5B8C\u6574 Flow</span>
        </a>
      </div>
    </div>
    ${Yo(n,t,s)}
    ${Xo(n)}
  </section>`}var Tt=null;function ku(){return Tt||(Tt=document.createElement("div"),Tt.className="rag-wf-tooltip",Tt.hidden=!0,document.body.appendChild(Tt),Tt)}function Jr(){Tt&&(Tt.hidden=!0)}function Zo(e){if(!Tt||Tt.hidden)return;let t=14,s=10,a=Tt.getBoundingClientRect(),n=e.clientX+t,i=e.clientY+t;n+a.width>window.innerWidth-s&&(n=e.clientX-a.width-t),i+a.height>window.innerHeight-s&&(i=e.clientY-a.height-t),Tt.style.left=`${Math.max(s,n)}px`,Tt.style.top=`${Math.max(s,i)}px`}document.addEventListener("pointerover",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=ku(),a=t.dataset.ragWfTip||"";a&&(s.textContent=a,s.hidden=!1,Zo(e))});document.addEventListener("pointermove",e=>{if(!(!Tt||Tt.hidden)){if(!e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]")){Jr();return}Zo(e)}});document.addEventListener("pointerout",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=e.relatedTarget;s instanceof Node&&t.contains(s)||Jr()});window.addEventListener("scroll",Jr,{capture:!0,passive:!0});function Su(e,t,s,a){if(a&&!e.length)return`<div class="report-card rag-wf-card">
      ${Ge({tone:"danger",title:"RAG Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">${p("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;if(!e.length)return`<div class="report-card rag-wf-card">
      ${yt({iconName:"activity",title:s?"\u8B80\u53D6 RAG Pipeline\u2026":"\u5C1A\u7121 RAG Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684 RAG \u554F\u7B54 Trace\u3002":"\u7522\u751F\u65B0\u7684 RAG \u554F\u7B54\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A Parsing\u3001Embedding\u3001Qdrant\u3001Context\u3001LLM \u8207 Response \u7684 waterfall\u3002"})}
    </div>`;let n=e.find(m=>String(m.id)===String(t))||e[0],i=n.flow&&typeof n.flow=="object"?n.flow:{},o=Vo(i,n.duration_ms),l=o.traceStatus,d=e.map(m=>{let f=Wo(m.flow||{});return`<option value="${r(String(m.id))}" ${String(m.id)===String(n.id)?"selected":""}>#${r(String(m.id))} \xB7 ${r($e(m.started_at))} \xB7 ${r(ge(m.duration_ms))} \xB7 ${r(f.label)}</option>`}).join("");return`<section class="report-card rag-wf-card">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${An[l.tone]||An.idle}">${r(l.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(o.requestId||n.request_id||"\u2014")}</span>
          \xB7 ${r($e(n.started_at))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <label class="rag-wf-select">Trace
          <select class="select" data-rag-trace-select aria-label="\u9078\u64C7 RAG Trace">${d}</select>
        </label>
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">
          ${p("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    ${Yo(o,n.duration_ms,s)}
    ${Xo(o)}
  </section>`}function xu(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},n=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?ge(a.avg_total_ms??0):"\u2014",o=a.samples?ge(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
                    <span class="chip">${r(l.label||"\u2014")}</span>
                    <span class="perf-model-count">${c(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${ge(l.avg_ms)}`:""}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u65B0\u7684 Flow \u6703\u5F9E params.model \u81EA\u52D5\u5F59\u6574\u3002</p>'}
      </div>
      <div class="perf-flow-stat-panel">
        <div class="report-section-head">
          <span class="report-section-title">\u6700\u6162\u5340\u6BB5\uFF08\u5E73\u5747\uFF09</span>
          <span class="muted" style="font-size:9.5px">\u6700\u8FD1 ${c(e?.sample_size??0)} \u7B46</span>
        </div>
        ${t.length?`<div class="perf-seg-list">${t.slice(0,6).map(l=>`<div class="perf-seg-row">
                    <span class="perf-seg-name" title="${r(l.label)}">${r(l.label)}</span>
                    <span class="perf-seg-track"><span style="width:${Math.max(2,(Number(l.avg_ms)||0)/n*100).toFixed(1)}%"></span></span>
                    <span class="perf-seg-ms">${ge(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function _t(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),n=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(n).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:n?`${n}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function el(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function Au(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let n=Number(a.points_per_second)||0,i=Math.max(2,n/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${r(el(a))}</strong>
          <span>${r($e(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${r(`${c(a.indexed_count)} \u7B46 \xB7 ${_t(a.duration_ms)} \xB7 ${c(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${n.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${c(a.indexed_count)} \u7B46 \xB7 ${_t(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function qu(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${r(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${r(`${s.label} ${_t(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${r(s.key)}"></i>
            <span>${r(s.label)}</span>
            <strong>${_t(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 llama-server Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function Mu(e,t){let s=(Array.isArray(e)?e:[]).map(A=>({elapsed:Math.max(0,Number(A.elapsed_s)||0),indexed:Math.max(0,Number(A.indexed)||0)})).filter(A=>A.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(A=>A.elapsed),(Number(t)||0)/1e3,1),n=Math.max(...s.map(A=>A.indexed),1),i=760,o=150,l=12,d=12,m=i-l*2,f=o-d*2,y=s.map(A=>[l+A.elapsed/a*m,o-d-A.indexed/n*f]),v=y.map(([A,S],$)=>`${$===0?"M":"L"}${A.toFixed(1)},${S.toFixed(1)}`).join(" "),u=`${v} L${y[y.length-1][0].toFixed(1)},${o-d} L${y[0][0].toFixed(1)},${o-d} Z`,b=Math.max(1,Math.ceil(y.length/14)),w=y.map(([A,S],$)=>$%b===0||$===y.length-1?`<circle cx="${A.toFixed(1)}" cy="${S.toFixed(1)}" r="2.6" />`:"").join(""),k=[0,1,2,3].map(A=>{let S=d+f/3*A;return`<line x1="${l}" y1="${S.toFixed(1)}" x2="${i-l}" y2="${S.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${c(n)} \u7B46 \xB7 ${_t(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${k}
      <path d="${u}" class="index-progress-area"></path>
      <path d="${v}" class="index-progress-line"></path>
      ${w}
      <line x1="${l}" y1="${o-d}" x2="${i-l}" y2="${o-d}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${d}" x2="${l}" y2="${o-d}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${_t(a*500)}</span>
      <span>${_t(a*1e3)}</span>
    </div>
  </div>`}function Lu(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},n=t.coverage||{},i=n.total_judgments>0?`${c(n.indexed_judgments)} / ${c(n.total_judgments)}\uFF08${(100*n.indexed_judgments/n.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:c(t.indexed_count),note:`${c(t.batch_count)} \u6279 \xD7 ${c(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:_t(t.duration_ms),note:`${c(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:_t(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${_t(t.batch_min_ms)} \xB7 \u6700\u6162 ${_t(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${c(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${r(el(t))}</span>
    </div>
    <div class="index-perf-summary">
      ${o.map(l=>`<div class="index-perf-stat">
            <div class="summary-label">${r(l.label)}</div>
            <div class="index-perf-value">${r(l.value)}</div>
            <div class="index-perf-note">${r(l.note)}</div>
          </div>`).join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${r($e(t.started_at))}</span>
      <span><strong>batch</strong> ${c(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${c(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${c(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${r(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${_t(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${Au(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${_t(t.duration_ms)}</span>
        </div>
        ${qu(t)}
      </div>
    </div>
    ${Mu(t.progress,t.duration_ms)}
  </section>`}var zo=["#22d3ee","#a78bfa","#f59e0b","#ec4899","#3b82f6","#10b981","#f97316","#8b5cf6","#64748b"];function Uo(e){let t=String(e?.host||e?.url||"").trim(),s=e?.port?`:${e.port}`:"";return`${t||"\u2014"}${s}`}function ju(e,t,s,a){if(a&&!e)return`<div class="report-card rag-wf-card">
      ${Ge({tone:"danger",title:"\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${p("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=Array.isArray(e?.runs)?e.runs:[];if(!n.length)return`<div class="report-card rag-wf-card">
      ${yt({iconName:"layers",title:s?"\u8B80\u53D6\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline\u2026":"\u5C1A\u7121\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684\u7248\u672C\u5316\u7D22\u5F15\u7D00\u9304\u3002":"\u57F7\u884C\u300CQdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A host/model\u3001Blue-Green collection \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002"})}
    </div>`;let i=n.find(S=>String(S.id)===String(t))||e?.latest||n[n.length-1],o=i?.pipeline&&typeof i.pipeline=="object"?i.pipeline:null,d=[...n].reverse().map(S=>{let $=Number(S.pipeline?.version_id||S.version_id||0),T=$?`v${String($).padStart(3,"0")}`:"\u7D22\u5F15";return`<option value="${r(String(S.id))}" ${String(S.id)===String(i.id)?"selected":""}>${r(`${$e(S.started_at)} \xB7 ${T} \xB7 ${_t(S.duration_ms)}`)}</option>`}).join(""),m=Number(o?.version_id||i.version_id||0),f=m?`v${String(m).padStart(3,"0")}`:"\u2014",y=o?.host||{},v=Uo(y),u=o?.model||i.model||"\u2014",b=Number(o?.total_ms)||Number(i.duration_ms)||0,w=Array.isArray(o?.stages)?o.stages:[],k=w.map((S,$)=>({...S,ms:Math.max(0,Number(S.duration_ms)||0),color:zo[$%zo.length]})).filter(S=>S.ms>0).map(S=>`<span class="index-pipeline-seg" style="width:${(S.ms/Math.max(1,b)*100).toFixed(2)}%;background:${r(S.color)}" title="${r(`${S.label} ${_t(S.ms)}`)}"></span>`).join(""),A=w.map((S,$)=>{let T=Math.max(0,Number(S.duration_ms)||0),K=b>0?T/b*100:0,G=S.host&&typeof S.host=="object"?S.host:null;return`<div class="index-pipeline-row">
        <span class="index-pipeline-step">${String($+1).padStart(2,"0")}</span>
        <div class="index-pipeline-copy">
          <div class="index-pipeline-title">
            <strong>${r(S.label||S.key||"\u968E\u6BB5")}</strong>
            ${at(S.status||"success")}
          </div>
          <span class="index-pipeline-detail">${r(S.detail||"\u2014")}</span>
          ${G?`<span class="index-pipeline-host">${p("server",12)} ${r(Uo(G))} \xB7 ${r(S.model||u)}</span>`:""}
        </div>
        <div class="index-pipeline-time">
          <strong>${_t(T)}</strong>
          <span>${K.toFixed(1)}%</span>
        </div>
      </div>`}).join("");return`<section class="index-perf-panel index-pipeline-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</div>
        <div class="index-perf-sub">Blue-Green collection\u3001host/model \u8207\u968E\u6BB5\u8017\u6642</div>
      </div>
      <div class="index-pipeline-actions">
        <select class="select index-pipeline-select" data-index-pipeline-select aria-label="\u9078\u64C7\u7D22\u5F15 Pipeline \u7D00\u9304">${d}</select>
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${p("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span></button>
      </div>
    </div>
    ${o?`<div class="index-pipeline-meta">
            <span><strong>\u7248\u672C</strong> ${r(f)}</span>
            <span><strong>collection</strong> ${r(String(o.collection||"\u2014"))}</span>
            <span><strong>\u6A21\u5F0F</strong> ${r(String(o.build_mode||"\u2014"))}</span>
            <span><strong>\u672C\u6B21</strong> ${o.resumed?`\u63A5\u7E8C\uFF08\u5DF2\u7D22\u5F15 ${c(o.resumed_indexed)} \u7B46\uFF09`:"\u65B0\u5EFA\u7248\u672C"}</span>
            <span><strong>Host</strong> ${r(v)}</span>
            <span><strong>Model</strong> ${r(String(u))}</span>
            <span><strong>\u7E3D\u8017\u6642</strong> ${_t(b)}</span>
          </div>
          <div class="index-pipeline-bar">${k}</div>
          <div class="index-pipeline-list">${A}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B Pipeline \u968E\u6BB5\u8CC7\u6599\uFF1B\u4E0B\u4E00\u6B21 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u6703\u8A18\u9304 host/model \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002</div>'}
  </section>`}function Tu(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Jo.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${p("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${p("chevronRight",13)}</button>
    </div>
  </div>`}function Eu(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"#65a30d":t.includes("judgment.rag")?"#8b5cf6":t.includes("judgment.web.app")?"#3b82f6":t.includes("judgment.web.query")?"#d97706":t.includes("judgment.judgment_index")?"#0d9488":"#64748b"}function Nu(e){let t=Ur(e),s=Math.max(0,Math.min(8,Number(e.depth)||0));return{key:"segment",label:`${"\u203A ".repeat(s)}${e.name||"unnamed"}`,hint:[e.module||"\u2014",e.function||"\u2014"].join(" \xB7 "),color:Eu(e),spans:[{...t,status:e.status||"ok",error:e.error,metadata:e.metadata||{},params:e.params||{},started_at:e.started_at,finished_at:e.finished_at}],start:t.offset,end:t.end,duration:t.duration}}function Mn(e){return(e||[]).map(Nu)}function Ru(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((v,u)=>Number(v.seq)-Number(u.seq)):[],n=s?.summary||{},i=Array.isArray(n.models)?n.models:[],o=s?.client||{},l=s?.metadata||{},d=l.question||"",m=l.answer||"",f=d||m?`<div class="perf-flow-qa">
          ${d?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${r(d)}</span></div>`:""}
          ${m?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${r(m)}</span></div>`:""}
        </div>`:"",y=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(v=>(Number(v.offset_ms)||0)+(Number(v.duration_ms)||0)),1);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${r(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${r(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${r(e.method||"")} ${r(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${$e(e.started_at)}</span>
      <span class="perf-record-duration">${ge(e.duration_ms)}</span>
      ${at(e.status)}
      <span class="perf-record-chevron">${p("chevronRight",14)}</span>
    </summary>
    <div class="perf-record-body">
      <div class="perf-flow-meta">
        <span><strong>Request</strong> <span class="mono">${r(e.request_id||s?.request_id||"\u2014")}</span></span>
        <span><strong>Server</strong> ${ge(e.duration_ms)}</span>
        ${o.total_ms?`<span><strong>Client \u5168\u6D41\u7A0B</strong> ${ge(o.total_ms)}</span>`:""}
        ${o.render_ms!==void 0?`<span><strong>Render</strong> ${ge(o.render_ms)}</span>`:""}
        <span><strong>Flow</strong> ${a.length} \u6BB5</span>
        ${a.length?"<span><strong>Waterfall</strong> \u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\u3001\u53EF\u9EDE\u9078\u5C55\u958B\u53C3\u6578</span>":""}
      </div>
      ${f}
      ${i.length?`<div class="chips perf-record-models">${i.map(v=>`<span class="chip">${r(v)}</span>`).join("")}</div>`:""}
      ${a.length?ra(Mn(a),y,"\u6B64 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002"):`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${r(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${r(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var Go={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",rerank:"Reranker",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"};function Cu(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}var Pu={embedding:"#3984c6",retrieval:"#d97706",rerank:"#8b5cf6",context:"#64748b",llm:"#16a34a",validation:"#8b5cf6"};function Iu(e,t){let s=Date.parse(e.started_at||""),a=Date.now(),n=Array.isArray(e.stage_order)?[...e.stage_order]:Object.keys(Go);for(let m of t)m.stage&&!n.includes(m.stage)&&n.push(m.stage);let i=[],o=0;for(let m of n){let f=t.filter(u=>u.stage===m);if(!f.length)continue;let y=f.map(u=>{let b=Date.parse(u.started_at||""),w=Number.isFinite(s)&&Number.isFinite(b)?Math.max(0,b-s):0,k=Math.max(0,Number(u.duration_ms)||0);u.status==="running"&&Number.isFinite(b)&&(k=Math.max(k,a-b));let A=w+k;return o=Math.max(o,A),{offset:w,end:A,duration:k,status:u.status==="failed"?"error":u.status==="running"?"running":"ok",started_at:u.started_at,finished_at:u.finished_at,error:u.error_message,metadata:{...u.details||{},model:u.model,status:u.status,progress:Number(u.progress)||0,module:u.module,function:u.function},params:{model:u.model}}}),v=y.reduce((u,b)=>u+b.duration,0);i.push({key:"test_stage",label:Go[m]||m,hint:`${y.length} \u500B\u7A0B\u5E8F`,color:Pu[m]||"#64748b",spans:y,start:y.length?Math.min(...y.map(u=>u.offset)):null,end:y.length?Math.max(...y.map(u=>u.end)):null,duration:v})}let l=e.status==="running"&&Number.isFinite(s)?Math.max(0,a-s):0,d=Math.max(Number(e.total_ms)||0,l,o,1);return{stages:i,total:d}}function ia(e,t,s,a={}){let n=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(A=>`<option value="${r(A.run_id)}" ${A.run_id===s?"selected":""}>${r(Cu(A.status))} \xB7 ${r((A.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${r($e(A.started_at))}</option>`)].join(""),o=n?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${p("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${p("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?at(e.status):""}</div>
      <div class="test-flow-question">${e?r(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${yt({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let d=Array.isArray(e.steps)?e.steps:[],m=Iu(e,d),f=e.models||{},y=e.status==="running"?`${ge(m.total)}\uFF08\u4F30\u7B97\uFF09`:ge(e.total_ms),v=d.find(A=>A.stage==="llm"&&A.model===e.summary?.primary_model)||d.find(A=>A.stage==="llm"&&A.details?.answer_preview),u=String(v?.details?.provider_name||"").trim(),b=u&&e.summary?.primary_model?`${u}:${e.summary.primary_model}`:e.summary?.primary_model||"",w=e.answer||v?.details?.answer_preview||"",k=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${b?`<span class="mono">${r(b)}</span>`:""}
    </div>
    <p>${w?r(w):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${r(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${r($e(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${y}</span>
      <span><strong>Embedding</strong> ${Array.isArray(f.embedding)?f.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(f.llm)?f.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${r(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${k}
    ${m.stages.length?ra(m.stages,m.total,"\u6E2C\u8A66 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B\u7A0B\u5E8F\u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u6A21\u578B\u3001\u72C0\u614B\u3001\u9032\u5EA6\u3001module\uFF0Ffunction \u8207\u932F\u8AA4\u3002"):'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":n?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${b?`<span class="mono">primary=${r(b)}</span>`:""}
    </div>
  </div>`}function Qo(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},n=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${at(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${c(e.total)} \u7B46\u7B26\u5408 \xB7 ${ge(e.duration_ms)} \xB7
          \u6BCF\u6B21\u57F7\u884C\u6309\u9215\u7684\u5B8C\u6574 Flow
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${p("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${p("file",14)}<span>JSON</span></button>
      </div>
    </div>
    ${s.length?`<div class="summary-strip">${s.map(i=>`<div class="summary-item">
                <div class="summary-label">${r(i.label)}</div>
                <div class="summary-value">${r(i.value)}</div>
              </div>`).join("")}</div>`:""}
    ${Lu(n)}
    ${xu(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>Ru(i,o)).join(""):yt({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${Tu(e)}
    <details class="perf-query-details">
      <summary>\u67E5\u8A62\u8A9E\u53E5\u8207\u8B66\u544A</summary>
      <div class="query-box">
        <pre class="query-code">${r(e.query_text||"\u2014")}</pre>
        <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
          ${p("copy",12)}<span>\u8907\u88FD</span>
        </button>
      </div>
      ${Array.isArray(e.warnings)&&e.warnings.length?`<div class="warnings">${e.warnings.map(i=>`<div class="warning-line">${r(i)}</div>`).join("")}</div>`:""}
    </details>
  </div>`}async function Du(e,t){let s=Kt(),a=!1,n=zr(),i={processes:[],modules:[],statuses:[],methods:[],models:[]},o=1,l=25,d=null,m=[],f="",y=!1,v=null,u=!1,b=null,w="",k=!1,A=null,S=!1;e.innerHTML=`<section class="page data-page performance-page">
    <div class="page-header">
      <div class="data-page-heading">
        <div class="eyebrow">PERFORMANCE</div>
        <div class="data-title-line">
          <h1 class="page-title">\u6548\u80FD\u5831\u8868</h1>
          <p class="page-subtitle data-page-subtitle">\u8A18\u9304\u6BCF\u6B21\u57F7\u884C\u6309\u9215\u5F9E\u63A5\u6536\u547D\u4EE4\u5230\u56DE\u50B3\u7D50\u679C\u7684\u5B8C\u6574 Flow\uFF1A\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u3001\u6A21\u578B\u8207\u5340\u6BB5\u8017\u6642\u3002</p>
        </div>
      </div>
      <div class="page-actions">
        ${s?'<span class="badge badge-neutral badge-mono">\u5C55\u793A\u6A21\u5F0F \xB7 \u552F\u8B80</span>':""}
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
          <button class="status-tab" type="button" data-performance-tab="pipeline">
            <span class="status-tab-icon">${p("activity",15)}</span>
            <span class="status-tab-copy"><strong>RAG Pipeline</strong><small>Span waterfall\u3001Token \u8207 TTFT</small></span>
          </button>
          <button class="status-tab" type="button" data-performance-tab="index-pipeline">
            <span class="status-tab-icon">${p("layers",15)}</span>
            <span class="status-tab-copy"><strong>\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</strong><small>Host\uFF0FModel\u3001Blue-Green \u8207\u968E\u6BB5\u8017\u6642</small></span>
          </button>
          <button class="status-tab${s?" is-demo-locked":""}" type="button" data-performance-tab="benchmark"${s?' data-demo-lock-tooltip="\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B Benchmark \u57F7\u884C"':""}>
            <span class="status-tab-icon">${p("brain",15)}</span>
            <span class="status-tab-copy"><strong>RAG Benchmark</strong><small>\u984C\u5EAB\u3001\u6A21\u578B\u3001\u8A55\u5206\u8207\u540C\u984C\u6B77\u53F2</small></span>
            ${s?'<span class="badge badge-neutral badge-mono">LOCK</span>':""}
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
              <div id="performance-report">${qa({label:"\u6548\u80FD\u5831\u8868"})}</div>
            </section>
          </div>
        </div>
        <div id="performance-panel-pipeline" hidden></div>
        <div id="performance-panel-index-pipeline" hidden></div>
        <div id="performance-panel-benchmark" hidden></div>
      </section>
    </div>
  </section>`;let $=e.querySelector("#performance-filter-fields"),T=e.querySelector("#performance-filter-form"),K=e.querySelector("#performance-test-flow"),G=e.querySelector("#performance-report"),fe=e.querySelector("#performance-panel-pipeline"),ye=e.querySelector("#performance-panel-index-pipeline"),ie=e.querySelector("#performance-meta"),L=e.querySelector("#performance-refresh"),q=[...e.querySelectorAll("[data-performance-tab]")],j={overview:e.querySelector("#performance-panel-overview"),pipeline:e.querySelector("#performance-panel-pipeline"),"index-pipeline":e.querySelector("#performance-panel-index-pipeline"),benchmark:e.querySelector("#performance-panel-benchmark")},V="overview",de=I=>{V=I;for(let H of q){let J=H.dataset.performanceTab===I;H.classList.toggle("is-active",J),J?H.setAttribute("aria-current","page"):H.removeAttribute("aria-current")}for(let[H,J]of Object.entries(j))J&&(J.hidden=H!==I);I==="benchmark"?ie.textContent="BENCHMARK \xB7 RAG":I==="pipeline"?ie.textContent="PERFORMANCE \xB7 RAG WATERFALL":I==="index-pipeline"?ie.textContent="PERFORMANCE \xB7 INDEX PIPELINE":d&&(ie.textContent=`PERFORMANCE \xB7 ${c(d.total)} \u7B46`)},z=Ao(e,{onNavigate:I=>de(I)});s&&(K.innerHTML=Cs("\u7CFB\u7D71\u6E2C\u8A66\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u6548\u80FD\u5831\u8868\u3001RAG Pipeline \u8207\u7D22\u5F15 Pipeline\uFF1B\u6E2C\u8A66\u6D41\u7A0B\u8207 Benchmark \u57F7\u884C\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002"));let Z=()=>{fe&&(fe.innerHTML=Su(m,f,y,v))},qe=async({force:I=!1}={})=>{if(!(a||y)){if(u&&!I){Z();return}y=!0,m.length||Z();try{let H=await Q.performance({keyword:"/api/rag"},1,50);if(a)return;let J=(Array.isArray(H.rows)?H.rows:[]).filter(we=>we.flow&&(String(we.path||"").includes("/api/rag")||String(we.process||"").includes("RAG")));m=J,(!f||!J.some(we=>String(we.id)===String(f)))&&(f=J[0]?String(J[0].id):""),v=null,u=!0}catch(H){if(a)return;v=H}finally{a||(y=!1,Z())}}},F=()=>{ye&&(ye.innerHTML=ju(b,w,k,A))},ke=async({force:I=!1}={})=>{if(!(a||k)){if(S&&!I){F();return}k=!0,b||F();try{let H=await Q.performance({},1,1);if(a)return;b=H.index_pipeline||H.index_stats||null;let J=Array.isArray(b?.runs)?b.runs:[];(!w||!J.some(we=>String(we.id)===String(w)))&&(w=b?.latest?String(b.latest.id):""),A=null,S=!0}catch(H){if(a)return;A=H}finally{a||(k=!1,F())}}},ne=I=>{if(de(I),I==="benchmark"){if(s){let H=j.benchmark;H&&(H.innerHTML=Cs("RAG Benchmark \u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u6548\u80FD\u5831\u8868\u8207 Pipeline\uFF1BBenchmark \u984C\u5EAB\u3001\u6A21\u578B\u8A2D\u5B9A\u3001\u57F7\u884C\u8207\u8A55\u5206\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002"));return}z.show()}I==="pipeline"&&qe(),I==="index-pipeline"&&ke()};e.addEventListener("click",I=>{let H=I.target.closest("[data-performance-tab]");H&&ne(H.dataset.performanceTab||"overview")}),fe?.addEventListener("change",I=>{I.target.matches("[data-rag-trace-select]")&&(f=String(I.target.value||""),Z())}),fe?.addEventListener("click",I=>{I.target.closest('[data-action="refresh-rag-waterfall"]')&&qe({force:!0})}),ye?.addEventListener("change",I=>{I.target.matches("[data-index-pipeline-select]")&&(w=String(I.target.value||""),F())}),ye?.addEventListener("click",I=>{I.target.closest('[data-action="refresh-index-pipeline"]')&&ke({force:!0})});let Se=null,Pe=[],Le="",Ze=null,he="",oe=()=>{$.innerHTML=fu(i,n)},ce=()=>{let I=JSON.stringify({selected:Le,tick:Se?.status==="running"?Math.floor(Date.now()/1e3):0,runs:Pe.map(H=>`${H.run_id}:${H.status}`),run:Se?{run_id:Se.run_id,status:Se.status,progress:Se.progress,total_ms:Se.total_ms,steps:(Se.steps||[]).map(H=>`${H.stage}:${H.model}:${H.status}:${H.progress}:${H.duration_ms}`)}:null});I!==he&&(he=I,K.innerHTML=ia(Se,Pe,Le))},ve=async()=>{if(!s)try{let I=await Q.testRuns(30);if(a)return;Pe=Array.isArray(I.runs)?I.runs:[]}catch{if(a)return;Pe=[]}},je=async(I=null)=>{if(!s)try{let H=I&&!Le?I:Le?await Q.testRun(Le):await Q.testRunCurrent();if(a)return;Se=H.run||null,!Le&&Se&&Se.status!=="running"&&!Pe.some(J=>J.run_id===Se.run_id)&&await ve(),ce()}catch{if(a)return;Se=null,ce()}},Te=async(I=null)=>{a||Le||await je(I)},C=()=>{s||a||Ze||(Ze=Mt("test-runs",(I,H)=>Te(H?.snapshot||null)))};K.addEventListener("change",async I=>{I.target.id==="test-run-select"&&(Le=String(I.target.value||""),await je())}),K.addEventListener("click",async I=>{I.target.closest("#test-flow-refresh")&&(Le="",await ve(),await je())});let D=async(I=o,{quiet:H=!1}={})=>{o=Math.max(1,Number(I)||1),n=Fo();let J=`judgment.performance.result.v1:${JSON.stringify({filters:n,page:o,pageSize:l})}`,we=ms(J,120*1e3);we&&o===1&&(d=we,G.innerHTML=Qo(we),ie.textContent=`PERFORMANCE \xB7 ${c(we.total)} \u7B46`);let Oe=G.querySelector(".report-card"),Ve=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!Oe?G.setAttribute("aria-busy","true"):(G.removeAttribute("aria-busy"),G.innerHTML=qa({label:"\u6548\u80FD\u5831\u8868"}));let nt=e.querySelector("#performance-run");H||Re(nt,!0,"\u67E5\u8A62\u4E2D\u2026");try{let tt=await Q.performance(n,o,l);if(a)return;if(d=tt,os(J,tt),tt.index_pipeline){b=tt.index_pipeline;let et=Array.isArray(b.runs)?b.runs:[];(!w||!et.some(pe=>String(pe.id)===String(w)))&&(w=b.latest?String(b.latest.id):""),S=!0,A=null}if(o=Number(tt.page)||o,l=Number(tt.page_size)||l,G.removeAttribute("aria-busy"),G.innerHTML=Qo(tt),Ve!==null){let et=G.querySelector("[data-page-size]");et&&(et.value=String(l),et.focus({preventScroll:!0}))}ie.textContent=`PERFORMANCE \xB7 ${c(tt.total)} \u7B46`,ie.className="badge badge-neutral badge-mono"}catch(tt){if(a)return;G.removeAttribute("aria-busy"),G.innerHTML=_n(tt,{label:"\u6548\u80FD\u5831\u8868"}),R(tt.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{a||Re(nt,!1)}},W=async()=>{let I=ms("judgment.performance.options.v1",3e5);if(I){i=I,oe(),Q.performanceOptions().then(H=>{i=H,os("judgment.performance.options.v1",H),oe()}).catch(()=>{});return}try{i=await Q.performanceOptions(),os("judgment.performance.options.v1",i)}catch{i={processes:[],modules:[],statuses:[],methods:[],models:[]}}oe()};return T.addEventListener("submit",I=>{I.preventDefault(),D(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{n=zr(),o=1,oe(),D(1)}),L.addEventListener("click",async()=>{if(V==="pipeline"){Re(L,!0,"\u6574\u7406\u4E2D\u2026");try{await qe({force:!0})}finally{a||Re(L,!1)}return}if(V==="index-pipeline"){Re(L,!0,"\u6574\u7406\u4E2D\u2026");try{await ke({force:!0})}finally{a||Re(L,!1)}return}if(V==="benchmark"){if(s)return;Re(L,!0,"\u6574\u7406\u4E2D\u2026");try{await z.refresh()}finally{a||Re(L,!1)}return}n=Fo(),L.disabled=!0,Re(L,!0,"\u6574\u7406\u4E2D\u2026"),await W(),await ve(),a||await je(),a||await D(1),a||(L.disabled=!1,Re(L,!1))}),G.addEventListener("click",async I=>{let H=I.target.closest("[data-action]");if(!H||!d)return;let J=H.dataset.action;if(J==="retry"){D(o);return}if(J==="prev-page"){D(Math.max(1,Number(d.page)-1),{quiet:!0});return}if(J==="next-page"){let we=Math.max(1,Math.ceil(Number(d.total)/Number(d.page_size)));D(Math.min(we,Number(d.page)+1),{quiet:!0});return}if(J==="copy-query"){let we=await ks(d.query_text||"");R(we?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",we?"ok":"warn");return}if(J==="export-json"){let we=`performance-page-${d.page}.json`;Vt(we,JSON.stringify(Sn(d),null,2),"application/json;charset=utf-8"),R(`\u5DF2\u532F\u51FA ${we}`,"ok");return}if(J==="export-csv"){let we=`performance-page-${d.page}.csv`;Vt(we,kn(d),"text/csv;charset=utf-8"),R(`\u5DF2\u532F\u51FA ${we}`,"ok")}}),G.addEventListener("change",I=>{I.target.matches("[data-page-size]")&&(l=Number(I.target.value)||25,Jo.includes(l)||(l=25),D(1,{quiet:!0}))}),s?(await W(),a||await D(1)):(await Promise.allSettled([W(),ve()]),a||(await je(),await D(1),C())),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{a=!0,Ze&&Ze(),z.destroy()}}var cl="q",dl="share",ei="contentId",ti="rag/share",Ln="https://judgment.ragdemo.win",Bu=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5F9E\u696D\u4EBA\u54E1\u6709\u90A3\u4E9B\u898F\u5B9A\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function Fu(){return`<div class="answer-placeholder">
    <span class="empty-icon">${p("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function Vr(){return`<section class="card answer-card rag-empty-answer">${Fu()}</section>`}function ul(e){let t=r(e);return`<div class="rag-answer-actions" role="group" aria-label="\u56DE\u7B54\u64CD\u4F5C">
    <button class="rag-answer-action" type="button" data-rag-answer-action="copy" data-question="${t}" title="\u8907\u88FD\u56DE\u7B54" aria-label="\u8907\u88FD\u56DE\u7B54">${p("copy",15)}<span class="sr-only">\u8907\u88FD\u56DE\u7B54</span></button>
    <button class="rag-answer-action" type="button" data-rag-answer-action="share" data-question="${t}" title="\u5EFA\u7ACB\u516C\u958B\u9023\u7D50" aria-label="\u5EFA\u7ACB\u516C\u958B\u9023\u7D50">${p("share",15)}<span class="sr-only">\u5EFA\u7ACB\u516C\u958B\u9023\u7D50</span></button>
    <button class="rag-answer-action" type="button" data-rag-answer-action="reask" data-question="${t}" title="\u91CD\u65B0\u751F\u6210\u56DE\u7B54" aria-label="\u91CD\u65B0\u751F\u6210\u56DE\u7B54">${p("refresh",15)}<span class="sr-only">\u91CD\u65B0\u751F\u6210\u56DE\u7B54</span></button>
  </div>`}function tl(e,t,{complete:s=!0}={}){let a=r(e);return`<div class="rag-turn${s?" is-complete":" is-pending"}">
    <div class="rag-user-block">
      <div class="rag-user-bubble">${a}</div>
      <div class="rag-user-actions" role="group" aria-label="\u554F\u984C\u64CD\u4F5C">
        <button class="rag-user-action" type="button" data-rag-question-action="copy" data-question="${a}" title="\u8907\u88FD\u554F\u984C" aria-label="\u8907\u88FD\u554F\u984C">${p("copy",15)}<span class="sr-only">\u8907\u88FD\u554F\u984C</span></button>
        <button class="rag-user-action" type="button" data-rag-question-action="share" data-question="${a}" title="\u5EFA\u7ACB\u516C\u958B\u9023\u7D50" aria-label="\u5EFA\u7ACB\u516C\u958B\u9023\u7D50">${p("share",15)}<span class="sr-only">\u5EFA\u7ACB\u516C\u958B\u9023\u7D50</span></button>
        <button class="rag-user-action" type="button" data-rag-question-action="edit" data-question="${a}" title="\u7DE8\u8F2F\u554F\u984C" aria-label="\u7DE8\u8F2F\u554F\u984C">${p("edit",15)}<span class="sr-only">\u7DE8\u8F2F\u554F\u984C</span></button>
        <button class="rag-user-action" type="button" data-rag-question-action="reask" data-question="${a}" title="\u91CD\u65B0\u63D0\u554F" aria-label="\u91CD\u65B0\u63D0\u554F">${p("refresh",15)}<span class="sr-only">\u91CD\u65B0\u63D0\u554F</span></button>
      </div>
    </div>
    <div class="rag-answer-block">
      <section class="card rag-assistant-turn" data-rag-answer>${t}</section>
    </div>
  </div>`}function Ou(e){let t=new URL(window.location.href);return t.search="",t.hash=`#/${ti}?${ei}=${encodeURIComponent(e)}`,t.toString()}function Hu(){let e=window.location.hash.replace(/^#\/?/,""),[t,s=""]=e.split("?"),a=t.replace(/\/+$/,"");if(a===ti)return String(new URLSearchParams(s).get(ei)||"").trim();let n=a.match(/^rag\/share\/([^/]+)$/);if(!n)return"";try{return decodeURIComponent(n[1])}catch{return n[1]}}function Kr({keepToken:e=!1,token:t=""}={}){try{let s=new URL(window.location.href);s.searchParams.delete(cl),s.searchParams.delete(dl),s.hash=e&&t?`#/${ti}?${ei}=${encodeURIComponent(t)}`:"#/rag",window.history.replaceState(null,"",`${s.pathname}${s.search}${s.hash}`)}catch{}}function zu(){try{let e=new URL(window.location.href),t=String(e.searchParams.get(dl)||"").trim(),s=Hu()||t,a=String(e.searchParams.get(cl)||"").trim();return!s&&!a?null:{token:s.slice(0,64),question:a.slice(0,500)}}catch{return null}}function Yr(e){if(!e)return"";let t=Array.from(e.querySelectorAll("[data-rag-answer] .answer-text")).map(a=>String(a.textContent||"").trim()).filter(Boolean);if(t.length)return t.join(`

`);let s=e.querySelector("[data-rag-answer]");return s?String(s.innerText||"").trim():""}function Uu(e){let t=e&&typeof e=="object"?e:{};return{status:t.status,answer:t.answer,answer_source:t.answer_source,notice:t.notice,citations:Array.isArray(t.citations)?t.citations:[],judgments:Array.isArray(t.judgments)?t.judgments:[],reference_judgments:Array.isArray(t.reference_judgments)?t.reference_judgments:[],law_sources:Array.isArray(t.law_sources)?t.law_sources:[],matched_terms:Array.isArray(t.matched_terms)?t.matched_terms:[],law_answer:t.law_answer,law_framework:t.law_framework,llm_model:t.llm_model,embedding_model:t.embedding_model,duration_ms:t.duration_ms,show_sources:t.show_sources,retrieval:t.retrieval,rerank_degraded:t.rerank_degraded,degraded_reason:t.degraded_reason,partial:!1,streaming:!1}}async function Xr(e,t){let s=(Array.isArray(e)?e:[]).filter(o=>String(o?.question||"").trim()).map(o=>({question:String(o.question||"").trim().slice(0,500),asked_at:String(o.asked_at||""),payload:Uu(o.payload)}));if(!s.length){R("\u6C92\u6709\u53EF\u5EFA\u7ACB\u516C\u958B\u9023\u7D50\u7684\u5C0D\u8A71\u3002","warn");return}let a=null;try{a=await Q.ragShareCreate({title:String(t||s[0]?.question||"").slice(0,200),turns:s})}catch{a=null}if(!a?.id){R("\u7121\u6CD5\u5EFA\u7ACB\u516C\u958B\u9023\u7D50\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger",6e3);return}let n=Ou(a.id);if(!await ks(n)){R("\u7121\u6CD5\u8907\u88FD\u516C\u958B\u9023\u7D50\uFF0C\u8ACB\u78BA\u8A8D\u700F\u89BD\u5668\u526A\u8CBC\u7C3F\u6B0A\u9650\u3002","danger",6e3);return}R("\u5DF2\u8907\u88FD\u516C\u958B\u9023\u7D50","ok",7e3,{detail:"\u4EFB\u4F55\u64C1\u6709\u6B64\u9023\u7D50\u7684\u4EBA\u90FD\u53EF\u4EE5\u67E5\u770B\u9019\u6BB5\u5C0D\u8A71\u3002",actionLabel:"\u958B\u555F\u9023\u7D50",onAction:()=>{window.open(n,"_blank","noopener,noreferrer")}})}function Gu(e,t){return Promise.race([e,new Promise((s,a)=>{window.setTimeout(()=>a(new Error("pipeline lookup timed out")),t)})])}async function Qu(e){if(!e||e.pipeline_flow)return e;let t=String(e._client_request_id||e.request_id||"").trim();if(!t)return e;for(let s=0;s<3;s+=1){try{let a=await Gu(Q.performance({keyword:t},1,5),1800),n=(Array.isArray(a.rows)?a.rows:[]).find(i=>String(i.request_id||"")===t&&i.flow&&typeof i.flow=="object");if(n)return e.pipeline_flow=n.flow,e}catch{}s<2&&await new Promise(a=>window.setTimeout(a,250))}return e}function sl(e){return{status:e.status,answer:e.answer,answer_source:e.answer_source,notice:e.notice,citations:Array.isArray(e.citations)?e.citations:[],judgments:Array.isArray(e.judgments)?e.judgments:[],law_sources:Array.isArray(e.law_sources)?e.law_sources:[],matched_terms:Array.isArray(e.matched_terms)?e.matched_terms:[],law_answer:e.law_answer,law_framework:e.law_framework,llm_model:e.llm_model,embedding_model:e.embedding_model,duration_ms:e.duration_ms,show_sources:e.show_sources,pipeline_flow:e.pipeline_flow||null,test_run:e.test_run||null,partial:!1,streaming:!1}}var Ju={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"llama-server embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"llama-server LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function Wu(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`llama-server run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`llama-server embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:Ju[t]||t||"backend step"}function al(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function nl(e){let t=Number(e);return Number.isFinite(t)?`${c(Math.max(0,Math.round(t)))} ms`:"\u2014"}function Zr(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function Vu(){return`<div class="rag-process is-open" id="rag-process">
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
  </div>`}function Ku(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),n=performance.now(),i=new Map,o=new Map,l=(u,b,w)=>{let k=u.querySelector(b);k&&(k.textContent=w)},d=u=>{if(u.failed){l(u.element,".rag-process-meta","\u5931\u6557");return}if(u.hasChildren){l(u.element,".rag-process-meta","");return}l(u.element,".rag-process-meta",nl(u.durationMs))},m=u=>{let b=u-1,w=[...i.values()].reverse();for(let k of w){if(b<0)break;k.depth<=b&&(k.hasChildren||(k.hasChildren=!0,k.element.dataset.hasChildren="true",k.finished&&d(k)),b=k.depth-1)}},f=u=>{if(!s)return null;let b=String(u?.seq??`step-${i.size+1}`),w=i.get(b);if(!w){let k=Math.max(0,Math.min(6,Number(u?.depth)||0));m(k);let A=document.createElement("div");A.className="rag-process-item is-running",A.dataset.processKey=b,A.style.setProperty("--depth",String(k)),A.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(A),w={element:A,depth:k,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(b,w)}return l(w.element,".rag-process-label",Wu(u)),w.element.title=al(u),w};return{step:u=>{let b=u?.segment;if(!b)return;o.set(String(b.seq??b.name??o.size),{...b});let w=f(b);if(w){if(u.type==="segment_start"){w.element.classList.add("is-running"),l(w.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(u.type==="segment_end"){let k=b.status==="error";w.element.classList.remove("is-running"),w.element.classList.toggle("is-error",k),w.finished=!0,w.failed=k,w.durationMs=Number(b.duration_ms)||0,d(w),w.element.title=[al(b),k&&b.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(u=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(A=>{A.classList.remove("is-running");let S=A.dataset.hasChildren==="true";l(A,".rag-process-meta",S?"":u?"\u5B8C\u6210":"\u4E2D\u65B7")});let b=s?.children.length||i.size,w=nl(Math.max(0,performance.now()-n));a&&(a.textContent=u?`\u5B8C\u6210 \xB7 ${b} \u6B65 \xB7 ${w}`:`\u5931\u6557 \xB7 ${b} \u6B65`);let k=[...o.values()].filter(A=>A?.name).sort((A,S)=>Number(A.offset_ms||0)-Number(S.offset_ms||0));if(s&&k.length){let A=Math.max(1,...k.map(S=>Number(S.end_offset_ms)||(Number(S.offset_ms)||0)+(Number(S.duration_ms)||0)));s.classList.add("is-waterfall"),s.innerHTML=ra(Mn(k),A,"\u5F8C\u7AEF Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B span \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002")}return t.classList.add("is-complete"),Zr(t,!1),t.outerHTML},collapse:()=>Zr(t,!1)}}function Yu(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${p("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":Vu()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${r(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function rl(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Tn(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let n=String(e||"").trim();return n?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t||n)}"
    data-source-type="${r(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(a||n)}</button>`:""}function pl(e){let t=String(e?.law_name||"").trim(),s=String(e?.article_no||"").replace(/\s+/g,"");if(!t||!s)return"";let a=(Array.isArray(e?.paragraphs)?e.paragraphs:[]).map(i=>String(i||"").trim()).filter(Boolean),n=`${t}${s}${a.join("\u3001")}`;return`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t)}"
    data-source-type=""
    data-article-no="${r(s)}"
    title="\u9EDE\u64CA\u67E5\u770B ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(n)}</button>`}function ml(e){let t=String(e?.citation_status||"");return t==="cited"?"\u7B54\u6848\u5F15\u7528":t==="provided_not_cited"?"\u5DF2\u63D0\u4F9B\u7D66\u6A21\u578B\uFF0C\u7B54\u6848\u672A\u5F15\u7528":t==="reference_only"||e?.used_for_generation===!1?"\u50C5\u4F9B\u53C3\u8003\uFF08\u672A\u9032\u5165\u751F\u6210 prompt\uFF09":e?.used_for_generation===!0?"\u5DF2\u63D0\u4F9B\u7D66\u6A21\u578B":""}function Xu(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(y=>`<span>${r(y)}</span>`).join(""),n=ml(e),i=n?`<span>${r(n)}</span>`:"",o=(Array.isArray(e.law_citations)?e.law_citations:[]).map(y=>pl(y)).filter(Boolean).slice(0,12).join(""),l=o||(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(y=>Tn(y)).join(""),d=o?'<div class="citation-meta"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':"",m=e.jid?` data-action="open-parquet-judgment"
        data-jid="${r(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${r(e.jid)}"`:"",f=e.pdf_url?`<a class="citation-link" href="${r(It(e.pdf_url))}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${p("external",11)}</a>`:"";return`<article class="citation">
    <span class="citation-index">[${e.index??t+1}]</span>
    <div class="citation-body">
      <div class="citation-head"${m}>
        <h4 class="citation-name">${r(e.jid||"\u672A\u77E5\u6848\u865F")}</h4>
        <div class="citation-meta">${a||"<span>\u5224\u6C7A metadata</span>"}${i}</div>
        ${e.title?`<div class="citation-meta"><span>\u6848\u7531\uFF1A${r(e.title)}</span></div>`:""}
      </div>
      ${d}
      ${l?`<div class="chips" style="margin-top:8px">${l}</div>`:""}
      ${e.snippet?`<p class="citation-snippet">${r(e.snippet)}</p>`:""}
    </div>
    <div class="citation-links">${f}</div>
  </article>`}function Zu(e){let t=[e.court,e.jdate].filter(Boolean).map(n=>`<span>${r(n)}</span>`).join(""),s=[e.vector_score!==null&&e.vector_score!==void 0?`\u5411\u91CF ${Number(e.vector_score).toFixed(4)}`:"",e.rerank_score!==null&&e.rerank_score!==void 0?`rerank ${Number(e.rerank_score).toFixed(4)}`:""].filter(Boolean).map(n=>`<span>${r(n)}</span>`).join("");return`<article class="citation reference-judgment">
    <span class="citation-index">\u53C3</span>
    <div class="citation-body">
      <div class="citation-head"${e.jid?` data-action="open-parquet-judgment"
        data-jid="${r(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${r(e.jid)}"`:""}>
        <h4 class="citation-name">${r(e.title||e.jid||"\u76F8\u95DC\u5224\u6C7A")}</h4>
        <div class="citation-meta">
          ${t||"<span>\u5224\u6C7A metadata</span>"}
          <span>\u50C5\u4F9B\u53C3\u8003\uFF08\u672A\u7528\u65BC\u751F\u6210\u7B54\u6848\uFF09</span>
        </div>
        ${e.jid?`<div class="citation-meta"><span>${r(e.jid)}</span></div>`:""}
        ${s?`<div class="citation-meta">${s}</div>`:""}
      </div>
    </div>
  </article>`}function ep(e,t){let s=[e.law_level,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${r(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${r(It(e.law_url))}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${p("external",11)}</a>`:"",n=e.law_key||e.law_name||"",i=n?` data-action="open-law-source"
        data-law-key="${r(n)}"
        data-source-type=""
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body"${i}>
      <h4 class="citation-name">${r(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${s||"<span>\u6CD5\u898F metadata</span>"}</div>
      ${e.snippet?`<p class="citation-snippet">${r(e.snippet)}</p>`:""}
    </div>
    ${a}
  </article>`}function tp(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",n=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${r(s)}</span>`,a,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${Jt(e.law_modified_date)}`:"",ml(e)].filter(Boolean).map(u=>`<span>${u}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${r(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${r(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${r(o.entity||"")}\u300D\u7684\u5224\u6C7A ${c(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${c(o.law_count||0)} \u6B21</span>
      </div>`:"",d=e.law_key||"",m=e.source_type||"",f=(Array.isArray(e.articles)?e.articles:[]).map(u=>{let b=String(u.article_no||"");return`<div class="law-source-article"${d&&b?` data-action="open-law-source"
        data-law-key="${r(d)}"
        data-source-type="${r(m)}"
        data-article-no="${r(b)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${r(b)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} ${r(b)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${r(u.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${r(u.article_content||"")}</p>
      </div>`}).join(""),y=e.law_url?`<a class="citation-link" href="${r(It(e.law_url))}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${p("external",11)}</a>`:"",v=e.law_key?` data-action="open-law-source"
        data-law-key="${r(e.law_key)}"
        data-source-type="${r(e.source_type||"")}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u672C\u5730 Parquet \u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation law-source">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body"${v}>
      <h4 class="citation-name">${r(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${n}</div>
      ${i}
      ${l}
      ${f}
    </div>
    <div class="citation-links">${y}</div>
  </article>`}function sp(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function ap(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${r(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",n=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(n==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),d=s.index!=null?`<span class="law-answer-index">[${r(String(s.index))}]</span>`:"",m=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${r(a)}"
            data-source-type="${r(n)}"
            title="\u9EDE\u64CA\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587">${r(i)}</button>`:`<strong>${r(i)}</strong>`,f=Array.isArray(s.articles)?s.articles:[],y=f.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${f.map(v=>{let u=String(v.article_no||"").trim(),b=sp(v.article_content);return!a||!u?`<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${r(u||"\u689D\u6587")}</span>
                  <span class="law-answer-article-text">${r(b)}</span>
                </div>`:`<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${r(a)}"
                data-source-type="${r(n)}"
                data-article-no="${r(u)}"
                title="\u9EDE\u64CA\u67E5\u770B ${r(u)} \u7684\u5B8C\u6574\u5167\u5BB9"
                aria-label="\u958B\u555F ${r(i)} ${r(u)} \u7684\u5B8C\u6574\u689D\u6587">
                <span class="law-answer-article-no">${r(u)}</span>
                <span class="law-answer-article-text">${r(b)}</span>
              </button>`}).join("")}</div>`:"";return`<div class="law-answer-source">
        <div class="law-answer-source-head">
          ${m}
          <span class="law-answer-source-meta">\uFF08${r(o)}\uFF0C${c(l)} \u689D\uFF09</span>
          ${d}
        </div>
        ${y}
      </div>`}).join("")}</div>`}function np(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let n=s.get(String(a));return n?.law_key?Tn(a,{lawKey:n.law_key,sourceType:n.source_type||""}):`<span class="chip">${r(a)}</span>`}).join("")}</div>`}function rp(e){let t=String(e||"");return t==="operational"?"is-ok":t==="standby"?"is-idle":"is-down"}function ip(e){let t=String(e||"");return t==="operational"?"":t==="standby"?"\u5099\u63F4":t==="disabled"?"\u505C\u7528":t==="not_configured"?"\u672A\u8A2D\u5B9A":"\u96E2\u7DDA"}function il(e,{fallback:t=!1}={}){if(!e)return`<span class="rag-model-cell is-empty">
      <span class="rag-model-state is-idle" aria-hidden="true"></span>
      <span class="rag-model-name">\u672A\u8A2D\u5B9A</span>
    </span>`;let s=String(e.label||"").trim()||[e.host,e.model].filter(Boolean).join(":"),a=String(e.status||""),n=!["operational","standby"].includes(a),i=t&&!n?"\u5099\u63F4":ip(a),o=n?"is-down":t?"is-idle":rp(a),l=[s,e.url,i].filter(Boolean).join(" \xB7 ");return`<span class="rag-model-cell" title="${r(l)}">
    <span class="rag-model-state ${o}" aria-hidden="true"></span>
    <span class="rag-model-name">${r(s)}</span>
    ${i?`<span class="rag-model-note">${r(i)}</span>`:""}
  </span>`}function op(e,t){let s=Array.isArray(e)?e:[],a=[{kind:"chat",label:"Chat"},{kind:"embedding",label:"Embedding"},{kind:"rerank",label:"Rerank"}],n=new Map(s.map(o=>[String(o.kind||""),o])),i=a.map(o=>{let l=n.get(o.kind)||o;return`<tr>
        <td class="rag-model-kind">${r(l.label||o.label)}</td>
        <td>${il(l.active)}</td>
        <td>${il(l.fallback,{fallback:!0})}</td>
      </tr>`}).join("");return`<div class="rag-model-strip">
    <div class="rag-model-strip-head">
      <span class="rag-model-strip-title">${p("layers",13)} Models</span>
      <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
        data-rag-action="refresh-models"
        ${t?"disabled":""}>
        ${p("refresh",12)}<span>${t?"\u6AA2\u67E5\u4E2D\u2026":"\u91CD\u65B0\u6AA2\u67E5"}</span>
      </button>
    </div>
    <table class="rag-model-table">
      <thead><tr><th>\u6A21\u578B</th><th>\u4F7F\u7528\u4E2D</th><th>Fallback</th></tr></thead>
      <tbody>${i}</tbody>
    </table>
  </div>`}function jn({tone:e,title:t,text:s,modelSummary:a=[],refreshing:n=!1,expanded:i=!1}){let o=e==="ok"?"is-ok":e==="warn"?"is-warn":"is-info",l=e==="ok"?"check":e==="warn"?"alert":"info",d=e==="ok"?"badge-ok":e==="warn"?"badge-warn":"badge-info";return`<section class="rag-mode-card ${o}${i?" is-expanded":""}">
    <div class="rag-mode-head" role="button" tabindex="0" aria-expanded="${i}">
      <span class="rag-mode-icon" aria-hidden="true">${p(l,14)}</span>
      <div class="rag-mode-copy">
        <strong>${r(t)}</strong>
        <p>${r(s)}</p>
      </div>
      <span class="badge ${d}">3 \u500B\u6A21\u578B</span>
      <span class="rag-mode-chevron" aria-hidden="true">${p("chevronDown",14)}</span>
    </div>
    ${op(a,n)}
  </section>`}function gl(e,t=""){let s=Array.isArray(e.citations)?e.citations:[],a=Array.isArray(e.judgments)?e.judgments:[],n=Array.isArray(e.reference_judgments)?e.reference_judgments:[],i=Array.isArray(e.law_sources)?e.law_sources:[],o=e.retrieval||{},l=Array.isArray(e.matched_terms)?e.matched_terms:[],d=e.status||"preview",m=!!e.partial,f=!!e.streaming,y=!!e.rerank_degraded,v=!!e.show_sources||!m,u=e.answer_source==="structured",b=String(e.law_answer||"").trim(),w=e.law_framework||null,k=Array.isArray(w?.rows)?w.rows:[],A=Array.isArray(w?.sources)?w.sources:[],S=k.length>0,$=!!b&&!u&&!S,T=a.filter(ce=>ce.used_for_generation===!0).length,K=a.some(ce=>ce.used_for_generation!==void 0),G=a.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${a.length} \u7B46${K?`\uFF08${T} \u7B46\u9032\u5165 prompt\uFF09`:""}</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${a.map((ce,ve)=>Xu(ce,ve)).join("")}</div>`:"",fe=o.judgment_limit_applied&&n.length?`<div class="reference-judgment-note">
          <span>\u672C\u984C\u4F9D\u984C\u610F\u4E3B\u8981\u8A62\u554F\u6CD5\u898F\u898F\u5B9A\uFF0C\u6545\u5224\u6C7A\u50C5\u986F\u793A ${a.length} \u7B46\u4F5C\u70BA\u53C3\u8003\u3002\u53E6\u6709 ${n.length} \u7B46\u76F8\u95DC\u5224\u6C7A\uFF08${n.some(ce=>ce.rerank_score!==null&&ce.rerank_score!==void 0)?"\u4F9D rerank \u5206\u6578\u6392\u5E8F":"\u4F9D\u6AA2\u7D22\u5206\u6578\u6392\u5E8F"}\uFF09\uFF0C</span>
          <details class="reference-judgments">
            <summary>\u5C55\u958B\u67E5\u770B</summary>
            <div class="citation-list reference-judgment-list">${n.map(ce=>Zu(ce)).join("")}</div>
          </details>
        </div>`:"",ye=i.length&&!$?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${i.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${i.map((ce,ve)=>tp(ce,ve)).join("")}</div>`:"",ie=!a.length&&s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${s.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${s.map((ce,ve)=>ep(ce,ve)).join("")}</div>`:"",L=v?G+fe+ye+ie:"";!L&&!m&&!$&&!S&&(L=`<div class="answer-divider"></div>
      ${yt({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:d==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let q=np(l,i),j=e.test_run,V=String(e.llm_model||j?.primary_model||"").trim(),de=String(e.embedding_model||"").trim(),z=[V?`LLM\uFF1A${V}`:"",de?`Embedding\uFF1A${de}`:""].filter(Boolean).join(" \xB7 "),Z=f||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",qe=S?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${r(w.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${k.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${k.map(ce=>`<tr>
                    <td>${r(ce.law_name||"\u2014")}</td>
                    <td class="cell-number">${r(ce.article_no||"\u2014")}</td>
                    <td>${r(ce.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${A.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${A.map(ce=>{let ve=String(ce?.law_name||ce||"").trim(),je=ce&&ce.index!==null&&ce.index!==void 0?` [${r(ce.index)}]`:"";return Tn(ve,{label:`${ve}${je}`})}).join("")}
              </div>`:""}
      </div>`:"",F=e.answer_source==="llm"&&V?`<span class="answer-model" title="${r(z)}">${p("brain",11)}${r(V)}</span>`:u?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${p("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",ke=f?`${V||"LLM"} \xB7 \u751F\u6210\u4E2D`:F?V||"structured":"retrieval",ne=j?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${at(j.status)}
          <span class="mono">${r(j.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(j.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(j.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${r(j.primary_model||"\u2014")}</span>
          <span>${Number(j.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",Se=e.pipeline_flow&&typeof e.pipeline_flow=="object"?e.pipeline_flow:null,Pe=!m&&Se?qn(Se,{serverDurationMs:Number(e.duration_ms)||0,embedded:!0}):"",Ze=String(e.answer||"").trim()||(f?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":m?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),he=f?" data-partial-answer":"",oe=f?" is-streaming":"";return`${qe}
      ${$?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${m&&!v?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${i.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${ap(i,b)}</div>
            </div>`:""}
      <div class="answer-block">
        ${$||S?`<div class="answer-block-head">
                <span>${r(Z)}</span>
                <span>${r(ke)}</span>
              </div>`:""}
        <p class="answer-text${oe}"${he}>${r(Ze)}</p>
      </div>
      ${t}
      ${y?'<div class="answer-notice" data-rerank-degraded="true">\u6392\u5E8F\u7CBE\u7C21\u6A21\u5F0F\uFF1A\u672C\u6B21\u90E8\u5206 rerank \u903E\u6642\u6216\u964D\u7D1A\uFF0C\u4F86\u6E90\u53EF\u80FD\u4EE5\u5411\u91CF\u9806\u5E8F\u986F\u793A\u3002</div>':""}
      ${e.notice?`<div class="answer-notice">${r(e.notice)}</div>`:""}
      ${ne}
      ${q}
      ${L}
      ${Pe}`}function ol(e,t,s=""){let a=t.status||"preview",n=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),d=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),m=t.answer_source==="structured",f=t.answer_source==="llm"&&o?`<span class="answer-model" title="${r(d)}">${p("brain",11)}${r(o)}</span>`:m?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${p("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${p("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${at(a,n)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${f}
      </div>
      ${s}
    </div>
    <div class="answer-body">${gl(t,ul(e))}</div>`}function lp(e,t="",s=""){return`<div class="answer-head">
      <div class="answer-head-left">${p("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${Ge({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      ${s?ul(s):""}
    </div>`}function cp(e){let t=Array.isArray(e.turns)?e.turns:[],s=t.length?t[t.length-1].payload||{}:e.payload||{},a=Array.isArray(s.citations)?s.citations.length:0,n=Array.isArray(s.judgments)?s.judgments.length:0,i=Array.isArray(s.law_sources)?s.law_sources.length:0;return a+n+i}function dp(e,t,s,a=null){let n=e.id??s,i=cp(e),o=t.get(String(e.project_id||"")),l=Array.isArray(e.turns)?e.turns:[],d=e.updated_at||e.created_at,m=a!=null&&String(a)===String(n);return`<div class="rag-history-item${e.pinned?" is-pinned":""}${m?" is-active":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${r(String(n))}">
      <span class="history-question">${r(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${r(fa(d))}</span>
        ${o?`<span>\xB7 ${r(o.name)}</span>`:""}
        <span>\xB7 ${i?`${i} \u7B46\u4F86\u6E90`:"\u7121\u5F15\u7528"}</span>
        ${l.length>1?`<span>\xB7 ${l.length} \u8F2A</span>`:""}
      </span>
    </button>
    <div class="rag-history-actions">
      <button class="rag-history-pin${e.pinned?" is-pinned":""}" type="button"
        data-rag-action="toggle-pin" data-history-id="${r(String(n))}"
        data-tooltip="${e.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}"
        aria-label="${e.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078\u6B64\u9805\u76EE"}"
        aria-pressed="${e.pinned?"true":"false"}">${p("pin",14)}</button>
      <button class="rag-history-more" type="button"
        data-rag-action="open-history-menu" data-history-id="${r(String(n))}"
        title="\u66F4\u591A\u64CD\u4F5C" aria-label="\u66F4\u591A\u64CD\u4F5C" aria-haspopup="menu" aria-expanded="false">${p("more",14)}</button>
    </div>
  </div>`}function ll(e,t,s){let a=new Map;for(let i of t){let o=String(i.project_id||"");o&&a.set(o,(a.get(o)||0)+1)}let n=[`<button class="rag-project${s?"":" is-active"}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${s?"false":"true"}">
      <span class="rag-project-name">${p("grid",13)}<span>\u5168\u90E8</span></span>
      <span class="rag-project-count">${t.length}</span>
    </button>`];for(let i of e){let o=String(i.id),l=a.get(o)||0;n.push(`<button class="rag-project${s===o?" is-active":""}" type="button" data-rag-action="select-project" data-project-id="${r(o)}" aria-pressed="${s===o?"true":"false"}">
      <span class="rag-project-name">${p("folder",13)}<span>${r(i.name)}</span></span>
      <span class="rag-project-count">${l}</span>
    </button>`)}return e.length||n.push('<div class="rag-library-empty">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\u3002</div>'),n.push(`<div class="rag-project-add-wrap">
    <button class="rag-project-add" type="button" data-rag-action="show-project-form">${p("plus",13)}<span>\u5EFA\u7ACB\u5C08\u6848</span></button>
    <form class="rag-project-form" data-rag-form="project" hidden>
      <input class="input" type="text" name="project_name" maxlength="60" placeholder="\u5C08\u6848\u540D\u7A31" aria-label="\u5C08\u6848\u540D\u7A31" autocomplete="off" />
      <div class="rag-project-form-actions">
        <button class="btn btn-primary btn-sm" type="submit">\u5EFA\u7ACB</button>
        <button class="btn btn-ghost btn-sm" type="button" data-rag-action="cancel-project">\u53D6\u6D88</button>
      </div>
    </form>
  </div>`),n.join("")}async function up(e){let t=zu();t&&!t.token&&Kr();let s=new WeakMap,a=!1,n=[],i=!1,o=[],l=!1,d="",m=8,f="",y=0,v=null,u=[],b=!1,w=!1,k={embedding:[],llm:[]},A=null,S=null,$=!1,T=!1;e.innerHTML=`<section class="page rag-page">
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
            \u6B77\u53F2\u6E05\u55AE\u53EA\u5B58\u5728\u6B64\u700F\u89BD\u5668\uFF1B\u9001\u51FA\u554F\u984C\u6642\u6703\u50B3\u9001\u5230\u4F3A\u670D\u5668\u7522\u751F\u7B54\u6848\uFF0C\u4F3A\u670D\u5668\u6703\u4FDD\u7559\u63D0\u554F\u8207\u56DE\u7B54\u6587\u5B57 90 \u5929\u7528\u65BC\u6548\u80FD\u8207\u54C1\u8CEA\u5206\u6790\u3002
          </div>
        </section>
      </aside>
      <div class="rag-workspace">
        <div class="rag-workspace-toolbar">
          <a class="rag-friend-link" href="https://judgment.ragdemo.win" target="_blank" rel="noopener noreferrer"
            data-workspace-action="friend-share" aria-haspopup="menu" aria-expanded="false" aria-controls="rag-friend-menu">${p("gift",14)}<span>\u5206\u4EAB\u7D66\u670B\u53CB</span></a>
          <button class="rag-workspace-icon" type="button" data-workspace-action="menu"
            aria-haspopup="menu" aria-expanded="false" aria-controls="rag-workspace-menu"
            title="\u66F4\u591A\u5C0D\u8A71\u64CD\u4F5C" aria-label="\u66F4\u591A\u5C0D\u8A71\u64CD\u4F5C">${p("more",16)}</button>
          <button class="rag-workspace-icon" type="button" data-workspace-action="share"
            title="\u5EFA\u7ACB\u516C\u958B\u9023\u7D50" aria-label="\u5EFA\u7ACB\u516C\u958B\u9023\u7D50">${p("share",16)}</button>
          <div class="rag-history-menu rag-workspace-menu" id="rag-workspace-menu" role="menu" hidden></div>
          <div class="rag-history-menu rag-workspace-menu rag-friend-menu" id="rag-friend-menu" role="menu" hidden></div>
        </div>
        <header class="rag-hero rag-hero-compact">
      <div id="rag-mode-notice">${Ge({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
      <div id="rag-test-mode"></div>
      <form class="ask-card" id="rag-form" autocomplete="off">
        <label class="sr-only" for="rag-question">\u8F38\u5165\u6CD5\u5F8B\u554F\u984C</label>
        <textarea class="ask-input" id="rag-question" name="question" rows="3"
          maxlength="500" placeholder="\u4F8B\u5982\uFF1A\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F"
          aria-describedby="rag-input-help"></textarea>
        <p class="ask-privacy-note">\u8ACB\u52FF\u8F38\u5165\u500B\u4EBA\u8CC7\u6599\uFF1B\u63D0\u554F\u8207\u56DE\u7B54\u6587\u5B57\u6703\u4FDD\u7559 90 \u5929\u7528\u65BC\u6548\u80FD\u8207\u54C1\u8CEA\u5206\u6790\u3002</p>
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
        ${Bu.map(g=>`<button class="example-chip" type="button" data-question="${r(g)}">${r(g)}</button>`).join("")}
      </div>
    </header>

    <section class="rag-conversation" id="rag-conversation" aria-live="polite">
      <div class="rag-turns" id="rag-turns">
        ${Vr()}
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
  </section>`;let K=e.querySelector("#rag-form"),G=e.querySelector("#rag-question"),fe=e.querySelector("#rag-submit"),ye=e.querySelector(".rag-page");ye.classList.toggle("is-shared-view",!!t);let ie=e.querySelector(".rag-workspace-toolbar"),L=e.querySelector("#rag-workspace-menu"),q=e.querySelector('[data-workspace-action="menu"]'),j=e.querySelector("#rag-friend-menu"),V=e.querySelector('[data-workspace-action="friend-share"]'),de=e.querySelector("#rag-turns"),z=e.querySelector("#rag-followup-form"),Z=e.querySelector("#rag-followup-question"),qe=e.querySelector("#rag-followup-submit"),F=e.querySelector("#rag-history"),ke=e.querySelector("#rag-storage-note"),ne=e.querySelector("#rag-clear-history"),Se=e.querySelector(".rag-library"),Pe=e.querySelector("#rag-pinned-body"),Le=e.querySelector("#rag-projects-body"),Ze=e.querySelector("#rag-pinned-count"),he=e.querySelector("#rag-projects-count"),oe=e.querySelector("#rag-recent-count"),ce=e.querySelector("#rag-library-context"),ve=e.querySelector("#rag-test-mode"),je=e.querySelector("#rag-test-flow"),Te=e.querySelector("#rag-history-menu"),C=e.querySelector("#rag-judgment-dialog"),D=e.querySelector("#rag-law-dialog"),W=e.querySelector("#rag-mode-notice"),I=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};C?.addEventListener("close",I),D?.addEventListener("close",I);let H=null,J=null,we,Oe=null,Ve=null,ct=()=>{G.style.height="auto",G.style.height=`${Math.min(G.scrollHeight,220)}px`},nt=()=>{Z.style.height="auto",Z.style.height=`${Math.min(Z.scrollHeight,160)}px`},tt=g=>{b=!!g,ye.classList.toggle("has-conversation",b)},et=()=>{b&&(z.hidden=!1,nt())},pe=()=>{z.hidden=!0},ze=()=>{Te.hidden&&!Ve||(Te.hidden=!0,Te.innerHTML="",Ve&&Ve.setAttribute("aria-expanded","false"),Oe=null,Ve=null)},Ke=(g,M)=>{let E=de.querySelector(".rag-empty-answer");E&&E.remove(),de.insertAdjacentHTML("beforeend",tl(g,M,{complete:!1}));let U=de.lastElementChild,_e=U?.querySelector("[data-rag-answer]");return window.requestAnimationFrame(()=>{U?.scrollIntoView({behavior:"smooth",block:"start"})}),{turnElement:U,answerElement:_e}},ut=()=>{de.innerHTML=u.length?u.map(M=>tl(M.question,ol(M.question,M.payload||{},""))).join(""):Vr(),Array.from(de.querySelectorAll(".rag-turn")).forEach((M,E)=>{let U=u[E]?.payload;U&&s.set(M,U)})},vt=async g=>{try{let M=await Q.ragShareGet(g);if(a)return!1;let E=(Array.isArray(M?.turns)?M.turns:[]).map(U=>({question:String(U?.question||"").trim().slice(0,500),asked_at:String(U?.asked_at||""),payload:U?.payload&&typeof U.payload=="object"?U.payload:{}})).filter(U=>U.question);if(!E.length)throw new Error("\u5206\u4EAB\u5167\u5BB9\u662F\u7A7A\u7684\u3002");return v=null,u=E,f=E[E.length-1]?.question||"",tt(!0),ut(),et(),De(),Re(fe,!1),Re(qe,!1),Kr({keepToken:!0,token:g}),window.scrollTo({top:0,behavior:"auto"}),R("\u5DF2\u8F09\u5165\u5206\u4EAB\u7684\u5C0D\u8A71\u3002","ok",3200),!0}catch{return Kr(),a||R("\u5206\u4EAB\u9023\u7D50\u5DF2\u5931\u6548\u6216\u7121\u6CD5\u8F09\u5165\u3002","warn",5200),!1}},te=(g,M)=>{let E=Array.from(de.querySelectorAll(".rag-turn")),U=E.indexOf(g),_e=U>=0?U+1:E.length,Me=[];for(let He=0;He<_e;He+=1){let Fe=E[He],st=u[He],it=String(st?.question||Fe?.querySelector(".rag-user-bubble")?.textContent||"").trim();if(!it)continue;let gt=st?.payload||s.get(Fe)||(He===U?{status:"operational",answer:Yr(Fe),answer_source:"shared"}:{});Me.push({question:it,asked_at:st?.asked_at||"",payload:gt})}return!Me.length&&M&&Me.push({question:M,asked_at:"",payload:{status:"operational",answer:Yr(g),answer_source:"shared"}}),Me},xe=g=>{let M=Array.isArray(g.turns)?g.turns:[];return M.length?(St(),y+=1,ns(),Ut(null),v=g.id??null,u=M.map(E=>({...E})),f=u[u.length-1]?.question||"",tt(!0),ut(),et(),De(),Re(fe,!1),Re(qe,!1),window.setTimeout(()=>{z.scrollIntoView({behavior:"smooth",block:"end"})},50),!0):!1},De=()=>{if(a)return;if(ze(),!i){F.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',Pe.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',Ze.textContent="0",oe.textContent="0",l&&(Le.innerHTML=ll(o,[],d));return}let g=o.find(Fe=>String(Fe.id)===d)||null;d&&!g&&(d="");let M=new Map(o.map(Fe=>[String(Fe.id),Fe])),E=n.filter(Fe=>!!Fe.pinned),U=n.filter(Fe=>!Fe.pinned),_e=d?U.filter(Fe=>String(Fe.project_id||"")===d):U,Me=_e.slice(0,m),He=(Fe,st)=>dp(Fe,M,st,v);Pe.innerHTML=E.length?E.map(He).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',Le.innerHTML=ll(o,n,d),F.innerHTML=Me.length?Me.map(He).join(""):`<div class="rag-library-empty">${d?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u672A\u91D8\u9078\u7684\u9805\u76EE\u3002":E.length?"\u6700\u8FD1\u7684\u9805\u76EE\u90FD\u5DF2\u91D8\u9078\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,_e.length>m&&F.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${c(_e.length-m)} \u7B46</button>`),Ze.textContent=String(E.length),he.textContent=String(o.length),oe.textContent=String(_e.length),g?(ce.hidden=!1,ce.innerHTML=`<span>${p("folder",12)}<strong>${r(g.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${p("x",12)}</button>`):(ce.hidden=!0,ce.innerHTML="")},Qe=async()=>{try{let g=await qs("rag.projects",[]);o=Array.isArray(g)?g.map(M=>({id:String(M?.id||""),name:String(M?.name||"").trim()})).filter(M=>M.id&&M.name):[]}catch{o=[]}l=!0,a||De()},Et=g=>{d=String(g||""),m=8,De()},ht=()=>{let g=Le.querySelector('[data-rag-form="project"]');g&&(g.hidden=!1,g.querySelector("input")?.focus())},x=()=>{let g=Le.querySelector('[data-rag-form="project"]');g&&(g.hidden=!0,g.reset())},N=async g=>{let M=g.elements.project_name,E=String(M?.value||"").trim();if(!E){R("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),M?.focus();return}if(o.some(_e=>_e.name.toLowerCase()===E.toLowerCase())){R("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),M?.focus();return}let U=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;o=[...o,{id:U,name:E.slice(0,60),created_at:new Date().toISOString()}],d=U,m=8,await xa("rag.projects",o),De(),R(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${E}\u300D\u3002`,"ok")},P=async g=>{let M=n.find(_e=>String(_e.id)===String(g));if(!M)return;let E=!M.pinned;if(!await Sa(M.id,{pinned:E})){R("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}M.pinned=E,De(),R(E?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},O=()=>{St(),y+=1,ns(),Ut(null),f="",v=null,u=[],tt(!1),pe(),de.innerHTML=Vr(),G.value="",ct(),Z.value="",nt(),Re(fe,!1),Re(qe,!1),De(),C?.open&&C.close(),D?.open&&D.close(),G.focus(),window.scrollTo({top:0,behavior:"smooth"})},Y=g=>{if(!g||Te.hidden)return;let M=g.getBoundingClientRect(),E=Te.getBoundingClientRect(),U=6,_e=M.bottom+U;_e+E.height>window.innerHeight-8&&(_e=Math.max(8,M.top-E.height-U));let Me=M.right-E.width;Me=Math.max(8,Math.min(Me,window.innerWidth-E.width-8)),Te.style.left=`${Math.round(Me)}px`,Te.style.top=`${Math.round(_e)}px`},se=g=>{Te.innerHTML=`
      <button type="button" role="menuitem" data-menu-action="rename">${p("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${p("pin",13)}<span>${g.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${p("link",13)}<span>\u5EFA\u7ACB\u516C\u958B\u9023\u7D50</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${p("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${p("trash",13)}<span>\u522A\u9664</span></button>`},me=g=>{let M=String(g.project_id||""),E=[{id:"",name:"\u672A\u5206\u985E"},...o.map(U=>({id:String(U.id),name:U.name}))];Te.innerHTML=`
      <div class="rag-history-menu-head">${p("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${E.map(U=>`<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${r(U.id)}">
            <span class="rag-history-menu-check">${M===U.id?p("check",12):""}</span>
            <span>${r(U.name)}</span>
          </button>`).join("")}
      ${o.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${p("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},Ue=(g,M)=>{let E=n.find(U=>String(U.id)===String(M));E&&(ze(),Oe=String(E.id),Ve=g,se(E),Te.hidden=!1,g.setAttribute("aria-expanded","true"),Y(g))},Be=async g=>{let M=window.prompt("\u91CD\u65B0\u547D\u540D\u5C0D\u8A71",g.title||"");if(M===null)return;let E=M.trim();if(!E){R("\u540D\u7A31\u4E0D\u80FD\u7A7A\u767D\u3002","warn");return}if(E===g.title)return;if(!await Sa(g.id,{title:E})){R("\u91CD\u65B0\u547D\u540D\u5931\u6557\u3002","danger");return}g.title=E,De(),R("\u5C0D\u8A71\u5DF2\u91CD\u65B0\u547D\u540D\u3002","ok")},Ie=async g=>{let M=(Array.isArray(g.turns)?g.turns:[]).map(E=>({question:String(E?.question||"").trim(),asked_at:String(E?.asked_at||""),payload:E?.payload&&typeof E.payload=="object"?E.payload:{}}));M.length||M.push({question:g.title||"\u672A\u547D\u540D\u5C0D\u8A71",asked_at:"",payload:{}}),await Xr(M,g.title||"Judgment RAG \u5C0D\u8A71")},Ye=async g=>{if(!window.confirm(`\u522A\u9664\u5C0D\u8A71\u300C${g.title||"\u672A\u547D\u540D\u5C0D\u8A71"}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002`))return;if(!await oo(g.id)){R("\u522A\u9664\u5931\u6557\u3002","danger");return}let E=v!==null&&String(v)===String(g.id);n=n.filter(U=>String(U.id)!==String(g.id)),E?O():De(),R("\u5C0D\u8A71\u5DF2\u522A\u9664\u3002","ok")},rt=async(g,M)=>{if(!await Sa(g.id,{project_id:M})){R("\u79FB\u81F3\u5C08\u6848\u5931\u6557\u3002","danger");return}g.project_id=M;let U=o.find(_e=>String(_e.id)===String(M));De(),R(U?`\u5DF2\u79FB\u81F3\u5C08\u6848\u300C${U.name}\u300D\u3002`:"\u5DF2\u79FB\u51FA\u5C08\u6848\u3002","ok")},lt=()=>n.find(g=>v!==null&&String(g.id)===String(v))||null,St=()=>{L&&(L.hidden=!0,L.innerHTML="",q?.setAttribute("aria-expanded","false"))},ds=()=>{j&&(j.hidden=!0,j.innerHTML="",V?.setAttribute("aria-expanded","false"))},Hn=()=>{ze(),St(),j.innerHTML=`
      <div class="rag-history-menu-head">${p("gift",13)}<span>\u5206\u4EAB\u7D66\u670B\u53CB</span></div>
      <div class="rag-share-link-url" title="${r(Ln)}">${r(Ln)}</div>
      <div class="rag-friend-menu-actions">
        <button type="button" role="menuitem" data-friend-menu-action="copy">${p("copy",13)}<span>\u8907\u88FD\u9023\u7D50</span></button>
        <button type="button" role="menuitem" data-friend-menu-action="open">${p("external",13)}<span>\u958B\u555F\u9023\u7D50</span></button>
      </div>`,j.hidden=!1,V?.setAttribute("aria-expanded","true")},ca=()=>{let g=lt(),M=g?"":" disabled";L.innerHTML=`
      <button type="button" role="menuitem" data-workspace-menu-action="rename"${M}>${p("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-workspace-menu-action="pin"${M}>${p("pin",13)}<span>${g?.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078\u5C0D\u8A71"}</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-workspace-menu-action="delete"${M}>${p("trash",13)}<span>\u522A\u9664</span></button>
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-workspace-menu-action="move"${M}>${p("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      ${g?"":'<div class="rag-history-menu-note">\u76EE\u524D\u6C92\u6709\u53EF\u7BA1\u7406\u7684\u5C0D\u8A71\u3002</div>'}`},zn=g=>{let M=String(g.project_id||""),E=[{id:"",name:"\u672A\u5206\u985E"},...o.map(U=>({id:String(U.id),name:U.name}))];L.innerHTML=`
      <div class="rag-history-menu-head">${p("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${E.map(U=>`<button type="button" role="menuitem"
            data-workspace-menu-action="assign-project" data-project-id="${r(U.id)}">
            <span class="rag-history-menu-check">${M===U.id?p("check",12):""}</span>
            <span>${r(U.name)}</span>
          </button>`).join("")}
      ${o.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-workspace-menu-action="back">${p("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},Pa=()=>{ze(),ds(),ca(),L.hidden=!1,q?.setAttribute("aria-expanded","true")},da=async()=>{let g=lt(),M=u.map(E=>({question:E.question,asked_at:E.asked_at||"",payload:E.payload||{}}));if(!M.length&&Array.isArray(g?.turns)&&(M=g.turns.map(E=>({...E}))),!M.length){R("\u76EE\u524D\u6C92\u6709\u53EF\u5EFA\u7ACB\u516C\u958B\u9023\u7D50\u7684\u5C0D\u8A71\u3002","warn");return}await Xr(M,g?.title||"Judgment RAG \u5C0D\u8A71")},js=async g=>{let M=g.target.closest("[data-menu-action]");if(!M)return;let E=n.find(_e=>String(_e.id)===Oe);if(!E){ze();return}let U=M.dataset.menuAction;U==="rename"?(ze(),await Be(E)):U==="toggle-pin"?(ze(),await P(E.id)):U==="share"?(ze(),await Ie(E)):U==="move"?(me(E),Y(Ve)):U==="assign-project"?(ze(),await rt(E,M.dataset.projectId||"")):U==="back"?(se(E),Y(Ve)):U==="delete"&&(ze(),await Ye(E))},xt=g=>{let M=typeof g.composedPath=="function"?g.composedPath():[];Te.hidden||!(M.includes(Te)||Te.contains(g.target))&&!g.target.closest('[data-rag-action="open-history-menu"]')&&ze(),L.hidden||!(M.includes(L)||L.contains(g.target))&&!g.target.closest('[data-workspace-action="menu"]')&&St(),j.hidden||!(M.includes(j)||j.contains(g.target))&&!g.target.closest('[data-workspace-action="friend-share"]')&&ds()},Gs=g=>{g.key==="Escape"&&(ze(),St(),ds())},Ia=g=>{g.target instanceof Node&&Te.contains(g.target)||(ze(),L.hidden||St(),j.hidden||ds())},Qs=async()=>{try{if(n=await gn({limit:120}),a)return;i=!0,De(),ke.textContent=_a()==="indexeddb"?"\u6B77\u53F2\u6E05\u55AE\u53EA\u5B58\u5728\u6B64\u700F\u89BD\u5668\uFF1B\u9001\u51FA\u554F\u984C\u6642\u6703\u50B3\u9001\u5230\u4F3A\u670D\u5668\u7522\u751F\u7B54\u6848\uFF0C\u4F3A\u670D\u5668\u6703\u4FDD\u7559\u63D0\u554F\u8207\u56DE\u7B54\u6587\u5B57 90 \u5929\u7528\u65BC\u6548\u80FD\u8207\u54C1\u8CEA\u5206\u6790\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(a)return;n=[],i=!0,De(),F.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},ua=async(g,M,E,U)=>{let _e=u,Me=v;_e.push({question:g,asked_at:new Date().toISOString(),payload:sl(M)});let He=Array.isArray(M.citations)?M.citations:[],Fe=Array.isArray(M.judgments)?M.judgments:[],st={question:g,status:M.status,citations:He.map(Nt=>Nt.law_name),judgments:Fe.map(Nt=>Nt.jid)},it=`${M.status||"preview"} \xB7 ${_e.length} \u8F2A`,gt=new Date().toISOString(),Bt=Nt=>{U===y&&(v=Nt)};if(Me){if(!await Sa(Me,{turns:_e,detail:it,payload:st,updated_at:gt})){let ys=await ka({kind:"rag",title:_e[0]?.question||g,detail:it,project_id:E,turns:_e,payload:st,updated_at:gt});Bt(ys)}}else{let Nt=await ka({kind:"rag",title:_e[0]?.question||g,detail:it,project_id:E,turns:_e,payload:st,updated_at:gt});Bt(Nt)}await Qs()},At=()=>{let g=e.querySelector("#rag-mode-notice");if(!g)return;if(Kt()){g.innerHTML=Ge({tone:"info",title:"\u5C55\u793A\u6A21\u5F0F",text:"\u53EF\u76F4\u63A5\u8F38\u5165\u6CD5\u5F8B\u554F\u984C\uFF1B\u56DE\u7B54\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u6CD5\u898F\u8207\u5224\u6C7A\u5F15\u7528\u3002"});return}let M=Array.isArray(A?.model_summary)?A.model_summary:[];if(!A){if(!S)return;g.innerHTML=jn({tone:"warn",title:"\u7121\u6CD5\u53D6\u5F97 RAG \u670D\u52D9\u72C0\u614B",text:S.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u524D\u5F80\u7CFB\u7D71\u72C0\u614B\u9801\u67E5\u770B\u3002",modelSummary:M,refreshing:$,expanded:T});return}let E=A.data||{},U=(A.services||[]).find(He=>He.id==="rag"),_e=Number(E.judgment_indexed_count||0),Me=Number(E.judgment_count||0);U?.status==="operational"?g.innerHTML=jn({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${c(_e)} / ${c(Me)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`,modelSummary:M,refreshing:$,expanded:T}):U?.status==="degraded"?g.innerHTML=jn({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:U.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002",modelSummary:M,refreshing:$,expanded:T}):g.innerHTML=jn({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:U?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002",modelSummary:M,refreshing:$,expanded:T})},Un=async()=>{if(Kt()){A=null,S=null,At();return}try{let g=await Q.status();if(a)return;A=g,S=null}catch(g){if(a)return;A=null,S=g}At()},Gn=async()=>{if(!$){$=!0,At();try{let g=await Q.status();if(a)return;A=g,S=null,R("\u5DF2\u66F4\u65B0\u6A21\u578B\u72C0\u614B\u3002","ok",2500)}catch(g){R(g.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u3002","danger",6e3)}finally{$=!1,a||At()}}},Js=()=>{if(!ve)return;if(!w){ve.innerHTML="";return}let g=Array.isArray(k.embedding)?k.embedding.length:0,M=Array.isArray(k.llm)?k.llm.length:0;ve.innerHTML=Ge({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${g} \u500B embedding \u8207 ${M} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},Qn=async()=>{if(Kt()){w=!1,Js();return}try{let g=await Q.testMode();if(a)return;w=!!g.enabled,k=g.models||{embedding:[],llm:[]},Js()}catch{if(a)return;w=!1,Js()}},pa=g=>{w=!!g.detail?.enabled,k=g.detail?.models||{embedding:[],llm:[]},Js()};window.addEventListener("judgment:test-mode",pa);let Ut=g=>{if(!je)return;J=g||null;let M=JSON.stringify(g?{run_id:g.run_id,status:g.status,progress:g.progress,total_ms:g.total_ms,stage:g.stage,answer:g.answer||"",steps:(g.steps||[]).map(E=>`${E.stage}:${E.model}:${E.status}:${E.progress}:${E.duration_ms}`)}:null);M!==we&&(we=M,je.innerHTML=g?ia(g,[],"",{showHistory:!1}):"")},ns=()=>{H&&(H(),H=null)},ma=async(g=null)=>{if(!a)try{let M=g||await Q.testRunCurrent();if(a)return;let E=M.run;E&&E.status==="running"&&Ut(E)}catch{}},ga=()=>{a||H||(ma(),H=Mt("test-runs",(g,M)=>ma(M?.snapshot||null)))},Da=async g=>{if(!g){Ut(null);return}try{let M=await Q.testRun(g);if(a)return;Ut(M.run||null)}catch{a||R("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},Jn=async()=>{if(w)try{let g=await Q.testRunCurrent();if(a)return;g.run?.status==="running"&&(Ut(g.run),ga())}catch{}},h=0,_=(g,M)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${r(g)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${p("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${M}</div>`,B=g=>{let M=(Array.isArray(g.citations)?g.citations:[]).map(He=>pl(He)).filter(Boolean).join(""),E=M||(Array.isArray(g.matched_laws)?g.matched_laws:[]).map(He=>Tn(He)).join(""),U=[g.court,g.jdate,g.title?`\u6848\u7531\uFF1A${g.title}`:"",g.full_text_length?`${c(g.full_text_length)} \u5B57`:"",g.citation_count?`\u5F15\u7528 ${c(g.citation_count)} \u7B46`:""].filter(Boolean).map(He=>`<span>${r(He)}</span>`).join(""),_e=g.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${r(String(g.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",Me=g.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(g.pdf_url)}" target="_blank" rel="noopener noreferrer">${p("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return _(g.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${r(g.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${U}
      </div>
      ${M?'<div class="citation-meta" style="margin-top:8px"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':""}
      ${E?`<div class="chips" style="margin:8px 0 10px">${E}</div>`:""}
      <div class="judgment-dialog-source">${_e}</div>
      <pre class="judgment-dialog-text">${r(g.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${Me}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},le=async g=>{if(!C||!g)return;let M=++h;C.open||C.showModal(),I(),C.innerHTML=_("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${r(g)}\u2026</span>
      </div>`);try{let E=await Q.judgmentDetail(g,"parquet");if(a||M!==h)return;C.innerHTML=B(E)}catch(E){if(a||M!==h)return;C.innerHTML=_("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(E.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},re=0,X=(g,M)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${r(g)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${p("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${M}</div>`,Ae=(g,M="")=>{let E=String(g.selected_article_no||M||"").trim(),U=!!E,_e=Array.isArray(g.articles)?g.articles:[],Me=_e.map(dt=>{let Ee=String(dt.article_content||"").trim();return Ee?dt.article_type==="C"?`<div class="law-chapter">${r(Ee)}</div>`:`<article class="law-article" data-article-no="${r(rl(dt.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${r(dt.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${r(Ee)}</div>
        </article>`:""}).join(""),He=(Array.isArray(g.warnings)?g.warnings:[]).map(dt=>r(dt)).join("<br />"),Fe=g.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",st=g.meta?.articles_source,it=st==="parquet"?"Parquet \u689D\u6587":st==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",gt=g.meta?.snapshot||"",Bt=[g.law_level,g.law_category,g.article_count?`${c(g.article_count)} \u689D`:"",g.law_modified_date?`\u7570\u52D5 ${Jt(g.law_modified_date)}`:""].filter(Boolean).map(dt=>`<span>${r(dt)}</span>`).join(""),Nt=g.law_url?`<a class="btn btn-secondary btn-sm" href="${r(g.law_url)}" target="_blank" rel="noopener noreferrer">${p("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",ys=!U&&g.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${r(g.law_histories)}</div>
        </details>`:"",Ws=U?`<span class="badge badge-mono">${r(E)}</span>`:"",Vs=!U&&_e.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",Xe=U?`${g.law_name||g.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${E}`:g.law_name||g.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return X(Xe,`<div class="judgment-dialog-meta">
        <span class="badge ${g.source_type==="order"?"badge-warn":"badge-info"}">${r(Fe)}</span>
        ${Ws}
        ${Bt}
      </div>
      <div class="judgment-dialog-source">${r([it,gt].filter(Boolean).join(" \xB7 "))}</div>
      ${He?`<div class="law-dialog-warning">${He}</div>`:""}
      ${ys}
      ${Vs}
      <div class="law-dialog-articles">${Me||`<div class="report-empty-inline">${U?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${Nt}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},ae=(g,M)=>{let E=g?.querySelector(`#${M}`),U=rl(E?.value||"");if(!U){R("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),E?.focus();return}let _e=[...g?.querySelectorAll("[data-article-no]")||[]].find(Me=>Me.dataset.articleNo===U);if(!_e){R(`\u627E\u4E0D\u5230\u7B2C ${U} \u689D\u3002`,"warn");return}_e.scrollIntoView({behavior:"instant",block:"center"}),_e.classList.add("is-jump-target"),window.setTimeout(()=>_e.classList.remove("is-jump-target"),2400)},ue=async(g,M="",E="")=>{if(!D||!g)return;let U=++re;D.open||D.showModal(),I(),D.innerHTML=X(E?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${r([g,E].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let _e=await Q.lawDetail(g,M,"",E);if(a||U!==re)return;D.innerHTML=Ae(_e,E)}catch(_e){if(a||U!==re)return;D.innerHTML=X("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(_e.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};D?.addEventListener("click",g=>{let M=g.target.closest('[data-action="jump-law-article"]');if(M){ae(D,M.dataset.jumpInput||"rag-law-article-jump");return}if(g.target.closest('[data-action="close-law-source"]')){D.close();return}let E=D.getBoundingClientRect();(g.clientX<E.left||g.clientX>E.right||g.clientY<E.top||g.clientY>E.bottom)&&D.close()}),D?.addEventListener("keydown",g=>{!g.target.matches(".law-jump-input")||g.key!=="Enter"||(g.preventDefault(),ae(D,g.target.id))}),C?.addEventListener("click",g=>{let M=g.target.closest('[data-action="open-law-source"]');if(M){ue(M.dataset.lawKey||"",M.dataset.sourceType||"",M.dataset.articleNo||"");return}if(g.target.closest('[data-action="close-parquet-judgment"]')){C.close();return}let E=C.getBoundingClientRect();(g.clientX<E.left||g.clientX>E.right||g.clientY<E.top||g.clientY>E.bottom)&&C.close()}),de.addEventListener("click",g=>{let M=g.target.closest(".rag-process-toggle");if(M){let U=M.closest(".rag-process"),_e=M.getAttribute("aria-expanded")==="true";Zr(U,!_e);return}let E=g.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(E){if(E.dataset.action==="open-law-source"){ue(E.dataset.lawKey||"",E.dataset.sourceType||"",E.dataset.articleNo||"");return}le(E.dataset.jid||"")}}),de.addEventListener("keydown",g=>{if(g.key!=="Enter"&&g.key!==" ")return;let M=g.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!M||M.closest("a, button"))){if(g.preventDefault(),M.dataset.action==="open-law-source"){ue(M.dataset.lawKey||"",M.dataset.sourceType||"",M.dataset.articleNo||"");return}le(M.dataset.jid||"")}});let be=async(g,{fresh:M=!1,source:E="hero"}={})=>{let U=g.trim();if(!U){R("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),(E==="followup"?Z:G).focus();return}St(),(M||!b)&&(v=null,u=[],de.innerHTML="",De());let _e=++y,Me=()=>a||_e!==y,He=d;f=U,tt(!0),pe(),E==="followup"?(Z.value="",nt()):(G.value="",ct());let{turnElement:Fe,answerElement:st}=Ke(U,Yu(U,w)),it=w?null:Ku(st);w?(Ut(null),ga()):(ns(),Ut(null)),Re(fe,!0,"\u6AA2\u7D22\u4E2D\u2026"),Re(qe,!0,"\u6AA2\u7D22\u4E2D\u2026");let gt=null,Bt="",Nt=Xe=>{if(Me()||!Xe?.partial)return;let dt=st.querySelector(".answer-body");if(!dt)return;gt=Xe,Bt=String(Xe.answer||""),dt.innerHTML=gl(Xe),it?.collapse?.();let Ee=st.querySelector(".answer-head-title");Ee&&(Ee.textContent=Xe.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},ys=Xe=>{if(Me()||!Xe||!gt?.streaming)return;Bt+=Xe;let dt=st.querySelector("[data-partial-answer]");dt&&(dt.textContent=Bt)},Ws=()=>{if(Me()||!gt?.streaming)return;Bt="";let Xe=st.querySelector("[data-partial-answer]");Xe&&(Xe.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")},Vs=Xe=>{if(Me())return;let dt=st.querySelector(".answer-body");if(!dt)return;let Ee=dt.querySelector("[data-summary-queue]");Ee||(Ee=document.createElement("div"),Ee.className="answer-notice",Ee.dataset.summaryQueue="true",dt.appendChild(Ee));let ft=Number(Xe.position||0),ot=Number(Xe.eta_s||0),Gt=Xe.lane==="summary"?"\u6458\u8981":"\u6AA2\u7D22";Ee.textContent=`${Gt}\u6392\u968A\u4E2D\uFF1A\u524D\u9762 ${ft} \u4F4D\uFF0C\u9810\u4F30\u7D04 ${Math.round(ot)} \u79D2\u3002`};try{let Xe=w?await Q.rag(U,{testMode:w}):await Q.ragStream(U,{onStep:Ee=>{Me()||it?.step(Ee)},onPartial:Nt,onQueued:Vs,onToken:ys,onTokenReset:Ws});if(Me())return;ns();let dt=it?.finish(!0)||"";if(st.innerHTML=ol(U,Xe,dt),Fe&&s.set(Fe,sl(Xe)),Fe?.classList.remove("is-pending"),Fe?.classList.add("is-complete"),Xe.pipeline_flow||Qu(Xe).then(()=>{if(Me()||!Xe.pipeline_flow)return;let Ee=st.querySelector(".answer-body");if(!Ee||Ee.querySelector(".rag-wf-card"))return;let ft=qn(Xe.pipeline_flow,{serverDurationMs:Number(Xe.duration_ms)||0,embedded:!0});ft&&Ee.insertAdjacentHTML("beforeend",ft)}),Xe.test_run?.run_id?await Da(Xe.test_run.run_id):Ut(null),await ua(U,Xe,He,_e),Me())return;et()}catch(Xe){if(Me())return;ns();let dt=it?.finish(!1)||"";st.innerHTML=lp(Xe,dt,U),Fe?.classList.remove("is-pending"),Fe?.classList.add("is-complete"),et(),R(Xe.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{Me()||(ns(),Re(fe,!1),Re(qe,!1))}};K.addEventListener("submit",g=>{g.preventDefault(),be(G.value,{fresh:!0,source:"hero"})}),z.addEventListener("submit",g=>{g.preventDefault(),be(Z.value,{fresh:!1,source:"followup"})}),G.addEventListener("input",ct),G.addEventListener("keydown",g=>{g.key==="Enter"&&!g.shiftKey&&!g.isComposing&&(g.preventDefault(),K.requestSubmit())}),Z.addEventListener("input",nt),Z.addEventListener("keydown",g=>{g.key==="Enter"&&!g.shiftKey&&!g.isComposing&&(g.preventDefault(),z.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",g=>{let M=g.target.closest("[data-question]");M&&(G.value=M.dataset.question,ct(),K.requestSubmit())}),e.addEventListener("click",async g=>{let M=g.target.closest("[data-rag-question-action]"),E=g.target.closest("[data-rag-answer-action]");if(M||E){g.preventDefault(),g.stopPropagation();let U=M?M.dataset.ragQuestionAction:E.dataset.ragAnswerAction,_e=M||E,Me=Number(g.detail||0)>0||!!window.matchMedia?.("(pointer: coarse)")?.matches,He=(it=!1)=>{(it||Me)&&document.activeElement===_e&&_e.blur()},Fe=String(_e?.dataset.question||"").trim(),st=_e?.closest(".rag-turn");if(!Fe||!st)return;if(U==="copy"){try{let it=M?Fe:Yr(st),gt=await ks(it);R(gt?M?"\u5DF2\u8907\u88FD\u554F\u984C\u3002":"\u5DF2\u8907\u88FD\u56DE\u7B54\u3002":"\u7121\u6CD5\u8907\u88FD\u3002",gt?"ok":"danger")}finally{He()}return}if(U==="share"){He(!0);try{await Xr(te(st,Fe),M?"Judgment RAG \u63D0\u554F":"Judgment RAG \u56DE\u7B54")}finally{He(!0)}return}if(U==="edit"){let it=b?Z:G;b&&et(),it.value=Fe,b?nt():ct(),it.scrollIntoView({behavior:"smooth",block:"center"}),it.focus({preventScroll:!0}),it.setSelectionRange(Fe.length,Fe.length);return}if(U==="reask"){if(fe.disabled){R("\u76EE\u524D\u4ECD\u5728\u6AA2\u7D22\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","warn");return}await be(Fe,{fresh:!1,source:"followup"})}return}g.target.closest('[data-rag-action="refresh-models"]')&&await Gn()}),Se.addEventListener("click",async g=>{let M=g.target.closest("[data-rag-toggle]");if(M){let Fe=M.closest(".rag-library-section").classList.toggle("is-collapsed");M.setAttribute("aria-expanded",String(!Fe));return}let E=g.target.closest("[data-rag-action]"),U=E?.dataset.ragAction||"";if(U==="new-chat"){O();return}if(U==="open-history-menu"){Ue(E,E.dataset.historyId);return}if(U==="toggle-pin"){await P(E.dataset.historyId);return}if(U==="select-project"){Et(E.dataset.projectId||"");return}if(U==="show-project-form"){ht();return}if(U==="cancel-project"){x();return}if(U==="more-recent"){m+=12,De();return}if(U==="clear-project"){Et("");return}let _e=g.target.closest("[data-history-open]");if(!_e)return;let Me=n.find(He=>String(He.id)===String(_e.dataset.historyId));Me&&(d=String(Me.project_id||""),De(),!xe(Me)&&(v=null,u=[],be(Me.title,{fresh:!0,source:"history"})))}),Se.addEventListener("submit",async g=>{let M=g.target.closest('[data-rag-form="project"]');M&&(g.preventDefault(),await N(M))}),W.addEventListener("click",g=>{let M=g.target.closest(".rag-mode-head");!M||g.target.closest("button, a")||(T=!T,M.closest(".rag-mode-card")?.classList.toggle("is-expanded",T),M.setAttribute("aria-expanded",String(T)))}),W.addEventListener("keydown",g=>{if(g.key!=="Enter"&&g.key!==" ")return;let M=g.target.closest(".rag-mode-head");M&&(g.preventDefault(),M.click())}),ie.addEventListener("click",async g=>{let M=g.target.closest("[data-workspace-action]");if(!M)return;let E=M.dataset.workspaceAction;if(E==="friend-share"){g.preventDefault(),j.hidden?Hn():ds();return}if(E==="menu"){L.hidden?Pa():St();return}if(E==="share"){let U=Number(g.detail||0)>0||!!window.matchMedia?.("(pointer: coarse)")?.matches;U&&M.blur();try{await da()}finally{U&&M.blur()}}}),L.addEventListener("click",async g=>{let M=g.target.closest("[data-workspace-menu-action]");if(!M)return;let E=M.dataset.workspaceMenuAction;if(E==="back"){ca();return}let U=lt();if(!U){St(),R("\u76EE\u524D\u6C92\u6709\u53EF\u7BA1\u7406\u7684\u5C0D\u8A71\u3002","warn");return}E==="rename"?(St(),await Be(U)):E==="pin"?(St(),await P(U.id)):E==="delete"?(St(),await Ye(U)):E==="move"?zn(U):E==="assign-project"&&(St(),await rt(U,M.dataset.projectId||""))}),j.addEventListener("click",async g=>{let M=g.target.closest("[data-friend-menu-action]");if(!M)return;let E=M.dataset.friendMenuAction;if(E==="copy"){let U=await ks(Ln);R(U?"\u5DF2\u8907\u88FD\u7DB2\u7AD9\u9023\u7D50\u3002":"\u7121\u6CD5\u8907\u88FD\u7DB2\u7AD9\u9023\u7D50\u3002",U?"ok":"danger")}else E==="open"&&window.open(Ln,"_blank","noopener,noreferrer");ds()}),Te.addEventListener("click",js),document.addEventListener("click",xt),document.addEventListener("keydown",Gs),window.addEventListener("scroll",Ia,{capture:!0,passive:!0}),window.addEventListener("resize",ze),ne.addEventListener("click",async()=>{if(!n.length){R("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await lo(),await Qs(),R("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),ct(),await Promise.allSettled([Un(),Qs(),Qe(),Qn()]),await Jn();let Ne=!1;if(t?.token&&(Ne=await vt(t.token)),!Ne){let g="",M="home";try{g=window.sessionStorage.getItem("judgment.pending_question")||"",window.sessionStorage.removeItem("judgment.pending_question")}catch{g=""}!g&&typeof window.__judgmentPendingQuestion=="string"&&(g=window.__judgmentPendingQuestion),delete window.__judgmentPendingQuestion,!g&&t?.question&&(g=t.question,M="share"),g=String(g||"").trim().slice(0,500),g&&G&&(G.value=g,ct(),window.setTimeout(()=>{a||be(g,{fresh:!0,source:M})},40))}return()=>{a=!0,ns(),ze(),document.removeEventListener("click",xt),document.removeEventListener("keydown",Gs),window.removeEventListener("scroll",Ia,{capture:!0}),window.removeEventListener("resize",ze),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",pa),f&&de.setAttribute("data-last-question",f)}}var mi={};us(mi,{render:()=>mm});var ni=new Set(["legal_index_versions","judgment_import","index_versions"]),fl=new Map,ri=new Set,ii=new Set;function La(e){let t=Number(e);if(!Number.isFinite(t)||t<0)return"\u2014";if(t<60)return`${Math.round(t)} \u79D2`;let s=Math.floor(t/60),a=Math.round(t%60);if(s<60)return`${s} \u5206 ${a} \u79D2`;let n=Math.floor(s/60),i=s%60;if(n<24)return`${n} \u5C0F\u6642 ${i} \u5206`;let o=Math.floor(n/24),l=n%24;return`${o} \u5929 ${l} \u5C0F\u6642`}function ai(e){return String(e||"").trim().replace(/:latest$/,"")}var pp={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},partial:{label:"\u90E8\u5206\u5B8C\u6210",tone:"warn"},update:{label:"\u66F4\u65B0",tone:"warn"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"},provided:{label:"\u5916\u90E8\u63D0\u4F9B",tone:"info"}},oi=["download","parquet","postgres","qdrant"],mp={download:"\u4E0B\u8F09",parquet:"Parquet",postgres:"PostgreSQL",qdrant:"Qdrant"},gp={judgment:{download:["download"],parquet:["raw_parquet","extract"],postgres:["postgres"],qdrant:["qdrant"]},law:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]},order:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]}},bl={complete:"\u5B8C\u6210",incomplete:"\u672A\u5B8C\u6210",pending:"\u5F85\u66F4\u65B0",processing:"\u8655\u7406\u4E2D",empty:"\u7121\u8CC7\u6599",not_applicable:"\u5DF2\u53D6\u4EE3"},hl={complete:"is-green",incomplete:"is-red",pending:"is-pending",processing:"is-gray",empty:"is-empty",not_applicable:"is-empty"};var Yt=new Map,Xt="",Bs="",vl={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},$l={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},fp={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"};var yl={law_download:"law",order_download:"order",judgment_download:"judgment"},wl={law_download:"\u6CD5\u898F\u4E0B\u8F09",order_download:"\u547D\u4EE4\u4E0B\u8F09",judgment_download:"\u5224\u6C7A\u4E0B\u8F09"},bp={law_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",order_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",judgment_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u5224\u6C7A RAR \u55CE\uFF1F\uFF08\u4E0D\u6703\u81EA\u52D5\u532F\u5165 PostgreSQL \u6216\u5EFA\u7ACB Qdrant \u7D22\u5F15\uFF09"},hp={law_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u6CD5\u898F RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",order_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u547D\u4EE4 RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",judgment_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u53EA\u4E0B\u8F09\u5224\u6C7A RAR\u3002PostgreSQL\uFF0FParquet \u532F\u5165\u8207 Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\u300C\u5224\u6C7A\u532F\u5165\u300D\u6216\u5B8C\u6574\u8CC7\u6599\u66F4\u65B0\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_import:"\u6D41\u7A0B\u7BC4\u570D\uFF1ARAR \u2192 \u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD \u2192 \u91D1\u878D\u6CD5\u898F\u7BE9\u9078 \u2192 PostgreSQL\u3002Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_parquet:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5F9E PostgreSQL \u532F\u51FA\u67E5\u8A62\u7528 Parquet \u5FEB\u7167\uFF1B\u4E0D\u5BEB\u5165 Qdrant\uFF0FIndexedDB\u3002",index_versions:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5EFA\u7ACB\u4E26\u9A57\u8B49\u65B0\u7684 Qdrant collection\uFF0C\u5B8C\u6210\u5F8C\u539F\u5B50\u5207\u63DB alias\uFF1BIndexedDB \u4E0D\u53C3\u8207\u3002"};function Ls(e){return pp[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function zt(e,t){let s=Ls(e);return`<span class="badge ${vl[s.tone]||vl.idle}"><span class="status-dot ${$l[s.tone]||$l.idle}"></span>${r(t||s.label)}</span>`}function kt(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function _l(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":c(e)}function Al(e){return e&&e.color?String(e.color):"var(--accent)"}function li(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return["skipped","pending","idle"].includes(e.status)?"\u2014":s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${Ce(s)} / ${Ce(a)}`:Ce(s):a?`${c(s)} / ${c(a)} ${t}`:`${c(s)} ${t}`}function Fs(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${r(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function vp(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},n=e.raw_backups||{},i=n.totals||{},o=e.state||{},l=e.capabilities||{},d=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",m=t.status==="operational",f=s.status==="operational",y=a.available!==!1,v=n.available!==!1,u=f?`${c(s.indexed)} / ${c(s.total)}`:zt(s.status||"unavailable"),b=f?`${kt(s.percent)} \xB7 \u5C1A\u9918 ${c(s.remaining)} \u7B46`:r(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),w=y?`${c(a.unprocessed)} / ${c(a.total)}`:zt("unavailable"),k=y?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${Ce(a.unprocessed_bytes)} \u5F85\u8655\u7406`:r(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${ls(Ep(e))}
    ${Fs("\u8655\u7406\u72C0\u614B",zt(e.status||"unknown"),`${r(d)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${Fs("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",r(w),k)}
    ${Fs("\u539F\u59CB\u8CC7\u6599\u5099\u4EFD",v?`${c(n.count)} \u6A94`:zt("unavailable"),v?`\u5171 ${c(i.row_count)} \u7B46 \xB7 ${Ce(i.compressed_bytes)}`:r(n.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB\u8CC7\u6599\u5099\u4EFD\u3002"))}
    ${Fs("PostgreSQL \u5224\u6C7A",m?c(t.judgment_count):zt("unavailable"),m?`\u6CD5\u898F ${_l(t.law_count)} \xB7 \u547D\u4EE4 ${_l(t.order_count)}`:r(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${Fs("Qdrant \u7D22\u5F15",u,b)}
    ${Fs("\u72C0\u614B\u6A94",zt(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${r($e(o.updated_at))}`:r(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${Fs("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?r(l.start_blocked_reason):`\u672A\u8655\u7406 ${c(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${c(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${c(l.external_processes)} \u500B`:""}`)}
  </div>`}function $p(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">ELAPSED COMPOSITION</div>
      <h2 class="report-section-title">\u6574\u9AD4\u8655\u7406\u6642\u9593</h2>
      <p class="processing-section-sub">\u9577\u5EA6\u4F9D\u5F8C\u7AEF\u8A18\u9304\u7684\u5BE6\u969B\u968E\u6BB5\u8017\u6642\u6BD4\u4F8B\u6392\u5217\uFF1B\u672A\u57F7\u884C\u6216\u7121\u6CD5\u53D6\u5F97\u7684\u968E\u6BB5\u4E0D\u6703\u88AB\u8A08\u5165\u3002</p>
    </div>
  </div>`;if(!t.available||!s.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section">
        <div class="processing-empty">${r(t.label||"\u5C1A\u7121\u53EF\u8A08\u7B97\u7684\u968E\u6BB5\u8017\u6642\uFF1B\u57F7\u884C\u8CC7\u6599\u66F4\u65B0\u6216\u7D22\u5F15\u5F8C\u6703\u986F\u793A\u3002")}</div>
      </div>
    </section>`;let n=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${r(o.color||"var(--accent)")}" title="${r(`${o.label} ${ge(o.duration_ms)} (${kt(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${r(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${r(o.label)}</span>
        <span class="mono">${ge(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${kt(o.percent)}</span>
        ${zt(o.status)}
      </div>`).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section">
      <div class="processing-timeline-label">
        <span>${r(t.label||"\u968E\u6BB5\u8017\u6642")}</span>
        <span class="mono">\u7E3D\u8A08 ${ge(t.total_ms)}</span>
      </div>
      <div class="processing-stack" role="img" aria-label="\u968E\u6BB5\u8017\u6642\u6BD4\u4F8B">${n}</div>
      <div class="processing-legend">${i}</div>
    </div>
  </section>`}function yp(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let n=t.map(i=>{let o=s.get(i.branch)||fp[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${r(o)}</span>
          <strong>${r(i.title||"\u8655\u7406")}</strong>
          ${zt(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${r($e(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?ge(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${r(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${n}</div></div>
  </section>`}function wp(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>Ge({tone:s.tone||"info",title:s.title,text:r(s.message||"")})).join("")}</div>`:""}function ql(e,t){if(e==="law"||e==="order")return t==="qdrant"?"legal_index_versions":`${e}_download`;if(e==="judgment"){if(t==="download")return"judgment_download";if(t==="parquet"||t==="postgres")return"judgment_import";if(t==="qdrant")return"index_versions"}return""}function ci({month:e,year:t,monthNo:s,stageOrder:a,stageLabels:n,stageStatuses:i,overall:o,active:l,processing:d=!1,workflowForStage:m,stageProgress:f=null,variant:y="legacy"}){let v=i||{},u=y==="index"||y==="import",b=String(e?.month||`${t}${String(s).padStart(2,"0")}`),w=e?.month_label||`${t}-${String(s).padStart(2,"0")}`,k=L=>u&&L==="processing"?"\u57F7\u884C\u4E2D":bl[L]||bl.empty,A=L=>{let q=v[L]||"empty";if(!(q==="processing"||L==="qdrant"&&q==="incomplete"))return null;let V;if(typeof f=="function")V=f(L,b,q);else if(y==="import"&&f&&typeof f=="object")V=f[L];else return null;let de=Number(V);return Number.isFinite(de)?Math.max(0,Math.min(100,de)):null},S=a.map(L=>{let q=v[L]||"empty",j=A(L),V=L==="qdrant"&&q==="incomplete"&&j!==null&&j>0,de=V?"\u5DF2\u8655\u7406":k(q),z=!V&&j!==null&&j>0?` ${j.toFixed(1)}%`:"";return`${n[L]||L}\uFF1A${de}${z}`}).join(" \xB7 "),$=(e?.versions||[]).map(L=>L.version_code).filter(Boolean),T=[...new Set([...e?.files||[],...e?.local_files||[],...e?.imported_files||[]])].filter(Boolean),K=$.length?` \xB7 \u7248\u672C ${$.join("\u3001")}`:T.length?` \xB7 ${T.join("\u3001")}`:"",G=e?.detail?` \xB7 ${e.detail}`:"",fe=e?`${w} \xB7 ${S}${K}${G}`:`${w} \xB7 \u7121\u8CC7\u6599`,ye=u?o==="empty"?"is-empty":"is-neutral":hl[o]||"is-empty",ie=a.map(L=>{let q=v[L]||"empty",j=q==="incomplete"||q==="pending"?m(L):"",V=j?"button":"span",de=j?` type="button" data-timeline-workflow="${r(j)}"`:"",z=A(L),Z=L==="qdrant"&&q==="incomplete"&&z!==null&&z>0,qe=q==="processing"&&z!==null?` ${z.toFixed(1)}%`:"",F=Z?"\u5DF2\u8655\u7406":k(q),ke=q==="complete"?"is-complete":q==="processing"?"is-running":Z?"is-partial":q==="incomplete"?"is-incomplete":q==="pending"?"is-pending":"is-empty",ne=u?["index-month-block","processing-month-stage",`is-${L}`,ke,j?"is-actionable":""]:["processing-month-stage",`is-${L}`,hl[q]||"is-empty",ke,j?"is-actionable":""],Pe=(q==="processing"||Z)&&z!==null?` style="--stage-progress:${z.toFixed(1)}%"`:"";return`<${V} class="${ne.filter(Boolean).join(" ")}"${de}${Pe} title="${r(`${n[L]||L}\uFF1A${F}${qe}${j?"\uFF08\u9EDE\u9078\u524D\u5F80\u8655\u7406\uFF09":""}`)}" aria-label="${r(`${w} ${n[L]||L} ${F}${qe}${j?"\uFF0C\u9EDE\u9078\u524D\u5F80\u8655\u7406":""}`)}"></${V}>`}).join("");return u?`<td class="judgment-month index-month index-month-are processing-month ${ye}${l?" is-current":""}${d&&!l?" is-processing-current":""}" data-month="${r(b)}" title="${r(fe)}" aria-label="${r(fe)}"${l?' aria-current="true"':""}>
    <span class="index-month-number">${s}</span>
    <span class="index-month-blocks">${ie}</span>
  </td>`:`<td class="judgment-month import-month processing-month${l?" is-current":""} is-${r(o)}" data-month="${r(b)}" title="${r(fe)}" aria-label="${r(fe)}"${l?' aria-current="true"':""}>
    <span class="processing-month-number">${s}</span>
    <span class="processing-month-stages">${ie}</span>
  </td>`}function _p(e,t,s,a,n){return ci({month:t,year:s,monthNo:a,stageOrder:oi,stageLabels:mp,stageStatuses:t?.stages||{},overall:t?.overall||"empty",active:!!(t?.active||t?.overall==="processing"),workflowForStage:i=>ql(e.key,i),stageProgress:n,variant:"index"})}function kp(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=Number(s?.incomplete)||0,o=Number(s?.superseded)||0,l=a>0?(n+o)/a*100:null,d=["download","prepared","indexed"],m=0,f=0;for(let v of t){let u=v?.stages||{};for(let b of d){let w=u[b];!w||w==="empty"||w==="not_applicable"||(m+=1,w==="complete"&&(f+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(n),"\u5DF2\u5B8C\u6210 D\uFF0FP\uFF0FI \u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(i+(Number(s?.processing)||0)),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u5DF2\u53D6\u4EE3\u6708\u4EFD",c(o),"\u820A\u7248\u672C\u5DF2\u88AB\u76EE\u524D\u7248\u672C\u53D6\u4EE3\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",kt(l),"\u5B8C\u6210\u6216\u5DF2\u53D6\u4EE3\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c(f)} / ${c(m)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([v,u,b])=>`<span class="index-runtime-metric" title="${r(b)}"><span>${r(v)}</span><strong>${r(u)}</strong></span>`).join("")}</div>`}function Sp(e,t,s,a){let n=Number(e?.total_months)||t.length||0,i=Number(s?.complete)||0,o=Number(s?.incomplete)||0,l=Number(s?.processing)||0,d=Number(a?.gray)||0,m=n>0?i/n*100:null,f=0,y=0;for(let u of t){let b=u?.import_stages||{};for(let w of["extract","raw_parquet","filter","postgres"]){let k=b[w];!k||k==="empty"||(f+=1,k==="complete"&&(y+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(i),"\u56DB\u500B\u532F\u5165\u968E\u6BB5\u90FD\u5B8C\u6210\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(o+l),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\uFF08\u542B\u8655\u7406\u4E2D\uFF09\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",c(d),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(n),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",kt(m),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c(y)} / ${c(f)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([u,b,w])=>`<span class="index-runtime-metric" title="${r(w)}"><span>${r(u)}</span><strong>${r(b)}</strong></span>`).join("")}</div>`}function xp(e,{titleSuffix:t="\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868"}={}){let s=`${r(e?.label||"\u6CD5\u898F\uFF0F\u547D\u4EE4")} ${r(t)}`,a=Array.isArray(e?.months)?e.months:[];if(!a.length)return`<section class="report-card processing-card import-files-card law-index-timeline-card">
      <div class="side-card-head">
        <span class="side-card-title">${p(e?.key==="order"?"file":"layers",14)}${s}</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u7121\u4E0B\u8F09\u7248\u672C\u6216\u7D22\u5F15\u7D00\u9304\u3002</div>
    </section>`;let n=new Map(a.map(v=>[String(v.month),v])),i=[...new Set(a.map(v=>v.year))].sort((v,u)=>String(u).localeCompare(String(v))),o=["download","prepared","indexed"],l=e.stage_labels||{download:"D \u4E0B\u8F09\u7248\u672C",prepared:"P \u8CC7\u6599\u5C31\u7DD2",indexed:"I \u7D22\u5F15\u8986\u84CB"},d=e.summary||{},m=e.current||{},f=i.map(v=>{let u=Array.from({length:12},(b,w)=>{let k=w+1,A=`${v}${String(k).padStart(2,"0")}`,S=n.get(A);return ci({month:S,year:v,monthNo:k,stageOrder:o,stageLabels:l,stageStatuses:S?.stages||{},overall:S?.overall||"empty",active:!!S?.active,workflowForStage:$=>$==="indexed"?"legal_index_versions":`${e.key}_download`,variant:"index"})}).join("");return`<tr><th scope="row">${r(v)}</th>${u}</tr>`}).join(""),y=m.month?`<div class="index-current-row">
        <span class="badge badge-info">${p("activity",11)}${r(m.label||"\u76EE\u524D\u7248\u672C")}</span>
        <strong class="mono">${r(m.month_label||Rn(m.month))}</strong>
        <span class="mono">${r(m.file||"\u2014")}</span>
        <span class="index-current-copy">${r(m.detail||"")}</span>
      </div>`:"";return`<section class="report-card processing-card import-files-card law-index-timeline-card" data-law-index-timeline="${r(e.key||"")}">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${p(e.key==="order"?"file":"layers",14)}${s}</span>
      ${kp(e,a,d)}
    </div>
    ${y}
    <div class="judgment-months index-months">
      <div class="index-month-are-key processing-timeline-legend" aria-label="\u968E\u6BB5\u984F\u8272\u5716\u4F8B">
        <span class="processing-timeline-legend-label">\u968E\u6BB5</span>
        <span><i class="processing-timeline-swatch is-download"></i>D \u4E0B\u8F09\u7248\u672C</span>
        <span><i class="processing-timeline-swatch is-prepared"></i>P \u8CC7\u6599\u5C31\u7DD2</span>
        <span><i class="processing-timeline-swatch is-indexed"></i>I \u7D22\u5F15\u8986\u84CB</span>
      </div>
      <div class="index-month-are-key processing-timeline-legend" aria-label="\u968E\u6BB5\u72C0\u614B\u5716\u4F8B">
        <span class="processing-timeline-legend-label">\u72C0\u614B</span>
        <span><i class="processing-timeline-swatch is-solid-state"></i>\u5B8C\u6210</span>
        <span><i class="processing-timeline-swatch is-hollow-state"></i>\u672A\u5B8C\u6210\uFF0825% \u6DFA\u8272\uFF09</span>
        <span><i class="processing-timeline-swatch is-progress-state"></i>\u57F7\u884C\u4E2D\uFF08\u9032\u5EA6\u689D\uFF09</span>
        <span><i class="processing-timeline-swatch is-empty"></i>\u7121\u8CC7\u6599\uFF0F\u5DF2\u53D6\u4EE3</span>
      </div>
      <div class="judgment-months-scroll">
        <table class="judgment-months-table index-months-table processing-months-table">
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(v,u)=>`<th scope="col">${u+1}</th>`).join("")}</tr></thead>
          <tbody>${f}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">D\uFF1A\u4E0B\u8F09\u7248\u672C\uFF1BP\uFF1Araw Parquet + PostgreSQL \u5C31\u7DD2\uFF1BI\uFF1Aactive \u7D22\u5F15\u8986\u84CB\uFF08\u7531\u6CD5\u898F\uFF0F\u547D\u4EE4\u7D22\u5F15\u6D41\u7A0B\u7DAD\u8B77\uFF09\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF0C\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u5B8C\u6210\u8272\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u6216\u5DF2\u53D6\u4EE3\u3002\u820A\u7248\u672C\u986F\u793A\u300C\u5DF2\u53D6\u4EE3\u300D\uFF0C\u4E0D\u9700\u91CD\u5EFA\u7D22\u5F15\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u7DE8\u865F\u3001\u4E0B\u8F09\u6642\u9593\u8207\u7B46\u6578\u3002</p>
    </div>
  </section>`}function Ap(e,t={}){let s=Array.isArray(e)?e:[];return s.length?`<div class="law-index-timelines">${s.map(a=>xp(a,t)).join("")}</div>`:""}function Ml({activeMonth:e,activeArchive:t,activePhase:s="",processingMonth:a="",processingArchive:n="",stageLabels:i={}}){if(!e||!t)return"";let o=`${String(e).slice(0,4)}-${String(e).slice(4,6)}`,l=i[s]||(s?"\u6E96\u5099\u4E2D":""),d=`${String(a||"").slice(0,4)}-${String(a||"").slice(4,6)}`,m=!!a&&(a!==e||n!==t);return`<span class="badge badge-info">${p("activity",11)}\u76EE\u524D\u532F\u5165</span>
    <strong class="mono">${r(o)}</strong>
    <span class="mono">${r(t)}</span>
    ${l?`<span class="badge badge-neutral">${r(l)}</span>`:""}
    ${m?`<span class="processing-current-processing">
            <span class="faint">\u8655\u7406\u4E2D</span>
            <strong class="mono">${r(d)}</strong>
            <span class="mono">${r(n||"\u2014")}</span>
          </span>`:""}`}function qp(e,t,s,a){let n=[];for(let i=1;i<=12;i+=1){let o=`${t}${String(i).padStart(2,"0")}`;n.push(_p(e,s.get(o),t,i,a))}return`<tr><th scope="row">${t}</th>${n.join("")}</tr>`}function Mp(e){let t=e?.models||{};return[["Embedding",t.embedding],["Rerank",t.rerank]].filter(([,s])=>s&&(s.label||s.model)).map(([s,a])=>{let n=a.label||[a.host,a.model].filter(Boolean).join(" ")||"\u2014",i=[`${s} \u4E3B\u6A5F\u8207\u6A21\u578B\uFF1A${n}`,a.url?`\u7AEF\u9EDE\uFF1A${a.url}`:"",s==="Rerank"&&a.enabled===!1?"RAG_RERANK_ENABLED=false":""].filter(Boolean).join(" \xB7 ");return`<span class="processing-timeline-model" title="${r(i)}">${s} <strong class="mono">${r(n)}</strong>${s==="Rerank"&&a.enabled===!1?' <span class="faint">\u672A\u555F\u7528</span>':""}</span>`}).join("")}function Lp(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=a>0?n/a*100:null,o=t.reduce((f,y)=>{let v=y?.stages||{};return f+oi.filter(u=>!!v[u]&&v[u]!=="empty"&&v[u]!=="not_applicable").length},0),l=t.reduce((f,y)=>{let v=y?.stages||{};return f+oi.filter(u=>v[u]==="complete").length},0),d=(Number(s?.incomplete)||0)+(Number(s?.processing)||0);return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(n),"\u5DF2\u5B8C\u6210\u5168\u90E8\u56DB\u500B\u968E\u6BB5\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(d),"\u4ECD\u6709\u81F3\u5C11\u4E00\u500B\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",c(s?.update||0),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",kt(i),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c(l)} / ${c(o)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([f,y,v])=>`<span class="index-runtime-metric" title="${r(v)}"><span>${r(f)}</span><strong>${r(y)}</strong></span>`).join("")}</div>`}function jp(e,t){let s=new Map((Array.isArray(e?.workflows)?e.workflows:[]).map(f=>[String(f.id||""),f])),a=t.key==="judgment"?"index_versions":"legal_index_versions",i=s.get(a)?.index_runtime||{},o=f=>{if(f==null||f==="")return null;let y=Number(f);return Number.isFinite(y)?Math.max(0,Math.min(100,y)):null},l=new Map((Array.isArray(i.months)?i.months:[]).map(f=>[String(f?.month||""),o(f?.percent)])),d=new Map(Object.entries(i.active_coverage||{}).map(([f,y])=>[String(f),o(y?.percent)])),m=(f,y)=>{let v=s.get(String(f||""));if(!v)return null;let u=v.progress||{},b=Array.isArray(u.stages)?u.stages:[];for(let w of y){let k=b.find(S=>String(S.key)===w),A=o(k?.percent);if(A!==null)return A}return o(u.percent)};return(f,y,v)=>{let u=String(y||"");if(f==="qdrant"){let k=l.get(u),A=d.get(u);if(v==="processing"){if(k!==null&&k>0)return k;if(A!==null&&A>0)return A}else return v==="incomplete"?k!==null&&k>0?k:A!==null&&A>0?A:0:null}let b=ql(t.key,f);if(!b)return null;let w=(gp[t.key]||{})[f]||[f];return m(b,w)}}function Tp(e){let t=Array.isArray(e.file_timelines)?e.file_timelines:[];return t.length?`<div class="processing-timeline-overview">${t.map(s=>{let a=Array.isArray(s.months)?s.months:[],n=new Map(a.map(f=>[String(f.month||""),f])),i=[...new Set(a.map(f=>Number(f.year)))].filter(f=>Number.isFinite(f)).sort((f,y)=>y-f),o=s.summary||{},l=s.current||null,d=Mp(s),m=jp(e,s);return`<section class="report-card processing-card import-files-card processing-timeline-card" data-processing-timeline="${r(s.key||"")}">
        <div class="side-card-head index-runtime-head">
          <span class="side-card-title">${p(s.icon||"activity",14)}${r(s.title||`${s.label||""}\u8655\u7406\u6642\u9593\u8868`)}</span>
          ${Lp(s,a,o)}
        </div>
        ${d?`<div class="index-runtime-summary">${d}</div>`:""}
        ${l?`<div class="index-current-row">
                <span class="badge badge-info">${p("activity",11)}${r(l.label||"\u76EE\u524D")}</span>
                <strong class="mono">${r(l.month_label||"\u2014")}</strong>
                <span class="mono">${r(l.file||"\u2014")}</span>
                ${l.detail?`<span class="index-current-copy">${r(l.detail)}</span>`:""}
              </div>`:""}
        <div class="judgment-months index-months">
          <div class="index-month-are-key processing-timeline-legend" aria-label="\u968E\u6BB5\u984F\u8272\u5716\u4F8B">
            <span class="processing-timeline-legend-label">\u968E\u6BB5</span>
            <span><i class="processing-timeline-swatch is-download"></i>\u4E0B\u8F09</span>
            <span><i class="processing-timeline-swatch is-parquet"></i>Parquet</span>
            <span><i class="processing-timeline-swatch is-postgres"></i>PostgreSQL</span>
            <span><i class="processing-timeline-swatch is-qdrant"></i>Qdrant</span>
          </div>
          <div class="index-month-are-key processing-timeline-legend" aria-label="\u968E\u6BB5\u72C0\u614B\u5716\u4F8B">
            <span class="processing-timeline-legend-label">\u72C0\u614B</span>
            <span><i class="processing-timeline-swatch is-solid-state"></i>\u5B8C\u6210</span>
            <span><i class="processing-timeline-swatch is-hollow-state"></i>\u672A\u5B8C\u6210\uFF0825% \u6DFA\u8272\uFF09</span>
            <span><i class="processing-timeline-swatch is-partial-state"></i>\u5DF2\u8655\u7406\uFF08\u9032\u5EA6\u689D\uFF09</span>
            <span><i class="processing-timeline-swatch is-progress-state"></i>\u57F7\u884C\u4E2D\uFF08\u9032\u5EA6\u689D\uFF09</span>
            <span><i class="processing-timeline-swatch is-empty"></i>\u7121\u8CC7\u6599</span>
          </div>
          ${a.length?`<div class="judgment-months-scroll">
                  <table class="judgment-months-table index-months-table processing-months-table">
                    <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(f,y)=>`<th scope="col">${y+1}</th>`).join("")}</tr></thead>
                    <tbody>${i.map(f=>qp(s,f,n,m)).join("")}</tbody>
                  </table>
                </div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u3002</div>'}
          <p class="judgment-months-hint">${s.key==="judgment"?"\u5224\u6C7A\u4EE5\u88C1\u5224\u66F8\u6708\u4EFD\u986F\u793A\u3002":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u4EE5\u4F86\u6E90\u7248\u672C\u6708\u4EFD\u986F\u793A\u3002"}\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA\u4E0B\u8F09\u3001Parquet\u3001PostgreSQL\u3001Qdrant \u56DB\u500B\u968E\u6BB5\uFF1B\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF0CQdrant \u4E4B\u524D\u5DF2\u8655\u7406\u4F46\u5C1A\u672A\u5B8C\u6210\u6642\u4EE5\u5B8C\u6210\u8272\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u6216\u8272\u584A\u53EF\u67E5\u770B\u5404\u968E\u6BB5\u72C0\u614B\u8207\u9032\u5EA6\u3002</p>
        </div>
      </section>`}).join("")}</div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u8655\u7406\u6642\u9593\u8868\u3002</div>'}function Ep(e){return e.judgment_stats&&typeof e.judgment_stats=="object"?e.judgment_stats:{judgment_total:(e.raw_backups?.totals||{}).row_count,financial_total:(e.database||{}).judgment_count}}function kl(e,t=new Set){return`${wp(e)}
    ${vp(e)}
    ${Tp(e)}
    ${$p(e)}
    ${yp(e)}`}function Np(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${Ge({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:r(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${r($e(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${p("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}function Rp(e,t){if(e.nodeType!==t.nodeType||e.nodeName!==t.nodeName){e.replaceWith(t.cloneNode(!0));return}if(e.nodeType===Node.TEXT_NODE){e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue);return}if(e.nodeType===Node.ELEMENT_NODE){for(let s of[...e.attributes])t.hasAttribute(s.name)||e.removeAttribute(s.name);for(let s of[...t.attributes])e.getAttribute(s.name)!==s.value&&e.setAttribute(s.name,s.value);t.hasAttribute("data-preserve-children")||Ll(e,t)}}function Ll(e,t){let s=[...e.childNodes],a=[...t.childNodes],n=Math.min(s.length,a.length);for(let i=0;i<n;i+=1)Rp(s[i],a[i]);for(let i=n;i<s.length;i+=1)s[i].remove();for(let i=n;i<a.length;i+=1)e.appendChild(a[i].cloneNode(!0))}function hs(e,t){let s=document.createElement("template");s.innerHTML=t,Ll(e,s.content)}var jl={overview:"activity",law_download:"layers",order_download:"file",judgment_download:"download",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function Cp(e){let s=(Array.isArray(e.workflows)?e.workflows:[]).map(n=>{let i=n.active_run||null,o=i||n.last_run||null;return{...n,activeRun:i,lastRun:o,status:i?i.status||"running":n.update_available?"update":o?.status||"idle"}}),a=s.find(n=>n.id==="judgment_parquet");return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...s.filter(n=>n.id!=="judgment_parquet"),...a?[a]:[]]}function En(e,t){let s=Cp(e),a=new Set(["law_download","judgment_download","normalize_courts"]);return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${s.map(n=>{let i=n.id===t,o=jl[n.id]||"terminal",l=a.has(n.id)?'<div class="status-tab-divider" role="separator" aria-hidden="true"></div>':"",d=Number(n.pending_count)||0,m=Number(n.update_count)||(n.update_available?d:0),f=n.update_available&&m>0&&!n.activeRun,y=[n.update_message||`${n.update_origin||"\u66F4\u65B0\u5075\u6E2C"}\u627E\u5230 ${c(m)} \u9805\u53EF\u66F4\u65B0\u5167\u5BB9`,n.update_origin?`\u4F86\u6E90\uFF1A${n.update_origin}`:"",n.update_mechanism?`\u6A5F\u5236\uFF1A${n.update_mechanism}`:""].filter(Boolean).join(" \xB7 ");return`${l}<button class="status-tab${i?" is-active":""}" type="button"
            data-processing-workflow="${r(n.id)}"
            ${i?'aria-current="page"':""}>
            <span class="status-tab-icon">${p(o,15)}</span>
            <span class="status-tab-copy">
              <strong>${r(n.label)}</strong>
              <small>${r(n.description||"")}</small>
            </span>
            ${f?`<span class="badge badge-warn badge-mono processing-update-count" title="${r(y)}">${p("refresh",10)}${c(m)}</span>`:zt(n.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${r(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function Pp(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${zt(e.status)}
      <span class="mono">${r(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${r($e(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${ge(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${r(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${r(t.log_path)}</strong>`:""}
    </div>
  </div>`}function ja(e){return`${e.year}-${String(e.month_no).padStart(2,"0")}`}function Tl(e){let t={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"},s=e.status||"red";return[ja(e),t[s]||s,e.latest_fileset_id?`fileset ${e.latest_fileset_id}`:"",e.filename||"",e.local_filename&&e.local_filename!==e.filename?`\u672C\u6A5F\uFF1A${e.local_filename}`:""].filter(Boolean).join(" \xB7 ")}function El(e){if(!e.download_url)return"";let t=ja(e);return`<a class="judgment-month-download" href="${r(It($t(e.download_url)))}" target="_blank" rel="noreferrer" title="\u4E0B\u8F09 ${t} \u5224\u6C7A" aria-label="\u4E0B\u8F09 ${t} \u5224\u6C7A">${p("download",11)}</a>`}function Ip(e){let t=e.status||"red";return`<td class="judgment-month is-${r(t)}" data-judgment-month-key="${r(ja(e))}" title="${r(Tl(e))}"><span>${e.month_no}</span>${El(e)}</td>`}function Dp(e){return e?.off_hours_enabled===!0}function Nl(e){return`\u7DA0\u8272\uFF1A\u6700\u65B0\u7248\u5DF2\u4E0B\u8F09\u5230 raw_rar\uFF1B\u7070\u8272\uFF1A\u672C\u6A5F\u4ECD\u662F\u820A\u7248\uFF0C\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u6703\u66F4\u65B0\uFF1B\u7D05\u8272\uFF1A\u8A72\u6708\u4EFD\u7F3A\u5C11\u5224\u6C7A\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u958B\u555F\u4E0B\u8F09\u9023\u7D50\uFF08${Dp(e)?"\u975E API \u6642\u6BB5\u4E5F\u53EF\u4E0B\u8F09\uFF0C\u5EFA\u8B70\u4E00\u6B21\u53EA\u4E0B\u8F09\u4E00\u500B\u6A94\u6848":"\u4E0B\u8F09\u9023\u7D50\u50C5\u5728 00:00\u201306:00 API \u6642\u6BB5\u53EF\u7528"}\uFF09\u3002\u5F85\u88DC\u9F4A\u6708\u4EFD\u6703\u512A\u5148\u4E0B\u8F09\uFF0C\u5168\u90E8\u88DC\u9F4A\u5F8C\u624D\u7531\u6700\u65B0\u6708\u4EFD\u5F80\u56DE\u9A57\u8B49\u65E2\u6709\u6A94\u6848\uFF1B\u4E2D\u65B7\u7684\u4E0B\u8F09\u6703\u4FDD\u7559 .part\uFF0C\u4F3A\u670D\u5668\u652F\u63F4 Range \u6642\u7E8C\u50B3\uFF0C\u5426\u5247\u5F9E\u96F6\u91CD\u65B0\u4E0B\u8F09\u3002\u9996\u6B21\u5B8C\u6574\u540C\u6B65\u53EF\u80FD\u9700\u4E0B\u8F09\u6578\u767E\u500B\u6708\u4EFD\uFF0C\u9810\u8A2D\u975E\u6642\u6BB5\u4E5F\u53EF\u7E8C\u50B3\uFF1B\u56B4\u683C\u6A21\u5F0F\u6703\u5728 00:00\u201306:00 \u4EE5\u5916\u505C\u6B62\u3002`}var Bp={completed:"\u5B8C\u6210",window_closed:"API \u6642\u6BB5\u7D50\u675F",deadline:"\u63A5\u8FD1 06:00\uFF0C\u4FDD\u7559\u5F85\u4E0B\u8F09\u6708\u4EFD",verification_window_closed:"API \u6642\u6BB5\u7D50\u675F\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",verification_deadline:"\u63A5\u8FD1 06:00\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",errors:"\u90E8\u5206\u6708\u4EFD\u4E0B\u8F09\u5931\u6557\uFF0C\u4E0B\u6B21\u91CD\u8A66",pending:"\u4ECD\u6709\u5F85\u4E0B\u8F09\u6708\u4EFD",check_only:"\u50C5\u6AA2\u67E5\uFF0C\u672A\u4E0B\u8F09",incremental:"\u589E\u91CF\u6AA2\u67E5\u5B8C\u6210",status_only:"\u50C5\u66F4\u65B0\u6708\u4EFD\u72C0\u614B",running:"\u57F7\u884C\u4E2D"};function di(e){let t=e?.backfill||{},s=t.verification||{},a=t.last_run||{},n=Number(t.pending_count)||0,i=Number(t.failure_count)||0,o=String(t.resume_from_month||""),l="\u9A57\u8B49\uFF1A\u672A\u958B\u59CB";s.status==="completed"?l="\u9A57\u8B49\u5B8C\u6210":s.next_month?l=`\u9A57\u8B49\u7E8C\u50B3 ${s.next_month}`:s.status==="in_progress"&&(l="\u9A57\u8B49\u9032\u884C\u4E2D");let d=String(a.stop_reason||""),m=d?`\u4E0A\u6B21\u505C\u6B62\uFF1A${Bp[d]||d}`:"";return{pending:n,failures:i,resume:o,verificationText:l,lastText:m}}function Fp(e){let t=di(e),s=t.pending>0?`\u5F85\u88DC\u9F4A ${c(t.pending)} \u500B\u6708${t.failures>0?`\uFF08${c(t.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708";return`<div class="judgment-backfill" data-judgment-backfill>
    <span class="badge ${t.pending>0?"badge-danger":"badge-ok"}" data-judgment-backfill-pending>${s}</span>
    <span class="badge badge-neutral" data-judgment-backfill-resume ${t.resume&&t.pending>0?"":"hidden"}>\u5F9E ${r(t.resume)} \u7E8C\u50B3</span>
    <span class="badge badge-info" data-judgment-backfill-verification>${r(t.verificationText)}</span>
    <span class="muted" data-judgment-backfill-last ${t.lastText?"":"hidden"}>${r(t.lastText)}</span>
  </div>`}function Op(e,t){let s=di(t),a=e.querySelector("[data-judgment-backfill-pending]");a&&(a.textContent=s.pending>0?`\u5F85\u88DC\u9F4A ${c(s.pending)} \u500B\u6708${s.failures>0?`\uFF08${c(s.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708",a.classList.toggle("badge-danger",s.pending>0),a.classList.toggle("badge-ok",s.pending===0));let n=e.querySelector("[data-judgment-backfill-resume]");if(n){let l=!!s.resume&&s.pending>0;n.hidden=!l,n.textContent=l?`\u5F9E ${s.resume} \u7E8C\u50B3`:""}let i=e.querySelector("[data-judgment-backfill-verification]");i&&(i.textContent=s.verificationText);let o=e.querySelector("[data-judgment-backfill-last]");o&&(o.hidden=!s.lastText,o.textContent=s.lastText)}function ui(){return'<div class="judgment-months-loading"><span class="spinner"></span><span>\u8B80\u53D6\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B\u2026</span></div>'}function Hp(e){if(e?.loading&&!e?.months?.length)return ui();if(e?.error&&!e?.months?.length)return Ge({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(e.error)});let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return'<div class="processing-empty">\u5C1A\u672A\u6709\u6708\u4EFD\u72C0\u614B\uFF1B\u8ACB\u5148\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u3002</div>';let s=new Map(t.map(o=>[ja(o),o])),n=[...new Set(t.map(o=>o.year))].sort((o,l)=>l-o).map(o=>{let l=Array.from({length:12},(d,m)=>{let f=s.get(`${o}-${String(m+1).padStart(2,"0")}`);return f?Ip(f):`<td class="judgment-month is-empty"><span>${m+1}</span></td>`}).join("");return`<tr><th scope="row">${o}</th>${l}</tr>`}).join(""),i=e.summary||{};return`<div class="judgment-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" data-judgment-summary="green">\u6700\u65B0\u7248 ${c(i.green||0)}</span>
      <span class="badge badge-neutral" data-judgment-summary="gray">\u820A\u7248 ${c(i.gray||0)}</span>
      <span class="badge badge-danger" data-judgment-summary="red">\u7F3A\u5931 ${c(i.red||0)}</span>
      <span class="muted" data-judgment-total>\u5171 ${c(e.total_months||t.length)} \u500B\u6708</span>
    </div>
    ${Fp(e)}
    <div class="judgment-months-scroll">
      <table class="judgment-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(o,l)=>`<th scope="col">${l+1}</th>`).join("")}</tr></thead>
        <tbody>${n}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint" data-judgment-hint>${r(Nl(e))}</p>
  </div>`}function zp(e,t){let s=Array.isArray(t?.months)?t.months:[],a=t.summary||{},n={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"};e.querySelectorAll("[data-judgment-summary]").forEach(l=>{let d=l.dataset.judgmentSummary||"";l.textContent=`${n[d]||d} ${c(a[d]||0)}`});let i=e.querySelector("[data-judgment-total]");i&&(i.textContent=`\u5171 ${c(t.total_months||s.length)} \u500B\u6708`),Op(e,t);let o=e.querySelector("[data-judgment-hint]");if(o){let l=Nl(t);o.textContent!==l&&(o.textContent=l)}for(let l of s){let d=ja(l),m=e.querySelector(`[data-judgment-month-key="${d}"]`);if(!m)continue;let f=l.status||"red";m.classList.contains(`is-${f}`)||(m.classList.remove("is-green","is-gray","is-red","is-empty"),m.classList.add(`is-${f}`));let y=Tl(l);m.title!==y&&(m.title=y);let v=m.querySelector(".judgment-month-download");if(l.download_url){let u=$t(l.download_url);v?v.getAttribute("href")!==u&&(v.href=u):m.insertAdjacentHTML("beforeend",El(l))}else v&&v.remove()}}function Up(e){let t=Array.isArray(e)?e:[];return t.length?`<div class="processing-workflow-history">
    ${t.map(s=>`<div class="processing-workflow-history-row">
          <span class="processing-workflow-history-status">${zt(s.status||"idle")}</span>
          <span class="mono">${r($e(s.started_at))}</span>
          <span class="mono">${r(ge(s.duration_ms||0))}</span>
          <span class="processing-workflow-history-message">${r(s.message||"\u2014")}</span>
        </div>`).join("")}
  </div>`:'<div class="processing-workflow-empty">\u5C1A\u7121\u57F7\u884C\u7D00\u9304\u3002</div>'}function Gp(e){let t=Array.isArray(e.update_history)?e.update_history:[];if(!t.length)return'<div class="processing-workflow-empty">\u5C1A\u7121\u7248\u672C\u6AA2\u67E5\u7D00\u9304\u3002</div>';let s={up_to_date:["\u5DF2\u662F\u6700\u65B0","badge-ok"],update_available:["\u6709\u66F4\u65B0","badge-warn"],error:["\u6AA2\u67E5\u5931\u6557","badge-danger"]};return`<div class="processing-workflow-history">
    ${t.map(a=>{let[n,i]=s[a.status]||[a.status||"\u672A\u77E5","badge-neutral"],o=a.remote_content_length!=null?Ce(a.remote_content_length):"\u2014",l=a.local_version_id?`v${a.local_version_id}`:"\u2014";return`<div class="processing-workflow-history-row">
          <span class="badge ${i}">${r(n)}</span>
          <span class="mono">${r($e(a.checked_at))}</span>
          <span class="mono">\u9060\u7AEF ${r(o)}</span>
          <span class="mono">\u672C\u5730 ${r(l)}</span>
          <span class="processing-workflow-history-message">${r(a.message||"\u2014")}</span>
        </div>`}).join("")}
  </div>`}function Rl(e){let t=String(e.key||""),s=Ls(e.status);return[`data-stage-key="${r(t)}"`,`data-stage-label="${r(e.label||t)}"`,`data-stage-color="${r(Al(e))}"`,`data-stage-status-key="${r(e.status||"idle")}"`,`data-stage-status="${r(s.label)}"`,`data-stage-percent="${r(kt(e.percent))}"`,`data-stage-counts="${r(li(e))}"`,`data-stage-duration="${r(Os(e.duration_ms||0))}"`,`data-stage-contribution="${r(kt(e.contribution_percent))}"`,`data-stage-message="${r(e.message||"")}"`].join(" ")}function Qp(e,t=Date.now()){let s=String(e.status||"idle"),a=Number(e.duration_ms)||0,n=Date.parse(e.started_at||"");if(s==="running"&&Number.isFinite(n))return Math.max(a,t-n);if(a>0)return a;let i=Date.parse(e.finished_at||"");return Number.isFinite(n)&&Number.isFinite(i)?Math.max(0,i-n):0}function Cl(e){if(e.key!=="filter")return null;let t=Number(e.financial_processed),s=Number(e.financial_matched);return e.financial_processed===null||e.financial_processed===void 0||!Number.isFinite(t)||!Number.isFinite(s)||t<=0?null:{processed:t,matched:s,percent:Math.round(s/t*100)}}function Jp(e){let t=String(e.status||"idle"),s=[],a=Number(e.total);if(e.key==="postgres"&&["success","no_change"].includes(t)&&Number.isFinite(a)&&a>0)s.push(`\u7E3D\u8A08 ${c(a)} \u7B46`);else{let i=li(e);i!=="\u2014"&&s.push(i)}let n=Cl(e);return n&&s.push(`\u91D1\u878D\u4F54\u6BD4 ${n.percent}%`),s.join(" \xB7 ")}function Wp(e,t){let s=String(e.status||"idle"),a=[],n=(d,m,{always:f=!1}={})=>{let y=m==null?"":String(m).trim();!f&&!y||a.push(`<span class="rag-wf-detail"><span>${r(d)}</span><strong>${r(y||"\u2014")}</strong></span>`)};n("\u72C0\u614B",Ls(s).label,{always:!0}),n("\u958B\u59CB",e.started_at?$e(e.started_at):"\u2014",{always:!0}),n("\u7D50\u675F",e.finished_at?$e(e.finished_at):"\u2014",{always:!0}),n("\u8017\u6642",t,{always:!0}),n("\u9032\u5EA6",kt(e.percent),{always:!0});let i=li(e),o=["extract","raw_parquet"].includes(String(e.key||""));n(o?"\u7D2F\u8A08\u8CC7\u6599\u91CF":"\u8CC7\u6599\u91CF",i!=="\u2014"?i:"");let l=Cl(e);return l&&(n("\u91D1\u878D\u6848\u4EF6",`${c(l.matched)} \u7B46`),n("\u5168\u90E8\u6848\u4EF6",`${c(l.processed)} \u7B46`),n("\u91D1\u878D\u4F54\u6BD4",`${l.percent}%`)),n("\u6574\u9AD4\u5360\u6BD4",kt(e.contribution_percent)),s==="failed"||s==="stale"?(n("\u539F\u56E0",e.error||e.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002"),n("\u5EFA\u8B70",e.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002")):n("\u8AAA\u660E",e.message),a.join("")}function Vp(e){let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${p("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A host/model\u3001Blue-Green \u5EFA\u7F6E\u8207\u5404\u968E\u6BB5\u9032\u5EA6\u3002</div>
    </section>`;let a=new Map(s.map(pe=>[String(pe.key||""),pe])),n=a.get("ollama")||{},i=a.get("qdrant")||{},o=a.get("validate")||{},l=e.index_runtime||{},d=l.summary||{},m=l.copy||{},f=Number(l.index_prior_duration_ms||0),y=l.current||{},v=l.embedding||{},u=v.selected||{},b=v.active||{},w=Number(l.expected_count||d.total||i.total||0),k=Number(d.indexed??i.current??0),A=w>0?Math.min(100,k/w*100):i.status==="success"?100:0,S=Number(m.total||0),$=Number(m.copied||0),T=S>0?Math.min(100,$/S*100):m.status==="success"?100:0,K=String(l.build_mode||""),G=String(t.run_status||""),fe=!!G&&!["running","success","no_change"].includes(G),ye=String(m.status||(K==="reuse"?"pending":"skipped"));fe&&ye==="pending"&&(ye="stale");let ie=Number(m.duration_ms||0)/1e3,L=ie>0?$/ie:0,q=ye==="running"&&L>0&&S>$?(S-$)/L:null,j=Dl(e,l,k),V=Fl(l,k,w,j),de=V?.remainingMs&&V.remainingMs>0?V.remainingMs/1e3:null,z=ye==="success"||ye==="skipped"||k>0||i.status==="success",Z=i.status==="success"?"success":z&&i.status||"pending",qe=String(o.status||"pending"),F=qe==="success"&&/alias 已切換/.test(String(o.message||"")),ke=F?"success":qe==="failed"?"failed":G==="running"?"pending":"skipped",ne=l.version_id?`v${String(l.version_id).padStart(3,"0")}`:"\u2014",Se=b.host||u.host||b.url||u.url||"\u2014",Pe=b.port||u.port,Le=Pe?`${Se}:${Pe}`:String(Se),Ze=b.model||u.model||l.model||"\u2014",he=z&&y.month?`${Rn(y.month)}${y.preparing?"\uFF08\u6E96\u5099\u4E2D\uFF09":""}`:t.run_status==="running"?"\u6E96\u5099\u4E2D":"\u2014",oe=String(y.phase||"")==="embedding"?"E \u65B0 embedding":String(y.phase||"")==="reuse"?"R \u91CD\u7528":"\u2014",ce=(()=>{let pe=Number(i.duration_ms)||0,ze=Date.parse(i.started_at||"");if(i.status==="running"&&Number.isFinite(ze))return Math.max(pe,Date.now()-ze);if(pe>0)return pe;let Ke=Date.parse(i.finished_at||"");return Number.isFinite(ze)&&Number.isFinite(Ke)?Math.max(0,Ke-ze):0})(),ve=[{key:"probe",label:"llama-server \u4E3B\u6A5F\uFF0F\u6A21\u578B\u6E2C\u8A66",caption:"\u4E3B\u6A5F\uFF0F\u6A21\u578B\u3001\u9023\u7DDA\u6E2C\u8A66",color:"#22c55e",status:n.status||"pending",percent:Number(n.percent)||0,current:Number(n.current)||0,total:Number(n.total)||0,unit:"\u53F0",duration_ms:n.duration_ms,started_at:n.started_at,finished_at:n.finished_at,extraDetails:[["\u4E3B\u6A5F",Le],["\u6A21\u578B",Ze],["\u6E2C\u8A66\u4E3B\u6A5F",`${c(n.current||0)} / ${c(n.total||0)} \u53F0`]],detail:`${c(n.current||0)} / ${c(n.total||0)} \u53F0 \xB7 ${Le} \xB7 ${Ze}`},{key:"version",label:"\u5EFA\u7ACB\uFF0F\u63A5\u7E8C Blue-Green \u7248\u672C",caption:"Blue-Green \u7248\u672C\u3001collection",color:"#06b6d4",status:l.version_id?"success":"pending",percent:l.version_id?100:0,current:l.version_id?1:0,total:1,unit:"\u968E\u6BB5",duration_ms:l.version_duration_ms,started_at:null,finished_at:null,extraDetails:[["\u7248\u672C",ne],["Collection",l.collection||"\u2014"],["\u6A21\u5F0F",K||"\u2014"]],detail:`${ne} \xB7 ${l.collection||"\u2014"} \xB7 ${K||"\u2014"}`},{key:"copy",label:"\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF",caption:"\u820A collection \u5411\u91CF\u8907\u88FD",color:"#f59e0b",status:ye,percent:T,current:$,total:S,unit:"points",duration_ms:m.duration_ms,started_at:m.started_at,finished_at:m.finished_at,extraDetails:[["\u5DF2\u8907\u88FD",`${c($)} points`],["\u7E3D points",c(S)],["\u7BC4\u570D","\u5168\u57DF points\uFF1B\u4E0D\u5217\u5165\u6708\u4EFD R\uFF0FE"],["\u8907\u88FD\u901F\u5EA6",L>0?`${L.toFixed(1)} points/\u79D2`:"\u2014"],m.resumed?["\u4F86\u6E90",`\u7E8C\u8DD1\u524D\u5B8C\u6210${m.resumed_from_run_id?`\uFF08${m.resumed_from_run_id}\uFF09`:""}`]:null,["\u9810\u4F30\u5269\u9918",q!==null?La(q):"\u2014"]],detail:S>0?`${c($)} / ${c(S)} points \xB7 \u820A collection \u5411\u91CF${m.resumed?" \xB7 \u7E8C\u8DD1\u524D\u5B8C\u6210":""}`:ye==="skipped"?"\u672C\u6B21\u4E0D\u9700\u8907\u88FD\u820A\u5411\u91CF":ye==="stale"?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5B8C\u6210\u8907\u88FD":"\u7B49\u5F85\u820A collection \u8907\u88FD"},{key:"index",label:"\u91D1\u878D\u5224\u6C7A\u5411\u91CF\u7D22\u5F15",caption:"R \u85CD\uFF0FE \u7D2B\uFF1B\u672C\u6B21 run \u9032\u5EA6",color:"#a78bfa",barColor:oe==="E \u65B0 embedding"?"#a78bfa":oe==="R \u91CD\u7528"?"#3b82f6":"",status:Z,phaseKey:oe==="R \u91CD\u7528"?"reuse":oe==="E \u65B0 embedding"?"embedding":"",phaseLabel:Z==="running"?oe:"",percent:A,current:k,total:w,unit:"\u7B46",duration_ms:z?i.duration_ms:0,extraDurationMs:f,started_at:z?i.started_at||l.started_at:null,finished_at:i.finished_at,extraDetails:[["\u5DF2\u7D22\u5F15",`${c(k)} / ${c(w)} \u7B46`],f>0?["\u524D\u6B21\u57F7\u884C",Os(f)]:null,f>0?["\u672C\u6B21\u57F7\u884C",Os(ce)]:null,["\u91CD\u7528",c(d.reused)],["\u65B0 embedding",c(d.embedded)],["\u76EE\u524D\u6708\u4EFD",he],["\u76EE\u524D\u6279\u6B21",oe],["\u672C\u6279 R\uFF0FE",`R ${c(y.reused||0)} \xB7 E ${c(y.embedded||0)}`],["R \u5B9A\u7FA9","04 \u9010\u6708\u6383\u63CF\u6CBF\u7528\uFF1B03 \u8907\u88FD\u70BA\u5168\u57DF points"],["\u9810\u4F30\u5269\u9918",z&&de!==null?La(de):"\u2014"]],htmlDetails:em(l),detail:z?`${c(k)} / ${c(w)} \u7B46 \xB7 \u91CD\u7528 ${c(d.reused)} \xB7 \u65B0 embedding ${c(d.embedded)}${oe==="\u2014"?"":` \xB7 ${oe}`}`:"\u7B49\u5F85\u7248\u672C\u6E96\u5099\uFF08\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF\uFF09\u5B8C\u6210"},{key:"validate",label:"\u9A57\u8B49\u65B0\u7248\u672C",caption:"\u7B46\u6578\u3001\u7DAD\u5EA6\u3001payload",color:"#eab308",status:qe,percent:qe==="success"?100:0,current:null,total:null,duration_ms:o.duration_ms,started_at:o.started_at,finished_at:o.finished_at,extraDetails:[["\u9A57\u8B49\u8A0A\u606F",o.message||"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210"]],detail:o.message||(fe?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u9032\u884C\u9A57\u8B49\u3002":"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210\u5F8C\u9A57\u8B49\u7B46\u6578\u3001\u7DAD\u5EA6\u8207 payload\u3002")},{key:"activate",label:"\u5207\u63DB alias",caption:"judgments_current alias",color:"#3b82f6",status:ke,percent:F?100:0,current:null,total:null,duration_ms:0,started_at:null,finished_at:null,extraDetails:[["\u76EE\u6A19 alias","judgments_current"]],detail:F?o.message:fe?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5207\u63DB alias\u3002":"\u9A57\u8B49\u901A\u904E\u5F8C\u5207\u63DB judgments_current\u3002"}],je=ve.filter(pe=>pe.status!=="skipped"),Te=je.length?je.reduce((pe,ze)=>pe+ze.percent,0)/je.length:0,C=ve.filter(pe=>pe.status==="success").length,D=kt(Te),W=Date.now(),I=pe=>{let ze=Number(pe.extraDurationMs)||0,Ke=Number(pe.duration_ms)||0,ut=Date.parse(pe.started_at||"");if(pe.status==="running"&&Number.isFinite(ut))return ze+Math.max(Ke,W-ut);if(Ke>0)return ze+Ke;let vt=Date.parse(pe.finished_at||"");return ze+(Number.isFinite(ut)&&Number.isFinite(vt)?Math.max(0,vt-ut):0)},H=ve.map(pe=>{let ze=I(pe);return{...pe,computedDuration:ze,drawable:!["skipped","pending"].includes(pe.status)}}),J=Math.max(H.reduce((pe,ze)=>pe+(ze.drawable?ze.computedDuration:0),0),Number(t.duration_ms)||0,1),we=1.25,Oe=H.map(pe=>pe.drawable?Math.max(pe.computedDuration/J*100,we):0),Ve=Oe.reduce((pe,ze)=>pe+ze,0),ct=Ve>100?100/Ve:1,nt=0,et=H.map((pe,ze)=>{let Ke=Oe[ze]*ct,ut=Ke>0?{start:nt,width:Ke}:null;return ut&&(nt+=Ke),{...pe,bar:ut}}).map((pe,ze)=>{let Ke=[`is-${pe.status}`,pe.status==="failed"||pe.status==="stale"?"is-error":"",["pending","skipped"].includes(pe.status)?"is-missing":"",pe.status==="running"?"is-running":""].filter(Boolean).join(" "),ut=["pending","skipped"].includes(pe.status)?"\u2014":Os(pe.computedDuration),vt=pe.status==="running"?` \xB7 ${kt(pe.percent)}`:"",te=pe.phaseLabel?`<span class="index-wf-phase is-${r(pe.phaseKey||"unknown")}">${r(pe.phaseLabel)}</span>`:"",xe="";if(pe.bar){let ht=Math.max(0,Math.min(100,pe.bar.start)),x=Math.max(0,Math.min(100-ht,pe.bar.width)),N=pe.status==="success"?100:Math.max(0,Math.min(100,Number(pe.percent)||0)),P=x*N/100,O=x-P,Y=r(pe.barColor||pe.color);P>0&&(xe+=`<span class="rag-wf-bar index-wf-bar is-sequential" style="left:${ht.toFixed(3)}%;width:${P.toFixed(4)}%;top:0;height:12px;--bar-color:${Y}" aria-hidden="true"></span>`),O>1e-4&&(xe+=`<span class="rag-wf-bar index-wf-bar is-hollow is-sequential" style="left:${(ht+P).toFixed(3)}%;width:${O.toFixed(4)}%;top:0;height:12px;--bar-color:${Y}" aria-hidden="true"></span>`)}let De=[],Qe=(ht,x)=>{x==null||x===""||De.push(`<span class="rag-wf-detail"><span>${r(ht)}</span><strong>${r(String(x))}</strong></span>`)};Qe("\u72C0\u614B",Ls(pe.status).label),Qe("\u958B\u59CB",pe.started_at?$e(pe.started_at):"\u2014"),Qe("\u7D50\u675F",pe.finished_at?$e(pe.finished_at):"\u2014"),Qe("\u8017\u6642",ut),Qe("\u9032\u5EA6",kt(pe.percent));for(let ht of pe.extraDetails||[]){if(!ht)continue;let[x,N]=ht;Qe(x,N)}Qe("\u8AAA\u660E",pe.detail);let Et={...pe,duration_ms:pe.computedDuration,contribution_percent:je.length?(Number(pe.percent)||0)/je.length:null,message:pe.detail};return`<details class="rag-wf-stage index-wf-stage ${Ke}" data-index-stage="${r(pe.key)}"${ri.has(pe.key)?" open":""} style="--stage-color:${r(pe.color)}" ${Rl(Et)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="index-wf-step">${String(ze+1).padStart(2,"0")}</span> ${r(pe.label)}</strong><small>${r(pe.caption||"")}</small></span>
            </span>
            <span class="rag-wf-stage-meta">${r(ut)}${r(vt)}${te?` \xB7 ${te}`:""} \xB7 ${r(Ls(pe.status).label)} <span class="rag-wf-chevron">${p("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px">${xe}</span>
        </summary>
        <div class="rag-wf-details">${De.join("")}${pe.htmlDetails||""}</div>
      </details>`}).join("");return`<section class="report-card processing-card processing-workflow-progress-card index-wf-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${p("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
      <span class="badge ${t.run_status==="running"?"badge-info":"badge-neutral"}">${c(C)} / ${c(je.length)} \u968E\u6BB5</span>
    </div>
    <div class="index-wf-summary">
      <span>\u6574\u9AD4 <strong class="mono">${D}</strong></span>
      <span>\u7248\u672C <strong class="mono">${r(ne)}</strong></span>
      <span>Collection <strong class="mono">${r(l.collection||"\u2014")}</strong></span>
      <span>\u6A21\u5F0F <strong>${r(K||"\u2014")}</strong></span>
      <span>Host <strong class="mono">${r(Le)}</strong></span>
      <span>Model <strong class="mono">${r(Ze)}</strong></span>
      <span>\u76EE\u524D <strong>${r(he)}</strong></span>
    </div>
    <div class="index-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${J>0?r(Os(J)):"\u2014"}</span>
      </div>
      <div class="rag-wf-legend index-wf-are-legend" aria-label="\u5224\u6C7A\u7D22\u5F15 R\uFF0FE \u984F\u8272\u5716\u4F8B">
        <span><i class="is-reuse"></i>R \u672C\u6B21\u6CBF\u7528\uFF0804 \u85CD\uFF09</span>
        <span><i class="is-embed"></i>E \u65B0 embedding\uFF0804 \u7D2B\uFF09</span>
        <span><i class="is-hollow"></i>04 \u672A\u5B8C\u6210\uFF0825% \u6DFA\u8272\uFF09</span>
      </div>
      <div class="rag-wf-stages">${et}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7684\u7D50\u675F\u5373\u4E0B\u4E00\u968E\u6BB5\u7684\u958B\u59CB\uFF1B\u5DF2\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u9032\u884C\u4E2D\u6216\u672A\u5B8C\u6210\u968E\u6BB5\u53EA\u8457\u8272\u5DF2\u5B8C\u6210\u6BD4\u4F8B\uFF0C\u5176\u9918\u672A\u5B8C\u6210\u5340\u6BB5\u4EE5\u540C\u8272 25% \u6DFA\u8272\u8868\u793A\uFF0C\u7B49\u5F85\u968E\u6BB5\u4FDD\u7559\u7A7A\u5FC3\u8ECC\u9053\u3001\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\u3002\u6975\u77ED\u968E\u6BB5\u6703\u4EE5\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u5448\u73FE\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u9032\u5EA6\u8207\u8A73\u7D30\u6578\u64DA\u3002</p>
    </div>
    <div class="index-wf-overall">
      <div class="index-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${D}</span>
      </div>
      <div class="index-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,Te)).toFixed(1)}%"></span>
      </div>
    </div>
  </section>`}function Kp(e){if(e.id==="index_versions")return Vp(e);let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${p("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u5404\u968E\u6BB5\u8207\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </section>`;let a=Date.now(),n=s.map(F=>{let ke=String(F.status||"idle");return{...F,status:ke,computedDuration:Qp(F,a),drawable:!["pending","skipped","idle"].includes(ke)}}),i=n.filter(F=>F.status!=="skipped"),o=n.filter(F=>F.drawable).reduce((F,ke)=>F+ke.computedDuration,0),l=Math.max(o,Number(t.duration_ms)||0,1),d=n.some(F=>F.computedDuration>0),m=1.25,f=n.map(F=>F.drawable?Math.max(F.computedDuration/l*100,m):0),y=f.reduce((F,ke)=>F+ke,0),v=y>100?100/y:1,u=0,b=n.map((F,ke)=>{let ne=f[ke]*v,Se=F.drawable?{start:u,width:ne}:null;return Se&&(u+=ne),{...F,bar:Se}}),w=n.filter(F=>["success","no_change"].includes(F.status)).length,k=n.find(F=>F.status==="running"),A=n.filter(F=>F.status==="running").length,S=n.filter(F=>["pending","idle"].includes(F.status)).length,$=n.filter(F=>F.status==="skipped").length,T=i.length||Number(t.total_stages)||0,K=t.overall_percent,G=K==null||K===""?null:Number(K),fe=Number.isFinite(G)?kt(G):"\u2014",ye=d?Os(l):"\u2014",ie=String(t.run_status||""),L=ie?Ls(ie).label:"\u2014",q=k&&(k.label||k.key)||"\u2014",j=n.map(F=>Date.parse(F.started_at||"")).filter(F=>Number.isFinite(F)),V=n.map(F=>Date.parse(F.finished_at||"")).filter(F=>Number.isFinite(F)),de=j.length?new Date(Math.min(...j)).toISOString():null,z=k?null:V.length?new Date(Math.max(...V)).toISOString():null,Z=b.map((F,ke)=>{let ne=F.status,Se=["failed","stale","interrupted"].includes(ne),Pe=[`is-${ne}`,Se?"is-error":"",["pending","skipped","idle"].includes(ne)?"is-missing":"",ne==="running"?"is-running":""].filter(Boolean).join(" "),Le=F.drawable?Os(F.computedDuration):"\u2014",Ze=Ls(ne).label,he=ne==="failed"?`\u539F\u56E0\uFF1A${String(F.error||F.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002").trim()}
\u5EFA\u8B70\uFF1A${String(F.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002").trim()}`:"",oe=he?`<span class="badge badge-danger is-failure-tip" tabindex="0" aria-label="${r(he)}" data-failure-tip="${r(he)}"><span class="status-dot is-danger"></span>\u5931\u6557</span>`:r(Ze),ce=Al(F),ve=Se?"var(--danger)":ce,je=ne==="running"?` \xB7 ${kt(F.percent)}`:"",Te="";if(F.bar){let J=Math.max(0,Math.min(100,F.bar.start)),we=Math.max(0,Math.min(100-J,F.bar.width)),Oe=["success","no_change"].includes(ne)?100:Math.max(0,Math.min(100,Number(F.percent)||0)),Ve=we*Oe/100,ct=we-Ve;Ve>0&&(Te+=`<span class="rag-wf-bar workflow-wf-bar is-sequential" style="left:${J.toFixed(3)}%;width:${Ve.toFixed(4)}%;top:0;height:12px;--bar-color:${r(ve)}" aria-hidden="true"></span>`),ct>1e-4&&(Te+=`<span class="rag-wf-bar workflow-wf-bar is-hollow is-sequential" style="left:${(J+Ve).toFixed(3)}%;width:${ct.toFixed(4)}%;top:0;height:12px;--bar-color:${r(ve)}" aria-hidden="true"></span>`)}let C=F.label||F.key||"\u968E\u6BB5",D=Jp(F),W=`${C}\uFF1A${Ze}\uFF0C${ne==="running"?`\u9032\u5EA6 ${kt(F.percent)}\uFF0C`:""}\u8017\u6642 ${Le}`,I={...F,duration_ms:F.computedDuration,message:he||F.message||D||""},H=`${e.id}:${F.key||ke}`;return`<details class="rag-wf-stage workflow-wf-stage ${Pe}" data-workflow-wf-stage="${r(H)}"${ii.has(H)?" open":""} style="--stage-color:${r(ce)}" ${Rl(I)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="workflow-wf-step">${String(ke+1).padStart(2,"0")}</span> ${r(C)}</strong>${D?`<small>${r(D)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(Le)}${r(je)} \xB7 ${oe} <span class="rag-wf-chevron">${p("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(W)}">${Te}</span>
        </summary>
        <div class="rag-wf-details">${Wp(F,Le)}</div>
      </details>`}).join(""),qe=hp[e.id]||"";return`<section class="report-card processing-card processing-workflow-progress-card workflow-wf-card" data-workflow-progress>
    <div class="side-card-head index-runtime-head workflow-wf-head">
      <span class="side-card-title">${p("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
      <div class="index-runtime-metrics workflow-wf-metrics">
        <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u5168\u90E8\u968E\u6BB5\u7684\u6578\u91CF\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${w} / ${T}</strong></span>
        <span class="index-runtime-metric" title="\u76EE\u524D\u57F7\u884C\u4E2D\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u57F7\u884C\u4E2D</span><strong>${A}</strong></span>
        <span class="index-runtime-metric" title="\u5C1A\u672A\u958B\u59CB\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7B49\u5F85</span><strong>${S}</strong></span>
        <span class="index-runtime-metric" title="\u672C\u6B21\u6D41\u7A0B\u4E0D\u9700\u8981\u57F7\u884C\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7565\u904E</span><strong>${$}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u968E\u6BB5\u8017\u6642\u5408\u8A08\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(ye)}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u53C3\u8207\u968E\u6BB5\u5B8C\u6210\u6BD4\u4F8B\u7684\u5E73\u5747\u3002"><span>\u6574\u9AD4\u9032\u5EA6</span><strong>${fe}</strong></span>
      </div>
    </div>
    <div class="workflow-wf-summary">
      <span>\u57F7\u884C <strong>${r(L)}</strong></span>
      <span>\u958B\u59CB <strong>${de?r($e(de)):"\u2014"}</strong></span>
      <span>\u7D50\u675F <strong>${k?"\u9032\u884C\u4E2D":z?r($e(z)):"\u2014"}</strong></span>
      <span>\u76EE\u524D <strong>${r(q)}</strong></span>
      <span>Run <strong class="mono">${r(t.run_id||"\u2014")}</strong></span>
    </div>
    <div class="workflow-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${r(ye)}</span>
      </div>
      <div class="rag-wf-legend workflow-wf-legend" aria-label="\u968E\u6BB5\u72C0\u614B\u5716\u4F8B">
        <span><i class="is-solid-state"></i>\u5B8C\u6210</span>
        <span><i class="is-hollow-state"></i>\u672A\u5B8C\u6210\uFF0825% \u6DFA\u8272\uFF09</span>
        <span><i class="is-progress-state"></i>\u57F7\u884C\u4E2D\uFF08\u9032\u5EA6\u689D\uFF09</span>
        <span><i class="is-empty-state"></i>\u7B49\u5F85\uFF0F\u7565\u904E</span>
      </div>
      <div class="rag-wf-stages">${Z}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7684\u7D50\u675F\u5373\u4E0B\u4E00\u968E\u6BB5\u7684\u958B\u59CB\uFF1B\u5DF2\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u57F7\u884C\u4E2D\u6216\u672A\u5B8C\u6210\u968E\u6BB5\u53EA\u8457\u8272\u5DF2\u5B8C\u6210\u6BD4\u4F8B\uFF0C\u5176\u9918\u672A\u5B8C\u6210\u5340\u6BB5\u4EE5\u540C\u8272 25% \u6DFA\u8272\u8868\u793A\uFF0C\u7B49\u5F85\u968E\u6BB5\u4FDD\u7559\u7A7A\u5FC3\u8ECC\u9053\u3001\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\u3002\u6975\u77ED\u968E\u6BB5\u6703\u4EE5\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u5448\u73FE\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u9032\u5EA6\u8207\u8A73\u7D30\u6578\u64DA\u3002</p>
    </div>
    <div class="workflow-wf-overall">
      <div class="workflow-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${fe}</span>
      </div>
      <div class="workflow-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,Number.isFinite(G)?G:0)).toFixed(1)}%"></span>
      </div>
    </div>
    ${qe?`<p class="processing-workflow-scope-note">${p("info",12)}<span>${r(qe)}</span></p>`:""}
  </section>`}function Rn(e){let t=String(e||"");return t.length===6?`${t.slice(0,4)}-${t.slice(4)}`:t||"\u2014"}function Pl(e){return e?.scan_order==="issue_month"?"\u7D22\u5F15\u6383\u63CF\u9806\u5E8F\u4F9D\u6708\u4EFD\u7531\u820A\u5230\u65B0\uFF1B\u540C\u6708\u4EFD\u518D\u4F9D\u532F\u5165 ID\u3002":"\u6B64 run \u662F\u820A\u7248\u6383\u63CF\u9806\u5E8F\uFF08\u4F9D\u532F\u5165 ID\uFF0C\u975E\u6708\u4EFD\u9806\u5E8F\uFF09\uFF1B\u65B0 run \u624D\u6703\u7531\u6700\u820A\u6708\u4EFD\u958B\u59CB\u3002"}function Yp(e,t=!1){let s=Number(e?.reused),a=Number(e?.embedded);if(!Number.isFinite(s)||!Number.isFinite(a)||s<=0&&a<=0)return"";let n=[];if(s>0&&n.push(`<span class="index-current-phase is-reuse"
      title="R \xB7 \u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF0C\u672C\u6279 ${c(s)} \u7B46">
      <strong>R</strong><span>\u6CBF\u7528 ${c(s)} \u7B46</span>
    </span>`),a>0){let i=e.phase==="embedding"&&t?"\u8A08\u7B97\u4E2D":"\u65B0 embedding";n.push(`<span class="index-current-phase is-embed"
      title="E \xB7 \u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding\uFF0C\u672C\u6279 ${c(a)} \u7B46">
      <strong>E</strong><span>${i} ${c(a)} \u7B46</span>
    </span>`)}return`<span class="index-current-phases" aria-label="\u672C\u6279\u6B21 R\uFF0FE \u52D5\u4F5C">
    <span class="index-current-phase-label">\u672C\u6279</span>
    ${n.join("")}
  </span>`}function Xp(e){let t=Array.isArray(e.months)?e.months:[],s=new Map;for(let n of t){let i=String(n.month||"");if(!/^\d{6}$/.test(i))continue;let o=s.get(i);o||(o={total:0,processed:0},s.set(i,o)),o.total+=Number(n.total)||0,o.processed+=Number(n.processed)||0}let a=0;for(let n of s.values())n.total>0&&n.processed>=n.total&&(a+=1);return{completed:a,total:s.size}}function Sl(e){let t=String(e||"").match(/(\d{8})Update/i);return t?Number(t[1]):0}function Zt(e){let t=Number(e);return Number.isFinite(t)&&t>0?t:0}function xl(e,t){let s=Zt(t),a=Zt(e);if(s<=0)return{processed:0,total:0,percent:null,fill:0,complete:!1,empty:!0,stateClass:"is-empty"};let n=Math.min(100,Math.round(a/s*1e3)/10),i=a>=s;return{processed:a,total:s,percent:n,fill:i?100:n,complete:i,empty:!1,stateClass:i?"is-complete":"is-incomplete"}}function Il(e){let t=Array.isArray(e.months)?e.months:[],s=e.current||{},a=!!s.preparing&&e.scan_order==="issue_month",n=new Map;for(let i of t){let o=String(i.month||"");if(!/^\d{6}$/.test(o))continue;let l=Number(o.slice(4,6));if(l<1||l>12)continue;let d=n.get(o);d||(d={key:o,year:o.slice(0,4),monthNo:l,rows:[],archives:[],current:!1,preparing:!1,currentArchive:"",jid:""},n.set(o,d));let m=String(i.archive||"");d.rows.push({archive:m,total:Zt(i.total),processed:Zt(i.processed)}),m&&d.archives.push(m),!a&&s.month===o&&(!s.archive||s.archive===m)&&(d.current=!0,d.preparing=!!s.preparing,d.currentArchive=String(s.archive||m||""),d.jid=String(s.jid||""))}return n}function Zp(e){let t=Il(e),s=e.summary||{},a=e.copy||{},n=Zt(s.total),i=Zt(a.total),o=t.size,l=i>0?Math.min(i,n||i):0,d=i>0?Math.max(0,(n||i)-i):n,m=Zt(s.reused),f=Zt(s.embedded);return{totalMonths:o,reusePool:l,reused:m,reusePercent:l>0?Math.min(100,100*m/l):null,embedPool:d,embedded:f,embedPercent:d>0?Math.min(100,100*f/d):null}}function em(e){let t=Zp(e);if(!t.totalMonths)return"";let s=[],a=(n,i,o,l,d)=>{let m=l===null?0:Math.max(0,Math.min(100,l));s.push(`<div class="index-wf-are-row ${n}">
      <span class="index-wf-are-label"><i aria-hidden="true"></i>${r(i)}</span>
      <span class="index-wf-are-value">${r(o)}${d?`<small>${r(d)}</small>`:""}</span>
      <span class="index-wf-are-track" aria-hidden="true"><span style="width:${m.toFixed(1)}%"></span></span>
    </div>`)};return(t.reusePool>0||t.reused>0)&&a("is-reuse","R \u672C\u6B21\u6CBF\u7528",`${c(t.reused)} / ${c(t.reusePool)} \u7B46`,t.reusePercent,"04 \u9010\u6708\u6CBF\u7528"),t.embedPool>0?a("is-embed","E \u672C\u6B21\u65B0 embedding",`${c(t.embedded)} / ${c(t.embedPool)} \u7B46`,t.embedPercent,"E backlog"):a("is-embed is-complete","E \u672C\u6B21\u65B0 embedding","\u7121 E backlog",100,"\u4E0D\u9700\u65B0 embedding"),`<div class="index-wf-are-breakdown" aria-label="R\uFF0FE \u5206\u6D41">
    <div class="index-wf-are-head"><strong>R\uFF0FE \u5206\u6D41</strong><span>\u5169\u689D bar \u5404\u81EA\u4EE5\u81EA\u5DF1\u7684 total \u8A08\u7B97\uFF0C\u4E0D\u53EF\u76F8\u52A0\uFF1B\u7686\u70BA\u672C\u6B21 run\u3002</span></div>
    ${s.join("")}
  </div>`}function tm(e){let t=e.current||{},s=!!e.coverage_only,a=e.active_archive_coverage||{},n=Il(e);if(!n.size)return'<div class="processing-workflow-empty">\u5C1A\u7121\u53EF\u986F\u793A\u7684\u7D22\u5F15\u6708\u4EFD\uFF1B\u958B\u59CB\u7D22\u5F15\u5F8C\u6703\u4F9D\u6642\u9593\u5217\u51FA\u6708\u4EFD\u72C0\u614B\u3002</div>';let i={reuseComplete:0,reuseIncomplete:0,embedComplete:0,embedIncomplete:0};for(let u of n.values()){let b=[...u.rows].sort((z,Z)=>Sl(Z.archive)-Sl(z.archive)),w=b[0],k=b.length>1?b.slice(1):[w],S=(a[u.key]||{})[w.archive],$=Zt(S?.total),T=Zt(S?.processed),K=$>0&&T>=$,G=k.reduce((z,Z)=>z+Z.total,0),fe=k.reduce((z,Z)=>z+Z.processed,0),ye=w.total,ie=w.processed,L=xl(fe,G),q=!s&&K,de=xl(q?T:ie,q?$:ye);u.latest=w,u.baselineRows=k,u.reuseState=L,u.embedState=de,u.reuseComplete=L.complete,u.embedComplete=de.complete,u.embedNoBacklog=q,L.complete?i.reuseComplete+=1:i.reuseIncomplete+=1,de.complete?i.embedComplete+=1:i.embedIncomplete+=1}let l=[...new Set([...n.values()].map(u=>u.year))].sort((u,b)=>b.localeCompare(u)).map(u=>{let b=Array.from({length:12},(w,k)=>{let A=k+1,S=`${u}${String(A).padStart(2,"0")}`,$=n.get(S);if(!$)return`<td class="judgment-month is-empty"><span>${A}</span></td>`;let T=$.current&&e.run_status==="running",K=j=>j.percent===null?"\u2014":`${j.percent}%`,G=j=>j.empty?"\u7121\u8CC7\u6599":j.complete?"\u5B8C\u6210":"\u672A\u5B8C\u6210",fe=String(t.phase||"")==="embedding"?"E \u65B0 embedding":String(t.phase||"")==="reuse"?"R \u91CD\u7528":"R\uFF0FE",ye=$.latest&&$.latest.total>0?`${(100*$.latest.processed/$.latest.total).toFixed(1)}%`:"\u2014",ie=$.current&&$.latest?`\u672C\u6B21 run ${fe} ${c($.latest.processed)} / ${c($.latest.total)}\uFF08${ye}\uFF09`:"",L=[`${$.year}-${String($.monthNo).padStart(2,"0")}`,$.archives.join("\u3001")||"\u2014",`R \u672C\u6B21\u6CBF\u7528 ${c($.reuseState.processed)} / ${c($.reuseState.total)}\uFF08${K($.reuseState)}\uFF09\xB7 ${G($.reuseState)}`,$.embedNoBacklog?`E \u7121 E backlog\uFF08latest archive \u5DF2\u7531 active \u7248\u672C\u8986\u84CB ${c($.embedState.total)} \u7B46\uFF1B\u4E0D\u9700\u65B0 embedding\uFF09`:`E \u65B0 embedding ${c($.embedState.processed)} / ${c($.embedState.total)}\uFF08${K($.embedState)}\uFF09\xB7 ${G($.embedState)}`,$.reuseComplete?"":"\u5F85\u5B8C\u6210\uFF1AR \u65E2\u6709\u5411\u91CF\u91CD\u7528",$.embedComplete?"":"\u5F85\u5B8C\u6210\uFF1AE \u65B0 embedding",ie,$.current?`${$.preparing?"\u6E96\u5099\u7D22\u5F15":T?"\u76EE\u524D\u7D22\u5F15":"\u6700\u5F8C\u7D22\u5F15"} \xB7 ${fe}${$.jid?` \xB7 ${$.jid}`:""}`:""].filter(Boolean).join(" \xB7 "),q=[["is-reuse",$.reuseState],["is-embed",$.embedState]].map(([j,V])=>`<span class="index-month-block ${j} ${V.stateClass}" style="--fill:${V.fill.toFixed(1)}%"></span>`).join("");return`<td class="judgment-month index-month index-month-are processing-month is-neutral${T?" is-current":""}" title="${r(L)}"${T?' aria-current="true"':""}><span class="index-month-number">${A}</span><span class="index-month-blocks" aria-hidden="true">${q}</span></td>`}).join("");return`<tr><th scope="row">${r(u)}</th>${b}</tr>`}).join(""),d=e.copy||{},m=Zt(d.total),f=Zt(d.copied),y=d.status==="success"?"\u5B8C\u6210":d.status==="running"?"\u57F7\u884C\u4E2D":d.status==="stale"?"\u4E2D\u6B62":"\u7B49\u5F85";return`<div class="judgment-months index-months">
    ${!s&&m>0?`<div class="index-copy-global-chip" title="03 \u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF\u662F\u5168\u57DF points \u6E96\u5099\u968E\u6BB5\uFF0C\u4E0D\u5217\u5165\u6708\u4EFD R\uFF0FE\uFF1BR \u662F 04 \u9010\u6708\u6383\u63CF\u9032\u5EA6\u3002">
          <span class="badge badge-neutral">03 \u8907\u88FD\uFF08\u5168\u57DF\uFF09</span>
          <span class="mono">${c(f)} / ${c(m)} points</span>
          <span>\xB7 ${r(y)} \xB7 \u4E0D\u5217\u5165\u6708\u4EFD R\uFF0FE</span>
        </div>`:""}
    <div class="index-runtime-summary index-month-are-summary">
      <span title="R \u5B8C\u6210\uFF1A\u672C\u6B21 run \u5DF2\u8655\u7406\u5B8C\u6210\u7684\u6708\u4EFD\u6578\uFF1B\u5C1A\u672A\u6383\u5230\u7684\u6708\u4EFD\u4E0D\u5217\u5165\u5B8C\u6210\uFF1B\u4EE5\u6708\u4EFD\u8A08\u3002">R \u5B8C\u6210\u6708\u4EFD <strong class="mono">${c(i.reuseComplete)}</strong></span>
      <span title="R \u672A\u5B8C\u6210\uFF1A\u672C\u6B21 run \u5C1A\u672A\u5B8C\u6210 R \u7684\u6708\u4EFD\u6578\uFF1B\u5305\u542B\u5C1A\u672A\u6383\u5230\u7684\u5F8C\u7E8C\u6708\u4EFD\uFF1B\u4EE5\u6708\u4EFD\u8A08\u3002">R \u672A\u5B8C\u6210\u6708\u4EFD <strong class="mono">${c(i.reuseIncomplete)}</strong></span>
      <span title="E \u5B8C\u6210\uFF1Alatest archive \u5DF2\u5B8C\u6574\u8986\u84CB\u3001\u7121\u9700\u65B0 embedding \u7684\u6708\u4EFD\u6578\uFF1B\u5305\u542B\u672A\u8B8A\u66F4\u6708\u4EFD\uFF1B\u4EE5\u6708\u4EFD\u8A08\uFF0C\u4E0D\u662F RAR \u6A94\u6578\u3002">E \u5B8C\u6210\u6708\u4EFD <strong class="mono">${c(i.embedComplete)}</strong></span>
      <span title="E \u672A\u5B8C\u6210\uFF1Alatest archive \u4ECD\u6709\u5F85\u88DC\u65B0 embedding \u7684\u6708\u4EFD\u6578\uFF1B\u4EE5\u6708\u4EFD\u8A08\uFF0C\u4E0D\u662F RAR \u6A94\u6578\u3002">E \u672A\u5B8C\u6210\u6708\u4EFD <strong class="mono">${c(i.embedIncomplete)}</strong></span>
      <span>\u7E3D\u6708\u4EFD <strong class="mono">${c(n.size)}</strong></span>
    </div>
    <div class="index-month-are-key processing-timeline-legend" aria-label="R\uFF0FE \u968E\u6BB5\u5716\u4F8B">
      <span class="processing-timeline-legend-label">04 \u6708\u4EFD\uFF08\u672C\u6B21 run\uFF09</span>
      <span><i class="is-reuse"></i>R \xB7 \u672C\u6B21\u6CBF\u7528\u65E2\u6709\u5411\u91CF</span>
      <span><i class="is-embed"></i>E \xB7 \u672C\u6B21\u65B0 embedding</span>
    </div>
    <div class="index-month-are-key processing-timeline-legend" aria-label="\u7D22\u5F15\u6708\u4EFD\u72C0\u614B\u5716\u4F8B">
      <span class="processing-timeline-legend-label">\u72C0\u614B</span>
      <span><i class="processing-timeline-swatch is-solid-state"></i>\u5B8C\u6210</span>
      <span><i class="processing-timeline-swatch is-hollow-state"></i>\u672A\u5B8C\u6210\uFF08\u672A\u5B8C\u6210\u5340\u6BB5 25% \u6DFA\u8272\uFF09</span>
      <span><i class="processing-timeline-swatch is-progress-state"></i>\u57F7\u884C\u4E2D\uFF08\u9032\u5EA6\u689D\uFF09</span>
      <span><i class="processing-timeline-swatch is-empty"></i>\u7121\u8CC7\u6599\uFF08\u7A7A\u5FC3\uFF09</span>
    </div>
    <div class="index-month-are-key processing-timeline-legend" aria-label="\u7D22\u5F15\u6708\u4EFD\u6846\u7DDA\u5716\u4F8B">
      <span class="processing-timeline-legend-label">\u6846\u7DDA</span>
      <span><i class="processing-timeline-swatch is-current-frame"></i>\u76EE\u524D\u7D22\u5F15\u6708\u4EFD\uFF08\u5BE6\u7DDA\uFF09</span>
    </div>
    <div class="judgment-months-scroll">
      <table class="judgment-months-table index-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(u,b)=>`<th scope="col">${b+1}</th>`).join("")}</tr></thead>
        <tbody>${l}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA R\uFF08\u672C\u6B21\u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF09\u3001E\uFF08\u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding\uFF09\uFF0C\u5169\u683C\u90FD\u662F\u672C\u6B21 run \u7684\u9032\u5EA6\uFF1B\u5B8C\u6210\u70BA\u5BE6\u5FC3\uFF1B\u672A\u5B8C\u6210\u6642\u5DF2\u5B8C\u6210\u6BD4\u4F8B\u70BA\u5BE6\u8272\u3001\u5269\u9918\u5340\u6BB5\u70BA\u540C\u8272 25% \u6DFA\u8272\uFF0C\u56E0\u6B64 0% \u6642\u6574\u683C\u90FD\u662F\u6DFA\u8272\uFF1B\u7121\u8CC7\u6599\u624D\u662F\u6DE1\u8272\u7A7A\u5FC3\u3002\u6700\u65B0 archive \u5DF2\u88AB active collection \u5B8C\u6574\u8986\u84CB\uFF08\u7121 E backlog\uFF09\u7684\u672A\u8B8A\u66F4\u6708\u4EFD\uFF0CE \u53EF\u4F7F\u7528 active \u8986\u84CB\u986F\u793A\u5B8C\u6210\uFF1BR \u4E00\u5F8B\u4F7F\u7528\u672C\u6B21 run \u7684 processed\uFF0Ftotal\uFF0C\u5C1A\u672A\u6383\u5230\u7684\u5F8C\u7E8C\u6708\u4EFD\u7DAD\u6301 25% \u6DFA\u8272\u3002\u4ECD\u6709 E backlog \u7684\u6708\u4EFD\uFF0CR\uFF0FE \u90FD\u4F7F\u7528\u672C\u6B21 run \u7684 processed\uFF0Ftotal\u3002E \u7121 backlog \u6642\u82E5\u986F\u793A\u5BE6\u5FC3\uFF0Ctooltip \u6703\u6A19\u793A\u4E0D\u9700\u65B0 embedding\u300203 \u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF\u662F\u5168\u57DF points \u6E96\u5099\u968E\u6BB5\uFF0C\u4E0D\u6703\u91CD\u8907\u756B\u6210\u6708\u4EFD\u5206\u683C\uFF1BR \u662F 04 \u9010\u6708\u6383\u63CF\u9032\u5EA6\u3002summary \u8207\u65B9\u584A\u4F7F\u7528\u540C\u4E00\u4EFD\u72C0\u614B\uFF0Csidebar \u66F4\u65B0 badge \u53E6\u4EE5 E backlog \u6708\u4EFD\u8A08\u3002\u540C\u4E00\u6708\u4EFD\u53EF\u80FD\u6709\u591A\u500B archive\uFF0CR \u4F7F\u7528\u8F03\u820A\u7684\u57FA\u7DDA archive\uFF0CE \u4F7F\u7528\u540D\u7A31\u4E2D\u66F4\u65B0\u65E5\u671F\u6700\u65B0\u7684 archive\uFF1B\u65B0\u820A archive \u4E0D\u6703\u76F8\u52A0\u3002E \u5B8C\u6210\uFF0F\u672A\u5B8C\u6210\u4EE5\u6708\u4EFD\u8A08\uFF0C\u4E0D\u662F RAR \u6A94\u6578\u3002${Pl(e)}\u7DA0\u6846\u53EA\u6A19\u793A\u76EE\u524D\u6279\u6B21\u6240\u5728\u6708\u4EFD\u3002\u76EE\u524D\u7D22\u5F15\u6708\u4EFD\u4EE5\u5BE6\u7DDA\u5916\u6846\u6A19\u793A\uFF0Cpadding \u4E0D\u4F7F\u7528\u72C0\u614B\u5E95\u8272\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B R\uFF0FE \u9032\u5EA6\u8207\u76EE\u524D\u6848\u865F\u3002</p>
  </div>`}function sm(e){let t=e.import_timeline||{},s=Array.isArray(t.months)?t.months:[];if(!s.length)return`<section class="report-card processing-card import-files-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u672A\u53D6\u5F97\u5224\u6C7A\u4E0B\u8F09 manifest \u6216\u672C\u6A5F\u58D3\u7E2E\u6A94\uFF1B\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u5F8C\u6703\u986F\u793A\u6708\u4EFD\u72C0\u614B\u3002</div>
    </section>`;let a=new Map(s.map(v=>[String(v.month),v])),n=[...new Set(s.map(v=>v.year))].sort((v,u)=>u-v),i=["extract","raw_parquet","filter","postgres"],o=t.stage_labels||{},l=n.map(v=>{let u=Array.from({length:12},(b,w)=>{let k=w+1,A=`${v}${String(k).padStart(2,"0")}`,S=a.get(A);return ci({month:S,year:v,monthNo:k,stageOrder:i,stageLabels:o,stageStatuses:S?.import_stages||{},stageProgress:S?.import_stage_progress||{},overall:S?.import_overall||"empty",active:!!S?.active,processing:String(S?.month||"")===String(t.processing_month||""),workflowForStage:()=>"judgment_import",variant:"import"})}).join("");return`<tr><th scope="row">${r(v)}</th>${u}</tr>`}).join(""),d=t.summary||{},m=t.stage_summary||{},f=s.find(v=>v.active),y=f?`<div class="index-current-row">${Ml({activeMonth:t.active_month||String(f.month||""),activeArchive:t.active_archive||f.active_archive||"",activePhase:t.active_phase||"",processingMonth:t.processing_month||"",processingArchive:t.processing_archive||"",stageLabels:o})}</div>`:"";return`<section class="report-card processing-card import-files-card" data-import-timeline="judgment">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${p("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
      ${Sp(t,s,m,d)}
    </div>
    ${y}
    <div class="judgment-months index-months">
      <div class="index-month-are-key processing-timeline-legend" aria-label="\u968E\u6BB5\u984F\u8272\u5716\u4F8B">
        <span class="processing-timeline-legend-label">\u968E\u6BB5</span>
        <span><i class="processing-timeline-swatch is-extract"></i>RAR \u6AA2\u67E5\uFF0F\u89E3\u58D3\u7E2E</span>
        <span><i class="processing-timeline-swatch is-raw-parquet"></i>\u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD</span>
        <span><i class="processing-timeline-swatch is-filter"></i>\u91D1\u878D\u6CD5\u898F\u7BE9\u9078</span>
        <span><i class="processing-timeline-swatch is-postgres"></i>PostgreSQL metadata</span>
      </div>
      <div class="index-month-are-key processing-timeline-legend" aria-label="\u968E\u6BB5\u72C0\u614B\u5716\u4F8B">
        <span class="processing-timeline-legend-label">\u72C0\u614B</span>
        <span><i class="processing-timeline-swatch is-solid-state"></i>\u5B8C\u6210</span>
        <span><i class="processing-timeline-swatch is-pending-state"></i>\u5F85\u66F4\u65B0\uFF08\u6DFA\u8272\uFF09</span>
        <span><i class="processing-timeline-swatch is-hollow-state"></i>\u672A\u5B8C\u6210\uFF0825% \u6DFA\u8272\uFF09</span>
        <span><i class="processing-timeline-swatch is-progress-state"></i>\u57F7\u884C\u4E2D\uFF08\u9032\u5EA6\u689D\uFF09</span>
        <span><i class="processing-timeline-swatch is-empty"></i>\u7121\u8CC7\u6599</span>
      </div>
      <div class="index-month-are-key processing-timeline-legend" aria-label="\u6846\u7DDA\u5716\u4F8B">
        <span class="processing-timeline-legend-label">\u6846\u7DDA</span>
        <span><i class="processing-timeline-swatch is-current-frame"></i>\u76EE\u524D\u532F\u5165\uFF08\u5BE6\u7DDA\uFF09</span>
        <span><i class="processing-timeline-swatch is-processing-frame"></i>\u5BE6\u969B\u8655\u7406\uFF08\u865B\u7DDA\uFF09</span>
      </div>
      <div class="judgment-months-scroll">
        <table class="judgment-months-table import-months-table index-months-table processing-months-table">
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(v,u)=>`<th scope="col">${u+1}</th>`).join("")}</tr></thead>
          <tbody>${l}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\uFF1ARAR \u6AA2\u67E5\uFF0F\u89E3\u58D3\u7E2E\u3001\u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD\u3001\u91D1\u878D\u6CD5\u898F\u7BE9\u9078\u3001PostgreSQL metadata\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF1B\u6709\u5F85\u66F4\u65B0\u6A94\u6848\u6642\uFF0C\u5C1A\u672A\u91CD\u505A\u7684\u56DB\u500B\u968E\u6BB5\u65B9\u683C\u4EE5\u6DFA\u6A58\uFF0F\u6DFA\u7D05\uFF0F\u6DFA\u7D2B\uFF0F\u6DFA\u85CD\u8868\u793A\uFF0C\u5B8C\u6210\u5F8C\u8F49\u70BA\u5BE6\u5FC3\u6DF1\u8272\uFF1B\u5C1A\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF1B\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u5B8C\u6210\u8272\u5782\u76F4\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u672A\u5B8C\u6210\u5340\u6BB5\u7DAD\u6301 25% \u6DFA\u8272\uFF1B\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u539F\u59CB\u8CC7\u6599\u968E\u6BB5\u6703\u5148\u6AA2\u67E5\u65E2\u6709 Parquet\uFF0C\u53EF\u6CBF\u7528\u6642\u4E0D\u91CD\u65B0\u5099\u4EFD\uFF1B\u7F3A\u5C11\u6642\u6703\u986F\u793A\u300C\u5EFA\u7ACB YYYY-MM \u5099\u4EFD\u300D\uFF0C\u5B8C\u6210\u5F8C\u986F\u793A\u300C\u5DF2\u5EFA\u7ACB\u5099\u4EFD\u300D\u3002\u7BE9\u9078\u8207 PostgreSQL \u968E\u6BB5\u6703\u986F\u793A\u76EE\u524D\u8655\u7406\u7684\u6708\u4EFD\u8207 archive\u3002\u5BE6\u7DDA\u6846\u6A19\u793A\u76EE\u524D\u532F\u5165\u6708\u4EFD\uFF1B\u82E5\u5BE6\u969B\u8655\u7406\u7684\u662F\u8F03\u820A\u6708\u4EFD\uFF0C\u8A72\u6708\u53E6\u4EE5\u865B\u7DDA\u6846\u6A19\u793A\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u56DB\u500B\u968E\u6BB5\u7684\u72C0\u614B\u3001\u672C\u6A5F\u58D3\u7E2E\u6A94\u8207\u5DF2\u532F\u5165\u6A94\u540D\u3002</p>
    </div>
  </section>`}function Dl(e,t,s){let n=[t.run_id||e.active_run?.id||e.last_run?.id||"",t.version_id??"",t.collection||"",t.started_at||""].join("|"),i=Date.now(),o=fl.get(n);if(!o){let v=Date.parse(t.started_at||""),u=Date.parse(t.finished_at||""),b=Date.parse(t.updated_at||"");t.run_status!=="running"&&Number.isFinite(v)&&(Number.isFinite(u)||Number.isFinite(b))?o={at:v,indexed:0}:o={at:i,indexed:Math.max(0,s)},fl.set(n,o)}let l=Date.parse(t.finished_at||""),d=Date.parse(t.updated_at||""),m=t.run_status==="running"?i:Number.isFinite(l)?l:Number.isFinite(d)?d:i,f=Math.max(0,(m-Number(o.at||0))/1e3),y=Math.max(0,Number(s)-Number(o.indexed||0));return f<=0||y<=0?0:y/f}function Os(e){let t=Number(e);return!Number.isFinite(t)||t<0?"\u2014":t>=36e5?Bl(t):ge(t)}function Bl(e){if(!Number.isFinite(e)||e<0)return"\u2014";let t=Math.max(0,Math.round(e/1e3)),s=Math.floor(t/3600),a=Math.floor(t%3600/60),n=t%60,i=String(n).padStart(2,"0");return s>0?`${s}h ${String(a).padStart(2,"0")}m ${i}s`:a>0?`${a}m ${i}s`:`${n}s`}function Fl(e,t,s,a){let n=Date.parse(e.started_at||"");if(!Number.isFinite(n))return{elapsedMs:null,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let i=e.run_status==="running",o=Date.parse(e.finished_at||""),l=Date.parse(e.updated_at||""),d=i?Date.now():Number.isFinite(o)?o:Number.isFinite(l)?l:Date.now(),m=Math.max(0,d-n),f=Number(s),y=Number(t);if(!Number.isFinite(f)||f<=0)return{elapsedMs:m,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let v=Math.max(0,f-Math.max(0,Number.isFinite(y)?y:0));if(v<=0)return{elapsedMs:m,estimatedTotalMs:m,remainingMs:0,remainingCount:0};if(!i||a<=0)return{elapsedMs:m,estimatedTotalMs:null,remainingMs:null,remainingCount:v};let u=v/a*1e3;return{elapsedMs:m,estimatedTotalMs:m+u,remainingMs:u,remainingCount:v}}function am(e){let t=e.index_runtime||{};if(!t.available)return"";let s=!!t.coverage_only,a=Pl(t),n=t.current||{},i=t.summary||{},o=Number(i.indexed??n.indexed??0),l=s?0:Dl(e,t,o),d=Xp(t),m=s?null:Fl(t,o,i.total,l),f=m?.remainingCount>0?`\u8207\u5269\u9918 ${c(m.remainingCount)} \u7B46`:"",y=l>0?`\u4F9D\u672C\u6B21\u5E73\u5747 ${l.toFixed(1)} \u7B46/\u79D2${f}\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002\u5BE6\u969B\u901F\u5EA6\u6703\u96A8 embedding \u8207\u6279\u6B21\u5927\u5C0F\u8B8A\u52D5\u3002`:"\u5C1A\u7121\u8DB3\u5920\u7684\u672C\u9801\u89C0\u5BDF\u8CC7\u6599\u53EF\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002",v=$=>r(Bl(m?m[$]:null)),u=`<div class="index-runtime-metrics">
    <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u7D22\u5F15\u7684\u6708\u4EFD\u6578\uFF1B\u76EE\u524D\u8655\u7406\u4E2D\u7684\u6708\u4EFD\u4E0D\u5217\u5165\uFF0C\u7E3D\u6578\u70BA\u7D22\u5F15\u7BC4\u570D\u5167\u7684\u6709\u6548\u6708\u4EFD\u3002">
      <span>\u5DF2\u8655\u7406\u6708\u4EFD</span>
      <strong>${c(d.completed)} / ${c(d.total)}</strong>
    </span>
    <span class="index-runtime-metric" title="\u5DF2\u7D22\u5F15\u7B46\u6578 / \u7D22\u5F15\u7BC4\u570D\u7E3D\u7B46\u6578\u3002">
      <span>\u5DF2\u8655\u7406\u7B46\u6578</span>
      <strong>${c(o)} / ${c(i.total)}</strong>
    </span>
    <span class="index-runtime-metric" title="\u81EA\u672C\u6B21\u9801\u9762\u958B\u59CB\u89C0\u5BDF\u7684\u7D2F\u8A08\u5E73\u5747\uFF1B\u4E2D\u9014\u52A0\u5165\u4EE5\u9996\u6B21\u89C0\u5BDF\u6642\u9593\u8207\u7B46\u6578\u70BA\u57FA\u6E96\u3002\u5F8C\u6BB5\u82E5\u4EE5\u65B0 embedding \u70BA\u4E3B\uFF0C\u901F\u5EA6\u6703\u4E0B\u964D\u3002">
      <span>\u672C\u6B21\u5E73\u5747</span>
      <strong>${l>0?`${l.toFixed(1)} \u7B46/\u79D2`:"\u2014"}</strong>
    </span>
    <span class="index-runtime-metric" title="\u81EA\u672C\u6B21\u7D22\u5F15 run \u958B\u59CB\u6642\u9593 ${r($e(t.started_at))} \u8D77\u7B97\uFF1B\u4E2D\u9014\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002">
      <span>Elapsed Time</span>
      <strong>${v("elapsedMs")}</strong>
    </span>
    <span class="index-runtime-metric" title="Elapsed Time \u52A0\u4E0A\u4F9D\u5269\u9918\u4EF6\u6578\u8207\u672C\u6B21\u5E73\u5747\u901F\u5EA6\u4F30\u7B97\u7684\u5269\u9918\u6642\u9593\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u5F9E 0 \u91CD\u65B0\u8A08\u6642\u3002">
      <span>Estimated Total</span>
      <strong>${v("estimatedTotalMs")}</strong>
    </span>
    <span class="index-runtime-metric" title="${r(y)}">
      <span>Time Remaining</span>
      <strong>${v("remainingMs")}</strong>
    </span>
  </div>`,b=t.run_status==="running"?n.preparing?"\u6E96\u5099\u4E2D":"\u76EE\u524D\u8655\u7406":"\u6700\u5F8C\u8655\u7406",w=!!n.preparing&&t.scan_order==="issue_month",k=t.copy||{},A=Number(k.total)>0?`\u8907\u88FD ${c(k.copied)} / ${c(k.total)} points`:"\u5EFA\u7ACB\u65B0\u7248\u672C collection",S=w?`<div class="index-current-row">
        <span class="badge badge-info" title="${r(a)}">${p("activity",11)}\u6E96\u5099\u4E2D</span>
        <span class="index-current-copy">${r(A)}\uFF1B\u7248\u672C\u6E96\u5099\u5B8C\u6210\u5F8C\u6703\u5F9E\u6700\u820A\u6708\u4EFD\u958B\u59CB\u7D22\u5F15\uFF0C\u7B2C\u4E00\u6279\u958B\u59CB\u524D\u4E0D\u6A19\u793A\u76EE\u524D\u6708\u4EFD\u3002</span>
      </div>`:n.jid?`<div class="index-current-row">
        <span class="badge badge-info" title="${r(a)}">${p("activity",11)}${b}</span>
        <strong class="mono">${r(Rn(n.month))}</strong>
        <span class="mono">${r(n.archive||"\u2014")}</span>
        ${n.preparing?"":Yp(n,t.run_status==="running")}
        <span class="mono">${r(n.jid||"\u2014")}</span>
        <span class="index-current-copy">${r([n.court,n.title].filter(Boolean).join(" \xB7 ")||"\u2014")}</span>
        <span class="faint">${n.preparing?"\u6E96\u5099\u4E2D":`\u6279\u6B21 ${c(n.batch_size)} \u7B46`}</span>
      </div>`:"";return`<section class="report-card processing-card index-files-card">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${p("table",14)}04 \u91D1\u878D\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6708\u4EFD R\uFF0FE</span>
      ${u}
    </div>
    ${t.error?`<div class="processing-update-notice index-runtime-error">${p("alert",13)}<span>${r(t.error)}</span></div>`:""}
    <div class="index-runtime-summary">
      <span>\u7248\u672C <strong class="mono">v${r(t.version_id??"\u2014")}</strong></span>
      <span>Collection <code>${r(t.collection||"\u2014")}</code></span>
      <span>\u6A21\u5F0F <strong>${r(t.build_mode||"\u2014")}</strong></span>
      <span>\u6383\u63CF\u9806\u5E8F <strong>${r(t.scan_order==="issue_month"?"\u6708\u4EFD\uFF08\u820A\u2192\u65B0\uFF09":"ID\uFF08\u820A run\uFF09")}</strong></span>
      ${s?"":`<span>\u91CD\u7528 <strong class="mono">${c(i.reused)}</strong></span>
            <span>\u65B0 embedding <strong class="mono">${c(i.embedded)}</strong></span>`}
    </div>
    ${S}
    ${tm(t)}
    ${s?'<p class="judgment-months-hint index-coverage-note">\u76EE\u524D\u6C92\u6709\u672C\u6B21\u7D22\u5F15 run\uFF1BR\uFF0FE \u6642\u9593\u8868\u6703\u5728\u7248\u672C\u5EFA\u7F6E\u958B\u59CB\u5F8C\u986F\u793A\u672C\u6B21\u9032\u5EA6\u3002</p>':""}
  </section>`}function nm(e={}){let{storage:t,loading:s,error:a}=e;if(a)return`<section class="report-card processing-card index-storage-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
        <button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-index-storage">${p("refresh",12)}<span>\u91CD\u65B0\u6574\u7406</span></button>
      </div>
      <div class="processing-workflow-empty">${r(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card index-storage-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
        <span class="badge badge-neutral">${s?"\u8B80\u53D6\u4E2D":"\u5C1A\u7121"}</span>
      </div>
      <div class="processing-workflow-empty">${s?"\u6B63\u5728\u53D6\u5F97 Docker \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u2026":"\u5207\u63DB\u5230\u6B64\u6D41\u7A0B\u5F8C\u6703\u8B80\u53D6 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002"}</div>
    </section>`;let n=t.qdrant_storage||{},o=(Array.isArray(t.databases)?t.databases:[]).find(f=>f.id==="qdrant")||{},l=n.volume_bytes??o.volume_bytes??null,d=n.points_count??o.points_count,m=n.segments_count??o.segments_count;return`<section class="report-card processing-card index-storage-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
      <button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-index-storage">${p("refresh",12)}<span>\u91CD\u65B0\u6574\u7406</span></button>
    </div>
    <div class="index-storage-grid">
      <span>Docker \u4E3B\u6A5F</span><strong>${r(n.host||"\u2014")} <span class="faint">(${r(n.docker_context||"default")})</span></strong>
      <span>Container</span><strong class="mono">${r(n.container||"judgment-qdrant")} \xB7 ${r(n.container_state||"unknown")}</strong>
      <span>Image</span><strong class="mono">${r(n.image||"\u2014")}</strong>
      <span>\u5BB9\u5668\u5167\u8DEF\u5F91</span><strong class="mono">${r(n.container_path||"\u2014")}</strong>
      <span>Docker volume</span><strong class="mono">${r(n.volume_name||"\u2014")}</strong>
      <span>Volume \u5BB9\u91CF</span><strong class="mono">${Ce(l)}${n.volume_size?` \xB7 ${r(n.volume_size)}`:""}</strong>
      <span>Volume \u4F86\u6E90\u8DEF\u5F91</span><strong class="mono index-storage-path">${r(n.host_path||"\u2014")}</strong>
      <span>Collection</span><strong class="mono">${r(n.collection||o.collection||"\u2014")}</strong>
      <span>Alias</span><strong class="mono">${r(n.alias||"\u2014")}</strong>
      <span>Points\uFF0FSegments</span><strong class="mono">${c(d)} / ${c(m)}</strong>
    </div>
    <div class="index-runtime-foot">\u8CC7\u6599\u6642\u9593 ${r($e(t.checked_at))}</div>
  </section>`}function pi({badge:e="",lead:t="",rows:s=[],note:a=""}){return`<section class="report-card processing-card parquet-help-card workflow-help-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("info",14)}\u529F\u80FD\u8AAA\u660E</span>
      ${e?`<span class="badge badge-neutral">${r(e)}</span>`:""}
    </div>
    <div class="parquet-help-body">
      <p class="parquet-help-lead">${t}</p>
      <div class="parquet-help-grid">${s.map(([n,i])=>`<span>${r(n)}</span><strong>${i}</strong>`).join("")}</div>
      ${a?`<p class="parquet-help-note">${a}</p>`:""}
    </div>
  </section>`}function rm(){return pi({badge:"\u552F\u8B80\u532F\u51FA",lead:"\u5C07 PostgreSQL \u76EE\u524D\u6709\u6548\u7684\u5224\u6C7A\uFF08<code>judgment_documents.is_current = true</code>\uFF09\u532F\u51FA\u6210\u7368\u7ACB\u7684 Parquet \u5FEB\u7167\uFF0C\u4F9B\u96E2\u7DDA\u5206\u6790\u3001\u8CC7\u6599\u4EA4\u63DB\u6216\u4FDD\u5B58\u3002",rows:[["\u4F86\u6E90","PostgreSQL <code>judgment_documents</code>\uFF0C\u53EA\u542B\u76EE\u524D\u6709\u6548\u4E14\u5DF2\u547D\u4E2D\u91D1\u878D\u6CD5\u898F\u6E05\u55AE\u7684\u5224\u6C7A\u3002"],["\u8F38\u51FA",'<span class="mono">JUDGMENT_DATA_DIR/parquet/judgments/YYYYMMDD/HHMMSS-xxxxxxxx/judgments.parquet</span>'],["\u9644\u5E36\u6A94",'<span class="mono">\u540C\u76EE\u9304 manifest.json\uFF08\u7B46\u6578\u3001\u6A94\u6848\u5927\u5C0F\u3001\u6B04\u4F4D\u3001\u7522\u751F\u6642\u9593\uFF09</span>'],["\u5167\u5BB9","\u6848\u865F\u3001\u6CD5\u9662\u3001\u6848\u7531\u3001\u5168\u6587\u3001\u547D\u4E2D\u6CD5\u898F\u3001\u5F15\u7528\u3001\u4F86\u6E90\u58D3\u7E2E\u6A94\u8207\u6642\u9593\u6B04\u4F4D\uFF1B<code>citations</code> \u4EE5 JSON \u5B57\u4E32\u4FDD\u5B58\u3002"],["\u8207\u539F\u59CB Parquet","\u8CC7\u6599\u9801\u8207 <code>source=parquet</code> \u4F7F\u7528 <code>parquet/raw_judgments/.../raw.parquet</code>\uFF1B\u672C\u6D41\u7A0B\u7684 <code>parquet/judgments/...</code> \u662F\u53E6\u4E00\u500B\u6B63\u898F\u5316\u5FEB\u7167\u3002"],["\u4E0D\u6703","\u4E0D\u5BEB\u56DE PostgreSQL\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u820A\u5FEB\u7167\uFF1B\u53EA\u532F\u51FA current \u8CC7\u6599\uFF0C\u4E0D\u542B\u6B77\u53F2\u7248\u672C\u3002"],["\u4E2D\u65B7","\u6BCF\u6B21\u57F7\u884C\u5EFA\u7ACB\u65B0\u7684\u5B8C\u6574\u5FEB\u7167\uFF1B\u4E2D\u65B7\u5F8C\u91CD\u65B0\u57F7\u884C\u4E0D\u6703\u7E8C\u5BEB\u540C\u4E00\u500B Parquet \u6A94\u3002"]],note:"\u9069\u5408 DuckDB\u3001pandas\u3001Spark \u7B49\u96E2\u7DDA\u5206\u6790\uFF0C\u6216\u9700\u8981\u56FA\u5B9A\u6642\u9593\u9EDE\u7684\u53EF\u91CD\u73FE\u8CC7\u6599\u5FEB\u7167\u3002\u65E5\u5E38 RAG \u67E5\u8A62\u8207\u8CC7\u6599\u9801\u700F\u89BD\u4E0D\u9700\u8981\u57F7\u884C\u6B64\u6D41\u7A0B\u3002"})}function im(){return pi({badge:"PostgreSQL \u56DE\u586B",lead:"\u5C07\u5224\u6C7A\u7684 <code>court</code> \u8F49\u6210\u6A19\u6E96\u6CD5\u9662\u540D\u7A31\u4E26\u5BEB\u5165 <code>court_normalized</code>\uFF1B\u539F\u59CB <code>court</code> \u6703\u4FDD\u7559\u4F9B\u8FFD\u6EAF\u3002",rows:[["\u8655\u7406\u7BC4\u570D","\u9810\u8A2D\u53EA\u8655\u7406 <code>court_normalized</code> \u70BA\u7A7A\u7684\u8CC7\u6599\uFF1B\u5DF2\u6B63\u898F\u5316\u8CC7\u6599\u6703\u8DF3\u904E\uFF0C\u53EF\u7528 <code>--all</code> \u91CD\u65B0\u8A08\u7B97\u5168\u90E8\u3002"],["\u89E3\u6790\u9806\u5E8F","\u539F\u59CB\u6CD5\u9662\u503C\u958B\u982D\u7B26\u5408\u6A19\u6E96\u540D\u7A31 \u2192 \u5224\u6C7A\u5168\u6587\u524D 8,000 \u5B57\u6700\u65E9\u51FA\u73FE\u7684\u6CD5\u9662 \u2192 \u539F\u59CB\u6CD5\u9662\u503C\u4EFB\u610F\u4F4D\u7F6E\u7684\u6A19\u6E96\u540D\u7A31 \u2192 JID \u5B98\u65B9\u6CD5\u9662\u4EE3\u78BC\u3002"],["\u8F38\u51FA","\u5BEB\u5165 <code>judgment_documents.court_normalized</code>\uFF1B\u4E0D\u4FEE\u6539\u539F\u59CB <code>court</code>\u3001\u5168\u6587\u6216\u5176\u4ED6\u5224\u6C7A\u6B04\u4F4D\u3002"],["\u672A\u89E3\u6790","\u7121\u6CD5\u5224\u65B7\u6642\u4FDD\u7559\u7A7A\u503C\uFF0C\u4E0D\u731C\u6E2C\uFF1B\u6458\u8981\u6703\u5217\u51FA\u672A\u89E3\u6790\u7B46\u6578\u8207\u5E38\u898B\u6A23\u672C\u3002"],["\u5F71\u97FF","\u8CC7\u6599\u9801\u7684\u6CD5\u9662\u4E0B\u62C9\u3001\u7CBE\u78BA\u7BE9\u9078\u3001\u6392\u5E8F\u3001\u7D50\u679C\u6B04\u4F4D\u8207\u5224\u6C7A\u539F\u6587\u4F7F\u7528\u6B63\u898F\u5316\u540D\u7A31\uFF1BAPI \u4ECD\u56DE\u50B3 <code>court_raw</code>\u3002"],["\u4E0D\u6703","\u4E0D\u91CD\u65B0\u532F\u5165\u5224\u6C7A\u3001\u4E0D\u6539\u5168\u6587\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u8CC7\u6599\u3002"],["\u91CD\u8DD1","\u9810\u8A2D\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u898F\u5247\u66F4\u65B0\u5F8C\u53EF\u7528 <code>--all</code> \u91CD\u7B97\uFF0C\u6216\u5148\u7528 <code>--dry-run</code> \u7D71\u8A08\u3002"]],note:"\u9069\u5408\u5728\u5224\u6C7A\u532F\u5165\u5F8C\u3001\u6CD5\u9662\u540D\u7A31\u898F\u5247\u66F4\u65B0\u5F8C\uFF0C\u6216\u8CC7\u6599\u9801\u6CD5\u9662\u9078\u9805\u51FA\u73FE\u7F3A\u6F0F\u6642\u57F7\u884C\u3002\u7D50\u679C\u4E5F\u6703\u5BEB\u5165\u6548\u80FD\u7D00\u9304\u3002"})}function om(){return pi({badge:"\u689D\u6587\u6B77\u53F2\u5EFA\u6A94",lead:"\u70BA\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u5EFA\u7ACB <code>law_article_versions</code> \u6B77\u53F2\u689D\u6587\u5FEB\u7167\u8207 <code>law_article_change_events</code> \u8B8A\u66F4\u7D00\u9304\uFF0C\u8B93\u8CC7\u6599\u9801\u80FD\u5207\u63DB\u6B77\u53F2\u7248\u672C\u4E26\u67E5\u770B\u689D\u6587\u5DEE\u7570\u3002",rows:[["\u4F86\u6E90","PostgreSQL \u6CD5\u898F\u7248\u672C\uFF0C\u4EE5\u53CA <code>LAW_DATA_DIR/raw_parquet</code> \u5167\u5C0D\u61C9\u7684\u539F\u59CB\u6CD5\u898F Parquet \u5FEB\u7167\u3002"],["\u5339\u914D\u65B9\u5F0F","\u4EE5 raw Parquet manifest \u7684 <code>zip_sha256</code>\uFF0F<code>raw_json_sha256</code> \u5C0D\u61C9\u6CD5\u898F\u7248\u672C\uFF0C\u4E0D\u731C\u6E2C\u5167\u5BB9\u3002"],["\u7522\u751F\u5167\u5BB9","<code>article_key</code>\uFF08\u689D\u6587\u985E\u578B\uFF0B\u689D\u865F\uFF09\u3001<code>content_hash</code>\u3001\u689D\u6587\u5168\u6587\u8207\u751F\u6548\u65E5\uFF1B\u8207\u524D\u4E00\u7248\u672C\u6BD4\u8F03\u5F8C\u8A18\u9304 <code>added</code>\uFF0F<code>modified</code>\uFF0F<code>removed</code>\u3002"],["\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB","\u5206\u9801\u4E0A\u65B9\u7684\u552F\u8B80\u6AA2\u67E5\u6703\u8B80\u53D6 <code>law_article_versions</code> \u8207\u539F\u59CB Parquet\uFF0C\u5224\u65B7\u7248\u672C\u662F\u5426\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\uFF1B\u6AA2\u67E5\u672C\u8EAB\u4E0D\u6703\u4FEE\u6539\u8CC7\u6599\u5EAB\u3002"],["\u53EF\u5EFA\u7ACB","\u627E\u5230\u5C0D\u61C9\u539F\u59CB Parquet \u7684\u7248\u672C\uFF0C\u53EF\u76F4\u63A5\u57F7\u884C\u6B64\u6D41\u7A0B\u5EFA\u7ACB\u689D\u6587\u6B77\u53F2\u3002"],["\u7F3A\u539F\u59CB\u6A94","\u627E\u4E0D\u5230\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u6A19\u793A\u7121\u6CD5\u5EFA\u7ACB\uFF0C\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD\uFF1B\u6B64\u6D41\u7A0B\u6703\u8DF3\u904E\u4E26\u5217\u5728 <code>missing_versions</code>\u3002"],["\u6AA2\u67E5\u7D50\u679C","\u5E74\u4EFD\xD7\u6708\u4EFD\u8868\u986F\u793A\u5DF2\u5EFA\u7ACB\uFF0F\u672A\u5EFA\u7ACB\uFF0F\u90E8\u5206\u5EFA\u7ACB\uFF1B\u4E0B\u65B9\u5217\u51FA\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u7248\u672C\u65E5\u671F\u8207\u53EF\u5EFA\u7ACB\u72C0\u614B\u3002\u76EE\u524D\u72C0\u614B\u4EE5\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u5361\u7247\u5373\u6642\u986F\u793A\u3002"],["\u8DF3\u904E\u689D\u4EF6","\u5DF2\u6709\u689D\u6587\u5FEB\u7167\u7684\u7248\u672C\u6703\u8DF3\u904E\uFF1B\u627E\u4E0D\u5230\u53EF\u8B80\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u5217\u5165 <code>missing_versions</code>\uFF0C\u4E0D\u5EFA\u7ACB\u865B\u69CB\u689D\u6587\u3002"],["\u4E0D\u6703","\u4E0D\u4E0B\u8F09\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u4E0D\u89E3\u6790\u65B0 ZIP\u3001\u4E0D\u4FEE\u6539 <code>law_documents</code> \u6216\u76EE\u524D\u7248\u672C\u3001\u4E0D\u66F4\u65B0 Qdrant\uFF0FIndexedDB\u3002"],["\u8F38\u51FA\u6458\u8981","\u7248\u672C\u6578\u3001\u8DF3\u904E\u7248\u672C\u6578\u3001\u7F3A\u5C11\u5FEB\u7167\u7248\u672C\u3001\u5BEB\u5165\u689D\u6587\u6578\u8207\u689D\u6587\u8B8A\u66F4\u4E8B\u4EF6\u6578\u3002"],["\u91CD\u8DD1","\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u5DF2\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u4E0D\u6703\u91CD\u8907\u63D2\u5165\u3002"]],note:"\u9069\u5408\u5F9E\u820A\u7248 schema \u5347\u7D1A\u3001\u65E2\u6709\u6CD5\u898F\u7248\u672C\u7F3A\u5C11\u6B77\u53F2\u689D\u6587\uFF0C\u6216\u8CC7\u6599\u9801\u6B77\u53F2\u689D\u6587\u7248\u672C\u8207\u8B8A\u66F4\u7D00\u9304\u4E0D\u5B8C\u6574\u6642\u57F7\u884C\u3002\u57F7\u884C\u524D\u53EF\u5148\u7528\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u78BA\u8A8D\u54EA\u4E9B\u7248\u672C\u53EF\u5EFA\u7ACB\u3001\u54EA\u4E9B\u7F3A\u539F\u59CB\u6A94\u3002"})}function lm(e={}){let t=e.courtCheck,s=!!e.courtCheckLoading,a=e.courtCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-court-check"${s?" disabled":""}>${p("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31"}</span></button>`;if(a)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">${r(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">${s?'<span class="spinner" aria-hidden="true"></span> \u6B63\u5728\u6AA2\u67E5\u5404\u6708\u4EFD\u6CD5\u9662\u540D\u7A31\u2026':"\u9032\u5165\u6B64\u5206\u9801\u5F8C\u6703\u81EA\u52D5\u6AA2\u67E5\uFF1B\u4E5F\u53EF\u6309\u300C\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u300D\u91CD\u65B0\u8B80\u53D6\u3002"}</div>
    </section>`;let i=Array.isArray(t.months)?t.months:[],o=t.summary||{},l=t.totals||{};if(!i.length)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u6AA2\u67E5\u7684\u5224\u6C7A\u8CC7\u6599\u3002</div>
    </section>`;let d={green:"\u5DF2\u6AA2\u67E5",red:"\u9700\u6B63\u898F\u5316\uFF08\u5B8C\u5168\u672A\u6AA2\u67E5\uFF09",gray:"\u9700\u6B63\u898F\u5316"},m=new Map(i.map(v=>[String(v.month),v])),y=[...new Set(i.map(v=>v.year))].sort((v,u)=>u-v).map(v=>{let u=Array.from({length:12},(b,w)=>{let k=w+1,A=`${v}${String(k).padStart(2,"0")}`,S=m.get(A);if(!S)return`<td class="judgment-month is-empty"><span>${k}</span></td>`;let $=d[S.status]?S.status:"red",T=[`${v}-${String(k).padStart(2,"0")}`,d[$],`\u7E3D ${c(S.total)} \u7B46`,`\u5DF2\u6AA2\u67E5 ${c(S.checked)} \u7B46`,`\u672A\u6AA2\u67E5 ${c(S.unchecked)} \u7B46`,S.invalid?`\u7121\u6548\u503C ${c(S.invalid)} \u7B46`:"",`\u6709\u6548 ${kt(S.percent)}`].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month court-check-month is-${$==="gray"?"red":$}" title="${r(T)}"><span>${k}</span></td>`}).join("");return`<tr><th scope="row">${r(v)}</th>${u}</tr>`}).join("");return`<section class="report-card processing-card court-check-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
      ${n}
    </div>
    <div class="judgment-months">
      <div class="judgment-months-meta">
        <span class="badge badge-ok">\u5DF2\u6AA2\u67E5 ${c(o.green||0)}</span>
        <span class="badge badge-danger">\u9700\u6B63\u898F\u5316 ${c((o.red||0)+(o.gray||0))}</span>
        <span class="muted">\u5171 ${c(i.length)} \u500B\u6708</span>
      </div>
      <div class="index-runtime-summary">
        <span>\u5224\u6C7A\u7E3D\u6578 <strong class="mono">${c(l.total)}</strong></span>
        <span>\u5DF2\u6AA2\u67E5 <strong class="mono">${c(l.checked)}</strong></span>
        <span>\u672A\u6AA2\u67E5 <strong class="mono">${c(l.unchecked)}</strong></span>
        <span>\u7121\u6548\u503C <strong class="mono">${c(l.invalid)}</strong></span>
        <span>\u6709\u6548 <strong class="mono">${c(l.valid)}</strong></span>
      </div>
      <div class="judgment-months-scroll">
        <table class="judgment-months-table court-check-months-table">
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(v,u)=>`<th scope="col">${u+1}</th>`).join("")}</tr></thead>
          <tbody>${y}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u5168\u90E8\u5DF2\u6B63\u898F\u5316\uFF1B\u7D05\u8272\uFF1A\u9700\u6B63\u898F\u5316\uFF08\u542B\u5B8C\u5168\u672A\u6AA2\u67E5\u3001\u90E8\u5206\u672A\u6B63\u898F\u5316\u6216\u7121\u6548\u503C\uFF09\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002summary \u7684\u7D05\u8272\u6578\u5B57\u70BA\u9700\u6B63\u898F\u5316\u6708\u4EFD\u6578\uFF1B\u4E0B\u65B9\u660E\u7D30\u4ECD\u4FDD\u7559\u672A\u6AA2\u67E5\u8207\u7121\u6548\u503C\u7B46\u6578\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u8A73\u7D30\u7B46\u6578\u8207\u6709\u6548\u6BD4\u4F8B\u3002</p>
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r($e(t.checked_at))} \xB7 \u6A19\u6E96\u6CD5\u9662\u540D\u7A31 ${c(t.canonical_count)} \u500B</div>
    </div>
  </section>`}function cm(e={}){let t=e.lawVersionCheck,s=!!e.lawVersionCheckLoading,a=e.lawVersionCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-law-version-check"${s?" disabled":""}>${p("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB"}</span></button>`;if(a)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">${r(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">${s?'<span class="spinner" aria-hidden="true"></span> \u6B63\u5728\u6AA2\u67E5\u7248\u672C\u8207\u6B77\u53F2\u689D\u6587\u2026':"\u9032\u5165\u6B64\u5206\u9801\u5F8C\u6703\u81EA\u52D5\u6AA2\u67E5\uFF1B\u4E5F\u53EF\u6309\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u91CD\u65B0\u8B80\u53D6\u3002"}</div>
    </section>`;let i=Array.isArray(t.months)?t.months:[],o=t.summary||{},l=t.totals||{};if(!i.length)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">\u8CC7\u6599\u5EAB\u76EE\u524D\u6C92\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u8CC7\u6599\u3002</div>
    </section>`;let d={green:"\u5DF2\u5EFA\u7ACB",red:"\u672A\u5EFA\u7ACB",gray:"\u90E8\u5206\u5EFA\u7ACB"},m=new Map(i.map(ie=>[String(ie.month),ie])),y=[...new Set(i.map(ie=>ie.year))].sort((ie,L)=>L-ie).map(ie=>{let L=Array.from({length:12},(q,j)=>{let V=j+1,de=`${ie}${String(V).padStart(2,"0")}`,z=m.get(de);if(!z)return`<td class="judgment-month is-empty"><span>${V}</span></td>`;let Z=d[z.status]?z.status:"red",qe=[`${ie}-${String(V).padStart(2,"0")}`,d[Z],`\u7248\u672C ${c(z.version_count)}\uFF08\u6CD5\u898F ${c(z.law_versions)}\uFF0F\u547D\u4EE4 ${c(z.order_versions)}\uFF09`,`\u5DF2\u5EFA\u7ACB ${c(z.backfilled_count)}`,`\u672A\u5EFA\u7ACB ${c(z.missing_count)}`,`\u9700\u5EFA\u7ACB ${c(z.needs_backfill_count)}\uFF08\u53EF\u5EFA\u7ACB ${c(z.backfillable_count)}\uFF0F\u7F3A\u539F\u59CB\u6A94 ${c(z.blocked_count)}\uFF09`,`\u689D\u6587\u5217 ${c(z.article_rows)} / \u9810\u671F ${c(z.article_count)}`,z.current?"\u76EE\u524D\u7248\u672C":"",z.versions?.length?`\u7248\u672C ${z.versions.map(F=>`#${F.version_id}`).join("\u3001")}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month law-version-month is-${Z}${z.current?" is-current":""}" title="${r(qe)}"><span>${V}</span></td>`}).join("");return`<tr><th scope="row">${r(ie)}</th>${L}</tr>`}).join(""),v={law:"\u6CD5\u898F",order:"\u547D\u4EE4"},u=i.flatMap(ie=>(ie.versions||[]).filter(L=>L.needs_backfill).map(L=>({...L,month:ie.month}))).sort((ie,L)=>L.version_id-ie.version_id),b=u.slice(0,20),w=b.map(ie=>{let L=ie.backfillable?"badge-info":ie.blocked?"badge-danger":"badge-neutral",q=ie.backfillable?"\u53EF\u5EFA\u7ACB":ie.blocked?"\u7F3A\u539F\u59CB\u6A94":"\u5F85\u6AA2\u67E5";return`<div class="law-backfill-needed-row">
        <strong class="mono">#${ie.version_id}</strong>
        <span class="badge ${L}">${q}</span>
        <span>${r(v[ie.source_type]||ie.source_type||"\u2014")}</span>
        <span class="mono">${r(ie.update_date||ie.month||"\u2014")}</span>
        <span class="law-backfill-needed-reason">${r(ie.reason||"\u2014")}</span>
      </div>`}).join(""),k=u.length?`<div class="law-backfill-needed">
        <div class="law-backfill-needed-head">\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C <span class="badge badge-warn">${c(u.length)}</span></div>
        <div class="law-backfill-needed-list">${w}</div>
        ${u.length>b.length?`<div class="law-backfill-needed-more">\u53E6\u6709 ${c(u.length-b.length)} \u500B\u7248\u672C\u672A\u5217\u51FA</div>`:""}
      </div>`:'<div class="law-backfill-needed is-clear">\u76EE\u524D\u6C92\u6709\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3002</div>',A=Number(l.needs_backfill_versions)||0,S=Number(l.backfillable_versions)||0,$=Number(l.blocked_versions)||0,T=Number(l.backfilled_versions)||0,K=Number(l.versions)||0,G=A<=0?"ok":$>0?"danger":"warn",fe=A<=0?"\u4E0D\u9700\u8981\u5EFA\u7ACB":"\u9700\u8981\u5EFA\u7ACB",ye=A>0?`\u9700\u8981\u5EFA\u7ACB ${c(A)} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF1A\u53EF\u5EFA\u7ACB ${c(S)}\u3001\u7F3A\u539F\u59CB\u6A94 ${c($)}\u3002\u5DF2\u6709\u6B77\u53F2\u689D\u6587 ${c(T)} \u500B\u7248\u672C${$>0?"\uFF1B\u7F3A\u539F\u59CB\u6A94\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD":""}\u3002`:`\u76EE\u524D ${c(K)} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`;return`<section class="report-card processing-card law-version-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
      ${n}
    </div>
    <div class="law-version-check-status is-${G}" role="status" aria-live="polite">
      <span class="badge badge-${G}">${fe}</span>
      <span>${r(ye)}</span>
    </div>
    <div class="judgment-months">
      <div class="judgment-months-meta">
        <span class="badge badge-ok">\u5DF2\u5EFA\u7ACB ${c(o.green||0)}</span>
        <span class="badge badge-danger">\u672A\u5EFA\u7ACB ${c(o.red||0)}</span>
        <span class="badge badge-neutral">\u90E8\u5206\u5EFA\u7ACB ${c(o.gray||0)}</span>
        <span class="muted">\u5171 ${c(i.length)} \u500B\u6708</span>
      </div>
      <div class="index-runtime-summary">
        <span>\u7248\u672C\u6578 <strong class="mono">${c(l.versions)}</strong></span>
        <span>\u5DF2\u5EFA\u7ACB\u7248\u672C <strong class="mono">${c(l.backfilled_versions)}</strong></span>
        <span>\u672A\u5EFA\u7ACB\u7248\u672C <strong class="mono">${c(l.missing_versions)}</strong></span>
        <span>\u9700\u5EFA\u7ACB\u7248\u672C <strong class="mono">${c(l.needs_backfill_versions)}</strong></span>
        <span>\u53EF\u5EFA\u7ACB <strong class="mono">${c(l.backfillable_versions)}</strong></span>
        <span>\u7F3A\u539F\u59CB\u6A94 <strong class="mono">${c(l.blocked_versions)}</strong></span>
        <span>\u689D\u6587\u5217 <strong class="mono">${c(l.article_rows)}</strong></span>
        <span>\u9810\u671F\u689D\u6587 <strong class="mono">${c(l.article_count)}</strong></span>
        <span>\u6CD5\u898F\u7B46\u6578 <strong class="mono">${c(l.law_count)}</strong></span>
      </div>
      <div class="judgment-months-scroll">
        <table class="judgment-months-table law-version-months-table">
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(ie,L)=>`<th scope="col">${L+1}</th>`).join("")}</tr></thead>
          <tbody>${y}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u8A72\u6708\u4EFD\u6240\u6709\u7248\u672C\u90FD\u6709\u6B77\u53F2\u689D\u6587\uFF1B\u7D05\u8272\uFF1A\u5B8C\u5168\u672A\u5EFA\u7ACB\uFF1B\u7070\u8272\uFF1A\u90E8\u5206\u7248\u672C\u5DF2\u5EFA\u7ACB\uFF1B\u5916\u6846\uFF1A\u76EE\u524D\u7248\u672C\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u7248\u672C\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u6578\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u6578\u8207\u689D\u6587\u5217\u3002</p>
      ${k}
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r($e(t.checked_at))}</div>
    </div>
  </section>`}function dm(){return`<div class="processing-ollama-loading">
    <span class="spinner" aria-hidden="true"></span>
    <span>\u6B63\u5728\u6AA2\u67E5 llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span>
  </div>`}function um(e,t,s){let a=Array.isArray(e?.hosts)?e.hosts:[];if(s&&!a.length)return`${Ge({tone:"danger",title:"llama-server \u4E3B\u6A5F\u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
    <div class="processing-ollama-empty">
      <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh-ollama">
        ${p("refresh",13)}<span>\u91CD\u65B0\u6AA2\u67E5</span>
      </button>
    </div>`;if(!a.length)return t?dm():'<div class="processing-ollama-empty">\u5C1A\u672A\u8A2D\u5B9A llama-server \u4E3B\u6A5F\uFF1B\u8ACB\u5230\u300C\u7CFB\u7D71\u72C0\u614B \u2192 Model Provider\u300D\u65B0\u589E\u4E26\u9023\u63A5\u6A21\u578B\u3002</div>';let n=a.map((o,l)=>{let d=o.status==="operational",m=Array.isArray(o.models)?o.models:[],f=m.length?m.map(v=>`<span class="processing-ollama-model ${d?"is-online":"is-offline"}">${r(v.name||"")}</span>`).join(""):'<span class="processing-ollama-model is-offline">\u6C92\u6709\u53EF\u7528\u6A21\u578B</span>',y=[o.embedding_model?`<span class="processing-ollama-role ${d?"is-online":"is-offline"}">\u5D4C\u5165 \xB7 ${r(o.embedding_model)}</span>`:'<span class="processing-ollama-role is-offline">\u672A\u8A2D\u5B9A\u5D4C\u5165\u6A21\u578B</span>',o.chat_model?`<span class="processing-ollama-role is-offline">\u804A\u5929 \xB7 ${r(o.chat_model)}</span>`:""].filter(Boolean).join("");return`<article class="processing-ollama-host ${d?"is-online":"is-offline"}" data-ollama-host data-host-id="${Number(o.id)}">
        <span class="processing-ollama-handle" aria-hidden="true">${p("grid",14)}</span>
        <span class="processing-ollama-rank">${l+1}</span>
        <div class="processing-ollama-main">
          <div class="processing-ollama-title">
            <strong>${r(o.name||o.base_url||`\u4E3B\u6A5F #${o.id}`)}</strong>
            <span class="processing-ollama-status">${d?"\u53EF\u7528":"\u7121\u6CD5\u9023\u7DDA"}</span>
          </div>
          <span class="processing-ollama-url mono">${r(o.base_url||"\u2014")}</span>
          <div class="processing-ollama-models">${f}</div>
          <div class="processing-ollama-meta">${y}${o.detail?`<span class="processing-ollama-detail">${r(o.detail)}</span>`:""}</div>
        </div>
        <div class="processing-ollama-order">
          <button class="btn btn-ghost btn-sm" type="button"
            data-processing-action="move-ollama-host" data-direction="up"
            data-host-id="${Number(o.id)}"
            title="\u4E0A\u79FB\u512A\u5148\u9806\u5E8F" aria-label="\u4E0A\u79FB ${r(o.name||o.base_url||`\u4E3B\u6A5F #${o.id}`)}" ${l===0?"disabled":""}>\u2191</button>
          <button class="btn btn-ghost btn-sm" type="button"
            data-processing-action="move-ollama-host" data-direction="down"
            data-host-id="${Number(o.id)}"
            title="\u4E0B\u79FB\u512A\u5148\u9806\u5E8F" aria-label="\u4E0B\u79FB ${r(o.name||o.base_url||`\u4E3B\u6A5F #${o.id}`)}" ${l===a.length-1?"disabled":""}>\u2193</button>
        </div>
      </article>`}).join(""),i=a.find(o=>Number(o.id)===Number(e?.active_host_id))?.name||a[0]?.name||a[0]?.base_url||"\u2014";return`<div class="processing-ollama-summary">
      <span>\u5171 ${c(a.length)} \u53F0\u4E3B\u6A5F</span>
      <span>\u7B2C\u4E00\u512A\u5148\uFF1A<strong>${r(i)}</strong></span>
      <span class="muted">${t?"\u91CD\u65B0\u6AA2\u67E5\u4E2D\u2026":"\u6BCF 30 \u79D2\u81EA\u52D5\u6AA2\u67E5"}</span>
    </div>
    <div class="processing-ollama-list" data-ollama-list>${n}</div>
    <p class="processing-ollama-hint">\u62D6\u79FB\u6216\u4F7F\u7528\u7BAD\u982D\u8ABF\u6574 embedding \u512A\u5148\u9806\u5E8F\uFF1B\u76EE\u524D\u4E3B\u6A5F\u7121\u6CD5\u4F7F\u7528\u6642\uFF0C\u6703\u4F9D\u5E8F\u81EA\u52D5\u6539\u7528\u4E0B\u4E00\u53F0\uFF08\u5404\u53F0\u9700\u5177\u5099\u76F8\u540C\u7684 embedding \u6A21\u578B\uFF09\uFF0C\u76F4\u5230\u6709\u4E3B\u6A5F\u56DE\u50B3\u5411\u91CF\u3002</p>`}function pm(e,t={}){let s=e.active_run||null,a=s||e.last_run||null,n=Xt===e.id,i=!!s||n,o=!!e.can_run&&!i,l=i?"\u6B64\u6D41\u7A0B\u6B63\u5728\u57F7\u884C\u4E2D\u3002":e.start_blocked_reason||"\u76EE\u524D\u6709\u5176\u4ED6\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",d=Array.isArray(e.command)?e.command.join(" "):"",m=Number(e.update_count)||e.update_available&&Number(e.pending_count)||0,f=e.update_origin||"\u66F4\u65B0\u5075\u6E2C",y=e.update_mechanism||"\u65E2\u6709\u66F4\u65B0\u6AA2\u67E5\u7D00\u9304",v=e.update_message||e.update_status&&e.update_status.message||"\u627E\u5230\u53EF\u66F4\u65B0\u5167\u5BB9\u3002",u=e.update_status&&e.update_status.checked_at?$e(e.update_status.checked_at):"",b=e.progress||{},w=Array.isArray(b.stages)?b.stages:[],k=String(b.active_stage||""),A=w.find(G=>String(G.key||"")===k),S=(e.index_runtime&&e.index_runtime.current?e.index_runtime.current.month:"")||"",$=S?Rn(S):A&&(A.label||A.key)||"",T=n&&!s?"\u555F\u52D5\u4E2D":"\u57F7\u884C\u4E2D",K=`<section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${p(jl[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
        <span class="badge badge-neutral badge-mono">${r(e.branch||"")}</span>
      </div>
      <div class="processing-workflow-command-grid">
        <span>\u7A0B\u5F0F</span><code>${r(e.program||"\u2014")}</code>
        <span>Shell\uFF0F\u5165\u53E3</span><code>${r(e.script||"\u2014")}</code>
        <span>\u5BE6\u969B\u547D\u4EE4</span><code class="processing-workflow-command">${r(d||"\u2014")}</code>
      </div>
      ${ni.has(e.id)?'<div class="processing-embedding-strip-slot" data-processing-embedding-strip data-preserve-children></div>':""}
      <div class="processing-workflow-actions">
        <button class="btn btn-primary btn-sm" type="button"
          data-processing-action="run-workflow"
          data-workflow-id="${r(e.id)}"
          ${o?"":"disabled"}
          ${o?"":`title="${r(l)}"`}>
          ${i?'<span class="spinner" aria-hidden="true"></span>':p("play",14)}<span>${i?T:"\u57F7\u884C\u6B64\u6D41\u7A0B"}</span>
        </button>
        ${["law_download","order_download","judgment_download"].includes(e.id)?`<button class="btn btn-secondary btn-sm" type="button"
                data-processing-action="check-updates"
                data-workflow-id="${r(e.id)}"
                ${i?"disabled":""}>
                ${p("refresh",14)}<span>\u6AA2\u67E5\u66F4\u65B0</span>
              </button>`:""}
        ${i?`<button class="btn btn-secondary btn-sm processing-stop" type="button"
                data-processing-action="stop">${p("x",14)}<span>\u4E2D\u6B62\u57F7\u884C</span></button>`:""}
        ${e.id==="judgment_download"?`<div class="processing-download-progress" data-judgment-progress hidden>
                <div data-judgment-current>
                  <div class="processing-download-progress-head">
                    <span class="badge badge-info" data-judgment-progress-phase>\u6E96\u5099\u4E2D</span>
                    <strong class="processing-download-progress-month mono" data-judgment-progress-month>\u2014</strong>
                    <span class="processing-download-progress-file mono" data-judgment-progress-filename>\u2014</span>
                  </div>
                  <div class="processing-download-progress-track">
                    <span data-judgment-progress-bar></span>
                  </div>
                  <div class="processing-download-progress-meta">
                    <span data-judgment-progress-percent>\u2014</span>
                    <span data-judgment-progress-size>\u2014</span>
                    <span class="muted" data-judgment-progress-note></span>
                  </div>
                </div>
                <div class="processing-download-active" data-judgment-downloads hidden>
                  <div class="processing-download-active-head">
                    <span>\u540C\u6642\u4E0B\u8F09</span>
                    <span data-judgment-downloads-count>\u2014</span>
                  </div>
                  <div class="processing-download-active-list" data-judgment-downloads-list></div>
                </div>
                <div class="processing-download-run" data-judgment-run hidden>
                  <div class="processing-download-run-head">
                    <span>\u6574\u9AD4\u9032\u5EA6</span>
                    <span><strong data-judgment-run-percent>\u2014</strong> \xB7 <span data-judgment-run-files>\u2014</span></span>
                  </div>
                  <div class="processing-download-progress-track processing-download-run-track">
                    <span data-judgment-run-bar></span>
                  </div>
                  <div class="processing-download-progress-meta">
                    <span data-judgment-run-size>\u2014</span>
                    <span data-judgment-run-elapsed>\u2014</span>
                    <span data-judgment-run-eta>\u2014</span>
                  </div>
                </div>
              </div>`:""}
      </div>
      ${i?`<div class="processing-run-strip" data-processing-run-strip role="status">
              <span class="badge badge-info">${p("activity",11)}${T}</span>
              ${s&&s.id?`<span class="mono">${r(s.id)}</span>`:""}
              ${s&&s.started_at?`<span>\u958B\u59CB ${r($e(s.started_at))}</span>`:""}
              ${$?`<span>\u76EE\u524D\u8655\u7406 <strong class="mono">${r($)}</strong></span>`:""}
            </div>`:""}
      <div class="side-card-foot">
        \u57F7\u884C\u7D50\u679C\u6703\u5BEB\u5165\u5171\u7528\u8655\u7406\u72C0\u614B\u6A94\uFF0C\u53EF\u5F9E\u8655\u7406\u7E3D\u89BD\u67E5\u770B\u3002
      </div>
    </section>`;return`<div class="processing-workflow-panel">
    ${Ge({tone:"info",title:e.label,text:e.description||""})}
    ${e.update_available?`<div class="processing-update-notice" role="status" data-processing-update-notice>
            <span class="processing-update-notice-icon">${p("refresh",14)}</span>
            <span class="processing-update-notice-copy">
              <strong>${r(f)}\u5075\u6E2C\u5230\u53EF\u66F4\u65B0\u5167\u5BB9</strong>
              <span class="processing-update-mechanism">\u5075\u6E2C\u6A5F\u5236\uFF1A${r(y)}${u?` \xB7 \u6AA2\u67E5\u6642\u9593 ${r(u)}`:""}</span>
              <span class="processing-update-message" data-processing-update-message>${r(v)}</span>
            </span>
            ${m>0?`<span class="badge badge-warn badge-mono" data-processing-update-count>${p("refresh",10)}${c(m)}</span>`:'<span class="badge badge-warn">\u53EF\u66F4\u65B0</span>'}
            <button class="btn btn-primary btn-sm processing-update-action" type="button"
              data-processing-action="run-workflow"
              data-workflow-id="${r(e.id)}"
              ${o?"":"disabled"}
              title="${r(o?"\u7ACB\u5373\u57F7\u884C\uFF1B\u6703\u5148\u8A08\u7B97\u7E3D\u5927\u5C0F\u8207\u9810\u4F30\u6642\u9593":l)}">
              ${i?'<span class="spinner" aria-hidden="true"></span>':p("download",14)}<span>${i?T:"\u66F4\u65B0"}</span>
            </button>
          </div>`:""}
    ${["legal_index_versions","law_download","order_download"].includes(e.id)?Ap(e.index_timelines,{titleSuffix:e.id==="legal_index_versions"?"\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868":"\u4E0B\u8F09\u6642\u9593\u8868"}):""}
    ${e.id==="normalize_courts"?K:""}
    ${e.id==="normalize_courts"?lm(t):""}
    ${e.id==="backfill_law_articles"?cm(t):""}
    ${e.id!=="normalize_courts"?K:""}
    ${Kp(e)}
    ${e.id==="judgment_parquet"?rm():""}
    ${e.id==="normalize_courts"?im():""}
    ${e.id==="backfill_law_articles"?om():""}
    ${e.id==="judgment_import"?sm(e):""}
    ${e.id==="index_versions"?am(e):""}
    ${e.id==="index_versions"?nm(t):""}
    ${e.id==="judgment_download"?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${p("calendar",14)}\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B</span>
              <button class="btn btn-ghost btn-sm" type="button" title="\u91CD\u65B0\u6383\u63CF raw_rar \u76EE\u9304\u8207\u6708\u4EFD\u72C0\u614B" data-processing-action="refresh-judgment-months">${p("refresh",13)}<span>\u91CD\u65B0\u6574\u7406</span></button>
            </div>
            <div data-judgment-months-slot data-preserve-children>${ui()}</div>
          </section>`:""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${zt(a?.status||"idle")}
      </div>
      ${Pp(a)}
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("history",14)}\u57F7\u884C\u7D00\u9304</span>
        <span class="badge badge-neutral">\u6700\u8FD1 ${c((e.recent_runs||[]).length)} \u7B46</span>
      </div>
      ${Up(e.recent_runs)}
    </section>
    ${["law_download","order_download","judgment_download"].includes(e.id)?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${p("search",14)}\u7248\u672C\u6AA2\u67E5\u7D00\u9304</span>
              <span class="badge badge-neutral">\u6700\u8FD1 ${c((e.update_history||[]).length)} \u7B46</span>
            </div>
            ${Gp(e)}
          </section>`:""}
  </div>`}function Nn(e,t,s={},a=new Set){if(t==="overview")return kl(e,a);let i=(Array.isArray(e.workflows)?e.workflows:[]).find(o=>o.id===t);return i?pm(i,s):kl(e,a)}async function mm(e){let t=Kt(),s=`judgment.processing.slim.${t?"visitor":"admin"}`,a=()=>{try{let h=JSON.parse(window.localStorage.getItem(s)||"null");return!h?.snapshot||!h.snapshot.slim||Date.now()-Number(h.saved_at||0)>600*1e3?null:h.snapshot}catch{return null}},n=h=>{if(h?.slim)try{window.localStorage.setItem(s,JSON.stringify({snapshot:h,saved_at:Date.now()}))}catch{}};e.innerHTML=`<section class="page processing-page">
    <div class="page-header">
      <div class="processing-page-heading">
        <div class="page-kicker">DATA PIPELINE</div>
        <div class="processing-title-line">
          <h1 class="page-title">\u8CC7\u6599\u8655\u7406</h1>
          <p class="page-subtitle processing-page-subtitle">\u5373\u6642\u8FFD\u8E64\u5224\u6C7A\u3001\u6CD5\u898F\u8207\u547D\u4EE4\u7684\u8655\u7406\u9032\u5EA6\uFF0C\u6AA2\u67E5\u672C\u6A5F\u672A\u8655\u7406\u58D3\u7E2E\u6A94\uFF0C\u4E26\u53EF\u63A5\u7E8C\u7DDA\u4E0A\u8CC7\u6599\u66F4\u65B0\u3002</p>
        </div>
      </div>
      <div class="page-actions processing-actions">
        ${t?'<span class="badge badge-neutral badge-mono">\u5C55\u793A\u6A21\u5F0F \xB7 \u552F\u8B80</span>':""}
        <button class="btn btn-secondary btn-sm processing-stop" type="button" data-processing-action="stop" id="processing-stop" hidden>
          ${p("x",14)}<span>\u505C\u6B62\u66F4\u65B0</span>
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
  </section>`;let i=e.querySelector(".processing-page"),o=e.querySelector("#processing-root"),l=e.querySelector("#processing-workflows"),d=e.querySelector("#processing-stop"),m=!1,f=document.createElement("div");f.className="processing-stage-tooltip",f.hidden=!0,i.appendChild(f),Yt=new Map;let y=!1,v=!1,u=!1,b=null,w="",k="",A="overview",S=null,$=!1,T=null,K=null,G=null,fe=!1,ye=null,ie=0,L=null,q=!1,j=null,V=0,de=null,z=!1,Z=null,qe=0,F=null,ke=!1,ne=null,Se=0,Pe=!1,Le=null,Ze=!1,he=!1,oe="",ce=new Set,ve=null,je=null,Te=null,C=-1,D="",W=0,I=0,H=null,J=[],we=()=>({storage:G,loading:fe,error:ye,courtCheck:L,courtCheckLoading:q,courtCheckError:j,lawVersionCheck:de,lawVersionCheckLoading:z,lawVersionCheckError:Z}),Oe=()=>{if(A!=="judgment_download")return;let h=o.querySelector(".processing-workflow-panel");if(!h)return;h.querySelectorAll(".judgment-month.is-active").forEach(Ee=>{Ee.classList.remove("is-active"),Ee.removeAttribute("aria-current")});let _=h.querySelector("[data-judgment-progress]");if(!_)return;let B=S?.progress,re=!!(b?.workflows||[]).find(Ee=>Ee.id==="judgment_download")?.active_run;if((!B||B.active===!1)&&!re){_.hidden=!0,_.classList.remove("is-indeterminate");let Ee=_.querySelector("[data-judgment-run]");Ee&&(Ee.hidden=!0);return}if(_.hidden=!1,!B||B.active===!1){let Ee=_.querySelector("[data-judgment-progress-phase]");Ee&&(Ee.textContent="\u6E96\u5099\u4E2D");let ft=_.querySelector("[data-judgment-progress-month]");ft&&(ft.textContent="\u2014");let ot=_.querySelector("[data-judgment-progress-filename]");ot&&(ot.textContent="\u7B49\u5F85\u4E0B\u8F09\u7A0B\u5E8F\u56DE\u5831\u9032\u5EA6\u2026",ot.title=""),_.classList.add("is-indeterminate");let Gt=_.querySelector("[data-judgment-progress-bar]");Gt&&(Gt.style.width="");let Pt=_.querySelector("[data-judgment-progress-percent]");Pt&&(Pt.textContent="\u2014");let Rt=_.querySelector("[data-judgment-progress-size]");Rt&&(Rt.textContent="\u2014");let ws=_.querySelector("[data-judgment-progress-note]");ws&&(ws.textContent="\u5DF2\u555F\u52D5\uFF0C\u7B49\u5F85\u9032\u5EA6\u56DE\u5831");let rs=_.querySelector("[data-judgment-run]");rs&&(rs.hidden=!0);let es=_.querySelector("[data-judgment-downloads]");es&&(es.hidden=!0);let is=_.querySelector("[data-judgment-current]");is&&(is.hidden=!1);return}let X={preparing:"\u6E96\u5099\u4E2D",planning:"\u8A08\u7B97\u5927\u5C0F",scanning:"\u6383\u63CF\u4E2D",checking:"\u6AA2\u67E5\u4E2D",downloading:"\u4E0B\u8F09\u4E2D",saving:"\u5132\u5B58\u4E2D",finalizing:"\u6574\u7406\u4E2D"},Ae=X[B.phase]||"\u8655\u7406\u4E2D",ae=Array.isArray(B.downloads)?B.downloads:[],ue=ae.length>0,be=_.querySelector("[data-judgment-current]");be&&(be.hidden=ue);let Ne=_.querySelector("[data-judgment-downloads]");if(Ne){Ne.hidden=!ue;let Ee=_.querySelector("[data-judgment-downloads-count]");Ee&&(Ee.textContent=`${c(ae.length)} \u500B\u9032\u884C\u4E2D`);let ft=_.querySelector("[data-judgment-downloads-list]");ft&&ue&&(ft.innerHTML=ae.map(ot=>{let Gt=X[ot.phase]||Ae||"\u8655\u7406\u4E2D",Pt=Number(ot.bytes_written),Rt=Number(ot.total_bytes),ws=Number.isFinite(Rt)&&Rt>0,rs=ot.percent,es=rs==null||rs===""?ws&&Number.isFinite(Pt)?Pt/Rt*100:null:Number(rs),is=es===null||!Number.isFinite(es),Ba=is?"\u2014":`${Math.min(100,Math.max(0,es)).toFixed(es>=10?0:1)}%`,Fa=ws?`${Ce(Pt)} / ${Ce(Rt)}`:Number.isFinite(Pt)&&Pt>0?Ce(Pt):"\u2014";return`<div class="processing-download-active-item">
              <div class="processing-download-active-line">
                <strong class="mono">${r(ot.month||"\u2014")}</strong>
                <span class="processing-download-active-file mono" title="${r(ot.filename||"")}">${r(ot.filename||"\u2014")}</span>
                <span class="processing-download-active-percent mono">${r(Ba)}</span>
              </div>
              <div class="processing-download-active-track${is?" is-indeterminate":""}"><span style="width:${is?"":`${Math.min(100,Math.max(0,es)).toFixed(1)}%`}"></span></div>
              <div class="processing-download-active-meta">
                <span>${r(Gt)}</span>
                <span>${r(Fa)}</span>
              </div>
            </div>`}).join(""))}let g=_.querySelector("[data-judgment-progress-phase]");g&&(g.textContent=Ae);let M=B.month||"",E=_.querySelector("[data-judgment-progress-month]");E&&(E.textContent=M||"\u2014");let U=B.filename||"",_e=_.querySelector("[data-judgment-progress-filename]");_e&&(_e.textContent=U||"\u2014",_e.title=U);let Me=new Map;for(let Ee of ae)Ee.month&&Me.set(String(Ee.month),{percent:Ee.percent,phase:Ee.phase});M&&!Me.has(M)&&Me.set(M,{percent:B.percent,phase:B.phase}),h.querySelectorAll(".judgment-month.is-active").forEach(Ee=>{Ee.classList.remove("is-active","is-downloading"),Ee.removeAttribute("aria-current"),Ee.style.removeProperty("--month-progress")});for(let[Ee,ft]of Me){let ot=h.querySelector(`[data-judgment-month-key="${Ee}"]`);if(!ot)continue;ot.classList.add("is-active"),(ft?.phase==="downloading"||ft?.phase==="saving")&&ot.classList.add("is-downloading"),ot.setAttribute("aria-current","true");let Gt=Number(ft?.percent);Number.isFinite(Gt)&&ot.style.setProperty("--month-progress",`${Math.min(100,Math.max(0,Gt)).toFixed(1)}%`)}let He=Number(B.bytes_written),Fe=Number(B.total_bytes),st=Number.isFinite(Fe)&&Fe>0,it=null,gt=B.percent;gt!=null&&gt!==""&&Number.isFinite(Number(gt))?it=Number(gt):st&&Number.isFinite(He)&&(it=He/Fe*100);let Bt=it===null;_.classList.toggle("is-indeterminate",Bt);let Nt=_.querySelector("[data-judgment-progress-bar]");Nt&&(Nt.style.width=Bt?"":`${Math.min(100,Math.max(0,it)).toFixed(1)}%`);let ys=_.querySelector("[data-judgment-progress-percent]");if(ys){let Ee=Bt?null:Math.min(100,Math.max(0,it));ys.textContent=Ee===null?"\u2014":`${Ee.toFixed(Ee>=10?0:1)}%`}let Ws=_.querySelector("[data-judgment-progress-size]");if(Ws){let Ee=Number.isFinite(He)&&He>0?Ce(He):"\u2014";Ws.textContent=st?`${Ee} / ${Ce(Fe)}`:Ee}let Vs=_.querySelector("[data-judgment-progress-note]");if(Vs){let Ee=[],ft=Number(B.candidate_index),ot=Number(B.candidate_total);Number.isFinite(ft)&&ft>0&&Number.isFinite(ot)&&ot>0&&Ee.push(`\u7B2C ${c(ft)} / ${c(ot)} \u500B\u6708`),B.fileset_id&&Ee.push(`fileset ${B.fileset_id}`),B.message&&B.phase!=="downloading"&&Ee.push(String(B.message)),Vs.textContent=Ee.join(" \xB7 ")}let Xe=_.querySelector("[data-judgment-run]"),dt=B.run_files_total!==null&&B.run_files_total!==void 0;if(Xe&&(Xe.hidden=!dt,dt)){let Ee=Number(B.run_files_total)||0,ft=Number(B.run_files_done)||0,ot=B.run_bytes_total===null||B.run_bytes_total===void 0?null:Number(B.run_bytes_total),Gt=Number(B.run_bytes_done)||0,Pt=B.run_percent,Rt=Pt==null||Pt===""?null:Number(Pt),ws=_.querySelector("[data-judgment-run-bar]");ws&&(ws.style.width=Rt===null||!Number.isFinite(Rt)?"":`${Math.min(100,Math.max(0,Rt)).toFixed(1)}%`);let rs=_.querySelector("[data-judgment-run-percent]");rs&&(rs.textContent=Rt===null||!Number.isFinite(Rt)?"\u2014":`${Rt.toFixed(Rt>=10?0:1)}%`);let es=_.querySelector("[data-judgment-run-files]");es&&(es.textContent=`${c(ft)} / ${c(Ee)} \u500B\u6708`);let is=_.querySelector("[data-judgment-run-size]"),Ba=B.phase==="planning";is&&(ot!==null&&ot>0?is.textContent=`\u5DF2\u4E0B\u8F09 ${Ce(Gt)} / ${Ce(ot)}`:is.textContent=`\u5DF2\u4E0B\u8F09 ${Ce(Gt)} \xB7 ${Ba?"\u7E3D\u91CF\u8A08\u7B97\u4E2D":"\u7E3D\u91CF\u672A\u77E5"}`);let Fa=_.querySelector("[data-judgment-run-elapsed]");Fa&&(Fa.textContent=`\u5DF2\u82B1 ${La(B.elapsed_seconds)}`);let Wn=_.querySelector("[data-judgment-run-eta]");if(Wn){let Vn=Number(B.eta_seconds),pc=Number(B.estimated_total_seconds);Number.isFinite(Vn)&&Vn>=0?Wn.textContent=`\u5269\u9918 ${La(Vn)} \xB7 \u9810\u4F30\u7E3D\u8A08 ${La(pc)}`:Wn.textContent=Ba&&(B.run_bytes_total===null||B.run_bytes_total===void 0)?"\u5269\u9918\u6642\u9593\uFF1A\u8A08\u7B97\u4E2D":"\u5269\u9918\u6642\u9593\uFF1A\u2014"}}},Ve=()=>{if(A!=="judgment_download")return;let h=o.querySelector("[data-judgment-months-slot]");if(h){let _=Array.isArray(S?.months)?S.months:[];T&&!S?(h.innerHTML=Ge({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(T)}),delete h.dataset.judgmentMonthCount):S?h.dataset.judgmentMonthCount!==String(_.length)?(h.innerHTML=Hp(S),h.dataset.judgmentMonthCount=String(_.length)):zp(h,S):(h.querySelector(".judgment-months-loading")||(h.innerHTML=ui()),delete h.dataset.judgmentMonthCount)}if(S){let _=di(S),B=K!==_.pending;K=_.pending;let le=(b?.workflows||[]).find(X=>X.id==="judgment_download");le&&(le.update_count=_.pending,le.update_available=_.pending>0);let re=o.querySelector("[data-processing-update-notice]");if(re)if(_.pending<=0)re.remove();else{let X=re.querySelector("[data-processing-update-count]");X&&(X.innerHTML=`${p("refresh",10)}${c(_.pending)}`);let Ae=re.querySelector("[data-processing-update-message]");Ae&&(Ae.textContent=`\u5224\u6C7A\u5F85\u88DC\u9F4A ${c(_.pending)} \u500B\u6708`)}B&&l&&b&&hs(l,En(b,A))}Oe()},ct=()=>{let h=Array.isArray(F?.hosts)?F.hosts:[];return JSON.stringify({loading:!h.length&&ke,error:!h.length&&ne?ne.message||String(ne):"",active:F?.active_host_id??null,hosts:h.map(_=>({id:_.id,name:_.name,url:_.base_url,status:_.status,detail:_.detail,embedding:_.embedding_model,chat:_.chat_model,models:(_.models||[]).map(B=>B.name)}))})},nt=()=>{let h=o.querySelector("[data-processing-ollama]");if(!h||Se)return;let _=ct();h.dataset.ollamaSignature!==_&&(h.dataset.ollamaSignature=_,h.innerHTML=um(F,ke,F?null:ne))},tt=()=>{let _=((b?.sections||[]).find(B=>B.key==="legal")?.stages||[]).find(B=>B.key==="legal_qdrant");return ai(_?.model?.label||"")},et=()=>{let h=o.querySelector("[data-processing-embedding-strip]");if(!h)return;let _=Array.isArray(F?.hosts)?F.hosts:[],B=[];for(let ue of _)if(ue.status==="operational")for(let be of ue.models||[])Array.isArray(be.capabilities)&&be.capabilities.includes("embedding")&&B.push({hostId:Number(ue.id),model:be.name,label:ai(`${ue.name||ue.base_url||`\u4E3B\u6A5F ${ue.id}`}:${be.name}`),baseUrl:ue.base_url||""});let le=tt(),re=_.find(ue=>Number(ue.id)===Number(F?.active_host_id)),X=B.map(ue=>{let be=ue.label===le;return`<button class="rag-model-button${be?" is-active":""}" type="button"
        data-processing-action="select-embedding-model"
        data-host-id="${ue.hostId}"
        data-model="${r(ue.model)}"
        title="${r(ue.label)}"
        aria-pressed="${be?"true":"false"}"
        ${he?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(ue.label)}</span>
        ${be?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`});le&&!B.some(ue=>ue.label===le)&&X.unshift(`<button class="rag-model-button is-active is-static" type="button" aria-pressed="true" disabled>
          <span class="rag-model-state" aria-hidden="true"></span>
          <span>${r(le)}</span>
          <span class="rag-model-current">\u4F7F\u7528\u4E2D</span>
        </button>`);let Ae=B.length?`<div class="rag-model-buttons">${X.join("")}</div>`:`<p class="rag-model-empty">${ke?"\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\u8207 Embedding model\u2026":ne?`\u7121\u6CD5\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\uFF1A${r(ne.message||String(ne))}`:"\u76EE\u524D\u6C92\u6709\u53EF\u7528\u7684 Embedding model\u3002"}</p>`,ae=`<div class="processing-embedding-strip rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${p("brain",13)} Embedding \u4E3B\u6A5F\uFF0F\u6A21\u578B</span>
        ${re?.base_url?`<span class="rag-model-strip-base mono">${r(re.base_url)}</span>`:""}
        <span class="rag-model-strip-current">\u76EE\u524D\uFF1A<strong>${r(le||"\u2014")}</strong></span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-processing-action="refresh-embedding-models"
          ${ke?"disabled":""}>
          ${p("refresh",12)}<span>\u6AA2\u67E5\u6A21\u578B</span>
        </button>
      </div>
      ${Ae}
      <p class="rag-model-hint">\u9EDE\u9078 <span class="mono">\u4E3B\u6A5F:\u6A21\u578B</span> \u5207\u63DB Embedding\uFF1B\u9078\u53D6\u5F8C\u6703\u6210\u70BA\u7B2C\u4E00\u512A\u5148\uFF0C\u5176\u4ED6\u4E3B\u6A5F\u4F9D\u5E8F\u4F5C\u70BA\u5099\u63F4\u3002\u5207\u63DB\u6A21\u578B\u5F8C\u65E2\u6709\u7D22\u5F15\u53EF\u80FD\u9700\u8981\u91CD\u5EFA\u3002</p>
    </div>`;h.innerHTML!==ae&&(h.innerHTML=ae)},pe=h=>{let _=o.querySelector('[data-import-timeline="judgment"]');if(!_)return;let B=String(h?.active_month||""),le=String(h?.processing_month||"");_.querySelectorAll(".processing-month").forEach(Ne=>{let g=!!B&&Ne.dataset.month===B;Ne.classList.toggle("is-current",g),Ne.classList.toggle("is-processing-current",!!le&&Ne.dataset.month===le),g?Ne.setAttribute("aria-current","true"):Ne.removeAttribute("aria-current")});let re=_.querySelector(".index-current-row");if(!B||!h?.active_archive){re&&re.remove();return}let X=b?.workflows?.find(Ne=>Ne.id==="judgment_import")?.import_timeline?.stage_labels||{},Ae=Ml({activeMonth:B,activeArchive:h.active_archive,activePhase:h.active_phase||"",processingMonth:h.processing_month||"",processingArchive:h.processing_archive||"",stageLabels:X});if(re){re.innerHTML=Ae;return}let ae=document.createElement("div");ae.className="index-current-row",ae.innerHTML=Ae;let ue=_.querySelector(":scope > .side-card-head");if(ue){ue.insertAdjacentElement("afterend",ae);return}let be=_.querySelector(".judgment-months");be&&be.prepend(ae)},ze=h=>{let _=Number(h?.state_mtime_ns);return Number.isFinite(_)?_:-1},Ke=h=>{let _=String(h?.active_month||"");return/^\d{6}$/.test(_)?Number(_):-1},ut=h=>{if(!h)return;let _=ze(h);if(_>=0&&_<C){Te?.active_month&&pe(Te);return}_>=0&&(C=_);let B=String(h.active_month||"");if(!!(h.run_id&&h.run_id===Te?.run_id)&&Ke(h)>=0&&Ke(h)<Ke(Te)){let re={...h,active_month:Te.active_month,active_archive:Te.active_archive};Te=re,pe(re);return}if(!B&&h.run_status==="running"){Te?.active_month&&Te?.run_id===h.run_id?pe(Te):(Te=h,pe(h));return}Te=h,pe(h)},vt=h=>{let _=h?.active_import;if(_){ut(_);return}Te?.active_month&&pe(Te)},te=()=>{if(!(y||ve)){if(t){je=window.setInterval(()=>{y||At({silent:!0,cached:!0})},3e4);return}ve=Mt(["processing","judgment-download","system-usage","ollama","court-check","law-version-check"],(h,_)=>{if(!y){if(h==="processing"){_?.snapshot?.live?ua(_.snapshot):_?.snapshot?Gs(_.snapshot,{silent:!0}):At({silent:!0,cached:!0});return}if(h==="judgment-download"){A==="judgment_download"&&se({quiet:!0,payload:_?.snapshot||null});return}if(h==="system-usage"){A==="index_versions"&&me({quiet:!0,force:!0,payload:_?.snapshot||null});return}if(h==="ollama"){ni.has(A)&&Qe({quiet:!0,payload:_?.snapshot||null});return}if(h==="court-check"){A==="normalize_courts"&&Ue({quiet:!0,force:!0,payload:_?.snapshot||null});return}h==="law-version-check"&&A==="backfill_law_articles"&&Be({quiet:!0,force:!0,payload:_?.snapshot||null})}},{onProgress:(h,_)=>{if(h!=="processing")return;let B=_?.event;B&&Qs(B)},onError:()=>{b||At({silent:!0,cached:!0})}})}},xe=()=>{ve&&(ve(),ve=null)},De=async h=>{if(he)return;let[_,...B]=String(h||"").split("|"),le=Number(_),re=B.join("|");if(!le||!re){et();return}let X=(F?.hosts||[]).find(ae=>Number(ae.id)===le);if(!X){et();return}let Ae=ai(`${X.name||X.base_url||`\u4E3B\u6A5F ${X.id}`}:${re}`);if(Ae===tt()){et();return}if(!window.confirm(`\u5207\u63DB Embedding \u70BA ${Ae}\uFF1F

\u5207\u63DB\u6A21\u578B\u5F8C\uFF0C\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u8207\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u53EF\u80FD\u4E0D\u76F8\u5BB9\uFF0C\u9700\u8981\u91CD\u65B0\u5EFA\u7ACB\u7D22\u5F15\u3002`)){et();return}he=!0,et();try{await Q.selectOllamaModel(le,{model:re,role:"embedding"});let ae=(F?.hosts||[]).map(be=>Number(be.id)),ue=[le,...ae.filter(be=>be!==le)];await Q.reorderOllamaHosts(ue),R(`\u5DF2\u5207\u63DB Embedding \u70BA ${Ae}\u3002`,"ok",6e3),F=null,await Qe({quiet:!0}),await At({silent:!0})}catch(ae){R(ae.message||"\u7121\u6CD5\u5207\u63DB Embedding model\u3002","danger",7e3),await Qe({quiet:!0})}finally{he=!1,et()}},Qe=async({quiet:h=!1,button:_=null,payload:B=null}={})=>{if(!(y||ke)){if(t){ke=!1,ne=new Error("\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u8A2D\u5B9A\u3002"),nt(),et();return}ke=!0,ne=null,F||(nt(),et()),_&&Re(_,!0,"\u6AA2\u67E5\u4E2D\u2026");try{let le=B||await Q.ollamaHosts();if(y)return;F=le}catch(le){if(y)return;ne=le,h||R(le.message||"\u7121\u6CD5\u6AA2\u67E5 llama-server \u4E3B\u6A5F\u3002","danger",6e3)}finally{y||(ke=!1,_&&Re(_,!1),nt(),et())}}},Et=async h=>{if(Ze)return;let _=(F?.hosts||[]).map(X=>Number(X.id)),B=h.map(X=>Number(X));if(!B.length||B.length!==_.length||B.every((X,Ae)=>X===_[Ae])){nt();return}Ze=!0;let le=new Map((F?.hosts||[]).map(X=>[Number(X.id),X])),re=B.map(X=>le.get(X)).filter(Boolean);if(F&&re.length===_.length){F={...F,hosts:re,active_host_id:B[0]};let X=o.querySelector("[data-processing-ollama]");X&&(X.dataset.ollamaSignature=""),nt()}try{await Q.reorderOllamaHosts(B),R("\u5DF2\u66F4\u65B0 llama-server \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","ok",3500)}catch(X){R(X.message||"\u7121\u6CD5\u66F4\u65B0 llama-server \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","danger",6e3),await Qe({quiet:!0})}finally{Ze=!1}},ht=()=>{let h=o.querySelector("[data-processing-ollama]");h&&(h.dataset.ollamaSignature=""),nt()},x=()=>{let h=Le;if(!h)return;if(o.querySelector(`[data-ollama-host][data-host-id="${h.hostId}"]`)?.classList.remove("is-dragging"),h.captureTarget?.hasPointerCapture?.(h.pointerId))try{h.captureTarget.releasePointerCapture(h.pointerId)}catch{}document.documentElement.classList.remove("processing-ollama-dragging"),window.removeEventListener("pointermove",N),window.removeEventListener("pointerup",P),window.removeEventListener("pointercancel",O),Le=null,Se=0},N=h=>{let _=Le;if(!_||h.pointerId!==_.pointerId)return;if(!_.dragging){if(Math.hypot(h.clientX-_.startX,h.clientY-_.startY)<5)return;_.dragging=!0,Se=_.hostId,Pe=!1,o.querySelector(`[data-ollama-host][data-host-id="${_.hostId}"]`)?.classList.add("is-dragging"),document.documentElement.classList.add("processing-ollama-dragging")}h.preventDefault();let B=64;h.clientY<B?window.scrollBy(0,-12):h.clientY>window.innerHeight-B&&window.scrollBy(0,12);let le=o.querySelector("[data-ollama-list]"),re=document.elementFromPoint(h.clientX,h.clientY)?.closest?.("[data-ollama-host]");if(!le||!re||!le.contains(re))return;let X=le.querySelector(`[data-ollama-host][data-host-id="${_.hostId}"]`);if(!X||X===re)return;let Ae=re.getBoundingClientRect(),ae=h.clientY>Ae.top+Ae.height/2;le.insertBefore(X,ae?re.nextSibling:re),Pe=!0},P=h=>{let _=Le;if(!_||h.pointerId!==_.pointerId)return;let B=_.dragging,le=Pe,re=o.querySelector("[data-ollama-list]"),X=B&&re?[...re.querySelectorAll("[data-ollama-host]")].map(Ae=>Number(Ae.dataset.hostId)):[];x(),B&&le&&X.length&&Et(X)},O=()=>{let h=!!Le?.dragging;x(),h&&ht()},Y=h=>{if(h.button!==0||h.pointerType==="mouse"&&h.buttons!==1||Ze||Le)return;let _=h.target.closest("[data-ollama-host]");if(!_||!o.contains(_)||h.target.closest("button")||h.pointerType==="touch"&&!h.target.closest(".processing-ollama-handle"))return;let B=Number(_.dataset.hostId)||0;if(B){h.preventDefault(),Se=B,Le={hostId:B,pointerId:h.pointerId,startX:h.clientX,startY:h.clientY,dragging:!1,captureTarget:_};try{_.setPointerCapture(h.pointerId)}catch{}window.addEventListener("pointermove",N,{passive:!1}),window.addEventListener("pointerup",P),window.addEventListener("pointercancel",O)}},se=async({quiet:h=!1,payload:_=null}={})=>{if(!$){$=!0,!S&&A==="judgment_download"&&Ve();try{S=_||await Q.judgmentDownloadStatus(),T=null}catch(B){T=B.message||"\u8B80\u53D6\u6708\u4EFD\u72C0\u614B\u5931\u6557\u3002",h||R(T,"danger",7e3)}finally{$=!1,A==="judgment_download"&&Ve()}}},me=async({quiet:h=!0,force:_=!1,payload:B=null}={})=>{if(!fe){if(t){fe=!1,ye=new Error("\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B Qdrant \u5BB9\u5668\u3001volume \u8207\u4E3B\u6A5F\u5132\u5B58\u8CC7\u8A0A\u3002"),A==="index_versions"&&xt();return}if(!(!_&&G&&Date.now()-ie<3e4)){fe=!0;try{G=B||await Q.systemUsage(),ye=null,ie=Date.now()}catch(le){ye=le.message||"\u7121\u6CD5\u53D6\u5F97 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002",h||R(ye,"danger",7e3)}finally{fe=!1,A==="index_versions"&&xt()}}}},Ue=async({quiet:h=!0,force:_=!1,payload:B=null}={})=>{if(!q&&!(!_&&L&&Date.now()-V<6e4)){q=!0;try{L=B||await Q.checkCourts(),j=null,V=Date.now()}catch(le){j=le.message||"\u7121\u6CD5\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u3002",h||R(j,"danger",7e3)}finally{q=!1,A==="normalize_courts"&&xt()}}},Be=async({quiet:h=!0,force:_=!1,button:B=null,payload:le=null}={})=>{if(!z&&!(!_&&de&&Date.now()-qe<6e4)){z=!0,B&&Re(B,!0,"\u6AA2\u67E5\u4E2D\u2026");try{if(de=le||await Q.checkLawVersions(),Z=null,qe=Date.now(),!h){let re=de.totals||{},X=Number(re.needs_backfill_versions)||0,Ae=Number(re.backfillable_versions)||0,ae=Number(re.blocked_versions)||0;X>0?R(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u9700\u8981\u5EFA\u7ACB ${X} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF08\u53EF\u5EFA\u7ACB ${Ae}\u3001\u7F3A\u539F\u59CB\u6A94 ${ae}\uFF09\u3002`,ae>0?"danger":"warn",7e3):R(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D ${Number(re.versions)||0} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`,"ok",5e3)}}catch(re){Z=re.message||"\u7121\u6CD5\u6AA2\u67E5\u689D\u6587\u6B77\u53F2\u72C0\u614B\u3002",h||R(Z,"danger",7e3)}finally{z=!1,B&&Re(B,!1)}}},Ie=h=>Array.from(o.querySelectorAll("[data-stage-key]")).find(_=>_.dataset.stageKey===h)||null,Ye=h=>{if(!h)return;ce.add(h);let _=Array.from(o.querySelectorAll(".processing-wf-stage[data-processing-stage]")).find(B=>B.dataset.processingStage===h);_&&(_.open=!0,_.scrollIntoView({behavior:"smooth",block:"center"}))},rt=()=>{oe&&(oe="",f.hidden=!0,o.querySelectorAll("[data-stage-key]").forEach(h=>{h.classList.remove("is-stage-hovered")}))},lt=h=>{let _=h.dataset.stageKey||"";if(!_)return;oe=_,o.querySelectorAll("[data-stage-key]").forEach(E=>{E.classList.toggle("is-stage-hovered",E.dataset.stageKey===_)});let B=h.dataset.stageStatusKey||"idle",le=h.dataset.stageStatus||Ls(B).label,re=h.dataset.stageColor||"var(--accent)",X=Number(h.dataset.stageUpdate)||0,Ae=Number(h.dataset.stagePending)||0,ae=h.dataset.stageContributionLabel||"\u6574\u9AD4\u5360\u6BD4";f.innerHTML=`<div class="processing-stage-tooltip-head">
      <span class="processing-stage-tooltip-swatch" style="background:${r(re)}"></span>
      <strong>${r(h.dataset.stageLabel||_)}</strong>
      ${zt(B,le)}
    </div>
    <div class="processing-stage-tooltip-meta">
      <span>\u968E\u6BB5\u9032\u5EA6 <strong>${r(h.dataset.stagePercent||"\u2014")}</strong></span>
      <span>${r(ae)} <strong>${r(h.dataset.stageContribution||"\u2014")}</strong></span>
      <span class="mono">${r(h.dataset.stageDuration||"\u2014")}</span>
    </div>
    <div class="processing-stage-tooltip-counts">${r(h.dataset.stageCounts||"\u2014")}</div>
    ${X||Ae?`<div class="processing-stage-tooltip-badges">
            ${X?`<span class="processing-wf-count is-update">${p("refresh",11)}<strong>${c(X)}</strong><span>\u53EF\u66F4\u65B0</span></span>`:""}
            ${Ae?`<span class="processing-wf-count is-pending">${p("clock",11)}<strong>${c(Ae)}</strong><span>\u5F85\u57F7\u884C</span></span>`:""}
          </div>`:""}
    ${h.dataset.stageMessage?`<div class="processing-stage-tooltip-message">${r(h.dataset.stageMessage)}</div>`:""}`,f.hidden=!1;let ue=Math.min(300,Math.max(220,window.innerWidth-24));f.style.width=`${ue}px`;let be=h.getBoundingClientRect(),Ne=Math.min(window.innerWidth-ue-12,Math.max(12,be.left)),g=be.top-f.offsetHeight-10,M=g>=12?g:Math.min(window.innerHeight-f.offsetHeight-12,be.bottom+10);f.style.left=`${Ne}px`,f.style.top=`${Math.max(12,M)}px`},St=h=>{if(h.target.closest(".is-failure-tip")){rt();return}if(h.target.closest(".processing-wf-rail"))return;let _=h.target.closest("[data-stage-key]");!_||!o.contains(_)||_.contains(h.relatedTarget)||lt(_)},ds=h=>{let _=h.target.closest("[data-stage-key]");if(!_||!o.contains(_)||_.contains(h.relatedTarget))return;let B=h.relatedTarget?.closest?.("[data-stage-key]");B&&B.dataset.stageKey===_.dataset.stageKey||rt()},Hn=h=>Array.isArray(h?.active_runs)&&h.active_runs.length||(h?.workflows||[]).some(_=>_.active_run)?!0:String(h?.update?.status||"")==="running",ca=()=>{o.querySelectorAll('[data-processing-action="stop"]').forEach(h=>Re(h,!0,"\u505C\u6B62\u4E2D\u2026")),d&&Re(d,!0,"\u505C\u6B62\u4E2D\u2026")},zn=()=>{o.querySelectorAll('[data-processing-action="stop"]').forEach(h=>Re(h,!1)),d&&Re(d,!1)},Pa=new Set(["refresh","open-stage","refresh-judgment-months","refresh-court-check","refresh-law-version-check"]),da=()=>{t&&(i.querySelectorAll("[data-processing-action]").forEach(h=>{Pa.has(h.dataset.processingAction||"")||("disabled"in h&&(h.disabled=!1),h.removeAttribute("disabled"),h.classList.add("is-demo-locked"),h.setAttribute("aria-disabled","true"),h.removeAttribute("title"),h.dataset.demoLockTooltip="\u5C55\u793A\u6A21\u5F0F\u50C5\u4F9B\u6AA2\u8996\uFF0C\u57F7\u884C\u8207\u8A2D\u5B9A\u7531\u7BA1\u7406\u8005\u64CD\u4F5C")}),i.querySelectorAll("[data-ollama-action], [data-processing-embedding-select]").forEach(h=>{h.disabled=!0,h.classList.add("is-demo-locked"),h.removeAttribute("title"),h.dataset.demoLockTooltip="\u5C55\u793A\u6A21\u5F0F\u50C5\u4F9B\u6AA2\u8996"}))},js=h=>{let _=h.capabilities||{};m&&!Hn(h)&&(m=!1,zn()),!u&&d&&(d.hidden=!_.can_stop_update),m&&ca(),da()},xt=()=>{if(!b)return;b.slim&&At({silent:!0,cached:!0});let h=Nn(b,A,we(),ce);h!==w&&(hs(o,h),w=h),Ve(),nt(),et(),vt(b),da()},Gs=(h,{silent:_=!1}={})=>{if(y||!h||h.slim&&b&&!b.slim)return;let B=Date.parse(h.generated_at||""),le=Date.parse(b?.generated_at||"");if(Number.isFinite(B)&&Number.isFinite(le)&&B<le)return;if(Xt){let ue=(h.workflows||[]).find(Ne=>Ne.id===Xt),be=ue?.active_run?.id||ue?.last_run?.id||"";(ue?.active_run||be&&be!==Bs)&&(Xt="",Bs="")}b=h,window.dispatchEvent(new CustomEvent("judgment:processing-pending",{detail:{count:Number(h.capabilities?.unprocessed_archives)||0,index_pending:Number(h.capabilities?.index_pending_months)||0}}));let re=new Map;for(let ue of h.sections||[])for(let be of ue.stages||[])re.set(`${ue.key}-${be.key}`,be);for(let[ue,be]of Yt){if(be.kind!=="upgrade")continue;let Ne=re.get(ue);if(Ne){if(Ne.phase==="failed"||Ne.phase==="running"&&Ne.percent!==null){Yt.delete(ue);continue}if(Ne.phase==="completed"){let g=Date.parse(Ne.last_run?.started_at||"");Number.isFinite(g)&&g>=Number(be.startedAt||0)-1e3&&Yt.delete(ue)}}}let X=En(h,A);X!==k&&(hs(l,X),k=X);let Ae=Nn(h,A,we(),ce);if(Ae!==w&&(hs(o,Ae),w=Ae),Ve(),nt(),oe){let ue=Ie(oe);ue?lt(ue):rt()}let ae=o.querySelector("[data-processing-updated-at]");if(ae){let ue=$e(h.generated_at);ae.textContent!==ue&&(ae.textContent=ue)}if(js(h),et(),vt(h),!t&&!F&&!ke&&Qe({quiet:!0}),J.length){let ue=J.splice(0);for(let be of ue)Qs(be)}},Ia=h=>{if(H=h,typeof requestAnimationFrame>"u"){let _=H;H=null,_&&ua(_);return}I||(I=requestAnimationFrame(()=>{I=0;let _=H;H=null,_&&ua(_)}))},Qs=h=>{if(!h)return;if(!b){J.push(h),J.length>100&&J.shift();return}let _=String(h.run_id||""),B=Number(h.seq)||0;if(_&&_===D&&B>0&&B<=W)return;_&&_!==D&&(D=_,W=0),B>0&&(W=B);let le=String(h.workflow_id||"judgment_import"),re=String(h.month||"").replace(/\D/g,"").slice(0,6),X=(b.workflows||[]).find(g=>g.id===le);if(!X)return;X.progress||(X.progress={stages:[]}),Array.isArray(X.progress.stages)||(X.progress.stages=[]);let Ae=String(h.stage||""),ae=Ae?X.progress.stages.find(g=>String(g.key)===Ae):null,ue=String(X.progress.run_id||"")===String(h.run_id||"");if(ae&&h.type==="stage_progress"){let g=Number(h.current),M=Number(ae.current);ue&&h.status==="running"&&Number.isFinite(g)&&Number.isFinite(M)&&g<M||(h.status&&(ae.status=String(h.status)),h.current!==void 0&&(ae.current=Number(h.current)||0),h.total!==void 0&&(ae.total=Number(h.total)||0),h.percent!==void 0&&(ae.percent=Number(h.percent)||0),h.message&&(ae.message=String(h.message)))}if(ae&&h.extra&&typeof h.extra=="object")for(let g of["financial_processed","financial_matched","financial_percent"])h.extra[g]!==void 0&&(ae[g]=Number(h.extra[g])||0);if(h.type==="stage_progress"&&h.overall_percent!==void 0){let g=Number(h.overall_percent)||0,M=Number(X.progress.overall_percent)||0;X.progress.overall_percent=ue?Math.max(M,g):g}h.type!=="run_finished"&&(X.progress.run_status="running"),(h.type==="archive_started"||h.type==="stage_progress")&&!X.active_run&&h.run_id&&(X.active_run={id:h.run_id,status:"running",started_at:h.timestamp,message:h.message||""}),h.type==="run_finished"&&(X.active_run=null,X.progress.run_status=String(h.status||"success"),X.can_run=!0);let be=[];re&&h.month_stages&&be.push({month:re,import_stages:h.month_stages,import_overall:h.month_overall||""});let Ne=null;if(h.type==="archive_started"&&re){let g=Date.parse(h.timestamp||"");Ne={active_month:re,active_archive:h.archive,active_phase:h.stage||"filter",processing_month:re,processing_archive:h.archive,run_id:h.run_id,run_status:"running",state_mtime_ns:Number.isFinite(g)?g*1e6:Date.now()*1e6}}else h.type==="run_finished"&&(Ne={...b.active_import||{},run_status:String(h.status||"success")});Ia({live:!0,generated_at:h.timestamp,workflows:[{id:le,active_run:X.active_run,last_run:X.last_run,progress:X.progress,can_run:X.can_run}],import_timeline_months:be,active_import:Ne})},ua=h=>{if(y||!h||!b)return;let _=new Map((h.workflows||[]).map(ae=>[ae.id,ae]));if(Xt){let ae=_.get(Xt),ue=ae?.active_run?.id||ae?.last_run?.id||"";(ae?.active_run||ue&&ue!==Bs)&&(Xt="",Bs="")}for(let ae of b.workflows||[]){let ue=_.get(ae.id);if(ue){if("active_run"in ue&&(ae.active_run=ue.active_run),"last_run"in ue&&(ae.last_run=ue.last_run),Array.isArray(ue.recent_runs)&&(ae.recent_runs=ue.recent_runs),"index_runtime"in ue){let be=ue.index_runtime;be&&!be.active_coverage&&ae.index_runtime?.active_coverage&&(be.active_coverage=ae.index_runtime.active_coverage),be&&!be.active_archive_coverage&&ae.index_runtime?.active_archive_coverage&&(be.active_archive_coverage=ae.index_runtime.active_archive_coverage),ae.index_runtime=be}if(ue.progress){let be=ue.progress,Ne=ae.progress;if(ae.id==="judgment_import"&&Ne?.run_id&&Ne.run_id===be.run_id){let g=new Map((Ne.stages||[]).map(M=>[String(M.key),M]));for(let M of be.stages||[]){let E=g.get(String(M.key));E&&M.status==="running"&&Number(M.current)<Number(E.current)&&(M.current=E.current,M.total=E.total,M.percent=E.percent,M.message=E.message)}be.overall_percent=Math.max(Number(Ne.overall_percent)||0,Number(be.overall_percent)||0)}ae.progress=be}typeof ue.can_run=="boolean"&&(ae.can_run=ue.can_run)}}let B=ae=>{if(!ae||!Array.isArray(h.import_timeline_months))return;let ue=new Map((ae.months||[]).map(Ne=>[String(Ne.month),Ne]));for(let Ne of h.import_timeline_months){let g=ue.get(String(Ne.month));g&&(g.import_stages={...g.import_stages||{},...Ne.import_stages||{}},Ne.import_stage_progress&&(g.import_stage_progress={...g.import_stage_progress||{},...Ne.import_stage_progress||{}}),Ne.import_overall&&(g.import_overall=Ne.import_overall))}let be={complete:0,incomplete:0,processing:0,empty:0};for(let Ne of ae.months||[]){let g=String(Ne.import_overall||"empty");be[g]=Number(be[g]||0)+1}ae.stage_summary=be};(ae=>{let ue=(ae.workflows||[]).find(Me=>Me.id==="index_versions"),be=ue?.index_runtime;if(!be||!Array.isArray(be.months))return;let Ne=(ae.file_timelines||[]).find(Me=>Me.key==="judgment");if(!Ne||!Array.isArray(Ne.months))return;let g=(ue.progress?.stages||[]).find(Me=>Me.key==="validate"),M=["success","no_change"].includes(String(be.run_status||""))||String(be.run_status||"")!=="running"&&/alias\s*已切換/.test(String(g?.message||"")),E=String(be.current?.month||""),U=new Map(Ne.months.map(Me=>[String(Me.month),Me]));for(let Me of be.months){let He=U.get(String(Me.month||""));if(!He)continue;let Fe=He.stages||(He.stages={}),st=String(Me.status||"");st==="running"||String(Me.month)===E?(Fe.qdrant="processing",He.overall="processing"):st==="success"&&Fe.qdrant!=="complete"&&(Fe.qdrant=M?"complete":"incomplete",He.overall=M?"complete":"incomplete")}let _e={complete:0,incomplete:0,processing:0,empty:0,update:0};for(let Me of Ne.months){let He=String(Me.overall||"empty");_e[He]=Number(_e[He]||0)+1,Me.has_update&&(_e.update+=1)}Ne.summary=_e})(b),B(b.import_timeline);for(let ae of b.workflows||[])ae.id==="judgment_import"&&B(ae.import_timeline);h.active_import&&(b.active_import=h.active_import),h.mode&&(b.mode=h.mode),h.generated_at&&(b.generated_at=h.generated_at);let re=En(b,A);re!==k&&(hs(l,re),k=re);let X=Nn(b,A,we(),ce);X!==w&&(hs(o,X),w=X),Ve(),nt(),et(),vt(b),js(b);let Ae=o.querySelector("[data-processing-updated-at]");if(Ae&&h.generated_at){let ae=$e(h.generated_at);Ae.textContent!==ae&&(Ae.textContent=ae)}},At=async({silent:h=!1,cached:_=!1,slim:B=!1}={})=>{if(!(y||v)){v=!0;try{let le=await Q.processing({cached:_,slim:B});B&&n(le),Gs(le,{silent:h})}catch(le){if(y)return;let re=Np(le.message,b);re!==w&&(hs(o,re),w=re),h||R(le.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{v=!1}}},Un=async(h,_="")=>{if(u)return;u=!0,Re(h,!0,"\u6AA2\u67E5\u4E2D\u2026");let B=yl[_]||"",le=String(h.dataset.sourceTypes||"").split(",").map(Ae=>Ae.trim()).filter(Boolean),re=le.length?le:B?[B]:[],X=h.dataset.stageId||"";X&&(Yt.set(X,{kind:"check",phase:"updating",startedAt:Date.now()}),xt());try{let Ae=await Q.checkUpdates(re);if(Ae&&Ae.checking)X&&(Yt.delete(X),xt()),R("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u8ACB\u7A0D\u5F8C\u91CD\u65B0\u6574\u7406\u3002","info",6e3);else if(re.length===1){let ae=(Ae.sources||{})[re[0]]||{},ue=wl[_]||(re[0]==="judgment"?"\u5224\u6C7A":re[0]==="law"?"\u6CD5\u898F":re[0]==="order"?"\u547D\u4EE4":"\u8CC7\u6599");ae.status==="error"?R(`${ue}\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF1A${ae.message||"\u7121\u6CD5\u53D6\u5F97\u7DDA\u4E0A\u7248\u672C"}`,"danger",7e3):R(ae.update_available?`${ue}\u7DDA\u4E0A\u5DF2\u6709\u66F4\u65B0\u7248\u672C\u3002`:`${ue}\u7DDA\u4E0A\u5DF2\u662F\u6700\u65B0\u7248\u672C\u3002`,ae.update_available?"warn":"ok",6e3)}else if(re.length>1){let ae=Ae.sources||{},ue=re.filter(Ne=>ae[Ne]?.update_available),be=re.filter(Ne=>ae[Ne]?.status==="error");be.length?R(`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF0C\u4F46\u6709 ${be.length} \u9805\u6AA2\u67E5\u5931\u6557\u3002`,"danger",7e3):R(ue.length?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${ue.length} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",ue.length?"warn":"ok",6e3)}else{let ae=Number(Ae.update_count)||0;R(ae>0?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${ae} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",ae>0?"warn":"ok",6e3)}X&&(Yt.set(X,{kind:"check",phase:"updated",startedAt:Date.now()}),xt()),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await At({silent:!0})}catch(Ae){X&&(Yt.delete(X),xt()),R(Ae.message||"\u66F4\u65B0\u6AA2\u67E5\u5931\u6557\u3002","danger",7e3)}finally{u=!1,Re(h,!1),b&&js(b)}},Gn=async h=>{let _=yl[h]||"";if(!_)return!0;let B=null;try{B=await Q.checkUpdates([_])}catch(re){return R(`\u7121\u6CD5\u5B8C\u6210\u7248\u672C\u6AA2\u67E5\uFF08${re.message||"\u7DB2\u8DEF\u932F\u8AA4"}\uFF09\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002`,"warn",7e3),!0}if(!B||B.checking)return B&&B.checking&&R("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","info",6e3),!0;let le=(B.sources||{})[_];if(!le)return!0;if(window.dispatchEvent(new CustomEvent("judgment:updates-changed")),le.status==="up_to_date"&&!le.update_available){let re=wl[h]||"\u8CC7\u6599",X=le.checked_at?`\uFF08${$e(le.checked_at)} \u6AA2\u67E5\uFF09`:"",Ae=bp[h]||"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u55CE\uFF1F";return window.confirm(`${re}\u7DDA\u4E0A\u6AA2\u67E5\u70BA\u6700\u65B0\u7248\u672C${X}\u3002

${Ae}`)}return le.status==="error"&&R("\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","warn",6e3),!0},Js=async(h,_)=>{if(u)return;u=!0;let B=(b?.workflows||[]).find(X=>X.id===_);Bs=B?.active_run?.id||B?.last_run?.id||"",Xt=_,Re(h,!0,"\u57F7\u884C\u4E2D"),xt();let le=h.dataset.stageId||"",re=!1;try{if(!await Gn(_))return;le&&(Yt.set(le,{kind:"upgrade",phase:"upgrading",startedAt:Date.now()}),xt());let Ae;try{Ae=await Q.startProcessingWorkflow(_)}catch(ae){throw le&&(Yt.delete(le),xt()),ae}re=!0,R(`\u5DF2\u555F\u52D5\u300C${B?.label||_}\u300D\u6D41\u7A0B\u3002`,"ok",6e3),Ae&&Ae.run_id&&console.info("processing workflow started",Ae),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),At({silent:!0}),window.setTimeout(()=>{Xt===_&&(Xt="",Bs="",At({silent:!0}))},15e3)}catch(X){R(X.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{u=!1,(!re||Xt!==_)&&(Xt="",Bs="",b?(js(b),w="",xt()):Re(h,!1))}},Qn=async h=>{if(!(u||m)){u=!0,m=!0,Re(h,!0,"\u505C\u6B62\u4E2D\u2026");try{let _=await Q.stopProcessingUpdate();for(let[B,le]of Yt)le.kind==="upgrade"&&Yt.delete(B);xt(),At({silent:!0}),R(_.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3)}catch(_){m=!1,Re(h,!1),R(_.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{u=!1,m?ca():b&&js(b)}}},pa=h=>{let _=h.target.closest("[data-processing-action]");if(!_||_.disabled)return;if(t&&!Pa.has(_.dataset.processingAction||"")){h.preventDefault(),h.stopPropagation(),R("\u5C55\u793A\u6A21\u5F0F\u50C5\u4F9B\u6AA2\u8996\uFF0C\u57F7\u884C\u8207\u8A2D\u5B9A\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002","info",4e3);return}_.closest(".processing-wf-rail")&&(h.preventDefault(),h.stopPropagation());let B=_.dataset.processingAction;if(B==="refresh")At({silent:!1,cached:t});else if(B==="open-stage")Ye(_.dataset.stageId||"");else if(B==="refresh-judgment-months")se({quiet:!1});else if(B==="refresh-index-storage")me({quiet:!1,force:!0});else if(B==="refresh-court-check")Ue({quiet:!1,force:!0});else if(B==="refresh-law-version-check")Be({quiet:!1,force:!0,button:_});else if(B==="refresh-ollama")Qe({quiet:!1,button:_});else if(B==="refresh-embedding-models")Qe({quiet:!1,button:_});else if(B==="select-embedding-model"){let le=_.dataset.hostId||"",re=_.dataset.model||"";De(`${le}|${re}`)}else if(B==="move-ollama-host"){let le=F?.hosts||[],re=le.findIndex(ue=>Number(ue.id)===Number(_.dataset.hostId)),X=_.dataset.direction,Ae=X==="up"?re-1:X==="down"?re+1:-1;if(re<0||Ae<0||Ae>=le.length)return;let ae=le.map(ue=>Number(ue.id));[ae[re],ae[Ae]]=[ae[Ae],ae[re]],Et(ae)}else if(B==="check-updates")Un(_,_.dataset.workflowId||"");else if(B==="run-workflow"){let le=_.dataset.workflowId||"";Js(_,le)}else B==="stop"&&Qn(_)},Ut=(h,{scroll:_=!1}={})=>{if(A=h||"overview",b){let B=En(b,A);hs(l,B),k=B;let le=Nn(b,A,we(),ce);if(hs(o,le),w=le,Ve(),nt(),et(),vt(b),oe){let re=Ie(oe);re?lt(re):rt()}da(),_&&o.scrollIntoView({behavior:"smooth",block:"start"})}!t&&ni.has(A)&&Qe({quiet:!0}),A==="judgment_download"&&se({quiet:!0}),A==="index_versions"&&(t?(ye=new Error("\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B Qdrant \u5BB9\u5668\u3001volume \u8207\u4E3B\u6A5F\u5132\u5B58\u8CC7\u8A0A\u3002"),fe=!1,xt()):me({quiet:!0})),A==="normalize_courts"&&Ue({quiet:!0}),A==="backfill_law_articles"&&Be({quiet:!0})},ns=h=>{let _=h.target.closest("[data-processing-workflow]");_&&Ut(_.dataset.processingWorkflow||"overview")},ma=h=>{let _=h.target.closest("[data-timeline-workflow]");_&&(h.preventDefault(),Ut(_.dataset.timelineWorkflow||"",{scroll:!0}))},ga=h=>{let _=h.target.closest?.(".index-wf-stage[data-index-stage]");if(_&&o.contains(_)){let X=_.dataset.indexStage||"";X&&(_.open?ri.add(X):ri.delete(X));return}let B=h.target.closest?.(".workflow-wf-stage[data-workflow-wf-stage]");if(B&&o.contains(B)){let X=B.dataset.workflowWfStage||"";X&&(B.open?ii.add(X):ii.delete(X));return}let le=h.target.closest?.(".processing-wf-stage[data-processing-stage]");if(!le||!o.contains(le))return;let re=le.dataset.processingStage||"";re&&(le.open?ce.add(re):ce.delete(re))};i.addEventListener("click",pa),l.addEventListener("click",ns),o.addEventListener("click",ma),o.addEventListener("pointerover",St),o.addEventListener("pointerout",ds),o.addEventListener("pointerdown",Y),o.addEventListener("toggle",ga,!0),window.addEventListener("scroll",rt,{capture:!0,passive:!0});let Da=a();Da&&Gs(Da,{silent:!0});let Jn=At({silent:!0,cached:!0,slim:!0});return te(),await Jn,()=>{y=!0,xe(),je&&(window.clearInterval(je),je=null),i.removeEventListener("click",pa),l.removeEventListener("click",ns),o.removeEventListener("click",ma),x(),o.removeEventListener("pointerover",St),o.removeEventListener("pointerout",ds),o.removeEventListener("pointerdown",Y),o.removeEventListener("toggle",ga,!0),window.removeEventListener("scroll",rt,{capture:!0})}}var vi={};us(vi,{render:()=>Vm});var gi={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u522A\u9664\uFF0F\u9000\u5F79",badge:"badge-neutral"}},cs={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},oa={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},Ol={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function Na(e){let t=gi[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${r(t.label)}</span>`}function fi(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function gm(e){return fi(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",source_type:a||""}})}function fm(e){return fi(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",article_no:a||""}})}function bm(e){return fi(e).map(t=>({jid:t.trim()}))}function hm(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function vm(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function $m(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function ym(e){return(e?.tags||[]).join(", ")}function Ea(e){return`<div class="qb-empty">${p("info",18)}<span>${r(e)}</span></div>`}function bi(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),n=[...t.map(i=>`<span class="chip">${r(i)}</span>`),...s.map(i=>`<span class="chip">${r(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${r(i)}</span>`)];return n.length?`<div class="chips qb-labels">${n.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function hi(){return`<details class="qb-import">
    <summary>${p("upload",14)}JSON \u6279\u6B21\u532F\u5165</summary>
    <p class="qb-muted">\u683C\u5F0F\uFF1A<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>\u3002\u76F8\u540C\u984C\u76EE fingerprint \u9810\u8A2D\u66F4\u65B0\u3002</p>
    <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
    <div class="qb-actions">
      <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${p("upload",13)}<span>\u532F\u5165 JSON</span></button>
    </div>
  </details>`}function wm(e){let t=e?.item||{},s=Array.isArray(e?.warnings)?e.warnings:[],a=Array.isArray(t.tags)?t.tags:[];return`<section class="report-card qb-card qb-ai-result">
    <div class="side-card-head">
      <span class="side-card-title">${p("sparkles",14)}llama-server \u5DF2\u5EFA\u7ACB\u984C\u76EE #${t.id}</span>
      ${Na(t.status)}
    </div>
    <div class="qb-ai-answer">
      <strong>${r(t.question||"")}</strong>
      <div class="qb-ai-meta">
        ${r(cs[t.question_type]||t.question_type||"")}
        \xB7 ${r(oa[t.difficulty]||t.difficulty||"")}
        \xB7 ${r(e?.model||"\u672C\u6A5F llama-server")}
      </div>
      ${bi(t)}
      ${t.reference_answer?`<div class="qb-reference"><span class="summary-label">llama-server \u53C3\u8003\u7B54\u6848</span><p>${r(t.reference_answer)}</p></div>`:""}
      ${a.length?`<div class="chips">${a.map(n=>`<span class="chip">${r(n)}</span>`).join("")}</div>`:""}
      ${s.length?`<div class="qb-ai-warnings"><strong>\u9700\u8981\u6CE8\u610F</strong><ul>${s.map(n=>`<li>${r(n)}</li>`).join("")}</ul></div>`:""}
      <div class="qb-actions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="review-ai-item">${p("shield",13)}<span>\u524D\u5F80\u9A57\u6536</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="reset-ai">${p("plus",13)}<span>\u518D\u65B0\u589E\u4E00\u984C</span></button>
      </div>
    </div>
    ${hi()}
  </section>`}function _m(e){return e.aiResult?wm(e.aiResult):`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("sparkles",14)}AI \u984C\u5EAB\u65B0\u589E</span>
      <span class="badge badge-neutral">\u672C\u6A5F llama-server</span>
    </div>
    <form class="qb-form qb-ai-form" data-qb-form="ai-create" id="qb-create-form">
      <label class="field qb-wide">
        <span class="field-label">\u984C\u76EE <span class="field-tag">question</span></span>
        <textarea class="input" name="question" rows="4" required placeholder="\u8F38\u5165\u554F\u984C\uFF0Cllama-server \u6703\u56DE\u7B54\u4E26\u81EA\u52D5\u5224\u65B7\u984C\u578B\u3001\u96E3\u5EA6\u3001\u6CD5\u898F\uFF0F\u689D\u6587\u3001\u53C3\u8003\u7B54\u6848\u8207\u6A19\u7C64\u3002">${r(e.aiQuestion||"")}</textarea>
      </label>
      <p class="qb-form-hint">\u9001\u51FA\u5F8C\u7531\u672C\u6A5F llama-server \u56DE\u7B54\u4E26\u81EA\u52D5\u5EFA\u7ACB\u6B04\u4F4D\uFF1B\u984C\u76EE\u6703\u4EE5\u300C\u5F85\u5BE9\u300D\u5EFA\u7ACB\uFF0C\u4ECD\u9700\u4EBA\u5DE5\u8986\u6838\u5F8C\u624D\u6703\u6210\u70BA benchmark-ready\u3002</p>
      <div class="qb-actions">
        <button class="btn btn-primary" type="submit" ${e.aiLoading?"disabled":""}>${e.aiLoading?'<span class="spinner"></span><span>llama-server \u7522\u751F\u4E2D\u2026</span>':`${p("sparkles",14)}<span>\u8B93 llama-server \u7522\u751F\u4E26\u5EFA\u7ACB</span>`}</button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-ai" ${e.aiLoading?"disabled":""}>\u6E05\u9664</button>
      </div>
    </form>
    ${hi()}
  </section>`}var Hl=[["clarity","\u984C\u76EE\u6E05\u6670"],["labels","\u6CD5\u689D\u6A19\u6CE8"],["answer","\u53C3\u8003\u7B54\u6848"],["difficulty","\u96E3\u5EA6\u8207\u6A19\u7C64"],["overall","\u6574\u9AD4"]];function Ul(e){let t=Array.isArray(e?.reviews)?e.reviews:[],s=`<div class="side-card-head">
    <span class="side-card-title">${p("shield",14)}\u4EBA\u5DE5\u9A57\u6536\u6279\u6CE8\u5206\u6578</span>
    <span class="badge badge-neutral badge-mono">${c(t.length)} \u7B46</span>
  </div>`;if(!t.length)return`<section class="qb-review-scores-block">
      ${s}
      <div class="qb-empty qb-score-history-empty">\u5C1A\u7121\u4EBA\u5DE5\u9A57\u6536\u8A55\u5206\uFF1B\u5B8C\u6210\u9A57\u6536\u5F8C\u6703\u986F\u793A\u4E94\u9805\u5206\u6578\u8207\u6279\u6CE8\u3002</div>
    </section>`;let a=t.map(n=>{let i=n.rubric_scores||{};return`<tr>
        <td class="cell-date">${r($e(n.created_at))}</td>
        <td>${r(n.reviewer||"\u533F\u540D")}</td>
        ${Hl.map(([o])=>`<td class="cell-number"><strong class="qb-score-value ${Gl(i[o])}">${r(i[o]??"\u2014")}</strong></td>`).join("")}
        <td>${Na(n.decision==="approved"?"accepted":n.decision)}</td>
        <td class="qb-score-comment">${r(n.comment||"\u2014")}</td>
      </tr>`}).join("");return`<section class="qb-review-scores-block">
    ${s}
    <div class="table-wrap">
      <table class="data-table is-compact qb-score-history-table">
        <thead>
          <tr>
            <th scope="col">\u6642\u9593</th>
            <th scope="col">\u5BE9\u6838\u8005</th>
            ${Hl.map(([,n])=>`<th scope="col" class="cell-number">${n}</th>`).join("")}
            <th scope="col">\u7D50\u679C</th>
            <th scope="col">\u6279\u6CE8</th>
          </tr>
        </thead>
        <tbody>${a}</tbody>
      </table>
    </div>
  </section>`}function km(e){return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("edit",14)}\u7DE8\u8F2F\u984C\u76EE #${e.id}</span>
      <button class="btn btn-ghost btn-sm" type="button" data-qb-action="new">\u53D6\u6D88\u7DE8\u8F2F</button>
    </div>
    <form class="qb-form" data-qb-form="create" id="qb-create-form">
      <input type="hidden" name="item_id" value="${e.id}" />
      <label class="field qb-wide">
        <span class="field-label">\u984C\u76EE <span class="field-tag">question</span></span>
        <textarea class="input" name="question" rows="3" required placeholder="\u4F8B\u5982\uFF1A\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F">${r(e?.question||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u984C\u578B</span>
          <select class="select" name="question_type">${Object.entries(cs).map(([t,s])=>`<option value="${t}" ${e?.question_type===t?"selected":""}>${s}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u96E3\u5EA6</span>
          <select class="select" name="difficulty">${Object.entries(oa).map(([t,s])=>`<option value="${t}" ${e?.difficulty===t?"selected":""}>${s}</option>`).join("")}</select>
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
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${r(hm(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${r(vm(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${r($m(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${r(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${r(ym(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
        </label>
        <label class="field"><span class="field-label">\u5099\u8A3B</span>
          <input class="input" name="notes" value="${r(e?.notes||"")}" placeholder="\u4F86\u6E90\u3001\u6A19\u8A3B\u7406\u7531\u6216\u5F85\u78BA\u8A8D\u4E8B\u9805" />
        </label>
      </div>
      <label class="checkbox-field qb-checkbox">
        <input type="checkbox" name="must_refuse" ${e?.rubric?.must_refuse?"checked":""} />
        <span>\u6B64\u984C\u61C9\u6B63\u78BA\u62D2\u7D55\u56DE\u7B54\uFF08\u7121\u8CC7\u6599\uFF0F\u8D85\u51FA\u7BC4\u570D\uFF09</span>
      </label>
      <div class="qb-actions">
        <button class="btn btn-primary" type="submit">${p("check",14)}<span>\u5132\u5B58\u65B0\u7248\u672C</span></button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-create">\u6E05\u9664</button>
      </div>
      <div class="qb-form-hint">\u4FEE\u6539\u5DF2\u5B58\u5728\u7684\u984C\u76EE\u6703\u5EFA\u7ACB\u65B0\u7248\u672C\uFF1B\u5DF2\u6838\u51C6\u984C\u76EE\u4FEE\u6539\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002</div>
    </form>
    ${Ul(e)}
    ${hi()}
  </section>`}function Sm(e,t){return e?km(e):_m(t)}function Gl(e){let t=Number(e);return!Number.isFinite(t)||t<=0?"":t>=4?"is-green":t===3?"is-yellow":"is-red"}var xm=[["clarity","\u984C\u76EE\u6E05\u6670"],["labels","\u6CD5\u689D\u6A19\u6CE8"],["answer","\u53C3\u8003\u7B54\u6848"],["difficulty","\u96E3\u5EA6\u8207\u6A19\u7C64"],["overall","\u6574\u9AD4"]];function Am(e){let t=e?.latest_review||e?.reviews?.[0]||null;if(!t)return'<div class="qb-latest-scores is-empty">\u5C1A\u7121\u4EBA\u5DE5\u9A57\u6536\u8A55\u5206</div>';let s=t.rubric_scores||{};return`<div class="qb-latest-scores" title="${r(`${$e(t.created_at)} \xB7 ${t.reviewer||"\u533F\u540D"}`)}">
    <span class="qb-latest-scores-label">\u6700\u65B0\u8A55\u5206</span>
    ${xm.map(([a,n])=>`<span>${n} <strong class="qb-score-value ${Gl(s[a])}">${r(s[a]??"\u2014")}</strong></span>`).join("")}
    <span class="qb-latest-scores-meta">${r(t.reviewer||"\u533F\u540D")} \xB7 ${r($e(t.created_at))}</span>
  </div>`}function qm(e){let t=e.status==="retired"||!!e.deleted_at;return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${r(e.question)}</strong>
        <span class="qb-meta">
          ${r(cs[e.question_type]||e.question_type)}
          \xB7 ${r(oa[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${Na(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${bi(e)}
    <div class="qb-item-foot">
      <span>\u66F4\u65B0 ${r($e(e.updated_at))}</span>
      ${e.reviewed_by?`<span>\u5BE9\u6838 ${r(e.reviewed_by)}</span>`:""}
      ${e.review_comment?`<span class="qb-comment">${r(e.review_comment)}</span>`:""}
      <div class="qb-actions">
        ${t?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="restore" data-id="${e.id}">${p("refresh",13)}<span>\u5FA9\u539F\u984C\u76EE</span></button>`:`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${p("edit",13)}<span>\u7DE8\u8F2F</span></button>
               ${["pending_review","changes_requested"].includes(e.status)?"":`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="submit-review" data-id="${e.id}">${p("upload",13)}<span>${e.status==="draft"?"\u9001\u5BE9":"\u91CD\u65B0\u9001\u5BE9"}</span></button>`}
               <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${e.id}">${p("shield",13)}<span>\u9A57\u6536</span></button>
               <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${p("trash",13)}<span>\u522A\u9664</span></button>`}
      </div>
      ${Am(e)}
    </div>
  </article>`}function Mm(e){return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("database",14)}\u984C\u5EAB\u7BA1\u7406</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="new">${p("plus",13)}<span>\u65B0\u589E</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="revalidate">${p("refresh",13)}<span>\u91CD\u65B0\u9A57\u8B49</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="export">${p("download",13)}<span>\u532F\u51FA JSON</span></button>
      </div>
    </div>
    <form class="qb-filters" data-qb-form="filter">
      <input class="input" name="query" type="search" placeholder="\u641C\u5C0B\u984C\u76EE\u6216\u53C3\u8003\u7B54\u6848" value="${r(e.filters.query)}" />
      <select class="select" name="status">
        <option value="">\u5168\u90E8\u72C0\u614B</option>
        ${Object.entries(gi).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(cs).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(oa).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <div class="qb-tag-filter" data-qb-tag-filter>
        <div class="qb-tag-values">
          ${e.filters.tags.length?e.filters.tags.map(t=>`<span class="chip qb-tag-chip">${r(t)}<button class="qb-tag-remove" type="button" data-qb-action="remove-tag" data-tag="${r(t)}" aria-label="\u79FB\u9664\u6A19\u7C64 ${r(t)}">${p("x",9)}</button></span>`).join(""):'<span class="qb-tag-placeholder">\u6A19\u7C64</span>'}
        </div>
        <button class="qb-tag-add" type="button" data-qb-action="open-tag-search" aria-label="\u52A0\u5165\u6A19\u7C64" aria-haspopup="listbox">${p("plus",13)}</button>
        ${e.filters.tags.map(t=>`<input type="hidden" name="tags" value="${r(t)}" />`).join("")}
        <div class="qb-tag-popover" data-qb-tag-popover hidden>
          <input class="input" type="search" data-qb-tag-search placeholder="\u8F38\u5165\u76F8\u8FD1\u5B57\u641C\u5C0B\u6A19\u7C64\u2026" autocomplete="off" />
          <div class="qb-tag-results" data-qb-tag-results role="listbox" aria-live="polite"></div>
        </div>
      </div>
      <button class="btn btn-primary btn-sm" type="submit">${p("search",13)}<span>\u7BE9\u9078</span></button>
    </form>
    <div class="qb-list">
      ${e.items.length?e.items.map(t=>qm(t)).join(""):Ea("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${c(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}var Ql=[["queue","\u5F85\u5BE9\uFF0F\u9000\u56DE"],["accepted","\u5DF2\u6838\u51C6"],["rejected","\u5DF2\u62D2\u7D55"],["draft","\u8349\u7A3F"]];function Lm(e){let t=e.stats||{};return{queue:Number(t.pending_review||0)+Number(t.changes_requested||0),accepted:Number(t.accepted||0),rejected:Number(t.rejected||0),draft:Number(t.draft||0)}}function jm(e,t){let s=e.reviewFilter||"queue",a={queue:{title:"\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u6216\u9000\u56DE\u4FEE\u6539\u7684\u984C\u76EE\u3002",text:t.accepted?`\u5DF2\u6709 ${c(t.accepted)} \u984C\u6838\u51C6\u3002\u65B0\u984C\u76EE\u5EFA\u7ACB\u5F8C\u6703\u81EA\u52D5\u9001\u5BE9\uFF0C\u4E5F\u53EF\u4EE5\u5207\u63DB\u5230\u300C\u5DF2\u6838\u51C6\u300D\u91CD\u65B0\u9A57\u6536\u65E2\u6709\u984C\u76EE\u3002`:"\u5EFA\u7ACB\u984C\u76EE\u5F8C\u6703\u9810\u8A2D\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\uFF1B\u82E5\u53EA\u60F3\u5148\u4FDD\u5B58\uFF0C\u5EFA\u7ACB\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5373\u53EF\u5B58\u6210\u8349\u7A3F\u3002"},accepted:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u6838\u51C6\u984C\u76EE\u3002",text:"\u984C\u76EE\u901A\u904E\u4EBA\u5DE5\u9A57\u6536\u5F8C\u6703\u5217\u5728\u9019\u88E1\uFF1B\u4E5F\u53EF\u4EE5\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u9001\u51FA\u9A57\u6536\u3002"},rejected:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u62D2\u7D55\u984C\u76EE\u3002",text:"\u88AB\u62D2\u7D55\u7684\u984C\u76EE\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u4E2D\uFF0C\u53EF\u4FEE\u6539\u5F8C\u91CD\u65B0\u9001\u5BE9\u3002"},draft:{title:"\u76EE\u524D\u6C92\u6709\u8349\u7A3F\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u984C\u76EE\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5C31\u6703\u5B58\u6210\u8349\u7A3F\uFF0C\u4E4B\u5F8C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002"}}[s]||{title:"\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u65B0\u984C\u76EE\u5F8C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"},n=[s!=="draft"?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="new">${p("plus",13)}<span>\u65B0\u589E\u984C\u76EE</span></button>`:"",s==="queue"&&t.accepted?`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="review-filter" data-filter="accepted">${p("shield",13)}<span>\u67E5\u770B\u5DF2\u6838\u51C6 ${c(t.accepted)}</span></button>`:"",`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="go-manage">${p("database",13)}<span>\u524D\u5F80\u984C\u5EAB\u7BA1\u7406</span></button>`].filter(Boolean).join("");return`<div class="qb-empty qb-empty-block">
    <span class="qb-empty-icon">${p("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>${r(a.title)}</strong>
      <p>${r(a.text)}</p>
      <div class="qb-actions">${n}</div>
    </div>
  </div>`}function Tm(e){let t=Ql.find(([s])=>s===e);return t?t[1]:"\u5F85\u5BE9\uFF0F\u9000\u56DE"}function Em(e,t){return`<button class="qb-review-item${t?" is-active":""}" type="button" data-qb-action="select-review-item" data-id="${e.id}" aria-pressed="${t?"true":"false"}">
    <span class="qb-review-item-top">
      <span class="qb-id">#${e.id}</span>
      <span class="qb-review-item-meta">
        ${r(cs[e.question_type]||e.question_type)}
        \xB7 ${r(oa[e.difficulty]||e.difficulty)}
        \xB7 v${e.version}
        ${e.benchmark_ready?" \xB7 Benchmark ready":""}
        ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
      </span>
      ${Na(e.status)}
    </span>
    <strong>${r(e.question)}</strong>
  </button>`}function Nm(e){return`<article class="qb-review-pane-card">
    <div class="qb-review-pane-head">
      <div class="qb-review-pane-title">
        <span class="qb-review-item-meta">#${e.id} \xB7 v${e.version} \xB7 ${r(cs[e.question_type]||e.question_type)} \xB7 ${r(oa[e.difficulty]||e.difficulty)}</span>
        <strong>${r(e.question)}</strong>
      </div>
      <div class="qb-review-pane-side">
        ${Na(e.status)}
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${p("edit",13)}<span>\u7DE8\u8F2F</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${p("trash",13)}<span>\u522A\u9664</span></button>
        </div>
      </div>
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${bi(e)}
    ${e.review_comment?`<div class="qb-review-note"><span class="summary-label">\u6700\u8FD1\u6279\u6CE8${e.reviewed_by?` \xB7 ${r(e.reviewed_by)}`:""}</span><p>${r(e.review_comment)}</p></div>`:""}
    ${e.reference_answer?`<div class="qb-reference"><span class="summary-label">\u53C3\u8003\u7B54\u6848</span><p>${r(e.reference_answer)}</p></div>`:""}
    <form class="qb-review-form" data-qb-form="review" data-id="${e.id}">
      <div class="qb-score-grid">
        ${[["clarity","\u984C\u76EE\u6E05\u6670"],["labels","\u6CD5\u689D\u6A19\u6CE8"],["answer","\u53C3\u8003\u7B54\u6848"],["difficulty","\u96E3\u5EA6\u8207\u6A19\u7C64"],["overall","\u6574\u9AD4"]].map(([t,s])=>Va({name:`score_${t}`,label:s,value:4})).join("")}
      </div>
      <label class="field"><span class="field-label">\u6279\u6CE8</span><textarea class="input" name="comment" rows="3" placeholder="\u6A19\u8A3B\u7406\u7531\u3001\u9700\u8981\u4FEE\u6539\u7684\u6B04\u4F4D\uFF0C\u6216\u9A57\u6536\u7D50\u8AD6\u3002"></textarea></label>
      <div class="qb-actions qb-review-decisions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="decide" data-decision="approved">${p("check",13)}<span>\u6838\u51C6</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="decide" data-decision="changes_requested">${p("edit",13)}<span>\u9000\u56DE\u4FEE\u6539</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-qb-action="decide" data-decision="rejected">${p("x",13)}<span>\u62D2\u7D55</span></button>
      </div>
    </form>
    ${Ul(e)}
  </article>`}function Rm(){return`<div class="qb-empty qb-empty-block qb-review-placeholder">
    <span class="qb-empty-icon">${p("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>\u5F9E\u5DE6\u5074\u9078\u64C7\u984C\u76EE</strong>
      <p>\u9EDE\u9078\u984C\u76EE\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u984C\u5E79\u3001\u9810\u671F\u6A19\u8A3B\u3001\u53C3\u8003\u7B54\u6848\u8207\u6838\u51C6\u9078\u9805\u3002</p>
    </div>
  </div>`}function Cm(e){let t=e.reviewDetail,s=Lm(e),a=e.reviewFilter||"queue",n=Ql.map(([l,d])=>`<button class="chip qb-review-tab${a===l?" is-active":""}" type="button" role="tab" aria-selected="${a===l?"true":"false"}" data-qb-action="review-filter" data-filter="${l}"><span>${d}</span><span class="qb-review-tab-count">${c(s[l]||0)}</span></button>`).join(""),i=e.reviewItems.length?e.reviewItems.map(l=>Em(l,Number(t?.id)===Number(l.id))).join(""):`<div class="qb-empty qb-empty-compact">${p("info",16)}<span>\u76EE\u524D\u6C92\u6709${r(Tm(a))}\u984C\u76EE\u3002</span></div>`,o=t?Nm(t):e.reviewItems.length?Rm():jm(e,s);return`<section class="report-card qb-card qb-review-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("shield",14)}\u984C\u5EAB\u4EBA\u5DE5\u9A57\u6536\u6279\u6CE8</span>
      <span class="badge ${s.queue?"badge-warn":"badge-neutral"}">\u5F85\u5BE9 ${c(s.queue)}</span>
    </div>
    <p class="qb-review-hint">\u65B0\u984C\u76EE\u5EFA\u7ACB\u6216\u4FEE\u6539\u5F8C\u6703\u9032\u5165\u5F85\u5BE9\uFF1B\u9EDE\u9078\u5DE6\u5074\u984C\u76EE\u5373\u53EF\u5728\u53F3\u5074\u67E5\u770B\u5167\u5BB9\u3001\u6838\u51C6\u3001\u9000\u56DE\u6216\u522A\u9664\u3002</p>
    <div class="qb-review-split">
      <aside class="qb-review-list-pane" aria-label="\u9A57\u6536\u984C\u76EE\u6E05\u55AE">
        <div class="qb-review-tabs" role="tablist" aria-label="\u9A57\u6536\u72C0\u614B">${n}</div>
        <div class="qb-review-list">${i}</div>
      </aside>
      <section class="qb-review-detail-pane" aria-live="polite">${o}</section>
    </div>
  </section>`}function Ta(e){if(e==null||e==="")return"";let t=Number(e);return Number.isFinite(t)?`${Math.round(t*100)}%`:""}function Pm(e){if(!e||typeof e!="object")return"\u5F15\u7528";let t=String(e.jid||"").trim();if(t)return t;let s=String(e.law_name||"").trim(),a=String(e.article_no||"").trim(),n=`${s} ${a}`.trim();return n||String(e.title||e.text||"\u5F15\u7528").slice(0,80)}function Im(e){let t=e?.metrics||{},s=t.scores||{},a=[["\u6CD5\u898F\u53EC\u56DE",Ta(t.law_recall)],["\u689D\u6587\u53EC\u56DE",Ta(t.article_recall)],["\u898F\u5247\u5206",Ta(s.deterministic)],["Judge",Ta(s.judge)],["\u4EBA\u5DE5",Ta(s.human)]].filter(([,n])=>n);return a.length?`<div class="qb-bank-stats">${a.map(([n,i])=>`<span class="qb-bank-stat"><span>${r(n)}</span><strong>${r(i)}</strong></span>`).join("")}</div>`:""}function Dm(e){let t=Array.isArray(e?.law_sources)?e.law_sources:[],s=Array.isArray(e?.citations)?e.citations:[],a=t.length?`<div class="qb-bank-sources">${t.map(i=>{let o=String(i.law_name||"\u672A\u547D\u540D\u6CD5\u898F"),l=(i.articles||[]).map(m=>String(m.article_no||"").trim()).filter(Boolean),d=`<strong>${r(o)}</strong>${l.length?`<small>${r(l.join("\u3001"))}</small>`:""}`;return i.law_url?`<a class="qb-bank-law" href="${r(It(i.law_url))}" target="_blank" rel="noreferrer">${d}</a>`:`<span class="qb-bank-law">${d}</span>`}).join("")}</div>`:"",n=s.length?`<div class="qb-bank-sources qb-bank-citations">${s.map(i=>`<span class="chip chip-mono">${r(Pm(i))}</span>`).join("")}</div>`:"";return!a&&!n?"":`<div class="qb-bank-answer-block">
    <div class="qb-bank-section-label"><span>\u5F15\u7528\u4F86\u6E90</span><span>${c(t.length+s.length)} \u7B46</span></div>
    ${a}${n}
  </div>`}function Jl(e,t){if(!e)return`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${p("history",20)}</span>
      <strong>\u5C1A\u7121 RAG \u7B54\u6848</strong>
      <span>\u8DD1\u4E00\u6B21 Benchmark \u5F8C\uFF0C\u6700\u8FD1\u4E00\u6B21\u6210\u529F\u56DE\u7B54\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</span>
    </div>`;let s=Number(e.item_version||0),a=Number(t?.version||0),n=s&&a&&s!==a?`<span class="badge badge-warn">\u7B54\u6848 v${s} \xB7 \u984C\u76EE v${a}</span>`:"",i=e.answer_source==="llm"?"LLM \u751F\u6210":e.answer_source==="structured"?"\u6CD5\u898F\u8CC7\u6599\u5EAB":String(e.answer_source||"RAG");return`<div class="qb-bank-answer-meta">
      <span class="badge badge-ok"><span class="status-dot is-ok"></span>RAG \u5B8C\u6210</span>
      <span class="badge badge-neutral">${r(i)}</span>
      ${n}
      <span class="mono">${r(e.run_label||e.run_id||"")}</span>
      <span>${r($e(e.finished_at))}</span>
      <span>${r(ge(e.duration_ms))}</span>
      ${e.llm_model?`<span class="mono">${r(e.llm_model)}</span>`:""}
    </div>
    <div class="qb-bank-answer-block">
      <div class="qb-bank-section-label"><span>\u56DE\u7B54</span><span>${c(String(e.answer||"").length)} \u5B57</span></div>
      <p class="qb-bank-answer-text">${r(String(e.answer||"").trim()||"\uFF08\u7A7A\u767D\u56DE\u7B54\uFF09")}</p>
    </div>
    ${Dm(e)}
    ${Im(e)}`}function Wl(e,t){let s=e.selectedSuiteId,a=t&&e.suiteAnswers?.[String(s)]?.[String(t.id)]||null;return t?`<div class="qb-bank-answer-head">
      <div class="qb-bank-answer-heading">
        <span class="qb-bank-answer-kicker">${p("sparkles",12)}RAG \u6700\u8FD1\u4E00\u6B21\u7B54\u6848</span>
        <strong class="qb-bank-answer-question">#${t.id} ${r(t.question)}</strong>
      </div>
      ${a?`<span class="qb-bank-answer-state">${r(cs[t.question_type]||t.question_type)} \xB7 v${t.version}</span>`:""}
    </div>
    ${Jl(a,t)}`:`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${p("cube",20)}</span>
      <strong>\u9078\u64C7\u984C\u76EE</strong>
      <span>\u5F9E\u5DE6\u5074\u6E05\u55AE\u9078\u64C7\u4E00\u984C\uFF0C\u67E5\u770B\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`}function Vl(e){return`<span class="qb-bank-actions">
    <button class="qb-bank-icon" type="button" data-qb-action="edit" data-id="${e.id}" title="\u7DE8\u8F2F\u984C\u76EE" aria-label="\u7DE8\u8F2F\u984C\u76EE #${e.id}">${p("edit",13)}</button>
    <button class="qb-bank-icon is-danger" type="button" data-qb-action="delete" data-id="${e.id}" title="\u5F9E\u984C\u5EAB\u79FB\u9664" aria-label="\u5F9E\u984C\u5EAB\u79FB\u9664 #${e.id}">${p("trash",13)}</button>
  </span>`}function Bm(e,t,{selected:s,hasAnswer:a}){return`<div class="qb-bank-row${s?" is-active":""}" data-id="${e.id}">
    <button class="qb-bank-select" type="button" data-qb-action="select-bank-item" data-id="${e.id}" aria-pressed="${s?"true":"false"}">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <span class="qb-bank-item-copy">
        <strong>${r(e.question)}</strong>
        <small>${r(cs[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${a?"\u5DF2\u6709 RAG \u7B54\u6848":"\u5C1A\u7121 RAG \u7B54\u6848"}</small>
      </span>
    </button>
    ${Vl(e)}
  </div>`}function Fm(e,t,s){return`<article class="qb-bank-full-item" data-id="${e.id}">
    <div class="qb-bank-full-head">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <div class="qb-bank-full-title">
        <strong>${r(e.question)}</strong>
        <small>${r(cs[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${r(gi[e.status]?.label||e.status||"")}</small>
      </div>
      ${Vl(e)}
    </div>
    ${Jl(s,e)}
  </article>`}function zl(e){let t=e.editingSuite,s=Array.isArray(e.suites)?e.suites:[],a=s.find(u=>Number(u.id)===Number(e.selectedSuiteId))||s[0]||null,n=Array.isArray(a?.items)?a.items:[],i=e.suiteAnswers?.[String(a?.id)]||{},o=n.find(u=>Number(u.id)===Number(e.selectedBankItemId))||null,l=!!e.suiteAnswersLoading,d=String(e.suiteAnswersError||""),m=!!e.suiteManageOpen||!s.length,f=e.bankTab==="full"?"full":"split",y=s.length?`<div class="qb-bank-tabs" role="tablist" aria-label="Benchmark \u984C\u5EAB\u6AA2\u8996">
        <button class="qb-bank-tab${f==="split"?" is-active":""}" type="button" role="tab" aria-selected="${f==="split"?"true":"false"}" data-qb-action="bank-tab" data-tab="split">${p("grid",13)}<span>Benchmark \u984C\u5EAB</span><span class="badge badge-neutral">${c(n.length)}</span></button>
        <button class="qb-bank-tab${f==="full"?" is-active":""}" type="button" role="tab" aria-selected="${f==="full"?"true":"false"}" data-qb-action="bank-tab" data-tab="full">${p("table",13)}<span>\u984C\u5EAB\u5168\u5217\u8868</span><span class="badge badge-neutral">${c(n.length)}</span></button>
      </div>`:"",v="";if(!s.length)v=`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${p("cube",20)}</span>
      <strong>\u5C1A\u672A\u5EFA\u7ACB Benchmark \u984C\u5EAB</strong>
      <span>\u5C55\u958B\u4E0B\u65B9 Suite \u8A2D\u5B9A\u4E26\u5EFA\u7ACB\u984C\u5EAB\u5F8C\uFF0C\u5C31\u80FD\u5728\u9019\u88E1\u700F\u89BD\u984C\u76EE\u8207\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`;else if(l)v='<div class="qb-bank-loading"><span class="spinner" aria-hidden="true"></span><span>\u8B80\u53D6\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u4E2D\u2026</span></div>';else{let u=d?Ge({tone:"warn",title:"\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u8B80\u53D6\u5931\u6557",text:r(d)}):"";f==="full"?v=`${u}<div class="qb-bank-full" data-qb-bank-view="full">${n.length?n.map((b,w)=>Fm(b,w,i[String(b.id)]||null)).join(""):Ea("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>`:v=`${u}<div class="qb-bank-split" data-qb-bank-view="split">
        <div class="qb-bank-list" data-qb-bank-list>${n.length?n.map((b,w)=>Bm(b,w,{selected:Number(b.id)===Number(o?.id),hasAnswer:!!i[String(b.id)]})).join(""):Ea("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>
        <div class="qb-bank-answer-pane" data-qb-bank-answer>${Wl(e,o)}</div>
      </div>`}return`<section class="report-card qb-card qb-bank-card">
    <div class="side-card-head qb-bank-head">
      <div class="qb-bank-heading">
        <span class="side-card-title">${p("cube",14)}Benchmark \u984C\u5EAB</span>
        <span class="qb-bank-sub">${a?`${r(a.name)} \xB7 v${a.version} \xB7 ${c(a.item_count)} \u984C`:"\u5C1A\u672A\u5EFA\u7ACB suite"}</span>
      </div>
      <div class="qb-bank-controls">
        ${s.length?`<label class="qb-suite-picker"><span>Suite</span><select class="select" data-qb-suite-select aria-label="\u9078\u64C7 benchmark suite">${s.map(u=>`<option value="${u.id}" ${Number(u.id)===Number(a?.id)?"selected":""}>${r(u.name)} \xB7 ${c(u.item_count)} \u984C</option>`).join("")}</select></label>`:""}
        ${a?`<span class="badge ${a.status==="frozen"?"badge-ok":"badge-neutral"}">${a.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>`:""}
      </div>
    </div>
    ${y}
    ${v}
    <details class="qb-suite-manage" ${m?"open":""}>
      <summary>${p("sliders",14)}Suite \u8A2D\u5B9A\u8207\u7248\u672C <span class="qb-muted">${c(s.length)} \u500B suite \xB7 ${c(e.ready.length)} \u984C benchmark-ready</span></summary>
      <div class="qb-suite-manage-body">
        <form class="qb-suite-form" data-qb-form="suite">
          <input type="hidden" name="suite_id" value="${t?.id||""}" />
          <div class="qb-form-grid">
            <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${r(t?.name||"Pilot 30")}" /></label>
            <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(Ol).map(([u,b])=>`<option value="${u}" ${t?.tier===u?"selected":""}>${b}</option>`).join("")}</select></label>
          </div>
          <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${r(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
          <div class="qb-check-list">
            ${e.ready.length?e.ready.map(u=>{let b=t?t.items?.some(w=>Number(w.id)===Number(u.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${u.id}" ${b?"checked":""}/><span><strong>#${u.id}</strong> ${r(u.question)} <small>${r(cs[u.question_type]||u.question_type)}</small></span></label>`}).join(""):Ea("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
          </div>
          <div class="qb-actions">
            <button class="btn btn-primary" type="submit">${p("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
            ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
          </div>
        </form>
        <div class="qb-list">
          ${s.length?s.map(u=>`<article class="qb-suite">
            <div class="qb-item-head">
              <div class="qb-item-title"><strong>${r(u.name)}</strong><span class="qb-meta">${r(Ol[u.tier]||u.tier)} \xB7 v${u.version} \xB7 ${c(u.item_count)} \u984C</span></div>
              <span class="badge ${u.status==="frozen"?"badge-ok":"badge-neutral"}">${u.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
            </div>
            <div class="qb-suite-items">${(u.items||[]).slice(0,8).map(b=>`<span class="chip">#${b.id} ${r(b.question.slice(0,22))}${b.question.length>22?"\u2026":""}</span>`).join("")}${u.item_count>8?`<span class="qb-muted">+${u.item_count-8}</span>`:""}</div>
            <div class="qb-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${u.id}">${p("edit",13)}<span>\u7DE8\u8F2F suite</span></button>
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${u.id}">${p("shield",13)}<span>\u51CD\u7D50</span></button>
              <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${u.id}">${p("trash",13)}<span>\u522A\u9664</span></button>
            </div>
          </article>`).join(""):Ea("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
        </div>
      </div>
    </details>
  </section>`}function Om(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),n=Number(a?.value);Number.isFinite(n)&&(t[s]=Math.max(1,Math.min(5,Math.round(n))))}return t}function Hm(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:gm(t.get("expected_laws")),expected_articles:fm(t.get("expected_articles")),expected_judgments:bm(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function Kl(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},n={tab:"",editing:null,editingFrom:"",editingSuite:null,aiQuestion:"",aiLoading:!1,aiResult:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tags:[]},stats:{},suites:[],ready:[],selectedSuiteId:null,selectedBankItemId:null,bankTab:"split",suiteAnswers:{},suiteAnswersLoading:!1,suiteAnswersError:"",suiteManageOpen:!1,reviewItems:[],reviewDetail:null,reviewFilter:"queue"},i=C=>e.querySelector(`#quality-panel-${a[C]}`),o=(C,D)=>{C&&(C.childElementCount?C.setAttribute("aria-busy","true"):C.innerHTML=`<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>${D}</span></div></section>`)},l=C=>{C?.removeAttribute("aria-busy")},d=0,m=null,f=()=>"anonymous",y=()=>{s&&s(n.stats)},v=C=>{t&&t(C),Z(C)},u=async()=>{try{n.stats=await Q.questionBankStats()}catch{n.stats={}}y()},b=()=>{let C=i("create");C&&(C.innerHTML=Sm(n.editing,n))},w=(C,D)=>{let W=C?.querySelector("[data-qb-tag-results]");W&&(W.innerHTML=D.length?D.map(I=>`<button class="qb-tag-option" type="button" role="option" data-qb-action="select-tag" data-tag="${r(I.tag)}"><span>${r(I.tag)}</span><small>${c(I.count)}</small></button>`).join(""):'<div class="qb-tag-empty">\u6C92\u6709\u5176\u4ED6\u76F8\u7B26\u6A19\u7C64</div>')},k=async(C,D="")=>{if(!C)return;let W=C.querySelector("[data-qb-tag-results]"),I=++d;W&&(W.innerHTML='<div class="qb-tag-loading"><span class="spinner"></span><span>\u641C\u5C0B\u6A19\u7C64\u2026</span></div>');try{let H=await Q.questionBankTags(D,12);if(I!==d)return;let J=(H.tags||[]).filter(we=>!n.filters.tags.includes(we.tag));w(C,J)}catch(H){if(I!==d)return;W&&(W.innerHTML=`<div class="qb-tag-empty">${r(H.message||"\u6A19\u7C64\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},A=(C,{focus:D=!1}={})=>{if(!C)return;let W=C.querySelector("[data-qb-tag-popover]"),I=C.querySelector("[data-qb-tag-search]");!W||!I||(W.hidden&&(W.hidden=!1,I.value="",k(C,"")),D&&(I.focus(),I.select()))},S=C=>{m&&(window.clearTimeout(m),m=null);let D=C?.querySelector("[data-qb-tag-popover]");D&&(D.hidden=!0)},$=async C=>{let D=String(C||"").trim();D&&(n.filters.tags.includes(D)?n.filters.tags=n.filters.tags.filter(W=>W!==D):n.filters.tags=[...n.filters.tags,D],n.offset=0,await q())},T=()=>{let C=Array.isArray(n.suites)?n.suites:[];if(!C.length)return n.selectedSuiteId=null,n.selectedBankItemId=null,null;let D=C.find(I=>Number(I.id)===Number(n.selectedSuiteId));D||(D=C[0],n.selectedSuiteId=D.id,n.selectedBankItemId=null);let W=Array.isArray(D.items)?D.items:[];return W.some(I=>Number(I.id)===Number(n.selectedBankItemId))||(n.selectedBankItemId=W[0]?.id??null),D},K=()=>{let C=i("suite");C&&(C.innerHTML=zl(n))},G=0,fe=async(C,{force:D=!1}={})=>{if(!C)return;let W=++G;if(!D&&n.suiteAnswers[String(C)]){n.suiteAnswersLoading=!1,n.suiteAnswersError="",K();return}n.suiteAnswersLoading=!0,n.suiteAnswersError="",K();try{let I=await Q.benchmarkSuiteLatestAnswers(C);if(W!==G)return;n.suiteAnswers[String(C)]=I.answers||{}}catch(I){if(W!==G)return;n.suiteAnswersError=I.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}finally{W===G&&(n.suiteAnswersLoading=!1,K())}},ye=async C=>{n.selectedSuiteId=C,n.selectedBankItemId=null,n.suiteAnswersError="";let D=T();if(!D){K();return}await fe(D.id)},ie=C=>{n.bankTab=C==="full"?"full":"split",K()},L=()=>{let C=i("suite");if(!C)return;let D=T(),I=(Array.isArray(D?.items)?D.items:[]).find(J=>Number(J.id)===Number(n.selectedBankItemId))||null;for(let J of C.querySelectorAll(".qb-bank-row")){let we=Number(J.dataset.id)===Number(n.selectedBankItemId);J.classList.toggle("is-active",we);let Oe=J.querySelector("[data-qb-action='select-bank-item']");Oe&&Oe.setAttribute("aria-pressed",we?"true":"false")}let H=C.querySelector("[data-qb-bank-answer]");H&&(H.innerHTML=Wl(n,I))},q=async()=>{let C=i("manage");if(C){m&&(window.clearTimeout(m),m=null),o(C,"\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026");try{let D=await Q.questionBankItems({...n.filters,...n.filters.status==="retired"?{include_deleted:!0}:{}},n.limit,n.offset);n.items=D.items||[],n.total=Number(D.total||0),n.stats=D.stats||n.stats,l(C),C.innerHTML=Mm(n),y()}catch(D){l(C),C.innerHTML=`<section class="report-card qb-card">${Ge({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(D.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},j=async({refreshAnswers:C=!1}={})=>{let D=i("suite");if(D){o(D,"\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026");try{let[W,I]=await Promise.all([Q.benchmarkSuites(),Q.benchmarkReadyQuestions(300)]);n.suites=W.suites||[],n.ready=I.items||[];let H=T();if(n.suiteAnswersError="",n.suiteAnswersLoading=!1,H&&(C||!n.suiteAnswers[String(H.id)]))try{let J=await Q.benchmarkSuiteLatestAnswers(H.id);n.suiteAnswers[String(H.id)]=J.answers||{}}catch(J){n.suiteAnswersError=J.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}l(D),D.innerHTML=zl(n)}catch(W){l(D),D.innerHTML=`<section class="report-card qb-card">${Ge({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(W.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},V=()=>{let C=i("review");C&&(C.innerHTML=Cm(n))},de=async C=>{let D=n.reviewItems.find(I=>Number(I.id)===Number(C));if(!D)return;n.reviewDetail=D,V();let W=i("review")?.querySelector(".qb-review-detail-pane");W&&window.matchMedia("(max-width: 1020px)").matches&&W.scrollIntoView({behavior:"smooth",block:"start"});try{let I=await Q.questionBankItem(D.id);Number(n.reviewDetail?.id)===Number(D.id)&&(n.reviewDetail=I,V())}catch(I){R(I.message||"\u984C\u76EE\u5167\u5BB9\u8B80\u53D6\u5931\u6557\u3002","danger")}},z=async()=>{let C=i("review");if(!C)return;o(C,"\u8B80\u53D6\u9A57\u6536\u984C\u76EE\u4E2D\u2026");let D=n.reviewFilter||"queue",W=D==="queue"?["pending_review","changes_requested"]:D==="accepted"?["accepted"]:D==="rejected"?["rejected"]:["draft"];try{let I=await Promise.all(W.map(Oe=>Q.questionBankItems({status:Oe},200,0)));n.reviewItems=I.flatMap(Oe=>Oe.items||[]),n.stats=I[0]?.stats||n.stats;let H=Number(n.reviewDetail?.id||0),we=n.reviewItems.some(Oe=>Number(Oe.id)===H)?H:Number(n.reviewItems[0]?.id||0);n.reviewDetail=we?await Q.questionBankItem(we):null,l(C),V(),y()}catch(I){l(C),C.innerHTML=`<section class="report-card qb-card">${Ge({tone:"danger",title:"\u9A57\u6536\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:r(I.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}};function Z(C){let D=n.tab;n.tab=C;for(let W of Object.keys(a)){let I=i(W);I&&(I.hidden=W!==C)}C==="create"?(D!=="create"&&!n.editing&&(n.aiQuestion="",n.aiResult=null),b()):C==="manage"?q():C==="suite"?j():C==="review"&&z()}let qe=C=>{let W=[...n.items,...n.reviewItems,...n.reviewDetail?[n.reviewDetail]:[]].find(H=>Number(H.id)===Number(C));n.reviewDetail=W||{id:Number(C)};let I=W?.status;["accepted","rejected","draft"].includes(I)?n.reviewFilter=I:I&&(n.reviewFilter="queue"),v("review")},F=async C=>{let D=Hm(C),W=Number(C.elements.item_id?.value||0);W||(D.status=C.elements.submit_for_review?.checked?"pending_review":"draft");try{W?(await Q.updateQuestionBankItem(W,{...D,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),R("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await Q.createQuestionBankItem(D),R(D.status==="draft"?"\u984C\u76EE\u5DF2\u5B58\u70BA\u8349\u7A3F\uFF0C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002":"\u984C\u76EE\u5DF2\u5EFA\u7ACB\u4E26\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok")),n.editing=null;let I=["manage","suite","review"].includes(n.editingFrom)?n.editingFrom:"manage";n.editingFrom="",n.suiteAnswers={},await u(),v(I)}catch(I){let H=I.detail||I.payload?.detail,J=H?.errors?.join(" \xB7 ")||H?.message||I.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";R(J,"danger",8e3)}},ke=async C=>{let D=String(new FormData(C).get("question")||"").trim();if(D.length<4){R("\u984C\u76EE\u81F3\u5C11\u9700\u8981 4 \u500B\u5B57\u3002","danger");return}n.aiQuestion=D,n.aiLoading=!0,n.aiResult=null,b();try{let W=await Q.createQuestionBankItemWithAI({question:D});n.aiResult=W,n.aiQuestion="",await u(),R(`llama-server \u5DF2\u5EFA\u7ACB\u984C\u76EE #${W.item.id}\uFF0C\u72C0\u614B\u70BA\u5F85\u5BE9\uFF0C\u8ACB\u4EBA\u5DE5\u8986\u6838\u3002`,"ok",8e3)}catch(W){let I=W.detail||W.payload?.detail,H=I?.errors?.join(" \xB7 ")||I?.message||W.message||"llama-server \u7522\u751F\u5931\u6557\u3002";R(H,"danger",12e3)}finally{n.aiLoading=!1,b()}},ne=async(C,D)=>{let W=Number(C.dataset.id||0);if(W)try{await Q.reviewQuestionBankItem(W,{decision:D,reviewer:f(),rubric_scores:Om(C),comment:String(C.querySelector('[name="comment"]')?.value||"")}),R(D==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":D==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",D==="approved"?"ok":"info"),await u(),await z()}catch(I){let H=I.detail||I.payload?.detail,J=H?.errors?.join(" \xB7 ")||H?.message||I.message||"\u9A57\u6536\u5931\u6557\u3002";R(J,"danger",8e3)}},Se=async C=>{let D=new FormData(C),W=Number(D.get("suite_id")||0),I=Array.from(C.querySelectorAll('input[name="item_ids"]:checked')).map(J=>Number(J.value)),H={name:String(D.get("name")||"").trim(),tier:String(D.get("tier")||"core"),description:String(D.get("description")||"").trim(),item_ids:I};try{W?(await Q.updateBenchmarkSuite(W,H),R("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await Q.createBenchmarkSuite(H),R("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),n.editingSuite=null,n.suiteManageOpen=!0,n.suiteAnswers={},await j()}catch(J){let we=J.detail||J.payload?.detail,Oe=we?.errors?.join(" \xB7 ")||we?.message||J.message||"Suite \u5132\u5B58\u5931\u6557\u3002";R(Oe,"danger",8e3)}},Pe=async C=>{let D=e.querySelector("[data-qb-tag-filter] [data-qb-tag-popover]:not([hidden])")?.closest("[data-qb-tag-filter]");D&&!C.target.closest("[data-qb-tag-filter]")&&S(D);let W=C.target.closest("[data-qb-action]")?.dataset.qbAction;if(!W)return;let I=C.target.closest("[data-qb-action]"),H=Number(I.dataset.id||0);if(W==="open-tag-search"){let J=I.closest("[data-qb-tag-filter]");A(J,{focus:!0});return}if(W==="select-tag"){await $(I.dataset.tag);return}if(W==="remove-tag"){await $(I.dataset.tag);return}if(W==="bank-tab"){ie(I.dataset.tab);return}if(W==="select-bank-item"){n.selectedBankItemId=H,L();return}if(W==="new"){n.editing=null,n.editingFrom="",n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,v("create");return}if(W==="reset-create"){n.editing=null,b();return}if(W==="reset-ai"){n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,b();return}if(W==="edit"){let J=n.suites.find(ct=>Number(ct.id)===Number(n.selectedSuiteId)),Oe=[...n.items,...n.reviewItems,...J?.items||[],...n.reviewDetail?[n.reviewDetail]:[]].find(ct=>Number(ct.id)===H);if(!Oe)return;let Ve=Oe;try{Ve=await Q.questionBankItem(H)}catch{Ve=Oe}n.editing=Ve||Oe,n.editingFrom=n.tab,v("create");return}if(W==="review"){qe(H);return}if(W==="review-ai-item"){let J=n.aiResult?.item;if(!J)return;n.reviewFilter="queue",n.reviewDetail=J,v("review");return}if(W==="review-filter"){let J=String(I.dataset.filter||"queue");n.reviewFilter=["queue","accepted","rejected","draft"].includes(J)?J:"queue",n.reviewDetail=null,await z();return}if(W==="select-review-item"){await de(H);return}if(W==="go-manage"){v("manage");return}if(W==="submit-review"){try{await Q.submitQuestionBankItemForReview(H),R("\u5DF2\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok"),await u(),n.tab==="manage"?await q():n.tab==="review"&&await z()}catch(J){let we=J.detail||J.payload?.detail,Oe=we?.errors?.join(" \xB7 ")||we?.message||J.message||"\u9001\u5BE9\u5931\u6557\u3002";R(Oe,"danger",8e3)}return}if(W==="restore"){if(!window.confirm(`\u78BA\u5B9A\u5FA9\u539F\u984C\u76EE #${H}\uFF1F\u5FA9\u539F\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\u72C0\u614B\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002`))return;try{await Q.restoreQuestionBankItem(H),R("\u984C\u76EE\u5DF2\u5FA9\u539F\u4E26\u56DE\u5230\u5F85\u5BE9\u3002","ok"),await u(),await q()}catch(J){let we=J.detail||J.payload?.detail,Oe=we?.errors?.join(" \xB7 ")||we?.message||J.message||"\u5FA9\u539F\u5931\u6557\u3002";R(Oe,"danger",8e3)}return}if(W==="delete"){if(n.tab==="suite"){let J=T();if(!J||!(J.items||[]).find(Oe=>Number(Oe.id)===H)||!window.confirm(`\u78BA\u5B9A\u5F9E\u300C${J.name}\u300D\u79FB\u9664\u984C\u76EE #${H}\uFF1F\u984C\u76EE\u4ECD\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u7BA1\u7406\u4E2D\u3002`))return;try{await Q.removeBenchmarkSuiteItem(J.id,H),R("\u5DF2\u5F9E Benchmark \u984C\u5EAB\u79FB\u9664\u3002","info"),delete n.suiteAnswers[String(J.id)],Number(n.selectedBankItemId)===H&&(n.selectedBankItemId=null),await j()}catch(Oe){R(Oe.message||"\u79FB\u9664\u5931\u6557\u3002","danger")}return}if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${H}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await Q.deleteQuestionBankItem(H),R("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await u(),n.tab==="review"?(n.reviewDetail=null,await z()):await q()}catch(J){R(J.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(W==="revalidate"){try{let J=await Q.revalidateQuestionBank();R(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${c(J.checked||0)} \u984C\uFF0C${c(J.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await u(),await q()}catch(J){R(J.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(W==="export"){try{let J=await Q.exportQuestionBank({status:""});Vt(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(J,null,2),"application/json;charset=utf-8")}catch(J){R(J.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(W==="import-json"){let J=e.querySelector("#qb-import-json");try{let we=JSON.parse(String(J?.value||"").trim()),Oe=await Q.importQuestionBank(we);R(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${Oe.created}\u3001\u66F4\u65B0 ${Oe.updated}\u3001\u932F\u8AA4 ${(Oe.errors||[]).length}\u3002`,(Oe.errors||[]).length?"warn":"ok",8e3),J&&(J.value=""),await u(),await q()}catch(we){R(we.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(W==="prev"||W==="next"){n.offset=Math.max(0,n.offset+(W==="next"?n.limit:-n.limit)),await q();return}if(W==="suite-edit"){let J=n.suites.find(we=>Number(we.id)===H);if(!J)return;n.editingSuite=J,n.suiteManageOpen=!0,j();return}if(W==="suite-new"){n.editingSuite=null,n.suiteManageOpen=!0,j();return}if(W==="suite-freeze"){try{await Q.updateBenchmarkSuite(H,{freeze:!0}),R("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),n.editingSuite=null,n.suiteManageOpen=!0,await j()}catch(J){R(J.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(W==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${H}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await Q.deleteBenchmarkSuite(H),R("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),n.editingSuite=null,n.suiteAnswers={},n.suiteManageOpen=!0,await j()}catch(J){R(J.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(W==="decide"){let J=I.closest("form[data-qb-form='review']");J&&await ne(J,String(I.dataset.decision||""))}},Le=async C=>{let D=C.target.closest("[data-qb-form]");if(!D)return;C.preventDefault();let W=D.dataset.qbForm;if(W==="create")await F(D);else if(W==="ai-create")await ke(D);else if(W==="filter"){let I=new FormData(D);n.filters={query:String(I.get("query")||"").trim(),status:String(I.get("status")||""),question_type:String(I.get("question_type")||""),difficulty:String(I.get("difficulty")||""),tags:I.getAll("tags").map(H=>String(H).trim()).filter(Boolean)},n.offset=0,await q()}else W==="suite"&&await Se(D)},Ze=async C=>{let D=C.target.closest?.("form[data-qb-form='filter'] select");if(D){D.form.requestSubmit();return}let W=C.target.closest?.("[data-qb-suite-select]");if(!W)return;let I=Number(W.value||0);!I||I===Number(n.selectedSuiteId)||await ye(I)},he=C=>{let D=C.target;D?.matches?.(".qb-suite-manage")&&(n.suiteManageOpen=!!D.open)},oe=C=>{let D=C.target.closest?.("[data-qb-action='open-tag-search']");D&&A(D.closest("[data-qb-tag-filter]"))},ce=C=>{let D=C.target.closest?.("[data-qb-tag-filter]");D&&(C.relatedTarget&&D.contains(C.relatedTarget)||S(D))},ve=C=>{let D=C.target.closest?.("[data-qb-tag-search]");if(!D)return;let W=D.closest("[data-qb-tag-filter]");m&&window.clearTimeout(m),m=window.setTimeout(()=>{k(W,D.value)},160)},je=C=>{let D=C.target.closest?.("[data-qb-tag-search]");if(!D)return;let W=D.closest("[data-qb-tag-filter]");C.key==="Escape"?(C.preventDefault(),S(W),D.blur()):C.key==="Enter"?(C.preventDefault(),W?.querySelector("[data-qb-action='select-tag']")?.click()):C.key==="ArrowDown"&&(C.preventDefault(),W?.querySelector("[data-qb-action='select-tag']")?.focus())};e.addEventListener("click",Pe),e.addEventListener("submit",Le),e.addEventListener("change",Ze),e.addEventListener("toggle",he,!0),e.addEventListener("mouseover",oe),e.addEventListener("mouseout",ce),e.addEventListener("input",ve),e.addEventListener("keydown",je);let Te=async()=>{await u(),n.tab==="create"?b():n.tab==="manage"?await q():n.tab==="suite"?await j({refreshAnswers:!0}):n.tab==="review"&&await z()};return u(),{show:Z,refresh:Te,destroy(){m&&window.clearTimeout(m),e.removeEventListener("click",Pe),e.removeEventListener("submit",Le),e.removeEventListener("change",Ze),e.removeEventListener("toggle",he,!0),e.removeEventListener("mouseover",oe),e.removeEventListener("mouseout",ce),e.removeEventListener("input",ve),e.removeEventListener("keydown",je)},getStats:()=>n.stats}}function Pn(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function Yl(e){return e==null?"\u2014":c(e)}function zm(e){return e.count?e.severity==="danger"?at("failed","\u9700\u8655\u7406"):e.severity==="warn"?at("warning","\u6CE8\u610F"):at("preview","\u63D0\u793A"):at("success","\u901A\u904E")}function Um(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function Gm(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${Um(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${r(e.label)}</span>
      ${zm(e)}
    </div>
    <div class="quality-check-value">
      <strong>${c(t)}</strong>
      <span>\u7B46</span>
      <em>${r(Pn(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${r(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function Cn(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
      <div class="index-chart-head"><span>${r(e)}</span><span>${r(t)}</span></div>
      <div class="index-chart-empty">DuckDB \u6383\u63CF\u5F8C\u6C92\u6709\u53EF\u5448\u73FE\u7684\u8CC7\u6599\u3002</div>
    </div>`;let n=Math.max(...a.map(i=>Number(i.value)||0),1);return`<div class="index-chart-card">
    <div class="index-chart-head"><span>${r(e)}</span><span>${r(t)}</span></div>
    <div class="distribution">
      ${a.map(i=>{let o=Number(i.value)||0,l=Math.max(1.5,o/n*100);return`<div class="dist-row">
            <span class="dist-label" title="${r(i.label||"\u672A\u5206\u985E")}">${r(i.label||"\u672A\u5206\u985E")}</span>
            <span class="dist-track"><span class="dist-bar" style="width:${l.toFixed(2)}%"></span></span>
            <span class="dist-value">${c(o)}</span>
          </div>`}).join("")}
    </div>
  </div>`}function Qm(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},n=Number(s.matched_unique_jids??s.matched_rows??0),i=Number(s.matched_rows??n),o=Math.max(0,i-n),l=t.postgres_diff,d=l==null?"\u2014":l===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\uFF08\u53BB\u91CD JID\uFF09\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\uFF08\u53BB\u91CD JID\uFF09\u76F8\u5DEE ${c(Math.abs(l))} \u7B46`,m=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${c(t.vector_indexed)} / ${c(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${p("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\uFF08\u53BB\u91CD JID\uFF09</span></div>
      <div class="metric-value">${c(n)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u542B\u91CD\u8907 ${c(i)} \u7B46${o?`\uFF0C\u91CD\u8907 ${c(o)} \u7B46`:""}\uFF1B\u5171 ${c(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${p("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${Yl(t.postgres_judgments)}</div>
      <div class="metric-foot">${r(d)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${p("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${r(Pn(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${r(m)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${p("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${Yl(a.candidate_total)}</div>
      <div class="metric-foot">${c(a.candidate_archive_count)} / ${c(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function Jm(e){return e.length?`<div class="table-wrap">
    <table class="data-table is-compact quality-archive-table">
      <thead>
        <tr>
          <th scope="col">\u58D3\u7E2E\u6A94</th>
          <th scope="col" class="cell-number">\u7B46\u6578</th>
          <th scope="col" class="cell-number">\u5019\u9078</th>
          <th scope="col" class="cell-number">\u7CBE\u78BA\u547D\u4E2D JID</th>
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
                <span class="mono">${r(t.archive||"\u2014")}</span>
                ${t.version?`<span class="chip">v${r(t.version)}</span>`:""}
              </td>
              <td class="cell-number">${c(t.rows)}</td>
              <td class="cell-number">${a}</td>
              <td class="cell-number">${c(t.matched_unique_jids??t.matched_rows)}</td>
              <td class="cell-number">${r(Pn(t.match_rate))}</td>
              <td class="cell-number">${c(t.short_text_rows)}</td>
              <td class="cell-number">${c(s)}</td>
              <td class="cell-number">${c(t.duplicate_content_rows)}</td>
              <td class="cell-date">${r(Jt(t.date_min))} \u2013 ${r(Jt(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:yt({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function Wm(e){let t=e.totals||{},s=Number(t.matched_unique_jids??t.matched_rows??0),a=e.source||{},n=Array.isArray(e.checks)?e.checks:[],i=e.summary||{},o=e.distributions||{},l=Array.isArray(e.warnings)?e.warnings:[],d=Ce(a.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${at(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${c(t.rows)} \u7B46 \xB7 ${c(a.raw_files)} \u500B\u6A94\u6848 \xB7
          ${d} \xB7 \u6383\u63CF ${ge(e.scan_ms||0)} \xB7
          ${r($e(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${p("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${l.length?`<div class="report-alert">${Ge({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:l.map(m=>r(m)).join("<br>")})}</div>`:""}
    <div class="summary-strip quality-summary-strip">
      <div class="summary-item">
        <div class="summary-label">\u539F\u59CB\u7B46\u6578</div>
        <div class="summary-value">${c(t.rows)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">\u7CBE\u78BA\u547D\u4E2D\uFF08\u53BB\u91CD\uFF09</div>
        <div class="summary-value">${c(s)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">\u547D\u4E2D\u7387</div>
        <div class="summary-value">${r(Pn(t.match_rate))}</div>
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
          ${c(i.ok_count)} \u9805\u901A\u904E \xB7
          ${c(i.warning_count)} \u9805\u6CE8\u610F \xB7
          ${c(i.danger_count)} \u9805\u9700\u8655\u7406 \xB7
          ${c(i.info_count)} \u9805\u63D0\u793A
        </span>
      </div>
      <div class="quality-checks">${n.map(Gm).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${Qm(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${c(a.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${Jm(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${Cn("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",o.courts)}
        ${Cn("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",o.years)}
        ${Cn("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",o.laws)}
        ${Cn("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",o.titles)}
      </div>
    </div>
  </div>`}async function Vm(e){let t=Kt(),s=`judgment.quality.snapshot.${t?"visitor":"admin"}`,a=()=>{try{let $=JSON.parse(window.localStorage.getItem(s)||"null");return!$?.snapshot||Date.now()-Number($.saved_at||0)>600*1e3?null:$.snapshot}catch{return null}},n=$=>{if($)try{window.localStorage.setItem(s,JSON.stringify({snapshot:$,saved_at:Date.now()}))}catch{}};e.innerHTML=`<section class="page data-page quality-page">
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
        ${t?'<span class="badge badge-neutral badge-mono">\u5C55\u793A\u6A21\u5F0F \xB7 \u552F\u8B80</span>':""}
        <span class="badge badge-neutral badge-mono" id="quality-meta">DUCKDB \xB7 \u8B80\u53D6\u4E2D</span>
        <button class="btn btn-secondary" type="button" id="quality-refresh">
          ${p("refresh",15)}<span>${t?"\u91CD\u65B0\u6574\u7406":"\u91CD\u65B0\u6383\u63CF"}</span>
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
            <span class="status-tab-copy"><strong>\u984C\u5EAB\u65B0\u589E</strong><small>llama-server \u81EA\u52D5\u51FA\u984C\u8207 JSON \u532F\u5165</small></span>
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
  </section>`;let i=e.querySelector("#quality-content"),o=e.querySelector("#quality-refresh"),l=e.querySelector("#quality-meta"),d=[...e.querySelectorAll("[data-quality-tab]")],m={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},f=null,y="overview",v=()=>{if(!f)return;i.innerHTML=Wm(f),l.textContent=`DUCKDB \xB7 ${c(f.totals?.rows)} \u7B46 \xB7 ${ge(f.scan_ms||0)}`;let $=e.querySelector("#quality-badge-overview");$&&($.textContent=c(f.totals?.rows||0))},u=$=>{y=$==="overview"?"overview":$;for(let T of d){let K=T.dataset.qualityTab===y;T.classList.toggle("is-active",K),K?T.setAttribute("aria-current","page"):T.removeAttribute("aria-current")}for(let[T,K]of Object.entries(m))K&&(K.hidden=T!==y);y!=="overview"?l.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":f&&v()},b=Kl(e,{onNavigate:$=>u($),onStats:$=>{let T=$||{},K=e.querySelector("#quality-badge-manage"),G=e.querySelector("#quality-badge-suite"),fe=e.querySelector("#quality-badge-review");K&&(K.textContent=c(T.total||0)),G&&(G.textContent=c(T.benchmark_ready||0)),fe&&(fe.textContent=c((T.pending_review||0)+(T.changes_requested||0)))}}),w=$=>{if(u($),$!=="overview"){if(t){let T=m[$];T&&(T.innerHTML=Cs("\u984C\u5EAB\u7BA1\u7406\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u5B8C\u6574\u7684\u8CC7\u6599\u54C1\u8CEA\u7E3D\u89BD\uFF1B\u984C\u5EAB\u65B0\u589E\u3001\u7BA1\u7406\u3001Benchmark \u8207\u4EBA\u5DE5\u9A57\u6536\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002"));return}b.show($)}},k=async({cached:$=!1}={})=>{Re(o,!0,$?"\u6574\u7406\u4E2D\u2026":"\u6383\u63CF\u4E2D\u2026");try{f=await Q.quality({cached:$}),n(f),v()}catch(T){i.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${Ge({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:r(T.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,l.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",R("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{Re(o,!1)}},A=async()=>{y==="overview"?await k():await b.refresh()};o.addEventListener("click",A),e.addEventListener("click",$=>{let T=$.target.closest("[data-quality-tab]");T&&w(T.dataset.qualityTab||"overview")}),i.addEventListener("click",$=>{!$.target.closest("[data-action='export-quality']")||!f||Vt(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(f,null,2),"application/json;charset=utf-8")}),u("overview");let S=a();if(S&&(f=S,v()),t)for(let $ of d){if($.dataset.qualityTab==="overview")continue;$.classList.add("is-demo-locked"),$.removeAttribute("title"),$.dataset.demoLockTooltip="\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B\u984C\u5EAB\u7BA1\u7406";let T=$.querySelector(".badge");T&&(T.textContent="LOCK")}await k({cached:!0})}var wi={};us(wi,{render:()=>jg});var In={};us(In,{render:()=>$i});var Xl={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function Zl(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${r(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${r(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function Km(e){let t=e?.supports_chat,s=t===!0?"badge-ok":t===!1?"badge-danger":"badge-neutral",a=t===!0?"\u652F\u63F4 chat":t===!1?"\u4E0D\u652F\u63F4 chat":"\u672A\u6E2C\u8A66",n=(Array.isArray(e?.capabilities)?e.capabilities:[]).map(i=>`<span class="chip chip-mono">${r(i)}</span>`).join("");return`<div class="tests-llm-row">
    <div class="tests-llm-model">
      <strong class="mono">${r(e?.model||"\u2014")}</strong>
      <small>${r(e?.detail||"")}</small>
    </div>
    <div class="tests-llm-meta">
      <span class="badge ${s}">${a}</span>
      ${e?.tested_now?'<span class="badge badge-info">\u672C\u6B21\u65B0\u6E2C</span>':""}
      ${n}
      <span class="tests-llm-time">${e?.tested_at?`\u6E2C\u8A66\u65BC ${r($e(e.tested_at))}`:"\u5C1A\u7121\u6E2C\u8A66\u7D00\u9304"}</span>
    </div>
  </div>`}function Ym(e){let t=Array.isArray(e?.models)?e.models:[],s=e?.counts||{},a=Array.isArray(e?.failures)?e.failures:[];return{summary:e?`<span>llama-server <strong>${s.available??t.length}</strong> \u500B\u6A21\u578B</span>
      <span>\u652F\u63F4 chat <strong>${s.chat??0}</strong></span>
      <span>\u4E0D\u652F\u63F4 <strong>${s.unsupported??0}</strong></span>
      <span>\u672A\u6E2C\u8A66 <strong>${s.untested??0}</strong></span>
      <span>\u672C\u6B21\u65B0\u6E2C <strong>${(e.tested_now||[]).length}</strong></span>
      <span class="muted">${r(e.detail||"")}</span>`:"<span>\u6B63\u5728\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u2026</span>",list:t.length?t.map(Km).join(""):'<div class="tests-llm-empty">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u8ACB\u78BA\u8A8D llama-server \u5DF2\u555F\u52D5\u4E26\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66\u3002</div>',failures:a.length?`<div class="tests-llm-failures">${a.map(i=>`<span><strong class="mono">${r(i.model||"\u2014")}</strong> ${r(i.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function Xm(e){let t=String(e?.status||"degraded"),s=t==="operational"?"badge-ok":t==="disabled"?"badge-neutral":"badge-danger",a=Array.isArray(e?.scores)?e.scores.slice(0,4):[],n=Array.isArray(e?.results)?e.results[0]:null;return`<div class="tests-llm-row">
    <div class="tests-llm-model">
      <strong class="mono">${r(`${e?.role||"reranker"} \xB7 ${e?.url||"\u2014"}`)}</strong>
      <small>${r(e?.actual_model||e?.model||"\u2014")}</small>
      ${n?`<div class="tests-rerank-result"><span class="mono">#${r(String(n.index))} \xB7 ${r(Number(n.score).toFixed(4))}</span><span>${r(n.document||"")}</span></div>`:""}
    </div>
    <div class="tests-llm-meta">
      <span class="badge ${s}">${r(t)}</span>
      ${e?.latency_ms!==null&&e?.latency_ms!==void 0?`<span class="mono">${r(String(e.latency_ms))} ms</span>`:""}
      ${e?.top_score!==null&&e?.top_score!==void 0?`<span class="chip chip-mono">top ${r(Number(e.top_score).toFixed(4))}</span>`:""}
      ${a.length?`<span class="chip chip-mono">${r(a.map(i=>Number(i).toFixed(4)).join(" / "))}</span>`:""}
      ${e?.selected_count?`<span class="chip chip-mono">\u9078\u7528 ${r(String(e.selected_count))} / ${r(String(e.candidate_count||0))}</span>`:""}
    </div>
  </div>`}function Zm(e){if(!e)return{summary:"<span>\u6B63\u5728\u8B80\u53D6 reranker \u72C0\u614B\u2026</span>",list:"",failures:""};let t=Array.isArray(e.providers)?e.providers:[],s=e.active||{},a=String(e.status||"degraded"),n=a==="operational"?"badge-ok":a==="not_configured"?"badge-neutral":"badge-danger",i=t.flatMap(o=>(o.errors||[]).map(l=>({model:o.url,detail:l})));return{summary:`<span>\u72C0\u614B <span class="badge ${n}">${r(a)}</span></span>
      <span>\u6A21\u578B <strong>${r(e.model||"\u2014")}</strong></span>
      <span>\u555F\u7528 <strong>${e.enabled?"true":"false"}</strong></span>
      ${s.url?`<span>\u4F5C\u7528\u4E2D <strong class="mono">${r(s.url)}</strong></span>`:""}
      <span class="muted">${r(e.detail||"")}</span>`,list:t.length?t.map(Xm).join(""):'<div class="tests-llm-empty">\u6C92\u6709\u8A2D\u5B9A RERANK_URL\uFF1B\u8ACB\u8A2D\u5B9A primary \u6216 fallback reranker\u3002</div>',failures:i.length?`<div class="tests-llm-failures">${i.map(o=>`<span><strong class="mono">${r(o.model||"\u2014")}</strong> ${r(o.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function eg(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,total_ms:e.total_ms,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}:${a.duration_ms}`)}:null})}async function $i(e,t,{embedded:s=!1}={}){let a=!1,n=!1,i={embedding:[],llm:[]},o=!1,l=null,d=!1,m=null,f=!1,y=null,v=[],u="",b=null,w="",k=`<div class="page-actions">
      <span class="badge badge-neutral badge-mono" id="tests-mode-badge">\u8B80\u53D6\u4E2D</span>
      <button class="btn btn-secondary" type="button" id="tests-refresh">
        ${p("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
      </button>
    </div>`,A=s?`<div class="tests-embed-head">
        <div>
          <div class="eyebrow">SYSTEM TEST</div>
          <div class="tests-embed-title">\u7CFB\u7D71\u6E2C\u8A66</div>
          <div class="tests-embed-copy">\u5F8C\u7AEF API \u9023\u7DDA\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u591A\u6A21\u578B\u6E2C\u8A66 Flow\u3002\u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207\u5177\u5099 chat \u80FD\u529B\u7684 LLM \u6A21\u578B\u3002</div>
        </div>
        ${k}
      </div>`:`<div class="page-header">
      <div>
        <div class="eyebrow">SYSTEM TEST</div>
        <h1 class="page-title">\u7CFB\u7D71\u6E2C\u8A66</h1>
        <p class="page-subtitle">\u5408\u4F75\u5F8C\u7AEF API \u9023\u7DDA\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u591A\u6A21\u578B\u6E2C\u8A66 Flow\u3002
          \u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207\u5177\u5099 chat \u80FD\u529B\u7684 LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002</p>
      </div>
      ${k}
    </div>`;e.innerHTML=`<section class="${s?"tests-page tests-page-embedded":"page tests-page"}">
    ${A}

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
          <label class="field" for="tests-admin-token-input">
            <span class="field-label">\u7BA1\u7406\u6B0A\u6756 <span class="field-tag">remote admin</span></span>
            <input class="input mono" id="tests-admin-token-input" name="admin-token"
              type="password" autocomplete="off" spellcheck="false"
              placeholder="JUDGMENT_ADMIN_TOKEN" />
            <span class="field-help">\u672C\u6A5F 127.0.0.1 \u53EF\u76F4\u63A5\u4F7F\u7528\uFF1B\u900F\u904E cloudflared \u6216\u5176\u4ED6\u4E3B\u6A5F\u9023\u7DDA\u6642\uFF0C\u9060\u7AEF\u7BA1\u7406 API \u9700\u8981\u6B64\u6B0A\u6756\u3002\u6B0A\u6756\u53EA\u4FDD\u7559\u5728\u76EE\u524D\u5206\u9801\uFF0C\u95DC\u9589\u5206\u9801\u5F8C\u9700\u91CD\u65B0\u8F38\u5165\uFF1B\u4E5F\u4E0D\u6703\u9001\u5F80 ?api= \u6307\u5B9A\u7684\u4F4D\u5740\u3002</span>
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
            <div class="tests-card-copy">\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207\u5177\u5099 chat \u80FD\u529B\u7684 LLM \u6A21\u578B\uFF0C\u7D50\u679C\u5BEB\u5165\u6E2C\u8A66 Flow\u3002</div>
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

    <section class="card tests-card tests-llm-card" aria-labelledby="tests-llm-title">
      <div class="tests-card-head">
        <span class="tests-card-icon">${p("brain",16)}</span>
        <div>
          <div class="tests-card-title" id="tests-llm-title">LLM \u670D\u52D9\u6E2C\u8A66</div>
          <div class="tests-card-copy">\u6AA2\u67E5 llama-server \u4E0A\u6BCF\u500B\u6A21\u578B\u662F\u5426\u652F\u63F4 chat\uFF0C\u4E26\u628A\u7D50\u679C\u5BEB\u5165\u80FD\u529B\u6E05\u55AE\uFF1B\u5DF2\u6709\u6E2C\u8A66\u7D00\u9304\u7684\u6A21\u578B\u4E0D\u6703\u91CD\u6E2C\u3002LLM \u6548\u80FD\u8A55\u4F30\u53EA\u6703\u7D0D\u5165\u652F\u63F4 chat \u7684\u6A21\u578B\u3002</div>
        </div>
      </div>
      <div class="tests-llm-head">
        <div class="tests-llm-summary" id="tests-llm-summary">\u6B63\u5728\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u2026</div>
        <button class="btn btn-primary btn-sm" type="button" id="tests-llm-test">
          ${p("activity",14)}<span>\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66</span>
        </button>
      </div>
      <div class="tests-llm-list" id="tests-llm-list"></div>
      <div id="tests-llm-failures"></div>
      <div class="tests-status" id="tests-llm-status" role="status"></div>
    </section>

    <section class="card tests-card tests-llm-card" aria-labelledby="tests-rerank-title">
      <div class="tests-card-head">
        <span class="tests-card-icon">${p("filter",16)}</span>
        <div>
          <div class="tests-card-title" id="tests-rerank-title">Reranker \u670D\u52D9\u6E2C\u8A66</div>
          <div class="tests-card-copy">\u6AA2\u67E5 RAG_RERANK_ENABLED\u3001primary\uFF0Ffallback reranker \u5065\u5EB7\u72C0\u614B\uFF0C\u4E26\u4EE5\u5BE6\u969B rerank \u8ACB\u6C42\u9A57\u8B49\u6A21\u578B\u8207\u5206\u6578\u3002\u6E2C\u8A66\u4E0D\u6703\u4FEE\u6539\u7D22\u5F15\u6216\u9078\u53D6\u7D50\u679C\u3002</div>
        </div>
      </div>
      <div class="tests-llm-head">
        <div class="tests-llm-summary" id="tests-rerank-summary">\u6B63\u5728\u8B80\u53D6 reranker \u72C0\u614B\u2026</div>
        <button class="btn btn-primary btn-sm" type="button" id="tests-rerank-test">
          ${p("activity",14)}<span>\u57F7\u884C Reranker \u670D\u52D9\u6E2C\u8A66</span>
        </button>
      </div>
      <div class="tests-llm-list" id="tests-rerank-list"></div>
      <div id="tests-rerank-failures"></div>
      <div class="tests-status" id="tests-rerank-status" role="status"></div>
    </section>

    <div id="tests-flow"></div>
  </section>`;let S=e.querySelector("#tests-mode-badge"),$=e.querySelector("#tests-mode-toggle"),T=e.querySelector("#tests-mode-summary"),K=e.querySelector("#tests-mode-models"),G=e.querySelector("#tests-mode-status"),fe=e.querySelector("#tests-api-form"),ye=e.querySelector("#tests-api-input"),ie=e.querySelector("#tests-admin-token-input"),L=e.querySelector("#tests-api-preview"),q=e.querySelector("#tests-api-status"),j=e.querySelector("#tests-api-note"),V=e.querySelector("#tests-api-test"),de=e.querySelector("#tests-api-reset"),z=e.querySelector("#tests-api-save"),Z=e.querySelector("#tests-refresh"),qe=e.querySelector("#tests-flow"),F=e.querySelector("#tests-llm-summary"),ke=e.querySelector("#tests-llm-list"),ne=e.querySelector("#tests-llm-failures"),Se=e.querySelector("#tests-llm-status"),Pe=e.querySelector("#tests-llm-test"),Le=e.querySelector("#tests-rerank-summary"),Ze=e.querySelector("#tests-rerank-list"),he=e.querySelector("#tests-rerank-failures"),oe=e.querySelector("#tests-rerank-status"),ce=e.querySelector("#tests-rerank-test");ie&&(ie.value=Ua());let ve=(te,xe,De="")=>{te&&(te.textContent=xe,te.className=`tests-status${De?` is-${De}`:""}`)},je=(te,xe="")=>{q&&(q.textContent=te,q.className=`api-dialog-status${xe?` is-${xe}`:""}`)},Te=()=>Qt()==="query",C=()=>{let te=ps(ye.value);return te||(window.location.protocol==="file:"?Xn:"")},D=()=>{let te=C(),xe=ts(),De=Xl[Qt()]||Qt()||"\u540C\u6E90";L.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${r(_s(xe))}</strong>${xe?`\uFF08${r(De)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${r($t("/api/health",te))}`},W=()=>{let te=Qt(),xe=`\u76EE\u524D\u4F86\u6E90\uFF1A${Xl[te]||te||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,De="";te==="query"?(De="is-warn",xe="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):za()?(De="is-warn",xe="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(te==="file-default"||window.location.protocol==="file:")&&(xe="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),xe+=(ie?.value||Ua()).trim()?" \u7BA1\u7406\u6B0A\u6756\uFF1A\u5DF2\u8A2D\u5B9A\uFF0C\u6703\u9001\u5F80\u76EE\u524D\u8A2D\u5B9A\u7684 API Base\u3002":" \u7BA1\u7406\u6B0A\u6756\uFF1A\u672A\u8A2D\u5B9A\uFF1B\u672C\u6A5F loopback \u53EF\u76F4\u63A5\u4F7F\u7528\uFF0C\u9060\u7AEF\u7BA1\u7406 API \u6703\u88AB\u62D2\u7D55\u3002",j.textContent=xe,j.className=`api-dialog-note${De?` ${De}`:""}`;let Qe=te==="query";z.disabled=Qe,de.disabled=Qe,ye.readOnly=Qe},I=()=>{if(!Zn(ye.value))return je("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),ye.focus(),null;let te=C();return window.location.protocol==="https:"&&/^http:\/\//i.test(te)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(te)?(je("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),ye.focus(),null):te},H=()=>{ye.value=ts(),D(),W(),je("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},J=()=>{let te=Array.isArray(i.embedding)?i.embedding.length:0,xe=Array.isArray(i.llm)?i.llm.length:0;if(S&&(S.textContent=o?"\u5207\u63DB\u4E2D\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",S.className=`badge badge-mono ${o?"badge-info":n?"badge-warn":"badge-neutral"}`),$){$.disabled=o,$.classList.toggle("is-on",n),$.classList.toggle("is-off",!n&&!o),$.classList.toggle("is-busy",o),$.setAttribute("aria-checked",n?"true":"false"),$.setAttribute("aria-busy",o?"true":"false"),$.setAttribute("aria-label",o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":n?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),$.title=o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let De=$.querySelector(".header-power-label");De&&(De.textContent=o?"\u2026":n?"ON":"OFF")}T&&(T.textContent=n?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${te} \u500B embedding \u8207 ${xe} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),K&&(K.innerHTML=Zl("Embedding",i.embedding)+Zl("LLM",i.llm))},we=async()=>{try{let te=await Q.testMode();if(a)return;n=!!te.enabled,i=te.models||{embedding:[],llm:[]},ve(G,"")}catch(te){if(a)return;n=!1,i={embedding:[],llm:[]},ve(G,te.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}a||J()},Oe=async()=>{if(o)return;let te=!n;o=!0,J(),ve(G,te?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let xe=await Q.setTestMode(te);if(a)return;n=!!xe.enabled,i=xe.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:n,models:i}}));let De=i.embedding?.length||0,Qe=i.llm?.length||0;ve(G,n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${De} \u500B embedding \u8207 ${Qe} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),R(n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${De} \u500B embedding\u3001${Qe} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",n?"ok":"info",6e3),await ut()}catch(xe){a||(ve(G,xe.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),R(xe.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{o=!1,a||J()}},Ve=()=>{let te=Ym(l);if(F&&(F.innerHTML=te.summary),ke&&(ke.innerHTML=te.list),ne&&(ne.innerHTML=te.failures),Pe){Pe.disabled=d,Pe.setAttribute("aria-busy",d?"true":"false");let xe=Pe.querySelector("span");xe&&(xe.textContent=d?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66")}},ct=async()=>{try{let te=await Q.llmModels();if(a)return;l=te,ve(Se,"")}catch(te){if(a)return;l=null,ve(Se,te.message||"\u7121\u6CD5\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u3002","error")}a||Ve()},nt=async()=>{if(!d){d=!0,Ve(),ve(Se,"\u6B63\u5728\u6AA2\u67E5 llama-server \u6A21\u578B\u8207 chat \u80FD\u529B\u2026");try{let te=await Q.testLlmModels();if(a)return;l=te;let xe=te.tested_now?.length||0,De=te.chat_models?.length||0,Qe=te.failures?.length||0;ve(Se,`${xe?`\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u672C\u6B21\u65B0\u6E2C ${xe} \u500B\u6A21\u578B`:"\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u6C92\u6709\u65B0\u6A21\u578B"}\uFF0C\u76EE\u524D ${De} \u500B\u6A21\u578B\u652F\u63F4 chat${Qe?`\uFF1B${Qe} \u500B\u6A21\u578B\u66AB\u6642\u7121\u6CD5\u5224\u5B9A\uFF0C\u4E0B\u6B21\u6703\u91CD\u8A66`:""}\u3002`,Qe?"warn":"ok"),R(xe?`LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u65B0\u589E ${xe} \u7B46\u80FD\u529B\u7D00\u9304\u3002`:"LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u6C92\u6709\u65B0\u6A21\u578B\u9700\u8981\u6E2C\u8A66\u3002",Qe?"warn":"ok",5e3),await we()}catch(te){a||(ve(Se,te.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),R(te.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{d=!1,a||Ve()}}},tt=()=>{let te=Zm(m);if(Le&&(Le.innerHTML=te.summary),Ze&&(Ze.innerHTML=te.list),he&&(he.innerHTML=te.failures),ce){ce.disabled=f,ce.setAttribute("aria-busy",f?"true":"false");let xe=ce.querySelector("span");xe&&(xe.textContent=f?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C Reranker \u670D\u52D9\u6E2C\u8A66")}},et=async()=>{try{let te=await Q.rerankStatus();if(a)return;m=te,ve(oe,"")}catch(te){if(a)return;m=null,ve(oe,te.message||"\u7121\u6CD5\u8B80\u53D6 reranker \u72C0\u614B\u3002","error")}a||tt()},pe=async()=>{if(!f){f=!0,tt(),ve(oe,"\u6B63\u5728\u5C0D primary\uFF0Ffallback reranker \u57F7\u884C\u5BE6\u969B rerank \u6E2C\u8A66\u2026");try{let te=await Q.testReranker();if(a)return;m=te;let xe=Array.isArray(te.providers)?te.providers:[],De=xe.filter(Et=>Et.status==="operational").length,Qe=xe.reduce((Et,ht)=>Et+(Array.isArray(ht.errors)?ht.errors.length:0),0);ve(oe,Qe?`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${De} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C${Qe} \u500B\u932F\u8AA4\uFF1B\u8A73\u7D30\u5206\u6578\u5DF2\u5217\u5728\u4E0A\u65B9\u3002`:`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${De} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C\u6A21\u578B ${te.model||"\u2014"}\u3002`,Qe?"warn":"ok"),R(Qe?"Reranker \u90E8\u5206\u7AEF\u9EDE\u5931\u6557\uFF0C\u8ACB\u67E5\u770B\u6E2C\u8A66\u7D50\u679C\u3002":"Reranker \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\u3002",Qe?"warn":"ok",5e3)}catch(te){a||(ve(oe,te.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),R(te.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{f=!1,a||tt()}}},ze=()=>{if(!qe)return;let te=eg(y,v,u);te!==w&&(w=te,qe.innerHTML=ia(y,v,u))},Ke=async()=>{try{let te=await Q.testRuns(30);if(a)return;v=Array.isArray(te.runs)?te.runs:[]}catch{if(a)return;v=[]}},ut=async(te=null)=>{try{let xe=te||(u?await Q.testRun(u):await Q.testRunCurrent());if(a)return;y=xe.run||null,!u&&y&&y.status!=="running"&&!v.some(De=>De.run_id===y.run_id)&&await Ke()}catch{if(a)return;y=null}a||ze()};ye?.addEventListener("input",()=>{D(),je("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),ie?.addEventListener("input",()=>{W()}),V?.addEventListener("click",async()=>{let te=I();if(te!==null){Re(V,!0,"\u6E2C\u8A66\u4E2D\u2026"),je(`\u6B63\u5728\u9023\u7DDA\u5230 ${_s(te)||"\u540C\u6E90"}\u2026`);try{let xe=await Ai(te);if(a)return;je(`\u9023\u7DDA\u6210\u529F \xB7 v${xe.version} \xB7 ${xe.duration_ms} ms \xB7 GET ${$t("/api/health",te)}`,"ok")}catch(xe){a||je(xe.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{a||Re(V,!1)}}}),fe?.addEventListener("submit",te=>{if(te.preventDefault(),Te())return;let xe=I();xe!==null&&(ar(xe),Ga(ie?.value||""),R(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${_s(xe)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),de?.addEventListener("click",()=>{Te()||(ar(""),R("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),$?.addEventListener("click",Oe),Pe?.addEventListener("click",nt),ce?.addEventListener("click",pe),qe?.addEventListener("change",async te=>{te.target.id==="test-run-select"&&(u=String(te.target.value||""),await ut())}),qe?.addEventListener("click",async te=>{te.target.closest("#test-flow-refresh")&&(u="",await Ke(),await ut())}),Z?.addEventListener("click",async()=>{Re(Z,!0,"\u66F4\u65B0\u4E2D\u2026"),H(),await Promise.allSettled([we(),Ke(),ct(),et()]),a||await ut(),a||(Re(Z,!1),R("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let vt=te=>{n=!!te.detail?.enabled,i=te.detail?.models||{embedding:[],llm:[]},J()};return window.addEventListener("judgment:test-mode",vt),H(),J(),Ve(),tt(),await Promise.allSettled([we(),Ke(),ct(),et()]),await ut(),b=Mt("test-runs",async(te,xe)=>{a||document.hidden||u||await ut(xe?.snapshot||null)}),!s&&typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{a=!0,b&&b(),window.removeEventListener("judgment:test-mode",vt)}}var ec={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var rc={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},yi=new Set,tc="judgment.status.payload.v1",ic=new Set(["tests","resources","local-model","api"]),oc=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"tests",label:"\u7CFB\u7D71\u6E2C\u8A66",hint:"API\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u6A21\u578B Flow",icon:"terminal"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"local-model",label:"Model Provider",hint:"llama-server \u4E3B\u6A5F\u8207\u6A21\u578B",icon:"server"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 API \u2192 Pipeline \u2192 Data",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}],Ra=[{id:"system",label:"\u7CFB\u7D71\u8207\u5373\u6642\u72C0\u614B",icon:"activity",prefixes:["/api/health","/api/status","/api/system-usage","/api/events/stream","/api/processing/events/status","/api/docs","/api/openapi.json"]},{id:"processing",label:"\u8CC7\u6599\u8655\u7406\u8207\u66F4\u65B0",icon:"database",prefixes:["/api/processing","/api/judgment-download","/api/updates","/api/courts","/api/law-versions"]},{id:"data",label:"\u67E5\u8A62\u8207\u8CC7\u6599",icon:"search",prefixes:["/api/query","/api/data","/api/judgment","/api/law","/api/schema","/api/catalog","/api/judgment-stats","/api/quality"]},{id:"rag",label:"RAG \u554F\u7B54",icon:"message",prefixes:["/api/rag"]},{id:"index",label:"\u7248\u672C\u8207\u7D22\u5F15",icon:"layers",prefixes:["/api/index-versions","/api/index-alias","/api/versioning"]},{id:"models",label:"\u6A21\u578B\u8207\u670D\u52D9",icon:"brain",prefixes:["/api/ollama","/api/llm","/api/rerank","/api/test-mode"]},{id:"tests",label:"\u6E2C\u8A66\u8207\u6548\u80FD",icon:"activity",prefixes:["/api/test-runs","/api/performance"]},{id:"question-bank",label:"\u984C\u5EAB",icon:"file",prefixes:["/api/question-bank"]},{id:"benchmark",label:"Benchmark",icon:"grid",prefixes:["/api/benchmark"]},{id:"other",label:"\u5176\u4ED6",icon:"terminal",prefixes:[]}];function tg(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Wt(e).label,tone:Wt(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function sg(e){let t=Wt(e.status),s=ec[e.kind]||ec.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${c(e.latency_ms)} ms</span>`;return`<article class="service-card">
    <div class="service-top">
      <span class="service-icon">${p(s,14)}</span>
      <span class="service-name" title="${r(e.name)}">${r(e.name)}</span>
      <span class="service-kind">${r(e.kind||"")}</span>
    </div>
    <div class="service-status">
      <span class="status-dot ${t.tone==="ok"?"is-ok":t.tone==="warn"?"is-warn":t.tone==="danger"?"is-danger":"is-idle"}" aria-hidden="true"></span>
      ${r(t.label)}
      ${a}
    </div>
    <p class="service-detail" title="${r(e.detail||"")}">${r(e.detail||"")}</p>
  </article>`}function ag(e,t){let s=typeof e=="string"?{label:e}:e||{},a=String(s.label||"\u2014"),n=s.service?t.find(l=>l.id===s.service):null,i=n?n.status==="operational":a==="IndexedDB"?ro():!0,o=[s.detail||"",n?`\u72C0\u614B\uFF1A${Wt(n.status).label}`:""].filter(Boolean).join(" \xB7 ");return`<div class="arch-node ${i?"":"is-muted"}" title="${r(o||(i?a:"\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"))}">
    <strong>${r(a)}</strong>
    ${s.detail?`<span class="arch-node-detail">${r(s.detail)}</span>`:""}
  </div>`}function ng(e,t,s=!1){let a=e?.layers||[];if(!a.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let n=a.map(o=>{let l=(o.nodes||[]).map(d=>ag(d,t)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${r(o.label||o.id)}</div>
      <div class="arch-nodes">${l}</div>
    </div>`}),i=[];return n.forEach((o,l)=>{l&&i.push(`<div class="arch-arrow" aria-hidden="true">${p("arrowRight",15)}</div>`),i.push(o)}),`<div class="arch-flow">${i.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${p("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>
    ${rg(s)}`}function rg(e=!1){return`<figure class="arch-diagram">
    <figcaption class="arch-diagram-head">
      <span class="section-title">\u6D41\u7A0B\u65B9\u5411\u793A\u610F\u5716</span>
      <span class="section-sub">\u76EE\u524D\u5C08\u6848\u7684\u8ACB\u6C42\u3001SSE\u3001RAG\u3001\u8655\u7406\u6D41\u7A0B\u3001\u80CC\u666F\u6392\u7A0B\u8207\u8CC7\u6599\uFF0F\u6A21\u578B\u670D\u52D9\u65B9\u5411\uFF1B\u5716\u8868\u53EF\u6C34\u5E73\u6372\u52D5</span>
    </figcaption>
    <div class="arch-diagram-scroll">
      <svg class="arch-diagram-svg" viewBox="0 0 1180 740" role="img" aria-labelledby="arch-flow-title arch-flow-desc">
        <title id="arch-flow-title">Judgment RAG Console \u524D\u5F8C\u7AEF\u6D41\u7A0B\u65B9\u5411\u793A\u610F\u5716</title>
        <desc id="arch-flow-desc">\u700F\u89BD\u5668 RAG Console \u900F\u904E REST \u8207 SSE \u9023\u7DDA FastAPI${e?"":" 9200"}\uFF1BFastAPI \u547C\u53EB RAG Orchestrator\u3001Processing Runtime\u3001Scheduler \u8207 Power Agent\u3002RAG \u8207\u8655\u7406\u6D41\u7A0B\u8B80\u5BEB PostgreSQL\u3001Qdrant\u3001Parquet \u8207 llama-server Embedding\u3001Reranker\u3001LLM\u3002\u700F\u89BD\u5668\u53E6\u4EE5 IndexedDB \u4FDD\u5B58\u63D0\u554F\u6B77\u53F2\u8207\u7A3D\u6838\u8CC7\u6599\u3002</desc>
        <defs>
          <marker id="arch-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--faint)"></path>
          </marker>
          <marker id="arch-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"></path>
          </marker>
        </defs>

        <rect class="arch-diagram-lane" x="18" y="18" width="228" height="632" rx="12"></rect>
        <text class="arch-diagram-lane-label" x="36" y="44">CLIENT \xB7 BROWSER</text>
        <rect class="arch-diagram-lane" x="280" y="18" width="520" height="632" rx="12"></rect>
        <text class="arch-diagram-lane-label" x="298" y="44">APPLICATION \xB7 FASTAPI</text>
        <rect class="arch-diagram-lane" x="840" y="18" width="322" height="632" rx="12"></rect>
        <text class="arch-diagram-lane-label" x="858" y="44">DATA \xB7 STORAGE \xB7 MODELS</text>

        <rect class="arch-diagram-node" x="36" y="70" width="192" height="88" rx="9"></rect>
        <text class="arch-diagram-node-title" x="50" y="94">RAG Console SPA</text>
        <text class="arch-diagram-node-sub" x="50" y="113">#/rag \xB7 #/data \xB7 #/processing</text>
        <text class="arch-diagram-node-sub" x="50" y="129">#/status \xB7 #/performance</text>
        <text class="arch-diagram-node-sub" x="50" y="145">\u4E3B\u984C\u5F15\u64CE \xB7 \u97FF\u61C9\u5F0F UI</text>

        <rect class="arch-diagram-node" x="36" y="294" width="192" height="82" rx="9"></rect>
        <text class="arch-diagram-node-title" x="50" y="318">API Client + SSE</text>
        <text class="arch-diagram-node-sub" x="50" y="337">REST \u8ACB\u6C42 \xB7 timeout</text>
        <text class="arch-diagram-node-sub" x="50" y="353">/api/events/stream</text>

        <rect class="arch-diagram-node" x="36" y="416" width="192" height="76" rx="9"></rect>
        <text class="arch-diagram-node-title" x="50" y="440">IndexedDB</text>
        <text class="arch-diagram-node-sub" x="50" y="459">\u63D0\u554F\u6B77\u53F2 \xB7 audit_events</text>
        <text class="arch-diagram-node-sub" x="50" y="475">\u700F\u89BD\u5668\u7AEF\u4FDD\u5B58</text>

        <rect class="arch-diagram-node" x="298" y="70" width="484" height="86" rx="9"></rect>
        <text class="arch-diagram-node-title" x="314" y="94">${e?"FastAPI \xB7 API":"FastAPI \xB7 127.0.0.1:9200"}</text>
        <text class="arch-diagram-node-sub" x="314" y="113">REST /api/* \xB7 SSE /api/events/stream \xB7 OpenAPI</text>
        <text class="arch-diagram-node-sub" x="314" y="129">query \xB7 catalog \xB7 performance \xB7 benchmark \xB7 quality</text>
        <text class="arch-diagram-node-sub" x="314" y="145">processing \xB7 updates \xB7 status \xB7 Last-Event-ID replay</text>

        <rect class="arch-diagram-node" x="298" y="222" width="484" height="128" rx="9"></rect>
        <text class="arch-diagram-node-title" x="314" y="246">RAG Orchestrator \xB7 judgment.rag</text>
        <text class="arch-diagram-node-sub" x="314" y="265">\u6CD5\u898F\uFF0F\u547D\u4EE4\u6BD4\u5C0D \u2192 \u6CD5\u898F\u689D\u6587\u8207\u5224\u6C7A\u5168\u6587 \u2192 \u5F15\u7528\u7D44\u88DD</text>
        <text class="arch-diagram-node-sub" x="314" y="281">Embedding \u2192 Qdrant top_k=4 \u2192 reranker \u2192 LLM</text>
        <text class="arch-diagram-node-sub" x="314" y="297">SSE partial\uFF0Ftoken\uFF0Fresult \xB7 \u5F15\u7528\u7DE8\u865F\u9A57\u8B49</text>
        <text class="arch-diagram-node-sub" x="314" y="313">preview\uFF0Fretrieval_only \u964D\u7D1A \xB7 \u6548\u80FD Flow</text>
        <text class="arch-diagram-node-sub" x="314" y="329">\u6E2C\u8A66\u6A21\u5F0F\u9010\u4E00\u6A21\u578B\u7522\u751F performance_test_steps</text>

        <rect class="arch-diagram-node" x="298" y="398" width="484" height="108" rx="9"></rect>
        <text class="arch-diagram-node-title" x="314" y="422">Processing Runtime \xB7 Workflow State</text>
        <text class="arch-diagram-node-sub" x="314" y="441">\u5224\u6C7A\u532F\u5165 \xB7 \u4E0B\u8F09 \xB7 \u6CD5\u898F\u7D22\u5F15 \xB7 \u5224\u6C7A\u7D22\u5F15 \xB7 Parquet \u532F\u51FA</text>
        <text class="arch-diagram-node-sub" x="314" y="457">\u6CD5\u9662\u6B63\u898F\u5316 \xB7 \u689D\u6587\u6B77\u53F2 \xB7 \u5B8C\u6574\u8CC7\u6599\u66F4\u65B0</text>
        <text class="arch-diagram-node-sub" x="314" y="473">SSE live payload \xB7 \u53EF\u4E2D\u65B7\u7E8C\u8DD1 \xB7 0.5 \u79D2\u63A8\u9001</text>
        <text class="arch-diagram-node-sub" x="314" y="489">.run \u65E5\u8A8C \xB7 shared state checkpoint</text>

        <rect class="arch-diagram-node" x="298" y="536" width="232" height="54" rx="9"></rect>
        <text class="arch-diagram-node-title" x="313" y="558">Scheduler / CLI</text>
        <text class="arch-diagram-node-sub" x="313" y="575">up.sh \xB7 cron \xB7 judgment-*</text>

        <rect class="arch-diagram-node" x="550" y="536" width="232" height="54" rx="9"></rect>
        <text class="arch-diagram-node-title" x="565" y="558">Power Agent${e?"":" \xB7 :9201"}</text>
        <text class="arch-diagram-node-sub" x="565" y="575">\u4E3B\u6A5F start\uFF0Fstop \u63A7\u5236</text>

        <rect class="arch-diagram-node" x="858" y="70" width="286" height="74" rx="9"></rect>
        <text class="arch-diagram-node-title" x="872" y="94">PostgreSQL</text>
        <text class="arch-diagram-node-sub" x="872" y="113">judgment_documents \xB7 law_documents</text>
        <text class="arch-diagram-node-sub" x="872" y="129">versions \xB7 settings \xB7 performance</text>

        <rect class="arch-diagram-node" x="858" y="160" width="286" height="74" rx="9"></rect>
        <text class="arch-diagram-node-title" x="872" y="184">Qdrant</text>
        <text class="arch-diagram-node-sub" x="872" y="203">judgments_current \u2192 judgments_vNNN</text>
        <text class="arch-diagram-node-sub" x="872" y="219">legal_articles_current \xB7 history collection</text>

        <rect class="arch-diagram-node" x="858" y="250" width="286" height="74" rx="9"></rect>
        <text class="arch-diagram-node-title" x="872" y="274">Parquet / Files</text>
        <text class="arch-diagram-node-sub" x="872" y="293">raw judgments \xB7 deltas \xB7 law articles</text>
        <text class="arch-diagram-node-sub" x="872" y="309">download_manifest \xB7 state \xB7 SQLite journal</text>

        <rect class="arch-diagram-node" x="858" y="340" width="286" height="64" rx="9"></rect>
        <text class="arch-diagram-node-title" x="872" y="364">llama-server Embedding</text>
        <text class="arch-diagram-node-sub" x="872" y="383">bge-m3 \xB7 1,024 dims${e?"":" \xB7 x570\uFF0Flocal fallback"}</text>

        <rect class="arch-diagram-node" x="858" y="420" width="286" height="64" rx="9"></rect>
        <text class="arch-diagram-node-title" x="872" y="444">Reranker</text>
        <text class="arch-diagram-node-sub" x="872" y="463">bge-reranker-v2-m3 \xB7 primary\uFF0Ffallback</text>

        <rect class="arch-diagram-node" x="858" y="500" width="286" height="64" rx="9"></rect>
        <text class="arch-diagram-node-title" x="872" y="524">llama-server LLM</text>
        <text class="arch-diagram-node-sub" x="872" y="543">gemma3 \xB7 chat \xB7 SSE token streaming</text>

        <path class="arch-diagram-flow arch-diagram-flow-accent" d="M228 112 H298"></path>
        <path class="arch-diagram-flow" d="M298 142 H228"></path>
        <path class="arch-diagram-flow arch-diagram-flow-both" d="M228 452 H260 V150 H228"></path>

        <path class="arch-diagram-flow" d="M540 156 V222"></path>
        <path class="arch-diagram-flow" d="M782 113 H812 V430 H782"></path>
        <path class="arch-diagram-flow arch-diagram-flow-accent" d="M782 286 H840"></path>
        <path class="arch-diagram-flow" d="M782 452 H840"></path>
        <path class="arch-diagram-flow" d="M540 536 V506"></path>

        <g class="arch-diagram-flow-badge"><circle cx="263" cy="100" r="8"></circle><text x="263" y="103">\u2460</text></g>
        <g class="arch-diagram-flow-badge"><circle cx="263" cy="156" r="8"></circle><text x="263" y="159">\u2461</text></g>
        <g class="arch-diagram-flow-badge"><circle cx="252" cy="400" r="8"></circle><text x="252" y="403">\u2467</text></g>
        <g class="arch-diagram-flow-badge"><circle cx="548" cy="190" r="8"></circle><text x="548" y="193">\u2462</text></g>
        <g class="arch-diagram-flow-badge"><circle cx="821" cy="220" r="8"></circle><text x="821" y="223">\u2463</text></g>
        <g class="arch-diagram-flow-badge"><circle cx="811" cy="276" r="8"></circle><text x="811" y="279">\u2464</text></g>
        <g class="arch-diagram-flow-badge"><circle cx="811" cy="442" r="8"></circle><text x="811" y="445">\u2465</text></g>
        <g class="arch-diagram-flow-badge"><circle cx="548" cy="521" r="8"></circle><text x="548" y="524">\u2466</text></g>
      </svg>
    </div>
    <div class="arch-diagram-legend">
      <span><b>\u2460</b> REST\uFF0FJSON\uFF1A\u9801\u9762\u67E5\u8A62\u3001RAG\u3001\u8655\u7406\u8207\u72C0\u614B API</span>
      <span><b>\u2461</b> SSE\uFF1Aprocessing\uFF0Fstatus\uFF0Ftest-runs \u5373\u6642\u4E8B\u4EF6</span>
      <span><b>\u2462</b> FastAPI \u547C\u53EB RAG Orchestrator</span>
      <span><b>\u2463</b> workflow run\uFF1A\u8655\u7406\u6D41\u7A0B\u8207\u7248\u672C\u5EFA\u7F6E</span>
      <span><b>\u2464</b> RAG \u8B80\u5BEB PostgreSQL\u3001Qdrant \u8207 llama-server \u6A21\u578B</span>
      <span><b>\u2465</b> \u8655\u7406\u6D41\u7A0B\u8B80\u5BEB Parquet\u3001PostgreSQL\u3001Qdrant</span>
      <span><b>\u2466</b> Scheduler\uFF0FCLI \u89F8\u767C\u6279\u6B21\u5DE5\u4F5C</span>
      <span><b>\u2467</b> \u700F\u89BD\u5668 IndexedDB \u672C\u5730\u4FDD\u5B58</span>
    </div>
  </figure>`}function lc(e){let t=String(e||""),s=a=>t===a||t.startsWith(`${a}/`);for(let a of Ra)if(a.prefixes.some(s))return a;return Ra[Ra.length-1]}function ig(e){return`is-${String(e||"get").toLowerCase()}`}function og(e){return`<div class="endpoint-row${e.deprecated?" is-deprecated":""}">
    <span class="endpoint-method ${ig(e.method)}">${r(e.method||"GET")}</span>
    <span class="endpoint-path" title="${r(e.path||"")}">${r(e.path||"")}</span>
    <span class="endpoint-label">${r(e.label||"")}</span>
  </div>`}function lg(e){if(!Array.isArray(e)||!e.length)return'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>';let t=new Map(Ra.map(s=>[s.id,{group:s,endpoints:[]}]));for(let s of e){let a=lc(s.path),n=t.get(a.id);n&&n.endpoints.push(s)}return`<div class="api-endpoint-groups">${Ra.map(s=>{let n=t.get(s.id)?.endpoints||[];return n.length?(n.sort((i,o)=>String(i.path).localeCompare(String(o.path))||String(i.method).localeCompare(String(o.method))),`<section class="card api-endpoint-group">
        <div class="side-card-head">
          <span class="side-card-title">${p(s.icon,14)}${r(s.label)}</span>
          <span class="badge badge-neutral badge-mono">${c(n.length)}</span>
        </div>
        <div class="endpoint-list">${n.map(og).join("")}</div>
      </section>`):""}).join("")}</div>`}function vs(e,t){return`<div class="detail-row">
    <span class="detail-label">${r(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function We(e,t,{mono:s=!1,wide:a=!1}={}){return`<div class="data-version-fact${a?" is-wide":""}">
    <span>${r(e)}</span>
    <strong class="${s?"mono":""}">${r(String(t??"\u2014"))}</strong>
  </div>`}function sc(e,t,s,a=""){let n=t==null?null:Math.max(0,Math.min(100,Number(t)||0));return`<div class="data-version-coverage ${a}">
    <div class="data-version-coverage-head">
      <span>${r(e)}</span>
      <strong>${Dn(n)}</strong>
    </div>
    <div class="data-version-coverage-track"><span style="width:${n===null?0:n.toFixed(1)}%"></span></div>
    <div class="data-version-coverage-foot">${r(s)}</div>
  </div>`}function cg(e){if(!Array.isArray(e)||!e.length)return yt({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${r(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${Wa(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function dg(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=new Map(s.map(w=>[w.id,w])),n=a.get("qdrant"),i=a.get("embedding"),o=a.get("rag"),l=a.get("llm"),d=Number(t.judgment_indexed_count||0),m=Number(t.judgment_count||0),f=m?(d/m*100).toFixed(1):"0.0",y=t.judgment_vector_points===null||t.judgment_vector_points===void 0?"\u2014":c(t.judgment_vector_points),v=Number(t.judgment_index_remaining||0),u=o?.status==="operational"?"RAG \u5C31\u7DD2":o?.status==="not_configured"?"\u672A\u8A2D\u5B9A":o?.status==="degraded"?"\u964D\u7D1A":"\u672A\u77E5",b=[["cube","Qdrant \u5411\u91CF\u7D22\u5F15",n],["layers",`Embedding\uFF08${t.judgment_vector_model||"\u2014"}\uFF09`,i],["brain","RAG \u56DE\u7B54\u7BA1\u7DDA",o],["sparkles","LLM \u6A21\u578B",l]];return`<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("database",14)}RAG \u8CC7\u6599\u73FE\u6CC1</span>
      ${at(o?.status,u)}
    </div>
    <div class="side-card-body">
      <div class="mini-stats">
        <div class="mini-stat">
          <div class="mini-stat-value">${c(m)}</div>
          <div class="mini-stat-label">\u5224\u6C7A</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${c(d)}</div>
          <div class="mini-stat-label">\u5DF2\u7D22\u5F15</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${f}%</div>
          <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
        </div>
      </div>
      <div class="side-status-list">
        ${b.map(([w,k,A])=>`<div class="side-status-row">
              <span>${p(w,13)}${r(k)}</span>
              ${at(A?.status,A?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
            </div>`).join("")}
      </div>
      <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
        Collection\uFF1A${r(t.judgment_vector_collection||"\u2014")} \xB7
        ${y} points \xB7 \u5269\u9918 ${c(v)} \u7B46\u5F85\u7D22\u5F15
      </div>
    </div>
    <div class="side-card-foot">
      PostgreSQL \u5224\u6C7A\u6587\u4EF6\u3001Qdrant \u5411\u91CF\u7D22\u5F15\u8207 llama-server \u6A21\u578B\u72C0\u614B\u7686\u70BA\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u5C31\u7DD2\u6642\u6703\u660E\u78BA\u964D\u7D1A\u3002
    </div>
  </section>`}function Dn(e){let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function $s(e){return Math.max(0,Number(e?.duration_ms)||0)}function ug(e,t){let s=e?.pipeline&&typeof e.pipeline=="object"?e.pipeline:null,a=Array.isArray(s?.stages)?s.stages:[],n=Number(s?.total_ms)||a.reduce((v,u)=>v+$s(u),0),i=Math.max(0,Number(t?.initMs)||0),o=Math.max(0,Number(t?.requestMs)||0),l=Math.max(o,n),d=Math.max(0,l-n),m=[],f=t?.requestStartedAt||e?.checked_at||null,y=t?.requestFinishedAt||e?.checked_at||null;if(i>.5&&m.push({key:"page-init",label:"\u9801\u9762\u521D\u59CB\u5316",caption:"\u5EFA\u7ACB\u670D\u52D9\u7E3D\u89BD\u9AA8\u67B6\u8207\u5C0E\u89BD",color:"#64748b",status:"success",duration_ms:i,started_at:t?.initStartedAt||f,finished_at:f,message:"\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u3001\u8F09\u5165\u6A21\u7D44\u4E26\u6E96\u5099\u8ACB\u6C42\u3002"}),a.length){d>.5&&m.push({key:"http",label:"HTTP \u50B3\u8F38\uFF0F\u6392\u968A",caption:"\u700F\u89BD\u5668 \u2192 FastAPI",color:"#94a3b8",status:"success",duration_ms:d,started_at:f,finished_at:y,message:"\u5305\u542B\u9023\u7DDA\u3001\u8ACB\u6C42\u6392\u968A\u8207\u56DE\u61C9\u50B3\u8F38\u3002"}),m.push(...a);let v=a.reduce((b,w)=>b+$s(w),0),u=Math.max(0,n-v);u>.5&&m.push({key:"server-assemble",label:"\u4F3A\u670D\u5668\u5F59\u6574",caption:"\u72C0\u614B\u56DE\u61C9\u7D44\u88DD",color:"#cbd5e1",status:"success",duration_ms:u,started_at:a[a.length-1]?.finished_at||f,finished_at:y,message:"\u7D44\u88DD\u670D\u52D9\u3001\u8CC7\u6599\u91CF\u8207\u67B6\u69CB payload\u3002"})}else m.push({key:"status-request",label:"GET /api/status",caption:"\u670D\u52D9\u72C0\u614B\u8207\u8CC7\u6599\u91CF",color:"#64748b",status:"success",duration_ms:l,started_at:f,finished_at:y,message:"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF1B\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593\u3002"});return{total_ms:i+l,started_at:t?.initStartedAt||f,finished_at:y,stages:m,server_ms:n,request_ms:l,transport_ms:d,init_ms:i,detailed:!!s}}function pg(e){let t=e?.page_pipeline,s=Array.isArray(t?.stages)?t.stages:[];if(!t||!s.length)return"";let a=Math.max(0,Number(t.total_ms)||s.reduce(($,T)=>$+$s(T),0)),n=Math.max(a,s.reduce(($,T)=>$+$s(T),0),1),i=1.25,o=s.filter($=>String($.status||"success")!=="skipped"),l=s.filter($=>["success","no_change"].includes(String($.status||"success"))).length,d=s.filter($=>$.status==="failed").length,m=s.reduce(($,T)=>$s(T)>$s($)?T:$,s[0]),f=Math.max(0,Number(t.server_ms)||Number(e?.pipeline?.total_ms)||0),y=Math.max(0,Number(t.transport_ms)||0),v=Math.max(0,Number(t.init_ms)||0),u=s.map($=>String($.status||"success")==="skipped"?0:Math.max($s($)/n*100,i)),b=u.reduce(($,T)=>$+T,0),w=b>100?100/b:1,k=0,A=s.map(($,T)=>{let K=String($.status||"success"),G=K==="skipped",fe=$.label||$.key||`\u968E\u6BB5 ${T+1}`,ye=$.caption||"",ie=$s($),L=G?"\u2014":ge(ie),q=n>0?ie/n*100:0,j=G?0:u[T]*w,V=k;G||(k+=j);let de=$.color||"#64748b",z=K==="failed"?"var(--danger)":de,Z=[`is-${K}`,K==="failed"?"is-error":"",G?"is-missing":""].filter(Boolean).join(" "),qe=j>0?`<span class="rag-wf-bar status-wf-bar is-sequential" style="left:${V.toFixed(3)}%;width:${j.toFixed(4)}%;top:0;height:12px;--bar-color:${r(z)}" aria-hidden="true"></span>`:"",F=G?"\u7565\u904E":K==="failed"?"\u5931\u6557":"\u5B8C\u6210",ke=`${t.label||"status"}:${$.key||T}`,ne=[["\u72C0\u614B",F,!0],["\u958B\u59CB",$.started_at?$e($.started_at):"\u2014",!0],["\u7D50\u675F",$.finished_at?$e($.finished_at):"\u2014",!0],["\u8017\u6642",L,!0],["\u5360\u6574\u9AD4",Dn(q),!0],["\u8AAA\u660E",$.message||"",!1]].map(([Se,Pe,Le])=>Le||Pe?`<span class="rag-wf-detail"><span>${r(Se)}</span><strong>${r(String(Pe||"\u2014"))}</strong></span>`:"").join("");return`<details class="rag-wf-stage status-wf-stage ${Z}" data-status-wf-stage="${r(ke)}"${yi.has(ke)?" open":""} style="--stage-color:${r(de)}">
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="status-wf-step">${String(T+1).padStart(2,"0")}</span> ${r(fe)}</strong>${ye?`<small>${r(ye)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(L)} \xB7 ${r(F)} <span class="rag-wf-chevron">${p("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${fe}\uFF1A${F}\uFF0C\u8017\u6642 ${L}\uFF0C\u5360\u6574\u9AD4 ${Dn(q)}`)}">${qe}</span>
        </summary>
        <div class="rag-wf-details">${ne}</div>
      </details>`}).join(""),S=t.detailed?"\u5F8C\u7AEF /api/status \u968E\u6BB5\u660E\u7D30":"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF0C\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593";return`<section class="report-card status-wf-card" data-status-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${p("activity",14)}\u670D\u52D9\u7E3D\u89BD\u8F09\u5165 Pipeline</span>
      <div class="index-runtime-metrics">
        <span class="index-runtime-metric" title="\u672C\u6B21\u9801\u9762\u521D\u59CB\u5316\u5230\u72C0\u614B\u56DE\u61C9\u5B8C\u6210\u7684\u7E3D\u6642\u9593\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(ge(a))}</strong></span>
        <span class="index-runtime-metric" title="\u5F8C\u7AEF /api/status \u6AA2\u67E5\u968E\u6BB5\u7684\u5408\u8A08\u6642\u9593\u3002"><span>Server</span><strong>${r(ge(f))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u8ACB\u6C42\u6642\u9593\u6263\u6389\u5F8C\u7AEF\u6AA2\u67E5\u5F8C\u7684\u50B3\u8F38\u8207\u6392\u968A\u6642\u9593\u3002"><span>HTTP \u50B3\u8F38</span><strong>${r(ge(y))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u9AA8\u67B6\u8207\u8F09\u5165\u6A21\u7D44\u7684\u6642\u9593\u3002"><span>\u9801\u9762\u521D\u59CB\u5316</span><strong>${r(ge(v))}</strong></span>
        <span class="index-runtime-metric" title="\u8017\u6642\u6700\u9577\u7684\u6AA2\u67E5\u968E\u6BB5\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${m?.label||"\u2014"} \xB7 ${ge($s(m))}`)}</strong></span>
        <span class="index-runtime-metric" title="\u5B8C\u6210\u7684\u6AA2\u67E5\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\uFF1B\u5931\u6557\u968E\u6BB5\u6703\u4EE5\u7D05\u8272\u6A19\u793A\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${c(l)} / ${c(s.length)}${d?` \xB7 \u5931\u6557 ${c(d)}`:""}</strong></span>
      </div>
    </div>
    <div class="status-wf-summary">
      <span>\u6AA2\u67E5 <strong>${r($e(e.checked_at))}</strong></span>
      <span>API <strong class="mono">${r(_s())}</strong></span>
      <span>\u7248\u672C <strong class="mono">v${r(e.version||"\u2014")}</strong></span>
      <span>\u74B0\u5883 <strong>${r(e.environment||"\u2014")}</strong></span>
      <span>${r(S)}</span>
    </div>
    <div class="status-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${r(ge(a))}</span>
      </div>
      <div class="rag-wf-legend workflow-wf-legend" aria-label="\u968E\u6BB5\u72C0\u614B\u5716\u4F8B">
        <span><i class="is-solid-state"></i>\u5B8C\u6210</span>
        <span><i class="is-failed-state"></i>\u5931\u6557</span>
        <span><i class="is-empty-state"></i>\u7565\u904E</span>
      </div>
      <div class="rag-wf-stages">${A}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u986F\u793A\u672C\u6B21\u958B\u555F\u670D\u52D9\u7E3D\u89BD\u7684\u9801\u9762\u521D\u59CB\u5316\u3001HTTP \u5F80\u8FD4\u3001\u5F8C\u7AEF\u6AA2\u67E5\u8207\u56DE\u61C9\u5F59\u6574\u3002\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u5931\u6557\u968E\u6BB5\u4EE5\u7D05\u8272\u6A19\u793A\uFF0C\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\uFF1B\u6975\u77ED\u968E\u6BB5\u4FDD\u7559\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function mg(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=tg(e.status),n=s.find(m=>m.id==="qdrant"),i=s.find(m=>m.id==="rag"),o=s.find(m=>m.id==="llm"),l=Qt(),d=rc[l]||l;return`<section class="status-hero">
      <div class="status-hero-main">
        <div class="overall-row">
          <span class="overall-badge ${a.tone==="warn"?"is-warn":a.tone==="danger"?"is-danger":""}">
            <span class="status-dot ${a.tone==="ok"?"is-ok":a.tone==="warn"?"is-warn":"is-danger"}" aria-hidden="true"></span>
            ${r(a.label)}
          </span>
          <span class="badge badge-neutral badge-mono">v${r(e.version||"\u2014")}</span>
          <span class="badge badge-neutral badge-mono">${r(e.environment||"\u2014")}</span>
        </div>
        <h2 class="status-headline">${r(a.headline)}</h2>
        <p class="status-copy">${r(a.copy)}</p>
        <div class="status-meta">
          <span>${p("clock",11)} \u6AA2\u67E5\u6642\u9593 ${$e(e.checked_at)} \xB7 ${r(fa(e.checked_at))}</span>
          <span>${p("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${p("database",11)} ${c(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${p("layers",11)} ${c(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${r(d)}">${p("link",11)} ${r(_s())}</span>
        </div>
      </div>
    </section>

    ${pg(e)}

    <div class="service-grid">${s.map(sg).join("")}</div>

    ${dg(e)}

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

    ${n?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${Ge({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${r(n?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${r(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${r(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}`}function gg(e,t=!1){let s=Array.isArray(e.services)?e.services:[],a=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Pipelines \u2192 Data \xB7 \u6700\u65B0\u5C08\u6848\u5143\u4EF6\u8207\u5373\u6642\u5065\u5EB7\u72C0\u614B</div>
      </div>
      <span class="badge badge-neutral badge-mono">${c((a.flow||[]).length)} layers</span>
    </div>
    ${ng(a,s,t)}
  </div>`}function fg(e){let t=Array.isArray(e.endpoints)?e.endpoints:[],s=Qt(),a=rc[s]||s,n=$t("/api/docs"),i=$t("/api/openapi.json"),o=new Set(t.map(m=>lc(m.path).id)),l=t.reduce((m,f)=>{let y=String(f.method||"GET").toUpperCase();return m[y]=(m[y]||0)+1,m},{}),d=["GET","POST","PATCH","PUT","DELETE"].filter(m=>l[m]).map(m=>`${m} ${c(l[m])}`).join(" \xB7 ");return`<section class="status-hero api-endpoint-hero">
      <div class="status-hero-main">
        <div class="overall-row">
          <span class="overall-badge">
            <span class="status-dot is-ok" aria-hidden="true"></span>
            OpenAPI \u6700\u65B0
          </span>
          <span class="badge badge-neutral badge-mono">${c(t.length)} \u500B\u7AEF\u9EDE</span>
          <span class="badge badge-neutral badge-mono">${c(o.size)} \u500B\u5206\u985E</span>
        </div>
        <h2 class="status-headline">API \u7AEF\u9EDE\u76EE\u9304</h2>
        <p class="status-copy">\u7531 FastAPI \u76EE\u524D\u8DEF\u7531\u8868\u81EA\u52D5\u6574\u7406\uFF0C\u6DB5\u84CB REST\u3001SSE\u3001\u8CC7\u6599\u8655\u7406\u3001\u7248\u672C\u7D22\u5F15\u3001\u984C\u5EAB\u3001Benchmark\u3001\u6E2C\u8A66 Flow \u8207\u6A21\u578B\u670D\u52D9\u3002</p>
        <div class="status-meta">
          <span>${p("server",11)} API Base <span class="mono">${r(_s())}</span>\uFF08${r(a)}\uFF09</span>
          <span>${p("terminal",11)} ${r(d||"\u2014")}</span>
          <span>${p("clock",11)} \u66F4\u65B0\u6642\u9593 ${$e(e.checked_at)}</span>
        </div>
      </div>
      <div class="api-endpoint-actions">
        <a class="btn btn-secondary btn-sm" href="${r(n)}" target="_blank" rel="noopener noreferrer">${p("external",13)}<span>Swagger UI</span></a>
        <a class="btn btn-ghost btn-sm" href="${r(i)}" target="_blank" rel="noopener noreferrer">OpenAPI JSON ${p("external",11)}</a>
      </div>
    </section>
    ${lg(t)}
    <p class="status-footnote">\u7AEF\u9EDE\u7531 FastAPI route table \u52D5\u614B\u7522\u751F\uFF1B\u4E92\u52D5\u5F0F\u6587\u4EF6\u4F4D\u65BC <a href="${r(n)}" target="_blank" rel="noopener noreferrer"><code>${r(n)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${r(i)}" target="_blank" rel="noopener noreferrer"><code>${r(i)}</code></a>\u3002\u7AEF\u9EDE\u8B8A\u66F4\u5F8C\u91CD\u65B0\u6574\u7406\u6B64\u9801\u5373\u53EF\u53D6\u5F97\u6700\u65B0\u6E05\u55AE\u3002</p>`}function bg(e,t={}){let s=e.data||{},a=t.info||null,n=a?.counts||{},i=Number(s.judgment_indexed_count||0),o=Number(s.judgment_count||0),l=Number(s.judgment_index_remaining??Math.max(0,o-i)),d=Number(s.judgment_index_pending??l)||0,m=Number(s.judgment_index_changed||0),f=Number(s.judgment_index_stale||0),y=o>0?Math.max(0,Math.min(100,i/o*100)):null,v=Dn(y),u=s.judgment_index_fresh===!1||d>0||String(s.judgment_index_staleness?.status||"")==="stale",b=u?"is-warn":"",w=s.last_version||{},k=s.last_run||{},A=w.source_type==="law"?"\u6CD5\u898F":w.source_type==="order"?"\u547D\u4EE4":"\u2014",S=w.version_code?String(w.version_code):w.id?`#${c(w.id)}`:"\u2014",$=Number(s.legal_article_indexed_count||s.legal_index?.points_count||0),T=Number(s.legal_article_count||s.legal_index?.article_count||0),K=T>0?Math.max(0,Math.min(100,$/T*100)):null,G=s.legal_article_stale===!0||String(s.legal_index?.status||"")==="stale",fe=G?"is-warn":"",ye=s.judgment_vector_alias||"\u2014",ie=s.judgment_vector_collection||"\u2014",L=s.legal_article_vector_alias||s.legal_index?.alias||"\u2014",q=s.legal_article_vector_collection||s.legal_index?.collection||"\u2014",j=u?"\u5224\u6C7A\u7D22\u5F15\u5F85\u66F4\u65B0":"\u8CC7\u6599\u7248\u672C\u4E00\u81F4",V=u?`\u5224\u6C7A\u7D22\u5F15\u5C1A\u7F3A ${c(d)} \u7B46`:"\u5224\u6C7A\u8CC7\u6599\u8207\u5411\u91CF\u7D22\u5F15\u4E00\u81F4",de=u?`PostgreSQL \u76EE\u524D\u6709 ${c(o)} \u7B46\u5224\u6C7A\uFF0CQdrant ${ie} \u5DF2\u7D22\u5F15 ${c(i)} \u7B46\uFF1B\u5C1A\u6709 ${c(d)} \u7B46\u5F85\u7D22\u5F15\u3002`:"PostgreSQL \u8207 Qdrant \u5224\u6C7A\u7B46\u6578\u4E00\u81F4\uFF1B\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u8207\u7D22\u5F15\u72C0\u614B\u540C\u6B65\u3002",z=Wt(k.status||"idle").label,Z=k.finished_at||k.started_at;return`<section class="status-hero data-version-hero">
      <div class="status-hero-main">
        <div class="overall-row">
          <span class="overall-badge ${b}">
            <span class="status-dot ${u?"is-warn":"is-ok"}" aria-hidden="true"></span>
            ${r(j)}
          </span>
          <span class="badge badge-neutral badge-mono">${c(s.version_count)} \u500B\u8CC7\u6599\u7248\u672C</span>
          <span class="badge badge-neutral">${r(A)} \u6700\u65B0\u7248\u672C ${r(S)}</span>
        </div>
        <h2 class="status-headline">${r(V)}</h2>
        <p class="status-copy">${r(de)}</p>
        <div class="status-meta">
          <span>${p("clock",11)} \u6AA2\u67E5\u6642\u9593 ${$e(e.checked_at)}</span>
          <span>${p("database",11)} \u73FE\u884C\u8CC7\u6599 ${c(s.total_current)} \u7B46</span>
          <span>${p("layers",11)} \u539F\u59CB Parquet ${c(s.parquet_files)} \u500B \xB7 ${Ce(s.parquet_bytes)}</span>
          <span title="Qdrant alias \u8207\u76EE\u524D\u7248\u672C collection">${p("link",11)} <span class="mono">${r(ye)} \u2192 ${r(ie)}</span></span>
        </div>
      </div>
      <div class="data-version-ring ${b}" style="--coverage:${y===null?0:y.toFixed(1)}%">
        <div class="data-version-ring-inner">
          <strong>${v}</strong>
          <span>\u5224\u6C7A\u7D22\u5F15\u8986\u84CB</span>
          <small>${c(i)} / ${c(o)}</small>
        </div>
      </div>
    </section>

    <div class="status-summary data-version-metrics">
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u6CD5\u898F</div>
        <div class="metric-value">${c(s.law_count)}</div>
        <div class="metric-foot">source_type = law</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u547D\u4EE4</div>
        <div class="metric-value">${c(s.order_count)}</div>
        <div class="metric-foot">source_type = order</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u689D\u6587\u7E3D\u6578</div>
        <div class="metric-value">${c(s.article_count)}</div>
        <div class="metric-foot">\u73FE\u884C\u7248\u672C\u5408\u8A08</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u8CC7\u6599\u7248\u672C</div>
        <div class="metric-value">${c(s.version_count)}</div>
        <div class="metric-foot">${c(s.parquet_files)} \u500B\u539F\u59CB Parquet \xB7 ${Ce(s.parquet_bytes)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u5224\u6C7A\u6587\u4EF6</div>
        <div class="metric-value">${c(s.judgment_count)}</div>
        <div class="metric-foot">PostgreSQL current</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Qdrant \u5224\u6C7A\u5411\u91CF\u7D22\u5F15</div>
        <div class="metric-value">${c(s.judgment_indexed_count)}</div>
        <div class="metric-foot">${v} \xB7 \u5269\u9918 ${c(d)} \u7B46</div>
      </div>
    </div>

    <div class="status-columns data-version-grid">
      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${p("database",14)}PostgreSQL \u8CC7\u6599\u7248\u672C</span>
          ${at(w.is_current?"operational":"degraded",w.is_current?"CURRENT":"HISTORY")}
        </div>
        ${w.id?`<div class="index-current-row">
                <span class="badge badge-info">${p("activity",11)}${r(A)} ${r(S)}</span>
                <strong class="mono">${$e(w.downloaded_at)}</strong>
                <span class="index-current-copy" title="${r(w.parquet_path||"")}">${r(w.parquet_path||"\u2014")}</span>
              </div>
              <div class="data-version-facts">
                ${We("\u8CC7\u6599\u7248\u672C\u7E3D\u6578",c(s.version_count),{mono:!0})}
                ${We("\u4E0B\u8F09\u57F7\u884C\u7E3D\u6578",c(s.run_count),{mono:!0})}
                ${We("\u7248\u672C ID",`#${c(w.id)}`,{mono:!0})}
                ${We("\u8CC7\u6599\u985E\u578B",A)}
                ${We("\u4F86\u6E90\u66F4\u65B0\u65E5",w.update_date||"\u2014")}
                ${We(`${A}\uFF0F\u689D\u6587`,`${c(w.law_count)} / ${c(w.article_count)}`)}
                ${We("\u4E0B\u8F09\u6642\u9593",$e(w.downloaded_at),{mono:!0})}
                ${We("\u8CC7\u6599\u72C0\u614B",w.is_current?"current":"history",{mono:!0})}
                ${We("Parquet \u6A94\u6848",w.parquet_path||"\u2014",{mono:!0,wide:!0})}
              </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${p("browser",14)}IndexedDB \u672C\u6A5F\u8CC7\u6599</span>
          <span class="badge ${a?.available?"badge-ok":"badge-neutral"} badge-mono">${r(a?.mode==="memory"?"MEMORY":a?"INDEXEDDB":"LOADING")}</span>
        </div>
        ${a?`<div class="index-current-row">
                <span class="badge badge-info">${p("database",11)}${r(a.name||"judgment-console")} v${c(a.version)}</span>
                <strong class="mono">${c(a.total)} \u7B46</strong>
                <span class="index-current-copy">${c(n.query_history)} \u5247\u63D0\u554F \xB7 ${c(n.audit_events)} \u7B46\u7A3D\u6838 \xB7 ${c(n.settings)} \u9805\u8A2D\u5B9A</span>
              </div>
              <div class="data-version-facts">
                ${We("Schema \u7248\u672C",`v${c(a.version)}`,{mono:!0})}
                ${We("\u5132\u5B58\u6A21\u5F0F",a.mode||"\u2014",{mono:!0})}
                ${We("query_history",`${c(n.query_history)} / ${c(a.caps?.history)}`,{mono:!0})}
                ${We("audit_events",`${c(n.audit_events)} / ${c(a.caps?.audit)}`,{mono:!0})}
                ${We("settings",c(n.settings),{mono:!0})}
                ${We("\u7E3D\u7D00\u9304\u6578",c(a.total),{mono:!0})}
                ${We("\u5DF2\u7528\u5BB9\u91CF",Ce(a.usage_bytes),{mono:!0})}
                ${We("\u53EF\u7528\u914D\u984D",Ce(a.quota_bytes),{mono:!0})}
              </div>
              <p class="data-version-note">${p("info",12)}
                IndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u7AEF\u63D0\u554F\u6B77\u53F2\u3001\u8A2D\u5B9A\u8207\u7248\u672C\u7A3D\u6838\u4E8B\u4EF6\uFF1B\u4F3A\u670D\u5668\u8CC7\u6599\u4EE5 PostgreSQL \u8207 Parquet \u70BA\u6E96\u3002
              </p>`:`<div class="report-empty-inline">${t.loading||!t.error?"\u6B63\u5728\u8B80\u53D6\u700F\u89BD\u5668 IndexedDB\u2026":r(t.error?.message||"IndexedDB \u5C1A\u7121\u8CC7\u6599\u6216\u7121\u6CD5\u8B80\u53D6\u3002")}</div>`}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${p("brain",14)}Qdrant \u5224\u6C7A\u5411\u91CF\u7D22\u5F15</span>
          ${at(u?"degraded":"operational",u?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${p("link",11)}Alias</span>
          <strong class="mono">${r(ye)}</strong>
          <span class="mono">\u2192 ${r(ie)}</span>
          <span class="index-current-copy">v#${c(s.judgment_vector_version_id)} \xB7 ${r(s.judgment_vector_model||"\u2014")}</span>
        </div>
        ${sc("\u7D22\u5F15\u8986\u84CB",y,`\u5DF2\u7D22\u5F15 ${c(i)} / ${c(o)} \u7B46 \xB7 \u5269\u9918 ${c(d)} \u7B46`,b)}
        <div class="data-version-facts">
          ${We("Qdrant points",c(s.judgment_vector_points),{mono:!0})}
          ${We("\u7D22\u5F15\u7248\u672C",`#${c(s.judgment_vector_version_id)} \xB7 ${s.judgment_vector_version_status||"legacy"}`,{mono:!0})}
          ${We("\u524D\u4E00\u7248\u672C",s.judgment_vector_previous_version_id?`#${c(s.judgment_vector_previous_version_id)}`:"\u2014",{mono:!0})}
          ${We("\u5F85\u88DC\uFF0F\u8B8A\u66F4\uFF0F\u5931\u6548",`${c(d)} / ${c(m)} / ${c(f)}`)}
          ${We("\u6700\u8FD1\u7D22\u5F15",$e(s.judgment_indexed_at),{mono:!0})}
          ${We("\u6A21\u578B",s.judgment_vector_model||"\u2014",{mono:!0})}
        </div>
        ${d>0?`<p class="data-version-note is-warn">${p("info",12)}\u5C1A\u6709 ${c(d)} \u7B46\u5224\u6C7A\u5C1A\u672A\u7D22\u5F15\uFF1B\u8ACB\u81F3\u300C\u8CC7\u6599\u8655\u7406 \u2192 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u63A5\u7E8C\u88DC\u9F4A\u3002</p>`:""}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${p("shield",14)}Qdrant \u6CD5\u898F\uFF0F\u547D\u4EE4\u5411\u91CF\u7D22\u5F15</span>
          ${at(G?"degraded":"operational",G?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${p("link",11)}Alias</span>
          <strong class="mono">${r(L)}</strong>
          <span class="mono">\u2192 ${r(q)}</span>
          <span class="index-current-copy">v#${c(s.legal_article_vector_version_id||s.legal_index?.version_id)}</span>
        </div>
        ${sc("\u689D\u6587\u7D22\u5F15\u8986\u84CB",K,`\u5DF2\u7D22\u5F15 ${c($)} / ${c(T)} \u689D`,fe)}
        <div class="data-version-facts">
          ${We("Qdrant points",c($),{mono:!0})}
          ${We("\u73FE\u884C\u689D\u6587",c(T),{mono:!0})}
          ${We("\u5411\u91CF\u7DAD\u5EA6",c(s.legal_index?.dimension),{mono:!0})}
          ${We("\u6700\u8FD1\u7D22\u5F15",$e(s.legal_article_indexed_at||s.legal_index?.indexed_at),{mono:!0})}
          ${We("\u7D22\u5F15\u72C0\u614B",G?"stale":"fresh",{mono:!0})}
          ${We("Collection",q,{mono:!0})}
        </div>
      </section>

      <section class="card data-version-card is-wide-grid">
        <div class="side-card-head">
          <span class="side-card-title">${p("folder",14)}Parquet \u8207\u57F7\u884C\u72C0\u614B</span>
          <span class="badge badge-neutral badge-mono">${c(s.parquet_files)} FILES</span>
        </div>
        <div class="data-version-facts">
          ${We("\u539F\u59CB Parquet \u6A94\u6848",c(s.parquet_files),{mono:!0})}
          ${We("\u5408\u8A08\u5BB9\u91CF",Ce(s.parquet_bytes),{mono:!0})}
          ${We("PostgreSQL \u73FE\u884C\u8CC7\u6599",c(s.total_current),{mono:!0})}
          ${We("\u8CC7\u6599\u7248\u672C\u7E3D\u6578",c(s.version_count),{mono:!0})}
          ${We("\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C",k.status?z:"\u2014")}
          ${We("\u6700\u8FD1\u57F7\u884C\u6642\u9593",Z?$e(Z):"\u2014",{mono:!0})}
          ${We("\u6700\u8FD1\u57F7\u884C\u8017\u6642",k.duration_ms?ge(k.duration_ms):"\u2014",{mono:!0})}
          ${We("\u6700\u8FD1\u57F7\u884C\u7248\u672C",k.version_id?`#${c(k.version_id)}`:"\u2014",{mono:!0})}
        </div>
        <p class="data-version-note">${p("info",12)}
          \u539F\u59CB Parquet \u4FDD\u7559 raw\uFF0Fdelta \u8207 manifest\uFF1BPostgreSQL \u63D0\u4F9B current metadata \u8207\u7248\u672C\u72C0\u614B\uFF1BQdrant \u53EA\u4FDD\u5B58\u5411\u91CF\u8207 payload\u3002
        </p>
      </section>
    </div>`}function hg(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${p("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${c(t.run_count)} TOTAL</span>
    </div>
    ${cg(e.recent_runs)}
  </section>`}function vg(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function cc(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function Hs(e,t,s,a,n){let i=vg(n);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${p(t,14)}${r(e)}</span>
      <strong>${r(s)}</strong>
    </div>
    ${cc(n,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function $g(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${p("layers",14)}Docker</span>
        ${at("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${r(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,d=o.service?0:1;return l-d||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${r(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${r(i.service)}</span>`:""}</td>
        <td>${at(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
        <td class="cell-number">${i.cpu_percent===null||i.cpu_percent===void 0?"\u2014":`${c(i.cpu_percent)}%`}</td>
        <td class="cell-number">${Ce(i.memory_used)}${i.memory_limit?` / ${Ce(i.memory_limit)}`:""}</td>
        <td class="mono">${r(i.net_io||"\u2014")}</td>
        <td class="mono">${r(i.block_io||"\u2014")}</td>
        <td class="cell-number">${c(i.pids)}</td>
      </tr>`).join(""),n=(t.system||[]).map(i=>`<span class="resource-docker-pill">
        <strong>${r(i.type||"\u2014")}</strong>
        <span>${c(i.count)} \xB7 ${r(i.size||"\u2014")}</span>
      </span>`).join("");return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${p("layers",14)}Docker \u5BB9\u5668\u4F7F\u7528\u8CC7\u6E90</span>
      <span class="badge badge-ok badge-mono">${c(s.length)} \u500B\u5BB9\u5668</span>
    </div>
    ${n?`<div class="resource-docker-system">${n}</div>`:""}
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
    <div class="side-card-foot">${r(t.detail||"Docker \u8CC7\u6E90\u7D71\u8A08")}</div>
  </section>`}function yg(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",n=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${vs("\u8CC7\u6599\u5EAB",`<code>${r(s.database||"\u2014")}</code>`)}
           ${vs("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${Ce(s.storage_bytes)}</strong>`)}
           ${vs("Docker volume",`<strong>${Ce(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${vs("\u9023\u7DDA\u6578",`<strong>${c(s.connections)}</strong>`)}`:`${vs("Collection",`<code>${r(s.collection||"\u2014")}</code>`)}
           ${vs("Docker volume",`<strong>${Ce(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${vs("\u5411\u91CF\u9EDE\u6578",`<strong>${c(s.points_count)}</strong>`)}
           ${vs("Collections",`<strong>${c(s.collections)}</strong>`)}
           ${vs("Segments",`<strong>${c(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${r(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${r(s.kind||"")}</div>
          </div>
          ${at(i)}
        </div>
        <div class="resource-db-metrics">
          <div><span>CPU</span><strong>${s.cpu_percent===null||s.cpu_percent===void 0?"\u2014":`${c(s.cpu_percent)}%`}</strong></div>
          <div><span>RAM</span><strong>${Ce(s.memory_used)}</strong><small>${s.memory_limit?` / ${Ce(s.memory_limit)}`:""}</small></div>
          <div><span>\u5BB9\u5668</span><strong class="mono">${r(s.container||"\u2014")}</strong><small>${r(s.container_status||"\u2014")}</small></div>
        </div>
        <div class="detail-list">${o}</div>
        ${n.length?`<div class="resource-table-wrap">
                <table class="data-table is-compact">
                  <thead><tr><th scope="col">\u8CC7\u6599\u8868</th><th scope="col">\u5927\u5C0F</th></tr></thead>
                  <tbody>${n.map(l=>`<tr>
                        <td class="mono">${r(l.name||"\u2014")}</td>
                        <td class="cell-number">${Ce(l.bytes)}</td>
                      </tr>`).join("")}</tbody>
                </table>
              </div>`:""}
        <div class="side-card-foot">${r(s.detail||"")}</div>
      </article>`}).join("")}</div>`}function la(e,t,s,a){let n=Number(t)||0,i=a?n/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${r(e)}</span>
      <strong>${Ce(n)}</strong>
    </div>
    ${cc(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function wg(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},n=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},d=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${p("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${Ce(d)}</span>
    </div>
    <div class="storage-list">
      ${la("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${r(s.frontend_path||"\u2014")}</span>`,d)}
      ${la("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${r(s.backend_path||"\u2014")}</span>`,d)}
      ${la("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",n.layers_bytes,`Images ${Ce(n.images_bytes)} \xB7 Containers ${Ce(n.containers_bytes)} \xB7 Build cache ${Ce(n.build_cache_bytes)}`,d)}
      ${la("PostgreSQL volume",o.size_bytes,`<span class="mono">${r(o.name||"\u2014")}</span>`,d)}
      ${la("Qdrant volume",l.size_bytes,`<span class="mono">${r(l.name||"\u2014")}</span>`,d)}
      ${la("Parquet",a.total_bytes,`\u6CD5\u898F ${Ce(a.law_bytes)} \xB7 \u5224\u6C7A ${Ce(a.judgment_bytes)}`,d)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${Ce(d)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function _g(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},n=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),d=Array.isArray(e.disk)?e.disk:[],m=d[0]||{},f=Number(o.total_bytes||m.total||0),y=f?l/f*100:0,v=[s.load_1,s.load_5,s.load_15].map(w=>w??"\u2014").join(" / "),u=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":ge(Number(t.uptime_seconds)*1e3),b=[m.label?Hs("HDD \u5DF2\u4F7F\u7528","database",`${c(m.percent)}%`,`${Ce(m.used)} / ${Ce(m.total)} \xB7 \u5269\u9918 ${Ce(m.free)}<br><span class="mono">${r(m.path||"")}</span>`,m.percent):"",l?Hs("Judgment \u5143\u4EF6\u5408\u8A08","layers",Ce(l),`\u7D04\u5360 HDD ${c(y)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,y):"",...d.slice(1).map(w=>Hs(`\u786C\u789F \xB7 ${w.label}`,"layers",`${c(w.percent)}%`,`${Ce(w.used)} / ${Ce(w.total)} \xB7 \u5269\u9918 ${Ce(w.free)}<br><span class="mono">${r(w.path||"")}</span>`,w.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${$e(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${Hs("CPU \u4F7F\u7528\u7387","cpu",`${c(s.percent)}%`,`${c(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${c(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${r(v)}`,s.percent)}
      ${Hs("\u8A18\u61B6\u9AD4","server",`${c(a.percent)}%`,`${Ce(a.used)} / ${Ce(a.total)} \xB7 \u53EF\u7528 ${Ce(a.available)}`,a.percent)}
      ${Hs("Swap","layers",`${c(n.percent)}%`,`${Ce(n.used)} / ${Ce(n.total)}`,n.percent)}
      ${Hs("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${c(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${r(u)}<br>${r(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${b||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${wg(e)}
    ${$g(e)}
    ${yg(e)}`}function ac(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function kg(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SYSTEM RESOURCE USAGE</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Ge({tone:"danger",title:"\u8CC7\u6E90 API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-resources-retry">
          ${p("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Sg(e){return e.status==="operational"?{label:"\u5DF2\u9023\u7DDA",badge:"badge-ok"}:{label:"\u7121\u6CD5\u9023\u7DDA",badge:"badge-danger"}}function xg(e,t){let s=Sg(e),a=Array.isArray(e.models)?e.models:[],n=a.length?a.map(i=>{let o=String(i.name||""),l=e.chat_model===o,d=e.embedding_model===o,m=i.size?Ce(i.size):"",f=i.modified_at?$e(i.modified_at):"",y=new Set((i.capabilities||[]).map(u=>String(u||"").toLowerCase())),v=[];return i.supports_chat===!0&&v.push(["Chat","badge-ok"]),y.has("embedding")&&v.push(["Embedding","badge-info"]),y.has("vision")&&v.push(["Vision","badge-neutral"]),y.has("tools")&&v.push(["Tools","badge-neutral"]),y.has("thinking")&&v.push(["Thinking","badge-neutral"]),y.has("speech")&&v.push(["Speech","badge-warn"]),i.is_reranker&&v.push(["Reranker","badge-neutral"]),v.length||v.push([i.capability_status==="untested"?"\u672A\u6E2C\u8A66":"\u7121 chat \u80FD\u529B","badge-neutral"]),`<div class="ollama-model-row">
            <div class="ollama-model-main">
              <strong>${r(o)}</strong>
              <span class="ollama-model-meta">${[m,f].filter(Boolean).map(u=>r(u)).join(" \xB7 ")||"\u2014"}</span>
              <div class="ollama-model-capabilities">${v.map(([u,b])=>`<span class="badge ${b}">${r(u)}</span>`).join("")}</div>
            </div>
            <div class="ollama-model-roles">
              ${l?'<span class="badge badge-ok">\u804A\u5929</span>':""}
              ${d?'<span class="badge badge-ok">\u5D4C\u5165</span>':""}
            </div>
            <div class="ollama-model-actions">
              <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="${l?"clear-model":"select-model"}" data-id="${e.id}" data-model="${r(o)}" data-role="chat">
                ${l?"\u65B7\u958B\u804A\u5929":"\u9023\u63A5\u804A\u5929"}
              </button>
              <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="${d?"clear-model":"select-model"}" data-id="${e.id}" data-model="${r(o)}" data-role="embedding">
                ${d?"\u65B7\u958B\u5D4C\u5165":"\u9023\u63A5\u5D4C\u5165"}
              </button>
            </div>
          </div>`}).join(""):`<div class="ollama-empty">${e.status==="operational"?"\u6B64\u4E3B\u6A5F\u6C92\u6709\u53EF\u7528\u6A21\u578B\u3002":"\u7121\u6CD5\u53D6\u5F97\u6A21\u578B\u5217\u8868\uFF0C\u8ACB\u78BA\u8A8D\u4E3B\u6A5F\u72C0\u614B\u3002"}</div>`;return`<article class="ollama-host-card${e.is_active?" is-active":""}">
    <div class="ollama-host-head">
      <div class="ollama-host-title">
        <div class="ollama-host-name">
          <strong>${r(e.name||e.base_url)}</strong>
          ${e.is_active?'<span class="badge badge-ok">\u76EE\u524D\u4F7F\u7528</span>':""}
          <span class="badge ${s.badge}">${s.label}</span>
        </div>
        <span class="mono ollama-host-url">${r(e.base_url)}</span>
        ${e.detail?`<span class="ollama-host-detail">${r(e.detail)}</span>`:""}
      </div>
      <div class="qb-actions">
        ${e.is_active?'<button class="btn btn-secondary btn-sm" type="button" data-ollama-action="deactivate-host">\u505C\u7528\u4E3B\u6A5F</button>':`<button class="btn btn-primary btn-sm" type="button" data-ollama-action="activate-host" data-id="${e.id}">\u4F7F\u7528\u6B64\u4E3B\u6A5F</button>`}
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="edit-host" data-id="${e.id}">${p("edit",13)}<span>\u7DE8\u8F2F</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="delete-host" data-id="${e.id}">${p("trash",13)}<span>\u522A\u9664</span></button>
      </div>
    </div>
    <div class="ollama-model-list">${n}</div>
  </article>`}function Ag(e,t,s,a){if(s)return`<div class="report-card">
      ${Ge({tone:"danger",title:"Model Provider \u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${p("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=e||{hosts:[],active_host_id:null},i=Array.isArray(n.hosts)?n.hosts:[],o=a?i.find(m=>Number(m.id)===Number(a)):null,l=o?o.base_url.replace(new RegExp(`:${o.port}$`),""):"http://127.0.0.1",d=o?"\u5132\u5B58\u8B8A\u66F4":"\u65B0\u589E\u4E3B\u6A5F";return`<div class="report-card ollama-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">MODEL PROVIDER</div>
        <div class="report-title">llama-server \u4E3B\u6A5F\u8207\u6A21\u578B</div>
        <div class="report-sub">\u7BA1\u7406\u53EF\u7528\u7684 llama-server \u9023\u7DDA\u3001\u76EE\u524D\u4F7F\u7528\u7684\u4E3B\u6A5F\uFF0C\u4EE5\u53CA\u4E3B\u6A5F\u4E0A\u7684\u804A\u5929\uFF0F\u5D4C\u5165\u6A21\u578B\u3002\u6BCF\u6B21\u958B\u555F\u6B64\u9801\u90FD\u6703\u91CD\u65B0\u53D6\u5F97\u4E3B\u6A5F\u8207\u6A21\u578B\u5217\u8868\uFF1Bembedding \u4E3B\u6A5F\u7684\u512A\u5148\u9806\u5E8F\u53EF\u5230\u300C\u8CC7\u6599\u8655\u7406\u300D\u7684\u57F7\u884C\u8CC7\u8A0A\u5361\u7247\u62D6\u79FB\u8ABF\u6574\u3002</div>
      </div>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="check-capabilities">${p("shield",14)}<span>\u6AA2\u67E5\u6A21\u578B\u80FD\u529B</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${p("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span></button>
      </div>
    </div>
    <div class="report-section">
      <form class="ollama-host-form" data-ollama-form="host">
        <input type="hidden" name="host_id" value="${o?o.id:""}" />
        <label class="field"><span class="field-label">\u540D\u7A31 <span class="field-tag">\u9078\u586B</span></span>
          <input class="input" name="name" value="${r(o?.name||"")}" placeholder="\u4F8B\u5982\uFF1Ax570 llama-server" />
        </label>
        <label class="field"><span class="field-label">\u4E3B\u6A5F\u7DB2\u5740</span>
          <input class="input" name="url" value="${r(l)}" placeholder="http://127.0.0.1" required />
        </label>
        <label class="field"><span class="field-label">Port</span>
          <input class="input" name="port" type="number" min="1" max="65535" value="${o?.port||11437}" required />
        </label>
        <div class="ollama-host-form-actions">
          <button class="btn btn-primary btn-sm" type="submit">${p("check",13)}<span>${d}</span></button>
          ${o?'<button class="btn btn-ghost btn-sm" type="button" data-ollama-action="cancel-host-edit">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
        </div>
      </form>
      ${t?'<div class="ollama-loading"><span class="spinner"></span><span>\u8B80\u53D6 llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span></div>':i.length?`<div class="ollama-host-list">${i.map(m=>xg(m,a)).join("")}</div>`:yt({iconName:"server",title:"\u5C1A\u672A\u8A2D\u5B9A llama-server \u4E3B\u6A5F",text:"\u8ACB\u5728\u4E0A\u65B9\u8F38\u5165\u7DB2\u5740\u8207 Port \u65B0\u589E\uFF0C\u6216\u4F7F\u7528 .env \u7684\u9810\u8A2D\u9023\u7DDA\u3002"})}
      <p class="report-sub" style="margin-top:12px">\u8A2D\u70BA\u804A\u5929\u6216\u5D4C\u5165\u6A21\u578B\u5F8C\uFF0C\u7CFB\u7D71\u6703\u4F7F\u7528\u76EE\u524D\u4E3B\u6A5F\u7684\u5C0D\u61C9\u6A21\u578B\u57F7\u884C AI \u51FA\u984C\u8207 RAG\uFF1B\u672A\u8A2D\u5B9A\u6642\u6CBF\u7528 .env \u7684 LLM_MODEL\uFF0FEMBEDDING_MODEL\u3002</p>
    </div>
  </div>`}function qg(e,t,s,a=!1){let n=e?.data||{},i=e?Wt(e.status):null,o=s?Wt(s.status):null,l={overview:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(i.label)}</span>`:"",resources:o?`<span class="badge ${o.tone==="ok"?"badge-ok":o.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(o.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${c(n.version_count)}</span>`,tests:'<span class="badge badge-neutral badge-mono">TEST</span>',"local-model":'<span class="badge badge-neutral badge-mono">LLAMA-SERVER</span>',runs:`<span class="badge badge-neutral badge-mono">${c(n.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${oc.map(d=>{let m=d.id===t,f=a&&ic.has(d.id);return`<button class="status-tab${m?" is-active":""}${f?" is-demo-locked":""}" type="button"
          data-status-tab="${d.id}" ${m?'aria-current="page"':""} ${f?'data-demo-lock-tooltip="\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B\u6B64\u7BA1\u7406\u529F\u80FD"':""}>
          <span class="status-tab-icon">${p(d.icon,15)}</span>
          <span class="status-tab-copy">
            <strong>${r(d.label)}</strong>
            <small>${r(d.hint)}</small>
          </span>
          ${f?'<span class="badge badge-neutral badge-mono">LOCK</span>':l[d.id]||""}
        </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u6AA2\u67E5\u6642\u9593</span>
      <span class="mono">${r(e?$e(e.checked_at):"\u2014")}</span>
    </div>`}function Mg(e,t,s,a,n,i,o,l=!1){if(e==="resources")return s?_g(s):a?ac():n?kg(n):ac();if(e==="local-model"){let d=i||{},m=!!d.loading||!d.hosts&&!d.error;return Ag(d.hosts||null,m,d.error||null,d.editingId||null)}return e==="architecture"?gg(t,l):e==="api"?fg(t):e==="data"?bg(t,o):e==="runs"?hg(t):mg(t)}function Lg(){return`<div class="status-hero">
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
    </div>`}function nc(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u5FEB\u53D6\u6216\u63A8\u6E2C\u7684\u670D\u52D9\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Ge({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${p("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function jg(e,t){let s=Kt(),a=!1,n=null,i=null,o="overview",l=null,d=!1,m=null,f=null,y=!1,v=null,u=null,b=null,w=!1,k=null,A=!1,S=!1,$=null,T=0,K="",G="",fe=performance.now(),ye=new Date().toISOString(),ie=!1;e.innerHTML=`<section class="page status-page">
    <div class="page-header">
      <div>
        <div class="eyebrow">OBSERVABILITY</div>
        <h1 class="page-title">\u7CFB\u7D71\u67B6\u69CB\u8207\u670D\u52D9\u72C0\u614B</h1>
        <p class="page-subtitle">\u6AA2\u8996\u524D\u7AEF\u3001FastAPI\u3001PostgreSQL\u3001Parquet \u8207 AI \u5143\u4EF6\u7684\u5373\u6642\u5065\u5EB7\u72C0\u614B\uFF0C
          \u4E26\u5F9E\u5DE6\u5074\u5206\u985E\u5207\u63DB\u670D\u52D9\u7E3D\u89BD\u3001\u7CFB\u7D71\u6E2C\u8A66\u3001Model Provider\u3001\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528\u3001\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u4E0B\u8F09\u7D00\u9304\u3002</p>
      </div>
      <div class="page-actions">
        ${s?'<span class="badge badge-neutral badge-mono">\u5C55\u793A\u6A21\u5F0F \xB7 \u552F\u8B80</span>':`<label class="auto-refresh">
          <input type="checkbox" id="auto-refresh" />
          \u81EA\u52D5\u66F4\u65B0 30s\uFF08\u63A8\u9001\uFF09
        </label>`}
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
          ${Array.from({length:8}).map(()=>'<div class="skeleton skeleton-line" style="width:100%;height:52px;margin-top:8px"></div>').join("")}
        </div>
      </aside>
      <section class="status-panel" id="status-content">${Lg()}</section>
    </div>
  </section>`;let L=e.querySelector("#status-nav"),q=e.querySelector("#status-content"),j=e.querySelector("#refresh-status"),V=e.querySelector("#auto-refresh"),de=()=>{if(T+=1,typeof $=="function")try{$()}catch{}$=null,A=!1,S=!1},z=async()=>{let he=++T;S=!0,G="",q.innerHTML="";try{let oe=await $i(q,{setTitle:()=>{}},{embedded:!0});if(he!==T||o!=="tests"){typeof oe=="function"&&oe();return}$=typeof oe=="function"?oe:null,A=!0}catch(oe){he===T&&o==="tests"&&(q.innerHTML=nc(oe))}finally{he===T&&(S=!1)}},Z=()=>{if(!i)return;let he=qg(i,o,l,s);if(he!==K&&(L.innerHTML=he,K=he),s&&ic.has(o)){de();let ce=Cs("\u6B64\u5206\u985E\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u670D\u52D9\u7E3D\u89BD\u3001\u524D\u5F8C\u7AEF\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u4E0B\u8F09\uFF1B\u7CFB\u7D71\u6E2C\u8A66\u3001\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528\u3001Model Provider \u8207 OpenAPI \u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002");q.innerHTML!==ce&&(q.innerHTML=ce),G=ce;return}if(o==="tests"){!A&&!S&&z();return}de();let oe=Mg(o,i,l,d,m,{hosts:f,loading:y,error:v,editingId:u},{info:b,loading:w,error:k},s);oe!==G&&(q.innerHTML=oe,G=oe)},qe=async({quiet:he=!1}={})=>{if(!d){d=!0,m=null,o==="resources"&&!l&&Z();try{let oe=await Q.systemUsage();if(a)return;l=oe}catch(oe){if(a)return;m=oe,he||R(oe.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{a||(d=!1,o==="resources"&&Z())}}},F=async({quiet:he=!1}={})=>{if(!w){w=!0,k=null,o==="data"&&!b&&Z();try{let oe=await po();if(a)return;b=oe}catch(oe){if(a)return;k=oe,he||R(oe.message||"\u7121\u6CD5\u8B80\u53D6 IndexedDB\u3002","danger")}finally{a||(w=!1,o==="data"&&Z())}}},ke=async({quiet:he=!1}={})=>{if(!y){y=!0,v=null,o==="local-model"&&!f&&Z();try{let oe=await Q.ollamaHosts();if(a)return;f=oe}catch(oe){if(a)return;v=oe,he||R(oe.message||"\u7121\u6CD5\u53D6\u5F97 llama-server \u4E3B\u6A5F\u3002","danger")}finally{a||(y=!1,o==="local-model"&&Z())}}},ne=async()=>{await ke({quiet:!0}),await Se({quiet:!0})},Se=async({quiet:he=!1,status:oe=null}={})=>{he||(j.disabled=!0,Re(j,!0,"\u6AA2\u67E5\u4E2D\u2026"));let ce=performance.now(),ve=new Date().toISOString(),je=ce,Te=ve;try{let C=oe||await Q.status();if(je=performance.now(),Te=new Date().toISOString(),a)return;let D=!oe&&!ie?Math.max(0,ce-fe):0;C.page_pipeline=C.pipeline||!i?.page_pipeline?ug(C,{initMs:D,initStartedAt:ye,requestStartedAt:ve,requestFinishedAt:Te,requestMs:je-ce}):i.page_pipeline,ie=!0,i=C,os(tc,C),Z(),he||R("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(C){if(a)return;o!=="tests"&&(G="",q.innerHTML=nc(C)),he||R(C.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{a||(j.disabled=!1,Re(j,!1))}},Pe=async({quiet:he=!1,status:oe=null}={})=>{if(await Se({quiet:he,status:oe}),!s&&(o==="resources"&&await qe({quiet:he}),o==="local-model"&&await ke({quiet:he}),!he&&o==="tests")){let ce=q.querySelector("#tests-refresh");ce&&ce.click()}};L.addEventListener("click",he=>{let oe=he.target.closest("[data-status-tab]");if(!oe)return;let ce=oe.dataset.statusTab;oc.some(ve=>ve.id===ce)&&(o=ce,Z(),!s&&(o==="resources"&&!l&&!d&&qe(),o==="data"&&!b&&!w&&F(),o==="local-model"&&ke()))}),q.addEventListener("click",he=>{he.target.closest("#status-retry")&&Se(),he.target.closest("#status-resources-retry")&&qe()}),q.addEventListener("click",async he=>{let oe=he.target.closest("[data-ollama-action]");if(!oe)return;let ce=oe.dataset.ollamaAction,ve=Number(oe.dataset.id||0);if(ce==="refresh-hosts"){await ke();return}if(ce==="edit-host"){u=ve,Z(),e.querySelector(".ollama-host-form")?.scrollIntoView({behavior:"smooth",block:"center"});return}if(ce==="cancel-host-edit"){u=null,Z();return}if(ce==="delete-host"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 llama-server \u4E3B\u6A5F #${ve}\uFF1F`))return;try{await Q.deleteOllamaHost(ve),Number(u)===ve&&(u=null),R("llama-server \u4E3B\u6A5F\u5DF2\u522A\u9664\u3002","info"),await ne()}catch(je){R(je.message||"\u522A\u9664\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(ce==="activate-host"){try{await Q.activateOllamaHost(ve),R("\u5DF2\u5207\u63DB\u4F7F\u7528\u7684 llama-server \u4E3B\u6A5F\u3002","ok"),await ne()}catch(je){R(je.message||"\u5207\u63DB\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(ce==="deactivate-host"){try{await Q.deactivateOllamaHosts(),R("\u5DF2\u505C\u7528\u6307\u5B9A\u7684 llama-server \u4E3B\u6A5F\uFF0C\u5C07\u6CBF\u7528 .env \u8A2D\u5B9A\u3002","info"),await ne()}catch(je){R(je.message||"\u505C\u7528\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(ce==="check-capabilities"){Re(oe,!0,"\u6AA2\u67E5\u4E2D\u2026");try{await Q.checkOllamaCapabilities(),R("\u5DF2\u66F4\u65B0\u6240\u6709\u4E3B\u6A5F\u7684\u6A21\u578B\u80FD\u529B\u3002","ok",4e3),await ne()}catch(je){R(je.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u80FD\u529B\u3002","danger",7e3)}finally{Re(oe,!1)}return}if(ce==="select-model"||ce==="clear-model"){let je=String(oe.dataset.model||""),Te=String(oe.dataset.role||"");try{ce==="select-model"?(await Q.selectOllamaModel(ve,{model:je,role:Te}),R(`\u5DF2\u8A2D\u5B9A ${Te==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\uFF1A${je}`,"ok")):(await Q.clearOllamaModel(ve,{model:je,role:Te}),R(`\u5DF2\u53D6\u6D88 ${Te==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\u3002`,"info")),await ne()}catch(C){R(C.message||"\u6A21\u578B\u8A2D\u5B9A\u5931\u6557\u3002","danger")}}}),q.addEventListener("submit",async he=>{let oe=he.target.closest("form[data-ollama-form='host']");if(!oe)return;he.preventDefault();let ce=new FormData(oe),ve=Number(ce.get("host_id")||0),je={name:String(ce.get("name")||"").trim(),url:String(ce.get("url")||"").trim(),port:Number(ce.get("port")||11434)};try{ve?(await Q.updateOllamaHost(ve,je),R("llama-server \u4E3B\u6A5F\u5DF2\u66F4\u65B0\u3002","ok")):(await Q.addOllamaHost(je),R("llama-server \u4E3B\u6A5F\u5DF2\u65B0\u589E\u3002","ok")),u=null,await ne()}catch(Te){let C=Te.detail||Te.payload?.detail,D=C?.errors?.join(" \xB7 ")||C?.message||Te.message||"\u5132\u5B58\u4E3B\u6A5F\u5931\u6557\u3002";R(D,"danger",8e3)}}),q.addEventListener("toggle",he=>{let oe=he.target.closest?.(".status-wf-stage[data-status-wf-stage]");if(!oe||!q.contains(oe))return;let ce=oe.dataset.statusWfStage||"";ce&&(oe.open?yi.add(ce):yi.delete(ce))},!0),j.addEventListener("click",()=>Pe());let Le=()=>{n&&(n(),n=null)};V&&V.addEventListener("change",()=>{Le(),V.checked&&(n=Mt("status",(he,oe)=>{a||Pe({quiet:!0,status:oe?.snapshot||null})}),Pe({quiet:!0}),R("\u5DF2\u555F\u7528\u5F8C\u7AEF\u63A8\u9001\u81EA\u52D5\u66F4\u65B0\uFF08\u6BCF 30 \u79D2\uFF09\u3002","info",2200))});let Ze=ms(tc,120*1e3);return Ze?(i=Ze,ie=!0,Z(),Se({quiet:!0})):await Se({quiet:!0}),F({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{a=!0,de(),Le()}}var dc="home",On={home:{page:Tr,title:"Judgment RAG Console \xB7 \u6CD5\u898F\u8207\u5224\u6C7A\u6AA2\u7D22"},rag:{page:si,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:Hr,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:vi,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:Wr,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:mi,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:wi,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:In,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"},admin:{page:_r,title:"\u7BA1\u7406\u8A2D\u5B9A \xB7 Judgment RAG Console"}},zs=document.getElementById("app-main"),Bn=null,Fn=0;function Ca(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||dc;return Object.prototype.hasOwnProperty.call(On,t)?t:dc}function Tg(){try{let e=new URLSearchParams(window.location.search);if(!(!!e.get("q")?.trim()||!!e.get("share")?.trim())||Ca()==="rag")return;window.history.replaceState(null,"",`${window.location.pathname}${window.location.search}#/rag`)}catch{}}function Eg(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function Ng(e){return`<section class="page">
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
            <p>${r(e.message||"\u672A\u77E5\u932F\u8AA4")}</p>
          </div>
        </div>
        <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
          <button class="btn btn-secondary btn-sm" type="button" id="route-retry">
            ${p("refresh",14)}<span>\u91CD\u65B0\u8F09\u5165</span>
          </button>
        </div>
      </div>
    </div>
  </section>`}async function Us(){let e=Ca(),t=++Fn;Eg(e);let s=`#/${e}`,a=window.location.hash;if(a!==s&&!a.startsWith(`${s}/`)&&window.history.replaceState(null,"",s),typeof Bn=="function"){try{Bn()}catch{}Bn=null}if(Rs(),!ta()){if(e==="admin"){document.title="\u7BA1\u7406\u8A2D\u5B9A \xB7 Judgment RAG Console",zs.innerHTML=cn();return}if(e==="tests"){document.title="\u5C55\u793A\u6A21\u5F0F \xB7 Judgment RAG Console",wr(zs,e);return}if(!Xi()){document.title="\u5C55\u793A\u76EE\u524D\u672A\u958B\u653E \xB7 Judgment RAG Console",Zi(zs);return}if(!yr(e)){document.title="\u5C55\u793A\u6A21\u5F0F \xB7 Judgment RAG Console",wr(zs,e);return}}document.title=On[e].title;let n={route:e,navigate(i){On[i]&&(window.location.hash=`#/${i}`)},setTitle(i){t===Fn&&i&&(document.title=i)}};try{let i=On[e].page.render(zs,n);Ui(),window.scrollTo({top:0,behavior:"auto"}),zs.focus({preventScroll:!0});let o=await i;if(t!==Fn){typeof o=="function"&&o();return}Bn=typeof o=="function"?o:null}catch(i){if(t!==Fn)return;console.error("Failed to render route",e,i),zs.innerHTML=Ng(i);let o=document.getElementById("route-retry");o&&o.addEventListener("click",()=>Us()),R("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function Rg(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable))return;let a=Ca(),n=a==="home"?"home-question":a==="rag"?"rag-question":"";if(!n)return;let i=document.getElementById(n);i&&(e.preventDefault(),i.focus())})}function Cg(){let e=document.querySelector('[data-route="processing"]');if(!e)return;let t=e.querySelector(".nav-update-badge");t||(t=document.createElement("span"),t.className="nav-update-badge",t.hidden=!0,e.appendChild(t));let s=0,a=0,n=0,i=()=>{let l=[];if(s>0&&l.push(`\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0F\u5224\u6C7A\u6709 ${s} \u9805\u4F86\u6E90\u66F4\u65B0`),a>0&&l.push(`\u5224\u6C7A\u532F\u5165\u5F85\u8655\u7406 ${a} \u500B\u6708`),n>0&&l.push(`Qdrant \u5411\u91CF\u7D22\u5F15\u5F85\u88DC ${n} \u500B\u6708`),!l.length){t.hidden=!0;return}let d=(s>0?1:0)+(a>0?1:0)+(n>0?1:0);t.textContent=String(d===1?s||a||n:d),t.title=l.join("\uFF1B"),t.hidden=!1},o=async(l=null)=>{try{let d=l||await Q.updatesStatus();s=Number(d.update_count)||0,d&&Object.prototype.hasOwnProperty.call(d,"import_pending_count")&&(a=Number(d.import_pending_count)||0),d&&Object.prototype.hasOwnProperty.call(d,"index_pending_count")&&(n=Number(d.index_pending_count)||0),i()}catch{t.hidden=!0}};o(),Mt("updates",(l,d)=>o(d?.snapshot||null)),window.addEventListener("judgment:processing-pending",l=>{a=Number(l.detail?.count)||0,l.detail&&Object.prototype.hasOwnProperty.call(l.detail,"index_pending")&&(n=Number(l.detail.index_pending)||0),i()}),window.addEventListener("judgment:updates-changed",()=>o())}function Pg(e,t){return!e||!t?!0:!!e.admin!=!!t.admin||!!e.enabled!=!!t.enabled||String(e.expiresAt||"")!==String(t.expiresAt||"")||JSON.stringify(e.features||{})!==JSON.stringify(t.features||{})}async function uc(){Tg();let e=Ca();e==="processing"?Q.processing({cached:!0,slim:!0}).catch(()=>null):e==="quality"&&Q.quality({cached:!0}).catch(()=>null);let t=Ki();t&&Yi(t);let s=ln();nn(),Ja(),Qi(),Rg();let a=!1,n=()=>{ta()&&!a&&(Cg(),a=!0)};window.addEventListener("hashchange",Us),window.addEventListener("judgment:auth-changed",async()=>{let o=await ln();Ka(o.me),n(),Rs(),Us()}),window.addEventListener("judgment:demo-denied",async()=>{let o=await ln();Ka(o.me),n(),Rs(),Us()}),t&&(lr({user:t.me}),n(),Rs(),Us());let i=await s;t?(Ka(i.me),n(),Rs(),Pg(t,i)&&Us()):(lr({user:i.me}),n(),Rs(),Us()),za()&&window.setTimeout(()=>{let o=Ca();(o==="rag"||o==="admin")&&(window.location.hash=ta()?"#/tests":"#/home")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",uc):uc();})();
