(()=>{var xc=Object.defineProperty;var gs=(e,t)=>{for(var s in t)xc(e,s,{get:t[s],enumerable:!0})};var Xn="judgment.api_base",Ns="judgment.admin_token",er="http://127.0.0.1:9200",Tt=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function Li(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function fs(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${Li(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function tr(e){let t=fs(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function sr(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?fs(e.get("api")):null}catch{return null}}function ar(){try{let e=window.localStorage.getItem(Xn);return e===null?null:fs(e)}catch{return null}}function nr(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return fs(e||"")}function is(){let e=sr();if(e!==null)return e;let t=ar();if(t!==null)return t;let s=nr();return s||(window.location.protocol==="file:"?er:"")}function Ac(){if(sr()!==null)return!0;let e=ar();return e!==null?!!e:!!nr()}function Kt(){return sr()!==null?"query":ar()!==null?"storage":nr()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function Ga(){return Ac()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!Li(window.location.hostname)}function rr(e){let t=fs(e);try{t?window.localStorage.setItem(Xn,t):window.localStorage.removeItem(Xn)}catch{}return t}function Qa(){try{let e=String(window.sessionStorage.getItem(Ns)||"").trim();if(e)return e;let t=String(window.localStorage.getItem(Ns)||"").trim();return t?(window.sessionStorage.setItem(Ns,t),window.localStorage.removeItem(Ns),t):""}catch{return""}}function Wa(e){let t=String(e||"").trim();try{t?window.sessionStorage.setItem(Ns,t):window.sessionStorage.removeItem(Ns),window.localStorage.removeItem(Ns)}catch{}return t}function Zn(){return Kt()==="query"?"":Qa()}function Ss(e=is()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function St(e,t=is()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function Yn(){return Kt()==="query"?"":is()}async function qc(){let e=Zn(),t={Accept:"application/json"};e&&(t["X-Judgment-Admin-Token"]=e);try{let s=await fetch(St("/api/auth/sse-ticket"),{method:"POST",headers:t,credentials:"include"});if(!s.ok)return"";let a=await s.json();return String(a.ticket||"")}catch{return""}}function Et(e,t,{onError:s=null,onProgress:a=null}={}){if(document.body.classList.contains("is-demo-visitor"))return()=>{};let n=(Array.isArray(e)?e:[e]).map(v=>String(v||"").trim()).filter(Boolean);if(!n.length||typeof EventSource>"u")return()=>{};let i=null,o=0,l=!1,d=null,u=v=>{let p={};try{p=JSON.parse(v.data||"{}")}catch{p={}}p.initial&&o<=1&&!p.snapshot||t?.(p.topic||n[0],p)},h=v=>{let p={};try{p=JSON.parse(v.data||"{}")}catch{p={}}a?.(p.topic||n[0],p)},y=async()=>{if(l)return;let v=await qc();if(l)return;let p=new URLSearchParams({topic:n.join(",")});v&&p.set("ticket",v),i=new EventSource(St(`/api/events/stream?${p.toString()}`),{withCredentials:!0}),i.onopen=()=>{o+=1,d&&(window.clearTimeout(d),d=null)},i.addEventListener("refresh",u),i.addEventListener("progress",h),i.onerror=()=>{s?.(),!(l||!i)&&(i.close(),i=null,!d&&(d=window.setTimeout(()=>{d=null,y()},3e3)))}};return y(),()=>{l=!0,d&&(window.clearTimeout(d),d=null),i&&(i.removeEventListener("refresh",u),i.removeEventListener("progress",h),i.close(),i=null)}}var za=new Map,Ua=new Map;function Mc({cached:e=!1}={}){let t=e?"/api/quality?cached=1":"/api/quality",s=Ua.get(t);if(s)return s;let a=te(t,{timeout:18e4,trackClient:!1});Ua.set(t,a);let n=()=>window.setTimeout(()=>{Ua.get(t)===a&&Ua.delete(t)},1500);return a.then(n,n),a}function Lc({cached:e=!1,slim:t=!1}={}){let s=new URLSearchParams;e&&s.set("cached","1"),t&&s.set("slim","1");let a=s.toString(),n=`/api/processing${a?`?${a}`:""}`,i=za.get(n);if(i)return i;let o=te(n,{timeout:45e3,trackClient:!1});za.set(n,o);let l=()=>window.setTimeout(()=>{za.get(n)===o&&za.delete(n)},1500);return o.then(l,l),o}function ir(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function te(e,t={}){let{base:s,...a}=t,n=s!==void 0?fs(s):is(),i=new AbortController,o=t.timeout===void 0?3e4:t.timeout,l=o>0?window.setTimeout(()=>i.abort(),o):null,d=Date.now(),u=performance.now(),h=t.requestId||ji(),y={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":h,"X-Judgment-Client-Started-At":String(d),...Zn()?{"X-Judgment-Admin-Token":Zn()}:{},...t.headers||{}},v;try{v=await fetch(St(e,n),{...a,headers:y,credentials:"include",signal:i.signal})}catch(k){throw k.name==="AbortError"?new Tt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new Tt(ir(n),0,k)}finally{l&&window.clearTimeout(l)}let p=null;if((v.headers.get("content-type")||"").includes("application/json"))try{p=await v.json()}catch{p=null}else try{p=await v.text()}catch{p=null}let w=performance.now(),M=v.headers.get("X-Judgment-Request-Id")||h;if(t.trackClient!==!1&&M){let k=Math.round(performance.now()-u);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{Ti({request_id:M,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:k,render_ms:Math.max(0,Math.round(performance.now()-w)),status:v.ok?"success":"failed"})})})}if(!v.ok){v.status===403&&p&&typeof p=="object"&&["demo_closed","demo_hard_disabled"].includes(p.code)&&window.dispatchEvent(new CustomEvent("judgment:demo-denied",{detail:p}));let k=p&&typeof p=="object"?p.detail||p.message:p,S=typeof k=="string"&&k?k:`\u4F3A\u670D\u5668\u56DE\u61C9 ${v.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new Tt(S,v.status,k)}return p}function ji(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function Ti(e){if(!document.body.classList.contains("is-demo-visitor"))try{fetch(St("/api/performance/client",is()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),credentials:"include",keepalive:!0}).catch(()=>{})}catch{}}async function Ei(e){let t=fs(e);if(!tr(t))throw new Tt("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,n=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(St("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new Tt(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof Tt?i:i.name==="AbortError"?new Tt("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new Tt(ir(t),0,i)}finally{window.clearTimeout(n)}}var G={health(){return te("/api/health")},authMe(){return te("/api/auth/me",{base:Yn(),trackClient:!1})},authLogout(){return te("/api/auth/logout",{method:"POST",base:Yn(),trackClient:!1})},authLogoutAll(){return te("/api/auth/logout-all",{method:"POST",base:Yn(),trackClient:!1})},demoStatus(){return te("/api/demo/status",{timeout:15e3,trackClient:!1})},adminDemo(){return te("/api/admin/demo",{timeout:15e3,trackClient:!1})},updateDemo(e){return te("/api/admin/demo",{method:"PUT",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},adminSecurityAudit(e=20){return te(`/api/admin/security-audit?limit=${encodeURIComponent(e)}`,{timeout:15e3,trackClient:!1})},closeDemo(){return te("/api/admin/demo/close",{method:"POST",body:JSON.stringify({}),timeout:3e4,trackClient:!1})},demoAudit(e=20){let t=new URLSearchParams({limit:String(e)});return te(`/api/admin/demo/audit?${t.toString()}`,{timeout:15e3,trackClient:!1})},status(){return te("/api/status",{trackClient:!1})},ollamaHosts(){return te("/api/llama-server/hosts",{timeout:3e4,trackClient:!1})},addOllamaHost(e){return te("/api/llama-server/hosts",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},updateOllamaHost(e,t){return te(`/api/llama-server/hosts/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},deleteOllamaHost(e){return te(`/api/llama-server/hosts/${encodeURIComponent(e)}`,{method:"DELETE",timeout:3e4,trackClient:!1})},activateOllamaHost(e){return te(`/api/llama-server/hosts/${encodeURIComponent(e)}/activate`,{method:"POST",timeout:3e4,trackClient:!1})},deactivateOllamaHosts(){return te("/api/llama-server/hosts/deactivate",{method:"POST",timeout:3e4,trackClient:!1})},reorderOllamaHosts(e){return te("/api/llama-server/hosts/reorder",{method:"POST",body:JSON.stringify({host_ids:e}),timeout:3e4,trackClient:!1})},checkOllamaCapabilities(){return te("/api/llama-server/hosts/capabilities/test",{method:"POST",timeout:18e4,trackClient:!1})},selectOllamaModel(e,t){return te(`/api/llama-server/hosts/${encodeURIComponent(e)}/models/select`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},clearOllamaModel(e,t){return te(`/api/llama-server/hosts/${encodeURIComponent(e)}/models/clear`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},systemUsage(){return te("/api/system-usage",{trackClient:!1})},indexVersions(){return te("/api/index-versions",{trackClient:!1})},indexVersion(e){return te(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return te(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return te(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return te("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){return te("/api/index-alias/reconcile",{method:"POST",body:JSON.stringify({repair:!!e}),trackClient:!1})},catalog(){return te("/api/catalog")},homeSummary(){return te("/api/home")},judgmentStats(){return te("/api/judgment-stats")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return te("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},dataSuggest({kind:e,query:t="",limit:s=12}){let a=new URLSearchParams({kind:e,query:t,limit:String(s)});return te(`/api/data/suggest?${a.toString()}`,{timeout:45e3,trackClient:!1})},schemaSuggest({database:e,table:t,column:s,query:a,limit:n=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(n)});return te(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let n=new URLSearchParams({law_key:e});return t&&n.set("source_type",t),s&&n.set("version_id",String(s)),a&&n.set("article_no",String(a)),te(`/api/law?${n.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),te(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return te("/api/test-mode",{trackClient:!1})},llmModels(){return te("/api/llm/models",{timeout:6e4,trackClient:!1})},testLlmModels(){return te("/api/llm/models/test",{method:"POST",timeout:12e4,trackClient:!1})},rerankStatus(){return te("/api/rerank/status",{timeout:6e4,trackClient:!1})},testReranker(){return te("/api/rerank/test",{method:"POST",timeout:12e4,trackClient:!1})},selectLlmModel(e,t=null){return te("/api/llm/model",{method:"POST",body:JSON.stringify({model:e,host_id:t}),timeout:3e4,trackClient:!1})},setTestMode(e){return te("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return te(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return te("/api/test-runs/current",{trackClient:!1})},testRun(e){return te(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return te("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))i==null||i===""||a.set(n,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),te(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality({cached:e=!1}={}){return Mc({cached:e})},demoQuality(){return te("/api/demo/quality",{timeout:2e4,trackClient:!1})},processing({cached:e=!1,slim:t=!1}={}){return Lc({cached:e,slim:t})},demoProcessing(){return te("/api/demo/processing",{timeout:2e4,trackClient:!1})},processingActive(){return te("/api/processing/active",{timeout:3e3,trackClient:!1})},judgmentDownloadStatus(){return te("/api/judgment-download/status",{timeout:3e4,trackClient:!1})},versioningSummary(){return te("/api/versioning/summary",{trackClient:!1})},updatesStatus(){return te("/api/updates/status",{trackClient:!1})},checkCourts(){return te("/api/courts/check",{timeout:6e4,trackClient:!1})},checkLawVersions(){return te("/api/law-versions/check",{timeout:6e4,trackClient:!1})},checkUpdates(e=[]){let t=Array.isArray(e)&&e.length?{source_types:e}:{};return te("/api/updates/check",{method:"POST",body:JSON.stringify(t),timeout:12e4,trackClient:!1})},versioningSnapshots(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.limit&&t.set("limit",String(e.limit)),te(`/api/versioning/judgments/snapshots?${t.toString()}`,{trackClient:!1})},versioningChanges(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit)),te(`/api/versioning/judgments/changes?${t.toString()}`,{trackClient:!1})},versioningJudgment(e){return te(`/api/versioning/judgments/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVersion(e){return te(`/api/versioning/judgments/versions/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVector(e,t){return te(`/api/versioning/judgments/${encodeURIComponent(e)}/vectors/${encodeURIComponent(t)}`,{trackClient:!1})},versioningAudit(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit||500)),te(`/api/versioning/audit?${t.toString()}`,{trackClient:!1})},questionBankStats(){return te("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))if(!(i==null||i==="")){if(Array.isArray(i)){for(let o of i)o==null||o===""||a.append(n,String(o));continue}a.set(n,String(i))}return a.set("limit",String(t)),a.set("offset",String(s)),te(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankTags(e="",t=12){let s=new URLSearchParams({query:e,limit:String(t)});return te(`/api/question-bank/tags?${s.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return te(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return te("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},createQuestionBankItemWithAI(e){return te("/api/question-bank/ai-items",{method:"POST",body:JSON.stringify(e),timeout:42e4,trackClient:!1})},updateQuestionBankItem(e,t){return te(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return te(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},restoreQuestionBankItem(e){return te(`/api/question-bank/items/${encodeURIComponent(e)}/restore`,{method:"POST",timeout:45e3,trackClient:!1})},submitQuestionBankItemForReview(e){return te(`/api/question-bank/items/${encodeURIComponent(e)}/submit`,{method:"POST",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return te(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return te("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return te(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return te("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return te(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return te("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},benchmarkSuiteLatestAnswers(e){return te(`/api/benchmark/suites/${encodeURIComponent(e)}/latest-answers`,{timeout:45e3,trackClient:!1})},removeBenchmarkSuiteItem(e,t){return te(`/api/benchmark/suites/${encodeURIComponent(e)}/items/${encodeURIComponent(t)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return te("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return te(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return te(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return te(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return te("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return te(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return te(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return te(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return te("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return te(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return te("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return te(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return te("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return te("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return te("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},ragShareCreate(e){return te("/api/rag/share",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},ragShareGet(e){return te(`/api/rag/share/${encodeURIComponent(e)}`,{timeout:3e4,trackClient:!1})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onQueued:n=null,onToken:i=null,onTokenReset:o=null}={}){let l=is(),d=new AbortController,u=t?0:3e5,h=u>0?window.setTimeout(()=>d.abort(),u):null,y=Date.now(),v=performance.now(),p=ji(),b={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":p,"X-Judgment-Client-Started-At":String(y)},w;try{w=await fetch(St("/api/rag/query/stream",l),{method:"POST",headers:b,body:JSON.stringify({question:e}),credentials:"include",signal:d.signal})}catch(Q){throw Q.name==="AbortError"?new Tt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new Tt(ir(l),0,Q)}finally{h&&window.clearTimeout(h)}if(!w.ok){let Q=null;try{Q=await w.json()}catch{Q=null}let fe=Q&&typeof Q=="object"&&Q.detail?String(Q.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${w.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new Tt(fe,w.status,Q)}if(!w.body)throw new Tt("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let M=w.body.getReader(),k=new TextDecoder,S="",f=null,T=null;try{for(;;){let{value:Q,done:fe}=await M.read();if(fe)break;S+=k.decode(Q,{stream:!0});let ve=S.indexOf(`

`);for(;ve>=0;){let se=S.slice(0,ve).replace(/\r/g,"");S=S.slice(ve+2);let L="message",q=[];for(let E of se.split(`
`))E.startsWith("event:")?L=E.slice(6).trim():E.startsWith("data:")&&q.push(E.slice(5).trimStart());if(q.length){let E=null;try{E=JSON.parse(q.join(`
`))}catch{E=null}if(E)if(L==="step"&&typeof s=="function")try{s(E)}catch{}else if(L==="partial"){if(typeof a=="function")try{a(E)}catch{}}else if(L==="queued"){if(typeof n=="function")try{n(E)}catch{}}else if(L==="token"){if(typeof i=="function")try{i(String(E.text||""))}catch{}}else if(L==="token_reset"){if(typeof o=="function")try{o()}catch{}}else L==="result"?f=E:L==="error"&&(T=new Tt(E.message||E.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,E))}ve=S.indexOf(`

`)}}}finally{try{await M.cancel()}catch{}h&&window.clearTimeout(h)}if(T)throw T;if(!f)throw new Tt("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let V=Math.round(performance.now()-v);return Ti({request_id:p,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:V,render_ms:0,status:"success"}),f&&typeof f=="object"&&(f._client_request_id=p),f}};var It="Judgment\uFF5C\u91D1\u878D\u6CD5\u5F8B\u5224\u6C7A RAG AI \u667A\u6167\u5206\u6790\u5E73\u53F0",jc={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Tc={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},Ec={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},Nc={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Ni={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',share:'<path d="M12 16V4"/><path d="m8 8 4-4 4 4"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/><path d="M12 8H7.5a2.5 2.5 0 1 1 0-5H12"/><path d="M12 8h4.5a2.5 2.5 0 1 0 0-5H12"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',palette:'<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10h-4Z"/><circle cx="7.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/><circle cx="10" cy="6.8" r=".8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="6.8" r=".8" fill="currentColor" stroke="none"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',more:'<circle cx="4.2" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="19.8" cy="12" r="2.6" fill="currentColor" stroke="none"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function r(e){return String(e??"").replace(/[&<>"']/g,t=>jc[t])}function Ft(e,t="#"){let s=String(e??"").trim();if(!s)return t;if(s.startsWith("#"))return s;if(s.startsWith("//")||s.startsWith("/\\"))return t;if(s.startsWith("/"))return s;try{let a=new URL(s,window.location.origin);return["http:","https:"].includes(a.protocol)?s:t}catch{return t}}function m(e,t=16,s=""){let a=Ni[e]||Ni.info;return`<svg${s?` class="${r(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function c(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function Pe(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function or(e){if(e instanceof Date)return e;if(typeof e=="number"){let n=new Date(e);return Number.isNaN(n.getTime())?null:n}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function Ut(e){let t=or(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?r(e):"\u2014"}function Se(e){let t=or(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?r(e):"\u2014"}function ga(e){let t=or(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:Ut(t)}function ge(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Yt(e){return Tc[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function at(e,t){let s=Yt(e);return`<span class="badge ${Ec[s.tone]}"><span class="status-dot ${Nc[s.tone]}"></span>${r(t||s.label)}</span>`}function Rc(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${r(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function Ja(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function Ka(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return at(String(e));case"source":return Rc(String(e));case"number":return`<span class="mono">${c(e)}</span>`;case"duration":return`<span class="mono">${ge(e)}</span>`;case"datetime":return`<span class="mono">${Se(e)}</span>`;case"date":return`<span class="mono">${Ut(e)}</span>`;case"url":{let s=String(e),a=Ja(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${r(Ft(s))}" target="_blank" rel="noopener noreferrer" title="${r(s)}">${m("external",10)}${r(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${r(s)}">${r(Ja(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(Ja(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(Ja(s,90))}</span>`}}}function Ge({tone:e="info",title:t,text:s,iconName:a="info"}){let n=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${n==="i"?"i":m(n,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${r(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function xt({iconName:e="search",title:t,text:s="",actions:a="",className:n=""}){return`<div class="empty-state ${n}">
    <span class="empty-icon">${m(e,24)}</span>
    <h3 class="empty-title">${r(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function Re(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${r(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function N(e,t="info",s=4200,a={}){let n=document.getElementById("toast-region");if(!n)return null;let{detail:i="",actionLabel:o="",onAction:l=null}=a&&typeof a=="object"?a:{},d={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},u=document.createElement("div");u.className=`toast toast-${t}`,u.setAttribute("role",t==="danger"?"alert":"status"),u.innerHTML=`<span class="toast-mark" aria-hidden="true">${d[t]||"i"}</span>
    <div class="toast-body">${r(e)}${i?`<span class="toast-detail">${r(i)}</span>`:""}</div>
    ${o?`<button class="toast-action" type="button">${r(o)}</button>`:""}
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let h=()=>{u.isConnected&&(u.classList.add("is-leaving"),window.setTimeout(()=>u.remove(),190))};u.querySelector(".toast-close").addEventListener("click",h);let y=u.querySelector(".toast-action");return y&&typeof l=="function"&&y.addEventListener("click",v=>{v.preventDefault(),l(),h()}),n.appendChild(u),s>0&&window.setTimeout(h,s),u}async function xs(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function Xt(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),n=URL.createObjectURL(a),i=document.createElement("a");i.href=n,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(n),1e3)}function bs(e,t){try{let s=JSON.parse(window.localStorage.getItem(e)||"null");return!s||!Object.prototype.hasOwnProperty.call(s,"value")||Date.now()-Number(s.saved_at||0)>t?null:s.value}catch{return null}}function cs(e,t){try{window.localStorage.setItem(e,JSON.stringify({value:t,saved_at:Date.now()}))}catch{}}function Ya({name:e,label:t,value:s=4}={}){let a=Math.max(1,Math.min(5,Math.round(Number(s)||4)));return`<div class="field qb-score-field" data-score-field>
    <span class="field-label">${r(t||"")}</span>
    <div class="qb-score-cells" role="radiogroup" aria-label="${r(t||"")}\u5206\u6578">
      ${[1,2,3,4,5].map(n=>`<button class="qb-score-cell${n===a?" is-active":""}" type="button" role="radio" aria-checked="${n===a?"true":"false"}" data-score-cell data-score="${n}" aria-label="${r(t||"")} ${n} \u5206">${n}</button>`).join("")}
    </div>
    <input type="hidden" name="${r(e||"")}" value="${a}" data-score-input />
  </div>`}function Va(){Va.installed||(Va.installed=!0,document.addEventListener("click",e=>{let t=e.target.closest?.("[data-score-cell]");if(!t)return;let s=t.closest("[data-score-field]");if(!s)return;let a=Math.max(1,Math.min(5,Math.round(Number(t.dataset.score)||0)));s.querySelectorAll("[data-score-cell]").forEach(i=>{let o=Number(i.dataset.score)===a;i.classList.toggle("is-active",o),i.setAttribute("aria-checked",o?"true":"false")});let n=s.querySelector("[data-score-input]");n&&(n.value=String(a))}))}var Cc=`
  <svg class="auth-google-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z"/>
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.58A10 10 0 0 0 12 22Z"/>
    <path fill="#FBBC05" d="M6.41 13.92A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.92V7.5H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.5l3.35-2.58Z"/>
    <path fill="#EA4335" d="M12 6.04c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.5l3.35 2.58C7.2 7.8 9.4 6.04 12 6.04Z"/>
  </svg>`,Pc={google_not_configured:"Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A GOOGLE_CLIENT_ID \u8207 GOOGLE_CLIENT_SECRET\u3002",state_mismatch:"\u767B\u5165\u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u767B\u5165\u3002",access_denied:"\u4F60\u53D6\u6D88\u4E86 Google \u767B\u5165\u3002",email_unverified:"\u9019\u500B Google \u5E33\u865F\u7684\u96FB\u5B50\u90F5\u4EF6\u5C1A\u672A\u9A57\u8B49\u3002",not_allowed:"\u9019\u500B Google \u5E33\u865F\u6C92\u6709\u7BA1\u7406\u54E1\u6B0A\u9650\u3002",oauth_failed:"Google \u767B\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"},Ot=null;function Ic(){return Kt()==="query"?"":is()}function Dc(){let e=Ic(),t=`${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;return St(`/api/auth/google/start?next=${encodeURIComponent(t)}`,e)}function Ri(e){let t=String(e?.name||"").trim();if(t)return t;let s=String(e?.email||"").trim();return s?s.split("@")[0]:"\u5DF2\u767B\u5165"}function Bc(e){return Ri(e).slice(0,1).toUpperCase()||"A"}function lr(){let e=Ot?.querySelector("#auth-menu"),t=Ot?.querySelector("#auth-user-trigger");e&&(e.hidden=!0),t&&t.setAttribute("aria-expanded","false")}function Ci(e={}){let t=!!e.google_enabled;Ot.innerHTML=`
    <a class="auth-login${t?"":" is-disabled"}"
       id="auth-login"
       href="${r(Dc())}"
       aria-label="\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165"
       title="${t?"\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165":"Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A"}"
       ${t?"":'aria-disabled="true"'}>
      ${Cc}
      <span>\u767B\u5165</span>
    </a>`,t||Ot.querySelector("#auth-login")?.addEventListener("click",a=>{a.preventDefault(),N("Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A GOOGLE_CLIENT_ID \u8207 GOOGLE_CLIENT_SECRET\u3002","warn",5200)})}function Fc(e){let t=Ri(e),s=String(e?.email||""),a=e?.admin?"\u7BA1\u7406\u54E1":"\u4F7F\u7528\u8005";Ot.innerHTML=`
    <div class="auth-user">
      <button type="button"
              class="auth-user-trigger"
              id="auth-user-trigger"
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="\u5DF2\u767B\u5165\uFF1A${r(s||t)}\uFF0C\u958B\u555F\u5E33\u865F\u9078\u55AE"
              title="${r(s||t)}">
        <span class="auth-avatar" aria-hidden="true">${r(Bc(e))}</span>
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
        <button type="button" class="auth-menu-item auth-menu-item-danger" id="auth-logout-all" role="menuitem">
          \u767B\u51FA\u6240\u6709\u88DD\u7F6E
        </button>
      </div>
    </div>`;let n=Ot.querySelector("#auth-user-trigger"),i=Ot.querySelector("#auth-menu");n?.addEventListener("click",o=>{o.stopPropagation();let l=!!i?.hidden;i&&(i.hidden=!l),n.setAttribute("aria-expanded",l?"true":"false")}),Ot.querySelector("#auth-admin-settings")?.addEventListener("click",()=>{lr()}),Ot.querySelector("#auth-logout-all")?.addEventListener("click",async o=>{if(!window.confirm("\u9019\u6703\u8B93\u6240\u6709\u88DD\u7F6E\u4E0A\u7684 Google \u767B\u5165\u7ACB\u5373\u5931\u6548\uFF0C\u5305\u542B\u76EE\u524D\u9019\u53F0\u88DD\u7F6E\u3002\u78BA\u5B9A\u8981\u7E7C\u7E8C\u55CE\uFF1F"))return;let l=o.currentTarget;l.disabled=!0,l.textContent="\u767B\u51FA\u6240\u6709\u88DD\u7F6E\u4E2D\u2026";try{await G.authLogoutAll(),N("\u5DF2\u767B\u51FA\u6240\u6709\u88DD\u7F6E\u3002","ok",3e3),await cr(),window.dispatchEvent(new CustomEvent("judgment:auth-changed"))}catch(d){l.disabled=!1,l.textContent="\u767B\u51FA\u6240\u6709\u88DD\u7F6E",N(d.message||"\u767B\u51FA\u6240\u6709\u88DD\u7F6E\u5931\u6557\u3002","danger",5200)}}),Ot.querySelector("#auth-logout")?.addEventListener("click",async o=>{let l=o.currentTarget;l.disabled=!0,l.textContent="\u767B\u51FA\u4E2D\u2026";try{await G.authLogout(),N("\u5DF2\u767B\u51FA\u3002","ok",2400),await cr(),window.dispatchEvent(new CustomEvent("judgment:auth-changed"))}catch(d){l.disabled=!1,l.textContent="\u767B\u51FA",N(d.message||"\u767B\u51FA\u5931\u6557\u3002","danger",5200)}})}function dr(e){e?.authenticated?Fc(e):Ci(e||{google_enabled:!1})}async function cr(){if(Ot)try{let e=await G.authMe();e?.authenticated&&Wa(""),dr(e)}catch{Ci({google_enabled:!1})}}function Oc(){let e;try{e=new URL(window.location.href)}catch{return}let t=e.searchParams.get("auth"),s=e.searchParams.get("auth_error");!t&&!s||(e.searchParams.delete("auth"),e.searchParams.delete("auth_error"),window.history.replaceState(null,"",`${e.pathname}${e.search}${e.hash}`),t==="ok"?N("\u5DF2\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165\u3002","ok",3600):s&&N(Pc[s]||"Google \u767B\u5165\u5931\u6557\u3002","danger",6e3))}function Xa(e){Ot&&dr(e)}function ur({user:e=null}={}){Ot=document.getElementById("auth-slot"),Ot&&(Oc(),document.addEventListener("click",t=>{t.target.closest(".auth-user")||lr()}),document.addEventListener("keydown",t=>{t.key==="Escape"&&lr()}),e?dr(e):cr())}var Pi="judgment.theme",pr="nvidia",Za=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#0070f3","#171717","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#0066cc","#1d1d1f","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#17171d","#5e6ad2","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#0d99ff","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#0075de","#191918","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],mr=new Map(Za.map(e=>[e.id,e]));function Hc(e){return mr.has(e)}function zc(e){return mr.get(e)||mr.get(pr)}function gr(){try{let e=window.localStorage.getItem(Pi);return Hc(e)?e:pr}catch{return pr}}function fr(e,{persist:t=!0}={}){let s=zc(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");if(a&&a.setAttribute("content",s.metaColor),document.querySelectorAll(".theme-option").forEach(n=>{let i=n.dataset.themeId===s.id;n.classList.toggle("is-active",i),n.setAttribute("aria-checked",i?"true":"false")}),t)try{window.localStorage.setItem(Pi,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}var en="judgment.fontSizes.v1",yr="judgment.appearance",Hi=new Set(["light","dark","system"]),Ii="light",fa=window.matchMedia("(prefers-color-scheme: dark)"),Uc="font-size",ha=[{id:"page-title",label:"\u9801\u9762\u6A19\u984C",hint:"\u5404\u9801\u6700\u4E0A\u65B9\u7684 h1 \u6A19\u984C",selectors:[".page-title"],defaultPx:40,min:20,max:72},{id:"home-title",label:"\u9996\u9801\u4E3B\u8996\u89BA\u6A19\u984C",hint:"\u9996\u9801\u6700\u5927\u7684\u4E3B\u6A19\u984C",selectors:[".home-title"],defaultPx:88,min:40,max:140},{id:"section-title",label:"\u5340\u584A\u6A19\u984C",hint:"\u5831\u8868\u3001\u5361\u7247\u8207\u5340\u584A\u6A19\u984C",selectors:[".section-title",".report-title",".side-card-title",".filter-title",".tests-card-title",".status-sidebar-title",".judgment-dialog-head h2"],defaultPx:16,min:10,max:36},{id:"body",label:"\u5167\u6587\u8207\u8AAA\u660E",hint:"\u6BB5\u843D\u3001\u56DE\u7B54\u3001\u8AAA\u660E\u8207\u6458\u8981\u6587\u5B57",selectors:[".answer-text",".page-subtitle",".report-sub",".home-lead",".empty-text",".notice-body p",".citation-snippet",".side-card-body",".detail-list",".field-help",".report-empty-inline",".processing-section-sub",".summary-value-text",".status-summary",".warnings",".law-dialog-warning"],defaultPx:14,min:8,max:28},{id:"table",label:"\u8868\u683C\u5167\u5BB9",hint:"\u8CC7\u6599\u8868\u683C\u7684\u8868\u982D\u8207\u5132\u5B58\u683C",selectors:[".data-table th",".data-table td"],defaultPx:12,min:8,max:24},{id:"meta",label:"\u6A19\u7C64\u8207\u8F14\u52A9\u6587\u5B57",hint:"badge\u3001chip\u3001\u6B04\u4F4D\u6A19\u7C64\u8207 metadata",selectors:[".badge",".chip",".citation-meta",".citation-index",".answer-section-label",".report-kicker",".report-section-title",".eyebrow",".field-label",".summary-label",".metric-label",".footer-bottom",".nav-update-badge"],defaultPx:10,min:7,max:20},{id:"button",label:"\u6309\u9215\u8207\u5C0E\u89BD",hint:"\u64CD\u4F5C\u6309\u9215\u3001\u9801\u9996\u5C0E\u89BD\u8207\u9023\u7D50",selectors:[".btn",".nav-link",".page-btn",".law-link",".judgment-link",".theme-option-name",".theme-option-desc"],defaultPx:13,min:9,max:24},{id:"form",label:"\u8868\u55AE\u8207\u8F38\u5165",hint:"\u8F38\u5165\u6846\u3001\u4E0B\u62C9\u9078\u55AE\u8207 textarea",selectors:["input","textarea","select",".input",".field-input"],defaultPx:14,min:9,max:28},{id:"mono",label:"\u7A0B\u5F0F\u78BC\u8207\u6578\u503C",hint:"\u7B49\u5BEC\u6587\u5B57\u3001\u67E5\u8A62\u8A9E\u53E5\u8207\u7D71\u8A08\u6578\u503C",selectors:[".mono",".cell-mono",".cell-number",".query-code","code",".metric-value",".summary-value",".perf-stat-value",".mini-stat-value"],defaultPx:13,min:8,max:30},{id:"law-page",label:"\u6CD5\u898F\u689D\u6587\uFF08\u9801\u9762\uFF09",hint:"\u6CD5\u898F\u6AA2\u7D22\u7D50\u679C\u8207\u6CD5\u898F\u4F86\u6E90\u5361\u689D\u6587",selectors:[".law-answer-article-text",".law-answer-article-no",".law-source-article-text",".law-source-article-no",".law-article-text",".law-article-no"],excludeAncestors:[".law-dialog"],defaultPx:12,min:9,max:28},{id:"law-dialog",label:"\u6CD5\u898F\u689D\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u6309\u4E0B\u689D\u6587\u5F8C\u958B\u555F\u7684\u6CD5\u898F dialog",selectors:[".law-dialog .law-article-text",".law-dialog .law-article-no",".law-dialog .law-chapter"],defaultPx:16,min:10,max:32},{id:"judgment-dialog",label:"\u5224\u6C7A\u5168\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u5224\u6C7A\u539F\u6587 dialog \u7684\u5168\u6587\u5340\u584A",selectors:[".judgment-dialog-text"],defaultPx:23,min:12,max:48}],Xs=new Map(ha.map(e=>[e.id,e])),ba=new WeakMap,hs=Qi(),Dt={...hs},vs=Ui(),br=new Set,Ys=null,Ks=null,Nt=null,Rs=null,Di=null,As=Uc,qs=!1,hr=null,vr=!1,tn="";function zi(e,t,s){return Math.min(s,Math.max(t,e))}function wr(e){return Math.round(e*10)/10}function an(e){return Number.isInteger(e)?String(e):e.toFixed(1)}function Ui(){try{let e=window.localStorage.getItem(yr);return Hi.has(e)?e:Ii}catch{return Ii}}function Gc(){return vs==="system"?fa.matches?"dark":"light":vs}function Gi(){document.querySelectorAll("[data-appearance-option]").forEach(e=>{let t=e.dataset.appearanceOption===vs;e.classList.toggle("is-active",t),e.setAttribute("aria-pressed",t?"true":"false")})}function sn({persist:e=!1}={}){if(document.documentElement.dataset.appearance=Gc(),document.documentElement.dataset.appearanceMode=vs,Gi(),e)try{window.localStorage.setItem(yr,vs)}catch{}}function Qc(e){Hi.has(e)&&(vs=e,sn({persist:!0}))}function Bi(){vs==="system"&&sn()}typeof fa.addEventListener=="function"?fa.addEventListener("change",Bi):typeof fa.addListener=="function"&&fa.addListener(Bi);function Qi(){let e=null;try{e=JSON.parse(window.localStorage.getItem(en)||"null")}catch{e=null}if(!e||typeof e!="object"||Array.isArray(e))return{};let t={};for(let s of ha){let a=Number(e[s.id]);Number.isFinite(a)&&(t[s.id]=wr(zi(a,s.min,s.max)))}return t}function Wc(){try{return Object.keys(hs).length?window.localStorage.setItem(en,JSON.stringify(hs)):window.localStorage.removeItem(en),!0}catch{return!1}}function $a(e){let t=new Set;for(let s of e.selectors)document.querySelectorAll(s).forEach(a=>{a.closest(".settings-sidebar")||Array.isArray(e.excludeAncestors)&&e.excludeAncestors.some(n=>a.closest(n))||t.add(a)});return Array.from(t)}function Wi(){if(!tn)return;let e=Xs.get(tn);if(e)for(let t of $a(e))t.classList.add("font-size-highlight")}function Ji(e){if(Zs(),!Xs.get(e))return;tn=e;let s=Nt.querySelector(`.font-size-row[data-font-group="${e}"]`);s&&s.classList.add("is-previewing"),Wi()}function Zs(){tn="",Nt.querySelectorAll(".font-size-row.is-previewing").forEach(e=>e.classList.remove("is-previewing")),document.querySelectorAll(".font-size-highlight").forEach(e=>e.classList.remove("font-size-highlight"))}function Jc(e){if(ba.has(e))return ba.get(e);let t={inline:e.style.fontSize||"",computed:parseFloat(window.getComputedStyle(e).fontSize)||0};return ba.set(e,t),t}function Vc(e){let t=ba.get(e);t&&(t.inline?e.style.fontSize=t.inline:e.style.removeProperty("font-size"))}function Kc(e){let t=Dt[e.id];if(Number.isFinite(t))for(let s of $a(e))Jc(s),s.style.fontSize=`${t}px`}function Yc(e){for(let t of $a(e))Vc(t)}function Ms(){for(let e of br){let t=Xs.get(e);t&&Yc(t)}br=new Set;for(let e of ha)Number.isFinite(Dt[e.id])&&(Kc(e),br.add(e.id));Wi()}function Vi(){Ms(),qs&&As==="font-size"&&va()}function Ki(){vr||(vr=!0,window.requestAnimationFrame(()=>{vr=!1,Ms()}))}function Xc(){hr||!document.body||(hr=new MutationObserver(e=>{if(Object.keys(Dt).length){for(let t of e)if(t.type==="childList"&&(t.addedNodes.length||t.removedNodes.length)){Ki();return}}}),hr.observe(document.body,{childList:!0,subtree:!0}))}function Zc(e){let t=e.filter(s=>typeof s.getClientRects=="function"&&s.getClientRects().length);return t.length?t:e}function ed(){let e=ha.filter(t=>$a(t).length>0||Number.isFinite(Dt[t.id]));return e.length?e:ha}function nn(e){let t=Dt[e.id];if(Number.isFinite(t))return t;let a=Zc($a(e)).map(o=>{let l=ba.get(o);return l&&l.computed?l.computed:parseFloat(window.getComputedStyle(o).fontSize)||0}).filter(o=>o>0).sort((o,l)=>o-l);if(!a.length)return e.defaultPx;let n=Math.floor(a.length/2),i=a.length%2?a[n]:(a[n-1]+a[n])/2;return wr(i)}function td(){let e=[{id:"font-size",label:"\u5B57\u578B\u5927\u5C0F",hint:"\u8ABF\u6574\u5404\u6587\u5B57\u5340\u584A",glyph:'<span class="settings-option-aa" aria-hidden="true">Aa</span>'},{id:"theme",label:"\u4ECB\u9762\u98A8\u683C",hint:"\u5207\u63DB\u54C1\u724C\u8996\u89BA\u8A9E\u8A00",glyph:m("palette",15)}];Rs.innerHTML=e.map(t=>`<button class="settings-option${As===t.id?" is-active":""}" type="button" role="tab"
        data-settings-panel="${t.id}"
        aria-selected="${As===t.id?"true":"false"}">
        <span class="settings-option-icon">${t.glyph}</span>
        <span class="settings-option-copy">
          <strong>${r(t.label)}</strong>
          <small>${r(t.hint)}</small>
        </span>
        ${m("chevronRight",12,"settings-option-chevron")}
      </button>`).join("")}function va(){Zs();let e=ed(),t=e.map(s=>{let a=an(nn(s));return`<section class="font-size-row" data-font-group="${s.id}">
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
    </section>`}).join("");Nt.innerHTML=`<div class="settings-panel-head">
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
    </div>`}function sd(){Zs();let e=gr(),t=Za.map((n,i)=>{let o=n.swatches.map(l=>`<i style="--swatch:${r(l)}"></i>`).join("");return`<button class="theme-option${n.id===e?" is-active":""}" type="button" role="menuitemradio"
      data-theme-id="${r(n.id)}"
      data-theme="${r(n.id)}"
      aria-checked="${n.id===e?"true":"false"}">
      <span class="theme-option-index">${String(i+1).padStart(2,"0")}</span>
      <span class="theme-option-body">
        <span class="theme-option-name">${r(n.name)}</span>
        <span class="theme-option-desc">${r(n.description)}</span>
      </span>
      <span class="theme-option-active-preview" aria-hidden="true">
        ${m("sliders",11)}
        <span>\u4F5C\u7528\u4E2D</span>
        <span class="theme-option-active-preview-badge">2</span>
      </span>
      <span class="theme-option-swatches" aria-hidden="true">${o}</span>
      <span class="theme-option-check" aria-hidden="true">${m("check",14)}</span>
    </button>`}).join(""),a=`<div class="appearance-switch" role="group" aria-label="\u660E\u6697\u6A21\u5F0F">
    ${[{id:"light",label:"\u4EAE"},{id:"dark",label:"\u6697"},{id:"system",label:"\u7CFB\u7D71"}].map(n=>`<button class="appearance-option" type="button"
          data-appearance-option="${n.id}"
          aria-pressed="${vs===n.id?"true":"false"}"
          title="${n.id==="system"?"\u8DDF\u96A8\u7CFB\u7D71\u660E\u6697":`${n.label}\u8272\u6A21\u5F0F`}">${n.label}</button>`).join("")}
  </div>`;Nt.innerHTML=`<div class="settings-panel-head">
      <div>
        <h3>\u4ECB\u9762\u98A8\u683C</h3>
        <p>\u9078\u64C7\u4E3B\u63A7\u53F0\u7684\u54C1\u724C\u8996\u89BA\u8A9E\u8A00\uFF1B\u4E3B\u984C\u6703\u7ACB\u5373\u5957\u7528\u4E26\u4FDD\u7559\u3002</p>
      </div>
      <div class="settings-panel-head-actions">
        <span class="badge badge-info">${Za.length} \u7A2E</span>
        ${a}
      </div>
    </div>
    <div class="settings-theme-list" role="menu" aria-label="\u4ECB\u9762\u98A8\u683C">${t}</div>`,Gi()}function ad(){Rs.querySelectorAll("[data-settings-panel]").forEach(e=>{let t=e.dataset.settingsPanel===As;e.classList.toggle("is-active",t),e.setAttribute("aria-selected",t?"true":"false")})}function _r(e=As){As=e==="theme"?"theme":"font-size",ad(),As==="theme"?sd():va()}function Fi(e,t,s){let a=Number(t);if(!Number.isFinite(a))return;let n=wr(zi(a,e.min,e.max));Dt[e.id]=n;let i=s?.querySelector(".font-size-slider");i&&(i.value=String(n));let o=s?.querySelector(".font-size-preview");o&&(o.style.fontSize=`${n}px`),Ki()}function nd(){Nt.querySelectorAll(".font-size-row").forEach(e=>{let t=Xs.get(e.dataset.fontGroup);if(!t)return;let s=Dt[t.id]??nn(t),a=e.querySelector(".font-size-number-input");a&&(a.value=an(s));let n=e.querySelector(".font-size-slider");n&&(n.value=String(s));let i=e.querySelector(".font-size-preview");i&&(i.style.fontSize=`${s}px`)})}function Oi(e){let t=e.target.closest(".font-size-row");if(!t)return;let s=Xs.get(t.dataset.fontGroup);if(!s)return;let a=e.target.classList.contains("font-size-number-input");if(!(a&&e.target.value==="")){if(e.type==="input"&&a){let n=Number(e.target.value);if(!Number.isFinite(n))return;Fi(s,n,t);return}if(Fi(s,e.target.value,t),e.type==="input"){let n=t.querySelector(".font-size-number-input");n&&document.activeElement!==n&&(n.value=an(Dt[s.id]??nn(s)))}}}function rd(e){if(!e.target.classList.contains("font-size-number-input"))return;let t=e.target.closest(".font-size-row"),s=t?Xs.get(t.dataset.fontGroup):null;if(!s)return;let a=Dt[s.id]??nn(s);e.target.value=an(a)}function id(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Ji(t.dataset.fontGroup)}function od(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Zs()}function ld(e){let t=e.target.closest(".font-size-row");t&&Ji(t.dataset.fontGroup)}function cd(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Zs()}function dd(e){let t=e.target.closest("[data-settings-panel]");if(t){_r(t.dataset.settingsPanel);return}let s=e.target.closest("[data-settings-action]");if(s){let i=s.dataset.settingsAction;if(i==="save"){hs={...Dt};let o=Wc();nd(),N(o?"\u5B57\u578B\u5927\u5C0F\u5DF2\u5132\u5B58\u3002":"\u5B57\u578B\u5927\u5C0F\u5DF2\u5957\u7528\uFF0C\u4F46\u700F\u89BD\u5668\u7121\u6CD5\u5132\u5B58\u8A2D\u5B9A\u3002",o?"ok":"warn");return}if(i==="cancel"){Dt={...hs},Ms(),va(),N("\u5DF2\u53D6\u6D88\u672A\u5132\u5B58\u7684\u5B57\u578B\u8B8A\u66F4\u3002","info");return}i==="reset"&&(Dt={},Ms(),va(),N("\u5DF2\u56DE\u5FA9\u9810\u8A2D\u5B57\u578B\uFF1B\u6309\u300C\u5132\u5B58\u300D\u4FDD\u7559\u8B8A\u66F4\u3002","info"));return}let a=e.target.closest("[data-appearance-option]");if(a){Qc(a.dataset.appearanceOption);return}let n=e.target.closest(".theme-option");n&&fr(n.dataset.themeId)}function ud(){qs||(qs=!0,Dt={...hs},document.body.classList.add("settings-open"),Ys.removeAttribute("inert"),Ys.setAttribute("aria-hidden","false"),Ks.setAttribute("aria-expanded","true"),_r(As),Ms(),window.requestAnimationFrame(()=>{let e=Rs.querySelector(".settings-option.is-active")||Rs.querySelector(".settings-option");e&&e.focus({preventScroll:!0})}))}function $r({restoreFocus:e=!0}={}){qs&&(qs=!1,Zs(),Dt={...hs},Ms(),document.body.classList.remove("settings-open"),e&&Ks.focus({preventScroll:!0}),Ys.setAttribute("aria-hidden","true"),Ys.setAttribute("inert",""),Ks.setAttribute("aria-expanded","false"))}function Yi(){Ys=document.getElementById("settings-sidebar"),Ks=document.getElementById("settings-trigger"),Nt=document.getElementById("settings-panel"),Rs=document.getElementById("settings-options"),Di=document.getElementById("settings-close"),!(!Ys||!Ks||!Nt||!Rs)&&(sn(),fr(gr(),{persist:!1}),td(),va(),Xc(),Ms(),Ks.addEventListener("click",()=>{qs?$r():ud()}),Di?.addEventListener("click",()=>$r()),Rs.addEventListener("click",e=>{let t=e.target.closest("[data-settings-panel]");t&&_r(t.dataset.settingsPanel)}),Nt.addEventListener("click",dd),Nt.addEventListener("input",Oi),Nt.addEventListener("change",Oi),Nt.addEventListener("blur",rd,!0),Nt.addEventListener("pointerover",id),Nt.addEventListener("pointerout",od),Nt.addEventListener("focusin",ld),Nt.addEventListener("focusout",cd),Nt.addEventListener("keydown",e=>{e.key==="Enter"&&e.target.classList.contains("font-size-number-input")&&(e.preventDefault(),e.target.blur())}),document.addEventListener("keydown",e=>{e.key==="Escape"&&qs&&$r()}),window.addEventListener("storage",e=>{if(e.key===yr){vs=Ui(),sn();return}e.key===en&&(hs=Qi(),qs||(Dt={...hs},Ms()))}))}var Zi=["rag","data","quality","performance","processing","status"],ln={rag:"RAG \u63D0\u554F",data:"\u8CC7\u6599\u5EAB",quality:"\u8CC7\u6599\u54C1\u8CEA",performance:"\u6548\u80FD\u5831\u8868",processing:"\u8CC7\u6599\u8655\u7406",status:"\u7CFB\u7D71\u72C0\u614B"},Je={loaded:!1,admin:!1,enabled:!1,features:{},expiresAt:null,reason:"",me:null},eo="judgment.demo_context.v1",pd=300*1e3;function to(){try{let e=JSON.parse(window.localStorage.getItem(eo)||"null");return!e||typeof e!="object"||Date.now()-Number(e.saved_at||0)>pd||typeof e.admin!="boolean"?null:e}catch{return null}}function so(e){return e&&(Je.admin=!!e.admin,Je.enabled=!!e.enabled,Je.features=e.features||{},Je.expiresAt=e.expiresAt||null,Je.reason=e.reason||"",Je.me=e.me||null,Je.loaded=!0),Je}function md(){try{window.localStorage.setItem(eo,JSON.stringify({admin:Je.admin,enabled:Je.enabled,features:Je.features,expiresAt:Je.expiresAt,reason:Je.reason,me:Je.me,saved_at:Date.now()}))}catch{}}function ta(){return!!Je.admin}function Zt(){return!Je.admin}function ao(){return!!Je.enabled}function kr(e){return Je.admin?!0:e==="home"?Je.enabled:!!(Je.enabled&&Je.features?.[e])}function gd(e){return ln[e]||e}function cn(e){if(!e)return"\u2014";let t=Date.parse(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.round((t-Date.now())/1e3));if(s<=0)return"\u5DF2\u5230\u671F";let a=Math.floor(s/3600),n=Math.floor(s%3600/60);return a>0?`${a} \u5C0F\u6642 ${n} \u5206`:`${Math.max(1,n)} \u5206`}async function dn(){let e=await Promise.allSettled([G.authMe()]),t=e[0].status==="fulfilled"?e[0].value:null,s=t?.demo||await G.demoStatus().catch(()=>null);return Je.admin=!!t?.admin,Je.enabled=!!s?.enabled,Je.features=s?.features||{},Je.expiresAt=s?.expires_at||null,Je.reason=s?.reason||"",Je.me=t,Je.loaded=!0,md(),Je.admin&&(Je.enabled=!1),Je}function Ps(){let e=!Je.admin,t=!!Je.enabled;document.body.classList.toggle("is-demo-visitor",e&&t),document.body.classList.toggle("is-demo-closed",e&&!t),document.body.classList.toggle("is-admin",Je.admin),document.querySelectorAll("[data-route]").forEach(a=>{let n=a.dataset.route||"";if(!e){a.hidden=!1;return}if(n==="tests"){a.hidden=!0;return}a.hidden=!Je.enabled||!kr(n)});let s=document.getElementById("demo-banner");s&&(e&&t?(s.hidden=!1,s.innerHTML=`<span class="demo-banner-dot" aria-hidden="true"></span>
      <strong>\u5C55\u793A\u6A21\u5F0F</strong>
      <span>\u5269\u9918 ${r(cn(Je.expiresAt))}</span>
      <span class="demo-banner-note">\u53EF\u700F\u89BD\u5B8C\u6574\u8CC7\u6599\u9801\uFF1B\u7BA1\u7406\u64CD\u4F5C\u5DF2\u9396\u5B9A</span>`):(s.hidden=!0,s.innerHTML=""))}function no(e){e.innerHTML=`<section class="page demo-closed-page">
    <div class="demo-state-card">
      <div class="demo-state-mark">${m("shield",22)}</div>
      <div class="eyebrow">DEMO MODE</div>
      <h1 class="page-title">\u5C55\u793A\u76EE\u524D\u672A\u958B\u653E</h1>
      <p class="page-subtitle">
        \u6B64\u7DB2\u7AD9\u50C5\u5728\u9762\u8A66\u5C55\u793A\u671F\u9593\u66AB\u6642\u958B\u653E\u3002\u82E5\u4F60\u662F\u7BA1\u7406\u8005\uFF0C\u8ACB\u7531\u53F3\u4E0A\u89D2\u767B\u5165\u3002
      </p>
      <div class="demo-state-actions">
        <a class="btn btn-secondary" href="https://github.com/solo0920/judgment" target="_blank" rel="noopener noreferrer">\u67E5\u770B\u5C08\u6848</a>
      </div>
    </div>
  </section>`}function Sr(e,t){e.innerHTML=`<section class="page demo-closed-page">
    <div class="demo-state-card">
      <div class="demo-state-mark">${m("shield",22)}</div>
      <div class="eyebrow">DEMO MODE</div>
      <h1 class="page-title">\u6B64\u529F\u80FD\u76EE\u524D\u672A\u958B\u653E\u5C55\u793A</h1>
      <p class="page-subtitle">
        ${r(t==="tests"?"\u7CFB\u7D71\u6E2C\u8A66":gd(t))}\u76EE\u524D\u7531\u7BA1\u7406\u8005\u95DC\u9589\uFF1B\u5C55\u793A\u671F\u9593\u4ECD\u53EF\u5207\u63DB\u5176\u4ED6\u5DF2\u958B\u653E\u529F\u80FD\u3002
      </p>
      <div class="demo-state-actions">
        <a class="btn btn-primary" href="#/home">\u56DE\u5230\u9996\u9801</a>
      </div>
    </div>
  </section>`}function un(){return`<section class="page demo-closed-page">
    <div class="demo-state-card">
      <div class="demo-state-mark">${m("shield",22)}</div>
      <div class="eyebrow">ADMIN ONLY</div>
      <h1 class="page-title">\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650</h1>
      <p class="page-subtitle">\u8ACB\u7531\u53F3\u4E0A\u89D2\u4EE5\u7BA1\u7406\u8005 Google \u5E33\u865F\u767B\u5165\u3002</p>
    </div>
  </section>`}function Is(e,t){return`<div class="demo-lock-card">
    <span class="demo-lock-icon">${m("shield",18)}</span>
    <div class="demo-lock-copy">
      <strong>${r(e||"\u6B64\u529F\u80FD\u7531\u7BA1\u7406\u8005\u64CD\u4F5C")}</strong>
      <p>${r(t||"\u5C55\u793A\u6A21\u5F0F\u50C5\u63D0\u4F9B\u6AA2\u8996\uFF0C\u57F7\u884C\u3001\u8A2D\u5B9A\u8207\u7BA1\u7406\u6309\u9215\u5DF2\u9396\u5B9A\u3002")}</p>
      <span class="badge badge-neutral badge-mono">\u5C55\u793A\u6A21\u5F0F \xB7 \u552F\u8B80</span>
    </div>
  </div>`}var Rt=null,ya=0,Cs=null,ea={x:0,y:0};function fd(){return Rt?.isConnected||(Rt=document.createElement("div"),Rt.className="demo-lock-tooltip",Rt.setAttribute("role","tooltip"),Rt.hidden=!0,document.body.appendChild(Rt)),Rt}function ro(){if(!Rt||Rt.hidden)return;let e=18,t=Rt.getBoundingClientRect(),s=ea.x+e,a=ea.y+14;s+t.width>window.innerWidth-8&&(s=ea.x-t.width-e),a+t.height>window.innerHeight-8&&(a=ea.y-t.height-14),Rt.style.transform=`translate3d(${Math.round(Math.max(8,s))}px, ${Math.round(Math.max(8,a))}px, 0)`}function bd(e){let t=String(e?.dataset.demoLockTooltip||"").trim();if(!t)return;let s=fd();s.textContent=t,s.hidden=!1,ro()}function rn(){ya&&(window.clearTimeout(ya),ya=0),Cs=null,Rt&&(Rt.hidden=!0)}function Xi(e,t,s){!e||Cs===e||(rn(),Cs=e,ea={x:t,y:s},ya=window.setTimeout(()=>{ya=0,Cs===e&&bd(e)},200))}function on(){on.installed||(on.installed=!0,document.addEventListener("pointerover",e=>{let t=e.target.closest?.("[data-demo-lock-tooltip]");t&&Xi(t,e.clientX,e.clientY)}),document.addEventListener("pointermove",e=>{Cs&&(ea={x:e.clientX,y:e.clientY},Rt&&!Rt.hidden&&ro())}),document.addEventListener("pointerout",e=>{if(!Cs)return;let t=e.relatedTarget;t&&Cs.contains?.(t)||rn()}),document.addEventListener("focusin",e=>{let t=e.target.closest?.("[data-demo-lock-tooltip]");if(!t)return;let s=t.getBoundingClientRect();Xi(t,s.right,s.top)}),document.addEventListener("focusout",()=>rn()),window.addEventListener("scroll",rn,{capture:!0,passive:!0}))}var xr={};gs(xr,{render:()=>yd,securityAuditRows:()=>io});var hd=[{hours:2,label:"2 \u5C0F\u6642"},{hours:24,label:"24 \u5C0F\u6642"},{hours:168,label:"7 \u5929"}];function vd(e,t){return`<label class="demo-toggle-row" for="demo-feature-${e}">
    <span class="demo-toggle-copy">
      <strong>${r(ln[e]||e)}</strong>
      <small>${t?"\u8A2A\u5BA2\u53EF\u4F7F\u7528\u6B64\u529F\u80FD\u7684\u552F\u8B80\uFF0F\u516C\u958B\u90E8\u5206":"\u76EE\u524D\u672A\u958B\u653E\u7D66\u8A2A\u5BA2"}</small>
    </span>
    <span class="demo-switch">
      <input type="checkbox" id="demo-feature-${e}" data-demo-feature="${e}" aria-label="${r(ln[e]||e)}" ${t?"checked":""} />
      <span aria-hidden="true"></span>
    </span>
  </label>`}function $d(e){return e?.length?`<div class="demo-audit-list">${e.map(t=>`<div class="demo-audit-row">
        <span>${r(t.created_at||"\u2014")}</span>
        <strong>${r(t.action||"\u2014")}</strong>
        <small>${r(t.actor_email||"\u2014")}</small>
      </div>`).join("")}</div>`:'<div class="demo-empty">\u5C1A\u7121\u5207\u63DB\u7D00\u9304\u3002</div>'}function io(e){return e?.length?`<div class="security-audit-list">${e.map(t=>`<div class="security-audit-row">
        <span>${r(t.created_at||"\u2014")}</span>
        <strong>${r(`${t.event_type||"\u2014"} \xB7 ${t.outcome||"\u2014"}`)}</strong>
        <span>${r(`${t.method||""} ${t.path||""}`.trim()||"\u2014")}</span>
        <small>${r([t.actor||t.source||"\u2014",t.client_ip_hash?`IP ${t.client_ip_hash}`:""].filter(Boolean).join(" \xB7 "))}</small>
      </div>`).join("")}</div>`:'<div class="demo-empty">\u5C1A\u7121\u5B89\u5168\u7A3D\u6838\u4E8B\u4EF6\u3002</div>'}async function yd(e){if(!ta()){e.innerHTML=un();return}e.innerHTML=`<section class="page admin-page">
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
            <span class="status-tab-icon">${m("sliders",15)}</span>
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
  </section>`;let t=e.querySelector("#demo-admin-panel"),s=e.querySelector("#demo-admin-badge"),a=null,n={events:[]},i=0,o=()=>{let u=t.querySelector("[data-demo-remaining]");u&&(u.textContent=cn(a?.effective?.expires_at))},l=()=>{if(!a)return;let u=a.stored||{},h=a.effective||{},y=a.usage||{},v=u.features||{},p=!!h.enabled,b=!!a.hard_disabled;s.textContent=p?"DEMO \xB7 \u5DF2\u958B\u555F":"DEMO \xB7 \u5DF2\u95DC\u9589",s.classList.toggle("badge-ok",p),s.classList.toggle("badge-danger",!p),t.innerHTML=`<div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">DEMO MODE</div>
          <div class="report-title">\u5C55\u793A\u6A21\u5F0F</div>
          <div class="report-sub">
            \u5BE6\u969B\u751F\u6548\uFF1A<strong>${p?"\u958B\u555F":"\u95DC\u9589"}</strong>
            ${h.reason?` \xB7 \u539F\u56E0\uFF1A${r(h.reason)}`:""}
          </div>
        </div>
        <div class="demo-status-pill ${p?"is-on":"is-off"}">${p?"ON":"OFF"}</div>
      </div>
      <div class="report-section">
        ${b?`<div class="notice notice-danger" role="alert">
                <span class="notice-icon" aria-hidden="true">${m("alert",12)}</span>
                <div class="notice-body"><strong>\u74B0\u5883\u8B8A\u6578\u5F37\u5236\u95DC\u9589</strong>
                <p>JUDGMENT_DEMO_HARD_DISABLE=1\uFF0CDB \u958B\u95DC\u76EE\u524D\u7121\u6548\u3002</p></div>
              </div>`:""}
        <div class="demo-admin-stats">
          <div><span>\u5269\u9918\u6642\u9593</span><strong data-demo-remaining>${r(cn(h.expires_at))}</strong></div>
          <div><span>\u4ECA\u65E5\u63D0\u554F</span><strong>${c(y.requests||0)}</strong></div>
          <div><span>\u4ECA\u65E5 tokens</span><strong>${c(y.tokens||0)}</strong></div>
          <div><span>\u8A2D\u5B9A\u7248\u672C</span><strong>${c(u.version||0)}</strong></div>
        </div>

        <div class="demo-master-row">
          <div>
            <strong>\u7E3D\u958B\u95DC\uFF08\u5132\u5B58\u5F8C\u751F\u6548\uFF09</strong>
            <small>\u95DC\u9589\u6642\u53EA\u4FDD\u7559\u9996\u9801\u975C\u614B\u9801\u8207\u7BA1\u7406\u8005\u767B\u5165\uFF1B\u8A2A\u5BA2 API \u5168\u90E8\u62D2\u7D55\u3002\u529F\u80FD\u65D7\u6A19\u4ECD\u53EF\u5148\u8A2D\u5B9A\u4E26\u5132\u5B58\u3002</small>
          </div>
          <span class="demo-switch demo-switch-lg">
            <input type="checkbox" id="demo-enabled" aria-label="\u5C55\u793A\u6A21\u5F0F\u7E3D\u958B\u95DC" ${u.enabled?"checked":""} />
            <span aria-hidden="true"></span>
          </span>
        </div>

        <div class="demo-feature-list">
          ${Zi.map(f=>vd(f,!!v[f])).join("")}
        </div>

        <div class="demo-open-controls">
          <label class="field-label" for="demo-duration">\u958B\u653E\u6642\u9593</label>
          <select class="select" id="demo-duration">
            ${hd.map(f=>`<option value="${f.hours}">${f.label}</option>`).join("")}
          </select>
          <button class="btn btn-secondary" type="button" id="demo-save">
            ${m("check",15)}<span>\u5132\u5B58\u8A2D\u5B9A</span>
          </button>
          <button class="btn btn-success" type="button" id="demo-open">
            ${m("play",15)}<span>\u958B\u555F\u5C55\u793A</span>
          </button>
          <button class="btn btn-danger" type="button" id="demo-close">
            ${m("x",15)}<span>\u7ACB\u5373\u95DC\u9589\u5C55\u793A</span>
          </button>
        </div>
        <p class="demo-open-hint">
          \u300C\u5132\u5B58\u8A2D\u5B9A\u300D\u53EA\u4FDD\u5B58\u529F\u80FD\u65D7\u6A19\u8207\u671F\u9650\uFF0C\u4E0D\u6703\u6539\u8B8A\u76EE\u524D\u958B\u95DC\uFF1B\u300C\u958B\u555F\u5C55\u793A\u300D\u6703\u4F9D\u4E0A\u65B9\u65D7\u6A19\u7ACB\u5373\u5C0D\u8A2A\u5BA2\u958B\u653E\u3002
        </p>

        <div class="demo-admin-section">
          <div class="report-section-head"><span class="report-section-title">\u6700\u8FD1\u5207\u63DB\u7D00\u9304</span></div>
          ${$d(a.audit)}
        </div>

        <div class="demo-admin-section">
          <div class="report-section-head"><span class="report-section-title">\u5B89\u5168\u7A3D\u6838\uFF08\u6700\u8FD1 20 \u7B46\uFF09</span></div>
          ${io(n.events)}
        </div>
      </div>
    </div>`;let w=t.querySelector("#demo-enabled"),M=[...t.querySelectorAll("[data-demo-feature]")],k=()=>Object.fromEntries(M.map(f=>[f.dataset.demoFeature,f.checked])),S=async(f,{enabled:T,label:V})=>{f.disabled=!0;let Q=Number(t.querySelector("#demo-duration")?.value||2),fe=k();if(T&&!Object.values(fe).some(Boolean)){N("\u8ACB\u81F3\u5C11\u958B\u555F\u4E00\u500B\u529F\u80FD\uFF0C\u624D\u80FD\u958B\u555F\u5C55\u793A\u3002","warn",5200),f.disabled=!1;return}try{a=await G.updateDemo({enabled:T,duration_hours:T?Q:null,features:fe,version:a?.stored?.version}),N(V,"ok",3200),l()}catch(ve){N(ve.message||"\u7121\u6CD5\u66F4\u65B0\u5C55\u793A\u8A2D\u5B9A\u3002","danger",6e3)}finally{f.disabled=!1}};t.querySelector("#demo-save")?.addEventListener("click",f=>{S(f.currentTarget,{enabled:!!w?.checked,label:w?.checked?"\u5C55\u793A\u8A2D\u5B9A\u5DF2\u5132\u5B58\uFF0C\u5C55\u793A\u4ECD\u7DAD\u6301\u958B\u555F\u3002":"\u5C55\u793A\u8A2D\u5B9A\u5DF2\u5132\u5B58\uFF0C\u5C55\u793A\u4ECD\u7DAD\u6301\u95DC\u9589\u3002"})}),t.querySelector("#demo-open")?.addEventListener("click",f=>{S(f.currentTarget,{enabled:!0,label:"\u5C55\u793A\u6A21\u5F0F\u5DF2\u958B\u555F\u3002"})}),t.querySelector("#demo-close")?.addEventListener("click",async f=>{let T=f.currentTarget;T.disabled=!0;try{a=await G.closeDemo(),N("\u5C55\u793A\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok",3200),l()}catch(V){N(V.message||"\u7121\u6CD5\u95DC\u9589\u5C55\u793A\u6A21\u5F0F\u3002","danger",6e3)}finally{T.disabled=!1}}),i&&window.clearInterval(i),i=window.setInterval(o,1e3)};return await(async()=>{try{let[u,h]=await Promise.all([G.adminDemo(),G.adminSecurityAudit(20).catch(()=>({events:[]}))]);a=u,n=h||{events:[]},l()}catch(u){t.innerHTML=`<div class="report-card"><div class="report-head">
        <div class="report-title-group"><div class="report-kicker">ADMIN SETTINGS</div>
        <div class="report-title">\u7121\u6CD5\u8B80\u53D6\u5C55\u793A\u8A2D\u5B9A</div>
        <div class="report-sub">${r(u.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}</div></div>
      </div></div>`}})(),()=>{i&&window.clearInterval(i),i=0}}var Rr={};gs(Rr,{render:()=>Nd});function wd(e){let t=e&&typeof e=="object"?e:{},s=t.judgment_total,a=t.financial_total,n=Number(s),i=Number(a),o=s!=null&&Number.isFinite(n)&&n>=0,l=a!=null&&Number.isFinite(i)&&i>=0;return{total:o?n:null,financial:l?i:null,ratio:o&&l&&n>0?i/n*100:null}}function ds(e,{loading:t=!1}={}){let s=wd(e),a=t?"\u8B80\u53D6\u4E2D\u2026":c(s.total),n=t?"\u8B80\u53D6\u4E2D\u2026":c(s.financial),i=t?"\u8B80\u53D6\u4E2D\u2026":s.ratio===null?"\u2014":`${s.ratio.toFixed(1)}%`;return`<div class="processing-summary-card">
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
  </div>`}var Ar=11,_d=15e3,oo="judgment.home.summary.v1",pn=new Set,kd=[{route:"rag",icon:"message",kicker:"RAG",title:"RAG \u63D0\u554F",summary:"\u7528\u81EA\u7136\u8A9E\u8A00\u627E\u5230\u76F8\u4F3C\u5224\u6C7A\u8207\u73FE\u884C\u6CD5\u898F\uFF0C\u56DE\u7B54\u9644\u4E0A\u53EF\u56DE\u6EAF\u7684\u5F15\u7528\u3002",metric:"Citations first",tone:"feature",wide:!0,metricKey:"rag"},{route:"data",icon:"database",kicker:"EXPLORE",title:"\u8CC7\u6599\u5EAB\u67E5\u8A62",summary:"\u8DE8 PostgreSQL\u3001Parquet\u3001Qdrant \u8207 IndexedDB \u6AA2\u8996\u539F\u59CB\u8CC7\u6599\u3002",metric:"4 \u7A2E\u8CC7\u6599\u4F86\u6E90",tone:"blue",metricKey:"data"},{route:"quality",icon:"shield",kicker:"QUALITY",title:"\u8CC7\u6599\u54C1\u8CEA",summary:"\u7528 DuckDB \u6AA2\u67E5\u539F\u59CB\u5224\u6C7A\u7684\u91CD\u8907\u3001\u7F3A\u6F0F\u8207\u5F15\u7528\u4E00\u81F4\u6027\u3002",metric:"DuckDB native",tone:"green",metricKey:"quality"},{route:"performance",icon:"activity",kicker:"OBSERVE",title:"\u6548\u80FD\u5831\u8868",summary:"\u5F9E\u55AE\u6B21 RAG \u5230\u7D22\u5F15\u5EFA\u7F6E\uFF0C\u8FFD\u8E64\u6BCF\u500B\u968E\u6BB5\u7684\u8017\u6642\u8207\u74F6\u9838\u3002",metric:"Flow \xB7 Waterfall",tone:"amber",metricKey:"performance"},{route:"processing",icon:"sliders",kicker:"PIPELINE",title:"\u8CC7\u6599\u8655\u7406",summary:"\u4E0B\u8F09\u3001\u532F\u5165\u3001\u5099\u4EFD\u8207\u7D22\u5F15\uFF0C\u96C6\u4E2D\u7BA1\u7406\u8CC7\u6599\u751F\u547D\u9031\u671F\u3002",metric:"End-to-end",tone:"violet",metricKey:"processing"},{route:"status",icon:"server",kicker:"STATUS",title:"\u7CFB\u7D71\u72C0\u614B",summary:"\u6AA2\u8996\u670D\u52D9\u5065\u5EB7\u3001\u8F09\u5165 Pipeline\u3001\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207 API \u76EE\u9304\u3002",metric:"10 \u670D\u52D9\u5143\u4EF6",tone:"slate",metricKey:"status"},{route:"tests",icon:"check",kicker:"VERIFY",title:"\u7CFB\u7D71\u6E2C\u8A66",summary:"\u8A2D\u5B9A API Base\uFF0C\u6E2C\u8A66 LLM \u6A21\u578B\u8207 Reranker \u670D\u52D9\u3002",metric:"LLM \xB7 Reranker",tone:"rose",metricKey:"tests"}];function sa(e,t=1){let s=Number(e);return Number.isFinite(s)?`${s.toFixed(t)}%`:"\u2014"}function Mr(e){let t=e?.year_min,s=e?.year_max;return!t&&!s?"\u2014":t&&s&&t!==s?`${t}\u2013${s}`:String(t||s)}function co(e){let t=Number(e?.year_span);return Number.isFinite(t)&&t>0?`${t} \u5E74`:"\u2014"}function Sd(e){return`<a class="home-tile tone-${r(e.tone)}${e.wide?" is-wide":""}" href="#/${e.route}">
    <span class="home-tile-watermark" aria-hidden="true">${m(e.icon,148)}</span>
    <span class="home-tile-head">
      <span class="home-tile-icon">${m(e.icon,22)}</span>
      <span class="home-tile-kicker">${r(e.kicker)}</span>
    </span>
    <span class="home-tile-copy">
      <strong>${r(e.title)}</strong>
      <span>${r(e.summary)}</span>
    </span>
    <span class="home-tile-foot">
      <span class="home-tile-metric" data-home-tile-metric="${r(e.metricKey)}">${r(e.metric)}</span>
      <span class="home-tile-cta">\u63A2\u7D22 ${m("arrowRight",13)}</span>
    </span>
  </a>`}function Lr(e,{loading:t=!1}={}){let s=e?.laws||{},a=n=>t?"\u8B80\u53D6\u4E2D\u2026":c(n);return`<div class="processing-summary-card">
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
  </div>`}function xd(e,{loading:t=!1}={}){if(t)return`<div class="home-live-rows is-loading">
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
      <span class="home-live-value mono">${r(Mr(a))} <i>\xB7</i> ${r(co(a))}</span>
    </div>
    <div class="home-live-row">
      <span class="home-live-label">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15</span>
      <span class="home-live-value mono">${c(n.indexed)} <i>\xB7</i> ${r(sa(n.coverage_pct))}</span>
    </div>
  </div>`}function gn(e,{loading:t=!1,error:s="",generatedAt:a=""}={}){return s?`<div class="home-live-error" role="status">
      <span class="home-live-error-icon">${m("alert",18)}</span>
      <div>
        <strong>\u5373\u6642\u6458\u8981\u66AB\u6642\u7121\u6CD5\u53D6\u5F97</strong>
        <p>${r(s)}</p>
        <button class="btn btn-secondary btn-sm" type="button" id="home-retry">
          ${m("refresh",13)}<span>\u91CD\u65B0\u8F09\u5165</span>
        </button>
      </div>
    </div>`:`${xd(e,{loading:t})}
    <div class="home-live-foot">
      <span class="home-live-source">${m("link",12)}\u53F8\u6CD5\u9662 OpenData \xB7 \u5168\u570B\u6CD5\u898F\u8CC7\u6599\u5EAB</span>
      <span class="home-live-time">${t||!a?"\u540C\u6B65\u4E2D\u2026":`\u66F4\u65B0 ${Se(a)}`}</span>
    </div>`}function jr(e,{loading:t=!1}={}){if(t)return`<span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>
      <span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>
      <span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>`;let s=e?.judgments||{},a=e?.raw||{},n=e?.rag?.judgment_index||{};return`<span class="home-fact">
      <span class="home-fact-label">\u539F\u59CB\u5224\u6C7A\u5099\u4EFD</span>
      <strong>${c(a.raw_total)}</strong>
      <small>${c(a.archive_count)} \u500B archive \xB7 \u53F8\u6CD5\u9662 OpenData</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">\u91D1\u878D\u5224\u6C7A\u5E74\u4EFD</span>
      <strong>${r(Mr(s))}</strong>
      <small>${r(co(s))} \xB7 ${c(s.financial_total)} \u7B46 current</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">\u5411\u91CF\u7D22\u5F15\u8986\u84CB</span>
      <strong>${r(sa(n.coverage_pct))}</strong>
      <small>${c(n.indexed)} / ${c(n.total)} \u7B46 \xB7 ${r(n.model||"\u2014")}</small>
    </span>`}function mn(e,t){let s=t?.laws||{},a=t?.judgments||{},n=t?.raw||{},i=t?.sources||{};if(e==="opendata"){let l=i.opendata||{};return`<article class="home-source-card">
      <div class="home-source-head">
        <span class="home-source-icon">${m("cloud",20)}</span>
        <div>
          <strong>${r(l.label||"\u53F8\u6CD5\u9662\u8CC7\u6599\u958B\u653E\u5E73\u81FA")}</strong>
          <small>\u88C1\u5224\u66F8\u539F\u59CB\u8CC7\u6599</small>
        </div>
        <a class="home-source-link" href="${r(Ft(l.url,"https://opendata.judicial.gov.tw/"))}" target="_blank" rel="noopener noreferrer">${m("external",12)}\u4F86\u6E90</a>
      </div>
      <p class="home-source-copy">\u5224\u6C7A\u5168\u6587\u3001\u6848\u865F\u3001\u6CD5\u9662\u3001\u88C1\u5224\u65E5\u671F\u8207 PDF \u9023\u7D50\u7686\u4FDD\u7559\u539F\u59CB\u6B04\u4F4D\uFF1B\u532F\u5165\u524D\u5148\u5BEB\u5165\u4E0D\u53EF\u8B8A\u7684 raw Parquet \u5099\u4EFD\u3002</p>
      <dl class="home-source-facts">
        <div><dt>\u539F\u59CB\u5224\u6C7A</dt><dd>${c(n.raw_total)}</dd></div>
        <div><dt>Archive</dt><dd>${c(n.archive_count)}</dd></div>
        <div><dt>\u88C1\u5224\u5E74\u4EFD</dt><dd>${r(Mr(a))}</dd></div>
        <div><dt>\u5206\u985E\u4EE3\u78BC</dt><dd>${r(l.category||"051")}</dd></div>
      </dl>
      <div class="home-source-flow"><span>RAR</span>${m("arrowRight",11)}<span>raw Parquet</span>${m("arrowRight",11)}<span>PostgreSQL</span></div>
    </article>`}let o=i.laws||{};return`<article class="home-source-card">
    <div class="home-source-head">
      <span class="home-source-icon">${m("layers",20)}</span>
      <div>
        <strong>${r(o.label||"\u5168\u570B\u6CD5\u898F\u8CC7\u6599\u5EAB")}</strong>
        <small>\u6CD5\u898F\u3001\u547D\u4EE4\u8207\u689D\u6587\u7248\u672C</small>
      </div>
      <a class="home-source-link" href="${r(Ft(o.url,"https://law.moj.gov.tw/"))}" target="_blank" rel="noopener noreferrer">${m("external",12)}\u4F86\u6E90</a>
    </div>
    <p class="home-source-copy">\u4EE5\u5B98\u65B9 JSON \u7AEF\u9EDE\u4E0B\u8F09\u73FE\u884C\u6CD5\u898F\u8207\u547D\u4EE4\uFF0C\u4FDD\u7559\u7248\u672C\u3001\u689D\u6587\u8207\u8B8A\u66F4\u4E8B\u4EF6\uFF1B\u5224\u6C7A\u5F15\u7528\u53EF\u56DE\u5230\u5C0D\u61C9\u689D\u865F\u3002</p>
    <dl class="home-source-facts">
      <div><dt>\u6CD5\u898F</dt><dd>${c(s.law_count)}</dd></div>
      <div><dt>\u547D\u4EE4</dt><dd>${c(s.order_count)}</dd></div>
      <div><dt>\u689D\u6587</dt><dd>${c(s.article_count)}</dd></div>
      <div><dt>\u8CC7\u6599\u7248\u672C</dt><dd>${c(s.version_count)}</dd></div>
    </dl>
    <div class="home-source-flow"><span>ZIP</span>${m("arrowRight",11)}<span>Parquet</span>${m("arrowRight",11)}<span>PostgreSQL</span>${m("arrowRight",11)}<span>Qdrant</span></div>
  </article>`}function Tr(e,{loading:t=!1,error:s=""}={}){if(t)return'<div class="home-laws-loading skeleton skeleton-card"></div>';if(s)return`<div class="home-laws-error" role="status">${m("alert",16)}<span>${r(s)}</span></div>`;let a=e?.financial_laws||{},n=Array.isArray(a.laws)?a.laws:[],i=Number(a.count)||n.length,o=Math.ceil(i/Ar)||0,l=String(a.source_sha256||""),d=l?`${l.slice(0,12)}\u2026`:"\u2014",u=a.modified_at?Ut(a.modified_at):"\u2014";return`<details class="home-laws" id="home-laws">
    <summary class="home-laws-summary">
      <span class="home-laws-count">${c(i)}</span>
      <span class="home-laws-title">
        <strong>\u91D1\u878D\u6CD5\u898F\u6E05\u55AE</strong>
        <small>${r(a.source_path||"documents/\u91D1\u878D\u6CD5\u898F.md")} \xB7 ${Ar} \u6B04 \xD7 ${o} \u5217</small>
      </span>
      <span class="home-laws-toggle">
        <span>\u5C55\u958B\u6E05\u55AE</span>${m("chevronDown",14)}
      </span>
    </summary>
    <div class="home-laws-body">
      <div class="home-laws-toolbar">
        <span>\u4F86\u6E90 ${r(a.source_path||"documents/\u91D1\u878D\u6CD5\u898F.md")} \xB7 SHA-256 <span class="mono">${r(d)}</span> \xB7 \u4FEE\u6539 ${r(u)}</span>
        <button class="btn btn-secondary btn-sm" type="button" id="home-laws-download">
          ${m("download",13)}<span>\u4E0B\u8F09\u6E05\u55AE</span>
        </button>
      </div>
      ${n.length?`<div class="home-laws-grid" style="--home-law-columns:${Ar}" role="list">
              ${n.map((h,y)=>`<span class="home-law" role="listitem" title="${r(h)}">
                    <span class="home-law-index">${String(y+1).padStart(2,"0")}</span>
                    <span class="home-law-name">${r(h)}</span>
                  </span>`).join("")}
            </div>`:'<p class="home-laws-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u6CD5\u898F\u540D\u7A31\u3002</p>'}
    </div>
  </details>`}function Er(e,{loading:t=!1,error:s=""}={}){if(t)return`<div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>`;if(s)return`<div class="home-rag-error">${m("alert",16)}<span>${r(s)}</span></div>`;let a=e?.rag||{},n=a.judgment_index||{},i=a.legal_index||{},o=a.models||{},l=Number(n.coverage_pct),d=Number.isFinite(l)?Math.max(0,Math.min(100,l)):0;return`<article class="home-rag-card">
      <span class="home-rag-kicker">JUDGMENT RETRIEVAL</span>
      <strong class="home-rag-value mono">${c(n.indexed)}<small> / ${c(n.total)}</small></strong>
      <span class="home-rag-label">\u5DF2\u7D22\u5F15 / \u91D1\u878D\u5224\u6C7A</span>
      <span class="home-rag-progress" role="img" aria-label="\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u8986\u84CB ${r(sa(n.coverage_pct))}"><span style="width:${d.toFixed(1)}%"></span></span>
      <span class="home-rag-meta">${r(sa(n.coverage_pct))} \xB7 ${r(n.model||"\u2014")} \xB7 ${r(n.alias||"\u2014")} \u2192 ${r(n.collection||"\u2014")}</span>
      <a class="home-rag-link" href="#/rag">\u958B\u59CB\u63D0\u554F ${m("arrowRight",12)}</a>
    </article>
    <article class="home-rag-card">
      <span class="home-rag-kicker">LEGAL GROUNDING</span>
      <strong class="home-rag-value mono">${c(i.points_count)}<small> \u689D\u6587</small></strong>
      <span class="home-rag-label">\u6CD5\u898F\uFF0F\u547D\u4EE4\u5411\u91CF\u7D22\u5F15</span>
      <span class="home-rag-progress" role="img" aria-label="\u6CD5\u898F\u547D\u4EE4\u7D22\u5F15 ${c(i.points_count)} \u689D\u6587"><span style="width:${Number(i.points_count)>0?"100":"0"}%"></span></span>
      <span class="home-rag-meta">${c(i.current_article_count??i.article_count)} \u73FE\u884C\u689D\u6587 \xB7 ${r(i.model||"\u2014")} \xB7 ${r(i.collection||"\u2014")}${i.version_id?` \xB7 v${i.version_id}`:""}</span>
      <a class="home-rag-link" href="#/data">\u67E5\u770B\u8CC7\u6599 ${m("arrowRight",12)}</a>
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
      <a class="home-rag-link" href="#/performance">\u67E5\u770B RAG Pipeline ${m("arrowRight",12)}</a>
    </article>`}function Ad(){return`<ol class="home-rag-flow" aria-label="RAG \u57F7\u884C\u6D41\u7A0B">
    ${[["01","\u554F\u984C","1\u2013500 \u5B57","message"],["02","Embedding","bge-m3","brain"],["03","\u6AA2\u7D22","\u5224\u6C7A + \u6CD5\u898F\uFF0F\u547D\u4EE4","database"],["04","Rerank","cross-encoder","sliders"],["05","LLM","\u4F9D\u6AA2\u7D22\u5167\u5BB9\u56DE\u7B54","sparkles"],["06","\u5F15\u7528","[n] \u2192 \u539F\u59CB\u4F86\u6E90","link"]].map(([t,s,a,n])=>`<li class="home-rag-step">
          <span class="home-rag-step-icon">${m(n,17)}</span>
          <span class="home-rag-step-copy">
            <small>${t}</small>
            <strong>${r(s)}</strong>
            <span>${r(a)}</span>
          </span>
        </li>`).join("")}
  </ol>`}function qd(){return`<div class="home-trace">
    <div class="home-trace-row">
      <span class="home-trace-label">\u5224\u6C7A\u5F15\u7528</span>
      <span class="home-trace-path">
        <span class="home-trace-node">\u56DE\u7B54 [n]</span>${m("arrowRight",11)}
        <span class="home-trace-node">\u6848\u865F \xB7 \u6CD5\u9662 \xB7 \u65E5\u671F</span>${m("arrowRight",11)}
        <span class="home-trace-node">PDF / \u539F\u59CB Parquet \u5168\u6587</span>${m("arrowRight",11)}
        <a class="home-trace-node is-link" href="#/data">PostgreSQL</a>
      </span>
    </div>
    <div class="home-trace-row">
      <span class="home-trace-label">\u6CD5\u898F\u5F15\u7528</span>
      <span class="home-trace-path">
        <span class="home-trace-node">\u56DE\u7B54 [n]</span>${m("arrowRight",11)}
        <span class="home-trace-node">\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 \u689D\u865F</span>${m("arrowRight",11)}
        <a class="home-trace-node is-link" href="#/data">\u689D\u6587\u7248\u672C\u8207\u4F86\u6E90</a>${m("arrowRight",11)}
        <a class="home-trace-node is-link" href="https://law.moj.gov.tw/" target="_blank" rel="noopener noreferrer">\u5168\u570B\u6CD5\u898F\u8CC7\u6599\u5EAB ${m("external",10)}</a>
      </span>
    </div>
    <p class="home-trace-note">RAG \u53EA\u6839\u64DA\u5BE6\u969B\u6AA2\u7D22\u5230\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u8207\u5224\u6C7A\u7247\u6BB5\u751F\u6210\u56DE\u7B54\uFF1B\u6C92\u6709\u6709\u6548\u4F86\u6E90\u6642\u986F\u793A\u6AA2\u7D22\u7D50\u679C\uFF0C\u4E0D\u4EE5\u63A8\u6E2C\u88DC\u9F4A\u3002</p>
  </div>`}function qr(e){return e==="failed"?"\u5931\u6557":e==="skipped"?"\u7565\u904E":e==="running"?"\u57F7\u884C\u4E2D":e==="pending"?"\u7B49\u5F85":"\u5B8C\u6210"}function Md(e,t,s,a,n,i){let o=String(e.status||"success"),l=o==="skipped"||o==="pending",d=Math.max(0,Number(e.duration_ms)||0),u=l?"\u2014":ge(d),h=o==="failed"?"var(--danger)":e.color||"#64748b",y=[`is-${o}`,o==="failed"?"is-error":"",l?"is-missing":"",i&&e.key===i?"is-slowest":""].filter(Boolean).join(" "),v=String(e.key||`stage-${t}`),p=[["\u72C0\u614B",qr(o),!0],["\u958B\u59CB",e.started_at?Se(e.started_at):"\u2014",!0],["\u7D50\u675F",e.finished_at?Se(e.finished_at):"\u2014",!0],["\u8017\u6642",u,!0],["\u5360\u6574\u9AD4",sa(n),!0],["\u8AAA\u660E",e.message||e.caption||"",!1]].map(([w,M,k])=>k||M?`<span class="rag-wf-detail"><span>${r(w)}</span><strong>${r(String(M||"\u2014"))}</strong></span>`:"").join(""),b=l?"":`<span class="rag-wf-bar is-sequential" style="left:${s.toFixed(3)}%;width:${a.toFixed(4)}%;top:0;height:12px;--bar-color:${r(h)}" aria-hidden="true"></span>`;return`<details class="rag-wf-stage home-wf-stage ${y}${pn.has(v)?" is-open":""}" data-home-wf-stage="${r(v)}"${pn.has(v)?" open":""} style="--stage-color:${r(e.color||"#64748b")}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong><span class="home-wf-step">${String(t+1).padStart(2,"0")}</span> ${r(e.label||e.key||"\u968E\u6BB5")}${i&&e.key===i?' <span class="home-wf-slow">\u6700\u6162</span>':""}</strong>${e.caption?`<small>${r(e.caption)}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${r(u)} \xB7 ${r(qr(o))} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${e.label||e.key}\uFF1A${qr(o)}\uFF0C\u8017\u6642 ${u}\uFF0C\u5360\u6574\u9AD4 ${sa(n)}`)}">${b}</span>
    </summary>
    <div class="rag-wf-details">${p}</div>
  </details>`}function Nr(e,{loading:t=!1,error:s="",clientMs:a=null}={}){if(t)return`<div class="report-card home-wf-loading" aria-live="polite">
      <div class="side-card-head index-runtime-head">
        <span class="side-card-title">${m("activity",14)}\u9996\u9801\u5373\u6642\u8CC7\u6599\u8F09\u5165 Pipeline</span>
        <span class="home-wf-loading-label">\u91CF\u6E2C\u4E2D\u2026</span>
      </div>
      <div class="home-wf-loading-body">
        <span class="skeleton skeleton-line"></span>
        <span class="skeleton skeleton-line"></span>
        <span class="skeleton skeleton-line"></span>
      </div>
    </div>`;if(s)return`<div class="report-card home-wf-error" role="status">
      <div class="side-card-head index-runtime-head">
        <span class="side-card-title">${m("activity",14)}\u9996\u9801\u5373\u6642\u8CC7\u6599\u8F09\u5165 Pipeline</span>
      </div>
      <div class="home-wf-error-body">${m("alert",16)}<span>${r(s)}</span></div>
    </div>`;let n=e?.pipeline,i=Array.isArray(n?.stages)?n.stages:[];if(!n||!i.length)return`<div class="report-card home-wf-error">
      <div class="side-card-head index-runtime-head">
        <span class="side-card-title">${m("activity",14)}\u9996\u9801\u5373\u6642\u8CC7\u6599\u8F09\u5165 Pipeline</span>
      </div>
      <div class="home-wf-error-body">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u968E\u6BB5\u8A08\u6642\u3002</div>
    </div>`;let o=Math.max(0,Number(n.total_ms)||i.reduce((S,f)=>S+(Number(f.duration_ms)||0),0)),l=Math.max(0,Number(a)||0),d=Math.max(0,l-o),u=Math.max(o,i.reduce((S,f)=>S+(Number(f.duration_ms)||0),0),1),h=i.reduce((S,f)=>(Number(f.duration_ms)||0)>(Number(S?.duration_ms)||0)?f:S,i[0]),y=1.25,v=i.map(S=>String(S.status||"success")==="skipped"?0:Math.max((Number(S.duration_ms)||0)/u*100,y)),p=v.reduce((S,f)=>S+f,0),b=p>100?100/p:1,w=0,M=i.map((S,f)=>{let T=["skipped","pending"].includes(String(S.status||"success")),V=T?0:v[f]*b,Q=w;T||(w+=V);let fe=u>0?(Number(S.duration_ms)||0)/u*100:0;return Md(S,f,Q,V,fe,h?.key)}).join(""),k=i.filter(S=>S.status==="failed").length;return`<section class="report-card status-wf-card home-wf-card" data-home-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m("activity",14)}\u9996\u9801\u5373\u6642\u8CC7\u6599\u8F09\u5165 Pipeline</span>
      <span class="home-wf-links">
        <a class="home-wf-link" href="#/status">\u5B8C\u6574\u670D\u52D9 Pipeline ${m("arrowRight",11)}</a>
        <a class="home-wf-link" href="#/performance">RAG Flow ${m("arrowRight",11)}</a>
      </span>
    </div>
    <div class="index-runtime-metrics home-wf-metrics">
      <span class="index-runtime-metric" title="\u5F8C\u7AEF /api/home \u5F9E\u7B2C\u4E00\u500B\u67E5\u8A62\u5230\u56DE\u61C9\u7D44\u88DD\u5B8C\u6210\u7684\u968E\u6BB5\u7E3D\u8017\u6642\u3002"><span>\u968E\u6BB5\u7E3D\u8017\u6642</span><strong>${r(ge(o))}</strong></span>
      <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u5F9E\u9001\u51FA\u8ACB\u6C42\u5230\u6536\u5230\u56DE\u61C9\u7684\u5BE6\u969B\u5F80\u8FD4\u6642\u9593\u3002"><span>HTTP \u5F80\u8FD4</span><strong>${r(l?ge(l):"\u2014")}</strong></span>
      <span class="index-runtime-metric" title="HTTP \u5F80\u8FD4\u6263\u6389\u5F8C\u7AEF\u968E\u6BB5\u7E3D\u8017\u6642\u5F8C\u7684\u50B3\u8F38\u8207\u6392\u968A\u6642\u9593\u3002"><span>\u50B3\u8F38\uFF0F\u6392\u968A</span><strong>${r(l?ge(d):"\u2014")}</strong></span>
      <span class="index-runtime-metric" title="\u672C\u6B21\u8F09\u5165\u8017\u6642\u6700\u9577\u7684\u968E\u6BB5\uFF0C\u4E5F\u5C31\u662F\u76EE\u524D\u6700\u660E\u986F\u7684\u74F6\u9838\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${h?.label||"\u2014"} \xB7 ${ge(h?.duration_ms||0)}`)}</strong></span>
      <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${c(i.length-k)} / ${c(i.length)}${k?` \xB7 \u5931\u6557 ${c(k)}`:""}</strong></span>
      <span class="index-runtime-metric" title="\u672C\u6B21\u6458\u8981\u7684\u7522\u751F\u6642\u9593\u3002"><span>\u66F4\u65B0\u6642\u9593</span><strong>${r(n.finished_at?Se(n.finished_at):"\u2014")}</strong></span>
    </div>
    <div class="status-wf-chart">
      <div class="rag-wf-axis"><span>0 ms</span><span>${r(ge(o))}</span></div>
      <div class="rag-wf-stages">${M}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u5BE6\u969B\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0Cbar \u9577\u5EA6\u70BA\u8A72\u968E\u6BB5\u8017\u6642\u5360\u6BD4\uFF1B\u6A19\u793A\u300C\u6700\u6162\u300D\u7684\u968E\u6BB5\u5373\u672C\u6B21\u8F09\u5165\u74F6\u9838\u3002\u9EDE\u64CA\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u3001\u5360\u6BD4\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function Ld(e){return`<div class="home-source-error">${m("alert",16)}<span>${r(e)}</span></div>`}function jd(){let e=kd.map(Sd).join("");return`<section class="page home-page" id="home-page">
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
              ${m("sparkles",16)}<span>\u958B\u59CB\u6AA2\u7D22</span>
            </button>
          </div>
          <div class="home-ask-help" id="home-ask-help">
            <span><kbd>Enter</kbd> \u9001\u51FA</span>
            <span><kbd>Shift</kbd> + <kbd>Enter</kbd> \u63DB\u884C</span>
            <span>\u9001\u51FA\u5F8C\u5728 RAG \u63D0\u554F\u4E2D\u958B\u555F</span>
          </div>
        </form>
        <div class="home-hero-meta">
          <span>${m("shield",13)}\u5F15\u7528\u53EF\u8FFD\u6EAF</span>
          <span>${m("database",13)}\u6CD5\u898F\uFF0B\u547D\u4EE4\uFF0B\u5224\u6C7A</span>
          <span>${m("activity",13)}Pipeline waterfall</span>
        </div>
      </div>
      <aside class="home-live-card" id="home-live-card" aria-label="\u5373\u6642\u8CC7\u6599\u6458\u8981">
        <div class="home-live-head">
          <span class="home-live-kicker">LIVE DATASET</span>
          <button class="home-live-refresh" type="button" id="home-refresh" aria-label="\u91CD\u65B0\u6574\u7406\u9996\u9801\u5373\u6642\u8CC7\u6599">
            ${m("refresh",14)}
          </button>
        </div>
        <div id="home-live-body" aria-live="polite">${gn(null,{loading:!0})}</div>
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
          ${ds(null,{loading:!0})}
        </div>
        <div class="home-metric-group" id="home-law-metrics">
          ${Lr(null,{loading:!0})}
        </div>
      </div>
      <div class="home-metric-strip" id="home-metric-strip">
        ${jr(null,{loading:!0})}
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
      ${Ad()}
      <div class="home-rag-values" id="home-rag-values">
        ${Er(null,{loading:!0})}
      </div>
      ${qd()}
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
        ${mn("opendata",null)}
        ${mn("laws",null)}
      </div>
      <div id="home-laws-slot">
        ${Tr(null,{loading:!0})}
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
        ${Nr(null,{loading:!0})}
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
        <span class="home-trust-icon">${m("shield",18)}</span>
        <strong>\u4F86\u6E90\u512A\u5148</strong>
        <p>\u56DE\u7B54\u53EA\u6839\u64DA\u6AA2\u7D22\u5230\u7684\u6CD5\u898F\u3001\u547D\u4EE4\u8207\u5224\u6C7A\u7247\u6BB5\u751F\u6210\uFF0C\u5F15\u7528\u7DE8\u865F\u53EF\u56DE\u5230\u539F\u59CB\u8CC7\u6599\u3002</p>
      </div>
      <div class="home-trust-item">
        <span class="home-trust-icon">${m("server",18)}</span>
        <strong>\u672C\u6A5F\u6A21\u578B</strong>
        <p>\u900F\u904E llama-server \u4F7F\u7528\u672C\u6A5F\u6216\u5340\u7DB2\u6A21\u578B\uFF0C\u6A21\u578B\u8207\u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u90FD\u53EF\u8ABF\u6574\u3002</p>
      </div>
      <div class="home-trust-item">
        <span class="home-trust-icon">${m("layers",18)}</span>
        <strong>\u7248\u672C\u53EF\u8FFD\u6EAF</strong>
        <p>\u6CD5\u898F\u3001\u5224\u6C7A\u8207\u5411\u91CF\u7D22\u5F15\u4FDD\u7559\u7248\u672C\u8207\u66F4\u65B0\u7D00\u9304\uFF0C\u8CC7\u6599\u8B8A\u66F4\u4E0D\u6703\u9ED8\u9ED8\u6D88\u5931\u3002</p>
      </div>
    </section>
  </section>`}function Td(e,t){let s=t?.laws||{},a=t?.judgments||{},n=t?.raw||{},i=t?.rag?.judgment_index||{},o={rag:`${c(i.indexed)} \u7B46\u7D22\u5F15`,data:`${c(s.law_count)} \u6CD5\u898F \xB7 ${c(s.order_count)} \u547D\u4EE4`,quality:`${c(n.raw_total)} \u539F\u59CB\u5224\u6C7A`,processing:`${c(n.archive_count)} archive`,performance:"Flow \xB7 Waterfall",status:"10 \u670D\u52D9\u5143\u4EF6",tests:"LLM \xB7 Reranker"};e.querySelectorAll("[data-home-tile-metric]").forEach(l=>{let d=l.dataset.homeTileMetric;d&&o[d]&&(l.textContent=o[d])})}function lo(e,t,{clientMs:s=null}={}){let a=t?.data||{},n=t?.generated_at||"",i=e.querySelector("#home-live-body");i&&(i.innerHTML=gn(a,{generatedAt:n}));let o=e.querySelector("#home-judgment-stats"),l=a.judgments||{};o&&(o.innerHTML=ds({judgment_total:l.raw_total,financial_total:l.financial_total,financial_ratio:l.financial_ratio}));let d=e.querySelector("#home-law-metrics");d&&(d.innerHTML=Lr(a));let u=e.querySelector("#home-metric-strip");u&&(u.innerHTML=jr(a));let h=e.querySelector("#home-rag-values");h&&(h.innerHTML=Er(a));let y=e.querySelector("#home-source-grid");y&&(y.innerHTML=`${mn("opendata",a)}${mn("laws",a)}`);let v=e.querySelector("#home-laws-slot");if(v){let w=!!v.querySelector("#home-laws")?.open;v.innerHTML=Tr(a);let M=v.querySelector("#home-laws");M&&w&&(M.open=!0)}let p=e.querySelector("#home-waterfall-slot");p&&(p.innerHTML=Nr({...a,pipeline:t?.pipeline},{clientMs:s})),Td(e,a)}function Ed(e,t){let s=e.querySelector("#home-live-body");s&&(s.innerHTML=gn(null,{error:t}));let a=e.querySelector("#home-judgment-stats");a&&(a.innerHTML=ds(null));let n=e.querySelector("#home-law-metrics");n&&(n.innerHTML=Lr(null));let i=e.querySelector("#home-metric-strip");i&&(i.innerHTML=jr(null));let o=e.querySelector("#home-rag-values");o&&(o.innerHTML=Er(null,{error:t}));let l=e.querySelector("#home-source-grid");l&&(l.innerHTML=Ld(t));let d=e.querySelector("#home-laws-slot");d&&(d.innerHTML=Tr(null,{error:t}));let u=e.querySelector("#home-waterfall-slot");u&&(u.innerHTML=Nr(null,{error:t}))}async function Nd(e,t){let s=!1,a=!1,n=!1,i=null,o=null,l=null,d=null,u=0;e.innerHTML=jd();let h=e.querySelector("#home-ask-form"),y=e.querySelector("#home-question"),v=e.querySelector("#home-refresh"),p=()=>{let f=String(y?.value||"").trim().slice(0,500);if(!f){y?.focus();return}try{window.sessionStorage.setItem("judgment.pending_question",f)}catch{}window.__judgmentPendingQuestion=f,t&&typeof t.navigate=="function"?t.navigate("rag"):window.location.hash="#/rag"},b=()=>{y&&(y.style.height="auto",y.style.height=`${Math.min(y.scrollHeight,140)}px`)},w=f=>{v&&(v.disabled=f,v.classList.toggle("is-loading",f),v.setAttribute("aria-busy",f?"true":"false"))},M=async({quiet:f=!1}={})=>{if(s)return;if(a){n=!0;return}if(a=!0,u=Date.now(),w(!0),!f){let V=e.querySelector("#home-live-body");V&&(V.innerHTML=gn(null,{loading:!0}))}let T=performance.now();try{let V=await G.homeSummary();if(s||!e.isConnected)return;o=V?.data||null,l=V?.data?.financial_laws||null,cs(oo,V),lo(e,V,{clientMs:Math.round(performance.now()-T)})}catch(V){if(s||!e.isConnected)return;Ed(e,V.message||"\u7121\u6CD5\u53D6\u5F97\u9996\u9801\u5373\u6642\u8CC7\u6599\u3002")}finally{a=!1,w(!1),n&&!s&&(n=!1,M({quiet:!0}))}};y?.addEventListener("input",b),h?.addEventListener("submit",f=>{f.preventDefault(),p()}),y?.addEventListener("keydown",f=>{f.key==="Enter"&&!f.shiftKey&&!f.isComposing&&(f.preventDefault(),p())});let k=()=>{if(s||d)return;let f=Math.max(0,_d-(Date.now()-u));if(f===0){M({quiet:!0});return}d=window.setTimeout(()=>{d=null,s||M({quiet:!0})},f)};e.addEventListener("click",f=>{if(f.target.closest("#home-refresh")||f.target.closest("#home-retry")){d&&(window.clearTimeout(d),d=null),M();return}if(f.target.closest("#home-laws-download")){let T=l?.content||`${(l?.laws||[]).join(`
`)}
`;T.trim()&&Xt("\u91D1\u878D\u6CD5\u898F.md",T)}}),e.addEventListener("toggle",f=>{let T=f.target.closest?.("[data-home-wf-stage]");if(!T||!e.contains(T))return;let V=T.dataset.homeWfStage||"";V&&(T.open?pn.add(V):pn.delete(V))},!0),b(),y?.focus({preventScroll:!0});let S=bs(oo,300*1e3);if(S?(o=S?.data||null,l=S?.data?.financial_laws||null,lo(e,S,{clientMs:0}),M({quiet:!0})):await M(),!s)try{i=Et("processing",(f,T)=>{s||T?.initial||k()},{onError:()=>{}})}catch{i=null}return()=>{s=!0,d&&(window.clearTimeout(d),d=null),typeof i=="function"&&i(),i=null}}var ii={};gs(ii,{render:()=>Ap});var uo="judgment-console";var At="query_history",os="settings",ls="audit_events";var pt={history:[],settings:new Map,audit:[],nextId:1},fn=null,vt=!("indexedDB"in window);function Gt(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function Ht(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function Qt(){return fn||(fn=new Promise((e,t)=>{if(!("indexedDB"in window)){vt=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(uo,2)}catch(a){vt=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(At)){let n=a.createObjectStore(At,{keyPath:"id",autoIncrement:!0});n.createIndex("created_at","created_at"),n.createIndex("kind","kind")}if(a.objectStoreNames.contains(os)||a.createObjectStore(os,{keyPath:"key"}),!a.objectStoreNames.contains(ls)){let n=a.createObjectStore(ls,{keyPath:"key"});n.createIndex("created_at","created_at"),n.createIndex("dataset","dataset"),n.createIndex("jid","jid"),n.createIndex("issue_month","issue_month")}},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{vt=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{vt=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),fn)}function po(){return"indexedDB"in window}function mo(){return vt}function wa(){return vt?"memory":"indexeddb"}function Rd(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},turns:Array.isArray(e.turns)?e.turns:[],pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t,updated_at:e.updated_at||t}}async function Cd(){try{let t=(await Qt()).transaction(At,"readwrite"),s=t.objectStore(At),a=await Gt(s.count());if(a>120){let n=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let d=i.result;if(!d||n<=0){o();return}d.delete(),n-=1,d.continue()},i.onerror=()=>l(i.error)})}await Ht(t)}catch{vt=!0}}async function _a(e){let t=Rd(e);try{let a=(await Qt()).transaction(At,"readwrite"),n=a.objectStore(At),i=await Gt(n.add(t));return await Ht(a),await Cd(),i}catch{vt=!0;let a=pt.nextId++;return pt.history.push({id:a,...t}),pt.history.length>120&&pt.history.shift(),a}}async function ka(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let n=(await Qt()).transaction(At,"readwrite"),i=n.objectStore(At),o=await Gt(i.get(s));if(!o)return await Ht(n),null;let l={...o,...t,id:s};return await Gt(i.put(l)),await Ht(n),l}catch{vt=!0;let n=pt.history.findIndex(i=>Number(i.id)===s);return n===-1?null:(pt.history[n]={...pt.history[n],...t,id:s},pt.history[n])}}async function go(e){let t=Number(e);if(!Number.isFinite(t))return!1;try{let a=(await Qt()).transaction(At,"readwrite");return a.objectStore(At).delete(t),await Ht(a),!0}catch{vt=!0;let a=pt.history.findIndex(n=>Number(n.id)===t);return a===-1?!1:(pt.history.splice(a,1),!0)}}async function bn({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let n=(await Qt()).transaction(At,"readonly"),i=n.objectStore(At),o=await Gt(i.getAll());return await Ht(n),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,d)=>String(d.updated_at||d.created_at).localeCompare(String(l.updated_at||l.created_at))).slice(0,t)}catch{return vt=!0,pt.history.filter(n=>s?`${n.kind} ${n.title} ${n.detail}`.toLowerCase().includes(s):!0).slice().sort((n,i)=>String(i.updated_at||i.created_at).localeCompare(String(n.updated_at||n.created_at))).slice(0,t)}}async function fo(){try{let t=(await Qt()).transaction(At,"readwrite");t.objectStore(At).clear(),await Ht(t)}catch{vt=!0}pt.history=[]}function Pd(e){let t=Number(e.id??e.event_id??0)||0,s=String(e.dataset||e.kind||"judgment"),a=String(e.key||`${s}:${t||`${Date.now()}:${Math.random().toString(36).slice(2)}`}`),n=String(e.jid||""),i=String(e.issue_month||""),o=String(e.change_type||""),l=String(e.detected_at||e.created_at||new Date().toISOString());return{key:a,event_id:t,dataset:s,jid:n,issue_month:i,change_type:o,title:String(e.title||n||i||"\u7248\u672C\u8B8A\u66F4"),detail:String(e.detail||[o,i,n].filter(Boolean).join(" \xB7 ")),created_at:l,payload:e}}async function Id(){try{let t=(await Qt()).transaction(ls,"readwrite"),s=t.objectStore(ls),a=await Gt(s.count());if(a>2e3){let n=a-2e3,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let d=i.result;if(!d||n<=0){o();return}d.delete(),n-=1,d.continue()},i.onerror=()=>l(i.error)})}await Ht(t)}catch{vt=!0}}async function bo(e){let t=(Array.isArray(e)?e:[]).filter(s=>s&&typeof s=="object").map(Pd);if(!t.length)return 0;try{let a=(await Qt()).transaction(ls,"readwrite"),n=a.objectStore(ls);for(let i of t)await Gt(n.put(i));return await Ht(a),await Id(),t.length}catch{vt=!0;let a=new Map(pt.audit.map(n=>[n.key,n]));for(let n of t)a.set(n.key,n);return pt.audit=Array.from(a.values()).sort((n,i)=>String(i.created_at).localeCompare(String(n.created_at))).slice(0,2e3),t.length}}async function ho({keyword:e="",limit:t=200}={}){let s=e.trim().toLowerCase(),a=n=>s?`${n.dataset} ${n.jid} ${n.issue_month} ${n.change_type} ${n.detail}`.toLowerCase().includes(s):!0;try{let i=(await Qt()).transaction(ls,"readonly"),o=i.objectStore(ls),l=await Gt(o.getAll());return await Ht(i),l.filter(a).sort((d,u)=>String(u.created_at).localeCompare(String(d.created_at))).slice(0,t)}catch{return vt=!0,pt.audit.filter(a).slice().sort((i,o)=>String(o.created_at).localeCompare(String(i.created_at))).slice(0,t)}}async function vo(){let e={name:uo,version:2,supported:"indexedDB"in window,mode:wa(),degraded:vt,stores:[At,os,ls],caps:{history:120,audit:2e3},usage_bytes:null,quota_bytes:null};if(typeof navigator<"u"&&navigator.storage?.estimate)try{let t=await navigator.storage.estimate();e.usage_bytes=Number.isFinite(t.usage)?t.usage:null,e.quota_bytes=Number.isFinite(t.quota)?t.quota:null}catch{}try{let s=(await Qt()).transaction([At,os,ls],"readonly"),a=Ht(s),[n,i,o]=await Promise.all([Gt(s.objectStore(At).count()),Gt(s.objectStore(os).count()),Gt(s.objectStore(ls).count()),a]);return{...e,available:!0,counts:{query_history:n,settings:i,audit_events:o},total:n+i+o}}catch{return vt=!0,{...e,available:!1,degraded:!0,mode:"memory",counts:{query_history:pt.history.length,settings:pt.settings.size,audit_events:pt.audit.length},total:pt.history.length+pt.settings.size+pt.audit.length}}}async function Sa(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let n=(await Qt()).transaction(os,"readwrite");return n.objectStore(os).put(s),await Ht(n),s}catch{return vt=!0,pt.settings.set(s.key,s),s}}async function Ls(e,t=null){try{let a=(await Qt()).transaction(os,"readonly"),n=a.objectStore(os),i=await Gt(n.get(String(e)));return await Ht(a),i?i.value:t}catch{vt=!0;let a=pt.settings.get(String(e));return a?a.value:t}}async function $o({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await Qt()).transaction(os,"readonly"),n=a.objectStore(os),i=await Gt(n.getAll());return await Ht(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return vt=!0,Array.from(pt.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function yo(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var Yr={};gs(Yr,{buildFlowWaterfallStages:()=>ll,render:()=>ep,renderRagPipelineWaterfall:()=>jn,renderTestFlowPanel:()=>ra,renderWaterfallStages:()=>Ln});var Dd={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},Bd=new Set(["running","stopping"]);function $n(e){let[t,s]=Dd[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${r(t)}</span>`}function hn(e){return String(e).padStart(2,"0")}function aa(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${hn(t.getMonth()+1)}-${hn(t.getDate())} ${hn(t.getHours())}:${hn(t.getMinutes())}`}function vn(e){return Bd.has(e)}function $s(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function Ds(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function js(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${r(e)}</span>
    <strong>${r(String(t))}</strong>
    ${s?`<small>${r(s)}</small>`:""}
  </div>`}function wo(e={}){let t=e.score_components||e,s=e.gate||{},a=String(s.status||""),n=a==="pass"?"Gate \u901A\u904E":a==="fail"?"Gate \u5931\u6557":a==="no_data"?"Gate \u7121\u8CC7\u6599":"";return`${n?`<span class="badge ${a==="pass"?"badge-ok":a==="fail"?"badge-danger":"badge-neutral"}">${r(n)}</span>`:""}<div class="bench-metrics">
    ${js("Law Recall",Ds(t.law_recall))}
    ${js("Article Recall",Ds(t.article_recall))}
    ${js("Citation Valid",Ds(t.citation_valid_rate))}
    ${js("Judge",$s(t.judge_overall))}
    ${js("Human",$s(t.human_overall))}
    ${js("p50",ge(e.duration_p50_ms))}
    ${js("p95",ge(e.duration_p95_ms))}
    ${js("Success",`${c(e.success||0)} / ${c(e.total||0)}`)}
  </div>`}function _o(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${r(s.replace(/^rag\./,""))}</span>
      <strong>${ge(a.p50_ms)}</strong>
      <small>p95 ${ge(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function ko(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${Ds(s.law_recall)}</span>
    <span>Article ${Ds(s.article_recall)}</span>
    <span>Judge ${$s(s.judge_overall)}</span>
    <span>p95 ${ge(t.duration_p95_ms)}</span>`}function So(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function xo(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${r(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${r(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${r(e.status||"")}">${$n(e.status)}</span>
      <span class="mono">${r(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${r(Se(e.started_at))}</span>
      <span data-bench-slot="run-completed">${c(e.completed_cases||0)} / ${c(e.total_cases||0)} \u984C</span>
      <span>${r(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${r(So(e))}">${ko(e)}</span>
  </button>`}function Pr(e,t=[]){let s=e.metrics||{},a=e.judge||{},n=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([u])=>u.startsWith("rag.")).map(([u,h])=>`<span class="chip">${r(u)} ${ge(h)}</span>`).join(""),d=(e.law_sources||[]).map(u=>`<span class="chip">${r(u.law_name||"\u6CD5\u898F")} ${c((u.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${r(e.question)}</span>
      ${$n(e.status)}
      <span class="bench-case-time">${ge(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${$s(i.deterministic)} \xB7 Judge ${$s(i.judge)} \xB7 Human ${$s(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${r((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${r(e.fingerprint||"")}">${m("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
      </div>
      <div class="bench-case-stages">${l||'<span class="qb-muted">\u6C92\u6709 stage timing</span>'}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${Ds(s.law_recall)}</span>
        <span>Article recall ${Ds(s.article_recall)}</span>
        <span>Citation ${s.citation_valid?"valid":"invalid"}</span>
        <span>Refusal ${s.refusal_correct===null?"\u2014":s.refusal_correct?"correct":"wrong"}</span>
      </div>
      <div class="chips">${d||'<span class="qb-muted">\u6C92\u6709\u6CD5\u898F\u4F86\u6E90</span>'}</div>
      <div class="bench-answer"><strong>\u56DE\u7B54</strong><p>${r(e.answer||"\u2014")}</p></div>
      <div class="bench-judge"><strong>LLM judge</strong><p>${r(a.rationale||a.reason||"\u2014")}</p><span>${[["correctness",a.correctness],["grounding",a.grounding],["citation",a.citation],["clarity",a.clarity],["overall",a.overall]].map(([u,h])=>`${u} ${h??"\u2014"}`).join(" \xB7 ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${e.id}">
        <div class="bench-human-grid">
          ${[["correctness","\u6B63\u78BA\u6027",n.scores?.correctness??4],["grounding","\u6709\u64DA\u6027",n.scores?.grounding??4],["citation","\u5F15\u7528",n.scores?.citation??4],["clarity","\u6E05\u695A",n.scores?.clarity??4],["overall","\u6574\u9AD4",n.overall??4]].map(([u,h,y])=>Ya({name:`score_${u}`,label:h,value:y})).join("")}
        </div>
        <label class="field"><span class="field-label">\u4EBA\u5DE5\u6279\u6CE8</span><input class="input" name="comment" value="${r(n.comment||"")}" placeholder="\u56DE\u7B54\u54C1\u8CEA\u3001\u5F15\u7528\u6216\u4E8B\u5BE6\u932F\u8AA4" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${m("check",13)}<span>\u5132\u5B58\u4EBA\u5DE5\u8A55\u5206</span></button>
      </form>
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(u=>`<div class="bench-history-row"><span>${r(Se(u.run?.started_at))}</span><span>${r(u.run?.config?.llm_model||"\u2014")}</span><span>Det ${$s(u.metrics?.scores?.deterministic)}</span><span>Judge ${$s(u.metrics?.scores?.judge)}</span><span>Human ${$s(u.metrics?.scores?.human)}</span><span>${ge(u.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function Cr(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function Ao(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${Pr(e,t)}
  </details>`}function qo(e){return`${$n(e.status)}
    <span class="mono">${r(e.run_id)}</span>
    ${vn(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${m("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function Fd(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${r(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${m("activity",14)}${r(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${r((e.status||"")+":"+e.run_id)}">
        ${qo(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${wo(e.summary||{})}</div>
    <div data-bench-detail="stages">${_o(e.summary||{})}</div>
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
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>Ao(a,t[a.fingerprint]||[])).join(""):Ge({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function Mo(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${m("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${m("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function Lo(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),n=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,n-i):0,l=(t||[]).filter(b=>["success","failed"].includes(b.status)).map(b=>Number(b.duration_ms)||0).filter(b=>b>0),d=null;if(l.length)d=l.reduce((b,w)=>b+w,0)/l.length;else if(a>0){let b=Date.parse(e.updated_at||""),w=Number.isFinite(b)?b:i;Number.isFinite(w)&&w>i?d=(w-i)/a:o>0&&(d=o/a)}let u=(t||[]).find(b=>b.status==="running")||null,h=0;if(a<s&&d&&d>0){let b=u?Date.parse(u.started_at||""):NaN,w=Date.parse(e.updated_at||""),M=Number.isFinite(b)?b:w;Number.isFinite(M)&&(h=Math.max(0,Math.min(.95,(n-M)/d)))}let y=Math.min(s,a+h),v=s>0?Math.max(0,Math.min(100,y/s*100)):0,p=d===null?null:Math.max(0,s-y)*d;return{total:s,completed:a,elapsedMs:o,averageMs:d,progress:v,etaMs:p,ratePerMin:d?6e4/d:null,running:u}}function jo(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${ge(e)}`}function To(e,t=[]){let s=Lo(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${r(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${c(s.completed)} / ${c(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${jo(s.etaMs)}</span>
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
  </div>`}function Od(e){let t=e.models?.models||{},s=e.suites||[],a=xa(e),n=e.selectedRun;return`<section class="report-card bench-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("brain",14)}RAG Benchmark</span>
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
        ${Mo(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${r(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?To(a,Ir(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>xo(i,n?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${n?Fd(n,e.history):""}
  </section>`}function xa(e){let t=(e.runs||[]).find(s=>vn(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!vn(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function Ir(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function Eo(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:aa(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",refreshStream:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),n=L=>{let q=new FormData(L);return{label:String(q.get("label")||"").trim()||aa(),embedding_model:String(q.get("embedding_model")||""),llm_model:String(q.get("llm_model")||""),judge_model:String(q.get("judge_model")||""),top_k:Number(q.get("top_k")||4),score_threshold:Number(q.get("score_threshold")||.35),repeats:Number(q.get("repeats")||1),enable_law_retrieval:L.elements.enable_law_retrieval?.checked??!0,judge_enabled:L.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(L=>`${L.id}:${L.name}:${L.item_count}:${L.version}:${L.status}`)]:null,runs:(s.runs||[]).map(L=>`${L.run_id}:${L.label||""}:${L.suite_version||1}`)}),o=()=>{let q=a()?.querySelector("[data-bench-live]"),E=xa(s);if(!q||!E)return;let K=Lo(E,Ir(s,E)),de=(Te,B)=>{let qe=q.querySelector(`[data-bench-slot="${Te}"]`);qe&&qe.textContent!==B&&(qe.textContent=B)};de("progress-count",`${c(K.completed)} / ${c(K.total)} \u984C`),de("progress-percent",`${K.progress.toFixed(1)}%`),de("progress-eta",jo(K.etaMs)),de("progress-rate",K.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${K.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),de("progress-elapsed",`\u5DF2\u57F7\u884C ${ge(K.elapsedMs)}`),de("progress-average",K.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${ge(K.averageMs)}\uFF0F\u984C`),de("progress-state",E.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let H=q.querySelector('[data-bench-slot="progress-bar"]');H&&(H.setAttribute("aria-valuenow",K.progress.toFixed(1)),H.classList.toggle("is-waiting",K.completed===0));let ie=q.querySelector('[data-bench-slot="progress-fill"]');ie&&(ie.style.width=`${K.progress.toFixed(2)}%`)},l=L=>{let q=L.querySelector("[data-bench-actions]");if(!q)return;let E=xa(s),K=E?`${E.run_id}:${E.status}`:"";q.dataset.signature!==K&&(q.dataset.signature=K,q.innerHTML=Mo(E))},d=L=>{let q=L.querySelector("[data-bench-live-wrap]");if(!q)return;let E=xa(s),K=E?`${E.run_id}:${E.status}:${E.total_cases}`:"";q.dataset.signature!==K&&(q.dataset.signature=K,q.innerHTML=E?To(E,Ir(s,E)):"")},u=L=>{let q=L.querySelector("[data-bench-runs]");if(!q)return;let E=s.runs||[],K=[...q.querySelectorAll("[data-run-id]")].map(H=>H.dataset.runId),de=E.map(H=>H.run_id);if(K.join("|")!==de.join("|")){q.innerHTML=E.length?E.map(H=>xo(H,s.selectedRun?.run_id===H.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let H of E){let ie=q.querySelector(`[data-run-id="${H.run_id}"]`);if(!ie)continue;ie.classList.toggle("is-active",s.selectedRun?.run_id===H.run_id);let Te=ie.querySelector('[data-bench-slot="run-label"]');Te&&Te.textContent!==(H.label||"RAG Benchmark")&&(Te.textContent=H.label||"RAG Benchmark");let B=ie.querySelector('[data-bench-slot="run-status"]');B&&B.dataset.status!==(H.status||"")&&(B.dataset.status=H.status||"",B.innerHTML=$n(H.status));let qe=ie.querySelector('[data-bench-slot="run-completed"]');if(qe){let Ie=`${c(H.completed_cases||0)} / ${c(H.total_cases||0)} \u984C`;qe.textContent!==Ie&&(qe.textContent=Ie)}let ae=ie.querySelector('[data-bench-slot="run-scores"]'),Le=So(H);ae&&ae.dataset.signature!==Le&&(ae.dataset.signature=Le,ae.innerHTML=ko(H))}},h=L=>{let q=s.selectedRun;if(!q)return;let E=L.querySelector(`.bench-detail[data-run-id="${q.run_id}"]`);if(!E)return;let K=E.querySelector("[data-bench-detail-actions]");if(K){let ae=`${q.status||""}:${q.run_id}`;K.dataset.signature!==ae&&(K.dataset.signature=ae,K.innerHTML=qo(q))}let de=E.querySelector('[data-bench-detail="metrics"]');if(de){let ae=JSON.stringify(q.summary||{});de.dataset.signature!==ae&&(de.dataset.signature=ae,de.innerHTML=wo(q.summary||{}))}let H=E.querySelector('[data-bench-detail="stages"]');if(H){let ae=JSON.stringify((q.summary||{}).stages||{});H.dataset.signature!==ae&&(H.dataset.signature=ae,H.innerHTML=_o(q.summary||{}))}let ie=E.querySelector("[data-bench-cases]");if(!ie)return;let Te=q.cases||[];if(!Te.length)return;let B=ie.querySelector(".notice");B&&B.remove();let qe=new Map([...ie.querySelectorAll("details.bench-case")].map(ae=>[Number(ae.dataset.resultId),ae]));for(let ae of Te){let Le=s.history[ae.fingerprint]||[],Ie=Cr(ae,Le),Ee=qe.get(Number(ae.id));if(!Ee){ie.insertAdjacentHTML("beforeend",Ao(ae,Le)),Ee=ie.lastElementChild,Ee&&(Ee._benchSignature=Ie);continue}if(Ee._benchSignature===Ie||!s.forcedCaseIds.delete(Number(ae.id))&&Ee.contains(document.activeElement))continue;let le=Ee.open;Ee.innerHTML=Pr(ae,Le),Ee.open=le,Ee._benchSignature=Ie}},y=()=>{xa(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},v=()=>{let L=a();L&&(l(L),d(L),u(L),h(L),o(),y())},p=L=>{let q=s.selectedRun;if(!q)return;let E=L.querySelector('[data-bench-detail="metrics"]');E&&(E.dataset.signature=JSON.stringify(q.summary||{}));let K=L.querySelector('[data-bench-detail="stages"]');K&&(K.dataset.signature=JSON.stringify((q.summary||{}).stages||{}));let de=L.querySelector("[data-bench-cases]");if(!de)return;let H=new Map((q.cases||[]).map(ie=>[Number(ie.id),ie]));for(let ie of de.querySelectorAll("details.bench-case")){let Te=H.get(Number(ie.dataset.resultId));Te&&(ie._benchSignature=Cr(Te,s.history[Te.fingerprint]||[]))}},b=(L=!1)=>{let q=a();if(!q)return;let E=i();if(!L&&s.renderSignature===E){v();return}s.renderSignature=E,s.forcedCaseIds.clear(),q.innerHTML=Od(s),p(q),v()},w=async({refreshAll:L=!1,runs:q=null}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||L;return}s.loading=!0;try{if(!s.referenceLoaded||L){let[B,qe]=await Promise.all([G.benchmarkModels(),G.benchmarkSuites()]);s.models=B,s.suites=qe.suites||[],s.indexVersion=B.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=B.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=B.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(B.models?.llm||[]).find(ae=>ae!==s.config.llm_model)||"")}let E=q?{runs:q}:await G.benchmarkRuns(30);s.runs=E.runs||[];let K=s.activeRunId,de=s.runs.find(B=>vn(B.status))||null;s.activeRunId=de?.run_id||"";let H=s.selectedRun?.run_id||"";H||(H=de?.run_id||s.runs[0]?.run_id||"");let ie=!!(s.selectedRun&&K&&s.selectedRun.run_id===K);H&&(!s.selectedRun||s.selectedRun.run_id!==H||H===de?.run_id||ie)?s.selectedRun=await G.benchmarkRun(H,!0):H||(s.selectedRun=null),s.loaded=!0,b()}catch(E){if(!s.loaded){s.renderSignature="";let K=a();K&&(K.innerHTML=Ge({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:r(E.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let E=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,w({refreshAll:E})}}},M=()=>{s.refreshStream||(s.refreshStream=Et("benchmark",(L,q)=>{s.loading||w({runs:q?.snapshot?.runs||null})}))},k=async L=>{try{s.selectedRun=await G.benchmarkRun(L,!0),b()}catch(q){N(q.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},S=async L=>{!s.labelTouched&&L.elements.label&&(L.elements.label.value=aa());let q=n(L);s.config=q;let E=Number(L.elements.suite_id?.value||0);if(!E){N("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await G.startBenchmarkRun({suite_id:E,config:q,actor:"anonymous"}),N("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=aa(),s.labelTouched=!1,await w()}catch(K){N(K.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},f=async L=>{try{await G.stopBenchmarkRun(L),N("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await w()}catch(q){N(q.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},T=async L=>{let q=Number(L.dataset.resultId||0),E=new FormData(L),K={};for(let de of["correctness","grounding","citation","clarity","overall"]){let H=Number(E.get(`score_${de}`));Number.isFinite(H)&&(K[de]=H)}try{await G.reviewBenchmarkResult(q,{reviewer:"anonymous",scores:K,comment:String(E.get("comment")||"")}),N("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await G.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(q)),b()}catch(de){N(de.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},V=async L=>{if(L)try{let q=await G.benchmarkFingerprintHistory(L,50);s.history[L]=q.cases||[];let E=s.selectedRun,K=a();if(!E||!K)return;let de=(E.cases||[]).filter(H=>H.fingerprint===L);for(let H of de){let ie=K.querySelector(`details.bench-case[data-result-id="${H.id}"]`);if(!ie)continue;let Te=ie.open;ie.innerHTML=Pr(H,s.history[L]),ie.open=Te,ie._benchSignature=Cr(H,s.history[L])}}catch(q){N(q.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},Q=async L=>{let q=L.target.closest("[data-bench-action]");if(!q)return;let E=q.dataset.benchAction;E==="open-run"?await k(q.dataset.runId||""):E==="stop"?await f(q.dataset.runId||""):E==="fingerprint-history"&&await V(q.dataset.fingerprint||"")},fe=async L=>{let q=L.target.closest("[data-bench-form]");q&&(L.preventDefault(),q.dataset.benchForm==="run"?await S(q):q.dataset.benchForm==="human"&&await T(q))},ve=L=>{L&&(L.elements.label&&L.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=n(L),L.elements.suite_id&&(s.selectedSuiteId=Number(L.elements.suite_id.value)||s.selectedSuiteId))},se=L=>{let q=L.target.closest('[data-bench-form="run"]');q&&ve(q)};return e.addEventListener("click",Q),e.addEventListener("submit",fe),e.addEventListener("input",se),e.addEventListener("change",se),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=aa();let L=a()?.querySelector('input[name="label"]');L&&(L.value=s.config.label)}M(),w({refreshAll:!s.referenceLoaded})},refresh(){return M(),w({refreshAll:!0})},destroy(){e.removeEventListener("click",Q),e.removeEventListener("submit",fe),e.removeEventListener("input",se),e.removeEventListener("change",se),s.refreshStream&&s.refreshStream(),s.refreshStream=null,s.tickTimer&&window.clearInterval(s.tickTimer)}}}var Gr={};gs(Gr,{exportCsv:()=>xn,exportableResult:()=>An,render:()=>Su,renderReport:()=>_n,reportError:()=>Sn,reportLoading:()=>Aa});var Fo=[10,25,50,100],No=500,Hd=["law_name","law_level","law_category","law_modified_date","article_count"],zd=["jid","court_normalized","title","jdate","matched_laws","citation_count"],Ud={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function kn(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function yn(e,t){let s={};for(let a of e.fields||[]){let n=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?n:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{},fuzzyTerms:[]}}function Gd(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,n]of Object.entries(s))if(Array.isArray(n)&&!n.map(String).includes(String(t[a]??"")))return!1;return!0}function Ur(e,t){return(e.fields||[]).filter(s=>Gd(s,t))}function Qd(e,t){return`filter-${e.id}-${t}`}function Bs(e){return e==null?"":r(String(e))}function Dr(e,t,s){let a=s[t.key],n=Qd(e,t.key),i=t.help?`<span class="field-help">${r(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(d=>`<option value="${Bs(d.value)}" ${String(d.value)===String(a??"")?"selected":""}>${r(d.label??d.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${n}" name="${r(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),d=(t.options||[]).map(u=>`<label class="multi-option">
          <input type="checkbox" name="${r(t.key)}" value="${Bs(u.value)}" ${l.has(String(u.value))?"checked":""} />
          <span>${r(u.label??u.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${d}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${n}" name="${r(t.key)}"
        value="${Bs(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${Bs(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${n}" name="${r(t.key)}"
        value="${Bs(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${n}" name="${r(t.key)}"
      value="${Bs(a)}"
      placeholder="${Bs(t.placeholder||"")}" />
    ${i}
  </div>`}function Ro(e,t,{focusTable:s=!1}={}){let a=Ur(e,t.values),n=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(n.push(`<div class="field-row">${Dr(e,o,t.values)}${Dr(e,l,t.values)}</div>`),i+=1):n.push(Dr(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
    <div class="filter-block">
      <div class="filter-head">
        <span class="filter-title">Metadata \u689D\u4EF6</span>
        <button class="filter-reset" type="button" data-action="reset">\u91CD\u8A2D</button>
      </div>
      <div class="filter-fields">${n.join("")}</div>
    </div>
    <div class="sidebar-actions">
      <button class="btn btn-primary" type="submit" id="run-query" ${s?'data-focus-table="true"':""}>
        ${m("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
      </button>
    </div>
  </form>`}function wn(e,t,s){let a={...s.values};for(let n of Ur(t,a))if(n.type==="checkbox"){let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=!!i?.checked}else if(n.type==="multiselect")a[n.key]=Array.from(e.querySelectorAll(`[name="${n.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=i?i.value:""}return a}function Oo(e,t){let s={};for(let a of Ur(e,t.values)){let n=t.values[a.key];a.type==="checkbox"?s[a.key]=!!n:a.type==="multiselect"?s[a.key]=Array.isArray(n)?n:[]:a.type==="number"?s[a.key]=n===""||n===null?"":Number(n):s[a.key]=n??""}return s}function Br(e,t){let s=Oo(e,t);return Array.isArray(t.fuzzyTerms)&&t.fuzzyTerms.length&&(s.keywords=[...t.fuzzyTerms]),(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function Wd(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${Ge({tone:t,title:`${kn(e)} ${Yt(e.status).label}`,text:r(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function Jd(e,t){return`<label class="field data-source-field">
    <span class="field-label">\u8CC7\u6599\u4F86\u6E90</span>
    <select class="select" name="database">
      ${e.map(s=>{let a=Yt(s.status);return`<option value="${r(s.id)}" ${s.id===t?"selected":""}>${r(s.label)} \xB7 ${r(a.label)}</option>`}).join("")}
    </select>
  </label>`}function Co(e,t){return`<nav class="data-nav" aria-label="\u8CC7\u6599\u67E5\u8A62\u529F\u80FD">
    ${[{id:"law",label:"\u67E5\u8A62\u6CD5\u898F\u547D\u4EE4",hint:"Fuzzy \u6CD5\u898F\u540D\u7A31\u3001\u985E\u5225\u8207\u547D\u4EE4",icon:"file"},{id:"judgment",label:"\u67E5\u8A62\u5224\u6C7A",hint:"Fuzzy \u6CD5\u9662\u3001\u6848\u865F\u8207\u6848\u7531",icon:"layers"},{id:"schema",label:"\u8CC7\u6599\u5EAB Schema",hint:"\u8CC7\u6599\u8868\u3001\u6B04\u4F4D\u8207\u9810\u89BD",icon:"table"}].map(a=>{let n=a.id==="schema"?t==="schema":t==="query"&&e===a.id;return`<button class="data-nav-item${n?" is-active":""}" type="button"
          data-action="data-nav" data-tab="${a.id}" ${n?'aria-current="page"':""}>
          <span class="data-nav-icon">${m(a.icon,15)}</span>
          <span class="data-nav-copy">
            <strong>${r(a.label)}</strong>
            <small>${r(a.hint)}</small>
          </span>
        </button>`}).join("")}
  </nav>`}function Vd(e,t,s){if(t.id!=="postgres"&&t.id!=="parquet")return"";let a=Array.isArray(s.fuzzyTerms)?s.fuzzyTerms:[],n=e==="law"?"Fuzzy \u6CD5\u898F\uFF0F\u547D\u4EE4":"Fuzzy \u5224\u6C7A",i=e==="law"?"\u8F38\u5165\u6CD5\u898F\u540D\u7A31\u6216\u76F8\u8FD1\u5B57\u2026":"\u8F38\u5165\u6CD5\u9662\u3001\u6848\u865F\u3001\u6848\u7531\u6216\u76F8\u8FD1\u5B57\u2026";return`<div class="data-fuzzy" data-data-fuzzy data-fuzzy-kind="${e}">
    <div class="data-fuzzy-head">
      <span class="filter-title">${n}</span>
      <span class="field-tag">\u591A\u689D\u4EF6 AND</span>
    </div>
    <div class="data-fuzzy-row">
      <div class="data-fuzzy-values">
        ${a.length?a.map(o=>`<span class="chip data-fuzzy-chip">${r(o)}<button class="data-fuzzy-remove" type="button" data-action="remove-fuzzy-term" data-term="${r(o)}" aria-label="\u79FB\u9664 ${r(o)}">${m("x",9)}</button></span>`).join(""):`<span class="data-fuzzy-placeholder">${i}</span>`}
      </div>
      <button class="data-fuzzy-add" type="button" data-action="open-fuzzy" aria-label="\u52A0\u5165 fuzzy \u689D\u4EF6" aria-haspopup="listbox">${m("plus",13)}</button>
    </div>
    <div class="data-fuzzy-popover" data-data-fuzzy-popover hidden>
      <input class="input" type="search" data-data-fuzzy-search placeholder="${i}" autocomplete="off" />
      <div class="data-fuzzy-results" data-data-fuzzy-results role="listbox" aria-live="polite"></div>
    </div>
  </div>`}function Fr(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],n=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function Kd(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||r(e.detail||"")}function Yd(e){return`<div class="report-empty">
    ${xt({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:r({postgres:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u6CD5\u898F\u6216\u5224\u6C7A\u689D\u4EF6\uFF0C\u518D\u8996\u9700\u8981\u5C55\u958B\u9032\u968E metadata \u689D\u4EF6\u3002",parquet:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u689D\u4EF6\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\uFF1B\u53EF\u5C55\u958B\u9032\u968E\u689D\u4EF6\u8ABF\u6574\u6B04\u4F4D\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
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
  </div>`}function Aa(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(kn(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function Sn(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(kn(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Ge({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Xd(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,n=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${r(s.label||"\u672A\u5206\u985E")}">${r(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${n.toFixed(1)}%"></span></span>
          <span class="dist-value">${c(a)}</span>
        </div>`}).join("")}
  </div>`}function Ho(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function Zd(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function eu(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function tu(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${r(String(t))}"
    title="\u6AA2\u8996\u300C${r(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${r(String(t))}${m("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var su={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function au(e,t,s,a=!1,n=!0,i=!1){let o=a?e.key:e.label||e.key,l=n?t?su[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${r(o)}</th>`;let d=s?.key===l,u=d?s.direction:null,h=u==="asc"?"ascending":u==="desc"?"descending":"none",y=u==="asc"?"\u2191":u==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${h}">
    <button class="table-sort${d?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${r(l)}"
      title="\u4F9D${r(o)}\u6392\u5E8F">
      <span>${r(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${y}</span>
    </button>
  </th>`}function nu(e,t){if(!Ho(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,n=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(n||""),lawName:String(t.law_name||"")}}function ru(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${r(s.lawKey)}"
    data-law-source="${r(s.sourceType)}"
    data-law-name="${r(s.lawName)}"
    title="\u6AA2\u8996\u300C${r(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(String(a))}${m("chevronRight",12,"law-link-icon")}</button>`}function zo(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:n=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],d=(e.page-1)*e.page_size,u=Ho(e),h=Zd(e),y=eu(e),v=e.meta?.sort||null,p=n?`<tr class="schema-search-row">
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
      <span class="muted" style="font-size:10px">${c(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${u?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":h?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":y?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${p}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(b=>au(b,h,v,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((b,w)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${d+w+1}</td>
                ${o.map(M=>{if((h||y)&&M.key==="jid")return`<td class="cell-jid">${tu(b)}</td>`;let k=u&&M.key==="law_name"?nu(e,b):null;if(k)return`<td>${ru(b,M,k)}</td>`;let f={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[M.type];return`<td${f?` class="${f}"`:""}>${Ka(b[M.key],M.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${xt({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function iu(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Fo.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${m("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${m("chevronRight",13)}</button>
    </div>
  </div>`}function Uo(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${r(t)}</div>`).join("")}</div>`}function _n(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],n=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",d=e.status||"ok",u=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${r(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${r(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${r(e.label||l)}
          ${at(d)}
          <span class="chip">${r(u)}</span>
        </div>
        <div class="report-sub">
          ${c(i)} \u7B46\u7B26\u5408 \xB7
          ${ge(e.duration_ms)} \xB7
          ${r(String(l).toUpperCase())} / ${r(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${m("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${m("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${Ge({tone:d==="not_configured"?"info":d==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:""}

    ${a.length?`<div class="summary-strip">
            ${a.slice(0,4).map(h=>`<div class="summary-item">
                  <div class="summary-label">${r(h.label)}</div>
                  <div class="summary-value">${r(h.value)}</div>
                </div>`).join("")}
          </div>`:""}

    <div class="report-grid">
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u7D50\u679C\u5206\u5E03</span>
          <span class="muted" style="font-size:9.5px">${n.length} groups</span>
        </div>
        ${Xd(n)}
      </div>
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5BE6\u969B\u67E5\u8A62\u8A9E\u53E5</span>
          <span class="muted" style="font-size:9.5px">${r(e.database==="indexeddb"?"client-side":"read-only")}</span>
        </div>
        <div class="query-box">
          <pre class="query-code">${r(o||"\u2014")}</pre>
          <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
            ${m("copy",12)}<span>\u8907\u88FD</span>
          </button>
        </div>
        ${Uo(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?zo(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?iu({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function Po(e){return`<div class="report-card schema-preview">
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
  </div>`}function Or(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let n=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${Ge({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
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
    ${zo({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${Uo(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${c(i.length)} \u7B46</span>
      <strong>\u5171 ${c(e.total)} \u7B46</strong>
    </div>
  </div>`}function Io(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${r(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${Ge({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function ou(e){return`<div class="report-empty">
    ${xt({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${kn(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function Hr(e){return e.is_current===!0?at("ok","\u73FE\u884C"):e.law_abandon_note?at("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?at("empty","\u6B77\u53F2\u7248\u672C"):at("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function gt(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${r(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function Fs(e){return e?Ut(e):"\u2014"}function lu(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function zr(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${r(e)}</span>
    </div>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </div>`:""}function cu(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${r(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${m("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </details>`:""}function du(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let n=a?.name||a?.url||"";return n?a.url?`<a class="law-attachment" href="${r(Ft(a.url))}" target="_blank" rel="noopener noreferrer">
          ${m("file",12)}<span>${r(n)}</span>${m("external",11)}
        </a>`:`<span class="law-attachment">${m("file",12)}<span>${r(n)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${c(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function Go(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function uu(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,n=s?`${c(a)} \u689D \xB7 ${c(s)} \u7AE0\u7BC0`:`${c(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${r(l)}</div>`;let d=Ud[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${r(Go(o.article_no))}">
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
  </div>`}function pu(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function na(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${m("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function mu(e){return`<div class="law-report">
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
  </div>`}function gu(e,t){return`<div class="law-report">
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
  </div>`}function fu(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let n=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",n,a.article_count_for_law?`${c(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${r(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${r(i)}</option>`}).join("")}
    </select>
  </label>`}function bu(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let n={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${n[o]} ${c(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">\u7248\u672C\u8B8A\u66F4</span>
      <span class="muted">${r(i)}</span>
    </summary>
    <div class="law-version-change-list">
      ${a.length?a.slice(0,20).map(o=>{let l=o.change_type==="added"?"badge-ok":o.change_type==="removed"?"badge-danger":"badge-warn",d=o.before_content?`<details><summary>\u8B8A\u66F4\u524D</summary><pre>${r(o.before_content)}</pre></details>`:"",u=o.after_content?`<details><summary>\u8B8A\u66F4\u5F8C</summary><pre>${r(o.after_content)}</pre></details>`:"";return`<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${l}">${r(n[o.change_type]||o.change_type)}</span>
                    <strong>${r(o.article_no||o.article_key)}</strong>
                  </div>
                  ${d}${u}
                </div>`}).join(""):'<div class="report-empty-inline">\u6B64\u7248\u672C\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u8B8A\u66F4\u3002</div>'}
      ${e.changes_truncated?'<div class="report-empty-inline">\u50C5\u986F\u793A\u524D 20 \u7B46\u8B8A\u66F4\uFF1BAPI \u56DE\u50B3\u4E0A\u9650 200 \u7B46\u3002</div>':""}
    </div>
  </details>`}function hu(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let n=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(w=>w.article_type!=="C").length,l=lu(e),d=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",u=e.meta?.snapshot||"",h=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",y=[l,d,h,u].filter(Boolean).join(" \xB7 "),v=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",p=e.version||{},b=[gt("\u6CD5\u898F\u4F4D\u968E",r(e.law_level||"\u2014")),gt("\u6CD5\u898F\u985E\u5225",r(e.law_category||"\u2014")),gt("\u7570\u52D5\u65E5\u671F",Fs(e.law_modified_date)),gt("\u751F\u6548\u65E5\u671F",Fs(e.law_effective_date)),gt("\u689D\u6587\u6578",c(e.article_count)),gt("\u8CC7\u6599\u72C0\u614B",Hr(e)),gt("\u82F1\u8B6F\u540D\u7A31",r(e.eng_law_name||"\u2014")),gt("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${r(e.law_key||"\u2014")}</span>`)];return p.first_seen_version_id!==null&&p.first_seen_version_id!==void 0&&b.push(gt("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${r(p.first_seen_version_id)}`)),p.last_seen_version_id!==null&&p.last_seen_version_id!==void 0&&b.push(gt("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${r(p.last_seen_version_id)}`)),p.last_seen_at&&b.push(gt("\u6700\u5F8C\u6536\u9304\u6642\u9593",r(Se(p.last_seen_at)))),p.selected_version_id!==null&&p.selected_version_id!==void 0&&b.push(gt("\u689D\u6587\u7248\u672C",`#${r(p.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
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
            ${Hr(e)}
            <span class="chip">${r(v)}</span>
          </div>
          <div class="report-sub">
            ${r([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${c(e.article_count)} \u689D \xB7 \u7570\u52D5 ${Fs(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${fu(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">${m("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
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
          <div class="summary-value">${Fs(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${r(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${Hr(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${r(l)}</span>
        </div>
        <div class="law-meta-grid">${b.join("")}</div>
      </div>

      ${bu(e)}
      ${zr("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${cu("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${zr("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${zr("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${du(e.attachments)}
      ${uu(e)}
    </div>
    ${o>100?pu():""}
  </div>`}function vu(e){return`<div class="law-report judgment-report">
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
  </div>`}function $u(e,t){return`<div class="law-report judgment-report">
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
  </div>`}function yu(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${r(t)}"
    data-law-source=""
    data-law-name="${r(t)}"
    title="\u6AA2\u8996\u300C${r(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(t)}${m("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function wu(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let n=String(s.article_no||"").trim();n&&t.get(a).add(n)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${yu(s)}
          <span class="judgment-citation-articles">${[...a].map(n=>r(n)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function _u(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",n=String(e.full_text||""),i=Number(e.full_text_length)||n.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[gt("\u6848\u865F",r(e.jid||"\u2014")),gt("\u5E74\u5EA6",r(e.jyear||"\u2014")),gt("\u5B57\u5225",r(e.jcase||"\u2014")),gt("\u865F\u78BC",r(e.jno||"\u2014")),gt("\u6CD5\u9662",r(e.court||"\u2014")),gt("\u6848\u7531",r(e.title||"\u2014")),gt("\u88C1\u5224\u65E5\u671F",Fs(e.jdate)),gt("\u4F86\u6E90\u58D3\u7E2E\u6A94",r(e.source_archive||"\u2014")),gt("\u5168\u6587\u9577\u5EA6",`${c(i)} \u5B57`),gt("\u5F15\u7528\u6578",c(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(gt("\u532F\u5165 Run",`#${r(e.import_run_id)}`)),`<div class="law-report judgment-report">
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
            ${r(e.court||"\u2014")} \xB7 ${Fs(e.jdate)} \xB7
            ${c(i)} \u5B57
          </div>
        </div>
        <div class="report-actions">
          ${e.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(e.pdf_url)}" target="_blank" rel="noopener noreferrer">${m("external",14)}<span>PDF</span></a>`:""}
        </div>
      </div>

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u88C1\u5224\u65E5\u671F</div>
          <div class="summary-value">${Fs(e.jdate)}</div>
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
        ${wu(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${c(i)} \u5B57</span>
        </div>
        ${n?`<div class="judgment-fulltext">${r(n)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function Do(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function xn(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(Do).join(",")],n=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([n+o+1,...t.map(l=>i[l.key])].map(Do).join(","))}),`\uFEFF${a.join(`\r
`)}`}function An(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,n]of Object.entries(t))a.startsWith("_")||(s[a]=n);return s})}}function ku(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function Bo(e,t){let s=performance.now(),a=Oo(e,t),n=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,d=[],u=[],h=[],y=[];if(n==="audit_events"){try{let f=Number(await Ls("audit.last_event_id",0))||0,T=await G.versioningAudit({since_id:f,limit:500}),V=Array.isArray(T?.events)?T.events:[];V.length&&await bo(V.map(fe=>({...fe,dataset:"judgment"})));let Q=Number(T?.latest_event_id||0);Q>f&&await Sa("audit.last_event_id",Q)}catch(f){d.push(`\u7248\u672C audit \u540C\u6B65\u5931\u6557\uFF1A${f.message||f}`)}u=(await ho({keyword:i,limit:No})).map(f=>({created_at:f.created_at,dataset:f.dataset,issue_month:f.issue_month,change_type:f.change_type,jid:f.jid,detail:f.detail})),h=[{key:"created_at",label:"\u6642\u9593",type:"datetime"},{key:"dataset",label:"\u8CC7\u6599\u96C6",type:"text"},{key:"issue_month",label:"\u6708\u4EFD",type:"mono"},{key:"change_type",label:"\u8B8A\u66F4",type:"status"},{key:"jid",label:"\u6848\u865F",type:"mono"},{key:"detail",label:"\u6458\u8981",type:"longtext"}];let S=new Map;u.forEach(f=>S.set(f.change_type||"unknown",(S.get(f.change_type||"unknown")||0)+1)),y=Array.from(S.entries()).map(([f,T])=>({label:f,value:T})).sort((f,T)=>T.value-f.value)}else if(n==="settings"){u=(await $o({keyword:i})).map(f=>({key:f.key,value:yo(f.value),updated_at:f.updated_at})),h=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let S=new Map;u.forEach(f=>{let T=String(f.key||"").split(".")[0]||"\u5176\u4ED6";S.set(T,(S.get(T)||0)+1)}),y=Array.from(S.entries()).map(([f,T])=>({label:f,value:T})).sort((f,T)=>T.value-f.value)}else{u=(await bn({keyword:i,limit:No})).map(f=>({kind:ku(f.kind),title:f.title,detail:f.detail,created_at:f.created_at})),h=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let S=new Map;u.forEach(f=>S.set(f.kind,(S.get(f.kind)||0)+1)),y=Array.from(S.entries()).map(([f,T])=>({label:f,value:T})).sort((f,T)=>T.value-f.value)}let v=u.length,p=(o-1)*l,b=u.slice(p,p+l),w=Math.round(performance.now()-s),M=mo();return M&&d.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:M?"degraded":"ok",message:M?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:n,columns:h,rows:b,total:v,page:o,page_size:l,duration_ms:w,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(v)},{label:"\u76EE\u524D\u9801\u9762",value:`${b.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:wa()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${w} ms`}],distribution:y,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${n}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${p}`,warnings:d,meta:{store:n,filters:a,client_side:!0}}}async function Su(e,t){let s=!1,a=null,n=[],i="law",o=null,l={},d=0,u=25,h="query",y=null,v=null,p=0,b=[],w=null,M=-1,k=0,S=0,f=null,T=null,V=null;e.innerHTML=`<section class="page data-page">
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
          ${m("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    <div class="processing-summary judgment-stats-cards" id="data-judgment-stats" aria-label="\u91D1\u878D\u6848\u4EF6\u4F54\u6BD4">
      ${ds(null,{loading:!0})}
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
  </section>`;let Q=e.querySelector("#query-sidebar"),fe=e.querySelector("#data-nav"),ve=e.querySelector("#db-options-wrap"),se=e.querySelector("#filter-area"),L=e.querySelector("#schema-area"),q=e.querySelector("#query-main"),E=e.querySelector("#schema-suggest-popover"),K=e.querySelector("#catalog-meta"),de=e.querySelector("#refresh-catalog"),H=e.querySelector("#data-judgment-stats"),ie=x=>n.find(R=>R.id===x),Te=()=>ie(i)?.databases||[],B=x=>Te().find(R=>R.id===x),qe=(x,R)=>`${x}:${R}`,ae=(x,R=i)=>l[qe(R,x.id)],Le=(x,R)=>{Sa(x,R).catch(()=>{})},Ie=()=>{if(!a){K.textContent="CATALOG \xB7 \u96E2\u7DDA",K.className="badge badge-danger badge-mono";return}let x=Te(),R=x.filter(O=>O.available).length,C=ie(i);K.textContent=`CATALOG \xB7 ${C?.label||i} \xB7 ${R}/${x.length} \u53EF\u7528`,K.className="badge badge-neutral badge-mono"},Ee=x=>{q.innerHTML=Yd(x)},Ze=()=>{let x=T?.returnScroll??V?.returnScroll;T=null,V=null;let R=B(o),C=R?ae(R):null;h==="schema"&&v?.result?q.innerHTML=Or(v.result,_e(R,v.tableId),{columnFilters:v.columnFilters||{},searchEnabled:R.id==="postgres"||R.id==="parquet"}):C?.result?q.innerHTML=_n(C.result):R&&Ee(R),typeof x=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:x,behavior:"smooth"}))},le=(x="law-article-jump")=>{let R=q.querySelector(`#${x}`),C=Go(R?.value);if(!C){N("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),R?.focus();return}let Y=[...q.querySelectorAll("[data-article-no]")].find(oe=>oe.dataset.articleNo===C);if(!Y){N(`\u627E\u4E0D\u5230\u7B2C ${C} \u689D\u3002`,"warn");return}Y.scrollIntoView({behavior:"instant",block:"center"}),Y.classList.add("is-jump-target"),window.setTimeout(()=>Y.classList.remove("is-jump-target"),2400)},ee=async({lawKey:x,sourceType:R="",lawName:C="",versionId:O=""})=>{let Y=B(o),oe=Y?ae(Y):null,me=h==="schema"?v?.result:null;if(!Y||!oe?.result&&!me||!x)return;let Fe=++d;T={seq:Fe,lawKey:x,sourceType:R,lawName:C,versionId:O?String(O):"",page:1,detail:null,database:Y.id,returnScroll:window.scrollY},V=null,q.innerHTML=mu(C||x),q.scrollIntoView({behavior:"smooth",block:"start"});try{let Oe=await G.lawDetail(x,R,T.versionId);if(s||!T||T.seq!==Fe)return;T.detail=Oe,T.page=1,q.innerHTML=hu(Oe,{database:T.database,lawPage:T.page})}catch(Oe){if(s||!T||T.seq!==Fe)return;q.innerHTML=gu(Oe,C||x),N(Oe.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},Me=async({jid:x})=>{let R=B(o),C=R?ae(R):null,O=h==="schema"?v?.result:null;if(!R||!C?.result&&!O||!x)return;let Y=++d;T=null;let oe=R.id==="parquet"?"parquet":"postgres";V={seq:Y,jid:x,detail:null,database:R.id,source:oe,returnScroll:window.scrollY},q.innerHTML=vu(x),q.scrollIntoView({behavior:"smooth",block:"start"});try{let me=await G.judgmentDetail(x,oe);if(s||!V||V.seq!==Y)return;V.detail=me,q.innerHTML=_u(me,{database:V.database})}catch(me){if(s||!V||V.seq!==Y)return;q.innerHTML=$u(me,x),N(me.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},ye=(x,R)=>`${i}:${x.id}:${R}`,_e=(x,R)=>(x.tables||[]).find(C=>C.id===R)?.label||R,je=(x,R,{sort:C=null,columnFilters:O={}}={})=>{let Y={column_filters:O};return x.id==="postgres"?(Y.table=R,Y.schema_preview=!0):x.id==="parquet"&&i==="judgment"?(Y.table="judgment_documents",Y.columns=zd):x.id==="parquet"&&(Y.dataset="all",Y.columns=Hd),C?.key&&(Y.sort=`${C.key}:${C.direction}`),Y},D=async(x,R,{sort:C=null,columnFilters:O={},quiet:Y=!1}={})=>{if(!R)return;ot();let oe=ye(x,R),me=++p,Fe=!!(Y&&v?.result&&v.key===oe);y={tableId:R},v={key:oe,tableId:R,loading:!0,result:null,error:null,sort:C,columnFilters:O},Fe?q.setAttribute("aria-busy","true"):(L.innerHTML=Fr(x,ie(i)?.label||i,R),q.innerHTML=Po(_e(x,R)));try{let Oe;if(x.id==="indexeddb"){let Be=yn(x,10);Be.values.store=R,Be.page=1,Oe=await Bo(x,Be)}else x.id==="qdrant"?Oe={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:R,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(Oe=await G.query({database:x.id,filters:je(x,R,{sort:C,columnFilters:O}),page:1,pageSize:10}),C?.key&&(Oe.meta={...Oe.meta||{},sort:C}));if(s||me!==p)return;v={key:oe,tableId:R,loading:!1,result:Oe,error:null,sort:C,columnFilters:O},q.removeAttribute("aria-busy"),h==="schema"&&y?.tableId===R&&(L.innerHTML=Fr(x,ie(i)?.label||i,R),q.innerHTML=Or(Oe,_e(x,R),{columnFilters:O,searchEnabled:x.id==="postgres"||x.id==="parquet"}))}catch(Oe){if(s||me!==p)return;v={key:oe,tableId:R,loading:!1,result:null,error:Oe,sort:C,columnFilters:O},q.removeAttribute("aria-busy"),h==="schema"&&y?.tableId===R&&(q.innerHTML=Io(Oe,_e(x,R)))}},F=()=>{let x=B(o);if(!x)return null;if(h==="schema"&&v?.result)return{db:x,tableId:v.tableId,columnFilters:v.columnFilters||{},sort:v.sort||null,mode:"schema"};let R=x?ae(x):null,C=R?.result;return C&&(x.id==="postgres"||x.id==="parquet")?{db:x,tableId:C.table,columnFilters:R.columnFilters||{},sort:R.sort||null,mode:"query"}:null},W=(x,R,C)=>{if(!x)return;let O=`${x.db.id}:${x.tableId}:${R}`,Y=P.get(O);Y&&(window.clearTimeout(Y),P.delete(O)),ot();let oe={...x.columnFilters||{}},me=String(C||"").trim();if(me?oe[R]=me:delete oe[R],x.mode==="schema"){D(x.db,x.tableId,{sort:x.sort,columnFilters:oe,quiet:!0});return}let Fe=ae(x.db);Fe.columnFilters=oe,Fe.page=1,We(1)},P=new Map,z=()=>{(!E||E.hidden)&&!b.length&&!w||(k+=1,b=[],w=null,M=-1,E&&(E.hidden=!0,E.innerHTML=""))},J=(x,R)=>{let C=String(x||""),O=C.toLocaleLowerCase(),Y=String(R||"").toLocaleLowerCase(),oe=new Array(C.length).fill(!1),me=(Ke,it)=>{for(let Ye=Ke;Ye<Ke+it;Ye+=1)Ye>=0&&Ye<oe.length&&(oe[Ye]=!0)},Fe=O.indexOf(Y);if(Fe>=0)for(;Fe>=0;)me(Fe,Y.length),Fe=O.indexOf(Y,Fe+Y.length);else{let Ke=[];for(let it of Y.match(/[一-鿿]{2,}/g)||[])for(let Ye=0;Ye<it.length-1;Ye+=1)Ke.push(it.slice(Ye,Ye+2));Ke.push(...Y.match(/[a-z0-9]+/g)||[]);for(let it of Ke){let Ye=O.indexOf(it);for(;Ye>=0;)me(Ye,it.length),Ye=O.indexOf(it,Ye+it.length)}}let Oe="",Be=0;for(;Be<C.length;)if(oe[Be]){let Ke=Be;for(;Ke<C.length&&oe[Ke];)Ke+=1;Oe+=`<mark>${r(C.slice(Be,Ke))}</mark>`,Be=Ke}else{let Ke=Be;for(;Ke<C.length&&!oe[Ke];)Ke+=1;Oe+=r(C.slice(Be,Ke)),Be=Ke}return Oe||r(C)},$e=(x,R)=>{if(!E)return;let C=x.getBoundingClientRect(),O=Math.min(420,Math.max(220,C.width)),Y=Math.min(360,34+R*30),oe=C.bottom+4;oe+Y>window.innerHeight-8&&(oe=Math.max(8,C.top-Y-4));let me=Math.min(window.innerWidth-O-8,Math.max(8,C.left));E.style.width=`${O}px`,E.style.left=`${me}px`,E.style.top=`${oe}px`},De=x=>{if(!E)return;let R=[...E.querySelectorAll(".schema-suggest-item")];R.length&&(M=Math.max(0,Math.min(R.length-1,x)),R.forEach((C,O)=>{C.classList.toggle("is-active",O===M)}),R[M].scrollIntoView({block:"nearest"}))},et=x=>{let R=b[x],C=w;!R||!C||(z(),W(C,C.column,R))},ft=async(x,R,C,O)=>{if(!x||!C.trim()){z();return}let Y=++k;w={...x,column:R,input:O},M=-1;try{let oe=await G.schemaSuggest({database:x.db.id,table:x.tableId,column:R,query:C,limit:1e3});if(Y!==k||document.activeElement!==O||!E)return;let me=Array.isArray(oe.values)?oe.values:[];if(b=me,!me.length){z();return}let Fe=Number(oe.total)>me.length?`\u5171 ${c(oe.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${c(me.length)} \u500B`:`\u5171 ${c(oe.total)} \u500B\u7B26\u5408`;E.innerHTML=`<div class="schema-suggest-head">${r(Fe)}</div>${me.map((Oe,Be)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${Be}"
            title="${r(Oe)}">${J(Oe,C)}</button>`).join("")}`,$e(O,me.length),E.hidden=!1}catch{z()}},ot=()=>{let x=document.activeElement;x instanceof HTMLElement&&x.matches("[data-schema-search]")&&x.blur(),z()},nt=(x,{resetReport:R=!1}={})=>{ot();let C=ae(x);if(fe.innerHTML=Co(i,h),ve.innerHTML=Jd(Te(),x.id),h==="schema")se.hidden=!0,se.innerHTML="",L.hidden=!1,L.innerHTML=`<div class="schema-category-switch" role="tablist" aria-label="Schema \u985E\u5225">
        ${["law","judgment"].map(O=>{let Y=n.find(oe=>oe.id===O);return Y?`<button class="chip${i===O?" is-active":""}" type="button" role="tab" aria-selected="${i===O}" data-action="schema-category" data-category="${O}">${r(Y.label)}</button>`:""}).join("")}
      </div>${Fr(x,ie(i)?.label||i,y?.tableId||"")}`;else{L.hidden=!0,L.innerHTML="",se.hidden=!1;let O=Vd(i,x,C),Y=Ro(x,C);se.innerHTML=`${Wd(x)}${O?`${O}<details class="data-advanced"><summary>\u9032\u968E metadata \u689D\u4EF6</summary>${Y}</details>`:Y}<div class="sidebar-note">${Kd(x)}</div>`}if(Ie(),h==="schema"){let O=y?ye(x,y.tableId):"";if(v&&v.key===O){let Y=_e(x,v.tableId);v.loading?q.innerHTML=Po(Y):v.error?q.innerHTML=Io(v.error,Y):q.innerHTML=Or(v.result,Y,{columnFilters:v.columnFilters||{},searchEnabled:x.id==="postgres"||x.id==="parquet"})}else q.innerHTML=ou(x);return}R?Ee(x):C.result?q.innerHTML=_n(C.result):Ee(x)},Ue=(x,{persist:R=!0,resetReport:C=!1}={})=>{let O=Te(),Y=O.find(me=>me.id===x)||O[0];if(!Y)return;T=null,V=null,y=null,v=null,p+=1,o=Y.id;let oe=qe(i,Y.id);l[oe]||(l[oe]=yn(Y,u)),nt(Y,{resetReport:C}),R&&(Le(`data.last_database.${i}`,Y.id),Le("data.last_category",i))},ue=(x,{persist:R=!0,resetReport:C=!0,databaseId:O=null}={})=>{let Y=ie(x)||n[0];if(!Y)return;i=Y.id,T=null,V=null;let oe=Y.databases||[],me=O&&oe.find(Fe=>Fe.id===O)||oe.find(Fe=>Fe.id===o)||oe[0];if(o=me?.id||null,!me){fe.innerHTML=Co(i,h),ve.innerHTML=`<div class="sidebar-notice">${Ge({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,se.innerHTML="",Ie();return}Ue(me.id,{persist:!1,resetReport:C}),R&&(Le("data.last_category",Y.id),Le(`data.last_database.${Y.id}`,me.id))},rt=x=>{let R=ae(x),C=se.querySelector("#data-filter-form");C&&(R.values=wn(C,x,R))},We=async(x=null,{quiet:R=!1}={})=>{let C=B(o);if(!C)return;ot();let O=ae(C);rt(C),x!==null&&(O.page=x),(!Number.isFinite(O.page)||O.page<1)&&(O.page=1);let Y=++d;T=null,V=null;let oe=q.querySelector(".report-card"),me=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!oe?q.setAttribute("aria-busy","true"):(q.removeAttribute("aria-busy"),q.innerHTML=Aa(C));let Oe=se.querySelector("#run-query");R||Re(Oe,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Be;if(C.id==="indexeddb"?Be=await Bo(C,O):Be=await G.query({database:C.id,filters:Br(C,O),page:O.page,pageSize:O.pageSize}),s||Y!==d)return;if(Be.meta={...Be.meta||{},column_filters:O.columnFilters||{},searchable:C.id==="postgres"||C.id==="parquet",sort:O.sort||Be.meta?.sort||null},O.result=Be,O.page=Number(Be.page)||O.page,O.pageSize=Number(Be.page_size)||O.pageSize,q.removeAttribute("aria-busy"),q.innerHTML=_n(Be),me!==null){let it=q.querySelector("[data-page-size]");it&&(it.value=String(O.pageSize),it.focus({preventScroll:!0}))}let Ke=ie(i)?.label||i;await _a({kind:"data",title:`${Ke} \xB7 ${C.label} \xB7 ${Be.table||Be.label||"query"}`,detail:`${c(Be.total)} \u7B46 \xB7 ${ge(Be.duration_ms)}`,payload:{category:i,database:C.id,filters:Br(C,O),page:O.page,page_size:O.pageSize}}),Le("data.last_query",{category:i,database:C.id,filters:Br(C,O),page:O.page,page_size:O.pageSize,at:new Date().toISOString()})}catch(Be){if(s||Y!==d)return;q.removeAttribute("aria-busy"),q.innerHTML=Sn(Be,C),N(Be.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&Y===d&&Re(Oe,!1)}},mt=(x,R)=>{let C=x?.querySelector("[data-data-fuzzy-results]");C&&(C.innerHTML=R.length?R.map(O=>`<button class="data-fuzzy-option" type="button" role="option" data-action="select-fuzzy-term" data-term="${r(O.value)}"><span>${r(O.label||O.value)}</span><small>${r(O.meta||"")}</small></button>`).join(""):'<div class="data-fuzzy-empty">\u6C92\u6709\u76F8\u8FD1\u7D50\u679C\uFF1B\u6309 Enter \u53EF\u76F4\u63A5\u52A0\u5165\u76EE\u524D\u8F38\u5165\u7684\u95DC\u9375\u5B57\u3002</div>')},wt=async(x,R="")=>{if(!x)return;let C=B(o),O=C?ae(C):null;if(!O)return;let Y=x.dataset.fuzzyKind||i,oe=x.querySelector("[data-data-fuzzy-results]"),me=++S;oe&&(oe.innerHTML='<div class="data-fuzzy-loading"><span class="spinner"></span><span>\u641C\u5C0B\u76F8\u8FD1\u7D50\u679C\u2026</span></div>');try{let Fe=await G.dataSuggest({kind:Y,query:R,limit:12});if(me!==S)return;let Oe=(Fe.suggestions||[]).filter(Be=>!O.fuzzyTerms.includes(Be.value));mt(x,Oe)}catch(Fe){if(me!==S)return;oe&&(oe.innerHTML=`<div class="data-fuzzy-empty">${r(Fe.message||"\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},ne=(x,{focus:R=!1}={})=>{if(!x)return;let C=x.querySelector("[data-data-fuzzy-popover]"),O=x.querySelector("[data-data-fuzzy-search]");!C||!O||(C.hidden&&(C.hidden=!1,O.value="",wt(x,"")),R&&(O.focus(),O.select()))},he=x=>{f&&(window.clearTimeout(f),f=null);let R=x?.querySelector("[data-data-fuzzy-popover]");R&&(R.hidden=!0)},tt=async x=>{let R=B(o);if(!R)return;let C=ae(R),O=String(x||"").trim();!O||C.fuzzyTerms.includes(O)||(C.fuzzyTerms=[...C.fuzzyTerms,O],he(se.querySelector("[data-data-fuzzy]")),nt(R),await We(1))},Qe=async x=>{let R=B(o);if(!R)return;let C=ae(R),O=String(x||"").trim();C.fuzzyTerms=C.fuzzyTerms.filter(Y=>Y!==O),nt(R),await We(1)},Bt=async()=>{de.disabled=!0,Re(de,!0,"\u6574\u7406\u4E2D\u2026");try{let x=bs("judgment.catalog.v1",6e5),[R,C,O,Y,oe]=await Promise.all([x?Promise.resolve(x):G.catalog(),Ls("data.last_category","law"),Ls("data.last_database.law","postgres"),Ls("data.last_database.judgment","postgres"),Ls("data.page_size",25)]);if(s)return;x||cs("judgment.catalog.v1",R),a=R,H&&(H.innerHTML=ds(a.judgment_stats)),n=Array.isArray(a.categories)?a.categories:[],u=Fo.includes(Number(oe))?Number(oe):25;for(let Ke of n)for(let it of Ke.databases||[]){let Ye=qe(Ke.id,it.id);l[Ye]||(l[Ye]=yn(it,u))}let me=n.find(Ke=>Ke.id===C)||n[0];if(!me){fe.innerHTML="",ve.innerHTML=`<div class="sidebar-notice">${Ge({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let Fe=me.id==="judgment"?Y:O;if(i=me.id,o=null,ue(me.id,{persist:!1,resetReport:!0,databaseId:Fe}),s)return;let Oe=B(o),Be=Oe?ae(Oe):null;Oe&&Be&&h==="query"&&!Be.result&&(Oe.id==="postgres"||Oe.id==="parquet")&&We(1),N("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(x){if(s)return;a=null,n=[],fe.innerHTML="",H&&(H.innerHTML=ds(null)),Ie(),ve.innerHTML=`<div class="sidebar-notice">${Ge({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:r(x.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${m("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,q.innerHTML=`<div class="report-empty">${xt({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(de.disabled=!1,Re(de,!1))}};Q.addEventListener("change",x=>{let R=x.target;if(R.name==="category"){ue(R.value);return}if(R.name==="database"){Ue(R.value);let oe=B(o),me=oe?ae(oe):null;oe&&me&&!me.result&&h==="query"&&(oe.id==="postgres"||oe.id==="parquet")&&We(1);return}let C=B(o);if(!C)return;let O=ae(C),Y=se.querySelector("#data-filter-form");!Y||!R.name||(O.values=wn(Y,C,O),O.page=1,R.name==="table"&&(T=null,V=null,O.sort=null,O.columnFilters={},O.result=null,se.innerHTML=Ro(C,O),Ee(C)))}),Q.addEventListener("input",x=>{let R=x.target.closest("[data-data-fuzzy-search]");if(R){let oe=R.closest("[data-data-fuzzy]");f&&window.clearTimeout(f),f=window.setTimeout(()=>{wt(oe,R.value)},160);return}let C=B(o);if(!C)return;let O=se.querySelector("#data-filter-form");if(!O||!x.target.name||x.target.name==="table")return;let Y=ae(C);Y.values=wn(O,C,Y)}),Q.addEventListener("keydown",x=>{let R=x.target.closest("[data-data-fuzzy-search]");if(!R)return;let C=R.closest("[data-data-fuzzy]");if(x.key==="Escape")x.preventDefault(),he(C),R.blur();else if(x.key==="Enter"){x.preventDefault();let O=C?.querySelector("[data-action='select-fuzzy-term']");O?O.click():tt(R.value)}else x.key==="ArrowDown"&&(x.preventDefault(),C?.querySelector("[data-action='select-fuzzy-term']")?.focus())}),Q.addEventListener("mouseover",x=>{let R=x.target.closest("[data-action='open-fuzzy']");R&&ne(R.closest("[data-data-fuzzy]"))}),Q.addEventListener("mouseout",x=>{let R=x.target.closest("[data-data-fuzzy]");R&&(x.relatedTarget&&R.contains(x.relatedTarget)||he(R))}),Q.addEventListener("submit",x=>{x.target.id==="data-filter-form"&&(x.preventDefault(),We(1))}),Q.addEventListener("click",async x=>{let R=se.querySelector("[data-data-fuzzy] [data-data-fuzzy-popover]:not([hidden])")?.closest("[data-data-fuzzy]");R&&!x.target.closest("[data-data-fuzzy]")&&he(R);let C=x.target.closest("[data-action]"),O=C?.dataset.action;if(O==="data-nav"){let Y=C.dataset.tab,oe=B(o);if(Y==="schema"){if(h!=="schema"){if(oe){let Be=ae(oe),Ke=se.querySelector("#data-filter-form");Ke&&(Be.values=wn(Ke,oe,Be))}h="schema",oe&&nt(oe)}return}let me=Y==="judgment"?"judgment":"law";h==="schema"&&(h="query"),i!==me?ue(me,{databaseId:o,resetReport:!1}):oe&&nt(oe);let Fe=B(o),Oe=Fe?ae(Fe):null;Fe&&Oe&&!Oe.result&&(Fe.id==="postgres"||Fe.id==="parquet")&&We(1);return}if(O==="open-fuzzy"){ne(C.closest("[data-data-fuzzy]"),{focus:!0});return}if(O==="select-fuzzy-term"){await tt(C.dataset.term);return}if(O==="remove-fuzzy-term"){await Qe(C.dataset.term);return}if(O==="schema-category"){h="schema",ue(C.dataset.category||"law",{resetReport:!0});return}if(O==="select-schema-table"){let Y=B(o);if(!Y)return;D(Y,C.dataset.tableId||"");return}if(O==="reset"){let Y=B(o);if(!Y)return;T=null,V=null;let oe=ae(Y);l[qe(i,Y.id)]=yn(Y,oe.pageSize),nt(Y),Ee(Y),N("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}x.target.closest("#catalog-retry")&&Bt()}),q.addEventListener("input",x=>{let R=x.target.closest("[data-schema-search]");if(!R)return;let C=F();if(!C)return;let O=R.dataset.schemaSearch||"",Y=R.value,oe=`${C.mode}:${C.db.id}:${C.tableId}:${O}`,me=P.get(oe);if(me&&window.clearTimeout(me),!Y.trim()){P.delete(oe),z(),W(C,O,"");return}let Fe=window.setTimeout(()=>{P.delete(oe),ft(C,O,Y,R)},250);P.set(oe,Fe)}),q.addEventListener("keydown",x=>{let R=x.target.closest("[data-schema-search]");if(!R)return;let C=F();if(C){if(x.key==="Escape"){z();return}if(x.key==="ArrowDown"||x.key==="ArrowUp"){if(!E||E.hidden)return;x.preventDefault();let O=x.key==="ArrowDown"?1:-1;De(M<0?O>0?0:b.length-1:M+O);return}if(x.key==="Enter"){if(x.preventDefault(),E&&!E.hidden&&M>=0){et(M);return}W(C,R.dataset.schemaSearch||"",R.value)}}}),E?.addEventListener("mousedown",x=>{x.preventDefault()}),E?.addEventListener("click",x=>{let R=x.target.closest("[data-schema-suggest-index]");R&&et(Number(R.dataset.schemaSuggestIndex))});let $t=x=>{x.target.closest("[data-schema-search]")||E?.contains(x.target)||z()};return document.addEventListener("click",$t),window.addEventListener("scroll",z,{capture:!0,passive:!0}),window.addEventListener("resize",z),q.addEventListener("keydown",x=>{x.target.matches(".law-jump-input")&&x.key==="Enter"&&(x.preventDefault(),le(x.target.id))}),q.addEventListener("click",async x=>{let R=x.target.closest("[data-action]");if(!R)return;let C=R.dataset.action,O=B(o),Y=O?ae(O):null,oe=Y?.result;if(C==="back-to-results"){Ze();return}if(C==="open-law"){ee({lawKey:R.dataset.lawKey||"",sourceType:R.dataset.lawSource||"",lawName:R.dataset.lawName||""});return}if(C==="open-judgment"){Me({jid:R.dataset.jid||""});return}if(C==="jump-article"){le(R.dataset.jumpInput||"law-article-jump");return}if(C==="sort-column"){let me=R.dataset.sortKey||"";if(!me||!O)return;if(h==="schema"&&v?.result){let Be=v.sort,Ke=me==="jdate"||me==="law_modified_date"||me==="article_count"||me==="citation_count"||me==="full_text_length"||me==="created_at"||me==="updated_at",it=Be?.key===me?Be.direction==="asc"?"desc":"asc":Ke?"desc":"asc";D(O,v.tableId,{sort:{key:me,direction:it},columnFilters:v.columnFilters||{},quiet:!0});return}if(!Y)return;let Fe=Y.sort,Oe=Fe?.key===me?Fe.direction==="asc"?"desc":"asc":me==="jdate"?"desc":"asc";Y.sort={key:me,direction:Oe},We(1,{quiet:!0});return}if(C==="retry"){We(Y?.page||1);return}if(oe){if(C==="prev-page"){We(Math.max(1,Number(oe.page)-1),{quiet:!0});return}if(C==="next-page"){let me=Math.max(1,Math.ceil(Number(oe.total)/Number(oe.page_size)));We(Math.min(me,Number(oe.page)+1),{quiet:!0});return}if(C==="copy-query"){let me=await xs(oe.query_text||"");N(me?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",me?"ok":"warn");return}if(C==="export-json"){let me=`${oe.database}-${oe.table||"query"}-page-${oe.page}.json`;Xt(me,JSON.stringify(An(oe),null,2),"application/json;charset=utf-8"),N(`\u5DF2\u532F\u51FA ${me}`,"ok");return}if(C==="export-csv"){let me=`${oe.database}-${oe.table||"query"}-page-${oe.page}.csv`;Xt(me,xn(oe),"text/csv;charset=utf-8"),N(`\u5DF2\u532F\u51FA ${me}`,"ok")}}}),q.addEventListener("change",x=>{let R=x.target.closest("[data-action='select-law-version']");if(R&&T){ee({lawKey:T.lawKey,sourceType:T.sourceType,lawName:T.lawName,versionId:R.value});return}if(!x.target.matches("[data-page-size]"))return;let C=B(o);if(!C)return;let O=ae(C);O.pageSize=Number(x.target.value)||25,O.page=1,Le("data.page_size",O.pageSize),We(1,{quiet:!0})}),de.addEventListener("click",()=>{Bt()}),await Bt(),t&&typeof t.setTitle=="function"&&t.setTitle(It),()=>{s=!0,f&&window.clearTimeout(f);for(let x of P.values())window.clearTimeout(x);P.clear(),z(),document.removeEventListener("click",$t),window.removeEventListener("scroll",z,{capture:!0}),window.removeEventListener("resize",z)}}var Zo=[10,25,50,100],xu=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function Qr(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function Au(e,t=e){return`<option value="${r(e)}">${r(t)}</option>`}function qa(e,t,s,a,n=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${r(t)}</span>
      <span class="field-tag">${r(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${r(e)}">
      ${Au("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${r(i)}" ${String(i)===String(a)?"selected":""}>${r(i)}</option>`).join("")}
    </select>
    ${n?`<span class="field-help">${r(n)}</span>`:""}
  </div>`}function qu(e,t){let s=xu.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${qa("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${qa("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${qa("model","\u6A21\u578B",e.models||[],t.model)}
    ${qa("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${qa("method","\u65B9\u6CD5",e.methods||[],t.method)}
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
    </div>`}function Qo(){let e=document.getElementById("performance-filter-form");if(!e)return Qr();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Wo(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function Jo(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),n=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${n}.${i}`}function Mu(e,t){if(!e)return"";let s=new Date(e);return Number.isNaN(s.getTime())?"":new Date(s.getTime()+Math.max(0,Number(t)||0)).toISOString()}var Lu=[{key:"parsing",label:"Parsing",hint:"\u8F38\u5165\u9577\u5EA6\u3001\u89E3\u6790\u6642\u9593",names:["rag.parse_question"],color:"#64748b"},{key:"embedding",label:"Embedding",hint:"Model\u3001Token\u3001Batch\u3001\u8017\u6642",names:["rag.embed_query"],color:"#3984c6"},{key:"qdrant",label:"Qdrant Search",hint:"Collection\u3001Filter\u3001Top K\u3001\u8017\u6642",names:["rag.qdrant_search"],color:"#d97706"},{key:"reranker",label:"Reranker",hint:"Model\u3001\u5019\u9078\u7B46\u6578\u3001\u8017\u6642",names:["rag.rerank"],color:"#8b5cf6"},{key:"context",label:"Context",hint:"Chunk \u6578\u3001Token \u6578\u3001\u8017\u6642",names:["rag.context"],fallbackNames:["rag.fetch_documents","rag.build_citations"],color:"#64748b"},{key:"llm",label:"LLM",hint:"Model\u3001Input/Output Token\u3001TTFT\u3001\u8017\u6642",names:["rag.llm_request"],color:"#16a34a"}],ju=[{key:"parsing",label:"Parsing",hint:"\u8F38\u5165\u9577\u5EA6\u3001\u89E3\u6790\u6642\u9593",names:["rag.parse_question"],color:"#64748b"},{key:"law_retrieval",label:"\u6CD5\u898F\u6AA2\u7D22\u8207\u7D71\u8A08",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u3001\u5224\u6C7A\u5F15\u7528\u7D71\u8A08",names:["rag.law_retrieval","rag.law_stats"],color:"#0ea5e9"},{key:"law_content",label:"\u6CD5\u689D\u8F09\u5165",hint:"Parquet \u689D\u6587\u8F09\u5165",names:["rag.law_content"],color:"#64748b"}],Mn={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"};function el(e){let t=e?.metadata?.rag_response||{},s=String(t.status||e?.metadata?.rag_status||e?.status||"");return s==="operational"||s==="success"?{label:"Completed",tone:"ok"}:s==="retrieval_only"?{label:"Abstain",tone:"warn"}:s==="preview"?{label:"Preview",tone:"info"}:s==="failed"||s==="error"?{label:"Failed",tone:"danger"}:{label:s||"Unknown",tone:"idle"}}function Wr(e){let t=Math.max(0,Number(e?.offset_ms)||0),s=Math.max(0,Number(e?.duration_ms)||0),a=Math.max(t,Number(e?.end_offset_ms)||t+s);return{...e,offset:t,end:a,duration:Math.max(s,a-t)}}function tl(e,t=0){let s=Array.isArray(e?.segments)?[...e.segments].sort((b,w)=>Number(b.offset_ms||0)-Number(w.offset_ms||0)):[],a=Math.max(Number(e?.total_ms)||0,Number(t)||0,...s.map(b=>Wr(b).end),1),n=String(e?.metadata?.rag_response?.answer_source||""),i=n==="structured"&&s.some(b=>b.name==="rag.law_retrieval"),l=(i?ju:Lu).map(b=>{let w=s.filter(f=>b.names.includes(f.name));!w.length&&b.fallbackNames&&(w=s.filter(f=>b.fallbackNames.includes(f.name)));let M=w.map(Wr),k=M.length?Math.min(...M.map(f=>f.offset)):null,S=M.length?Math.max(...M.map(f=>f.end)):null;return{...b,spans:M,start:k,end:S,duration:k===null?null:S-k}});for(let b of l){if(b.key!=="embedding"&&b.key!=="llm")continue;let w=[];for(let S of b.spans){let f=S.metadata||{},T=Number(f.load_duration_ms),V=Number.isFinite(T)&&T>0?T:0,Q=Math.max(0,Number(S.duration)||0);w.push({...S,offset:S.offset,end:S.offset+V,duration:V,metadata:{...f,source_stage:b.label,model_load_ms:V,request_duration_ms:Q,warm_duration_ms:Math.max(0,Q-V),cold_start:V>=100},params:{...S.params||{},source_stage:b.label}})}if(!w.length)continue;let M=w.reduce((S,f)=>S+f.duration,0),k=b.spans.reduce((S,f)=>S+Math.max(0,Number(f.duration)||0),0);b.loadInfo={spans:w,total:M,requestTotal:k,ratio:k>0?Math.min(1,Math.max(0,M/k)):0}}let d=[...l],u=Math.max(0,...d.flatMap(b=>b.spans.map(w=>w.end))),h=e?.metadata?.rag_response||{},y=el(e),v=Math.min(a,u);d.push({key:"response",label:"Response",hint:"\u7E3D\u8017\u6642\u3001\u5F15\u7528\u6578\u3001\u6210\u529F\u6216 Abstain",color:"#0f766e",spans:[{offset:v,end:a,duration:Math.max(0,a-v),status:y.tone==="danger"?"error":"ok",metadata:h,params:{},started_at:e?.started_at,finished_at:e?.finished_at}],start:v,end:a,duration:Math.max(0,a-v),responseMetadata:h});let p=Array.isArray(e?.decisions)?[...e.decisions].sort((b,w)=>Number(b.offset_ms||0)-Number(w.offset_ms||0)):[];for(let b of p){let w=b.stage==="routing"?"parsing":String(b.stage||""),M=d.find(k=>k.key===w)||d[d.length-1];M&&(Array.isArray(M.decisions)||(M.decisions=[]),M.decisions.push(b))}return Tu(d,a),{total:a,stages:d,decisions:p,decisionCount:p.length,response:h,traceStatus:y,requestId:e?.request_id||"",startedAt:e?.started_at,finishedAt:e?.finished_at,client:e?.client||{},models:Array.isArray(e?.summary?.models)?e.summary.models:[],hasLoad:d.some(b=>!!b.loadInfo),answerSource:n,structuredLaw:i}}function Tu(e,t){let s=e.reduce((i,o)=>i+Math.max(0,Number(o.duration)||0),0),a=s>0?t/s:1,n=0;for(let i of e){let o=Math.max(0,Number(i.duration)||0)*a;i.displayStart=n,i.displayDuration=o,i.displayEnd=n+o;let l=i.spans[0]||null,d=[],u=!1;if(l){let y=Math.max(0,Number(l.duration)||0),v=i.loadInfo?Math.max(0,Number(i.loadInfo.total)||0):0;if(i.loadInfo&&v>0&&i.spans.length===1&&y>0){let p=Math.min(l.end,l.offset+v),b=Math.max(0,p-l.offset),w=Math.max(0,l.end-p);if(b>0&&w>0){let M=Mu(l.started_at,b),k={...l,offset:l.offset,end:p,duration:b,finished_at:M,metadata:{...l.metadata||{},source_stage:i.label,model_load_ms:b,request_duration_ms:y,warm_duration_ms:Math.max(0,y-b),cold_start:b>=100},params:{...l.params||{},source_stage:i.label}},S={...l,offset:p,end:l.end,duration:w,started_at:M,finished_at:l.finished_at};d.push({kind:"load",label:"Model Load",span:k,duration:b}),d.push({kind:"stage",label:`${i.label} \u63A8\u8AD6`,span:S,duration:w}),u=!0}}u||d.push({kind:"stage",label:i.label,span:l,duration:y})}i.detailSegments=d;let h=[];if(l&&o>0)if(u){let[y,v]=d,p=y.duration+v.duration,b=p>0?o*(y.duration/p):0,w={...i,key:"model_load",label:`Model Load \xB7 ${i.label}`,spans:[y.span],duration:y.duration},M={...i,label:`${i.label} \u63A8\u8AD6`,spans:[v.span],duration:v.duration};h.push({offset:n,duration:b,color:"#0ea5e9",kind:"load",tip:qn(w,y.span)}),h.push({offset:n+b,duration:Math.max(0,o-b),color:i.color,kind:"stage",tip:qn(M,v.span,{includeLoad:!1})})}else h.push({offset:n,duration:o,color:i.color,kind:"stage",tip:qn(i,l)});i.displaySegments=h,n+=o}}function Jr(e,{includeLoad:t=!0}={}){let s=[],a=(h,y)=>{y==null||y===""||s.push([h,String(y)])},n=e.spans[0]||null;if(!n)return a("\u72C0\u614B","\u6B64\u7D00\u9304\u6C92\u6709\u9019\u500B span"),s;let i=n.params||{},o=n.metadata||{},l=sl(n),d=Vr(n),u=(h,y)=>{let v=Number(h?.load_duration_ms);if(!Number.isFinite(v))return;let p=Math.max(0,v);a("Model Load",ge(p)),a("\u51B7\u555F\u52D5",p>=100?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09");let b=Math.max(0,Number(y)||0);if(b>0){let w=Math.max(0,b-p);a("\u6263\u9664\u8F09\u5165\u5F8C",ge(w)),a("\u8F09\u5165\u5360\u6BD4",`${(p/b*100).toFixed(p/b>=.1?0:1)}%`)}};if(e.key==="response")return a("Trace \u72C0\u614B",e.responseMetadata.status||"\u2014"),a("Answer source",e.responseMetadata.answer_source||"\u2014"),a("Abstain",e.responseMetadata.abstain?"\u662F":"\u5426"),a("\u5F15\u7528\u7E3D\u6578",e.responseMetadata.citation_count??"\u2014"),a("\u5224\u6C7A\uFF0F\u6CD5\u898F\u5F15\u7528",`${e.responseMetadata.judgment_citations??"\u2014"} / ${e.responseMetadata.law_citations??"\u2014"}`),a("\u7E3D\u8017\u6642",ge(e.duration)),s;if(a("\u958B\u59CB",`${Jo(n.started_at)||"\u2014"} \xB7 +${n.offset.toFixed(1)} ms`),a("\u7D50\u675F",`${Jo(n.finished_at)||"\u2014"} \xB7 +${n.end.toFixed(1)} ms`),a("\u8017\u6642",ge(n.duration)),e.key==="parsing")a("\u8F38\u5165\u9577\u5EA6",o.input_length??i.input_length),a("\u6B63\u898F\u5316\u9577\u5EA6",o.normalized_length??i.normalized_length),a("\u79FB\u9664\u7A7A\u767D",o.trimmed_chars);else if(e.key==="embedding")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.active_base_url||o.base_url),a("Input tokens",o.prompt_eval_count),a("Batch",o.batch),a("\u5411\u91CF\u7DAD\u5EA6",o.dimensions),a("Fallback",o.fallback_used?"\u662F":"\u5426"),t&&u(o,n.duration);else if(e.key==="qdrant")a("Collection",o.collection||i.collection),o.filter&&a("Filter",Wo(o.filter)),a("Top K",o.top_k??i.limit),a("Hits",o.hits),a("Unique judgments",o.unique_judgments),a("Top score",o.top_score);else if(e.key==="reranker")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Rerank \u72C0\u614B",o.status),a("Fallback",o.fallback_used?"\u662F":"\u5426"),a("\u5019\u9078\u7B46\u6578",o.candidates),a("\u9078\u7528\u7B46\u6578",o.selected),a("Top score",o.top_score),Array.isArray(o.errors)&&o.errors.length&&a("\u932F\u8AA4",o.errors.join(" \xB7 "));else if(e.key==="context")a("Chunks",o.chunks),a("\u5224\u6C7A chunks",o.judgment_chunks),a("\u6CD5\u898F chunks",o.law_chunks),a("Token \u4F30\u7B97",o.token_estimate),a("Context \u5B57\u5143",o.context_chars),a("\u6587\u4EF6\u6578",o.documents);else if(e.key==="llm")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Input tokens",o.input_tokens),a("Output tokens",o.output_tokens),a("TTFT",o.ttft_ms===null||o.ttft_ms===void 0?"\u2014":ge(o.ttft_ms)),a("API \u7E3D\u8017\u6642",o.total_duration_ms===null||o.total_duration_ms===void 0?"\u2014":ge(o.total_duration_ms)),t&&u(o,n.duration),a("Strict retry",o.strict?"\u662F":"\u5426");else if(e.key==="model_load"){if(a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("\u4F86\u6E90\u968E\u6BB5",o.source_stage),a("\u51B7\u555F\u52D5",o.cold_start?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09"),a("\u6A21\u578B\u547C\u53EB\u7E3D\u8017\u6642",o.request_duration_ms===null||o.request_duration_ms===void 0?"\u2014":ge(o.request_duration_ms)),a("\u8F09\u5165\u8017\u6642",o.model_load_ms===null||o.model_load_ms===void 0?"\u2014":ge(o.model_load_ms)),a("\u6263\u9664\u8F09\u5165\u5F8C\u6D41\u7A0B\u6642\u9593",o.warm_duration_ms===null||o.warm_duration_ms===void 0?"\u2014":ge(o.warm_duration_ms)),Number(o.request_duration_ms)>0&&Number(o.model_load_ms)>=0){let h=Number(o.model_load_ms)/Number(o.request_duration_ms)*100;a("\u8F09\u5165\u5360\u6BD4",`${h.toFixed(h>=10?0:1)}%`)}o.eval_duration_ms!==null&&o.eval_duration_ms!==void 0&&a("\u63A8\u8AD6\u8017\u6642",ge(o.eval_duration_ms))}else if(e.key==="segment"||e.key==="test_stage")if(a("Model",d||o.model||i.model),a("\u72C0\u614B",o.status||n.status),e.key==="test_stage")a("\u9032\u5EA6",o.progress===null||o.progress===void 0?"":`${Number(o.progress)||0}%`),n.error&&a("\u932F\u8AA4",n.error);else{n.error&&a("\u932F\u8AA4",n.error);for(let[h,y]of Object.entries(i).slice(0,10))a(h,Wo(y))}return e.spans.length>1&&(e.key==="model_load"?a("\u5404\u6A21\u578B\u8F09\u5165",e.spans.map(h=>`${h.metadata?.source_stage||"model"} ${Vr(h)} ${ge(h.metadata?.model_load_ms||0)}`).join(" \xB7 ")):(a("Span \u6578",e.spans.length),a("Span \u660E\u7D30",e.spans.map((h,y)=>`#${y+1} +${h.offset.toFixed(0)}ms/${ge(h.duration)}`).join(" \xB7 ")))),n.module&&a("Module",n.module),n.function&&a("Function",n.function),s}function Eu(e){let t=String(e||"").trim();if(!t)return"";try{return new URL(t.includes("://")?t:`http://${t}`).hostname||t}catch{return t}}function sl(e){let t=e?.metadata||{},s=String(t.provider_name||"").trim();if(s)return s;let a=String(t.active_base_url||t.base_url||e?.params?.url||"").trim();return Eu(a)}function Nu(e){let t=e?.metadata||{};return String(t.model||e?.params?.model||"").trim()}function Vr(e){let t=sl(e),s=Nu(e);return s?t?`${t}:${s}`:s:""}function Ru(e){let t=new Set;for(let s of e?.spans||[]){let a=Vr(s);a&&t.add(a)}return[...t]}function qn(e,t,s={}){let a=Jr({...e,spans:[t]},s);return[String(e.label||""),...a.map(([n,i])=>`${n}: ${i}`)].join(`
`)}function Cu(e,t){let s=e.spans||[],a=Array.isArray(e.decisions)?e.decisions:[],n=Ru(e),i=Array.isArray(e.displaySegments)?e.displaySegments:null,o=7,l=Math.max(1,Math.min(4,s.length)),d=s.length>1,u=i?12:d?Math.max(12,l*o):12,h=i?i.map(k=>{if(Number(k.duration)<=0)return"";let S=Math.max(0,Math.min(100,k.offset/t*100)),f=Math.min(100-S,k.duration/t*100);return`<span class="rag-wf-bar is-sequential${k.kind==="load"?" is-load":""}" style="left:${S.toFixed(3)}%;width:${f.toFixed(4)}%;top:0;height:12px;--bar-color:${k.color}"
            data-rag-wf-tip="${r(k.tip)}"
            aria-label="${r(k.tip)}" role="img"></span>`}).join(""):s.slice(0,4).map((k,S)=>{if(Number(k.duration)<=0)return"";let f=Math.max(0,Math.min(100,k.offset/t*100)),T=Math.max(.35,Math.min(100-f,k.duration/t*100)),V=d?S*o:0,Q=d?6:12,fe=qn(e,k);return`<span class="rag-wf-bar" style="left:${f.toFixed(3)}%;width:${T.toFixed(3)}%;top:${V}px;height:${Q}px"
            data-rag-wf-tip="${r(fe)}"
            aria-label="${r(fe)}" role="img"></span>`}).join(""),y=Array.isArray(e.detailSegments)?e.detailSegments:[],v=y.length>1?y.map(k=>{let S=k.kind==="load"?{...e,key:"model_load",label:`Model Load \xB7 ${e.label}`,spans:[k.span],duration:k.duration}:{...e,label:`${e.label} \u63A8\u8AD6`,spans:[k.span],duration:k.duration},f=Jr(S,{includeLoad:k.kind!=="stage"});return`<div class="rag-wf-detail-group">
              <div class="rag-wf-detail-group-head">
                <strong>${r(k.label)}</strong>
                <span>${r(ge(k.duration))}</span>
              </div>
              <div class="rag-wf-detail-grid">${f.map(([T,V])=>`<span class="rag-wf-detail"><span>${r(T)}</span><strong>${r(V)}</strong></span>`).join("")}</div>
            </div>`}).join(""):"",p=Jr(e).map(([k,S])=>`<span class="rag-wf-detail"><span>${r(k)}</span><strong>${r(S)}</strong></span>`).join(""),b=y.length>1?`<div class="rag-wf-details is-split">${v}</div>`:`<div class="rag-wf-details">${p}</div>`,w=s.length?s.some(k=>k.status==="error")?"is-error":"":"is-missing",M=s.length?ge(e.duration):"\u672A\u8A18\u9304";return`<details class="rag-wf-stage ${w}" style="--stage-color:${e.color}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong>${r(e.label)}</strong><small>${r(e.hint)}</small>${n.length?`<small class="rag-wf-model-line">${r(n.join(" \xB7 "))}</small>`:""}${a.length?`<small class="rag-wf-decision-badge">${c(a.length)} \u6C7A\u7B56</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${M} \xB7 ${s.length?`${s.length} span`:"\u2014"} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:${u}px">${h}</span>
    </summary>
    ${Du(a)}
    ${b}
  </details>`}function al(e,t,s=!1){let a=e.response||{},n=e.client||{},i=e.models||[];return`<div class="rag-wf-summary">
      <span>\u7E3D\u8017\u6642 <strong>${r(ge(e.total))}</strong></span>
      <span>Server <strong>${r(ge(t))}</strong></span>
      ${n.total_ms?`<span>Client <strong>${r(ge(n.total_ms))}</strong></span>`:""}
      ${n.render_ms!==void 0?`<span>Render <strong>${r(ge(n.render_ms))}</strong></span>`:""}
      <span>\u5F15\u7528 <strong>${r(String(a.citation_count??"\u2014"))}</strong></span>
      <span>Abstain <strong>${a.abstain?"\u662F":"\u5426"}</strong></span>
      ${e.decisionCount?`<span>\u6C7A\u7B56 <strong>${c(e.decisionCount)}</strong></span>`:""}
      ${i.length?`<span>Model <strong>${r(i.join(" \xB7 "))}</strong></span>`:""}
      ${s?'<span class="rag-wf-updating">\u66F4\u65B0\u4E2D\u2026</span>':""}
    </div>`}function Ln(e,t,s="\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\uFF0C\u67E5\u770B\u53C3\u6578\u3001Token\u3001TTFT\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u4F86\u6E90\u6578\u91CF\u3002Waterfall \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u5E73\u884C\u57F7\u884C\u7684 span \u6703\u4F9D\u5BE6\u969B\u6642\u9593\u91CD\u758A\u986F\u793A\u3002",{legend:a=""}={}){return`<div class="rag-wf-axis"><span>0 ms</span><span>${r(ge(t))}</span></div>
    ${a}
    <div class="rag-wf-stages">${(e||[]).map(n=>Cu(n,t)).join("")}</div>
    <p class="rag-wf-hint">${r(s)}</p>`}function Pu(e){let t=Array.isArray(e?.selected)?e.selected:e?.selected?[e.selected]:[],s=(Array.isArray(e?.options)?e.options:[]).filter(a=>t.includes(a.id)).map(a=>a.label||a.id);return s.length?s.join("\u3001"):t.length?t.join("\u3001"):"\u2014"}function nl(e){if(e==null||e==="")return"\u2014";if(Array.isArray(e))return e.length?e.map(t=>nl(t)).join("\u3001"):"\u2014";if(typeof e=="object")try{return JSON.stringify(e)}catch{return"\u2014"}return String(e)}function Iu(e){let t=Object.entries(e||{}).filter(([,s])=>s!=null&&s!=="").slice(0,10);return t.length?`<div class="rag-wf-decision-result">
    ${t.map(([s,a])=>`<span class="rag-wf-decision-result-item"><span>${r(s)}</span><strong>${r(nl(a))}</strong></span>`).join("")}
  </div>`:""}function Du(e){return!Array.isArray(e)||!e.length?"":`<div class="rag-wf-decisions">
    <div class="rag-wf-decisions-head">
      <span>\u6C7A\u7B56\u8A18\u9304</span>
      <span class="badge badge-neutral badge-mono">${c(e.length)}</span>
    </div>
    ${e.map((t,s)=>{let a=Pu(t),n=(Array.isArray(t.options)?t.options:[]).map(i=>{let o=!!i.selected,l=i.evaluated!==!1;return`<div class="rag-wf-decision-option ${o?"is-selected":l?"is-considered":"is-skipped"}">
              <span class="rag-wf-decision-option-state">${r(o?"\u9078\u4E2D":l?"\u672A\u9078":"\u672A\u8A55\u4F30")}</span>
              <span class="rag-wf-decision-option-label">${r(i.label||i.id||"\u9078\u9805")}</span>
              <span class="rag-wf-decision-option-reason">${r(i.reason||"\u2014")}</span>
            </div>`}).join("");return`<details class="rag-wf-decision">
          <summary class="rag-wf-decision-summary">
            <span class="rag-wf-decision-seq">${s+1}</span>
            <span class="rag-wf-decision-question">${r(t.question||t.id||"\u6C7A\u7B56")}</span>
            <span class="rag-wf-decision-selected">${r(a)}</span>
            ${t.opaque?'<span class="rag-wf-decision-opaque">LLM \u9ED1\u7BB1</span>':""}
            <span class="rag-wf-chevron">${m("chevronRight",12)}</span>
          </summary>
          <div class="rag-wf-decision-body">
            <div class="rag-wf-decision-meta">
              <span>\u65B9\u6CD5</span><strong>${r(t.method||"\u2014")}</strong>
              <span>\u8017\u6642</span><strong>${r(ge(t.duration_ms||0))}</strong>
            </div>
            ${n||'<div class="rag-wf-decision-empty">\u6C92\u6709\u8A18\u9304\u9078\u9805\u3002</div>'}
            ${Iu(t.result)}
            ${t.opaque?'<p class="rag-wf-decision-note">LLM \u5167\u90E8\u63A8\u7406\u4E0D\u53EF\u898B\uFF1B\u53EA\u8A18\u9304\u8F38\u5165\u6458\u8981\u3001\u8F38\u51FA\u8207\u8017\u6642\u3002</p>':""}
          </div>
        </details>`}).join("")}
  </div>`}function rl(e){let t=(e.stages||[]).some(i=>i.loadInfo),s=t?'<div class="rag-wf-legend"><span><i class="is-load"></i>Model Load\uFF08\u968E\u6BB5 bar \u524D\u6BB5\uFF09</span></div>':"",a=e.decisionCount?" \u6BCF\u500B\u968E\u6BB5\u53EF\u5C55\u958B\u6C7A\u7B56\u8A18\u9304\uFF1B\u672A\u8A55\u4F30\u7684\u9078\u9805\u6703\u6A19\u793A\u300C\u672A\u8A55\u4F30\u300D\uFF0C\u4E0D\u6703\u4E8B\u5F8C\u88DC\u7406\u7531\u3002":"",n=(e.structuredLaw?"\u6B64\u984C\u4F7F\u7528\u7D50\u69CB\u5316\u6CD5\u898F\u67E5\u8A62\uFF1A\u5BE6\u969B\u57F7\u884C Parsing\u3001\u6CD5\u898F\u6AA2\u7D22\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u3001\u6CD5\u689D\u8F09\u5165\u8207 Response\uFF1BEmbedding\uFF0FQdrant\uFF0FReranker\uFF0FContext\uFF0FLLM \u672A\u57F7\u884C\uFF0C\u56E0\u6B64\u4E0D\u5217\u5165\u6B64 waterfall\u3002":t?"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\uFF1BEmbedding\uFF0FLLM \u7684\u85CD\u8272\u524D\u6BB5\u70BA Model Load\uFF0C\u5F8C\u6BB5\u70BA\u63A8\u8AD6\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001Token \u8207\u8F09\u5165\u5360\u6BD4\u53EF\u5C55\u958B\u67E5\u770B\u3002":"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207 Token \u53EF\u5C55\u958B\u67E5\u770B\u3002")+a;return Ln(e.stages,e.total,n,{legend:s})}function jn(e,{serverDurationMs:t=0,loading:s=!1,embedded:a=!1}={}){if(!e||typeof e!="object")return"";let n=tl(e,t),i=n.traceStatus;return`<section class="report-card rag-wf-card${a?" rag-wf-embedded":""}">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${Mn[i.tone]||Mn.idle}">${r(i.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(n.requestId||"\u2014")}</span>
          \xB7 ${r(Se(n.startedAt))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <a class="btn btn-secondary btn-sm" href="#/performance">
          ${m("activity",14)}<span>\u5B8C\u6574 Flow</span>
        </a>
      </div>
    </div>
    ${al(n,t,s)}
    ${rl(n)}
  </section>`}var Ct=null;function Bu(){return Ct||(Ct=document.createElement("div"),Ct.className="rag-wf-tooltip",Ct.hidden=!0,document.body.appendChild(Ct),Ct)}function Kr(){Ct&&(Ct.hidden=!0)}function il(e){if(!Ct||Ct.hidden)return;let t=14,s=10,a=Ct.getBoundingClientRect(),n=e.clientX+t,i=e.clientY+t;n+a.width>window.innerWidth-s&&(n=e.clientX-a.width-t),i+a.height>window.innerHeight-s&&(i=e.clientY-a.height-t),Ct.style.left=`${Math.max(s,n)}px`,Ct.style.top=`${Math.max(s,i)}px`}document.addEventListener("pointerover",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=Bu(),a=t.dataset.ragWfTip||"";a&&(s.textContent=a,s.hidden=!1,il(e))});document.addEventListener("pointermove",e=>{if(!(!Ct||Ct.hidden)){if(!e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]")){Kr();return}il(e)}});document.addEventListener("pointerout",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=e.relatedTarget;s instanceof Node&&t.contains(s)||Kr()});window.addEventListener("scroll",Kr,{capture:!0,passive:!0});function Fu(e,t,s,a){if(a&&!e.length)return`<div class="report-card rag-wf-card">
      ${Ge({tone:"danger",title:"RAG Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">${m("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;if(!e.length)return`<div class="report-card rag-wf-card">
      ${xt({iconName:"activity",title:s?"\u8B80\u53D6 RAG Pipeline\u2026":"\u5C1A\u7121 RAG Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684 RAG \u554F\u7B54 Trace\u3002":"\u7522\u751F\u65B0\u7684 RAG \u554F\u7B54\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A Parsing\u3001Embedding\u3001Qdrant\u3001Context\u3001LLM \u8207 Response \u7684 waterfall\u3002"})}
    </div>`;let n=e.find(u=>String(u.id)===String(t))||e[0],i=n.flow&&typeof n.flow=="object"?n.flow:{},o=tl(i,n.duration_ms),l=o.traceStatus,d=e.map(u=>{let h=el(u.flow||{});return`<option value="${r(String(u.id))}" ${String(u.id)===String(n.id)?"selected":""}>#${r(String(u.id))} \xB7 ${r(Se(u.started_at))} \xB7 ${r(ge(u.duration_ms))} \xB7 ${r(h.label)}</option>`}).join("");return`<section class="report-card rag-wf-card">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${Mn[l.tone]||Mn.idle}">${r(l.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(o.requestId||n.request_id||"\u2014")}</span>
          \xB7 ${r(Se(n.started_at))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <label class="rag-wf-select">Trace
          <select class="select" data-rag-trace-select aria-label="\u9078\u64C7 RAG Trace">${d}</select>
        </label>
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">
          ${m("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    ${al(o,n.duration_ms,s)}
    ${rl(o)}
  </section>`}function Ou(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},n=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?ge(a.avg_total_ms??0):"\u2014",o=a.samples?ge(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
  </div>`}function qt(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),n=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(n).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:n?`${n}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function ol(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function Hu(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let n=Number(a.points_per_second)||0,i=Math.max(2,n/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${r(ol(a))}</strong>
          <span>${r(Se(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${r(`${c(a.indexed_count)} \u7B46 \xB7 ${qt(a.duration_ms)} \xB7 ${c(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${n.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${c(a.indexed_count)} \u7B46 \xB7 ${qt(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function zu(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${r(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${r(`${s.label} ${qt(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${r(s.key)}"></i>
            <span>${r(s.label)}</span>
            <strong>${qt(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 llama-server Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function Uu(e,t){let s=(Array.isArray(e)?e:[]).map(k=>({elapsed:Math.max(0,Number(k.elapsed_s)||0),indexed:Math.max(0,Number(k.indexed)||0)})).filter(k=>k.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(k=>k.elapsed),(Number(t)||0)/1e3,1),n=Math.max(...s.map(k=>k.indexed),1),i=760,o=150,l=12,d=12,u=i-l*2,h=o-d*2,y=s.map(k=>[l+k.elapsed/a*u,o-d-k.indexed/n*h]),v=y.map(([k,S],f)=>`${f===0?"M":"L"}${k.toFixed(1)},${S.toFixed(1)}`).join(" "),p=`${v} L${y[y.length-1][0].toFixed(1)},${o-d} L${y[0][0].toFixed(1)},${o-d} Z`,b=Math.max(1,Math.ceil(y.length/14)),w=y.map(([k,S],f)=>f%b===0||f===y.length-1?`<circle cx="${k.toFixed(1)}" cy="${S.toFixed(1)}" r="2.6" />`:"").join(""),M=[0,1,2,3].map(k=>{let S=d+h/3*k;return`<line x1="${l}" y1="${S.toFixed(1)}" x2="${i-l}" y2="${S.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${c(n)} \u7B46 \xB7 ${qt(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${M}
      <path d="${p}" class="index-progress-area"></path>
      <path d="${v}" class="index-progress-line"></path>
      ${w}
      <line x1="${l}" y1="${o-d}" x2="${i-l}" y2="${o-d}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${d}" x2="${l}" y2="${o-d}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${qt(a*500)}</span>
      <span>${qt(a*1e3)}</span>
    </div>
  </div>`}function Gu(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},n=t.coverage||{},i=n.total_judgments>0?`${c(n.indexed_judgments)} / ${c(n.total_judgments)}\uFF08${(100*n.indexed_judgments/n.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:c(t.indexed_count),note:`${c(t.batch_count)} \u6279 \xD7 ${c(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:qt(t.duration_ms),note:`${c(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:qt(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${qt(t.batch_min_ms)} \xB7 \u6700\u6162 ${qt(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${c(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${r(ol(t))}</span>
    </div>
    <div class="index-perf-summary">
      ${o.map(l=>`<div class="index-perf-stat">
            <div class="summary-label">${r(l.label)}</div>
            <div class="index-perf-value">${r(l.value)}</div>
            <div class="index-perf-note">${r(l.note)}</div>
          </div>`).join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${r(Se(t.started_at))}</span>
      <span><strong>batch</strong> ${c(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${c(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${c(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${r(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${qt(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${Hu(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${qt(t.duration_ms)}</span>
        </div>
        ${zu(t)}
      </div>
    </div>
    ${Uu(t.progress,t.duration_ms)}
  </section>`}var Vo=["#22d3ee","#a78bfa","#f59e0b","#ec4899","#3b82f6","#10b981","#f97316","#8b5cf6","#64748b"];function Ko(e){let t=String(e?.host||e?.url||"").trim(),s=e?.port?`:${e.port}`:"";return`${t||"\u2014"}${s}`}function Qu(e,t,s,a){if(a&&!e)return`<div class="report-card rag-wf-card">
      ${Ge({tone:"danger",title:"\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${m("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=Array.isArray(e?.runs)?e.runs:[];if(!n.length)return`<div class="report-card rag-wf-card">
      ${xt({iconName:"layers",title:s?"\u8B80\u53D6\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline\u2026":"\u5C1A\u7121\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684\u7248\u672C\u5316\u7D22\u5F15\u7D00\u9304\u3002":"\u57F7\u884C\u300CQdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A host/model\u3001Blue-Green collection \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002"})}
    </div>`;let i=n.find(S=>String(S.id)===String(t))||e?.latest||n[n.length-1],o=i?.pipeline&&typeof i.pipeline=="object"?i.pipeline:null,d=[...n].reverse().map(S=>{let f=Number(S.pipeline?.version_id||S.version_id||0),T=f?`v${String(f).padStart(3,"0")}`:"\u7D22\u5F15";return`<option value="${r(String(S.id))}" ${String(S.id)===String(i.id)?"selected":""}>${r(`${Se(S.started_at)} \xB7 ${T} \xB7 ${qt(S.duration_ms)}`)}</option>`}).join(""),u=Number(o?.version_id||i.version_id||0),h=u?`v${String(u).padStart(3,"0")}`:"\u2014",y=o?.host||{},v=Ko(y),p=o?.model||i.model||"\u2014",b=Number(o?.total_ms)||Number(i.duration_ms)||0,w=Array.isArray(o?.stages)?o.stages:[],M=w.map((S,f)=>({...S,ms:Math.max(0,Number(S.duration_ms)||0),color:Vo[f%Vo.length]})).filter(S=>S.ms>0).map(S=>`<span class="index-pipeline-seg" style="width:${(S.ms/Math.max(1,b)*100).toFixed(2)}%;background:${r(S.color)}" title="${r(`${S.label} ${qt(S.ms)}`)}"></span>`).join(""),k=w.map((S,f)=>{let T=Math.max(0,Number(S.duration_ms)||0),V=b>0?T/b*100:0,Q=S.host&&typeof S.host=="object"?S.host:null;return`<div class="index-pipeline-row">
        <span class="index-pipeline-step">${String(f+1).padStart(2,"0")}</span>
        <div class="index-pipeline-copy">
          <div class="index-pipeline-title">
            <strong>${r(S.label||S.key||"\u968E\u6BB5")}</strong>
            ${at(S.status||"success")}
          </div>
          <span class="index-pipeline-detail">${r(S.detail||"\u2014")}</span>
          ${Q?`<span class="index-pipeline-host">${m("server",12)} ${r(Ko(Q))} \xB7 ${r(S.model||p)}</span>`:""}
        </div>
        <div class="index-pipeline-time">
          <strong>${qt(T)}</strong>
          <span>${V.toFixed(1)}%</span>
        </div>
      </div>`}).join("");return`<section class="index-perf-panel index-pipeline-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</div>
        <div class="index-perf-sub">Blue-Green collection\u3001host/model \u8207\u968E\u6BB5\u8017\u6642</div>
      </div>
      <div class="index-pipeline-actions">
        <select class="select index-pipeline-select" data-index-pipeline-select aria-label="\u9078\u64C7\u7D22\u5F15 Pipeline \u7D00\u9304">${d}</select>
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${m("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span></button>
      </div>
    </div>
    ${o?`<div class="index-pipeline-meta">
            <span><strong>\u7248\u672C</strong> ${r(h)}</span>
            <span><strong>collection</strong> ${r(String(o.collection||"\u2014"))}</span>
            <span><strong>\u6A21\u5F0F</strong> ${r(String(o.build_mode||"\u2014"))}</span>
            <span><strong>\u672C\u6B21</strong> ${o.resumed?`\u63A5\u7E8C\uFF08\u5DF2\u7D22\u5F15 ${c(o.resumed_indexed)} \u7B46\uFF09`:"\u65B0\u5EFA\u7248\u672C"}</span>
            <span><strong>Host</strong> ${r(v)}</span>
            <span><strong>Model</strong> ${r(String(p))}</span>
            <span><strong>\u7E3D\u8017\u6642</strong> ${qt(b)}</span>
          </div>
          <div class="index-pipeline-bar">${M}</div>
          <div class="index-pipeline-list">${k}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B Pipeline \u968E\u6BB5\u8CC7\u6599\uFF1B\u4E0B\u4E00\u6B21 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u6703\u8A18\u9304 host/model \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002</div>'}
  </section>`}function Wu(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Zo.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${m("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${m("chevronRight",13)}</button>
    </div>
  </div>`}function Ju(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"#65a30d":t.includes("judgment.rag")?"#8b5cf6":t.includes("judgment.web.app")?"#3b82f6":t.includes("judgment.web.query")?"#d97706":t.includes("judgment.judgment_index")?"#0d9488":"#64748b"}function Vu(e){let t=Wr(e),s=Math.max(0,Math.min(8,Number(e.depth)||0));return{key:"segment",label:`${"\u203A ".repeat(s)}${e.name||"unnamed"}`,hint:[e.module||"\u2014",e.function||"\u2014"].join(" \xB7 "),color:Ju(e),spans:[{...t,status:e.status||"ok",error:e.error,metadata:e.metadata||{},params:e.params||{},started_at:e.started_at,finished_at:e.finished_at}],start:t.offset,end:t.end,duration:t.duration}}function ll(e){return(e||[]).map(Vu)}function Ku(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((v,p)=>Number(v.seq)-Number(p.seq)):[],n=s?.summary||{},i=Array.isArray(n.models)?n.models:[],o=s?.client||{},l=s?.metadata||{},d=l.question||"",u=l.answer||"",h=d||u?`<div class="perf-flow-qa">
          ${d?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${r(d)}</span></div>`:""}
          ${u?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${r(u)}</span></div>`:""}
        </div>`:"",y=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(v=>(Number(v.offset_ms)||0)+(Number(v.duration_ms)||0)),1);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${r(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${r(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${r(e.method||"")} ${r(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${Se(e.started_at)}</span>
      <span class="perf-record-duration">${ge(e.duration_ms)}</span>
      ${at(e.status)}
      <span class="perf-record-chevron">${m("chevronRight",14)}</span>
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
      ${h}
      ${i.length?`<div class="chips perf-record-models">${i.map(v=>`<span class="chip">${r(v)}</span>`).join("")}</div>`:""}
      ${a.length?Ln(ll(a),y,"\u6B64 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002"):`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${r(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${r(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var Yo={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",rerank:"Reranker",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"};function Yu(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}var Xu={embedding:"#3984c6",retrieval:"#d97706",rerank:"#8b5cf6",context:"#64748b",llm:"#16a34a",validation:"#8b5cf6"};function Zu(e,t){let s=Date.parse(e.started_at||""),a=Date.now(),n=Array.isArray(e.stage_order)?[...e.stage_order]:Object.keys(Yo);for(let u of t)u.stage&&!n.includes(u.stage)&&n.push(u.stage);let i=[],o=0;for(let u of n){let h=t.filter(p=>p.stage===u);if(!h.length)continue;let y=h.map(p=>{let b=Date.parse(p.started_at||""),w=Number.isFinite(s)&&Number.isFinite(b)?Math.max(0,b-s):0,M=Math.max(0,Number(p.duration_ms)||0);p.status==="running"&&Number.isFinite(b)&&(M=Math.max(M,a-b));let k=w+M;return o=Math.max(o,k),{offset:w,end:k,duration:M,status:p.status==="failed"?"error":p.status==="running"?"running":"ok",started_at:p.started_at,finished_at:p.finished_at,error:p.error_message,metadata:{...p.details||{},model:p.model,status:p.status,progress:Number(p.progress)||0,module:p.module,function:p.function},params:{model:p.model}}}),v=y.reduce((p,b)=>p+b.duration,0);i.push({key:"test_stage",label:Yo[u]||u,hint:`${y.length} \u500B\u7A0B\u5E8F`,color:Xu[u]||"#64748b",spans:y,start:y.length?Math.min(...y.map(p=>p.offset)):null,end:y.length?Math.max(...y.map(p=>p.end)):null,duration:v})}let l=e.status==="running"&&Number.isFinite(s)?Math.max(0,a-s):0,d=Math.max(Number(e.total_ms)||0,l,o,1);return{stages:i,total:d}}function ra(e,t,s,a={}){let n=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(k=>`<option value="${r(k.run_id)}" ${k.run_id===s?"selected":""}>${r(Yu(k.status))} \xB7 ${r((k.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${r(Se(k.started_at))}</option>`)].join(""),o=n?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${m("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${m("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?at(e.status):""}</div>
      <div class="test-flow-question">${e?r(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${xt({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let d=Array.isArray(e.steps)?e.steps:[],u=Zu(e,d),h=e.models||{},y=e.status==="running"?`${ge(u.total)}\uFF08\u4F30\u7B97\uFF09`:ge(e.total_ms),v=d.find(k=>k.stage==="llm"&&k.model===e.summary?.primary_model)||d.find(k=>k.stage==="llm"&&k.details?.answer_preview),p=String(v?.details?.provider_name||"").trim(),b=p&&e.summary?.primary_model?`${p}:${e.summary.primary_model}`:e.summary?.primary_model||"",w=e.answer||v?.details?.answer_preview||"",M=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${b?`<span class="mono">${r(b)}</span>`:""}
    </div>
    <p>${w?r(w):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${r(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${r(Se(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${y}</span>
      <span><strong>Embedding</strong> ${Array.isArray(h.embedding)?h.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(h.llm)?h.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${r(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${M}
    ${u.stages.length?Ln(u.stages,u.total,"\u6E2C\u8A66 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B\u7A0B\u5E8F\u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u6A21\u578B\u3001\u72C0\u614B\u3001\u9032\u5EA6\u3001module\uFF0Ffunction \u8207\u932F\u8AA4\u3002"):'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":n?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${b?`<span class="mono">primary=${r(b)}</span>`:""}
    </div>
  </div>`}function Xo(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},n=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
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
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${m("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${m("file",14)}<span>JSON</span></button>
      </div>
    </div>
    ${s.length?`<div class="summary-strip">${s.map(i=>`<div class="summary-item">
                <div class="summary-label">${r(i.label)}</div>
                <div class="summary-value">${r(i.value)}</div>
              </div>`).join("")}</div>`:""}
    ${Gu(n)}
    ${Ou(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>Ku(i,o)).join(""):xt({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${Wu(e)}
    <details class="perf-query-details">
      <summary>\u67E5\u8A62\u8A9E\u53E5\u8207\u8B66\u544A</summary>
      <div class="query-box">
        <pre class="query-code">${r(e.query_text||"\u2014")}</pre>
        <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
          ${m("copy",12)}<span>\u8907\u88FD</span>
        </button>
      </div>
      ${Array.isArray(e.warnings)&&e.warnings.length?`<div class="warnings">${e.warnings.map(i=>`<div class="warning-line">${r(i)}</div>`).join("")}</div>`:""}
    </details>
  </div>`}async function ep(e,t){let s=Zt(),a=!1,n=Qr(),i={processes:[],modules:[],statuses:[],methods:[],models:[]},o=1,l=25,d=null,u=[],h="",y=!1,v=null,p=!1,b=null,w="",M=!1,k=null,S=!1;e.innerHTML=`<section class="page data-page performance-page">
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
          <button class="status-tab" type="button" data-performance-tab="pipeline">
            <span class="status-tab-icon">${m("activity",15)}</span>
            <span class="status-tab-copy"><strong>RAG Pipeline</strong><small>Span waterfall\u3001Token \u8207 TTFT</small></span>
          </button>
          <button class="status-tab" type="button" data-performance-tab="index-pipeline">
            <span class="status-tab-icon">${m("layers",15)}</span>
            <span class="status-tab-copy"><strong>\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</strong><small>Host\uFF0FModel\u3001Blue-Green \u8207\u968E\u6BB5\u8017\u6642</small></span>
          </button>
          <button class="status-tab${s?" is-demo-locked":""}" type="button" data-performance-tab="benchmark"${s?' data-demo-lock-tooltip="\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B Benchmark \u57F7\u884C"':""}>
            <span class="status-tab-icon">${m("brain",15)}</span>
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
                    ${m("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
                  </button>
                </div>
              </form>
              <div class="sidebar-note">Flow \u5BEB\u5165 PostgreSQL \u7684 performance_records.flow\uFF08JSON\uFF09\uFF0C\u9810\u8A2D\u4FDD\u7559\u81F3\u5C11 90 \u5929\uFF1B\u53EF\u4F9D\u6A21\u578B\u3001\u7A0B\u5E8F\u3001\u6A21\u7D44\u8207\u8017\u6642\u7BE9\u9078\u3002</div>
            </aside>
            <section class="query-main" id="performance-main" aria-label="\u6548\u80FD\u5831\u8868" aria-live="polite">
              <div id="performance-test-flow"></div>
              <div id="performance-report">${Aa({label:"\u6548\u80FD\u5831\u8868"})}</div>
            </section>
          </div>
        </div>
        <div id="performance-panel-pipeline" hidden></div>
        <div id="performance-panel-index-pipeline" hidden></div>
        <div id="performance-panel-benchmark" hidden></div>
      </section>
    </div>
  </section>`;let f=e.querySelector("#performance-filter-fields"),T=e.querySelector("#performance-filter-form"),V=e.querySelector("#performance-test-flow"),Q=e.querySelector("#performance-report"),fe=e.querySelector("#performance-panel-pipeline"),ve=e.querySelector("#performance-panel-index-pipeline"),se=e.querySelector("#performance-meta"),L=e.querySelector("#performance-refresh"),q=[...e.querySelectorAll("[data-performance-tab]")],E={overview:e.querySelector("#performance-panel-overview"),pipeline:e.querySelector("#performance-panel-pipeline"),"index-pipeline":e.querySelector("#performance-panel-index-pipeline"),benchmark:e.querySelector("#performance-panel-benchmark")},K="overview",de=P=>{K=P;for(let z of q){let J=z.dataset.performanceTab===P;z.classList.toggle("is-active",J),J?z.setAttribute("aria-current","page"):z.removeAttribute("aria-current")}for(let[z,J]of Object.entries(E))J&&(J.hidden=z!==P);P==="benchmark"?se.textContent="BENCHMARK \xB7 RAG":P==="pipeline"?se.textContent="PERFORMANCE \xB7 RAG WATERFALL":P==="index-pipeline"?se.textContent="PERFORMANCE \xB7 INDEX PIPELINE":d&&(se.textContent=`PERFORMANCE \xB7 ${c(d.total)} \u7B46`)},H=Eo(e,{onNavigate:P=>de(P)});s&&(V.innerHTML=Is("\u7CFB\u7D71\u6E2C\u8A66\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u6548\u80FD\u5831\u8868\u3001RAG Pipeline \u8207\u7D22\u5F15 Pipeline\uFF1B\u6E2C\u8A66\u6D41\u7A0B\u8207 Benchmark \u57F7\u884C\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002"));let ie=()=>{fe&&(fe.innerHTML=Fu(u,h,y,v))},Te=async({force:P=!1}={})=>{if(!(a||y)){if(p&&!P){ie();return}y=!0,u.length||ie();try{let z=await G.performance({keyword:"/api/rag"},1,50);if(a)return;let J=(Array.isArray(z.rows)?z.rows:[]).filter($e=>$e.flow&&(String($e.path||"").includes("/api/rag")||String($e.process||"").includes("RAG")));u=J,(!h||!J.some($e=>String($e.id)===String(h)))&&(h=J[0]?String(J[0].id):""),v=null,p=!0}catch(z){if(a)return;v=z}finally{a||(y=!1,ie())}}},B=()=>{ve&&(ve.innerHTML=Qu(b,w,M,k))},qe=async({force:P=!1}={})=>{if(!(a||M)){if(S&&!P){B();return}M=!0,b||B();try{let z=await G.performance({},1,1);if(a)return;b=z.index_pipeline||z.index_stats||null;let J=Array.isArray(b?.runs)?b.runs:[];(!w||!J.some($e=>String($e.id)===String(w)))&&(w=b?.latest?String(b.latest.id):""),k=null,S=!0}catch(z){if(a)return;k=z}finally{a||(M=!1,B())}}},ae=P=>{if(de(P),P==="benchmark"){if(s){let z=E.benchmark;z&&(z.innerHTML=Is("RAG Benchmark \u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u6548\u80FD\u5831\u8868\u8207 Pipeline\uFF1BBenchmark \u984C\u5EAB\u3001\u6A21\u578B\u8A2D\u5B9A\u3001\u57F7\u884C\u8207\u8A55\u5206\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002"));return}H.show()}P==="pipeline"&&Te(),P==="index-pipeline"&&qe()};e.addEventListener("click",P=>{let z=P.target.closest("[data-performance-tab]");z&&ae(z.dataset.performanceTab||"overview")}),fe?.addEventListener("change",P=>{P.target.matches("[data-rag-trace-select]")&&(h=String(P.target.value||""),ie())}),fe?.addEventListener("click",P=>{P.target.closest('[data-action="refresh-rag-waterfall"]')&&Te({force:!0})}),ve?.addEventListener("change",P=>{P.target.matches("[data-index-pipeline-select]")&&(w=String(P.target.value||""),B())}),ve?.addEventListener("click",P=>{P.target.closest('[data-action="refresh-index-pipeline"]')&&qe({force:!0})});let Le=null,Ie=[],Ee="",Ze=null,le="",ee=()=>{f.innerHTML=qu(i,n)},Me=()=>{let P=JSON.stringify({selected:Ee,tick:Le?.status==="running"?Math.floor(Date.now()/1e3):0,runs:Ie.map(z=>`${z.run_id}:${z.status}`),run:Le?{run_id:Le.run_id,status:Le.status,progress:Le.progress,total_ms:Le.total_ms,steps:(Le.steps||[]).map(z=>`${z.stage}:${z.model}:${z.status}:${z.progress}:${z.duration_ms}`)}:null});P!==le&&(le=P,V.innerHTML=ra(Le,Ie,Ee))},ye=async()=>{if(!s)try{let P=await G.testRuns(30);if(a)return;Ie=Array.isArray(P.runs)?P.runs:[]}catch{if(a)return;Ie=[]}},_e=async(P=null)=>{if(!s)try{let z=P&&!Ee?P:Ee?await G.testRun(Ee):await G.testRunCurrent();if(a)return;Le=z.run||null,!Ee&&Le&&Le.status!=="running"&&!Ie.some(J=>J.run_id===Le.run_id)&&await ye(),Me()}catch{if(a)return;Le=null,Me()}},je=async(P=null)=>{a||Ee||await _e(P)},D=()=>{s||a||Ze||(Ze=Et("test-runs",(P,z)=>je(z?.snapshot||null)))};V.addEventListener("change",async P=>{P.target.id==="test-run-select"&&(Ee=String(P.target.value||""),await _e())}),V.addEventListener("click",async P=>{P.target.closest("#test-flow-refresh")&&(Ee="",await ye(),await _e())});let F=async(P=o,{quiet:z=!1}={})=>{o=Math.max(1,Number(P)||1),n=Qo();let J=`judgment.performance.result.v1:${JSON.stringify({filters:n,page:o,pageSize:l})}`,$e=bs(J,120*1e3);$e&&o===1&&(d=$e,Q.innerHTML=Xo($e),se.textContent=`PERFORMANCE \xB7 ${c($e.total)} \u7B46`);let De=Q.querySelector(".report-card"),et=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!De?Q.setAttribute("aria-busy","true"):(Q.removeAttribute("aria-busy"),Q.innerHTML=Aa({label:"\u6548\u80FD\u5831\u8868"}));let ot=e.querySelector("#performance-run");z||Re(ot,!0,"\u67E5\u8A62\u4E2D\u2026");try{let nt=await G.performance(n,o,l);if(a)return;if(d=nt,cs(J,nt),nt.index_pipeline){b=nt.index_pipeline;let Ue=Array.isArray(b.runs)?b.runs:[];(!w||!Ue.some(ue=>String(ue.id)===String(w)))&&(w=b.latest?String(b.latest.id):""),S=!0,k=null}if(o=Number(nt.page)||o,l=Number(nt.page_size)||l,Q.removeAttribute("aria-busy"),Q.innerHTML=Xo(nt),et!==null){let Ue=Q.querySelector("[data-page-size]");Ue&&(Ue.value=String(l),Ue.focus({preventScroll:!0}))}se.textContent=`PERFORMANCE \xB7 ${c(nt.total)} \u7B46`,se.className="badge badge-neutral badge-mono"}catch(nt){if(a)return;Q.removeAttribute("aria-busy"),Q.innerHTML=Sn(nt,{label:"\u6548\u80FD\u5831\u8868"}),N(nt.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{a||Re(ot,!1)}},W=async()=>{let P=bs("judgment.performance.options.v1",3e5);if(P){i=P,ee(),G.performanceOptions().then(z=>{i=z,cs("judgment.performance.options.v1",z),ee()}).catch(()=>{});return}try{i=await G.performanceOptions(),cs("judgment.performance.options.v1",i)}catch{i={processes:[],modules:[],statuses:[],methods:[],models:[]}}ee()};return T.addEventListener("submit",P=>{P.preventDefault(),F(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{n=Qr(),o=1,ee(),F(1)}),L.addEventListener("click",async()=>{if(K==="pipeline"){Re(L,!0,"\u6574\u7406\u4E2D\u2026");try{await Te({force:!0})}finally{a||Re(L,!1)}return}if(K==="index-pipeline"){Re(L,!0,"\u6574\u7406\u4E2D\u2026");try{await qe({force:!0})}finally{a||Re(L,!1)}return}if(K==="benchmark"){if(s)return;Re(L,!0,"\u6574\u7406\u4E2D\u2026");try{await H.refresh()}finally{a||Re(L,!1)}return}n=Qo(),L.disabled=!0,Re(L,!0,"\u6574\u7406\u4E2D\u2026"),await W(),await ye(),a||await _e(),a||await F(1),a||(L.disabled=!1,Re(L,!1))}),Q.addEventListener("click",async P=>{let z=P.target.closest("[data-action]");if(!z||!d)return;let J=z.dataset.action;if(J==="retry"){F(o);return}if(J==="prev-page"){F(Math.max(1,Number(d.page)-1),{quiet:!0});return}if(J==="next-page"){let $e=Math.max(1,Math.ceil(Number(d.total)/Number(d.page_size)));F(Math.min($e,Number(d.page)+1),{quiet:!0});return}if(J==="copy-query"){let $e=await xs(d.query_text||"");N($e?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",$e?"ok":"warn");return}if(J==="export-json"){let $e=`performance-page-${d.page}.json`;Xt($e,JSON.stringify(An(d),null,2),"application/json;charset=utf-8"),N(`\u5DF2\u532F\u51FA ${$e}`,"ok");return}if(J==="export-csv"){let $e=`performance-page-${d.page}.csv`;Xt($e,xn(d),"text/csv;charset=utf-8"),N(`\u5DF2\u532F\u51FA ${$e}`,"ok")}}),Q.addEventListener("change",P=>{P.target.matches("[data-page-size]")&&(l=Number(P.target.value)||25,Zo.includes(l)||(l=25),F(1,{quiet:!0}))}),s?(await W(),a||await F(1)):(await Promise.allSettled([W(),ye()]),a||(await _e(),await F(1),D())),t&&typeof t.setTitle=="function"&&t.setTitle(It),()=>{a=!0,Ze&&Ze(),H.destroy()}}var $l="q",yl="share",ai="contentId",ni="rag/share",cl="https://judgment.ragdemo.win",tp=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5F9E\u696D\u4EBA\u54E1\u6709\u90A3\u4E9B\u898F\u5B9A\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function sp(){return`<div class="answer-placeholder">
    <span class="empty-icon">${m("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function Xr(){return`<section class="card answer-card rag-empty-answer">${sp()}</section>`}function wl(e){let t=r(e);return`<div class="rag-answer-actions" role="group" aria-label="\u56DE\u7B54\u64CD\u4F5C">
    <button class="rag-answer-action" type="button" data-rag-answer-action="copy" data-question="${t}" title="\u8907\u88FD\u56DE\u7B54" aria-label="\u8907\u88FD\u56DE\u7B54">${m("copy",15)}<span class="sr-only">\u8907\u88FD\u56DE\u7B54</span></button>
    <button class="rag-answer-action" type="button" data-rag-answer-action="share" data-question="${t}" title="\u5EFA\u7ACB\u516C\u958B\u9023\u7D50" aria-label="\u5EFA\u7ACB\u516C\u958B\u9023\u7D50">${m("share",15)}<span class="sr-only">\u5EFA\u7ACB\u516C\u958B\u9023\u7D50</span></button>
    <button class="rag-answer-action" type="button" data-rag-answer-action="reask" data-question="${t}" title="\u91CD\u65B0\u751F\u6210\u56DE\u7B54" aria-label="\u91CD\u65B0\u751F\u6210\u56DE\u7B54">${m("refresh",15)}<span class="sr-only">\u91CD\u65B0\u751F\u6210\u56DE\u7B54</span></button>
  </div>`}function dl(e,t,{complete:s=!0}={}){let a=r(e);return`<div class="rag-turn${s?" is-complete":" is-pending"}">
    <div class="rag-user-block">
      <div class="rag-user-bubble">${a}</div>
      <div class="rag-user-actions" role="group" aria-label="\u554F\u984C\u64CD\u4F5C">
        <button class="rag-user-action" type="button" data-rag-question-action="copy" data-question="${a}" title="\u8907\u88FD\u554F\u984C" aria-label="\u8907\u88FD\u554F\u984C">${m("copy",15)}<span class="sr-only">\u8907\u88FD\u554F\u984C</span></button>
        <button class="rag-user-action" type="button" data-rag-question-action="share" data-question="${a}" title="\u5EFA\u7ACB\u516C\u958B\u9023\u7D50" aria-label="\u5EFA\u7ACB\u516C\u958B\u9023\u7D50">${m("share",15)}<span class="sr-only">\u5EFA\u7ACB\u516C\u958B\u9023\u7D50</span></button>
        <button class="rag-user-action" type="button" data-rag-question-action="edit" data-question="${a}" title="\u7DE8\u8F2F\u554F\u984C" aria-label="\u7DE8\u8F2F\u554F\u984C">${m("edit",15)}<span class="sr-only">\u7DE8\u8F2F\u554F\u984C</span></button>
        <button class="rag-user-action" type="button" data-rag-question-action="reask" data-question="${a}" title="\u91CD\u65B0\u63D0\u554F" aria-label="\u91CD\u65B0\u63D0\u554F">${m("refresh",15)}<span class="sr-only">\u91CD\u65B0\u63D0\u554F</span></button>
      </div>
    </div>
    <div class="rag-answer-block">
      <section class="card rag-assistant-turn" data-rag-answer>${t}</section>
    </div>
  </div>`}function ap(e){let t=new URL(window.location.href);return t.search="",t.hash=`#/${ni}?${ai}=${encodeURIComponent(e)}`,t.toString()}function np(){let e=window.location.hash.replace(/^#\/?/,""),[t,s=""]=e.split("?"),a=t.replace(/\/+$/,"");if(a===ni)return String(new URLSearchParams(s).get(ai)||"").trim();let n=a.match(/^rag\/share\/([^/]+)$/);if(!n)return"";try{return decodeURIComponent(n[1])}catch{return n[1]}}function Zr({keepToken:e=!1,token:t=""}={}){try{let s=new URL(window.location.href);s.searchParams.delete($l),s.searchParams.delete(yl),s.hash=e&&t?`#/${ni}?${ai}=${encodeURIComponent(t)}`:"#/rag",window.history.replaceState(null,"",`${s.pathname}${s.search}${s.hash}`)}catch{}}function rp(){try{let e=new URL(window.location.href),t=String(e.searchParams.get(yl)||"").trim(),s=np()||t,a=String(e.searchParams.get($l)||"").trim();return!s&&!a?null:{token:s.slice(0,64),question:a.slice(0,500)}}catch{return null}}function ei(e){if(!e)return"";let t=Array.from(e.querySelectorAll("[data-rag-answer] .answer-text")).map(a=>String(a.textContent||"").trim()).filter(Boolean);if(t.length)return t.join(`

`);let s=e.querySelector("[data-rag-answer]");return s?String(s.innerText||"").trim():""}function ip(e){let t=e&&typeof e=="object"?e:{};return{status:t.status,answer:t.answer,answer_source:t.answer_source,notice:t.notice,citations:Array.isArray(t.citations)?t.citations:[],judgments:Array.isArray(t.judgments)?t.judgments:[],reference_judgments:Array.isArray(t.reference_judgments)?t.reference_judgments:[],law_sources:Array.isArray(t.law_sources)?t.law_sources:[],matched_terms:Array.isArray(t.matched_terms)?t.matched_terms:[],law_answer:t.law_answer,law_framework:t.law_framework,llm_model:t.llm_model,embedding_model:t.embedding_model,duration_ms:t.duration_ms,show_sources:t.show_sources,retrieval:t.retrieval,rerank_degraded:t.rerank_degraded,degraded_reason:t.degraded_reason,partial:!1,streaming:!1}}async function ti(e,t){let s=(Array.isArray(e)?e:[]).filter(o=>String(o?.question||"").trim()).map(o=>({question:String(o.question||"").trim().slice(0,500),asked_at:String(o.asked_at||""),payload:ip(o.payload)}));if(!s.length){N("\u6C92\u6709\u53EF\u5EFA\u7ACB\u516C\u958B\u9023\u7D50\u7684\u5C0D\u8A71\u3002","warn");return}let a=null;try{a=await G.ragShareCreate({title:String(t||s[0]?.question||"").slice(0,200),turns:s})}catch{a=null}if(!a?.id){N("\u7121\u6CD5\u5EFA\u7ACB\u516C\u958B\u9023\u7D50\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger",6e3);return}let n=ap(a.id);if(!await xs(n)){N("\u7121\u6CD5\u8907\u88FD\u516C\u958B\u9023\u7D50\uFF0C\u8ACB\u78BA\u8A8D\u700F\u89BD\u5668\u526A\u8CBC\u7C3F\u6B0A\u9650\u3002","danger",6e3);return}N("\u5DF2\u8907\u88FD\u516C\u958B\u9023\u7D50","ok",7e3,{detail:"\u4EFB\u4F55\u64C1\u6709\u6B64\u9023\u7D50\u7684\u4EBA\u90FD\u53EF\u4EE5\u67E5\u770B\u9019\u6BB5\u5C0D\u8A71\u3002",actionLabel:"\u958B\u555F\u9023\u7D50",onAction:()=>{window.open(n,"_blank","noopener,noreferrer")}})}function op(e,t){return Promise.race([e,new Promise((s,a)=>{window.setTimeout(()=>a(new Error("pipeline lookup timed out")),t)})])}async function lp(e){if(!e||e.pipeline_flow)return e;let t=String(e._client_request_id||e.request_id||"").trim();if(!t)return e;for(let s=0;s<3;s+=1){try{let a=await op(G.performance({keyword:t},1,5),1800),n=(Array.isArray(a.rows)?a.rows:[]).find(i=>String(i.request_id||"")===t&&i.flow&&typeof i.flow=="object");if(n)return e.pipeline_flow=n.flow,e}catch{}s<2&&await new Promise(a=>window.setTimeout(a,250))}return e}function ul(e){return{status:e.status,answer:e.answer,answer_source:e.answer_source,notice:e.notice,citations:Array.isArray(e.citations)?e.citations:[],judgments:Array.isArray(e.judgments)?e.judgments:[],law_sources:Array.isArray(e.law_sources)?e.law_sources:[],matched_terms:Array.isArray(e.matched_terms)?e.matched_terms:[],law_answer:e.law_answer,law_framework:e.law_framework,llm_model:e.llm_model,embedding_model:e.embedding_model,duration_ms:e.duration_ms,show_sources:e.show_sources,pipeline_flow:e.pipeline_flow||null,test_run:e.test_run||null,partial:!1,streaming:!1}}var cp={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"llama-server embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"llama-server LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function dp(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`llama-server run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`llama-server embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:cp[t]||t||"backend step"}function pl(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function ml(e){let t=Number(e);return Number.isFinite(t)?`${c(Math.max(0,Math.round(t)))} ms`:"\u2014"}function si(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function up(){return`<div class="rag-process is-open" id="rag-process">
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
  </div>`}function _l(e){let t=e?.pipeline_flow&&typeof e.pipeline_flow=="object"?e.pipeline_flow:null;if(!t)return"";let s=jn(t,{serverDurationMs:Number(e.duration_ms)||0,embedded:!0});if(!s)return"";let a=Array.isArray(t.decisions)?t.decisions.length:0;return`<div class="rag-process is-complete" id="rag-process">
    <div class="rag-process-control">
      <button type="button" class="rag-process-toggle" id="rag-process-toggle"
        aria-expanded="false" aria-controls="rag-process-body" title="\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B">
        <span class="rag-process-toggle-label-collapsed">\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
        <span class="rag-process-toggle-label-expanded">\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
        ${m("chevronDown",11)}
      </button>
      <span class="rag-process-summary" id="rag-process-summary">\u5B8C\u6210 \xB7 ${a} \u6C7A\u7B56</span>
    </div>
    <div class="rag-process-body" id="rag-process-body" hidden>${s}</div>
  </div>`}function pp(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),n=performance.now(),i=new Map,o=(v,p,b)=>{let w=v.querySelector(p);w&&(w.textContent=b)},l=v=>{if(v.failed){o(v.element,".rag-process-meta","\u5931\u6557");return}if(v.hasChildren){o(v.element,".rag-process-meta","");return}o(v.element,".rag-process-meta",ml(v.durationMs))},d=v=>{let p=v-1,b=[...i.values()].reverse();for(let w of b){if(p<0)break;w.depth<=p&&(w.hasChildren||(w.hasChildren=!0,w.element.dataset.hasChildren="true",w.finished&&l(w)),p=w.depth-1)}},u=v=>{if(!s)return null;let p=String(v?.seq??`step-${i.size+1}`),b=i.get(p);if(!b){let w=Math.max(0,Math.min(6,Number(v?.depth)||0));d(w);let M=document.createElement("div");M.className="rag-process-item is-running",M.dataset.processKey=p,M.style.setProperty("--depth",String(w)),M.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(M),b={element:M,depth:w,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(p,b)}return o(b.element,".rag-process-label",dp(v)),b.element.title=pl(v),b};return{step:v=>{let p=v?.segment;if(!p)return;let b=u(p);if(b){if(v.type==="segment_start"){b.element.classList.add("is-running"),o(b.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(v.type==="segment_end"){let w=p.status==="error";b.element.classList.remove("is-running"),b.element.classList.toggle("is-error",w),b.finished=!0,b.failed=w,b.durationMs=Number(p.duration_ms)||0,l(b),b.element.title=[pl(p),w&&p.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(v=!0,p=null)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(k=>{k.classList.remove("is-running");let S=k.dataset.hasChildren==="true";o(k,".rag-process-meta",S?"":v?"\u5B8C\u6210":"\u4E2D\u65B7")});let b=s?.children.length||i.size,w=ml(Math.max(0,performance.now()-n)),M=v&&p?.pipeline_flow&&typeof p.pipeline_flow=="object"?p.pipeline_flow:null;if(a&&(a.textContent=v?`\u5B8C\u6210 \xB7 ${b} \u6B65 \xB7 ${w}`:`\u5931\u6557 \xB7 ${b} \u6B65`),M){let k=jn(M,{serverDurationMs:Number(p.duration_ms)||0,embedded:!0}),S=t.querySelector("#rag-process-body");k&&S&&(S.innerHTML=k)}return t.classList.add("is-complete"),si(t,!1),t.outerHTML},collapse:()=>si(t,!1)}}function gl(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${m("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":up()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${r(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function fl(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function En(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let n=String(e||"").trim();return n?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t||n)}"
    data-source-type="${r(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(a||n)}</button>`:""}function kl(e){let t=String(e?.law_name||"").trim(),s=String(e?.article_no||"").replace(/\s+/g,"");if(!t||!s)return"";let a=(Array.isArray(e?.paragraphs)?e.paragraphs:[]).map(i=>String(i||"").trim()).filter(Boolean),n=`${t}${s}${a.join("\u3001")}`;return`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t)}"
    data-source-type=""
    data-article-no="${r(s)}"
    title="\u9EDE\u64CA\u67E5\u770B ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(n)}</button>`}function Sl(e){let t=String(e?.citation_status||"");return t==="cited"?"\u7B54\u6848\u5F15\u7528":t==="provided_not_cited"?"\u5DF2\u63D0\u4F9B\u7D66\u6A21\u578B\uFF0C\u7B54\u6848\u672A\u5F15\u7528":t==="reference_only"||e?.used_for_generation===!1?"\u50C5\u4F9B\u53C3\u8003\uFF08\u672A\u9032\u5165\u751F\u6210 prompt\uFF09":e?.used_for_generation===!0?"\u5DF2\u63D0\u4F9B\u7D66\u6A21\u578B":""}function ri(e,t){let s=Number(e);return Number.isFinite(s)?s:t}function mp(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(y=>`<span>${r(y)}</span>`).join(""),n=Sl(e),i=n?`<span>${r(n)}</span>`:"",o=(Array.isArray(e.law_citations)?e.law_citations:[]).map(y=>kl(y)).filter(Boolean).slice(0,12).join(""),l=o||(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(y=>En(y)).join(""),d=o?'<div class="citation-meta"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':"",u=e.jid?` data-action="open-parquet-judgment"
        data-jid="${r(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${r(e.jid)}"`:"",h=e.pdf_url?`<a class="citation-link" href="${r(Ft(e.pdf_url))}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${m("external",11)}</a>`:"";return`<article class="citation">
    <span class="citation-index">[${ri(e.index,t+1)}]</span>
    <div class="citation-body">
      <div class="citation-head"${u}>
        <h4 class="citation-name">${r(e.jid||"\u672A\u77E5\u6848\u865F")}</h4>
        <div class="citation-meta">${a||"<span>\u5224\u6C7A metadata</span>"}${i}</div>
        ${e.title?`<div class="citation-meta"><span>\u6848\u7531\uFF1A${r(e.title)}</span></div>`:""}
      </div>
      ${d}
      ${l?`<div class="chips" style="margin-top:8px">${l}</div>`:""}
      ${e.snippet?`<p class="citation-snippet">${r(e.snippet)}</p>`:""}
    </div>
    <div class="citation-links">${h}</div>
  </article>`}function gp(e){let t=[e.court,e.jdate].filter(Boolean).map(n=>`<span>${r(n)}</span>`).join(""),s=[e.vector_score!==null&&e.vector_score!==void 0?`\u5411\u91CF ${Number(e.vector_score).toFixed(4)}`:"",e.rerank_score!==null&&e.rerank_score!==void 0?`rerank ${Number(e.rerank_score).toFixed(4)}`:""].filter(Boolean).map(n=>`<span>${r(n)}</span>`).join("");return`<article class="citation reference-judgment">
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
  </article>`}function fp(e,t){let s=[e.law_level,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${r(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${r(Ft(e.law_url))}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${m("external",11)}</a>`:"",n=e.law_key||e.law_name||"",i=n?` data-action="open-law-source"
        data-law-key="${r(n)}"
        data-source-type=""
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation">
    <span class="citation-index">${String(ri(e.index,t+1)).padStart(2,"0")}</span>
    <div class="citation-body"${i}>
      <h4 class="citation-name">${r(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${s||"<span>\u6CD5\u898F metadata</span>"}</div>
      ${e.snippet?`<p class="citation-snippet">${r(e.snippet)}</p>`:""}
    </div>
    ${a}
  </article>`}function bp(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",n=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${r(s)}</span>`,a?r(a):"",e.law_category?r(e.law_category):"",e.article_live||e.article_count?`${c(e.article_live||e.article_count)} \u689D\u751F\u6548${e.article_deleted?`\uFF08\u5171 ${c(e.article_total||e.article_count)} \u689D\u865F\uFF0C\u5DF2\u522A\u9664 ${c(e.article_deleted)} \u689D\uFF09`:""}`:"",e.dataset_update_date?`\u8CC7\u6599\u622A\u81F3 ${Ut(e.dataset_update_date)}`:"",e.law_modified_date?`\u7570\u52D5 ${Ut(e.law_modified_date)}`:"",Sl(e)].filter(Boolean).map(p=>`<span>${p}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${r(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${r(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>${o.sampled?`\u53D6\u6A23 ${c(o.judgment_count||0)} \u7B46\u63D0\u53CA\u300C${r(o.entity||"")}\u300D\u7684\u5224\u6C7A`:`\u63D0\u53CA\u300C${r(o.entity||"")}\u300D\u7684\u5224\u6C7A ${c(o.judgment_count||0)} \u7B46`}</span>
        <span>${o.sampled?"\u53D6\u6A23\u4E2D":"\u672C\u6CD5\u898F"}\u88AB\u5F15\u7528 ${c(o.law_count||0)} \u6B21</span>
      </div>`:"",d=e.law_key||"",u=e.source_type||"",h=(Array.isArray(e.articles)?e.articles:[]).map(p=>{let b=String(p.article_no||"");return`<div class="law-source-article"${d&&b?` data-action="open-law-source"
        data-law-key="${r(d)}"
        data-source-type="${r(u)}"
        data-article-no="${r(b)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${r(b)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} ${r(b)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${r(p.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${r(p.article_content||"")}</p>
      </div>`}).join(""),y=e.law_url?`<a class="citation-link" href="${r(Ft(e.law_url))}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${m("external",11)}</a>`:"",v=e.law_key?` data-action="open-law-source"
        data-law-key="${r(e.law_key)}"
        data-source-type="${r(e.source_type||"")}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u672C\u5730 Parquet \u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation law-source">
    <span class="citation-index">${String(ri(e.index,t+1)).padStart(2,"0")}</span>
    <div class="citation-body"${v}>
      <h4 class="citation-name">${r(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${n}</div>
      ${i}
      ${l}
      ${h}
    </div>
    <div class="citation-links">${y}</div>
  </article>`}function hp(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function vp(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${r(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",n=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(n==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),d=s.index!=null?`<span class="law-answer-index">[${r(String(s.index))}]</span>`:"",u=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${r(a)}"
            data-source-type="${r(n)}"
            title="\u9EDE\u64CA\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587">${r(i)}</button>`:`<strong>${r(i)}</strong>`,h=Array.isArray(s.articles)?s.articles:[],y=h.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${h.map(v=>{let p=String(v.article_no||"").trim(),b=hp(v.article_content);return!a||!p?`<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${r(p||"\u689D\u6587")}</span>
                  <span class="law-answer-article-text">${r(b)}</span>
                </div>`:`<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${r(a)}"
                data-source-type="${r(n)}"
                data-article-no="${r(p)}"
                title="\u9EDE\u64CA\u67E5\u770B ${r(p)} \u7684\u5B8C\u6574\u5167\u5BB9"
                aria-label="\u958B\u555F ${r(i)} ${r(p)} \u7684\u5B8C\u6574\u689D\u6587">
                <span class="law-answer-article-no">${r(p)}</span>
                <span class="law-answer-article-text">${r(b)}</span>
              </button>`}).join("")}</div>`:"";return`<div class="law-answer-source">
        <div class="law-answer-source-head">
          ${u}
          <span class="law-answer-source-meta">\uFF08${r(o)}\uFF0C${c(l)} \u689D\uFF09</span>
          ${d}
        </div>
        ${y}
      </div>`}).join("")}</div>`}function $p(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let n=s.get(String(a));return n?.law_key?En(a,{lawKey:n.law_key,sourceType:n.source_type||""}):`<span class="chip">${r(a)}</span>`}).join("")}</div>`}function yp(e){let t=String(e||"");return t==="operational"?"is-ok":t==="standby"?"is-idle":"is-down"}function wp(e){let t=String(e||"");return t==="operational"?"":t==="standby"?"\u5099\u63F4":t==="disabled"?"\u505C\u7528":t==="not_configured"?"\u672A\u8A2D\u5B9A":"\u96E2\u7DDA"}function bl(e,{fallback:t=!1}={}){if(!e)return`<span class="rag-model-cell is-empty">
      <span class="rag-model-state is-idle" aria-hidden="true"></span>
      <span class="rag-model-name">\u672A\u8A2D\u5B9A</span>
    </span>`;let s=String(e.label||"").trim()||[e.host,e.model].filter(Boolean).join(":"),a=String(e.status||""),n=!["operational","standby"].includes(a),i=t&&!n?"\u5099\u63F4":wp(a),o=n?"is-down":t?"is-idle":yp(a),l=[s,e.url,i].filter(Boolean).join(" \xB7 ");return`<span class="rag-model-cell" title="${r(l)}">
    <span class="rag-model-state ${o}" aria-hidden="true"></span>
    <span class="rag-model-name">${r(s)}</span>
    ${i?`<span class="rag-model-note">${r(i)}</span>`:""}
  </span>`}function _p(e,t){let s=Array.isArray(e)?e:[],a=[{kind:"chat",label:"Chat"},{kind:"embedding",label:"Embedding"},{kind:"rerank",label:"Rerank"}],n=new Map(s.map(o=>[String(o.kind||""),o])),i=a.map(o=>{let l=n.get(o.kind)||o;return`<tr>
        <td class="rag-model-kind">${r(l.label||o.label)}</td>
        <td>${bl(l.active)}</td>
        <td>${bl(l.fallback,{fallback:!0})}</td>
      </tr>`}).join("");return`<div class="rag-model-strip">
    <div class="rag-model-strip-head">
      <span class="rag-model-strip-title">${m("layers",13)} Models</span>
      <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
        data-rag-action="refresh-models"
        ${t?"disabled":""}>
        ${m("refresh",12)}<span>${t?"\u6AA2\u67E5\u4E2D\u2026":"\u91CD\u65B0\u6AA2\u67E5"}</span>
      </button>
    </div>
    <table class="rag-model-table">
      <thead><tr><th>\u6A21\u578B</th><th>\u4F7F\u7528\u4E2D</th><th>Fallback</th></tr></thead>
      <tbody>${i}</tbody>
    </table>
  </div>`}function Tn({tone:e,title:t,text:s,modelSummary:a=[],refreshing:n=!1,expanded:i=!1}){let o=e==="ok"?"is-ok":e==="warn"?"is-warn":"is-info",l=e==="ok"?"check":e==="warn"?"alert":"info",d=e==="ok"?"badge-ok":e==="warn"?"badge-warn":"badge-info";return`<section class="rag-mode-card ${o}${i?" is-expanded":""}">
    <div class="rag-mode-head" role="button" tabindex="0" aria-expanded="${i}">
      <span class="rag-mode-icon" aria-hidden="true">${m(l,14)}</span>
      <div class="rag-mode-copy">
        <strong>${r(t)}</strong>
        <p>${r(s)}</p>
      </div>
      <span class="badge ${d}">3 \u500B\u6A21\u578B</span>
      <span class="rag-mode-chevron" aria-hidden="true">${m("chevronDown",14)}</span>
    </div>
    ${_p(a,n)}
  </section>`}function xl(e,t=""){let s=Array.isArray(e.citations)?e.citations:[],a=Array.isArray(e.judgments)?e.judgments:[],n=Array.isArray(e.reference_judgments)?e.reference_judgments:[],i=Array.isArray(e.law_sources)?e.law_sources:[],o=e.retrieval||{},l=Array.isArray(e.matched_terms)?e.matched_terms:[],d=e.status||"preview",u=!!e.partial,h=!!e.streaming,y=!!e.rerank_degraded,v=!!e.show_sources||!u,p=e.answer_source==="structured",b=String(e.law_answer||"").trim(),w=e.law_framework||null,M=Array.isArray(w?.rows)?w.rows:[],k=Array.isArray(w?.sources)?w.sources:[],S=M.length>0,f=!!b&&!p&&!S,T=a.filter(le=>le.used_for_generation===!0).length,V=a.some(le=>le.used_for_generation!==void 0),Q=a.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${a.length} \u7B46${V?`\uFF08${T} \u7B46\u9032\u5165 prompt\uFF09`:""}</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${a.map((le,ee)=>mp(le,ee)).join("")}</div>`:"",fe=o.judgment_limit_applied&&n.length?`<div class="reference-judgment-note">
          <span>\u672C\u984C\u4F9D\u984C\u610F\u4E3B\u8981\u8A62\u554F\u6CD5\u898F\u898F\u5B9A\uFF0C\u6545\u5224\u6C7A\u50C5\u986F\u793A ${a.length} \u7B46\u4F5C\u70BA\u53C3\u8003\u3002\u53E6\u6709 ${n.length} \u7B46\u76F8\u95DC\u5224\u6C7A\uFF08${n.some(le=>le.rerank_score!==null&&le.rerank_score!==void 0)?"\u4F9D rerank \u5206\u6578\u6392\u5E8F":"\u4F9D\u6AA2\u7D22\u5206\u6578\u6392\u5E8F"}\uFF09\uFF0C</span>
          <details class="reference-judgments">
            <summary>\u5C55\u958B\u67E5\u770B</summary>
            <div class="citation-list reference-judgment-list">${n.map(le=>gp(le)).join("")}</div>
          </details>
        </div>`:"",ve=i.length&&!f?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${i.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${i.map((le,ee)=>bp(le,ee)).join("")}</div>`:"",se=!a.length&&s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${s.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${s.map((le,ee)=>fp(le,ee)).join("")}</div>`:"",L=v?Q+fe+ve+se:"";!L&&!u&&!f&&!S&&(L=`<div class="answer-divider"></div>
      ${xt({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:d==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let q=$p(l,i),E=e.test_run,K=String(e.llm_model||E?.primary_model||"").trim(),de=String(e.embedding_model||"").trim(),H=[K?`LLM\uFF1A${K}`:"",de?`Embedding\uFF1A${de}`:""].filter(Boolean).join(" \xB7 "),ie=h||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",Te=S?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${r(w.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${M.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${M.map(le=>`<tr>
                    <td>${r(le.law_name||"\u2014")}</td>
                    <td class="cell-number">${r(le.article_no||"\u2014")}</td>
                    <td>${r(le.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${k.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${k.map(le=>{let ee=String(le?.law_name||le||"").trim(),Me=le&&le.index!==null&&le.index!==void 0?` [${r(le.index)}]`:"";return En(ee,{label:`${ee}${Me}`})}).join("")}
              </div>`:""}
      </div>`:"",B=e.answer_source==="llm"&&K?`<span class="answer-model" title="${r(H)}">${m("brain",11)}${r(K)}</span>`:p?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${m("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",qe=h?`${K||"LLM"} \xB7 \u751F\u6210\u4E2D`:B?K||"structured":"retrieval",ae=E?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${at(E.status)}
          <span class="mono">${r(E.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(E.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(E.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${r(E.primary_model||"\u2014")}</span>
          <span>${Number(E.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",Ie=String(e.answer||"").trim()||(h?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":u?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),Ee=h?" data-partial-answer":"",Ze=h?" is-streaming":"";return`${Te}
      ${f?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${u&&!v?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${i.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${vp(i,b)}</div>
            </div>`:""}
      <div class="answer-block">
        ${f||S?`<div class="answer-block-head">
                <span>${r(ie)}</span>
                <span>${r(qe)}</span>
              </div>`:""}
        <p class="answer-text${Ze}"${Ee}>${r(Ie)}</p>
      </div>
      ${t}
      ${y?'<div class="answer-notice" data-rerank-degraded="true">\u6392\u5E8F\u7CBE\u7C21\u6A21\u5F0F\uFF1A\u672C\u6B21\u90E8\u5206 rerank \u903E\u6642\u6216\u964D\u7D1A\uFF0C\u4F86\u6E90\u53EF\u80FD\u4EE5\u5411\u91CF\u9806\u5E8F\u986F\u793A\u3002</div>':""}
      ${e.notice?`<div class="answer-notice">${r(e.notice)}</div>`:""}
      ${ae}
      ${q}
      ${L}`}function hl(e,t,s=""){let a=t.status||"preview",n=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),d=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),u=t.answer_source==="structured",h=s||_l(t),y=t.answer_source==="llm"&&o?`<span class="answer-model" title="${r(d)}">${m("brain",11)}${r(o)}</span>`:u?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${m("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${m("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${at(a,n)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${y}
      </div>
      ${h}
    </div>
    <div class="answer-body">${xl(t,wl(e))}</div>`}function kp(e,t="",s=""){return`<div class="answer-head">
      <div class="answer-head-left">${m("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${Ge({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      ${s?wl(s):""}
    </div>`}function Sp(e){let t=Array.isArray(e.turns)?e.turns:[],s=t.length?t[t.length-1].payload||{}:e.payload||{},a=Array.isArray(s.citations)?s.citations.length:0,n=Array.isArray(s.judgments)?s.judgments.length:0,i=Array.isArray(s.law_sources)?s.law_sources.length:0;return a+n+i}function xp(e,t,s,a=null){let n=e.id??s,i=Sp(e),o=t.get(String(e.project_id||"")),l=Array.isArray(e.turns)?e.turns:[],d=e.updated_at||e.created_at,u=a!=null&&String(a)===String(n);return`<div class="rag-history-item${e.pinned?" is-pinned":""}${u?" is-active":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${r(String(n))}">
      <span class="history-question">${r(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${r(ga(d))}</span>
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
        aria-pressed="${e.pinned?"true":"false"}">${m("pin",14)}</button>
      <button class="rag-history-more" type="button"
        data-rag-action="open-history-menu" data-history-id="${r(String(n))}"
        title="\u66F4\u591A\u64CD\u4F5C" aria-label="\u66F4\u591A\u64CD\u4F5C" aria-haspopup="menu" aria-expanded="false">${m("more",14)}</button>
    </div>
  </div>`}function vl(e,t,s){let a=new Map;for(let i of t){let o=String(i.project_id||"");o&&a.set(o,(a.get(o)||0)+1)}let n=[`<button class="rag-project${s?"":" is-active"}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${s?"false":"true"}">
      <span class="rag-project-name">${m("grid",13)}<span>\u5168\u90E8</span></span>
      <span class="rag-project-count">${t.length}</span>
    </button>`];for(let i of e){let o=String(i.id),l=a.get(o)||0;n.push(`<button class="rag-project${s===o?" is-active":""}" type="button" data-rag-action="select-project" data-project-id="${r(o)}" aria-pressed="${s===o?"true":"false"}">
      <span class="rag-project-name">${m("folder",13)}<span>${r(i.name)}</span></span>
      <span class="rag-project-count">${l}</span>
    </button>`)}return e.length||n.push('<div class="rag-library-empty">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\u3002</div>'),n.push(`<div class="rag-project-add-wrap">
    <button class="rag-project-add" type="button" data-rag-action="show-project-form">${m("plus",13)}<span>\u5EFA\u7ACB\u5C08\u6848</span></button>
    <form class="rag-project-form" data-rag-form="project" hidden>
      <input class="input" type="text" name="project_name" maxlength="60" placeholder="\u5C08\u6848\u540D\u7A31" aria-label="\u5C08\u6848\u540D\u7A31" autocomplete="off" />
      <div class="rag-project-form-actions">
        <button class="btn btn-primary btn-sm" type="submit">\u5EFA\u7ACB</button>
        <button class="btn btn-ghost btn-sm" type="button" data-rag-action="cancel-project">\u53D6\u6D88</button>
      </div>
    </form>
  </div>`),n.join("")}async function Ap(e){let t=rp();t&&!t.token&&Zr();let s=new WeakMap,a=!1,n=[],i=!1,o=[],l=!1,d="",u=8,h="",y=0,v=null,p=[],b=!1,w=!1,M={embedding:[],llm:[]},k=null,S=null,f=!1,T=!1;e.innerHTML=`<section class="page rag-page">
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
            \u6B77\u53F2\u6E05\u55AE\u53EA\u5B58\u5728\u6B64\u700F\u89BD\u5668\uFF1B\u9001\u51FA\u554F\u984C\u6642\u6703\u50B3\u9001\u5230\u4F3A\u670D\u5668\u7522\u751F\u7B54\u6848\u3002\u4F3A\u670D\u5668\u4FDD\u7559\u63D0\u554F\u8207\u56DE\u7B54\u6587\u5B57 90 \u5929\u3001\u5B89\u5168\u7A3D\u6838\u4E8B\u4EF6 180 \u5929\uFF1B\u5099\u4EFD\u4F9D 90 \u5929\u8F2A\u66FF\u653F\u7B56\u7531\u7DAD\u904B\u522A\u9664\uFF0C\u7A0B\u5F0F\u4E0D\u81EA\u52D5\u522A\u9664\u5099\u4EFD\u3002
          </div>
        </section>
      </aside>
      <div class="rag-workspace">
        <div class="rag-workspace-toolbar">
          <a class="rag-friend-link" href="https://judgment.ragdemo.win" target="_blank" rel="noopener noreferrer"
            data-workspace-action="friend-share">${m("gift",14)}<span>\u5206\u4EAB\u7D66\u670B\u53CB</span></a>
          <button class="rag-workspace-icon" type="button" data-workspace-action="menu"
            aria-haspopup="menu" aria-expanded="false" aria-controls="rag-workspace-menu"
            title="\u66F4\u591A\u5C0D\u8A71\u64CD\u4F5C" aria-label="\u66F4\u591A\u5C0D\u8A71\u64CD\u4F5C">${m("more",16)}</button>
          <button class="rag-workspace-icon" type="button" data-workspace-action="share"
            title="\u5EFA\u7ACB\u516C\u958B\u9023\u7D50" aria-label="\u5EFA\u7ACB\u516C\u958B\u9023\u7D50">${m("share",16)}</button>
          <div class="rag-history-menu rag-workspace-menu" id="rag-workspace-menu" role="menu" hidden></div>
        </div>
        <header class="rag-hero rag-hero-compact">
      <div id="rag-mode-notice">${Ge({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
      <div id="rag-test-mode"></div>
      <form class="ask-card" id="rag-form" autocomplete="off">
        <label class="sr-only" for="rag-question">\u8F38\u5165\u6CD5\u5F8B\u554F\u984C</label>
        <textarea class="ask-input" id="rag-question" name="question" rows="3"
          maxlength="500" placeholder="\u4F8B\u5982\uFF1A\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F"
          aria-describedby="rag-input-help"></textarea>
        <p class="ask-privacy-note">\u8ACB\u52FF\u8F38\u5165\u500B\u4EBA\u8CC7\u6599\uFF1B\u63D0\u554F\u8207\u56DE\u7B54\u4FDD\u7559 90 \u5929\u3001\u5B89\u5168\u7A3D\u6838\u4FDD\u7559 180 \u5929\uFF1B\u5099\u4EFD\u4F9D 90 \u5929\u8F2A\u66FF\u653F\u7B56\u7BA1\u7406\u3002</p>
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
        ${tp.map(g=>`<button class="example-chip" type="button" data-question="${r(g)}">${r(g)}</button>`).join("")}
      </div>
    </header>

    <section class="rag-conversation" id="rag-conversation" aria-live="polite">
      <div class="rag-turns" id="rag-turns">
        ${Xr()}
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
  </section>`;let V=e.querySelector("#rag-form"),Q=e.querySelector("#rag-question"),fe=e.querySelector("#rag-submit"),ve=e.querySelector(".rag-page");ve.classList.toggle("is-shared-view",!!t);let se=e.querySelector(".rag-workspace-toolbar"),L=e.querySelector("#rag-workspace-menu"),q=e.querySelector('[data-workspace-action="menu"]'),E=e.querySelector("#rag-turns"),K=e.querySelector("#rag-followup-form"),de=e.querySelector("#rag-followup-question"),H=e.querySelector("#rag-followup-submit"),ie=e.querySelector("#rag-history"),Te=e.querySelector("#rag-storage-note"),B=e.querySelector("#rag-clear-history"),qe=e.querySelector(".rag-library"),ae=e.querySelector("#rag-pinned-body"),Le=e.querySelector("#rag-projects-body"),Ie=e.querySelector("#rag-pinned-count"),Ee=e.querySelector("#rag-projects-count"),Ze=e.querySelector("#rag-recent-count"),le=e.querySelector("#rag-library-context"),ee=e.querySelector("#rag-test-mode"),Me=e.querySelector("#rag-test-flow"),ye=e.querySelector("#rag-history-menu"),_e=e.querySelector("#rag-judgment-dialog"),je=e.querySelector("#rag-law-dialog"),D=e.querySelector("#rag-mode-notice"),F=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};_e?.addEventListener("close",F),je?.addEventListener("close",F);let W=null,P=null,z,J=null,$e=null,De=()=>{Q.style.height="auto",Q.style.height=`${Math.min(Q.scrollHeight,220)}px`},et=()=>{de.style.height="auto",de.style.height=`${Math.min(de.scrollHeight,160)}px`},ft=g=>{b=!!g,ve.classList.toggle("has-conversation",b)},ot=()=>{b&&(K.hidden=!1,et())},nt=()=>{K.hidden=!0},Ue=()=>{ye.hidden&&!$e||(ye.hidden=!0,ye.innerHTML="",$e&&$e.setAttribute("aria-expanded","false"),J=null,$e=null)},ue=(g,A)=>{let j=E.querySelector(".rag-empty-answer");j&&j.remove(),E.insertAdjacentHTML("beforeend",dl(g,A,{complete:!1}));let U=E.lastElementChild,be=U?.querySelector("[data-rag-answer]");return window.requestAnimationFrame(()=>{U?.scrollIntoView({behavior:"smooth",block:"start"})}),{turnElement:U,answerElement:be}},rt=(g,A)=>{let j=g?.querySelector(".rag-user-bubble");j&&(j.textContent=A),g?.querySelectorAll("[data-rag-question-action], [data-rag-answer-action]").forEach(U=>{U.dataset.question=A})},We=()=>{E.innerHTML=p.length?p.map(A=>dl(A.question,hl(A.question,A.payload||{},""))).join(""):Xr(),Array.from(E.querySelectorAll(".rag-turn")).forEach((A,j)=>{let U=p[j]?.payload;U&&s.set(A,U)})},mt=async g=>{try{let A=await G.ragShareGet(g);if(a)return!1;let j=(Array.isArray(A?.turns)?A.turns:[]).map(U=>({question:String(U?.question||"").trim().slice(0,500),asked_at:String(U?.asked_at||""),payload:U?.payload&&typeof U.payload=="object"?U.payload:{}})).filter(U=>U.question);if(!j.length)throw new Error("\u5206\u4EAB\u5167\u5BB9\u662F\u7A7A\u7684\u3002");return v=null,p=j,h=j[j.length-1]?.question||"",ft(!0),We(),ot(),he(),Re(fe,!1),Re(H,!1),Zr({keepToken:!0,token:g}),window.scrollTo({top:0,behavior:"auto"}),N("\u5DF2\u8F09\u5165\u5206\u4EAB\u7684\u5C0D\u8A71\u3002","ok",3200),!0}catch{return Zr(),a||N("\u5206\u4EAB\u9023\u7D50\u5DF2\u5931\u6548\u6216\u7121\u6CD5\u8F09\u5165\u3002","warn",5200),!1}},wt=(g,A)=>{let j=Array.from(E.querySelectorAll(".rag-turn")),U=j.indexOf(g),be=U>=0?U+1:j.length,ke=[];for(let Ce=0;Ce<be;Ce+=1){let xe=j[Ce],lt=p[Ce],Xe=String(lt?.question||xe?.querySelector(".rag-user-bubble")?.textContent||"").trim();if(!Xe)continue;let bt=lt?.payload||s.get(xe)||(Ce===U?{status:"operational",answer:ei(xe),answer_source:"shared"}:{});ke.push({question:Xe,asked_at:lt?.asked_at||"",payload:bt})}return!ke.length&&A&&ke.push({question:A,asked_at:"",payload:{status:"operational",answer:ei(g),answer_source:"shared"}}),ke},ne=g=>{let A=Array.isArray(g.turns)?g.turns:[];return A.length?(Ye(),y+=1,ms(),as(null),v=g.id??null,p=A.map(j=>({...j})),h=p[p.length-1]?.question||"",ft(!0),We(),ot(),he(),Re(fe,!1),Re(H,!1),window.setTimeout(()=>{K.scrollIntoView({behavior:"smooth",block:"end"})},50),!0):!1},he=()=>{if(a)return;if(Ue(),!i){ie.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',ae.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',Ie.textContent="0",Ze.textContent="0",l&&(Le.innerHTML=vl(o,[],d));return}let g=o.find(xe=>String(xe.id)===d)||null;d&&!g&&(d="");let A=new Map(o.map(xe=>[String(xe.id),xe])),j=n.filter(xe=>!!xe.pinned),U=n.filter(xe=>!xe.pinned),be=d?U.filter(xe=>String(xe.project_id||"")===d):U,ke=be.slice(0,u),Ce=(xe,lt)=>xp(xe,A,lt,v);ae.innerHTML=j.length?j.map(Ce).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',Le.innerHTML=vl(o,n,d),ie.innerHTML=ke.length?ke.map(Ce).join(""):`<div class="rag-library-empty">${d?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u672A\u91D8\u9078\u7684\u9805\u76EE\u3002":j.length?"\u6700\u8FD1\u7684\u9805\u76EE\u90FD\u5DF2\u91D8\u9078\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,be.length>u&&ie.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${c(be.length-u)} \u7B46</button>`),Ie.textContent=String(j.length),Ee.textContent=String(o.length),Ze.textContent=String(be.length),g?(le.hidden=!1,le.innerHTML=`<span>${m("folder",12)}<strong>${r(g.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${m("x",12)}</button>`):(le.hidden=!0,le.innerHTML="")},tt=async()=>{try{let g=await Ls("rag.projects",[]);o=Array.isArray(g)?g.map(A=>({id:String(A?.id||""),name:String(A?.name||"").trim()})).filter(A=>A.id&&A.name):[]}catch{o=[]}l=!0,a||he()},Qe=g=>{d=String(g||""),u=8,he()},Bt=()=>{let g=Le.querySelector('[data-rag-form="project"]');g&&(g.hidden=!1,g.querySelector("input")?.focus())},$t=()=>{let g=Le.querySelector('[data-rag-form="project"]');g&&(g.hidden=!0,g.reset())},x=async g=>{let A=g.elements.project_name,j=String(A?.value||"").trim();if(!j){N("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),A?.focus();return}if(o.some(be=>be.name.toLowerCase()===j.toLowerCase())){N("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),A?.focus();return}let U=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;o=[...o,{id:U,name:j.slice(0,60),created_at:new Date().toISOString()}],d=U,u=8,await Sa("rag.projects",o),he(),N(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${j}\u300D\u3002`,"ok")},R=async g=>{let A=n.find(be=>String(be.id)===String(g));if(!A)return;let j=!A.pinned;if(!await ka(A.id,{pinned:j})){N("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}A.pinned=j,he(),N(j?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},C=()=>{Ye(),y+=1,ms(),as(null),h="",v=null,p=[],ft(!1),nt(),E.innerHTML=Xr(),Q.value="",De(),de.value="",et(),Re(fe,!1),Re(H,!1),he(),_e?.open&&_e.close(),je?.open&&je.close(),Q.focus(),window.scrollTo({top:0,behavior:"smooth"})},O=g=>{if(!g||ye.hidden)return;let A=g.getBoundingClientRect(),j=ye.getBoundingClientRect(),U=6,be=A.bottom+U;be+j.height>window.innerHeight-8&&(be=Math.max(8,A.top-j.height-U));let ke=A.right-j.width;ke=Math.max(8,Math.min(ke,window.innerWidth-j.width-8)),ye.style.left=`${Math.round(ke)}px`,ye.style.top=`${Math.round(be)}px`},Y=g=>{ye.innerHTML=`
      <button type="button" role="menuitem" data-menu-action="rename">${m("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${m("pin",13)}<span>${g.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${m("link",13)}<span>\u5EFA\u7ACB\u516C\u958B\u9023\u7D50</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${m("trash",13)}<span>\u522A\u9664</span></button>`},oe=g=>{let A=String(g.project_id||""),j=[{id:"",name:"\u672A\u5206\u985E"},...o.map(U=>({id:String(U.id),name:U.name}))];ye.innerHTML=`
      <div class="rag-history-menu-head">${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${j.map(U=>`<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${r(U.id)}">
            <span class="rag-history-menu-check">${A===U.id?m("check",12):""}</span>
            <span>${r(U.name)}</span>
          </button>`).join("")}
      ${o.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${m("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},me=(g,A)=>{let j=n.find(U=>String(U.id)===String(A));j&&(Ue(),J=String(j.id),$e=g,Y(j),ye.hidden=!1,g.setAttribute("aria-expanded","true"),O(g))},Fe=async g=>{let A=window.prompt("\u91CD\u65B0\u547D\u540D\u5C0D\u8A71",g.title||"");if(A===null)return;let j=A.trim();if(!j){N("\u540D\u7A31\u4E0D\u80FD\u7A7A\u767D\u3002","warn");return}if(j===g.title)return;if(!await ka(g.id,{title:j})){N("\u91CD\u65B0\u547D\u540D\u5931\u6557\u3002","danger");return}g.title=j,he(),N("\u5C0D\u8A71\u5DF2\u91CD\u65B0\u547D\u540D\u3002","ok")},Oe=async g=>{let A=(Array.isArray(g.turns)?g.turns:[]).map(j=>({question:String(j?.question||"").trim(),asked_at:String(j?.asked_at||""),payload:j?.payload&&typeof j.payload=="object"?j.payload:{}}));A.length||A.push({question:g.title||"\u672A\u547D\u540D\u5C0D\u8A71",asked_at:"",payload:{}}),await ti(A,g.title||"Judgment RAG \u5C0D\u8A71")},Be=async g=>{if(!window.confirm(`\u522A\u9664\u5C0D\u8A71\u300C${g.title||"\u672A\u547D\u540D\u5C0D\u8A71"}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002`))return;if(!await go(g.id)){N("\u522A\u9664\u5931\u6557\u3002","danger");return}let j=v!==null&&String(v)===String(g.id);n=n.filter(U=>String(U.id)!==String(g.id)),j?C():he(),N("\u5C0D\u8A71\u5DF2\u522A\u9664\u3002","ok")},Ke=async(g,A)=>{if(!await ka(g.id,{project_id:A})){N("\u79FB\u81F3\u5C08\u6848\u5931\u6557\u3002","danger");return}g.project_id=A;let U=o.find(be=>String(be.id)===String(A));he(),N(U?`\u5DF2\u79FB\u81F3\u5C08\u6848\u300C${U.name}\u300D\u3002`:"\u5DF2\u79FB\u51FA\u5C08\u6848\u3002","ok")},it=()=>n.find(g=>v!==null&&String(g.id)===String(v))||null,Ye=()=>{L&&(L.hidden=!0,L.innerHTML="",q?.setAttribute("aria-expanded","false"))},la=()=>{let g=it(),A=g?"":" disabled";L.innerHTML=`
      <button type="button" role="menuitem" data-workspace-menu-action="rename"${A}>${m("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-workspace-menu-action="pin"${A}>${m("pin",13)}<span>${g?.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078\u5C0D\u8A71"}</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-workspace-menu-action="delete"${A}>${m("trash",13)}<span>\u522A\u9664</span></button>
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-workspace-menu-action="move"${A}>${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      ${g?"":'<div class="rag-history-menu-note">\u76EE\u524D\u6C92\u6709\u53EF\u7BA1\u7406\u7684\u5C0D\u8A71\u3002</div>'}`},Ca=g=>{let A=String(g.project_id||""),j=[{id:"",name:"\u672A\u5206\u985E"},...o.map(U=>({id:String(U.id),name:U.name}))];L.innerHTML=`
      <div class="rag-history-menu-head">${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${j.map(U=>`<button type="button" role="menuitem"
            data-workspace-menu-action="assign-project" data-project-id="${r(U.id)}">
            <span class="rag-history-menu-check">${A===U.id?m("check",12):""}</span>
            <span>${r(U.name)}</span>
          </button>`).join("")}
      ${o.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-workspace-menu-action="back">${m("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},Gn=()=>{Ue(),la(),L.hidden=!1,q?.setAttribute("aria-expanded","true")},Pa=async()=>{let g=it(),A=p.map(j=>({question:j.question,asked_at:j.asked_at||"",payload:j.payload||{}}));if(!A.length&&Array.isArray(g?.turns)&&(A=g.turns.map(j=>({...j}))),!A.length){N("\u76EE\u524D\u6C92\u6709\u53EF\u5EFA\u7ACB\u516C\u958B\u9023\u7D50\u7684\u5C0D\u8A71\u3002","warn");return}await ti(A,g?.title||"Judgment RAG \u5C0D\u8A71")},Qn=async g=>{let A=g.target.closest("[data-menu-action]");if(!A)return;let j=n.find(be=>String(be.id)===J);if(!j){Ue();return}let U=A.dataset.menuAction;U==="rename"?(Ue(),await Fe(j)):U==="toggle-pin"?(Ue(),await R(j.id)):U==="share"?(Ue(),await Oe(j)):U==="move"?(oe(j),O($e)):U==="assign-project"?(Ue(),await Ke(j,A.dataset.projectId||"")):U==="back"?(Y(j),O($e)):U==="delete"&&(Ue(),await Be(j))},ca=g=>{let A=typeof g.composedPath=="function"?g.composedPath():[];ye.hidden||!(A.includes(ye)||ye.contains(g.target))&&!g.target.closest('[data-rag-action="open-history-menu"]')&&Ue(),L.hidden||!(A.includes(L)||L.contains(g.target))&&!g.target.closest('[data-workspace-action="menu"]')&&Ye()},Qs=g=>{g.key==="Escape"&&(Ue(),Ye())},ps=g=>{g.target instanceof Node&&ye.contains(g.target)||(Ue(),L.hidden||Ye())},yt=async()=>{try{if(n=await bn({limit:120}),a)return;i=!0,he(),Te.textContent=wa()==="indexeddb"?"\u6B77\u53F2\u6E05\u55AE\u53EA\u5B58\u5728\u6B64\u700F\u89BD\u5668\uFF1B\u9001\u51FA\u554F\u984C\u6642\u6703\u50B3\u9001\u5230\u4F3A\u670D\u5668\u7522\u751F\u7B54\u6848\u3002\u4F3A\u670D\u5668\u4FDD\u7559\u63D0\u554F\u8207\u56DE\u7B54\u6587\u5B57 90 \u5929\u3001\u5B89\u5168\u7A3D\u6838\u4E8B\u4EF6 180 \u5929\uFF1B\u5099\u4EFD\u4F9D 90 \u5929\u8F2A\u66FF\u653F\u7B56\u7BA1\u7406\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(a)return;n=[],i=!0,he(),ie.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},da=async(g,A,j,U,{replaceIndex:be=null}={})=>{let ke=p,Ce=v,xe={question:g,asked_at:new Date().toISOString(),payload:ul(A)};Number.isInteger(be)&&be>=0&&be<=ke.length?ke[be]=xe:ke.push(xe);let lt=Array.isArray(A.citations)?A.citations:[],Xe=Array.isArray(A.judgments)?A.judgments:[],bt={question:g,status:A.status,citations:lt.map(_t=>_t.law_name),judgments:Xe.map(_t=>_t.jid)},dt=`${A.status||"preview"} \xB7 ${ke.length} \u8F2A`,ht=new Date().toISOString(),ns=_t=>{U===y&&(v=_t)};if(Ce){if(!await ka(Ce,{turns:ke,detail:dt,payload:bt,updated_at:ht})){let rs=await _a({kind:"rag",title:ke[0]?.question||g,detail:dt,project_id:j,turns:ke,payload:bt,updated_at:ht});ns(rs)}}else{let _t=await _a({kind:"rag",title:ke[0]?.question||g,detail:dt,project_id:j,turns:ke,payload:bt,updated_at:ht});ns(_t)}await yt()},Ws=()=>{let g=e.querySelector("#rag-mode-notice");if(!g)return;if(Zt()){g.innerHTML=Ge({tone:"info",title:"\u5C55\u793A\u6A21\u5F0F",text:"\u53EF\u76F4\u63A5\u8F38\u5165\u6CD5\u5F8B\u554F\u984C\uFF1B\u56DE\u7B54\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u6CD5\u898F\u8207\u5224\u6C7A\u5F15\u7528\u3002"});return}let A=Array.isArray(k?.model_summary)?k.model_summary:[];if(!k){if(!S)return;g.innerHTML=Tn({tone:"warn",title:"\u7121\u6CD5\u53D6\u5F97 RAG \u670D\u52D9\u72C0\u614B",text:S.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u524D\u5F80\u7CFB\u7D71\u72C0\u614B\u9801\u67E5\u770B\u3002",modelSummary:A,refreshing:f,expanded:T});return}let j=k.data||{},U=(k.services||[]).find(Ce=>Ce.id==="rag"),be=Number(j.judgment_indexed_count||0),ke=Number(j.judgment_count||0);U?.status==="operational"?g.innerHTML=Tn({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${c(be)} / ${c(ke)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`,modelSummary:A,refreshing:f,expanded:T}):U?.status==="degraded"?g.innerHTML=Tn({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:U.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002",modelSummary:A,refreshing:f,expanded:T}):g.innerHTML=Tn({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:U?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002",modelSummary:A,refreshing:f,expanded:T})},Ia=async()=>{if(Zt()){k=null,S=null,Ws();return}try{let g=await G.status();if(a)return;k=g,S=null}catch(g){if(a)return;k=null,S=g}Ws()},ua=async()=>{if(!f){f=!0,Ws();try{let g=await G.status();if(a)return;k=g,S=null,N("\u5DF2\u66F4\u65B0\u6A21\u578B\u72C0\u614B\u3002","ok",2500)}catch(g){N(g.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u3002","danger",6e3)}finally{f=!1,a||Ws()}}},Lt=()=>{if(!ee)return;if(!w){ee.innerHTML="";return}let g=Array.isArray(M.embedding)?M.embedding.length:0,A=Array.isArray(M.llm)?M.llm.length:0;ee.innerHTML=Ge({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${g} \u500B embedding \u8207 ${A} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},Wn=async()=>{if(Zt()){w=!1,Lt();return}try{let g=await G.testMode();if(a)return;w=!!g.enabled,M=g.models||{embedding:[],llm:[]},Lt()}catch{if(a)return;w=!1,Lt()}},Da=g=>{w=!!g.detail?.enabled,M=g.detail?.models||{embedding:[],llm:[]},Lt()};window.addEventListener("judgment:test-mode",Da);let as=g=>{if(!Me)return;P=g||null;let A=JSON.stringify(g?{run_id:g.run_id,status:g.status,progress:g.progress,total_ms:g.total_ms,stage:g.stage,answer:g.answer||"",steps:(g.steps||[]).map(j=>`${j.stage}:${j.model}:${j.status}:${j.progress}:${j.duration_ms}`)}:null);A!==z&&(z=A,Me.innerHTML=g?ra(g,[],"",{showHistory:!1}):"")},ms=()=>{W&&(W(),W=null)},pa=async(g=null)=>{if(!a)try{let A=g||await G.testRunCurrent();if(a)return;let j=A.run;j&&j.status==="running"&&as(j)}catch{}},ma=()=>{a||W||(pa(),W=Et("test-runs",(g,A)=>pa(A?.snapshot||null)))},Ba=async g=>{if(!g){as(null);return}try{let A=await G.testRun(g);if(a)return;as(A.run||null)}catch{a||N("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},Fa=async()=>{if(w)try{let g=await G.testRunCurrent();if(a)return;g.run?.status==="running"&&(as(g.run),ma())}catch{}},Js=0,Vs=(g,A)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${r(g)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${m("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${A}</div>`,Jn=g=>{let A=(Array.isArray(g.citations)?g.citations:[]).map(Ce=>kl(Ce)).filter(Boolean).join(""),j=A||(Array.isArray(g.matched_laws)?g.matched_laws:[]).map(Ce=>En(Ce)).join(""),U=[g.court,g.jdate,g.title?`\u6848\u7531\uFF1A${g.title}`:"",g.full_text_length?`${c(g.full_text_length)} \u5B57`:"",g.citation_count?`\u5F15\u7528 ${c(g.citation_count)} \u7B46`:""].filter(Boolean).map(Ce=>`<span>${r(Ce)}</span>`).join(""),be=g.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${r(String(g.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",ke=g.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(g.pdf_url)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return Vs(g.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${r(g.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${U}
      </div>
      ${A?'<div class="citation-meta" style="margin-top:8px"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':""}
      ${j?`<div class="chips" style="margin:8px 0 10px">${j}</div>`:""}
      <div class="judgment-dialog-source">${be}</div>
      <pre class="judgment-dialog-text">${r(g.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${ke}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},$=async g=>{if(!_e||!g)return;let A=++Js;_e.open||_e.showModal(),F(),_e.innerHTML=Vs("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${r(g)}\u2026</span>
      </div>`);try{let j=await G.judgmentDetail(g,"parquet");if(a||A!==Js)return;_e.innerHTML=Jn(j)}catch(j){if(a||A!==Js)return;_e.innerHTML=Vs("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(j.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},_=0,I=(g,A)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${r(g)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${m("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${A}</div>`,ce=(g,A="")=>{let j=String(g.selected_article_no||A||"").trim(),U=!!j,be=Array.isArray(g.articles)?g.articles:[],ke=be.map(jt=>{let He=String(jt.article_content||"").trim();return He?jt.article_type==="C"?`<div class="law-chapter">${r(He)}</div>`:`<article class="law-article" data-article-no="${r(fl(jt.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${r(jt.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${r(He)}</div>
        </article>`:""}).join(""),Ce=(Array.isArray(g.warnings)?g.warnings:[]).map(jt=>r(jt)).join("<br />"),xe=g.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",lt=g.meta?.articles_source,Xe=lt==="parquet"?"Parquet \u689D\u6587":lt==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",bt=g.meta?.snapshot||"",dt=[g.law_level,g.law_category,g.article_count?`${c(g.article_count)} \u689D`:"",g.law_modified_date?`\u7570\u52D5 ${Ut(g.law_modified_date)}`:""].filter(Boolean).map(jt=>`<span>${r(jt)}</span>`).join(""),ht=g.law_url?`<a class="btn btn-secondary btn-sm" href="${r(g.law_url)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",ns=!U&&g.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${r(g.law_histories)}</div>
        </details>`:"",_t=U?`<span class="badge badge-mono">${r(j)}</span>`:"",rs=!U&&be.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",ks=U?`${g.law_name||g.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${j}`:g.law_name||g.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return I(ks,`<div class="judgment-dialog-meta">
        <span class="badge ${g.source_type==="order"?"badge-warn":"badge-info"}">${r(xe)}</span>
        ${_t}
        ${dt}
      </div>
      <div class="judgment-dialog-source">${r([Xe,bt].filter(Boolean).join(" \xB7 "))}</div>
      ${Ce?`<div class="law-dialog-warning">${Ce}</div>`:""}
      ${ns}
      ${rs}
      <div class="law-dialog-articles">${ke||`<div class="report-empty-inline">${U?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${ht}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},re=(g,A)=>{let j=g?.querySelector(`#${A}`),U=fl(j?.value||"");if(!U){N("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),j?.focus();return}let be=[...g?.querySelectorAll("[data-article-no]")||[]].find(ke=>ke.dataset.articleNo===U);if(!be){N(`\u627E\u4E0D\u5230\u7B2C ${U} \u689D\u3002`,"warn");return}be.scrollIntoView({behavior:"instant",block:"center"}),be.classList.add("is-jump-target"),window.setTimeout(()=>be.classList.remove("is-jump-target"),2400)},X=async(g,A="",j="")=>{if(!je||!g)return;let U=++_;je.open||je.showModal(),F(),je.innerHTML=I(j?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${r([g,j].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let be=await G.lawDetail(g,A,"",j);if(a||U!==_)return;je.innerHTML=ce(be,j)}catch(be){if(a||U!==_)return;je.innerHTML=I("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(be.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};je?.addEventListener("click",g=>{let A=g.target.closest('[data-action="jump-law-article"]');if(A){re(je,A.dataset.jumpInput||"rag-law-article-jump");return}if(g.target.closest('[data-action="close-law-source"]')){je.close();return}let j=je.getBoundingClientRect();(g.clientX<j.left||g.clientX>j.right||g.clientY<j.top||g.clientY>j.bottom)&&je.close()}),je?.addEventListener("keydown",g=>{!g.target.matches(".law-jump-input")||g.key!=="Enter"||(g.preventDefault(),re(je,g.target.id))}),_e?.addEventListener("click",g=>{let A=g.target.closest('[data-action="open-law-source"]');if(A){X(A.dataset.lawKey||"",A.dataset.sourceType||"",A.dataset.articleNo||"");return}if(g.target.closest('[data-action="close-parquet-judgment"]')){_e.close();return}let j=_e.getBoundingClientRect();(g.clientX<j.left||g.clientX>j.right||g.clientY<j.top||g.clientY>j.bottom)&&_e.close()}),E.addEventListener("click",g=>{let A=g.target.closest(".rag-process-toggle");if(A){let U=A.closest(".rag-process"),be=A.getAttribute("aria-expanded")==="true";si(U,!be);return}let j=g.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(j){if(j.dataset.action==="open-law-source"){X(j.dataset.lawKey||"",j.dataset.sourceType||"",j.dataset.articleNo||"");return}$(j.dataset.jid||"")}}),E.addEventListener("keydown",g=>{if(g.key!=="Enter"&&g.key!==" ")return;let A=g.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!A||A.closest("a, button"))){if(g.preventDefault(),A.dataset.action==="open-law-source"){X(A.dataset.lawKey||"",A.dataset.sourceType||"",A.dataset.articleNo||"");return}$(A.dataset.jid||"")}});let we=async(g,{fresh:A=!1,source:j="hero",replaceTurnElement:U=null}={})=>{let be=g.trim();if(!be){N("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),(j==="followup"?de:Q).focus();return}Ye();let ke=U instanceof HTMLElement&&E.contains(U)?U:null,Ce=ke?Array.from(E.querySelectorAll(".rag-turn")).indexOf(ke):null,xe=!!ke?.querySelector("[data-rag-answer]")&&Number.isInteger(Ce)&&Ce>=0;!xe&&(A||!b)&&(v=null,p=[],E.innerHTML="",he());let lt=++y,Xe=()=>a||lt!==y,bt=d;h=be,ft(!0),nt(),xe||(j==="followup"?(de.value="",et()):(Q.value="",De()));let dt,ht,ns="",_t=null;xe?(dt=ke,ht=dt.querySelector("[data-rag-answer]"),ns=dt.outerHTML,_t=s.get(dt)||null,rt(dt,be),dt.classList.remove("is-complete"),dt.classList.add("is-pending"),ht.innerHTML=gl(be,w),s.delete(dt)):{turnElement:dt,answerElement:ht}=ue(be,gl(be,w));let rs=w?null:pp(ht);w?(as(null),ma()):(ms(),as(null)),Re(fe,!0,"\u6AA2\u7D22\u4E2D\u2026"),Re(H,!0,"\u6AA2\u7D22\u4E2D\u2026");let ks=null,jt="",He=ze=>{if(Xe()||!ze?.partial)return;let st=ht.querySelector(".answer-body");if(!st)return;ks=ze,jt=String(ze.answer||""),st.innerHTML=xl(ze),rs?.collapse?.();let ut=ht.querySelector(".answer-head-title");ut&&(ut.textContent=ze.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},kt=ze=>{if(Xe()||!ze||!ks?.streaming)return;jt+=ze;let st=ht.querySelector("[data-partial-answer]");st&&(st.textContent=jt)},ct=()=>{if(Xe()||!ks?.streaming)return;jt="";let ze=ht.querySelector("[data-partial-answer]");ze&&(ze.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")},Jt=ze=>{if(Xe())return;let st=ht.querySelector(".answer-body");if(!st)return;let ut=st.querySelector("[data-summary-queue]");ut||(ut=document.createElement("div"),ut.className="answer-notice",ut.dataset.summaryQueue="true",st.appendChild(ut));let Pt=Number(ze.position||0),zt=Number(ze.eta_s||0),Vt=ze.lane==="summary"?"\u6458\u8981":"\u6AA2\u7D22";ut.textContent=`${Vt}\u6392\u968A\u4E2D\uFF1A\u524D\u9762 ${Pt} \u4F4D\uFF0C\u9810\u4F30\u7D04 ${Math.round(zt)} \u79D2\u3002`};try{let ze=w?await G.rag(be,{testMode:w}):await G.ragStream(be,{onStep:ut=>{Xe()||rs?.step(ut)},onPartial:He,onQueued:Jt,onToken:kt,onTokenReset:ct});if(Xe())return;ms();let st=rs?.finish(!0,ze)||"";if(ht.innerHTML=hl(be,ze,st),dt&&s.set(dt,ul(ze)),dt?.classList.remove("is-pending"),dt?.classList.add("is-complete"),ze.pipeline_flow||lp(ze).then(()=>{if(Xe()||!ze.pipeline_flow)return;let ut=ht.querySelector(".answer-head");if(!ut||ut.querySelector(".rag-wf-card"))return;let Pt=_l(ze);Pt&&ut.insertAdjacentHTML("beforeend",Pt)}),ze.test_run?.run_id?await Ba(ze.test_run.run_id):as(null),await da(be,ze,bt,lt,{replaceIndex:Ce}),Xe())return;ot()}catch(ze){if(Xe())return;if(ms(),xe&&ns){dt.outerHTML=ns;let st=E.querySelectorAll(".rag-turn")[Ce];st&&_t&&s.set(st,_t)}else{let st=rs?.finish(!1)||"";ht.innerHTML=kp(ze,st,be),dt?.classList.remove("is-pending"),dt?.classList.add("is-complete")}ot(),N(ze.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{Xe()||(ms(),Re(fe,!1),Re(H,!1))}},Z=null,pe=({restoreFocus:g=!0}={})=>{let A=Z;if(!A)return;Z=null;let{bubble:j,turnElement:U,originalQuestion:be,width:ke,maxWidth:Ce}=A;if(j&&(j.classList.remove("is-editing"),j.style.removeProperty("--rag-edit-width"),j.style.width=ke,j.style.maxWidth=Ce,j.textContent=be),g){let xe=U?.querySelector('[data-rag-question-action="edit"]');xe instanceof HTMLElement&&xe.focus({preventScroll:!0})}},Ae=(g,A)=>{pe({restoreFocus:!1});let j=g?.querySelector(".rag-user-bubble");if(!j)return;let U=String(A||j.textContent||"").trim();if(!U)return;let be=j.style.width,ke=j.style.maxWidth,Ce=Math.max(160,j.getBoundingClientRect().width||0),xe=document.createElement("textarea");xe.className="rag-user-edit",xe.value=U,xe.rows=1,xe.setAttribute("aria-label","\u7DE8\u8F2F\u554F\u984C"),j.classList.add("is-editing"),j.style.setProperty("--rag-edit-width",`${Ce}px`),j.textContent="",j.appendChild(xe),Z={bubble:j,turnElement:g,textarea:xe,originalQuestion:U,width:be,maxWidth:ke};let lt=()=>{xe.style.height="auto",xe.style.height=`${xe.scrollHeight}px`};xe.addEventListener("input",lt),xe.addEventListener("keydown",async Xe=>{if(Xe.isComposing)return;if(Xe.key==="Escape"){Xe.preventDefault(),pe();return}if(Xe.key!=="Enter"||Xe.shiftKey)return;Xe.preventDefault();let bt=xe.value.trim();if(!bt){N("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),xe.focus();return}if(fe.disabled||H.disabled){N("\u76EE\u524D\u4ECD\u5728\u6AA2\u7D22\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","warn");return}pe({restoreFocus:!1}),await we(bt,{fresh:!1,source:"inline_edit",replaceTurnElement:g})}),xe.addEventListener("blur",()=>{window.setTimeout(()=>{Z?.textarea===xe&&document.activeElement!==xe&&pe({restoreFocus:!1})},0)}),requestAnimationFrame(()=>{lt(),xe.focus({preventScroll:!0}),xe.select(),xe.setSelectionRange(0,xe.value.length)})};V.addEventListener("submit",g=>{g.preventDefault(),we(Q.value,{fresh:!0,source:"hero"})}),K.addEventListener("submit",g=>{g.preventDefault(),we(de.value,{fresh:!1,source:"followup"})}),Q.addEventListener("input",De),Q.addEventListener("keydown",g=>{g.key==="Enter"&&!g.shiftKey&&!g.isComposing&&(g.preventDefault(),V.requestSubmit())}),de.addEventListener("input",et),de.addEventListener("keydown",g=>{g.key==="Enter"&&!g.shiftKey&&!g.isComposing&&(g.preventDefault(),K.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",g=>{let A=g.target.closest("[data-question]");A&&(Q.value=A.dataset.question,De(),V.requestSubmit())}),e.addEventListener("click",async g=>{let A=g.target.closest("[data-rag-question-action]"),j=g.target.closest("[data-rag-answer-action]");if(A||j){g.preventDefault(),g.stopPropagation();let U=A?A.dataset.ragQuestionAction:j.dataset.ragAnswerAction,be=A||j,ke=Number(g.detail||0)>0||!!window.matchMedia?.("(pointer: coarse)")?.matches,Ce=(Xe=!1)=>{(Xe||ke)&&document.activeElement===be&&be.blur()},xe=String(be?.dataset.question||"").trim(),lt=be?.closest(".rag-turn");if(!xe||!lt)return;if(U==="copy"){try{let Xe=A?xe:ei(lt),bt=await xs(Xe);N(bt?A?"\u5DF2\u8907\u88FD\u554F\u984C\u3002":"\u5DF2\u8907\u88FD\u56DE\u7B54\u3002":"\u7121\u6CD5\u8907\u88FD\u3002",bt?"ok":"danger")}finally{Ce()}return}if(U==="share"){Ce(!0);try{await ti(wt(lt,xe),A?"Judgment RAG \u63D0\u554F":"Judgment RAG \u56DE\u7B54")}finally{Ce(!0)}return}if(U==="edit"){Ae(lt,xe);return}if(U==="reask"){if(fe.disabled){N("\u76EE\u524D\u4ECD\u5728\u6AA2\u7D22\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","warn");return}await we(xe,{fresh:!1,source:"followup"})}return}g.target.closest('[data-rag-action="refresh-models"]')&&await ua()}),qe.addEventListener("click",async g=>{let A=g.target.closest("[data-rag-toggle]");if(A){let xe=A.closest(".rag-library-section").classList.toggle("is-collapsed");A.setAttribute("aria-expanded",String(!xe));return}let j=g.target.closest("[data-rag-action]"),U=j?.dataset.ragAction||"";if(U==="new-chat"){C();return}if(U==="open-history-menu"){me(j,j.dataset.historyId);return}if(U==="toggle-pin"){await R(j.dataset.historyId);return}if(U==="select-project"){Qe(j.dataset.projectId||"");return}if(U==="show-project-form"){Bt();return}if(U==="cancel-project"){$t();return}if(U==="more-recent"){u+=12,he();return}if(U==="clear-project"){Qe("");return}let be=g.target.closest("[data-history-open]");if(!be)return;let ke=n.find(Ce=>String(Ce.id)===String(be.dataset.historyId));ke&&(d=String(ke.project_id||""),he(),!ne(ke)&&(v=null,p=[],we(ke.title,{fresh:!0,source:"history"})))}),qe.addEventListener("submit",async g=>{let A=g.target.closest('[data-rag-form="project"]');A&&(g.preventDefault(),await x(A))}),D.addEventListener("click",g=>{let A=g.target.closest(".rag-mode-head");!A||g.target.closest("button, a")||(T=!T,A.closest(".rag-mode-card")?.classList.toggle("is-expanded",T),A.setAttribute("aria-expanded",String(T)))}),D.addEventListener("keydown",g=>{if(g.key!=="Enter"&&g.key!==" ")return;let A=g.target.closest(".rag-mode-head");A&&(g.preventDefault(),A.click())}),se.addEventListener("click",async g=>{let A=g.target.closest("[data-workspace-action]");if(!A)return;let j=A.dataset.workspaceAction;if(j==="friend-share"){g.preventDefault();let U=Number(g.detail||0)>0||!!window.matchMedia?.("(pointer: coarse)")?.matches;try{if(typeof navigator.share=="function")try{await navigator.share({title:"Judgment RAG Console",url:cl});return}catch(ke){if(ke?.name==="AbortError")return}let be=await xs(cl);N(be?"\u5DF2\u8907\u88FD\u7DB2\u7AD9\u9023\u7D50\u3002":"\u7121\u6CD5\u5206\u4EAB\u7DB2\u7AD9\u9023\u7D50\u3002",be?"ok":"danger")}finally{U&&A.blur()}return}if(j==="menu"){L.hidden?Gn():Ye();return}if(j==="share"){let U=Number(g.detail||0)>0||!!window.matchMedia?.("(pointer: coarse)")?.matches;U&&A.blur();try{await Pa()}finally{U&&A.blur()}}}),L.addEventListener("click",async g=>{let A=g.target.closest("[data-workspace-menu-action]");if(!A)return;let j=A.dataset.workspaceMenuAction;if(j==="back"){la();return}let U=it();if(!U){Ye(),N("\u76EE\u524D\u6C92\u6709\u53EF\u7BA1\u7406\u7684\u5C0D\u8A71\u3002","warn");return}j==="rename"?(Ye(),await Fe(U)):j==="pin"?(Ye(),await R(U.id)):j==="delete"?(Ye(),await Be(U)):j==="move"?Ca(U):j==="assign-project"&&(Ye(),await Ke(U,A.dataset.projectId||""))}),ye.addEventListener("click",Qn),document.addEventListener("click",ca),document.addEventListener("keydown",Qs),window.addEventListener("scroll",ps,{capture:!0,passive:!0}),window.addEventListener("resize",Ue),B.addEventListener("click",async()=>{if(!n.length){N("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await fo(),await yt(),N("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),De(),await Promise.allSettled([Ia(),yt(),tt(),Wn()]),await Fa();let Ne=!1;if(t?.token&&(Ne=await mt(t.token)),!Ne){let g="",A="home";try{g=window.sessionStorage.getItem("judgment.pending_question")||"",window.sessionStorage.removeItem("judgment.pending_question")}catch{g=""}!g&&typeof window.__judgmentPendingQuestion=="string"&&(g=window.__judgmentPendingQuestion),delete window.__judgmentPendingQuestion,!g&&t?.question&&(g=t.question,A="share"),g=String(g||"").trim().slice(0,500),g&&Q&&(Q.value=g,De(),window.setTimeout(()=>{a||we(g,{fresh:!0,source:A})},40))}return()=>{a=!0,ms(),Ue(),document.removeEventListener("click",ca),document.removeEventListener("keydown",Qs),window.removeEventListener("scroll",ps,{capture:!0}),window.removeEventListener("resize",Ue),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",Da),h&&E.setAttribute("data-last-question",h)}}var $i={};gs($i,{clearUpdateConsumed:()=>pi,isUpdateConsumed:()=>In,markUpdateConsumed:()=>Pl,newRunVisible:()=>Cn,render:()=>Lm,workflowPanelMarkup:()=>Xl});var li=new Set(["legal_index_versions","judgment_import","index_versions"]),Al=new Map,ci=new Set,di=new Set;function Ma(e){let t=Number(e);if(!Number.isFinite(t)||t<0)return"\u2014";if(t<60)return`${Math.round(t)} \u79D2`;let s=Math.floor(t/60),a=Math.round(t%60);if(s<60)return`${s} \u5206 ${a} \u79D2`;let n=Math.floor(s/60),i=s%60;if(n<24)return`${n} \u5C0F\u6642 ${i} \u5206`;let o=Math.floor(n/24),l=n%24;return`${o} \u5929 ${l} \u5C0F\u6642`}function Cn(e,t=""){let s=e?.active_run?.id||e?.last_run?.id||"";return!!e?.active_run||!!(s&&s!==t)}function oi(e){return String(e||"").trim().replace(/:latest$/,"")}var qp={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},partial:{label:"\u90E8\u5206\u5B8C\u6210",tone:"warn"},update:{label:"\u66F4\u65B0",tone:"warn"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u5B8C\u6210",tone:"ok"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"},provided:{label:"\u5916\u90E8\u63D0\u4F9B",tone:"info"}},ui=["download","parquet","postgres","qdrant"],Mp={download:"\u4E0B\u8F09",parquet:"Parquet",postgres:"PostgreSQL",qdrant:"Qdrant"},Lp={judgment:{download:["download"],parquet:["raw_parquet","extract"],postgres:["postgres"],qdrant:["qdrant"]},law:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]},order:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]}},ql={complete:"\u5B8C\u6210",incomplete:"\u672A\u5B8C\u6210",pending:"\u5F85\u66F4\u65B0",processing:"\u8655\u7406\u4E2D",empty:"\u7121\u8CC7\u6599",not_applicable:"\u5DF2\u53D6\u4EE3"},Ml={complete:"is-green",incomplete:"is-red",pending:"is-pending",processing:"is-gray",empty:"is-empty",not_applicable:"is-empty"};var es=new Map,ts="",Ts="",mi=new Set;function Pl(e){e&&mi.add(String(e))}function pi(e){e&&mi.delete(String(e))}function In(e){return mi.has(String(e))}var Ll={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},jl={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},jp={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"};var Pn={law_download:"law",order_download:"order",judgment_download:"judgment"},Tp={law:"law_download",order:"order_download",judgment:"judgment_download"},Tl={law_download:"\u6CD5\u898F\u4E0B\u8F09",order_download:"\u547D\u4EE4\u4E0B\u8F09",judgment_download:"\u5224\u6C7A\u4E0B\u8F09"},Ep={law_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",order_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",judgment_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u5224\u6C7A RAR \u55CE\uFF1F\uFF08\u4E0D\u6703\u81EA\u52D5\u532F\u5165 PostgreSQL \u6216\u5EFA\u7ACB Qdrant \u7D22\u5F15\uFF09"},Np=new Set(["law_download","order_download","judgment_download","legal_index_versions","index_versions"]),Rp={law_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u6CD5\u898F RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",order_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u547D\u4EE4 RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",judgment_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u53EA\u4E0B\u8F09\u5224\u6C7A RAR\u3002PostgreSQL\uFF0FParquet \u532F\u5165\u8207 Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\u300C\u5224\u6C7A\u532F\u5165\u300D\u6216\u5B8C\u6574\u8CC7\u6599\u66F4\u65B0\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_import:"\u6D41\u7A0B\u7BC4\u570D\uFF1ARAR \u2192 \u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD \u2192 \u91D1\u878D\u6CD5\u898F\u7BE9\u9078 \u2192 PostgreSQL\u3002Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_parquet:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5F9E PostgreSQL \u532F\u51FA\u67E5\u8A62\u7528 Parquet \u5FEB\u7167\uFF1B\u4E0D\u5BEB\u5165 Qdrant\uFF0FIndexedDB\u3002",index_versions:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5EFA\u7ACB\u4E26\u9A57\u8B49\u65B0\u7684 Qdrant collection\uFF0C\u5B8C\u6210\u5F8C\u539F\u5B50\u5207\u63DB alias\uFF1BIndexedDB \u4E0D\u53C3\u8207\u3002"};function Es(e){return qp[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Wt(e,t){let s=Es(e);return`<span class="badge ${Ll[s.tone]||Ll.idle}"><span class="status-dot ${jl[s.tone]||jl.idle}"></span>${r(t||s.label)}</span>`}function Mt(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function El(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":c(e)}function Il(e){return e&&e.color?String(e.color):"var(--accent)"}function gi(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return["skipped","pending","idle"].includes(e.status)?"\u2014":s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${Pe(s)} / ${Pe(a)}`:Pe(s):a?`${c(s)} / ${c(a)} ${t}`:`${c(s)} ${t}`}function Os(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${r(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function Cp(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},n=e.raw_backups||{},i=n.totals||{},o=e.state||{},l=e.capabilities||{},d=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",u=t.status==="operational",h=s.status==="operational",y=a.available!==!1,v=n.available!==!1,p=h?`${c(s.indexed)} / ${c(s.total)}`:Wt(s.status||"unavailable"),b=h?`${Mt(s.percent)} \xB7 \u5C1A\u9918 ${c(s.remaining)} \u7B46`:r(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),w=y?`${c(a.unprocessed)} / ${c(a.total)}`:Wt("unavailable"),M=y?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${Pe(a.unprocessed_bytes)} \u5F85\u8655\u7406`:r(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${ds(Vp(e))}
    ${Os("\u8655\u7406\u72C0\u614B",Wt(e.status||"unknown"),`${r(d)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${Os("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",r(w),M)}
    ${Os("\u539F\u59CB\u8CC7\u6599\u5099\u4EFD",v?`${c(n.count)} \u6A94`:Wt("unavailable"),v?`\u5171 ${c(i.row_count)} \u7B46 \xB7 ${Pe(i.compressed_bytes)}`:r(n.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB\u8CC7\u6599\u5099\u4EFD\u3002"))}
    ${Os("PostgreSQL \u5224\u6C7A",u?c(t.judgment_count):Wt("unavailable"),u?`\u6CD5\u898F ${El(t.law_count)} \xB7 \u547D\u4EE4 ${El(t.order_count)}`:r(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${Os("Qdrant \u7D22\u5F15",p,b)}
    ${Os("\u72C0\u614B\u6A94",Wt(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${r(Se(o.updated_at))}`:r(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${Os("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?r(l.start_blocked_reason):`\u672A\u8655\u7406 ${c(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${c(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${c(l.external_processes)} \u500B`:""}`)}
  </div>`}function Pp(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let n=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${r(o.color||"var(--accent)")}" title="${r(`${o.label} ${ge(o.duration_ms)} (${Mt(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${r(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${r(o.label)}</span>
        <span class="mono">${ge(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${Mt(o.percent)}</span>
        ${Wt(o.status)}
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
  </section>`}function Ip(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let n=t.map(i=>{let o=s.get(i.branch)||jp[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${r(o)}</span>
          <strong>${r(i.title||"\u8655\u7406")}</strong>
          ${Wt(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${r(Se(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?ge(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${r(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${n}</div></div>
  </section>`}function Dp(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>Ge({tone:s.tone||"info",title:s.title,text:r(s.message||"")})).join("")}</div>`:""}function Dl(e,t){if(e==="law"||e==="order")return t==="qdrant"?"legal_index_versions":`${e}_download`;if(e==="judgment"){if(t==="download")return"judgment_download";if(t==="parquet"||t==="postgres")return"judgment_import";if(t==="qdrant")return"index_versions"}return""}function fi({month:e,year:t,monthNo:s,stageOrder:a,stageLabels:n,stageStatuses:i,overall:o,active:l,processing:d=!1,workflowForStage:u,stageProgress:h=null,variant:y="legacy"}){let v=i||{},p=y==="index"||y==="import",b=String(e?.month||`${t}${String(s).padStart(2,"0")}`),w=e?.month_label||`${t}-${String(s).padStart(2,"0")}`,M=L=>p&&L==="processing"?"\u57F7\u884C\u4E2D":ql[L]||ql.empty,k=L=>{let q=v[L]||"empty";if(!(q==="processing"||L==="qdrant"&&q==="incomplete"))return null;let K;if(typeof h=="function")K=h(L,b,q);else if(y==="import"&&h&&typeof h=="object")K=h[L];else return null;let de=Number(K);return Number.isFinite(de)?Math.max(0,Math.min(100,de)):null},S=a.map(L=>{let q=v[L]||"empty",E=k(L),K=L==="qdrant"&&q==="incomplete"&&E!==null&&E>0,de=K?"\u5DF2\u8655\u7406":M(q),H=!K&&E!==null&&E>0?` ${E.toFixed(1)}%`:"";return`${n[L]||L}\uFF1A${de}${H}`}).join(" \xB7 "),f=(e?.versions||[]).map(L=>L.version_code).filter(Boolean),T=[...new Set([...e?.files||[],...e?.local_files||[],...e?.imported_files||[]])].filter(Boolean),V=f.length?` \xB7 \u7248\u672C ${f.join("\u3001")}`:T.length?` \xB7 ${T.join("\u3001")}`:"",Q=e?.detail?` \xB7 ${e.detail}`:"",fe=e?`${w} \xB7 ${S}${V}${Q}`:`${w} \xB7 \u7121\u8CC7\u6599`,ve=p?o==="empty"?"is-empty":"is-neutral":Ml[o]||"is-empty",se=a.map(L=>{let q=v[L]||"empty",E=q==="incomplete"||q==="pending"?u(L):"",K=E?"button":"span",de=E?` type="button" data-timeline-workflow="${r(E)}"`:"",H=k(L),ie=L==="qdrant"&&q==="incomplete"&&H!==null&&H>0,Te=q==="processing"&&H!==null?` ${H.toFixed(1)}%`:"",B=ie?"\u5DF2\u8655\u7406":M(q),qe=q==="complete"?"is-complete":q==="processing"?"is-running":ie?"is-partial":q==="incomplete"?"is-incomplete":q==="pending"?"is-pending":"is-empty",ae=p?["index-month-block","processing-month-stage",`is-${L}`,qe,E?"is-actionable":""]:["processing-month-stage",`is-${L}`,Ml[q]||"is-empty",qe,E?"is-actionable":""],Ie=(q==="processing"||ie)&&H!==null?` style="--stage-progress:${H.toFixed(1)}%"`:"";return`<${K} class="${ae.filter(Boolean).join(" ")}"${de}${Ie} title="${r(`${n[L]||L}\uFF1A${B}${Te}${E?"\uFF08\u9EDE\u9078\u524D\u5F80\u8655\u7406\uFF09":""}`)}" aria-label="${r(`${w} ${n[L]||L} ${B}${Te}${E?"\uFF0C\u9EDE\u9078\u524D\u5F80\u8655\u7406":""}`)}"></${K}>`}).join("");return p?`<td class="judgment-month index-month index-month-are processing-month ${ve}${l?" is-current":""}${d&&!l?" is-processing-current":""}" data-month="${r(b)}" title="${r(fe)}" aria-label="${r(fe)}"${l?' aria-current="true"':""}>
    <span class="index-month-number">${s}</span>
    <span class="index-month-blocks">${se}</span>
  </td>`:`<td class="judgment-month import-month processing-month${l?" is-current":""} is-${r(o)}" data-month="${r(b)}" title="${r(fe)}" aria-label="${r(fe)}"${l?' aria-current="true"':""}>
    <span class="processing-month-number">${s}</span>
    <span class="processing-month-stages">${se}</span>
  </td>`}function Bp(e,t,s,a,n){return fi({month:t,year:s,monthNo:a,stageOrder:ui,stageLabels:Mp,stageStatuses:t?.stages||{},overall:t?.overall||"empty",active:!!(t?.active||t?.overall==="processing"),workflowForStage:i=>Dl(e.key,i),stageProgress:n,variant:"index"})}function Fp(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=Number(s?.incomplete)||0,o=Number(s?.superseded)||0,l=a>0?(n+o)/a*100:null,d=["download","prepared","indexed"],u=0,h=0;for(let v of t){let p=v?.stages||{};for(let b of d){let w=p[b];!w||w==="empty"||w==="not_applicable"||(u+=1,w==="complete"&&(h+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(n),"\u5DF2\u5B8C\u6210 D\uFF0FP\uFF0FI \u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(i+(Number(s?.processing)||0)),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u5DF2\u53D6\u4EE3\u6708\u4EFD",c(o),"\u820A\u7248\u672C\u5DF2\u88AB\u76EE\u524D\u7248\u672C\u53D6\u4EE3\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",Mt(l),"\u5B8C\u6210\u6216\u5DF2\u53D6\u4EE3\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c(h)} / ${c(u)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([v,p,b])=>`<span class="index-runtime-metric" title="${r(b)}"><span>${r(v)}</span><strong>${r(p)}</strong></span>`).join("")}</div>`}function Op(e,t,s,a){let n=Number(e?.total_months)||t.length||0,i=Number(s?.complete)||0,o=Number(s?.incomplete)||0,l=Number(s?.processing)||0,d=Number(a?.gray)||0,u=n>0?i/n*100:null,h=0,y=0;for(let p of t){let b=p?.import_stages||{};for(let w of["extract","raw_parquet","filter","postgres"]){let M=b[w];!M||M==="empty"||(h+=1,M==="complete"&&(y+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(i),"\u56DB\u500B\u532F\u5165\u968E\u6BB5\u90FD\u5B8C\u6210\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(o+l),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\uFF08\u542B\u8655\u7406\u4E2D\uFF09\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",c(d),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(n),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",Mt(u),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c(y)} / ${c(h)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([p,b,w])=>`<span class="index-runtime-metric" title="${r(w)}"><span>${r(p)}</span><strong>${r(b)}</strong></span>`).join("")}</div>`}function Hp(e,{titleSuffix:t="\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868"}={}){let s=`${r(e?.label||"\u6CD5\u898F\uFF0F\u547D\u4EE4")} ${r(t)}`,a=Array.isArray(e?.months)?e.months:[];if(!a.length)return`<section class="report-card processing-card import-files-card law-index-timeline-card">
      <div class="side-card-head">
        <span class="side-card-title">${m(e?.key==="order"?"file":"layers",14)}${s}</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u7121\u4E0B\u8F09\u7248\u672C\u6216\u7D22\u5F15\u7D00\u9304\u3002</div>
    </section>`;let n=new Map(a.map(v=>[String(v.month),v])),i=[...new Set(a.map(v=>v.year))].sort((v,p)=>String(p).localeCompare(String(v))),o=["download","prepared","indexed"],l=e.stage_labels||{download:"D \u4E0B\u8F09\u7248\u672C",prepared:"P \u8CC7\u6599\u5C31\u7DD2",indexed:"I \u7D22\u5F15\u8986\u84CB"},d=e.summary||{},u=e.current||{},h=i.map(v=>{let p=Array.from({length:12},(b,w)=>{let M=w+1,k=`${v}${String(M).padStart(2,"0")}`,S=n.get(k);return fi({month:S,year:v,monthNo:M,stageOrder:o,stageLabels:l,stageStatuses:S?.stages||{},overall:S?.overall||"empty",active:!!S?.active,workflowForStage:f=>f==="indexed"?"legal_index_versions":`${e.key}_download`,variant:"index"})}).join("");return`<tr><th scope="row">${r(v)}</th>${p}</tr>`}).join(""),y=u.month?`<div class="index-current-row">
        <span class="badge badge-info">${m("activity",11)}${r(u.label||"\u76EE\u524D\u7248\u672C")}</span>
        <strong class="mono">${r(u.month_label||Dn(u.month))}</strong>
        <span class="mono">${r(u.file||"\u2014")}</span>
        <span class="index-current-copy">${r(u.detail||"")}</span>
      </div>`:"";return`<section class="report-card processing-card import-files-card law-index-timeline-card" data-law-index-timeline="${r(e.key||"")}">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m(e.key==="order"?"file":"layers",14)}${s}</span>
      ${Fp(e,a,d)}
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(v,p)=>`<th scope="col">${p+1}</th>`).join("")}</tr></thead>
          <tbody>${h}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">D\uFF1A\u4E0B\u8F09\u7248\u672C\uFF1BP\uFF1Araw Parquet + PostgreSQL \u5C31\u7DD2\uFF1BI\uFF1Aactive \u7D22\u5F15\u8986\u84CB\uFF08\u7531\u6CD5\u898F\uFF0F\u547D\u4EE4\u7D22\u5F15\u6D41\u7A0B\u7DAD\u8B77\uFF09\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF0C\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u5B8C\u6210\u8272\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u6216\u5DF2\u53D6\u4EE3\u3002\u820A\u7248\u672C\u986F\u793A\u300C\u5DF2\u53D6\u4EE3\u300D\uFF0C\u4E0D\u9700\u91CD\u5EFA\u7D22\u5F15\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u7DE8\u865F\u3001\u4E0B\u8F09\u6642\u9593\u8207\u7B46\u6578\u3002</p>
    </div>
  </section>`}function zp(e,t={}){let s=Array.isArray(e)?e:[];return s.length?`<div class="law-index-timelines">${s.map(a=>Hp(a,t)).join("")}</div>`:""}function Bl({activeMonth:e,activeArchive:t,activePhase:s="",processingMonth:a="",processingArchive:n="",stageLabels:i={}}){if(!e||!t)return"";let o=`${String(e).slice(0,4)}-${String(e).slice(4,6)}`,l=i[s]||(s?"\u6E96\u5099\u4E2D":""),d=`${String(a||"").slice(0,4)}-${String(a||"").slice(4,6)}`,u=!!a&&(a!==e||n!==t);return`<span class="badge badge-info">${m("activity",11)}\u76EE\u524D\u532F\u5165</span>
    <strong class="mono">${r(o)}</strong>
    <span class="mono">${r(t)}</span>
    ${l?`<span class="badge badge-neutral">${r(l)}</span>`:""}
    ${u?`<span class="processing-current-processing">
            <span class="faint">\u8655\u7406\u4E2D</span>
            <strong class="mono">${r(d)}</strong>
            <span class="mono">${r(n||"\u2014")}</span>
          </span>`:""}`}function Up(e,t,s,a){let n=[];for(let i=1;i<=12;i+=1){let o=`${t}${String(i).padStart(2,"0")}`;n.push(Bp(e,s.get(o),t,i,a))}return`<tr><th scope="row">${t}</th>${n.join("")}</tr>`}function Gp(e){let t=e?.models||{};return[["Embedding",t.embedding],["Rerank",t.rerank]].filter(([,s])=>s&&(s.label||s.model)).map(([s,a])=>{let n=a.label||[a.host,a.model].filter(Boolean).join(" ")||"\u2014",i=[`${s} \u4E3B\u6A5F\u8207\u6A21\u578B\uFF1A${n}`,a.url?`\u7AEF\u9EDE\uFF1A${a.url}`:"",s==="Rerank"&&a.enabled===!1?"RAG_RERANK_ENABLED=false":""].filter(Boolean).join(" \xB7 ");return`<span class="processing-timeline-model" title="${r(i)}">${s} <strong class="mono">${r(n)}</strong>${s==="Rerank"&&a.enabled===!1?' <span class="faint">\u672A\u555F\u7528</span>':""}</span>`}).join("")}function Qp(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=a>0?n/a*100:null,o=t.reduce((h,y)=>{let v=y?.stages||{};return h+ui.filter(p=>!!v[p]&&v[p]!=="empty"&&v[p]!=="not_applicable").length},0),l=t.reduce((h,y)=>{let v=y?.stages||{};return h+ui.filter(p=>v[p]==="complete").length},0),d=(Number(s?.incomplete)||0)+(Number(s?.processing)||0);return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(n),"\u5DF2\u5B8C\u6210\u5168\u90E8\u56DB\u500B\u968E\u6BB5\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(d),"\u4ECD\u6709\u81F3\u5C11\u4E00\u500B\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",c(s?.update||0),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",Mt(i),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c(l)} / ${c(o)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([h,y,v])=>`<span class="index-runtime-metric" title="${r(v)}"><span>${r(h)}</span><strong>${r(y)}</strong></span>`).join("")}</div>`}function Wp(e,t){let s=new Map((Array.isArray(e?.workflows)?e.workflows:[]).map(h=>[String(h.id||""),h])),a=t.key==="judgment"?"index_versions":"legal_index_versions",i=s.get(a)?.index_runtime||{},o=h=>{if(h==null||h==="")return null;let y=Number(h);return Number.isFinite(y)?Math.max(0,Math.min(100,y)):null},l=new Map((Array.isArray(i.months)?i.months:[]).map(h=>[String(h?.month||""),o(h?.percent)])),d=new Map(Object.entries(i.active_coverage||{}).map(([h,y])=>[String(h),o(y?.percent)])),u=(h,y)=>{let v=s.get(String(h||""));if(!v)return null;let p=v.progress||{},b=Array.isArray(p.stages)?p.stages:[];for(let w of y){let M=b.find(S=>String(S.key)===w),k=o(M?.percent);if(k!==null)return k}return o(p.percent)};return(h,y,v)=>{let p=String(y||"");if(h==="qdrant"){let M=l.get(p),k=d.get(p);if(v==="processing"){if(M!==null&&M>0)return M;if(k!==null&&k>0)return k}else return v==="incomplete"?M!==null&&M>0?M:k!==null&&k>0?k:0:null}let b=Dl(t.key,h);if(!b)return null;let w=(Lp[t.key]||{})[h]||[h];return u(b,w)}}function Jp(e){let t=Array.isArray(e.file_timelines)?e.file_timelines:[];return t.length?`<div class="processing-timeline-overview">${t.map(s=>{let a=Array.isArray(s.months)?s.months:[],n=new Map(a.map(h=>[String(h.month||""),h])),i=[...new Set(a.map(h=>Number(h.year)))].filter(h=>Number.isFinite(h)).sort((h,y)=>y-h),o=s.summary||{},l=s.current||null,d=Gp(s),u=Wp(e,s);return`<section class="report-card processing-card import-files-card processing-timeline-card" data-processing-timeline="${r(s.key||"")}">
        <div class="side-card-head index-runtime-head">
          <span class="side-card-title">${m(s.icon||"activity",14)}${r(s.title||`${s.label||""}\u8655\u7406\u6642\u9593\u8868`)}</span>
          ${Qp(s,a,o)}
        </div>
        ${d?`<div class="index-runtime-summary">${d}</div>`:""}
        ${l?`<div class="index-current-row">
                <span class="badge badge-info">${m("activity",11)}${r(l.label||"\u76EE\u524D")}</span>
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
                    <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(h,y)=>`<th scope="col">${y+1}</th>`).join("")}</tr></thead>
                    <tbody>${i.map(h=>Up(s,h,n,u)).join("")}</tbody>
                  </table>
                </div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u3002</div>'}
          <p class="judgment-months-hint">${s.key==="judgment"?"\u5224\u6C7A\u4EE5\u88C1\u5224\u66F8\u6708\u4EFD\u986F\u793A\u3002":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u4EE5\u4F86\u6E90\u7248\u672C\u6708\u4EFD\u986F\u793A\u3002"}\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA\u4E0B\u8F09\u3001Parquet\u3001PostgreSQL\u3001Qdrant \u56DB\u500B\u968E\u6BB5\uFF1B\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF0CQdrant \u4E4B\u524D\u5DF2\u8655\u7406\u4F46\u5C1A\u672A\u5B8C\u6210\u6642\u4EE5\u5B8C\u6210\u8272\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u6216\u8272\u584A\u53EF\u67E5\u770B\u5404\u968E\u6BB5\u72C0\u614B\u8207\u9032\u5EA6\u3002</p>
        </div>
      </section>`}).join("")}</div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u8655\u7406\u6642\u9593\u8868\u3002</div>'}function Vp(e){return e.judgment_stats&&typeof e.judgment_stats=="object"?e.judgment_stats:{judgment_total:(e.raw_backups?.totals||{}).row_count,financial_total:(e.database||{}).judgment_count}}function Nl(e,t=new Set){return`${Dp(e)}
    ${Cp(e)}
    ${Jp(e)}
    ${Pp(e)}
    ${Ip(e)}`}function Kp(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${Ge({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:r(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${r(Se(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${m("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}function Yp(e,t){if(e.nodeType!==t.nodeType||e.nodeName!==t.nodeName){e.replaceWith(t.cloneNode(!0));return}if(e.nodeType===Node.TEXT_NODE){e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue);return}if(e.nodeType===Node.ELEMENT_NODE){for(let s of[...e.attributes])t.hasAttribute(s.name)||e.removeAttribute(s.name);for(let s of[...t.attributes])e.getAttribute(s.name)!==s.value&&e.setAttribute(s.name,s.value);t.hasAttribute("data-preserve-children")||Fl(e,t)}}function Fl(e,t){let s=[...e.childNodes],a=[...t.childNodes],n=Math.min(s.length,a.length);for(let i=0;i<n;i+=1)Yp(s[i],a[i]);for(let i=n;i<s.length;i+=1)s[i].remove();for(let i=n;i<a.length;i+=1)e.appendChild(a[i].cloneNode(!0))}function ys(e,t){let s=document.createElement("template");s.innerHTML=t,Fl(e,s.content)}var Ol={overview:"activity",law_download:"layers",order_download:"file",judgment_download:"download",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function Xp(e){let s=(Array.isArray(e.workflows)?e.workflows:[]).map(n=>{let i=n.active_run||null,o=i||n.last_run||null;return{...n,activeRun:i,lastRun:o,status:i?i.status||"running":n.update_available&&!In(n.id)?"update":o?.status||"idle"}}),a=s.find(n=>n.id==="judgment_parquet");return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...s.filter(n=>n.id!=="judgment_parquet"),...a?[a]:[]]}function Nn(e,t){let s=Xp(e),a=new Set(["law_download","judgment_download","normalize_courts"]);return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${s.map(n=>{let i=n.id===t,o=Ol[n.id]||"terminal",l=a.has(n.id)?'<div class="status-tab-divider" role="separator" aria-hidden="true"></div>':"",d=Number(n.pending_count)||0,u=n.update_available&&!In(n.id),h=Number(n.update_count)||(u?d:0),y=u&&h>0&&!n.activeRun,v=[n.update_message||`${n.update_origin||"\u66F4\u65B0\u5075\u6E2C"}\u627E\u5230 ${c(h)} \u9805\u53EF\u66F4\u65B0\u5167\u5BB9`,n.update_origin?`\u4F86\u6E90\uFF1A${n.update_origin}`:"",n.update_mechanism?`\u6A5F\u5236\uFF1A${n.update_mechanism}`:""].filter(Boolean).join(" \xB7 ");return`${l}<button class="status-tab${i?" is-active":""}" type="button"
            data-processing-workflow="${r(n.id)}"
            ${i?'aria-current="page"':""}>
            <span class="status-tab-icon">${m(o,15)}</span>
            <span class="status-tab-copy">
              <strong>${r(n.label)}</strong>
              <small>${r(n.description||"")}</small>
            </span>
            ${y?`<span class="badge badge-warn badge-mono processing-update-count" title="${r(v)}">${m(n.id==="judgment_import"?"download":"refresh",10)}${c(h)}</span>`:Wt(n.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${r(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function Zp(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${Wt(e.status)}
      <span class="mono">${r(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${r(Se(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${ge(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${r(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${r(t.log_path)}</strong>`:""}
    </div>
  </div>`}function La(e){return`${e.year}-${String(e.month_no).padStart(2,"0")}`}function Hl(e){let t={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"},s=e.status||"red";return[La(e),t[s]||s,e.latest_fileset_id?`fileset ${e.latest_fileset_id}`:"",e.filename||"",e.local_filename&&e.local_filename!==e.filename?`\u672C\u6A5F\uFF1A${e.local_filename}`:""].filter(Boolean).join(" \xB7 ")}function zl(e){if(!e.download_url)return"";let t=La(e);return`<a class="judgment-month-download" href="${r(Ft(St(e.download_url)))}" target="_blank" rel="noreferrer" title="\u4E0B\u8F09 ${t} \u5224\u6C7A" aria-label="\u4E0B\u8F09 ${t} \u5224\u6C7A">${m("download",11)}</a>`}function em(e){let t=e.status||"red";return`<td class="judgment-month is-${r(t)}" data-judgment-month-key="${r(La(e))}" title="${r(Hl(e))}"><span>${e.month_no}</span>${zl(e)}</td>`}function tm(e){return e?.off_hours_enabled===!0}function Ul(e){return`\u7DA0\u8272\uFF1A\u6700\u65B0\u7248\u5DF2\u4E0B\u8F09\u5230 raw_rar\uFF1B\u7070\u8272\uFF1A\u672C\u6A5F\u4ECD\u662F\u820A\u7248\uFF0C\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u6703\u66F4\u65B0\uFF1B\u7D05\u8272\uFF1A\u8A72\u6708\u4EFD\u7F3A\u5C11\u5224\u6C7A\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u958B\u555F\u4E0B\u8F09\u9023\u7D50\uFF08${tm(e)?"\u975E API \u6642\u6BB5\u4E5F\u53EF\u4E0B\u8F09\uFF0C\u5EFA\u8B70\u4E00\u6B21\u53EA\u4E0B\u8F09\u4E00\u500B\u6A94\u6848":"\u4E0B\u8F09\u9023\u7D50\u50C5\u5728 00:00\u201306:00 API \u6642\u6BB5\u53EF\u7528"}\uFF09\u3002\u5F85\u88DC\u9F4A\u6708\u4EFD\u6703\u512A\u5148\u4E0B\u8F09\uFF0C\u5168\u90E8\u88DC\u9F4A\u5F8C\u624D\u7531\u6700\u65B0\u6708\u4EFD\u5F80\u56DE\u9A57\u8B49\u65E2\u6709\u6A94\u6848\uFF1B\u4E2D\u65B7\u7684\u4E0B\u8F09\u6703\u4FDD\u7559 .part\uFF0C\u4F3A\u670D\u5668\u652F\u63F4 Range \u6642\u7E8C\u50B3\uFF0C\u5426\u5247\u5F9E\u96F6\u91CD\u65B0\u4E0B\u8F09\u3002\u9996\u6B21\u5B8C\u6574\u540C\u6B65\u53EF\u80FD\u9700\u4E0B\u8F09\u6578\u767E\u500B\u6708\u4EFD\uFF0C\u9810\u8A2D\u975E\u6642\u6BB5\u4E5F\u53EF\u7E8C\u50B3\uFF1B\u56B4\u683C\u6A21\u5F0F\u6703\u5728 00:00\u201306:00 \u4EE5\u5916\u505C\u6B62\u3002`}var sm={completed:"\u5B8C\u6210",window_closed:"API \u6642\u6BB5\u7D50\u675F",deadline:"\u63A5\u8FD1 06:00\uFF0C\u4FDD\u7559\u5F85\u4E0B\u8F09\u6708\u4EFD",verification_window_closed:"API \u6642\u6BB5\u7D50\u675F\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",verification_deadline:"\u63A5\u8FD1 06:00\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",errors:"\u90E8\u5206\u6708\u4EFD\u4E0B\u8F09\u5931\u6557\uFF0C\u4E0B\u6B21\u91CD\u8A66",pending:"\u4ECD\u6709\u5F85\u4E0B\u8F09\u6708\u4EFD",check_only:"\u50C5\u6AA2\u67E5\uFF0C\u672A\u4E0B\u8F09",incremental:"\u589E\u91CF\u6AA2\u67E5\u5B8C\u6210",status_only:"\u50C5\u66F4\u65B0\u6708\u4EFD\u72C0\u614B",running:"\u57F7\u884C\u4E2D"};function bi(e){let t=e?.backfill||{},s=t.verification||{},a=t.last_run||{},n=Number(t.pending_count)||0,i=Number(t.failure_count)||0,o=String(t.resume_from_month||""),l="\u9A57\u8B49\uFF1A\u672A\u958B\u59CB";s.status==="completed"?l="\u9A57\u8B49\u5B8C\u6210":s.next_month?l=`\u9A57\u8B49\u7E8C\u50B3 ${s.next_month}`:s.status==="in_progress"&&(l="\u9A57\u8B49\u9032\u884C\u4E2D");let d=String(a.stop_reason||""),u=d?`\u4E0A\u6B21\u505C\u6B62\uFF1A${sm[d]||d}`:"";return{pending:n,failures:i,resume:o,verificationText:l,lastText:u}}function am(e){let t=bi(e),s=t.pending>0?`\u5F85\u88DC\u9F4A ${c(t.pending)} \u500B\u6708${t.failures>0?`\uFF08${c(t.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708";return`<div class="judgment-backfill" data-judgment-backfill>
    <span class="badge ${t.pending>0?"badge-danger":"badge-ok"}" data-judgment-backfill-pending>${s}</span>
    <span class="badge badge-neutral" data-judgment-backfill-resume ${t.resume&&t.pending>0?"":"hidden"}>\u5F9E ${r(t.resume)} \u7E8C\u50B3</span>
    <span class="badge badge-info" data-judgment-backfill-verification>${r(t.verificationText)}</span>
    <span class="muted" data-judgment-backfill-last ${t.lastText?"":"hidden"}>${r(t.lastText)}</span>
  </div>`}function nm(e,t){let s=bi(t),a=e.querySelector("[data-judgment-backfill-pending]");a&&(a.textContent=s.pending>0?`\u5F85\u88DC\u9F4A ${c(s.pending)} \u500B\u6708${s.failures>0?`\uFF08${c(s.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708",a.classList.toggle("badge-danger",s.pending>0),a.classList.toggle("badge-ok",s.pending===0));let n=e.querySelector("[data-judgment-backfill-resume]");if(n){let l=!!s.resume&&s.pending>0;n.hidden=!l,n.textContent=l?`\u5F9E ${s.resume} \u7E8C\u50B3`:""}let i=e.querySelector("[data-judgment-backfill-verification]");i&&(i.textContent=s.verificationText);let o=e.querySelector("[data-judgment-backfill-last]");o&&(o.hidden=!s.lastText,o.textContent=s.lastText)}function hi(){return'<div class="judgment-months-loading"><span class="spinner"></span><span>\u8B80\u53D6\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B\u2026</span></div>'}function rm(e){if(e?.loading&&!e?.months?.length)return hi();if(e?.error&&!e?.months?.length)return Ge({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(e.error)});let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return'<div class="processing-empty">\u5C1A\u672A\u6709\u6708\u4EFD\u72C0\u614B\uFF1B\u8ACB\u5148\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u3002</div>';let s=new Map(t.map(o=>[La(o),o])),n=[...new Set(t.map(o=>o.year))].sort((o,l)=>l-o).map(o=>{let l=Array.from({length:12},(d,u)=>{let h=s.get(`${o}-${String(u+1).padStart(2,"0")}`);return h?em(h):`<td class="judgment-month is-empty"><span>${u+1}</span></td>`}).join("");return`<tr><th scope="row">${o}</th>${l}</tr>`}).join(""),i=e.summary||{};return`<div class="judgment-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" data-judgment-summary="green">\u6700\u65B0\u7248 ${c(i.green||0)}</span>
      <span class="badge badge-neutral" data-judgment-summary="gray">\u820A\u7248 ${c(i.gray||0)}</span>
      <span class="badge badge-danger" data-judgment-summary="red">\u7F3A\u5931 ${c(i.red||0)}</span>
      <span class="muted" data-judgment-total>\u5171 ${c(e.total_months||t.length)} \u500B\u6708</span>
    </div>
    ${am(e)}
    <div class="judgment-months-scroll">
      <table class="judgment-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(o,l)=>`<th scope="col">${l+1}</th>`).join("")}</tr></thead>
        <tbody>${n}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint" data-judgment-hint>${r(Ul(e))}</p>
  </div>`}function im(e,t){let s=Array.isArray(t?.months)?t.months:[],a=t.summary||{},n={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"};e.querySelectorAll("[data-judgment-summary]").forEach(l=>{let d=l.dataset.judgmentSummary||"";l.textContent=`${n[d]||d} ${c(a[d]||0)}`});let i=e.querySelector("[data-judgment-total]");i&&(i.textContent=`\u5171 ${c(t.total_months||s.length)} \u500B\u6708`),nm(e,t);let o=e.querySelector("[data-judgment-hint]");if(o){let l=Ul(t);o.textContent!==l&&(o.textContent=l)}for(let l of s){let d=La(l),u=e.querySelector(`[data-judgment-month-key="${d}"]`);if(!u)continue;let h=l.status||"red";u.classList.contains(`is-${h}`)||(u.classList.remove("is-green","is-gray","is-red","is-empty"),u.classList.add(`is-${h}`));let y=Hl(l);u.title!==y&&(u.title=y);let v=u.querySelector(".judgment-month-download");if(l.download_url){let p=St(l.download_url);v?v.getAttribute("href")!==p&&(v.href=p):u.insertAdjacentHTML("beforeend",zl(l))}else v&&v.remove()}}function om(e){let t=Array.isArray(e)?e:[];return t.length?`<div class="processing-workflow-history">
    ${t.map(s=>`<div class="processing-workflow-history-row">
          <span class="processing-workflow-history-status">${Wt(s.status||"idle")}</span>
          <span class="mono">${r(Se(s.started_at))}</span>
          <span class="mono">${r(ge(s.duration_ms||0))}</span>
          <span class="processing-workflow-history-message">${r(s.message||"\u2014")}</span>
        </div>`).join("")}
  </div>`:'<div class="processing-workflow-empty">\u5C1A\u7121\u57F7\u884C\u7D00\u9304\u3002</div>'}function lm(e){let t=Array.isArray(e.update_history)?e.update_history:[];if(!t.length)return'<div class="processing-workflow-empty">\u5C1A\u7121\u7248\u672C\u6AA2\u67E5\u7D00\u9304\u3002</div>';let s={up_to_date:["\u5DF2\u662F\u6700\u65B0","badge-ok"],update_available:["\u6709\u66F4\u65B0","badge-warn"],error:["\u6AA2\u67E5\u5931\u6557","badge-danger"]};return`<div class="processing-workflow-history">
    ${t.map(a=>{let[n,i]=s[a.status]||[a.status||"\u672A\u77E5","badge-neutral"],o=a.remote_content_length!=null?Pe(a.remote_content_length):"\u2014",l=a.local_version_id?`v${a.local_version_id}`:"\u2014";return`<div class="processing-workflow-history-row">
          <span class="badge ${i}">${r(n)}</span>
          <span class="mono">${r(Se(a.checked_at))}</span>
          <span class="mono">\u9060\u7AEF ${r(o)}</span>
          <span class="mono">\u672C\u5730 ${r(l)}</span>
          <span class="processing-workflow-history-message">${r(a.message||"\u2014")}</span>
        </div>`}).join("")}
  </div>`}function Gl(e){let t=String(e.key||""),s=Es(e.status);return[`data-stage-key="${r(t)}"`,`data-stage-label="${r(e.label||t)}"`,`data-stage-color="${r(Il(e))}"`,`data-stage-status-key="${r(e.status||"idle")}"`,`data-stage-status="${r(s.label)}"`,`data-stage-percent="${r(Mt(e.percent))}"`,`data-stage-counts="${r(gi(e))}"`,`data-stage-duration="${r(Hs(e.duration_ms||0))}"`,`data-stage-contribution="${r(Mt(e.contribution_percent))}"`,`data-stage-message="${r(e.message||"")}"`].join(" ")}function cm(e,t=Date.now()){let s=String(e.status||"idle"),a=Number(e.duration_ms)||0,n=Date.parse(e.started_at||"");if(s==="running"&&Number.isFinite(n))return Math.max(a,t-n);if(a>0)return a;let i=Date.parse(e.finished_at||"");return Number.isFinite(n)&&Number.isFinite(i)?Math.max(0,i-n):0}function Ql(e){if(e.key!=="filter")return null;let t=Number(e.financial_processed),s=Number(e.financial_matched);return e.financial_processed===null||e.financial_processed===void 0||!Number.isFinite(t)||!Number.isFinite(s)||t<=0?null:{processed:t,matched:s,percent:Math.round(s/t*100)}}function dm(e){let t=String(e.status||"idle"),s=[],a=Number(e.total);if(e.key==="postgres"&&["success","no_change"].includes(t)&&Number.isFinite(a)&&a>0)s.push(`\u7E3D\u8A08 ${c(a)} \u7B46`);else{let i=gi(e);i!=="\u2014"&&s.push(i)}let n=Ql(e);return n&&s.push(`\u91D1\u878D\u4F54\u6BD4 ${n.percent}%`),s.join(" \xB7 ")}function um(e,t){let s=String(e.status||"idle"),a=[],n=(d,u,{always:h=!1}={})=>{let y=u==null?"":String(u).trim();!h&&!y||a.push(`<span class="rag-wf-detail"><span>${r(d)}</span><strong>${r(y||"\u2014")}</strong></span>`)};n("\u72C0\u614B",Es(s).label,{always:!0}),n("\u958B\u59CB",e.started_at?Se(e.started_at):"\u2014",{always:!0}),n("\u7D50\u675F",e.finished_at?Se(e.finished_at):"\u2014",{always:!0}),n("\u8017\u6642",t,{always:!0}),n("\u9032\u5EA6",Mt(e.percent),{always:!0});let i=gi(e),o=["extract","raw_parquet"].includes(String(e.key||""));n(o?"\u7D2F\u8A08\u8CC7\u6599\u91CF":"\u8CC7\u6599\u91CF",i!=="\u2014"?i:"");let l=Ql(e);return l&&(n("\u91D1\u878D\u6848\u4EF6",`${c(l.matched)} \u7B46`),n("\u5168\u90E8\u6848\u4EF6",`${c(l.processed)} \u7B46`),n("\u91D1\u878D\u4F54\u6BD4",`${l.percent}%`)),n("\u6574\u9AD4\u5360\u6BD4",Mt(e.contribution_percent)),s==="failed"||s==="stale"?(n("\u539F\u56E0",e.error||e.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002"),n("\u5EFA\u8B70",e.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002")):n("\u8AAA\u660E",e.message),a.join("")}function pm(e){let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${m("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A host/model\u3001Blue-Green \u5EFA\u7F6E\u8207\u5404\u968E\u6BB5\u9032\u5EA6\u3002</div>
    </section>`;let a=new Map(s.map(ue=>[String(ue.key||""),ue])),n=a.get("ollama")||{},i=a.get("qdrant")||{},o=a.get("validate")||{},l=e.index_runtime||{},d=l.summary||{},u=l.copy||{},h=Number(l.index_prior_duration_ms||0),y=l.current||{},v=l.embedding||{},p=v.selected||{},b=v.active||{},w=Number(l.expected_count||d.total||i.total||0),M=Number(d.indexed??i.current??0),k=w>0?Math.min(100,M/w*100):i.status==="success"?100:0,S=Number(u.total||0),f=Number(u.copied||0),T=S>0?Math.min(100,f/S*100):u.status==="success"?100:0,V=String(l.build_mode||""),Q=String(t.run_status||""),fe=!!Q&&!["running","success","no_change"].includes(Q),ve=String(u.status||(V==="reuse"?"pending":"skipped"));fe&&ve==="pending"&&(ve="stale");let se=Number(u.duration_ms||0)/1e3,L=se>0?f/se:0,q=ve==="running"&&L>0&&S>f?(S-f)/L:null,E=Vl(e,l,M),K=Yl(l,M,w,E),de=K?.remainingMs&&K.remainingMs>0?K.remainingMs/1e3:null,H=ve==="success"||ve==="skipped"||M>0||i.status==="success",ie=i.status==="success"?"success":H&&i.status||"pending",Te=String(o.status||"pending"),B=Te==="success"&&/alias 已切換/.test(String(o.message||"")),qe=B?"success":Te==="failed"?"failed":Q==="running"?"pending":"skipped",ae=l.version_id?`v${String(l.version_id).padStart(3,"0")}`:"\u2014",Le=b.host||p.host||b.url||p.url||"\u2014",Ie=b.port||p.port,Ee=Ie?`${Le}:${Ie}`:String(Le),Ze=b.model||p.model||l.model||"\u2014",le=H&&y.month?`${Dn(y.month)}${y.preparing?"\uFF08\u6E96\u5099\u4E2D\uFF09":""}`:t.run_status==="running"?"\u6E96\u5099\u4E2D":"\u2014",ee=String(y.phase||"")==="embedding"?"E \u65B0 embedding":String(y.phase||"")==="reuse"?"R \u91CD\u7528":"\u2014",Me=(()=>{let ue=Number(i.duration_ms)||0,rt=Date.parse(i.started_at||"");if(i.status==="running"&&Number.isFinite(rt))return Math.max(ue,Date.now()-rt);if(ue>0)return ue;let We=Date.parse(i.finished_at||"");return Number.isFinite(rt)&&Number.isFinite(We)?Math.max(0,We-rt):0})(),ye=[{key:"probe",label:"llama-server \u4E3B\u6A5F\uFF0F\u6A21\u578B\u6E2C\u8A66",caption:"\u4E3B\u6A5F\uFF0F\u6A21\u578B\u3001\u9023\u7DDA\u6E2C\u8A66",color:"#22c55e",status:n.status||"pending",percent:Number(n.percent)||0,current:Number(n.current)||0,total:Number(n.total)||0,unit:"\u53F0",duration_ms:n.duration_ms,started_at:n.started_at,finished_at:n.finished_at,extraDetails:[["\u4E3B\u6A5F",Ee],["\u6A21\u578B",Ze],["\u6E2C\u8A66\u4E3B\u6A5F",`${c(n.current||0)} / ${c(n.total||0)} \u53F0`]],detail:`${c(n.current||0)} / ${c(n.total||0)} \u53F0 \xB7 ${Ee} \xB7 ${Ze}`},{key:"version",label:"\u5EFA\u7ACB\uFF0F\u63A5\u7E8C Blue-Green \u7248\u672C",caption:"Blue-Green \u7248\u672C\u3001collection",color:"#06b6d4",status:l.version_id?"success":"pending",percent:l.version_id?100:0,current:l.version_id?1:0,total:1,unit:"\u968E\u6BB5",duration_ms:l.version_duration_ms,started_at:null,finished_at:null,extraDetails:[["\u7248\u672C",ae],["Collection",l.collection||"\u2014"],["\u6A21\u5F0F",V||"\u2014"]],detail:`${ae} \xB7 ${l.collection||"\u2014"} \xB7 ${V||"\u2014"}`},{key:"copy",label:"\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF",caption:"\u820A collection \u5411\u91CF\u8907\u88FD",color:"#f59e0b",status:ve,percent:T,current:f,total:S,unit:"points",duration_ms:u.duration_ms,started_at:u.started_at,finished_at:u.finished_at,extraDetails:[["\u5DF2\u8907\u88FD",`${c(f)} points`],["\u7E3D points",c(S)],["\u7BC4\u570D","\u5168\u57DF points\uFF1B\u4E0D\u5217\u5165\u6708\u4EFD R\uFF0FE"],["\u8907\u88FD\u901F\u5EA6",L>0?`${L.toFixed(1)} points/\u79D2`:"\u2014"],u.resumed?["\u4F86\u6E90",`\u7E8C\u8DD1\u524D\u5B8C\u6210${u.resumed_from_run_id?`\uFF08${u.resumed_from_run_id}\uFF09`:""}`]:null,["\u9810\u4F30\u5269\u9918",q!==null?Ma(q):"\u2014"]],detail:S>0?`${c(f)} / ${c(S)} points \xB7 \u820A collection \u5411\u91CF${u.resumed?" \xB7 \u7E8C\u8DD1\u524D\u5B8C\u6210":""}`:ve==="skipped"?"\u672C\u6B21\u4E0D\u9700\u8907\u88FD\u820A\u5411\u91CF":ve==="stale"?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5B8C\u6210\u8907\u88FD":"\u7B49\u5F85\u820A collection \u8907\u88FD"},{key:"index",label:"\u91D1\u878D\u5224\u6C7A\u5411\u91CF\u7D22\u5F15",caption:"R \u85CD\uFF0FE \u7D2B\uFF1B\u672C\u6B21 run \u9032\u5EA6",color:"#a78bfa",barColor:ee==="E \u65B0 embedding"?"#a78bfa":ee==="R \u91CD\u7528"?"#3b82f6":"",status:ie,phaseKey:ee==="R \u91CD\u7528"?"reuse":ee==="E \u65B0 embedding"?"embedding":"",phaseLabel:ie==="running"?ee:"",percent:k,current:M,total:w,unit:"\u7B46",duration_ms:H?i.duration_ms:0,extraDurationMs:h,started_at:H?i.started_at||l.started_at:null,finished_at:i.finished_at,extraDetails:[["\u5DF2\u7D22\u5F15",`${c(M)} / ${c(w)} \u7B46`],h>0?["\u524D\u6B21\u57F7\u884C",Hs(h)]:null,h>0?["\u672C\u6B21\u57F7\u884C",Hs(Me)]:null,["\u91CD\u7528",c(d.reused)],["\u65B0 embedding",c(d.embedded)],["\u76EE\u524D\u6708\u4EFD",le],["\u76EE\u524D\u6279\u6B21",ee],["\u672C\u6279 R\uFF0FE",`R ${c(y.reused||0)} \xB7 E ${c(y.embedded||0)}`],["R \u5B9A\u7FA9","04 \u9010\u6708\u6383\u63CF\u6CBF\u7528\uFF1B03 \u8907\u88FD\u70BA\u5168\u57DF points"],["\u9810\u4F30\u5269\u9918",H&&de!==null?Ma(de):"\u2014"]],htmlDetails:hm(l),detail:H?`${c(M)} / ${c(w)} \u7B46 \xB7 \u91CD\u7528 ${c(d.reused)} \xB7 \u65B0 embedding ${c(d.embedded)}${ee==="\u2014"?"":` \xB7 ${ee}`}`:"\u7B49\u5F85\u7248\u672C\u6E96\u5099\uFF08\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF\uFF09\u5B8C\u6210"},{key:"validate",label:"\u9A57\u8B49\u65B0\u7248\u672C",caption:"\u7B46\u6578\u3001\u7DAD\u5EA6\u3001payload",color:"#eab308",status:Te,percent:Te==="success"?100:0,current:null,total:null,duration_ms:o.duration_ms,started_at:o.started_at,finished_at:o.finished_at,extraDetails:[["\u9A57\u8B49\u8A0A\u606F",o.message||"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210"]],detail:o.message||(fe?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u9032\u884C\u9A57\u8B49\u3002":"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210\u5F8C\u9A57\u8B49\u7B46\u6578\u3001\u7DAD\u5EA6\u8207 payload\u3002")},{key:"activate",label:"\u5207\u63DB alias",caption:"judgments_current alias",color:"#3b82f6",status:qe,percent:B?100:0,current:null,total:null,duration_ms:0,started_at:null,finished_at:null,extraDetails:[["\u76EE\u6A19 alias","judgments_current"]],detail:B?o.message:fe?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5207\u63DB alias\u3002":"\u9A57\u8B49\u901A\u904E\u5F8C\u5207\u63DB judgments_current\u3002"}],_e=ye.filter(ue=>ue.status!=="skipped"),je=_e.length?_e.reduce((ue,rt)=>ue+rt.percent,0)/_e.length:0,D=ye.filter(ue=>ue.status==="success").length,F=Mt(je),W=Date.now(),P=ue=>{let rt=Number(ue.extraDurationMs)||0,We=Number(ue.duration_ms)||0,mt=Date.parse(ue.started_at||"");if(ue.status==="running"&&Number.isFinite(mt))return rt+Math.max(We,W-mt);if(We>0)return rt+We;let wt=Date.parse(ue.finished_at||"");return rt+(Number.isFinite(mt)&&Number.isFinite(wt)?Math.max(0,wt-mt):0)},z=ye.map(ue=>{let rt=P(ue);return{...ue,computedDuration:rt,drawable:!["skipped","pending"].includes(ue.status)}}),J=Math.max(z.reduce((ue,rt)=>ue+(rt.drawable?rt.computedDuration:0),0),Number(t.duration_ms)||0,1),$e=1.25,De=z.map(ue=>ue.drawable?Math.max(ue.computedDuration/J*100,$e):0),et=De.reduce((ue,rt)=>ue+rt,0),ft=et>100?100/et:1,ot=0,Ue=z.map((ue,rt)=>{let We=De[rt]*ft,mt=We>0?{start:ot,width:We}:null;return mt&&(ot+=We),{...ue,bar:mt}}).map((ue,rt)=>{let We=[`is-${ue.status}`,ue.status==="failed"||ue.status==="stale"?"is-error":"",["pending","skipped"].includes(ue.status)?"is-missing":"",ue.status==="running"?"is-running":""].filter(Boolean).join(" "),mt=["pending","skipped"].includes(ue.status)?"\u2014":Hs(ue.computedDuration),wt=ue.status==="running"?` \xB7 ${Mt(ue.percent)}`:"",ne=ue.phaseLabel?`<span class="index-wf-phase is-${r(ue.phaseKey||"unknown")}">${r(ue.phaseLabel)}</span>`:"",he="";if(ue.bar){let $t=Math.max(0,Math.min(100,ue.bar.start)),x=Math.max(0,Math.min(100-$t,ue.bar.width)),R=ue.status==="success"?100:Math.max(0,Math.min(100,Number(ue.percent)||0)),C=x*R/100,O=x-C,Y=r(ue.barColor||ue.color);C>0&&(he+=`<span class="rag-wf-bar index-wf-bar is-sequential" style="left:${$t.toFixed(3)}%;width:${C.toFixed(4)}%;top:0;height:12px;--bar-color:${Y}" aria-hidden="true"></span>`),O>1e-4&&(he+=`<span class="rag-wf-bar index-wf-bar is-hollow is-sequential" style="left:${($t+C).toFixed(3)}%;width:${O.toFixed(4)}%;top:0;height:12px;--bar-color:${Y}" aria-hidden="true"></span>`)}let tt=[],Qe=($t,x)=>{x==null||x===""||tt.push(`<span class="rag-wf-detail"><span>${r($t)}</span><strong>${r(String(x))}</strong></span>`)};Qe("\u72C0\u614B",Es(ue.status).label),Qe("\u958B\u59CB",ue.started_at?Se(ue.started_at):"\u2014"),Qe("\u7D50\u675F",ue.finished_at?Se(ue.finished_at):"\u2014"),Qe("\u8017\u6642",mt),Qe("\u9032\u5EA6",Mt(ue.percent));for(let $t of ue.extraDetails||[]){if(!$t)continue;let[x,R]=$t;Qe(x,R)}Qe("\u8AAA\u660E",ue.detail);let Bt={...ue,duration_ms:ue.computedDuration,contribution_percent:_e.length?(Number(ue.percent)||0)/_e.length:null,message:ue.detail};return`<details class="rag-wf-stage index-wf-stage ${We}" data-index-stage="${r(ue.key)}"${ci.has(ue.key)?" open":""} style="--stage-color:${r(ue.color)}" ${Gl(Bt)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="index-wf-step">${String(rt+1).padStart(2,"0")}</span> ${r(ue.label)}</strong><small>${r(ue.caption||"")}</small></span>
            </span>
            <span class="rag-wf-stage-meta">${r(mt)}${r(wt)}${ne?` \xB7 ${ne}`:""} \xB7 ${r(Es(ue.status).label)} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px">${he}</span>
        </summary>
        <div class="rag-wf-details">${tt.join("")}${ue.htmlDetails||""}</div>
      </details>`}).join("");return`<section class="report-card processing-card processing-workflow-progress-card index-wf-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${m("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
      <span class="badge ${t.run_status==="running"?"badge-info":"badge-neutral"}">${c(D)} / ${c(_e.length)} \u968E\u6BB5</span>
    </div>
    <div class="index-wf-summary">
      <span>\u6574\u9AD4 <strong class="mono">${F}</strong></span>
      <span>\u7248\u672C <strong class="mono">${r(ae)}</strong></span>
      <span>Collection <strong class="mono">${r(l.collection||"\u2014")}</strong></span>
      <span>\u6A21\u5F0F <strong>${r(V||"\u2014")}</strong></span>
      <span>Host <strong class="mono">${r(Ee)}</strong></span>
      <span>Model <strong class="mono">${r(Ze)}</strong></span>
      <span>\u76EE\u524D <strong>${r(le)}</strong></span>
    </div>
    <div class="index-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${J>0?r(Hs(J)):"\u2014"}</span>
      </div>
      <div class="rag-wf-legend index-wf-are-legend" aria-label="\u5224\u6C7A\u7D22\u5F15 R\uFF0FE \u984F\u8272\u5716\u4F8B">
        <span><i class="is-reuse"></i>R \u672C\u6B21\u6CBF\u7528\uFF0804 \u85CD\uFF09</span>
        <span><i class="is-embed"></i>E \u65B0 embedding\uFF0804 \u7D2B\uFF09</span>
        <span><i class="is-hollow"></i>04 \u672A\u5B8C\u6210\uFF0825% \u6DFA\u8272\uFF09</span>
      </div>
      <div class="rag-wf-stages">${Ue}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7684\u7D50\u675F\u5373\u4E0B\u4E00\u968E\u6BB5\u7684\u958B\u59CB\uFF1B\u5DF2\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u9032\u884C\u4E2D\u6216\u672A\u5B8C\u6210\u968E\u6BB5\u53EA\u8457\u8272\u5DF2\u5B8C\u6210\u6BD4\u4F8B\uFF0C\u5176\u9918\u672A\u5B8C\u6210\u5340\u6BB5\u4EE5\u540C\u8272 25% \u6DFA\u8272\u8868\u793A\uFF0C\u7B49\u5F85\u968E\u6BB5\u4FDD\u7559\u7A7A\u5FC3\u8ECC\u9053\u3001\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\u3002\u6975\u77ED\u968E\u6BB5\u6703\u4EE5\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u5448\u73FE\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u9032\u5EA6\u8207\u8A73\u7D30\u6578\u64DA\u3002</p>
    </div>
    <div class="index-wf-overall">
      <div class="index-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${F}</span>
      </div>
      <div class="index-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,je)).toFixed(1)}%"></span>
      </div>
    </div>
  </section>`}function mm(e){if(e.id==="index_versions")return pm(e);let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${m("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u5404\u968E\u6BB5\u8207\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </section>`;let a=Date.now(),n=s.map(B=>{let qe=String(B.status||"idle");return{...B,status:qe,computedDuration:cm(B,a),drawable:!["pending","skipped","idle"].includes(qe)}}),i=n.filter(B=>B.status!=="skipped"),o=n.filter(B=>B.drawable).reduce((B,qe)=>B+qe.computedDuration,0),l=Math.max(o,Number(t.duration_ms)||0,1),d=n.some(B=>B.computedDuration>0),u=1.25,h=n.map(B=>B.drawable?Math.max(B.computedDuration/l*100,u):0),y=h.reduce((B,qe)=>B+qe,0),v=y>100?100/y:1,p=0,b=n.map((B,qe)=>{let ae=h[qe]*v,Le=B.drawable?{start:p,width:ae}:null;return Le&&(p+=ae),{...B,bar:Le}}),w=n.filter(B=>["success","no_change"].includes(B.status)).length,M=n.find(B=>B.status==="running"),k=n.filter(B=>B.status==="running").length,S=n.filter(B=>["pending","idle"].includes(B.status)).length,f=n.filter(B=>B.status==="skipped").length,T=i.length||Number(t.total_stages)||0,V=t.overall_percent,Q=V==null||V===""?null:Number(V),fe=Number.isFinite(Q)?Mt(Q):"\u2014",ve=d?Hs(l):"\u2014",se=String(t.run_status||""),L=se?Es(se).label:"\u2014",q=M&&(M.label||M.key)||"\u2014",E=n.map(B=>Date.parse(B.started_at||"")).filter(B=>Number.isFinite(B)),K=n.map(B=>Date.parse(B.finished_at||"")).filter(B=>Number.isFinite(B)),de=E.length?new Date(Math.min(...E)).toISOString():null,H=M?null:K.length?new Date(Math.max(...K)).toISOString():null,ie=b.map((B,qe)=>{let ae=B.status,Le=["failed","stale","interrupted"].includes(ae),Ie=[`is-${ae}`,Le?"is-error":"",["pending","skipped","idle"].includes(ae)?"is-missing":"",ae==="running"?"is-running":""].filter(Boolean).join(" "),Ee=B.drawable?Hs(B.computedDuration):"\u2014",Ze=Es(ae).label,le=ae==="failed"?`\u539F\u56E0\uFF1A${String(B.error||B.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002").trim()}
\u5EFA\u8B70\uFF1A${String(B.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002").trim()}`:"",ee=le?`<span class="badge badge-danger is-failure-tip" tabindex="0" aria-label="${r(le)}" data-failure-tip="${r(le)}"><span class="status-dot is-danger"></span>\u5931\u6557</span>`:r(Ze),Me=Il(B),ye=Le?"var(--danger)":Me,_e=ae==="running"?` \xB7 ${Mt(B.percent)}`:"",je="";if(B.bar){let J=Math.max(0,Math.min(100,B.bar.start)),$e=Math.max(0,Math.min(100-J,B.bar.width)),De=["success","no_change"].includes(ae)?100:Math.max(0,Math.min(100,Number(B.percent)||0)),et=$e*De/100,ft=$e-et;et>0&&(je+=`<span class="rag-wf-bar workflow-wf-bar is-sequential" style="left:${J.toFixed(3)}%;width:${et.toFixed(4)}%;top:0;height:12px;--bar-color:${r(ye)}" aria-hidden="true"></span>`),ft>1e-4&&(je+=`<span class="rag-wf-bar workflow-wf-bar is-hollow is-sequential" style="left:${(J+et).toFixed(3)}%;width:${ft.toFixed(4)}%;top:0;height:12px;--bar-color:${r(ye)}" aria-hidden="true"></span>`)}let D=B.label||B.key||"\u968E\u6BB5",F=dm(B),W=`${D}\uFF1A${Ze}\uFF0C${ae==="running"?`\u9032\u5EA6 ${Mt(B.percent)}\uFF0C`:""}\u8017\u6642 ${Ee}`,P={...B,duration_ms:B.computedDuration,message:le||B.message||F||""},z=`${e.id}:${B.key||qe}`;return`<details class="rag-wf-stage workflow-wf-stage ${Ie}" data-workflow-wf-stage="${r(z)}"${di.has(z)?" open":""} style="--stage-color:${r(Me)}" ${Gl(P)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="workflow-wf-step">${String(qe+1).padStart(2,"0")}</span> ${r(D)}</strong>${F?`<small>${r(F)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(Ee)}${r(_e)} \xB7 ${ee} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(W)}">${je}</span>
        </summary>
        <div class="rag-wf-details">${um(B,Ee)}</div>
      </details>`}).join(""),Te=Rp[e.id]||"";return`<section class="report-card processing-card processing-workflow-progress-card workflow-wf-card" data-workflow-progress>
    <div class="side-card-head index-runtime-head workflow-wf-head">
      <span class="side-card-title">${m("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
      <div class="index-runtime-metrics workflow-wf-metrics">
        <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u5168\u90E8\u968E\u6BB5\u7684\u6578\u91CF\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${w} / ${T}</strong></span>
        <span class="index-runtime-metric" title="\u76EE\u524D\u57F7\u884C\u4E2D\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u57F7\u884C\u4E2D</span><strong>${k}</strong></span>
        <span class="index-runtime-metric" title="\u5C1A\u672A\u958B\u59CB\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7B49\u5F85</span><strong>${S}</strong></span>
        <span class="index-runtime-metric" title="\u672C\u6B21\u6D41\u7A0B\u4E0D\u9700\u8981\u57F7\u884C\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7565\u904E</span><strong>${f}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u968E\u6BB5\u8017\u6642\u5408\u8A08\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(ve)}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u53C3\u8207\u968E\u6BB5\u5B8C\u6210\u6BD4\u4F8B\u7684\u5E73\u5747\u3002"><span>\u6574\u9AD4\u9032\u5EA6</span><strong>${fe}</strong></span>
      </div>
    </div>
    <div class="workflow-wf-summary">
      <span>\u57F7\u884C <strong>${r(L)}</strong></span>
      <span>\u958B\u59CB <strong>${de?r(Se(de)):"\u2014"}</strong></span>
      <span>\u7D50\u675F <strong>${M?"\u9032\u884C\u4E2D":H?r(Se(H)):"\u2014"}</strong></span>
      <span>\u76EE\u524D <strong>${r(q)}</strong></span>
      <span>Run <strong class="mono">${r(t.run_id||"\u2014")}</strong></span>
    </div>
    <div class="workflow-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${r(ve)}</span>
      </div>
      <div class="rag-wf-legend workflow-wf-legend" aria-label="\u968E\u6BB5\u72C0\u614B\u5716\u4F8B">
        <span><i class="is-solid-state"></i>\u5B8C\u6210</span>
        <span><i class="is-hollow-state"></i>\u672A\u5B8C\u6210\uFF0825% \u6DFA\u8272\uFF09</span>
        <span><i class="is-progress-state"></i>\u57F7\u884C\u4E2D\uFF08\u9032\u5EA6\u689D\uFF09</span>
        <span><i class="is-empty-state"></i>\u7B49\u5F85\uFF0F\u7565\u904E</span>
      </div>
      <div class="rag-wf-stages">${ie}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7684\u7D50\u675F\u5373\u4E0B\u4E00\u968E\u6BB5\u7684\u958B\u59CB\uFF1B\u5DF2\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u57F7\u884C\u4E2D\u6216\u672A\u5B8C\u6210\u968E\u6BB5\u53EA\u8457\u8272\u5DF2\u5B8C\u6210\u6BD4\u4F8B\uFF0C\u5176\u9918\u672A\u5B8C\u6210\u5340\u6BB5\u4EE5\u540C\u8272 25% \u6DFA\u8272\u8868\u793A\uFF0C\u7B49\u5F85\u968E\u6BB5\u4FDD\u7559\u7A7A\u5FC3\u8ECC\u9053\u3001\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\u3002\u6975\u77ED\u968E\u6BB5\u6703\u4EE5\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u5448\u73FE\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u9032\u5EA6\u8207\u8A73\u7D30\u6578\u64DA\u3002</p>
    </div>
    <div class="workflow-wf-overall">
      <div class="workflow-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${fe}</span>
      </div>
      <div class="workflow-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,Number.isFinite(Q)?Q:0)).toFixed(1)}%"></span>
      </div>
    </div>
    ${Te?`<p class="processing-workflow-scope-note">${m("info",12)}<span>${r(Te)}</span></p>`:""}
  </section>`}function Dn(e){let t=String(e||"");return t.length===6?`${t.slice(0,4)}-${t.slice(4)}`:t||"\u2014"}function Wl(e){return e?.scan_order==="issue_month"?"\u7D22\u5F15\u6383\u63CF\u9806\u5E8F\u4F9D\u6708\u4EFD\u7531\u820A\u5230\u65B0\uFF1B\u540C\u6708\u4EFD\u518D\u4F9D\u532F\u5165 ID\u3002":"\u6B64 run \u662F\u820A\u7248\u6383\u63CF\u9806\u5E8F\uFF08\u4F9D\u532F\u5165 ID\uFF0C\u975E\u6708\u4EFD\u9806\u5E8F\uFF09\uFF1B\u65B0 run \u624D\u6703\u7531\u6700\u820A\u6708\u4EFD\u958B\u59CB\u3002"}function gm(e,t=!1){let s=Number(e?.reused),a=Number(e?.embedded);if(!Number.isFinite(s)||!Number.isFinite(a)||s<=0&&a<=0)return"";let n=[];if(s>0&&n.push(`<span class="index-current-phase is-reuse"
      title="R \xB7 \u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF0C\u672C\u6279 ${c(s)} \u7B46">
      <strong>R</strong><span>\u6CBF\u7528 ${c(s)} \u7B46</span>
    </span>`),a>0){let i=e.phase==="embedding"&&t?"\u8A08\u7B97\u4E2D":"\u65B0 embedding";n.push(`<span class="index-current-phase is-embed"
      title="E \xB7 \u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding\uFF0C\u672C\u6279 ${c(a)} \u7B46">
      <strong>E</strong><span>${i} ${c(a)} \u7B46</span>
    </span>`)}return`<span class="index-current-phases" aria-label="\u672C\u6279\u6B21 R\uFF0FE \u52D5\u4F5C">
    <span class="index-current-phase-label">\u672C\u6279</span>
    ${n.join("")}
  </span>`}function fm(e){let t=Array.isArray(e.months)?e.months:[],s=new Map;for(let n of t){let i=String(n.month||"");if(!/^\d{6}$/.test(i))continue;let o=s.get(i);o||(o={total:0,processed:0},s.set(i,o)),o.total+=Number(n.total)||0,o.processed+=Number(n.processed)||0}let a=0;for(let n of s.values())n.total>0&&n.processed>=n.total&&(a+=1);return{completed:a,total:s.size}}function Rl(e){let t=String(e||"").match(/(\d{8})Update/i);return t?Number(t[1]):0}function ss(e){let t=Number(e);return Number.isFinite(t)&&t>0?t:0}function Cl(e,t){let s=ss(t),a=ss(e);if(s<=0)return{processed:0,total:0,percent:null,fill:0,complete:!1,empty:!0,stateClass:"is-empty"};let n=Math.min(100,Math.round(a/s*1e3)/10),i=a>=s;return{processed:a,total:s,percent:n,fill:i?100:n,complete:i,empty:!1,stateClass:i?"is-complete":"is-incomplete"}}function Jl(e){let t=Array.isArray(e.months)?e.months:[],s=e.current||{},a=!!s.preparing&&e.scan_order==="issue_month",n=new Map;for(let i of t){let o=String(i.month||"");if(!/^\d{6}$/.test(o))continue;let l=Number(o.slice(4,6));if(l<1||l>12)continue;let d=n.get(o);d||(d={key:o,year:o.slice(0,4),monthNo:l,rows:[],archives:[],current:!1,preparing:!1,currentArchive:"",jid:""},n.set(o,d));let u=String(i.archive||"");d.rows.push({archive:u,total:ss(i.total),processed:ss(i.processed)}),u&&d.archives.push(u),!a&&s.month===o&&(!s.archive||s.archive===u)&&(d.current=!0,d.preparing=!!s.preparing,d.currentArchive=String(s.archive||u||""),d.jid=String(s.jid||""))}return n}function bm(e){let t=Jl(e),s=e.summary||{},a=e.copy||{},n=ss(s.total),i=ss(a.total),o=t.size,l=i>0?Math.min(i,n||i):0,d=i>0?Math.max(0,(n||i)-i):n,u=ss(s.reused),h=ss(s.embedded);return{totalMonths:o,reusePool:l,reused:u,reusePercent:l>0?Math.min(100,100*u/l):null,embedPool:d,embedded:h,embedPercent:d>0?Math.min(100,100*h/d):null}}function hm(e){let t=bm(e);if(!t.totalMonths)return"";let s=[],a=(n,i,o,l,d)=>{let u=l===null?0:Math.max(0,Math.min(100,l));s.push(`<div class="index-wf-are-row ${n}">
      <span class="index-wf-are-label"><i aria-hidden="true"></i>${r(i)}</span>
      <span class="index-wf-are-value">${r(o)}${d?`<small>${r(d)}</small>`:""}</span>
      <span class="index-wf-are-track" aria-hidden="true"><span style="width:${u.toFixed(1)}%"></span></span>
    </div>`)};return(t.reusePool>0||t.reused>0)&&a("is-reuse","R \u672C\u6B21\u6CBF\u7528",`${c(t.reused)} / ${c(t.reusePool)} \u7B46`,t.reusePercent,"04 \u9010\u6708\u6CBF\u7528"),t.embedPool>0?a("is-embed","E \u672C\u6B21\u65B0 embedding",`${c(t.embedded)} / ${c(t.embedPool)} \u7B46`,t.embedPercent,"E backlog"):a("is-embed is-complete","E \u672C\u6B21\u65B0 embedding","\u7121 E backlog",100,"\u4E0D\u9700\u65B0 embedding"),`<div class="index-wf-are-breakdown" aria-label="R\uFF0FE \u5206\u6D41">
    <div class="index-wf-are-head"><strong>R\uFF0FE \u5206\u6D41</strong><span>\u5169\u689D bar \u5404\u81EA\u4EE5\u81EA\u5DF1\u7684 total \u8A08\u7B97\uFF0C\u4E0D\u53EF\u76F8\u52A0\uFF1B\u7686\u70BA\u672C\u6B21 run\u3002</span></div>
    ${s.join("")}
  </div>`}function vm(e){let t=e.current||{},s=!!e.coverage_only,a=e.active_archive_coverage||{},n=Jl(e);if(!n.size)return'<div class="processing-workflow-empty">\u5C1A\u7121\u53EF\u986F\u793A\u7684\u7D22\u5F15\u6708\u4EFD\uFF1B\u958B\u59CB\u7D22\u5F15\u5F8C\u6703\u4F9D\u6642\u9593\u5217\u51FA\u6708\u4EFD\u72C0\u614B\u3002</div>';let i={reuseComplete:0,reuseIncomplete:0,embedComplete:0,embedIncomplete:0};for(let p of n.values()){let b=[...p.rows].sort((H,ie)=>Rl(ie.archive)-Rl(H.archive)),w=b[0],M=b.length>1?b.slice(1):[w],S=(a[p.key]||{})[w.archive],f=ss(S?.total),T=ss(S?.processed),V=f>0&&T>=f,Q=M.reduce((H,ie)=>H+ie.total,0),fe=M.reduce((H,ie)=>H+ie.processed,0),ve=w.total,se=w.processed,L=Cl(fe,Q),q=!s&&V,de=Cl(q?T:se,q?f:ve);p.latest=w,p.baselineRows=M,p.reuseState=L,p.embedState=de,p.reuseComplete=L.complete,p.embedComplete=de.complete,p.embedNoBacklog=q,L.complete?i.reuseComplete+=1:i.reuseIncomplete+=1,de.complete?i.embedComplete+=1:i.embedIncomplete+=1}let l=[...new Set([...n.values()].map(p=>p.year))].sort((p,b)=>b.localeCompare(p)).map(p=>{let b=Array.from({length:12},(w,M)=>{let k=M+1,S=`${p}${String(k).padStart(2,"0")}`,f=n.get(S);if(!f)return`<td class="judgment-month is-empty"><span>${k}</span></td>`;let T=f.current&&e.run_status==="running",V=E=>E.percent===null?"\u2014":`${E.percent}%`,Q=E=>E.empty?"\u7121\u8CC7\u6599":E.complete?"\u5B8C\u6210":"\u672A\u5B8C\u6210",fe=String(t.phase||"")==="embedding"?"E \u65B0 embedding":String(t.phase||"")==="reuse"?"R \u91CD\u7528":"R\uFF0FE",ve=f.latest&&f.latest.total>0?`${(100*f.latest.processed/f.latest.total).toFixed(1)}%`:"\u2014",se=f.current&&f.latest?`\u672C\u6B21 run ${fe} ${c(f.latest.processed)} / ${c(f.latest.total)}\uFF08${ve}\uFF09`:"",L=[`${f.year}-${String(f.monthNo).padStart(2,"0")}`,f.archives.join("\u3001")||"\u2014",`R \u672C\u6B21\u6CBF\u7528 ${c(f.reuseState.processed)} / ${c(f.reuseState.total)}\uFF08${V(f.reuseState)}\uFF09\xB7 ${Q(f.reuseState)}`,f.embedNoBacklog?`E \u7121 E backlog\uFF08latest archive \u5DF2\u7531 active \u7248\u672C\u8986\u84CB ${c(f.embedState.total)} \u7B46\uFF1B\u4E0D\u9700\u65B0 embedding\uFF09`:`E \u65B0 embedding ${c(f.embedState.processed)} / ${c(f.embedState.total)}\uFF08${V(f.embedState)}\uFF09\xB7 ${Q(f.embedState)}`,f.reuseComplete?"":"\u5F85\u5B8C\u6210\uFF1AR \u65E2\u6709\u5411\u91CF\u91CD\u7528",f.embedComplete?"":"\u5F85\u5B8C\u6210\uFF1AE \u65B0 embedding",se,f.current?`${f.preparing?"\u6E96\u5099\u7D22\u5F15":T?"\u76EE\u524D\u7D22\u5F15":"\u6700\u5F8C\u7D22\u5F15"} \xB7 ${fe}${f.jid?` \xB7 ${f.jid}`:""}`:""].filter(Boolean).join(" \xB7 "),q=[["is-reuse",f.reuseState],["is-embed",f.embedState]].map(([E,K])=>`<span class="index-month-block ${E} ${K.stateClass}" style="--fill:${K.fill.toFixed(1)}%"></span>`).join("");return`<td class="judgment-month index-month index-month-are processing-month is-neutral${T?" is-current":""}" title="${r(L)}"${T?' aria-current="true"':""}><span class="index-month-number">${k}</span><span class="index-month-blocks" aria-hidden="true">${q}</span></td>`}).join("");return`<tr><th scope="row">${r(p)}</th>${b}</tr>`}).join(""),d=e.copy||{},u=ss(d.total),h=ss(d.copied),y=d.status==="success"?"\u5B8C\u6210":d.status==="running"?"\u57F7\u884C\u4E2D":d.status==="stale"?"\u4E2D\u6B62":"\u7B49\u5F85";return`<div class="judgment-months index-months">
    ${!s&&u>0?`<div class="index-copy-global-chip" title="03 \u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF\u662F\u5168\u57DF points \u6E96\u5099\u968E\u6BB5\uFF0C\u4E0D\u5217\u5165\u6708\u4EFD R\uFF0FE\uFF1BR \u662F 04 \u9010\u6708\u6383\u63CF\u9032\u5EA6\u3002">
          <span class="badge badge-neutral">03 \u8907\u88FD\uFF08\u5168\u57DF\uFF09</span>
          <span class="mono">${c(h)} / ${c(u)} points</span>
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
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(p,b)=>`<th scope="col">${b+1}</th>`).join("")}</tr></thead>
        <tbody>${l}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA R\uFF08\u672C\u6B21\u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF09\u3001E\uFF08\u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding\uFF09\uFF0C\u5169\u683C\u90FD\u662F\u672C\u6B21 run \u7684\u9032\u5EA6\uFF1B\u5B8C\u6210\u70BA\u5BE6\u5FC3\uFF1B\u672A\u5B8C\u6210\u6642\u5DF2\u5B8C\u6210\u6BD4\u4F8B\u70BA\u5BE6\u8272\u3001\u5269\u9918\u5340\u6BB5\u70BA\u540C\u8272 25% \u6DFA\u8272\uFF0C\u56E0\u6B64 0% \u6642\u6574\u683C\u90FD\u662F\u6DFA\u8272\uFF1B\u7121\u8CC7\u6599\u624D\u662F\u6DE1\u8272\u7A7A\u5FC3\u3002\u6700\u65B0 archive \u5DF2\u88AB active collection \u5B8C\u6574\u8986\u84CB\uFF08\u7121 E backlog\uFF09\u7684\u672A\u8B8A\u66F4\u6708\u4EFD\uFF0CE \u53EF\u4F7F\u7528 active \u8986\u84CB\u986F\u793A\u5B8C\u6210\uFF1BR \u4E00\u5F8B\u4F7F\u7528\u672C\u6B21 run \u7684 processed\uFF0Ftotal\uFF0C\u5C1A\u672A\u6383\u5230\u7684\u5F8C\u7E8C\u6708\u4EFD\u7DAD\u6301 25% \u6DFA\u8272\u3002\u4ECD\u6709 E backlog \u7684\u6708\u4EFD\uFF0CR\uFF0FE \u90FD\u4F7F\u7528\u672C\u6B21 run \u7684 processed\uFF0Ftotal\u3002E \u7121 backlog \u6642\u82E5\u986F\u793A\u5BE6\u5FC3\uFF0Ctooltip \u6703\u6A19\u793A\u4E0D\u9700\u65B0 embedding\u300203 \u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF\u662F\u5168\u57DF points \u6E96\u5099\u968E\u6BB5\uFF0C\u4E0D\u6703\u91CD\u8907\u756B\u6210\u6708\u4EFD\u5206\u683C\uFF1BR \u662F 04 \u9010\u6708\u6383\u63CF\u9032\u5EA6\u3002summary \u8207\u65B9\u584A\u4F7F\u7528\u540C\u4E00\u4EFD\u72C0\u614B\uFF0Csidebar \u66F4\u65B0 badge \u53E6\u4EE5 E backlog \u6708\u4EFD\u8A08\u3002\u540C\u4E00\u6708\u4EFD\u53EF\u80FD\u6709\u591A\u500B archive\uFF0CR \u4F7F\u7528\u8F03\u820A\u7684\u57FA\u7DDA archive\uFF0CE \u4F7F\u7528\u540D\u7A31\u4E2D\u66F4\u65B0\u65E5\u671F\u6700\u65B0\u7684 archive\uFF1B\u65B0\u820A archive \u4E0D\u6703\u76F8\u52A0\u3002E \u5B8C\u6210\uFF0F\u672A\u5B8C\u6210\u4EE5\u6708\u4EFD\u8A08\uFF0C\u4E0D\u662F RAR \u6A94\u6578\u3002${Wl(e)}\u7DA0\u6846\u53EA\u6A19\u793A\u76EE\u524D\u6279\u6B21\u6240\u5728\u6708\u4EFD\u3002\u76EE\u524D\u7D22\u5F15\u6708\u4EFD\u4EE5\u5BE6\u7DDA\u5916\u6846\u6A19\u793A\uFF0Cpadding \u4E0D\u4F7F\u7528\u72C0\u614B\u5E95\u8272\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B R\uFF0FE \u9032\u5EA6\u8207\u76EE\u524D\u6848\u865F\u3002</p>
  </div>`}function $m(e){let t=e.import_timeline||{},s=Array.isArray(t.months)?t.months:[];if(!s.length)return`<section class="report-card processing-card import-files-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u672A\u53D6\u5F97\u5224\u6C7A\u4E0B\u8F09 manifest \u6216\u672C\u6A5F\u58D3\u7E2E\u6A94\uFF1B\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u5F8C\u6703\u986F\u793A\u6708\u4EFD\u72C0\u614B\u3002</div>
    </section>`;let a=new Map(s.map(v=>[String(v.month),v])),n=[...new Set(s.map(v=>v.year))].sort((v,p)=>p-v),i=["extract","raw_parquet","filter","postgres"],o=t.stage_labels||{},l=n.map(v=>{let p=Array.from({length:12},(b,w)=>{let M=w+1,k=`${v}${String(M).padStart(2,"0")}`,S=a.get(k);return fi({month:S,year:v,monthNo:M,stageOrder:i,stageLabels:o,stageStatuses:S?.import_stages||{},stageProgress:S?.import_stage_progress||{},overall:S?.import_overall||"empty",active:!!S?.active,processing:String(S?.month||"")===String(t.processing_month||""),workflowForStage:()=>"judgment_import",variant:"import"})}).join("");return`<tr><th scope="row">${r(v)}</th>${p}</tr>`}).join(""),d=t.summary||{},u=t.stage_summary||{},h=s.find(v=>v.active),y=h?`<div class="index-current-row">${Bl({activeMonth:t.active_month||String(h.month||""),activeArchive:t.active_archive||h.active_archive||"",activePhase:t.active_phase||"",processingMonth:t.processing_month||"",processingArchive:t.processing_archive||"",stageLabels:o})}</div>`:"";return`<section class="report-card processing-card import-files-card" data-import-timeline="judgment">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
      ${Op(t,s,u,d)}
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(v,p)=>`<th scope="col">${p+1}</th>`).join("")}</tr></thead>
          <tbody>${l}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\uFF1ARAR \u6AA2\u67E5\uFF0F\u89E3\u58D3\u7E2E\u3001\u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD\u3001\u91D1\u878D\u6CD5\u898F\u7BE9\u9078\u3001PostgreSQL metadata\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF1B\u6709\u5F85\u66F4\u65B0\u6A94\u6848\u6642\uFF0C\u5C1A\u672A\u91CD\u505A\u7684\u56DB\u500B\u968E\u6BB5\u65B9\u683C\u4EE5\u6DFA\u6A58\uFF0F\u6DFA\u7D05\uFF0F\u6DFA\u7D2B\uFF0F\u6DFA\u85CD\u8868\u793A\uFF0C\u5B8C\u6210\u5F8C\u8F49\u70BA\u5BE6\u5FC3\u6DF1\u8272\uFF1B\u5C1A\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF1B\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u5B8C\u6210\u8272\u5782\u76F4\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u672A\u5B8C\u6210\u5340\u6BB5\u7DAD\u6301 25% \u6DFA\u8272\uFF1B\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u539F\u59CB\u8CC7\u6599\u968E\u6BB5\u6703\u5148\u6AA2\u67E5\u65E2\u6709 Parquet\uFF0C\u53EF\u6CBF\u7528\u6642\u4E0D\u91CD\u65B0\u5099\u4EFD\uFF1B\u7F3A\u5C11\u6642\u6703\u986F\u793A\u300C\u5EFA\u7ACB YYYY-MM \u5099\u4EFD\u300D\uFF0C\u5B8C\u6210\u5F8C\u986F\u793A\u300C\u5DF2\u5EFA\u7ACB\u5099\u4EFD\u300D\u3002\u7BE9\u9078\u8207 PostgreSQL \u968E\u6BB5\u6703\u986F\u793A\u76EE\u524D\u8655\u7406\u7684\u6708\u4EFD\u8207 archive\u3002\u5BE6\u7DDA\u6846\u6A19\u793A\u76EE\u524D\u532F\u5165\u6708\u4EFD\uFF1B\u82E5\u5BE6\u969B\u8655\u7406\u7684\u662F\u8F03\u820A\u6708\u4EFD\uFF0C\u8A72\u6708\u53E6\u4EE5\u865B\u7DDA\u6846\u6A19\u793A\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u56DB\u500B\u968E\u6BB5\u7684\u72C0\u614B\u3001\u672C\u6A5F\u58D3\u7E2E\u6A94\u8207\u5DF2\u532F\u5165\u6A94\u540D\u3002</p>
    </div>
  </section>`}function Vl(e,t,s){let n=[t.run_id||e.active_run?.id||e.last_run?.id||"",t.version_id??"",t.collection||"",t.started_at||""].join("|"),i=Date.now(),o=Al.get(n);if(!o){let v=Date.parse(t.started_at||""),p=Date.parse(t.finished_at||""),b=Date.parse(t.updated_at||"");t.run_status!=="running"&&Number.isFinite(v)&&(Number.isFinite(p)||Number.isFinite(b))?o={at:v,indexed:0}:o={at:i,indexed:Math.max(0,s)},Al.set(n,o)}let l=Date.parse(t.finished_at||""),d=Date.parse(t.updated_at||""),u=t.run_status==="running"?i:Number.isFinite(l)?l:Number.isFinite(d)?d:i,h=Math.max(0,(u-Number(o.at||0))/1e3),y=Math.max(0,Number(s)-Number(o.indexed||0));return h<=0||y<=0?0:y/h}function Hs(e){let t=Number(e);return!Number.isFinite(t)||t<0?"\u2014":t>=36e5?Kl(t):ge(t)}function Kl(e){if(!Number.isFinite(e)||e<0)return"\u2014";let t=Math.max(0,Math.round(e/1e3)),s=Math.floor(t/3600),a=Math.floor(t%3600/60),n=t%60,i=String(n).padStart(2,"0");return s>0?`${s}h ${String(a).padStart(2,"0")}m ${i}s`:a>0?`${a}m ${i}s`:`${n}s`}function Yl(e,t,s,a){let n=Date.parse(e.started_at||"");if(!Number.isFinite(n))return{elapsedMs:null,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let i=e.run_status==="running",o=Date.parse(e.finished_at||""),l=Date.parse(e.updated_at||""),d=i?Date.now():Number.isFinite(o)?o:Number.isFinite(l)?l:Date.now(),u=Math.max(0,d-n),h=Number(s),y=Number(t);if(!Number.isFinite(h)||h<=0)return{elapsedMs:u,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let v=Math.max(0,h-Math.max(0,Number.isFinite(y)?y:0));if(v<=0)return{elapsedMs:u,estimatedTotalMs:u,remainingMs:0,remainingCount:0};if(!i||a<=0)return{elapsedMs:u,estimatedTotalMs:null,remainingMs:null,remainingCount:v};let p=v/a*1e3;return{elapsedMs:u,estimatedTotalMs:u+p,remainingMs:p,remainingCount:v}}function ym(e){let t=e.index_runtime||{};if(!t.available)return"";let s=!!t.coverage_only,a=Wl(t),n=t.current||{},i=t.summary||{},o=Number(i.indexed??n.indexed??0),l=s?0:Vl(e,t,o),d=fm(t),u=s?null:Yl(t,o,i.total,l),h=u?.remainingCount>0?`\u8207\u5269\u9918 ${c(u.remainingCount)} \u7B46`:"",y=l>0?`\u4F9D\u672C\u6B21\u5E73\u5747 ${l.toFixed(1)} \u7B46/\u79D2${h}\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002\u5BE6\u969B\u901F\u5EA6\u6703\u96A8 embedding \u8207\u6279\u6B21\u5927\u5C0F\u8B8A\u52D5\u3002`:"\u5C1A\u7121\u8DB3\u5920\u7684\u672C\u9801\u89C0\u5BDF\u8CC7\u6599\u53EF\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002",v=f=>r(Kl(u?u[f]:null)),p=`<div class="index-runtime-metrics">
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
    <span class="index-runtime-metric" title="\u81EA\u672C\u6B21\u7D22\u5F15 run \u958B\u59CB\u6642\u9593 ${r(Se(t.started_at))} \u8D77\u7B97\uFF1B\u4E2D\u9014\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002">
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
  </div>`,b=t.run_status==="running"?n.preparing?"\u6E96\u5099\u4E2D":"\u76EE\u524D\u8655\u7406":"\u6700\u5F8C\u8655\u7406",w=!!n.preparing&&t.scan_order==="issue_month",M=t.copy||{},k=Number(M.total)>0?`\u8907\u88FD ${c(M.copied)} / ${c(M.total)} points`:"\u5EFA\u7ACB\u65B0\u7248\u672C collection",S=w?`<div class="index-current-row">
        <span class="badge badge-info" title="${r(a)}">${m("activity",11)}\u6E96\u5099\u4E2D</span>
        <span class="index-current-copy">${r(k)}\uFF1B\u7248\u672C\u6E96\u5099\u5B8C\u6210\u5F8C\u6703\u5F9E\u6700\u820A\u6708\u4EFD\u958B\u59CB\u7D22\u5F15\uFF0C\u7B2C\u4E00\u6279\u958B\u59CB\u524D\u4E0D\u6A19\u793A\u76EE\u524D\u6708\u4EFD\u3002</span>
      </div>`:n.jid?`<div class="index-current-row">
        <span class="badge badge-info" title="${r(a)}">${m("activity",11)}${b}</span>
        <strong class="mono">${r(Dn(n.month))}</strong>
        <span class="mono">${r(n.archive||"\u2014")}</span>
        ${n.preparing?"":gm(n,t.run_status==="running")}
        <span class="mono">${r(n.jid||"\u2014")}</span>
        <span class="index-current-copy">${r([n.court,n.title].filter(Boolean).join(" \xB7 ")||"\u2014")}</span>
        <span class="faint">${n.preparing?"\u6E96\u5099\u4E2D":`\u6279\u6B21 ${c(n.batch_size)} \u7B46`}</span>
      </div>`:"";return`<section class="report-card processing-card index-files-card">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m("table",14)}04 \u91D1\u878D\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6708\u4EFD R\uFF0FE</span>
      ${p}
    </div>
    ${t.error?`<div class="processing-update-notice index-runtime-error">${m("alert",13)}<span>${r(t.error)}</span></div>`:""}
    <div class="index-runtime-summary">
      <span>\u7248\u672C <strong class="mono">v${r(t.version_id??"\u2014")}</strong></span>
      <span>Collection <code>${r(t.collection||"\u2014")}</code></span>
      <span>\u6A21\u5F0F <strong>${r(t.build_mode||"\u2014")}</strong></span>
      <span>\u6383\u63CF\u9806\u5E8F <strong>${r(t.scan_order==="issue_month"?"\u6708\u4EFD\uFF08\u820A\u2192\u65B0\uFF09":"ID\uFF08\u820A run\uFF09")}</strong></span>
      ${s?"":`<span>\u91CD\u7528 <strong class="mono">${c(i.reused)}</strong></span>
            <span>\u65B0 embedding <strong class="mono">${c(i.embedded)}</strong></span>`}
    </div>
    ${S}
    ${vm(t)}
    ${s?'<p class="judgment-months-hint index-coverage-note">\u76EE\u524D\u6C92\u6709\u672C\u6B21\u7D22\u5F15 run\uFF1BR\uFF0FE \u6642\u9593\u8868\u6703\u5728\u7248\u672C\u5EFA\u7F6E\u958B\u59CB\u5F8C\u986F\u793A\u672C\u6B21\u9032\u5EA6\u3002</p>':""}
  </section>`}function wm(e={}){let{storage:t,loading:s,error:a}=e;if(a)return`<section class="report-card processing-card index-storage-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
        <button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-index-storage">${m("refresh",12)}<span>\u91CD\u65B0\u6574\u7406</span></button>
      </div>
      <div class="processing-workflow-empty">${r(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card index-storage-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
        <span class="badge badge-neutral">${s?"\u8B80\u53D6\u4E2D":"\u5C1A\u7121"}</span>
      </div>
      <div class="processing-workflow-empty">${s?"\u6B63\u5728\u53D6\u5F97 Docker \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u2026":"\u5207\u63DB\u5230\u6B64\u6D41\u7A0B\u5F8C\u6703\u8B80\u53D6 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002"}</div>
    </section>`;let n=t.qdrant_storage||{},o=(Array.isArray(t.databases)?t.databases:[]).find(h=>h.id==="qdrant")||{},l=n.volume_bytes??o.volume_bytes??null,d=n.points_count??o.points_count,u=n.segments_count??o.segments_count;return`<section class="report-card processing-card index-storage-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
      <button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-index-storage">${m("refresh",12)}<span>\u91CD\u65B0\u6574\u7406</span></button>
    </div>
    <div class="index-storage-grid">
      <span>Docker \u4E3B\u6A5F</span><strong>${r(n.host||"\u2014")} <span class="faint">(${r(n.docker_context||"default")})</span></strong>
      <span>Container</span><strong class="mono">${r(n.container||"judgment-qdrant")} \xB7 ${r(n.container_state||"unknown")}</strong>
      <span>Image</span><strong class="mono">${r(n.image||"\u2014")}</strong>
      <span>\u5BB9\u5668\u5167\u8DEF\u5F91</span><strong class="mono">${r(n.container_path||"\u2014")}</strong>
      <span>Docker volume</span><strong class="mono">${r(n.volume_name||"\u2014")}</strong>
      <span>Volume \u5BB9\u91CF</span><strong class="mono">${Pe(l)}${n.volume_size?` \xB7 ${r(n.volume_size)}`:""}</strong>
      <span>Volume \u4F86\u6E90\u8DEF\u5F91</span><strong class="mono index-storage-path">${r(n.host_path||"\u2014")}</strong>
      <span>Collection</span><strong class="mono">${r(n.collection||o.collection||"\u2014")}</strong>
      <span>Alias</span><strong class="mono">${r(n.alias||"\u2014")}</strong>
      <span>Points\uFF0FSegments</span><strong class="mono">${c(d)} / ${c(u)}</strong>
    </div>
    <div class="index-runtime-foot">\u8CC7\u6599\u6642\u9593 ${r(Se(t.checked_at))}</div>
  </section>`}function vi({badge:e="",lead:t="",rows:s=[],note:a=""}){return`<section class="report-card processing-card parquet-help-card workflow-help-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("info",14)}\u529F\u80FD\u8AAA\u660E</span>
      ${e?`<span class="badge badge-neutral">${r(e)}</span>`:""}
    </div>
    <div class="parquet-help-body">
      <p class="parquet-help-lead">${t}</p>
      <div class="parquet-help-grid">${s.map(([n,i])=>`<span>${r(n)}</span><strong>${i}</strong>`).join("")}</div>
      ${a?`<p class="parquet-help-note">${a}</p>`:""}
    </div>
  </section>`}function _m(){return vi({badge:"\u552F\u8B80\u532F\u51FA",lead:"\u5C07 PostgreSQL \u76EE\u524D\u6709\u6548\u7684\u5224\u6C7A\uFF08<code>judgment_documents.is_current = true</code>\uFF09\u532F\u51FA\u6210\u7368\u7ACB\u7684 Parquet \u5FEB\u7167\uFF0C\u4F9B\u96E2\u7DDA\u5206\u6790\u3001\u8CC7\u6599\u4EA4\u63DB\u6216\u4FDD\u5B58\u3002",rows:[["\u4F86\u6E90","PostgreSQL <code>judgment_documents</code>\uFF0C\u53EA\u542B\u76EE\u524D\u6709\u6548\u4E14\u5DF2\u547D\u4E2D\u91D1\u878D\u6CD5\u898F\u6E05\u55AE\u7684\u5224\u6C7A\u3002"],["\u8F38\u51FA",'<span class="mono">JUDGMENT_DATA_DIR/parquet/judgments/YYYYMMDD/HHMMSS-xxxxxxxx/judgments.parquet</span>'],["\u9644\u5E36\u6A94",'<span class="mono">\u540C\u76EE\u9304 manifest.json\uFF08\u7B46\u6578\u3001\u6A94\u6848\u5927\u5C0F\u3001\u6B04\u4F4D\u3001\u7522\u751F\u6642\u9593\uFF09</span>'],["\u5167\u5BB9","\u6848\u865F\u3001\u6CD5\u9662\u3001\u6848\u7531\u3001\u5168\u6587\u3001\u547D\u4E2D\u6CD5\u898F\u3001\u5F15\u7528\u3001\u4F86\u6E90\u58D3\u7E2E\u6A94\u8207\u6642\u9593\u6B04\u4F4D\uFF1B<code>citations</code> \u4EE5 JSON \u5B57\u4E32\u4FDD\u5B58\u3002"],["\u8207\u539F\u59CB Parquet","\u8CC7\u6599\u9801\u8207 <code>source=parquet</code> \u4F7F\u7528 <code>parquet/raw_judgments/.../raw.parquet</code>\uFF1B\u672C\u6D41\u7A0B\u7684 <code>parquet/judgments/...</code> \u662F\u53E6\u4E00\u500B\u6B63\u898F\u5316\u5FEB\u7167\u3002"],["\u4E0D\u6703","\u4E0D\u5BEB\u56DE PostgreSQL\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u820A\u5FEB\u7167\uFF1B\u53EA\u532F\u51FA current \u8CC7\u6599\uFF0C\u4E0D\u542B\u6B77\u53F2\u7248\u672C\u3002"],["\u4E2D\u65B7","\u6BCF\u6B21\u57F7\u884C\u5EFA\u7ACB\u65B0\u7684\u5B8C\u6574\u5FEB\u7167\uFF1B\u4E2D\u65B7\u5F8C\u91CD\u65B0\u57F7\u884C\u4E0D\u6703\u7E8C\u5BEB\u540C\u4E00\u500B Parquet \u6A94\u3002"]],note:"\u9069\u5408 DuckDB\u3001pandas\u3001Spark \u7B49\u96E2\u7DDA\u5206\u6790\uFF0C\u6216\u9700\u8981\u56FA\u5B9A\u6642\u9593\u9EDE\u7684\u53EF\u91CD\u73FE\u8CC7\u6599\u5FEB\u7167\u3002\u65E5\u5E38 RAG \u67E5\u8A62\u8207\u8CC7\u6599\u9801\u700F\u89BD\u4E0D\u9700\u8981\u57F7\u884C\u6B64\u6D41\u7A0B\u3002"})}function km(){return vi({badge:"PostgreSQL \u56DE\u586B",lead:"\u5C07\u5224\u6C7A\u7684 <code>court</code> \u8F49\u6210\u6A19\u6E96\u6CD5\u9662\u540D\u7A31\u4E26\u5BEB\u5165 <code>court_normalized</code>\uFF1B\u539F\u59CB <code>court</code> \u6703\u4FDD\u7559\u4F9B\u8FFD\u6EAF\u3002",rows:[["\u8655\u7406\u7BC4\u570D","\u9810\u8A2D\u53EA\u8655\u7406 <code>court_normalized</code> \u70BA\u7A7A\u7684\u8CC7\u6599\uFF1B\u5DF2\u6B63\u898F\u5316\u8CC7\u6599\u6703\u8DF3\u904E\uFF0C\u53EF\u7528 <code>--all</code> \u91CD\u65B0\u8A08\u7B97\u5168\u90E8\u3002"],["\u89E3\u6790\u9806\u5E8F","\u539F\u59CB\u6CD5\u9662\u503C\u958B\u982D\u7B26\u5408\u6A19\u6E96\u540D\u7A31 \u2192 \u5224\u6C7A\u5168\u6587\u524D 8,000 \u5B57\u6700\u65E9\u51FA\u73FE\u7684\u6CD5\u9662 \u2192 \u539F\u59CB\u6CD5\u9662\u503C\u4EFB\u610F\u4F4D\u7F6E\u7684\u6A19\u6E96\u540D\u7A31 \u2192 JID \u5B98\u65B9\u6CD5\u9662\u4EE3\u78BC\u3002"],["\u8F38\u51FA","\u5BEB\u5165 <code>judgment_documents.court_normalized</code>\uFF1B\u4E0D\u4FEE\u6539\u539F\u59CB <code>court</code>\u3001\u5168\u6587\u6216\u5176\u4ED6\u5224\u6C7A\u6B04\u4F4D\u3002"],["\u672A\u89E3\u6790","\u7121\u6CD5\u5224\u65B7\u6642\u4FDD\u7559\u7A7A\u503C\uFF0C\u4E0D\u731C\u6E2C\uFF1B\u6458\u8981\u6703\u5217\u51FA\u672A\u89E3\u6790\u7B46\u6578\u8207\u5E38\u898B\u6A23\u672C\u3002"],["\u5F71\u97FF","\u8CC7\u6599\u9801\u7684\u6CD5\u9662\u4E0B\u62C9\u3001\u7CBE\u78BA\u7BE9\u9078\u3001\u6392\u5E8F\u3001\u7D50\u679C\u6B04\u4F4D\u8207\u5224\u6C7A\u539F\u6587\u4F7F\u7528\u6B63\u898F\u5316\u540D\u7A31\uFF1BAPI \u4ECD\u56DE\u50B3 <code>court_raw</code>\u3002"],["\u4E0D\u6703","\u4E0D\u91CD\u65B0\u532F\u5165\u5224\u6C7A\u3001\u4E0D\u6539\u5168\u6587\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u8CC7\u6599\u3002"],["\u91CD\u8DD1","\u9810\u8A2D\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u898F\u5247\u66F4\u65B0\u5F8C\u53EF\u7528 <code>--all</code> \u91CD\u7B97\uFF0C\u6216\u5148\u7528 <code>--dry-run</code> \u7D71\u8A08\u3002"]],note:"\u9069\u5408\u5728\u5224\u6C7A\u532F\u5165\u5F8C\u3001\u6CD5\u9662\u540D\u7A31\u898F\u5247\u66F4\u65B0\u5F8C\uFF0C\u6216\u8CC7\u6599\u9801\u6CD5\u9662\u9078\u9805\u51FA\u73FE\u7F3A\u6F0F\u6642\u57F7\u884C\u3002\u7D50\u679C\u4E5F\u6703\u5BEB\u5165\u6548\u80FD\u7D00\u9304\u3002"})}function Sm(){return vi({badge:"\u689D\u6587\u6B77\u53F2\u5EFA\u6A94",lead:"\u70BA\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u5EFA\u7ACB <code>law_article_versions</code> \u6B77\u53F2\u689D\u6587\u5FEB\u7167\u8207 <code>law_article_change_events</code> \u8B8A\u66F4\u7D00\u9304\uFF0C\u8B93\u8CC7\u6599\u9801\u80FD\u5207\u63DB\u6B77\u53F2\u7248\u672C\u4E26\u67E5\u770B\u689D\u6587\u5DEE\u7570\u3002",rows:[["\u4F86\u6E90","PostgreSQL \u6CD5\u898F\u7248\u672C\uFF0C\u4EE5\u53CA <code>LAW_DATA_DIR/raw_parquet</code> \u5167\u5C0D\u61C9\u7684\u539F\u59CB\u6CD5\u898F Parquet \u5FEB\u7167\u3002"],["\u5339\u914D\u65B9\u5F0F","\u4EE5 raw Parquet manifest \u7684 <code>zip_sha256</code>\uFF0F<code>raw_json_sha256</code> \u5C0D\u61C9\u6CD5\u898F\u7248\u672C\uFF0C\u4E0D\u731C\u6E2C\u5167\u5BB9\u3002"],["\u7522\u751F\u5167\u5BB9","<code>article_key</code>\uFF08\u689D\u6587\u985E\u578B\uFF0B\u689D\u865F\uFF09\u3001<code>content_hash</code>\u3001\u689D\u6587\u5168\u6587\u8207\u751F\u6548\u65E5\uFF1B\u8207\u524D\u4E00\u7248\u672C\u6BD4\u8F03\u5F8C\u8A18\u9304 <code>added</code>\uFF0F<code>modified</code>\uFF0F<code>removed</code>\u3002"],["\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB","\u5206\u9801\u4E0A\u65B9\u7684\u552F\u8B80\u6AA2\u67E5\u6703\u8B80\u53D6 <code>law_article_versions</code> \u8207\u539F\u59CB Parquet\uFF0C\u5224\u65B7\u7248\u672C\u662F\u5426\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\uFF1B\u6AA2\u67E5\u672C\u8EAB\u4E0D\u6703\u4FEE\u6539\u8CC7\u6599\u5EAB\u3002"],["\u53EF\u5EFA\u7ACB","\u627E\u5230\u5C0D\u61C9\u539F\u59CB Parquet \u7684\u7248\u672C\uFF0C\u53EF\u76F4\u63A5\u57F7\u884C\u6B64\u6D41\u7A0B\u5EFA\u7ACB\u689D\u6587\u6B77\u53F2\u3002"],["\u7F3A\u539F\u59CB\u6A94","\u627E\u4E0D\u5230\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u6A19\u793A\u7121\u6CD5\u5EFA\u7ACB\uFF0C\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD\uFF1B\u6B64\u6D41\u7A0B\u6703\u8DF3\u904E\u4E26\u5217\u5728 <code>missing_versions</code>\u3002"],["\u6AA2\u67E5\u7D50\u679C","\u5E74\u4EFD\xD7\u6708\u4EFD\u8868\u986F\u793A\u5DF2\u5EFA\u7ACB\uFF0F\u672A\u5EFA\u7ACB\uFF0F\u90E8\u5206\u5EFA\u7ACB\uFF1B\u4E0B\u65B9\u5217\u51FA\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u7248\u672C\u65E5\u671F\u8207\u53EF\u5EFA\u7ACB\u72C0\u614B\u3002\u76EE\u524D\u72C0\u614B\u4EE5\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u5361\u7247\u5373\u6642\u986F\u793A\u3002"],["\u8DF3\u904E\u689D\u4EF6","\u5DF2\u6709\u689D\u6587\u5FEB\u7167\u7684\u7248\u672C\u6703\u8DF3\u904E\uFF1B\u627E\u4E0D\u5230\u53EF\u8B80\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u5217\u5165 <code>missing_versions</code>\uFF0C\u4E0D\u5EFA\u7ACB\u865B\u69CB\u689D\u6587\u3002"],["\u4E0D\u6703","\u4E0D\u4E0B\u8F09\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u4E0D\u89E3\u6790\u65B0 ZIP\u3001\u4E0D\u4FEE\u6539 <code>law_documents</code> \u6216\u76EE\u524D\u7248\u672C\u3001\u4E0D\u66F4\u65B0 Qdrant\uFF0FIndexedDB\u3002"],["\u8F38\u51FA\u6458\u8981","\u7248\u672C\u6578\u3001\u8DF3\u904E\u7248\u672C\u6578\u3001\u7F3A\u5C11\u5FEB\u7167\u7248\u672C\u3001\u5BEB\u5165\u689D\u6587\u6578\u8207\u689D\u6587\u8B8A\u66F4\u4E8B\u4EF6\u6578\u3002"],["\u91CD\u8DD1","\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u5DF2\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u4E0D\u6703\u91CD\u8907\u63D2\u5165\u3002"]],note:"\u9069\u5408\u5F9E\u820A\u7248 schema \u5347\u7D1A\u3001\u65E2\u6709\u6CD5\u898F\u7248\u672C\u7F3A\u5C11\u6B77\u53F2\u689D\u6587\uFF0C\u6216\u8CC7\u6599\u9801\u6B77\u53F2\u689D\u6587\u7248\u672C\u8207\u8B8A\u66F4\u7D00\u9304\u4E0D\u5B8C\u6574\u6642\u57F7\u884C\u3002\u57F7\u884C\u524D\u53EF\u5148\u7528\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u78BA\u8A8D\u54EA\u4E9B\u7248\u672C\u53EF\u5EFA\u7ACB\u3001\u54EA\u4E9B\u7F3A\u539F\u59CB\u6A94\u3002"})}function xm(e={}){let t=e.courtCheck,s=!!e.courtCheckLoading,a=e.courtCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-court-check"${s?" disabled":""}>${m("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31"}</span></button>`;if(a)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">${r(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">${s?'<span class="spinner" aria-hidden="true"></span> \u6B63\u5728\u6AA2\u67E5\u5404\u6708\u4EFD\u6CD5\u9662\u540D\u7A31\u2026':"\u9032\u5165\u6B64\u5206\u9801\u5F8C\u6703\u81EA\u52D5\u6AA2\u67E5\uFF1B\u4E5F\u53EF\u6309\u300C\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u300D\u91CD\u65B0\u8B80\u53D6\u3002"}</div>
    </section>`;let i=Array.isArray(t.months)?t.months:[],o=t.summary||{},l=t.totals||{};if(!i.length)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u6AA2\u67E5\u7684\u5224\u6C7A\u8CC7\u6599\u3002</div>
    </section>`;let d={green:"\u5DF2\u6AA2\u67E5",red:"\u9700\u6B63\u898F\u5316\uFF08\u5B8C\u5168\u672A\u6AA2\u67E5\uFF09",gray:"\u9700\u6B63\u898F\u5316"},u=new Map(i.map(v=>[String(v.month),v])),y=[...new Set(i.map(v=>v.year))].sort((v,p)=>p-v).map(v=>{let p=Array.from({length:12},(b,w)=>{let M=w+1,k=`${v}${String(M).padStart(2,"0")}`,S=u.get(k);if(!S)return`<td class="judgment-month is-empty"><span>${M}</span></td>`;let f=d[S.status]?S.status:"red",T=[`${v}-${String(M).padStart(2,"0")}`,d[f],`\u7E3D ${c(S.total)} \u7B46`,`\u5DF2\u6AA2\u67E5 ${c(S.checked)} \u7B46`,`\u672A\u6AA2\u67E5 ${c(S.unchecked)} \u7B46`,S.invalid?`\u7121\u6548\u503C ${c(S.invalid)} \u7B46`:"",`\u6709\u6548 ${Mt(S.percent)}`].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month court-check-month is-${f==="gray"?"red":f}" title="${r(T)}"><span>${M}</span></td>`}).join("");return`<tr><th scope="row">${r(v)}</th>${p}</tr>`}).join("");return`<section class="report-card processing-card court-check-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(v,p)=>`<th scope="col">${p+1}</th>`).join("")}</tr></thead>
          <tbody>${y}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u5168\u90E8\u5DF2\u6B63\u898F\u5316\uFF1B\u7D05\u8272\uFF1A\u9700\u6B63\u898F\u5316\uFF08\u542B\u5B8C\u5168\u672A\u6AA2\u67E5\u3001\u90E8\u5206\u672A\u6B63\u898F\u5316\u6216\u7121\u6548\u503C\uFF09\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002summary \u7684\u7D05\u8272\u6578\u5B57\u70BA\u9700\u6B63\u898F\u5316\u6708\u4EFD\u6578\uFF1B\u4E0B\u65B9\u660E\u7D30\u4ECD\u4FDD\u7559\u672A\u6AA2\u67E5\u8207\u7121\u6548\u503C\u7B46\u6578\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u8A73\u7D30\u7B46\u6578\u8207\u6709\u6548\u6BD4\u4F8B\u3002</p>
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(Se(t.checked_at))} \xB7 \u6A19\u6E96\u6CD5\u9662\u540D\u7A31 ${c(t.canonical_count)} \u500B</div>
    </div>
  </section>`}function Am(e={}){let t=e.lawVersionCheck,s=!!e.lawVersionCheckLoading,a=e.lawVersionCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-law-version-check"${s?" disabled":""}>${m("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB"}</span></button>`;if(a)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">${r(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">${s?'<span class="spinner" aria-hidden="true"></span> \u6B63\u5728\u6AA2\u67E5\u7248\u672C\u8207\u6B77\u53F2\u689D\u6587\u2026':"\u9032\u5165\u6B64\u5206\u9801\u5F8C\u6703\u81EA\u52D5\u6AA2\u67E5\uFF1B\u4E5F\u53EF\u6309\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u91CD\u65B0\u8B80\u53D6\u3002"}</div>
    </section>`;let i=Array.isArray(t.months)?t.months:[],o=t.summary||{},l=t.totals||{};if(!i.length)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">\u8CC7\u6599\u5EAB\u76EE\u524D\u6C92\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u8CC7\u6599\u3002</div>
    </section>`;let d={green:"\u5DF2\u5EFA\u7ACB",red:"\u672A\u5EFA\u7ACB",gray:"\u90E8\u5206\u5EFA\u7ACB"},u=new Map(i.map(se=>[String(se.month),se])),y=[...new Set(i.map(se=>se.year))].sort((se,L)=>L-se).map(se=>{let L=Array.from({length:12},(q,E)=>{let K=E+1,de=`${se}${String(K).padStart(2,"0")}`,H=u.get(de);if(!H)return`<td class="judgment-month is-empty"><span>${K}</span></td>`;let ie=d[H.status]?H.status:"red",Te=[`${se}-${String(K).padStart(2,"0")}`,d[ie],`\u7248\u672C ${c(H.version_count)}\uFF08\u6CD5\u898F ${c(H.law_versions)}\uFF0F\u547D\u4EE4 ${c(H.order_versions)}\uFF09`,`\u5DF2\u5EFA\u7ACB ${c(H.backfilled_count)}`,`\u672A\u5EFA\u7ACB ${c(H.missing_count)}`,`\u9700\u5EFA\u7ACB ${c(H.needs_backfill_count)}\uFF08\u53EF\u5EFA\u7ACB ${c(H.backfillable_count)}\uFF0F\u7F3A\u539F\u59CB\u6A94 ${c(H.blocked_count)}\uFF09`,`\u689D\u6587\u5217 ${c(H.article_rows)} / \u9810\u671F ${c(H.article_count)}`,H.current?"\u76EE\u524D\u7248\u672C":"",H.versions?.length?`\u7248\u672C ${H.versions.map(B=>`#${B.version_id}`).join("\u3001")}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month law-version-month is-${ie}${H.current?" is-current":""}" title="${r(Te)}"><span>${K}</span></td>`}).join("");return`<tr><th scope="row">${r(se)}</th>${L}</tr>`}).join(""),v={law:"\u6CD5\u898F",order:"\u547D\u4EE4"},p=i.flatMap(se=>(se.versions||[]).filter(L=>L.needs_backfill).map(L=>({...L,month:se.month}))).sort((se,L)=>L.version_id-se.version_id),b=p.slice(0,20),w=b.map(se=>{let L=se.backfillable?"badge-info":se.blocked?"badge-danger":"badge-neutral",q=se.backfillable?"\u53EF\u5EFA\u7ACB":se.blocked?"\u7F3A\u539F\u59CB\u6A94":"\u5F85\u6AA2\u67E5";return`<div class="law-backfill-needed-row">
        <strong class="mono">#${se.version_id}</strong>
        <span class="badge ${L}">${q}</span>
        <span>${r(v[se.source_type]||se.source_type||"\u2014")}</span>
        <span class="mono">${r(se.update_date||se.month||"\u2014")}</span>
        <span class="law-backfill-needed-reason">${r(se.reason||"\u2014")}</span>
      </div>`}).join(""),M=p.length?`<div class="law-backfill-needed">
        <div class="law-backfill-needed-head">\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C <span class="badge badge-warn">${c(p.length)}</span></div>
        <div class="law-backfill-needed-list">${w}</div>
        ${p.length>b.length?`<div class="law-backfill-needed-more">\u53E6\u6709 ${c(p.length-b.length)} \u500B\u7248\u672C\u672A\u5217\u51FA</div>`:""}
      </div>`:'<div class="law-backfill-needed is-clear">\u76EE\u524D\u6C92\u6709\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3002</div>',k=Number(l.needs_backfill_versions)||0,S=Number(l.backfillable_versions)||0,f=Number(l.blocked_versions)||0,T=Number(l.backfilled_versions)||0,V=Number(l.versions)||0,Q=k<=0?"ok":f>0?"danger":"warn",fe=k<=0?"\u4E0D\u9700\u8981\u5EFA\u7ACB":"\u9700\u8981\u5EFA\u7ACB",ve=k>0?`\u9700\u8981\u5EFA\u7ACB ${c(k)} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF1A\u53EF\u5EFA\u7ACB ${c(S)}\u3001\u7F3A\u539F\u59CB\u6A94 ${c(f)}\u3002\u5DF2\u6709\u6B77\u53F2\u689D\u6587 ${c(T)} \u500B\u7248\u672C${f>0?"\uFF1B\u7F3A\u539F\u59CB\u6A94\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD":""}\u3002`:`\u76EE\u524D ${c(V)} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`;return`<section class="report-card processing-card law-version-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
      ${n}
    </div>
    <div class="law-version-check-status is-${Q}" role="status" aria-live="polite">
      <span class="badge badge-${Q}">${fe}</span>
      <span>${r(ve)}</span>
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(se,L)=>`<th scope="col">${L+1}</th>`).join("")}</tr></thead>
          <tbody>${y}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u8A72\u6708\u4EFD\u6240\u6709\u7248\u672C\u90FD\u6709\u6B77\u53F2\u689D\u6587\uFF1B\u7D05\u8272\uFF1A\u5B8C\u5168\u672A\u5EFA\u7ACB\uFF1B\u7070\u8272\uFF1A\u90E8\u5206\u7248\u672C\u5DF2\u5EFA\u7ACB\uFF1B\u5916\u6846\uFF1A\u76EE\u524D\u7248\u672C\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u7248\u672C\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u6578\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u6578\u8207\u689D\u6587\u5217\u3002</p>
      ${M}
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(Se(t.checked_at))}</div>
    </div>
  </section>`}function qm(){return`<div class="processing-ollama-loading">
    <span class="spinner" aria-hidden="true"></span>
    <span>\u6B63\u5728\u6AA2\u67E5 llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span>
  </div>`}function Mm(e,t,s){let a=Array.isArray(e?.hosts)?e.hosts:[];if(s&&!a.length)return`${Ge({tone:"danger",title:"llama-server \u4E3B\u6A5F\u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
    <div class="processing-ollama-empty">
      <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh-ollama">
        ${m("refresh",13)}<span>\u91CD\u65B0\u6AA2\u67E5</span>
      </button>
    </div>`;if(!a.length)return t?qm():'<div class="processing-ollama-empty">\u5C1A\u672A\u8A2D\u5B9A llama-server \u4E3B\u6A5F\uFF1B\u8ACB\u5230\u300C\u7CFB\u7D71\u72C0\u614B \u2192 Model Provider\u300D\u65B0\u589E\u4E26\u9023\u63A5\u6A21\u578B\u3002</div>';let n=a.map((o,l)=>{let d=o.status==="operational",u=Array.isArray(o.models)?o.models:[],h=u.length?u.map(v=>`<span class="processing-ollama-model ${d?"is-online":"is-offline"}">${r(v.name||"")}</span>`).join(""):'<span class="processing-ollama-model is-offline">\u6C92\u6709\u53EF\u7528\u6A21\u578B</span>',y=[o.embedding_model?`<span class="processing-ollama-role ${d?"is-online":"is-offline"}">\u5D4C\u5165 \xB7 ${r(o.embedding_model)}</span>`:'<span class="processing-ollama-role is-offline">\u672A\u8A2D\u5B9A\u5D4C\u5165\u6A21\u578B</span>',o.chat_model?`<span class="processing-ollama-role is-offline">\u804A\u5929 \xB7 ${r(o.chat_model)}</span>`:""].filter(Boolean).join("");return`<article class="processing-ollama-host ${d?"is-online":"is-offline"}" data-ollama-host data-host-id="${Number(o.id)}">
        <span class="processing-ollama-handle" aria-hidden="true">${m("grid",14)}</span>
        <span class="processing-ollama-rank">${l+1}</span>
        <div class="processing-ollama-main">
          <div class="processing-ollama-title">
            <strong>${r(o.name||o.base_url||`\u4E3B\u6A5F #${o.id}`)}</strong>
            <span class="processing-ollama-status">${d?"\u53EF\u7528":"\u7121\u6CD5\u9023\u7DDA"}</span>
          </div>
          <span class="processing-ollama-url mono">${r(o.base_url||"\u2014")}</span>
          <div class="processing-ollama-models">${h}</div>
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
    <p class="processing-ollama-hint">\u62D6\u79FB\u6216\u4F7F\u7528\u7BAD\u982D\u8ABF\u6574 embedding \u512A\u5148\u9806\u5E8F\uFF1B\u76EE\u524D\u4E3B\u6A5F\u7121\u6CD5\u4F7F\u7528\u6642\uFF0C\u6703\u4F9D\u5E8F\u81EA\u52D5\u6539\u7528\u4E0B\u4E00\u53F0\uFF08\u5404\u53F0\u9700\u5177\u5099\u76F8\u540C\u7684 embedding \u6A21\u578B\uFF09\uFF0C\u76F4\u5230\u6709\u4E3B\u6A5F\u56DE\u50B3\u5411\u91CF\u3002</p>`}function Xl(e,t={}){let s=e.active_run||null,a=s||e.last_run||null,n=ts===e.id,i=!!s||n,o=Pn[e.id]!==void 0,l=Np.has(e.id),d=In(e.id),u=!l||!!e.update_available&&!d,y=!!e.can_run&&!i&&u,v=i?"\u6B64\u6D41\u7A0B\u6B63\u5728\u57F7\u884C\u4E2D\u3002":e.can_run?u?"":o?e.update_status?.status==="error"?"\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF0C\u8ACB\u5148\u6309\u300C\u6AA2\u67E5\u66F4\u65B0\u300D\u3002":e.update_status?.status==="up_to_date"?"\u76EE\u524D\u5DF2\u662F\u6700\u65B0\u7248\u672C\uFF0C\u6C92\u6709\u53EF\u66F4\u65B0\u5167\u5BB9\u3002":"\u8ACB\u5148\u6309\u300C\u6AA2\u67E5\u66F4\u65B0\u300D\uFF0C\u78BA\u8A8D\u662F\u5426\u6709\u65B0\u7248\u3002":"\u76EE\u524D\u672A\u5075\u6E2C\u5230\u53EF\u91CD\u5EFA\u7684\u7D22\u5F15\u5167\u5BB9\u3002":e.start_blocked_reason||"\u76EE\u524D\u6709\u5176\u4ED6\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",p=y?e.id==="legal_index_versions"?"\u7ACB\u5373\u91CD\u5EFA\u6CD5\u898F\uFF0F\u547D\u4EE4\u7D22\u5F15\uFF1B\u5B8C\u6210\u9A57\u8B49\u5F8C\u5207\u63DB alias":e.id==="index_versions"?"\u7ACB\u5373\u5EFA\u7ACB\u6216\u63A5\u7E8C\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\uFF1B\u5B8C\u6210\u9A57\u8B49\u5F8C\u5207\u63DB alias":"\u7ACB\u5373\u66F4\u65B0\uFF1B\u6703\u5148\u6AA2\u67E5\u7248\u672C\u4E26\u8A08\u7B97\u7E3D\u5927\u5C0F\u8207\u9810\u4F30\u6642\u9593":v,b=Array.isArray(e.command)?e.command.join(" "):"",w=d?0:Number(e.update_count)||e.update_available&&Number(e.pending_count)||0,M=e.update_origin||"\u66F4\u65B0\u5075\u6E2C",k=e.update_mechanism||"\u65E2\u6709\u66F4\u65B0\u6AA2\u67E5\u7D00\u9304",S=e.update_message||e.update_status&&e.update_status.message||"\u627E\u5230\u53EF\u66F4\u65B0\u5167\u5BB9\u3002",f=e.update_status&&e.update_status.checked_at?Se(e.update_status.checked_at):"",T=e.progress||{},V=Array.isArray(T.stages)?T.stages:[],Q=String(T.active_stage||""),fe=V.find(K=>String(K.key||"")===Q),ve=(e.index_runtime&&e.index_runtime.current?e.index_runtime.current.month:"")||"",se=ve?Dn(ve):fe&&(fe.label||fe.key)||"",L=n&&!s?"\u555F\u52D5\u4E2D":"\u57F7\u884C\u4E2D",q=`<details class="processing-workflow-details">
      <summary>
        <span class="processing-workflow-details-title">${m(Ol[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
      </summary>
      <div class="processing-workflow-command-grid">
        <span>\u7A0B\u5F0F</span><code>${r(e.program||"\u2014")}</code>
        <span>Shell\uFF0F\u5165\u53E3</span><code>${r(e.script||"\u2014")}</code>
        <span>\u5BE6\u969B\u547D\u4EE4</span><code class="processing-workflow-command">${r(b||"\u2014")}</code>
      </div>
      <div class="side-card-foot">
        \u57F7\u884C\u7D50\u679C\u6703\u5BEB\u5165\u5171\u7528\u8655\u7406\u72C0\u614B\u6A94\uFF0C\u53EF\u5F9E\u8655\u7406\u7E3D\u89BD\u67E5\u770B\u3002
      </div>
    </details>`;return`<div class="processing-workflow-panel">
    ${`<div class="notice notice-info processing-workflow-intro">
      <span class="notice-icon" aria-hidden="true">i</span>
      <div class="notice-body">
        <div class="processing-workflow-intro-head">
          <div>
            <strong>${r(e.label)}</strong>
            <p>${r(e.description||"")}</p>
          </div>
          <span class="badge badge-neutral badge-mono">${r(e.branch||"")}</span>
        </div>
      <div class="processing-workflow-actions">
        ${["law_download","order_download","judgment_download"].includes(e.id)?`<button class="btn btn-secondary btn-sm" type="button"
                data-processing-action="check-updates"
                data-workflow-id="${r(e.id)}"
                ${i?"disabled":""}>
                ${m("refresh",14)}<span>\u6AA2\u67E5\u66F4\u65B0</span>
              </button>`:""}
        <button class="btn btn-primary btn-sm" type="button"
          data-processing-action="run-workflow"
          data-workflow-id="${r(e.id)}"
          ${y?"":"disabled"}
          title="${r(p)}">
          ${i?'<span class="spinner" aria-hidden="true"></span>':m("play",14)}<span>${i?L:"\u66F4\u65B0"}</span>
        </button>
        ${i?`<button class="btn btn-secondary btn-sm processing-stop" type="button"
                data-processing-action="stop">${m("x",14)}<span>\u4E2D\u6B62\u57F7\u884C</span></button>`:""}
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
              <span class="badge badge-info">${m("activity",11)}${L}</span>
              ${s&&s.id?`<span class="mono">${r(s.id)}</span>`:""}
              ${s&&s.started_at?`<span>\u958B\u59CB ${r(Se(s.started_at))}</span>`:""}
              ${se?`<span>\u76EE\u524D\u8655\u7406 <strong class="mono">${r(se)}</strong></span>`:""}
            </div>`:""}

        ${li.has(e.id)?'<div class="processing-embedding-strip-slot" data-processing-embedding-strip data-preserve-children></div>':""}
        ${e.update_available&&u?`<div class="processing-inline-update" role="status" data-processing-update-notice>
                ${m("refresh",13)}
                <span class="processing-inline-update-copy">
                  <strong>${r(M)}\u5075\u6E2C\u5230\u53EF\u66F4\u65B0\u5167\u5BB9</strong>
                  <small>\u5075\u6E2C\u6A5F\u5236\uFF1A${r(k)}${f?` \xB7 \u6AA2\u67E5\u6642\u9593 ${r(f)}`:""}</small>
                  <span data-processing-update-message>${r(S)}</span>
                </span>
                ${w>0?`<span class="badge badge-warn badge-mono" data-processing-update-count>${m("refresh",10)}${c(w)}</span>`:'<span class="badge badge-warn">\u53EF\u66F4\u65B0</span>'}
              </div>`:""}
        ${q}
      </div>
    </div>`}
    ${["legal_index_versions","law_download","order_download"].includes(e.id)?zp(e.index_timelines,{titleSuffix:e.id==="legal_index_versions"?"\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868":"\u4E0B\u8F09\u6642\u9593\u8868"}):""}
    ${e.id==="normalize_courts"?xm(t):""}
    ${e.id==="backfill_law_articles"?Am(t):""}
    ${mm(e)}
    ${e.id==="judgment_parquet"?_m():""}
    ${e.id==="normalize_courts"?km():""}
    ${e.id==="backfill_law_articles"?Sm():""}
    ${e.id==="judgment_import"?$m(e):""}
    ${e.id==="index_versions"?ym(e):""}
    ${e.id==="index_versions"?wm(t):""}
    ${e.id==="judgment_download"?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${m("calendar",14)}\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B</span>
              <button class="btn btn-ghost btn-sm" type="button" title="\u91CD\u65B0\u6383\u63CF raw_rar \u76EE\u9304\u8207\u6708\u4EFD\u72C0\u614B" data-processing-action="refresh-judgment-months">${m("refresh",13)}<span>\u91CD\u65B0\u6574\u7406</span></button>
            </div>
            <div data-judgment-months-slot data-preserve-children>${hi()}</div>
          </section>`:""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${Wt(a?.status||"idle")}
      </div>
      ${Zp(a)}
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("history",14)}\u57F7\u884C\u7D00\u9304</span>
        <span class="badge badge-neutral">\u6700\u8FD1 ${c((e.recent_runs||[]).length)} \u7B46</span>
      </div>
      ${om(e.recent_runs)}
    </section>
    ${["law_download","order_download","judgment_download"].includes(e.id)?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${m("search",14)}\u7248\u672C\u6AA2\u67E5\u7D00\u9304</span>
              <span class="badge badge-neutral">\u6700\u8FD1 ${c((e.update_history||[]).length)} \u7B46</span>
            </div>
            ${lm(e)}
          </section>`:""}
  </div>`}function Rn(e,t,s={},a=new Set){if(t==="overview")return Nl(e,a);let i=(Array.isArray(e.workflows)?e.workflows:[]).find(o=>o.id===t);return i?Xl(i,s):Nl(e,a)}async function Lm(e){let t=Zt(),s=`judgment.processing.slim.${t?"visitor":"admin"}`,a=()=>{try{let $=JSON.parse(window.localStorage.getItem(s)||"null");return!$?.snapshot||!$.snapshot.slim||Date.now()-Number($.saved_at||0)>600*1e3?null:$.snapshot}catch{return null}},n=$=>{if($?.slim)try{window.localStorage.setItem(s,JSON.stringify({snapshot:$,saved_at:Date.now()}))}catch{}};e.innerHTML=`<section class="page processing-page">
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
          ${m("x",14)}<span>\u505C\u6B62\u66F4\u65B0</span>
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
  </section>`;let i=e.querySelector(".processing-page"),o=e.querySelector("#processing-root"),l=e.querySelector("#processing-workflows"),d=e.querySelector("#processing-stop"),u=!1,h=document.createElement("div");h.className="processing-stage-tooltip",h.hidden=!0,i.appendChild(h),es=new Map;let y=!1,v=!1,p=!1,b=null,w="",M="",k="overview",S=null,f=!1,T=null,V=null,Q=null,fe=!1,ve=null,se=0,L=null,q=!1,E=null,K=0,de=null,H=!1,ie=null,Te=0,B=null,qe=!1,ae=null,Le=0,Ie=!1,Ee=null,Ze=!1,le=!1,ee="",Me=new Set,ye=null,_e=null,je=null,D=-1,F="",W=0,P=0,z=null,J=[],$e=()=>({storage:Q,loading:fe,error:ve,courtCheck:L,courtCheckLoading:q,courtCheckError:E,lawVersionCheck:de,lawVersionCheckLoading:H,lawVersionCheckError:ie}),De=()=>{if(k!=="judgment_download")return;let $=o.querySelector(".processing-workflow-panel");if(!$)return;$.querySelectorAll(".judgment-month.is-active").forEach(He=>{He.classList.remove("is-active"),He.removeAttribute("aria-current")});let _=$.querySelector("[data-judgment-progress]");if(!_)return;let I=S?.progress,re=!!(b?.workflows||[]).find(He=>He.id==="judgment_download")?.active_run;if((!I||I.active===!1)&&!re){_.hidden=!0,_.classList.remove("is-indeterminate");let He=_.querySelector("[data-judgment-run]");He&&(He.hidden=!0);return}if(_.hidden=!1,!I||I.active===!1){let He=_.querySelector("[data-judgment-progress-phase]");He&&(He.textContent="\u6E96\u5099\u4E2D");let kt=_.querySelector("[data-judgment-progress-month]");kt&&(kt.textContent="\u2014");let ct=_.querySelector("[data-judgment-progress-filename]");ct&&(ct.textContent="\u7B49\u5F85\u4E0B\u8F09\u7A0B\u5E8F\u56DE\u5831\u9032\u5EA6\u2026",ct.title=""),_.classList.add("is-indeterminate");let Jt=_.querySelector("[data-judgment-progress-bar]");Jt&&(Jt.style.width="");let ze=_.querySelector("[data-judgment-progress-percent]");ze&&(ze.textContent="\u2014");let st=_.querySelector("[data-judgment-progress-size]");st&&(st.textContent="\u2014");let ut=_.querySelector("[data-judgment-progress-note]");ut&&(ut.textContent="\u5DF2\u555F\u52D5\uFF0C\u7B49\u5F85\u9032\u5EA6\u56DE\u5831");let Pt=_.querySelector("[data-judgment-run]");Pt&&(Pt.hidden=!0);let zt=_.querySelector("[data-judgment-downloads]");zt&&(zt.hidden=!0);let Vt=_.querySelector("[data-judgment-current]");Vt&&(Vt.hidden=!1);return}let X={preparing:"\u6E96\u5099\u4E2D",planning:"\u8A08\u7B97\u5927\u5C0F",scanning:"\u6383\u63CF\u4E2D",checking:"\u6AA2\u67E5\u4E2D",downloading:"\u4E0B\u8F09\u4E2D",saving:"\u5132\u5B58\u4E2D",finalizing:"\u6574\u7406\u4E2D"},we=X[I.phase]||"\u8655\u7406\u4E2D",Z=Array.isArray(I.downloads)?I.downloads:[],pe=Z.length>0,Ae=_.querySelector("[data-judgment-current]");Ae&&(Ae.hidden=pe);let Ne=_.querySelector("[data-judgment-downloads]");if(Ne){Ne.hidden=!pe;let He=_.querySelector("[data-judgment-downloads-count]");He&&(He.textContent=`${c(Z.length)} \u500B\u9032\u884C\u4E2D`);let kt=_.querySelector("[data-judgment-downloads-list]");kt&&pe&&(kt.innerHTML=Z.map(ct=>{let Jt=X[ct.phase]||we||"\u8655\u7406\u4E2D",ze=Number(ct.bytes_written),st=Number(ct.total_bytes),ut=Number.isFinite(st)&&st>0,Pt=ct.percent,zt=Pt==null||Pt===""?ut&&Number.isFinite(ze)?ze/st*100:null:Number(Pt),Vt=zt===null||!Number.isFinite(zt),Oa=Vt?"\u2014":`${Math.min(100,Math.max(0,zt)).toFixed(zt>=10?0:1)}%`,Ha=ut?`${Pe(ze)} / ${Pe(st)}`:Number.isFinite(ze)&&ze>0?Pe(ze):"\u2014";return`<div class="processing-download-active-item">
              <div class="processing-download-active-line">
                <strong class="mono">${r(ct.month||"\u2014")}</strong>
                <span class="processing-download-active-file mono" title="${r(ct.filename||"")}">${r(ct.filename||"\u2014")}</span>
                <span class="processing-download-active-percent mono">${r(Oa)}</span>
              </div>
              <div class="processing-download-active-track${Vt?" is-indeterminate":""}"><span style="width:${Vt?"":`${Math.min(100,Math.max(0,zt)).toFixed(1)}%`}"></span></div>
              <div class="processing-download-active-meta">
                <span>${r(Jt)}</span>
                <span>${r(Ha)}</span>
              </div>
            </div>`}).join(""))}let g=_.querySelector("[data-judgment-progress-phase]");g&&(g.textContent=we);let A=I.month||"",j=_.querySelector("[data-judgment-progress-month]");j&&(j.textContent=A||"\u2014");let U=I.filename||"",be=_.querySelector("[data-judgment-progress-filename]");be&&(be.textContent=U||"\u2014",be.title=U);let ke=new Map;for(let He of Z)He.month&&ke.set(String(He.month),{percent:He.percent,phase:He.phase});A&&!ke.has(A)&&ke.set(A,{percent:I.percent,phase:I.phase}),$.querySelectorAll(".judgment-month.is-active").forEach(He=>{He.classList.remove("is-active","is-downloading"),He.removeAttribute("aria-current"),He.style.removeProperty("--month-progress")});for(let[He,kt]of ke){let ct=$.querySelector(`[data-judgment-month-key="${He}"]`);if(!ct)continue;ct.classList.add("is-active"),(kt?.phase==="downloading"||kt?.phase==="saving")&&ct.classList.add("is-downloading"),ct.setAttribute("aria-current","true");let Jt=Number(kt?.percent);Number.isFinite(Jt)&&ct.style.setProperty("--month-progress",`${Math.min(100,Math.max(0,Jt)).toFixed(1)}%`)}let Ce=Number(I.bytes_written),xe=Number(I.total_bytes),lt=Number.isFinite(xe)&&xe>0,Xe=null,bt=I.percent;bt!=null&&bt!==""&&Number.isFinite(Number(bt))?Xe=Number(bt):lt&&Number.isFinite(Ce)&&(Xe=Ce/xe*100);let dt=Xe===null;_.classList.toggle("is-indeterminate",dt);let ht=_.querySelector("[data-judgment-progress-bar]");ht&&(ht.style.width=dt?"":`${Math.min(100,Math.max(0,Xe)).toFixed(1)}%`);let ns=_.querySelector("[data-judgment-progress-percent]");if(ns){let He=dt?null:Math.min(100,Math.max(0,Xe));ns.textContent=He===null?"\u2014":`${He.toFixed(He>=10?0:1)}%`}let _t=_.querySelector("[data-judgment-progress-size]");if(_t){let He=Number.isFinite(Ce)&&Ce>0?Pe(Ce):"\u2014";_t.textContent=lt?`${He} / ${Pe(xe)}`:He}let rs=_.querySelector("[data-judgment-progress-note]");if(rs){let He=[],kt=Number(I.candidate_index),ct=Number(I.candidate_total);Number.isFinite(kt)&&kt>0&&Number.isFinite(ct)&&ct>0&&He.push(`\u7B2C ${c(kt)} / ${c(ct)} \u500B\u6708`),I.fileset_id&&He.push(`fileset ${I.fileset_id}`),I.message&&I.phase!=="downloading"&&He.push(String(I.message)),rs.textContent=He.join(" \xB7 ")}let ks=_.querySelector("[data-judgment-run]"),jt=I.run_files_total!==null&&I.run_files_total!==void 0;if(ks&&(ks.hidden=!jt,jt)){let He=Number(I.run_files_total)||0,kt=Number(I.run_files_done)||0,ct=I.run_bytes_total===null||I.run_bytes_total===void 0?null:Number(I.run_bytes_total),Jt=Number(I.run_bytes_done)||0,ze=I.run_percent,st=ze==null||ze===""?null:Number(ze),ut=_.querySelector("[data-judgment-run-bar]");ut&&(ut.style.width=st===null||!Number.isFinite(st)?"":`${Math.min(100,Math.max(0,st)).toFixed(1)}%`);let Pt=_.querySelector("[data-judgment-run-percent]");Pt&&(Pt.textContent=st===null||!Number.isFinite(st)?"\u2014":`${st.toFixed(st>=10?0:1)}%`);let zt=_.querySelector("[data-judgment-run-files]");zt&&(zt.textContent=`${c(kt)} / ${c(He)} \u500B\u6708`);let Vt=_.querySelector("[data-judgment-run-size]"),Oa=I.phase==="planning";Vt&&(ct!==null&&ct>0?Vt.textContent=`\u5DF2\u4E0B\u8F09 ${Pe(Jt)} / ${Pe(ct)}`:Vt.textContent=`\u5DF2\u4E0B\u8F09 ${Pe(Jt)} \xB7 ${Oa?"\u7E3D\u91CF\u8A08\u7B97\u4E2D":"\u7E3D\u91CF\u672A\u77E5"}`);let Ha=_.querySelector("[data-judgment-run-elapsed]");Ha&&(Ha.textContent=`\u5DF2\u82B1 ${Ma(I.elapsed_seconds)}`);let Vn=_.querySelector("[data-judgment-run-eta]");if(Vn){let Kn=Number(I.eta_seconds),Sc=Number(I.estimated_total_seconds);Number.isFinite(Kn)&&Kn>=0?Vn.textContent=`\u5269\u9918 ${Ma(Kn)} \xB7 \u9810\u4F30\u7E3D\u8A08 ${Ma(Sc)}`:Vn.textContent=Oa&&(I.run_bytes_total===null||I.run_bytes_total===void 0)?"\u5269\u9918\u6642\u9593\uFF1A\u8A08\u7B97\u4E2D":"\u5269\u9918\u6642\u9593\uFF1A\u2014"}}},et=()=>{if(k!=="judgment_download")return;let $=o.querySelector("[data-judgment-months-slot]");if($){let _=Array.isArray(S?.months)?S.months:[];T&&!S?($.innerHTML=Ge({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(T)}),delete $.dataset.judgmentMonthCount):S?$.dataset.judgmentMonthCount!==String(_.length)?($.innerHTML=rm(S),$.dataset.judgmentMonthCount=String(_.length)):im($,S):($.querySelector(".judgment-months-loading")||($.innerHTML=hi()),delete $.dataset.judgmentMonthCount)}if(S){let _=bi(S),I=V!==_.pending;V=_.pending;let ce=(b?.workflows||[]).find(X=>X.id==="judgment_download");ce&&(ce.update_count=_.pending,ce.update_available=_.pending>0);let re=o.querySelector("[data-processing-update-notice]");if(re)if(_.pending<=0)re.remove();else{let X=re.querySelector("[data-processing-update-count]");X&&(X.innerHTML=`${m("refresh",10)}${c(_.pending)}`);let we=re.querySelector("[data-processing-update-message]");we&&(we.textContent=`\u5224\u6C7A\u5F85\u88DC\u9F4A ${c(_.pending)} \u500B\u6708`)}I&&l&&b&&ys(l,Nn(b,k))}De()},ft=()=>{let $=Array.isArray(B?.hosts)?B.hosts:[];return JSON.stringify({loading:!$.length&&qe,error:!$.length&&ae?ae.message||String(ae):"",active:B?.active_host_id??null,hosts:$.map(_=>({id:_.id,name:_.name,url:_.base_url,status:_.status,detail:_.detail,embedding:_.embedding_model,chat:_.chat_model,models:(_.models||[]).map(I=>I.name)}))})},ot=()=>{let $=o.querySelector("[data-processing-ollama]");if(!$||Le)return;let _=ft();$.dataset.ollamaSignature!==_&&($.dataset.ollamaSignature=_,$.innerHTML=Mm(B,qe,B?null:ae))},nt=()=>{let _=((b?.sections||[]).find(I=>I.key==="legal")?.stages||[]).find(I=>I.key==="legal_qdrant");return oi(_?.model?.label||"")},Ue=()=>{let $=o.querySelector("[data-processing-embedding-strip]");if(!$)return;let _=Array.isArray(B?.hosts)?B.hosts:[],I=[];for(let pe of _)if(pe.status==="operational")for(let Ae of pe.models||[])Array.isArray(Ae.capabilities)&&Ae.capabilities.includes("embedding")&&I.push({hostId:Number(pe.id),model:Ae.name,label:oi(`${pe.name||pe.base_url||`\u4E3B\u6A5F ${pe.id}`}:${Ae.name}`),baseUrl:pe.base_url||""});let ce=nt(),re=_.find(pe=>Number(pe.id)===Number(B?.active_host_id)),X=I.map(pe=>{let Ae=pe.label===ce;return`<button class="rag-model-button${Ae?" is-active":""}" type="button"
        data-processing-action="select-embedding-model"
        data-host-id="${pe.hostId}"
        data-model="${r(pe.model)}"
        title="${r(pe.label)}"
        aria-pressed="${Ae?"true":"false"}"
        ${le?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(pe.label)}</span>
        ${Ae?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`});ce&&!I.some(pe=>pe.label===ce)&&X.unshift(`<button class="rag-model-button is-active is-static" type="button" aria-pressed="true" disabled>
          <span class="rag-model-state" aria-hidden="true"></span>
          <span>${r(ce)}</span>
          <span class="rag-model-current">\u4F7F\u7528\u4E2D</span>
        </button>`);let we=I.length?`<div class="rag-model-buttons">${X.join("")}</div>`:`<p class="rag-model-empty">${qe?"\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\u8207 Embedding model\u2026":ae?`\u7121\u6CD5\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\uFF1A${r(ae.message||String(ae))}`:"\u76EE\u524D\u6C92\u6709\u53EF\u7528\u7684 Embedding model\u3002"}</p>`,Z=`<div class="processing-embedding-strip rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${m("brain",13)} Embedding \u4E3B\u6A5F\uFF0F\u6A21\u578B</span>
        ${re?.base_url?`<span class="rag-model-strip-base mono">${r(re.base_url)}</span>`:""}
        <span class="rag-model-strip-current">\u76EE\u524D\uFF1A<strong>${r(ce||"\u2014")}</strong></span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-processing-action="refresh-embedding-models"
          ${qe?"disabled":""}>
          ${m("refresh",12)}<span>\u6AA2\u67E5\u6A21\u578B</span>
        </button>
      </div>
      ${we}
      <p class="rag-model-hint">\u9EDE\u9078 <span class="mono">\u4E3B\u6A5F:\u6A21\u578B</span> \u5207\u63DB Embedding\uFF1B\u9078\u53D6\u5F8C\u6703\u6210\u70BA\u7B2C\u4E00\u512A\u5148\uFF0C\u5176\u4ED6\u4E3B\u6A5F\u4F9D\u5E8F\u4F5C\u70BA\u5099\u63F4\u3002\u5207\u63DB\u6A21\u578B\u5F8C\u65E2\u6709\u7D22\u5F15\u53EF\u80FD\u9700\u8981\u91CD\u5EFA\u3002</p>
    </div>`;$.innerHTML!==Z&&($.innerHTML=Z)},ue=$=>{let _=o.querySelector('[data-import-timeline="judgment"]');if(!_)return;let I=String($?.active_month||""),ce=String($?.processing_month||"");_.querySelectorAll(".processing-month").forEach(Ne=>{let g=!!I&&Ne.dataset.month===I;Ne.classList.toggle("is-current",g),Ne.classList.toggle("is-processing-current",!!ce&&Ne.dataset.month===ce),g?Ne.setAttribute("aria-current","true"):Ne.removeAttribute("aria-current")});let re=_.querySelector(".index-current-row");if(!I||!$?.active_archive){re&&re.remove();return}let X=b?.workflows?.find(Ne=>Ne.id==="judgment_import")?.import_timeline?.stage_labels||{},we=Bl({activeMonth:I,activeArchive:$.active_archive,activePhase:$.active_phase||"",processingMonth:$.processing_month||"",processingArchive:$.processing_archive||"",stageLabels:X});if(re){re.innerHTML=we;return}let Z=document.createElement("div");Z.className="index-current-row",Z.innerHTML=we;let pe=_.querySelector(":scope > .side-card-head");if(pe){pe.insertAdjacentElement("afterend",Z);return}let Ae=_.querySelector(".judgment-months");Ae&&Ae.prepend(Z)},rt=$=>{let _=Number($?.state_mtime_ns);return Number.isFinite(_)?_:-1},We=$=>{let _=String($?.active_month||"");return/^\d{6}$/.test(_)?Number(_):-1},mt=$=>{if(!$)return;let _=rt($);if(_>=0&&_<D){je?.active_month&&ue(je);return}_>=0&&(D=_);let I=String($.active_month||"");if(!!($.run_id&&$.run_id===je?.run_id)&&We($)>=0&&We($)<We(je)){let re={...$,active_month:je.active_month,active_archive:je.active_archive};je=re,ue(re);return}if(!I&&$.run_status==="running"){je?.active_month&&je?.run_id===$.run_id?ue(je):(je=$,ue($));return}je=$,ue($)},wt=$=>{let _=$?.active_import;if(_){mt(_);return}je?.active_month&&ue(je)},ne=()=>{if(!(y||ye)){if(t){_e=window.setInterval(()=>{y||Lt({silent:!0,cached:!0})},3e4);return}ye=Et(["processing","judgment-download","system-usage","ollama","court-check","law-version-check"],($,_)=>{if(!y){if($==="processing"){_?.snapshot?.live?ua(_.snapshot):_?.snapshot?da(_.snapshot,{silent:!0}):Lt({silent:!0,cached:!0});return}if($==="judgment-download"){k==="judgment_download"&&oe({quiet:!0,payload:_?.snapshot||null});return}if($==="system-usage"){k==="index_versions"&&me({quiet:!0,force:!0,payload:_?.snapshot||null});return}if($==="ollama"){li.has(k)&&Qe({quiet:!0,payload:_?.snapshot||null});return}if($==="court-check"){k==="normalize_courts"&&Fe({quiet:!0,force:!0,payload:_?.snapshot||null});return}$==="law-version-check"&&k==="backfill_law_articles"&&Oe({quiet:!0,force:!0,payload:_?.snapshot||null})}},{onProgress:($,_)=>{if($!=="processing")return;let I=_?.event;I&&Ia(I)},onError:()=>{b||Lt({silent:!0,cached:!0})}})}},he=()=>{ye&&(ye(),ye=null)},tt=async $=>{if(le)return;let[_,...I]=String($||"").split("|"),ce=Number(_),re=I.join("|");if(!ce||!re){Ue();return}let X=(B?.hosts||[]).find(Z=>Number(Z.id)===ce);if(!X){Ue();return}let we=oi(`${X.name||X.base_url||`\u4E3B\u6A5F ${X.id}`}:${re}`);if(we===nt()){Ue();return}if(!window.confirm(`\u5207\u63DB Embedding \u70BA ${we}\uFF1F

\u5207\u63DB\u6A21\u578B\u5F8C\uFF0C\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u8207\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u53EF\u80FD\u4E0D\u76F8\u5BB9\uFF0C\u9700\u8981\u91CD\u65B0\u5EFA\u7ACB\u7D22\u5F15\u3002`)){Ue();return}le=!0,Ue();try{await G.selectOllamaModel(ce,{model:re,role:"embedding"});let Z=(B?.hosts||[]).map(Ae=>Number(Ae.id)),pe=[ce,...Z.filter(Ae=>Ae!==ce)];await G.reorderOllamaHosts(pe),N(`\u5DF2\u5207\u63DB Embedding \u70BA ${we}\u3002`,"ok",6e3),B=null,await Qe({quiet:!0}),await Lt({silent:!0})}catch(Z){N(Z.message||"\u7121\u6CD5\u5207\u63DB Embedding model\u3002","danger",7e3),await Qe({quiet:!0})}finally{le=!1,Ue()}},Qe=async({quiet:$=!1,button:_=null,payload:I=null}={})=>{if(!(y||qe)){if(t){qe=!1,ae=new Error("\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u8A2D\u5B9A\u3002"),ot(),Ue();return}qe=!0,ae=null,B||(ot(),Ue()),_&&Re(_,!0,"\u6AA2\u67E5\u4E2D\u2026");try{let ce=I||await G.ollamaHosts();if(y)return;B=ce}catch(ce){if(y)return;ae=ce,$||N(ce.message||"\u7121\u6CD5\u6AA2\u67E5 llama-server \u4E3B\u6A5F\u3002","danger",6e3)}finally{y||(qe=!1,_&&Re(_,!1),ot(),Ue())}}},Bt=async $=>{if(Ze)return;let _=(B?.hosts||[]).map(X=>Number(X.id)),I=$.map(X=>Number(X));if(!I.length||I.length!==_.length||I.every((X,we)=>X===_[we])){ot();return}Ze=!0;let ce=new Map((B?.hosts||[]).map(X=>[Number(X.id),X])),re=I.map(X=>ce.get(X)).filter(Boolean);if(B&&re.length===_.length){B={...B,hosts:re,active_host_id:I[0]};let X=o.querySelector("[data-processing-ollama]");X&&(X.dataset.ollamaSignature=""),ot()}try{await G.reorderOllamaHosts(I),N("\u5DF2\u66F4\u65B0 llama-server \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","ok",3500)}catch(X){N(X.message||"\u7121\u6CD5\u66F4\u65B0 llama-server \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","danger",6e3),await Qe({quiet:!0})}finally{Ze=!1}},$t=()=>{let $=o.querySelector("[data-processing-ollama]");$&&($.dataset.ollamaSignature=""),ot()},x=()=>{let $=Ee;if(!$)return;if(o.querySelector(`[data-ollama-host][data-host-id="${$.hostId}"]`)?.classList.remove("is-dragging"),$.captureTarget?.hasPointerCapture?.($.pointerId))try{$.captureTarget.releasePointerCapture($.pointerId)}catch{}document.documentElement.classList.remove("processing-ollama-dragging"),window.removeEventListener("pointermove",R),window.removeEventListener("pointerup",C),window.removeEventListener("pointercancel",O),Ee=null,Le=0},R=$=>{let _=Ee;if(!_||$.pointerId!==_.pointerId)return;if(!_.dragging){if(Math.hypot($.clientX-_.startX,$.clientY-_.startY)<5)return;_.dragging=!0,Le=_.hostId,Ie=!1,o.querySelector(`[data-ollama-host][data-host-id="${_.hostId}"]`)?.classList.add("is-dragging"),document.documentElement.classList.add("processing-ollama-dragging")}$.preventDefault();let I=64;$.clientY<I?window.scrollBy(0,-12):$.clientY>window.innerHeight-I&&window.scrollBy(0,12);let ce=o.querySelector("[data-ollama-list]"),re=document.elementFromPoint($.clientX,$.clientY)?.closest?.("[data-ollama-host]");if(!ce||!re||!ce.contains(re))return;let X=ce.querySelector(`[data-ollama-host][data-host-id="${_.hostId}"]`);if(!X||X===re)return;let we=re.getBoundingClientRect(),Z=$.clientY>we.top+we.height/2;ce.insertBefore(X,Z?re.nextSibling:re),Ie=!0},C=$=>{let _=Ee;if(!_||$.pointerId!==_.pointerId)return;let I=_.dragging,ce=Ie,re=o.querySelector("[data-ollama-list]"),X=I&&re?[...re.querySelectorAll("[data-ollama-host]")].map(we=>Number(we.dataset.hostId)):[];x(),I&&ce&&X.length&&Bt(X)},O=()=>{let $=!!Ee?.dragging;x(),$&&$t()},Y=$=>{if($.button!==0||$.pointerType==="mouse"&&$.buttons!==1||Ze||Ee)return;let _=$.target.closest("[data-ollama-host]");if(!_||!o.contains(_)||$.target.closest("button")||$.pointerType==="touch"&&!$.target.closest(".processing-ollama-handle"))return;let I=Number(_.dataset.hostId)||0;if(I){$.preventDefault(),Le=I,Ee={hostId:I,pointerId:$.pointerId,startX:$.clientX,startY:$.clientY,dragging:!1,captureTarget:_};try{_.setPointerCapture($.pointerId)}catch{}window.addEventListener("pointermove",R,{passive:!1}),window.addEventListener("pointerup",C),window.addEventListener("pointercancel",O)}},oe=async({quiet:$=!1,payload:_=null}={})=>{if(!f){f=!0,!S&&k==="judgment_download"&&et();try{S=_||await G.judgmentDownloadStatus(),T=null}catch(I){T=I.message||"\u8B80\u53D6\u6708\u4EFD\u72C0\u614B\u5931\u6557\u3002",$||N(T,"danger",7e3)}finally{f=!1,k==="judgment_download"&&et()}}},me=async({quiet:$=!0,force:_=!1,payload:I=null}={})=>{if(!fe){if(t){fe=!1,ve=new Error("\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B Qdrant \u5BB9\u5668\u3001volume \u8207\u4E3B\u6A5F\u5132\u5B58\u8CC7\u8A0A\u3002"),k==="index_versions"&&yt();return}if(!(!_&&Q&&Date.now()-se<3e4)){fe=!0;try{Q=I||await G.systemUsage(),ve=null,se=Date.now()}catch(ce){ve=ce.message||"\u7121\u6CD5\u53D6\u5F97 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002",$||N(ve,"danger",7e3)}finally{fe=!1,k==="index_versions"&&yt()}}}},Fe=async({quiet:$=!0,force:_=!1,payload:I=null}={})=>{if(!q&&!(!_&&L&&Date.now()-K<6e4)){q=!0;try{L=I||await G.checkCourts(),E=null,K=Date.now()}catch(ce){E=ce.message||"\u7121\u6CD5\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u3002",$||N(E,"danger",7e3)}finally{q=!1,k==="normalize_courts"&&yt()}}},Oe=async({quiet:$=!0,force:_=!1,button:I=null,payload:ce=null}={})=>{if(!H&&!(!_&&de&&Date.now()-Te<6e4)){H=!0,I&&Re(I,!0,"\u6AA2\u67E5\u4E2D\u2026");try{if(de=ce||await G.checkLawVersions(),ie=null,Te=Date.now(),!$){let re=de.totals||{},X=Number(re.needs_backfill_versions)||0,we=Number(re.backfillable_versions)||0,Z=Number(re.blocked_versions)||0;X>0?N(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u9700\u8981\u5EFA\u7ACB ${X} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF08\u53EF\u5EFA\u7ACB ${we}\u3001\u7F3A\u539F\u59CB\u6A94 ${Z}\uFF09\u3002`,Z>0?"danger":"warn",7e3):N(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D ${Number(re.versions)||0} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`,"ok",5e3)}}catch(re){ie=re.message||"\u7121\u6CD5\u6AA2\u67E5\u689D\u6587\u6B77\u53F2\u72C0\u614B\u3002",$||N(ie,"danger",7e3)}finally{H=!1,I&&Re(I,!1)}}},Be=$=>Array.from(o.querySelectorAll("[data-stage-key]")).find(_=>_.dataset.stageKey===$)||null,Ke=$=>{if(!$)return;Me.add($);let _=Array.from(o.querySelectorAll(".processing-wf-stage[data-processing-stage]")).find(I=>I.dataset.processingStage===$);_&&(_.open=!0,_.scrollIntoView({behavior:"smooth",block:"center"}))},it=()=>{ee&&(ee="",h.hidden=!0,o.querySelectorAll("[data-stage-key]").forEach($=>{$.classList.remove("is-stage-hovered")}))},Ye=$=>{let _=$.dataset.stageKey||"";if(!_)return;ee=_,o.querySelectorAll("[data-stage-key]").forEach(j=>{j.classList.toggle("is-stage-hovered",j.dataset.stageKey===_)});let I=$.dataset.stageStatusKey||"idle",ce=$.dataset.stageStatus||Es(I).label,re=$.dataset.stageColor||"var(--accent)",X=Number($.dataset.stageUpdate)||0,we=Number($.dataset.stagePending)||0,Z=$.dataset.stageContributionLabel||"\u6574\u9AD4\u5360\u6BD4";h.innerHTML=`<div class="processing-stage-tooltip-head">
      <span class="processing-stage-tooltip-swatch" style="background:${r(re)}"></span>
      <strong>${r($.dataset.stageLabel||_)}</strong>
      ${Wt(I,ce)}
    </div>
    <div class="processing-stage-tooltip-meta">
      <span>\u968E\u6BB5\u9032\u5EA6 <strong>${r($.dataset.stagePercent||"\u2014")}</strong></span>
      <span>${r(Z)} <strong>${r($.dataset.stageContribution||"\u2014")}</strong></span>
      <span class="mono">${r($.dataset.stageDuration||"\u2014")}</span>
    </div>
    <div class="processing-stage-tooltip-counts">${r($.dataset.stageCounts||"\u2014")}</div>
    ${X||we?`<div class="processing-stage-tooltip-badges">
            ${X?`<span class="processing-wf-count is-update">${m("refresh",11)}<strong>${c(X)}</strong><span>\u53EF\u66F4\u65B0</span></span>`:""}
            ${we?`<span class="processing-wf-count is-pending">${m("clock",11)}<strong>${c(we)}</strong><span>\u5F85\u57F7\u884C</span></span>`:""}
          </div>`:""}
    ${$.dataset.stageMessage?`<div class="processing-stage-tooltip-message">${r($.dataset.stageMessage)}</div>`:""}`,h.hidden=!1;let pe=Math.min(300,Math.max(220,window.innerWidth-24));h.style.width=`${pe}px`;let Ae=$.getBoundingClientRect(),Ne=Math.min(window.innerWidth-pe-12,Math.max(12,Ae.left)),g=Ae.top-h.offsetHeight-10,A=g>=12?g:Math.min(window.innerHeight-h.offsetHeight-12,Ae.bottom+10);h.style.left=`${Ne}px`,h.style.top=`${Math.max(12,A)}px`},la=$=>{if($.target.closest(".is-failure-tip")){it();return}if($.target.closest(".processing-wf-rail"))return;let _=$.target.closest("[data-stage-key]");!_||!o.contains(_)||_.contains($.relatedTarget)||Ye(_)},Ca=$=>{let _=$.target.closest("[data-stage-key]");if(!_||!o.contains(_)||_.contains($.relatedTarget))return;let I=$.relatedTarget?.closest?.("[data-stage-key]");I&&I.dataset.stageKey===_.dataset.stageKey||it()},Gn=$=>Array.isArray($?.active_runs)&&$.active_runs.length||($?.workflows||[]).some(_=>_.active_run)?!0:String($?.update?.status||"")==="running",Pa=()=>{o.querySelectorAll('[data-processing-action="stop"]').forEach($=>Re($,!0,"\u505C\u6B62\u4E2D\u2026")),d&&Re(d,!0,"\u505C\u6B62\u4E2D\u2026")},Qn=()=>{o.querySelectorAll('[data-processing-action="stop"]').forEach($=>Re($,!1)),d&&Re(d,!1)},ca=new Set(["refresh","open-stage","refresh-judgment-months","refresh-court-check","refresh-law-version-check"]),Qs=()=>{t&&(i.querySelectorAll("[data-processing-action]").forEach($=>{ca.has($.dataset.processingAction||"")||("disabled"in $&&($.disabled=!1),$.removeAttribute("disabled"),$.classList.add("is-demo-locked"),$.setAttribute("aria-disabled","true"),$.removeAttribute("title"),$.dataset.demoLockTooltip="\u5C55\u793A\u6A21\u5F0F\u50C5\u4F9B\u6AA2\u8996\uFF0C\u57F7\u884C\u8207\u8A2D\u5B9A\u7531\u7BA1\u7406\u8005\u64CD\u4F5C")}),i.querySelectorAll("[data-ollama-action], [data-processing-embedding-select]").forEach($=>{$.disabled=!0,$.classList.add("is-demo-locked"),$.removeAttribute("title"),$.dataset.demoLockTooltip="\u5C55\u793A\u6A21\u5F0F\u50C5\u4F9B\u6AA2\u8996"}))},ps=$=>{let _=$.capabilities||{};u&&!Gn($)&&(u=!1,Qn()),!p&&d&&(d.hidden=!_.can_stop_update),u&&Pa(),Qs()},yt=()=>{if(!b)return;b.slim&&Lt({silent:!0,cached:!0});let $=Rn(b,k,$e(),Me);$!==w&&(ys(o,$),w=$),et(),ot(),Ue(),wt(b),Qs()},da=($,{silent:_=!1}={})=>{if(y||!$||$.slim&&b&&!b.slim)return;let I=Date.parse($.generated_at||""),ce=Date.parse(b?.generated_at||"");if(Number.isFinite(I)&&Number.isFinite(ce)&&I<ce)return;if(ts){let pe=($.workflows||[]).find(Ae=>Ae.id===ts);Cn(pe,Ts)&&(ts="",Ts="")}b=$,window.dispatchEvent(new CustomEvent("judgment:processing-pending",{detail:{count:Number($.capabilities?.unprocessed_archives)||0,index_pending:Number($.capabilities?.index_pending_months)||0,legal_index_pending:Number($.capabilities?.legal_index_pending_count)||0}}));let re=new Map;for(let pe of $.sections||[])for(let Ae of pe.stages||[])re.set(`${pe.key}-${Ae.key}`,Ae);for(let[pe,Ae]of es){if(Ae.kind!=="upgrade")continue;let Ne=re.get(pe);if(Ne){if(Ne.phase==="failed"||Ne.phase==="running"&&Ne.percent!==null){es.delete(pe);continue}if(Ne.phase==="completed"){let g=Date.parse(Ne.last_run?.started_at||"");Number.isFinite(g)&&g>=Number(Ae.startedAt||0)-1e3&&es.delete(pe)}}}let X=Nn($,k);X!==M&&(ys(l,X),M=X);let we=Rn($,k,$e(),Me);if(we!==w&&(ys(o,we),w=we),et(),ot(),ee){let pe=Be(ee);pe?Ye(pe):it()}let Z=o.querySelector("[data-processing-updated-at]");if(Z){let pe=Se($.generated_at);Z.textContent!==pe&&(Z.textContent=pe)}if(ps($),Ue(),wt($),!t&&!B&&!qe&&Qe({quiet:!0}),J.length){let pe=J.splice(0);for(let Ae of pe)Ia(Ae)}},Ws=$=>{if(z=$,typeof requestAnimationFrame>"u"){let _=z;z=null,_&&ua(_);return}P||(P=requestAnimationFrame(()=>{P=0;let _=z;z=null,_&&ua(_)}))},Ia=$=>{if(!$)return;if(!b){J.push($),J.length>100&&J.shift();return}let _=String($.run_id||""),I=Number($.seq)||0;if(_&&_===F&&I>0&&I<=W)return;_&&_!==F&&(F=_,W=0),I>0&&(W=I);let ce=String($.workflow_id||"judgment_import"),re=String($.month||"").replace(/\D/g,"").slice(0,6),X=(b.workflows||[]).find(g=>g.id===ce);if(!X)return;X.progress||(X.progress={stages:[]}),Array.isArray(X.progress.stages)||(X.progress.stages=[]);let we=String($.stage||""),Z=we?X.progress.stages.find(g=>String(g.key)===we):null,pe=String(X.progress.run_id||"")===String($.run_id||"");if(Z&&$.type==="stage_progress"){let g=Number($.current),A=Number(Z.current);pe&&$.status==="running"&&Number.isFinite(g)&&Number.isFinite(A)&&g<A||($.status&&(Z.status=String($.status)),$.current!==void 0&&(Z.current=Number($.current)||0),$.total!==void 0&&(Z.total=Number($.total)||0),$.percent!==void 0&&(Z.percent=Number($.percent)||0),$.message&&(Z.message=String($.message)))}if(Z&&$.extra&&typeof $.extra=="object")for(let g of["financial_processed","financial_matched","financial_percent"])$.extra[g]!==void 0&&(Z[g]=Number($.extra[g])||0);if($.type==="stage_progress"&&$.overall_percent!==void 0){let g=Number($.overall_percent)||0,A=Number(X.progress.overall_percent)||0;X.progress.overall_percent=pe?Math.max(A,g):g}$.type!=="run_finished"&&(X.progress.run_status="running"),($.type==="archive_started"||$.type==="stage_progress")&&!X.active_run&&$.run_id&&(X.active_run={id:$.run_id,status:"running",started_at:$.timestamp,message:$.message||""}),$.type==="run_finished"&&(X.active_run=null,X.progress.run_status=String($.status||"success"),X.can_run=!0);let Ae=[];re&&$.month_stages&&Ae.push({month:re,import_stages:$.month_stages,import_overall:$.month_overall||""});let Ne=null;if($.type==="archive_started"&&re){let g=Date.parse($.timestamp||"");Ne={active_month:re,active_archive:$.archive,active_phase:$.stage||"filter",processing_month:re,processing_archive:$.archive,run_id:$.run_id,run_status:"running",state_mtime_ns:Number.isFinite(g)?g*1e6:Date.now()*1e6}}else $.type==="run_finished"&&(Ne={...b.active_import||{},run_status:String($.status||"success")});Ws({live:!0,generated_at:$.timestamp,workflows:[{id:ce,active_run:X.active_run,last_run:X.last_run,progress:X.progress,can_run:X.can_run}],import_timeline_months:Ae,active_import:Ne})},ua=$=>{if(y||!$||!b)return;let _=new Map(($.workflows||[]).map(Z=>[Z.id,Z]));if(ts){let Z=_.get(ts);Cn(Z,Ts)&&(ts="",Ts="")}for(let Z of b.workflows||[]){let pe=_.get(Z.id);if(pe){if("active_run"in pe&&(Z.active_run=pe.active_run),"last_run"in pe&&(Z.last_run=pe.last_run),Array.isArray(pe.recent_runs)&&(Z.recent_runs=pe.recent_runs),"index_runtime"in pe){let Ae=pe.index_runtime;Ae&&!Ae.active_coverage&&Z.index_runtime?.active_coverage&&(Ae.active_coverage=Z.index_runtime.active_coverage),Ae&&!Ae.active_archive_coverage&&Z.index_runtime?.active_archive_coverage&&(Ae.active_archive_coverage=Z.index_runtime.active_archive_coverage),Z.index_runtime=Ae}if(pe.progress){let Ae=pe.progress,Ne=Z.progress;if(Z.id==="judgment_import"&&Ne?.run_id&&Ne.run_id===Ae.run_id){let g=new Map((Ne.stages||[]).map(A=>[String(A.key),A]));for(let A of Ae.stages||[]){let j=g.get(String(A.key));j&&A.status==="running"&&Number(A.current)<Number(j.current)&&(A.current=j.current,A.total=j.total,A.percent=j.percent,A.message=j.message)}Ae.overall_percent=Math.max(Number(Ne.overall_percent)||0,Number(Ae.overall_percent)||0)}Z.progress=Ae}typeof pe.can_run=="boolean"&&(Z.can_run=pe.can_run)}}let I=Z=>{if(!Z||!Array.isArray($.import_timeline_months))return;let pe=new Map((Z.months||[]).map(Ne=>[String(Ne.month),Ne]));for(let Ne of $.import_timeline_months){let g=pe.get(String(Ne.month));g&&(g.import_stages={...g.import_stages||{},...Ne.import_stages||{}},Ne.import_stage_progress&&(g.import_stage_progress={...g.import_stage_progress||{},...Ne.import_stage_progress||{}}),Ne.import_overall&&(g.import_overall=Ne.import_overall))}let Ae={complete:0,incomplete:0,processing:0,empty:0};for(let Ne of Z.months||[]){let g=String(Ne.import_overall||"empty");Ae[g]=Number(Ae[g]||0)+1}Z.stage_summary=Ae};(Z=>{let pe=(Z.workflows||[]).find(ke=>ke.id==="index_versions"),Ae=pe?.index_runtime;if(!Ae||!Array.isArray(Ae.months))return;let Ne=(Z.file_timelines||[]).find(ke=>ke.key==="judgment");if(!Ne||!Array.isArray(Ne.months))return;let g=(pe.progress?.stages||[]).find(ke=>ke.key==="validate"),A=["success","no_change"].includes(String(Ae.run_status||""))||String(Ae.run_status||"")!=="running"&&/alias\s*已切換/.test(String(g?.message||"")),j=String(Ae.current?.month||""),U=new Map(Ne.months.map(ke=>[String(ke.month),ke]));for(let ke of Ae.months){let Ce=U.get(String(ke.month||""));if(!Ce)continue;let xe=Ce.stages||(Ce.stages={}),lt=String(ke.status||"");lt==="running"||String(ke.month)===j?(xe.qdrant="processing",Ce.overall="processing"):lt==="success"&&xe.qdrant!=="complete"&&(xe.qdrant=A?"complete":"incomplete",Ce.overall=A?"complete":"incomplete")}let be={complete:0,incomplete:0,processing:0,empty:0,update:0};for(let ke of Ne.months){let Ce=String(ke.overall||"empty");be[Ce]=Number(be[Ce]||0)+1,ke.has_update&&(be.update+=1)}Ne.summary=be})(b),I(b.import_timeline);for(let Z of b.workflows||[])Z.id==="judgment_import"&&I(Z.import_timeline);$.active_import&&(b.active_import=$.active_import),$.mode&&(b.mode=$.mode),$.generated_at&&(b.generated_at=$.generated_at);let re=Nn(b,k);re!==M&&(ys(l,re),M=re);let X=Rn(b,k,$e(),Me);X!==w&&(ys(o,X),w=X),et(),ot(),Ue(),wt(b),ps(b);let we=o.querySelector("[data-processing-updated-at]");if(we&&$.generated_at){let Z=Se($.generated_at);we.textContent!==Z&&(we.textContent=Z)}},Lt=async({silent:$=!1,cached:_=!1,slim:I=!1}={})=>{if(!(y||v)){v=!0;try{let ce=await G.processing({cached:_,slim:I});I&&n(ce),da(ce,{silent:$})}catch(ce){if(y)return;let re=Kp(ce.message,b);re!==w&&(ys(o,re),w=re),$||N(ce.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{v=!1}}},Wn=async($,_="")=>{if(p)return;p=!0,Re($,!0,"\u6AA2\u67E5\u4E2D\u2026");let I=Pn[_]||"",ce=String($.dataset.sourceTypes||"").split(",").map(we=>we.trim()).filter(Boolean),re=ce.length?ce:I?[I]:[],X=$.dataset.stageId||"";X&&(es.set(X,{kind:"check",phase:"updating",startedAt:Date.now()}),yt());try{let we=await G.checkUpdates(re);if(we&&we.checking)X&&(es.delete(X),yt()),N("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u8ACB\u7A0D\u5F8C\u91CD\u65B0\u6574\u7406\u3002","info",6e3);else if(re.length===1){let Z=(we.sources||{})[re[0]]||{},pe=Tl[_]||(re[0]==="judgment"?"\u5224\u6C7A":re[0]==="law"?"\u6CD5\u898F":re[0]==="order"?"\u547D\u4EE4":"\u8CC7\u6599");Z.status==="error"?N(Z.message||`${pe}\u7248\u672C\u6AA2\u67E5\u5931\u6557`,Z.details?.retryable?"warn":"danger",8e3):N(Z.update_available?`${pe}\u7DDA\u4E0A\u5DF2\u6709\u66F4\u65B0\u7248\u672C\u3002`:`${pe}\u7DDA\u4E0A\u5DF2\u662F\u6700\u65B0\u7248\u672C\u3002`,Z.update_available?"warn":"ok",6e3)}else if(re.length>1){let Z=we.sources||{},pe=re.filter(Ne=>Z[Ne]?.update_available),Ae=re.filter(Ne=>Z[Ne]?.status==="error");if(Ae.length){let Ne=Z[Ae[0]]||{};N(Ne.message||`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF0C\u4F46\u6709 ${Ae.length} \u9805\u6AA2\u67E5\u5931\u6557\u3002`,Ne.details?.retryable?"warn":"danger",8e3)}else N(pe.length?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${pe.length} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",pe.length?"warn":"ok",6e3)}else{let Z=Number(we.update_count)||0;N(Z>0?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${Z} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",Z>0?"warn":"ok",6e3)}if(!(we&&we.checking))for(let Z of re)pi(Tp[Z]);X&&(es.set(X,{kind:"check",phase:"updated",startedAt:Date.now()}),yt()),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await Lt({silent:!0})}catch(we){X&&(es.delete(X),yt()),N(we.message||"\u66F4\u65B0\u6AA2\u67E5\u5931\u6557\u3002","danger",7e3)}finally{p=!1,Re($,!1),b&&ps(b)}},Da=async $=>{let _=Pn[$]||"";if(!_)return!0;let I=null;try{I=await G.checkUpdates([_])}catch(re){return N(`\u7121\u6CD5\u5B8C\u6210\u7248\u672C\u6AA2\u67E5\uFF08${re.message||"\u7DB2\u8DEF\u932F\u8AA4"}\uFF09\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002`,"warn",7e3),!0}if(!I||I.checking)return I&&I.checking&&N("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","info",6e3),!0;let ce=(I.sources||{})[_];if(!ce)return!0;if(window.dispatchEvent(new CustomEvent("judgment:updates-changed")),ce.status==="up_to_date"&&!ce.update_available){let re=Tl[$]||"\u8CC7\u6599",X=ce.checked_at?`\uFF08${Se(ce.checked_at)} \u6AA2\u67E5\uFF09`:"",we=Ep[$]||"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u55CE\uFF1F";return window.confirm(`${re}\u7DDA\u4E0A\u6AA2\u67E5\u70BA\u6700\u65B0\u7248\u672C${X}\u3002

${we}`)}return ce.status==="error"&&N(ce.message||"\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002",ce.details?.retryable?"warn":"danger",8e3),!0},as=async($,_)=>{if(p)return;p=!0;let I=(b?.workflows||[]).find(X=>X.id===_);Ts=I?.active_run?.id||I?.last_run?.id||"",ts=_,Pn[_]&&Pl(_),Re($,!0,"\u57F7\u884C\u4E2D"),yt();let ce=$.dataset.stageId||"",re=!1;try{if(!await Da(_))return;ce&&(es.set(ce,{kind:"upgrade",phase:"upgrading",startedAt:Date.now()}),yt());let we;try{we=await G.startProcessingWorkflow(_)}catch(Z){throw ce&&(es.delete(ce),yt()),Z}re=!0,N(`\u5DF2\u555F\u52D5\u300C${I?.label||_}\u300D\u6D41\u7A0B\u3002`,"ok",6e3),we&&we.run_id&&console.info("processing workflow started",we),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),Lt({silent:!0}),window.setTimeout(()=>{if(ts!==_)return;let Z=(b?.workflows||[]).find(pe=>pe.id===_);Cn(Z,Ts)||(ts="",Ts="",b&&(ps(b),w="",yt())),Lt({silent:!0})},12e4)}catch(X){N(X.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{p=!1,re||pi(_),(!re||ts!==_)&&(ts="",Ts="",b?(ps(b),w="",yt()):Re($,!1))}},ms=async $=>{if(!(p||u)){p=!0,u=!0,Re($,!0,"\u505C\u6B62\u4E2D\u2026");try{let _=await G.stopProcessingUpdate();for(let[I,ce]of es)ce.kind==="upgrade"&&es.delete(I);yt(),Lt({silent:!0}),N(_.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3)}catch(_){u=!1,Re($,!1),N(_.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{p=!1,u?Pa():b&&ps(b)}}},pa=$=>{let _=$.target.closest("[data-processing-action]");if(!_||_.disabled)return;if(t&&!ca.has(_.dataset.processingAction||"")){$.preventDefault(),$.stopPropagation(),N("\u5C55\u793A\u6A21\u5F0F\u50C5\u4F9B\u6AA2\u8996\uFF0C\u57F7\u884C\u8207\u8A2D\u5B9A\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002","info",4e3);return}_.closest(".processing-wf-rail")&&($.preventDefault(),$.stopPropagation());let I=_.dataset.processingAction;if(I==="run-workflow"&&b?.capabilities?.can_start_workflow===!1){$.preventDefault(),$.stopPropagation(),N(b.capabilities.start_blocked_reason||"\u76EE\u524D\u6709\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","info",5e3);return}if(I==="refresh")Lt({silent:!1,cached:t});else if(I==="open-stage")Ke(_.dataset.stageId||"");else if(I==="refresh-judgment-months")oe({quiet:!1});else if(I==="refresh-index-storage")me({quiet:!1,force:!0});else if(I==="refresh-court-check")Fe({quiet:!1,force:!0});else if(I==="refresh-law-version-check")Oe({quiet:!1,force:!0,button:_});else if(I==="refresh-ollama")Qe({quiet:!1,button:_});else if(I==="refresh-embedding-models")Qe({quiet:!1,button:_});else if(I==="select-embedding-model"){let ce=_.dataset.hostId||"",re=_.dataset.model||"";tt(`${ce}|${re}`)}else if(I==="move-ollama-host"){let ce=B?.hosts||[],re=ce.findIndex(pe=>Number(pe.id)===Number(_.dataset.hostId)),X=_.dataset.direction,we=X==="up"?re-1:X==="down"?re+1:-1;if(re<0||we<0||we>=ce.length)return;let Z=ce.map(pe=>Number(pe.id));[Z[re],Z[we]]=[Z[we],Z[re]],Bt(Z)}else if(I==="check-updates")Wn(_,_.dataset.workflowId||"");else if(I==="run-workflow"){let ce=_.dataset.workflowId||"";as(_,ce)}else I==="stop"&&ms(_)},ma=($,{scroll:_=!1}={})=>{if(k=$||"overview",b){let I=Nn(b,k);ys(l,I),M=I;let ce=Rn(b,k,$e(),Me);if(ys(o,ce),w=ce,et(),ot(),Ue(),wt(b),ee){let re=Be(ee);re?Ye(re):it()}Qs(),_&&o.scrollIntoView({behavior:"smooth",block:"start"})}!t&&li.has(k)&&Qe({quiet:!0}),k==="judgment_download"&&oe({quiet:!0}),k==="index_versions"&&(t?(ve=new Error("\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B Qdrant \u5BB9\u5668\u3001volume \u8207\u4E3B\u6A5F\u5132\u5B58\u8CC7\u8A0A\u3002"),fe=!1,yt()):me({quiet:!0})),k==="normalize_courts"&&Fe({quiet:!0}),k==="backfill_law_articles"&&Oe({quiet:!0})},Ba=$=>{let _=$.target.closest("[data-processing-workflow]");_&&ma(_.dataset.processingWorkflow||"overview")},Fa=$=>{let _=$.target.closest("[data-timeline-workflow]");_&&($.preventDefault(),ma(_.dataset.timelineWorkflow||"",{scroll:!0}))},Js=$=>{let _=$.target.closest?.(".index-wf-stage[data-index-stage]");if(_&&o.contains(_)){let X=_.dataset.indexStage||"";X&&(_.open?ci.add(X):ci.delete(X));return}let I=$.target.closest?.(".workflow-wf-stage[data-workflow-wf-stage]");if(I&&o.contains(I)){let X=I.dataset.workflowWfStage||"";X&&(I.open?di.add(X):di.delete(X));return}let ce=$.target.closest?.(".processing-wf-stage[data-processing-stage]");if(!ce||!o.contains(ce))return;let re=ce.dataset.processingStage||"";re&&(ce.open?Me.add(re):Me.delete(re))};i.addEventListener("click",pa),l.addEventListener("click",Ba),o.addEventListener("click",Fa),o.addEventListener("pointerover",la),o.addEventListener("pointerout",Ca),o.addEventListener("pointerdown",Y),o.addEventListener("toggle",Js,!0),window.addEventListener("scroll",it,{capture:!0,passive:!0});let Vs=a();Vs&&da(Vs,{silent:!0});let Jn=Lt({silent:!0,cached:!0,slim:!0});return ne(),await Jn,()=>{y=!0,he(),_e&&(window.clearInterval(_e),_e=null),i.removeEventListener("click",pa),l.removeEventListener("click",Ba),o.removeEventListener("click",Fa),x(),o.removeEventListener("pointerover",la),o.removeEventListener("pointerout",Ca),o.removeEventListener("pointerdown",Y),o.removeEventListener("toggle",Js,!0),window.removeEventListener("scroll",it,{capture:!0})}}var Si={};gs(Si,{render:()=>ug});var yi={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u522A\u9664\uFF0F\u9000\u5F79",badge:"badge-neutral"}},us={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},ia={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},Zl={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function Ea(e){let t=yi[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${r(t.label)}</span>`}function wi(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function jm(e){return wi(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",source_type:a||""}})}function Tm(e){return wi(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",article_no:a||""}})}function Em(e){return wi(e).map(t=>({jid:t.trim()}))}function Nm(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function Rm(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function Cm(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function Pm(e){return(e?.tags||[]).join(", ")}function Ta(e){return`<div class="qb-empty">${m("info",18)}<span>${r(e)}</span></div>`}function _i(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),n=[...t.map(i=>`<span class="chip">${r(i)}</span>`),...s.map(i=>`<span class="chip">${r(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${r(i)}</span>`)];return n.length?`<div class="chips qb-labels">${n.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function ki(){return`<details class="qb-import">
    <summary>${m("upload",14)}JSON \u6279\u6B21\u532F\u5165</summary>
    <p class="qb-muted">\u683C\u5F0F\uFF1A<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>\u3002\u76F8\u540C\u984C\u76EE fingerprint \u9810\u8A2D\u66F4\u65B0\u3002</p>
    <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
    <div class="qb-actions">
      <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${m("upload",13)}<span>\u532F\u5165 JSON</span></button>
    </div>
  </details>`}function Im(e){let t=e?.item||{},s=Array.isArray(e?.warnings)?e.warnings:[],a=Array.isArray(t.tags)?t.tags:[];return`<section class="report-card qb-card qb-ai-result">
    <div class="side-card-head">
      <span class="side-card-title">${m("sparkles",14)}llama-server \u5DF2\u5EFA\u7ACB\u984C\u76EE #${t.id}</span>
      ${Ea(t.status)}
    </div>
    <div class="qb-ai-answer">
      <strong>${r(t.question||"")}</strong>
      <div class="qb-ai-meta">
        ${r(us[t.question_type]||t.question_type||"")}
        \xB7 ${r(ia[t.difficulty]||t.difficulty||"")}
        \xB7 ${r(e?.model||"\u672C\u6A5F llama-server")}
      </div>
      ${_i(t)}
      ${t.reference_answer?`<div class="qb-reference"><span class="summary-label">llama-server \u53C3\u8003\u7B54\u6848</span><p>${r(t.reference_answer)}</p></div>`:""}
      ${a.length?`<div class="chips">${a.map(n=>`<span class="chip">${r(n)}</span>`).join("")}</div>`:""}
      ${s.length?`<div class="qb-ai-warnings"><strong>\u9700\u8981\u6CE8\u610F</strong><ul>${s.map(n=>`<li>${r(n)}</li>`).join("")}</ul></div>`:""}
      <div class="qb-actions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="review-ai-item">${m("shield",13)}<span>\u524D\u5F80\u9A57\u6536</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="reset-ai">${m("plus",13)}<span>\u518D\u65B0\u589E\u4E00\u984C</span></button>
      </div>
    </div>
    ${ki()}
  </section>`}function Dm(e){return e.aiResult?Im(e.aiResult):`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("sparkles",14)}AI \u984C\u5EAB\u65B0\u589E</span>
      <span class="badge badge-neutral">\u672C\u6A5F llama-server</span>
    </div>
    <form class="qb-form qb-ai-form" data-qb-form="ai-create" id="qb-create-form">
      <label class="field qb-wide">
        <span class="field-label">\u984C\u76EE <span class="field-tag">question</span></span>
        <textarea class="input" name="question" rows="4" required placeholder="\u8F38\u5165\u554F\u984C\uFF0Cllama-server \u6703\u56DE\u7B54\u4E26\u81EA\u52D5\u5224\u65B7\u984C\u578B\u3001\u96E3\u5EA6\u3001\u6CD5\u898F\uFF0F\u689D\u6587\u3001\u53C3\u8003\u7B54\u6848\u8207\u6A19\u7C64\u3002">${r(e.aiQuestion||"")}</textarea>
      </label>
      <p class="qb-form-hint">\u9001\u51FA\u5F8C\u7531\u672C\u6A5F llama-server \u56DE\u7B54\u4E26\u81EA\u52D5\u5EFA\u7ACB\u6B04\u4F4D\uFF1B\u984C\u76EE\u6703\u4EE5\u300C\u5F85\u5BE9\u300D\u5EFA\u7ACB\uFF0C\u4ECD\u9700\u4EBA\u5DE5\u8986\u6838\u5F8C\u624D\u6703\u6210\u70BA benchmark-ready\u3002</p>
      <div class="qb-actions">
        <button class="btn btn-primary" type="submit" ${e.aiLoading?"disabled":""}>${e.aiLoading?'<span class="spinner"></span><span>llama-server \u7522\u751F\u4E2D\u2026</span>':`${m("sparkles",14)}<span>\u8B93 llama-server \u7522\u751F\u4E26\u5EFA\u7ACB</span>`}</button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-ai" ${e.aiLoading?"disabled":""}>\u6E05\u9664</button>
      </div>
    </form>
    ${ki()}
  </section>`}var ec=[["clarity","\u984C\u76EE\u6E05\u6670"],["labels","\u6CD5\u689D\u6A19\u6CE8"],["answer","\u53C3\u8003\u7B54\u6848"],["difficulty","\u96E3\u5EA6\u8207\u6A19\u7C64"],["overall","\u6574\u9AD4"]];function sc(e){let t=Array.isArray(e?.reviews)?e.reviews:[],s=`<div class="side-card-head">
    <span class="side-card-title">${m("shield",14)}\u4EBA\u5DE5\u9A57\u6536\u6279\u6CE8\u5206\u6578</span>
    <span class="badge badge-neutral badge-mono">${c(t.length)} \u7B46</span>
  </div>`;if(!t.length)return`<section class="qb-review-scores-block">
      ${s}
      <div class="qb-empty qb-score-history-empty">\u5C1A\u7121\u4EBA\u5DE5\u9A57\u6536\u8A55\u5206\uFF1B\u5B8C\u6210\u9A57\u6536\u5F8C\u6703\u986F\u793A\u4E94\u9805\u5206\u6578\u8207\u6279\u6CE8\u3002</div>
    </section>`;let a=t.map(n=>{let i=n.rubric_scores||{};return`<tr>
        <td class="cell-date">${r(Se(n.created_at))}</td>
        <td>${r(n.reviewer||"\u533F\u540D")}</td>
        ${ec.map(([o])=>`<td class="cell-number"><strong class="qb-score-value ${ac(i[o])}">${r(i[o]??"\u2014")}</strong></td>`).join("")}
        <td>${Ea(n.decision==="approved"?"accepted":n.decision)}</td>
        <td class="qb-score-comment">${r(n.comment||"\u2014")}</td>
      </tr>`}).join("");return`<section class="qb-review-scores-block">
    ${s}
    <div class="table-wrap">
      <table class="data-table is-compact qb-score-history-table">
        <thead>
          <tr>
            <th scope="col">\u6642\u9593</th>
            <th scope="col">\u5BE9\u6838\u8005</th>
            ${ec.map(([,n])=>`<th scope="col" class="cell-number">${n}</th>`).join("")}
            <th scope="col">\u7D50\u679C</th>
            <th scope="col">\u6279\u6CE8</th>
          </tr>
        </thead>
        <tbody>${a}</tbody>
      </table>
    </div>
  </section>`}function Bm(e){return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("edit",14)}\u7DE8\u8F2F\u984C\u76EE #${e.id}</span>
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
          <select class="select" name="question_type">${Object.entries(us).map(([t,s])=>`<option value="${t}" ${e?.question_type===t?"selected":""}>${s}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u96E3\u5EA6</span>
          <select class="select" name="difficulty">${Object.entries(ia).map(([t,s])=>`<option value="${t}" ${e?.difficulty===t?"selected":""}>${s}</option>`).join("")}</select>
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
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${r(Nm(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${r(Rm(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${r(Cm(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${r(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${r(Pm(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
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
        <button class="btn btn-primary" type="submit">${m("check",14)}<span>\u5132\u5B58\u65B0\u7248\u672C</span></button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-create">\u6E05\u9664</button>
      </div>
      <div class="qb-form-hint">\u4FEE\u6539\u5DF2\u5B58\u5728\u7684\u984C\u76EE\u6703\u5EFA\u7ACB\u65B0\u7248\u672C\uFF1B\u5DF2\u6838\u51C6\u984C\u76EE\u4FEE\u6539\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002</div>
    </form>
    ${sc(e)}
    ${ki()}
  </section>`}function Fm(e,t){return e?Bm(e):Dm(t)}function ac(e){let t=Number(e);return!Number.isFinite(t)||t<=0?"":t>=4?"is-green":t===3?"is-yellow":"is-red"}var Om=[["clarity","\u984C\u76EE\u6E05\u6670"],["labels","\u6CD5\u689D\u6A19\u6CE8"],["answer","\u53C3\u8003\u7B54\u6848"],["difficulty","\u96E3\u5EA6\u8207\u6A19\u7C64"],["overall","\u6574\u9AD4"]];function Hm(e){let t=e?.latest_review||e?.reviews?.[0]||null;if(!t)return'<div class="qb-latest-scores is-empty">\u5C1A\u7121\u4EBA\u5DE5\u9A57\u6536\u8A55\u5206</div>';let s=t.rubric_scores||{};return`<div class="qb-latest-scores" title="${r(`${Se(t.created_at)} \xB7 ${t.reviewer||"\u533F\u540D"}`)}">
    <span class="qb-latest-scores-label">\u6700\u65B0\u8A55\u5206</span>
    ${Om.map(([a,n])=>`<span>${n} <strong class="qb-score-value ${ac(s[a])}">${r(s[a]??"\u2014")}</strong></span>`).join("")}
    <span class="qb-latest-scores-meta">${r(t.reviewer||"\u533F\u540D")} \xB7 ${r(Se(t.created_at))}</span>
  </div>`}function zm(e){let t=e.status==="retired"||!!e.deleted_at;return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${r(e.question)}</strong>
        <span class="qb-meta">
          ${r(us[e.question_type]||e.question_type)}
          \xB7 ${r(ia[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${Ea(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${_i(e)}
    <div class="qb-item-foot">
      <span>\u66F4\u65B0 ${r(Se(e.updated_at))}</span>
      ${e.reviewed_by?`<span>\u5BE9\u6838 ${r(e.reviewed_by)}</span>`:""}
      ${e.review_comment?`<span class="qb-comment">${r(e.review_comment)}</span>`:""}
      <div class="qb-actions">
        ${t?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="restore" data-id="${e.id}">${m("refresh",13)}<span>\u5FA9\u539F\u984C\u76EE</span></button>`:`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${m("edit",13)}<span>\u7DE8\u8F2F</span></button>
               ${["pending_review","changes_requested"].includes(e.status)?"":`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="submit-review" data-id="${e.id}">${m("upload",13)}<span>${e.status==="draft"?"\u9001\u5BE9":"\u91CD\u65B0\u9001\u5BE9"}</span></button>`}
               <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${e.id}">${m("shield",13)}<span>\u9A57\u6536</span></button>
               <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${m("trash",13)}<span>\u522A\u9664</span></button>`}
      </div>
      ${Hm(e)}
    </div>
  </article>`}function Um(e){return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}\u984C\u5EAB\u7BA1\u7406</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="new">${m("plus",13)}<span>\u65B0\u589E</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="revalidate">${m("refresh",13)}<span>\u91CD\u65B0\u9A57\u8B49</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="export">${m("download",13)}<span>\u532F\u51FA JSON</span></button>
      </div>
    </div>
    <form class="qb-filters" data-qb-form="filter">
      <input class="input" name="query" type="search" placeholder="\u641C\u5C0B\u984C\u76EE\u6216\u53C3\u8003\u7B54\u6848" value="${r(e.filters.query)}" />
      <select class="select" name="status">
        <option value="">\u5168\u90E8\u72C0\u614B</option>
        ${Object.entries(yi).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(us).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(ia).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <div class="qb-tag-filter" data-qb-tag-filter>
        <div class="qb-tag-values">
          ${e.filters.tags.length?e.filters.tags.map(t=>`<span class="chip qb-tag-chip">${r(t)}<button class="qb-tag-remove" type="button" data-qb-action="remove-tag" data-tag="${r(t)}" aria-label="\u79FB\u9664\u6A19\u7C64 ${r(t)}">${m("x",9)}</button></span>`).join(""):'<span class="qb-tag-placeholder">\u6A19\u7C64</span>'}
        </div>
        <button class="qb-tag-add" type="button" data-qb-action="open-tag-search" aria-label="\u52A0\u5165\u6A19\u7C64" aria-haspopup="listbox">${m("plus",13)}</button>
        ${e.filters.tags.map(t=>`<input type="hidden" name="tags" value="${r(t)}" />`).join("")}
        <div class="qb-tag-popover" data-qb-tag-popover hidden>
          <input class="input" type="search" data-qb-tag-search placeholder="\u8F38\u5165\u76F8\u8FD1\u5B57\u641C\u5C0B\u6A19\u7C64\u2026" autocomplete="off" />
          <div class="qb-tag-results" data-qb-tag-results role="listbox" aria-live="polite"></div>
        </div>
      </div>
      <button class="btn btn-primary btn-sm" type="submit">${m("search",13)}<span>\u7BE9\u9078</span></button>
    </form>
    <div class="qb-list">
      ${e.items.length?e.items.map(t=>zm(t)).join(""):Ta("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${c(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}var nc=[["queue","\u5F85\u5BE9\uFF0F\u9000\u56DE"],["accepted","\u5DF2\u6838\u51C6"],["rejected","\u5DF2\u62D2\u7D55"],["draft","\u8349\u7A3F"]];function Gm(e){let t=e.stats||{};return{queue:Number(t.pending_review||0)+Number(t.changes_requested||0),accepted:Number(t.accepted||0),rejected:Number(t.rejected||0),draft:Number(t.draft||0)}}function Qm(e,t){let s=e.reviewFilter||"queue",a={queue:{title:"\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u6216\u9000\u56DE\u4FEE\u6539\u7684\u984C\u76EE\u3002",text:t.accepted?`\u5DF2\u6709 ${c(t.accepted)} \u984C\u6838\u51C6\u3002\u65B0\u984C\u76EE\u5EFA\u7ACB\u5F8C\u6703\u81EA\u52D5\u9001\u5BE9\uFF0C\u4E5F\u53EF\u4EE5\u5207\u63DB\u5230\u300C\u5DF2\u6838\u51C6\u300D\u91CD\u65B0\u9A57\u6536\u65E2\u6709\u984C\u76EE\u3002`:"\u5EFA\u7ACB\u984C\u76EE\u5F8C\u6703\u9810\u8A2D\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\uFF1B\u82E5\u53EA\u60F3\u5148\u4FDD\u5B58\uFF0C\u5EFA\u7ACB\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5373\u53EF\u5B58\u6210\u8349\u7A3F\u3002"},accepted:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u6838\u51C6\u984C\u76EE\u3002",text:"\u984C\u76EE\u901A\u904E\u4EBA\u5DE5\u9A57\u6536\u5F8C\u6703\u5217\u5728\u9019\u88E1\uFF1B\u4E5F\u53EF\u4EE5\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u9001\u51FA\u9A57\u6536\u3002"},rejected:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u62D2\u7D55\u984C\u76EE\u3002",text:"\u88AB\u62D2\u7D55\u7684\u984C\u76EE\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u4E2D\uFF0C\u53EF\u4FEE\u6539\u5F8C\u91CD\u65B0\u9001\u5BE9\u3002"},draft:{title:"\u76EE\u524D\u6C92\u6709\u8349\u7A3F\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u984C\u76EE\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5C31\u6703\u5B58\u6210\u8349\u7A3F\uFF0C\u4E4B\u5F8C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002"}}[s]||{title:"\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u65B0\u984C\u76EE\u5F8C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"},n=[s!=="draft"?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="new">${m("plus",13)}<span>\u65B0\u589E\u984C\u76EE</span></button>`:"",s==="queue"&&t.accepted?`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="review-filter" data-filter="accepted">${m("shield",13)}<span>\u67E5\u770B\u5DF2\u6838\u51C6 ${c(t.accepted)}</span></button>`:"",`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="go-manage">${m("database",13)}<span>\u524D\u5F80\u984C\u5EAB\u7BA1\u7406</span></button>`].filter(Boolean).join("");return`<div class="qb-empty qb-empty-block">
    <span class="qb-empty-icon">${m("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>${r(a.title)}</strong>
      <p>${r(a.text)}</p>
      <div class="qb-actions">${n}</div>
    </div>
  </div>`}function Wm(e){let t=nc.find(([s])=>s===e);return t?t[1]:"\u5F85\u5BE9\uFF0F\u9000\u56DE"}function Jm(e,t){return`<button class="qb-review-item${t?" is-active":""}" type="button" data-qb-action="select-review-item" data-id="${e.id}" aria-pressed="${t?"true":"false"}">
    <span class="qb-review-item-top">
      <span class="qb-id">#${e.id}</span>
      <span class="qb-review-item-meta">
        ${r(us[e.question_type]||e.question_type)}
        \xB7 ${r(ia[e.difficulty]||e.difficulty)}
        \xB7 v${e.version}
        ${e.benchmark_ready?" \xB7 Benchmark ready":""}
        ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
      </span>
      ${Ea(e.status)}
    </span>
    <strong>${r(e.question)}</strong>
  </button>`}function Vm(e){return`<article class="qb-review-pane-card">
    <div class="qb-review-pane-head">
      <div class="qb-review-pane-title">
        <span class="qb-review-item-meta">#${e.id} \xB7 v${e.version} \xB7 ${r(us[e.question_type]||e.question_type)} \xB7 ${r(ia[e.difficulty]||e.difficulty)}</span>
        <strong>${r(e.question)}</strong>
      </div>
      <div class="qb-review-pane-side">
        ${Ea(e.status)}
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${m("edit",13)}<span>\u7DE8\u8F2F</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
        </div>
      </div>
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${_i(e)}
    ${e.review_comment?`<div class="qb-review-note"><span class="summary-label">\u6700\u8FD1\u6279\u6CE8${e.reviewed_by?` \xB7 ${r(e.reviewed_by)}`:""}</span><p>${r(e.review_comment)}</p></div>`:""}
    ${e.reference_answer?`<div class="qb-reference"><span class="summary-label">\u53C3\u8003\u7B54\u6848</span><p>${r(e.reference_answer)}</p></div>`:""}
    <form class="qb-review-form" data-qb-form="review" data-id="${e.id}">
      <div class="qb-score-grid">
        ${[["clarity","\u984C\u76EE\u6E05\u6670"],["labels","\u6CD5\u689D\u6A19\u6CE8"],["answer","\u53C3\u8003\u7B54\u6848"],["difficulty","\u96E3\u5EA6\u8207\u6A19\u7C64"],["overall","\u6574\u9AD4"]].map(([t,s])=>Ya({name:`score_${t}`,label:s,value:4})).join("")}
      </div>
      <label class="field"><span class="field-label">\u6279\u6CE8</span><textarea class="input" name="comment" rows="3" placeholder="\u6A19\u8A3B\u7406\u7531\u3001\u9700\u8981\u4FEE\u6539\u7684\u6B04\u4F4D\uFF0C\u6216\u9A57\u6536\u7D50\u8AD6\u3002"></textarea></label>
      <div class="qb-actions qb-review-decisions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="decide" data-decision="approved">${m("check",13)}<span>\u6838\u51C6</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="decide" data-decision="changes_requested">${m("edit",13)}<span>\u9000\u56DE\u4FEE\u6539</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-qb-action="decide" data-decision="rejected">${m("x",13)}<span>\u62D2\u7D55</span></button>
      </div>
    </form>
    ${sc(e)}
  </article>`}function Km(){return`<div class="qb-empty qb-empty-block qb-review-placeholder">
    <span class="qb-empty-icon">${m("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>\u5F9E\u5DE6\u5074\u9078\u64C7\u984C\u76EE</strong>
      <p>\u9EDE\u9078\u984C\u76EE\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u984C\u5E79\u3001\u9810\u671F\u6A19\u8A3B\u3001\u53C3\u8003\u7B54\u6848\u8207\u6838\u51C6\u9078\u9805\u3002</p>
    </div>
  </div>`}function Ym(e){let t=e.reviewDetail,s=Gm(e),a=e.reviewFilter||"queue",n=nc.map(([l,d])=>`<button class="chip qb-review-tab${a===l?" is-active":""}" type="button" role="tab" aria-selected="${a===l?"true":"false"}" data-qb-action="review-filter" data-filter="${l}"><span>${d}</span><span class="qb-review-tab-count">${c(s[l]||0)}</span></button>`).join(""),i=e.reviewItems.length?e.reviewItems.map(l=>Jm(l,Number(t?.id)===Number(l.id))).join(""):`<div class="qb-empty qb-empty-compact">${m("info",16)}<span>\u76EE\u524D\u6C92\u6709${r(Wm(a))}\u984C\u76EE\u3002</span></div>`,o=t?Vm(t):e.reviewItems.length?Km():Qm(e,s);return`<section class="report-card qb-card qb-review-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("shield",14)}\u984C\u5EAB\u4EBA\u5DE5\u9A57\u6536\u6279\u6CE8</span>
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
  </section>`}function ja(e){if(e==null||e==="")return"";let t=Number(e);return Number.isFinite(t)?`${Math.round(t*100)}%`:""}function Xm(e){if(!e||typeof e!="object")return"\u5F15\u7528";let t=String(e.jid||"").trim();if(t)return t;let s=String(e.law_name||"").trim(),a=String(e.article_no||"").trim(),n=`${s} ${a}`.trim();return n||String(e.title||e.text||"\u5F15\u7528").slice(0,80)}function Zm(e){let t=e?.metrics||{},s=t.scores||{},a=[["\u6CD5\u898F\u53EC\u56DE",ja(t.law_recall)],["\u689D\u6587\u53EC\u56DE",ja(t.article_recall)],["\u898F\u5247\u5206",ja(s.deterministic)],["Judge",ja(s.judge)],["\u4EBA\u5DE5",ja(s.human)]].filter(([,n])=>n);return a.length?`<div class="qb-bank-stats">${a.map(([n,i])=>`<span class="qb-bank-stat"><span>${r(n)}</span><strong>${r(i)}</strong></span>`).join("")}</div>`:""}function eg(e){let t=Array.isArray(e?.law_sources)?e.law_sources:[],s=Array.isArray(e?.citations)?e.citations:[],a=t.length?`<div class="qb-bank-sources">${t.map(i=>{let o=String(i.law_name||"\u672A\u547D\u540D\u6CD5\u898F"),l=(i.articles||[]).map(u=>String(u.article_no||"").trim()).filter(Boolean),d=`<strong>${r(o)}</strong>${l.length?`<small>${r(l.join("\u3001"))}</small>`:""}`;return i.law_url?`<a class="qb-bank-law" href="${r(Ft(i.law_url))}" target="_blank" rel="noreferrer">${d}</a>`:`<span class="qb-bank-law">${d}</span>`}).join("")}</div>`:"",n=s.length?`<div class="qb-bank-sources qb-bank-citations">${s.map(i=>`<span class="chip chip-mono">${r(Xm(i))}</span>`).join("")}</div>`:"";return!a&&!n?"":`<div class="qb-bank-answer-block">
    <div class="qb-bank-section-label"><span>\u5F15\u7528\u4F86\u6E90</span><span>${c(t.length+s.length)} \u7B46</span></div>
    ${a}${n}
  </div>`}function rc(e,t){if(!e)return`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("history",20)}</span>
      <strong>\u5C1A\u7121 RAG \u7B54\u6848</strong>
      <span>\u8DD1\u4E00\u6B21 Benchmark \u5F8C\uFF0C\u6700\u8FD1\u4E00\u6B21\u6210\u529F\u56DE\u7B54\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</span>
    </div>`;let s=Number(e.item_version||0),a=Number(t?.version||0),n=s&&a&&s!==a?`<span class="badge badge-warn">\u7B54\u6848 v${s} \xB7 \u984C\u76EE v${a}</span>`:"",i=e.answer_source==="llm"?"LLM \u751F\u6210":e.answer_source==="structured"?"\u6CD5\u898F\u8CC7\u6599\u5EAB":String(e.answer_source||"RAG");return`<div class="qb-bank-answer-meta">
      <span class="badge badge-ok"><span class="status-dot is-ok"></span>RAG \u5B8C\u6210</span>
      <span class="badge badge-neutral">${r(i)}</span>
      ${n}
      <span class="mono">${r(e.run_label||e.run_id||"")}</span>
      <span>${r(Se(e.finished_at))}</span>
      <span>${r(ge(e.duration_ms))}</span>
      ${e.llm_model?`<span class="mono">${r(e.llm_model)}</span>`:""}
    </div>
    <div class="qb-bank-answer-block">
      <div class="qb-bank-section-label"><span>\u56DE\u7B54</span><span>${c(String(e.answer||"").length)} \u5B57</span></div>
      <p class="qb-bank-answer-text">${r(String(e.answer||"").trim()||"\uFF08\u7A7A\u767D\u56DE\u7B54\uFF09")}</p>
    </div>
    ${eg(e)}
    ${Zm(e)}`}function ic(e,t){let s=e.selectedSuiteId,a=t&&e.suiteAnswers?.[String(s)]?.[String(t.id)]||null;return t?`<div class="qb-bank-answer-head">
      <div class="qb-bank-answer-heading">
        <span class="qb-bank-answer-kicker">${m("sparkles",12)}RAG \u6700\u8FD1\u4E00\u6B21\u7B54\u6848</span>
        <strong class="qb-bank-answer-question">#${t.id} ${r(t.question)}</strong>
      </div>
      ${a?`<span class="qb-bank-answer-state">${r(us[t.question_type]||t.question_type)} \xB7 v${t.version}</span>`:""}
    </div>
    ${rc(a,t)}`:`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("cube",20)}</span>
      <strong>\u9078\u64C7\u984C\u76EE</strong>
      <span>\u5F9E\u5DE6\u5074\u6E05\u55AE\u9078\u64C7\u4E00\u984C\uFF0C\u67E5\u770B\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`}function oc(e){return`<span class="qb-bank-actions">
    <button class="qb-bank-icon" type="button" data-qb-action="edit" data-id="${e.id}" title="\u7DE8\u8F2F\u984C\u76EE" aria-label="\u7DE8\u8F2F\u984C\u76EE #${e.id}">${m("edit",13)}</button>
    <button class="qb-bank-icon is-danger" type="button" data-qb-action="delete" data-id="${e.id}" title="\u5F9E\u984C\u5EAB\u79FB\u9664" aria-label="\u5F9E\u984C\u5EAB\u79FB\u9664 #${e.id}">${m("trash",13)}</button>
  </span>`}function tg(e,t,{selected:s,hasAnswer:a}){return`<div class="qb-bank-row${s?" is-active":""}" data-id="${e.id}">
    <button class="qb-bank-select" type="button" data-qb-action="select-bank-item" data-id="${e.id}" aria-pressed="${s?"true":"false"}">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <span class="qb-bank-item-copy">
        <strong>${r(e.question)}</strong>
        <small>${r(us[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${a?"\u5DF2\u6709 RAG \u7B54\u6848":"\u5C1A\u7121 RAG \u7B54\u6848"}</small>
      </span>
    </button>
    ${oc(e)}
  </div>`}function sg(e,t,s){return`<article class="qb-bank-full-item" data-id="${e.id}">
    <div class="qb-bank-full-head">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <div class="qb-bank-full-title">
        <strong>${r(e.question)}</strong>
        <small>${r(us[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${r(yi[e.status]?.label||e.status||"")}</small>
      </div>
      ${oc(e)}
    </div>
    ${rc(s,e)}
  </article>`}function tc(e){let t=e.editingSuite,s=Array.isArray(e.suites)?e.suites:[],a=s.find(p=>Number(p.id)===Number(e.selectedSuiteId))||s[0]||null,n=Array.isArray(a?.items)?a.items:[],i=e.suiteAnswers?.[String(a?.id)]||{},o=n.find(p=>Number(p.id)===Number(e.selectedBankItemId))||null,l=!!e.suiteAnswersLoading,d=String(e.suiteAnswersError||""),u=!!e.suiteManageOpen||!s.length,h=e.bankTab==="full"?"full":"split",y=s.length?`<div class="qb-bank-tabs" role="tablist" aria-label="Benchmark \u984C\u5EAB\u6AA2\u8996">
        <button class="qb-bank-tab${h==="split"?" is-active":""}" type="button" role="tab" aria-selected="${h==="split"?"true":"false"}" data-qb-action="bank-tab" data-tab="split">${m("grid",13)}<span>Benchmark \u984C\u5EAB</span><span class="badge badge-neutral">${c(n.length)}</span></button>
        <button class="qb-bank-tab${h==="full"?" is-active":""}" type="button" role="tab" aria-selected="${h==="full"?"true":"false"}" data-qb-action="bank-tab" data-tab="full">${m("table",13)}<span>\u984C\u5EAB\u5168\u5217\u8868</span><span class="badge badge-neutral">${c(n.length)}</span></button>
      </div>`:"",v="";if(!s.length)v=`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("cube",20)}</span>
      <strong>\u5C1A\u672A\u5EFA\u7ACB Benchmark \u984C\u5EAB</strong>
      <span>\u5C55\u958B\u4E0B\u65B9 Suite \u8A2D\u5B9A\u4E26\u5EFA\u7ACB\u984C\u5EAB\u5F8C\uFF0C\u5C31\u80FD\u5728\u9019\u88E1\u700F\u89BD\u984C\u76EE\u8207\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`;else if(l)v='<div class="qb-bank-loading"><span class="spinner" aria-hidden="true"></span><span>\u8B80\u53D6\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u4E2D\u2026</span></div>';else{let p=d?Ge({tone:"warn",title:"\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u8B80\u53D6\u5931\u6557",text:r(d)}):"";h==="full"?v=`${p}<div class="qb-bank-full" data-qb-bank-view="full">${n.length?n.map((b,w)=>sg(b,w,i[String(b.id)]||null)).join(""):Ta("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>`:v=`${p}<div class="qb-bank-split" data-qb-bank-view="split">
        <div class="qb-bank-list" data-qb-bank-list>${n.length?n.map((b,w)=>tg(b,w,{selected:Number(b.id)===Number(o?.id),hasAnswer:!!i[String(b.id)]})).join(""):Ta("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>
        <div class="qb-bank-answer-pane" data-qb-bank-answer>${ic(e,o)}</div>
      </div>`}return`<section class="report-card qb-card qb-bank-card">
    <div class="side-card-head qb-bank-head">
      <div class="qb-bank-heading">
        <span class="side-card-title">${m("cube",14)}Benchmark \u984C\u5EAB</span>
        <span class="qb-bank-sub">${a?`${r(a.name)} \xB7 v${a.version} \xB7 ${c(a.item_count)} \u984C`:"\u5C1A\u672A\u5EFA\u7ACB suite"}</span>
      </div>
      <div class="qb-bank-controls">
        ${s.length?`<label class="qb-suite-picker"><span>Suite</span><select class="select" data-qb-suite-select aria-label="\u9078\u64C7 benchmark suite">${s.map(p=>`<option value="${p.id}" ${Number(p.id)===Number(a?.id)?"selected":""}>${r(p.name)} \xB7 ${c(p.item_count)} \u984C</option>`).join("")}</select></label>`:""}
        ${a?`<span class="badge ${a.status==="frozen"?"badge-ok":"badge-neutral"}">${a.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>`:""}
      </div>
    </div>
    ${y}
    ${v}
    <details class="qb-suite-manage" ${u?"open":""}>
      <summary>${m("sliders",14)}Suite \u8A2D\u5B9A\u8207\u7248\u672C <span class="qb-muted">${c(s.length)} \u500B suite \xB7 ${c(e.ready.length)} \u984C benchmark-ready</span></summary>
      <div class="qb-suite-manage-body">
        <form class="qb-suite-form" data-qb-form="suite">
          <input type="hidden" name="suite_id" value="${t?.id||""}" />
          <div class="qb-form-grid">
            <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${r(t?.name||"Pilot 30")}" /></label>
            <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(Zl).map(([p,b])=>`<option value="${p}" ${t?.tier===p?"selected":""}>${b}</option>`).join("")}</select></label>
          </div>
          <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${r(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
          <div class="qb-check-list">
            ${e.ready.length?e.ready.map(p=>{let b=t?t.items?.some(w=>Number(w.id)===Number(p.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${p.id}" ${b?"checked":""}/><span><strong>#${p.id}</strong> ${r(p.question)} <small>${r(us[p.question_type]||p.question_type)}</small></span></label>`}).join(""):Ta("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
          </div>
          <div class="qb-actions">
            <button class="btn btn-primary" type="submit">${m("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
            ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
          </div>
        </form>
        <div class="qb-list">
          ${s.length?s.map(p=>`<article class="qb-suite">
            <div class="qb-item-head">
              <div class="qb-item-title"><strong>${r(p.name)}</strong><span class="qb-meta">${r(Zl[p.tier]||p.tier)} \xB7 v${p.version} \xB7 ${c(p.item_count)} \u984C</span></div>
              <span class="badge ${p.status==="frozen"?"badge-ok":"badge-neutral"}">${p.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
            </div>
            <div class="qb-suite-items">${(p.items||[]).slice(0,8).map(b=>`<span class="chip">#${b.id} ${r(b.question.slice(0,22))}${b.question.length>22?"\u2026":""}</span>`).join("")}${p.item_count>8?`<span class="qb-muted">+${p.item_count-8}</span>`:""}</div>
            <div class="qb-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${p.id}">${m("edit",13)}<span>\u7DE8\u8F2F suite</span></button>
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${p.id}">${m("shield",13)}<span>\u51CD\u7D50</span></button>
              <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${p.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
            </div>
          </article>`).join(""):Ta("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
        </div>
      </div>
    </details>
  </section>`}function ag(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),n=Number(a?.value);Number.isFinite(n)&&(t[s]=Math.max(1,Math.min(5,Math.round(n))))}return t}function ng(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:jm(t.get("expected_laws")),expected_articles:Tm(t.get("expected_articles")),expected_judgments:Em(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function lc(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},n={tab:"",editing:null,editingFrom:"",editingSuite:null,aiQuestion:"",aiLoading:!1,aiResult:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tags:[]},stats:{},suites:[],ready:[],selectedSuiteId:null,selectedBankItemId:null,bankTab:"split",suiteAnswers:{},suiteAnswersLoading:!1,suiteAnswersError:"",suiteManageOpen:!1,reviewItems:[],reviewDetail:null,reviewFilter:"queue"},i=D=>e.querySelector(`#quality-panel-${a[D]}`),o=(D,F)=>{D&&(D.childElementCount?D.setAttribute("aria-busy","true"):D.innerHTML=`<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>${F}</span></div></section>`)},l=D=>{D?.removeAttribute("aria-busy")},d=0,u=null,h=()=>"anonymous",y=()=>{s&&s(n.stats)},v=D=>{t&&t(D),ie(D)},p=async()=>{try{n.stats=await G.questionBankStats()}catch{n.stats={}}y()},b=()=>{let D=i("create");D&&(D.innerHTML=Fm(n.editing,n))},w=(D,F)=>{let W=D?.querySelector("[data-qb-tag-results]");W&&(W.innerHTML=F.length?F.map(P=>`<button class="qb-tag-option" type="button" role="option" data-qb-action="select-tag" data-tag="${r(P.tag)}"><span>${r(P.tag)}</span><small>${c(P.count)}</small></button>`).join(""):'<div class="qb-tag-empty">\u6C92\u6709\u5176\u4ED6\u76F8\u7B26\u6A19\u7C64</div>')},M=async(D,F="")=>{if(!D)return;let W=D.querySelector("[data-qb-tag-results]"),P=++d;W&&(W.innerHTML='<div class="qb-tag-loading"><span class="spinner"></span><span>\u641C\u5C0B\u6A19\u7C64\u2026</span></div>');try{let z=await G.questionBankTags(F,12);if(P!==d)return;let J=(z.tags||[]).filter($e=>!n.filters.tags.includes($e.tag));w(D,J)}catch(z){if(P!==d)return;W&&(W.innerHTML=`<div class="qb-tag-empty">${r(z.message||"\u6A19\u7C64\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},k=(D,{focus:F=!1}={})=>{if(!D)return;let W=D.querySelector("[data-qb-tag-popover]"),P=D.querySelector("[data-qb-tag-search]");!W||!P||(W.hidden&&(W.hidden=!1,P.value="",M(D,"")),F&&(P.focus(),P.select()))},S=D=>{u&&(window.clearTimeout(u),u=null);let F=D?.querySelector("[data-qb-tag-popover]");F&&(F.hidden=!0)},f=async D=>{let F=String(D||"").trim();F&&(n.filters.tags.includes(F)?n.filters.tags=n.filters.tags.filter(W=>W!==F):n.filters.tags=[...n.filters.tags,F],n.offset=0,await q())},T=()=>{let D=Array.isArray(n.suites)?n.suites:[];if(!D.length)return n.selectedSuiteId=null,n.selectedBankItemId=null,null;let F=D.find(P=>Number(P.id)===Number(n.selectedSuiteId));F||(F=D[0],n.selectedSuiteId=F.id,n.selectedBankItemId=null);let W=Array.isArray(F.items)?F.items:[];return W.some(P=>Number(P.id)===Number(n.selectedBankItemId))||(n.selectedBankItemId=W[0]?.id??null),F},V=()=>{let D=i("suite");D&&(D.innerHTML=tc(n))},Q=0,fe=async(D,{force:F=!1}={})=>{if(!D)return;let W=++Q;if(!F&&n.suiteAnswers[String(D)]){n.suiteAnswersLoading=!1,n.suiteAnswersError="",V();return}n.suiteAnswersLoading=!0,n.suiteAnswersError="",V();try{let P=await G.benchmarkSuiteLatestAnswers(D);if(W!==Q)return;n.suiteAnswers[String(D)]=P.answers||{}}catch(P){if(W!==Q)return;n.suiteAnswersError=P.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}finally{W===Q&&(n.suiteAnswersLoading=!1,V())}},ve=async D=>{n.selectedSuiteId=D,n.selectedBankItemId=null,n.suiteAnswersError="";let F=T();if(!F){V();return}await fe(F.id)},se=D=>{n.bankTab=D==="full"?"full":"split",V()},L=()=>{let D=i("suite");if(!D)return;let F=T(),P=(Array.isArray(F?.items)?F.items:[]).find(J=>Number(J.id)===Number(n.selectedBankItemId))||null;for(let J of D.querySelectorAll(".qb-bank-row")){let $e=Number(J.dataset.id)===Number(n.selectedBankItemId);J.classList.toggle("is-active",$e);let De=J.querySelector("[data-qb-action='select-bank-item']");De&&De.setAttribute("aria-pressed",$e?"true":"false")}let z=D.querySelector("[data-qb-bank-answer]");z&&(z.innerHTML=ic(n,P))},q=async()=>{let D=i("manage");if(D){u&&(window.clearTimeout(u),u=null),o(D,"\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026");try{let F=await G.questionBankItems({...n.filters,...n.filters.status==="retired"?{include_deleted:!0}:{}},n.limit,n.offset);n.items=F.items||[],n.total=Number(F.total||0),n.stats=F.stats||n.stats,l(D),D.innerHTML=Um(n),y()}catch(F){l(D),D.innerHTML=`<section class="report-card qb-card">${Ge({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(F.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},E=async({refreshAnswers:D=!1}={})=>{let F=i("suite");if(F){o(F,"\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026");try{let[W,P]=await Promise.all([G.benchmarkSuites(),G.benchmarkReadyQuestions(300)]);n.suites=W.suites||[],n.ready=P.items||[];let z=T();if(n.suiteAnswersError="",n.suiteAnswersLoading=!1,z&&(D||!n.suiteAnswers[String(z.id)]))try{let J=await G.benchmarkSuiteLatestAnswers(z.id);n.suiteAnswers[String(z.id)]=J.answers||{}}catch(J){n.suiteAnswersError=J.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}l(F),F.innerHTML=tc(n)}catch(W){l(F),F.innerHTML=`<section class="report-card qb-card">${Ge({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(W.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},K=()=>{let D=i("review");D&&(D.innerHTML=Ym(n))},de=async D=>{let F=n.reviewItems.find(P=>Number(P.id)===Number(D));if(!F)return;n.reviewDetail=F,K();let W=i("review")?.querySelector(".qb-review-detail-pane");W&&window.matchMedia("(max-width: 1020px)").matches&&W.scrollIntoView({behavior:"smooth",block:"start"});try{let P=await G.questionBankItem(F.id);Number(n.reviewDetail?.id)===Number(F.id)&&(n.reviewDetail=P,K())}catch(P){N(P.message||"\u984C\u76EE\u5167\u5BB9\u8B80\u53D6\u5931\u6557\u3002","danger")}},H=async()=>{let D=i("review");if(!D)return;o(D,"\u8B80\u53D6\u9A57\u6536\u984C\u76EE\u4E2D\u2026");let F=n.reviewFilter||"queue",W=F==="queue"?["pending_review","changes_requested"]:F==="accepted"?["accepted"]:F==="rejected"?["rejected"]:["draft"];try{let P=await Promise.all(W.map(De=>G.questionBankItems({status:De},200,0)));n.reviewItems=P.flatMap(De=>De.items||[]),n.stats=P[0]?.stats||n.stats;let z=Number(n.reviewDetail?.id||0),$e=n.reviewItems.some(De=>Number(De.id)===z)?z:Number(n.reviewItems[0]?.id||0);n.reviewDetail=$e?await G.questionBankItem($e):null,l(D),K(),y()}catch(P){l(D),D.innerHTML=`<section class="report-card qb-card">${Ge({tone:"danger",title:"\u9A57\u6536\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:r(P.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}};function ie(D){let F=n.tab;n.tab=D;for(let W of Object.keys(a)){let P=i(W);P&&(P.hidden=W!==D)}D==="create"?(F!=="create"&&!n.editing&&(n.aiQuestion="",n.aiResult=null),b()):D==="manage"?q():D==="suite"?E():D==="review"&&H()}let Te=D=>{let W=[...n.items,...n.reviewItems,...n.reviewDetail?[n.reviewDetail]:[]].find(z=>Number(z.id)===Number(D));n.reviewDetail=W||{id:Number(D)};let P=W?.status;["accepted","rejected","draft"].includes(P)?n.reviewFilter=P:P&&(n.reviewFilter="queue"),v("review")},B=async D=>{let F=ng(D),W=Number(D.elements.item_id?.value||0);W||(F.status=D.elements.submit_for_review?.checked?"pending_review":"draft");try{W?(await G.updateQuestionBankItem(W,{...F,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),N("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await G.createQuestionBankItem(F),N(F.status==="draft"?"\u984C\u76EE\u5DF2\u5B58\u70BA\u8349\u7A3F\uFF0C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002":"\u984C\u76EE\u5DF2\u5EFA\u7ACB\u4E26\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok")),n.editing=null;let P=["manage","suite","review"].includes(n.editingFrom)?n.editingFrom:"manage";n.editingFrom="",n.suiteAnswers={},await p(),v(P)}catch(P){let z=P.detail||P.payload?.detail,J=z?.errors?.join(" \xB7 ")||z?.message||P.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";N(J,"danger",8e3)}},qe=async D=>{let F=String(new FormData(D).get("question")||"").trim();if(F.length<4){N("\u984C\u76EE\u81F3\u5C11\u9700\u8981 4 \u500B\u5B57\u3002","danger");return}n.aiQuestion=F,n.aiLoading=!0,n.aiResult=null,b();try{let W=await G.createQuestionBankItemWithAI({question:F});n.aiResult=W,n.aiQuestion="",await p(),N(`llama-server \u5DF2\u5EFA\u7ACB\u984C\u76EE #${W.item.id}\uFF0C\u72C0\u614B\u70BA\u5F85\u5BE9\uFF0C\u8ACB\u4EBA\u5DE5\u8986\u6838\u3002`,"ok",8e3)}catch(W){let P=W.detail||W.payload?.detail,z=P?.errors?.join(" \xB7 ")||P?.message||W.message||"llama-server \u7522\u751F\u5931\u6557\u3002";N(z,"danger",12e3)}finally{n.aiLoading=!1,b()}},ae=async(D,F)=>{let W=Number(D.dataset.id||0);if(W)try{await G.reviewQuestionBankItem(W,{decision:F,reviewer:h(),rubric_scores:ag(D),comment:String(D.querySelector('[name="comment"]')?.value||"")}),N(F==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":F==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",F==="approved"?"ok":"info"),await p(),await H()}catch(P){let z=P.detail||P.payload?.detail,J=z?.errors?.join(" \xB7 ")||z?.message||P.message||"\u9A57\u6536\u5931\u6557\u3002";N(J,"danger",8e3)}},Le=async D=>{let F=new FormData(D),W=Number(F.get("suite_id")||0),P=Array.from(D.querySelectorAll('input[name="item_ids"]:checked')).map(J=>Number(J.value)),z={name:String(F.get("name")||"").trim(),tier:String(F.get("tier")||"core"),description:String(F.get("description")||"").trim(),item_ids:P};try{W?(await G.updateBenchmarkSuite(W,z),N("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await G.createBenchmarkSuite(z),N("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),n.editingSuite=null,n.suiteManageOpen=!0,n.suiteAnswers={},await E()}catch(J){let $e=J.detail||J.payload?.detail,De=$e?.errors?.join(" \xB7 ")||$e?.message||J.message||"Suite \u5132\u5B58\u5931\u6557\u3002";N(De,"danger",8e3)}},Ie=async D=>{let F=e.querySelector("[data-qb-tag-filter] [data-qb-tag-popover]:not([hidden])")?.closest("[data-qb-tag-filter]");F&&!D.target.closest("[data-qb-tag-filter]")&&S(F);let W=D.target.closest("[data-qb-action]")?.dataset.qbAction;if(!W)return;let P=D.target.closest("[data-qb-action]"),z=Number(P.dataset.id||0);if(W==="open-tag-search"){let J=P.closest("[data-qb-tag-filter]");k(J,{focus:!0});return}if(W==="select-tag"){await f(P.dataset.tag);return}if(W==="remove-tag"){await f(P.dataset.tag);return}if(W==="bank-tab"){se(P.dataset.tab);return}if(W==="select-bank-item"){n.selectedBankItemId=z,L();return}if(W==="new"){n.editing=null,n.editingFrom="",n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,v("create");return}if(W==="reset-create"){n.editing=null,b();return}if(W==="reset-ai"){n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,b();return}if(W==="edit"){let J=n.suites.find(ft=>Number(ft.id)===Number(n.selectedSuiteId)),De=[...n.items,...n.reviewItems,...J?.items||[],...n.reviewDetail?[n.reviewDetail]:[]].find(ft=>Number(ft.id)===z);if(!De)return;let et=De;try{et=await G.questionBankItem(z)}catch{et=De}n.editing=et||De,n.editingFrom=n.tab,v("create");return}if(W==="review"){Te(z);return}if(W==="review-ai-item"){let J=n.aiResult?.item;if(!J)return;n.reviewFilter="queue",n.reviewDetail=J,v("review");return}if(W==="review-filter"){let J=String(P.dataset.filter||"queue");n.reviewFilter=["queue","accepted","rejected","draft"].includes(J)?J:"queue",n.reviewDetail=null,await H();return}if(W==="select-review-item"){await de(z);return}if(W==="go-manage"){v("manage");return}if(W==="submit-review"){try{await G.submitQuestionBankItemForReview(z),N("\u5DF2\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok"),await p(),n.tab==="manage"?await q():n.tab==="review"&&await H()}catch(J){let $e=J.detail||J.payload?.detail,De=$e?.errors?.join(" \xB7 ")||$e?.message||J.message||"\u9001\u5BE9\u5931\u6557\u3002";N(De,"danger",8e3)}return}if(W==="restore"){if(!window.confirm(`\u78BA\u5B9A\u5FA9\u539F\u984C\u76EE #${z}\uFF1F\u5FA9\u539F\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\u72C0\u614B\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002`))return;try{await G.restoreQuestionBankItem(z),N("\u984C\u76EE\u5DF2\u5FA9\u539F\u4E26\u56DE\u5230\u5F85\u5BE9\u3002","ok"),await p(),await q()}catch(J){let $e=J.detail||J.payload?.detail,De=$e?.errors?.join(" \xB7 ")||$e?.message||J.message||"\u5FA9\u539F\u5931\u6557\u3002";N(De,"danger",8e3)}return}if(W==="delete"){if(n.tab==="suite"){let J=T();if(!J||!(J.items||[]).find(De=>Number(De.id)===z)||!window.confirm(`\u78BA\u5B9A\u5F9E\u300C${J.name}\u300D\u79FB\u9664\u984C\u76EE #${z}\uFF1F\u984C\u76EE\u4ECD\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u7BA1\u7406\u4E2D\u3002`))return;try{await G.removeBenchmarkSuiteItem(J.id,z),N("\u5DF2\u5F9E Benchmark \u984C\u5EAB\u79FB\u9664\u3002","info"),delete n.suiteAnswers[String(J.id)],Number(n.selectedBankItemId)===z&&(n.selectedBankItemId=null),await E()}catch(De){N(De.message||"\u79FB\u9664\u5931\u6557\u3002","danger")}return}if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${z}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await G.deleteQuestionBankItem(z),N("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await p(),n.tab==="review"?(n.reviewDetail=null,await H()):await q()}catch(J){N(J.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(W==="revalidate"){try{let J=await G.revalidateQuestionBank();N(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${c(J.checked||0)} \u984C\uFF0C${c(J.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await p(),await q()}catch(J){N(J.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(W==="export"){try{let J=await G.exportQuestionBank({status:""});Xt(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(J,null,2),"application/json;charset=utf-8")}catch(J){N(J.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(W==="import-json"){let J=e.querySelector("#qb-import-json");try{let $e=JSON.parse(String(J?.value||"").trim()),De=await G.importQuestionBank($e);N(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${De.created}\u3001\u66F4\u65B0 ${De.updated}\u3001\u932F\u8AA4 ${(De.errors||[]).length}\u3002`,(De.errors||[]).length?"warn":"ok",8e3),J&&(J.value=""),await p(),await q()}catch($e){N($e.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(W==="prev"||W==="next"){n.offset=Math.max(0,n.offset+(W==="next"?n.limit:-n.limit)),await q();return}if(W==="suite-edit"){let J=n.suites.find($e=>Number($e.id)===z);if(!J)return;n.editingSuite=J,n.suiteManageOpen=!0,E();return}if(W==="suite-new"){n.editingSuite=null,n.suiteManageOpen=!0,E();return}if(W==="suite-freeze"){try{await G.updateBenchmarkSuite(z,{freeze:!0}),N("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),n.editingSuite=null,n.suiteManageOpen=!0,await E()}catch(J){N(J.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(W==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${z}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await G.deleteBenchmarkSuite(z),N("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),n.editingSuite=null,n.suiteAnswers={},n.suiteManageOpen=!0,await E()}catch(J){N(J.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(W==="decide"){let J=P.closest("form[data-qb-form='review']");J&&await ae(J,String(P.dataset.decision||""))}},Ee=async D=>{let F=D.target.closest("[data-qb-form]");if(!F)return;D.preventDefault();let W=F.dataset.qbForm;if(W==="create")await B(F);else if(W==="ai-create")await qe(F);else if(W==="filter"){let P=new FormData(F);n.filters={query:String(P.get("query")||"").trim(),status:String(P.get("status")||""),question_type:String(P.get("question_type")||""),difficulty:String(P.get("difficulty")||""),tags:P.getAll("tags").map(z=>String(z).trim()).filter(Boolean)},n.offset=0,await q()}else W==="suite"&&await Le(F)},Ze=async D=>{let F=D.target.closest?.("form[data-qb-form='filter'] select");if(F){F.form.requestSubmit();return}let W=D.target.closest?.("[data-qb-suite-select]");if(!W)return;let P=Number(W.value||0);!P||P===Number(n.selectedSuiteId)||await ve(P)},le=D=>{let F=D.target;F?.matches?.(".qb-suite-manage")&&(n.suiteManageOpen=!!F.open)},ee=D=>{let F=D.target.closest?.("[data-qb-action='open-tag-search']");F&&k(F.closest("[data-qb-tag-filter]"))},Me=D=>{let F=D.target.closest?.("[data-qb-tag-filter]");F&&(D.relatedTarget&&F.contains(D.relatedTarget)||S(F))},ye=D=>{let F=D.target.closest?.("[data-qb-tag-search]");if(!F)return;let W=F.closest("[data-qb-tag-filter]");u&&window.clearTimeout(u),u=window.setTimeout(()=>{M(W,F.value)},160)},_e=D=>{let F=D.target.closest?.("[data-qb-tag-search]");if(!F)return;let W=F.closest("[data-qb-tag-filter]");D.key==="Escape"?(D.preventDefault(),S(W),F.blur()):D.key==="Enter"?(D.preventDefault(),W?.querySelector("[data-qb-action='select-tag']")?.click()):D.key==="ArrowDown"&&(D.preventDefault(),W?.querySelector("[data-qb-action='select-tag']")?.focus())};e.addEventListener("click",Ie),e.addEventListener("submit",Ee),e.addEventListener("change",Ze),e.addEventListener("toggle",le,!0),e.addEventListener("mouseover",ee),e.addEventListener("mouseout",Me),e.addEventListener("input",ye),e.addEventListener("keydown",_e);let je=async()=>{await p(),n.tab==="create"?b():n.tab==="manage"?await q():n.tab==="suite"?await E({refreshAnswers:!0}):n.tab==="review"&&await H()};return p(),{show:ie,refresh:je,destroy(){u&&window.clearTimeout(u),e.removeEventListener("click",Ie),e.removeEventListener("submit",Ee),e.removeEventListener("change",Ze),e.removeEventListener("toggle",le,!0),e.removeEventListener("mouseover",ee),e.removeEventListener("mouseout",Me),e.removeEventListener("input",ye),e.removeEventListener("keydown",_e)},getStats:()=>n.stats}}function Fn(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function cc(e){return e==null?"\u2014":c(e)}function rg(e){return e.count?e.severity==="danger"?at("failed","\u9700\u8655\u7406"):e.severity==="warn"?at("warning","\u6CE8\u610F"):at("preview","\u63D0\u793A"):at("success","\u901A\u904E")}function ig(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function og(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${ig(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${r(e.label)}</span>
      ${rg(e)}
    </div>
    <div class="quality-check-value">
      <strong>${c(t)}</strong>
      <span>\u7B46</span>
      <em>${r(Fn(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${r(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function Bn(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
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
  </div>`}function lg(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},n=Number(s.matched_unique_jids??s.matched_rows??0),i=Number(s.matched_rows??n),o=Math.max(0,i-n),l=t.postgres_diff,d=l==null?"\u2014":l===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\uFF08\u53BB\u91CD JID\uFF09\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\uFF08\u53BB\u91CD JID\uFF09\u76F8\u5DEE ${c(Math.abs(l))} \u7B46`,u=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${c(t.vector_indexed)} / ${c(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${m("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\uFF08\u53BB\u91CD JID\uFF09</span></div>
      <div class="metric-value">${c(n)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u542B\u91CD\u8907 ${c(i)} \u7B46${o?`\uFF0C\u91CD\u8907 ${c(o)} \u7B46`:""}\uFF1B\u5171 ${c(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${cc(t.postgres_judgments)}</div>
      <div class="metric-foot">${r(d)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${r(Fn(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${r(u)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${cc(a.candidate_total)}</div>
      <div class="metric-foot">${c(a.candidate_archive_count)} / ${c(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function cg(e){return e.length?`<div class="table-wrap">
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
              <td class="cell-number">${r(Fn(t.match_rate))}</td>
              <td class="cell-number">${c(t.short_text_rows)}</td>
              <td class="cell-number">${c(s)}</td>
              <td class="cell-number">${c(t.duplicate_content_rows)}</td>
              <td class="cell-date">${r(Ut(t.date_min))} \u2013 ${r(Ut(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:xt({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function dg(e){let t=e.totals||{},s=Number(t.matched_unique_jids??t.matched_rows??0),a=e.source||{},n=Array.isArray(e.checks)?e.checks:[],i=e.summary||{},o=e.distributions||{},l=Array.isArray(e.warnings)?e.warnings:[],d=Pe(a.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
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
          ${r(Se(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${m("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${l.length?`<div class="report-alert">${Ge({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:l.map(u=>r(u)).join("<br>")})}</div>`:""}
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
        <div class="summary-value">${r(Fn(t.match_rate))}</div>
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
      <div class="quality-checks">${n.map(og).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${lg(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${c(a.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${cg(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${Bn("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",o.courts)}
        ${Bn("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",o.years)}
        ${Bn("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",o.laws)}
        ${Bn("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",o.titles)}
      </div>
    </div>
  </div>`}async function ug(e){let t=Zt(),s=`judgment.quality.snapshot.${t?"visitor":"admin"}`,a=()=>{try{let f=JSON.parse(window.localStorage.getItem(s)||"null");return!f?.snapshot||Date.now()-Number(f.saved_at||0)>600*1e3?null:f.snapshot}catch{return null}},n=f=>{if(f)try{window.localStorage.setItem(s,JSON.stringify({snapshot:f,saved_at:Date.now()}))}catch{}};e.innerHTML=`<section class="page data-page quality-page">
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
          ${m("refresh",15)}<span>${t?"\u91CD\u65B0\u6574\u7406":"\u91CD\u65B0\u6383\u63CF"}</span>
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
            <span class="status-tab-copy"><strong>\u984C\u5EAB\u65B0\u589E</strong><small>llama-server \u81EA\u52D5\u51FA\u984C\u8207 JSON \u532F\u5165</small></span>
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
  </section>`;let i=e.querySelector("#quality-content"),o=e.querySelector("#quality-refresh"),l=e.querySelector("#quality-meta"),d=[...e.querySelectorAll("[data-quality-tab]")],u={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},h=null,y="overview",v=()=>{if(!h)return;i.innerHTML=dg(h),l.textContent=`DUCKDB \xB7 ${c(h.totals?.rows)} \u7B46 \xB7 ${ge(h.scan_ms||0)}`;let f=e.querySelector("#quality-badge-overview");f&&(f.textContent=c(h.totals?.rows||0))},p=f=>{y=f==="overview"?"overview":f;for(let T of d){let V=T.dataset.qualityTab===y;T.classList.toggle("is-active",V),V?T.setAttribute("aria-current","page"):T.removeAttribute("aria-current")}for(let[T,V]of Object.entries(u))V&&(V.hidden=T!==y);y!=="overview"?l.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":h&&v()},b=lc(e,{onNavigate:f=>p(f),onStats:f=>{let T=f||{},V=e.querySelector("#quality-badge-manage"),Q=e.querySelector("#quality-badge-suite"),fe=e.querySelector("#quality-badge-review");V&&(V.textContent=c(T.total||0)),Q&&(Q.textContent=c(T.benchmark_ready||0)),fe&&(fe.textContent=c((T.pending_review||0)+(T.changes_requested||0)))}}),w=f=>{if(p(f),f!=="overview"){if(t){let T=u[f];T&&(T.innerHTML=Is("\u984C\u5EAB\u7BA1\u7406\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u5B8C\u6574\u7684\u8CC7\u6599\u54C1\u8CEA\u7E3D\u89BD\uFF1B\u984C\u5EAB\u65B0\u589E\u3001\u7BA1\u7406\u3001Benchmark \u8207\u4EBA\u5DE5\u9A57\u6536\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002"));return}b.show(f)}},M=async({cached:f=!1}={})=>{Re(o,!0,f?"\u6574\u7406\u4E2D\u2026":"\u6383\u63CF\u4E2D\u2026");try{h=await G.quality({cached:f}),n(h),v()}catch(T){i.innerHTML=`<div class="report-card">
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
      </div>`,l.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",N("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{Re(o,!1)}},k=async()=>{y==="overview"?await M():await b.refresh()};o.addEventListener("click",k),e.addEventListener("click",f=>{let T=f.target.closest("[data-quality-tab]");T&&w(T.dataset.qualityTab||"overview")}),i.addEventListener("click",f=>{!f.target.closest("[data-action='export-quality']")||!h||Xt(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(h,null,2),"application/json;charset=utf-8")}),p("overview");let S=a();if(S&&(h=S,v()),t)for(let f of d){if(f.dataset.qualityTab==="overview")continue;f.classList.add("is-demo-locked"),f.removeAttribute("title"),f.dataset.demoLockTooltip="\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B\u984C\u5EAB\u7BA1\u7406";let T=f.querySelector(".badge");T&&(T.textContent="LOCK")}await M({cached:!0})}var qi={};gs(qi,{render:()=>Qg});var On={};gs(On,{render:()=>xi});var dc={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function uc(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${r(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${r(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function pg(e){let t=e?.supports_chat,s=t===!0?"badge-ok":t===!1?"badge-danger":"badge-neutral",a=t===!0?"\u652F\u63F4 chat":t===!1?"\u4E0D\u652F\u63F4 chat":"\u672A\u6E2C\u8A66",n=(Array.isArray(e?.capabilities)?e.capabilities:[]).map(i=>`<span class="chip chip-mono">${r(i)}</span>`).join("");return`<div class="tests-llm-row">
    <div class="tests-llm-model">
      <strong class="mono">${r(e?.model||"\u2014")}</strong>
      <small>${r(e?.detail||"")}</small>
    </div>
    <div class="tests-llm-meta">
      <span class="badge ${s}">${a}</span>
      ${e?.tested_now?'<span class="badge badge-info">\u672C\u6B21\u65B0\u6E2C</span>':""}
      ${n}
      <span class="tests-llm-time">${e?.tested_at?`\u6E2C\u8A66\u65BC ${r(Se(e.tested_at))}`:"\u5C1A\u7121\u6E2C\u8A66\u7D00\u9304"}</span>
    </div>
  </div>`}function mg(e){let t=Array.isArray(e?.models)?e.models:[],s=e?.counts||{},a=Array.isArray(e?.failures)?e.failures:[];return{summary:e?`<span>llama-server <strong>${s.available??t.length}</strong> \u500B\u6A21\u578B</span>
      <span>\u652F\u63F4 chat <strong>${s.chat??0}</strong></span>
      <span>\u4E0D\u652F\u63F4 <strong>${s.unsupported??0}</strong></span>
      <span>\u672A\u6E2C\u8A66 <strong>${s.untested??0}</strong></span>
      <span>\u672C\u6B21\u65B0\u6E2C <strong>${(e.tested_now||[]).length}</strong></span>
      <span class="muted">${r(e.detail||"")}</span>`:"<span>\u6B63\u5728\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u2026</span>",list:t.length?t.map(pg).join(""):'<div class="tests-llm-empty">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u8ACB\u78BA\u8A8D llama-server \u5DF2\u555F\u52D5\u4E26\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66\u3002</div>',failures:a.length?`<div class="tests-llm-failures">${a.map(i=>`<span><strong class="mono">${r(i.model||"\u2014")}</strong> ${r(i.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function gg(e){let t=String(e?.status||"degraded"),s=t==="operational"?"badge-ok":t==="disabled"?"badge-neutral":"badge-danger",a=Array.isArray(e?.scores)?e.scores.slice(0,4):[],n=Array.isArray(e?.results)?e.results[0]:null;return`<div class="tests-llm-row">
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
  </div>`}function fg(e){if(!e)return{summary:"<span>\u6B63\u5728\u8B80\u53D6 reranker \u72C0\u614B\u2026</span>",list:"",failures:""};let t=Array.isArray(e.providers)?e.providers:[],s=e.active||{},a=String(e.status||"degraded"),n=a==="operational"?"badge-ok":a==="not_configured"?"badge-neutral":"badge-danger",i=t.flatMap(o=>(o.errors||[]).map(l=>({model:o.url,detail:l})));return{summary:`<span>\u72C0\u614B <span class="badge ${n}">${r(a)}</span></span>
      <span>\u6A21\u578B <strong>${r(e.model||"\u2014")}</strong></span>
      <span>\u555F\u7528 <strong>${e.enabled?"true":"false"}</strong></span>
      ${s.url?`<span>\u4F5C\u7528\u4E2D <strong class="mono">${r(s.url)}</strong></span>`:""}
      <span class="muted">${r(e.detail||"")}</span>`,list:t.length?t.map(gg).join(""):'<div class="tests-llm-empty">\u6C92\u6709\u8A2D\u5B9A RERANK_URL\uFF1B\u8ACB\u8A2D\u5B9A primary \u6216 fallback reranker\u3002</div>',failures:i.length?`<div class="tests-llm-failures">${i.map(o=>`<span><strong class="mono">${r(o.model||"\u2014")}</strong> ${r(o.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function bg(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,total_ms:e.total_ms,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}:${a.duration_ms}`)}:null})}async function xi(e,t,{embedded:s=!1}={}){let a=!1,n=!1,i={embedding:[],llm:[]},o=!1,l=null,d=!1,u=null,h=!1,y=null,v=[],p="",b=null,w="",M=`<div class="page-actions">
      <span class="badge badge-neutral badge-mono" id="tests-mode-badge">\u8B80\u53D6\u4E2D</span>
      <button class="btn btn-secondary" type="button" id="tests-refresh">
        ${m("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
      </button>
    </div>`,k=s?`<div class="tests-embed-head">
        <div>
          <div class="eyebrow">SYSTEM TEST</div>
          <div class="tests-embed-title">\u7CFB\u7D71\u6E2C\u8A66</div>
          <div class="tests-embed-copy">\u5F8C\u7AEF API \u9023\u7DDA\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u591A\u6A21\u578B\u6E2C\u8A66 Flow\u3002\u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207\u5177\u5099 chat \u80FD\u529B\u7684 LLM \u6A21\u578B\u3002</div>
        </div>
        ${M}
      </div>`:`<div class="page-header">
      <div>
        <div class="eyebrow">SYSTEM TEST</div>
        <h1 class="page-title">\u7CFB\u7D71\u6E2C\u8A66</h1>
        <p class="page-subtitle">\u5408\u4F75\u5F8C\u7AEF API \u9023\u7DDA\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u591A\u6A21\u578B\u6E2C\u8A66 Flow\u3002
          \u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207\u5177\u5099 chat \u80FD\u529B\u7684 LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002</p>
      </div>
      ${M}
    </div>`;e.innerHTML=`<section class="${s?"tests-page tests-page-embedded":"page tests-page"}">
    ${k}

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
            ${m("sparkles",13)}<span>\u524D\u5F80 RAG \u63D0\u554F</span>
          </a>
          <a class="btn btn-secondary btn-sm" href="#/performance">
            ${m("activity",13)}<span>\u6548\u80FD Flow</span>
          </a>
        </div>
        <div class="tests-status" id="tests-mode-status" role="status"></div>
      </section>
    </div>

    <section class="card tests-card tests-llm-card" aria-labelledby="tests-llm-title">
      <div class="tests-card-head">
        <span class="tests-card-icon">${m("brain",16)}</span>
        <div>
          <div class="tests-card-title" id="tests-llm-title">LLM \u670D\u52D9\u6E2C\u8A66</div>
          <div class="tests-card-copy">\u6AA2\u67E5 llama-server \u4E0A\u6BCF\u500B\u6A21\u578B\u662F\u5426\u652F\u63F4 chat\uFF0C\u4E26\u628A\u7D50\u679C\u5BEB\u5165\u80FD\u529B\u6E05\u55AE\uFF1B\u5DF2\u6709\u6E2C\u8A66\u7D00\u9304\u7684\u6A21\u578B\u4E0D\u6703\u91CD\u6E2C\u3002LLM \u6548\u80FD\u8A55\u4F30\u53EA\u6703\u7D0D\u5165\u652F\u63F4 chat \u7684\u6A21\u578B\u3002</div>
        </div>
      </div>
      <div class="tests-llm-head">
        <div class="tests-llm-summary" id="tests-llm-summary">\u6B63\u5728\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u2026</div>
        <button class="btn btn-primary btn-sm" type="button" id="tests-llm-test">
          ${m("activity",14)}<span>\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66</span>
        </button>
      </div>
      <div class="tests-llm-list" id="tests-llm-list"></div>
      <div id="tests-llm-failures"></div>
      <div class="tests-status" id="tests-llm-status" role="status"></div>
    </section>

    <section class="card tests-card tests-llm-card" aria-labelledby="tests-rerank-title">
      <div class="tests-card-head">
        <span class="tests-card-icon">${m("filter",16)}</span>
        <div>
          <div class="tests-card-title" id="tests-rerank-title">Reranker \u670D\u52D9\u6E2C\u8A66</div>
          <div class="tests-card-copy">\u6AA2\u67E5 RAG_RERANK_ENABLED\u3001primary\uFF0Ffallback reranker \u5065\u5EB7\u72C0\u614B\uFF0C\u4E26\u4EE5\u5BE6\u969B rerank \u8ACB\u6C42\u9A57\u8B49\u6A21\u578B\u8207\u5206\u6578\u3002\u6E2C\u8A66\u4E0D\u6703\u4FEE\u6539\u7D22\u5F15\u6216\u9078\u53D6\u7D50\u679C\u3002</div>
        </div>
      </div>
      <div class="tests-llm-head">
        <div class="tests-llm-summary" id="tests-rerank-summary">\u6B63\u5728\u8B80\u53D6 reranker \u72C0\u614B\u2026</div>
        <button class="btn btn-primary btn-sm" type="button" id="tests-rerank-test">
          ${m("activity",14)}<span>\u57F7\u884C Reranker \u670D\u52D9\u6E2C\u8A66</span>
        </button>
      </div>
      <div class="tests-llm-list" id="tests-rerank-list"></div>
      <div id="tests-rerank-failures"></div>
      <div class="tests-status" id="tests-rerank-status" role="status"></div>
    </section>

    <div id="tests-flow"></div>
  </section>`;let S=e.querySelector("#tests-mode-badge"),f=e.querySelector("#tests-mode-toggle"),T=e.querySelector("#tests-mode-summary"),V=e.querySelector("#tests-mode-models"),Q=e.querySelector("#tests-mode-status"),fe=e.querySelector("#tests-api-form"),ve=e.querySelector("#tests-api-input"),se=e.querySelector("#tests-admin-token-input"),L=e.querySelector("#tests-api-preview"),q=e.querySelector("#tests-api-status"),E=e.querySelector("#tests-api-note"),K=e.querySelector("#tests-api-test"),de=e.querySelector("#tests-api-reset"),H=e.querySelector("#tests-api-save"),ie=e.querySelector("#tests-refresh"),Te=e.querySelector("#tests-flow"),B=e.querySelector("#tests-llm-summary"),qe=e.querySelector("#tests-llm-list"),ae=e.querySelector("#tests-llm-failures"),Le=e.querySelector("#tests-llm-status"),Ie=e.querySelector("#tests-llm-test"),Ee=e.querySelector("#tests-rerank-summary"),Ze=e.querySelector("#tests-rerank-list"),le=e.querySelector("#tests-rerank-failures"),ee=e.querySelector("#tests-rerank-status"),Me=e.querySelector("#tests-rerank-test");se&&(se.value=Qa());let ye=(ne,he,tt="")=>{ne&&(ne.textContent=he,ne.className=`tests-status${tt?` is-${tt}`:""}`)},_e=(ne,he="")=>{q&&(q.textContent=ne,q.className=`api-dialog-status${he?` is-${he}`:""}`)},je=()=>Kt()==="query",D=()=>{let ne=fs(ve.value);return ne||(window.location.protocol==="file:"?er:"")},F=()=>{let ne=D(),he=is(),tt=dc[Kt()]||Kt()||"\u540C\u6E90";L.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${r(Ss(he))}</strong>${he?`\uFF08${r(tt)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${r(St("/api/health",ne))}`},W=()=>{let ne=Kt(),he=`\u76EE\u524D\u4F86\u6E90\uFF1A${dc[ne]||ne||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,tt="";ne==="query"?(tt="is-warn",he="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):Ga()?(tt="is-warn",he="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(ne==="file-default"||window.location.protocol==="file:")&&(he="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),he+=(se?.value||Qa()).trim()?" \u7BA1\u7406\u6B0A\u6756\uFF1A\u5DF2\u8A2D\u5B9A\uFF0C\u6703\u9001\u5F80\u76EE\u524D\u8A2D\u5B9A\u7684 API Base\u3002":" \u7BA1\u7406\u6B0A\u6756\uFF1A\u672A\u8A2D\u5B9A\uFF1B\u672C\u6A5F loopback \u53EF\u76F4\u63A5\u4F7F\u7528\uFF0C\u9060\u7AEF\u7BA1\u7406 API \u6703\u88AB\u62D2\u7D55\u3002",E.textContent=he,E.className=`api-dialog-note${tt?` ${tt}`:""}`;let Qe=ne==="query";H.disabled=Qe,de.disabled=Qe,ve.readOnly=Qe},P=()=>{if(!tr(ve.value))return _e("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),ve.focus(),null;let ne=D();return window.location.protocol==="https:"&&/^http:\/\//i.test(ne)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(ne)?(_e("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),ve.focus(),null):ne},z=()=>{ve.value=is(),F(),W(),_e("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},J=()=>{let ne=Array.isArray(i.embedding)?i.embedding.length:0,he=Array.isArray(i.llm)?i.llm.length:0;if(S&&(S.textContent=o?"\u5207\u63DB\u4E2D\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",S.className=`badge badge-mono ${o?"badge-info":n?"badge-warn":"badge-neutral"}`),f){f.disabled=o,f.classList.toggle("is-on",n),f.classList.toggle("is-off",!n&&!o),f.classList.toggle("is-busy",o),f.setAttribute("aria-checked",n?"true":"false"),f.setAttribute("aria-busy",o?"true":"false"),f.setAttribute("aria-label",o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":n?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),f.title=o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let tt=f.querySelector(".header-power-label");tt&&(tt.textContent=o?"\u2026":n?"ON":"OFF")}T&&(T.textContent=n?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${ne} \u500B embedding \u8207 ${he} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),V&&(V.innerHTML=uc("Embedding",i.embedding)+uc("LLM",i.llm))},$e=async()=>{try{let ne=await G.testMode();if(a)return;n=!!ne.enabled,i=ne.models||{embedding:[],llm:[]},ye(Q,"")}catch(ne){if(a)return;n=!1,i={embedding:[],llm:[]},ye(Q,ne.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}a||J()},De=async()=>{if(o)return;let ne=!n;o=!0,J(),ye(Q,ne?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let he=await G.setTestMode(ne);if(a)return;n=!!he.enabled,i=he.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:n,models:i}}));let tt=i.embedding?.length||0,Qe=i.llm?.length||0;ye(Q,n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${tt} \u500B embedding \u8207 ${Qe} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),N(n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${tt} \u500B embedding\u3001${Qe} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",n?"ok":"info",6e3),await mt()}catch(he){a||(ye(Q,he.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),N(he.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{o=!1,a||J()}},et=()=>{let ne=mg(l);if(B&&(B.innerHTML=ne.summary),qe&&(qe.innerHTML=ne.list),ae&&(ae.innerHTML=ne.failures),Ie){Ie.disabled=d,Ie.setAttribute("aria-busy",d?"true":"false");let he=Ie.querySelector("span");he&&(he.textContent=d?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66")}},ft=async()=>{try{let ne=await G.llmModels();if(a)return;l=ne,ye(Le,"")}catch(ne){if(a)return;l=null,ye(Le,ne.message||"\u7121\u6CD5\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u3002","error")}a||et()},ot=async()=>{if(!d){d=!0,et(),ye(Le,"\u6B63\u5728\u6AA2\u67E5 llama-server \u6A21\u578B\u8207 chat \u80FD\u529B\u2026");try{let ne=await G.testLlmModels();if(a)return;l=ne;let he=ne.tested_now?.length||0,tt=ne.chat_models?.length||0,Qe=ne.failures?.length||0;ye(Le,`${he?`\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u672C\u6B21\u65B0\u6E2C ${he} \u500B\u6A21\u578B`:"\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u6C92\u6709\u65B0\u6A21\u578B"}\uFF0C\u76EE\u524D ${tt} \u500B\u6A21\u578B\u652F\u63F4 chat${Qe?`\uFF1B${Qe} \u500B\u6A21\u578B\u66AB\u6642\u7121\u6CD5\u5224\u5B9A\uFF0C\u4E0B\u6B21\u6703\u91CD\u8A66`:""}\u3002`,Qe?"warn":"ok"),N(he?`LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u65B0\u589E ${he} \u7B46\u80FD\u529B\u7D00\u9304\u3002`:"LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u6C92\u6709\u65B0\u6A21\u578B\u9700\u8981\u6E2C\u8A66\u3002",Qe?"warn":"ok",5e3),await $e()}catch(ne){a||(ye(Le,ne.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),N(ne.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{d=!1,a||et()}}},nt=()=>{let ne=fg(u);if(Ee&&(Ee.innerHTML=ne.summary),Ze&&(Ze.innerHTML=ne.list),le&&(le.innerHTML=ne.failures),Me){Me.disabled=h,Me.setAttribute("aria-busy",h?"true":"false");let he=Me.querySelector("span");he&&(he.textContent=h?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C Reranker \u670D\u52D9\u6E2C\u8A66")}},Ue=async()=>{try{let ne=await G.rerankStatus();if(a)return;u=ne,ye(ee,"")}catch(ne){if(a)return;u=null,ye(ee,ne.message||"\u7121\u6CD5\u8B80\u53D6 reranker \u72C0\u614B\u3002","error")}a||nt()},ue=async()=>{if(!h){h=!0,nt(),ye(ee,"\u6B63\u5728\u5C0D primary\uFF0Ffallback reranker \u57F7\u884C\u5BE6\u969B rerank \u6E2C\u8A66\u2026");try{let ne=await G.testReranker();if(a)return;u=ne;let he=Array.isArray(ne.providers)?ne.providers:[],tt=he.filter(Bt=>Bt.status==="operational").length,Qe=he.reduce((Bt,$t)=>Bt+(Array.isArray($t.errors)?$t.errors.length:0),0);ye(ee,Qe?`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${tt} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C${Qe} \u500B\u932F\u8AA4\uFF1B\u8A73\u7D30\u5206\u6578\u5DF2\u5217\u5728\u4E0A\u65B9\u3002`:`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${tt} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C\u6A21\u578B ${ne.model||"\u2014"}\u3002`,Qe?"warn":"ok"),N(Qe?"Reranker \u90E8\u5206\u7AEF\u9EDE\u5931\u6557\uFF0C\u8ACB\u67E5\u770B\u6E2C\u8A66\u7D50\u679C\u3002":"Reranker \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\u3002",Qe?"warn":"ok",5e3)}catch(ne){a||(ye(ee,ne.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),N(ne.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{h=!1,a||nt()}}},rt=()=>{if(!Te)return;let ne=bg(y,v,p);ne!==w&&(w=ne,Te.innerHTML=ra(y,v,p))},We=async()=>{try{let ne=await G.testRuns(30);if(a)return;v=Array.isArray(ne.runs)?ne.runs:[]}catch{if(a)return;v=[]}},mt=async(ne=null)=>{try{let he=ne||(p?await G.testRun(p):await G.testRunCurrent());if(a)return;y=he.run||null,!p&&y&&y.status!=="running"&&!v.some(tt=>tt.run_id===y.run_id)&&await We()}catch{if(a)return;y=null}a||rt()};ve?.addEventListener("input",()=>{F(),_e("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),se?.addEventListener("input",()=>{W()}),K?.addEventListener("click",async()=>{let ne=P();if(ne!==null){Re(K,!0,"\u6E2C\u8A66\u4E2D\u2026"),_e(`\u6B63\u5728\u9023\u7DDA\u5230 ${Ss(ne)||"\u540C\u6E90"}\u2026`);try{let he=await Ei(ne);if(a)return;_e(`\u9023\u7DDA\u6210\u529F \xB7 v${he.version} \xB7 ${he.duration_ms} ms \xB7 GET ${St("/api/health",ne)}`,"ok")}catch(he){a||_e(he.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{a||Re(K,!1)}}}),fe?.addEventListener("submit",ne=>{if(ne.preventDefault(),je())return;let he=P();he!==null&&(rr(he),Wa(se?.value||""),N(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${Ss(he)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),de?.addEventListener("click",()=>{je()||(rr(""),N("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),f?.addEventListener("click",De),Ie?.addEventListener("click",ot),Me?.addEventListener("click",ue),Te?.addEventListener("change",async ne=>{ne.target.id==="test-run-select"&&(p=String(ne.target.value||""),await mt())}),Te?.addEventListener("click",async ne=>{ne.target.closest("#test-flow-refresh")&&(p="",await We(),await mt())}),ie?.addEventListener("click",async()=>{Re(ie,!0,"\u66F4\u65B0\u4E2D\u2026"),z(),await Promise.allSettled([$e(),We(),ft(),Ue()]),a||await mt(),a||(Re(ie,!1),N("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let wt=ne=>{n=!!ne.detail?.enabled,i=ne.detail?.models||{embedding:[],llm:[]},J()};return window.addEventListener("judgment:test-mode",wt),z(),J(),et(),nt(),await Promise.allSettled([$e(),We(),ft(),Ue()]),await mt(),b=Et("test-runs",async(ne,he)=>{a||document.hidden||p||await mt(he?.snapshot||null)}),!s&&typeof t?.setTitle=="function"&&t.setTitle(It),()=>{a=!0,b&&b(),window.removeEventListener("judgment:test-mode",wt)}}var pc={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var hc={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},Ai=new Set,mc="judgment.status.payload.v1",vc=new Set(["tests","resources","local-model","api"]),$c=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"tests",label:"\u7CFB\u7D71\u6E2C\u8A66",hint:"API\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u6A21\u578B Flow",icon:"terminal"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"local-model",label:"Model Provider",hint:"llama-server \u4E3B\u6A5F\u8207\u6A21\u578B",icon:"server"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 API \u2192 Pipeline \u2192 Data",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}],Na=[{id:"system",label:"\u7CFB\u7D71\u8207\u5373\u6642\u72C0\u614B",icon:"activity",prefixes:["/api/health","/api/status","/api/system-usage","/api/events/stream","/api/processing/events/status","/api/docs","/api/openapi.json"]},{id:"processing",label:"\u8CC7\u6599\u8655\u7406\u8207\u66F4\u65B0",icon:"database",prefixes:["/api/processing","/api/judgment-download","/api/updates","/api/courts","/api/law-versions"]},{id:"data",label:"\u67E5\u8A62\u8207\u8CC7\u6599",icon:"search",prefixes:["/api/query","/api/data","/api/judgment","/api/law","/api/schema","/api/catalog","/api/judgment-stats","/api/quality"]},{id:"rag",label:"RAG \u554F\u7B54",icon:"message",prefixes:["/api/rag"]},{id:"index",label:"\u7248\u672C\u8207\u7D22\u5F15",icon:"layers",prefixes:["/api/index-versions","/api/index-alias","/api/versioning"]},{id:"models",label:"\u6A21\u578B\u8207\u670D\u52D9",icon:"brain",prefixes:["/api/ollama","/api/llm","/api/rerank","/api/test-mode"]},{id:"tests",label:"\u6E2C\u8A66\u8207\u6548\u80FD",icon:"activity",prefixes:["/api/test-runs","/api/performance"]},{id:"question-bank",label:"\u984C\u5EAB",icon:"file",prefixes:["/api/question-bank"]},{id:"benchmark",label:"Benchmark",icon:"grid",prefixes:["/api/benchmark"]},{id:"other",label:"\u5176\u4ED6",icon:"terminal",prefixes:[]}];function hg(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Yt(e).label,tone:Yt(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function vg(e){let t=Yt(e.status),s=pc[e.kind]||pc.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${c(e.latency_ms)} ms</span>`;return`<article class="service-card">
    <div class="service-top">
      <span class="service-icon">${m(s,14)}</span>
      <span class="service-name" title="${r(e.name)}">${r(e.name)}</span>
      <span class="service-kind">${r(e.kind||"")}</span>
    </div>
    <div class="service-status">
      <span class="status-dot ${t.tone==="ok"?"is-ok":t.tone==="warn"?"is-warn":t.tone==="danger"?"is-danger":"is-idle"}" aria-hidden="true"></span>
      ${r(t.label)}
      ${a}
    </div>
    <p class="service-detail" title="${r(e.detail||"")}">${r(e.detail||"")}</p>
  </article>`}function $g(e,t){let s=typeof e=="string"?{label:e}:e||{},a=String(s.label||"\u2014"),n=s.service?t.find(l=>l.id===s.service):null,i=n?n.status==="operational":a==="IndexedDB"?po():!0,o=[s.detail||"",n?`\u72C0\u614B\uFF1A${Yt(n.status).label}`:""].filter(Boolean).join(" \xB7 ");return`<div class="arch-node ${i?"":"is-muted"}" title="${r(o||(i?a:"\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"))}">
    <strong>${r(a)}</strong>
    ${s.detail?`<span class="arch-node-detail">${r(s.detail)}</span>`:""}
  </div>`}function yg(e,t,s=!1){let a=e?.layers||[];if(!a.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let n=a.map(o=>{let l=(o.nodes||[]).map(d=>$g(d,t)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${r(o.label||o.id)}</div>
      <div class="arch-nodes">${l}</div>
    </div>`}),i=[];return n.forEach((o,l)=>{l&&i.push(`<div class="arch-arrow" aria-hidden="true">${m("arrowRight",15)}</div>`),i.push(o)}),`<div class="arch-flow">${i.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${m("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>
    ${wg(s)}`}function wg(e=!1){return`<figure class="arch-diagram">
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
  </figure>`}function yc(e){let t=String(e||""),s=a=>t===a||t.startsWith(`${a}/`);for(let a of Na)if(a.prefixes.some(s))return a;return Na[Na.length-1]}function _g(e){return`is-${String(e||"get").toLowerCase()}`}function kg(e){return`<div class="endpoint-row${e.deprecated?" is-deprecated":""}">
    <span class="endpoint-method ${_g(e.method)}">${r(e.method||"GET")}</span>
    <span class="endpoint-path" title="${r(e.path||"")}">${r(e.path||"")}</span>
    <span class="endpoint-label">${r(e.label||"")}</span>
  </div>`}function Sg(e){if(!Array.isArray(e)||!e.length)return'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>';let t=new Map(Na.map(s=>[s.id,{group:s,endpoints:[]}]));for(let s of e){let a=yc(s.path),n=t.get(a.id);n&&n.endpoints.push(s)}return`<div class="api-endpoint-groups">${Na.map(s=>{let n=t.get(s.id)?.endpoints||[];return n.length?(n.sort((i,o)=>String(i.path).localeCompare(String(o.path))||String(i.method).localeCompare(String(o.method))),`<section class="card api-endpoint-group">
        <div class="side-card-head">
          <span class="side-card-title">${m(s.icon,14)}${r(s.label)}</span>
          <span class="badge badge-neutral badge-mono">${c(n.length)}</span>
        </div>
        <div class="endpoint-list">${n.map(kg).join("")}</div>
      </section>`):""}).join("")}</div>`}function ws(e,t){return`<div class="detail-row">
    <span class="detail-label">${r(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function Ve(e,t,{mono:s=!1,wide:a=!1}={}){return`<div class="data-version-fact${a?" is-wide":""}">
    <span>${r(e)}</span>
    <strong class="${s?"mono":""}">${r(String(t??"\u2014"))}</strong>
  </div>`}function gc(e,t,s,a=""){let n=t==null?null:Math.max(0,Math.min(100,Number(t)||0));return`<div class="data-version-coverage ${a}">
    <div class="data-version-coverage-head">
      <span>${r(e)}</span>
      <strong>${Hn(n)}</strong>
    </div>
    <div class="data-version-coverage-track"><span style="width:${n===null?0:n.toFixed(1)}%"></span></div>
    <div class="data-version-coverage-foot">${r(s)}</div>
  </div>`}function xg(e){if(!Array.isArray(e)||!e.length)return xt({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${r(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${Ka(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function Ag(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=new Map(s.map(w=>[w.id,w])),n=a.get("qdrant"),i=a.get("embedding"),o=a.get("rag"),l=a.get("llm"),d=Number(t.judgment_indexed_count||0),u=Number(t.judgment_count||0),h=u?(d/u*100).toFixed(1):"0.0",y=t.judgment_vector_points===null||t.judgment_vector_points===void 0?"\u2014":c(t.judgment_vector_points),v=Number(t.judgment_index_remaining||0),p=o?.status==="operational"?"RAG \u5C31\u7DD2":o?.status==="not_configured"?"\u672A\u8A2D\u5B9A":o?.status==="degraded"?"\u964D\u7D1A":"\u672A\u77E5",b=[["cube","Qdrant \u5411\u91CF\u7D22\u5F15",n],["layers",`Embedding\uFF08${t.judgment_vector_model||"\u2014"}\uFF09`,i],["brain","RAG \u56DE\u7B54\u7BA1\u7DDA",o],["sparkles","LLM \u6A21\u578B",l]];return`<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}RAG \u8CC7\u6599\u73FE\u6CC1</span>
      ${at(o?.status,p)}
    </div>
    <div class="side-card-body">
      <div class="mini-stats">
        <div class="mini-stat">
          <div class="mini-stat-value">${c(u)}</div>
          <div class="mini-stat-label">\u5224\u6C7A</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${c(d)}</div>
          <div class="mini-stat-label">\u5DF2\u7D22\u5F15</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${h}%</div>
          <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
        </div>
      </div>
      <div class="side-status-list">
        ${b.map(([w,M,k])=>`<div class="side-status-row">
              <span>${m(w,13)}${r(M)}</span>
              ${at(k?.status,k?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
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
  </section>`}function Hn(e){let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function _s(e){return Math.max(0,Number(e?.duration_ms)||0)}function qg(e,t){let s=e?.pipeline&&typeof e.pipeline=="object"?e.pipeline:null,a=Array.isArray(s?.stages)?s.stages:[],n=Number(s?.total_ms)||a.reduce((v,p)=>v+_s(p),0),i=Math.max(0,Number(t?.initMs)||0),o=Math.max(0,Number(t?.requestMs)||0),l=Math.max(o,n),d=Math.max(0,l-n),u=[],h=t?.requestStartedAt||e?.checked_at||null,y=t?.requestFinishedAt||e?.checked_at||null;if(i>.5&&u.push({key:"page-init",label:"\u9801\u9762\u521D\u59CB\u5316",caption:"\u5EFA\u7ACB\u670D\u52D9\u7E3D\u89BD\u9AA8\u67B6\u8207\u5C0E\u89BD",color:"#64748b",status:"success",duration_ms:i,started_at:t?.initStartedAt||h,finished_at:h,message:"\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u3001\u8F09\u5165\u6A21\u7D44\u4E26\u6E96\u5099\u8ACB\u6C42\u3002"}),a.length){d>.5&&u.push({key:"http",label:"HTTP \u50B3\u8F38\uFF0F\u6392\u968A",caption:"\u700F\u89BD\u5668 \u2192 FastAPI",color:"#94a3b8",status:"success",duration_ms:d,started_at:h,finished_at:y,message:"\u5305\u542B\u9023\u7DDA\u3001\u8ACB\u6C42\u6392\u968A\u8207\u56DE\u61C9\u50B3\u8F38\u3002"}),u.push(...a);let v=a.reduce((b,w)=>b+_s(w),0),p=Math.max(0,n-v);p>.5&&u.push({key:"server-assemble",label:"\u4F3A\u670D\u5668\u5F59\u6574",caption:"\u72C0\u614B\u56DE\u61C9\u7D44\u88DD",color:"#cbd5e1",status:"success",duration_ms:p,started_at:a[a.length-1]?.finished_at||h,finished_at:y,message:"\u7D44\u88DD\u670D\u52D9\u3001\u8CC7\u6599\u91CF\u8207\u67B6\u69CB payload\u3002"})}else u.push({key:"status-request",label:"GET /api/status",caption:"\u670D\u52D9\u72C0\u614B\u8207\u8CC7\u6599\u91CF",color:"#64748b",status:"success",duration_ms:l,started_at:h,finished_at:y,message:"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF1B\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593\u3002"});return{total_ms:i+l,started_at:t?.initStartedAt||h,finished_at:y,stages:u,server_ms:n,request_ms:l,transport_ms:d,init_ms:i,detailed:!!s}}function Mg(e){let t=e?.page_pipeline,s=Array.isArray(t?.stages)?t.stages:[];if(!t||!s.length)return"";let a=Math.max(0,Number(t.total_ms)||s.reduce((f,T)=>f+_s(T),0)),n=Math.max(a,s.reduce((f,T)=>f+_s(T),0),1),i=1.25,o=s.filter(f=>String(f.status||"success")!=="skipped"),l=s.filter(f=>["success","no_change"].includes(String(f.status||"success"))).length,d=s.filter(f=>f.status==="failed").length,u=s.reduce((f,T)=>_s(T)>_s(f)?T:f,s[0]),h=Math.max(0,Number(t.server_ms)||Number(e?.pipeline?.total_ms)||0),y=Math.max(0,Number(t.transport_ms)||0),v=Math.max(0,Number(t.init_ms)||0),p=s.map(f=>String(f.status||"success")==="skipped"?0:Math.max(_s(f)/n*100,i)),b=p.reduce((f,T)=>f+T,0),w=b>100?100/b:1,M=0,k=s.map((f,T)=>{let V=String(f.status||"success"),Q=V==="skipped",fe=f.label||f.key||`\u968E\u6BB5 ${T+1}`,ve=f.caption||"",se=_s(f),L=Q?"\u2014":ge(se),q=n>0?se/n*100:0,E=Q?0:p[T]*w,K=M;Q||(M+=E);let de=f.color||"#64748b",H=V==="failed"?"var(--danger)":de,ie=[`is-${V}`,V==="failed"?"is-error":"",Q?"is-missing":""].filter(Boolean).join(" "),Te=E>0?`<span class="rag-wf-bar status-wf-bar is-sequential" style="left:${K.toFixed(3)}%;width:${E.toFixed(4)}%;top:0;height:12px;--bar-color:${r(H)}" aria-hidden="true"></span>`:"",B=Q?"\u7565\u904E":V==="failed"?"\u5931\u6557":"\u5B8C\u6210",qe=`${t.label||"status"}:${f.key||T}`,ae=[["\u72C0\u614B",B,!0],["\u958B\u59CB",f.started_at?Se(f.started_at):"\u2014",!0],["\u7D50\u675F",f.finished_at?Se(f.finished_at):"\u2014",!0],["\u8017\u6642",L,!0],["\u5360\u6574\u9AD4",Hn(q),!0],["\u8AAA\u660E",f.message||"",!1]].map(([Le,Ie,Ee])=>Ee||Ie?`<span class="rag-wf-detail"><span>${r(Le)}</span><strong>${r(String(Ie||"\u2014"))}</strong></span>`:"").join("");return`<details class="rag-wf-stage status-wf-stage ${ie}" data-status-wf-stage="${r(qe)}"${Ai.has(qe)?" open":""} style="--stage-color:${r(de)}">
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="status-wf-step">${String(T+1).padStart(2,"0")}</span> ${r(fe)}</strong>${ve?`<small>${r(ve)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(L)} \xB7 ${r(B)} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${fe}\uFF1A${B}\uFF0C\u8017\u6642 ${L}\uFF0C\u5360\u6574\u9AD4 ${Hn(q)}`)}">${Te}</span>
        </summary>
        <div class="rag-wf-details">${ae}</div>
      </details>`}).join(""),S=t.detailed?"\u5F8C\u7AEF /api/status \u968E\u6BB5\u660E\u7D30":"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF0C\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593";return`<section class="report-card status-wf-card" data-status-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m("activity",14)}\u670D\u52D9\u7E3D\u89BD\u8F09\u5165 Pipeline</span>
      <div class="index-runtime-metrics">
        <span class="index-runtime-metric" title="\u672C\u6B21\u9801\u9762\u521D\u59CB\u5316\u5230\u72C0\u614B\u56DE\u61C9\u5B8C\u6210\u7684\u7E3D\u6642\u9593\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(ge(a))}</strong></span>
        <span class="index-runtime-metric" title="\u5F8C\u7AEF /api/status \u6AA2\u67E5\u968E\u6BB5\u7684\u5408\u8A08\u6642\u9593\u3002"><span>Server</span><strong>${r(ge(h))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u8ACB\u6C42\u6642\u9593\u6263\u6389\u5F8C\u7AEF\u6AA2\u67E5\u5F8C\u7684\u50B3\u8F38\u8207\u6392\u968A\u6642\u9593\u3002"><span>HTTP \u50B3\u8F38</span><strong>${r(ge(y))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u9AA8\u67B6\u8207\u8F09\u5165\u6A21\u7D44\u7684\u6642\u9593\u3002"><span>\u9801\u9762\u521D\u59CB\u5316</span><strong>${r(ge(v))}</strong></span>
        <span class="index-runtime-metric" title="\u8017\u6642\u6700\u9577\u7684\u6AA2\u67E5\u968E\u6BB5\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${u?.label||"\u2014"} \xB7 ${ge(_s(u))}`)}</strong></span>
        <span class="index-runtime-metric" title="\u5B8C\u6210\u7684\u6AA2\u67E5\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\uFF1B\u5931\u6557\u968E\u6BB5\u6703\u4EE5\u7D05\u8272\u6A19\u793A\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${c(l)} / ${c(s.length)}${d?` \xB7 \u5931\u6557 ${c(d)}`:""}</strong></span>
      </div>
    </div>
    <div class="status-wf-summary">
      <span>\u6AA2\u67E5 <strong>${r(Se(e.checked_at))}</strong></span>
      <span>API <strong class="mono">${r(Ss())}</strong></span>
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
      <div class="rag-wf-stages">${k}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u986F\u793A\u672C\u6B21\u958B\u555F\u670D\u52D9\u7E3D\u89BD\u7684\u9801\u9762\u521D\u59CB\u5316\u3001HTTP \u5F80\u8FD4\u3001\u5F8C\u7AEF\u6AA2\u67E5\u8207\u56DE\u61C9\u5F59\u6574\u3002\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u5931\u6557\u968E\u6BB5\u4EE5\u7D05\u8272\u6A19\u793A\uFF0C\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\uFF1B\u6975\u77ED\u968E\u6BB5\u4FDD\u7559\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function Lg(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=hg(e.status),n=s.find(u=>u.id==="qdrant"),i=s.find(u=>u.id==="rag"),o=s.find(u=>u.id==="llm"),l=Kt(),d=hc[l]||l;return`<section class="status-hero">
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
          <span>${m("clock",11)} \u6AA2\u67E5\u6642\u9593 ${Se(e.checked_at)} \xB7 ${r(ga(e.checked_at))}</span>
          <span>${m("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${m("database",11)} ${c(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${m("layers",11)} ${c(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${r(d)}">${m("link",11)} ${r(Ss())}</span>
        </div>
      </div>
    </section>

    ${Mg(e)}

    <div class="service-grid">${s.map(vg).join("")}</div>

    ${Ag(e)}

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

    ${n?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${Ge({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${r(n?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${r(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${r(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}`}function jg(e,t=!1){let s=Array.isArray(e.services)?e.services:[],a=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Pipelines \u2192 Data \xB7 \u6700\u65B0\u5C08\u6848\u5143\u4EF6\u8207\u5373\u6642\u5065\u5EB7\u72C0\u614B</div>
      </div>
      <span class="badge badge-neutral badge-mono">${c((a.flow||[]).length)} layers</span>
    </div>
    ${yg(a,s,t)}
  </div>`}function Tg(e){let t=Array.isArray(e.endpoints)?e.endpoints:[],s=Kt(),a=hc[s]||s,n=St("/api/docs"),i=St("/api/openapi.json"),o=new Set(t.map(u=>yc(u.path).id)),l=t.reduce((u,h)=>{let y=String(h.method||"GET").toUpperCase();return u[y]=(u[y]||0)+1,u},{}),d=["GET","POST","PATCH","PUT","DELETE"].filter(u=>l[u]).map(u=>`${u} ${c(l[u])}`).join(" \xB7 ");return`<section class="status-hero api-endpoint-hero">
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
          <span>${m("server",11)} API Base <span class="mono">${r(Ss())}</span>\uFF08${r(a)}\uFF09</span>
          <span>${m("terminal",11)} ${r(d||"\u2014")}</span>
          <span>${m("clock",11)} \u66F4\u65B0\u6642\u9593 ${Se(e.checked_at)}</span>
        </div>
      </div>
      <div class="api-endpoint-actions">
        <a class="btn btn-secondary btn-sm" href="${r(n)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>Swagger UI</span></a>
        <a class="btn btn-ghost btn-sm" href="${r(i)}" target="_blank" rel="noopener noreferrer">OpenAPI JSON ${m("external",11)}</a>
      </div>
    </section>
    ${Sg(t)}
    <p class="status-footnote">\u7AEF\u9EDE\u7531 FastAPI route table \u52D5\u614B\u7522\u751F\uFF1B\u4E92\u52D5\u5F0F\u6587\u4EF6\u4F4D\u65BC <a href="${r(n)}" target="_blank" rel="noopener noreferrer"><code>${r(n)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${r(i)}" target="_blank" rel="noopener noreferrer"><code>${r(i)}</code></a>\u3002\u7AEF\u9EDE\u8B8A\u66F4\u5F8C\u91CD\u65B0\u6574\u7406\u6B64\u9801\u5373\u53EF\u53D6\u5F97\u6700\u65B0\u6E05\u55AE\u3002</p>`}function Eg(e,t={}){let s=e.data||{},a=t.info||null,n=a?.counts||{},i=Number(s.judgment_indexed_count||0),o=Number(s.judgment_count||0),l=Number(s.judgment_index_remaining??Math.max(0,o-i)),d=Number(s.judgment_index_pending??l)||0,u=Number(s.judgment_index_changed||0),h=Number(s.judgment_index_stale||0),y=o>0?Math.max(0,Math.min(100,i/o*100)):null,v=Hn(y),p=s.judgment_index_fresh===!1||d>0||String(s.judgment_index_staleness?.status||"")==="stale",b=p?"is-warn":"",w=s.last_version||{},M=s.last_run||{},k=w.source_type==="law"?"\u6CD5\u898F":w.source_type==="order"?"\u547D\u4EE4":"\u2014",S=w.version_code?String(w.version_code):w.id?`#${c(w.id)}`:"\u2014",f=Number(s.legal_article_indexed_count||s.legal_index?.points_count||0),T=Number(s.legal_article_count||s.legal_index?.article_count||0),V=T>0?Math.max(0,Math.min(100,f/T*100)):null,Q=s.legal_article_stale===!0||String(s.legal_index?.status||"")==="stale",fe=Q?"is-warn":"",ve=s.judgment_vector_alias||"\u2014",se=s.judgment_vector_collection||"\u2014",L=s.legal_article_vector_alias||s.legal_index?.alias||"\u2014",q=s.legal_article_vector_collection||s.legal_index?.collection||"\u2014",E=p?"\u5224\u6C7A\u7D22\u5F15\u5F85\u66F4\u65B0":"\u8CC7\u6599\u7248\u672C\u4E00\u81F4",K=p?`\u5224\u6C7A\u7D22\u5F15\u5C1A\u7F3A ${c(d)} \u7B46`:"\u5224\u6C7A\u8CC7\u6599\u8207\u5411\u91CF\u7D22\u5F15\u4E00\u81F4",de=p?`PostgreSQL \u76EE\u524D\u6709 ${c(o)} \u7B46\u5224\u6C7A\uFF0CQdrant ${se} \u5DF2\u7D22\u5F15 ${c(i)} \u7B46\uFF1B\u5C1A\u6709 ${c(d)} \u7B46\u5F85\u7D22\u5F15\u3002`:"PostgreSQL \u8207 Qdrant \u5224\u6C7A\u7B46\u6578\u4E00\u81F4\uFF1B\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u8207\u7D22\u5F15\u72C0\u614B\u540C\u6B65\u3002",H=Yt(M.status||"idle").label,ie=M.finished_at||M.started_at;return`<section class="status-hero data-version-hero">
      <div class="status-hero-main">
        <div class="overall-row">
          <span class="overall-badge ${b}">
            <span class="status-dot ${p?"is-warn":"is-ok"}" aria-hidden="true"></span>
            ${r(E)}
          </span>
          <span class="badge badge-neutral badge-mono">${c(s.version_count)} \u500B\u8CC7\u6599\u7248\u672C</span>
          <span class="badge badge-neutral">${r(k)} \u6700\u65B0\u7248\u672C ${r(S)}</span>
        </div>
        <h2 class="status-headline">${r(K)}</h2>
        <p class="status-copy">${r(de)}</p>
        <div class="status-meta">
          <span>${m("clock",11)} \u6AA2\u67E5\u6642\u9593 ${Se(e.checked_at)}</span>
          <span>${m("database",11)} \u73FE\u884C\u8CC7\u6599 ${c(s.total_current)} \u7B46</span>
          <span>${m("layers",11)} \u539F\u59CB Parquet ${c(s.parquet_files)} \u500B \xB7 ${Pe(s.parquet_bytes)}</span>
          <span title="Qdrant alias \u8207\u76EE\u524D\u7248\u672C collection">${m("link",11)} <span class="mono">${r(ve)} \u2192 ${r(se)}</span></span>
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
        <div class="metric-foot">${c(s.parquet_files)} \u500B\u539F\u59CB Parquet \xB7 ${Pe(s.parquet_bytes)}</div>
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
          <span class="side-card-title">${m("database",14)}PostgreSQL \u8CC7\u6599\u7248\u672C</span>
          ${at(w.is_current?"operational":"degraded",w.is_current?"CURRENT":"HISTORY")}
        </div>
        ${w.id?`<div class="index-current-row">
                <span class="badge badge-info">${m("activity",11)}${r(k)} ${r(S)}</span>
                <strong class="mono">${Se(w.downloaded_at)}</strong>
                <span class="index-current-copy" title="${r(w.parquet_path||"")}">${r(w.parquet_path||"\u2014")}</span>
              </div>
              <div class="data-version-facts">
                ${Ve("\u8CC7\u6599\u7248\u672C\u7E3D\u6578",c(s.version_count),{mono:!0})}
                ${Ve("\u4E0B\u8F09\u57F7\u884C\u7E3D\u6578",c(s.run_count),{mono:!0})}
                ${Ve("\u7248\u672C ID",`#${c(w.id)}`,{mono:!0})}
                ${Ve("\u8CC7\u6599\u985E\u578B",k)}
                ${Ve("\u4F86\u6E90\u66F4\u65B0\u65E5",w.update_date||"\u2014")}
                ${Ve(`${k}\uFF0F\u689D\u6587`,`${c(w.law_count)} / ${c(w.article_count)}`)}
                ${Ve("\u4E0B\u8F09\u6642\u9593",Se(w.downloaded_at),{mono:!0})}
                ${Ve("\u8CC7\u6599\u72C0\u614B",w.is_current?"current":"history",{mono:!0})}
                ${Ve("Parquet \u6A94\u6848",w.parquet_path||"\u2014",{mono:!0,wide:!0})}
              </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${m("browser",14)}IndexedDB \u672C\u6A5F\u8CC7\u6599</span>
          <span class="badge ${a?.available?"badge-ok":"badge-neutral"} badge-mono">${r(a?.mode==="memory"?"MEMORY":a?"INDEXEDDB":"LOADING")}</span>
        </div>
        ${a?`<div class="index-current-row">
                <span class="badge badge-info">${m("database",11)}${r(a.name||"judgment-console")} v${c(a.version)}</span>
                <strong class="mono">${c(a.total)} \u7B46</strong>
                <span class="index-current-copy">${c(n.query_history)} \u5247\u63D0\u554F \xB7 ${c(n.audit_events)} \u7B46\u7A3D\u6838 \xB7 ${c(n.settings)} \u9805\u8A2D\u5B9A</span>
              </div>
              <div class="data-version-facts">
                ${Ve("Schema \u7248\u672C",`v${c(a.version)}`,{mono:!0})}
                ${Ve("\u5132\u5B58\u6A21\u5F0F",a.mode||"\u2014",{mono:!0})}
                ${Ve("query_history",`${c(n.query_history)} / ${c(a.caps?.history)}`,{mono:!0})}
                ${Ve("audit_events",`${c(n.audit_events)} / ${c(a.caps?.audit)}`,{mono:!0})}
                ${Ve("settings",c(n.settings),{mono:!0})}
                ${Ve("\u7E3D\u7D00\u9304\u6578",c(a.total),{mono:!0})}
                ${Ve("\u5DF2\u7528\u5BB9\u91CF",Pe(a.usage_bytes),{mono:!0})}
                ${Ve("\u53EF\u7528\u914D\u984D",Pe(a.quota_bytes),{mono:!0})}
              </div>
              <p class="data-version-note">${m("info",12)}
                IndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u7AEF\u63D0\u554F\u6B77\u53F2\u3001\u8A2D\u5B9A\u8207\u7248\u672C\u7A3D\u6838\u4E8B\u4EF6\uFF1B\u4F3A\u670D\u5668\u8CC7\u6599\u4EE5 PostgreSQL \u8207 Parquet \u70BA\u6E96\u3002
              </p>`:`<div class="report-empty-inline">${t.loading||!t.error?"\u6B63\u5728\u8B80\u53D6\u700F\u89BD\u5668 IndexedDB\u2026":r(t.error?.message||"IndexedDB \u5C1A\u7121\u8CC7\u6599\u6216\u7121\u6CD5\u8B80\u53D6\u3002")}</div>`}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${m("brain",14)}Qdrant \u5224\u6C7A\u5411\u91CF\u7D22\u5F15</span>
          ${at(p?"degraded":"operational",p?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${m("link",11)}Alias</span>
          <strong class="mono">${r(ve)}</strong>
          <span class="mono">\u2192 ${r(se)}</span>
          <span class="index-current-copy">v#${c(s.judgment_vector_version_id)} \xB7 ${r(s.judgment_vector_model||"\u2014")}</span>
        </div>
        ${gc("\u7D22\u5F15\u8986\u84CB",y,`\u5DF2\u7D22\u5F15 ${c(i)} / ${c(o)} \u7B46 \xB7 \u5269\u9918 ${c(d)} \u7B46`,b)}
        <div class="data-version-facts">
          ${Ve("Qdrant points",c(s.judgment_vector_points),{mono:!0})}
          ${Ve("\u7D22\u5F15\u7248\u672C",`#${c(s.judgment_vector_version_id)} \xB7 ${s.judgment_vector_version_status||"legacy"}`,{mono:!0})}
          ${Ve("\u524D\u4E00\u7248\u672C",s.judgment_vector_previous_version_id?`#${c(s.judgment_vector_previous_version_id)}`:"\u2014",{mono:!0})}
          ${Ve("\u5F85\u88DC\uFF0F\u8B8A\u66F4\uFF0F\u5931\u6548",`${c(d)} / ${c(u)} / ${c(h)}`)}
          ${Ve("\u6700\u8FD1\u7D22\u5F15",Se(s.judgment_indexed_at),{mono:!0})}
          ${Ve("\u6A21\u578B",s.judgment_vector_model||"\u2014",{mono:!0})}
        </div>
        ${d>0?`<p class="data-version-note is-warn">${m("info",12)}\u5C1A\u6709 ${c(d)} \u7B46\u5224\u6C7A\u5C1A\u672A\u7D22\u5F15\uFF1B\u8ACB\u81F3\u300C\u8CC7\u6599\u8655\u7406 \u2192 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u63A5\u7E8C\u88DC\u9F4A\u3002</p>`:""}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${m("shield",14)}Qdrant \u6CD5\u898F\uFF0F\u547D\u4EE4\u5411\u91CF\u7D22\u5F15</span>
          ${at(Q?"degraded":"operational",Q?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${m("link",11)}Alias</span>
          <strong class="mono">${r(L)}</strong>
          <span class="mono">\u2192 ${r(q)}</span>
          <span class="index-current-copy">v#${c(s.legal_article_vector_version_id||s.legal_index?.version_id)}</span>
        </div>
        ${gc("\u689D\u6587\u7D22\u5F15\u8986\u84CB",V,`\u5DF2\u7D22\u5F15 ${c(f)} / ${c(T)} \u689D`,fe)}
        <div class="data-version-facts">
          ${Ve("Qdrant points",c(f),{mono:!0})}
          ${Ve("\u73FE\u884C\u689D\u6587",c(T),{mono:!0})}
          ${Ve("\u5411\u91CF\u7DAD\u5EA6",c(s.legal_index?.dimension),{mono:!0})}
          ${Ve("\u6700\u8FD1\u7D22\u5F15",Se(s.legal_article_indexed_at||s.legal_index?.indexed_at),{mono:!0})}
          ${Ve("\u7D22\u5F15\u72C0\u614B",Q?"stale":"fresh",{mono:!0})}
          ${Ve("Collection",q,{mono:!0})}
        </div>
      </section>

      <section class="card data-version-card is-wide-grid">
        <div class="side-card-head">
          <span class="side-card-title">${m("folder",14)}Parquet \u8207\u57F7\u884C\u72C0\u614B</span>
          <span class="badge badge-neutral badge-mono">${c(s.parquet_files)} FILES</span>
        </div>
        <div class="data-version-facts">
          ${Ve("\u539F\u59CB Parquet \u6A94\u6848",c(s.parquet_files),{mono:!0})}
          ${Ve("\u5408\u8A08\u5BB9\u91CF",Pe(s.parquet_bytes),{mono:!0})}
          ${Ve("PostgreSQL \u73FE\u884C\u8CC7\u6599",c(s.total_current),{mono:!0})}
          ${Ve("\u8CC7\u6599\u7248\u672C\u7E3D\u6578",c(s.version_count),{mono:!0})}
          ${Ve("\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C",M.status?H:"\u2014")}
          ${Ve("\u6700\u8FD1\u57F7\u884C\u6642\u9593",ie?Se(ie):"\u2014",{mono:!0})}
          ${Ve("\u6700\u8FD1\u57F7\u884C\u8017\u6642",M.duration_ms?ge(M.duration_ms):"\u2014",{mono:!0})}
          ${Ve("\u6700\u8FD1\u57F7\u884C\u7248\u672C",M.version_id?`#${c(M.version_id)}`:"\u2014",{mono:!0})}
        </div>
        <p class="data-version-note">${m("info",12)}
          \u539F\u59CB Parquet \u4FDD\u7559 raw\uFF0Fdelta \u8207 manifest\uFF1BPostgreSQL \u63D0\u4F9B current metadata \u8207\u7248\u672C\u72C0\u614B\uFF1BQdrant \u53EA\u4FDD\u5B58\u5411\u91CF\u8207 payload\u3002
        </p>
      </section>
    </div>`}function Ng(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${c(t.run_count)} TOTAL</span>
    </div>
    ${xg(e.recent_runs)}
  </section>`}function Rg(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function wc(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function zs(e,t,s,a,n){let i=Rg(n);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${m(t,14)}${r(e)}</span>
      <strong>${r(s)}</strong>
    </div>
    ${wc(n,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function Cg(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${m("layers",14)}Docker</span>
        ${at("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${r(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,d=o.service?0:1;return l-d||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${r(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${r(i.service)}</span>`:""}</td>
        <td>${at(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
        <td class="cell-number">${i.cpu_percent===null||i.cpu_percent===void 0?"\u2014":`${c(i.cpu_percent)}%`}</td>
        <td class="cell-number">${Pe(i.memory_used)}${i.memory_limit?` / ${Pe(i.memory_limit)}`:""}</td>
        <td class="mono">${r(i.net_io||"\u2014")}</td>
        <td class="mono">${r(i.block_io||"\u2014")}</td>
        <td class="cell-number">${c(i.pids)}</td>
      </tr>`).join(""),n=(t.system||[]).map(i=>`<span class="resource-docker-pill">
        <strong>${r(i.type||"\u2014")}</strong>
        <span>${c(i.count)} \xB7 ${r(i.size||"\u2014")}</span>
      </span>`).join("");return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("layers",14)}Docker \u5BB9\u5668\u4F7F\u7528\u8CC7\u6E90</span>
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
  </section>`}function Pg(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",n=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${ws("\u8CC7\u6599\u5EAB",`<code>${r(s.database||"\u2014")}</code>`)}
           ${ws("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${Pe(s.storage_bytes)}</strong>`)}
           ${ws("Docker volume",`<strong>${Pe(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${ws("\u9023\u7DDA\u6578",`<strong>${c(s.connections)}</strong>`)}`:`${ws("Collection",`<code>${r(s.collection||"\u2014")}</code>`)}
           ${ws("Docker volume",`<strong>${Pe(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${ws("\u5411\u91CF\u9EDE\u6578",`<strong>${c(s.points_count)}</strong>`)}
           ${ws("Collections",`<strong>${c(s.collections)}</strong>`)}
           ${ws("Segments",`<strong>${c(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${r(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${r(s.kind||"")}</div>
          </div>
          ${at(i)}
        </div>
        <div class="resource-db-metrics">
          <div><span>CPU</span><strong>${s.cpu_percent===null||s.cpu_percent===void 0?"\u2014":`${c(s.cpu_percent)}%`}</strong></div>
          <div><span>RAM</span><strong>${Pe(s.memory_used)}</strong><small>${s.memory_limit?` / ${Pe(s.memory_limit)}`:""}</small></div>
          <div><span>\u5BB9\u5668</span><strong class="mono">${r(s.container||"\u2014")}</strong><small>${r(s.container_status||"\u2014")}</small></div>
        </div>
        <div class="detail-list">${o}</div>
        ${n.length?`<div class="resource-table-wrap">
                <table class="data-table is-compact">
                  <thead><tr><th scope="col">\u8CC7\u6599\u8868</th><th scope="col">\u5927\u5C0F</th></tr></thead>
                  <tbody>${n.map(l=>`<tr>
                        <td class="mono">${r(l.name||"\u2014")}</td>
                        <td class="cell-number">${Pe(l.bytes)}</td>
                      </tr>`).join("")}</tbody>
                </table>
              </div>`:""}
        <div class="side-card-foot">${r(s.detail||"")}</div>
      </article>`}).join("")}</div>`}function oa(e,t,s,a){let n=Number(t)||0,i=a?n/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${r(e)}</span>
      <strong>${Pe(n)}</strong>
    </div>
    ${wc(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function Ig(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},n=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},d=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${Pe(d)}</span>
    </div>
    <div class="storage-list">
      ${oa("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${r(s.frontend_path||"\u2014")}</span>`,d)}
      ${oa("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${r(s.backend_path||"\u2014")}</span>`,d)}
      ${oa("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",n.layers_bytes,`Images ${Pe(n.images_bytes)} \xB7 Containers ${Pe(n.containers_bytes)} \xB7 Build cache ${Pe(n.build_cache_bytes)}`,d)}
      ${oa("PostgreSQL volume",o.size_bytes,`<span class="mono">${r(o.name||"\u2014")}</span>`,d)}
      ${oa("Qdrant volume",l.size_bytes,`<span class="mono">${r(l.name||"\u2014")}</span>`,d)}
      ${oa("Parquet",a.total_bytes,`\u6CD5\u898F ${Pe(a.law_bytes)} \xB7 \u5224\u6C7A ${Pe(a.judgment_bytes)}`,d)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${Pe(d)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function Dg(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},n=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),d=Array.isArray(e.disk)?e.disk:[],u=d[0]||{},h=Number(o.total_bytes||u.total||0),y=h?l/h*100:0,v=[s.load_1,s.load_5,s.load_15].map(w=>w??"\u2014").join(" / "),p=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":ge(Number(t.uptime_seconds)*1e3),b=[u.label?zs("HDD \u5DF2\u4F7F\u7528","database",`${c(u.percent)}%`,`${Pe(u.used)} / ${Pe(u.total)} \xB7 \u5269\u9918 ${Pe(u.free)}<br><span class="mono">${r(u.path||"")}</span>`,u.percent):"",l?zs("Judgment \u5143\u4EF6\u5408\u8A08","layers",Pe(l),`\u7D04\u5360 HDD ${c(y)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,y):"",...d.slice(1).map(w=>zs(`\u786C\u789F \xB7 ${w.label}`,"layers",`${c(w.percent)}%`,`${Pe(w.used)} / ${Pe(w.total)} \xB7 \u5269\u9918 ${Pe(w.free)}<br><span class="mono">${r(w.path||"")}</span>`,w.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${Se(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${zs("CPU \u4F7F\u7528\u7387","cpu",`${c(s.percent)}%`,`${c(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${c(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${r(v)}`,s.percent)}
      ${zs("\u8A18\u61B6\u9AD4","server",`${c(a.percent)}%`,`${Pe(a.used)} / ${Pe(a.total)} \xB7 \u53EF\u7528 ${Pe(a.available)}`,a.percent)}
      ${zs("Swap","layers",`${c(n.percent)}%`,`${Pe(n.used)} / ${Pe(n.total)}`,n.percent)}
      ${zs("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${c(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${r(p)}<br>${r(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${b||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${Ig(e)}
    ${Cg(e)}
    ${Pg(e)}`}function fc(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function Bg(e){return`<div class="report-card">
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
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Fg(e){return e.status==="operational"?{label:"\u5DF2\u9023\u7DDA",badge:"badge-ok"}:{label:"\u7121\u6CD5\u9023\u7DDA",badge:"badge-danger"}}function Og(e,t){let s=Fg(e),a=Array.isArray(e.models)?e.models:[],n=a.length?a.map(i=>{let o=String(i.name||""),l=e.chat_model===o,d=e.embedding_model===o,u=i.size?Pe(i.size):"",h=i.modified_at?Se(i.modified_at):"",y=new Set((i.capabilities||[]).map(p=>String(p||"").toLowerCase())),v=[];return i.supports_chat===!0&&v.push(["Chat","badge-ok"]),y.has("embedding")&&v.push(["Embedding","badge-info"]),y.has("vision")&&v.push(["Vision","badge-neutral"]),y.has("tools")&&v.push(["Tools","badge-neutral"]),y.has("thinking")&&v.push(["Thinking","badge-neutral"]),y.has("speech")&&v.push(["Speech","badge-warn"]),i.is_reranker&&v.push(["Reranker","badge-neutral"]),v.length||v.push([i.capability_status==="untested"?"\u672A\u6E2C\u8A66":"\u7121 chat \u80FD\u529B","badge-neutral"]),`<div class="ollama-model-row">
            <div class="ollama-model-main">
              <strong>${r(o)}</strong>
              <span class="ollama-model-meta">${[u,h].filter(Boolean).map(p=>r(p)).join(" \xB7 ")||"\u2014"}</span>
              <div class="ollama-model-capabilities">${v.map(([p,b])=>`<span class="badge ${b}">${r(p)}</span>`).join("")}</div>
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
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="edit-host" data-id="${e.id}">${m("edit",13)}<span>\u7DE8\u8F2F</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="delete-host" data-id="${e.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
      </div>
    </div>
    <div class="ollama-model-list">${n}</div>
  </article>`}function Hg(e,t,s,a){if(s)return`<div class="report-card">
      ${Ge({tone:"danger",title:"Model Provider \u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${m("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=e||{hosts:[],active_host_id:null},i=Array.isArray(n.hosts)?n.hosts:[],o=a?i.find(u=>Number(u.id)===Number(a)):null,l=o?o.base_url.replace(new RegExp(`:${o.port}$`),""):"http://127.0.0.1",d=o?"\u5132\u5B58\u8B8A\u66F4":"\u65B0\u589E\u4E3B\u6A5F";return`<div class="report-card ollama-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">MODEL PROVIDER</div>
        <div class="report-title">llama-server \u4E3B\u6A5F\u8207\u6A21\u578B</div>
        <div class="report-sub">\u7BA1\u7406\u53EF\u7528\u7684 llama-server \u9023\u7DDA\u3001\u76EE\u524D\u4F7F\u7528\u7684\u4E3B\u6A5F\uFF0C\u4EE5\u53CA\u4E3B\u6A5F\u4E0A\u7684\u804A\u5929\uFF0F\u5D4C\u5165\u6A21\u578B\u3002\u6BCF\u6B21\u958B\u555F\u6B64\u9801\u90FD\u6703\u91CD\u65B0\u53D6\u5F97\u4E3B\u6A5F\u8207\u6A21\u578B\u5217\u8868\uFF1Bembedding \u4E3B\u6A5F\u7684\u512A\u5148\u9806\u5E8F\u53EF\u5230\u300C\u8CC7\u6599\u8655\u7406\u300D\u7684\u57F7\u884C\u8CC7\u8A0A\u5361\u7247\u62D6\u79FB\u8ABF\u6574\u3002</div>
      </div>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="check-capabilities">${m("shield",14)}<span>\u6AA2\u67E5\u6A21\u578B\u80FD\u529B</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${m("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span></button>
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
          <button class="btn btn-primary btn-sm" type="submit">${m("check",13)}<span>${d}</span></button>
          ${o?'<button class="btn btn-ghost btn-sm" type="button" data-ollama-action="cancel-host-edit">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
        </div>
      </form>
      ${t?'<div class="ollama-loading"><span class="spinner"></span><span>\u8B80\u53D6 llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span></div>':i.length?`<div class="ollama-host-list">${i.map(u=>Og(u,a)).join("")}</div>`:xt({iconName:"server",title:"\u5C1A\u672A\u8A2D\u5B9A llama-server \u4E3B\u6A5F",text:"\u8ACB\u5728\u4E0A\u65B9\u8F38\u5165\u7DB2\u5740\u8207 Port \u65B0\u589E\uFF0C\u6216\u4F7F\u7528 .env \u7684\u9810\u8A2D\u9023\u7DDA\u3002"})}
      <p class="report-sub" style="margin-top:12px">\u8A2D\u70BA\u804A\u5929\u6216\u5D4C\u5165\u6A21\u578B\u5F8C\uFF0C\u7CFB\u7D71\u6703\u4F7F\u7528\u76EE\u524D\u4E3B\u6A5F\u7684\u5C0D\u61C9\u6A21\u578B\u57F7\u884C AI \u51FA\u984C\u8207 RAG\uFF1B\u672A\u8A2D\u5B9A\u6642\u6CBF\u7528 .env \u7684 LLM_MODEL\uFF0FEMBEDDING_MODEL\u3002</p>
    </div>
  </div>`}function zg(e,t,s,a=!1){let n=e?.data||{},i=e?Yt(e.status):null,o=s?Yt(s.status):null,l={overview:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(i.label)}</span>`:"",resources:o?`<span class="badge ${o.tone==="ok"?"badge-ok":o.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(o.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${c(n.version_count)}</span>`,tests:'<span class="badge badge-neutral badge-mono">TEST</span>',"local-model":'<span class="badge badge-neutral badge-mono">LLAMA-SERVER</span>',runs:`<span class="badge badge-neutral badge-mono">${c(n.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${$c.map(d=>{let u=d.id===t,h=a&&vc.has(d.id);return`<button class="status-tab${u?" is-active":""}${h?" is-demo-locked":""}" type="button"
          data-status-tab="${d.id}" ${u?'aria-current="page"':""} ${h?'data-demo-lock-tooltip="\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B\u6B64\u7BA1\u7406\u529F\u80FD"':""}>
          <span class="status-tab-icon">${m(d.icon,15)}</span>
          <span class="status-tab-copy">
            <strong>${r(d.label)}</strong>
            <small>${r(d.hint)}</small>
          </span>
          ${h?'<span class="badge badge-neutral badge-mono">LOCK</span>':l[d.id]||""}
        </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u6AA2\u67E5\u6642\u9593</span>
      <span class="mono">${r(e?Se(e.checked_at):"\u2014")}</span>
    </div>`}function Ug(e,t,s,a,n,i,o,l=!1){if(e==="resources")return s?Dg(s):a?fc():n?Bg(n):fc();if(e==="local-model"){let d=i||{},u=!!d.loading||!d.hosts&&!d.error;return Hg(d.hosts||null,u,d.error||null,d.editingId||null)}return e==="architecture"?jg(t,l):e==="api"?Tg(t):e==="data"?Eg(t,o):e==="runs"?Ng(t):Lg(t)}function Gg(){return`<div class="status-hero">
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
    </div>`}function bc(e){return`<div class="report-card">
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
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function Qg(e,t){let s=Zt(),a=!1,n=null,i=null,o="overview",l=null,d=!1,u=null,h=null,y=!1,v=null,p=null,b=null,w=!1,M=null,k=!1,S=!1,f=null,T=0,V="",Q="",fe=performance.now(),ve=new Date().toISOString(),se=!1;e.innerHTML=`<section class="page status-page">
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
          ${Array.from({length:8}).map(()=>'<div class="skeleton skeleton-line" style="width:100%;height:52px;margin-top:8px"></div>').join("")}
        </div>
      </aside>
      <section class="status-panel" id="status-content">${Gg()}</section>
    </div>
  </section>`;let L=e.querySelector("#status-nav"),q=e.querySelector("#status-content"),E=e.querySelector("#refresh-status"),K=e.querySelector("#auto-refresh"),de=()=>{if(T+=1,typeof f=="function")try{f()}catch{}f=null,k=!1,S=!1},H=async()=>{let le=++T;S=!0,Q="",q.innerHTML="";try{let ee=await xi(q,{setTitle:()=>{}},{embedded:!0});if(le!==T||o!=="tests"){typeof ee=="function"&&ee();return}f=typeof ee=="function"?ee:null,k=!0}catch(ee){le===T&&o==="tests"&&(q.innerHTML=bc(ee))}finally{le===T&&(S=!1)}},ie=()=>{if(!i)return;let le=zg(i,o,l,s);if(le!==V&&(L.innerHTML=le,V=le),s&&vc.has(o)){de();let Me=Is("\u6B64\u5206\u985E\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u670D\u52D9\u7E3D\u89BD\u3001\u524D\u5F8C\u7AEF\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u4E0B\u8F09\uFF1B\u7CFB\u7D71\u6E2C\u8A66\u3001\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528\u3001Model Provider \u8207 OpenAPI \u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002");q.innerHTML!==Me&&(q.innerHTML=Me),Q=Me;return}if(o==="tests"){!k&&!S&&H();return}de();let ee=Ug(o,i,l,d,u,{hosts:h,loading:y,error:v,editingId:p},{info:b,loading:w,error:M},s);ee!==Q&&(q.innerHTML=ee,Q=ee)},Te=async({quiet:le=!1}={})=>{if(!d){d=!0,u=null,o==="resources"&&!l&&ie();try{let ee=await G.systemUsage();if(a)return;l=ee}catch(ee){if(a)return;u=ee,le||N(ee.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{a||(d=!1,o==="resources"&&ie())}}},B=async({quiet:le=!1}={})=>{if(!w){w=!0,M=null,o==="data"&&!b&&ie();try{let ee=await vo();if(a)return;b=ee}catch(ee){if(a)return;M=ee,le||N(ee.message||"\u7121\u6CD5\u8B80\u53D6 IndexedDB\u3002","danger")}finally{a||(w=!1,o==="data"&&ie())}}},qe=async({quiet:le=!1}={})=>{if(!y){y=!0,v=null,o==="local-model"&&!h&&ie();try{let ee=await G.ollamaHosts();if(a)return;h=ee}catch(ee){if(a)return;v=ee,le||N(ee.message||"\u7121\u6CD5\u53D6\u5F97 llama-server \u4E3B\u6A5F\u3002","danger")}finally{a||(y=!1,o==="local-model"&&ie())}}},ae=async()=>{await qe({quiet:!0}),await Le({quiet:!0})},Le=async({quiet:le=!1,status:ee=null}={})=>{le||(E.disabled=!0,Re(E,!0,"\u6AA2\u67E5\u4E2D\u2026"));let Me=performance.now(),ye=new Date().toISOString(),_e=Me,je=ye;try{let D=ee||await G.status();if(_e=performance.now(),je=new Date().toISOString(),a)return;let F=!ee&&!se?Math.max(0,Me-fe):0;D.page_pipeline=D.pipeline||!i?.page_pipeline?qg(D,{initMs:F,initStartedAt:ve,requestStartedAt:ye,requestFinishedAt:je,requestMs:_e-Me}):i.page_pipeline,se=!0,i=D,cs(mc,D),ie(),le||N("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(D){if(a)return;o!=="tests"&&(Q="",q.innerHTML=bc(D)),le||N(D.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{a||(E.disabled=!1,Re(E,!1))}},Ie=async({quiet:le=!1,status:ee=null}={})=>{if(await Le({quiet:le,status:ee}),!s&&(o==="resources"&&await Te({quiet:le}),o==="local-model"&&await qe({quiet:le}),!le&&o==="tests")){let Me=q.querySelector("#tests-refresh");Me&&Me.click()}};L.addEventListener("click",le=>{let ee=le.target.closest("[data-status-tab]");if(!ee)return;let Me=ee.dataset.statusTab;$c.some(ye=>ye.id===Me)&&(o=Me,ie(),!s&&(o==="resources"&&!l&&!d&&Te(),o==="data"&&!b&&!w&&B(),o==="local-model"&&qe()))}),q.addEventListener("click",le=>{le.target.closest("#status-retry")&&Le(),le.target.closest("#status-resources-retry")&&Te()}),q.addEventListener("click",async le=>{let ee=le.target.closest("[data-ollama-action]");if(!ee)return;let Me=ee.dataset.ollamaAction,ye=Number(ee.dataset.id||0);if(Me==="refresh-hosts"){await qe();return}if(Me==="edit-host"){p=ye,ie(),e.querySelector(".ollama-host-form")?.scrollIntoView({behavior:"smooth",block:"center"});return}if(Me==="cancel-host-edit"){p=null,ie();return}if(Me==="delete-host"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 llama-server \u4E3B\u6A5F #${ye}\uFF1F`))return;try{await G.deleteOllamaHost(ye),Number(p)===ye&&(p=null),N("llama-server \u4E3B\u6A5F\u5DF2\u522A\u9664\u3002","info"),await ae()}catch(_e){N(_e.message||"\u522A\u9664\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(Me==="activate-host"){try{await G.activateOllamaHost(ye),N("\u5DF2\u5207\u63DB\u4F7F\u7528\u7684 llama-server \u4E3B\u6A5F\u3002","ok"),await ae()}catch(_e){N(_e.message||"\u5207\u63DB\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(Me==="deactivate-host"){try{await G.deactivateOllamaHosts(),N("\u5DF2\u505C\u7528\u6307\u5B9A\u7684 llama-server \u4E3B\u6A5F\uFF0C\u5C07\u6CBF\u7528 .env \u8A2D\u5B9A\u3002","info"),await ae()}catch(_e){N(_e.message||"\u505C\u7528\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(Me==="check-capabilities"){Re(ee,!0,"\u6AA2\u67E5\u4E2D\u2026");try{await G.checkOllamaCapabilities(),N("\u5DF2\u66F4\u65B0\u6240\u6709\u4E3B\u6A5F\u7684\u6A21\u578B\u80FD\u529B\u3002","ok",4e3),await ae()}catch(_e){N(_e.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u80FD\u529B\u3002","danger",7e3)}finally{Re(ee,!1)}return}if(Me==="select-model"||Me==="clear-model"){let _e=String(ee.dataset.model||""),je=String(ee.dataset.role||"");try{Me==="select-model"?(await G.selectOllamaModel(ye,{model:_e,role:je}),N(`\u5DF2\u8A2D\u5B9A ${je==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\uFF1A${_e}`,"ok")):(await G.clearOllamaModel(ye,{model:_e,role:je}),N(`\u5DF2\u53D6\u6D88 ${je==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\u3002`,"info")),await ae()}catch(D){N(D.message||"\u6A21\u578B\u8A2D\u5B9A\u5931\u6557\u3002","danger")}}}),q.addEventListener("submit",async le=>{let ee=le.target.closest("form[data-ollama-form='host']");if(!ee)return;le.preventDefault();let Me=new FormData(ee),ye=Number(Me.get("host_id")||0),_e={name:String(Me.get("name")||"").trim(),url:String(Me.get("url")||"").trim(),port:Number(Me.get("port")||11434)};try{ye?(await G.updateOllamaHost(ye,_e),N("llama-server \u4E3B\u6A5F\u5DF2\u66F4\u65B0\u3002","ok")):(await G.addOllamaHost(_e),N("llama-server \u4E3B\u6A5F\u5DF2\u65B0\u589E\u3002","ok")),p=null,await ae()}catch(je){let D=je.detail||je.payload?.detail,F=D?.errors?.join(" \xB7 ")||D?.message||je.message||"\u5132\u5B58\u4E3B\u6A5F\u5931\u6557\u3002";N(F,"danger",8e3)}}),q.addEventListener("toggle",le=>{let ee=le.target.closest?.(".status-wf-stage[data-status-wf-stage]");if(!ee||!q.contains(ee))return;let Me=ee.dataset.statusWfStage||"";Me&&(ee.open?Ai.add(Me):Ai.delete(Me))},!0),E.addEventListener("click",()=>Ie());let Ee=()=>{n&&(n(),n=null)};K&&K.addEventListener("change",()=>{Ee(),K.checked&&(n=Et("status",(le,ee)=>{a||Ie({quiet:!0,status:ee?.snapshot||null})}),Ie({quiet:!0}),N("\u5DF2\u555F\u7528\u5F8C\u7AEF\u63A8\u9001\u81EA\u52D5\u66F4\u65B0\uFF08\u6BCF 30 \u79D2\uFF09\u3002","info",2200))});let Ze=bs(mc,120*1e3);return Ze?(i=Ze,se=!0,ie(),Le({quiet:!0})):await Le({quiet:!0}),B({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle(It),()=>{a=!0,de(),Ee()}}var _c="home",Mi={home:{page:Rr},rag:{page:ii},data:{page:Gr},quality:{page:Si},performance:{page:Yr},processing:{page:$i},status:{page:qi},tests:{page:On},admin:{page:xr}},Us=document.getElementById("app-main"),zn=null,Un=0;function Ra(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||_c;return Object.prototype.hasOwnProperty.call(Mi,t)?t:_c}function Wg(){try{let e=new URLSearchParams(window.location.search);if(!(!!e.get("q")?.trim()||!!e.get("share")?.trim())||Ra()==="rag")return;window.history.replaceState(null,"",`${window.location.pathname}${window.location.search}#/rag`)}catch{}}function Jg(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function Vg(e){return`<section class="page">
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
            <p>${r(e.message||"\u672A\u77E5\u932F\u8AA4")}</p>
          </div>
        </div>
        <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
          <button class="btn btn-secondary btn-sm" type="button" id="route-retry">
            ${m("refresh",14)}<span>\u91CD\u65B0\u8F09\u5165</span>
          </button>
        </div>
      </div>
    </div>
  </section>`}async function Gs(){let e=Ra(),t=++Un;Jg(e);let s=`#/${e}`,a=window.location.hash;if(a!==s&&!a.startsWith(`${s}/`)&&window.history.replaceState(null,"",s),typeof zn=="function"){try{zn()}catch{}zn=null}if(Ps(),!ta()){if(e==="admin"){document.title=It,Us.innerHTML=un();return}if(e==="tests"){document.title=It,Sr(Us,e);return}if(!ao()){document.title=It,no(Us);return}if(!kr(e)){document.title=It,Sr(Us,e);return}}document.title=It;let n={route:e,navigate(i){Mi[i]&&(window.location.hash=`#/${i}`)},setTitle(){t===Un&&(document.title=It)}};try{let i=Mi[e].page.render(Us,n);Vi(),window.scrollTo({top:0,behavior:"auto"}),Us.focus({preventScroll:!0});let o=await i;if(t!==Un){typeof o=="function"&&o();return}zn=typeof o=="function"?o:null}catch(i){if(t!==Un)return;console.error("Failed to render route",e,i),Us.innerHTML=Vg(i);let o=document.getElementById("route-retry");o&&o.addEventListener("click",()=>Gs()),N("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function Kg(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable))return;let a=Ra(),n=a==="home"?"home-question":a==="rag"?"rag-question":"";if(!n)return;let i=document.getElementById(n);i&&(e.preventDefault(),i.focus())})}function Yg(){let e=document.querySelector('[data-route="processing"]');if(!e)return;let t=e.querySelector(".nav-update-badge");t||(t=document.createElement("span"),t.className="nav-update-badge",t.hidden=!0,e.appendChild(t));let s=0,a=0,n=0,i=0,o=()=>{let d=[];s>0&&d.push(`\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0F\u5224\u6C7A\u6709 ${s} \u9805\u4F86\u6E90\u66F4\u65B0`),a>0&&d.push(`\u5224\u6C7A\u532F\u5165\u5F85\u8655\u7406 ${a} \u500B\u6708`),n>0&&d.push(`Qdrant \u5411\u91CF\u7D22\u5F15\u5F85\u88DC ${n} \u500B\u6708`),i>0&&d.push(`\u6CD5\u898F\uFF0F\u547D\u4EE4\u7D22\u5F15\u5F85\u91CD\u5EFA ${i} \u9805`);let u=s+a+n+i;if(!d.length||u<=0){t.hidden=!0;return}t.textContent=String(u),t.title=d.join("\uFF1B"),t.hidden=!1},l=async(d=null)=>{try{let u=d||await G.updatesStatus();s=Number(u.update_count)||0,u&&Object.prototype.hasOwnProperty.call(u,"import_pending_count")&&(a=Number(u.import_pending_count)||0),u&&Object.prototype.hasOwnProperty.call(u,"index_pending_count")&&(n=Number(u.index_pending_count)||0),u&&Object.prototype.hasOwnProperty.call(u,"legal_index_pending_count")&&(i=Number(u.legal_index_pending_count)||0),o()}catch{t.hidden=!0}};l(),Et("updates",(d,u)=>l(u?.snapshot||null)),window.addEventListener("judgment:processing-pending",d=>{a=Number(d.detail?.count)||0,d.detail&&Object.prototype.hasOwnProperty.call(d.detail,"index_pending")&&(n=Number(d.detail.index_pending)||0),d.detail&&Object.prototype.hasOwnProperty.call(d.detail,"legal_index_pending")&&(i=Number(d.detail.legal_index_pending)||0),o()}),window.addEventListener("judgment:updates-changed",()=>l())}function Xg(e,t){return!e||!t?!0:!!e.admin!=!!t.admin||!!e.enabled!=!!t.enabled||String(e.expiresAt||"")!==String(t.expiresAt||"")||JSON.stringify(e.features||{})!==JSON.stringify(t.features||{})}async function kc(){Wg();let e=Ra();e==="processing"?G.processing({cached:!0,slim:!0}).catch(()=>null):e==="quality"&&G.quality({cached:!0}).catch(()=>null);let t=to();t&&so(t);let s=dn();on(),Va(),Yi(),Kg();let a=!1,n=()=>{ta()&&!a&&(Yg(),a=!0)};window.addEventListener("hashchange",Gs),window.addEventListener("judgment:auth-changed",async()=>{let o=await dn();Xa(o.me),n(),Ps(),Gs()}),window.addEventListener("judgment:demo-denied",async()=>{let o=await dn();Xa(o.me),n(),Ps(),Gs()}),t&&(ur({user:t.me}),n(),Ps(),Gs());let i=await s;t?(Xa(i.me),n(),Ps(),Xg(t,i)&&Gs()):(ur({user:i.me}),n(),Ps(),Gs()),Ga()&&window.setTimeout(()=>{let o=Ra();(o==="rag"||o==="admin")&&(window.location.hash=ta()?"#/tests":"#/home")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",kc):kc();})();
