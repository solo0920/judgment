(()=>{var tl=Object.defineProperty;var rs=(e,t)=>{for(var s in t)tl(e,s,{get:t[s],enumerable:!0})};var rn="judgment.api_base",on="judgment.admin_token",cn="http://127.0.0.1:9200",pt=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function Rr(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function Kt(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${Rr(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function dn(e){let t=Kt(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function un(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?Kt(e.get("api")):null}catch{return null}}function pn(){try{let e=window.localStorage.getItem(rn);return e===null?null:Kt(e)}catch{return null}}function mn(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return Kt(e||"")}function Bt(){let e=un();if(e!==null)return e;let t=pn();if(t!==null)return t;let s=mn();return s||(window.location.protocol==="file:"?cn:"")}function sl(){if(un()!==null)return!0;let e=pn();return e!==null?!!e:!!mn()}function Nt(){return un()!==null?"query":pn()!==null?"storage":mn()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function ma(){return sl()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!Rr(window.location.hostname)}function gn(e){let t=Kt(e);try{t?window.localStorage.setItem(rn,t):window.localStorage.removeItem(rn)}catch{}return t}function ga(){try{return String(window.localStorage.getItem(on)||"").trim()}catch{return""}}function Cr(e){let t=String(e||"").trim();try{t?window.localStorage.setItem(on,t):window.localStorage.removeItem(on)}catch{}return t}function ln(){return Nt()==="query"?"":ga()}function is(e=Bt()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function it(e,t=Bt()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function Er(){return Nt()==="query"?"":Bt()}async function al(){let e=ln(),t={Accept:"application/json"};e&&(t["X-Judgment-Admin-Token"]=e);try{let s=await fetch(it("/api/auth/sse-ticket"),{method:"POST",headers:t,credentials:"include"});if(!s.ok)return"";let a=await s.json();return String(a.ticket||"")}catch{return""}}function mt(e,t,{onError:s=null,onProgress:a=null}={}){let n=(Array.isArray(e)?e:[e]).map(b=>String(b||"").trim()).filter(Boolean);if(!n.length||typeof EventSource>"u")return()=>{};let i=null,o=0,l=!1,m=null,f=b=>{let u={};try{u=JSON.parse(b.data||"{}")}catch{u={}}u.initial&&o<=1&&!u.snapshot||t?.(u.topic||n[0],u)},p=b=>{let u={};try{u=JSON.parse(b.data||"{}")}catch{u={}}a?.(u.topic||n[0],u)},$=async()=>{if(l)return;let b=await al();if(l)return;let u=new URLSearchParams({topic:n.join(",")});b&&u.set("ticket",b),i=new EventSource(it(`/api/events/stream?${u.toString()}`),{withCredentials:!0}),i.onopen=()=>{o+=1,m&&(window.clearTimeout(m),m=null)},i.addEventListener("refresh",f),i.addEventListener("progress",p),i.onerror=()=>{s?.(),!(l||!i)&&(i.close(),i=null,!m&&(m=window.setTimeout(()=>{m=null,$()},3e3)))}};return $(),()=>{l=!0,m&&(window.clearTimeout(m),m=null),i&&(i.removeEventListener("refresh",f),i.removeEventListener("progress",p),i.close(),i=null)}}function fn(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function oe(e,t={}){let{base:s,...a}=t,n=s!==void 0?Kt(s):Bt(),i=new AbortController,o=t.timeout===void 0?3e4:t.timeout,l=o>0?window.setTimeout(()=>i.abort(),o):null,m=Date.now(),f=performance.now(),p=t.requestId||Pr(),$={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":p,"X-Judgment-Client-Started-At":String(m),...ln()?{"X-Judgment-Admin-Token":ln()}:{},...t.headers||{}},b;try{b=await fetch(it(e,n),{...a,headers:$,credentials:"include",signal:i.signal})}catch(L){throw L.name==="AbortError"?new pt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new pt(fn(n),0,L)}finally{l&&window.clearTimeout(l)}let u=null;if((b.headers.get("content-type")||"").includes("application/json"))try{u=await b.json()}catch{u=null}else try{u=await b.text()}catch{u=null}let w=performance.now(),_=b.headers.get("X-Judgment-Request-Id")||p;if(t.trackClient!==!1&&_){let L=Math.round(performance.now()-f);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{Ir({request_id:_,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:L,render_ms:Math.max(0,Math.round(performance.now()-w)),status:b.ok?"success":"failed"})})})}if(!b.ok){let L=u&&typeof u=="object"?u.detail||u.message:u,S=typeof L=="string"&&L?L:`\u4F3A\u670D\u5668\u56DE\u61C9 ${b.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new pt(S,b.status,L)}return u}function Pr(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function Ir(e){try{fetch(it("/api/performance/client",Bt()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),credentials:"include",keepalive:!0}).catch(()=>{})}catch{}}async function Dr(e){let t=Kt(e);if(!dn(t))throw new pt("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,n=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(it("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new pt(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof pt?i:i.name==="AbortError"?new pt("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new pt(fn(t),0,i)}finally{window.clearTimeout(n)}}var V={health(){return oe("/api/health")},authMe(){return oe("/api/auth/me",{base:Er(),trackClient:!1})},authLogout(){return oe("/api/auth/logout",{method:"POST",base:Er(),trackClient:!1})},status(){return oe("/api/status",{trackClient:!1})},ollamaHosts(){return oe("/api/llama-server/hosts",{timeout:3e4,trackClient:!1})},addOllamaHost(e){return oe("/api/llama-server/hosts",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},updateOllamaHost(e,t){return oe(`/api/llama-server/hosts/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},deleteOllamaHost(e){return oe(`/api/llama-server/hosts/${encodeURIComponent(e)}`,{method:"DELETE",timeout:3e4,trackClient:!1})},activateOllamaHost(e){return oe(`/api/llama-server/hosts/${encodeURIComponent(e)}/activate`,{method:"POST",timeout:3e4,trackClient:!1})},deactivateOllamaHosts(){return oe("/api/llama-server/hosts/deactivate",{method:"POST",timeout:3e4,trackClient:!1})},reorderOllamaHosts(e){return oe("/api/llama-server/hosts/reorder",{method:"POST",body:JSON.stringify({host_ids:e}),timeout:3e4,trackClient:!1})},checkOllamaCapabilities(){return oe("/api/llama-server/hosts/capabilities/test",{method:"POST",timeout:18e4,trackClient:!1})},selectOllamaModel(e,t){return oe(`/api/llama-server/hosts/${encodeURIComponent(e)}/models/select`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},clearOllamaModel(e,t){return oe(`/api/llama-server/hosts/${encodeURIComponent(e)}/models/clear`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},systemUsage(){return oe("/api/system-usage",{trackClient:!1})},indexVersions(){return oe("/api/index-versions",{trackClient:!1})},indexVersion(e){return oe(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return oe(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return oe(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return oe("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){let t=new URLSearchParams({repair:e?"true":"false"});return oe(`/api/index-alias/reconcile?${t.toString()}`,{trackClient:!1})},catalog(){return oe("/api/catalog")},homeSummary(){return oe("/api/home")},judgmentStats(){return oe("/api/judgment-stats")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return oe("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},dataSuggest({kind:e,query:t="",limit:s=12}){let a=new URLSearchParams({kind:e,query:t,limit:String(s)});return oe(`/api/data/suggest?${a.toString()}`,{timeout:45e3,trackClient:!1})},schemaSuggest({database:e,table:t,column:s,query:a,limit:n=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(n)});return oe(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let n=new URLSearchParams({law_key:e});return t&&n.set("source_type",t),s&&n.set("version_id",String(s)),a&&n.set("article_no",String(a)),oe(`/api/law?${n.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),oe(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return oe("/api/test-mode",{trackClient:!1})},llmModels(){return oe("/api/llm/models",{timeout:6e4,trackClient:!1})},testLlmModels(){return oe("/api/llm/models/test",{method:"POST",timeout:12e4,trackClient:!1})},rerankStatus(){return oe("/api/rerank/status",{timeout:6e4,trackClient:!1})},testReranker(){return oe("/api/rerank/test",{method:"POST",timeout:12e4,trackClient:!1})},selectLlmModel(e,t=null){return oe("/api/llm/model",{method:"POST",body:JSON.stringify({model:e,host_id:t}),timeout:3e4,trackClient:!1})},setTestMode(e){return oe("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return oe(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return oe("/api/test-runs/current",{trackClient:!1})},testRun(e){return oe(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return oe("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))i==null||i===""||a.set(n,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),oe(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return oe("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return oe("/api/processing",{timeout:45e3,trackClient:!1})},processingActive(){return oe("/api/processing/active",{timeout:3e3,trackClient:!1})},judgmentDownloadStatus(){return oe("/api/judgment-download/status",{timeout:3e4,trackClient:!1})},versioningSummary(){return oe("/api/versioning/summary",{trackClient:!1})},updatesStatus(){return oe("/api/updates/status",{trackClient:!1})},checkCourts(){return oe("/api/courts/check",{timeout:6e4,trackClient:!1})},checkLawVersions(){return oe("/api/law-versions/check",{timeout:6e4,trackClient:!1})},checkUpdates(e=[]){let t=Array.isArray(e)&&e.length?{source_types:e}:{};return oe("/api/updates/check",{method:"POST",body:JSON.stringify(t),timeout:12e4,trackClient:!1})},versioningSnapshots(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.limit&&t.set("limit",String(e.limit)),oe(`/api/versioning/judgments/snapshots?${t.toString()}`,{trackClient:!1})},versioningChanges(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit)),oe(`/api/versioning/judgments/changes?${t.toString()}`,{trackClient:!1})},versioningJudgment(e){return oe(`/api/versioning/judgments/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVersion(e){return oe(`/api/versioning/judgments/versions/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVector(e,t){return oe(`/api/versioning/judgments/${encodeURIComponent(e)}/vectors/${encodeURIComponent(t)}`,{trackClient:!1})},versioningAudit(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit||500)),oe(`/api/versioning/audit?${t.toString()}`,{trackClient:!1})},questionBankStats(){return oe("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))if(!(i==null||i==="")){if(Array.isArray(i)){for(let o of i)o==null||o===""||a.append(n,String(o));continue}a.set(n,String(i))}return a.set("limit",String(t)),a.set("offset",String(s)),oe(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankTags(e="",t=12){let s=new URLSearchParams({query:e,limit:String(t)});return oe(`/api/question-bank/tags?${s.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return oe(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return oe("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},createQuestionBankItemWithAI(e){return oe("/api/question-bank/ai-items",{method:"POST",body:JSON.stringify(e),timeout:42e4,trackClient:!1})},updateQuestionBankItem(e,t){return oe(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return oe(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},restoreQuestionBankItem(e){return oe(`/api/question-bank/items/${encodeURIComponent(e)}/restore`,{method:"POST",timeout:45e3,trackClient:!1})},submitQuestionBankItemForReview(e){return oe(`/api/question-bank/items/${encodeURIComponent(e)}/submit`,{method:"POST",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return oe(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return oe("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return oe(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return oe("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return oe(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return oe("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},benchmarkSuiteLatestAnswers(e){return oe(`/api/benchmark/suites/${encodeURIComponent(e)}/latest-answers`,{timeout:45e3,trackClient:!1})},removeBenchmarkSuiteItem(e,t){return oe(`/api/benchmark/suites/${encodeURIComponent(e)}/items/${encodeURIComponent(t)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return oe("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return oe(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return oe(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return oe(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return oe("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return oe(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return oe(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return oe(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return oe("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return oe(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return oe("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return oe(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return oe("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return oe("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return oe("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onQueued:n=null,onToken:i=null,onTokenReset:o=null}={}){let l=Bt(),m=new AbortController,f=t?0:3e5,p=f>0?window.setTimeout(()=>m.abort(),f):null,$=Date.now(),b=performance.now(),u=Pr(),h={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":u,"X-Judgment-Client-Started-At":String($)},w;try{w=await fetch(it("/api/rag/query/stream",l),{method:"POST",headers:h,body:JSON.stringify({question:e}),credentials:"include",signal:m.signal})}catch(J){throw J.name==="AbortError"?new pt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new pt(fn(l),0,J)}finally{p&&window.clearTimeout(p)}if(!w.ok){let J=null;try{J=await w.json()}catch{J=null}let he=J&&typeof J=="object"&&J.detail?String(J.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${w.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new pt(he,w.status,J)}if(!w.body)throw new pt("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let _=w.body.getReader(),L=new TextDecoder,S="",x=null,O=null;try{for(;;){let{value:J,done:he}=await _.read();if(he)break;S+=L.decode(J,{stream:!0});let me=S.indexOf(`

`);for(;me>=0;){let Z=S.slice(0,me).replace(/\r/g,"");S=S.slice(me+2);let j="message",A=[];for(let E of Z.split(`
`))E.startsWith("event:")?j=E.slice(6).trim():E.startsWith("data:")&&A.push(E.slice(5).trimStart());if(A.length){let E=null;try{E=JSON.parse(A.join(`
`))}catch{E=null}if(E)if(j==="step"&&typeof s=="function")try{s(E)}catch{}else if(j==="partial"){if(typeof a=="function")try{a(E)}catch{}}else if(j==="queued"){if(typeof n=="function")try{n(E)}catch{}}else if(j==="token"){if(typeof i=="function")try{i(String(E.text||""))}catch{}}else if(j==="token_reset"){if(typeof o=="function")try{o()}catch{}}else j==="result"?x=E:j==="error"&&(O=new pt(E.message||E.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,E))}me=S.indexOf(`

`)}}}finally{try{await _.cancel()}catch{}p&&window.clearTimeout(p)}if(O)throw O;if(!x)throw new pt("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let ie=Math.round(performance.now()-b);return Ir({request_id:u,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:ie,render_ms:0,status:"success"}),x&&typeof x=="object"&&(x._client_request_id=u),x}};var nl={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},rl={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},il={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},ol={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Br={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',palette:'<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10h-4Z"/><circle cx="7.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/><circle cx="10" cy="6.8" r=".8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="6.8" r=".8" fill="currentColor" stroke="none"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',more:'<circle cx="4.2" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="19.8" cy="12" r="2.6" fill="currentColor" stroke="none"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function r(e){return String(e??"").replace(/[&<>"']/g,t=>nl[t])}function g(e,t=16,s=""){let a=Br[e]||Br.info;return`<svg${s?` class="${r(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function d(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function qe(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function bn(e){if(e instanceof Date)return e;if(typeof e=="number"){let n=new Date(e);return Number.isNaN(n.getTime())?null:n}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function Et(e){let t=bn(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?r(e):"\u2014"}function $e(e){let t=bn(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?r(e):"\u2014"}function Hs(e){let t=bn(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:Et(t)}function de(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Rt(e){return rl[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Ge(e,t){let s=Rt(e);return`<span class="badge ${il[s.tone]}"><span class="status-dot ${ol[s.tone]}"></span>${r(t||s.label)}</span>`}function ll(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${r(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function fa(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function ba(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return Ge(String(e));case"source":return ll(String(e));case"number":return`<span class="mono">${d(e)}</span>`;case"duration":return`<span class="mono">${de(e)}</span>`;case"datetime":return`<span class="mono">${$e(e)}</span>`;case"date":return`<span class="mono">${Et(e)}</span>`;case"url":{let s=String(e),a=fa(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${r(s)}" target="_blank" rel="noopener noreferrer" title="${r(s)}">${g("external",10)}${r(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${r(s)}">${r(fa(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(fa(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(fa(s,90))}</span>`}}}function Ee({tone:e="info",title:t,text:s,iconName:a="info"}){let n=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${n==="i"?"i":g(n,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${r(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function ot({iconName:e="search",title:t,text:s="",actions:a="",className:n=""}){return`<div class="empty-state ${n}">
    <span class="empty-icon">${g(e,24)}</span>
    <h3 class="empty-title">${r(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function Me(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${r(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function D(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let n={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${n[t]||"i"}</span>
    <div class="toast-body">${r(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function xs(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function Ct(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),n=URL.createObjectURL(a),i=document.createElement("a");i.href=n,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(n),1e3)}var cl=`
  <svg class="auth-google-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z"/>
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.58A10 10 0 0 0 12 22Z"/>
    <path fill="#FBBC05" d="M6.41 13.92A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.92V7.5H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.5l3.35-2.58Z"/>
    <path fill="#EA4335" d="M12 6.04c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.5l3.35 2.58C7.2 7.8 9.4 6.04 12 6.04Z"/>
  </svg>`,dl={google_not_configured:"Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A GOOGLE_CLIENT_ID \u8207 GOOGLE_CLIENT_SECRET\u3002",state_mismatch:"\u767B\u5165\u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u767B\u5165\u3002",access_denied:"\u4F60\u53D6\u6D88\u4E86 Google \u767B\u5165\u3002",email_unverified:"\u9019\u500B Google \u5E33\u865F\u7684\u96FB\u5B50\u90F5\u4EF6\u5C1A\u672A\u9A57\u8B49\u3002",not_allowed:"\u9019\u500B Google \u5E33\u865F\u6C92\u6709\u7BA1\u7406\u54E1\u6B0A\u9650\u3002",oauth_failed:"Google \u767B\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"},Ft=null;function ul(){return Nt()==="query"?"":Bt()}function pl(){let e=ul(),t=`${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;return it(`/api/auth/google/start?next=${encodeURIComponent(t)}`,e)}function Hr(e){let t=String(e?.name||"").trim();if(t)return t;let s=String(e?.email||"").trim();return s?s.split("@")[0]:"\u5DF2\u767B\u5165"}function ml(e){return Hr(e).slice(0,1).toUpperCase()||"A"}function Fr(){let e=Ft?.querySelector("#auth-menu"),t=Ft?.querySelector("#auth-user-trigger");e&&(e.hidden=!0),t&&t.setAttribute("aria-expanded","false")}function Or(e={}){let t=!!e.google_enabled;Ft.innerHTML=`
    <a class="auth-login${t?"":" is-disabled"}"
       id="auth-login"
       href="${r(pl())}"
       aria-label="\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165"
       title="${t?"\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165":"Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A"}"
       ${t?"":'aria-disabled="true"'}>
      ${cl}
      <span>\u767B\u5165</span>
    </a>`,t||Ft.querySelector("#auth-login")?.addEventListener("click",a=>{a.preventDefault(),D("Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A GOOGLE_CLIENT_ID \u8207 GOOGLE_CLIENT_SECRET\u3002","warn",5200)})}function gl(e){let t=Hr(e),s=String(e?.email||""),a=e?.admin?"\u7BA1\u7406\u54E1":"\u5DF2\u767B\u5165";Ft.innerHTML=`
    <div class="auth-user">
      <button type="button"
              class="auth-user-trigger"
              id="auth-user-trigger"
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="\u5DF2\u767B\u5165\uFF1A${r(s||t)}\uFF0C\u958B\u555F\u5E33\u865F\u9078\u55AE"
              title="${r(s||t)}">
        <span class="auth-avatar" aria-hidden="true">${r(ml(e))}</span>
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
    </div>`;let n=Ft.querySelector("#auth-user-trigger"),i=Ft.querySelector("#auth-menu");n?.addEventListener("click",o=>{o.stopPropagation();let l=!!i?.hidden;i&&(i.hidden=!l),n.setAttribute("aria-expanded",l?"true":"false")}),Ft.querySelector("#auth-logout")?.addEventListener("click",async o=>{let l=o.currentTarget;l.disabled=!0,l.textContent="\u767B\u51FA\u4E2D\u2026";try{await V.authLogout(),D("\u5DF2\u767B\u51FA\u3002","ok",2400),await zr()}catch(m){l.disabled=!1,l.textContent="\u767B\u51FA",D(m.message||"\u767B\u51FA\u5931\u6557\u3002","danger",5200)}})}async function zr(){if(Ft)try{let e=await V.authMe();e?.authenticated?gl(e):Or(e)}catch{Or({google_enabled:!1})}}function fl(){let e;try{e=new URL(window.location.href)}catch{return}let t=e.searchParams.get("auth"),s=e.searchParams.get("auth_error");!t&&!s||(e.searchParams.delete("auth"),e.searchParams.delete("auth_error"),window.history.replaceState(null,"",`${e.pathname}${e.search}${e.hash}`),t==="ok"?D("\u5DF2\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165\u3002","ok",3600):s&&D(dl[s]||"Google \u767B\u5165\u5931\u6557\u3002","danger",6e3))}function Gr(){Ft=document.getElementById("auth-slot"),Ft&&(fl(),document.addEventListener("click",e=>{e.target.closest(".auth-user")||Fr()}),document.addEventListener("keydown",e=>{e.key==="Escape"&&Fr()}),zr())}var Ur="judgment.theme",hn="nvidia",ha=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#0070f3","#171717","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#0066cc","#1d1d1f","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#17171d","#5e6ad2","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#0d99ff","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#0075de","#191918","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],vn=new Map(ha.map(e=>[e.id,e]));function bl(e){return vn.has(e)}function hl(e){return vn.get(e)||vn.get(hn)}function $n(){try{let e=window.localStorage.getItem(Ur);return bl(e)?e:hn}catch{return hn}}function yn(e,{persist:t=!0}={}){let s=hl(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");if(a&&a.setAttribute("content",s.metaColor),document.querySelectorAll(".theme-option").forEach(n=>{let i=n.dataset.themeId===s.id;n.classList.toggle("is-active",i),n.setAttribute("aria-checked",i?"true":"false")}),t)try{window.localStorage.setItem(Ur,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}var va="judgment.fontSizes.v1",xn="judgment.appearance",Yr=new Set(["light","dark","system"]),Qr="light",zs=window.matchMedia("(prefers-color-scheme: dark)"),vl="font-size",Us=[{id:"page-title",label:"\u9801\u9762\u6A19\u984C",hint:"\u5404\u9801\u6700\u4E0A\u65B9\u7684 h1 \u6A19\u984C",selectors:[".page-title"],defaultPx:40,min:20,max:72},{id:"home-title",label:"\u9996\u9801\u4E3B\u8996\u89BA\u6A19\u984C",hint:"\u9996\u9801\u6700\u5927\u7684\u4E3B\u6A19\u984C",selectors:[".home-title"],defaultPx:88,min:40,max:140},{id:"section-title",label:"\u5340\u584A\u6A19\u984C",hint:"\u5831\u8868\u3001\u5361\u7247\u8207\u5340\u584A\u6A19\u984C",selectors:[".section-title",".report-title",".side-card-title",".filter-title",".tests-card-title",".status-sidebar-title",".judgment-dialog-head h2"],defaultPx:16,min:10,max:36},{id:"body",label:"\u5167\u6587\u8207\u8AAA\u660E",hint:"\u6BB5\u843D\u3001\u56DE\u7B54\u3001\u8AAA\u660E\u8207\u6458\u8981\u6587\u5B57",selectors:[".answer-text",".page-subtitle",".report-sub",".home-lead",".empty-text",".notice-body p",".citation-snippet",".side-card-body",".detail-list",".field-help",".report-empty-inline",".processing-section-sub",".summary-value-text",".status-summary",".warnings",".law-dialog-warning"],defaultPx:14,min:8,max:28},{id:"table",label:"\u8868\u683C\u5167\u5BB9",hint:"\u8CC7\u6599\u8868\u683C\u7684\u8868\u982D\u8207\u5132\u5B58\u683C",selectors:[".data-table th",".data-table td"],defaultPx:12,min:8,max:24},{id:"meta",label:"\u6A19\u7C64\u8207\u8F14\u52A9\u6587\u5B57",hint:"badge\u3001chip\u3001\u6B04\u4F4D\u6A19\u7C64\u8207 metadata",selectors:[".badge",".chip",".citation-meta",".citation-index",".answer-section-label",".report-kicker",".report-section-title",".eyebrow",".field-label",".summary-label",".metric-label",".footer-bottom",".nav-update-badge"],defaultPx:10,min:7,max:20},{id:"button",label:"\u6309\u9215\u8207\u5C0E\u89BD",hint:"\u64CD\u4F5C\u6309\u9215\u3001\u9801\u9996\u5C0E\u89BD\u8207\u9023\u7D50",selectors:[".btn",".nav-link",".page-btn",".law-link",".judgment-link",".theme-option-name",".theme-option-desc"],defaultPx:13,min:9,max:24},{id:"form",label:"\u8868\u55AE\u8207\u8F38\u5165",hint:"\u8F38\u5165\u6846\u3001\u4E0B\u62C9\u9078\u55AE\u8207 textarea",selectors:["input","textarea","select",".input",".field-input"],defaultPx:14,min:9,max:28},{id:"mono",label:"\u7A0B\u5F0F\u78BC\u8207\u6578\u503C",hint:"\u7B49\u5BEC\u6587\u5B57\u3001\u67E5\u8A62\u8A9E\u53E5\u8207\u7D71\u8A08\u6578\u503C",selectors:[".mono",".cell-mono",".cell-number",".query-code","code",".metric-value",".summary-value",".perf-stat-value",".mini-stat-value"],defaultPx:13,min:8,max:30},{id:"law-page",label:"\u6CD5\u898F\u689D\u6587\uFF08\u9801\u9762\uFF09",hint:"\u6CD5\u898F\u6AA2\u7D22\u7D50\u679C\u8207\u6CD5\u898F\u4F86\u6E90\u5361\u689D\u6587",selectors:[".law-answer-article-text",".law-answer-article-no",".law-source-article-text",".law-source-article-no",".law-article-text",".law-article-no"],excludeAncestors:[".law-dialog"],defaultPx:12,min:9,max:28},{id:"law-dialog",label:"\u6CD5\u898F\u689D\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u6309\u4E0B\u689D\u6587\u5F8C\u958B\u555F\u7684\u6CD5\u898F dialog",selectors:[".law-dialog .law-article-text",".law-dialog .law-article-no",".law-dialog .law-chapter"],defaultPx:16,min:10,max:32},{id:"judgment-dialog",label:"\u5224\u6C7A\u5168\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u5224\u6C7A\u539F\u6587 dialog \u7684\u5168\u6587\u5340\u584A",selectors:[".judgment-dialog-text"],defaultPx:23,min:12,max:48}],Ms=new Map(Us.map(e=>[e.id,e])),Gs=new WeakMap,Yt=ti(),$t={...Yt},Xt=Zr(),wn=new Set,qs=null,As=null,gt=null,bs=null,Jr=null,os=vl,ls=!1,_n=null,kn=!1,$a="";function Xr(e,t,s){return Math.min(s,Math.max(t,e))}function An(e){return Math.round(e*10)/10}function wa(e){return Number.isInteger(e)?String(e):e.toFixed(1)}function Zr(){try{let e=window.localStorage.getItem(xn);return Yr.has(e)?e:Qr}catch{return Qr}}function $l(){return Xt==="system"?zs.matches?"dark":"light":Xt}function ei(){document.querySelectorAll("[data-appearance-option]").forEach(e=>{let t=e.dataset.appearanceOption===Xt;e.classList.toggle("is-active",t),e.setAttribute("aria-pressed",t?"true":"false")})}function ya({persist:e=!1}={}){if(document.documentElement.dataset.appearance=$l(),document.documentElement.dataset.appearanceMode=Xt,ei(),e)try{window.localStorage.setItem(xn,Xt)}catch{}}function yl(e){Yr.has(e)&&(Xt=e,ya({persist:!0}))}function Vr(){Xt==="system"&&ya()}typeof zs.addEventListener=="function"?zs.addEventListener("change",Vr):typeof zs.addListener=="function"&&zs.addListener(Vr);function ti(){let e=null;try{e=JSON.parse(window.localStorage.getItem(va)||"null")}catch{e=null}if(!e||typeof e!="object"||Array.isArray(e))return{};let t={};for(let s of Us){let a=Number(e[s.id]);Number.isFinite(a)&&(t[s.id]=An(Xr(a,s.min,s.max)))}return t}function wl(){try{return Object.keys(Yt).length?window.localStorage.setItem(va,JSON.stringify(Yt)):window.localStorage.removeItem(va),!0}catch{return!1}}function Js(e){let t=new Set;for(let s of e.selectors)document.querySelectorAll(s).forEach(a=>{a.closest(".settings-sidebar")||Array.isArray(e.excludeAncestors)&&e.excludeAncestors.some(n=>a.closest(n))||t.add(a)});return Array.from(t)}function si(){if(!$a)return;let e=Ms.get($a);if(e)for(let t of Js(e))t.classList.add("font-size-highlight")}function ai(e){if(Ls(),!Ms.get(e))return;$a=e;let s=gt.querySelector(`.font-size-row[data-font-group="${e}"]`);s&&s.classList.add("is-previewing"),si()}function Ls(){$a="",gt.querySelectorAll(".font-size-row.is-previewing").forEach(e=>e.classList.remove("is-previewing")),document.querySelectorAll(".font-size-highlight").forEach(e=>e.classList.remove("font-size-highlight"))}function _l(e){if(Gs.has(e))return Gs.get(e);let t={inline:e.style.fontSize||"",computed:parseFloat(window.getComputedStyle(e).fontSize)||0};return Gs.set(e,t),t}function kl(e){let t=Gs.get(e);t&&(t.inline?e.style.fontSize=t.inline:e.style.removeProperty("font-size"))}function Sl(e){let t=$t[e.id];if(Number.isFinite(t))for(let s of Js(e))_l(s),s.style.fontSize=`${t}px`}function xl(e){for(let t of Js(e))kl(t)}function cs(){for(let e of wn){let t=Ms.get(e);t&&xl(t)}wn=new Set;for(let e of Us)Number.isFinite($t[e.id])&&(Sl(e),wn.add(e.id));si()}function ni(){cs(),ls&&os==="font-size"&&Qs()}function ri(){kn||(kn=!0,window.requestAnimationFrame(()=>{kn=!1,cs()}))}function Al(){_n||!document.body||(_n=new MutationObserver(e=>{if(Object.keys($t).length){for(let t of e)if(t.type==="childList"&&(t.addedNodes.length||t.removedNodes.length)){ri();return}}}),_n.observe(document.body,{childList:!0,subtree:!0}))}function ql(e){let t=e.filter(s=>typeof s.getClientRects=="function"&&s.getClientRects().length);return t.length?t:e}function Ml(){let e=Us.filter(t=>Js(t).length>0||Number.isFinite($t[t.id]));return e.length?e:Us}function _a(e){let t=$t[e.id];if(Number.isFinite(t))return t;let a=ql(Js(e)).map(o=>{let l=Gs.get(o);return l&&l.computed?l.computed:parseFloat(window.getComputedStyle(o).fontSize)||0}).filter(o=>o>0).sort((o,l)=>o-l);if(!a.length)return e.defaultPx;let n=Math.floor(a.length/2),i=a.length%2?a[n]:(a[n-1]+a[n])/2;return An(i)}function Ll(){let e=[{id:"font-size",label:"\u5B57\u578B\u5927\u5C0F",hint:"\u8ABF\u6574\u5404\u6587\u5B57\u5340\u584A",glyph:'<span class="settings-option-aa" aria-hidden="true">Aa</span>'},{id:"theme",label:"\u4ECB\u9762\u98A8\u683C",hint:"\u5207\u63DB\u54C1\u724C\u8996\u89BA\u8A9E\u8A00",glyph:g("palette",15)}];bs.innerHTML=e.map(t=>`<button class="settings-option${os===t.id?" is-active":""}" type="button" role="tab"
        data-settings-panel="${t.id}"
        aria-selected="${os===t.id?"true":"false"}">
        <span class="settings-option-icon">${t.glyph}</span>
        <span class="settings-option-copy">
          <strong>${r(t.label)}</strong>
          <small>${r(t.hint)}</small>
        </span>
        ${g("chevronRight",12,"settings-option-chevron")}
      </button>`).join("")}function Qs(){Ls();let e=Ml(),t=e.map(s=>{let a=wa(_a(s));return`<section class="font-size-row" data-font-group="${s.id}">
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
    </section>`}).join("");gt.innerHTML=`<div class="settings-panel-head">
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
    </div>`}function jl(){Ls();let e=$n(),t=ha.map((n,i)=>{let o=n.swatches.map(l=>`<i style="--swatch:${r(l)}"></i>`).join("");return`<button class="theme-option${n.id===e?" is-active":""}" type="button" role="menuitemradio"
      data-theme-id="${r(n.id)}"
      data-theme="${r(n.id)}"
      aria-checked="${n.id===e?"true":"false"}">
      <span class="theme-option-index">${String(i+1).padStart(2,"0")}</span>
      <span class="theme-option-body">
        <span class="theme-option-name">${r(n.name)}</span>
        <span class="theme-option-desc">${r(n.description)}</span>
      </span>
      <span class="theme-option-active-preview" aria-hidden="true">
        ${g("sliders",11)}
        <span>\u4F5C\u7528\u4E2D</span>
        <span class="theme-option-active-preview-badge">2</span>
      </span>
      <span class="theme-option-swatches" aria-hidden="true">${o}</span>
      <span class="theme-option-check" aria-hidden="true">${g("check",14)}</span>
    </button>`}).join(""),a=`<div class="appearance-switch" role="group" aria-label="\u660E\u6697\u6A21\u5F0F">
    ${[{id:"light",label:"\u4EAE"},{id:"dark",label:"\u6697"},{id:"system",label:"\u7CFB\u7D71"}].map(n=>`<button class="appearance-option" type="button"
          data-appearance-option="${n.id}"
          aria-pressed="${Xt===n.id?"true":"false"}"
          title="${n.id==="system"?"\u8DDF\u96A8\u7CFB\u7D71\u660E\u6697":`${n.label}\u8272\u6A21\u5F0F`}">${n.label}</button>`).join("")}
  </div>`;gt.innerHTML=`<div class="settings-panel-head">
      <div>
        <h3>\u4ECB\u9762\u98A8\u683C</h3>
        <p>\u9078\u64C7\u4E3B\u63A7\u53F0\u7684\u54C1\u724C\u8996\u89BA\u8A9E\u8A00\uFF1B\u4E3B\u984C\u6703\u7ACB\u5373\u5957\u7528\u4E26\u4FDD\u7559\u3002</p>
      </div>
      <div class="settings-panel-head-actions">
        <span class="badge badge-info">${ha.length} \u7A2E</span>
        ${a}
      </div>
    </div>
    <div class="settings-theme-list" role="menu" aria-label="\u4ECB\u9762\u98A8\u683C">${t}</div>`,ei()}function Tl(){bs.querySelectorAll("[data-settings-panel]").forEach(e=>{let t=e.dataset.settingsPanel===os;e.classList.toggle("is-active",t),e.setAttribute("aria-selected",t?"true":"false")})}function qn(e=os){os=e==="theme"?"theme":"font-size",Tl(),os==="theme"?jl():Qs()}function Wr(e,t,s){let a=Number(t);if(!Number.isFinite(a))return;let n=An(Xr(a,e.min,e.max));$t[e.id]=n;let i=s?.querySelector(".font-size-slider");i&&(i.value=String(n));let o=s?.querySelector(".font-size-preview");o&&(o.style.fontSize=`${n}px`),ri()}function Nl(){gt.querySelectorAll(".font-size-row").forEach(e=>{let t=Ms.get(e.dataset.fontGroup);if(!t)return;let s=$t[t.id]??_a(t),a=e.querySelector(".font-size-number-input");a&&(a.value=wa(s));let n=e.querySelector(".font-size-slider");n&&(n.value=String(s));let i=e.querySelector(".font-size-preview");i&&(i.style.fontSize=`${s}px`)})}function Kr(e){let t=e.target.closest(".font-size-row");if(!t)return;let s=Ms.get(t.dataset.fontGroup);if(!s)return;let a=e.target.classList.contains("font-size-number-input");if(!(a&&e.target.value==="")){if(e.type==="input"&&a){let n=Number(e.target.value);if(!Number.isFinite(n))return;Wr(s,n,t);return}if(Wr(s,e.target.value,t),e.type==="input"){let n=t.querySelector(".font-size-number-input");n&&document.activeElement!==n&&(n.value=wa($t[s.id]??_a(s)))}}}function El(e){if(!e.target.classList.contains("font-size-number-input"))return;let t=e.target.closest(".font-size-row"),s=t?Ms.get(t.dataset.fontGroup):null;if(!s)return;let a=$t[s.id]??_a(s);e.target.value=wa(a)}function Rl(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||ai(t.dataset.fontGroup)}function Cl(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Ls()}function Pl(e){let t=e.target.closest(".font-size-row");t&&ai(t.dataset.fontGroup)}function Il(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Ls()}function Dl(e){let t=e.target.closest("[data-settings-panel]");if(t){qn(t.dataset.settingsPanel);return}let s=e.target.closest("[data-settings-action]");if(s){let i=s.dataset.settingsAction;if(i==="save"){Yt={...$t};let o=wl();Nl(),D(o?"\u5B57\u578B\u5927\u5C0F\u5DF2\u5132\u5B58\u3002":"\u5B57\u578B\u5927\u5C0F\u5DF2\u5957\u7528\uFF0C\u4F46\u700F\u89BD\u5668\u7121\u6CD5\u5132\u5B58\u8A2D\u5B9A\u3002",o?"ok":"warn");return}if(i==="cancel"){$t={...Yt},cs(),Qs(),D("\u5DF2\u53D6\u6D88\u672A\u5132\u5B58\u7684\u5B57\u578B\u8B8A\u66F4\u3002","info");return}i==="reset"&&($t={},cs(),Qs(),D("\u5DF2\u56DE\u5FA9\u9810\u8A2D\u5B57\u578B\uFF1B\u6309\u300C\u5132\u5B58\u300D\u4FDD\u7559\u8B8A\u66F4\u3002","info"));return}let a=e.target.closest("[data-appearance-option]");if(a){yl(a.dataset.appearanceOption);return}let n=e.target.closest(".theme-option");n&&yn(n.dataset.themeId)}function Bl(){ls||(ls=!0,$t={...Yt},document.body.classList.add("settings-open"),qs.removeAttribute("inert"),qs.setAttribute("aria-hidden","false"),As.setAttribute("aria-expanded","true"),qn(os),cs(),window.requestAnimationFrame(()=>{let e=bs.querySelector(".settings-option.is-active")||bs.querySelector(".settings-option");e&&e.focus({preventScroll:!0})}))}function Sn({restoreFocus:e=!0}={}){ls&&(ls=!1,Ls(),$t={...Yt},cs(),document.body.classList.remove("settings-open"),e&&As.focus({preventScroll:!0}),qs.setAttribute("aria-hidden","true"),qs.setAttribute("inert",""),As.setAttribute("aria-expanded","false"))}function ii(){qs=document.getElementById("settings-sidebar"),As=document.getElementById("settings-trigger"),gt=document.getElementById("settings-panel"),bs=document.getElementById("settings-options"),Jr=document.getElementById("settings-close"),!(!qs||!As||!gt||!bs)&&(ya(),yn($n(),{persist:!1}),Ll(),Qs(),Al(),cs(),As.addEventListener("click",()=>{ls?Sn():Bl()}),Jr?.addEventListener("click",()=>Sn()),bs.addEventListener("click",e=>{let t=e.target.closest("[data-settings-panel]");t&&qn(t.dataset.settingsPanel)}),gt.addEventListener("click",Dl),gt.addEventListener("input",Kr),gt.addEventListener("change",Kr),gt.addEventListener("blur",El,!0),gt.addEventListener("pointerover",Rl),gt.addEventListener("pointerout",Cl),gt.addEventListener("focusin",Pl),gt.addEventListener("focusout",Il),gt.addEventListener("keydown",e=>{e.key==="Enter"&&e.target.classList.contains("font-size-number-input")&&(e.preventDefault(),e.target.blur())}),document.addEventListener("keydown",e=>{e.key==="Escape"&&ls&&Sn()}),window.addEventListener("storage",e=>{if(e.key===xn){Xt=Zr(),ya();return}e.key===va&&(Yt=ti(),ls||($t={...Yt},cs()))}))}var Pn={};rs(Pn,{render:()=>Zl});function Fl(e){let t=e&&typeof e=="object"?e:{},s=t.judgment_total,a=t.financial_total,n=Number(s),i=Number(a),o=s!=null&&Number.isFinite(n)&&n>=0,l=a!=null&&Number.isFinite(i)&&i>=0;return{total:o?n:null,financial:l?i:null,ratio:o&&l&&n>0?i/n*100:null}}function Vt(e,{loading:t=!1}={}){let s=Fl(e),a=t?"\u8B80\u53D6\u4E2D\u2026":d(s.total),n=t?"\u8B80\u53D6\u4E2D\u2026":d(s.financial),i=t?"\u8B80\u53D6\u4E2D\u2026":s.ratio===null?"\u2014":`${s.ratio.toFixed(1)}%`;return`<div class="processing-summary-card">
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
  </div>`}var Mn=11,Ol=15e3,ka=new Set,Hl=[{route:"rag",icon:"message",kicker:"RAG",title:"RAG \u63D0\u554F",summary:"\u7528\u81EA\u7136\u8A9E\u8A00\u627E\u5230\u76F8\u4F3C\u5224\u6C7A\u8207\u73FE\u884C\u6CD5\u898F\uFF0C\u56DE\u7B54\u9644\u4E0A\u53EF\u56DE\u6EAF\u7684\u5F15\u7528\u3002",metric:"Citations first",tone:"feature",wide:!0,metricKey:"rag"},{route:"data",icon:"database",kicker:"EXPLORE",title:"\u8CC7\u6599\u5EAB\u67E5\u8A62",summary:"\u8DE8 PostgreSQL\u3001Parquet\u3001Qdrant \u8207 IndexedDB \u6AA2\u8996\u539F\u59CB\u8CC7\u6599\u3002",metric:"4 \u7A2E\u8CC7\u6599\u4F86\u6E90",tone:"blue",metricKey:"data"},{route:"quality",icon:"shield",kicker:"QUALITY",title:"\u8CC7\u6599\u54C1\u8CEA",summary:"\u7528 DuckDB \u6AA2\u67E5\u539F\u59CB\u5224\u6C7A\u7684\u91CD\u8907\u3001\u7F3A\u6F0F\u8207\u5F15\u7528\u4E00\u81F4\u6027\u3002",metric:"DuckDB native",tone:"green",metricKey:"quality"},{route:"performance",icon:"activity",kicker:"OBSERVE",title:"\u6548\u80FD\u5831\u8868",summary:"\u5F9E\u55AE\u6B21 RAG \u5230\u7D22\u5F15\u5EFA\u7F6E\uFF0C\u8FFD\u8E64\u6BCF\u500B\u968E\u6BB5\u7684\u8017\u6642\u8207\u74F6\u9838\u3002",metric:"Flow \xB7 Waterfall",tone:"amber",metricKey:"performance"},{route:"processing",icon:"sliders",kicker:"PIPELINE",title:"\u8CC7\u6599\u8655\u7406",summary:"\u4E0B\u8F09\u3001\u532F\u5165\u3001\u5099\u4EFD\u8207\u7D22\u5F15\uFF0C\u96C6\u4E2D\u7BA1\u7406\u8CC7\u6599\u751F\u547D\u9031\u671F\u3002",metric:"End-to-end",tone:"violet",metricKey:"processing"},{route:"status",icon:"server",kicker:"STATUS",title:"\u7CFB\u7D71\u72C0\u614B",summary:"\u6AA2\u8996\u670D\u52D9\u5065\u5EB7\u3001\u8F09\u5165 Pipeline\u3001\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207 API \u76EE\u9304\u3002",metric:"10 \u670D\u52D9\u5143\u4EF6",tone:"slate",metricKey:"status"},{route:"tests",icon:"check",kicker:"VERIFY",title:"\u7CFB\u7D71\u6E2C\u8A66",summary:"\u8A2D\u5B9A API Base\uFF0C\u6E2C\u8A66 LLM \u6A21\u578B\u8207 Reranker \u670D\u52D9\u3002",metric:"LLM \xB7 Reranker",tone:"rose",metricKey:"tests"}];function js(e,t=1){let s=Number(e);return Number.isFinite(s)?`${s.toFixed(t)}%`:"\u2014"}function jn(e){let t=e?.year_min,s=e?.year_max;return!t&&!s?"\u2014":t&&s&&t!==s?`${t}\u2013${s}`:String(t||s)}function oi(e){let t=Number(e?.year_span);return Number.isFinite(t)&&t>0?`${t} \u5E74`:"\u2014"}function zl(e){return`<a class="home-tile tone-${r(e.tone)}${e.wide?" is-wide":""}" href="#/${e.route}">
    <span class="home-tile-watermark" aria-hidden="true">${g(e.icon,148)}</span>
    <span class="home-tile-head">
      <span class="home-tile-icon">${g(e.icon,22)}</span>
      <span class="home-tile-kicker">${r(e.kicker)}</span>
    </span>
    <span class="home-tile-copy">
      <strong>${r(e.title)}</strong>
      <span>${r(e.summary)}</span>
    </span>
    <span class="home-tile-foot">
      <span class="home-tile-metric" data-home-tile-metric="${r(e.metricKey)}">${r(e.metric)}</span>
      <span class="home-tile-cta">\u63A2\u7D22 ${g("arrowRight",13)}</span>
    </span>
  </a>`}function Tn(e,{loading:t=!1}={}){let s=e?.laws||{},a=n=>t?"\u8B80\u53D6\u4E2D\u2026":d(n);return`<div class="processing-summary-card">
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
    <span class="processing-summary-hint">${t?"\u689D\u6587\u7D22\u5F15\u4F86\u6E90":`\u6CD5\u898F ${d(s.law_article_count)} \xB7 \u547D\u4EE4 ${d(s.order_article_count)}`}</span>
  </div>`}function Gl(e,{loading:t=!1}={}){if(t)return`<div class="home-live-rows is-loading">
      <span class="skeleton skeleton-line"></span>
      <span class="skeleton skeleton-line"></span>
      <span class="skeleton skeleton-line"></span>
      <span class="skeleton skeleton-line"></span>
    </div>`;let s=e?.laws||{},a=e?.judgments||{},n=e?.rag?.judgment_index||{};return`<div class="home-live-rows">
    <div class="home-live-row">
      <span class="home-live-label">\u6CD5\u898F\uFF0F\u547D\u4EE4</span>
      <span class="home-live-value mono">${d(s.law_count)} <i>/</i> ${d(s.order_count)}</span>
    </div>
    <div class="home-live-row">
      <span class="home-live-label">\u91D1\u878D\u5224\u6C7A</span>
      <span class="home-live-value mono" data-home-live="judgments">${d(a.financial_total)}</span>
    </div>
    <div class="home-live-row">
      <span class="home-live-label">\u88C1\u5224\u5E74\u4EFD</span>
      <span class="home-live-value mono">${r(jn(a))} <i>\xB7</i> ${r(oi(a))}</span>
    </div>
    <div class="home-live-row">
      <span class="home-live-label">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15</span>
      <span class="home-live-value mono">${d(n.indexed)} <i>\xB7</i> ${r(js(n.coverage_pct))}</span>
    </div>
  </div>`}function xa(e,{loading:t=!1,error:s="",generatedAt:a=""}={}){return s?`<div class="home-live-error" role="status">
      <span class="home-live-error-icon">${g("alert",18)}</span>
      <div>
        <strong>\u5373\u6642\u6458\u8981\u66AB\u6642\u7121\u6CD5\u53D6\u5F97</strong>
        <p>${r(s)}</p>
        <button class="btn btn-secondary btn-sm" type="button" id="home-retry">
          ${g("refresh",13)}<span>\u91CD\u65B0\u8F09\u5165</span>
        </button>
      </div>
    </div>`:`${Gl(e,{loading:t})}
    <div class="home-live-foot">
      <span class="home-live-source">${g("link",12)}\u53F8\u6CD5\u9662 OpenData \xB7 \u5168\u570B\u6CD5\u898F\u8CC7\u6599\u5EAB</span>
      <span class="home-live-time">${t||!a?"\u540C\u6B65\u4E2D\u2026":`\u66F4\u65B0 ${$e(a)}`}</span>
    </div>`}function Nn(e,{loading:t=!1}={}){if(t)return`<span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>
      <span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>
      <span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>`;let s=e?.judgments||{},a=e?.raw||{},n=e?.rag?.judgment_index||{};return`<span class="home-fact">
      <span class="home-fact-label">\u539F\u59CB\u5224\u6C7A\u5099\u4EFD</span>
      <strong>${d(a.raw_total)}</strong>
      <small>${d(a.archive_count)} \u500B archive \xB7 \u53F8\u6CD5\u9662 OpenData</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">\u91D1\u878D\u5224\u6C7A\u5E74\u4EFD</span>
      <strong>${r(jn(s))}</strong>
      <small>${r(oi(s))} \xB7 ${d(s.financial_total)} \u7B46 current</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">\u5411\u91CF\u7D22\u5F15\u8986\u84CB</span>
      <strong>${r(js(n.coverage_pct))}</strong>
      <small>${d(n.indexed)} / ${d(n.total)} \u7B46 \xB7 ${r(n.model||"\u2014")}</small>
    </span>`}function Sa(e,t){let s=t?.laws||{},a=t?.judgments||{},n=t?.raw||{},i=t?.sources||{};if(e==="opendata"){let l=i.opendata||{};return`<article class="home-source-card">
      <div class="home-source-head">
        <span class="home-source-icon">${g("cloud",20)}</span>
        <div>
          <strong>${r(l.label||"\u53F8\u6CD5\u9662\u8CC7\u6599\u958B\u653E\u5E73\u81FA")}</strong>
          <small>\u88C1\u5224\u66F8\u539F\u59CB\u8CC7\u6599</small>
        </div>
        <a class="home-source-link" href="${r(l.url||"https://opendata.judicial.gov.tw/")}" target="_blank" rel="noopener noreferrer">${g("external",12)}\u4F86\u6E90</a>
      </div>
      <p class="home-source-copy">\u5224\u6C7A\u5168\u6587\u3001\u6848\u865F\u3001\u6CD5\u9662\u3001\u88C1\u5224\u65E5\u671F\u8207 PDF \u9023\u7D50\u7686\u4FDD\u7559\u539F\u59CB\u6B04\u4F4D\uFF1B\u532F\u5165\u524D\u5148\u5BEB\u5165\u4E0D\u53EF\u8B8A\u7684 raw Parquet \u5099\u4EFD\u3002</p>
      <dl class="home-source-facts">
        <div><dt>\u539F\u59CB\u5224\u6C7A</dt><dd>${d(n.raw_total)}</dd></div>
        <div><dt>Archive</dt><dd>${d(n.archive_count)}</dd></div>
        <div><dt>\u88C1\u5224\u5E74\u4EFD</dt><dd>${r(jn(a))}</dd></div>
        <div><dt>\u5206\u985E\u4EE3\u78BC</dt><dd>${r(l.category||"051")}</dd></div>
      </dl>
      <div class="home-source-flow"><span>RAR</span>${g("arrowRight",11)}<span>raw Parquet</span>${g("arrowRight",11)}<span>PostgreSQL</span></div>
    </article>`}let o=i.laws||{};return`<article class="home-source-card">
    <div class="home-source-head">
      <span class="home-source-icon">${g("layers",20)}</span>
      <div>
        <strong>${r(o.label||"\u5168\u570B\u6CD5\u898F\u8CC7\u6599\u5EAB")}</strong>
        <small>\u6CD5\u898F\u3001\u547D\u4EE4\u8207\u689D\u6587\u7248\u672C</small>
      </div>
      <a class="home-source-link" href="${r(o.url||"https://law.moj.gov.tw/")}" target="_blank" rel="noopener noreferrer">${g("external",12)}\u4F86\u6E90</a>
    </div>
    <p class="home-source-copy">\u4EE5\u5B98\u65B9 JSON \u7AEF\u9EDE\u4E0B\u8F09\u73FE\u884C\u6CD5\u898F\u8207\u547D\u4EE4\uFF0C\u4FDD\u7559\u7248\u672C\u3001\u689D\u6587\u8207\u8B8A\u66F4\u4E8B\u4EF6\uFF1B\u5224\u6C7A\u5F15\u7528\u53EF\u56DE\u5230\u5C0D\u61C9\u689D\u865F\u3002</p>
    <dl class="home-source-facts">
      <div><dt>\u6CD5\u898F</dt><dd>${d(s.law_count)}</dd></div>
      <div><dt>\u547D\u4EE4</dt><dd>${d(s.order_count)}</dd></div>
      <div><dt>\u689D\u6587</dt><dd>${d(s.article_count)}</dd></div>
      <div><dt>\u8CC7\u6599\u7248\u672C</dt><dd>${d(s.version_count)}</dd></div>
    </dl>
    <div class="home-source-flow"><span>ZIP</span>${g("arrowRight",11)}<span>Parquet</span>${g("arrowRight",11)}<span>PostgreSQL</span>${g("arrowRight",11)}<span>Qdrant</span></div>
  </article>`}function En(e,{loading:t=!1,error:s=""}={}){if(t)return'<div class="home-laws-loading skeleton skeleton-card"></div>';if(s)return`<div class="home-laws-error" role="status">${g("alert",16)}<span>${r(s)}</span></div>`;let a=e?.financial_laws||{},n=Array.isArray(a.laws)?a.laws:[],i=Number(a.count)||n.length,o=Math.ceil(i/Mn)||0,l=String(a.source_sha256||""),m=l?`${l.slice(0,12)}\u2026`:"\u2014",f=a.modified_at?Et(a.modified_at):"\u2014";return`<details class="home-laws" id="home-laws">
    <summary class="home-laws-summary">
      <span class="home-laws-count">${d(i)}</span>
      <span class="home-laws-title">
        <strong>\u91D1\u878D\u6CD5\u898F\u6E05\u55AE</strong>
        <small>${r(a.source_path||"documents/\u91D1\u878D\u6CD5\u898F.md")} \xB7 ${Mn} \u6B04 \xD7 ${o} \u5217</small>
      </span>
      <span class="home-laws-toggle">
        <span>\u5C55\u958B\u6E05\u55AE</span>${g("chevronDown",14)}
      </span>
    </summary>
    <div class="home-laws-body">
      <div class="home-laws-toolbar">
        <span>\u4F86\u6E90 ${r(a.source_path||"documents/\u91D1\u878D\u6CD5\u898F.md")} \xB7 SHA-256 <span class="mono">${r(m)}</span> \xB7 \u4FEE\u6539 ${r(f)}</span>
        <button class="btn btn-secondary btn-sm" type="button" id="home-laws-download">
          ${g("download",13)}<span>\u4E0B\u8F09\u6E05\u55AE</span>
        </button>
      </div>
      ${n.length?`<div class="home-laws-grid" style="--home-law-columns:${Mn}" role="list">
              ${n.map((p,$)=>`<span class="home-law" role="listitem" title="${r(p)}">
                    <span class="home-law-index">${String($+1).padStart(2,"0")}</span>
                    <span class="home-law-name">${r(p)}</span>
                  </span>`).join("")}
            </div>`:'<p class="home-laws-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u6CD5\u898F\u540D\u7A31\u3002</p>'}
    </div>
  </details>`}function Rn(e,{loading:t=!1,error:s=""}={}){if(t)return`<div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>`;if(s)return`<div class="home-rag-error">${g("alert",16)}<span>${r(s)}</span></div>`;let a=e?.rag||{},n=a.judgment_index||{},i=a.legal_index||{},o=a.models||{},l=Number(n.coverage_pct),m=Number.isFinite(l)?Math.max(0,Math.min(100,l)):0;return`<article class="home-rag-card">
      <span class="home-rag-kicker">JUDGMENT RETRIEVAL</span>
      <strong class="home-rag-value mono">${d(n.indexed)}<small> / ${d(n.total)}</small></strong>
      <span class="home-rag-label">\u5DF2\u7D22\u5F15 / \u91D1\u878D\u5224\u6C7A</span>
      <span class="home-rag-progress" role="img" aria-label="\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u8986\u84CB ${r(js(n.coverage_pct))}"><span style="width:${m.toFixed(1)}%"></span></span>
      <span class="home-rag-meta">${r(js(n.coverage_pct))} \xB7 ${r(n.model||"\u2014")} \xB7 ${r(n.alias||"\u2014")} \u2192 ${r(n.collection||"\u2014")}</span>
      <a class="home-rag-link" href="#/rag">\u958B\u59CB\u63D0\u554F ${g("arrowRight",12)}</a>
    </article>
    <article class="home-rag-card">
      <span class="home-rag-kicker">LEGAL GROUNDING</span>
      <strong class="home-rag-value mono">${d(i.points_count)}<small> \u689D\u6587</small></strong>
      <span class="home-rag-label">\u6CD5\u898F\uFF0F\u547D\u4EE4\u5411\u91CF\u7D22\u5F15</span>
      <span class="home-rag-progress" role="img" aria-label="\u6CD5\u898F\u547D\u4EE4\u7D22\u5F15 ${d(i.points_count)} \u689D\u6587"><span style="width:${Number(i.points_count)>0?"100":"0"}%"></span></span>
      <span class="home-rag-meta">${d(i.current_article_count??i.article_count)} \u73FE\u884C\u689D\u6587 \xB7 ${r(i.model||"\u2014")} \xB7 ${r(i.collection||"\u2014")}${i.version_id?` \xB7 v${i.version_id}`:""}</span>
      <a class="home-rag-link" href="#/data">\u67E5\u770B\u8CC7\u6599 ${g("arrowRight",12)}</a>
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
      <a class="home-rag-link" href="#/performance">\u67E5\u770B RAG Pipeline ${g("arrowRight",12)}</a>
    </article>`}function Ul(){return`<ol class="home-rag-flow" aria-label="RAG \u57F7\u884C\u6D41\u7A0B">
    ${[["01","\u554F\u984C","1\u2013500 \u5B57","message"],["02","Embedding","bge-m3","brain"],["03","\u6AA2\u7D22","\u5224\u6C7A + \u6CD5\u898F\uFF0F\u547D\u4EE4","database"],["04","Rerank","cross-encoder","sliders"],["05","LLM","\u4F9D\u6AA2\u7D22\u5167\u5BB9\u56DE\u7B54","sparkles"],["06","\u5F15\u7528","[n] \u2192 \u539F\u59CB\u4F86\u6E90","link"]].map(([t,s,a,n])=>`<li class="home-rag-step">
          <span class="home-rag-step-icon">${g(n,17)}</span>
          <span class="home-rag-step-copy">
            <small>${t}</small>
            <strong>${r(s)}</strong>
            <span>${r(a)}</span>
          </span>
        </li>`).join("")}
  </ol>`}function Ql(){return`<div class="home-trace">
    <div class="home-trace-row">
      <span class="home-trace-label">\u5224\u6C7A\u5F15\u7528</span>
      <span class="home-trace-path">
        <span class="home-trace-node">\u56DE\u7B54 [n]</span>${g("arrowRight",11)}
        <span class="home-trace-node">\u6848\u865F \xB7 \u6CD5\u9662 \xB7 \u65E5\u671F</span>${g("arrowRight",11)}
        <span class="home-trace-node">PDF / \u539F\u59CB Parquet \u5168\u6587</span>${g("arrowRight",11)}
        <a class="home-trace-node is-link" href="#/data">PostgreSQL</a>
      </span>
    </div>
    <div class="home-trace-row">
      <span class="home-trace-label">\u6CD5\u898F\u5F15\u7528</span>
      <span class="home-trace-path">
        <span class="home-trace-node">\u56DE\u7B54 [n]</span>${g("arrowRight",11)}
        <span class="home-trace-node">\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 \u689D\u865F</span>${g("arrowRight",11)}
        <a class="home-trace-node is-link" href="#/data">\u689D\u6587\u7248\u672C\u8207\u4F86\u6E90</a>${g("arrowRight",11)}
        <a class="home-trace-node is-link" href="https://law.moj.gov.tw/" target="_blank" rel="noopener noreferrer">\u5168\u570B\u6CD5\u898F\u8CC7\u6599\u5EAB ${g("external",10)}</a>
      </span>
    </div>
    <p class="home-trace-note">RAG \u53EA\u6839\u64DA\u5BE6\u969B\u6AA2\u7D22\u5230\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u8207\u5224\u6C7A\u7247\u6BB5\u751F\u6210\u56DE\u7B54\uFF1B\u6C92\u6709\u6709\u6548\u4F86\u6E90\u6642\u986F\u793A\u6AA2\u7D22\u7D50\u679C\uFF0C\u4E0D\u4EE5\u63A8\u6E2C\u88DC\u9F4A\u3002</p>
  </div>`}function Ln(e){return e==="failed"?"\u5931\u6557":e==="skipped"?"\u7565\u904E":e==="running"?"\u57F7\u884C\u4E2D":e==="pending"?"\u7B49\u5F85":"\u5B8C\u6210"}function Jl(e,t,s,a,n,i){let o=String(e.status||"success"),l=o==="skipped"||o==="pending",m=Math.max(0,Number(e.duration_ms)||0),f=l?"\u2014":de(m),p=o==="failed"?"var(--danger)":e.color||"#64748b",$=[`is-${o}`,o==="failed"?"is-error":"",l?"is-missing":"",i&&e.key===i?"is-slowest":""].filter(Boolean).join(" "),b=String(e.key||`stage-${t}`),u=[["\u72C0\u614B",Ln(o),!0],["\u958B\u59CB",e.started_at?$e(e.started_at):"\u2014",!0],["\u7D50\u675F",e.finished_at?$e(e.finished_at):"\u2014",!0],["\u8017\u6642",f,!0],["\u5360\u6574\u9AD4",js(n),!0],["\u8AAA\u660E",e.message||e.caption||"",!1]].map(([w,_,L])=>L||_?`<span class="rag-wf-detail"><span>${r(w)}</span><strong>${r(String(_||"\u2014"))}</strong></span>`:"").join(""),h=l?"":`<span class="rag-wf-bar is-sequential" style="left:${s.toFixed(3)}%;width:${a.toFixed(4)}%;top:0;height:12px;--bar-color:${r(p)}" aria-hidden="true"></span>`;return`<details class="rag-wf-stage home-wf-stage ${$}${ka.has(b)?" is-open":""}" data-home-wf-stage="${r(b)}"${ka.has(b)?" open":""} style="--stage-color:${r(e.color||"#64748b")}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong><span class="home-wf-step">${String(t+1).padStart(2,"0")}</span> ${r(e.label||e.key||"\u968E\u6BB5")}${i&&e.key===i?' <span class="home-wf-slow">\u6700\u6162</span>':""}</strong>${e.caption?`<small>${r(e.caption)}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${r(f)} \xB7 ${r(Ln(o))} <span class="rag-wf-chevron">${g("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${e.label||e.key}\uFF1A${Ln(o)}\uFF0C\u8017\u6642 ${f}\uFF0C\u5360\u6574\u9AD4 ${js(n)}`)}">${h}</span>
    </summary>
    <div class="rag-wf-details">${u}</div>
  </details>`}function Cn(e,{loading:t=!1,error:s="",clientMs:a=null}={}){if(t)return`<div class="report-card home-wf-loading" aria-live="polite">
      <div class="side-card-head index-runtime-head">
        <span class="side-card-title">${g("activity",14)}\u9996\u9801\u5373\u6642\u8CC7\u6599\u8F09\u5165 Pipeline</span>
        <span class="home-wf-loading-label">\u91CF\u6E2C\u4E2D\u2026</span>
      </div>
      <div class="home-wf-loading-body">
        <span class="skeleton skeleton-line"></span>
        <span class="skeleton skeleton-line"></span>
        <span class="skeleton skeleton-line"></span>
      </div>
    </div>`;if(s)return`<div class="report-card home-wf-error" role="status">
      <div class="side-card-head index-runtime-head">
        <span class="side-card-title">${g("activity",14)}\u9996\u9801\u5373\u6642\u8CC7\u6599\u8F09\u5165 Pipeline</span>
      </div>
      <div class="home-wf-error-body">${g("alert",16)}<span>${r(s)}</span></div>
    </div>`;let n=e?.pipeline,i=Array.isArray(n?.stages)?n.stages:[];if(!n||!i.length)return`<div class="report-card home-wf-error">
      <div class="side-card-head index-runtime-head">
        <span class="side-card-title">${g("activity",14)}\u9996\u9801\u5373\u6642\u8CC7\u6599\u8F09\u5165 Pipeline</span>
      </div>
      <div class="home-wf-error-body">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u968E\u6BB5\u8A08\u6642\u3002</div>
    </div>`;let o=Math.max(0,Number(n.total_ms)||i.reduce((S,x)=>S+(Number(x.duration_ms)||0),0)),l=Math.max(0,Number(a)||0),m=Math.max(0,l-o),f=Math.max(o,i.reduce((S,x)=>S+(Number(x.duration_ms)||0),0),1),p=i.reduce((S,x)=>(Number(x.duration_ms)||0)>(Number(S?.duration_ms)||0)?x:S,i[0]),$=1.25,b=i.map(S=>String(S.status||"success")==="skipped"?0:Math.max((Number(S.duration_ms)||0)/f*100,$)),u=b.reduce((S,x)=>S+x,0),h=u>100?100/u:1,w=0,_=i.map((S,x)=>{let O=["skipped","pending"].includes(String(S.status||"success")),ie=O?0:b[x]*h,J=w;O||(w+=ie);let he=f>0?(Number(S.duration_ms)||0)/f*100:0;return Jl(S,x,J,ie,he,p?.key)}).join(""),L=i.filter(S=>S.status==="failed").length;return`<section class="report-card status-wf-card home-wf-card" data-home-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${g("activity",14)}\u9996\u9801\u5373\u6642\u8CC7\u6599\u8F09\u5165 Pipeline</span>
      <span class="home-wf-links">
        <a class="home-wf-link" href="#/status">\u5B8C\u6574\u670D\u52D9 Pipeline ${g("arrowRight",11)}</a>
        <a class="home-wf-link" href="#/performance">RAG Flow ${g("arrowRight",11)}</a>
      </span>
    </div>
    <div class="index-runtime-metrics home-wf-metrics">
      <span class="index-runtime-metric" title="\u5F8C\u7AEF /api/home \u5F9E\u7B2C\u4E00\u500B\u67E5\u8A62\u5230\u56DE\u61C9\u7D44\u88DD\u5B8C\u6210\u7684\u968E\u6BB5\u7E3D\u8017\u6642\u3002"><span>\u968E\u6BB5\u7E3D\u8017\u6642</span><strong>${r(de(o))}</strong></span>
      <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u5F9E\u9001\u51FA\u8ACB\u6C42\u5230\u6536\u5230\u56DE\u61C9\u7684\u5BE6\u969B\u5F80\u8FD4\u6642\u9593\u3002"><span>HTTP \u5F80\u8FD4</span><strong>${r(l?de(l):"\u2014")}</strong></span>
      <span class="index-runtime-metric" title="HTTP \u5F80\u8FD4\u6263\u6389\u5F8C\u7AEF\u968E\u6BB5\u7E3D\u8017\u6642\u5F8C\u7684\u50B3\u8F38\u8207\u6392\u968A\u6642\u9593\u3002"><span>\u50B3\u8F38\uFF0F\u6392\u968A</span><strong>${r(l?de(m):"\u2014")}</strong></span>
      <span class="index-runtime-metric" title="\u672C\u6B21\u8F09\u5165\u8017\u6642\u6700\u9577\u7684\u968E\u6BB5\uFF0C\u4E5F\u5C31\u662F\u76EE\u524D\u6700\u660E\u986F\u7684\u74F6\u9838\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${p?.label||"\u2014"} \xB7 ${de(p?.duration_ms||0)}`)}</strong></span>
      <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${d(i.length-L)} / ${d(i.length)}${L?` \xB7 \u5931\u6557 ${d(L)}`:""}</strong></span>
      <span class="index-runtime-metric" title="\u672C\u6B21\u6458\u8981\u7684\u7522\u751F\u6642\u9593\u3002"><span>\u66F4\u65B0\u6642\u9593</span><strong>${r(n.finished_at?$e(n.finished_at):"\u2014")}</strong></span>
    </div>
    <div class="status-wf-chart">
      <div class="rag-wf-axis"><span>0 ms</span><span>${r(de(o))}</span></div>
      <div class="rag-wf-stages">${_}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u5BE6\u969B\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0Cbar \u9577\u5EA6\u70BA\u8A72\u968E\u6BB5\u8017\u6642\u5360\u6BD4\uFF1B\u6A19\u793A\u300C\u6700\u6162\u300D\u7684\u968E\u6BB5\u5373\u672C\u6B21\u8F09\u5165\u74F6\u9838\u3002\u9EDE\u64CA\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u3001\u5360\u6BD4\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function Vl(e){return`<div class="home-source-error">${g("alert",16)}<span>${r(e)}</span></div>`}function Wl(){let e=Hl.map(zl).join("");return`<section class="page home-page" id="home-page">
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
              ${g("sparkles",16)}<span>\u958B\u59CB\u6AA2\u7D22</span>
            </button>
          </div>
          <div class="home-ask-help" id="home-ask-help">
            <span><kbd>Enter</kbd> \u9001\u51FA</span>
            <span><kbd>Shift</kbd> + <kbd>Enter</kbd> \u63DB\u884C</span>
            <span>\u9001\u51FA\u5F8C\u5728 RAG \u63D0\u554F\u4E2D\u958B\u555F</span>
          </div>
        </form>
        <div class="home-hero-meta">
          <span>${g("shield",13)}\u5F15\u7528\u53EF\u8FFD\u6EAF</span>
          <span>${g("database",13)}\u6CD5\u898F\uFF0B\u547D\u4EE4\uFF0B\u5224\u6C7A</span>
          <span>${g("activity",13)}Pipeline waterfall</span>
        </div>
      </div>
      <aside class="home-live-card" id="home-live-card" aria-label="\u5373\u6642\u8CC7\u6599\u6458\u8981">
        <div class="home-live-head">
          <span class="home-live-kicker">LIVE DATASET</span>
          <button class="home-live-refresh" type="button" id="home-refresh" aria-label="\u91CD\u65B0\u6574\u7406\u9996\u9801\u5373\u6642\u8CC7\u6599">
            ${g("refresh",14)}
          </button>
        </div>
        <div id="home-live-body" aria-live="polite">${xa(null,{loading:!0})}</div>
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
          ${Vt(null,{loading:!0})}
        </div>
        <div class="home-metric-group" id="home-law-metrics">
          ${Tn(null,{loading:!0})}
        </div>
      </div>
      <div class="home-metric-strip" id="home-metric-strip">
        ${Nn(null,{loading:!0})}
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
      ${Ul()}
      <div class="home-rag-values" id="home-rag-values">
        ${Rn(null,{loading:!0})}
      </div>
      ${Ql()}
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
        ${Sa("opendata",null)}
        ${Sa("laws",null)}
      </div>
      <div id="home-laws-slot">
        ${En(null,{loading:!0})}
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
        ${Cn(null,{loading:!0})}
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
        <span class="home-trust-icon">${g("shield",18)}</span>
        <strong>\u4F86\u6E90\u512A\u5148</strong>
        <p>\u56DE\u7B54\u53EA\u6839\u64DA\u6AA2\u7D22\u5230\u7684\u6CD5\u898F\u3001\u547D\u4EE4\u8207\u5224\u6C7A\u7247\u6BB5\u751F\u6210\uFF0C\u5F15\u7528\u7DE8\u865F\u53EF\u56DE\u5230\u539F\u59CB\u8CC7\u6599\u3002</p>
      </div>
      <div class="home-trust-item">
        <span class="home-trust-icon">${g("server",18)}</span>
        <strong>\u672C\u6A5F\u6A21\u578B</strong>
        <p>\u900F\u904E llama-server \u4F7F\u7528\u672C\u6A5F\u6216\u5340\u7DB2\u6A21\u578B\uFF0C\u6A21\u578B\u8207\u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u90FD\u53EF\u8ABF\u6574\u3002</p>
      </div>
      <div class="home-trust-item">
        <span class="home-trust-icon">${g("layers",18)}</span>
        <strong>\u7248\u672C\u53EF\u8FFD\u6EAF</strong>
        <p>\u6CD5\u898F\u3001\u5224\u6C7A\u8207\u5411\u91CF\u7D22\u5F15\u4FDD\u7559\u7248\u672C\u8207\u66F4\u65B0\u7D00\u9304\uFF0C\u8CC7\u6599\u8B8A\u66F4\u4E0D\u6703\u9ED8\u9ED8\u6D88\u5931\u3002</p>
      </div>
    </section>
  </section>`}function Kl(e,t){let s=t?.laws||{},a=t?.judgments||{},n=t?.raw||{},i=t?.rag?.judgment_index||{},o={rag:`${d(i.indexed)} \u7B46\u7D22\u5F15`,data:`${d(s.law_count)} \u6CD5\u898F \xB7 ${d(s.order_count)} \u547D\u4EE4`,quality:`${d(n.raw_total)} \u539F\u59CB\u5224\u6C7A`,processing:`${d(n.archive_count)} archive`,performance:"Flow \xB7 Waterfall",status:"10 \u670D\u52D9\u5143\u4EF6",tests:"LLM \xB7 Reranker"};e.querySelectorAll("[data-home-tile-metric]").forEach(l=>{let m=l.dataset.homeTileMetric;m&&o[m]&&(l.textContent=o[m])})}function Yl(e,t,{clientMs:s=null}={}){let a=t?.data||{},n=t?.generated_at||"",i=e.querySelector("#home-live-body");i&&(i.innerHTML=xa(a,{generatedAt:n}));let o=e.querySelector("#home-judgment-stats"),l=a.judgments||{};o&&(o.innerHTML=Vt({judgment_total:l.raw_total,financial_total:l.financial_total,financial_ratio:l.financial_ratio}));let m=e.querySelector("#home-law-metrics");m&&(m.innerHTML=Tn(a));let f=e.querySelector("#home-metric-strip");f&&(f.innerHTML=Nn(a));let p=e.querySelector("#home-rag-values");p&&(p.innerHTML=Rn(a));let $=e.querySelector("#home-source-grid");$&&($.innerHTML=`${Sa("opendata",a)}${Sa("laws",a)}`);let b=e.querySelector("#home-laws-slot");if(b){let w=!!b.querySelector("#home-laws")?.open;b.innerHTML=En(a);let _=b.querySelector("#home-laws");_&&w&&(_.open=!0)}let u=e.querySelector("#home-waterfall-slot");u&&(u.innerHTML=Cn({...a,pipeline:t?.pipeline},{clientMs:s})),Kl(e,a)}function Xl(e,t){let s=e.querySelector("#home-live-body");s&&(s.innerHTML=xa(null,{error:t}));let a=e.querySelector("#home-judgment-stats");a&&(a.innerHTML=Vt(null));let n=e.querySelector("#home-law-metrics");n&&(n.innerHTML=Tn(null));let i=e.querySelector("#home-metric-strip");i&&(i.innerHTML=Nn(null));let o=e.querySelector("#home-rag-values");o&&(o.innerHTML=Rn(null,{error:t}));let l=e.querySelector("#home-source-grid");l&&(l.innerHTML=Vl(t));let m=e.querySelector("#home-laws-slot");m&&(m.innerHTML=En(null,{error:t}));let f=e.querySelector("#home-waterfall-slot");f&&(f.innerHTML=Cn(null,{error:t}))}async function Zl(e,t){let s=!1,a=!1,n=!1,i=null,o=null,l=null,m=null,f=0;e.innerHTML=Wl();let p=e.querySelector("#home-ask-form"),$=e.querySelector("#home-question"),b=e.querySelector("#home-refresh"),u=()=>{let S=String($?.value||"").trim().slice(0,500);if(!S){$?.focus();return}try{window.sessionStorage.setItem("judgment.pending_question",S)}catch{}window.__judgmentPendingQuestion=S,t&&typeof t.navigate=="function"?t.navigate("rag"):window.location.hash="#/rag"},h=()=>{$&&($.style.height="auto",$.style.height=`${Math.min($.scrollHeight,140)}px`)},w=S=>{b&&(b.disabled=S,b.classList.toggle("is-loading",S),b.setAttribute("aria-busy",S?"true":"false"))},_=async({quiet:S=!1}={})=>{if(s)return;if(a){n=!0;return}if(a=!0,f=Date.now(),w(!0),!S){let O=e.querySelector("#home-live-body");O&&(O.innerHTML=xa(null,{loading:!0}))}let x=performance.now();try{let O=await V.homeSummary();if(s||!e.isConnected)return;o=O?.data||null,l=O?.data?.financial_laws||null,Yl(e,O,{clientMs:Math.round(performance.now()-x)})}catch(O){if(s||!e.isConnected)return;Xl(e,O.message||"\u7121\u6CD5\u53D6\u5F97\u9996\u9801\u5373\u6642\u8CC7\u6599\u3002")}finally{a=!1,w(!1),n&&!s&&(n=!1,_({quiet:!0}))}};$?.addEventListener("input",h),p?.addEventListener("submit",S=>{S.preventDefault(),u()}),$?.addEventListener("keydown",S=>{S.key==="Enter"&&!S.shiftKey&&!S.isComposing&&(S.preventDefault(),u())});let L=()=>{if(s||m)return;let S=Math.max(0,Ol-(Date.now()-f));if(S===0){_({quiet:!0});return}m=window.setTimeout(()=>{m=null,s||_({quiet:!0})},S)};if(e.addEventListener("click",S=>{if(S.target.closest("#home-refresh")||S.target.closest("#home-retry")){m&&(window.clearTimeout(m),m=null),_();return}if(S.target.closest("#home-laws-download")){let x=l?.content||`${(l?.laws||[]).join(`
`)}
`;x.trim()&&Ct("\u91D1\u878D\u6CD5\u898F.md",x)}}),e.addEventListener("toggle",S=>{let x=S.target.closest?.("[data-home-wf-stage]");if(!x||!e.contains(x))return;let O=x.dataset.homeWfStage||"";O&&(x.open?ka.add(O):ka.delete(O))},!0),h(),$?.focus({preventScroll:!0}),await _(),!s)try{i=mt("processing",(S,x)=>{s||x?.initial||L()},{onError:()=>{}})}catch{i=null}return()=>{s=!0,m&&(window.clearTimeout(m),m=null),typeof i=="function"&&i(),i=null}}var sr={};rs(sr,{render:()=>Od});var li="judgment-console";var lt="query_history",Ot="settings",Ht="audit_events";var Xe={history:[],settings:new Map,audit:[],nextId:1},Aa=null,nt=!("indexedDB"in window);function St(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function _t(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function xt(){return Aa||(Aa=new Promise((e,t)=>{if(!("indexedDB"in window)){nt=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(li,2)}catch(a){nt=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(lt)){let n=a.createObjectStore(lt,{keyPath:"id",autoIncrement:!0});n.createIndex("created_at","created_at"),n.createIndex("kind","kind")}if(a.objectStoreNames.contains(Ot)||a.createObjectStore(Ot,{keyPath:"key"}),!a.objectStoreNames.contains(Ht)){let n=a.createObjectStore(Ht,{keyPath:"key"});n.createIndex("created_at","created_at"),n.createIndex("dataset","dataset"),n.createIndex("jid","jid"),n.createIndex("issue_month","issue_month")}},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{nt=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{nt=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),Aa)}function ci(){return"indexedDB"in window}function di(){return nt}function Vs(){return nt?"memory":"indexeddb"}function ec(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},turns:Array.isArray(e.turns)?e.turns:[],pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t,updated_at:e.updated_at||t}}async function tc(){try{let t=(await xt()).transaction(lt,"readwrite"),s=t.objectStore(lt),a=await St(s.count());if(a>120){let n=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let m=i.result;if(!m||n<=0){o();return}m.delete(),n-=1,m.continue()},i.onerror=()=>l(i.error)})}await _t(t)}catch{nt=!0}}async function Ws(e){let t=ec(e);try{let a=(await xt()).transaction(lt,"readwrite"),n=a.objectStore(lt),i=await St(n.add(t));return await _t(a),await tc(),i}catch{nt=!0;let a=Xe.nextId++;return Xe.history.push({id:a,...t}),Xe.history.length>120&&Xe.history.shift(),a}}async function Ks(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let n=(await xt()).transaction(lt,"readwrite"),i=n.objectStore(lt),o=await St(i.get(s));if(!o)return await _t(n),null;let l={...o,...t,id:s};return await St(i.put(l)),await _t(n),l}catch{nt=!0;let n=Xe.history.findIndex(i=>Number(i.id)===s);return n===-1?null:(Xe.history[n]={...Xe.history[n],...t,id:s},Xe.history[n])}}async function ui(e){let t=Number(e);if(!Number.isFinite(t))return!1;try{let a=(await xt()).transaction(lt,"readwrite");return a.objectStore(lt).delete(t),await _t(a),!0}catch{nt=!0;let a=Xe.history.findIndex(n=>Number(n.id)===t);return a===-1?!1:(Xe.history.splice(a,1),!0)}}async function qa({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let n=(await xt()).transaction(lt,"readonly"),i=n.objectStore(lt),o=await St(i.getAll());return await _t(n),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,m)=>String(m.updated_at||m.created_at).localeCompare(String(l.updated_at||l.created_at))).slice(0,t)}catch{return nt=!0,Xe.history.filter(n=>s?`${n.kind} ${n.title} ${n.detail}`.toLowerCase().includes(s):!0).slice().sort((n,i)=>String(i.updated_at||i.created_at).localeCompare(String(n.updated_at||n.created_at))).slice(0,t)}}async function pi(){try{let t=(await xt()).transaction(lt,"readwrite");t.objectStore(lt).clear(),await _t(t)}catch{nt=!0}Xe.history=[]}function sc(e){let t=Number(e.id??e.event_id??0)||0,s=String(e.dataset||e.kind||"judgment"),a=String(e.key||`${s}:${t||`${Date.now()}:${Math.random().toString(36).slice(2)}`}`),n=String(e.jid||""),i=String(e.issue_month||""),o=String(e.change_type||""),l=String(e.detected_at||e.created_at||new Date().toISOString());return{key:a,event_id:t,dataset:s,jid:n,issue_month:i,change_type:o,title:String(e.title||n||i||"\u7248\u672C\u8B8A\u66F4"),detail:String(e.detail||[o,i,n].filter(Boolean).join(" \xB7 ")),created_at:l,payload:e}}async function ac(){try{let t=(await xt()).transaction(Ht,"readwrite"),s=t.objectStore(Ht),a=await St(s.count());if(a>2e3){let n=a-2e3,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let m=i.result;if(!m||n<=0){o();return}m.delete(),n-=1,m.continue()},i.onerror=()=>l(i.error)})}await _t(t)}catch{nt=!0}}async function mi(e){let t=(Array.isArray(e)?e:[]).filter(s=>s&&typeof s=="object").map(sc);if(!t.length)return 0;try{let a=(await xt()).transaction(Ht,"readwrite"),n=a.objectStore(Ht);for(let i of t)await St(n.put(i));return await _t(a),await ac(),t.length}catch{nt=!0;let a=new Map(Xe.audit.map(n=>[n.key,n]));for(let n of t)a.set(n.key,n);return Xe.audit=Array.from(a.values()).sort((n,i)=>String(i.created_at).localeCompare(String(n.created_at))).slice(0,2e3),t.length}}async function gi({keyword:e="",limit:t=200}={}){let s=e.trim().toLowerCase(),a=n=>s?`${n.dataset} ${n.jid} ${n.issue_month} ${n.change_type} ${n.detail}`.toLowerCase().includes(s):!0;try{let i=(await xt()).transaction(Ht,"readonly"),o=i.objectStore(Ht),l=await St(o.getAll());return await _t(i),l.filter(a).sort((m,f)=>String(f.created_at).localeCompare(String(m.created_at))).slice(0,t)}catch{return nt=!0,Xe.audit.filter(a).slice().sort((i,o)=>String(o.created_at).localeCompare(String(i.created_at))).slice(0,t)}}async function fi(){let e={name:li,version:2,supported:"indexedDB"in window,mode:Vs(),degraded:nt,stores:[lt,Ot,Ht],caps:{history:120,audit:2e3},usage_bytes:null,quota_bytes:null};if(typeof navigator<"u"&&navigator.storage?.estimate)try{let t=await navigator.storage.estimate();e.usage_bytes=Number.isFinite(t.usage)?t.usage:null,e.quota_bytes=Number.isFinite(t.quota)?t.quota:null}catch{}try{let s=(await xt()).transaction([lt,Ot,Ht],"readonly"),a=_t(s),[n,i,o]=await Promise.all([St(s.objectStore(lt).count()),St(s.objectStore(Ot).count()),St(s.objectStore(Ht).count()),a]);return{...e,available:!0,counts:{query_history:n,settings:i,audit_events:o},total:n+i+o}}catch{return nt=!0,{...e,available:!1,degraded:!0,mode:"memory",counts:{query_history:Xe.history.length,settings:Xe.settings.size,audit_events:Xe.audit.length},total:Xe.history.length+Xe.settings.size+Xe.audit.length}}}async function Ys(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let n=(await xt()).transaction(Ot,"readwrite");return n.objectStore(Ot).put(s),await _t(n),s}catch{return nt=!0,Xe.settings.set(s.key,s),s}}async function ds(e,t=null){try{let a=(await xt()).transaction(Ot,"readonly"),n=a.objectStore(Ot),i=await St(n.get(String(e)));return await _t(a),i?i.value:t}catch{nt=!0;let a=Xe.settings.get(String(e));return a?a.value:t}}async function bi({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await xt()).transaction(Ot,"readonly"),n=a.objectStore(Ot),i=await St(n.getAll());return await _t(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return nt=!0,Array.from(Xe.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function hi(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var Zn={};rs(Zn,{buildFlowWaterfallStages:()=>Oa,render:()=>hd,renderRagPipelineWaterfall:()=>Fa,renderTestFlowPanel:()=>Rs,renderWaterfallStages:()=>Es});var nc={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},rc=new Set(["running","stopping"]);function ja(e){let[t,s]=nc[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${r(t)}</span>`}function Ma(e){return String(e).padStart(2,"0")}function Ts(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${Ma(t.getMonth()+1)}-${Ma(t.getDate())} ${Ma(t.getHours())}:${Ma(t.getMinutes())}`}function La(e){return rc.has(e)}function Zt(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function hs(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function us(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${r(e)}</span>
    <strong>${r(String(t))}</strong>
    ${s?`<small>${r(s)}</small>`:""}
  </div>`}function vi(e={}){let t=e.score_components||e,s=e.gate||{},a=String(s.status||""),n=a==="pass"?"Gate \u901A\u904E":a==="fail"?"Gate \u5931\u6557":a==="no_data"?"Gate \u7121\u8CC7\u6599":"";return`${n?`<span class="badge ${a==="pass"?"badge-ok":a==="fail"?"badge-danger":"badge-neutral"}">${r(n)}</span>`:""}<div class="bench-metrics">
    ${us("Law Recall",hs(t.law_recall))}
    ${us("Article Recall",hs(t.article_recall))}
    ${us("Citation Valid",hs(t.citation_valid_rate))}
    ${us("Judge",Zt(t.judge_overall))}
    ${us("Human",Zt(t.human_overall))}
    ${us("p50",de(e.duration_p50_ms))}
    ${us("p95",de(e.duration_p95_ms))}
    ${us("Success",`${d(e.success||0)} / ${d(e.total||0)}`)}
  </div>`}function $i(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${r(s.replace(/^rag\./,""))}</span>
      <strong>${de(a.p50_ms)}</strong>
      <small>p95 ${de(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function yi(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${hs(s.law_recall)}</span>
    <span>Article ${hs(s.article_recall)}</span>
    <span>Judge ${Zt(s.judge_overall)}</span>
    <span>p95 ${de(t.duration_p95_ms)}</span>`}function wi(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function _i(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${r(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${r(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${r(e.status||"")}">${ja(e.status)}</span>
      <span class="mono">${r(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${r($e(e.started_at))}</span>
      <span data-bench-slot="run-completed">${d(e.completed_cases||0)} / ${d(e.total_cases||0)} \u984C</span>
      <span>${r(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${r(wi(e))}">${yi(e)}</span>
  </button>`}function Dn(e,t=[]){let s=e.metrics||{},a=e.judge||{},n=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([f])=>f.startsWith("rag.")).map(([f,p])=>`<span class="chip">${r(f)} ${de(p)}</span>`).join(""),m=(e.law_sources||[]).map(f=>`<span class="chip">${r(f.law_name||"\u6CD5\u898F")} ${d((f.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${r(e.question)}</span>
      ${ja(e.status)}
      <span class="bench-case-time">${de(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${Zt(i.deterministic)} \xB7 Judge ${Zt(i.judge)} \xB7 Human ${Zt(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${r((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${r(e.fingerprint||"")}">${g("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
      </div>
      <div class="bench-case-stages">${l||'<span class="qb-muted">\u6C92\u6709 stage timing</span>'}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${hs(s.law_recall)}</span>
        <span>Article recall ${hs(s.article_recall)}</span>
        <span>Citation ${s.citation_valid?"valid":"invalid"}</span>
        <span>Refusal ${s.refusal_correct===null?"\u2014":s.refusal_correct?"correct":"wrong"}</span>
      </div>
      <div class="chips">${m||'<span class="qb-muted">\u6C92\u6709\u6CD5\u898F\u4F86\u6E90</span>'}</div>
      <div class="bench-answer"><strong>\u56DE\u7B54</strong><p>${r(e.answer||"\u2014")}</p></div>
      <div class="bench-judge"><strong>LLM judge</strong><p>${r(a.rationale||a.reason||"\u2014")}</p><span>${[["correctness",a.correctness],["grounding",a.grounding],["citation",a.citation],["clarity",a.clarity],["overall",a.overall]].map(([f,p])=>`${f} ${p??"\u2014"}`).join(" \xB7 ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${e.id}">
        <div class="bench-human-grid">
          ${[["correctness","\u6B63\u78BA\u6027",n.scores?.correctness??4],["grounding","\u6709\u64DA\u6027",n.scores?.grounding??4],["citation","\u5F15\u7528",n.scores?.citation??4],["clarity","\u6E05\u695A",n.scores?.clarity??4],["overall","\u6574\u9AD4",n.overall??4]].map(([f,p,$])=>`<label class="field"><span class="field-label">${p} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${f}" value="${r(String($))}" /></label>`).join("")}
        </div>
        <label class="field"><span class="field-label">\u4EBA\u5DE5\u6279\u6CE8</span><input class="input" name="comment" value="${r(n.comment||"")}" placeholder="\u56DE\u7B54\u54C1\u8CEA\u3001\u5F15\u7528\u6216\u4E8B\u5BE6\u932F\u8AA4" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${g("check",13)}<span>\u5132\u5B58\u4EBA\u5DE5\u8A55\u5206</span></button>
      </form>
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(f=>`<div class="bench-history-row"><span>${r($e(f.run?.started_at))}</span><span>${r(f.run?.config?.llm_model||"\u2014")}</span><span>Det ${Zt(f.metrics?.scores?.deterministic)}</span><span>Judge ${Zt(f.metrics?.scores?.judge)}</span><span>Human ${Zt(f.metrics?.scores?.human)}</span><span>${de(f.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function In(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function ki(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${Dn(e,t)}
  </details>`}function Si(e){return`${ja(e.status)}
    <span class="mono">${r(e.run_id)}</span>
    ${La(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${g("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function ic(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${r(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${g("activity",14)}${r(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${r((e.status||"")+":"+e.run_id)}">
        ${Si(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${vi(e.summary||{})}</div>
    <div data-bench-detail="stages">${$i(e.summary||{})}</div>
    <div class="bench-run-config">
      <span><strong>Suite</strong> v${e.suite_version} \xB7 ${d((e.suite_snapshot?.items||[]).length)} \u984C</span>
      <span><strong>Embedding</strong> ${r(e.config?.embedding_model||"\u2014")}</span>
      <span><strong>LLM</strong> ${r(e.config?.llm_model||"\u2014")}</span>
      <span><strong>Judge</strong> ${r(e.config?.judge_model||"\u2014")}</span>
      <span><strong>Index</strong> ${r(e.index_version?.physical_collection||"\u2014")}</span>
      <span><strong>Top K</strong> ${r(String(e.config?.top_k??"\u2014"))}</span>
      <span><strong>Law retrieval</strong> ${e.config?.enable_law_retrieval?"on":"off"}</span>
      <span><strong>Config hash</strong> <span class="mono">${r((e.config_hash||"").slice(0,16))}</span></span>
    </div>
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>ki(a,t[a.fingerprint]||[])).join(""):Ee({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function xi(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${g("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${g("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function Ai(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),n=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,n-i):0,l=(t||[]).filter(h=>["success","failed"].includes(h.status)).map(h=>Number(h.duration_ms)||0).filter(h=>h>0),m=null;if(l.length)m=l.reduce((h,w)=>h+w,0)/l.length;else if(a>0){let h=Date.parse(e.updated_at||""),w=Number.isFinite(h)?h:i;Number.isFinite(w)&&w>i?m=(w-i)/a:o>0&&(m=o/a)}let f=(t||[]).find(h=>h.status==="running")||null,p=0;if(a<s&&m&&m>0){let h=f?Date.parse(f.started_at||""):NaN,w=Date.parse(e.updated_at||""),_=Number.isFinite(h)?h:w;Number.isFinite(_)&&(p=Math.max(0,Math.min(.95,(n-_)/m)))}let $=Math.min(s,a+p),b=s>0?Math.max(0,Math.min(100,$/s*100)):0,u=m===null?null:Math.max(0,s-$)*m;return{total:s,completed:a,elapsedMs:o,averageMs:m,progress:b,etaMs:u,ratePerMin:m?6e4/m:null,running:f}}function qi(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${de(e)}`}function Mi(e,t=[]){let s=Ai(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${r(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${d(s.completed)} / ${d(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${qi(s.etaMs)}</span>
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
  </div>`}function oc(e){let t=e.models?.models||{},s=e.suites||[],a=Xs(e),n=e.selectedRun;return`<section class="report-card bench-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("brain",14)}RAG Benchmark</span>
      <span class="badge ${e.indexVersion?.physical_collection?"badge-ok":"badge-warn"}">${r(e.indexVersion?.physical_collection||"\u7D22\u5F15\u672A\u8A2D\u5B9A")}</span>
    </div>
    <form class="bench-form" data-bench-form="run">
      <div class="bench-form-grid">
        <label class="field"><span class="field-label">Benchmark \u984C\u5EAB</span><select class="select" name="suite_id">${s.map(i=>`<option value="${i.id}" ${e.selectedSuiteId===i.id?"selected":""}>${r(i.name)} \xB7 ${d(i.item_count)} \u984C</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Embedding</span><select class="select" name="embedding_model">${(t.embedding||[]).map(i=>`<option value="${r(i)}" ${i===e.config.embedding_model?"selected":""}>${r(i)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">LLM</span><select class="select" name="llm_model">${(t.llm||[]).map(i=>`<option value="${r(i)}" ${i===e.config.llm_model?"selected":""}>${r(i)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Judge model</span><select class="select" name="judge_model"><option value="">\u4E0D\u57F7\u884C LLM judge</option>${(t.llm||[]).map(i=>`<option value="${r(i)}" ${i===e.config.judge_model?"selected":""}>${r(i)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Top K</span><input class="input" type="number" min="1" max="20" name="top_k" value="${r(String(e.config.top_k||4))}" /></label>
        <label class="field"><span class="field-label">Score threshold</span><input class="input" type="number" min="0" max="1" step="0.01" name="score_threshold" value="${r(String(e.config.score_threshold||.35))}" /></label>
        <label class="field"><span class="field-label">\u91CD\u8907\u6B21\u6578</span><input class="input" type="number" min="1" max="5" name="repeats" value="${r(String(e.config.repeats||1))}" /></label>
        <label class="checkbox-field bench-check"><input type="checkbox" name="enable_law_retrieval" ${e.config.enable_law_retrieval?"checked":""} /><span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22</span></label>
        <label class="checkbox-field bench-check"><input type="checkbox" name="judge_enabled" ${e.config.judge_enabled?"checked":""} /><span>LLM judge</span></label>
      </div>
      <label class="field"><span class="field-label">Run \u6A19\u7C64</span><input class="input" name="label" value="${r(e.config.label||Ts())}" /></label>
      <div class="qb-actions" data-bench-actions data-signature="${r(a?`${a.run_id}:${a.status}`:"")}">
        ${xi(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${r(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?Mi(a,Bn(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>_i(i,n?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${n?ic(n,e.history):""}
  </section>`}function Xs(e){let t=(e.runs||[]).find(s=>La(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!La(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function Bn(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function Li(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:Ts(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",refreshStream:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),n=j=>{let A=new FormData(j);return{label:String(A.get("label")||"").trim()||Ts(),embedding_model:String(A.get("embedding_model")||""),llm_model:String(A.get("llm_model")||""),judge_model:String(A.get("judge_model")||""),top_k:Number(A.get("top_k")||4),score_threshold:Number(A.get("score_threshold")||.35),repeats:Number(A.get("repeats")||1),enable_law_retrieval:j.elements.enable_law_retrieval?.checked??!0,judge_enabled:j.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(j=>`${j.id}:${j.name}:${j.item_count}:${j.version}:${j.status}`)]:null,runs:(s.runs||[]).map(j=>`${j.run_id}:${j.label||""}:${j.suite_version||1}`)}),o=()=>{let A=a()?.querySelector("[data-bench-live]"),E=Xs(s);if(!A||!E)return;let X=Ai(E,Bn(s,E)),W=(ge,F)=>{let fe=A.querySelector(`[data-bench-slot="${ge}"]`);fe&&fe.textContent!==F&&(fe.textContent=F)};W("progress-count",`${d(X.completed)} / ${d(X.total)} \u984C`),W("progress-percent",`${X.progress.toFixed(1)}%`),W("progress-eta",qi(X.etaMs)),W("progress-rate",X.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${X.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),W("progress-elapsed",`\u5DF2\u57F7\u884C ${de(X.elapsedMs)}`),W("progress-average",X.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${de(X.averageMs)}\uFF0F\u984C`),W("progress-state",E.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let B=A.querySelector('[data-bench-slot="progress-bar"]');B&&(B.setAttribute("aria-valuenow",X.progress.toFixed(1)),B.classList.toggle("is-waiting",X.completed===0));let le=A.querySelector('[data-bench-slot="progress-fill"]');le&&(le.style.width=`${X.progress.toFixed(2)}%`)},l=j=>{let A=j.querySelector("[data-bench-actions]");if(!A)return;let E=Xs(s),X=E?`${E.run_id}:${E.status}`:"";A.dataset.signature!==X&&(A.dataset.signature=X,A.innerHTML=xi(E))},m=j=>{let A=j.querySelector("[data-bench-live-wrap]");if(!A)return;let E=Xs(s),X=E?`${E.run_id}:${E.status}:${E.total_cases}`:"";A.dataset.signature!==X&&(A.dataset.signature=X,A.innerHTML=E?Mi(E,Bn(s,E)):"")},f=j=>{let A=j.querySelector("[data-bench-runs]");if(!A)return;let E=s.runs||[],X=[...A.querySelectorAll("[data-run-id]")].map(B=>B.dataset.runId),W=E.map(B=>B.run_id);if(X.join("|")!==W.join("|")){A.innerHTML=E.length?E.map(B=>_i(B,s.selectedRun?.run_id===B.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let B of E){let le=A.querySelector(`[data-run-id="${B.run_id}"]`);if(!le)continue;le.classList.toggle("is-active",s.selectedRun?.run_id===B.run_id);let ge=le.querySelector('[data-bench-slot="run-label"]');ge&&ge.textContent!==(B.label||"RAG Benchmark")&&(ge.textContent=B.label||"RAG Benchmark");let F=le.querySelector('[data-bench-slot="run-status"]');F&&F.dataset.status!==(B.status||"")&&(F.dataset.status=B.status||"",F.innerHTML=ja(B.status));let fe=le.querySelector('[data-bench-slot="run-completed"]');if(fe){let ve=`${d(B.completed_cases||0)} / ${d(B.total_cases||0)} \u984C`;fe.textContent!==ve&&(fe.textContent=ve)}let ee=le.querySelector('[data-bench-slot="run-scores"]'),xe=wi(B);ee&&ee.dataset.signature!==xe&&(ee.dataset.signature=xe,ee.innerHTML=yi(B))}},p=j=>{let A=s.selectedRun;if(!A)return;let E=j.querySelector(`.bench-detail[data-run-id="${A.run_id}"]`);if(!E)return;let X=E.querySelector("[data-bench-detail-actions]");if(X){let ee=`${A.status||""}:${A.run_id}`;X.dataset.signature!==ee&&(X.dataset.signature=ee,X.innerHTML=Si(A))}let W=E.querySelector('[data-bench-detail="metrics"]');if(W){let ee=JSON.stringify(A.summary||{});W.dataset.signature!==ee&&(W.dataset.signature=ee,W.innerHTML=vi(A.summary||{}))}let B=E.querySelector('[data-bench-detail="stages"]');if(B){let ee=JSON.stringify((A.summary||{}).stages||{});B.dataset.signature!==ee&&(B.dataset.signature=ee,B.innerHTML=$i(A.summary||{}))}let le=E.querySelector("[data-bench-cases]");if(!le)return;let ge=A.cases||[];if(!ge.length)return;let F=le.querySelector(".notice");F&&F.remove();let fe=new Map([...le.querySelectorAll("details.bench-case")].map(ee=>[Number(ee.dataset.resultId),ee]));for(let ee of ge){let xe=s.history[ee.fingerprint]||[],ve=In(ee,xe),ae=fe.get(Number(ee.id));if(!ae){le.insertAdjacentHTML("beforeend",ki(ee,xe)),ae=le.lastElementChild,ae&&(ae._benchSignature=ve);continue}if(ae._benchSignature===ve||!s.forcedCaseIds.delete(Number(ee.id))&&ae.contains(document.activeElement))continue;let pe=ae.open;ae.innerHTML=Dn(ee,xe),ae.open=pe,ae._benchSignature=ve}},$=()=>{Xs(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},b=()=>{let j=a();j&&(l(j),m(j),f(j),p(j),o(),$())},u=j=>{let A=s.selectedRun;if(!A)return;let E=j.querySelector('[data-bench-detail="metrics"]');E&&(E.dataset.signature=JSON.stringify(A.summary||{}));let X=j.querySelector('[data-bench-detail="stages"]');X&&(X.dataset.signature=JSON.stringify((A.summary||{}).stages||{}));let W=j.querySelector("[data-bench-cases]");if(!W)return;let B=new Map((A.cases||[]).map(le=>[Number(le.id),le]));for(let le of W.querySelectorAll("details.bench-case")){let ge=B.get(Number(le.dataset.resultId));ge&&(le._benchSignature=In(ge,s.history[ge.fingerprint]||[]))}},h=(j=!1)=>{let A=a();if(!A)return;let E=i();if(!j&&s.renderSignature===E){b();return}s.renderSignature=E,s.forcedCaseIds.clear(),A.innerHTML=oc(s),u(A),b()},w=async({refreshAll:j=!1,runs:A=null}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||j;return}s.loading=!0;try{if(!s.referenceLoaded||j){let[F,fe]=await Promise.all([V.benchmarkModels(),V.benchmarkSuites()]);s.models=F,s.suites=fe.suites||[],s.indexVersion=F.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=F.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=F.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(F.models?.llm||[]).find(ee=>ee!==s.config.llm_model)||"")}let E=A?{runs:A}:await V.benchmarkRuns(30);s.runs=E.runs||[];let X=s.activeRunId,W=s.runs.find(F=>La(F.status))||null;s.activeRunId=W?.run_id||"";let B=s.selectedRun?.run_id||"";B||(B=W?.run_id||s.runs[0]?.run_id||"");let le=!!(s.selectedRun&&X&&s.selectedRun.run_id===X);B&&(!s.selectedRun||s.selectedRun.run_id!==B||B===W?.run_id||le)?s.selectedRun=await V.benchmarkRun(B,!0):B||(s.selectedRun=null),s.loaded=!0,h()}catch(E){if(!s.loaded){s.renderSignature="";let X=a();X&&(X.innerHTML=Ee({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:r(E.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let E=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,w({refreshAll:E})}}},_=()=>{s.refreshStream||(s.refreshStream=mt("benchmark",(j,A)=>{s.loading||w({runs:A?.snapshot?.runs||null})}))},L=async j=>{try{s.selectedRun=await V.benchmarkRun(j,!0),h()}catch(A){D(A.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},S=async j=>{!s.labelTouched&&j.elements.label&&(j.elements.label.value=Ts());let A=n(j);s.config=A;let E=Number(j.elements.suite_id?.value||0);if(!E){D("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await V.startBenchmarkRun({suite_id:E,config:A,actor:"anonymous"}),D("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=Ts(),s.labelTouched=!1,await w()}catch(X){D(X.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},x=async j=>{try{await V.stopBenchmarkRun(j),D("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await w()}catch(A){D(A.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},O=async j=>{let A=Number(j.dataset.resultId||0),E=new FormData(j),X={};for(let W of["correctness","grounding","citation","clarity","overall"]){let B=Number(E.get(`score_${W}`));Number.isFinite(B)&&(X[W]=B)}try{await V.reviewBenchmarkResult(A,{reviewer:"anonymous",scores:X,comment:String(E.get("comment")||"")}),D("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await V.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(A)),h()}catch(W){D(W.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},ie=async j=>{if(j)try{let A=await V.benchmarkFingerprintHistory(j,50);s.history[j]=A.cases||[];let E=s.selectedRun,X=a();if(!E||!X)return;let W=(E.cases||[]).filter(B=>B.fingerprint===j);for(let B of W){let le=X.querySelector(`details.bench-case[data-result-id="${B.id}"]`);if(!le)continue;let ge=le.open;le.innerHTML=Dn(B,s.history[j]),le.open=ge,le._benchSignature=In(B,s.history[j])}}catch(A){D(A.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},J=async j=>{let A=j.target.closest("[data-bench-action]");if(!A)return;let E=A.dataset.benchAction;E==="open-run"?await L(A.dataset.runId||""):E==="stop"?await x(A.dataset.runId||""):E==="fingerprint-history"&&await ie(A.dataset.fingerprint||"")},he=async j=>{let A=j.target.closest("[data-bench-form]");A&&(j.preventDefault(),A.dataset.benchForm==="run"?await S(A):A.dataset.benchForm==="human"&&await O(A))},me=j=>{j&&(j.elements.label&&j.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=n(j),j.elements.suite_id&&(s.selectedSuiteId=Number(j.elements.suite_id.value)||s.selectedSuiteId))},Z=j=>{let A=j.target.closest('[data-bench-form="run"]');A&&me(A)};return e.addEventListener("click",J),e.addEventListener("submit",he),e.addEventListener("input",Z),e.addEventListener("change",Z),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=Ts();let j=a()?.querySelector('input[name="label"]');j&&(j.value=s.config.label)}_(),w({refreshAll:!s.referenceLoaded})},refresh(){return _(),w({refreshAll:!0})},destroy(){e.removeEventListener("click",J),e.removeEventListener("submit",he),e.removeEventListener("input",Z),e.removeEventListener("change",Z),s.refreshStream&&s.refreshStream(),s.refreshStream=null,s.tickTimer&&window.clearInterval(s.tickTimer)}}}var Jn={};rs(Jn,{exportCsv:()=>Pa,exportableResult:()=>Ia,render:()=>Gc,renderReport:()=>Ea,reportError:()=>Ca,reportLoading:()=>Zs});var Ii=[10,25,50,100],ji=500,lc=["law_name","law_level","law_category","law_modified_date","article_count"],cc=["jid","court_normalized","title","jdate","matched_laws","citation_count"],dc={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function Ra(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function Ta(e,t){let s={};for(let a of e.fields||[]){let n=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?n:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{},fuzzyTerms:[]}}function uc(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,n]of Object.entries(s))if(Array.isArray(n)&&!n.map(String).includes(String(t[a]??"")))return!1;return!0}function Qn(e,t){return(e.fields||[]).filter(s=>uc(s,t))}function pc(e,t){return`filter-${e.id}-${t}`}function vs(e){return e==null?"":r(String(e))}function Fn(e,t,s){let a=s[t.key],n=pc(e,t.key),i=t.help?`<span class="field-help">${r(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(m=>`<option value="${vs(m.value)}" ${String(m.value)===String(a??"")?"selected":""}>${r(m.label??m.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${n}" name="${r(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),m=(t.options||[]).map(f=>`<label class="multi-option">
          <input type="checkbox" name="${r(t.key)}" value="${vs(f.value)}" ${l.has(String(f.value))?"checked":""} />
          <span>${r(f.label??f.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${m}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${n}" name="${r(t.key)}"
        value="${vs(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${vs(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${n}" name="${r(t.key)}"
        value="${vs(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${n}" name="${r(t.key)}"
      value="${vs(a)}"
      placeholder="${vs(t.placeholder||"")}" />
    ${i}
  </div>`}function Ti(e,t,{focusTable:s=!1}={}){let a=Qn(e,t.values),n=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(n.push(`<div class="field-row">${Fn(e,o,t.values)}${Fn(e,l,t.values)}</div>`),i+=1):n.push(Fn(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
    <div class="filter-block">
      <div class="filter-head">
        <span class="filter-title">Metadata \u689D\u4EF6</span>
        <button class="filter-reset" type="button" data-action="reset">\u91CD\u8A2D</button>
      </div>
      <div class="filter-fields">${n.join("")}</div>
    </div>
    <div class="sidebar-actions">
      <button class="btn btn-primary" type="submit" id="run-query" ${s?'data-focus-table="true"':""}>
        ${g("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
      </button>
    </div>
  </form>`}function Na(e,t,s){let a={...s.values};for(let n of Qn(t,a))if(n.type==="checkbox"){let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=!!i?.checked}else if(n.type==="multiselect")a[n.key]=Array.from(e.querySelectorAll(`[name="${n.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=i?i.value:""}return a}function Di(e,t){let s={};for(let a of Qn(e,t.values)){let n=t.values[a.key];a.type==="checkbox"?s[a.key]=!!n:a.type==="multiselect"?s[a.key]=Array.isArray(n)?n:[]:a.type==="number"?s[a.key]=n===""||n===null?"":Number(n):s[a.key]=n??""}return s}function On(e,t){let s=Di(e,t);return Array.isArray(t.fuzzyTerms)&&t.fuzzyTerms.length&&(s.keywords=[...t.fuzzyTerms]),(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function mc(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${Ee({tone:t,title:`${Ra(e)} ${Rt(e.status).label}`,text:r(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function gc(e,t){return`<label class="field data-source-field">
    <span class="field-label">\u8CC7\u6599\u4F86\u6E90</span>
    <select class="select" name="database">
      ${e.map(s=>{let a=Rt(s.status);return`<option value="${r(s.id)}" ${s.id===t?"selected":""}>${r(s.label)} \xB7 ${r(a.label)}</option>`}).join("")}
    </select>
  </label>`}function Ni(e,t){return`<nav class="data-nav" aria-label="\u8CC7\u6599\u67E5\u8A62\u529F\u80FD">
    ${[{id:"law",label:"\u67E5\u8A62\u6CD5\u898F\u547D\u4EE4",hint:"Fuzzy \u6CD5\u898F\u540D\u7A31\u3001\u985E\u5225\u8207\u547D\u4EE4",icon:"file"},{id:"judgment",label:"\u67E5\u8A62\u5224\u6C7A",hint:"Fuzzy \u6CD5\u9662\u3001\u6848\u865F\u8207\u6848\u7531",icon:"layers"},{id:"schema",label:"\u8CC7\u6599\u5EAB Schema",hint:"\u8CC7\u6599\u8868\u3001\u6B04\u4F4D\u8207\u9810\u89BD",icon:"table"}].map(a=>{let n=a.id==="schema"?t==="schema":t==="query"&&e===a.id;return`<button class="data-nav-item${n?" is-active":""}" type="button"
          data-action="data-nav" data-tab="${a.id}" ${n?'aria-current="page"':""}>
          <span class="data-nav-icon">${g(a.icon,15)}</span>
          <span class="data-nav-copy">
            <strong>${r(a.label)}</strong>
            <small>${r(a.hint)}</small>
          </span>
        </button>`}).join("")}
  </nav>`}function fc(e,t,s){if(t.id!=="postgres"&&t.id!=="parquet")return"";let a=Array.isArray(s.fuzzyTerms)?s.fuzzyTerms:[],n=e==="law"?"Fuzzy \u6CD5\u898F\uFF0F\u547D\u4EE4":"Fuzzy \u5224\u6C7A",i=e==="law"?"\u8F38\u5165\u6CD5\u898F\u540D\u7A31\u6216\u76F8\u8FD1\u5B57\u2026":"\u8F38\u5165\u6CD5\u9662\u3001\u6848\u865F\u3001\u6848\u7531\u6216\u76F8\u8FD1\u5B57\u2026";return`<div class="data-fuzzy" data-data-fuzzy data-fuzzy-kind="${e}">
    <div class="data-fuzzy-head">
      <span class="filter-title">${n}</span>
      <span class="field-tag">\u591A\u689D\u4EF6 AND</span>
    </div>
    <div class="data-fuzzy-row">
      <div class="data-fuzzy-values">
        ${a.length?a.map(o=>`<span class="chip data-fuzzy-chip">${r(o)}<button class="data-fuzzy-remove" type="button" data-action="remove-fuzzy-term" data-term="${r(o)}" aria-label="\u79FB\u9664 ${r(o)}">${g("x",9)}</button></span>`).join(""):`<span class="data-fuzzy-placeholder">${i}</span>`}
      </div>
      <button class="data-fuzzy-add" type="button" data-action="open-fuzzy" aria-label="\u52A0\u5165 fuzzy \u689D\u4EF6" aria-haspopup="listbox">${g("plus",13)}</button>
    </div>
    <div class="data-fuzzy-popover" data-data-fuzzy-popover hidden>
      <input class="input" type="search" data-data-fuzzy-search placeholder="${i}" autocomplete="off" />
      <div class="data-fuzzy-results" data-data-fuzzy-results role="listbox" aria-live="polite"></div>
    </div>
  </div>`}function Hn(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],n=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function bc(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||r(e.detail||"")}function hc(e){return`<div class="report-empty">
    ${ot({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:r({postgres:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u6CD5\u898F\u6216\u5224\u6C7A\u689D\u4EF6\uFF0C\u518D\u8996\u9700\u8981\u5C55\u958B\u9032\u968E metadata \u689D\u4EF6\u3002",parquet:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u689D\u4EF6\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\uFF1B\u53EF\u5C55\u958B\u9032\u968E\u689D\u4EF6\u8ABF\u6574\u6B04\u4F4D\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
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
  </div>`}function Zs(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(Ra(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function Ca(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(Ra(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Ee({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${g("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function vc(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,n=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${r(s.label||"\u672A\u5206\u985E")}">${r(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${n.toFixed(1)}%"></span></span>
          <span class="dist-value">${d(a)}</span>
        </div>`}).join("")}
  </div>`}function Bi(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function $c(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function yc(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function wc(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${r(String(t))}"
    title="\u6AA2\u8996\u300C${r(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${r(String(t))}${g("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var _c={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function kc(e,t,s,a=!1,n=!0,i=!1){let o=a?e.key:e.label||e.key,l=n?t?_c[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${r(o)}</th>`;let m=s?.key===l,f=m?s.direction:null,p=f==="asc"?"ascending":f==="desc"?"descending":"none",$=f==="asc"?"\u2191":f==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${p}">
    <button class="table-sort${m?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${r(l)}"
      title="\u4F9D${r(o)}\u6392\u5E8F">
      <span>${r(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${$}</span>
    </button>
  </th>`}function Sc(e,t){if(!Bi(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,n=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(n||""),lawName:String(t.law_name||"")}}function xc(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${r(s.lawKey)}"
    data-law-source="${r(s.sourceType)}"
    data-law-name="${r(s.lawName)}"
    title="\u6AA2\u8996\u300C${r(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(String(a))}${g("chevronRight",12,"law-link-icon")}</button>`}function Fi(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:n=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],m=(e.page-1)*e.page_size,f=Bi(e),p=$c(e),$=yc(e),b=e.meta?.sort||null,u=n?`<tr class="schema-search-row">
        <th scope="col" class="cell-index-head"></th>
        ${o.map(h=>`<th scope="col">
              <div class="schema-search-wrap">
                <input class="schema-search-input" type="search"
                  data-schema-search="${r(h.key)}"
                  value="${r(String(n[h.key]??""))}"
                  placeholder="\u641C\u5C0B ${r(h.key)}"
                  autocomplete="off" />
              </div>
            </th>`).join("")}
      </tr>`:"";return o.length?l.length?`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">${d(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${f?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":p?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":$?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${u}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(h=>kc(h,p,b,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((h,w)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${m+w+1}</td>
                ${o.map(_=>{if((p||$)&&_.key==="jid")return`<td class="cell-jid">${wc(h)}</td>`;let L=f&&_.key==="law_name"?Sc(e,h):null;if(L)return`<td>${xc(h,_,L)}</td>`;let x={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[_.type];return`<td${x?` class="${x}"`:""}>${ba(h[_.key],_.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${ot({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function Ac(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${d(i)}\u2013${d(o)} / ${d(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Ii.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${g("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${g("chevronRight",13)}</button>
    </div>
  </div>`}function Oi(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${r(t)}</div>`).join("")}</div>`}function Ea(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],n=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",m=e.status||"ok",f=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${r(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${r(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${r(e.label||l)}
          ${Ge(m)}
          <span class="chip">${r(f)}</span>
        </div>
        <div class="report-sub">
          ${d(i)} \u7B46\u7B26\u5408 \xB7
          ${de(e.duration_ms)} \xB7
          ${r(String(l).toUpperCase())} / ${r(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${g("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${g("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${Ee({tone:m==="not_configured"?"info":m==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:""}

    ${a.length?`<div class="summary-strip">
            ${a.slice(0,4).map(p=>`<div class="summary-item">
                  <div class="summary-label">${r(p.label)}</div>
                  <div class="summary-value">${r(p.value)}</div>
                </div>`).join("")}
          </div>`:""}

    <div class="report-grid">
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u7D50\u679C\u5206\u5E03</span>
          <span class="muted" style="font-size:9.5px">${n.length} groups</span>
        </div>
        ${vc(n)}
      </div>
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5BE6\u969B\u67E5\u8A62\u8A9E\u53E5</span>
          <span class="muted" style="font-size:9.5px">${r(e.database==="indexeddb"?"client-side":"read-only")}</span>
        </div>
        <div class="query-box">
          <pre class="query-code">${r(o||"\u2014")}</pre>
          <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
            ${g("copy",12)}<span>\u8907\u88FD</span>
          </button>
        </div>
        ${Oi(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?Fi(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?Ac({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function Ei(e){return`<div class="report-card schema-preview">
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
  </div>`}function zn(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let n=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${Ee({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${r(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${r(t||e.table||"\u8CC7\u6599\u8868")}
          ${Ge(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${r(String(e.database||""))} / ${r(String(e.table||"\u2014"))} \xB7 ${n.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${Fi({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${Oi(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${d(i.length)} \u7B46</span>
      <strong>\u5171 ${d(e.total)} \u7B46</strong>
    </div>
  </div>`}function Ri(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${r(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${Ee({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function qc(e){return`<div class="report-empty">
    ${ot({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${Ra(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function Gn(e){return e.is_current===!0?Ge("ok","\u73FE\u884C"):e.law_abandon_note?Ge("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?Ge("empty","\u6B77\u53F2\u7248\u672C"):Ge("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function tt(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${r(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function $s(e){return e?Et(e):"\u2014"}function Mc(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function Un(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${r(e)}</span>
    </div>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </div>`:""}function Lc(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${r(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${g("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </details>`:""}function jc(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let n=a?.name||a?.url||"";return n?a.url?`<a class="law-attachment" href="${r(a.url)}" target="_blank" rel="noopener noreferrer">
          ${g("file",12)}<span>${r(n)}</span>${g("external",11)}
        </a>`:`<span class="law-attachment">${g("file",12)}<span>${r(n)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${d(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function Hi(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Tc(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,n=s?`${d(a)} \u689D \xB7 ${d(s)} \u7AE0\u7BC0`:`${d(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${r(l)}</div>`;let m=dc[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${r(Hi(o.article_no))}">
        <div class="law-article-head">
          <span class="law-article-no">${r(o.article_no||"\u689D\u6587")}</span>
          ${m&&m!=="\u689D\u6587"?`<span class="chip">${r(m)}</span>`:""}
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
  </div>`}function Nc(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function Ns(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${g("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function Ec(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${Ns()}
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
  </div>`}function Rc(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${Ns()}
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
        ${Ee({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function Cc(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let n=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",n,a.article_count_for_law?`${d(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${r(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${r(i)}</option>`}).join("")}
    </select>
  </label>`}function Pc(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let n={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${n[o]} ${d(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">\u7248\u672C\u8B8A\u66F4</span>
      <span class="muted">${r(i)}</span>
    </summary>
    <div class="law-version-change-list">
      ${a.length?a.slice(0,20).map(o=>{let l=o.change_type==="added"?"badge-ok":o.change_type==="removed"?"badge-danger":"badge-warn",m=o.before_content?`<details><summary>\u8B8A\u66F4\u524D</summary><pre>${r(o.before_content)}</pre></details>`:"",f=o.after_content?`<details><summary>\u8B8A\u66F4\u5F8C</summary><pre>${r(o.after_content)}</pre></details>`:"";return`<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${l}">${r(n[o.change_type]||o.change_type)}</span>
                    <strong>${r(o.article_no||o.article_key)}</strong>
                  </div>
                  ${m}${f}
                </div>`}).join(""):'<div class="report-empty-inline">\u6B64\u7248\u672C\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u8B8A\u66F4\u3002</div>'}
      ${e.changes_truncated?'<div class="report-empty-inline">\u50C5\u986F\u793A\u524D 20 \u7B46\u8B8A\u66F4\uFF1BAPI \u56DE\u50B3\u4E0A\u9650 200 \u7B46\u3002</div>':""}
    </div>
  </details>`}function Ic(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let n=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(w=>w.article_type!=="C").length,l=Mc(e),m=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",f=e.meta?.snapshot||"",p=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",$=[l,m,p,f].filter(Boolean).join(" \xB7 "),b=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",u=e.version||{},h=[tt("\u6CD5\u898F\u4F4D\u968E",r(e.law_level||"\u2014")),tt("\u6CD5\u898F\u985E\u5225",r(e.law_category||"\u2014")),tt("\u7570\u52D5\u65E5\u671F",$s(e.law_modified_date)),tt("\u751F\u6548\u65E5\u671F",$s(e.law_effective_date)),tt("\u689D\u6587\u6578",d(e.article_count)),tt("\u8CC7\u6599\u72C0\u614B",Gn(e)),tt("\u82F1\u8B6F\u540D\u7A31",r(e.eng_law_name||"\u2014")),tt("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${r(e.law_key||"\u2014")}</span>`)];return u.first_seen_version_id!==null&&u.first_seen_version_id!==void 0&&h.push(tt("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${r(u.first_seen_version_id)}`)),u.last_seen_version_id!==null&&u.last_seen_version_id!==void 0&&h.push(tt("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${r(u.last_seen_version_id)}`)),u.last_seen_at&&h.push(tt("\u6700\u5F8C\u6536\u9304\u6642\u9593",r($e(u.last_seen_at)))),u.selected_version_id!==null&&u.selected_version_id!==void 0&&h.push(tt("\u689D\u6587\u7248\u672C",`#${r(u.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${Ns()}
      <span class="law-report-origin" title="${r($)}">${r($)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${r(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${r(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${r(i)}
            ${Gn(e)}
            <span class="chip">${r(b)}</span>
          </div>
          <div class="report-sub">
            ${r([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${d(e.article_count)} \u689D \xB7 \u7570\u52D5 ${$s(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${Cc(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">${g("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${n.length?`<div class="report-alert">${Ee({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n.map(w=>r(w)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${d(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${$s(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${r(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${Gn(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${r(l)}</span>
        </div>
        <div class="law-meta-grid">${h.join("")}</div>
      </div>

      ${Pc(e)}
      ${Un("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${Lc("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${Un("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${Un("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${jc(e.attachments)}
      ${Tc(e)}
    </div>
    ${o>100?Nc():""}
  </div>`}function Dc(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Ns()}
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
  </div>`}function Bc(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Ns()}
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
        ${Ee({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function Fc(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${r(t)}"
    data-law-source=""
    data-law-name="${r(t)}"
    title="\u6AA2\u8996\u300C${r(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(t)}${g("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function Oc(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let n=String(s.article_no||"").trim();n&&t.get(a).add(n)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${Fc(s)}
          <span class="judgment-citation-articles">${[...a].map(n=>r(n)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function Hc(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",n=String(e.full_text||""),i=Number(e.full_text_length)||n.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[tt("\u6848\u865F",r(e.jid||"\u2014")),tt("\u5E74\u5EA6",r(e.jyear||"\u2014")),tt("\u5B57\u5225",r(e.jcase||"\u2014")),tt("\u865F\u78BC",r(e.jno||"\u2014")),tt("\u6CD5\u9662",r(e.court||"\u2014")),tt("\u6848\u7531",r(e.title||"\u2014")),tt("\u88C1\u5224\u65E5\u671F",$s(e.jdate)),tt("\u4F86\u6E90\u58D3\u7E2E\u6A94",r(e.source_archive||"\u2014")),tt("\u5168\u6587\u9577\u5EA6",`${d(i)} \u5B57`),tt("\u5F15\u7528\u6578",d(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(tt("\u532F\u5165 Run",`#${r(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Ns()}
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
            ${r(e.court||"\u2014")} \xB7 ${$s(e.jdate)} \xB7
            ${d(i)} \u5B57
          </div>
        </div>
        <div class="report-actions">
          ${e.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(e.pdf_url)}" target="_blank" rel="noopener noreferrer">${g("external",14)}<span>PDF</span></a>`:""}
        </div>
      </div>

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u88C1\u5224\u65E5\u671F</div>
          <div class="summary-value">${$s(e.jdate)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u9662</div>
          <div class="summary-value summary-value-text">${r(e.court||"\u2014")}</div>
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
          <span class="muted" style="font-size:9.5px">${r(e.jid||"")}</span>
        </div>
        <div class="law-meta-grid">${l.join("")}</div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u547D\u4E2D\u6CD5\u898F\u8207\u5F15\u7528</span>
          <span class="muted">${d(s.length)} \u6CD5\u898F \xB7 ${d(e.citation_count)} \u5F15\u7528</span>
        </div>
        ${Oc(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${d(i)} \u5B57</span>
        </div>
        ${n?`<div class="judgment-fulltext">${r(n)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function Ci(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function Pa(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(Ci).join(",")],n=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([n+o+1,...t.map(l=>i[l.key])].map(Ci).join(","))}),`\uFEFF${a.join(`\r
`)}`}function Ia(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,n]of Object.entries(t))a.startsWith("_")||(s[a]=n);return s})}}function zc(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function Pi(e,t){let s=performance.now(),a=Di(e,t),n=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,m=[],f=[],p=[],$=[];if(n==="audit_events"){try{let x=Number(await ds("audit.last_event_id",0))||0,O=await V.versioningAudit({since_id:x,limit:500}),ie=Array.isArray(O?.events)?O.events:[];ie.length&&await mi(ie.map(he=>({...he,dataset:"judgment"})));let J=Number(O?.latest_event_id||0);J>x&&await Ys("audit.last_event_id",J)}catch(x){m.push(`\u7248\u672C audit \u540C\u6B65\u5931\u6557\uFF1A${x.message||x}`)}f=(await gi({keyword:i,limit:ji})).map(x=>({created_at:x.created_at,dataset:x.dataset,issue_month:x.issue_month,change_type:x.change_type,jid:x.jid,detail:x.detail})),p=[{key:"created_at",label:"\u6642\u9593",type:"datetime"},{key:"dataset",label:"\u8CC7\u6599\u96C6",type:"text"},{key:"issue_month",label:"\u6708\u4EFD",type:"mono"},{key:"change_type",label:"\u8B8A\u66F4",type:"status"},{key:"jid",label:"\u6848\u865F",type:"mono"},{key:"detail",label:"\u6458\u8981",type:"longtext"}];let S=new Map;f.forEach(x=>S.set(x.change_type||"unknown",(S.get(x.change_type||"unknown")||0)+1)),$=Array.from(S.entries()).map(([x,O])=>({label:x,value:O})).sort((x,O)=>O.value-x.value)}else if(n==="settings"){f=(await bi({keyword:i})).map(x=>({key:x.key,value:hi(x.value),updated_at:x.updated_at})),p=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let S=new Map;f.forEach(x=>{let O=String(x.key||"").split(".")[0]||"\u5176\u4ED6";S.set(O,(S.get(O)||0)+1)}),$=Array.from(S.entries()).map(([x,O])=>({label:x,value:O})).sort((x,O)=>O.value-x.value)}else{f=(await qa({keyword:i,limit:ji})).map(x=>({kind:zc(x.kind),title:x.title,detail:x.detail,created_at:x.created_at})),p=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let S=new Map;f.forEach(x=>S.set(x.kind,(S.get(x.kind)||0)+1)),$=Array.from(S.entries()).map(([x,O])=>({label:x,value:O})).sort((x,O)=>O.value-x.value)}let b=f.length,u=(o-1)*l,h=f.slice(u,u+l),w=Math.round(performance.now()-s),_=di();return _&&m.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:_?"degraded":"ok",message:_?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:n,columns:p,rows:h,total:b,page:o,page_size:l,duration_ms:w,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(b)},{label:"\u76EE\u524D\u9801\u9762",value:`${h.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:Vs()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${w} ms`}],distribution:$,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${n}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${u}`,warnings:m,meta:{store:n,filters:a,client_side:!0}}}async function Gc(e,t){let s=!1,a=null,n=[],i="law",o=null,l={},m=0,f=25,p="query",$=null,b=null,u=0,h=[],w=null,_=-1,L=0,S=0,x=null,O=null,ie=null;e.innerHTML=`<section class="page data-page">
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
          ${g("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    <div class="processing-summary judgment-stats-cards" id="data-judgment-stats" aria-label="\u91D1\u878D\u6848\u4EF6\u4F54\u6BD4">
      ${Vt(null,{loading:!0})}
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
  </section>`;let J=e.querySelector("#query-sidebar"),he=e.querySelector("#data-nav"),me=e.querySelector("#db-options-wrap"),Z=e.querySelector("#filter-area"),j=e.querySelector("#schema-area"),A=e.querySelector("#query-main"),E=e.querySelector("#schema-suggest-popover"),X=e.querySelector("#catalog-meta"),W=e.querySelector("#refresh-catalog"),B=e.querySelector("#data-judgment-stats"),le=q=>n.find(N=>N.id===q),ge=()=>le(i)?.databases||[],F=q=>ge().find(N=>N.id===q),fe=(q,N)=>`${q}:${N}`,ee=(q,N=i)=>l[fe(N,q.id)],xe=(q,N)=>{Ys(q,N).catch(()=>{})},ve=()=>{if(!a){X.textContent="CATALOG \xB7 \u96E2\u7DDA",X.className="badge badge-danger badge-mono";return}let q=ge(),N=q.filter(z=>z.available).length,R=le(i);X.textContent=`CATALOG \xB7 ${R?.label||i} \xB7 ${N}/${q.length} \u53EF\u7528`,X.className="badge badge-neutral badge-mono"},ae=q=>{A.innerHTML=hc(q)},ne=()=>{let q=O?.returnScroll??ie?.returnScroll;O=null,ie=null;let N=F(o),R=N?ee(N):null;p==="schema"&&b?.result?A.innerHTML=zn(b.result,Ne(N,b.tableId),{columnFilters:b.columnFilters||{},searchEnabled:N.id==="postgres"||N.id==="parquet"}):R?.result?A.innerHTML=Ea(R.result):N&&ae(N),typeof q=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:q,behavior:"smooth"}))},pe=(q="law-article-jump")=>{let N=A.querySelector(`#${q}`),R=Hi(N?.value);if(!R){D("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),N?.focus();return}let Y=[...A.querySelectorAll("[data-article-no]")].find(te=>te.dataset.articleNo===R);if(!Y){D(`\u627E\u4E0D\u5230\u7B2C ${R} \u689D\u3002`,"warn");return}Y.scrollIntoView({behavior:"instant",block:"center"}),Y.classList.add("is-jump-target"),window.setTimeout(()=>Y.classList.remove("is-jump-target"),2400)},be=async({lawKey:q,sourceType:N="",lawName:R="",versionId:z=""})=>{let Y=F(o),te=Y?ee(Y):null,ce=p==="schema"?b?.result:null;if(!Y||!te?.result&&!ce||!q)return;let je=++m;O={seq:je,lawKey:q,sourceType:N,lawName:R,versionId:z?String(z):"",page:1,detail:null,database:Y.id,returnScroll:window.scrollY},ie=null,A.innerHTML=Ec(R||q),A.scrollIntoView({behavior:"smooth",block:"start"});try{let Ce=await V.lawDetail(q,N,O.versionId);if(s||!O||O.seq!==je)return;O.detail=Ce,O.page=1,A.innerHTML=Ic(Ce,{database:O.database,lawPage:O.page})}catch(Ce){if(s||!O||O.seq!==je)return;A.innerHTML=Rc(Ce,R||q),D(Ce.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},_e=async({jid:q})=>{let N=F(o),R=N?ee(N):null,z=p==="schema"?b?.result:null;if(!N||!R?.result&&!z||!q)return;let Y=++m;O=null;let te=N.id==="parquet"?"parquet":"postgres";ie={seq:Y,jid:q,detail:null,database:N.id,source:te,returnScroll:window.scrollY},A.innerHTML=Dc(q),A.scrollIntoView({behavior:"smooth",block:"start"});try{let ce=await V.judgmentDetail(q,te);if(s||!ie||ie.seq!==Y)return;ie.detail=ce,A.innerHTML=Hc(ce,{database:ie.database})}catch(ce){if(s||!ie||ie.seq!==Y)return;A.innerHTML=Bc(ce,q),D(ce.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},ke=(q,N)=>`${i}:${q.id}:${N}`,Ne=(q,N)=>(q.tables||[]).find(R=>R.id===N)?.label||N,Oe=(q,N,{sort:R=null,columnFilters:z={}}={})=>{let Y={column_filters:z};return q.id==="postgres"?(Y.table=N,Y.schema_preview=!0):q.id==="parquet"&&i==="judgment"?(Y.table="judgment_documents",Y.columns=cc):q.id==="parquet"&&(Y.dataset="all",Y.columns=lc),R?.key&&(Y.sort=`${R.key}:${R.direction}`),Y},I=async(q,N,{sort:R=null,columnFilters:z={},quiet:Y=!1}={})=>{if(!N)return;ut();let te=ke(q,N),ce=++u,je=!!(Y&&b?.result&&b.key===te);$={tableId:N},b={key:te,tableId:N,loading:!0,result:null,error:null,sort:R,columnFilters:z},je?A.setAttribute("aria-busy","true"):(j.innerHTML=Hn(q,le(i)?.label||i,N),A.innerHTML=Ei(Ne(q,N)));try{let Ce;if(q.id==="indexeddb"){let Te=Ta(q,10);Te.values.store=N,Te.page=1,Ce=await Pi(q,Te)}else q.id==="qdrant"?Ce={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:N,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(Ce=await V.query({database:q.id,filters:Oe(q,N,{sort:R,columnFilters:z}),page:1,pageSize:10}),R?.key&&(Ce.meta={...Ce.meta||{},sort:R}));if(s||ce!==u)return;b={key:te,tableId:N,loading:!1,result:Ce,error:null,sort:R,columnFilters:z},A.removeAttribute("aria-busy"),p==="schema"&&$?.tableId===N&&(j.innerHTML=Hn(q,le(i)?.label||i,N),A.innerHTML=zn(Ce,Ne(q,N),{columnFilters:z,searchEnabled:q.id==="postgres"||q.id==="parquet"}))}catch(Ce){if(s||ce!==u)return;b={key:te,tableId:N,loading:!1,result:null,error:Ce,sort:R,columnFilters:z},A.removeAttribute("aria-busy"),p==="schema"&&$?.tableId===N&&(A.innerHTML=Ri(Ce,Ne(q,N)))}},G=()=>{let q=F(o);if(!q)return null;if(p==="schema"&&b?.result)return{db:q,tableId:b.tableId,columnFilters:b.columnFilters||{},sort:b.sort||null,mode:"schema"};let N=q?ee(q):null,R=N?.result;return R&&(q.id==="postgres"||q.id==="parquet")?{db:q,tableId:R.table,columnFilters:N.columnFilters||{},sort:N.sort||null,mode:"query"}:null},k=(q,N,R)=>{if(!q)return;let z=`${q.db.id}:${q.tableId}:${N}`,Y=P.get(z);Y&&(window.clearTimeout(Y),P.delete(z)),ut();let te={...q.columnFilters||{}},ce=String(R||"").trim();if(ce?te[N]=ce:delete te[N],q.mode==="schema"){I(q.db,q.tableId,{sort:q.sort,columnFilters:te,quiet:!0});return}let je=ee(q.db);je.columnFilters=te,je.page=1,Ve(1)},P=new Map,K=()=>{(!E||E.hidden)&&!h.length&&!w||(L+=1,h=[],w=null,_=-1,E&&(E.hidden=!0,E.innerHTML=""))},H=(q,N)=>{let R=String(q||""),z=R.toLocaleLowerCase(),Y=String(N||"").toLocaleLowerCase(),te=new Array(R.length).fill(!1),ce=(Fe,et)=>{for(let at=Fe;at<Fe+et;at+=1)at>=0&&at<te.length&&(te[at]=!0)},je=z.indexOf(Y);if(je>=0)for(;je>=0;)ce(je,Y.length),je=z.indexOf(Y,je+Y.length);else{let Fe=[];for(let et of Y.match(/[一-鿿]{2,}/g)||[])for(let at=0;at<et.length-1;at+=1)Fe.push(et.slice(at,at+2));Fe.push(...Y.match(/[a-z0-9]+/g)||[]);for(let et of Fe){let at=z.indexOf(et);for(;at>=0;)ce(at,et.length),at=z.indexOf(et,at+et.length)}}let Ce="",Te=0;for(;Te<R.length;)if(te[Te]){let Fe=Te;for(;Fe<R.length&&te[Fe];)Fe+=1;Ce+=`<mark>${r(R.slice(Te,Fe))}</mark>`,Te=Fe}else{let Fe=Te;for(;Fe<R.length&&!te[Fe];)Fe+=1;Ce+=r(R.slice(Te,Fe)),Te=Fe}return Ce||r(R)},Re=(q,N)=>{if(!E)return;let R=q.getBoundingClientRect(),z=Math.min(420,Math.max(220,R.width)),Y=Math.min(360,34+N*30),te=R.bottom+4;te+Y>window.innerHeight-8&&(te=Math.max(8,R.top-Y-4));let ce=Math.min(window.innerWidth-z-8,Math.max(8,R.left));E.style.width=`${z}px`,E.style.left=`${ce}px`,E.style.top=`${te}px`},Se=q=>{if(!E)return;let N=[...E.querySelectorAll(".schema-suggest-item")];N.length&&(_=Math.max(0,Math.min(N.length-1,q)),N.forEach((R,z)=>{R.classList.toggle("is-active",z===_)}),N[_].scrollIntoView({block:"nearest"}))},Pe=q=>{let N=h[q],R=w;!N||!R||(K(),k(R,R.column,N))},Ie=async(q,N,R,z)=>{if(!q||!R.trim()){K();return}let Y=++L;w={...q,column:N,input:z},_=-1;try{let te=await V.schemaSuggest({database:q.db.id,table:q.tableId,column:N,query:R,limit:1e3});if(Y!==L||document.activeElement!==z||!E)return;let ce=Array.isArray(te.values)?te.values:[];if(h=ce,!ce.length){K();return}let je=Number(te.total)>ce.length?`\u5171 ${d(te.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${d(ce.length)} \u500B`:`\u5171 ${d(te.total)} \u500B\u7B26\u5408`;E.innerHTML=`<div class="schema-suggest-head">${r(je)}</div>${ce.map((Ce,Te)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${Te}"
            title="${r(Ce)}">${H(Ce,R)}</button>`).join("")}`,Re(z,ce.length),E.hidden=!1}catch{K()}},ut=()=>{let q=document.activeElement;q instanceof HTMLElement&&q.matches("[data-schema-search]")&&q.blur(),K()},Ke=(q,{resetReport:N=!1}={})=>{ut();let R=ee(q);if(he.innerHTML=Ni(i,p),me.innerHTML=gc(ge(),q.id),p==="schema")Z.hidden=!0,Z.innerHTML="",j.hidden=!1,j.innerHTML=`<div class="schema-category-switch" role="tablist" aria-label="Schema \u985E\u5225">
        ${["law","judgment"].map(z=>{let Y=n.find(te=>te.id===z);return Y?`<button class="chip${i===z?" is-active":""}" type="button" role="tab" aria-selected="${i===z}" data-action="schema-category" data-category="${z}">${r(Y.label)}</button>`:""}).join("")}
      </div>${Hn(q,le(i)?.label||i,$?.tableId||"")}`;else{j.hidden=!0,j.innerHTML="",Z.hidden=!1;let z=fc(i,q,R),Y=Ti(q,R);Z.innerHTML=`${mc(q)}${z?`${z}<details class="data-advanced"><summary>\u9032\u968E metadata \u689D\u4EF6</summary>${Y}</details>`:Y}<div class="sidebar-note">${bc(q)}</div>`}if(ve(),p==="schema"){let z=$?ke(q,$.tableId):"";if(b&&b.key===z){let Y=Ne(q,b.tableId);b.loading?A.innerHTML=Ei(Y):b.error?A.innerHTML=Ri(b.error,Y):A.innerHTML=zn(b.result,Y,{columnFilters:b.columnFilters||{},searchEnabled:q.id==="postgres"||q.id==="parquet"})}else A.innerHTML=qc(q);return}N?ae(q):R.result?A.innerHTML=Ea(R.result):ae(q)},st=(q,{persist:N=!0,resetReport:R=!1}={})=>{let z=ge(),Y=z.find(ce=>ce.id===q)||z[0];if(!Y)return;O=null,ie=null,$=null,b=null,u+=1,o=Y.id;let te=fe(i,Y.id);l[te]||(l[te]=Ta(Y,f)),Ke(Y,{resetReport:R}),N&&(xe(`data.last_database.${i}`,Y.id),xe("data.last_category",i))},qt=(q,{persist:N=!0,resetReport:R=!0,databaseId:z=null}={})=>{let Y=le(q)||n[0];if(!Y)return;i=Y.id,O=null,ie=null;let te=Y.databases||[],ce=z&&te.find(je=>je.id===z)||te.find(je=>je.id===o)||te[0];if(o=ce?.id||null,!ce){he.innerHTML=Ni(i,p),me.innerHTML=`<div class="sidebar-notice">${Ee({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,Z.innerHTML="",ve();return}st(ce.id,{persist:!1,resetReport:R}),N&&(xe("data.last_category",Y.id),xe(`data.last_database.${Y.id}`,ce.id))},Mt=q=>{let N=ee(q),R=Z.querySelector("#data-filter-form");R&&(N.values=Na(R,q,N))},Ve=async(q=null,{quiet:N=!1}={})=>{let R=F(o);if(!R)return;ut();let z=ee(R);Mt(R),q!==null&&(z.page=q),(!Number.isFinite(z.page)||z.page<1)&&(z.page=1);let Y=++m;O=null,ie=null;let te=A.querySelector(".report-card"),ce=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!te?A.setAttribute("aria-busy","true"):(A.removeAttribute("aria-busy"),A.innerHTML=Zs(R));let Ce=Z.querySelector("#run-query");N||Me(Ce,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Te;if(R.id==="indexeddb"?Te=await Pi(R,z):Te=await V.query({database:R.id,filters:On(R,z),page:z.page,pageSize:z.pageSize}),s||Y!==m)return;if(Te.meta={...Te.meta||{},column_filters:z.columnFilters||{},searchable:R.id==="postgres"||R.id==="parquet",sort:z.sort||Te.meta?.sort||null},z.result=Te,z.page=Number(Te.page)||z.page,z.pageSize=Number(Te.page_size)||z.pageSize,A.removeAttribute("aria-busy"),A.innerHTML=Ea(Te),ce!==null){let et=A.querySelector("[data-page-size]");et&&(et.value=String(z.pageSize),et.focus({preventScroll:!0}))}let Fe=le(i)?.label||i;await Ws({kind:"data",title:`${Fe} \xB7 ${R.label} \xB7 ${Te.table||Te.label||"query"}`,detail:`${d(Te.total)} \u7B46 \xB7 ${de(Te.duration_ms)}`,payload:{category:i,database:R.id,filters:On(R,z),page:z.page,page_size:z.pageSize}}),xe("data.last_query",{category:i,database:R.id,filters:On(R,z),page:z.page,page_size:z.pageSize,at:new Date().toISOString()})}catch(Te){if(s||Y!==m)return;A.removeAttribute("aria-busy"),A.innerHTML=Ca(Te,R),D(Te.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&Y===m&&Me(Ce,!1)}},Ze=(q,N)=>{let R=q?.querySelector("[data-data-fuzzy-results]");R&&(R.innerHTML=N.length?N.map(z=>`<button class="data-fuzzy-option" type="button" role="option" data-action="select-fuzzy-term" data-term="${r(z.value)}"><span>${r(z.label||z.value)}</span><small>${r(z.meta||"")}</small></button>`).join(""):'<div class="data-fuzzy-empty">\u6C92\u6709\u76F8\u8FD1\u7D50\u679C\uFF1B\u6309 Enter \u53EF\u76F4\u63A5\u52A0\u5165\u76EE\u524D\u8F38\u5165\u7684\u95DC\u9375\u5B57\u3002</div>')},Lt=async(q,N="")=>{if(!q)return;let R=F(o),z=R?ee(R):null;if(!z)return;let Y=q.dataset.fuzzyKind||i,te=q.querySelector("[data-data-fuzzy-results]"),ce=++S;te&&(te.innerHTML='<div class="data-fuzzy-loading"><span class="spinner"></span><span>\u641C\u5C0B\u76F8\u8FD1\u7D50\u679C\u2026</span></div>');try{let je=await V.dataSuggest({kind:Y,query:N,limit:12});if(ce!==S)return;let Ce=(je.suggestions||[]).filter(Te=>!z.fuzzyTerms.includes(Te.value));Ze(q,Ce)}catch(je){if(ce!==S)return;te&&(te.innerHTML=`<div class="data-fuzzy-empty">${r(je.message||"\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},re=(q,{focus:N=!1}={})=>{if(!q)return;let R=q.querySelector("[data-data-fuzzy-popover]"),z=q.querySelector("[data-data-fuzzy-search]");!R||!z||(R.hidden&&(R.hidden=!1,z.value="",Lt(q,"")),N&&(z.focus(),z.select()))},we=q=>{x&&(window.clearTimeout(x),x=null);let N=q?.querySelector("[data-data-fuzzy-popover]");N&&(N.hidden=!0)},Ue=async q=>{let N=F(o);if(!N)return;let R=ee(N),z=String(q||"").trim();!z||R.fuzzyTerms.includes(z)||(R.fuzzyTerms=[...R.fuzzyTerms,z],we(Z.querySelector("[data-data-fuzzy]")),Ke(N),await Ve(1))},Ye=async q=>{let N=F(o);if(!N)return;let R=ee(N),z=String(q||"").trim();R.fuzzyTerms=R.fuzzyTerms.filter(Y=>Y!==z),Ke(N),await Ve(1)},jt=async()=>{W.disabled=!0,Me(W,!0,"\u6574\u7406\u4E2D\u2026");try{let[q,N,R,z,Y]=await Promise.all([V.catalog(),ds("data.last_category","law"),ds("data.last_database.law","postgres"),ds("data.last_database.judgment","postgres"),ds("data.page_size",25)]);if(s)return;a=q,B&&(B.innerHTML=Vt(a.judgment_stats)),n=Array.isArray(a.categories)?a.categories:[],f=Ii.includes(Number(Y))?Number(Y):25;for(let Te of n)for(let Fe of Te.databases||[]){let et=fe(Te.id,Fe.id);l[et]||(l[et]=Ta(Fe,f))}let te=n.find(Te=>Te.id===N)||n[0];if(!te){he.innerHTML="",me.innerHTML=`<div class="sidebar-notice">${Ee({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let ce=te.id==="judgment"?z:R;if(i=te.id,o=null,qt(te.id,{persist:!1,resetReport:!0,databaseId:ce}),s)return;let je=F(o),Ce=je?ee(je):null;je&&Ce&&p==="query"&&!Ce.result&&(je.id==="postgres"||je.id==="parquet")&&Ve(1),D("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(q){if(s)return;a=null,n=[],he.innerHTML="",B&&(B.innerHTML=Vt(null)),ve(),me.innerHTML=`<div class="sidebar-notice">${Ee({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:r(q.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${g("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,A.innerHTML=`<div class="report-empty">${ot({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(W.disabled=!1,Me(W,!1))}};J.addEventListener("change",q=>{let N=q.target;if(N.name==="category"){qt(N.value);return}if(N.name==="database"){st(N.value);let te=F(o),ce=te?ee(te):null;te&&ce&&!ce.result&&p==="query"&&(te.id==="postgres"||te.id==="parquet")&&Ve(1);return}let R=F(o);if(!R)return;let z=ee(R),Y=Z.querySelector("#data-filter-form");!Y||!N.name||(z.values=Na(Y,R,z),z.page=1,N.name==="table"&&(O=null,ie=null,z.sort=null,z.columnFilters={},z.result=null,Z.innerHTML=Ti(R,z),ae(R)))}),J.addEventListener("input",q=>{let N=q.target.closest("[data-data-fuzzy-search]");if(N){let te=N.closest("[data-data-fuzzy]");x&&window.clearTimeout(x),x=window.setTimeout(()=>{Lt(te,N.value)},160);return}let R=F(o);if(!R)return;let z=Z.querySelector("#data-filter-form");if(!z||!q.target.name||q.target.name==="table")return;let Y=ee(R);Y.values=Na(z,R,Y)}),J.addEventListener("keydown",q=>{let N=q.target.closest("[data-data-fuzzy-search]");if(!N)return;let R=N.closest("[data-data-fuzzy]");if(q.key==="Escape")q.preventDefault(),we(R),N.blur();else if(q.key==="Enter"){q.preventDefault();let z=R?.querySelector("[data-action='select-fuzzy-term']");z?z.click():Ue(N.value)}else q.key==="ArrowDown"&&(q.preventDefault(),R?.querySelector("[data-action='select-fuzzy-term']")?.focus())}),J.addEventListener("mouseover",q=>{let N=q.target.closest("[data-action='open-fuzzy']");N&&re(N.closest("[data-data-fuzzy]"))}),J.addEventListener("mouseout",q=>{let N=q.target.closest("[data-data-fuzzy]");N&&(q.relatedTarget&&N.contains(q.relatedTarget)||we(N))}),J.addEventListener("submit",q=>{q.target.id==="data-filter-form"&&(q.preventDefault(),Ve(1))}),J.addEventListener("click",async q=>{let N=Z.querySelector("[data-data-fuzzy] [data-data-fuzzy-popover]:not([hidden])")?.closest("[data-data-fuzzy]");N&&!q.target.closest("[data-data-fuzzy]")&&we(N);let R=q.target.closest("[data-action]"),z=R?.dataset.action;if(z==="data-nav"){let Y=R.dataset.tab,te=F(o);if(Y==="schema"){if(p!=="schema"){if(te){let Te=ee(te),Fe=Z.querySelector("#data-filter-form");Fe&&(Te.values=Na(Fe,te,Te))}p="schema",te&&Ke(te)}return}let ce=Y==="judgment"?"judgment":"law";p==="schema"&&(p="query"),i!==ce?qt(ce,{databaseId:o,resetReport:!1}):te&&Ke(te);let je=F(o),Ce=je?ee(je):null;je&&Ce&&!Ce.result&&(je.id==="postgres"||je.id==="parquet")&&Ve(1);return}if(z==="open-fuzzy"){re(R.closest("[data-data-fuzzy]"),{focus:!0});return}if(z==="select-fuzzy-term"){await Ue(R.dataset.term);return}if(z==="remove-fuzzy-term"){await Ye(R.dataset.term);return}if(z==="schema-category"){p="schema",qt(R.dataset.category||"law",{resetReport:!0});return}if(z==="select-schema-table"){let Y=F(o);if(!Y)return;I(Y,R.dataset.tableId||"");return}if(z==="reset"){let Y=F(o);if(!Y)return;O=null,ie=null;let te=ee(Y);l[fe(i,Y.id)]=Ta(Y,te.pageSize),Ke(Y),ae(Y),D("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}q.target.closest("#catalog-retry")&&jt()}),A.addEventListener("input",q=>{let N=q.target.closest("[data-schema-search]");if(!N)return;let R=G();if(!R)return;let z=N.dataset.schemaSearch||"",Y=N.value,te=`${R.mode}:${R.db.id}:${R.tableId}:${z}`,ce=P.get(te);if(ce&&window.clearTimeout(ce),!Y.trim()){P.delete(te),K(),k(R,z,"");return}let je=window.setTimeout(()=>{P.delete(te),Ie(R,z,Y,N)},250);P.set(te,je)}),A.addEventListener("keydown",q=>{let N=q.target.closest("[data-schema-search]");if(!N)return;let R=G();if(R){if(q.key==="Escape"){K();return}if(q.key==="ArrowDown"||q.key==="ArrowUp"){if(!E||E.hidden)return;q.preventDefault();let z=q.key==="ArrowDown"?1:-1;Se(_<0?z>0?0:h.length-1:_+z);return}if(q.key==="Enter"){if(q.preventDefault(),E&&!E.hidden&&_>=0){Pe(_);return}k(R,N.dataset.schemaSearch||"",N.value)}}}),E?.addEventListener("mousedown",q=>{q.preventDefault()}),E?.addEventListener("click",q=>{let N=q.target.closest("[data-schema-suggest-index]");N&&Pe(Number(N.dataset.schemaSuggestIndex))});let zt=q=>{q.target.closest("[data-schema-search]")||E?.contains(q.target)||K()};return document.addEventListener("click",zt),window.addEventListener("scroll",K,{capture:!0,passive:!0}),window.addEventListener("resize",K),A.addEventListener("keydown",q=>{q.target.matches(".law-jump-input")&&q.key==="Enter"&&(q.preventDefault(),pe(q.target.id))}),A.addEventListener("click",async q=>{let N=q.target.closest("[data-action]");if(!N)return;let R=N.dataset.action,z=F(o),Y=z?ee(z):null,te=Y?.result;if(R==="back-to-results"){ne();return}if(R==="open-law"){be({lawKey:N.dataset.lawKey||"",sourceType:N.dataset.lawSource||"",lawName:N.dataset.lawName||""});return}if(R==="open-judgment"){_e({jid:N.dataset.jid||""});return}if(R==="jump-article"){pe(N.dataset.jumpInput||"law-article-jump");return}if(R==="sort-column"){let ce=N.dataset.sortKey||"";if(!ce||!z)return;if(p==="schema"&&b?.result){let Te=b.sort,Fe=ce==="jdate"||ce==="law_modified_date"||ce==="article_count"||ce==="citation_count"||ce==="full_text_length"||ce==="created_at"||ce==="updated_at",et=Te?.key===ce?Te.direction==="asc"?"desc":"asc":Fe?"desc":"asc";I(z,b.tableId,{sort:{key:ce,direction:et},columnFilters:b.columnFilters||{},quiet:!0});return}if(!Y)return;let je=Y.sort,Ce=je?.key===ce?je.direction==="asc"?"desc":"asc":ce==="jdate"?"desc":"asc";Y.sort={key:ce,direction:Ce},Ve(1,{quiet:!0});return}if(R==="retry"){Ve(Y?.page||1);return}if(te){if(R==="prev-page"){Ve(Math.max(1,Number(te.page)-1),{quiet:!0});return}if(R==="next-page"){let ce=Math.max(1,Math.ceil(Number(te.total)/Number(te.page_size)));Ve(Math.min(ce,Number(te.page)+1),{quiet:!0});return}if(R==="copy-query"){let ce=await xs(te.query_text||"");D(ce?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",ce?"ok":"warn");return}if(R==="export-json"){let ce=`${te.database}-${te.table||"query"}-page-${te.page}.json`;Ct(ce,JSON.stringify(Ia(te),null,2),"application/json;charset=utf-8"),D(`\u5DF2\u532F\u51FA ${ce}`,"ok");return}if(R==="export-csv"){let ce=`${te.database}-${te.table||"query"}-page-${te.page}.csv`;Ct(ce,Pa(te),"text/csv;charset=utf-8"),D(`\u5DF2\u532F\u51FA ${ce}`,"ok")}}}),A.addEventListener("change",q=>{let N=q.target.closest("[data-action='select-law-version']");if(N&&O){be({lawKey:O.lawKey,sourceType:O.sourceType,lawName:O.lawName,versionId:N.value});return}if(!q.target.matches("[data-page-size]"))return;let R=F(o);if(!R)return;let z=ee(R);z.pageSize=Number(q.target.value)||25,z.page=1,xe("data.page_size",z.pageSize),Ve(1,{quiet:!0})}),W.addEventListener("click",()=>{jt()}),await jt(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0,x&&window.clearTimeout(x);for(let q of P.values())window.clearTimeout(q);P.clear(),K(),document.removeEventListener("click",zt),window.removeEventListener("scroll",K,{capture:!0}),window.removeEventListener("resize",K)}}var Wi=[10,25,50,100],Uc=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function Vn(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function Qc(e,t=e){return`<option value="${r(e)}">${r(t)}</option>`}function ea(e,t,s,a,n=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${r(t)}</span>
      <span class="field-tag">${r(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${r(e)}">
      ${Qc("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${r(i)}" ${String(i)===String(a)?"selected":""}>${r(i)}</option>`).join("")}
    </select>
    ${n?`<span class="field-help">${r(n)}</span>`:""}
  </div>`}function Jc(e,t){let s=Uc.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${ea("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${ea("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${ea("model","\u6A21\u578B",e.models||[],t.model)}
    ${ea("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${ea("method","\u65B9\u6CD5",e.methods||[],t.method)}
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
    </div>`}function zi(){let e=document.getElementById("performance-filter-form");if(!e)return Vn();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Gi(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function Ui(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),n=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${n}.${i}`}function Vc(e,t){if(!e)return"";let s=new Date(e);return Number.isNaN(s.getTime())?"":new Date(s.getTime()+Math.max(0,Number(t)||0)).toISOString()}var Wc=[{key:"parsing",label:"Parsing",hint:"\u8F38\u5165\u9577\u5EA6\u3001\u89E3\u6790\u6642\u9593",names:["rag.parse_question"],color:"#64748b"},{key:"embedding",label:"Embedding",hint:"Model\u3001Token\u3001Batch\u3001\u8017\u6642",names:["rag.embed_query"],color:"#3984c6"},{key:"qdrant",label:"Qdrant Search",hint:"Collection\u3001Filter\u3001Top K\u3001\u8017\u6642",names:["rag.qdrant_search"],color:"#d97706"},{key:"reranker",label:"Reranker",hint:"Model\u3001\u5019\u9078\u7B46\u6578\u3001\u8017\u6642",names:["rag.rerank"],color:"#8b5cf6"},{key:"context",label:"Context",hint:"Chunk \u6578\u3001Token \u6578\u3001\u8017\u6642",names:["rag.context"],fallbackNames:["rag.fetch_documents","rag.build_citations"],color:"#64748b"},{key:"llm",label:"LLM",hint:"Model\u3001Input/Output Token\u3001TTFT\u3001\u8017\u6642",names:["rag.llm_request"],color:"#16a34a"}],Ba={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"};function Ki(e){let t=e?.metadata?.rag_response||{},s=String(t.status||e?.metadata?.rag_status||e?.status||"");return s==="operational"||s==="success"?{label:"Completed",tone:"ok"}:s==="retrieval_only"?{label:"Abstain",tone:"warn"}:s==="preview"?{label:"Preview",tone:"info"}:s==="failed"||s==="error"?{label:"Failed",tone:"danger"}:{label:s||"Unknown",tone:"idle"}}function Wn(e){let t=Math.max(0,Number(e?.offset_ms)||0),s=Math.max(0,Number(e?.duration_ms)||0),a=Math.max(t,Number(e?.end_offset_ms)||t+s);return{...e,offset:t,end:a,duration:Math.max(s,a-t)}}function Yi(e,t=0){let s=Array.isArray(e?.segments)?[...e.segments].sort((p,$)=>Number(p.offset_ms||0)-Number($.offset_ms||0)):[],a=Math.max(Number(e?.total_ms)||0,Number(t)||0,...s.map(p=>Wn(p).end),1),n=Wc.map(p=>{let $=s.filter(w=>p.names.includes(w.name));!$.length&&p.fallbackNames&&($=s.filter(w=>p.fallbackNames.includes(w.name)));let b=$.map(Wn),u=b.length?Math.min(...b.map(w=>w.offset)):null,h=b.length?Math.max(...b.map(w=>w.end)):null;return{...p,spans:b,start:u,end:h,duration:u===null?null:h-u}});for(let p of n){if(p.key!=="embedding"&&p.key!=="llm")continue;let $=[];for(let h of p.spans){let w=h.metadata||{},_=Number(w.load_duration_ms),L=Number.isFinite(_)&&_>0?_:0,S=Math.max(0,Number(h.duration)||0);$.push({...h,offset:h.offset,end:h.offset+L,duration:L,metadata:{...w,source_stage:p.label,model_load_ms:L,request_duration_ms:S,warm_duration_ms:Math.max(0,S-L),cold_start:L>=100},params:{...h.params||{},source_stage:p.label}})}if(!$.length)continue;let b=$.reduce((h,w)=>h+w.duration,0),u=p.spans.reduce((h,w)=>h+Math.max(0,Number(w.duration)||0),0);p.loadInfo={spans:$,total:b,requestTotal:u,ratio:u>0?Math.min(1,Math.max(0,b/u)):0}}let i=[...n],o=Math.max(0,...i.flatMap(p=>p.spans.map($=>$.end))),l=e?.metadata?.rag_response||{},m=Ki(e),f=Math.min(a,o);return i.push({key:"response",label:"Response",hint:"\u7E3D\u8017\u6642\u3001\u5F15\u7528\u6578\u3001\u6210\u529F\u6216 Abstain",color:"#0f766e",spans:[{offset:f,end:a,duration:Math.max(0,a-f),status:m.tone==="danger"?"error":"ok",metadata:l,params:{},started_at:e?.started_at,finished_at:e?.finished_at}],start:f,end:a,duration:Math.max(0,a-f),responseMetadata:l}),Kc(i,a),{total:a,stages:i,response:l,traceStatus:m,requestId:e?.request_id||"",startedAt:e?.started_at,finishedAt:e?.finished_at,client:e?.client||{},models:Array.isArray(e?.summary?.models)?e.summary.models:[],hasLoad:i.some(p=>!!p.loadInfo)}}function Kc(e,t){let s=e.reduce((i,o)=>i+Math.max(0,Number(o.duration)||0),0),a=s>0?t/s:1,n=0;for(let i of e){let o=Math.max(0,Number(i.duration)||0)*a;i.displayStart=n,i.displayDuration=o,i.displayEnd=n+o;let l=i.spans[0]||null,m=[],f=!1;if(l){let $=Math.max(0,Number(l.duration)||0),b=i.loadInfo?Math.max(0,Number(i.loadInfo.total)||0):0;if(i.loadInfo&&b>0&&i.spans.length===1&&$>0){let u=Math.min(l.end,l.offset+b),h=Math.max(0,u-l.offset),w=Math.max(0,l.end-u);if(h>0&&w>0){let _=Vc(l.started_at,h),L={...l,offset:l.offset,end:u,duration:h,finished_at:_,metadata:{...l.metadata||{},source_stage:i.label,model_load_ms:h,request_duration_ms:$,warm_duration_ms:Math.max(0,$-h),cold_start:h>=100},params:{...l.params||{},source_stage:i.label}},S={...l,offset:u,end:l.end,duration:w,started_at:_,finished_at:l.finished_at};m.push({kind:"load",label:"Model Load",span:L,duration:h}),m.push({kind:"stage",label:`${i.label} \u63A8\u8AD6`,span:S,duration:w}),f=!0}}f||m.push({kind:"stage",label:i.label,span:l,duration:$})}i.detailSegments=m;let p=[];if(l&&o>0)if(f){let[$,b]=m,u=$.duration+b.duration,h=u>0?o*($.duration/u):0,w={...i,key:"model_load",label:`Model Load \xB7 ${i.label}`,spans:[$.span],duration:$.duration},_={...i,label:`${i.label} \u63A8\u8AD6`,spans:[b.span],duration:b.duration};p.push({offset:n,duration:h,color:"#0ea5e9",kind:"load",tip:Da(w,$.span)}),p.push({offset:n+h,duration:Math.max(0,o-h),color:i.color,kind:"stage",tip:Da(_,b.span,{includeLoad:!1})})}else p.push({offset:n,duration:o,color:i.color,kind:"stage",tip:Da(i,l)});i.displaySegments=p,n+=o}}function Kn(e,{includeLoad:t=!0}={}){let s=[],a=(p,$)=>{$==null||$===""||s.push([p,String($)])},n=e.spans[0]||null;if(!n)return a("\u72C0\u614B","\u6B64\u7D00\u9304\u6C92\u6709\u9019\u500B span"),s;let i=n.params||{},o=n.metadata||{},l=Xi(n),m=Yn(n),f=(p,$)=>{let b=Number(p?.load_duration_ms);if(!Number.isFinite(b))return;let u=Math.max(0,b);a("Model Load",de(u)),a("\u51B7\u555F\u52D5",u>=100?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09");let h=Math.max(0,Number($)||0);if(h>0){let w=Math.max(0,h-u);a("\u6263\u9664\u8F09\u5165\u5F8C",de(w)),a("\u8F09\u5165\u5360\u6BD4",`${(u/h*100).toFixed(u/h>=.1?0:1)}%`)}};if(e.key==="response")return a("Trace \u72C0\u614B",e.responseMetadata.status||"\u2014"),a("Answer source",e.responseMetadata.answer_source||"\u2014"),a("Abstain",e.responseMetadata.abstain?"\u662F":"\u5426"),a("\u5F15\u7528\u7E3D\u6578",e.responseMetadata.citation_count??"\u2014"),a("\u5224\u6C7A\uFF0F\u6CD5\u898F\u5F15\u7528",`${e.responseMetadata.judgment_citations??"\u2014"} / ${e.responseMetadata.law_citations??"\u2014"}`),a("\u7E3D\u8017\u6642",de(e.duration)),s;if(a("\u958B\u59CB",`${Ui(n.started_at)||"\u2014"} \xB7 +${n.offset.toFixed(1)} ms`),a("\u7D50\u675F",`${Ui(n.finished_at)||"\u2014"} \xB7 +${n.end.toFixed(1)} ms`),a("\u8017\u6642",de(n.duration)),e.key==="parsing")a("\u8F38\u5165\u9577\u5EA6",o.input_length??i.input_length),a("\u6B63\u898F\u5316\u9577\u5EA6",o.normalized_length??i.normalized_length),a("\u79FB\u9664\u7A7A\u767D",o.trimmed_chars);else if(e.key==="embedding")a("Model",m||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.active_base_url||o.base_url),a("Input tokens",o.prompt_eval_count),a("Batch",o.batch),a("\u5411\u91CF\u7DAD\u5EA6",o.dimensions),a("Fallback",o.fallback_used?"\u662F":"\u5426"),t&&f(o,n.duration);else if(e.key==="qdrant")a("Collection",o.collection||i.collection),o.filter&&a("Filter",Gi(o.filter)),a("Top K",o.top_k??i.limit),a("Hits",o.hits),a("Unique judgments",o.unique_judgments),a("Top score",o.top_score);else if(e.key==="reranker")a("Model",m||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Rerank \u72C0\u614B",o.status),a("Fallback",o.fallback_used?"\u662F":"\u5426"),a("\u5019\u9078\u7B46\u6578",o.candidates),a("\u9078\u7528\u7B46\u6578",o.selected),a("Top score",o.top_score),Array.isArray(o.errors)&&o.errors.length&&a("\u932F\u8AA4",o.errors.join(" \xB7 "));else if(e.key==="context")a("Chunks",o.chunks),a("\u5224\u6C7A chunks",o.judgment_chunks),a("\u6CD5\u898F chunks",o.law_chunks),a("Token \u4F30\u7B97",o.token_estimate),a("Context \u5B57\u5143",o.context_chars),a("\u6587\u4EF6\u6578",o.documents);else if(e.key==="llm")a("Model",m||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Input tokens",o.input_tokens),a("Output tokens",o.output_tokens),a("TTFT",o.ttft_ms===null||o.ttft_ms===void 0?"\u2014":de(o.ttft_ms)),a("API \u7E3D\u8017\u6642",o.total_duration_ms===null||o.total_duration_ms===void 0?"\u2014":de(o.total_duration_ms)),t&&f(o,n.duration),a("Strict retry",o.strict?"\u662F":"\u5426");else if(e.key==="model_load"){if(a("Model",m||o.model||i.model),a("\u4E3B\u6A5F",l),a("\u4F86\u6E90\u968E\u6BB5",o.source_stage),a("\u51B7\u555F\u52D5",o.cold_start?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09"),a("\u6A21\u578B\u547C\u53EB\u7E3D\u8017\u6642",o.request_duration_ms===null||o.request_duration_ms===void 0?"\u2014":de(o.request_duration_ms)),a("\u8F09\u5165\u8017\u6642",o.model_load_ms===null||o.model_load_ms===void 0?"\u2014":de(o.model_load_ms)),a("\u6263\u9664\u8F09\u5165\u5F8C\u6D41\u7A0B\u6642\u9593",o.warm_duration_ms===null||o.warm_duration_ms===void 0?"\u2014":de(o.warm_duration_ms)),Number(o.request_duration_ms)>0&&Number(o.model_load_ms)>=0){let p=Number(o.model_load_ms)/Number(o.request_duration_ms)*100;a("\u8F09\u5165\u5360\u6BD4",`${p.toFixed(p>=10?0:1)}%`)}o.eval_duration_ms!==null&&o.eval_duration_ms!==void 0&&a("\u63A8\u8AD6\u8017\u6642",de(o.eval_duration_ms))}else if(e.key==="segment"||e.key==="test_stage")if(a("Model",m||o.model||i.model),a("\u72C0\u614B",o.status||n.status),e.key==="test_stage")a("\u9032\u5EA6",o.progress===null||o.progress===void 0?"":`${Number(o.progress)||0}%`),n.error&&a("\u932F\u8AA4",n.error);else{n.error&&a("\u932F\u8AA4",n.error);for(let[p,$]of Object.entries(i).slice(0,10))a(p,Gi($))}return e.spans.length>1&&(e.key==="model_load"?a("\u5404\u6A21\u578B\u8F09\u5165",e.spans.map(p=>`${p.metadata?.source_stage||"model"} ${Yn(p)} ${de(p.metadata?.model_load_ms||0)}`).join(" \xB7 ")):(a("Span \u6578",e.spans.length),a("Span \u660E\u7D30",e.spans.map((p,$)=>`#${$+1} +${p.offset.toFixed(0)}ms/${de(p.duration)}`).join(" \xB7 ")))),n.module&&a("Module",n.module),n.function&&a("Function",n.function),s}function Yc(e){let t=String(e||"").trim();if(!t)return"";try{return new URL(t.includes("://")?t:`http://${t}`).hostname||t}catch{return t}}function Xi(e){let t=e?.metadata||{},s=String(t.provider_name||"").trim();if(s)return s;let a=String(t.active_base_url||t.base_url||e?.params?.url||"").trim();return Yc(a)}function Xc(e){let t=e?.metadata||{};return String(t.model||e?.params?.model||"").trim()}function Yn(e){let t=Xi(e),s=Xc(e);return s?t?`${t}:${s}`:s:""}function Zc(e){let t=new Set;for(let s of e?.spans||[]){let a=Yn(s);a&&t.add(a)}return[...t]}function Da(e,t,s={}){let a=Kn({...e,spans:[t]},s);return[String(e.label||""),...a.map(([n,i])=>`${n}: ${i}`)].join(`
`)}function ed(e,t){let s=e.spans||[],a=Zc(e),n=Array.isArray(e.displaySegments)?e.displaySegments:null,i=7,o=Math.max(1,Math.min(4,s.length)),l=s.length>1,m=n?12:l?Math.max(12,o*i):12,f=n?n.map(_=>{if(Number(_.duration)<=0)return"";let L=Math.max(0,Math.min(100,_.offset/t*100)),S=Math.min(100-L,_.duration/t*100);return`<span class="rag-wf-bar is-sequential${_.kind==="load"?" is-load":""}" style="left:${L.toFixed(3)}%;width:${S.toFixed(4)}%;top:0;height:12px;--bar-color:${_.color}"
            data-rag-wf-tip="${r(_.tip)}"
            aria-label="${r(_.tip)}" role="img"></span>`}).join(""):s.slice(0,4).map((_,L)=>{if(Number(_.duration)<=0)return"";let S=Math.max(0,Math.min(100,_.offset/t*100)),x=Math.max(.35,Math.min(100-S,_.duration/t*100)),O=l?L*i:0,ie=l?6:12,J=Da(e,_);return`<span class="rag-wf-bar" style="left:${S.toFixed(3)}%;width:${x.toFixed(3)}%;top:${O}px;height:${ie}px"
            data-rag-wf-tip="${r(J)}"
            aria-label="${r(J)}" role="img"></span>`}).join(""),p=Array.isArray(e.detailSegments)?e.detailSegments:[],$=p.length>1?p.map(_=>{let L=_.kind==="load"?{...e,key:"model_load",label:`Model Load \xB7 ${e.label}`,spans:[_.span],duration:_.duration}:{...e,label:`${e.label} \u63A8\u8AD6`,spans:[_.span],duration:_.duration},S=Kn(L,{includeLoad:_.kind!=="stage"});return`<div class="rag-wf-detail-group">
              <div class="rag-wf-detail-group-head">
                <strong>${r(_.label)}</strong>
                <span>${r(de(_.duration))}</span>
              </div>
              <div class="rag-wf-detail-grid">${S.map(([x,O])=>`<span class="rag-wf-detail"><span>${r(x)}</span><strong>${r(O)}</strong></span>`).join("")}</div>
            </div>`}).join(""):"",b=Kn(e).map(([_,L])=>`<span class="rag-wf-detail"><span>${r(_)}</span><strong>${r(L)}</strong></span>`).join(""),u=p.length>1?`<div class="rag-wf-details is-split">${$}</div>`:`<div class="rag-wf-details">${b}</div>`,h=s.length?s.some(_=>_.status==="error")?"is-error":"":"is-missing",w=s.length?de(e.duration):"\u672A\u8A18\u9304";return`<details class="rag-wf-stage ${h}" style="--stage-color:${e.color}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong>${r(e.label)}</strong><small>${r(e.hint)}</small>${a.length?`<small class="rag-wf-model-line">${r(a.join(" \xB7 "))}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${w} \xB7 ${s.length?`${s.length} span`:"\u2014"} <span class="rag-wf-chevron">${g("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:${m}px">${f}</span>
    </summary>
    ${u}
  </details>`}function Zi(e,t,s=!1){let a=e.response||{},n=e.client||{},i=e.models||[];return`<div class="rag-wf-summary">
      <span>\u7E3D\u8017\u6642 <strong>${r(de(e.total))}</strong></span>
      <span>Server <strong>${r(de(t))}</strong></span>
      ${n.total_ms?`<span>Client <strong>${r(de(n.total_ms))}</strong></span>`:""}
      ${n.render_ms!==void 0?`<span>Render <strong>${r(de(n.render_ms))}</strong></span>`:""}
      <span>\u5F15\u7528 <strong>${r(String(a.citation_count??"\u2014"))}</strong></span>
      <span>Abstain <strong>${a.abstain?"\u662F":"\u5426"}</strong></span>
      ${i.length?`<span>Model <strong>${r(i.join(" \xB7 "))}</strong></span>`:""}
      ${s?'<span class="rag-wf-updating">\u66F4\u65B0\u4E2D\u2026</span>':""}
    </div>`}function Es(e,t,s="\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\uFF0C\u67E5\u770B\u53C3\u6578\u3001Token\u3001TTFT\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u4F86\u6E90\u6578\u91CF\u3002Waterfall \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u5E73\u884C\u57F7\u884C\u7684 span \u6703\u4F9D\u5BE6\u969B\u6642\u9593\u91CD\u758A\u986F\u793A\u3002",{legend:a=""}={}){return`<div class="rag-wf-axis"><span>0 ms</span><span>${r(de(t))}</span></div>
    ${a}
    <div class="rag-wf-stages">${(e||[]).map(n=>ed(n,t)).join("")}</div>
    <p class="rag-wf-hint">${r(s)}</p>`}function eo(e){let t=(e.stages||[]).some(n=>n.loadInfo),s=t?'<div class="rag-wf-legend"><span><i class="is-load"></i>Model Load\uFF08\u968E\u6BB5 bar \u524D\u6BB5\uFF09</span></div>':"",a=t?"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\uFF1BEmbedding\uFF0FLLM \u7684\u85CD\u8272\u524D\u6BB5\u70BA Model Load\uFF0C\u5F8C\u6BB5\u70BA\u63A8\u8AD6\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001Token \u8207\u8F09\u5165\u5360\u6BD4\u53EF\u5C55\u958B\u67E5\u770B\u3002":"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207 Token \u53EF\u5C55\u958B\u67E5\u770B\u3002";return Es(e.stages,e.total,a,{legend:s})}function Fa(e,{serverDurationMs:t=0,loading:s=!1,embedded:a=!1}={}){if(!e||typeof e!="object")return"";let n=Yi(e,t),i=n.traceStatus;return`<section class="report-card rag-wf-card${a?" rag-wf-embedded":""}">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${Ba[i.tone]||Ba.idle}">${r(i.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(n.requestId||"\u2014")}</span>
          \xB7 ${r($e(n.startedAt))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <a class="btn btn-secondary btn-sm" href="#/performance">
          ${g("activity",14)}<span>\u5B8C\u6574 Flow</span>
        </a>
      </div>
    </div>
    ${Zi(n,t,s)}
    ${eo(n)}
  </section>`}var ft=null;function td(){return ft||(ft=document.createElement("div"),ft.className="rag-wf-tooltip",ft.hidden=!0,document.body.appendChild(ft),ft)}function Xn(){ft&&(ft.hidden=!0)}function to(e){if(!ft||ft.hidden)return;let t=14,s=10,a=ft.getBoundingClientRect(),n=e.clientX+t,i=e.clientY+t;n+a.width>window.innerWidth-s&&(n=e.clientX-a.width-t),i+a.height>window.innerHeight-s&&(i=e.clientY-a.height-t),ft.style.left=`${Math.max(s,n)}px`,ft.style.top=`${Math.max(s,i)}px`}document.addEventListener("pointerover",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=td(),a=t.dataset.ragWfTip||"";a&&(s.textContent=a,s.hidden=!1,to(e))});document.addEventListener("pointermove",e=>{if(!(!ft||ft.hidden)){if(!e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]")){Xn();return}to(e)}});document.addEventListener("pointerout",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=e.relatedTarget;s instanceof Node&&t.contains(s)||Xn()});window.addEventListener("scroll",Xn,{capture:!0,passive:!0});function sd(e,t,s,a){if(a&&!e.length)return`<div class="report-card rag-wf-card">
      ${Ee({tone:"danger",title:"RAG Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">${g("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;if(!e.length)return`<div class="report-card rag-wf-card">
      ${ot({iconName:"activity",title:s?"\u8B80\u53D6 RAG Pipeline\u2026":"\u5C1A\u7121 RAG Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684 RAG \u554F\u7B54 Trace\u3002":"\u7522\u751F\u65B0\u7684 RAG \u554F\u7B54\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A Parsing\u3001Embedding\u3001Qdrant\u3001Context\u3001LLM \u8207 Response \u7684 waterfall\u3002"})}
    </div>`;let n=e.find(f=>String(f.id)===String(t))||e[0],i=n.flow&&typeof n.flow=="object"?n.flow:{},o=Yi(i,n.duration_ms),l=o.traceStatus,m=e.map(f=>{let p=Ki(f.flow||{});return`<option value="${r(String(f.id))}" ${String(f.id)===String(n.id)?"selected":""}>#${r(String(f.id))} \xB7 ${r($e(f.started_at))} \xB7 ${r(de(f.duration_ms))} \xB7 ${r(p.label)}</option>`}).join("");return`<section class="report-card rag-wf-card">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${Ba[l.tone]||Ba.idle}">${r(l.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(o.requestId||n.request_id||"\u2014")}</span>
          \xB7 ${r($e(n.started_at))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <label class="rag-wf-select">Trace
          <select class="select" data-rag-trace-select aria-label="\u9078\u64C7 RAG Trace">${m}</select>
        </label>
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">
          ${g("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    ${Zi(o,n.duration_ms,s)}
    ${eo(o)}
  </section>`}function ad(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},n=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?de(a.avg_total_ms??0):"\u2014",o=a.samples?de(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
                    <span class="chip">${r(l.label||"\u2014")}</span>
                    <span class="perf-model-count">${d(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${de(l.avg_ms)}`:""}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u65B0\u7684 Flow \u6703\u5F9E params.model \u81EA\u52D5\u5F59\u6574\u3002</p>'}
      </div>
      <div class="perf-flow-stat-panel">
        <div class="report-section-head">
          <span class="report-section-title">\u6700\u6162\u5340\u6BB5\uFF08\u5E73\u5747\uFF09</span>
          <span class="muted" style="font-size:9.5px">\u6700\u8FD1 ${d(e?.sample_size??0)} \u7B46</span>
        </div>
        ${t.length?`<div class="perf-seg-list">${t.slice(0,6).map(l=>`<div class="perf-seg-row">
                    <span class="perf-seg-name" title="${r(l.label)}">${r(l.label)}</span>
                    <span class="perf-seg-track"><span style="width:${Math.max(2,(Number(l.avg_ms)||0)/n*100).toFixed(1)}%"></span></span>
                    <span class="perf-seg-ms">${de(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function ct(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),n=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(n).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:n?`${n}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function so(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function nd(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let n=Number(a.points_per_second)||0,i=Math.max(2,n/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${r(so(a))}</strong>
          <span>${r($e(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${r(`${d(a.indexed_count)} \u7B46 \xB7 ${ct(a.duration_ms)} \xB7 ${d(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${n.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${d(a.indexed_count)} \u7B46 \xB7 ${ct(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function rd(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${r(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${r(`${s.label} ${ct(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${r(s.key)}"></i>
            <span>${r(s.label)}</span>
            <strong>${ct(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 llama-server Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function id(e,t){let s=(Array.isArray(e)?e:[]).map(L=>({elapsed:Math.max(0,Number(L.elapsed_s)||0),indexed:Math.max(0,Number(L.indexed)||0)})).filter(L=>L.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(L=>L.elapsed),(Number(t)||0)/1e3,1),n=Math.max(...s.map(L=>L.indexed),1),i=760,o=150,l=12,m=12,f=i-l*2,p=o-m*2,$=s.map(L=>[l+L.elapsed/a*f,o-m-L.indexed/n*p]),b=$.map(([L,S],x)=>`${x===0?"M":"L"}${L.toFixed(1)},${S.toFixed(1)}`).join(" "),u=`${b} L${$[$.length-1][0].toFixed(1)},${o-m} L${$[0][0].toFixed(1)},${o-m} Z`,h=Math.max(1,Math.ceil($.length/14)),w=$.map(([L,S],x)=>x%h===0||x===$.length-1?`<circle cx="${L.toFixed(1)}" cy="${S.toFixed(1)}" r="2.6" />`:"").join(""),_=[0,1,2,3].map(L=>{let S=m+p/3*L;return`<line x1="${l}" y1="${S.toFixed(1)}" x2="${i-l}" y2="${S.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${d(n)} \u7B46 \xB7 ${ct(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${_}
      <path d="${u}" class="index-progress-area"></path>
      <path d="${b}" class="index-progress-line"></path>
      ${w}
      <line x1="${l}" y1="${o-m}" x2="${i-l}" y2="${o-m}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${m}" x2="${l}" y2="${o-m}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${ct(a*500)}</span>
      <span>${ct(a*1e3)}</span>
    </div>
  </div>`}function od(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},n=t.coverage||{},i=n.total_judgments>0?`${d(n.indexed_judgments)} / ${d(n.total_judgments)}\uFF08${(100*n.indexed_judgments/n.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:d(t.indexed_count),note:`${d(t.batch_count)} \u6279 \xD7 ${d(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:ct(t.duration_ms),note:`${d(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:ct(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${ct(t.batch_min_ms)} \xB7 \u6700\u6162 ${ct(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${d(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${r(so(t))}</span>
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
      <span><strong>batch</strong> ${d(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${d(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${d(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${r(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${ct(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${nd(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${ct(t.duration_ms)}</span>
        </div>
        ${rd(t)}
      </div>
    </div>
    ${id(t.progress,t.duration_ms)}
  </section>`}var Qi=["#22d3ee","#a78bfa","#f59e0b","#ec4899","#3b82f6","#10b981","#f97316","#8b5cf6","#64748b"];function Ji(e){let t=String(e?.host||e?.url||"").trim(),s=e?.port?`:${e.port}`:"";return`${t||"\u2014"}${s}`}function ld(e,t,s,a){if(a&&!e)return`<div class="report-card rag-wf-card">
      ${Ee({tone:"danger",title:"\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${g("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=Array.isArray(e?.runs)?e.runs:[];if(!n.length)return`<div class="report-card rag-wf-card">
      ${ot({iconName:"layers",title:s?"\u8B80\u53D6\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline\u2026":"\u5C1A\u7121\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684\u7248\u672C\u5316\u7D22\u5F15\u7D00\u9304\u3002":"\u57F7\u884C\u300CQdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A host/model\u3001Blue-Green collection \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002"})}
    </div>`;let i=n.find(S=>String(S.id)===String(t))||e?.latest||n[n.length-1],o=i?.pipeline&&typeof i.pipeline=="object"?i.pipeline:null,m=[...n].reverse().map(S=>{let x=Number(S.pipeline?.version_id||S.version_id||0),O=x?`v${String(x).padStart(3,"0")}`:"\u7D22\u5F15";return`<option value="${r(String(S.id))}" ${String(S.id)===String(i.id)?"selected":""}>${r(`${$e(S.started_at)} \xB7 ${O} \xB7 ${ct(S.duration_ms)}`)}</option>`}).join(""),f=Number(o?.version_id||i.version_id||0),p=f?`v${String(f).padStart(3,"0")}`:"\u2014",$=o?.host||{},b=Ji($),u=o?.model||i.model||"\u2014",h=Number(o?.total_ms)||Number(i.duration_ms)||0,w=Array.isArray(o?.stages)?o.stages:[],_=w.map((S,x)=>({...S,ms:Math.max(0,Number(S.duration_ms)||0),color:Qi[x%Qi.length]})).filter(S=>S.ms>0).map(S=>`<span class="index-pipeline-seg" style="width:${(S.ms/Math.max(1,h)*100).toFixed(2)}%;background:${r(S.color)}" title="${r(`${S.label} ${ct(S.ms)}`)}"></span>`).join(""),L=w.map((S,x)=>{let O=Math.max(0,Number(S.duration_ms)||0),ie=h>0?O/h*100:0,J=S.host&&typeof S.host=="object"?S.host:null;return`<div class="index-pipeline-row">
        <span class="index-pipeline-step">${String(x+1).padStart(2,"0")}</span>
        <div class="index-pipeline-copy">
          <div class="index-pipeline-title">
            <strong>${r(S.label||S.key||"\u968E\u6BB5")}</strong>
            ${Ge(S.status||"success")}
          </div>
          <span class="index-pipeline-detail">${r(S.detail||"\u2014")}</span>
          ${J?`<span class="index-pipeline-host">${g("server",12)} ${r(Ji(J))} \xB7 ${r(S.model||u)}</span>`:""}
        </div>
        <div class="index-pipeline-time">
          <strong>${ct(O)}</strong>
          <span>${ie.toFixed(1)}%</span>
        </div>
      </div>`}).join("");return`<section class="index-perf-panel index-pipeline-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</div>
        <div class="index-perf-sub">Blue-Green collection\u3001host/model \u8207\u968E\u6BB5\u8017\u6642</div>
      </div>
      <div class="index-pipeline-actions">
        <select class="select index-pipeline-select" data-index-pipeline-select aria-label="\u9078\u64C7\u7D22\u5F15 Pipeline \u7D00\u9304">${m}</select>
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${g("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span></button>
      </div>
    </div>
    ${o?`<div class="index-pipeline-meta">
            <span><strong>\u7248\u672C</strong> ${r(p)}</span>
            <span><strong>collection</strong> ${r(String(o.collection||"\u2014"))}</span>
            <span><strong>\u6A21\u5F0F</strong> ${r(String(o.build_mode||"\u2014"))}</span>
            <span><strong>\u672C\u6B21</strong> ${o.resumed?`\u63A5\u7E8C\uFF08\u5DF2\u7D22\u5F15 ${d(o.resumed_indexed)} \u7B46\uFF09`:"\u65B0\u5EFA\u7248\u672C"}</span>
            <span><strong>Host</strong> ${r(b)}</span>
            <span><strong>Model</strong> ${r(String(u))}</span>
            <span><strong>\u7E3D\u8017\u6642</strong> ${ct(h)}</span>
          </div>
          <div class="index-pipeline-bar">${_}</div>
          <div class="index-pipeline-list">${L}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B Pipeline \u968E\u6BB5\u8CC7\u6599\uFF1B\u4E0B\u4E00\u6B21 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u6703\u8A18\u9304 host/model \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002</div>'}
  </section>`}function cd(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${d(i)}\u2013${d(o)} / ${d(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Wi.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${g("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${g("chevronRight",13)}</button>
    </div>
  </div>`}function dd(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"#65a30d":t.includes("judgment.rag")?"#8b5cf6":t.includes("judgment.web.app")?"#3b82f6":t.includes("judgment.web.query")?"#d97706":t.includes("judgment.judgment_index")?"#0d9488":"#64748b"}function ud(e){let t=Wn(e),s=Math.max(0,Math.min(8,Number(e.depth)||0));return{key:"segment",label:`${"\u203A ".repeat(s)}${e.name||"unnamed"}`,hint:[e.module||"\u2014",e.function||"\u2014"].join(" \xB7 "),color:dd(e),spans:[{...t,status:e.status||"ok",error:e.error,metadata:e.metadata||{},params:e.params||{},started_at:e.started_at,finished_at:e.finished_at}],start:t.offset,end:t.end,duration:t.duration}}function Oa(e){return(e||[]).map(ud)}function pd(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((b,u)=>Number(b.seq)-Number(u.seq)):[],n=s?.summary||{},i=Array.isArray(n.models)?n.models:[],o=s?.client||{},l=s?.metadata||{},m=l.question||"",f=l.answer||"",p=m||f?`<div class="perf-flow-qa">
          ${m?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${r(m)}</span></div>`:""}
          ${f?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${r(f)}</span></div>`:""}
        </div>`:"",$=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(b=>(Number(b.offset_ms)||0)+(Number(b.duration_ms)||0)),1);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${r(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${r(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${r(e.method||"")} ${r(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${$e(e.started_at)}</span>
      <span class="perf-record-duration">${de(e.duration_ms)}</span>
      ${Ge(e.status)}
      <span class="perf-record-chevron">${g("chevronRight",14)}</span>
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
      ${p}
      ${i.length?`<div class="chips perf-record-models">${i.map(b=>`<span class="chip">${r(b)}</span>`).join("")}</div>`:""}
      ${a.length?Es(Oa(a),$,"\u6B64 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002"):`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${r(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${r(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var Vi={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",rerank:"Reranker",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"};function md(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}var gd={embedding:"#3984c6",retrieval:"#d97706",rerank:"#8b5cf6",context:"#64748b",llm:"#16a34a",validation:"#8b5cf6"};function fd(e,t){let s=Date.parse(e.started_at||""),a=Date.now(),n=Array.isArray(e.stage_order)?[...e.stage_order]:Object.keys(Vi);for(let f of t)f.stage&&!n.includes(f.stage)&&n.push(f.stage);let i=[],o=0;for(let f of n){let p=t.filter(u=>u.stage===f);if(!p.length)continue;let $=p.map(u=>{let h=Date.parse(u.started_at||""),w=Number.isFinite(s)&&Number.isFinite(h)?Math.max(0,h-s):0,_=Math.max(0,Number(u.duration_ms)||0);u.status==="running"&&Number.isFinite(h)&&(_=Math.max(_,a-h));let L=w+_;return o=Math.max(o,L),{offset:w,end:L,duration:_,status:u.status==="failed"?"error":u.status==="running"?"running":"ok",started_at:u.started_at,finished_at:u.finished_at,error:u.error_message,metadata:{...u.details||{},model:u.model,status:u.status,progress:Number(u.progress)||0,module:u.module,function:u.function},params:{model:u.model}}}),b=$.reduce((u,h)=>u+h.duration,0);i.push({key:"test_stage",label:Vi[f]||f,hint:`${$.length} \u500B\u7A0B\u5E8F`,color:gd[f]||"#64748b",spans:$,start:$.length?Math.min(...$.map(u=>u.offset)):null,end:$.length?Math.max(...$.map(u=>u.end)):null,duration:b})}let l=e.status==="running"&&Number.isFinite(s)?Math.max(0,a-s):0,m=Math.max(Number(e.total_ms)||0,l,o,1);return{stages:i,total:m}}function Rs(e,t,s,a={}){let n=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(L=>`<option value="${r(L.run_id)}" ${L.run_id===s?"selected":""}>${r(md(L.status))} \xB7 ${r((L.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${r($e(L.started_at))}</option>`)].join(""),o=n?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${g("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${g("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?Ge(e.status):""}</div>
      <div class="test-flow-question">${e?r(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${ot({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let m=Array.isArray(e.steps)?e.steps:[],f=fd(e,m),p=e.models||{},$=e.status==="running"?`${de(f.total)}\uFF08\u4F30\u7B97\uFF09`:de(e.total_ms),b=m.find(L=>L.stage==="llm"&&L.model===e.summary?.primary_model)||m.find(L=>L.stage==="llm"&&L.details?.answer_preview),u=String(b?.details?.provider_name||"").trim(),h=u&&e.summary?.primary_model?`${u}:${e.summary.primary_model}`:e.summary?.primary_model||"",w=e.answer||b?.details?.answer_preview||"",_=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${h?`<span class="mono">${r(h)}</span>`:""}
    </div>
    <p>${w?r(w):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${r(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${r($e(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${$}</span>
      <span><strong>Embedding</strong> ${Array.isArray(p.embedding)?p.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(p.llm)?p.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${r(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${_}
    ${f.stages.length?Es(f.stages,f.total,"\u6E2C\u8A66 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B\u7A0B\u5E8F\u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u6A21\u578B\u3001\u72C0\u614B\u3001\u9032\u5EA6\u3001module\uFF0Ffunction \u8207\u932F\u8AA4\u3002"):'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":n?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${h?`<span class="mono">primary=${r(h)}</span>`:""}
    </div>
  </div>`}function bd(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},n=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${Ge(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${d(e.total)} \u7B46\u7B26\u5408 \xB7 ${de(e.duration_ms)} \xB7
          \u6BCF\u6B21\u57F7\u884C\u6309\u9215\u7684\u5B8C\u6574 Flow
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${g("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${g("file",14)}<span>JSON</span></button>
      </div>
    </div>
    ${s.length?`<div class="summary-strip">${s.map(i=>`<div class="summary-item">
                <div class="summary-label">${r(i.label)}</div>
                <div class="summary-value">${r(i.value)}</div>
              </div>`).join("")}</div>`:""}
    ${od(n)}
    ${ad(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>pd(i,o)).join(""):ot({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${cd(e)}
    <details class="perf-query-details">
      <summary>\u67E5\u8A62\u8A9E\u53E5\u8207\u8B66\u544A</summary>
      <div class="query-box">
        <pre class="query-code">${r(e.query_text||"\u2014")}</pre>
        <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
          ${g("copy",12)}<span>\u8907\u88FD</span>
        </button>
      </div>
      ${Array.isArray(e.warnings)&&e.warnings.length?`<div class="warnings">${e.warnings.map(i=>`<div class="warning-line">${r(i)}</div>`).join("")}</div>`:""}
    </details>
  </div>`}async function hd(e,t){let s=!1,a=Vn(),n={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null,m=[],f="",p=!1,$=null,b=!1,u=null,h="",w=!1,_=null,L=!1;e.innerHTML=`<section class="page data-page performance-page">
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
          ${g("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
            <span class="status-tab-icon">${g("activity",15)}</span>
            <span class="status-tab-copy"><strong>\u6548\u80FD\u7E3D\u89BD</strong><small>Flow\u3001\u5340\u6BB5\u8017\u6642\u8207\u7D22\u5F15\u6548\u80FD</small></span>
          </button>
          <button class="status-tab" type="button" data-performance-tab="pipeline">
            <span class="status-tab-icon">${g("activity",15)}</span>
            <span class="status-tab-copy"><strong>RAG Pipeline</strong><small>Span waterfall\u3001Token \u8207 TTFT</small></span>
          </button>
          <button class="status-tab" type="button" data-performance-tab="index-pipeline">
            <span class="status-tab-icon">${g("layers",15)}</span>
            <span class="status-tab-copy"><strong>\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</strong><small>Host\uFF0FModel\u3001Blue-Green \u8207\u968E\u6BB5\u8017\u6642</small></span>
          </button>
          <button class="status-tab" type="button" data-performance-tab="benchmark">
            <span class="status-tab-icon">${g("brain",15)}</span>
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
                    ${g("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
                  </button>
                </div>
              </form>
              <div class="sidebar-note">Flow \u5BEB\u5165 PostgreSQL \u7684 performance_records.flow\uFF08JSON\uFF09\uFF0C\u9810\u8A2D\u4FDD\u7559\u81F3\u5C11 90 \u5929\uFF1B\u53EF\u4F9D\u6A21\u578B\u3001\u7A0B\u5E8F\u3001\u6A21\u7D44\u8207\u8017\u6642\u7BE9\u9078\u3002</div>
            </aside>
            <section class="query-main" id="performance-main" aria-label="\u6548\u80FD\u5831\u8868" aria-live="polite">
              <div id="performance-test-flow"></div>
              <div id="performance-report">${Zs({label:"\u6548\u80FD\u5831\u8868"})}</div>
            </section>
          </div>
        </div>
        <div id="performance-panel-pipeline" hidden></div>
        <div id="performance-panel-index-pipeline" hidden></div>
        <div id="performance-panel-benchmark" hidden></div>
      </section>
    </div>
  </section>`;let S=e.querySelector("#performance-filter-fields"),x=e.querySelector("#performance-filter-form"),O=e.querySelector("#performance-test-flow"),ie=e.querySelector("#performance-report"),J=e.querySelector("#performance-panel-pipeline"),he=e.querySelector("#performance-panel-index-pipeline"),me=e.querySelector("#performance-meta"),Z=e.querySelector("#performance-refresh"),j=[...e.querySelectorAll("[data-performance-tab]")],A={overview:e.querySelector("#performance-panel-overview"),pipeline:e.querySelector("#performance-panel-pipeline"),"index-pipeline":e.querySelector("#performance-panel-index-pipeline"),benchmark:e.querySelector("#performance-panel-benchmark")},E="overview",X=k=>{E=k;for(let P of j){let K=P.dataset.performanceTab===k;P.classList.toggle("is-active",K),K?P.setAttribute("aria-current","page"):P.removeAttribute("aria-current")}for(let[P,K]of Object.entries(A))K&&(K.hidden=P!==k);k==="benchmark"?me.textContent="BENCHMARK \xB7 RAG":k==="pipeline"?me.textContent="PERFORMANCE \xB7 RAG WATERFALL":k==="index-pipeline"?me.textContent="PERFORMANCE \xB7 INDEX PIPELINE":l&&(me.textContent=`PERFORMANCE \xB7 ${d(l.total)} \u7B46`)},W=Li(e,{onNavigate:k=>X(k)}),B=()=>{J&&(J.innerHTML=sd(m,f,p,$))},le=async({force:k=!1}={})=>{if(!(s||p)){if(b&&!k){B();return}p=!0,m.length||B();try{let P=await V.performance({keyword:"/api/rag"},1,50);if(s)return;let K=(Array.isArray(P.rows)?P.rows:[]).filter(H=>H.flow&&(String(H.path||"").includes("/api/rag")||String(H.process||"").includes("RAG")));m=K,(!f||!K.some(H=>String(H.id)===String(f)))&&(f=K[0]?String(K[0].id):""),$=null,b=!0}catch(P){if(s)return;$=P}finally{s||(p=!1,B())}}},ge=()=>{he&&(he.innerHTML=ld(u,h,w,_))},F=async({force:k=!1}={})=>{if(!(s||w)){if(L&&!k){ge();return}w=!0,u||ge();try{let P=await V.performance({},1,1);if(s)return;u=P.index_pipeline||P.index_stats||null;let K=Array.isArray(u?.runs)?u.runs:[];(!h||!K.some(H=>String(H.id)===String(h)))&&(h=u?.latest?String(u.latest.id):""),_=null,L=!0}catch(P){if(s)return;_=P}finally{s||(w=!1,ge())}}},fe=k=>{X(k),k==="benchmark"&&W.show(),k==="pipeline"&&le(),k==="index-pipeline"&&F()};e.addEventListener("click",k=>{let P=k.target.closest("[data-performance-tab]");P&&fe(P.dataset.performanceTab||"overview")}),J?.addEventListener("change",k=>{k.target.matches("[data-rag-trace-select]")&&(f=String(k.target.value||""),B())}),J?.addEventListener("click",k=>{k.target.closest('[data-action="refresh-rag-waterfall"]')&&le({force:!0})}),he?.addEventListener("change",k=>{k.target.matches("[data-index-pipeline-select]")&&(h=String(k.target.value||""),ge())}),he?.addEventListener("click",k=>{k.target.closest('[data-action="refresh-index-pipeline"]')&&F({force:!0})});let ee=null,xe=[],ve="",ae=null,ne="",pe=()=>{S.innerHTML=Jc(n,a)},be=()=>{let k=JSON.stringify({selected:ve,tick:ee?.status==="running"?Math.floor(Date.now()/1e3):0,runs:xe.map(P=>`${P.run_id}:${P.status}`),run:ee?{run_id:ee.run_id,status:ee.status,progress:ee.progress,total_ms:ee.total_ms,steps:(ee.steps||[]).map(P=>`${P.stage}:${P.model}:${P.status}:${P.progress}:${P.duration_ms}`)}:null});k!==ne&&(ne=k,O.innerHTML=Rs(ee,xe,ve))},_e=async()=>{try{let k=await V.testRuns(30);if(s)return;xe=Array.isArray(k.runs)?k.runs:[]}catch{if(s)return;xe=[]}},ke=async(k=null)=>{try{let P=k&&!ve?k:ve?await V.testRun(ve):await V.testRunCurrent();if(s)return;ee=P.run||null,!ve&&ee&&ee.status!=="running"&&!xe.some(K=>K.run_id===ee.run_id)&&await _e(),be()}catch{if(s)return;ee=null,be()}},Ne=async(k=null)=>{s||ve||await ke(k)},Oe=()=>{s||ae||(ae=mt("test-runs",(k,P)=>Ne(P?.snapshot||null)))};O.addEventListener("change",async k=>{k.target.id==="test-run-select"&&(ve=String(k.target.value||""),await ke())}),O.addEventListener("click",async k=>{k.target.closest("#test-flow-refresh")&&(ve="",await _e(),await ke())});let I=async(k=i,{quiet:P=!1}={})=>{i=Math.max(1,Number(k)||1),a=zi();let K=ie.querySelector(".report-card"),H=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!K?ie.setAttribute("aria-busy","true"):(ie.removeAttribute("aria-busy"),ie.innerHTML=Zs({label:"\u6548\u80FD\u5831\u8868"}));let Se=e.querySelector("#performance-run");P||Me(Se,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Pe=await V.performance(a,i,o);if(s)return;if(l=Pe,Pe.index_pipeline){u=Pe.index_pipeline;let Ie=Array.isArray(u.runs)?u.runs:[];(!h||!Ie.some(ut=>String(ut.id)===String(h)))&&(h=u.latest?String(u.latest.id):""),L=!0,_=null}if(i=Number(Pe.page)||i,o=Number(Pe.page_size)||o,ie.removeAttribute("aria-busy"),ie.innerHTML=bd(Pe),H!==null){let Ie=ie.querySelector("[data-page-size]");Ie&&(Ie.value=String(o),Ie.focus({preventScroll:!0}))}me.textContent=`PERFORMANCE \xB7 ${d(Pe.total)} \u7B46`,me.className="badge badge-neutral badge-mono"}catch(Pe){if(s)return;ie.removeAttribute("aria-busy"),ie.innerHTML=Ca(Pe,{label:"\u6548\u80FD\u5831\u8868"}),D(Pe.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||Me(Se,!1)}},G=async()=>{try{n=await V.performanceOptions()}catch{n={processes:[],modules:[],statuses:[],methods:[],models:[]}}pe()};return x.addEventListener("submit",k=>{k.preventDefault(),I(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=Vn(),i=1,pe(),I(1)}),Z.addEventListener("click",async()=>{if(E==="pipeline"){Me(Z,!0,"\u6574\u7406\u4E2D\u2026");try{await le({force:!0})}finally{s||Me(Z,!1)}return}if(E==="index-pipeline"){Me(Z,!0,"\u6574\u7406\u4E2D\u2026");try{await F({force:!0})}finally{s||Me(Z,!1)}return}if(E==="benchmark"){Me(Z,!0,"\u6574\u7406\u4E2D\u2026");try{await W.refresh()}finally{s||Me(Z,!1)}return}a=zi(),Z.disabled=!0,Me(Z,!0,"\u6574\u7406\u4E2D\u2026"),await G(),await _e(),s||await ke(),s||await I(1),s||(Z.disabled=!1,Me(Z,!1))}),ie.addEventListener("click",async k=>{let P=k.target.closest("[data-action]");if(!P||!l)return;let K=P.dataset.action;if(K==="retry"){I(i);return}if(K==="prev-page"){I(Math.max(1,Number(l.page)-1),{quiet:!0});return}if(K==="next-page"){let H=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));I(Math.min(H,Number(l.page)+1),{quiet:!0});return}if(K==="copy-query"){let H=await xs(l.query_text||"");D(H?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",H?"ok":"warn");return}if(K==="export-json"){let H=`performance-page-${l.page}.json`;Ct(H,JSON.stringify(Ia(l),null,2),"application/json;charset=utf-8"),D(`\u5DF2\u532F\u51FA ${H}`,"ok");return}if(K==="export-csv"){let H=`performance-page-${l.page}.csv`;Ct(H,Pa(l),"text/csv;charset=utf-8"),D(`\u5DF2\u532F\u51FA ${H}`,"ok")}}),ie.addEventListener("change",k=>{k.target.matches("[data-page-size]")&&(o=Number(k.target.value)||25,Wi.includes(o)||(o=25),I(1,{quiet:!0}))}),await Promise.allSettled([G(),_e()]),s||(await ke(),await I(1),Oe()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,ae&&ae(),W.destroy()}}var vd=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5F9E\u696D\u4EBA\u54E1\u6709\u90A3\u4E9B\u898F\u5B9A\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function $d(){return`<div class="answer-placeholder">
    <span class="empty-icon">${g("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function er(){return`<section class="card answer-card rag-empty-answer">${$d()}</section>`}function ao(e,t){return`<div class="rag-turn">
    <div class="rag-user-bubble">${r(e)}</div>
    <section class="card rag-assistant-turn" data-rag-answer>${t}</section>
  </div>`}function yd(e,t){return Promise.race([e,new Promise((s,a)=>{window.setTimeout(()=>a(new Error("pipeline lookup timed out")),t)})])}async function wd(e){if(!e||e.pipeline_flow)return e;let t=String(e._client_request_id||e.request_id||"").trim();if(!t)return e;for(let s=0;s<3;s+=1){try{let a=await yd(V.performance({keyword:t},1,5),1800),n=(Array.isArray(a.rows)?a.rows:[]).find(i=>String(i.request_id||"")===t&&i.flow&&typeof i.flow=="object");if(n)return e.pipeline_flow=n.flow,e}catch{}s<2&&await new Promise(a=>window.setTimeout(a,250))}return e}function _d(e){return{status:e.status,answer:e.answer,answer_source:e.answer_source,notice:e.notice,citations:Array.isArray(e.citations)?e.citations:[],judgments:Array.isArray(e.judgments)?e.judgments:[],law_sources:Array.isArray(e.law_sources)?e.law_sources:[],matched_terms:Array.isArray(e.matched_terms)?e.matched_terms:[],law_answer:e.law_answer,law_framework:e.law_framework,llm_model:e.llm_model,embedding_model:e.embedding_model,duration_ms:e.duration_ms,show_sources:e.show_sources,pipeline_flow:e.pipeline_flow||null,test_run:e.test_run||null,partial:!1,streaming:!1}}var kd={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"llama-server embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"llama-server LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function Sd(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`llama-server run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`llama-server embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:kd[t]||t||"backend step"}function no(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function ro(e){let t=Number(e);return Number.isFinite(t)?`${d(Math.max(0,Math.round(t)))} ms`:"\u2014"}function tr(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function xd(){return`<div class="rag-process is-open" id="rag-process">
    <div class="rag-process-control">
      <button type="button" class="rag-process-toggle" id="rag-process-toggle"
        aria-expanded="true" aria-controls="rag-process-body" title="\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B">
        <span class="rag-process-toggle-label-collapsed">\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
        <span class="rag-process-toggle-label-expanded">\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
        ${g("chevronDown",11)}
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
  </div>`}function Ad(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),n=performance.now(),i=new Map,o=new Map,l=(u,h,w)=>{let _=u.querySelector(h);_&&(_.textContent=w)},m=u=>{if(u.failed){l(u.element,".rag-process-meta","\u5931\u6557");return}if(u.hasChildren){l(u.element,".rag-process-meta","");return}l(u.element,".rag-process-meta",ro(u.durationMs))},f=u=>{let h=u-1,w=[...i.values()].reverse();for(let _ of w){if(h<0)break;_.depth<=h&&(_.hasChildren||(_.hasChildren=!0,_.element.dataset.hasChildren="true",_.finished&&m(_)),h=_.depth-1)}},p=u=>{if(!s)return null;let h=String(u?.seq??`step-${i.size+1}`),w=i.get(h);if(!w){let _=Math.max(0,Math.min(6,Number(u?.depth)||0));f(_);let L=document.createElement("div");L.className="rag-process-item is-running",L.dataset.processKey=h,L.style.setProperty("--depth",String(_)),L.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(L),w={element:L,depth:_,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(h,w)}return l(w.element,".rag-process-label",Sd(u)),w.element.title=no(u),w};return{step:u=>{let h=u?.segment;if(!h)return;o.set(String(h.seq??h.name??o.size),{...h});let w=p(h);if(w){if(u.type==="segment_start"){w.element.classList.add("is-running"),l(w.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(u.type==="segment_end"){let _=h.status==="error";w.element.classList.remove("is-running"),w.element.classList.toggle("is-error",_),w.finished=!0,w.failed=_,w.durationMs=Number(h.duration_ms)||0,m(w),w.element.title=[no(h),_&&h.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(u=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(L=>{L.classList.remove("is-running");let S=L.dataset.hasChildren==="true";l(L,".rag-process-meta",S?"":u?"\u5B8C\u6210":"\u4E2D\u65B7")});let h=s?.children.length||i.size,w=ro(Math.max(0,performance.now()-n));a&&(a.textContent=u?`\u5B8C\u6210 \xB7 ${h} \u6B65 \xB7 ${w}`:`\u5931\u6557 \xB7 ${h} \u6B65`);let _=[...o.values()].filter(L=>L?.name).sort((L,S)=>Number(L.offset_ms||0)-Number(S.offset_ms||0));if(s&&_.length){let L=Math.max(1,..._.map(S=>Number(S.end_offset_ms)||(Number(S.offset_ms)||0)+(Number(S.duration_ms)||0)));s.classList.add("is-waterfall"),s.innerHTML=Es(Oa(_),L,"\u5F8C\u7AEF Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B span \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002")}return t.classList.add("is-complete"),tr(t,!1),t.outerHTML},collapse:()=>tr(t,!1)}}function qd(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${g("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":xd()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${r(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function io(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function za(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let n=String(e||"").trim();return n?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t||n)}"
    data-source-type="${r(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(a||n)}</button>`:""}function uo(e){let t=String(e?.law_name||"").trim(),s=String(e?.article_no||"").replace(/\s+/g,"");if(!t||!s)return"";let a=(Array.isArray(e?.paragraphs)?e.paragraphs:[]).map(i=>String(i||"").trim()).filter(Boolean),n=`${t}${s}${a.join("\u3001")}`;return`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t)}"
    data-source-type=""
    data-article-no="${r(s)}"
    title="\u9EDE\u64CA\u67E5\u770B ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(n)}</button>`}function po(e){let t=String(e?.citation_status||"");return t==="cited"?"\u7B54\u6848\u5F15\u7528":t==="provided_not_cited"?"\u5DF2\u63D0\u4F9B\u7D66\u6A21\u578B\uFF0C\u7B54\u6848\u672A\u5F15\u7528":t==="reference_only"||e?.used_for_generation===!1?"\u50C5\u4F9B\u53C3\u8003\uFF08\u672A\u9032\u5165\u751F\u6210 prompt\uFF09":e?.used_for_generation===!0?"\u5DF2\u63D0\u4F9B\u7D66\u6A21\u578B":""}function Md(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map($=>`<span>${r($)}</span>`).join(""),n=po(e),i=n?`<span>${r(n)}</span>`:"",o=(Array.isArray(e.law_citations)?e.law_citations:[]).map($=>uo($)).filter(Boolean).slice(0,12).join(""),l=o||(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map($=>za($)).join(""),m=o?'<div class="citation-meta"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':"",f=e.jid?` data-action="open-parquet-judgment"
        data-jid="${r(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${r(e.jid)}"`:"",p=e.pdf_url?`<a class="citation-link" href="${r(e.pdf_url)}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${g("external",11)}</a>`:"";return`<article class="citation">
    <span class="citation-index">[${e.index??t+1}]</span>
    <div class="citation-body">
      <div class="citation-head"${f}>
        <h4 class="citation-name">${r(e.jid||"\u672A\u77E5\u6848\u865F")}</h4>
        <div class="citation-meta">${a||"<span>\u5224\u6C7A metadata</span>"}${i}</div>
        ${e.title?`<div class="citation-meta"><span>\u6848\u7531\uFF1A${r(e.title)}</span></div>`:""}
      </div>
      ${m}
      ${l?`<div class="chips" style="margin-top:8px">${l}</div>`:""}
      ${e.snippet?`<p class="citation-snippet">${r(e.snippet)}</p>`:""}
    </div>
    <div class="citation-links">${p}</div>
  </article>`}function Ld(e){let t=[e.court,e.jdate].filter(Boolean).map(n=>`<span>${r(n)}</span>`).join(""),s=[e.vector_score!==null&&e.vector_score!==void 0?`\u5411\u91CF ${Number(e.vector_score).toFixed(4)}`:"",e.rerank_score!==null&&e.rerank_score!==void 0?`rerank ${Number(e.rerank_score).toFixed(4)}`:""].filter(Boolean).map(n=>`<span>${r(n)}</span>`).join("");return`<article class="citation reference-judgment">
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
  </article>`}function jd(e,t){let s=[e.law_level,e.law_category,e.article_count?`${d(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${r(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${g("external",11)}</a>`:"",n=e.law_key||e.law_name||"",i=n?` data-action="open-law-source"
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
  </article>`}function Td(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",n=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${r(s)}</span>`,a,e.law_category,e.article_count?`${d(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${Et(e.law_modified_date)}`:"",po(e)].filter(Boolean).map(u=>`<span>${u}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${r(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${r(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${r(o.entity||"")}\u300D\u7684\u5224\u6C7A ${d(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${d(o.law_count||0)} \u6B21</span>
      </div>`:"",m=e.law_key||"",f=e.source_type||"",p=(Array.isArray(e.articles)?e.articles:[]).map(u=>{let h=String(u.article_no||"");return`<div class="law-source-article"${m&&h?` data-action="open-law-source"
        data-law-key="${r(m)}"
        data-source-type="${r(f)}"
        data-article-no="${r(h)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${r(h)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} ${r(h)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${r(u.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${r(u.article_content||"")}</p>
      </div>`}).join(""),$=e.law_url?`<a class="citation-link" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${g("external",11)}</a>`:"",b=e.law_key?` data-action="open-law-source"
        data-law-key="${r(e.law_key)}"
        data-source-type="${r(e.source_type||"")}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u672C\u5730 Parquet \u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation law-source">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body"${b}>
      <h4 class="citation-name">${r(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${n}</div>
      ${i}
      ${l}
      ${p}
    </div>
    <div class="citation-links">${$}</div>
  </article>`}function Nd(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function Ed(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${r(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",n=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(n==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),m=s.index!=null?`<span class="law-answer-index">[${r(String(s.index))}]</span>`:"",f=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${r(a)}"
            data-source-type="${r(n)}"
            title="\u9EDE\u64CA\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587">${r(i)}</button>`:`<strong>${r(i)}</strong>`,p=Array.isArray(s.articles)?s.articles:[],$=p.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${p.map(b=>{let u=String(b.article_no||"").trim(),h=Nd(b.article_content);return!a||!u?`<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${r(u||"\u689D\u6587")}</span>
                  <span class="law-answer-article-text">${r(h)}</span>
                </div>`:`<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${r(a)}"
                data-source-type="${r(n)}"
                data-article-no="${r(u)}"
                title="\u9EDE\u64CA\u67E5\u770B ${r(u)} \u7684\u5B8C\u6574\u5167\u5BB9"
                aria-label="\u958B\u555F ${r(i)} ${r(u)} \u7684\u5B8C\u6574\u689D\u6587">
                <span class="law-answer-article-no">${r(u)}</span>
                <span class="law-answer-article-text">${r(h)}</span>
              </button>`}).join("")}</div>`:"";return`<div class="law-answer-source">
        <div class="law-answer-source-head">
          ${f}
          <span class="law-answer-source-meta">\uFF08${r(o)}\uFF0C${d(l)} \u689D\uFF09</span>
          ${m}
        </div>
        ${$}
      </div>`}).join("")}</div>`}function Rd(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let n=s.get(String(a));return n?.law_key?za(a,{lawKey:n.law_key,sourceType:n.source_type||""}):`<span class="chip">${r(a)}</span>`}).join("")}</div>`}function Cd(e){let t=String(e||"");return t==="operational"?"is-ok":t==="standby"?"is-idle":"is-down"}function Pd(e){let t=String(e||"");return t==="operational"?"":t==="standby"?"\u5099\u63F4":t==="disabled"?"\u505C\u7528":t==="not_configured"?"\u672A\u8A2D\u5B9A":"\u96E2\u7DDA"}function oo(e,{fallback:t=!1}={}){if(!e)return`<span class="rag-model-cell is-empty">
      <span class="rag-model-state is-idle" aria-hidden="true"></span>
      <span class="rag-model-name">\u672A\u8A2D\u5B9A</span>
    </span>`;let s=String(e.label||"").trim()||[e.host,e.model].filter(Boolean).join(":"),a=String(e.status||""),n=!["operational","standby"].includes(a),i=t&&!n?"\u5099\u63F4":Pd(a),o=n?"is-down":t?"is-idle":Cd(a),l=[s,e.url,i].filter(Boolean).join(" \xB7 ");return`<span class="rag-model-cell" title="${r(l)}">
    <span class="rag-model-state ${o}" aria-hidden="true"></span>
    <span class="rag-model-name">${r(s)}</span>
    ${i?`<span class="rag-model-note">${r(i)}</span>`:""}
  </span>`}function Id(e,t){let s=Array.isArray(e)?e:[],a=[{kind:"chat",label:"Chat"},{kind:"embedding",label:"Embedding"},{kind:"rerank",label:"Rerank"}],n=new Map(s.map(o=>[String(o.kind||""),o])),i=a.map(o=>{let l=n.get(o.kind)||o;return`<tr>
        <td class="rag-model-kind">${r(l.label||o.label)}</td>
        <td>${oo(l.active)}</td>
        <td>${oo(l.fallback,{fallback:!0})}</td>
      </tr>`}).join("");return`<div class="rag-model-strip">
    <div class="rag-model-strip-head">
      <span class="rag-model-strip-title">${g("layers",13)} Models</span>
      <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
        data-rag-action="refresh-models"
        ${t?"disabled":""}>
        ${g("refresh",12)}<span>${t?"\u6AA2\u67E5\u4E2D\u2026":"\u91CD\u65B0\u6AA2\u67E5"}</span>
      </button>
    </div>
    <table class="rag-model-table">
      <thead><tr><th>\u6A21\u578B</th><th>\u4F7F\u7528\u4E2D</th><th>Fallback</th></tr></thead>
      <tbody>${i}</tbody>
    </table>
  </div>`}function Ha({tone:e,title:t,text:s,modelSummary:a=[],refreshing:n=!1}){let i=e==="ok"?"is-ok":e==="warn"?"is-warn":"is-info",o=e==="ok"?"check":e==="warn"?"alert":"info",l=e==="ok"?"badge-ok":e==="warn"?"badge-warn":"badge-info";return`<section class="rag-mode-card ${i}">
    <div class="rag-mode-head">
      <span class="rag-mode-icon" aria-hidden="true">${g(o,14)}</span>
      <div class="rag-mode-copy">
        <strong>${r(t)}</strong>
        <p>${r(s)}</p>
      </div>
      <span class="badge ${l}">3 \u500B\u6A21\u578B</span>
    </div>
    ${Id(a,n)}
  </section>`}function mo(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.reference_judgments)?e.reference_judgments:[],n=Array.isArray(e.law_sources)?e.law_sources:[],i=e.retrieval||{},o=Array.isArray(e.matched_terms)?e.matched_terms:[],l=e.status||"preview",m=!!e.partial,f=!!e.streaming,p=!!e.rerank_degraded,$=!!e.show_sources||!m,b=e.answer_source==="structured",u=String(e.law_answer||"").trim(),h=e.law_framework||null,w=Array.isArray(h?.rows)?h.rows:[],_=Array.isArray(h?.sources)?h.sources:[],L=w.length>0,S=!!u&&!b&&!L,x=s.filter(be=>be.used_for_generation===!0).length,O=s.some(be=>be.used_for_generation!==void 0),ie=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46${O?`\uFF08${x} \u7B46\u9032\u5165 prompt\uFF09`:""}</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((be,_e)=>Md(be,_e)).join("")}</div>`:"",J=i.judgment_limit_applied&&a.length?`<div class="reference-judgment-note">
          <span>\u672C\u984C\u4F9D\u984C\u610F\u4E3B\u8981\u8A62\u554F\u6CD5\u898F\u898F\u5B9A\uFF0C\u6545\u5224\u6C7A\u50C5\u986F\u793A ${s.length} \u7B46\u4F5C\u70BA\u53C3\u8003\u3002\u53E6\u6709 ${a.length} \u7B46\u76F8\u95DC\u5224\u6C7A\uFF08${a.some(be=>be.rerank_score!==null&&be.rerank_score!==void 0)?"\u4F9D rerank \u5206\u6578\u6392\u5E8F":"\u4F9D\u6AA2\u7D22\u5206\u6578\u6392\u5E8F"}\uFF09\uFF0C</span>
          <details class="reference-judgments">
            <summary>\u5C55\u958B\u67E5\u770B</summary>
            <div class="citation-list reference-judgment-list">${a.map(be=>Ld(be)).join("")}</div>
          </details>
        </div>`:"",he=n.length&&!S?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${n.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${n.map((be,_e)=>Td(be,_e)).join("")}</div>`:"",me=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((be,_e)=>jd(be,_e)).join("")}</div>`:"",Z=$?ie+J+he+me:"";!Z&&!m&&!S&&!L&&(Z=`<div class="answer-divider"></div>
      ${ot({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:l==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let j=Rd(o,n),A=e.test_run,E=String(e.llm_model||A?.primary_model||"").trim(),X=String(e.embedding_model||"").trim(),W=[E?`LLM\uFF1A${E}`:"",X?`Embedding\uFF1A${X}`:""].filter(Boolean).join(" \xB7 "),B=f||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",le=L?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${r(h.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${w.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${w.map(be=>`<tr>
                    <td>${r(be.law_name||"\u2014")}</td>
                    <td class="cell-number">${r(be.article_no||"\u2014")}</td>
                    <td>${r(be.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${_.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${_.map(be=>{let _e=String(be?.law_name||be||"").trim(),ke=be&&be.index!==null&&be.index!==void 0?` [${r(be.index)}]`:"";return za(_e,{label:`${_e}${ke}`})}).join("")}
              </div>`:""}
      </div>`:"",ge=e.answer_source==="llm"&&E?`<span class="answer-model" title="${r(W)}">${g("brain",11)}${r(E)}</span>`:b?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${g("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",F=f?`${E||"LLM"} \xB7 \u751F\u6210\u4E2D`:ge?E||"structured":"retrieval",fe=A?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${Ge(A.status)}
          <span class="mono">${r(A.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(A.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(A.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${r(A.primary_model||"\u2014")}</span>
          <span>${Number(A.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",ee=e.pipeline_flow&&typeof e.pipeline_flow=="object"?e.pipeline_flow:null,xe=!m&&ee?Fa(ee,{serverDurationMs:Number(e.duration_ms)||0,embedded:!0}):"",ae=String(e.answer||"").trim()||(f?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":m?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),ne=f?" data-partial-answer":"",pe=f?" is-streaming":"";return`${le}
      ${S?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${m&&!$?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${n.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${Ed(n,u)}</div>
            </div>`:""}
      <div class="answer-block">
        ${S||L?`<div class="answer-block-head">
                <span>${r(B)}</span>
                <span>${r(F)}</span>
              </div>`:""}
        <p class="answer-text${pe}"${ne}>${r(ae)}</p>
      </div>
      ${p?'<div class="answer-notice" data-rerank-degraded="true">\u6392\u5E8F\u7CBE\u7C21\u6A21\u5F0F\uFF1A\u672C\u6B21\u90E8\u5206 rerank \u903E\u6642\u6216\u964D\u7D1A\uFF0C\u4F86\u6E90\u53EF\u80FD\u4EE5\u5411\u91CF\u9806\u5E8F\u986F\u793A\u3002</div>':""}
      ${e.notice?`<div class="answer-notice">${r(e.notice)}</div>`:""}
      ${fe}
      ${j}
      ${Z}
      ${xe}`}function lo(e,t,s=""){let a=t.status||"preview",n=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),m=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),f=t.answer_source==="structured",p=t.answer_source==="llm"&&o?`<span class="answer-model" title="${r(m)}">${g("brain",11)}${r(o)}</span>`:f?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${g("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${g("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${Ge(a,n)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${p}
      </div>
      ${s}
    </div>
    <div class="answer-body">${mo(t)}</div>`}function Dd(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${g("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${Ee({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function Bd(e){let t=Array.isArray(e.turns)?e.turns:[],s=t.length?t[t.length-1].payload||{}:e.payload||{},a=Array.isArray(s.citations)?s.citations.length:0,n=Array.isArray(s.judgments)?s.judgments.length:0,i=Array.isArray(s.law_sources)?s.law_sources.length:0;return a+n+i}function Fd(e,t,s,a=null){let n=e.id??s,i=Bd(e),o=t.get(String(e.project_id||"")),l=Array.isArray(e.turns)?e.turns:[],m=e.updated_at||e.created_at,f=a!=null&&String(a)===String(n);return`<div class="rag-history-item${e.pinned?" is-pinned":""}${f?" is-active":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${r(String(n))}">
      <span class="history-question">${r(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${r(Hs(m))}</span>
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
        aria-pressed="${e.pinned?"true":"false"}">${g("pin",14)}</button>
      <button class="rag-history-more" type="button"
        data-rag-action="open-history-menu" data-history-id="${r(String(n))}"
        title="\u66F4\u591A\u64CD\u4F5C" aria-label="\u66F4\u591A\u64CD\u4F5C" aria-haspopup="menu" aria-expanded="false">${g("more",14)}</button>
    </div>
  </div>`}function co(e,t,s){let a=new Map;for(let i of t){let o=String(i.project_id||"");o&&a.set(o,(a.get(o)||0)+1)}let n=[`<button class="rag-project${s?"":" is-active"}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${s?"false":"true"}">
      <span class="rag-project-name">${g("grid",13)}<span>\u5168\u90E8</span></span>
      <span class="rag-project-count">${t.length}</span>
    </button>`];for(let i of e){let o=String(i.id),l=a.get(o)||0;n.push(`<button class="rag-project${s===o?" is-active":""}" type="button" data-rag-action="select-project" data-project-id="${r(o)}" aria-pressed="${s===o?"true":"false"}">
      <span class="rag-project-name">${g("folder",13)}<span>${r(i.name)}</span></span>
      <span class="rag-project-count">${l}</span>
    </button>`)}return e.length||n.push('<div class="rag-library-empty">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\u3002</div>'),n.push(`<div class="rag-project-add-wrap">
    <button class="rag-project-add" type="button" data-rag-action="show-project-form">${g("plus",13)}<span>\u5EFA\u7ACB\u5C08\u6848</span></button>
    <form class="rag-project-form" data-rag-form="project" hidden>
      <input class="input" type="text" name="project_name" maxlength="60" placeholder="\u5C08\u6848\u540D\u7A31" aria-label="\u5C08\u6848\u540D\u7A31" autocomplete="off" />
      <div class="rag-project-form-actions">
        <button class="btn btn-primary btn-sm" type="submit">\u5EFA\u7ACB</button>
        <button class="btn btn-ghost btn-sm" type="button" data-rag-action="cancel-project">\u53D6\u6D88</button>
      </div>
    </form>
  </div>`),n.join("")}async function Od(e){let t=!1,s=[],a=!1,n=[],i=!1,o="",l=8,m="",f=0,p=null,$=[],b=!1,u=!1,h={embedding:[],llm:[]},w=null,_=null,L=!1;e.innerHTML=`<section class="page rag-page">
    <div class="rag-layout">
      <aside class="rag-library" aria-label="\u5C0D\u8A71\u5EAB">
        <button class="rag-new-chat" type="button" data-rag-action="new-chat">
          <span class="rag-new-chat-mark">${g("plus",16)}</span>
          <span class="rag-new-chat-copy"><strong>\u65B0\u5C0D\u8A71</strong><small>\u958B\u59CB\u65B0\u7684\u6CD5\u5F8B\u6AA2\u7D22</small></span>
        </button>
        <div class="rag-library-context" id="rag-library-context" hidden></div>
        <section class="rag-library-section" data-rag-section="pinned">
          <button class="rag-library-head" type="button" data-rag-toggle="pinned" aria-expanded="true">
            <span class="rag-library-title">${g("pin",13)}\u5DF2\u91D8\u9078</span>
            <span class="rag-library-count" id="rag-pinned-count">0</span>
            ${g("chevronDown",12,"rag-library-chevron")}
          </button>
          <div class="rag-library-body" id="rag-pinned-body">
            <div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002</div>
          </div>
        </section>
        <section class="rag-library-section" data-rag-section="projects">
          <button class="rag-library-head" type="button" data-rag-toggle="projects" aria-expanded="true">
            <span class="rag-library-title">${g("folder",13)}\u5C08\u6848</span>
            <span class="rag-library-count" id="rag-projects-count">0</span>
            ${g("chevronDown",12,"rag-library-chevron")}
          </button>
          <div class="rag-library-body" id="rag-projects-body"></div>
        </section>
        <section class="rag-library-section rag-library-recent">
          <div class="rag-library-head is-static">
            <span class="rag-library-title">${g("history",13)}\u6700\u8FD1\u9805\u76EE <span class="rag-library-count" id="rag-recent-count">0</span></span>
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
      <div id="rag-mode-notice">${Ee({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
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
            ${g("sparkles",16)}<span>\u958B\u59CB\u6AA2\u7D22</span>
          </button>
        </div>
      </form>
      <div class="example-chips" id="example-chips" aria-label="\u7BC4\u4F8B\u554F\u984C">
        ${vd.map(c=>`<button class="example-chip" type="button" data-question="${r(c)}">${r(c)}</button>`).join("")}
      </div>
    </header>

    <section class="rag-conversation" id="rag-conversation" aria-live="polite">
      <div class="rag-turns" id="rag-turns">
        ${er()}
      </div>
      <form class="rag-followup" id="rag-followup-form" hidden>
        <label class="sr-only" for="rag-followup-question">\u7E7C\u7E8C\u63D0\u554F</label>
        <textarea class="rag-followup-input" id="rag-followup-question" name="question" rows="1"
          maxlength="500" placeholder="\u7E7C\u7E8C\u554F\u4E0B\u4E00\u500B\u554F\u984C\u2026" aria-label="\u7E7C\u7E8C\u63D0\u554F"></textarea>
        <div class="rag-followup-actions">
          <span class="rag-followup-hint"><kbd>Enter</kbd> \u9001\u51FA \xB7 <kbd>Shift</kbd> + <kbd>Enter</kbd> \u63DB\u884C</span>
          <button class="btn btn-primary" type="submit" id="rag-followup-submit">
            ${g("sparkles",15)}<span>\u7E7C\u7E8C\u6AA2\u7D22</span>
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
  </section>`;let S=e.querySelector("#rag-form"),x=e.querySelector("#rag-question"),O=e.querySelector("#rag-submit"),ie=e.querySelector(".rag-page"),J=e.querySelector("#rag-turns"),he=e.querySelector("#rag-followup-form"),me=e.querySelector("#rag-followup-question"),Z=e.querySelector("#rag-followup-submit"),j=e.querySelector("#rag-history"),A=e.querySelector("#rag-storage-note"),E=e.querySelector("#rag-clear-history"),X=e.querySelector(".rag-library"),W=e.querySelector("#rag-pinned-body"),B=e.querySelector("#rag-projects-body"),le=e.querySelector("#rag-pinned-count"),ge=e.querySelector("#rag-projects-count"),F=e.querySelector("#rag-recent-count"),fe=e.querySelector("#rag-library-context"),ee=e.querySelector("#rag-test-mode"),xe=e.querySelector("#rag-test-flow"),ve=e.querySelector("#rag-history-menu"),ae=e.querySelector("#rag-judgment-dialog"),ne=e.querySelector("#rag-law-dialog"),pe=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};ae?.addEventListener("close",pe),ne?.addEventListener("close",pe);let be=null,_e=null,ke,Ne=null,Oe=null,I=()=>{x.style.height="auto",x.style.height=`${Math.min(x.scrollHeight,220)}px`},G=()=>{me.style.height="auto",me.style.height=`${Math.min(me.scrollHeight,160)}px`},k=c=>{b=!!c,ie.classList.toggle("has-conversation",b)},P=()=>{b&&(he.hidden=!1,G())},K=()=>{he.hidden=!0},H=()=>{ve.hidden&&!Oe||(ve.hidden=!0,ve.innerHTML="",Oe&&Oe.setAttribute("aria-expanded","false"),Ne=null,Oe=null)},Re=(c,y)=>{let M=J.querySelector(".rag-empty-answer");M&&M.remove(),J.insertAdjacentHTML("beforeend",ao(c,y));let T=J.lastElementChild,C=T?.querySelector("[data-rag-answer]");return window.requestAnimationFrame(()=>{T?.scrollIntoView({behavior:"smooth",block:"start"})}),{turnElement:T,answerElement:C}},Se=()=>{J.innerHTML=$.length?$.map(c=>ao(c.question,lo(c.question,c.payload||{},""))).join(""):er()},Pe=c=>{let y=Array.isArray(c.turns)?c.turns:[];return y.length?(f+=1,rt(),bt(null),p=c.id??null,$=y.map(M=>({...M})),m=$[$.length-1]?.question||"",k(!0),Se(),P(),Ie(),Me(O,!1),Me(Z,!1),window.setTimeout(()=>{he.scrollIntoView({behavior:"smooth",block:"end"})},50),!0):!1},Ie=()=>{if(t)return;if(H(),!a){j.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',W.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',le.textContent="0",F.textContent="0",i&&(B.innerHTML=co(n,[],o));return}let c=n.find(Q=>String(Q.id)===o)||null;o&&!c&&(o="");let y=new Map(n.map(Q=>[String(Q.id),Q])),M=s.filter(Q=>!!Q.pinned),T=s.filter(Q=>!Q.pinned),C=o?T.filter(Q=>String(Q.project_id||"")===o):T,se=C.slice(0,l),U=(Q,ue)=>Fd(Q,y,ue,p);W.innerHTML=M.length?M.map(U).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',B.innerHTML=co(n,s,o),j.innerHTML=se.length?se.map(U).join(""):`<div class="rag-library-empty">${o?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u672A\u91D8\u9078\u7684\u9805\u76EE\u3002":M.length?"\u6700\u8FD1\u7684\u9805\u76EE\u90FD\u5DF2\u91D8\u9078\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,C.length>l&&j.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${d(C.length-l)} \u7B46</button>`),le.textContent=String(M.length),ge.textContent=String(n.length),F.textContent=String(C.length),c?(fe.hidden=!1,fe.innerHTML=`<span>${g("folder",12)}<strong>${r(c.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${g("x",12)}</button>`):(fe.hidden=!0,fe.innerHTML="")},ut=async()=>{try{let c=await ds("rag.projects",[]);n=Array.isArray(c)?c.map(y=>({id:String(y?.id||""),name:String(y?.name||"").trim()})).filter(y=>y.id&&y.name):[]}catch{n=[]}i=!0,t||Ie()},Ke=c=>{o=String(c||""),l=8,Ie()},st=()=>{let c=B.querySelector('[data-rag-form="project"]');c&&(c.hidden=!1,c.querySelector("input")?.focus())},qt=()=>{let c=B.querySelector('[data-rag-form="project"]');c&&(c.hidden=!0,c.reset())},Mt=async c=>{let y=c.elements.project_name,M=String(y?.value||"").trim();if(!M){D("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),y?.focus();return}if(n.some(C=>C.name.toLowerCase()===M.toLowerCase())){D("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),y?.focus();return}let T=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;n=[...n,{id:T,name:M.slice(0,60),created_at:new Date().toISOString()}],o=T,l=8,await Ys("rag.projects",n),Ie(),D(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${M}\u300D\u3002`,"ok")},Ve=async c=>{let y=s.find(C=>String(C.id)===String(c));if(!y)return;let M=!y.pinned;if(!await Ks(y.id,{pinned:M})){D("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}y.pinned=M,Ie(),D(M?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},Ze=()=>{f+=1,rt(),bt(null),m="",p=null,$=[],k(!1),K(),J.innerHTML=er(),x.value="",I(),me.value="",G(),Me(O,!1),Me(Z,!1),Ie(),ae?.open&&ae.close(),ne?.open&&ne.close(),x.focus(),window.scrollTo({top:0,behavior:"smooth"})},Lt=c=>{if(!c||ve.hidden)return;let y=c.getBoundingClientRect(),M=ve.getBoundingClientRect(),T=6,C=y.bottom+T;C+M.height>window.innerHeight-8&&(C=Math.max(8,y.top-M.height-T));let se=y.right-M.width;se=Math.max(8,Math.min(se,window.innerWidth-M.width-8)),ve.style.left=`${Math.round(se)}px`,ve.style.top=`${Math.round(C)}px`},re=c=>{ve.innerHTML=`
      <button type="button" role="menuitem" data-menu-action="rename">${g("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${g("pin",13)}<span>${c.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${g("link",13)}<span>\u5206\u4EAB</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${g("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${g("trash",13)}<span>\u522A\u9664</span></button>`},we=c=>{let y=String(c.project_id||""),M=[{id:"",name:"\u672A\u5206\u985E"},...n.map(T=>({id:String(T.id),name:T.name}))];ve.innerHTML=`
      <div class="rag-history-menu-head">${g("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${M.map(T=>`<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${r(T.id)}">
            <span class="rag-history-menu-check">${y===T.id?g("check",12):""}</span>
            <span>${r(T.name)}</span>
          </button>`).join("")}
      ${n.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${g("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},Ue=(c,y)=>{let M=s.find(T=>String(T.id)===String(y));M&&(H(),Ne=String(M.id),Oe=c,re(M),ve.hidden=!1,c.setAttribute("aria-expanded","true"),Lt(c))},Ye=async c=>{let y=window.prompt("\u91CD\u65B0\u547D\u540D\u5C0D\u8A71",c.title||"");if(y===null)return;let M=y.trim();if(!M){D("\u540D\u7A31\u4E0D\u80FD\u7A7A\u767D\u3002","warn");return}if(M===c.title)return;if(!await Ks(c.id,{title:M})){D("\u91CD\u65B0\u547D\u540D\u5931\u6557\u3002","danger");return}c.title=M,Ie(),D("\u5C0D\u8A71\u5DF2\u91CD\u65B0\u547D\u540D\u3002","ok")},jt=async c=>{let y=Array.isArray(c.turns)?c.turns:[],M=[`# ${c.title||"\u672A\u547D\u540D\u5C0D\u8A71"}`,""];if(y.length)for(let C of y){M.push("## \u554F\u984C","",C.question||"",""),M.push("## \u56DE\u7B54","",C.payload?.answer||"\uFF08\u6C92\u6709\u56DE\u7B54\u5167\u5BB9\uFF09","");let se=Array.isArray(C.payload?.law_sources)?C.payload.law_sources.map(U=>U.law_name).filter(Boolean):[];se.length&&M.push(`\u5F15\u7528\uFF1A${[...new Set(se)].join("\u3001")}`,"")}else M.push(c.title||"");let T=await xs(M.join(`
`));D(T?"\u5C0D\u8A71\u5167\u5BB9\u5DF2\u8907\u88FD\uFF0C\u53EF\u76F4\u63A5\u8CBC\u4E0A\u5206\u4EAB\u3002":"\u7121\u6CD5\u8907\u88FD\u5C0D\u8A71\u5167\u5BB9\u3002",T?"ok":"warn")},zt=async c=>{if(!window.confirm(`\u522A\u9664\u5C0D\u8A71\u300C${c.title||"\u672A\u547D\u540D\u5C0D\u8A71"}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002`))return;if(!await ui(c.id)){D("\u522A\u9664\u5931\u6557\u3002","danger");return}let M=p!==null&&String(p)===String(c.id);s=s.filter(T=>String(T.id)!==String(c.id)),M?Ze():Ie(),D("\u5C0D\u8A71\u5DF2\u522A\u9664\u3002","ok")},q=async(c,y)=>{if(!await Ks(c.id,{project_id:y})){D("\u79FB\u81F3\u5C08\u6848\u5931\u6557\u3002","danger");return}c.project_id=y;let T=n.find(C=>String(C.id)===String(y));Ie(),D(T?`\u5DF2\u79FB\u81F3\u5C08\u6848\u300C${T.name}\u300D\u3002`:"\u5DF2\u79FB\u51FA\u5C08\u6848\u3002","ok")},N=async c=>{let y=c.target.closest("[data-menu-action]");if(!y)return;let M=s.find(C=>String(C.id)===Ne);if(!M){H();return}let T=y.dataset.menuAction;T==="rename"?(H(),await Ye(M)):T==="toggle-pin"?(H(),await Ve(M.id)):T==="share"?(H(),await jt(M)):T==="move"?(we(M),Lt(Oe)):T==="assign-project"?(H(),await q(M,y.dataset.projectId||"")):T==="back"?(re(M),Lt(Oe)):T==="delete"&&(H(),await zt(M))},R=c=>{ve.hidden||(typeof c.composedPath=="function"?c.composedPath():[]).includes(ve)||ve.contains(c.target)||c.target.closest('[data-rag-action="open-history-menu"]')||H()},z=c=>{c.key==="Escape"&&H()},Y=c=>{c.target instanceof Node&&ve.contains(c.target)||H()},te=async()=>{try{if(s=await qa({limit:120}),t)return;a=!0,Ie(),A.textContent=Vs()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;s=[],a=!0,Ie(),j.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},ce=async(c,y,M,T)=>{let C=$,se=p;C.push({question:c,asked_at:new Date().toISOString(),payload:_d(y)});let U=Array.isArray(y.citations)?y.citations:[],Q=Array.isArray(y.judgments)?y.judgments:[],ue={question:c,status:y.status,citations:U.map(Je=>Je.law_name),judgments:Q.map(Je=>Je.jid)},ye=`${y.status||"preview"} \xB7 ${C.length} \u8F2A`,Ae=new Date().toISOString(),ze=Je=>{T===f&&(p=Je)};if(se){if(!await Ks(se,{turns:C,detail:ye,payload:ue,updated_at:Ae})){let Gt=await Ws({kind:"rag",title:C[0]?.question||c,detail:ye,project_id:M,turns:C,payload:ue,updated_at:Ae});ze(Gt)}}else{let Je=await Ws({kind:"rag",title:C[0]?.question||c,detail:ye,project_id:M,turns:C,payload:ue,updated_at:Ae});ze(Je)}await te()},je=()=>{let c=e.querySelector("#rag-mode-notice");if(!c)return;let y=Array.isArray(w?.model_summary)?w.model_summary:[];if(!w){if(!_)return;c.innerHTML=Ha({tone:"warn",title:"\u7121\u6CD5\u53D6\u5F97 RAG \u670D\u52D9\u72C0\u614B",text:_.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u524D\u5F80\u7CFB\u7D71\u72C0\u614B\u9801\u67E5\u770B\u3002",modelSummary:y,refreshing:L});return}let M=w.data||{},T=(w.services||[]).find(U=>U.id==="rag"),C=Number(M.judgment_indexed_count||0),se=Number(M.judgment_count||0);T?.status==="operational"?c.innerHTML=Ha({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${d(C)} / ${d(se)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`,modelSummary:y,refreshing:L}):T?.status==="degraded"?c.innerHTML=Ha({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:T.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002",modelSummary:y,refreshing:L}):c.innerHTML=Ha({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:T?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002",modelSummary:y,refreshing:L})},Ce=async()=>{try{let c=await V.status();if(t)return;w=c,_=null}catch(c){if(t)return;w=null,_=c}je()},Te=async()=>{if(!L){L=!0,je();try{let c=await V.status();if(t)return;w=c,_=null,D("\u5DF2\u66F4\u65B0\u6A21\u578B\u72C0\u614B\u3002","ok",2500)}catch(c){D(c.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u3002","danger",6e3)}finally{L=!1,t||je()}}},Fe=()=>{if(!ee)return;if(!u){ee.innerHTML="";return}let c=Array.isArray(h.embedding)?h.embedding.length:0,y=Array.isArray(h.llm)?h.llm.length:0;ee.innerHTML=Ee({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${c} \u500B embedding \u8207 ${y} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},et=async()=>{try{let c=await V.testMode();if(t)return;u=!!c.enabled,h=c.models||{embedding:[],llm:[]},Fe()}catch{if(t)return;u=!1,Fe()}},at=c=>{u=!!c.detail?.enabled,h=c.detail?.models||{embedding:[],llm:[]},Fe()};window.addEventListener("judgment:test-mode",at);let bt=c=>{if(!xe)return;_e=c||null;let y=JSON.stringify(c?{run_id:c.run_id,status:c.status,progress:c.progress,total_ms:c.total_ms,stage:c.stage,answer:c.answer||"",steps:(c.steps||[]).map(M=>`${M.stage}:${M.model}:${M.status}:${M.progress}:${M.duration_ms}`)}:null);y!==ke&&(ke=y,xe.innerHTML=c?Rs(c,[],"",{showHistory:!1}):"")},rt=()=>{be&&(be(),be=null)},Is=async(c=null)=>{if(!t)try{let y=c||await V.testRunCurrent();if(t)return;let M=y.run;M&&M.status==="running"&&bt(M)}catch{}},oa=()=>{t||be||(Is(),be=mt("test-runs",(c,y)=>Is(y?.snapshot||null)))},la=async c=>{if(!c){bt(null);return}try{let y=await V.testRun(c);if(t)return;bt(y.run||null)}catch{t||D("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},Ds=async()=>{if(u)try{let c=await V.testRunCurrent();if(t)return;c.run?.status==="running"&&(bt(c.run),oa())}catch{}},kt=0,Bs=(c,y)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${r(c)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${g("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${y}</div>`,tn=c=>{let y=(Array.isArray(c.citations)?c.citations:[]).map(U=>uo(U)).filter(Boolean).join(""),M=y||(Array.isArray(c.matched_laws)?c.matched_laws:[]).map(U=>za(U)).join(""),T=[c.court,c.jdate,c.title?`\u6848\u7531\uFF1A${c.title}`:"",c.full_text_length?`${d(c.full_text_length)} \u5B57`:"",c.citation_count?`\u5F15\u7528 ${d(c.citation_count)} \u7B46`:""].filter(Boolean).map(U=>`<span>${r(U)}</span>`).join(""),C=c.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${r(String(c.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",se=c.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(c.pdf_url)}" target="_blank" rel="noopener noreferrer">${g("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return Bs(c.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${r(c.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${T}
      </div>
      ${y?'<div class="citation-meta" style="margin-top:8px"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':""}
      ${M?`<div class="chips" style="margin:8px 0 10px">${M}</div>`:""}
      <div class="judgment-dialog-source">${C}</div>
      <pre class="judgment-dialog-text">${r(c.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${se}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},ca=async c=>{if(!ae||!c)return;let y=++kt;ae.open||ae.showModal(),pe(),ae.innerHTML=Bs("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${r(c)}\u2026</span>
      </div>`);try{let M=await V.judgmentDetail(c,"parquet");if(t||y!==kt)return;ae.innerHTML=tn(M)}catch(M){if(t||y!==kt)return;ae.innerHTML=Bs("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(M.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},Fs=0,ks=(c,y)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${r(c)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${g("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${y}</div>`,da=(c,y="")=>{let M=String(c.selected_article_no||y||"").trim(),T=!!M,C=Array.isArray(c.articles)?c.articles:[],se=C.map(He=>{let yt=String(He.article_content||"").trim();return yt?He.article_type==="C"?`<div class="law-chapter">${r(yt)}</div>`:`<article class="law-article" data-article-no="${r(io(He.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${r(He.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${r(yt)}</div>
        </article>`:""}).join(""),U=(Array.isArray(c.warnings)?c.warnings:[]).map(He=>r(He)).join("<br />"),Q=c.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",ue=c.meta?.articles_source,ye=ue==="parquet"?"Parquet \u689D\u6587":ue==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",Ae=c.meta?.snapshot||"",ze=[c.law_level,c.law_category,c.article_count?`${d(c.article_count)} \u689D`:"",c.law_modified_date?`\u7570\u52D5 ${Et(c.law_modified_date)}`:""].filter(Boolean).map(He=>`<span>${r(He)}</span>`).join(""),Je=c.law_url?`<a class="btn btn-secondary btn-sm" href="${r(c.law_url)}" target="_blank" rel="noopener noreferrer">${g("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",Gt=!T&&c.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${r(c.law_histories)}</div>
        </details>`:"",Tt=T?`<span class="badge badge-mono">${r(M)}</span>`:"",Le=!T&&C.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",Qe=T?`${c.law_name||c.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${M}`:c.law_name||c.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return ks(Qe,`<div class="judgment-dialog-meta">
        <span class="badge ${c.source_type==="order"?"badge-warn":"badge-info"}">${r(Q)}</span>
        ${Tt}
        ${ze}
      </div>
      <div class="judgment-dialog-source">${r([ye,Ae].filter(Boolean).join(" \xB7 "))}</div>
      ${U?`<div class="law-dialog-warning">${U}</div>`:""}
      ${Gt}
      ${Le}
      <div class="law-dialog-articles">${se||`<div class="report-empty-inline">${T?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${Je}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},Os=(c,y)=>{let M=c?.querySelector(`#${y}`),T=io(M?.value||"");if(!T){D("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),M?.focus();return}let C=[...c?.querySelectorAll("[data-article-no]")||[]].find(se=>se.dataset.articleNo===T);if(!C){D(`\u627E\u4E0D\u5230\u7B2C ${T} \u689D\u3002`,"warn");return}C.scrollIntoView({behavior:"instant",block:"center"}),C.classList.add("is-jump-target"),window.setTimeout(()=>C.classList.remove("is-jump-target"),2400)},Ss=async(c,y="",M="")=>{if(!ne||!c)return;let T=++Fs;ne.open||ne.showModal(),pe(),ne.innerHTML=ks(M?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${r([c,M].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let C=await V.lawDetail(c,y,"",M);if(t||T!==Fs)return;ne.innerHTML=da(C,M)}catch(C){if(t||T!==Fs)return;ne.innerHTML=ks("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(C.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};ne?.addEventListener("click",c=>{let y=c.target.closest('[data-action="jump-law-article"]');if(y){Os(ne,y.dataset.jumpInput||"rag-law-article-jump");return}if(c.target.closest('[data-action="close-law-source"]')){ne.close();return}let M=ne.getBoundingClientRect();(c.clientX<M.left||c.clientX>M.right||c.clientY<M.top||c.clientY>M.bottom)&&ne.close()}),ne?.addEventListener("keydown",c=>{!c.target.matches(".law-jump-input")||c.key!=="Enter"||(c.preventDefault(),Os(ne,c.target.id))}),ae?.addEventListener("click",c=>{let y=c.target.closest('[data-action="open-law-source"]');if(y){Ss(y.dataset.lawKey||"",y.dataset.sourceType||"",y.dataset.articleNo||"");return}if(c.target.closest('[data-action="close-parquet-judgment"]')){ae.close();return}let M=ae.getBoundingClientRect();(c.clientX<M.left||c.clientX>M.right||c.clientY<M.top||c.clientY>M.bottom)&&ae.close()}),J.addEventListener("click",c=>{let y=c.target.closest(".rag-process-toggle");if(y){let T=y.closest(".rag-process"),C=y.getAttribute("aria-expanded")==="true";tr(T,!C);return}let M=c.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(M){if(M.dataset.action==="open-law-source"){Ss(M.dataset.lawKey||"",M.dataset.sourceType||"",M.dataset.articleNo||"");return}ca(M.dataset.jid||"")}}),J.addEventListener("keydown",c=>{if(c.key!=="Enter"&&c.key!==" ")return;let y=c.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!y||y.closest("a, button"))){if(c.preventDefault(),y.dataset.action==="open-law-source"){Ss(y.dataset.lawKey||"",y.dataset.sourceType||"",y.dataset.articleNo||"");return}ca(y.dataset.jid||"")}});let ms=async(c,{fresh:y=!1,source:M="hero"}={})=>{let T=c.trim();if(!T){D("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),(M==="followup"?me:x).focus();return}(y||!b)&&(p=null,$=[],J.innerHTML="",Ie());let C=++f,se=()=>t||C!==f,U=o;m=T,k(!0),K(),M==="followup"?(me.value="",G()):(x.value="",I());let{answerElement:Q}=Re(T,qd(T,u)),ue=u?null:Ad(Q);u?(bt(null),oa()):(rt(),bt(null)),Me(O,!0,"\u6AA2\u7D22\u4E2D\u2026"),Me(Z,!0,"\u6AA2\u7D22\u4E2D\u2026");let ye=null,Ae="",ze=Le=>{if(se()||!Le?.partial)return;let Qe=Q.querySelector(".answer-body");if(!Qe)return;ye=Le,Ae=String(Le.answer||""),Qe.innerHTML=mo(Le),ue?.collapse?.();let He=Q.querySelector(".answer-head-title");He&&(He.textContent=Le.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},Je=Le=>{if(se()||!Le||!ye?.streaming)return;Ae+=Le;let Qe=Q.querySelector("[data-partial-answer]");Qe&&(Qe.textContent=Ae)},Gt=()=>{if(se()||!ye?.streaming)return;Ae="";let Le=Q.querySelector("[data-partial-answer]");Le&&(Le.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")},Tt=Le=>{if(se())return;let Qe=Q.querySelector(".answer-body");if(!Qe)return;let He=Qe.querySelector("[data-summary-queue]");He||(He=document.createElement("div"),He.className="answer-notice",He.dataset.summaryQueue="true",Qe.appendChild(He));let yt=Number(Le.position||0),gs=Number(Le.eta_s||0),fs=Le.lane==="summary"?"\u6458\u8981":"\u6AA2\u7D22";He.textContent=`${fs}\u6392\u968A\u4E2D\uFF1A\u524D\u9762 ${yt} \u4F4D\uFF0C\u9810\u4F30\u7D04 ${Math.round(gs)} \u79D2\u3002`};try{let Le=u?await V.rag(T,{testMode:u}):await V.ragStream(T,{onStep:He=>{se()||ue?.step(He)},onPartial:ze,onQueued:Tt,onToken:Je,onTokenReset:Gt});if(se())return;rt();let Qe=ue?.finish(!0)||"";if(Q.innerHTML=lo(T,Le,Qe),Le.pipeline_flow||wd(Le).then(()=>{if(se()||!Le.pipeline_flow)return;let He=Q.querySelector(".answer-body");if(!He||He.querySelector(".rag-wf-card"))return;let yt=Fa(Le.pipeline_flow,{serverDurationMs:Number(Le.duration_ms)||0,embedded:!0});yt&&He.insertAdjacentHTML("beforeend",yt)}),Le.test_run?.run_id?await la(Le.test_run.run_id):bt(null),await ce(T,Le,U,C),se())return;P()}catch(Le){if(se())return;rt();let Qe=ue?.finish(!1)||"";Q.innerHTML=Dd(Le,Qe),P(),D(Le.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{se()||(rt(),Me(O,!1),Me(Z,!1))}};S.addEventListener("submit",c=>{c.preventDefault(),ms(x.value,{fresh:!0,source:"hero"})}),he.addEventListener("submit",c=>{c.preventDefault(),ms(me.value,{fresh:!1,source:"followup"})}),x.addEventListener("input",I),x.addEventListener("keydown",c=>{c.key==="Enter"&&!c.shiftKey&&!c.isComposing&&(c.preventDefault(),S.requestSubmit())}),me.addEventListener("input",G),me.addEventListener("keydown",c=>{c.key==="Enter"&&!c.shiftKey&&!c.isComposing&&(c.preventDefault(),he.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",c=>{let y=c.target.closest("[data-question]");y&&(x.value=y.dataset.question,I(),S.requestSubmit())}),e.addEventListener("click",async c=>{c.target.closest('[data-rag-action="refresh-models"]')&&await Te()}),X.addEventListener("click",async c=>{let y=c.target.closest("[data-rag-toggle]");if(y){let Q=y.closest(".rag-library-section").classList.toggle("is-collapsed");y.setAttribute("aria-expanded",String(!Q));return}let M=c.target.closest("[data-rag-action]"),T=M?.dataset.ragAction||"";if(T==="new-chat"){Ze();return}if(T==="open-history-menu"){Ue(M,M.dataset.historyId);return}if(T==="toggle-pin"){await Ve(M.dataset.historyId);return}if(T==="select-project"){Ke(M.dataset.projectId||"");return}if(T==="show-project-form"){st();return}if(T==="cancel-project"){qt();return}if(T==="more-recent"){l+=12,Ie();return}if(T==="clear-project"){Ke("");return}let C=c.target.closest("[data-history-open]");if(!C)return;let se=s.find(U=>String(U.id)===String(C.dataset.historyId));se&&(o=String(se.project_id||""),Ie(),!Pe(se)&&(p=null,$=[],ms(se.title,{fresh:!0,source:"history"})))}),X.addEventListener("submit",async c=>{let y=c.target.closest('[data-rag-form="project"]');y&&(c.preventDefault(),await Mt(y))}),ve.addEventListener("click",N),document.addEventListener("click",R),document.addEventListener("keydown",z),window.addEventListener("scroll",Y,{capture:!0,passive:!0}),window.addEventListener("resize",H),E.addEventListener("click",async()=>{if(!s.length){D("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await pi(),await te(),D("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),I(),await Promise.allSettled([Ce(),te(),ut(),et()]),await Ds();let v="";try{v=window.sessionStorage.getItem("judgment.pending_question")||"",window.sessionStorage.removeItem("judgment.pending_question")}catch{v=""}return!v&&typeof window.__judgmentPendingQuestion=="string"&&(v=window.__judgmentPendingQuestion),delete window.__judgmentPendingQuestion,v=String(v||"").trim().slice(0,500),v&&x&&(x.value=v,I(),window.setTimeout(()=>{t||ms(v,{fresh:!0,source:"home"})},40)),()=>{t=!0,rt(),H(),document.removeEventListener("click",R),document.removeEventListener("keydown",z),window.removeEventListener("scroll",Y,{capture:!0}),window.removeEventListener("resize",H),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",at),m&&J.setAttribute("data-last-question",m)}}var fr={};rs(fr,{render:()=>zu});var ir=new Set(["legal_index_versions","judgment_import","index_versions"]),go=new Map,or=new Set,lr=new Set;function ar(e){let t=Number(e);if(!Number.isFinite(t)||t<0)return"\u2014";if(t<60)return`${Math.round(t)} \u79D2`;let s=Math.floor(t/60),a=Math.round(t%60);if(s<60)return`${s} \u5206 ${a} \u79D2`;let n=Math.floor(s/60),i=s%60;if(n<24)return`${n} \u5C0F\u6642 ${i} \u5206`;let o=Math.floor(n/24),l=n%24;return`${o} \u5929 ${l} \u5C0F\u6642`}function nr(e){return String(e||"").trim().replace(/:latest$/,"")}var Hd={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},partial:{label:"\u90E8\u5206\u5B8C\u6210",tone:"warn"},update:{label:"\u66F4\u65B0",tone:"warn"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"},provided:{label:"\u5916\u90E8\u63D0\u4F9B",tone:"info"}},cr=["download","parquet","postgres","qdrant"],zd={download:"\u4E0B\u8F09",parquet:"Parquet",postgres:"PostgreSQL",qdrant:"Qdrant"},Gd={judgment:{download:["download"],parquet:["raw_parquet","extract"],postgres:["postgres"],qdrant:["qdrant"]},law:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]},order:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]}},fo={complete:"\u5B8C\u6210",incomplete:"\u672A\u5B8C\u6210",pending:"\u5F85\u66F4\u65B0",processing:"\u8655\u7406\u4E2D",empty:"\u7121\u8CC7\u6599",not_applicable:"\u5DF2\u53D6\u4EE3"},bo={complete:"is-green",incomplete:"is-red",pending:"is-pending",processing:"is-gray",empty:"is-empty",not_applicable:"is-empty"};var Pt=new Map,It="",ys="",ho={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},vo={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Ud={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"};var $o={law_download:"law",order_download:"order",judgment_download:"judgment"},yo={law_download:"\u6CD5\u898F\u4E0B\u8F09",order_download:"\u547D\u4EE4\u4E0B\u8F09",judgment_download:"\u5224\u6C7A\u4E0B\u8F09"},Qd={law_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",order_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",judgment_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u5224\u6C7A RAR \u55CE\uFF1F\uFF08\u4E0D\u6703\u81EA\u52D5\u532F\u5165 PostgreSQL \u6216\u5EFA\u7ACB Qdrant \u7D22\u5F15\uFF09"},Jd={law_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u6CD5\u898F RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",order_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u547D\u4EE4 RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",judgment_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u53EA\u4E0B\u8F09\u5224\u6C7A RAR\u3002PostgreSQL\uFF0FParquet \u532F\u5165\u8207 Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\u300C\u5224\u6C7A\u532F\u5165\u300D\u6216\u5B8C\u6574\u8CC7\u6599\u66F4\u65B0\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_import:"\u6D41\u7A0B\u7BC4\u570D\uFF1ARAR \u2192 \u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD \u2192 \u91D1\u878D\u6CD5\u898F\u7BE9\u9078 \u2192 PostgreSQL\u3002Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_parquet:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5F9E PostgreSQL \u532F\u51FA\u67E5\u8A62\u7528 Parquet \u5FEB\u7167\uFF1B\u4E0D\u5BEB\u5165 Qdrant\uFF0FIndexedDB\u3002",index_versions:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5EFA\u7ACB\u4E26\u9A57\u8B49\u65B0\u7684 Qdrant collection\uFF0C\u5B8C\u6210\u5F8C\u539F\u5B50\u5207\u63DB alias\uFF1BIndexedDB \u4E0D\u53C3\u8207\u3002"};function ps(e){return Hd[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function At(e,t){let s=ps(e);return`<span class="badge ${ho[s.tone]||ho.idle}"><span class="status-dot ${vo[s.tone]||vo.idle}"></span>${r(t||s.label)}</span>`}function dt(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function wo(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":d(e)}function ko(e){return e&&e.color?String(e.color):"var(--accent)"}function dr(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return["skipped","pending","idle"].includes(e.status)?"\u2014":s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${qe(s)} / ${qe(a)}`:qe(s):a?`${d(s)} / ${d(a)} ${t}`:`${d(s)} ${t}`}function ws(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${r(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function Vd(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},n=e.raw_backups||{},i=n.totals||{},o=e.state||{},l=e.capabilities||{},m=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",f=t.status==="operational",p=s.status==="operational",$=a.available!==!1,b=n.available!==!1,u=p?`${d(s.indexed)} / ${d(s.total)}`:At(s.status||"unavailable"),h=p?`${dt(s.percent)} \xB7 \u5C1A\u9918 ${d(s.remaining)} \u7B46`:r(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),w=$?`${d(a.unprocessed)} / ${d(a.total)}`:At("unavailable"),_=$?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${qe(a.unprocessed_bytes)} \u5F85\u8655\u7406`:r(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${Vt(lu(e))}
    ${ws("\u8655\u7406\u72C0\u614B",At(e.status||"unknown"),`${r(m)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${ws("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",r(w),_)}
    ${ws("\u539F\u59CB\u8CC7\u6599\u5099\u4EFD",b?`${d(n.count)} \u6A94`:At("unavailable"),b?`\u5171 ${d(i.row_count)} \u7B46 \xB7 ${qe(i.compressed_bytes)}`:r(n.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB\u8CC7\u6599\u5099\u4EFD\u3002"))}
    ${ws("PostgreSQL \u5224\u6C7A",f?d(t.judgment_count):At("unavailable"),f?`\u6CD5\u898F ${wo(t.law_count)} \xB7 \u547D\u4EE4 ${wo(t.order_count)}`:r(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${ws("Qdrant \u7D22\u5F15",u,h)}
    ${ws("\u72C0\u614B\u6A94",At(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${r($e(o.updated_at))}`:r(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${ws("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?r(l.start_blocked_reason):`\u672A\u8655\u7406 ${d(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${d(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${d(l.external_processes)} \u500B`:""}`)}
  </div>`}function Wd(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let n=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${r(o.color||"var(--accent)")}" title="${r(`${o.label} ${de(o.duration_ms)} (${dt(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${r(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${r(o.label)}</span>
        <span class="mono">${de(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${dt(o.percent)}</span>
        ${At(o.status)}
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
  </section>`}function Kd(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let n=t.map(i=>{let o=s.get(i.branch)||Ud[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${r(o)}</span>
          <strong>${r(i.title||"\u8655\u7406")}</strong>
          ${At(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${r($e(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?de(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${r(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${n}</div></div>
  </section>`}function Yd(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>Ee({tone:s.tone||"info",title:s.title,text:r(s.message||"")})).join("")}</div>`:""}function So(e,t){if(e==="law"||e==="order")return t==="qdrant"?"legal_index_versions":`${e}_download`;if(e==="judgment"){if(t==="download")return"judgment_download";if(t==="parquet"||t==="postgres")return"judgment_import";if(t==="qdrant")return"index_versions"}return""}function ur({month:e,year:t,monthNo:s,stageOrder:a,stageLabels:n,stageStatuses:i,overall:o,active:l,processing:m=!1,workflowForStage:f,stageProgress:p=null,variant:$="legacy"}){let b=i||{},u=$==="index"||$==="import",h=String(e?.month||`${t}${String(s).padStart(2,"0")}`),w=e?.month_label||`${t}-${String(s).padStart(2,"0")}`,_=j=>u&&j==="processing"?"\u57F7\u884C\u4E2D":fo[j]||fo.empty,L=j=>{let A=b[j]||"empty";if(!(A==="processing"||j==="qdrant"&&A==="incomplete"))return null;let X;if(typeof p=="function")X=p(j,h,A);else if($==="import"&&p&&typeof p=="object")X=p[j];else return null;let W=Number(X);return Number.isFinite(W)?Math.max(0,Math.min(100,W)):null},S=a.map(j=>{let A=b[j]||"empty",E=L(j),X=j==="qdrant"&&A==="incomplete"&&E!==null&&E>0,W=X?"\u5DF2\u8655\u7406":_(A),B=!X&&E!==null&&E>0?` ${E.toFixed(1)}%`:"";return`${n[j]||j}\uFF1A${W}${B}`}).join(" \xB7 "),x=(e?.versions||[]).map(j=>j.version_code).filter(Boolean),O=[...new Set([...e?.files||[],...e?.local_files||[],...e?.imported_files||[]])].filter(Boolean),ie=x.length?` \xB7 \u7248\u672C ${x.join("\u3001")}`:O.length?` \xB7 ${O.join("\u3001")}`:"",J=e?.detail?` \xB7 ${e.detail}`:"",he=e?`${w} \xB7 ${S}${ie}${J}`:`${w} \xB7 \u7121\u8CC7\u6599`,me=u?o==="empty"?"is-empty":"is-neutral":bo[o]||"is-empty",Z=a.map(j=>{let A=b[j]||"empty",E=A==="incomplete"||A==="pending"?f(j):"",X=E?"button":"span",W=E?` type="button" data-timeline-workflow="${r(E)}"`:"",B=L(j),le=j==="qdrant"&&A==="incomplete"&&B!==null&&B>0,ge=A==="processing"&&B!==null?` ${B.toFixed(1)}%`:"",F=le?"\u5DF2\u8655\u7406":_(A),fe=A==="complete"?"is-complete":A==="processing"?"is-running":le?"is-partial":A==="incomplete"?"is-incomplete":A==="pending"?"is-pending":"is-empty",ee=u?["index-month-block","processing-month-stage",`is-${j}`,fe,E?"is-actionable":""]:["processing-month-stage",`is-${j}`,bo[A]||"is-empty",fe,E?"is-actionable":""],ve=(A==="processing"||le)&&B!==null?` style="--stage-progress:${B.toFixed(1)}%"`:"";return`<${X} class="${ee.filter(Boolean).join(" ")}"${W}${ve} title="${r(`${n[j]||j}\uFF1A${F}${ge}${E?"\uFF08\u9EDE\u9078\u524D\u5F80\u8655\u7406\uFF09":""}`)}" aria-label="${r(`${w} ${n[j]||j} ${F}${ge}${E?"\uFF0C\u9EDE\u9078\u524D\u5F80\u8655\u7406":""}`)}"></${X}>`}).join("");return u?`<td class="judgment-month index-month index-month-are processing-month ${me}${l?" is-current":""}${m&&!l?" is-processing-current":""}" data-month="${r(h)}" title="${r(he)}" aria-label="${r(he)}"${l?' aria-current="true"':""}>
    <span class="index-month-number">${s}</span>
    <span class="index-month-blocks">${Z}</span>
  </td>`:`<td class="judgment-month import-month processing-month${l?" is-current":""} is-${r(o)}" data-month="${r(h)}" title="${r(he)}" aria-label="${r(he)}"${l?' aria-current="true"':""}>
    <span class="processing-month-number">${s}</span>
    <span class="processing-month-stages">${Z}</span>
  </td>`}function Xd(e,t,s,a,n){return ur({month:t,year:s,monthNo:a,stageOrder:cr,stageLabels:zd,stageStatuses:t?.stages||{},overall:t?.overall||"empty",active:!!(t?.active||t?.overall==="processing"),workflowForStage:i=>So(e.key,i),stageProgress:n,variant:"index"})}function Zd(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=Number(s?.incomplete)||0,o=Number(s?.superseded)||0,l=a>0?(n+o)/a*100:null,m=["download","prepared","indexed"],f=0,p=0;for(let b of t){let u=b?.stages||{};for(let h of m){let w=u[h];!w||w==="empty"||w==="not_applicable"||(f+=1,w==="complete"&&(p+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",d(n),"\u5DF2\u5B8C\u6210 D\uFF0FP\uFF0FI \u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",d(i+(Number(s?.processing)||0)),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u5DF2\u53D6\u4EE3\u6708\u4EFD",d(o),"\u820A\u7248\u672C\u5DF2\u88AB\u76EE\u524D\u7248\u672C\u53D6\u4EE3\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",d(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",dt(l),"\u5B8C\u6210\u6216\u5DF2\u53D6\u4EE3\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${d(p)} / ${d(f)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([b,u,h])=>`<span class="index-runtime-metric" title="${r(h)}"><span>${r(b)}</span><strong>${r(u)}</strong></span>`).join("")}</div>`}function eu(e,t,s,a){let n=Number(e?.total_months)||t.length||0,i=Number(s?.complete)||0,o=Number(s?.incomplete)||0,l=Number(s?.processing)||0,m=Number(a?.gray)||0,f=n>0?i/n*100:null,p=0,$=0;for(let u of t){let h=u?.import_stages||{};for(let w of["extract","raw_parquet","filter","postgres"]){let _=h[w];!_||_==="empty"||(p+=1,_==="complete"&&($+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",d(i),"\u56DB\u500B\u532F\u5165\u968E\u6BB5\u90FD\u5B8C\u6210\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",d(o+l),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\uFF08\u542B\u8655\u7406\u4E2D\uFF09\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",d(m),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",d(n),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",dt(f),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${d($)} / ${d(p)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([u,h,w])=>`<span class="index-runtime-metric" title="${r(w)}"><span>${r(u)}</span><strong>${r(h)}</strong></span>`).join("")}</div>`}function tu(e,{titleSuffix:t="\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868"}={}){let s=`${r(e?.label||"\u6CD5\u898F\uFF0F\u547D\u4EE4")} ${r(t)}`,a=Array.isArray(e?.months)?e.months:[];if(!a.length)return`<section class="report-card processing-card import-files-card law-index-timeline-card">
      <div class="side-card-head">
        <span class="side-card-title">${g(e?.key==="order"?"file":"layers",14)}${s}</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u7121\u4E0B\u8F09\u7248\u672C\u6216\u7D22\u5F15\u7D00\u9304\u3002</div>
    </section>`;let n=new Map(a.map(b=>[String(b.month),b])),i=[...new Set(a.map(b=>b.year))].sort((b,u)=>String(u).localeCompare(String(b))),o=["download","prepared","indexed"],l=e.stage_labels||{download:"D \u4E0B\u8F09\u7248\u672C",prepared:"P \u8CC7\u6599\u5C31\u7DD2",indexed:"I \u7D22\u5F15\u8986\u84CB"},m=e.summary||{},f=e.current||{},p=i.map(b=>{let u=Array.from({length:12},(h,w)=>{let _=w+1,L=`${b}${String(_).padStart(2,"0")}`,S=n.get(L);return ur({month:S,year:b,monthNo:_,stageOrder:o,stageLabels:l,stageStatuses:S?.stages||{},overall:S?.overall||"empty",active:!!S?.active,workflowForStage:x=>x==="indexed"?"legal_index_versions":`${e.key}_download`,variant:"index"})}).join("");return`<tr><th scope="row">${r(b)}</th>${u}</tr>`}).join(""),$=f.month?`<div class="index-current-row">
        <span class="badge badge-info">${g("activity",11)}${r(f.label||"\u76EE\u524D\u7248\u672C")}</span>
        <strong class="mono">${r(f.month_label||Ja(f.month))}</strong>
        <span class="mono">${r(f.file||"\u2014")}</span>
        <span class="index-current-copy">${r(f.detail||"")}</span>
      </div>`:"";return`<section class="report-card processing-card import-files-card law-index-timeline-card" data-law-index-timeline="${r(e.key||"")}">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${g(e.key==="order"?"file":"layers",14)}${s}</span>
      ${Zd(e,a,m)}
    </div>
    ${$}
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(b,u)=>`<th scope="col">${u+1}</th>`).join("")}</tr></thead>
          <tbody>${p}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">D\uFF1A\u4E0B\u8F09\u7248\u672C\uFF1BP\uFF1Araw Parquet + PostgreSQL \u5C31\u7DD2\uFF1BI\uFF1Aactive \u7D22\u5F15\u8986\u84CB\uFF08\u7531\u6CD5\u898F\uFF0F\u547D\u4EE4\u7D22\u5F15\u6D41\u7A0B\u7DAD\u8B77\uFF09\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF0C\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u5B8C\u6210\u8272\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u6216\u5DF2\u53D6\u4EE3\u3002\u820A\u7248\u672C\u986F\u793A\u300C\u5DF2\u53D6\u4EE3\u300D\uFF0C\u4E0D\u9700\u91CD\u5EFA\u7D22\u5F15\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u7DE8\u865F\u3001\u4E0B\u8F09\u6642\u9593\u8207\u7B46\u6578\u3002</p>
    </div>
  </section>`}function su(e,t={}){let s=Array.isArray(e)?e:[];return s.length?`<div class="law-index-timelines">${s.map(a=>tu(a,t)).join("")}</div>`:""}function xo({activeMonth:e,activeArchive:t,activePhase:s="",processingMonth:a="",processingArchive:n="",stageLabels:i={}}){if(!e||!t)return"";let o=`${String(e).slice(0,4)}-${String(e).slice(4,6)}`,l=i[s]||(s?"\u6E96\u5099\u4E2D":""),m=`${String(a||"").slice(0,4)}-${String(a||"").slice(4,6)}`,f=!!a&&(a!==e||n!==t);return`<span class="badge badge-info">${g("activity",11)}\u76EE\u524D\u532F\u5165</span>
    <strong class="mono">${r(o)}</strong>
    <span class="mono">${r(t)}</span>
    ${l?`<span class="badge badge-neutral">${r(l)}</span>`:""}
    ${f?`<span class="processing-current-processing">
            <span class="faint">\u8655\u7406\u4E2D</span>
            <strong class="mono">${r(m)}</strong>
            <span class="mono">${r(n||"\u2014")}</span>
          </span>`:""}`}function au(e,t,s,a){let n=[];for(let i=1;i<=12;i+=1){let o=`${t}${String(i).padStart(2,"0")}`;n.push(Xd(e,s.get(o),t,i,a))}return`<tr><th scope="row">${t}</th>${n.join("")}</tr>`}function nu(e){let t=e?.models||{};return[["Embedding",t.embedding],["Rerank",t.rerank]].filter(([,s])=>s&&(s.label||s.model)).map(([s,a])=>{let n=a.label||[a.host,a.model].filter(Boolean).join(" ")||"\u2014",i=[`${s} \u4E3B\u6A5F\u8207\u6A21\u578B\uFF1A${n}`,a.url?`\u7AEF\u9EDE\uFF1A${a.url}`:"",s==="Rerank"&&a.enabled===!1?"RAG_RERANK_ENABLED=false":""].filter(Boolean).join(" \xB7 ");return`<span class="processing-timeline-model" title="${r(i)}">${s} <strong class="mono">${r(n)}</strong>${s==="Rerank"&&a.enabled===!1?' <span class="faint">\u672A\u555F\u7528</span>':""}</span>`}).join("")}function ru(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=a>0?n/a*100:null,o=t.reduce((p,$)=>{let b=$?.stages||{};return p+cr.filter(u=>!!b[u]&&b[u]!=="empty"&&b[u]!=="not_applicable").length},0),l=t.reduce((p,$)=>{let b=$?.stages||{};return p+cr.filter(u=>b[u]==="complete").length},0),m=(Number(s?.incomplete)||0)+(Number(s?.processing)||0);return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",d(n),"\u5DF2\u5B8C\u6210\u5168\u90E8\u56DB\u500B\u968E\u6BB5\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",d(m),"\u4ECD\u6709\u81F3\u5C11\u4E00\u500B\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",d(s?.update||0),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",d(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",dt(i),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${d(l)} / ${d(o)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([p,$,b])=>`<span class="index-runtime-metric" title="${r(b)}"><span>${r(p)}</span><strong>${r($)}</strong></span>`).join("")}</div>`}function iu(e,t){let s=new Map((Array.isArray(e?.workflows)?e.workflows:[]).map(p=>[String(p.id||""),p])),a=t.key==="judgment"?"index_versions":"legal_index_versions",i=s.get(a)?.index_runtime||{},o=p=>{if(p==null||p==="")return null;let $=Number(p);return Number.isFinite($)?Math.max(0,Math.min(100,$)):null},l=new Map((Array.isArray(i.months)?i.months:[]).map(p=>[String(p?.month||""),o(p?.percent)])),m=new Map(Object.entries(i.active_coverage||{}).map(([p,$])=>[String(p),o($?.percent)])),f=(p,$)=>{let b=s.get(String(p||""));if(!b)return null;let u=b.progress||{},h=Array.isArray(u.stages)?u.stages:[];for(let w of $){let _=h.find(S=>String(S.key)===w),L=o(_?.percent);if(L!==null)return L}return o(u.percent)};return(p,$,b)=>{let u=String($||"");if(p==="qdrant"){let _=l.get(u),L=m.get(u);if(b==="processing"){if(_!==null&&_>0)return _;if(L!==null&&L>0)return L}else return b==="incomplete"?_!==null&&_>0?_:L!==null&&L>0?L:0:null}let h=So(t.key,p);if(!h)return null;let w=(Gd[t.key]||{})[p]||[p];return f(h,w)}}function ou(e){let t=Array.isArray(e.file_timelines)?e.file_timelines:[];return t.length?`<div class="processing-timeline-overview">${t.map(s=>{let a=Array.isArray(s.months)?s.months:[],n=new Map(a.map(p=>[String(p.month||""),p])),i=[...new Set(a.map(p=>Number(p.year)))].filter(p=>Number.isFinite(p)).sort((p,$)=>$-p),o=s.summary||{},l=s.current||null,m=nu(s),f=iu(e,s);return`<section class="report-card processing-card import-files-card processing-timeline-card" data-processing-timeline="${r(s.key||"")}">
        <div class="side-card-head index-runtime-head">
          <span class="side-card-title">${g(s.icon||"activity",14)}${r(s.title||`${s.label||""}\u8655\u7406\u6642\u9593\u8868`)}</span>
          ${ru(s,a,o)}
        </div>
        ${m?`<div class="index-runtime-summary">${m}</div>`:""}
        ${l?`<div class="index-current-row">
                <span class="badge badge-info">${g("activity",11)}${r(l.label||"\u76EE\u524D")}</span>
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
                    <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(p,$)=>`<th scope="col">${$+1}</th>`).join("")}</tr></thead>
                    <tbody>${i.map(p=>au(s,p,n,f)).join("")}</tbody>
                  </table>
                </div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u3002</div>'}
          <p class="judgment-months-hint">${s.key==="judgment"?"\u5224\u6C7A\u4EE5\u88C1\u5224\u66F8\u6708\u4EFD\u986F\u793A\u3002":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u4EE5\u4F86\u6E90\u7248\u672C\u6708\u4EFD\u986F\u793A\u3002"}\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA\u4E0B\u8F09\u3001Parquet\u3001PostgreSQL\u3001Qdrant \u56DB\u500B\u968E\u6BB5\uFF1B\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF0CQdrant \u4E4B\u524D\u5DF2\u8655\u7406\u4F46\u5C1A\u672A\u5B8C\u6210\u6642\u4EE5\u5B8C\u6210\u8272\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u6216\u8272\u584A\u53EF\u67E5\u770B\u5404\u968E\u6BB5\u72C0\u614B\u8207\u9032\u5EA6\u3002</p>
        </div>
      </section>`}).join("")}</div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u8655\u7406\u6642\u9593\u8868\u3002</div>'}function lu(e){return e.judgment_stats&&typeof e.judgment_stats=="object"?e.judgment_stats:{judgment_total:(e.raw_backups?.totals||{}).row_count,financial_total:(e.database||{}).judgment_count}}function _o(e,t=new Set){return`${Yd(e)}
    ${Vd(e)}
    ${ou(e)}
    ${Wd(e)}
    ${Kd(e)}`}function cu(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${Ee({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:r(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${r($e(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${g("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}function du(e,t){if(e.nodeType!==t.nodeType||e.nodeName!==t.nodeName){e.replaceWith(t.cloneNode(!0));return}if(e.nodeType===Node.TEXT_NODE){e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue);return}if(e.nodeType===Node.ELEMENT_NODE){for(let s of[...e.attributes])t.hasAttribute(s.name)||e.removeAttribute(s.name);for(let s of[...t.attributes])e.getAttribute(s.name)!==s.value&&e.setAttribute(s.name,s.value);t.hasAttribute("data-preserve-children")||Ao(e,t)}}function Ao(e,t){let s=[...e.childNodes],a=[...t.childNodes],n=Math.min(s.length,a.length);for(let i=0;i<n;i+=1)du(s[i],a[i]);for(let i=n;i<s.length;i+=1)s[i].remove();for(let i=n;i<a.length;i+=1)e.appendChild(a[i].cloneNode(!0))}function es(e,t){let s=document.createElement("template");s.innerHTML=t,Ao(e,s.content)}var qo={overview:"activity",law_download:"layers",order_download:"file",judgment_download:"download",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function uu(e){let s=(Array.isArray(e.workflows)?e.workflows:[]).map(n=>{let i=n.active_run||null,o=i||n.last_run||null;return{...n,activeRun:i,lastRun:o,status:i?i.status||"running":n.update_available?"update":o?.status||"idle"}}),a=s.find(n=>n.id==="judgment_parquet");return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...s.filter(n=>n.id!=="judgment_parquet"),...a?[a]:[]]}function Ga(e,t){let s=uu(e),a=new Set(["law_download","judgment_download","normalize_courts"]);return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${s.map(n=>{let i=n.id===t,o=qo[n.id]||"terminal",l=a.has(n.id)?'<div class="status-tab-divider" role="separator" aria-hidden="true"></div>':"",m=Number(n.pending_count)||0,f=Number(n.update_count)||(n.update_available?m:0),p=n.update_available&&f>0&&!n.activeRun,$=[n.update_message||`${n.update_origin||"\u66F4\u65B0\u5075\u6E2C"}\u627E\u5230 ${d(f)} \u9805\u53EF\u66F4\u65B0\u5167\u5BB9`,n.update_origin?`\u4F86\u6E90\uFF1A${n.update_origin}`:"",n.update_mechanism?`\u6A5F\u5236\uFF1A${n.update_mechanism}`:""].filter(Boolean).join(" \xB7 ");return`${l}<button class="status-tab${i?" is-active":""}" type="button"
            data-processing-workflow="${r(n.id)}"
            ${i?'aria-current="page"':""}>
            <span class="status-tab-icon">${g(o,15)}</span>
            <span class="status-tab-copy">
              <strong>${r(n.label)}</strong>
              <small>${r(n.description||"")}</small>
            </span>
            ${p?`<span class="badge badge-warn badge-mono processing-update-count" title="${r($)}">${g("refresh",10)}${d(f)}</span>`:At(n.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${r(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function pu(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${At(e.status)}
      <span class="mono">${r(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${r($e(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${de(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${r(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${r(t.log_path)}</strong>`:""}
    </div>
  </div>`}function sa(e){return`${e.year}-${String(e.month_no).padStart(2,"0")}`}function Mo(e){let t={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"},s=e.status||"red";return[sa(e),t[s]||s,e.latest_fileset_id?`fileset ${e.latest_fileset_id}`:"",e.filename||"",e.local_filename&&e.local_filename!==e.filename?`\u672C\u6A5F\uFF1A${e.local_filename}`:""].filter(Boolean).join(" \xB7 ")}function Lo(e){if(!e.download_url)return"";let t=sa(e);return`<a class="judgment-month-download" href="${r(it(e.download_url))}" target="_blank" rel="noreferrer" title="\u4E0B\u8F09 ${t} \u5224\u6C7A" aria-label="\u4E0B\u8F09 ${t} \u5224\u6C7A">${g("download",11)}</a>`}function mu(e){let t=e.status||"red";return`<td class="judgment-month is-${r(t)}" data-judgment-month-key="${r(sa(e))}" title="${r(Mo(e))}"><span>${e.month_no}</span>${Lo(e)}</td>`}function gu(e){return e?.off_hours_enabled===!0}function jo(e){return`\u7DA0\u8272\uFF1A\u6700\u65B0\u7248\u5DF2\u4E0B\u8F09\u5230 raw_rar\uFF1B\u7070\u8272\uFF1A\u672C\u6A5F\u4ECD\u662F\u820A\u7248\uFF0C\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u6703\u66F4\u65B0\uFF1B\u7D05\u8272\uFF1A\u8A72\u6708\u4EFD\u7F3A\u5C11\u5224\u6C7A\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u958B\u555F\u4E0B\u8F09\u9023\u7D50\uFF08${gu(e)?"\u975E API \u6642\u6BB5\u4E5F\u53EF\u4E0B\u8F09\uFF0C\u5EFA\u8B70\u4E00\u6B21\u53EA\u4E0B\u8F09\u4E00\u500B\u6A94\u6848":"\u4E0B\u8F09\u9023\u7D50\u50C5\u5728 00:00\u201306:00 API \u6642\u6BB5\u53EF\u7528"}\uFF09\u3002\u5F85\u88DC\u9F4A\u6708\u4EFD\u6703\u512A\u5148\u4E0B\u8F09\uFF0C\u5168\u90E8\u88DC\u9F4A\u5F8C\u624D\u7531\u6700\u65B0\u6708\u4EFD\u5F80\u56DE\u9A57\u8B49\u65E2\u6709\u6A94\u6848\uFF1B\u4E2D\u65B7\u7684\u4E0B\u8F09\u6703\u4FDD\u7559 .part\uFF0C\u4F3A\u670D\u5668\u652F\u63F4 Range \u6642\u7E8C\u50B3\uFF0C\u5426\u5247\u5F9E\u96F6\u91CD\u65B0\u4E0B\u8F09\u3002\u9996\u6B21\u5B8C\u6574\u540C\u6B65\u53EF\u80FD\u9700\u4E0B\u8F09\u6578\u767E\u500B\u6708\u4EFD\uFF0C\u9810\u8A2D\u975E\u6642\u6BB5\u4E5F\u53EF\u7E8C\u50B3\uFF1B\u56B4\u683C\u6A21\u5F0F\u6703\u5728 00:00\u201306:00 \u4EE5\u5916\u505C\u6B62\u3002`}var fu={completed:"\u5B8C\u6210",window_closed:"API \u6642\u6BB5\u7D50\u675F",deadline:"\u63A5\u8FD1 06:00\uFF0C\u4FDD\u7559\u5F85\u4E0B\u8F09\u6708\u4EFD",verification_window_closed:"API \u6642\u6BB5\u7D50\u675F\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",verification_deadline:"\u63A5\u8FD1 06:00\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",errors:"\u90E8\u5206\u6708\u4EFD\u4E0B\u8F09\u5931\u6557\uFF0C\u4E0B\u6B21\u91CD\u8A66",pending:"\u4ECD\u6709\u5F85\u4E0B\u8F09\u6708\u4EFD",check_only:"\u50C5\u6AA2\u67E5\uFF0C\u672A\u4E0B\u8F09",incremental:"\u589E\u91CF\u6AA2\u67E5\u5B8C\u6210",status_only:"\u50C5\u66F4\u65B0\u6708\u4EFD\u72C0\u614B",running:"\u57F7\u884C\u4E2D"};function pr(e){let t=e?.backfill||{},s=t.verification||{},a=t.last_run||{},n=Number(t.pending_count)||0,i=Number(t.failure_count)||0,o=String(t.resume_from_month||""),l="\u9A57\u8B49\uFF1A\u672A\u958B\u59CB";s.status==="completed"?l="\u9A57\u8B49\u5B8C\u6210":s.next_month?l=`\u9A57\u8B49\u7E8C\u50B3 ${s.next_month}`:s.status==="in_progress"&&(l="\u9A57\u8B49\u9032\u884C\u4E2D");let m=String(a.stop_reason||""),f=m?`\u4E0A\u6B21\u505C\u6B62\uFF1A${fu[m]||m}`:"";return{pending:n,failures:i,resume:o,verificationText:l,lastText:f}}function bu(e){let t=pr(e),s=t.pending>0?`\u5F85\u88DC\u9F4A ${d(t.pending)} \u500B\u6708${t.failures>0?`\uFF08${d(t.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708";return`<div class="judgment-backfill" data-judgment-backfill>
    <span class="badge ${t.pending>0?"badge-danger":"badge-ok"}" data-judgment-backfill-pending>${s}</span>
    <span class="badge badge-neutral" data-judgment-backfill-resume ${t.resume&&t.pending>0?"":"hidden"}>\u5F9E ${r(t.resume)} \u7E8C\u50B3</span>
    <span class="badge badge-info" data-judgment-backfill-verification>${r(t.verificationText)}</span>
    <span class="muted" data-judgment-backfill-last ${t.lastText?"":"hidden"}>${r(t.lastText)}</span>
  </div>`}function hu(e,t){let s=pr(t),a=e.querySelector("[data-judgment-backfill-pending]");a&&(a.textContent=s.pending>0?`\u5F85\u88DC\u9F4A ${d(s.pending)} \u500B\u6708${s.failures>0?`\uFF08${d(s.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708",a.classList.toggle("badge-danger",s.pending>0),a.classList.toggle("badge-ok",s.pending===0));let n=e.querySelector("[data-judgment-backfill-resume]");if(n){let l=!!s.resume&&s.pending>0;n.hidden=!l,n.textContent=l?`\u5F9E ${s.resume} \u7E8C\u50B3`:""}let i=e.querySelector("[data-judgment-backfill-verification]");i&&(i.textContent=s.verificationText);let o=e.querySelector("[data-judgment-backfill-last]");o&&(o.hidden=!s.lastText,o.textContent=s.lastText)}function mr(){return'<div class="judgment-months-loading"><span class="spinner"></span><span>\u8B80\u53D6\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B\u2026</span></div>'}function vu(e){if(e?.loading&&!e?.months?.length)return mr();if(e?.error&&!e?.months?.length)return Ee({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(e.error)});let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return'<div class="processing-empty">\u5C1A\u672A\u6709\u6708\u4EFD\u72C0\u614B\uFF1B\u8ACB\u5148\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u3002</div>';let s=new Map(t.map(o=>[sa(o),o])),n=[...new Set(t.map(o=>o.year))].sort((o,l)=>l-o).map(o=>{let l=Array.from({length:12},(m,f)=>{let p=s.get(`${o}-${String(f+1).padStart(2,"0")}`);return p?mu(p):`<td class="judgment-month is-empty"><span>${f+1}</span></td>`}).join("");return`<tr><th scope="row">${o}</th>${l}</tr>`}).join(""),i=e.summary||{};return`<div class="judgment-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" data-judgment-summary="green">\u6700\u65B0\u7248 ${d(i.green||0)}</span>
      <span class="badge badge-neutral" data-judgment-summary="gray">\u820A\u7248 ${d(i.gray||0)}</span>
      <span class="badge badge-danger" data-judgment-summary="red">\u7F3A\u5931 ${d(i.red||0)}</span>
      <span class="muted" data-judgment-total>\u5171 ${d(e.total_months||t.length)} \u500B\u6708</span>
    </div>
    ${bu(e)}
    <div class="judgment-months-scroll">
      <table class="judgment-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(o,l)=>`<th scope="col">${l+1}</th>`).join("")}</tr></thead>
        <tbody>${n}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint" data-judgment-hint>${r(jo(e))}</p>
  </div>`}function $u(e,t){let s=Array.isArray(t?.months)?t.months:[],a=t.summary||{},n={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"};e.querySelectorAll("[data-judgment-summary]").forEach(l=>{let m=l.dataset.judgmentSummary||"";l.textContent=`${n[m]||m} ${d(a[m]||0)}`});let i=e.querySelector("[data-judgment-total]");i&&(i.textContent=`\u5171 ${d(t.total_months||s.length)} \u500B\u6708`),hu(e,t);let o=e.querySelector("[data-judgment-hint]");if(o){let l=jo(t);o.textContent!==l&&(o.textContent=l)}for(let l of s){let m=sa(l),f=e.querySelector(`[data-judgment-month-key="${m}"]`);if(!f)continue;let p=l.status||"red";f.classList.contains(`is-${p}`)||(f.classList.remove("is-green","is-gray","is-red","is-empty"),f.classList.add(`is-${p}`));let $=Mo(l);f.title!==$&&(f.title=$);let b=f.querySelector(".judgment-month-download");if(l.download_url){let u=it(l.download_url);b?b.getAttribute("href")!==u&&(b.href=u):f.insertAdjacentHTML("beforeend",Lo(l))}else b&&b.remove()}}function yu(e){let t=Array.isArray(e)?e:[];return t.length?`<div class="processing-workflow-history">
    ${t.map(s=>`<div class="processing-workflow-history-row">
          <span class="processing-workflow-history-status">${At(s.status||"idle")}</span>
          <span class="mono">${r($e(s.started_at))}</span>
          <span class="mono">${r(de(s.duration_ms||0))}</span>
          <span class="processing-workflow-history-message">${r(s.message||"\u2014")}</span>
        </div>`).join("")}
  </div>`:'<div class="processing-workflow-empty">\u5C1A\u7121\u57F7\u884C\u7D00\u9304\u3002</div>'}function wu(e){let t=Array.isArray(e.update_history)?e.update_history:[];if(!t.length)return'<div class="processing-workflow-empty">\u5C1A\u7121\u7248\u672C\u6AA2\u67E5\u7D00\u9304\u3002</div>';let s={up_to_date:["\u5DF2\u662F\u6700\u65B0","badge-ok"],update_available:["\u6709\u66F4\u65B0","badge-warn"],error:["\u6AA2\u67E5\u5931\u6557","badge-danger"]};return`<div class="processing-workflow-history">
    ${t.map(a=>{let[n,i]=s[a.status]||[a.status||"\u672A\u77E5","badge-neutral"],o=a.remote_content_length!=null?qe(a.remote_content_length):"\u2014",l=a.local_version_id?`v${a.local_version_id}`:"\u2014";return`<div class="processing-workflow-history-row">
          <span class="badge ${i}">${r(n)}</span>
          <span class="mono">${r($e(a.checked_at))}</span>
          <span class="mono">\u9060\u7AEF ${r(o)}</span>
          <span class="mono">\u672C\u5730 ${r(l)}</span>
          <span class="processing-workflow-history-message">${r(a.message||"\u2014")}</span>
        </div>`}).join("")}
  </div>`}function To(e){let t=String(e.key||""),s=ps(e.status);return[`data-stage-key="${r(t)}"`,`data-stage-label="${r(e.label||t)}"`,`data-stage-color="${r(ko(e))}"`,`data-stage-status-key="${r(e.status||"idle")}"`,`data-stage-status="${r(s.label)}"`,`data-stage-percent="${r(dt(e.percent))}"`,`data-stage-counts="${r(dr(e))}"`,`data-stage-duration="${r(ta(e.duration_ms||0))}"`,`data-stage-contribution="${r(dt(e.contribution_percent))}"`,`data-stage-message="${r(e.message||"")}"`].join(" ")}function _u(e,t=Date.now()){let s=String(e.status||"idle"),a=Number(e.duration_ms)||0,n=Date.parse(e.started_at||"");if(s==="running"&&Number.isFinite(n))return Math.max(a,t-n);if(a>0)return a;let i=Date.parse(e.finished_at||"");return Number.isFinite(n)&&Number.isFinite(i)?Math.max(0,i-n):0}function No(e){if(e.key!=="filter")return null;let t=Number(e.financial_processed),s=Number(e.financial_matched);return e.financial_processed===null||e.financial_processed===void 0||!Number.isFinite(t)||!Number.isFinite(s)||t<=0?null:{processed:t,matched:s,percent:Math.round(s/t*100)}}function ku(e){let t=String(e.status||"idle"),s=[],a=Number(e.total);if(e.key==="postgres"&&["success","no_change"].includes(t)&&Number.isFinite(a)&&a>0)s.push(`\u7E3D\u8A08 ${d(a)} \u7B46`);else{let i=dr(e);i!=="\u2014"&&s.push(i)}let n=No(e);return n&&s.push(`\u91D1\u878D\u4F54\u6BD4 ${n.percent}%`),s.join(" \xB7 ")}function Su(e,t){let s=String(e.status||"idle"),a=[],n=(m,f,{always:p=!1}={})=>{let $=f==null?"":String(f).trim();!p&&!$||a.push(`<span class="rag-wf-detail"><span>${r(m)}</span><strong>${r($||"\u2014")}</strong></span>`)};n("\u72C0\u614B",ps(s).label,{always:!0}),n("\u958B\u59CB",e.started_at?$e(e.started_at):"\u2014",{always:!0}),n("\u7D50\u675F",e.finished_at?$e(e.finished_at):"\u2014",{always:!0}),n("\u8017\u6642",t,{always:!0}),n("\u9032\u5EA6",dt(e.percent),{always:!0});let i=dr(e),o=["extract","raw_parquet"].includes(String(e.key||""));n(o?"\u7D2F\u8A08\u8CC7\u6599\u91CF":"\u8CC7\u6599\u91CF",i!=="\u2014"?i:"");let l=No(e);return l&&(n("\u91D1\u878D\u6848\u4EF6",`${d(l.matched)} \u7B46`),n("\u5168\u90E8\u6848\u4EF6",`${d(l.processed)} \u7B46`),n("\u91D1\u878D\u4F54\u6BD4",`${l.percent}%`)),n("\u6574\u9AD4\u5360\u6BD4",dt(e.contribution_percent)),s==="failed"||s==="stale"?(n("\u539F\u56E0",e.error||e.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002"),n("\u5EFA\u8B70",e.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002")):n("\u8AAA\u660E",e.message),a.join("")}function xu(e){let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${g("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A host/model\u3001Blue-Green \u5EFA\u7F6E\u8207\u5404\u968E\u6BB5\u9032\u5EA6\u3002</div>
    </section>`;let a=new Map(s.map(k=>[String(k.key||""),k])),n=a.get("ollama")||{},i=a.get("qdrant")||{},o=a.get("validate")||{},l=e.index_runtime||{},m=l.summary||{},f=l.copy||{},p=l.current||{},$=l.embedding||{},b=$.selected||{},u=$.active||{},h=Number(l.expected_count||m.total||i.total||0),w=Number(m.indexed??i.current??0),_=h>0?Math.min(100,w/h*100):i.status==="success"?100:0,L=Number(f.total||0),S=Number(f.copied||0),x=L>0?Math.min(100,S/L*100):f.status==="success"?100:0,O=String(l.build_mode||""),ie=String(t.run_status||""),J=!!ie&&!["running","success","no_change"].includes(ie),he=String(f.status||(O==="reuse"?"pending":"skipped"));J&&he==="pending"&&(he="stale");let me=String(o.status||"pending"),Z=me==="success"&&/alias 已切換/.test(String(o.message||"")),j=Z?"success":me==="failed"?"failed":ie==="running"?"pending":"skipped",A=l.version_id?`v${String(l.version_id).padStart(3,"0")}`:"\u2014",E=u.host||b.host||u.url||b.url||"\u2014",X=u.port||b.port,W=X?`${E}:${X}`:String(E),B=u.model||b.model||l.model||"\u2014",le=p.month?`${Ja(p.month)}${p.preparing?"\uFF08\u6E96\u5099\u4E2D\uFF09":""}`:t.run_status==="running"?"\u6E96\u5099\u4E2D":"\u2014",ge=[{key:"probe",label:"llama-server \u4E3B\u6A5F\uFF0F\u6A21\u578B\u6E2C\u8A66",caption:"\u4E3B\u6A5F\uFF0F\u6A21\u578B\u3001\u9023\u7DDA\u6E2C\u8A66",color:"#22c55e",status:n.status||"pending",percent:Number(n.percent)||0,current:Number(n.current)||0,total:Number(n.total)||0,unit:"\u53F0",duration_ms:n.duration_ms,started_at:n.started_at,finished_at:n.finished_at,extraDetails:[["\u4E3B\u6A5F",W],["\u6A21\u578B",B],["\u6E2C\u8A66\u4E3B\u6A5F",`${d(n.current||0)} / ${d(n.total||0)} \u53F0`]],detail:`${d(n.current||0)} / ${d(n.total||0)} \u53F0 \xB7 ${W} \xB7 ${B}`},{key:"version",label:"\u5EFA\u7ACB\uFF0F\u63A5\u7E8C Blue-Green \u7248\u672C",caption:"Blue-Green \u7248\u672C\u3001collection",color:"#06b6d4",status:l.version_id?"success":"pending",percent:l.version_id?100:0,current:l.version_id?1:0,total:1,unit:"\u968E\u6BB5",duration_ms:l.version_duration_ms,started_at:null,finished_at:null,extraDetails:[["\u7248\u672C",A],["Collection",l.collection||"\u2014"],["\u6A21\u5F0F",O||"\u2014"]],detail:`${A} \xB7 ${l.collection||"\u2014"} \xB7 ${O||"\u2014"}`},{key:"copy",label:"\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF",caption:"\u820A collection \u5411\u91CF\u8907\u88FD",color:"#f59e0b",status:he,percent:x,current:S,total:L,unit:"points",duration_ms:f.duration_ms,started_at:f.started_at,finished_at:f.finished_at,extraDetails:[["\u5DF2\u8907\u88FD",`${d(S)} points`],["\u7E3D points",d(L)]],detail:L>0?`${d(S)} / ${d(L)} points \xB7 \u820A collection \u5411\u91CF`:he==="skipped"?"\u672C\u6B21\u4E0D\u9700\u8907\u88FD\u820A\u5411\u91CF":he==="stale"?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5B8C\u6210\u8907\u88FD":"\u7B49\u5F85\u820A collection \u8907\u88FD"},{key:"index",label:"\u91D1\u878D\u5224\u6C7A\u5411\u91CF\u7D22\u5F15",caption:"\u91D1\u878D\u5224\u6C7A\u5411\u91CF\u3001\u6279\u6B21\u9032\u5EA6",color:"#a78bfa",status:i.status||"pending",percent:_,current:w,total:h,unit:"\u7B46",duration_ms:i.duration_ms,started_at:i.started_at||l.started_at,finished_at:i.finished_at,extraDetails:[["\u5DF2\u7D22\u5F15",`${d(w)} / ${d(h)} \u7B46`],["\u91CD\u7528",d(m.reused)],["\u65B0 embedding",d(m.embedded)],["\u76EE\u524D\u6708\u4EFD",le]],detail:`${d(w)} / ${d(h)} \u7B46 \xB7 \u91CD\u7528 ${d(m.reused)} \xB7 \u65B0 embedding ${d(m.embedded)}`},{key:"validate",label:"\u9A57\u8B49\u65B0\u7248\u672C",caption:"\u7B46\u6578\u3001\u7DAD\u5EA6\u3001payload",color:"#eab308",status:me,percent:me==="success"?100:0,current:null,total:null,duration_ms:o.duration_ms,started_at:o.started_at,finished_at:o.finished_at,extraDetails:[["\u9A57\u8B49\u8A0A\u606F",o.message||"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210"]],detail:o.message||(J?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u9032\u884C\u9A57\u8B49\u3002":"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210\u5F8C\u9A57\u8B49\u7B46\u6578\u3001\u7DAD\u5EA6\u8207 payload\u3002")},{key:"activate",label:"\u5207\u63DB alias",caption:"judgments_current alias",color:"#3b82f6",status:j,percent:Z?100:0,current:null,total:null,duration_ms:0,started_at:null,finished_at:null,extraDetails:[["\u76EE\u6A19 alias","judgments_current"]],detail:Z?o.message:J?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5207\u63DB alias\u3002":"\u9A57\u8B49\u901A\u904E\u5F8C\u5207\u63DB judgments_current\u3002"}],F=ge.filter(k=>k.status!=="skipped"),fe=F.length?F.reduce((k,P)=>k+P.percent,0)/F.length:0,ee=ge.filter(k=>k.status==="success").length,xe=dt(fe),ve=Date.now(),ae=k=>{let P=Number(k.duration_ms)||0,K=Date.parse(k.started_at||"");if(k.status==="running"&&Number.isFinite(K))return Math.max(P,ve-K);if(P>0)return P;let H=Date.parse(k.finished_at||"");return Number.isFinite(K)&&Number.isFinite(H)?Math.max(0,H-K):0},ne=ge.map(k=>{let P=ae(k);return{...k,computedDuration:P,drawable:!["skipped","pending"].includes(k.status)}}),pe=Math.max(ne.reduce((k,P)=>k+(P.drawable?P.computedDuration:0),0),Number(t.duration_ms)||0,1),be=1.25,_e=ne.map(k=>k.drawable?Math.max(k.computedDuration/pe*100,be):0),ke=_e.reduce((k,P)=>k+P,0),Ne=ke>100?100/ke:1,Oe=0,G=ne.map((k,P)=>{let K=_e[P]*Ne,H=K>0?{start:Oe,width:K}:null;return H&&(Oe+=K),{...k,bar:H}}).map((k,P)=>{let K=[`is-${k.status}`,k.status==="failed"||k.status==="stale"?"is-error":"",["pending","skipped"].includes(k.status)?"is-missing":"",k.status==="running"?"is-running":""].filter(Boolean).join(" "),H=["pending","skipped"].includes(k.status)?"\u2014":ta(k.computedDuration),Re=k.status==="running"?` \xB7 ${dt(k.percent)}`:"",Se="";if(k.bar){let Ke=Math.max(0,Math.min(100,k.bar.start)),st=Math.max(0,Math.min(100-Ke,k.bar.width)),qt=k.status==="success"?100:Math.max(0,Math.min(100,Number(k.percent)||0)),Mt=st*qt/100,Ve=st-Mt,Ze=r(k.color);Mt>0&&(Se+=`<span class="rag-wf-bar index-wf-bar is-sequential" style="left:${Ke.toFixed(3)}%;width:${Mt.toFixed(4)}%;top:0;height:12px;--bar-color:${Ze}" aria-hidden="true"></span>`),Ve>1e-4&&(Se+=`<span class="rag-wf-bar index-wf-bar is-hollow is-sequential" style="left:${(Ke+Mt).toFixed(3)}%;width:${Ve.toFixed(4)}%;top:0;height:12px;--bar-color:${Ze}" aria-hidden="true"></span>`)}let Pe=[],Ie=(Ke,st)=>{st==null||st===""||Pe.push(`<span class="rag-wf-detail"><span>${r(Ke)}</span><strong>${r(String(st))}</strong></span>`)};Ie("\u72C0\u614B",ps(k.status).label),Ie("\u958B\u59CB",k.started_at?$e(k.started_at):"\u2014"),Ie("\u7D50\u675F",k.finished_at?$e(k.finished_at):"\u2014"),Ie("\u8017\u6642",H),Ie("\u9032\u5EA6",dt(k.percent));for(let[Ke,st]of k.extraDetails||[])Ie(Ke,st);Ie("\u8AAA\u660E",k.detail);let ut={...k,duration_ms:k.computedDuration,contribution_percent:F.length?(Number(k.percent)||0)/F.length:null,message:k.detail};return`<details class="rag-wf-stage index-wf-stage ${K}" data-index-stage="${r(k.key)}"${or.has(k.key)?" open":""} style="--stage-color:${r(k.color)}" ${To(ut)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="index-wf-step">${String(P+1).padStart(2,"0")}</span> ${r(k.label)}</strong><small>${r(k.caption||"")}</small></span>
            </span>
            <span class="rag-wf-stage-meta">${r(H)}${r(Re)} \xB7 ${r(ps(k.status).label)} <span class="rag-wf-chevron">${g("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px">${Se}</span>
        </summary>
        <div class="rag-wf-details">${Pe.join("")}</div>
      </details>`}).join("");return`<section class="report-card processing-card processing-workflow-progress-card index-wf-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${g("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
      <span class="badge ${t.run_status==="running"?"badge-info":"badge-neutral"}">${d(ee)} / ${d(F.length)} \u968E\u6BB5</span>
    </div>
    <div class="index-wf-summary">
      <span>\u6574\u9AD4 <strong class="mono">${xe}</strong></span>
      <span>\u7248\u672C <strong class="mono">${r(A)}</strong></span>
      <span>Collection <strong class="mono">${r(l.collection||"\u2014")}</strong></span>
      <span>\u6A21\u5F0F <strong>${r(O||"\u2014")}</strong></span>
      <span>Host <strong class="mono">${r(W)}</strong></span>
      <span>Model <strong class="mono">${r(B)}</strong></span>
      <span>\u76EE\u524D <strong>${r(le)}</strong></span>
    </div>
    <div class="index-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${pe>0?r(ta(pe)):"\u2014"}</span>
      </div>
      <div class="rag-wf-stages">${G}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7684\u7D50\u675F\u5373\u4E0B\u4E00\u968E\u6BB5\u7684\u958B\u59CB\uFF1B\u5DF2\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u9032\u884C\u4E2D\u6216\u672A\u5B8C\u6210\u968E\u6BB5\u53EA\u8457\u8272\u5DF2\u5B8C\u6210\u6BD4\u4F8B\uFF0C\u5176\u9918\u672A\u5B8C\u6210\u5340\u6BB5\u4EE5\u540C\u8272 25% \u6DFA\u8272\u8868\u793A\uFF0C\u7B49\u5F85\u968E\u6BB5\u4FDD\u7559\u7A7A\u5FC3\u8ECC\u9053\u3001\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\u3002\u6975\u77ED\u968E\u6BB5\u6703\u4EE5\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u5448\u73FE\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u9032\u5EA6\u8207\u8A73\u7D30\u6578\u64DA\u3002</p>
    </div>
    <div class="index-wf-overall">
      <div class="index-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${xe}</span>
      </div>
      <div class="index-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,fe)).toFixed(1)}%"></span>
      </div>
    </div>
  </section>`}function Au(e){if(e.id==="index_versions")return xu(e);let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${g("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u5404\u968E\u6BB5\u8207\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </section>`;let a=Date.now(),n=s.map(F=>{let fe=String(F.status||"idle");return{...F,status:fe,computedDuration:_u(F,a),drawable:!["pending","skipped","idle"].includes(fe)}}),i=n.filter(F=>F.status!=="skipped"),o=n.filter(F=>F.drawable).reduce((F,fe)=>F+fe.computedDuration,0),l=Math.max(o,Number(t.duration_ms)||0,1),m=n.some(F=>F.computedDuration>0),f=1.25,p=n.map(F=>F.drawable?Math.max(F.computedDuration/l*100,f):0),$=p.reduce((F,fe)=>F+fe,0),b=$>100?100/$:1,u=0,h=n.map((F,fe)=>{let ee=p[fe]*b,xe=F.drawable?{start:u,width:ee}:null;return xe&&(u+=ee),{...F,bar:xe}}),w=n.filter(F=>["success","no_change"].includes(F.status)).length,_=n.find(F=>F.status==="running"),L=n.filter(F=>F.status==="running").length,S=n.filter(F=>["pending","idle"].includes(F.status)).length,x=n.filter(F=>F.status==="skipped").length,O=i.length||Number(t.total_stages)||0,ie=t.overall_percent,J=ie==null||ie===""?null:Number(ie),he=Number.isFinite(J)?dt(J):"\u2014",me=m?ta(l):"\u2014",Z=String(t.run_status||""),j=Z?ps(Z).label:"\u2014",A=_&&(_.label||_.key)||"\u2014",E=n.map(F=>Date.parse(F.started_at||"")).filter(F=>Number.isFinite(F)),X=n.map(F=>Date.parse(F.finished_at||"")).filter(F=>Number.isFinite(F)),W=E.length?new Date(Math.min(...E)).toISOString():null,B=_?null:X.length?new Date(Math.max(...X)).toISOString():null,le=h.map((F,fe)=>{let ee=F.status,xe=["failed","stale","interrupted"].includes(ee),ve=[`is-${ee}`,xe?"is-error":"",["pending","skipped","idle"].includes(ee)?"is-missing":"",ee==="running"?"is-running":""].filter(Boolean).join(" "),ae=F.drawable?ta(F.computedDuration):"\u2014",ne=ps(ee).label,pe=ee==="failed"?`\u539F\u56E0\uFF1A${String(F.error||F.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002").trim()}
\u5EFA\u8B70\uFF1A${String(F.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002").trim()}`:"",be=pe?`<span class="badge badge-danger is-failure-tip" tabindex="0" aria-label="${r(pe)}" data-failure-tip="${r(pe)}"><span class="status-dot is-danger"></span>\u5931\u6557</span>`:r(ne),_e=ko(F),ke=xe?"var(--danger)":_e,Ne=ee==="running"?` \xB7 ${dt(F.percent)}`:"",Oe="";if(F.bar){let H=Math.max(0,Math.min(100,F.bar.start)),Re=Math.max(0,Math.min(100-H,F.bar.width)),Se=["success","no_change"].includes(ee)?100:Math.max(0,Math.min(100,Number(F.percent)||0)),Pe=Re*Se/100,Ie=Re-Pe;Pe>0&&(Oe+=`<span class="rag-wf-bar workflow-wf-bar is-sequential" style="left:${H.toFixed(3)}%;width:${Pe.toFixed(4)}%;top:0;height:12px;--bar-color:${r(ke)}" aria-hidden="true"></span>`),Ie>1e-4&&(Oe+=`<span class="rag-wf-bar workflow-wf-bar is-hollow is-sequential" style="left:${(H+Pe).toFixed(3)}%;width:${Ie.toFixed(4)}%;top:0;height:12px;--bar-color:${r(ke)}" aria-hidden="true"></span>`)}let I=F.label||F.key||"\u968E\u6BB5",G=ku(F),k=`${I}\uFF1A${ne}\uFF0C${ee==="running"?`\u9032\u5EA6 ${dt(F.percent)}\uFF0C`:""}\u8017\u6642 ${ae}`,P={...F,duration_ms:F.computedDuration,message:pe||F.message||G||""},K=`${e.id}:${F.key||fe}`;return`<details class="rag-wf-stage workflow-wf-stage ${ve}" data-workflow-wf-stage="${r(K)}"${lr.has(K)?" open":""} style="--stage-color:${r(_e)}" ${To(P)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="workflow-wf-step">${String(fe+1).padStart(2,"0")}</span> ${r(I)}</strong>${G?`<small>${r(G)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(ae)}${r(Ne)} \xB7 ${be} <span class="rag-wf-chevron">${g("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(k)}">${Oe}</span>
        </summary>
        <div class="rag-wf-details">${Su(F,ae)}</div>
      </details>`}).join(""),ge=Jd[e.id]||"";return`<section class="report-card processing-card processing-workflow-progress-card workflow-wf-card" data-workflow-progress>
    <div class="side-card-head index-runtime-head workflow-wf-head">
      <span class="side-card-title">${g("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
      <div class="index-runtime-metrics workflow-wf-metrics">
        <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u5168\u90E8\u968E\u6BB5\u7684\u6578\u91CF\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${w} / ${O}</strong></span>
        <span class="index-runtime-metric" title="\u76EE\u524D\u57F7\u884C\u4E2D\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u57F7\u884C\u4E2D</span><strong>${L}</strong></span>
        <span class="index-runtime-metric" title="\u5C1A\u672A\u958B\u59CB\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7B49\u5F85</span><strong>${S}</strong></span>
        <span class="index-runtime-metric" title="\u672C\u6B21\u6D41\u7A0B\u4E0D\u9700\u8981\u57F7\u884C\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7565\u904E</span><strong>${x}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u968E\u6BB5\u8017\u6642\u5408\u8A08\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(me)}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u53C3\u8207\u968E\u6BB5\u5B8C\u6210\u6BD4\u4F8B\u7684\u5E73\u5747\u3002"><span>\u6574\u9AD4\u9032\u5EA6</span><strong>${he}</strong></span>
      </div>
    </div>
    <div class="workflow-wf-summary">
      <span>\u57F7\u884C <strong>${r(j)}</strong></span>
      <span>\u958B\u59CB <strong>${W?r($e(W)):"\u2014"}</strong></span>
      <span>\u7D50\u675F <strong>${_?"\u9032\u884C\u4E2D":B?r($e(B)):"\u2014"}</strong></span>
      <span>\u76EE\u524D <strong>${r(A)}</strong></span>
      <span>Run <strong class="mono">${r(t.run_id||"\u2014")}</strong></span>
    </div>
    <div class="workflow-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${r(me)}</span>
      </div>
      <div class="rag-wf-legend workflow-wf-legend" aria-label="\u968E\u6BB5\u72C0\u614B\u5716\u4F8B">
        <span><i class="is-solid-state"></i>\u5B8C\u6210</span>
        <span><i class="is-hollow-state"></i>\u672A\u5B8C\u6210\uFF0825% \u6DFA\u8272\uFF09</span>
        <span><i class="is-progress-state"></i>\u57F7\u884C\u4E2D\uFF08\u9032\u5EA6\u689D\uFF09</span>
        <span><i class="is-empty-state"></i>\u7B49\u5F85\uFF0F\u7565\u904E</span>
      </div>
      <div class="rag-wf-stages">${le}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7684\u7D50\u675F\u5373\u4E0B\u4E00\u968E\u6BB5\u7684\u958B\u59CB\uFF1B\u5DF2\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u57F7\u884C\u4E2D\u6216\u672A\u5B8C\u6210\u968E\u6BB5\u53EA\u8457\u8272\u5DF2\u5B8C\u6210\u6BD4\u4F8B\uFF0C\u5176\u9918\u672A\u5B8C\u6210\u5340\u6BB5\u4EE5\u540C\u8272 25% \u6DFA\u8272\u8868\u793A\uFF0C\u7B49\u5F85\u968E\u6BB5\u4FDD\u7559\u7A7A\u5FC3\u8ECC\u9053\u3001\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\u3002\u6975\u77ED\u968E\u6BB5\u6703\u4EE5\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u5448\u73FE\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u9032\u5EA6\u8207\u8A73\u7D30\u6578\u64DA\u3002</p>
    </div>
    <div class="workflow-wf-overall">
      <div class="workflow-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${he}</span>
      </div>
      <div class="workflow-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,Number.isFinite(J)?J:0)).toFixed(1)}%"></span>
      </div>
    </div>
    ${ge?`<p class="processing-workflow-scope-note">${g("info",12)}<span>${r(ge)}</span></p>`:""}
  </section>`}function Ja(e){let t=String(e||"");return t.length===6?`${t.slice(0,4)}-${t.slice(4)}`:t||"\u2014"}function qu(e,t=!1){let s=Number(e?.reused),a=Number(e?.embedded);if(!Number.isFinite(s)||!Number.isFinite(a)||s<=0&&a<=0)return"";let n=[];if(s>0&&n.push(`<span class="index-current-phase is-reuse"
      title="R \xB7 \u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF0C\u672C\u6279 ${d(s)} \u7B46">
      <strong>R</strong><span>\u6CBF\u7528 ${d(s)} \u7B46</span>
    </span>`),a>0){let i=e.phase==="embedding"&&t?"\u8A08\u7B97\u4E2D":"\u65B0 embedding";n.push(`<span class="index-current-phase is-embed"
      title="E \xB7 \u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding\uFF0C\u672C\u6279 ${d(a)} \u7B46">
      <strong>E</strong><span>${i} ${d(a)} \u7B46</span>
    </span>`)}return`<span class="index-current-phases" aria-label="\u672C\u6279\u6B21 R\uFF0FE \u52D5\u4F5C">
    <span class="index-current-phase-label">\u672C\u6279</span>
    ${n.join("")}
  </span>`}function Mu(e){let t=Array.isArray(e.months)?e.months:[],s=new Map;for(let n of t){let i=String(n.month||"");if(!/^\d{6}$/.test(i))continue;let o=s.get(i);o||(o={total:0,processed:0},s.set(i,o)),o.total+=Number(n.total)||0,o.processed+=Number(n.processed)||0}let a=0;for(let n of s.values())n.total>0&&n.processed>=n.total&&(a+=1);return{completed:a,total:s.size}}function Ua(e){let t=String(e||"").match(/(\d{8})Update/i);return t?Number(t[1]):0}function ts(e){let t=Number(e);return Number.isFinite(t)&&t>0?t:0}function rr(e,t){let s=ts(t),a=ts(e);if(s<=0)return{processed:0,total:0,percent:null,fill:0,complete:!1,empty:!0,stateClass:"is-empty"};let n=Math.min(100,Math.round(a/s*1e3)/10),i=a>=s;return{processed:a,total:s,percent:n,fill:i?100:n,complete:i,empty:!1,stateClass:i?"is-complete":"is-incomplete"}}function Lu(e){let t=Array.isArray(e.months)?e.months:[],s=e.current||{},a=!!e.coverage_only,n=e.active_coverage||{},i=e.active_archive_coverage||{},o=new Map;for(let p of t){let $=String(p.month||"");if(!/^\d{6}$/.test($))continue;let b=Number($.slice(4,6));if(b<1||b>12)continue;let u=o.get($);u||(u={key:$,year:$.slice(0,4),monthNo:b,rows:[],archives:[],current:!1,preparing:!1,currentArchive:"",jid:""},o.set($,u));let h=String(p.archive||"");u.rows.push({archive:h,total:ts(p.total),processed:ts(p.processed)}),h&&u.archives.push(h),s.month===$&&(!s.archive||s.archive===h)&&(u.current=!0,u.preparing=!!s.preparing,u.currentArchive=String(s.archive||h||""),u.jid=String(s.jid||""))}if(!o.size)return'<div class="processing-workflow-empty">\u5C1A\u7121\u53EF\u986F\u793A\u7684\u7D22\u5F15\u6708\u4EFD\uFF1B\u958B\u59CB\u7D22\u5F15\u5F8C\u6703\u4F9D\u6642\u9593\u5217\u51FA\u6708\u4EFD\u72C0\u614B\u3002</div>';let l={active:0,reuseComplete:0,reuseIncomplete:0,embedComplete:0,embedIncomplete:0};for(let p of o.values()){let $=[...p.rows].sort((W,B)=>Ua(B.archive)-Ua(W.archive)),b=$[0],u=$.length>1?$.slice(1):[b],h=n[p.key]||{},w=i[p.key]||{},_=ts(h.total),L=ts(h.processed),S=w[b.archive],x=ts(S?.total),O=ts(S?.processed),ie=x>0&&O>=x,J=new Map;if(a||!ie)for(let W of $)J.set(W.archive,W.processed);else{let W=0;for(let ge of $){let F=w[ge.archive];if(!F)continue;let fe=ts(F.processed);W+=fe,J.set(ge.archive,Math.max(fe,ge.processed))}let B=_>0?Math.max(0,L-W):0,le=u.filter(ge=>!w[ge.archive]).sort((ge,F)=>Ua(ge.archive)-Ua(F.archive));for(let ge of le){let F=Math.min(ge.total,B);B-=F,J.set(ge.archive,Math.max(ge.processed,F))}!w[b.archive]&&!J.has(b.archive)&&J.set(b.archive,Math.max(b.processed,Math.min(b.total,B)))}let he=u.reduce((W,B)=>W+B.total,0),me=u.reduce((W,B)=>W+(J.has(B.archive)?J.get(B.archive):B.processed),0),Z=b.total,j=J.has(b.archive)?J.get(b.archive):b.processed;a?(_=$.reduce((W,B)=>W+B.total,0),L=$.reduce((W,B)=>W+B.processed,0)):_<=0&&(_=he,L=me);let A=rr(L,_),E=rr(me,he),X=rr(j,Z);p.latest=b,p.baselineRows=u,p.activeState=A,p.reuseState=E,p.embedState=X,p.reuseComplete=E.complete,p.embedComplete=X.complete,A.complete&&(l.active+=1),E.complete?l.reuseComplete+=1:l.reuseIncomplete+=1,X.complete?l.embedComplete+=1:l.embedIncomplete+=1}let f=[...new Set([...o.values()].map(p=>p.year))].sort((p,$)=>$.localeCompare(p)).map(p=>{let $=Array.from({length:12},(b,u)=>{let h=u+1,w=`${p}${String(h).padStart(2,"0")}`,_=o.get(w);if(!_)return`<td class="judgment-month is-empty"><span>${h}</span></td>`;let L=_.current&&e.run_status==="running",S=J=>J.percent===null?"\u2014":`${J.percent}%`,x=J=>J.empty?"\u7121\u8CC7\u6599":J.complete?"\u5B8C\u6210":"\u672A\u5B8C\u6210",O=[`${_.year}-${String(_.monthNo).padStart(2,"0")}`,_.archives.join("\u3001")||"\u2014",`A \u4E0A\u4E00\u500B\u6B63\u5F0F\u7248\u672C ${d(_.activeState.processed)} / ${d(_.activeState.total)}\uFF08${S(_.activeState)}\uFF09\xB7 ${x(_.activeState)}`,`A\uFF0FR \u57FA\u7DDA ${d(_.reuseState.processed)} / ${d(_.reuseState.total)}\uFF08${S(_.reuseState)}\uFF09\xB7 ${x(_.reuseState)}`,`E \u65B0 embedding ${d(_.embedState.processed)} / ${d(_.embedState.total)}\uFF08${S(_.embedState)}\uFF09\xB7 ${x(_.embedState)}`,_.reuseComplete?"":"\u5F85\u5B8C\u6210\uFF1AR \u65E2\u6709\u5411\u91CF\u91CD\u7528",_.embedComplete?"":"\u5F85\u5B8C\u6210\uFF1AE \u65B0 embedding",_.current?`${_.preparing?"\u6E96\u5099\u7D22\u5F15":L?"\u76EE\u524D\u7D22\u5F15":"\u6700\u5F8C\u7D22\u5F15"}${_.jid?` \xB7 ${_.jid}`:""}`:""].filter(Boolean).join(" \xB7 "),ie=[["is-active",_.activeState],["is-reuse",_.reuseState],["is-embed",_.embedState]].map(([J,he])=>`<span class="index-month-block ${J} ${he.stateClass}" style="--fill:${he.fill.toFixed(1)}%"></span>`).join("");return`<td class="judgment-month index-month index-month-are processing-month is-neutral${L?" is-current":""}" title="${r(O)}"${L?' aria-current="true"':""}><span class="index-month-number">${h}</span><span class="index-month-blocks" aria-hidden="true">${ie}</span></td>`}).join("");return`<tr><th scope="row">${r(p)}</th>${$}</tr>`}).join("");return`<div class="judgment-months index-months">
    <div class="index-runtime-summary index-month-are-summary">
      <span title="A\uFF1A\u4E0A\u4E00\u500B\u6B63\u5F0F\u7248\u672C\u57FA\u7DDA archive \u5DF2\u5B8C\u6210\u7684\u6708\u4EFD\u6578\uFF1B\u4E0D\u5217\u5165\u65B0\u7248\u672C\u5B8C\u6210\u6578\uFF1B\u4EE5\u6708\u4EFD\u8A08\u3002">A \u57FA\u7DDA\u6708\u4EFD <strong class="mono">${d(l.active)}</strong></span>
      <span title="R \u5B8C\u6210\uFF1A\u57FA\u7DDA archive \u5DF2\u5B8C\u6210\u4E14\u53EF\u6CBF\u7528\u7684\u6708\u4EFD\u6578\uFF1B\u5305\u542B latest archive \u5DF2\u5B8C\u6574\u8986\u84CB\u3001\u7121 E backlog \u7684\u672A\u8B8A\u66F4\u6708\u4EFD\uFF1B\u4EE5\u6708\u4EFD\u8A08\u3002">R \u5B8C\u6210\u6708\u4EFD <strong class="mono">${d(l.reuseComplete)}</strong></span>
      <span title="R \u672A\u5B8C\u6210\uFF1A\u4ECD\u6709 E backlog \u4E14\u5C1A\u672A\u5B8C\u6210 R \u7684\u6708\u4EFD\u6578\uFF1B\u4EE5\u6708\u4EFD\u8A08\u3002">R \u672A\u5B8C\u6210\u6708\u4EFD <strong class="mono">${d(l.reuseIncomplete)}</strong></span>
      <span title="E \u5B8C\u6210\uFF1Alatest archive \u5DF2\u5B8C\u6574\u8986\u84CB\u3001\u7121\u9700\u65B0 embedding \u7684\u6708\u4EFD\u6578\uFF1B\u5305\u542B\u672A\u8B8A\u66F4\u6708\u4EFD\uFF1B\u4EE5\u6708\u4EFD\u8A08\uFF0C\u4E0D\u662F RAR \u6A94\u6578\u3002">E \u5B8C\u6210\u6708\u4EFD <strong class="mono">${d(l.embedComplete)}</strong></span>
      <span title="E \u672A\u5B8C\u6210\uFF1Alatest archive \u4ECD\u6709\u5F85\u88DC\u65B0 embedding \u7684\u6708\u4EFD\u6578\uFF1B\u4EE5\u6708\u4EFD\u8A08\uFF0C\u4E0D\u662F RAR \u6A94\u6578\u3002">E \u672A\u5B8C\u6210\u6708\u4EFD <strong class="mono">${d(l.embedIncomplete)}</strong></span>
      <span>\u7E3D\u6708\u4EFD <strong class="mono">${d(o.size)}</strong></span>
    </div>
    <div class="index-month-are-key processing-timeline-legend" aria-label="A\uFF0FR\uFF0FE \u968E\u6BB5\u5716\u4F8B">
      <span class="processing-timeline-legend-label">\u968E\u6BB5</span>
      <span><i class="is-active"></i>A \xB7 \u4E0A\u4E00\u500B\u6B63\u5F0F\u7248\u672C\u65E2\u6709\u8986\u84CB</span>
      <span><i class="is-reuse"></i>R \xB7 \u672C\u6B21\u6CBF\u7528\u65E2\u6709\u5411\u91CF</span>
      <span><i class="is-embed"></i>E \xB7 \u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding</span>
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
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(p,$)=>`<th scope="col">${$+1}</th>`).join("")}</tr></thead>
        <tbody>${f}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA A\uFF08\u4E0A\u4E00\u500B\u6B63\u5F0F\u7248\u672C\u65E2\u6709\u8986\u84CB\uFF09\u3001R\uFF08\u672C\u6B21\u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF09\u3001E\uFF08\u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding\uFF09\u3002A \u4E0D\u5217\u5165\u65B0\u7248\u672C\u5B8C\u6210\u6578\uFF0CR\uFF0FE \u624D\u662F\u672C\u6B21\u5EFA\u7F6E\u9032\u5EA6\uFF1B\u5B8C\u6210\u70BA\u5BE6\u5FC3\uFF1B\u672A\u5B8C\u6210\u6642\u5DF2\u5B8C\u6210\u6BD4\u4F8B\u70BA\u5BE6\u8272\u3001\u5269\u9918\u5340\u6BB5\u70BA\u540C\u8272 25% \u6DFA\u8272\uFF0C\u56E0\u6B64 0% \u6642\u6574\u683C\u90FD\u662F\u6DFA\u8272\uFF1B\u7121\u8CC7\u6599\u624D\u662F\u6DE1\u8272\u7A7A\u5FC3\u3002\u6700\u65B0 archive \u5DF2\u88AB active collection \u5B8C\u6574\u8986\u84CB\uFF08\u7121 E backlog\uFF09\u7684\u672A\u8B8A\u66F4\u6708\u4EFD\uFF0CR\uFF0FE \u53EF\u4F7F\u7528 active \u8986\u84CB\u986F\u793A\u5B8C\u6210\uFF1B\u4ECD\u6709 E backlog \u7684\u6708\u4EFD\uFF0CR\uFF0FE \u53EA\u4F7F\u7528\u672C\u6B21 run \u7684 processed\uFF0Ftotal\uFF0C\u672A\u8655\u7406\u524D\u7DAD\u6301\u6DFA\u8272\u3002summary \u8207\u65B9\u584A\u4F7F\u7528\u540C\u4E00\u4EFD\u72C0\u614B\uFF0Csidebar \u66F4\u65B0 badge \u53E6\u4EE5 E backlog \u6708\u4EFD\u8A08\u3002\u540C\u4E00\u6708\u4EFD\u53EF\u80FD\u6709\u591A\u500B archive\uFF0CA\uFF0FR \u4F7F\u7528\u8F03\u820A\u7684\u57FA\u7DDA archive\uFF0CE \u4F7F\u7528\u540D\u7A31\u4E2D\u66F4\u65B0\u65E5\u671F\u6700\u65B0\u7684 archive\uFF1B\u65B0\u820A archive \u4E0D\u6703\u76F8\u52A0\u3002E \u5B8C\u6210\uFF0F\u672A\u5B8C\u6210\u4EE5\u6708\u4EFD\u8A08\uFF0C\u4E0D\u662F RAR \u6A94\u6578\u3002\u76EE\u524D\u7D22\u5F15\u6708\u4EFD\u4EE5\u5BE6\u7DDA\u5916\u6846\u6A19\u793A\uFF0Cpadding \u4E0D\u4F7F\u7528\u72C0\u614B\u5E95\u8272\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B active \u8986\u84CB\u3001A\uFF0FR \u57FA\u7DDA\u3001E \u9032\u5EA6\u8207\u76EE\u524D\u6848\u865F\u3002</p>
  </div>`}function ju(e){let t=e.import_timeline||{},s=Array.isArray(t.months)?t.months:[];if(!s.length)return`<section class="report-card processing-card import-files-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u672A\u53D6\u5F97\u5224\u6C7A\u4E0B\u8F09 manifest \u6216\u672C\u6A5F\u58D3\u7E2E\u6A94\uFF1B\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u5F8C\u6703\u986F\u793A\u6708\u4EFD\u72C0\u614B\u3002</div>
    </section>`;let a=new Map(s.map(b=>[String(b.month),b])),n=[...new Set(s.map(b=>b.year))].sort((b,u)=>u-b),i=["extract","raw_parquet","filter","postgres"],o=t.stage_labels||{},l=n.map(b=>{let u=Array.from({length:12},(h,w)=>{let _=w+1,L=`${b}${String(_).padStart(2,"0")}`,S=a.get(L);return ur({month:S,year:b,monthNo:_,stageOrder:i,stageLabels:o,stageStatuses:S?.import_stages||{},stageProgress:S?.import_stage_progress||{},overall:S?.import_overall||"empty",active:!!S?.active,processing:String(S?.month||"")===String(t.processing_month||""),workflowForStage:()=>"judgment_import",variant:"import"})}).join("");return`<tr><th scope="row">${r(b)}</th>${u}</tr>`}).join(""),m=t.summary||{},f=t.stage_summary||{},p=s.find(b=>b.active),$=p?`<div class="index-current-row">${xo({activeMonth:t.active_month||String(p.month||""),activeArchive:t.active_archive||p.active_archive||"",activePhase:t.active_phase||"",processingMonth:t.processing_month||"",processingArchive:t.processing_archive||"",stageLabels:o})}</div>`:"";return`<section class="report-card processing-card import-files-card" data-import-timeline="judgment">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${g("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
      ${eu(t,s,f,m)}
    </div>
    ${$}
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(b,u)=>`<th scope="col">${u+1}</th>`).join("")}</tr></thead>
          <tbody>${l}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\uFF1ARAR \u6AA2\u67E5\uFF0F\u89E3\u58D3\u7E2E\u3001\u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD\u3001\u91D1\u878D\u6CD5\u898F\u7BE9\u9078\u3001PostgreSQL metadata\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF1B\u6709\u5F85\u66F4\u65B0\u6A94\u6848\u6642\uFF0C\u5C1A\u672A\u91CD\u505A\u7684\u56DB\u500B\u968E\u6BB5\u65B9\u683C\u4EE5\u6DFA\u6A58\uFF0F\u6DFA\u7D05\uFF0F\u6DFA\u7D2B\uFF0F\u6DFA\u85CD\u8868\u793A\uFF0C\u5B8C\u6210\u5F8C\u8F49\u70BA\u5BE6\u5FC3\u6DF1\u8272\uFF1B\u5C1A\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF1B\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u5B8C\u6210\u8272\u5782\u76F4\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u672A\u5B8C\u6210\u5340\u6BB5\u7DAD\u6301 25% \u6DFA\u8272\uFF1B\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u539F\u59CB\u8CC7\u6599\u968E\u6BB5\u6703\u5148\u6AA2\u67E5\u65E2\u6709 Parquet\uFF0C\u53EF\u6CBF\u7528\u6642\u4E0D\u91CD\u65B0\u5099\u4EFD\uFF1B\u7F3A\u5C11\u6642\u6703\u986F\u793A\u300C\u5EFA\u7ACB YYYY-MM \u5099\u4EFD\u300D\uFF0C\u5B8C\u6210\u5F8C\u986F\u793A\u300C\u5DF2\u5EFA\u7ACB\u5099\u4EFD\u300D\u3002\u7BE9\u9078\u8207 PostgreSQL \u968E\u6BB5\u6703\u986F\u793A\u76EE\u524D\u8655\u7406\u7684\u6708\u4EFD\u8207 archive\u3002\u5BE6\u7DDA\u6846\u6A19\u793A\u76EE\u524D\u532F\u5165\u6708\u4EFD\uFF1B\u82E5\u5BE6\u969B\u8655\u7406\u7684\u662F\u8F03\u820A\u6708\u4EFD\uFF0C\u8A72\u6708\u53E6\u4EE5\u865B\u7DDA\u6846\u6A19\u793A\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u56DB\u500B\u968E\u6BB5\u7684\u72C0\u614B\u3001\u672C\u6A5F\u58D3\u7E2E\u6A94\u8207\u5DF2\u532F\u5165\u6A94\u540D\u3002</p>
    </div>
  </section>`}function Tu(e,t,s){let n=[t.run_id||e.active_run?.id||e.last_run?.id||"",t.version_id??"",t.collection||"",t.started_at||""].join("|"),i=Date.now(),o=go.get(n);if(!o){let b=Date.parse(t.started_at||""),u=Date.parse(t.finished_at||""),h=Date.parse(t.updated_at||"");t.run_status!=="running"&&Number.isFinite(b)&&(Number.isFinite(u)||Number.isFinite(h))?o={at:b,indexed:0}:o={at:i,indexed:Math.max(0,s)},go.set(n,o)}let l=Date.parse(t.finished_at||""),m=Date.parse(t.updated_at||""),f=t.run_status==="running"?i:Number.isFinite(l)?l:Number.isFinite(m)?m:i,p=Math.max(0,(f-Number(o.at||0))/1e3),$=Math.max(0,Number(s)-Number(o.indexed||0));return p<=0||$<=0?0:$/p}function ta(e){let t=Number(e);return!Number.isFinite(t)||t<0?"\u2014":t>=36e5?Eo(t):de(t)}function Eo(e){if(!Number.isFinite(e)||e<0)return"\u2014";let t=Math.max(0,Math.round(e/1e3)),s=Math.floor(t/3600),a=Math.floor(t%3600/60),n=t%60,i=String(n).padStart(2,"0");return s>0?`${s}h ${String(a).padStart(2,"0")}m ${i}s`:a>0?`${a}m ${i}s`:`${n}s`}function Nu(e,t,s,a){let n=Date.parse(e.started_at||"");if(!Number.isFinite(n))return{elapsedMs:null,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let i=e.run_status==="running",o=Date.parse(e.finished_at||""),l=Date.parse(e.updated_at||""),m=i?Date.now():Number.isFinite(o)?o:Number.isFinite(l)?l:Date.now(),f=Math.max(0,m-n),p=Number(s),$=Number(t);if(!Number.isFinite(p)||p<=0)return{elapsedMs:f,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let b=Math.max(0,p-Math.max(0,Number.isFinite($)?$:0));if(b<=0)return{elapsedMs:f,estimatedTotalMs:f,remainingMs:0,remainingCount:0};if(!i||a<=0)return{elapsedMs:f,estimatedTotalMs:null,remainingMs:null,remainingCount:b};let u=b/a*1e3;return{elapsedMs:f,estimatedTotalMs:f+u,remainingMs:u,remainingCount:b}}function Eu(e){let t=e.index_runtime||{};if(!t.available)return"";let s=!!t.coverage_only,a=t.current||{},n=t.summary||{},i=Number(n.indexed??a.indexed??0),o=s?0:Tu(e,t,i),l=Mu(t),m=s?null:Nu(t,i,n.total,o),f=m?.remainingCount>0?`\u8207\u5269\u9918 ${d(m.remainingCount)} \u7B46`:"",p=o>0?`\u4F9D\u672C\u6B21\u5E73\u5747 ${o.toFixed(1)} \u7B46/\u79D2${f}\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002\u5BE6\u969B\u901F\u5EA6\u6703\u96A8 embedding \u8207\u6279\u6B21\u5927\u5C0F\u8B8A\u52D5\u3002`:"\u5C1A\u7121\u8DB3\u5920\u7684\u672C\u9801\u89C0\u5BDF\u8CC7\u6599\u53EF\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002",$=w=>r(Eo(m?m[w]:null)),b=`<div class="index-runtime-metrics">
    <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u7D22\u5F15\u7684\u6708\u4EFD\u6578\uFF1B\u76EE\u524D\u8655\u7406\u4E2D\u7684\u6708\u4EFD\u4E0D\u5217\u5165\uFF0C\u7E3D\u6578\u70BA\u7D22\u5F15\u7BC4\u570D\u5167\u7684\u6709\u6548\u6708\u4EFD\u3002">
      <span>\u5DF2\u8655\u7406\u6708\u4EFD</span>
      <strong>${d(l.completed)} / ${d(l.total)}</strong>
    </span>
    <span class="index-runtime-metric" title="\u5DF2\u7D22\u5F15\u7B46\u6578 / \u7D22\u5F15\u7BC4\u570D\u7E3D\u7B46\u6578\u3002">
      <span>\u5DF2\u8655\u7406\u7B46\u6578</span>
      <strong>${d(i)} / ${d(n.total)}</strong>
    </span>
    <span class="index-runtime-metric" title="\u81EA\u672C\u6B21\u9801\u9762\u958B\u59CB\u89C0\u5BDF\u7684\u7D2F\u8A08\u5E73\u5747\uFF1B\u4E2D\u9014\u52A0\u5165\u4EE5\u9996\u6B21\u89C0\u5BDF\u6642\u9593\u8207\u7B46\u6578\u70BA\u57FA\u6E96\u3002\u5F8C\u6BB5\u82E5\u4EE5\u65B0 embedding \u70BA\u4E3B\uFF0C\u901F\u5EA6\u6703\u4E0B\u964D\u3002">
      <span>\u672C\u6B21\u5E73\u5747</span>
      <strong>${o>0?`${o.toFixed(1)} \u7B46/\u79D2`:"\u2014"}</strong>
    </span>
    <span class="index-runtime-metric" title="\u81EA\u672C\u6B21\u7D22\u5F15 run \u958B\u59CB\u6642\u9593 ${r($e(t.started_at))} \u8D77\u7B97\uFF1B\u4E2D\u9014\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002">
      <span>Elapsed Time</span>
      <strong>${$("elapsedMs")}</strong>
    </span>
    <span class="index-runtime-metric" title="Elapsed Time \u52A0\u4E0A\u4F9D\u5269\u9918\u4EF6\u6578\u8207\u672C\u6B21\u5E73\u5747\u901F\u5EA6\u4F30\u7B97\u7684\u5269\u9918\u6642\u9593\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u5F9E 0 \u91CD\u65B0\u8A08\u6642\u3002">
      <span>Estimated Total</span>
      <strong>${$("estimatedTotalMs")}</strong>
    </span>
    <span class="index-runtime-metric" title="${r(p)}">
      <span>Time Remaining</span>
      <strong>${$("remainingMs")}</strong>
    </span>
  </div>`,u=t.run_status==="running"?a.preparing?"\u6E96\u5099\u4E2D":"\u76EE\u524D\u8655\u7406":"\u6700\u5F8C\u8655\u7406",h=a.jid?`<div class="index-current-row">
        <span class="badge badge-info">${g("activity",11)}${u}</span>
        <strong class="mono">${r(Ja(a.month))}</strong>
        <span class="mono">${r(a.archive||"\u2014")}</span>
        ${a.preparing?"":qu(a,t.run_status==="running")}
        <span class="mono">${r(a.jid||"\u2014")}</span>
        <span class="index-current-copy">${r([a.court,a.title].filter(Boolean).join(" \xB7 ")||"\u2014")}</span>
        <span class="faint">${a.preparing?"\u6E96\u5099\u4E2D":`\u6279\u6B21 ${d(a.batch_size)} \u7B46`}</span>
      </div>`:"";return`<section class="report-card processing-card index-files-card">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${g("table",14)}\u7D22\u5F15\u6A94\u6848\u6642\u9593\u8868</span>
      ${b}
    </div>
    ${t.error?`<div class="processing-update-notice index-runtime-error">${g("alert",13)}<span>${r(t.error)}</span></div>`:""}
    <div class="index-runtime-summary">
      <span>\u7248\u672C <strong class="mono">v${r(t.version_id??"\u2014")}</strong></span>
      <span>Collection <code>${r(t.collection||"\u2014")}</code></span>
      <span>\u6A21\u5F0F <strong>${r(t.build_mode||"\u2014")}</strong></span>
      ${s?"":`<span>\u91CD\u7528 <strong class="mono">${d(n.reused)}</strong></span>
            <span>\u65B0 embedding <strong class="mono">${d(n.embedded)}</strong></span>`}
    </div>
    ${h}
    ${Lu(t)}
    ${s?'<p class="judgment-months-hint index-coverage-note">\u76EE\u524D\u986F\u793A active collection \u7684\u6708\u4EFD\u7D22\u5F15\u8986\u84CB\uFF1B\u57F7\u884C Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u5F8C\u6703\u986F\u793A\u672C\u6B21\u7D22\u5F15\u9032\u5EA6\u8207 A\uFF0FR\uFF0FE \u6642\u9593\u8868\u3002</p>':""}
  </section>`}function Ru(e={}){let{storage:t,loading:s,error:a}=e;if(a)return`<section class="report-card processing-card index-storage-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
        <button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-index-storage">${g("refresh",12)}<span>\u91CD\u65B0\u6574\u7406</span></button>
      </div>
      <div class="processing-workflow-empty">${r(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card index-storage-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
        <span class="badge badge-neutral">${s?"\u8B80\u53D6\u4E2D":"\u5C1A\u7121"}</span>
      </div>
      <div class="processing-workflow-empty">${s?"\u6B63\u5728\u53D6\u5F97 Docker \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u2026":"\u5207\u63DB\u5230\u6B64\u6D41\u7A0B\u5F8C\u6703\u8B80\u53D6 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002"}</div>
    </section>`;let n=t.qdrant_storage||{},o=(Array.isArray(t.databases)?t.databases:[]).find(p=>p.id==="qdrant")||{},l=n.volume_bytes??o.volume_bytes??null,m=n.points_count??o.points_count,f=n.segments_count??o.segments_count;return`<section class="report-card processing-card index-storage-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
      <button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-index-storage">${g("refresh",12)}<span>\u91CD\u65B0\u6574\u7406</span></button>
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
      <span>Points\uFF0FSegments</span><strong class="mono">${d(m)} / ${d(f)}</strong>
    </div>
    <div class="index-runtime-foot">\u8CC7\u6599\u6642\u9593 ${r($e(t.checked_at))}</div>
  </section>`}function gr({badge:e="",lead:t="",rows:s=[],note:a=""}){return`<section class="report-card processing-card parquet-help-card workflow-help-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("info",14)}\u529F\u80FD\u8AAA\u660E</span>
      ${e?`<span class="badge badge-neutral">${r(e)}</span>`:""}
    </div>
    <div class="parquet-help-body">
      <p class="parquet-help-lead">${t}</p>
      <div class="parquet-help-grid">${s.map(([n,i])=>`<span>${r(n)}</span><strong>${i}</strong>`).join("")}</div>
      ${a?`<p class="parquet-help-note">${a}</p>`:""}
    </div>
  </section>`}function Cu(){return gr({badge:"\u552F\u8B80\u532F\u51FA",lead:"\u5C07 PostgreSQL \u76EE\u524D\u6709\u6548\u7684\u5224\u6C7A\uFF08<code>judgment_documents.is_current = true</code>\uFF09\u532F\u51FA\u6210\u7368\u7ACB\u7684 Parquet \u5FEB\u7167\uFF0C\u4F9B\u96E2\u7DDA\u5206\u6790\u3001\u8CC7\u6599\u4EA4\u63DB\u6216\u4FDD\u5B58\u3002",rows:[["\u4F86\u6E90","PostgreSQL <code>judgment_documents</code>\uFF0C\u53EA\u542B\u76EE\u524D\u6709\u6548\u4E14\u5DF2\u547D\u4E2D\u91D1\u878D\u6CD5\u898F\u6E05\u55AE\u7684\u5224\u6C7A\u3002"],["\u8F38\u51FA",'<span class="mono">JUDGMENT_DATA_DIR/parquet/judgments/YYYYMMDD/HHMMSS-xxxxxxxx/judgments.parquet</span>'],["\u9644\u5E36\u6A94",'<span class="mono">\u540C\u76EE\u9304 manifest.json\uFF08\u7B46\u6578\u3001\u6A94\u6848\u5927\u5C0F\u3001\u6B04\u4F4D\u3001\u7522\u751F\u6642\u9593\uFF09</span>'],["\u5167\u5BB9","\u6848\u865F\u3001\u6CD5\u9662\u3001\u6848\u7531\u3001\u5168\u6587\u3001\u547D\u4E2D\u6CD5\u898F\u3001\u5F15\u7528\u3001\u4F86\u6E90\u58D3\u7E2E\u6A94\u8207\u6642\u9593\u6B04\u4F4D\uFF1B<code>citations</code> \u4EE5 JSON \u5B57\u4E32\u4FDD\u5B58\u3002"],["\u8207\u539F\u59CB Parquet","\u8CC7\u6599\u9801\u8207 <code>source=parquet</code> \u4F7F\u7528 <code>parquet/raw_judgments/.../raw.parquet</code>\uFF1B\u672C\u6D41\u7A0B\u7684 <code>parquet/judgments/...</code> \u662F\u53E6\u4E00\u500B\u6B63\u898F\u5316\u5FEB\u7167\u3002"],["\u4E0D\u6703","\u4E0D\u5BEB\u56DE PostgreSQL\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u820A\u5FEB\u7167\uFF1B\u53EA\u532F\u51FA current \u8CC7\u6599\uFF0C\u4E0D\u542B\u6B77\u53F2\u7248\u672C\u3002"],["\u4E2D\u65B7","\u6BCF\u6B21\u57F7\u884C\u5EFA\u7ACB\u65B0\u7684\u5B8C\u6574\u5FEB\u7167\uFF1B\u4E2D\u65B7\u5F8C\u91CD\u65B0\u57F7\u884C\u4E0D\u6703\u7E8C\u5BEB\u540C\u4E00\u500B Parquet \u6A94\u3002"]],note:"\u9069\u5408 DuckDB\u3001pandas\u3001Spark \u7B49\u96E2\u7DDA\u5206\u6790\uFF0C\u6216\u9700\u8981\u56FA\u5B9A\u6642\u9593\u9EDE\u7684\u53EF\u91CD\u73FE\u8CC7\u6599\u5FEB\u7167\u3002\u65E5\u5E38 RAG \u67E5\u8A62\u8207\u8CC7\u6599\u9801\u700F\u89BD\u4E0D\u9700\u8981\u57F7\u884C\u6B64\u6D41\u7A0B\u3002"})}function Pu(){return gr({badge:"PostgreSQL \u56DE\u586B",lead:"\u5C07\u5224\u6C7A\u7684 <code>court</code> \u8F49\u6210\u6A19\u6E96\u6CD5\u9662\u540D\u7A31\u4E26\u5BEB\u5165 <code>court_normalized</code>\uFF1B\u539F\u59CB <code>court</code> \u6703\u4FDD\u7559\u4F9B\u8FFD\u6EAF\u3002",rows:[["\u8655\u7406\u7BC4\u570D","\u9810\u8A2D\u53EA\u8655\u7406 <code>court_normalized</code> \u70BA\u7A7A\u7684\u8CC7\u6599\uFF1B\u5DF2\u6B63\u898F\u5316\u8CC7\u6599\u6703\u8DF3\u904E\uFF0C\u53EF\u7528 <code>--all</code> \u91CD\u65B0\u8A08\u7B97\u5168\u90E8\u3002"],["\u89E3\u6790\u9806\u5E8F","\u539F\u59CB\u6CD5\u9662\u503C\u958B\u982D\u7B26\u5408\u6A19\u6E96\u540D\u7A31 \u2192 \u5224\u6C7A\u5168\u6587\u524D 8,000 \u5B57\u6700\u65E9\u51FA\u73FE\u7684\u6CD5\u9662 \u2192 \u539F\u59CB\u6CD5\u9662\u503C\u4EFB\u610F\u4F4D\u7F6E\u7684\u6A19\u6E96\u540D\u7A31 \u2192 JID \u5B98\u65B9\u6CD5\u9662\u4EE3\u78BC\u3002"],["\u8F38\u51FA","\u5BEB\u5165 <code>judgment_documents.court_normalized</code>\uFF1B\u4E0D\u4FEE\u6539\u539F\u59CB <code>court</code>\u3001\u5168\u6587\u6216\u5176\u4ED6\u5224\u6C7A\u6B04\u4F4D\u3002"],["\u672A\u89E3\u6790","\u7121\u6CD5\u5224\u65B7\u6642\u4FDD\u7559\u7A7A\u503C\uFF0C\u4E0D\u731C\u6E2C\uFF1B\u6458\u8981\u6703\u5217\u51FA\u672A\u89E3\u6790\u7B46\u6578\u8207\u5E38\u898B\u6A23\u672C\u3002"],["\u5F71\u97FF","\u8CC7\u6599\u9801\u7684\u6CD5\u9662\u4E0B\u62C9\u3001\u7CBE\u78BA\u7BE9\u9078\u3001\u6392\u5E8F\u3001\u7D50\u679C\u6B04\u4F4D\u8207\u5224\u6C7A\u539F\u6587\u4F7F\u7528\u6B63\u898F\u5316\u540D\u7A31\uFF1BAPI \u4ECD\u56DE\u50B3 <code>court_raw</code>\u3002"],["\u4E0D\u6703","\u4E0D\u91CD\u65B0\u532F\u5165\u5224\u6C7A\u3001\u4E0D\u6539\u5168\u6587\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u8CC7\u6599\u3002"],["\u91CD\u8DD1","\u9810\u8A2D\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u898F\u5247\u66F4\u65B0\u5F8C\u53EF\u7528 <code>--all</code> \u91CD\u7B97\uFF0C\u6216\u5148\u7528 <code>--dry-run</code> \u7D71\u8A08\u3002"]],note:"\u9069\u5408\u5728\u5224\u6C7A\u532F\u5165\u5F8C\u3001\u6CD5\u9662\u540D\u7A31\u898F\u5247\u66F4\u65B0\u5F8C\uFF0C\u6216\u8CC7\u6599\u9801\u6CD5\u9662\u9078\u9805\u51FA\u73FE\u7F3A\u6F0F\u6642\u57F7\u884C\u3002\u7D50\u679C\u4E5F\u6703\u5BEB\u5165\u6548\u80FD\u7D00\u9304\u3002"})}function Iu(){return gr({badge:"\u689D\u6587\u6B77\u53F2\u5EFA\u6A94",lead:"\u70BA\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u5EFA\u7ACB <code>law_article_versions</code> \u6B77\u53F2\u689D\u6587\u5FEB\u7167\u8207 <code>law_article_change_events</code> \u8B8A\u66F4\u7D00\u9304\uFF0C\u8B93\u8CC7\u6599\u9801\u80FD\u5207\u63DB\u6B77\u53F2\u7248\u672C\u4E26\u67E5\u770B\u689D\u6587\u5DEE\u7570\u3002",rows:[["\u4F86\u6E90","PostgreSQL \u6CD5\u898F\u7248\u672C\uFF0C\u4EE5\u53CA <code>LAW_DATA_DIR/raw_parquet</code> \u5167\u5C0D\u61C9\u7684\u539F\u59CB\u6CD5\u898F Parquet \u5FEB\u7167\u3002"],["\u5339\u914D\u65B9\u5F0F","\u4EE5 raw Parquet manifest \u7684 <code>zip_sha256</code>\uFF0F<code>raw_json_sha256</code> \u5C0D\u61C9\u6CD5\u898F\u7248\u672C\uFF0C\u4E0D\u731C\u6E2C\u5167\u5BB9\u3002"],["\u7522\u751F\u5167\u5BB9","<code>article_key</code>\uFF08\u689D\u6587\u985E\u578B\uFF0B\u689D\u865F\uFF09\u3001<code>content_hash</code>\u3001\u689D\u6587\u5168\u6587\u8207\u751F\u6548\u65E5\uFF1B\u8207\u524D\u4E00\u7248\u672C\u6BD4\u8F03\u5F8C\u8A18\u9304 <code>added</code>\uFF0F<code>modified</code>\uFF0F<code>removed</code>\u3002"],["\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB","\u5206\u9801\u4E0A\u65B9\u7684\u552F\u8B80\u6AA2\u67E5\u6703\u8B80\u53D6 <code>law_article_versions</code> \u8207\u539F\u59CB Parquet\uFF0C\u5224\u65B7\u7248\u672C\u662F\u5426\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\uFF1B\u6AA2\u67E5\u672C\u8EAB\u4E0D\u6703\u4FEE\u6539\u8CC7\u6599\u5EAB\u3002"],["\u53EF\u5EFA\u7ACB","\u627E\u5230\u5C0D\u61C9\u539F\u59CB Parquet \u7684\u7248\u672C\uFF0C\u53EF\u76F4\u63A5\u57F7\u884C\u6B64\u6D41\u7A0B\u5EFA\u7ACB\u689D\u6587\u6B77\u53F2\u3002"],["\u7F3A\u539F\u59CB\u6A94","\u627E\u4E0D\u5230\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u6A19\u793A\u7121\u6CD5\u5EFA\u7ACB\uFF0C\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD\uFF1B\u6B64\u6D41\u7A0B\u6703\u8DF3\u904E\u4E26\u5217\u5728 <code>missing_versions</code>\u3002"],["\u6AA2\u67E5\u7D50\u679C","\u5E74\u4EFD\xD7\u6708\u4EFD\u8868\u986F\u793A\u5DF2\u5EFA\u7ACB\uFF0F\u672A\u5EFA\u7ACB\uFF0F\u90E8\u5206\u5EFA\u7ACB\uFF1B\u4E0B\u65B9\u5217\u51FA\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u7248\u672C\u65E5\u671F\u8207\u53EF\u5EFA\u7ACB\u72C0\u614B\u3002\u76EE\u524D\u72C0\u614B\u4EE5\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u5361\u7247\u5373\u6642\u986F\u793A\u3002"],["\u8DF3\u904E\u689D\u4EF6","\u5DF2\u6709\u689D\u6587\u5FEB\u7167\u7684\u7248\u672C\u6703\u8DF3\u904E\uFF1B\u627E\u4E0D\u5230\u53EF\u8B80\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u5217\u5165 <code>missing_versions</code>\uFF0C\u4E0D\u5EFA\u7ACB\u865B\u69CB\u689D\u6587\u3002"],["\u4E0D\u6703","\u4E0D\u4E0B\u8F09\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u4E0D\u89E3\u6790\u65B0 ZIP\u3001\u4E0D\u4FEE\u6539 <code>law_documents</code> \u6216\u76EE\u524D\u7248\u672C\u3001\u4E0D\u66F4\u65B0 Qdrant\uFF0FIndexedDB\u3002"],["\u8F38\u51FA\u6458\u8981","\u7248\u672C\u6578\u3001\u8DF3\u904E\u7248\u672C\u6578\u3001\u7F3A\u5C11\u5FEB\u7167\u7248\u672C\u3001\u5BEB\u5165\u689D\u6587\u6578\u8207\u689D\u6587\u8B8A\u66F4\u4E8B\u4EF6\u6578\u3002"],["\u91CD\u8DD1","\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u5DF2\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u4E0D\u6703\u91CD\u8907\u63D2\u5165\u3002"]],note:"\u9069\u5408\u5F9E\u820A\u7248 schema \u5347\u7D1A\u3001\u65E2\u6709\u6CD5\u898F\u7248\u672C\u7F3A\u5C11\u6B77\u53F2\u689D\u6587\uFF0C\u6216\u8CC7\u6599\u9801\u6B77\u53F2\u689D\u6587\u7248\u672C\u8207\u8B8A\u66F4\u7D00\u9304\u4E0D\u5B8C\u6574\u6642\u57F7\u884C\u3002\u57F7\u884C\u524D\u53EF\u5148\u7528\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u78BA\u8A8D\u54EA\u4E9B\u7248\u672C\u53EF\u5EFA\u7ACB\u3001\u54EA\u4E9B\u7F3A\u539F\u59CB\u6A94\u3002"})}function Du(e={}){let t=e.courtCheck,s=!!e.courtCheckLoading,a=e.courtCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-court-check"${s?" disabled":""}>${g("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31"}</span></button>`;if(a)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">${r(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">${s?'<span class="spinner" aria-hidden="true"></span> \u6B63\u5728\u6AA2\u67E5\u5404\u6708\u4EFD\u6CD5\u9662\u540D\u7A31\u2026':"\u9032\u5165\u6B64\u5206\u9801\u5F8C\u6703\u81EA\u52D5\u6AA2\u67E5\uFF1B\u4E5F\u53EF\u6309\u300C\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u300D\u91CD\u65B0\u8B80\u53D6\u3002"}</div>
    </section>`;let i=Array.isArray(t.months)?t.months:[],o=t.summary||{},l=t.totals||{};if(!i.length)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u6AA2\u67E5\u7684\u5224\u6C7A\u8CC7\u6599\u3002</div>
    </section>`;let m={green:"\u5DF2\u6AA2\u67E5",red:"\u9700\u6B63\u898F\u5316\uFF08\u5B8C\u5168\u672A\u6AA2\u67E5\uFF09",gray:"\u9700\u6B63\u898F\u5316"},f=new Map(i.map(b=>[String(b.month),b])),$=[...new Set(i.map(b=>b.year))].sort((b,u)=>u-b).map(b=>{let u=Array.from({length:12},(h,w)=>{let _=w+1,L=`${b}${String(_).padStart(2,"0")}`,S=f.get(L);if(!S)return`<td class="judgment-month is-empty"><span>${_}</span></td>`;let x=m[S.status]?S.status:"red",O=[`${b}-${String(_).padStart(2,"0")}`,m[x],`\u7E3D ${d(S.total)} \u7B46`,`\u5DF2\u6AA2\u67E5 ${d(S.checked)} \u7B46`,`\u672A\u6AA2\u67E5 ${d(S.unchecked)} \u7B46`,S.invalid?`\u7121\u6548\u503C ${d(S.invalid)} \u7B46`:"",`\u6709\u6548 ${dt(S.percent)}`].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month court-check-month is-${x==="gray"?"red":x}" title="${r(O)}"><span>${_}</span></td>`}).join("");return`<tr><th scope="row">${r(b)}</th>${u}</tr>`}).join("");return`<section class="report-card processing-card court-check-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
      ${n}
    </div>
    <div class="judgment-months">
      <div class="judgment-months-meta">
        <span class="badge badge-ok">\u5DF2\u6AA2\u67E5 ${d(o.green||0)}</span>
        <span class="badge badge-danger">\u9700\u6B63\u898F\u5316 ${d((o.red||0)+(o.gray||0))}</span>
        <span class="muted">\u5171 ${d(i.length)} \u500B\u6708</span>
      </div>
      <div class="index-runtime-summary">
        <span>\u5224\u6C7A\u7E3D\u6578 <strong class="mono">${d(l.total)}</strong></span>
        <span>\u5DF2\u6AA2\u67E5 <strong class="mono">${d(l.checked)}</strong></span>
        <span>\u672A\u6AA2\u67E5 <strong class="mono">${d(l.unchecked)}</strong></span>
        <span>\u7121\u6548\u503C <strong class="mono">${d(l.invalid)}</strong></span>
        <span>\u6709\u6548 <strong class="mono">${d(l.valid)}</strong></span>
      </div>
      <div class="judgment-months-scroll">
        <table class="judgment-months-table court-check-months-table">
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(b,u)=>`<th scope="col">${u+1}</th>`).join("")}</tr></thead>
          <tbody>${$}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u5168\u90E8\u5DF2\u6B63\u898F\u5316\uFF1B\u7D05\u8272\uFF1A\u9700\u6B63\u898F\u5316\uFF08\u542B\u5B8C\u5168\u672A\u6AA2\u67E5\u3001\u90E8\u5206\u672A\u6B63\u898F\u5316\u6216\u7121\u6548\u503C\uFF09\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002summary \u7684\u7D05\u8272\u6578\u5B57\u70BA\u9700\u6B63\u898F\u5316\u6708\u4EFD\u6578\uFF1B\u4E0B\u65B9\u660E\u7D30\u4ECD\u4FDD\u7559\u672A\u6AA2\u67E5\u8207\u7121\u6548\u503C\u7B46\u6578\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u8A73\u7D30\u7B46\u6578\u8207\u6709\u6548\u6BD4\u4F8B\u3002</p>
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r($e(t.checked_at))} \xB7 \u6A19\u6E96\u6CD5\u9662\u540D\u7A31 ${d(t.canonical_count)} \u500B</div>
    </div>
  </section>`}function Bu(e={}){let t=e.lawVersionCheck,s=!!e.lawVersionCheckLoading,a=e.lawVersionCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-law-version-check"${s?" disabled":""}>${g("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB"}</span></button>`;if(a)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">${r(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">${s?'<span class="spinner" aria-hidden="true"></span> \u6B63\u5728\u6AA2\u67E5\u7248\u672C\u8207\u6B77\u53F2\u689D\u6587\u2026':"\u9032\u5165\u6B64\u5206\u9801\u5F8C\u6703\u81EA\u52D5\u6AA2\u67E5\uFF1B\u4E5F\u53EF\u6309\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u91CD\u65B0\u8B80\u53D6\u3002"}</div>
    </section>`;let i=Array.isArray(t.months)?t.months:[],o=t.summary||{},l=t.totals||{};if(!i.length)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">\u8CC7\u6599\u5EAB\u76EE\u524D\u6C92\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u8CC7\u6599\u3002</div>
    </section>`;let m={green:"\u5DF2\u5EFA\u7ACB",red:"\u672A\u5EFA\u7ACB",gray:"\u90E8\u5206\u5EFA\u7ACB"},f=new Map(i.map(Z=>[String(Z.month),Z])),$=[...new Set(i.map(Z=>Z.year))].sort((Z,j)=>j-Z).map(Z=>{let j=Array.from({length:12},(A,E)=>{let X=E+1,W=`${Z}${String(X).padStart(2,"0")}`,B=f.get(W);if(!B)return`<td class="judgment-month is-empty"><span>${X}</span></td>`;let le=m[B.status]?B.status:"red",ge=[`${Z}-${String(X).padStart(2,"0")}`,m[le],`\u7248\u672C ${d(B.version_count)}\uFF08\u6CD5\u898F ${d(B.law_versions)}\uFF0F\u547D\u4EE4 ${d(B.order_versions)}\uFF09`,`\u5DF2\u5EFA\u7ACB ${d(B.backfilled_count)}`,`\u672A\u5EFA\u7ACB ${d(B.missing_count)}`,`\u9700\u5EFA\u7ACB ${d(B.needs_backfill_count)}\uFF08\u53EF\u5EFA\u7ACB ${d(B.backfillable_count)}\uFF0F\u7F3A\u539F\u59CB\u6A94 ${d(B.blocked_count)}\uFF09`,`\u689D\u6587\u5217 ${d(B.article_rows)} / \u9810\u671F ${d(B.article_count)}`,B.current?"\u76EE\u524D\u7248\u672C":"",B.versions?.length?`\u7248\u672C ${B.versions.map(F=>`#${F.version_id}`).join("\u3001")}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month law-version-month is-${le}${B.current?" is-current":""}" title="${r(ge)}"><span>${X}</span></td>`}).join("");return`<tr><th scope="row">${r(Z)}</th>${j}</tr>`}).join(""),b={law:"\u6CD5\u898F",order:"\u547D\u4EE4"},u=i.flatMap(Z=>(Z.versions||[]).filter(j=>j.needs_backfill).map(j=>({...j,month:Z.month}))).sort((Z,j)=>j.version_id-Z.version_id),h=u.slice(0,20),w=h.map(Z=>{let j=Z.backfillable?"badge-info":Z.blocked?"badge-danger":"badge-neutral",A=Z.backfillable?"\u53EF\u5EFA\u7ACB":Z.blocked?"\u7F3A\u539F\u59CB\u6A94":"\u5F85\u6AA2\u67E5";return`<div class="law-backfill-needed-row">
        <strong class="mono">#${Z.version_id}</strong>
        <span class="badge ${j}">${A}</span>
        <span>${r(b[Z.source_type]||Z.source_type||"\u2014")}</span>
        <span class="mono">${r(Z.update_date||Z.month||"\u2014")}</span>
        <span class="law-backfill-needed-reason">${r(Z.reason||"\u2014")}</span>
      </div>`}).join(""),_=u.length?`<div class="law-backfill-needed">
        <div class="law-backfill-needed-head">\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C <span class="badge badge-warn">${d(u.length)}</span></div>
        <div class="law-backfill-needed-list">${w}</div>
        ${u.length>h.length?`<div class="law-backfill-needed-more">\u53E6\u6709 ${d(u.length-h.length)} \u500B\u7248\u672C\u672A\u5217\u51FA</div>`:""}
      </div>`:'<div class="law-backfill-needed is-clear">\u76EE\u524D\u6C92\u6709\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3002</div>',L=Number(l.needs_backfill_versions)||0,S=Number(l.backfillable_versions)||0,x=Number(l.blocked_versions)||0,O=Number(l.backfilled_versions)||0,ie=Number(l.versions)||0,J=L<=0?"ok":x>0?"danger":"warn",he=L<=0?"\u4E0D\u9700\u8981\u5EFA\u7ACB":"\u9700\u8981\u5EFA\u7ACB",me=L>0?`\u9700\u8981\u5EFA\u7ACB ${d(L)} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF1A\u53EF\u5EFA\u7ACB ${d(S)}\u3001\u7F3A\u539F\u59CB\u6A94 ${d(x)}\u3002\u5DF2\u6709\u6B77\u53F2\u689D\u6587 ${d(O)} \u500B\u7248\u672C${x>0?"\uFF1B\u7F3A\u539F\u59CB\u6A94\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD":""}\u3002`:`\u76EE\u524D ${d(ie)} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`;return`<section class="report-card processing-card law-version-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
      ${n}
    </div>
    <div class="law-version-check-status is-${J}" role="status" aria-live="polite">
      <span class="badge badge-${J}">${he}</span>
      <span>${r(me)}</span>
    </div>
    <div class="judgment-months">
      <div class="judgment-months-meta">
        <span class="badge badge-ok">\u5DF2\u5EFA\u7ACB ${d(o.green||0)}</span>
        <span class="badge badge-danger">\u672A\u5EFA\u7ACB ${d(o.red||0)}</span>
        <span class="badge badge-neutral">\u90E8\u5206\u5EFA\u7ACB ${d(o.gray||0)}</span>
        <span class="muted">\u5171 ${d(i.length)} \u500B\u6708</span>
      </div>
      <div class="index-runtime-summary">
        <span>\u7248\u672C\u6578 <strong class="mono">${d(l.versions)}</strong></span>
        <span>\u5DF2\u5EFA\u7ACB\u7248\u672C <strong class="mono">${d(l.backfilled_versions)}</strong></span>
        <span>\u672A\u5EFA\u7ACB\u7248\u672C <strong class="mono">${d(l.missing_versions)}</strong></span>
        <span>\u9700\u5EFA\u7ACB\u7248\u672C <strong class="mono">${d(l.needs_backfill_versions)}</strong></span>
        <span>\u53EF\u5EFA\u7ACB <strong class="mono">${d(l.backfillable_versions)}</strong></span>
        <span>\u7F3A\u539F\u59CB\u6A94 <strong class="mono">${d(l.blocked_versions)}</strong></span>
        <span>\u689D\u6587\u5217 <strong class="mono">${d(l.article_rows)}</strong></span>
        <span>\u9810\u671F\u689D\u6587 <strong class="mono">${d(l.article_count)}</strong></span>
        <span>\u6CD5\u898F\u7B46\u6578 <strong class="mono">${d(l.law_count)}</strong></span>
      </div>
      <div class="judgment-months-scroll">
        <table class="judgment-months-table law-version-months-table">
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(Z,j)=>`<th scope="col">${j+1}</th>`).join("")}</tr></thead>
          <tbody>${$}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u8A72\u6708\u4EFD\u6240\u6709\u7248\u672C\u90FD\u6709\u6B77\u53F2\u689D\u6587\uFF1B\u7D05\u8272\uFF1A\u5B8C\u5168\u672A\u5EFA\u7ACB\uFF1B\u7070\u8272\uFF1A\u90E8\u5206\u7248\u672C\u5DF2\u5EFA\u7ACB\uFF1B\u5916\u6846\uFF1A\u76EE\u524D\u7248\u672C\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u7248\u672C\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u6578\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u6578\u8207\u689D\u6587\u5217\u3002</p>
      ${_}
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r($e(t.checked_at))}</div>
    </div>
  </section>`}function Fu(){return`<div class="processing-ollama-loading">
    <span class="spinner" aria-hidden="true"></span>
    <span>\u6B63\u5728\u6AA2\u67E5 llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span>
  </div>`}function Ou(e,t,s){let a=Array.isArray(e?.hosts)?e.hosts:[];if(s&&!a.length)return`${Ee({tone:"danger",title:"llama-server \u4E3B\u6A5F\u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
    <div class="processing-ollama-empty">
      <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh-ollama">
        ${g("refresh",13)}<span>\u91CD\u65B0\u6AA2\u67E5</span>
      </button>
    </div>`;if(!a.length)return t?Fu():'<div class="processing-ollama-empty">\u5C1A\u672A\u8A2D\u5B9A llama-server \u4E3B\u6A5F\uFF1B\u8ACB\u5230\u300C\u7CFB\u7D71\u72C0\u614B \u2192 Model Provider\u300D\u65B0\u589E\u4E26\u9023\u63A5\u6A21\u578B\u3002</div>';let n=a.map((o,l)=>{let m=o.status==="operational",f=Array.isArray(o.models)?o.models:[],p=f.length?f.map(b=>`<span class="processing-ollama-model ${m?"is-online":"is-offline"}">${r(b.name||"")}</span>`).join(""):'<span class="processing-ollama-model is-offline">\u6C92\u6709\u53EF\u7528\u6A21\u578B</span>',$=[o.embedding_model?`<span class="processing-ollama-role ${m?"is-online":"is-offline"}">\u5D4C\u5165 \xB7 ${r(o.embedding_model)}</span>`:'<span class="processing-ollama-role is-offline">\u672A\u8A2D\u5B9A\u5D4C\u5165\u6A21\u578B</span>',o.chat_model?`<span class="processing-ollama-role is-offline">\u804A\u5929 \xB7 ${r(o.chat_model)}</span>`:""].filter(Boolean).join("");return`<article class="processing-ollama-host ${m?"is-online":"is-offline"}" data-ollama-host data-host-id="${Number(o.id)}">
        <span class="processing-ollama-handle" aria-hidden="true">${g("grid",14)}</span>
        <span class="processing-ollama-rank">${l+1}</span>
        <div class="processing-ollama-main">
          <div class="processing-ollama-title">
            <strong>${r(o.name||o.base_url||`\u4E3B\u6A5F #${o.id}`)}</strong>
            <span class="processing-ollama-status">${m?"\u53EF\u7528":"\u7121\u6CD5\u9023\u7DDA"}</span>
          </div>
          <span class="processing-ollama-url mono">${r(o.base_url||"\u2014")}</span>
          <div class="processing-ollama-models">${p}</div>
          <div class="processing-ollama-meta">${$}${o.detail?`<span class="processing-ollama-detail">${r(o.detail)}</span>`:""}</div>
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
      <span>\u5171 ${d(a.length)} \u53F0\u4E3B\u6A5F</span>
      <span>\u7B2C\u4E00\u512A\u5148\uFF1A<strong>${r(i)}</strong></span>
      <span class="muted">${t?"\u91CD\u65B0\u6AA2\u67E5\u4E2D\u2026":"\u6BCF 30 \u79D2\u81EA\u52D5\u6AA2\u67E5"}</span>
    </div>
    <div class="processing-ollama-list" data-ollama-list>${n}</div>
    <p class="processing-ollama-hint">\u62D6\u79FB\u6216\u4F7F\u7528\u7BAD\u982D\u8ABF\u6574 embedding \u512A\u5148\u9806\u5E8F\uFF1B\u76EE\u524D\u4E3B\u6A5F\u7121\u6CD5\u4F7F\u7528\u6642\uFF0C\u6703\u4F9D\u5E8F\u81EA\u52D5\u6539\u7528\u4E0B\u4E00\u53F0\uFF08\u5404\u53F0\u9700\u5177\u5099\u76F8\u540C\u7684 embedding \u6A21\u578B\uFF09\uFF0C\u76F4\u5230\u6709\u4E3B\u6A5F\u56DE\u50B3\u5411\u91CF\u3002</p>`}function Hu(e,t={}){let s=e.active_run||null,a=s||e.last_run||null,n=It===e.id,i=!!s||n,o=!!e.can_run&&!i,l=i?"\u6B64\u6D41\u7A0B\u6B63\u5728\u57F7\u884C\u4E2D\u3002":e.start_blocked_reason||"\u76EE\u524D\u6709\u5176\u4ED6\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",m=Array.isArray(e.command)?e.command.join(" "):"",f=Number(e.update_count)||e.update_available&&Number(e.pending_count)||0,p=e.update_origin||"\u66F4\u65B0\u5075\u6E2C",$=e.update_mechanism||"\u65E2\u6709\u66F4\u65B0\u6AA2\u67E5\u7D00\u9304",b=e.update_message||e.update_status&&e.update_status.message||"\u627E\u5230\u53EF\u66F4\u65B0\u5167\u5BB9\u3002",u=e.update_status&&e.update_status.checked_at?$e(e.update_status.checked_at):"",h=e.progress||{},w=Array.isArray(h.stages)?h.stages:[],_=String(h.active_stage||""),L=w.find(J=>String(J.key||"")===_),S=(e.index_runtime&&e.index_runtime.current?e.index_runtime.current.month:"")||"",x=S?Ja(S):L&&(L.label||L.key)||"",O=n&&!s?"\u555F\u52D5\u4E2D":"\u57F7\u884C\u4E2D",ie=`<section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${g(qo[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
        <span class="badge badge-neutral badge-mono">${r(e.branch||"")}</span>
      </div>
      <div class="processing-workflow-command-grid">
        <span>\u7A0B\u5F0F</span><code>${r(e.program||"\u2014")}</code>
        <span>Shell\uFF0F\u5165\u53E3</span><code>${r(e.script||"\u2014")}</code>
        <span>\u5BE6\u969B\u547D\u4EE4</span><code class="processing-workflow-command">${r(m||"\u2014")}</code>
      </div>
      ${ir.has(e.id)?'<div class="processing-embedding-strip-slot" data-processing-embedding-strip data-preserve-children></div>':""}
      <div class="processing-workflow-actions">
        <button class="btn btn-primary btn-sm" type="button"
          data-processing-action="run-workflow"
          data-workflow-id="${r(e.id)}"
          ${o?"":"disabled"}
          ${o?"":`title="${r(l)}"`}>
          ${i?'<span class="spinner" aria-hidden="true"></span>':g("play",14)}<span>${i?O:"\u57F7\u884C\u6B64\u6D41\u7A0B"}</span>
        </button>
        ${["law_download","order_download","judgment_download"].includes(e.id)?`<button class="btn btn-secondary btn-sm" type="button"
                data-processing-action="check-updates"
                data-workflow-id="${r(e.id)}"
                ${i?"disabled":""}>
                ${g("refresh",14)}<span>\u6AA2\u67E5\u66F4\u65B0</span>
              </button>`:""}
        ${i?`<button class="btn btn-secondary btn-sm processing-stop" type="button"
                data-processing-action="stop">${g("x",14)}<span>\u4E2D\u6B62\u57F7\u884C</span></button>`:""}
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
              <span class="badge badge-info">${g("activity",11)}${O}</span>
              ${s&&s.id?`<span class="mono">${r(s.id)}</span>`:""}
              ${s&&s.started_at?`<span>\u958B\u59CB ${r($e(s.started_at))}</span>`:""}
              ${x?`<span>\u76EE\u524D\u8655\u7406 <strong class="mono">${r(x)}</strong></span>`:""}
            </div>`:""}
      <div class="side-card-foot">
        \u57F7\u884C\u7D50\u679C\u6703\u5BEB\u5165\u5171\u7528\u8655\u7406\u72C0\u614B\u6A94\uFF0C\u53EF\u5F9E\u8655\u7406\u7E3D\u89BD\u67E5\u770B\u3002
      </div>
    </section>`;return`<div class="processing-workflow-panel">
    ${Ee({tone:"info",title:e.label,text:e.description||""})}
    ${e.update_available?`<div class="processing-update-notice" role="status" data-processing-update-notice>
            <span class="processing-update-notice-icon">${g("refresh",14)}</span>
            <span class="processing-update-notice-copy">
              <strong>${r(p)}\u5075\u6E2C\u5230\u53EF\u66F4\u65B0\u5167\u5BB9</strong>
              <span class="processing-update-mechanism">\u5075\u6E2C\u6A5F\u5236\uFF1A${r($)}${u?` \xB7 \u6AA2\u67E5\u6642\u9593 ${r(u)}`:""}</span>
              <span class="processing-update-message" data-processing-update-message>${r(b)}</span>
            </span>
            ${f>0?`<span class="badge badge-warn badge-mono" data-processing-update-count>${g("refresh",10)}${d(f)}</span>`:'<span class="badge badge-warn">\u53EF\u66F4\u65B0</span>'}
            <button class="btn btn-primary btn-sm processing-update-action" type="button"
              data-processing-action="run-workflow"
              data-workflow-id="${r(e.id)}"
              ${o?"":"disabled"}
              title="${r(o?"\u7ACB\u5373\u57F7\u884C\uFF1B\u6703\u5148\u8A08\u7B97\u7E3D\u5927\u5C0F\u8207\u9810\u4F30\u6642\u9593":l)}">
              ${i?'<span class="spinner" aria-hidden="true"></span>':g("download",14)}<span>${i?O:"\u66F4\u65B0"}</span>
            </button>
          </div>`:""}
    ${["legal_index_versions","law_download","order_download"].includes(e.id)?su(e.index_timelines,{titleSuffix:e.id==="legal_index_versions"?"\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868":"\u4E0B\u8F09\u6642\u9593\u8868"}):""}
    ${e.id==="normalize_courts"?ie:""}
    ${e.id==="normalize_courts"?Du(t):""}
    ${e.id==="backfill_law_articles"?Bu(t):""}
    ${e.id!=="normalize_courts"?ie:""}
    ${Au(e)}
    ${e.id==="judgment_parquet"?Cu():""}
    ${e.id==="normalize_courts"?Pu():""}
    ${e.id==="backfill_law_articles"?Iu():""}
    ${e.id==="judgment_import"?ju(e):""}
    ${e.id==="index_versions"?Eu(e):""}
    ${e.id==="index_versions"?Ru(t):""}
    ${e.id==="judgment_download"?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${g("calendar",14)}\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B</span>
              <button class="btn btn-ghost btn-sm" type="button" title="\u91CD\u65B0\u6383\u63CF raw_rar \u76EE\u9304\u8207\u6708\u4EFD\u72C0\u614B" data-processing-action="refresh-judgment-months">${g("refresh",13)}<span>\u91CD\u65B0\u6574\u7406</span></button>
            </div>
            <div data-judgment-months-slot data-preserve-children>${mr()}</div>
          </section>`:""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${At(a?.status||"idle")}
      </div>
      ${pu(a)}
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("history",14)}\u57F7\u884C\u7D00\u9304</span>
        <span class="badge badge-neutral">\u6700\u8FD1 ${d((e.recent_runs||[]).length)} \u7B46</span>
      </div>
      ${yu(e.recent_runs)}
    </section>
    ${["law_download","order_download","judgment_download"].includes(e.id)?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${g("search",14)}\u7248\u672C\u6AA2\u67E5\u7D00\u9304</span>
              <span class="badge badge-neutral">\u6700\u8FD1 ${d((e.update_history||[]).length)} \u7B46</span>
            </div>
            ${wu(e)}
          </section>`:""}
  </div>`}function Qa(e,t,s={},a=new Set){if(t==="overview")return _o(e,a);let i=(Array.isArray(e.workflows)?e.workflows:[]).find(o=>o.id===t);return i?Hu(i,s):_o(e,a)}async function zu(e){e.innerHTML=`<section class="page processing-page">
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
          ${g("x",14)}<span>\u505C\u6B62\u66F4\u65B0</span>
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
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-workflows"),n=e.querySelector("#processing-stop"),i=!1,o=document.createElement("div");o.className="processing-stage-tooltip",o.hidden=!0,t.appendChild(o),Pt=new Map;let l=!1,m=!1,f=!1,p=null,$="",b="",u="overview",h=null,w=!1,_=null,L=null,S=null,x=!1,O=null,ie=0,J=null,he=!1,me=null,Z=0,j=null,A=!1,E=null,X=0,W=null,B=!1,le=null,ge=0,F=!1,fe=null,ee=!1,xe=!1,ve="",ae=new Set,ne=null,pe=null,be=-1,_e="",ke=0,Ne=0,Oe=null,I=[],G=()=>({storage:S,loading:x,error:O,courtCheck:J,courtCheckLoading:he,courtCheckError:me,lawVersionCheck:j,lawVersionCheckLoading:A,lawVersionCheckError:E}),k=()=>{if(u!=="judgment_download")return;let v=s.querySelector(".processing-workflow-panel");if(!v)return;v.querySelectorAll(".judgment-month.is-active").forEach(De=>{De.classList.remove("is-active"),De.removeAttribute("aria-current")});let c=v.querySelector("[data-judgment-progress]");if(!c)return;let y=h?.progress,T=!!(p?.workflows||[]).find(De=>De.id==="judgment_download")?.active_run;if((!y||y.active===!1)&&!T){c.hidden=!0,c.classList.remove("is-indeterminate");let De=c.querySelector("[data-judgment-run]");De&&(De.hidden=!0);return}if(c.hidden=!1,!y||y.active===!1){let De=c.querySelector("[data-judgment-progress-phase]");De&&(De.textContent="\u6E96\u5099\u4E2D");let ht=c.querySelector("[data-judgment-progress-month]");ht&&(ht.textContent="\u2014");let We=c.querySelector("[data-judgment-progress-filename]");We&&(We.textContent="\u7B49\u5F85\u4E0B\u8F09\u7A0B\u5E8F\u56DE\u5831\u9032\u5EA6\u2026",We.title=""),c.classList.add("is-indeterminate");let Ut=c.querySelector("[data-judgment-progress-bar]");Ut&&(Ut.style.width="");let wt=c.querySelector("[data-judgment-progress-percent]");wt&&(wt.textContent="\u2014");let vt=c.querySelector("[data-judgment-progress-size]");vt&&(vt.textContent="\u2014");let ns=c.querySelector("[data-judgment-progress-note]");ns&&(ns.textContent="\u5DF2\u555F\u52D5\uFF0C\u7B49\u5F85\u9032\u5EA6\u56DE\u5831");let Qt=c.querySelector("[data-judgment-run]");Qt&&(Qt.hidden=!0);let Dt=c.querySelector("[data-judgment-downloads]");Dt&&(Dt.hidden=!0);let Jt=c.querySelector("[data-judgment-current]");Jt&&(Jt.hidden=!1);return}let C={preparing:"\u6E96\u5099\u4E2D",planning:"\u8A08\u7B97\u5927\u5C0F",scanning:"\u6383\u63CF\u4E2D",checking:"\u6AA2\u67E5\u4E2D",downloading:"\u4E0B\u8F09\u4E2D",saving:"\u5132\u5B58\u4E2D",finalizing:"\u6574\u7406\u4E2D"},se=C[y.phase]||"\u8655\u7406\u4E2D",U=Array.isArray(y.downloads)?y.downloads:[],Q=U.length>0,ue=c.querySelector("[data-judgment-current]");ue&&(ue.hidden=Q);let ye=c.querySelector("[data-judgment-downloads]");if(ye){ye.hidden=!Q;let De=c.querySelector("[data-judgment-downloads-count]");De&&(De.textContent=`${d(U.length)} \u500B\u9032\u884C\u4E2D`);let ht=c.querySelector("[data-judgment-downloads-list]");ht&&Q&&(ht.innerHTML=U.map(We=>{let Ut=C[We.phase]||se||"\u8655\u7406\u4E2D",wt=Number(We.bytes_written),vt=Number(We.total_bytes),ns=Number.isFinite(vt)&&vt>0,Qt=We.percent,Dt=Qt==null||Qt===""?ns&&Number.isFinite(wt)?wt/vt*100:null:Number(Qt),Jt=Dt===null||!Number.isFinite(Dt),ua=Jt?"\u2014":`${Math.min(100,Math.max(0,Dt)).toFixed(Dt>=10?0:1)}%`,pa=ns?`${qe(wt)} / ${qe(vt)}`:Number.isFinite(wt)&&wt>0?qe(wt):"\u2014";return`<div class="processing-download-active-item">
              <div class="processing-download-active-line">
                <strong class="mono">${r(We.month||"\u2014")}</strong>
                <span class="processing-download-active-file mono" title="${r(We.filename||"")}">${r(We.filename||"\u2014")}</span>
                <span class="processing-download-active-percent mono">${r(ua)}</span>
              </div>
              <div class="processing-download-active-track${Jt?" is-indeterminate":""}"><span style="width:${Jt?"":`${Math.min(100,Math.max(0,Dt)).toFixed(1)}%`}"></span></div>
              <div class="processing-download-active-meta">
                <span>${r(Ut)}</span>
                <span>${r(pa)}</span>
              </div>
            </div>`}).join(""))}let Ae=c.querySelector("[data-judgment-progress-phase]");Ae&&(Ae.textContent=se);let ze=y.month||"",Je=c.querySelector("[data-judgment-progress-month]");Je&&(Je.textContent=ze||"\u2014");let Gt=y.filename||"",Tt=c.querySelector("[data-judgment-progress-filename]");Tt&&(Tt.textContent=Gt||"\u2014",Tt.title=Gt);let Le=new Map;for(let De of U)De.month&&Le.set(String(De.month),{percent:De.percent,phase:De.phase});ze&&!Le.has(ze)&&Le.set(ze,{percent:y.percent,phase:y.phase}),v.querySelectorAll(".judgment-month.is-active").forEach(De=>{De.classList.remove("is-active","is-downloading"),De.removeAttribute("aria-current"),De.style.removeProperty("--month-progress")});for(let[De,ht]of Le){let We=v.querySelector(`[data-judgment-month-key="${De}"]`);if(!We)continue;We.classList.add("is-active"),(ht?.phase==="downloading"||ht?.phase==="saving")&&We.classList.add("is-downloading"),We.setAttribute("aria-current","true");let Ut=Number(ht?.percent);Number.isFinite(Ut)&&We.style.setProperty("--month-progress",`${Math.min(100,Math.max(0,Ut)).toFixed(1)}%`)}let Qe=Number(y.bytes_written),He=Number(y.total_bytes),yt=Number.isFinite(He)&&He>0,gs=null,fs=y.percent;fs!=null&&fs!==""&&Number.isFinite(Number(fs))?gs=Number(fs):yt&&Number.isFinite(Qe)&&(gs=Qe/He*100);let sn=gs===null;c.classList.toggle("is-indeterminate",sn);let qr=c.querySelector("[data-judgment-progress-bar]");qr&&(qr.style.width=sn?"":`${Math.min(100,Math.max(0,gs)).toFixed(1)}%`);let Mr=c.querySelector("[data-judgment-progress-percent]");if(Mr){let De=sn?null:Math.min(100,Math.max(0,gs));Mr.textContent=De===null?"\u2014":`${De.toFixed(De>=10?0:1)}%`}let Lr=c.querySelector("[data-judgment-progress-size]");if(Lr){let De=Number.isFinite(Qe)&&Qe>0?qe(Qe):"\u2014";Lr.textContent=yt?`${De} / ${qe(He)}`:De}let jr=c.querySelector("[data-judgment-progress-note]");if(jr){let De=[],ht=Number(y.candidate_index),We=Number(y.candidate_total);Number.isFinite(ht)&&ht>0&&Number.isFinite(We)&&We>0&&De.push(`\u7B2C ${d(ht)} / ${d(We)} \u500B\u6708`),y.fileset_id&&De.push(`fileset ${y.fileset_id}`),y.message&&y.phase!=="downloading"&&De.push(String(y.message)),jr.textContent=De.join(" \xB7 ")}let Tr=c.querySelector("[data-judgment-run]"),Nr=y.run_files_total!==null&&y.run_files_total!==void 0;if(Tr&&(Tr.hidden=!Nr,Nr)){let De=Number(y.run_files_total)||0,ht=Number(y.run_files_done)||0,We=y.run_bytes_total===null||y.run_bytes_total===void 0?null:Number(y.run_bytes_total),Ut=Number(y.run_bytes_done)||0,wt=y.run_percent,vt=wt==null||wt===""?null:Number(wt),ns=c.querySelector("[data-judgment-run-bar]");ns&&(ns.style.width=vt===null||!Number.isFinite(vt)?"":`${Math.min(100,Math.max(0,vt)).toFixed(1)}%`);let Qt=c.querySelector("[data-judgment-run-percent]");Qt&&(Qt.textContent=vt===null||!Number.isFinite(vt)?"\u2014":`${vt.toFixed(vt>=10?0:1)}%`);let Dt=c.querySelector("[data-judgment-run-files]");Dt&&(Dt.textContent=`${d(ht)} / ${d(De)} \u500B\u6708`);let Jt=c.querySelector("[data-judgment-run-size]"),ua=y.phase==="planning";Jt&&(We!==null&&We>0?Jt.textContent=`\u5DF2\u4E0B\u8F09 ${qe(Ut)} / ${qe(We)}`:Jt.textContent=`\u5DF2\u4E0B\u8F09 ${qe(Ut)} \xB7 ${ua?"\u7E3D\u91CF\u8A08\u7B97\u4E2D":"\u7E3D\u91CF\u672A\u77E5"}`);let pa=c.querySelector("[data-judgment-run-elapsed]");pa&&(pa.textContent=`\u5DF2\u82B1 ${ar(y.elapsed_seconds)}`);let an=c.querySelector("[data-judgment-run-eta]");if(an){let nn=Number(y.eta_seconds),el=Number(y.estimated_total_seconds);Number.isFinite(nn)&&nn>=0?an.textContent=`\u5269\u9918 ${ar(nn)} \xB7 \u9810\u4F30\u7E3D\u8A08 ${ar(el)}`:an.textContent=ua&&(y.run_bytes_total===null||y.run_bytes_total===void 0)?"\u5269\u9918\u6642\u9593\uFF1A\u8A08\u7B97\u4E2D":"\u5269\u9918\u6642\u9593\uFF1A\u2014"}}},P=()=>{if(u!=="judgment_download")return;let v=s.querySelector("[data-judgment-months-slot]");if(v){let c=Array.isArray(h?.months)?h.months:[];_&&!h?(v.innerHTML=Ee({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(_)}),delete v.dataset.judgmentMonthCount):h?v.dataset.judgmentMonthCount!==String(c.length)?(v.innerHTML=vu(h),v.dataset.judgmentMonthCount=String(c.length)):$u(v,h):(v.querySelector(".judgment-months-loading")||(v.innerHTML=mr()),delete v.dataset.judgmentMonthCount)}if(h){let c=pr(h),y=L!==c.pending;L=c.pending;let M=(p?.workflows||[]).find(C=>C.id==="judgment_download");M&&(M.update_count=c.pending,M.update_available=c.pending>0);let T=s.querySelector("[data-processing-update-notice]");if(T)if(c.pending<=0)T.remove();else{let C=T.querySelector("[data-processing-update-count]");C&&(C.innerHTML=`${g("refresh",10)}${d(c.pending)}`);let se=T.querySelector("[data-processing-update-message]");se&&(se.textContent=`\u5224\u6C7A\u5F85\u88DC\u9F4A ${d(c.pending)} \u500B\u6708`)}y&&a&&p&&es(a,Ga(p,u))}k()},K=()=>{let v=Array.isArray(W?.hosts)?W.hosts:[];return JSON.stringify({loading:!v.length&&B,error:!v.length&&le?le.message||String(le):"",active:W?.active_host_id??null,hosts:v.map(c=>({id:c.id,name:c.name,url:c.base_url,status:c.status,detail:c.detail,embedding:c.embedding_model,chat:c.chat_model,models:(c.models||[]).map(y=>y.name)}))})},H=()=>{let v=s.querySelector("[data-processing-ollama]");if(!v||ge)return;let c=K();v.dataset.ollamaSignature!==c&&(v.dataset.ollamaSignature=c,v.innerHTML=Ou(W,B,W?null:le))},Re=()=>{let c=((p?.sections||[]).find(y=>y.key==="legal")?.stages||[]).find(y=>y.key==="legal_qdrant");return nr(c?.model?.label||"")},Se=()=>{let v=s.querySelector("[data-processing-embedding-strip]");if(!v)return;let c=Array.isArray(W?.hosts)?W.hosts:[],y=[];for(let Q of c)if(Q.status==="operational")for(let ue of Q.models||[])Array.isArray(ue.capabilities)&&ue.capabilities.includes("embedding")&&y.push({hostId:Number(Q.id),model:ue.name,label:nr(`${Q.name||Q.base_url||`\u4E3B\u6A5F ${Q.id}`}:${ue.name}`),baseUrl:Q.base_url||""});let M=Re(),T=c.find(Q=>Number(Q.id)===Number(W?.active_host_id)),C=y.map(Q=>{let ue=Q.label===M;return`<button class="rag-model-button${ue?" is-active":""}" type="button"
        data-processing-action="select-embedding-model"
        data-host-id="${Q.hostId}"
        data-model="${r(Q.model)}"
        title="${r(Q.label)}"
        aria-pressed="${ue?"true":"false"}"
        ${xe?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(Q.label)}</span>
        ${ue?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`});M&&!y.some(Q=>Q.label===M)&&C.unshift(`<button class="rag-model-button is-active is-static" type="button" aria-pressed="true" disabled>
          <span class="rag-model-state" aria-hidden="true"></span>
          <span>${r(M)}</span>
          <span class="rag-model-current">\u4F7F\u7528\u4E2D</span>
        </button>`);let se=y.length?`<div class="rag-model-buttons">${C.join("")}</div>`:`<p class="rag-model-empty">${B?"\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\u8207 Embedding model\u2026":le?`\u7121\u6CD5\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\uFF1A${r(le.message||String(le))}`:"\u76EE\u524D\u6C92\u6709\u53EF\u7528\u7684 Embedding model\u3002"}</p>`,U=`<div class="processing-embedding-strip rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${g("brain",13)} Embedding \u4E3B\u6A5F\uFF0F\u6A21\u578B</span>
        ${T?.base_url?`<span class="rag-model-strip-base mono">${r(T.base_url)}</span>`:""}
        <span class="rag-model-strip-current">\u76EE\u524D\uFF1A<strong>${r(M||"\u2014")}</strong></span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-processing-action="refresh-embedding-models"
          ${B?"disabled":""}>
          ${g("refresh",12)}<span>\u6AA2\u67E5\u6A21\u578B</span>
        </button>
      </div>
      ${se}
      <p class="rag-model-hint">\u9EDE\u9078 <span class="mono">\u4E3B\u6A5F:\u6A21\u578B</span> \u5207\u63DB Embedding\uFF1B\u9078\u53D6\u5F8C\u6703\u6210\u70BA\u7B2C\u4E00\u512A\u5148\uFF0C\u5176\u4ED6\u4E3B\u6A5F\u4F9D\u5E8F\u4F5C\u70BA\u5099\u63F4\u3002\u5207\u63DB\u6A21\u578B\u5F8C\u65E2\u6709\u7D22\u5F15\u53EF\u80FD\u9700\u8981\u91CD\u5EFA\u3002</p>
    </div>`;v.innerHTML!==U&&(v.innerHTML=U)},Pe=v=>{let c=s.querySelector('[data-import-timeline="judgment"]');if(!c)return;let y=String(v?.active_month||""),M=String(v?.processing_month||"");c.querySelectorAll(".processing-month").forEach(ye=>{let Ae=!!y&&ye.dataset.month===y;ye.classList.toggle("is-current",Ae),ye.classList.toggle("is-processing-current",!!M&&ye.dataset.month===M),Ae?ye.setAttribute("aria-current","true"):ye.removeAttribute("aria-current")});let T=c.querySelector(".index-current-row");if(!y||!v?.active_archive){T&&T.remove();return}let C=p?.workflows?.find(ye=>ye.id==="judgment_import")?.import_timeline?.stage_labels||{},se=xo({activeMonth:y,activeArchive:v.active_archive,activePhase:v.active_phase||"",processingMonth:v.processing_month||"",processingArchive:v.processing_archive||"",stageLabels:C});if(T){T.innerHTML=se;return}let U=document.createElement("div");U.className="index-current-row",U.innerHTML=se;let Q=c.querySelector(":scope > .side-card-head");if(Q){Q.insertAdjacentElement("afterend",U);return}let ue=c.querySelector(".judgment-months");ue&&ue.prepend(U)},Ie=v=>{let c=Number(v?.state_mtime_ns);return Number.isFinite(c)?c:-1},ut=v=>{let c=String(v?.active_month||"");return/^\d{6}$/.test(c)?Number(c):-1},Ke=v=>{if(!v)return;let c=Ie(v);if(c>=0&&c<be){pe?.active_month&&Pe(pe);return}c>=0&&(be=c);let y=String(v.active_month||"");if(!!(v.run_id&&v.run_id===pe?.run_id)&&ut(v)>=0&&ut(v)<ut(pe)){let T={...v,active_month:pe.active_month,active_archive:pe.active_archive};pe=T,Pe(T);return}if(!y&&v.run_status==="running"){pe?.active_month&&pe?.run_id===v.run_id?Pe(pe):(pe=v,Pe(v));return}pe=v,Pe(v)},st=v=>{let c=v?.active_import;if(c){Ke(c);return}pe?.active_month&&Pe(pe)},qt=()=>{l||ne||(ne=mt(["processing","judgment-download","system-usage","ollama","court-check","law-version-check"],(v,c)=>{if(!l){if(v==="processing"){c?.snapshot?.live?Ds(c.snapshot):c?.snapshot?Is(c.snapshot,{silent:!0}):kt({silent:!0});return}if(v==="judgment-download"){u==="judgment_download"&&q({quiet:!0,payload:c?.snapshot||null});return}if(v==="system-usage"){u==="index_versions"&&N({quiet:!0,force:!0,payload:c?.snapshot||null});return}if(v==="ollama"){ir.has(u)&&Ze({quiet:!0,payload:c?.snapshot||null});return}if(v==="court-check"){u==="normalize_courts"&&R({quiet:!0,force:!0,payload:c?.snapshot||null});return}v==="law-version-check"&&u==="backfill_law_articles"&&z({quiet:!0,force:!0,payload:c?.snapshot||null})}},{onProgress:(v,c)=>{if(v!=="processing")return;let y=c?.event;y&&la(y)},onError:()=>{p||kt({silent:!0})}}))},Mt=()=>{ne&&(ne(),ne=null)},Ve=async v=>{if(xe)return;let[c,...y]=String(v||"").split("|"),M=Number(c),T=y.join("|");if(!M||!T){Se();return}let C=(W?.hosts||[]).find(U=>Number(U.id)===M);if(!C){Se();return}let se=nr(`${C.name||C.base_url||`\u4E3B\u6A5F ${C.id}`}:${T}`);if(se===Re()){Se();return}if(!window.confirm(`\u5207\u63DB Embedding \u70BA ${se}\uFF1F

\u5207\u63DB\u6A21\u578B\u5F8C\uFF0C\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u8207\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u53EF\u80FD\u4E0D\u76F8\u5BB9\uFF0C\u9700\u8981\u91CD\u65B0\u5EFA\u7ACB\u7D22\u5F15\u3002`)){Se();return}xe=!0,Se();try{await V.selectOllamaModel(M,{model:T,role:"embedding"});let U=(W?.hosts||[]).map(ue=>Number(ue.id)),Q=[M,...U.filter(ue=>ue!==M)];await V.reorderOllamaHosts(Q),D(`\u5DF2\u5207\u63DB Embedding \u70BA ${se}\u3002`,"ok",6e3),W=null,await Ze({quiet:!0}),await kt({silent:!0})}catch(U){D(U.message||"\u7121\u6CD5\u5207\u63DB Embedding model\u3002","danger",7e3),await Ze({quiet:!0})}finally{xe=!1,Se()}},Ze=async({quiet:v=!1,button:c=null,payload:y=null}={})=>{if(!(l||B)){B=!0,le=null,W||(H(),Se()),c&&Me(c,!0,"\u6AA2\u67E5\u4E2D\u2026");try{let M=y||await V.ollamaHosts();if(l)return;W=M}catch(M){if(l)return;le=M,v||D(M.message||"\u7121\u6CD5\u6AA2\u67E5 llama-server \u4E3B\u6A5F\u3002","danger",6e3)}finally{l||(B=!1,c&&Me(c,!1),H(),Se())}}},Lt=async v=>{if(ee)return;let c=(W?.hosts||[]).map(C=>Number(C.id)),y=v.map(C=>Number(C));if(!y.length||y.length!==c.length||y.every((C,se)=>C===c[se])){H();return}ee=!0;let M=new Map((W?.hosts||[]).map(C=>[Number(C.id),C])),T=y.map(C=>M.get(C)).filter(Boolean);if(W&&T.length===c.length){W={...W,hosts:T,active_host_id:y[0]};let C=s.querySelector("[data-processing-ollama]");C&&(C.dataset.ollamaSignature=""),H()}try{await V.reorderOllamaHosts(y),D("\u5DF2\u66F4\u65B0 llama-server \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","ok",3500)}catch(C){D(C.message||"\u7121\u6CD5\u66F4\u65B0 llama-server \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","danger",6e3),await Ze({quiet:!0})}finally{ee=!1}},re=()=>{let v=s.querySelector("[data-processing-ollama]");v&&(v.dataset.ollamaSignature=""),H()},we=()=>{let v=fe;if(!v)return;if(s.querySelector(`[data-ollama-host][data-host-id="${v.hostId}"]`)?.classList.remove("is-dragging"),v.captureTarget?.hasPointerCapture?.(v.pointerId))try{v.captureTarget.releasePointerCapture(v.pointerId)}catch{}document.documentElement.classList.remove("processing-ollama-dragging"),window.removeEventListener("pointermove",Ue),window.removeEventListener("pointerup",Ye),window.removeEventListener("pointercancel",jt),fe=null,ge=0},Ue=v=>{let c=fe;if(!c||v.pointerId!==c.pointerId)return;if(!c.dragging){if(Math.hypot(v.clientX-c.startX,v.clientY-c.startY)<5)return;c.dragging=!0,ge=c.hostId,F=!1,s.querySelector(`[data-ollama-host][data-host-id="${c.hostId}"]`)?.classList.add("is-dragging"),document.documentElement.classList.add("processing-ollama-dragging")}v.preventDefault();let y=64;v.clientY<y?window.scrollBy(0,-12):v.clientY>window.innerHeight-y&&window.scrollBy(0,12);let M=s.querySelector("[data-ollama-list]"),T=document.elementFromPoint(v.clientX,v.clientY)?.closest?.("[data-ollama-host]");if(!M||!T||!M.contains(T))return;let C=M.querySelector(`[data-ollama-host][data-host-id="${c.hostId}"]`);if(!C||C===T)return;let se=T.getBoundingClientRect(),U=v.clientY>se.top+se.height/2;M.insertBefore(C,U?T.nextSibling:T),F=!0},Ye=v=>{let c=fe;if(!c||v.pointerId!==c.pointerId)return;let y=c.dragging,M=F,T=s.querySelector("[data-ollama-list]"),C=y&&T?[...T.querySelectorAll("[data-ollama-host]")].map(se=>Number(se.dataset.hostId)):[];we(),y&&M&&C.length&&Lt(C)},jt=()=>{let v=!!fe?.dragging;we(),v&&re()},zt=v=>{if(v.button!==0||v.pointerType==="mouse"&&v.buttons!==1||ee||fe)return;let c=v.target.closest("[data-ollama-host]");if(!c||!s.contains(c)||v.target.closest("button")||v.pointerType==="touch"&&!v.target.closest(".processing-ollama-handle"))return;let y=Number(c.dataset.hostId)||0;if(y){v.preventDefault(),ge=y,fe={hostId:y,pointerId:v.pointerId,startX:v.clientX,startY:v.clientY,dragging:!1,captureTarget:c};try{c.setPointerCapture(v.pointerId)}catch{}window.addEventListener("pointermove",Ue,{passive:!1}),window.addEventListener("pointerup",Ye),window.addEventListener("pointercancel",jt)}},q=async({quiet:v=!1,payload:c=null}={})=>{if(!w){w=!0,!h&&u==="judgment_download"&&P();try{h=c||await V.judgmentDownloadStatus(),_=null}catch(y){_=y.message||"\u8B80\u53D6\u6708\u4EFD\u72C0\u614B\u5931\u6557\u3002",v||D(_,"danger",7e3)}finally{w=!1,u==="judgment_download"&&P()}}},N=async({quiet:v=!0,force:c=!1,payload:y=null}={})=>{if(!x&&!(!c&&S&&Date.now()-ie<3e4)){x=!0;try{S=y||await V.systemUsage(),O=null,ie=Date.now()}catch(M){O=M.message||"\u7121\u6CD5\u53D6\u5F97 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002",v||D(O,"danger",7e3)}finally{x=!1,u==="index_versions"&&rt()}}},R=async({quiet:v=!0,force:c=!1,payload:y=null}={})=>{if(!he&&!(!c&&J&&Date.now()-Z<6e4)){he=!0;try{J=y||await V.checkCourts(),me=null,Z=Date.now()}catch(M){me=M.message||"\u7121\u6CD5\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u3002",v||D(me,"danger",7e3)}finally{he=!1,u==="normalize_courts"&&rt()}}},z=async({quiet:v=!0,force:c=!1,button:y=null,payload:M=null}={})=>{if(!A&&!(!c&&j&&Date.now()-X<6e4)){A=!0,y&&Me(y,!0,"\u6AA2\u67E5\u4E2D\u2026");try{if(j=M||await V.checkLawVersions(),E=null,X=Date.now(),!v){let T=j.totals||{},C=Number(T.needs_backfill_versions)||0,se=Number(T.backfillable_versions)||0,U=Number(T.blocked_versions)||0;C>0?D(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u9700\u8981\u5EFA\u7ACB ${C} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF08\u53EF\u5EFA\u7ACB ${se}\u3001\u7F3A\u539F\u59CB\u6A94 ${U}\uFF09\u3002`,U>0?"danger":"warn",7e3):D(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D ${Number(T.versions)||0} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`,"ok",5e3)}}catch(T){E=T.message||"\u7121\u6CD5\u6AA2\u67E5\u689D\u6587\u6B77\u53F2\u72C0\u614B\u3002",v||D(E,"danger",7e3)}finally{A=!1,y&&Me(y,!1)}}},Y=v=>Array.from(s.querySelectorAll("[data-stage-key]")).find(c=>c.dataset.stageKey===v)||null,te=v=>{if(!v)return;ae.add(v);let c=Array.from(s.querySelectorAll(".processing-wf-stage[data-processing-stage]")).find(y=>y.dataset.processingStage===v);c&&(c.open=!0,c.scrollIntoView({behavior:"smooth",block:"center"}))},ce=()=>{ve&&(ve="",o.hidden=!0,s.querySelectorAll("[data-stage-key]").forEach(v=>{v.classList.remove("is-stage-hovered")}))},je=v=>{let c=v.dataset.stageKey||"";if(!c)return;ve=c,s.querySelectorAll("[data-stage-key]").forEach(Je=>{Je.classList.toggle("is-stage-hovered",Je.dataset.stageKey===c)});let y=v.dataset.stageStatusKey||"idle",M=v.dataset.stageStatus||ps(y).label,T=v.dataset.stageColor||"var(--accent)",C=Number(v.dataset.stageUpdate)||0,se=Number(v.dataset.stagePending)||0,U=v.dataset.stageContributionLabel||"\u6574\u9AD4\u5360\u6BD4";o.innerHTML=`<div class="processing-stage-tooltip-head">
      <span class="processing-stage-tooltip-swatch" style="background:${r(T)}"></span>
      <strong>${r(v.dataset.stageLabel||c)}</strong>
      ${At(y,M)}
    </div>
    <div class="processing-stage-tooltip-meta">
      <span>\u968E\u6BB5\u9032\u5EA6 <strong>${r(v.dataset.stagePercent||"\u2014")}</strong></span>
      <span>${r(U)} <strong>${r(v.dataset.stageContribution||"\u2014")}</strong></span>
      <span class="mono">${r(v.dataset.stageDuration||"\u2014")}</span>
    </div>
    <div class="processing-stage-tooltip-counts">${r(v.dataset.stageCounts||"\u2014")}</div>
    ${C||se?`<div class="processing-stage-tooltip-badges">
            ${C?`<span class="processing-wf-count is-update">${g("refresh",11)}<strong>${d(C)}</strong><span>\u53EF\u66F4\u65B0</span></span>`:""}
            ${se?`<span class="processing-wf-count is-pending">${g("clock",11)}<strong>${d(se)}</strong><span>\u5F85\u57F7\u884C</span></span>`:""}
          </div>`:""}
    ${v.dataset.stageMessage?`<div class="processing-stage-tooltip-message">${r(v.dataset.stageMessage)}</div>`:""}`,o.hidden=!1;let Q=Math.min(300,Math.max(220,window.innerWidth-24));o.style.width=`${Q}px`;let ue=v.getBoundingClientRect(),ye=Math.min(window.innerWidth-Q-12,Math.max(12,ue.left)),Ae=ue.top-o.offsetHeight-10,ze=Ae>=12?Ae:Math.min(window.innerHeight-o.offsetHeight-12,ue.bottom+10);o.style.left=`${ye}px`,o.style.top=`${Math.max(12,ze)}px`},Ce=v=>{if(v.target.closest(".is-failure-tip")){ce();return}if(v.target.closest(".processing-wf-rail"))return;let c=v.target.closest("[data-stage-key]");!c||!s.contains(c)||c.contains(v.relatedTarget)||je(c)},Te=v=>{let c=v.target.closest("[data-stage-key]");if(!c||!s.contains(c)||c.contains(v.relatedTarget))return;let y=v.relatedTarget?.closest?.("[data-stage-key]");y&&y.dataset.stageKey===c.dataset.stageKey||ce()},Fe=v=>Array.isArray(v?.active_runs)&&v.active_runs.length||(v?.workflows||[]).some(c=>c.active_run)?!0:String(v?.update?.status||"")==="running",et=()=>{s.querySelectorAll('[data-processing-action="stop"]').forEach(v=>Me(v,!0,"\u505C\u6B62\u4E2D\u2026")),n&&Me(n,!0,"\u505C\u6B62\u4E2D\u2026")},at=()=>{s.querySelectorAll('[data-processing-action="stop"]').forEach(v=>Me(v,!1)),n&&Me(n,!1)},bt=v=>{let c=v.capabilities||{};i&&!Fe(v)&&(i=!1,at()),!f&&n&&(n.hidden=!c.can_stop_update),i&&et()},rt=()=>{if(!p)return;let v=Qa(p,u,G(),ae);v!==$&&(es(s,v),$=v),P(),H(),Se(),st(p)},Is=(v,{silent:c=!1}={})=>{if(l||!v)return;let y=Date.parse(v.generated_at||""),M=Date.parse(p?.generated_at||"");if(Number.isFinite(y)&&Number.isFinite(M)&&y<M)return;if(It){let Q=(v.workflows||[]).find(ye=>ye.id===It),ue=Q?.active_run?.id||Q?.last_run?.id||"";(Q?.active_run||ue&&ue!==ys)&&(It="",ys="")}p=v,window.dispatchEvent(new CustomEvent("judgment:processing-pending",{detail:{count:Number(v.capabilities?.unprocessed_archives)||0,index_pending:Number(v.capabilities?.index_pending_months)||0}}));let T=new Map;for(let Q of v.sections||[])for(let ue of Q.stages||[])T.set(`${Q.key}-${ue.key}`,ue);for(let[Q,ue]of Pt){if(ue.kind!=="upgrade")continue;let ye=T.get(Q);if(ye){if(ye.phase==="failed"||ye.phase==="running"&&ye.percent!==null){Pt.delete(Q);continue}if(ye.phase==="completed"){let Ae=Date.parse(ye.last_run?.started_at||"");Number.isFinite(Ae)&&Ae>=Number(ue.startedAt||0)-1e3&&Pt.delete(Q)}}}let C=Ga(v,u);C!==b&&(es(a,C),b=C);let se=Qa(v,u,G(),ae);if(se!==$&&(es(s,se),$=se),P(),H(),ve){let Q=Y(ve);Q?je(Q):ce()}let U=s.querySelector("[data-processing-updated-at]");if(U){let Q=$e(v.generated_at);U.textContent!==Q&&(U.textContent=Q)}if(bt(v),Se(),st(v),!W&&!B&&Ze({quiet:!0}),I.length){let Q=I.splice(0);for(let ue of Q)la(ue)}},oa=v=>{if(Oe=v,typeof requestAnimationFrame>"u"){let c=Oe;Oe=null,c&&Ds(c);return}Ne||(Ne=requestAnimationFrame(()=>{Ne=0;let c=Oe;Oe=null,c&&Ds(c)}))},la=v=>{if(!v)return;if(!p){I.push(v),I.length>100&&I.shift();return}let c=String(v.run_id||""),y=Number(v.seq)||0;if(c&&c===_e&&y>0&&y<=ke)return;c&&c!==_e&&(_e=c,ke=0),y>0&&(ke=y);let M=String(v.workflow_id||"judgment_import"),T=String(v.month||"").replace(/\D/g,"").slice(0,6),C=(p.workflows||[]).find(Ae=>Ae.id===M);if(!C)return;C.progress||(C.progress={stages:[]}),Array.isArray(C.progress.stages)||(C.progress.stages=[]);let se=String(v.stage||""),U=se?C.progress.stages.find(Ae=>String(Ae.key)===se):null,Q=String(C.progress.run_id||"")===String(v.run_id||"");if(U&&v.type==="stage_progress"){let Ae=Number(v.current),ze=Number(U.current);Q&&v.status==="running"&&Number.isFinite(Ae)&&Number.isFinite(ze)&&Ae<ze||(v.status&&(U.status=String(v.status)),v.current!==void 0&&(U.current=Number(v.current)||0),v.total!==void 0&&(U.total=Number(v.total)||0),v.percent!==void 0&&(U.percent=Number(v.percent)||0),v.message&&(U.message=String(v.message)))}if(U&&v.extra&&typeof v.extra=="object")for(let Ae of["financial_processed","financial_matched","financial_percent"])v.extra[Ae]!==void 0&&(U[Ae]=Number(v.extra[Ae])||0);if(v.type==="stage_progress"&&v.overall_percent!==void 0){let Ae=Number(v.overall_percent)||0,ze=Number(C.progress.overall_percent)||0;C.progress.overall_percent=Q?Math.max(ze,Ae):Ae}v.type!=="run_finished"&&(C.progress.run_status="running"),(v.type==="archive_started"||v.type==="stage_progress")&&!C.active_run&&v.run_id&&(C.active_run={id:v.run_id,status:"running",started_at:v.timestamp,message:v.message||""}),v.type==="run_finished"&&(C.active_run=null,C.progress.run_status=String(v.status||"success"),C.can_run=!0);let ue=[];T&&v.month_stages&&ue.push({month:T,import_stages:v.month_stages,import_overall:v.month_overall||""});let ye=null;if(v.type==="archive_started"&&T){let Ae=Date.parse(v.timestamp||"");ye={active_month:T,active_archive:v.archive,active_phase:v.stage||"filter",processing_month:T,processing_archive:v.archive,run_id:v.run_id,run_status:"running",state_mtime_ns:Number.isFinite(Ae)?Ae*1e6:Date.now()*1e6}}else v.type==="run_finished"&&(ye={...p.active_import||{},run_status:String(v.status||"success")});oa({live:!0,generated_at:v.timestamp,workflows:[{id:M,active_run:C.active_run,last_run:C.last_run,progress:C.progress,can_run:C.can_run}],import_timeline_months:ue,active_import:ye})},Ds=v=>{if(l||!v||!p)return;let c=new Map((v.workflows||[]).map(U=>[U.id,U]));if(It){let U=c.get(It),Q=U?.active_run?.id||U?.last_run?.id||"";(U?.active_run||Q&&Q!==ys)&&(It="",ys="")}for(let U of p.workflows||[]){let Q=c.get(U.id);if(Q){if("active_run"in Q&&(U.active_run=Q.active_run),"last_run"in Q&&(U.last_run=Q.last_run),Array.isArray(Q.recent_runs)&&(U.recent_runs=Q.recent_runs),"index_runtime"in Q){let ue=Q.index_runtime;ue&&!ue.active_coverage&&U.index_runtime?.active_coverage&&(ue.active_coverage=U.index_runtime.active_coverage),ue&&!ue.active_archive_coverage&&U.index_runtime?.active_archive_coverage&&(ue.active_archive_coverage=U.index_runtime.active_archive_coverage),U.index_runtime=ue}if(Q.progress){let ue=Q.progress,ye=U.progress;if(U.id==="judgment_import"&&ye?.run_id&&ye.run_id===ue.run_id){let Ae=new Map((ye.stages||[]).map(ze=>[String(ze.key),ze]));for(let ze of ue.stages||[]){let Je=Ae.get(String(ze.key));Je&&ze.status==="running"&&Number(ze.current)<Number(Je.current)&&(ze.current=Je.current,ze.total=Je.total,ze.percent=Je.percent,ze.message=Je.message)}ue.overall_percent=Math.max(Number(ye.overall_percent)||0,Number(ue.overall_percent)||0)}U.progress=ue}typeof Q.can_run=="boolean"&&(U.can_run=Q.can_run)}}let y=U=>{if(!U||!Array.isArray(v.import_timeline_months))return;let Q=new Map((U.months||[]).map(ye=>[String(ye.month),ye]));for(let ye of v.import_timeline_months){let Ae=Q.get(String(ye.month));Ae&&(Ae.import_stages={...Ae.import_stages||{},...ye.import_stages||{}},ye.import_stage_progress&&(Ae.import_stage_progress={...Ae.import_stage_progress||{},...ye.import_stage_progress||{}}),ye.import_overall&&(Ae.import_overall=ye.import_overall))}let ue={complete:0,incomplete:0,processing:0,empty:0};for(let ye of U.months||[]){let Ae=String(ye.import_overall||"empty");ue[Ae]=Number(ue[Ae]||0)+1}U.stage_summary=ue};(U=>{let Q=(U.workflows||[]).find(Le=>Le.id==="index_versions"),ue=Q?.index_runtime;if(!ue||!Array.isArray(ue.months))return;let ye=(U.file_timelines||[]).find(Le=>Le.key==="judgment");if(!ye||!Array.isArray(ye.months))return;let Ae=(Q.progress?.stages||[]).find(Le=>Le.key==="validate"),ze=["success","no_change"].includes(String(ue.run_status||""))||String(ue.run_status||"")!=="running"&&/alias\s*已切換/.test(String(Ae?.message||"")),Je=String(ue.current?.month||""),Gt=new Map(ye.months.map(Le=>[String(Le.month),Le]));for(let Le of ue.months){let Qe=Gt.get(String(Le.month||""));if(!Qe)continue;let He=Qe.stages||(Qe.stages={}),yt=String(Le.status||"");yt==="running"||String(Le.month)===Je?(He.qdrant="processing",Qe.overall="processing"):yt==="success"&&He.qdrant!=="complete"&&(He.qdrant=ze?"complete":"incomplete",Qe.overall=ze?"complete":"incomplete")}let Tt={complete:0,incomplete:0,processing:0,empty:0,update:0};for(let Le of ye.months){let Qe=String(Le.overall||"empty");Tt[Qe]=Number(Tt[Qe]||0)+1,Le.has_update&&(Tt.update+=1)}ye.summary=Tt})(p),y(p.import_timeline);for(let U of p.workflows||[])U.id==="judgment_import"&&y(U.import_timeline);v.active_import&&(p.active_import=v.active_import),v.mode&&(p.mode=v.mode),v.generated_at&&(p.generated_at=v.generated_at);let T=Ga(p,u);T!==b&&(es(a,T),b=T);let C=Qa(p,u,G(),ae);C!==$&&(es(s,C),$=C),P(),H(),Se(),st(p),bt(p);let se=s.querySelector("[data-processing-updated-at]");if(se&&v.generated_at){let U=$e(v.generated_at);se.textContent!==U&&(se.textContent=U)}},kt=async({silent:v=!1}={})=>{if(!(l||m)){m=!0;try{let c=await V.processing();Is(c,{silent:v})}catch(c){if(l)return;let y=cu(c.message,p);y!==$&&(es(s,y),$=y),v||D(c.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{m=!1}}},Bs=async(v,c="")=>{if(f)return;f=!0,Me(v,!0,"\u6AA2\u67E5\u4E2D\u2026");let y=$o[c]||"",M=String(v.dataset.sourceTypes||"").split(",").map(se=>se.trim()).filter(Boolean),T=M.length?M:y?[y]:[],C=v.dataset.stageId||"";C&&(Pt.set(C,{kind:"check",phase:"updating",startedAt:Date.now()}),rt());try{let se=await V.checkUpdates(T);if(se&&se.checking)C&&(Pt.delete(C),rt()),D("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u8ACB\u7A0D\u5F8C\u91CD\u65B0\u6574\u7406\u3002","info",6e3);else if(T.length===1){let U=(se.sources||{})[T[0]]||{},Q=yo[c]||(T[0]==="judgment"?"\u5224\u6C7A":T[0]==="law"?"\u6CD5\u898F":T[0]==="order"?"\u547D\u4EE4":"\u8CC7\u6599");U.status==="error"?D(`${Q}\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF1A${U.message||"\u7121\u6CD5\u53D6\u5F97\u7DDA\u4E0A\u7248\u672C"}`,"danger",7e3):D(U.update_available?`${Q}\u7DDA\u4E0A\u5DF2\u6709\u66F4\u65B0\u7248\u672C\u3002`:`${Q}\u7DDA\u4E0A\u5DF2\u662F\u6700\u65B0\u7248\u672C\u3002`,U.update_available?"warn":"ok",6e3)}else if(T.length>1){let U=se.sources||{},Q=T.filter(ye=>U[ye]?.update_available),ue=T.filter(ye=>U[ye]?.status==="error");ue.length?D(`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF0C\u4F46\u6709 ${ue.length} \u9805\u6AA2\u67E5\u5931\u6557\u3002`,"danger",7e3):D(Q.length?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${Q.length} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",Q.length?"warn":"ok",6e3)}else{let U=Number(se.update_count)||0;D(U>0?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${U} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",U>0?"warn":"ok",6e3)}C&&(Pt.set(C,{kind:"check",phase:"updated",startedAt:Date.now()}),rt()),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await kt({silent:!0})}catch(se){C&&(Pt.delete(C),rt()),D(se.message||"\u66F4\u65B0\u6AA2\u67E5\u5931\u6557\u3002","danger",7e3)}finally{f=!1,Me(v,!1),p&&bt(p)}},tn=async v=>{let c=$o[v]||"";if(!c)return!0;let y=null;try{y=await V.checkUpdates([c])}catch(T){return D(`\u7121\u6CD5\u5B8C\u6210\u7248\u672C\u6AA2\u67E5\uFF08${T.message||"\u7DB2\u8DEF\u932F\u8AA4"}\uFF09\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002`,"warn",7e3),!0}if(!y||y.checking)return y&&y.checking&&D("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","info",6e3),!0;let M=(y.sources||{})[c];if(!M)return!0;if(window.dispatchEvent(new CustomEvent("judgment:updates-changed")),M.status==="up_to_date"&&!M.update_available){let T=yo[v]||"\u8CC7\u6599",C=M.checked_at?`\uFF08${$e(M.checked_at)} \u6AA2\u67E5\uFF09`:"",se=Qd[v]||"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u55CE\uFF1F";return window.confirm(`${T}\u7DDA\u4E0A\u6AA2\u67E5\u70BA\u6700\u65B0\u7248\u672C${C}\u3002

${se}`)}return M.status==="error"&&D("\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","warn",6e3),!0},ca=async(v,c)=>{if(f)return;f=!0;let y=(p?.workflows||[]).find(C=>C.id===c);ys=y?.active_run?.id||y?.last_run?.id||"",It=c,Me(v,!0,"\u57F7\u884C\u4E2D"),rt();let M=v.dataset.stageId||"",T=!1;try{if(!await tn(c))return;M&&(Pt.set(M,{kind:"upgrade",phase:"upgrading",startedAt:Date.now()}),rt());let se;try{se=await V.startProcessingWorkflow(c)}catch(U){throw M&&(Pt.delete(M),rt()),U}T=!0,D(`\u5DF2\u555F\u52D5\u300C${y?.label||c}\u300D\u6D41\u7A0B\u3002`,"ok",6e3),se&&se.run_id&&console.info("processing workflow started",se),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),kt({silent:!0}),window.setTimeout(()=>{It===c&&(It="",ys="",kt({silent:!0}))},15e3)}catch(C){D(C.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{f=!1,(!T||It!==c)&&(It="",ys="",p?(bt(p),$="",rt()):Me(v,!1))}},Fs=async v=>{if(!(f||i)){f=!0,i=!0,Me(v,!0,"\u505C\u6B62\u4E2D\u2026");try{let c=await V.stopProcessingUpdate();for(let[y,M]of Pt)M.kind==="upgrade"&&Pt.delete(y);rt(),kt({silent:!0}),D(c.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3)}catch(c){i=!1,Me(v,!1),D(c.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{f=!1,i?et():p&&bt(p)}}},ks=v=>{let c=v.target.closest("[data-processing-action]");if(!c||c.disabled)return;c.closest(".processing-wf-rail")&&(v.preventDefault(),v.stopPropagation());let y=c.dataset.processingAction;if(y==="refresh")kt({silent:!1});else if(y==="open-stage")te(c.dataset.stageId||"");else if(y==="refresh-judgment-months")q({quiet:!1});else if(y==="refresh-index-storage")N({quiet:!1,force:!0});else if(y==="refresh-court-check")R({quiet:!1,force:!0});else if(y==="refresh-law-version-check")z({quiet:!1,force:!0,button:c});else if(y==="refresh-ollama")Ze({quiet:!1,button:c});else if(y==="refresh-embedding-models")Ze({quiet:!1,button:c});else if(y==="select-embedding-model"){let M=c.dataset.hostId||"",T=c.dataset.model||"";Ve(`${M}|${T}`)}else if(y==="move-ollama-host"){let M=W?.hosts||[],T=M.findIndex(Q=>Number(Q.id)===Number(c.dataset.hostId)),C=c.dataset.direction,se=C==="up"?T-1:C==="down"?T+1:-1;if(T<0||se<0||se>=M.length)return;let U=M.map(Q=>Number(Q.id));[U[T],U[se]]=[U[se],U[T]],Lt(U)}else if(y==="check-updates")Bs(c,c.dataset.workflowId||"");else if(y==="run-workflow"){let M=c.dataset.workflowId||"";ca(c,M)}else y==="stop"&&Fs(c)},da=(v,{scroll:c=!1}={})=>{if(u=v||"overview",p){let y=Ga(p,u);es(a,y),b=y;let M=Qa(p,u,G(),ae);if(es(s,M),$=M,P(),H(),Se(),st(p),ve){let T=Y(ve);T?je(T):ce()}c&&s.scrollIntoView({behavior:"smooth",block:"start"})}ir.has(u)&&Ze({quiet:!0}),u==="judgment_download"&&q({quiet:!0}),u==="index_versions"&&N({quiet:!0}),u==="normalize_courts"&&R({quiet:!0}),u==="backfill_law_articles"&&z({quiet:!0})},Os=v=>{let c=v.target.closest("[data-processing-workflow]");c&&da(c.dataset.processingWorkflow||"overview")},Ss=v=>{let c=v.target.closest("[data-timeline-workflow]");c&&(v.preventDefault(),da(c.dataset.timelineWorkflow||"",{scroll:!0}))},ms=v=>{let c=v.target.closest?.(".index-wf-stage[data-index-stage]");if(c&&s.contains(c)){let C=c.dataset.indexStage||"";C&&(c.open?or.add(C):or.delete(C));return}let y=v.target.closest?.(".workflow-wf-stage[data-workflow-wf-stage]");if(y&&s.contains(y)){let C=y.dataset.workflowWfStage||"";C&&(y.open?lr.add(C):lr.delete(C));return}let M=v.target.closest?.(".processing-wf-stage[data-processing-stage]");if(!M||!s.contains(M))return;let T=M.dataset.processingStage||"";T&&(M.open?ae.add(T):ae.delete(T))};return t.addEventListener("click",ks),a.addEventListener("click",Os),s.addEventListener("click",Ss),s.addEventListener("pointerover",Ce),s.addEventListener("pointerout",Te),s.addEventListener("pointerdown",zt),s.addEventListener("toggle",ms,!0),window.addEventListener("scroll",ce,{capture:!0,passive:!0}),qt(),typeof EventSource>"u"&&await kt({silent:!1}),()=>{l=!0,Mt(),t.removeEventListener("click",ks),a.removeEventListener("click",Os),s.removeEventListener("click",Ss),we(),s.removeEventListener("pointerover",Ce),s.removeEventListener("pointerout",Te),s.removeEventListener("pointerdown",zt),s.removeEventListener("toggle",ms,!0),window.removeEventListener("scroll",ce,{capture:!0})}}var yr={};rs(yr,{render:()=>kp});var br={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u522A\u9664\uFF0F\u9000\u5F79",badge:"badge-neutral"}},Wt={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},Cs={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},Ro={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function ra(e){let t=br[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${r(t.label)}</span>`}function hr(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function Gu(e){return hr(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",source_type:a||""}})}function Uu(e){return hr(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",article_no:a||""}})}function Qu(e){return hr(e).map(t=>({jid:t.trim()}))}function Ju(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function Vu(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function Wu(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function Ku(e){return(e?.tags||[]).join(", ")}function na(e){return`<div class="qb-empty">${g("info",18)}<span>${r(e)}</span></div>`}function vr(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),n=[...t.map(i=>`<span class="chip">${r(i)}</span>`),...s.map(i=>`<span class="chip">${r(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${r(i)}</span>`)];return n.length?`<div class="chips qb-labels">${n.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function $r(){return`<details class="qb-import">
    <summary>${g("upload",14)}JSON \u6279\u6B21\u532F\u5165</summary>
    <p class="qb-muted">\u683C\u5F0F\uFF1A<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>\u3002\u76F8\u540C\u984C\u76EE fingerprint \u9810\u8A2D\u66F4\u65B0\u3002</p>
    <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
    <div class="qb-actions">
      <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${g("upload",13)}<span>\u532F\u5165 JSON</span></button>
    </div>
  </details>`}function Yu(e){let t=e?.item||{},s=Array.isArray(e?.warnings)?e.warnings:[],a=Array.isArray(t.tags)?t.tags:[];return`<section class="report-card qb-card qb-ai-result">
    <div class="side-card-head">
      <span class="side-card-title">${g("sparkles",14)}llama-server \u5DF2\u5EFA\u7ACB\u984C\u76EE #${t.id}</span>
      ${ra(t.status)}
    </div>
    <div class="qb-ai-answer">
      <strong>${r(t.question||"")}</strong>
      <div class="qb-ai-meta">
        ${r(Wt[t.question_type]||t.question_type||"")}
        \xB7 ${r(Cs[t.difficulty]||t.difficulty||"")}
        \xB7 ${r(e?.model||"\u672C\u6A5F llama-server")}
      </div>
      ${vr(t)}
      ${t.reference_answer?`<div class="qb-reference"><span class="summary-label">llama-server \u53C3\u8003\u7B54\u6848</span><p>${r(t.reference_answer)}</p></div>`:""}
      ${a.length?`<div class="chips">${a.map(n=>`<span class="chip">${r(n)}</span>`).join("")}</div>`:""}
      ${s.length?`<div class="qb-ai-warnings"><strong>\u9700\u8981\u6CE8\u610F</strong><ul>${s.map(n=>`<li>${r(n)}</li>`).join("")}</ul></div>`:""}
      <div class="qb-actions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="review-ai-item">${g("shield",13)}<span>\u524D\u5F80\u9A57\u6536</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="reset-ai">${g("plus",13)}<span>\u518D\u65B0\u589E\u4E00\u984C</span></button>
      </div>
    </div>
    ${$r()}
  </section>`}function Xu(e){return e.aiResult?Yu(e.aiResult):`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("sparkles",14)}AI \u984C\u5EAB\u65B0\u589E</span>
      <span class="badge badge-neutral">\u672C\u6A5F llama-server</span>
    </div>
    <form class="qb-form qb-ai-form" data-qb-form="ai-create" id="qb-create-form">
      <label class="field qb-wide">
        <span class="field-label">\u984C\u76EE <span class="field-tag">question</span></span>
        <textarea class="input" name="question" rows="4" required placeholder="\u8F38\u5165\u554F\u984C\uFF0Cllama-server \u6703\u56DE\u7B54\u4E26\u81EA\u52D5\u5224\u65B7\u984C\u578B\u3001\u96E3\u5EA6\u3001\u6CD5\u898F\uFF0F\u689D\u6587\u3001\u53C3\u8003\u7B54\u6848\u8207\u6A19\u7C64\u3002">${r(e.aiQuestion||"")}</textarea>
      </label>
      <p class="qb-form-hint">\u9001\u51FA\u5F8C\u7531\u672C\u6A5F llama-server \u56DE\u7B54\u4E26\u81EA\u52D5\u5EFA\u7ACB\u6B04\u4F4D\uFF1B\u984C\u76EE\u6703\u4EE5\u300C\u5F85\u5BE9\u300D\u5EFA\u7ACB\uFF0C\u4ECD\u9700\u4EBA\u5DE5\u8986\u6838\u5F8C\u624D\u6703\u6210\u70BA benchmark-ready\u3002</p>
      <div class="qb-actions">
        <button class="btn btn-primary" type="submit" ${e.aiLoading?"disabled":""}>${e.aiLoading?'<span class="spinner"></span><span>llama-server \u7522\u751F\u4E2D\u2026</span>':`${g("sparkles",14)}<span>\u8B93 llama-server \u7522\u751F\u4E26\u5EFA\u7ACB</span>`}</button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-ai" ${e.aiLoading?"disabled":""}>\u6E05\u9664</button>
      </div>
    </form>
    ${$r()}
  </section>`}function Zu(e){return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("edit",14)}\u7DE8\u8F2F\u984C\u76EE #${e.id}</span>
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
          <select class="select" name="question_type">${Object.entries(Wt).map(([t,s])=>`<option value="${t}" ${e?.question_type===t?"selected":""}>${s}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u96E3\u5EA6</span>
          <select class="select" name="difficulty">${Object.entries(Cs).map(([t,s])=>`<option value="${t}" ${e?.difficulty===t?"selected":""}>${s}</option>`).join("")}</select>
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
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${r(Ju(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${r(Vu(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${r(Wu(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${r(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${r(Ku(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
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
        <button class="btn btn-primary" type="submit">${g("check",14)}<span>\u5132\u5B58\u65B0\u7248\u672C</span></button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-create">\u6E05\u9664</button>
      </div>
      <div class="qb-form-hint">\u4FEE\u6539\u5DF2\u5B58\u5728\u7684\u984C\u76EE\u6703\u5EFA\u7ACB\u65B0\u7248\u672C\uFF1B\u5DF2\u6838\u51C6\u984C\u76EE\u4FEE\u6539\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002</div>
    </form>
    ${$r()}
  </section>`}function ep(e,t){return e?Zu(e):Xu(t)}function tp(e){let t=e.status==="retired"||!!e.deleted_at;return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${r(e.question)}</strong>
        <span class="qb-meta">
          ${r(Wt[e.question_type]||e.question_type)}
          \xB7 ${r(Cs[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${ra(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${vr(e)}
    <div class="qb-item-foot">
      <span>\u66F4\u65B0 ${r($e(e.updated_at))}</span>
      ${e.reviewed_by?`<span>\u5BE9\u6838 ${r(e.reviewed_by)}</span>`:""}
      ${e.review_comment?`<span class="qb-comment">${r(e.review_comment)}</span>`:""}
      <div class="qb-actions">
        ${t?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="restore" data-id="${e.id}">${g("refresh",13)}<span>\u5FA9\u539F\u984C\u76EE</span></button>`:`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${g("edit",13)}<span>\u7DE8\u8F2F</span></button>
               ${["pending_review","changes_requested"].includes(e.status)?"":`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="submit-review" data-id="${e.id}">${g("upload",13)}<span>${e.status==="draft"?"\u9001\u5BE9":"\u91CD\u65B0\u9001\u5BE9"}</span></button>`}
               <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${e.id}">${g("shield",13)}<span>\u9A57\u6536</span></button>
               <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${g("trash",13)}<span>\u522A\u9664</span></button>`}
      </div>
    </div>
  </article>`}function sp(e){return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("database",14)}\u984C\u5EAB\u7BA1\u7406</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="new">${g("plus",13)}<span>\u65B0\u589E</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="revalidate">${g("refresh",13)}<span>\u91CD\u65B0\u9A57\u8B49</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="export">${g("download",13)}<span>\u532F\u51FA JSON</span></button>
      </div>
    </div>
    <form class="qb-filters" data-qb-form="filter">
      <input class="input" name="query" type="search" placeholder="\u641C\u5C0B\u984C\u76EE\u6216\u53C3\u8003\u7B54\u6848" value="${r(e.filters.query)}" />
      <select class="select" name="status">
        <option value="">\u5168\u90E8\u72C0\u614B</option>
        ${Object.entries(br).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(Wt).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(Cs).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <div class="qb-tag-filter" data-qb-tag-filter>
        <div class="qb-tag-values">
          ${e.filters.tags.length?e.filters.tags.map(t=>`<span class="chip qb-tag-chip">${r(t)}<button class="qb-tag-remove" type="button" data-qb-action="remove-tag" data-tag="${r(t)}" aria-label="\u79FB\u9664\u6A19\u7C64 ${r(t)}">${g("x",9)}</button></span>`).join(""):'<span class="qb-tag-placeholder">\u6A19\u7C64</span>'}
        </div>
        <button class="qb-tag-add" type="button" data-qb-action="open-tag-search" aria-label="\u52A0\u5165\u6A19\u7C64" aria-haspopup="listbox">${g("plus",13)}</button>
        ${e.filters.tags.map(t=>`<input type="hidden" name="tags" value="${r(t)}" />`).join("")}
        <div class="qb-tag-popover" data-qb-tag-popover hidden>
          <input class="input" type="search" data-qb-tag-search placeholder="\u8F38\u5165\u76F8\u8FD1\u5B57\u641C\u5C0B\u6A19\u7C64\u2026" autocomplete="off" />
          <div class="qb-tag-results" data-qb-tag-results role="listbox" aria-live="polite"></div>
        </div>
      </div>
      <button class="btn btn-primary btn-sm" type="submit">${g("search",13)}<span>\u7BE9\u9078</span></button>
    </form>
    <div class="qb-list">
      ${e.items.length?e.items.map(t=>tp(t)).join(""):na("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${d(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}var Po=[["queue","\u5F85\u5BE9\uFF0F\u9000\u56DE"],["accepted","\u5DF2\u6838\u51C6"],["rejected","\u5DF2\u62D2\u7D55"],["draft","\u8349\u7A3F"]];function ap(e){let t=e.stats||{};return{queue:Number(t.pending_review||0)+Number(t.changes_requested||0),accepted:Number(t.accepted||0),rejected:Number(t.rejected||0),draft:Number(t.draft||0)}}function np(e,t){let s=e.reviewFilter||"queue",a={queue:{title:"\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u6216\u9000\u56DE\u4FEE\u6539\u7684\u984C\u76EE\u3002",text:t.accepted?`\u5DF2\u6709 ${d(t.accepted)} \u984C\u6838\u51C6\u3002\u65B0\u984C\u76EE\u5EFA\u7ACB\u5F8C\u6703\u81EA\u52D5\u9001\u5BE9\uFF0C\u4E5F\u53EF\u4EE5\u5207\u63DB\u5230\u300C\u5DF2\u6838\u51C6\u300D\u91CD\u65B0\u9A57\u6536\u65E2\u6709\u984C\u76EE\u3002`:"\u5EFA\u7ACB\u984C\u76EE\u5F8C\u6703\u9810\u8A2D\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\uFF1B\u82E5\u53EA\u60F3\u5148\u4FDD\u5B58\uFF0C\u5EFA\u7ACB\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5373\u53EF\u5B58\u6210\u8349\u7A3F\u3002"},accepted:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u6838\u51C6\u984C\u76EE\u3002",text:"\u984C\u76EE\u901A\u904E\u4EBA\u5DE5\u9A57\u6536\u5F8C\u6703\u5217\u5728\u9019\u88E1\uFF1B\u4E5F\u53EF\u4EE5\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u9001\u51FA\u9A57\u6536\u3002"},rejected:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u62D2\u7D55\u984C\u76EE\u3002",text:"\u88AB\u62D2\u7D55\u7684\u984C\u76EE\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u4E2D\uFF0C\u53EF\u4FEE\u6539\u5F8C\u91CD\u65B0\u9001\u5BE9\u3002"},draft:{title:"\u76EE\u524D\u6C92\u6709\u8349\u7A3F\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u984C\u76EE\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5C31\u6703\u5B58\u6210\u8349\u7A3F\uFF0C\u4E4B\u5F8C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002"}}[s]||{title:"\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u65B0\u984C\u76EE\u5F8C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"},n=[s!=="draft"?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="new">${g("plus",13)}<span>\u65B0\u589E\u984C\u76EE</span></button>`:"",s==="queue"&&t.accepted?`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="review-filter" data-filter="accepted">${g("shield",13)}<span>\u67E5\u770B\u5DF2\u6838\u51C6 ${d(t.accepted)}</span></button>`:"",`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="go-manage">${g("database",13)}<span>\u524D\u5F80\u984C\u5EAB\u7BA1\u7406</span></button>`].filter(Boolean).join("");return`<div class="qb-empty qb-empty-block">
    <span class="qb-empty-icon">${g("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>${r(a.title)}</strong>
      <p>${r(a.text)}</p>
      <div class="qb-actions">${n}</div>
    </div>
  </div>`}function rp(e){let t=Po.find(([s])=>s===e);return t?t[1]:"\u5F85\u5BE9\uFF0F\u9000\u56DE"}function ip(e,t){return`<button class="qb-review-item${t?" is-active":""}" type="button" data-qb-action="select-review-item" data-id="${e.id}" aria-pressed="${t?"true":"false"}">
    <span class="qb-review-item-top">
      <span class="qb-id">#${e.id}</span>
      <span class="qb-review-item-meta">
        ${r(Wt[e.question_type]||e.question_type)}
        \xB7 ${r(Cs[e.difficulty]||e.difficulty)}
        \xB7 v${e.version}
        ${e.benchmark_ready?" \xB7 Benchmark ready":""}
        ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
      </span>
      ${ra(e.status)}
    </span>
    <strong>${r(e.question)}</strong>
  </button>`}function op(e){return`<article class="qb-review-pane-card">
    <div class="qb-review-pane-head">
      <div class="qb-review-pane-title">
        <span class="qb-review-item-meta">#${e.id} \xB7 v${e.version} \xB7 ${r(Wt[e.question_type]||e.question_type)} \xB7 ${r(Cs[e.difficulty]||e.difficulty)}</span>
        <strong>${r(e.question)}</strong>
      </div>
      <div class="qb-review-pane-side">
        ${ra(e.status)}
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${g("edit",13)}<span>\u7DE8\u8F2F</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${g("trash",13)}<span>\u522A\u9664</span></button>
        </div>
      </div>
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${vr(e)}
    ${e.review_comment?`<div class="qb-review-note"><span class="summary-label">\u6700\u8FD1\u6279\u6CE8${e.reviewed_by?` \xB7 ${r(e.reviewed_by)}`:""}</span><p>${r(e.review_comment)}</p></div>`:""}
    ${e.reference_answer?`<div class="qb-reference"><span class="summary-label">\u53C3\u8003\u7B54\u6848</span><p>${r(e.reference_answer)}</p></div>`:""}
    <form class="qb-review-form" data-qb-form="review" data-id="${e.id}">
      <div class="qb-score-grid">
        ${[["clarity","\u984C\u76EE\u6E05\u6670"],["labels","\u6CD5\u689D\u6A19\u6CE8"],["answer","\u53C3\u8003\u7B54\u6848"],["difficulty","\u96E3\u5EA6\u8207\u6A19\u7C64"],["overall","\u6574\u9AD4"]].map(([t,s])=>`<label class="field"><span class="field-label">${s} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${t}" value="4" /></label>`).join("")}
      </div>
      <label class="field"><span class="field-label">\u6279\u6CE8</span><textarea class="input" name="comment" rows="3" placeholder="\u6A19\u8A3B\u7406\u7531\u3001\u9700\u8981\u4FEE\u6539\u7684\u6B04\u4F4D\uFF0C\u6216\u9A57\u6536\u7D50\u8AD6\u3002"></textarea></label>
      <div class="qb-actions qb-review-decisions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="decide" data-decision="approved">${g("check",13)}<span>\u6838\u51C6</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="decide" data-decision="changes_requested">${g("edit",13)}<span>\u9000\u56DE\u4FEE\u6539</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-qb-action="decide" data-decision="rejected">${g("x",13)}<span>\u62D2\u7D55</span></button>
      </div>
    </form>
    ${e.reviews?.length?`<div class="qb-review-history"><span class="summary-label">\u5BE9\u6838\u7D00\u9304</span>${e.reviews.map(t=>`<div class="qb-review-row"><span>${r(t.reviewer||"\u533F\u540D")}</span>${ra(t.decision==="approved"?"accepted":t.decision)}<span>${r($e(t.created_at))}</span><p>${r(t.comment||"\u2014")}</p></div>`).join("")}</div>`:""}
  </article>`}function lp(){return`<div class="qb-empty qb-empty-block qb-review-placeholder">
    <span class="qb-empty-icon">${g("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>\u5F9E\u5DE6\u5074\u9078\u64C7\u984C\u76EE</strong>
      <p>\u9EDE\u9078\u984C\u76EE\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u984C\u5E79\u3001\u9810\u671F\u6A19\u8A3B\u3001\u53C3\u8003\u7B54\u6848\u8207\u6838\u51C6\u9078\u9805\u3002</p>
    </div>
  </div>`}function cp(e){let t=e.reviewDetail,s=ap(e),a=e.reviewFilter||"queue",n=Po.map(([l,m])=>`<button class="chip qb-review-tab${a===l?" is-active":""}" type="button" role="tab" aria-selected="${a===l?"true":"false"}" data-qb-action="review-filter" data-filter="${l}"><span>${m}</span><span class="qb-review-tab-count">${d(s[l]||0)}</span></button>`).join(""),i=e.reviewItems.length?e.reviewItems.map(l=>ip(l,Number(t?.id)===Number(l.id))).join(""):`<div class="qb-empty qb-empty-compact">${g("info",16)}<span>\u76EE\u524D\u6C92\u6709${r(rp(a))}\u984C\u76EE\u3002</span></div>`,o=t?op(t):e.reviewItems.length?lp():np(e,s);return`<section class="report-card qb-card qb-review-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("shield",14)}\u984C\u5EAB\u4EBA\u5DE5\u9A57\u6536\u6279\u6CE8</span>
      <span class="badge ${s.queue?"badge-warn":"badge-neutral"}">\u5F85\u5BE9 ${d(s.queue)}</span>
    </div>
    <p class="qb-review-hint">\u65B0\u984C\u76EE\u5EFA\u7ACB\u6216\u4FEE\u6539\u5F8C\u6703\u9032\u5165\u5F85\u5BE9\uFF1B\u9EDE\u9078\u5DE6\u5074\u984C\u76EE\u5373\u53EF\u5728\u53F3\u5074\u67E5\u770B\u5167\u5BB9\u3001\u6838\u51C6\u3001\u9000\u56DE\u6216\u522A\u9664\u3002</p>
    <div class="qb-review-split">
      <aside class="qb-review-list-pane" aria-label="\u9A57\u6536\u984C\u76EE\u6E05\u55AE">
        <div class="qb-review-tabs" role="tablist" aria-label="\u9A57\u6536\u72C0\u614B">${n}</div>
        <div class="qb-review-list">${i}</div>
      </aside>
      <section class="qb-review-detail-pane" aria-live="polite">${o}</section>
    </div>
  </section>`}function aa(e){if(e==null||e==="")return"";let t=Number(e);return Number.isFinite(t)?`${Math.round(t*100)}%`:""}function dp(e){if(!e||typeof e!="object")return"\u5F15\u7528";let t=String(e.jid||"").trim();if(t)return t;let s=String(e.law_name||"").trim(),a=String(e.article_no||"").trim(),n=`${s} ${a}`.trim();return n||String(e.title||e.text||"\u5F15\u7528").slice(0,80)}function up(e){let t=e?.metrics||{},s=t.scores||{},a=[["\u6CD5\u898F\u53EC\u56DE",aa(t.law_recall)],["\u689D\u6587\u53EC\u56DE",aa(t.article_recall)],["\u898F\u5247\u5206",aa(s.deterministic)],["Judge",aa(s.judge)],["\u4EBA\u5DE5",aa(s.human)]].filter(([,n])=>n);return a.length?`<div class="qb-bank-stats">${a.map(([n,i])=>`<span class="qb-bank-stat"><span>${r(n)}</span><strong>${r(i)}</strong></span>`).join("")}</div>`:""}function pp(e){let t=Array.isArray(e?.law_sources)?e.law_sources:[],s=Array.isArray(e?.citations)?e.citations:[],a=t.length?`<div class="qb-bank-sources">${t.map(i=>{let o=String(i.law_name||"\u672A\u547D\u540D\u6CD5\u898F"),l=(i.articles||[]).map(f=>String(f.article_no||"").trim()).filter(Boolean),m=`<strong>${r(o)}</strong>${l.length?`<small>${r(l.join("\u3001"))}</small>`:""}`;return i.law_url?`<a class="qb-bank-law" href="${r(i.law_url)}" target="_blank" rel="noreferrer">${m}</a>`:`<span class="qb-bank-law">${m}</span>`}).join("")}</div>`:"",n=s.length?`<div class="qb-bank-sources qb-bank-citations">${s.map(i=>`<span class="chip chip-mono">${r(dp(i))}</span>`).join("")}</div>`:"";return!a&&!n?"":`<div class="qb-bank-answer-block">
    <div class="qb-bank-section-label"><span>\u5F15\u7528\u4F86\u6E90</span><span>${d(t.length+s.length)} \u7B46</span></div>
    ${a}${n}
  </div>`}function Io(e,t){if(!e)return`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${g("history",20)}</span>
      <strong>\u5C1A\u7121 RAG \u7B54\u6848</strong>
      <span>\u8DD1\u4E00\u6B21 Benchmark \u5F8C\uFF0C\u6700\u8FD1\u4E00\u6B21\u6210\u529F\u56DE\u7B54\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</span>
    </div>`;let s=Number(e.item_version||0),a=Number(t?.version||0),n=s&&a&&s!==a?`<span class="badge badge-warn">\u7B54\u6848 v${s} \xB7 \u984C\u76EE v${a}</span>`:"",i=e.answer_source==="llm"?"LLM \u751F\u6210":e.answer_source==="structured"?"\u6CD5\u898F\u8CC7\u6599\u5EAB":String(e.answer_source||"RAG");return`<div class="qb-bank-answer-meta">
      <span class="badge badge-ok"><span class="status-dot is-ok"></span>RAG \u5B8C\u6210</span>
      <span class="badge badge-neutral">${r(i)}</span>
      ${n}
      <span class="mono">${r(e.run_label||e.run_id||"")}</span>
      <span>${r($e(e.finished_at))}</span>
      <span>${r(de(e.duration_ms))}</span>
      ${e.llm_model?`<span class="mono">${r(e.llm_model)}</span>`:""}
    </div>
    <div class="qb-bank-answer-block">
      <div class="qb-bank-section-label"><span>\u56DE\u7B54</span><span>${d(String(e.answer||"").length)} \u5B57</span></div>
      <p class="qb-bank-answer-text">${r(String(e.answer||"").trim()||"\uFF08\u7A7A\u767D\u56DE\u7B54\uFF09")}</p>
    </div>
    ${pp(e)}
    ${up(e)}`}function Do(e,t){let s=e.selectedSuiteId,a=t&&e.suiteAnswers?.[String(s)]?.[String(t.id)]||null;return t?`<div class="qb-bank-answer-head">
      <div class="qb-bank-answer-heading">
        <span class="qb-bank-answer-kicker">${g("sparkles",12)}RAG \u6700\u8FD1\u4E00\u6B21\u7B54\u6848</span>
        <strong class="qb-bank-answer-question">#${t.id} ${r(t.question)}</strong>
      </div>
      ${a?`<span class="qb-bank-answer-state">${r(Wt[t.question_type]||t.question_type)} \xB7 v${t.version}</span>`:""}
    </div>
    ${Io(a,t)}`:`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${g("cube",20)}</span>
      <strong>\u9078\u64C7\u984C\u76EE</strong>
      <span>\u5F9E\u5DE6\u5074\u6E05\u55AE\u9078\u64C7\u4E00\u984C\uFF0C\u67E5\u770B\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`}function Bo(e){return`<span class="qb-bank-actions">
    <button class="qb-bank-icon" type="button" data-qb-action="edit" data-id="${e.id}" title="\u7DE8\u8F2F\u984C\u76EE" aria-label="\u7DE8\u8F2F\u984C\u76EE #${e.id}">${g("edit",13)}</button>
    <button class="qb-bank-icon is-danger" type="button" data-qb-action="delete" data-id="${e.id}" title="\u5F9E\u984C\u5EAB\u79FB\u9664" aria-label="\u5F9E\u984C\u5EAB\u79FB\u9664 #${e.id}">${g("trash",13)}</button>
  </span>`}function mp(e,t,{selected:s,hasAnswer:a}){return`<div class="qb-bank-row${s?" is-active":""}" data-id="${e.id}">
    <button class="qb-bank-select" type="button" data-qb-action="select-bank-item" data-id="${e.id}" aria-pressed="${s?"true":"false"}">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <span class="qb-bank-item-copy">
        <strong>${r(e.question)}</strong>
        <small>${r(Wt[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${a?"\u5DF2\u6709 RAG \u7B54\u6848":"\u5C1A\u7121 RAG \u7B54\u6848"}</small>
      </span>
    </button>
    ${Bo(e)}
  </div>`}function gp(e,t,s){return`<article class="qb-bank-full-item" data-id="${e.id}">
    <div class="qb-bank-full-head">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <div class="qb-bank-full-title">
        <strong>${r(e.question)}</strong>
        <small>${r(Wt[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${r(br[e.status]?.label||e.status||"")}</small>
      </div>
      ${Bo(e)}
    </div>
    ${Io(s,e)}
  </article>`}function Co(e){let t=e.editingSuite,s=Array.isArray(e.suites)?e.suites:[],a=s.find(u=>Number(u.id)===Number(e.selectedSuiteId))||s[0]||null,n=Array.isArray(a?.items)?a.items:[],i=e.suiteAnswers?.[String(a?.id)]||{},o=n.find(u=>Number(u.id)===Number(e.selectedBankItemId))||null,l=!!e.suiteAnswersLoading,m=String(e.suiteAnswersError||""),f=!!e.suiteManageOpen||!s.length,p=e.bankTab==="full"?"full":"split",$=s.length?`<div class="qb-bank-tabs" role="tablist" aria-label="Benchmark \u984C\u5EAB\u6AA2\u8996">
        <button class="qb-bank-tab${p==="split"?" is-active":""}" type="button" role="tab" aria-selected="${p==="split"?"true":"false"}" data-qb-action="bank-tab" data-tab="split">${g("grid",13)}<span>Benchmark \u984C\u5EAB</span><span class="badge badge-neutral">${d(n.length)}</span></button>
        <button class="qb-bank-tab${p==="full"?" is-active":""}" type="button" role="tab" aria-selected="${p==="full"?"true":"false"}" data-qb-action="bank-tab" data-tab="full">${g("table",13)}<span>\u984C\u5EAB\u5168\u5217\u8868</span><span class="badge badge-neutral">${d(n.length)}</span></button>
      </div>`:"",b="";if(!s.length)b=`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${g("cube",20)}</span>
      <strong>\u5C1A\u672A\u5EFA\u7ACB Benchmark \u984C\u5EAB</strong>
      <span>\u5C55\u958B\u4E0B\u65B9 Suite \u8A2D\u5B9A\u4E26\u5EFA\u7ACB\u984C\u5EAB\u5F8C\uFF0C\u5C31\u80FD\u5728\u9019\u88E1\u700F\u89BD\u984C\u76EE\u8207\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`;else if(l)b='<div class="qb-bank-loading"><span class="spinner" aria-hidden="true"></span><span>\u8B80\u53D6\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u4E2D\u2026</span></div>';else{let u=m?Ee({tone:"warn",title:"\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u8B80\u53D6\u5931\u6557",text:r(m)}):"";p==="full"?b=`${u}<div class="qb-bank-full" data-qb-bank-view="full">${n.length?n.map((h,w)=>gp(h,w,i[String(h.id)]||null)).join(""):na("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>`:b=`${u}<div class="qb-bank-split" data-qb-bank-view="split">
        <div class="qb-bank-list" data-qb-bank-list>${n.length?n.map((h,w)=>mp(h,w,{selected:Number(h.id)===Number(o?.id),hasAnswer:!!i[String(h.id)]})).join(""):na("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>
        <div class="qb-bank-answer-pane" data-qb-bank-answer>${Do(e,o)}</div>
      </div>`}return`<section class="report-card qb-card qb-bank-card">
    <div class="side-card-head qb-bank-head">
      <div class="qb-bank-heading">
        <span class="side-card-title">${g("cube",14)}Benchmark \u984C\u5EAB</span>
        <span class="qb-bank-sub">${a?`${r(a.name)} \xB7 v${a.version} \xB7 ${d(a.item_count)} \u984C`:"\u5C1A\u672A\u5EFA\u7ACB suite"}</span>
      </div>
      <div class="qb-bank-controls">
        ${s.length?`<label class="qb-suite-picker"><span>Suite</span><select class="select" data-qb-suite-select aria-label="\u9078\u64C7 benchmark suite">${s.map(u=>`<option value="${u.id}" ${Number(u.id)===Number(a?.id)?"selected":""}>${r(u.name)} \xB7 ${d(u.item_count)} \u984C</option>`).join("")}</select></label>`:""}
        ${a?`<span class="badge ${a.status==="frozen"?"badge-ok":"badge-neutral"}">${a.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>`:""}
      </div>
    </div>
    ${$}
    ${b}
    <details class="qb-suite-manage" ${f?"open":""}>
      <summary>${g("sliders",14)}Suite \u8A2D\u5B9A\u8207\u7248\u672C <span class="qb-muted">${d(s.length)} \u500B suite \xB7 ${d(e.ready.length)} \u984C benchmark-ready</span></summary>
      <div class="qb-suite-manage-body">
        <form class="qb-suite-form" data-qb-form="suite">
          <input type="hidden" name="suite_id" value="${t?.id||""}" />
          <div class="qb-form-grid">
            <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${r(t?.name||"Pilot 30")}" /></label>
            <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(Ro).map(([u,h])=>`<option value="${u}" ${t?.tier===u?"selected":""}>${h}</option>`).join("")}</select></label>
          </div>
          <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${r(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
          <div class="qb-check-list">
            ${e.ready.length?e.ready.map(u=>{let h=t?t.items?.some(w=>Number(w.id)===Number(u.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${u.id}" ${h?"checked":""}/><span><strong>#${u.id}</strong> ${r(u.question)} <small>${r(Wt[u.question_type]||u.question_type)}</small></span></label>`}).join(""):na("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
          </div>
          <div class="qb-actions">
            <button class="btn btn-primary" type="submit">${g("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
            ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
          </div>
        </form>
        <div class="qb-list">
          ${s.length?s.map(u=>`<article class="qb-suite">
            <div class="qb-item-head">
              <div class="qb-item-title"><strong>${r(u.name)}</strong><span class="qb-meta">${r(Ro[u.tier]||u.tier)} \xB7 v${u.version} \xB7 ${d(u.item_count)} \u984C</span></div>
              <span class="badge ${u.status==="frozen"?"badge-ok":"badge-neutral"}">${u.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
            </div>
            <div class="qb-suite-items">${(u.items||[]).slice(0,8).map(h=>`<span class="chip">#${h.id} ${r(h.question.slice(0,22))}${h.question.length>22?"\u2026":""}</span>`).join("")}${u.item_count>8?`<span class="qb-muted">+${u.item_count-8}</span>`:""}</div>
            <div class="qb-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${u.id}">${g("edit",13)}<span>\u7DE8\u8F2F suite</span></button>
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${u.id}">${g("shield",13)}<span>\u51CD\u7D50</span></button>
              <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${u.id}">${g("trash",13)}<span>\u522A\u9664</span></button>
            </div>
          </article>`).join(""):na("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
        </div>
      </div>
    </details>
  </section>`}function fp(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),n=Number(a?.value);Number.isFinite(n)&&(t[s]=Math.max(1,Math.min(5,Math.round(n))))}return t}function bp(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:Gu(t.get("expected_laws")),expected_articles:Uu(t.get("expected_articles")),expected_judgments:Qu(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function Fo(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},n={tab:"",editing:null,editingFrom:"",editingSuite:null,aiQuestion:"",aiLoading:!1,aiResult:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tags:[]},stats:{},suites:[],ready:[],selectedSuiteId:null,selectedBankItemId:null,bankTab:"split",suiteAnswers:{},suiteAnswersLoading:!1,suiteAnswersError:"",suiteManageOpen:!1,reviewItems:[],reviewDetail:null,reviewFilter:"queue"},i=I=>e.querySelector(`#quality-panel-${a[I]}`),o=(I,G)=>{I&&(I.childElementCount?I.setAttribute("aria-busy","true"):I.innerHTML=`<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>${G}</span></div></section>`)},l=I=>{I?.removeAttribute("aria-busy")},m=0,f=null,p=()=>"anonymous",$=()=>{s&&s(n.stats)},b=I=>{t&&t(I),le(I)},u=async()=>{try{n.stats=await V.questionBankStats()}catch{n.stats={}}$()},h=()=>{let I=i("create");I&&(I.innerHTML=ep(n.editing,n))},w=(I,G)=>{let k=I?.querySelector("[data-qb-tag-results]");k&&(k.innerHTML=G.length?G.map(P=>`<button class="qb-tag-option" type="button" role="option" data-qb-action="select-tag" data-tag="${r(P.tag)}"><span>${r(P.tag)}</span><small>${d(P.count)}</small></button>`).join(""):'<div class="qb-tag-empty">\u6C92\u6709\u5176\u4ED6\u76F8\u7B26\u6A19\u7C64</div>')},_=async(I,G="")=>{if(!I)return;let k=I.querySelector("[data-qb-tag-results]"),P=++m;k&&(k.innerHTML='<div class="qb-tag-loading"><span class="spinner"></span><span>\u641C\u5C0B\u6A19\u7C64\u2026</span></div>');try{let K=await V.questionBankTags(G,12);if(P!==m)return;let H=(K.tags||[]).filter(Re=>!n.filters.tags.includes(Re.tag));w(I,H)}catch(K){if(P!==m)return;k&&(k.innerHTML=`<div class="qb-tag-empty">${r(K.message||"\u6A19\u7C64\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},L=(I,{focus:G=!1}={})=>{if(!I)return;let k=I.querySelector("[data-qb-tag-popover]"),P=I.querySelector("[data-qb-tag-search]");!k||!P||(k.hidden&&(k.hidden=!1,P.value="",_(I,"")),G&&(P.focus(),P.select()))},S=I=>{f&&(window.clearTimeout(f),f=null);let G=I?.querySelector("[data-qb-tag-popover]");G&&(G.hidden=!0)},x=async I=>{let G=String(I||"").trim();G&&(n.filters.tags.includes(G)?n.filters.tags=n.filters.tags.filter(k=>k!==G):n.filters.tags=[...n.filters.tags,G],n.offset=0,await A())},O=()=>{let I=Array.isArray(n.suites)?n.suites:[];if(!I.length)return n.selectedSuiteId=null,n.selectedBankItemId=null,null;let G=I.find(P=>Number(P.id)===Number(n.selectedSuiteId));G||(G=I[0],n.selectedSuiteId=G.id,n.selectedBankItemId=null);let k=Array.isArray(G.items)?G.items:[];return k.some(P=>Number(P.id)===Number(n.selectedBankItemId))||(n.selectedBankItemId=k[0]?.id??null),G},ie=()=>{let I=i("suite");I&&(I.innerHTML=Co(n))},J=0,he=async(I,{force:G=!1}={})=>{if(!I)return;let k=++J;if(!G&&n.suiteAnswers[String(I)]){n.suiteAnswersLoading=!1,n.suiteAnswersError="",ie();return}n.suiteAnswersLoading=!0,n.suiteAnswersError="",ie();try{let P=await V.benchmarkSuiteLatestAnswers(I);if(k!==J)return;n.suiteAnswers[String(I)]=P.answers||{}}catch(P){if(k!==J)return;n.suiteAnswersError=P.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}finally{k===J&&(n.suiteAnswersLoading=!1,ie())}},me=async I=>{n.selectedSuiteId=I,n.selectedBankItemId=null,n.suiteAnswersError="";let G=O();if(!G){ie();return}await he(G.id)},Z=I=>{n.bankTab=I==="full"?"full":"split",ie()},j=()=>{let I=i("suite");if(!I)return;let G=O(),P=(Array.isArray(G?.items)?G.items:[]).find(H=>Number(H.id)===Number(n.selectedBankItemId))||null;for(let H of I.querySelectorAll(".qb-bank-row")){let Re=Number(H.dataset.id)===Number(n.selectedBankItemId);H.classList.toggle("is-active",Re);let Se=H.querySelector("[data-qb-action='select-bank-item']");Se&&Se.setAttribute("aria-pressed",Re?"true":"false")}let K=I.querySelector("[data-qb-bank-answer]");K&&(K.innerHTML=Do(n,P))},A=async()=>{let I=i("manage");if(I){f&&(window.clearTimeout(f),f=null),o(I,"\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026");try{let G=await V.questionBankItems({...n.filters,...n.filters.status==="retired"?{include_deleted:!0}:{}},n.limit,n.offset);n.items=G.items||[],n.total=Number(G.total||0),n.stats=G.stats||n.stats,l(I),I.innerHTML=sp(n),$()}catch(G){l(I),I.innerHTML=`<section class="report-card qb-card">${Ee({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(G.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},E=async({refreshAnswers:I=!1}={})=>{let G=i("suite");if(G){o(G,"\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026");try{let[k,P]=await Promise.all([V.benchmarkSuites(),V.benchmarkReadyQuestions(300)]);n.suites=k.suites||[],n.ready=P.items||[];let K=O();if(n.suiteAnswersError="",n.suiteAnswersLoading=!1,K&&(I||!n.suiteAnswers[String(K.id)]))try{let H=await V.benchmarkSuiteLatestAnswers(K.id);n.suiteAnswers[String(K.id)]=H.answers||{}}catch(H){n.suiteAnswersError=H.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}l(G),G.innerHTML=Co(n)}catch(k){l(G),G.innerHTML=`<section class="report-card qb-card">${Ee({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(k.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},X=()=>{let I=i("review");I&&(I.innerHTML=cp(n))},W=async I=>{let G=n.reviewItems.find(P=>Number(P.id)===Number(I));if(!G)return;n.reviewDetail=G,X();let k=i("review")?.querySelector(".qb-review-detail-pane");k&&window.matchMedia("(max-width: 1020px)").matches&&k.scrollIntoView({behavior:"smooth",block:"start"});try{let P=await V.questionBankItem(G.id);Number(n.reviewDetail?.id)===Number(G.id)&&(n.reviewDetail=P,X())}catch(P){D(P.message||"\u984C\u76EE\u5167\u5BB9\u8B80\u53D6\u5931\u6557\u3002","danger")}},B=async()=>{let I=i("review");if(!I)return;o(I,"\u8B80\u53D6\u9A57\u6536\u984C\u76EE\u4E2D\u2026");let G=n.reviewFilter||"queue",k=G==="queue"?["pending_review","changes_requested"]:G==="accepted"?["accepted"]:G==="rejected"?["rejected"]:["draft"];try{let P=await Promise.all(k.map(Se=>V.questionBankItems({status:Se},200,0)));n.reviewItems=P.flatMap(Se=>Se.items||[]),n.stats=P[0]?.stats||n.stats;let K=Number(n.reviewDetail?.id||0),Re=n.reviewItems.some(Se=>Number(Se.id)===K)?K:Number(n.reviewItems[0]?.id||0);n.reviewDetail=Re?await V.questionBankItem(Re):null,l(I),X(),$()}catch(P){l(I),I.innerHTML=`<section class="report-card qb-card">${Ee({tone:"danger",title:"\u9A57\u6536\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:r(P.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}};function le(I){let G=n.tab;n.tab=I;for(let k of Object.keys(a)){let P=i(k);P&&(P.hidden=k!==I)}I==="create"?(G!=="create"&&!n.editing&&(n.aiQuestion="",n.aiResult=null),h()):I==="manage"?A():I==="suite"?E():I==="review"&&B()}let ge=I=>{let k=[...n.items,...n.reviewItems,...n.reviewDetail?[n.reviewDetail]:[]].find(K=>Number(K.id)===Number(I));n.reviewDetail=k||{id:Number(I)};let P=k?.status;["accepted","rejected","draft"].includes(P)?n.reviewFilter=P:P&&(n.reviewFilter="queue"),b("review")},F=async I=>{let G=bp(I),k=Number(I.elements.item_id?.value||0);k||(G.status=I.elements.submit_for_review?.checked?"pending_review":"draft");try{k?(await V.updateQuestionBankItem(k,{...G,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),D("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await V.createQuestionBankItem(G),D(G.status==="draft"?"\u984C\u76EE\u5DF2\u5B58\u70BA\u8349\u7A3F\uFF0C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002":"\u984C\u76EE\u5DF2\u5EFA\u7ACB\u4E26\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok")),n.editing=null;let P=["manage","suite","review"].includes(n.editingFrom)?n.editingFrom:"manage";n.editingFrom="",n.suiteAnswers={},await u(),b(P)}catch(P){let K=P.detail||P.payload?.detail,H=K?.errors?.join(" \xB7 ")||K?.message||P.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";D(H,"danger",8e3)}},fe=async I=>{let G=String(new FormData(I).get("question")||"").trim();if(G.length<4){D("\u984C\u76EE\u81F3\u5C11\u9700\u8981 4 \u500B\u5B57\u3002","danger");return}n.aiQuestion=G,n.aiLoading=!0,n.aiResult=null,h();try{let k=await V.createQuestionBankItemWithAI({question:G});n.aiResult=k,n.aiQuestion="",await u(),D(`llama-server \u5DF2\u5EFA\u7ACB\u984C\u76EE #${k.item.id}\uFF0C\u72C0\u614B\u70BA\u5F85\u5BE9\uFF0C\u8ACB\u4EBA\u5DE5\u8986\u6838\u3002`,"ok",8e3)}catch(k){let P=k.detail||k.payload?.detail,K=P?.errors?.join(" \xB7 ")||P?.message||k.message||"llama-server \u7522\u751F\u5931\u6557\u3002";D(K,"danger",12e3)}finally{n.aiLoading=!1,h()}},ee=async(I,G)=>{let k=Number(I.dataset.id||0);if(k)try{await V.reviewQuestionBankItem(k,{decision:G,reviewer:p(),rubric_scores:fp(I),comment:String(I.querySelector('[name="comment"]')?.value||"")}),D(G==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":G==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",G==="approved"?"ok":"info"),await u(),await B()}catch(P){let K=P.detail||P.payload?.detail,H=K?.errors?.join(" \xB7 ")||K?.message||P.message||"\u9A57\u6536\u5931\u6557\u3002";D(H,"danger",8e3)}},xe=async I=>{let G=new FormData(I),k=Number(G.get("suite_id")||0),P=Array.from(I.querySelectorAll('input[name="item_ids"]:checked')).map(H=>Number(H.value)),K={name:String(G.get("name")||"").trim(),tier:String(G.get("tier")||"core"),description:String(G.get("description")||"").trim(),item_ids:P};try{k?(await V.updateBenchmarkSuite(k,K),D("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await V.createBenchmarkSuite(K),D("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),n.editingSuite=null,n.suiteManageOpen=!0,n.suiteAnswers={},await E()}catch(H){let Re=H.detail||H.payload?.detail,Se=Re?.errors?.join(" \xB7 ")||Re?.message||H.message||"Suite \u5132\u5B58\u5931\u6557\u3002";D(Se,"danger",8e3)}},ve=async I=>{let G=e.querySelector("[data-qb-tag-filter] [data-qb-tag-popover]:not([hidden])")?.closest("[data-qb-tag-filter]");G&&!I.target.closest("[data-qb-tag-filter]")&&S(G);let k=I.target.closest("[data-qb-action]")?.dataset.qbAction;if(!k)return;let P=I.target.closest("[data-qb-action]"),K=Number(P.dataset.id||0);if(k==="open-tag-search"){let H=P.closest("[data-qb-tag-filter]");L(H,{focus:!0});return}if(k==="select-tag"){await x(P.dataset.tag);return}if(k==="remove-tag"){await x(P.dataset.tag);return}if(k==="bank-tab"){Z(P.dataset.tab);return}if(k==="select-bank-item"){n.selectedBankItemId=K,j();return}if(k==="new"){n.editing=null,n.editingFrom="",n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,b("create");return}if(k==="reset-create"){n.editing=null,h();return}if(k==="reset-ai"){n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,h();return}if(k==="edit"){let H=n.suites.find(Pe=>Number(Pe.id)===Number(n.selectedSuiteId)),Se=[...n.items,...n.reviewItems,...H?.items||[],...n.reviewDetail?[n.reviewDetail]:[]].find(Pe=>Number(Pe.id)===K);if(!Se)return;n.editing=Se,n.editingFrom=n.tab,b("create");return}if(k==="review"){ge(K);return}if(k==="review-ai-item"){let H=n.aiResult?.item;if(!H)return;n.reviewFilter="queue",n.reviewDetail=H,b("review");return}if(k==="review-filter"){let H=String(P.dataset.filter||"queue");n.reviewFilter=["queue","accepted","rejected","draft"].includes(H)?H:"queue",n.reviewDetail=null,await B();return}if(k==="select-review-item"){await W(K);return}if(k==="go-manage"){b("manage");return}if(k==="submit-review"){try{await V.submitQuestionBankItemForReview(K),D("\u5DF2\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok"),await u(),n.tab==="manage"?await A():n.tab==="review"&&await B()}catch(H){let Re=H.detail||H.payload?.detail,Se=Re?.errors?.join(" \xB7 ")||Re?.message||H.message||"\u9001\u5BE9\u5931\u6557\u3002";D(Se,"danger",8e3)}return}if(k==="restore"){if(!window.confirm(`\u78BA\u5B9A\u5FA9\u539F\u984C\u76EE #${K}\uFF1F\u5FA9\u539F\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\u72C0\u614B\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002`))return;try{await V.restoreQuestionBankItem(K),D("\u984C\u76EE\u5DF2\u5FA9\u539F\u4E26\u56DE\u5230\u5F85\u5BE9\u3002","ok"),await u(),await A()}catch(H){let Re=H.detail||H.payload?.detail,Se=Re?.errors?.join(" \xB7 ")||Re?.message||H.message||"\u5FA9\u539F\u5931\u6557\u3002";D(Se,"danger",8e3)}return}if(k==="delete"){if(n.tab==="suite"){let H=O();if(!H||!(H.items||[]).find(Se=>Number(Se.id)===K)||!window.confirm(`\u78BA\u5B9A\u5F9E\u300C${H.name}\u300D\u79FB\u9664\u984C\u76EE #${K}\uFF1F\u984C\u76EE\u4ECD\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u7BA1\u7406\u4E2D\u3002`))return;try{await V.removeBenchmarkSuiteItem(H.id,K),D("\u5DF2\u5F9E Benchmark \u984C\u5EAB\u79FB\u9664\u3002","info"),delete n.suiteAnswers[String(H.id)],Number(n.selectedBankItemId)===K&&(n.selectedBankItemId=null),await E()}catch(Se){D(Se.message||"\u79FB\u9664\u5931\u6557\u3002","danger")}return}if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${K}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await V.deleteQuestionBankItem(K),D("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await u(),n.tab==="review"?(n.reviewDetail=null,await B()):await A()}catch(H){D(H.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(k==="revalidate"){try{let H=await V.revalidateQuestionBank();D(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${d(H.checked||0)} \u984C\uFF0C${d(H.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await u(),await A()}catch(H){D(H.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(k==="export"){try{let H=await V.exportQuestionBank({status:""});Ct(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(H,null,2),"application/json;charset=utf-8")}catch(H){D(H.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(k==="import-json"){let H=e.querySelector("#qb-import-json");try{let Re=JSON.parse(String(H?.value||"").trim()),Se=await V.importQuestionBank(Re);D(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${Se.created}\u3001\u66F4\u65B0 ${Se.updated}\u3001\u932F\u8AA4 ${(Se.errors||[]).length}\u3002`,(Se.errors||[]).length?"warn":"ok",8e3),H&&(H.value=""),await u(),await A()}catch(Re){D(Re.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(k==="prev"||k==="next"){n.offset=Math.max(0,n.offset+(k==="next"?n.limit:-n.limit)),await A();return}if(k==="suite-edit"){let H=n.suites.find(Re=>Number(Re.id)===K);if(!H)return;n.editingSuite=H,n.suiteManageOpen=!0,E();return}if(k==="suite-new"){n.editingSuite=null,n.suiteManageOpen=!0,E();return}if(k==="suite-freeze"){try{await V.updateBenchmarkSuite(K,{freeze:!0}),D("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),n.editingSuite=null,n.suiteManageOpen=!0,await E()}catch(H){D(H.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(k==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${K}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await V.deleteBenchmarkSuite(K),D("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),n.editingSuite=null,n.suiteAnswers={},n.suiteManageOpen=!0,await E()}catch(H){D(H.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(k==="decide"){let H=P.closest("form[data-qb-form='review']");H&&await ee(H,String(P.dataset.decision||""))}},ae=async I=>{let G=I.target.closest("[data-qb-form]");if(!G)return;I.preventDefault();let k=G.dataset.qbForm;if(k==="create")await F(G);else if(k==="ai-create")await fe(G);else if(k==="filter"){let P=new FormData(G);n.filters={query:String(P.get("query")||"").trim(),status:String(P.get("status")||""),question_type:String(P.get("question_type")||""),difficulty:String(P.get("difficulty")||""),tags:P.getAll("tags").map(K=>String(K).trim()).filter(Boolean)},n.offset=0,await A()}else k==="suite"&&await xe(G)},ne=async I=>{let G=I.target.closest?.("form[data-qb-form='filter'] select");if(G){G.form.requestSubmit();return}let k=I.target.closest?.("[data-qb-suite-select]");if(!k)return;let P=Number(k.value||0);!P||P===Number(n.selectedSuiteId)||await me(P)},pe=I=>{let G=I.target;G?.matches?.(".qb-suite-manage")&&(n.suiteManageOpen=!!G.open)},be=I=>{let G=I.target.closest?.("[data-qb-action='open-tag-search']");G&&L(G.closest("[data-qb-tag-filter]"))},_e=I=>{let G=I.target.closest?.("[data-qb-tag-filter]");G&&(I.relatedTarget&&G.contains(I.relatedTarget)||S(G))},ke=I=>{let G=I.target.closest?.("[data-qb-tag-search]");if(!G)return;let k=G.closest("[data-qb-tag-filter]");f&&window.clearTimeout(f),f=window.setTimeout(()=>{_(k,G.value)},160)},Ne=I=>{let G=I.target.closest?.("[data-qb-tag-search]");if(!G)return;let k=G.closest("[data-qb-tag-filter]");I.key==="Escape"?(I.preventDefault(),S(k),G.blur()):I.key==="Enter"?(I.preventDefault(),k?.querySelector("[data-qb-action='select-tag']")?.click()):I.key==="ArrowDown"&&(I.preventDefault(),k?.querySelector("[data-qb-action='select-tag']")?.focus())};e.addEventListener("click",ve),e.addEventListener("submit",ae),e.addEventListener("change",ne),e.addEventListener("toggle",pe,!0),e.addEventListener("mouseover",be),e.addEventListener("mouseout",_e),e.addEventListener("input",ke),e.addEventListener("keydown",Ne);let Oe=async()=>{await u(),n.tab==="create"?h():n.tab==="manage"?await A():n.tab==="suite"?await E({refreshAnswers:!0}):n.tab==="review"&&await B()};return u(),{show:le,refresh:Oe,destroy(){f&&window.clearTimeout(f),e.removeEventListener("click",ve),e.removeEventListener("submit",ae),e.removeEventListener("change",ne),e.removeEventListener("toggle",pe,!0),e.removeEventListener("mouseover",be),e.removeEventListener("mouseout",_e),e.removeEventListener("input",ke),e.removeEventListener("keydown",Ne)},getStats:()=>n.stats}}function Wa(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function Oo(e){return e==null?"\u2014":d(e)}function hp(e){return e.count?e.severity==="danger"?Ge("failed","\u9700\u8655\u7406"):e.severity==="warn"?Ge("warning","\u6CE8\u610F"):Ge("preview","\u63D0\u793A"):Ge("success","\u901A\u904E")}function vp(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function $p(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${vp(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${r(e.label)}</span>
      ${hp(e)}
    </div>
    <div class="quality-check-value">
      <strong>${d(t)}</strong>
      <span>\u7B46</span>
      <em>${r(Wa(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${r(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function Va(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
      <div class="index-chart-head"><span>${r(e)}</span><span>${r(t)}</span></div>
      <div class="index-chart-empty">DuckDB \u6383\u63CF\u5F8C\u6C92\u6709\u53EF\u5448\u73FE\u7684\u8CC7\u6599\u3002</div>
    </div>`;let n=Math.max(...a.map(i=>Number(i.value)||0),1);return`<div class="index-chart-card">
    <div class="index-chart-head"><span>${r(e)}</span><span>${r(t)}</span></div>
    <div class="distribution">
      ${a.map(i=>{let o=Number(i.value)||0,l=Math.max(1.5,o/n*100);return`<div class="dist-row">
            <span class="dist-label" title="${r(i.label||"\u672A\u5206\u985E")}">${r(i.label||"\u672A\u5206\u985E")}</span>
            <span class="dist-track"><span class="dist-bar" style="width:${l.toFixed(2)}%"></span></span>
            <span class="dist-value">${d(o)}</span>
          </div>`}).join("")}
    </div>
  </div>`}function yp(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},n=t.postgres_diff,i=n==null?"\u2014":n===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${d(Math.abs(n))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${d(t.vector_indexed)} / ${d(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${g("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${d(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${d(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${g("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${Oo(t.postgres_judgments)}</div>
      <div class="metric-foot">${r(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${g("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${r(Wa(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${r(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${g("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${Oo(a.candidate_total)}</div>
      <div class="metric-foot">${d(a.candidate_archive_count)} / ${d(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function wp(e){return e.length?`<div class="table-wrap">
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
                <span class="mono">${r(t.archive||"\u2014")}</span>
                ${t.version?`<span class="chip">v${r(t.version)}</span>`:""}
              </td>
              <td class="cell-number">${d(t.rows)}</td>
              <td class="cell-number">${a}</td>
              <td class="cell-number">${d(t.matched_rows)}</td>
              <td class="cell-number">${r(Wa(t.match_rate))}</td>
              <td class="cell-number">${d(t.short_text_rows)}</td>
              <td class="cell-number">${d(s)}</td>
              <td class="cell-number">${d(t.duplicate_content_rows)}</td>
              <td class="cell-date">${r(Et(t.date_min))} \u2013 ${r(Et(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:ot({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function _p(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],n=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=qe(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${Ge(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${d(t.rows)} \u7B46 \xB7 ${d(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${de(e.scan_ms||0)} \xB7
          ${r($e(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${g("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${Ee({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(m=>r(m)).join("<br>")})}</div>`:""}
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
        <div class="summary-value">${r(Wa(t.match_rate))}</div>
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
          ${d(n.ok_count)} \u9805\u901A\u904E \xB7
          ${d(n.warning_count)} \u9805\u6CE8\u610F \xB7
          ${d(n.danger_count)} \u9805\u9700\u8655\u7406 \xB7
          ${d(n.info_count)} \u9805\u63D0\u793A
        </span>
      </div>
      <div class="quality-checks">${a.map($p).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${yp(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${d(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${wp(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${Va("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${Va("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${Va("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${Va("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function kp(e){e.innerHTML=`<section class="page data-page quality-page">
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
          ${g("refresh",15)}<span>\u91CD\u65B0\u6383\u63CF</span>
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
            <span class="status-tab-icon">${g("activity",15)}</span>
            <span class="status-tab-copy"><strong>\u54C1\u8CEA\u7E3D\u89BD</strong><small>DuckDB \u539F\u59CB\u8CC7\u6599\u8207\u8986\u84CB\u6AA2\u67E5</small></span>
            <span class="badge badge-neutral" id="quality-badge-overview">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="create">
            <span class="status-tab-icon">${g("plus",15)}</span>
            <span class="status-tab-copy"><strong>\u984C\u5EAB\u65B0\u589E</strong><small>llama-server \u81EA\u52D5\u51FA\u984C\u8207 JSON \u532F\u5165</small></span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="manage">
            <span class="status-tab-icon">${g("database",15)}</span>
            <span class="status-tab-copy"><strong>\u984C\u5EAB\u7BA1\u7406</strong><small>\u7248\u672C\u3001\u72C0\u614B\u3001\u6A19\u7C64\u8207\u522A\u9664</small></span>
            <span class="badge badge-neutral" id="quality-badge-manage">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="suite">
            <span class="status-tab-icon">${g("cube",15)}</span>
            <span class="status-tab-copy"><strong>Benchmark \u984C\u5EAB</strong><small>\u51CD\u7D50 suite \u8207 benchmark-ready \u984C\u76EE</small></span>
            <span class="badge badge-neutral" id="quality-badge-suite">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="review">
            <span class="status-tab-icon">${g("shield",15)}</span>
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),n=[...e.querySelectorAll("[data-quality-tab]")],i={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},o=null,l="overview",m=()=>{if(!o)return;t.innerHTML=_p(o),a.textContent=`DUCKDB \xB7 ${d(o.totals?.rows)} \u7B46 \xB7 ${de(o.scan_ms||0)}`;let h=e.querySelector("#quality-badge-overview");h&&(h.textContent=d(o.totals?.rows||0))},f=h=>{l=h==="overview"?"overview":h;for(let w of n){let _=w.dataset.qualityTab===l;w.classList.toggle("is-active",_),_?w.setAttribute("aria-current","page"):w.removeAttribute("aria-current")}for(let[w,_]of Object.entries(i))_&&(_.hidden=w!==l);l!=="overview"?a.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":o&&m()},p=Fo(e,{onNavigate:h=>f(h),onStats:h=>{let w=h||{},_=e.querySelector("#quality-badge-manage"),L=e.querySelector("#quality-badge-suite"),S=e.querySelector("#quality-badge-review");_&&(_.textContent=d(w.total||0)),L&&(L.textContent=d(w.benchmark_ready||0)),S&&(S.textContent=d((w.pending_review||0)+(w.changes_requested||0)))}}),$=h=>{f(h),h!=="overview"&&p.show(h)},b=async()=>{Me(s,!0,"\u6383\u63CF\u4E2D\u2026");try{o=await V.quality(),m()}catch(h){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${Ee({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:r(h.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",D("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{Me(s,!1)}},u=async()=>{l==="overview"?await b():await p.refresh()};s.addEventListener("click",u),e.addEventListener("click",h=>{let w=h.target.closest("[data-quality-tab]");w&&$(w.dataset.qualityTab||"overview")}),t.addEventListener("click",h=>{!h.target.closest("[data-action='export-quality']")||!o||Ct(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(o,null,2),"application/json;charset=utf-8")}),f("overview"),await b()}var kr={};rs(kr,{render:()=>nm});var Ka={};rs(Ka,{render:()=>wr});var Ho={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function zo(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${r(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${r(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function Sp(e){let t=e?.supports_chat,s=t===!0?"badge-ok":t===!1?"badge-danger":"badge-neutral",a=t===!0?"\u652F\u63F4 chat":t===!1?"\u4E0D\u652F\u63F4 chat":"\u672A\u6E2C\u8A66",n=(Array.isArray(e?.capabilities)?e.capabilities:[]).map(i=>`<span class="chip chip-mono">${r(i)}</span>`).join("");return`<div class="tests-llm-row">
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
  </div>`}function xp(e){let t=Array.isArray(e?.models)?e.models:[],s=e?.counts||{},a=Array.isArray(e?.failures)?e.failures:[];return{summary:e?`<span>llama-server <strong>${s.available??t.length}</strong> \u500B\u6A21\u578B</span>
      <span>\u652F\u63F4 chat <strong>${s.chat??0}</strong></span>
      <span>\u4E0D\u652F\u63F4 <strong>${s.unsupported??0}</strong></span>
      <span>\u672A\u6E2C\u8A66 <strong>${s.untested??0}</strong></span>
      <span>\u672C\u6B21\u65B0\u6E2C <strong>${(e.tested_now||[]).length}</strong></span>
      <span class="muted">${r(e.detail||"")}</span>`:"<span>\u6B63\u5728\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u2026</span>",list:t.length?t.map(Sp).join(""):'<div class="tests-llm-empty">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u8ACB\u78BA\u8A8D llama-server \u5DF2\u555F\u52D5\u4E26\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66\u3002</div>',failures:a.length?`<div class="tests-llm-failures">${a.map(i=>`<span><strong class="mono">${r(i.model||"\u2014")}</strong> ${r(i.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function Ap(e){let t=String(e?.status||"degraded"),s=t==="operational"?"badge-ok":t==="disabled"?"badge-neutral":"badge-danger",a=Array.isArray(e?.scores)?e.scores.slice(0,4):[],n=Array.isArray(e?.results)?e.results[0]:null;return`<div class="tests-llm-row">
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
  </div>`}function qp(e){if(!e)return{summary:"<span>\u6B63\u5728\u8B80\u53D6 reranker \u72C0\u614B\u2026</span>",list:"",failures:""};let t=Array.isArray(e.providers)?e.providers:[],s=e.active||{},a=String(e.status||"degraded"),n=a==="operational"?"badge-ok":a==="not_configured"?"badge-neutral":"badge-danger",i=t.flatMap(o=>(o.errors||[]).map(l=>({model:o.url,detail:l})));return{summary:`<span>\u72C0\u614B <span class="badge ${n}">${r(a)}</span></span>
      <span>\u6A21\u578B <strong>${r(e.model||"\u2014")}</strong></span>
      <span>\u555F\u7528 <strong>${e.enabled?"true":"false"}</strong></span>
      ${s.url?`<span>\u4F5C\u7528\u4E2D <strong class="mono">${r(s.url)}</strong></span>`:""}
      <span class="muted">${r(e.detail||"")}</span>`,list:t.length?t.map(Ap).join(""):'<div class="tests-llm-empty">\u6C92\u6709\u8A2D\u5B9A RERANK_URL\uFF1B\u8ACB\u8A2D\u5B9A primary \u6216 fallback reranker\u3002</div>',failures:i.length?`<div class="tests-llm-failures">${i.map(o=>`<span><strong class="mono">${r(o.model||"\u2014")}</strong> ${r(o.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function Mp(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,total_ms:e.total_ms,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}:${a.duration_ms}`)}:null})}async function wr(e,t,{embedded:s=!1}={}){let a=!1,n=!1,i={embedding:[],llm:[]},o=!1,l=null,m=!1,f=null,p=!1,$=null,b=[],u="",h=null,w="",_=`<div class="page-actions">
      <span class="badge badge-neutral badge-mono" id="tests-mode-badge">\u8B80\u53D6\u4E2D</span>
      <button class="btn btn-secondary" type="button" id="tests-refresh">
        ${g("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
      </button>
    </div>`,L=s?`<div class="tests-embed-head">
        <div>
          <div class="eyebrow">SYSTEM TEST</div>
          <div class="tests-embed-title">\u7CFB\u7D71\u6E2C\u8A66</div>
          <div class="tests-embed-copy">\u5F8C\u7AEF API \u9023\u7DDA\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u591A\u6A21\u578B\u6E2C\u8A66 Flow\u3002\u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207\u5177\u5099 chat \u80FD\u529B\u7684 LLM \u6A21\u578B\u3002</div>
        </div>
        ${_}
      </div>`:`<div class="page-header">
      <div>
        <div class="eyebrow">SYSTEM TEST</div>
        <h1 class="page-title">\u7CFB\u7D71\u6E2C\u8A66</h1>
        <p class="page-subtitle">\u5408\u4F75\u5F8C\u7AEF API \u9023\u7DDA\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u591A\u6A21\u578B\u6E2C\u8A66 Flow\u3002
          \u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207\u5177\u5099 chat \u80FD\u529B\u7684 LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002</p>
      </div>
      ${_}
    </div>`;e.innerHTML=`<section class="${s?"tests-page tests-page-embedded":"page tests-page"}">
    ${L}

    <div class="tests-grid">
      <section class="card tests-card tests-api-card" aria-labelledby="tests-api-title">
        <form class="api-dialog-form tests-api-form" id="tests-api-form" novalidate>
          <div class="api-dialog-head">
            <span class="api-dialog-icon" aria-hidden="true">${g("link",17)}</span>
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
              ${g("activity",14)}<span>\u6E2C\u8A66\u9023\u7DDA</span>
            </button>
            <span class="grow"></span>
            <button class="btn btn-ghost btn-sm" type="button" id="tests-api-reset">\u6062\u5FA9\u9810\u8A2D</button>
            <button class="btn btn-primary btn-sm" type="submit" id="tests-api-save">
              ${g("check",14)}<span>\u5132\u5B58\u4E26\u91CD\u65B0\u8F09\u5165</span>
            </button>
          </div>
        </form>
      </section>

      <section class="card tests-card" aria-labelledby="tests-mode-title">
        <div class="tests-card-head">
          <span class="tests-card-icon">${g("terminal",16)}</span>
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
            ${g("sparkles",13)}<span>\u524D\u5F80 RAG \u63D0\u554F</span>
          </a>
          <a class="btn btn-secondary btn-sm" href="#/performance">
            ${g("activity",13)}<span>\u6548\u80FD Flow</span>
          </a>
        </div>
        <div class="tests-status" id="tests-mode-status" role="status"></div>
      </section>
    </div>

    <section class="card tests-card tests-llm-card" aria-labelledby="tests-llm-title">
      <div class="tests-card-head">
        <span class="tests-card-icon">${g("brain",16)}</span>
        <div>
          <div class="tests-card-title" id="tests-llm-title">LLM \u670D\u52D9\u6E2C\u8A66</div>
          <div class="tests-card-copy">\u6AA2\u67E5 llama-server \u4E0A\u6BCF\u500B\u6A21\u578B\u662F\u5426\u652F\u63F4 chat\uFF0C\u4E26\u628A\u7D50\u679C\u5BEB\u5165\u80FD\u529B\u6E05\u55AE\uFF1B\u5DF2\u6709\u6E2C\u8A66\u7D00\u9304\u7684\u6A21\u578B\u4E0D\u6703\u91CD\u6E2C\u3002LLM \u6548\u80FD\u8A55\u4F30\u53EA\u6703\u7D0D\u5165\u652F\u63F4 chat \u7684\u6A21\u578B\u3002</div>
        </div>
      </div>
      <div class="tests-llm-head">
        <div class="tests-llm-summary" id="tests-llm-summary">\u6B63\u5728\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u2026</div>
        <button class="btn btn-primary btn-sm" type="button" id="tests-llm-test">
          ${g("activity",14)}<span>\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66</span>
        </button>
      </div>
      <div class="tests-llm-list" id="tests-llm-list"></div>
      <div id="tests-llm-failures"></div>
      <div class="tests-status" id="tests-llm-status" role="status"></div>
    </section>

    <section class="card tests-card tests-llm-card" aria-labelledby="tests-rerank-title">
      <div class="tests-card-head">
        <span class="tests-card-icon">${g("filter",16)}</span>
        <div>
          <div class="tests-card-title" id="tests-rerank-title">Reranker \u670D\u52D9\u6E2C\u8A66</div>
          <div class="tests-card-copy">\u6AA2\u67E5 RAG_RERANK_ENABLED\u3001primary\uFF0Ffallback reranker \u5065\u5EB7\u72C0\u614B\uFF0C\u4E26\u4EE5\u5BE6\u969B rerank \u8ACB\u6C42\u9A57\u8B49\u6A21\u578B\u8207\u5206\u6578\u3002\u6E2C\u8A66\u4E0D\u6703\u4FEE\u6539\u7D22\u5F15\u6216\u9078\u53D6\u7D50\u679C\u3002</div>
        </div>
      </div>
      <div class="tests-llm-head">
        <div class="tests-llm-summary" id="tests-rerank-summary">\u6B63\u5728\u8B80\u53D6 reranker \u72C0\u614B\u2026</div>
        <button class="btn btn-primary btn-sm" type="button" id="tests-rerank-test">
          ${g("activity",14)}<span>\u57F7\u884C Reranker \u670D\u52D9\u6E2C\u8A66</span>
        </button>
      </div>
      <div class="tests-llm-list" id="tests-rerank-list"></div>
      <div id="tests-rerank-failures"></div>
      <div class="tests-status" id="tests-rerank-status" role="status"></div>
    </section>

    <div id="tests-flow"></div>
  </section>`;let S=e.querySelector("#tests-mode-badge"),x=e.querySelector("#tests-mode-toggle"),O=e.querySelector("#tests-mode-summary"),ie=e.querySelector("#tests-mode-models"),J=e.querySelector("#tests-mode-status"),he=e.querySelector("#tests-api-form"),me=e.querySelector("#tests-api-input"),Z=e.querySelector("#tests-admin-token-input"),j=e.querySelector("#tests-api-preview"),A=e.querySelector("#tests-api-status"),E=e.querySelector("#tests-api-note"),X=e.querySelector("#tests-api-test"),W=e.querySelector("#tests-api-reset"),B=e.querySelector("#tests-api-save"),le=e.querySelector("#tests-refresh"),ge=e.querySelector("#tests-flow"),F=e.querySelector("#tests-llm-summary"),fe=e.querySelector("#tests-llm-list"),ee=e.querySelector("#tests-llm-failures"),xe=e.querySelector("#tests-llm-status"),ve=e.querySelector("#tests-llm-test"),ae=e.querySelector("#tests-rerank-summary"),ne=e.querySelector("#tests-rerank-list"),pe=e.querySelector("#tests-rerank-failures"),be=e.querySelector("#tests-rerank-status"),_e=e.querySelector("#tests-rerank-test");Z&&(Z.value=ga());let ke=(re,we,Ue="")=>{re&&(re.textContent=we,re.className=`tests-status${Ue?` is-${Ue}`:""}`)},Ne=(re,we="")=>{A&&(A.textContent=re,A.className=`api-dialog-status${we?` is-${we}`:""}`)},Oe=()=>Nt()==="query",I=()=>{let re=Kt(me.value);return re||(window.location.protocol==="file:"?cn:"")},G=()=>{let re=I(),we=Bt(),Ue=Ho[Nt()]||Nt()||"\u540C\u6E90";j.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${r(is(we))}</strong>${we?`\uFF08${r(Ue)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${r(it("/api/health",re))}`},k=()=>{let re=Nt(),we=`\u76EE\u524D\u4F86\u6E90\uFF1A${Ho[re]||re||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,Ue="";re==="query"?(Ue="is-warn",we="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):ma()?(Ue="is-warn",we="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(re==="file-default"||window.location.protocol==="file:")&&(we="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),we+=(Z?.value||ga()).trim()?" \u7BA1\u7406\u6B0A\u6756\uFF1A\u5DF2\u8A2D\u5B9A\uFF0C\u6703\u9001\u5F80\u76EE\u524D\u8A2D\u5B9A\u7684 API Base\u3002":" \u7BA1\u7406\u6B0A\u6756\uFF1A\u672A\u8A2D\u5B9A\uFF1B\u672C\u6A5F loopback \u53EF\u76F4\u63A5\u4F7F\u7528\uFF0C\u9060\u7AEF\u7BA1\u7406 API \u6703\u88AB\u62D2\u7D55\u3002",E.textContent=we,E.className=`api-dialog-note${Ue?` ${Ue}`:""}`;let Ye=re==="query";B.disabled=Ye,W.disabled=Ye,me.readOnly=Ye},P=()=>{if(!dn(me.value))return Ne("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),me.focus(),null;let re=I();return window.location.protocol==="https:"&&/^http:\/\//i.test(re)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(re)?(Ne("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),me.focus(),null):re},K=()=>{me.value=Bt(),G(),k(),Ne("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},H=()=>{let re=Array.isArray(i.embedding)?i.embedding.length:0,we=Array.isArray(i.llm)?i.llm.length:0;if(S&&(S.textContent=o?"\u5207\u63DB\u4E2D\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",S.className=`badge badge-mono ${o?"badge-info":n?"badge-warn":"badge-neutral"}`),x){x.disabled=o,x.classList.toggle("is-on",n),x.classList.toggle("is-off",!n&&!o),x.classList.toggle("is-busy",o),x.setAttribute("aria-checked",n?"true":"false"),x.setAttribute("aria-busy",o?"true":"false"),x.setAttribute("aria-label",o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":n?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),x.title=o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let Ue=x.querySelector(".header-power-label");Ue&&(Ue.textContent=o?"\u2026":n?"ON":"OFF")}O&&(O.textContent=n?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${re} \u500B embedding \u8207 ${we} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),ie&&(ie.innerHTML=zo("Embedding",i.embedding)+zo("LLM",i.llm))},Re=async()=>{try{let re=await V.testMode();if(a)return;n=!!re.enabled,i=re.models||{embedding:[],llm:[]},ke(J,"")}catch(re){if(a)return;n=!1,i={embedding:[],llm:[]},ke(J,re.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}a||H()},Se=async()=>{if(o)return;let re=!n;o=!0,H(),ke(J,re?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let we=await V.setTestMode(re);if(a)return;n=!!we.enabled,i=we.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:n,models:i}}));let Ue=i.embedding?.length||0,Ye=i.llm?.length||0;ke(J,n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${Ue} \u500B embedding \u8207 ${Ye} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),D(n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${Ue} \u500B embedding\u3001${Ye} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",n?"ok":"info",6e3),await Ze()}catch(we){a||(ke(J,we.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),D(we.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{o=!1,a||H()}},Pe=()=>{let re=xp(l);if(F&&(F.innerHTML=re.summary),fe&&(fe.innerHTML=re.list),ee&&(ee.innerHTML=re.failures),ve){ve.disabled=m,ve.setAttribute("aria-busy",m?"true":"false");let we=ve.querySelector("span");we&&(we.textContent=m?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66")}},Ie=async()=>{try{let re=await V.llmModels();if(a)return;l=re,ke(xe,"")}catch(re){if(a)return;l=null,ke(xe,re.message||"\u7121\u6CD5\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u3002","error")}a||Pe()},ut=async()=>{if(!m){m=!0,Pe(),ke(xe,"\u6B63\u5728\u6AA2\u67E5 llama-server \u6A21\u578B\u8207 chat \u80FD\u529B\u2026");try{let re=await V.testLlmModels();if(a)return;l=re;let we=re.tested_now?.length||0,Ue=re.chat_models?.length||0,Ye=re.failures?.length||0;ke(xe,`${we?`\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u672C\u6B21\u65B0\u6E2C ${we} \u500B\u6A21\u578B`:"\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u6C92\u6709\u65B0\u6A21\u578B"}\uFF0C\u76EE\u524D ${Ue} \u500B\u6A21\u578B\u652F\u63F4 chat${Ye?`\uFF1B${Ye} \u500B\u6A21\u578B\u66AB\u6642\u7121\u6CD5\u5224\u5B9A\uFF0C\u4E0B\u6B21\u6703\u91CD\u8A66`:""}\u3002`,Ye?"warn":"ok"),D(we?`LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u65B0\u589E ${we} \u7B46\u80FD\u529B\u7D00\u9304\u3002`:"LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u6C92\u6709\u65B0\u6A21\u578B\u9700\u8981\u6E2C\u8A66\u3002",Ye?"warn":"ok",5e3),await Re()}catch(re){a||(ke(xe,re.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),D(re.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{m=!1,a||Pe()}}},Ke=()=>{let re=qp(f);if(ae&&(ae.innerHTML=re.summary),ne&&(ne.innerHTML=re.list),pe&&(pe.innerHTML=re.failures),_e){_e.disabled=p,_e.setAttribute("aria-busy",p?"true":"false");let we=_e.querySelector("span");we&&(we.textContent=p?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C Reranker \u670D\u52D9\u6E2C\u8A66")}},st=async()=>{try{let re=await V.rerankStatus();if(a)return;f=re,ke(be,"")}catch(re){if(a)return;f=null,ke(be,re.message||"\u7121\u6CD5\u8B80\u53D6 reranker \u72C0\u614B\u3002","error")}a||Ke()},qt=async()=>{if(!p){p=!0,Ke(),ke(be,"\u6B63\u5728\u5C0D primary\uFF0Ffallback reranker \u57F7\u884C\u5BE6\u969B rerank \u6E2C\u8A66\u2026");try{let re=await V.testReranker();if(a)return;f=re;let we=Array.isArray(re.providers)?re.providers:[],Ue=we.filter(jt=>jt.status==="operational").length,Ye=we.reduce((jt,zt)=>jt+(Array.isArray(zt.errors)?zt.errors.length:0),0);ke(be,Ye?`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${Ue} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C${Ye} \u500B\u932F\u8AA4\uFF1B\u8A73\u7D30\u5206\u6578\u5DF2\u5217\u5728\u4E0A\u65B9\u3002`:`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${Ue} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C\u6A21\u578B ${re.model||"\u2014"}\u3002`,Ye?"warn":"ok"),D(Ye?"Reranker \u90E8\u5206\u7AEF\u9EDE\u5931\u6557\uFF0C\u8ACB\u67E5\u770B\u6E2C\u8A66\u7D50\u679C\u3002":"Reranker \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\u3002",Ye?"warn":"ok",5e3)}catch(re){a||(ke(be,re.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),D(re.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{p=!1,a||Ke()}}},Mt=()=>{if(!ge)return;let re=Mp($,b,u);re!==w&&(w=re,ge.innerHTML=Rs($,b,u))},Ve=async()=>{try{let re=await V.testRuns(30);if(a)return;b=Array.isArray(re.runs)?re.runs:[]}catch{if(a)return;b=[]}},Ze=async(re=null)=>{try{let we=re||(u?await V.testRun(u):await V.testRunCurrent());if(a)return;$=we.run||null,!u&&$&&$.status!=="running"&&!b.some(Ue=>Ue.run_id===$.run_id)&&await Ve()}catch{if(a)return;$=null}a||Mt()};me?.addEventListener("input",()=>{G(),Ne("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),Z?.addEventListener("input",()=>{k()}),X?.addEventListener("click",async()=>{let re=P();if(re!==null){Me(X,!0,"\u6E2C\u8A66\u4E2D\u2026"),Ne(`\u6B63\u5728\u9023\u7DDA\u5230 ${is(re)||"\u540C\u6E90"}\u2026`);try{let we=await Dr(re);if(a)return;Ne(`\u9023\u7DDA\u6210\u529F \xB7 v${we.version} \xB7 ${we.duration_ms} ms \xB7 GET ${it("/api/health",re)}`,"ok")}catch(we){a||Ne(we.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{a||Me(X,!1)}}}),he?.addEventListener("submit",re=>{if(re.preventDefault(),Oe())return;let we=P();we!==null&&(gn(we),Cr(Z?.value||""),D(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${is(we)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),W?.addEventListener("click",()=>{Oe()||(gn(""),D("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),x?.addEventListener("click",Se),ve?.addEventListener("click",ut),_e?.addEventListener("click",qt),ge?.addEventListener("change",async re=>{re.target.id==="test-run-select"&&(u=String(re.target.value||""),await Ze())}),ge?.addEventListener("click",async re=>{re.target.closest("#test-flow-refresh")&&(u="",await Ve(),await Ze())}),le?.addEventListener("click",async()=>{Me(le,!0,"\u66F4\u65B0\u4E2D\u2026"),K(),await Promise.allSettled([Re(),Ve(),Ie(),st()]),a||await Ze(),a||(Me(le,!1),D("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let Lt=re=>{n=!!re.detail?.enabled,i=re.detail?.models||{embedding:[],llm:[]},H()};return window.addEventListener("judgment:test-mode",Lt),K(),H(),Pe(),Ke(),await Promise.allSettled([Re(),Ve(),Ie(),st()]),await Ze(),h=mt("test-runs",async(re,we)=>{a||document.hidden||u||await Ze(we?.snapshot||null)}),!s&&typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{a=!0,h&&h(),window.removeEventListener("judgment:test-mode",Lt)}}var Go={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var Vo={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},_r=new Set,Wo=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"tests",label:"\u7CFB\u7D71\u6E2C\u8A66",hint:"API\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u6A21\u578B Flow",icon:"terminal"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"local-model",label:"Model Provider",hint:"llama-server \u4E3B\u6A5F\u8207\u6A21\u578B",icon:"server"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 API \u2192 Pipeline \u2192 Data",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}],ia=[{id:"system",label:"\u7CFB\u7D71\u8207\u5373\u6642\u72C0\u614B",icon:"activity",prefixes:["/api/health","/api/status","/api/system-usage","/api/events/stream","/api/processing/events/status","/api/docs","/api/openapi.json"]},{id:"processing",label:"\u8CC7\u6599\u8655\u7406\u8207\u66F4\u65B0",icon:"database",prefixes:["/api/processing","/api/judgment-download","/api/updates","/api/courts","/api/law-versions"]},{id:"data",label:"\u67E5\u8A62\u8207\u8CC7\u6599",icon:"search",prefixes:["/api/query","/api/data","/api/judgment","/api/law","/api/schema","/api/catalog","/api/judgment-stats","/api/quality"]},{id:"rag",label:"RAG \u554F\u7B54",icon:"message",prefixes:["/api/rag"]},{id:"index",label:"\u7248\u672C\u8207\u7D22\u5F15",icon:"layers",prefixes:["/api/index-versions","/api/index-alias","/api/versioning"]},{id:"models",label:"\u6A21\u578B\u8207\u670D\u52D9",icon:"brain",prefixes:["/api/ollama","/api/llm","/api/rerank","/api/test-mode"]},{id:"tests",label:"\u6E2C\u8A66\u8207\u6548\u80FD",icon:"activity",prefixes:["/api/test-runs","/api/performance"]},{id:"question-bank",label:"\u984C\u5EAB",icon:"file",prefixes:["/api/question-bank"]},{id:"benchmark",label:"Benchmark",icon:"grid",prefixes:["/api/benchmark"]},{id:"other",label:"\u5176\u4ED6",icon:"terminal",prefixes:[]}];function Lp(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Rt(e).label,tone:Rt(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function jp(e){let t=Rt(e.status),s=Go[e.kind]||Go.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${d(e.latency_ms)} ms</span>`;return`<article class="service-card">
    <div class="service-top">
      <span class="service-icon">${g(s,14)}</span>
      <span class="service-name" title="${r(e.name)}">${r(e.name)}</span>
      <span class="service-kind">${r(e.kind||"")}</span>
    </div>
    <div class="service-status">
      <span class="status-dot ${t.tone==="ok"?"is-ok":t.tone==="warn"?"is-warn":t.tone==="danger"?"is-danger":"is-idle"}" aria-hidden="true"></span>
      ${r(t.label)}
      ${a}
    </div>
    <p class="service-detail" title="${r(e.detail||"")}">${r(e.detail||"")}</p>
  </article>`}function Tp(e,t){let s=typeof e=="string"?{label:e}:e||{},a=String(s.label||"\u2014"),n=s.service?t.find(l=>l.id===s.service):null,i=n?n.status==="operational":a==="IndexedDB"?ci():!0,o=[s.detail||"",n?`\u72C0\u614B\uFF1A${Rt(n.status).label}`:""].filter(Boolean).join(" \xB7 ");return`<div class="arch-node ${i?"":"is-muted"}" title="${r(o||(i?a:"\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"))}">
    <strong>${r(a)}</strong>
    ${s.detail?`<span class="arch-node-detail">${r(s.detail)}</span>`:""}
  </div>`}function Np(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>Tp(l,t)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${r(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),n=[];return a.forEach((i,o)=>{o&&n.push(`<div class="arch-arrow" aria-hidden="true">${g("arrowRight",15)}</div>`),n.push(i)}),`<div class="arch-flow">${n.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${g("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>
    ${Ep()}`}function Ep(){return`<figure class="arch-diagram">
    <figcaption class="arch-diagram-head">
      <span class="section-title">\u6D41\u7A0B\u65B9\u5411\u793A\u610F\u5716</span>
      <span class="section-sub">\u76EE\u524D\u5C08\u6848\u7684\u8ACB\u6C42\u3001SSE\u3001RAG\u3001\u8655\u7406\u6D41\u7A0B\u3001\u80CC\u666F\u6392\u7A0B\u8207\u8CC7\u6599\uFF0F\u6A21\u578B\u670D\u52D9\u65B9\u5411\uFF1B\u5716\u8868\u53EF\u6C34\u5E73\u6372\u52D5</span>
    </figcaption>
    <div class="arch-diagram-scroll">
      <svg class="arch-diagram-svg" viewBox="0 0 1180 740" role="img" aria-labelledby="arch-flow-title arch-flow-desc">
        <title id="arch-flow-title">Judgment RAG Console \u524D\u5F8C\u7AEF\u6D41\u7A0B\u65B9\u5411\u793A\u610F\u5716</title>
        <desc id="arch-flow-desc">\u700F\u89BD\u5668 RAG Console \u900F\u904E REST \u8207 SSE \u9023\u7DDA FastAPI 9200\uFF1BFastAPI \u547C\u53EB RAG Orchestrator\u3001Processing Runtime\u3001Scheduler \u8207 Power Agent\u3002RAG \u8207\u8655\u7406\u6D41\u7A0B\u8B80\u5BEB PostgreSQL\u3001Qdrant\u3001Parquet \u8207 llama-server Embedding\u3001Reranker\u3001LLM\u3002\u700F\u89BD\u5668\u53E6\u4EE5 IndexedDB \u4FDD\u5B58\u63D0\u554F\u6B77\u53F2\u8207\u7A3D\u6838\u8CC7\u6599\u3002</desc>
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
        <text class="arch-diagram-node-title" x="872" y="364">llama-server Embedding</text>
        <text class="arch-diagram-node-sub" x="872" y="383">bge-m3 \xB7 1,024 dims \xB7 x570\uFF0Flocal fallback</text>

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
  </figure>`}function Ko(e){let t=String(e||""),s=a=>t===a||t.startsWith(`${a}/`);for(let a of ia)if(a.prefixes.some(s))return a;return ia[ia.length-1]}function Rp(e){return`is-${String(e||"get").toLowerCase()}`}function Cp(e){return`<div class="endpoint-row${e.deprecated?" is-deprecated":""}">
    <span class="endpoint-method ${Rp(e.method)}">${r(e.method||"GET")}</span>
    <span class="endpoint-path" title="${r(e.path||"")}">${r(e.path||"")}</span>
    <span class="endpoint-label">${r(e.label||"")}</span>
  </div>`}function Pp(e){if(!Array.isArray(e)||!e.length)return'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>';let t=new Map(ia.map(s=>[s.id,{group:s,endpoints:[]}]));for(let s of e){let a=Ko(s.path),n=t.get(a.id);n&&n.endpoints.push(s)}return`<div class="api-endpoint-groups">${ia.map(s=>{let n=t.get(s.id)?.endpoints||[];return n.length?(n.sort((i,o)=>String(i.path).localeCompare(String(o.path))||String(i.method).localeCompare(String(o.method))),`<section class="card api-endpoint-group">
        <div class="side-card-head">
          <span class="side-card-title">${g(s.icon,14)}${r(s.label)}</span>
          <span class="badge badge-neutral badge-mono">${d(n.length)}</span>
        </div>
        <div class="endpoint-list">${n.map(Cp).join("")}</div>
      </section>`):""}).join("")}</div>`}function ss(e,t){return`<div class="detail-row">
    <span class="detail-label">${r(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function Be(e,t,{mono:s=!1,wide:a=!1}={}){return`<div class="data-version-fact${a?" is-wide":""}">
    <span>${r(e)}</span>
    <strong class="${s?"mono":""}">${r(String(t??"\u2014"))}</strong>
  </div>`}function Uo(e,t,s,a=""){let n=t==null?null:Math.max(0,Math.min(100,Number(t)||0));return`<div class="data-version-coverage ${a}">
    <div class="data-version-coverage-head">
      <span>${r(e)}</span>
      <strong>${Ya(n)}</strong>
    </div>
    <div class="data-version-coverage-track"><span style="width:${n===null?0:n.toFixed(1)}%"></span></div>
    <div class="data-version-coverage-foot">${r(s)}</div>
  </div>`}function Ip(e){if(!Array.isArray(e)||!e.length)return ot({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${r(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${ba(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function Dp(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=new Map(s.map(w=>[w.id,w])),n=a.get("qdrant"),i=a.get("embedding"),o=a.get("rag"),l=a.get("llm"),m=Number(t.judgment_indexed_count||0),f=Number(t.judgment_count||0),p=f?(m/f*100).toFixed(1):"0.0",$=t.judgment_vector_points===null||t.judgment_vector_points===void 0?"\u2014":d(t.judgment_vector_points),b=Number(t.judgment_index_remaining||0),u=o?.status==="operational"?"RAG \u5C31\u7DD2":o?.status==="not_configured"?"\u672A\u8A2D\u5B9A":o?.status==="degraded"?"\u964D\u7D1A":"\u672A\u77E5",h=[["cube","Qdrant \u5411\u91CF\u7D22\u5F15",n],["layers",`Embedding\uFF08${t.judgment_vector_model||"\u2014"}\uFF09`,i],["brain","RAG \u56DE\u7B54\u7BA1\u7DDA",o],["sparkles","LLM \u6A21\u578B",l]];return`<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("database",14)}RAG \u8CC7\u6599\u73FE\u6CC1</span>
      ${Ge(o?.status,u)}
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
          <div class="mini-stat-value">${p}%</div>
          <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
        </div>
      </div>
      <div class="side-status-list">
        ${h.map(([w,_,L])=>`<div class="side-status-row">
              <span>${g(w,13)}${r(_)}</span>
              ${Ge(L?.status,L?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
            </div>`).join("")}
      </div>
      <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
        Collection\uFF1A${r(t.judgment_vector_collection||"\u2014")} \xB7
        ${$} points \xB7 \u5269\u9918 ${d(b)} \u7B46\u5F85\u7D22\u5F15
      </div>
    </div>
    <div class="side-card-foot">
      PostgreSQL \u5224\u6C7A\u6587\u4EF6\u3001Qdrant \u5411\u91CF\u7D22\u5F15\u8207 llama-server \u6A21\u578B\u72C0\u614B\u7686\u70BA\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u5C31\u7DD2\u6642\u6703\u660E\u78BA\u964D\u7D1A\u3002
    </div>
  </section>`}function Ya(e){let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function as(e){return Math.max(0,Number(e?.duration_ms)||0)}function Bp(e,t){let s=e?.pipeline&&typeof e.pipeline=="object"?e.pipeline:null,a=Array.isArray(s?.stages)?s.stages:[],n=Number(s?.total_ms)||a.reduce((b,u)=>b+as(u),0),i=Math.max(0,Number(t?.initMs)||0),o=Math.max(0,Number(t?.requestMs)||0),l=Math.max(o,n),m=Math.max(0,l-n),f=[],p=t?.requestStartedAt||e?.checked_at||null,$=t?.requestFinishedAt||e?.checked_at||null;if(i>.5&&f.push({key:"page-init",label:"\u9801\u9762\u521D\u59CB\u5316",caption:"\u5EFA\u7ACB\u670D\u52D9\u7E3D\u89BD\u9AA8\u67B6\u8207\u5C0E\u89BD",color:"#64748b",status:"success",duration_ms:i,started_at:t?.initStartedAt||p,finished_at:p,message:"\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u3001\u8F09\u5165\u6A21\u7D44\u4E26\u6E96\u5099\u8ACB\u6C42\u3002"}),a.length){m>.5&&f.push({key:"http",label:"HTTP \u50B3\u8F38\uFF0F\u6392\u968A",caption:"\u700F\u89BD\u5668 \u2192 FastAPI",color:"#94a3b8",status:"success",duration_ms:m,started_at:p,finished_at:$,message:"\u5305\u542B\u9023\u7DDA\u3001\u8ACB\u6C42\u6392\u968A\u8207\u56DE\u61C9\u50B3\u8F38\u3002"}),f.push(...a);let b=a.reduce((h,w)=>h+as(w),0),u=Math.max(0,n-b);u>.5&&f.push({key:"server-assemble",label:"\u4F3A\u670D\u5668\u5F59\u6574",caption:"\u72C0\u614B\u56DE\u61C9\u7D44\u88DD",color:"#cbd5e1",status:"success",duration_ms:u,started_at:a[a.length-1]?.finished_at||p,finished_at:$,message:"\u7D44\u88DD\u670D\u52D9\u3001\u8CC7\u6599\u91CF\u8207\u67B6\u69CB payload\u3002"})}else f.push({key:"status-request",label:"GET /api/status",caption:"\u670D\u52D9\u72C0\u614B\u8207\u8CC7\u6599\u91CF",color:"#64748b",status:"success",duration_ms:l,started_at:p,finished_at:$,message:"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF1B\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593\u3002"});return{total_ms:i+l,started_at:t?.initStartedAt||p,finished_at:$,stages:f,server_ms:n,request_ms:l,transport_ms:m,init_ms:i,detailed:!!s}}function Fp(e){let t=e?.page_pipeline,s=Array.isArray(t?.stages)?t.stages:[];if(!t||!s.length)return"";let a=Math.max(0,Number(t.total_ms)||s.reduce((x,O)=>x+as(O),0)),n=Math.max(a,s.reduce((x,O)=>x+as(O),0),1),i=1.25,o=s.filter(x=>String(x.status||"success")!=="skipped"),l=s.filter(x=>["success","no_change"].includes(String(x.status||"success"))).length,m=s.filter(x=>x.status==="failed").length,f=s.reduce((x,O)=>as(O)>as(x)?O:x,s[0]),p=Math.max(0,Number(t.server_ms)||Number(e?.pipeline?.total_ms)||0),$=Math.max(0,Number(t.transport_ms)||0),b=Math.max(0,Number(t.init_ms)||0),u=s.map(x=>String(x.status||"success")==="skipped"?0:Math.max(as(x)/n*100,i)),h=u.reduce((x,O)=>x+O,0),w=h>100?100/h:1,_=0,L=s.map((x,O)=>{let ie=String(x.status||"success"),J=ie==="skipped",he=x.label||x.key||`\u968E\u6BB5 ${O+1}`,me=x.caption||"",Z=as(x),j=J?"\u2014":de(Z),A=n>0?Z/n*100:0,E=J?0:u[O]*w,X=_;J||(_+=E);let W=x.color||"#64748b",B=ie==="failed"?"var(--danger)":W,le=[`is-${ie}`,ie==="failed"?"is-error":"",J?"is-missing":""].filter(Boolean).join(" "),ge=E>0?`<span class="rag-wf-bar status-wf-bar is-sequential" style="left:${X.toFixed(3)}%;width:${E.toFixed(4)}%;top:0;height:12px;--bar-color:${r(B)}" aria-hidden="true"></span>`:"",F=J?"\u7565\u904E":ie==="failed"?"\u5931\u6557":"\u5B8C\u6210",fe=`${t.label||"status"}:${x.key||O}`,ee=[["\u72C0\u614B",F,!0],["\u958B\u59CB",x.started_at?$e(x.started_at):"\u2014",!0],["\u7D50\u675F",x.finished_at?$e(x.finished_at):"\u2014",!0],["\u8017\u6642",j,!0],["\u5360\u6574\u9AD4",Ya(A),!0],["\u8AAA\u660E",x.message||"",!1]].map(([xe,ve,ae])=>ae||ve?`<span class="rag-wf-detail"><span>${r(xe)}</span><strong>${r(String(ve||"\u2014"))}</strong></span>`:"").join("");return`<details class="rag-wf-stage status-wf-stage ${le}" data-status-wf-stage="${r(fe)}"${_r.has(fe)?" open":""} style="--stage-color:${r(W)}">
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="status-wf-step">${String(O+1).padStart(2,"0")}</span> ${r(he)}</strong>${me?`<small>${r(me)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(j)} \xB7 ${r(F)} <span class="rag-wf-chevron">${g("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${he}\uFF1A${F}\uFF0C\u8017\u6642 ${j}\uFF0C\u5360\u6574\u9AD4 ${Ya(A)}`)}">${ge}</span>
        </summary>
        <div class="rag-wf-details">${ee}</div>
      </details>`}).join(""),S=t.detailed?"\u5F8C\u7AEF /api/status \u968E\u6BB5\u660E\u7D30":"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF0C\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593";return`<section class="report-card status-wf-card" data-status-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${g("activity",14)}\u670D\u52D9\u7E3D\u89BD\u8F09\u5165 Pipeline</span>
      <div class="index-runtime-metrics">
        <span class="index-runtime-metric" title="\u672C\u6B21\u9801\u9762\u521D\u59CB\u5316\u5230\u72C0\u614B\u56DE\u61C9\u5B8C\u6210\u7684\u7E3D\u6642\u9593\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(de(a))}</strong></span>
        <span class="index-runtime-metric" title="\u5F8C\u7AEF /api/status \u6AA2\u67E5\u968E\u6BB5\u7684\u5408\u8A08\u6642\u9593\u3002"><span>Server</span><strong>${r(de(p))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u8ACB\u6C42\u6642\u9593\u6263\u6389\u5F8C\u7AEF\u6AA2\u67E5\u5F8C\u7684\u50B3\u8F38\u8207\u6392\u968A\u6642\u9593\u3002"><span>HTTP \u50B3\u8F38</span><strong>${r(de($))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u9AA8\u67B6\u8207\u8F09\u5165\u6A21\u7D44\u7684\u6642\u9593\u3002"><span>\u9801\u9762\u521D\u59CB\u5316</span><strong>${r(de(b))}</strong></span>
        <span class="index-runtime-metric" title="\u8017\u6642\u6700\u9577\u7684\u6AA2\u67E5\u968E\u6BB5\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${f?.label||"\u2014"} \xB7 ${de(as(f))}`)}</strong></span>
        <span class="index-runtime-metric" title="\u5B8C\u6210\u7684\u6AA2\u67E5\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\uFF1B\u5931\u6557\u968E\u6BB5\u6703\u4EE5\u7D05\u8272\u6A19\u793A\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${d(l)} / ${d(s.length)}${m?` \xB7 \u5931\u6557 ${d(m)}`:""}</strong></span>
      </div>
    </div>
    <div class="status-wf-summary">
      <span>\u6AA2\u67E5 <strong>${r($e(e.checked_at))}</strong></span>
      <span>API <strong class="mono">${r(is())}</strong></span>
      <span>\u7248\u672C <strong class="mono">v${r(e.version||"\u2014")}</strong></span>
      <span>\u74B0\u5883 <strong>${r(e.environment||"\u2014")}</strong></span>
      <span>${r(S)}</span>
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
      <div class="rag-wf-stages">${L}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u986F\u793A\u672C\u6B21\u958B\u555F\u670D\u52D9\u7E3D\u89BD\u7684\u9801\u9762\u521D\u59CB\u5316\u3001HTTP \u5F80\u8FD4\u3001\u5F8C\u7AEF\u6AA2\u67E5\u8207\u56DE\u61C9\u5F59\u6574\u3002\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u5931\u6557\u968E\u6BB5\u4EE5\u7D05\u8272\u6A19\u793A\uFF0C\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\uFF1B\u6975\u77ED\u968E\u6BB5\u4FDD\u7559\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function Op(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=Lp(e.status),n=s.find(f=>f.id==="qdrant"),i=s.find(f=>f.id==="rag"),o=s.find(f=>f.id==="llm"),l=Nt(),m=Vo[l]||l;return`<section class="status-hero">
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
          <span>${g("clock",11)} \u6AA2\u67E5\u6642\u9593 ${$e(e.checked_at)} \xB7 ${r(Hs(e.checked_at))}</span>
          <span>${g("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${g("database",11)} ${d(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${g("layers",11)} ${d(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${r(m)}">${g("link",11)} ${r(is())}</span>
        </div>
      </div>
    </section>

    ${Fp(e)}

    <div class="service-grid">${s.map(jp).join("")}</div>

    ${Dp(e)}

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

    ${n?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${Ee({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${r(n?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${r(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${r(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}`}function Hp(e){let t=Array.isArray(e.services)?e.services:[],s=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Pipelines \u2192 Data \xB7 \u6700\u65B0\u5C08\u6848\u5143\u4EF6\u8207\u5373\u6642\u5065\u5EB7\u72C0\u614B</div>
      </div>
      <span class="badge badge-neutral badge-mono">${d((s.flow||[]).length)} layers</span>
    </div>
    ${Np(s,t)}
  </div>`}function zp(e){let t=Array.isArray(e.endpoints)?e.endpoints:[],s=Nt(),a=Vo[s]||s,n=it("/api/docs"),i=it("/api/openapi.json"),o=new Set(t.map(f=>Ko(f.path).id)),l=t.reduce((f,p)=>{let $=String(p.method||"GET").toUpperCase();return f[$]=(f[$]||0)+1,f},{}),m=["GET","POST","PATCH","PUT","DELETE"].filter(f=>l[f]).map(f=>`${f} ${d(l[f])}`).join(" \xB7 ");return`<section class="status-hero api-endpoint-hero">
      <div class="status-hero-main">
        <div class="overall-row">
          <span class="overall-badge">
            <span class="status-dot is-ok" aria-hidden="true"></span>
            OpenAPI \u6700\u65B0
          </span>
          <span class="badge badge-neutral badge-mono">${d(t.length)} \u500B\u7AEF\u9EDE</span>
          <span class="badge badge-neutral badge-mono">${d(o.size)} \u500B\u5206\u985E</span>
        </div>
        <h2 class="status-headline">API \u7AEF\u9EDE\u76EE\u9304</h2>
        <p class="status-copy">\u7531 FastAPI \u76EE\u524D\u8DEF\u7531\u8868\u81EA\u52D5\u6574\u7406\uFF0C\u6DB5\u84CB REST\u3001SSE\u3001\u8CC7\u6599\u8655\u7406\u3001\u7248\u672C\u7D22\u5F15\u3001\u984C\u5EAB\u3001Benchmark\u3001\u6E2C\u8A66 Flow \u8207\u6A21\u578B\u670D\u52D9\u3002</p>
        <div class="status-meta">
          <span>${g("server",11)} API Base <span class="mono">${r(is())}</span>\uFF08${r(a)}\uFF09</span>
          <span>${g("terminal",11)} ${r(m||"\u2014")}</span>
          <span>${g("clock",11)} \u66F4\u65B0\u6642\u9593 ${$e(e.checked_at)}</span>
        </div>
      </div>
      <div class="api-endpoint-actions">
        <a class="btn btn-secondary btn-sm" href="${r(n)}" target="_blank" rel="noopener noreferrer">${g("external",13)}<span>Swagger UI</span></a>
        <a class="btn btn-ghost btn-sm" href="${r(i)}" target="_blank" rel="noopener noreferrer">OpenAPI JSON ${g("external",11)}</a>
      </div>
    </section>
    ${Pp(t)}
    <p class="status-footnote">\u7AEF\u9EDE\u7531 FastAPI route table \u52D5\u614B\u7522\u751F\uFF1B\u4E92\u52D5\u5F0F\u6587\u4EF6\u4F4D\u65BC <a href="${r(n)}" target="_blank" rel="noopener noreferrer"><code>${r(n)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${r(i)}" target="_blank" rel="noopener noreferrer"><code>${r(i)}</code></a>\u3002\u7AEF\u9EDE\u8B8A\u66F4\u5F8C\u91CD\u65B0\u6574\u7406\u6B64\u9801\u5373\u53EF\u53D6\u5F97\u6700\u65B0\u6E05\u55AE\u3002</p>`}function Gp(e,t={}){let s=e.data||{},a=t.info||null,n=a?.counts||{},i=Number(s.judgment_indexed_count||0),o=Number(s.judgment_count||0),l=Number(s.judgment_index_remaining??Math.max(0,o-i)),m=Number(s.judgment_index_pending??l)||0,f=Number(s.judgment_index_changed||0),p=Number(s.judgment_index_stale||0),$=o>0?Math.max(0,Math.min(100,i/o*100)):null,b=Ya($),u=s.judgment_index_fresh===!1||m>0||String(s.judgment_index_staleness?.status||"")==="stale",h=u?"is-warn":"",w=s.last_version||{},_=s.last_run||{},L=w.source_type==="law"?"\u6CD5\u898F":w.source_type==="order"?"\u547D\u4EE4":"\u2014",S=w.version_code?String(w.version_code):w.id?`#${d(w.id)}`:"\u2014",x=Number(s.legal_article_indexed_count||s.legal_index?.points_count||0),O=Number(s.legal_article_count||s.legal_index?.article_count||0),ie=O>0?Math.max(0,Math.min(100,x/O*100)):null,J=s.legal_article_stale===!0||String(s.legal_index?.status||"")==="stale",he=J?"is-warn":"",me=s.judgment_vector_alias||"\u2014",Z=s.judgment_vector_collection||"\u2014",j=s.legal_article_vector_alias||s.legal_index?.alias||"\u2014",A=s.legal_article_vector_collection||s.legal_index?.collection||"\u2014",E=u?"\u5224\u6C7A\u7D22\u5F15\u5F85\u66F4\u65B0":"\u8CC7\u6599\u7248\u672C\u4E00\u81F4",X=u?`\u5224\u6C7A\u7D22\u5F15\u5C1A\u7F3A ${d(m)} \u7B46`:"\u5224\u6C7A\u8CC7\u6599\u8207\u5411\u91CF\u7D22\u5F15\u4E00\u81F4",W=u?`PostgreSQL \u76EE\u524D\u6709 ${d(o)} \u7B46\u5224\u6C7A\uFF0CQdrant ${Z} \u5DF2\u7D22\u5F15 ${d(i)} \u7B46\uFF1B\u5C1A\u6709 ${d(m)} \u7B46\u5F85\u7D22\u5F15\u3002`:"PostgreSQL \u8207 Qdrant \u5224\u6C7A\u7B46\u6578\u4E00\u81F4\uFF1B\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u8207\u7D22\u5F15\u72C0\u614B\u540C\u6B65\u3002",B=Rt(_.status||"idle").label,le=_.finished_at||_.started_at;return`<section class="status-hero data-version-hero">
      <div class="status-hero-main">
        <div class="overall-row">
          <span class="overall-badge ${h}">
            <span class="status-dot ${u?"is-warn":"is-ok"}" aria-hidden="true"></span>
            ${r(E)}
          </span>
          <span class="badge badge-neutral badge-mono">${d(s.version_count)} \u500B\u8CC7\u6599\u7248\u672C</span>
          <span class="badge badge-neutral">${r(L)} \u6700\u65B0\u7248\u672C ${r(S)}</span>
        </div>
        <h2 class="status-headline">${r(X)}</h2>
        <p class="status-copy">${r(W)}</p>
        <div class="status-meta">
          <span>${g("clock",11)} \u6AA2\u67E5\u6642\u9593 ${$e(e.checked_at)}</span>
          <span>${g("database",11)} \u73FE\u884C\u8CC7\u6599 ${d(s.total_current)} \u7B46</span>
          <span>${g("layers",11)} \u539F\u59CB Parquet ${d(s.parquet_files)} \u500B \xB7 ${qe(s.parquet_bytes)}</span>
          <span title="Qdrant alias \u8207\u76EE\u524D\u7248\u672C collection">${g("link",11)} <span class="mono">${r(me)} \u2192 ${r(Z)}</span></span>
        </div>
      </div>
      <div class="data-version-ring ${h}" style="--coverage:${$===null?0:$.toFixed(1)}%">
        <div class="data-version-ring-inner">
          <strong>${b}</strong>
          <span>\u5224\u6C7A\u7D22\u5F15\u8986\u84CB</span>
          <small>${d(i)} / ${d(o)}</small>
        </div>
      </div>
    </section>

    <div class="status-summary data-version-metrics">
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u6CD5\u898F</div>
        <div class="metric-value">${d(s.law_count)}</div>
        <div class="metric-foot">source_type = law</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u547D\u4EE4</div>
        <div class="metric-value">${d(s.order_count)}</div>
        <div class="metric-foot">source_type = order</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u689D\u6587\u7E3D\u6578</div>
        <div class="metric-value">${d(s.article_count)}</div>
        <div class="metric-foot">\u73FE\u884C\u7248\u672C\u5408\u8A08</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u8CC7\u6599\u7248\u672C</div>
        <div class="metric-value">${d(s.version_count)}</div>
        <div class="metric-foot">${d(s.parquet_files)} \u500B\u539F\u59CB Parquet \xB7 ${qe(s.parquet_bytes)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u5224\u6C7A\u6587\u4EF6</div>
        <div class="metric-value">${d(s.judgment_count)}</div>
        <div class="metric-foot">PostgreSQL current</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Qdrant \u5224\u6C7A\u5411\u91CF\u7D22\u5F15</div>
        <div class="metric-value">${d(s.judgment_indexed_count)}</div>
        <div class="metric-foot">${b} \xB7 \u5269\u9918 ${d(m)} \u7B46</div>
      </div>
    </div>

    <div class="status-columns data-version-grid">
      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${g("database",14)}PostgreSQL \u8CC7\u6599\u7248\u672C</span>
          ${Ge(w.is_current?"operational":"degraded",w.is_current?"CURRENT":"HISTORY")}
        </div>
        ${w.id?`<div class="index-current-row">
                <span class="badge badge-info">${g("activity",11)}${r(L)} ${r(S)}</span>
                <strong class="mono">${$e(w.downloaded_at)}</strong>
                <span class="index-current-copy" title="${r(w.parquet_path||"")}">${r(w.parquet_path||"\u2014")}</span>
              </div>
              <div class="data-version-facts">
                ${Be("\u8CC7\u6599\u7248\u672C\u7E3D\u6578",d(s.version_count),{mono:!0})}
                ${Be("\u4E0B\u8F09\u57F7\u884C\u7E3D\u6578",d(s.run_count),{mono:!0})}
                ${Be("\u7248\u672C ID",`#${d(w.id)}`,{mono:!0})}
                ${Be("\u8CC7\u6599\u985E\u578B",L)}
                ${Be("\u4F86\u6E90\u66F4\u65B0\u65E5",w.update_date||"\u2014")}
                ${Be(`${L}\uFF0F\u689D\u6587`,`${d(w.law_count)} / ${d(w.article_count)}`)}
                ${Be("\u4E0B\u8F09\u6642\u9593",$e(w.downloaded_at),{mono:!0})}
                ${Be("\u8CC7\u6599\u72C0\u614B",w.is_current?"current":"history",{mono:!0})}
                ${Be("Parquet \u6A94\u6848",w.parquet_path||"\u2014",{mono:!0,wide:!0})}
              </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${g("browser",14)}IndexedDB \u672C\u6A5F\u8CC7\u6599</span>
          <span class="badge ${a?.available?"badge-ok":"badge-neutral"} badge-mono">${r(a?.mode==="memory"?"MEMORY":a?"INDEXEDDB":"LOADING")}</span>
        </div>
        ${a?`<div class="index-current-row">
                <span class="badge badge-info">${g("database",11)}${r(a.name||"judgment-console")} v${d(a.version)}</span>
                <strong class="mono">${d(a.total)} \u7B46</strong>
                <span class="index-current-copy">${d(n.query_history)} \u5247\u63D0\u554F \xB7 ${d(n.audit_events)} \u7B46\u7A3D\u6838 \xB7 ${d(n.settings)} \u9805\u8A2D\u5B9A</span>
              </div>
              <div class="data-version-facts">
                ${Be("Schema \u7248\u672C",`v${d(a.version)}`,{mono:!0})}
                ${Be("\u5132\u5B58\u6A21\u5F0F",a.mode||"\u2014",{mono:!0})}
                ${Be("query_history",`${d(n.query_history)} / ${d(a.caps?.history)}`,{mono:!0})}
                ${Be("audit_events",`${d(n.audit_events)} / ${d(a.caps?.audit)}`,{mono:!0})}
                ${Be("settings",d(n.settings),{mono:!0})}
                ${Be("\u7E3D\u7D00\u9304\u6578",d(a.total),{mono:!0})}
                ${Be("\u5DF2\u7528\u5BB9\u91CF",qe(a.usage_bytes),{mono:!0})}
                ${Be("\u53EF\u7528\u914D\u984D",qe(a.quota_bytes),{mono:!0})}
              </div>
              <p class="data-version-note">${g("info",12)}
                IndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u7AEF\u63D0\u554F\u6B77\u53F2\u3001\u8A2D\u5B9A\u8207\u7248\u672C\u7A3D\u6838\u4E8B\u4EF6\uFF1B\u4F3A\u670D\u5668\u8CC7\u6599\u4EE5 PostgreSQL \u8207 Parquet \u70BA\u6E96\u3002
              </p>`:`<div class="report-empty-inline">${t.loading||!t.error?"\u6B63\u5728\u8B80\u53D6\u700F\u89BD\u5668 IndexedDB\u2026":r(t.error?.message||"IndexedDB \u5C1A\u7121\u8CC7\u6599\u6216\u7121\u6CD5\u8B80\u53D6\u3002")}</div>`}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${g("brain",14)}Qdrant \u5224\u6C7A\u5411\u91CF\u7D22\u5F15</span>
          ${Ge(u?"degraded":"operational",u?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${g("link",11)}Alias</span>
          <strong class="mono">${r(me)}</strong>
          <span class="mono">\u2192 ${r(Z)}</span>
          <span class="index-current-copy">v#${d(s.judgment_vector_version_id)} \xB7 ${r(s.judgment_vector_model||"\u2014")}</span>
        </div>
        ${Uo("\u7D22\u5F15\u8986\u84CB",$,`\u5DF2\u7D22\u5F15 ${d(i)} / ${d(o)} \u7B46 \xB7 \u5269\u9918 ${d(m)} \u7B46`,h)}
        <div class="data-version-facts">
          ${Be("Qdrant points",d(s.judgment_vector_points),{mono:!0})}
          ${Be("\u7D22\u5F15\u7248\u672C",`#${d(s.judgment_vector_version_id)} \xB7 ${s.judgment_vector_version_status||"legacy"}`,{mono:!0})}
          ${Be("\u524D\u4E00\u7248\u672C",s.judgment_vector_previous_version_id?`#${d(s.judgment_vector_previous_version_id)}`:"\u2014",{mono:!0})}
          ${Be("\u5F85\u88DC\uFF0F\u8B8A\u66F4\uFF0F\u5931\u6548",`${d(m)} / ${d(f)} / ${d(p)}`)}
          ${Be("\u6700\u8FD1\u7D22\u5F15",$e(s.judgment_indexed_at),{mono:!0})}
          ${Be("\u6A21\u578B",s.judgment_vector_model||"\u2014",{mono:!0})}
        </div>
        ${m>0?`<p class="data-version-note is-warn">${g("info",12)}\u5C1A\u6709 ${d(m)} \u7B46\u5224\u6C7A\u5C1A\u672A\u7D22\u5F15\uFF1B\u8ACB\u81F3\u300C\u8CC7\u6599\u8655\u7406 \u2192 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u63A5\u7E8C\u88DC\u9F4A\u3002</p>`:""}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${g("shield",14)}Qdrant \u6CD5\u898F\uFF0F\u547D\u4EE4\u5411\u91CF\u7D22\u5F15</span>
          ${Ge(J?"degraded":"operational",J?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${g("link",11)}Alias</span>
          <strong class="mono">${r(j)}</strong>
          <span class="mono">\u2192 ${r(A)}</span>
          <span class="index-current-copy">v#${d(s.legal_article_vector_version_id||s.legal_index?.version_id)}</span>
        </div>
        ${Uo("\u689D\u6587\u7D22\u5F15\u8986\u84CB",ie,`\u5DF2\u7D22\u5F15 ${d(x)} / ${d(O)} \u689D`,he)}
        <div class="data-version-facts">
          ${Be("Qdrant points",d(x),{mono:!0})}
          ${Be("\u73FE\u884C\u689D\u6587",d(O),{mono:!0})}
          ${Be("\u5411\u91CF\u7DAD\u5EA6",d(s.legal_index?.dimension),{mono:!0})}
          ${Be("\u6700\u8FD1\u7D22\u5F15",$e(s.legal_article_indexed_at||s.legal_index?.indexed_at),{mono:!0})}
          ${Be("\u7D22\u5F15\u72C0\u614B",J?"stale":"fresh",{mono:!0})}
          ${Be("Collection",A,{mono:!0})}
        </div>
      </section>

      <section class="card data-version-card is-wide-grid">
        <div class="side-card-head">
          <span class="side-card-title">${g("folder",14)}Parquet \u8207\u57F7\u884C\u72C0\u614B</span>
          <span class="badge badge-neutral badge-mono">${d(s.parquet_files)} FILES</span>
        </div>
        <div class="data-version-facts">
          ${Be("\u539F\u59CB Parquet \u6A94\u6848",d(s.parquet_files),{mono:!0})}
          ${Be("\u5408\u8A08\u5BB9\u91CF",qe(s.parquet_bytes),{mono:!0})}
          ${Be("PostgreSQL \u73FE\u884C\u8CC7\u6599",d(s.total_current),{mono:!0})}
          ${Be("\u8CC7\u6599\u7248\u672C\u7E3D\u6578",d(s.version_count),{mono:!0})}
          ${Be("\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C",_.status?B:"\u2014")}
          ${Be("\u6700\u8FD1\u57F7\u884C\u6642\u9593",le?$e(le):"\u2014",{mono:!0})}
          ${Be("\u6700\u8FD1\u57F7\u884C\u8017\u6642",_.duration_ms?de(_.duration_ms):"\u2014",{mono:!0})}
          ${Be("\u6700\u8FD1\u57F7\u884C\u7248\u672C",_.version_id?`#${d(_.version_id)}`:"\u2014",{mono:!0})}
        </div>
        <p class="data-version-note">${g("info",12)}
          \u539F\u59CB Parquet \u4FDD\u7559 raw\uFF0Fdelta \u8207 manifest\uFF1BPostgreSQL \u63D0\u4F9B current metadata \u8207\u7248\u672C\u72C0\u614B\uFF1BQdrant \u53EA\u4FDD\u5B58\u5411\u91CF\u8207 payload\u3002
        </p>
      </section>
    </div>`}function Up(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${g("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${d(t.run_count)} TOTAL</span>
    </div>
    ${Ip(e.recent_runs)}
  </section>`}function Qp(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function Yo(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function _s(e,t,s,a,n){let i=Qp(n);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${g(t,14)}${r(e)}</span>
      <strong>${r(s)}</strong>
    </div>
    ${Yo(n,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function Jp(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${g("layers",14)}Docker</span>
        ${Ge("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${r(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,m=o.service?0:1;return l-m||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${r(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${r(i.service)}</span>`:""}</td>
        <td>${Ge(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
        <td class="cell-number">${i.cpu_percent===null||i.cpu_percent===void 0?"\u2014":`${d(i.cpu_percent)}%`}</td>
        <td class="cell-number">${qe(i.memory_used)}${i.memory_limit?` / ${qe(i.memory_limit)}`:""}</td>
        <td class="mono">${r(i.net_io||"\u2014")}</td>
        <td class="mono">${r(i.block_io||"\u2014")}</td>
        <td class="cell-number">${d(i.pids)}</td>
      </tr>`).join(""),n=(t.system||[]).map(i=>`<span class="resource-docker-pill">
        <strong>${r(i.type||"\u2014")}</strong>
        <span>${d(i.count)} \xB7 ${r(i.size||"\u2014")}</span>
      </span>`).join("");return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${g("layers",14)}Docker \u5BB9\u5668\u4F7F\u7528\u8CC7\u6E90</span>
      <span class="badge badge-ok badge-mono">${d(s.length)} \u500B\u5BB9\u5668</span>
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
  </section>`}function Vp(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",n=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${ss("\u8CC7\u6599\u5EAB",`<code>${r(s.database||"\u2014")}</code>`)}
           ${ss("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${qe(s.storage_bytes)}</strong>`)}
           ${ss("Docker volume",`<strong>${qe(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${ss("\u9023\u7DDA\u6578",`<strong>${d(s.connections)}</strong>`)}`:`${ss("Collection",`<code>${r(s.collection||"\u2014")}</code>`)}
           ${ss("Docker volume",`<strong>${qe(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${ss("\u5411\u91CF\u9EDE\u6578",`<strong>${d(s.points_count)}</strong>`)}
           ${ss("Collections",`<strong>${d(s.collections)}</strong>`)}
           ${ss("Segments",`<strong>${d(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${r(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${r(s.kind||"")}</div>
          </div>
          ${Ge(i)}
        </div>
        <div class="resource-db-metrics">
          <div><span>CPU</span><strong>${s.cpu_percent===null||s.cpu_percent===void 0?"\u2014":`${d(s.cpu_percent)}%`}</strong></div>
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
      </article>`}).join("")}</div>`}function Ps(e,t,s,a){let n=Number(t)||0,i=a?n/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${r(e)}</span>
      <strong>${qe(n)}</strong>
    </div>
    ${Yo(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function Wp(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},n=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},m=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${g("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${qe(m)}</span>
    </div>
    <div class="storage-list">
      ${Ps("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${r(s.frontend_path||"\u2014")}</span>`,m)}
      ${Ps("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${r(s.backend_path||"\u2014")}</span>`,m)}
      ${Ps("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",n.layers_bytes,`Images ${qe(n.images_bytes)} \xB7 Containers ${qe(n.containers_bytes)} \xB7 Build cache ${qe(n.build_cache_bytes)}`,m)}
      ${Ps("PostgreSQL volume",o.size_bytes,`<span class="mono">${r(o.name||"\u2014")}</span>`,m)}
      ${Ps("Qdrant volume",l.size_bytes,`<span class="mono">${r(l.name||"\u2014")}</span>`,m)}
      ${Ps("Parquet",a.total_bytes,`\u6CD5\u898F ${qe(a.law_bytes)} \xB7 \u5224\u6C7A ${qe(a.judgment_bytes)}`,m)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${qe(m)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function Kp(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},n=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),m=Array.isArray(e.disk)?e.disk:[],f=m[0]||{},p=Number(o.total_bytes||f.total||0),$=p?l/p*100:0,b=[s.load_1,s.load_5,s.load_15].map(w=>w??"\u2014").join(" / "),u=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":de(Number(t.uptime_seconds)*1e3),h=[f.label?_s("HDD \u5DF2\u4F7F\u7528","database",`${d(f.percent)}%`,`${qe(f.used)} / ${qe(f.total)} \xB7 \u5269\u9918 ${qe(f.free)}<br><span class="mono">${r(f.path||"")}</span>`,f.percent):"",l?_s("Judgment \u5143\u4EF6\u5408\u8A08","layers",qe(l),`\u7D04\u5360 HDD ${d($)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,$):"",...m.slice(1).map(w=>_s(`\u786C\u789F \xB7 ${w.label}`,"layers",`${d(w.percent)}%`,`${qe(w.used)} / ${qe(w.total)} \xB7 \u5269\u9918 ${qe(w.free)}<br><span class="mono">${r(w.path||"")}</span>`,w.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${$e(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${_s("CPU \u4F7F\u7528\u7387","cpu",`${d(s.percent)}%`,`${d(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${d(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${r(b)}`,s.percent)}
      ${_s("\u8A18\u61B6\u9AD4","server",`${d(a.percent)}%`,`${qe(a.used)} / ${qe(a.total)} \xB7 \u53EF\u7528 ${qe(a.available)}`,a.percent)}
      ${_s("Swap","layers",`${d(n.percent)}%`,`${qe(n.used)} / ${qe(n.total)}`,n.percent)}
      ${_s("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${d(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${r(u)}<br>${r(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${h||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${Wp(e)}
    ${Jp(e)}
    ${Vp(e)}`}function Qo(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function Yp(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SYSTEM RESOURCE USAGE</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Ee({tone:"danger",title:"\u8CC7\u6E90 API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-resources-retry">
          ${g("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Xp(e){return e.status==="operational"?{label:"\u5DF2\u9023\u7DDA",badge:"badge-ok"}:{label:"\u7121\u6CD5\u9023\u7DDA",badge:"badge-danger"}}function Zp(e,t){let s=Xp(e),a=Array.isArray(e.models)?e.models:[],n=a.length?a.map(i=>{let o=String(i.name||""),l=e.chat_model===o,m=e.embedding_model===o,f=i.size?qe(i.size):"",p=i.modified_at?$e(i.modified_at):"",$=new Set((i.capabilities||[]).map(u=>String(u||"").toLowerCase())),b=[];return i.supports_chat===!0&&b.push(["Chat","badge-ok"]),$.has("embedding")&&b.push(["Embedding","badge-info"]),$.has("vision")&&b.push(["Vision","badge-neutral"]),$.has("tools")&&b.push(["Tools","badge-neutral"]),$.has("thinking")&&b.push(["Thinking","badge-neutral"]),$.has("speech")&&b.push(["Speech","badge-warn"]),i.is_reranker&&b.push(["Reranker","badge-neutral"]),b.length||b.push([i.capability_status==="untested"?"\u672A\u6E2C\u8A66":"\u7121 chat \u80FD\u529B","badge-neutral"]),`<div class="ollama-model-row">
            <div class="ollama-model-main">
              <strong>${r(o)}</strong>
              <span class="ollama-model-meta">${[f,p].filter(Boolean).map(u=>r(u)).join(" \xB7 ")||"\u2014"}</span>
              <div class="ollama-model-capabilities">${b.map(([u,h])=>`<span class="badge ${h}">${r(u)}</span>`).join("")}</div>
            </div>
            <div class="ollama-model-roles">
              ${l?'<span class="badge badge-ok">\u804A\u5929</span>':""}
              ${m?'<span class="badge badge-ok">\u5D4C\u5165</span>':""}
            </div>
            <div class="ollama-model-actions">
              <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="${l?"clear-model":"select-model"}" data-id="${e.id}" data-model="${r(o)}" data-role="chat">
                ${l?"\u65B7\u958B\u804A\u5929":"\u9023\u63A5\u804A\u5929"}
              </button>
              <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="${m?"clear-model":"select-model"}" data-id="${e.id}" data-model="${r(o)}" data-role="embedding">
                ${m?"\u65B7\u958B\u5D4C\u5165":"\u9023\u63A5\u5D4C\u5165"}
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
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="edit-host" data-id="${e.id}">${g("edit",13)}<span>\u7DE8\u8F2F</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="delete-host" data-id="${e.id}">${g("trash",13)}<span>\u522A\u9664</span></button>
      </div>
    </div>
    <div class="ollama-model-list">${n}</div>
  </article>`}function em(e,t,s,a){if(s)return`<div class="report-card">
      ${Ee({tone:"danger",title:"Model Provider \u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${g("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=e||{hosts:[],active_host_id:null},i=Array.isArray(n.hosts)?n.hosts:[],o=a?i.find(f=>Number(f.id)===Number(a)):null,l=o?o.base_url.replace(new RegExp(`:${o.port}$`),""):"http://127.0.0.1",m=o?"\u5132\u5B58\u8B8A\u66F4":"\u65B0\u589E\u4E3B\u6A5F";return`<div class="report-card ollama-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">MODEL PROVIDER</div>
        <div class="report-title">llama-server \u4E3B\u6A5F\u8207\u6A21\u578B</div>
        <div class="report-sub">\u7BA1\u7406\u53EF\u7528\u7684 llama-server \u9023\u7DDA\u3001\u76EE\u524D\u4F7F\u7528\u7684\u4E3B\u6A5F\uFF0C\u4EE5\u53CA\u4E3B\u6A5F\u4E0A\u7684\u804A\u5929\uFF0F\u5D4C\u5165\u6A21\u578B\u3002\u6BCF\u6B21\u958B\u555F\u6B64\u9801\u90FD\u6703\u91CD\u65B0\u53D6\u5F97\u4E3B\u6A5F\u8207\u6A21\u578B\u5217\u8868\uFF1Bembedding \u4E3B\u6A5F\u7684\u512A\u5148\u9806\u5E8F\u53EF\u5230\u300C\u8CC7\u6599\u8655\u7406\u300D\u7684\u57F7\u884C\u8CC7\u8A0A\u5361\u7247\u62D6\u79FB\u8ABF\u6574\u3002</div>
      </div>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="check-capabilities">${g("shield",14)}<span>\u6AA2\u67E5\u6A21\u578B\u80FD\u529B</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${g("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span></button>
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
          <button class="btn btn-primary btn-sm" type="submit">${g("check",13)}<span>${m}</span></button>
          ${o?'<button class="btn btn-ghost btn-sm" type="button" data-ollama-action="cancel-host-edit">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
        </div>
      </form>
      ${t?'<div class="ollama-loading"><span class="spinner"></span><span>\u8B80\u53D6 llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span></div>':i.length?`<div class="ollama-host-list">${i.map(f=>Zp(f,a)).join("")}</div>`:ot({iconName:"server",title:"\u5C1A\u672A\u8A2D\u5B9A llama-server \u4E3B\u6A5F",text:"\u8ACB\u5728\u4E0A\u65B9\u8F38\u5165\u7DB2\u5740\u8207 Port \u65B0\u589E\uFF0C\u6216\u4F7F\u7528 .env \u7684\u9810\u8A2D\u9023\u7DDA\u3002"})}
      <p class="report-sub" style="margin-top:12px">\u8A2D\u70BA\u804A\u5929\u6216\u5D4C\u5165\u6A21\u578B\u5F8C\uFF0C\u7CFB\u7D71\u6703\u4F7F\u7528\u76EE\u524D\u4E3B\u6A5F\u7684\u5C0D\u61C9\u6A21\u578B\u57F7\u884C AI \u51FA\u984C\u8207 RAG\uFF1B\u672A\u8A2D\u5B9A\u6642\u6CBF\u7528 .env \u7684 LLM_MODEL\uFF0FEMBEDDING_MODEL\u3002</p>
    </div>
  </div>`}function tm(e,t,s){let a=e?.data||{},n=e?Rt(e.status):null,i=s?Rt(s.status):null,o={overview:n?`<span class="badge ${n.tone==="ok"?"badge-ok":n.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(n.label)}</span>`:"",resources:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(i.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${d(a.version_count)}</span>`,tests:'<span class="badge badge-neutral badge-mono">TEST</span>',"local-model":'<span class="badge badge-neutral badge-mono">LLAMA-SERVER</span>',runs:`<span class="badge badge-neutral badge-mono">${d(a.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${Wo.map(l=>{let m=l.id===t;return`<button class="status-tab${m?" is-active":""}" type="button"
          data-status-tab="${l.id}" ${m?'aria-current="page"':""}>
          <span class="status-tab-icon">${g(l.icon,15)}</span>
          <span class="status-tab-copy">
            <strong>${r(l.label)}</strong>
            <small>${r(l.hint)}</small>
          </span>
          ${o[l.id]||""}
        </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u6AA2\u67E5\u6642\u9593</span>
      <span class="mono">${r(e?$e(e.checked_at):"\u2014")}</span>
    </div>`}function sm(e,t,s,a,n,i,o){if(e==="resources")return s?Kp(s):a?Qo():n?Yp(n):Qo();if(e==="local-model"){let l=i||{},m=!!l.loading||!l.hosts&&!l.error;return em(l.hosts||null,m,l.error||null,l.editingId||null)}return e==="architecture"?Hp(t):e==="api"?zp(t):e==="data"?Gp(t,o):e==="runs"?Up(t):Op(t)}function am(){return`<div class="status-hero">
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
    </div>`}function Jo(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u5FEB\u53D6\u6216\u63A8\u6E2C\u7684\u670D\u52D9\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Ee({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${g("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function nm(e,t){let s=!1,a=null,n=null,i="overview",o=null,l=!1,m=null,f=null,p=!1,$=null,b=null,u=null,h=!1,w=null,_=!1,L=!1,S=null,x=0,O="",ie="",J=performance.now(),he=new Date().toISOString(),me=!1;e.innerHTML=`<section class="page status-page">
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
          ${g("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
      <section class="status-panel" id="status-content">${am()}</section>
    </div>
  </section>`;let Z=e.querySelector("#status-nav"),j=e.querySelector("#status-content"),A=e.querySelector("#refresh-status"),E=e.querySelector("#auto-refresh"),X=()=>{if(x+=1,typeof S=="function")try{S()}catch{}S=null,_=!1,L=!1},W=async()=>{let ae=++x;L=!0,ie="",j.innerHTML="";try{let ne=await wr(j,{setTitle:()=>{}},{embedded:!0});if(ae!==x||i!=="tests"){typeof ne=="function"&&ne();return}S=typeof ne=="function"?ne:null,_=!0}catch(ne){ae===x&&i==="tests"&&(j.innerHTML=Jo(ne))}finally{ae===x&&(L=!1)}},B=()=>{if(!n)return;let ae=tm(n,i,o);if(ae!==O&&(Z.innerHTML=ae,O=ae),i==="tests"){!_&&!L&&W();return}X();let ne=sm(i,n,o,l,m,{hosts:f,loading:p,error:$,editingId:b},{info:u,loading:h,error:w});ne!==ie&&(j.innerHTML=ne,ie=ne)},le=async({quiet:ae=!1}={})=>{if(!l){l=!0,m=null,i==="resources"&&!o&&B();try{let ne=await V.systemUsage();if(s)return;o=ne}catch(ne){if(s)return;m=ne,ae||D(ne.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{s||(l=!1,i==="resources"&&B())}}},ge=async({quiet:ae=!1}={})=>{if(!h){h=!0,w=null,i==="data"&&!u&&B();try{let ne=await fi();if(s)return;u=ne}catch(ne){if(s)return;w=ne,ae||D(ne.message||"\u7121\u6CD5\u8B80\u53D6 IndexedDB\u3002","danger")}finally{s||(h=!1,i==="data"&&B())}}},F=async({quiet:ae=!1}={})=>{if(!p){p=!0,$=null,i==="local-model"&&!f&&B();try{let ne=await V.ollamaHosts();if(s)return;f=ne}catch(ne){if(s)return;$=ne,ae||D(ne.message||"\u7121\u6CD5\u53D6\u5F97 llama-server \u4E3B\u6A5F\u3002","danger")}finally{s||(p=!1,i==="local-model"&&B())}}},fe=async()=>{await F({quiet:!0}),await ee({quiet:!0})},ee=async({quiet:ae=!1,status:ne=null}={})=>{ae||(A.disabled=!0,Me(A,!0,"\u6AA2\u67E5\u4E2D\u2026"));let pe=performance.now(),be=new Date().toISOString(),_e=pe,ke=be;try{let Ne=ne||await V.status();if(_e=performance.now(),ke=new Date().toISOString(),s)return;let Oe=!ne&&!me?Math.max(0,pe-J):0;Ne.page_pipeline=Ne.pipeline||!n?.page_pipeline?Bp(Ne,{initMs:Oe,initStartedAt:he,requestStartedAt:be,requestFinishedAt:ke,requestMs:_e-pe}):n.page_pipeline,me=!0,n=Ne,B(),ae||D("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(Ne){if(s)return;i!=="tests"&&(ie="",j.innerHTML=Jo(Ne)),ae||D(Ne.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(A.disabled=!1,Me(A,!1))}},xe=async({quiet:ae=!1,status:ne=null}={})=>{if(await ee({quiet:ae,status:ne}),i==="resources"&&await le({quiet:ae}),i==="local-model"&&await F({quiet:ae}),!ae&&i==="tests"){let pe=j.querySelector("#tests-refresh");pe&&pe.click()}};Z.addEventListener("click",ae=>{let ne=ae.target.closest("[data-status-tab]");if(!ne)return;let pe=ne.dataset.statusTab;Wo.some(be=>be.id===pe)&&(i=pe,B(),i==="resources"&&!o&&!l&&le(),i==="data"&&!u&&!h&&ge(),i==="local-model"&&F())}),j.addEventListener("click",ae=>{ae.target.closest("#status-retry")&&ee(),ae.target.closest("#status-resources-retry")&&le()}),j.addEventListener("click",async ae=>{let ne=ae.target.closest("[data-ollama-action]");if(!ne)return;let pe=ne.dataset.ollamaAction,be=Number(ne.dataset.id||0);if(pe==="refresh-hosts"){await F();return}if(pe==="edit-host"){b=be,B(),e.querySelector(".ollama-host-form")?.scrollIntoView({behavior:"smooth",block:"center"});return}if(pe==="cancel-host-edit"){b=null,B();return}if(pe==="delete-host"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 llama-server \u4E3B\u6A5F #${be}\uFF1F`))return;try{await V.deleteOllamaHost(be),Number(b)===be&&(b=null),D("llama-server \u4E3B\u6A5F\u5DF2\u522A\u9664\u3002","info"),await fe()}catch(_e){D(_e.message||"\u522A\u9664\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(pe==="activate-host"){try{await V.activateOllamaHost(be),D("\u5DF2\u5207\u63DB\u4F7F\u7528\u7684 llama-server \u4E3B\u6A5F\u3002","ok"),await fe()}catch(_e){D(_e.message||"\u5207\u63DB\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(pe==="deactivate-host"){try{await V.deactivateOllamaHosts(),D("\u5DF2\u505C\u7528\u6307\u5B9A\u7684 llama-server \u4E3B\u6A5F\uFF0C\u5C07\u6CBF\u7528 .env \u8A2D\u5B9A\u3002","info"),await fe()}catch(_e){D(_e.message||"\u505C\u7528\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(pe==="check-capabilities"){Me(ne,!0,"\u6AA2\u67E5\u4E2D\u2026");try{await V.checkOllamaCapabilities(),D("\u5DF2\u66F4\u65B0\u6240\u6709\u4E3B\u6A5F\u7684\u6A21\u578B\u80FD\u529B\u3002","ok",4e3),await fe()}catch(_e){D(_e.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u80FD\u529B\u3002","danger",7e3)}finally{Me(ne,!1)}return}if(pe==="select-model"||pe==="clear-model"){let _e=String(ne.dataset.model||""),ke=String(ne.dataset.role||"");try{pe==="select-model"?(await V.selectOllamaModel(be,{model:_e,role:ke}),D(`\u5DF2\u8A2D\u5B9A ${ke==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\uFF1A${_e}`,"ok")):(await V.clearOllamaModel(be,{model:_e,role:ke}),D(`\u5DF2\u53D6\u6D88 ${ke==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\u3002`,"info")),await fe()}catch(Ne){D(Ne.message||"\u6A21\u578B\u8A2D\u5B9A\u5931\u6557\u3002","danger")}}}),j.addEventListener("submit",async ae=>{let ne=ae.target.closest("form[data-ollama-form='host']");if(!ne)return;ae.preventDefault();let pe=new FormData(ne),be=Number(pe.get("host_id")||0),_e={name:String(pe.get("name")||"").trim(),url:String(pe.get("url")||"").trim(),port:Number(pe.get("port")||11434)};try{be?(await V.updateOllamaHost(be,_e),D("llama-server \u4E3B\u6A5F\u5DF2\u66F4\u65B0\u3002","ok")):(await V.addOllamaHost(_e),D("llama-server \u4E3B\u6A5F\u5DF2\u65B0\u589E\u3002","ok")),b=null,await fe()}catch(ke){let Ne=ke.detail||ke.payload?.detail,Oe=Ne?.errors?.join(" \xB7 ")||Ne?.message||ke.message||"\u5132\u5B58\u4E3B\u6A5F\u5931\u6557\u3002";D(Oe,"danger",8e3)}}),j.addEventListener("toggle",ae=>{let ne=ae.target.closest?.(".status-wf-stage[data-status-wf-stage]");if(!ne||!j.contains(ne))return;let pe=ne.dataset.statusWfStage||"";pe&&(ne.open?_r.add(pe):_r.delete(pe))},!0),A.addEventListener("click",()=>xe());let ve=()=>{a&&(a(),a=null)};return E.addEventListener("change",()=>{ve(),E.checked&&(a=mt("status",(ae,ne)=>{s||xe({quiet:!0,status:ne?.snapshot||null})}),xe({quiet:!0}),D("\u5DF2\u555F\u7528\u5F8C\u7AEF\u63A8\u9001\u81EA\u52D5\u66F4\u65B0\uFF08\u6BCF 30 \u79D2\uFF09\u3002","info",2200))}),await ee({quiet:!0}),ge({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,X(),ve()}}var Xo="home",en={home:{page:Pn,title:"Judgment RAG Console \xB7 \u6CD5\u898F\u8207\u5224\u6C7A\u6AA2\u7D22"},rag:{page:sr,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:Jn,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:yr,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:Zn,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:fr,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:kr,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:Ka,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"}},Sr=document.getElementById("app-main"),Xa=null,Za=0;function Ar(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||Xo;return Object.prototype.hasOwnProperty.call(en,t)?t:Xo}function rm(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function im(e){return`<section class="page">
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
          <span class="notice-icon" aria-hidden="true">${g("alert",12)}</span>
          <div class="notice-body">
            <strong>\u7121\u6CD5\u5EFA\u7ACB\u9801\u9762</strong>
            <p>${r(e.message||"\u672A\u77E5\u932F\u8AA4")}</p>
          </div>
        </div>
        <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
          <button class="btn btn-secondary btn-sm" type="button" id="route-retry">
            ${g("refresh",14)}<span>\u91CD\u65B0\u8F09\u5165</span>
          </button>
        </div>
      </div>
    </div>
  </section>`}async function xr(){let e=Ar(),t=++Za;if(rm(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof Xa=="function"){try{Xa()}catch{}Xa=null}document.title=en[e].title;let s={route:e,navigate(a){en[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===Za&&a&&(document.title=a)}};try{let a=en[e].page.render(Sr,s);ni(),window.scrollTo({top:0,behavior:"auto"}),Sr.focus({preventScroll:!0});let n=await a;if(t!==Za){typeof n=="function"&&n();return}Xa=typeof n=="function"?n:null}catch(a){if(t!==Za)return;console.error("Failed to render route",e,a),Sr.innerHTML=im(a);let n=document.getElementById("route-retry");n&&n.addEventListener("click",()=>xr()),D("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function om(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable))return;let a=Ar(),n=a==="home"?"home-question":a==="rag"?"rag-question":"";if(!n)return;let i=document.getElementById(n);i&&(e.preventDefault(),i.focus())})}function lm(){let e=document.querySelector('[data-route="processing"]');if(!e)return;let t=e.querySelector(".nav-update-badge");t||(t=document.createElement("span"),t.className="nav-update-badge",t.hidden=!0,e.appendChild(t));let s=0,a=0,n=0,i=()=>{let l=[];if(s>0&&l.push(`\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0F\u5224\u6C7A\u6709 ${s} \u9805\u4F86\u6E90\u66F4\u65B0`),a>0&&l.push(`\u5224\u6C7A\u532F\u5165\u5F85\u8655\u7406 ${a} \u500B\u6708`),n>0&&l.push(`Qdrant \u5411\u91CF\u7D22\u5F15\u5F85\u88DC ${n} \u500B\u6708`),!l.length){t.hidden=!0;return}let m=(s>0?1:0)+(a>0?1:0)+(n>0?1:0);t.textContent=String(m===1?s||a||n:m),t.title=l.join("\uFF1B"),t.hidden=!1},o=async(l=null)=>{try{let m=l||await V.updatesStatus();s=Number(m.update_count)||0,m&&Object.prototype.hasOwnProperty.call(m,"import_pending_count")&&(a=Number(m.import_pending_count)||0),m&&Object.prototype.hasOwnProperty.call(m,"index_pending_count")&&(n=Number(m.index_pending_count)||0),i()}catch{t.hidden=!0}};o(),mt("updates",(l,m)=>o(m?.snapshot||null)),window.addEventListener("judgment:processing-pending",l=>{a=Number(l.detail?.count)||0,l.detail&&Object.prototype.hasOwnProperty.call(l.detail,"index_pending")&&(n=Number(l.detail.index_pending)||0),i()}),window.addEventListener("judgment:updates-changed",()=>o())}function Zo(){Gr(),ii(),om(),lm(),window.addEventListener("hashchange",xr),xr(),ma()&&window.setTimeout(()=>{Ar()==="rag"&&(window.location.hash="#/tests")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Zo):Zo();})();
