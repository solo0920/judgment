(()=>{var Fo=Object.defineProperty;var Zt=(e,t)=>{for(var s in t)Fo(e,s,{get:t[s],enumerable:!0})};var Va="judgment.api_base",Ka="judgment.admin_token",Xa="http://127.0.0.1:9200",ht=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function $r(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function Jt(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${$r(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function Za(e){let t=Jt(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function en(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?Jt(e.get("api")):null}catch{return null}}function tn(){try{let e=window.localStorage.getItem(Va);return e===null?null:Jt(e)}catch{return null}}function sn(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return Jt(e||"")}function Ot(){let e=en();if(e!==null)return e;let t=tn();if(t!==null)return t;let s=sn();return s||(window.location.protocol==="file:"?Xa:"")}function Ho(){if(en()!==null)return!0;let e=tn();return e!==null?!!e:!!sn()}function Tt(){return en()!==null?"query":tn()!==null?"storage":sn()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function na(){return Ho()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!$r(window.location.hostname)}function an(e){let t=Jt(e);try{t?window.localStorage.setItem(Va,t):window.localStorage.removeItem(Va)}catch{}return t}function ra(){try{return String(window.localStorage.getItem(Ka)||"").trim()}catch{return""}}function yr(e){let t=String(e||"").trim();try{t?window.localStorage.setItem(Ka,t):window.localStorage.removeItem(Ka)}catch{}return t}function Ya(){return Tt()==="query"?"":ra()}function es(e=Ot()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function dt(e,t=Ot()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function vr(){return Tt()==="query"?"":Ot()}async function zo(){let e=Ya(),t={Accept:"application/json"};e&&(t["X-Judgment-Admin-Token"]=e);try{let s=await fetch(dt("/api/auth/sse-ticket"),{method:"POST",headers:t,credentials:"include"});if(!s.ok)return"";let a=await s.json();return String(a.ticket||"")}catch{return""}}function vt(e,t,{onError:s=null,onProgress:a=null}={}){let n=(Array.isArray(e)?e:[e]).map(f=>String(f||"").trim()).filter(Boolean);if(!n.length||typeof EventSource>"u")return()=>{};let i=null,o=0,l=!1,u=null,d=f=>{let p={};try{p=JSON.parse(f.data||"{}")}catch{p={}}p.initial&&o<=1&&!p.snapshot||t?.(p.topic||n[0],p)},g=f=>{let p={};try{p=JSON.parse(f.data||"{}")}catch{p={}}a?.(p.topic||n[0],p)},v=async()=>{if(l)return;let f=await zo();if(l)return;let p=new URLSearchParams({topic:n.join(",")});f&&p.set("ticket",f),i=new EventSource(dt(`/api/events/stream?${p.toString()}`),{withCredentials:!0}),i.onopen=()=>{o+=1,u&&(window.clearTimeout(u),u=null)},i.addEventListener("refresh",d),i.addEventListener("progress",g),i.onerror=()=>{s?.(),!(l||!i)&&(i.close(),i=null,!u&&(u=window.setTimeout(()=>{u=null,v()},3e3)))}};return v(),()=>{l=!0,u&&(window.clearTimeout(u),u=null),i&&(i.removeEventListener("refresh",d),i.removeEventListener("progress",g),i.close(),i=null)}}function nn(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function ie(e,t={}){let{base:s,...a}=t,n=s!==void 0?Jt(s):Ot(),i=new AbortController,o=t.timeout===void 0?3e4:t.timeout,l=o>0?window.setTimeout(()=>i.abort(),o):null,u=Date.now(),d=performance.now(),g=t.requestId||wr(),v={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":g,"X-Judgment-Client-Started-At":String(u),...Ya()?{"X-Judgment-Admin-Token":Ya()}:{},...t.headers||{}},f;try{f=await fetch(dt(e,n),{...a,headers:v,credentials:"include",signal:i.signal})}catch(j){throw j.name==="AbortError"?new ht("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new ht(nn(n),0,j)}finally{l&&window.clearTimeout(l)}let p=null;if((f.headers.get("content-type")||"").includes("application/json"))try{p=await f.json()}catch{p=null}else try{p=await f.text()}catch{p=null}let y=performance.now(),k=f.headers.get("X-Judgment-Request-Id")||g;if(t.trackClient!==!1&&k){let j=Math.round(performance.now()-d);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{_r({request_id:k,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:j,render_ms:Math.max(0,Math.round(performance.now()-y)),status:f.ok?"success":"failed"})})})}if(!f.ok){let j=p&&typeof p=="object"?p.detail||p.message:p,x=typeof j=="string"&&j?j:`\u4F3A\u670D\u5668\u56DE\u61C9 ${f.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new ht(x,f.status,j)}return p}function wr(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function _r(e){try{fetch(dt("/api/performance/client",Ot()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),credentials:"include",keepalive:!0}).catch(()=>{})}catch{}}async function kr(e){let t=Jt(e);if(!Za(t))throw new ht("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,n=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(dt("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new ht(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof ht?i:i.name==="AbortError"?new ht("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new ht(nn(t),0,i)}finally{window.clearTimeout(n)}}var W={health(){return ie("/api/health")},authMe(){return ie("/api/auth/me",{base:vr(),trackClient:!1})},authLogout(){return ie("/api/auth/logout",{method:"POST",base:vr(),trackClient:!1})},status(){return ie("/api/status",{trackClient:!1})},ollamaHosts(){return ie("/api/ollama/hosts",{timeout:3e4,trackClient:!1})},addOllamaHost(e){return ie("/api/ollama/hosts",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},updateOllamaHost(e,t){return ie(`/api/ollama/hosts/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},deleteOllamaHost(e){return ie(`/api/ollama/hosts/${encodeURIComponent(e)}`,{method:"DELETE",timeout:3e4,trackClient:!1})},activateOllamaHost(e){return ie(`/api/ollama/hosts/${encodeURIComponent(e)}/activate`,{method:"POST",timeout:3e4,trackClient:!1})},deactivateOllamaHosts(){return ie("/api/ollama/hosts/deactivate",{method:"POST",timeout:3e4,trackClient:!1})},reorderOllamaHosts(e){return ie("/api/ollama/hosts/reorder",{method:"POST",body:JSON.stringify({host_ids:e}),timeout:3e4,trackClient:!1})},checkOllamaCapabilities(){return ie("/api/ollama/hosts/capabilities/test",{method:"POST",timeout:18e4,trackClient:!1})},selectOllamaModel(e,t){return ie(`/api/ollama/hosts/${encodeURIComponent(e)}/models/select`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},clearOllamaModel(e,t){return ie(`/api/ollama/hosts/${encodeURIComponent(e)}/models/clear`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},systemUsage(){return ie("/api/system-usage",{trackClient:!1})},indexVersions(){return ie("/api/index-versions",{trackClient:!1})},indexVersion(e){return ie(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return ie(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return ie(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return ie("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){let t=new URLSearchParams({repair:e?"true":"false"});return ie(`/api/index-alias/reconcile?${t.toString()}`,{trackClient:!1})},catalog(){return ie("/api/catalog")},homeSummary(){return ie("/api/home")},judgmentStats(){return ie("/api/judgment-stats")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return ie("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},dataSuggest({kind:e,query:t="",limit:s=12}){let a=new URLSearchParams({kind:e,query:t,limit:String(s)});return ie(`/api/data/suggest?${a.toString()}`,{timeout:45e3,trackClient:!1})},schemaSuggest({database:e,table:t,column:s,query:a,limit:n=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(n)});return ie(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let n=new URLSearchParams({law_key:e});return t&&n.set("source_type",t),s&&n.set("version_id",String(s)),a&&n.set("article_no",String(a)),ie(`/api/law?${n.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),ie(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return ie("/api/test-mode",{trackClient:!1})},llmModels(){return ie("/api/llm/models",{timeout:6e4,trackClient:!1})},testLlmModels(){return ie("/api/llm/models/test",{method:"POST",timeout:12e4,trackClient:!1})},rerankStatus(){return ie("/api/rerank/status",{timeout:6e4,trackClient:!1})},testReranker(){return ie("/api/rerank/test",{method:"POST",timeout:12e4,trackClient:!1})},selectLlmModel(e,t=null){return ie("/api/llm/model",{method:"POST",body:JSON.stringify({model:e,host_id:t}),timeout:3e4,trackClient:!1})},setTestMode(e){return ie("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return ie(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return ie("/api/test-runs/current",{trackClient:!1})},testRun(e){return ie(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return ie("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))i==null||i===""||a.set(n,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),ie(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return ie("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return ie("/api/processing",{timeout:45e3,trackClient:!1})},processingActive(){return ie("/api/processing/active",{timeout:3e3,trackClient:!1})},judgmentDownloadStatus(){return ie("/api/judgment-download/status",{timeout:3e4,trackClient:!1})},versioningSummary(){return ie("/api/versioning/summary",{trackClient:!1})},updatesStatus(){return ie("/api/updates/status",{trackClient:!1})},checkCourts(){return ie("/api/courts/check",{timeout:6e4,trackClient:!1})},checkLawVersions(){return ie("/api/law-versions/check",{timeout:6e4,trackClient:!1})},checkUpdates(e=[]){let t=Array.isArray(e)&&e.length?{source_types:e}:{};return ie("/api/updates/check",{method:"POST",body:JSON.stringify(t),timeout:12e4,trackClient:!1})},versioningSnapshots(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.limit&&t.set("limit",String(e.limit)),ie(`/api/versioning/judgments/snapshots?${t.toString()}`,{trackClient:!1})},versioningChanges(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit)),ie(`/api/versioning/judgments/changes?${t.toString()}`,{trackClient:!1})},versioningJudgment(e){return ie(`/api/versioning/judgments/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVersion(e){return ie(`/api/versioning/judgments/versions/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVector(e,t){return ie(`/api/versioning/judgments/${encodeURIComponent(e)}/vectors/${encodeURIComponent(t)}`,{trackClient:!1})},versioningAudit(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit||500)),ie(`/api/versioning/audit?${t.toString()}`,{trackClient:!1})},questionBankStats(){return ie("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))if(!(i==null||i==="")){if(Array.isArray(i)){for(let o of i)o==null||o===""||a.append(n,String(o));continue}a.set(n,String(i))}return a.set("limit",String(t)),a.set("offset",String(s)),ie(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankTags(e="",t=12){let s=new URLSearchParams({query:e,limit:String(t)});return ie(`/api/question-bank/tags?${s.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return ie(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return ie("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},createQuestionBankItemWithAI(e){return ie("/api/question-bank/ai-items",{method:"POST",body:JSON.stringify(e),timeout:42e4,trackClient:!1})},updateQuestionBankItem(e,t){return ie(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return ie(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},restoreQuestionBankItem(e){return ie(`/api/question-bank/items/${encodeURIComponent(e)}/restore`,{method:"POST",timeout:45e3,trackClient:!1})},submitQuestionBankItemForReview(e){return ie(`/api/question-bank/items/${encodeURIComponent(e)}/submit`,{method:"POST",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return ie(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return ie("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return ie(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return ie("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return ie(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return ie("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},benchmarkSuiteLatestAnswers(e){return ie(`/api/benchmark/suites/${encodeURIComponent(e)}/latest-answers`,{timeout:45e3,trackClient:!1})},removeBenchmarkSuiteItem(e,t){return ie(`/api/benchmark/suites/${encodeURIComponent(e)}/items/${encodeURIComponent(t)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return ie("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return ie(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return ie(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return ie(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return ie("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return ie(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return ie(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return ie(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return ie("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return ie(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return ie("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return ie(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return ie("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return ie("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return ie("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onQueued:n=null,onToken:i=null,onTokenReset:o=null}={}){let l=Ot(),u=new AbortController,d=t?0:3e5,g=d>0?window.setTimeout(()=>u.abort(),d):null,v=Date.now(),f=performance.now(),p=wr(),b={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":p,"X-Judgment-Client-Started-At":String(v)},y;try{y=await fetch(dt("/api/rag/query/stream",l),{method:"POST",headers:b,body:JSON.stringify({question:e}),credentials:"include",signal:u.signal})}catch(Y){throw Y.name==="AbortError"?new ht("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new ht(nn(l),0,Y)}finally{g&&window.clearTimeout(g)}if(!y.ok){let Y=null;try{Y=await y.json()}catch{Y=null}let Se=Y&&typeof Y=="object"&&Y.detail?String(Y.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${y.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new ht(Se,y.status,Y)}if(!y.body)throw new ht("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let k=y.body.getReader(),j=new TextDecoder,x="",A=null,F=null;try{for(;;){let{value:Y,done:Se}=await k.read();if(Se)break;x+=j.decode(Y,{stream:!0});let fe=x.indexOf(`

`);for(;fe>=0;){let U=x.slice(0,fe).replace(/\r/g,"");x=x.slice(fe+2);let E="message",L=[];for(let T of U.split(`
`))T.startsWith("event:")?E=T.slice(6).trim():T.startsWith("data:")&&L.push(T.slice(5).trimStart());if(L.length){let T=null;try{T=JSON.parse(L.join(`
`))}catch{T=null}if(T)if(E==="step"&&typeof s=="function")try{s(T)}catch{}else if(E==="partial"){if(typeof a=="function")try{a(T)}catch{}}else if(E==="queued"){if(typeof n=="function")try{n(T)}catch{}}else if(E==="token"){if(typeof i=="function")try{i(String(T.text||""))}catch{}}else if(E==="token_reset"){if(typeof o=="function")try{o()}catch{}}else E==="result"?A=T:E==="error"&&(F=new ht(T.message||T.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,T))}fe=x.indexOf(`

`)}}}finally{try{await k.cancel()}catch{}g&&window.clearTimeout(g)}if(F)throw F;if(!A)throw new ht("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let ne=Math.round(performance.now()-f);return _r({request_id:p,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:ne,render_ms:0,status:"success"}),A&&typeof A=="object"&&(A._client_request_id=p),A}};var Go={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Uo={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},Qo={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},Jo={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Sr={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',palette:'<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10h-4Z"/><circle cx="7.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/><circle cx="10" cy="6.8" r=".8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="6.8" r=".8" fill="currentColor" stroke="none"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',more:'<circle cx="4.2" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="19.8" cy="12" r="2.6" fill="currentColor" stroke="none"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function r(e){return String(e??"").replace(/[&<>"']/g,t=>Go[t])}function m(e,t=16,s=""){let a=Sr[e]||Sr.info;return`<svg${s?` class="${r(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function c(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function qe(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function rn(e){if(e instanceof Date)return e;if(typeof e=="number"){let n=new Date(e);return Number.isNaN(n.getTime())?null:n}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function Nt(e){let t=rn(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?r(e):"\u2014"}function be(e){let t=rn(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?r(e):"\u2014"}function Ps(e){let t=rn(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:Nt(t)}function de(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Et(e){return Uo[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Ue(e,t){let s=Et(e);return`<span class="badge ${Qo[s.tone]}"><span class="status-dot ${Jo[s.tone]}"></span>${r(t||s.label)}</span>`}function Wo(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${r(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function ia(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function oa(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return Ue(String(e));case"source":return Wo(String(e));case"number":return`<span class="mono">${c(e)}</span>`;case"duration":return`<span class="mono">${de(e)}</span>`;case"datetime":return`<span class="mono">${be(e)}</span>`;case"date":return`<span class="mono">${Nt(e)}</span>`;case"url":{let s=String(e),a=ia(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${r(s)}" target="_blank" rel="noopener noreferrer" title="${r(s)}">${m("external",10)}${r(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${r(s)}">${r(ia(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(ia(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(ia(s,90))}</span>`}}}function Pe({tone:e="info",title:t,text:s,iconName:a="info"}){let n=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${n==="i"?"i":m(n,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${r(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function ut({iconName:e="search",title:t,text:s="",actions:a="",className:n=""}){return`<div class="empty-state ${n}">
    <span class="empty-icon">${m(e,24)}</span>
    <h3 class="empty-title">${r(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function je(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${r(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function P(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let n={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${n[t]||"i"}</span>
    <div class="toast-body">${r(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function ys(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function Rt(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),n=URL.createObjectURL(a),i=document.createElement("a");i.href=n,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(n),1e3)}var Vo=`
  <svg class="auth-google-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z"/>
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.58A10 10 0 0 0 12 22Z"/>
    <path fill="#FBBC05" d="M6.41 13.92A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.92V7.5H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.5l3.35-2.58Z"/>
    <path fill="#EA4335" d="M12 6.04c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.5l3.35 2.58C7.2 7.8 9.4 6.04 12 6.04Z"/>
  </svg>`,Ko={google_not_configured:"Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A GOOGLE_CLIENT_ID \u8207 GOOGLE_CLIENT_SECRET\u3002",state_mismatch:"\u767B\u5165\u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u767B\u5165\u3002",access_denied:"\u4F60\u53D6\u6D88\u4E86 Google \u767B\u5165\u3002",email_unverified:"\u9019\u500B Google \u5E33\u865F\u7684\u96FB\u5B50\u90F5\u4EF6\u5C1A\u672A\u9A57\u8B49\u3002",not_allowed:"\u9019\u500B Google \u5E33\u865F\u6C92\u6709\u7BA1\u7406\u54E1\u6B0A\u9650\u3002",oauth_failed:"Google \u767B\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"},Bt=null;function Yo(){return Tt()==="query"?"":Ot()}function Xo(){let e=Yo(),t=`${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;return dt(`/api/auth/google/start?next=${encodeURIComponent(t)}`,e)}function qr(e){let t=String(e?.name||"").trim();if(t)return t;let s=String(e?.email||"").trim();return s?s.split("@")[0]:"\u5DF2\u767B\u5165"}function Zo(e){return qr(e).slice(0,1).toUpperCase()||"A"}function xr(){let e=Bt?.querySelector("#auth-menu"),t=Bt?.querySelector("#auth-user-trigger");e&&(e.hidden=!0),t&&t.setAttribute("aria-expanded","false")}function Ar(e={}){let t=!!e.google_enabled;Bt.innerHTML=`
    <a class="auth-login${t?"":" is-disabled"}"
       id="auth-login"
       href="${r(Xo())}"
       aria-label="\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165"
       title="${t?"\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165":"Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A"}"
       ${t?"":'aria-disabled="true"'}>
      ${Vo}
      <span>\u767B\u5165</span>
    </a>`,t||Bt.querySelector("#auth-login")?.addEventListener("click",a=>{a.preventDefault(),P("Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A GOOGLE_CLIENT_ID \u8207 GOOGLE_CLIENT_SECRET\u3002","warn",5200)})}function el(e){let t=qr(e),s=String(e?.email||""),a=e?.admin?"\u7BA1\u7406\u54E1":"\u5DF2\u767B\u5165";Bt.innerHTML=`
    <div class="auth-user">
      <button type="button"
              class="auth-user-trigger"
              id="auth-user-trigger"
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="\u5DF2\u767B\u5165\uFF1A${r(s||t)}\uFF0C\u958B\u555F\u5E33\u865F\u9078\u55AE"
              title="${r(s||t)}">
        <span class="auth-avatar" aria-hidden="true">${r(Zo(e))}</span>
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
        <button type="button" class="auth-menu-item" id="auth-logout" role="menuitem">
          \u767B\u51FA
        </button>
      </div>
    </div>`;let n=Bt.querySelector("#auth-user-trigger"),i=Bt.querySelector("#auth-menu");n?.addEventListener("click",o=>{o.stopPropagation();let l=!!i?.hidden;i&&(i.hidden=!l),n.setAttribute("aria-expanded",l?"true":"false")}),Bt.querySelector("#auth-logout")?.addEventListener("click",async o=>{let l=o.currentTarget;l.disabled=!0,l.textContent="\u767B\u51FA\u4E2D\u2026";try{await W.authLogout(),P("\u5DF2\u767B\u51FA\u3002","ok",2400),await Mr()}catch(u){l.disabled=!1,l.textContent="\u767B\u51FA",P(u.message||"\u767B\u51FA\u5931\u6557\u3002","danger",5200)}})}async function Mr(){if(Bt)try{let e=await W.authMe();e?.authenticated?el(e):Ar(e)}catch{Ar({google_enabled:!1})}}function tl(){let e;try{e=new URL(window.location.href)}catch{return}let t=e.searchParams.get("auth"),s=e.searchParams.get("auth_error");!t&&!s||(e.searchParams.delete("auth"),e.searchParams.delete("auth_error"),window.history.replaceState(null,"",`${e.pathname}${e.search}${e.hash}`),t==="ok"?P("\u5DF2\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165\u3002","ok",3600):s&&P(Ko[s]||"Google \u767B\u5165\u5931\u6557\u3002","danger",6e3))}function Lr(){Bt=document.getElementById("auth-slot"),Bt&&(tl(),document.addEventListener("click",e=>{e.target.closest(".auth-user")||xr()}),document.addEventListener("keydown",e=>{e.key==="Escape"&&xr()}),Mr())}var jr="judgment.theme",on="nvidia",la=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#0070f3","#171717","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#0066cc","#1d1d1f","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#17171d","#5e6ad2","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#0d99ff","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#0075de","#191918","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],ln=new Map(la.map(e=>[e.id,e]));function sl(e){return ln.has(e)}function al(e){return ln.get(e)||ln.get(on)}function cn(){try{let e=window.localStorage.getItem(jr);return sl(e)?e:on}catch{return on}}function dn(e,{persist:t=!0}={}){let s=al(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");if(a&&a.setAttribute("content",s.metaColor),document.querySelectorAll(".theme-option").forEach(n=>{let i=n.dataset.themeId===s.id;n.classList.toggle("is-active",i),n.setAttribute("aria-checked",i?"true":"false")}),t)try{window.localStorage.setItem(jr,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}var ca="judgment.fontSizes.v1",fn="judgment.appearance",Pr=new Set(["light","dark","system"]),Tr="light",Is=window.matchMedia("(prefers-color-scheme: dark)"),nl="font-size",Os=[{id:"page-title",label:"\u9801\u9762\u6A19\u984C",hint:"\u5404\u9801\u6700\u4E0A\u65B9\u7684 h1 \u6A19\u984C",selectors:[".page-title"],defaultPx:40,min:20,max:72},{id:"home-title",label:"\u9996\u9801\u4E3B\u8996\u89BA\u6A19\u984C",hint:"\u9996\u9801\u6700\u5927\u7684\u4E3B\u6A19\u984C",selectors:[".home-title"],defaultPx:88,min:40,max:140},{id:"section-title",label:"\u5340\u584A\u6A19\u984C",hint:"\u5831\u8868\u3001\u5361\u7247\u8207\u5340\u584A\u6A19\u984C",selectors:[".section-title",".report-title",".side-card-title",".filter-title",".tests-card-title",".status-sidebar-title",".judgment-dialog-head h2"],defaultPx:16,min:10,max:36},{id:"body",label:"\u5167\u6587\u8207\u8AAA\u660E",hint:"\u6BB5\u843D\u3001\u56DE\u7B54\u3001\u8AAA\u660E\u8207\u6458\u8981\u6587\u5B57",selectors:[".answer-text",".page-subtitle",".report-sub",".home-lead",".empty-text",".notice-body p",".citation-snippet",".side-card-body",".detail-list",".field-help",".report-empty-inline",".processing-section-sub",".summary-value-text",".status-summary",".warnings",".law-dialog-warning"],defaultPx:14,min:8,max:28},{id:"table",label:"\u8868\u683C\u5167\u5BB9",hint:"\u8CC7\u6599\u8868\u683C\u7684\u8868\u982D\u8207\u5132\u5B58\u683C",selectors:[".data-table th",".data-table td"],defaultPx:12,min:8,max:24},{id:"meta",label:"\u6A19\u7C64\u8207\u8F14\u52A9\u6587\u5B57",hint:"badge\u3001chip\u3001\u6B04\u4F4D\u6A19\u7C64\u8207 metadata",selectors:[".badge",".chip",".citation-meta",".citation-index",".answer-section-label",".report-kicker",".report-section-title",".eyebrow",".field-label",".summary-label",".metric-label",".footer-bottom",".nav-update-badge"],defaultPx:10,min:7,max:20},{id:"button",label:"\u6309\u9215\u8207\u5C0E\u89BD",hint:"\u64CD\u4F5C\u6309\u9215\u3001\u9801\u9996\u5C0E\u89BD\u8207\u9023\u7D50",selectors:[".btn",".nav-link",".page-btn",".law-link",".judgment-link",".theme-option-name",".theme-option-desc"],defaultPx:13,min:9,max:24},{id:"form",label:"\u8868\u55AE\u8207\u8F38\u5165",hint:"\u8F38\u5165\u6846\u3001\u4E0B\u62C9\u9078\u55AE\u8207 textarea",selectors:["input","textarea","select",".input",".field-input"],defaultPx:14,min:9,max:28},{id:"mono",label:"\u7A0B\u5F0F\u78BC\u8207\u6578\u503C",hint:"\u7B49\u5BEC\u6587\u5B57\u3001\u67E5\u8A62\u8A9E\u53E5\u8207\u7D71\u8A08\u6578\u503C",selectors:[".mono",".cell-mono",".cell-number",".query-code","code",".metric-value",".summary-value",".perf-stat-value",".mini-stat-value"],defaultPx:13,min:8,max:30},{id:"law-page",label:"\u6CD5\u898F\u689D\u6587\uFF08\u9801\u9762\uFF09",hint:"\u6CD5\u898F\u6AA2\u7D22\u7D50\u679C\u8207\u6CD5\u898F\u4F86\u6E90\u5361\u689D\u6587",selectors:[".law-answer-article-text",".law-answer-article-no",".law-source-article-text",".law-source-article-no",".law-article-text",".law-article-no"],excludeAncestors:[".law-dialog"],defaultPx:12,min:9,max:28},{id:"law-dialog",label:"\u6CD5\u898F\u689D\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u6309\u4E0B\u689D\u6587\u5F8C\u958B\u555F\u7684\u6CD5\u898F dialog",selectors:[".law-dialog .law-article-text",".law-dialog .law-article-no",".law-dialog .law-chapter"],defaultPx:16,min:10,max:32},{id:"judgment-dialog",label:"\u5224\u6C7A\u5168\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u5224\u6C7A\u539F\u6587 dialog \u7684\u5168\u6587\u5340\u584A",selectors:[".judgment-dialog-text"],defaultPx:23,min:12,max:48}],ks=new Map(Os.map(e=>[e.id,e])),Ds=new WeakMap,Wt=Br(),wt={...Wt},Vt=Dr(),un=new Set,_s=null,ws=null,$t=null,cs=null,Nr=null,ts=nl,ss=!1,pn=null,mn=!1,da="";function Ir(e,t,s){return Math.min(s,Math.max(t,e))}function bn(e){return Math.round(e*10)/10}function pa(e){return Number.isInteger(e)?String(e):e.toFixed(1)}function Dr(){try{let e=window.localStorage.getItem(fn);return Pr.has(e)?e:Tr}catch{return Tr}}function rl(){return Vt==="system"?Is.matches?"dark":"light":Vt}function Or(){document.querySelectorAll("[data-appearance-option]").forEach(e=>{let t=e.dataset.appearanceOption===Vt;e.classList.toggle("is-active",t),e.setAttribute("aria-pressed",t?"true":"false")})}function ua({persist:e=!1}={}){if(document.documentElement.dataset.appearance=rl(),document.documentElement.dataset.appearanceMode=Vt,Or(),e)try{window.localStorage.setItem(fn,Vt)}catch{}}function il(e){Pr.has(e)&&(Vt=e,ua({persist:!0}))}function Er(){Vt==="system"&&ua()}typeof Is.addEventListener=="function"?Is.addEventListener("change",Er):typeof Is.addListener=="function"&&Is.addListener(Er);function Br(){let e=null;try{e=JSON.parse(window.localStorage.getItem(ca)||"null")}catch{e=null}if(!e||typeof e!="object"||Array.isArray(e))return{};let t={};for(let s of Os){let a=Number(e[s.id]);Number.isFinite(a)&&(t[s.id]=bn(Ir(a,s.min,s.max)))}return t}function ol(){try{return Object.keys(Wt).length?window.localStorage.setItem(ca,JSON.stringify(Wt)):window.localStorage.removeItem(ca),!0}catch{return!1}}function Fs(e){let t=new Set;for(let s of e.selectors)document.querySelectorAll(s).forEach(a=>{a.closest(".settings-sidebar")||Array.isArray(e.excludeAncestors)&&e.excludeAncestors.some(n=>a.closest(n))||t.add(a)});return Array.from(t)}function Fr(){if(!da)return;let e=ks.get(da);if(e)for(let t of Fs(e))t.classList.add("font-size-highlight")}function Hr(e){if(Ss(),!ks.get(e))return;da=e;let s=$t.querySelector(`.font-size-row[data-font-group="${e}"]`);s&&s.classList.add("is-previewing"),Fr()}function Ss(){da="",$t.querySelectorAll(".font-size-row.is-previewing").forEach(e=>e.classList.remove("is-previewing")),document.querySelectorAll(".font-size-highlight").forEach(e=>e.classList.remove("font-size-highlight"))}function ll(e){if(Ds.has(e))return Ds.get(e);let t={inline:e.style.fontSize||"",computed:parseFloat(window.getComputedStyle(e).fontSize)||0};return Ds.set(e,t),t}function cl(e){let t=Ds.get(e);t&&(t.inline?e.style.fontSize=t.inline:e.style.removeProperty("font-size"))}function dl(e){let t=wt[e.id];if(Number.isFinite(t))for(let s of Fs(e))ll(s),s.style.fontSize=`${t}px`}function ul(e){for(let t of Fs(e))cl(t)}function as(){for(let e of un){let t=ks.get(e);t&&ul(t)}un=new Set;for(let e of Os)Number.isFinite(wt[e.id])&&(dl(e),un.add(e.id));Fr()}function zr(){as(),ss&&ts==="font-size"&&Bs()}function Gr(){mn||(mn=!0,window.requestAnimationFrame(()=>{mn=!1,as()}))}function pl(){pn||!document.body||(pn=new MutationObserver(e=>{if(Object.keys(wt).length){for(let t of e)if(t.type==="childList"&&(t.addedNodes.length||t.removedNodes.length)){Gr();return}}}),pn.observe(document.body,{childList:!0,subtree:!0}))}function ml(e){let t=e.filter(s=>typeof s.getClientRects=="function"&&s.getClientRects().length);return t.length?t:e}function gl(){let e=Os.filter(t=>Fs(t).length>0||Number.isFinite(wt[t.id]));return e.length?e:Os}function ma(e){let t=wt[e.id];if(Number.isFinite(t))return t;let a=ml(Fs(e)).map(o=>{let l=Ds.get(o);return l&&l.computed?l.computed:parseFloat(window.getComputedStyle(o).fontSize)||0}).filter(o=>o>0).sort((o,l)=>o-l);if(!a.length)return e.defaultPx;let n=Math.floor(a.length/2),i=a.length%2?a[n]:(a[n-1]+a[n])/2;return bn(i)}function fl(){let e=[{id:"font-size",label:"\u5B57\u578B\u5927\u5C0F",hint:"\u8ABF\u6574\u5404\u6587\u5B57\u5340\u584A",glyph:'<span class="settings-option-aa" aria-hidden="true">Aa</span>'},{id:"theme",label:"\u4ECB\u9762\u98A8\u683C",hint:"\u5207\u63DB\u54C1\u724C\u8996\u89BA\u8A9E\u8A00",glyph:m("palette",15)}];cs.innerHTML=e.map(t=>`<button class="settings-option${ts===t.id?" is-active":""}" type="button" role="tab"
        data-settings-panel="${t.id}"
        aria-selected="${ts===t.id?"true":"false"}">
        <span class="settings-option-icon">${t.glyph}</span>
        <span class="settings-option-copy">
          <strong>${r(t.label)}</strong>
          <small>${r(t.hint)}</small>
        </span>
        ${m("chevronRight",12,"settings-option-chevron")}
      </button>`).join("")}function Bs(){Ss();let e=gl(),t=e.map(s=>{let a=pa(ma(s));return`<section class="font-size-row" data-font-group="${s.id}">
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
    </section>`}).join("");$t.innerHTML=`<div class="settings-panel-head">
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
    </div>`}function bl(){Ss();let e=cn(),t=la.map((n,i)=>{let o=n.swatches.map(l=>`<i style="--swatch:${r(l)}"></i>`).join("");return`<button class="theme-option${n.id===e?" is-active":""}" type="button" role="menuitemradio"
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
          aria-pressed="${Vt===n.id?"true":"false"}"
          title="${n.id==="system"?"\u8DDF\u96A8\u7CFB\u7D71\u660E\u6697":`${n.label}\u8272\u6A21\u5F0F`}">${n.label}</button>`).join("")}
  </div>`;$t.innerHTML=`<div class="settings-panel-head">
      <div>
        <h3>\u4ECB\u9762\u98A8\u683C</h3>
        <p>\u9078\u64C7\u4E3B\u63A7\u53F0\u7684\u54C1\u724C\u8996\u89BA\u8A9E\u8A00\uFF1B\u4E3B\u984C\u6703\u7ACB\u5373\u5957\u7528\u4E26\u4FDD\u7559\u3002</p>
      </div>
      <div class="settings-panel-head-actions">
        <span class="badge badge-info">${la.length} \u7A2E</span>
        ${a}
      </div>
    </div>
    <div class="settings-theme-list" role="menu" aria-label="\u4ECB\u9762\u98A8\u683C">${t}</div>`,Or()}function hl(){cs.querySelectorAll("[data-settings-panel]").forEach(e=>{let t=e.dataset.settingsPanel===ts;e.classList.toggle("is-active",t),e.setAttribute("aria-selected",t?"true":"false")})}function hn(e=ts){ts=e==="theme"?"theme":"font-size",hl(),ts==="theme"?bl():Bs()}function Rr(e,t,s){let a=Number(t);if(!Number.isFinite(a))return;let n=bn(Ir(a,e.min,e.max));wt[e.id]=n;let i=s?.querySelector(".font-size-slider");i&&(i.value=String(n));let o=s?.querySelector(".font-size-preview");o&&(o.style.fontSize=`${n}px`),Gr()}function vl(){$t.querySelectorAll(".font-size-row").forEach(e=>{let t=ks.get(e.dataset.fontGroup);if(!t)return;let s=wt[t.id]??ma(t),a=e.querySelector(".font-size-number-input");a&&(a.value=pa(s));let n=e.querySelector(".font-size-slider");n&&(n.value=String(s));let i=e.querySelector(".font-size-preview");i&&(i.style.fontSize=`${s}px`)})}function Cr(e){let t=e.target.closest(".font-size-row");if(!t)return;let s=ks.get(t.dataset.fontGroup);if(!s)return;let a=e.target.classList.contains("font-size-number-input");if(!(a&&e.target.value==="")){if(e.type==="input"&&a){let n=Number(e.target.value);if(!Number.isFinite(n))return;Rr(s,n,t);return}if(Rr(s,e.target.value,t),e.type==="input"){let n=t.querySelector(".font-size-number-input");n&&document.activeElement!==n&&(n.value=pa(wt[s.id]??ma(s)))}}}function $l(e){if(!e.target.classList.contains("font-size-number-input"))return;let t=e.target.closest(".font-size-row"),s=t?ks.get(t.dataset.fontGroup):null;if(!s)return;let a=wt[s.id]??ma(s);e.target.value=pa(a)}function yl(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Hr(t.dataset.fontGroup)}function wl(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Ss()}function _l(e){let t=e.target.closest(".font-size-row");t&&Hr(t.dataset.fontGroup)}function kl(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Ss()}function Sl(e){let t=e.target.closest("[data-settings-panel]");if(t){hn(t.dataset.settingsPanel);return}let s=e.target.closest("[data-settings-action]");if(s){let i=s.dataset.settingsAction;if(i==="save"){Wt={...wt};let o=ol();vl(),P(o?"\u5B57\u578B\u5927\u5C0F\u5DF2\u5132\u5B58\u3002":"\u5B57\u578B\u5927\u5C0F\u5DF2\u5957\u7528\uFF0C\u4F46\u700F\u89BD\u5668\u7121\u6CD5\u5132\u5B58\u8A2D\u5B9A\u3002",o?"ok":"warn");return}if(i==="cancel"){wt={...Wt},as(),Bs(),P("\u5DF2\u53D6\u6D88\u672A\u5132\u5B58\u7684\u5B57\u578B\u8B8A\u66F4\u3002","info");return}i==="reset"&&(wt={},as(),Bs(),P("\u5DF2\u56DE\u5FA9\u9810\u8A2D\u5B57\u578B\uFF1B\u6309\u300C\u5132\u5B58\u300D\u4FDD\u7559\u8B8A\u66F4\u3002","info"));return}let a=e.target.closest("[data-appearance-option]");if(a){il(a.dataset.appearanceOption);return}let n=e.target.closest(".theme-option");n&&dn(n.dataset.themeId)}function xl(){ss||(ss=!0,wt={...Wt},document.body.classList.add("settings-open"),_s.removeAttribute("inert"),_s.setAttribute("aria-hidden","false"),ws.setAttribute("aria-expanded","true"),hn(ts),as(),window.requestAnimationFrame(()=>{let e=cs.querySelector(".settings-option.is-active")||cs.querySelector(".settings-option");e&&e.focus({preventScroll:!0})}))}function gn({restoreFocus:e=!0}={}){ss&&(ss=!1,Ss(),wt={...Wt},as(),document.body.classList.remove("settings-open"),e&&ws.focus({preventScroll:!0}),_s.setAttribute("aria-hidden","true"),_s.setAttribute("inert",""),ws.setAttribute("aria-expanded","false"))}function Ur(){_s=document.getElementById("settings-sidebar"),ws=document.getElementById("settings-trigger"),$t=document.getElementById("settings-panel"),cs=document.getElementById("settings-options"),Nr=document.getElementById("settings-close"),!(!_s||!ws||!$t||!cs)&&(ua(),dn(cn(),{persist:!1}),fl(),Bs(),pl(),as(),ws.addEventListener("click",()=>{ss?gn():xl()}),Nr?.addEventListener("click",()=>gn()),cs.addEventListener("click",e=>{let t=e.target.closest("[data-settings-panel]");t&&hn(t.dataset.settingsPanel)}),$t.addEventListener("click",Sl),$t.addEventListener("input",Cr),$t.addEventListener("change",Cr),$t.addEventListener("blur",$l,!0),$t.addEventListener("pointerover",yl),$t.addEventListener("pointerout",wl),$t.addEventListener("focusin",_l),$t.addEventListener("focusout",kl),$t.addEventListener("keydown",e=>{e.key==="Enter"&&e.target.classList.contains("font-size-number-input")&&(e.preventDefault(),e.target.blur())}),document.addEventListener("keydown",e=>{e.key==="Escape"&&ss&&gn()}),window.addEventListener("storage",e=>{if(e.key===fn){Vt=Dr(),ua();return}e.key===ca&&(Wt=Br(),ss||(wt={...Wt},as()))}))}var An={};Zt(An,{render:()=>Ol});function Al(e){let t=e&&typeof e=="object"?e:{},s=t.judgment_total,a=t.financial_total,n=Number(s),i=Number(a),o=s!=null&&Number.isFinite(n)&&n>=0,l=a!=null&&Number.isFinite(i)&&i>=0;return{total:o?n:null,financial:l?i:null,ratio:o&&l&&n>0?i/n*100:null}}function Ut(e,{loading:t=!1}={}){let s=Al(e),a=t?"\u8B80\u53D6\u4E2D\u2026":c(s.total),n=t?"\u8B80\u53D6\u4E2D\u2026":c(s.financial),i=t?"\u8B80\u53D6\u4E2D\u2026":s.ratio===null?"\u2014":`${s.ratio.toFixed(1)}%`;return`<div class="processing-summary-card">
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
  </div>`}var vn=11,ql=15e3,ga=new Set,Ml=[{route:"rag",icon:"message",kicker:"RAG",title:"RAG \u63D0\u554F",summary:"\u7528\u81EA\u7136\u8A9E\u8A00\u627E\u5230\u76F8\u4F3C\u5224\u6C7A\u8207\u73FE\u884C\u6CD5\u898F\uFF0C\u56DE\u7B54\u9644\u4E0A\u53EF\u56DE\u6EAF\u7684\u5F15\u7528\u3002",metric:"Citations first",tone:"feature",wide:!0,metricKey:"rag"},{route:"data",icon:"database",kicker:"EXPLORE",title:"\u8CC7\u6599\u5EAB\u67E5\u8A62",summary:"\u8DE8 PostgreSQL\u3001Parquet\u3001Qdrant \u8207 IndexedDB \u6AA2\u8996\u539F\u59CB\u8CC7\u6599\u3002",metric:"4 \u7A2E\u8CC7\u6599\u4F86\u6E90",tone:"blue",metricKey:"data"},{route:"quality",icon:"shield",kicker:"QUALITY",title:"\u8CC7\u6599\u54C1\u8CEA",summary:"\u7528 DuckDB \u6AA2\u67E5\u539F\u59CB\u5224\u6C7A\u7684\u91CD\u8907\u3001\u7F3A\u6F0F\u8207\u5F15\u7528\u4E00\u81F4\u6027\u3002",metric:"DuckDB native",tone:"green",metricKey:"quality"},{route:"performance",icon:"activity",kicker:"OBSERVE",title:"\u6548\u80FD\u5831\u8868",summary:"\u5F9E\u55AE\u6B21 RAG \u5230\u7D22\u5F15\u5EFA\u7F6E\uFF0C\u8FFD\u8E64\u6BCF\u500B\u968E\u6BB5\u7684\u8017\u6642\u8207\u74F6\u9838\u3002",metric:"Flow \xB7 Waterfall",tone:"amber",metricKey:"performance"},{route:"processing",icon:"sliders",kicker:"PIPELINE",title:"\u8CC7\u6599\u8655\u7406",summary:"\u4E0B\u8F09\u3001\u532F\u5165\u3001\u5099\u4EFD\u8207\u7D22\u5F15\uFF0C\u96C6\u4E2D\u7BA1\u7406\u8CC7\u6599\u751F\u547D\u9031\u671F\u3002",metric:"End-to-end",tone:"violet",metricKey:"processing"},{route:"status",icon:"server",kicker:"STATUS",title:"\u7CFB\u7D71\u72C0\u614B",summary:"\u6AA2\u8996\u670D\u52D9\u5065\u5EB7\u3001\u8F09\u5165 Pipeline\u3001\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207 API \u76EE\u9304\u3002",metric:"10 \u670D\u52D9\u5143\u4EF6",tone:"slate",metricKey:"status"},{route:"tests",icon:"check",kicker:"VERIFY",title:"\u7CFB\u7D71\u6E2C\u8A66",summary:"\u8A2D\u5B9A API Base\uFF0C\u6E2C\u8A66 LLM \u6A21\u578B\u8207 Reranker \u670D\u52D9\u3002",metric:"LLM \xB7 Reranker",tone:"rose",metricKey:"tests"}];function xs(e,t=1){let s=Number(e);return Number.isFinite(s)?`${s.toFixed(t)}%`:"\u2014"}function yn(e){let t=e?.year_min,s=e?.year_max;return!t&&!s?"\u2014":t&&s&&t!==s?`${t}\u2013${s}`:String(t||s)}function Qr(e){let t=Number(e?.year_span);return Number.isFinite(t)&&t>0?`${t} \u5E74`:"\u2014"}function Ll(e){return`<a class="home-tile tone-${r(e.tone)}${e.wide?" is-wide":""}" href="#/${e.route}">
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
  </a>`}function wn(e,{loading:t=!1}={}){let s=e?.laws||{},a=n=>t?"\u8B80\u53D6\u4E2D\u2026":c(n);return`<div class="processing-summary-card">
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
  </div>`}function jl(e,{loading:t=!1}={}){if(t)return`<div class="home-live-rows is-loading">
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
      <span class="home-live-value mono">${r(yn(a))} <i>\xB7</i> ${r(Qr(a))}</span>
    </div>
    <div class="home-live-row">
      <span class="home-live-label">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15</span>
      <span class="home-live-value mono">${c(n.indexed)} <i>\xB7</i> ${r(xs(n.coverage_pct))}</span>
    </div>
  </div>`}function ba(e,{loading:t=!1,error:s="",generatedAt:a=""}={}){return s?`<div class="home-live-error" role="status">
      <span class="home-live-error-icon">${m("alert",18)}</span>
      <div>
        <strong>\u5373\u6642\u6458\u8981\u66AB\u6642\u7121\u6CD5\u53D6\u5F97</strong>
        <p>${r(s)}</p>
        <button class="btn btn-secondary btn-sm" type="button" id="home-retry">
          ${m("refresh",13)}<span>\u91CD\u65B0\u8F09\u5165</span>
        </button>
      </div>
    </div>`:`${jl(e,{loading:t})}
    <div class="home-live-foot">
      <span class="home-live-source">${m("link",12)}\u53F8\u6CD5\u9662 OpenData \xB7 \u5168\u570B\u6CD5\u898F\u8CC7\u6599\u5EAB</span>
      <span class="home-live-time">${t||!a?"\u540C\u6B65\u4E2D\u2026":`\u66F4\u65B0 ${be(a)}`}</span>
    </div>`}function _n(e,{loading:t=!1}={}){if(t)return`<span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>
      <span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>
      <span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>`;let s=e?.judgments||{},a=e?.raw||{},n=e?.rag?.judgment_index||{};return`<span class="home-fact">
      <span class="home-fact-label">\u539F\u59CB\u5224\u6C7A\u5099\u4EFD</span>
      <strong>${c(a.raw_total)}</strong>
      <small>${c(a.archive_count)} \u500B archive \xB7 \u53F8\u6CD5\u9662 OpenData</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">\u91D1\u878D\u5224\u6C7A\u5E74\u4EFD</span>
      <strong>${r(yn(s))}</strong>
      <small>${r(Qr(s))} \xB7 ${c(s.financial_total)} \u7B46 current</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">\u5411\u91CF\u7D22\u5F15\u8986\u84CB</span>
      <strong>${r(xs(n.coverage_pct))}</strong>
      <small>${c(n.indexed)} / ${c(n.total)} \u7B46 \xB7 ${r(n.model||"\u2014")}</small>
    </span>`}function fa(e,t){let s=t?.laws||{},a=t?.judgments||{},n=t?.raw||{},i=t?.sources||{};if(e==="opendata"){let l=i.opendata||{};return`<article class="home-source-card">
      <div class="home-source-head">
        <span class="home-source-icon">${m("cloud",20)}</span>
        <div>
          <strong>${r(l.label||"\u53F8\u6CD5\u9662\u8CC7\u6599\u958B\u653E\u5E73\u81FA")}</strong>
          <small>\u88C1\u5224\u66F8\u539F\u59CB\u8CC7\u6599</small>
        </div>
        <a class="home-source-link" href="${r(l.url||"https://opendata.judicial.gov.tw/")}" target="_blank" rel="noopener noreferrer">${m("external",12)}\u4F86\u6E90</a>
      </div>
      <p class="home-source-copy">\u5224\u6C7A\u5168\u6587\u3001\u6848\u865F\u3001\u6CD5\u9662\u3001\u88C1\u5224\u65E5\u671F\u8207 PDF \u9023\u7D50\u7686\u4FDD\u7559\u539F\u59CB\u6B04\u4F4D\uFF1B\u532F\u5165\u524D\u5148\u5BEB\u5165\u4E0D\u53EF\u8B8A\u7684 raw Parquet \u5099\u4EFD\u3002</p>
      <dl class="home-source-facts">
        <div><dt>\u539F\u59CB\u5224\u6C7A</dt><dd>${c(n.raw_total)}</dd></div>
        <div><dt>Archive</dt><dd>${c(n.archive_count)}</dd></div>
        <div><dt>\u88C1\u5224\u5E74\u4EFD</dt><dd>${r(yn(a))}</dd></div>
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
      <a class="home-source-link" href="${r(o.url||"https://law.moj.gov.tw/")}" target="_blank" rel="noopener noreferrer">${m("external",12)}\u4F86\u6E90</a>
    </div>
    <p class="home-source-copy">\u4EE5\u5B98\u65B9 JSON \u7AEF\u9EDE\u4E0B\u8F09\u73FE\u884C\u6CD5\u898F\u8207\u547D\u4EE4\uFF0C\u4FDD\u7559\u7248\u672C\u3001\u689D\u6587\u8207\u8B8A\u66F4\u4E8B\u4EF6\uFF1B\u5224\u6C7A\u5F15\u7528\u53EF\u56DE\u5230\u5C0D\u61C9\u689D\u865F\u3002</p>
    <dl class="home-source-facts">
      <div><dt>\u6CD5\u898F</dt><dd>${c(s.law_count)}</dd></div>
      <div><dt>\u547D\u4EE4</dt><dd>${c(s.order_count)}</dd></div>
      <div><dt>\u689D\u6587</dt><dd>${c(s.article_count)}</dd></div>
      <div><dt>\u8CC7\u6599\u7248\u672C</dt><dd>${c(s.version_count)}</dd></div>
    </dl>
    <div class="home-source-flow"><span>ZIP</span>${m("arrowRight",11)}<span>Parquet</span>${m("arrowRight",11)}<span>PostgreSQL</span>${m("arrowRight",11)}<span>Qdrant</span></div>
  </article>`}function kn(e,{loading:t=!1,error:s=""}={}){if(t)return'<div class="home-laws-loading skeleton skeleton-card"></div>';if(s)return`<div class="home-laws-error" role="status">${m("alert",16)}<span>${r(s)}</span></div>`;let a=e?.financial_laws||{},n=Array.isArray(a.laws)?a.laws:[],i=Number(a.count)||n.length,o=Math.ceil(i/vn)||0,l=String(a.source_sha256||""),u=l?`${l.slice(0,12)}\u2026`:"\u2014",d=a.modified_at?Nt(a.modified_at):"\u2014";return`<details class="home-laws" id="home-laws">
    <summary class="home-laws-summary">
      <span class="home-laws-count">${c(i)}</span>
      <span class="home-laws-title">
        <strong>\u91D1\u878D\u6CD5\u898F\u6E05\u55AE</strong>
        <small>${r(a.source_path||"documents/\u91D1\u878D\u6CD5\u898F.md")} \xB7 ${vn} \u6B04 \xD7 ${o} \u5217</small>
      </span>
      <span class="home-laws-toggle">
        <span>\u5C55\u958B\u6E05\u55AE</span>${m("chevronDown",14)}
      </span>
    </summary>
    <div class="home-laws-body">
      <div class="home-laws-toolbar">
        <span>\u4F86\u6E90 ${r(a.source_path||"documents/\u91D1\u878D\u6CD5\u898F.md")} \xB7 SHA-256 <span class="mono">${r(u)}</span> \xB7 \u4FEE\u6539 ${r(d)}</span>
        <button class="btn btn-secondary btn-sm" type="button" id="home-laws-download">
          ${m("download",13)}<span>\u4E0B\u8F09\u6E05\u55AE</span>
        </button>
      </div>
      ${n.length?`<div class="home-laws-grid" style="--home-law-columns:${vn}" role="list">
              ${n.map((g,v)=>`<span class="home-law" role="listitem" title="${r(g)}">
                    <span class="home-law-index">${String(v+1).padStart(2,"0")}</span>
                    <span class="home-law-name">${r(g)}</span>
                  </span>`).join("")}
            </div>`:'<p class="home-laws-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u6CD5\u898F\u540D\u7A31\u3002</p>'}
    </div>
  </details>`}function Sn(e,{loading:t=!1,error:s=""}={}){if(t)return`<div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>`;if(s)return`<div class="home-rag-error">${m("alert",16)}<span>${r(s)}</span></div>`;let a=e?.rag||{},n=a.judgment_index||{},i=a.legal_index||{},o=a.models||{},l=Number(n.coverage_pct),u=Number.isFinite(l)?Math.max(0,Math.min(100,l)):0;return`<article class="home-rag-card">
      <span class="home-rag-kicker">JUDGMENT RETRIEVAL</span>
      <strong class="home-rag-value mono">${c(n.indexed)}<small> / ${c(n.total)}</small></strong>
      <span class="home-rag-label">\u5DF2\u7D22\u5F15 / \u91D1\u878D\u5224\u6C7A</span>
      <span class="home-rag-progress" role="img" aria-label="\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u8986\u84CB ${r(xs(n.coverage_pct))}"><span style="width:${u.toFixed(1)}%"></span></span>
      <span class="home-rag-meta">${r(xs(n.coverage_pct))} \xB7 ${r(n.model||"\u2014")} \xB7 ${r(n.alias||"\u2014")} \u2192 ${r(n.collection||"\u2014")}</span>
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
    </article>`}function Tl(){return`<ol class="home-rag-flow" aria-label="RAG \u57F7\u884C\u6D41\u7A0B">
    ${[["01","\u554F\u984C","1\u2013500 \u5B57","message"],["02","Embedding","bge-m3","brain"],["03","\u6AA2\u7D22","\u5224\u6C7A + \u6CD5\u898F\uFF0F\u547D\u4EE4","database"],["04","Rerank","cross-encoder","sliders"],["05","LLM","\u4F9D\u6AA2\u7D22\u5167\u5BB9\u56DE\u7B54","sparkles"],["06","\u5F15\u7528","[n] \u2192 \u539F\u59CB\u4F86\u6E90","link"]].map(([t,s,a,n])=>`<li class="home-rag-step">
          <span class="home-rag-step-icon">${m(n,17)}</span>
          <span class="home-rag-step-copy">
            <small>${t}</small>
            <strong>${r(s)}</strong>
            <span>${r(a)}</span>
          </span>
        </li>`).join("")}
  </ol>`}function Nl(){return`<div class="home-trace">
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
  </div>`}function $n(e){return e==="failed"?"\u5931\u6557":e==="skipped"?"\u7565\u904E":e==="running"?"\u57F7\u884C\u4E2D":e==="pending"?"\u7B49\u5F85":"\u5B8C\u6210"}function El(e,t,s,a,n,i){let o=String(e.status||"success"),l=o==="skipped"||o==="pending",u=Math.max(0,Number(e.duration_ms)||0),d=l?"\u2014":de(u),g=o==="failed"?"var(--danger)":e.color||"#64748b",v=[`is-${o}`,o==="failed"?"is-error":"",l?"is-missing":"",i&&e.key===i?"is-slowest":""].filter(Boolean).join(" "),f=String(e.key||`stage-${t}`),p=[["\u72C0\u614B",$n(o),!0],["\u958B\u59CB",e.started_at?be(e.started_at):"\u2014",!0],["\u7D50\u675F",e.finished_at?be(e.finished_at):"\u2014",!0],["\u8017\u6642",d,!0],["\u5360\u6574\u9AD4",xs(n),!0],["\u8AAA\u660E",e.message||e.caption||"",!1]].map(([y,k,j])=>j||k?`<span class="rag-wf-detail"><span>${r(y)}</span><strong>${r(String(k||"\u2014"))}</strong></span>`:"").join(""),b=l?"":`<span class="rag-wf-bar is-sequential" style="left:${s.toFixed(3)}%;width:${a.toFixed(4)}%;top:0;height:12px;--bar-color:${r(g)}" aria-hidden="true"></span>`;return`<details class="rag-wf-stage home-wf-stage ${v}${ga.has(f)?" is-open":""}" data-home-wf-stage="${r(f)}"${ga.has(f)?" open":""} style="--stage-color:${r(e.color||"#64748b")}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong><span class="home-wf-step">${String(t+1).padStart(2,"0")}</span> ${r(e.label||e.key||"\u968E\u6BB5")}${i&&e.key===i?' <span class="home-wf-slow">\u6700\u6162</span>':""}</strong>${e.caption?`<small>${r(e.caption)}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${r(d)} \xB7 ${r($n(o))} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${e.label||e.key}\uFF1A${$n(o)}\uFF0C\u8017\u6642 ${d}\uFF0C\u5360\u6574\u9AD4 ${xs(n)}`)}">${b}</span>
    </summary>
    <div class="rag-wf-details">${p}</div>
  </details>`}function xn(e,{loading:t=!1,error:s="",clientMs:a=null}={}){if(t)return`<div class="report-card home-wf-loading" aria-live="polite">
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
    </div>`;let o=Math.max(0,Number(n.total_ms)||i.reduce((x,A)=>x+(Number(A.duration_ms)||0),0)),l=Math.max(0,Number(a)||0),u=Math.max(0,l-o),d=Math.max(o,i.reduce((x,A)=>x+(Number(A.duration_ms)||0),0),1),g=i.reduce((x,A)=>(Number(A.duration_ms)||0)>(Number(x?.duration_ms)||0)?A:x,i[0]),v=1.25,f=i.map(x=>String(x.status||"success")==="skipped"?0:Math.max((Number(x.duration_ms)||0)/d*100,v)),p=f.reduce((x,A)=>x+A,0),b=p>100?100/p:1,y=0,k=i.map((x,A)=>{let F=["skipped","pending"].includes(String(x.status||"success")),ne=F?0:f[A]*b,Y=y;F||(y+=ne);let Se=d>0?(Number(x.duration_ms)||0)/d*100:0;return El(x,A,Y,ne,Se,g?.key)}).join(""),j=i.filter(x=>x.status==="failed").length;return`<section class="report-card status-wf-card home-wf-card" data-home-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m("activity",14)}\u9996\u9801\u5373\u6642\u8CC7\u6599\u8F09\u5165 Pipeline</span>
      <span class="home-wf-links">
        <a class="home-wf-link" href="#/status">\u5B8C\u6574\u670D\u52D9 Pipeline ${m("arrowRight",11)}</a>
        <a class="home-wf-link" href="#/performance">RAG Flow ${m("arrowRight",11)}</a>
      </span>
    </div>
    <div class="index-runtime-metrics home-wf-metrics">
      <span class="index-runtime-metric" title="\u5F8C\u7AEF /api/home \u5F9E\u7B2C\u4E00\u500B\u67E5\u8A62\u5230\u56DE\u61C9\u7D44\u88DD\u5B8C\u6210\u7684\u968E\u6BB5\u7E3D\u8017\u6642\u3002"><span>\u968E\u6BB5\u7E3D\u8017\u6642</span><strong>${r(de(o))}</strong></span>
      <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u5F9E\u9001\u51FA\u8ACB\u6C42\u5230\u6536\u5230\u56DE\u61C9\u7684\u5BE6\u969B\u5F80\u8FD4\u6642\u9593\u3002"><span>HTTP \u5F80\u8FD4</span><strong>${r(l?de(l):"\u2014")}</strong></span>
      <span class="index-runtime-metric" title="HTTP \u5F80\u8FD4\u6263\u6389\u5F8C\u7AEF\u968E\u6BB5\u7E3D\u8017\u6642\u5F8C\u7684\u50B3\u8F38\u8207\u6392\u968A\u6642\u9593\u3002"><span>\u50B3\u8F38\uFF0F\u6392\u968A</span><strong>${r(l?de(u):"\u2014")}</strong></span>
      <span class="index-runtime-metric" title="\u672C\u6B21\u8F09\u5165\u8017\u6642\u6700\u9577\u7684\u968E\u6BB5\uFF0C\u4E5F\u5C31\u662F\u76EE\u524D\u6700\u660E\u986F\u7684\u74F6\u9838\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${g?.label||"\u2014"} \xB7 ${de(g?.duration_ms||0)}`)}</strong></span>
      <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${c(i.length-j)} / ${c(i.length)}${j?` \xB7 \u5931\u6557 ${c(j)}`:""}</strong></span>
      <span class="index-runtime-metric" title="\u672C\u6B21\u6458\u8981\u7684\u7522\u751F\u6642\u9593\u3002"><span>\u66F4\u65B0\u6642\u9593</span><strong>${r(n.finished_at?be(n.finished_at):"\u2014")}</strong></span>
    </div>
    <div class="status-wf-chart">
      <div class="rag-wf-axis"><span>0 ms</span><span>${r(de(o))}</span></div>
      <div class="rag-wf-stages">${k}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u5BE6\u969B\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0Cbar \u9577\u5EA6\u70BA\u8A72\u968E\u6BB5\u8017\u6642\u5360\u6BD4\uFF1B\u6A19\u793A\u300C\u6700\u6162\u300D\u7684\u968E\u6BB5\u5373\u672C\u6B21\u8F09\u5165\u74F6\u9838\u3002\u9EDE\u64CA\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u3001\u5360\u6BD4\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function Rl(e){return`<div class="home-source-error">${m("alert",16)}<span>${r(e)}</span></div>`}function Cl(){let e=Ml.map(Ll).join("");return`<section class="page home-page" id="home-page">
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
        <div id="home-live-body" aria-live="polite">${ba(null,{loading:!0})}</div>
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
          ${Ut(null,{loading:!0})}
        </div>
        <div class="home-metric-group" id="home-law-metrics">
          ${wn(null,{loading:!0})}
        </div>
      </div>
      <div class="home-metric-strip" id="home-metric-strip">
        ${_n(null,{loading:!0})}
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
      ${Tl()}
      <div class="home-rag-values" id="home-rag-values">
        ${Sn(null,{loading:!0})}
      </div>
      ${Nl()}
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
        ${fa("opendata",null)}
        ${fa("laws",null)}
      </div>
      <div id="home-laws-slot">
        ${kn(null,{loading:!0})}
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
        ${xn(null,{loading:!0})}
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
        <p>\u900F\u904E Ollama \u4F7F\u7528\u672C\u6A5F\u6216\u5340\u7DB2\u6A21\u578B\uFF0C\u6A21\u578B\u8207\u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u90FD\u53EF\u8ABF\u6574\u3002</p>
      </div>
      <div class="home-trust-item">
        <span class="home-trust-icon">${m("layers",18)}</span>
        <strong>\u7248\u672C\u53EF\u8FFD\u6EAF</strong>
        <p>\u6CD5\u898F\u3001\u5224\u6C7A\u8207\u5411\u91CF\u7D22\u5F15\u4FDD\u7559\u7248\u672C\u8207\u66F4\u65B0\u7D00\u9304\uFF0C\u8CC7\u6599\u8B8A\u66F4\u4E0D\u6703\u9ED8\u9ED8\u6D88\u5931\u3002</p>
      </div>
    </section>
  </section>`}function Pl(e,t){let s=t?.laws||{},a=t?.judgments||{},n=t?.raw||{},i=t?.rag?.judgment_index||{},o={rag:`${c(i.indexed)} \u7B46\u7D22\u5F15`,data:`${c(s.law_count)} \u6CD5\u898F \xB7 ${c(s.order_count)} \u547D\u4EE4`,quality:`${c(n.raw_total)} \u539F\u59CB\u5224\u6C7A`,processing:`${c(n.archive_count)} archive`,performance:"Flow \xB7 Waterfall",status:"10 \u670D\u52D9\u5143\u4EF6",tests:"LLM \xB7 Reranker"};e.querySelectorAll("[data-home-tile-metric]").forEach(l=>{let u=l.dataset.homeTileMetric;u&&o[u]&&(l.textContent=o[u])})}function Il(e,t,{clientMs:s=null}={}){let a=t?.data||{},n=t?.generated_at||"",i=e.querySelector("#home-live-body");i&&(i.innerHTML=ba(a,{generatedAt:n}));let o=e.querySelector("#home-judgment-stats"),l=a.judgments||{};o&&(o.innerHTML=Ut({judgment_total:l.raw_total,financial_total:l.financial_total,financial_ratio:l.financial_ratio}));let u=e.querySelector("#home-law-metrics");u&&(u.innerHTML=wn(a));let d=e.querySelector("#home-metric-strip");d&&(d.innerHTML=_n(a));let g=e.querySelector("#home-rag-values");g&&(g.innerHTML=Sn(a));let v=e.querySelector("#home-source-grid");v&&(v.innerHTML=`${fa("opendata",a)}${fa("laws",a)}`);let f=e.querySelector("#home-laws-slot");if(f){let y=!!f.querySelector("#home-laws")?.open;f.innerHTML=kn(a);let k=f.querySelector("#home-laws");k&&y&&(k.open=!0)}let p=e.querySelector("#home-waterfall-slot");p&&(p.innerHTML=xn({...a,pipeline:t?.pipeline},{clientMs:s})),Pl(e,a)}function Dl(e,t){let s=e.querySelector("#home-live-body");s&&(s.innerHTML=ba(null,{error:t}));let a=e.querySelector("#home-judgment-stats");a&&(a.innerHTML=Ut(null));let n=e.querySelector("#home-law-metrics");n&&(n.innerHTML=wn(null));let i=e.querySelector("#home-metric-strip");i&&(i.innerHTML=_n(null));let o=e.querySelector("#home-rag-values");o&&(o.innerHTML=Sn(null,{error:t}));let l=e.querySelector("#home-source-grid");l&&(l.innerHTML=Rl(t));let u=e.querySelector("#home-laws-slot");u&&(u.innerHTML=kn(null,{error:t}));let d=e.querySelector("#home-waterfall-slot");d&&(d.innerHTML=xn(null,{error:t}))}async function Ol(e,t){let s=!1,a=!1,n=!1,i=null,o=null,l=null,u=null,d=0;e.innerHTML=Cl();let g=e.querySelector("#home-ask-form"),v=e.querySelector("#home-question"),f=e.querySelector("#home-refresh"),p=()=>{let x=String(v?.value||"").trim().slice(0,500);if(!x){v?.focus();return}try{window.sessionStorage.setItem("judgment.pending_question",x)}catch{}window.__judgmentPendingQuestion=x,t&&typeof t.navigate=="function"?t.navigate("rag"):window.location.hash="#/rag"},b=()=>{v&&(v.style.height="auto",v.style.height=`${Math.min(v.scrollHeight,140)}px`)},y=x=>{f&&(f.disabled=x,f.classList.toggle("is-loading",x),f.setAttribute("aria-busy",x?"true":"false"))},k=async({quiet:x=!1}={})=>{if(s)return;if(a){n=!0;return}if(a=!0,d=Date.now(),y(!0),!x){let F=e.querySelector("#home-live-body");F&&(F.innerHTML=ba(null,{loading:!0}))}let A=performance.now();try{let F=await W.homeSummary();if(s||!e.isConnected)return;o=F?.data||null,l=F?.data?.financial_laws||null,Il(e,F,{clientMs:Math.round(performance.now()-A)})}catch(F){if(s||!e.isConnected)return;Dl(e,F.message||"\u7121\u6CD5\u53D6\u5F97\u9996\u9801\u5373\u6642\u8CC7\u6599\u3002")}finally{a=!1,y(!1),n&&!s&&(n=!1,k({quiet:!0}))}};v?.addEventListener("input",b),g?.addEventListener("submit",x=>{x.preventDefault(),p()}),v?.addEventListener("keydown",x=>{x.key==="Enter"&&!x.shiftKey&&!x.isComposing&&(x.preventDefault(),p())});let j=()=>{if(s||u)return;let x=Math.max(0,ql-(Date.now()-d));if(x===0){k({quiet:!0});return}u=window.setTimeout(()=>{u=null,s||k({quiet:!0})},x)};if(e.addEventListener("click",x=>{if(x.target.closest("#home-refresh")||x.target.closest("#home-retry")){u&&(window.clearTimeout(u),u=null),k();return}if(x.target.closest("#home-laws-download")){let A=l?.content||`${(l?.laws||[]).join(`
`)}
`;A.trim()&&Rt("\u91D1\u878D\u6CD5\u898F.md",A)}}),e.addEventListener("toggle",x=>{let A=x.target.closest?.("[data-home-wf-stage]");if(!A||!e.contains(A))return;let F=A.dataset.homeWfStage||"";F&&(A.open?ga.add(F):ga.delete(F))},!0),b(),v?.focus({preventScroll:!0}),await k(),!s)try{i=vt("processing",(x,A)=>{s||A?.initial||j()},{onError:()=>{}})}catch{i=null}return()=>{s=!0,u&&(window.clearTimeout(u),u=null),typeof i=="function"&&i(),i=null}}var Qn={};Zt(Qn,{render:()=>qd});var Jr="judgment-console";var pt="query_history",Ft="settings",Ht="audit_events";var Ye={history:[],settings:new Map,audit:[],nextId:1},ha=null,st=!("indexedDB"in window);function Mt(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function kt(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function Lt(){return ha||(ha=new Promise((e,t)=>{if(!("indexedDB"in window)){st=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(Jr,2)}catch(a){st=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(pt)){let n=a.createObjectStore(pt,{keyPath:"id",autoIncrement:!0});n.createIndex("created_at","created_at"),n.createIndex("kind","kind")}if(a.objectStoreNames.contains(Ft)||a.createObjectStore(Ft,{keyPath:"key"}),!a.objectStoreNames.contains(Ht)){let n=a.createObjectStore(Ht,{keyPath:"key"});n.createIndex("created_at","created_at"),n.createIndex("dataset","dataset"),n.createIndex("jid","jid"),n.createIndex("issue_month","issue_month")}},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{st=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{st=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),ha)}function Wr(){return"indexedDB"in window}function Vr(){return st}function Hs(){return st?"memory":"indexeddb"}function Bl(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},turns:Array.isArray(e.turns)?e.turns:[],pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t,updated_at:e.updated_at||t}}async function Fl(){try{let t=(await Lt()).transaction(pt,"readwrite"),s=t.objectStore(pt),a=await Mt(s.count());if(a>120){let n=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let u=i.result;if(!u||n<=0){o();return}u.delete(),n-=1,u.continue()},i.onerror=()=>l(i.error)})}await kt(t)}catch{st=!0}}async function zs(e){let t=Bl(e);try{let a=(await Lt()).transaction(pt,"readwrite"),n=a.objectStore(pt),i=await Mt(n.add(t));return await kt(a),await Fl(),i}catch{st=!0;let a=Ye.nextId++;return Ye.history.push({id:a,...t}),Ye.history.length>120&&Ye.history.shift(),a}}async function Gs(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let n=(await Lt()).transaction(pt,"readwrite"),i=n.objectStore(pt),o=await Mt(i.get(s));if(!o)return await kt(n),null;let l={...o,...t,id:s};return await Mt(i.put(l)),await kt(n),l}catch{st=!0;let n=Ye.history.findIndex(i=>Number(i.id)===s);return n===-1?null:(Ye.history[n]={...Ye.history[n],...t,id:s},Ye.history[n])}}async function Kr(e){let t=Number(e);if(!Number.isFinite(t))return!1;try{let a=(await Lt()).transaction(pt,"readwrite");return a.objectStore(pt).delete(t),await kt(a),!0}catch{st=!0;let a=Ye.history.findIndex(n=>Number(n.id)===t);return a===-1?!1:(Ye.history.splice(a,1),!0)}}async function va({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let n=(await Lt()).transaction(pt,"readonly"),i=n.objectStore(pt),o=await Mt(i.getAll());return await kt(n),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,u)=>String(u.updated_at||u.created_at).localeCompare(String(l.updated_at||l.created_at))).slice(0,t)}catch{return st=!0,Ye.history.filter(n=>s?`${n.kind} ${n.title} ${n.detail}`.toLowerCase().includes(s):!0).slice().sort((n,i)=>String(i.updated_at||i.created_at).localeCompare(String(n.updated_at||n.created_at))).slice(0,t)}}async function Yr(){try{let t=(await Lt()).transaction(pt,"readwrite");t.objectStore(pt).clear(),await kt(t)}catch{st=!0}Ye.history=[]}function Hl(e){let t=Number(e.id??e.event_id??0)||0,s=String(e.dataset||e.kind||"judgment"),a=String(e.key||`${s}:${t||`${Date.now()}:${Math.random().toString(36).slice(2)}`}`),n=String(e.jid||""),i=String(e.issue_month||""),o=String(e.change_type||""),l=String(e.detected_at||e.created_at||new Date().toISOString());return{key:a,event_id:t,dataset:s,jid:n,issue_month:i,change_type:o,title:String(e.title||n||i||"\u7248\u672C\u8B8A\u66F4"),detail:String(e.detail||[o,i,n].filter(Boolean).join(" \xB7 ")),created_at:l,payload:e}}async function zl(){try{let t=(await Lt()).transaction(Ht,"readwrite"),s=t.objectStore(Ht),a=await Mt(s.count());if(a>2e3){let n=a-2e3,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let u=i.result;if(!u||n<=0){o();return}u.delete(),n-=1,u.continue()},i.onerror=()=>l(i.error)})}await kt(t)}catch{st=!0}}async function Xr(e){let t=(Array.isArray(e)?e:[]).filter(s=>s&&typeof s=="object").map(Hl);if(!t.length)return 0;try{let a=(await Lt()).transaction(Ht,"readwrite"),n=a.objectStore(Ht);for(let i of t)await Mt(n.put(i));return await kt(a),await zl(),t.length}catch{st=!0;let a=new Map(Ye.audit.map(n=>[n.key,n]));for(let n of t)a.set(n.key,n);return Ye.audit=Array.from(a.values()).sort((n,i)=>String(i.created_at).localeCompare(String(n.created_at))).slice(0,2e3),t.length}}async function Zr({keyword:e="",limit:t=200}={}){let s=e.trim().toLowerCase(),a=n=>s?`${n.dataset} ${n.jid} ${n.issue_month} ${n.change_type} ${n.detail}`.toLowerCase().includes(s):!0;try{let i=(await Lt()).transaction(Ht,"readonly"),o=i.objectStore(Ht),l=await Mt(o.getAll());return await kt(i),l.filter(a).sort((u,d)=>String(d.created_at).localeCompare(String(u.created_at))).slice(0,t)}catch{return st=!0,Ye.audit.filter(a).slice().sort((i,o)=>String(o.created_at).localeCompare(String(i.created_at))).slice(0,t)}}async function ei(){let e={name:Jr,version:2,supported:"indexedDB"in window,mode:Hs(),degraded:st,stores:[pt,Ft,Ht],caps:{history:120,audit:2e3},usage_bytes:null,quota_bytes:null};if(typeof navigator<"u"&&navigator.storage?.estimate)try{let t=await navigator.storage.estimate();e.usage_bytes=Number.isFinite(t.usage)?t.usage:null,e.quota_bytes=Number.isFinite(t.quota)?t.quota:null}catch{}try{let s=(await Lt()).transaction([pt,Ft,Ht],"readonly"),a=kt(s),[n,i,o]=await Promise.all([Mt(s.objectStore(pt).count()),Mt(s.objectStore(Ft).count()),Mt(s.objectStore(Ht).count()),a]);return{...e,available:!0,counts:{query_history:n,settings:i,audit_events:o},total:n+i+o}}catch{return st=!0,{...e,available:!1,degraded:!0,mode:"memory",counts:{query_history:Ye.history.length,settings:Ye.settings.size,audit_events:Ye.audit.length},total:Ye.history.length+Ye.settings.size+Ye.audit.length}}}async function Us(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let n=(await Lt()).transaction(Ft,"readwrite");return n.objectStore(Ft).put(s),await kt(n),s}catch{return st=!0,Ye.settings.set(s.key,s),s}}async function ns(e,t=null){try{let a=(await Lt()).transaction(Ft,"readonly"),n=a.objectStore(Ft),i=await Mt(n.get(String(e)));return await kt(a),i?i.value:t}catch{st=!0;let a=Ye.settings.get(String(e));return a?a.value:t}}async function ti({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await Lt()).transaction(Ft,"readonly"),n=a.objectStore(Ft),i=await Mt(n.getAll());return await kt(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return st=!0,Array.from(Ye.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function si(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var zn={};Zt(zn,{buildFlowWaterfallStages:()=>Na,render:()=>ad,renderRagPipelineWaterfall:()=>Ta,renderTestFlowPanel:()=>Ls,renderWaterfallStages:()=>Ms});var Gl={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},Ul=new Set(["running","stopping"]);function wa(e){let[t,s]=Gl[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${r(t)}</span>`}function $a(e){return String(e).padStart(2,"0")}function As(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${$a(t.getMonth()+1)}-${$a(t.getDate())} ${$a(t.getHours())}:${$a(t.getMinutes())}`}function ya(e){return Ul.has(e)}function Kt(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function ds(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function rs(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${r(e)}</span>
    <strong>${r(String(t))}</strong>
    ${s?`<small>${r(s)}</small>`:""}
  </div>`}function ai(e={}){let t=e.score_components||e,s=e.gate||{},a=String(s.status||""),n=a==="pass"?"Gate \u901A\u904E":a==="fail"?"Gate \u5931\u6557":a==="no_data"?"Gate \u7121\u8CC7\u6599":"";return`${n?`<span class="badge ${a==="pass"?"badge-ok":a==="fail"?"badge-danger":"badge-neutral"}">${r(n)}</span>`:""}<div class="bench-metrics">
    ${rs("Law Recall",ds(t.law_recall))}
    ${rs("Article Recall",ds(t.article_recall))}
    ${rs("Citation Valid",ds(t.citation_valid_rate))}
    ${rs("Judge",Kt(t.judge_overall))}
    ${rs("Human",Kt(t.human_overall))}
    ${rs("p50",de(e.duration_p50_ms))}
    ${rs("p95",de(e.duration_p95_ms))}
    ${rs("Success",`${c(e.success||0)} / ${c(e.total||0)}`)}
  </div>`}function ni(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${r(s.replace(/^rag\./,""))}</span>
      <strong>${de(a.p50_ms)}</strong>
      <small>p95 ${de(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function ri(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${ds(s.law_recall)}</span>
    <span>Article ${ds(s.article_recall)}</span>
    <span>Judge ${Kt(s.judge_overall)}</span>
    <span>p95 ${de(t.duration_p95_ms)}</span>`}function ii(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function oi(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${r(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${r(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${r(e.status||"")}">${wa(e.status)}</span>
      <span class="mono">${r(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${r(be(e.started_at))}</span>
      <span data-bench-slot="run-completed">${c(e.completed_cases||0)} / ${c(e.total_cases||0)} \u984C</span>
      <span>${r(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${r(ii(e))}">${ri(e)}</span>
  </button>`}function Mn(e,t=[]){let s=e.metrics||{},a=e.judge||{},n=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([d])=>d.startsWith("rag.")).map(([d,g])=>`<span class="chip">${r(d)} ${de(g)}</span>`).join(""),u=(e.law_sources||[]).map(d=>`<span class="chip">${r(d.law_name||"\u6CD5\u898F")} ${c((d.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${r(e.question)}</span>
      ${wa(e.status)}
      <span class="bench-case-time">${de(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${Kt(i.deterministic)} \xB7 Judge ${Kt(i.judge)} \xB7 Human ${Kt(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${r((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${r(e.fingerprint||"")}">${m("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
      </div>
      <div class="bench-case-stages">${l||'<span class="qb-muted">\u6C92\u6709 stage timing</span>'}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${ds(s.law_recall)}</span>
        <span>Article recall ${ds(s.article_recall)}</span>
        <span>Citation ${s.citation_valid?"valid":"invalid"}</span>
        <span>Refusal ${s.refusal_correct===null?"\u2014":s.refusal_correct?"correct":"wrong"}</span>
      </div>
      <div class="chips">${u||'<span class="qb-muted">\u6C92\u6709\u6CD5\u898F\u4F86\u6E90</span>'}</div>
      <div class="bench-answer"><strong>\u56DE\u7B54</strong><p>${r(e.answer||"\u2014")}</p></div>
      <div class="bench-judge"><strong>LLM judge</strong><p>${r(a.rationale||a.reason||"\u2014")}</p><span>${[["correctness",a.correctness],["grounding",a.grounding],["citation",a.citation],["clarity",a.clarity],["overall",a.overall]].map(([d,g])=>`${d} ${g??"\u2014"}`).join(" \xB7 ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${e.id}">
        <div class="bench-human-grid">
          ${[["correctness","\u6B63\u78BA\u6027",n.scores?.correctness??4],["grounding","\u6709\u64DA\u6027",n.scores?.grounding??4],["citation","\u5F15\u7528",n.scores?.citation??4],["clarity","\u6E05\u695A",n.scores?.clarity??4],["overall","\u6574\u9AD4",n.overall??4]].map(([d,g,v])=>`<label class="field"><span class="field-label">${g} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${d}" value="${r(String(v))}" /></label>`).join("")}
        </div>
        <label class="field"><span class="field-label">\u4EBA\u5DE5\u6279\u6CE8</span><input class="input" name="comment" value="${r(n.comment||"")}" placeholder="\u56DE\u7B54\u54C1\u8CEA\u3001\u5F15\u7528\u6216\u4E8B\u5BE6\u932F\u8AA4" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${m("check",13)}<span>\u5132\u5B58\u4EBA\u5DE5\u8A55\u5206</span></button>
      </form>
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(d=>`<div class="bench-history-row"><span>${r(be(d.run?.started_at))}</span><span>${r(d.run?.config?.llm_model||"\u2014")}</span><span>Det ${Kt(d.metrics?.scores?.deterministic)}</span><span>Judge ${Kt(d.metrics?.scores?.judge)}</span><span>Human ${Kt(d.metrics?.scores?.human)}</span><span>${de(d.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function qn(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function li(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${Mn(e,t)}
  </details>`}function ci(e){return`${wa(e.status)}
    <span class="mono">${r(e.run_id)}</span>
    ${ya(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${m("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function Ql(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${r(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${m("activity",14)}${r(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${r((e.status||"")+":"+e.run_id)}">
        ${ci(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${ai(e.summary||{})}</div>
    <div data-bench-detail="stages">${ni(e.summary||{})}</div>
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
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>li(a,t[a.fingerprint]||[])).join(""):Pe({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function di(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${m("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${m("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function ui(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),n=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,n-i):0,l=(t||[]).filter(b=>["success","failed"].includes(b.status)).map(b=>Number(b.duration_ms)||0).filter(b=>b>0),u=null;if(l.length)u=l.reduce((b,y)=>b+y,0)/l.length;else if(a>0){let b=Date.parse(e.updated_at||""),y=Number.isFinite(b)?b:i;Number.isFinite(y)&&y>i?u=(y-i)/a:o>0&&(u=o/a)}let d=(t||[]).find(b=>b.status==="running")||null,g=0;if(a<s&&u&&u>0){let b=d?Date.parse(d.started_at||""):NaN,y=Date.parse(e.updated_at||""),k=Number.isFinite(b)?b:y;Number.isFinite(k)&&(g=Math.max(0,Math.min(.95,(n-k)/u)))}let v=Math.min(s,a+g),f=s>0?Math.max(0,Math.min(100,v/s*100)):0,p=u===null?null:Math.max(0,s-v)*u;return{total:s,completed:a,elapsedMs:o,averageMs:u,progress:f,etaMs:p,ratePerMin:u?6e4/u:null,running:d}}function pi(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${de(e)}`}function mi(e,t=[]){let s=ui(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${r(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${c(s.completed)} / ${c(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${pi(s.etaMs)}</span>
      <span data-bench-slot="progress-rate">${s.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${s.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`}</span>
    </div>
    <div class="processing-bar processing-bar-lg bench-progress-bar${s.completed===0?" is-waiting":""}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.progress.toFixed(1)}" data-bench-slot="progress-bar">
      <span class="processing-bar-fill" data-bench-slot="progress-fill" style="width:${s.progress.toFixed(2)}%"></span>
    </div>
    <div class="bench-progress-foot">
      <span data-bench-slot="progress-elapsed">\u5DF2\u57F7\u884C ${de(s.elapsedMs)}</span>
      <span data-bench-slot="progress-average">${s.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${de(s.averageMs)}\uFF0F\u984C`}</span>
      <span>\u5373\u6642\u9810\u4F30 \xB7 \u6BCF\u5B8C\u6210\u4E00\u984C\u6821\u6B63</span>
    </div>
  </div>`}function Jl(e){let t=e.models?.models||{},s=e.suites||[],a=Qs(e),n=e.selectedRun;return`<section class="report-card bench-card">
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
      <label class="field"><span class="field-label">Run \u6A19\u7C64</span><input class="input" name="label" value="${r(e.config.label||As())}" /></label>
      <div class="qb-actions" data-bench-actions data-signature="${r(a?`${a.run_id}:${a.status}`:"")}">
        ${di(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${r(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?mi(a,Ln(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>oi(i,n?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${n?Ql(n,e.history):""}
  </section>`}function Qs(e){let t=(e.runs||[]).find(s=>ya(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!ya(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function Ln(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function gi(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:As(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",refreshStream:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),n=E=>{let L=new FormData(E);return{label:String(L.get("label")||"").trim()||As(),embedding_model:String(L.get("embedding_model")||""),llm_model:String(L.get("llm_model")||""),judge_model:String(L.get("judge_model")||""),top_k:Number(L.get("top_k")||4),score_threshold:Number(L.get("score_threshold")||.35),repeats:Number(L.get("repeats")||1),enable_law_retrieval:E.elements.enable_law_retrieval?.checked??!0,judge_enabled:E.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(E=>`${E.id}:${E.name}:${E.item_count}:${E.version}:${E.status}`)]:null,runs:(s.runs||[]).map(E=>`${E.run_id}:${E.label||""}:${E.suite_version||1}`)}),o=()=>{let L=a()?.querySelector("[data-bench-live]"),T=Qs(s);if(!L||!T)return;let te=ui(T,Ln(s,T)),le=(ye,H)=>{let ve=L.querySelector(`[data-bench-slot="${ye}"]`);ve&&ve.textContent!==H&&(ve.textContent=H)};le("progress-count",`${c(te.completed)} / ${c(te.total)} \u984C`),le("progress-percent",`${te.progress.toFixed(1)}%`),le("progress-eta",pi(te.etaMs)),le("progress-rate",te.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${te.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),le("progress-elapsed",`\u5DF2\u57F7\u884C ${de(te.elapsedMs)}`),le("progress-average",te.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${de(te.averageMs)}\uFF0F\u984C`),le("progress-state",T.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let Q=L.querySelector('[data-bench-slot="progress-bar"]');Q&&(Q.setAttribute("aria-valuenow",te.progress.toFixed(1)),Q.classList.toggle("is-waiting",te.completed===0));let me=L.querySelector('[data-bench-slot="progress-fill"]');me&&(me.style.width=`${te.progress.toFixed(2)}%`)},l=E=>{let L=E.querySelector("[data-bench-actions]");if(!L)return;let T=Qs(s),te=T?`${T.run_id}:${T.status}`:"";L.dataset.signature!==te&&(L.dataset.signature=te,L.innerHTML=di(T))},u=E=>{let L=E.querySelector("[data-bench-live-wrap]");if(!L)return;let T=Qs(s),te=T?`${T.run_id}:${T.status}:${T.total_cases}`:"";L.dataset.signature!==te&&(L.dataset.signature=te,L.innerHTML=T?mi(T,Ln(s,T)):"")},d=E=>{let L=E.querySelector("[data-bench-runs]");if(!L)return;let T=s.runs||[],te=[...L.querySelectorAll("[data-run-id]")].map(Q=>Q.dataset.runId),le=T.map(Q=>Q.run_id);if(te.join("|")!==le.join("|")){L.innerHTML=T.length?T.map(Q=>oi(Q,s.selectedRun?.run_id===Q.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let Q of T){let me=L.querySelector(`[data-run-id="${Q.run_id}"]`);if(!me)continue;me.classList.toggle("is-active",s.selectedRun?.run_id===Q.run_id);let ye=me.querySelector('[data-bench-slot="run-label"]');ye&&ye.textContent!==(Q.label||"RAG Benchmark")&&(ye.textContent=Q.label||"RAG Benchmark");let H=me.querySelector('[data-bench-slot="run-status"]');H&&H.dataset.status!==(Q.status||"")&&(H.dataset.status=Q.status||"",H.innerHTML=wa(Q.status));let ve=me.querySelector('[data-bench-slot="run-completed"]');if(ve){let $e=`${c(Q.completed_cases||0)} / ${c(Q.total_cases||0)} \u984C`;ve.textContent!==$e&&(ve.textContent=$e)}let Z=me.querySelector('[data-bench-slot="run-scores"]'),xe=ii(Q);Z&&Z.dataset.signature!==xe&&(Z.dataset.signature=xe,Z.innerHTML=ri(Q))}},g=E=>{let L=s.selectedRun;if(!L)return;let T=E.querySelector(`.bench-detail[data-run-id="${L.run_id}"]`);if(!T)return;let te=T.querySelector("[data-bench-detail-actions]");if(te){let Z=`${L.status||""}:${L.run_id}`;te.dataset.signature!==Z&&(te.dataset.signature=Z,te.innerHTML=ci(L))}let le=T.querySelector('[data-bench-detail="metrics"]');if(le){let Z=JSON.stringify(L.summary||{});le.dataset.signature!==Z&&(le.dataset.signature=Z,le.innerHTML=ai(L.summary||{}))}let Q=T.querySelector('[data-bench-detail="stages"]');if(Q){let Z=JSON.stringify((L.summary||{}).stages||{});Q.dataset.signature!==Z&&(Q.dataset.signature=Z,Q.innerHTML=ni(L.summary||{}))}let me=T.querySelector("[data-bench-cases]");if(!me)return;let ye=L.cases||[];if(!ye.length)return;let H=me.querySelector(".notice");H&&H.remove();let ve=new Map([...me.querySelectorAll("details.bench-case")].map(Z=>[Number(Z.dataset.resultId),Z]));for(let Z of ye){let xe=s.history[Z.fingerprint]||[],$e=qn(Z,xe),ee=ve.get(Number(Z.id));if(!ee){me.insertAdjacentHTML("beforeend",li(Z,xe)),ee=me.lastElementChild,ee&&(ee._benchSignature=$e);continue}if(ee._benchSignature===$e||!s.forcedCaseIds.delete(Number(Z.id))&&ee.contains(document.activeElement))continue;let he=ee.open;ee.innerHTML=Mn(Z,xe),ee.open=he,ee._benchSignature=$e}},v=()=>{Qs(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},f=()=>{let E=a();E&&(l(E),u(E),d(E),g(E),o(),v())},p=E=>{let L=s.selectedRun;if(!L)return;let T=E.querySelector('[data-bench-detail="metrics"]');T&&(T.dataset.signature=JSON.stringify(L.summary||{}));let te=E.querySelector('[data-bench-detail="stages"]');te&&(te.dataset.signature=JSON.stringify((L.summary||{}).stages||{}));let le=E.querySelector("[data-bench-cases]");if(!le)return;let Q=new Map((L.cases||[]).map(me=>[Number(me.id),me]));for(let me of le.querySelectorAll("details.bench-case")){let ye=Q.get(Number(me.dataset.resultId));ye&&(me._benchSignature=qn(ye,s.history[ye.fingerprint]||[]))}},b=(E=!1)=>{let L=a();if(!L)return;let T=i();if(!E&&s.renderSignature===T){f();return}s.renderSignature=T,s.forcedCaseIds.clear(),L.innerHTML=Jl(s),p(L),f()},y=async({refreshAll:E=!1,runs:L=null}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||E;return}s.loading=!0;try{if(!s.referenceLoaded||E){let[H,ve]=await Promise.all([W.benchmarkModels(),W.benchmarkSuites()]);s.models=H,s.suites=ve.suites||[],s.indexVersion=H.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=H.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=H.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(H.models?.llm||[]).find(Z=>Z!==s.config.llm_model)||"")}let T=L?{runs:L}:await W.benchmarkRuns(30);s.runs=T.runs||[];let te=s.activeRunId,le=s.runs.find(H=>ya(H.status))||null;s.activeRunId=le?.run_id||"";let Q=s.selectedRun?.run_id||"";Q||(Q=le?.run_id||s.runs[0]?.run_id||"");let me=!!(s.selectedRun&&te&&s.selectedRun.run_id===te);Q&&(!s.selectedRun||s.selectedRun.run_id!==Q||Q===le?.run_id||me)?s.selectedRun=await W.benchmarkRun(Q,!0):Q||(s.selectedRun=null),s.loaded=!0,b()}catch(T){if(!s.loaded){s.renderSignature="";let te=a();te&&(te.innerHTML=Pe({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:r(T.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let T=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,y({refreshAll:T})}}},k=()=>{s.refreshStream||(s.refreshStream=vt("benchmark",(E,L)=>{s.loading||y({runs:L?.snapshot?.runs||null})}))},j=async E=>{try{s.selectedRun=await W.benchmarkRun(E,!0),b()}catch(L){P(L.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},x=async E=>{!s.labelTouched&&E.elements.label&&(E.elements.label.value=As());let L=n(E);s.config=L;let T=Number(E.elements.suite_id?.value||0);if(!T){P("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await W.startBenchmarkRun({suite_id:T,config:L,actor:"anonymous"}),P("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=As(),s.labelTouched=!1,await y()}catch(te){P(te.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},A=async E=>{try{await W.stopBenchmarkRun(E),P("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await y()}catch(L){P(L.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},F=async E=>{let L=Number(E.dataset.resultId||0),T=new FormData(E),te={};for(let le of["correctness","grounding","citation","clarity","overall"]){let Q=Number(T.get(`score_${le}`));Number.isFinite(Q)&&(te[le]=Q)}try{await W.reviewBenchmarkResult(L,{reviewer:"anonymous",scores:te,comment:String(T.get("comment")||"")}),P("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await W.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(L)),b()}catch(le){P(le.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},ne=async E=>{if(E)try{let L=await W.benchmarkFingerprintHistory(E,50);s.history[E]=L.cases||[];let T=s.selectedRun,te=a();if(!T||!te)return;let le=(T.cases||[]).filter(Q=>Q.fingerprint===E);for(let Q of le){let me=te.querySelector(`details.bench-case[data-result-id="${Q.id}"]`);if(!me)continue;let ye=me.open;me.innerHTML=Mn(Q,s.history[E]),me.open=ye,me._benchSignature=qn(Q,s.history[E])}}catch(L){P(L.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},Y=async E=>{let L=E.target.closest("[data-bench-action]");if(!L)return;let T=L.dataset.benchAction;T==="open-run"?await j(L.dataset.runId||""):T==="stop"?await A(L.dataset.runId||""):T==="fingerprint-history"&&await ne(L.dataset.fingerprint||"")},Se=async E=>{let L=E.target.closest("[data-bench-form]");L&&(E.preventDefault(),L.dataset.benchForm==="run"?await x(L):L.dataset.benchForm==="human"&&await F(L))},fe=E=>{E&&(E.elements.label&&E.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=n(E),E.elements.suite_id&&(s.selectedSuiteId=Number(E.elements.suite_id.value)||s.selectedSuiteId))},U=E=>{let L=E.target.closest('[data-bench-form="run"]');L&&fe(L)};return e.addEventListener("click",Y),e.addEventListener("submit",Se),e.addEventListener("input",U),e.addEventListener("change",U),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=As();let E=a()?.querySelector('input[name="label"]');E&&(E.value=s.config.label)}k(),y({refreshAll:!s.referenceLoaded})},refresh(){return k(),y({refreshAll:!0})},destroy(){e.removeEventListener("click",Y),e.removeEventListener("submit",Se),e.removeEventListener("input",U),e.removeEventListener("change",U),s.refreshStream&&s.refreshStream(),s.refreshStream=null,s.tickTimer&&window.clearInterval(s.tickTimer)}}}var In={};Zt(In,{exportCsv:()=>qa,exportableResult:()=>Ma,render:()=>jc,renderReport:()=>Sa,reportError:()=>Aa,reportLoading:()=>Js});var _i=[10,25,50,100],fi=500,Wl=["law_name","law_level","law_category","law_modified_date","article_count"],Vl=["jid","court_normalized","title","jdate","matched_laws","citation_count"],Kl={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function xa(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function _a(e,t){let s={};for(let a of e.fields||[]){let n=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?n:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{},fuzzyTerms:[]}}function Yl(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,n]of Object.entries(s))if(Array.isArray(n)&&!n.map(String).includes(String(t[a]??"")))return!1;return!0}function Pn(e,t){return(e.fields||[]).filter(s=>Yl(s,t))}function Xl(e,t){return`filter-${e.id}-${t}`}function us(e){return e==null?"":r(String(e))}function jn(e,t,s){let a=s[t.key],n=Xl(e,t.key),i=t.help?`<span class="field-help">${r(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(u=>`<option value="${us(u.value)}" ${String(u.value)===String(a??"")?"selected":""}>${r(u.label??u.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${n}" name="${r(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),u=(t.options||[]).map(d=>`<label class="multi-option">
          <input type="checkbox" name="${r(t.key)}" value="${us(d.value)}" ${l.has(String(d.value))?"checked":""} />
          <span>${r(d.label??d.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${u}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${n}" name="${r(t.key)}"
        value="${us(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${us(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${n}" name="${r(t.key)}"
        value="${us(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${n}" name="${r(t.key)}"
      value="${us(a)}"
      placeholder="${us(t.placeholder||"")}" />
    ${i}
  </div>`}function bi(e,t,{focusTable:s=!1}={}){let a=Pn(e,t.values),n=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(n.push(`<div class="field-row">${jn(e,o,t.values)}${jn(e,l,t.values)}</div>`),i+=1):n.push(jn(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
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
  </form>`}function ka(e,t,s){let a={...s.values};for(let n of Pn(t,a))if(n.type==="checkbox"){let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=!!i?.checked}else if(n.type==="multiselect")a[n.key]=Array.from(e.querySelectorAll(`[name="${n.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=i?i.value:""}return a}function ki(e,t){let s={};for(let a of Pn(e,t.values)){let n=t.values[a.key];a.type==="checkbox"?s[a.key]=!!n:a.type==="multiselect"?s[a.key]=Array.isArray(n)?n:[]:a.type==="number"?s[a.key]=n===""||n===null?"":Number(n):s[a.key]=n??""}return s}function Tn(e,t){let s=ki(e,t);return Array.isArray(t.fuzzyTerms)&&t.fuzzyTerms.length&&(s.keywords=[...t.fuzzyTerms]),(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function Zl(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${Pe({tone:t,title:`${xa(e)} ${Et(e.status).label}`,text:r(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function ec(e,t){return`<label class="field data-source-field">
    <span class="field-label">\u8CC7\u6599\u4F86\u6E90</span>
    <select class="select" name="database">
      ${e.map(s=>{let a=Et(s.status);return`<option value="${r(s.id)}" ${s.id===t?"selected":""}>${r(s.label)} \xB7 ${r(a.label)}</option>`}).join("")}
    </select>
  </label>`}function hi(e,t){return`<nav class="data-nav" aria-label="\u8CC7\u6599\u67E5\u8A62\u529F\u80FD">
    ${[{id:"law",label:"\u67E5\u8A62\u6CD5\u898F\u547D\u4EE4",hint:"Fuzzy \u6CD5\u898F\u540D\u7A31\u3001\u985E\u5225\u8207\u547D\u4EE4",icon:"file"},{id:"judgment",label:"\u67E5\u8A62\u5224\u6C7A",hint:"Fuzzy \u6CD5\u9662\u3001\u6848\u865F\u8207\u6848\u7531",icon:"layers"},{id:"schema",label:"\u8CC7\u6599\u5EAB Schema",hint:"\u8CC7\u6599\u8868\u3001\u6B04\u4F4D\u8207\u9810\u89BD",icon:"table"}].map(a=>{let n=a.id==="schema"?t==="schema":t==="query"&&e===a.id;return`<button class="data-nav-item${n?" is-active":""}" type="button"
          data-action="data-nav" data-tab="${a.id}" ${n?'aria-current="page"':""}>
          <span class="data-nav-icon">${m(a.icon,15)}</span>
          <span class="data-nav-copy">
            <strong>${r(a.label)}</strong>
            <small>${r(a.hint)}</small>
          </span>
        </button>`}).join("")}
  </nav>`}function tc(e,t,s){if(t.id!=="postgres"&&t.id!=="parquet")return"";let a=Array.isArray(s.fuzzyTerms)?s.fuzzyTerms:[],n=e==="law"?"Fuzzy \u6CD5\u898F\uFF0F\u547D\u4EE4":"Fuzzy \u5224\u6C7A",i=e==="law"?"\u8F38\u5165\u6CD5\u898F\u540D\u7A31\u6216\u76F8\u8FD1\u5B57\u2026":"\u8F38\u5165\u6CD5\u9662\u3001\u6848\u865F\u3001\u6848\u7531\u6216\u76F8\u8FD1\u5B57\u2026";return`<div class="data-fuzzy" data-data-fuzzy data-fuzzy-kind="${e}">
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
  </div>`}function Nn(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],n=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function sc(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||r(e.detail||"")}function ac(e){return`<div class="report-empty">
    ${ut({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:r({postgres:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u6CD5\u898F\u6216\u5224\u6C7A\u689D\u4EF6\uFF0C\u518D\u8996\u9700\u8981\u5C55\u958B\u9032\u968E metadata \u689D\u4EF6\u3002",parquet:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u689D\u4EF6\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\uFF1B\u53EF\u5C55\u958B\u9032\u968E\u689D\u4EF6\u8ABF\u6574\u6B04\u4F4D\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
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
  </div>`}function Js(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(xa(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function Aa(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(xa(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Pe({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function nc(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,n=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${r(s.label||"\u672A\u5206\u985E")}">${r(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${n.toFixed(1)}%"></span></span>
          <span class="dist-value">${c(a)}</span>
        </div>`}).join("")}
  </div>`}function Si(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function rc(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function ic(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function oc(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${r(String(t))}"
    title="\u6AA2\u8996\u300C${r(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${r(String(t))}${m("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var lc={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function cc(e,t,s,a=!1,n=!0,i=!1){let o=a?e.key:e.label||e.key,l=n?t?lc[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${r(o)}</th>`;let u=s?.key===l,d=u?s.direction:null,g=d==="asc"?"ascending":d==="desc"?"descending":"none",v=d==="asc"?"\u2191":d==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${g}">
    <button class="table-sort${u?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${r(l)}"
      title="\u4F9D${r(o)}\u6392\u5E8F">
      <span>${r(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${v}</span>
    </button>
  </th>`}function dc(e,t){if(!Si(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,n=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(n||""),lawName:String(t.law_name||"")}}function uc(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${r(s.lawKey)}"
    data-law-source="${r(s.sourceType)}"
    data-law-name="${r(s.lawName)}"
    title="\u6AA2\u8996\u300C${r(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(String(a))}${m("chevronRight",12,"law-link-icon")}</button>`}function xi(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:n=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],u=(e.page-1)*e.page_size,d=Si(e),g=rc(e),v=ic(e),f=e.meta?.sort||null,p=n?`<tr class="schema-search-row">
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
      <span class="muted" style="font-size:10px">${c(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${d?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":g?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":v?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${p}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(b=>cc(b,g,f,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((b,y)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${u+y+1}</td>
                ${o.map(k=>{if((g||v)&&k.key==="jid")return`<td class="cell-jid">${oc(b)}</td>`;let j=d&&k.key==="law_name"?dc(e,b):null;if(j)return`<td>${uc(b,k,j)}</td>`;let A={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[k.type];return`<td${A?` class="${A}"`:""}>${oa(b[k.key],k.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${ut({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function pc(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${_i.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${m("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${m("chevronRight",13)}</button>
    </div>
  </div>`}function Ai(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${r(t)}</div>`).join("")}</div>`}function Sa(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],n=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",u=e.status||"ok",d=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${r(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${r(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${r(e.label||l)}
          ${Ue(u)}
          <span class="chip">${r(d)}</span>
        </div>
        <div class="report-sub">
          ${c(i)} \u7B46\u7B26\u5408 \xB7
          ${de(e.duration_ms)} \xB7
          ${r(String(l).toUpperCase())} / ${r(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${m("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${m("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${Pe({tone:u==="not_configured"?"info":u==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:""}

    ${a.length?`<div class="summary-strip">
            ${a.slice(0,4).map(g=>`<div class="summary-item">
                  <div class="summary-label">${r(g.label)}</div>
                  <div class="summary-value">${r(g.value)}</div>
                </div>`).join("")}
          </div>`:""}

    <div class="report-grid">
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u7D50\u679C\u5206\u5E03</span>
          <span class="muted" style="font-size:9.5px">${n.length} groups</span>
        </div>
        ${nc(n)}
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
        ${Ai(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?xi(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?pc({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function vi(e){return`<div class="report-card schema-preview">
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
  </div>`}function En(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let n=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${Pe({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${r(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${r(t||e.table||"\u8CC7\u6599\u8868")}
          ${Ue(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${r(String(e.database||""))} / ${r(String(e.table||"\u2014"))} \xB7 ${n.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${xi({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${Ai(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${c(i.length)} \u7B46</span>
      <strong>\u5171 ${c(e.total)} \u7B46</strong>
    </div>
  </div>`}function $i(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${r(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${Pe({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function mc(e){return`<div class="report-empty">
    ${ut({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${xa(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function Rn(e){return e.is_current===!0?Ue("ok","\u73FE\u884C"):e.law_abandon_note?Ue("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?Ue("empty","\u6B77\u53F2\u7248\u672C"):Ue("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function Xe(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${r(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function ps(e){return e?Nt(e):"\u2014"}function gc(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function Cn(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${r(e)}</span>
    </div>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </div>`:""}function fc(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${r(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${m("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </details>`:""}function bc(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let n=a?.name||a?.url||"";return n?a.url?`<a class="law-attachment" href="${r(a.url)}" target="_blank" rel="noopener noreferrer">
          ${m("file",12)}<span>${r(n)}</span>${m("external",11)}
        </a>`:`<span class="law-attachment">${m("file",12)}<span>${r(n)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${c(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function qi(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function hc(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,n=s?`${c(a)} \u689D \xB7 ${c(s)} \u7AE0\u7BC0`:`${c(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${r(l)}</div>`;let u=Kl[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${r(qi(o.article_no))}">
        <div class="law-article-head">
          <span class="law-article-no">${r(o.article_no||"\u689D\u6587")}</span>
          ${u&&u!=="\u689D\u6587"?`<span class="chip">${r(u)}</span>`:""}
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
  </div>`}function vc(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function qs(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${m("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function $c(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${qs()}
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
  </div>`}function yc(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${qs()}
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
        ${Pe({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function wc(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let n=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",n,a.article_count_for_law?`${c(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${r(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${r(i)}</option>`}).join("")}
    </select>
  </label>`}function _c(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let n={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${n[o]} ${c(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">\u7248\u672C\u8B8A\u66F4</span>
      <span class="muted">${r(i)}</span>
    </summary>
    <div class="law-version-change-list">
      ${a.length?a.slice(0,20).map(o=>{let l=o.change_type==="added"?"badge-ok":o.change_type==="removed"?"badge-danger":"badge-warn",u=o.before_content?`<details><summary>\u8B8A\u66F4\u524D</summary><pre>${r(o.before_content)}</pre></details>`:"",d=o.after_content?`<details><summary>\u8B8A\u66F4\u5F8C</summary><pre>${r(o.after_content)}</pre></details>`:"";return`<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${l}">${r(n[o.change_type]||o.change_type)}</span>
                    <strong>${r(o.article_no||o.article_key)}</strong>
                  </div>
                  ${u}${d}
                </div>`}).join(""):'<div class="report-empty-inline">\u6B64\u7248\u672C\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u8B8A\u66F4\u3002</div>'}
      ${e.changes_truncated?'<div class="report-empty-inline">\u50C5\u986F\u793A\u524D 20 \u7B46\u8B8A\u66F4\uFF1BAPI \u56DE\u50B3\u4E0A\u9650 200 \u7B46\u3002</div>':""}
    </div>
  </details>`}function kc(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let n=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(y=>y.article_type!=="C").length,l=gc(e),u=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",d=e.meta?.snapshot||"",g=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",v=[l,u,g,d].filter(Boolean).join(" \xB7 "),f=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",p=e.version||{},b=[Xe("\u6CD5\u898F\u4F4D\u968E",r(e.law_level||"\u2014")),Xe("\u6CD5\u898F\u985E\u5225",r(e.law_category||"\u2014")),Xe("\u7570\u52D5\u65E5\u671F",ps(e.law_modified_date)),Xe("\u751F\u6548\u65E5\u671F",ps(e.law_effective_date)),Xe("\u689D\u6587\u6578",c(e.article_count)),Xe("\u8CC7\u6599\u72C0\u614B",Rn(e)),Xe("\u82F1\u8B6F\u540D\u7A31",r(e.eng_law_name||"\u2014")),Xe("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${r(e.law_key||"\u2014")}</span>`)];return p.first_seen_version_id!==null&&p.first_seen_version_id!==void 0&&b.push(Xe("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${r(p.first_seen_version_id)}`)),p.last_seen_version_id!==null&&p.last_seen_version_id!==void 0&&b.push(Xe("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${r(p.last_seen_version_id)}`)),p.last_seen_at&&b.push(Xe("\u6700\u5F8C\u6536\u9304\u6642\u9593",r(be(p.last_seen_at)))),p.selected_version_id!==null&&p.selected_version_id!==void 0&&b.push(Xe("\u689D\u6587\u7248\u672C",`#${r(p.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${qs()}
      <span class="law-report-origin" title="${r(v)}">${r(v)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${r(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${r(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${r(i)}
            ${Rn(e)}
            <span class="chip">${r(f)}</span>
          </div>
          <div class="report-sub">
            ${r([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${c(e.article_count)} \u689D \xB7 \u7570\u52D5 ${ps(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${wc(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">${m("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${n.length?`<div class="report-alert">${Pe({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n.map(y=>r(y)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${c(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${ps(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${r(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${Rn(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${r(l)}</span>
        </div>
        <div class="law-meta-grid">${b.join("")}</div>
      </div>

      ${_c(e)}
      ${Cn("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${fc("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${Cn("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${Cn("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${bc(e.attachments)}
      ${hc(e)}
    </div>
    ${o>100?vc():""}
  </div>`}function Sc(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${qs()}
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
  </div>`}function xc(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${qs()}
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
        ${Pe({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function Ac(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${r(t)}"
    data-law-source=""
    data-law-name="${r(t)}"
    title="\u6AA2\u8996\u300C${r(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(t)}${m("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function qc(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let n=String(s.article_no||"").trim();n&&t.get(a).add(n)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${Ac(s)}
          <span class="judgment-citation-articles">${[...a].map(n=>r(n)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function Mc(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",n=String(e.full_text||""),i=Number(e.full_text_length)||n.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[Xe("\u6848\u865F",r(e.jid||"\u2014")),Xe("\u5E74\u5EA6",r(e.jyear||"\u2014")),Xe("\u5B57\u5225",r(e.jcase||"\u2014")),Xe("\u865F\u78BC",r(e.jno||"\u2014")),Xe("\u6CD5\u9662",r(e.court||"\u2014")),Xe("\u6848\u7531",r(e.title||"\u2014")),Xe("\u88C1\u5224\u65E5\u671F",ps(e.jdate)),Xe("\u4F86\u6E90\u58D3\u7E2E\u6A94",r(e.source_archive||"\u2014")),Xe("\u5168\u6587\u9577\u5EA6",`${c(i)} \u5B57`),Xe("\u5F15\u7528\u6578",c(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(Xe("\u532F\u5165 Run",`#${r(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${qs()}
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
            ${r(e.court||"\u2014")} \xB7 ${ps(e.jdate)} \xB7
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
          <div class="summary-value">${ps(e.jdate)}</div>
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
        ${qc(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${c(i)} \u5B57</span>
        </div>
        ${n?`<div class="judgment-fulltext">${r(n)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function yi(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function qa(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(yi).join(",")],n=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([n+o+1,...t.map(l=>i[l.key])].map(yi).join(","))}),`\uFEFF${a.join(`\r
`)}`}function Ma(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,n]of Object.entries(t))a.startsWith("_")||(s[a]=n);return s})}}function Lc(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function wi(e,t){let s=performance.now(),a=ki(e,t),n=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,u=[],d=[],g=[],v=[];if(n==="audit_events"){try{let A=Number(await ns("audit.last_event_id",0))||0,F=await W.versioningAudit({since_id:A,limit:500}),ne=Array.isArray(F?.events)?F.events:[];ne.length&&await Xr(ne.map(Se=>({...Se,dataset:"judgment"})));let Y=Number(F?.latest_event_id||0);Y>A&&await Us("audit.last_event_id",Y)}catch(A){u.push(`\u7248\u672C audit \u540C\u6B65\u5931\u6557\uFF1A${A.message||A}`)}d=(await Zr({keyword:i,limit:fi})).map(A=>({created_at:A.created_at,dataset:A.dataset,issue_month:A.issue_month,change_type:A.change_type,jid:A.jid,detail:A.detail})),g=[{key:"created_at",label:"\u6642\u9593",type:"datetime"},{key:"dataset",label:"\u8CC7\u6599\u96C6",type:"text"},{key:"issue_month",label:"\u6708\u4EFD",type:"mono"},{key:"change_type",label:"\u8B8A\u66F4",type:"status"},{key:"jid",label:"\u6848\u865F",type:"mono"},{key:"detail",label:"\u6458\u8981",type:"longtext"}];let x=new Map;d.forEach(A=>x.set(A.change_type||"unknown",(x.get(A.change_type||"unknown")||0)+1)),v=Array.from(x.entries()).map(([A,F])=>({label:A,value:F})).sort((A,F)=>F.value-A.value)}else if(n==="settings"){d=(await ti({keyword:i})).map(A=>({key:A.key,value:si(A.value),updated_at:A.updated_at})),g=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let x=new Map;d.forEach(A=>{let F=String(A.key||"").split(".")[0]||"\u5176\u4ED6";x.set(F,(x.get(F)||0)+1)}),v=Array.from(x.entries()).map(([A,F])=>({label:A,value:F})).sort((A,F)=>F.value-A.value)}else{d=(await va({keyword:i,limit:fi})).map(A=>({kind:Lc(A.kind),title:A.title,detail:A.detail,created_at:A.created_at})),g=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let x=new Map;d.forEach(A=>x.set(A.kind,(x.get(A.kind)||0)+1)),v=Array.from(x.entries()).map(([A,F])=>({label:A,value:F})).sort((A,F)=>F.value-A.value)}let f=d.length,p=(o-1)*l,b=d.slice(p,p+l),y=Math.round(performance.now()-s),k=Vr();return k&&u.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:k?"degraded":"ok",message:k?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:n,columns:g,rows:b,total:f,page:o,page_size:l,duration_ms:y,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(f)},{label:"\u76EE\u524D\u9801\u9762",value:`${b.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:Hs()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${y} ms`}],distribution:v,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${n}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${p}`,warnings:u,meta:{store:n,filters:a,client_side:!0}}}async function jc(e,t){let s=!1,a=null,n=[],i="law",o=null,l={},u=0,d=25,g="query",v=null,f=null,p=0,b=[],y=null,k=-1,j=0,x=0,A=null,F=null,ne=null;e.innerHTML=`<section class="page data-page">
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
      ${Ut(null,{loading:!0})}
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
  </section>`;let Y=e.querySelector("#query-sidebar"),Se=e.querySelector("#data-nav"),fe=e.querySelector("#db-options-wrap"),U=e.querySelector("#filter-area"),E=e.querySelector("#schema-area"),L=e.querySelector("#query-main"),T=e.querySelector("#schema-suggest-popover"),te=e.querySelector("#catalog-meta"),le=e.querySelector("#refresh-catalog"),Q=e.querySelector("#data-judgment-stats"),me=q=>n.find(N=>N.id===q),ye=()=>me(i)?.databases||[],H=q=>ye().find(N=>N.id===q),ve=(q,N)=>`${q}:${N}`,Z=(q,N=i)=>l[ve(N,q.id)],xe=(q,N)=>{Us(q,N).catch(()=>{})},$e=()=>{if(!a){te.textContent="CATALOG \xB7 \u96E2\u7DDA",te.className="badge badge-danger badge-mono";return}let q=ye(),N=q.filter(z=>z.available).length,C=me(i);te.textContent=`CATALOG \xB7 ${C?.label||i} \xB7 ${N}/${q.length} \u53EF\u7528`,te.className="badge badge-neutral badge-mono"},ee=q=>{L.innerHTML=ac(q)},re=()=>{let q=F?.returnScroll??ne?.returnScroll;F=null,ne=null;let N=H(o),C=N?Z(N):null;g==="schema"&&f?.result?L.innerHTML=En(f.result,Ne(N,f.tableId),{columnFilters:f.columnFilters||{},searchEnabled:N.id==="postgres"||N.id==="parquet"}):C?.result?L.innerHTML=Sa(C.result):N&&ee(N),typeof q=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:q,behavior:"smooth"}))},he=(q="law-article-jump")=>{let N=L.querySelector(`#${q}`),C=qi(N?.value);if(!C){P("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),N?.focus();return}let J=[...L.querySelectorAll("[data-article-no]")].find(se=>se.dataset.articleNo===C);if(!J){P(`\u627E\u4E0D\u5230\u7B2C ${C} \u689D\u3002`,"warn");return}J.scrollIntoView({behavior:"instant",block:"center"}),J.classList.add("is-jump-target"),window.setTimeout(()=>J.classList.remove("is-jump-target"),2400)},ge=async({lawKey:q,sourceType:N="",lawName:C="",versionId:z=""})=>{let J=H(o),se=J?Z(J):null,ue=g==="schema"?f?.result:null;if(!J||!se?.result&&!ue||!q)return;let Me=++u;F={seq:Me,lawKey:q,sourceType:N,lawName:C,versionId:z?String(z):"",page:1,detail:null,database:J.id,returnScroll:window.scrollY},ne=null,L.innerHTML=$c(C||q),L.scrollIntoView({behavior:"smooth",block:"start"});try{let Re=await W.lawDetail(q,N,F.versionId);if(s||!F||F.seq!==Me)return;F.detail=Re,F.page=1,L.innerHTML=kc(Re,{database:F.database,lawPage:F.page})}catch(Re){if(s||!F||F.seq!==Me)return;L.innerHTML=yc(Re,C||q),P(Re.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},Ae=async({jid:q})=>{let N=H(o),C=N?Z(N):null,z=g==="schema"?f?.result:null;if(!N||!C?.result&&!z||!q)return;let J=++u;F=null;let se=N.id==="parquet"?"parquet":"postgres";ne={seq:J,jid:q,detail:null,database:N.id,source:se,returnScroll:window.scrollY},L.innerHTML=Sc(q),L.scrollIntoView({behavior:"smooth",block:"start"});try{let ue=await W.judgmentDetail(q,se);if(s||!ne||ne.seq!==J)return;ne.detail=ue,L.innerHTML=Mc(ue,{database:ne.database})}catch(ue){if(s||!ne||ne.seq!==J)return;L.innerHTML=xc(ue,q),P(ue.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},ke=(q,N)=>`${i}:${q.id}:${N}`,Ne=(q,N)=>(q.tables||[]).find(C=>C.id===N)?.label||N,ze=(q,N,{sort:C=null,columnFilters:z={}}={})=>{let J={column_filters:z};return q.id==="postgres"?(J.table=N,J.schema_preview=!0):q.id==="parquet"&&i==="judgment"?(J.table="judgment_documents",J.columns=Vl):q.id==="parquet"&&(J.dataset="all",J.columns=Wl),C?.key&&(J.sort=`${C.key}:${C.direction}`),J},I=async(q,N,{sort:C=null,columnFilters:z={},quiet:J=!1}={})=>{if(!N)return;ct();let se=ke(q,N),ue=++p,Me=!!(J&&f?.result&&f.key===se);v={tableId:N},f={key:se,tableId:N,loading:!0,result:null,error:null,sort:C,columnFilters:z},Me?L.setAttribute("aria-busy","true"):(E.innerHTML=Nn(q,me(i)?.label||i,N),L.innerHTML=vi(Ne(q,N)));try{let Re;if(q.id==="indexeddb"){let _e=_a(q,10);_e.values.store=N,_e.page=1,Re=await wi(q,_e)}else q.id==="qdrant"?Re={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:N,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(Re=await W.query({database:q.id,filters:ze(q,N,{sort:C,columnFilters:z}),page:1,pageSize:10}),C?.key&&(Re.meta={...Re.meta||{},sort:C}));if(s||ue!==p)return;f={key:se,tableId:N,loading:!1,result:Re,error:null,sort:C,columnFilters:z},L.removeAttribute("aria-busy"),g==="schema"&&v?.tableId===N&&(E.innerHTML=Nn(q,me(i)?.label||i,N),L.innerHTML=En(Re,Ne(q,N),{columnFilters:z,searchEnabled:q.id==="postgres"||q.id==="parquet"}))}catch(Re){if(s||ue!==p)return;f={key:se,tableId:N,loading:!1,result:null,error:Re,sort:C,columnFilters:z},L.removeAttribute("aria-busy"),g==="schema"&&v?.tableId===N&&(L.innerHTML=$i(Re,Ne(q,N)))}},G=()=>{let q=H(o);if(!q)return null;if(g==="schema"&&f?.result)return{db:q,tableId:f.tableId,columnFilters:f.columnFilters||{},sort:f.sort||null,mode:"schema"};let N=q?Z(q):null,C=N?.result;return C&&(q.id==="postgres"||q.id==="parquet")?{db:q,tableId:C.table,columnFilters:N.columnFilters||{},sort:N.sort||null,mode:"query"}:null},w=(q,N,C)=>{if(!q)return;let z=`${q.db.id}:${q.tableId}:${N}`,J=R.get(z);J&&(window.clearTimeout(J),R.delete(z)),ct();let se={...q.columnFilters||{}},ue=String(C||"").trim();if(ue?se[N]=ue:delete se[N],q.mode==="schema"){I(q.db,q.tableId,{sort:q.sort,columnFilters:se,quiet:!0});return}let Me=Z(q.db);Me.columnFilters=se,Me.page=1,We(1)},R=new Map,V=()=>{(!T||T.hidden)&&!b.length&&!y||(j+=1,b=[],y=null,k=-1,T&&(T.hidden=!0,T.innerHTML=""))},B=(q,N)=>{let C=String(q||""),z=C.toLocaleLowerCase(),J=String(N||"").toLocaleLowerCase(),se=new Array(C.length).fill(!1),ue=(Fe,Ze)=>{for(let et=Fe;et<Fe+Ze;et+=1)et>=0&&et<se.length&&(se[et]=!0)},Me=z.indexOf(J);if(Me>=0)for(;Me>=0;)ue(Me,J.length),Me=z.indexOf(J,Me+J.length);else{let Fe=[];for(let Ze of J.match(/[一-鿿]{2,}/g)||[])for(let et=0;et<Ze.length-1;et+=1)Fe.push(Ze.slice(et,et+2));Fe.push(...J.match(/[a-z0-9]+/g)||[]);for(let Ze of Fe){let et=z.indexOf(Ze);for(;et>=0;)ue(et,Ze.length),et=z.indexOf(Ze,et+Ze.length)}}let Re="",_e=0;for(;_e<C.length;)if(se[_e]){let Fe=_e;for(;Fe<C.length&&se[Fe];)Fe+=1;Re+=`<mark>${r(C.slice(_e,Fe))}</mark>`,_e=Fe}else{let Fe=_e;for(;Fe<C.length&&!se[Fe];)Fe+=1;Re+=r(C.slice(_e,Fe)),_e=Fe}return Re||r(C)},Ee=(q,N)=>{if(!T)return;let C=q.getBoundingClientRect(),z=Math.min(420,Math.max(220,C.width)),J=Math.min(360,34+N*30),se=C.bottom+4;se+J>window.innerHeight-8&&(se=Math.max(8,C.top-J-4));let ue=Math.min(window.innerWidth-z-8,Math.max(8,C.left));T.style.width=`${z}px`,T.style.left=`${ue}px`,T.style.top=`${se}px`},Ce=q=>{if(!T)return;let N=[...T.querySelectorAll(".schema-suggest-item")];N.length&&(k=Math.max(0,Math.min(N.length-1,q)),N.forEach((C,z)=>{C.classList.toggle("is-active",z===k)}),N[k].scrollIntoView({block:"nearest"}))},Be=q=>{let N=b[q],C=y;!N||!C||(V(),w(C,C.column,N))},Ie=async(q,N,C,z)=>{if(!q||!C.trim()){V();return}let J=++j;y={...q,column:N,input:z},k=-1;try{let se=await W.schemaSuggest({database:q.db.id,table:q.tableId,column:N,query:C,limit:1e3});if(J!==j||document.activeElement!==z||!T)return;let ue=Array.isArray(se.values)?se.values:[];if(b=ue,!ue.length){V();return}let Me=Number(se.total)>ue.length?`\u5171 ${c(se.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${c(ue.length)} \u500B`:`\u5171 ${c(se.total)} \u500B\u7B26\u5408`;T.innerHTML=`<div class="schema-suggest-head">${r(Me)}</div>${ue.map((Re,_e)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${_e}"
            title="${r(Re)}">${B(Re,C)}</button>`).join("")}`,Ee(z,ue.length),T.hidden=!1}catch{V()}},ct=()=>{let q=document.activeElement;q instanceof HTMLElement&&q.matches("[data-schema-search]")&&q.blur(),V()},Ve=(q,{resetReport:N=!1}={})=>{ct();let C=Z(q);if(Se.innerHTML=hi(i,g),fe.innerHTML=ec(ye(),q.id),g==="schema")U.hidden=!0,U.innerHTML="",E.hidden=!1,E.innerHTML=`<div class="schema-category-switch" role="tablist" aria-label="Schema \u985E\u5225">
        ${["law","judgment"].map(z=>{let J=n.find(se=>se.id===z);return J?`<button class="chip${i===z?" is-active":""}" type="button" role="tab" aria-selected="${i===z}" data-action="schema-category" data-category="${z}">${r(J.label)}</button>`:""}).join("")}
      </div>${Nn(q,me(i)?.label||i,v?.tableId||"")}`;else{E.hidden=!0,E.innerHTML="",U.hidden=!1;let z=tc(i,q,C),J=bi(q,C);U.innerHTML=`${Zl(q)}${z?`${z}<details class="data-advanced"><summary>\u9032\u968E metadata \u689D\u4EF6</summary>${J}</details>`:J}<div class="sidebar-note">${sc(q)}</div>`}if($e(),g==="schema"){let z=v?ke(q,v.tableId):"";if(f&&f.key===z){let J=Ne(q,f.tableId);f.loading?L.innerHTML=vi(J):f.error?L.innerHTML=$i(f.error,J):L.innerHTML=En(f.result,J,{columnFilters:f.columnFilters||{},searchEnabled:q.id==="postgres"||q.id==="parquet"})}else L.innerHTML=mc(q);return}N?ee(q):C.result?L.innerHTML=Sa(C.result):ee(q)},at=(q,{persist:N=!0,resetReport:C=!1}={})=>{let z=ye(),J=z.find(ue=>ue.id===q)||z[0];if(!J)return;F=null,ne=null,v=null,f=null,p+=1,o=J.id;let se=ve(i,J.id);l[se]||(l[se]=_a(J,d)),Ve(J,{resetReport:C}),N&&(xe(`data.last_database.${i}`,J.id),xe("data.last_category",i))},jt=(q,{persist:N=!0,resetReport:C=!0,databaseId:z=null}={})=>{let J=me(q)||n[0];if(!J)return;i=J.id,F=null,ne=null;let se=J.databases||[],ue=z&&se.find(Me=>Me.id===z)||se.find(Me=>Me.id===o)||se[0];if(o=ue?.id||null,!ue){Se.innerHTML=hi(i,g),fe.innerHTML=`<div class="sidebar-notice">${Pe({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,U.innerHTML="",$e();return}at(ue.id,{persist:!1,resetReport:C}),N&&(xe("data.last_category",J.id),xe(`data.last_database.${J.id}`,ue.id))},nt=q=>{let N=Z(q),C=U.querySelector("#data-filter-form");C&&(N.values=ka(C,q,N))},We=async(q=null,{quiet:N=!1}={})=>{let C=H(o);if(!C)return;ct();let z=Z(C);nt(C),q!==null&&(z.page=q),(!Number.isFinite(z.page)||z.page<1)&&(z.page=1);let J=++u;F=null,ne=null;let se=L.querySelector(".report-card"),ue=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!se?L.setAttribute("aria-busy","true"):(L.removeAttribute("aria-busy"),L.innerHTML=Js(C));let Re=U.querySelector("#run-query");N||je(Re,!0,"\u67E5\u8A62\u4E2D\u2026");try{let _e;if(C.id==="indexeddb"?_e=await wi(C,z):_e=await W.query({database:C.id,filters:Tn(C,z),page:z.page,pageSize:z.pageSize}),s||J!==u)return;if(_e.meta={..._e.meta||{},column_filters:z.columnFilters||{},searchable:C.id==="postgres"||C.id==="parquet",sort:z.sort||_e.meta?.sort||null},z.result=_e,z.page=Number(_e.page)||z.page,z.pageSize=Number(_e.page_size)||z.pageSize,L.removeAttribute("aria-busy"),L.innerHTML=Sa(_e),ue!==null){let Ze=L.querySelector("[data-page-size]");Ze&&(Ze.value=String(z.pageSize),Ze.focus({preventScroll:!0}))}let Fe=me(i)?.label||i;await zs({kind:"data",title:`${Fe} \xB7 ${C.label} \xB7 ${_e.table||_e.label||"query"}`,detail:`${c(_e.total)} \u7B46 \xB7 ${de(_e.duration_ms)}`,payload:{category:i,database:C.id,filters:Tn(C,z),page:z.page,page_size:z.pageSize}}),xe("data.last_query",{category:i,database:C.id,filters:Tn(C,z),page:z.page,page_size:z.pageSize,at:new Date().toISOString()})}catch(_e){if(s||J!==u)return;L.removeAttribute("aria-busy"),L.innerHTML=Aa(_e,C),P(_e.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&J===u&&je(Re,!1)}},ft=(q,N)=>{let C=q?.querySelector("[data-data-fuzzy-results]");C&&(C.innerHTML=N.length?N.map(z=>`<button class="data-fuzzy-option" type="button" role="option" data-action="select-fuzzy-term" data-term="${r(z.value)}"><span>${r(z.label||z.value)}</span><small>${r(z.meta||"")}</small></button>`).join(""):'<div class="data-fuzzy-empty">\u6C92\u6709\u76F8\u8FD1\u7D50\u679C\uFF1B\u6309 Enter \u53EF\u76F4\u63A5\u52A0\u5165\u76EE\u524D\u8F38\u5165\u7684\u95DC\u9375\u5B57\u3002</div>')},St=async(q,N="")=>{if(!q)return;let C=H(o),z=C?Z(C):null;if(!z)return;let J=q.dataset.fuzzyKind||i,se=q.querySelector("[data-data-fuzzy-results]"),ue=++x;se&&(se.innerHTML='<div class="data-fuzzy-loading"><span class="spinner"></span><span>\u641C\u5C0B\u76F8\u8FD1\u7D50\u679C\u2026</span></div>');try{let Me=await W.dataSuggest({kind:J,query:N,limit:12});if(ue!==x)return;let Re=(Me.suggestions||[]).filter(_e=>!z.fuzzyTerms.includes(_e.value));ft(q,Re)}catch(Me){if(ue!==x)return;se&&(se.innerHTML=`<div class="data-fuzzy-empty">${r(Me.message||"\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},ae=(q,{focus:N=!1}={})=>{if(!q)return;let C=q.querySelector("[data-data-fuzzy-popover]"),z=q.querySelector("[data-data-fuzzy-search]");!C||!z||(C.hidden&&(C.hidden=!1,z.value="",St(q,"")),N&&(z.focus(),z.select()))},we=q=>{A&&(window.clearTimeout(A),A=null);let N=q?.querySelector("[data-data-fuzzy-popover]");N&&(N.hidden=!0)},Qe=async q=>{let N=H(o);if(!N)return;let C=Z(N),z=String(q||"").trim();!z||C.fuzzyTerms.includes(z)||(C.fuzzyTerms=[...C.fuzzyTerms,z],we(U.querySelector("[data-data-fuzzy]")),Ve(N),await We(1))},Ke=async q=>{let N=H(o);if(!N)return;let C=Z(N),z=String(q||"").trim();C.fuzzyTerms=C.fuzzyTerms.filter(J=>J!==z),Ve(N),await We(1)},xt=async()=>{le.disabled=!0,je(le,!0,"\u6574\u7406\u4E2D\u2026");try{let[q,N,C,z,J]=await Promise.all([W.catalog(),ns("data.last_category","law"),ns("data.last_database.law","postgres"),ns("data.last_database.judgment","postgres"),ns("data.page_size",25)]);if(s)return;a=q,Q&&(Q.innerHTML=Ut(a.judgment_stats)),n=Array.isArray(a.categories)?a.categories:[],d=_i.includes(Number(J))?Number(J):25;for(let _e of n)for(let Fe of _e.databases||[]){let Ze=ve(_e.id,Fe.id);l[Ze]||(l[Ze]=_a(Fe,d))}let se=n.find(_e=>_e.id===N)||n[0];if(!se){Se.innerHTML="",fe.innerHTML=`<div class="sidebar-notice">${Pe({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let ue=se.id==="judgment"?z:C;if(i=se.id,o=null,jt(se.id,{persist:!1,resetReport:!0,databaseId:ue}),s)return;let Me=H(o),Re=Me?Z(Me):null;Me&&Re&&g==="query"&&!Re.result&&(Me.id==="postgres"||Me.id==="parquet")&&We(1),P("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(q){if(s)return;a=null,n=[],Se.innerHTML="",Q&&(Q.innerHTML=Ut(null)),$e(),fe.innerHTML=`<div class="sidebar-notice">${Pe({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:r(q.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${m("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,L.innerHTML=`<div class="report-empty">${ut({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(le.disabled=!1,je(le,!1))}};Y.addEventListener("change",q=>{let N=q.target;if(N.name==="category"){jt(N.value);return}if(N.name==="database"){at(N.value);let se=H(o),ue=se?Z(se):null;se&&ue&&!ue.result&&g==="query"&&(se.id==="postgres"||se.id==="parquet")&&We(1);return}let C=H(o);if(!C)return;let z=Z(C),J=U.querySelector("#data-filter-form");!J||!N.name||(z.values=ka(J,C,z),z.page=1,N.name==="table"&&(F=null,ne=null,z.sort=null,z.columnFilters={},z.result=null,U.innerHTML=bi(C,z),ee(C)))}),Y.addEventListener("input",q=>{let N=q.target.closest("[data-data-fuzzy-search]");if(N){let se=N.closest("[data-data-fuzzy]");A&&window.clearTimeout(A),A=window.setTimeout(()=>{St(se,N.value)},160);return}let C=H(o);if(!C)return;let z=U.querySelector("#data-filter-form");if(!z||!q.target.name||q.target.name==="table")return;let J=Z(C);J.values=ka(z,C,J)}),Y.addEventListener("keydown",q=>{let N=q.target.closest("[data-data-fuzzy-search]");if(!N)return;let C=N.closest("[data-data-fuzzy]");if(q.key==="Escape")q.preventDefault(),we(C),N.blur();else if(q.key==="Enter"){q.preventDefault();let z=C?.querySelector("[data-action='select-fuzzy-term']");z?z.click():Qe(N.value)}else q.key==="ArrowDown"&&(q.preventDefault(),C?.querySelector("[data-action='select-fuzzy-term']")?.focus())}),Y.addEventListener("mouseover",q=>{let N=q.target.closest("[data-action='open-fuzzy']");N&&ae(N.closest("[data-data-fuzzy]"))}),Y.addEventListener("mouseout",q=>{let N=q.target.closest("[data-data-fuzzy]");N&&(q.relatedTarget&&N.contains(q.relatedTarget)||we(N))}),Y.addEventListener("submit",q=>{q.target.id==="data-filter-form"&&(q.preventDefault(),We(1))}),Y.addEventListener("click",async q=>{let N=U.querySelector("[data-data-fuzzy] [data-data-fuzzy-popover]:not([hidden])")?.closest("[data-data-fuzzy]");N&&!q.target.closest("[data-data-fuzzy]")&&we(N);let C=q.target.closest("[data-action]"),z=C?.dataset.action;if(z==="data-nav"){let J=C.dataset.tab,se=H(o);if(J==="schema"){if(g!=="schema"){if(se){let _e=Z(se),Fe=U.querySelector("#data-filter-form");Fe&&(_e.values=ka(Fe,se,_e))}g="schema",se&&Ve(se)}return}let ue=J==="judgment"?"judgment":"law";g==="schema"&&(g="query"),i!==ue?jt(ue,{databaseId:o,resetReport:!1}):se&&Ve(se);let Me=H(o),Re=Me?Z(Me):null;Me&&Re&&!Re.result&&(Me.id==="postgres"||Me.id==="parquet")&&We(1);return}if(z==="open-fuzzy"){ae(C.closest("[data-data-fuzzy]"),{focus:!0});return}if(z==="select-fuzzy-term"){await Qe(C.dataset.term);return}if(z==="remove-fuzzy-term"){await Ke(C.dataset.term);return}if(z==="schema-category"){g="schema",jt(C.dataset.category||"law",{resetReport:!0});return}if(z==="select-schema-table"){let J=H(o);if(!J)return;I(J,C.dataset.tableId||"");return}if(z==="reset"){let J=H(o);if(!J)return;F=null,ne=null;let se=Z(J);l[ve(i,J.id)]=_a(J,se.pageSize),Ve(J),ee(J),P("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}q.target.closest("#catalog-retry")&&xt()}),L.addEventListener("input",q=>{let N=q.target.closest("[data-schema-search]");if(!N)return;let C=G();if(!C)return;let z=N.dataset.schemaSearch||"",J=N.value,se=`${C.mode}:${C.db.id}:${C.tableId}:${z}`,ue=R.get(se);if(ue&&window.clearTimeout(ue),!J.trim()){R.delete(se),V(),w(C,z,"");return}let Me=window.setTimeout(()=>{R.delete(se),Ie(C,z,J,N)},250);R.set(se,Me)}),L.addEventListener("keydown",q=>{let N=q.target.closest("[data-schema-search]");if(!N)return;let C=G();if(C){if(q.key==="Escape"){V();return}if(q.key==="ArrowDown"||q.key==="ArrowUp"){if(!T||T.hidden)return;q.preventDefault();let z=q.key==="ArrowDown"?1:-1;Ce(k<0?z>0?0:b.length-1:k+z);return}if(q.key==="Enter"){if(q.preventDefault(),T&&!T.hidden&&k>=0){Be(k);return}w(C,N.dataset.schemaSearch||"",N.value)}}}),T?.addEventListener("mousedown",q=>{q.preventDefault()}),T?.addEventListener("click",q=>{let N=q.target.closest("[data-schema-suggest-index]");N&&Be(Number(N.dataset.schemaSuggestIndex))});let It=q=>{q.target.closest("[data-schema-search]")||T?.contains(q.target)||V()};return document.addEventListener("click",It),window.addEventListener("scroll",V,{capture:!0,passive:!0}),window.addEventListener("resize",V),L.addEventListener("keydown",q=>{q.target.matches(".law-jump-input")&&q.key==="Enter"&&(q.preventDefault(),he(q.target.id))}),L.addEventListener("click",async q=>{let N=q.target.closest("[data-action]");if(!N)return;let C=N.dataset.action,z=H(o),J=z?Z(z):null,se=J?.result;if(C==="back-to-results"){re();return}if(C==="open-law"){ge({lawKey:N.dataset.lawKey||"",sourceType:N.dataset.lawSource||"",lawName:N.dataset.lawName||""});return}if(C==="open-judgment"){Ae({jid:N.dataset.jid||""});return}if(C==="jump-article"){he(N.dataset.jumpInput||"law-article-jump");return}if(C==="sort-column"){let ue=N.dataset.sortKey||"";if(!ue||!z)return;if(g==="schema"&&f?.result){let _e=f.sort,Fe=ue==="jdate"||ue==="law_modified_date"||ue==="article_count"||ue==="citation_count"||ue==="full_text_length"||ue==="created_at"||ue==="updated_at",Ze=_e?.key===ue?_e.direction==="asc"?"desc":"asc":Fe?"desc":"asc";I(z,f.tableId,{sort:{key:ue,direction:Ze},columnFilters:f.columnFilters||{},quiet:!0});return}if(!J)return;let Me=J.sort,Re=Me?.key===ue?Me.direction==="asc"?"desc":"asc":ue==="jdate"?"desc":"asc";J.sort={key:ue,direction:Re},We(1,{quiet:!0});return}if(C==="retry"){We(J?.page||1);return}if(se){if(C==="prev-page"){We(Math.max(1,Number(se.page)-1),{quiet:!0});return}if(C==="next-page"){let ue=Math.max(1,Math.ceil(Number(se.total)/Number(se.page_size)));We(Math.min(ue,Number(se.page)+1),{quiet:!0});return}if(C==="copy-query"){let ue=await ys(se.query_text||"");P(ue?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",ue?"ok":"warn");return}if(C==="export-json"){let ue=`${se.database}-${se.table||"query"}-page-${se.page}.json`;Rt(ue,JSON.stringify(Ma(se),null,2),"application/json;charset=utf-8"),P(`\u5DF2\u532F\u51FA ${ue}`,"ok");return}if(C==="export-csv"){let ue=`${se.database}-${se.table||"query"}-page-${se.page}.csv`;Rt(ue,qa(se),"text/csv;charset=utf-8"),P(`\u5DF2\u532F\u51FA ${ue}`,"ok")}}}),L.addEventListener("change",q=>{let N=q.target.closest("[data-action='select-law-version']");if(N&&F){ge({lawKey:F.lawKey,sourceType:F.sourceType,lawName:F.lawName,versionId:N.value});return}if(!q.target.matches("[data-page-size]"))return;let C=H(o);if(!C)return;let z=Z(C);z.pageSize=Number(q.target.value)||25,z.page=1,xe("data.page_size",z.pageSize),We(1,{quiet:!0})}),le.addEventListener("click",()=>{xt()}),await xt(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0,A&&window.clearTimeout(A);for(let q of R.values())window.clearTimeout(q);R.clear(),V(),document.removeEventListener("click",It),window.removeEventListener("scroll",V,{capture:!0}),window.removeEventListener("resize",V)}}var Ri=[10,25,50,100],Tc=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function Dn(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function Nc(e,t=e){return`<option value="${r(e)}">${r(t)}</option>`}function Ws(e,t,s,a,n=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${r(t)}</span>
      <span class="field-tag">${r(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${r(e)}">
      ${Nc("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${r(i)}" ${String(i)===String(a)?"selected":""}>${r(i)}</option>`).join("")}
    </select>
    ${n?`<span class="field-help">${r(n)}</span>`:""}
  </div>`}function Ec(e,t){let s=Tc.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${Ws("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${Ws("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${Ws("model","\u6A21\u578B",e.models||[],t.model)}
    ${Ws("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${Ws("method","\u65B9\u6CD5",e.methods||[],t.method)}
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
    </div>`}function Mi(){let e=document.getElementById("performance-filter-form");if(!e)return Dn();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Li(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function ji(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),n=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${n}.${i}`}function Rc(e,t){if(!e)return"";let s=new Date(e);return Number.isNaN(s.getTime())?"":new Date(s.getTime()+Math.max(0,Number(t)||0)).toISOString()}var Cc=[{key:"parsing",label:"Parsing",hint:"\u8F38\u5165\u9577\u5EA6\u3001\u89E3\u6790\u6642\u9593",names:["rag.parse_question"],color:"#64748b"},{key:"embedding",label:"Embedding",hint:"Model\u3001Token\u3001Batch\u3001\u8017\u6642",names:["rag.embed_query"],color:"#3984c6"},{key:"qdrant",label:"Qdrant Search",hint:"Collection\u3001Filter\u3001Top K\u3001\u8017\u6642",names:["rag.qdrant_search"],color:"#d97706"},{key:"reranker",label:"Reranker",hint:"Model\u3001\u5019\u9078\u7B46\u6578\u3001\u8017\u6642",names:["rag.rerank"],color:"#8b5cf6"},{key:"context",label:"Context",hint:"Chunk \u6578\u3001Token \u6578\u3001\u8017\u6642",names:["rag.context"],fallbackNames:["rag.fetch_documents","rag.build_citations"],color:"#64748b"},{key:"llm",label:"LLM",hint:"Model\u3001Input/Output Token\u3001TTFT\u3001\u8017\u6642",names:["rag.llm_request"],color:"#16a34a"}],ja={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"};function Ci(e){let t=e?.metadata?.rag_response||{},s=String(t.status||e?.metadata?.rag_status||e?.status||"");return s==="operational"||s==="success"?{label:"Completed",tone:"ok"}:s==="retrieval_only"?{label:"Abstain",tone:"warn"}:s==="preview"?{label:"Preview",tone:"info"}:s==="failed"||s==="error"?{label:"Failed",tone:"danger"}:{label:s||"Unknown",tone:"idle"}}function On(e){let t=Math.max(0,Number(e?.offset_ms)||0),s=Math.max(0,Number(e?.duration_ms)||0),a=Math.max(t,Number(e?.end_offset_ms)||t+s);return{...e,offset:t,end:a,duration:Math.max(s,a-t)}}function Pi(e,t=0){let s=Array.isArray(e?.segments)?[...e.segments].sort((g,v)=>Number(g.offset_ms||0)-Number(v.offset_ms||0)):[],a=Math.max(Number(e?.total_ms)||0,Number(t)||0,...s.map(g=>On(g).end),1),n=Cc.map(g=>{let v=s.filter(y=>g.names.includes(y.name));!v.length&&g.fallbackNames&&(v=s.filter(y=>g.fallbackNames.includes(y.name)));let f=v.map(On),p=f.length?Math.min(...f.map(y=>y.offset)):null,b=f.length?Math.max(...f.map(y=>y.end)):null;return{...g,spans:f,start:p,end:b,duration:p===null?null:b-p}});for(let g of n){if(g.key!=="embedding"&&g.key!=="llm")continue;let v=[];for(let b of g.spans){let y=b.metadata||{},k=Number(y.load_duration_ms),j=Number.isFinite(k)&&k>0?k:0,x=Math.max(0,Number(b.duration)||0);v.push({...b,offset:b.offset,end:b.offset+j,duration:j,metadata:{...y,source_stage:g.label,model_load_ms:j,request_duration_ms:x,warm_duration_ms:Math.max(0,x-j),cold_start:j>=100},params:{...b.params||{},source_stage:g.label}})}if(!v.length)continue;let f=v.reduce((b,y)=>b+y.duration,0),p=g.spans.reduce((b,y)=>b+Math.max(0,Number(y.duration)||0),0);g.loadInfo={spans:v,total:f,requestTotal:p,ratio:p>0?Math.min(1,Math.max(0,f/p)):0}}let i=[...n],o=Math.max(0,...i.flatMap(g=>g.spans.map(v=>v.end))),l=e?.metadata?.rag_response||{},u=Ci(e),d=Math.min(a,o);return i.push({key:"response",label:"Response",hint:"\u7E3D\u8017\u6642\u3001\u5F15\u7528\u6578\u3001\u6210\u529F\u6216 Abstain",color:"#0f766e",spans:[{offset:d,end:a,duration:Math.max(0,a-d),status:u.tone==="danger"?"error":"ok",metadata:l,params:{},started_at:e?.started_at,finished_at:e?.finished_at}],start:d,end:a,duration:Math.max(0,a-d),responseMetadata:l}),Pc(i,a),{total:a,stages:i,response:l,traceStatus:u,requestId:e?.request_id||"",startedAt:e?.started_at,finishedAt:e?.finished_at,client:e?.client||{},models:Array.isArray(e?.summary?.models)?e.summary.models:[],hasLoad:i.some(g=>!!g.loadInfo)}}function Pc(e,t){let s=e.reduce((i,o)=>i+Math.max(0,Number(o.duration)||0),0),a=s>0?t/s:1,n=0;for(let i of e){let o=Math.max(0,Number(i.duration)||0)*a;i.displayStart=n,i.displayDuration=o,i.displayEnd=n+o;let l=i.spans[0]||null,u=[],d=!1;if(l){let v=Math.max(0,Number(l.duration)||0),f=i.loadInfo?Math.max(0,Number(i.loadInfo.total)||0):0;if(i.loadInfo&&f>0&&i.spans.length===1&&v>0){let p=Math.min(l.end,l.offset+f),b=Math.max(0,p-l.offset),y=Math.max(0,l.end-p);if(b>0&&y>0){let k=Rc(l.started_at,b),j={...l,offset:l.offset,end:p,duration:b,finished_at:k,metadata:{...l.metadata||{},source_stage:i.label,model_load_ms:b,request_duration_ms:v,warm_duration_ms:Math.max(0,v-b),cold_start:b>=100},params:{...l.params||{},source_stage:i.label}},x={...l,offset:p,end:l.end,duration:y,started_at:k,finished_at:l.finished_at};u.push({kind:"load",label:"Model Load",span:j,duration:b}),u.push({kind:"stage",label:`${i.label} \u63A8\u8AD6`,span:x,duration:y}),d=!0}}d||u.push({kind:"stage",label:i.label,span:l,duration:v})}i.detailSegments=u;let g=[];if(l&&o>0)if(d){let[v,f]=u,p=v.duration+f.duration,b=p>0?o*(v.duration/p):0,y={...i,key:"model_load",label:`Model Load \xB7 ${i.label}`,spans:[v.span],duration:v.duration},k={...i,label:`${i.label} \u63A8\u8AD6`,spans:[f.span],duration:f.duration};g.push({offset:n,duration:b,color:"#0ea5e9",kind:"load",tip:La(y,v.span)}),g.push({offset:n+b,duration:Math.max(0,o-b),color:i.color,kind:"stage",tip:La(k,f.span,{includeLoad:!1})})}else g.push({offset:n,duration:o,color:i.color,kind:"stage",tip:La(i,l)});i.displaySegments=g,n+=o}}function Bn(e,{includeLoad:t=!0}={}){let s=[],a=(g,v)=>{v==null||v===""||s.push([g,String(v)])},n=e.spans[0]||null;if(!n)return a("\u72C0\u614B","\u6B64\u7D00\u9304\u6C92\u6709\u9019\u500B span"),s;let i=n.params||{},o=n.metadata||{},l=Ii(n),u=Fn(n),d=(g,v)=>{let f=Number(g?.load_duration_ms);if(!Number.isFinite(f))return;let p=Math.max(0,f);a("Model Load",de(p)),a("\u51B7\u555F\u52D5",p>=100?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09");let b=Math.max(0,Number(v)||0);if(b>0){let y=Math.max(0,b-p);a("\u6263\u9664\u8F09\u5165\u5F8C",de(y)),a("\u8F09\u5165\u5360\u6BD4",`${(p/b*100).toFixed(p/b>=.1?0:1)}%`)}};if(e.key==="response")return a("Trace \u72C0\u614B",e.responseMetadata.status||"\u2014"),a("Answer source",e.responseMetadata.answer_source||"\u2014"),a("Abstain",e.responseMetadata.abstain?"\u662F":"\u5426"),a("\u5F15\u7528\u7E3D\u6578",e.responseMetadata.citation_count??"\u2014"),a("\u5224\u6C7A\uFF0F\u6CD5\u898F\u5F15\u7528",`${e.responseMetadata.judgment_citations??"\u2014"} / ${e.responseMetadata.law_citations??"\u2014"}`),a("\u7E3D\u8017\u6642",de(e.duration)),s;if(a("\u958B\u59CB",`${ji(n.started_at)||"\u2014"} \xB7 +${n.offset.toFixed(1)} ms`),a("\u7D50\u675F",`${ji(n.finished_at)||"\u2014"} \xB7 +${n.end.toFixed(1)} ms`),a("\u8017\u6642",de(n.duration)),e.key==="parsing")a("\u8F38\u5165\u9577\u5EA6",o.input_length??i.input_length),a("\u6B63\u898F\u5316\u9577\u5EA6",o.normalized_length??i.normalized_length),a("\u79FB\u9664\u7A7A\u767D",o.trimmed_chars);else if(e.key==="embedding")a("Model",u||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.active_base_url||o.base_url),a("Input tokens",o.prompt_eval_count),a("Batch",o.batch),a("\u5411\u91CF\u7DAD\u5EA6",o.dimensions),a("Fallback",o.fallback_used?"\u662F":"\u5426"),t&&d(o,n.duration);else if(e.key==="qdrant")a("Collection",o.collection||i.collection),o.filter&&a("Filter",Li(o.filter)),a("Top K",o.top_k??i.limit),a("Hits",o.hits),a("Unique judgments",o.unique_judgments),a("Top score",o.top_score);else if(e.key==="reranker")a("Model",u||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Rerank \u72C0\u614B",o.status),a("Fallback",o.fallback_used?"\u662F":"\u5426"),a("\u5019\u9078\u7B46\u6578",o.candidates),a("\u9078\u7528\u7B46\u6578",o.selected),a("Top score",o.top_score),Array.isArray(o.errors)&&o.errors.length&&a("\u932F\u8AA4",o.errors.join(" \xB7 "));else if(e.key==="context")a("Chunks",o.chunks),a("\u5224\u6C7A chunks",o.judgment_chunks),a("\u6CD5\u898F chunks",o.law_chunks),a("Token \u4F30\u7B97",o.token_estimate),a("Context \u5B57\u5143",o.context_chars),a("\u6587\u4EF6\u6578",o.documents);else if(e.key==="llm")a("Model",u||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Input tokens",o.input_tokens),a("Output tokens",o.output_tokens),a("TTFT",o.ttft_ms===null||o.ttft_ms===void 0?"\u2014":de(o.ttft_ms)),a("API \u7E3D\u8017\u6642",o.total_duration_ms===null||o.total_duration_ms===void 0?"\u2014":de(o.total_duration_ms)),t&&d(o,n.duration),a("Strict retry",o.strict?"\u662F":"\u5426");else if(e.key==="model_load"){if(a("Model",u||o.model||i.model),a("\u4E3B\u6A5F",l),a("\u4F86\u6E90\u968E\u6BB5",o.source_stage),a("\u51B7\u555F\u52D5",o.cold_start?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09"),a("\u6A21\u578B\u547C\u53EB\u7E3D\u8017\u6642",o.request_duration_ms===null||o.request_duration_ms===void 0?"\u2014":de(o.request_duration_ms)),a("\u8F09\u5165\u8017\u6642",o.model_load_ms===null||o.model_load_ms===void 0?"\u2014":de(o.model_load_ms)),a("\u6263\u9664\u8F09\u5165\u5F8C\u6D41\u7A0B\u6642\u9593",o.warm_duration_ms===null||o.warm_duration_ms===void 0?"\u2014":de(o.warm_duration_ms)),Number(o.request_duration_ms)>0&&Number(o.model_load_ms)>=0){let g=Number(o.model_load_ms)/Number(o.request_duration_ms)*100;a("\u8F09\u5165\u5360\u6BD4",`${g.toFixed(g>=10?0:1)}%`)}o.eval_duration_ms!==null&&o.eval_duration_ms!==void 0&&a("\u63A8\u8AD6\u8017\u6642",de(o.eval_duration_ms))}else if(e.key==="segment"||e.key==="test_stage")if(a("Model",u||o.model||i.model),a("\u72C0\u614B",o.status||n.status),e.key==="test_stage")a("\u9032\u5EA6",o.progress===null||o.progress===void 0?"":`${Number(o.progress)||0}%`),n.error&&a("\u932F\u8AA4",n.error);else{n.error&&a("\u932F\u8AA4",n.error);for(let[g,v]of Object.entries(i).slice(0,10))a(g,Li(v))}return e.spans.length>1&&(e.key==="model_load"?a("\u5404\u6A21\u578B\u8F09\u5165",e.spans.map(g=>`${g.metadata?.source_stage||"model"} ${Fn(g)} ${de(g.metadata?.model_load_ms||0)}`).join(" \xB7 ")):(a("Span \u6578",e.spans.length),a("Span \u660E\u7D30",e.spans.map((g,v)=>`#${v+1} +${g.offset.toFixed(0)}ms/${de(g.duration)}`).join(" \xB7 ")))),n.module&&a("Module",n.module),n.function&&a("Function",n.function),s}function Ic(e){let t=String(e||"").trim();if(!t)return"";try{return new URL(t.includes("://")?t:`http://${t}`).hostname||t}catch{return t}}function Ii(e){let t=e?.metadata||{},s=String(t.provider_name||"").trim();if(s)return s;let a=String(t.active_base_url||t.base_url||e?.params?.url||"").trim();return Ic(a)}function Dc(e){let t=e?.metadata||{};return String(t.model||e?.params?.model||"").trim()}function Fn(e){let t=Ii(e),s=Dc(e);return s?t?`${t}:${s}`:s:""}function Oc(e){let t=new Set;for(let s of e?.spans||[]){let a=Fn(s);a&&t.add(a)}return[...t]}function La(e,t,s={}){let a=Bn({...e,spans:[t]},s);return[String(e.label||""),...a.map(([n,i])=>`${n}: ${i}`)].join(`
`)}function Bc(e,t){let s=e.spans||[],a=Oc(e),n=Array.isArray(e.displaySegments)?e.displaySegments:null,i=7,o=Math.max(1,Math.min(4,s.length)),l=s.length>1,u=n?12:l?Math.max(12,o*i):12,d=n?n.map(k=>{if(Number(k.duration)<=0)return"";let j=Math.max(0,Math.min(100,k.offset/t*100)),x=Math.min(100-j,k.duration/t*100);return`<span class="rag-wf-bar is-sequential${k.kind==="load"?" is-load":""}" style="left:${j.toFixed(3)}%;width:${x.toFixed(4)}%;top:0;height:12px;--bar-color:${k.color}"
            data-rag-wf-tip="${r(k.tip)}"
            aria-label="${r(k.tip)}" role="img"></span>`}).join(""):s.slice(0,4).map((k,j)=>{if(Number(k.duration)<=0)return"";let x=Math.max(0,Math.min(100,k.offset/t*100)),A=Math.max(.35,Math.min(100-x,k.duration/t*100)),F=l?j*i:0,ne=l?6:12,Y=La(e,k);return`<span class="rag-wf-bar" style="left:${x.toFixed(3)}%;width:${A.toFixed(3)}%;top:${F}px;height:${ne}px"
            data-rag-wf-tip="${r(Y)}"
            aria-label="${r(Y)}" role="img"></span>`}).join(""),g=Array.isArray(e.detailSegments)?e.detailSegments:[],v=g.length>1?g.map(k=>{let j=k.kind==="load"?{...e,key:"model_load",label:`Model Load \xB7 ${e.label}`,spans:[k.span],duration:k.duration}:{...e,label:`${e.label} \u63A8\u8AD6`,spans:[k.span],duration:k.duration},x=Bn(j,{includeLoad:k.kind!=="stage"});return`<div class="rag-wf-detail-group">
              <div class="rag-wf-detail-group-head">
                <strong>${r(k.label)}</strong>
                <span>${r(de(k.duration))}</span>
              </div>
              <div class="rag-wf-detail-grid">${x.map(([A,F])=>`<span class="rag-wf-detail"><span>${r(A)}</span><strong>${r(F)}</strong></span>`).join("")}</div>
            </div>`}).join(""):"",f=Bn(e).map(([k,j])=>`<span class="rag-wf-detail"><span>${r(k)}</span><strong>${r(j)}</strong></span>`).join(""),p=g.length>1?`<div class="rag-wf-details is-split">${v}</div>`:`<div class="rag-wf-details">${f}</div>`,b=s.length?s.some(k=>k.status==="error")?"is-error":"":"is-missing",y=s.length?de(e.duration):"\u672A\u8A18\u9304";return`<details class="rag-wf-stage ${b}" style="--stage-color:${e.color}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong>${r(e.label)}</strong><small>${r(e.hint)}</small>${a.length?`<small class="rag-wf-model-line">${r(a.join(" \xB7 "))}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${y} \xB7 ${s.length?`${s.length} span`:"\u2014"} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:${u}px">${d}</span>
    </summary>
    ${p}
  </details>`}function Di(e,t,s=!1){let a=e.response||{},n=e.client||{},i=e.models||[];return`<div class="rag-wf-summary">
      <span>\u7E3D\u8017\u6642 <strong>${r(de(e.total))}</strong></span>
      <span>Server <strong>${r(de(t))}</strong></span>
      ${n.total_ms?`<span>Client <strong>${r(de(n.total_ms))}</strong></span>`:""}
      ${n.render_ms!==void 0?`<span>Render <strong>${r(de(n.render_ms))}</strong></span>`:""}
      <span>\u5F15\u7528 <strong>${r(String(a.citation_count??"\u2014"))}</strong></span>
      <span>Abstain <strong>${a.abstain?"\u662F":"\u5426"}</strong></span>
      ${i.length?`<span>Model <strong>${r(i.join(" \xB7 "))}</strong></span>`:""}
      ${s?'<span class="rag-wf-updating">\u66F4\u65B0\u4E2D\u2026</span>':""}
    </div>`}function Ms(e,t,s="\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\uFF0C\u67E5\u770B\u53C3\u6578\u3001Token\u3001TTFT\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u4F86\u6E90\u6578\u91CF\u3002Waterfall \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u5E73\u884C\u57F7\u884C\u7684 span \u6703\u4F9D\u5BE6\u969B\u6642\u9593\u91CD\u758A\u986F\u793A\u3002",{legend:a=""}={}){return`<div class="rag-wf-axis"><span>0 ms</span><span>${r(de(t))}</span></div>
    ${a}
    <div class="rag-wf-stages">${(e||[]).map(n=>Bc(n,t)).join("")}</div>
    <p class="rag-wf-hint">${r(s)}</p>`}function Oi(e){let t=(e.stages||[]).some(n=>n.loadInfo),s=t?'<div class="rag-wf-legend"><span><i class="is-load"></i>Model Load\uFF08\u968E\u6BB5 bar \u524D\u6BB5\uFF09</span></div>':"",a=t?"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\uFF1BEmbedding\uFF0FLLM \u7684\u85CD\u8272\u524D\u6BB5\u70BA Model Load\uFF0C\u5F8C\u6BB5\u70BA\u63A8\u8AD6\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001Token \u8207\u8F09\u5165\u5360\u6BD4\u53EF\u5C55\u958B\u67E5\u770B\u3002":"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207 Token \u53EF\u5C55\u958B\u67E5\u770B\u3002";return Ms(e.stages,e.total,a,{legend:s})}function Ta(e,{serverDurationMs:t=0,loading:s=!1,embedded:a=!1}={}){if(!e||typeof e!="object")return"";let n=Pi(e,t),i=n.traceStatus;return`<section class="report-card rag-wf-card${a?" rag-wf-embedded":""}">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${ja[i.tone]||ja.idle}">${r(i.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(n.requestId||"\u2014")}</span>
          \xB7 ${r(be(n.startedAt))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <a class="btn btn-secondary btn-sm" href="#/performance">
          ${m("activity",14)}<span>\u5B8C\u6574 Flow</span>
        </a>
      </div>
    </div>
    ${Di(n,t,s)}
    ${Oi(n)}
  </section>`}var yt=null;function Fc(){return yt||(yt=document.createElement("div"),yt.className="rag-wf-tooltip",yt.hidden=!0,document.body.appendChild(yt),yt)}function Hn(){yt&&(yt.hidden=!0)}function Bi(e){if(!yt||yt.hidden)return;let t=14,s=10,a=yt.getBoundingClientRect(),n=e.clientX+t,i=e.clientY+t;n+a.width>window.innerWidth-s&&(n=e.clientX-a.width-t),i+a.height>window.innerHeight-s&&(i=e.clientY-a.height-t),yt.style.left=`${Math.max(s,n)}px`,yt.style.top=`${Math.max(s,i)}px`}document.addEventListener("pointerover",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=Fc(),a=t.dataset.ragWfTip||"";a&&(s.textContent=a,s.hidden=!1,Bi(e))});document.addEventListener("pointermove",e=>{if(!(!yt||yt.hidden)){if(!e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]")){Hn();return}Bi(e)}});document.addEventListener("pointerout",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=e.relatedTarget;s instanceof Node&&t.contains(s)||Hn()});window.addEventListener("scroll",Hn,{capture:!0,passive:!0});function Hc(e,t,s,a){if(a&&!e.length)return`<div class="report-card rag-wf-card">
      ${Pe({tone:"danger",title:"RAG Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">${m("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;if(!e.length)return`<div class="report-card rag-wf-card">
      ${ut({iconName:"activity",title:s?"\u8B80\u53D6 RAG Pipeline\u2026":"\u5C1A\u7121 RAG Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684 RAG \u554F\u7B54 Trace\u3002":"\u7522\u751F\u65B0\u7684 RAG \u554F\u7B54\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A Parsing\u3001Embedding\u3001Qdrant\u3001Context\u3001LLM \u8207 Response \u7684 waterfall\u3002"})}
    </div>`;let n=e.find(d=>String(d.id)===String(t))||e[0],i=n.flow&&typeof n.flow=="object"?n.flow:{},o=Pi(i,n.duration_ms),l=o.traceStatus,u=e.map(d=>{let g=Ci(d.flow||{});return`<option value="${r(String(d.id))}" ${String(d.id)===String(n.id)?"selected":""}>#${r(String(d.id))} \xB7 ${r(be(d.started_at))} \xB7 ${r(de(d.duration_ms))} \xB7 ${r(g.label)}</option>`}).join("");return`<section class="report-card rag-wf-card">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${ja[l.tone]||ja.idle}">${r(l.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(o.requestId||n.request_id||"\u2014")}</span>
          \xB7 ${r(be(n.started_at))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <label class="rag-wf-select">Trace
          <select class="select" data-rag-trace-select aria-label="\u9078\u64C7 RAG Trace">${u}</select>
        </label>
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">
          ${m("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    ${Di(o,n.duration_ms,s)}
    ${Oi(o)}
  </section>`}function zc(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},n=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?de(a.avg_total_ms??0):"\u2014",o=a.samples?de(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
                    <span class="perf-model-count">${c(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${de(l.avg_ms)}`:""}</span>
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
                    <span class="perf-seg-ms">${de(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function mt(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),n=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(n).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:n?`${n}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function Fi(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function Gc(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let n=Number(a.points_per_second)||0,i=Math.max(2,n/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${r(Fi(a))}</strong>
          <span>${r(be(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${r(`${c(a.indexed_count)} \u7B46 \xB7 ${mt(a.duration_ms)} \xB7 ${c(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${n.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${c(a.indexed_count)} \u7B46 \xB7 ${mt(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function Uc(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${r(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${r(`${s.label} ${mt(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${r(s.key)}"></i>
            <span>${r(s.label)}</span>
            <strong>${mt(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 Ollama Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function Qc(e,t){let s=(Array.isArray(e)?e:[]).map(j=>({elapsed:Math.max(0,Number(j.elapsed_s)||0),indexed:Math.max(0,Number(j.indexed)||0)})).filter(j=>j.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(j=>j.elapsed),(Number(t)||0)/1e3,1),n=Math.max(...s.map(j=>j.indexed),1),i=760,o=150,l=12,u=12,d=i-l*2,g=o-u*2,v=s.map(j=>[l+j.elapsed/a*d,o-u-j.indexed/n*g]),f=v.map(([j,x],A)=>`${A===0?"M":"L"}${j.toFixed(1)},${x.toFixed(1)}`).join(" "),p=`${f} L${v[v.length-1][0].toFixed(1)},${o-u} L${v[0][0].toFixed(1)},${o-u} Z`,b=Math.max(1,Math.ceil(v.length/14)),y=v.map(([j,x],A)=>A%b===0||A===v.length-1?`<circle cx="${j.toFixed(1)}" cy="${x.toFixed(1)}" r="2.6" />`:"").join(""),k=[0,1,2,3].map(j=>{let x=u+g/3*j;return`<line x1="${l}" y1="${x.toFixed(1)}" x2="${i-l}" y2="${x.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${c(n)} \u7B46 \xB7 ${mt(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${k}
      <path d="${p}" class="index-progress-area"></path>
      <path d="${f}" class="index-progress-line"></path>
      ${y}
      <line x1="${l}" y1="${o-u}" x2="${i-l}" y2="${o-u}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${u}" x2="${l}" y2="${o-u}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${mt(a*500)}</span>
      <span>${mt(a*1e3)}</span>
    </div>
  </div>`}function Jc(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},n=t.coverage||{},i=n.total_judgments>0?`${c(n.indexed_judgments)} / ${c(n.total_judgments)}\uFF08${(100*n.indexed_judgments/n.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:c(t.indexed_count),note:`${c(t.batch_count)} \u6279 \xD7 ${c(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:mt(t.duration_ms),note:`${c(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:mt(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${mt(t.batch_min_ms)} \xB7 \u6700\u6162 ${mt(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${c(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${r(Fi(t))}</span>
    </div>
    <div class="index-perf-summary">
      ${o.map(l=>`<div class="index-perf-stat">
            <div class="summary-label">${r(l.label)}</div>
            <div class="index-perf-value">${r(l.value)}</div>
            <div class="index-perf-note">${r(l.note)}</div>
          </div>`).join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${r(be(t.started_at))}</span>
      <span><strong>batch</strong> ${c(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${c(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${c(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${r(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${mt(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${Gc(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${mt(t.duration_ms)}</span>
        </div>
        ${Uc(t)}
      </div>
    </div>
    ${Qc(t.progress,t.duration_ms)}
  </section>`}var Ti=["#22d3ee","#a78bfa","#f59e0b","#ec4899","#3b82f6","#10b981","#f97316","#8b5cf6","#64748b"];function Ni(e){let t=String(e?.host||e?.url||"").trim(),s=e?.port?`:${e.port}`:"";return`${t||"\u2014"}${s}`}function Wc(e,t,s,a){if(a&&!e)return`<div class="report-card rag-wf-card">
      ${Pe({tone:"danger",title:"\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${m("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=Array.isArray(e?.runs)?e.runs:[];if(!n.length)return`<div class="report-card rag-wf-card">
      ${ut({iconName:"layers",title:s?"\u8B80\u53D6\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline\u2026":"\u5C1A\u7121\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684\u7248\u672C\u5316\u7D22\u5F15\u7D00\u9304\u3002":"\u57F7\u884C\u300CQdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A host/model\u3001Blue-Green collection \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002"})}
    </div>`;let i=n.find(x=>String(x.id)===String(t))||e?.latest||n[n.length-1],o=i?.pipeline&&typeof i.pipeline=="object"?i.pipeline:null,u=[...n].reverse().map(x=>{let A=Number(x.pipeline?.version_id||x.version_id||0),F=A?`v${String(A).padStart(3,"0")}`:"\u7D22\u5F15";return`<option value="${r(String(x.id))}" ${String(x.id)===String(i.id)?"selected":""}>${r(`${be(x.started_at)} \xB7 ${F} \xB7 ${mt(x.duration_ms)}`)}</option>`}).join(""),d=Number(o?.version_id||i.version_id||0),g=d?`v${String(d).padStart(3,"0")}`:"\u2014",v=o?.host||{},f=Ni(v),p=o?.model||i.model||"\u2014",b=Number(o?.total_ms)||Number(i.duration_ms)||0,y=Array.isArray(o?.stages)?o.stages:[],k=y.map((x,A)=>({...x,ms:Math.max(0,Number(x.duration_ms)||0),color:Ti[A%Ti.length]})).filter(x=>x.ms>0).map(x=>`<span class="index-pipeline-seg" style="width:${(x.ms/Math.max(1,b)*100).toFixed(2)}%;background:${r(x.color)}" title="${r(`${x.label} ${mt(x.ms)}`)}"></span>`).join(""),j=y.map((x,A)=>{let F=Math.max(0,Number(x.duration_ms)||0),ne=b>0?F/b*100:0,Y=x.host&&typeof x.host=="object"?x.host:null;return`<div class="index-pipeline-row">
        <span class="index-pipeline-step">${String(A+1).padStart(2,"0")}</span>
        <div class="index-pipeline-copy">
          <div class="index-pipeline-title">
            <strong>${r(x.label||x.key||"\u968E\u6BB5")}</strong>
            ${Ue(x.status||"success")}
          </div>
          <span class="index-pipeline-detail">${r(x.detail||"\u2014")}</span>
          ${Y?`<span class="index-pipeline-host">${m("server",12)} ${r(Ni(Y))} \xB7 ${r(x.model||p)}</span>`:""}
        </div>
        <div class="index-pipeline-time">
          <strong>${mt(F)}</strong>
          <span>${ne.toFixed(1)}%</span>
        </div>
      </div>`}).join("");return`<section class="index-perf-panel index-pipeline-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</div>
        <div class="index-perf-sub">Blue-Green collection\u3001host/model \u8207\u968E\u6BB5\u8017\u6642</div>
      </div>
      <div class="index-pipeline-actions">
        <select class="select index-pipeline-select" data-index-pipeline-select aria-label="\u9078\u64C7\u7D22\u5F15 Pipeline \u7D00\u9304">${u}</select>
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${m("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span></button>
      </div>
    </div>
    ${o?`<div class="index-pipeline-meta">
            <span><strong>\u7248\u672C</strong> ${r(g)}</span>
            <span><strong>collection</strong> ${r(String(o.collection||"\u2014"))}</span>
            <span><strong>\u6A21\u5F0F</strong> ${r(String(o.build_mode||"\u2014"))}</span>
            <span><strong>\u672C\u6B21</strong> ${o.resumed?`\u63A5\u7E8C\uFF08\u5DF2\u7D22\u5F15 ${c(o.resumed_indexed)} \u7B46\uFF09`:"\u65B0\u5EFA\u7248\u672C"}</span>
            <span><strong>Host</strong> ${r(f)}</span>
            <span><strong>Model</strong> ${r(String(p))}</span>
            <span><strong>\u7E3D\u8017\u6642</strong> ${mt(b)}</span>
          </div>
          <div class="index-pipeline-bar">${k}</div>
          <div class="index-pipeline-list">${j}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B Pipeline \u968E\u6BB5\u8CC7\u6599\uFF1B\u4E0B\u4E00\u6B21 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u6703\u8A18\u9304 host/model \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002</div>'}
  </section>`}function Vc(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Ri.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${m("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${m("chevronRight",13)}</button>
    </div>
  </div>`}function Kc(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"#65a30d":t.includes("judgment.rag")?"#8b5cf6":t.includes("judgment.web.app")?"#3b82f6":t.includes("judgment.web.query")?"#d97706":t.includes("judgment.judgment_index")?"#0d9488":"#64748b"}function Yc(e){let t=On(e),s=Math.max(0,Math.min(8,Number(e.depth)||0));return{key:"segment",label:`${"\u203A ".repeat(s)}${e.name||"unnamed"}`,hint:[e.module||"\u2014",e.function||"\u2014"].join(" \xB7 "),color:Kc(e),spans:[{...t,status:e.status||"ok",error:e.error,metadata:e.metadata||{},params:e.params||{},started_at:e.started_at,finished_at:e.finished_at}],start:t.offset,end:t.end,duration:t.duration}}function Na(e){return(e||[]).map(Yc)}function Xc(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((f,p)=>Number(f.seq)-Number(p.seq)):[],n=s?.summary||{},i=Array.isArray(n.models)?n.models:[],o=s?.client||{},l=s?.metadata||{},u=l.question||"",d=l.answer||"",g=u||d?`<div class="perf-flow-qa">
          ${u?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${r(u)}</span></div>`:""}
          ${d?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${r(d)}</span></div>`:""}
        </div>`:"",v=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(f=>(Number(f.offset_ms)||0)+(Number(f.duration_ms)||0)),1);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${r(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${r(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${r(e.method||"")} ${r(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${be(e.started_at)}</span>
      <span class="perf-record-duration">${de(e.duration_ms)}</span>
      ${Ue(e.status)}
      <span class="perf-record-chevron">${m("chevronRight",14)}</span>
    </summary>
    <div class="perf-record-body">
      <div class="perf-flow-meta">
        <span><strong>Request</strong> <span class="mono">${r(e.request_id||s?.request_id||"\u2014")}</span></span>
        <span><strong>Server</strong> ${de(e.duration_ms)}</span>
        ${o.total_ms?`<span><strong>Client \u5168\u6D41\u7A0B</strong> ${de(o.total_ms)}</span>`:""}
        ${o.render_ms!==void 0?`<span><strong>Render</strong> ${de(o.render_ms)}</span>`:""}
        <span><strong>Flow</strong> ${a.length} \u6BB5</span>
        ${a.length?"<span><strong>Waterfall</strong> \u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\u3001\u53EF\u9EDE\u9078\u5C55\u958B\u53C3\u6578</span>":""}
      </div>
      ${g}
      ${i.length?`<div class="chips perf-record-models">${i.map(f=>`<span class="chip">${r(f)}</span>`).join("")}</div>`:""}
      ${a.length?Ms(Na(a),v,"\u6B64 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002"):`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${r(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${r(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var Ei={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",rerank:"Reranker",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"};function Zc(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}var ed={embedding:"#3984c6",retrieval:"#d97706",rerank:"#8b5cf6",context:"#64748b",llm:"#16a34a",validation:"#8b5cf6"};function td(e,t){let s=Date.parse(e.started_at||""),a=Date.now(),n=Array.isArray(e.stage_order)?[...e.stage_order]:Object.keys(Ei);for(let d of t)d.stage&&!n.includes(d.stage)&&n.push(d.stage);let i=[],o=0;for(let d of n){let g=t.filter(p=>p.stage===d);if(!g.length)continue;let v=g.map(p=>{let b=Date.parse(p.started_at||""),y=Number.isFinite(s)&&Number.isFinite(b)?Math.max(0,b-s):0,k=Math.max(0,Number(p.duration_ms)||0);p.status==="running"&&Number.isFinite(b)&&(k=Math.max(k,a-b));let j=y+k;return o=Math.max(o,j),{offset:y,end:j,duration:k,status:p.status==="failed"?"error":p.status==="running"?"running":"ok",started_at:p.started_at,finished_at:p.finished_at,error:p.error_message,metadata:{...p.details||{},model:p.model,status:p.status,progress:Number(p.progress)||0,module:p.module,function:p.function},params:{model:p.model}}}),f=v.reduce((p,b)=>p+b.duration,0);i.push({key:"test_stage",label:Ei[d]||d,hint:`${v.length} \u500B\u7A0B\u5E8F`,color:ed[d]||"#64748b",spans:v,start:v.length?Math.min(...v.map(p=>p.offset)):null,end:v.length?Math.max(...v.map(p=>p.end)):null,duration:f})}let l=e.status==="running"&&Number.isFinite(s)?Math.max(0,a-s):0,u=Math.max(Number(e.total_ms)||0,l,o,1);return{stages:i,total:u}}function Ls(e,t,s,a={}){let n=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(j=>`<option value="${r(j.run_id)}" ${j.run_id===s?"selected":""}>${r(Zc(j.status))} \xB7 ${r((j.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${r(be(j.started_at))}</option>`)].join(""),o=n?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${m("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${m("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?Ue(e.status):""}</div>
      <div class="test-flow-question">${e?r(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${ut({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let u=Array.isArray(e.steps)?e.steps:[],d=td(e,u),g=e.models||{},v=e.status==="running"?`${de(d.total)}\uFF08\u4F30\u7B97\uFF09`:de(e.total_ms),f=u.find(j=>j.stage==="llm"&&j.model===e.summary?.primary_model)||u.find(j=>j.stage==="llm"&&j.details?.answer_preview),p=String(f?.details?.provider_name||"").trim(),b=p&&e.summary?.primary_model?`${p}:${e.summary.primary_model}`:e.summary?.primary_model||"",y=e.answer||f?.details?.answer_preview||"",k=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${b?`<span class="mono">${r(b)}</span>`:""}
    </div>
    <p>${y?r(y):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${r(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${r(be(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${v}</span>
      <span><strong>Embedding</strong> ${Array.isArray(g.embedding)?g.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(g.llm)?g.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${r(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${k}
    ${d.stages.length?Ms(d.stages,d.total,"\u6E2C\u8A66 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B\u7A0B\u5E8F\u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u6A21\u578B\u3001\u72C0\u614B\u3001\u9032\u5EA6\u3001module\uFF0Ffunction \u8207\u932F\u8AA4\u3002"):'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":n?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${b?`<span class="mono">primary=${r(b)}</span>`:""}
    </div>
  </div>`}function sd(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},n=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${Ue(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${c(e.total)} \u7B46\u7B26\u5408 \xB7 ${de(e.duration_ms)} \xB7
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
    ${Jc(n)}
    ${zc(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>Xc(i,o)).join(""):ut({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${Vc(e)}
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
  </div>`}async function ad(e,t){let s=!1,a=Dn(),n={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null,u=[],d="",g=!1,v=null,f=!1,p=null,b="",y=!1,k=null,j=!1;e.innerHTML=`<section class="page data-page performance-page">
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
          <button class="status-tab" type="button" data-performance-tab="pipeline">
            <span class="status-tab-icon">${m("activity",15)}</span>
            <span class="status-tab-copy"><strong>RAG Pipeline</strong><small>Span waterfall\u3001Token \u8207 TTFT</small></span>
          </button>
          <button class="status-tab" type="button" data-performance-tab="index-pipeline">
            <span class="status-tab-icon">${m("layers",15)}</span>
            <span class="status-tab-copy"><strong>\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</strong><small>Host\uFF0FModel\u3001Blue-Green \u8207\u968E\u6BB5\u8017\u6642</small></span>
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
              <div id="performance-report">${Js({label:"\u6548\u80FD\u5831\u8868"})}</div>
            </section>
          </div>
        </div>
        <div id="performance-panel-pipeline" hidden></div>
        <div id="performance-panel-index-pipeline" hidden></div>
        <div id="performance-panel-benchmark" hidden></div>
      </section>
    </div>
  </section>`;let x=e.querySelector("#performance-filter-fields"),A=e.querySelector("#performance-filter-form"),F=e.querySelector("#performance-test-flow"),ne=e.querySelector("#performance-report"),Y=e.querySelector("#performance-panel-pipeline"),Se=e.querySelector("#performance-panel-index-pipeline"),fe=e.querySelector("#performance-meta"),U=e.querySelector("#performance-refresh"),E=[...e.querySelectorAll("[data-performance-tab]")],L={overview:e.querySelector("#performance-panel-overview"),pipeline:e.querySelector("#performance-panel-pipeline"),"index-pipeline":e.querySelector("#performance-panel-index-pipeline"),benchmark:e.querySelector("#performance-panel-benchmark")},T="overview",te=w=>{T=w;for(let R of E){let V=R.dataset.performanceTab===w;R.classList.toggle("is-active",V),V?R.setAttribute("aria-current","page"):R.removeAttribute("aria-current")}for(let[R,V]of Object.entries(L))V&&(V.hidden=R!==w);w==="benchmark"?fe.textContent="BENCHMARK \xB7 RAG":w==="pipeline"?fe.textContent="PERFORMANCE \xB7 RAG WATERFALL":w==="index-pipeline"?fe.textContent="PERFORMANCE \xB7 INDEX PIPELINE":l&&(fe.textContent=`PERFORMANCE \xB7 ${c(l.total)} \u7B46`)},le=gi(e,{onNavigate:w=>te(w)}),Q=()=>{Y&&(Y.innerHTML=Hc(u,d,g,v))},me=async({force:w=!1}={})=>{if(!(s||g)){if(f&&!w){Q();return}g=!0,u.length||Q();try{let R=await W.performance({keyword:"/api/rag"},1,50);if(s)return;let V=(Array.isArray(R.rows)?R.rows:[]).filter(B=>B.flow&&(String(B.path||"").includes("/api/rag")||String(B.process||"").includes("RAG")));u=V,(!d||!V.some(B=>String(B.id)===String(d)))&&(d=V[0]?String(V[0].id):""),v=null,f=!0}catch(R){if(s)return;v=R}finally{s||(g=!1,Q())}}},ye=()=>{Se&&(Se.innerHTML=Wc(p,b,y,k))},H=async({force:w=!1}={})=>{if(!(s||y)){if(j&&!w){ye();return}y=!0,p||ye();try{let R=await W.performance({},1,1);if(s)return;p=R.index_pipeline||R.index_stats||null;let V=Array.isArray(p?.runs)?p.runs:[];(!b||!V.some(B=>String(B.id)===String(b)))&&(b=p?.latest?String(p.latest.id):""),k=null,j=!0}catch(R){if(s)return;k=R}finally{s||(y=!1,ye())}}},ve=w=>{te(w),w==="benchmark"&&le.show(),w==="pipeline"&&me(),w==="index-pipeline"&&H()};e.addEventListener("click",w=>{let R=w.target.closest("[data-performance-tab]");R&&ve(R.dataset.performanceTab||"overview")}),Y?.addEventListener("change",w=>{w.target.matches("[data-rag-trace-select]")&&(d=String(w.target.value||""),Q())}),Y?.addEventListener("click",w=>{w.target.closest('[data-action="refresh-rag-waterfall"]')&&me({force:!0})}),Se?.addEventListener("change",w=>{w.target.matches("[data-index-pipeline-select]")&&(b=String(w.target.value||""),ye())}),Se?.addEventListener("click",w=>{w.target.closest('[data-action="refresh-index-pipeline"]')&&H({force:!0})});let Z=null,xe=[],$e="",ee=null,re="",he=()=>{x.innerHTML=Ec(n,a)},ge=()=>{let w=JSON.stringify({selected:$e,tick:Z?.status==="running"?Math.floor(Date.now()/1e3):0,runs:xe.map(R=>`${R.run_id}:${R.status}`),run:Z?{run_id:Z.run_id,status:Z.status,progress:Z.progress,total_ms:Z.total_ms,steps:(Z.steps||[]).map(R=>`${R.stage}:${R.model}:${R.status}:${R.progress}:${R.duration_ms}`)}:null});w!==re&&(re=w,F.innerHTML=Ls(Z,xe,$e))},Ae=async()=>{try{let w=await W.testRuns(30);if(s)return;xe=Array.isArray(w.runs)?w.runs:[]}catch{if(s)return;xe=[]}},ke=async(w=null)=>{try{let R=w&&!$e?w:$e?await W.testRun($e):await W.testRunCurrent();if(s)return;Z=R.run||null,!$e&&Z&&Z.status!=="running"&&!xe.some(V=>V.run_id===Z.run_id)&&await Ae(),ge()}catch{if(s)return;Z=null,ge()}},Ne=async(w=null)=>{s||$e||await ke(w)},ze=()=>{s||ee||(ee=vt("test-runs",(w,R)=>Ne(R?.snapshot||null)))};F.addEventListener("change",async w=>{w.target.id==="test-run-select"&&($e=String(w.target.value||""),await ke())}),F.addEventListener("click",async w=>{w.target.closest("#test-flow-refresh")&&($e="",await Ae(),await ke())});let I=async(w=i,{quiet:R=!1}={})=>{i=Math.max(1,Number(w)||1),a=Mi();let V=ne.querySelector(".report-card"),B=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!V?ne.setAttribute("aria-busy","true"):(ne.removeAttribute("aria-busy"),ne.innerHTML=Js({label:"\u6548\u80FD\u5831\u8868"}));let Ce=e.querySelector("#performance-run");R||je(Ce,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Be=await W.performance(a,i,o);if(s)return;if(l=Be,Be.index_pipeline){p=Be.index_pipeline;let Ie=Array.isArray(p.runs)?p.runs:[];(!b||!Ie.some(ct=>String(ct.id)===String(b)))&&(b=p.latest?String(p.latest.id):""),j=!0,k=null}if(i=Number(Be.page)||i,o=Number(Be.page_size)||o,ne.removeAttribute("aria-busy"),ne.innerHTML=sd(Be),B!==null){let Ie=ne.querySelector("[data-page-size]");Ie&&(Ie.value=String(o),Ie.focus({preventScroll:!0}))}fe.textContent=`PERFORMANCE \xB7 ${c(Be.total)} \u7B46`,fe.className="badge badge-neutral badge-mono"}catch(Be){if(s)return;ne.removeAttribute("aria-busy"),ne.innerHTML=Aa(Be,{label:"\u6548\u80FD\u5831\u8868"}),P(Be.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||je(Ce,!1)}},G=async()=>{try{n=await W.performanceOptions()}catch{n={processes:[],modules:[],statuses:[],methods:[],models:[]}}he()};return A.addEventListener("submit",w=>{w.preventDefault(),I(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=Dn(),i=1,he(),I(1)}),U.addEventListener("click",async()=>{if(T==="pipeline"){je(U,!0,"\u6574\u7406\u4E2D\u2026");try{await me({force:!0})}finally{s||je(U,!1)}return}if(T==="index-pipeline"){je(U,!0,"\u6574\u7406\u4E2D\u2026");try{await H({force:!0})}finally{s||je(U,!1)}return}if(T==="benchmark"){je(U,!0,"\u6574\u7406\u4E2D\u2026");try{await le.refresh()}finally{s||je(U,!1)}return}a=Mi(),U.disabled=!0,je(U,!0,"\u6574\u7406\u4E2D\u2026"),await G(),await Ae(),s||await ke(),s||await I(1),s||(U.disabled=!1,je(U,!1))}),ne.addEventListener("click",async w=>{let R=w.target.closest("[data-action]");if(!R||!l)return;let V=R.dataset.action;if(V==="retry"){I(i);return}if(V==="prev-page"){I(Math.max(1,Number(l.page)-1),{quiet:!0});return}if(V==="next-page"){let B=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));I(Math.min(B,Number(l.page)+1),{quiet:!0});return}if(V==="copy-query"){let B=await ys(l.query_text||"");P(B?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",B?"ok":"warn");return}if(V==="export-json"){let B=`performance-page-${l.page}.json`;Rt(B,JSON.stringify(Ma(l),null,2),"application/json;charset=utf-8"),P(`\u5DF2\u532F\u51FA ${B}`,"ok");return}if(V==="export-csv"){let B=`performance-page-${l.page}.csv`;Rt(B,qa(l),"text/csv;charset=utf-8"),P(`\u5DF2\u532F\u51FA ${B}`,"ok")}}),ne.addEventListener("change",w=>{w.target.matches("[data-page-size]")&&(o=Number(w.target.value)||25,Ri.includes(o)||(o=25),I(1,{quiet:!0}))}),await Promise.allSettled([G(),Ae()]),s||(await ke(),await I(1),ze()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,ee&&ee(),le.destroy()}}var nd=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5F9E\u696D\u4EBA\u54E1\u6709\u90A3\u4E9B\u898F\u5B9A\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function rd(){return`<div class="answer-placeholder">
    <span class="empty-icon">${m("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function Gn(){return`<section class="card answer-card rag-empty-answer">${rd()}</section>`}function Hi(e,t){return`<div class="rag-turn">
    <div class="rag-user-bubble">${r(e)}</div>
    <section class="card rag-assistant-turn" data-rag-answer>${t}</section>
  </div>`}function id(e,t){return Promise.race([e,new Promise((s,a)=>{window.setTimeout(()=>a(new Error("pipeline lookup timed out")),t)})])}async function od(e){if(!e||e.pipeline_flow)return e;let t=String(e._client_request_id||e.request_id||"").trim();if(!t)return e;for(let s=0;s<3;s+=1){try{let a=await id(W.performance({keyword:t},1,5),1800),n=(Array.isArray(a.rows)?a.rows:[]).find(i=>String(i.request_id||"")===t&&i.flow&&typeof i.flow=="object");if(n)return e.pipeline_flow=n.flow,e}catch{}s<2&&await new Promise(a=>window.setTimeout(a,250))}return e}function ld(e){return{status:e.status,answer:e.answer,answer_source:e.answer_source,notice:e.notice,citations:Array.isArray(e.citations)?e.citations:[],judgments:Array.isArray(e.judgments)?e.judgments:[],law_sources:Array.isArray(e.law_sources)?e.law_sources:[],matched_terms:Array.isArray(e.matched_terms)?e.matched_terms:[],law_answer:e.law_answer,law_framework:e.law_framework,llm_model:e.llm_model,embedding_model:e.embedding_model,duration_ms:e.duration_ms,show_sources:e.show_sources,pipeline_flow:e.pipeline_flow||null,test_run:e.test_run||null,partial:!1,streaming:!1}}var cd={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"Ollama embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"Ollama LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function dd(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`Ollama run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`Ollama embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:cd[t]||t||"backend step"}function zi(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function Gi(e){let t=Number(e);return Number.isFinite(t)?`${c(Math.max(0,Math.round(t)))} ms`:"\u2014"}function Un(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function ud(){return`<div class="rag-process is-open" id="rag-process">
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
  </div>`}function pd(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),n=performance.now(),i=new Map,o=new Map,l=(p,b,y)=>{let k=p.querySelector(b);k&&(k.textContent=y)},u=p=>{if(p.failed){l(p.element,".rag-process-meta","\u5931\u6557");return}if(p.hasChildren){l(p.element,".rag-process-meta","");return}l(p.element,".rag-process-meta",Gi(p.durationMs))},d=p=>{let b=p-1,y=[...i.values()].reverse();for(let k of y){if(b<0)break;k.depth<=b&&(k.hasChildren||(k.hasChildren=!0,k.element.dataset.hasChildren="true",k.finished&&u(k)),b=k.depth-1)}},g=p=>{if(!s)return null;let b=String(p?.seq??`step-${i.size+1}`),y=i.get(b);if(!y){let k=Math.max(0,Math.min(6,Number(p?.depth)||0));d(k);let j=document.createElement("div");j.className="rag-process-item is-running",j.dataset.processKey=b,j.style.setProperty("--depth",String(k)),j.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(j),y={element:j,depth:k,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(b,y)}return l(y.element,".rag-process-label",dd(p)),y.element.title=zi(p),y};return{step:p=>{let b=p?.segment;if(!b)return;o.set(String(b.seq??b.name??o.size),{...b});let y=g(b);if(y){if(p.type==="segment_start"){y.element.classList.add("is-running"),l(y.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(p.type==="segment_end"){let k=b.status==="error";y.element.classList.remove("is-running"),y.element.classList.toggle("is-error",k),y.finished=!0,y.failed=k,y.durationMs=Number(b.duration_ms)||0,u(y),y.element.title=[zi(b),k&&b.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(p=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(j=>{j.classList.remove("is-running");let x=j.dataset.hasChildren==="true";l(j,".rag-process-meta",x?"":p?"\u5B8C\u6210":"\u4E2D\u65B7")});let b=s?.children.length||i.size,y=Gi(Math.max(0,performance.now()-n));a&&(a.textContent=p?`\u5B8C\u6210 \xB7 ${b} \u6B65 \xB7 ${y}`:`\u5931\u6557 \xB7 ${b} \u6B65`);let k=[...o.values()].filter(j=>j?.name).sort((j,x)=>Number(j.offset_ms||0)-Number(x.offset_ms||0));if(s&&k.length){let j=Math.max(1,...k.map(x=>Number(x.end_offset_ms)||(Number(x.offset_ms)||0)+(Number(x.duration_ms)||0)));s.classList.add("is-waterfall"),s.innerHTML=Ms(Na(k),j,"\u5F8C\u7AEF Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B span \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002")}return t.classList.add("is-complete"),Un(t,!1),t.outerHTML},collapse:()=>Un(t,!1)}}function md(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${m("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":ud()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${r(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function Ui(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Ra(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let n=String(e||"").trim();return n?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t||n)}"
    data-source-type="${r(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(a||n)}</button>`:""}function Vi(e){let t=String(e?.law_name||"").trim(),s=String(e?.article_no||"").replace(/\s+/g,"");if(!t||!s)return"";let a=(Array.isArray(e?.paragraphs)?e.paragraphs:[]).map(i=>String(i||"").trim()).filter(Boolean),n=`${t}${s}${a.join("\u3001")}`;return`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t)}"
    data-source-type=""
    data-article-no="${r(s)}"
    title="\u9EDE\u64CA\u67E5\u770B ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(n)}</button>`}function Ki(e){let t=String(e?.citation_status||"");return t==="cited"?"\u7B54\u6848\u5F15\u7528":t==="provided_not_cited"?"\u5DF2\u63D0\u4F9B\u7D66\u6A21\u578B\uFF0C\u7B54\u6848\u672A\u5F15\u7528":t==="reference_only"||e?.used_for_generation===!1?"\u50C5\u4F9B\u53C3\u8003\uFF08\u672A\u9032\u5165\u751F\u6210 prompt\uFF09":e?.used_for_generation===!0?"\u5DF2\u63D0\u4F9B\u7D66\u6A21\u578B":""}function gd(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(v=>`<span>${r(v)}</span>`).join(""),n=Ki(e),i=n?`<span>${r(n)}</span>`:"",o=(Array.isArray(e.law_citations)?e.law_citations:[]).map(v=>Vi(v)).filter(Boolean).slice(0,12).join(""),l=o||(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(v=>Ra(v)).join(""),u=o?'<div class="citation-meta"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':"",d=e.jid?` data-action="open-parquet-judgment"
        data-jid="${r(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${r(e.jid)}"`:"",g=e.pdf_url?`<a class="citation-link" href="${r(e.pdf_url)}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${m("external",11)}</a>`:"";return`<article class="citation">
    <span class="citation-index">[${e.index??t+1}]</span>
    <div class="citation-body">
      <div class="citation-head"${d}>
        <h4 class="citation-name">${r(e.jid||"\u672A\u77E5\u6848\u865F")}</h4>
        <div class="citation-meta">${a||"<span>\u5224\u6C7A metadata</span>"}${i}</div>
        ${e.title?`<div class="citation-meta"><span>\u6848\u7531\uFF1A${r(e.title)}</span></div>`:""}
      </div>
      ${u}
      ${l?`<div class="chips" style="margin-top:8px">${l}</div>`:""}
      ${e.snippet?`<p class="citation-snippet">${r(e.snippet)}</p>`:""}
    </div>
    <div class="citation-links">${g}</div>
  </article>`}function fd(e){let t=[e.court,e.jdate].filter(Boolean).map(n=>`<span>${r(n)}</span>`).join(""),s=[e.vector_score!==null&&e.vector_score!==void 0?`\u5411\u91CF ${Number(e.vector_score).toFixed(4)}`:"",e.rerank_score!==null&&e.rerank_score!==void 0?`rerank ${Number(e.rerank_score).toFixed(4)}`:""].filter(Boolean).map(n=>`<span>${r(n)}</span>`).join("");return`<article class="citation reference-judgment">
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
  </article>`}function bd(e,t){let s=[e.law_level,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${r(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${m("external",11)}</a>`:"",n=e.law_key||e.law_name||"",i=n?` data-action="open-law-source"
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
  </article>`}function hd(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",n=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${r(s)}</span>`,a,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${Nt(e.law_modified_date)}`:"",Ki(e)].filter(Boolean).map(p=>`<span>${p}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${r(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${r(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${r(o.entity||"")}\u300D\u7684\u5224\u6C7A ${c(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${c(o.law_count||0)} \u6B21</span>
      </div>`:"",u=e.law_key||"",d=e.source_type||"",g=(Array.isArray(e.articles)?e.articles:[]).map(p=>{let b=String(p.article_no||"");return`<div class="law-source-article"${u&&b?` data-action="open-law-source"
        data-law-key="${r(u)}"
        data-source-type="${r(d)}"
        data-article-no="${r(b)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${r(b)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} ${r(b)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${r(p.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${r(p.article_content||"")}</p>
      </div>`}).join(""),v=e.law_url?`<a class="citation-link" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${m("external",11)}</a>`:"",f=e.law_key?` data-action="open-law-source"
        data-law-key="${r(e.law_key)}"
        data-source-type="${r(e.source_type||"")}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u672C\u5730 Parquet \u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation law-source">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body"${f}>
      <h4 class="citation-name">${r(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${n}</div>
      ${i}
      ${l}
      ${g}
    </div>
    <div class="citation-links">${v}</div>
  </article>`}function vd(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function $d(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${r(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",n=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(n==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),u=s.index!=null?`<span class="law-answer-index">[${r(String(s.index))}]</span>`:"",d=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${r(a)}"
            data-source-type="${r(n)}"
            title="\u9EDE\u64CA\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587">${r(i)}</button>`:`<strong>${r(i)}</strong>`,g=Array.isArray(s.articles)?s.articles:[],v=g.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${g.map(f=>{let p=String(f.article_no||"").trim(),b=vd(f.article_content);return!a||!p?`<div class="law-answer-article is-static">
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
          ${d}
          <span class="law-answer-source-meta">\uFF08${r(o)}\uFF0C${c(l)} \u689D\uFF09</span>
          ${u}
        </div>
        ${v}
      </div>`}).join("")}</div>`}function yd(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let n=s.get(String(a));return n?.law_key?Ra(a,{lawKey:n.law_key,sourceType:n.source_type||""}):`<span class="chip">${r(a)}</span>`}).join("")}</div>`}function wd(e){let t=String(e||"");return t==="operational"?"is-ok":t==="standby"?"is-idle":"is-down"}function _d(e){let t=String(e||"");return t==="operational"?"":t==="standby"?"\u5099\u63F4":t==="disabled"?"\u505C\u7528":t==="not_configured"?"\u672A\u8A2D\u5B9A":"\u96E2\u7DDA"}function Qi(e,{fallback:t=!1}={}){if(!e)return`<span class="rag-model-cell is-empty">
      <span class="rag-model-state is-idle" aria-hidden="true"></span>
      <span class="rag-model-name">\u672A\u8A2D\u5B9A</span>
    </span>`;let s=String(e.label||"").trim()||[e.host,e.model].filter(Boolean).join(":"),a=String(e.status||""),n=!["operational","standby"].includes(a),i=t&&!n?"\u5099\u63F4":_d(a),o=n?"is-down":t?"is-idle":wd(a),l=[s,e.url,i].filter(Boolean).join(" \xB7 ");return`<span class="rag-model-cell" title="${r(l)}">
    <span class="rag-model-state ${o}" aria-hidden="true"></span>
    <span class="rag-model-name">${r(s)}</span>
    ${i?`<span class="rag-model-note">${r(i)}</span>`:""}
  </span>`}function kd(e,t){let s=Array.isArray(e)?e:[],a=[{kind:"chat",label:"Chat"},{kind:"embedding",label:"Embedding"},{kind:"rerank",label:"Rerank"}],n=new Map(s.map(o=>[String(o.kind||""),o])),i=a.map(o=>{let l=n.get(o.kind)||o;return`<tr>
        <td class="rag-model-kind">${r(l.label||o.label)}</td>
        <td>${Qi(l.active)}</td>
        <td>${Qi(l.fallback,{fallback:!0})}</td>
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
  </div>`}function Ea({tone:e,title:t,text:s,modelSummary:a=[],refreshing:n=!1}){let i=e==="ok"?"is-ok":e==="warn"?"is-warn":"is-info",o=e==="ok"?"check":e==="warn"?"alert":"info",l=e==="ok"?"badge-ok":e==="warn"?"badge-warn":"badge-info";return`<section class="rag-mode-card ${i}">
    <div class="rag-mode-head">
      <span class="rag-mode-icon" aria-hidden="true">${m(o,14)}</span>
      <div class="rag-mode-copy">
        <strong>${r(t)}</strong>
        <p>${r(s)}</p>
      </div>
      <span class="badge ${l}">3 \u500B\u6A21\u578B</span>
    </div>
    ${kd(a,n)}
  </section>`}function Yi(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.reference_judgments)?e.reference_judgments:[],n=Array.isArray(e.law_sources)?e.law_sources:[],i=e.retrieval||{},o=Array.isArray(e.matched_terms)?e.matched_terms:[],l=e.status||"preview",u=!!e.partial,d=!!e.streaming,g=!!e.rerank_degraded,v=!!e.show_sources||!u,f=e.answer_source==="structured",p=String(e.law_answer||"").trim(),b=e.law_framework||null,y=Array.isArray(b?.rows)?b.rows:[],k=Array.isArray(b?.sources)?b.sources:[],j=y.length>0,x=!!p&&!f&&!j,A=s.filter(ge=>ge.used_for_generation===!0).length,F=s.some(ge=>ge.used_for_generation!==void 0),ne=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46${F?`\uFF08${A} \u7B46\u9032\u5165 prompt\uFF09`:""}</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((ge,Ae)=>gd(ge,Ae)).join("")}</div>`:"",Y=i.judgment_limit_applied&&a.length?`<div class="reference-judgment-note">
          <span>\u672C\u984C\u4F9D\u984C\u610F\u4E3B\u8981\u8A62\u554F\u6CD5\u898F\u898F\u5B9A\uFF0C\u6545\u5224\u6C7A\u50C5\u986F\u793A ${s.length} \u7B46\u4F5C\u70BA\u53C3\u8003\u3002\u53E6\u6709 ${a.length} \u7B46\u76F8\u95DC\u5224\u6C7A\uFF08${a.some(ge=>ge.rerank_score!==null&&ge.rerank_score!==void 0)?"\u4F9D rerank \u5206\u6578\u6392\u5E8F":"\u4F9D\u6AA2\u7D22\u5206\u6578\u6392\u5E8F"}\uFF09\uFF0C</span>
          <details class="reference-judgments">
            <summary>\u5C55\u958B\u67E5\u770B</summary>
            <div class="citation-list reference-judgment-list">${a.map(ge=>fd(ge)).join("")}</div>
          </details>
        </div>`:"",Se=n.length&&!x?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${n.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${n.map((ge,Ae)=>hd(ge,Ae)).join("")}</div>`:"",fe=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((ge,Ae)=>bd(ge,Ae)).join("")}</div>`:"",U=v?ne+Y+Se+fe:"";!U&&!u&&!x&&!j&&(U=`<div class="answer-divider"></div>
      ${ut({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:l==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let E=yd(o,n),L=e.test_run,T=String(e.llm_model||L?.primary_model||"").trim(),te=String(e.embedding_model||"").trim(),le=[T?`LLM\uFF1A${T}`:"",te?`Embedding\uFF1A${te}`:""].filter(Boolean).join(" \xB7 "),Q=d||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",me=j?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${r(b.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${y.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${y.map(ge=>`<tr>
                    <td>${r(ge.law_name||"\u2014")}</td>
                    <td class="cell-number">${r(ge.article_no||"\u2014")}</td>
                    <td>${r(ge.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${k.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${k.map(ge=>{let Ae=String(ge?.law_name||ge||"").trim(),ke=ge&&ge.index!==null&&ge.index!==void 0?` [${r(ge.index)}]`:"";return Ra(Ae,{label:`${Ae}${ke}`})}).join("")}
              </div>`:""}
      </div>`:"",ye=e.answer_source==="llm"&&T?`<span class="answer-model" title="${r(le)}">${m("brain",11)}${r(T)}</span>`:f?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${m("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",H=d?`${T||"LLM"} \xB7 \u751F\u6210\u4E2D`:ye?T||"structured":"retrieval",ve=L?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${Ue(L.status)}
          <span class="mono">${r(L.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(L.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(L.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${r(L.primary_model||"\u2014")}</span>
          <span>${Number(L.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",Z=e.pipeline_flow&&typeof e.pipeline_flow=="object"?e.pipeline_flow:null,xe=!u&&Z?Ta(Z,{serverDurationMs:Number(e.duration_ms)||0,embedded:!0}):"",ee=String(e.answer||"").trim()||(d?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":u?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),re=d?" data-partial-answer":"",he=d?" is-streaming":"";return`${me}
      ${x?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${u&&!v?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${n.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${$d(n,p)}</div>
            </div>`:""}
      <div class="answer-block">
        ${x||j?`<div class="answer-block-head">
                <span>${r(Q)}</span>
                <span>${r(H)}</span>
              </div>`:""}
        <p class="answer-text${he}"${re}>${r(ee)}</p>
      </div>
      ${g?'<div class="answer-notice" data-rerank-degraded="true">\u6392\u5E8F\u7CBE\u7C21\u6A21\u5F0F\uFF1A\u672C\u6B21\u90E8\u5206 rerank \u903E\u6642\u6216\u964D\u7D1A\uFF0C\u4F86\u6E90\u53EF\u80FD\u4EE5\u5411\u91CF\u9806\u5E8F\u986F\u793A\u3002</div>':""}
      ${e.notice?`<div class="answer-notice">${r(e.notice)}</div>`:""}
      ${ve}
      ${E}
      ${U}
      ${xe}`}function Ji(e,t,s=""){let a=t.status||"preview",n=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),u=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),d=t.answer_source==="structured",g=t.answer_source==="llm"&&o?`<span class="answer-model" title="${r(u)}">${m("brain",11)}${r(o)}</span>`:d?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${m("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${m("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${Ue(a,n)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${g}
      </div>
      ${s}
    </div>
    <div class="answer-body">${Yi(t)}</div>`}function Sd(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${m("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${Pe({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function xd(e){let t=Array.isArray(e.turns)?e.turns:[],s=t.length?t[t.length-1].payload||{}:e.payload||{},a=Array.isArray(s.citations)?s.citations.length:0,n=Array.isArray(s.judgments)?s.judgments.length:0,i=Array.isArray(s.law_sources)?s.law_sources.length:0;return a+n+i}function Ad(e,t,s,a=null){let n=e.id??s,i=xd(e),o=t.get(String(e.project_id||"")),l=Array.isArray(e.turns)?e.turns:[],u=e.updated_at||e.created_at,d=a!=null&&String(a)===String(n);return`<div class="rag-history-item${e.pinned?" is-pinned":""}${d?" is-active":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${r(String(n))}">
      <span class="history-question">${r(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${r(Ps(u))}</span>
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
  </div>`}function Wi(e,t,s){let a=new Map;for(let i of t){let o=String(i.project_id||"");o&&a.set(o,(a.get(o)||0)+1)}let n=[`<button class="rag-project${s?"":" is-active"}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${s?"false":"true"}">
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
  </div>`),n.join("")}async function qd(e){let t=!1,s=[],a=!1,n=[],i=!1,o="",l=8,u="",d=0,g=null,v=[],f=!1,p=!1,b={embedding:[],llm:[]},y=null,k=null,j=!1;e.innerHTML=`<section class="page rag-page">
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
        <header class="rag-hero rag-hero-compact">
      <div id="rag-mode-notice">${Pe({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
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
        ${nd.map(h=>`<button class="example-chip" type="button" data-question="${r(h)}">${r(h)}</button>`).join("")}
      </div>
    </header>

    <section class="rag-conversation" id="rag-conversation" aria-live="polite">
      <div class="rag-turns" id="rag-turns">
        ${Gn()}
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
  </section>`;let x=e.querySelector("#rag-form"),A=e.querySelector("#rag-question"),F=e.querySelector("#rag-submit"),ne=e.querySelector(".rag-page"),Y=e.querySelector("#rag-turns"),Se=e.querySelector("#rag-followup-form"),fe=e.querySelector("#rag-followup-question"),U=e.querySelector("#rag-followup-submit"),E=e.querySelector("#rag-history"),L=e.querySelector("#rag-storage-note"),T=e.querySelector("#rag-clear-history"),te=e.querySelector(".rag-library"),le=e.querySelector("#rag-pinned-body"),Q=e.querySelector("#rag-projects-body"),me=e.querySelector("#rag-pinned-count"),ye=e.querySelector("#rag-projects-count"),H=e.querySelector("#rag-recent-count"),ve=e.querySelector("#rag-library-context"),Z=e.querySelector("#rag-test-mode"),xe=e.querySelector("#rag-test-flow"),$e=e.querySelector("#rag-history-menu"),ee=e.querySelector("#rag-judgment-dialog"),re=e.querySelector("#rag-law-dialog"),he=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};ee?.addEventListener("close",he),re?.addEventListener("close",he);let ge=null,Ae=null,ke,Ne=null,ze=null,I=()=>{A.style.height="auto",A.style.height=`${Math.min(A.scrollHeight,220)}px`},G=()=>{fe.style.height="auto",fe.style.height=`${Math.min(fe.scrollHeight,160)}px`},w=h=>{f=!!h,ne.classList.toggle("has-conversation",f)},R=()=>{f&&(Se.hidden=!1,G())},V=()=>{Se.hidden=!0},B=()=>{$e.hidden&&!ze||($e.hidden=!0,$e.innerHTML="",ze&&ze.setAttribute("aria-expanded","false"),Ne=null,ze=null)},Ee=(h,S)=>{let M=Y.querySelector(".rag-empty-answer");M&&M.remove(),Y.insertAdjacentHTML("beforeend",Hi(h,S));let O=Y.lastElementChild,K=O?.querySelector("[data-rag-answer]");return window.requestAnimationFrame(()=>{O?.scrollIntoView({behavior:"smooth",block:"start"})}),{turnElement:O,answerElement:K}},Ce=()=>{Y.innerHTML=v.length?v.map(h=>Hi(h.question,Ji(h.question,h.payload||{},""))).join(""):Gn()},Be=h=>{let S=Array.isArray(h.turns)?h.turns:[];return S.length?(d+=1,bt(),At(null),g=h.id??null,v=S.map(M=>({...M})),u=v[v.length-1]?.question||"",w(!0),Ce(),R(),Ie(),je(F,!1),je(U,!1),window.setTimeout(()=>{Se.scrollIntoView({behavior:"smooth",block:"end"})},50),!0):!1},Ie=()=>{if(t)return;if(B(),!a){E.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',le.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',me.textContent="0",H.textContent="0",i&&(Q.innerHTML=Wi(n,[],o));return}let h=n.find(Te=>String(Te.id)===o)||null;o&&!h&&(o="");let S=new Map(n.map(Te=>[String(Te.id),Te])),M=s.filter(Te=>!!Te.pinned),O=s.filter(Te=>!Te.pinned),K=o?O.filter(Te=>String(Te.project_id||"")===o):O,pe=K.slice(0,l),Le=(Te,ot)=>Ad(Te,S,ot,g);le.innerHTML=M.length?M.map(Le).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',Q.innerHTML=Wi(n,s,o),E.innerHTML=pe.length?pe.map(Le).join(""):`<div class="rag-library-empty">${o?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u672A\u91D8\u9078\u7684\u9805\u76EE\u3002":M.length?"\u6700\u8FD1\u7684\u9805\u76EE\u90FD\u5DF2\u91D8\u9078\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,K.length>l&&E.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${c(K.length-l)} \u7B46</button>`),me.textContent=String(M.length),ye.textContent=String(n.length),H.textContent=String(K.length),h?(ve.hidden=!1,ve.innerHTML=`<span>${m("folder",12)}<strong>${r(h.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${m("x",12)}</button>`):(ve.hidden=!0,ve.innerHTML="")},ct=async()=>{try{let h=await ns("rag.projects",[]);n=Array.isArray(h)?h.map(S=>({id:String(S?.id||""),name:String(S?.name||"").trim()})).filter(S=>S.id&&S.name):[]}catch{n=[]}i=!0,t||Ie()},Ve=h=>{o=String(h||""),l=8,Ie()},at=()=>{let h=Q.querySelector('[data-rag-form="project"]');h&&(h.hidden=!1,h.querySelector("input")?.focus())},jt=()=>{let h=Q.querySelector('[data-rag-form="project"]');h&&(h.hidden=!0,h.reset())},nt=async h=>{let S=h.elements.project_name,M=String(S?.value||"").trim();if(!M){P("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),S?.focus();return}if(n.some(K=>K.name.toLowerCase()===M.toLowerCase())){P("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),S?.focus();return}let O=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;n=[...n,{id:O,name:M.slice(0,60),created_at:new Date().toISOString()}],o=O,l=8,await Us("rag.projects",n),Ie(),P(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${M}\u300D\u3002`,"ok")},We=async h=>{let S=s.find(K=>String(K.id)===String(h));if(!S)return;let M=!S.pinned;if(!await Gs(S.id,{pinned:M})){P("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}S.pinned=M,Ie(),P(M?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},ft=()=>{d+=1,bt(),At(null),u="",g=null,v=[],w(!1),V(),Y.innerHTML=Gn(),A.value="",I(),fe.value="",G(),je(F,!1),je(U,!1),Ie(),ee?.open&&ee.close(),re?.open&&re.close(),A.focus(),window.scrollTo({top:0,behavior:"smooth"})},St=h=>{if(!h||$e.hidden)return;let S=h.getBoundingClientRect(),M=$e.getBoundingClientRect(),O=6,K=S.bottom+O;K+M.height>window.innerHeight-8&&(K=Math.max(8,S.top-M.height-O));let pe=S.right-M.width;pe=Math.max(8,Math.min(pe,window.innerWidth-M.width-8)),$e.style.left=`${Math.round(pe)}px`,$e.style.top=`${Math.round(K)}px`},ae=h=>{$e.innerHTML=`
      <button type="button" role="menuitem" data-menu-action="rename">${m("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${m("pin",13)}<span>${h.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${m("link",13)}<span>\u5206\u4EAB</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${m("trash",13)}<span>\u522A\u9664</span></button>`},we=h=>{let S=String(h.project_id||""),M=[{id:"",name:"\u672A\u5206\u985E"},...n.map(O=>({id:String(O.id),name:O.name}))];$e.innerHTML=`
      <div class="rag-history-menu-head">${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${M.map(O=>`<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${r(O.id)}">
            <span class="rag-history-menu-check">${S===O.id?m("check",12):""}</span>
            <span>${r(O.name)}</span>
          </button>`).join("")}
      ${n.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${m("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},Qe=(h,S)=>{let M=s.find(O=>String(O.id)===String(S));M&&(B(),Ne=String(M.id),ze=h,ae(M),$e.hidden=!1,h.setAttribute("aria-expanded","true"),St(h))},Ke=async h=>{let S=window.prompt("\u91CD\u65B0\u547D\u540D\u5C0D\u8A71",h.title||"");if(S===null)return;let M=S.trim();if(!M){P("\u540D\u7A31\u4E0D\u80FD\u7A7A\u767D\u3002","warn");return}if(M===h.title)return;if(!await Gs(h.id,{title:M})){P("\u91CD\u65B0\u547D\u540D\u5931\u6557\u3002","danger");return}h.title=M,Ie(),P("\u5C0D\u8A71\u5DF2\u91CD\u65B0\u547D\u540D\u3002","ok")},xt=async h=>{let S=Array.isArray(h.turns)?h.turns:[],M=[`# ${h.title||"\u672A\u547D\u540D\u5C0D\u8A71"}`,""];if(S.length)for(let K of S){M.push("## \u554F\u984C","",K.question||"",""),M.push("## \u56DE\u7B54","",K.payload?.answer||"\uFF08\u6C92\u6709\u56DE\u7B54\u5167\u5BB9\uFF09","");let pe=Array.isArray(K.payload?.law_sources)?K.payload.law_sources.map(Le=>Le.law_name).filter(Boolean):[];pe.length&&M.push(`\u5F15\u7528\uFF1A${[...new Set(pe)].join("\u3001")}`,"")}else M.push(h.title||"");let O=await ys(M.join(`
`));P(O?"\u5C0D\u8A71\u5167\u5BB9\u5DF2\u8907\u88FD\uFF0C\u53EF\u76F4\u63A5\u8CBC\u4E0A\u5206\u4EAB\u3002":"\u7121\u6CD5\u8907\u88FD\u5C0D\u8A71\u5167\u5BB9\u3002",O?"ok":"warn")},It=async h=>{if(!window.confirm(`\u522A\u9664\u5C0D\u8A71\u300C${h.title||"\u672A\u547D\u540D\u5C0D\u8A71"}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002`))return;if(!await Kr(h.id)){P("\u522A\u9664\u5931\u6557\u3002","danger");return}let M=g!==null&&String(g)===String(h.id);s=s.filter(O=>String(O.id)!==String(h.id)),M?ft():Ie(),P("\u5C0D\u8A71\u5DF2\u522A\u9664\u3002","ok")},q=async(h,S)=>{if(!await Gs(h.id,{project_id:S})){P("\u79FB\u81F3\u5C08\u6848\u5931\u6557\u3002","danger");return}h.project_id=S;let O=n.find(K=>String(K.id)===String(S));Ie(),P(O?`\u5DF2\u79FB\u81F3\u5C08\u6848\u300C${O.name}\u300D\u3002`:"\u5DF2\u79FB\u51FA\u5C08\u6848\u3002","ok")},N=async h=>{let S=h.target.closest("[data-menu-action]");if(!S)return;let M=s.find(K=>String(K.id)===Ne);if(!M){B();return}let O=S.dataset.menuAction;O==="rename"?(B(),await Ke(M)):O==="toggle-pin"?(B(),await We(M.id)):O==="share"?(B(),await xt(M)):O==="move"?(we(M),St(ze)):O==="assign-project"?(B(),await q(M,S.dataset.projectId||"")):O==="back"?(ae(M),St(ze)):O==="delete"&&(B(),await It(M))},C=h=>{$e.hidden||(typeof h.composedPath=="function"?h.composedPath():[]).includes($e)||$e.contains(h.target)||h.target.closest('[data-rag-action="open-history-menu"]')||B()},z=h=>{h.key==="Escape"&&B()},J=h=>{h.target instanceof Node&&$e.contains(h.target)||B()},se=async()=>{try{if(s=await va({limit:120}),t)return;a=!0,Ie(),L.textContent=Hs()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;s=[],a=!0,Ie(),E.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},ue=async(h,S,M,O)=>{let K=v,pe=g;K.push({question:h,asked_at:new Date().toISOString(),payload:ld(S)});let Le=Array.isArray(S.citations)?S.citations:[],Te=Array.isArray(S.judgments)?S.judgments:[],ot={question:h,status:S.status,citations:Le.map(it=>it.law_name),judgments:Te.map(it=>it.jid)},tt=`${S.status||"preview"} \xB7 ${K.length} \u8F2A`,Ge=new Date().toISOString(),rt=it=>{O===d&&(g=it)};if(pe){if(!await Gs(pe,{turns:K,detail:tt,payload:ot,updated_at:Ge})){let Dt=await zs({kind:"rag",title:K[0]?.question||h,detail:tt,project_id:M,turns:K,payload:ot,updated_at:Ge});rt(Dt)}}else{let it=await zs({kind:"rag",title:K[0]?.question||h,detail:tt,project_id:M,turns:K,payload:ot,updated_at:Ge});rt(it)}await se()},Me=()=>{let h=e.querySelector("#rag-mode-notice");if(!h)return;let S=Array.isArray(y?.model_summary)?y.model_summary:[];if(!y){if(!k)return;h.innerHTML=Ea({tone:"warn",title:"\u7121\u6CD5\u53D6\u5F97 RAG \u670D\u52D9\u72C0\u614B",text:k.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u524D\u5F80\u7CFB\u7D71\u72C0\u614B\u9801\u67E5\u770B\u3002",modelSummary:S,refreshing:j});return}let M=y.data||{},O=(y.services||[]).find(Le=>Le.id==="rag"),K=Number(M.judgment_indexed_count||0),pe=Number(M.judgment_count||0);O?.status==="operational"?h.innerHTML=Ea({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${c(K)} / ${c(pe)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`,modelSummary:S,refreshing:j}):O?.status==="degraded"?h.innerHTML=Ea({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:O.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002",modelSummary:S,refreshing:j}):h.innerHTML=Ea({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:O?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002",modelSummary:S,refreshing:j})},Re=async()=>{try{let h=await W.status();if(t)return;y=h,k=null}catch(h){if(t)return;y=null,k=h}Me()},_e=async()=>{if(!j){j=!0,Me();try{let h=await W.status();if(t)return;y=h,k=null,P("\u5DF2\u66F4\u65B0\u6A21\u578B\u72C0\u614B\u3002","ok",2500)}catch(h){P(h.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u3002","danger",6e3)}finally{j=!1,t||Me()}}},Fe=()=>{if(!Z)return;if(!p){Z.innerHTML="";return}let h=Array.isArray(b.embedding)?b.embedding.length:0,S=Array.isArray(b.llm)?b.llm.length:0;Z.innerHTML=Pe({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${h} \u500B embedding \u8207 ${S} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},Ze=async()=>{try{let h=await W.testMode();if(t)return;p=!!h.enabled,b=h.models||{embedding:[],llm:[]},Fe()}catch{if(t)return;p=!1,Fe()}},et=h=>{p=!!h.detail?.enabled,b=h.detail?.models||{embedding:[],llm:[]},Fe()};window.addEventListener("judgment:test-mode",et);let At=h=>{if(!xe)return;Ae=h||null;let S=JSON.stringify(h?{run_id:h.run_id,status:h.status,progress:h.progress,total_ms:h.total_ms,stage:h.stage,answer:h.answer||"",steps:(h.steps||[]).map(M=>`${M.stage}:${M.model}:${M.status}:${M.progress}:${M.duration_ms}`)}:null);S!==ke&&(ke=S,xe.innerHTML=h?Ls(h,[],"",{showHistory:!1}):"")},bt=()=>{ge&&(ge(),ge=null)},ta=async(h=null)=>{if(!t)try{let S=h||await W.testRunCurrent();if(t)return;let M=S.run;M&&M.status==="running"&&At(M)}catch{}},sa=()=>{t||ge||(ta(),ge=vt("test-runs",(h,S)=>ta(S?.snapshot||null)))},Ga=async h=>{if(!h){At(null);return}try{let S=await W.testRun(h);if(t)return;At(S.run||null)}catch{t||P("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},Ua=async()=>{if(p)try{let h=await W.testRunCurrent();if(t)return;h.run?.status==="running"&&(At(h.run),sa())}catch{}},bs=0,hs=(h,S)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${r(h)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${m("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${S}</div>`,aa=h=>{let S=(Array.isArray(h.citations)?h.citations:[]).map(Le=>Vi(Le)).filter(Boolean).join(""),M=S||(Array.isArray(h.matched_laws)?h.matched_laws:[]).map(Le=>Ra(Le)).join(""),O=[h.court,h.jdate,h.title?`\u6848\u7531\uFF1A${h.title}`:"",h.full_text_length?`${c(h.full_text_length)} \u5B57`:"",h.citation_count?`\u5F15\u7528 ${c(h.citation_count)} \u7B46`:""].filter(Boolean).map(Le=>`<span>${r(Le)}</span>`).join(""),K=h.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${r(String(h.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",pe=h.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(h.pdf_url)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return hs(h.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${r(h.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${O}
      </div>
      ${S?'<div class="citation-meta" style="margin-top:8px"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':""}
      ${M?`<div class="chips" style="margin:8px 0 10px">${M}</div>`:""}
      <div class="judgment-dialog-source">${K}</div>
      <pre class="judgment-dialog-text">${r(h.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${pe}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},Ns=async h=>{if(!ee||!h)return;let S=++bs;ee.open||ee.showModal(),he(),ee.innerHTML=hs("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${r(h)}\u2026</span>
      </div>`);try{let M=await W.judgmentDetail(h,"parquet");if(t||S!==bs)return;ee.innerHTML=aa(M)}catch(M){if(t||S!==bs)return;ee.innerHTML=hs("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(M.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},vs=0,$=(h,S)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${r(h)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${m("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${S}</div>`,_=(h,S="")=>{let M=String(h.selected_article_no||S||"").trim(),O=!!M,K=Array.isArray(h.articles)?h.articles:[],pe=K.map(Je=>{let De=String(Je.article_content||"").trim();return De?Je.article_type==="C"?`<div class="law-chapter">${r(De)}</div>`:`<article class="law-article" data-article-no="${r(Ui(Je.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${r(Je.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${r(De)}</div>
        </article>`:""}).join(""),Le=(Array.isArray(h.warnings)?h.warnings:[]).map(Je=>r(Je)).join("<br />"),Te=h.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",ot=h.meta?.articles_source,tt=ot==="parquet"?"Parquet \u689D\u6587":ot==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",Ge=h.meta?.snapshot||"",rt=[h.law_level,h.law_category,h.article_count?`${c(h.article_count)} \u689D`:"",h.law_modified_date?`\u7570\u52D5 ${Nt(h.law_modified_date)}`:""].filter(Boolean).map(Je=>`<span>${r(Je)}</span>`).join(""),it=h.law_url?`<a class="btn btn-secondary btn-sm" href="${r(h.law_url)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",Dt=!O&&h.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${r(h.law_histories)}</div>
        </details>`:"",$s=O?`<span class="badge badge-mono">${r(M)}</span>`:"",He=!O&&K.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",lt=O?`${h.law_name||h.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${M}`:h.law_name||h.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return $(lt,`<div class="judgment-dialog-meta">
        <span class="badge ${h.source_type==="order"?"badge-warn":"badge-info"}">${r(Te)}</span>
        ${$s}
        ${rt}
      </div>
      <div class="judgment-dialog-source">${r([tt,Ge].filter(Boolean).join(" \xB7 "))}</div>
      ${Le?`<div class="law-dialog-warning">${Le}</div>`:""}
      ${Dt}
      ${He}
      <div class="law-dialog-articles">${pe||`<div class="report-empty-inline">${O?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${it}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},D=(h,S)=>{let M=h?.querySelector(`#${S}`),O=Ui(M?.value||"");if(!O){P("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),M?.focus();return}let K=[...h?.querySelectorAll("[data-article-no]")||[]].find(pe=>pe.dataset.articleNo===O);if(!K){P(`\u627E\u4E0D\u5230\u7B2C ${O} \u689D\u3002`,"warn");return}K.scrollIntoView({behavior:"instant",block:"center"}),K.classList.add("is-jump-target"),window.setTimeout(()=>K.classList.remove("is-jump-target"),2400)},ce=async(h,S="",M="")=>{if(!re||!h)return;let O=++vs;re.open||re.showModal(),he(),re.innerHTML=$(M?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${r([h,M].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let K=await W.lawDetail(h,S,"",M);if(t||O!==vs)return;re.innerHTML=_(K,M)}catch(K){if(t||O!==vs)return;re.innerHTML=$("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(K.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};re?.addEventListener("click",h=>{let S=h.target.closest('[data-action="jump-law-article"]');if(S){D(re,S.dataset.jumpInput||"rag-law-article-jump");return}if(h.target.closest('[data-action="close-law-source"]')){re.close();return}let M=re.getBoundingClientRect();(h.clientX<M.left||h.clientX>M.right||h.clientY<M.top||h.clientY>M.bottom)&&re.close()}),re?.addEventListener("keydown",h=>{!h.target.matches(".law-jump-input")||h.key!=="Enter"||(h.preventDefault(),D(re,h.target.id))}),ee?.addEventListener("click",h=>{let S=h.target.closest('[data-action="open-law-source"]');if(S){ce(S.dataset.lawKey||"",S.dataset.sourceType||"",S.dataset.articleNo||"");return}if(h.target.closest('[data-action="close-parquet-judgment"]')){ee.close();return}let M=ee.getBoundingClientRect();(h.clientX<M.left||h.clientX>M.right||h.clientY<M.top||h.clientY>M.bottom)&&ee.close()}),Y.addEventListener("click",h=>{let S=h.target.closest(".rag-process-toggle");if(S){let O=S.closest(".rag-process"),K=S.getAttribute("aria-expanded")==="true";Un(O,!K);return}let M=h.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(M){if(M.dataset.action==="open-law-source"){ce(M.dataset.lawKey||"",M.dataset.sourceType||"",M.dataset.articleNo||"");return}Ns(M.dataset.jid||"")}}),Y.addEventListener("keydown",h=>{if(h.key!=="Enter"&&h.key!==" ")return;let S=h.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!S||S.closest("a, button"))){if(h.preventDefault(),S.dataset.action==="open-law-source"){ce(S.dataset.lawKey||"",S.dataset.sourceType||"",S.dataset.articleNo||"");return}Ns(S.dataset.jid||"")}});let oe=async(h,{fresh:S=!1,source:M="hero"}={})=>{let O=h.trim();if(!O){P("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),(M==="followup"?fe:A).focus();return}(S||!f)&&(g=null,v=[],Y.innerHTML="",Ie());let K=++d,pe=()=>t||K!==d,Le=o;u=O,w(!0),V(),M==="followup"?(fe.value="",G()):(A.value="",I());let{answerElement:Te}=Ee(O,md(O,p)),ot=p?null:pd(Te);p?(At(null),sa()):(bt(),At(null)),je(F,!0,"\u6AA2\u7D22\u4E2D\u2026"),je(U,!0,"\u6AA2\u7D22\u4E2D\u2026");let tt=null,Ge="",rt=He=>{if(pe()||!He?.partial)return;let lt=Te.querySelector(".answer-body");if(!lt)return;tt=He,Ge=String(He.answer||""),lt.innerHTML=Yi(He),ot?.collapse?.();let Je=Te.querySelector(".answer-head-title");Je&&(Je.textContent=He.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},it=He=>{if(pe()||!He||!tt?.streaming)return;Ge+=He;let lt=Te.querySelector("[data-partial-answer]");lt&&(lt.textContent=Ge)},Dt=()=>{if(pe()||!tt?.streaming)return;Ge="";let He=Te.querySelector("[data-partial-answer]");He&&(He.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")},$s=He=>{if(pe())return;let lt=Te.querySelector(".answer-body");if(!lt)return;let Je=lt.querySelector("[data-summary-queue]");Je||(Je=document.createElement("div"),Je.className="answer-notice",Je.dataset.summaryQueue="true",lt.appendChild(Je));let De=Number(He.position||0),zt=Number(He.eta_s||0),qt=He.lane==="summary"?"\u6458\u8981":"\u6AA2\u7D22";Je.textContent=`${qt}\u6392\u968A\u4E2D\uFF1A\u524D\u9762 ${De} \u4F4D\uFF0C\u9810\u4F30\u7D04 ${Math.round(zt)} \u79D2\u3002`};try{let He=p?await W.rag(O,{testMode:p}):await W.ragStream(O,{onStep:Je=>{pe()||ot?.step(Je)},onPartial:rt,onQueued:$s,onToken:it,onTokenReset:Dt});if(pe())return;bt();let lt=ot?.finish(!0)||"";if(Te.innerHTML=Ji(O,He,lt),He.pipeline_flow||od(He).then(()=>{if(pe()||!He.pipeline_flow)return;let Je=Te.querySelector(".answer-body");if(!Je||Je.querySelector(".rag-wf-card"))return;let De=Ta(He.pipeline_flow,{serverDurationMs:Number(He.duration_ms)||0,embedded:!0});De&&Je.insertAdjacentHTML("beforeend",De)}),He.test_run?.run_id?await Ga(He.test_run.run_id):At(null),await ue(O,He,Le,K),pe())return;R()}catch(He){if(pe())return;bt();let lt=ot?.finish(!1)||"";Te.innerHTML=Sd(He,lt),R(),P(He.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{pe()||(bt(),je(F,!1),je(U,!1))}};x.addEventListener("submit",h=>{h.preventDefault(),oe(A.value,{fresh:!0,source:"hero"})}),Se.addEventListener("submit",h=>{h.preventDefault(),oe(fe.value,{fresh:!1,source:"followup"})}),A.addEventListener("input",I),A.addEventListener("keydown",h=>{h.key==="Enter"&&!h.shiftKey&&!h.isComposing&&(h.preventDefault(),x.requestSubmit())}),fe.addEventListener("input",G),fe.addEventListener("keydown",h=>{h.key==="Enter"&&!h.shiftKey&&!h.isComposing&&(h.preventDefault(),Se.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",h=>{let S=h.target.closest("[data-question]");S&&(A.value=S.dataset.question,I(),x.requestSubmit())}),e.addEventListener("click",async h=>{h.target.closest('[data-rag-action="refresh-models"]')&&await _e()}),te.addEventListener("click",async h=>{let S=h.target.closest("[data-rag-toggle]");if(S){let Te=S.closest(".rag-library-section").classList.toggle("is-collapsed");S.setAttribute("aria-expanded",String(!Te));return}let M=h.target.closest("[data-rag-action]"),O=M?.dataset.ragAction||"";if(O==="new-chat"){ft();return}if(O==="open-history-menu"){Qe(M,M.dataset.historyId);return}if(O==="toggle-pin"){await We(M.dataset.historyId);return}if(O==="select-project"){Ve(M.dataset.projectId||"");return}if(O==="show-project-form"){at();return}if(O==="cancel-project"){jt();return}if(O==="more-recent"){l+=12,Ie();return}if(O==="clear-project"){Ve("");return}let K=h.target.closest("[data-history-open]");if(!K)return;let pe=s.find(Le=>String(Le.id)===String(K.dataset.historyId));pe&&(o=String(pe.project_id||""),Ie(),!Be(pe)&&(g=null,v=[],oe(pe.title,{fresh:!0,source:"history"})))}),te.addEventListener("submit",async h=>{let S=h.target.closest('[data-rag-form="project"]');S&&(h.preventDefault(),await nt(S))}),$e.addEventListener("click",N),document.addEventListener("click",C),document.addEventListener("keydown",z),window.addEventListener("scroll",J,{capture:!0,passive:!0}),window.addEventListener("resize",B),T.addEventListener("click",async()=>{if(!s.length){P("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await Yr(),await se(),P("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),I(),await Promise.allSettled([Re(),se(),ct(),Ze()]),await Ua();let X="";try{X=window.sessionStorage.getItem("judgment.pending_question")||"",window.sessionStorage.removeItem("judgment.pending_question")}catch{X=""}return!X&&typeof window.__judgmentPendingQuestion=="string"&&(X=window.__judgmentPendingQuestion),delete window.__judgmentPendingQuestion,X=String(X||"").trim().slice(0,500),X&&A&&(A.value=X,I(),window.setTimeout(()=>{t||oe(X,{fresh:!0,source:"home"})},40)),()=>{t=!0,bt(),B(),document.removeEventListener("click",C),document.removeEventListener("keydown",z),window.removeEventListener("scroll",J,{capture:!0}),window.removeEventListener("resize",B),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",et),u&&Y.setAttribute("data-last-question",u)}}var ar={};Zt(ar,{render:()=>Lu});var Vn=new Set(["legal_index_versions","judgment_import","index_versions"]),Xi=new Map,Kn=new Set,Yn=new Set;function Jn(e){let t=Number(e);if(!Number.isFinite(t)||t<0)return"\u2014";if(t<60)return`${Math.round(t)} \u79D2`;let s=Math.floor(t/60),a=Math.round(t%60);if(s<60)return`${s} \u5206 ${a} \u79D2`;let n=Math.floor(s/60),i=s%60;if(n<24)return`${n} \u5C0F\u6642 ${i} \u5206`;let o=Math.floor(n/24),l=n%24;return`${o} \u5929 ${l} \u5C0F\u6642`}var Md={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},partial:{label:"\u90E8\u5206\u5B8C\u6210",tone:"warn"},update:{label:"\u66F4\u65B0",tone:"warn"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"},provided:{label:"\u5916\u90E8\u63D0\u4F9B",tone:"info"}},Xn=["download","parquet","postgres","qdrant"],Ld={download:"\u4E0B\u8F09",parquet:"Parquet",postgres:"PostgreSQL",qdrant:"Qdrant"},jd={judgment:{download:["download"],parquet:["raw_parquet","extract"],postgres:["postgres"],qdrant:["qdrant"]},law:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]},order:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]}},Zi={complete:"\u5B8C\u6210",incomplete:"\u672A\u5B8C\u6210",processing:"\u8655\u7406\u4E2D",empty:"\u7121\u8CC7\u6599",not_applicable:"\u5DF2\u53D6\u4EE3"},eo={complete:"is-green",incomplete:"is-red",processing:"is-gray",empty:"is-empty",not_applicable:"is-empty"};var Ct=new Map,Pt="",ms="",to={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},so={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Td={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"};var ao={law_download:"law",order_download:"order",judgment_download:"judgment"},no={law_download:"\u6CD5\u898F\u4E0B\u8F09",order_download:"\u547D\u4EE4\u4E0B\u8F09",judgment_download:"\u5224\u6C7A\u4E0B\u8F09"},Nd={law_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",order_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",judgment_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u5224\u6C7A RAR \u55CE\uFF1F\uFF08\u4E0D\u6703\u81EA\u52D5\u532F\u5165 PostgreSQL \u6216\u5EFA\u7ACB Qdrant \u7D22\u5F15\uFF09"},Ed={law_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u6CD5\u898F RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",order_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u547D\u4EE4 RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",judgment_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u53EA\u4E0B\u8F09\u5224\u6C7A RAR\u3002PostgreSQL\uFF0FParquet \u532F\u5165\u8207 Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\u300C\u5224\u6C7A\u532F\u5165\u300D\u6216\u5B8C\u6574\u8CC7\u6599\u66F4\u65B0\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_import:"\u6D41\u7A0B\u7BC4\u570D\uFF1ARAR \u2192 \u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD \u2192 \u91D1\u878D\u6CD5\u898F\u7BE9\u9078 \u2192 PostgreSQL\u3002Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_parquet:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5F9E PostgreSQL \u532F\u51FA\u67E5\u8A62\u7528 Parquet \u5FEB\u7167\uFF1B\u4E0D\u5BEB\u5165 Qdrant\uFF0FIndexedDB\u3002",index_versions:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5EFA\u7ACB\u4E26\u9A57\u8B49\u65B0\u7684 Qdrant collection\uFF0C\u5B8C\u6210\u5F8C\u539F\u5B50\u5207\u63DB alias\uFF1BIndexedDB \u4E0D\u53C3\u8207\u3002"};function os(e){return Md[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function _t(e,t){let s=os(e);return`<span class="badge ${to[s.tone]||to.idle}"><span class="status-dot ${so[s.tone]||so.idle}"></span>${r(t||s.label)}</span>`}function gt(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function ro(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":c(e)}function oo(e){return e&&e.color?String(e.color):"var(--accent)"}function Zn(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return["skipped","pending","idle"].includes(e.status)?"\u2014":s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${qe(s)} / ${qe(a)}`:qe(s):a?`${c(s)} / ${c(a)} ${t}`:`${c(s)} ${t}`}function gs(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${r(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function Rd(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},n=e.raw_backups||{},i=n.totals||{},o=e.state||{},l=e.capabilities||{},u=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",d=t.status==="operational",g=s.status==="operational",v=a.available!==!1,f=n.available!==!1,p=g?`${c(s.indexed)} / ${c(s.total)}`:_t(s.status||"unavailable"),b=g?`${gt(s.percent)} \xB7 \u5C1A\u9918 ${c(s.remaining)} \u7B46`:r(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),y=v?`${c(a.unprocessed)} / ${c(a.total)}`:_t("unavailable"),k=v?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${qe(a.unprocessed_bytes)} \u5F85\u8655\u7406`:r(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${Ut(Wd(e))}
    ${gs("\u8655\u7406\u72C0\u614B",_t(e.status||"unknown"),`${r(u)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${gs("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",r(y),k)}
    ${gs("\u539F\u59CB\u8CC7\u6599\u5099\u4EFD",f?`${c(n.count)} \u6A94`:_t("unavailable"),f?`\u5171 ${c(i.row_count)} \u7B46 \xB7 ${qe(i.compressed_bytes)}`:r(n.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB\u8CC7\u6599\u5099\u4EFD\u3002"))}
    ${gs("PostgreSQL \u5224\u6C7A",d?c(t.judgment_count):_t("unavailable"),d?`\u6CD5\u898F ${ro(t.law_count)} \xB7 \u547D\u4EE4 ${ro(t.order_count)}`:r(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${gs("Qdrant \u7D22\u5F15",p,b)}
    ${gs("\u72C0\u614B\u6A94",_t(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${r(be(o.updated_at))}`:r(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${gs("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?r(l.start_blocked_reason):`\u672A\u8655\u7406 ${c(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${c(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${c(l.external_processes)} \u500B`:""}`)}
  </div>`}function Cd(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let n=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${r(o.color||"var(--accent)")}" title="${r(`${o.label} ${de(o.duration_ms)} (${gt(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${r(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${r(o.label)}</span>
        <span class="mono">${de(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${gt(o.percent)}</span>
        ${_t(o.status)}
      </div>`).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section">
      <div class="processing-timeline-label">
        <span>${r(t.label||"\u968E\u6BB5\u8017\u6642")}</span>
        <span class="mono">\u7E3D\u8A08 ${de(t.total_ms)}</span>
      </div>
      <div class="processing-stack" role="img" aria-label="\u968E\u6BB5\u8017\u6642\u6BD4\u4F8B">${n}</div>
      <div class="processing-legend">${i}</div>
    </div>
  </section>`}function Pd(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let n=t.map(i=>{let o=s.get(i.branch)||Td[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${r(o)}</span>
          <strong>${r(i.title||"\u8655\u7406")}</strong>
          ${_t(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${r(be(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?de(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${r(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${n}</div></div>
  </section>`}function Id(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>Pe({tone:s.tone||"info",title:s.title,text:r(s.message||"")})).join("")}</div>`:""}function lo(e,t){if(e==="law"||e==="order")return t==="qdrant"?"legal_index_versions":`${e}_download`;if(e==="judgment"){if(t==="download")return"judgment_download";if(t==="parquet"||t==="postgres")return"judgment_import";if(t==="qdrant")return"index_versions"}return""}function er({month:e,year:t,monthNo:s,stageOrder:a,stageLabels:n,stageStatuses:i,overall:o,active:l,workflowForStage:u,stageProgress:d=null,variant:g="legacy"}){let v=i||{},f=g==="index"||g==="import",p=String(e?.month||`${t}${String(s).padStart(2,"0")}`),b=e?.month_label||`${t}-${String(s).padStart(2,"0")}`,y=U=>f&&U==="processing"?"\u57F7\u884C\u4E2D":Zi[U]||Zi.empty,k=U=>{let E=v[U]||"empty";if(g!=="index"||typeof d!="function"||!(E==="processing"||U==="qdrant"&&E==="incomplete"))return null;let T=Number(d(U,p,E));return Number.isFinite(T)?Math.max(0,Math.min(100,T)):null},j=a.map(U=>{let E=v[U]||"empty",L=k(U),T=U==="qdrant"&&E==="incomplete"&&L!==null&&L>0,te=T?"\u5DF2\u8655\u7406":y(E),le=!T&&L!==null&&L>0?` ${L.toFixed(1)}%`:"";return`${n[U]||U}\uFF1A${te}${le}`}).join(" \xB7 "),x=(e?.versions||[]).map(U=>U.version_code).filter(Boolean),A=[...new Set([...e?.files||[],...e?.local_files||[],...e?.imported_files||[]])].filter(Boolean),F=x.length?` \xB7 \u7248\u672C ${x.join("\u3001")}`:A.length?` \xB7 ${A.join("\u3001")}`:"",ne=e?.detail?` \xB7 ${e.detail}`:"",Y=e?`${b} \xB7 ${j}${F}${ne}`:`${b} \xB7 \u7121\u8CC7\u6599`,Se=f?o==="empty"?"is-empty":"is-neutral":eo[o]||"is-empty",fe=a.map(U=>{let E=v[U]||"empty",L=E==="incomplete"?u(U):"",T=L?"button":"span",te=L?` type="button" data-timeline-workflow="${r(L)}"`:"",le=k(U),Q=U==="qdrant"&&E==="incomplete"&&le!==null&&le>0,me=E==="processing"&&le!==null?` ${le.toFixed(1)}%`:"",ye=Q?"\u5DF2\u8655\u7406":y(E),H=E==="complete"?"is-complete":E==="processing"?"is-running":Q?"is-partial":E==="incomplete"?"is-incomplete":"is-empty",ve=f?["index-month-block","processing-month-stage",`is-${U}`,H,L?"is-actionable":""]:["processing-month-stage",eo[E]||"is-empty",L?"is-actionable":""],Z=E==="processing"&&le!==null?` style="--stage-progress:${le.toFixed(1)}%"`:"";return`<${T} class="${ve.filter(Boolean).join(" ")}"${te}${Z} title="${r(`${n[U]||U}\uFF1A${ye}${me}${L?"\uFF08\u9EDE\u9078\u524D\u5F80\u8655\u7406\uFF09":""}`)}" aria-label="${r(`${b} ${n[U]||U} ${ye}${me}${L?"\uFF0C\u9EDE\u9078\u524D\u5F80\u8655\u7406":""}`)}"></${T}>`}).join("");return f?`<td class="judgment-month index-month index-month-are processing-month ${Se}${l?" is-current":""}" data-month="${r(p)}" title="${r(Y)}" aria-label="${r(Y)}"${l?' aria-current="true"':""}>
    <span class="index-month-number">${s}</span>
    <span class="index-month-blocks">${fe}</span>
  </td>`:`<td class="judgment-month import-month processing-month${l?" is-current":""} is-${r(o)}" data-month="${r(p)}" title="${r(Y)}" aria-label="${r(Y)}"${l?' aria-current="true"':""}>
    <span class="processing-month-number">${s}</span>
    <span class="processing-month-stages">${fe}</span>
  </td>`}function Dd(e,t,s,a,n){return er({month:t,year:s,monthNo:a,stageOrder:Xn,stageLabels:Ld,stageStatuses:t?.stages||{},overall:t?.overall||"empty",active:!!(t?.active||t?.overall==="processing"),workflowForStage:i=>lo(e.key,i),stageProgress:n,variant:"index"})}function Od(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=Number(s?.incomplete)||0,o=Number(s?.superseded)||0,l=a>0?(n+o)/a*100:null,u=["download","prepared","indexed"],d=0,g=0;for(let f of t){let p=f?.stages||{};for(let b of u){let y=p[b];!y||y==="empty"||y==="not_applicable"||(d+=1,y==="complete"&&(g+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(n),"\u5DF2\u5B8C\u6210 D\uFF0FP\uFF0FI \u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(i+(Number(s?.processing)||0)),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u5DF2\u53D6\u4EE3\u6708\u4EFD",c(o),"\u820A\u7248\u672C\u5DF2\u88AB\u76EE\u524D\u7248\u672C\u53D6\u4EE3\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",gt(l),"\u5B8C\u6210\u6216\u5DF2\u53D6\u4EE3\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c(g)} / ${c(d)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([f,p,b])=>`<span class="index-runtime-metric" title="${r(b)}"><span>${r(f)}</span><strong>${r(p)}</strong></span>`).join("")}</div>`}function Bd(e,t,s,a){let n=Number(e?.total_months)||t.length||0,i=Number(s?.complete)||0,o=Number(s?.incomplete)||0,l=Number(s?.processing)||0,u=Number(a?.gray)||0,d=n>0?i/n*100:null,g=0,v=0;for(let p of t){let b=p?.import_stages||{};for(let y of["extract","raw_parquet","filter","postgres"]){let k=b[y];!k||k==="empty"||(g+=1,k==="complete"&&(v+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(i),"\u56DB\u500B\u532F\u5165\u968E\u6BB5\u90FD\u5B8C\u6210\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(o+l),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\uFF08\u542B\u8655\u7406\u4E2D\uFF09\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",c(u),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(n),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",gt(d),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c(v)} / ${c(g)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([p,b,y])=>`<span class="index-runtime-metric" title="${r(y)}"><span>${r(p)}</span><strong>${r(b)}</strong></span>`).join("")}</div>`}function Fd(e,{titleSuffix:t="\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868"}={}){let s=`${r(e?.label||"\u6CD5\u898F\uFF0F\u547D\u4EE4")} ${r(t)}`,a=Array.isArray(e?.months)?e.months:[];if(!a.length)return`<section class="report-card processing-card import-files-card law-index-timeline-card">
      <div class="side-card-head">
        <span class="side-card-title">${m(e?.key==="order"?"file":"layers",14)}${s}</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u7121\u4E0B\u8F09\u7248\u672C\u6216\u7D22\u5F15\u7D00\u9304\u3002</div>
    </section>`;let n=new Map(a.map(f=>[String(f.month),f])),i=[...new Set(a.map(f=>f.year))].sort((f,p)=>String(p).localeCompare(String(f))),o=["download","prepared","indexed"],l=e.stage_labels||{download:"D \u4E0B\u8F09\u7248\u672C",prepared:"P \u8CC7\u6599\u5C31\u7DD2",indexed:"I \u7D22\u5F15\u8986\u84CB"},u=e.summary||{},d=e.current||{},g=i.map(f=>{let p=Array.from({length:12},(b,y)=>{let k=y+1,j=`${f}${String(k).padStart(2,"0")}`,x=n.get(j);return er({month:x,year:f,monthNo:k,stageOrder:o,stageLabels:l,stageStatuses:x?.stages||{},overall:x?.overall||"empty",active:!!x?.active,workflowForStage:A=>A==="indexed"?"legal_index_versions":`${e.key}_download`,variant:"index"})}).join("");return`<tr><th scope="row">${r(f)}</th>${p}</tr>`}).join(""),v=d.month?`<div class="index-current-row">
        <span class="badge badge-info">${m("activity",11)}${r(d.label||"\u76EE\u524D\u7248\u672C")}</span>
        <strong class="mono">${r(d.month_label||Pa(d.month))}</strong>
        <span class="mono">${r(d.file||"\u2014")}</span>
        <span class="index-current-copy">${r(d.detail||"")}</span>
      </div>`:"";return`<section class="report-card processing-card import-files-card law-index-timeline-card" data-law-index-timeline="${r(e.key||"")}">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m(e.key==="order"?"file":"layers",14)}${s}</span>
      ${Od(e,a,u)}
    </div>
    ${v}
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
        <span><i class="processing-timeline-swatch is-hollow-state"></i>\u672A\u5B8C\u6210</span>
        <span><i class="processing-timeline-swatch is-progress-state"></i>\u57F7\u884C\u4E2D\uFF08\u9032\u5EA6\u689D\uFF09</span>
        <span><i class="processing-timeline-swatch is-empty"></i>\u7121\u8CC7\u6599\uFF0F\u5DF2\u53D6\u4EE3</span>
      </div>
      <div class="judgment-months-scroll">
        <table class="judgment-months-table index-months-table processing-months-table">
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(f,p)=>`<th scope="col">${p+1}</th>`).join("")}</tr></thead>
          <tbody>${g}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">D\uFF1A\u4E0B\u8F09\u7248\u672C\uFF1BP\uFF1Araw Parquet + PostgreSQL \u5C31\u7DD2\uFF1BI\uFF1Aactive \u7D22\u5F15\u8986\u84CB\uFF08\u7531\u6CD5\u898F\uFF0F\u547D\u4EE4\u7D22\u5F15\u6D41\u7A0B\u7DAD\u8B77\uFF09\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u672A\u5B8C\u6210\uFF0C\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u6216\u5DF2\u53D6\u4EE3\u3002\u820A\u7248\u672C\u986F\u793A\u300C\u5DF2\u53D6\u4EE3\u300D\uFF0C\u4E0D\u9700\u91CD\u5EFA\u7D22\u5F15\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u7DE8\u865F\u3001\u4E0B\u8F09\u6642\u9593\u8207\u7B46\u6578\u3002</p>
    </div>
  </section>`}function Hd(e,t={}){let s=Array.isArray(e)?e:[];return s.length?`<div class="law-index-timelines">${s.map(a=>Fd(a,t)).join("")}</div>`:""}function co({activeMonth:e,activeArchive:t,activePhase:s="",processingMonth:a="",processingArchive:n="",stageLabels:i={}}){if(!e||!t)return"";let o=`${String(e).slice(0,4)}-${String(e).slice(4,6)}`,l=i[s]||(s?"\u6E96\u5099\u4E2D":""),u=`${String(a||"").slice(0,4)}-${String(a||"").slice(4,6)}`,d=!!a&&(a!==e||n!==t);return`<span class="badge badge-info">${m("activity",11)}\u76EE\u524D\u532F\u5165</span>
    <strong class="mono">${r(o)}</strong>
    <span class="mono">${r(t)}</span>
    ${l?`<span class="badge badge-neutral">${r(l)}</span>`:""}
    ${d?`<span class="processing-current-processing">
            <span class="faint">\u8655\u7406\u4E2D</span>
            <strong class="mono">${r(u)}</strong>
            <span class="mono">${r(n||"\u2014")}</span>
          </span>`:""}`}function zd(e,t,s,a){let n=[];for(let i=1;i<=12;i+=1){let o=`${t}${String(i).padStart(2,"0")}`;n.push(Dd(e,s.get(o),t,i,a))}return`<tr><th scope="row">${t}</th>${n.join("")}</tr>`}function Gd(e){let t=e?.models||{};return[["Embedding",t.embedding],["Rerank",t.rerank]].filter(([,s])=>s&&(s.label||s.model)).map(([s,a])=>{let n=a.label||[a.host,a.model].filter(Boolean).join(" ")||"\u2014",i=[`${s} \u4E3B\u6A5F\u8207\u6A21\u578B\uFF1A${n}`,a.url?`\u7AEF\u9EDE\uFF1A${a.url}`:"",s==="Rerank"&&a.enabled===!1?"RAG_RERANK_ENABLED=false":""].filter(Boolean).join(" \xB7 ");return`<span class="processing-timeline-model" title="${r(i)}">${s} <strong class="mono">${r(n)}</strong>${s==="Rerank"&&a.enabled===!1?' <span class="faint">\u672A\u555F\u7528</span>':""}</span>`}).join("")}function Ud(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=a>0?n/a*100:null,o=t.reduce((g,v)=>{let f=v?.stages||{};return g+Xn.filter(p=>!!f[p]&&f[p]!=="empty"&&f[p]!=="not_applicable").length},0),l=t.reduce((g,v)=>{let f=v?.stages||{};return g+Xn.filter(p=>f[p]==="complete").length},0),u=(Number(s?.incomplete)||0)+(Number(s?.processing)||0);return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(n),"\u5DF2\u5B8C\u6210\u5168\u90E8\u56DB\u500B\u968E\u6BB5\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(u),"\u4ECD\u6709\u81F3\u5C11\u4E00\u500B\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",c(s?.update||0),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",gt(i),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c(l)} / ${c(o)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([g,v,f])=>`<span class="index-runtime-metric" title="${r(f)}"><span>${r(g)}</span><strong>${r(v)}</strong></span>`).join("")}</div>`}function Qd(e,t){let s=new Map((Array.isArray(e?.workflows)?e.workflows:[]).map(g=>[String(g.id||""),g])),a=t.key==="judgment"?"index_versions":"legal_index_versions",i=s.get(a)?.index_runtime||{},o=g=>{if(g==null||g==="")return null;let v=Number(g);return Number.isFinite(v)?Math.max(0,Math.min(100,v)):null},l=new Map((Array.isArray(i.months)?i.months:[]).map(g=>[String(g?.month||""),o(g?.percent)])),u=new Map(Object.entries(i.active_coverage||{}).map(([g,v])=>[String(g),o(v?.percent)])),d=(g,v)=>{let f=s.get(String(g||""));if(!f)return null;let p=f.progress||{},b=Array.isArray(p.stages)?p.stages:[];for(let y of v){let k=b.find(x=>String(x.key)===y),j=o(k?.percent);if(j!==null)return j}return o(p.percent)};return(g,v,f)=>{let p=String(v||"");if(g==="qdrant"){let k=l.get(p),j=u.get(p);if(f==="processing"){if(k!==null&&k>0)return k;if(j!==null&&j>0)return j}else return f==="incomplete"?k!==null&&k>0?k:j!==null&&j>0?j:0:null}let b=lo(t.key,g);if(!b)return null;let y=(jd[t.key]||{})[g]||[g];return d(b,y)}}function Jd(e){let t=Array.isArray(e.file_timelines)?e.file_timelines:[];return t.length?`<div class="processing-timeline-overview">${t.map(s=>{let a=Array.isArray(s.months)?s.months:[],n=new Map(a.map(g=>[String(g.month||""),g])),i=[...new Set(a.map(g=>Number(g.year)))].filter(g=>Number.isFinite(g)).sort((g,v)=>v-g),o=s.summary||{},l=s.current||null,u=Gd(s),d=Qd(e,s);return`<section class="report-card processing-card import-files-card processing-timeline-card" data-processing-timeline="${r(s.key||"")}">
        <div class="side-card-head index-runtime-head">
          <span class="side-card-title">${m(s.icon||"activity",14)}${r(s.title||`${s.label||""}\u8655\u7406\u6642\u9593\u8868`)}</span>
          ${Ud(s,a,o)}
        </div>
        ${u?`<div class="index-runtime-summary">${u}</div>`:""}
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
            <span><i class="processing-timeline-swatch is-hollow-state"></i>\u672A\u5B8C\u6210</span>
            <span><i class="processing-timeline-swatch is-partial-state"></i>\u5DF2\u8655\u7406\uFF08\u6DE1\u8272\uFF09</span>
            <span><i class="processing-timeline-swatch is-progress-state"></i>\u57F7\u884C\u4E2D\uFF08\u9032\u5EA6\u689D\uFF09</span>
            <span><i class="processing-timeline-swatch is-empty"></i>\u7121\u8CC7\u6599</span>
          </div>
          ${a.length?`<div class="judgment-months-scroll">
                  <table class="judgment-months-table index-months-table processing-months-table">
                    <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(g,v)=>`<th scope="col">${v+1}</th>`).join("")}</tr></thead>
                    <tbody>${i.map(g=>zd(s,g,n,d)).join("")}</tbody>
                  </table>
                </div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u3002</div>'}
          <p class="judgment-months-hint">${s.key==="judgment"?"\u5224\u6C7A\u4EE5\u88C1\u5224\u66F8\u6708\u4EFD\u986F\u793A\u3002":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u4EE5\u4F86\u6E90\u7248\u672C\u6708\u4EFD\u986F\u793A\u3002"}\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA\u4E0B\u8F09\u3001Parquet\u3001PostgreSQL\u3001Qdrant \u56DB\u500B\u968E\u6BB5\uFF1B\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u672A\u5B8C\u6210\uFF0CQdrant \u4E4B\u524D\u5DF2\u8655\u7406\u4F46\u5C1A\u672A\u5B8C\u6210\u6642\u4EE5\u6DE1\u6A59\u8272\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\uFF0C\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u6216\u8272\u584A\u53EF\u67E5\u770B\u5404\u968E\u6BB5\u72C0\u614B\u8207\u9032\u5EA6\u3002</p>
        </div>
      </section>`}).join("")}</div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u8655\u7406\u6642\u9593\u8868\u3002</div>'}function Wd(e){return e.judgment_stats&&typeof e.judgment_stats=="object"?e.judgment_stats:{judgment_total:(e.raw_backups?.totals||{}).row_count,financial_total:(e.database||{}).judgment_count}}function io(e,t=new Set){return`${Id(e)}
    ${Rd(e)}
    ${Jd(e)}
    ${Cd(e)}
    ${Pd(e)}`}function Vd(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${Pe({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:r(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${r(be(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${m("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}function Kd(e,t){if(e.nodeType!==t.nodeType||e.nodeName!==t.nodeName){e.replaceWith(t.cloneNode(!0));return}if(e.nodeType===Node.TEXT_NODE){e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue);return}if(e.nodeType===Node.ELEMENT_NODE){for(let s of[...e.attributes])t.hasAttribute(s.name)||e.removeAttribute(s.name);for(let s of[...t.attributes])e.getAttribute(s.name)!==s.value&&e.setAttribute(s.name,s.value);t.hasAttribute("data-preserve-children")||uo(e,t)}}function uo(e,t){let s=[...e.childNodes],a=[...t.childNodes],n=Math.min(s.length,a.length);for(let i=0;i<n;i+=1)Kd(s[i],a[i]);for(let i=n;i<s.length;i+=1)s[i].remove();for(let i=n;i<a.length;i+=1)e.appendChild(a[i].cloneNode(!0))}function is(e,t){let s=document.createElement("template");s.innerHTML=t,uo(e,s.content)}var po={overview:"activity",law_download:"layers",order_download:"file",judgment_download:"download",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function Yd(e){let s=(Array.isArray(e.workflows)?e.workflows:[]).map(n=>{let i=n.active_run||null,o=i||n.last_run||null;return{...n,activeRun:i,lastRun:o,status:i?i.status||"running":n.update_available?"update":o?.status||"idle"}}),a=s.find(n=>n.id==="judgment_parquet");return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...s.filter(n=>n.id!=="judgment_parquet"),...a?[a]:[]]}function Wn(e,t){let s=Yd(e),a=new Set(["law_download","judgment_download","normalize_courts"]);return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${s.map(n=>{let i=n.id===t,o=po[n.id]||"terminal",l=a.has(n.id)?'<div class="status-tab-divider" role="separator" aria-hidden="true"></div>':"",u=Number(n.pending_count)||0,d=Number(n.update_count)||(n.update_available?u:0),g=n.update_available&&d>0&&!n.activeRun,v=[n.update_message||`${n.update_origin||"\u66F4\u65B0\u5075\u6E2C"}\u627E\u5230 ${c(d)} \u9805\u53EF\u66F4\u65B0\u5167\u5BB9`,n.update_origin?`\u4F86\u6E90\uFF1A${n.update_origin}`:"",n.update_mechanism?`\u6A5F\u5236\uFF1A${n.update_mechanism}`:""].filter(Boolean).join(" \xB7 ");return`${l}<button class="status-tab${i?" is-active":""}" type="button"
            data-processing-workflow="${r(n.id)}"
            ${i?'aria-current="page"':""}>
            <span class="status-tab-icon">${m(o,15)}</span>
            <span class="status-tab-copy">
              <strong>${r(n.label)}</strong>
              <small>${r(n.description||"")}</small>
            </span>
            ${g?`<span class="badge badge-warn badge-mono processing-update-count" title="${r(v)}">${m("refresh",10)}${c(d)}</span>`:_t(n.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${r(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function Xd(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${_t(e.status)}
      <span class="mono">${r(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${r(be(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${de(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${r(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${r(t.log_path)}</strong>`:""}
    </div>
  </div>`}function Ks(e){return`${e.year}-${String(e.month_no).padStart(2,"0")}`}function mo(e){let t={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"},s=e.status||"red";return[Ks(e),t[s]||s,e.latest_fileset_id?`fileset ${e.latest_fileset_id}`:"",e.filename||"",e.local_filename&&e.local_filename!==e.filename?`\u672C\u6A5F\uFF1A${e.local_filename}`:""].filter(Boolean).join(" \xB7 ")}function go(e){if(!e.download_url)return"";let t=Ks(e);return`<a class="judgment-month-download" href="${r(dt(e.download_url))}" target="_blank" rel="noreferrer" title="\u4E0B\u8F09 ${t} \u5224\u6C7A" aria-label="\u4E0B\u8F09 ${t} \u5224\u6C7A">${m("download",11)}</a>`}function Zd(e){let t=e.status||"red";return`<td class="judgment-month is-${r(t)}" data-judgment-month-key="${r(Ks(e))}" title="${r(mo(e))}"><span>${e.month_no}</span>${go(e)}</td>`}function eu(e){return e?.off_hours_enabled===!0}function fo(e){return`\u7DA0\u8272\uFF1A\u6700\u65B0\u7248\u5DF2\u4E0B\u8F09\u5230 raw_rar\uFF1B\u7070\u8272\uFF1A\u672C\u6A5F\u4ECD\u662F\u820A\u7248\uFF0C\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u6703\u66F4\u65B0\uFF1B\u7D05\u8272\uFF1A\u8A72\u6708\u4EFD\u7F3A\u5C11\u5224\u6C7A\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u958B\u555F\u4E0B\u8F09\u9023\u7D50\uFF08${eu(e)?"\u975E API \u6642\u6BB5\u4E5F\u53EF\u4E0B\u8F09\uFF0C\u5EFA\u8B70\u4E00\u6B21\u53EA\u4E0B\u8F09\u4E00\u500B\u6A94\u6848":"\u4E0B\u8F09\u9023\u7D50\u50C5\u5728 00:00\u201306:00 API \u6642\u6BB5\u53EF\u7528"}\uFF09\u3002\u5F85\u88DC\u9F4A\u6708\u4EFD\u6703\u512A\u5148\u4E0B\u8F09\uFF0C\u5168\u90E8\u88DC\u9F4A\u5F8C\u624D\u7531\u6700\u65B0\u6708\u4EFD\u5F80\u56DE\u9A57\u8B49\u65E2\u6709\u6A94\u6848\uFF1B\u4E2D\u65B7\u7684\u4E0B\u8F09\u6703\u4FDD\u7559 .part\uFF0C\u4F3A\u670D\u5668\u652F\u63F4 Range \u6642\u7E8C\u50B3\uFF0C\u5426\u5247\u5F9E\u96F6\u91CD\u65B0\u4E0B\u8F09\u3002\u9996\u6B21\u5B8C\u6574\u540C\u6B65\u53EF\u80FD\u9700\u4E0B\u8F09\u6578\u767E\u500B\u6708\u4EFD\uFF0C\u9810\u8A2D\u975E\u6642\u6BB5\u4E5F\u53EF\u7E8C\u50B3\uFF1B\u56B4\u683C\u6A21\u5F0F\u6703\u5728 00:00\u201306:00 \u4EE5\u5916\u505C\u6B62\u3002`}var tu={completed:"\u5B8C\u6210",window_closed:"API \u6642\u6BB5\u7D50\u675F",deadline:"\u63A5\u8FD1 06:00\uFF0C\u4FDD\u7559\u5F85\u4E0B\u8F09\u6708\u4EFD",verification_window_closed:"API \u6642\u6BB5\u7D50\u675F\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",verification_deadline:"\u63A5\u8FD1 06:00\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",errors:"\u90E8\u5206\u6708\u4EFD\u4E0B\u8F09\u5931\u6557\uFF0C\u4E0B\u6B21\u91CD\u8A66",pending:"\u4ECD\u6709\u5F85\u4E0B\u8F09\u6708\u4EFD",check_only:"\u50C5\u6AA2\u67E5\uFF0C\u672A\u4E0B\u8F09",incremental:"\u589E\u91CF\u6AA2\u67E5\u5B8C\u6210",status_only:"\u50C5\u66F4\u65B0\u6708\u4EFD\u72C0\u614B",running:"\u57F7\u884C\u4E2D"};function bo(e){let t=e?.backfill||{},s=t.verification||{},a=t.last_run||{},n=Number(t.pending_count)||0,i=Number(t.failure_count)||0,o=String(t.resume_from_month||""),l="\u9A57\u8B49\uFF1A\u672A\u958B\u59CB";s.status==="completed"?l="\u9A57\u8B49\u5B8C\u6210":s.next_month?l=`\u9A57\u8B49\u7E8C\u50B3 ${s.next_month}`:s.status==="in_progress"&&(l="\u9A57\u8B49\u9032\u884C\u4E2D");let u=String(a.stop_reason||""),d=u?`\u4E0A\u6B21\u505C\u6B62\uFF1A${tu[u]||u}`:"";return{pending:n,failures:i,resume:o,verificationText:l,lastText:d}}function su(e){let t=bo(e),s=t.pending>0?`\u5F85\u88DC\u9F4A ${c(t.pending)} \u500B\u6708${t.failures>0?`\uFF08${c(t.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708";return`<div class="judgment-backfill" data-judgment-backfill>
    <span class="badge ${t.pending>0?"badge-danger":"badge-ok"}" data-judgment-backfill-pending>${s}</span>
    <span class="badge badge-neutral" data-judgment-backfill-resume ${t.resume&&t.pending>0?"":"hidden"}>\u5F9E ${r(t.resume)} \u7E8C\u50B3</span>
    <span class="badge badge-info" data-judgment-backfill-verification>${r(t.verificationText)}</span>
    <span class="muted" data-judgment-backfill-last ${t.lastText?"":"hidden"}>${r(t.lastText)}</span>
  </div>`}function au(e,t){let s=bo(t),a=e.querySelector("[data-judgment-backfill-pending]");a&&(a.textContent=s.pending>0?`\u5F85\u88DC\u9F4A ${c(s.pending)} \u500B\u6708${s.failures>0?`\uFF08${c(s.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708",a.classList.toggle("badge-danger",s.pending>0),a.classList.toggle("badge-ok",s.pending===0));let n=e.querySelector("[data-judgment-backfill-resume]");if(n){let l=!!s.resume&&s.pending>0;n.hidden=!l,n.textContent=l?`\u5F9E ${s.resume} \u7E8C\u50B3`:""}let i=e.querySelector("[data-judgment-backfill-verification]");i&&(i.textContent=s.verificationText);let o=e.querySelector("[data-judgment-backfill-last]");o&&(o.hidden=!s.lastText,o.textContent=s.lastText)}function tr(){return'<div class="judgment-months-loading"><span class="spinner"></span><span>\u8B80\u53D6\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B\u2026</span></div>'}function nu(e){if(e?.loading&&!e?.months?.length)return tr();if(e?.error&&!e?.months?.length)return Pe({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(e.error)});let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return'<div class="processing-empty">\u5C1A\u672A\u6709\u6708\u4EFD\u72C0\u614B\uFF1B\u8ACB\u5148\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u3002</div>';let s=new Map(t.map(o=>[Ks(o),o])),n=[...new Set(t.map(o=>o.year))].sort((o,l)=>l-o).map(o=>{let l=Array.from({length:12},(u,d)=>{let g=s.get(`${o}-${String(d+1).padStart(2,"0")}`);return g?Zd(g):`<td class="judgment-month is-empty"><span>${d+1}</span></td>`}).join("");return`<tr><th scope="row">${o}</th>${l}</tr>`}).join(""),i=e.summary||{};return`<div class="judgment-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" data-judgment-summary="green">\u6700\u65B0\u7248 ${c(i.green||0)}</span>
      <span class="badge badge-neutral" data-judgment-summary="gray">\u820A\u7248 ${c(i.gray||0)}</span>
      <span class="badge badge-danger" data-judgment-summary="red">\u7F3A\u5931 ${c(i.red||0)}</span>
      <span class="muted" data-judgment-total>\u5171 ${c(e.total_months||t.length)} \u500B\u6708</span>
    </div>
    ${su(e)}
    <div class="judgment-months-scroll">
      <table class="judgment-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(o,l)=>`<th scope="col">${l+1}</th>`).join("")}</tr></thead>
        <tbody>${n}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint" data-judgment-hint>${r(fo(e))}</p>
  </div>`}function ru(e,t){let s=Array.isArray(t?.months)?t.months:[],a=t.summary||{},n={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"};e.querySelectorAll("[data-judgment-summary]").forEach(l=>{let u=l.dataset.judgmentSummary||"";l.textContent=`${n[u]||u} ${c(a[u]||0)}`});let i=e.querySelector("[data-judgment-total]");i&&(i.textContent=`\u5171 ${c(t.total_months||s.length)} \u500B\u6708`),au(e,t);let o=e.querySelector("[data-judgment-hint]");if(o){let l=fo(t);o.textContent!==l&&(o.textContent=l)}for(let l of s){let u=Ks(l),d=e.querySelector(`[data-judgment-month-key="${u}"]`);if(!d)continue;let g=l.status||"red";d.classList.contains(`is-${g}`)||(d.classList.remove("is-green","is-gray","is-red","is-empty"),d.classList.add(`is-${g}`));let v=mo(l);d.title!==v&&(d.title=v);let f=d.querySelector(".judgment-month-download");if(l.download_url){let p=dt(l.download_url);f?f.getAttribute("href")!==p&&(f.href=p):d.insertAdjacentHTML("beforeend",go(l))}else f&&f.remove()}}function iu(e){let t=Array.isArray(e)?e:[];return t.length?`<div class="processing-workflow-history">
    ${t.map(s=>`<div class="processing-workflow-history-row">
          <span class="processing-workflow-history-status">${_t(s.status||"idle")}</span>
          <span class="mono">${r(be(s.started_at))}</span>
          <span class="mono">${r(de(s.duration_ms||0))}</span>
          <span class="processing-workflow-history-message">${r(s.message||"\u2014")}</span>
        </div>`).join("")}
  </div>`:'<div class="processing-workflow-empty">\u5C1A\u7121\u57F7\u884C\u7D00\u9304\u3002</div>'}function ou(e){let t=Array.isArray(e.update_history)?e.update_history:[];if(!t.length)return'<div class="processing-workflow-empty">\u5C1A\u7121\u7248\u672C\u6AA2\u67E5\u7D00\u9304\u3002</div>';let s={up_to_date:["\u5DF2\u662F\u6700\u65B0","badge-ok"],update_available:["\u6709\u66F4\u65B0","badge-warn"],error:["\u6AA2\u67E5\u5931\u6557","badge-danger"]};return`<div class="processing-workflow-history">
    ${t.map(a=>{let[n,i]=s[a.status]||[a.status||"\u672A\u77E5","badge-neutral"],o=a.remote_content_length!=null?qe(a.remote_content_length):"\u2014",l=a.local_version_id?`v${a.local_version_id}`:"\u2014";return`<div class="processing-workflow-history-row">
          <span class="badge ${i}">${r(n)}</span>
          <span class="mono">${r(be(a.checked_at))}</span>
          <span class="mono">\u9060\u7AEF ${r(o)}</span>
          <span class="mono">\u672C\u5730 ${r(l)}</span>
          <span class="processing-workflow-history-message">${r(a.message||"\u2014")}</span>
        </div>`}).join("")}
  </div>`}function ho(e){let t=String(e.key||""),s=os(e.status);return[`data-stage-key="${r(t)}"`,`data-stage-label="${r(e.label||t)}"`,`data-stage-color="${r(oo(e))}"`,`data-stage-status-key="${r(e.status||"idle")}"`,`data-stage-status="${r(s.label)}"`,`data-stage-percent="${r(gt(e.percent))}"`,`data-stage-counts="${r(Zn(e))}"`,`data-stage-duration="${r(Vs(e.duration_ms||0))}"`,`data-stage-contribution="${r(gt(e.contribution_percent))}"`,`data-stage-message="${r(e.message||"")}"`].join(" ")}function lu(e,t=Date.now()){let s=String(e.status||"idle"),a=Number(e.duration_ms)||0,n=Date.parse(e.started_at||"");if(s==="running"&&Number.isFinite(n))return Math.max(a,t-n);if(a>0)return a;let i=Date.parse(e.finished_at||"");return Number.isFinite(n)&&Number.isFinite(i)?Math.max(0,i-n):0}function vo(e){if(e.key!=="filter")return null;let t=Number(e.financial_processed),s=Number(e.financial_matched);return e.financial_processed===null||e.financial_processed===void 0||!Number.isFinite(t)||!Number.isFinite(s)||t<=0?null:{processed:t,matched:s,percent:Math.round(s/t*100)}}function cu(e){let t=String(e.status||"idle"),s=[],a=Number(e.total);if(e.key==="postgres"&&["success","no_change"].includes(t)&&Number.isFinite(a)&&a>0)s.push(`\u7E3D\u8A08 ${c(a)} \u7B46`);else{let i=Zn(e);i!=="\u2014"&&s.push(i)}let n=vo(e);return n&&s.push(`\u91D1\u878D\u4F54\u6BD4 ${n.percent}%`),s.join(" \xB7 ")}function du(e,t){let s=String(e.status||"idle"),a=[],n=(l,u,{always:d=!1}={})=>{let g=u==null?"":String(u).trim();!d&&!g||a.push(`<span class="rag-wf-detail"><span>${r(l)}</span><strong>${r(g||"\u2014")}</strong></span>`)};n("\u72C0\u614B",os(s).label,{always:!0}),n("\u958B\u59CB",e.started_at?be(e.started_at):"\u2014",{always:!0}),n("\u7D50\u675F",e.finished_at?be(e.finished_at):"\u2014",{always:!0}),n("\u8017\u6642",t,{always:!0}),n("\u9032\u5EA6",gt(e.percent),{always:!0});let i=Zn(e);n("\u8CC7\u6599\u91CF",i!=="\u2014"?i:"");let o=vo(e);return o&&(n("\u91D1\u878D\u6848\u4EF6",`${c(o.matched)} \u7B46`),n("\u5168\u90E8\u6848\u4EF6",`${c(o.processed)} \u7B46`),n("\u91D1\u878D\u4F54\u6BD4",`${o.percent}%`)),n("\u6574\u9AD4\u5360\u6BD4",gt(e.contribution_percent)),s==="failed"||s==="stale"?(n("\u539F\u56E0",e.error||e.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002"),n("\u5EFA\u8B70",e.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002")):n("\u8AAA\u660E",e.message),a.join("")}function uu(e){let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${m("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A host/model\u3001Blue-Green \u5EFA\u7F6E\u8207\u5404\u968E\u6BB5\u9032\u5EA6\u3002</div>
    </section>`;let a=new Map(s.map(w=>[String(w.key||""),w])),n=a.get("ollama")||{},i=a.get("qdrant")||{},o=a.get("validate")||{},l=e.index_runtime||{},u=l.summary||{},d=l.copy||{},g=l.current||{},v=l.embedding||{},f=v.selected||{},p=v.active||{},b=Number(l.expected_count||u.total||i.total||0),y=Number(u.indexed??i.current??0),k=b>0?Math.min(100,y/b*100):i.status==="success"?100:0,j=Number(d.total||0),x=Number(d.copied||0),A=j>0?Math.min(100,x/j*100):d.status==="success"?100:0,F=String(l.build_mode||""),ne=String(t.run_status||""),Y=!!ne&&!["running","success","no_change"].includes(ne),Se=String(d.status||(F==="reuse"?"pending":"skipped"));Y&&Se==="pending"&&(Se="stale");let fe=String(o.status||"pending"),U=fe==="success"&&/alias 已切換/.test(String(o.message||"")),E=U?"success":fe==="failed"?"failed":ne==="running"?"pending":"skipped",L=l.version_id?`v${String(l.version_id).padStart(3,"0")}`:"\u2014",T=p.host||f.host||p.url||f.url||"\u2014",te=p.port||f.port,le=te?`${T}:${te}`:String(T),Q=p.model||f.model||l.model||"\u2014",me=g.month?`${Pa(g.month)}${g.preparing?"\uFF08\u6E96\u5099\u4E2D\uFF09":""}`:t.run_status==="running"?"\u6E96\u5099\u4E2D":"\u2014",ye=[{key:"probe",label:"Ollama \u4E3B\u6A5F\uFF0F\u6A21\u578B\u6E2C\u8A66",caption:"\u4E3B\u6A5F\uFF0F\u6A21\u578B\u3001\u9023\u7DDA\u6E2C\u8A66",color:"#22c55e",status:n.status||"pending",percent:Number(n.percent)||0,current:Number(n.current)||0,total:Number(n.total)||0,unit:"\u53F0",duration_ms:n.duration_ms,started_at:n.started_at,finished_at:n.finished_at,extraDetails:[["\u4E3B\u6A5F",le],["\u6A21\u578B",Q],["\u6E2C\u8A66\u4E3B\u6A5F",`${c(n.current||0)} / ${c(n.total||0)} \u53F0`]],detail:`${c(n.current||0)} / ${c(n.total||0)} \u53F0 \xB7 ${le} \xB7 ${Q}`},{key:"version",label:"\u5EFA\u7ACB\uFF0F\u63A5\u7E8C Blue-Green \u7248\u672C",caption:"Blue-Green \u7248\u672C\u3001collection",color:"#06b6d4",status:l.version_id?"success":"pending",percent:l.version_id?100:0,current:l.version_id?1:0,total:1,unit:"\u968E\u6BB5",duration_ms:l.version_duration_ms,started_at:null,finished_at:null,extraDetails:[["\u7248\u672C",L],["Collection",l.collection||"\u2014"],["\u6A21\u5F0F",F||"\u2014"]],detail:`${L} \xB7 ${l.collection||"\u2014"} \xB7 ${F||"\u2014"}`},{key:"copy",label:"\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF",caption:"\u820A collection \u5411\u91CF\u8907\u88FD",color:"#f59e0b",status:Se,percent:A,current:x,total:j,unit:"points",duration_ms:d.duration_ms,started_at:d.started_at,finished_at:d.finished_at,extraDetails:[["\u5DF2\u8907\u88FD",`${c(x)} points`],["\u7E3D points",c(j)]],detail:j>0?`${c(x)} / ${c(j)} points \xB7 \u820A collection \u5411\u91CF`:Se==="skipped"?"\u672C\u6B21\u4E0D\u9700\u8907\u88FD\u820A\u5411\u91CF":Se==="stale"?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5B8C\u6210\u8907\u88FD":"\u7B49\u5F85\u820A collection \u8907\u88FD"},{key:"index",label:"\u91D1\u878D\u5224\u6C7A\u5411\u91CF\u7D22\u5F15",caption:"\u91D1\u878D\u5224\u6C7A\u5411\u91CF\u3001\u6279\u6B21\u9032\u5EA6",color:"#a78bfa",status:i.status||"pending",percent:k,current:y,total:b,unit:"\u7B46",duration_ms:i.duration_ms,started_at:i.started_at||l.started_at,finished_at:i.finished_at,extraDetails:[["\u5DF2\u7D22\u5F15",`${c(y)} / ${c(b)} \u7B46`],["\u91CD\u7528",c(u.reused)],["\u65B0 embedding",c(u.embedded)],["\u76EE\u524D\u6708\u4EFD",me]],detail:`${c(y)} / ${c(b)} \u7B46 \xB7 \u91CD\u7528 ${c(u.reused)} \xB7 \u65B0 embedding ${c(u.embedded)}`},{key:"validate",label:"\u9A57\u8B49\u65B0\u7248\u672C",caption:"\u7B46\u6578\u3001\u7DAD\u5EA6\u3001payload",color:"#eab308",status:fe,percent:fe==="success"?100:0,current:null,total:null,duration_ms:o.duration_ms,started_at:o.started_at,finished_at:o.finished_at,extraDetails:[["\u9A57\u8B49\u8A0A\u606F",o.message||"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210"]],detail:o.message||(Y?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u9032\u884C\u9A57\u8B49\u3002":"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210\u5F8C\u9A57\u8B49\u7B46\u6578\u3001\u7DAD\u5EA6\u8207 payload\u3002")},{key:"activate",label:"\u5207\u63DB alias",caption:"judgments_current alias",color:"#3b82f6",status:E,percent:U?100:0,current:null,total:null,duration_ms:0,started_at:null,finished_at:null,extraDetails:[["\u76EE\u6A19 alias","judgments_current"]],detail:U?o.message:Y?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5207\u63DB alias\u3002":"\u9A57\u8B49\u901A\u904E\u5F8C\u5207\u63DB judgments_current\u3002"}],H=ye.filter(w=>w.status!=="skipped"),ve=H.length?H.reduce((w,R)=>w+R.percent,0)/H.length:0,Z=ye.filter(w=>w.status==="success").length,xe=gt(ve),$e=Date.now(),ee=w=>{let R=Number(w.duration_ms)||0,V=Date.parse(w.started_at||"");if(w.status==="running"&&Number.isFinite(V))return Math.max(R,$e-V);if(R>0)return R;let B=Date.parse(w.finished_at||"");return Number.isFinite(V)&&Number.isFinite(B)?Math.max(0,B-V):0},re=ye.map(w=>{let R=ee(w);return{...w,computedDuration:R,drawable:!["skipped","pending"].includes(w.status)}}),he=Math.max(re.reduce((w,R)=>w+(R.drawable?R.computedDuration:0),0),Number(t.duration_ms)||0,1),ge=1.25,Ae=re.map(w=>w.drawable?Math.max(w.computedDuration/he*100,ge):0),ke=Ae.reduce((w,R)=>w+R,0),Ne=ke>100?100/ke:1,ze=0,G=re.map((w,R)=>{let V=Ae[R]*Ne,B=V>0?{start:ze,width:V}:null;return B&&(ze+=V),{...w,bar:B}}).map((w,R)=>{let V=[`is-${w.status}`,w.status==="failed"||w.status==="stale"?"is-error":"",["pending","skipped"].includes(w.status)?"is-missing":"",w.status==="running"?"is-running":""].filter(Boolean).join(" "),B=["pending","skipped"].includes(w.status)?"\u2014":Vs(w.computedDuration),Ee=w.status==="running"?` \xB7 ${gt(w.percent)}`:"",Ce="";if(w.bar){let Ve=Math.max(0,Math.min(100,w.bar.start)),at=Math.max(0,Math.min(100-Ve,w.bar.width)),jt=w.status==="success"?100:Math.max(0,Math.min(100,Number(w.percent)||0)),nt=at*jt/100,We=at-nt,ft=r(w.color);nt>0&&(Ce+=`<span class="rag-wf-bar index-wf-bar is-sequential" style="left:${Ve.toFixed(3)}%;width:${nt.toFixed(4)}%;top:0;height:12px;--bar-color:${ft}" aria-hidden="true"></span>`),We>1e-4&&(Ce+=`<span class="rag-wf-bar index-wf-bar is-hollow is-sequential" style="left:${(Ve+nt).toFixed(3)}%;width:${We.toFixed(4)}%;top:0;height:12px;--bar-color:${ft}" aria-hidden="true"></span>`)}let Be=[],Ie=(Ve,at)=>{at==null||at===""||Be.push(`<span class="rag-wf-detail"><span>${r(Ve)}</span><strong>${r(String(at))}</strong></span>`)};Ie("\u72C0\u614B",os(w.status).label),Ie("\u958B\u59CB",w.started_at?be(w.started_at):"\u2014"),Ie("\u7D50\u675F",w.finished_at?be(w.finished_at):"\u2014"),Ie("\u8017\u6642",B),Ie("\u9032\u5EA6",gt(w.percent));for(let[Ve,at]of w.extraDetails||[])Ie(Ve,at);Ie("\u8AAA\u660E",w.detail);let ct={...w,duration_ms:w.computedDuration,contribution_percent:H.length?(Number(w.percent)||0)/H.length:null,message:w.detail};return`<details class="rag-wf-stage index-wf-stage ${V}" data-index-stage="${r(w.key)}"${Kn.has(w.key)?" open":""} style="--stage-color:${r(w.color)}" ${ho(ct)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="index-wf-step">${String(R+1).padStart(2,"0")}</span> ${r(w.label)}</strong><small>${r(w.caption||"")}</small></span>
            </span>
            <span class="rag-wf-stage-meta">${r(B)}${r(Ee)} \xB7 ${r(os(w.status).label)} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px">${Ce}</span>
        </summary>
        <div class="rag-wf-details">${Be.join("")}</div>
      </details>`}).join("");return`<section class="report-card processing-card processing-workflow-progress-card index-wf-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${m("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
      <span class="badge ${t.run_status==="running"?"badge-info":"badge-neutral"}">${c(Z)} / ${c(H.length)} \u968E\u6BB5</span>
    </div>
    <div class="index-wf-summary">
      <span>\u6574\u9AD4 <strong class="mono">${xe}</strong></span>
      <span>\u7248\u672C <strong class="mono">${r(L)}</strong></span>
      <span>Collection <strong class="mono">${r(l.collection||"\u2014")}</strong></span>
      <span>\u6A21\u5F0F <strong>${r(F||"\u2014")}</strong></span>
      <span>Host <strong class="mono">${r(le)}</strong></span>
      <span>Model <strong class="mono">${r(Q)}</strong></span>
      <span>\u76EE\u524D <strong>${r(me)}</strong></span>
    </div>
    <div class="index-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${he>0?r(Vs(he)):"\u2014"}</span>
      </div>
      <div class="rag-wf-stages">${G}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7684\u7D50\u675F\u5373\u4E0B\u4E00\u968E\u6BB5\u7684\u958B\u59CB\uFF1B\u5DF2\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u9032\u884C\u4E2D\u6216\u672A\u5B8C\u6210\u968E\u6BB5\u53EA\u8457\u8272\u5DF2\u5B8C\u6210\u6BD4\u4F8B\uFF0C\u5176\u9918\u4EE5\u540C\u8272\u7A7A\u5FC3\u6846\u8868\u793A\uFF0C\u7B49\u5F85\u8207\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\u3002\u6975\u77ED\u968E\u6BB5\u6703\u4EE5\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u5448\u73FE\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u9032\u5EA6\u8207\u8A73\u7D30\u6578\u64DA\u3002</p>
    </div>
    <div class="index-wf-overall">
      <div class="index-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${xe}</span>
      </div>
      <div class="index-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,ve)).toFixed(1)}%"></span>
      </div>
    </div>
  </section>`}function pu(e){if(e.id==="index_versions")return uu(e);let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${m("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u5404\u968E\u6BB5\u8207\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </section>`;let a=Date.now(),n=s.map(H=>{let ve=String(H.status||"idle");return{...H,status:ve,computedDuration:lu(H,a),drawable:!["pending","skipped","idle"].includes(ve)}}),i=n.filter(H=>H.status!=="skipped"),o=n.filter(H=>H.drawable).reduce((H,ve)=>H+ve.computedDuration,0),l=Math.max(o,Number(t.duration_ms)||0,1),u=n.some(H=>H.computedDuration>0),d=1.25,g=n.map(H=>H.drawable?Math.max(H.computedDuration/l*100,d):0),v=g.reduce((H,ve)=>H+ve,0),f=v>100?100/v:1,p=0,b=n.map((H,ve)=>{let Z=g[ve]*f,xe=H.drawable?{start:p,width:Z}:null;return xe&&(p+=Z),{...H,bar:xe}}),y=n.filter(H=>["success","no_change"].includes(H.status)).length,k=n.find(H=>H.status==="running"),j=n.filter(H=>H.status==="running").length,x=n.filter(H=>["pending","idle"].includes(H.status)).length,A=n.filter(H=>H.status==="skipped").length,F=i.length||Number(t.total_stages)||0,ne=t.overall_percent,Y=ne==null||ne===""?null:Number(ne),Se=Number.isFinite(Y)?gt(Y):"\u2014",fe=u?Vs(l):"\u2014",U=String(t.run_status||""),E=U?os(U).label:"\u2014",L=k&&(k.label||k.key)||"\u2014",T=n.map(H=>Date.parse(H.started_at||"")).filter(H=>Number.isFinite(H)),te=n.map(H=>Date.parse(H.finished_at||"")).filter(H=>Number.isFinite(H)),le=T.length?new Date(Math.min(...T)).toISOString():null,Q=k?null:te.length?new Date(Math.max(...te)).toISOString():null,me=b.map((H,ve)=>{let Z=H.status,xe=["failed","stale","interrupted"].includes(Z),$e=[`is-${Z}`,xe?"is-error":"",["pending","skipped","idle"].includes(Z)?"is-missing":"",Z==="running"?"is-running":""].filter(Boolean).join(" "),ee=H.drawable?Vs(H.computedDuration):"\u2014",re=os(Z).label,he=Z==="failed"?`\u539F\u56E0\uFF1A${String(H.error||H.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002").trim()}
\u5EFA\u8B70\uFF1A${String(H.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002").trim()}`:"",ge=he?`<span class="badge badge-danger is-failure-tip" tabindex="0" aria-label="${r(he)}" data-failure-tip="${r(he)}"><span class="status-dot is-danger"></span>\u5931\u6557</span>`:r(re),Ae=oo(H),ke=xe?"var(--danger)":Ae,Ne=Z==="running"?` \xB7 ${gt(H.percent)}`:"",ze="";if(H.bar){let B=Math.max(0,Math.min(100,H.bar.start)),Ee=Math.max(0,Math.min(100-B,H.bar.width)),Ce=["success","no_change"].includes(Z)?100:Math.max(0,Math.min(100,Number(H.percent)||0)),Be=Ee*Ce/100,Ie=Ee-Be;Be>0&&(ze+=`<span class="rag-wf-bar workflow-wf-bar is-sequential" style="left:${B.toFixed(3)}%;width:${Be.toFixed(4)}%;top:0;height:12px;--bar-color:${r(ke)}" aria-hidden="true"></span>`),Ie>1e-4&&(ze+=`<span class="rag-wf-bar workflow-wf-bar is-hollow is-sequential" style="left:${(B+Be).toFixed(3)}%;width:${Ie.toFixed(4)}%;top:0;height:12px;--bar-color:${r(ke)}" aria-hidden="true"></span>`)}let I=H.label||H.key||"\u968E\u6BB5",G=cu(H),w=`${I}\uFF1A${re}\uFF0C${Z==="running"?`\u9032\u5EA6 ${gt(H.percent)}\uFF0C`:""}\u8017\u6642 ${ee}`,R={...H,duration_ms:H.computedDuration,message:he||H.message||G||""},V=`${e.id}:${H.key||ve}`;return`<details class="rag-wf-stage workflow-wf-stage ${$e}" data-workflow-wf-stage="${r(V)}"${Yn.has(V)?" open":""} style="--stage-color:${r(Ae)}" ${ho(R)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="workflow-wf-step">${String(ve+1).padStart(2,"0")}</span> ${r(I)}</strong>${G?`<small>${r(G)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(ee)}${r(Ne)} \xB7 ${ge} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(w)}">${ze}</span>
        </summary>
        <div class="rag-wf-details">${du(H,ee)}</div>
      </details>`}).join(""),ye=Ed[e.id]||"";return`<section class="report-card processing-card processing-workflow-progress-card workflow-wf-card" data-workflow-progress>
    <div class="side-card-head index-runtime-head workflow-wf-head">
      <span class="side-card-title">${m("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
      <div class="index-runtime-metrics workflow-wf-metrics">
        <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u5168\u90E8\u968E\u6BB5\u7684\u6578\u91CF\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${y} / ${F}</strong></span>
        <span class="index-runtime-metric" title="\u76EE\u524D\u57F7\u884C\u4E2D\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u57F7\u884C\u4E2D</span><strong>${j}</strong></span>
        <span class="index-runtime-metric" title="\u5C1A\u672A\u958B\u59CB\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7B49\u5F85</span><strong>${x}</strong></span>
        <span class="index-runtime-metric" title="\u672C\u6B21\u6D41\u7A0B\u4E0D\u9700\u8981\u57F7\u884C\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7565\u904E</span><strong>${A}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u968E\u6BB5\u8017\u6642\u5408\u8A08\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(fe)}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u53C3\u8207\u968E\u6BB5\u5B8C\u6210\u6BD4\u4F8B\u7684\u5E73\u5747\u3002"><span>\u6574\u9AD4\u9032\u5EA6</span><strong>${Se}</strong></span>
      </div>
    </div>
    <div class="workflow-wf-summary">
      <span>\u57F7\u884C <strong>${r(E)}</strong></span>
      <span>\u958B\u59CB <strong>${le?r(be(le)):"\u2014"}</strong></span>
      <span>\u7D50\u675F <strong>${k?"\u9032\u884C\u4E2D":Q?r(be(Q)):"\u2014"}</strong></span>
      <span>\u76EE\u524D <strong>${r(L)}</strong></span>
      <span>Run <strong class="mono">${r(t.run_id||"\u2014")}</strong></span>
    </div>
    <div class="workflow-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${r(fe)}</span>
      </div>
      <div class="rag-wf-legend workflow-wf-legend" aria-label="\u968E\u6BB5\u72C0\u614B\u5716\u4F8B">
        <span><i class="is-solid-state"></i>\u5B8C\u6210</span>
        <span><i class="is-hollow-state"></i>\u672A\u5B8C\u6210</span>
        <span><i class="is-progress-state"></i>\u57F7\u884C\u4E2D\uFF08\u9032\u5EA6\u689D\uFF09</span>
        <span><i class="is-empty-state"></i>\u7B49\u5F85\uFF0F\u7565\u904E</span>
      </div>
      <div class="rag-wf-stages">${me}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7684\u7D50\u675F\u5373\u4E0B\u4E00\u968E\u6BB5\u7684\u958B\u59CB\uFF1B\u5DF2\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u57F7\u884C\u4E2D\u6216\u672A\u5B8C\u6210\u968E\u6BB5\u53EA\u8457\u8272\u5DF2\u5B8C\u6210\u6BD4\u4F8B\uFF0C\u5176\u9918\u4EE5\u540C\u8272\u7A7A\u5FC3\u6846\u8868\u793A\uFF0C\u7B49\u5F85\u8207\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\u3002\u6975\u77ED\u968E\u6BB5\u6703\u4EE5\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u5448\u73FE\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u9032\u5EA6\u8207\u8A73\u7D30\u6578\u64DA\u3002</p>
    </div>
    <div class="workflow-wf-overall">
      <div class="workflow-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${Se}</span>
      </div>
      <div class="workflow-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,Number.isFinite(Y)?Y:0)).toFixed(1)}%"></span>
      </div>
    </div>
    ${ye?`<p class="processing-workflow-scope-note">${m("info",12)}<span>${r(ye)}</span></p>`:""}
  </section>`}function Pa(e){let t=String(e||"");return t.length===6?`${t.slice(0,4)}-${t.slice(4)}`:t||"\u2014"}function mu(e,t){let s={primary:"\u4E3B\u8981",fallback:"\u5099\u63F4",provided:"\u5916\u90E8"},a=Array.isArray(e.models)?e.models:[],n=a.length?a.join("\u3001"):"\u2014";return`<div class="index-host-row${e.url&&e.url===t?" is-selected":""}">
    <div class="index-host-head">
      <span class="badge badge-neutral">${r(s[e.role]||e.role||"\u4E3B\u6A5F")}</span>
      <strong class="mono">${r(e.host||"\u2014")}:${r(e.port??"\u2014")}</strong>
      ${_t(e.status||"unavailable")}
      <span class="index-host-model">${r(e.model||"\u2014")}</span>
    </div>
    <div class="index-host-url mono">${r(e.url||"\u2014")}</div>
    <div class="index-host-models" title="${r(n)}">\u6A21\u578B\uFF1A${r(n)}</div>
    ${e.detail?`<div class="index-host-detail">${r(e.detail)}</div>`:""}
  </div>`}function gu(e){let t=Array.isArray(e.months)?e.months:[],s=new Map;for(let n of t){let i=String(n.month||"");if(!/^\d{6}$/.test(i))continue;let o=s.get(i);o||(o={total:0,processed:0},s.set(i,o)),o.total+=Number(n.total)||0,o.processed+=Number(n.processed)||0}let a=0;for(let n of s.values())n.total>0&&n.processed>=n.total&&(a+=1);return{completed:a,total:s.size}}function fu(e){let t=Array.isArray(e.months)?e.months:[],s=e.current||{},a=e.active_coverage||{},n=new Map;for(let u of t){let d=String(u.month||"");if(!/^\d{6}$/.test(d))continue;let g=Number(d.slice(4,6));if(g<1||g>12)continue;let v=n.get(d);v||(v={key:d,year:d.slice(0,4),monthNo:g,total:0,processed:0,activeTotal:0,activeProcessed:0,reused:0,embedded:0,archives:[],current:!1,preparing:!1,jid:""},n.set(d,v)),v.total+=Number(u.total)||0,v.processed+=Number(u.processed)||0;let f=a[d]||{};v.activeTotal=Math.max(v.activeTotal,Number(f.total)||0),v.activeProcessed=Math.max(v.activeProcessed,Number(f.processed)||0),v.reused+=Number(u.reused)||0,v.embedded+=Number(u.embedded)||0,u.archive&&v.archives.push(String(u.archive)),s.month===d&&(!s.archive||s.archive===u.archive)&&(v.current=!0,v.preparing=!!s.preparing,v.jid=String(s.jid||""))}if(!n.size)return'<div class="processing-workflow-empty">\u5C1A\u7121\u53EF\u986F\u793A\u7684\u7D22\u5F15\u6708\u4EFD\uFF1B\u958B\u59CB\u7D22\u5F15\u5F8C\u6703\u4F9D\u6642\u9593\u5217\u51FA\u6708\u4EFD\u72C0\u614B\u3002</div>';let i={active:0,reuseComplete:0,reuseIncomplete:0,embedComplete:0,embedIncomplete:0};for(let u of n.values()){let d=u.total>0&&u.processed>=u.total,g=u.activeTotal>0&&u.activeProcessed>=u.activeTotal,v=u.embedded>0?"embed":u.reused>0||g?"reuse":"embed";u.kind=v,u.currentComplete=d,u.status=d?"green":u.processed>0?"red":g?"green":"gray",v==="reuse"?d?i.reuseComplete+=1:i.reuseIncomplete+=1:d?i.embedComplete+=1:i.embedIncomplete+=1,g&&(i.active+=1)}let l=[...new Set([...n.values()].map(u=>u.year))].sort((u,d)=>d.localeCompare(u)).map(u=>{let d=Array.from({length:12},(g,v)=>{let f=v+1,p=`${u}${String(f).padStart(2,"0")}`,b=n.get(p);if(!b)return`<td class="judgment-month is-empty"><span>${f}</span></td>`;let y=b.total?`${Math.min(100,Math.round(b.processed/b.total*1e3)/10)}%`:"\u2014",k=b.current&&e.run_status==="running",j=[`${b.year}-${String(b.monthNo).padStart(2,"0")}`,b.archives.join("\u3001")||"\u2014",`\u65B0\u7248\u672C ${c(b.processed)} / ${c(b.total)}\uFF08${y}\uFF09`,b.activeTotal>0?`active ${c(b.activeProcessed)} / ${c(b.activeTotal)}\uFF08${(100*b.activeProcessed/b.activeTotal).toFixed(1)}%\uFF09`:"",`\u91CD\u7528 ${c(b.reused)} \xB7 \u65B0 embedding ${c(b.embedded)}`,b.currentComplete?"":b.kind==="reuse"?"\u5F85\u5B8C\u6210\uFF1AR \u65E2\u6709\u5411\u91CF\u91CD\u7528":"\u5F85\u5B8C\u6210\uFF1AE \u65B0 embedding",b.current?`${k?b.preparing?"\u6E96\u5099\u7D22\u5F15":"\u76EE\u524D\u7D22\u5F15":"\u6700\u5F8C\u7D22\u5F15"}${b.jid?` \xB7 ${b.jid}`:""}`:""].filter(Boolean).join(" \xB7 "),x=b.activeTotal>0?Math.min(100,100*b.activeProcessed/b.activeTotal):0,A=b.total>0?Math.min(100,100*b.reused/b.total):0,F=b.total>0?Math.min(100,100*b.embedded/b.total):0,ne=b.kind==="reuse"&&!b.currentComplete,Y=b.kind==="embed"&&!b.currentComplete;return`<td class="judgment-month index-month index-month-are is-${b.status}${k?" is-active":""}" title="${r(j)}"${k?' aria-current="true"':""}><span class="index-month-number">${f}</span><span class="index-month-blocks" aria-hidden="true"><span class="index-month-block is-active" style="--fill:${x.toFixed(1)}%"></span><span class="index-month-block is-reuse${ne?" is-incomplete":""}" style="--fill:${A.toFixed(1)}%"></span><span class="index-month-block is-embed${Y?" is-incomplete":""}" style="--fill:${F.toFixed(1)}%"></span></span></td>`}).join("");return`<tr><th scope="row">${r(u)}</th>${d}</tr>`}).join("");return`<div class="judgment-months index-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" title="A\uFF1A\u4E0A\u4E00\u500B\u6B63\u5F0F\u7248\u672C\u7684\u65E2\u6709\u8986\u84CB\uFF0C\u4E0D\u5217\u5165\u65B0\u7248\u672C\u5B8C\u6210\u6578">A \u57FA\u7DDA ${c(i.active)}</span>
      <span class="badge badge-reuse" title="R \u5B8C\u6210\uFF1A\u65B0\u7248\u672C\u5DF2\u5B8C\u6210\u4E14\u8A72\u6708\u5168\u90E8\u6CBF\u7528\u65E2\u6709\u5411\u91CF">R \u5B8C\u6210 ${c(i.reuseComplete)}</span>
      <span class="badge badge-reuse-outline" title="R \u672A\u5B8C\u6210\uFF1A\u8A72\u6708\u4ECD\u9700\u6216\u6B63\u5728\u9032\u884C\u65E2\u6709\u5411\u91CF\u91CD\u7528">R \u672A\u5B8C\u6210 ${c(i.reuseIncomplete)}</span>
      <span class="badge badge-embed" title="E \u5B8C\u6210\uFF1A\u65B0\u7248\u672C\u5DF2\u5B8C\u6210\u4E14\u8A72\u6708\u5305\u542B\u65B0 embedding">E \u5B8C\u6210 ${c(i.embedComplete)}</span>
      <span class="badge badge-embed-outline" title="E \u672A\u5B8C\u6210\uFF1A\u8A72\u6708\u4ECD\u9700\u6216\u6B63\u5728\u9032\u884C\u65B0 embedding">E \u672A\u5B8C\u6210 ${c(i.embedIncomplete)}</span>
      <span class="muted">\u5171 ${c(n.size)} \u500B\u6708</span>
    </div>
    <div class="index-month-are-key" aria-label="\u7D22\u5F15\u6708\u4EFD\u65B9\u683C\u5716\u4F8B">
      <span><i class="is-active"></i>A \xB7 \u4E0A\u4E00\u500B\u6B63\u5F0F\u7248\u672C\u65E2\u6709\u8986\u84CB\uFF0C\u4E0D\u5217\u5165\u672C\u6B21\u65B0\u7248\u672C\u5B8C\u6210\u6578</span>
      <span><i class="is-reuse"></i>R \xB7 \u672C\u6B21\u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF0C\u4E0D\u91CD\u65B0\u8A08\u7B97 embedding</span>
      <span><i class="is-embed"></i>E \xB7 \u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding \u7684\u65B0\u589E\u6216\u8B8A\u66F4\u5411\u91CF</span>
      <span><i class="is-outline"></i>\u7A7A\u5FC3\u6846 \xB7 \u8A72\u6708 R\uFF0FE \u5C1A\u672A\u5B8C\u6210</span>
      <span><i class="is-current"></i>\u76EE\u524D\u7D22\u5F15\u6708\u4EFD \xB7 \u4EE5\u5916\u6846\u6A19\u793A\uFF0Cpadding \u4E0D\u4F7F\u7528\u5E95\u8272</span>
    </div>
    <div class="judgment-months-scroll">
      <table class="judgment-months-table index-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(u,d)=>`<th scope="col">${d+1}</th>`).join("")}</tr></thead>
        <tbody>${l}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA A\uFF08\u4E0A\u4E00\u500B\u6B63\u5F0F\u7248\u672C\u65E2\u6709\u8986\u84CB\uFF09\u3001R\uFF08\u91CD\u7528\u5411\u91CF\uFF09\u3001E\uFF08\u65B0 embedding\uFF09\u3002A \u4E0D\u5217\u5165\u65B0\u7248\u672C\u5B8C\u6210\u6578\uFF0CR\uFF0FE \u624D\u662F\u672C\u6B21\u5EFA\u7F6E\u9032\u5EA6\uFF1B\u586B\u6EFF\u8868\u793A\u5B8C\u6210\uFF0C\u7A7A\u5FC3\u6846\u8868\u793A\u8A72\u6708 R\uFF0FE \u5C1A\u672A\u5B8C\u6210\u3002\u7DA0\u8272\uFF1A\u65B0\u7248\u672C\u5B8C\u6210\u6216 active \u57FA\u7DDA\uFF1B\u7070\u8272\uFF1A\u5C1A\u672A\u958B\u59CB\uFF1B\u76EE\u524D\u7D22\u5F15\u6708\u4EFD\u4EE5\u5916\u6846\u6A19\u793A\uFF0Cpadding \u4E0D\u4F7F\u7528\u5E95\u8272\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u65B0\u7248\u672C\u8207 active \u7B46\u6578\u3001\u4F86\u6E90\u6A94\u6848\u8207\u76EE\u524D\u6848\u865F\u3002</p>
  </div>`}function bu(e){let t=e.import_timeline||{},s=Array.isArray(t.months)?t.months:[];if(!s.length)return`<section class="report-card processing-card import-files-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u672A\u53D6\u5F97\u5224\u6C7A\u4E0B\u8F09 manifest \u6216\u672C\u6A5F\u58D3\u7E2E\u6A94\uFF1B\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u5F8C\u6703\u986F\u793A\u6708\u4EFD\u72C0\u614B\u3002</div>
    </section>`;let a=new Map(s.map(f=>[String(f.month),f])),n=[...new Set(s.map(f=>f.year))].sort((f,p)=>p-f),i=["extract","raw_parquet","filter","postgres"],o=t.stage_labels||{},l=n.map(f=>{let p=Array.from({length:12},(b,y)=>{let k=y+1,j=`${f}${String(k).padStart(2,"0")}`,x=a.get(j);return er({month:x,year:f,monthNo:k,stageOrder:i,stageLabels:o,stageStatuses:x?.import_stages||{},overall:x?.import_overall||"empty",active:!!x?.active,workflowForStage:()=>"judgment_import",variant:"import"})}).join("");return`<tr><th scope="row">${r(f)}</th>${p}</tr>`}).join(""),u=t.summary||{},d=t.stage_summary||{},g=s.find(f=>f.active),v=g?`<div class="index-current-row">${co({activeMonth:t.active_month||String(g.month||""),activeArchive:t.active_archive||g.active_archive||"",activePhase:t.active_phase||"",processingMonth:t.processing_month||"",processingArchive:t.processing_archive||"",stageLabels:o})}</div>`:"";return`<section class="report-card processing-card import-files-card" data-import-timeline="judgment">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
      ${Bd(t,s,d,u)}
    </div>
    ${v}
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
        <span><i class="processing-timeline-swatch is-hollow-state"></i>\u672A\u5B8C\u6210</span>
        <span><i class="processing-timeline-swatch is-progress-state"></i>\u57F7\u884C\u4E2D\uFF08\u9032\u5EA6\u689D\uFF09</span>
        <span><i class="processing-timeline-swatch is-empty"></i>\u7121\u8CC7\u6599</span>
      </div>
      <div class="judgment-months-scroll">
        <table class="judgment-months-table import-months-table index-months-table processing-months-table">
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(f,p)=>`<th scope="col">${p+1}</th>`).join("")}</tr></thead>
          <tbody>${l}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\uFF1ARAR \u6AA2\u67E5\uFF0F\u89E3\u58D3\u7E2E\u3001\u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD\u3001\u91D1\u878D\u6CD5\u898F\u7BE9\u9078\u3001PostgreSQL metadata\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF1B\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u5C1A\u672A\u5B8C\u6210\uFF1B\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u6DE1\u8272\u5782\u76F4\u9032\u5EA6\u689D\u8868\u793A\uFF1B\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u539F\u59CB\u8CC7\u6599\u968E\u6BB5\u6703\u5148\u6AA2\u67E5\u65E2\u6709 Parquet\uFF0C\u53EF\u6CBF\u7528\u6642\u4E0D\u91CD\u65B0\u5099\u4EFD\uFF1B\u7F3A\u5C11\u6642\u6703\u986F\u793A\u300C\u5EFA\u7ACB YYYY-MM \u5099\u4EFD\u300D\uFF0C\u5B8C\u6210\u5F8C\u986F\u793A\u300C\u5DF2\u5EFA\u7ACB\u5099\u4EFD\u300D\u3002\u7BE9\u9078\u8207 PostgreSQL \u968E\u6BB5\u6703\u986F\u793A\u76EE\u524D\u8655\u7406\u7684\u6708\u4EFD\u8207 archive\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u56DB\u500B\u968E\u6BB5\u7684\u72C0\u614B\u3001\u672C\u6A5F\u58D3\u7E2E\u6A94\u8207\u5DF2\u532F\u5165\u6A94\u540D\u3002</p>
    </div>
  </section>`}function hu(e,t,s){let n=[t.run_id||e.active_run?.id||e.last_run?.id||"",t.version_id??"",t.collection||"",t.started_at||""].join("|"),i=Date.now(),o=Xi.get(n);if(!o){let f=Date.parse(t.started_at||""),p=Date.parse(t.finished_at||""),b=Date.parse(t.updated_at||"");t.run_status!=="running"&&Number.isFinite(f)&&(Number.isFinite(p)||Number.isFinite(b))?o={at:f,indexed:0}:o={at:i,indexed:Math.max(0,s)},Xi.set(n,o)}let l=Date.parse(t.finished_at||""),u=Date.parse(t.updated_at||""),d=t.run_status==="running"?i:Number.isFinite(l)?l:Number.isFinite(u)?u:i,g=Math.max(0,(d-Number(o.at||0))/1e3),v=Math.max(0,Number(s)-Number(o.indexed||0));return g<=0||v<=0?0:v/g}function Vs(e){let t=Number(e);return!Number.isFinite(t)||t<0?"\u2014":t>=36e5?$o(t):de(t)}function $o(e){if(!Number.isFinite(e)||e<0)return"\u2014";let t=Math.max(0,Math.round(e/1e3)),s=Math.floor(t/3600),a=Math.floor(t%3600/60),n=t%60,i=String(n).padStart(2,"0");return s>0?`${s}h ${String(a).padStart(2,"0")}m ${i}s`:a>0?`${a}m ${i}s`:`${n}s`}function vu(e,t,s,a){let n=Date.parse(e.started_at||"");if(!Number.isFinite(n))return{elapsedMs:null,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let i=e.run_status==="running",o=Date.parse(e.finished_at||""),l=Date.parse(e.updated_at||""),u=i?Date.now():Number.isFinite(o)?o:Number.isFinite(l)?l:Date.now(),d=Math.max(0,u-n),g=Number(s),v=Number(t);if(!Number.isFinite(g)||g<=0)return{elapsedMs:d,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let f=Math.max(0,g-Math.max(0,Number.isFinite(v)?v:0));if(f<=0)return{elapsedMs:d,estimatedTotalMs:d,remainingMs:0,remainingCount:0};if(!i||a<=0)return{elapsedMs:d,estimatedTotalMs:null,remainingMs:null,remainingCount:f};let p=f/a*1e3;return{elapsedMs:d,estimatedTotalMs:d+p,remainingMs:p,remainingCount:f}}function $u(e){let t=e.index_runtime||{};if(!t.available)return`<section class="report-card processing-card index-runtime-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("cloud",14)}Ollama \u9023\u7DDA\u6E2C\u8A66</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u6E2C\u8A66\u7684\u4E3B\u6A5F\u3001\u6A21\u578B\u8207\u9078\u7528\u7D50\u679C\u3002</div>
    </section>`;let s=!!t.coverage_only,a=t.embedding||{},n=Array.isArray(a.hosts)?a.hosts:[],i=a.selected||{},o=a.active||{},l=t.current||{},u=t.summary||{},d=Number(u.indexed??l.indexed??0),g=s?0:hu(e,t,d),v=gu(t),f=s?null:vu(t,d,u.total,g),p=f?.remainingCount>0?`\u8207\u5269\u9918 ${c(f.remainingCount)} \u7B46`:"",b=g>0?`\u4F9D\u672C\u6B21\u5E73\u5747 ${g.toFixed(1)} \u7B46/\u79D2${p}\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002\u5BE6\u969B\u901F\u5EA6\u6703\u96A8 embedding \u8207\u6279\u6B21\u5927\u5C0F\u8B8A\u52D5\u3002`:"\u5C1A\u7121\u8DB3\u5920\u7684\u672C\u9801\u89C0\u5BDF\u8CC7\u6599\u53EF\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002",y=Y=>r($o(f?f[Y]:null)),k=`<div class="index-runtime-metrics">
    <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u7D22\u5F15\u7684\u6708\u4EFD\u6578\uFF1B\u76EE\u524D\u8655\u7406\u4E2D\u7684\u6708\u4EFD\u4E0D\u5217\u5165\uFF0C\u7E3D\u6578\u70BA\u7D22\u5F15\u7BC4\u570D\u5167\u7684\u6709\u6548\u6708\u4EFD\u3002">
      <span>\u5DF2\u8655\u7406\u6708\u4EFD</span>
      <strong>${c(v.completed)} / ${c(v.total)}</strong>
    </span>
    <span class="index-runtime-metric" title="\u5DF2\u7D22\u5F15\u7B46\u6578 / \u7D22\u5F15\u7BC4\u570D\u7E3D\u7B46\u6578\u3002">
      <span>\u5DF2\u8655\u7406\u7B46\u6578</span>
      <strong>${c(d)} / ${c(u.total)}</strong>
    </span>
    <span class="index-runtime-metric" title="\u81EA\u672C\u6B21\u9801\u9762\u958B\u59CB\u89C0\u5BDF\u7684\u7D2F\u8A08\u5E73\u5747\uFF1B\u4E2D\u9014\u52A0\u5165\u4EE5\u9996\u6B21\u89C0\u5BDF\u6642\u9593\u8207\u7B46\u6578\u70BA\u57FA\u6E96\u3002\u5F8C\u6BB5\u82E5\u4EE5\u65B0 embedding \u70BA\u4E3B\uFF0C\u901F\u5EA6\u6703\u4E0B\u964D\u3002">
      <span>\u672C\u6B21\u5E73\u5747</span>
      <strong>${g>0?`${g.toFixed(1)} \u7B46/\u79D2`:"\u2014"}</strong>
    </span>
    <span class="index-runtime-metric" title="\u81EA\u672C\u6B21\u7D22\u5F15 run \u958B\u59CB\u6642\u9593 ${r(be(t.started_at))} \u8D77\u7B97\uFF1B\u4E2D\u9014\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002">
      <span>Elapsed Time</span>
      <strong>${y("elapsedMs")}</strong>
    </span>
    <span class="index-runtime-metric" title="Elapsed Time \u52A0\u4E0A\u4F9D\u5269\u9918\u4EF6\u6578\u8207\u672C\u6B21\u5E73\u5747\u901F\u5EA6\u4F30\u7B97\u7684\u5269\u9918\u6642\u9593\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u5F9E 0 \u91CD\u65B0\u8A08\u6642\u3002">
      <span>Estimated Total</span>
      <strong>${y("estimatedTotalMs")}</strong>
    </span>
    <span class="index-runtime-metric" title="${r(b)}">
      <span>Time Remaining</span>
      <strong>${y("remainingMs")}</strong>
    </span>
  </div>`,j=i.url||"",x=o.url||"",A=n.map(Y=>mu(Y,j)).join(""),F=t.run_status==="running"?l.preparing?"\u6E96\u5099\u4E2D":"\u76EE\u524D\u8655\u7406":"\u6700\u5F8C\u8655\u7406",ne=l.jid?`<div class="index-current-row">
        <span class="badge badge-info">${m("activity",11)}${F}</span>
        <strong class="mono">${r(Pa(l.month))}</strong>
        <span class="mono">${r(l.archive||"\u2014")}</span>
        <span class="mono">${r(l.jid||"\u2014")}</span>
        <span class="index-current-copy">${r([l.court,l.title].filter(Boolean).join(" \xB7 ")||"\u2014")}</span>
        <span class="faint">${l.preparing?"\u6E96\u5099\u4E2D":`\u6279\u6B21 ${c(l.batch_size)} \u7B46`}</span>
      </div>`:"";return`<section class="report-card processing-card index-runtime-card"${s?" hidden":""}>
    <div class="side-card-head">
      <span class="side-card-title">${m("cloud",14)}Ollama \u9023\u7DDA\u6E2C\u8A66</span>
      ${_t(a.status||"idle")}
    </div>
    ${t.error?`<div class="processing-update-notice index-runtime-error">${m("alert",13)}<span>${r(t.error)}</span></div>`:""}
    <div class="index-selected-host">
      <span class="faint">\u6700\u5F8C\u9078\u7528</span>
      <strong class="mono">${r(i.url||"\u2014")}</strong>
      <span>${r(i.model||a.model||"\u2014")}</span>
      <span class="mono">port ${r(i.port??"\u2014")}</span>
      ${x&&x!==j?`<span class="badge badge-warn">\u76EE\u524D\u4F7F\u7528 ${r(x)}</span>`:""}
      ${o.using_fallback?'<span class="badge badge-warn">\u5DF2\u5207\u63DB\u5099\u63F4</span>':""}
    </div>
    <div class="index-host-list">${A||'<div class="processing-workflow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u4E3B\u6A5F\u6E2C\u8A66\u7D50\u679C\u3002</div>'}</div>
    ${a.tested_at?`<div class="index-runtime-foot">\u6E2C\u8A66\u6642\u9593 ${r(be(a.tested_at))}</div>`:""}
  </section>
  <section class="report-card processing-card index-files-card">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m("table",14)}\u7D22\u5F15\u6A94\u6848\u6642\u9593\u8868</span>
      ${k}
    </div>
    <div class="index-runtime-summary">
      <span>\u7248\u672C <strong class="mono">v${r(t.version_id??"\u2014")}</strong></span>
      <span>Collection <code>${r(t.collection||"\u2014")}</code></span>
      <span>\u6A21\u5F0F <strong>${r(t.build_mode||"\u2014")}</strong></span>
      ${s?"":`<span>\u91CD\u7528 <strong class="mono">${c(u.reused)}</strong></span>
            <span>\u65B0 embedding <strong class="mono">${c(u.embedded)}</strong></span>`}
    </div>
    ${ne}
    ${fu(t)}
    ${s?'<p class="judgment-months-hint index-coverage-note">\u76EE\u524D\u986F\u793A active collection \u7684\u6708\u4EFD\u7D22\u5F15\u8986\u84CB\uFF1B\u57F7\u884C Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u5F8C\u6703\u986F\u793A\u672C\u6B21 Ollama \u6E2C\u8A66\u8207\u5373\u6642\u9032\u5EA6\u3002</p>':""}
  </section>`}function yu(e={}){let{storage:t,loading:s,error:a}=e;if(a)return`<section class="report-card processing-card index-storage-card">
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
    </section>`;let n=t.qdrant_storage||{},o=(Array.isArray(t.databases)?t.databases:[]).find(g=>g.id==="qdrant")||{},l=n.volume_bytes??o.volume_bytes??null,u=n.points_count??o.points_count,d=n.segments_count??o.segments_count;return`<section class="report-card processing-card index-storage-card">
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
      <span>Volume \u5BB9\u91CF</span><strong class="mono">${qe(l)}${n.volume_size?` \xB7 ${r(n.volume_size)}`:""}</strong>
      <span>Volume \u4F86\u6E90\u8DEF\u5F91</span><strong class="mono index-storage-path">${r(n.host_path||"\u2014")}</strong>
      <span>Collection</span><strong class="mono">${r(n.collection||o.collection||"\u2014")}</strong>
      <span>Alias</span><strong class="mono">${r(n.alias||"\u2014")}</strong>
      <span>Points\uFF0FSegments</span><strong class="mono">${c(u)} / ${c(d)}</strong>
    </div>
    <div class="index-runtime-foot">\u8CC7\u6599\u6642\u9593 ${r(be(t.checked_at))}</div>
  </section>`}function sr({badge:e="",lead:t="",rows:s=[],note:a=""}){return`<section class="report-card processing-card parquet-help-card workflow-help-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("info",14)}\u529F\u80FD\u8AAA\u660E</span>
      ${e?`<span class="badge badge-neutral">${r(e)}</span>`:""}
    </div>
    <div class="parquet-help-body">
      <p class="parquet-help-lead">${t}</p>
      <div class="parquet-help-grid">${s.map(([n,i])=>`<span>${r(n)}</span><strong>${i}</strong>`).join("")}</div>
      ${a?`<p class="parquet-help-note">${a}</p>`:""}
    </div>
  </section>`}function wu(){return sr({badge:"\u552F\u8B80\u532F\u51FA",lead:"\u5C07 PostgreSQL \u76EE\u524D\u6709\u6548\u7684\u5224\u6C7A\uFF08<code>judgment_documents.is_current = true</code>\uFF09\u532F\u51FA\u6210\u7368\u7ACB\u7684 Parquet \u5FEB\u7167\uFF0C\u4F9B\u96E2\u7DDA\u5206\u6790\u3001\u8CC7\u6599\u4EA4\u63DB\u6216\u4FDD\u5B58\u3002",rows:[["\u4F86\u6E90","PostgreSQL <code>judgment_documents</code>\uFF0C\u53EA\u542B\u76EE\u524D\u6709\u6548\u4E14\u5DF2\u547D\u4E2D\u91D1\u878D\u6CD5\u898F\u6E05\u55AE\u7684\u5224\u6C7A\u3002"],["\u8F38\u51FA",'<span class="mono">JUDGMENT_DATA_DIR/parquet/judgments/YYYYMMDD/HHMMSS-xxxxxxxx/judgments.parquet</span>'],["\u9644\u5E36\u6A94",'<span class="mono">\u540C\u76EE\u9304 manifest.json\uFF08\u7B46\u6578\u3001\u6A94\u6848\u5927\u5C0F\u3001\u6B04\u4F4D\u3001\u7522\u751F\u6642\u9593\uFF09</span>'],["\u5167\u5BB9","\u6848\u865F\u3001\u6CD5\u9662\u3001\u6848\u7531\u3001\u5168\u6587\u3001\u547D\u4E2D\u6CD5\u898F\u3001\u5F15\u7528\u3001\u4F86\u6E90\u58D3\u7E2E\u6A94\u8207\u6642\u9593\u6B04\u4F4D\uFF1B<code>citations</code> \u4EE5 JSON \u5B57\u4E32\u4FDD\u5B58\u3002"],["\u8207\u539F\u59CB Parquet","\u8CC7\u6599\u9801\u8207 <code>source=parquet</code> \u4F7F\u7528 <code>parquet/raw_judgments/.../raw.parquet</code>\uFF1B\u672C\u6D41\u7A0B\u7684 <code>parquet/judgments/...</code> \u662F\u53E6\u4E00\u500B\u6B63\u898F\u5316\u5FEB\u7167\u3002"],["\u4E0D\u6703","\u4E0D\u5BEB\u56DE PostgreSQL\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u820A\u5FEB\u7167\uFF1B\u53EA\u532F\u51FA current \u8CC7\u6599\uFF0C\u4E0D\u542B\u6B77\u53F2\u7248\u672C\u3002"],["\u4E2D\u65B7","\u6BCF\u6B21\u57F7\u884C\u5EFA\u7ACB\u65B0\u7684\u5B8C\u6574\u5FEB\u7167\uFF1B\u4E2D\u65B7\u5F8C\u91CD\u65B0\u57F7\u884C\u4E0D\u6703\u7E8C\u5BEB\u540C\u4E00\u500B Parquet \u6A94\u3002"]],note:"\u9069\u5408 DuckDB\u3001pandas\u3001Spark \u7B49\u96E2\u7DDA\u5206\u6790\uFF0C\u6216\u9700\u8981\u56FA\u5B9A\u6642\u9593\u9EDE\u7684\u53EF\u91CD\u73FE\u8CC7\u6599\u5FEB\u7167\u3002\u65E5\u5E38 RAG \u67E5\u8A62\u8207\u8CC7\u6599\u9801\u700F\u89BD\u4E0D\u9700\u8981\u57F7\u884C\u6B64\u6D41\u7A0B\u3002"})}function _u(){return sr({badge:"PostgreSQL \u56DE\u586B",lead:"\u5C07\u5224\u6C7A\u7684 <code>court</code> \u8F49\u6210\u6A19\u6E96\u6CD5\u9662\u540D\u7A31\u4E26\u5BEB\u5165 <code>court_normalized</code>\uFF1B\u539F\u59CB <code>court</code> \u6703\u4FDD\u7559\u4F9B\u8FFD\u6EAF\u3002",rows:[["\u8655\u7406\u7BC4\u570D","\u9810\u8A2D\u53EA\u8655\u7406 <code>court_normalized</code> \u70BA\u7A7A\u7684\u8CC7\u6599\uFF1B\u5DF2\u6B63\u898F\u5316\u8CC7\u6599\u6703\u8DF3\u904E\uFF0C\u53EF\u7528 <code>--all</code> \u91CD\u65B0\u8A08\u7B97\u5168\u90E8\u3002"],["\u89E3\u6790\u9806\u5E8F","\u539F\u59CB\u6CD5\u9662\u503C\u958B\u982D\u7B26\u5408\u6A19\u6E96\u540D\u7A31 \u2192 \u5224\u6C7A\u5168\u6587\u524D 8,000 \u5B57\u6700\u65E9\u51FA\u73FE\u7684\u6CD5\u9662 \u2192 \u539F\u59CB\u6CD5\u9662\u503C\u4EFB\u610F\u4F4D\u7F6E\u7684\u6A19\u6E96\u540D\u7A31 \u2192 JID \u5B98\u65B9\u6CD5\u9662\u4EE3\u78BC\u3002"],["\u8F38\u51FA","\u5BEB\u5165 <code>judgment_documents.court_normalized</code>\uFF1B\u4E0D\u4FEE\u6539\u539F\u59CB <code>court</code>\u3001\u5168\u6587\u6216\u5176\u4ED6\u5224\u6C7A\u6B04\u4F4D\u3002"],["\u672A\u89E3\u6790","\u7121\u6CD5\u5224\u65B7\u6642\u4FDD\u7559\u7A7A\u503C\uFF0C\u4E0D\u731C\u6E2C\uFF1B\u6458\u8981\u6703\u5217\u51FA\u672A\u89E3\u6790\u7B46\u6578\u8207\u5E38\u898B\u6A23\u672C\u3002"],["\u5F71\u97FF","\u8CC7\u6599\u9801\u7684\u6CD5\u9662\u4E0B\u62C9\u3001\u7CBE\u78BA\u7BE9\u9078\u3001\u6392\u5E8F\u3001\u7D50\u679C\u6B04\u4F4D\u8207\u5224\u6C7A\u539F\u6587\u4F7F\u7528\u6B63\u898F\u5316\u540D\u7A31\uFF1BAPI \u4ECD\u56DE\u50B3 <code>court_raw</code>\u3002"],["\u4E0D\u6703","\u4E0D\u91CD\u65B0\u532F\u5165\u5224\u6C7A\u3001\u4E0D\u6539\u5168\u6587\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u8CC7\u6599\u3002"],["\u91CD\u8DD1","\u9810\u8A2D\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u898F\u5247\u66F4\u65B0\u5F8C\u53EF\u7528 <code>--all</code> \u91CD\u7B97\uFF0C\u6216\u5148\u7528 <code>--dry-run</code> \u7D71\u8A08\u3002"]],note:"\u9069\u5408\u5728\u5224\u6C7A\u532F\u5165\u5F8C\u3001\u6CD5\u9662\u540D\u7A31\u898F\u5247\u66F4\u65B0\u5F8C\uFF0C\u6216\u8CC7\u6599\u9801\u6CD5\u9662\u9078\u9805\u51FA\u73FE\u7F3A\u6F0F\u6642\u57F7\u884C\u3002\u7D50\u679C\u4E5F\u6703\u5BEB\u5165\u6548\u80FD\u7D00\u9304\u3002"})}function ku(){return sr({badge:"\u689D\u6587\u6B77\u53F2\u5EFA\u6A94",lead:"\u70BA\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u5EFA\u7ACB <code>law_article_versions</code> \u6B77\u53F2\u689D\u6587\u5FEB\u7167\u8207 <code>law_article_change_events</code> \u8B8A\u66F4\u7D00\u9304\uFF0C\u8B93\u8CC7\u6599\u9801\u80FD\u5207\u63DB\u6B77\u53F2\u7248\u672C\u4E26\u67E5\u770B\u689D\u6587\u5DEE\u7570\u3002",rows:[["\u4F86\u6E90","PostgreSQL \u6CD5\u898F\u7248\u672C\uFF0C\u4EE5\u53CA <code>LAW_DATA_DIR/raw_parquet</code> \u5167\u5C0D\u61C9\u7684\u539F\u59CB\u6CD5\u898F Parquet \u5FEB\u7167\u3002"],["\u5339\u914D\u65B9\u5F0F","\u4EE5 raw Parquet manifest \u7684 <code>zip_sha256</code>\uFF0F<code>raw_json_sha256</code> \u5C0D\u61C9\u6CD5\u898F\u7248\u672C\uFF0C\u4E0D\u731C\u6E2C\u5167\u5BB9\u3002"],["\u7522\u751F\u5167\u5BB9","<code>article_key</code>\uFF08\u689D\u6587\u985E\u578B\uFF0B\u689D\u865F\uFF09\u3001<code>content_hash</code>\u3001\u689D\u6587\u5168\u6587\u8207\u751F\u6548\u65E5\uFF1B\u8207\u524D\u4E00\u7248\u672C\u6BD4\u8F03\u5F8C\u8A18\u9304 <code>added</code>\uFF0F<code>modified</code>\uFF0F<code>removed</code>\u3002"],["\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB","\u5206\u9801\u4E0A\u65B9\u7684\u552F\u8B80\u6AA2\u67E5\u6703\u8B80\u53D6 <code>law_article_versions</code> \u8207\u539F\u59CB Parquet\uFF0C\u5224\u65B7\u7248\u672C\u662F\u5426\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\uFF1B\u6AA2\u67E5\u672C\u8EAB\u4E0D\u6703\u4FEE\u6539\u8CC7\u6599\u5EAB\u3002"],["\u53EF\u5EFA\u7ACB","\u627E\u5230\u5C0D\u61C9\u539F\u59CB Parquet \u7684\u7248\u672C\uFF0C\u53EF\u76F4\u63A5\u57F7\u884C\u6B64\u6D41\u7A0B\u5EFA\u7ACB\u689D\u6587\u6B77\u53F2\u3002"],["\u7F3A\u539F\u59CB\u6A94","\u627E\u4E0D\u5230\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u6A19\u793A\u7121\u6CD5\u5EFA\u7ACB\uFF0C\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD\uFF1B\u6B64\u6D41\u7A0B\u6703\u8DF3\u904E\u4E26\u5217\u5728 <code>missing_versions</code>\u3002"],["\u6AA2\u67E5\u7D50\u679C","\u5E74\u4EFD\xD7\u6708\u4EFD\u8868\u986F\u793A\u5DF2\u5EFA\u7ACB\uFF0F\u672A\u5EFA\u7ACB\uFF0F\u90E8\u5206\u5EFA\u7ACB\uFF1B\u4E0B\u65B9\u5217\u51FA\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u7248\u672C\u65E5\u671F\u8207\u53EF\u5EFA\u7ACB\u72C0\u614B\u3002\u76EE\u524D\u72C0\u614B\u4EE5\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u5361\u7247\u5373\u6642\u986F\u793A\u3002"],["\u8DF3\u904E\u689D\u4EF6","\u5DF2\u6709\u689D\u6587\u5FEB\u7167\u7684\u7248\u672C\u6703\u8DF3\u904E\uFF1B\u627E\u4E0D\u5230\u53EF\u8B80\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u5217\u5165 <code>missing_versions</code>\uFF0C\u4E0D\u5EFA\u7ACB\u865B\u69CB\u689D\u6587\u3002"],["\u4E0D\u6703","\u4E0D\u4E0B\u8F09\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u4E0D\u89E3\u6790\u65B0 ZIP\u3001\u4E0D\u4FEE\u6539 <code>law_documents</code> \u6216\u76EE\u524D\u7248\u672C\u3001\u4E0D\u66F4\u65B0 Qdrant\uFF0FIndexedDB\u3002"],["\u8F38\u51FA\u6458\u8981","\u7248\u672C\u6578\u3001\u8DF3\u904E\u7248\u672C\u6578\u3001\u7F3A\u5C11\u5FEB\u7167\u7248\u672C\u3001\u5BEB\u5165\u689D\u6587\u6578\u8207\u689D\u6587\u8B8A\u66F4\u4E8B\u4EF6\u6578\u3002"],["\u91CD\u8DD1","\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u5DF2\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u4E0D\u6703\u91CD\u8907\u63D2\u5165\u3002"]],note:"\u9069\u5408\u5F9E\u820A\u7248 schema \u5347\u7D1A\u3001\u65E2\u6709\u6CD5\u898F\u7248\u672C\u7F3A\u5C11\u6B77\u53F2\u689D\u6587\uFF0C\u6216\u8CC7\u6599\u9801\u6B77\u53F2\u689D\u6587\u7248\u672C\u8207\u8B8A\u66F4\u7D00\u9304\u4E0D\u5B8C\u6574\u6642\u57F7\u884C\u3002\u57F7\u884C\u524D\u53EF\u5148\u7528\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u78BA\u8A8D\u54EA\u4E9B\u7248\u672C\u53EF\u5EFA\u7ACB\u3001\u54EA\u4E9B\u7F3A\u539F\u59CB\u6A94\u3002"})}function Su(e={}){let t=e.courtCheck,s=!!e.courtCheckLoading,a=e.courtCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-court-check"${s?" disabled":""}>${m("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31"}</span></button>`;if(a)return`<section class="report-card processing-card court-check-card">
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
    </section>`;let u={green:"\u5DF2\u6AA2\u67E5",red:"\u9700\u6B63\u898F\u5316\uFF08\u5B8C\u5168\u672A\u6AA2\u67E5\uFF09",gray:"\u9700\u6B63\u898F\u5316"},d=new Map(i.map(f=>[String(f.month),f])),v=[...new Set(i.map(f=>f.year))].sort((f,p)=>p-f).map(f=>{let p=Array.from({length:12},(b,y)=>{let k=y+1,j=`${f}${String(k).padStart(2,"0")}`,x=d.get(j);if(!x)return`<td class="judgment-month is-empty"><span>${k}</span></td>`;let A=u[x.status]?x.status:"red",F=[`${f}-${String(k).padStart(2,"0")}`,u[A],`\u7E3D ${c(x.total)} \u7B46`,`\u5DF2\u6AA2\u67E5 ${c(x.checked)} \u7B46`,`\u672A\u6AA2\u67E5 ${c(x.unchecked)} \u7B46`,x.invalid?`\u7121\u6548\u503C ${c(x.invalid)} \u7B46`:"",`\u6709\u6548 ${gt(x.percent)}`].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month court-check-month is-${A==="gray"?"red":A}" title="${r(F)}"><span>${k}</span></td>`}).join("");return`<tr><th scope="row">${r(f)}</th>${p}</tr>`}).join("");return`<section class="report-card processing-card court-check-card">
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(f,p)=>`<th scope="col">${p+1}</th>`).join("")}</tr></thead>
          <tbody>${v}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u5168\u90E8\u5DF2\u6B63\u898F\u5316\uFF1B\u7D05\u8272\uFF1A\u9700\u6B63\u898F\u5316\uFF08\u542B\u5B8C\u5168\u672A\u6AA2\u67E5\u3001\u90E8\u5206\u672A\u6B63\u898F\u5316\u6216\u7121\u6548\u503C\uFF09\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002summary \u7684\u7D05\u8272\u6578\u5B57\u70BA\u9700\u6B63\u898F\u5316\u6708\u4EFD\u6578\uFF1B\u4E0B\u65B9\u660E\u7D30\u4ECD\u4FDD\u7559\u672A\u6AA2\u67E5\u8207\u7121\u6548\u503C\u7B46\u6578\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u8A73\u7D30\u7B46\u6578\u8207\u6709\u6548\u6BD4\u4F8B\u3002</p>
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(be(t.checked_at))} \xB7 \u6A19\u6E96\u6CD5\u9662\u540D\u7A31 ${c(t.canonical_count)} \u500B</div>
    </div>
  </section>`}function xu(e={}){let t=e.lawVersionCheck,s=!!e.lawVersionCheckLoading,a=e.lawVersionCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-law-version-check"${s?" disabled":""}>${m("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB"}</span></button>`;if(a)return`<section class="report-card processing-card law-version-card">
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
    </section>`;let u={green:"\u5DF2\u5EFA\u7ACB",red:"\u672A\u5EFA\u7ACB",gray:"\u90E8\u5206\u5EFA\u7ACB"},d=new Map(i.map(U=>[String(U.month),U])),v=[...new Set(i.map(U=>U.year))].sort((U,E)=>E-U).map(U=>{let E=Array.from({length:12},(L,T)=>{let te=T+1,le=`${U}${String(te).padStart(2,"0")}`,Q=d.get(le);if(!Q)return`<td class="judgment-month is-empty"><span>${te}</span></td>`;let me=u[Q.status]?Q.status:"red",ye=[`${U}-${String(te).padStart(2,"0")}`,u[me],`\u7248\u672C ${c(Q.version_count)}\uFF08\u6CD5\u898F ${c(Q.law_versions)}\uFF0F\u547D\u4EE4 ${c(Q.order_versions)}\uFF09`,`\u5DF2\u5EFA\u7ACB ${c(Q.backfilled_count)}`,`\u672A\u5EFA\u7ACB ${c(Q.missing_count)}`,`\u9700\u5EFA\u7ACB ${c(Q.needs_backfill_count)}\uFF08\u53EF\u5EFA\u7ACB ${c(Q.backfillable_count)}\uFF0F\u7F3A\u539F\u59CB\u6A94 ${c(Q.blocked_count)}\uFF09`,`\u689D\u6587\u5217 ${c(Q.article_rows)} / \u9810\u671F ${c(Q.article_count)}`,Q.current?"\u76EE\u524D\u7248\u672C":"",Q.versions?.length?`\u7248\u672C ${Q.versions.map(H=>`#${H.version_id}`).join("\u3001")}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month law-version-month is-${me}${Q.current?" is-current":""}" title="${r(ye)}"><span>${te}</span></td>`}).join("");return`<tr><th scope="row">${r(U)}</th>${E}</tr>`}).join(""),f={law:"\u6CD5\u898F",order:"\u547D\u4EE4"},p=i.flatMap(U=>(U.versions||[]).filter(E=>E.needs_backfill).map(E=>({...E,month:U.month}))).sort((U,E)=>E.version_id-U.version_id),b=p.slice(0,20),y=b.map(U=>{let E=U.backfillable?"badge-info":U.blocked?"badge-danger":"badge-neutral",L=U.backfillable?"\u53EF\u5EFA\u7ACB":U.blocked?"\u7F3A\u539F\u59CB\u6A94":"\u5F85\u6AA2\u67E5";return`<div class="law-backfill-needed-row">
        <strong class="mono">#${U.version_id}</strong>
        <span class="badge ${E}">${L}</span>
        <span>${r(f[U.source_type]||U.source_type||"\u2014")}</span>
        <span class="mono">${r(U.update_date||U.month||"\u2014")}</span>
        <span class="law-backfill-needed-reason">${r(U.reason||"\u2014")}</span>
      </div>`}).join(""),k=p.length?`<div class="law-backfill-needed">
        <div class="law-backfill-needed-head">\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C <span class="badge badge-warn">${c(p.length)}</span></div>
        <div class="law-backfill-needed-list">${y}</div>
        ${p.length>b.length?`<div class="law-backfill-needed-more">\u53E6\u6709 ${c(p.length-b.length)} \u500B\u7248\u672C\u672A\u5217\u51FA</div>`:""}
      </div>`:'<div class="law-backfill-needed is-clear">\u76EE\u524D\u6C92\u6709\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3002</div>',j=Number(l.needs_backfill_versions)||0,x=Number(l.backfillable_versions)||0,A=Number(l.blocked_versions)||0,F=Number(l.backfilled_versions)||0,ne=Number(l.versions)||0,Y=j<=0?"ok":A>0?"danger":"warn",Se=j<=0?"\u4E0D\u9700\u8981\u5EFA\u7ACB":"\u9700\u8981\u5EFA\u7ACB",fe=j>0?`\u9700\u8981\u5EFA\u7ACB ${c(j)} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF1A\u53EF\u5EFA\u7ACB ${c(x)}\u3001\u7F3A\u539F\u59CB\u6A94 ${c(A)}\u3002\u5DF2\u6709\u6B77\u53F2\u689D\u6587 ${c(F)} \u500B\u7248\u672C${A>0?"\uFF1B\u7F3A\u539F\u59CB\u6A94\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD":""}\u3002`:`\u76EE\u524D ${c(ne)} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`;return`<section class="report-card processing-card law-version-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
      ${n}
    </div>
    <div class="law-version-check-status is-${Y}" role="status" aria-live="polite">
      <span class="badge badge-${Y}">${Se}</span>
      <span>${r(fe)}</span>
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(U,E)=>`<th scope="col">${E+1}</th>`).join("")}</tr></thead>
          <tbody>${v}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u8A72\u6708\u4EFD\u6240\u6709\u7248\u672C\u90FD\u6709\u6B77\u53F2\u689D\u6587\uFF1B\u7D05\u8272\uFF1A\u5B8C\u5168\u672A\u5EFA\u7ACB\uFF1B\u7070\u8272\uFF1A\u90E8\u5206\u7248\u672C\u5DF2\u5EFA\u7ACB\uFF1B\u5916\u6846\uFF1A\u76EE\u524D\u7248\u672C\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u7248\u672C\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u6578\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u6578\u8207\u689D\u6587\u5217\u3002</p>
      ${k}
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(be(t.checked_at))}</div>
    </div>
  </section>`}function Au(){return`<div class="processing-ollama-loading">
    <span class="spinner" aria-hidden="true"></span>
    <span>\u6B63\u5728\u6AA2\u67E5 Ollama \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span>
  </div>`}function qu(e,t,s){let a=Array.isArray(e?.hosts)?e.hosts:[];if(s&&!a.length)return`${Pe({tone:"danger",title:"Ollama \u4E3B\u6A5F\u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
    <div class="processing-ollama-empty">
      <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh-ollama">
        ${m("refresh",13)}<span>\u91CD\u65B0\u6AA2\u67E5</span>
      </button>
    </div>`;if(!a.length)return t?Au():'<div class="processing-ollama-empty">\u5C1A\u672A\u8A2D\u5B9A Ollama \u4E3B\u6A5F\uFF1B\u8ACB\u5230\u300C\u7CFB\u7D71\u72C0\u614B \u2192 Model Provider\u300D\u65B0\u589E\u4E26\u9023\u63A5\u6A21\u578B\u3002</div>';let n=a.map((o,l)=>{let u=o.status==="operational",d=Array.isArray(o.models)?o.models:[],g=d.length?d.map(f=>`<span class="processing-ollama-model ${u?"is-online":"is-offline"}">${r(f.name||"")}</span>`).join(""):'<span class="processing-ollama-model is-offline">\u6C92\u6709\u53EF\u7528\u6A21\u578B</span>',v=[o.embedding_model?`<span class="processing-ollama-role ${u?"is-online":"is-offline"}">\u5D4C\u5165 \xB7 ${r(o.embedding_model)}</span>`:'<span class="processing-ollama-role is-offline">\u672A\u8A2D\u5B9A\u5D4C\u5165\u6A21\u578B</span>',o.chat_model?`<span class="processing-ollama-role is-offline">\u804A\u5929 \xB7 ${r(o.chat_model)}</span>`:""].filter(Boolean).join("");return`<article class="processing-ollama-host ${u?"is-online":"is-offline"}" data-ollama-host data-host-id="${Number(o.id)}">
        <span class="processing-ollama-handle" aria-hidden="true">${m("grid",14)}</span>
        <span class="processing-ollama-rank">${l+1}</span>
        <div class="processing-ollama-main">
          <div class="processing-ollama-title">
            <strong>${r(o.name||o.base_url||`\u4E3B\u6A5F #${o.id}`)}</strong>
            <span class="processing-ollama-status">${u?"\u53EF\u7528":"\u7121\u6CD5\u9023\u7DDA"}</span>
          </div>
          <span class="processing-ollama-url mono">${r(o.base_url||"\u2014")}</span>
          <div class="processing-ollama-models">${g}</div>
          <div class="processing-ollama-meta">${v}${o.detail?`<span class="processing-ollama-detail">${r(o.detail)}</span>`:""}</div>
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
    <p class="processing-ollama-hint">\u62D6\u79FB\u6216\u4F7F\u7528\u7BAD\u982D\u8ABF\u6574 embedding \u512A\u5148\u9806\u5E8F\uFF1B\u76EE\u524D\u4E3B\u6A5F\u7121\u6CD5\u4F7F\u7528\u6642\uFF0C\u6703\u4F9D\u5E8F\u81EA\u52D5\u6539\u7528\u4E0B\u4E00\u53F0\uFF08\u5404\u53F0\u9700\u5177\u5099\u76F8\u540C\u7684 embedding \u6A21\u578B\uFF09\uFF0C\u76F4\u5230\u6709\u4E3B\u6A5F\u56DE\u50B3\u5411\u91CF\u3002</p>`}function Mu(e,t={}){let s=e.active_run||null,a=s||e.last_run||null,n=Pt===e.id,i=!!s||n,o=!!e.can_run&&!i,l=i?"\u6B64\u6D41\u7A0B\u6B63\u5728\u57F7\u884C\u4E2D\u3002":e.start_blocked_reason||"\u76EE\u524D\u6709\u5176\u4ED6\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",u=Array.isArray(e.command)?e.command.join(" "):"",d=Number(e.update_count)||e.update_available&&Number(e.pending_count)||0,g=e.update_origin||"\u66F4\u65B0\u5075\u6E2C",v=e.update_mechanism||"\u65E2\u6709\u66F4\u65B0\u6AA2\u67E5\u7D00\u9304",f=e.update_message||e.update_status&&e.update_status.message||"\u627E\u5230\u53EF\u66F4\u65B0\u5167\u5BB9\u3002",p=e.update_status&&e.update_status.checked_at?be(e.update_status.checked_at):"",b=e.progress||{},y=Array.isArray(b.stages)?b.stages:[],k=String(b.active_stage||""),j=y.find(Y=>String(Y.key||"")===k),x=(e.index_runtime&&e.index_runtime.current?e.index_runtime.current.month:"")||"",A=x?Pa(x):j&&(j.label||j.key)||"",F=n&&!s?"\u555F\u52D5\u4E2D":"\u57F7\u884C\u4E2D",ne=`<section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m(po[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
        <span class="badge badge-neutral badge-mono">${r(e.branch||"")}</span>
      </div>
      <div class="processing-workflow-command-grid">
        <span>\u7A0B\u5F0F</span><code>${r(e.program||"\u2014")}</code>
        <span>Shell\uFF0F\u5165\u53E3</span><code>${r(e.script||"\u2014")}</code>
        <span>\u5BE6\u969B\u547D\u4EE4</span><code class="processing-workflow-command">${r(u||"\u2014")}</code>
      </div>
      ${Vn.has(e.id)?'<div class="processing-embedding-strip-slot" data-processing-embedding-strip data-preserve-children></div>':""}
      <div class="processing-workflow-actions">
        <button class="btn btn-primary btn-sm" type="button"
          data-processing-action="run-workflow"
          data-workflow-id="${r(e.id)}"
          ${o?"":"disabled"}
          ${o?"":`title="${r(l)}"`}>
          ${i?'<span class="spinner" aria-hidden="true"></span>':m("play",14)}<span>${i?F:"\u57F7\u884C\u6B64\u6D41\u7A0B"}</span>
        </button>
        ${["law_download","order_download","judgment_download"].includes(e.id)?`<button class="btn btn-secondary btn-sm" type="button"
                data-processing-action="check-updates"
                data-workflow-id="${r(e.id)}"
                ${i?"disabled":""}>
                ${m("refresh",14)}<span>\u6AA2\u67E5\u66F4\u65B0</span>
              </button>`:""}
        ${i?`<button class="btn btn-secondary btn-sm processing-stop" type="button"
                data-processing-action="stop">${m("x",14)}<span>\u4E2D\u6B62\u57F7\u884C</span></button>`:""}
        ${e.id==="judgment_download"?`<div class="processing-download-progress" data-judgment-progress hidden>
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
              <span class="badge badge-info">${m("activity",11)}${F}</span>
              ${s&&s.id?`<span class="mono">${r(s.id)}</span>`:""}
              ${s&&s.started_at?`<span>\u958B\u59CB ${r(be(s.started_at))}</span>`:""}
              ${A?`<span>\u76EE\u524D\u8655\u7406 <strong class="mono">${r(A)}</strong></span>`:""}
            </div>`:""}
      <div class="side-card-foot">
        \u57F7\u884C\u7D50\u679C\u6703\u5BEB\u5165\u5171\u7528\u8655\u7406\u72C0\u614B\u6A94\uFF0C\u53EF\u5F9E\u8655\u7406\u7E3D\u89BD\u67E5\u770B\u3002
      </div>
    </section>`;return`<div class="processing-workflow-panel">
    ${Pe({tone:"info",title:e.label,text:e.description||""})}
    ${e.update_available?`<div class="processing-update-notice" role="status">
            <span class="processing-update-notice-icon">${m("refresh",14)}</span>
            <span class="processing-update-notice-copy">
              <strong>${r(g)}\u5075\u6E2C\u5230\u53EF\u66F4\u65B0\u5167\u5BB9</strong>
              <span class="processing-update-mechanism">\u5075\u6E2C\u6A5F\u5236\uFF1A${r(v)}${p?` \xB7 \u6AA2\u67E5\u6642\u9593 ${r(p)}`:""}</span>
              <span class="processing-update-message">${r(f)}</span>
            </span>
            ${d>0?`<span class="badge badge-warn badge-mono">${m("refresh",10)}${c(d)}</span>`:'<span class="badge badge-warn">\u53EF\u66F4\u65B0</span>'}
            <button class="btn btn-primary btn-sm processing-update-action" type="button"
              data-processing-action="run-workflow"
              data-workflow-id="${r(e.id)}"
              ${o?"":"disabled"}
              title="${r(o?"\u7ACB\u5373\u57F7\u884C\uFF1B\u6703\u5148\u8A08\u7B97\u7E3D\u5927\u5C0F\u8207\u9810\u4F30\u6642\u9593":l)}">
              ${i?'<span class="spinner" aria-hidden="true"></span>':m("download",14)}<span>${i?F:"\u66F4\u65B0"}</span>
            </button>
          </div>`:""}
    ${["legal_index_versions","law_download","order_download"].includes(e.id)?Hd(e.index_timelines,{titleSuffix:e.id==="legal_index_versions"?"\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868":"\u4E0B\u8F09\u6642\u9593\u8868"}):""}
    ${e.id==="normalize_courts"?ne:""}
    ${e.id==="normalize_courts"?Su(t):""}
    ${e.id==="backfill_law_articles"?xu(t):""}
    ${e.id!=="normalize_courts"?ne:""}
    ${pu(e)}
    ${e.id==="judgment_parquet"?wu():""}
    ${e.id==="normalize_courts"?_u():""}
    ${e.id==="backfill_law_articles"?ku():""}
    ${e.id==="judgment_import"?bu(e):""}
    ${e.id==="index_versions"?$u(e):""}
    ${e.id==="index_versions"?yu(t):""}
    ${e.id==="judgment_download"?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${m("calendar",14)}\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B</span>
              <button class="btn btn-ghost btn-sm" type="button" title="\u91CD\u65B0\u6383\u63CF raw_rar \u76EE\u9304\u8207\u6708\u4EFD\u72C0\u614B" data-processing-action="refresh-judgment-months">${m("refresh",13)}<span>\u91CD\u65B0\u6574\u7406</span></button>
            </div>
            <div data-judgment-months-slot data-preserve-children>${tr()}</div>
          </section>`:""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${_t(a?.status||"idle")}
      </div>
      ${Xd(a)}
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("history",14)}\u57F7\u884C\u7D00\u9304</span>
        <span class="badge badge-neutral">\u6700\u8FD1 ${c((e.recent_runs||[]).length)} \u7B46</span>
      </div>
      ${iu(e.recent_runs)}
    </section>
    ${["law_download","order_download","judgment_download"].includes(e.id)?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${m("search",14)}\u7248\u672C\u6AA2\u67E5\u7D00\u9304</span>
              <span class="badge badge-neutral">\u6700\u8FD1 ${c((e.update_history||[]).length)} \u7B46</span>
            </div>
            ${ou(e)}
          </section>`:""}
  </div>`}function Ca(e,t,s={},a=new Set){if(t==="overview")return io(e,a);let i=(Array.isArray(e.workflows)?e.workflows:[]).find(o=>o.id===t);return i?Mu(i,s):io(e,a)}async function Lu(e){e.innerHTML=`<section class="page processing-page">
    <div class="page-header">
      <div class="processing-page-heading">
        <div class="page-kicker">DATA PIPELINE</div>
        <div class="processing-title-line">
          <h1 class="page-title">\u8CC7\u6599\u8655\u7406</h1>
          <p class="page-subtitle processing-page-subtitle">\u5373\u6642\u8FFD\u8E64\u5224\u6C7A\u3001\u6CD5\u898F\u8207\u547D\u4EE4\u7684\u8655\u7406\u9032\u5EA6\uFF0C\u6AA2\u67E5\u672C\u6A5F\u672A\u8655\u7406\u58D3\u7E2E\u6A94\uFF0C\u4E26\u53EF\u63A5\u7E8C\u7DDA\u4E0A\u8CC7\u6599\u66F4\u65B0\u3002</p>
        </div>
      </div>
      <div class="page-actions processing-actions">
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
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-workflows"),n=e.querySelector("#processing-stop"),i=document.createElement("div");i.className="processing-stage-tooltip",i.hidden=!0,t.appendChild(i),Ct=new Map;let o=!1,l=!1,u=!1,d=null,g="",v="",f="overview",p=null,b=!1,y=null,k=null,j=!1,x=null,A=0,F=null,ne=!1,Y=null,Se=0,fe=null,U=!1,E=null,L=0,T=null,te=!1,le=null,Q=0,me=!1,ye=null,H=!1,ve=!1,Z="",xe=new Set,$e=null,ee=null,re=-1,he="",ge=0,Ae=0,ke=null,Ne=[],ze=()=>({storage:k,loading:j,error:x,courtCheck:F,courtCheckLoading:ne,courtCheckError:Y,lawVersionCheck:fe,lawVersionCheckLoading:U,lawVersionCheckError:E}),I=()=>{if(f!=="judgment_download")return;let $=s.querySelector(".processing-workflow-panel");if(!$)return;$.querySelectorAll(".judgment-month.is-active").forEach(De=>{De.classList.remove("is-active"),De.removeAttribute("aria-current")});let _=$.querySelector("[data-judgment-progress]");if(!_)return;let D=p?.progress,oe=!!(d?.workflows||[]).find(De=>De.id==="judgment_download")?.active_run;if((!D||D.active===!1)&&!oe){_.hidden=!0,_.classList.remove("is-indeterminate");let De=_.querySelector("[data-judgment-run]");De&&(De.hidden=!0);return}if(_.hidden=!1,!D||D.active===!1){let De=_.querySelector("[data-judgment-progress-phase]");De&&(De.textContent="\u6E96\u5099\u4E2D");let zt=_.querySelector("[data-judgment-progress-month]");zt&&(zt.textContent="\u2014");let qt=_.querySelector("[data-judgment-progress-filename]");qt&&(qt.textContent="\u7B49\u5F85\u4E0B\u8F09\u7A0B\u5E8F\u56DE\u5831\u9032\u5EA6\u2026",qt.title=""),_.classList.add("is-indeterminate");let Es=_.querySelector("[data-judgment-progress-bar]");Es&&(Es.style.width="");let ls=_.querySelector("[data-judgment-progress-percent]");ls&&(ls.textContent="\u2014");let Gt=_.querySelector("[data-judgment-progress-size]");Gt&&(Gt.textContent="\u2014");let Rs=_.querySelector("[data-judgment-progress-note]");Rs&&(Rs.textContent="\u5DF2\u555F\u52D5\uFF0C\u7B49\u5F85\u9032\u5EA6\u56DE\u5831");let Cs=_.querySelector("[data-judgment-run]");Cs&&(Cs.hidden=!0);return}let h={preparing:"\u6E96\u5099\u4E2D",planning:"\u8A08\u7B97\u5927\u5C0F",scanning:"\u6383\u63CF\u4E2D",checking:"\u6AA2\u67E5\u4E2D",downloading:"\u4E0B\u8F09\u4E2D",saving:"\u5132\u5B58\u4E2D",finalizing:"\u6574\u7406\u4E2D"}[D.phase]||"\u8655\u7406\u4E2D",S=_.querySelector("[data-judgment-progress-phase]");S&&(S.textContent=h);let M=D.month||"",O=_.querySelector("[data-judgment-progress-month]");O&&(O.textContent=M||"\u2014");let K=D.filename||"",pe=_.querySelector("[data-judgment-progress-filename]");if(pe&&(pe.textContent=K||"\u2014",pe.title=K),M){let De=$.querySelector(`[data-judgment-month-key="${M}"]`);De&&(De.classList.add("is-active"),De.setAttribute("aria-current","true"))}let Le=Number(D.bytes_written),Te=Number(D.total_bytes),ot=Number.isFinite(Te)&&Te>0,tt=null,Ge=D.percent;Ge!=null&&Ge!==""&&Number.isFinite(Number(Ge))?tt=Number(Ge):ot&&Number.isFinite(Le)&&(tt=Le/Te*100);let rt=tt===null;_.classList.toggle("is-indeterminate",rt);let it=_.querySelector("[data-judgment-progress-bar]");it&&(it.style.width=rt?"":`${Math.min(100,Math.max(0,tt)).toFixed(1)}%`);let Dt=_.querySelector("[data-judgment-progress-percent]");if(Dt){let De=rt?null:Math.min(100,Math.max(0,tt));Dt.textContent=De===null?"\u2014":`${De.toFixed(De>=10?0:1)}%`}let $s=_.querySelector("[data-judgment-progress-size]");if($s){let De=Number.isFinite(Le)&&Le>0?qe(Le):"\u2014";$s.textContent=ot?`${De} / ${qe(Te)}`:De}let He=_.querySelector("[data-judgment-progress-note]");if(He){let De=[],zt=Number(D.candidate_index),qt=Number(D.candidate_total);Number.isFinite(zt)&&zt>0&&Number.isFinite(qt)&&qt>0&&De.push(`\u7B2C ${c(zt)} / ${c(qt)} \u500B\u6708`),D.fileset_id&&De.push(`fileset ${D.fileset_id}`),D.message&&D.phase!=="downloading"&&De.push(String(D.message)),He.textContent=De.join(" \xB7 ")}let lt=_.querySelector("[data-judgment-run]"),Je=D.run_files_total!==null&&D.run_files_total!==void 0;if(lt&&(lt.hidden=!Je,Je)){let De=Number(D.run_files_total)||0,zt=Number(D.run_files_done)||0,qt=D.run_bytes_total===null||D.run_bytes_total===void 0?null:Number(D.run_bytes_total),Es=Number(D.run_bytes_done)||0,ls=D.run_percent,Gt=ls==null||ls===""?null:Number(ls),Rs=_.querySelector("[data-judgment-run-bar]");Rs&&(Rs.style.width=Gt===null||!Number.isFinite(Gt)?"":`${Math.min(100,Math.max(0,Gt)).toFixed(1)}%`);let Cs=_.querySelector("[data-judgment-run-percent]");Cs&&(Cs.textContent=Gt===null||!Number.isFinite(Gt)?"\u2014":`${Gt.toFixed(Gt>=10?0:1)}%`);let fr=_.querySelector("[data-judgment-run-files]");fr&&(fr.textContent=`${c(zt)} / ${c(De)} \u500B\u6708`);let Qa=_.querySelector("[data-judgment-run-size]"),br=D.phase==="planning";Qa&&(qt!==null&&qt>0?Qa.textContent=`\u5DF2\u4E0B\u8F09 ${qe(Es)} / ${qe(qt)}`:Qa.textContent=`\u5DF2\u4E0B\u8F09 ${qe(Es)} \xB7 ${br?"\u7E3D\u91CF\u8A08\u7B97\u4E2D":"\u7E3D\u91CF\u672A\u77E5"}`);let hr=_.querySelector("[data-judgment-run-elapsed]");hr&&(hr.textContent=`\u5DF2\u82B1 ${Jn(D.elapsed_seconds)}`);let Ja=_.querySelector("[data-judgment-run-eta]");if(Ja){let Wa=Number(D.eta_seconds),Bo=Number(D.estimated_total_seconds);Number.isFinite(Wa)&&Wa>=0?Ja.textContent=`\u5269\u9918 ${Jn(Wa)} \xB7 \u9810\u4F30\u7E3D\u8A08 ${Jn(Bo)}`:Ja.textContent=br&&(D.run_bytes_total===null||D.run_bytes_total===void 0)?"\u5269\u9918\u6642\u9593\uFF1A\u8A08\u7B97\u4E2D":"\u5269\u9918\u6642\u9593\uFF1A\u2014"}}},G=()=>{if(f!=="judgment_download")return;let $=s.querySelector("[data-judgment-months-slot]");if($){let _=Array.isArray(p?.months)?p.months:[];y&&!p?($.innerHTML=Pe({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(y)}),delete $.dataset.judgmentMonthCount):p?$.dataset.judgmentMonthCount!==String(_.length)?($.innerHTML=nu(p),$.dataset.judgmentMonthCount=String(_.length)):ru($,p):($.querySelector(".judgment-months-loading")||($.innerHTML=tr()),delete $.dataset.judgmentMonthCount)}I()},w=()=>{let $=Array.isArray(T?.hosts)?T.hosts:[];return JSON.stringify({loading:!$.length&&te,error:!$.length&&le?le.message||String(le):"",active:T?.active_host_id??null,hosts:$.map(_=>({id:_.id,name:_.name,url:_.base_url,status:_.status,detail:_.detail,embedding:_.embedding_model,chat:_.chat_model,models:(_.models||[]).map(D=>D.name)}))})},R=()=>{let $=s.querySelector("[data-processing-ollama]");if(!$||Q)return;let _=w();$.dataset.ollamaSignature!==_&&($.dataset.ollamaSignature=_,$.innerHTML=qu(T,te,T?null:le))},V=()=>{let _=((d?.sections||[]).find(D=>D.key==="legal")?.stages||[]).find(D=>D.key==="legal_qdrant");return String(_?.model?.label||"")},B=()=>{let $=s.querySelector("[data-processing-embedding-strip]");if(!$)return;let _=Array.isArray(T?.hosts)?T.hosts:[],D=[];for(let M of _)if(M.status==="operational")for(let O of M.models||[])Array.isArray(O.capabilities)&&O.capabilities.includes("embedding")&&D.push({hostId:Number(M.id),model:O.name,label:`${M.name||M.base_url||`\u4E3B\u6A5F ${M.id}`}:${O.name}`,baseUrl:M.base_url||""});let ce=V(),oe=_.find(M=>Number(M.id)===Number(T?.active_host_id)),X=D.map(M=>{let O=M.label===ce;return`<button class="rag-model-button${O?" is-active":""}" type="button"
        data-processing-action="select-embedding-model"
        data-host-id="${M.hostId}"
        data-model="${r(M.model)}"
        title="${r(M.label)}"
        aria-pressed="${O?"true":"false"}"
        ${ve?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(M.label)}</span>
        ${O?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`});ce&&!D.some(M=>M.label===ce)&&X.unshift(`<button class="rag-model-button is-active is-static" type="button" aria-pressed="true" disabled>
          <span class="rag-model-state" aria-hidden="true"></span>
          <span>${r(ce)}</span>
          <span class="rag-model-current">\u4F7F\u7528\u4E2D</span>
        </button>`);let h=D.length?`<div class="rag-model-buttons">${X.join("")}</div>`:`<p class="rag-model-empty">${te?"\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\u8207 Embedding model\u2026":le?`\u7121\u6CD5\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\uFF1A${r(le.message||String(le))}`:"\u76EE\u524D\u6C92\u6709\u53EF\u7528\u7684 Embedding model\u3002"}</p>`,S=`<div class="processing-embedding-strip rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${m("brain",13)} Embedding \u4E3B\u6A5F\uFF0F\u6A21\u578B</span>
        ${oe?.base_url?`<span class="rag-model-strip-base mono">${r(oe.base_url)}</span>`:""}
        <span class="rag-model-strip-current">\u76EE\u524D\uFF1A<strong>${r(ce||"\u2014")}</strong></span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-processing-action="refresh-embedding-models"
          ${te?"disabled":""}>
          ${m("refresh",12)}<span>\u6AA2\u67E5\u6A21\u578B</span>
        </button>
      </div>
      ${h}
      <p class="rag-model-hint">\u9EDE\u9078 <span class="mono">\u4E3B\u6A5F:\u6A21\u578B</span> \u5207\u63DB Embedding\uFF1B\u9078\u53D6\u5F8C\u6703\u6210\u70BA\u7B2C\u4E00\u512A\u5148\uFF0C\u5176\u4ED6\u4E3B\u6A5F\u4F9D\u5E8F\u4F5C\u70BA\u5099\u63F4\u3002\u5207\u63DB\u6A21\u578B\u5F8C\u65E2\u6709\u7D22\u5F15\u53EF\u80FD\u9700\u8981\u91CD\u5EFA\u3002</p>
    </div>`;$.innerHTML!==S&&($.innerHTML=S)},Ee=$=>{let _=s.querySelector('[data-import-timeline="judgment"]');if(!_)return;let D=String($?.active_month||""),ce=String($?.processing_month||"");_.querySelectorAll(".processing-month").forEach(K=>{let pe=!!D&&K.dataset.month===D;K.classList.toggle("is-current",pe),K.classList.toggle("is-processing-current",!!ce&&K.dataset.month===ce),pe?K.setAttribute("aria-current","true"):K.removeAttribute("aria-current")});let oe=_.querySelector(".index-current-row");if(!D||!$?.active_archive){oe&&oe.remove();return}let X=d?.workflows?.find(K=>K.id==="judgment_import")?.import_timeline?.stage_labels||{},h=co({activeMonth:D,activeArchive:$.active_archive,activePhase:$.active_phase||"",processingMonth:$.processing_month||"",processingArchive:$.processing_archive||"",stageLabels:X});if(oe){oe.innerHTML=h;return}let S=document.createElement("div");S.className="index-current-row",S.innerHTML=h;let M=_.querySelector(":scope > .side-card-head");if(M){M.insertAdjacentElement("afterend",S);return}let O=_.querySelector(".judgment-months");O&&O.prepend(S)},Ce=$=>{let _=Number($?.state_mtime_ns);return Number.isFinite(_)?_:-1},Be=$=>{let _=String($?.active_month||"");return/^\d{6}$/.test(_)?Number(_):-1},Ie=$=>{if(!$)return;let _=Ce($);if(_>=0&&_<re){ee?.active_month&&Ee(ee);return}_>=0&&(re=_);let D=String($.active_month||"");if(!!($.run_id&&$.run_id===ee?.run_id)&&Be($)>=0&&Be($)<Be(ee)){let oe={...$,active_month:ee.active_month,active_archive:ee.active_archive};ee=oe,Ee(oe);return}if(!D&&$.run_status==="running"){ee?.active_month&&ee?.run_id===$.run_id?Ee(ee):(ee=$,Ee($));return}ee=$,Ee($)},ct=$=>{let _=$?.active_import;if(_){Ie(_);return}ee?.active_month&&Ee(ee)},Ve=()=>{o||$e||($e=vt(["processing","judgment-download","system-usage","ollama","court-check","law-version-check"],($,_)=>{if(!o){if($==="processing"){_?.snapshot?.live?At(_.snapshot):_?.snapshot?Fe(_.snapshot,{silent:!0}):bt({silent:!0});return}if($==="judgment-download"){f==="judgment_download"&&xt({quiet:!0,payload:_?.snapshot||null});return}if($==="system-usage"){f==="index_versions"&&It({quiet:!0,force:!0,payload:_?.snapshot||null});return}if($==="ollama"){Vn.has(f)&&nt({quiet:!0,payload:_?.snapshot||null});return}if($==="court-check"){f==="normalize_courts"&&q({quiet:!0,force:!0,payload:_?.snapshot||null});return}$==="law-version-check"&&f==="backfill_law_articles"&&N({quiet:!0,force:!0,payload:_?.snapshot||null})}},{onProgress:($,_)=>{if($!=="processing")return;let D=_?.event;D&&et(D)},onError:()=>{d||bt({silent:!0})}}))},at=()=>{$e&&($e(),$e=null)},jt=async $=>{if(ve)return;let[_,...D]=String($||"").split("|"),ce=Number(_),oe=D.join("|");if(!ce||!oe){B();return}let X=(T?.hosts||[]).find(S=>Number(S.id)===ce);if(!X){B();return}let h=`${X.name||X.base_url||`\u4E3B\u6A5F ${X.id}`}:${oe}`;if(h===V()){B();return}if(!window.confirm(`\u5207\u63DB Embedding \u70BA ${h}\uFF1F

\u5207\u63DB\u6A21\u578B\u5F8C\uFF0C\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u8207\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u53EF\u80FD\u4E0D\u76F8\u5BB9\uFF0C\u9700\u8981\u91CD\u65B0\u5EFA\u7ACB\u7D22\u5F15\u3002`)){B();return}ve=!0,B();try{await W.selectOllamaModel(ce,{model:oe,role:"embedding"});let S=(T?.hosts||[]).map(O=>Number(O.id)),M=[ce,...S.filter(O=>O!==ce)];await W.reorderOllamaHosts(M),P(`\u5DF2\u5207\u63DB Embedding \u70BA ${h}\u3002`,"ok",6e3),T=null,await nt({quiet:!0}),await bt({silent:!0})}catch(S){P(S.message||"\u7121\u6CD5\u5207\u63DB Embedding model\u3002","danger",7e3),await nt({quiet:!0})}finally{ve=!1,B()}},nt=async({quiet:$=!1,button:_=null,payload:D=null}={})=>{if(!(o||te)){te=!0,le=null,T||(R(),B()),_&&je(_,!0,"\u6AA2\u67E5\u4E2D\u2026");try{let ce=D||await W.ollamaHosts();if(o)return;T=ce}catch(ce){if(o)return;le=ce,$||P(ce.message||"\u7121\u6CD5\u6AA2\u67E5 Ollama \u4E3B\u6A5F\u3002","danger",6e3)}finally{o||(te=!1,_&&je(_,!1),R(),B())}}},We=async $=>{if(H)return;let _=(T?.hosts||[]).map(X=>Number(X.id)),D=$.map(X=>Number(X));if(!D.length||D.length!==_.length||D.every((X,h)=>X===_[h])){R();return}H=!0;let ce=new Map((T?.hosts||[]).map(X=>[Number(X.id),X])),oe=D.map(X=>ce.get(X)).filter(Boolean);if(T&&oe.length===_.length){T={...T,hosts:oe,active_host_id:D[0]};let X=s.querySelector("[data-processing-ollama]");X&&(X.dataset.ollamaSignature=""),R()}try{await W.reorderOllamaHosts(D),P("\u5DF2\u66F4\u65B0 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","ok",3500)}catch(X){P(X.message||"\u7121\u6CD5\u66F4\u65B0 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","danger",6e3),await nt({quiet:!0})}finally{H=!1}},ft=()=>{let $=s.querySelector("[data-processing-ollama]");$&&($.dataset.ollamaSignature=""),R()},St=()=>{let $=ye;if(!$)return;if(s.querySelector(`[data-ollama-host][data-host-id="${$.hostId}"]`)?.classList.remove("is-dragging"),$.captureTarget?.hasPointerCapture?.($.pointerId))try{$.captureTarget.releasePointerCapture($.pointerId)}catch{}document.documentElement.classList.remove("processing-ollama-dragging"),window.removeEventListener("pointermove",ae),window.removeEventListener("pointerup",we),window.removeEventListener("pointercancel",Qe),ye=null,Q=0},ae=$=>{let _=ye;if(!_||$.pointerId!==_.pointerId)return;if(!_.dragging){if(Math.hypot($.clientX-_.startX,$.clientY-_.startY)<5)return;_.dragging=!0,Q=_.hostId,me=!1,s.querySelector(`[data-ollama-host][data-host-id="${_.hostId}"]`)?.classList.add("is-dragging"),document.documentElement.classList.add("processing-ollama-dragging")}$.preventDefault();let D=64;$.clientY<D?window.scrollBy(0,-12):$.clientY>window.innerHeight-D&&window.scrollBy(0,12);let ce=s.querySelector("[data-ollama-list]"),oe=document.elementFromPoint($.clientX,$.clientY)?.closest?.("[data-ollama-host]");if(!ce||!oe||!ce.contains(oe))return;let X=ce.querySelector(`[data-ollama-host][data-host-id="${_.hostId}"]`);if(!X||X===oe)return;let h=oe.getBoundingClientRect(),S=$.clientY>h.top+h.height/2;ce.insertBefore(X,S?oe.nextSibling:oe),me=!0},we=$=>{let _=ye;if(!_||$.pointerId!==_.pointerId)return;let D=_.dragging,ce=me,oe=s.querySelector("[data-ollama-list]"),X=D&&oe?[...oe.querySelectorAll("[data-ollama-host]")].map(h=>Number(h.dataset.hostId)):[];St(),D&&ce&&X.length&&We(X)},Qe=()=>{let $=!!ye?.dragging;St(),$&&ft()},Ke=$=>{if($.button!==0||$.pointerType==="mouse"&&$.buttons!==1||H||ye)return;let _=$.target.closest("[data-ollama-host]");if(!_||!s.contains(_)||$.target.closest("button")||$.pointerType==="touch"&&!$.target.closest(".processing-ollama-handle"))return;let D=Number(_.dataset.hostId)||0;if(D){$.preventDefault(),Q=D,ye={hostId:D,pointerId:$.pointerId,startX:$.clientX,startY:$.clientY,dragging:!1,captureTarget:_};try{_.setPointerCapture($.pointerId)}catch{}window.addEventListener("pointermove",ae,{passive:!1}),window.addEventListener("pointerup",we),window.addEventListener("pointercancel",Qe)}},xt=async({quiet:$=!1,payload:_=null}={})=>{if(!b){b=!0,!p&&f==="judgment_download"&&G();try{p=_||await W.judgmentDownloadStatus(),y=null}catch(D){y=D.message||"\u8B80\u53D6\u6708\u4EFD\u72C0\u614B\u5931\u6557\u3002",$||P(y,"danger",7e3)}finally{b=!1,f==="judgment_download"&&G()}}},It=async({quiet:$=!0,force:_=!1,payload:D=null}={})=>{if(!j&&!(!_&&k&&Date.now()-A<3e4)){j=!0;try{k=D||await W.systemUsage(),x=null,A=Date.now()}catch(ce){x=ce.message||"\u7121\u6CD5\u53D6\u5F97 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002",$||P(x,"danger",7e3)}finally{j=!1,f==="index_versions"&&_e()}}},q=async({quiet:$=!0,force:_=!1,payload:D=null}={})=>{if(!ne&&!(!_&&F&&Date.now()-Se<6e4)){ne=!0;try{F=D||await W.checkCourts(),Y=null,Se=Date.now()}catch(ce){Y=ce.message||"\u7121\u6CD5\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u3002",$||P(Y,"danger",7e3)}finally{ne=!1,f==="normalize_courts"&&_e()}}},N=async({quiet:$=!0,force:_=!1,button:D=null,payload:ce=null}={})=>{if(!U&&!(!_&&fe&&Date.now()-L<6e4)){U=!0,D&&je(D,!0,"\u6AA2\u67E5\u4E2D\u2026");try{if(fe=ce||await W.checkLawVersions(),E=null,L=Date.now(),!$){let oe=fe.totals||{},X=Number(oe.needs_backfill_versions)||0,h=Number(oe.backfillable_versions)||0,S=Number(oe.blocked_versions)||0;X>0?P(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u9700\u8981\u5EFA\u7ACB ${X} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF08\u53EF\u5EFA\u7ACB ${h}\u3001\u7F3A\u539F\u59CB\u6A94 ${S}\uFF09\u3002`,S>0?"danger":"warn",7e3):P(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D ${Number(oe.versions)||0} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`,"ok",5e3)}}catch(oe){E=oe.message||"\u7121\u6CD5\u6AA2\u67E5\u689D\u6587\u6B77\u53F2\u72C0\u614B\u3002",$||P(E,"danger",7e3)}finally{U=!1,D&&je(D,!1)}}},C=$=>Array.from(s.querySelectorAll("[data-stage-key]")).find(_=>_.dataset.stageKey===$)||null,z=$=>{if(!$)return;xe.add($);let _=Array.from(s.querySelectorAll(".processing-wf-stage[data-processing-stage]")).find(D=>D.dataset.processingStage===$);_&&(_.open=!0,_.scrollIntoView({behavior:"smooth",block:"center"}))},J=()=>{Z&&(Z="",i.hidden=!0,s.querySelectorAll("[data-stage-key]").forEach($=>{$.classList.remove("is-stage-hovered")}))},se=$=>{let _=$.dataset.stageKey||"";if(!_)return;Z=_,s.querySelectorAll("[data-stage-key]").forEach(Te=>{Te.classList.toggle("is-stage-hovered",Te.dataset.stageKey===_)});let D=$.dataset.stageStatusKey||"idle",ce=$.dataset.stageStatus||os(D).label,oe=$.dataset.stageColor||"var(--accent)",X=Number($.dataset.stageUpdate)||0,h=Number($.dataset.stagePending)||0,S=$.dataset.stageContributionLabel||"\u6574\u9AD4\u5360\u6BD4";i.innerHTML=`<div class="processing-stage-tooltip-head">
      <span class="processing-stage-tooltip-swatch" style="background:${r(oe)}"></span>
      <strong>${r($.dataset.stageLabel||_)}</strong>
      ${_t(D,ce)}
    </div>
    <div class="processing-stage-tooltip-meta">
      <span>\u968E\u6BB5\u9032\u5EA6 <strong>${r($.dataset.stagePercent||"\u2014")}</strong></span>
      <span>${r(S)} <strong>${r($.dataset.stageContribution||"\u2014")}</strong></span>
      <span class="mono">${r($.dataset.stageDuration||"\u2014")}</span>
    </div>
    <div class="processing-stage-tooltip-counts">${r($.dataset.stageCounts||"\u2014")}</div>
    ${X||h?`<div class="processing-stage-tooltip-badges">
            ${X?`<span class="processing-wf-count is-update">${m("refresh",11)}<strong>${c(X)}</strong><span>\u53EF\u66F4\u65B0</span></span>`:""}
            ${h?`<span class="processing-wf-count is-pending">${m("clock",11)}<strong>${c(h)}</strong><span>\u5F85\u57F7\u884C</span></span>`:""}
          </div>`:""}
    ${$.dataset.stageMessage?`<div class="processing-stage-tooltip-message">${r($.dataset.stageMessage)}</div>`:""}`,i.hidden=!1;let M=Math.min(300,Math.max(220,window.innerWidth-24));i.style.width=`${M}px`;let O=$.getBoundingClientRect(),K=Math.min(window.innerWidth-M-12,Math.max(12,O.left)),pe=O.top-i.offsetHeight-10,Le=pe>=12?pe:Math.min(window.innerHeight-i.offsetHeight-12,O.bottom+10);i.style.left=`${K}px`,i.style.top=`${Math.max(12,Le)}px`},ue=$=>{if($.target.closest(".is-failure-tip")){J();return}if($.target.closest(".processing-wf-rail"))return;let _=$.target.closest("[data-stage-key]");!_||!s.contains(_)||_.contains($.relatedTarget)||se(_)},Me=$=>{let _=$.target.closest("[data-stage-key]");if(!_||!s.contains(_)||_.contains($.relatedTarget))return;let D=$.relatedTarget?.closest?.("[data-stage-key]");D&&D.dataset.stageKey===_.dataset.stageKey||J()},Re=$=>{let _=$.capabilities||{};!u&&n&&(n.hidden=!_.can_stop_update)},_e=()=>{if(!d)return;let $=Ca(d,f,ze(),xe);$!==g&&(is(s,$),g=$),G(),R(),B(),ct(d)},Fe=($,{silent:_=!1}={})=>{if(o||!$)return;let D=Date.parse($.generated_at||""),ce=Date.parse(d?.generated_at||"");if(Number.isFinite(D)&&Number.isFinite(ce)&&D<ce)return;if(Pt){let M=($.workflows||[]).find(K=>K.id===Pt),O=M?.active_run?.id||M?.last_run?.id||"";(M?.active_run||O&&O!==ms)&&(Pt="",ms="")}d=$;let oe=new Map;for(let M of $.sections||[])for(let O of M.stages||[])oe.set(`${M.key}-${O.key}`,O);for(let[M,O]of Ct){if(O.kind!=="upgrade")continue;let K=oe.get(M);if(K){if(K.phase==="failed"||K.phase==="running"&&K.percent!==null){Ct.delete(M);continue}if(K.phase==="completed"){let pe=Date.parse(K.last_run?.started_at||"");Number.isFinite(pe)&&pe>=Number(O.startedAt||0)-1e3&&Ct.delete(M)}}}let X=Wn($,f);X!==v&&(is(a,X),v=X);let h=Ca($,f,ze(),xe);if(h!==g&&(is(s,h),g=h),G(),R(),Z){let M=C(Z);M?se(M):J()}let S=s.querySelector("[data-processing-updated-at]");if(S){let M=be($.generated_at);S.textContent!==M&&(S.textContent=M)}if(Re($),B(),ct($),!T&&!te&&nt({quiet:!0}),Ne.length){let M=Ne.splice(0);for(let O of M)et(O)}},Ze=$=>{if(ke=$,typeof requestAnimationFrame>"u"){let _=ke;ke=null,_&&At(_);return}Ae||(Ae=requestAnimationFrame(()=>{Ae=0;let _=ke;ke=null,_&&At(_)}))},et=$=>{if(!$)return;if(!d){Ne.push($),Ne.length>100&&Ne.shift();return}let _=String($.run_id||""),D=Number($.seq)||0;if(_&&_===he&&D>0&&D<=ge)return;_&&_!==he&&(he=_,ge=0),D>0&&(ge=D);let ce=String($.workflow_id||"judgment_import"),oe=String($.month||"").replace(/\D/g,"").slice(0,6),X=(d.workflows||[]).find(pe=>pe.id===ce);if(!X)return;X.progress||(X.progress={stages:[]}),Array.isArray(X.progress.stages)||(X.progress.stages=[]);let h=String($.stage||""),S=h?X.progress.stages.find(pe=>String(pe.key)===h):null,M=String(X.progress.run_id||"")===String($.run_id||"");if(S&&$.type==="stage_progress"){let pe=Number($.current),Le=Number(S.current);M&&$.status==="running"&&Number.isFinite(pe)&&Number.isFinite(Le)&&pe<Le||($.status&&(S.status=String($.status)),$.current!==void 0&&(S.current=Number($.current)||0),$.total!==void 0&&(S.total=Number($.total)||0),$.percent!==void 0&&(S.percent=Number($.percent)||0),$.message&&(S.message=String($.message)))}if(S&&$.extra&&typeof $.extra=="object")for(let pe of["financial_processed","financial_matched","financial_percent"])$.extra[pe]!==void 0&&(S[pe]=Number($.extra[pe])||0);if($.type==="stage_progress"&&$.overall_percent!==void 0){let pe=Number($.overall_percent)||0,Le=Number(X.progress.overall_percent)||0;X.progress.overall_percent=M?Math.max(Le,pe):pe}$.type!=="run_finished"&&(X.progress.run_status="running"),($.type==="archive_started"||$.type==="stage_progress")&&!X.active_run&&$.run_id&&(X.active_run={id:$.run_id,status:"running",started_at:$.timestamp,message:$.message||""}),$.type==="run_finished"&&(X.active_run=null,X.progress.run_status=String($.status||"success"),X.can_run=!0);let O=[];oe&&$.month_stages&&O.push({month:oe,import_stages:$.month_stages,import_overall:$.month_overall||""});let K=null;if($.type==="archive_started"&&oe){let pe=Date.parse($.timestamp||"");K={active_month:oe,active_archive:$.archive,active_phase:$.stage||"filter",processing_month:oe,processing_archive:$.archive,run_id:$.run_id,run_status:"running",state_mtime_ns:Number.isFinite(pe)?pe*1e6:Date.now()*1e6}}else $.type==="run_finished"&&(K={...d.active_import||{},run_status:String($.status||"success")});Ze({live:!0,generated_at:$.timestamp,workflows:[{id:ce,active_run:X.active_run,last_run:X.last_run,progress:X.progress,can_run:X.can_run}],import_timeline_months:O,active_import:K})},At=$=>{if(o||!$||!d)return;let _=new Map(($.workflows||[]).map(S=>[S.id,S]));if(Pt){let S=_.get(Pt),M=S?.active_run?.id||S?.last_run?.id||"";(S?.active_run||M&&M!==ms)&&(Pt="",ms="")}for(let S of d.workflows||[]){let M=_.get(S.id);if(M){if("active_run"in M&&(S.active_run=M.active_run),"last_run"in M&&(S.last_run=M.last_run),Array.isArray(M.recent_runs)&&(S.recent_runs=M.recent_runs),"index_runtime"in M){let O=M.index_runtime;O&&!O.active_coverage&&S.index_runtime?.active_coverage&&(O.active_coverage=S.index_runtime.active_coverage),S.index_runtime=O}if(M.progress){let O=M.progress,K=S.progress;if(S.id==="judgment_import"&&K?.run_id&&K.run_id===O.run_id){let pe=new Map((K.stages||[]).map(Le=>[String(Le.key),Le]));for(let Le of O.stages||[]){let Te=pe.get(String(Le.key));Te&&Le.status==="running"&&Number(Le.current)<Number(Te.current)&&(Le.current=Te.current,Le.total=Te.total,Le.percent=Te.percent,Le.message=Te.message)}O.overall_percent=Math.max(Number(K.overall_percent)||0,Number(O.overall_percent)||0)}S.progress=O}typeof M.can_run=="boolean"&&(S.can_run=M.can_run)}}let D=S=>{if(!S||!Array.isArray($.import_timeline_months))return;let M=new Map((S.months||[]).map(K=>[String(K.month),K]));for(let K of $.import_timeline_months){let pe=M.get(String(K.month));pe&&(pe.import_stages={...pe.import_stages||{},...K.import_stages||{}},K.import_overall&&(pe.import_overall=K.import_overall))}let O={complete:0,incomplete:0,processing:0,empty:0};for(let K of S.months||[]){let pe=String(K.import_overall||"empty");O[pe]=Number(O[pe]||0)+1}S.stage_summary=O};(S=>{let M=(S.workflows||[]).find(Ge=>Ge.id==="index_versions"),O=M?.index_runtime;if(!O||!Array.isArray(O.months))return;let K=(S.file_timelines||[]).find(Ge=>Ge.key==="judgment");if(!K||!Array.isArray(K.months))return;let pe=(M.progress?.stages||[]).find(Ge=>Ge.key==="validate"),Le=["success","no_change"].includes(String(O.run_status||""))||String(O.run_status||"")!=="running"&&/alias\s*已切換/.test(String(pe?.message||"")),Te=String(O.current?.month||""),ot=new Map(K.months.map(Ge=>[String(Ge.month),Ge]));for(let Ge of O.months){let rt=ot.get(String(Ge.month||""));if(!rt)continue;let it=rt.stages||(rt.stages={}),Dt=String(Ge.status||"");Dt==="running"||String(Ge.month)===Te?(it.qdrant="processing",rt.overall="processing"):Dt==="success"&&it.qdrant!=="complete"&&(it.qdrant=Le?"complete":"incomplete",rt.overall=Le?"complete":"incomplete")}let tt={complete:0,incomplete:0,processing:0,empty:0,update:0};for(let Ge of K.months){let rt=String(Ge.overall||"empty");tt[rt]=Number(tt[rt]||0)+1,Ge.has_update&&(tt.update+=1)}K.summary=tt})(d),D(d.import_timeline);for(let S of d.workflows||[])S.id==="judgment_import"&&D(S.import_timeline);$.active_import&&(d.active_import=$.active_import),$.mode&&(d.mode=$.mode),$.generated_at&&(d.generated_at=$.generated_at);let oe=Wn(d,f);oe!==v&&(is(a,oe),v=oe);let X=Ca(d,f,ze(),xe);X!==g&&(is(s,X),g=X),G(),R(),B(),ct(d),Re(d);let h=s.querySelector("[data-processing-updated-at]");if(h&&$.generated_at){let S=be($.generated_at);h.textContent!==S&&(h.textContent=S)}},bt=async({silent:$=!1}={})=>{if(!(o||l)){l=!0;try{let _=await W.processing();Fe(_,{silent:$})}catch(_){if(o)return;let D=Vd(_.message,d);D!==g&&(is(s,D),g=D),$||P(_.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{l=!1}}},ta=async($,_="")=>{if(u)return;u=!0,je($,!0,"\u6AA2\u67E5\u4E2D\u2026");let D=ao[_]||"",ce=String($.dataset.sourceTypes||"").split(",").map(h=>h.trim()).filter(Boolean),oe=ce.length?ce:D?[D]:[],X=$.dataset.stageId||"";X&&(Ct.set(X,{kind:"check",phase:"updating",startedAt:Date.now()}),_e());try{let h=await W.checkUpdates(oe);if(h&&h.checking)X&&(Ct.delete(X),_e()),P("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u8ACB\u7A0D\u5F8C\u91CD\u65B0\u6574\u7406\u3002","info",6e3);else if(oe.length===1){let S=(h.sources||{})[oe[0]]||{},M=no[_]||(oe[0]==="judgment"?"\u5224\u6C7A":oe[0]==="law"?"\u6CD5\u898F":oe[0]==="order"?"\u547D\u4EE4":"\u8CC7\u6599");S.status==="error"?P(`${M}\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF1A${S.message||"\u7121\u6CD5\u53D6\u5F97\u7DDA\u4E0A\u7248\u672C"}`,"danger",7e3):P(S.update_available?`${M}\u7DDA\u4E0A\u5DF2\u6709\u66F4\u65B0\u7248\u672C\u3002`:`${M}\u7DDA\u4E0A\u5DF2\u662F\u6700\u65B0\u7248\u672C\u3002`,S.update_available?"warn":"ok",6e3)}else if(oe.length>1){let S=h.sources||{},M=oe.filter(K=>S[K]?.update_available),O=oe.filter(K=>S[K]?.status==="error");O.length?P(`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF0C\u4F46\u6709 ${O.length} \u9805\u6AA2\u67E5\u5931\u6557\u3002`,"danger",7e3):P(M.length?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${M.length} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",M.length?"warn":"ok",6e3)}else{let S=Number(h.update_count)||0;P(S>0?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${S} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",S>0?"warn":"ok",6e3)}X&&(Ct.set(X,{kind:"check",phase:"updated",startedAt:Date.now()}),_e()),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await bt({silent:!0})}catch(h){X&&(Ct.delete(X),_e()),P(h.message||"\u66F4\u65B0\u6AA2\u67E5\u5931\u6557\u3002","danger",7e3)}finally{u=!1,je($,!1),d&&Re(d)}},sa=async $=>{let _=ao[$]||"";if(!_)return!0;let D=null;try{D=await W.checkUpdates([_])}catch(oe){return P(`\u7121\u6CD5\u5B8C\u6210\u7248\u672C\u6AA2\u67E5\uFF08${oe.message||"\u7DB2\u8DEF\u932F\u8AA4"}\uFF09\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002`,"warn",7e3),!0}if(!D||D.checking)return D&&D.checking&&P("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","info",6e3),!0;let ce=(D.sources||{})[_];if(!ce)return!0;if(window.dispatchEvent(new CustomEvent("judgment:updates-changed")),ce.status==="up_to_date"&&!ce.update_available){let oe=no[$]||"\u8CC7\u6599",X=ce.checked_at?`\uFF08${be(ce.checked_at)} \u6AA2\u67E5\uFF09`:"",h=Nd[$]||"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u55CE\uFF1F";return window.confirm(`${oe}\u7DDA\u4E0A\u6AA2\u67E5\u70BA\u6700\u65B0\u7248\u672C${X}\u3002

${h}`)}return ce.status==="error"&&P("\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","warn",6e3),!0},Ga=async($,_)=>{if(u)return;u=!0;let D=(d?.workflows||[]).find(X=>X.id===_);ms=D?.active_run?.id||D?.last_run?.id||"",Pt=_,je($,!0,"\u57F7\u884C\u4E2D"),_e();let ce=$.dataset.stageId||"",oe=!1;try{if(!await sa(_))return;ce&&(Ct.set(ce,{kind:"upgrade",phase:"upgrading",startedAt:Date.now()}),_e());let h;try{h=await W.startProcessingWorkflow(_)}catch(S){throw ce&&(Ct.delete(ce),_e()),S}oe=!0,P(`\u5DF2\u555F\u52D5\u300C${D?.label||_}\u300D\u6D41\u7A0B\u3002`,"ok",6e3),h&&h.run_id&&console.info("processing workflow started",h),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),bt({silent:!0}),window.setTimeout(()=>{Pt===_&&(Pt="",ms="",bt({silent:!0}))},15e3)}catch(X){P(X.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{u=!1,(!oe||Pt!==_)&&(Pt="",ms="",d?(Re(d),g="",_e()):je($,!1))}},Ua=async $=>{if(!u){u=!0,je($,!0,"\u505C\u6B62\u4E2D\u2026");try{let _=await W.stopProcessingUpdate();for(let[D,ce]of Ct)ce.kind==="upgrade"&&Ct.delete(D);_e(),P(_.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3)}catch(_){P(_.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{u=!1,je($,!1),d&&Re(d)}}},bs=$=>{let _=$.target.closest("[data-processing-action]");if(!_||_.disabled)return;_.closest(".processing-wf-rail")&&($.preventDefault(),$.stopPropagation());let D=_.dataset.processingAction;if(D==="refresh")bt({silent:!1});else if(D==="open-stage")z(_.dataset.stageId||"");else if(D==="refresh-judgment-months")xt({quiet:!1});else if(D==="refresh-index-storage")It({quiet:!1,force:!0});else if(D==="refresh-court-check")q({quiet:!1,force:!0});else if(D==="refresh-law-version-check")N({quiet:!1,force:!0,button:_});else if(D==="refresh-ollama")nt({quiet:!1,button:_});else if(D==="refresh-embedding-models")nt({quiet:!1,button:_});else if(D==="select-embedding-model"){let ce=_.dataset.hostId||"",oe=_.dataset.model||"";jt(`${ce}|${oe}`)}else if(D==="move-ollama-host"){let ce=T?.hosts||[],oe=ce.findIndex(M=>Number(M.id)===Number(_.dataset.hostId)),X=_.dataset.direction,h=X==="up"?oe-1:X==="down"?oe+1:-1;if(oe<0||h<0||h>=ce.length)return;let S=ce.map(M=>Number(M.id));[S[oe],S[h]]=[S[h],S[oe]],We(S)}else if(D==="check-updates")ta(_,_.dataset.workflowId||"");else if(D==="run-workflow"){let ce=_.dataset.workflowId||"";Ga(_,ce)}else D==="stop"&&Ua(_)},hs=($,{scroll:_=!1}={})=>{if(f=$||"overview",d){let D=Wn(d,f);is(a,D),v=D;let ce=Ca(d,f,ze(),xe);if(is(s,ce),g=ce,G(),R(),B(),ct(d),Z){let oe=C(Z);oe?se(oe):J()}_&&s.scrollIntoView({behavior:"smooth",block:"start"})}Vn.has(f)&&nt({quiet:!0}),f==="judgment_download"&&xt({quiet:!0}),f==="index_versions"&&It({quiet:!0}),f==="normalize_courts"&&q({quiet:!0}),f==="backfill_law_articles"&&N({quiet:!0})},aa=$=>{let _=$.target.closest("[data-processing-workflow]");_&&hs(_.dataset.processingWorkflow||"overview")},Ns=$=>{let _=$.target.closest("[data-timeline-workflow]");_&&($.preventDefault(),hs(_.dataset.timelineWorkflow||"",{scroll:!0}))},vs=$=>{let _=$.target.closest?.(".index-wf-stage[data-index-stage]");if(_&&s.contains(_)){let X=_.dataset.indexStage||"";X&&(_.open?Kn.add(X):Kn.delete(X));return}let D=$.target.closest?.(".workflow-wf-stage[data-workflow-wf-stage]");if(D&&s.contains(D)){let X=D.dataset.workflowWfStage||"";X&&(D.open?Yn.add(X):Yn.delete(X));return}let ce=$.target.closest?.(".processing-wf-stage[data-processing-stage]");if(!ce||!s.contains(ce))return;let oe=ce.dataset.processingStage||"";oe&&(ce.open?xe.add(oe):xe.delete(oe))};return t.addEventListener("click",bs),a.addEventListener("click",aa),s.addEventListener("click",Ns),s.addEventListener("pointerover",ue),s.addEventListener("pointerout",Me),s.addEventListener("pointerdown",Ke),s.addEventListener("toggle",vs,!0),window.addEventListener("scroll",J,{capture:!0,passive:!0}),Ve(),typeof EventSource>"u"&&await bt({silent:!1}),()=>{o=!0,at(),t.removeEventListener("click",bs),a.removeEventListener("click",aa),s.removeEventListener("click",Ns),St(),s.removeEventListener("pointerover",ue),s.removeEventListener("pointerout",Me),s.removeEventListener("pointerdown",Ke),s.removeEventListener("toggle",vs,!0),window.removeEventListener("scroll",J,{capture:!0})}}var lr={};Zt(lr,{render:()=>cp});var nr={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u522A\u9664\uFF0F\u9000\u5F79",badge:"badge-neutral"}},Qt={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},js={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},yo={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function Zs(e){let t=nr[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${r(t.label)}</span>`}function rr(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function ju(e){return rr(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",source_type:a||""}})}function Tu(e){return rr(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",article_no:a||""}})}function Nu(e){return rr(e).map(t=>({jid:t.trim()}))}function Eu(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function Ru(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function Cu(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function Pu(e){return(e?.tags||[]).join(", ")}function Xs(e){return`<div class="qb-empty">${m("info",18)}<span>${r(e)}</span></div>`}function ir(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),n=[...t.map(i=>`<span class="chip">${r(i)}</span>`),...s.map(i=>`<span class="chip">${r(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${r(i)}</span>`)];return n.length?`<div class="chips qb-labels">${n.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function or(){return`<details class="qb-import">
    <summary>${m("upload",14)}JSON \u6279\u6B21\u532F\u5165</summary>
    <p class="qb-muted">\u683C\u5F0F\uFF1A<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>\u3002\u76F8\u540C\u984C\u76EE fingerprint \u9810\u8A2D\u66F4\u65B0\u3002</p>
    <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
    <div class="qb-actions">
      <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${m("upload",13)}<span>\u532F\u5165 JSON</span></button>
    </div>
  </details>`}function Iu(e){let t=e?.item||{},s=Array.isArray(e?.warnings)?e.warnings:[],a=Array.isArray(t.tags)?t.tags:[];return`<section class="report-card qb-card qb-ai-result">
    <div class="side-card-head">
      <span class="side-card-title">${m("sparkles",14)}Ollama \u5DF2\u5EFA\u7ACB\u984C\u76EE #${t.id}</span>
      ${Zs(t.status)}
    </div>
    <div class="qb-ai-answer">
      <strong>${r(t.question||"")}</strong>
      <div class="qb-ai-meta">
        ${r(Qt[t.question_type]||t.question_type||"")}
        \xB7 ${r(js[t.difficulty]||t.difficulty||"")}
        \xB7 ${r(e?.model||"\u672C\u6A5F Ollama")}
      </div>
      ${ir(t)}
      ${t.reference_answer?`<div class="qb-reference"><span class="summary-label">Ollama \u53C3\u8003\u7B54\u6848</span><p>${r(t.reference_answer)}</p></div>`:""}
      ${a.length?`<div class="chips">${a.map(n=>`<span class="chip">${r(n)}</span>`).join("")}</div>`:""}
      ${s.length?`<div class="qb-ai-warnings"><strong>\u9700\u8981\u6CE8\u610F</strong><ul>${s.map(n=>`<li>${r(n)}</li>`).join("")}</ul></div>`:""}
      <div class="qb-actions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="review-ai-item">${m("shield",13)}<span>\u524D\u5F80\u9A57\u6536</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="reset-ai">${m("plus",13)}<span>\u518D\u65B0\u589E\u4E00\u984C</span></button>
      </div>
    </div>
    ${or()}
  </section>`}function Du(e){return e.aiResult?Iu(e.aiResult):`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("sparkles",14)}AI \u984C\u5EAB\u65B0\u589E</span>
      <span class="badge badge-neutral">\u672C\u6A5F Ollama</span>
    </div>
    <form class="qb-form qb-ai-form" data-qb-form="ai-create" id="qb-create-form">
      <label class="field qb-wide">
        <span class="field-label">\u984C\u76EE <span class="field-tag">question</span></span>
        <textarea class="input" name="question" rows="4" required placeholder="\u8F38\u5165\u554F\u984C\uFF0COllama \u6703\u56DE\u7B54\u4E26\u81EA\u52D5\u5224\u65B7\u984C\u578B\u3001\u96E3\u5EA6\u3001\u6CD5\u898F\uFF0F\u689D\u6587\u3001\u53C3\u8003\u7B54\u6848\u8207\u6A19\u7C64\u3002">${r(e.aiQuestion||"")}</textarea>
      </label>
      <p class="qb-form-hint">\u9001\u51FA\u5F8C\u7531\u672C\u6A5F Ollama \u56DE\u7B54\u4E26\u81EA\u52D5\u5EFA\u7ACB\u6B04\u4F4D\uFF1B\u984C\u76EE\u6703\u4EE5\u300C\u5F85\u5BE9\u300D\u5EFA\u7ACB\uFF0C\u4ECD\u9700\u4EBA\u5DE5\u8986\u6838\u5F8C\u624D\u6703\u6210\u70BA benchmark-ready\u3002</p>
      <div class="qb-actions">
        <button class="btn btn-primary" type="submit" ${e.aiLoading?"disabled":""}>${e.aiLoading?'<span class="spinner"></span><span>Ollama \u7522\u751F\u4E2D\u2026</span>':`${m("sparkles",14)}<span>\u8B93 Ollama \u7522\u751F\u4E26\u5EFA\u7ACB</span>`}</button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-ai" ${e.aiLoading?"disabled":""}>\u6E05\u9664</button>
      </div>
    </form>
    ${or()}
  </section>`}function Ou(e){return`<section class="report-card qb-card">
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
          <select class="select" name="question_type">${Object.entries(Qt).map(([t,s])=>`<option value="${t}" ${e?.question_type===t?"selected":""}>${s}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u96E3\u5EA6</span>
          <select class="select" name="difficulty">${Object.entries(js).map(([t,s])=>`<option value="${t}" ${e?.difficulty===t?"selected":""}>${s}</option>`).join("")}</select>
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
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${r(Eu(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${r(Ru(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${r(Cu(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${r(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${r(Pu(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
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
    ${or()}
  </section>`}function Bu(e,t){return e?Ou(e):Du(t)}function Fu(e){let t=e.status==="retired"||!!e.deleted_at;return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${r(e.question)}</strong>
        <span class="qb-meta">
          ${r(Qt[e.question_type]||e.question_type)}
          \xB7 ${r(js[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${Zs(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${ir(e)}
    <div class="qb-item-foot">
      <span>\u66F4\u65B0 ${r(be(e.updated_at))}</span>
      ${e.reviewed_by?`<span>\u5BE9\u6838 ${r(e.reviewed_by)}</span>`:""}
      ${e.review_comment?`<span class="qb-comment">${r(e.review_comment)}</span>`:""}
      <div class="qb-actions">
        ${t?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="restore" data-id="${e.id}">${m("refresh",13)}<span>\u5FA9\u539F\u984C\u76EE</span></button>`:`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${m("edit",13)}<span>\u7DE8\u8F2F</span></button>
               ${["pending_review","changes_requested"].includes(e.status)?"":`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="submit-review" data-id="${e.id}">${m("upload",13)}<span>${e.status==="draft"?"\u9001\u5BE9":"\u91CD\u65B0\u9001\u5BE9"}</span></button>`}
               <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${e.id}">${m("shield",13)}<span>\u9A57\u6536</span></button>
               <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${m("trash",13)}<span>\u522A\u9664</span></button>`}
      </div>
    </div>
  </article>`}function Hu(e){return`<section class="report-card qb-card">
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
        ${Object.entries(nr).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(Qt).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(js).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
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
      ${e.items.length?e.items.map(t=>Fu(t)).join(""):Xs("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${c(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}var _o=[["queue","\u5F85\u5BE9\uFF0F\u9000\u56DE"],["accepted","\u5DF2\u6838\u51C6"],["rejected","\u5DF2\u62D2\u7D55"],["draft","\u8349\u7A3F"]];function zu(e){let t=e.stats||{};return{queue:Number(t.pending_review||0)+Number(t.changes_requested||0),accepted:Number(t.accepted||0),rejected:Number(t.rejected||0),draft:Number(t.draft||0)}}function Gu(e,t){let s=e.reviewFilter||"queue",a={queue:{title:"\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u6216\u9000\u56DE\u4FEE\u6539\u7684\u984C\u76EE\u3002",text:t.accepted?`\u5DF2\u6709 ${c(t.accepted)} \u984C\u6838\u51C6\u3002\u65B0\u984C\u76EE\u5EFA\u7ACB\u5F8C\u6703\u81EA\u52D5\u9001\u5BE9\uFF0C\u4E5F\u53EF\u4EE5\u5207\u63DB\u5230\u300C\u5DF2\u6838\u51C6\u300D\u91CD\u65B0\u9A57\u6536\u65E2\u6709\u984C\u76EE\u3002`:"\u5EFA\u7ACB\u984C\u76EE\u5F8C\u6703\u9810\u8A2D\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\uFF1B\u82E5\u53EA\u60F3\u5148\u4FDD\u5B58\uFF0C\u5EFA\u7ACB\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5373\u53EF\u5B58\u6210\u8349\u7A3F\u3002"},accepted:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u6838\u51C6\u984C\u76EE\u3002",text:"\u984C\u76EE\u901A\u904E\u4EBA\u5DE5\u9A57\u6536\u5F8C\u6703\u5217\u5728\u9019\u88E1\uFF1B\u4E5F\u53EF\u4EE5\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u9001\u51FA\u9A57\u6536\u3002"},rejected:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u62D2\u7D55\u984C\u76EE\u3002",text:"\u88AB\u62D2\u7D55\u7684\u984C\u76EE\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u4E2D\uFF0C\u53EF\u4FEE\u6539\u5F8C\u91CD\u65B0\u9001\u5BE9\u3002"},draft:{title:"\u76EE\u524D\u6C92\u6709\u8349\u7A3F\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u984C\u76EE\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5C31\u6703\u5B58\u6210\u8349\u7A3F\uFF0C\u4E4B\u5F8C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002"}}[s]||{title:"\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u65B0\u984C\u76EE\u5F8C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"},n=[s!=="draft"?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="new">${m("plus",13)}<span>\u65B0\u589E\u984C\u76EE</span></button>`:"",s==="queue"&&t.accepted?`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="review-filter" data-filter="accepted">${m("shield",13)}<span>\u67E5\u770B\u5DF2\u6838\u51C6 ${c(t.accepted)}</span></button>`:"",`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="go-manage">${m("database",13)}<span>\u524D\u5F80\u984C\u5EAB\u7BA1\u7406</span></button>`].filter(Boolean).join("");return`<div class="qb-empty qb-empty-block">
    <span class="qb-empty-icon">${m("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>${r(a.title)}</strong>
      <p>${r(a.text)}</p>
      <div class="qb-actions">${n}</div>
    </div>
  </div>`}function Uu(e){let t=_o.find(([s])=>s===e);return t?t[1]:"\u5F85\u5BE9\uFF0F\u9000\u56DE"}function Qu(e,t){return`<button class="qb-review-item${t?" is-active":""}" type="button" data-qb-action="select-review-item" data-id="${e.id}" aria-pressed="${t?"true":"false"}">
    <span class="qb-review-item-top">
      <span class="qb-id">#${e.id}</span>
      <span class="qb-review-item-meta">
        ${r(Qt[e.question_type]||e.question_type)}
        \xB7 ${r(js[e.difficulty]||e.difficulty)}
        \xB7 v${e.version}
        ${e.benchmark_ready?" \xB7 Benchmark ready":""}
        ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
      </span>
      ${Zs(e.status)}
    </span>
    <strong>${r(e.question)}</strong>
  </button>`}function Ju(e){return`<article class="qb-review-pane-card">
    <div class="qb-review-pane-head">
      <div class="qb-review-pane-title">
        <span class="qb-review-item-meta">#${e.id} \xB7 v${e.version} \xB7 ${r(Qt[e.question_type]||e.question_type)} \xB7 ${r(js[e.difficulty]||e.difficulty)}</span>
        <strong>${r(e.question)}</strong>
      </div>
      <div class="qb-review-pane-side">
        ${Zs(e.status)}
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${m("edit",13)}<span>\u7DE8\u8F2F</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
        </div>
      </div>
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${ir(e)}
    ${e.review_comment?`<div class="qb-review-note"><span class="summary-label">\u6700\u8FD1\u6279\u6CE8${e.reviewed_by?` \xB7 ${r(e.reviewed_by)}`:""}</span><p>${r(e.review_comment)}</p></div>`:""}
    ${e.reference_answer?`<div class="qb-reference"><span class="summary-label">\u53C3\u8003\u7B54\u6848</span><p>${r(e.reference_answer)}</p></div>`:""}
    <form class="qb-review-form" data-qb-form="review" data-id="${e.id}">
      <div class="qb-score-grid">
        ${[["clarity","\u984C\u76EE\u6E05\u6670"],["labels","\u6CD5\u689D\u6A19\u6CE8"],["answer","\u53C3\u8003\u7B54\u6848"],["difficulty","\u96E3\u5EA6\u8207\u6A19\u7C64"],["overall","\u6574\u9AD4"]].map(([t,s])=>`<label class="field"><span class="field-label">${s} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${t}" value="4" /></label>`).join("")}
      </div>
      <label class="field"><span class="field-label">\u6279\u6CE8</span><textarea class="input" name="comment" rows="3" placeholder="\u6A19\u8A3B\u7406\u7531\u3001\u9700\u8981\u4FEE\u6539\u7684\u6B04\u4F4D\uFF0C\u6216\u9A57\u6536\u7D50\u8AD6\u3002"></textarea></label>
      <div class="qb-actions qb-review-decisions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="decide" data-decision="approved">${m("check",13)}<span>\u6838\u51C6</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="decide" data-decision="changes_requested">${m("edit",13)}<span>\u9000\u56DE\u4FEE\u6539</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-qb-action="decide" data-decision="rejected">${m("x",13)}<span>\u62D2\u7D55</span></button>
      </div>
    </form>
    ${e.reviews?.length?`<div class="qb-review-history"><span class="summary-label">\u5BE9\u6838\u7D00\u9304</span>${e.reviews.map(t=>`<div class="qb-review-row"><span>${r(t.reviewer||"\u533F\u540D")}</span>${Zs(t.decision==="approved"?"accepted":t.decision)}<span>${r(be(t.created_at))}</span><p>${r(t.comment||"\u2014")}</p></div>`).join("")}</div>`:""}
  </article>`}function Wu(){return`<div class="qb-empty qb-empty-block qb-review-placeholder">
    <span class="qb-empty-icon">${m("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>\u5F9E\u5DE6\u5074\u9078\u64C7\u984C\u76EE</strong>
      <p>\u9EDE\u9078\u984C\u76EE\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u984C\u5E79\u3001\u9810\u671F\u6A19\u8A3B\u3001\u53C3\u8003\u7B54\u6848\u8207\u6838\u51C6\u9078\u9805\u3002</p>
    </div>
  </div>`}function Vu(e){let t=e.reviewDetail,s=zu(e),a=e.reviewFilter||"queue",n=_o.map(([l,u])=>`<button class="chip qb-review-tab${a===l?" is-active":""}" type="button" role="tab" aria-selected="${a===l?"true":"false"}" data-qb-action="review-filter" data-filter="${l}"><span>${u}</span><span class="qb-review-tab-count">${c(s[l]||0)}</span></button>`).join(""),i=e.reviewItems.length?e.reviewItems.map(l=>Qu(l,Number(t?.id)===Number(l.id))).join(""):`<div class="qb-empty qb-empty-compact">${m("info",16)}<span>\u76EE\u524D\u6C92\u6709${r(Uu(a))}\u984C\u76EE\u3002</span></div>`,o=t?Ju(t):e.reviewItems.length?Wu():Gu(e,s);return`<section class="report-card qb-card qb-review-card">
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
  </section>`}function Ys(e){if(e==null||e==="")return"";let t=Number(e);return Number.isFinite(t)?`${Math.round(t*100)}%`:""}function Ku(e){if(!e||typeof e!="object")return"\u5F15\u7528";let t=String(e.jid||"").trim();if(t)return t;let s=String(e.law_name||"").trim(),a=String(e.article_no||"").trim(),n=`${s} ${a}`.trim();return n||String(e.title||e.text||"\u5F15\u7528").slice(0,80)}function Yu(e){let t=e?.metrics||{},s=t.scores||{},a=[["\u6CD5\u898F\u53EC\u56DE",Ys(t.law_recall)],["\u689D\u6587\u53EC\u56DE",Ys(t.article_recall)],["\u898F\u5247\u5206",Ys(s.deterministic)],["Judge",Ys(s.judge)],["\u4EBA\u5DE5",Ys(s.human)]].filter(([,n])=>n);return a.length?`<div class="qb-bank-stats">${a.map(([n,i])=>`<span class="qb-bank-stat"><span>${r(n)}</span><strong>${r(i)}</strong></span>`).join("")}</div>`:""}function Xu(e){let t=Array.isArray(e?.law_sources)?e.law_sources:[],s=Array.isArray(e?.citations)?e.citations:[],a=t.length?`<div class="qb-bank-sources">${t.map(i=>{let o=String(i.law_name||"\u672A\u547D\u540D\u6CD5\u898F"),l=(i.articles||[]).map(d=>String(d.article_no||"").trim()).filter(Boolean),u=`<strong>${r(o)}</strong>${l.length?`<small>${r(l.join("\u3001"))}</small>`:""}`;return i.law_url?`<a class="qb-bank-law" href="${r(i.law_url)}" target="_blank" rel="noreferrer">${u}</a>`:`<span class="qb-bank-law">${u}</span>`}).join("")}</div>`:"",n=s.length?`<div class="qb-bank-sources qb-bank-citations">${s.map(i=>`<span class="chip chip-mono">${r(Ku(i))}</span>`).join("")}</div>`:"";return!a&&!n?"":`<div class="qb-bank-answer-block">
    <div class="qb-bank-section-label"><span>\u5F15\u7528\u4F86\u6E90</span><span>${c(t.length+s.length)} \u7B46</span></div>
    ${a}${n}
  </div>`}function ko(e,t){if(!e)return`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("history",20)}</span>
      <strong>\u5C1A\u7121 RAG \u7B54\u6848</strong>
      <span>\u8DD1\u4E00\u6B21 Benchmark \u5F8C\uFF0C\u6700\u8FD1\u4E00\u6B21\u6210\u529F\u56DE\u7B54\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</span>
    </div>`;let s=Number(e.item_version||0),a=Number(t?.version||0),n=s&&a&&s!==a?`<span class="badge badge-warn">\u7B54\u6848 v${s} \xB7 \u984C\u76EE v${a}</span>`:"",i=e.answer_source==="llm"?"LLM \u751F\u6210":e.answer_source==="structured"?"\u6CD5\u898F\u8CC7\u6599\u5EAB":String(e.answer_source||"RAG");return`<div class="qb-bank-answer-meta">
      <span class="badge badge-ok"><span class="status-dot is-ok"></span>RAG \u5B8C\u6210</span>
      <span class="badge badge-neutral">${r(i)}</span>
      ${n}
      <span class="mono">${r(e.run_label||e.run_id||"")}</span>
      <span>${r(be(e.finished_at))}</span>
      <span>${r(de(e.duration_ms))}</span>
      ${e.llm_model?`<span class="mono">${r(e.llm_model)}</span>`:""}
    </div>
    <div class="qb-bank-answer-block">
      <div class="qb-bank-section-label"><span>\u56DE\u7B54</span><span>${c(String(e.answer||"").length)} \u5B57</span></div>
      <p class="qb-bank-answer-text">${r(String(e.answer||"").trim()||"\uFF08\u7A7A\u767D\u56DE\u7B54\uFF09")}</p>
    </div>
    ${Xu(e)}
    ${Yu(e)}`}function So(e,t){let s=e.selectedSuiteId,a=t&&e.suiteAnswers?.[String(s)]?.[String(t.id)]||null;return t?`<div class="qb-bank-answer-head">
      <div class="qb-bank-answer-heading">
        <span class="qb-bank-answer-kicker">${m("sparkles",12)}RAG \u6700\u8FD1\u4E00\u6B21\u7B54\u6848</span>
        <strong class="qb-bank-answer-question">#${t.id} ${r(t.question)}</strong>
      </div>
      ${a?`<span class="qb-bank-answer-state">${r(Qt[t.question_type]||t.question_type)} \xB7 v${t.version}</span>`:""}
    </div>
    ${ko(a,t)}`:`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("cube",20)}</span>
      <strong>\u9078\u64C7\u984C\u76EE</strong>
      <span>\u5F9E\u5DE6\u5074\u6E05\u55AE\u9078\u64C7\u4E00\u984C\uFF0C\u67E5\u770B\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`}function xo(e){return`<span class="qb-bank-actions">
    <button class="qb-bank-icon" type="button" data-qb-action="edit" data-id="${e.id}" title="\u7DE8\u8F2F\u984C\u76EE" aria-label="\u7DE8\u8F2F\u984C\u76EE #${e.id}">${m("edit",13)}</button>
    <button class="qb-bank-icon is-danger" type="button" data-qb-action="delete" data-id="${e.id}" title="\u5F9E\u984C\u5EAB\u79FB\u9664" aria-label="\u5F9E\u984C\u5EAB\u79FB\u9664 #${e.id}">${m("trash",13)}</button>
  </span>`}function Zu(e,t,{selected:s,hasAnswer:a}){return`<div class="qb-bank-row${s?" is-active":""}" data-id="${e.id}">
    <button class="qb-bank-select" type="button" data-qb-action="select-bank-item" data-id="${e.id}" aria-pressed="${s?"true":"false"}">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <span class="qb-bank-item-copy">
        <strong>${r(e.question)}</strong>
        <small>${r(Qt[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${a?"\u5DF2\u6709 RAG \u7B54\u6848":"\u5C1A\u7121 RAG \u7B54\u6848"}</small>
      </span>
    </button>
    ${xo(e)}
  </div>`}function ep(e,t,s){return`<article class="qb-bank-full-item" data-id="${e.id}">
    <div class="qb-bank-full-head">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <div class="qb-bank-full-title">
        <strong>${r(e.question)}</strong>
        <small>${r(Qt[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${r(nr[e.status]?.label||e.status||"")}</small>
      </div>
      ${xo(e)}
    </div>
    ${ko(s,e)}
  </article>`}function wo(e){let t=e.editingSuite,s=Array.isArray(e.suites)?e.suites:[],a=s.find(p=>Number(p.id)===Number(e.selectedSuiteId))||s[0]||null,n=Array.isArray(a?.items)?a.items:[],i=e.suiteAnswers?.[String(a?.id)]||{},o=n.find(p=>Number(p.id)===Number(e.selectedBankItemId))||null,l=!!e.suiteAnswersLoading,u=String(e.suiteAnswersError||""),d=!!e.suiteManageOpen||!s.length,g=e.bankTab==="full"?"full":"split",v=s.length?`<div class="qb-bank-tabs" role="tablist" aria-label="Benchmark \u984C\u5EAB\u6AA2\u8996">
        <button class="qb-bank-tab${g==="split"?" is-active":""}" type="button" role="tab" aria-selected="${g==="split"?"true":"false"}" data-qb-action="bank-tab" data-tab="split">${m("grid",13)}<span>Benchmark \u984C\u5EAB</span><span class="badge badge-neutral">${c(n.length)}</span></button>
        <button class="qb-bank-tab${g==="full"?" is-active":""}" type="button" role="tab" aria-selected="${g==="full"?"true":"false"}" data-qb-action="bank-tab" data-tab="full">${m("table",13)}<span>\u984C\u5EAB\u5168\u5217\u8868</span><span class="badge badge-neutral">${c(n.length)}</span></button>
      </div>`:"",f="";if(!s.length)f=`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("cube",20)}</span>
      <strong>\u5C1A\u672A\u5EFA\u7ACB Benchmark \u984C\u5EAB</strong>
      <span>\u5C55\u958B\u4E0B\u65B9 Suite \u8A2D\u5B9A\u4E26\u5EFA\u7ACB\u984C\u5EAB\u5F8C\uFF0C\u5C31\u80FD\u5728\u9019\u88E1\u700F\u89BD\u984C\u76EE\u8207\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`;else if(l)f='<div class="qb-bank-loading"><span class="spinner" aria-hidden="true"></span><span>\u8B80\u53D6\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u4E2D\u2026</span></div>';else{let p=u?Pe({tone:"warn",title:"\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u8B80\u53D6\u5931\u6557",text:r(u)}):"";g==="full"?f=`${p}<div class="qb-bank-full" data-qb-bank-view="full">${n.length?n.map((b,y)=>ep(b,y,i[String(b.id)]||null)).join(""):Xs("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>`:f=`${p}<div class="qb-bank-split" data-qb-bank-view="split">
        <div class="qb-bank-list" data-qb-bank-list>${n.length?n.map((b,y)=>Zu(b,y,{selected:Number(b.id)===Number(o?.id),hasAnswer:!!i[String(b.id)]})).join(""):Xs("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>
        <div class="qb-bank-answer-pane" data-qb-bank-answer>${So(e,o)}</div>
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
    ${v}
    ${f}
    <details class="qb-suite-manage" ${d?"open":""}>
      <summary>${m("sliders",14)}Suite \u8A2D\u5B9A\u8207\u7248\u672C <span class="qb-muted">${c(s.length)} \u500B suite \xB7 ${c(e.ready.length)} \u984C benchmark-ready</span></summary>
      <div class="qb-suite-manage-body">
        <form class="qb-suite-form" data-qb-form="suite">
          <input type="hidden" name="suite_id" value="${t?.id||""}" />
          <div class="qb-form-grid">
            <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${r(t?.name||"Pilot 30")}" /></label>
            <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(yo).map(([p,b])=>`<option value="${p}" ${t?.tier===p?"selected":""}>${b}</option>`).join("")}</select></label>
          </div>
          <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${r(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
          <div class="qb-check-list">
            ${e.ready.length?e.ready.map(p=>{let b=t?t.items?.some(y=>Number(y.id)===Number(p.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${p.id}" ${b?"checked":""}/><span><strong>#${p.id}</strong> ${r(p.question)} <small>${r(Qt[p.question_type]||p.question_type)}</small></span></label>`}).join(""):Xs("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
          </div>
          <div class="qb-actions">
            <button class="btn btn-primary" type="submit">${m("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
            ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
          </div>
        </form>
        <div class="qb-list">
          ${s.length?s.map(p=>`<article class="qb-suite">
            <div class="qb-item-head">
              <div class="qb-item-title"><strong>${r(p.name)}</strong><span class="qb-meta">${r(yo[p.tier]||p.tier)} \xB7 v${p.version} \xB7 ${c(p.item_count)} \u984C</span></div>
              <span class="badge ${p.status==="frozen"?"badge-ok":"badge-neutral"}">${p.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
            </div>
            <div class="qb-suite-items">${(p.items||[]).slice(0,8).map(b=>`<span class="chip">#${b.id} ${r(b.question.slice(0,22))}${b.question.length>22?"\u2026":""}</span>`).join("")}${p.item_count>8?`<span class="qb-muted">+${p.item_count-8}</span>`:""}</div>
            <div class="qb-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${p.id}">${m("edit",13)}<span>\u7DE8\u8F2F suite</span></button>
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${p.id}">${m("shield",13)}<span>\u51CD\u7D50</span></button>
              <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${p.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
            </div>
          </article>`).join(""):Xs("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
        </div>
      </div>
    </details>
  </section>`}function tp(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),n=Number(a?.value);Number.isFinite(n)&&(t[s]=Math.max(1,Math.min(5,Math.round(n))))}return t}function sp(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:ju(t.get("expected_laws")),expected_articles:Tu(t.get("expected_articles")),expected_judgments:Nu(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function Ao(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},n={tab:"",editing:null,editingFrom:"",editingSuite:null,aiQuestion:"",aiLoading:!1,aiResult:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tags:[]},stats:{},suites:[],ready:[],selectedSuiteId:null,selectedBankItemId:null,bankTab:"split",suiteAnswers:{},suiteAnswersLoading:!1,suiteAnswersError:"",suiteManageOpen:!1,reviewItems:[],reviewDetail:null,reviewFilter:"queue"},i=I=>e.querySelector(`#quality-panel-${a[I]}`),o=(I,G)=>{I&&(I.childElementCount?I.setAttribute("aria-busy","true"):I.innerHTML=`<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>${G}</span></div></section>`)},l=I=>{I?.removeAttribute("aria-busy")},u=0,d=null,g=()=>"anonymous",v=()=>{s&&s(n.stats)},f=I=>{t&&t(I),me(I)},p=async()=>{try{n.stats=await W.questionBankStats()}catch{n.stats={}}v()},b=()=>{let I=i("create");I&&(I.innerHTML=Bu(n.editing,n))},y=(I,G)=>{let w=I?.querySelector("[data-qb-tag-results]");w&&(w.innerHTML=G.length?G.map(R=>`<button class="qb-tag-option" type="button" role="option" data-qb-action="select-tag" data-tag="${r(R.tag)}"><span>${r(R.tag)}</span><small>${c(R.count)}</small></button>`).join(""):'<div class="qb-tag-empty">\u6C92\u6709\u5176\u4ED6\u76F8\u7B26\u6A19\u7C64</div>')},k=async(I,G="")=>{if(!I)return;let w=I.querySelector("[data-qb-tag-results]"),R=++u;w&&(w.innerHTML='<div class="qb-tag-loading"><span class="spinner"></span><span>\u641C\u5C0B\u6A19\u7C64\u2026</span></div>');try{let V=await W.questionBankTags(G,12);if(R!==u)return;let B=(V.tags||[]).filter(Ee=>!n.filters.tags.includes(Ee.tag));y(I,B)}catch(V){if(R!==u)return;w&&(w.innerHTML=`<div class="qb-tag-empty">${r(V.message||"\u6A19\u7C64\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},j=(I,{focus:G=!1}={})=>{if(!I)return;let w=I.querySelector("[data-qb-tag-popover]"),R=I.querySelector("[data-qb-tag-search]");!w||!R||(w.hidden&&(w.hidden=!1,R.value="",k(I,"")),G&&(R.focus(),R.select()))},x=I=>{d&&(window.clearTimeout(d),d=null);let G=I?.querySelector("[data-qb-tag-popover]");G&&(G.hidden=!0)},A=async I=>{let G=String(I||"").trim();G&&(n.filters.tags.includes(G)?n.filters.tags=n.filters.tags.filter(w=>w!==G):n.filters.tags=[...n.filters.tags,G],n.offset=0,await L())},F=()=>{let I=Array.isArray(n.suites)?n.suites:[];if(!I.length)return n.selectedSuiteId=null,n.selectedBankItemId=null,null;let G=I.find(R=>Number(R.id)===Number(n.selectedSuiteId));G||(G=I[0],n.selectedSuiteId=G.id,n.selectedBankItemId=null);let w=Array.isArray(G.items)?G.items:[];return w.some(R=>Number(R.id)===Number(n.selectedBankItemId))||(n.selectedBankItemId=w[0]?.id??null),G},ne=()=>{let I=i("suite");I&&(I.innerHTML=wo(n))},Y=0,Se=async(I,{force:G=!1}={})=>{if(!I)return;let w=++Y;if(!G&&n.suiteAnswers[String(I)]){n.suiteAnswersLoading=!1,n.suiteAnswersError="",ne();return}n.suiteAnswersLoading=!0,n.suiteAnswersError="",ne();try{let R=await W.benchmarkSuiteLatestAnswers(I);if(w!==Y)return;n.suiteAnswers[String(I)]=R.answers||{}}catch(R){if(w!==Y)return;n.suiteAnswersError=R.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}finally{w===Y&&(n.suiteAnswersLoading=!1,ne())}},fe=async I=>{n.selectedSuiteId=I,n.selectedBankItemId=null,n.suiteAnswersError="";let G=F();if(!G){ne();return}await Se(G.id)},U=I=>{n.bankTab=I==="full"?"full":"split",ne()},E=()=>{let I=i("suite");if(!I)return;let G=F(),R=(Array.isArray(G?.items)?G.items:[]).find(B=>Number(B.id)===Number(n.selectedBankItemId))||null;for(let B of I.querySelectorAll(".qb-bank-row")){let Ee=Number(B.dataset.id)===Number(n.selectedBankItemId);B.classList.toggle("is-active",Ee);let Ce=B.querySelector("[data-qb-action='select-bank-item']");Ce&&Ce.setAttribute("aria-pressed",Ee?"true":"false")}let V=I.querySelector("[data-qb-bank-answer]");V&&(V.innerHTML=So(n,R))},L=async()=>{let I=i("manage");if(I){d&&(window.clearTimeout(d),d=null),o(I,"\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026");try{let G=await W.questionBankItems({...n.filters,...n.filters.status==="retired"?{include_deleted:!0}:{}},n.limit,n.offset);n.items=G.items||[],n.total=Number(G.total||0),n.stats=G.stats||n.stats,l(I),I.innerHTML=Hu(n),v()}catch(G){l(I),I.innerHTML=`<section class="report-card qb-card">${Pe({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(G.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},T=async({refreshAnswers:I=!1}={})=>{let G=i("suite");if(G){o(G,"\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026");try{let[w,R]=await Promise.all([W.benchmarkSuites(),W.benchmarkReadyQuestions(300)]);n.suites=w.suites||[],n.ready=R.items||[];let V=F();if(n.suiteAnswersError="",n.suiteAnswersLoading=!1,V&&(I||!n.suiteAnswers[String(V.id)]))try{let B=await W.benchmarkSuiteLatestAnswers(V.id);n.suiteAnswers[String(V.id)]=B.answers||{}}catch(B){n.suiteAnswersError=B.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}l(G),G.innerHTML=wo(n)}catch(w){l(G),G.innerHTML=`<section class="report-card qb-card">${Pe({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(w.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},te=()=>{let I=i("review");I&&(I.innerHTML=Vu(n))},le=async I=>{let G=n.reviewItems.find(R=>Number(R.id)===Number(I));if(!G)return;n.reviewDetail=G,te();let w=i("review")?.querySelector(".qb-review-detail-pane");w&&window.matchMedia("(max-width: 1020px)").matches&&w.scrollIntoView({behavior:"smooth",block:"start"});try{let R=await W.questionBankItem(G.id);Number(n.reviewDetail?.id)===Number(G.id)&&(n.reviewDetail=R,te())}catch(R){P(R.message||"\u984C\u76EE\u5167\u5BB9\u8B80\u53D6\u5931\u6557\u3002","danger")}},Q=async()=>{let I=i("review");if(!I)return;o(I,"\u8B80\u53D6\u9A57\u6536\u984C\u76EE\u4E2D\u2026");let G=n.reviewFilter||"queue",w=G==="queue"?["pending_review","changes_requested"]:G==="accepted"?["accepted"]:G==="rejected"?["rejected"]:["draft"];try{let R=await Promise.all(w.map(Ce=>W.questionBankItems({status:Ce},200,0)));n.reviewItems=R.flatMap(Ce=>Ce.items||[]),n.stats=R[0]?.stats||n.stats;let V=Number(n.reviewDetail?.id||0),Ee=n.reviewItems.some(Ce=>Number(Ce.id)===V)?V:Number(n.reviewItems[0]?.id||0);n.reviewDetail=Ee?await W.questionBankItem(Ee):null,l(I),te(),v()}catch(R){l(I),I.innerHTML=`<section class="report-card qb-card">${Pe({tone:"danger",title:"\u9A57\u6536\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:r(R.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}};function me(I){let G=n.tab;n.tab=I;for(let w of Object.keys(a)){let R=i(w);R&&(R.hidden=w!==I)}I==="create"?(G!=="create"&&!n.editing&&(n.aiQuestion="",n.aiResult=null),b()):I==="manage"?L():I==="suite"?T():I==="review"&&Q()}let ye=I=>{let w=[...n.items,...n.reviewItems,...n.reviewDetail?[n.reviewDetail]:[]].find(V=>Number(V.id)===Number(I));n.reviewDetail=w||{id:Number(I)};let R=w?.status;["accepted","rejected","draft"].includes(R)?n.reviewFilter=R:R&&(n.reviewFilter="queue"),f("review")},H=async I=>{let G=sp(I),w=Number(I.elements.item_id?.value||0);w||(G.status=I.elements.submit_for_review?.checked?"pending_review":"draft");try{w?(await W.updateQuestionBankItem(w,{...G,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),P("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await W.createQuestionBankItem(G),P(G.status==="draft"?"\u984C\u76EE\u5DF2\u5B58\u70BA\u8349\u7A3F\uFF0C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002":"\u984C\u76EE\u5DF2\u5EFA\u7ACB\u4E26\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok")),n.editing=null;let R=["manage","suite","review"].includes(n.editingFrom)?n.editingFrom:"manage";n.editingFrom="",n.suiteAnswers={},await p(),f(R)}catch(R){let V=R.detail||R.payload?.detail,B=V?.errors?.join(" \xB7 ")||V?.message||R.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";P(B,"danger",8e3)}},ve=async I=>{let G=String(new FormData(I).get("question")||"").trim();if(G.length<4){P("\u984C\u76EE\u81F3\u5C11\u9700\u8981 4 \u500B\u5B57\u3002","danger");return}n.aiQuestion=G,n.aiLoading=!0,n.aiResult=null,b();try{let w=await W.createQuestionBankItemWithAI({question:G});n.aiResult=w,n.aiQuestion="",await p(),P(`Ollama \u5DF2\u5EFA\u7ACB\u984C\u76EE #${w.item.id}\uFF0C\u72C0\u614B\u70BA\u5F85\u5BE9\uFF0C\u8ACB\u4EBA\u5DE5\u8986\u6838\u3002`,"ok",8e3)}catch(w){let R=w.detail||w.payload?.detail,V=R?.errors?.join(" \xB7 ")||R?.message||w.message||"Ollama \u7522\u751F\u5931\u6557\u3002";P(V,"danger",12e3)}finally{n.aiLoading=!1,b()}},Z=async(I,G)=>{let w=Number(I.dataset.id||0);if(w)try{await W.reviewQuestionBankItem(w,{decision:G,reviewer:g(),rubric_scores:tp(I),comment:String(I.querySelector('[name="comment"]')?.value||"")}),P(G==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":G==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",G==="approved"?"ok":"info"),await p(),await Q()}catch(R){let V=R.detail||R.payload?.detail,B=V?.errors?.join(" \xB7 ")||V?.message||R.message||"\u9A57\u6536\u5931\u6557\u3002";P(B,"danger",8e3)}},xe=async I=>{let G=new FormData(I),w=Number(G.get("suite_id")||0),R=Array.from(I.querySelectorAll('input[name="item_ids"]:checked')).map(B=>Number(B.value)),V={name:String(G.get("name")||"").trim(),tier:String(G.get("tier")||"core"),description:String(G.get("description")||"").trim(),item_ids:R};try{w?(await W.updateBenchmarkSuite(w,V),P("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await W.createBenchmarkSuite(V),P("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),n.editingSuite=null,n.suiteManageOpen=!0,n.suiteAnswers={},await T()}catch(B){let Ee=B.detail||B.payload?.detail,Ce=Ee?.errors?.join(" \xB7 ")||Ee?.message||B.message||"Suite \u5132\u5B58\u5931\u6557\u3002";P(Ce,"danger",8e3)}},$e=async I=>{let G=e.querySelector("[data-qb-tag-filter] [data-qb-tag-popover]:not([hidden])")?.closest("[data-qb-tag-filter]");G&&!I.target.closest("[data-qb-tag-filter]")&&x(G);let w=I.target.closest("[data-qb-action]")?.dataset.qbAction;if(!w)return;let R=I.target.closest("[data-qb-action]"),V=Number(R.dataset.id||0);if(w==="open-tag-search"){let B=R.closest("[data-qb-tag-filter]");j(B,{focus:!0});return}if(w==="select-tag"){await A(R.dataset.tag);return}if(w==="remove-tag"){await A(R.dataset.tag);return}if(w==="bank-tab"){U(R.dataset.tab);return}if(w==="select-bank-item"){n.selectedBankItemId=V,E();return}if(w==="new"){n.editing=null,n.editingFrom="",n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,f("create");return}if(w==="reset-create"){n.editing=null,b();return}if(w==="reset-ai"){n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,b();return}if(w==="edit"){let B=n.suites.find(Be=>Number(Be.id)===Number(n.selectedSuiteId)),Ce=[...n.items,...n.reviewItems,...B?.items||[],...n.reviewDetail?[n.reviewDetail]:[]].find(Be=>Number(Be.id)===V);if(!Ce)return;n.editing=Ce,n.editingFrom=n.tab,f("create");return}if(w==="review"){ye(V);return}if(w==="review-ai-item"){let B=n.aiResult?.item;if(!B)return;n.reviewFilter="queue",n.reviewDetail=B,f("review");return}if(w==="review-filter"){let B=String(R.dataset.filter||"queue");n.reviewFilter=["queue","accepted","rejected","draft"].includes(B)?B:"queue",n.reviewDetail=null,await Q();return}if(w==="select-review-item"){await le(V);return}if(w==="go-manage"){f("manage");return}if(w==="submit-review"){try{await W.submitQuestionBankItemForReview(V),P("\u5DF2\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok"),await p(),n.tab==="manage"?await L():n.tab==="review"&&await Q()}catch(B){let Ee=B.detail||B.payload?.detail,Ce=Ee?.errors?.join(" \xB7 ")||Ee?.message||B.message||"\u9001\u5BE9\u5931\u6557\u3002";P(Ce,"danger",8e3)}return}if(w==="restore"){if(!window.confirm(`\u78BA\u5B9A\u5FA9\u539F\u984C\u76EE #${V}\uFF1F\u5FA9\u539F\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\u72C0\u614B\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002`))return;try{await W.restoreQuestionBankItem(V),P("\u984C\u76EE\u5DF2\u5FA9\u539F\u4E26\u56DE\u5230\u5F85\u5BE9\u3002","ok"),await p(),await L()}catch(B){let Ee=B.detail||B.payload?.detail,Ce=Ee?.errors?.join(" \xB7 ")||Ee?.message||B.message||"\u5FA9\u539F\u5931\u6557\u3002";P(Ce,"danger",8e3)}return}if(w==="delete"){if(n.tab==="suite"){let B=F();if(!B||!(B.items||[]).find(Ce=>Number(Ce.id)===V)||!window.confirm(`\u78BA\u5B9A\u5F9E\u300C${B.name}\u300D\u79FB\u9664\u984C\u76EE #${V}\uFF1F\u984C\u76EE\u4ECD\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u7BA1\u7406\u4E2D\u3002`))return;try{await W.removeBenchmarkSuiteItem(B.id,V),P("\u5DF2\u5F9E Benchmark \u984C\u5EAB\u79FB\u9664\u3002","info"),delete n.suiteAnswers[String(B.id)],Number(n.selectedBankItemId)===V&&(n.selectedBankItemId=null),await T()}catch(Ce){P(Ce.message||"\u79FB\u9664\u5931\u6557\u3002","danger")}return}if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${V}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await W.deleteQuestionBankItem(V),P("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await p(),n.tab==="review"?(n.reviewDetail=null,await Q()):await L()}catch(B){P(B.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(w==="revalidate"){try{let B=await W.revalidateQuestionBank();P(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${c(B.checked||0)} \u984C\uFF0C${c(B.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await p(),await L()}catch(B){P(B.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(w==="export"){try{let B=await W.exportQuestionBank({status:""});Rt(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(B,null,2),"application/json;charset=utf-8")}catch(B){P(B.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(w==="import-json"){let B=e.querySelector("#qb-import-json");try{let Ee=JSON.parse(String(B?.value||"").trim()),Ce=await W.importQuestionBank(Ee);P(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${Ce.created}\u3001\u66F4\u65B0 ${Ce.updated}\u3001\u932F\u8AA4 ${(Ce.errors||[]).length}\u3002`,(Ce.errors||[]).length?"warn":"ok",8e3),B&&(B.value=""),await p(),await L()}catch(Ee){P(Ee.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(w==="prev"||w==="next"){n.offset=Math.max(0,n.offset+(w==="next"?n.limit:-n.limit)),await L();return}if(w==="suite-edit"){let B=n.suites.find(Ee=>Number(Ee.id)===V);if(!B)return;n.editingSuite=B,n.suiteManageOpen=!0,T();return}if(w==="suite-new"){n.editingSuite=null,n.suiteManageOpen=!0,T();return}if(w==="suite-freeze"){try{await W.updateBenchmarkSuite(V,{freeze:!0}),P("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),n.editingSuite=null,n.suiteManageOpen=!0,await T()}catch(B){P(B.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(w==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${V}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await W.deleteBenchmarkSuite(V),P("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),n.editingSuite=null,n.suiteAnswers={},n.suiteManageOpen=!0,await T()}catch(B){P(B.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(w==="decide"){let B=R.closest("form[data-qb-form='review']");B&&await Z(B,String(R.dataset.decision||""))}},ee=async I=>{let G=I.target.closest("[data-qb-form]");if(!G)return;I.preventDefault();let w=G.dataset.qbForm;if(w==="create")await H(G);else if(w==="ai-create")await ve(G);else if(w==="filter"){let R=new FormData(G);n.filters={query:String(R.get("query")||"").trim(),status:String(R.get("status")||""),question_type:String(R.get("question_type")||""),difficulty:String(R.get("difficulty")||""),tags:R.getAll("tags").map(V=>String(V).trim()).filter(Boolean)},n.offset=0,await L()}else w==="suite"&&await xe(G)},re=async I=>{let G=I.target.closest?.("form[data-qb-form='filter'] select");if(G){G.form.requestSubmit();return}let w=I.target.closest?.("[data-qb-suite-select]");if(!w)return;let R=Number(w.value||0);!R||R===Number(n.selectedSuiteId)||await fe(R)},he=I=>{let G=I.target;G?.matches?.(".qb-suite-manage")&&(n.suiteManageOpen=!!G.open)},ge=I=>{let G=I.target.closest?.("[data-qb-action='open-tag-search']");G&&j(G.closest("[data-qb-tag-filter]"))},Ae=I=>{let G=I.target.closest?.("[data-qb-tag-filter]");G&&(I.relatedTarget&&G.contains(I.relatedTarget)||x(G))},ke=I=>{let G=I.target.closest?.("[data-qb-tag-search]");if(!G)return;let w=G.closest("[data-qb-tag-filter]");d&&window.clearTimeout(d),d=window.setTimeout(()=>{k(w,G.value)},160)},Ne=I=>{let G=I.target.closest?.("[data-qb-tag-search]");if(!G)return;let w=G.closest("[data-qb-tag-filter]");I.key==="Escape"?(I.preventDefault(),x(w),G.blur()):I.key==="Enter"?(I.preventDefault(),w?.querySelector("[data-qb-action='select-tag']")?.click()):I.key==="ArrowDown"&&(I.preventDefault(),w?.querySelector("[data-qb-action='select-tag']")?.focus())};e.addEventListener("click",$e),e.addEventListener("submit",ee),e.addEventListener("change",re),e.addEventListener("toggle",he,!0),e.addEventListener("mouseover",ge),e.addEventListener("mouseout",Ae),e.addEventListener("input",ke),e.addEventListener("keydown",Ne);let ze=async()=>{await p(),n.tab==="create"?b():n.tab==="manage"?await L():n.tab==="suite"?await T({refreshAnswers:!0}):n.tab==="review"&&await Q()};return p(),{show:me,refresh:ze,destroy(){d&&window.clearTimeout(d),e.removeEventListener("click",$e),e.removeEventListener("submit",ee),e.removeEventListener("change",re),e.removeEventListener("toggle",he,!0),e.removeEventListener("mouseover",ge),e.removeEventListener("mouseout",Ae),e.removeEventListener("input",ke),e.removeEventListener("keydown",Ne)},getStats:()=>n.stats}}function Da(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function qo(e){return e==null?"\u2014":c(e)}function ap(e){return e.count?e.severity==="danger"?Ue("failed","\u9700\u8655\u7406"):e.severity==="warn"?Ue("warning","\u6CE8\u610F"):Ue("preview","\u63D0\u793A"):Ue("success","\u901A\u904E")}function np(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function rp(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${np(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${r(e.label)}</span>
      ${ap(e)}
    </div>
    <div class="quality-check-value">
      <strong>${c(t)}</strong>
      <span>\u7B46</span>
      <em>${r(Da(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${r(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function Ia(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
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
  </div>`}function ip(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},n=t.postgres_diff,i=n==null?"\u2014":n===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${c(Math.abs(n))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${c(t.vector_indexed)} / ${c(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${m("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${c(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${c(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${qo(t.postgres_judgments)}</div>
      <div class="metric-foot">${r(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${r(Da(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${r(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${qo(a.candidate_total)}</div>
      <div class="metric-foot">${c(a.candidate_archive_count)} / ${c(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function op(e){return e.length?`<div class="table-wrap">
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
                <span class="mono">${r(t.archive||"\u2014")}</span>
                ${t.version?`<span class="chip">v${r(t.version)}</span>`:""}
              </td>
              <td class="cell-number">${c(t.rows)}</td>
              <td class="cell-number">${a}</td>
              <td class="cell-number">${c(t.matched_rows)}</td>
              <td class="cell-number">${r(Da(t.match_rate))}</td>
              <td class="cell-number">${c(t.short_text_rows)}</td>
              <td class="cell-number">${c(s)}</td>
              <td class="cell-number">${c(t.duplicate_content_rows)}</td>
              <td class="cell-date">${r(Nt(t.date_min))} \u2013 ${r(Nt(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:ut({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function lp(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],n=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=qe(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${Ue(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${c(t.rows)} \u7B46 \xB7 ${c(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${de(e.scan_ms||0)} \xB7
          ${r(be(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${m("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${Pe({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(u=>r(u)).join("<br>")})}</div>`:""}
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
        <div class="summary-value">${r(Da(t.match_rate))}</div>
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
          ${c(n.ok_count)} \u9805\u901A\u904E \xB7
          ${c(n.warning_count)} \u9805\u6CE8\u610F \xB7
          ${c(n.danger_count)} \u9805\u9700\u8655\u7406 \xB7
          ${c(n.info_count)} \u9805\u63D0\u793A
        </span>
      </div>
      <div class="quality-checks">${a.map(rp).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${ip(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${c(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${op(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${Ia("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${Ia("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${Ia("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${Ia("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function cp(e){e.innerHTML=`<section class="page data-page quality-page">
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
            <span class="status-tab-copy"><strong>\u984C\u5EAB\u65B0\u589E</strong><small>Ollama \u81EA\u52D5\u51FA\u984C\u8207 JSON \u532F\u5165</small></span>
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),n=[...e.querySelectorAll("[data-quality-tab]")],i={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},o=null,l="overview",u=()=>{if(!o)return;t.innerHTML=lp(o),a.textContent=`DUCKDB \xB7 ${c(o.totals?.rows)} \u7B46 \xB7 ${de(o.scan_ms||0)}`;let b=e.querySelector("#quality-badge-overview");b&&(b.textContent=c(o.totals?.rows||0))},d=b=>{l=b==="overview"?"overview":b;for(let y of n){let k=y.dataset.qualityTab===l;y.classList.toggle("is-active",k),k?y.setAttribute("aria-current","page"):y.removeAttribute("aria-current")}for(let[y,k]of Object.entries(i))k&&(k.hidden=y!==l);l!=="overview"?a.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":o&&u()},g=Ao(e,{onNavigate:b=>d(b),onStats:b=>{let y=b||{},k=e.querySelector("#quality-badge-manage"),j=e.querySelector("#quality-badge-suite"),x=e.querySelector("#quality-badge-review");k&&(k.textContent=c(y.total||0)),j&&(j.textContent=c(y.benchmark_ready||0)),x&&(x.textContent=c((y.pending_review||0)+(y.changes_requested||0)))}}),v=b=>{d(b),b!=="overview"&&g.show(b)},f=async()=>{je(s,!0,"\u6383\u63CF\u4E2D\u2026");try{o=await W.quality(),u()}catch(b){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${Pe({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:r(b.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",P("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{je(s,!1)}},p=async()=>{l==="overview"?await f():await g.refresh()};s.addEventListener("click",p),e.addEventListener("click",b=>{let y=b.target.closest("[data-quality-tab]");y&&v(y.dataset.qualityTab||"overview")}),t.addEventListener("click",b=>{!b.target.closest("[data-action='export-quality']")||!o||Rt(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(o,null,2),"application/json;charset=utf-8")}),d("overview"),await f()}var ur={};Zt(ur,{render:()=>Gp});var Oa={};Zt(Oa,{render:()=>cr});var Mo={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function Lo(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${r(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${r(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function dp(e){let t=e?.supports_chat,s=t===!0?"badge-ok":t===!1?"badge-danger":"badge-neutral",a=t===!0?"\u652F\u63F4 chat":t===!1?"\u4E0D\u652F\u63F4 chat":"\u672A\u6E2C\u8A66",n=(Array.isArray(e?.capabilities)?e.capabilities:[]).map(i=>`<span class="chip chip-mono">${r(i)}</span>`).join("");return`<div class="tests-llm-row">
    <div class="tests-llm-model">
      <strong class="mono">${r(e?.model||"\u2014")}</strong>
      <small>${r(e?.detail||"")}</small>
    </div>
    <div class="tests-llm-meta">
      <span class="badge ${s}">${a}</span>
      ${e?.tested_now?'<span class="badge badge-info">\u672C\u6B21\u65B0\u6E2C</span>':""}
      ${n}
      <span class="tests-llm-time">${e?.tested_at?`\u6E2C\u8A66\u65BC ${r(be(e.tested_at))}`:"\u5C1A\u7121\u6E2C\u8A66\u7D00\u9304"}</span>
    </div>
  </div>`}function up(e){let t=Array.isArray(e?.models)?e.models:[],s=e?.counts||{},a=Array.isArray(e?.failures)?e.failures:[];return{summary:e?`<span>Ollama <strong>${s.available??t.length}</strong> \u500B\u6A21\u578B</span>
      <span>\u652F\u63F4 chat <strong>${s.chat??0}</strong></span>
      <span>\u4E0D\u652F\u63F4 <strong>${s.unsupported??0}</strong></span>
      <span>\u672A\u6E2C\u8A66 <strong>${s.untested??0}</strong></span>
      <span>\u672C\u6B21\u65B0\u6E2C <strong>${(e.tested_now||[]).length}</strong></span>
      <span class="muted">${r(e.detail||"")}</span>`:"<span>\u6B63\u5728\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u2026</span>",list:t.length?t.map(dp).join(""):'<div class="tests-llm-empty">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u8ACB\u78BA\u8A8D Ollama \u5DF2\u555F\u52D5\u4E26\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66\u3002</div>',failures:a.length?`<div class="tests-llm-failures">${a.map(i=>`<span><strong class="mono">${r(i.model||"\u2014")}</strong> ${r(i.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function pp(e){let t=String(e?.status||"degraded"),s=t==="operational"?"badge-ok":t==="disabled"?"badge-neutral":"badge-danger",a=Array.isArray(e?.scores)?e.scores.slice(0,4):[],n=Array.isArray(e?.results)?e.results[0]:null;return`<div class="tests-llm-row">
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
  </div>`}function mp(e){if(!e)return{summary:"<span>\u6B63\u5728\u8B80\u53D6 reranker \u72C0\u614B\u2026</span>",list:"",failures:""};let t=Array.isArray(e.providers)?e.providers:[],s=e.active||{},a=String(e.status||"degraded"),n=a==="operational"?"badge-ok":a==="not_configured"?"badge-neutral":"badge-danger",i=t.flatMap(o=>(o.errors||[]).map(l=>({model:o.url,detail:l})));return{summary:`<span>\u72C0\u614B <span class="badge ${n}">${r(a)}</span></span>
      <span>\u6A21\u578B <strong>${r(e.model||"\u2014")}</strong></span>
      <span>\u555F\u7528 <strong>${e.enabled?"true":"false"}</strong></span>
      ${s.url?`<span>\u4F5C\u7528\u4E2D <strong class="mono">${r(s.url)}</strong></span>`:""}
      <span class="muted">${r(e.detail||"")}</span>`,list:t.length?t.map(pp).join(""):'<div class="tests-llm-empty">\u6C92\u6709\u8A2D\u5B9A RERANK_URL\uFF1B\u8ACB\u8A2D\u5B9A primary \u6216 fallback reranker\u3002</div>',failures:i.length?`<div class="tests-llm-failures">${i.map(o=>`<span><strong class="mono">${r(o.model||"\u2014")}</strong> ${r(o.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function gp(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,total_ms:e.total_ms,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}:${a.duration_ms}`)}:null})}async function cr(e,t,{embedded:s=!1}={}){let a=!1,n=!1,i={embedding:[],llm:[]},o=!1,l=null,u=!1,d=null,g=!1,v=null,f=[],p="",b=null,y="",k=`<div class="page-actions">
      <span class="badge badge-neutral badge-mono" id="tests-mode-badge">\u8B80\u53D6\u4E2D</span>
      <button class="btn btn-secondary" type="button" id="tests-refresh">
        ${m("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
      </button>
    </div>`,j=s?`<div class="tests-embed-head">
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
    ${j}

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
            <span class="field-help">\u672C\u6A5F 127.0.0.1 \u53EF\u76F4\u63A5\u4F7F\u7528\uFF1B\u900F\u904E cloudflared \u6216\u5176\u4ED6\u4E3B\u6A5F\u9023\u7DDA\u6642\uFF0C\u9060\u7AEF\u7BA1\u7406 API \u9700\u8981\u6B64\u6B0A\u6756\u3002\u6B0A\u6756\u4E0D\u6703\u9001\u5F80 ?api= \u6307\u5B9A\u7684\u4F4D\u5740\u3002</span>
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
          <div class="tests-card-copy">\u6AA2\u67E5 Ollama \u4E0A\u6BCF\u500B\u6A21\u578B\u662F\u5426\u652F\u63F4 chat\uFF0C\u4E26\u628A\u7D50\u679C\u5BEB\u5165\u80FD\u529B\u6E05\u55AE\uFF1B\u5DF2\u6709\u6E2C\u8A66\u7D00\u9304\u7684\u6A21\u578B\u4E0D\u6703\u91CD\u6E2C\u3002LLM \u6548\u80FD\u8A55\u4F30\u53EA\u6703\u7D0D\u5165\u652F\u63F4 chat \u7684\u6A21\u578B\u3002</div>
        </div>
      </div>
      <div class="tests-llm-head">
        <div class="tests-llm-summary" id="tests-llm-summary">\u6B63\u5728\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u2026</div>
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
  </section>`;let x=e.querySelector("#tests-mode-badge"),A=e.querySelector("#tests-mode-toggle"),F=e.querySelector("#tests-mode-summary"),ne=e.querySelector("#tests-mode-models"),Y=e.querySelector("#tests-mode-status"),Se=e.querySelector("#tests-api-form"),fe=e.querySelector("#tests-api-input"),U=e.querySelector("#tests-admin-token-input"),E=e.querySelector("#tests-api-preview"),L=e.querySelector("#tests-api-status"),T=e.querySelector("#tests-api-note"),te=e.querySelector("#tests-api-test"),le=e.querySelector("#tests-api-reset"),Q=e.querySelector("#tests-api-save"),me=e.querySelector("#tests-refresh"),ye=e.querySelector("#tests-flow"),H=e.querySelector("#tests-llm-summary"),ve=e.querySelector("#tests-llm-list"),Z=e.querySelector("#tests-llm-failures"),xe=e.querySelector("#tests-llm-status"),$e=e.querySelector("#tests-llm-test"),ee=e.querySelector("#tests-rerank-summary"),re=e.querySelector("#tests-rerank-list"),he=e.querySelector("#tests-rerank-failures"),ge=e.querySelector("#tests-rerank-status"),Ae=e.querySelector("#tests-rerank-test");U&&(U.value=ra());let ke=(ae,we,Qe="")=>{ae&&(ae.textContent=we,ae.className=`tests-status${Qe?` is-${Qe}`:""}`)},Ne=(ae,we="")=>{L&&(L.textContent=ae,L.className=`api-dialog-status${we?` is-${we}`:""}`)},ze=()=>Tt()==="query",I=()=>{let ae=Jt(fe.value);return ae||(window.location.protocol==="file:"?Xa:"")},G=()=>{let ae=I(),we=Ot(),Qe=Mo[Tt()]||Tt()||"\u540C\u6E90";E.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${r(es(we))}</strong>${we?`\uFF08${r(Qe)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${r(dt("/api/health",ae))}`},w=()=>{let ae=Tt(),we=`\u76EE\u524D\u4F86\u6E90\uFF1A${Mo[ae]||ae||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,Qe="";ae==="query"?(Qe="is-warn",we="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):na()?(Qe="is-warn",we="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(ae==="file-default"||window.location.protocol==="file:")&&(we="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),we+=(U?.value||ra()).trim()?" \u7BA1\u7406\u6B0A\u6756\uFF1A\u5DF2\u8A2D\u5B9A\uFF0C\u6703\u9001\u5F80\u76EE\u524D\u8A2D\u5B9A\u7684 API Base\u3002":" \u7BA1\u7406\u6B0A\u6756\uFF1A\u672A\u8A2D\u5B9A\uFF1B\u672C\u6A5F loopback \u53EF\u76F4\u63A5\u4F7F\u7528\uFF0C\u9060\u7AEF\u7BA1\u7406 API \u6703\u88AB\u62D2\u7D55\u3002",T.textContent=we,T.className=`api-dialog-note${Qe?` ${Qe}`:""}`;let Ke=ae==="query";Q.disabled=Ke,le.disabled=Ke,fe.readOnly=Ke},R=()=>{if(!Za(fe.value))return Ne("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),fe.focus(),null;let ae=I();return window.location.protocol==="https:"&&/^http:\/\//i.test(ae)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(ae)?(Ne("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),fe.focus(),null):ae},V=()=>{fe.value=Ot(),G(),w(),Ne("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},B=()=>{let ae=Array.isArray(i.embedding)?i.embedding.length:0,we=Array.isArray(i.llm)?i.llm.length:0;if(x&&(x.textContent=o?"\u5207\u63DB\u4E2D\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",x.className=`badge badge-mono ${o?"badge-info":n?"badge-warn":"badge-neutral"}`),A){A.disabled=o,A.classList.toggle("is-on",n),A.classList.toggle("is-off",!n&&!o),A.classList.toggle("is-busy",o),A.setAttribute("aria-checked",n?"true":"false"),A.setAttribute("aria-busy",o?"true":"false"),A.setAttribute("aria-label",o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":n?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),A.title=o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let Qe=A.querySelector(".header-power-label");Qe&&(Qe.textContent=o?"\u2026":n?"ON":"OFF")}F&&(F.textContent=n?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${ae} \u500B embedding \u8207 ${we} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),ne&&(ne.innerHTML=Lo("Embedding",i.embedding)+Lo("LLM",i.llm))},Ee=async()=>{try{let ae=await W.testMode();if(a)return;n=!!ae.enabled,i=ae.models||{embedding:[],llm:[]},ke(Y,"")}catch(ae){if(a)return;n=!1,i={embedding:[],llm:[]},ke(Y,ae.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}a||B()},Ce=async()=>{if(o)return;let ae=!n;o=!0,B(),ke(Y,ae?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let we=await W.setTestMode(ae);if(a)return;n=!!we.enabled,i=we.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:n,models:i}}));let Qe=i.embedding?.length||0,Ke=i.llm?.length||0;ke(Y,n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${Qe} \u500B embedding \u8207 ${Ke} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),P(n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${Qe} \u500B embedding\u3001${Ke} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",n?"ok":"info",6e3),await ft()}catch(we){a||(ke(Y,we.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),P(we.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{o=!1,a||B()}},Be=()=>{let ae=up(l);if(H&&(H.innerHTML=ae.summary),ve&&(ve.innerHTML=ae.list),Z&&(Z.innerHTML=ae.failures),$e){$e.disabled=u,$e.setAttribute("aria-busy",u?"true":"false");let we=$e.querySelector("span");we&&(we.textContent=u?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66")}},Ie=async()=>{try{let ae=await W.llmModels();if(a)return;l=ae,ke(xe,"")}catch(ae){if(a)return;l=null,ke(xe,ae.message||"\u7121\u6CD5\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u3002","error")}a||Be()},ct=async()=>{if(!u){u=!0,Be(),ke(xe,"\u6B63\u5728\u6AA2\u67E5 Ollama \u6A21\u578B\u8207 chat \u80FD\u529B\u2026");try{let ae=await W.testLlmModels();if(a)return;l=ae;let we=ae.tested_now?.length||0,Qe=ae.chat_models?.length||0,Ke=ae.failures?.length||0;ke(xe,`${we?`\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u672C\u6B21\u65B0\u6E2C ${we} \u500B\u6A21\u578B`:"\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u6C92\u6709\u65B0\u6A21\u578B"}\uFF0C\u76EE\u524D ${Qe} \u500B\u6A21\u578B\u652F\u63F4 chat${Ke?`\uFF1B${Ke} \u500B\u6A21\u578B\u66AB\u6642\u7121\u6CD5\u5224\u5B9A\uFF0C\u4E0B\u6B21\u6703\u91CD\u8A66`:""}\u3002`,Ke?"warn":"ok"),P(we?`LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u65B0\u589E ${we} \u7B46\u80FD\u529B\u7D00\u9304\u3002`:"LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u6C92\u6709\u65B0\u6A21\u578B\u9700\u8981\u6E2C\u8A66\u3002",Ke?"warn":"ok",5e3),await Ee()}catch(ae){a||(ke(xe,ae.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),P(ae.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{u=!1,a||Be()}}},Ve=()=>{let ae=mp(d);if(ee&&(ee.innerHTML=ae.summary),re&&(re.innerHTML=ae.list),he&&(he.innerHTML=ae.failures),Ae){Ae.disabled=g,Ae.setAttribute("aria-busy",g?"true":"false");let we=Ae.querySelector("span");we&&(we.textContent=g?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C Reranker \u670D\u52D9\u6E2C\u8A66")}},at=async()=>{try{let ae=await W.rerankStatus();if(a)return;d=ae,ke(ge,"")}catch(ae){if(a)return;d=null,ke(ge,ae.message||"\u7121\u6CD5\u8B80\u53D6 reranker \u72C0\u614B\u3002","error")}a||Ve()},jt=async()=>{if(!g){g=!0,Ve(),ke(ge,"\u6B63\u5728\u5C0D primary\uFF0Ffallback reranker \u57F7\u884C\u5BE6\u969B rerank \u6E2C\u8A66\u2026");try{let ae=await W.testReranker();if(a)return;d=ae;let we=Array.isArray(ae.providers)?ae.providers:[],Qe=we.filter(xt=>xt.status==="operational").length,Ke=we.reduce((xt,It)=>xt+(Array.isArray(It.errors)?It.errors.length:0),0);ke(ge,Ke?`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${Qe} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C${Ke} \u500B\u932F\u8AA4\uFF1B\u8A73\u7D30\u5206\u6578\u5DF2\u5217\u5728\u4E0A\u65B9\u3002`:`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${Qe} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C\u6A21\u578B ${ae.model||"\u2014"}\u3002`,Ke?"warn":"ok"),P(Ke?"Reranker \u90E8\u5206\u7AEF\u9EDE\u5931\u6557\uFF0C\u8ACB\u67E5\u770B\u6E2C\u8A66\u7D50\u679C\u3002":"Reranker \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\u3002",Ke?"warn":"ok",5e3)}catch(ae){a||(ke(ge,ae.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),P(ae.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{g=!1,a||Ve()}}},nt=()=>{if(!ye)return;let ae=gp(v,f,p);ae!==y&&(y=ae,ye.innerHTML=Ls(v,f,p))},We=async()=>{try{let ae=await W.testRuns(30);if(a)return;f=Array.isArray(ae.runs)?ae.runs:[]}catch{if(a)return;f=[]}},ft=async(ae=null)=>{try{let we=ae||(p?await W.testRun(p):await W.testRunCurrent());if(a)return;v=we.run||null,!p&&v&&v.status!=="running"&&!f.some(Qe=>Qe.run_id===v.run_id)&&await We()}catch{if(a)return;v=null}a||nt()};fe?.addEventListener("input",()=>{G(),Ne("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),U?.addEventListener("input",()=>{w()}),te?.addEventListener("click",async()=>{let ae=R();if(ae!==null){je(te,!0,"\u6E2C\u8A66\u4E2D\u2026"),Ne(`\u6B63\u5728\u9023\u7DDA\u5230 ${es(ae)||"\u540C\u6E90"}\u2026`);try{let we=await kr(ae);if(a)return;Ne(`\u9023\u7DDA\u6210\u529F \xB7 v${we.version} \xB7 ${we.duration_ms} ms \xB7 GET ${dt("/api/health",ae)}`,"ok")}catch(we){a||Ne(we.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{a||je(te,!1)}}}),Se?.addEventListener("submit",ae=>{if(ae.preventDefault(),ze())return;let we=R();we!==null&&(an(we),yr(U?.value||""),P(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${es(we)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),le?.addEventListener("click",()=>{ze()||(an(""),P("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),A?.addEventListener("click",Ce),$e?.addEventListener("click",ct),Ae?.addEventListener("click",jt),ye?.addEventListener("change",async ae=>{ae.target.id==="test-run-select"&&(p=String(ae.target.value||""),await ft())}),ye?.addEventListener("click",async ae=>{ae.target.closest("#test-flow-refresh")&&(p="",await We(),await ft())}),me?.addEventListener("click",async()=>{je(me,!0,"\u66F4\u65B0\u4E2D\u2026"),V(),await Promise.allSettled([Ee(),We(),Ie(),at()]),a||await ft(),a||(je(me,!1),P("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let St=ae=>{n=!!ae.detail?.enabled,i=ae.detail?.models||{embedding:[],llm:[]},B()};return window.addEventListener("judgment:test-mode",St),V(),B(),Be(),Ve(),await Promise.allSettled([Ee(),We(),Ie(),at()]),await ft(),b=vt("test-runs",async(ae,we)=>{a||document.hidden||p||await ft(we?.snapshot||null)}),!s&&typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{a=!0,b&&b(),window.removeEventListener("judgment:test-mode",St)}}var jo={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var Ro={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},dr=new Set,Co=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"tests",label:"\u7CFB\u7D71\u6E2C\u8A66",hint:"API\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u6A21\u578B Flow",icon:"terminal"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"local-model",label:"Model Provider",hint:"Ollama \u4E3B\u6A5F\u8207\u6A21\u578B",icon:"server"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 API \u2192 Pipeline \u2192 Data",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}],ea=[{id:"system",label:"\u7CFB\u7D71\u8207\u5373\u6642\u72C0\u614B",icon:"activity",prefixes:["/api/health","/api/status","/api/system-usage","/api/events/stream","/api/processing/events/status","/api/docs","/api/openapi.json"]},{id:"processing",label:"\u8CC7\u6599\u8655\u7406\u8207\u66F4\u65B0",icon:"database",prefixes:["/api/processing","/api/judgment-download","/api/updates","/api/courts","/api/law-versions"]},{id:"data",label:"\u67E5\u8A62\u8207\u8CC7\u6599",icon:"search",prefixes:["/api/query","/api/data","/api/judgment","/api/law","/api/schema","/api/catalog","/api/judgment-stats","/api/quality"]},{id:"rag",label:"RAG \u554F\u7B54",icon:"message",prefixes:["/api/rag"]},{id:"index",label:"\u7248\u672C\u8207\u7D22\u5F15",icon:"layers",prefixes:["/api/index-versions","/api/index-alias","/api/versioning"]},{id:"models",label:"\u6A21\u578B\u8207\u670D\u52D9",icon:"brain",prefixes:["/api/ollama","/api/llm","/api/rerank","/api/test-mode"]},{id:"tests",label:"\u6E2C\u8A66\u8207\u6548\u80FD",icon:"activity",prefixes:["/api/test-runs","/api/performance"]},{id:"question-bank",label:"\u984C\u5EAB",icon:"file",prefixes:["/api/question-bank"]},{id:"benchmark",label:"Benchmark",icon:"grid",prefixes:["/api/benchmark"]},{id:"other",label:"\u5176\u4ED6",icon:"terminal",prefixes:[]}];function fp(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Et(e).label,tone:Et(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function bp(e){let t=Et(e.status),s=jo[e.kind]||jo.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${c(e.latency_ms)} ms</span>`;return`<article class="service-card">
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
  </article>`}function hp(e,t){let s=typeof e=="string"?{label:e}:e||{},a=String(s.label||"\u2014"),n=s.service?t.find(l=>l.id===s.service):null,i=n?n.status==="operational":a==="IndexedDB"?Wr():!0,o=[s.detail||"",n?`\u72C0\u614B\uFF1A${Et(n.status).label}`:""].filter(Boolean).join(" \xB7 ");return`<div class="arch-node ${i?"":"is-muted"}" title="${r(o||(i?a:"\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"))}">
    <strong>${r(a)}</strong>
    ${s.detail?`<span class="arch-node-detail">${r(s.detail)}</span>`:""}
  </div>`}function vp(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>hp(l,t)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${r(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),n=[];return a.forEach((i,o)=>{o&&n.push(`<div class="arch-arrow" aria-hidden="true">${m("arrowRight",15)}</div>`),n.push(i)}),`<div class="arch-flow">${n.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${m("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>
    ${$p()}`}function $p(){return`<figure class="arch-diagram">
    <figcaption class="arch-diagram-head">
      <span class="section-title">\u6D41\u7A0B\u65B9\u5411\u793A\u610F\u5716</span>
      <span class="section-sub">\u76EE\u524D\u5C08\u6848\u7684\u8ACB\u6C42\u3001SSE\u3001RAG\u3001\u8655\u7406\u6D41\u7A0B\u3001\u80CC\u666F\u6392\u7A0B\u8207\u8CC7\u6599\uFF0F\u6A21\u578B\u670D\u52D9\u65B9\u5411\uFF1B\u5716\u8868\u53EF\u6C34\u5E73\u6372\u52D5</span>
    </figcaption>
    <div class="arch-diagram-scroll">
      <svg class="arch-diagram-svg" viewBox="0 0 1180 740" role="img" aria-labelledby="arch-flow-title arch-flow-desc">
        <title id="arch-flow-title">Judgment RAG Console \u524D\u5F8C\u7AEF\u6D41\u7A0B\u65B9\u5411\u793A\u610F\u5716</title>
        <desc id="arch-flow-desc">\u700F\u89BD\u5668 RAG Console \u900F\u904E REST \u8207 SSE \u9023\u7DDA FastAPI 9200\uFF1BFastAPI \u547C\u53EB RAG Orchestrator\u3001Processing Runtime\u3001Scheduler \u8207 Power Agent\u3002RAG \u8207\u8655\u7406\u6D41\u7A0B\u8B80\u5BEB PostgreSQL\u3001Qdrant\u3001Parquet \u8207 Ollama Embedding\u3001Reranker\u3001LLM\u3002\u700F\u89BD\u5668\u53E6\u4EE5 IndexedDB \u4FDD\u5B58\u63D0\u554F\u6B77\u53F2\u8207\u7A3D\u6838\u8CC7\u6599\u3002</desc>
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
        <text class="arch-diagram-node-title" x="314" y="94">FastAPI \xB7 127.0.0.1:9200</text>
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
        <text class="arch-diagram-node-title" x="565" y="558">Power Agent \xB7 :9201</text>
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
        <text class="arch-diagram-node-title" x="872" y="364">Ollama Embedding</text>
        <text class="arch-diagram-node-sub" x="872" y="383">bge-m3 \xB7 1,024 dims \xB7 x570\uFF0Flocal fallback</text>

        <rect class="arch-diagram-node" x="858" y="420" width="286" height="64" rx="9"></rect>
        <text class="arch-diagram-node-title" x="872" y="444">Reranker</text>
        <text class="arch-diagram-node-sub" x="872" y="463">bge-reranker-v2-m3 \xB7 primary\uFF0Ffallback</text>

        <rect class="arch-diagram-node" x="858" y="500" width="286" height="64" rx="9"></rect>
        <text class="arch-diagram-node-title" x="872" y="524">Ollama LLM</text>
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
      <span><b>\u2464</b> RAG \u8B80\u5BEB PostgreSQL\u3001Qdrant \u8207 Ollama \u6A21\u578B</span>
      <span><b>\u2465</b> \u8655\u7406\u6D41\u7A0B\u8B80\u5BEB Parquet\u3001PostgreSQL\u3001Qdrant</span>
      <span><b>\u2466</b> Scheduler\uFF0FCLI \u89F8\u767C\u6279\u6B21\u5DE5\u4F5C</span>
      <span><b>\u2467</b> \u700F\u89BD\u5668 IndexedDB \u672C\u5730\u4FDD\u5B58</span>
    </div>
  </figure>`}function Po(e){let t=String(e||""),s=a=>t===a||t.startsWith(`${a}/`);for(let a of ea)if(a.prefixes.some(s))return a;return ea[ea.length-1]}function yp(e){return`is-${String(e||"get").toLowerCase()}`}function wp(e){return`<div class="endpoint-row${e.deprecated?" is-deprecated":""}">
    <span class="endpoint-method ${yp(e.method)}">${r(e.method||"GET")}</span>
    <span class="endpoint-path" title="${r(e.path||"")}">${r(e.path||"")}</span>
    <span class="endpoint-label">${r(e.label||"")}</span>
  </div>`}function _p(e){if(!Array.isArray(e)||!e.length)return'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>';let t=new Map(ea.map(s=>[s.id,{group:s,endpoints:[]}]));for(let s of e){let a=Po(s.path),n=t.get(a.id);n&&n.endpoints.push(s)}return`<div class="api-endpoint-groups">${ea.map(s=>{let n=t.get(s.id)?.endpoints||[];return n.length?(n.sort((i,o)=>String(i.path).localeCompare(String(o.path))||String(i.method).localeCompare(String(o.method))),`<section class="card api-endpoint-group">
        <div class="side-card-head">
          <span class="side-card-title">${m(s.icon,14)}${r(s.label)}</span>
          <span class="badge badge-neutral badge-mono">${c(n.length)}</span>
        </div>
        <div class="endpoint-list">${n.map(wp).join("")}</div>
      </section>`):""}).join("")}</div>`}function Yt(e,t){return`<div class="detail-row">
    <span class="detail-label">${r(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function Oe(e,t,{mono:s=!1,wide:a=!1}={}){return`<div class="data-version-fact${a?" is-wide":""}">
    <span>${r(e)}</span>
    <strong class="${s?"mono":""}">${r(String(t??"\u2014"))}</strong>
  </div>`}function To(e,t,s,a=""){let n=t==null?null:Math.max(0,Math.min(100,Number(t)||0));return`<div class="data-version-coverage ${a}">
    <div class="data-version-coverage-head">
      <span>${r(e)}</span>
      <strong>${Ba(n)}</strong>
    </div>
    <div class="data-version-coverage-track"><span style="width:${n===null?0:n.toFixed(1)}%"></span></div>
    <div class="data-version-coverage-foot">${r(s)}</div>
  </div>`}function kp(e){if(!Array.isArray(e)||!e.length)return ut({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${r(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${oa(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function Sp(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=new Map(s.map(y=>[y.id,y])),n=a.get("qdrant"),i=a.get("embedding"),o=a.get("rag"),l=a.get("llm"),u=Number(t.judgment_indexed_count||0),d=Number(t.judgment_count||0),g=d?(u/d*100).toFixed(1):"0.0",v=t.judgment_vector_points===null||t.judgment_vector_points===void 0?"\u2014":c(t.judgment_vector_points),f=Number(t.judgment_index_remaining||0),p=o?.status==="operational"?"RAG \u5C31\u7DD2":o?.status==="not_configured"?"\u672A\u8A2D\u5B9A":o?.status==="degraded"?"\u964D\u7D1A":"\u672A\u77E5",b=[["cube","Qdrant \u5411\u91CF\u7D22\u5F15",n],["layers",`Embedding\uFF08${t.judgment_vector_model||"\u2014"}\uFF09`,i],["brain","RAG \u56DE\u7B54\u7BA1\u7DDA",o],["sparkles","LLM \u6A21\u578B",l]];return`<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}RAG \u8CC7\u6599\u73FE\u6CC1</span>
      ${Ue(o?.status,p)}
    </div>
    <div class="side-card-body">
      <div class="mini-stats">
        <div class="mini-stat">
          <div class="mini-stat-value">${c(d)}</div>
          <div class="mini-stat-label">\u5224\u6C7A</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${c(u)}</div>
          <div class="mini-stat-label">\u5DF2\u7D22\u5F15</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${g}%</div>
          <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
        </div>
      </div>
      <div class="side-status-list">
        ${b.map(([y,k,j])=>`<div class="side-status-row">
              <span>${m(y,13)}${r(k)}</span>
              ${Ue(j?.status,j?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
            </div>`).join("")}
      </div>
      <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
        Collection\uFF1A${r(t.judgment_vector_collection||"\u2014")} \xB7
        ${v} points \xB7 \u5269\u9918 ${c(f)} \u7B46\u5F85\u7D22\u5F15
      </div>
    </div>
    <div class="side-card-foot">
      PostgreSQL \u5224\u6C7A\u6587\u4EF6\u3001Qdrant \u5411\u91CF\u7D22\u5F15\u8207 Ollama \u6A21\u578B\u72C0\u614B\u7686\u70BA\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u5C31\u7DD2\u6642\u6703\u660E\u78BA\u964D\u7D1A\u3002
    </div>
  </section>`}function Ba(e){let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function Xt(e){return Math.max(0,Number(e?.duration_ms)||0)}function xp(e,t){let s=e?.pipeline&&typeof e.pipeline=="object"?e.pipeline:null,a=Array.isArray(s?.stages)?s.stages:[],n=Number(s?.total_ms)||a.reduce((f,p)=>f+Xt(p),0),i=Math.max(0,Number(t?.initMs)||0),o=Math.max(0,Number(t?.requestMs)||0),l=Math.max(o,n),u=Math.max(0,l-n),d=[],g=t?.requestStartedAt||e?.checked_at||null,v=t?.requestFinishedAt||e?.checked_at||null;if(i>.5&&d.push({key:"page-init",label:"\u9801\u9762\u521D\u59CB\u5316",caption:"\u5EFA\u7ACB\u670D\u52D9\u7E3D\u89BD\u9AA8\u67B6\u8207\u5C0E\u89BD",color:"#64748b",status:"success",duration_ms:i,started_at:t?.initStartedAt||g,finished_at:g,message:"\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u3001\u8F09\u5165\u6A21\u7D44\u4E26\u6E96\u5099\u8ACB\u6C42\u3002"}),a.length){u>.5&&d.push({key:"http",label:"HTTP \u50B3\u8F38\uFF0F\u6392\u968A",caption:"\u700F\u89BD\u5668 \u2192 FastAPI",color:"#94a3b8",status:"success",duration_ms:u,started_at:g,finished_at:v,message:"\u5305\u542B\u9023\u7DDA\u3001\u8ACB\u6C42\u6392\u968A\u8207\u56DE\u61C9\u50B3\u8F38\u3002"}),d.push(...a);let f=a.reduce((b,y)=>b+Xt(y),0),p=Math.max(0,n-f);p>.5&&d.push({key:"server-assemble",label:"\u4F3A\u670D\u5668\u5F59\u6574",caption:"\u72C0\u614B\u56DE\u61C9\u7D44\u88DD",color:"#cbd5e1",status:"success",duration_ms:p,started_at:a[a.length-1]?.finished_at||g,finished_at:v,message:"\u7D44\u88DD\u670D\u52D9\u3001\u8CC7\u6599\u91CF\u8207\u67B6\u69CB payload\u3002"})}else d.push({key:"status-request",label:"GET /api/status",caption:"\u670D\u52D9\u72C0\u614B\u8207\u8CC7\u6599\u91CF",color:"#64748b",status:"success",duration_ms:l,started_at:g,finished_at:v,message:"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF1B\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593\u3002"});return{total_ms:i+l,started_at:t?.initStartedAt||g,finished_at:v,stages:d,server_ms:n,request_ms:l,transport_ms:u,init_ms:i,detailed:!!s}}function Ap(e){let t=e?.page_pipeline,s=Array.isArray(t?.stages)?t.stages:[];if(!t||!s.length)return"";let a=Math.max(0,Number(t.total_ms)||s.reduce((A,F)=>A+Xt(F),0)),n=Math.max(a,s.reduce((A,F)=>A+Xt(F),0),1),i=1.25,o=s.filter(A=>String(A.status||"success")!=="skipped"),l=s.filter(A=>["success","no_change"].includes(String(A.status||"success"))).length,u=s.filter(A=>A.status==="failed").length,d=s.reduce((A,F)=>Xt(F)>Xt(A)?F:A,s[0]),g=Math.max(0,Number(t.server_ms)||Number(e?.pipeline?.total_ms)||0),v=Math.max(0,Number(t.transport_ms)||0),f=Math.max(0,Number(t.init_ms)||0),p=s.map(A=>String(A.status||"success")==="skipped"?0:Math.max(Xt(A)/n*100,i)),b=p.reduce((A,F)=>A+F,0),y=b>100?100/b:1,k=0,j=s.map((A,F)=>{let ne=String(A.status||"success"),Y=ne==="skipped",Se=A.label||A.key||`\u968E\u6BB5 ${F+1}`,fe=A.caption||"",U=Xt(A),E=Y?"\u2014":de(U),L=n>0?U/n*100:0,T=Y?0:p[F]*y,te=k;Y||(k+=T);let le=A.color||"#64748b",Q=ne==="failed"?"var(--danger)":le,me=[`is-${ne}`,ne==="failed"?"is-error":"",Y?"is-missing":""].filter(Boolean).join(" "),ye=T>0?`<span class="rag-wf-bar status-wf-bar is-sequential" style="left:${te.toFixed(3)}%;width:${T.toFixed(4)}%;top:0;height:12px;--bar-color:${r(Q)}" aria-hidden="true"></span>`:"",H=Y?"\u7565\u904E":ne==="failed"?"\u5931\u6557":"\u5B8C\u6210",ve=`${t.label||"status"}:${A.key||F}`,Z=[["\u72C0\u614B",H,!0],["\u958B\u59CB",A.started_at?be(A.started_at):"\u2014",!0],["\u7D50\u675F",A.finished_at?be(A.finished_at):"\u2014",!0],["\u8017\u6642",E,!0],["\u5360\u6574\u9AD4",Ba(L),!0],["\u8AAA\u660E",A.message||"",!1]].map(([xe,$e,ee])=>ee||$e?`<span class="rag-wf-detail"><span>${r(xe)}</span><strong>${r(String($e||"\u2014"))}</strong></span>`:"").join("");return`<details class="rag-wf-stage status-wf-stage ${me}" data-status-wf-stage="${r(ve)}"${dr.has(ve)?" open":""} style="--stage-color:${r(le)}">
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="status-wf-step">${String(F+1).padStart(2,"0")}</span> ${r(Se)}</strong>${fe?`<small>${r(fe)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(E)} \xB7 ${r(H)} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${Se}\uFF1A${H}\uFF0C\u8017\u6642 ${E}\uFF0C\u5360\u6574\u9AD4 ${Ba(L)}`)}">${ye}</span>
        </summary>
        <div class="rag-wf-details">${Z}</div>
      </details>`}).join(""),x=t.detailed?"\u5F8C\u7AEF /api/status \u968E\u6BB5\u660E\u7D30":"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF0C\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593";return`<section class="report-card status-wf-card" data-status-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m("activity",14)}\u670D\u52D9\u7E3D\u89BD\u8F09\u5165 Pipeline</span>
      <div class="index-runtime-metrics">
        <span class="index-runtime-metric" title="\u672C\u6B21\u9801\u9762\u521D\u59CB\u5316\u5230\u72C0\u614B\u56DE\u61C9\u5B8C\u6210\u7684\u7E3D\u6642\u9593\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(de(a))}</strong></span>
        <span class="index-runtime-metric" title="\u5F8C\u7AEF /api/status \u6AA2\u67E5\u968E\u6BB5\u7684\u5408\u8A08\u6642\u9593\u3002"><span>Server</span><strong>${r(de(g))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u8ACB\u6C42\u6642\u9593\u6263\u6389\u5F8C\u7AEF\u6AA2\u67E5\u5F8C\u7684\u50B3\u8F38\u8207\u6392\u968A\u6642\u9593\u3002"><span>HTTP \u50B3\u8F38</span><strong>${r(de(v))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u9AA8\u67B6\u8207\u8F09\u5165\u6A21\u7D44\u7684\u6642\u9593\u3002"><span>\u9801\u9762\u521D\u59CB\u5316</span><strong>${r(de(f))}</strong></span>
        <span class="index-runtime-metric" title="\u8017\u6642\u6700\u9577\u7684\u6AA2\u67E5\u968E\u6BB5\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${d?.label||"\u2014"} \xB7 ${de(Xt(d))}`)}</strong></span>
        <span class="index-runtime-metric" title="\u5B8C\u6210\u7684\u6AA2\u67E5\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\uFF1B\u5931\u6557\u968E\u6BB5\u6703\u4EE5\u7D05\u8272\u6A19\u793A\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${c(l)} / ${c(s.length)}${u?` \xB7 \u5931\u6557 ${c(u)}`:""}</strong></span>
      </div>
    </div>
    <div class="status-wf-summary">
      <span>\u6AA2\u67E5 <strong>${r(be(e.checked_at))}</strong></span>
      <span>API <strong class="mono">${r(es())}</strong></span>
      <span>\u7248\u672C <strong class="mono">v${r(e.version||"\u2014")}</strong></span>
      <span>\u74B0\u5883 <strong>${r(e.environment||"\u2014")}</strong></span>
      <span>${r(x)}</span>
    </div>
    <div class="status-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${r(de(a))}</span>
      </div>
      <div class="rag-wf-legend workflow-wf-legend" aria-label="\u968E\u6BB5\u72C0\u614B\u5716\u4F8B">
        <span><i class="is-solid-state"></i>\u5B8C\u6210</span>
        <span><i class="is-failed-state"></i>\u5931\u6557</span>
        <span><i class="is-empty-state"></i>\u7565\u904E</span>
      </div>
      <div class="rag-wf-stages">${j}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u986F\u793A\u672C\u6B21\u958B\u555F\u670D\u52D9\u7E3D\u89BD\u7684\u9801\u9762\u521D\u59CB\u5316\u3001HTTP \u5F80\u8FD4\u3001\u5F8C\u7AEF\u6AA2\u67E5\u8207\u56DE\u61C9\u5F59\u6574\u3002\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u5931\u6557\u968E\u6BB5\u4EE5\u7D05\u8272\u6A19\u793A\uFF0C\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\uFF1B\u6975\u77ED\u968E\u6BB5\u4FDD\u7559\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function qp(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=fp(e.status),n=s.find(d=>d.id==="qdrant"),i=s.find(d=>d.id==="rag"),o=s.find(d=>d.id==="llm"),l=Tt(),u=Ro[l]||l;return`<section class="status-hero">
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
          <span>${m("clock",11)} \u6AA2\u67E5\u6642\u9593 ${be(e.checked_at)} \xB7 ${r(Ps(e.checked_at))}</span>
          <span>${m("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${m("database",11)} ${c(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${m("layers",11)} ${c(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${r(u)}">${m("link",11)} ${r(es())}</span>
        </div>
      </div>
    </section>

    ${Ap(e)}

    <div class="service-grid">${s.map(bp).join("")}</div>

    ${Sp(e)}

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

    ${n?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${Pe({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${r(n?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${r(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${r(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}`}function Mp(e){let t=Array.isArray(e.services)?e.services:[],s=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Pipelines \u2192 Data \xB7 \u6700\u65B0\u5C08\u6848\u5143\u4EF6\u8207\u5373\u6642\u5065\u5EB7\u72C0\u614B</div>
      </div>
      <span class="badge badge-neutral badge-mono">${c((s.flow||[]).length)} layers</span>
    </div>
    ${vp(s,t)}
  </div>`}function Lp(e){let t=Array.isArray(e.endpoints)?e.endpoints:[],s=Tt(),a=Ro[s]||s,n=dt("/api/docs"),i=dt("/api/openapi.json"),o=new Set(t.map(d=>Po(d.path).id)),l=t.reduce((d,g)=>{let v=String(g.method||"GET").toUpperCase();return d[v]=(d[v]||0)+1,d},{}),u=["GET","POST","PATCH","PUT","DELETE"].filter(d=>l[d]).map(d=>`${d} ${c(l[d])}`).join(" \xB7 ");return`<section class="status-hero api-endpoint-hero">
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
          <span>${m("server",11)} API Base <span class="mono">${r(es())}</span>\uFF08${r(a)}\uFF09</span>
          <span>${m("terminal",11)} ${r(u||"\u2014")}</span>
          <span>${m("clock",11)} \u66F4\u65B0\u6642\u9593 ${be(e.checked_at)}</span>
        </div>
      </div>
      <div class="api-endpoint-actions">
        <a class="btn btn-secondary btn-sm" href="${r(n)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>Swagger UI</span></a>
        <a class="btn btn-ghost btn-sm" href="${r(i)}" target="_blank" rel="noopener noreferrer">OpenAPI JSON ${m("external",11)}</a>
      </div>
    </section>
    ${_p(t)}
    <p class="status-footnote">\u7AEF\u9EDE\u7531 FastAPI route table \u52D5\u614B\u7522\u751F\uFF1B\u4E92\u52D5\u5F0F\u6587\u4EF6\u4F4D\u65BC <a href="${r(n)}" target="_blank" rel="noopener noreferrer"><code>${r(n)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${r(i)}" target="_blank" rel="noopener noreferrer"><code>${r(i)}</code></a>\u3002\u7AEF\u9EDE\u8B8A\u66F4\u5F8C\u91CD\u65B0\u6574\u7406\u6B64\u9801\u5373\u53EF\u53D6\u5F97\u6700\u65B0\u6E05\u55AE\u3002</p>`}function jp(e,t={}){let s=e.data||{},a=t.info||null,n=a?.counts||{},i=Number(s.judgment_indexed_count||0),o=Number(s.judgment_count||0),l=Number(s.judgment_index_remaining??Math.max(0,o-i)),u=Number(s.judgment_index_pending??l)||0,d=Number(s.judgment_index_changed||0),g=Number(s.judgment_index_stale||0),v=o>0?Math.max(0,Math.min(100,i/o*100)):null,f=Ba(v),p=s.judgment_index_fresh===!1||u>0||String(s.judgment_index_staleness?.status||"")==="stale",b=p?"is-warn":"",y=s.last_version||{},k=s.last_run||{},j=y.source_type==="law"?"\u6CD5\u898F":y.source_type==="order"?"\u547D\u4EE4":"\u2014",x=y.version_code?String(y.version_code):y.id?`#${c(y.id)}`:"\u2014",A=Number(s.legal_article_indexed_count||s.legal_index?.points_count||0),F=Number(s.legal_article_count||s.legal_index?.article_count||0),ne=F>0?Math.max(0,Math.min(100,A/F*100)):null,Y=s.legal_article_stale===!0||String(s.legal_index?.status||"")==="stale",Se=Y?"is-warn":"",fe=s.judgment_vector_alias||"\u2014",U=s.judgment_vector_collection||"\u2014",E=s.legal_article_vector_alias||s.legal_index?.alias||"\u2014",L=s.legal_article_vector_collection||s.legal_index?.collection||"\u2014",T=p?"\u5224\u6C7A\u7D22\u5F15\u5F85\u66F4\u65B0":"\u8CC7\u6599\u7248\u672C\u4E00\u81F4",te=p?`\u5224\u6C7A\u7D22\u5F15\u5C1A\u7F3A ${c(u)} \u7B46`:"\u5224\u6C7A\u8CC7\u6599\u8207\u5411\u91CF\u7D22\u5F15\u4E00\u81F4",le=p?`PostgreSQL \u76EE\u524D\u6709 ${c(o)} \u7B46\u5224\u6C7A\uFF0CQdrant ${U} \u5DF2\u7D22\u5F15 ${c(i)} \u7B46\uFF1B\u5C1A\u6709 ${c(u)} \u7B46\u5F85\u7D22\u5F15\u3002`:"PostgreSQL \u8207 Qdrant \u5224\u6C7A\u7B46\u6578\u4E00\u81F4\uFF1B\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u8207\u7D22\u5F15\u72C0\u614B\u540C\u6B65\u3002",Q=Et(k.status||"idle").label,me=k.finished_at||k.started_at;return`<section class="status-hero data-version-hero">
      <div class="status-hero-main">
        <div class="overall-row">
          <span class="overall-badge ${b}">
            <span class="status-dot ${p?"is-warn":"is-ok"}" aria-hidden="true"></span>
            ${r(T)}
          </span>
          <span class="badge badge-neutral badge-mono">${c(s.version_count)} \u500B\u8CC7\u6599\u7248\u672C</span>
          <span class="badge badge-neutral">${r(j)} \u6700\u65B0\u7248\u672C ${r(x)}</span>
        </div>
        <h2 class="status-headline">${r(te)}</h2>
        <p class="status-copy">${r(le)}</p>
        <div class="status-meta">
          <span>${m("clock",11)} \u6AA2\u67E5\u6642\u9593 ${be(e.checked_at)}</span>
          <span>${m("database",11)} \u73FE\u884C\u8CC7\u6599 ${c(s.total_current)} \u7B46</span>
          <span>${m("layers",11)} \u539F\u59CB Parquet ${c(s.parquet_files)} \u500B \xB7 ${qe(s.parquet_bytes)}</span>
          <span title="Qdrant alias \u8207\u76EE\u524D\u7248\u672C collection">${m("link",11)} <span class="mono">${r(fe)} \u2192 ${r(U)}</span></span>
        </div>
      </div>
      <div class="data-version-ring ${b}" style="--coverage:${v===null?0:v.toFixed(1)}%">
        <div class="data-version-ring-inner">
          <strong>${f}</strong>
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
        <div class="metric-foot">${c(s.parquet_files)} \u500B\u539F\u59CB Parquet \xB7 ${qe(s.parquet_bytes)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u5224\u6C7A\u6587\u4EF6</div>
        <div class="metric-value">${c(s.judgment_count)}</div>
        <div class="metric-foot">PostgreSQL current</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Qdrant \u5224\u6C7A\u5411\u91CF\u7D22\u5F15</div>
        <div class="metric-value">${c(s.judgment_indexed_count)}</div>
        <div class="metric-foot">${f} \xB7 \u5269\u9918 ${c(u)} \u7B46</div>
      </div>
    </div>

    <div class="status-columns data-version-grid">
      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${m("database",14)}PostgreSQL \u8CC7\u6599\u7248\u672C</span>
          ${Ue(y.is_current?"operational":"degraded",y.is_current?"CURRENT":"HISTORY")}
        </div>
        ${y.id?`<div class="index-current-row">
                <span class="badge badge-info">${m("activity",11)}${r(j)} ${r(x)}</span>
                <strong class="mono">${be(y.downloaded_at)}</strong>
                <span class="index-current-copy" title="${r(y.parquet_path||"")}">${r(y.parquet_path||"\u2014")}</span>
              </div>
              <div class="data-version-facts">
                ${Oe("\u8CC7\u6599\u7248\u672C\u7E3D\u6578",c(s.version_count),{mono:!0})}
                ${Oe("\u4E0B\u8F09\u57F7\u884C\u7E3D\u6578",c(s.run_count),{mono:!0})}
                ${Oe("\u7248\u672C ID",`#${c(y.id)}`,{mono:!0})}
                ${Oe("\u8CC7\u6599\u985E\u578B",j)}
                ${Oe("\u4F86\u6E90\u66F4\u65B0\u65E5",y.update_date||"\u2014")}
                ${Oe(`${j}\uFF0F\u689D\u6587`,`${c(y.law_count)} / ${c(y.article_count)}`)}
                ${Oe("\u4E0B\u8F09\u6642\u9593",be(y.downloaded_at),{mono:!0})}
                ${Oe("\u8CC7\u6599\u72C0\u614B",y.is_current?"current":"history",{mono:!0})}
                ${Oe("Parquet \u6A94\u6848",y.parquet_path||"\u2014",{mono:!0,wide:!0})}
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
                ${Oe("Schema \u7248\u672C",`v${c(a.version)}`,{mono:!0})}
                ${Oe("\u5132\u5B58\u6A21\u5F0F",a.mode||"\u2014",{mono:!0})}
                ${Oe("query_history",`${c(n.query_history)} / ${c(a.caps?.history)}`,{mono:!0})}
                ${Oe("audit_events",`${c(n.audit_events)} / ${c(a.caps?.audit)}`,{mono:!0})}
                ${Oe("settings",c(n.settings),{mono:!0})}
                ${Oe("\u7E3D\u7D00\u9304\u6578",c(a.total),{mono:!0})}
                ${Oe("\u5DF2\u7528\u5BB9\u91CF",qe(a.usage_bytes),{mono:!0})}
                ${Oe("\u53EF\u7528\u914D\u984D",qe(a.quota_bytes),{mono:!0})}
              </div>
              <p class="data-version-note">${m("info",12)}
                IndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u7AEF\u63D0\u554F\u6B77\u53F2\u3001\u8A2D\u5B9A\u8207\u7248\u672C\u7A3D\u6838\u4E8B\u4EF6\uFF1B\u4F3A\u670D\u5668\u8CC7\u6599\u4EE5 PostgreSQL \u8207 Parquet \u70BA\u6E96\u3002
              </p>`:`<div class="report-empty-inline">${t.loading||!t.error?"\u6B63\u5728\u8B80\u53D6\u700F\u89BD\u5668 IndexedDB\u2026":r(t.error?.message||"IndexedDB \u5C1A\u7121\u8CC7\u6599\u6216\u7121\u6CD5\u8B80\u53D6\u3002")}</div>`}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${m("brain",14)}Qdrant \u5224\u6C7A\u5411\u91CF\u7D22\u5F15</span>
          ${Ue(p?"degraded":"operational",p?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${m("link",11)}Alias</span>
          <strong class="mono">${r(fe)}</strong>
          <span class="mono">\u2192 ${r(U)}</span>
          <span class="index-current-copy">v#${c(s.judgment_vector_version_id)} \xB7 ${r(s.judgment_vector_model||"\u2014")}</span>
        </div>
        ${To("\u7D22\u5F15\u8986\u84CB",v,`\u5DF2\u7D22\u5F15 ${c(i)} / ${c(o)} \u7B46 \xB7 \u5269\u9918 ${c(u)} \u7B46`,b)}
        <div class="data-version-facts">
          ${Oe("Qdrant points",c(s.judgment_vector_points),{mono:!0})}
          ${Oe("\u7D22\u5F15\u7248\u672C",`#${c(s.judgment_vector_version_id)} \xB7 ${s.judgment_vector_version_status||"legacy"}`,{mono:!0})}
          ${Oe("\u524D\u4E00\u7248\u672C",s.judgment_vector_previous_version_id?`#${c(s.judgment_vector_previous_version_id)}`:"\u2014",{mono:!0})}
          ${Oe("\u5F85\u88DC\uFF0F\u8B8A\u66F4\uFF0F\u5931\u6548",`${c(u)} / ${c(d)} / ${c(g)}`)}
          ${Oe("\u6700\u8FD1\u7D22\u5F15",be(s.judgment_indexed_at),{mono:!0})}
          ${Oe("\u6A21\u578B",s.judgment_vector_model||"\u2014",{mono:!0})}
        </div>
        ${u>0?`<p class="data-version-note is-warn">${m("info",12)}\u5C1A\u6709 ${c(u)} \u7B46\u5224\u6C7A\u5C1A\u672A\u7D22\u5F15\uFF1B\u8ACB\u81F3\u300C\u8CC7\u6599\u8655\u7406 \u2192 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u63A5\u7E8C\u88DC\u9F4A\u3002</p>`:""}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${m("shield",14)}Qdrant \u6CD5\u898F\uFF0F\u547D\u4EE4\u5411\u91CF\u7D22\u5F15</span>
          ${Ue(Y?"degraded":"operational",Y?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${m("link",11)}Alias</span>
          <strong class="mono">${r(E)}</strong>
          <span class="mono">\u2192 ${r(L)}</span>
          <span class="index-current-copy">v#${c(s.legal_article_vector_version_id||s.legal_index?.version_id)}</span>
        </div>
        ${To("\u689D\u6587\u7D22\u5F15\u8986\u84CB",ne,`\u5DF2\u7D22\u5F15 ${c(A)} / ${c(F)} \u689D`,Se)}
        <div class="data-version-facts">
          ${Oe("Qdrant points",c(A),{mono:!0})}
          ${Oe("\u73FE\u884C\u689D\u6587",c(F),{mono:!0})}
          ${Oe("\u5411\u91CF\u7DAD\u5EA6",c(s.legal_index?.dimension),{mono:!0})}
          ${Oe("\u6700\u8FD1\u7D22\u5F15",be(s.legal_article_indexed_at||s.legal_index?.indexed_at),{mono:!0})}
          ${Oe("\u7D22\u5F15\u72C0\u614B",Y?"stale":"fresh",{mono:!0})}
          ${Oe("Collection",L,{mono:!0})}
        </div>
      </section>

      <section class="card data-version-card is-wide-grid">
        <div class="side-card-head">
          <span class="side-card-title">${m("folder",14)}Parquet \u8207\u57F7\u884C\u72C0\u614B</span>
          <span class="badge badge-neutral badge-mono">${c(s.parquet_files)} FILES</span>
        </div>
        <div class="data-version-facts">
          ${Oe("\u539F\u59CB Parquet \u6A94\u6848",c(s.parquet_files),{mono:!0})}
          ${Oe("\u5408\u8A08\u5BB9\u91CF",qe(s.parquet_bytes),{mono:!0})}
          ${Oe("PostgreSQL \u73FE\u884C\u8CC7\u6599",c(s.total_current),{mono:!0})}
          ${Oe("\u8CC7\u6599\u7248\u672C\u7E3D\u6578",c(s.version_count),{mono:!0})}
          ${Oe("\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C",k.status?Q:"\u2014")}
          ${Oe("\u6700\u8FD1\u57F7\u884C\u6642\u9593",me?be(me):"\u2014",{mono:!0})}
          ${Oe("\u6700\u8FD1\u57F7\u884C\u8017\u6642",k.duration_ms?de(k.duration_ms):"\u2014",{mono:!0})}
          ${Oe("\u6700\u8FD1\u57F7\u884C\u7248\u672C",k.version_id?`#${c(k.version_id)}`:"\u2014",{mono:!0})}
        </div>
        <p class="data-version-note">${m("info",12)}
          \u539F\u59CB Parquet \u4FDD\u7559 raw\uFF0Fdelta \u8207 manifest\uFF1BPostgreSQL \u63D0\u4F9B current metadata \u8207\u7248\u672C\u72C0\u614B\uFF1BQdrant \u53EA\u4FDD\u5B58\u5411\u91CF\u8207 payload\u3002
        </p>
      </section>
    </div>`}function Tp(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${c(t.run_count)} TOTAL</span>
    </div>
    ${kp(e.recent_runs)}
  </section>`}function Np(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function Io(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function fs(e,t,s,a,n){let i=Np(n);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${m(t,14)}${r(e)}</span>
      <strong>${r(s)}</strong>
    </div>
    ${Io(n,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function Ep(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${m("layers",14)}Docker</span>
        ${Ue("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${r(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,u=o.service?0:1;return l-u||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${r(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${r(i.service)}</span>`:""}</td>
        <td>${Ue(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
        <td class="cell-number">${i.cpu_percent===null||i.cpu_percent===void 0?"\u2014":`${c(i.cpu_percent)}%`}</td>
        <td class="cell-number">${qe(i.memory_used)}${i.memory_limit?` / ${qe(i.memory_limit)}`:""}</td>
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
  </section>`}function Rp(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",n=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${Yt("\u8CC7\u6599\u5EAB",`<code>${r(s.database||"\u2014")}</code>`)}
           ${Yt("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${qe(s.storage_bytes)}</strong>`)}
           ${Yt("Docker volume",`<strong>${qe(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${Yt("\u9023\u7DDA\u6578",`<strong>${c(s.connections)}</strong>`)}`:`${Yt("Collection",`<code>${r(s.collection||"\u2014")}</code>`)}
           ${Yt("Docker volume",`<strong>${qe(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${Yt("\u5411\u91CF\u9EDE\u6578",`<strong>${c(s.points_count)}</strong>`)}
           ${Yt("Collections",`<strong>${c(s.collections)}</strong>`)}
           ${Yt("Segments",`<strong>${c(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${r(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${r(s.kind||"")}</div>
          </div>
          ${Ue(i)}
        </div>
        <div class="resource-db-metrics">
          <div><span>CPU</span><strong>${s.cpu_percent===null||s.cpu_percent===void 0?"\u2014":`${c(s.cpu_percent)}%`}</strong></div>
          <div><span>RAM</span><strong>${qe(s.memory_used)}</strong><small>${s.memory_limit?` / ${qe(s.memory_limit)}`:""}</small></div>
          <div><span>\u5BB9\u5668</span><strong class="mono">${r(s.container||"\u2014")}</strong><small>${r(s.container_status||"\u2014")}</small></div>
        </div>
        <div class="detail-list">${o}</div>
        ${n.length?`<div class="resource-table-wrap">
                <table class="data-table is-compact">
                  <thead><tr><th scope="col">\u8CC7\u6599\u8868</th><th scope="col">\u5927\u5C0F</th></tr></thead>
                  <tbody>${n.map(l=>`<tr>
                        <td class="mono">${r(l.name||"\u2014")}</td>
                        <td class="cell-number">${qe(l.bytes)}</td>
                      </tr>`).join("")}</tbody>
                </table>
              </div>`:""}
        <div class="side-card-foot">${r(s.detail||"")}</div>
      </article>`}).join("")}</div>`}function Ts(e,t,s,a){let n=Number(t)||0,i=a?n/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${r(e)}</span>
      <strong>${qe(n)}</strong>
    </div>
    ${Io(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function Cp(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},n=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},u=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${qe(u)}</span>
    </div>
    <div class="storage-list">
      ${Ts("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${r(s.frontend_path||"\u2014")}</span>`,u)}
      ${Ts("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${r(s.backend_path||"\u2014")}</span>`,u)}
      ${Ts("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",n.layers_bytes,`Images ${qe(n.images_bytes)} \xB7 Containers ${qe(n.containers_bytes)} \xB7 Build cache ${qe(n.build_cache_bytes)}`,u)}
      ${Ts("PostgreSQL volume",o.size_bytes,`<span class="mono">${r(o.name||"\u2014")}</span>`,u)}
      ${Ts("Qdrant volume",l.size_bytes,`<span class="mono">${r(l.name||"\u2014")}</span>`,u)}
      ${Ts("Parquet",a.total_bytes,`\u6CD5\u898F ${qe(a.law_bytes)} \xB7 \u5224\u6C7A ${qe(a.judgment_bytes)}`,u)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${qe(u)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function Pp(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},n=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),u=Array.isArray(e.disk)?e.disk:[],d=u[0]||{},g=Number(o.total_bytes||d.total||0),v=g?l/g*100:0,f=[s.load_1,s.load_5,s.load_15].map(y=>y??"\u2014").join(" / "),p=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":de(Number(t.uptime_seconds)*1e3),b=[d.label?fs("HDD \u5DF2\u4F7F\u7528","database",`${c(d.percent)}%`,`${qe(d.used)} / ${qe(d.total)} \xB7 \u5269\u9918 ${qe(d.free)}<br><span class="mono">${r(d.path||"")}</span>`,d.percent):"",l?fs("Judgment \u5143\u4EF6\u5408\u8A08","layers",qe(l),`\u7D04\u5360 HDD ${c(v)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,v):"",...u.slice(1).map(y=>fs(`\u786C\u789F \xB7 ${y.label}`,"layers",`${c(y.percent)}%`,`${qe(y.used)} / ${qe(y.total)} \xB7 \u5269\u9918 ${qe(y.free)}<br><span class="mono">${r(y.path||"")}</span>`,y.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${be(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${fs("CPU \u4F7F\u7528\u7387","cpu",`${c(s.percent)}%`,`${c(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${c(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${r(f)}`,s.percent)}
      ${fs("\u8A18\u61B6\u9AD4","server",`${c(a.percent)}%`,`${qe(a.used)} / ${qe(a.total)} \xB7 \u53EF\u7528 ${qe(a.available)}`,a.percent)}
      ${fs("Swap","layers",`${c(n.percent)}%`,`${qe(n.used)} / ${qe(n.total)}`,n.percent)}
      ${fs("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${c(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${r(p)}<br>${r(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${b||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${Cp(e)}
    ${Ep(e)}
    ${Rp(e)}`}function No(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function Ip(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SYSTEM RESOURCE USAGE</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Pe({tone:"danger",title:"\u8CC7\u6E90 API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-resources-retry">
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Dp(e){return e.status==="operational"?{label:"\u5DF2\u9023\u7DDA",badge:"badge-ok"}:{label:"\u7121\u6CD5\u9023\u7DDA",badge:"badge-danger"}}function Op(e,t){let s=Dp(e),a=Array.isArray(e.models)?e.models:[],n=a.length?a.map(i=>{let o=String(i.name||""),l=e.chat_model===o,u=e.embedding_model===o,d=i.size?qe(i.size):"",g=i.modified_at?be(i.modified_at):"",v=new Set((i.capabilities||[]).map(p=>String(p||"").toLowerCase())),f=[];return i.supports_chat===!0&&f.push(["Chat","badge-ok"]),v.has("embedding")&&f.push(["Embedding","badge-info"]),v.has("vision")&&f.push(["Vision","badge-neutral"]),v.has("tools")&&f.push(["Tools","badge-neutral"]),v.has("thinking")&&f.push(["Thinking","badge-neutral"]),v.has("speech")&&f.push(["Speech","badge-warn"]),i.is_reranker&&f.push(["Reranker","badge-neutral"]),f.length||f.push([i.capability_status==="untested"?"\u672A\u6E2C\u8A66":"\u7121 chat \u80FD\u529B","badge-neutral"]),`<div class="ollama-model-row">
            <div class="ollama-model-main">
              <strong>${r(o)}</strong>
              <span class="ollama-model-meta">${[d,g].filter(Boolean).map(p=>r(p)).join(" \xB7 ")||"\u2014"}</span>
              <div class="ollama-model-capabilities">${f.map(([p,b])=>`<span class="badge ${b}">${r(p)}</span>`).join("")}</div>
            </div>
            <div class="ollama-model-roles">
              ${l?'<span class="badge badge-ok">\u804A\u5929</span>':""}
              ${u?'<span class="badge badge-ok">\u5D4C\u5165</span>':""}
            </div>
            <div class="ollama-model-actions">
              <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="${l?"clear-model":"select-model"}" data-id="${e.id}" data-model="${r(o)}" data-role="chat">
                ${l?"\u65B7\u958B\u804A\u5929":"\u9023\u63A5\u804A\u5929"}
              </button>
              <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="${u?"clear-model":"select-model"}" data-id="${e.id}" data-model="${r(o)}" data-role="embedding">
                ${u?"\u65B7\u958B\u5D4C\u5165":"\u9023\u63A5\u5D4C\u5165"}
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
  </article>`}function Bp(e,t,s,a){if(s)return`<div class="report-card">
      ${Pe({tone:"danger",title:"Model Provider \u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${m("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=e||{hosts:[],active_host_id:null},i=Array.isArray(n.hosts)?n.hosts:[],o=a?i.find(d=>Number(d.id)===Number(a)):null,l=o?o.base_url.replace(new RegExp(`:${o.port}$`),""):"http://127.0.0.1",u=o?"\u5132\u5B58\u8B8A\u66F4":"\u65B0\u589E\u4E3B\u6A5F";return`<div class="report-card ollama-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">MODEL PROVIDER</div>
        <div class="report-title">Ollama \u4E3B\u6A5F\u8207\u6A21\u578B</div>
        <div class="report-sub">\u7BA1\u7406\u53EF\u7528\u7684 Ollama \u9023\u7DDA\u3001\u76EE\u524D\u4F7F\u7528\u7684\u4E3B\u6A5F\uFF0C\u4EE5\u53CA\u4E3B\u6A5F\u4E0A\u7684\u804A\u5929\uFF0F\u5D4C\u5165\u6A21\u578B\u3002\u6BCF\u6B21\u958B\u555F\u6B64\u9801\u90FD\u6703\u91CD\u65B0\u53D6\u5F97\u4E3B\u6A5F\u8207\u6A21\u578B\u5217\u8868\uFF1Bembedding \u4E3B\u6A5F\u7684\u512A\u5148\u9806\u5E8F\u53EF\u5230\u300C\u8CC7\u6599\u8655\u7406\u300D\u7684\u57F7\u884C\u8CC7\u8A0A\u5361\u7247\u62D6\u79FB\u8ABF\u6574\u3002</div>
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
          <input class="input" name="name" value="${r(o?.name||"")}" placeholder="\u4F8B\u5982\uFF1Ax570 Ollama" />
        </label>
        <label class="field"><span class="field-label">\u4E3B\u6A5F\u7DB2\u5740</span>
          <input class="input" name="url" value="${r(l)}" placeholder="http://127.0.0.1" required />
        </label>
        <label class="field"><span class="field-label">Port</span>
          <input class="input" name="port" type="number" min="1" max="65535" value="${o?.port||11434}" required />
        </label>
        <div class="ollama-host-form-actions">
          <button class="btn btn-primary btn-sm" type="submit">${m("check",13)}<span>${u}</span></button>
          ${o?'<button class="btn btn-ghost btn-sm" type="button" data-ollama-action="cancel-host-edit">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
        </div>
      </form>
      ${t?'<div class="ollama-loading"><span class="spinner"></span><span>\u8B80\u53D6 Ollama \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span></div>':i.length?`<div class="ollama-host-list">${i.map(d=>Op(d,a)).join("")}</div>`:ut({iconName:"server",title:"\u5C1A\u672A\u8A2D\u5B9A Ollama \u4E3B\u6A5F",text:"\u8ACB\u5728\u4E0A\u65B9\u8F38\u5165\u7DB2\u5740\u8207 Port \u65B0\u589E\uFF0C\u6216\u4F7F\u7528 .env \u7684\u9810\u8A2D\u9023\u7DDA\u3002"})}
      <p class="report-sub" style="margin-top:12px">\u8A2D\u70BA\u804A\u5929\u6216\u5D4C\u5165\u6A21\u578B\u5F8C\uFF0C\u7CFB\u7D71\u6703\u4F7F\u7528\u76EE\u524D\u4E3B\u6A5F\u7684\u5C0D\u61C9\u6A21\u578B\u57F7\u884C AI \u51FA\u984C\u8207 RAG\uFF1B\u672A\u8A2D\u5B9A\u6642\u6CBF\u7528 .env \u7684 LLM_MODEL\uFF0FEMBEDDING_MODEL\u3002</p>
    </div>
  </div>`}function Fp(e,t,s){let a=e?.data||{},n=e?Et(e.status):null,i=s?Et(s.status):null,o={overview:n?`<span class="badge ${n.tone==="ok"?"badge-ok":n.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(n.label)}</span>`:"",resources:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(i.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${c(a.version_count)}</span>`,tests:'<span class="badge badge-neutral badge-mono">TEST</span>',"local-model":'<span class="badge badge-neutral badge-mono">OLLAMA</span>',runs:`<span class="badge badge-neutral badge-mono">${c(a.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${Co.map(l=>{let u=l.id===t;return`<button class="status-tab${u?" is-active":""}" type="button"
          data-status-tab="${l.id}" ${u?'aria-current="page"':""}>
          <span class="status-tab-icon">${m(l.icon,15)}</span>
          <span class="status-tab-copy">
            <strong>${r(l.label)}</strong>
            <small>${r(l.hint)}</small>
          </span>
          ${o[l.id]||""}
        </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u6AA2\u67E5\u6642\u9593</span>
      <span class="mono">${r(e?be(e.checked_at):"\u2014")}</span>
    </div>`}function Hp(e,t,s,a,n,i,o){if(e==="resources")return s?Pp(s):a?No():n?Ip(n):No();if(e==="local-model"){let l=i||{},u=!!l.loading||!l.hosts&&!l.error;return Bp(l.hosts||null,u,l.error||null,l.editingId||null)}return e==="architecture"?Mp(t):e==="api"?Lp(t):e==="data"?jp(t,o):e==="runs"?Tp(t):qp(t)}function zp(){return`<div class="status-hero">
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
    </div>`}function Eo(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u5FEB\u53D6\u6216\u63A8\u6E2C\u7684\u670D\u52D9\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Pe({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function Gp(e,t){let s=!1,a=null,n=null,i="overview",o=null,l=!1,u=null,d=null,g=!1,v=null,f=null,p=null,b=!1,y=null,k=!1,j=!1,x=null,A=0,F="",ne="",Y=performance.now(),Se=new Date().toISOString(),fe=!1;e.innerHTML=`<section class="page status-page">
    <div class="page-header">
      <div>
        <div class="eyebrow">OBSERVABILITY</div>
        <h1 class="page-title">\u7CFB\u7D71\u67B6\u69CB\u8207\u670D\u52D9\u72C0\u614B</h1>
        <p class="page-subtitle">\u6AA2\u8996\u524D\u7AEF\u3001FastAPI\u3001PostgreSQL\u3001Parquet \u8207 AI \u5143\u4EF6\u7684\u5373\u6642\u5065\u5EB7\u72C0\u614B\uFF0C
          \u4E26\u5F9E\u5DE6\u5074\u5206\u985E\u5207\u63DB\u670D\u52D9\u7E3D\u89BD\u3001\u7CFB\u7D71\u6E2C\u8A66\u3001Model Provider\u3001\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528\u3001\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u4E0B\u8F09\u7D00\u9304\u3002</p>
      </div>
      <div class="page-actions">
        <label class="auto-refresh">
          <input type="checkbox" id="auto-refresh" />
          \u81EA\u52D5\u66F4\u65B0 30s\uFF08\u63A8\u9001\uFF09
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
          ${Array.from({length:8}).map(()=>'<div class="skeleton skeleton-line" style="width:100%;height:52px;margin-top:8px"></div>').join("")}
        </div>
      </aside>
      <section class="status-panel" id="status-content">${zp()}</section>
    </div>
  </section>`;let U=e.querySelector("#status-nav"),E=e.querySelector("#status-content"),L=e.querySelector("#refresh-status"),T=e.querySelector("#auto-refresh"),te=()=>{if(A+=1,typeof x=="function")try{x()}catch{}x=null,k=!1,j=!1},le=async()=>{let ee=++A;j=!0,ne="",E.innerHTML="";try{let re=await cr(E,{setTitle:()=>{}},{embedded:!0});if(ee!==A||i!=="tests"){typeof re=="function"&&re();return}x=typeof re=="function"?re:null,k=!0}catch(re){ee===A&&i==="tests"&&(E.innerHTML=Eo(re))}finally{ee===A&&(j=!1)}},Q=()=>{if(!n)return;let ee=Fp(n,i,o);if(ee!==F&&(U.innerHTML=ee,F=ee),i==="tests"){!k&&!j&&le();return}te();let re=Hp(i,n,o,l,u,{hosts:d,loading:g,error:v,editingId:f},{info:p,loading:b,error:y});re!==ne&&(E.innerHTML=re,ne=re)},me=async({quiet:ee=!1}={})=>{if(!l){l=!0,u=null,i==="resources"&&!o&&Q();try{let re=await W.systemUsage();if(s)return;o=re}catch(re){if(s)return;u=re,ee||P(re.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{s||(l=!1,i==="resources"&&Q())}}},ye=async({quiet:ee=!1}={})=>{if(!b){b=!0,y=null,i==="data"&&!p&&Q();try{let re=await ei();if(s)return;p=re}catch(re){if(s)return;y=re,ee||P(re.message||"\u7121\u6CD5\u8B80\u53D6 IndexedDB\u3002","danger")}finally{s||(b=!1,i==="data"&&Q())}}},H=async({quiet:ee=!1}={})=>{if(!g){g=!0,v=null,i==="local-model"&&!d&&Q();try{let re=await W.ollamaHosts();if(s)return;d=re}catch(re){if(s)return;v=re,ee||P(re.message||"\u7121\u6CD5\u53D6\u5F97 Ollama \u4E3B\u6A5F\u3002","danger")}finally{s||(g=!1,i==="local-model"&&Q())}}},ve=async()=>{await H({quiet:!0}),await Z({quiet:!0})},Z=async({quiet:ee=!1,status:re=null}={})=>{ee||(L.disabled=!0,je(L,!0,"\u6AA2\u67E5\u4E2D\u2026"));let he=performance.now(),ge=new Date().toISOString(),Ae=he,ke=ge;try{let Ne=re||await W.status();if(Ae=performance.now(),ke=new Date().toISOString(),s)return;let ze=!re&&!fe?Math.max(0,he-Y):0;Ne.page_pipeline=Ne.pipeline||!n?.page_pipeline?xp(Ne,{initMs:ze,initStartedAt:Se,requestStartedAt:ge,requestFinishedAt:ke,requestMs:Ae-he}):n.page_pipeline,fe=!0,n=Ne,Q(),ee||P("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(Ne){if(s)return;i!=="tests"&&(ne="",E.innerHTML=Eo(Ne)),ee||P(Ne.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(L.disabled=!1,je(L,!1))}},xe=async({quiet:ee=!1,status:re=null}={})=>{if(await Z({quiet:ee,status:re}),i==="resources"&&await me({quiet:ee}),i==="local-model"&&await H({quiet:ee}),!ee&&i==="tests"){let he=E.querySelector("#tests-refresh");he&&he.click()}};U.addEventListener("click",ee=>{let re=ee.target.closest("[data-status-tab]");if(!re)return;let he=re.dataset.statusTab;Co.some(ge=>ge.id===he)&&(i=he,Q(),i==="resources"&&!o&&!l&&me(),i==="data"&&!p&&!b&&ye(),i==="local-model"&&H())}),E.addEventListener("click",ee=>{ee.target.closest("#status-retry")&&Z(),ee.target.closest("#status-resources-retry")&&me()}),E.addEventListener("click",async ee=>{let re=ee.target.closest("[data-ollama-action]");if(!re)return;let he=re.dataset.ollamaAction,ge=Number(re.dataset.id||0);if(he==="refresh-hosts"){await H();return}if(he==="edit-host"){f=ge,Q(),e.querySelector(".ollama-host-form")?.scrollIntoView({behavior:"smooth",block:"center"});return}if(he==="cancel-host-edit"){f=null,Q();return}if(he==="delete-host"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 Ollama \u4E3B\u6A5F #${ge}\uFF1F`))return;try{await W.deleteOllamaHost(ge),Number(f)===ge&&(f=null),P("Ollama \u4E3B\u6A5F\u5DF2\u522A\u9664\u3002","info"),await ve()}catch(Ae){P(Ae.message||"\u522A\u9664\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(he==="activate-host"){try{await W.activateOllamaHost(ge),P("\u5DF2\u5207\u63DB\u4F7F\u7528\u7684 Ollama \u4E3B\u6A5F\u3002","ok"),await ve()}catch(Ae){P(Ae.message||"\u5207\u63DB\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(he==="deactivate-host"){try{await W.deactivateOllamaHosts(),P("\u5DF2\u505C\u7528\u6307\u5B9A\u7684 Ollama \u4E3B\u6A5F\uFF0C\u5C07\u6CBF\u7528 .env \u8A2D\u5B9A\u3002","info"),await ve()}catch(Ae){P(Ae.message||"\u505C\u7528\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(he==="check-capabilities"){je(re,!0,"\u6AA2\u67E5\u4E2D\u2026");try{await W.checkOllamaCapabilities(),P("\u5DF2\u66F4\u65B0\u6240\u6709\u4E3B\u6A5F\u7684\u6A21\u578B\u80FD\u529B\u3002","ok",4e3),await ve()}catch(Ae){P(Ae.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u80FD\u529B\u3002","danger",7e3)}finally{je(re,!1)}return}if(he==="select-model"||he==="clear-model"){let Ae=String(re.dataset.model||""),ke=String(re.dataset.role||"");try{he==="select-model"?(await W.selectOllamaModel(ge,{model:Ae,role:ke}),P(`\u5DF2\u8A2D\u5B9A ${ke==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\uFF1A${Ae}`,"ok")):(await W.clearOllamaModel(ge,{model:Ae,role:ke}),P(`\u5DF2\u53D6\u6D88 ${ke==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\u3002`,"info")),await ve()}catch(Ne){P(Ne.message||"\u6A21\u578B\u8A2D\u5B9A\u5931\u6557\u3002","danger")}}}),E.addEventListener("submit",async ee=>{let re=ee.target.closest("form[data-ollama-form='host']");if(!re)return;ee.preventDefault();let he=new FormData(re),ge=Number(he.get("host_id")||0),Ae={name:String(he.get("name")||"").trim(),url:String(he.get("url")||"").trim(),port:Number(he.get("port")||11434)};try{ge?(await W.updateOllamaHost(ge,Ae),P("Ollama \u4E3B\u6A5F\u5DF2\u66F4\u65B0\u3002","ok")):(await W.addOllamaHost(Ae),P("Ollama \u4E3B\u6A5F\u5DF2\u65B0\u589E\u3002","ok")),f=null,await ve()}catch(ke){let Ne=ke.detail||ke.payload?.detail,ze=Ne?.errors?.join(" \xB7 ")||Ne?.message||ke.message||"\u5132\u5B58\u4E3B\u6A5F\u5931\u6557\u3002";P(ze,"danger",8e3)}}),E.addEventListener("toggle",ee=>{let re=ee.target.closest?.(".status-wf-stage[data-status-wf-stage]");if(!re||!E.contains(re))return;let he=re.dataset.statusWfStage||"";he&&(re.open?dr.add(he):dr.delete(he))},!0),L.addEventListener("click",()=>xe());let $e=()=>{a&&(a(),a=null)};return T.addEventListener("change",()=>{$e(),T.checked&&(a=vt("status",(ee,re)=>{s||xe({quiet:!0,status:re?.snapshot||null})}),xe({quiet:!0}),P("\u5DF2\u555F\u7528\u5F8C\u7AEF\u63A8\u9001\u81EA\u52D5\u66F4\u65B0\uFF08\u6BCF 30 \u79D2\uFF09\u3002","info",2200))}),await Z({quiet:!0}),ye({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,te(),$e()}}var Do="home",za={home:{page:An,title:"Judgment RAG Console \xB7 \u6CD5\u898F\u8207\u5224\u6C7A\u6AA2\u7D22"},rag:{page:Qn,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:In,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:lr,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:zn,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:ar,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:ur,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:Oa,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"}},pr=document.getElementById("app-main"),Fa=null,Ha=0;function gr(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||Do;return Object.prototype.hasOwnProperty.call(za,t)?t:Do}function Up(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function Qp(e){return`<section class="page">
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
  </section>`}async function mr(){let e=gr(),t=++Ha;if(Up(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof Fa=="function"){try{Fa()}catch{}Fa=null}document.title=za[e].title;let s={route:e,navigate(a){za[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===Ha&&a&&(document.title=a)}};try{let a=za[e].page.render(pr,s);zr(),window.scrollTo({top:0,behavior:"auto"}),pr.focus({preventScroll:!0});let n=await a;if(t!==Ha){typeof n=="function"&&n();return}Fa=typeof n=="function"?n:null}catch(a){if(t!==Ha)return;console.error("Failed to render route",e,a),pr.innerHTML=Qp(a);let n=document.getElementById("route-retry");n&&n.addEventListener("click",()=>mr()),P("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function Jp(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable))return;let a=gr(),n=a==="home"?"home-question":a==="rag"?"rag-question":"";if(!n)return;let i=document.getElementById(n);i&&(e.preventDefault(),i.focus())})}function Wp(){let e=document.querySelector('[data-route="processing"]');if(!e)return;let t=e.querySelector(".nav-update-badge");t||(t=document.createElement("span"),t.className="nav-update-badge",t.hidden=!0,e.appendChild(t));let s=async(a=null)=>{try{let n=a||await W.updatesStatus(),i=Number(n.update_count)||0;i>0?(t.textContent=String(i),t.title=`\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0F\u5224\u6C7A\u6709 ${i} \u9805\u66F4\u65B0`,t.hidden=!1):t.hidden=!0}catch{t.hidden=!0}};s(),vt("updates",(a,n)=>s(n?.snapshot||null)),window.addEventListener("judgment:updates-changed",()=>s())}function Oo(){Lr(),Ur(),Jp(),Wp(),window.addEventListener("hashchange",mr),mr(),na()&&window.setTimeout(()=>{gr()==="rag"&&(window.location.hash="#/tests")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Oo):Oo();})();
