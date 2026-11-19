(()=>{var il=Object.defineProperty;var ls=(e,t)=>{for(var s in t)il(e,s,{get:t[s],enumerable:!0})};var dn="judgment.api_base",un="judgment.admin_token",mn="http://127.0.0.1:9200",ft=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function Br(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function Zt(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${Br(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function gn(e){let t=Zt(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function fn(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?Zt(e.get("api")):null}catch{return null}}function bn(){try{let e=window.localStorage.getItem(dn);return e===null?null:Zt(e)}catch{return null}}function hn(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return Zt(e||"")}function zt(){let e=fn();if(e!==null)return e;let t=bn();if(t!==null)return t;let s=hn();return s||(window.location.protocol==="file:"?mn:"")}function ol(){if(fn()!==null)return!0;let e=bn();return e!==null?!!e:!!hn()}function Et(){return fn()!==null?"query":bn()!==null?"storage":hn()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function ha(){return ol()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!Br(window.location.hostname)}function vn(e){let t=Zt(e);try{t?window.localStorage.setItem(dn,t):window.localStorage.removeItem(dn)}catch{}return t}function va(){try{return String(window.localStorage.getItem(un)||"").trim()}catch{return""}}function Fr(e){let t=String(e||"").trim();try{t?window.localStorage.setItem(un,t):window.localStorage.removeItem(un)}catch{}return t}function pn(){return Et()==="query"?"":va()}function cs(e=zt()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function lt(e,t=zt()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function Dr(){return Et()==="query"?"":zt()}async function ll(){let e=pn(),t={Accept:"application/json"};e&&(t["X-Judgment-Admin-Token"]=e);try{let s=await fetch(lt("/api/auth/sse-ticket"),{method:"POST",headers:t,credentials:"include"});if(!s.ok)return"";let a=await s.json();return String(a.ticket||"")}catch{return""}}function bt(e,t,{onError:s=null,onProgress:a=null}={}){let n=(Array.isArray(e)?e:[e]).map(b=>String(b||"").trim()).filter(Boolean);if(!n.length||typeof EventSource>"u")return()=>{};let i=null,o=0,l=!1,m=null,f=b=>{let d={};try{d=JSON.parse(b.data||"{}")}catch{d={}}d.initial&&o<=1&&!d.snapshot||t?.(d.topic||n[0],d)},u=b=>{let d={};try{d=JSON.parse(b.data||"{}")}catch{d={}}a?.(d.topic||n[0],d)},$=async()=>{if(l)return;let b=await ll();if(l)return;let d=new URLSearchParams({topic:n.join(",")});b&&d.set("ticket",b),i=new EventSource(lt(`/api/events/stream?${d.toString()}`),{withCredentials:!0}),i.onopen=()=>{o+=1,m&&(window.clearTimeout(m),m=null)},i.addEventListener("refresh",f),i.addEventListener("progress",u),i.onerror=()=>{s?.(),!(l||!i)&&(i.close(),i=null,!m&&(m=window.setTimeout(()=>{m=null,$()},3e3)))}};return $(),()=>{l=!0,m&&(window.clearTimeout(m),m=null),i&&(i.removeEventListener("refresh",f),i.removeEventListener("progress",u),i.close(),i=null)}}function $n(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function ce(e,t={}){let{base:s,...a}=t,n=s!==void 0?Zt(s):zt(),i=new AbortController,o=t.timeout===void 0?3e4:t.timeout,l=o>0?window.setTimeout(()=>i.abort(),o):null,m=Date.now(),f=performance.now(),u=t.requestId||Or(),$={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":u,"X-Judgment-Client-Started-At":String(m),...pn()?{"X-Judgment-Admin-Token":pn()}:{},...t.headers||{}},b;try{b=await fetch(lt(e,n),{...a,headers:$,credentials:"include",signal:i.signal})}catch(L){throw L.name==="AbortError"?new ft("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new ft($n(n),0,L)}finally{l&&window.clearTimeout(l)}let d=null;if((b.headers.get("content-type")||"").includes("application/json"))try{d=await b.json()}catch{d=null}else try{d=await b.text()}catch{d=null}let y=performance.now(),_=b.headers.get("X-Judgment-Request-Id")||u;if(t.trackClient!==!1&&_){let L=Math.round(performance.now()-f);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{Hr({request_id:_,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:L,render_ms:Math.max(0,Math.round(performance.now()-y)),status:b.ok?"success":"failed"})})})}if(!b.ok){let L=d&&typeof d=="object"?d.detail||d.message:d,S=typeof L=="string"&&L?L:`\u4F3A\u670D\u5668\u56DE\u61C9 ${b.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new ft(S,b.status,L)}return d}function Or(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function Hr(e){try{fetch(lt("/api/performance/client",zt()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),credentials:"include",keepalive:!0}).catch(()=>{})}catch{}}async function zr(e){let t=Zt(e);if(!gn(t))throw new ft("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,n=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(lt("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new ft(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof ft?i:i.name==="AbortError"?new ft("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new ft($n(t),0,i)}finally{window.clearTimeout(n)}}var K={health(){return ce("/api/health")},authMe(){return ce("/api/auth/me",{base:Dr(),trackClient:!1})},authLogout(){return ce("/api/auth/logout",{method:"POST",base:Dr(),trackClient:!1})},status(){return ce("/api/status",{trackClient:!1})},ollamaHosts(){return ce("/api/llama-server/hosts",{timeout:3e4,trackClient:!1})},addOllamaHost(e){return ce("/api/llama-server/hosts",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},updateOllamaHost(e,t){return ce(`/api/llama-server/hosts/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},deleteOllamaHost(e){return ce(`/api/llama-server/hosts/${encodeURIComponent(e)}`,{method:"DELETE",timeout:3e4,trackClient:!1})},activateOllamaHost(e){return ce(`/api/llama-server/hosts/${encodeURIComponent(e)}/activate`,{method:"POST",timeout:3e4,trackClient:!1})},deactivateOllamaHosts(){return ce("/api/llama-server/hosts/deactivate",{method:"POST",timeout:3e4,trackClient:!1})},reorderOllamaHosts(e){return ce("/api/llama-server/hosts/reorder",{method:"POST",body:JSON.stringify({host_ids:e}),timeout:3e4,trackClient:!1})},checkOllamaCapabilities(){return ce("/api/llama-server/hosts/capabilities/test",{method:"POST",timeout:18e4,trackClient:!1})},selectOllamaModel(e,t){return ce(`/api/llama-server/hosts/${encodeURIComponent(e)}/models/select`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},clearOllamaModel(e,t){return ce(`/api/llama-server/hosts/${encodeURIComponent(e)}/models/clear`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},systemUsage(){return ce("/api/system-usage",{trackClient:!1})},indexVersions(){return ce("/api/index-versions",{trackClient:!1})},indexVersion(e){return ce(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return ce(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return ce(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return ce("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){let t=new URLSearchParams({repair:e?"true":"false"});return ce(`/api/index-alias/reconcile?${t.toString()}`,{trackClient:!1})},catalog(){return ce("/api/catalog")},homeSummary(){return ce("/api/home")},judgmentStats(){return ce("/api/judgment-stats")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return ce("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},dataSuggest({kind:e,query:t="",limit:s=12}){let a=new URLSearchParams({kind:e,query:t,limit:String(s)});return ce(`/api/data/suggest?${a.toString()}`,{timeout:45e3,trackClient:!1})},schemaSuggest({database:e,table:t,column:s,query:a,limit:n=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(n)});return ce(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let n=new URLSearchParams({law_key:e});return t&&n.set("source_type",t),s&&n.set("version_id",String(s)),a&&n.set("article_no",String(a)),ce(`/api/law?${n.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),ce(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return ce("/api/test-mode",{trackClient:!1})},llmModels(){return ce("/api/llm/models",{timeout:6e4,trackClient:!1})},testLlmModels(){return ce("/api/llm/models/test",{method:"POST",timeout:12e4,trackClient:!1})},rerankStatus(){return ce("/api/rerank/status",{timeout:6e4,trackClient:!1})},testReranker(){return ce("/api/rerank/test",{method:"POST",timeout:12e4,trackClient:!1})},selectLlmModel(e,t=null){return ce("/api/llm/model",{method:"POST",body:JSON.stringify({model:e,host_id:t}),timeout:3e4,trackClient:!1})},setTestMode(e){return ce("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return ce(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return ce("/api/test-runs/current",{trackClient:!1})},testRun(e){return ce(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return ce("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))i==null||i===""||a.set(n,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),ce(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return ce("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return ce("/api/processing",{timeout:45e3,trackClient:!1})},processingActive(){return ce("/api/processing/active",{timeout:3e3,trackClient:!1})},embeddingHostsProbe(){return ce("/api/processing/embedding-hosts",{timeout:2e4,trackClient:!1})},judgmentDownloadStatus(){return ce("/api/judgment-download/status",{timeout:3e4,trackClient:!1})},versioningSummary(){return ce("/api/versioning/summary",{trackClient:!1})},updatesStatus(){return ce("/api/updates/status",{trackClient:!1})},checkCourts(){return ce("/api/courts/check",{timeout:6e4,trackClient:!1})},checkLawVersions(){return ce("/api/law-versions/check",{timeout:6e4,trackClient:!1})},checkUpdates(e=[]){let t=Array.isArray(e)&&e.length?{source_types:e}:{};return ce("/api/updates/check",{method:"POST",body:JSON.stringify(t),timeout:12e4,trackClient:!1})},versioningSnapshots(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.limit&&t.set("limit",String(e.limit)),ce(`/api/versioning/judgments/snapshots?${t.toString()}`,{trackClient:!1})},versioningChanges(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit)),ce(`/api/versioning/judgments/changes?${t.toString()}`,{trackClient:!1})},versioningJudgment(e){return ce(`/api/versioning/judgments/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVersion(e){return ce(`/api/versioning/judgments/versions/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVector(e,t){return ce(`/api/versioning/judgments/${encodeURIComponent(e)}/vectors/${encodeURIComponent(t)}`,{trackClient:!1})},versioningAudit(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit||500)),ce(`/api/versioning/audit?${t.toString()}`,{trackClient:!1})},questionBankStats(){return ce("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))if(!(i==null||i==="")){if(Array.isArray(i)){for(let o of i)o==null||o===""||a.append(n,String(o));continue}a.set(n,String(i))}return a.set("limit",String(t)),a.set("offset",String(s)),ce(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankTags(e="",t=12){let s=new URLSearchParams({query:e,limit:String(t)});return ce(`/api/question-bank/tags?${s.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return ce(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return ce("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},createQuestionBankItemWithAI(e){return ce("/api/question-bank/ai-items",{method:"POST",body:JSON.stringify(e),timeout:42e4,trackClient:!1})},updateQuestionBankItem(e,t){return ce(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return ce(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},restoreQuestionBankItem(e){return ce(`/api/question-bank/items/${encodeURIComponent(e)}/restore`,{method:"POST",timeout:45e3,trackClient:!1})},submitQuestionBankItemForReview(e){return ce(`/api/question-bank/items/${encodeURIComponent(e)}/submit`,{method:"POST",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return ce(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return ce("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return ce(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return ce("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return ce(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return ce("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},benchmarkSuiteLatestAnswers(e){return ce(`/api/benchmark/suites/${encodeURIComponent(e)}/latest-answers`,{timeout:45e3,trackClient:!1})},removeBenchmarkSuiteItem(e,t){return ce(`/api/benchmark/suites/${encodeURIComponent(e)}/items/${encodeURIComponent(t)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return ce("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return ce(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return ce(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return ce(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return ce("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return ce(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return ce(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return ce(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return ce("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return ce(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return ce("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return ce(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return ce("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return ce("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return ce("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onQueued:n=null,onToken:i=null,onTokenReset:o=null}={}){let l=zt(),m=new AbortController,f=t?0:3e5,u=f>0?window.setTimeout(()=>m.abort(),f):null,$=Date.now(),b=performance.now(),d=Or(),h={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":d,"X-Judgment-Client-Started-At":String($)},y;try{y=await fetch(lt("/api/rag/query/stream",l),{method:"POST",headers:h,body:JSON.stringify({question:e}),credentials:"include",signal:m.signal})}catch(Y){throw Y.name==="AbortError"?new ft("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new ft($n(l),0,Y)}finally{u&&window.clearTimeout(u)}if(!y.ok){let Y=null;try{Y=await y.json()}catch{Y=null}let we=Y&&typeof Y=="object"&&Y.detail?String(Y.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${y.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new ft(we,y.status,Y)}if(!y.body)throw new ft("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let _=y.body.getReader(),L=new TextDecoder,S="",A=null,I=null;try{for(;;){let{value:Y,done:we}=await _.read();if(we)break;S+=L.decode(Y,{stream:!0});let ge=S.indexOf(`

`);for(;ge>=0;){let F=S.slice(0,ge).replace(/\r/g,"");S=S.slice(ge+2);let j="message",x=[];for(let R of F.split(`
`))R.startsWith("event:")?j=R.slice(6).trim():R.startsWith("data:")&&x.push(R.slice(5).trimStart());if(x.length){let R=null;try{R=JSON.parse(x.join(`
`))}catch{R=null}if(R)if(j==="step"&&typeof s=="function")try{s(R)}catch{}else if(j==="partial"){if(typeof a=="function")try{a(R)}catch{}}else if(j==="queued"){if(typeof n=="function")try{n(R)}catch{}}else if(j==="token"){if(typeof i=="function")try{i(String(R.text||""))}catch{}}else if(j==="token_reset"){if(typeof o=="function")try{o()}catch{}}else j==="result"?A=R:j==="error"&&(I=new ft(R.message||R.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,R))}ge=S.indexOf(`

`)}}}finally{try{await _.cancel()}catch{}u&&window.clearTimeout(u)}if(I)throw I;if(!A)throw new ft("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let re=Math.round(performance.now()-b);return Hr({request_id:d,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:re,render_ms:0,status:"success"}),A&&typeof A=="object"&&(A._client_request_id=d),A}};var cl={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},dl={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},ul={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},pl={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Ur={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',palette:'<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10h-4Z"/><circle cx="7.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/><circle cx="10" cy="6.8" r=".8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="6.8" r=".8" fill="currentColor" stroke="none"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',more:'<circle cx="4.2" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="19.8" cy="12" r="2.6" fill="currentColor" stroke="none"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function r(e){return String(e??"").replace(/[&<>"']/g,t=>cl[t])}function g(e,t=16,s=""){let a=Ur[e]||Ur.info;return`<svg${s?` class="${r(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function c(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function Le(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function yn(e){if(e instanceof Date)return e;if(typeof e=="number"){let n=new Date(e);return Number.isNaN(n.getTime())?null:n}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function Rt(e){let t=yn(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?r(e):"\u2014"}function ve(e){let t=yn(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?r(e):"\u2014"}function Js(e){let t=yn(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:Rt(t)}function ue(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Ct(e){return dl[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Qe(e,t){let s=Ct(e);return`<span class="badge ${ul[s.tone]}"><span class="status-dot ${pl[s.tone]}"></span>${r(t||s.label)}</span>`}function ml(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${r(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function $a(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function ya(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return Qe(String(e));case"source":return ml(String(e));case"number":return`<span class="mono">${c(e)}</span>`;case"duration":return`<span class="mono">${ue(e)}</span>`;case"datetime":return`<span class="mono">${ve(e)}</span>`;case"date":return`<span class="mono">${Rt(e)}</span>`;case"url":{let s=String(e),a=$a(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${r(s)}" target="_blank" rel="noopener noreferrer" title="${r(s)}">${g("external",10)}${r(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${r(s)}">${r($a(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r($a(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r($a(s,90))}</span>`}}}function De({tone:e="info",title:t,text:s,iconName:a="info"}){let n=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${n==="i"?"i":g(n,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${r(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function ct({iconName:e="search",title:t,text:s="",actions:a="",className:n=""}){return`<div class="empty-state ${n}">
    <span class="empty-icon">${g(e,24)}</span>
    <h3 class="empty-title">${r(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function Me(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${r(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function P(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let n={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${n[t]||"i"}</span>
    <div class="toast-body">${r(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function Ms(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function Pt(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),n=URL.createObjectURL(a),i=document.createElement("a");i.href=n,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(n),1e3)}var gl=`
  <svg class="auth-google-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z"/>
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.58A10 10 0 0 0 12 22Z"/>
    <path fill="#FBBC05" d="M6.41 13.92A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.92V7.5H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.5l3.35-2.58Z"/>
    <path fill="#EA4335" d="M12 6.04c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.5l3.35 2.58C7.2 7.8 9.4 6.04 12 6.04Z"/>
  </svg>`,fl={google_not_configured:"Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A GOOGLE_CLIENT_ID \u8207 GOOGLE_CLIENT_SECRET\u3002",state_mismatch:"\u767B\u5165\u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u767B\u5165\u3002",access_denied:"\u4F60\u53D6\u6D88\u4E86 Google \u767B\u5165\u3002",email_unverified:"\u9019\u500B Google \u5E33\u865F\u7684\u96FB\u5B50\u90F5\u4EF6\u5C1A\u672A\u9A57\u8B49\u3002",not_allowed:"\u9019\u500B Google \u5E33\u865F\u6C92\u6709\u7BA1\u7406\u54E1\u6B0A\u9650\u3002",oauth_failed:"Google \u767B\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"},Ut=null;function bl(){return Et()==="query"?"":zt()}function hl(){let e=bl(),t=`${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;return lt(`/api/auth/google/start?next=${encodeURIComponent(t)}`,e)}function Jr(e){let t=String(e?.name||"").trim();if(t)return t;let s=String(e?.email||"").trim();return s?s.split("@")[0]:"\u5DF2\u767B\u5165"}function vl(e){return Jr(e).slice(0,1).toUpperCase()||"A"}function Gr(){let e=Ut?.querySelector("#auth-menu"),t=Ut?.querySelector("#auth-user-trigger");e&&(e.hidden=!0),t&&t.setAttribute("aria-expanded","false")}function Qr(e={}){let t=!!e.google_enabled;Ut.innerHTML=`
    <a class="auth-login${t?"":" is-disabled"}"
       id="auth-login"
       href="${r(hl())}"
       aria-label="\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165"
       title="${t?"\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165":"Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A"}"
       ${t?"":'aria-disabled="true"'}>
      ${gl}
      <span>\u767B\u5165</span>
    </a>`,t||Ut.querySelector("#auth-login")?.addEventListener("click",a=>{a.preventDefault(),P("Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A GOOGLE_CLIENT_ID \u8207 GOOGLE_CLIENT_SECRET\u3002","warn",5200)})}function $l(e){let t=Jr(e),s=String(e?.email||""),a=e?.admin?"\u7BA1\u7406\u54E1":"\u5DF2\u767B\u5165";Ut.innerHTML=`
    <div class="auth-user">
      <button type="button"
              class="auth-user-trigger"
              id="auth-user-trigger"
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="\u5DF2\u767B\u5165\uFF1A${r(s||t)}\uFF0C\u958B\u555F\u5E33\u865F\u9078\u55AE"
              title="${r(s||t)}">
        <span class="auth-avatar" aria-hidden="true">${r(vl(e))}</span>
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
    </div>`;let n=Ut.querySelector("#auth-user-trigger"),i=Ut.querySelector("#auth-menu");n?.addEventListener("click",o=>{o.stopPropagation();let l=!!i?.hidden;i&&(i.hidden=!l),n.setAttribute("aria-expanded",l?"true":"false")}),Ut.querySelector("#auth-logout")?.addEventListener("click",async o=>{let l=o.currentTarget;l.disabled=!0,l.textContent="\u767B\u51FA\u4E2D\u2026";try{await K.authLogout(),P("\u5DF2\u767B\u51FA\u3002","ok",2400),await Wr()}catch(m){l.disabled=!1,l.textContent="\u767B\u51FA",P(m.message||"\u767B\u51FA\u5931\u6557\u3002","danger",5200)}})}async function Wr(){if(Ut)try{let e=await K.authMe();e?.authenticated?$l(e):Qr(e)}catch{Qr({google_enabled:!1})}}function yl(){let e;try{e=new URL(window.location.href)}catch{return}let t=e.searchParams.get("auth"),s=e.searchParams.get("auth_error");!t&&!s||(e.searchParams.delete("auth"),e.searchParams.delete("auth_error"),window.history.replaceState(null,"",`${e.pathname}${e.search}${e.hash}`),t==="ok"?P("\u5DF2\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165\u3002","ok",3600):s&&P(fl[s]||"Google \u767B\u5165\u5931\u6557\u3002","danger",6e3))}function Vr(){Ut=document.getElementById("auth-slot"),Ut&&(yl(),document.addEventListener("click",e=>{e.target.closest(".auth-user")||Gr()}),document.addEventListener("keydown",e=>{e.key==="Escape"&&Gr()}),Wr())}var Kr="judgment.theme",wn="nvidia",wa=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#0070f3","#171717","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#0066cc","#1d1d1f","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#17171d","#5e6ad2","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#0d99ff","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#0075de","#191918","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],_n=new Map(wa.map(e=>[e.id,e]));function wl(e){return _n.has(e)}function _l(e){return _n.get(e)||_n.get(wn)}function kn(){try{let e=window.localStorage.getItem(Kr);return wl(e)?e:wn}catch{return wn}}function Sn(e,{persist:t=!0}={}){let s=_l(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");if(a&&a.setAttribute("content",s.metaColor),document.querySelectorAll(".theme-option").forEach(n=>{let i=n.dataset.themeId===s.id;n.classList.toggle("is-active",i),n.setAttribute("aria-checked",i?"true":"false")}),t)try{window.localStorage.setItem(Kr,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}var _a="judgment.fontSizes.v1",Ln="judgment.appearance",si=new Set(["light","dark","system"]),Yr="light",Ws=window.matchMedia("(prefers-color-scheme: dark)"),kl="font-size",Ks=[{id:"page-title",label:"\u9801\u9762\u6A19\u984C",hint:"\u5404\u9801\u6700\u4E0A\u65B9\u7684 h1 \u6A19\u984C",selectors:[".page-title"],defaultPx:40,min:20,max:72},{id:"home-title",label:"\u9996\u9801\u4E3B\u8996\u89BA\u6A19\u984C",hint:"\u9996\u9801\u6700\u5927\u7684\u4E3B\u6A19\u984C",selectors:[".home-title"],defaultPx:88,min:40,max:140},{id:"section-title",label:"\u5340\u584A\u6A19\u984C",hint:"\u5831\u8868\u3001\u5361\u7247\u8207\u5340\u584A\u6A19\u984C",selectors:[".section-title",".report-title",".side-card-title",".filter-title",".tests-card-title",".status-sidebar-title",".judgment-dialog-head h2"],defaultPx:16,min:10,max:36},{id:"body",label:"\u5167\u6587\u8207\u8AAA\u660E",hint:"\u6BB5\u843D\u3001\u56DE\u7B54\u3001\u8AAA\u660E\u8207\u6458\u8981\u6587\u5B57",selectors:[".answer-text",".page-subtitle",".report-sub",".home-lead",".empty-text",".notice-body p",".citation-snippet",".side-card-body",".detail-list",".field-help",".report-empty-inline",".processing-section-sub",".summary-value-text",".status-summary",".warnings",".law-dialog-warning"],defaultPx:14,min:8,max:28},{id:"table",label:"\u8868\u683C\u5167\u5BB9",hint:"\u8CC7\u6599\u8868\u683C\u7684\u8868\u982D\u8207\u5132\u5B58\u683C",selectors:[".data-table th",".data-table td"],defaultPx:12,min:8,max:24},{id:"meta",label:"\u6A19\u7C64\u8207\u8F14\u52A9\u6587\u5B57",hint:"badge\u3001chip\u3001\u6B04\u4F4D\u6A19\u7C64\u8207 metadata",selectors:[".badge",".chip",".citation-meta",".citation-index",".answer-section-label",".report-kicker",".report-section-title",".eyebrow",".field-label",".summary-label",".metric-label",".footer-bottom",".nav-update-badge"],defaultPx:10,min:7,max:20},{id:"button",label:"\u6309\u9215\u8207\u5C0E\u89BD",hint:"\u64CD\u4F5C\u6309\u9215\u3001\u9801\u9996\u5C0E\u89BD\u8207\u9023\u7D50",selectors:[".btn",".nav-link",".page-btn",".law-link",".judgment-link",".theme-option-name",".theme-option-desc"],defaultPx:13,min:9,max:24},{id:"form",label:"\u8868\u55AE\u8207\u8F38\u5165",hint:"\u8F38\u5165\u6846\u3001\u4E0B\u62C9\u9078\u55AE\u8207 textarea",selectors:["input","textarea","select",".input",".field-input"],defaultPx:14,min:9,max:28},{id:"mono",label:"\u7A0B\u5F0F\u78BC\u8207\u6578\u503C",hint:"\u7B49\u5BEC\u6587\u5B57\u3001\u67E5\u8A62\u8A9E\u53E5\u8207\u7D71\u8A08\u6578\u503C",selectors:[".mono",".cell-mono",".cell-number",".query-code","code",".metric-value",".summary-value",".perf-stat-value",".mini-stat-value"],defaultPx:13,min:8,max:30},{id:"law-page",label:"\u6CD5\u898F\u689D\u6587\uFF08\u9801\u9762\uFF09",hint:"\u6CD5\u898F\u6AA2\u7D22\u7D50\u679C\u8207\u6CD5\u898F\u4F86\u6E90\u5361\u689D\u6587",selectors:[".law-answer-article-text",".law-answer-article-no",".law-source-article-text",".law-source-article-no",".law-article-text",".law-article-no"],excludeAncestors:[".law-dialog"],defaultPx:12,min:9,max:28},{id:"law-dialog",label:"\u6CD5\u898F\u689D\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u6309\u4E0B\u689D\u6587\u5F8C\u958B\u555F\u7684\u6CD5\u898F dialog",selectors:[".law-dialog .law-article-text",".law-dialog .law-article-no",".law-dialog .law-chapter"],defaultPx:16,min:10,max:32},{id:"judgment-dialog",label:"\u5224\u6C7A\u5168\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u5224\u6C7A\u539F\u6587 dialog \u7684\u5168\u6587\u5340\u584A",selectors:[".judgment-dialog-text"],defaultPx:23,min:12,max:48}],Ts=new Map(Ks.map(e=>[e.id,e])),Vs=new WeakMap,es=ii(),wt={...es},ts=ni(),xn=new Set,js=null,Ls=null,ht=null,vs=null,Xr=null,ds=kl,us=!1,An=null,qn=!1,ka="";function ai(e,t,s){return Math.min(s,Math.max(t,e))}function jn(e){return Math.round(e*10)/10}function xa(e){return Number.isInteger(e)?String(e):e.toFixed(1)}function ni(){try{let e=window.localStorage.getItem(Ln);return si.has(e)?e:Yr}catch{return Yr}}function Sl(){return ts==="system"?Ws.matches?"dark":"light":ts}function ri(){document.querySelectorAll("[data-appearance-option]").forEach(e=>{let t=e.dataset.appearanceOption===ts;e.classList.toggle("is-active",t),e.setAttribute("aria-pressed",t?"true":"false")})}function Sa({persist:e=!1}={}){if(document.documentElement.dataset.appearance=Sl(),document.documentElement.dataset.appearanceMode=ts,ri(),e)try{window.localStorage.setItem(Ln,ts)}catch{}}function xl(e){si.has(e)&&(ts=e,Sa({persist:!0}))}function Zr(){ts==="system"&&Sa()}typeof Ws.addEventListener=="function"?Ws.addEventListener("change",Zr):typeof Ws.addListener=="function"&&Ws.addListener(Zr);function ii(){let e=null;try{e=JSON.parse(window.localStorage.getItem(_a)||"null")}catch{e=null}if(!e||typeof e!="object"||Array.isArray(e))return{};let t={};for(let s of Ks){let a=Number(e[s.id]);Number.isFinite(a)&&(t[s.id]=jn(ai(a,s.min,s.max)))}return t}function Al(){try{return Object.keys(es).length?window.localStorage.setItem(_a,JSON.stringify(es)):window.localStorage.removeItem(_a),!0}catch{return!1}}function Xs(e){let t=new Set;for(let s of e.selectors)document.querySelectorAll(s).forEach(a=>{a.closest(".settings-sidebar")||Array.isArray(e.excludeAncestors)&&e.excludeAncestors.some(n=>a.closest(n))||t.add(a)});return Array.from(t)}function oi(){if(!ka)return;let e=Ts.get(ka);if(e)for(let t of Xs(e))t.classList.add("font-size-highlight")}function li(e){if(Ns(),!Ts.get(e))return;ka=e;let s=ht.querySelector(`.font-size-row[data-font-group="${e}"]`);s&&s.classList.add("is-previewing"),oi()}function Ns(){ka="",ht.querySelectorAll(".font-size-row.is-previewing").forEach(e=>e.classList.remove("is-previewing")),document.querySelectorAll(".font-size-highlight").forEach(e=>e.classList.remove("font-size-highlight"))}function ql(e){if(Vs.has(e))return Vs.get(e);let t={inline:e.style.fontSize||"",computed:parseFloat(window.getComputedStyle(e).fontSize)||0};return Vs.set(e,t),t}function Ml(e){let t=Vs.get(e);t&&(t.inline?e.style.fontSize=t.inline:e.style.removeProperty("font-size"))}function Ll(e){let t=wt[e.id];if(Number.isFinite(t))for(let s of Xs(e))ql(s),s.style.fontSize=`${t}px`}function jl(e){for(let t of Xs(e))Ml(t)}function ps(){for(let e of xn){let t=Ts.get(e);t&&jl(t)}xn=new Set;for(let e of Ks)Number.isFinite(wt[e.id])&&(Ll(e),xn.add(e.id));oi()}function ci(){ps(),us&&ds==="font-size"&&Ys()}function di(){qn||(qn=!0,window.requestAnimationFrame(()=>{qn=!1,ps()}))}function Tl(){An||!document.body||(An=new MutationObserver(e=>{if(Object.keys(wt).length){for(let t of e)if(t.type==="childList"&&(t.addedNodes.length||t.removedNodes.length)){di();return}}}),An.observe(document.body,{childList:!0,subtree:!0}))}function Nl(e){let t=e.filter(s=>typeof s.getClientRects=="function"&&s.getClientRects().length);return t.length?t:e}function El(){let e=Ks.filter(t=>Xs(t).length>0||Number.isFinite(wt[t.id]));return e.length?e:Ks}function Aa(e){let t=wt[e.id];if(Number.isFinite(t))return t;let a=Nl(Xs(e)).map(o=>{let l=Vs.get(o);return l&&l.computed?l.computed:parseFloat(window.getComputedStyle(o).fontSize)||0}).filter(o=>o>0).sort((o,l)=>o-l);if(!a.length)return e.defaultPx;let n=Math.floor(a.length/2),i=a.length%2?a[n]:(a[n-1]+a[n])/2;return jn(i)}function Rl(){let e=[{id:"font-size",label:"\u5B57\u578B\u5927\u5C0F",hint:"\u8ABF\u6574\u5404\u6587\u5B57\u5340\u584A",glyph:'<span class="settings-option-aa" aria-hidden="true">Aa</span>'},{id:"theme",label:"\u4ECB\u9762\u98A8\u683C",hint:"\u5207\u63DB\u54C1\u724C\u8996\u89BA\u8A9E\u8A00",glyph:g("palette",15)}];vs.innerHTML=e.map(t=>`<button class="settings-option${ds===t.id?" is-active":""}" type="button" role="tab"
        data-settings-panel="${t.id}"
        aria-selected="${ds===t.id?"true":"false"}">
        <span class="settings-option-icon">${t.glyph}</span>
        <span class="settings-option-copy">
          <strong>${r(t.label)}</strong>
          <small>${r(t.hint)}</small>
        </span>
        ${g("chevronRight",12,"settings-option-chevron")}
      </button>`).join("")}function Ys(){Ns();let e=El(),t=e.map(s=>{let a=xa(Aa(s));return`<section class="font-size-row" data-font-group="${s.id}">
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
    </section>`}).join("");ht.innerHTML=`<div class="settings-panel-head">
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
    </div>`}function Cl(){Ns();let e=kn(),t=wa.map((n,i)=>{let o=n.swatches.map(l=>`<i style="--swatch:${r(l)}"></i>`).join("");return`<button class="theme-option${n.id===e?" is-active":""}" type="button" role="menuitemradio"
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
          aria-pressed="${ts===n.id?"true":"false"}"
          title="${n.id==="system"?"\u8DDF\u96A8\u7CFB\u7D71\u660E\u6697":`${n.label}\u8272\u6A21\u5F0F`}">${n.label}</button>`).join("")}
  </div>`;ht.innerHTML=`<div class="settings-panel-head">
      <div>
        <h3>\u4ECB\u9762\u98A8\u683C</h3>
        <p>\u9078\u64C7\u4E3B\u63A7\u53F0\u7684\u54C1\u724C\u8996\u89BA\u8A9E\u8A00\uFF1B\u4E3B\u984C\u6703\u7ACB\u5373\u5957\u7528\u4E26\u4FDD\u7559\u3002</p>
      </div>
      <div class="settings-panel-head-actions">
        <span class="badge badge-info">${wa.length} \u7A2E</span>
        ${a}
      </div>
    </div>
    <div class="settings-theme-list" role="menu" aria-label="\u4ECB\u9762\u98A8\u683C">${t}</div>`,ri()}function Pl(){vs.querySelectorAll("[data-settings-panel]").forEach(e=>{let t=e.dataset.settingsPanel===ds;e.classList.toggle("is-active",t),e.setAttribute("aria-selected",t?"true":"false")})}function Tn(e=ds){ds=e==="theme"?"theme":"font-size",Pl(),ds==="theme"?Cl():Ys()}function ei(e,t,s){let a=Number(t);if(!Number.isFinite(a))return;let n=jn(ai(a,e.min,e.max));wt[e.id]=n;let i=s?.querySelector(".font-size-slider");i&&(i.value=String(n));let o=s?.querySelector(".font-size-preview");o&&(o.style.fontSize=`${n}px`),di()}function Il(){ht.querySelectorAll(".font-size-row").forEach(e=>{let t=Ts.get(e.dataset.fontGroup);if(!t)return;let s=wt[t.id]??Aa(t),a=e.querySelector(".font-size-number-input");a&&(a.value=xa(s));let n=e.querySelector(".font-size-slider");n&&(n.value=String(s));let i=e.querySelector(".font-size-preview");i&&(i.style.fontSize=`${s}px`)})}function ti(e){let t=e.target.closest(".font-size-row");if(!t)return;let s=Ts.get(t.dataset.fontGroup);if(!s)return;let a=e.target.classList.contains("font-size-number-input");if(!(a&&e.target.value==="")){if(e.type==="input"&&a){let n=Number(e.target.value);if(!Number.isFinite(n))return;ei(s,n,t);return}if(ei(s,e.target.value,t),e.type==="input"){let n=t.querySelector(".font-size-number-input");n&&document.activeElement!==n&&(n.value=xa(wt[s.id]??Aa(s)))}}}function Dl(e){if(!e.target.classList.contains("font-size-number-input"))return;let t=e.target.closest(".font-size-row"),s=t?Ts.get(t.dataset.fontGroup):null;if(!s)return;let a=wt[s.id]??Aa(s);e.target.value=xa(a)}function Bl(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||li(t.dataset.fontGroup)}function Fl(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Ns()}function Ol(e){let t=e.target.closest(".font-size-row");t&&li(t.dataset.fontGroup)}function Hl(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Ns()}function zl(e){let t=e.target.closest("[data-settings-panel]");if(t){Tn(t.dataset.settingsPanel);return}let s=e.target.closest("[data-settings-action]");if(s){let i=s.dataset.settingsAction;if(i==="save"){es={...wt};let o=Al();Il(),P(o?"\u5B57\u578B\u5927\u5C0F\u5DF2\u5132\u5B58\u3002":"\u5B57\u578B\u5927\u5C0F\u5DF2\u5957\u7528\uFF0C\u4F46\u700F\u89BD\u5668\u7121\u6CD5\u5132\u5B58\u8A2D\u5B9A\u3002",o?"ok":"warn");return}if(i==="cancel"){wt={...es},ps(),Ys(),P("\u5DF2\u53D6\u6D88\u672A\u5132\u5B58\u7684\u5B57\u578B\u8B8A\u66F4\u3002","info");return}i==="reset"&&(wt={},ps(),Ys(),P("\u5DF2\u56DE\u5FA9\u9810\u8A2D\u5B57\u578B\uFF1B\u6309\u300C\u5132\u5B58\u300D\u4FDD\u7559\u8B8A\u66F4\u3002","info"));return}let a=e.target.closest("[data-appearance-option]");if(a){xl(a.dataset.appearanceOption);return}let n=e.target.closest(".theme-option");n&&Sn(n.dataset.themeId)}function Ul(){us||(us=!0,wt={...es},document.body.classList.add("settings-open"),js.removeAttribute("inert"),js.setAttribute("aria-hidden","false"),Ls.setAttribute("aria-expanded","true"),Tn(ds),ps(),window.requestAnimationFrame(()=>{let e=vs.querySelector(".settings-option.is-active")||vs.querySelector(".settings-option");e&&e.focus({preventScroll:!0})}))}function Mn({restoreFocus:e=!0}={}){us&&(us=!1,Ns(),wt={...es},ps(),document.body.classList.remove("settings-open"),e&&Ls.focus({preventScroll:!0}),js.setAttribute("aria-hidden","true"),js.setAttribute("inert",""),Ls.setAttribute("aria-expanded","false"))}function ui(){js=document.getElementById("settings-sidebar"),Ls=document.getElementById("settings-trigger"),ht=document.getElementById("settings-panel"),vs=document.getElementById("settings-options"),Xr=document.getElementById("settings-close"),!(!js||!Ls||!ht||!vs)&&(Sa(),Sn(kn(),{persist:!1}),Rl(),Ys(),Tl(),ps(),Ls.addEventListener("click",()=>{us?Mn():Ul()}),Xr?.addEventListener("click",()=>Mn()),vs.addEventListener("click",e=>{let t=e.target.closest("[data-settings-panel]");t&&Tn(t.dataset.settingsPanel)}),ht.addEventListener("click",zl),ht.addEventListener("input",ti),ht.addEventListener("change",ti),ht.addEventListener("blur",Dl,!0),ht.addEventListener("pointerover",Bl),ht.addEventListener("pointerout",Fl),ht.addEventListener("focusin",Ol),ht.addEventListener("focusout",Hl),ht.addEventListener("keydown",e=>{e.key==="Enter"&&e.target.classList.contains("font-size-number-input")&&(e.preventDefault(),e.target.blur())}),document.addEventListener("keydown",e=>{e.key==="Escape"&&us&&Mn()}),window.addEventListener("storage",e=>{if(e.key===Ln){ts=ni(),Sa();return}e.key===_a&&(es=ii(),us||(wt={...es},ps()))}))}var Fn={};ls(Fn,{render:()=>nc});function Gl(e){let t=e&&typeof e=="object"?e:{},s=t.judgment_total,a=t.financial_total,n=Number(s),i=Number(a),o=s!=null&&Number.isFinite(n)&&n>=0,l=a!=null&&Number.isFinite(i)&&i>=0;return{total:o?n:null,financial:l?i:null,ratio:o&&l&&n>0?i/n*100:null}}function Kt(e,{loading:t=!1}={}){let s=Gl(e),a=t?"\u8B80\u53D6\u4E2D\u2026":c(s.total),n=t?"\u8B80\u53D6\u4E2D\u2026":c(s.financial),i=t?"\u8B80\u53D6\u4E2D\u2026":s.ratio===null?"\u2014":`${s.ratio.toFixed(1)}%`;return`<div class="processing-summary-card">
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
  </div>`}var Nn=11,Ql=15e3,qa=new Set,Jl=[{route:"rag",icon:"message",kicker:"RAG",title:"RAG \u63D0\u554F",summary:"\u7528\u81EA\u7136\u8A9E\u8A00\u627E\u5230\u76F8\u4F3C\u5224\u6C7A\u8207\u73FE\u884C\u6CD5\u898F\uFF0C\u56DE\u7B54\u9644\u4E0A\u53EF\u56DE\u6EAF\u7684\u5F15\u7528\u3002",metric:"Citations first",tone:"feature",wide:!0,metricKey:"rag"},{route:"data",icon:"database",kicker:"EXPLORE",title:"\u8CC7\u6599\u5EAB\u67E5\u8A62",summary:"\u8DE8 PostgreSQL\u3001Parquet\u3001Qdrant \u8207 IndexedDB \u6AA2\u8996\u539F\u59CB\u8CC7\u6599\u3002",metric:"4 \u7A2E\u8CC7\u6599\u4F86\u6E90",tone:"blue",metricKey:"data"},{route:"quality",icon:"shield",kicker:"QUALITY",title:"\u8CC7\u6599\u54C1\u8CEA",summary:"\u7528 DuckDB \u6AA2\u67E5\u539F\u59CB\u5224\u6C7A\u7684\u91CD\u8907\u3001\u7F3A\u6F0F\u8207\u5F15\u7528\u4E00\u81F4\u6027\u3002",metric:"DuckDB native",tone:"green",metricKey:"quality"},{route:"performance",icon:"activity",kicker:"OBSERVE",title:"\u6548\u80FD\u5831\u8868",summary:"\u5F9E\u55AE\u6B21 RAG \u5230\u7D22\u5F15\u5EFA\u7F6E\uFF0C\u8FFD\u8E64\u6BCF\u500B\u968E\u6BB5\u7684\u8017\u6642\u8207\u74F6\u9838\u3002",metric:"Flow \xB7 Waterfall",tone:"amber",metricKey:"performance"},{route:"processing",icon:"sliders",kicker:"PIPELINE",title:"\u8CC7\u6599\u8655\u7406",summary:"\u4E0B\u8F09\u3001\u532F\u5165\u3001\u5099\u4EFD\u8207\u7D22\u5F15\uFF0C\u96C6\u4E2D\u7BA1\u7406\u8CC7\u6599\u751F\u547D\u9031\u671F\u3002",metric:"End-to-end",tone:"violet",metricKey:"processing"},{route:"status",icon:"server",kicker:"STATUS",title:"\u7CFB\u7D71\u72C0\u614B",summary:"\u6AA2\u8996\u670D\u52D9\u5065\u5EB7\u3001\u8F09\u5165 Pipeline\u3001\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207 API \u76EE\u9304\u3002",metric:"10 \u670D\u52D9\u5143\u4EF6",tone:"slate",metricKey:"status"},{route:"tests",icon:"check",kicker:"VERIFY",title:"\u7CFB\u7D71\u6E2C\u8A66",summary:"\u8A2D\u5B9A API Base\uFF0C\u6E2C\u8A66 LLM \u6A21\u578B\u8207 Reranker \u670D\u52D9\u3002",metric:"LLM \xB7 Reranker",tone:"rose",metricKey:"tests"}];function Es(e,t=1){let s=Number(e);return Number.isFinite(s)?`${s.toFixed(t)}%`:"\u2014"}function Rn(e){let t=e?.year_min,s=e?.year_max;return!t&&!s?"\u2014":t&&s&&t!==s?`${t}\u2013${s}`:String(t||s)}function pi(e){let t=Number(e?.year_span);return Number.isFinite(t)&&t>0?`${t} \u5E74`:"\u2014"}function Wl(e){return`<a class="home-tile tone-${r(e.tone)}${e.wide?" is-wide":""}" href="#/${e.route}">
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
  </a>`}function Cn(e,{loading:t=!1}={}){let s=e?.laws||{},a=n=>t?"\u8B80\u53D6\u4E2D\u2026":c(n);return`<div class="processing-summary-card">
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
  </div>`}function Vl(e,{loading:t=!1}={}){if(t)return`<div class="home-live-rows is-loading">
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
      <span class="home-live-value mono">${r(Rn(a))} <i>\xB7</i> ${r(pi(a))}</span>
    </div>
    <div class="home-live-row">
      <span class="home-live-label">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15</span>
      <span class="home-live-value mono">${c(n.indexed)} <i>\xB7</i> ${r(Es(n.coverage_pct))}</span>
    </div>
  </div>`}function La(e,{loading:t=!1,error:s="",generatedAt:a=""}={}){return s?`<div class="home-live-error" role="status">
      <span class="home-live-error-icon">${g("alert",18)}</span>
      <div>
        <strong>\u5373\u6642\u6458\u8981\u66AB\u6642\u7121\u6CD5\u53D6\u5F97</strong>
        <p>${r(s)}</p>
        <button class="btn btn-secondary btn-sm" type="button" id="home-retry">
          ${g("refresh",13)}<span>\u91CD\u65B0\u8F09\u5165</span>
        </button>
      </div>
    </div>`:`${Vl(e,{loading:t})}
    <div class="home-live-foot">
      <span class="home-live-source">${g("link",12)}\u53F8\u6CD5\u9662 OpenData \xB7 \u5168\u570B\u6CD5\u898F\u8CC7\u6599\u5EAB</span>
      <span class="home-live-time">${t||!a?"\u540C\u6B65\u4E2D\u2026":`\u66F4\u65B0 ${ve(a)}`}</span>
    </div>`}function Pn(e,{loading:t=!1}={}){if(t)return`<span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>
      <span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>
      <span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>`;let s=e?.judgments||{},a=e?.raw||{},n=e?.rag?.judgment_index||{};return`<span class="home-fact">
      <span class="home-fact-label">\u539F\u59CB\u5224\u6C7A\u5099\u4EFD</span>
      <strong>${c(a.raw_total)}</strong>
      <small>${c(a.archive_count)} \u500B archive \xB7 \u53F8\u6CD5\u9662 OpenData</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">\u91D1\u878D\u5224\u6C7A\u5E74\u4EFD</span>
      <strong>${r(Rn(s))}</strong>
      <small>${r(pi(s))} \xB7 ${c(s.financial_total)} \u7B46 current</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">\u5411\u91CF\u7D22\u5F15\u8986\u84CB</span>
      <strong>${r(Es(n.coverage_pct))}</strong>
      <small>${c(n.indexed)} / ${c(n.total)} \u7B46 \xB7 ${r(n.model||"\u2014")}</small>
    </span>`}function Ma(e,t){let s=t?.laws||{},a=t?.judgments||{},n=t?.raw||{},i=t?.sources||{};if(e==="opendata"){let l=i.opendata||{};return`<article class="home-source-card">
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
        <div><dt>\u539F\u59CB\u5224\u6C7A</dt><dd>${c(n.raw_total)}</dd></div>
        <div><dt>Archive</dt><dd>${c(n.archive_count)}</dd></div>
        <div><dt>\u88C1\u5224\u5E74\u4EFD</dt><dd>${r(Rn(a))}</dd></div>
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
      <div><dt>\u6CD5\u898F</dt><dd>${c(s.law_count)}</dd></div>
      <div><dt>\u547D\u4EE4</dt><dd>${c(s.order_count)}</dd></div>
      <div><dt>\u689D\u6587</dt><dd>${c(s.article_count)}</dd></div>
      <div><dt>\u8CC7\u6599\u7248\u672C</dt><dd>${c(s.version_count)}</dd></div>
    </dl>
    <div class="home-source-flow"><span>ZIP</span>${g("arrowRight",11)}<span>Parquet</span>${g("arrowRight",11)}<span>PostgreSQL</span>${g("arrowRight",11)}<span>Qdrant</span></div>
  </article>`}function In(e,{loading:t=!1,error:s=""}={}){if(t)return'<div class="home-laws-loading skeleton skeleton-card"></div>';if(s)return`<div class="home-laws-error" role="status">${g("alert",16)}<span>${r(s)}</span></div>`;let a=e?.financial_laws||{},n=Array.isArray(a.laws)?a.laws:[],i=Number(a.count)||n.length,o=Math.ceil(i/Nn)||0,l=String(a.source_sha256||""),m=l?`${l.slice(0,12)}\u2026`:"\u2014",f=a.modified_at?Rt(a.modified_at):"\u2014";return`<details class="home-laws" id="home-laws">
    <summary class="home-laws-summary">
      <span class="home-laws-count">${c(i)}</span>
      <span class="home-laws-title">
        <strong>\u91D1\u878D\u6CD5\u898F\u6E05\u55AE</strong>
        <small>${r(a.source_path||"documents/\u91D1\u878D\u6CD5\u898F.md")} \xB7 ${Nn} \u6B04 \xD7 ${o} \u5217</small>
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
      ${n.length?`<div class="home-laws-grid" style="--home-law-columns:${Nn}" role="list">
              ${n.map((u,$)=>`<span class="home-law" role="listitem" title="${r(u)}">
                    <span class="home-law-index">${String($+1).padStart(2,"0")}</span>
                    <span class="home-law-name">${r(u)}</span>
                  </span>`).join("")}
            </div>`:'<p class="home-laws-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u6CD5\u898F\u540D\u7A31\u3002</p>'}
    </div>
  </details>`}function Dn(e,{loading:t=!1,error:s=""}={}){if(t)return`<div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>`;if(s)return`<div class="home-rag-error">${g("alert",16)}<span>${r(s)}</span></div>`;let a=e?.rag||{},n=a.judgment_index||{},i=a.legal_index||{},o=a.models||{},l=Number(n.coverage_pct),m=Number.isFinite(l)?Math.max(0,Math.min(100,l)):0;return`<article class="home-rag-card">
      <span class="home-rag-kicker">JUDGMENT RETRIEVAL</span>
      <strong class="home-rag-value mono">${c(n.indexed)}<small> / ${c(n.total)}</small></strong>
      <span class="home-rag-label">\u5DF2\u7D22\u5F15 / \u91D1\u878D\u5224\u6C7A</span>
      <span class="home-rag-progress" role="img" aria-label="\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u8986\u84CB ${r(Es(n.coverage_pct))}"><span style="width:${m.toFixed(1)}%"></span></span>
      <span class="home-rag-meta">${r(Es(n.coverage_pct))} \xB7 ${r(n.model||"\u2014")} \xB7 ${r(n.alias||"\u2014")} \u2192 ${r(n.collection||"\u2014")}</span>
      <a class="home-rag-link" href="#/rag">\u958B\u59CB\u63D0\u554F ${g("arrowRight",12)}</a>
    </article>
    <article class="home-rag-card">
      <span class="home-rag-kicker">LEGAL GROUNDING</span>
      <strong class="home-rag-value mono">${c(i.points_count)}<small> \u689D\u6587</small></strong>
      <span class="home-rag-label">\u6CD5\u898F\uFF0F\u547D\u4EE4\u5411\u91CF\u7D22\u5F15</span>
      <span class="home-rag-progress" role="img" aria-label="\u6CD5\u898F\u547D\u4EE4\u7D22\u5F15 ${c(i.points_count)} \u689D\u6587"><span style="width:${Number(i.points_count)>0?"100":"0"}%"></span></span>
      <span class="home-rag-meta">${c(i.current_article_count??i.article_count)} \u73FE\u884C\u689D\u6587 \xB7 ${r(i.model||"\u2014")} \xB7 ${r(i.collection||"\u2014")}${i.version_id?` \xB7 v${i.version_id}`:""}</span>
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
    </article>`}function Kl(){return`<ol class="home-rag-flow" aria-label="RAG \u57F7\u884C\u6D41\u7A0B">
    ${[["01","\u554F\u984C","1\u2013500 \u5B57","message"],["02","Embedding","bge-m3","brain"],["03","\u6AA2\u7D22","\u5224\u6C7A + \u6CD5\u898F\uFF0F\u547D\u4EE4","database"],["04","Rerank","cross-encoder","sliders"],["05","LLM","\u4F9D\u6AA2\u7D22\u5167\u5BB9\u56DE\u7B54","sparkles"],["06","\u5F15\u7528","[n] \u2192 \u539F\u59CB\u4F86\u6E90","link"]].map(([t,s,a,n])=>`<li class="home-rag-step">
          <span class="home-rag-step-icon">${g(n,17)}</span>
          <span class="home-rag-step-copy">
            <small>${t}</small>
            <strong>${r(s)}</strong>
            <span>${r(a)}</span>
          </span>
        </li>`).join("")}
  </ol>`}function Yl(){return`<div class="home-trace">
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
  </div>`}function En(e){return e==="failed"?"\u5931\u6557":e==="skipped"?"\u7565\u904E":e==="running"?"\u57F7\u884C\u4E2D":e==="pending"?"\u7B49\u5F85":"\u5B8C\u6210"}function Xl(e,t,s,a,n,i){let o=String(e.status||"success"),l=o==="skipped"||o==="pending",m=Math.max(0,Number(e.duration_ms)||0),f=l?"\u2014":ue(m),u=o==="failed"?"var(--danger)":e.color||"#64748b",$=[`is-${o}`,o==="failed"?"is-error":"",l?"is-missing":"",i&&e.key===i?"is-slowest":""].filter(Boolean).join(" "),b=String(e.key||`stage-${t}`),d=[["\u72C0\u614B",En(o),!0],["\u958B\u59CB",e.started_at?ve(e.started_at):"\u2014",!0],["\u7D50\u675F",e.finished_at?ve(e.finished_at):"\u2014",!0],["\u8017\u6642",f,!0],["\u5360\u6574\u9AD4",Es(n),!0],["\u8AAA\u660E",e.message||e.caption||"",!1]].map(([y,_,L])=>L||_?`<span class="rag-wf-detail"><span>${r(y)}</span><strong>${r(String(_||"\u2014"))}</strong></span>`:"").join(""),h=l?"":`<span class="rag-wf-bar is-sequential" style="left:${s.toFixed(3)}%;width:${a.toFixed(4)}%;top:0;height:12px;--bar-color:${r(u)}" aria-hidden="true"></span>`;return`<details class="rag-wf-stage home-wf-stage ${$}${qa.has(b)?" is-open":""}" data-home-wf-stage="${r(b)}"${qa.has(b)?" open":""} style="--stage-color:${r(e.color||"#64748b")}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong><span class="home-wf-step">${String(t+1).padStart(2,"0")}</span> ${r(e.label||e.key||"\u968E\u6BB5")}${i&&e.key===i?' <span class="home-wf-slow">\u6700\u6162</span>':""}</strong>${e.caption?`<small>${r(e.caption)}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${r(f)} \xB7 ${r(En(o))} <span class="rag-wf-chevron">${g("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${e.label||e.key}\uFF1A${En(o)}\uFF0C\u8017\u6642 ${f}\uFF0C\u5360\u6574\u9AD4 ${Es(n)}`)}">${h}</span>
    </summary>
    <div class="rag-wf-details">${d}</div>
  </details>`}function Bn(e,{loading:t=!1,error:s="",clientMs:a=null}={}){if(t)return`<div class="report-card home-wf-loading" aria-live="polite">
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
    </div>`;let o=Math.max(0,Number(n.total_ms)||i.reduce((S,A)=>S+(Number(A.duration_ms)||0),0)),l=Math.max(0,Number(a)||0),m=Math.max(0,l-o),f=Math.max(o,i.reduce((S,A)=>S+(Number(A.duration_ms)||0),0),1),u=i.reduce((S,A)=>(Number(A.duration_ms)||0)>(Number(S?.duration_ms)||0)?A:S,i[0]),$=1.25,b=i.map(S=>String(S.status||"success")==="skipped"?0:Math.max((Number(S.duration_ms)||0)/f*100,$)),d=b.reduce((S,A)=>S+A,0),h=d>100?100/d:1,y=0,_=i.map((S,A)=>{let I=["skipped","pending"].includes(String(S.status||"success")),re=I?0:b[A]*h,Y=y;I||(y+=re);let we=f>0?(Number(S.duration_ms)||0)/f*100:0;return Xl(S,A,Y,re,we,u?.key)}).join(""),L=i.filter(S=>S.status==="failed").length;return`<section class="report-card status-wf-card home-wf-card" data-home-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${g("activity",14)}\u9996\u9801\u5373\u6642\u8CC7\u6599\u8F09\u5165 Pipeline</span>
      <span class="home-wf-links">
        <a class="home-wf-link" href="#/status">\u5B8C\u6574\u670D\u52D9 Pipeline ${g("arrowRight",11)}</a>
        <a class="home-wf-link" href="#/performance">RAG Flow ${g("arrowRight",11)}</a>
      </span>
    </div>
    <div class="index-runtime-metrics home-wf-metrics">
      <span class="index-runtime-metric" title="\u5F8C\u7AEF /api/home \u5F9E\u7B2C\u4E00\u500B\u67E5\u8A62\u5230\u56DE\u61C9\u7D44\u88DD\u5B8C\u6210\u7684\u968E\u6BB5\u7E3D\u8017\u6642\u3002"><span>\u968E\u6BB5\u7E3D\u8017\u6642</span><strong>${r(ue(o))}</strong></span>
      <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u5F9E\u9001\u51FA\u8ACB\u6C42\u5230\u6536\u5230\u56DE\u61C9\u7684\u5BE6\u969B\u5F80\u8FD4\u6642\u9593\u3002"><span>HTTP \u5F80\u8FD4</span><strong>${r(l?ue(l):"\u2014")}</strong></span>
      <span class="index-runtime-metric" title="HTTP \u5F80\u8FD4\u6263\u6389\u5F8C\u7AEF\u968E\u6BB5\u7E3D\u8017\u6642\u5F8C\u7684\u50B3\u8F38\u8207\u6392\u968A\u6642\u9593\u3002"><span>\u50B3\u8F38\uFF0F\u6392\u968A</span><strong>${r(l?ue(m):"\u2014")}</strong></span>
      <span class="index-runtime-metric" title="\u672C\u6B21\u8F09\u5165\u8017\u6642\u6700\u9577\u7684\u968E\u6BB5\uFF0C\u4E5F\u5C31\u662F\u76EE\u524D\u6700\u660E\u986F\u7684\u74F6\u9838\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${u?.label||"\u2014"} \xB7 ${ue(u?.duration_ms||0)}`)}</strong></span>
      <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${c(i.length-L)} / ${c(i.length)}${L?` \xB7 \u5931\u6557 ${c(L)}`:""}</strong></span>
      <span class="index-runtime-metric" title="\u672C\u6B21\u6458\u8981\u7684\u7522\u751F\u6642\u9593\u3002"><span>\u66F4\u65B0\u6642\u9593</span><strong>${r(n.finished_at?ve(n.finished_at):"\u2014")}</strong></span>
    </div>
    <div class="status-wf-chart">
      <div class="rag-wf-axis"><span>0 ms</span><span>${r(ue(o))}</span></div>
      <div class="rag-wf-stages">${_}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u5BE6\u969B\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0Cbar \u9577\u5EA6\u70BA\u8A72\u968E\u6BB5\u8017\u6642\u5360\u6BD4\uFF1B\u6A19\u793A\u300C\u6700\u6162\u300D\u7684\u968E\u6BB5\u5373\u672C\u6B21\u8F09\u5165\u74F6\u9838\u3002\u9EDE\u64CA\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u3001\u5360\u6BD4\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function Zl(e){return`<div class="home-source-error">${g("alert",16)}<span>${r(e)}</span></div>`}function ec(){let e=Jl.map(Wl).join("");return`<section class="page home-page" id="home-page">
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
        <div id="home-live-body" aria-live="polite">${La(null,{loading:!0})}</div>
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
          ${Kt(null,{loading:!0})}
        </div>
        <div class="home-metric-group" id="home-law-metrics">
          ${Cn(null,{loading:!0})}
        </div>
      </div>
      <div class="home-metric-strip" id="home-metric-strip">
        ${Pn(null,{loading:!0})}
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
      ${Kl()}
      <div class="home-rag-values" id="home-rag-values">
        ${Dn(null,{loading:!0})}
      </div>
      ${Yl()}
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
        ${Ma("opendata",null)}
        ${Ma("laws",null)}
      </div>
      <div id="home-laws-slot">
        ${In(null,{loading:!0})}
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
        ${Bn(null,{loading:!0})}
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
  </section>`}function tc(e,t){let s=t?.laws||{},a=t?.judgments||{},n=t?.raw||{},i=t?.rag?.judgment_index||{},o={rag:`${c(i.indexed)} \u7B46\u7D22\u5F15`,data:`${c(s.law_count)} \u6CD5\u898F \xB7 ${c(s.order_count)} \u547D\u4EE4`,quality:`${c(n.raw_total)} \u539F\u59CB\u5224\u6C7A`,processing:`${c(n.archive_count)} archive`,performance:"Flow \xB7 Waterfall",status:"10 \u670D\u52D9\u5143\u4EF6",tests:"LLM \xB7 Reranker"};e.querySelectorAll("[data-home-tile-metric]").forEach(l=>{let m=l.dataset.homeTileMetric;m&&o[m]&&(l.textContent=o[m])})}function sc(e,t,{clientMs:s=null}={}){let a=t?.data||{},n=t?.generated_at||"",i=e.querySelector("#home-live-body");i&&(i.innerHTML=La(a,{generatedAt:n}));let o=e.querySelector("#home-judgment-stats"),l=a.judgments||{};o&&(o.innerHTML=Kt({judgment_total:l.raw_total,financial_total:l.financial_total,financial_ratio:l.financial_ratio}));let m=e.querySelector("#home-law-metrics");m&&(m.innerHTML=Cn(a));let f=e.querySelector("#home-metric-strip");f&&(f.innerHTML=Pn(a));let u=e.querySelector("#home-rag-values");u&&(u.innerHTML=Dn(a));let $=e.querySelector("#home-source-grid");$&&($.innerHTML=`${Ma("opendata",a)}${Ma("laws",a)}`);let b=e.querySelector("#home-laws-slot");if(b){let y=!!b.querySelector("#home-laws")?.open;b.innerHTML=In(a);let _=b.querySelector("#home-laws");_&&y&&(_.open=!0)}let d=e.querySelector("#home-waterfall-slot");d&&(d.innerHTML=Bn({...a,pipeline:t?.pipeline},{clientMs:s})),tc(e,a)}function ac(e,t){let s=e.querySelector("#home-live-body");s&&(s.innerHTML=La(null,{error:t}));let a=e.querySelector("#home-judgment-stats");a&&(a.innerHTML=Kt(null));let n=e.querySelector("#home-law-metrics");n&&(n.innerHTML=Cn(null));let i=e.querySelector("#home-metric-strip");i&&(i.innerHTML=Pn(null));let o=e.querySelector("#home-rag-values");o&&(o.innerHTML=Dn(null,{error:t}));let l=e.querySelector("#home-source-grid");l&&(l.innerHTML=Zl(t));let m=e.querySelector("#home-laws-slot");m&&(m.innerHTML=In(null,{error:t}));let f=e.querySelector("#home-waterfall-slot");f&&(f.innerHTML=Bn(null,{error:t}))}async function nc(e,t){let s=!1,a=!1,n=!1,i=null,o=null,l=null,m=null,f=0;e.innerHTML=ec();let u=e.querySelector("#home-ask-form"),$=e.querySelector("#home-question"),b=e.querySelector("#home-refresh"),d=()=>{let S=String($?.value||"").trim().slice(0,500);if(!S){$?.focus();return}try{window.sessionStorage.setItem("judgment.pending_question",S)}catch{}window.__judgmentPendingQuestion=S,t&&typeof t.navigate=="function"?t.navigate("rag"):window.location.hash="#/rag"},h=()=>{$&&($.style.height="auto",$.style.height=`${Math.min($.scrollHeight,140)}px`)},y=S=>{b&&(b.disabled=S,b.classList.toggle("is-loading",S),b.setAttribute("aria-busy",S?"true":"false"))},_=async({quiet:S=!1}={})=>{if(s)return;if(a){n=!0;return}if(a=!0,f=Date.now(),y(!0),!S){let I=e.querySelector("#home-live-body");I&&(I.innerHTML=La(null,{loading:!0}))}let A=performance.now();try{let I=await K.homeSummary();if(s||!e.isConnected)return;o=I?.data||null,l=I?.data?.financial_laws||null,sc(e,I,{clientMs:Math.round(performance.now()-A)})}catch(I){if(s||!e.isConnected)return;ac(e,I.message||"\u7121\u6CD5\u53D6\u5F97\u9996\u9801\u5373\u6642\u8CC7\u6599\u3002")}finally{a=!1,y(!1),n&&!s&&(n=!1,_({quiet:!0}))}};$?.addEventListener("input",h),u?.addEventListener("submit",S=>{S.preventDefault(),d()}),$?.addEventListener("keydown",S=>{S.key==="Enter"&&!S.shiftKey&&!S.isComposing&&(S.preventDefault(),d())});let L=()=>{if(s||m)return;let S=Math.max(0,Ql-(Date.now()-f));if(S===0){_({quiet:!0});return}m=window.setTimeout(()=>{m=null,s||_({quiet:!0})},S)};if(e.addEventListener("click",S=>{if(S.target.closest("#home-refresh")||S.target.closest("#home-retry")){m&&(window.clearTimeout(m),m=null),_();return}if(S.target.closest("#home-laws-download")){let A=l?.content||`${(l?.laws||[]).join(`
`)}
`;A.trim()&&Pt("\u91D1\u878D\u6CD5\u898F.md",A)}}),e.addEventListener("toggle",S=>{let A=S.target.closest?.("[data-home-wf-stage]");if(!A||!e.contains(A))return;let I=A.dataset.homeWfStage||"";I&&(A.open?qa.add(I):qa.delete(I))},!0),h(),$?.focus({preventScroll:!0}),await _(),!s)try{i=bt("processing",(S,A)=>{s||A?.initial||L()},{onError:()=>{}})}catch{i=null}return()=>{s=!0,m&&(window.clearTimeout(m),m=null),typeof i=="function"&&i(),i=null}}var ir={};ls(ir,{render:()=>Qd});var mi="judgment-console";var dt="query_history",Gt="settings",Qt="audit_events";var tt={history:[],settings:new Map,audit:[],nextId:1},ja=null,rt=!("indexedDB"in window);function Mt(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function xt(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function Lt(){return ja||(ja=new Promise((e,t)=>{if(!("indexedDB"in window)){rt=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(mi,2)}catch(a){rt=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(dt)){let n=a.createObjectStore(dt,{keyPath:"id",autoIncrement:!0});n.createIndex("created_at","created_at"),n.createIndex("kind","kind")}if(a.objectStoreNames.contains(Gt)||a.createObjectStore(Gt,{keyPath:"key"}),!a.objectStoreNames.contains(Qt)){let n=a.createObjectStore(Qt,{keyPath:"key"});n.createIndex("created_at","created_at"),n.createIndex("dataset","dataset"),n.createIndex("jid","jid"),n.createIndex("issue_month","issue_month")}},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{rt=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{rt=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),ja)}function gi(){return"indexedDB"in window}function fi(){return rt}function Zs(){return rt?"memory":"indexeddb"}function rc(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},turns:Array.isArray(e.turns)?e.turns:[],pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t,updated_at:e.updated_at||t}}async function ic(){try{let t=(await Lt()).transaction(dt,"readwrite"),s=t.objectStore(dt),a=await Mt(s.count());if(a>120){let n=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let m=i.result;if(!m||n<=0){o();return}m.delete(),n-=1,m.continue()},i.onerror=()=>l(i.error)})}await xt(t)}catch{rt=!0}}async function ea(e){let t=rc(e);try{let a=(await Lt()).transaction(dt,"readwrite"),n=a.objectStore(dt),i=await Mt(n.add(t));return await xt(a),await ic(),i}catch{rt=!0;let a=tt.nextId++;return tt.history.push({id:a,...t}),tt.history.length>120&&tt.history.shift(),a}}async function ta(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let n=(await Lt()).transaction(dt,"readwrite"),i=n.objectStore(dt),o=await Mt(i.get(s));if(!o)return await xt(n),null;let l={...o,...t,id:s};return await Mt(i.put(l)),await xt(n),l}catch{rt=!0;let n=tt.history.findIndex(i=>Number(i.id)===s);return n===-1?null:(tt.history[n]={...tt.history[n],...t,id:s},tt.history[n])}}async function bi(e){let t=Number(e);if(!Number.isFinite(t))return!1;try{let a=(await Lt()).transaction(dt,"readwrite");return a.objectStore(dt).delete(t),await xt(a),!0}catch{rt=!0;let a=tt.history.findIndex(n=>Number(n.id)===t);return a===-1?!1:(tt.history.splice(a,1),!0)}}async function Ta({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let n=(await Lt()).transaction(dt,"readonly"),i=n.objectStore(dt),o=await Mt(i.getAll());return await xt(n),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,m)=>String(m.updated_at||m.created_at).localeCompare(String(l.updated_at||l.created_at))).slice(0,t)}catch{return rt=!0,tt.history.filter(n=>s?`${n.kind} ${n.title} ${n.detail}`.toLowerCase().includes(s):!0).slice().sort((n,i)=>String(i.updated_at||i.created_at).localeCompare(String(n.updated_at||n.created_at))).slice(0,t)}}async function hi(){try{let t=(await Lt()).transaction(dt,"readwrite");t.objectStore(dt).clear(),await xt(t)}catch{rt=!0}tt.history=[]}function oc(e){let t=Number(e.id??e.event_id??0)||0,s=String(e.dataset||e.kind||"judgment"),a=String(e.key||`${s}:${t||`${Date.now()}:${Math.random().toString(36).slice(2)}`}`),n=String(e.jid||""),i=String(e.issue_month||""),o=String(e.change_type||""),l=String(e.detected_at||e.created_at||new Date().toISOString());return{key:a,event_id:t,dataset:s,jid:n,issue_month:i,change_type:o,title:String(e.title||n||i||"\u7248\u672C\u8B8A\u66F4"),detail:String(e.detail||[o,i,n].filter(Boolean).join(" \xB7 ")),created_at:l,payload:e}}async function lc(){try{let t=(await Lt()).transaction(Qt,"readwrite"),s=t.objectStore(Qt),a=await Mt(s.count());if(a>2e3){let n=a-2e3,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let m=i.result;if(!m||n<=0){o();return}m.delete(),n-=1,m.continue()},i.onerror=()=>l(i.error)})}await xt(t)}catch{rt=!0}}async function vi(e){let t=(Array.isArray(e)?e:[]).filter(s=>s&&typeof s=="object").map(oc);if(!t.length)return 0;try{let a=(await Lt()).transaction(Qt,"readwrite"),n=a.objectStore(Qt);for(let i of t)await Mt(n.put(i));return await xt(a),await lc(),t.length}catch{rt=!0;let a=new Map(tt.audit.map(n=>[n.key,n]));for(let n of t)a.set(n.key,n);return tt.audit=Array.from(a.values()).sort((n,i)=>String(i.created_at).localeCompare(String(n.created_at))).slice(0,2e3),t.length}}async function $i({keyword:e="",limit:t=200}={}){let s=e.trim().toLowerCase(),a=n=>s?`${n.dataset} ${n.jid} ${n.issue_month} ${n.change_type} ${n.detail}`.toLowerCase().includes(s):!0;try{let i=(await Lt()).transaction(Qt,"readonly"),o=i.objectStore(Qt),l=await Mt(o.getAll());return await xt(i),l.filter(a).sort((m,f)=>String(f.created_at).localeCompare(String(m.created_at))).slice(0,t)}catch{return rt=!0,tt.audit.filter(a).slice().sort((i,o)=>String(o.created_at).localeCompare(String(i.created_at))).slice(0,t)}}async function yi(){let e={name:mi,version:2,supported:"indexedDB"in window,mode:Zs(),degraded:rt,stores:[dt,Gt,Qt],caps:{history:120,audit:2e3},usage_bytes:null,quota_bytes:null};if(typeof navigator<"u"&&navigator.storage?.estimate)try{let t=await navigator.storage.estimate();e.usage_bytes=Number.isFinite(t.usage)?t.usage:null,e.quota_bytes=Number.isFinite(t.quota)?t.quota:null}catch{}try{let s=(await Lt()).transaction([dt,Gt,Qt],"readonly"),a=xt(s),[n,i,o]=await Promise.all([Mt(s.objectStore(dt).count()),Mt(s.objectStore(Gt).count()),Mt(s.objectStore(Qt).count()),a]);return{...e,available:!0,counts:{query_history:n,settings:i,audit_events:o},total:n+i+o}}catch{return rt=!0,{...e,available:!1,degraded:!0,mode:"memory",counts:{query_history:tt.history.length,settings:tt.settings.size,audit_events:tt.audit.length},total:tt.history.length+tt.settings.size+tt.audit.length}}}async function sa(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let n=(await Lt()).transaction(Gt,"readwrite");return n.objectStore(Gt).put(s),await xt(n),s}catch{return rt=!0,tt.settings.set(s.key,s),s}}async function ms(e,t=null){try{let a=(await Lt()).transaction(Gt,"readonly"),n=a.objectStore(Gt),i=await Mt(n.get(String(e)));return await xt(a),i?i.value:t}catch{rt=!0;let a=tt.settings.get(String(e));return a?a.value:t}}async function wi({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await Lt()).transaction(Gt,"readonly"),n=a.objectStore(Gt),i=await Mt(n.getAll());return await xt(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return rt=!0,Array.from(tt.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function _i(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var ar={};ls(ar,{buildFlowWaterfallStages:()=>Ga,render:()=>_d,renderRagPipelineWaterfall:()=>Ua,renderTestFlowPanel:()=>Is,renderWaterfallStages:()=>Ps});var cc={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},dc=new Set(["running","stopping"]);function Ra(e){let[t,s]=cc[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${r(t)}</span>`}function Na(e){return String(e).padStart(2,"0")}function Rs(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${Na(t.getMonth()+1)}-${Na(t.getDate())} ${Na(t.getHours())}:${Na(t.getMinutes())}`}function Ea(e){return dc.has(e)}function ss(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function $s(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function gs(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${r(e)}</span>
    <strong>${r(String(t))}</strong>
    ${s?`<small>${r(s)}</small>`:""}
  </div>`}function ki(e={}){let t=e.score_components||e,s=e.gate||{},a=String(s.status||""),n=a==="pass"?"Gate \u901A\u904E":a==="fail"?"Gate \u5931\u6557":a==="no_data"?"Gate \u7121\u8CC7\u6599":"";return`${n?`<span class="badge ${a==="pass"?"badge-ok":a==="fail"?"badge-danger":"badge-neutral"}">${r(n)}</span>`:""}<div class="bench-metrics">
    ${gs("Law Recall",$s(t.law_recall))}
    ${gs("Article Recall",$s(t.article_recall))}
    ${gs("Citation Valid",$s(t.citation_valid_rate))}
    ${gs("Judge",ss(t.judge_overall))}
    ${gs("Human",ss(t.human_overall))}
    ${gs("p50",ue(e.duration_p50_ms))}
    ${gs("p95",ue(e.duration_p95_ms))}
    ${gs("Success",`${c(e.success||0)} / ${c(e.total||0)}`)}
  </div>`}function Si(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${r(s.replace(/^rag\./,""))}</span>
      <strong>${ue(a.p50_ms)}</strong>
      <small>p95 ${ue(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function xi(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${$s(s.law_recall)}</span>
    <span>Article ${$s(s.article_recall)}</span>
    <span>Judge ${ss(s.judge_overall)}</span>
    <span>p95 ${ue(t.duration_p95_ms)}</span>`}function Ai(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function qi(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${r(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${r(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${r(e.status||"")}">${Ra(e.status)}</span>
      <span class="mono">${r(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${r(ve(e.started_at))}</span>
      <span data-bench-slot="run-completed">${c(e.completed_cases||0)} / ${c(e.total_cases||0)} \u984C</span>
      <span>${r(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${r(Ai(e))}">${xi(e)}</span>
  </button>`}function Hn(e,t=[]){let s=e.metrics||{},a=e.judge||{},n=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([f])=>f.startsWith("rag.")).map(([f,u])=>`<span class="chip">${r(f)} ${ue(u)}</span>`).join(""),m=(e.law_sources||[]).map(f=>`<span class="chip">${r(f.law_name||"\u6CD5\u898F")} ${c((f.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${r(e.question)}</span>
      ${Ra(e.status)}
      <span class="bench-case-time">${ue(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${ss(i.deterministic)} \xB7 Judge ${ss(i.judge)} \xB7 Human ${ss(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${r((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${r(e.fingerprint||"")}">${g("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
      </div>
      <div class="bench-case-stages">${l||'<span class="qb-muted">\u6C92\u6709 stage timing</span>'}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${$s(s.law_recall)}</span>
        <span>Article recall ${$s(s.article_recall)}</span>
        <span>Citation ${s.citation_valid?"valid":"invalid"}</span>
        <span>Refusal ${s.refusal_correct===null?"\u2014":s.refusal_correct?"correct":"wrong"}</span>
      </div>
      <div class="chips">${m||'<span class="qb-muted">\u6C92\u6709\u6CD5\u898F\u4F86\u6E90</span>'}</div>
      <div class="bench-answer"><strong>\u56DE\u7B54</strong><p>${r(e.answer||"\u2014")}</p></div>
      <div class="bench-judge"><strong>LLM judge</strong><p>${r(a.rationale||a.reason||"\u2014")}</p><span>${[["correctness",a.correctness],["grounding",a.grounding],["citation",a.citation],["clarity",a.clarity],["overall",a.overall]].map(([f,u])=>`${f} ${u??"\u2014"}`).join(" \xB7 ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${e.id}">
        <div class="bench-human-grid">
          ${[["correctness","\u6B63\u78BA\u6027",n.scores?.correctness??4],["grounding","\u6709\u64DA\u6027",n.scores?.grounding??4],["citation","\u5F15\u7528",n.scores?.citation??4],["clarity","\u6E05\u695A",n.scores?.clarity??4],["overall","\u6574\u9AD4",n.overall??4]].map(([f,u,$])=>`<label class="field"><span class="field-label">${u} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${f}" value="${r(String($))}" /></label>`).join("")}
        </div>
        <label class="field"><span class="field-label">\u4EBA\u5DE5\u6279\u6CE8</span><input class="input" name="comment" value="${r(n.comment||"")}" placeholder="\u56DE\u7B54\u54C1\u8CEA\u3001\u5F15\u7528\u6216\u4E8B\u5BE6\u932F\u8AA4" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${g("check",13)}<span>\u5132\u5B58\u4EBA\u5DE5\u8A55\u5206</span></button>
      </form>
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(f=>`<div class="bench-history-row"><span>${r(ve(f.run?.started_at))}</span><span>${r(f.run?.config?.llm_model||"\u2014")}</span><span>Det ${ss(f.metrics?.scores?.deterministic)}</span><span>Judge ${ss(f.metrics?.scores?.judge)}</span><span>Human ${ss(f.metrics?.scores?.human)}</span><span>${ue(f.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function On(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function Mi(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${Hn(e,t)}
  </details>`}function Li(e){return`${Ra(e.status)}
    <span class="mono">${r(e.run_id)}</span>
    ${Ea(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${g("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function uc(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${r(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${g("activity",14)}${r(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${r((e.status||"")+":"+e.run_id)}">
        ${Li(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${ki(e.summary||{})}</div>
    <div data-bench-detail="stages">${Si(e.summary||{})}</div>
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
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>Mi(a,t[a.fingerprint]||[])).join(""):De({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function ji(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${g("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${g("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function Ti(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),n=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,n-i):0,l=(t||[]).filter(h=>["success","failed"].includes(h.status)).map(h=>Number(h.duration_ms)||0).filter(h=>h>0),m=null;if(l.length)m=l.reduce((h,y)=>h+y,0)/l.length;else if(a>0){let h=Date.parse(e.updated_at||""),y=Number.isFinite(h)?h:i;Number.isFinite(y)&&y>i?m=(y-i)/a:o>0&&(m=o/a)}let f=(t||[]).find(h=>h.status==="running")||null,u=0;if(a<s&&m&&m>0){let h=f?Date.parse(f.started_at||""):NaN,y=Date.parse(e.updated_at||""),_=Number.isFinite(h)?h:y;Number.isFinite(_)&&(u=Math.max(0,Math.min(.95,(n-_)/m)))}let $=Math.min(s,a+u),b=s>0?Math.max(0,Math.min(100,$/s*100)):0,d=m===null?null:Math.max(0,s-$)*m;return{total:s,completed:a,elapsedMs:o,averageMs:m,progress:b,etaMs:d,ratePerMin:m?6e4/m:null,running:f}}function Ni(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${ue(e)}`}function Ei(e,t=[]){let s=Ti(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${r(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${c(s.completed)} / ${c(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${Ni(s.etaMs)}</span>
      <span data-bench-slot="progress-rate">${s.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${s.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`}</span>
    </div>
    <div class="processing-bar processing-bar-lg bench-progress-bar${s.completed===0?" is-waiting":""}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.progress.toFixed(1)}" data-bench-slot="progress-bar">
      <span class="processing-bar-fill" data-bench-slot="progress-fill" style="width:${s.progress.toFixed(2)}%"></span>
    </div>
    <div class="bench-progress-foot">
      <span data-bench-slot="progress-elapsed">\u5DF2\u57F7\u884C ${ue(s.elapsedMs)}</span>
      <span data-bench-slot="progress-average">${s.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${ue(s.averageMs)}\uFF0F\u984C`}</span>
      <span>\u5373\u6642\u9810\u4F30 \xB7 \u6BCF\u5B8C\u6210\u4E00\u984C\u6821\u6B63</span>
    </div>
  </div>`}function pc(e){let t=e.models?.models||{},s=e.suites||[],a=aa(e),n=e.selectedRun;return`<section class="report-card bench-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("brain",14)}RAG Benchmark</span>
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
      <label class="field"><span class="field-label">Run \u6A19\u7C64</span><input class="input" name="label" value="${r(e.config.label||Rs())}" /></label>
      <div class="qb-actions" data-bench-actions data-signature="${r(a?`${a.run_id}:${a.status}`:"")}">
        ${ji(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${r(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?Ei(a,zn(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>qi(i,n?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${n?uc(n,e.history):""}
  </section>`}function aa(e){let t=(e.runs||[]).find(s=>Ea(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!Ea(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function zn(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function Ri(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:Rs(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",refreshStream:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),n=j=>{let x=new FormData(j);return{label:String(x.get("label")||"").trim()||Rs(),embedding_model:String(x.get("embedding_model")||""),llm_model:String(x.get("llm_model")||""),judge_model:String(x.get("judge_model")||""),top_k:Number(x.get("top_k")||4),score_threshold:Number(x.get("score_threshold")||.35),repeats:Number(x.get("repeats")||1),enable_law_retrieval:j.elements.enable_law_retrieval?.checked??!0,judge_enabled:j.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(j=>`${j.id}:${j.name}:${j.item_count}:${j.version}:${j.status}`)]:null,runs:(s.runs||[]).map(j=>`${j.run_id}:${j.label||""}:${j.suite_version||1}`)}),o=()=>{let x=a()?.querySelector("[data-bench-live]"),R=aa(s);if(!x||!R)return;let W=Ti(R,zn(s,R)),te=(xe,D)=>{let ke=x.querySelector(`[data-bench-slot="${xe}"]`);ke&&ke.textContent!==D&&(ke.textContent=D)};te("progress-count",`${c(W.completed)} / ${c(W.total)} \u984C`),te("progress-percent",`${W.progress.toFixed(1)}%`),te("progress-eta",Ni(W.etaMs)),te("progress-rate",W.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${W.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),te("progress-elapsed",`\u5DF2\u57F7\u884C ${ue(W.elapsedMs)}`),te("progress-average",W.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${ue(W.averageMs)}\uFF0F\u984C`),te("progress-state",R.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let z=x.querySelector('[data-bench-slot="progress-bar"]');z&&(z.setAttribute("aria-valuenow",W.progress.toFixed(1)),z.classList.toggle("is-waiting",W.completed===0));let de=x.querySelector('[data-bench-slot="progress-fill"]');de&&(de.style.width=`${W.progress.toFixed(2)}%`)},l=j=>{let x=j.querySelector("[data-bench-actions]");if(!x)return;let R=aa(s),W=R?`${R.run_id}:${R.status}`:"";x.dataset.signature!==W&&(x.dataset.signature=W,x.innerHTML=ji(R))},m=j=>{let x=j.querySelector("[data-bench-live-wrap]");if(!x)return;let R=aa(s),W=R?`${R.run_id}:${R.status}:${R.total_cases}`:"";x.dataset.signature!==W&&(x.dataset.signature=W,x.innerHTML=R?Ei(R,zn(s,R)):"")},f=j=>{let x=j.querySelector("[data-bench-runs]");if(!x)return;let R=s.runs||[],W=[...x.querySelectorAll("[data-run-id]")].map(z=>z.dataset.runId),te=R.map(z=>z.run_id);if(W.join("|")!==te.join("|")){x.innerHTML=R.length?R.map(z=>qi(z,s.selectedRun?.run_id===z.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let z of R){let de=x.querySelector(`[data-run-id="${z.run_id}"]`);if(!de)continue;de.classList.toggle("is-active",s.selectedRun?.run_id===z.run_id);let xe=de.querySelector('[data-bench-slot="run-label"]');xe&&xe.textContent!==(z.label||"RAG Benchmark")&&(xe.textContent=z.label||"RAG Benchmark");let D=de.querySelector('[data-bench-slot="run-status"]');D&&D.dataset.status!==(z.status||"")&&(D.dataset.status=z.status||"",D.innerHTML=Ra(z.status));let ke=de.querySelector('[data-bench-slot="run-completed"]');if(ke){let _e=`${c(z.completed_cases||0)} / ${c(z.total_cases||0)} \u984C`;ke.textContent!==_e&&(ke.textContent=_e)}let se=de.querySelector('[data-bench-slot="run-scores"]'),je=Ai(z);se&&se.dataset.signature!==je&&(se.dataset.signature=je,se.innerHTML=xi(z))}},u=j=>{let x=s.selectedRun;if(!x)return;let R=j.querySelector(`.bench-detail[data-run-id="${x.run_id}"]`);if(!R)return;let W=R.querySelector("[data-bench-detail-actions]");if(W){let se=`${x.status||""}:${x.run_id}`;W.dataset.signature!==se&&(W.dataset.signature=se,W.innerHTML=Li(x))}let te=R.querySelector('[data-bench-detail="metrics"]');if(te){let se=JSON.stringify(x.summary||{});te.dataset.signature!==se&&(te.dataset.signature=se,te.innerHTML=ki(x.summary||{}))}let z=R.querySelector('[data-bench-detail="stages"]');if(z){let se=JSON.stringify((x.summary||{}).stages||{});z.dataset.signature!==se&&(z.dataset.signature=se,z.innerHTML=Si(x.summary||{}))}let de=R.querySelector("[data-bench-cases]");if(!de)return;let xe=x.cases||[];if(!xe.length)return;let D=de.querySelector(".notice");D&&D.remove();let ke=new Map([...de.querySelectorAll("details.bench-case")].map(se=>[Number(se.dataset.resultId),se]));for(let se of xe){let je=s.history[se.fingerprint]||[],_e=On(se,je),oe=ke.get(Number(se.id));if(!oe){de.insertAdjacentHTML("beforeend",Mi(se,je)),oe=de.lastElementChild,oe&&(oe._benchSignature=_e);continue}if(oe._benchSignature===_e||!s.forcedCaseIds.delete(Number(se.id))&&oe.contains(document.activeElement))continue;let he=oe.open;oe.innerHTML=Hn(se,je),oe.open=he,oe._benchSignature=_e}},$=()=>{aa(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},b=()=>{let j=a();j&&(l(j),m(j),f(j),u(j),o(),$())},d=j=>{let x=s.selectedRun;if(!x)return;let R=j.querySelector('[data-bench-detail="metrics"]');R&&(R.dataset.signature=JSON.stringify(x.summary||{}));let W=j.querySelector('[data-bench-detail="stages"]');W&&(W.dataset.signature=JSON.stringify((x.summary||{}).stages||{}));let te=j.querySelector("[data-bench-cases]");if(!te)return;let z=new Map((x.cases||[]).map(de=>[Number(de.id),de]));for(let de of te.querySelectorAll("details.bench-case")){let xe=z.get(Number(de.dataset.resultId));xe&&(de._benchSignature=On(xe,s.history[xe.fingerprint]||[]))}},h=(j=!1)=>{let x=a();if(!x)return;let R=i();if(!j&&s.renderSignature===R){b();return}s.renderSignature=R,s.forcedCaseIds.clear(),x.innerHTML=pc(s),d(x),b()},y=async({refreshAll:j=!1,runs:x=null}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||j;return}s.loading=!0;try{if(!s.referenceLoaded||j){let[D,ke]=await Promise.all([K.benchmarkModels(),K.benchmarkSuites()]);s.models=D,s.suites=ke.suites||[],s.indexVersion=D.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=D.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=D.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(D.models?.llm||[]).find(se=>se!==s.config.llm_model)||"")}let R=x?{runs:x}:await K.benchmarkRuns(30);s.runs=R.runs||[];let W=s.activeRunId,te=s.runs.find(D=>Ea(D.status))||null;s.activeRunId=te?.run_id||"";let z=s.selectedRun?.run_id||"";z||(z=te?.run_id||s.runs[0]?.run_id||"");let de=!!(s.selectedRun&&W&&s.selectedRun.run_id===W);z&&(!s.selectedRun||s.selectedRun.run_id!==z||z===te?.run_id||de)?s.selectedRun=await K.benchmarkRun(z,!0):z||(s.selectedRun=null),s.loaded=!0,h()}catch(R){if(!s.loaded){s.renderSignature="";let W=a();W&&(W.innerHTML=De({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:r(R.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let R=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,y({refreshAll:R})}}},_=()=>{s.refreshStream||(s.refreshStream=bt("benchmark",(j,x)=>{s.loading||y({runs:x?.snapshot?.runs||null})}))},L=async j=>{try{s.selectedRun=await K.benchmarkRun(j,!0),h()}catch(x){P(x.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},S=async j=>{!s.labelTouched&&j.elements.label&&(j.elements.label.value=Rs());let x=n(j);s.config=x;let R=Number(j.elements.suite_id?.value||0);if(!R){P("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await K.startBenchmarkRun({suite_id:R,config:x,actor:"anonymous"}),P("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=Rs(),s.labelTouched=!1,await y()}catch(W){P(W.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},A=async j=>{try{await K.stopBenchmarkRun(j),P("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await y()}catch(x){P(x.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},I=async j=>{let x=Number(j.dataset.resultId||0),R=new FormData(j),W={};for(let te of["correctness","grounding","citation","clarity","overall"]){let z=Number(R.get(`score_${te}`));Number.isFinite(z)&&(W[te]=z)}try{await K.reviewBenchmarkResult(x,{reviewer:"anonymous",scores:W,comment:String(R.get("comment")||"")}),P("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await K.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(x)),h()}catch(te){P(te.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},re=async j=>{if(j)try{let x=await K.benchmarkFingerprintHistory(j,50);s.history[j]=x.cases||[];let R=s.selectedRun,W=a();if(!R||!W)return;let te=(R.cases||[]).filter(z=>z.fingerprint===j);for(let z of te){let de=W.querySelector(`details.bench-case[data-result-id="${z.id}"]`);if(!de)continue;let xe=de.open;de.innerHTML=Hn(z,s.history[j]),de.open=xe,de._benchSignature=On(z,s.history[j])}}catch(x){P(x.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},Y=async j=>{let x=j.target.closest("[data-bench-action]");if(!x)return;let R=x.dataset.benchAction;R==="open-run"?await L(x.dataset.runId||""):R==="stop"?await A(x.dataset.runId||""):R==="fingerprint-history"&&await re(x.dataset.fingerprint||"")},we=async j=>{let x=j.target.closest("[data-bench-form]");x&&(j.preventDefault(),x.dataset.benchForm==="run"?await S(x):x.dataset.benchForm==="human"&&await I(x))},ge=j=>{j&&(j.elements.label&&j.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=n(j),j.elements.suite_id&&(s.selectedSuiteId=Number(j.elements.suite_id.value)||s.selectedSuiteId))},F=j=>{let x=j.target.closest('[data-bench-form="run"]');x&&ge(x)};return e.addEventListener("click",Y),e.addEventListener("submit",we),e.addEventListener("input",F),e.addEventListener("change",F),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=Rs();let j=a()?.querySelector('input[name="label"]');j&&(j.value=s.config.label)}_(),y({refreshAll:!s.referenceLoaded})},refresh(){return _(),y({refreshAll:!0})},destroy(){e.removeEventListener("click",Y),e.removeEventListener("submit",we),e.removeEventListener("input",F),e.removeEventListener("change",F),s.refreshStream&&s.refreshStream(),s.refreshStream=null,s.tickTimer&&window.clearInterval(s.tickTimer)}}}var Yn={};ls(Yn,{exportCsv:()=>Fa,exportableResult:()=>Oa,render:()=>Vc,renderReport:()=>Ia,reportError:()=>Ba,reportLoading:()=>na});var Hi=[10,25,50,100],Ci=500,mc=["law_name","law_level","law_category","law_modified_date","article_count"],gc=["jid","court_normalized","title","jdate","matched_laws","citation_count"],fc={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function Da(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function Ca(e,t){let s={};for(let a of e.fields||[]){let n=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?n:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{},fuzzyTerms:[]}}function bc(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,n]of Object.entries(s))if(Array.isArray(n)&&!n.map(String).includes(String(t[a]??"")))return!1;return!0}function Kn(e,t){return(e.fields||[]).filter(s=>bc(s,t))}function hc(e,t){return`filter-${e.id}-${t}`}function ys(e){return e==null?"":r(String(e))}function Un(e,t,s){let a=s[t.key],n=hc(e,t.key),i=t.help?`<span class="field-help">${r(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(m=>`<option value="${ys(m.value)}" ${String(m.value)===String(a??"")?"selected":""}>${r(m.label??m.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${n}" name="${r(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),m=(t.options||[]).map(f=>`<label class="multi-option">
          <input type="checkbox" name="${r(t.key)}" value="${ys(f.value)}" ${l.has(String(f.value))?"checked":""} />
          <span>${r(f.label??f.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${m}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${n}" name="${r(t.key)}"
        value="${ys(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${ys(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${n}" name="${r(t.key)}"
        value="${ys(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${n}" name="${r(t.key)}"
      value="${ys(a)}"
      placeholder="${ys(t.placeholder||"")}" />
    ${i}
  </div>`}function Pi(e,t,{focusTable:s=!1}={}){let a=Kn(e,t.values),n=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(n.push(`<div class="field-row">${Un(e,o,t.values)}${Un(e,l,t.values)}</div>`),i+=1):n.push(Un(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
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
  </form>`}function Pa(e,t,s){let a={...s.values};for(let n of Kn(t,a))if(n.type==="checkbox"){let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=!!i?.checked}else if(n.type==="multiselect")a[n.key]=Array.from(e.querySelectorAll(`[name="${n.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=i?i.value:""}return a}function zi(e,t){let s={};for(let a of Kn(e,t.values)){let n=t.values[a.key];a.type==="checkbox"?s[a.key]=!!n:a.type==="multiselect"?s[a.key]=Array.isArray(n)?n:[]:a.type==="number"?s[a.key]=n===""||n===null?"":Number(n):s[a.key]=n??""}return s}function Gn(e,t){let s=zi(e,t);return Array.isArray(t.fuzzyTerms)&&t.fuzzyTerms.length&&(s.keywords=[...t.fuzzyTerms]),(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function vc(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${De({tone:t,title:`${Da(e)} ${Ct(e.status).label}`,text:r(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function $c(e,t){return`<label class="field data-source-field">
    <span class="field-label">\u8CC7\u6599\u4F86\u6E90</span>
    <select class="select" name="database">
      ${e.map(s=>{let a=Ct(s.status);return`<option value="${r(s.id)}" ${s.id===t?"selected":""}>${r(s.label)} \xB7 ${r(a.label)}</option>`}).join("")}
    </select>
  </label>`}function Ii(e,t){return`<nav class="data-nav" aria-label="\u8CC7\u6599\u67E5\u8A62\u529F\u80FD">
    ${[{id:"law",label:"\u67E5\u8A62\u6CD5\u898F\u547D\u4EE4",hint:"Fuzzy \u6CD5\u898F\u540D\u7A31\u3001\u985E\u5225\u8207\u547D\u4EE4",icon:"file"},{id:"judgment",label:"\u67E5\u8A62\u5224\u6C7A",hint:"Fuzzy \u6CD5\u9662\u3001\u6848\u865F\u8207\u6848\u7531",icon:"layers"},{id:"schema",label:"\u8CC7\u6599\u5EAB Schema",hint:"\u8CC7\u6599\u8868\u3001\u6B04\u4F4D\u8207\u9810\u89BD",icon:"table"}].map(a=>{let n=a.id==="schema"?t==="schema":t==="query"&&e===a.id;return`<button class="data-nav-item${n?" is-active":""}" type="button"
          data-action="data-nav" data-tab="${a.id}" ${n?'aria-current="page"':""}>
          <span class="data-nav-icon">${g(a.icon,15)}</span>
          <span class="data-nav-copy">
            <strong>${r(a.label)}</strong>
            <small>${r(a.hint)}</small>
          </span>
        </button>`}).join("")}
  </nav>`}function yc(e,t,s){if(t.id!=="postgres"&&t.id!=="parquet")return"";let a=Array.isArray(s.fuzzyTerms)?s.fuzzyTerms:[],n=e==="law"?"Fuzzy \u6CD5\u898F\uFF0F\u547D\u4EE4":"Fuzzy \u5224\u6C7A",i=e==="law"?"\u8F38\u5165\u6CD5\u898F\u540D\u7A31\u6216\u76F8\u8FD1\u5B57\u2026":"\u8F38\u5165\u6CD5\u9662\u3001\u6848\u865F\u3001\u6848\u7531\u6216\u76F8\u8FD1\u5B57\u2026";return`<div class="data-fuzzy" data-data-fuzzy data-fuzzy-kind="${e}">
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
  </div>`}function Qn(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],n=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function wc(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||r(e.detail||"")}function _c(e){return`<div class="report-empty">
    ${ct({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:r({postgres:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u6CD5\u898F\u6216\u5224\u6C7A\u689D\u4EF6\uFF0C\u518D\u8996\u9700\u8981\u5C55\u958B\u9032\u968E metadata \u689D\u4EF6\u3002",parquet:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u689D\u4EF6\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\uFF1B\u53EF\u5C55\u958B\u9032\u968E\u689D\u4EF6\u8ABF\u6574\u6B04\u4F4D\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
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
  </div>`}function na(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(Da(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function Ba(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(Da(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${De({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${g("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function kc(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,n=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${r(s.label||"\u672A\u5206\u985E")}">${r(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${n.toFixed(1)}%"></span></span>
          <span class="dist-value">${c(a)}</span>
        </div>`}).join("")}
  </div>`}function Ui(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function Sc(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function xc(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function Ac(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${r(String(t))}"
    title="\u6AA2\u8996\u300C${r(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${r(String(t))}${g("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var qc={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function Mc(e,t,s,a=!1,n=!0,i=!1){let o=a?e.key:e.label||e.key,l=n?t?qc[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${r(o)}</th>`;let m=s?.key===l,f=m?s.direction:null,u=f==="asc"?"ascending":f==="desc"?"descending":"none",$=f==="asc"?"\u2191":f==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${u}">
    <button class="table-sort${m?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${r(l)}"
      title="\u4F9D${r(o)}\u6392\u5E8F">
      <span>${r(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${$}</span>
    </button>
  </th>`}function Lc(e,t){if(!Ui(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,n=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(n||""),lawName:String(t.law_name||"")}}function jc(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${r(s.lawKey)}"
    data-law-source="${r(s.sourceType)}"
    data-law-name="${r(s.lawName)}"
    title="\u6AA2\u8996\u300C${r(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(String(a))}${g("chevronRight",12,"law-link-icon")}</button>`}function Gi(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:n=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],m=(e.page-1)*e.page_size,f=Ui(e),u=Sc(e),$=xc(e),b=e.meta?.sort||null,d=n?`<tr class="schema-search-row">
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
      <span class="muted" style="font-size:10px">${c(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${f?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":u?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":$?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${d}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(h=>Mc(h,u,b,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((h,y)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${m+y+1}</td>
                ${o.map(_=>{if((u||$)&&_.key==="jid")return`<td class="cell-jid">${Ac(h)}</td>`;let L=f&&_.key==="law_name"?Lc(e,h):null;if(L)return`<td>${jc(h,_,L)}</td>`;let A={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[_.type];return`<td${A?` class="${A}"`:""}>${ya(h[_.key],_.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${ct({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function Tc(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Hi.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${g("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${g("chevronRight",13)}</button>
    </div>
  </div>`}function Qi(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${r(t)}</div>`).join("")}</div>`}function Ia(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],n=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",m=e.status||"ok",f=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${r(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${r(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${r(e.label||l)}
          ${Qe(m)}
          <span class="chip">${r(f)}</span>
        </div>
        <div class="report-sub">
          ${c(i)} \u7B46\u7B26\u5408 \xB7
          ${ue(e.duration_ms)} \xB7
          ${r(String(l).toUpperCase())} / ${r(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${g("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${g("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${De({tone:m==="not_configured"?"info":m==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:""}

    ${a.length?`<div class="summary-strip">
            ${a.slice(0,4).map(u=>`<div class="summary-item">
                  <div class="summary-label">${r(u.label)}</div>
                  <div class="summary-value">${r(u.value)}</div>
                </div>`).join("")}
          </div>`:""}

    <div class="report-grid">
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u7D50\u679C\u5206\u5E03</span>
          <span class="muted" style="font-size:9.5px">${n.length} groups</span>
        </div>
        ${kc(n)}
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
        ${Qi(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?Gi(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?Tc({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function Di(e){return`<div class="report-card schema-preview">
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
  </div>`}function Jn(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let n=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${De({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${r(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${r(t||e.table||"\u8CC7\u6599\u8868")}
          ${Qe(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${r(String(e.database||""))} / ${r(String(e.table||"\u2014"))} \xB7 ${n.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${Gi({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${Qi(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${c(i.length)} \u7B46</span>
      <strong>\u5171 ${c(e.total)} \u7B46</strong>
    </div>
  </div>`}function Bi(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${r(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${De({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function Nc(e){return`<div class="report-empty">
    ${ct({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${Da(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function Wn(e){return e.is_current===!0?Qe("ok","\u73FE\u884C"):e.law_abandon_note?Qe("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?Qe("empty","\u6B77\u53F2\u7248\u672C"):Qe("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function st(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${r(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function ws(e){return e?Rt(e):"\u2014"}function Ec(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function Vn(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${r(e)}</span>
    </div>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </div>`:""}function Rc(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${r(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${g("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </details>`:""}function Cc(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let n=a?.name||a?.url||"";return n?a.url?`<a class="law-attachment" href="${r(a.url)}" target="_blank" rel="noopener noreferrer">
          ${g("file",12)}<span>${r(n)}</span>${g("external",11)}
        </a>`:`<span class="law-attachment">${g("file",12)}<span>${r(n)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${c(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function Ji(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Pc(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,n=s?`${c(a)} \u689D \xB7 ${c(s)} \u7AE0\u7BC0`:`${c(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${r(l)}</div>`;let m=fc[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${r(Ji(o.article_no))}">
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
  </div>`}function Ic(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function Cs(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${g("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function Dc(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${Cs()}
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
  </div>`}function Bc(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${Cs()}
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
        ${De({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function Fc(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let n=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",n,a.article_count_for_law?`${c(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${r(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${r(i)}</option>`}).join("")}
    </select>
  </label>`}function Oc(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let n={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${n[o]} ${c(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
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
  </details>`}function Hc(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let n=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(y=>y.article_type!=="C").length,l=Ec(e),m=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",f=e.meta?.snapshot||"",u=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",$=[l,m,u,f].filter(Boolean).join(" \xB7 "),b=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",d=e.version||{},h=[st("\u6CD5\u898F\u4F4D\u968E",r(e.law_level||"\u2014")),st("\u6CD5\u898F\u985E\u5225",r(e.law_category||"\u2014")),st("\u7570\u52D5\u65E5\u671F",ws(e.law_modified_date)),st("\u751F\u6548\u65E5\u671F",ws(e.law_effective_date)),st("\u689D\u6587\u6578",c(e.article_count)),st("\u8CC7\u6599\u72C0\u614B",Wn(e)),st("\u82F1\u8B6F\u540D\u7A31",r(e.eng_law_name||"\u2014")),st("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${r(e.law_key||"\u2014")}</span>`)];return d.first_seen_version_id!==null&&d.first_seen_version_id!==void 0&&h.push(st("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${r(d.first_seen_version_id)}`)),d.last_seen_version_id!==null&&d.last_seen_version_id!==void 0&&h.push(st("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${r(d.last_seen_version_id)}`)),d.last_seen_at&&h.push(st("\u6700\u5F8C\u6536\u9304\u6642\u9593",r(ve(d.last_seen_at)))),d.selected_version_id!==null&&d.selected_version_id!==void 0&&h.push(st("\u689D\u6587\u7248\u672C",`#${r(d.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${Cs()}
      <span class="law-report-origin" title="${r($)}">${r($)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${r(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${r(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${r(i)}
            ${Wn(e)}
            <span class="chip">${r(b)}</span>
          </div>
          <div class="report-sub">
            ${r([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${c(e.article_count)} \u689D \xB7 \u7570\u52D5 ${ws(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${Fc(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">${g("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${n.length?`<div class="report-alert">${De({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n.map(y=>r(y)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${c(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${ws(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${r(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${Wn(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${r(l)}</span>
        </div>
        <div class="law-meta-grid">${h.join("")}</div>
      </div>

      ${Oc(e)}
      ${Vn("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${Rc("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${Vn("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${Vn("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${Cc(e.attachments)}
      ${Pc(e)}
    </div>
    ${o>100?Ic():""}
  </div>`}function zc(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Cs()}
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
  </div>`}function Uc(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Cs()}
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
        ${De({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function Gc(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${r(t)}"
    data-law-source=""
    data-law-name="${r(t)}"
    title="\u6AA2\u8996\u300C${r(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(t)}${g("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function Qc(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let n=String(s.article_no||"").trim();n&&t.get(a).add(n)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${Gc(s)}
          <span class="judgment-citation-articles">${[...a].map(n=>r(n)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function Jc(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",n=String(e.full_text||""),i=Number(e.full_text_length)||n.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[st("\u6848\u865F",r(e.jid||"\u2014")),st("\u5E74\u5EA6",r(e.jyear||"\u2014")),st("\u5B57\u5225",r(e.jcase||"\u2014")),st("\u865F\u78BC",r(e.jno||"\u2014")),st("\u6CD5\u9662",r(e.court||"\u2014")),st("\u6848\u7531",r(e.title||"\u2014")),st("\u88C1\u5224\u65E5\u671F",ws(e.jdate)),st("\u4F86\u6E90\u58D3\u7E2E\u6A94",r(e.source_archive||"\u2014")),st("\u5168\u6587\u9577\u5EA6",`${c(i)} \u5B57`),st("\u5F15\u7528\u6578",c(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(st("\u532F\u5165 Run",`#${r(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Cs()}
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
            ${r(e.court||"\u2014")} \xB7 ${ws(e.jdate)} \xB7
            ${c(i)} \u5B57
          </div>
        </div>
        <div class="report-actions">
          ${e.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(e.pdf_url)}" target="_blank" rel="noopener noreferrer">${g("external",14)}<span>PDF</span></a>`:""}
        </div>
      </div>

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u88C1\u5224\u65E5\u671F</div>
          <div class="summary-value">${ws(e.jdate)}</div>
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
        ${Qc(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${c(i)} \u5B57</span>
        </div>
        ${n?`<div class="judgment-fulltext">${r(n)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function Fi(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function Fa(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(Fi).join(",")],n=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([n+o+1,...t.map(l=>i[l.key])].map(Fi).join(","))}),`\uFEFF${a.join(`\r
`)}`}function Oa(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,n]of Object.entries(t))a.startsWith("_")||(s[a]=n);return s})}}function Wc(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function Oi(e,t){let s=performance.now(),a=zi(e,t),n=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,m=[],f=[],u=[],$=[];if(n==="audit_events"){try{let A=Number(await ms("audit.last_event_id",0))||0,I=await K.versioningAudit({since_id:A,limit:500}),re=Array.isArray(I?.events)?I.events:[];re.length&&await vi(re.map(we=>({...we,dataset:"judgment"})));let Y=Number(I?.latest_event_id||0);Y>A&&await sa("audit.last_event_id",Y)}catch(A){m.push(`\u7248\u672C audit \u540C\u6B65\u5931\u6557\uFF1A${A.message||A}`)}f=(await $i({keyword:i,limit:Ci})).map(A=>({created_at:A.created_at,dataset:A.dataset,issue_month:A.issue_month,change_type:A.change_type,jid:A.jid,detail:A.detail})),u=[{key:"created_at",label:"\u6642\u9593",type:"datetime"},{key:"dataset",label:"\u8CC7\u6599\u96C6",type:"text"},{key:"issue_month",label:"\u6708\u4EFD",type:"mono"},{key:"change_type",label:"\u8B8A\u66F4",type:"status"},{key:"jid",label:"\u6848\u865F",type:"mono"},{key:"detail",label:"\u6458\u8981",type:"longtext"}];let S=new Map;f.forEach(A=>S.set(A.change_type||"unknown",(S.get(A.change_type||"unknown")||0)+1)),$=Array.from(S.entries()).map(([A,I])=>({label:A,value:I})).sort((A,I)=>I.value-A.value)}else if(n==="settings"){f=(await wi({keyword:i})).map(A=>({key:A.key,value:_i(A.value),updated_at:A.updated_at})),u=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let S=new Map;f.forEach(A=>{let I=String(A.key||"").split(".")[0]||"\u5176\u4ED6";S.set(I,(S.get(I)||0)+1)}),$=Array.from(S.entries()).map(([A,I])=>({label:A,value:I})).sort((A,I)=>I.value-A.value)}else{f=(await Ta({keyword:i,limit:Ci})).map(A=>({kind:Wc(A.kind),title:A.title,detail:A.detail,created_at:A.created_at})),u=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let S=new Map;f.forEach(A=>S.set(A.kind,(S.get(A.kind)||0)+1)),$=Array.from(S.entries()).map(([A,I])=>({label:A,value:I})).sort((A,I)=>I.value-A.value)}let b=f.length,d=(o-1)*l,h=f.slice(d,d+l),y=Math.round(performance.now()-s),_=fi();return _&&m.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:_?"degraded":"ok",message:_?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:n,columns:u,rows:h,total:b,page:o,page_size:l,duration_ms:y,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(b)},{label:"\u76EE\u524D\u9801\u9762",value:`${h.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:Zs()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${y} ms`}],distribution:$,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${n}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${d}`,warnings:m,meta:{store:n,filters:a,client_side:!0}}}async function Vc(e,t){let s=!1,a=null,n=[],i="law",o=null,l={},m=0,f=25,u="query",$=null,b=null,d=0,h=[],y=null,_=-1,L=0,S=0,A=null,I=null,re=null;e.innerHTML=`<section class="page data-page">
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
      ${Kt(null,{loading:!0})}
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
  </section>`;let Y=e.querySelector("#query-sidebar"),we=e.querySelector("#data-nav"),ge=e.querySelector("#db-options-wrap"),F=e.querySelector("#filter-area"),j=e.querySelector("#schema-area"),x=e.querySelector("#query-main"),R=e.querySelector("#schema-suggest-popover"),W=e.querySelector("#catalog-meta"),te=e.querySelector("#refresh-catalog"),z=e.querySelector("#data-judgment-stats"),de=q=>n.find(T=>T.id===q),xe=()=>de(i)?.databases||[],D=q=>xe().find(T=>T.id===q),ke=(q,T)=>`${q}:${T}`,se=(q,T=i)=>l[ke(T,q.id)],je=(q,T)=>{sa(q,T).catch(()=>{})},_e=()=>{if(!a){W.textContent="CATALOG \xB7 \u96E2\u7DDA",W.className="badge badge-danger badge-mono";return}let q=xe(),T=q.filter(B=>B.available).length,N=de(i);W.textContent=`CATALOG \xB7 ${N?.label||i} \xB7 ${T}/${q.length} \u53EF\u7528`,W.className="badge badge-neutral badge-mono"},oe=q=>{x.innerHTML=_c(q)},ie=()=>{let q=I?.returnScroll??re?.returnScroll;I=null,re=null;let T=D(o),N=T?se(T):null;u==="schema"&&b?.result?x.innerHTML=Jn(b.result,Pe(T,b.tableId),{columnFilters:b.columnFilters||{},searchEnabled:T.id==="postgres"||T.id==="parquet"}):N?.result?x.innerHTML=Ia(N.result):T&&oe(T),typeof q=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:q,behavior:"smooth"}))},he=(q="law-article-jump")=>{let T=x.querySelector(`#${q}`),N=Ji(T?.value);if(!N){P("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),T?.focus();return}let Z=[...x.querySelectorAll("[data-article-no]")].find(ae=>ae.dataset.articleNo===N);if(!Z){P(`\u627E\u4E0D\u5230\u7B2C ${N} \u689D\u3002`,"warn");return}Z.scrollIntoView({behavior:"instant",block:"center"}),Z.classList.add("is-jump-target"),window.setTimeout(()=>Z.classList.remove("is-jump-target"),2400)},fe=async({lawKey:q,sourceType:T="",lawName:N="",versionId:B=""})=>{let Z=D(o),ae=Z?se(Z):null,pe=u==="schema"?b?.result:null;if(!Z||!ae?.result&&!pe||!q)return;let Te=++m;I={seq:Te,lawKey:q,sourceType:T,lawName:N,versionId:B?String(B):"",page:1,detail:null,database:Z.id,returnScroll:window.scrollY},re=null,x.innerHTML=Dc(N||q),x.scrollIntoView({behavior:"smooth",block:"start"});try{let Be=await K.lawDetail(q,T,I.versionId);if(s||!I||I.seq!==Te)return;I.detail=Be,I.page=1,x.innerHTML=Hc(Be,{database:I.database,lawPage:I.page})}catch(Be){if(s||!I||I.seq!==Te)return;x.innerHTML=Bc(Be,N||q),P(Be.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},Ae=async({jid:q})=>{let T=D(o),N=T?se(T):null,B=u==="schema"?b?.result:null;if(!T||!N?.result&&!B||!q)return;let Z=++m;I=null;let ae=T.id==="parquet"?"parquet":"postgres";re={seq:Z,jid:q,detail:null,database:T.id,source:ae,returnScroll:window.scrollY},x.innerHTML=zc(q),x.scrollIntoView({behavior:"smooth",block:"start"});try{let pe=await K.judgmentDetail(q,ae);if(s||!re||re.seq!==Z)return;re.detail=pe,x.innerHTML=Jc(pe,{database:re.database})}catch(pe){if(s||!re||re.seq!==Z)return;x.innerHTML=Uc(pe,q),P(pe.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},$e=(q,T)=>`${i}:${q.id}:${T}`,Pe=(q,T)=>(q.tables||[]).find(N=>N.id===T)?.label||T,Ue=(q,T,{sort:N=null,columnFilters:B={}}={})=>{let Z={column_filters:B};return q.id==="postgres"?(Z.table=T,Z.schema_preview=!0):q.id==="parquet"&&i==="judgment"?(Z.table="judgment_documents",Z.columns=gc):q.id==="parquet"&&(Z.dataset="all",Z.columns=mc),N?.key&&(Z.sort=`${N.key}:${N.direction}`),Z},C=async(q,T,{sort:N=null,columnFilters:B={},quiet:Z=!1}={})=>{if(!T)return;Ye();let ae=$e(q,T),pe=++d,Te=!!(Z&&b?.result&&b.key===ae);$={tableId:T},b={key:ae,tableId:T,loading:!0,result:null,error:null,sort:N,columnFilters:B},Te?x.setAttribute("aria-busy","true"):(j.innerHTML=Qn(q,de(i)?.label||i,T),x.innerHTML=Di(Pe(q,T)));try{let Be;if(q.id==="indexeddb"){let Ne=Ca(q,10);Ne.values.store=T,Ne.page=1,Be=await Oi(q,Ne)}else q.id==="qdrant"?Be={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:T,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(Be=await K.query({database:q.id,filters:Ue(q,T,{sort:N,columnFilters:B}),page:1,pageSize:10}),N?.key&&(Be.meta={...Be.meta||{},sort:N}));if(s||pe!==d)return;b={key:ae,tableId:T,loading:!1,result:Be,error:null,sort:N,columnFilters:B},x.removeAttribute("aria-busy"),u==="schema"&&$?.tableId===T&&(j.innerHTML=Qn(q,de(i)?.label||i,T),x.innerHTML=Jn(Be,Pe(q,T),{columnFilters:B,searchEnabled:q.id==="postgres"||q.id==="parquet"}))}catch(Be){if(s||pe!==d)return;b={key:ae,tableId:T,loading:!1,result:null,error:Be,sort:N,columnFilters:B},x.removeAttribute("aria-busy"),u==="schema"&&$?.tableId===T&&(x.innerHTML=Bi(Be,Pe(q,T)))}},O=()=>{let q=D(o);if(!q)return null;if(u==="schema"&&b?.result)return{db:q,tableId:b.tableId,columnFilters:b.columnFilters||{},sort:b.sort||null,mode:"schema"};let T=q?se(q):null,N=T?.result;return N&&(q.id==="postgres"||q.id==="parquet")?{db:q,tableId:N.table,columnFilters:T.columnFilters||{},sort:T.sort||null,mode:"query"}:null},k=(q,T,N)=>{if(!q)return;let B=`${q.db.id}:${q.tableId}:${T}`,Z=E.get(B);Z&&(window.clearTimeout(Z),E.delete(B)),Ye();let ae={...q.columnFilters||{}},pe=String(N||"").trim();if(pe?ae[T]=pe:delete ae[T],q.mode==="schema"){C(q.db,q.tableId,{sort:q.sort,columnFilters:ae,quiet:!0});return}let Te=se(q.db);Te.columnFilters=ae,Te.page=1,Ke(1)},E=new Map,X=()=>{(!R||R.hidden)&&!h.length&&!y||(L+=1,h=[],y=null,_=-1,R&&(R.hidden=!0,R.innerHTML=""))},H=(q,T)=>{let N=String(q||""),B=N.toLocaleLowerCase(),Z=String(T||"").toLocaleLowerCase(),ae=new Array(N.length).fill(!1),pe=(Oe,et)=>{for(let nt=Oe;nt<Oe+et;nt+=1)nt>=0&&nt<ae.length&&(ae[nt]=!0)},Te=B.indexOf(Z);if(Te>=0)for(;Te>=0;)pe(Te,Z.length),Te=B.indexOf(Z,Te+Z.length);else{let Oe=[];for(let et of Z.match(/[一-鿿]{2,}/g)||[])for(let nt=0;nt<et.length-1;nt+=1)Oe.push(et.slice(nt,nt+2));Oe.push(...Z.match(/[a-z0-9]+/g)||[]);for(let et of Oe){let nt=B.indexOf(et);for(;nt>=0;)pe(nt,et.length),nt=B.indexOf(et,nt+et.length)}}let Be="",Ne=0;for(;Ne<N.length;)if(ae[Ne]){let Oe=Ne;for(;Oe<N.length&&ae[Oe];)Oe+=1;Be+=`<mark>${r(N.slice(Ne,Oe))}</mark>`,Ne=Oe}else{let Oe=Ne;for(;Oe<N.length&&!ae[Oe];)Oe+=1;Be+=r(N.slice(Ne,Oe)),Ne=Oe}return Be||r(N)},Re=(q,T)=>{if(!R)return;let N=q.getBoundingClientRect(),B=Math.min(420,Math.max(220,N.width)),Z=Math.min(360,34+T*30),ae=N.bottom+4;ae+Z>window.innerHeight-8&&(ae=Math.max(8,N.top-Z-4));let pe=Math.min(window.innerWidth-B-8,Math.max(8,N.left));R.style.width=`${B}px`,R.style.left=`${pe}px`,R.style.top=`${ae}px`},Ce=q=>{if(!R)return;let T=[...R.querySelectorAll(".schema-suggest-item")];T.length&&(_=Math.max(0,Math.min(T.length-1,q)),T.forEach((N,B)=>{N.classList.toggle("is-active",B===_)}),T[_].scrollIntoView({block:"nearest"}))},Ie=q=>{let T=h[q],N=y;!T||!N||(X(),k(N,N.column,T))},Fe=async(q,T,N,B)=>{if(!q||!N.trim()){X();return}let Z=++L;y={...q,column:T,input:B},_=-1;try{let ae=await K.schemaSuggest({database:q.db.id,table:q.tableId,column:T,query:N,limit:1e3});if(Z!==L||document.activeElement!==B||!R)return;let pe=Array.isArray(ae.values)?ae.values:[];if(h=pe,!pe.length){X();return}let Te=Number(ae.total)>pe.length?`\u5171 ${c(ae.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${c(pe.length)} \u500B`:`\u5171 ${c(ae.total)} \u500B\u7B26\u5408`;R.innerHTML=`<div class="schema-suggest-head">${r(Te)}</div>${pe.map((Be,Ne)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${Ne}"
            title="${r(Be)}">${H(Be,N)}</button>`).join("")}`,Re(B,pe.length),R.hidden=!1}catch{X()}},Ye=()=>{let q=document.activeElement;q instanceof HTMLElement&&q.matches("[data-schema-search]")&&q.blur(),X()},We=(q,{resetReport:T=!1}={})=>{Ye();let N=se(q);if(we.innerHTML=Ii(i,u),ge.innerHTML=$c(xe(),q.id),u==="schema")F.hidden=!0,F.innerHTML="",j.hidden=!1,j.innerHTML=`<div class="schema-category-switch" role="tablist" aria-label="Schema \u985E\u5225">
        ${["law","judgment"].map(B=>{let Z=n.find(ae=>ae.id===B);return Z?`<button class="chip${i===B?" is-active":""}" type="button" role="tab" aria-selected="${i===B}" data-action="schema-category" data-category="${B}">${r(Z.label)}</button>`:""}).join("")}
      </div>${Qn(q,de(i)?.label||i,$?.tableId||"")}`;else{j.hidden=!0,j.innerHTML="",F.hidden=!1;let B=yc(i,q,N),Z=Pi(q,N);F.innerHTML=`${vc(q)}${B?`${B}<details class="data-advanced"><summary>\u9032\u968E metadata \u689D\u4EF6</summary>${Z}</details>`:Z}<div class="sidebar-note">${wc(q)}</div>`}if(_e(),u==="schema"){let B=$?$e(q,$.tableId):"";if(b&&b.key===B){let Z=Pe(q,b.tableId);b.loading?x.innerHTML=Di(Z):b.error?x.innerHTML=Bi(b.error,Z):x.innerHTML=Jn(b.result,Z,{columnFilters:b.columnFilters||{},searchEnabled:q.id==="postgres"||q.id==="parquet"})}else x.innerHTML=Nc(q);return}T?oe(q):N.result?x.innerHTML=Ia(N.result):oe(q)},it=(q,{persist:T=!0,resetReport:N=!1}={})=>{let B=xe(),Z=B.find(pe=>pe.id===q)||B[0];if(!Z)return;I=null,re=null,$=null,b=null,d+=1,o=Z.id;let ae=ke(i,Z.id);l[ae]||(l[ae]=Ca(Z,f)),We(Z,{resetReport:N}),T&&(je(`data.last_database.${i}`,Z.id),je("data.last_category",i))},_t=(q,{persist:T=!0,resetReport:N=!0,databaseId:B=null}={})=>{let Z=de(q)||n[0];if(!Z)return;i=Z.id,I=null,re=null;let ae=Z.databases||[],pe=B&&ae.find(Te=>Te.id===B)||ae.find(Te=>Te.id===o)||ae[0];if(o=pe?.id||null,!pe){we.innerHTML=Ii(i,u),ge.innerHTML=`<div class="sidebar-notice">${De({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,F.innerHTML="",_e();return}it(pe.id,{persist:!1,resetReport:N}),T&&(je("data.last_category",Z.id),je(`data.last_database.${Z.id}`,pe.id))},jt=q=>{let T=se(q),N=F.querySelector("#data-filter-form");N&&(T.values=Pa(N,q,T))},Ke=async(q=null,{quiet:T=!1}={})=>{let N=D(o);if(!N)return;Ye();let B=se(N);jt(N),q!==null&&(B.page=q),(!Number.isFinite(B.page)||B.page<1)&&(B.page=1);let Z=++m;I=null,re=null;let ae=x.querySelector(".report-card"),pe=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!ae?x.setAttribute("aria-busy","true"):(x.removeAttribute("aria-busy"),x.innerHTML=na(N));let Be=F.querySelector("#run-query");T||Me(Be,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Ne;if(N.id==="indexeddb"?Ne=await Oi(N,B):Ne=await K.query({database:N.id,filters:Gn(N,B),page:B.page,pageSize:B.pageSize}),s||Z!==m)return;if(Ne.meta={...Ne.meta||{},column_filters:B.columnFilters||{},searchable:N.id==="postgres"||N.id==="parquet",sort:B.sort||Ne.meta?.sort||null},B.result=Ne,B.page=Number(Ne.page)||B.page,B.pageSize=Number(Ne.page_size)||B.pageSize,x.removeAttribute("aria-busy"),x.innerHTML=Ia(Ne),pe!==null){let et=x.querySelector("[data-page-size]");et&&(et.value=String(B.pageSize),et.focus({preventScroll:!0}))}let Oe=de(i)?.label||i;await ea({kind:"data",title:`${Oe} \xB7 ${N.label} \xB7 ${Ne.table||Ne.label||"query"}`,detail:`${c(Ne.total)} \u7B46 \xB7 ${ue(Ne.duration_ms)}`,payload:{category:i,database:N.id,filters:Gn(N,B),page:B.page,page_size:B.pageSize}}),je("data.last_query",{category:i,database:N.id,filters:Gn(N,B),page:B.page,page_size:B.pageSize,at:new Date().toISOString()})}catch(Ne){if(s||Z!==m)return;x.removeAttribute("aria-busy"),x.innerHTML=Ba(Ne,N),P(Ne.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&Z===m&&Me(Be,!1)}},mt=(q,T)=>{let N=q?.querySelector("[data-data-fuzzy-results]");N&&(N.innerHTML=T.length?T.map(B=>`<button class="data-fuzzy-option" type="button" role="option" data-action="select-fuzzy-term" data-term="${r(B.value)}"><span>${r(B.label||B.value)}</span><small>${r(B.meta||"")}</small></button>`).join(""):'<div class="data-fuzzy-empty">\u6C92\u6709\u76F8\u8FD1\u7D50\u679C\uFF1B\u6309 Enter \u53EF\u76F4\u63A5\u52A0\u5165\u76EE\u524D\u8F38\u5165\u7684\u95DC\u9375\u5B57\u3002</div>')},Bt=async(q,T="")=>{if(!q)return;let N=D(o),B=N?se(N):null;if(!B)return;let Z=q.dataset.fuzzyKind||i,ae=q.querySelector("[data-data-fuzzy-results]"),pe=++S;ae&&(ae.innerHTML='<div class="data-fuzzy-loading"><span class="spinner"></span><span>\u641C\u5C0B\u76F8\u8FD1\u7D50\u679C\u2026</span></div>');try{let Te=await K.dataSuggest({kind:Z,query:T,limit:12});if(pe!==S)return;let Be=(Te.suggestions||[]).filter(Ne=>!B.fuzzyTerms.includes(Ne.value));mt(q,Be)}catch(Te){if(pe!==S)return;ae&&(ae.innerHTML=`<div class="data-fuzzy-empty">${r(Te.message||"\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},ne=(q,{focus:T=!1}={})=>{if(!q)return;let N=q.querySelector("[data-data-fuzzy-popover]"),B=q.querySelector("[data-data-fuzzy-search]");!N||!B||(N.hidden&&(N.hidden=!1,B.value="",Bt(q,"")),T&&(B.focus(),B.select()))},ye=q=>{A&&(window.clearTimeout(A),A=null);let T=q?.querySelector("[data-data-fuzzy-popover]");T&&(T.hidden=!0)},Je=async q=>{let T=D(o);if(!T)return;let N=se(T),B=String(q||"").trim();!B||N.fuzzyTerms.includes(B)||(N.fuzzyTerms=[...N.fuzzyTerms,B],ye(F.querySelector("[data-data-fuzzy]")),We(T),await Ke(1))},Ze=async q=>{let T=D(o);if(!T)return;let N=se(T),B=String(q||"").trim();N.fuzzyTerms=N.fuzzyTerms.filter(Z=>Z!==B),We(T),await Ke(1)},Ft=async()=>{te.disabled=!0,Me(te,!0,"\u6574\u7406\u4E2D\u2026");try{let[q,T,N,B,Z]=await Promise.all([K.catalog(),ms("data.last_category","law"),ms("data.last_database.law","postgres"),ms("data.last_database.judgment","postgres"),ms("data.page_size",25)]);if(s)return;a=q,z&&(z.innerHTML=Kt(a.judgment_stats)),n=Array.isArray(a.categories)?a.categories:[],f=Hi.includes(Number(Z))?Number(Z):25;for(let Ne of n)for(let Oe of Ne.databases||[]){let et=ke(Ne.id,Oe.id);l[et]||(l[et]=Ca(Oe,f))}let ae=n.find(Ne=>Ne.id===T)||n[0];if(!ae){we.innerHTML="",ge.innerHTML=`<div class="sidebar-notice">${De({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let pe=ae.id==="judgment"?B:N;if(i=ae.id,o=null,_t(ae.id,{persist:!1,resetReport:!0,databaseId:pe}),s)return;let Te=D(o),Be=Te?se(Te):null;Te&&Be&&u==="query"&&!Be.result&&(Te.id==="postgres"||Te.id==="parquet")&&Ke(1),P("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(q){if(s)return;a=null,n=[],we.innerHTML="",z&&(z.innerHTML=Kt(null)),_e(),ge.innerHTML=`<div class="sidebar-notice">${De({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:r(q.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${g("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,x.innerHTML=`<div class="report-empty">${ct({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(te.disabled=!1,Me(te,!1))}};Y.addEventListener("change",q=>{let T=q.target;if(T.name==="category"){_t(T.value);return}if(T.name==="database"){it(T.value);let ae=D(o),pe=ae?se(ae):null;ae&&pe&&!pe.result&&u==="query"&&(ae.id==="postgres"||ae.id==="parquet")&&Ke(1);return}let N=D(o);if(!N)return;let B=se(N),Z=F.querySelector("#data-filter-form");!Z||!T.name||(B.values=Pa(Z,N,B),B.page=1,T.name==="table"&&(I=null,re=null,B.sort=null,B.columnFilters={},B.result=null,F.innerHTML=Pi(N,B),oe(N)))}),Y.addEventListener("input",q=>{let T=q.target.closest("[data-data-fuzzy-search]");if(T){let ae=T.closest("[data-data-fuzzy]");A&&window.clearTimeout(A),A=window.setTimeout(()=>{Bt(ae,T.value)},160);return}let N=D(o);if(!N)return;let B=F.querySelector("#data-filter-form");if(!B||!q.target.name||q.target.name==="table")return;let Z=se(N);Z.values=Pa(B,N,Z)}),Y.addEventListener("keydown",q=>{let T=q.target.closest("[data-data-fuzzy-search]");if(!T)return;let N=T.closest("[data-data-fuzzy]");if(q.key==="Escape")q.preventDefault(),ye(N),T.blur();else if(q.key==="Enter"){q.preventDefault();let B=N?.querySelector("[data-action='select-fuzzy-term']");B?B.click():Je(T.value)}else q.key==="ArrowDown"&&(q.preventDefault(),N?.querySelector("[data-action='select-fuzzy-term']")?.focus())}),Y.addEventListener("mouseover",q=>{let T=q.target.closest("[data-action='open-fuzzy']");T&&ne(T.closest("[data-data-fuzzy]"))}),Y.addEventListener("mouseout",q=>{let T=q.target.closest("[data-data-fuzzy]");T&&(q.relatedTarget&&T.contains(q.relatedTarget)||ye(T))}),Y.addEventListener("submit",q=>{q.target.id==="data-filter-form"&&(q.preventDefault(),Ke(1))}),Y.addEventListener("click",async q=>{let T=F.querySelector("[data-data-fuzzy] [data-data-fuzzy-popover]:not([hidden])")?.closest("[data-data-fuzzy]");T&&!q.target.closest("[data-data-fuzzy]")&&ye(T);let N=q.target.closest("[data-action]"),B=N?.dataset.action;if(B==="data-nav"){let Z=N.dataset.tab,ae=D(o);if(Z==="schema"){if(u!=="schema"){if(ae){let Ne=se(ae),Oe=F.querySelector("#data-filter-form");Oe&&(Ne.values=Pa(Oe,ae,Ne))}u="schema",ae&&We(ae)}return}let pe=Z==="judgment"?"judgment":"law";u==="schema"&&(u="query"),i!==pe?_t(pe,{databaseId:o,resetReport:!1}):ae&&We(ae);let Te=D(o),Be=Te?se(Te):null;Te&&Be&&!Be.result&&(Te.id==="postgres"||Te.id==="parquet")&&Ke(1);return}if(B==="open-fuzzy"){ne(N.closest("[data-data-fuzzy]"),{focus:!0});return}if(B==="select-fuzzy-term"){await Je(N.dataset.term);return}if(B==="remove-fuzzy-term"){await Ze(N.dataset.term);return}if(B==="schema-category"){u="schema",_t(N.dataset.category||"law",{resetReport:!0});return}if(B==="select-schema-table"){let Z=D(o);if(!Z)return;C(Z,N.dataset.tableId||"");return}if(B==="reset"){let Z=D(o);if(!Z)return;I=null,re=null;let ae=se(Z);l[ke(i,Z.id)]=Ca(Z,ae.pageSize),We(Z),oe(Z),P("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}q.target.closest("#catalog-retry")&&Ft()}),x.addEventListener("input",q=>{let T=q.target.closest("[data-schema-search]");if(!T)return;let N=O();if(!N)return;let B=T.dataset.schemaSearch||"",Z=T.value,ae=`${N.mode}:${N.db.id}:${N.tableId}:${B}`,pe=E.get(ae);if(pe&&window.clearTimeout(pe),!Z.trim()){E.delete(ae),X(),k(N,B,"");return}let Te=window.setTimeout(()=>{E.delete(ae),Fe(N,B,Z,T)},250);E.set(ae,Te)}),x.addEventListener("keydown",q=>{let T=q.target.closest("[data-schema-search]");if(!T)return;let N=O();if(N){if(q.key==="Escape"){X();return}if(q.key==="ArrowDown"||q.key==="ArrowUp"){if(!R||R.hidden)return;q.preventDefault();let B=q.key==="ArrowDown"?1:-1;Ce(_<0?B>0?0:h.length-1:_+B);return}if(q.key==="Enter"){if(q.preventDefault(),R&&!R.hidden&&_>=0){Ie(_);return}k(N,T.dataset.schemaSearch||"",T.value)}}}),R?.addEventListener("mousedown",q=>{q.preventDefault()}),R?.addEventListener("click",q=>{let T=q.target.closest("[data-schema-suggest-index]");T&&Ie(Number(T.dataset.schemaSuggestIndex))});let Ot=q=>{q.target.closest("[data-schema-search]")||R?.contains(q.target)||X()};return document.addEventListener("click",Ot),window.addEventListener("scroll",X,{capture:!0,passive:!0}),window.addEventListener("resize",X),x.addEventListener("keydown",q=>{q.target.matches(".law-jump-input")&&q.key==="Enter"&&(q.preventDefault(),he(q.target.id))}),x.addEventListener("click",async q=>{let T=q.target.closest("[data-action]");if(!T)return;let N=T.dataset.action,B=D(o),Z=B?se(B):null,ae=Z?.result;if(N==="back-to-results"){ie();return}if(N==="open-law"){fe({lawKey:T.dataset.lawKey||"",sourceType:T.dataset.lawSource||"",lawName:T.dataset.lawName||""});return}if(N==="open-judgment"){Ae({jid:T.dataset.jid||""});return}if(N==="jump-article"){he(T.dataset.jumpInput||"law-article-jump");return}if(N==="sort-column"){let pe=T.dataset.sortKey||"";if(!pe||!B)return;if(u==="schema"&&b?.result){let Ne=b.sort,Oe=pe==="jdate"||pe==="law_modified_date"||pe==="article_count"||pe==="citation_count"||pe==="full_text_length"||pe==="created_at"||pe==="updated_at",et=Ne?.key===pe?Ne.direction==="asc"?"desc":"asc":Oe?"desc":"asc";C(B,b.tableId,{sort:{key:pe,direction:et},columnFilters:b.columnFilters||{},quiet:!0});return}if(!Z)return;let Te=Z.sort,Be=Te?.key===pe?Te.direction==="asc"?"desc":"asc":pe==="jdate"?"desc":"asc";Z.sort={key:pe,direction:Be},Ke(1,{quiet:!0});return}if(N==="retry"){Ke(Z?.page||1);return}if(ae){if(N==="prev-page"){Ke(Math.max(1,Number(ae.page)-1),{quiet:!0});return}if(N==="next-page"){let pe=Math.max(1,Math.ceil(Number(ae.total)/Number(ae.page_size)));Ke(Math.min(pe,Number(ae.page)+1),{quiet:!0});return}if(N==="copy-query"){let pe=await Ms(ae.query_text||"");P(pe?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",pe?"ok":"warn");return}if(N==="export-json"){let pe=`${ae.database}-${ae.table||"query"}-page-${ae.page}.json`;Pt(pe,JSON.stringify(Oa(ae),null,2),"application/json;charset=utf-8"),P(`\u5DF2\u532F\u51FA ${pe}`,"ok");return}if(N==="export-csv"){let pe=`${ae.database}-${ae.table||"query"}-page-${ae.page}.csv`;Pt(pe,Fa(ae),"text/csv;charset=utf-8"),P(`\u5DF2\u532F\u51FA ${pe}`,"ok")}}}),x.addEventListener("change",q=>{let T=q.target.closest("[data-action='select-law-version']");if(T&&I){fe({lawKey:I.lawKey,sourceType:I.sourceType,lawName:I.lawName,versionId:T.value});return}if(!q.target.matches("[data-page-size]"))return;let N=D(o);if(!N)return;let B=se(N);B.pageSize=Number(q.target.value)||25,B.page=1,je("data.page_size",B.pageSize),Ke(1,{quiet:!0})}),te.addEventListener("click",()=>{Ft()}),await Ft(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0,A&&window.clearTimeout(A);for(let q of E.values())window.clearTimeout(q);E.clear(),X(),document.removeEventListener("click",Ot),window.removeEventListener("scroll",X,{capture:!0}),window.removeEventListener("resize",X)}}var eo=[10,25,50,100],Kc=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function Xn(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function Yc(e,t=e){return`<option value="${r(e)}">${r(t)}</option>`}function ra(e,t,s,a,n=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${r(t)}</span>
      <span class="field-tag">${r(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${r(e)}">
      ${Yc("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${r(i)}" ${String(i)===String(a)?"selected":""}>${r(i)}</option>`).join("")}
    </select>
    ${n?`<span class="field-help">${r(n)}</span>`:""}
  </div>`}function Xc(e,t){let s=Kc.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${ra("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${ra("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${ra("model","\u6A21\u578B",e.models||[],t.model)}
    ${ra("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${ra("method","\u65B9\u6CD5",e.methods||[],t.method)}
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
    </div>`}function Wi(){let e=document.getElementById("performance-filter-form");if(!e)return Xn();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Vi(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function Ki(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),n=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${n}.${i}`}function Zc(e,t){if(!e)return"";let s=new Date(e);return Number.isNaN(s.getTime())?"":new Date(s.getTime()+Math.max(0,Number(t)||0)).toISOString()}var ed=[{key:"parsing",label:"Parsing",hint:"\u8F38\u5165\u9577\u5EA6\u3001\u89E3\u6790\u6642\u9593",names:["rag.parse_question"],color:"#64748b"},{key:"embedding",label:"Embedding",hint:"Model\u3001Token\u3001Batch\u3001\u8017\u6642",names:["rag.embed_query"],color:"#3984c6"},{key:"qdrant",label:"Qdrant Search",hint:"Collection\u3001Filter\u3001Top K\u3001\u8017\u6642",names:["rag.qdrant_search"],color:"#d97706"},{key:"reranker",label:"Reranker",hint:"Model\u3001\u5019\u9078\u7B46\u6578\u3001\u8017\u6642",names:["rag.rerank"],color:"#8b5cf6"},{key:"context",label:"Context",hint:"Chunk \u6578\u3001Token \u6578\u3001\u8017\u6642",names:["rag.context"],fallbackNames:["rag.fetch_documents","rag.build_citations"],color:"#64748b"},{key:"llm",label:"LLM",hint:"Model\u3001Input/Output Token\u3001TTFT\u3001\u8017\u6642",names:["rag.llm_request"],color:"#16a34a"}],za={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"};function to(e){let t=e?.metadata?.rag_response||{},s=String(t.status||e?.metadata?.rag_status||e?.status||"");return s==="operational"||s==="success"?{label:"Completed",tone:"ok"}:s==="retrieval_only"?{label:"Abstain",tone:"warn"}:s==="preview"?{label:"Preview",tone:"info"}:s==="failed"||s==="error"?{label:"Failed",tone:"danger"}:{label:s||"Unknown",tone:"idle"}}function Zn(e){let t=Math.max(0,Number(e?.offset_ms)||0),s=Math.max(0,Number(e?.duration_ms)||0),a=Math.max(t,Number(e?.end_offset_ms)||t+s);return{...e,offset:t,end:a,duration:Math.max(s,a-t)}}function so(e,t=0){let s=Array.isArray(e?.segments)?[...e.segments].sort((u,$)=>Number(u.offset_ms||0)-Number($.offset_ms||0)):[],a=Math.max(Number(e?.total_ms)||0,Number(t)||0,...s.map(u=>Zn(u).end),1),n=ed.map(u=>{let $=s.filter(y=>u.names.includes(y.name));!$.length&&u.fallbackNames&&($=s.filter(y=>u.fallbackNames.includes(y.name)));let b=$.map(Zn),d=b.length?Math.min(...b.map(y=>y.offset)):null,h=b.length?Math.max(...b.map(y=>y.end)):null;return{...u,spans:b,start:d,end:h,duration:d===null?null:h-d}});for(let u of n){if(u.key!=="embedding"&&u.key!=="llm")continue;let $=[];for(let h of u.spans){let y=h.metadata||{},_=Number(y.load_duration_ms),L=Number.isFinite(_)&&_>0?_:0,S=Math.max(0,Number(h.duration)||0);$.push({...h,offset:h.offset,end:h.offset+L,duration:L,metadata:{...y,source_stage:u.label,model_load_ms:L,request_duration_ms:S,warm_duration_ms:Math.max(0,S-L),cold_start:L>=100},params:{...h.params||{},source_stage:u.label}})}if(!$.length)continue;let b=$.reduce((h,y)=>h+y.duration,0),d=u.spans.reduce((h,y)=>h+Math.max(0,Number(y.duration)||0),0);u.loadInfo={spans:$,total:b,requestTotal:d,ratio:d>0?Math.min(1,Math.max(0,b/d)):0}}let i=[...n],o=Math.max(0,...i.flatMap(u=>u.spans.map($=>$.end))),l=e?.metadata?.rag_response||{},m=to(e),f=Math.min(a,o);return i.push({key:"response",label:"Response",hint:"\u7E3D\u8017\u6642\u3001\u5F15\u7528\u6578\u3001\u6210\u529F\u6216 Abstain",color:"#0f766e",spans:[{offset:f,end:a,duration:Math.max(0,a-f),status:m.tone==="danger"?"error":"ok",metadata:l,params:{},started_at:e?.started_at,finished_at:e?.finished_at}],start:f,end:a,duration:Math.max(0,a-f),responseMetadata:l}),td(i,a),{total:a,stages:i,response:l,traceStatus:m,requestId:e?.request_id||"",startedAt:e?.started_at,finishedAt:e?.finished_at,client:e?.client||{},models:Array.isArray(e?.summary?.models)?e.summary.models:[],hasLoad:i.some(u=>!!u.loadInfo)}}function td(e,t){let s=e.reduce((i,o)=>i+Math.max(0,Number(o.duration)||0),0),a=s>0?t/s:1,n=0;for(let i of e){let o=Math.max(0,Number(i.duration)||0)*a;i.displayStart=n,i.displayDuration=o,i.displayEnd=n+o;let l=i.spans[0]||null,m=[],f=!1;if(l){let $=Math.max(0,Number(l.duration)||0),b=i.loadInfo?Math.max(0,Number(i.loadInfo.total)||0):0;if(i.loadInfo&&b>0&&i.spans.length===1&&$>0){let d=Math.min(l.end,l.offset+b),h=Math.max(0,d-l.offset),y=Math.max(0,l.end-d);if(h>0&&y>0){let _=Zc(l.started_at,h),L={...l,offset:l.offset,end:d,duration:h,finished_at:_,metadata:{...l.metadata||{},source_stage:i.label,model_load_ms:h,request_duration_ms:$,warm_duration_ms:Math.max(0,$-h),cold_start:h>=100},params:{...l.params||{},source_stage:i.label}},S={...l,offset:d,end:l.end,duration:y,started_at:_,finished_at:l.finished_at};m.push({kind:"load",label:"Model Load",span:L,duration:h}),m.push({kind:"stage",label:`${i.label} \u63A8\u8AD6`,span:S,duration:y}),f=!0}}f||m.push({kind:"stage",label:i.label,span:l,duration:$})}i.detailSegments=m;let u=[];if(l&&o>0)if(f){let[$,b]=m,d=$.duration+b.duration,h=d>0?o*($.duration/d):0,y={...i,key:"model_load",label:`Model Load \xB7 ${i.label}`,spans:[$.span],duration:$.duration},_={...i,label:`${i.label} \u63A8\u8AD6`,spans:[b.span],duration:b.duration};u.push({offset:n,duration:h,color:"#0ea5e9",kind:"load",tip:Ha(y,$.span)}),u.push({offset:n+h,duration:Math.max(0,o-h),color:i.color,kind:"stage",tip:Ha(_,b.span,{includeLoad:!1})})}else u.push({offset:n,duration:o,color:i.color,kind:"stage",tip:Ha(i,l)});i.displaySegments=u,n+=o}}function er(e,{includeLoad:t=!0}={}){let s=[],a=(u,$)=>{$==null||$===""||s.push([u,String($)])},n=e.spans[0]||null;if(!n)return a("\u72C0\u614B","\u6B64\u7D00\u9304\u6C92\u6709\u9019\u500B span"),s;let i=n.params||{},o=n.metadata||{},l=ao(n),m=tr(n),f=(u,$)=>{let b=Number(u?.load_duration_ms);if(!Number.isFinite(b))return;let d=Math.max(0,b);a("Model Load",ue(d)),a("\u51B7\u555F\u52D5",d>=100?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09");let h=Math.max(0,Number($)||0);if(h>0){let y=Math.max(0,h-d);a("\u6263\u9664\u8F09\u5165\u5F8C",ue(y)),a("\u8F09\u5165\u5360\u6BD4",`${(d/h*100).toFixed(d/h>=.1?0:1)}%`)}};if(e.key==="response")return a("Trace \u72C0\u614B",e.responseMetadata.status||"\u2014"),a("Answer source",e.responseMetadata.answer_source||"\u2014"),a("Abstain",e.responseMetadata.abstain?"\u662F":"\u5426"),a("\u5F15\u7528\u7E3D\u6578",e.responseMetadata.citation_count??"\u2014"),a("\u5224\u6C7A\uFF0F\u6CD5\u898F\u5F15\u7528",`${e.responseMetadata.judgment_citations??"\u2014"} / ${e.responseMetadata.law_citations??"\u2014"}`),a("\u7E3D\u8017\u6642",ue(e.duration)),s;if(a("\u958B\u59CB",`${Ki(n.started_at)||"\u2014"} \xB7 +${n.offset.toFixed(1)} ms`),a("\u7D50\u675F",`${Ki(n.finished_at)||"\u2014"} \xB7 +${n.end.toFixed(1)} ms`),a("\u8017\u6642",ue(n.duration)),e.key==="parsing")a("\u8F38\u5165\u9577\u5EA6",o.input_length??i.input_length),a("\u6B63\u898F\u5316\u9577\u5EA6",o.normalized_length??i.normalized_length),a("\u79FB\u9664\u7A7A\u767D",o.trimmed_chars);else if(e.key==="embedding")a("Model",m||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.active_base_url||o.base_url),a("Input tokens",o.prompt_eval_count),a("Batch",o.batch),a("\u5411\u91CF\u7DAD\u5EA6",o.dimensions),a("Fallback",o.fallback_used?"\u662F":"\u5426"),t&&f(o,n.duration);else if(e.key==="qdrant")a("Collection",o.collection||i.collection),o.filter&&a("Filter",Vi(o.filter)),a("Top K",o.top_k??i.limit),a("Hits",o.hits),a("Unique judgments",o.unique_judgments),a("Top score",o.top_score);else if(e.key==="reranker")a("Model",m||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Rerank \u72C0\u614B",o.status),a("Fallback",o.fallback_used?"\u662F":"\u5426"),a("\u5019\u9078\u7B46\u6578",o.candidates),a("\u9078\u7528\u7B46\u6578",o.selected),a("Top score",o.top_score),Array.isArray(o.errors)&&o.errors.length&&a("\u932F\u8AA4",o.errors.join(" \xB7 "));else if(e.key==="context")a("Chunks",o.chunks),a("\u5224\u6C7A chunks",o.judgment_chunks),a("\u6CD5\u898F chunks",o.law_chunks),a("Token \u4F30\u7B97",o.token_estimate),a("Context \u5B57\u5143",o.context_chars),a("\u6587\u4EF6\u6578",o.documents);else if(e.key==="llm")a("Model",m||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Input tokens",o.input_tokens),a("Output tokens",o.output_tokens),a("TTFT",o.ttft_ms===null||o.ttft_ms===void 0?"\u2014":ue(o.ttft_ms)),a("API \u7E3D\u8017\u6642",o.total_duration_ms===null||o.total_duration_ms===void 0?"\u2014":ue(o.total_duration_ms)),t&&f(o,n.duration),a("Strict retry",o.strict?"\u662F":"\u5426");else if(e.key==="model_load"){if(a("Model",m||o.model||i.model),a("\u4E3B\u6A5F",l),a("\u4F86\u6E90\u968E\u6BB5",o.source_stage),a("\u51B7\u555F\u52D5",o.cold_start?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09"),a("\u6A21\u578B\u547C\u53EB\u7E3D\u8017\u6642",o.request_duration_ms===null||o.request_duration_ms===void 0?"\u2014":ue(o.request_duration_ms)),a("\u8F09\u5165\u8017\u6642",o.model_load_ms===null||o.model_load_ms===void 0?"\u2014":ue(o.model_load_ms)),a("\u6263\u9664\u8F09\u5165\u5F8C\u6D41\u7A0B\u6642\u9593",o.warm_duration_ms===null||o.warm_duration_ms===void 0?"\u2014":ue(o.warm_duration_ms)),Number(o.request_duration_ms)>0&&Number(o.model_load_ms)>=0){let u=Number(o.model_load_ms)/Number(o.request_duration_ms)*100;a("\u8F09\u5165\u5360\u6BD4",`${u.toFixed(u>=10?0:1)}%`)}o.eval_duration_ms!==null&&o.eval_duration_ms!==void 0&&a("\u63A8\u8AD6\u8017\u6642",ue(o.eval_duration_ms))}else if(e.key==="segment"||e.key==="test_stage")if(a("Model",m||o.model||i.model),a("\u72C0\u614B",o.status||n.status),e.key==="test_stage")a("\u9032\u5EA6",o.progress===null||o.progress===void 0?"":`${Number(o.progress)||0}%`),n.error&&a("\u932F\u8AA4",n.error);else{n.error&&a("\u932F\u8AA4",n.error);for(let[u,$]of Object.entries(i).slice(0,10))a(u,Vi($))}return e.spans.length>1&&(e.key==="model_load"?a("\u5404\u6A21\u578B\u8F09\u5165",e.spans.map(u=>`${u.metadata?.source_stage||"model"} ${tr(u)} ${ue(u.metadata?.model_load_ms||0)}`).join(" \xB7 ")):(a("Span \u6578",e.spans.length),a("Span \u660E\u7D30",e.spans.map((u,$)=>`#${$+1} +${u.offset.toFixed(0)}ms/${ue(u.duration)}`).join(" \xB7 ")))),n.module&&a("Module",n.module),n.function&&a("Function",n.function),s}function sd(e){let t=String(e||"").trim();if(!t)return"";try{return new URL(t.includes("://")?t:`http://${t}`).hostname||t}catch{return t}}function ao(e){let t=e?.metadata||{},s=String(t.provider_name||"").trim();if(s)return s;let a=String(t.active_base_url||t.base_url||e?.params?.url||"").trim();return sd(a)}function ad(e){let t=e?.metadata||{};return String(t.model||e?.params?.model||"").trim()}function tr(e){let t=ao(e),s=ad(e);return s?t?`${t}:${s}`:s:""}function nd(e){let t=new Set;for(let s of e?.spans||[]){let a=tr(s);a&&t.add(a)}return[...t]}function Ha(e,t,s={}){let a=er({...e,spans:[t]},s);return[String(e.label||""),...a.map(([n,i])=>`${n}: ${i}`)].join(`
`)}function rd(e,t){let s=e.spans||[],a=nd(e),n=Array.isArray(e.displaySegments)?e.displaySegments:null,i=7,o=Math.max(1,Math.min(4,s.length)),l=s.length>1,m=n?12:l?Math.max(12,o*i):12,f=n?n.map(_=>{if(Number(_.duration)<=0)return"";let L=Math.max(0,Math.min(100,_.offset/t*100)),S=Math.min(100-L,_.duration/t*100);return`<span class="rag-wf-bar is-sequential${_.kind==="load"?" is-load":""}" style="left:${L.toFixed(3)}%;width:${S.toFixed(4)}%;top:0;height:12px;--bar-color:${_.color}"
            data-rag-wf-tip="${r(_.tip)}"
            aria-label="${r(_.tip)}" role="img"></span>`}).join(""):s.slice(0,4).map((_,L)=>{if(Number(_.duration)<=0)return"";let S=Math.max(0,Math.min(100,_.offset/t*100)),A=Math.max(.35,Math.min(100-S,_.duration/t*100)),I=l?L*i:0,re=l?6:12,Y=Ha(e,_);return`<span class="rag-wf-bar" style="left:${S.toFixed(3)}%;width:${A.toFixed(3)}%;top:${I}px;height:${re}px"
            data-rag-wf-tip="${r(Y)}"
            aria-label="${r(Y)}" role="img"></span>`}).join(""),u=Array.isArray(e.detailSegments)?e.detailSegments:[],$=u.length>1?u.map(_=>{let L=_.kind==="load"?{...e,key:"model_load",label:`Model Load \xB7 ${e.label}`,spans:[_.span],duration:_.duration}:{...e,label:`${e.label} \u63A8\u8AD6`,spans:[_.span],duration:_.duration},S=er(L,{includeLoad:_.kind!=="stage"});return`<div class="rag-wf-detail-group">
              <div class="rag-wf-detail-group-head">
                <strong>${r(_.label)}</strong>
                <span>${r(ue(_.duration))}</span>
              </div>
              <div class="rag-wf-detail-grid">${S.map(([A,I])=>`<span class="rag-wf-detail"><span>${r(A)}</span><strong>${r(I)}</strong></span>`).join("")}</div>
            </div>`}).join(""):"",b=er(e).map(([_,L])=>`<span class="rag-wf-detail"><span>${r(_)}</span><strong>${r(L)}</strong></span>`).join(""),d=u.length>1?`<div class="rag-wf-details is-split">${$}</div>`:`<div class="rag-wf-details">${b}</div>`,h=s.length?s.some(_=>_.status==="error")?"is-error":"":"is-missing",y=s.length?ue(e.duration):"\u672A\u8A18\u9304";return`<details class="rag-wf-stage ${h}" style="--stage-color:${e.color}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong>${r(e.label)}</strong><small>${r(e.hint)}</small>${a.length?`<small class="rag-wf-model-line">${r(a.join(" \xB7 "))}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${y} \xB7 ${s.length?`${s.length} span`:"\u2014"} <span class="rag-wf-chevron">${g("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:${m}px">${f}</span>
    </summary>
    ${d}
  </details>`}function no(e,t,s=!1){let a=e.response||{},n=e.client||{},i=e.models||[];return`<div class="rag-wf-summary">
      <span>\u7E3D\u8017\u6642 <strong>${r(ue(e.total))}</strong></span>
      <span>Server <strong>${r(ue(t))}</strong></span>
      ${n.total_ms?`<span>Client <strong>${r(ue(n.total_ms))}</strong></span>`:""}
      ${n.render_ms!==void 0?`<span>Render <strong>${r(ue(n.render_ms))}</strong></span>`:""}
      <span>\u5F15\u7528 <strong>${r(String(a.citation_count??"\u2014"))}</strong></span>
      <span>Abstain <strong>${a.abstain?"\u662F":"\u5426"}</strong></span>
      ${i.length?`<span>Model <strong>${r(i.join(" \xB7 "))}</strong></span>`:""}
      ${s?'<span class="rag-wf-updating">\u66F4\u65B0\u4E2D\u2026</span>':""}
    </div>`}function Ps(e,t,s="\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\uFF0C\u67E5\u770B\u53C3\u6578\u3001Token\u3001TTFT\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u4F86\u6E90\u6578\u91CF\u3002Waterfall \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u5E73\u884C\u57F7\u884C\u7684 span \u6703\u4F9D\u5BE6\u969B\u6642\u9593\u91CD\u758A\u986F\u793A\u3002",{legend:a=""}={}){return`<div class="rag-wf-axis"><span>0 ms</span><span>${r(ue(t))}</span></div>
    ${a}
    <div class="rag-wf-stages">${(e||[]).map(n=>rd(n,t)).join("")}</div>
    <p class="rag-wf-hint">${r(s)}</p>`}function ro(e){let t=(e.stages||[]).some(n=>n.loadInfo),s=t?'<div class="rag-wf-legend"><span><i class="is-load"></i>Model Load\uFF08\u968E\u6BB5 bar \u524D\u6BB5\uFF09</span></div>':"",a=t?"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\uFF1BEmbedding\uFF0FLLM \u7684\u85CD\u8272\u524D\u6BB5\u70BA Model Load\uFF0C\u5F8C\u6BB5\u70BA\u63A8\u8AD6\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001Token \u8207\u8F09\u5165\u5360\u6BD4\u53EF\u5C55\u958B\u67E5\u770B\u3002":"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207 Token \u53EF\u5C55\u958B\u67E5\u770B\u3002";return Ps(e.stages,e.total,a,{legend:s})}function Ua(e,{serverDurationMs:t=0,loading:s=!1,embedded:a=!1}={}){if(!e||typeof e!="object")return"";let n=so(e,t),i=n.traceStatus;return`<section class="report-card rag-wf-card${a?" rag-wf-embedded":""}">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${za[i.tone]||za.idle}">${r(i.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(n.requestId||"\u2014")}</span>
          \xB7 ${r(ve(n.startedAt))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <a class="btn btn-secondary btn-sm" href="#/performance">
          ${g("activity",14)}<span>\u5B8C\u6574 Flow</span>
        </a>
      </div>
    </div>
    ${no(n,t,s)}
    ${ro(n)}
  </section>`}var vt=null;function id(){return vt||(vt=document.createElement("div"),vt.className="rag-wf-tooltip",vt.hidden=!0,document.body.appendChild(vt),vt)}function sr(){vt&&(vt.hidden=!0)}function io(e){if(!vt||vt.hidden)return;let t=14,s=10,a=vt.getBoundingClientRect(),n=e.clientX+t,i=e.clientY+t;n+a.width>window.innerWidth-s&&(n=e.clientX-a.width-t),i+a.height>window.innerHeight-s&&(i=e.clientY-a.height-t),vt.style.left=`${Math.max(s,n)}px`,vt.style.top=`${Math.max(s,i)}px`}document.addEventListener("pointerover",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=id(),a=t.dataset.ragWfTip||"";a&&(s.textContent=a,s.hidden=!1,io(e))});document.addEventListener("pointermove",e=>{if(!(!vt||vt.hidden)){if(!e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]")){sr();return}io(e)}});document.addEventListener("pointerout",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=e.relatedTarget;s instanceof Node&&t.contains(s)||sr()});window.addEventListener("scroll",sr,{capture:!0,passive:!0});function od(e,t,s,a){if(a&&!e.length)return`<div class="report-card rag-wf-card">
      ${De({tone:"danger",title:"RAG Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">${g("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;if(!e.length)return`<div class="report-card rag-wf-card">
      ${ct({iconName:"activity",title:s?"\u8B80\u53D6 RAG Pipeline\u2026":"\u5C1A\u7121 RAG Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684 RAG \u554F\u7B54 Trace\u3002":"\u7522\u751F\u65B0\u7684 RAG \u554F\u7B54\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A Parsing\u3001Embedding\u3001Qdrant\u3001Context\u3001LLM \u8207 Response \u7684 waterfall\u3002"})}
    </div>`;let n=e.find(f=>String(f.id)===String(t))||e[0],i=n.flow&&typeof n.flow=="object"?n.flow:{},o=so(i,n.duration_ms),l=o.traceStatus,m=e.map(f=>{let u=to(f.flow||{});return`<option value="${r(String(f.id))}" ${String(f.id)===String(n.id)?"selected":""}>#${r(String(f.id))} \xB7 ${r(ve(f.started_at))} \xB7 ${r(ue(f.duration_ms))} \xB7 ${r(u.label)}</option>`}).join("");return`<section class="report-card rag-wf-card">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${za[l.tone]||za.idle}">${r(l.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(o.requestId||n.request_id||"\u2014")}</span>
          \xB7 ${r(ve(n.started_at))}
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
    ${no(o,n.duration_ms,s)}
    ${ro(o)}
  </section>`}function ld(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},n=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?ue(a.avg_total_ms??0):"\u2014",o=a.samples?ue(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
                    <span class="perf-model-count">${c(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${ue(l.avg_ms)}`:""}</span>
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
                    <span class="perf-seg-ms">${ue(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function ut(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),n=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(n).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:n?`${n}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function oo(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function cd(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let n=Number(a.points_per_second)||0,i=Math.max(2,n/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${r(oo(a))}</strong>
          <span>${r(ve(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${r(`${c(a.indexed_count)} \u7B46 \xB7 ${ut(a.duration_ms)} \xB7 ${c(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${n.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${c(a.indexed_count)} \u7B46 \xB7 ${ut(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function dd(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${r(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${r(`${s.label} ${ut(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${r(s.key)}"></i>
            <span>${r(s.label)}</span>
            <strong>${ut(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 llama-server Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function ud(e,t){let s=(Array.isArray(e)?e:[]).map(L=>({elapsed:Math.max(0,Number(L.elapsed_s)||0),indexed:Math.max(0,Number(L.indexed)||0)})).filter(L=>L.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(L=>L.elapsed),(Number(t)||0)/1e3,1),n=Math.max(...s.map(L=>L.indexed),1),i=760,o=150,l=12,m=12,f=i-l*2,u=o-m*2,$=s.map(L=>[l+L.elapsed/a*f,o-m-L.indexed/n*u]),b=$.map(([L,S],A)=>`${A===0?"M":"L"}${L.toFixed(1)},${S.toFixed(1)}`).join(" "),d=`${b} L${$[$.length-1][0].toFixed(1)},${o-m} L${$[0][0].toFixed(1)},${o-m} Z`,h=Math.max(1,Math.ceil($.length/14)),y=$.map(([L,S],A)=>A%h===0||A===$.length-1?`<circle cx="${L.toFixed(1)}" cy="${S.toFixed(1)}" r="2.6" />`:"").join(""),_=[0,1,2,3].map(L=>{let S=m+u/3*L;return`<line x1="${l}" y1="${S.toFixed(1)}" x2="${i-l}" y2="${S.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${c(n)} \u7B46 \xB7 ${ut(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${_}
      <path d="${d}" class="index-progress-area"></path>
      <path d="${b}" class="index-progress-line"></path>
      ${y}
      <line x1="${l}" y1="${o-m}" x2="${i-l}" y2="${o-m}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${m}" x2="${l}" y2="${o-m}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${ut(a*500)}</span>
      <span>${ut(a*1e3)}</span>
    </div>
  </div>`}function pd(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},n=t.coverage||{},i=n.total_judgments>0?`${c(n.indexed_judgments)} / ${c(n.total_judgments)}\uFF08${(100*n.indexed_judgments/n.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:c(t.indexed_count),note:`${c(t.batch_count)} \u6279 \xD7 ${c(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:ut(t.duration_ms),note:`${c(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:ut(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${ut(t.batch_min_ms)} \xB7 \u6700\u6162 ${ut(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${c(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${r(oo(t))}</span>
    </div>
    <div class="index-perf-summary">
      ${o.map(l=>`<div class="index-perf-stat">
            <div class="summary-label">${r(l.label)}</div>
            <div class="index-perf-value">${r(l.value)}</div>
            <div class="index-perf-note">${r(l.note)}</div>
          </div>`).join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${r(ve(t.started_at))}</span>
      <span><strong>batch</strong> ${c(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${c(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${c(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${r(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${ut(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${cd(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${ut(t.duration_ms)}</span>
        </div>
        ${dd(t)}
      </div>
    </div>
    ${ud(t.progress,t.duration_ms)}
  </section>`}var Yi=["#22d3ee","#a78bfa","#f59e0b","#ec4899","#3b82f6","#10b981","#f97316","#8b5cf6","#64748b"];function Xi(e){let t=String(e?.host||e?.url||"").trim(),s=e?.port?`:${e.port}`:"";return`${t||"\u2014"}${s}`}function md(e,t,s,a){if(a&&!e)return`<div class="report-card rag-wf-card">
      ${De({tone:"danger",title:"\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${g("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=Array.isArray(e?.runs)?e.runs:[];if(!n.length)return`<div class="report-card rag-wf-card">
      ${ct({iconName:"layers",title:s?"\u8B80\u53D6\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline\u2026":"\u5C1A\u7121\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684\u7248\u672C\u5316\u7D22\u5F15\u7D00\u9304\u3002":"\u57F7\u884C\u300CQdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A host/model\u3001Blue-Green collection \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002"})}
    </div>`;let i=n.find(S=>String(S.id)===String(t))||e?.latest||n[n.length-1],o=i?.pipeline&&typeof i.pipeline=="object"?i.pipeline:null,m=[...n].reverse().map(S=>{let A=Number(S.pipeline?.version_id||S.version_id||0),I=A?`v${String(A).padStart(3,"0")}`:"\u7D22\u5F15";return`<option value="${r(String(S.id))}" ${String(S.id)===String(i.id)?"selected":""}>${r(`${ve(S.started_at)} \xB7 ${I} \xB7 ${ut(S.duration_ms)}`)}</option>`}).join(""),f=Number(o?.version_id||i.version_id||0),u=f?`v${String(f).padStart(3,"0")}`:"\u2014",$=o?.host||{},b=Xi($),d=o?.model||i.model||"\u2014",h=Number(o?.total_ms)||Number(i.duration_ms)||0,y=Array.isArray(o?.stages)?o.stages:[],_=y.map((S,A)=>({...S,ms:Math.max(0,Number(S.duration_ms)||0),color:Yi[A%Yi.length]})).filter(S=>S.ms>0).map(S=>`<span class="index-pipeline-seg" style="width:${(S.ms/Math.max(1,h)*100).toFixed(2)}%;background:${r(S.color)}" title="${r(`${S.label} ${ut(S.ms)}`)}"></span>`).join(""),L=y.map((S,A)=>{let I=Math.max(0,Number(S.duration_ms)||0),re=h>0?I/h*100:0,Y=S.host&&typeof S.host=="object"?S.host:null;return`<div class="index-pipeline-row">
        <span class="index-pipeline-step">${String(A+1).padStart(2,"0")}</span>
        <div class="index-pipeline-copy">
          <div class="index-pipeline-title">
            <strong>${r(S.label||S.key||"\u968E\u6BB5")}</strong>
            ${Qe(S.status||"success")}
          </div>
          <span class="index-pipeline-detail">${r(S.detail||"\u2014")}</span>
          ${Y?`<span class="index-pipeline-host">${g("server",12)} ${r(Xi(Y))} \xB7 ${r(S.model||d)}</span>`:""}
        </div>
        <div class="index-pipeline-time">
          <strong>${ut(I)}</strong>
          <span>${re.toFixed(1)}%</span>
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
            <span><strong>\u7248\u672C</strong> ${r(u)}</span>
            <span><strong>collection</strong> ${r(String(o.collection||"\u2014"))}</span>
            <span><strong>\u6A21\u5F0F</strong> ${r(String(o.build_mode||"\u2014"))}</span>
            <span><strong>\u672C\u6B21</strong> ${o.resumed?`\u63A5\u7E8C\uFF08\u5DF2\u7D22\u5F15 ${c(o.resumed_indexed)} \u7B46\uFF09`:"\u65B0\u5EFA\u7248\u672C"}</span>
            <span><strong>Host</strong> ${r(b)}</span>
            <span><strong>Model</strong> ${r(String(d))}</span>
            <span><strong>\u7E3D\u8017\u6642</strong> ${ut(h)}</span>
          </div>
          <div class="index-pipeline-bar">${_}</div>
          <div class="index-pipeline-list">${L}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B Pipeline \u968E\u6BB5\u8CC7\u6599\uFF1B\u4E0B\u4E00\u6B21 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u6703\u8A18\u9304 host/model \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002</div>'}
  </section>`}function gd(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${eo.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${g("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${g("chevronRight",13)}</button>
    </div>
  </div>`}function fd(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"#65a30d":t.includes("judgment.rag")?"#8b5cf6":t.includes("judgment.web.app")?"#3b82f6":t.includes("judgment.web.query")?"#d97706":t.includes("judgment.judgment_index")?"#0d9488":"#64748b"}function bd(e){let t=Zn(e),s=Math.max(0,Math.min(8,Number(e.depth)||0));return{key:"segment",label:`${"\u203A ".repeat(s)}${e.name||"unnamed"}`,hint:[e.module||"\u2014",e.function||"\u2014"].join(" \xB7 "),color:fd(e),spans:[{...t,status:e.status||"ok",error:e.error,metadata:e.metadata||{},params:e.params||{},started_at:e.started_at,finished_at:e.finished_at}],start:t.offset,end:t.end,duration:t.duration}}function Ga(e){return(e||[]).map(bd)}function hd(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((b,d)=>Number(b.seq)-Number(d.seq)):[],n=s?.summary||{},i=Array.isArray(n.models)?n.models:[],o=s?.client||{},l=s?.metadata||{},m=l.question||"",f=l.answer||"",u=m||f?`<div class="perf-flow-qa">
          ${m?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${r(m)}</span></div>`:""}
          ${f?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${r(f)}</span></div>`:""}
        </div>`:"",$=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(b=>(Number(b.offset_ms)||0)+(Number(b.duration_ms)||0)),1);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${r(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${r(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${r(e.method||"")} ${r(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${ve(e.started_at)}</span>
      <span class="perf-record-duration">${ue(e.duration_ms)}</span>
      ${Qe(e.status)}
      <span class="perf-record-chevron">${g("chevronRight",14)}</span>
    </summary>
    <div class="perf-record-body">
      <div class="perf-flow-meta">
        <span><strong>Request</strong> <span class="mono">${r(e.request_id||s?.request_id||"\u2014")}</span></span>
        <span><strong>Server</strong> ${ue(e.duration_ms)}</span>
        ${o.total_ms?`<span><strong>Client \u5168\u6D41\u7A0B</strong> ${ue(o.total_ms)}</span>`:""}
        ${o.render_ms!==void 0?`<span><strong>Render</strong> ${ue(o.render_ms)}</span>`:""}
        <span><strong>Flow</strong> ${a.length} \u6BB5</span>
        ${a.length?"<span><strong>Waterfall</strong> \u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\u3001\u53EF\u9EDE\u9078\u5C55\u958B\u53C3\u6578</span>":""}
      </div>
      ${u}
      ${i.length?`<div class="chips perf-record-models">${i.map(b=>`<span class="chip">${r(b)}</span>`).join("")}</div>`:""}
      ${a.length?Ps(Ga(a),$,"\u6B64 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002"):`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${r(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${r(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var Zi={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",rerank:"Reranker",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"};function vd(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}var $d={embedding:"#3984c6",retrieval:"#d97706",rerank:"#8b5cf6",context:"#64748b",llm:"#16a34a",validation:"#8b5cf6"};function yd(e,t){let s=Date.parse(e.started_at||""),a=Date.now(),n=Array.isArray(e.stage_order)?[...e.stage_order]:Object.keys(Zi);for(let f of t)f.stage&&!n.includes(f.stage)&&n.push(f.stage);let i=[],o=0;for(let f of n){let u=t.filter(d=>d.stage===f);if(!u.length)continue;let $=u.map(d=>{let h=Date.parse(d.started_at||""),y=Number.isFinite(s)&&Number.isFinite(h)?Math.max(0,h-s):0,_=Math.max(0,Number(d.duration_ms)||0);d.status==="running"&&Number.isFinite(h)&&(_=Math.max(_,a-h));let L=y+_;return o=Math.max(o,L),{offset:y,end:L,duration:_,status:d.status==="failed"?"error":d.status==="running"?"running":"ok",started_at:d.started_at,finished_at:d.finished_at,error:d.error_message,metadata:{...d.details||{},model:d.model,status:d.status,progress:Number(d.progress)||0,module:d.module,function:d.function},params:{model:d.model}}}),b=$.reduce((d,h)=>d+h.duration,0);i.push({key:"test_stage",label:Zi[f]||f,hint:`${$.length} \u500B\u7A0B\u5E8F`,color:$d[f]||"#64748b",spans:$,start:$.length?Math.min(...$.map(d=>d.offset)):null,end:$.length?Math.max(...$.map(d=>d.end)):null,duration:b})}let l=e.status==="running"&&Number.isFinite(s)?Math.max(0,a-s):0,m=Math.max(Number(e.total_ms)||0,l,o,1);return{stages:i,total:m}}function Is(e,t,s,a={}){let n=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(L=>`<option value="${r(L.run_id)}" ${L.run_id===s?"selected":""}>${r(vd(L.status))} \xB7 ${r((L.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${r(ve(L.started_at))}</option>`)].join(""),o=n?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${g("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${g("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?Qe(e.status):""}</div>
      <div class="test-flow-question">${e?r(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${ct({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let m=Array.isArray(e.steps)?e.steps:[],f=yd(e,m),u=e.models||{},$=e.status==="running"?`${ue(f.total)}\uFF08\u4F30\u7B97\uFF09`:ue(e.total_ms),b=m.find(L=>L.stage==="llm"&&L.model===e.summary?.primary_model)||m.find(L=>L.stage==="llm"&&L.details?.answer_preview),d=String(b?.details?.provider_name||"").trim(),h=d&&e.summary?.primary_model?`${d}:${e.summary.primary_model}`:e.summary?.primary_model||"",y=e.answer||b?.details?.answer_preview||"",_=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${h?`<span class="mono">${r(h)}</span>`:""}
    </div>
    <p>${y?r(y):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${r(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${r(ve(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${$}</span>
      <span><strong>Embedding</strong> ${Array.isArray(u.embedding)?u.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(u.llm)?u.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${r(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${_}
    ${f.stages.length?Ps(f.stages,f.total,"\u6E2C\u8A66 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B\u7A0B\u5E8F\u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u6A21\u578B\u3001\u72C0\u614B\u3001\u9032\u5EA6\u3001module\uFF0Ffunction \u8207\u932F\u8AA4\u3002"):'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":n?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${h?`<span class="mono">primary=${r(h)}</span>`:""}
    </div>
  </div>`}function wd(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},n=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${Qe(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${c(e.total)} \u7B46\u7B26\u5408 \xB7 ${ue(e.duration_ms)} \xB7
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
    ${pd(n)}
    ${ld(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>hd(i,o)).join(""):ct({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${gd(e)}
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
  </div>`}async function _d(e,t){let s=!1,a=Xn(),n={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null,m=[],f="",u=!1,$=null,b=!1,d=null,h="",y=!1,_=null,L=!1;e.innerHTML=`<section class="page data-page performance-page">
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
              <div id="performance-report">${na({label:"\u6548\u80FD\u5831\u8868"})}</div>
            </section>
          </div>
        </div>
        <div id="performance-panel-pipeline" hidden></div>
        <div id="performance-panel-index-pipeline" hidden></div>
        <div id="performance-panel-benchmark" hidden></div>
      </section>
    </div>
  </section>`;let S=e.querySelector("#performance-filter-fields"),A=e.querySelector("#performance-filter-form"),I=e.querySelector("#performance-test-flow"),re=e.querySelector("#performance-report"),Y=e.querySelector("#performance-panel-pipeline"),we=e.querySelector("#performance-panel-index-pipeline"),ge=e.querySelector("#performance-meta"),F=e.querySelector("#performance-refresh"),j=[...e.querySelectorAll("[data-performance-tab]")],x={overview:e.querySelector("#performance-panel-overview"),pipeline:e.querySelector("#performance-panel-pipeline"),"index-pipeline":e.querySelector("#performance-panel-index-pipeline"),benchmark:e.querySelector("#performance-panel-benchmark")},R="overview",W=k=>{R=k;for(let E of j){let X=E.dataset.performanceTab===k;E.classList.toggle("is-active",X),X?E.setAttribute("aria-current","page"):E.removeAttribute("aria-current")}for(let[E,X]of Object.entries(x))X&&(X.hidden=E!==k);k==="benchmark"?ge.textContent="BENCHMARK \xB7 RAG":k==="pipeline"?ge.textContent="PERFORMANCE \xB7 RAG WATERFALL":k==="index-pipeline"?ge.textContent="PERFORMANCE \xB7 INDEX PIPELINE":l&&(ge.textContent=`PERFORMANCE \xB7 ${c(l.total)} \u7B46`)},te=Ri(e,{onNavigate:k=>W(k)}),z=()=>{Y&&(Y.innerHTML=od(m,f,u,$))},de=async({force:k=!1}={})=>{if(!(s||u)){if(b&&!k){z();return}u=!0,m.length||z();try{let E=await K.performance({keyword:"/api/rag"},1,50);if(s)return;let X=(Array.isArray(E.rows)?E.rows:[]).filter(H=>H.flow&&(String(H.path||"").includes("/api/rag")||String(H.process||"").includes("RAG")));m=X,(!f||!X.some(H=>String(H.id)===String(f)))&&(f=X[0]?String(X[0].id):""),$=null,b=!0}catch(E){if(s)return;$=E}finally{s||(u=!1,z())}}},xe=()=>{we&&(we.innerHTML=md(d,h,y,_))},D=async({force:k=!1}={})=>{if(!(s||y)){if(L&&!k){xe();return}y=!0,d||xe();try{let E=await K.performance({},1,1);if(s)return;d=E.index_pipeline||E.index_stats||null;let X=Array.isArray(d?.runs)?d.runs:[];(!h||!X.some(H=>String(H.id)===String(h)))&&(h=d?.latest?String(d.latest.id):""),_=null,L=!0}catch(E){if(s)return;_=E}finally{s||(y=!1,xe())}}},ke=k=>{W(k),k==="benchmark"&&te.show(),k==="pipeline"&&de(),k==="index-pipeline"&&D()};e.addEventListener("click",k=>{let E=k.target.closest("[data-performance-tab]");E&&ke(E.dataset.performanceTab||"overview")}),Y?.addEventListener("change",k=>{k.target.matches("[data-rag-trace-select]")&&(f=String(k.target.value||""),z())}),Y?.addEventListener("click",k=>{k.target.closest('[data-action="refresh-rag-waterfall"]')&&de({force:!0})}),we?.addEventListener("change",k=>{k.target.matches("[data-index-pipeline-select]")&&(h=String(k.target.value||""),xe())}),we?.addEventListener("click",k=>{k.target.closest('[data-action="refresh-index-pipeline"]')&&D({force:!0})});let se=null,je=[],_e="",oe=null,ie="",he=()=>{S.innerHTML=Xc(n,a)},fe=()=>{let k=JSON.stringify({selected:_e,tick:se?.status==="running"?Math.floor(Date.now()/1e3):0,runs:je.map(E=>`${E.run_id}:${E.status}`),run:se?{run_id:se.run_id,status:se.status,progress:se.progress,total_ms:se.total_ms,steps:(se.steps||[]).map(E=>`${E.stage}:${E.model}:${E.status}:${E.progress}:${E.duration_ms}`)}:null});k!==ie&&(ie=k,I.innerHTML=Is(se,je,_e))},Ae=async()=>{try{let k=await K.testRuns(30);if(s)return;je=Array.isArray(k.runs)?k.runs:[]}catch{if(s)return;je=[]}},$e=async(k=null)=>{try{let E=k&&!_e?k:_e?await K.testRun(_e):await K.testRunCurrent();if(s)return;se=E.run||null,!_e&&se&&se.status!=="running"&&!je.some(X=>X.run_id===se.run_id)&&await Ae(),fe()}catch{if(s)return;se=null,fe()}},Pe=async(k=null)=>{s||_e||await $e(k)},Ue=()=>{s||oe||(oe=bt("test-runs",(k,E)=>Pe(E?.snapshot||null)))};I.addEventListener("change",async k=>{k.target.id==="test-run-select"&&(_e=String(k.target.value||""),await $e())}),I.addEventListener("click",async k=>{k.target.closest("#test-flow-refresh")&&(_e="",await Ae(),await $e())});let C=async(k=i,{quiet:E=!1}={})=>{i=Math.max(1,Number(k)||1),a=Wi();let X=re.querySelector(".report-card"),H=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!X?re.setAttribute("aria-busy","true"):(re.removeAttribute("aria-busy"),re.innerHTML=na({label:"\u6548\u80FD\u5831\u8868"}));let Ce=e.querySelector("#performance-run");E||Me(Ce,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Ie=await K.performance(a,i,o);if(s)return;if(l=Ie,Ie.index_pipeline){d=Ie.index_pipeline;let Fe=Array.isArray(d.runs)?d.runs:[];(!h||!Fe.some(Ye=>String(Ye.id)===String(h)))&&(h=d.latest?String(d.latest.id):""),L=!0,_=null}if(i=Number(Ie.page)||i,o=Number(Ie.page_size)||o,re.removeAttribute("aria-busy"),re.innerHTML=wd(Ie),H!==null){let Fe=re.querySelector("[data-page-size]");Fe&&(Fe.value=String(o),Fe.focus({preventScroll:!0}))}ge.textContent=`PERFORMANCE \xB7 ${c(Ie.total)} \u7B46`,ge.className="badge badge-neutral badge-mono"}catch(Ie){if(s)return;re.removeAttribute("aria-busy"),re.innerHTML=Ba(Ie,{label:"\u6548\u80FD\u5831\u8868"}),P(Ie.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||Me(Ce,!1)}},O=async()=>{try{n=await K.performanceOptions()}catch{n={processes:[],modules:[],statuses:[],methods:[],models:[]}}he()};return A.addEventListener("submit",k=>{k.preventDefault(),C(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=Xn(),i=1,he(),C(1)}),F.addEventListener("click",async()=>{if(R==="pipeline"){Me(F,!0,"\u6574\u7406\u4E2D\u2026");try{await de({force:!0})}finally{s||Me(F,!1)}return}if(R==="index-pipeline"){Me(F,!0,"\u6574\u7406\u4E2D\u2026");try{await D({force:!0})}finally{s||Me(F,!1)}return}if(R==="benchmark"){Me(F,!0,"\u6574\u7406\u4E2D\u2026");try{await te.refresh()}finally{s||Me(F,!1)}return}a=Wi(),F.disabled=!0,Me(F,!0,"\u6574\u7406\u4E2D\u2026"),await O(),await Ae(),s||await $e(),s||await C(1),s||(F.disabled=!1,Me(F,!1))}),re.addEventListener("click",async k=>{let E=k.target.closest("[data-action]");if(!E||!l)return;let X=E.dataset.action;if(X==="retry"){C(i);return}if(X==="prev-page"){C(Math.max(1,Number(l.page)-1),{quiet:!0});return}if(X==="next-page"){let H=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));C(Math.min(H,Number(l.page)+1),{quiet:!0});return}if(X==="copy-query"){let H=await Ms(l.query_text||"");P(H?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",H?"ok":"warn");return}if(X==="export-json"){let H=`performance-page-${l.page}.json`;Pt(H,JSON.stringify(Oa(l),null,2),"application/json;charset=utf-8"),P(`\u5DF2\u532F\u51FA ${H}`,"ok");return}if(X==="export-csv"){let H=`performance-page-${l.page}.csv`;Pt(H,Fa(l),"text/csv;charset=utf-8"),P(`\u5DF2\u532F\u51FA ${H}`,"ok")}}),re.addEventListener("change",k=>{k.target.matches("[data-page-size]")&&(o=Number(k.target.value)||25,eo.includes(o)||(o=25),C(1,{quiet:!0}))}),await Promise.allSettled([O(),Ae()]),s||(await $e(),await C(1),Ue()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,oe&&oe(),te.destroy()}}var kd=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5F9E\u696D\u4EBA\u54E1\u6709\u90A3\u4E9B\u898F\u5B9A\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function Sd(){return`<div class="answer-placeholder">
    <span class="empty-icon">${g("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function nr(){return`<section class="card answer-card rag-empty-answer">${Sd()}</section>`}function lo(e,t){return`<div class="rag-turn">
    <div class="rag-user-bubble">${r(e)}</div>
    <section class="card rag-assistant-turn" data-rag-answer>${t}</section>
  </div>`}function xd(e,t){return Promise.race([e,new Promise((s,a)=>{window.setTimeout(()=>a(new Error("pipeline lookup timed out")),t)})])}async function Ad(e){if(!e||e.pipeline_flow)return e;let t=String(e._client_request_id||e.request_id||"").trim();if(!t)return e;for(let s=0;s<3;s+=1){try{let a=await xd(K.performance({keyword:t},1,5),1800),n=(Array.isArray(a.rows)?a.rows:[]).find(i=>String(i.request_id||"")===t&&i.flow&&typeof i.flow=="object");if(n)return e.pipeline_flow=n.flow,e}catch{}s<2&&await new Promise(a=>window.setTimeout(a,250))}return e}function qd(e){return{status:e.status,answer:e.answer,answer_source:e.answer_source,notice:e.notice,citations:Array.isArray(e.citations)?e.citations:[],judgments:Array.isArray(e.judgments)?e.judgments:[],law_sources:Array.isArray(e.law_sources)?e.law_sources:[],matched_terms:Array.isArray(e.matched_terms)?e.matched_terms:[],law_answer:e.law_answer,law_framework:e.law_framework,llm_model:e.llm_model,embedding_model:e.embedding_model,duration_ms:e.duration_ms,show_sources:e.show_sources,pipeline_flow:e.pipeline_flow||null,test_run:e.test_run||null,partial:!1,streaming:!1}}var Md={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"llama-server embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"llama-server LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function Ld(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`llama-server run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`llama-server embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:Md[t]||t||"backend step"}function co(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function uo(e){let t=Number(e);return Number.isFinite(t)?`${c(Math.max(0,Math.round(t)))} ms`:"\u2014"}function rr(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function jd(){return`<div class="rag-process is-open" id="rag-process">
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
  </div>`}function Td(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),n=performance.now(),i=new Map,o=new Map,l=(d,h,y)=>{let _=d.querySelector(h);_&&(_.textContent=y)},m=d=>{if(d.failed){l(d.element,".rag-process-meta","\u5931\u6557");return}if(d.hasChildren){l(d.element,".rag-process-meta","");return}l(d.element,".rag-process-meta",uo(d.durationMs))},f=d=>{let h=d-1,y=[...i.values()].reverse();for(let _ of y){if(h<0)break;_.depth<=h&&(_.hasChildren||(_.hasChildren=!0,_.element.dataset.hasChildren="true",_.finished&&m(_)),h=_.depth-1)}},u=d=>{if(!s)return null;let h=String(d?.seq??`step-${i.size+1}`),y=i.get(h);if(!y){let _=Math.max(0,Math.min(6,Number(d?.depth)||0));f(_);let L=document.createElement("div");L.className="rag-process-item is-running",L.dataset.processKey=h,L.style.setProperty("--depth",String(_)),L.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(L),y={element:L,depth:_,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(h,y)}return l(y.element,".rag-process-label",Ld(d)),y.element.title=co(d),y};return{step:d=>{let h=d?.segment;if(!h)return;o.set(String(h.seq??h.name??o.size),{...h});let y=u(h);if(y){if(d.type==="segment_start"){y.element.classList.add("is-running"),l(y.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(d.type==="segment_end"){let _=h.status==="error";y.element.classList.remove("is-running"),y.element.classList.toggle("is-error",_),y.finished=!0,y.failed=_,y.durationMs=Number(h.duration_ms)||0,m(y),y.element.title=[co(h),_&&h.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(d=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(L=>{L.classList.remove("is-running");let S=L.dataset.hasChildren==="true";l(L,".rag-process-meta",S?"":d?"\u5B8C\u6210":"\u4E2D\u65B7")});let h=s?.children.length||i.size,y=uo(Math.max(0,performance.now()-n));a&&(a.textContent=d?`\u5B8C\u6210 \xB7 ${h} \u6B65 \xB7 ${y}`:`\u5931\u6557 \xB7 ${h} \u6B65`);let _=[...o.values()].filter(L=>L?.name).sort((L,S)=>Number(L.offset_ms||0)-Number(S.offset_ms||0));if(s&&_.length){let L=Math.max(1,..._.map(S=>Number(S.end_offset_ms)||(Number(S.offset_ms)||0)+(Number(S.duration_ms)||0)));s.classList.add("is-waterfall"),s.innerHTML=Ps(Ga(_),L,"\u5F8C\u7AEF Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B span \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002")}return t.classList.add("is-complete"),rr(t,!1),t.outerHTML},collapse:()=>rr(t,!1)}}function Nd(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${g("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":jd()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${r(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function po(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Ja(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let n=String(e||"").trim();return n?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t||n)}"
    data-source-type="${r(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(a||n)}</button>`:""}function bo(e){let t=String(e?.law_name||"").trim(),s=String(e?.article_no||"").replace(/\s+/g,"");if(!t||!s)return"";let a=(Array.isArray(e?.paragraphs)?e.paragraphs:[]).map(i=>String(i||"").trim()).filter(Boolean),n=`${t}${s}${a.join("\u3001")}`;return`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t)}"
    data-source-type=""
    data-article-no="${r(s)}"
    title="\u9EDE\u64CA\u67E5\u770B ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(n)}</button>`}function ho(e){let t=String(e?.citation_status||"");return t==="cited"?"\u7B54\u6848\u5F15\u7528":t==="provided_not_cited"?"\u5DF2\u63D0\u4F9B\u7D66\u6A21\u578B\uFF0C\u7B54\u6848\u672A\u5F15\u7528":t==="reference_only"||e?.used_for_generation===!1?"\u50C5\u4F9B\u53C3\u8003\uFF08\u672A\u9032\u5165\u751F\u6210 prompt\uFF09":e?.used_for_generation===!0?"\u5DF2\u63D0\u4F9B\u7D66\u6A21\u578B":""}function Ed(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map($=>`<span>${r($)}</span>`).join(""),n=ho(e),i=n?`<span>${r(n)}</span>`:"",o=(Array.isArray(e.law_citations)?e.law_citations:[]).map($=>bo($)).filter(Boolean).slice(0,12).join(""),l=o||(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map($=>Ja($)).join(""),m=o?'<div class="citation-meta"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':"",f=e.jid?` data-action="open-parquet-judgment"
        data-jid="${r(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${r(e.jid)}"`:"",u=e.pdf_url?`<a class="citation-link" href="${r(e.pdf_url)}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${g("external",11)}</a>`:"";return`<article class="citation">
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
    <div class="citation-links">${u}</div>
  </article>`}function Rd(e){let t=[e.court,e.jdate].filter(Boolean).map(n=>`<span>${r(n)}</span>`).join(""),s=[e.vector_score!==null&&e.vector_score!==void 0?`\u5411\u91CF ${Number(e.vector_score).toFixed(4)}`:"",e.rerank_score!==null&&e.rerank_score!==void 0?`rerank ${Number(e.rerank_score).toFixed(4)}`:""].filter(Boolean).map(n=>`<span>${r(n)}</span>`).join("");return`<article class="citation reference-judgment">
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
  </article>`}function Cd(e,t){let s=[e.law_level,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${r(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${g("external",11)}</a>`:"",n=e.law_key||e.law_name||"",i=n?` data-action="open-law-source"
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
  </article>`}function Pd(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",n=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${r(s)}</span>`,a,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${Rt(e.law_modified_date)}`:"",ho(e)].filter(Boolean).map(d=>`<span>${d}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${r(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${r(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${r(o.entity||"")}\u300D\u7684\u5224\u6C7A ${c(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${c(o.law_count||0)} \u6B21</span>
      </div>`:"",m=e.law_key||"",f=e.source_type||"",u=(Array.isArray(e.articles)?e.articles:[]).map(d=>{let h=String(d.article_no||"");return`<div class="law-source-article"${m&&h?` data-action="open-law-source"
        data-law-key="${r(m)}"
        data-source-type="${r(f)}"
        data-article-no="${r(h)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${r(h)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} ${r(h)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${r(d.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${r(d.article_content||"")}</p>
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
      ${u}
    </div>
    <div class="citation-links">${$}</div>
  </article>`}function Id(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function Dd(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${r(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",n=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(n==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),m=s.index!=null?`<span class="law-answer-index">[${r(String(s.index))}]</span>`:"",f=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${r(a)}"
            data-source-type="${r(n)}"
            title="\u9EDE\u64CA\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587">${r(i)}</button>`:`<strong>${r(i)}</strong>`,u=Array.isArray(s.articles)?s.articles:[],$=u.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${u.map(b=>{let d=String(b.article_no||"").trim(),h=Id(b.article_content);return!a||!d?`<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${r(d||"\u689D\u6587")}</span>
                  <span class="law-answer-article-text">${r(h)}</span>
                </div>`:`<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${r(a)}"
                data-source-type="${r(n)}"
                data-article-no="${r(d)}"
                title="\u9EDE\u64CA\u67E5\u770B ${r(d)} \u7684\u5B8C\u6574\u5167\u5BB9"
                aria-label="\u958B\u555F ${r(i)} ${r(d)} \u7684\u5B8C\u6574\u689D\u6587">
                <span class="law-answer-article-no">${r(d)}</span>
                <span class="law-answer-article-text">${r(h)}</span>
              </button>`}).join("")}</div>`:"";return`<div class="law-answer-source">
        <div class="law-answer-source-head">
          ${f}
          <span class="law-answer-source-meta">\uFF08${r(o)}\uFF0C${c(l)} \u689D\uFF09</span>
          ${m}
        </div>
        ${$}
      </div>`}).join("")}</div>`}function Bd(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let n=s.get(String(a));return n?.law_key?Ja(a,{lawKey:n.law_key,sourceType:n.source_type||""}):`<span class="chip">${r(a)}</span>`}).join("")}</div>`}function Fd(e){let t=String(e||"");return t==="operational"?"is-ok":t==="standby"?"is-idle":"is-down"}function Od(e){let t=String(e||"");return t==="operational"?"":t==="standby"?"\u5099\u63F4":t==="disabled"?"\u505C\u7528":t==="not_configured"?"\u672A\u8A2D\u5B9A":"\u96E2\u7DDA"}function mo(e,{fallback:t=!1}={}){if(!e)return`<span class="rag-model-cell is-empty">
      <span class="rag-model-state is-idle" aria-hidden="true"></span>
      <span class="rag-model-name">\u672A\u8A2D\u5B9A</span>
    </span>`;let s=String(e.label||"").trim()||[e.host,e.model].filter(Boolean).join(":"),a=String(e.status||""),n=!["operational","standby"].includes(a),i=t&&!n?"\u5099\u63F4":Od(a),o=n?"is-down":t?"is-idle":Fd(a),l=[s,e.url,i].filter(Boolean).join(" \xB7 ");return`<span class="rag-model-cell" title="${r(l)}">
    <span class="rag-model-state ${o}" aria-hidden="true"></span>
    <span class="rag-model-name">${r(s)}</span>
    ${i?`<span class="rag-model-note">${r(i)}</span>`:""}
  </span>`}function Hd(e,t){let s=Array.isArray(e)?e:[],a=[{kind:"chat",label:"Chat"},{kind:"embedding",label:"Embedding"},{kind:"rerank",label:"Rerank"}],n=new Map(s.map(o=>[String(o.kind||""),o])),i=a.map(o=>{let l=n.get(o.kind)||o;return`<tr>
        <td class="rag-model-kind">${r(l.label||o.label)}</td>
        <td>${mo(l.active)}</td>
        <td>${mo(l.fallback,{fallback:!0})}</td>
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
  </div>`}function Qa({tone:e,title:t,text:s,modelSummary:a=[],refreshing:n=!1}){let i=e==="ok"?"is-ok":e==="warn"?"is-warn":"is-info",o=e==="ok"?"check":e==="warn"?"alert":"info",l=e==="ok"?"badge-ok":e==="warn"?"badge-warn":"badge-info";return`<section class="rag-mode-card ${i}">
    <div class="rag-mode-head">
      <span class="rag-mode-icon" aria-hidden="true">${g(o,14)}</span>
      <div class="rag-mode-copy">
        <strong>${r(t)}</strong>
        <p>${r(s)}</p>
      </div>
      <span class="badge ${l}">3 \u500B\u6A21\u578B</span>
    </div>
    ${Hd(a,n)}
  </section>`}function vo(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.reference_judgments)?e.reference_judgments:[],n=Array.isArray(e.law_sources)?e.law_sources:[],i=e.retrieval||{},o=Array.isArray(e.matched_terms)?e.matched_terms:[],l=e.status||"preview",m=!!e.partial,f=!!e.streaming,u=!!e.rerank_degraded,$=!!e.show_sources||!m,b=e.answer_source==="structured",d=String(e.law_answer||"").trim(),h=e.law_framework||null,y=Array.isArray(h?.rows)?h.rows:[],_=Array.isArray(h?.sources)?h.sources:[],L=y.length>0,S=!!d&&!b&&!L,A=s.filter(fe=>fe.used_for_generation===!0).length,I=s.some(fe=>fe.used_for_generation!==void 0),re=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46${I?`\uFF08${A} \u7B46\u9032\u5165 prompt\uFF09`:""}</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((fe,Ae)=>Ed(fe,Ae)).join("")}</div>`:"",Y=i.judgment_limit_applied&&a.length?`<div class="reference-judgment-note">
          <span>\u672C\u984C\u4F9D\u984C\u610F\u4E3B\u8981\u8A62\u554F\u6CD5\u898F\u898F\u5B9A\uFF0C\u6545\u5224\u6C7A\u50C5\u986F\u793A ${s.length} \u7B46\u4F5C\u70BA\u53C3\u8003\u3002\u53E6\u6709 ${a.length} \u7B46\u76F8\u95DC\u5224\u6C7A\uFF08${a.some(fe=>fe.rerank_score!==null&&fe.rerank_score!==void 0)?"\u4F9D rerank \u5206\u6578\u6392\u5E8F":"\u4F9D\u6AA2\u7D22\u5206\u6578\u6392\u5E8F"}\uFF09\uFF0C</span>
          <details class="reference-judgments">
            <summary>\u5C55\u958B\u67E5\u770B</summary>
            <div class="citation-list reference-judgment-list">${a.map(fe=>Rd(fe)).join("")}</div>
          </details>
        </div>`:"",we=n.length&&!S?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${n.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${n.map((fe,Ae)=>Pd(fe,Ae)).join("")}</div>`:"",ge=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((fe,Ae)=>Cd(fe,Ae)).join("")}</div>`:"",F=$?re+Y+we+ge:"";!F&&!m&&!S&&!L&&(F=`<div class="answer-divider"></div>
      ${ct({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:l==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let j=Bd(o,n),x=e.test_run,R=String(e.llm_model||x?.primary_model||"").trim(),W=String(e.embedding_model||"").trim(),te=[R?`LLM\uFF1A${R}`:"",W?`Embedding\uFF1A${W}`:""].filter(Boolean).join(" \xB7 "),z=f||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",de=L?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${r(h.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${y.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${y.map(fe=>`<tr>
                    <td>${r(fe.law_name||"\u2014")}</td>
                    <td class="cell-number">${r(fe.article_no||"\u2014")}</td>
                    <td>${r(fe.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${_.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${_.map(fe=>{let Ae=String(fe?.law_name||fe||"").trim(),$e=fe&&fe.index!==null&&fe.index!==void 0?` [${r(fe.index)}]`:"";return Ja(Ae,{label:`${Ae}${$e}`})}).join("")}
              </div>`:""}
      </div>`:"",xe=e.answer_source==="llm"&&R?`<span class="answer-model" title="${r(te)}">${g("brain",11)}${r(R)}</span>`:b?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${g("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",D=f?`${R||"LLM"} \xB7 \u751F\u6210\u4E2D`:xe?R||"structured":"retrieval",ke=x?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${Qe(x.status)}
          <span class="mono">${r(x.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(x.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(x.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${r(x.primary_model||"\u2014")}</span>
          <span>${Number(x.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",se=e.pipeline_flow&&typeof e.pipeline_flow=="object"?e.pipeline_flow:null,je=!m&&se?Ua(se,{serverDurationMs:Number(e.duration_ms)||0,embedded:!0}):"",oe=String(e.answer||"").trim()||(f?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":m?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),ie=f?" data-partial-answer":"",he=f?" is-streaming":"";return`${de}
      ${S?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${m&&!$?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${n.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${Dd(n,d)}</div>
            </div>`:""}
      <div class="answer-block">
        ${S||L?`<div class="answer-block-head">
                <span>${r(z)}</span>
                <span>${r(D)}</span>
              </div>`:""}
        <p class="answer-text${he}"${ie}>${r(oe)}</p>
      </div>
      ${u?'<div class="answer-notice" data-rerank-degraded="true">\u6392\u5E8F\u7CBE\u7C21\u6A21\u5F0F\uFF1A\u672C\u6B21\u90E8\u5206 rerank \u903E\u6642\u6216\u964D\u7D1A\uFF0C\u4F86\u6E90\u53EF\u80FD\u4EE5\u5411\u91CF\u9806\u5E8F\u986F\u793A\u3002</div>':""}
      ${e.notice?`<div class="answer-notice">${r(e.notice)}</div>`:""}
      ${ke}
      ${j}
      ${F}
      ${je}`}function go(e,t,s=""){let a=t.status||"preview",n=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),m=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),f=t.answer_source==="structured",u=t.answer_source==="llm"&&o?`<span class="answer-model" title="${r(m)}">${g("brain",11)}${r(o)}</span>`:f?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${g("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${g("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${Qe(a,n)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${u}
      </div>
      ${s}
    </div>
    <div class="answer-body">${vo(t)}</div>`}function zd(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${g("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${De({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function Ud(e){let t=Array.isArray(e.turns)?e.turns:[],s=t.length?t[t.length-1].payload||{}:e.payload||{},a=Array.isArray(s.citations)?s.citations.length:0,n=Array.isArray(s.judgments)?s.judgments.length:0,i=Array.isArray(s.law_sources)?s.law_sources.length:0;return a+n+i}function Gd(e,t,s,a=null){let n=e.id??s,i=Ud(e),o=t.get(String(e.project_id||"")),l=Array.isArray(e.turns)?e.turns:[],m=e.updated_at||e.created_at,f=a!=null&&String(a)===String(n);return`<div class="rag-history-item${e.pinned?" is-pinned":""}${f?" is-active":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${r(String(n))}">
      <span class="history-question">${r(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${r(Js(m))}</span>
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
  </div>`}function fo(e,t,s){let a=new Map;for(let i of t){let o=String(i.project_id||"");o&&a.set(o,(a.get(o)||0)+1)}let n=[`<button class="rag-project${s?"":" is-active"}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${s?"false":"true"}">
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
  </div>`),n.join("")}async function Qd(e){let t=!1,s=[],a=!1,n=[],i=!1,o="",l=8,m="",f=0,u=null,$=[],b=!1,d=!1,h={embedding:[],llm:[]},y=null,_=null,L=!1;e.innerHTML=`<section class="page rag-page">
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
      <div id="rag-mode-notice">${De({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
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
        ${kd.map(w=>`<button class="example-chip" type="button" data-question="${r(w)}">${r(w)}</button>`).join("")}
      </div>
    </header>

    <section class="rag-conversation" id="rag-conversation" aria-live="polite">
      <div class="rag-turns" id="rag-turns">
        ${nr()}
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
  </section>`;let S=e.querySelector("#rag-form"),A=e.querySelector("#rag-question"),I=e.querySelector("#rag-submit"),re=e.querySelector(".rag-page"),Y=e.querySelector("#rag-turns"),we=e.querySelector("#rag-followup-form"),ge=e.querySelector("#rag-followup-question"),F=e.querySelector("#rag-followup-submit"),j=e.querySelector("#rag-history"),x=e.querySelector("#rag-storage-note"),R=e.querySelector("#rag-clear-history"),W=e.querySelector(".rag-library"),te=e.querySelector("#rag-pinned-body"),z=e.querySelector("#rag-projects-body"),de=e.querySelector("#rag-pinned-count"),xe=e.querySelector("#rag-projects-count"),D=e.querySelector("#rag-recent-count"),ke=e.querySelector("#rag-library-context"),se=e.querySelector("#rag-test-mode"),je=e.querySelector("#rag-test-flow"),_e=e.querySelector("#rag-history-menu"),oe=e.querySelector("#rag-judgment-dialog"),ie=e.querySelector("#rag-law-dialog"),he=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};oe?.addEventListener("close",he),ie?.addEventListener("close",he);let fe=null,Ae=null,$e,Pe=null,Ue=null,C=()=>{A.style.height="auto",A.style.height=`${Math.min(A.scrollHeight,220)}px`},O=()=>{ge.style.height="auto",ge.style.height=`${Math.min(ge.scrollHeight,160)}px`},k=w=>{b=!!w,re.classList.toggle("has-conversation",b)},E=()=>{b&&(we.hidden=!1,O())},X=()=>{we.hidden=!0},H=()=>{_e.hidden&&!Ue||(_e.hidden=!0,_e.innerHTML="",Ue&&Ue.setAttribute("aria-expanded","false"),Pe=null,Ue=null)},Re=(w,U)=>{let Q=Y.querySelector(".rag-empty-answer");Q&&Q.remove(),Y.insertAdjacentHTML("beforeend",lo(w,U));let p=Y.lastElementChild,v=p?.querySelector("[data-rag-answer]");return window.requestAnimationFrame(()=>{p?.scrollIntoView({behavior:"smooth",block:"start"})}),{turnElement:p,answerElement:v}},Ce=()=>{Y.innerHTML=$.length?$.map(w=>lo(w.question,go(w.question,w.payload||{},""))).join(""):nr()},Ie=w=>{let U=Array.isArray(w.turns)?w.turns:[];return U.length?(f+=1,Xt(),Tt(null),u=w.id??null,$=U.map(Q=>({...Q})),m=$[$.length-1]?.question||"",k(!0),Ce(),E(),Fe(),Me(I,!1),Me(F,!1),window.setTimeout(()=>{we.scrollIntoView({behavior:"smooth",block:"end"})},50),!0):!1},Fe=()=>{if(t)return;if(H(),!a){j.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',te.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',de.textContent="0",D.textContent="0",i&&(z.innerHTML=fo(n,[],o));return}let w=n.find(G=>String(G.id)===o)||null;o&&!w&&(o="");let U=new Map(n.map(G=>[String(G.id),G])),Q=s.filter(G=>!!G.pinned),p=s.filter(G=>!G.pinned),v=o?p.filter(G=>String(G.project_id||"")===o):p,M=v.slice(0,l),V=(G,J)=>Gd(G,U,J,u);te.innerHTML=Q.length?Q.map(V).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',z.innerHTML=fo(n,s,o),j.innerHTML=M.length?M.map(V).join(""):`<div class="rag-library-empty">${o?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u672A\u91D8\u9078\u7684\u9805\u76EE\u3002":Q.length?"\u6700\u8FD1\u7684\u9805\u76EE\u90FD\u5DF2\u91D8\u9078\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,v.length>l&&j.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${c(v.length-l)} \u7B46</button>`),de.textContent=String(Q.length),xe.textContent=String(n.length),D.textContent=String(v.length),w?(ke.hidden=!1,ke.innerHTML=`<span>${g("folder",12)}<strong>${r(w.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${g("x",12)}</button>`):(ke.hidden=!0,ke.innerHTML="")},Ye=async()=>{try{let w=await ms("rag.projects",[]);n=Array.isArray(w)?w.map(U=>({id:String(U?.id||""),name:String(U?.name||"").trim()})).filter(U=>U.id&&U.name):[]}catch{n=[]}i=!0,t||Fe()},We=w=>{o=String(w||""),l=8,Fe()},it=()=>{let w=z.querySelector('[data-rag-form="project"]');w&&(w.hidden=!1,w.querySelector("input")?.focus())},_t=()=>{let w=z.querySelector('[data-rag-form="project"]');w&&(w.hidden=!0,w.reset())},jt=async w=>{let U=w.elements.project_name,Q=String(U?.value||"").trim();if(!Q){P("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),U?.focus();return}if(n.some(v=>v.name.toLowerCase()===Q.toLowerCase())){P("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),U?.focus();return}let p=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;n=[...n,{id:p,name:Q.slice(0,60),created_at:new Date().toISOString()}],o=p,l=8,await sa("rag.projects",n),Fe(),P(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${Q}\u300D\u3002`,"ok")},Ke=async w=>{let U=s.find(v=>String(v.id)===String(w));if(!U)return;let Q=!U.pinned;if(!await ta(U.id,{pinned:Q})){P("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}U.pinned=Q,Fe(),P(Q?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},mt=()=>{f+=1,Xt(),Tt(null),m="",u=null,$=[],k(!1),X(),Y.innerHTML=nr(),A.value="",C(),ge.value="",O(),Me(I,!1),Me(F,!1),Fe(),oe?.open&&oe.close(),ie?.open&&ie.close(),A.focus(),window.scrollTo({top:0,behavior:"smooth"})},Bt=w=>{if(!w||_e.hidden)return;let U=w.getBoundingClientRect(),Q=_e.getBoundingClientRect(),p=6,v=U.bottom+p;v+Q.height>window.innerHeight-8&&(v=Math.max(8,U.top-Q.height-p));let M=U.right-Q.width;M=Math.max(8,Math.min(M,window.innerWidth-Q.width-8)),_e.style.left=`${Math.round(M)}px`,_e.style.top=`${Math.round(v)}px`},ne=w=>{_e.innerHTML=`
      <button type="button" role="menuitem" data-menu-action="rename">${g("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${g("pin",13)}<span>${w.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${g("link",13)}<span>\u5206\u4EAB</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${g("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${g("trash",13)}<span>\u522A\u9664</span></button>`},ye=w=>{let U=String(w.project_id||""),Q=[{id:"",name:"\u672A\u5206\u985E"},...n.map(p=>({id:String(p.id),name:p.name}))];_e.innerHTML=`
      <div class="rag-history-menu-head">${g("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${Q.map(p=>`<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${r(p.id)}">
            <span class="rag-history-menu-check">${U===p.id?g("check",12):""}</span>
            <span>${r(p.name)}</span>
          </button>`).join("")}
      ${n.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${g("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},Je=(w,U)=>{let Q=s.find(p=>String(p.id)===String(U));Q&&(H(),Pe=String(Q.id),Ue=w,ne(Q),_e.hidden=!1,w.setAttribute("aria-expanded","true"),Bt(w))},Ze=async w=>{let U=window.prompt("\u91CD\u65B0\u547D\u540D\u5C0D\u8A71",w.title||"");if(U===null)return;let Q=U.trim();if(!Q){P("\u540D\u7A31\u4E0D\u80FD\u7A7A\u767D\u3002","warn");return}if(Q===w.title)return;if(!await ta(w.id,{title:Q})){P("\u91CD\u65B0\u547D\u540D\u5931\u6557\u3002","danger");return}w.title=Q,Fe(),P("\u5C0D\u8A71\u5DF2\u91CD\u65B0\u547D\u540D\u3002","ok")},Ft=async w=>{let U=Array.isArray(w.turns)?w.turns:[],Q=[`# ${w.title||"\u672A\u547D\u540D\u5C0D\u8A71"}`,""];if(U.length)for(let v of U){Q.push("## \u554F\u984C","",v.question||"",""),Q.push("## \u56DE\u7B54","",v.payload?.answer||"\uFF08\u6C92\u6709\u56DE\u7B54\u5167\u5BB9\uFF09","");let M=Array.isArray(v.payload?.law_sources)?v.payload.law_sources.map(V=>V.law_name).filter(Boolean):[];M.length&&Q.push(`\u5F15\u7528\uFF1A${[...new Set(M)].join("\u3001")}`,"")}else Q.push(w.title||"");let p=await Ms(Q.join(`
`));P(p?"\u5C0D\u8A71\u5167\u5BB9\u5DF2\u8907\u88FD\uFF0C\u53EF\u76F4\u63A5\u8CBC\u4E0A\u5206\u4EAB\u3002":"\u7121\u6CD5\u8907\u88FD\u5C0D\u8A71\u5167\u5BB9\u3002",p?"ok":"warn")},Ot=async w=>{if(!window.confirm(`\u522A\u9664\u5C0D\u8A71\u300C${w.title||"\u672A\u547D\u540D\u5C0D\u8A71"}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002`))return;if(!await bi(w.id)){P("\u522A\u9664\u5931\u6557\u3002","danger");return}let Q=u!==null&&String(u)===String(w.id);s=s.filter(p=>String(p.id)!==String(w.id)),Q?mt():Fe(),P("\u5C0D\u8A71\u5DF2\u522A\u9664\u3002","ok")},q=async(w,U)=>{if(!await ta(w.id,{project_id:U})){P("\u79FB\u81F3\u5C08\u6848\u5931\u6557\u3002","danger");return}w.project_id=U;let p=n.find(v=>String(v.id)===String(U));Fe(),P(p?`\u5DF2\u79FB\u81F3\u5C08\u6848\u300C${p.name}\u300D\u3002`:"\u5DF2\u79FB\u51FA\u5C08\u6848\u3002","ok")},T=async w=>{let U=w.target.closest("[data-menu-action]");if(!U)return;let Q=s.find(v=>String(v.id)===Pe);if(!Q){H();return}let p=U.dataset.menuAction;p==="rename"?(H(),await Ze(Q)):p==="toggle-pin"?(H(),await Ke(Q.id)):p==="share"?(H(),await Ft(Q)):p==="move"?(ye(Q),Bt(Ue)):p==="assign-project"?(H(),await q(Q,U.dataset.projectId||"")):p==="back"?(ne(Q),Bt(Ue)):p==="delete"&&(H(),await Ot(Q))},N=w=>{_e.hidden||(typeof w.composedPath=="function"?w.composedPath():[]).includes(_e)||_e.contains(w.target)||w.target.closest('[data-rag-action="open-history-menu"]')||H()},B=w=>{w.key==="Escape"&&H()},Z=w=>{w.target instanceof Node&&_e.contains(w.target)||H()},ae=async()=>{try{if(s=await Ta({limit:120}),t)return;a=!0,Fe(),x.textContent=Zs()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;s=[],a=!0,Fe(),j.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},pe=async(w,U,Q,p)=>{let v=$,M=u;v.push({question:w,asked_at:new Date().toISOString(),payload:qd(U)});let V=Array.isArray(U.citations)?U.citations:[],G=Array.isArray(U.judgments)?U.judgments:[],J={question:w,status:U.status,citations:V.map(me=>me.law_name),judgments:G.map(me=>me.jid)},be=`${U.status||"preview"} \xB7 ${v.length} \u8F2A`,ee=new Date().toISOString(),le=me=>{p===f&&(u=me)};if(M){if(!await ta(M,{turns:v,detail:be,payload:J,updated_at:ee})){let Se=await ea({kind:"rag",title:v[0]?.question||w,detail:be,project_id:Q,turns:v,payload:J,updated_at:ee});le(Se)}}else{let me=await ea({kind:"rag",title:v[0]?.question||w,detail:be,project_id:Q,turns:v,payload:J,updated_at:ee});le(me)}await ae()},Te=()=>{let w=e.querySelector("#rag-mode-notice");if(!w)return;let U=Array.isArray(y?.model_summary)?y.model_summary:[];if(!y){if(!_)return;w.innerHTML=Qa({tone:"warn",title:"\u7121\u6CD5\u53D6\u5F97 RAG \u670D\u52D9\u72C0\u614B",text:_.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u524D\u5F80\u7CFB\u7D71\u72C0\u614B\u9801\u67E5\u770B\u3002",modelSummary:U,refreshing:L});return}let Q=y.data||{},p=(y.services||[]).find(V=>V.id==="rag"),v=Number(Q.judgment_indexed_count||0),M=Number(Q.judgment_count||0);p?.status==="operational"?w.innerHTML=Qa({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${c(v)} / ${c(M)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`,modelSummary:U,refreshing:L}):p?.status==="degraded"?w.innerHTML=Qa({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:p.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002",modelSummary:U,refreshing:L}):w.innerHTML=Qa({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:p?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002",modelSummary:U,refreshing:L})},Be=async()=>{try{let w=await K.status();if(t)return;y=w,_=null}catch(w){if(t)return;y=null,_=w}Te()},Ne=async()=>{if(!L){L=!0,Te();try{let w=await K.status();if(t)return;y=w,_=null,P("\u5DF2\u66F4\u65B0\u6A21\u578B\u72C0\u614B\u3002","ok",2500)}catch(w){P(w.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u3002","danger",6e3)}finally{L=!1,t||Te()}}},Oe=()=>{if(!se)return;if(!d){se.innerHTML="";return}let w=Array.isArray(h.embedding)?h.embedding.length:0,U=Array.isArray(h.llm)?h.llm.length:0;se.innerHTML=De({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${w} \u500B embedding \u8207 ${U} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},et=async()=>{try{let w=await K.testMode();if(t)return;d=!!w.enabled,h=w.models||{embedding:[],llm:[]},Oe()}catch{if(t)return;d=!1,Oe()}},nt=w=>{d=!!w.detail?.enabled,h=w.detail?.models||{embedding:[],llm:[]},Oe()};window.addEventListener("judgment:test-mode",nt);let Tt=w=>{if(!je)return;Ae=w||null;let U=JSON.stringify(w?{run_id:w.run_id,status:w.status,progress:w.progress,total_ms:w.total_ms,stage:w.stage,answer:w.answer||"",steps:(w.steps||[]).map(Q=>`${Q.stage}:${Q.model}:${Q.status}:${Q.progress}:${Q.duration_ms}`)}:null);U!==$e&&($e=U,je.innerHTML=w?Is(w,[],"",{showHistory:!1}):"")},Xt=()=>{fe&&(fe(),fe=null)},Fs=async(w=null)=>{if(!t)try{let U=w||await K.testRunCurrent();if(t)return;let Q=U.run;Q&&Q.status==="running"&&Tt(Q)}catch{}},pa=()=>{t||fe||(Fs(),fe=bt("test-runs",(w,U)=>Fs(U?.snapshot||null)))},bs=async w=>{if(!w){Tt(null);return}try{let U=await K.testRun(w);if(t)return;Tt(U.run||null)}catch{t||P("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},kt=async()=>{if(d)try{let w=await K.testRunCurrent();if(t)return;w.run?.status==="running"&&(Tt(w.run),pa())}catch{}},As=0,Os=(w,U)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${r(w)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${g("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${U}</div>`,ma=w=>{let U=(Array.isArray(w.citations)?w.citations:[]).map(V=>bo(V)).filter(Boolean).join(""),Q=U||(Array.isArray(w.matched_laws)?w.matched_laws:[]).map(V=>Ja(V)).join(""),p=[w.court,w.jdate,w.title?`\u6848\u7531\uFF1A${w.title}`:"",w.full_text_length?`${c(w.full_text_length)} \u5B57`:"",w.citation_count?`\u5F15\u7528 ${c(w.citation_count)} \u7B46`:""].filter(Boolean).map(V=>`<span>${r(V)}</span>`).join(""),v=w.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${r(String(w.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",M=w.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(w.pdf_url)}" target="_blank" rel="noopener noreferrer">${g("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return Os(w.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${r(w.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${p}
      </div>
      ${U?'<div class="citation-meta" style="margin-top:8px"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':""}
      ${Q?`<div class="chips" style="margin:8px 0 10px">${Q}</div>`:""}
      <div class="judgment-dialog-source">${v}</div>
      <pre class="judgment-dialog-text">${r(w.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${M}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},qs=async w=>{if(!oe||!w)return;let U=++As;oe.open||oe.showModal(),he(),oe.innerHTML=Os("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${r(w)}\u2026</span>
      </div>`);try{let Q=await K.judgmentDetail(w,"parquet");if(t||U!==As)return;oe.innerHTML=ma(Q)}catch(Q){if(t||U!==As)return;oe.innerHTML=Os("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(Q.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},qt=0,Hs=(w,U)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${r(w)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${g("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${U}</div>`,rn=(w,U="")=>{let Q=String(w.selected_article_no||U||"").trim(),p=!!Q,v=Array.isArray(w.articles)?w.articles:[],M=v.map(Ve=>{let ot=String(Ve.article_content||"").trim();return ot?Ve.article_type==="C"?`<div class="law-chapter">${r(ot)}</div>`:`<article class="law-article" data-article-no="${r(po(Ve.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${r(Ve.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${r(ot)}</div>
        </article>`:""}).join(""),V=(Array.isArray(w.warnings)?w.warnings:[]).map(Ve=>r(Ve)).join("<br />"),G=w.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",J=w.meta?.articles_source,be=J==="parquet"?"Parquet \u689D\u6587":J==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",ee=w.meta?.snapshot||"",le=[w.law_level,w.law_category,w.article_count?`${c(w.article_count)} \u689D`:"",w.law_modified_date?`\u7570\u52D5 ${Rt(w.law_modified_date)}`:""].filter(Boolean).map(Ve=>`<span>${r(Ve)}</span>`).join(""),me=w.law_url?`<a class="btn btn-secondary btn-sm" href="${r(w.law_url)}" target="_blank" rel="noopener noreferrer">${g("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",Se=!p&&w.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${r(w.law_histories)}</div>
        </details>`:"",Ee=p?`<span class="badge badge-mono">${r(Q)}</span>`:"",qe=!p&&v.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",Ge=p?`${w.law_name||w.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${Q}`:w.law_name||w.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return Hs(Ge,`<div class="judgment-dialog-meta">
        <span class="badge ${w.source_type==="order"?"badge-warn":"badge-info"}">${r(G)}</span>
        ${Ee}
        ${le}
      </div>
      <div class="judgment-dialog-source">${r([be,ee].filter(Boolean).join(" \xB7 "))}</div>
      ${V?`<div class="law-dialog-warning">${V}</div>`:""}
      ${Se}
      ${qe}
      <div class="law-dialog-articles">${M||`<div class="report-empty-inline">${p?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${me}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},ga=(w,U)=>{let Q=w?.querySelector(`#${U}`),p=po(Q?.value||"");if(!p){P("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),Q?.focus();return}let v=[...w?.querySelectorAll("[data-article-no]")||[]].find(M=>M.dataset.articleNo===p);if(!v){P(`\u627E\u4E0D\u5230\u7B2C ${p} \u689D\u3002`,"warn");return}v.scrollIntoView({behavior:"instant",block:"center"}),v.classList.add("is-jump-target"),window.setTimeout(()=>v.classList.remove("is-jump-target"),2400)},zs=async(w,U="",Q="")=>{if(!ie||!w)return;let p=++qt;ie.open||ie.showModal(),he(),ie.innerHTML=Hs(Q?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${r([w,Q].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let v=await K.lawDetail(w,U,"",Q);if(t||p!==qt)return;ie.innerHTML=rn(v,Q)}catch(v){if(t||p!==qt)return;ie.innerHTML=Hs("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(v.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};ie?.addEventListener("click",w=>{let U=w.target.closest('[data-action="jump-law-article"]');if(U){ga(ie,U.dataset.jumpInput||"rag-law-article-jump");return}if(w.target.closest('[data-action="close-law-source"]')){ie.close();return}let Q=ie.getBoundingClientRect();(w.clientX<Q.left||w.clientX>Q.right||w.clientY<Q.top||w.clientY>Q.bottom)&&ie.close()}),ie?.addEventListener("keydown",w=>{!w.target.matches(".law-jump-input")||w.key!=="Enter"||(w.preventDefault(),ga(ie,w.target.id))}),oe?.addEventListener("click",w=>{let U=w.target.closest('[data-action="open-law-source"]');if(U){zs(U.dataset.lawKey||"",U.dataset.sourceType||"",U.dataset.articleNo||"");return}if(w.target.closest('[data-action="close-parquet-judgment"]')){oe.close();return}let Q=oe.getBoundingClientRect();(w.clientX<Q.left||w.clientX>Q.right||w.clientY<Q.top||w.clientY>Q.bottom)&&oe.close()}),Y.addEventListener("click",w=>{let U=w.target.closest(".rag-process-toggle");if(U){let p=U.closest(".rag-process"),v=U.getAttribute("aria-expanded")==="true";rr(p,!v);return}let Q=w.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(Q){if(Q.dataset.action==="open-law-source"){zs(Q.dataset.lawKey||"",Q.dataset.sourceType||"",Q.dataset.articleNo||"");return}qs(Q.dataset.jid||"")}}),Y.addEventListener("keydown",w=>{if(w.key!=="Enter"&&w.key!==" ")return;let U=w.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!U||U.closest("a, button"))){if(w.preventDefault(),U.dataset.action==="open-law-source"){zs(U.dataset.lawKey||"",U.dataset.sourceType||"",U.dataset.articleNo||"");return}qs(U.dataset.jid||"")}});let hs=async(w,{fresh:U=!1,source:Q="hero"}={})=>{let p=w.trim();if(!p){P("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),(Q==="followup"?ge:A).focus();return}(U||!b)&&(u=null,$=[],Y.innerHTML="",Fe());let v=++f,M=()=>t||v!==f,V=o;m=p,k(!0),X(),Q==="followup"?(ge.value="",O()):(A.value="",C());let{answerElement:G}=Re(p,Nd(p,d)),J=d?null:Td(G);d?(Tt(null),pa()):(Xt(),Tt(null)),Me(I,!0,"\u6AA2\u7D22\u4E2D\u2026"),Me(F,!0,"\u6AA2\u7D22\u4E2D\u2026");let be=null,ee="",le=qe=>{if(M()||!qe?.partial)return;let Ge=G.querySelector(".answer-body");if(!Ge)return;be=qe,ee=String(qe.answer||""),Ge.innerHTML=vo(qe),J?.collapse?.();let Ve=G.querySelector(".answer-head-title");Ve&&(Ve.textContent=qe.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},me=qe=>{if(M()||!qe||!be?.streaming)return;ee+=qe;let Ge=G.querySelector("[data-partial-answer]");Ge&&(Ge.textContent=ee)},Se=()=>{if(M()||!be?.streaming)return;ee="";let qe=G.querySelector("[data-partial-answer]");qe&&(qe.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")},Ee=qe=>{if(M())return;let Ge=G.querySelector(".answer-body");if(!Ge)return;let Ve=Ge.querySelector("[data-summary-queue]");Ve||(Ve=document.createElement("div"),Ve.className="answer-notice",Ve.dataset.summaryQueue="true",Ge.appendChild(Ve));let ot=Number(qe.position||0),at=Number(qe.eta_s||0),gt=qe.lane==="summary"?"\u6458\u8981":"\u6AA2\u7D22";Ve.textContent=`${gt}\u6392\u968A\u4E2D\uFF1A\u524D\u9762 ${ot} \u4F4D\uFF0C\u9810\u4F30\u7D04 ${Math.round(at)} \u79D2\u3002`};try{let qe=d?await K.rag(p,{testMode:d}):await K.ragStream(p,{onStep:Ve=>{M()||J?.step(Ve)},onPartial:le,onQueued:Ee,onToken:me,onTokenReset:Se});if(M())return;Xt();let Ge=J?.finish(!0)||"";if(G.innerHTML=go(p,qe,Ge),qe.pipeline_flow||Ad(qe).then(()=>{if(M()||!qe.pipeline_flow)return;let Ve=G.querySelector(".answer-body");if(!Ve||Ve.querySelector(".rag-wf-card"))return;let ot=Ua(qe.pipeline_flow,{serverDurationMs:Number(qe.duration_ms)||0,embedded:!0});ot&&Ve.insertAdjacentHTML("beforeend",ot)}),qe.test_run?.run_id?await bs(qe.test_run.run_id):Tt(null),await pe(p,qe,V,v),M())return;E()}catch(qe){if(M())return;Xt();let Ge=J?.finish(!1)||"";G.innerHTML=zd(qe,Ge),E(),P(qe.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{M()||(Xt(),Me(I,!1),Me(F,!1))}};S.addEventListener("submit",w=>{w.preventDefault(),hs(A.value,{fresh:!0,source:"hero"})}),we.addEventListener("submit",w=>{w.preventDefault(),hs(ge.value,{fresh:!1,source:"followup"})}),A.addEventListener("input",C),A.addEventListener("keydown",w=>{w.key==="Enter"&&!w.shiftKey&&!w.isComposing&&(w.preventDefault(),S.requestSubmit())}),ge.addEventListener("input",O),ge.addEventListener("keydown",w=>{w.key==="Enter"&&!w.shiftKey&&!w.isComposing&&(w.preventDefault(),we.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",w=>{let U=w.target.closest("[data-question]");U&&(A.value=U.dataset.question,C(),S.requestSubmit())}),e.addEventListener("click",async w=>{w.target.closest('[data-rag-action="refresh-models"]')&&await Ne()}),W.addEventListener("click",async w=>{let U=w.target.closest("[data-rag-toggle]");if(U){let G=U.closest(".rag-library-section").classList.toggle("is-collapsed");U.setAttribute("aria-expanded",String(!G));return}let Q=w.target.closest("[data-rag-action]"),p=Q?.dataset.ragAction||"";if(p==="new-chat"){mt();return}if(p==="open-history-menu"){Je(Q,Q.dataset.historyId);return}if(p==="toggle-pin"){await Ke(Q.dataset.historyId);return}if(p==="select-project"){We(Q.dataset.projectId||"");return}if(p==="show-project-form"){it();return}if(p==="cancel-project"){_t();return}if(p==="more-recent"){l+=12,Fe();return}if(p==="clear-project"){We("");return}let v=w.target.closest("[data-history-open]");if(!v)return;let M=s.find(V=>String(V.id)===String(v.dataset.historyId));M&&(o=String(M.project_id||""),Fe(),!Ie(M)&&(u=null,$=[],hs(M.title,{fresh:!0,source:"history"})))}),W.addEventListener("submit",async w=>{let U=w.target.closest('[data-rag-form="project"]');U&&(w.preventDefault(),await jt(U))}),_e.addEventListener("click",T),document.addEventListener("click",N),document.addEventListener("keydown",B),window.addEventListener("scroll",Z,{capture:!0,passive:!0}),window.addEventListener("resize",H),R.addEventListener("click",async()=>{if(!s.length){P("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await hi(),await ae(),P("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),C(),await Promise.allSettled([Be(),ae(),Ye(),et()]),await kt();let Nt="";try{Nt=window.sessionStorage.getItem("judgment.pending_question")||"",window.sessionStorage.removeItem("judgment.pending_question")}catch{Nt=""}return!Nt&&typeof window.__judgmentPendingQuestion=="string"&&(Nt=window.__judgmentPendingQuestion),delete window.__judgmentPendingQuestion,Nt=String(Nt||"").trim().slice(0,500),Nt&&A&&(A.value=Nt,C(),window.setTimeout(()=>{t||hs(Nt,{fresh:!0,source:"home"})},40)),()=>{t=!0,Xt(),H(),document.removeEventListener("click",N),document.removeEventListener("keydown",B),window.removeEventListener("scroll",Z,{capture:!0}),window.removeEventListener("resize",H),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",nt),m&&Y.setAttribute("data-last-question",m)}}var yr={};ls(yr,{render:()=>Ku});var dr=new Set(["legal_index_versions","judgment_import","index_versions"]),$o=new Map,ur=new Set,pr=new Set;function or(e){let t=Number(e);if(!Number.isFinite(t)||t<0)return"\u2014";if(t<60)return`${Math.round(t)} \u79D2`;let s=Math.floor(t/60),a=Math.round(t%60);if(s<60)return`${s} \u5206 ${a} \u79D2`;let n=Math.floor(s/60),i=s%60;if(n<24)return`${n} \u5C0F\u6642 ${i} \u5206`;let o=Math.floor(n/24),l=n%24;return`${o} \u5929 ${l} \u5C0F\u6642`}function lr(e){return String(e||"").trim().replace(/:latest$/,"")}var Jd={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},partial:{label:"\u90E8\u5206\u5B8C\u6210",tone:"warn"},update:{label:"\u66F4\u65B0",tone:"warn"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"},provided:{label:"\u5916\u90E8\u63D0\u4F9B",tone:"info"}},mr=["download","parquet","postgres","qdrant"],Wd={download:"\u4E0B\u8F09",parquet:"Parquet",postgres:"PostgreSQL",qdrant:"Qdrant"},Vd={judgment:{download:["download"],parquet:["raw_parquet","extract"],postgres:["postgres"],qdrant:["qdrant"]},law:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]},order:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]}},yo={complete:"\u5B8C\u6210",incomplete:"\u672A\u5B8C\u6210",pending:"\u5F85\u66F4\u65B0",processing:"\u8655\u7406\u4E2D",empty:"\u7121\u8CC7\u6599",not_applicable:"\u5DF2\u53D6\u4EE3"},wo={complete:"is-green",incomplete:"is-red",pending:"is-pending",processing:"is-gray",empty:"is-empty",not_applicable:"is-empty"};var It=new Map,Dt="",_s="",_o={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},ko={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Kd={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"};var So={law_download:"law",order_download:"order",judgment_download:"judgment"},xo={law_download:"\u6CD5\u898F\u4E0B\u8F09",order_download:"\u547D\u4EE4\u4E0B\u8F09",judgment_download:"\u5224\u6C7A\u4E0B\u8F09"},Yd={law_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",order_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",judgment_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u5224\u6C7A RAR \u55CE\uFF1F\uFF08\u4E0D\u6703\u81EA\u52D5\u532F\u5165 PostgreSQL \u6216\u5EFA\u7ACB Qdrant \u7D22\u5F15\uFF09"},Xd={law_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u6CD5\u898F RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",order_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u547D\u4EE4 RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",judgment_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u53EA\u4E0B\u8F09\u5224\u6C7A RAR\u3002PostgreSQL\uFF0FParquet \u532F\u5165\u8207 Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\u300C\u5224\u6C7A\u532F\u5165\u300D\u6216\u5B8C\u6574\u8CC7\u6599\u66F4\u65B0\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_import:"\u6D41\u7A0B\u7BC4\u570D\uFF1ARAR \u2192 \u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD \u2192 \u91D1\u878D\u6CD5\u898F\u7BE9\u9078 \u2192 PostgreSQL\u3002Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_parquet:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5F9E PostgreSQL \u532F\u51FA\u67E5\u8A62\u7528 Parquet \u5FEB\u7167\uFF1B\u4E0D\u5BEB\u5165 Qdrant\uFF0FIndexedDB\u3002",index_versions:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5EFA\u7ACB\u4E26\u9A57\u8B49\u65B0\u7684 Qdrant collection\uFF0C\u5B8C\u6210\u5F8C\u539F\u5B50\u5207\u63DB alias\uFF1BIndexedDB \u4E0D\u53C3\u8207\u3002"};function fs(e){return Jd[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function At(e,t){let s=fs(e);return`<span class="badge ${_o[s.tone]||_o.idle}"><span class="status-dot ${ko[s.tone]||ko.idle}"></span>${r(t||s.label)}</span>`}function pt(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function Ao(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":c(e)}function Mo(e){return e&&e.color?String(e.color):"var(--accent)"}function fr(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return["skipped","pending","idle"].includes(e.status)?"\u2014":s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${Le(s)} / ${Le(a)}`:Le(s):a?`${c(s)} / ${c(a)} ${t}`:`${c(s)} ${t}`}function ks(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${r(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function Zd(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},n=e.raw_backups||{},i=n.totals||{},o=e.state||{},l=e.capabilities||{},m=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",f=t.status==="operational",u=s.status==="operational",$=a.available!==!1,b=n.available!==!1,d=u?`${c(s.indexed)} / ${c(s.total)}`:At(s.status||"unavailable"),h=u?`${pt(s.percent)} \xB7 \u5C1A\u9918 ${c(s.remaining)} \u7B46`:r(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),y=$?`${c(a.unprocessed)} / ${c(a.total)}`:At("unavailable"),_=$?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${Le(a.unprocessed_bytes)} \u5F85\u8655\u7406`:r(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${Kt(mu(e))}
    ${ks("\u8655\u7406\u72C0\u614B",At(e.status||"unknown"),`${r(m)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${ks("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",r(y),_)}
    ${ks("\u539F\u59CB\u8CC7\u6599\u5099\u4EFD",b?`${c(n.count)} \u6A94`:At("unavailable"),b?`\u5171 ${c(i.row_count)} \u7B46 \xB7 ${Le(i.compressed_bytes)}`:r(n.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB\u8CC7\u6599\u5099\u4EFD\u3002"))}
    ${ks("PostgreSQL \u5224\u6C7A",f?c(t.judgment_count):At("unavailable"),f?`\u6CD5\u898F ${Ao(t.law_count)} \xB7 \u547D\u4EE4 ${Ao(t.order_count)}`:r(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${ks("Qdrant \u7D22\u5F15",d,h)}
    ${ks("\u72C0\u614B\u6A94",At(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${r(ve(o.updated_at))}`:r(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${ks("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?r(l.start_blocked_reason):`\u672A\u8655\u7406 ${c(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${c(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${c(l.external_processes)} \u500B`:""}`)}
  </div>`}function eu(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let n=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${r(o.color||"var(--accent)")}" title="${r(`${o.label} ${ue(o.duration_ms)} (${pt(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${r(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${r(o.label)}</span>
        <span class="mono">${ue(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${pt(o.percent)}</span>
        ${At(o.status)}
      </div>`).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section">
      <div class="processing-timeline-label">
        <span>${r(t.label||"\u968E\u6BB5\u8017\u6642")}</span>
        <span class="mono">\u7E3D\u8A08 ${ue(t.total_ms)}</span>
      </div>
      <div class="processing-stack" role="img" aria-label="\u968E\u6BB5\u8017\u6642\u6BD4\u4F8B">${n}</div>
      <div class="processing-legend">${i}</div>
    </div>
  </section>`}function tu(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let n=t.map(i=>{let o=s.get(i.branch)||Kd[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${r(o)}</span>
          <strong>${r(i.title||"\u8655\u7406")}</strong>
          ${At(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${r(ve(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?ue(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${r(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${n}</div></div>
  </section>`}function su(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>De({tone:s.tone||"info",title:s.title,text:r(s.message||"")})).join("")}</div>`:""}function Lo(e,t){if(e==="law"||e==="order")return t==="qdrant"?"legal_index_versions":`${e}_download`;if(e==="judgment"){if(t==="download")return"judgment_download";if(t==="parquet"||t==="postgres")return"judgment_import";if(t==="qdrant")return"index_versions"}return""}function br({month:e,year:t,monthNo:s,stageOrder:a,stageLabels:n,stageStatuses:i,overall:o,active:l,workflowForStage:m,stageProgress:f=null,variant:u="legacy"}){let $=i||{},b=u==="index"||u==="import",d=String(e?.month||`${t}${String(s).padStart(2,"0")}`),h=e?.month_label||`${t}-${String(s).padStart(2,"0")}`,y=F=>b&&F==="processing"?"\u57F7\u884C\u4E2D":yo[F]||yo.empty,_=F=>{let j=$[F]||"empty";if(!(j==="processing"||F==="qdrant"&&j==="incomplete"))return null;let R;if(typeof f=="function")R=f(F,d,j);else if(u==="import"&&f&&typeof f=="object")R=f[F];else return null;let W=Number(R);return Number.isFinite(W)?Math.max(0,Math.min(100,W)):null},L=a.map(F=>{let j=$[F]||"empty",x=_(F),R=F==="qdrant"&&j==="incomplete"&&x!==null&&x>0,W=R?"\u5DF2\u8655\u7406":y(j),te=!R&&x!==null&&x>0?` ${x.toFixed(1)}%`:"";return`${n[F]||F}\uFF1A${W}${te}`}).join(" \xB7 "),S=(e?.versions||[]).map(F=>F.version_code).filter(Boolean),A=[...new Set([...e?.files||[],...e?.local_files||[],...e?.imported_files||[]])].filter(Boolean),I=S.length?` \xB7 \u7248\u672C ${S.join("\u3001")}`:A.length?` \xB7 ${A.join("\u3001")}`:"",re=e?.detail?` \xB7 ${e.detail}`:"",Y=e?`${h} \xB7 ${L}${I}${re}`:`${h} \xB7 \u7121\u8CC7\u6599`,we=b?o==="empty"?"is-empty":"is-neutral":wo[o]||"is-empty",ge=a.map(F=>{let j=$[F]||"empty",x=j==="incomplete"||j==="pending"?m(F):"",R=x?"button":"span",W=x?` type="button" data-timeline-workflow="${r(x)}"`:"",te=_(F),z=F==="qdrant"&&j==="incomplete"&&te!==null&&te>0,de=j==="processing"&&te!==null?` ${te.toFixed(1)}%`:"",xe=z?"\u5DF2\u8655\u7406":y(j),D=j==="complete"?"is-complete":j==="processing"?"is-running":z?"is-partial":j==="incomplete"?"is-incomplete":j==="pending"?"is-pending":"is-empty",ke=b?["index-month-block","processing-month-stage",`is-${F}`,D,x?"is-actionable":""]:["processing-month-stage",`is-${F}`,wo[j]||"is-empty",D,x?"is-actionable":""],se=j==="processing"&&te!==null?` style="--stage-progress:${te.toFixed(1)}%"`:"";return`<${R} class="${ke.filter(Boolean).join(" ")}"${W}${se} title="${r(`${n[F]||F}\uFF1A${xe}${de}${x?"\uFF08\u9EDE\u9078\u524D\u5F80\u8655\u7406\uFF09":""}`)}" aria-label="${r(`${h} ${n[F]||F} ${xe}${de}${x?"\uFF0C\u9EDE\u9078\u524D\u5F80\u8655\u7406":""}`)}"></${R}>`}).join("");return b?`<td class="judgment-month index-month index-month-are processing-month ${we}${l?" is-current":""}" data-month="${r(d)}" title="${r(Y)}" aria-label="${r(Y)}"${l?' aria-current="true"':""}>
    <span class="index-month-number">${s}</span>
    <span class="index-month-blocks">${ge}</span>
  </td>`:`<td class="judgment-month import-month processing-month${l?" is-current":""} is-${r(o)}" data-month="${r(d)}" title="${r(Y)}" aria-label="${r(Y)}"${l?' aria-current="true"':""}>
    <span class="processing-month-number">${s}</span>
    <span class="processing-month-stages">${ge}</span>
  </td>`}function au(e,t,s,a,n){return br({month:t,year:s,monthNo:a,stageOrder:mr,stageLabels:Wd,stageStatuses:t?.stages||{},overall:t?.overall||"empty",active:!!(t?.active||t?.overall==="processing"),workflowForStage:i=>Lo(e.key,i),stageProgress:n,variant:"index"})}function nu(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=Number(s?.incomplete)||0,o=Number(s?.superseded)||0,l=a>0?(n+o)/a*100:null,m=["download","prepared","indexed"],f=0,u=0;for(let b of t){let d=b?.stages||{};for(let h of m){let y=d[h];!y||y==="empty"||y==="not_applicable"||(f+=1,y==="complete"&&(u+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(n),"\u5DF2\u5B8C\u6210 D\uFF0FP\uFF0FI \u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(i+(Number(s?.processing)||0)),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u5DF2\u53D6\u4EE3\u6708\u4EFD",c(o),"\u820A\u7248\u672C\u5DF2\u88AB\u76EE\u524D\u7248\u672C\u53D6\u4EE3\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",pt(l),"\u5B8C\u6210\u6216\u5DF2\u53D6\u4EE3\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c(u)} / ${c(f)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([b,d,h])=>`<span class="index-runtime-metric" title="${r(h)}"><span>${r(b)}</span><strong>${r(d)}</strong></span>`).join("")}</div>`}function ru(e,t,s,a){let n=Number(e?.total_months)||t.length||0,i=Number(s?.complete)||0,o=Number(s?.incomplete)||0,l=Number(s?.processing)||0,m=Number(a?.gray)||0,f=n>0?i/n*100:null,u=0,$=0;for(let d of t){let h=d?.import_stages||{};for(let y of["extract","raw_parquet","filter","postgres"]){let _=h[y];!_||_==="empty"||(u+=1,_==="complete"&&($+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(i),"\u56DB\u500B\u532F\u5165\u968E\u6BB5\u90FD\u5B8C\u6210\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(o+l),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\uFF08\u542B\u8655\u7406\u4E2D\uFF09\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",c(m),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(n),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",pt(f),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c($)} / ${c(u)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([d,h,y])=>`<span class="index-runtime-metric" title="${r(y)}"><span>${r(d)}</span><strong>${r(h)}</strong></span>`).join("")}</div>`}function iu(e,{titleSuffix:t="\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868"}={}){let s=`${r(e?.label||"\u6CD5\u898F\uFF0F\u547D\u4EE4")} ${r(t)}`,a=Array.isArray(e?.months)?e.months:[];if(!a.length)return`<section class="report-card processing-card import-files-card law-index-timeline-card">
      <div class="side-card-head">
        <span class="side-card-title">${g(e?.key==="order"?"file":"layers",14)}${s}</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u7121\u4E0B\u8F09\u7248\u672C\u6216\u7D22\u5F15\u7D00\u9304\u3002</div>
    </section>`;let n=new Map(a.map(b=>[String(b.month),b])),i=[...new Set(a.map(b=>b.year))].sort((b,d)=>String(d).localeCompare(String(b))),o=["download","prepared","indexed"],l=e.stage_labels||{download:"D \u4E0B\u8F09\u7248\u672C",prepared:"P \u8CC7\u6599\u5C31\u7DD2",indexed:"I \u7D22\u5F15\u8986\u84CB"},m=e.summary||{},f=e.current||{},u=i.map(b=>{let d=Array.from({length:12},(h,y)=>{let _=y+1,L=`${b}${String(_).padStart(2,"0")}`,S=n.get(L);return br({month:S,year:b,monthNo:_,stageOrder:o,stageLabels:l,stageStatuses:S?.stages||{},overall:S?.overall||"empty",active:!!S?.active,workflowForStage:A=>A==="indexed"?"legal_index_versions":`${e.key}_download`,variant:"index"})}).join("");return`<tr><th scope="row">${r(b)}</th>${d}</tr>`}).join(""),$=f.month?`<div class="index-current-row">
        <span class="badge badge-info">${g("activity",11)}${r(f.label||"\u76EE\u524D\u7248\u672C")}</span>
        <strong class="mono">${r(f.month_label||Ya(f.month))}</strong>
        <span class="mono">${r(f.file||"\u2014")}</span>
        <span class="index-current-copy">${r(f.detail||"")}</span>
      </div>`:"";return`<section class="report-card processing-card import-files-card law-index-timeline-card" data-law-index-timeline="${r(e.key||"")}">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${g(e.key==="order"?"file":"layers",14)}${s}</span>
      ${nu(e,a,m)}
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(b,d)=>`<th scope="col">${d+1}</th>`).join("")}</tr></thead>
          <tbody>${u}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">D\uFF1A\u4E0B\u8F09\u7248\u672C\uFF1BP\uFF1Araw Parquet + PostgreSQL \u5C31\u7DD2\uFF1BI\uFF1Aactive \u7D22\u5F15\u8986\u84CB\uFF08\u7531\u6CD5\u898F\uFF0F\u547D\u4EE4\u7D22\u5F15\u6D41\u7A0B\u7DAD\u8B77\uFF09\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF0C\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u5B8C\u6210\u8272\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u6216\u5DF2\u53D6\u4EE3\u3002\u820A\u7248\u672C\u986F\u793A\u300C\u5DF2\u53D6\u4EE3\u300D\uFF0C\u4E0D\u9700\u91CD\u5EFA\u7D22\u5F15\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u7DE8\u865F\u3001\u4E0B\u8F09\u6642\u9593\u8207\u7B46\u6578\u3002</p>
    </div>
  </section>`}function ou(e,t={}){let s=Array.isArray(e)?e:[];return s.length?`<div class="law-index-timelines">${s.map(a=>iu(a,t)).join("")}</div>`:""}function jo({activeMonth:e,activeArchive:t,activePhase:s="",processingMonth:a="",processingArchive:n="",stageLabels:i={}}){if(!e||!t)return"";let o=`${String(e).slice(0,4)}-${String(e).slice(4,6)}`,l=i[s]||(s?"\u6E96\u5099\u4E2D":""),m=`${String(a||"").slice(0,4)}-${String(a||"").slice(4,6)}`,f=!!a&&(a!==e||n!==t);return`<span class="badge badge-info">${g("activity",11)}\u76EE\u524D\u532F\u5165</span>
    <strong class="mono">${r(o)}</strong>
    <span class="mono">${r(t)}</span>
    ${l?`<span class="badge badge-neutral">${r(l)}</span>`:""}
    ${f?`<span class="processing-current-processing">
            <span class="faint">\u8655\u7406\u4E2D</span>
            <strong class="mono">${r(m)}</strong>
            <span class="mono">${r(n||"\u2014")}</span>
          </span>`:""}`}function lu(e,t,s,a){let n=[];for(let i=1;i<=12;i+=1){let o=`${t}${String(i).padStart(2,"0")}`;n.push(au(e,s.get(o),t,i,a))}return`<tr><th scope="row">${t}</th>${n.join("")}</tr>`}function cu(e){let t=e?.models||{};return[["Embedding",t.embedding],["Rerank",t.rerank]].filter(([,s])=>s&&(s.label||s.model)).map(([s,a])=>{let n=a.label||[a.host,a.model].filter(Boolean).join(" ")||"\u2014",i=[`${s} \u4E3B\u6A5F\u8207\u6A21\u578B\uFF1A${n}`,a.url?`\u7AEF\u9EDE\uFF1A${a.url}`:"",s==="Rerank"&&a.enabled===!1?"RAG_RERANK_ENABLED=false":""].filter(Boolean).join(" \xB7 ");return`<span class="processing-timeline-model" title="${r(i)}">${s} <strong class="mono">${r(n)}</strong>${s==="Rerank"&&a.enabled===!1?' <span class="faint">\u672A\u555F\u7528</span>':""}</span>`}).join("")}function du(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=a>0?n/a*100:null,o=t.reduce((u,$)=>{let b=$?.stages||{};return u+mr.filter(d=>!!b[d]&&b[d]!=="empty"&&b[d]!=="not_applicable").length},0),l=t.reduce((u,$)=>{let b=$?.stages||{};return u+mr.filter(d=>b[d]==="complete").length},0),m=(Number(s?.incomplete)||0)+(Number(s?.processing)||0);return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(n),"\u5DF2\u5B8C\u6210\u5168\u90E8\u56DB\u500B\u968E\u6BB5\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(m),"\u4ECD\u6709\u81F3\u5C11\u4E00\u500B\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",c(s?.update||0),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",pt(i),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c(l)} / ${c(o)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([u,$,b])=>`<span class="index-runtime-metric" title="${r(b)}"><span>${r(u)}</span><strong>${r($)}</strong></span>`).join("")}</div>`}function uu(e,t){let s=new Map((Array.isArray(e?.workflows)?e.workflows:[]).map(u=>[String(u.id||""),u])),a=t.key==="judgment"?"index_versions":"legal_index_versions",i=s.get(a)?.index_runtime||{},o=u=>{if(u==null||u==="")return null;let $=Number(u);return Number.isFinite($)?Math.max(0,Math.min(100,$)):null},l=new Map((Array.isArray(i.months)?i.months:[]).map(u=>[String(u?.month||""),o(u?.percent)])),m=new Map(Object.entries(i.active_coverage||{}).map(([u,$])=>[String(u),o($?.percent)])),f=(u,$)=>{let b=s.get(String(u||""));if(!b)return null;let d=b.progress||{},h=Array.isArray(d.stages)?d.stages:[];for(let y of $){let _=h.find(S=>String(S.key)===y),L=o(_?.percent);if(L!==null)return L}return o(d.percent)};return(u,$,b)=>{let d=String($||"");if(u==="qdrant"){let _=l.get(d),L=m.get(d);if(b==="processing"){if(_!==null&&_>0)return _;if(L!==null&&L>0)return L}else return b==="incomplete"?_!==null&&_>0?_:L!==null&&L>0?L:0:null}let h=Lo(t.key,u);if(!h)return null;let y=(Vd[t.key]||{})[u]||[u];return f(h,y)}}function pu(e){let t=Array.isArray(e.file_timelines)?e.file_timelines:[];return t.length?`<div class="processing-timeline-overview">${t.map(s=>{let a=Array.isArray(s.months)?s.months:[],n=new Map(a.map(u=>[String(u.month||""),u])),i=[...new Set(a.map(u=>Number(u.year)))].filter(u=>Number.isFinite(u)).sort((u,$)=>$-u),o=s.summary||{},l=s.current||null,m=cu(s),f=uu(e,s);return`<section class="report-card processing-card import-files-card processing-timeline-card" data-processing-timeline="${r(s.key||"")}">
        <div class="side-card-head index-runtime-head">
          <span class="side-card-title">${g(s.icon||"activity",14)}${r(s.title||`${s.label||""}\u8655\u7406\u6642\u9593\u8868`)}</span>
          ${du(s,a,o)}
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
                    <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(u,$)=>`<th scope="col">${$+1}</th>`).join("")}</tr></thead>
                    <tbody>${i.map(u=>lu(s,u,n,f)).join("")}</tbody>
                  </table>
                </div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u3002</div>'}
          <p class="judgment-months-hint">${s.key==="judgment"?"\u5224\u6C7A\u4EE5\u88C1\u5224\u66F8\u6708\u4EFD\u986F\u793A\u3002":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u4EE5\u4F86\u6E90\u7248\u672C\u6708\u4EFD\u986F\u793A\u3002"}\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA\u4E0B\u8F09\u3001Parquet\u3001PostgreSQL\u3001Qdrant \u56DB\u500B\u968E\u6BB5\uFF1B\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF0CQdrant \u4E4B\u524D\u5DF2\u8655\u7406\u4F46\u5C1A\u672A\u5B8C\u6210\u6642\u4EE5\u5B8C\u6210\u8272\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u6216\u8272\u584A\u53EF\u67E5\u770B\u5404\u968E\u6BB5\u72C0\u614B\u8207\u9032\u5EA6\u3002</p>
        </div>
      </section>`}).join("")}</div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u8655\u7406\u6642\u9593\u8868\u3002</div>'}function mu(e){return e.judgment_stats&&typeof e.judgment_stats=="object"?e.judgment_stats:{judgment_total:(e.raw_backups?.totals||{}).row_count,financial_total:(e.database||{}).judgment_count}}function qo(e,t=new Set){return`${su(e)}
    ${Zd(e)}
    ${pu(e)}
    ${eu(e)}
    ${tu(e)}`}function gu(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${De({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:r(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${r(ve(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${g("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}function fu(e,t){if(e.nodeType!==t.nodeType||e.nodeName!==t.nodeName){e.replaceWith(t.cloneNode(!0));return}if(e.nodeType===Node.TEXT_NODE){e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue);return}if(e.nodeType===Node.ELEMENT_NODE){for(let s of[...e.attributes])t.hasAttribute(s.name)||e.removeAttribute(s.name);for(let s of[...t.attributes])e.getAttribute(s.name)!==s.value&&e.setAttribute(s.name,s.value);t.hasAttribute("data-preserve-children")||To(e,t)}}function To(e,t){let s=[...e.childNodes],a=[...t.childNodes],n=Math.min(s.length,a.length);for(let i=0;i<n;i+=1)fu(s[i],a[i]);for(let i=n;i<s.length;i+=1)s[i].remove();for(let i=n;i<a.length;i+=1)e.appendChild(a[i].cloneNode(!0))}function as(e,t){let s=document.createElement("template");s.innerHTML=t,To(e,s.content)}var No={overview:"activity",law_download:"layers",order_download:"file",judgment_download:"download",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function bu(e){let s=(Array.isArray(e.workflows)?e.workflows:[]).map(n=>{let i=n.active_run||null,o=i||n.last_run||null;return{...n,activeRun:i,lastRun:o,status:i?i.status||"running":n.update_available?"update":o?.status||"idle"}}),a=s.find(n=>n.id==="judgment_parquet");return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...s.filter(n=>n.id!=="judgment_parquet"),...a?[a]:[]]}function Wa(e,t){let s=bu(e),a=new Set(["law_download","judgment_download","normalize_courts"]);return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${s.map(n=>{let i=n.id===t,o=No[n.id]||"terminal",l=a.has(n.id)?'<div class="status-tab-divider" role="separator" aria-hidden="true"></div>':"",m=Number(n.pending_count)||0,f=Number(n.update_count)||(n.update_available?m:0),u=n.update_available&&f>0&&!n.activeRun,$=[n.update_message||`${n.update_origin||"\u66F4\u65B0\u5075\u6E2C"}\u627E\u5230 ${c(f)} \u9805\u53EF\u66F4\u65B0\u5167\u5BB9`,n.update_origin?`\u4F86\u6E90\uFF1A${n.update_origin}`:"",n.update_mechanism?`\u6A5F\u5236\uFF1A${n.update_mechanism}`:""].filter(Boolean).join(" \xB7 ");return`${l}<button class="status-tab${i?" is-active":""}" type="button"
            data-processing-workflow="${r(n.id)}"
            ${i?'aria-current="page"':""}>
            <span class="status-tab-icon">${g(o,15)}</span>
            <span class="status-tab-copy">
              <strong>${r(n.label)}</strong>
              <small>${r(n.description||"")}</small>
            </span>
            ${u?`<span class="badge badge-warn badge-mono processing-update-count" title="${r($)}">${g("refresh",10)}${c(f)}</span>`:At(n.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${r(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function hu(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${At(e.status)}
      <span class="mono">${r(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${r(ve(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${ue(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${r(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${r(t.log_path)}</strong>`:""}
    </div>
  </div>`}function oa(e){return`${e.year}-${String(e.month_no).padStart(2,"0")}`}function Eo(e){let t={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"},s=e.status||"red";return[oa(e),t[s]||s,e.latest_fileset_id?`fileset ${e.latest_fileset_id}`:"",e.filename||"",e.local_filename&&e.local_filename!==e.filename?`\u672C\u6A5F\uFF1A${e.local_filename}`:""].filter(Boolean).join(" \xB7 ")}function Ro(e){if(!e.download_url)return"";let t=oa(e);return`<a class="judgment-month-download" href="${r(lt(e.download_url))}" target="_blank" rel="noreferrer" title="\u4E0B\u8F09 ${t} \u5224\u6C7A" aria-label="\u4E0B\u8F09 ${t} \u5224\u6C7A">${g("download",11)}</a>`}function vu(e){let t=e.status||"red";return`<td class="judgment-month is-${r(t)}" data-judgment-month-key="${r(oa(e))}" title="${r(Eo(e))}"><span>${e.month_no}</span>${Ro(e)}</td>`}function $u(e){return e?.off_hours_enabled===!0}function Co(e){return`\u7DA0\u8272\uFF1A\u6700\u65B0\u7248\u5DF2\u4E0B\u8F09\u5230 raw_rar\uFF1B\u7070\u8272\uFF1A\u672C\u6A5F\u4ECD\u662F\u820A\u7248\uFF0C\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u6703\u66F4\u65B0\uFF1B\u7D05\u8272\uFF1A\u8A72\u6708\u4EFD\u7F3A\u5C11\u5224\u6C7A\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u958B\u555F\u4E0B\u8F09\u9023\u7D50\uFF08${$u(e)?"\u975E API \u6642\u6BB5\u4E5F\u53EF\u4E0B\u8F09\uFF0C\u5EFA\u8B70\u4E00\u6B21\u53EA\u4E0B\u8F09\u4E00\u500B\u6A94\u6848":"\u4E0B\u8F09\u9023\u7D50\u50C5\u5728 00:00\u201306:00 API \u6642\u6BB5\u53EF\u7528"}\uFF09\u3002\u5F85\u88DC\u9F4A\u6708\u4EFD\u6703\u512A\u5148\u4E0B\u8F09\uFF0C\u5168\u90E8\u88DC\u9F4A\u5F8C\u624D\u7531\u6700\u65B0\u6708\u4EFD\u5F80\u56DE\u9A57\u8B49\u65E2\u6709\u6A94\u6848\uFF1B\u4E2D\u65B7\u7684\u4E0B\u8F09\u6703\u4FDD\u7559 .part\uFF0C\u4F3A\u670D\u5668\u652F\u63F4 Range \u6642\u7E8C\u50B3\uFF0C\u5426\u5247\u5F9E\u96F6\u91CD\u65B0\u4E0B\u8F09\u3002\u9996\u6B21\u5B8C\u6574\u540C\u6B65\u53EF\u80FD\u9700\u4E0B\u8F09\u6578\u767E\u500B\u6708\u4EFD\uFF0C\u9810\u8A2D\u975E\u6642\u6BB5\u4E5F\u53EF\u7E8C\u50B3\uFF1B\u56B4\u683C\u6A21\u5F0F\u6703\u5728 00:00\u201306:00 \u4EE5\u5916\u505C\u6B62\u3002`}var yu={completed:"\u5B8C\u6210",window_closed:"API \u6642\u6BB5\u7D50\u675F",deadline:"\u63A5\u8FD1 06:00\uFF0C\u4FDD\u7559\u5F85\u4E0B\u8F09\u6708\u4EFD",verification_window_closed:"API \u6642\u6BB5\u7D50\u675F\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",verification_deadline:"\u63A5\u8FD1 06:00\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",errors:"\u90E8\u5206\u6708\u4EFD\u4E0B\u8F09\u5931\u6557\uFF0C\u4E0B\u6B21\u91CD\u8A66",pending:"\u4ECD\u6709\u5F85\u4E0B\u8F09\u6708\u4EFD",check_only:"\u50C5\u6AA2\u67E5\uFF0C\u672A\u4E0B\u8F09",incremental:"\u589E\u91CF\u6AA2\u67E5\u5B8C\u6210",status_only:"\u50C5\u66F4\u65B0\u6708\u4EFD\u72C0\u614B",running:"\u57F7\u884C\u4E2D"};function hr(e){let t=e?.backfill||{},s=t.verification||{},a=t.last_run||{},n=Number(t.pending_count)||0,i=Number(t.failure_count)||0,o=String(t.resume_from_month||""),l="\u9A57\u8B49\uFF1A\u672A\u958B\u59CB";s.status==="completed"?l="\u9A57\u8B49\u5B8C\u6210":s.next_month?l=`\u9A57\u8B49\u7E8C\u50B3 ${s.next_month}`:s.status==="in_progress"&&(l="\u9A57\u8B49\u9032\u884C\u4E2D");let m=String(a.stop_reason||""),f=m?`\u4E0A\u6B21\u505C\u6B62\uFF1A${yu[m]||m}`:"";return{pending:n,failures:i,resume:o,verificationText:l,lastText:f}}function wu(e){let t=hr(e),s=t.pending>0?`\u5F85\u88DC\u9F4A ${c(t.pending)} \u500B\u6708${t.failures>0?`\uFF08${c(t.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708";return`<div class="judgment-backfill" data-judgment-backfill>
    <span class="badge ${t.pending>0?"badge-danger":"badge-ok"}" data-judgment-backfill-pending>${s}</span>
    <span class="badge badge-neutral" data-judgment-backfill-resume ${t.resume&&t.pending>0?"":"hidden"}>\u5F9E ${r(t.resume)} \u7E8C\u50B3</span>
    <span class="badge badge-info" data-judgment-backfill-verification>${r(t.verificationText)}</span>
    <span class="muted" data-judgment-backfill-last ${t.lastText?"":"hidden"}>${r(t.lastText)}</span>
  </div>`}function _u(e,t){let s=hr(t),a=e.querySelector("[data-judgment-backfill-pending]");a&&(a.textContent=s.pending>0?`\u5F85\u88DC\u9F4A ${c(s.pending)} \u500B\u6708${s.failures>0?`\uFF08${c(s.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708",a.classList.toggle("badge-danger",s.pending>0),a.classList.toggle("badge-ok",s.pending===0));let n=e.querySelector("[data-judgment-backfill-resume]");if(n){let l=!!s.resume&&s.pending>0;n.hidden=!l,n.textContent=l?`\u5F9E ${s.resume} \u7E8C\u50B3`:""}let i=e.querySelector("[data-judgment-backfill-verification]");i&&(i.textContent=s.verificationText);let o=e.querySelector("[data-judgment-backfill-last]");o&&(o.hidden=!s.lastText,o.textContent=s.lastText)}function vr(){return'<div class="judgment-months-loading"><span class="spinner"></span><span>\u8B80\u53D6\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B\u2026</span></div>'}function ku(e){if(e?.loading&&!e?.months?.length)return vr();if(e?.error&&!e?.months?.length)return De({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(e.error)});let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return'<div class="processing-empty">\u5C1A\u672A\u6709\u6708\u4EFD\u72C0\u614B\uFF1B\u8ACB\u5148\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u3002</div>';let s=new Map(t.map(o=>[oa(o),o])),n=[...new Set(t.map(o=>o.year))].sort((o,l)=>l-o).map(o=>{let l=Array.from({length:12},(m,f)=>{let u=s.get(`${o}-${String(f+1).padStart(2,"0")}`);return u?vu(u):`<td class="judgment-month is-empty"><span>${f+1}</span></td>`}).join("");return`<tr><th scope="row">${o}</th>${l}</tr>`}).join(""),i=e.summary||{};return`<div class="judgment-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" data-judgment-summary="green">\u6700\u65B0\u7248 ${c(i.green||0)}</span>
      <span class="badge badge-neutral" data-judgment-summary="gray">\u820A\u7248 ${c(i.gray||0)}</span>
      <span class="badge badge-danger" data-judgment-summary="red">\u7F3A\u5931 ${c(i.red||0)}</span>
      <span class="muted" data-judgment-total>\u5171 ${c(e.total_months||t.length)} \u500B\u6708</span>
    </div>
    ${wu(e)}
    <div class="judgment-months-scroll">
      <table class="judgment-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(o,l)=>`<th scope="col">${l+1}</th>`).join("")}</tr></thead>
        <tbody>${n}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint" data-judgment-hint>${r(Co(e))}</p>
  </div>`}function Su(e,t){let s=Array.isArray(t?.months)?t.months:[],a=t.summary||{},n={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"};e.querySelectorAll("[data-judgment-summary]").forEach(l=>{let m=l.dataset.judgmentSummary||"";l.textContent=`${n[m]||m} ${c(a[m]||0)}`});let i=e.querySelector("[data-judgment-total]");i&&(i.textContent=`\u5171 ${c(t.total_months||s.length)} \u500B\u6708`),_u(e,t);let o=e.querySelector("[data-judgment-hint]");if(o){let l=Co(t);o.textContent!==l&&(o.textContent=l)}for(let l of s){let m=oa(l),f=e.querySelector(`[data-judgment-month-key="${m}"]`);if(!f)continue;let u=l.status||"red";f.classList.contains(`is-${u}`)||(f.classList.remove("is-green","is-gray","is-red","is-empty"),f.classList.add(`is-${u}`));let $=Eo(l);f.title!==$&&(f.title=$);let b=f.querySelector(".judgment-month-download");if(l.download_url){let d=lt(l.download_url);b?b.getAttribute("href")!==d&&(b.href=d):f.insertAdjacentHTML("beforeend",Ro(l))}else b&&b.remove()}}function xu(e){let t=Array.isArray(e)?e:[];return t.length?`<div class="processing-workflow-history">
    ${t.map(s=>`<div class="processing-workflow-history-row">
          <span class="processing-workflow-history-status">${At(s.status||"idle")}</span>
          <span class="mono">${r(ve(s.started_at))}</span>
          <span class="mono">${r(ue(s.duration_ms||0))}</span>
          <span class="processing-workflow-history-message">${r(s.message||"\u2014")}</span>
        </div>`).join("")}
  </div>`:'<div class="processing-workflow-empty">\u5C1A\u7121\u57F7\u884C\u7D00\u9304\u3002</div>'}function Au(e){let t=Array.isArray(e.update_history)?e.update_history:[];if(!t.length)return'<div class="processing-workflow-empty">\u5C1A\u7121\u7248\u672C\u6AA2\u67E5\u7D00\u9304\u3002</div>';let s={up_to_date:["\u5DF2\u662F\u6700\u65B0","badge-ok"],update_available:["\u6709\u66F4\u65B0","badge-warn"],error:["\u6AA2\u67E5\u5931\u6557","badge-danger"]};return`<div class="processing-workflow-history">
    ${t.map(a=>{let[n,i]=s[a.status]||[a.status||"\u672A\u77E5","badge-neutral"],o=a.remote_content_length!=null?Le(a.remote_content_length):"\u2014",l=a.local_version_id?`v${a.local_version_id}`:"\u2014";return`<div class="processing-workflow-history-row">
          <span class="badge ${i}">${r(n)}</span>
          <span class="mono">${r(ve(a.checked_at))}</span>
          <span class="mono">\u9060\u7AEF ${r(o)}</span>
          <span class="mono">\u672C\u5730 ${r(l)}</span>
          <span class="processing-workflow-history-message">${r(a.message||"\u2014")}</span>
        </div>`}).join("")}
  </div>`}function Po(e){let t=String(e.key||""),s=fs(e.status);return[`data-stage-key="${r(t)}"`,`data-stage-label="${r(e.label||t)}"`,`data-stage-color="${r(Mo(e))}"`,`data-stage-status-key="${r(e.status||"idle")}"`,`data-stage-status="${r(s.label)}"`,`data-stage-percent="${r(pt(e.percent))}"`,`data-stage-counts="${r(fr(e))}"`,`data-stage-duration="${r(ia(e.duration_ms||0))}"`,`data-stage-contribution="${r(pt(e.contribution_percent))}"`,`data-stage-message="${r(e.message||"")}"`].join(" ")}function qu(e,t=Date.now()){let s=String(e.status||"idle"),a=Number(e.duration_ms)||0,n=Date.parse(e.started_at||"");if(s==="running"&&Number.isFinite(n))return Math.max(a,t-n);if(a>0)return a;let i=Date.parse(e.finished_at||"");return Number.isFinite(n)&&Number.isFinite(i)?Math.max(0,i-n):0}function Io(e){if(e.key!=="filter")return null;let t=Number(e.financial_processed),s=Number(e.financial_matched);return e.financial_processed===null||e.financial_processed===void 0||!Number.isFinite(t)||!Number.isFinite(s)||t<=0?null:{processed:t,matched:s,percent:Math.round(s/t*100)}}function Mu(e){let t=String(e.status||"idle"),s=[],a=Number(e.total);if(e.key==="postgres"&&["success","no_change"].includes(t)&&Number.isFinite(a)&&a>0)s.push(`\u7E3D\u8A08 ${c(a)} \u7B46`);else{let i=fr(e);i!=="\u2014"&&s.push(i)}let n=Io(e);return n&&s.push(`\u91D1\u878D\u4F54\u6BD4 ${n.percent}%`),s.join(" \xB7 ")}function Lu(e,t){let s=String(e.status||"idle"),a=[],n=(m,f,{always:u=!1}={})=>{let $=f==null?"":String(f).trim();!u&&!$||a.push(`<span class="rag-wf-detail"><span>${r(m)}</span><strong>${r($||"\u2014")}</strong></span>`)};n("\u72C0\u614B",fs(s).label,{always:!0}),n("\u958B\u59CB",e.started_at?ve(e.started_at):"\u2014",{always:!0}),n("\u7D50\u675F",e.finished_at?ve(e.finished_at):"\u2014",{always:!0}),n("\u8017\u6642",t,{always:!0}),n("\u9032\u5EA6",pt(e.percent),{always:!0});let i=fr(e),o=["extract","raw_parquet"].includes(String(e.key||""));n(o?"\u7D2F\u8A08\u8CC7\u6599\u91CF":"\u8CC7\u6599\u91CF",i!=="\u2014"?i:"");let l=Io(e);return l&&(n("\u91D1\u878D\u6848\u4EF6",`${c(l.matched)} \u7B46`),n("\u5168\u90E8\u6848\u4EF6",`${c(l.processed)} \u7B46`),n("\u91D1\u878D\u4F54\u6BD4",`${l.percent}%`)),n("\u6574\u9AD4\u5360\u6BD4",pt(e.contribution_percent)),s==="failed"||s==="stale"?(n("\u539F\u56E0",e.error||e.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002"),n("\u5EFA\u8B70",e.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002")):n("\u8AAA\u660E",e.message),a.join("")}function ju(e){let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${g("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A host/model\u3001Blue-Green \u5EFA\u7F6E\u8207\u5404\u968E\u6BB5\u9032\u5EA6\u3002</div>
    </section>`;let a=new Map(s.map(k=>[String(k.key||""),k])),n=a.get("ollama")||{},i=a.get("qdrant")||{},o=a.get("validate")||{},l=e.index_runtime||{},m=l.summary||{},f=l.copy||{},u=l.current||{},$=l.embedding||{},b=$.selected||{},d=$.active||{},h=Number(l.expected_count||m.total||i.total||0),y=Number(m.indexed??i.current??0),_=h>0?Math.min(100,y/h*100):i.status==="success"?100:0,L=Number(f.total||0),S=Number(f.copied||0),A=L>0?Math.min(100,S/L*100):f.status==="success"?100:0,I=String(l.build_mode||""),re=String(t.run_status||""),Y=!!re&&!["running","success","no_change"].includes(re),we=String(f.status||(I==="reuse"?"pending":"skipped"));Y&&we==="pending"&&(we="stale");let ge=String(o.status||"pending"),F=ge==="success"&&/alias 已切換/.test(String(o.message||"")),j=F?"success":ge==="failed"?"failed":re==="running"?"pending":"skipped",x=l.version_id?`v${String(l.version_id).padStart(3,"0")}`:"\u2014",R=d.host||b.host||d.url||b.url||"\u2014",W=d.port||b.port,te=W?`${R}:${W}`:String(R),z=d.model||b.model||l.model||"\u2014",de=u.month?`${Ya(u.month)}${u.preparing?"\uFF08\u6E96\u5099\u4E2D\uFF09":""}`:t.run_status==="running"?"\u6E96\u5099\u4E2D":"\u2014",xe=[{key:"probe",label:"llama-server \u4E3B\u6A5F\uFF0F\u6A21\u578B\u6E2C\u8A66",caption:"\u4E3B\u6A5F\uFF0F\u6A21\u578B\u3001\u9023\u7DDA\u6E2C\u8A66",color:"#22c55e",status:n.status||"pending",percent:Number(n.percent)||0,current:Number(n.current)||0,total:Number(n.total)||0,unit:"\u53F0",duration_ms:n.duration_ms,started_at:n.started_at,finished_at:n.finished_at,extraDetails:[["\u4E3B\u6A5F",te],["\u6A21\u578B",z],["\u6E2C\u8A66\u4E3B\u6A5F",`${c(n.current||0)} / ${c(n.total||0)} \u53F0`]],detail:`${c(n.current||0)} / ${c(n.total||0)} \u53F0 \xB7 ${te} \xB7 ${z}`},{key:"version",label:"\u5EFA\u7ACB\uFF0F\u63A5\u7E8C Blue-Green \u7248\u672C",caption:"Blue-Green \u7248\u672C\u3001collection",color:"#06b6d4",status:l.version_id?"success":"pending",percent:l.version_id?100:0,current:l.version_id?1:0,total:1,unit:"\u968E\u6BB5",duration_ms:l.version_duration_ms,started_at:null,finished_at:null,extraDetails:[["\u7248\u672C",x],["Collection",l.collection||"\u2014"],["\u6A21\u5F0F",I||"\u2014"]],detail:`${x} \xB7 ${l.collection||"\u2014"} \xB7 ${I||"\u2014"}`},{key:"copy",label:"\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF",caption:"\u820A collection \u5411\u91CF\u8907\u88FD",color:"#f59e0b",status:we,percent:A,current:S,total:L,unit:"points",duration_ms:f.duration_ms,started_at:f.started_at,finished_at:f.finished_at,extraDetails:[["\u5DF2\u8907\u88FD",`${c(S)} points`],["\u7E3D points",c(L)]],detail:L>0?`${c(S)} / ${c(L)} points \xB7 \u820A collection \u5411\u91CF`:we==="skipped"?"\u672C\u6B21\u4E0D\u9700\u8907\u88FD\u820A\u5411\u91CF":we==="stale"?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5B8C\u6210\u8907\u88FD":"\u7B49\u5F85\u820A collection \u8907\u88FD"},{key:"index",label:"\u91D1\u878D\u5224\u6C7A\u5411\u91CF\u7D22\u5F15",caption:"\u91D1\u878D\u5224\u6C7A\u5411\u91CF\u3001\u6279\u6B21\u9032\u5EA6",color:"#a78bfa",status:i.status||"pending",percent:_,current:y,total:h,unit:"\u7B46",duration_ms:i.duration_ms,started_at:i.started_at||l.started_at,finished_at:i.finished_at,extraDetails:[["\u5DF2\u7D22\u5F15",`${c(y)} / ${c(h)} \u7B46`],["\u91CD\u7528",c(m.reused)],["\u65B0 embedding",c(m.embedded)],["\u76EE\u524D\u6708\u4EFD",de]],detail:`${c(y)} / ${c(h)} \u7B46 \xB7 \u91CD\u7528 ${c(m.reused)} \xB7 \u65B0 embedding ${c(m.embedded)}`},{key:"validate",label:"\u9A57\u8B49\u65B0\u7248\u672C",caption:"\u7B46\u6578\u3001\u7DAD\u5EA6\u3001payload",color:"#eab308",status:ge,percent:ge==="success"?100:0,current:null,total:null,duration_ms:o.duration_ms,started_at:o.started_at,finished_at:o.finished_at,extraDetails:[["\u9A57\u8B49\u8A0A\u606F",o.message||"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210"]],detail:o.message||(Y?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u9032\u884C\u9A57\u8B49\u3002":"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210\u5F8C\u9A57\u8B49\u7B46\u6578\u3001\u7DAD\u5EA6\u8207 payload\u3002")},{key:"activate",label:"\u5207\u63DB alias",caption:"judgments_current alias",color:"#3b82f6",status:j,percent:F?100:0,current:null,total:null,duration_ms:0,started_at:null,finished_at:null,extraDetails:[["\u76EE\u6A19 alias","judgments_current"]],detail:F?o.message:Y?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5207\u63DB alias\u3002":"\u9A57\u8B49\u901A\u904E\u5F8C\u5207\u63DB judgments_current\u3002"}],D=xe.filter(k=>k.status!=="skipped"),ke=D.length?D.reduce((k,E)=>k+E.percent,0)/D.length:0,se=xe.filter(k=>k.status==="success").length,je=pt(ke),_e=Date.now(),oe=k=>{let E=Number(k.duration_ms)||0,X=Date.parse(k.started_at||"");if(k.status==="running"&&Number.isFinite(X))return Math.max(E,_e-X);if(E>0)return E;let H=Date.parse(k.finished_at||"");return Number.isFinite(X)&&Number.isFinite(H)?Math.max(0,H-X):0},ie=xe.map(k=>{let E=oe(k);return{...k,computedDuration:E,drawable:!["skipped","pending"].includes(k.status)}}),he=Math.max(ie.reduce((k,E)=>k+(E.drawable?E.computedDuration:0),0),Number(t.duration_ms)||0,1),fe=1.25,Ae=ie.map(k=>k.drawable?Math.max(k.computedDuration/he*100,fe):0),$e=Ae.reduce((k,E)=>k+E,0),Pe=$e>100?100/$e:1,Ue=0,O=ie.map((k,E)=>{let X=Ae[E]*Pe,H=X>0?{start:Ue,width:X}:null;return H&&(Ue+=X),{...k,bar:H}}).map((k,E)=>{let X=[`is-${k.status}`,k.status==="failed"||k.status==="stale"?"is-error":"",["pending","skipped"].includes(k.status)?"is-missing":"",k.status==="running"?"is-running":""].filter(Boolean).join(" "),H=["pending","skipped"].includes(k.status)?"\u2014":ia(k.computedDuration),Re=k.status==="running"?` \xB7 ${pt(k.percent)}`:"",Ce="";if(k.bar){let We=Math.max(0,Math.min(100,k.bar.start)),it=Math.max(0,Math.min(100-We,k.bar.width)),_t=k.status==="success"?100:Math.max(0,Math.min(100,Number(k.percent)||0)),jt=it*_t/100,Ke=it-jt,mt=r(k.color);jt>0&&(Ce+=`<span class="rag-wf-bar index-wf-bar is-sequential" style="left:${We.toFixed(3)}%;width:${jt.toFixed(4)}%;top:0;height:12px;--bar-color:${mt}" aria-hidden="true"></span>`),Ke>1e-4&&(Ce+=`<span class="rag-wf-bar index-wf-bar is-hollow is-sequential" style="left:${(We+jt).toFixed(3)}%;width:${Ke.toFixed(4)}%;top:0;height:12px;--bar-color:${mt}" aria-hidden="true"></span>`)}let Ie=[],Fe=(We,it)=>{it==null||it===""||Ie.push(`<span class="rag-wf-detail"><span>${r(We)}</span><strong>${r(String(it))}</strong></span>`)};Fe("\u72C0\u614B",fs(k.status).label),Fe("\u958B\u59CB",k.started_at?ve(k.started_at):"\u2014"),Fe("\u7D50\u675F",k.finished_at?ve(k.finished_at):"\u2014"),Fe("\u8017\u6642",H),Fe("\u9032\u5EA6",pt(k.percent));for(let[We,it]of k.extraDetails||[])Fe(We,it);Fe("\u8AAA\u660E",k.detail);let Ye={...k,duration_ms:k.computedDuration,contribution_percent:D.length?(Number(k.percent)||0)/D.length:null,message:k.detail};return`<details class="rag-wf-stage index-wf-stage ${X}" data-index-stage="${r(k.key)}"${ur.has(k.key)?" open":""} style="--stage-color:${r(k.color)}" ${Po(Ye)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="index-wf-step">${String(E+1).padStart(2,"0")}</span> ${r(k.label)}</strong><small>${r(k.caption||"")}</small></span>
            </span>
            <span class="rag-wf-stage-meta">${r(H)}${r(Re)} \xB7 ${r(fs(k.status).label)} <span class="rag-wf-chevron">${g("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px">${Ce}</span>
        </summary>
        <div class="rag-wf-details">${Ie.join("")}</div>
      </details>`}).join("");return`<section class="report-card processing-card processing-workflow-progress-card index-wf-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${g("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
      <span class="badge ${t.run_status==="running"?"badge-info":"badge-neutral"}">${c(se)} / ${c(D.length)} \u968E\u6BB5</span>
    </div>
    <div class="index-wf-summary">
      <span>\u6574\u9AD4 <strong class="mono">${je}</strong></span>
      <span>\u7248\u672C <strong class="mono">${r(x)}</strong></span>
      <span>Collection <strong class="mono">${r(l.collection||"\u2014")}</strong></span>
      <span>\u6A21\u5F0F <strong>${r(I||"\u2014")}</strong></span>
      <span>Host <strong class="mono">${r(te)}</strong></span>
      <span>Model <strong class="mono">${r(z)}</strong></span>
      <span>\u76EE\u524D <strong>${r(de)}</strong></span>
    </div>
    <div class="index-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${he>0?r(ia(he)):"\u2014"}</span>
      </div>
      <div class="rag-wf-stages">${O}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7684\u7D50\u675F\u5373\u4E0B\u4E00\u968E\u6BB5\u7684\u958B\u59CB\uFF1B\u5DF2\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u9032\u884C\u4E2D\u6216\u672A\u5B8C\u6210\u968E\u6BB5\u53EA\u8457\u8272\u5DF2\u5B8C\u6210\u6BD4\u4F8B\uFF0C\u5176\u9918\u672A\u5B8C\u6210\u5340\u6BB5\u4EE5\u540C\u8272 25% \u6DFA\u8272\u8868\u793A\uFF0C\u7B49\u5F85\u968E\u6BB5\u4FDD\u7559\u7A7A\u5FC3\u8ECC\u9053\u3001\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\u3002\u6975\u77ED\u968E\u6BB5\u6703\u4EE5\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u5448\u73FE\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u9032\u5EA6\u8207\u8A73\u7D30\u6578\u64DA\u3002</p>
    </div>
    <div class="index-wf-overall">
      <div class="index-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${je}</span>
      </div>
      <div class="index-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,ke)).toFixed(1)}%"></span>
      </div>
    </div>
  </section>`}function Tu(e){if(e.id==="index_versions")return ju(e);let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${g("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u5404\u968E\u6BB5\u8207\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </section>`;let a=Date.now(),n=s.map(D=>{let ke=String(D.status||"idle");return{...D,status:ke,computedDuration:qu(D,a),drawable:!["pending","skipped","idle"].includes(ke)}}),i=n.filter(D=>D.status!=="skipped"),o=n.filter(D=>D.drawable).reduce((D,ke)=>D+ke.computedDuration,0),l=Math.max(o,Number(t.duration_ms)||0,1),m=n.some(D=>D.computedDuration>0),f=1.25,u=n.map(D=>D.drawable?Math.max(D.computedDuration/l*100,f):0),$=u.reduce((D,ke)=>D+ke,0),b=$>100?100/$:1,d=0,h=n.map((D,ke)=>{let se=u[ke]*b,je=D.drawable?{start:d,width:se}:null;return je&&(d+=se),{...D,bar:je}}),y=n.filter(D=>["success","no_change"].includes(D.status)).length,_=n.find(D=>D.status==="running"),L=n.filter(D=>D.status==="running").length,S=n.filter(D=>["pending","idle"].includes(D.status)).length,A=n.filter(D=>D.status==="skipped").length,I=i.length||Number(t.total_stages)||0,re=t.overall_percent,Y=re==null||re===""?null:Number(re),we=Number.isFinite(Y)?pt(Y):"\u2014",ge=m?ia(l):"\u2014",F=String(t.run_status||""),j=F?fs(F).label:"\u2014",x=_&&(_.label||_.key)||"\u2014",R=n.map(D=>Date.parse(D.started_at||"")).filter(D=>Number.isFinite(D)),W=n.map(D=>Date.parse(D.finished_at||"")).filter(D=>Number.isFinite(D)),te=R.length?new Date(Math.min(...R)).toISOString():null,z=_?null:W.length?new Date(Math.max(...W)).toISOString():null,de=h.map((D,ke)=>{let se=D.status,je=["failed","stale","interrupted"].includes(se),_e=[`is-${se}`,je?"is-error":"",["pending","skipped","idle"].includes(se)?"is-missing":"",se==="running"?"is-running":""].filter(Boolean).join(" "),oe=D.drawable?ia(D.computedDuration):"\u2014",ie=fs(se).label,he=se==="failed"?`\u539F\u56E0\uFF1A${String(D.error||D.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002").trim()}
\u5EFA\u8B70\uFF1A${String(D.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002").trim()}`:"",fe=he?`<span class="badge badge-danger is-failure-tip" tabindex="0" aria-label="${r(he)}" data-failure-tip="${r(he)}"><span class="status-dot is-danger"></span>\u5931\u6557</span>`:r(ie),Ae=Mo(D),$e=je?"var(--danger)":Ae,Pe=se==="running"?` \xB7 ${pt(D.percent)}`:"",Ue="";if(D.bar){let H=Math.max(0,Math.min(100,D.bar.start)),Re=Math.max(0,Math.min(100-H,D.bar.width)),Ce=["success","no_change"].includes(se)?100:Math.max(0,Math.min(100,Number(D.percent)||0)),Ie=Re*Ce/100,Fe=Re-Ie;Ie>0&&(Ue+=`<span class="rag-wf-bar workflow-wf-bar is-sequential" style="left:${H.toFixed(3)}%;width:${Ie.toFixed(4)}%;top:0;height:12px;--bar-color:${r($e)}" aria-hidden="true"></span>`),Fe>1e-4&&(Ue+=`<span class="rag-wf-bar workflow-wf-bar is-hollow is-sequential" style="left:${(H+Ie).toFixed(3)}%;width:${Fe.toFixed(4)}%;top:0;height:12px;--bar-color:${r($e)}" aria-hidden="true"></span>`)}let C=D.label||D.key||"\u968E\u6BB5",O=Mu(D),k=`${C}\uFF1A${ie}\uFF0C${se==="running"?`\u9032\u5EA6 ${pt(D.percent)}\uFF0C`:""}\u8017\u6642 ${oe}`,E={...D,duration_ms:D.computedDuration,message:he||D.message||O||""},X=`${e.id}:${D.key||ke}`;return`<details class="rag-wf-stage workflow-wf-stage ${_e}" data-workflow-wf-stage="${r(X)}"${pr.has(X)?" open":""} style="--stage-color:${r(Ae)}" ${Po(E)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="workflow-wf-step">${String(ke+1).padStart(2,"0")}</span> ${r(C)}</strong>${O?`<small>${r(O)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(oe)}${r(Pe)} \xB7 ${fe} <span class="rag-wf-chevron">${g("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(k)}">${Ue}</span>
        </summary>
        <div class="rag-wf-details">${Lu(D,oe)}</div>
      </details>`}).join(""),xe=Xd[e.id]||"";return`<section class="report-card processing-card processing-workflow-progress-card workflow-wf-card" data-workflow-progress>
    <div class="side-card-head index-runtime-head workflow-wf-head">
      <span class="side-card-title">${g("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
      <div class="index-runtime-metrics workflow-wf-metrics">
        <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u5168\u90E8\u968E\u6BB5\u7684\u6578\u91CF\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${y} / ${I}</strong></span>
        <span class="index-runtime-metric" title="\u76EE\u524D\u57F7\u884C\u4E2D\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u57F7\u884C\u4E2D</span><strong>${L}</strong></span>
        <span class="index-runtime-metric" title="\u5C1A\u672A\u958B\u59CB\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7B49\u5F85</span><strong>${S}</strong></span>
        <span class="index-runtime-metric" title="\u672C\u6B21\u6D41\u7A0B\u4E0D\u9700\u8981\u57F7\u884C\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7565\u904E</span><strong>${A}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u968E\u6BB5\u8017\u6642\u5408\u8A08\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(ge)}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u53C3\u8207\u968E\u6BB5\u5B8C\u6210\u6BD4\u4F8B\u7684\u5E73\u5747\u3002"><span>\u6574\u9AD4\u9032\u5EA6</span><strong>${we}</strong></span>
      </div>
    </div>
    <div class="workflow-wf-summary">
      <span>\u57F7\u884C <strong>${r(j)}</strong></span>
      <span>\u958B\u59CB <strong>${te?r(ve(te)):"\u2014"}</strong></span>
      <span>\u7D50\u675F <strong>${_?"\u9032\u884C\u4E2D":z?r(ve(z)):"\u2014"}</strong></span>
      <span>\u76EE\u524D <strong>${r(x)}</strong></span>
      <span>Run <strong class="mono">${r(t.run_id||"\u2014")}</strong></span>
    </div>
    <div class="workflow-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${r(ge)}</span>
      </div>
      <div class="rag-wf-legend workflow-wf-legend" aria-label="\u968E\u6BB5\u72C0\u614B\u5716\u4F8B">
        <span><i class="is-solid-state"></i>\u5B8C\u6210</span>
        <span><i class="is-hollow-state"></i>\u672A\u5B8C\u6210\uFF0825% \u6DFA\u8272\uFF09</span>
        <span><i class="is-progress-state"></i>\u57F7\u884C\u4E2D\uFF08\u9032\u5EA6\u689D\uFF09</span>
        <span><i class="is-empty-state"></i>\u7B49\u5F85\uFF0F\u7565\u904E</span>
      </div>
      <div class="rag-wf-stages">${de}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7684\u7D50\u675F\u5373\u4E0B\u4E00\u968E\u6BB5\u7684\u958B\u59CB\uFF1B\u5DF2\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u57F7\u884C\u4E2D\u6216\u672A\u5B8C\u6210\u968E\u6BB5\u53EA\u8457\u8272\u5DF2\u5B8C\u6210\u6BD4\u4F8B\uFF0C\u5176\u9918\u672A\u5B8C\u6210\u5340\u6BB5\u4EE5\u540C\u8272 25% \u6DFA\u8272\u8868\u793A\uFF0C\u7B49\u5F85\u968E\u6BB5\u4FDD\u7559\u7A7A\u5FC3\u8ECC\u9053\u3001\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\u3002\u6975\u77ED\u968E\u6BB5\u6703\u4EE5\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u5448\u73FE\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u9032\u5EA6\u8207\u8A73\u7D30\u6578\u64DA\u3002</p>
    </div>
    <div class="workflow-wf-overall">
      <div class="workflow-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${we}</span>
      </div>
      <div class="workflow-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,Number.isFinite(Y)?Y:0)).toFixed(1)}%"></span>
      </div>
    </div>
    ${xe?`<p class="processing-workflow-scope-note">${g("info",12)}<span>${r(xe)}</span></p>`:""}
  </section>`}function Ya(e){let t=String(e||"");return t.length===6?`${t.slice(0,4)}-${t.slice(4)}`:t||"\u2014"}function Nu(e,t=!1){let s=Number(e?.reused),a=Number(e?.embedded);if(!Number.isFinite(s)||!Number.isFinite(a)||s<=0&&a<=0)return"";let n=[];if(s>0&&n.push(`<span class="index-current-phase is-reuse"
      title="R \xB7 \u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF0C\u672C\u6279 ${c(s)} \u7B46">
      <strong>R</strong><span>\u6CBF\u7528 ${c(s)} \u7B46</span>
    </span>`),a>0){let i=e.phase==="embedding"&&t?"\u8A08\u7B97\u4E2D":"\u65B0 embedding";n.push(`<span class="index-current-phase is-embed"
      title="E \xB7 \u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding\uFF0C\u672C\u6279 ${c(a)} \u7B46">
      <strong>E</strong><span>${i} ${c(a)} \u7B46</span>
    </span>`)}return`<span class="index-current-phases" aria-label="\u672C\u6279\u6B21 R\uFF0FE \u52D5\u4F5C">
    <span class="index-current-phase-label">\u672C\u6279</span>
    ${n.join("")}
  </span>`}function gr(e,t=""){let s=String(e?.host||e?.url||"\u2014"),a=e?.port?`:${e.port}`:"",n=String(e?.model||t||"");return`${s}${a}${n?`:${n}`:""}`}function Eu(e){return e==="primary"?"\u4E3B\u8981":e==="provided"?"\u5916\u90E8":String(e||"").startsWith("fallback")?"\u5099\u63F4":e||"\u4E3B\u6A5F"}function Ru(e,t,s){let a=Array.isArray(e.models)?e.models:[],n=String(e.model||s||""),i=String(e.status||"unavailable"),o=i==="operational"||i==="provided",l=!!(o&&e.url&&e.url===t),m=gr({...e,model:n},s),f=l?"\u4F7F\u7528\u4E2D":o?"\u53EF\u7528":"\u7121\u6CD5\u53D6\u5F97",u=[`${Eu(e.role)} \xB7 ${e.url||"\u2014"}`,`\u72C0\u614B\uFF1A${f}`,e.detail||"",a.length?`\u6A21\u578B\uFF1A${a.join("\u3001")}`:""].filter(Boolean).join(`
`);return`<span class="rag-model-button is-static${l?" is-active":""}${o?"":" is-unavailable"}" title="${r(u)}">
    <span class="rag-model-state" aria-hidden="true"></span>
    <span>${r(m)}</span>
    <span class="rag-model-current">${f}</span>
  </span>`}function Cu(e){let t=Array.isArray(e.months)?e.months:[],s=new Map;for(let n of t){let i=String(n.month||"");if(!/^\d{6}$/.test(i))continue;let o=s.get(i);o||(o={total:0,processed:0},s.set(i,o)),o.total+=Number(n.total)||0,o.processed+=Number(n.processed)||0}let a=0;for(let n of s.values())n.total>0&&n.processed>=n.total&&(a+=1);return{completed:a,total:s.size}}function Va(e){let t=String(e||"").match(/(\d{8})Update/i);return t?Number(t[1]):0}function Ss(e){let t=Number(e);return Number.isFinite(t)&&t>0?t:0}function cr(e,t){let s=Ss(t),a=Ss(e);if(s<=0)return{processed:0,total:0,percent:null,fill:0,complete:!1,empty:!0,stateClass:"is-empty"};let n=Math.min(100,Math.round(a/s*1e3)/10),i=a>=s;return{processed:a,total:s,percent:n,fill:i?100:n,complete:i,empty:!1,stateClass:i?"is-complete":"is-incomplete"}}function Pu(e){let t=Array.isArray(e.months)?e.months:[],s=e.current||{},a=!!e.coverage_only,n=e.active_coverage||{},i=e.active_archive_coverage||{},o=new Map;for(let u of t){let $=String(u.month||"");if(!/^\d{6}$/.test($))continue;let b=Number($.slice(4,6));if(b<1||b>12)continue;let d=o.get($);d||(d={key:$,year:$.slice(0,4),monthNo:b,rows:[],archives:[],current:!1,preparing:!1,currentArchive:"",jid:""},o.set($,d));let h=String(u.archive||"");d.rows.push({archive:h,total:Ss(u.total),processed:Ss(u.processed)}),h&&d.archives.push(h),s.month===$&&(!s.archive||s.archive===h)&&(d.current=!0,d.preparing=!!s.preparing,d.currentArchive=String(s.archive||h||""),d.jid=String(s.jid||""))}if(!o.size)return'<div class="processing-workflow-empty">\u5C1A\u7121\u53EF\u986F\u793A\u7684\u7D22\u5F15\u6708\u4EFD\uFF1B\u958B\u59CB\u7D22\u5F15\u5F8C\u6703\u4F9D\u6642\u9593\u5217\u51FA\u6708\u4EFD\u72C0\u614B\u3002</div>';let l={active:0,reuseComplete:0,reuseIncomplete:0,embedComplete:0,embedIncomplete:0};for(let u of o.values()){let $=[...u.rows].sort((j,x)=>Va(x.archive)-Va(j.archive)),b=$[0],d=$.length>1?$.slice(1):[b],h=n[u.key]||{},y=i[u.key]||{},_=Ss(h.total),L=Ss(h.processed),S=new Map;if(a)for(let j of $)S.set(j.archive,j.processed);else{let j=0;for(let W of $){let te=y[W.archive];if(!te)continue;let z=Ss(te.processed);j+=z;let de=u.current&&!u.preparing&&u.currentArchive===W.archive;S.set(W.archive,de?W.processed:Math.max(z,W.processed))}let x=_>0?Math.max(0,L-j):0,R=d.filter(W=>!y[W.archive]&&!(u.current&&!u.preparing&&u.currentArchive===W.archive)).sort((W,te)=>Va(W.archive)-Va(te.archive));for(let W of R){let te=Math.min(W.total,x);x-=te,S.set(W.archive,Math.max(W.processed,te))}!y[b.archive]&&!S.has(b.archive)&&!(u.current&&!u.preparing&&u.currentArchive===b.archive)&&S.set(b.archive,Math.max(b.processed,Math.min(b.total,x)))}let A=d.reduce((j,x)=>j+x.total,0),I=d.reduce((j,x)=>j+(S.has(x.archive)?S.get(x.archive):x.processed),0),re=b.total,Y=S.has(b.archive)?S.get(b.archive):b.processed;a?(_=$.reduce((j,x)=>j+x.total,0),L=$.reduce((j,x)=>j+x.processed,0)):_<=0&&(_=A,L=I);let we=cr(L,_),ge=cr(I,A),F=cr(Y,re);u.latest=b,u.baselineRows=d,u.activeState=we,u.reuseState=ge,u.embedState=F,u.reuseComplete=ge.complete,u.embedComplete=F.complete,ge.complete?(l.active+=1,l.reuseComplete+=1):l.reuseIncomplete+=1,F.complete?l.embedComplete+=1:l.embedIncomplete+=1}let f=[...new Set([...o.values()].map(u=>u.year))].sort((u,$)=>$.localeCompare(u)).map(u=>{let $=Array.from({length:12},(b,d)=>{let h=d+1,y=`${u}${String(h).padStart(2,"0")}`,_=o.get(y);if(!_)return`<td class="judgment-month is-empty"><span>${h}</span></td>`;let L=_.current&&e.run_status==="running",S=Y=>Y.percent===null?"\u2014":`${Y.percent}%`,A=Y=>Y.empty?"\u7121\u8CC7\u6599":Y.complete?"\u5B8C\u6210":"\u672A\u5B8C\u6210",I=[`${_.year}-${String(_.monthNo).padStart(2,"0")}`,_.archives.join("\u3001")||"\u2014",`A \u4E0A\u4E00\u500B\u6B63\u5F0F\u7248\u672C ${c(_.activeState.processed)} / ${c(_.activeState.total)}\uFF08${S(_.activeState)}\uFF09\xB7 ${A(_.activeState)}`,`A\uFF0FR \u57FA\u7DDA ${c(_.reuseState.processed)} / ${c(_.reuseState.total)}\uFF08${S(_.reuseState)}\uFF09\xB7 ${A(_.reuseState)}`,`E \u65B0 embedding ${c(_.embedState.processed)} / ${c(_.embedState.total)}\uFF08${S(_.embedState)}\uFF09\xB7 ${A(_.embedState)}`,_.reuseComplete?"":"\u5F85\u5B8C\u6210\uFF1AR \u65E2\u6709\u5411\u91CF\u91CD\u7528",_.embedComplete?"":"\u5F85\u5B8C\u6210\uFF1AE \u65B0 embedding",_.current?`${_.preparing?"\u6E96\u5099\u7D22\u5F15":L?"\u76EE\u524D\u7D22\u5F15":"\u6700\u5F8C\u7D22\u5F15"}${_.jid?` \xB7 ${_.jid}`:""}`:""].filter(Boolean).join(" \xB7 "),re=[["is-active",_.activeState],["is-reuse",_.reuseState],["is-embed",_.embedState]].map(([Y,we])=>`<span class="index-month-block ${Y} ${we.stateClass}" style="--fill:${we.fill.toFixed(1)}%"></span>`).join("");return`<td class="judgment-month index-month index-month-are processing-month is-neutral${L?" is-current":""}" title="${r(I)}"${L?' aria-current="true"':""}><span class="index-month-number">${h}</span><span class="index-month-blocks" aria-hidden="true">${re}</span></td>`}).join("");return`<tr><th scope="row">${r(u)}</th>${$}</tr>`}).join("");return`<div class="judgment-months index-months">
    <div class="index-runtime-summary index-month-are-summary">
      <span title="A\uFF1A\u4E0A\u4E00\u500B\u6B63\u5F0F\u7248\u672C\u57FA\u7DDA archive \u5DF2\u5B8C\u6210\u7684\u6708\u4EFD\u6578\uFF1B\u4E0D\u5217\u5165\u65B0\u7248\u672C\u5B8C\u6210\u6578\uFF1B\u4EE5\u6708\u4EFD\u8A08\u3002">A \u57FA\u7DDA\u6708\u4EFD <strong class="mono">${c(l.active)}</strong></span>
      <span title="R \u5B8C\u6210\uFF1A\u57FA\u7DDA archive \u5DF2\u5B8C\u6210\u4E14\u53EF\u6CBF\u7528\u7684\u6708\u4EFD\u6578\uFF1B\u4EE5\u6708\u4EFD\u8A08\u3002">R \u5B8C\u6210\u6708\u4EFD <strong class="mono">${c(l.reuseComplete)}</strong></span>
      <span title="R \u672A\u5B8C\u6210\uFF1A\u57FA\u7DDA archive \u5C1A\u672A\u5B8C\u6210\u7684\u6708\u4EFD\u6578\uFF1B\u4EE5\u6708\u4EFD\u8A08\u3002">R \u672A\u5B8C\u6210\u6708\u4EFD <strong class="mono">${c(l.reuseIncomplete)}</strong></span>
      <span title="E \u5B8C\u6210\uFF1Alatest archive \u5DF2\u5B8C\u6210\u7684\u6708\u4EFD\u6578\uFF0C\u5305\u542B\u7121\u9700\u65B0 embedding \u7684\u672A\u8B8A\u66F4\u6708\u4EFD\uFF1B\u4EE5\u6708\u4EFD\u8A08\uFF0C\u4E0D\u662F RAR \u6A94\u6578\u3002">E \u5B8C\u6210\u6708\u4EFD <strong class="mono">${c(l.embedComplete)}</strong></span>
      <span title="E \u672A\u5B8C\u6210\uFF1Alatest archive \u5C1A\u672A\u5B8C\u6210\u7684\u65B0 embedding \u6708\u4EFD\u6578\uFF1B\u4EE5\u6708\u4EFD\u8A08\uFF0C\u4E0D\u662F RAR \u6A94\u6578\u3002\u5167\u5BB9\u672A\u8B8A\u66F4\u7684\u66F4\u65B0\u6A94\u6848\u6703\u6CBF\u7528\u65E2\u6709\u5411\u91CF\u3002">E \u672A\u5B8C\u6210\u6708\u4EFD <strong class="mono">${c(l.embedIncomplete)}</strong></span>
      <span>\u7E3D\u6708\u4EFD <strong class="mono">${c(o.size)}</strong></span>
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
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(u,$)=>`<th scope="col">${$+1}</th>`).join("")}</tr></thead>
        <tbody>${f}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA A\uFF08\u4E0A\u4E00\u500B\u6B63\u5F0F\u7248\u672C\u65E2\u6709\u8986\u84CB\uFF09\u3001R\uFF08\u672C\u6B21\u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF09\u3001E\uFF08\u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding\uFF09\u3002A \u4E0D\u5217\u5165\u65B0\u7248\u672C\u5B8C\u6210\u6578\uFF0CR\uFF0FE \u624D\u662F\u672C\u6B21\u5EFA\u7F6E\u9032\u5EA6\uFF1B\u5B8C\u6210\u70BA\u5BE6\u5FC3\uFF1B\u672A\u5B8C\u6210\u6642\u5DF2\u5B8C\u6210\u6BD4\u4F8B\u70BA\u5BE6\u8272\u3001\u5269\u9918\u5340\u6BB5\u70BA\u540C\u8272 25% \u6DFA\u8272\uFF0C\u56E0\u6B64 0% \u6642\u6574\u683C\u90FD\u662F\u6DFA\u8272\uFF1B\u7121\u8CC7\u6599\u624D\u662F\u6DE1\u8272\u7A7A\u5FC3\u3002\u5EFA\u7F6E\u6A21\u5F0F\u6703\u4EE5 active collection \u7684 archive \u8986\u84CB\u88DC\u4E0A\u76EE\u524D run \u5C1A\u672A\u8655\u7406\u4F46\u5DF2\u5B8C\u6210\u7684\u672A\u8B8A\u66F4\u6708\u4EFD\uFF0C\u56E0\u6B64\u4E0D\u9700\u8981\u65B0 embedding \u7684\u6708\u4EFD\u7DAD\u6301\u5BE6\u5FC3\uFF0C\u4E0D\u6703\u986F\u793A\u6210 25% \u6DFA\u8272\uFF1B\u771F\u6B63\u7F3A\u5C11\u5411\u91CF\u7684 latest archive \u624D\u5217\u70BA E \u672A\u5B8C\u6210\u3002\u540C\u4E00\u6708\u4EFD\u53EF\u80FD\u6709\u591A\u500B archive\uFF0CA\uFF0FR \u4F7F\u7528\u8F03\u820A\u7684\u57FA\u7DDA archive\uFF0CE \u4F7F\u7528\u540D\u7A31\u4E2D\u66F4\u65B0\u65E5\u671F\u6700\u65B0\u7684 archive\uFF1B\u65B0\u820A archive \u4E0D\u6703\u76F8\u52A0\u3002E \u5B8C\u6210\uFF0F\u672A\u5B8C\u6210\u4EE5\u6708\u4EFD\u8A08\uFF0C\u4E0D\u662F RAR \u6A94\u6578\uFF1B\u5167\u5BB9\u672A\u8B8A\u66F4\u7684\u66F4\u65B0\u6A94\u6848\u6703\u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF0C\u4E0D\u6703\u5217\u70BA\u672A\u5B8C\u6210\u3002\u76EE\u524D\u7D22\u5F15\u6708\u4EFD\u4EE5\u5BE6\u7DDA\u5916\u6846\u6A19\u793A\uFF0Cpadding \u4E0D\u4F7F\u7528\u72C0\u614B\u5E95\u8272\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B active \u8986\u84CB\u3001A\uFF0FR \u57FA\u7DDA\u3001E \u9032\u5EA6\u8207\u76EE\u524D\u6848\u865F\u3002</p>
  </div>`}function Iu(e){let t=e.import_timeline||{},s=Array.isArray(t.months)?t.months:[];if(!s.length)return`<section class="report-card processing-card import-files-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u672A\u53D6\u5F97\u5224\u6C7A\u4E0B\u8F09 manifest \u6216\u672C\u6A5F\u58D3\u7E2E\u6A94\uFF1B\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u5F8C\u6703\u986F\u793A\u6708\u4EFD\u72C0\u614B\u3002</div>
    </section>`;let a=new Map(s.map(b=>[String(b.month),b])),n=[...new Set(s.map(b=>b.year))].sort((b,d)=>d-b),i=["extract","raw_parquet","filter","postgres"],o=t.stage_labels||{},l=n.map(b=>{let d=Array.from({length:12},(h,y)=>{let _=y+1,L=`${b}${String(_).padStart(2,"0")}`,S=a.get(L);return br({month:S,year:b,monthNo:_,stageOrder:i,stageLabels:o,stageStatuses:S?.import_stages||{},stageProgress:S?.import_stage_progress||{},overall:S?.import_overall||"empty",active:!!S?.active,workflowForStage:()=>"judgment_import",variant:"import"})}).join("");return`<tr><th scope="row">${r(b)}</th>${d}</tr>`}).join(""),m=t.summary||{},f=t.stage_summary||{},u=s.find(b=>b.active),$=u?`<div class="index-current-row">${jo({activeMonth:t.active_month||String(u.month||""),activeArchive:t.active_archive||u.active_archive||"",activePhase:t.active_phase||"",processingMonth:t.processing_month||"",processingArchive:t.processing_archive||"",stageLabels:o})}</div>`:"";return`<section class="report-card processing-card import-files-card" data-import-timeline="judgment">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${g("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
      ${ru(t,s,f,m)}
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(b,d)=>`<th scope="col">${d+1}</th>`).join("")}</tr></thead>
          <tbody>${l}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\uFF1ARAR \u6AA2\u67E5\uFF0F\u89E3\u58D3\u7E2E\u3001\u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD\u3001\u91D1\u878D\u6CD5\u898F\u7BE9\u9078\u3001PostgreSQL metadata\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF1B\u6709\u5F85\u66F4\u65B0\u6A94\u6848\u6642\uFF0C\u5C1A\u672A\u91CD\u505A\u7684\u56DB\u500B\u968E\u6BB5\u65B9\u683C\u4EE5\u6DFA\u6A58\uFF0F\u6DFA\u7D05\uFF0F\u6DFA\u7D2B\uFF0F\u6DFA\u85CD\u8868\u793A\uFF0C\u5B8C\u6210\u5F8C\u8F49\u70BA\u5BE6\u5FC3\u6DF1\u8272\uFF1B\u5C1A\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF1B\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u5B8C\u6210\u8272\u5782\u76F4\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u672A\u5B8C\u6210\u5340\u6BB5\u7DAD\u6301 25% \u6DFA\u8272\uFF1B\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u539F\u59CB\u8CC7\u6599\u968E\u6BB5\u6703\u5148\u6AA2\u67E5\u65E2\u6709 Parquet\uFF0C\u53EF\u6CBF\u7528\u6642\u4E0D\u91CD\u65B0\u5099\u4EFD\uFF1B\u7F3A\u5C11\u6642\u6703\u986F\u793A\u300C\u5EFA\u7ACB YYYY-MM \u5099\u4EFD\u300D\uFF0C\u5B8C\u6210\u5F8C\u986F\u793A\u300C\u5DF2\u5EFA\u7ACB\u5099\u4EFD\u300D\u3002\u7BE9\u9078\u8207 PostgreSQL \u968E\u6BB5\u6703\u986F\u793A\u76EE\u524D\u8655\u7406\u7684\u6708\u4EFD\u8207 archive\u3002\u5BE6\u7DDA\u6846\u6A19\u793A\u76EE\u524D\u532F\u5165\u6708\u4EFD\uFF1B\u82E5\u5BE6\u969B\u8655\u7406\u7684\u662F\u8F03\u820A\u6708\u4EFD\uFF0C\u8A72\u6708\u53E6\u4EE5\u865B\u7DDA\u6846\u6A19\u793A\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u56DB\u500B\u968E\u6BB5\u7684\u72C0\u614B\u3001\u672C\u6A5F\u58D3\u7E2E\u6A94\u8207\u5DF2\u532F\u5165\u6A94\u540D\u3002</p>
    </div>
  </section>`}function Du(e,t,s){let n=[t.run_id||e.active_run?.id||e.last_run?.id||"",t.version_id??"",t.collection||"",t.started_at||""].join("|"),i=Date.now(),o=$o.get(n);if(!o){let b=Date.parse(t.started_at||""),d=Date.parse(t.finished_at||""),h=Date.parse(t.updated_at||"");t.run_status!=="running"&&Number.isFinite(b)&&(Number.isFinite(d)||Number.isFinite(h))?o={at:b,indexed:0}:o={at:i,indexed:Math.max(0,s)},$o.set(n,o)}let l=Date.parse(t.finished_at||""),m=Date.parse(t.updated_at||""),f=t.run_status==="running"?i:Number.isFinite(l)?l:Number.isFinite(m)?m:i,u=Math.max(0,(f-Number(o.at||0))/1e3),$=Math.max(0,Number(s)-Number(o.indexed||0));return u<=0||$<=0?0:$/u}function ia(e){let t=Number(e);return!Number.isFinite(t)||t<0?"\u2014":t>=36e5?Do(t):ue(t)}function Do(e){if(!Number.isFinite(e)||e<0)return"\u2014";let t=Math.max(0,Math.round(e/1e3)),s=Math.floor(t/3600),a=Math.floor(t%3600/60),n=t%60,i=String(n).padStart(2,"0");return s>0?`${s}h ${String(a).padStart(2,"0")}m ${i}s`:a>0?`${a}m ${i}s`:`${n}s`}function Bu(e,t,s,a){let n=Date.parse(e.started_at||"");if(!Number.isFinite(n))return{elapsedMs:null,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let i=e.run_status==="running",o=Date.parse(e.finished_at||""),l=Date.parse(e.updated_at||""),m=i?Date.now():Number.isFinite(o)?o:Number.isFinite(l)?l:Date.now(),f=Math.max(0,m-n),u=Number(s),$=Number(t);if(!Number.isFinite(u)||u<=0)return{elapsedMs:f,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let b=Math.max(0,u-Math.max(0,Number.isFinite($)?$:0));if(b<=0)return{elapsedMs:f,estimatedTotalMs:f,remainingMs:0,remainingCount:0};if(!i||a<=0)return{elapsedMs:f,estimatedTotalMs:null,remainingMs:null,remainingCount:b};let d=b/a*1e3;return{elapsedMs:f,estimatedTotalMs:f+d,remainingMs:d,remainingCount:b}}function Fu(e,t=null){let s=e.index_runtime||{};if(!s.available)return`<section class="report-card processing-card index-runtime-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("cloud",14)}llama-server \u9023\u7DDA\u6E2C\u8A66</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u6E2C\u8A66\u7684\u4E3B\u6A5F\u3001\u6A21\u578B\u8207\u9078\u7528\u7D50\u679C\u3002</div>
    </section>`;let a=!!s.coverage_only,n=s.embedding||{},i=!!(t&&!a&&s.run_status!=="running"&&Array.isArray(t.hosts)),o=i?{...n,...t,selected:t.selected||{},active:t.active||t.selected||{}}:n,l=Array.isArray(o.hosts)?o.hosts:[],m=o.selected||{},f=o.active||{},u=s.current||{},$=s.summary||{},b=Number($.indexed??u.indexed??0),d=a?0:Du(e,s,b),h=Cu(s),y=a?null:Bu(s,b,$.total,d),_=y?.remainingCount>0?`\u8207\u5269\u9918 ${c(y.remainingCount)} \u7B46`:"",L=d>0?`\u4F9D\u672C\u6B21\u5E73\u5747 ${d.toFixed(1)} \u7B46/\u79D2${_}\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002\u5BE6\u969B\u901F\u5EA6\u6703\u96A8 embedding \u8207\u6279\u6B21\u5927\u5C0F\u8B8A\u52D5\u3002`:"\u5C1A\u7121\u8DB3\u5920\u7684\u672C\u9801\u89C0\u5BDF\u8CC7\u6599\u53EF\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002",S=x=>r(Do(y?y[x]:null)),A=`<div class="index-runtime-metrics">
    <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u7D22\u5F15\u7684\u6708\u4EFD\u6578\uFF1B\u76EE\u524D\u8655\u7406\u4E2D\u7684\u6708\u4EFD\u4E0D\u5217\u5165\uFF0C\u7E3D\u6578\u70BA\u7D22\u5F15\u7BC4\u570D\u5167\u7684\u6709\u6548\u6708\u4EFD\u3002">
      <span>\u5DF2\u8655\u7406\u6708\u4EFD</span>
      <strong>${c(h.completed)} / ${c(h.total)}</strong>
    </span>
    <span class="index-runtime-metric" title="\u5DF2\u7D22\u5F15\u7B46\u6578 / \u7D22\u5F15\u7BC4\u570D\u7E3D\u7B46\u6578\u3002">
      <span>\u5DF2\u8655\u7406\u7B46\u6578</span>
      <strong>${c(b)} / ${c($.total)}</strong>
    </span>
    <span class="index-runtime-metric" title="\u81EA\u672C\u6B21\u9801\u9762\u958B\u59CB\u89C0\u5BDF\u7684\u7D2F\u8A08\u5E73\u5747\uFF1B\u4E2D\u9014\u52A0\u5165\u4EE5\u9996\u6B21\u89C0\u5BDF\u6642\u9593\u8207\u7B46\u6578\u70BA\u57FA\u6E96\u3002\u5F8C\u6BB5\u82E5\u4EE5\u65B0 embedding \u70BA\u4E3B\uFF0C\u901F\u5EA6\u6703\u4E0B\u964D\u3002">
      <span>\u672C\u6B21\u5E73\u5747</span>
      <strong>${d>0?`${d.toFixed(1)} \u7B46/\u79D2`:"\u2014"}</strong>
    </span>
    <span class="index-runtime-metric" title="\u81EA\u672C\u6B21\u7D22\u5F15 run \u958B\u59CB\u6642\u9593 ${r(ve(s.started_at))} \u8D77\u7B97\uFF1B\u4E2D\u9014\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002">
      <span>Elapsed Time</span>
      <strong>${S("elapsedMs")}</strong>
    </span>
    <span class="index-runtime-metric" title="Elapsed Time \u52A0\u4E0A\u4F9D\u5269\u9918\u4EF6\u6578\u8207\u672C\u6B21\u5E73\u5747\u901F\u5EA6\u4F30\u7B97\u7684\u5269\u9918\u6642\u9593\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u5F9E 0 \u91CD\u65B0\u8A08\u6642\u3002">
      <span>Estimated Total</span>
      <strong>${S("estimatedTotalMs")}</strong>
    </span>
    <span class="index-runtime-metric" title="${r(L)}">
      <span>Time Remaining</span>
      <strong>${S("remainingMs")}</strong>
    </span>
  </div>`,I=m.url||"",re=f.url||"",Y=I?gr(m,o.model):"\u2014",we=re?gr(f,o.model):"\u2014",ge=l.map(x=>Ru(x,I,o.model)).join(""),F=s.run_status==="running"?u.preparing?"\u6E96\u5099\u4E2D":"\u76EE\u524D\u8655\u7406":"\u6700\u5F8C\u8655\u7406",j=u.jid?`<div class="index-current-row">
        <span class="badge badge-info">${g("activity",11)}${F}</span>
        <strong class="mono">${r(Ya(u.month))}</strong>
        <span class="mono">${r(u.archive||"\u2014")}</span>
        ${u.preparing?"":Nu(u,s.run_status==="running")}
        <span class="mono">${r(u.jid||"\u2014")}</span>
        <span class="index-current-copy">${r([u.court,u.title].filter(Boolean).join(" \xB7 ")||"\u2014")}</span>
        <span class="faint">${u.preparing?"\u6E96\u5099\u4E2D":`\u6279\u6B21 ${c(u.batch_size)} \u7B46`}</span>
      </div>`:"";return`<section class="report-card processing-card index-runtime-card"${a?" hidden":""}>
    <div class="index-host-strip rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${g("cloud",13)} llama-server \u9023\u7DDA\u6E2C\u8A66</span>
        ${I?`<span class="rag-model-strip-base mono">${r(I)}</span>`:""}
        <span class="rag-model-strip-current">\u76EE\u524D\uFF1A<strong>${r(Y)}</strong></span>
        ${At(o.status||"idle")}
        ${i?'<span class="badge badge-neutral">\u76EE\u524D\u8A2D\u5B9A</span>':""}
        ${s.run_status==="running"?"":`<button class="btn btn-ghost btn-sm rag-model-refresh" type="button" data-processing-action="refresh-index-hosts">
                ${g("refresh",12)}<span>\u91CD\u65B0\u6E2C\u8A66</span>
              </button>`}
        ${re&&re!==I?`<span class="badge badge-warn">\u76EE\u524D\u4F7F\u7528 ${r(we)}</span>`:""}
        ${f.using_fallback?'<span class="badge badge-warn">\u5DF2\u5207\u63DB\u5099\u63F4</span>':""}
      </div>
      ${s.error?`<div class="processing-update-notice index-runtime-error">${g("alert",13)}<span>${r(s.error)}</span></div>`:""}
      ${ge?`<div class="rag-model-buttons">${ge}</div>`:'<p class="rag-model-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u4E3B\u6A5F\u6E2C\u8A66\u7D50\u679C\u3002</p>'}
      <p class="rag-model-hint">${i?"\u76EE\u524D\u8A2D\u5B9A\u5373\u6642\u6E2C\u8A66\uFF1B":"\u4F9D\u5E8F\u5617\u8A66\u4E3B\u8981\u3001\u5099\u63F4\u4E3B\u6A5F\uFF1B"}\u5BE6\u5FC3\u70BA\u672C\u6B21\u9078\u7528\uFF0C\u6DE1\u8272\u70BA\u53EF\u7528\u5099\u63F4\uFF0C\u7070\u8272\u70BA\u7121\u6CD5\u53D6\u5F97\u3002\u6ED1\u9F20\u79FB\u5165\u53EF\u67E5\u770B URL\u3001\u53EF\u7528\u6A21\u578B\u8207\u6E2C\u8A66\u7D30\u7BC0\u3002${o.tested_at?` \u6E2C\u8A66\u6642\u9593 ${r(ve(o.tested_at))}\u3002`:""}</p>
    </div>
  </section>
  <section class="report-card processing-card index-files-card">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${g("table",14)}\u7D22\u5F15\u6A94\u6848\u6642\u9593\u8868</span>
      ${A}
    </div>
    <div class="index-runtime-summary">
      <span>\u7248\u672C <strong class="mono">v${r(s.version_id??"\u2014")}</strong></span>
      <span>Collection <code>${r(s.collection||"\u2014")}</code></span>
      <span>\u6A21\u5F0F <strong>${r(s.build_mode||"\u2014")}</strong></span>
      ${a?"":`<span>\u91CD\u7528 <strong class="mono">${c($.reused)}</strong></span>
            <span>\u65B0 embedding <strong class="mono">${c($.embedded)}</strong></span>`}
    </div>
    ${j}
    ${Pu(s)}
    ${a?'<p class="judgment-months-hint index-coverage-note">\u76EE\u524D\u986F\u793A active collection \u7684\u6708\u4EFD\u7D22\u5F15\u8986\u84CB\uFF1B\u57F7\u884C Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u5F8C\u6703\u986F\u793A\u672C\u6B21 llama-server \u6E2C\u8A66\u8207\u5373\u6642\u9032\u5EA6\u3002</p>':""}
  </section>`}function Ou(e={}){let{storage:t,loading:s,error:a}=e;if(a)return`<section class="report-card processing-card index-storage-card">
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
    </section>`;let n=t.qdrant_storage||{},o=(Array.isArray(t.databases)?t.databases:[]).find(u=>u.id==="qdrant")||{},l=n.volume_bytes??o.volume_bytes??null,m=n.points_count??o.points_count,f=n.segments_count??o.segments_count;return`<section class="report-card processing-card index-storage-card">
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
      <span>Volume \u5BB9\u91CF</span><strong class="mono">${Le(l)}${n.volume_size?` \xB7 ${r(n.volume_size)}`:""}</strong>
      <span>Volume \u4F86\u6E90\u8DEF\u5F91</span><strong class="mono index-storage-path">${r(n.host_path||"\u2014")}</strong>
      <span>Collection</span><strong class="mono">${r(n.collection||o.collection||"\u2014")}</strong>
      <span>Alias</span><strong class="mono">${r(n.alias||"\u2014")}</strong>
      <span>Points\uFF0FSegments</span><strong class="mono">${c(m)} / ${c(f)}</strong>
    </div>
    <div class="index-runtime-foot">\u8CC7\u6599\u6642\u9593 ${r(ve(t.checked_at))}</div>
  </section>`}function $r({badge:e="",lead:t="",rows:s=[],note:a=""}){return`<section class="report-card processing-card parquet-help-card workflow-help-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("info",14)}\u529F\u80FD\u8AAA\u660E</span>
      ${e?`<span class="badge badge-neutral">${r(e)}</span>`:""}
    </div>
    <div class="parquet-help-body">
      <p class="parquet-help-lead">${t}</p>
      <div class="parquet-help-grid">${s.map(([n,i])=>`<span>${r(n)}</span><strong>${i}</strong>`).join("")}</div>
      ${a?`<p class="parquet-help-note">${a}</p>`:""}
    </div>
  </section>`}function Hu(){return $r({badge:"\u552F\u8B80\u532F\u51FA",lead:"\u5C07 PostgreSQL \u76EE\u524D\u6709\u6548\u7684\u5224\u6C7A\uFF08<code>judgment_documents.is_current = true</code>\uFF09\u532F\u51FA\u6210\u7368\u7ACB\u7684 Parquet \u5FEB\u7167\uFF0C\u4F9B\u96E2\u7DDA\u5206\u6790\u3001\u8CC7\u6599\u4EA4\u63DB\u6216\u4FDD\u5B58\u3002",rows:[["\u4F86\u6E90","PostgreSQL <code>judgment_documents</code>\uFF0C\u53EA\u542B\u76EE\u524D\u6709\u6548\u4E14\u5DF2\u547D\u4E2D\u91D1\u878D\u6CD5\u898F\u6E05\u55AE\u7684\u5224\u6C7A\u3002"],["\u8F38\u51FA",'<span class="mono">JUDGMENT_DATA_DIR/parquet/judgments/YYYYMMDD/HHMMSS-xxxxxxxx/judgments.parquet</span>'],["\u9644\u5E36\u6A94",'<span class="mono">\u540C\u76EE\u9304 manifest.json\uFF08\u7B46\u6578\u3001\u6A94\u6848\u5927\u5C0F\u3001\u6B04\u4F4D\u3001\u7522\u751F\u6642\u9593\uFF09</span>'],["\u5167\u5BB9","\u6848\u865F\u3001\u6CD5\u9662\u3001\u6848\u7531\u3001\u5168\u6587\u3001\u547D\u4E2D\u6CD5\u898F\u3001\u5F15\u7528\u3001\u4F86\u6E90\u58D3\u7E2E\u6A94\u8207\u6642\u9593\u6B04\u4F4D\uFF1B<code>citations</code> \u4EE5 JSON \u5B57\u4E32\u4FDD\u5B58\u3002"],["\u8207\u539F\u59CB Parquet","\u8CC7\u6599\u9801\u8207 <code>source=parquet</code> \u4F7F\u7528 <code>parquet/raw_judgments/.../raw.parquet</code>\uFF1B\u672C\u6D41\u7A0B\u7684 <code>parquet/judgments/...</code> \u662F\u53E6\u4E00\u500B\u6B63\u898F\u5316\u5FEB\u7167\u3002"],["\u4E0D\u6703","\u4E0D\u5BEB\u56DE PostgreSQL\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u820A\u5FEB\u7167\uFF1B\u53EA\u532F\u51FA current \u8CC7\u6599\uFF0C\u4E0D\u542B\u6B77\u53F2\u7248\u672C\u3002"],["\u4E2D\u65B7","\u6BCF\u6B21\u57F7\u884C\u5EFA\u7ACB\u65B0\u7684\u5B8C\u6574\u5FEB\u7167\uFF1B\u4E2D\u65B7\u5F8C\u91CD\u65B0\u57F7\u884C\u4E0D\u6703\u7E8C\u5BEB\u540C\u4E00\u500B Parquet \u6A94\u3002"]],note:"\u9069\u5408 DuckDB\u3001pandas\u3001Spark \u7B49\u96E2\u7DDA\u5206\u6790\uFF0C\u6216\u9700\u8981\u56FA\u5B9A\u6642\u9593\u9EDE\u7684\u53EF\u91CD\u73FE\u8CC7\u6599\u5FEB\u7167\u3002\u65E5\u5E38 RAG \u67E5\u8A62\u8207\u8CC7\u6599\u9801\u700F\u89BD\u4E0D\u9700\u8981\u57F7\u884C\u6B64\u6D41\u7A0B\u3002"})}function zu(){return $r({badge:"PostgreSQL \u56DE\u586B",lead:"\u5C07\u5224\u6C7A\u7684 <code>court</code> \u8F49\u6210\u6A19\u6E96\u6CD5\u9662\u540D\u7A31\u4E26\u5BEB\u5165 <code>court_normalized</code>\uFF1B\u539F\u59CB <code>court</code> \u6703\u4FDD\u7559\u4F9B\u8FFD\u6EAF\u3002",rows:[["\u8655\u7406\u7BC4\u570D","\u9810\u8A2D\u53EA\u8655\u7406 <code>court_normalized</code> \u70BA\u7A7A\u7684\u8CC7\u6599\uFF1B\u5DF2\u6B63\u898F\u5316\u8CC7\u6599\u6703\u8DF3\u904E\uFF0C\u53EF\u7528 <code>--all</code> \u91CD\u65B0\u8A08\u7B97\u5168\u90E8\u3002"],["\u89E3\u6790\u9806\u5E8F","\u539F\u59CB\u6CD5\u9662\u503C\u958B\u982D\u7B26\u5408\u6A19\u6E96\u540D\u7A31 \u2192 \u5224\u6C7A\u5168\u6587\u524D 8,000 \u5B57\u6700\u65E9\u51FA\u73FE\u7684\u6CD5\u9662 \u2192 \u539F\u59CB\u6CD5\u9662\u503C\u4EFB\u610F\u4F4D\u7F6E\u7684\u6A19\u6E96\u540D\u7A31 \u2192 JID \u5B98\u65B9\u6CD5\u9662\u4EE3\u78BC\u3002"],["\u8F38\u51FA","\u5BEB\u5165 <code>judgment_documents.court_normalized</code>\uFF1B\u4E0D\u4FEE\u6539\u539F\u59CB <code>court</code>\u3001\u5168\u6587\u6216\u5176\u4ED6\u5224\u6C7A\u6B04\u4F4D\u3002"],["\u672A\u89E3\u6790","\u7121\u6CD5\u5224\u65B7\u6642\u4FDD\u7559\u7A7A\u503C\uFF0C\u4E0D\u731C\u6E2C\uFF1B\u6458\u8981\u6703\u5217\u51FA\u672A\u89E3\u6790\u7B46\u6578\u8207\u5E38\u898B\u6A23\u672C\u3002"],["\u5F71\u97FF","\u8CC7\u6599\u9801\u7684\u6CD5\u9662\u4E0B\u62C9\u3001\u7CBE\u78BA\u7BE9\u9078\u3001\u6392\u5E8F\u3001\u7D50\u679C\u6B04\u4F4D\u8207\u5224\u6C7A\u539F\u6587\u4F7F\u7528\u6B63\u898F\u5316\u540D\u7A31\uFF1BAPI \u4ECD\u56DE\u50B3 <code>court_raw</code>\u3002"],["\u4E0D\u6703","\u4E0D\u91CD\u65B0\u532F\u5165\u5224\u6C7A\u3001\u4E0D\u6539\u5168\u6587\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u8CC7\u6599\u3002"],["\u91CD\u8DD1","\u9810\u8A2D\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u898F\u5247\u66F4\u65B0\u5F8C\u53EF\u7528 <code>--all</code> \u91CD\u7B97\uFF0C\u6216\u5148\u7528 <code>--dry-run</code> \u7D71\u8A08\u3002"]],note:"\u9069\u5408\u5728\u5224\u6C7A\u532F\u5165\u5F8C\u3001\u6CD5\u9662\u540D\u7A31\u898F\u5247\u66F4\u65B0\u5F8C\uFF0C\u6216\u8CC7\u6599\u9801\u6CD5\u9662\u9078\u9805\u51FA\u73FE\u7F3A\u6F0F\u6642\u57F7\u884C\u3002\u7D50\u679C\u4E5F\u6703\u5BEB\u5165\u6548\u80FD\u7D00\u9304\u3002"})}function Uu(){return $r({badge:"\u689D\u6587\u6B77\u53F2\u5EFA\u6A94",lead:"\u70BA\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u5EFA\u7ACB <code>law_article_versions</code> \u6B77\u53F2\u689D\u6587\u5FEB\u7167\u8207 <code>law_article_change_events</code> \u8B8A\u66F4\u7D00\u9304\uFF0C\u8B93\u8CC7\u6599\u9801\u80FD\u5207\u63DB\u6B77\u53F2\u7248\u672C\u4E26\u67E5\u770B\u689D\u6587\u5DEE\u7570\u3002",rows:[["\u4F86\u6E90","PostgreSQL \u6CD5\u898F\u7248\u672C\uFF0C\u4EE5\u53CA <code>LAW_DATA_DIR/raw_parquet</code> \u5167\u5C0D\u61C9\u7684\u539F\u59CB\u6CD5\u898F Parquet \u5FEB\u7167\u3002"],["\u5339\u914D\u65B9\u5F0F","\u4EE5 raw Parquet manifest \u7684 <code>zip_sha256</code>\uFF0F<code>raw_json_sha256</code> \u5C0D\u61C9\u6CD5\u898F\u7248\u672C\uFF0C\u4E0D\u731C\u6E2C\u5167\u5BB9\u3002"],["\u7522\u751F\u5167\u5BB9","<code>article_key</code>\uFF08\u689D\u6587\u985E\u578B\uFF0B\u689D\u865F\uFF09\u3001<code>content_hash</code>\u3001\u689D\u6587\u5168\u6587\u8207\u751F\u6548\u65E5\uFF1B\u8207\u524D\u4E00\u7248\u672C\u6BD4\u8F03\u5F8C\u8A18\u9304 <code>added</code>\uFF0F<code>modified</code>\uFF0F<code>removed</code>\u3002"],["\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB","\u5206\u9801\u4E0A\u65B9\u7684\u552F\u8B80\u6AA2\u67E5\u6703\u8B80\u53D6 <code>law_article_versions</code> \u8207\u539F\u59CB Parquet\uFF0C\u5224\u65B7\u7248\u672C\u662F\u5426\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\uFF1B\u6AA2\u67E5\u672C\u8EAB\u4E0D\u6703\u4FEE\u6539\u8CC7\u6599\u5EAB\u3002"],["\u53EF\u5EFA\u7ACB","\u627E\u5230\u5C0D\u61C9\u539F\u59CB Parquet \u7684\u7248\u672C\uFF0C\u53EF\u76F4\u63A5\u57F7\u884C\u6B64\u6D41\u7A0B\u5EFA\u7ACB\u689D\u6587\u6B77\u53F2\u3002"],["\u7F3A\u539F\u59CB\u6A94","\u627E\u4E0D\u5230\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u6A19\u793A\u7121\u6CD5\u5EFA\u7ACB\uFF0C\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD\uFF1B\u6B64\u6D41\u7A0B\u6703\u8DF3\u904E\u4E26\u5217\u5728 <code>missing_versions</code>\u3002"],["\u6AA2\u67E5\u7D50\u679C","\u5E74\u4EFD\xD7\u6708\u4EFD\u8868\u986F\u793A\u5DF2\u5EFA\u7ACB\uFF0F\u672A\u5EFA\u7ACB\uFF0F\u90E8\u5206\u5EFA\u7ACB\uFF1B\u4E0B\u65B9\u5217\u51FA\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u7248\u672C\u65E5\u671F\u8207\u53EF\u5EFA\u7ACB\u72C0\u614B\u3002\u76EE\u524D\u72C0\u614B\u4EE5\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u5361\u7247\u5373\u6642\u986F\u793A\u3002"],["\u8DF3\u904E\u689D\u4EF6","\u5DF2\u6709\u689D\u6587\u5FEB\u7167\u7684\u7248\u672C\u6703\u8DF3\u904E\uFF1B\u627E\u4E0D\u5230\u53EF\u8B80\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u5217\u5165 <code>missing_versions</code>\uFF0C\u4E0D\u5EFA\u7ACB\u865B\u69CB\u689D\u6587\u3002"],["\u4E0D\u6703","\u4E0D\u4E0B\u8F09\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u4E0D\u89E3\u6790\u65B0 ZIP\u3001\u4E0D\u4FEE\u6539 <code>law_documents</code> \u6216\u76EE\u524D\u7248\u672C\u3001\u4E0D\u66F4\u65B0 Qdrant\uFF0FIndexedDB\u3002"],["\u8F38\u51FA\u6458\u8981","\u7248\u672C\u6578\u3001\u8DF3\u904E\u7248\u672C\u6578\u3001\u7F3A\u5C11\u5FEB\u7167\u7248\u672C\u3001\u5BEB\u5165\u689D\u6587\u6578\u8207\u689D\u6587\u8B8A\u66F4\u4E8B\u4EF6\u6578\u3002"],["\u91CD\u8DD1","\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u5DF2\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u4E0D\u6703\u91CD\u8907\u63D2\u5165\u3002"]],note:"\u9069\u5408\u5F9E\u820A\u7248 schema \u5347\u7D1A\u3001\u65E2\u6709\u6CD5\u898F\u7248\u672C\u7F3A\u5C11\u6B77\u53F2\u689D\u6587\uFF0C\u6216\u8CC7\u6599\u9801\u6B77\u53F2\u689D\u6587\u7248\u672C\u8207\u8B8A\u66F4\u7D00\u9304\u4E0D\u5B8C\u6574\u6642\u57F7\u884C\u3002\u57F7\u884C\u524D\u53EF\u5148\u7528\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u78BA\u8A8D\u54EA\u4E9B\u7248\u672C\u53EF\u5EFA\u7ACB\u3001\u54EA\u4E9B\u7F3A\u539F\u59CB\u6A94\u3002"})}function Gu(e={}){let t=e.courtCheck,s=!!e.courtCheckLoading,a=e.courtCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-court-check"${s?" disabled":""}>${g("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31"}</span></button>`;if(a)return`<section class="report-card processing-card court-check-card">
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
    </section>`;let m={green:"\u5DF2\u6AA2\u67E5",red:"\u9700\u6B63\u898F\u5316\uFF08\u5B8C\u5168\u672A\u6AA2\u67E5\uFF09",gray:"\u9700\u6B63\u898F\u5316"},f=new Map(i.map(b=>[String(b.month),b])),$=[...new Set(i.map(b=>b.year))].sort((b,d)=>d-b).map(b=>{let d=Array.from({length:12},(h,y)=>{let _=y+1,L=`${b}${String(_).padStart(2,"0")}`,S=f.get(L);if(!S)return`<td class="judgment-month is-empty"><span>${_}</span></td>`;let A=m[S.status]?S.status:"red",I=[`${b}-${String(_).padStart(2,"0")}`,m[A],`\u7E3D ${c(S.total)} \u7B46`,`\u5DF2\u6AA2\u67E5 ${c(S.checked)} \u7B46`,`\u672A\u6AA2\u67E5 ${c(S.unchecked)} \u7B46`,S.invalid?`\u7121\u6548\u503C ${c(S.invalid)} \u7B46`:"",`\u6709\u6548 ${pt(S.percent)}`].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month court-check-month is-${A==="gray"?"red":A}" title="${r(I)}"><span>${_}</span></td>`}).join("");return`<tr><th scope="row">${r(b)}</th>${d}</tr>`}).join("");return`<section class="report-card processing-card court-check-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(b,d)=>`<th scope="col">${d+1}</th>`).join("")}</tr></thead>
          <tbody>${$}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u5168\u90E8\u5DF2\u6B63\u898F\u5316\uFF1B\u7D05\u8272\uFF1A\u9700\u6B63\u898F\u5316\uFF08\u542B\u5B8C\u5168\u672A\u6AA2\u67E5\u3001\u90E8\u5206\u672A\u6B63\u898F\u5316\u6216\u7121\u6548\u503C\uFF09\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002summary \u7684\u7D05\u8272\u6578\u5B57\u70BA\u9700\u6B63\u898F\u5316\u6708\u4EFD\u6578\uFF1B\u4E0B\u65B9\u660E\u7D30\u4ECD\u4FDD\u7559\u672A\u6AA2\u67E5\u8207\u7121\u6548\u503C\u7B46\u6578\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u8A73\u7D30\u7B46\u6578\u8207\u6709\u6548\u6BD4\u4F8B\u3002</p>
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(ve(t.checked_at))} \xB7 \u6A19\u6E96\u6CD5\u9662\u540D\u7A31 ${c(t.canonical_count)} \u500B</div>
    </div>
  </section>`}function Qu(e={}){let t=e.lawVersionCheck,s=!!e.lawVersionCheckLoading,a=e.lawVersionCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-law-version-check"${s?" disabled":""}>${g("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB"}</span></button>`;if(a)return`<section class="report-card processing-card law-version-card">
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
    </section>`;let m={green:"\u5DF2\u5EFA\u7ACB",red:"\u672A\u5EFA\u7ACB",gray:"\u90E8\u5206\u5EFA\u7ACB"},f=new Map(i.map(F=>[String(F.month),F])),$=[...new Set(i.map(F=>F.year))].sort((F,j)=>j-F).map(F=>{let j=Array.from({length:12},(x,R)=>{let W=R+1,te=`${F}${String(W).padStart(2,"0")}`,z=f.get(te);if(!z)return`<td class="judgment-month is-empty"><span>${W}</span></td>`;let de=m[z.status]?z.status:"red",xe=[`${F}-${String(W).padStart(2,"0")}`,m[de],`\u7248\u672C ${c(z.version_count)}\uFF08\u6CD5\u898F ${c(z.law_versions)}\uFF0F\u547D\u4EE4 ${c(z.order_versions)}\uFF09`,`\u5DF2\u5EFA\u7ACB ${c(z.backfilled_count)}`,`\u672A\u5EFA\u7ACB ${c(z.missing_count)}`,`\u9700\u5EFA\u7ACB ${c(z.needs_backfill_count)}\uFF08\u53EF\u5EFA\u7ACB ${c(z.backfillable_count)}\uFF0F\u7F3A\u539F\u59CB\u6A94 ${c(z.blocked_count)}\uFF09`,`\u689D\u6587\u5217 ${c(z.article_rows)} / \u9810\u671F ${c(z.article_count)}`,z.current?"\u76EE\u524D\u7248\u672C":"",z.versions?.length?`\u7248\u672C ${z.versions.map(D=>`#${D.version_id}`).join("\u3001")}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month law-version-month is-${de}${z.current?" is-current":""}" title="${r(xe)}"><span>${W}</span></td>`}).join("");return`<tr><th scope="row">${r(F)}</th>${j}</tr>`}).join(""),b={law:"\u6CD5\u898F",order:"\u547D\u4EE4"},d=i.flatMap(F=>(F.versions||[]).filter(j=>j.needs_backfill).map(j=>({...j,month:F.month}))).sort((F,j)=>j.version_id-F.version_id),h=d.slice(0,20),y=h.map(F=>{let j=F.backfillable?"badge-info":F.blocked?"badge-danger":"badge-neutral",x=F.backfillable?"\u53EF\u5EFA\u7ACB":F.blocked?"\u7F3A\u539F\u59CB\u6A94":"\u5F85\u6AA2\u67E5";return`<div class="law-backfill-needed-row">
        <strong class="mono">#${F.version_id}</strong>
        <span class="badge ${j}">${x}</span>
        <span>${r(b[F.source_type]||F.source_type||"\u2014")}</span>
        <span class="mono">${r(F.update_date||F.month||"\u2014")}</span>
        <span class="law-backfill-needed-reason">${r(F.reason||"\u2014")}</span>
      </div>`}).join(""),_=d.length?`<div class="law-backfill-needed">
        <div class="law-backfill-needed-head">\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C <span class="badge badge-warn">${c(d.length)}</span></div>
        <div class="law-backfill-needed-list">${y}</div>
        ${d.length>h.length?`<div class="law-backfill-needed-more">\u53E6\u6709 ${c(d.length-h.length)} \u500B\u7248\u672C\u672A\u5217\u51FA</div>`:""}
      </div>`:'<div class="law-backfill-needed is-clear">\u76EE\u524D\u6C92\u6709\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3002</div>',L=Number(l.needs_backfill_versions)||0,S=Number(l.backfillable_versions)||0,A=Number(l.blocked_versions)||0,I=Number(l.backfilled_versions)||0,re=Number(l.versions)||0,Y=L<=0?"ok":A>0?"danger":"warn",we=L<=0?"\u4E0D\u9700\u8981\u5EFA\u7ACB":"\u9700\u8981\u5EFA\u7ACB",ge=L>0?`\u9700\u8981\u5EFA\u7ACB ${c(L)} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF1A\u53EF\u5EFA\u7ACB ${c(S)}\u3001\u7F3A\u539F\u59CB\u6A94 ${c(A)}\u3002\u5DF2\u6709\u6B77\u53F2\u689D\u6587 ${c(I)} \u500B\u7248\u672C${A>0?"\uFF1B\u7F3A\u539F\u59CB\u6A94\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD":""}\u3002`:`\u76EE\u524D ${c(re)} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`;return`<section class="report-card processing-card law-version-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
      ${n}
    </div>
    <div class="law-version-check-status is-${Y}" role="status" aria-live="polite">
      <span class="badge badge-${Y}">${we}</span>
      <span>${r(ge)}</span>
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(F,j)=>`<th scope="col">${j+1}</th>`).join("")}</tr></thead>
          <tbody>${$}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u8A72\u6708\u4EFD\u6240\u6709\u7248\u672C\u90FD\u6709\u6B77\u53F2\u689D\u6587\uFF1B\u7D05\u8272\uFF1A\u5B8C\u5168\u672A\u5EFA\u7ACB\uFF1B\u7070\u8272\uFF1A\u90E8\u5206\u7248\u672C\u5DF2\u5EFA\u7ACB\uFF1B\u5916\u6846\uFF1A\u76EE\u524D\u7248\u672C\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u7248\u672C\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u6578\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u6578\u8207\u689D\u6587\u5217\u3002</p>
      ${_}
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(ve(t.checked_at))}</div>
    </div>
  </section>`}function Ju(){return`<div class="processing-ollama-loading">
    <span class="spinner" aria-hidden="true"></span>
    <span>\u6B63\u5728\u6AA2\u67E5 llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span>
  </div>`}function Wu(e,t,s){let a=Array.isArray(e?.hosts)?e.hosts:[];if(s&&!a.length)return`${De({tone:"danger",title:"llama-server \u4E3B\u6A5F\u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
    <div class="processing-ollama-empty">
      <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh-ollama">
        ${g("refresh",13)}<span>\u91CD\u65B0\u6AA2\u67E5</span>
      </button>
    </div>`;if(!a.length)return t?Ju():'<div class="processing-ollama-empty">\u5C1A\u672A\u8A2D\u5B9A llama-server \u4E3B\u6A5F\uFF1B\u8ACB\u5230\u300C\u7CFB\u7D71\u72C0\u614B \u2192 Model Provider\u300D\u65B0\u589E\u4E26\u9023\u63A5\u6A21\u578B\u3002</div>';let n=a.map((o,l)=>{let m=o.status==="operational",f=Array.isArray(o.models)?o.models:[],u=f.length?f.map(b=>`<span class="processing-ollama-model ${m?"is-online":"is-offline"}">${r(b.name||"")}</span>`).join(""):'<span class="processing-ollama-model is-offline">\u6C92\u6709\u53EF\u7528\u6A21\u578B</span>',$=[o.embedding_model?`<span class="processing-ollama-role ${m?"is-online":"is-offline"}">\u5D4C\u5165 \xB7 ${r(o.embedding_model)}</span>`:'<span class="processing-ollama-role is-offline">\u672A\u8A2D\u5B9A\u5D4C\u5165\u6A21\u578B</span>',o.chat_model?`<span class="processing-ollama-role is-offline">\u804A\u5929 \xB7 ${r(o.chat_model)}</span>`:""].filter(Boolean).join("");return`<article class="processing-ollama-host ${m?"is-online":"is-offline"}" data-ollama-host data-host-id="${Number(o.id)}">
        <span class="processing-ollama-handle" aria-hidden="true">${g("grid",14)}</span>
        <span class="processing-ollama-rank">${l+1}</span>
        <div class="processing-ollama-main">
          <div class="processing-ollama-title">
            <strong>${r(o.name||o.base_url||`\u4E3B\u6A5F #${o.id}`)}</strong>
            <span class="processing-ollama-status">${m?"\u53EF\u7528":"\u7121\u6CD5\u9023\u7DDA"}</span>
          </div>
          <span class="processing-ollama-url mono">${r(o.base_url||"\u2014")}</span>
          <div class="processing-ollama-models">${u}</div>
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
      <span>\u5171 ${c(a.length)} \u53F0\u4E3B\u6A5F</span>
      <span>\u7B2C\u4E00\u512A\u5148\uFF1A<strong>${r(i)}</strong></span>
      <span class="muted">${t?"\u91CD\u65B0\u6AA2\u67E5\u4E2D\u2026":"\u6BCF 30 \u79D2\u81EA\u52D5\u6AA2\u67E5"}</span>
    </div>
    <div class="processing-ollama-list" data-ollama-list>${n}</div>
    <p class="processing-ollama-hint">\u62D6\u79FB\u6216\u4F7F\u7528\u7BAD\u982D\u8ABF\u6574 embedding \u512A\u5148\u9806\u5E8F\uFF1B\u76EE\u524D\u4E3B\u6A5F\u7121\u6CD5\u4F7F\u7528\u6642\uFF0C\u6703\u4F9D\u5E8F\u81EA\u52D5\u6539\u7528\u4E0B\u4E00\u53F0\uFF08\u5404\u53F0\u9700\u5177\u5099\u76F8\u540C\u7684 embedding \u6A21\u578B\uFF09\uFF0C\u76F4\u5230\u6709\u4E3B\u6A5F\u56DE\u50B3\u5411\u91CF\u3002</p>`}function Vu(e,t={}){let s=e.active_run||null,a=s||e.last_run||null,n=Dt===e.id,i=!!s||n,o=!!e.can_run&&!i,l=i?"\u6B64\u6D41\u7A0B\u6B63\u5728\u57F7\u884C\u4E2D\u3002":e.start_blocked_reason||"\u76EE\u524D\u6709\u5176\u4ED6\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",m=Array.isArray(e.command)?e.command.join(" "):"",f=Number(e.update_count)||e.update_available&&Number(e.pending_count)||0,u=e.update_origin||"\u66F4\u65B0\u5075\u6E2C",$=e.update_mechanism||"\u65E2\u6709\u66F4\u65B0\u6AA2\u67E5\u7D00\u9304",b=e.update_message||e.update_status&&e.update_status.message||"\u627E\u5230\u53EF\u66F4\u65B0\u5167\u5BB9\u3002",d=e.update_status&&e.update_status.checked_at?ve(e.update_status.checked_at):"",h=e.progress||{},y=Array.isArray(h.stages)?h.stages:[],_=String(h.active_stage||""),L=y.find(Y=>String(Y.key||"")===_),S=(e.index_runtime&&e.index_runtime.current?e.index_runtime.current.month:"")||"",A=S?Ya(S):L&&(L.label||L.key)||"",I=n&&!s?"\u555F\u52D5\u4E2D":"\u57F7\u884C\u4E2D",re=`<section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${g(No[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
        <span class="badge badge-neutral badge-mono">${r(e.branch||"")}</span>
      </div>
      <div class="processing-workflow-command-grid">
        <span>\u7A0B\u5F0F</span><code>${r(e.program||"\u2014")}</code>
        <span>Shell\uFF0F\u5165\u53E3</span><code>${r(e.script||"\u2014")}</code>
        <span>\u5BE6\u969B\u547D\u4EE4</span><code class="processing-workflow-command">${r(m||"\u2014")}</code>
      </div>
      ${dr.has(e.id)?'<div class="processing-embedding-strip-slot" data-processing-embedding-strip data-preserve-children></div>':""}
      <div class="processing-workflow-actions">
        <button class="btn btn-primary btn-sm" type="button"
          data-processing-action="run-workflow"
          data-workflow-id="${r(e.id)}"
          ${o?"":"disabled"}
          ${o?"":`title="${r(l)}"`}>
          ${i?'<span class="spinner" aria-hidden="true"></span>':g("play",14)}<span>${i?I:"\u57F7\u884C\u6B64\u6D41\u7A0B"}</span>
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
              <span class="badge badge-info">${g("activity",11)}${I}</span>
              ${s&&s.id?`<span class="mono">${r(s.id)}</span>`:""}
              ${s&&s.started_at?`<span>\u958B\u59CB ${r(ve(s.started_at))}</span>`:""}
              ${A?`<span>\u76EE\u524D\u8655\u7406 <strong class="mono">${r(A)}</strong></span>`:""}
            </div>`:""}
      <div class="side-card-foot">
        \u57F7\u884C\u7D50\u679C\u6703\u5BEB\u5165\u5171\u7528\u8655\u7406\u72C0\u614B\u6A94\uFF0C\u53EF\u5F9E\u8655\u7406\u7E3D\u89BD\u67E5\u770B\u3002
      </div>
    </section>`;return`<div class="processing-workflow-panel">
    ${De({tone:"info",title:e.label,text:e.description||""})}
    ${e.update_available?`<div class="processing-update-notice" role="status" data-processing-update-notice>
            <span class="processing-update-notice-icon">${g("refresh",14)}</span>
            <span class="processing-update-notice-copy">
              <strong>${r(u)}\u5075\u6E2C\u5230\u53EF\u66F4\u65B0\u5167\u5BB9</strong>
              <span class="processing-update-mechanism">\u5075\u6E2C\u6A5F\u5236\uFF1A${r($)}${d?` \xB7 \u6AA2\u67E5\u6642\u9593 ${r(d)}`:""}</span>
              <span class="processing-update-message" data-processing-update-message>${r(b)}</span>
            </span>
            ${f>0?`<span class="badge badge-warn badge-mono" data-processing-update-count>${g("refresh",10)}${c(f)}</span>`:'<span class="badge badge-warn">\u53EF\u66F4\u65B0</span>'}
            <button class="btn btn-primary btn-sm processing-update-action" type="button"
              data-processing-action="run-workflow"
              data-workflow-id="${r(e.id)}"
              ${o?"":"disabled"}
              title="${r(o?"\u7ACB\u5373\u57F7\u884C\uFF1B\u6703\u5148\u8A08\u7B97\u7E3D\u5927\u5C0F\u8207\u9810\u4F30\u6642\u9593":l)}">
              ${i?'<span class="spinner" aria-hidden="true"></span>':g("download",14)}<span>${i?I:"\u66F4\u65B0"}</span>
            </button>
          </div>`:""}
    ${["legal_index_versions","law_download","order_download"].includes(e.id)?ou(e.index_timelines,{titleSuffix:e.id==="legal_index_versions"?"\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868":"\u4E0B\u8F09\u6642\u9593\u8868"}):""}
    ${e.id==="normalize_courts"?re:""}
    ${e.id==="normalize_courts"?Gu(t):""}
    ${e.id==="backfill_law_articles"?Qu(t):""}
    ${e.id!=="normalize_courts"?re:""}
    ${Tu(e)}
    ${e.id==="judgment_parquet"?Hu():""}
    ${e.id==="normalize_courts"?zu():""}
    ${e.id==="backfill_law_articles"?Uu():""}
    ${e.id==="judgment_import"?Iu(e):""}
    ${e.id==="index_versions"?Fu(e,t.indexHostProbe):""}
    ${e.id==="index_versions"?Ou(t):""}
    ${e.id==="judgment_download"?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${g("calendar",14)}\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B</span>
              <button class="btn btn-ghost btn-sm" type="button" title="\u91CD\u65B0\u6383\u63CF raw_rar \u76EE\u9304\u8207\u6708\u4EFD\u72C0\u614B" data-processing-action="refresh-judgment-months">${g("refresh",13)}<span>\u91CD\u65B0\u6574\u7406</span></button>
            </div>
            <div data-judgment-months-slot data-preserve-children>${vr()}</div>
          </section>`:""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${At(a?.status||"idle")}
      </div>
      ${hu(a)}
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("history",14)}\u57F7\u884C\u7D00\u9304</span>
        <span class="badge badge-neutral">\u6700\u8FD1 ${c((e.recent_runs||[]).length)} \u7B46</span>
      </div>
      ${xu(e.recent_runs)}
    </section>
    ${["law_download","order_download","judgment_download"].includes(e.id)?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${g("search",14)}\u7248\u672C\u6AA2\u67E5\u7D00\u9304</span>
              <span class="badge badge-neutral">\u6700\u8FD1 ${c((e.update_history||[]).length)} \u7B46</span>
            </div>
            ${Au(e)}
          </section>`:""}
  </div>`}function Ka(e,t,s={},a=new Set){if(t==="overview")return qo(e,a);let i=(Array.isArray(e.workflows)?e.workflows:[]).find(o=>o.id===t);return i?Vu(i,s):qo(e,a)}async function Ku(e){e.innerHTML=`<section class="page processing-page">
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
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-workflows"),n=e.querySelector("#processing-stop"),i=!1,o=document.createElement("div");o.className="processing-stage-tooltip",o.hidden=!0,t.appendChild(o),It=new Map;let l=!1,m=!1,f=!1,u=null,$="",b="",d="overview",h=null,y=!1,_=null,L=null,S=null,A=!1,I=null,re=0,Y=null,we=!1,ge=null,F=0,j=null,x=!1,R=null,W=0,te=null,z=!1,de=null,xe=null,D=!1,ke=0,se=0,je=!1,_e=null,oe=!1,ie=!1,he="",fe=new Set,Ae=null,$e=null,Pe=-1,Ue="",C=0,O=0,k=null,E=[],X=()=>({storage:S,loading:A,error:I,courtCheck:Y,courtCheckLoading:we,courtCheckError:ge,lawVersionCheck:j,lawVersionCheckLoading:x,lawVersionCheckError:R,indexHostProbe:xe,indexHostProbeLoading:D}),H=()=>{if(d!=="judgment_download")return;let p=s.querySelector(".processing-workflow-panel");if(!p)return;p.querySelectorAll(".judgment-month.is-active").forEach(He=>{He.classList.remove("is-active"),He.removeAttribute("aria-current")});let v=p.querySelector("[data-judgment-progress]");if(!v)return;let M=h?.progress,G=!!(u?.workflows||[]).find(He=>He.id==="judgment_download")?.active_run;if((!M||M.active===!1)&&!G){v.hidden=!0,v.classList.remove("is-indeterminate");let He=v.querySelector("[data-judgment-run]");He&&(He.hidden=!0);return}if(v.hidden=!1,!M||M.active===!1){let He=v.querySelector("[data-judgment-progress-phase]");He&&(He.textContent="\u6E96\u5099\u4E2D");let $t=v.querySelector("[data-judgment-progress-month]");$t&&($t.textContent="\u2014");let Xe=v.querySelector("[data-judgment-progress-filename]");Xe&&(Xe.textContent="\u7B49\u5F85\u4E0B\u8F09\u7A0B\u5E8F\u56DE\u5831\u9032\u5EA6\u2026",Xe.title=""),v.classList.add("is-indeterminate");let Jt=v.querySelector("[data-judgment-progress-bar]");Jt&&(Jt.style.width="");let St=v.querySelector("[data-judgment-progress-percent]");St&&(St.textContent="\u2014");let yt=v.querySelector("[data-judgment-progress-size]");yt&&(yt.textContent="\u2014");let os=v.querySelector("[data-judgment-progress-note]");os&&(os.textContent="\u5DF2\u555F\u52D5\uFF0C\u7B49\u5F85\u9032\u5EA6\u56DE\u5831");let Wt=v.querySelector("[data-judgment-run]");Wt&&(Wt.hidden=!0);let Ht=v.querySelector("[data-judgment-downloads]");Ht&&(Ht.hidden=!0);let Vt=v.querySelector("[data-judgment-current]");Vt&&(Vt.hidden=!1);return}let J={preparing:"\u6E96\u5099\u4E2D",planning:"\u8A08\u7B97\u5927\u5C0F",scanning:"\u6383\u63CF\u4E2D",checking:"\u6AA2\u67E5\u4E2D",downloading:"\u4E0B\u8F09\u4E2D",saving:"\u5132\u5B58\u4E2D",finalizing:"\u6574\u7406\u4E2D"},be=J[M.phase]||"\u8655\u7406\u4E2D",ee=Array.isArray(M.downloads)?M.downloads:[],le=ee.length>0,me=v.querySelector("[data-judgment-current]");me&&(me.hidden=le);let Se=v.querySelector("[data-judgment-downloads]");if(Se){Se.hidden=!le;let He=v.querySelector("[data-judgment-downloads-count]");He&&(He.textContent=`${c(ee.length)} \u500B\u9032\u884C\u4E2D`);let $t=v.querySelector("[data-judgment-downloads-list]");$t&&le&&($t.innerHTML=ee.map(Xe=>{let Jt=J[Xe.phase]||be||"\u8655\u7406\u4E2D",St=Number(Xe.bytes_written),yt=Number(Xe.total_bytes),os=Number.isFinite(yt)&&yt>0,Wt=Xe.percent,Ht=Wt==null||Wt===""?os&&Number.isFinite(St)?St/yt*100:null:Number(Wt),Vt=Ht===null||!Number.isFinite(Ht),fa=Vt?"\u2014":`${Math.min(100,Math.max(0,Ht)).toFixed(Ht>=10?0:1)}%`,ba=os?`${Le(St)} / ${Le(yt)}`:Number.isFinite(St)&&St>0?Le(St):"\u2014";return`<div class="processing-download-active-item">
              <div class="processing-download-active-line">
                <strong class="mono">${r(Xe.month||"\u2014")}</strong>
                <span class="processing-download-active-file mono" title="${r(Xe.filename||"")}">${r(Xe.filename||"\u2014")}</span>
                <span class="processing-download-active-percent mono">${r(fa)}</span>
              </div>
              <div class="processing-download-active-track${Vt?" is-indeterminate":""}"><span style="width:${Vt?"":`${Math.min(100,Math.max(0,Ht)).toFixed(1)}%`}"></span></div>
              <div class="processing-download-active-meta">
                <span>${r(Jt)}</span>
                <span>${r(ba)}</span>
              </div>
            </div>`}).join(""))}let Ee=v.querySelector("[data-judgment-progress-phase]");Ee&&(Ee.textContent=be);let qe=M.month||"",Ge=v.querySelector("[data-judgment-progress-month]");Ge&&(Ge.textContent=qe||"\u2014");let Ve=M.filename||"",ot=v.querySelector("[data-judgment-progress-filename]");ot&&(ot.textContent=Ve||"\u2014",ot.title=Ve);let at=new Map;for(let He of ee)He.month&&at.set(String(He.month),{percent:He.percent,phase:He.phase});qe&&!at.has(qe)&&at.set(qe,{percent:M.percent,phase:M.phase}),p.querySelectorAll(".judgment-month.is-active").forEach(He=>{He.classList.remove("is-active","is-downloading"),He.removeAttribute("aria-current"),He.style.removeProperty("--month-progress")});for(let[He,$t]of at){let Xe=p.querySelector(`[data-judgment-month-key="${He}"]`);if(!Xe)continue;Xe.classList.add("is-active"),($t?.phase==="downloading"||$t?.phase==="saving")&&Xe.classList.add("is-downloading"),Xe.setAttribute("aria-current","true");let Jt=Number($t?.percent);Number.isFinite(Jt)&&Xe.style.setProperty("--month-progress",`${Math.min(100,Math.max(0,Jt)).toFixed(1)}%`)}let gt=Number(M.bytes_written),is=Number(M.total_bytes),Us=Number.isFinite(is)&&is>0,Gs=null,Qs=M.percent;Qs!=null&&Qs!==""&&Number.isFinite(Number(Qs))?Gs=Number(Qs):Us&&Number.isFinite(gt)&&(Gs=gt/is*100);let on=Gs===null;v.classList.toggle("is-indeterminate",on);let Nr=v.querySelector("[data-judgment-progress-bar]");Nr&&(Nr.style.width=on?"":`${Math.min(100,Math.max(0,Gs)).toFixed(1)}%`);let Er=v.querySelector("[data-judgment-progress-percent]");if(Er){let He=on?null:Math.min(100,Math.max(0,Gs));Er.textContent=He===null?"\u2014":`${He.toFixed(He>=10?0:1)}%`}let Rr=v.querySelector("[data-judgment-progress-size]");if(Rr){let He=Number.isFinite(gt)&&gt>0?Le(gt):"\u2014";Rr.textContent=Us?`${He} / ${Le(is)}`:He}let Cr=v.querySelector("[data-judgment-progress-note]");if(Cr){let He=[],$t=Number(M.candidate_index),Xe=Number(M.candidate_total);Number.isFinite($t)&&$t>0&&Number.isFinite(Xe)&&Xe>0&&He.push(`\u7B2C ${c($t)} / ${c(Xe)} \u500B\u6708`),M.fileset_id&&He.push(`fileset ${M.fileset_id}`),M.message&&M.phase!=="downloading"&&He.push(String(M.message)),Cr.textContent=He.join(" \xB7 ")}let Pr=v.querySelector("[data-judgment-run]"),Ir=M.run_files_total!==null&&M.run_files_total!==void 0;if(Pr&&(Pr.hidden=!Ir,Ir)){let He=Number(M.run_files_total)||0,$t=Number(M.run_files_done)||0,Xe=M.run_bytes_total===null||M.run_bytes_total===void 0?null:Number(M.run_bytes_total),Jt=Number(M.run_bytes_done)||0,St=M.run_percent,yt=St==null||St===""?null:Number(St),os=v.querySelector("[data-judgment-run-bar]");os&&(os.style.width=yt===null||!Number.isFinite(yt)?"":`${Math.min(100,Math.max(0,yt)).toFixed(1)}%`);let Wt=v.querySelector("[data-judgment-run-percent]");Wt&&(Wt.textContent=yt===null||!Number.isFinite(yt)?"\u2014":`${yt.toFixed(yt>=10?0:1)}%`);let Ht=v.querySelector("[data-judgment-run-files]");Ht&&(Ht.textContent=`${c($t)} / ${c(He)} \u500B\u6708`);let Vt=v.querySelector("[data-judgment-run-size]"),fa=M.phase==="planning";Vt&&(Xe!==null&&Xe>0?Vt.textContent=`\u5DF2\u4E0B\u8F09 ${Le(Jt)} / ${Le(Xe)}`:Vt.textContent=`\u5DF2\u4E0B\u8F09 ${Le(Jt)} \xB7 ${fa?"\u7E3D\u91CF\u8A08\u7B97\u4E2D":"\u7E3D\u91CF\u672A\u77E5"}`);let ba=v.querySelector("[data-judgment-run-elapsed]");ba&&(ba.textContent=`\u5DF2\u82B1 ${or(M.elapsed_seconds)}`);let ln=v.querySelector("[data-judgment-run-eta]");if(ln){let cn=Number(M.eta_seconds),rl=Number(M.estimated_total_seconds);Number.isFinite(cn)&&cn>=0?ln.textContent=`\u5269\u9918 ${or(cn)} \xB7 \u9810\u4F30\u7E3D\u8A08 ${or(rl)}`:ln.textContent=fa&&(M.run_bytes_total===null||M.run_bytes_total===void 0)?"\u5269\u9918\u6642\u9593\uFF1A\u8A08\u7B97\u4E2D":"\u5269\u9918\u6642\u9593\uFF1A\u2014"}}},Re=()=>{if(d!=="judgment_download")return;let p=s.querySelector("[data-judgment-months-slot]");if(p){let v=Array.isArray(h?.months)?h.months:[];_&&!h?(p.innerHTML=De({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(_)}),delete p.dataset.judgmentMonthCount):h?p.dataset.judgmentMonthCount!==String(v.length)?(p.innerHTML=ku(h),p.dataset.judgmentMonthCount=String(v.length)):Su(p,h):(p.querySelector(".judgment-months-loading")||(p.innerHTML=vr()),delete p.dataset.judgmentMonthCount)}if(h){let v=hr(h),M=L!==v.pending;L=v.pending;let V=(u?.workflows||[]).find(J=>J.id==="judgment_download");V&&(V.update_count=v.pending,V.update_available=v.pending>0);let G=s.querySelector("[data-processing-update-notice]");if(G)if(v.pending<=0)G.remove();else{let J=G.querySelector("[data-processing-update-count]");J&&(J.innerHTML=`${g("refresh",10)}${c(v.pending)}`);let be=G.querySelector("[data-processing-update-message]");be&&(be.textContent=`\u5224\u6C7A\u5F85\u88DC\u9F4A ${c(v.pending)} \u500B\u6708`)}M&&a&&u&&as(a,Wa(u,d))}H()},Ce=()=>{let p=Array.isArray(te?.hosts)?te.hosts:[];return JSON.stringify({loading:!p.length&&z,error:!p.length&&de?de.message||String(de):"",active:te?.active_host_id??null,hosts:p.map(v=>({id:v.id,name:v.name,url:v.base_url,status:v.status,detail:v.detail,embedding:v.embedding_model,chat:v.chat_model,models:(v.models||[]).map(M=>M.name)}))})},Ie=()=>{let p=s.querySelector("[data-processing-ollama]");if(!p||se)return;let v=Ce();p.dataset.ollamaSignature!==v&&(p.dataset.ollamaSignature=v,p.innerHTML=Wu(te,z,te?null:de))},Fe=()=>{let v=((u?.sections||[]).find(M=>M.key==="legal")?.stages||[]).find(M=>M.key==="legal_qdrant");return lr(v?.model?.label||"")},Ye=()=>{let p=s.querySelector("[data-processing-embedding-strip]");if(!p)return;let v=Array.isArray(te?.hosts)?te.hosts:[],M=[];for(let le of v)if(le.status==="operational")for(let me of le.models||[])Array.isArray(me.capabilities)&&me.capabilities.includes("embedding")&&M.push({hostId:Number(le.id),model:me.name,label:lr(`${le.name||le.base_url||`\u4E3B\u6A5F ${le.id}`}:${me.name}`),baseUrl:le.base_url||""});let V=Fe(),G=v.find(le=>Number(le.id)===Number(te?.active_host_id)),J=M.map(le=>{let me=le.label===V;return`<button class="rag-model-button${me?" is-active":""}" type="button"
        data-processing-action="select-embedding-model"
        data-host-id="${le.hostId}"
        data-model="${r(le.model)}"
        title="${r(le.label)}"
        aria-pressed="${me?"true":"false"}"
        ${ie?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(le.label)}</span>
        ${me?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`});V&&!M.some(le=>le.label===V)&&J.unshift(`<button class="rag-model-button is-active is-static" type="button" aria-pressed="true" disabled>
          <span class="rag-model-state" aria-hidden="true"></span>
          <span>${r(V)}</span>
          <span class="rag-model-current">\u4F7F\u7528\u4E2D</span>
        </button>`);let be=M.length?`<div class="rag-model-buttons">${J.join("")}</div>`:`<p class="rag-model-empty">${z?"\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\u8207 Embedding model\u2026":de?`\u7121\u6CD5\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\uFF1A${r(de.message||String(de))}`:"\u76EE\u524D\u6C92\u6709\u53EF\u7528\u7684 Embedding model\u3002"}</p>`,ee=`<div class="processing-embedding-strip rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${g("brain",13)} Embedding \u4E3B\u6A5F\uFF0F\u6A21\u578B</span>
        ${G?.base_url?`<span class="rag-model-strip-base mono">${r(G.base_url)}</span>`:""}
        <span class="rag-model-strip-current">\u76EE\u524D\uFF1A<strong>${r(V||"\u2014")}</strong></span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-processing-action="refresh-embedding-models"
          ${z?"disabled":""}>
          ${g("refresh",12)}<span>\u6AA2\u67E5\u6A21\u578B</span>
        </button>
      </div>
      ${be}
      <p class="rag-model-hint">\u9EDE\u9078 <span class="mono">\u4E3B\u6A5F:\u6A21\u578B</span> \u5207\u63DB Embedding\uFF1B\u9078\u53D6\u5F8C\u6703\u6210\u70BA\u7B2C\u4E00\u512A\u5148\uFF0C\u5176\u4ED6\u4E3B\u6A5F\u4F9D\u5E8F\u4F5C\u70BA\u5099\u63F4\u3002\u5207\u63DB\u6A21\u578B\u5F8C\u65E2\u6709\u7D22\u5F15\u53EF\u80FD\u9700\u8981\u91CD\u5EFA\u3002</p>
    </div>`;p.innerHTML!==ee&&(p.innerHTML=ee)},We=p=>{let v=s.querySelector('[data-import-timeline="judgment"]');if(!v)return;let M=String(p?.active_month||""),V=String(p?.processing_month||"");v.querySelectorAll(".processing-month").forEach(Se=>{let Ee=!!M&&Se.dataset.month===M;Se.classList.toggle("is-current",Ee),Se.classList.toggle("is-processing-current",!!V&&Se.dataset.month===V),Ee?Se.setAttribute("aria-current","true"):Se.removeAttribute("aria-current")});let G=v.querySelector(".index-current-row");if(!M||!p?.active_archive){G&&G.remove();return}let J=u?.workflows?.find(Se=>Se.id==="judgment_import")?.import_timeline?.stage_labels||{},be=jo({activeMonth:M,activeArchive:p.active_archive,activePhase:p.active_phase||"",processingMonth:p.processing_month||"",processingArchive:p.processing_archive||"",stageLabels:J});if(G){G.innerHTML=be;return}let ee=document.createElement("div");ee.className="index-current-row",ee.innerHTML=be;let le=v.querySelector(":scope > .side-card-head");if(le){le.insertAdjacentElement("afterend",ee);return}let me=v.querySelector(".judgment-months");me&&me.prepend(ee)},it=p=>{let v=Number(p?.state_mtime_ns);return Number.isFinite(v)?v:-1},_t=p=>{let v=String(p?.active_month||"");return/^\d{6}$/.test(v)?Number(v):-1},jt=p=>{if(!p)return;let v=it(p);if(v>=0&&v<Pe){$e?.active_month&&We($e);return}v>=0&&(Pe=v);let M=String(p.active_month||"");if(!!(p.run_id&&p.run_id===$e?.run_id)&&_t(p)>=0&&_t(p)<_t($e)){let G={...p,active_month:$e.active_month,active_archive:$e.active_archive};$e=G,We(G);return}if(!M&&p.run_status==="running"){$e?.active_month&&$e?.run_id===p.run_id?We($e):($e=p,We(p));return}$e=p,We(p)},Ke=p=>{let v=p?.active_import;if(v){jt(v);return}$e?.active_month&&We($e)},mt=()=>{l||Ae||(Ae=bt(["processing","judgment-download","system-usage","ollama","court-check","law-version-check"],(p,v)=>{if(!l){if(p==="processing"){v?.snapshot?.live?qs(v.snapshot):v?.snapshot?As(v.snapshot,{silent:!0}):qt({silent:!0});return}if(p==="judgment-download"){d==="judgment_download"&&Z({quiet:!0,payload:v?.snapshot||null});return}if(p==="system-usage"){d==="index_versions"&&ae({quiet:!0,force:!0,payload:v?.snapshot||null});return}if(p==="ollama"){dr.has(d)&&ye({quiet:!0,payload:v?.snapshot||null});return}if(p==="court-check"){d==="normalize_courts"&&pe({quiet:!0,force:!0,payload:v?.snapshot||null});return}p==="law-version-check"&&d==="backfill_law_articles"&&Te({quiet:!0,force:!0,payload:v?.snapshot||null})}},{onProgress:(p,v)=>{if(p!=="processing")return;let M=v?.event;M&&ma(M)},onError:()=>{u||qt({silent:!0})}}))},Bt=()=>{Ae&&(Ae(),Ae=null)},ne=async p=>{if(ie)return;let[v,...M]=String(p||"").split("|"),V=Number(v),G=M.join("|");if(!V||!G){Ye();return}let J=(te?.hosts||[]).find(ee=>Number(ee.id)===V);if(!J){Ye();return}let be=lr(`${J.name||J.base_url||`\u4E3B\u6A5F ${J.id}`}:${G}`);if(be===Fe()){Ye();return}if(!window.confirm(`\u5207\u63DB Embedding \u70BA ${be}\uFF1F

\u5207\u63DB\u6A21\u578B\u5F8C\uFF0C\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u8207\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u53EF\u80FD\u4E0D\u76F8\u5BB9\uFF0C\u9700\u8981\u91CD\u65B0\u5EFA\u7ACB\u7D22\u5F15\u3002`)){Ye();return}ie=!0,Ye();try{await K.selectOllamaModel(V,{model:G,role:"embedding"});let ee=(te?.hosts||[]).map(me=>Number(me.id)),le=[V,...ee.filter(me=>me!==V)];await K.reorderOllamaHosts(le),P(`\u5DF2\u5207\u63DB Embedding \u70BA ${be}\u3002`,"ok",6e3),te=null,await ye({quiet:!0}),await qt({silent:!0})}catch(ee){P(ee.message||"\u7121\u6CD5\u5207\u63DB Embedding model\u3002","danger",7e3),await ye({quiet:!0})}finally{ie=!1,Ye()}},ye=async({quiet:p=!1,button:v=null,payload:M=null}={})=>{if(!(l||z)){z=!0,de=null,te||(Ie(),Ye()),v&&Me(v,!0,"\u6AA2\u67E5\u4E2D\u2026");try{let V=M||await K.ollamaHosts();if(l)return;te=V}catch(V){if(l)return;de=V,p||P(V.message||"\u7121\u6CD5\u6AA2\u67E5 llama-server \u4E3B\u6A5F\u3002","danger",6e3)}finally{l||(z=!1,v&&Me(v,!1),Ie(),Ye())}}},Je=async({quiet:p=!1,force:v=!1,button:M=null}={})=>{if(!(l||D)&&!(!v&&xe&&Date.now()-ke<3e4)){D=!0,M&&Me(M,!0,"\u6E2C\u8A66\u4E2D\u2026");try{let V=await K.embeddingHostsProbe();if(l)return;xe=V,ke=Date.now()}catch(V){if(l)return;p||P(V.message||"\u7121\u6CD5\u6E2C\u8A66 llama-server \u4E3B\u6A5F\u3002","danger",7e3)}finally{l||(D=!1,M&&Me(M,!1),d==="index_versions"&&kt())}}},Ze=async p=>{if(oe)return;let v=(te?.hosts||[]).map(J=>Number(J.id)),M=p.map(J=>Number(J));if(!M.length||M.length!==v.length||M.every((J,be)=>J===v[be])){Ie();return}oe=!0;let V=new Map((te?.hosts||[]).map(J=>[Number(J.id),J])),G=M.map(J=>V.get(J)).filter(Boolean);if(te&&G.length===v.length){te={...te,hosts:G,active_host_id:M[0]};let J=s.querySelector("[data-processing-ollama]");J&&(J.dataset.ollamaSignature=""),Ie()}try{await K.reorderOllamaHosts(M),P("\u5DF2\u66F4\u65B0 llama-server \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","ok",3500)}catch(J){P(J.message||"\u7121\u6CD5\u66F4\u65B0 llama-server \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","danger",6e3),await ye({quiet:!0})}finally{oe=!1}},Ft=()=>{let p=s.querySelector("[data-processing-ollama]");p&&(p.dataset.ollamaSignature=""),Ie()},Ot=()=>{let p=_e;if(!p)return;if(s.querySelector(`[data-ollama-host][data-host-id="${p.hostId}"]`)?.classList.remove("is-dragging"),p.captureTarget?.hasPointerCapture?.(p.pointerId))try{p.captureTarget.releasePointerCapture(p.pointerId)}catch{}document.documentElement.classList.remove("processing-ollama-dragging"),window.removeEventListener("pointermove",q),window.removeEventListener("pointerup",T),window.removeEventListener("pointercancel",N),_e=null,se=0},q=p=>{let v=_e;if(!v||p.pointerId!==v.pointerId)return;if(!v.dragging){if(Math.hypot(p.clientX-v.startX,p.clientY-v.startY)<5)return;v.dragging=!0,se=v.hostId,je=!1,s.querySelector(`[data-ollama-host][data-host-id="${v.hostId}"]`)?.classList.add("is-dragging"),document.documentElement.classList.add("processing-ollama-dragging")}p.preventDefault();let M=64;p.clientY<M?window.scrollBy(0,-12):p.clientY>window.innerHeight-M&&window.scrollBy(0,12);let V=s.querySelector("[data-ollama-list]"),G=document.elementFromPoint(p.clientX,p.clientY)?.closest?.("[data-ollama-host]");if(!V||!G||!V.contains(G))return;let J=V.querySelector(`[data-ollama-host][data-host-id="${v.hostId}"]`);if(!J||J===G)return;let be=G.getBoundingClientRect(),ee=p.clientY>be.top+be.height/2;V.insertBefore(J,ee?G.nextSibling:G),je=!0},T=p=>{let v=_e;if(!v||p.pointerId!==v.pointerId)return;let M=v.dragging,V=je,G=s.querySelector("[data-ollama-list]"),J=M&&G?[...G.querySelectorAll("[data-ollama-host]")].map(be=>Number(be.dataset.hostId)):[];Ot(),M&&V&&J.length&&Ze(J)},N=()=>{let p=!!_e?.dragging;Ot(),p&&Ft()},B=p=>{if(p.button!==0||p.pointerType==="mouse"&&p.buttons!==1||oe||_e)return;let v=p.target.closest("[data-ollama-host]");if(!v||!s.contains(v)||p.target.closest("button")||p.pointerType==="touch"&&!p.target.closest(".processing-ollama-handle"))return;let M=Number(v.dataset.hostId)||0;if(M){p.preventDefault(),se=M,_e={hostId:M,pointerId:p.pointerId,startX:p.clientX,startY:p.clientY,dragging:!1,captureTarget:v};try{v.setPointerCapture(p.pointerId)}catch{}window.addEventListener("pointermove",q,{passive:!1}),window.addEventListener("pointerup",T),window.addEventListener("pointercancel",N)}},Z=async({quiet:p=!1,payload:v=null}={})=>{if(!y){y=!0,!h&&d==="judgment_download"&&Re();try{h=v||await K.judgmentDownloadStatus(),_=null}catch(M){_=M.message||"\u8B80\u53D6\u6708\u4EFD\u72C0\u614B\u5931\u6557\u3002",p||P(_,"danger",7e3)}finally{y=!1,d==="judgment_download"&&Re()}}},ae=async({quiet:p=!0,force:v=!1,payload:M=null}={})=>{if(!A&&!(!v&&S&&Date.now()-re<3e4)){A=!0;try{S=M||await K.systemUsage(),I=null,re=Date.now()}catch(V){I=V.message||"\u7121\u6CD5\u53D6\u5F97 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002",p||P(I,"danger",7e3)}finally{A=!1,d==="index_versions"&&kt()}}},pe=async({quiet:p=!0,force:v=!1,payload:M=null}={})=>{if(!we&&!(!v&&Y&&Date.now()-F<6e4)){we=!0;try{Y=M||await K.checkCourts(),ge=null,F=Date.now()}catch(V){ge=V.message||"\u7121\u6CD5\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u3002",p||P(ge,"danger",7e3)}finally{we=!1,d==="normalize_courts"&&kt()}}},Te=async({quiet:p=!0,force:v=!1,button:M=null,payload:V=null}={})=>{if(!x&&!(!v&&j&&Date.now()-W<6e4)){x=!0,M&&Me(M,!0,"\u6AA2\u67E5\u4E2D\u2026");try{if(j=V||await K.checkLawVersions(),R=null,W=Date.now(),!p){let G=j.totals||{},J=Number(G.needs_backfill_versions)||0,be=Number(G.backfillable_versions)||0,ee=Number(G.blocked_versions)||0;J>0?P(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u9700\u8981\u5EFA\u7ACB ${J} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF08\u53EF\u5EFA\u7ACB ${be}\u3001\u7F3A\u539F\u59CB\u6A94 ${ee}\uFF09\u3002`,ee>0?"danger":"warn",7e3):P(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D ${Number(G.versions)||0} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`,"ok",5e3)}}catch(G){R=G.message||"\u7121\u6CD5\u6AA2\u67E5\u689D\u6587\u6B77\u53F2\u72C0\u614B\u3002",p||P(R,"danger",7e3)}finally{x=!1,M&&Me(M,!1)}}},Be=p=>Array.from(s.querySelectorAll("[data-stage-key]")).find(v=>v.dataset.stageKey===p)||null,Ne=p=>{if(!p)return;fe.add(p);let v=Array.from(s.querySelectorAll(".processing-wf-stage[data-processing-stage]")).find(M=>M.dataset.processingStage===p);v&&(v.open=!0,v.scrollIntoView({behavior:"smooth",block:"center"}))},Oe=()=>{he&&(he="",o.hidden=!0,s.querySelectorAll("[data-stage-key]").forEach(p=>{p.classList.remove("is-stage-hovered")}))},et=p=>{let v=p.dataset.stageKey||"";if(!v)return;he=v,s.querySelectorAll("[data-stage-key]").forEach(Ge=>{Ge.classList.toggle("is-stage-hovered",Ge.dataset.stageKey===v)});let M=p.dataset.stageStatusKey||"idle",V=p.dataset.stageStatus||fs(M).label,G=p.dataset.stageColor||"var(--accent)",J=Number(p.dataset.stageUpdate)||0,be=Number(p.dataset.stagePending)||0,ee=p.dataset.stageContributionLabel||"\u6574\u9AD4\u5360\u6BD4";o.innerHTML=`<div class="processing-stage-tooltip-head">
      <span class="processing-stage-tooltip-swatch" style="background:${r(G)}"></span>
      <strong>${r(p.dataset.stageLabel||v)}</strong>
      ${At(M,V)}
    </div>
    <div class="processing-stage-tooltip-meta">
      <span>\u968E\u6BB5\u9032\u5EA6 <strong>${r(p.dataset.stagePercent||"\u2014")}</strong></span>
      <span>${r(ee)} <strong>${r(p.dataset.stageContribution||"\u2014")}</strong></span>
      <span class="mono">${r(p.dataset.stageDuration||"\u2014")}</span>
    </div>
    <div class="processing-stage-tooltip-counts">${r(p.dataset.stageCounts||"\u2014")}</div>
    ${J||be?`<div class="processing-stage-tooltip-badges">
            ${J?`<span class="processing-wf-count is-update">${g("refresh",11)}<strong>${c(J)}</strong><span>\u53EF\u66F4\u65B0</span></span>`:""}
            ${be?`<span class="processing-wf-count is-pending">${g("clock",11)}<strong>${c(be)}</strong><span>\u5F85\u57F7\u884C</span></span>`:""}
          </div>`:""}
    ${p.dataset.stageMessage?`<div class="processing-stage-tooltip-message">${r(p.dataset.stageMessage)}</div>`:""}`,o.hidden=!1;let le=Math.min(300,Math.max(220,window.innerWidth-24));o.style.width=`${le}px`;let me=p.getBoundingClientRect(),Se=Math.min(window.innerWidth-le-12,Math.max(12,me.left)),Ee=me.top-o.offsetHeight-10,qe=Ee>=12?Ee:Math.min(window.innerHeight-o.offsetHeight-12,me.bottom+10);o.style.left=`${Se}px`,o.style.top=`${Math.max(12,qe)}px`},nt=p=>{if(p.target.closest(".is-failure-tip")){Oe();return}if(p.target.closest(".processing-wf-rail"))return;let v=p.target.closest("[data-stage-key]");!v||!s.contains(v)||v.contains(p.relatedTarget)||et(v)},Tt=p=>{let v=p.target.closest("[data-stage-key]");if(!v||!s.contains(v)||v.contains(p.relatedTarget))return;let M=p.relatedTarget?.closest?.("[data-stage-key]");M&&M.dataset.stageKey===v.dataset.stageKey||Oe()},Xt=p=>Array.isArray(p?.active_runs)&&p.active_runs.length||(p?.workflows||[]).some(v=>v.active_run)?!0:String(p?.update?.status||"")==="running",Fs=()=>{s.querySelectorAll('[data-processing-action="stop"]').forEach(p=>Me(p,!0,"\u505C\u6B62\u4E2D\u2026")),n&&Me(n,!0,"\u505C\u6B62\u4E2D\u2026")},pa=()=>{s.querySelectorAll('[data-processing-action="stop"]').forEach(p=>Me(p,!1)),n&&Me(n,!1)},bs=p=>{let v=p.capabilities||{};i&&!Xt(p)&&(i=!1,pa()),!f&&n&&(n.hidden=!v.can_stop_update),i&&Fs()},kt=()=>{if(!u)return;let p=Ka(u,d,X(),fe);p!==$&&(as(s,p),$=p),Re(),Ie(),Ye(),Ke(u)},As=(p,{silent:v=!1}={})=>{if(l||!p)return;let M=Date.parse(p.generated_at||""),V=Date.parse(u?.generated_at||"");if(Number.isFinite(M)&&Number.isFinite(V)&&M<V)return;if(Dt){let le=(p.workflows||[]).find(Se=>Se.id===Dt),me=le?.active_run?.id||le?.last_run?.id||"";(le?.active_run||me&&me!==_s)&&(Dt="",_s="")}u=p,window.dispatchEvent(new CustomEvent("judgment:processing-pending",{detail:{count:Number(p.capabilities?.unprocessed_archives)||0,index_pending:Number(p.capabilities?.index_pending_months)||0}}));let G=new Map;for(let le of p.sections||[])for(let me of le.stages||[])G.set(`${le.key}-${me.key}`,me);for(let[le,me]of It){if(me.kind!=="upgrade")continue;let Se=G.get(le);if(Se){if(Se.phase==="failed"||Se.phase==="running"&&Se.percent!==null){It.delete(le);continue}if(Se.phase==="completed"){let Ee=Date.parse(Se.last_run?.started_at||"");Number.isFinite(Ee)&&Ee>=Number(me.startedAt||0)-1e3&&It.delete(le)}}}let J=Wa(p,d);J!==b&&(as(a,J),b=J);let be=Ka(p,d,X(),fe);if(be!==$&&(as(s,be),$=be),Re(),Ie(),he){let le=Be(he);le?et(le):Oe()}let ee=s.querySelector("[data-processing-updated-at]");if(ee){let le=ve(p.generated_at);ee.textContent!==le&&(ee.textContent=le)}if(bs(p),Ye(),Ke(p),!te&&!z&&ye({quiet:!0}),E.length){let le=E.splice(0);for(let me of le)ma(me)}},Os=p=>{if(k=p,typeof requestAnimationFrame>"u"){let v=k;k=null,v&&qs(v);return}O||(O=requestAnimationFrame(()=>{O=0;let v=k;k=null,v&&qs(v)}))},ma=p=>{if(!p)return;if(!u){E.push(p),E.length>100&&E.shift();return}let v=String(p.run_id||""),M=Number(p.seq)||0;if(v&&v===Ue&&M>0&&M<=C)return;v&&v!==Ue&&(Ue=v,C=0),M>0&&(C=M);let V=String(p.workflow_id||"judgment_import"),G=String(p.month||"").replace(/\D/g,"").slice(0,6),J=(u.workflows||[]).find(Ee=>Ee.id===V);if(!J)return;J.progress||(J.progress={stages:[]}),Array.isArray(J.progress.stages)||(J.progress.stages=[]);let be=String(p.stage||""),ee=be?J.progress.stages.find(Ee=>String(Ee.key)===be):null,le=String(J.progress.run_id||"")===String(p.run_id||"");if(ee&&p.type==="stage_progress"){let Ee=Number(p.current),qe=Number(ee.current);le&&p.status==="running"&&Number.isFinite(Ee)&&Number.isFinite(qe)&&Ee<qe||(p.status&&(ee.status=String(p.status)),p.current!==void 0&&(ee.current=Number(p.current)||0),p.total!==void 0&&(ee.total=Number(p.total)||0),p.percent!==void 0&&(ee.percent=Number(p.percent)||0),p.message&&(ee.message=String(p.message)))}if(ee&&p.extra&&typeof p.extra=="object")for(let Ee of["financial_processed","financial_matched","financial_percent"])p.extra[Ee]!==void 0&&(ee[Ee]=Number(p.extra[Ee])||0);if(p.type==="stage_progress"&&p.overall_percent!==void 0){let Ee=Number(p.overall_percent)||0,qe=Number(J.progress.overall_percent)||0;J.progress.overall_percent=le?Math.max(qe,Ee):Ee}p.type!=="run_finished"&&(J.progress.run_status="running"),(p.type==="archive_started"||p.type==="stage_progress")&&!J.active_run&&p.run_id&&(J.active_run={id:p.run_id,status:"running",started_at:p.timestamp,message:p.message||""}),p.type==="run_finished"&&(J.active_run=null,J.progress.run_status=String(p.status||"success"),J.can_run=!0);let me=[];G&&p.month_stages&&me.push({month:G,import_stages:p.month_stages,import_overall:p.month_overall||""});let Se=null;if(p.type==="archive_started"&&G){let Ee=Date.parse(p.timestamp||"");Se={active_month:G,active_archive:p.archive,active_phase:p.stage||"filter",processing_month:G,processing_archive:p.archive,run_id:p.run_id,run_status:"running",state_mtime_ns:Number.isFinite(Ee)?Ee*1e6:Date.now()*1e6}}else p.type==="run_finished"&&(Se={...u.active_import||{},run_status:String(p.status||"success")});Os({live:!0,generated_at:p.timestamp,workflows:[{id:V,active_run:J.active_run,last_run:J.last_run,progress:J.progress,can_run:J.can_run}],import_timeline_months:me,active_import:Se})},qs=p=>{if(l||!p||!u)return;let v=new Map((p.workflows||[]).map(ee=>[ee.id,ee]));if(Dt){let ee=v.get(Dt),le=ee?.active_run?.id||ee?.last_run?.id||"";(ee?.active_run||le&&le!==_s)&&(Dt="",_s="")}for(let ee of u.workflows||[]){let le=v.get(ee.id);if(le){if("active_run"in le&&(ee.active_run=le.active_run),"last_run"in le&&(ee.last_run=le.last_run),Array.isArray(le.recent_runs)&&(ee.recent_runs=le.recent_runs),"index_runtime"in le){let me=le.index_runtime;me&&!me.active_coverage&&ee.index_runtime?.active_coverage&&(me.active_coverage=ee.index_runtime.active_coverage),me&&!me.active_archive_coverage&&ee.index_runtime?.active_archive_coverage&&(me.active_archive_coverage=ee.index_runtime.active_archive_coverage),ee.index_runtime=me}if(le.progress){let me=le.progress,Se=ee.progress;if(ee.id==="judgment_import"&&Se?.run_id&&Se.run_id===me.run_id){let Ee=new Map((Se.stages||[]).map(qe=>[String(qe.key),qe]));for(let qe of me.stages||[]){let Ge=Ee.get(String(qe.key));Ge&&qe.status==="running"&&Number(qe.current)<Number(Ge.current)&&(qe.current=Ge.current,qe.total=Ge.total,qe.percent=Ge.percent,qe.message=Ge.message)}me.overall_percent=Math.max(Number(Se.overall_percent)||0,Number(me.overall_percent)||0)}ee.progress=me}typeof le.can_run=="boolean"&&(ee.can_run=le.can_run)}}let M=ee=>{if(!ee||!Array.isArray(p.import_timeline_months))return;let le=new Map((ee.months||[]).map(Se=>[String(Se.month),Se]));for(let Se of p.import_timeline_months){let Ee=le.get(String(Se.month));Ee&&(Ee.import_stages={...Ee.import_stages||{},...Se.import_stages||{}},Se.import_stage_progress&&(Ee.import_stage_progress={...Ee.import_stage_progress||{},...Se.import_stage_progress||{}}),Se.import_overall&&(Ee.import_overall=Se.import_overall))}let me={complete:0,incomplete:0,processing:0,empty:0};for(let Se of ee.months||[]){let Ee=String(Se.import_overall||"empty");me[Ee]=Number(me[Ee]||0)+1}ee.stage_summary=me};(ee=>{let le=(ee.workflows||[]).find(at=>at.id==="index_versions"),me=le?.index_runtime;if(!me||!Array.isArray(me.months))return;let Se=(ee.file_timelines||[]).find(at=>at.key==="judgment");if(!Se||!Array.isArray(Se.months))return;let Ee=(le.progress?.stages||[]).find(at=>at.key==="validate"),qe=["success","no_change"].includes(String(me.run_status||""))||String(me.run_status||"")!=="running"&&/alias\s*已切換/.test(String(Ee?.message||"")),Ge=String(me.current?.month||""),Ve=new Map(Se.months.map(at=>[String(at.month),at]));for(let at of me.months){let gt=Ve.get(String(at.month||""));if(!gt)continue;let is=gt.stages||(gt.stages={}),Us=String(at.status||"");Us==="running"||String(at.month)===Ge?(is.qdrant="processing",gt.overall="processing"):Us==="success"&&is.qdrant!=="complete"&&(is.qdrant=qe?"complete":"incomplete",gt.overall=qe?"complete":"incomplete")}let ot={complete:0,incomplete:0,processing:0,empty:0,update:0};for(let at of Se.months){let gt=String(at.overall||"empty");ot[gt]=Number(ot[gt]||0)+1,at.has_update&&(ot.update+=1)}Se.summary=ot})(u),M(u.import_timeline);for(let ee of u.workflows||[])ee.id==="judgment_import"&&M(ee.import_timeline);p.active_import&&(u.active_import=p.active_import),p.mode&&(u.mode=p.mode),p.generated_at&&(u.generated_at=p.generated_at);let G=Wa(u,d);G!==b&&(as(a,G),b=G);let J=Ka(u,d,X(),fe);J!==$&&(as(s,J),$=J),Re(),Ie(),Ye(),Ke(u),bs(u);let be=s.querySelector("[data-processing-updated-at]");if(be&&p.generated_at){let ee=ve(p.generated_at);be.textContent!==ee&&(be.textContent=ee)}},qt=async({silent:p=!1}={})=>{if(!(l||m)){m=!0;try{let v=await K.processing();As(v,{silent:p})}catch(v){if(l)return;let M=gu(v.message,u);M!==$&&(as(s,M),$=M),p||P(v.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{m=!1}}},Hs=async(p,v="")=>{if(f)return;f=!0,Me(p,!0,"\u6AA2\u67E5\u4E2D\u2026");let M=So[v]||"",V=String(p.dataset.sourceTypes||"").split(",").map(be=>be.trim()).filter(Boolean),G=V.length?V:M?[M]:[],J=p.dataset.stageId||"";J&&(It.set(J,{kind:"check",phase:"updating",startedAt:Date.now()}),kt());try{let be=await K.checkUpdates(G);if(be&&be.checking)J&&(It.delete(J),kt()),P("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u8ACB\u7A0D\u5F8C\u91CD\u65B0\u6574\u7406\u3002","info",6e3);else if(G.length===1){let ee=(be.sources||{})[G[0]]||{},le=xo[v]||(G[0]==="judgment"?"\u5224\u6C7A":G[0]==="law"?"\u6CD5\u898F":G[0]==="order"?"\u547D\u4EE4":"\u8CC7\u6599");ee.status==="error"?P(`${le}\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF1A${ee.message||"\u7121\u6CD5\u53D6\u5F97\u7DDA\u4E0A\u7248\u672C"}`,"danger",7e3):P(ee.update_available?`${le}\u7DDA\u4E0A\u5DF2\u6709\u66F4\u65B0\u7248\u672C\u3002`:`${le}\u7DDA\u4E0A\u5DF2\u662F\u6700\u65B0\u7248\u672C\u3002`,ee.update_available?"warn":"ok",6e3)}else if(G.length>1){let ee=be.sources||{},le=G.filter(Se=>ee[Se]?.update_available),me=G.filter(Se=>ee[Se]?.status==="error");me.length?P(`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF0C\u4F46\u6709 ${me.length} \u9805\u6AA2\u67E5\u5931\u6557\u3002`,"danger",7e3):P(le.length?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${le.length} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",le.length?"warn":"ok",6e3)}else{let ee=Number(be.update_count)||0;P(ee>0?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${ee} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",ee>0?"warn":"ok",6e3)}J&&(It.set(J,{kind:"check",phase:"updated",startedAt:Date.now()}),kt()),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await qt({silent:!0})}catch(be){J&&(It.delete(J),kt()),P(be.message||"\u66F4\u65B0\u6AA2\u67E5\u5931\u6557\u3002","danger",7e3)}finally{f=!1,Me(p,!1),u&&bs(u)}},rn=async p=>{let v=So[p]||"";if(!v)return!0;let M=null;try{M=await K.checkUpdates([v])}catch(G){return P(`\u7121\u6CD5\u5B8C\u6210\u7248\u672C\u6AA2\u67E5\uFF08${G.message||"\u7DB2\u8DEF\u932F\u8AA4"}\uFF09\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002`,"warn",7e3),!0}if(!M||M.checking)return M&&M.checking&&P("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","info",6e3),!0;let V=(M.sources||{})[v];if(!V)return!0;if(window.dispatchEvent(new CustomEvent("judgment:updates-changed")),V.status==="up_to_date"&&!V.update_available){let G=xo[p]||"\u8CC7\u6599",J=V.checked_at?`\uFF08${ve(V.checked_at)} \u6AA2\u67E5\uFF09`:"",be=Yd[p]||"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u55CE\uFF1F";return window.confirm(`${G}\u7DDA\u4E0A\u6AA2\u67E5\u70BA\u6700\u65B0\u7248\u672C${J}\u3002

${be}`)}return V.status==="error"&&P("\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","warn",6e3),!0},ga=async(p,v)=>{if(f)return;f=!0;let M=(u?.workflows||[]).find(J=>J.id===v);_s=M?.active_run?.id||M?.last_run?.id||"",Dt=v,Me(p,!0,"\u57F7\u884C\u4E2D"),kt();let V=p.dataset.stageId||"",G=!1;try{if(!await rn(v))return;V&&(It.set(V,{kind:"upgrade",phase:"upgrading",startedAt:Date.now()}),kt());let be;try{be=await K.startProcessingWorkflow(v)}catch(ee){throw V&&(It.delete(V),kt()),ee}G=!0,P(`\u5DF2\u555F\u52D5\u300C${M?.label||v}\u300D\u6D41\u7A0B\u3002`,"ok",6e3),be&&be.run_id&&console.info("processing workflow started",be),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),qt({silent:!0}),window.setTimeout(()=>{Dt===v&&(Dt="",_s="",qt({silent:!0}))},15e3)}catch(J){P(J.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{f=!1,(!G||Dt!==v)&&(Dt="",_s="",u?(bs(u),$="",kt()):Me(p,!1))}},zs=async p=>{if(!(f||i)){f=!0,i=!0,Me(p,!0,"\u505C\u6B62\u4E2D\u2026");try{let v=await K.stopProcessingUpdate();for(let[M,V]of It)V.kind==="upgrade"&&It.delete(M);kt(),qt({silent:!0}),P(v.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3)}catch(v){i=!1,Me(p,!1),P(v.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{f=!1,i?Fs():u&&bs(u)}}},hs=p=>{let v=p.target.closest("[data-processing-action]");if(!v||v.disabled)return;v.closest(".processing-wf-rail")&&(p.preventDefault(),p.stopPropagation());let M=v.dataset.processingAction;if(M==="refresh")qt({silent:!1});else if(M==="open-stage")Ne(v.dataset.stageId||"");else if(M==="refresh-judgment-months")Z({quiet:!1});else if(M==="refresh-index-storage")ae({quiet:!1,force:!0});else if(M==="refresh-court-check")pe({quiet:!1,force:!0});else if(M==="refresh-law-version-check")Te({quiet:!1,force:!0,button:v});else if(M==="refresh-ollama")ye({quiet:!1,button:v});else if(M==="refresh-embedding-models")ye({quiet:!1,button:v});else if(M==="refresh-index-hosts")Je({button:v,force:!0});else if(M==="select-embedding-model"){let V=v.dataset.hostId||"",G=v.dataset.model||"";ne(`${V}|${G}`)}else if(M==="move-ollama-host"){let V=te?.hosts||[],G=V.findIndex(le=>Number(le.id)===Number(v.dataset.hostId)),J=v.dataset.direction,be=J==="up"?G-1:J==="down"?G+1:-1;if(G<0||be<0||be>=V.length)return;let ee=V.map(le=>Number(le.id));[ee[G],ee[be]]=[ee[be],ee[G]],Ze(ee)}else if(M==="check-updates")Hs(v,v.dataset.workflowId||"");else if(M==="run-workflow"){let V=v.dataset.workflowId||"";ga(v,V)}else M==="stop"&&zs(v)},Nt=(p,{scroll:v=!1}={})=>{if(d=p||"overview",u){let M=Wa(u,d);as(a,M),b=M;let V=Ka(u,d,X(),fe);if(as(s,V),$=V,Re(),Ie(),Ye(),Ke(u),he){let G=Be(he);G?et(G):Oe()}v&&s.scrollIntoView({behavior:"smooth",block:"start"})}dr.has(d)&&ye({quiet:!0}),d==="judgment_download"&&Z({quiet:!0}),d==="index_versions"&&(ae({quiet:!0}),(u?.workflows||[]).find(V=>V.id==="index_versions")?.index_runtime?.run_status!=="running"&&Je({quiet:!0})),d==="normalize_courts"&&pe({quiet:!0}),d==="backfill_law_articles"&&Te({quiet:!0})},w=p=>{let v=p.target.closest("[data-processing-workflow]");v&&Nt(v.dataset.processingWorkflow||"overview")},U=p=>{let v=p.target.closest("[data-timeline-workflow]");v&&(p.preventDefault(),Nt(v.dataset.timelineWorkflow||"",{scroll:!0}))},Q=p=>{let v=p.target.closest?.(".index-wf-stage[data-index-stage]");if(v&&s.contains(v)){let J=v.dataset.indexStage||"";J&&(v.open?ur.add(J):ur.delete(J));return}let M=p.target.closest?.(".workflow-wf-stage[data-workflow-wf-stage]");if(M&&s.contains(M)){let J=M.dataset.workflowWfStage||"";J&&(M.open?pr.add(J):pr.delete(J));return}let V=p.target.closest?.(".processing-wf-stage[data-processing-stage]");if(!V||!s.contains(V))return;let G=V.dataset.processingStage||"";G&&(V.open?fe.add(G):fe.delete(G))};return t.addEventListener("click",hs),a.addEventListener("click",w),s.addEventListener("click",U),s.addEventListener("pointerover",nt),s.addEventListener("pointerout",Tt),s.addEventListener("pointerdown",B),s.addEventListener("toggle",Q,!0),window.addEventListener("scroll",Oe,{capture:!0,passive:!0}),mt(),typeof EventSource>"u"&&await qt({silent:!1}),()=>{l=!0,Bt(),t.removeEventListener("click",hs),a.removeEventListener("click",w),s.removeEventListener("click",U),Ot(),s.removeEventListener("pointerover",nt),s.removeEventListener("pointerout",Tt),s.removeEventListener("pointerdown",B),s.removeEventListener("toggle",Q,!0),window.removeEventListener("scroll",Oe,{capture:!0})}}var xr={};ls(xr,{render:()=>jp});var wr={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u522A\u9664\uFF0F\u9000\u5F79",badge:"badge-neutral"}},Yt={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},Ds={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},Bo={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function da(e){let t=wr[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${r(t.label)}</span>`}function _r(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function Yu(e){return _r(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",source_type:a||""}})}function Xu(e){return _r(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",article_no:a||""}})}function Zu(e){return _r(e).map(t=>({jid:t.trim()}))}function ep(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function tp(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function sp(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function ap(e){return(e?.tags||[]).join(", ")}function ca(e){return`<div class="qb-empty">${g("info",18)}<span>${r(e)}</span></div>`}function kr(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),n=[...t.map(i=>`<span class="chip">${r(i)}</span>`),...s.map(i=>`<span class="chip">${r(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${r(i)}</span>`)];return n.length?`<div class="chips qb-labels">${n.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function Sr(){return`<details class="qb-import">
    <summary>${g("upload",14)}JSON \u6279\u6B21\u532F\u5165</summary>
    <p class="qb-muted">\u683C\u5F0F\uFF1A<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>\u3002\u76F8\u540C\u984C\u76EE fingerprint \u9810\u8A2D\u66F4\u65B0\u3002</p>
    <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
    <div class="qb-actions">
      <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${g("upload",13)}<span>\u532F\u5165 JSON</span></button>
    </div>
  </details>`}function np(e){let t=e?.item||{},s=Array.isArray(e?.warnings)?e.warnings:[],a=Array.isArray(t.tags)?t.tags:[];return`<section class="report-card qb-card qb-ai-result">
    <div class="side-card-head">
      <span class="side-card-title">${g("sparkles",14)}llama-server \u5DF2\u5EFA\u7ACB\u984C\u76EE #${t.id}</span>
      ${da(t.status)}
    </div>
    <div class="qb-ai-answer">
      <strong>${r(t.question||"")}</strong>
      <div class="qb-ai-meta">
        ${r(Yt[t.question_type]||t.question_type||"")}
        \xB7 ${r(Ds[t.difficulty]||t.difficulty||"")}
        \xB7 ${r(e?.model||"\u672C\u6A5F llama-server")}
      </div>
      ${kr(t)}
      ${t.reference_answer?`<div class="qb-reference"><span class="summary-label">llama-server \u53C3\u8003\u7B54\u6848</span><p>${r(t.reference_answer)}</p></div>`:""}
      ${a.length?`<div class="chips">${a.map(n=>`<span class="chip">${r(n)}</span>`).join("")}</div>`:""}
      ${s.length?`<div class="qb-ai-warnings"><strong>\u9700\u8981\u6CE8\u610F</strong><ul>${s.map(n=>`<li>${r(n)}</li>`).join("")}</ul></div>`:""}
      <div class="qb-actions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="review-ai-item">${g("shield",13)}<span>\u524D\u5F80\u9A57\u6536</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="reset-ai">${g("plus",13)}<span>\u518D\u65B0\u589E\u4E00\u984C</span></button>
      </div>
    </div>
    ${Sr()}
  </section>`}function rp(e){return e.aiResult?np(e.aiResult):`<section class="report-card qb-card">
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
    ${Sr()}
  </section>`}function ip(e){return`<section class="report-card qb-card">
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
          <select class="select" name="question_type">${Object.entries(Yt).map(([t,s])=>`<option value="${t}" ${e?.question_type===t?"selected":""}>${s}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u96E3\u5EA6</span>
          <select class="select" name="difficulty">${Object.entries(Ds).map(([t,s])=>`<option value="${t}" ${e?.difficulty===t?"selected":""}>${s}</option>`).join("")}</select>
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
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${r(ep(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${r(tp(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${r(sp(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${r(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${r(ap(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
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
    ${Sr()}
  </section>`}function op(e,t){return e?ip(e):rp(t)}function lp(e){let t=e.status==="retired"||!!e.deleted_at;return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${r(e.question)}</strong>
        <span class="qb-meta">
          ${r(Yt[e.question_type]||e.question_type)}
          \xB7 ${r(Ds[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${da(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${kr(e)}
    <div class="qb-item-foot">
      <span>\u66F4\u65B0 ${r(ve(e.updated_at))}</span>
      ${e.reviewed_by?`<span>\u5BE9\u6838 ${r(e.reviewed_by)}</span>`:""}
      ${e.review_comment?`<span class="qb-comment">${r(e.review_comment)}</span>`:""}
      <div class="qb-actions">
        ${t?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="restore" data-id="${e.id}">${g("refresh",13)}<span>\u5FA9\u539F\u984C\u76EE</span></button>`:`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${g("edit",13)}<span>\u7DE8\u8F2F</span></button>
               ${["pending_review","changes_requested"].includes(e.status)?"":`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="submit-review" data-id="${e.id}">${g("upload",13)}<span>${e.status==="draft"?"\u9001\u5BE9":"\u91CD\u65B0\u9001\u5BE9"}</span></button>`}
               <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${e.id}">${g("shield",13)}<span>\u9A57\u6536</span></button>
               <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${g("trash",13)}<span>\u522A\u9664</span></button>`}
      </div>
    </div>
  </article>`}function cp(e){return`<section class="report-card qb-card">
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
        ${Object.entries(wr).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(Yt).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(Ds).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
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
      ${e.items.length?e.items.map(t=>lp(t)).join(""):ca("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${c(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}var Oo=[["queue","\u5F85\u5BE9\uFF0F\u9000\u56DE"],["accepted","\u5DF2\u6838\u51C6"],["rejected","\u5DF2\u62D2\u7D55"],["draft","\u8349\u7A3F"]];function dp(e){let t=e.stats||{};return{queue:Number(t.pending_review||0)+Number(t.changes_requested||0),accepted:Number(t.accepted||0),rejected:Number(t.rejected||0),draft:Number(t.draft||0)}}function up(e,t){let s=e.reviewFilter||"queue",a={queue:{title:"\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u6216\u9000\u56DE\u4FEE\u6539\u7684\u984C\u76EE\u3002",text:t.accepted?`\u5DF2\u6709 ${c(t.accepted)} \u984C\u6838\u51C6\u3002\u65B0\u984C\u76EE\u5EFA\u7ACB\u5F8C\u6703\u81EA\u52D5\u9001\u5BE9\uFF0C\u4E5F\u53EF\u4EE5\u5207\u63DB\u5230\u300C\u5DF2\u6838\u51C6\u300D\u91CD\u65B0\u9A57\u6536\u65E2\u6709\u984C\u76EE\u3002`:"\u5EFA\u7ACB\u984C\u76EE\u5F8C\u6703\u9810\u8A2D\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\uFF1B\u82E5\u53EA\u60F3\u5148\u4FDD\u5B58\uFF0C\u5EFA\u7ACB\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5373\u53EF\u5B58\u6210\u8349\u7A3F\u3002"},accepted:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u6838\u51C6\u984C\u76EE\u3002",text:"\u984C\u76EE\u901A\u904E\u4EBA\u5DE5\u9A57\u6536\u5F8C\u6703\u5217\u5728\u9019\u88E1\uFF1B\u4E5F\u53EF\u4EE5\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u9001\u51FA\u9A57\u6536\u3002"},rejected:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u62D2\u7D55\u984C\u76EE\u3002",text:"\u88AB\u62D2\u7D55\u7684\u984C\u76EE\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u4E2D\uFF0C\u53EF\u4FEE\u6539\u5F8C\u91CD\u65B0\u9001\u5BE9\u3002"},draft:{title:"\u76EE\u524D\u6C92\u6709\u8349\u7A3F\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u984C\u76EE\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5C31\u6703\u5B58\u6210\u8349\u7A3F\uFF0C\u4E4B\u5F8C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002"}}[s]||{title:"\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u65B0\u984C\u76EE\u5F8C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"},n=[s!=="draft"?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="new">${g("plus",13)}<span>\u65B0\u589E\u984C\u76EE</span></button>`:"",s==="queue"&&t.accepted?`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="review-filter" data-filter="accepted">${g("shield",13)}<span>\u67E5\u770B\u5DF2\u6838\u51C6 ${c(t.accepted)}</span></button>`:"",`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="go-manage">${g("database",13)}<span>\u524D\u5F80\u984C\u5EAB\u7BA1\u7406</span></button>`].filter(Boolean).join("");return`<div class="qb-empty qb-empty-block">
    <span class="qb-empty-icon">${g("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>${r(a.title)}</strong>
      <p>${r(a.text)}</p>
      <div class="qb-actions">${n}</div>
    </div>
  </div>`}function pp(e){let t=Oo.find(([s])=>s===e);return t?t[1]:"\u5F85\u5BE9\uFF0F\u9000\u56DE"}function mp(e,t){return`<button class="qb-review-item${t?" is-active":""}" type="button" data-qb-action="select-review-item" data-id="${e.id}" aria-pressed="${t?"true":"false"}">
    <span class="qb-review-item-top">
      <span class="qb-id">#${e.id}</span>
      <span class="qb-review-item-meta">
        ${r(Yt[e.question_type]||e.question_type)}
        \xB7 ${r(Ds[e.difficulty]||e.difficulty)}
        \xB7 v${e.version}
        ${e.benchmark_ready?" \xB7 Benchmark ready":""}
        ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
      </span>
      ${da(e.status)}
    </span>
    <strong>${r(e.question)}</strong>
  </button>`}function gp(e){return`<article class="qb-review-pane-card">
    <div class="qb-review-pane-head">
      <div class="qb-review-pane-title">
        <span class="qb-review-item-meta">#${e.id} \xB7 v${e.version} \xB7 ${r(Yt[e.question_type]||e.question_type)} \xB7 ${r(Ds[e.difficulty]||e.difficulty)}</span>
        <strong>${r(e.question)}</strong>
      </div>
      <div class="qb-review-pane-side">
        ${da(e.status)}
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${g("edit",13)}<span>\u7DE8\u8F2F</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${g("trash",13)}<span>\u522A\u9664</span></button>
        </div>
      </div>
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${kr(e)}
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
    ${e.reviews?.length?`<div class="qb-review-history"><span class="summary-label">\u5BE9\u6838\u7D00\u9304</span>${e.reviews.map(t=>`<div class="qb-review-row"><span>${r(t.reviewer||"\u533F\u540D")}</span>${da(t.decision==="approved"?"accepted":t.decision)}<span>${r(ve(t.created_at))}</span><p>${r(t.comment||"\u2014")}</p></div>`).join("")}</div>`:""}
  </article>`}function fp(){return`<div class="qb-empty qb-empty-block qb-review-placeholder">
    <span class="qb-empty-icon">${g("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>\u5F9E\u5DE6\u5074\u9078\u64C7\u984C\u76EE</strong>
      <p>\u9EDE\u9078\u984C\u76EE\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u984C\u5E79\u3001\u9810\u671F\u6A19\u8A3B\u3001\u53C3\u8003\u7B54\u6848\u8207\u6838\u51C6\u9078\u9805\u3002</p>
    </div>
  </div>`}function bp(e){let t=e.reviewDetail,s=dp(e),a=e.reviewFilter||"queue",n=Oo.map(([l,m])=>`<button class="chip qb-review-tab${a===l?" is-active":""}" type="button" role="tab" aria-selected="${a===l?"true":"false"}" data-qb-action="review-filter" data-filter="${l}"><span>${m}</span><span class="qb-review-tab-count">${c(s[l]||0)}</span></button>`).join(""),i=e.reviewItems.length?e.reviewItems.map(l=>mp(l,Number(t?.id)===Number(l.id))).join(""):`<div class="qb-empty qb-empty-compact">${g("info",16)}<span>\u76EE\u524D\u6C92\u6709${r(pp(a))}\u984C\u76EE\u3002</span></div>`,o=t?gp(t):e.reviewItems.length?fp():up(e,s);return`<section class="report-card qb-card qb-review-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("shield",14)}\u984C\u5EAB\u4EBA\u5DE5\u9A57\u6536\u6279\u6CE8</span>
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
  </section>`}function la(e){if(e==null||e==="")return"";let t=Number(e);return Number.isFinite(t)?`${Math.round(t*100)}%`:""}function hp(e){if(!e||typeof e!="object")return"\u5F15\u7528";let t=String(e.jid||"").trim();if(t)return t;let s=String(e.law_name||"").trim(),a=String(e.article_no||"").trim(),n=`${s} ${a}`.trim();return n||String(e.title||e.text||"\u5F15\u7528").slice(0,80)}function vp(e){let t=e?.metrics||{},s=t.scores||{},a=[["\u6CD5\u898F\u53EC\u56DE",la(t.law_recall)],["\u689D\u6587\u53EC\u56DE",la(t.article_recall)],["\u898F\u5247\u5206",la(s.deterministic)],["Judge",la(s.judge)],["\u4EBA\u5DE5",la(s.human)]].filter(([,n])=>n);return a.length?`<div class="qb-bank-stats">${a.map(([n,i])=>`<span class="qb-bank-stat"><span>${r(n)}</span><strong>${r(i)}</strong></span>`).join("")}</div>`:""}function $p(e){let t=Array.isArray(e?.law_sources)?e.law_sources:[],s=Array.isArray(e?.citations)?e.citations:[],a=t.length?`<div class="qb-bank-sources">${t.map(i=>{let o=String(i.law_name||"\u672A\u547D\u540D\u6CD5\u898F"),l=(i.articles||[]).map(f=>String(f.article_no||"").trim()).filter(Boolean),m=`<strong>${r(o)}</strong>${l.length?`<small>${r(l.join("\u3001"))}</small>`:""}`;return i.law_url?`<a class="qb-bank-law" href="${r(i.law_url)}" target="_blank" rel="noreferrer">${m}</a>`:`<span class="qb-bank-law">${m}</span>`}).join("")}</div>`:"",n=s.length?`<div class="qb-bank-sources qb-bank-citations">${s.map(i=>`<span class="chip chip-mono">${r(hp(i))}</span>`).join("")}</div>`:"";return!a&&!n?"":`<div class="qb-bank-answer-block">
    <div class="qb-bank-section-label"><span>\u5F15\u7528\u4F86\u6E90</span><span>${c(t.length+s.length)} \u7B46</span></div>
    ${a}${n}
  </div>`}function Ho(e,t){if(!e)return`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${g("history",20)}</span>
      <strong>\u5C1A\u7121 RAG \u7B54\u6848</strong>
      <span>\u8DD1\u4E00\u6B21 Benchmark \u5F8C\uFF0C\u6700\u8FD1\u4E00\u6B21\u6210\u529F\u56DE\u7B54\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</span>
    </div>`;let s=Number(e.item_version||0),a=Number(t?.version||0),n=s&&a&&s!==a?`<span class="badge badge-warn">\u7B54\u6848 v${s} \xB7 \u984C\u76EE v${a}</span>`:"",i=e.answer_source==="llm"?"LLM \u751F\u6210":e.answer_source==="structured"?"\u6CD5\u898F\u8CC7\u6599\u5EAB":String(e.answer_source||"RAG");return`<div class="qb-bank-answer-meta">
      <span class="badge badge-ok"><span class="status-dot is-ok"></span>RAG \u5B8C\u6210</span>
      <span class="badge badge-neutral">${r(i)}</span>
      ${n}
      <span class="mono">${r(e.run_label||e.run_id||"")}</span>
      <span>${r(ve(e.finished_at))}</span>
      <span>${r(ue(e.duration_ms))}</span>
      ${e.llm_model?`<span class="mono">${r(e.llm_model)}</span>`:""}
    </div>
    <div class="qb-bank-answer-block">
      <div class="qb-bank-section-label"><span>\u56DE\u7B54</span><span>${c(String(e.answer||"").length)} \u5B57</span></div>
      <p class="qb-bank-answer-text">${r(String(e.answer||"").trim()||"\uFF08\u7A7A\u767D\u56DE\u7B54\uFF09")}</p>
    </div>
    ${$p(e)}
    ${vp(e)}`}function zo(e,t){let s=e.selectedSuiteId,a=t&&e.suiteAnswers?.[String(s)]?.[String(t.id)]||null;return t?`<div class="qb-bank-answer-head">
      <div class="qb-bank-answer-heading">
        <span class="qb-bank-answer-kicker">${g("sparkles",12)}RAG \u6700\u8FD1\u4E00\u6B21\u7B54\u6848</span>
        <strong class="qb-bank-answer-question">#${t.id} ${r(t.question)}</strong>
      </div>
      ${a?`<span class="qb-bank-answer-state">${r(Yt[t.question_type]||t.question_type)} \xB7 v${t.version}</span>`:""}
    </div>
    ${Ho(a,t)}`:`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${g("cube",20)}</span>
      <strong>\u9078\u64C7\u984C\u76EE</strong>
      <span>\u5F9E\u5DE6\u5074\u6E05\u55AE\u9078\u64C7\u4E00\u984C\uFF0C\u67E5\u770B\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`}function Uo(e){return`<span class="qb-bank-actions">
    <button class="qb-bank-icon" type="button" data-qb-action="edit" data-id="${e.id}" title="\u7DE8\u8F2F\u984C\u76EE" aria-label="\u7DE8\u8F2F\u984C\u76EE #${e.id}">${g("edit",13)}</button>
    <button class="qb-bank-icon is-danger" type="button" data-qb-action="delete" data-id="${e.id}" title="\u5F9E\u984C\u5EAB\u79FB\u9664" aria-label="\u5F9E\u984C\u5EAB\u79FB\u9664 #${e.id}">${g("trash",13)}</button>
  </span>`}function yp(e,t,{selected:s,hasAnswer:a}){return`<div class="qb-bank-row${s?" is-active":""}" data-id="${e.id}">
    <button class="qb-bank-select" type="button" data-qb-action="select-bank-item" data-id="${e.id}" aria-pressed="${s?"true":"false"}">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <span class="qb-bank-item-copy">
        <strong>${r(e.question)}</strong>
        <small>${r(Yt[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${a?"\u5DF2\u6709 RAG \u7B54\u6848":"\u5C1A\u7121 RAG \u7B54\u6848"}</small>
      </span>
    </button>
    ${Uo(e)}
  </div>`}function wp(e,t,s){return`<article class="qb-bank-full-item" data-id="${e.id}">
    <div class="qb-bank-full-head">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <div class="qb-bank-full-title">
        <strong>${r(e.question)}</strong>
        <small>${r(Yt[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${r(wr[e.status]?.label||e.status||"")}</small>
      </div>
      ${Uo(e)}
    </div>
    ${Ho(s,e)}
  </article>`}function Fo(e){let t=e.editingSuite,s=Array.isArray(e.suites)?e.suites:[],a=s.find(d=>Number(d.id)===Number(e.selectedSuiteId))||s[0]||null,n=Array.isArray(a?.items)?a.items:[],i=e.suiteAnswers?.[String(a?.id)]||{},o=n.find(d=>Number(d.id)===Number(e.selectedBankItemId))||null,l=!!e.suiteAnswersLoading,m=String(e.suiteAnswersError||""),f=!!e.suiteManageOpen||!s.length,u=e.bankTab==="full"?"full":"split",$=s.length?`<div class="qb-bank-tabs" role="tablist" aria-label="Benchmark \u984C\u5EAB\u6AA2\u8996">
        <button class="qb-bank-tab${u==="split"?" is-active":""}" type="button" role="tab" aria-selected="${u==="split"?"true":"false"}" data-qb-action="bank-tab" data-tab="split">${g("grid",13)}<span>Benchmark \u984C\u5EAB</span><span class="badge badge-neutral">${c(n.length)}</span></button>
        <button class="qb-bank-tab${u==="full"?" is-active":""}" type="button" role="tab" aria-selected="${u==="full"?"true":"false"}" data-qb-action="bank-tab" data-tab="full">${g("table",13)}<span>\u984C\u5EAB\u5168\u5217\u8868</span><span class="badge badge-neutral">${c(n.length)}</span></button>
      </div>`:"",b="";if(!s.length)b=`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${g("cube",20)}</span>
      <strong>\u5C1A\u672A\u5EFA\u7ACB Benchmark \u984C\u5EAB</strong>
      <span>\u5C55\u958B\u4E0B\u65B9 Suite \u8A2D\u5B9A\u4E26\u5EFA\u7ACB\u984C\u5EAB\u5F8C\uFF0C\u5C31\u80FD\u5728\u9019\u88E1\u700F\u89BD\u984C\u76EE\u8207\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`;else if(l)b='<div class="qb-bank-loading"><span class="spinner" aria-hidden="true"></span><span>\u8B80\u53D6\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u4E2D\u2026</span></div>';else{let d=m?De({tone:"warn",title:"\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u8B80\u53D6\u5931\u6557",text:r(m)}):"";u==="full"?b=`${d}<div class="qb-bank-full" data-qb-bank-view="full">${n.length?n.map((h,y)=>wp(h,y,i[String(h.id)]||null)).join(""):ca("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>`:b=`${d}<div class="qb-bank-split" data-qb-bank-view="split">
        <div class="qb-bank-list" data-qb-bank-list>${n.length?n.map((h,y)=>yp(h,y,{selected:Number(h.id)===Number(o?.id),hasAnswer:!!i[String(h.id)]})).join(""):ca("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>
        <div class="qb-bank-answer-pane" data-qb-bank-answer>${zo(e,o)}</div>
      </div>`}return`<section class="report-card qb-card qb-bank-card">
    <div class="side-card-head qb-bank-head">
      <div class="qb-bank-heading">
        <span class="side-card-title">${g("cube",14)}Benchmark \u984C\u5EAB</span>
        <span class="qb-bank-sub">${a?`${r(a.name)} \xB7 v${a.version} \xB7 ${c(a.item_count)} \u984C`:"\u5C1A\u672A\u5EFA\u7ACB suite"}</span>
      </div>
      <div class="qb-bank-controls">
        ${s.length?`<label class="qb-suite-picker"><span>Suite</span><select class="select" data-qb-suite-select aria-label="\u9078\u64C7 benchmark suite">${s.map(d=>`<option value="${d.id}" ${Number(d.id)===Number(a?.id)?"selected":""}>${r(d.name)} \xB7 ${c(d.item_count)} \u984C</option>`).join("")}</select></label>`:""}
        ${a?`<span class="badge ${a.status==="frozen"?"badge-ok":"badge-neutral"}">${a.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>`:""}
      </div>
    </div>
    ${$}
    ${b}
    <details class="qb-suite-manage" ${f?"open":""}>
      <summary>${g("sliders",14)}Suite \u8A2D\u5B9A\u8207\u7248\u672C <span class="qb-muted">${c(s.length)} \u500B suite \xB7 ${c(e.ready.length)} \u984C benchmark-ready</span></summary>
      <div class="qb-suite-manage-body">
        <form class="qb-suite-form" data-qb-form="suite">
          <input type="hidden" name="suite_id" value="${t?.id||""}" />
          <div class="qb-form-grid">
            <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${r(t?.name||"Pilot 30")}" /></label>
            <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(Bo).map(([d,h])=>`<option value="${d}" ${t?.tier===d?"selected":""}>${h}</option>`).join("")}</select></label>
          </div>
          <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${r(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
          <div class="qb-check-list">
            ${e.ready.length?e.ready.map(d=>{let h=t?t.items?.some(y=>Number(y.id)===Number(d.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${d.id}" ${h?"checked":""}/><span><strong>#${d.id}</strong> ${r(d.question)} <small>${r(Yt[d.question_type]||d.question_type)}</small></span></label>`}).join(""):ca("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
          </div>
          <div class="qb-actions">
            <button class="btn btn-primary" type="submit">${g("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
            ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
          </div>
        </form>
        <div class="qb-list">
          ${s.length?s.map(d=>`<article class="qb-suite">
            <div class="qb-item-head">
              <div class="qb-item-title"><strong>${r(d.name)}</strong><span class="qb-meta">${r(Bo[d.tier]||d.tier)} \xB7 v${d.version} \xB7 ${c(d.item_count)} \u984C</span></div>
              <span class="badge ${d.status==="frozen"?"badge-ok":"badge-neutral"}">${d.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
            </div>
            <div class="qb-suite-items">${(d.items||[]).slice(0,8).map(h=>`<span class="chip">#${h.id} ${r(h.question.slice(0,22))}${h.question.length>22?"\u2026":""}</span>`).join("")}${d.item_count>8?`<span class="qb-muted">+${d.item_count-8}</span>`:""}</div>
            <div class="qb-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${d.id}">${g("edit",13)}<span>\u7DE8\u8F2F suite</span></button>
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${d.id}">${g("shield",13)}<span>\u51CD\u7D50</span></button>
              <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${d.id}">${g("trash",13)}<span>\u522A\u9664</span></button>
            </div>
          </article>`).join(""):ca("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
        </div>
      </div>
    </details>
  </section>`}function _p(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),n=Number(a?.value);Number.isFinite(n)&&(t[s]=Math.max(1,Math.min(5,Math.round(n))))}return t}function kp(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:Yu(t.get("expected_laws")),expected_articles:Xu(t.get("expected_articles")),expected_judgments:Zu(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function Go(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},n={tab:"",editing:null,editingFrom:"",editingSuite:null,aiQuestion:"",aiLoading:!1,aiResult:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tags:[]},stats:{},suites:[],ready:[],selectedSuiteId:null,selectedBankItemId:null,bankTab:"split",suiteAnswers:{},suiteAnswersLoading:!1,suiteAnswersError:"",suiteManageOpen:!1,reviewItems:[],reviewDetail:null,reviewFilter:"queue"},i=C=>e.querySelector(`#quality-panel-${a[C]}`),o=(C,O)=>{C&&(C.childElementCount?C.setAttribute("aria-busy","true"):C.innerHTML=`<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>${O}</span></div></section>`)},l=C=>{C?.removeAttribute("aria-busy")},m=0,f=null,u=()=>"anonymous",$=()=>{s&&s(n.stats)},b=C=>{t&&t(C),de(C)},d=async()=>{try{n.stats=await K.questionBankStats()}catch{n.stats={}}$()},h=()=>{let C=i("create");C&&(C.innerHTML=op(n.editing,n))},y=(C,O)=>{let k=C?.querySelector("[data-qb-tag-results]");k&&(k.innerHTML=O.length?O.map(E=>`<button class="qb-tag-option" type="button" role="option" data-qb-action="select-tag" data-tag="${r(E.tag)}"><span>${r(E.tag)}</span><small>${c(E.count)}</small></button>`).join(""):'<div class="qb-tag-empty">\u6C92\u6709\u5176\u4ED6\u76F8\u7B26\u6A19\u7C64</div>')},_=async(C,O="")=>{if(!C)return;let k=C.querySelector("[data-qb-tag-results]"),E=++m;k&&(k.innerHTML='<div class="qb-tag-loading"><span class="spinner"></span><span>\u641C\u5C0B\u6A19\u7C64\u2026</span></div>');try{let X=await K.questionBankTags(O,12);if(E!==m)return;let H=(X.tags||[]).filter(Re=>!n.filters.tags.includes(Re.tag));y(C,H)}catch(X){if(E!==m)return;k&&(k.innerHTML=`<div class="qb-tag-empty">${r(X.message||"\u6A19\u7C64\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},L=(C,{focus:O=!1}={})=>{if(!C)return;let k=C.querySelector("[data-qb-tag-popover]"),E=C.querySelector("[data-qb-tag-search]");!k||!E||(k.hidden&&(k.hidden=!1,E.value="",_(C,"")),O&&(E.focus(),E.select()))},S=C=>{f&&(window.clearTimeout(f),f=null);let O=C?.querySelector("[data-qb-tag-popover]");O&&(O.hidden=!0)},A=async C=>{let O=String(C||"").trim();O&&(n.filters.tags.includes(O)?n.filters.tags=n.filters.tags.filter(k=>k!==O):n.filters.tags=[...n.filters.tags,O],n.offset=0,await x())},I=()=>{let C=Array.isArray(n.suites)?n.suites:[];if(!C.length)return n.selectedSuiteId=null,n.selectedBankItemId=null,null;let O=C.find(E=>Number(E.id)===Number(n.selectedSuiteId));O||(O=C[0],n.selectedSuiteId=O.id,n.selectedBankItemId=null);let k=Array.isArray(O.items)?O.items:[];return k.some(E=>Number(E.id)===Number(n.selectedBankItemId))||(n.selectedBankItemId=k[0]?.id??null),O},re=()=>{let C=i("suite");C&&(C.innerHTML=Fo(n))},Y=0,we=async(C,{force:O=!1}={})=>{if(!C)return;let k=++Y;if(!O&&n.suiteAnswers[String(C)]){n.suiteAnswersLoading=!1,n.suiteAnswersError="",re();return}n.suiteAnswersLoading=!0,n.suiteAnswersError="",re();try{let E=await K.benchmarkSuiteLatestAnswers(C);if(k!==Y)return;n.suiteAnswers[String(C)]=E.answers||{}}catch(E){if(k!==Y)return;n.suiteAnswersError=E.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}finally{k===Y&&(n.suiteAnswersLoading=!1,re())}},ge=async C=>{n.selectedSuiteId=C,n.selectedBankItemId=null,n.suiteAnswersError="";let O=I();if(!O){re();return}await we(O.id)},F=C=>{n.bankTab=C==="full"?"full":"split",re()},j=()=>{let C=i("suite");if(!C)return;let O=I(),E=(Array.isArray(O?.items)?O.items:[]).find(H=>Number(H.id)===Number(n.selectedBankItemId))||null;for(let H of C.querySelectorAll(".qb-bank-row")){let Re=Number(H.dataset.id)===Number(n.selectedBankItemId);H.classList.toggle("is-active",Re);let Ce=H.querySelector("[data-qb-action='select-bank-item']");Ce&&Ce.setAttribute("aria-pressed",Re?"true":"false")}let X=C.querySelector("[data-qb-bank-answer]");X&&(X.innerHTML=zo(n,E))},x=async()=>{let C=i("manage");if(C){f&&(window.clearTimeout(f),f=null),o(C,"\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026");try{let O=await K.questionBankItems({...n.filters,...n.filters.status==="retired"?{include_deleted:!0}:{}},n.limit,n.offset);n.items=O.items||[],n.total=Number(O.total||0),n.stats=O.stats||n.stats,l(C),C.innerHTML=cp(n),$()}catch(O){l(C),C.innerHTML=`<section class="report-card qb-card">${De({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(O.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},R=async({refreshAnswers:C=!1}={})=>{let O=i("suite");if(O){o(O,"\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026");try{let[k,E]=await Promise.all([K.benchmarkSuites(),K.benchmarkReadyQuestions(300)]);n.suites=k.suites||[],n.ready=E.items||[];let X=I();if(n.suiteAnswersError="",n.suiteAnswersLoading=!1,X&&(C||!n.suiteAnswers[String(X.id)]))try{let H=await K.benchmarkSuiteLatestAnswers(X.id);n.suiteAnswers[String(X.id)]=H.answers||{}}catch(H){n.suiteAnswersError=H.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}l(O),O.innerHTML=Fo(n)}catch(k){l(O),O.innerHTML=`<section class="report-card qb-card">${De({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(k.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},W=()=>{let C=i("review");C&&(C.innerHTML=bp(n))},te=async C=>{let O=n.reviewItems.find(E=>Number(E.id)===Number(C));if(!O)return;n.reviewDetail=O,W();let k=i("review")?.querySelector(".qb-review-detail-pane");k&&window.matchMedia("(max-width: 1020px)").matches&&k.scrollIntoView({behavior:"smooth",block:"start"});try{let E=await K.questionBankItem(O.id);Number(n.reviewDetail?.id)===Number(O.id)&&(n.reviewDetail=E,W())}catch(E){P(E.message||"\u984C\u76EE\u5167\u5BB9\u8B80\u53D6\u5931\u6557\u3002","danger")}},z=async()=>{let C=i("review");if(!C)return;o(C,"\u8B80\u53D6\u9A57\u6536\u984C\u76EE\u4E2D\u2026");let O=n.reviewFilter||"queue",k=O==="queue"?["pending_review","changes_requested"]:O==="accepted"?["accepted"]:O==="rejected"?["rejected"]:["draft"];try{let E=await Promise.all(k.map(Ce=>K.questionBankItems({status:Ce},200,0)));n.reviewItems=E.flatMap(Ce=>Ce.items||[]),n.stats=E[0]?.stats||n.stats;let X=Number(n.reviewDetail?.id||0),Re=n.reviewItems.some(Ce=>Number(Ce.id)===X)?X:Number(n.reviewItems[0]?.id||0);n.reviewDetail=Re?await K.questionBankItem(Re):null,l(C),W(),$()}catch(E){l(C),C.innerHTML=`<section class="report-card qb-card">${De({tone:"danger",title:"\u9A57\u6536\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:r(E.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}};function de(C){let O=n.tab;n.tab=C;for(let k of Object.keys(a)){let E=i(k);E&&(E.hidden=k!==C)}C==="create"?(O!=="create"&&!n.editing&&(n.aiQuestion="",n.aiResult=null),h()):C==="manage"?x():C==="suite"?R():C==="review"&&z()}let xe=C=>{let k=[...n.items,...n.reviewItems,...n.reviewDetail?[n.reviewDetail]:[]].find(X=>Number(X.id)===Number(C));n.reviewDetail=k||{id:Number(C)};let E=k?.status;["accepted","rejected","draft"].includes(E)?n.reviewFilter=E:E&&(n.reviewFilter="queue"),b("review")},D=async C=>{let O=kp(C),k=Number(C.elements.item_id?.value||0);k||(O.status=C.elements.submit_for_review?.checked?"pending_review":"draft");try{k?(await K.updateQuestionBankItem(k,{...O,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),P("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await K.createQuestionBankItem(O),P(O.status==="draft"?"\u984C\u76EE\u5DF2\u5B58\u70BA\u8349\u7A3F\uFF0C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002":"\u984C\u76EE\u5DF2\u5EFA\u7ACB\u4E26\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok")),n.editing=null;let E=["manage","suite","review"].includes(n.editingFrom)?n.editingFrom:"manage";n.editingFrom="",n.suiteAnswers={},await d(),b(E)}catch(E){let X=E.detail||E.payload?.detail,H=X?.errors?.join(" \xB7 ")||X?.message||E.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";P(H,"danger",8e3)}},ke=async C=>{let O=String(new FormData(C).get("question")||"").trim();if(O.length<4){P("\u984C\u76EE\u81F3\u5C11\u9700\u8981 4 \u500B\u5B57\u3002","danger");return}n.aiQuestion=O,n.aiLoading=!0,n.aiResult=null,h();try{let k=await K.createQuestionBankItemWithAI({question:O});n.aiResult=k,n.aiQuestion="",await d(),P(`llama-server \u5DF2\u5EFA\u7ACB\u984C\u76EE #${k.item.id}\uFF0C\u72C0\u614B\u70BA\u5F85\u5BE9\uFF0C\u8ACB\u4EBA\u5DE5\u8986\u6838\u3002`,"ok",8e3)}catch(k){let E=k.detail||k.payload?.detail,X=E?.errors?.join(" \xB7 ")||E?.message||k.message||"llama-server \u7522\u751F\u5931\u6557\u3002";P(X,"danger",12e3)}finally{n.aiLoading=!1,h()}},se=async(C,O)=>{let k=Number(C.dataset.id||0);if(k)try{await K.reviewQuestionBankItem(k,{decision:O,reviewer:u(),rubric_scores:_p(C),comment:String(C.querySelector('[name="comment"]')?.value||"")}),P(O==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":O==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",O==="approved"?"ok":"info"),await d(),await z()}catch(E){let X=E.detail||E.payload?.detail,H=X?.errors?.join(" \xB7 ")||X?.message||E.message||"\u9A57\u6536\u5931\u6557\u3002";P(H,"danger",8e3)}},je=async C=>{let O=new FormData(C),k=Number(O.get("suite_id")||0),E=Array.from(C.querySelectorAll('input[name="item_ids"]:checked')).map(H=>Number(H.value)),X={name:String(O.get("name")||"").trim(),tier:String(O.get("tier")||"core"),description:String(O.get("description")||"").trim(),item_ids:E};try{k?(await K.updateBenchmarkSuite(k,X),P("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await K.createBenchmarkSuite(X),P("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),n.editingSuite=null,n.suiteManageOpen=!0,n.suiteAnswers={},await R()}catch(H){let Re=H.detail||H.payload?.detail,Ce=Re?.errors?.join(" \xB7 ")||Re?.message||H.message||"Suite \u5132\u5B58\u5931\u6557\u3002";P(Ce,"danger",8e3)}},_e=async C=>{let O=e.querySelector("[data-qb-tag-filter] [data-qb-tag-popover]:not([hidden])")?.closest("[data-qb-tag-filter]");O&&!C.target.closest("[data-qb-tag-filter]")&&S(O);let k=C.target.closest("[data-qb-action]")?.dataset.qbAction;if(!k)return;let E=C.target.closest("[data-qb-action]"),X=Number(E.dataset.id||0);if(k==="open-tag-search"){let H=E.closest("[data-qb-tag-filter]");L(H,{focus:!0});return}if(k==="select-tag"){await A(E.dataset.tag);return}if(k==="remove-tag"){await A(E.dataset.tag);return}if(k==="bank-tab"){F(E.dataset.tab);return}if(k==="select-bank-item"){n.selectedBankItemId=X,j();return}if(k==="new"){n.editing=null,n.editingFrom="",n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,b("create");return}if(k==="reset-create"){n.editing=null,h();return}if(k==="reset-ai"){n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,h();return}if(k==="edit"){let H=n.suites.find(Ie=>Number(Ie.id)===Number(n.selectedSuiteId)),Ce=[...n.items,...n.reviewItems,...H?.items||[],...n.reviewDetail?[n.reviewDetail]:[]].find(Ie=>Number(Ie.id)===X);if(!Ce)return;n.editing=Ce,n.editingFrom=n.tab,b("create");return}if(k==="review"){xe(X);return}if(k==="review-ai-item"){let H=n.aiResult?.item;if(!H)return;n.reviewFilter="queue",n.reviewDetail=H,b("review");return}if(k==="review-filter"){let H=String(E.dataset.filter||"queue");n.reviewFilter=["queue","accepted","rejected","draft"].includes(H)?H:"queue",n.reviewDetail=null,await z();return}if(k==="select-review-item"){await te(X);return}if(k==="go-manage"){b("manage");return}if(k==="submit-review"){try{await K.submitQuestionBankItemForReview(X),P("\u5DF2\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok"),await d(),n.tab==="manage"?await x():n.tab==="review"&&await z()}catch(H){let Re=H.detail||H.payload?.detail,Ce=Re?.errors?.join(" \xB7 ")||Re?.message||H.message||"\u9001\u5BE9\u5931\u6557\u3002";P(Ce,"danger",8e3)}return}if(k==="restore"){if(!window.confirm(`\u78BA\u5B9A\u5FA9\u539F\u984C\u76EE #${X}\uFF1F\u5FA9\u539F\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\u72C0\u614B\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002`))return;try{await K.restoreQuestionBankItem(X),P("\u984C\u76EE\u5DF2\u5FA9\u539F\u4E26\u56DE\u5230\u5F85\u5BE9\u3002","ok"),await d(),await x()}catch(H){let Re=H.detail||H.payload?.detail,Ce=Re?.errors?.join(" \xB7 ")||Re?.message||H.message||"\u5FA9\u539F\u5931\u6557\u3002";P(Ce,"danger",8e3)}return}if(k==="delete"){if(n.tab==="suite"){let H=I();if(!H||!(H.items||[]).find(Ce=>Number(Ce.id)===X)||!window.confirm(`\u78BA\u5B9A\u5F9E\u300C${H.name}\u300D\u79FB\u9664\u984C\u76EE #${X}\uFF1F\u984C\u76EE\u4ECD\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u7BA1\u7406\u4E2D\u3002`))return;try{await K.removeBenchmarkSuiteItem(H.id,X),P("\u5DF2\u5F9E Benchmark \u984C\u5EAB\u79FB\u9664\u3002","info"),delete n.suiteAnswers[String(H.id)],Number(n.selectedBankItemId)===X&&(n.selectedBankItemId=null),await R()}catch(Ce){P(Ce.message||"\u79FB\u9664\u5931\u6557\u3002","danger")}return}if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${X}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await K.deleteQuestionBankItem(X),P("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await d(),n.tab==="review"?(n.reviewDetail=null,await z()):await x()}catch(H){P(H.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(k==="revalidate"){try{let H=await K.revalidateQuestionBank();P(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${c(H.checked||0)} \u984C\uFF0C${c(H.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await d(),await x()}catch(H){P(H.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(k==="export"){try{let H=await K.exportQuestionBank({status:""});Pt(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(H,null,2),"application/json;charset=utf-8")}catch(H){P(H.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(k==="import-json"){let H=e.querySelector("#qb-import-json");try{let Re=JSON.parse(String(H?.value||"").trim()),Ce=await K.importQuestionBank(Re);P(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${Ce.created}\u3001\u66F4\u65B0 ${Ce.updated}\u3001\u932F\u8AA4 ${(Ce.errors||[]).length}\u3002`,(Ce.errors||[]).length?"warn":"ok",8e3),H&&(H.value=""),await d(),await x()}catch(Re){P(Re.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(k==="prev"||k==="next"){n.offset=Math.max(0,n.offset+(k==="next"?n.limit:-n.limit)),await x();return}if(k==="suite-edit"){let H=n.suites.find(Re=>Number(Re.id)===X);if(!H)return;n.editingSuite=H,n.suiteManageOpen=!0,R();return}if(k==="suite-new"){n.editingSuite=null,n.suiteManageOpen=!0,R();return}if(k==="suite-freeze"){try{await K.updateBenchmarkSuite(X,{freeze:!0}),P("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),n.editingSuite=null,n.suiteManageOpen=!0,await R()}catch(H){P(H.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(k==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${X}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await K.deleteBenchmarkSuite(X),P("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),n.editingSuite=null,n.suiteAnswers={},n.suiteManageOpen=!0,await R()}catch(H){P(H.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(k==="decide"){let H=E.closest("form[data-qb-form='review']");H&&await se(H,String(E.dataset.decision||""))}},oe=async C=>{let O=C.target.closest("[data-qb-form]");if(!O)return;C.preventDefault();let k=O.dataset.qbForm;if(k==="create")await D(O);else if(k==="ai-create")await ke(O);else if(k==="filter"){let E=new FormData(O);n.filters={query:String(E.get("query")||"").trim(),status:String(E.get("status")||""),question_type:String(E.get("question_type")||""),difficulty:String(E.get("difficulty")||""),tags:E.getAll("tags").map(X=>String(X).trim()).filter(Boolean)},n.offset=0,await x()}else k==="suite"&&await je(O)},ie=async C=>{let O=C.target.closest?.("form[data-qb-form='filter'] select");if(O){O.form.requestSubmit();return}let k=C.target.closest?.("[data-qb-suite-select]");if(!k)return;let E=Number(k.value||0);!E||E===Number(n.selectedSuiteId)||await ge(E)},he=C=>{let O=C.target;O?.matches?.(".qb-suite-manage")&&(n.suiteManageOpen=!!O.open)},fe=C=>{let O=C.target.closest?.("[data-qb-action='open-tag-search']");O&&L(O.closest("[data-qb-tag-filter]"))},Ae=C=>{let O=C.target.closest?.("[data-qb-tag-filter]");O&&(C.relatedTarget&&O.contains(C.relatedTarget)||S(O))},$e=C=>{let O=C.target.closest?.("[data-qb-tag-search]");if(!O)return;let k=O.closest("[data-qb-tag-filter]");f&&window.clearTimeout(f),f=window.setTimeout(()=>{_(k,O.value)},160)},Pe=C=>{let O=C.target.closest?.("[data-qb-tag-search]");if(!O)return;let k=O.closest("[data-qb-tag-filter]");C.key==="Escape"?(C.preventDefault(),S(k),O.blur()):C.key==="Enter"?(C.preventDefault(),k?.querySelector("[data-qb-action='select-tag']")?.click()):C.key==="ArrowDown"&&(C.preventDefault(),k?.querySelector("[data-qb-action='select-tag']")?.focus())};e.addEventListener("click",_e),e.addEventListener("submit",oe),e.addEventListener("change",ie),e.addEventListener("toggle",he,!0),e.addEventListener("mouseover",fe),e.addEventListener("mouseout",Ae),e.addEventListener("input",$e),e.addEventListener("keydown",Pe);let Ue=async()=>{await d(),n.tab==="create"?h():n.tab==="manage"?await x():n.tab==="suite"?await R({refreshAnswers:!0}):n.tab==="review"&&await z()};return d(),{show:de,refresh:Ue,destroy(){f&&window.clearTimeout(f),e.removeEventListener("click",_e),e.removeEventListener("submit",oe),e.removeEventListener("change",ie),e.removeEventListener("toggle",he,!0),e.removeEventListener("mouseover",fe),e.removeEventListener("mouseout",Ae),e.removeEventListener("input",$e),e.removeEventListener("keydown",Pe)},getStats:()=>n.stats}}function Za(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function Qo(e){return e==null?"\u2014":c(e)}function Sp(e){return e.count?e.severity==="danger"?Qe("failed","\u9700\u8655\u7406"):e.severity==="warn"?Qe("warning","\u6CE8\u610F"):Qe("preview","\u63D0\u793A"):Qe("success","\u901A\u904E")}function xp(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function Ap(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${xp(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${r(e.label)}</span>
      ${Sp(e)}
    </div>
    <div class="quality-check-value">
      <strong>${c(t)}</strong>
      <span>\u7B46</span>
      <em>${r(Za(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${r(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function Xa(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
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
  </div>`}function qp(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},n=t.postgres_diff,i=n==null?"\u2014":n===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${c(Math.abs(n))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${c(t.vector_indexed)} / ${c(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${g("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${c(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${c(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${g("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${Qo(t.postgres_judgments)}</div>
      <div class="metric-foot">${r(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${g("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${r(Za(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${r(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${g("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${Qo(a.candidate_total)}</div>
      <div class="metric-foot">${c(a.candidate_archive_count)} / ${c(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function Mp(e){return e.length?`<div class="table-wrap">
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
              <td class="cell-number">${r(Za(t.match_rate))}</td>
              <td class="cell-number">${c(t.short_text_rows)}</td>
              <td class="cell-number">${c(s)}</td>
              <td class="cell-number">${c(t.duplicate_content_rows)}</td>
              <td class="cell-date">${r(Rt(t.date_min))} \u2013 ${r(Rt(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:ct({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function Lp(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],n=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=Le(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${Qe(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${c(t.rows)} \u7B46 \xB7 ${c(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${ue(e.scan_ms||0)} \xB7
          ${r(ve(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${g("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${De({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(m=>r(m)).join("<br>")})}</div>`:""}
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
        <div class="summary-value">${r(Za(t.match_rate))}</div>
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
      <div class="quality-checks">${a.map(Ap).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${qp(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${c(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${Mp(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${Xa("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${Xa("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${Xa("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${Xa("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function jp(e){e.innerHTML=`<section class="page data-page quality-page">
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),n=[...e.querySelectorAll("[data-quality-tab]")],i={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},o=null,l="overview",m=()=>{if(!o)return;t.innerHTML=Lp(o),a.textContent=`DUCKDB \xB7 ${c(o.totals?.rows)} \u7B46 \xB7 ${ue(o.scan_ms||0)}`;let h=e.querySelector("#quality-badge-overview");h&&(h.textContent=c(o.totals?.rows||0))},f=h=>{l=h==="overview"?"overview":h;for(let y of n){let _=y.dataset.qualityTab===l;y.classList.toggle("is-active",_),_?y.setAttribute("aria-current","page"):y.removeAttribute("aria-current")}for(let[y,_]of Object.entries(i))_&&(_.hidden=y!==l);l!=="overview"?a.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":o&&m()},u=Go(e,{onNavigate:h=>f(h),onStats:h=>{let y=h||{},_=e.querySelector("#quality-badge-manage"),L=e.querySelector("#quality-badge-suite"),S=e.querySelector("#quality-badge-review");_&&(_.textContent=c(y.total||0)),L&&(L.textContent=c(y.benchmark_ready||0)),S&&(S.textContent=c((y.pending_review||0)+(y.changes_requested||0)))}}),$=h=>{f(h),h!=="overview"&&u.show(h)},b=async()=>{Me(s,!0,"\u6383\u63CF\u4E2D\u2026");try{o=await K.quality(),m()}catch(h){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${De({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:r(h.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",P("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{Me(s,!1)}},d=async()=>{l==="overview"?await b():await u.refresh()};s.addEventListener("click",d),e.addEventListener("click",h=>{let y=h.target.closest("[data-quality-tab]");y&&$(y.dataset.qualityTab||"overview")}),t.addEventListener("click",h=>{!h.target.closest("[data-action='export-quality']")||!o||Pt(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(o,null,2),"application/json;charset=utf-8")}),f("overview"),await b()}var Mr={};ls(Mr,{render:()=>um});var en={};ls(en,{render:()=>Ar});var Jo={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function Wo(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${r(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${r(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function Tp(e){let t=e?.supports_chat,s=t===!0?"badge-ok":t===!1?"badge-danger":"badge-neutral",a=t===!0?"\u652F\u63F4 chat":t===!1?"\u4E0D\u652F\u63F4 chat":"\u672A\u6E2C\u8A66",n=(Array.isArray(e?.capabilities)?e.capabilities:[]).map(i=>`<span class="chip chip-mono">${r(i)}</span>`).join("");return`<div class="tests-llm-row">
    <div class="tests-llm-model">
      <strong class="mono">${r(e?.model||"\u2014")}</strong>
      <small>${r(e?.detail||"")}</small>
    </div>
    <div class="tests-llm-meta">
      <span class="badge ${s}">${a}</span>
      ${e?.tested_now?'<span class="badge badge-info">\u672C\u6B21\u65B0\u6E2C</span>':""}
      ${n}
      <span class="tests-llm-time">${e?.tested_at?`\u6E2C\u8A66\u65BC ${r(ve(e.tested_at))}`:"\u5C1A\u7121\u6E2C\u8A66\u7D00\u9304"}</span>
    </div>
  </div>`}function Np(e){let t=Array.isArray(e?.models)?e.models:[],s=e?.counts||{},a=Array.isArray(e?.failures)?e.failures:[];return{summary:e?`<span>llama-server <strong>${s.available??t.length}</strong> \u500B\u6A21\u578B</span>
      <span>\u652F\u63F4 chat <strong>${s.chat??0}</strong></span>
      <span>\u4E0D\u652F\u63F4 <strong>${s.unsupported??0}</strong></span>
      <span>\u672A\u6E2C\u8A66 <strong>${s.untested??0}</strong></span>
      <span>\u672C\u6B21\u65B0\u6E2C <strong>${(e.tested_now||[]).length}</strong></span>
      <span class="muted">${r(e.detail||"")}</span>`:"<span>\u6B63\u5728\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u2026</span>",list:t.length?t.map(Tp).join(""):'<div class="tests-llm-empty">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u8ACB\u78BA\u8A8D llama-server \u5DF2\u555F\u52D5\u4E26\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66\u3002</div>',failures:a.length?`<div class="tests-llm-failures">${a.map(i=>`<span><strong class="mono">${r(i.model||"\u2014")}</strong> ${r(i.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function Ep(e){let t=String(e?.status||"degraded"),s=t==="operational"?"badge-ok":t==="disabled"?"badge-neutral":"badge-danger",a=Array.isArray(e?.scores)?e.scores.slice(0,4):[],n=Array.isArray(e?.results)?e.results[0]:null;return`<div class="tests-llm-row">
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
  </div>`}function Rp(e){if(!e)return{summary:"<span>\u6B63\u5728\u8B80\u53D6 reranker \u72C0\u614B\u2026</span>",list:"",failures:""};let t=Array.isArray(e.providers)?e.providers:[],s=e.active||{},a=String(e.status||"degraded"),n=a==="operational"?"badge-ok":a==="not_configured"?"badge-neutral":"badge-danger",i=t.flatMap(o=>(o.errors||[]).map(l=>({model:o.url,detail:l})));return{summary:`<span>\u72C0\u614B <span class="badge ${n}">${r(a)}</span></span>
      <span>\u6A21\u578B <strong>${r(e.model||"\u2014")}</strong></span>
      <span>\u555F\u7528 <strong>${e.enabled?"true":"false"}</strong></span>
      ${s.url?`<span>\u4F5C\u7528\u4E2D <strong class="mono">${r(s.url)}</strong></span>`:""}
      <span class="muted">${r(e.detail||"")}</span>`,list:t.length?t.map(Ep).join(""):'<div class="tests-llm-empty">\u6C92\u6709\u8A2D\u5B9A RERANK_URL\uFF1B\u8ACB\u8A2D\u5B9A primary \u6216 fallback reranker\u3002</div>',failures:i.length?`<div class="tests-llm-failures">${i.map(o=>`<span><strong class="mono">${r(o.model||"\u2014")}</strong> ${r(o.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function Cp(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,total_ms:e.total_ms,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}:${a.duration_ms}`)}:null})}async function Ar(e,t,{embedded:s=!1}={}){let a=!1,n=!1,i={embedding:[],llm:[]},o=!1,l=null,m=!1,f=null,u=!1,$=null,b=[],d="",h=null,y="",_=`<div class="page-actions">
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
  </section>`;let S=e.querySelector("#tests-mode-badge"),A=e.querySelector("#tests-mode-toggle"),I=e.querySelector("#tests-mode-summary"),re=e.querySelector("#tests-mode-models"),Y=e.querySelector("#tests-mode-status"),we=e.querySelector("#tests-api-form"),ge=e.querySelector("#tests-api-input"),F=e.querySelector("#tests-admin-token-input"),j=e.querySelector("#tests-api-preview"),x=e.querySelector("#tests-api-status"),R=e.querySelector("#tests-api-note"),W=e.querySelector("#tests-api-test"),te=e.querySelector("#tests-api-reset"),z=e.querySelector("#tests-api-save"),de=e.querySelector("#tests-refresh"),xe=e.querySelector("#tests-flow"),D=e.querySelector("#tests-llm-summary"),ke=e.querySelector("#tests-llm-list"),se=e.querySelector("#tests-llm-failures"),je=e.querySelector("#tests-llm-status"),_e=e.querySelector("#tests-llm-test"),oe=e.querySelector("#tests-rerank-summary"),ie=e.querySelector("#tests-rerank-list"),he=e.querySelector("#tests-rerank-failures"),fe=e.querySelector("#tests-rerank-status"),Ae=e.querySelector("#tests-rerank-test");F&&(F.value=va());let $e=(ne,ye,Je="")=>{ne&&(ne.textContent=ye,ne.className=`tests-status${Je?` is-${Je}`:""}`)},Pe=(ne,ye="")=>{x&&(x.textContent=ne,x.className=`api-dialog-status${ye?` is-${ye}`:""}`)},Ue=()=>Et()==="query",C=()=>{let ne=Zt(ge.value);return ne||(window.location.protocol==="file:"?mn:"")},O=()=>{let ne=C(),ye=zt(),Je=Jo[Et()]||Et()||"\u540C\u6E90";j.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${r(cs(ye))}</strong>${ye?`\uFF08${r(Je)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${r(lt("/api/health",ne))}`},k=()=>{let ne=Et(),ye=`\u76EE\u524D\u4F86\u6E90\uFF1A${Jo[ne]||ne||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,Je="";ne==="query"?(Je="is-warn",ye="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):ha()?(Je="is-warn",ye="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(ne==="file-default"||window.location.protocol==="file:")&&(ye="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),ye+=(F?.value||va()).trim()?" \u7BA1\u7406\u6B0A\u6756\uFF1A\u5DF2\u8A2D\u5B9A\uFF0C\u6703\u9001\u5F80\u76EE\u524D\u8A2D\u5B9A\u7684 API Base\u3002":" \u7BA1\u7406\u6B0A\u6756\uFF1A\u672A\u8A2D\u5B9A\uFF1B\u672C\u6A5F loopback \u53EF\u76F4\u63A5\u4F7F\u7528\uFF0C\u9060\u7AEF\u7BA1\u7406 API \u6703\u88AB\u62D2\u7D55\u3002",R.textContent=ye,R.className=`api-dialog-note${Je?` ${Je}`:""}`;let Ze=ne==="query";z.disabled=Ze,te.disabled=Ze,ge.readOnly=Ze},E=()=>{if(!gn(ge.value))return Pe("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),ge.focus(),null;let ne=C();return window.location.protocol==="https:"&&/^http:\/\//i.test(ne)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(ne)?(Pe("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),ge.focus(),null):ne},X=()=>{ge.value=zt(),O(),k(),Pe("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},H=()=>{let ne=Array.isArray(i.embedding)?i.embedding.length:0,ye=Array.isArray(i.llm)?i.llm.length:0;if(S&&(S.textContent=o?"\u5207\u63DB\u4E2D\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",S.className=`badge badge-mono ${o?"badge-info":n?"badge-warn":"badge-neutral"}`),A){A.disabled=o,A.classList.toggle("is-on",n),A.classList.toggle("is-off",!n&&!o),A.classList.toggle("is-busy",o),A.setAttribute("aria-checked",n?"true":"false"),A.setAttribute("aria-busy",o?"true":"false"),A.setAttribute("aria-label",o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":n?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),A.title=o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let Je=A.querySelector(".header-power-label");Je&&(Je.textContent=o?"\u2026":n?"ON":"OFF")}I&&(I.textContent=n?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${ne} \u500B embedding \u8207 ${ye} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),re&&(re.innerHTML=Wo("Embedding",i.embedding)+Wo("LLM",i.llm))},Re=async()=>{try{let ne=await K.testMode();if(a)return;n=!!ne.enabled,i=ne.models||{embedding:[],llm:[]},$e(Y,"")}catch(ne){if(a)return;n=!1,i={embedding:[],llm:[]},$e(Y,ne.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}a||H()},Ce=async()=>{if(o)return;let ne=!n;o=!0,H(),$e(Y,ne?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let ye=await K.setTestMode(ne);if(a)return;n=!!ye.enabled,i=ye.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:n,models:i}}));let Je=i.embedding?.length||0,Ze=i.llm?.length||0;$e(Y,n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${Je} \u500B embedding \u8207 ${Ze} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),P(n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${Je} \u500B embedding\u3001${Ze} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",n?"ok":"info",6e3),await mt()}catch(ye){a||($e(Y,ye.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),P(ye.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{o=!1,a||H()}},Ie=()=>{let ne=Np(l);if(D&&(D.innerHTML=ne.summary),ke&&(ke.innerHTML=ne.list),se&&(se.innerHTML=ne.failures),_e){_e.disabled=m,_e.setAttribute("aria-busy",m?"true":"false");let ye=_e.querySelector("span");ye&&(ye.textContent=m?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66")}},Fe=async()=>{try{let ne=await K.llmModels();if(a)return;l=ne,$e(je,"")}catch(ne){if(a)return;l=null,$e(je,ne.message||"\u7121\u6CD5\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u3002","error")}a||Ie()},Ye=async()=>{if(!m){m=!0,Ie(),$e(je,"\u6B63\u5728\u6AA2\u67E5 llama-server \u6A21\u578B\u8207 chat \u80FD\u529B\u2026");try{let ne=await K.testLlmModels();if(a)return;l=ne;let ye=ne.tested_now?.length||0,Je=ne.chat_models?.length||0,Ze=ne.failures?.length||0;$e(je,`${ye?`\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u672C\u6B21\u65B0\u6E2C ${ye} \u500B\u6A21\u578B`:"\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u6C92\u6709\u65B0\u6A21\u578B"}\uFF0C\u76EE\u524D ${Je} \u500B\u6A21\u578B\u652F\u63F4 chat${Ze?`\uFF1B${Ze} \u500B\u6A21\u578B\u66AB\u6642\u7121\u6CD5\u5224\u5B9A\uFF0C\u4E0B\u6B21\u6703\u91CD\u8A66`:""}\u3002`,Ze?"warn":"ok"),P(ye?`LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u65B0\u589E ${ye} \u7B46\u80FD\u529B\u7D00\u9304\u3002`:"LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u6C92\u6709\u65B0\u6A21\u578B\u9700\u8981\u6E2C\u8A66\u3002",Ze?"warn":"ok",5e3),await Re()}catch(ne){a||($e(je,ne.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),P(ne.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{m=!1,a||Ie()}}},We=()=>{let ne=Rp(f);if(oe&&(oe.innerHTML=ne.summary),ie&&(ie.innerHTML=ne.list),he&&(he.innerHTML=ne.failures),Ae){Ae.disabled=u,Ae.setAttribute("aria-busy",u?"true":"false");let ye=Ae.querySelector("span");ye&&(ye.textContent=u?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C Reranker \u670D\u52D9\u6E2C\u8A66")}},it=async()=>{try{let ne=await K.rerankStatus();if(a)return;f=ne,$e(fe,"")}catch(ne){if(a)return;f=null,$e(fe,ne.message||"\u7121\u6CD5\u8B80\u53D6 reranker \u72C0\u614B\u3002","error")}a||We()},_t=async()=>{if(!u){u=!0,We(),$e(fe,"\u6B63\u5728\u5C0D primary\uFF0Ffallback reranker \u57F7\u884C\u5BE6\u969B rerank \u6E2C\u8A66\u2026");try{let ne=await K.testReranker();if(a)return;f=ne;let ye=Array.isArray(ne.providers)?ne.providers:[],Je=ye.filter(Ft=>Ft.status==="operational").length,Ze=ye.reduce((Ft,Ot)=>Ft+(Array.isArray(Ot.errors)?Ot.errors.length:0),0);$e(fe,Ze?`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${Je} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C${Ze} \u500B\u932F\u8AA4\uFF1B\u8A73\u7D30\u5206\u6578\u5DF2\u5217\u5728\u4E0A\u65B9\u3002`:`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${Je} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C\u6A21\u578B ${ne.model||"\u2014"}\u3002`,Ze?"warn":"ok"),P(Ze?"Reranker \u90E8\u5206\u7AEF\u9EDE\u5931\u6557\uFF0C\u8ACB\u67E5\u770B\u6E2C\u8A66\u7D50\u679C\u3002":"Reranker \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\u3002",Ze?"warn":"ok",5e3)}catch(ne){a||($e(fe,ne.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),P(ne.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{u=!1,a||We()}}},jt=()=>{if(!xe)return;let ne=Cp($,b,d);ne!==y&&(y=ne,xe.innerHTML=Is($,b,d))},Ke=async()=>{try{let ne=await K.testRuns(30);if(a)return;b=Array.isArray(ne.runs)?ne.runs:[]}catch{if(a)return;b=[]}},mt=async(ne=null)=>{try{let ye=ne||(d?await K.testRun(d):await K.testRunCurrent());if(a)return;$=ye.run||null,!d&&$&&$.status!=="running"&&!b.some(Je=>Je.run_id===$.run_id)&&await Ke()}catch{if(a)return;$=null}a||jt()};ge?.addEventListener("input",()=>{O(),Pe("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),F?.addEventListener("input",()=>{k()}),W?.addEventListener("click",async()=>{let ne=E();if(ne!==null){Me(W,!0,"\u6E2C\u8A66\u4E2D\u2026"),Pe(`\u6B63\u5728\u9023\u7DDA\u5230 ${cs(ne)||"\u540C\u6E90"}\u2026`);try{let ye=await zr(ne);if(a)return;Pe(`\u9023\u7DDA\u6210\u529F \xB7 v${ye.version} \xB7 ${ye.duration_ms} ms \xB7 GET ${lt("/api/health",ne)}`,"ok")}catch(ye){a||Pe(ye.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{a||Me(W,!1)}}}),we?.addEventListener("submit",ne=>{if(ne.preventDefault(),Ue())return;let ye=E();ye!==null&&(vn(ye),Fr(F?.value||""),P(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${cs(ye)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),te?.addEventListener("click",()=>{Ue()||(vn(""),P("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),A?.addEventListener("click",Ce),_e?.addEventListener("click",Ye),Ae?.addEventListener("click",_t),xe?.addEventListener("change",async ne=>{ne.target.id==="test-run-select"&&(d=String(ne.target.value||""),await mt())}),xe?.addEventListener("click",async ne=>{ne.target.closest("#test-flow-refresh")&&(d="",await Ke(),await mt())}),de?.addEventListener("click",async()=>{Me(de,!0,"\u66F4\u65B0\u4E2D\u2026"),X(),await Promise.allSettled([Re(),Ke(),Fe(),it()]),a||await mt(),a||(Me(de,!1),P("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let Bt=ne=>{n=!!ne.detail?.enabled,i=ne.detail?.models||{embedding:[],llm:[]},H()};return window.addEventListener("judgment:test-mode",Bt),X(),H(),Ie(),We(),await Promise.allSettled([Re(),Ke(),Fe(),it()]),await mt(),h=bt("test-runs",async(ne,ye)=>{a||document.hidden||d||await mt(ye?.snapshot||null)}),!s&&typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{a=!0,h&&h(),window.removeEventListener("judgment:test-mode",Bt)}}var Vo={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var Zo={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},qr=new Set,el=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"tests",label:"\u7CFB\u7D71\u6E2C\u8A66",hint:"API\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u6A21\u578B Flow",icon:"terminal"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"local-model",label:"Model Provider",hint:"llama-server \u4E3B\u6A5F\u8207\u6A21\u578B",icon:"server"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 API \u2192 Pipeline \u2192 Data",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}],ua=[{id:"system",label:"\u7CFB\u7D71\u8207\u5373\u6642\u72C0\u614B",icon:"activity",prefixes:["/api/health","/api/status","/api/system-usage","/api/events/stream","/api/processing/events/status","/api/docs","/api/openapi.json"]},{id:"processing",label:"\u8CC7\u6599\u8655\u7406\u8207\u66F4\u65B0",icon:"database",prefixes:["/api/processing","/api/judgment-download","/api/updates","/api/courts","/api/law-versions"]},{id:"data",label:"\u67E5\u8A62\u8207\u8CC7\u6599",icon:"search",prefixes:["/api/query","/api/data","/api/judgment","/api/law","/api/schema","/api/catalog","/api/judgment-stats","/api/quality"]},{id:"rag",label:"RAG \u554F\u7B54",icon:"message",prefixes:["/api/rag"]},{id:"index",label:"\u7248\u672C\u8207\u7D22\u5F15",icon:"layers",prefixes:["/api/index-versions","/api/index-alias","/api/versioning"]},{id:"models",label:"\u6A21\u578B\u8207\u670D\u52D9",icon:"brain",prefixes:["/api/ollama","/api/llm","/api/rerank","/api/test-mode"]},{id:"tests",label:"\u6E2C\u8A66\u8207\u6548\u80FD",icon:"activity",prefixes:["/api/test-runs","/api/performance"]},{id:"question-bank",label:"\u984C\u5EAB",icon:"file",prefixes:["/api/question-bank"]},{id:"benchmark",label:"Benchmark",icon:"grid",prefixes:["/api/benchmark"]},{id:"other",label:"\u5176\u4ED6",icon:"terminal",prefixes:[]}];function Pp(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Ct(e).label,tone:Ct(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function Ip(e){let t=Ct(e.status),s=Vo[e.kind]||Vo.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${c(e.latency_ms)} ms</span>`;return`<article class="service-card">
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
  </article>`}function Dp(e,t){let s=typeof e=="string"?{label:e}:e||{},a=String(s.label||"\u2014"),n=s.service?t.find(l=>l.id===s.service):null,i=n?n.status==="operational":a==="IndexedDB"?gi():!0,o=[s.detail||"",n?`\u72C0\u614B\uFF1A${Ct(n.status).label}`:""].filter(Boolean).join(" \xB7 ");return`<div class="arch-node ${i?"":"is-muted"}" title="${r(o||(i?a:"\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"))}">
    <strong>${r(a)}</strong>
    ${s.detail?`<span class="arch-node-detail">${r(s.detail)}</span>`:""}
  </div>`}function Bp(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>Dp(l,t)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${r(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),n=[];return a.forEach((i,o)=>{o&&n.push(`<div class="arch-arrow" aria-hidden="true">${g("arrowRight",15)}</div>`),n.push(i)}),`<div class="arch-flow">${n.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${g("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>
    ${Fp()}`}function Fp(){return`<figure class="arch-diagram">
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
  </figure>`}function tl(e){let t=String(e||""),s=a=>t===a||t.startsWith(`${a}/`);for(let a of ua)if(a.prefixes.some(s))return a;return ua[ua.length-1]}function Op(e){return`is-${String(e||"get").toLowerCase()}`}function Hp(e){return`<div class="endpoint-row${e.deprecated?" is-deprecated":""}">
    <span class="endpoint-method ${Op(e.method)}">${r(e.method||"GET")}</span>
    <span class="endpoint-path" title="${r(e.path||"")}">${r(e.path||"")}</span>
    <span class="endpoint-label">${r(e.label||"")}</span>
  </div>`}function zp(e){if(!Array.isArray(e)||!e.length)return'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>';let t=new Map(ua.map(s=>[s.id,{group:s,endpoints:[]}]));for(let s of e){let a=tl(s.path),n=t.get(a.id);n&&n.endpoints.push(s)}return`<div class="api-endpoint-groups">${ua.map(s=>{let n=t.get(s.id)?.endpoints||[];return n.length?(n.sort((i,o)=>String(i.path).localeCompare(String(o.path))||String(i.method).localeCompare(String(o.method))),`<section class="card api-endpoint-group">
        <div class="side-card-head">
          <span class="side-card-title">${g(s.icon,14)}${r(s.label)}</span>
          <span class="badge badge-neutral badge-mono">${c(n.length)}</span>
        </div>
        <div class="endpoint-list">${n.map(Hp).join("")}</div>
      </section>`):""}).join("")}</div>`}function ns(e,t){return`<div class="detail-row">
    <span class="detail-label">${r(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function ze(e,t,{mono:s=!1,wide:a=!1}={}){return`<div class="data-version-fact${a?" is-wide":""}">
    <span>${r(e)}</span>
    <strong class="${s?"mono":""}">${r(String(t??"\u2014"))}</strong>
  </div>`}function Ko(e,t,s,a=""){let n=t==null?null:Math.max(0,Math.min(100,Number(t)||0));return`<div class="data-version-coverage ${a}">
    <div class="data-version-coverage-head">
      <span>${r(e)}</span>
      <strong>${tn(n)}</strong>
    </div>
    <div class="data-version-coverage-track"><span style="width:${n===null?0:n.toFixed(1)}%"></span></div>
    <div class="data-version-coverage-foot">${r(s)}</div>
  </div>`}function Up(e){if(!Array.isArray(e)||!e.length)return ct({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${r(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${ya(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function Gp(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=new Map(s.map(y=>[y.id,y])),n=a.get("qdrant"),i=a.get("embedding"),o=a.get("rag"),l=a.get("llm"),m=Number(t.judgment_indexed_count||0),f=Number(t.judgment_count||0),u=f?(m/f*100).toFixed(1):"0.0",$=t.judgment_vector_points===null||t.judgment_vector_points===void 0?"\u2014":c(t.judgment_vector_points),b=Number(t.judgment_index_remaining||0),d=o?.status==="operational"?"RAG \u5C31\u7DD2":o?.status==="not_configured"?"\u672A\u8A2D\u5B9A":o?.status==="degraded"?"\u964D\u7D1A":"\u672A\u77E5",h=[["cube","Qdrant \u5411\u91CF\u7D22\u5F15",n],["layers",`Embedding\uFF08${t.judgment_vector_model||"\u2014"}\uFF09`,i],["brain","RAG \u56DE\u7B54\u7BA1\u7DDA",o],["sparkles","LLM \u6A21\u578B",l]];return`<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("database",14)}RAG \u8CC7\u6599\u73FE\u6CC1</span>
      ${Qe(o?.status,d)}
    </div>
    <div class="side-card-body">
      <div class="mini-stats">
        <div class="mini-stat">
          <div class="mini-stat-value">${c(f)}</div>
          <div class="mini-stat-label">\u5224\u6C7A</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${c(m)}</div>
          <div class="mini-stat-label">\u5DF2\u7D22\u5F15</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${u}%</div>
          <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
        </div>
      </div>
      <div class="side-status-list">
        ${h.map(([y,_,L])=>`<div class="side-status-row">
              <span>${g(y,13)}${r(_)}</span>
              ${Qe(L?.status,L?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
            </div>`).join("")}
      </div>
      <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
        Collection\uFF1A${r(t.judgment_vector_collection||"\u2014")} \xB7
        ${$} points \xB7 \u5269\u9918 ${c(b)} \u7B46\u5F85\u7D22\u5F15
      </div>
    </div>
    <div class="side-card-foot">
      PostgreSQL \u5224\u6C7A\u6587\u4EF6\u3001Qdrant \u5411\u91CF\u7D22\u5F15\u8207 llama-server \u6A21\u578B\u72C0\u614B\u7686\u70BA\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u5C31\u7DD2\u6642\u6703\u660E\u78BA\u964D\u7D1A\u3002
    </div>
  </section>`}function tn(e){let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function rs(e){return Math.max(0,Number(e?.duration_ms)||0)}function Qp(e,t){let s=e?.pipeline&&typeof e.pipeline=="object"?e.pipeline:null,a=Array.isArray(s?.stages)?s.stages:[],n=Number(s?.total_ms)||a.reduce((b,d)=>b+rs(d),0),i=Math.max(0,Number(t?.initMs)||0),o=Math.max(0,Number(t?.requestMs)||0),l=Math.max(o,n),m=Math.max(0,l-n),f=[],u=t?.requestStartedAt||e?.checked_at||null,$=t?.requestFinishedAt||e?.checked_at||null;if(i>.5&&f.push({key:"page-init",label:"\u9801\u9762\u521D\u59CB\u5316",caption:"\u5EFA\u7ACB\u670D\u52D9\u7E3D\u89BD\u9AA8\u67B6\u8207\u5C0E\u89BD",color:"#64748b",status:"success",duration_ms:i,started_at:t?.initStartedAt||u,finished_at:u,message:"\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u3001\u8F09\u5165\u6A21\u7D44\u4E26\u6E96\u5099\u8ACB\u6C42\u3002"}),a.length){m>.5&&f.push({key:"http",label:"HTTP \u50B3\u8F38\uFF0F\u6392\u968A",caption:"\u700F\u89BD\u5668 \u2192 FastAPI",color:"#94a3b8",status:"success",duration_ms:m,started_at:u,finished_at:$,message:"\u5305\u542B\u9023\u7DDA\u3001\u8ACB\u6C42\u6392\u968A\u8207\u56DE\u61C9\u50B3\u8F38\u3002"}),f.push(...a);let b=a.reduce((h,y)=>h+rs(y),0),d=Math.max(0,n-b);d>.5&&f.push({key:"server-assemble",label:"\u4F3A\u670D\u5668\u5F59\u6574",caption:"\u72C0\u614B\u56DE\u61C9\u7D44\u88DD",color:"#cbd5e1",status:"success",duration_ms:d,started_at:a[a.length-1]?.finished_at||u,finished_at:$,message:"\u7D44\u88DD\u670D\u52D9\u3001\u8CC7\u6599\u91CF\u8207\u67B6\u69CB payload\u3002"})}else f.push({key:"status-request",label:"GET /api/status",caption:"\u670D\u52D9\u72C0\u614B\u8207\u8CC7\u6599\u91CF",color:"#64748b",status:"success",duration_ms:l,started_at:u,finished_at:$,message:"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF1B\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593\u3002"});return{total_ms:i+l,started_at:t?.initStartedAt||u,finished_at:$,stages:f,server_ms:n,request_ms:l,transport_ms:m,init_ms:i,detailed:!!s}}function Jp(e){let t=e?.page_pipeline,s=Array.isArray(t?.stages)?t.stages:[];if(!t||!s.length)return"";let a=Math.max(0,Number(t.total_ms)||s.reduce((A,I)=>A+rs(I),0)),n=Math.max(a,s.reduce((A,I)=>A+rs(I),0),1),i=1.25,o=s.filter(A=>String(A.status||"success")!=="skipped"),l=s.filter(A=>["success","no_change"].includes(String(A.status||"success"))).length,m=s.filter(A=>A.status==="failed").length,f=s.reduce((A,I)=>rs(I)>rs(A)?I:A,s[0]),u=Math.max(0,Number(t.server_ms)||Number(e?.pipeline?.total_ms)||0),$=Math.max(0,Number(t.transport_ms)||0),b=Math.max(0,Number(t.init_ms)||0),d=s.map(A=>String(A.status||"success")==="skipped"?0:Math.max(rs(A)/n*100,i)),h=d.reduce((A,I)=>A+I,0),y=h>100?100/h:1,_=0,L=s.map((A,I)=>{let re=String(A.status||"success"),Y=re==="skipped",we=A.label||A.key||`\u968E\u6BB5 ${I+1}`,ge=A.caption||"",F=rs(A),j=Y?"\u2014":ue(F),x=n>0?F/n*100:0,R=Y?0:d[I]*y,W=_;Y||(_+=R);let te=A.color||"#64748b",z=re==="failed"?"var(--danger)":te,de=[`is-${re}`,re==="failed"?"is-error":"",Y?"is-missing":""].filter(Boolean).join(" "),xe=R>0?`<span class="rag-wf-bar status-wf-bar is-sequential" style="left:${W.toFixed(3)}%;width:${R.toFixed(4)}%;top:0;height:12px;--bar-color:${r(z)}" aria-hidden="true"></span>`:"",D=Y?"\u7565\u904E":re==="failed"?"\u5931\u6557":"\u5B8C\u6210",ke=`${t.label||"status"}:${A.key||I}`,se=[["\u72C0\u614B",D,!0],["\u958B\u59CB",A.started_at?ve(A.started_at):"\u2014",!0],["\u7D50\u675F",A.finished_at?ve(A.finished_at):"\u2014",!0],["\u8017\u6642",j,!0],["\u5360\u6574\u9AD4",tn(x),!0],["\u8AAA\u660E",A.message||"",!1]].map(([je,_e,oe])=>oe||_e?`<span class="rag-wf-detail"><span>${r(je)}</span><strong>${r(String(_e||"\u2014"))}</strong></span>`:"").join("");return`<details class="rag-wf-stage status-wf-stage ${de}" data-status-wf-stage="${r(ke)}"${qr.has(ke)?" open":""} style="--stage-color:${r(te)}">
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="status-wf-step">${String(I+1).padStart(2,"0")}</span> ${r(we)}</strong>${ge?`<small>${r(ge)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(j)} \xB7 ${r(D)} <span class="rag-wf-chevron">${g("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${we}\uFF1A${D}\uFF0C\u8017\u6642 ${j}\uFF0C\u5360\u6574\u9AD4 ${tn(x)}`)}">${xe}</span>
        </summary>
        <div class="rag-wf-details">${se}</div>
      </details>`}).join(""),S=t.detailed?"\u5F8C\u7AEF /api/status \u968E\u6BB5\u660E\u7D30":"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF0C\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593";return`<section class="report-card status-wf-card" data-status-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${g("activity",14)}\u670D\u52D9\u7E3D\u89BD\u8F09\u5165 Pipeline</span>
      <div class="index-runtime-metrics">
        <span class="index-runtime-metric" title="\u672C\u6B21\u9801\u9762\u521D\u59CB\u5316\u5230\u72C0\u614B\u56DE\u61C9\u5B8C\u6210\u7684\u7E3D\u6642\u9593\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(ue(a))}</strong></span>
        <span class="index-runtime-metric" title="\u5F8C\u7AEF /api/status \u6AA2\u67E5\u968E\u6BB5\u7684\u5408\u8A08\u6642\u9593\u3002"><span>Server</span><strong>${r(ue(u))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u8ACB\u6C42\u6642\u9593\u6263\u6389\u5F8C\u7AEF\u6AA2\u67E5\u5F8C\u7684\u50B3\u8F38\u8207\u6392\u968A\u6642\u9593\u3002"><span>HTTP \u50B3\u8F38</span><strong>${r(ue($))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u9AA8\u67B6\u8207\u8F09\u5165\u6A21\u7D44\u7684\u6642\u9593\u3002"><span>\u9801\u9762\u521D\u59CB\u5316</span><strong>${r(ue(b))}</strong></span>
        <span class="index-runtime-metric" title="\u8017\u6642\u6700\u9577\u7684\u6AA2\u67E5\u968E\u6BB5\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${f?.label||"\u2014"} \xB7 ${ue(rs(f))}`)}</strong></span>
        <span class="index-runtime-metric" title="\u5B8C\u6210\u7684\u6AA2\u67E5\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\uFF1B\u5931\u6557\u968E\u6BB5\u6703\u4EE5\u7D05\u8272\u6A19\u793A\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${c(l)} / ${c(s.length)}${m?` \xB7 \u5931\u6557 ${c(m)}`:""}</strong></span>
      </div>
    </div>
    <div class="status-wf-summary">
      <span>\u6AA2\u67E5 <strong>${r(ve(e.checked_at))}</strong></span>
      <span>API <strong class="mono">${r(cs())}</strong></span>
      <span>\u7248\u672C <strong class="mono">v${r(e.version||"\u2014")}</strong></span>
      <span>\u74B0\u5883 <strong>${r(e.environment||"\u2014")}</strong></span>
      <span>${r(S)}</span>
    </div>
    <div class="status-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${r(ue(a))}</span>
      </div>
      <div class="rag-wf-legend workflow-wf-legend" aria-label="\u968E\u6BB5\u72C0\u614B\u5716\u4F8B">
        <span><i class="is-solid-state"></i>\u5B8C\u6210</span>
        <span><i class="is-failed-state"></i>\u5931\u6557</span>
        <span><i class="is-empty-state"></i>\u7565\u904E</span>
      </div>
      <div class="rag-wf-stages">${L}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u986F\u793A\u672C\u6B21\u958B\u555F\u670D\u52D9\u7E3D\u89BD\u7684\u9801\u9762\u521D\u59CB\u5316\u3001HTTP \u5F80\u8FD4\u3001\u5F8C\u7AEF\u6AA2\u67E5\u8207\u56DE\u61C9\u5F59\u6574\u3002\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u5931\u6557\u968E\u6BB5\u4EE5\u7D05\u8272\u6A19\u793A\uFF0C\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\uFF1B\u6975\u77ED\u968E\u6BB5\u4FDD\u7559\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function Wp(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=Pp(e.status),n=s.find(f=>f.id==="qdrant"),i=s.find(f=>f.id==="rag"),o=s.find(f=>f.id==="llm"),l=Et(),m=Zo[l]||l;return`<section class="status-hero">
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
          <span>${g("clock",11)} \u6AA2\u67E5\u6642\u9593 ${ve(e.checked_at)} \xB7 ${r(Js(e.checked_at))}</span>
          <span>${g("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${g("database",11)} ${c(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${g("layers",11)} ${c(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${r(m)}">${g("link",11)} ${r(cs())}</span>
        </div>
      </div>
    </section>

    ${Jp(e)}

    <div class="service-grid">${s.map(Ip).join("")}</div>

    ${Gp(e)}

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

    ${n?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${De({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${r(n?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${r(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${r(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}`}function Vp(e){let t=Array.isArray(e.services)?e.services:[],s=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Pipelines \u2192 Data \xB7 \u6700\u65B0\u5C08\u6848\u5143\u4EF6\u8207\u5373\u6642\u5065\u5EB7\u72C0\u614B</div>
      </div>
      <span class="badge badge-neutral badge-mono">${c((s.flow||[]).length)} layers</span>
    </div>
    ${Bp(s,t)}
  </div>`}function Kp(e){let t=Array.isArray(e.endpoints)?e.endpoints:[],s=Et(),a=Zo[s]||s,n=lt("/api/docs"),i=lt("/api/openapi.json"),o=new Set(t.map(f=>tl(f.path).id)),l=t.reduce((f,u)=>{let $=String(u.method||"GET").toUpperCase();return f[$]=(f[$]||0)+1,f},{}),m=["GET","POST","PATCH","PUT","DELETE"].filter(f=>l[f]).map(f=>`${f} ${c(l[f])}`).join(" \xB7 ");return`<section class="status-hero api-endpoint-hero">
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
          <span>${g("server",11)} API Base <span class="mono">${r(cs())}</span>\uFF08${r(a)}\uFF09</span>
          <span>${g("terminal",11)} ${r(m||"\u2014")}</span>
          <span>${g("clock",11)} \u66F4\u65B0\u6642\u9593 ${ve(e.checked_at)}</span>
        </div>
      </div>
      <div class="api-endpoint-actions">
        <a class="btn btn-secondary btn-sm" href="${r(n)}" target="_blank" rel="noopener noreferrer">${g("external",13)}<span>Swagger UI</span></a>
        <a class="btn btn-ghost btn-sm" href="${r(i)}" target="_blank" rel="noopener noreferrer">OpenAPI JSON ${g("external",11)}</a>
      </div>
    </section>
    ${zp(t)}
    <p class="status-footnote">\u7AEF\u9EDE\u7531 FastAPI route table \u52D5\u614B\u7522\u751F\uFF1B\u4E92\u52D5\u5F0F\u6587\u4EF6\u4F4D\u65BC <a href="${r(n)}" target="_blank" rel="noopener noreferrer"><code>${r(n)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${r(i)}" target="_blank" rel="noopener noreferrer"><code>${r(i)}</code></a>\u3002\u7AEF\u9EDE\u8B8A\u66F4\u5F8C\u91CD\u65B0\u6574\u7406\u6B64\u9801\u5373\u53EF\u53D6\u5F97\u6700\u65B0\u6E05\u55AE\u3002</p>`}function Yp(e,t={}){let s=e.data||{},a=t.info||null,n=a?.counts||{},i=Number(s.judgment_indexed_count||0),o=Number(s.judgment_count||0),l=Number(s.judgment_index_remaining??Math.max(0,o-i)),m=Number(s.judgment_index_pending??l)||0,f=Number(s.judgment_index_changed||0),u=Number(s.judgment_index_stale||0),$=o>0?Math.max(0,Math.min(100,i/o*100)):null,b=tn($),d=s.judgment_index_fresh===!1||m>0||String(s.judgment_index_staleness?.status||"")==="stale",h=d?"is-warn":"",y=s.last_version||{},_=s.last_run||{},L=y.source_type==="law"?"\u6CD5\u898F":y.source_type==="order"?"\u547D\u4EE4":"\u2014",S=y.version_code?String(y.version_code):y.id?`#${c(y.id)}`:"\u2014",A=Number(s.legal_article_indexed_count||s.legal_index?.points_count||0),I=Number(s.legal_article_count||s.legal_index?.article_count||0),re=I>0?Math.max(0,Math.min(100,A/I*100)):null,Y=s.legal_article_stale===!0||String(s.legal_index?.status||"")==="stale",we=Y?"is-warn":"",ge=s.judgment_vector_alias||"\u2014",F=s.judgment_vector_collection||"\u2014",j=s.legal_article_vector_alias||s.legal_index?.alias||"\u2014",x=s.legal_article_vector_collection||s.legal_index?.collection||"\u2014",R=d?"\u5224\u6C7A\u7D22\u5F15\u5F85\u66F4\u65B0":"\u8CC7\u6599\u7248\u672C\u4E00\u81F4",W=d?`\u5224\u6C7A\u7D22\u5F15\u5C1A\u7F3A ${c(m)} \u7B46`:"\u5224\u6C7A\u8CC7\u6599\u8207\u5411\u91CF\u7D22\u5F15\u4E00\u81F4",te=d?`PostgreSQL \u76EE\u524D\u6709 ${c(o)} \u7B46\u5224\u6C7A\uFF0CQdrant ${F} \u5DF2\u7D22\u5F15 ${c(i)} \u7B46\uFF1B\u5C1A\u6709 ${c(m)} \u7B46\u5F85\u7D22\u5F15\u3002`:"PostgreSQL \u8207 Qdrant \u5224\u6C7A\u7B46\u6578\u4E00\u81F4\uFF1B\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u8207\u7D22\u5F15\u72C0\u614B\u540C\u6B65\u3002",z=Ct(_.status||"idle").label,de=_.finished_at||_.started_at;return`<section class="status-hero data-version-hero">
      <div class="status-hero-main">
        <div class="overall-row">
          <span class="overall-badge ${h}">
            <span class="status-dot ${d?"is-warn":"is-ok"}" aria-hidden="true"></span>
            ${r(R)}
          </span>
          <span class="badge badge-neutral badge-mono">${c(s.version_count)} \u500B\u8CC7\u6599\u7248\u672C</span>
          <span class="badge badge-neutral">${r(L)} \u6700\u65B0\u7248\u672C ${r(S)}</span>
        </div>
        <h2 class="status-headline">${r(W)}</h2>
        <p class="status-copy">${r(te)}</p>
        <div class="status-meta">
          <span>${g("clock",11)} \u6AA2\u67E5\u6642\u9593 ${ve(e.checked_at)}</span>
          <span>${g("database",11)} \u73FE\u884C\u8CC7\u6599 ${c(s.total_current)} \u7B46</span>
          <span>${g("layers",11)} \u539F\u59CB Parquet ${c(s.parquet_files)} \u500B \xB7 ${Le(s.parquet_bytes)}</span>
          <span title="Qdrant alias \u8207\u76EE\u524D\u7248\u672C collection">${g("link",11)} <span class="mono">${r(ge)} \u2192 ${r(F)}</span></span>
        </div>
      </div>
      <div class="data-version-ring ${h}" style="--coverage:${$===null?0:$.toFixed(1)}%">
        <div class="data-version-ring-inner">
          <strong>${b}</strong>
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
        <div class="metric-foot">${c(s.parquet_files)} \u500B\u539F\u59CB Parquet \xB7 ${Le(s.parquet_bytes)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u5224\u6C7A\u6587\u4EF6</div>
        <div class="metric-value">${c(s.judgment_count)}</div>
        <div class="metric-foot">PostgreSQL current</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Qdrant \u5224\u6C7A\u5411\u91CF\u7D22\u5F15</div>
        <div class="metric-value">${c(s.judgment_indexed_count)}</div>
        <div class="metric-foot">${b} \xB7 \u5269\u9918 ${c(m)} \u7B46</div>
      </div>
    </div>

    <div class="status-columns data-version-grid">
      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${g("database",14)}PostgreSQL \u8CC7\u6599\u7248\u672C</span>
          ${Qe(y.is_current?"operational":"degraded",y.is_current?"CURRENT":"HISTORY")}
        </div>
        ${y.id?`<div class="index-current-row">
                <span class="badge badge-info">${g("activity",11)}${r(L)} ${r(S)}</span>
                <strong class="mono">${ve(y.downloaded_at)}</strong>
                <span class="index-current-copy" title="${r(y.parquet_path||"")}">${r(y.parquet_path||"\u2014")}</span>
              </div>
              <div class="data-version-facts">
                ${ze("\u8CC7\u6599\u7248\u672C\u7E3D\u6578",c(s.version_count),{mono:!0})}
                ${ze("\u4E0B\u8F09\u57F7\u884C\u7E3D\u6578",c(s.run_count),{mono:!0})}
                ${ze("\u7248\u672C ID",`#${c(y.id)}`,{mono:!0})}
                ${ze("\u8CC7\u6599\u985E\u578B",L)}
                ${ze("\u4F86\u6E90\u66F4\u65B0\u65E5",y.update_date||"\u2014")}
                ${ze(`${L}\uFF0F\u689D\u6587`,`${c(y.law_count)} / ${c(y.article_count)}`)}
                ${ze("\u4E0B\u8F09\u6642\u9593",ve(y.downloaded_at),{mono:!0})}
                ${ze("\u8CC7\u6599\u72C0\u614B",y.is_current?"current":"history",{mono:!0})}
                ${ze("Parquet \u6A94\u6848",y.parquet_path||"\u2014",{mono:!0,wide:!0})}
              </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${g("browser",14)}IndexedDB \u672C\u6A5F\u8CC7\u6599</span>
          <span class="badge ${a?.available?"badge-ok":"badge-neutral"} badge-mono">${r(a?.mode==="memory"?"MEMORY":a?"INDEXEDDB":"LOADING")}</span>
        </div>
        ${a?`<div class="index-current-row">
                <span class="badge badge-info">${g("database",11)}${r(a.name||"judgment-console")} v${c(a.version)}</span>
                <strong class="mono">${c(a.total)} \u7B46</strong>
                <span class="index-current-copy">${c(n.query_history)} \u5247\u63D0\u554F \xB7 ${c(n.audit_events)} \u7B46\u7A3D\u6838 \xB7 ${c(n.settings)} \u9805\u8A2D\u5B9A</span>
              </div>
              <div class="data-version-facts">
                ${ze("Schema \u7248\u672C",`v${c(a.version)}`,{mono:!0})}
                ${ze("\u5132\u5B58\u6A21\u5F0F",a.mode||"\u2014",{mono:!0})}
                ${ze("query_history",`${c(n.query_history)} / ${c(a.caps?.history)}`,{mono:!0})}
                ${ze("audit_events",`${c(n.audit_events)} / ${c(a.caps?.audit)}`,{mono:!0})}
                ${ze("settings",c(n.settings),{mono:!0})}
                ${ze("\u7E3D\u7D00\u9304\u6578",c(a.total),{mono:!0})}
                ${ze("\u5DF2\u7528\u5BB9\u91CF",Le(a.usage_bytes),{mono:!0})}
                ${ze("\u53EF\u7528\u914D\u984D",Le(a.quota_bytes),{mono:!0})}
              </div>
              <p class="data-version-note">${g("info",12)}
                IndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u7AEF\u63D0\u554F\u6B77\u53F2\u3001\u8A2D\u5B9A\u8207\u7248\u672C\u7A3D\u6838\u4E8B\u4EF6\uFF1B\u4F3A\u670D\u5668\u8CC7\u6599\u4EE5 PostgreSQL \u8207 Parquet \u70BA\u6E96\u3002
              </p>`:`<div class="report-empty-inline">${t.loading||!t.error?"\u6B63\u5728\u8B80\u53D6\u700F\u89BD\u5668 IndexedDB\u2026":r(t.error?.message||"IndexedDB \u5C1A\u7121\u8CC7\u6599\u6216\u7121\u6CD5\u8B80\u53D6\u3002")}</div>`}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${g("brain",14)}Qdrant \u5224\u6C7A\u5411\u91CF\u7D22\u5F15</span>
          ${Qe(d?"degraded":"operational",d?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${g("link",11)}Alias</span>
          <strong class="mono">${r(ge)}</strong>
          <span class="mono">\u2192 ${r(F)}</span>
          <span class="index-current-copy">v#${c(s.judgment_vector_version_id)} \xB7 ${r(s.judgment_vector_model||"\u2014")}</span>
        </div>
        ${Ko("\u7D22\u5F15\u8986\u84CB",$,`\u5DF2\u7D22\u5F15 ${c(i)} / ${c(o)} \u7B46 \xB7 \u5269\u9918 ${c(m)} \u7B46`,h)}
        <div class="data-version-facts">
          ${ze("Qdrant points",c(s.judgment_vector_points),{mono:!0})}
          ${ze("\u7D22\u5F15\u7248\u672C",`#${c(s.judgment_vector_version_id)} \xB7 ${s.judgment_vector_version_status||"legacy"}`,{mono:!0})}
          ${ze("\u524D\u4E00\u7248\u672C",s.judgment_vector_previous_version_id?`#${c(s.judgment_vector_previous_version_id)}`:"\u2014",{mono:!0})}
          ${ze("\u5F85\u88DC\uFF0F\u8B8A\u66F4\uFF0F\u5931\u6548",`${c(m)} / ${c(f)} / ${c(u)}`)}
          ${ze("\u6700\u8FD1\u7D22\u5F15",ve(s.judgment_indexed_at),{mono:!0})}
          ${ze("\u6A21\u578B",s.judgment_vector_model||"\u2014",{mono:!0})}
        </div>
        ${m>0?`<p class="data-version-note is-warn">${g("info",12)}\u5C1A\u6709 ${c(m)} \u7B46\u5224\u6C7A\u5C1A\u672A\u7D22\u5F15\uFF1B\u8ACB\u81F3\u300C\u8CC7\u6599\u8655\u7406 \u2192 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u63A5\u7E8C\u88DC\u9F4A\u3002</p>`:""}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${g("shield",14)}Qdrant \u6CD5\u898F\uFF0F\u547D\u4EE4\u5411\u91CF\u7D22\u5F15</span>
          ${Qe(Y?"degraded":"operational",Y?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${g("link",11)}Alias</span>
          <strong class="mono">${r(j)}</strong>
          <span class="mono">\u2192 ${r(x)}</span>
          <span class="index-current-copy">v#${c(s.legal_article_vector_version_id||s.legal_index?.version_id)}</span>
        </div>
        ${Ko("\u689D\u6587\u7D22\u5F15\u8986\u84CB",re,`\u5DF2\u7D22\u5F15 ${c(A)} / ${c(I)} \u689D`,we)}
        <div class="data-version-facts">
          ${ze("Qdrant points",c(A),{mono:!0})}
          ${ze("\u73FE\u884C\u689D\u6587",c(I),{mono:!0})}
          ${ze("\u5411\u91CF\u7DAD\u5EA6",c(s.legal_index?.dimension),{mono:!0})}
          ${ze("\u6700\u8FD1\u7D22\u5F15",ve(s.legal_article_indexed_at||s.legal_index?.indexed_at),{mono:!0})}
          ${ze("\u7D22\u5F15\u72C0\u614B",Y?"stale":"fresh",{mono:!0})}
          ${ze("Collection",x,{mono:!0})}
        </div>
      </section>

      <section class="card data-version-card is-wide-grid">
        <div class="side-card-head">
          <span class="side-card-title">${g("folder",14)}Parquet \u8207\u57F7\u884C\u72C0\u614B</span>
          <span class="badge badge-neutral badge-mono">${c(s.parquet_files)} FILES</span>
        </div>
        <div class="data-version-facts">
          ${ze("\u539F\u59CB Parquet \u6A94\u6848",c(s.parquet_files),{mono:!0})}
          ${ze("\u5408\u8A08\u5BB9\u91CF",Le(s.parquet_bytes),{mono:!0})}
          ${ze("PostgreSQL \u73FE\u884C\u8CC7\u6599",c(s.total_current),{mono:!0})}
          ${ze("\u8CC7\u6599\u7248\u672C\u7E3D\u6578",c(s.version_count),{mono:!0})}
          ${ze("\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C",_.status?z:"\u2014")}
          ${ze("\u6700\u8FD1\u57F7\u884C\u6642\u9593",de?ve(de):"\u2014",{mono:!0})}
          ${ze("\u6700\u8FD1\u57F7\u884C\u8017\u6642",_.duration_ms?ue(_.duration_ms):"\u2014",{mono:!0})}
          ${ze("\u6700\u8FD1\u57F7\u884C\u7248\u672C",_.version_id?`#${c(_.version_id)}`:"\u2014",{mono:!0})}
        </div>
        <p class="data-version-note">${g("info",12)}
          \u539F\u59CB Parquet \u4FDD\u7559 raw\uFF0Fdelta \u8207 manifest\uFF1BPostgreSQL \u63D0\u4F9B current metadata \u8207\u7248\u672C\u72C0\u614B\uFF1BQdrant \u53EA\u4FDD\u5B58\u5411\u91CF\u8207 payload\u3002
        </p>
      </section>
    </div>`}function Xp(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${g("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${c(t.run_count)} TOTAL</span>
    </div>
    ${Up(e.recent_runs)}
  </section>`}function Zp(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function sl(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function xs(e,t,s,a,n){let i=Zp(n);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${g(t,14)}${r(e)}</span>
      <strong>${r(s)}</strong>
    </div>
    ${sl(n,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function em(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${g("layers",14)}Docker</span>
        ${Qe("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${r(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,m=o.service?0:1;return l-m||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${r(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${r(i.service)}</span>`:""}</td>
        <td>${Qe(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
        <td class="cell-number">${i.cpu_percent===null||i.cpu_percent===void 0?"\u2014":`${c(i.cpu_percent)}%`}</td>
        <td class="cell-number">${Le(i.memory_used)}${i.memory_limit?` / ${Le(i.memory_limit)}`:""}</td>
        <td class="mono">${r(i.net_io||"\u2014")}</td>
        <td class="mono">${r(i.block_io||"\u2014")}</td>
        <td class="cell-number">${c(i.pids)}</td>
      </tr>`).join(""),n=(t.system||[]).map(i=>`<span class="resource-docker-pill">
        <strong>${r(i.type||"\u2014")}</strong>
        <span>${c(i.count)} \xB7 ${r(i.size||"\u2014")}</span>
      </span>`).join("");return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${g("layers",14)}Docker \u5BB9\u5668\u4F7F\u7528\u8CC7\u6E90</span>
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
  </section>`}function tm(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",n=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${ns("\u8CC7\u6599\u5EAB",`<code>${r(s.database||"\u2014")}</code>`)}
           ${ns("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${Le(s.storage_bytes)}</strong>`)}
           ${ns("Docker volume",`<strong>${Le(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${ns("\u9023\u7DDA\u6578",`<strong>${c(s.connections)}</strong>`)}`:`${ns("Collection",`<code>${r(s.collection||"\u2014")}</code>`)}
           ${ns("Docker volume",`<strong>${Le(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${ns("\u5411\u91CF\u9EDE\u6578",`<strong>${c(s.points_count)}</strong>`)}
           ${ns("Collections",`<strong>${c(s.collections)}</strong>`)}
           ${ns("Segments",`<strong>${c(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${r(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${r(s.kind||"")}</div>
          </div>
          ${Qe(i)}
        </div>
        <div class="resource-db-metrics">
          <div><span>CPU</span><strong>${s.cpu_percent===null||s.cpu_percent===void 0?"\u2014":`${c(s.cpu_percent)}%`}</strong></div>
          <div><span>RAM</span><strong>${Le(s.memory_used)}</strong><small>${s.memory_limit?` / ${Le(s.memory_limit)}`:""}</small></div>
          <div><span>\u5BB9\u5668</span><strong class="mono">${r(s.container||"\u2014")}</strong><small>${r(s.container_status||"\u2014")}</small></div>
        </div>
        <div class="detail-list">${o}</div>
        ${n.length?`<div class="resource-table-wrap">
                <table class="data-table is-compact">
                  <thead><tr><th scope="col">\u8CC7\u6599\u8868</th><th scope="col">\u5927\u5C0F</th></tr></thead>
                  <tbody>${n.map(l=>`<tr>
                        <td class="mono">${r(l.name||"\u2014")}</td>
                        <td class="cell-number">${Le(l.bytes)}</td>
                      </tr>`).join("")}</tbody>
                </table>
              </div>`:""}
        <div class="side-card-foot">${r(s.detail||"")}</div>
      </article>`}).join("")}</div>`}function Bs(e,t,s,a){let n=Number(t)||0,i=a?n/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${r(e)}</span>
      <strong>${Le(n)}</strong>
    </div>
    ${sl(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function sm(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},n=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},m=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${g("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${Le(m)}</span>
    </div>
    <div class="storage-list">
      ${Bs("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${r(s.frontend_path||"\u2014")}</span>`,m)}
      ${Bs("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${r(s.backend_path||"\u2014")}</span>`,m)}
      ${Bs("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",n.layers_bytes,`Images ${Le(n.images_bytes)} \xB7 Containers ${Le(n.containers_bytes)} \xB7 Build cache ${Le(n.build_cache_bytes)}`,m)}
      ${Bs("PostgreSQL volume",o.size_bytes,`<span class="mono">${r(o.name||"\u2014")}</span>`,m)}
      ${Bs("Qdrant volume",l.size_bytes,`<span class="mono">${r(l.name||"\u2014")}</span>`,m)}
      ${Bs("Parquet",a.total_bytes,`\u6CD5\u898F ${Le(a.law_bytes)} \xB7 \u5224\u6C7A ${Le(a.judgment_bytes)}`,m)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${Le(m)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function am(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},n=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),m=Array.isArray(e.disk)?e.disk:[],f=m[0]||{},u=Number(o.total_bytes||f.total||0),$=u?l/u*100:0,b=[s.load_1,s.load_5,s.load_15].map(y=>y??"\u2014").join(" / "),d=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":ue(Number(t.uptime_seconds)*1e3),h=[f.label?xs("HDD \u5DF2\u4F7F\u7528","database",`${c(f.percent)}%`,`${Le(f.used)} / ${Le(f.total)} \xB7 \u5269\u9918 ${Le(f.free)}<br><span class="mono">${r(f.path||"")}</span>`,f.percent):"",l?xs("Judgment \u5143\u4EF6\u5408\u8A08","layers",Le(l),`\u7D04\u5360 HDD ${c($)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,$):"",...m.slice(1).map(y=>xs(`\u786C\u789F \xB7 ${y.label}`,"layers",`${c(y.percent)}%`,`${Le(y.used)} / ${Le(y.total)} \xB7 \u5269\u9918 ${Le(y.free)}<br><span class="mono">${r(y.path||"")}</span>`,y.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${ve(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${xs("CPU \u4F7F\u7528\u7387","cpu",`${c(s.percent)}%`,`${c(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${c(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${r(b)}`,s.percent)}
      ${xs("\u8A18\u61B6\u9AD4","server",`${c(a.percent)}%`,`${Le(a.used)} / ${Le(a.total)} \xB7 \u53EF\u7528 ${Le(a.available)}`,a.percent)}
      ${xs("Swap","layers",`${c(n.percent)}%`,`${Le(n.used)} / ${Le(n.total)}`,n.percent)}
      ${xs("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${c(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${r(d)}<br>${r(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${h||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${sm(e)}
    ${em(e)}
    ${tm(e)}`}function Yo(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function nm(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SYSTEM RESOURCE USAGE</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${De({tone:"danger",title:"\u8CC7\u6E90 API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-resources-retry">
          ${g("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function rm(e){return e.status==="operational"?{label:"\u5DF2\u9023\u7DDA",badge:"badge-ok"}:{label:"\u7121\u6CD5\u9023\u7DDA",badge:"badge-danger"}}function im(e,t){let s=rm(e),a=Array.isArray(e.models)?e.models:[],n=a.length?a.map(i=>{let o=String(i.name||""),l=e.chat_model===o,m=e.embedding_model===o,f=i.size?Le(i.size):"",u=i.modified_at?ve(i.modified_at):"",$=new Set((i.capabilities||[]).map(d=>String(d||"").toLowerCase())),b=[];return i.supports_chat===!0&&b.push(["Chat","badge-ok"]),$.has("embedding")&&b.push(["Embedding","badge-info"]),$.has("vision")&&b.push(["Vision","badge-neutral"]),$.has("tools")&&b.push(["Tools","badge-neutral"]),$.has("thinking")&&b.push(["Thinking","badge-neutral"]),$.has("speech")&&b.push(["Speech","badge-warn"]),i.is_reranker&&b.push(["Reranker","badge-neutral"]),b.length||b.push([i.capability_status==="untested"?"\u672A\u6E2C\u8A66":"\u7121 chat \u80FD\u529B","badge-neutral"]),`<div class="ollama-model-row">
            <div class="ollama-model-main">
              <strong>${r(o)}</strong>
              <span class="ollama-model-meta">${[f,u].filter(Boolean).map(d=>r(d)).join(" \xB7 ")||"\u2014"}</span>
              <div class="ollama-model-capabilities">${b.map(([d,h])=>`<span class="badge ${h}">${r(d)}</span>`).join("")}</div>
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
  </article>`}function om(e,t,s,a){if(s)return`<div class="report-card">
      ${De({tone:"danger",title:"Model Provider \u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
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
      ${t?'<div class="ollama-loading"><span class="spinner"></span><span>\u8B80\u53D6 llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span></div>':i.length?`<div class="ollama-host-list">${i.map(f=>im(f,a)).join("")}</div>`:ct({iconName:"server",title:"\u5C1A\u672A\u8A2D\u5B9A llama-server \u4E3B\u6A5F",text:"\u8ACB\u5728\u4E0A\u65B9\u8F38\u5165\u7DB2\u5740\u8207 Port \u65B0\u589E\uFF0C\u6216\u4F7F\u7528 .env \u7684\u9810\u8A2D\u9023\u7DDA\u3002"})}
      <p class="report-sub" style="margin-top:12px">\u8A2D\u70BA\u804A\u5929\u6216\u5D4C\u5165\u6A21\u578B\u5F8C\uFF0C\u7CFB\u7D71\u6703\u4F7F\u7528\u76EE\u524D\u4E3B\u6A5F\u7684\u5C0D\u61C9\u6A21\u578B\u57F7\u884C AI \u51FA\u984C\u8207 RAG\uFF1B\u672A\u8A2D\u5B9A\u6642\u6CBF\u7528 .env \u7684 LLM_MODEL\uFF0FEMBEDDING_MODEL\u3002</p>
    </div>
  </div>`}function lm(e,t,s){let a=e?.data||{},n=e?Ct(e.status):null,i=s?Ct(s.status):null,o={overview:n?`<span class="badge ${n.tone==="ok"?"badge-ok":n.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(n.label)}</span>`:"",resources:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(i.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${c(a.version_count)}</span>`,tests:'<span class="badge badge-neutral badge-mono">TEST</span>',"local-model":'<span class="badge badge-neutral badge-mono">LLAMA-SERVER</span>',runs:`<span class="badge badge-neutral badge-mono">${c(a.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${el.map(l=>{let m=l.id===t;return`<button class="status-tab${m?" is-active":""}" type="button"
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
      <span class="mono">${r(e?ve(e.checked_at):"\u2014")}</span>
    </div>`}function cm(e,t,s,a,n,i,o){if(e==="resources")return s?am(s):a?Yo():n?nm(n):Yo();if(e==="local-model"){let l=i||{},m=!!l.loading||!l.hosts&&!l.error;return om(l.hosts||null,m,l.error||null,l.editingId||null)}return e==="architecture"?Vp(t):e==="api"?Kp(t):e==="data"?Yp(t,o):e==="runs"?Xp(t):Wp(t)}function dm(){return`<div class="status-hero">
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
    </div>`}function Xo(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u5FEB\u53D6\u6216\u63A8\u6E2C\u7684\u670D\u52D9\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${De({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${g("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function um(e,t){let s=!1,a=null,n=null,i="overview",o=null,l=!1,m=null,f=null,u=!1,$=null,b=null,d=null,h=!1,y=null,_=!1,L=!1,S=null,A=0,I="",re="",Y=performance.now(),we=new Date().toISOString(),ge=!1;e.innerHTML=`<section class="page status-page">
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
      <section class="status-panel" id="status-content">${dm()}</section>
    </div>
  </section>`;let F=e.querySelector("#status-nav"),j=e.querySelector("#status-content"),x=e.querySelector("#refresh-status"),R=e.querySelector("#auto-refresh"),W=()=>{if(A+=1,typeof S=="function")try{S()}catch{}S=null,_=!1,L=!1},te=async()=>{let oe=++A;L=!0,re="",j.innerHTML="";try{let ie=await Ar(j,{setTitle:()=>{}},{embedded:!0});if(oe!==A||i!=="tests"){typeof ie=="function"&&ie();return}S=typeof ie=="function"?ie:null,_=!0}catch(ie){oe===A&&i==="tests"&&(j.innerHTML=Xo(ie))}finally{oe===A&&(L=!1)}},z=()=>{if(!n)return;let oe=lm(n,i,o);if(oe!==I&&(F.innerHTML=oe,I=oe),i==="tests"){!_&&!L&&te();return}W();let ie=cm(i,n,o,l,m,{hosts:f,loading:u,error:$,editingId:b},{info:d,loading:h,error:y});ie!==re&&(j.innerHTML=ie,re=ie)},de=async({quiet:oe=!1}={})=>{if(!l){l=!0,m=null,i==="resources"&&!o&&z();try{let ie=await K.systemUsage();if(s)return;o=ie}catch(ie){if(s)return;m=ie,oe||P(ie.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{s||(l=!1,i==="resources"&&z())}}},xe=async({quiet:oe=!1}={})=>{if(!h){h=!0,y=null,i==="data"&&!d&&z();try{let ie=await yi();if(s)return;d=ie}catch(ie){if(s)return;y=ie,oe||P(ie.message||"\u7121\u6CD5\u8B80\u53D6 IndexedDB\u3002","danger")}finally{s||(h=!1,i==="data"&&z())}}},D=async({quiet:oe=!1}={})=>{if(!u){u=!0,$=null,i==="local-model"&&!f&&z();try{let ie=await K.ollamaHosts();if(s)return;f=ie}catch(ie){if(s)return;$=ie,oe||P(ie.message||"\u7121\u6CD5\u53D6\u5F97 llama-server \u4E3B\u6A5F\u3002","danger")}finally{s||(u=!1,i==="local-model"&&z())}}},ke=async()=>{await D({quiet:!0}),await se({quiet:!0})},se=async({quiet:oe=!1,status:ie=null}={})=>{oe||(x.disabled=!0,Me(x,!0,"\u6AA2\u67E5\u4E2D\u2026"));let he=performance.now(),fe=new Date().toISOString(),Ae=he,$e=fe;try{let Pe=ie||await K.status();if(Ae=performance.now(),$e=new Date().toISOString(),s)return;let Ue=!ie&&!ge?Math.max(0,he-Y):0;Pe.page_pipeline=Pe.pipeline||!n?.page_pipeline?Qp(Pe,{initMs:Ue,initStartedAt:we,requestStartedAt:fe,requestFinishedAt:$e,requestMs:Ae-he}):n.page_pipeline,ge=!0,n=Pe,z(),oe||P("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(Pe){if(s)return;i!=="tests"&&(re="",j.innerHTML=Xo(Pe)),oe||P(Pe.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(x.disabled=!1,Me(x,!1))}},je=async({quiet:oe=!1,status:ie=null}={})=>{if(await se({quiet:oe,status:ie}),i==="resources"&&await de({quiet:oe}),i==="local-model"&&await D({quiet:oe}),!oe&&i==="tests"){let he=j.querySelector("#tests-refresh");he&&he.click()}};F.addEventListener("click",oe=>{let ie=oe.target.closest("[data-status-tab]");if(!ie)return;let he=ie.dataset.statusTab;el.some(fe=>fe.id===he)&&(i=he,z(),i==="resources"&&!o&&!l&&de(),i==="data"&&!d&&!h&&xe(),i==="local-model"&&D())}),j.addEventListener("click",oe=>{oe.target.closest("#status-retry")&&se(),oe.target.closest("#status-resources-retry")&&de()}),j.addEventListener("click",async oe=>{let ie=oe.target.closest("[data-ollama-action]");if(!ie)return;let he=ie.dataset.ollamaAction,fe=Number(ie.dataset.id||0);if(he==="refresh-hosts"){await D();return}if(he==="edit-host"){b=fe,z(),e.querySelector(".ollama-host-form")?.scrollIntoView({behavior:"smooth",block:"center"});return}if(he==="cancel-host-edit"){b=null,z();return}if(he==="delete-host"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 llama-server \u4E3B\u6A5F #${fe}\uFF1F`))return;try{await K.deleteOllamaHost(fe),Number(b)===fe&&(b=null),P("llama-server \u4E3B\u6A5F\u5DF2\u522A\u9664\u3002","info"),await ke()}catch(Ae){P(Ae.message||"\u522A\u9664\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(he==="activate-host"){try{await K.activateOllamaHost(fe),P("\u5DF2\u5207\u63DB\u4F7F\u7528\u7684 llama-server \u4E3B\u6A5F\u3002","ok"),await ke()}catch(Ae){P(Ae.message||"\u5207\u63DB\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(he==="deactivate-host"){try{await K.deactivateOllamaHosts(),P("\u5DF2\u505C\u7528\u6307\u5B9A\u7684 llama-server \u4E3B\u6A5F\uFF0C\u5C07\u6CBF\u7528 .env \u8A2D\u5B9A\u3002","info"),await ke()}catch(Ae){P(Ae.message||"\u505C\u7528\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(he==="check-capabilities"){Me(ie,!0,"\u6AA2\u67E5\u4E2D\u2026");try{await K.checkOllamaCapabilities(),P("\u5DF2\u66F4\u65B0\u6240\u6709\u4E3B\u6A5F\u7684\u6A21\u578B\u80FD\u529B\u3002","ok",4e3),await ke()}catch(Ae){P(Ae.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u80FD\u529B\u3002","danger",7e3)}finally{Me(ie,!1)}return}if(he==="select-model"||he==="clear-model"){let Ae=String(ie.dataset.model||""),$e=String(ie.dataset.role||"");try{he==="select-model"?(await K.selectOllamaModel(fe,{model:Ae,role:$e}),P(`\u5DF2\u8A2D\u5B9A ${$e==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\uFF1A${Ae}`,"ok")):(await K.clearOllamaModel(fe,{model:Ae,role:$e}),P(`\u5DF2\u53D6\u6D88 ${$e==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\u3002`,"info")),await ke()}catch(Pe){P(Pe.message||"\u6A21\u578B\u8A2D\u5B9A\u5931\u6557\u3002","danger")}}}),j.addEventListener("submit",async oe=>{let ie=oe.target.closest("form[data-ollama-form='host']");if(!ie)return;oe.preventDefault();let he=new FormData(ie),fe=Number(he.get("host_id")||0),Ae={name:String(he.get("name")||"").trim(),url:String(he.get("url")||"").trim(),port:Number(he.get("port")||11434)};try{fe?(await K.updateOllamaHost(fe,Ae),P("llama-server \u4E3B\u6A5F\u5DF2\u66F4\u65B0\u3002","ok")):(await K.addOllamaHost(Ae),P("llama-server \u4E3B\u6A5F\u5DF2\u65B0\u589E\u3002","ok")),b=null,await ke()}catch($e){let Pe=$e.detail||$e.payload?.detail,Ue=Pe?.errors?.join(" \xB7 ")||Pe?.message||$e.message||"\u5132\u5B58\u4E3B\u6A5F\u5931\u6557\u3002";P(Ue,"danger",8e3)}}),j.addEventListener("toggle",oe=>{let ie=oe.target.closest?.(".status-wf-stage[data-status-wf-stage]");if(!ie||!j.contains(ie))return;let he=ie.dataset.statusWfStage||"";he&&(ie.open?qr.add(he):qr.delete(he))},!0),x.addEventListener("click",()=>je());let _e=()=>{a&&(a(),a=null)};return R.addEventListener("change",()=>{_e(),R.checked&&(a=bt("status",(oe,ie)=>{s||je({quiet:!0,status:ie?.snapshot||null})}),je({quiet:!0}),P("\u5DF2\u555F\u7528\u5F8C\u7AEF\u63A8\u9001\u81EA\u52D5\u66F4\u65B0\uFF08\u6BCF 30 \u79D2\uFF09\u3002","info",2200))}),await se({quiet:!0}),xe({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,W(),_e()}}var al="home",nn={home:{page:Fn,title:"Judgment RAG Console \xB7 \u6CD5\u898F\u8207\u5224\u6C7A\u6AA2\u7D22"},rag:{page:ir,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:Yn,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:xr,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:ar,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:yr,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:Mr,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:en,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"}},Lr=document.getElementById("app-main"),sn=null,an=0;function Tr(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||al;return Object.prototype.hasOwnProperty.call(nn,t)?t:al}function pm(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function mm(e){return`<section class="page">
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
  </section>`}async function jr(){let e=Tr(),t=++an;if(pm(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof sn=="function"){try{sn()}catch{}sn=null}document.title=nn[e].title;let s={route:e,navigate(a){nn[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===an&&a&&(document.title=a)}};try{let a=nn[e].page.render(Lr,s);ci(),window.scrollTo({top:0,behavior:"auto"}),Lr.focus({preventScroll:!0});let n=await a;if(t!==an){typeof n=="function"&&n();return}sn=typeof n=="function"?n:null}catch(a){if(t!==an)return;console.error("Failed to render route",e,a),Lr.innerHTML=mm(a);let n=document.getElementById("route-retry");n&&n.addEventListener("click",()=>jr()),P("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function gm(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable))return;let a=Tr(),n=a==="home"?"home-question":a==="rag"?"rag-question":"";if(!n)return;let i=document.getElementById(n);i&&(e.preventDefault(),i.focus())})}function fm(){let e=document.querySelector('[data-route="processing"]');if(!e)return;let t=e.querySelector(".nav-update-badge");t||(t=document.createElement("span"),t.className="nav-update-badge",t.hidden=!0,e.appendChild(t));let s=0,a=0,n=0,i=()=>{let l=[];if(s>0&&l.push(`\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0F\u5224\u6C7A\u6709 ${s} \u9805\u4F86\u6E90\u66F4\u65B0`),a>0&&l.push(`\u5224\u6C7A\u532F\u5165\u5F85\u8655\u7406 ${a} \u500B\u6708`),n>0&&l.push(`Qdrant \u5411\u91CF\u7D22\u5F15\u5F85\u88DC ${n} \u500B\u6708`),!l.length){t.hidden=!0;return}let m=(s>0?1:0)+(a>0?1:0)+(n>0?1:0);t.textContent=String(m===1?s||a||n:m),t.title=l.join("\uFF1B"),t.hidden=!1},o=async(l=null)=>{try{let m=l||await K.updatesStatus();s=Number(m.update_count)||0,m&&Object.prototype.hasOwnProperty.call(m,"import_pending_count")&&(a=Number(m.import_pending_count)||0),m&&Object.prototype.hasOwnProperty.call(m,"index_pending_count")&&(n=Number(m.index_pending_count)||0),i()}catch{t.hidden=!0}};o(),bt("updates",(l,m)=>o(m?.snapshot||null)),window.addEventListener("judgment:processing-pending",l=>{a=Number(l.detail?.count)||0,l.detail&&Object.prototype.hasOwnProperty.call(l.detail,"index_pending")&&(n=Number(l.detail.index_pending)||0),i()}),window.addEventListener("judgment:updates-changed",()=>o())}function nl(){Vr(),ui(),gm(),fm(),window.addEventListener("hashchange",jr),jr(),ha()&&window.setTimeout(()=>{Tr()==="rag"&&(window.location.hash="#/tests")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",nl):nl();})();
