(()=>{var pc=Object.defineProperty;var rs=(e,t)=>{for(var s in t)pc(e,s,{get:t[s],enumerable:!0})};var zn="judgment.api_base",As="judgment.admin_token",Gn="http://127.0.0.1:9200",yt=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function wi(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function is(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${wi(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function Qn(e){let t=is(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function Jn(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?is(e.get("api")):null}catch{return null}}function Vn(){try{let e=window.localStorage.getItem(zn);return e===null?null:is(e)}catch{return null}}function Wn(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return is(e||"")}function Wt(){let e=Jn();if(e!==null)return e;let t=Vn();if(t!==null)return t;let s=Wn();return s||(window.location.protocol==="file:"?Gn:"")}function mc(){if(Jn()!==null)return!0;let e=Vn();return e!==null?!!e:!!Wn()}function Bt(){return Jn()!==null?"query":Vn()!==null?"storage":Wn()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function Fa(){return mc()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!wi(window.location.hostname)}function Kn(e){let t=is(e);try{t?window.localStorage.setItem(zn,t):window.localStorage.removeItem(zn)}catch{}return t}function Oa(){try{let e=String(window.sessionStorage.getItem(As)||"").trim();if(e)return e;let t=String(window.localStorage.getItem(As)||"").trim();return t?(window.sessionStorage.setItem(As,t),window.localStorage.removeItem(As),t):""}catch{return""}}function Ha(e){let t=String(e||"").trim();try{t?window.sessionStorage.setItem(As,t):window.sessionStorage.removeItem(As),window.localStorage.removeItem(As)}catch{}return t}function Un(){return Bt()==="query"?"":Oa()}function vs(e=Wt()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function gt(e,t=Wt()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function yi(){return Bt()==="query"?"":Wt()}async function gc(){let e=Un(),t={Accept:"application/json"};e&&(t["X-Judgment-Admin-Token"]=e);try{let s=await fetch(gt("/api/auth/sse-ticket"),{method:"POST",headers:t,credentials:"include"});if(!s.ok)return"";let a=await s.json();return String(a.ticket||"")}catch{return""}}function wt(e,t,{onError:s=null,onProgress:a=null}={}){if(document.body.classList.contains("is-demo-visitor"))return()=>{};let n=(Array.isArray(e)?e:[e]).map(h=>String(h||"").trim()).filter(Boolean);if(!n.length||typeof EventSource>"u")return()=>{};let i=null,o=0,l=!1,d=null,p=h=>{let u={};try{u=JSON.parse(h.data||"{}")}catch{u={}}u.initial&&o<=1&&!u.snapshot||t?.(u.topic||n[0],u)},f=h=>{let u={};try{u=JSON.parse(h.data||"{}")}catch{u={}}a?.(u.topic||n[0],u)},$=async()=>{if(l)return;let h=await gc();if(l)return;let u=new URLSearchParams({topic:n.join(",")});h&&u.set("ticket",h),i=new EventSource(gt(`/api/events/stream?${u.toString()}`),{withCredentials:!0}),i.onopen=()=>{o+=1,d&&(window.clearTimeout(d),d=null)},i.addEventListener("refresh",p),i.addEventListener("progress",f),i.onerror=()=>{s?.(),!(l||!i)&&(i.close(),i=null,!d&&(d=window.setTimeout(()=>{d=null,$()},3e3)))}};return $(),()=>{l=!0,d&&(window.clearTimeout(d),d=null),i&&(i.removeEventListener("refresh",p),i.removeEventListener("progress",f),i.close(),i=null)}}var Da=new Map,Ba=new Map;function fc({cached:e=!1}={}){let t=e?"/api/quality?cached=1":"/api/quality",s=Ba.get(t);if(s)return s;let a=ie(t,{timeout:18e4,trackClient:!1});Ba.set(t,a);let n=()=>window.setTimeout(()=>{Ba.get(t)===a&&Ba.delete(t)},1500);return a.then(n,n),a}function bc({cached:e=!1,slim:t=!1}={}){let s=new URLSearchParams;e&&s.set("cached","1"),t&&s.set("slim","1");let a=s.toString(),n=`/api/processing${a?`?${a}`:""}`,i=Da.get(n);if(i)return i;let o=ie(n,{timeout:45e3,trackClient:!1});Da.set(n,o);let l=()=>window.setTimeout(()=>{Da.get(n)===o&&Da.delete(n)},1500);return o.then(l,l),o}function Yn(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function ie(e,t={}){let{base:s,...a}=t,n=s!==void 0?is(s):Wt(),i=new AbortController,o=t.timeout===void 0?3e4:t.timeout,l=o>0?window.setTimeout(()=>i.abort(),o):null,d=Date.now(),p=performance.now(),f=t.requestId||_i(),$={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":f,"X-Judgment-Client-Started-At":String(d),...Un()?{"X-Judgment-Admin-Token":Un()}:{},...t.headers||{}},h;try{h=await fetch(gt(e,n),{...a,headers:$,credentials:"include",signal:i.signal})}catch(A){throw A.name==="AbortError"?new yt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new yt(Yn(n),0,A)}finally{l&&window.clearTimeout(l)}let u=null;if((h.headers.get("content-type")||"").includes("application/json"))try{u=await h.json()}catch{u=null}else try{u=await h.text()}catch{u=null}let _=performance.now(),k=h.headers.get("X-Judgment-Request-Id")||f;if(t.trackClient!==!1&&k){let A=Math.round(performance.now()-p);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{ki({request_id:k,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:A,render_ms:Math.max(0,Math.round(performance.now()-_)),status:h.ok?"success":"failed"})})})}if(!h.ok){h.status===403&&u&&typeof u=="object"&&["demo_closed","demo_hard_disabled"].includes(u.code)&&window.dispatchEvent(new CustomEvent("judgment:demo-denied",{detail:u}));let A=u&&typeof u=="object"?u.detail||u.message:u,S=typeof A=="string"&&A?A:`\u4F3A\u670D\u5668\u56DE\u61C9 ${h.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new yt(S,h.status,A)}return u}function _i(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function ki(e){if(!document.body.classList.contains("is-demo-visitor"))try{fetch(gt("/api/performance/client",Wt()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),credentials:"include",keepalive:!0}).catch(()=>{})}catch{}}async function Si(e){let t=is(e);if(!Qn(t))throw new yt("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,n=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(gt("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new yt(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof yt?i:i.name==="AbortError"?new yt("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new yt(Yn(t),0,i)}finally{window.clearTimeout(n)}}var J={health(){return ie("/api/health")},authMe(){return ie("/api/auth/me",{base:yi(),trackClient:!1})},authLogout(){return ie("/api/auth/logout",{method:"POST",base:yi(),trackClient:!1})},demoStatus(){return ie("/api/demo/status",{timeout:15e3,trackClient:!1})},adminDemo(){return ie("/api/admin/demo",{timeout:15e3,trackClient:!1})},updateDemo(e){return ie("/api/admin/demo",{method:"PUT",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},closeDemo(){return ie("/api/admin/demo/close",{method:"POST",body:JSON.stringify({}),timeout:3e4,trackClient:!1})},demoAudit(e=20){let t=new URLSearchParams({limit:String(e)});return ie(`/api/admin/demo/audit?${t.toString()}`,{timeout:15e3,trackClient:!1})},status(){return ie("/api/status",{trackClient:!1})},ollamaHosts(){return ie("/api/llama-server/hosts",{timeout:3e4,trackClient:!1})},addOllamaHost(e){return ie("/api/llama-server/hosts",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},updateOllamaHost(e,t){return ie(`/api/llama-server/hosts/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},deleteOllamaHost(e){return ie(`/api/llama-server/hosts/${encodeURIComponent(e)}`,{method:"DELETE",timeout:3e4,trackClient:!1})},activateOllamaHost(e){return ie(`/api/llama-server/hosts/${encodeURIComponent(e)}/activate`,{method:"POST",timeout:3e4,trackClient:!1})},deactivateOllamaHosts(){return ie("/api/llama-server/hosts/deactivate",{method:"POST",timeout:3e4,trackClient:!1})},reorderOllamaHosts(e){return ie("/api/llama-server/hosts/reorder",{method:"POST",body:JSON.stringify({host_ids:e}),timeout:3e4,trackClient:!1})},checkOllamaCapabilities(){return ie("/api/llama-server/hosts/capabilities/test",{method:"POST",timeout:18e4,trackClient:!1})},selectOllamaModel(e,t){return ie(`/api/llama-server/hosts/${encodeURIComponent(e)}/models/select`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},clearOllamaModel(e,t){return ie(`/api/llama-server/hosts/${encodeURIComponent(e)}/models/clear`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},systemUsage(){return ie("/api/system-usage",{trackClient:!1})},indexVersions(){return ie("/api/index-versions",{trackClient:!1})},indexVersion(e){return ie(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return ie(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return ie(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return ie("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){return ie("/api/index-alias/reconcile",{method:"POST",body:JSON.stringify({repair:!!e}),trackClient:!1})},catalog(){return ie("/api/catalog")},homeSummary(){return ie("/api/home")},judgmentStats(){return ie("/api/judgment-stats")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return ie("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},dataSuggest({kind:e,query:t="",limit:s=12}){let a=new URLSearchParams({kind:e,query:t,limit:String(s)});return ie(`/api/data/suggest?${a.toString()}`,{timeout:45e3,trackClient:!1})},schemaSuggest({database:e,table:t,column:s,query:a,limit:n=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(n)});return ie(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let n=new URLSearchParams({law_key:e});return t&&n.set("source_type",t),s&&n.set("version_id",String(s)),a&&n.set("article_no",String(a)),ie(`/api/law?${n.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),ie(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return ie("/api/test-mode",{trackClient:!1})},llmModels(){return ie("/api/llm/models",{timeout:6e4,trackClient:!1})},testLlmModels(){return ie("/api/llm/models/test",{method:"POST",timeout:12e4,trackClient:!1})},rerankStatus(){return ie("/api/rerank/status",{timeout:6e4,trackClient:!1})},testReranker(){return ie("/api/rerank/test",{method:"POST",timeout:12e4,trackClient:!1})},selectLlmModel(e,t=null){return ie("/api/llm/model",{method:"POST",body:JSON.stringify({model:e,host_id:t}),timeout:3e4,trackClient:!1})},setTestMode(e){return ie("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return ie(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return ie("/api/test-runs/current",{trackClient:!1})},testRun(e){return ie(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return ie("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))i==null||i===""||a.set(n,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),ie(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality({cached:e=!1}={}){return fc({cached:e})},demoQuality(){return ie("/api/demo/quality",{timeout:2e4,trackClient:!1})},processing({cached:e=!1,slim:t=!1}={}){return bc({cached:e,slim:t})},demoProcessing(){return ie("/api/demo/processing",{timeout:2e4,trackClient:!1})},processingActive(){return ie("/api/processing/active",{timeout:3e3,trackClient:!1})},judgmentDownloadStatus(){return ie("/api/judgment-download/status",{timeout:3e4,trackClient:!1})},versioningSummary(){return ie("/api/versioning/summary",{trackClient:!1})},updatesStatus(){return ie("/api/updates/status",{trackClient:!1})},checkCourts(){return ie("/api/courts/check",{timeout:6e4,trackClient:!1})},checkLawVersions(){return ie("/api/law-versions/check",{timeout:6e4,trackClient:!1})},checkUpdates(e=[]){let t=Array.isArray(e)&&e.length?{source_types:e}:{};return ie("/api/updates/check",{method:"POST",body:JSON.stringify(t),timeout:12e4,trackClient:!1})},versioningSnapshots(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.limit&&t.set("limit",String(e.limit)),ie(`/api/versioning/judgments/snapshots?${t.toString()}`,{trackClient:!1})},versioningChanges(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit)),ie(`/api/versioning/judgments/changes?${t.toString()}`,{trackClient:!1})},versioningJudgment(e){return ie(`/api/versioning/judgments/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVersion(e){return ie(`/api/versioning/judgments/versions/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVector(e,t){return ie(`/api/versioning/judgments/${encodeURIComponent(e)}/vectors/${encodeURIComponent(t)}`,{trackClient:!1})},versioningAudit(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit||500)),ie(`/api/versioning/audit?${t.toString()}`,{trackClient:!1})},questionBankStats(){return ie("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))if(!(i==null||i==="")){if(Array.isArray(i)){for(let o of i)o==null||o===""||a.append(n,String(o));continue}a.set(n,String(i))}return a.set("limit",String(t)),a.set("offset",String(s)),ie(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankTags(e="",t=12){let s=new URLSearchParams({query:e,limit:String(t)});return ie(`/api/question-bank/tags?${s.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return ie(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return ie("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},createQuestionBankItemWithAI(e){return ie("/api/question-bank/ai-items",{method:"POST",body:JSON.stringify(e),timeout:42e4,trackClient:!1})},updateQuestionBankItem(e,t){return ie(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return ie(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},restoreQuestionBankItem(e){return ie(`/api/question-bank/items/${encodeURIComponent(e)}/restore`,{method:"POST",timeout:45e3,trackClient:!1})},submitQuestionBankItemForReview(e){return ie(`/api/question-bank/items/${encodeURIComponent(e)}/submit`,{method:"POST",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return ie(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return ie("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return ie(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return ie("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return ie(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return ie("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},benchmarkSuiteLatestAnswers(e){return ie(`/api/benchmark/suites/${encodeURIComponent(e)}/latest-answers`,{timeout:45e3,trackClient:!1})},removeBenchmarkSuiteItem(e,t){return ie(`/api/benchmark/suites/${encodeURIComponent(e)}/items/${encodeURIComponent(t)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return ie("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return ie(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return ie(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return ie(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return ie("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return ie(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return ie(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return ie(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return ie("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return ie(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return ie("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return ie(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return ie("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return ie("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return ie("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},ragShareCreate(e){return ie("/api/rag/share",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},ragShareGet(e){return ie(`/api/rag/share/${encodeURIComponent(e)}`,{timeout:3e4,trackClient:!1})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onQueued:n=null,onToken:i=null,onTokenReset:o=null}={}){let l=Wt(),d=new AbortController,p=t?0:3e5,f=p>0?window.setTimeout(()=>d.abort(),p):null,$=Date.now(),h=performance.now(),u=_i(),b={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":u,"X-Judgment-Client-Started-At":String($)},_;try{_=await fetch(gt("/api/rag/query/stream",l),{method:"POST",headers:b,body:JSON.stringify({question:e}),credentials:"include",signal:d.signal})}catch(Y){throw Y.name==="AbortError"?new yt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new yt(Yn(l),0,Y)}finally{f&&window.clearTimeout(f)}if(!_.ok){let Y=null;try{Y=await _.json()}catch{Y=null}let we=Y&&typeof Y=="object"&&Y.detail?String(Y.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${_.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new yt(we,_.status,Y)}if(!_.body)throw new yt("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let k=_.body.getReader(),A=new TextDecoder,S="",v=null,j=null;try{for(;;){let{value:Y,done:we}=await k.read();if(we)break;S+=A.decode(Y,{stream:!0});let be=S.indexOf(`

`);for(;be>=0;){let ne=S.slice(0,be).replace(/\r/g,"");S=S.slice(be+2);let M="message",q=[];for(let T of ne.split(`
`))T.startsWith("event:")?M=T.slice(6).trim():T.startsWith("data:")&&q.push(T.slice(5).trimStart());if(q.length){let T=null;try{T=JSON.parse(q.join(`
`))}catch{T=null}if(T)if(M==="step"&&typeof s=="function")try{s(T)}catch{}else if(M==="partial"){if(typeof a=="function")try{a(T)}catch{}}else if(M==="queued"){if(typeof n=="function")try{n(T)}catch{}}else if(M==="token"){if(typeof i=="function")try{i(String(T.text||""))}catch{}}else if(M==="token_reset"){if(typeof o=="function")try{o()}catch{}}else M==="result"?v=T:M==="error"&&(j=new yt(T.message||T.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,T))}be=S.indexOf(`

`)}}}finally{try{await k.cancel()}catch{}f&&window.clearTimeout(f)}if(j)throw j;if(!v)throw new yt("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let W=Math.round(performance.now()-h);return ki({request_id:u,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:W,render_ms:0,status:"success"}),v&&typeof v=="object"&&(v._client_request_id=u),v}};var hc={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},vc={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},$c={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},yc={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},xi={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',share:'<path d="M12 16V4"/><path d="m8 8 4-4 4 4"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',palette:'<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10h-4Z"/><circle cx="7.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/><circle cx="10" cy="6.8" r=".8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="6.8" r=".8" fill="currentColor" stroke="none"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',more:'<circle cx="4.2" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="19.8" cy="12" r="2.6" fill="currentColor" stroke="none"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function r(e){return String(e??"").replace(/[&<>"']/g,t=>hc[t])}function Et(e,t="#"){let s=String(e??"").trim();if(!s)return t;if(s.startsWith("#"))return s;if(s.startsWith("//")||s.startsWith("/\\"))return t;if(s.startsWith("/"))return s;try{let a=new URL(s,window.location.origin);return["http:","https:"].includes(a.protocol)?s:t}catch{return t}}function g(e,t=16,s=""){let a=xi[e]||xi.info;return`<svg${s?` class="${r(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function c(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function Ne(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function Xn(e){if(e instanceof Date)return e;if(typeof e=="number"){let n=new Date(e);return Number.isNaN(n.getTime())?null:n}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function Ft(e){let t=Xn(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?r(e):"\u2014"}function ye(e){let t=Xn(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?r(e):"\u2014"}function ma(e){let t=Xn(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:Ft(t)}function fe(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Ot(e){return vc[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Ke(e,t){let s=Ot(e);return`<span class="badge ${$c[s.tone]}"><span class="status-dot ${yc[s.tone]}"></span>${r(t||s.label)}</span>`}function wc(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${r(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function za(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function Ga(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return Ke(String(e));case"source":return wc(String(e));case"number":return`<span class="mono">${c(e)}</span>`;case"duration":return`<span class="mono">${fe(e)}</span>`;case"datetime":return`<span class="mono">${ye(e)}</span>`;case"date":return`<span class="mono">${Ft(e)}</span>`;case"url":{let s=String(e),a=za(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${r(Et(s))}" target="_blank" rel="noopener noreferrer" title="${r(s)}">${g("external",10)}${r(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${r(s)}">${r(za(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(za(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(za(s,90))}</span>`}}}function Oe({tone:e="info",title:t,text:s,iconName:a="info"}){let n=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${n==="i"?"i":g(n,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${r(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function ft({iconName:e="search",title:t,text:s="",actions:a="",className:n=""}){return`<div class="empty-state ${n}">
    <span class="empty-icon">${g(e,24)}</span>
    <h3 class="empty-title">${r(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function Ee(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${r(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function N(e,t="info",s=4200,a={}){let n=document.getElementById("toast-region");if(!n)return null;let{detail:i="",actionLabel:o="",onAction:l=null}=a&&typeof a=="object"?a:{},d={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},p=document.createElement("div");p.className=`toast toast-${t}`,p.setAttribute("role",t==="danger"?"alert":"status"),p.innerHTML=`<span class="toast-mark" aria-hidden="true">${d[t]||"i"}</span>
    <div class="toast-body">${r(e)}${i?`<span class="toast-detail">${r(i)}</span>`:""}</div>
    ${o?`<button class="toast-action" type="button">${r(o)}</button>`:""}
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let f=()=>{p.isConnected&&(p.classList.add("is-leaving"),window.setTimeout(()=>p.remove(),190))};p.querySelector(".toast-close").addEventListener("click",f);let $=p.querySelector(".toast-action");return $&&typeof l=="function"&&$.addEventListener("click",h=>{h.preventDefault(),l(),f()}),n.appendChild(p),s>0&&window.setTimeout(f,s),p}async function qs(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function Ht(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),n=URL.createObjectURL(a),i=document.createElement("a");i.href=n,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(n),1e3)}function os(e,t){try{let s=JSON.parse(window.localStorage.getItem(e)||"null");return!s||!Object.prototype.hasOwnProperty.call(s,"value")||Date.now()-Number(s.saved_at||0)>t?null:s.value}catch{return null}}function ss(e,t){try{window.localStorage.setItem(e,JSON.stringify({value:t,saved_at:Date.now()}))}catch{}}function Qa({name:e,label:t,value:s=4}={}){let a=Math.max(1,Math.min(5,Math.round(Number(s)||4)));return`<div class="field qb-score-field" data-score-field>
    <span class="field-label">${r(t||"")}</span>
    <div class="qb-score-cells" role="radiogroup" aria-label="${r(t||"")}\u5206\u6578">
      ${[1,2,3,4,5].map(n=>`<button class="qb-score-cell${n===a?" is-active":""}" type="button" role="radio" aria-checked="${n===a?"true":"false"}" data-score-cell data-score="${n}" aria-label="${r(t||"")} ${n} \u5206">${n}</button>`).join("")}
    </div>
    <input type="hidden" name="${r(e||"")}" value="${a}" data-score-input />
  </div>`}function Ua(){Ua.installed||(Ua.installed=!0,document.addEventListener("click",e=>{let t=e.target.closest?.("[data-score-cell]");if(!t)return;let s=t.closest("[data-score-field]");if(!s)return;let a=Math.max(1,Math.min(5,Math.round(Number(t.dataset.score)||0)));s.querySelectorAll("[data-score-cell]").forEach(i=>{let o=Number(i.dataset.score)===a;i.classList.toggle("is-active",o),i.setAttribute("aria-checked",o?"true":"false")});let n=s.querySelector("[data-score-input]");n&&(n.value=String(a))}))}var _c=`
  <svg class="auth-google-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z"/>
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.58A10 10 0 0 0 12 22Z"/>
    <path fill="#FBBC05" d="M6.41 13.92A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.92V7.5H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.5l3.35-2.58Z"/>
    <path fill="#EA4335" d="M12 6.04c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.5l3.35 2.58C7.2 7.8 9.4 6.04 12 6.04Z"/>
  </svg>`,kc={google_not_configured:"Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A GOOGLE_CLIENT_ID \u8207 GOOGLE_CLIENT_SECRET\u3002",state_mismatch:"\u767B\u5165\u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u767B\u5165\u3002",access_denied:"\u4F60\u53D6\u6D88\u4E86 Google \u767B\u5165\u3002",email_unverified:"\u9019\u500B Google \u5E33\u865F\u7684\u96FB\u5B50\u90F5\u4EF6\u5C1A\u672A\u9A57\u8B49\u3002",not_allowed:"\u9019\u500B Google \u5E33\u865F\u6C92\u6709\u7BA1\u7406\u54E1\u6B0A\u9650\u3002",oauth_failed:"Google \u767B\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"},Ct=null;function Sc(){return Bt()==="query"?"":Wt()}function xc(){let e=Sc(),t=`${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;return gt(`/api/auth/google/start?next=${encodeURIComponent(t)}`,e)}function Ai(e){let t=String(e?.name||"").trim();if(t)return t;let s=String(e?.email||"").trim();return s?s.split("@")[0]:"\u5DF2\u767B\u5165"}function Ac(e){return Ai(e).slice(0,1).toUpperCase()||"A"}function Zn(){let e=Ct?.querySelector("#auth-menu"),t=Ct?.querySelector("#auth-user-trigger");e&&(e.hidden=!0),t&&t.setAttribute("aria-expanded","false")}function qi(e={}){let t=!!e.google_enabled;Ct.innerHTML=`
    <a class="auth-login${t?"":" is-disabled"}"
       id="auth-login"
       href="${r(xc())}"
       aria-label="\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165"
       title="${t?"\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165":"Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A"}"
       ${t?"":'aria-disabled="true"'}>
      ${_c}
      <span>\u767B\u5165</span>
    </a>`,t||Ct.querySelector("#auth-login")?.addEventListener("click",a=>{a.preventDefault(),N("Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A GOOGLE_CLIENT_ID \u8207 GOOGLE_CLIENT_SECRET\u3002","warn",5200)})}function qc(e){let t=Ai(e),s=String(e?.email||""),a=e?.admin?"\u7BA1\u7406\u54E1":"\u4F7F\u7528\u8005";Ct.innerHTML=`
    <div class="auth-user">
      <button type="button"
              class="auth-user-trigger"
              id="auth-user-trigger"
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="\u5DF2\u767B\u5165\uFF1A${r(s||t)}\uFF0C\u958B\u555F\u5E33\u865F\u9078\u55AE"
              title="${r(s||t)}">
        <span class="auth-avatar" aria-hidden="true">${r(Ac(e))}</span>
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
    </div>`;let n=Ct.querySelector("#auth-user-trigger"),i=Ct.querySelector("#auth-menu");n?.addEventListener("click",o=>{o.stopPropagation();let l=!!i?.hidden;i&&(i.hidden=!l),n.setAttribute("aria-expanded",l?"true":"false")}),Ct.querySelector("#auth-admin-settings")?.addEventListener("click",()=>{Zn()}),Ct.querySelector("#auth-logout")?.addEventListener("click",async o=>{let l=o.currentTarget;l.disabled=!0,l.textContent="\u767B\u51FA\u4E2D\u2026";try{await J.authLogout(),N("\u5DF2\u767B\u51FA\u3002","ok",2400),await Mi(),window.dispatchEvent(new CustomEvent("judgment:auth-changed"))}catch(d){l.disabled=!1,l.textContent="\u767B\u51FA",N(d.message||"\u767B\u51FA\u5931\u6557\u3002","danger",5200)}})}function er(e){e?.authenticated?qc(e):qi(e||{google_enabled:!1})}async function Mi(){if(Ct)try{let e=await J.authMe();e?.authenticated&&Ha(""),er(e)}catch{qi({google_enabled:!1})}}function Mc(){let e;try{e=new URL(window.location.href)}catch{return}let t=e.searchParams.get("auth"),s=e.searchParams.get("auth_error");!t&&!s||(e.searchParams.delete("auth"),e.searchParams.delete("auth_error"),window.history.replaceState(null,"",`${e.pathname}${e.search}${e.hash}`),t==="ok"?N("\u5DF2\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165\u3002","ok",3600):s&&N(kc[s]||"Google \u767B\u5165\u5931\u6557\u3002","danger",6e3))}function Ja(e){Ct&&er(e)}function tr({user:e=null}={}){Ct=document.getElementById("auth-slot"),Ct&&(Mc(),document.addEventListener("click",t=>{t.target.closest(".auth-user")||Zn()}),document.addEventListener("keydown",t=>{t.key==="Escape"&&Zn()}),e?er(e):Mi())}var Li="judgment.theme",sr="nvidia",Va=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#0070f3","#171717","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#0066cc","#1d1d1f","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#17171d","#5e6ad2","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#0d99ff","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#0075de","#191918","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],ar=new Map(Va.map(e=>[e.id,e]));function Lc(e){return ar.has(e)}function jc(e){return ar.get(e)||ar.get(sr)}function nr(){try{let e=window.localStorage.getItem(Li);return Lc(e)?e:sr}catch{return sr}}function rr(e,{persist:t=!0}={}){let s=jc(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");if(a&&a.setAttribute("content",s.metaColor),document.querySelectorAll(".theme-option").forEach(n=>{let i=n.dataset.themeId===s.id;n.classList.toggle("is-active",i),n.setAttribute("aria-checked",i?"true":"false")}),t)try{window.localStorage.setItem(Li,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}var Wa="judgment.fontSizes.v1",dr="judgment.appearance",Ci=new Set(["light","dark","system"]),ji="light",ga=window.matchMedia("(prefers-color-scheme: dark)"),Tc="font-size",ba=[{id:"page-title",label:"\u9801\u9762\u6A19\u984C",hint:"\u5404\u9801\u6700\u4E0A\u65B9\u7684 h1 \u6A19\u984C",selectors:[".page-title"],defaultPx:40,min:20,max:72},{id:"home-title",label:"\u9996\u9801\u4E3B\u8996\u89BA\u6A19\u984C",hint:"\u9996\u9801\u6700\u5927\u7684\u4E3B\u6A19\u984C",selectors:[".home-title"],defaultPx:88,min:40,max:140},{id:"section-title",label:"\u5340\u584A\u6A19\u984C",hint:"\u5831\u8868\u3001\u5361\u7247\u8207\u5340\u584A\u6A19\u984C",selectors:[".section-title",".report-title",".side-card-title",".filter-title",".tests-card-title",".status-sidebar-title",".judgment-dialog-head h2"],defaultPx:16,min:10,max:36},{id:"body",label:"\u5167\u6587\u8207\u8AAA\u660E",hint:"\u6BB5\u843D\u3001\u56DE\u7B54\u3001\u8AAA\u660E\u8207\u6458\u8981\u6587\u5B57",selectors:[".answer-text",".page-subtitle",".report-sub",".home-lead",".empty-text",".notice-body p",".citation-snippet",".side-card-body",".detail-list",".field-help",".report-empty-inline",".processing-section-sub",".summary-value-text",".status-summary",".warnings",".law-dialog-warning"],defaultPx:14,min:8,max:28},{id:"table",label:"\u8868\u683C\u5167\u5BB9",hint:"\u8CC7\u6599\u8868\u683C\u7684\u8868\u982D\u8207\u5132\u5B58\u683C",selectors:[".data-table th",".data-table td"],defaultPx:12,min:8,max:24},{id:"meta",label:"\u6A19\u7C64\u8207\u8F14\u52A9\u6587\u5B57",hint:"badge\u3001chip\u3001\u6B04\u4F4D\u6A19\u7C64\u8207 metadata",selectors:[".badge",".chip",".citation-meta",".citation-index",".answer-section-label",".report-kicker",".report-section-title",".eyebrow",".field-label",".summary-label",".metric-label",".footer-bottom",".nav-update-badge"],defaultPx:10,min:7,max:20},{id:"button",label:"\u6309\u9215\u8207\u5C0E\u89BD",hint:"\u64CD\u4F5C\u6309\u9215\u3001\u9801\u9996\u5C0E\u89BD\u8207\u9023\u7D50",selectors:[".btn",".nav-link",".page-btn",".law-link",".judgment-link",".theme-option-name",".theme-option-desc"],defaultPx:13,min:9,max:24},{id:"form",label:"\u8868\u55AE\u8207\u8F38\u5165",hint:"\u8F38\u5165\u6846\u3001\u4E0B\u62C9\u9078\u55AE\u8207 textarea",selectors:["input","textarea","select",".input",".field-input"],defaultPx:14,min:9,max:28},{id:"mono",label:"\u7A0B\u5F0F\u78BC\u8207\u6578\u503C",hint:"\u7B49\u5BEC\u6587\u5B57\u3001\u67E5\u8A62\u8A9E\u53E5\u8207\u7D71\u8A08\u6578\u503C",selectors:[".mono",".cell-mono",".cell-number",".query-code","code",".metric-value",".summary-value",".perf-stat-value",".mini-stat-value"],defaultPx:13,min:8,max:30},{id:"law-page",label:"\u6CD5\u898F\u689D\u6587\uFF08\u9801\u9762\uFF09",hint:"\u6CD5\u898F\u6AA2\u7D22\u7D50\u679C\u8207\u6CD5\u898F\u4F86\u6E90\u5361\u689D\u6587",selectors:[".law-answer-article-text",".law-answer-article-no",".law-source-article-text",".law-source-article-no",".law-article-text",".law-article-no"],excludeAncestors:[".law-dialog"],defaultPx:12,min:9,max:28},{id:"law-dialog",label:"\u6CD5\u898F\u689D\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u6309\u4E0B\u689D\u6587\u5F8C\u958B\u555F\u7684\u6CD5\u898F dialog",selectors:[".law-dialog .law-article-text",".law-dialog .law-article-no",".law-dialog .law-chapter"],defaultPx:16,min:10,max:32},{id:"judgment-dialog",label:"\u5224\u6C7A\u5168\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u5224\u6C7A\u539F\u6587 dialog \u7684\u5168\u6587\u5340\u584A",selectors:[".judgment-dialog-text"],defaultPx:23,min:12,max:48}],Qs=new Map(ba.map(e=>[e.id,e])),fa=new WeakMap,ls=Bi(),Lt={...ls},cs=Ii(),ir=new Set,Gs=null,Us=null,_t=null,Ms=null,Ti=null,$s=Tc,ys=!1,or=null,lr=!1,Ka="";function Pi(e,t,s){return Math.min(s,Math.max(t,e))}function ur(e){return Math.round(e*10)/10}function Xa(e){return Number.isInteger(e)?String(e):e.toFixed(1)}function Ii(){try{let e=window.localStorage.getItem(dr);return Ci.has(e)?e:ji}catch{return ji}}function Ec(){return cs==="system"?ga.matches?"dark":"light":cs}function Di(){document.querySelectorAll("[data-appearance-option]").forEach(e=>{let t=e.dataset.appearanceOption===cs;e.classList.toggle("is-active",t),e.setAttribute("aria-pressed",t?"true":"false")})}function Ya({persist:e=!1}={}){if(document.documentElement.dataset.appearance=Ec(),document.documentElement.dataset.appearanceMode=cs,Di(),e)try{window.localStorage.setItem(dr,cs)}catch{}}function Nc(e){Ci.has(e)&&(cs=e,Ya({persist:!0}))}function Ei(){cs==="system"&&Ya()}typeof ga.addEventListener=="function"?ga.addEventListener("change",Ei):typeof ga.addListener=="function"&&ga.addListener(Ei);function Bi(){let e=null;try{e=JSON.parse(window.localStorage.getItem(Wa)||"null")}catch{e=null}if(!e||typeof e!="object"||Array.isArray(e))return{};let t={};for(let s of ba){let a=Number(e[s.id]);Number.isFinite(a)&&(t[s.id]=ur(Pi(a,s.min,s.max)))}return t}function Rc(){try{return Object.keys(ls).length?window.localStorage.setItem(Wa,JSON.stringify(ls)):window.localStorage.removeItem(Wa),!0}catch{return!1}}function va(e){let t=new Set;for(let s of e.selectors)document.querySelectorAll(s).forEach(a=>{a.closest(".settings-sidebar")||Array.isArray(e.excludeAncestors)&&e.excludeAncestors.some(n=>a.closest(n))||t.add(a)});return Array.from(t)}function Fi(){if(!Ka)return;let e=Qs.get(Ka);if(e)for(let t of va(e))t.classList.add("font-size-highlight")}function Oi(e){if(Js(),!Qs.get(e))return;Ka=e;let s=_t.querySelector(`.font-size-row[data-font-group="${e}"]`);s&&s.classList.add("is-previewing"),Fi()}function Js(){Ka="",_t.querySelectorAll(".font-size-row.is-previewing").forEach(e=>e.classList.remove("is-previewing")),document.querySelectorAll(".font-size-highlight").forEach(e=>e.classList.remove("font-size-highlight"))}function Cc(e){if(fa.has(e))return fa.get(e);let t={inline:e.style.fontSize||"",computed:parseFloat(window.getComputedStyle(e).fontSize)||0};return fa.set(e,t),t}function Pc(e){let t=fa.get(e);t&&(t.inline?e.style.fontSize=t.inline:e.style.removeProperty("font-size"))}function Ic(e){let t=Lt[e.id];if(Number.isFinite(t))for(let s of va(e))Cc(s),s.style.fontSize=`${t}px`}function Dc(e){for(let t of va(e))Pc(t)}function ws(){for(let e of ir){let t=Qs.get(e);t&&Dc(t)}ir=new Set;for(let e of ba)Number.isFinite(Lt[e.id])&&(Ic(e),ir.add(e.id));Fi()}function Hi(){ws(),ys&&$s==="font-size"&&ha()}function zi(){lr||(lr=!0,window.requestAnimationFrame(()=>{lr=!1,ws()}))}function Bc(){or||!document.body||(or=new MutationObserver(e=>{if(Object.keys(Lt).length){for(let t of e)if(t.type==="childList"&&(t.addedNodes.length||t.removedNodes.length)){zi();return}}}),or.observe(document.body,{childList:!0,subtree:!0}))}function Fc(e){let t=e.filter(s=>typeof s.getClientRects=="function"&&s.getClientRects().length);return t.length?t:e}function Oc(){let e=ba.filter(t=>va(t).length>0||Number.isFinite(Lt[t.id]));return e.length?e:ba}function Za(e){let t=Lt[e.id];if(Number.isFinite(t))return t;let a=Fc(va(e)).map(o=>{let l=fa.get(o);return l&&l.computed?l.computed:parseFloat(window.getComputedStyle(o).fontSize)||0}).filter(o=>o>0).sort((o,l)=>o-l);if(!a.length)return e.defaultPx;let n=Math.floor(a.length/2),i=a.length%2?a[n]:(a[n-1]+a[n])/2;return ur(i)}function Hc(){let e=[{id:"font-size",label:"\u5B57\u578B\u5927\u5C0F",hint:"\u8ABF\u6574\u5404\u6587\u5B57\u5340\u584A",glyph:'<span class="settings-option-aa" aria-hidden="true">Aa</span>'},{id:"theme",label:"\u4ECB\u9762\u98A8\u683C",hint:"\u5207\u63DB\u54C1\u724C\u8996\u89BA\u8A9E\u8A00",glyph:g("palette",15)}];Ms.innerHTML=e.map(t=>`<button class="settings-option${$s===t.id?" is-active":""}" type="button" role="tab"
        data-settings-panel="${t.id}"
        aria-selected="${$s===t.id?"true":"false"}">
        <span class="settings-option-icon">${t.glyph}</span>
        <span class="settings-option-copy">
          <strong>${r(t.label)}</strong>
          <small>${r(t.hint)}</small>
        </span>
        ${g("chevronRight",12,"settings-option-chevron")}
      </button>`).join("")}function ha(){Js();let e=Oc(),t=e.map(s=>{let a=Xa(Za(s));return`<section class="font-size-row" data-font-group="${s.id}">
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
    </section>`}).join("");_t.innerHTML=`<div class="settings-panel-head">
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
    </div>`}function zc(){Js();let e=nr(),t=Va.map((n,i)=>{let o=n.swatches.map(l=>`<i style="--swatch:${r(l)}"></i>`).join("");return`<button class="theme-option${n.id===e?" is-active":""}" type="button" role="menuitemradio"
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
          aria-pressed="${cs===n.id?"true":"false"}"
          title="${n.id==="system"?"\u8DDF\u96A8\u7CFB\u7D71\u660E\u6697":`${n.label}\u8272\u6A21\u5F0F`}">${n.label}</button>`).join("")}
  </div>`;_t.innerHTML=`<div class="settings-panel-head">
      <div>
        <h3>\u4ECB\u9762\u98A8\u683C</h3>
        <p>\u9078\u64C7\u4E3B\u63A7\u53F0\u7684\u54C1\u724C\u8996\u89BA\u8A9E\u8A00\uFF1B\u4E3B\u984C\u6703\u7ACB\u5373\u5957\u7528\u4E26\u4FDD\u7559\u3002</p>
      </div>
      <div class="settings-panel-head-actions">
        <span class="badge badge-info">${Va.length} \u7A2E</span>
        ${a}
      </div>
    </div>
    <div class="settings-theme-list" role="menu" aria-label="\u4ECB\u9762\u98A8\u683C">${t}</div>`,Di()}function Uc(){Ms.querySelectorAll("[data-settings-panel]").forEach(e=>{let t=e.dataset.settingsPanel===$s;e.classList.toggle("is-active",t),e.setAttribute("aria-selected",t?"true":"false")})}function pr(e=$s){$s=e==="theme"?"theme":"font-size",Uc(),$s==="theme"?zc():ha()}function Ni(e,t,s){let a=Number(t);if(!Number.isFinite(a))return;let n=ur(Pi(a,e.min,e.max));Lt[e.id]=n;let i=s?.querySelector(".font-size-slider");i&&(i.value=String(n));let o=s?.querySelector(".font-size-preview");o&&(o.style.fontSize=`${n}px`),zi()}function Gc(){_t.querySelectorAll(".font-size-row").forEach(e=>{let t=Qs.get(e.dataset.fontGroup);if(!t)return;let s=Lt[t.id]??Za(t),a=e.querySelector(".font-size-number-input");a&&(a.value=Xa(s));let n=e.querySelector(".font-size-slider");n&&(n.value=String(s));let i=e.querySelector(".font-size-preview");i&&(i.style.fontSize=`${s}px`)})}function Ri(e){let t=e.target.closest(".font-size-row");if(!t)return;let s=Qs.get(t.dataset.fontGroup);if(!s)return;let a=e.target.classList.contains("font-size-number-input");if(!(a&&e.target.value==="")){if(e.type==="input"&&a){let n=Number(e.target.value);if(!Number.isFinite(n))return;Ni(s,n,t);return}if(Ni(s,e.target.value,t),e.type==="input"){let n=t.querySelector(".font-size-number-input");n&&document.activeElement!==n&&(n.value=Xa(Lt[s.id]??Za(s)))}}}function Qc(e){if(!e.target.classList.contains("font-size-number-input"))return;let t=e.target.closest(".font-size-row"),s=t?Qs.get(t.dataset.fontGroup):null;if(!s)return;let a=Lt[s.id]??Za(s);e.target.value=Xa(a)}function Jc(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Oi(t.dataset.fontGroup)}function Vc(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Js()}function Wc(e){let t=e.target.closest(".font-size-row");t&&Oi(t.dataset.fontGroup)}function Kc(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Js()}function Yc(e){let t=e.target.closest("[data-settings-panel]");if(t){pr(t.dataset.settingsPanel);return}let s=e.target.closest("[data-settings-action]");if(s){let i=s.dataset.settingsAction;if(i==="save"){ls={...Lt};let o=Rc();Gc(),N(o?"\u5B57\u578B\u5927\u5C0F\u5DF2\u5132\u5B58\u3002":"\u5B57\u578B\u5927\u5C0F\u5DF2\u5957\u7528\uFF0C\u4F46\u700F\u89BD\u5668\u7121\u6CD5\u5132\u5B58\u8A2D\u5B9A\u3002",o?"ok":"warn");return}if(i==="cancel"){Lt={...ls},ws(),ha(),N("\u5DF2\u53D6\u6D88\u672A\u5132\u5B58\u7684\u5B57\u578B\u8B8A\u66F4\u3002","info");return}i==="reset"&&(Lt={},ws(),ha(),N("\u5DF2\u56DE\u5FA9\u9810\u8A2D\u5B57\u578B\uFF1B\u6309\u300C\u5132\u5B58\u300D\u4FDD\u7559\u8B8A\u66F4\u3002","info"));return}let a=e.target.closest("[data-appearance-option]");if(a){Nc(a.dataset.appearanceOption);return}let n=e.target.closest(".theme-option");n&&rr(n.dataset.themeId)}function Xc(){ys||(ys=!0,Lt={...ls},document.body.classList.add("settings-open"),Gs.removeAttribute("inert"),Gs.setAttribute("aria-hidden","false"),Us.setAttribute("aria-expanded","true"),pr($s),ws(),window.requestAnimationFrame(()=>{let e=Ms.querySelector(".settings-option.is-active")||Ms.querySelector(".settings-option");e&&e.focus({preventScroll:!0})}))}function cr({restoreFocus:e=!0}={}){ys&&(ys=!1,Js(),Lt={...ls},ws(),document.body.classList.remove("settings-open"),e&&Us.focus({preventScroll:!0}),Gs.setAttribute("aria-hidden","true"),Gs.setAttribute("inert",""),Us.setAttribute("aria-expanded","false"))}function Ui(){Gs=document.getElementById("settings-sidebar"),Us=document.getElementById("settings-trigger"),_t=document.getElementById("settings-panel"),Ms=document.getElementById("settings-options"),Ti=document.getElementById("settings-close"),!(!Gs||!Us||!_t||!Ms)&&(Ya(),rr(nr(),{persist:!1}),Hc(),ha(),Bc(),ws(),Us.addEventListener("click",()=>{ys?cr():Xc()}),Ti?.addEventListener("click",()=>cr()),Ms.addEventListener("click",e=>{let t=e.target.closest("[data-settings-panel]");t&&pr(t.dataset.settingsPanel)}),_t.addEventListener("click",Yc),_t.addEventListener("input",Ri),_t.addEventListener("change",Ri),_t.addEventListener("blur",Qc,!0),_t.addEventListener("pointerover",Jc),_t.addEventListener("pointerout",Vc),_t.addEventListener("focusin",Wc),_t.addEventListener("focusout",Kc),_t.addEventListener("keydown",e=>{e.key==="Enter"&&e.target.classList.contains("font-size-number-input")&&(e.preventDefault(),e.target.blur())}),document.addEventListener("keydown",e=>{e.key==="Escape"&&ys&&cr()}),window.addEventListener("storage",e=>{if(e.key===dr){cs=Ii(),Ya();return}e.key===Wa&&(ls=Bi(),ys||(Lt={...ls},ws()))}))}var Qi=["rag","data","quality","performance","processing","status"],sn={rag:"RAG \u63D0\u554F",data:"\u8CC7\u6599\u5EAB",quality:"\u8CC7\u6599\u54C1\u8CEA",performance:"\u6548\u80FD\u5831\u8868",processing:"\u8CC7\u6599\u8655\u7406",status:"\u7CFB\u7D71\u72C0\u614B"},Qe={loaded:!1,admin:!1,enabled:!1,features:{},expiresAt:null,reason:"",me:null},Ji="judgment.demo_context.v1",Zc=300*1e3;function Vi(){try{let e=JSON.parse(window.localStorage.getItem(Ji)||"null");return!e||typeof e!="object"||Date.now()-Number(e.saved_at||0)>Zc||typeof e.admin!="boolean"?null:e}catch{return null}}function Wi(e){return e&&(Qe.admin=!!e.admin,Qe.enabled=!!e.enabled,Qe.features=e.features||{},Qe.expiresAt=e.expiresAt||null,Qe.reason=e.reason||"",Qe.me=e.me||null,Qe.loaded=!0),Qe}function ed(){try{window.localStorage.setItem(Ji,JSON.stringify({admin:Qe.admin,enabled:Qe.enabled,features:Qe.features,expiresAt:Qe.expiresAt,reason:Qe.reason,me:Qe.me,saved_at:Date.now()}))}catch{}}function Ws(){return!!Qe.admin}function zt(){return!Qe.admin}function Ki(){return!!Qe.enabled}function mr(e){return Qe.admin?!0:e==="home"?Qe.enabled:!!(Qe.enabled&&Qe.features?.[e])}function td(e){return sn[e]||e}function an(e){if(!e)return"\u2014";let t=Date.parse(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.round((t-Date.now())/1e3));if(s<=0)return"\u5DF2\u5230\u671F";let a=Math.floor(s/3600),n=Math.floor(s%3600/60);return a>0?`${a} \u5C0F\u6642 ${n} \u5206`:`${Math.max(1,n)} \u5206`}async function nn(){let e=await Promise.allSettled([J.authMe()]),t=e[0].status==="fulfilled"?e[0].value:null,s=t?.demo||await J.demoStatus().catch(()=>null);return Qe.admin=!!t?.admin,Qe.enabled=!!s?.enabled,Qe.features=s?.features||{},Qe.expiresAt=s?.expires_at||null,Qe.reason=s?.reason||"",Qe.me=t,Qe.loaded=!0,ed(),Qe.admin&&(Qe.enabled=!1),Qe}function js(){let e=!Qe.admin,t=!!Qe.enabled;document.body.classList.toggle("is-demo-visitor",e&&t),document.body.classList.toggle("is-demo-closed",e&&!t),document.body.classList.toggle("is-admin",Qe.admin),document.querySelectorAll("[data-route]").forEach(a=>{let n=a.dataset.route||"";if(!e){a.hidden=!1;return}if(n==="tests"){a.hidden=!0;return}a.hidden=!Qe.enabled||!mr(n)});let s=document.getElementById("demo-banner");s&&(e&&t?(s.hidden=!1,s.innerHTML=`<span class="demo-banner-dot" aria-hidden="true"></span>
      <strong>\u5C55\u793A\u6A21\u5F0F</strong>
      <span>\u5269\u9918 ${r(an(Qe.expiresAt))}</span>
      <span class="demo-banner-note">\u53EF\u700F\u89BD\u5B8C\u6574\u8CC7\u6599\u9801\uFF1B\u7BA1\u7406\u64CD\u4F5C\u5DF2\u9396\u5B9A</span>`):(s.hidden=!0,s.innerHTML=""))}function Yi(e){e.innerHTML=`<section class="page demo-closed-page">
    <div class="demo-state-card">
      <div class="demo-state-mark">${g("shield",22)}</div>
      <div class="eyebrow">DEMO MODE</div>
      <h1 class="page-title">\u5C55\u793A\u76EE\u524D\u672A\u958B\u653E</h1>
      <p class="page-subtitle">
        \u6B64\u7DB2\u7AD9\u50C5\u5728\u9762\u8A66\u5C55\u793A\u671F\u9593\u66AB\u6642\u958B\u653E\u3002\u82E5\u4F60\u662F\u7BA1\u7406\u8005\uFF0C\u8ACB\u7531\u53F3\u4E0A\u89D2\u767B\u5165\u3002
      </p>
      <div class="demo-state-actions">
        <a class="btn btn-secondary" href="https://github.com/solo0920/judgment" target="_blank" rel="noopener noreferrer">\u67E5\u770B\u5C08\u6848</a>
      </div>
    </div>
  </section>`}function gr(e,t){e.innerHTML=`<section class="page demo-closed-page">
    <div class="demo-state-card">
      <div class="demo-state-mark">${g("shield",22)}</div>
      <div class="eyebrow">DEMO MODE</div>
      <h1 class="page-title">\u6B64\u529F\u80FD\u76EE\u524D\u672A\u958B\u653E\u5C55\u793A</h1>
      <p class="page-subtitle">
        ${r(t==="tests"?"\u7CFB\u7D71\u6E2C\u8A66":td(t))}\u76EE\u524D\u7531\u7BA1\u7406\u8005\u95DC\u9589\uFF1B\u5C55\u793A\u671F\u9593\u4ECD\u53EF\u5207\u63DB\u5176\u4ED6\u5DF2\u958B\u653E\u529F\u80FD\u3002
      </p>
      <div class="demo-state-actions">
        <a class="btn btn-primary" href="#/home">\u56DE\u5230\u9996\u9801</a>
      </div>
    </div>
  </section>`}function rn(){return`<section class="page demo-closed-page">
    <div class="demo-state-card">
      <div class="demo-state-mark">${g("shield",22)}</div>
      <div class="eyebrow">ADMIN ONLY</div>
      <h1 class="page-title">\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650</h1>
      <p class="page-subtitle">\u8ACB\u7531\u53F3\u4E0A\u89D2\u4EE5\u7BA1\u7406\u8005 Google \u5E33\u865F\u767B\u5165\u3002</p>
    </div>
  </section>`}function Ts(e,t){return`<div class="demo-lock-card">
    <span class="demo-lock-icon">${g("shield",18)}</span>
    <div class="demo-lock-copy">
      <strong>${r(e||"\u6B64\u529F\u80FD\u7531\u7BA1\u7406\u8005\u64CD\u4F5C")}</strong>
      <p>${r(t||"\u5C55\u793A\u6A21\u5F0F\u50C5\u63D0\u4F9B\u6AA2\u8996\uFF0C\u57F7\u884C\u3001\u8A2D\u5B9A\u8207\u7BA1\u7406\u6309\u9215\u5DF2\u9396\u5B9A\u3002")}</p>
      <span class="badge badge-neutral badge-mono">\u5C55\u793A\u6A21\u5F0F \xB7 \u552F\u8B80</span>
    </div>
  </div>`}var kt=null,$a=0,Ls=null,Vs={x:0,y:0};function sd(){return kt?.isConnected||(kt=document.createElement("div"),kt.className="demo-lock-tooltip",kt.setAttribute("role","tooltip"),kt.hidden=!0,document.body.appendChild(kt)),kt}function Xi(){if(!kt||kt.hidden)return;let e=18,t=kt.getBoundingClientRect(),s=Vs.x+e,a=Vs.y+14;s+t.width>window.innerWidth-8&&(s=Vs.x-t.width-e),a+t.height>window.innerHeight-8&&(a=Vs.y-t.height-14),kt.style.transform=`translate3d(${Math.round(Math.max(8,s))}px, ${Math.round(Math.max(8,a))}px, 0)`}function ad(e){let t=String(e?.dataset.demoLockTooltip||"").trim();if(!t)return;let s=sd();s.textContent=t,s.hidden=!1,Xi()}function en(){$a&&(window.clearTimeout($a),$a=0),Ls=null,kt&&(kt.hidden=!0)}function Gi(e,t,s){!e||Ls===e||(en(),Ls=e,Vs={x:t,y:s},$a=window.setTimeout(()=>{$a=0,Ls===e&&ad(e)},200))}function tn(){tn.installed||(tn.installed=!0,document.addEventListener("pointerover",e=>{let t=e.target.closest?.("[data-demo-lock-tooltip]");t&&Gi(t,e.clientX,e.clientY)}),document.addEventListener("pointermove",e=>{Ls&&(Vs={x:e.clientX,y:e.clientY},kt&&!kt.hidden&&Xi())}),document.addEventListener("pointerout",e=>{if(!Ls)return;let t=e.relatedTarget;t&&Ls.contains?.(t)||en()}),document.addEventListener("focusin",e=>{let t=e.target.closest?.("[data-demo-lock-tooltip]");if(!t)return;let s=t.getBoundingClientRect();Gi(t,s.right,s.top)}),document.addEventListener("focusout",()=>en()),window.addEventListener("scroll",en,{capture:!0,passive:!0}))}var fr={};rs(fr,{render:()=>od});var nd=[{hours:2,label:"2 \u5C0F\u6642"},{hours:24,label:"24 \u5C0F\u6642"},{hours:168,label:"7 \u5929"}];function rd(e,t){return`<label class="demo-toggle-row" for="demo-feature-${e}">
    <span class="demo-toggle-copy">
      <strong>${r(sn[e]||e)}</strong>
      <small>${t?"\u8A2A\u5BA2\u53EF\u4F7F\u7528\u6B64\u529F\u80FD\u7684\u552F\u8B80\uFF0F\u516C\u958B\u90E8\u5206":"\u76EE\u524D\u672A\u958B\u653E\u7D66\u8A2A\u5BA2"}</small>
    </span>
    <span class="demo-switch">
      <input type="checkbox" id="demo-feature-${e}" data-demo-feature="${e}" aria-label="${r(sn[e]||e)}" ${t?"checked":""} />
      <span aria-hidden="true"></span>
    </span>
  </label>`}function id(e){return e?.length?`<div class="demo-audit-list">${e.map(t=>`<div class="demo-audit-row">
        <span>${r(t.created_at||"\u2014")}</span>
        <strong>${r(t.action||"\u2014")}</strong>
        <small>${r(t.actor_email||"\u2014")}</small>
      </div>`).join("")}</div>`:'<div class="demo-empty">\u5C1A\u7121\u5207\u63DB\u7D00\u9304\u3002</div>'}async function od(e){if(!Ws()){e.innerHTML=rn();return}e.innerHTML=`<section class="page admin-page">
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
            <span class="status-tab-icon">${g("sliders",15)}</span>
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
  </section>`;let t=e.querySelector("#demo-admin-panel"),s=e.querySelector("#demo-admin-badge"),a=null,n=0,i=()=>{let d=t.querySelector("[data-demo-remaining]");d&&(d.textContent=an(a?.effective?.expires_at))},o=()=>{if(!a)return;let d=a.stored||{},p=a.effective||{},f=a.usage||{},$=d.features||{},h=!!p.enabled,u=!!a.hard_disabled;s.textContent=h?"DEMO \xB7 \u5DF2\u958B\u555F":"DEMO \xB7 \u5DF2\u95DC\u9589",s.classList.toggle("badge-ok",h),s.classList.toggle("badge-danger",!h),t.innerHTML=`<div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">DEMO MODE</div>
          <div class="report-title">\u5C55\u793A\u6A21\u5F0F</div>
          <div class="report-sub">
            \u5BE6\u969B\u751F\u6548\uFF1A<strong>${h?"\u958B\u555F":"\u95DC\u9589"}</strong>
            ${p.reason?` \xB7 \u539F\u56E0\uFF1A${r(p.reason)}`:""}
          </div>
        </div>
        <div class="demo-status-pill ${h?"is-on":"is-off"}">${h?"ON":"OFF"}</div>
      </div>
      <div class="report-section">
        ${u?`<div class="notice notice-danger" role="alert">
                <span class="notice-icon" aria-hidden="true">${g("alert",12)}</span>
                <div class="notice-body"><strong>\u74B0\u5883\u8B8A\u6578\u5F37\u5236\u95DC\u9589</strong>
                <p>JUDGMENT_DEMO_HARD_DISABLE=1\uFF0CDB \u958B\u95DC\u76EE\u524D\u7121\u6548\u3002</p></div>
              </div>`:""}
        <div class="demo-admin-stats">
          <div><span>\u5269\u9918\u6642\u9593</span><strong data-demo-remaining>${r(an(p.expires_at))}</strong></div>
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
          ${Qi.map(S=>rd(S,!!$[S])).join("")}
        </div>

        <div class="demo-open-controls">
          <label class="field-label" for="demo-duration">\u958B\u653E\u6642\u9593</label>
          <select class="select" id="demo-duration">
            ${nd.map(S=>`<option value="${S.hours}">${S.label}</option>`).join("")}
          </select>
          <button class="btn btn-secondary" type="button" id="demo-save">
            ${g("check",15)}<span>\u5132\u5B58\u8A2D\u5B9A</span>
          </button>
          <button class="btn btn-success" type="button" id="demo-open">
            ${g("play",15)}<span>\u958B\u555F\u5C55\u793A</span>
          </button>
          <button class="btn btn-danger" type="button" id="demo-close">
            ${g("x",15)}<span>\u7ACB\u5373\u95DC\u9589\u5C55\u793A</span>
          </button>
        </div>
        <p class="demo-open-hint">
          \u300C\u5132\u5B58\u8A2D\u5B9A\u300D\u53EA\u4FDD\u5B58\u529F\u80FD\u65D7\u6A19\u8207\u671F\u9650\uFF0C\u4E0D\u6703\u6539\u8B8A\u76EE\u524D\u958B\u95DC\uFF1B\u300C\u958B\u555F\u5C55\u793A\u300D\u6703\u4F9D\u4E0A\u65B9\u65D7\u6A19\u7ACB\u5373\u5C0D\u8A2A\u5BA2\u958B\u653E\u3002
        </p>

        <div class="demo-admin-section">
          <div class="report-section-head"><span class="report-section-title">\u6700\u8FD1\u5207\u63DB\u7D00\u9304</span></div>
          ${id(a.audit)}
        </div>
      </div>
    </div>`;let b=t.querySelector("#demo-enabled"),_=[...t.querySelectorAll("[data-demo-feature]")],k=()=>Object.fromEntries(_.map(S=>[S.dataset.demoFeature,S.checked])),A=async(S,{enabled:v,label:j})=>{S.disabled=!0;let W=Number(t.querySelector("#demo-duration")?.value||2),Y=k();if(v&&!Object.values(Y).some(Boolean)){N("\u8ACB\u81F3\u5C11\u958B\u555F\u4E00\u500B\u529F\u80FD\uFF0C\u624D\u80FD\u958B\u555F\u5C55\u793A\u3002","warn",5200),S.disabled=!1;return}try{a=await J.updateDemo({enabled:v,duration_hours:v?W:null,features:Y,version:a?.stored?.version}),N(j,"ok",3200),o()}catch(we){N(we.message||"\u7121\u6CD5\u66F4\u65B0\u5C55\u793A\u8A2D\u5B9A\u3002","danger",6e3)}finally{S.disabled=!1}};t.querySelector("#demo-save")?.addEventListener("click",S=>{A(S.currentTarget,{enabled:!!b?.checked,label:b?.checked?"\u5C55\u793A\u8A2D\u5B9A\u5DF2\u5132\u5B58\uFF0C\u5C55\u793A\u4ECD\u7DAD\u6301\u958B\u555F\u3002":"\u5C55\u793A\u8A2D\u5B9A\u5DF2\u5132\u5B58\uFF0C\u5C55\u793A\u4ECD\u7DAD\u6301\u95DC\u9589\u3002"})}),t.querySelector("#demo-open")?.addEventListener("click",S=>{A(S.currentTarget,{enabled:!0,label:"\u5C55\u793A\u6A21\u5F0F\u5DF2\u958B\u555F\u3002"})}),t.querySelector("#demo-close")?.addEventListener("click",async S=>{let v=S.currentTarget;v.disabled=!0;try{a=await J.closeDemo(),N("\u5C55\u793A\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok",3200),o()}catch(j){N(j.message||"\u7121\u6CD5\u95DC\u9589\u5C55\u793A\u6A21\u5F0F\u3002","danger",6e3)}finally{v.disabled=!1}}),n&&window.clearInterval(n),n=window.setInterval(i,1e3)};return await(async()=>{try{a=await J.adminDemo(),o()}catch(d){t.innerHTML=`<div class="report-card"><div class="report-head">
        <div class="report-title-group"><div class="report-kicker">ADMIN SETTINGS</div>
        <div class="report-title">\u7121\u6CD5\u8B80\u53D6\u5C55\u793A\u8A2D\u5B9A</div>
        <div class="report-sub">${r(d.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}</div></div>
      </div></div>`}})(),()=>{n&&window.clearInterval(n),n=0}}var Sr={};rs(Sr,{render:()=>yd});function ld(e){let t=e&&typeof e=="object"?e:{},s=t.judgment_total,a=t.financial_total,n=Number(s),i=Number(a),o=s!=null&&Number.isFinite(n)&&n>=0,l=a!=null&&Number.isFinite(i)&&i>=0;return{total:o?n:null,financial:l?i:null,ratio:o&&l&&n>0?i/n*100:null}}function as(e,{loading:t=!1}={}){let s=ld(e),a=t?"\u8B80\u53D6\u4E2D\u2026":c(s.total),n=t?"\u8B80\u53D6\u4E2D\u2026":c(s.financial),i=t?"\u8B80\u53D6\u4E2D\u2026":s.ratio===null?"\u2014":`${s.ratio.toFixed(1)}%`;return`<div class="processing-summary-card">
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
  </div>`}var br=11,cd=15e3,Zi="judgment.home.summary.v1",on=new Set,dd=[{route:"rag",icon:"message",kicker:"RAG",title:"RAG \u63D0\u554F",summary:"\u7528\u81EA\u7136\u8A9E\u8A00\u627E\u5230\u76F8\u4F3C\u5224\u6C7A\u8207\u73FE\u884C\u6CD5\u898F\uFF0C\u56DE\u7B54\u9644\u4E0A\u53EF\u56DE\u6EAF\u7684\u5F15\u7528\u3002",metric:"Citations first",tone:"feature",wide:!0,metricKey:"rag"},{route:"data",icon:"database",kicker:"EXPLORE",title:"\u8CC7\u6599\u5EAB\u67E5\u8A62",summary:"\u8DE8 PostgreSQL\u3001Parquet\u3001Qdrant \u8207 IndexedDB \u6AA2\u8996\u539F\u59CB\u8CC7\u6599\u3002",metric:"4 \u7A2E\u8CC7\u6599\u4F86\u6E90",tone:"blue",metricKey:"data"},{route:"quality",icon:"shield",kicker:"QUALITY",title:"\u8CC7\u6599\u54C1\u8CEA",summary:"\u7528 DuckDB \u6AA2\u67E5\u539F\u59CB\u5224\u6C7A\u7684\u91CD\u8907\u3001\u7F3A\u6F0F\u8207\u5F15\u7528\u4E00\u81F4\u6027\u3002",metric:"DuckDB native",tone:"green",metricKey:"quality"},{route:"performance",icon:"activity",kicker:"OBSERVE",title:"\u6548\u80FD\u5831\u8868",summary:"\u5F9E\u55AE\u6B21 RAG \u5230\u7D22\u5F15\u5EFA\u7F6E\uFF0C\u8FFD\u8E64\u6BCF\u500B\u968E\u6BB5\u7684\u8017\u6642\u8207\u74F6\u9838\u3002",metric:"Flow \xB7 Waterfall",tone:"amber",metricKey:"performance"},{route:"processing",icon:"sliders",kicker:"PIPELINE",title:"\u8CC7\u6599\u8655\u7406",summary:"\u4E0B\u8F09\u3001\u532F\u5165\u3001\u5099\u4EFD\u8207\u7D22\u5F15\uFF0C\u96C6\u4E2D\u7BA1\u7406\u8CC7\u6599\u751F\u547D\u9031\u671F\u3002",metric:"End-to-end",tone:"violet",metricKey:"processing"},{route:"status",icon:"server",kicker:"STATUS",title:"\u7CFB\u7D71\u72C0\u614B",summary:"\u6AA2\u8996\u670D\u52D9\u5065\u5EB7\u3001\u8F09\u5165 Pipeline\u3001\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207 API \u76EE\u9304\u3002",metric:"10 \u670D\u52D9\u5143\u4EF6",tone:"slate",metricKey:"status"},{route:"tests",icon:"check",kicker:"VERIFY",title:"\u7CFB\u7D71\u6E2C\u8A66",summary:"\u8A2D\u5B9A API Base\uFF0C\u6E2C\u8A66 LLM \u6A21\u578B\u8207 Reranker \u670D\u52D9\u3002",metric:"LLM \xB7 Reranker",tone:"rose",metricKey:"tests"}];function Ks(e,t=1){let s=Number(e);return Number.isFinite(s)?`${s.toFixed(t)}%`:"\u2014"}function vr(e){let t=e?.year_min,s=e?.year_max;return!t&&!s?"\u2014":t&&s&&t!==s?`${t}\u2013${s}`:String(t||s)}function to(e){let t=Number(e?.year_span);return Number.isFinite(t)&&t>0?`${t} \u5E74`:"\u2014"}function ud(e){return`<a class="home-tile tone-${r(e.tone)}${e.wide?" is-wide":""}" href="#/${e.route}">
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
  </a>`}function $r(e,{loading:t=!1}={}){let s=e?.laws||{},a=n=>t?"\u8B80\u53D6\u4E2D\u2026":c(n);return`<div class="processing-summary-card">
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
  </div>`}function pd(e,{loading:t=!1}={}){if(t)return`<div class="home-live-rows is-loading">
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
      <span class="home-live-value mono">${r(vr(a))} <i>\xB7</i> ${r(to(a))}</span>
    </div>
    <div class="home-live-row">
      <span class="home-live-label">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15</span>
      <span class="home-live-value mono">${c(n.indexed)} <i>\xB7</i> ${r(Ks(n.coverage_pct))}</span>
    </div>
  </div>`}function cn(e,{loading:t=!1,error:s="",generatedAt:a=""}={}){return s?`<div class="home-live-error" role="status">
      <span class="home-live-error-icon">${g("alert",18)}</span>
      <div>
        <strong>\u5373\u6642\u6458\u8981\u66AB\u6642\u7121\u6CD5\u53D6\u5F97</strong>
        <p>${r(s)}</p>
        <button class="btn btn-secondary btn-sm" type="button" id="home-retry">
          ${g("refresh",13)}<span>\u91CD\u65B0\u8F09\u5165</span>
        </button>
      </div>
    </div>`:`${pd(e,{loading:t})}
    <div class="home-live-foot">
      <span class="home-live-source">${g("link",12)}\u53F8\u6CD5\u9662 OpenData \xB7 \u5168\u570B\u6CD5\u898F\u8CC7\u6599\u5EAB</span>
      <span class="home-live-time">${t||!a?"\u540C\u6B65\u4E2D\u2026":`\u66F4\u65B0 ${ye(a)}`}</span>
    </div>`}function yr(e,{loading:t=!1}={}){if(t)return`<span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>
      <span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>
      <span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>`;let s=e?.judgments||{},a=e?.raw||{},n=e?.rag?.judgment_index||{};return`<span class="home-fact">
      <span class="home-fact-label">\u539F\u59CB\u5224\u6C7A\u5099\u4EFD</span>
      <strong>${c(a.raw_total)}</strong>
      <small>${c(a.archive_count)} \u500B archive \xB7 \u53F8\u6CD5\u9662 OpenData</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">\u91D1\u878D\u5224\u6C7A\u5E74\u4EFD</span>
      <strong>${r(vr(s))}</strong>
      <small>${r(to(s))} \xB7 ${c(s.financial_total)} \u7B46 current</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">\u5411\u91CF\u7D22\u5F15\u8986\u84CB</span>
      <strong>${r(Ks(n.coverage_pct))}</strong>
      <small>${c(n.indexed)} / ${c(n.total)} \u7B46 \xB7 ${r(n.model||"\u2014")}</small>
    </span>`}function ln(e,t){let s=t?.laws||{},a=t?.judgments||{},n=t?.raw||{},i=t?.sources||{};if(e==="opendata"){let l=i.opendata||{};return`<article class="home-source-card">
      <div class="home-source-head">
        <span class="home-source-icon">${g("cloud",20)}</span>
        <div>
          <strong>${r(l.label||"\u53F8\u6CD5\u9662\u8CC7\u6599\u958B\u653E\u5E73\u81FA")}</strong>
          <small>\u88C1\u5224\u66F8\u539F\u59CB\u8CC7\u6599</small>
        </div>
        <a class="home-source-link" href="${r(Et(l.url,"https://opendata.judicial.gov.tw/"))}" target="_blank" rel="noopener noreferrer">${g("external",12)}\u4F86\u6E90</a>
      </div>
      <p class="home-source-copy">\u5224\u6C7A\u5168\u6587\u3001\u6848\u865F\u3001\u6CD5\u9662\u3001\u88C1\u5224\u65E5\u671F\u8207 PDF \u9023\u7D50\u7686\u4FDD\u7559\u539F\u59CB\u6B04\u4F4D\uFF1B\u532F\u5165\u524D\u5148\u5BEB\u5165\u4E0D\u53EF\u8B8A\u7684 raw Parquet \u5099\u4EFD\u3002</p>
      <dl class="home-source-facts">
        <div><dt>\u539F\u59CB\u5224\u6C7A</dt><dd>${c(n.raw_total)}</dd></div>
        <div><dt>Archive</dt><dd>${c(n.archive_count)}</dd></div>
        <div><dt>\u88C1\u5224\u5E74\u4EFD</dt><dd>${r(vr(a))}</dd></div>
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
      <a class="home-source-link" href="${r(Et(o.url,"https://law.moj.gov.tw/"))}" target="_blank" rel="noopener noreferrer">${g("external",12)}\u4F86\u6E90</a>
    </div>
    <p class="home-source-copy">\u4EE5\u5B98\u65B9 JSON \u7AEF\u9EDE\u4E0B\u8F09\u73FE\u884C\u6CD5\u898F\u8207\u547D\u4EE4\uFF0C\u4FDD\u7559\u7248\u672C\u3001\u689D\u6587\u8207\u8B8A\u66F4\u4E8B\u4EF6\uFF1B\u5224\u6C7A\u5F15\u7528\u53EF\u56DE\u5230\u5C0D\u61C9\u689D\u865F\u3002</p>
    <dl class="home-source-facts">
      <div><dt>\u6CD5\u898F</dt><dd>${c(s.law_count)}</dd></div>
      <div><dt>\u547D\u4EE4</dt><dd>${c(s.order_count)}</dd></div>
      <div><dt>\u689D\u6587</dt><dd>${c(s.article_count)}</dd></div>
      <div><dt>\u8CC7\u6599\u7248\u672C</dt><dd>${c(s.version_count)}</dd></div>
    </dl>
    <div class="home-source-flow"><span>ZIP</span>${g("arrowRight",11)}<span>Parquet</span>${g("arrowRight",11)}<span>PostgreSQL</span>${g("arrowRight",11)}<span>Qdrant</span></div>
  </article>`}function wr(e,{loading:t=!1,error:s=""}={}){if(t)return'<div class="home-laws-loading skeleton skeleton-card"></div>';if(s)return`<div class="home-laws-error" role="status">${g("alert",16)}<span>${r(s)}</span></div>`;let a=e?.financial_laws||{},n=Array.isArray(a.laws)?a.laws:[],i=Number(a.count)||n.length,o=Math.ceil(i/br)||0,l=String(a.source_sha256||""),d=l?`${l.slice(0,12)}\u2026`:"\u2014",p=a.modified_at?Ft(a.modified_at):"\u2014";return`<details class="home-laws" id="home-laws">
    <summary class="home-laws-summary">
      <span class="home-laws-count">${c(i)}</span>
      <span class="home-laws-title">
        <strong>\u91D1\u878D\u6CD5\u898F\u6E05\u55AE</strong>
        <small>${r(a.source_path||"documents/\u91D1\u878D\u6CD5\u898F.md")} \xB7 ${br} \u6B04 \xD7 ${o} \u5217</small>
      </span>
      <span class="home-laws-toggle">
        <span>\u5C55\u958B\u6E05\u55AE</span>${g("chevronDown",14)}
      </span>
    </summary>
    <div class="home-laws-body">
      <div class="home-laws-toolbar">
        <span>\u4F86\u6E90 ${r(a.source_path||"documents/\u91D1\u878D\u6CD5\u898F.md")} \xB7 SHA-256 <span class="mono">${r(d)}</span> \xB7 \u4FEE\u6539 ${r(p)}</span>
        <button class="btn btn-secondary btn-sm" type="button" id="home-laws-download">
          ${g("download",13)}<span>\u4E0B\u8F09\u6E05\u55AE</span>
        </button>
      </div>
      ${n.length?`<div class="home-laws-grid" style="--home-law-columns:${br}" role="list">
              ${n.map((f,$)=>`<span class="home-law" role="listitem" title="${r(f)}">
                    <span class="home-law-index">${String($+1).padStart(2,"0")}</span>
                    <span class="home-law-name">${r(f)}</span>
                  </span>`).join("")}
            </div>`:'<p class="home-laws-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u6CD5\u898F\u540D\u7A31\u3002</p>'}
    </div>
  </details>`}function _r(e,{loading:t=!1,error:s=""}={}){if(t)return`<div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>`;if(s)return`<div class="home-rag-error">${g("alert",16)}<span>${r(s)}</span></div>`;let a=e?.rag||{},n=a.judgment_index||{},i=a.legal_index||{},o=a.models||{},l=Number(n.coverage_pct),d=Number.isFinite(l)?Math.max(0,Math.min(100,l)):0;return`<article class="home-rag-card">
      <span class="home-rag-kicker">JUDGMENT RETRIEVAL</span>
      <strong class="home-rag-value mono">${c(n.indexed)}<small> / ${c(n.total)}</small></strong>
      <span class="home-rag-label">\u5DF2\u7D22\u5F15 / \u91D1\u878D\u5224\u6C7A</span>
      <span class="home-rag-progress" role="img" aria-label="\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u8986\u84CB ${r(Ks(n.coverage_pct))}"><span style="width:${d.toFixed(1)}%"></span></span>
      <span class="home-rag-meta">${r(Ks(n.coverage_pct))} \xB7 ${r(n.model||"\u2014")} \xB7 ${r(n.alias||"\u2014")} \u2192 ${r(n.collection||"\u2014")}</span>
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
    </article>`}function md(){return`<ol class="home-rag-flow" aria-label="RAG \u57F7\u884C\u6D41\u7A0B">
    ${[["01","\u554F\u984C","1\u2013500 \u5B57","message"],["02","Embedding","bge-m3","brain"],["03","\u6AA2\u7D22","\u5224\u6C7A + \u6CD5\u898F\uFF0F\u547D\u4EE4","database"],["04","Rerank","cross-encoder","sliders"],["05","LLM","\u4F9D\u6AA2\u7D22\u5167\u5BB9\u56DE\u7B54","sparkles"],["06","\u5F15\u7528","[n] \u2192 \u539F\u59CB\u4F86\u6E90","link"]].map(([t,s,a,n])=>`<li class="home-rag-step">
          <span class="home-rag-step-icon">${g(n,17)}</span>
          <span class="home-rag-step-copy">
            <small>${t}</small>
            <strong>${r(s)}</strong>
            <span>${r(a)}</span>
          </span>
        </li>`).join("")}
  </ol>`}function gd(){return`<div class="home-trace">
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
  </div>`}function hr(e){return e==="failed"?"\u5931\u6557":e==="skipped"?"\u7565\u904E":e==="running"?"\u57F7\u884C\u4E2D":e==="pending"?"\u7B49\u5F85":"\u5B8C\u6210"}function fd(e,t,s,a,n,i){let o=String(e.status||"success"),l=o==="skipped"||o==="pending",d=Math.max(0,Number(e.duration_ms)||0),p=l?"\u2014":fe(d),f=o==="failed"?"var(--danger)":e.color||"#64748b",$=[`is-${o}`,o==="failed"?"is-error":"",l?"is-missing":"",i&&e.key===i?"is-slowest":""].filter(Boolean).join(" "),h=String(e.key||`stage-${t}`),u=[["\u72C0\u614B",hr(o),!0],["\u958B\u59CB",e.started_at?ye(e.started_at):"\u2014",!0],["\u7D50\u675F",e.finished_at?ye(e.finished_at):"\u2014",!0],["\u8017\u6642",p,!0],["\u5360\u6574\u9AD4",Ks(n),!0],["\u8AAA\u660E",e.message||e.caption||"",!1]].map(([_,k,A])=>A||k?`<span class="rag-wf-detail"><span>${r(_)}</span><strong>${r(String(k||"\u2014"))}</strong></span>`:"").join(""),b=l?"":`<span class="rag-wf-bar is-sequential" style="left:${s.toFixed(3)}%;width:${a.toFixed(4)}%;top:0;height:12px;--bar-color:${r(f)}" aria-hidden="true"></span>`;return`<details class="rag-wf-stage home-wf-stage ${$}${on.has(h)?" is-open":""}" data-home-wf-stage="${r(h)}"${on.has(h)?" open":""} style="--stage-color:${r(e.color||"#64748b")}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong><span class="home-wf-step">${String(t+1).padStart(2,"0")}</span> ${r(e.label||e.key||"\u968E\u6BB5")}${i&&e.key===i?' <span class="home-wf-slow">\u6700\u6162</span>':""}</strong>${e.caption?`<small>${r(e.caption)}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${r(p)} \xB7 ${r(hr(o))} <span class="rag-wf-chevron">${g("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${e.label||e.key}\uFF1A${hr(o)}\uFF0C\u8017\u6642 ${p}\uFF0C\u5360\u6574\u9AD4 ${Ks(n)}`)}">${b}</span>
    </summary>
    <div class="rag-wf-details">${u}</div>
  </details>`}function kr(e,{loading:t=!1,error:s="",clientMs:a=null}={}){if(t)return`<div class="report-card home-wf-loading" aria-live="polite">
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
    </div>`;let o=Math.max(0,Number(n.total_ms)||i.reduce((S,v)=>S+(Number(v.duration_ms)||0),0)),l=Math.max(0,Number(a)||0),d=Math.max(0,l-o),p=Math.max(o,i.reduce((S,v)=>S+(Number(v.duration_ms)||0),0),1),f=i.reduce((S,v)=>(Number(v.duration_ms)||0)>(Number(S?.duration_ms)||0)?v:S,i[0]),$=1.25,h=i.map(S=>String(S.status||"success")==="skipped"?0:Math.max((Number(S.duration_ms)||0)/p*100,$)),u=h.reduce((S,v)=>S+v,0),b=u>100?100/u:1,_=0,k=i.map((S,v)=>{let j=["skipped","pending"].includes(String(S.status||"success")),W=j?0:h[v]*b,Y=_;j||(_+=W);let we=p>0?(Number(S.duration_ms)||0)/p*100:0;return fd(S,v,Y,W,we,f?.key)}).join(""),A=i.filter(S=>S.status==="failed").length;return`<section class="report-card status-wf-card home-wf-card" data-home-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${g("activity",14)}\u9996\u9801\u5373\u6642\u8CC7\u6599\u8F09\u5165 Pipeline</span>
      <span class="home-wf-links">
        <a class="home-wf-link" href="#/status">\u5B8C\u6574\u670D\u52D9 Pipeline ${g("arrowRight",11)}</a>
        <a class="home-wf-link" href="#/performance">RAG Flow ${g("arrowRight",11)}</a>
      </span>
    </div>
    <div class="index-runtime-metrics home-wf-metrics">
      <span class="index-runtime-metric" title="\u5F8C\u7AEF /api/home \u5F9E\u7B2C\u4E00\u500B\u67E5\u8A62\u5230\u56DE\u61C9\u7D44\u88DD\u5B8C\u6210\u7684\u968E\u6BB5\u7E3D\u8017\u6642\u3002"><span>\u968E\u6BB5\u7E3D\u8017\u6642</span><strong>${r(fe(o))}</strong></span>
      <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u5F9E\u9001\u51FA\u8ACB\u6C42\u5230\u6536\u5230\u56DE\u61C9\u7684\u5BE6\u969B\u5F80\u8FD4\u6642\u9593\u3002"><span>HTTP \u5F80\u8FD4</span><strong>${r(l?fe(l):"\u2014")}</strong></span>
      <span class="index-runtime-metric" title="HTTP \u5F80\u8FD4\u6263\u6389\u5F8C\u7AEF\u968E\u6BB5\u7E3D\u8017\u6642\u5F8C\u7684\u50B3\u8F38\u8207\u6392\u968A\u6642\u9593\u3002"><span>\u50B3\u8F38\uFF0F\u6392\u968A</span><strong>${r(l?fe(d):"\u2014")}</strong></span>
      <span class="index-runtime-metric" title="\u672C\u6B21\u8F09\u5165\u8017\u6642\u6700\u9577\u7684\u968E\u6BB5\uFF0C\u4E5F\u5C31\u662F\u76EE\u524D\u6700\u660E\u986F\u7684\u74F6\u9838\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${f?.label||"\u2014"} \xB7 ${fe(f?.duration_ms||0)}`)}</strong></span>
      <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${c(i.length-A)} / ${c(i.length)}${A?` \xB7 \u5931\u6557 ${c(A)}`:""}</strong></span>
      <span class="index-runtime-metric" title="\u672C\u6B21\u6458\u8981\u7684\u7522\u751F\u6642\u9593\u3002"><span>\u66F4\u65B0\u6642\u9593</span><strong>${r(n.finished_at?ye(n.finished_at):"\u2014")}</strong></span>
    </div>
    <div class="status-wf-chart">
      <div class="rag-wf-axis"><span>0 ms</span><span>${r(fe(o))}</span></div>
      <div class="rag-wf-stages">${k}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u5BE6\u969B\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0Cbar \u9577\u5EA6\u70BA\u8A72\u968E\u6BB5\u8017\u6642\u5360\u6BD4\uFF1B\u6A19\u793A\u300C\u6700\u6162\u300D\u7684\u968E\u6BB5\u5373\u672C\u6B21\u8F09\u5165\u74F6\u9838\u3002\u9EDE\u64CA\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u3001\u5360\u6BD4\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function bd(e){return`<div class="home-source-error">${g("alert",16)}<span>${r(e)}</span></div>`}function hd(){let e=dd.map(ud).join("");return`<section class="page home-page" id="home-page">
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
        <div id="home-live-body" aria-live="polite">${cn(null,{loading:!0})}</div>
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
          ${as(null,{loading:!0})}
        </div>
        <div class="home-metric-group" id="home-law-metrics">
          ${$r(null,{loading:!0})}
        </div>
      </div>
      <div class="home-metric-strip" id="home-metric-strip">
        ${yr(null,{loading:!0})}
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
      ${md()}
      <div class="home-rag-values" id="home-rag-values">
        ${_r(null,{loading:!0})}
      </div>
      ${gd()}
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
        ${ln("opendata",null)}
        ${ln("laws",null)}
      </div>
      <div id="home-laws-slot">
        ${wr(null,{loading:!0})}
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
        ${kr(null,{loading:!0})}
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
  </section>`}function vd(e,t){let s=t?.laws||{},a=t?.judgments||{},n=t?.raw||{},i=t?.rag?.judgment_index||{},o={rag:`${c(i.indexed)} \u7B46\u7D22\u5F15`,data:`${c(s.law_count)} \u6CD5\u898F \xB7 ${c(s.order_count)} \u547D\u4EE4`,quality:`${c(n.raw_total)} \u539F\u59CB\u5224\u6C7A`,processing:`${c(n.archive_count)} archive`,performance:"Flow \xB7 Waterfall",status:"10 \u670D\u52D9\u5143\u4EF6",tests:"LLM \xB7 Reranker"};e.querySelectorAll("[data-home-tile-metric]").forEach(l=>{let d=l.dataset.homeTileMetric;d&&o[d]&&(l.textContent=o[d])})}function eo(e,t,{clientMs:s=null}={}){let a=t?.data||{},n=t?.generated_at||"",i=e.querySelector("#home-live-body");i&&(i.innerHTML=cn(a,{generatedAt:n}));let o=e.querySelector("#home-judgment-stats"),l=a.judgments||{};o&&(o.innerHTML=as({judgment_total:l.raw_total,financial_total:l.financial_total,financial_ratio:l.financial_ratio}));let d=e.querySelector("#home-law-metrics");d&&(d.innerHTML=$r(a));let p=e.querySelector("#home-metric-strip");p&&(p.innerHTML=yr(a));let f=e.querySelector("#home-rag-values");f&&(f.innerHTML=_r(a));let $=e.querySelector("#home-source-grid");$&&($.innerHTML=`${ln("opendata",a)}${ln("laws",a)}`);let h=e.querySelector("#home-laws-slot");if(h){let _=!!h.querySelector("#home-laws")?.open;h.innerHTML=wr(a);let k=h.querySelector("#home-laws");k&&_&&(k.open=!0)}let u=e.querySelector("#home-waterfall-slot");u&&(u.innerHTML=kr({...a,pipeline:t?.pipeline},{clientMs:s})),vd(e,a)}function $d(e,t){let s=e.querySelector("#home-live-body");s&&(s.innerHTML=cn(null,{error:t}));let a=e.querySelector("#home-judgment-stats");a&&(a.innerHTML=as(null));let n=e.querySelector("#home-law-metrics");n&&(n.innerHTML=$r(null));let i=e.querySelector("#home-metric-strip");i&&(i.innerHTML=yr(null));let o=e.querySelector("#home-rag-values");o&&(o.innerHTML=_r(null,{error:t}));let l=e.querySelector("#home-source-grid");l&&(l.innerHTML=bd(t));let d=e.querySelector("#home-laws-slot");d&&(d.innerHTML=wr(null,{error:t}));let p=e.querySelector("#home-waterfall-slot");p&&(p.innerHTML=kr(null,{error:t}))}async function yd(e,t){let s=!1,a=!1,n=!1,i=null,o=null,l=null,d=null,p=0;e.innerHTML=hd();let f=e.querySelector("#home-ask-form"),$=e.querySelector("#home-question"),h=e.querySelector("#home-refresh"),u=()=>{let v=String($?.value||"").trim().slice(0,500);if(!v){$?.focus();return}try{window.sessionStorage.setItem("judgment.pending_question",v)}catch{}window.__judgmentPendingQuestion=v,t&&typeof t.navigate=="function"?t.navigate("rag"):window.location.hash="#/rag"},b=()=>{$&&($.style.height="auto",$.style.height=`${Math.min($.scrollHeight,140)}px`)},_=v=>{h&&(h.disabled=v,h.classList.toggle("is-loading",v),h.setAttribute("aria-busy",v?"true":"false"))},k=async({quiet:v=!1}={})=>{if(s)return;if(a){n=!0;return}if(a=!0,p=Date.now(),_(!0),!v){let W=e.querySelector("#home-live-body");W&&(W.innerHTML=cn(null,{loading:!0}))}let j=performance.now();try{let W=await J.homeSummary();if(s||!e.isConnected)return;o=W?.data||null,l=W?.data?.financial_laws||null,ss(Zi,W),eo(e,W,{clientMs:Math.round(performance.now()-j)})}catch(W){if(s||!e.isConnected)return;$d(e,W.message||"\u7121\u6CD5\u53D6\u5F97\u9996\u9801\u5373\u6642\u8CC7\u6599\u3002")}finally{a=!1,_(!1),n&&!s&&(n=!1,k({quiet:!0}))}};$?.addEventListener("input",b),f?.addEventListener("submit",v=>{v.preventDefault(),u()}),$?.addEventListener("keydown",v=>{v.key==="Enter"&&!v.shiftKey&&!v.isComposing&&(v.preventDefault(),u())});let A=()=>{if(s||d)return;let v=Math.max(0,cd-(Date.now()-p));if(v===0){k({quiet:!0});return}d=window.setTimeout(()=>{d=null,s||k({quiet:!0})},v)};e.addEventListener("click",v=>{if(v.target.closest("#home-refresh")||v.target.closest("#home-retry")){d&&(window.clearTimeout(d),d=null),k();return}if(v.target.closest("#home-laws-download")){let j=l?.content||`${(l?.laws||[]).join(`
`)}
`;j.trim()&&Ht("\u91D1\u878D\u6CD5\u898F.md",j)}}),e.addEventListener("toggle",v=>{let j=v.target.closest?.("[data-home-wf-stage]");if(!j||!e.contains(j))return;let W=j.dataset.homeWfStage||"";W&&(j.open?on.add(W):on.delete(W))},!0),b(),$?.focus({preventScroll:!0});let S=os(Zi,300*1e3);if(S?(o=S?.data||null,l=S?.data?.financial_laws||null,eo(e,S,{clientMs:0}),k({quiet:!0})):await k(),!s)try{i=wt("processing",(v,j)=>{s||j?.initial||A()},{onError:()=>{}})}catch{i=null}return()=>{s=!0,d&&(window.clearTimeout(d),d=null),typeof i=="function"&&i(),i=null}}var Vr={};rs(Vr,{render:()=>dp});var so="judgment-console";var bt="query_history",Kt="settings",Yt="audit_events";var it={history:[],settings:new Map,audit:[],nextId:1},dn=null,ut=!("indexedDB"in window);function Pt(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function Nt(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function It(){return dn||(dn=new Promise((e,t)=>{if(!("indexedDB"in window)){ut=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(so,2)}catch(a){ut=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(bt)){let n=a.createObjectStore(bt,{keyPath:"id",autoIncrement:!0});n.createIndex("created_at","created_at"),n.createIndex("kind","kind")}if(a.objectStoreNames.contains(Kt)||a.createObjectStore(Kt,{keyPath:"key"}),!a.objectStoreNames.contains(Yt)){let n=a.createObjectStore(Yt,{keyPath:"key"});n.createIndex("created_at","created_at"),n.createIndex("dataset","dataset"),n.createIndex("jid","jid"),n.createIndex("issue_month","issue_month")}},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{ut=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{ut=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),dn)}function ao(){return"indexedDB"in window}function no(){return ut}function ya(){return ut?"memory":"indexeddb"}function wd(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},turns:Array.isArray(e.turns)?e.turns:[],pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t,updated_at:e.updated_at||t}}async function _d(){try{let t=(await It()).transaction(bt,"readwrite"),s=t.objectStore(bt),a=await Pt(s.count());if(a>120){let n=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let d=i.result;if(!d||n<=0){o();return}d.delete(),n-=1,d.continue()},i.onerror=()=>l(i.error)})}await Nt(t)}catch{ut=!0}}async function wa(e){let t=wd(e);try{let a=(await It()).transaction(bt,"readwrite"),n=a.objectStore(bt),i=await Pt(n.add(t));return await Nt(a),await _d(),i}catch{ut=!0;let a=it.nextId++;return it.history.push({id:a,...t}),it.history.length>120&&it.history.shift(),a}}async function _a(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let n=(await It()).transaction(bt,"readwrite"),i=n.objectStore(bt),o=await Pt(i.get(s));if(!o)return await Nt(n),null;let l={...o,...t,id:s};return await Pt(i.put(l)),await Nt(n),l}catch{ut=!0;let n=it.history.findIndex(i=>Number(i.id)===s);return n===-1?null:(it.history[n]={...it.history[n],...t,id:s},it.history[n])}}async function ro(e){let t=Number(e);if(!Number.isFinite(t))return!1;try{let a=(await It()).transaction(bt,"readwrite");return a.objectStore(bt).delete(t),await Nt(a),!0}catch{ut=!0;let a=it.history.findIndex(n=>Number(n.id)===t);return a===-1?!1:(it.history.splice(a,1),!0)}}async function un({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let n=(await It()).transaction(bt,"readonly"),i=n.objectStore(bt),o=await Pt(i.getAll());return await Nt(n),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,d)=>String(d.updated_at||d.created_at).localeCompare(String(l.updated_at||l.created_at))).slice(0,t)}catch{return ut=!0,it.history.filter(n=>s?`${n.kind} ${n.title} ${n.detail}`.toLowerCase().includes(s):!0).slice().sort((n,i)=>String(i.updated_at||i.created_at).localeCompare(String(n.updated_at||n.created_at))).slice(0,t)}}async function io(){try{let t=(await It()).transaction(bt,"readwrite");t.objectStore(bt).clear(),await Nt(t)}catch{ut=!0}it.history=[]}function kd(e){let t=Number(e.id??e.event_id??0)||0,s=String(e.dataset||e.kind||"judgment"),a=String(e.key||`${s}:${t||`${Date.now()}:${Math.random().toString(36).slice(2)}`}`),n=String(e.jid||""),i=String(e.issue_month||""),o=String(e.change_type||""),l=String(e.detected_at||e.created_at||new Date().toISOString());return{key:a,event_id:t,dataset:s,jid:n,issue_month:i,change_type:o,title:String(e.title||n||i||"\u7248\u672C\u8B8A\u66F4"),detail:String(e.detail||[o,i,n].filter(Boolean).join(" \xB7 ")),created_at:l,payload:e}}async function Sd(){try{let t=(await It()).transaction(Yt,"readwrite"),s=t.objectStore(Yt),a=await Pt(s.count());if(a>2e3){let n=a-2e3,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let d=i.result;if(!d||n<=0){o();return}d.delete(),n-=1,d.continue()},i.onerror=()=>l(i.error)})}await Nt(t)}catch{ut=!0}}async function oo(e){let t=(Array.isArray(e)?e:[]).filter(s=>s&&typeof s=="object").map(kd);if(!t.length)return 0;try{let a=(await It()).transaction(Yt,"readwrite"),n=a.objectStore(Yt);for(let i of t)await Pt(n.put(i));return await Nt(a),await Sd(),t.length}catch{ut=!0;let a=new Map(it.audit.map(n=>[n.key,n]));for(let n of t)a.set(n.key,n);return it.audit=Array.from(a.values()).sort((n,i)=>String(i.created_at).localeCompare(String(n.created_at))).slice(0,2e3),t.length}}async function lo({keyword:e="",limit:t=200}={}){let s=e.trim().toLowerCase(),a=n=>s?`${n.dataset} ${n.jid} ${n.issue_month} ${n.change_type} ${n.detail}`.toLowerCase().includes(s):!0;try{let i=(await It()).transaction(Yt,"readonly"),o=i.objectStore(Yt),l=await Pt(o.getAll());return await Nt(i),l.filter(a).sort((d,p)=>String(p.created_at).localeCompare(String(d.created_at))).slice(0,t)}catch{return ut=!0,it.audit.filter(a).slice().sort((i,o)=>String(o.created_at).localeCompare(String(i.created_at))).slice(0,t)}}async function co(){let e={name:so,version:2,supported:"indexedDB"in window,mode:ya(),degraded:ut,stores:[bt,Kt,Yt],caps:{history:120,audit:2e3},usage_bytes:null,quota_bytes:null};if(typeof navigator<"u"&&navigator.storage?.estimate)try{let t=await navigator.storage.estimate();e.usage_bytes=Number.isFinite(t.usage)?t.usage:null,e.quota_bytes=Number.isFinite(t.quota)?t.quota:null}catch{}try{let s=(await It()).transaction([bt,Kt,Yt],"readonly"),a=Nt(s),[n,i,o]=await Promise.all([Pt(s.objectStore(bt).count()),Pt(s.objectStore(Kt).count()),Pt(s.objectStore(Yt).count()),a]);return{...e,available:!0,counts:{query_history:n,settings:i,audit_events:o},total:n+i+o}}catch{return ut=!0,{...e,available:!1,degraded:!0,mode:"memory",counts:{query_history:it.history.length,settings:it.settings.size,audit_events:it.audit.length},total:it.history.length+it.settings.size+it.audit.length}}}async function ka(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let n=(await It()).transaction(Kt,"readwrite");return n.objectStore(Kt).put(s),await Nt(n),s}catch{return ut=!0,it.settings.set(s.key,s),s}}async function _s(e,t=null){try{let a=(await It()).transaction(Kt,"readonly"),n=a.objectStore(Kt),i=await Pt(n.get(String(e)));return await Nt(a),i?i.value:t}catch{ut=!0;let a=it.settings.get(String(e));return a?a.value:t}}async function uo({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await It()).transaction(Kt,"readonly"),n=a.objectStore(Kt),i=await Pt(n.getAll());return await Nt(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return ut=!0,Array.from(it.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function po(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var Or={};rs(Or,{buildFlowWaterfallStages:()=>xn,render:()=>Iu,renderRagPipelineWaterfall:()=>Sn,renderTestFlowPanel:()=>ea,renderWaterfallStages:()=>Zs});var xd={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},Ad=new Set(["running","stopping"]);function gn(e){let[t,s]=xd[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${r(t)}</span>`}function pn(e){return String(e).padStart(2,"0")}function Ys(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${pn(t.getMonth()+1)}-${pn(t.getDate())} ${pn(t.getHours())}:${pn(t.getMinutes())}`}function mn(e){return Ad.has(e)}function ds(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function Es(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function ks(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${r(e)}</span>
    <strong>${r(String(t))}</strong>
    ${s?`<small>${r(s)}</small>`:""}
  </div>`}function mo(e={}){let t=e.score_components||e,s=e.gate||{},a=String(s.status||""),n=a==="pass"?"Gate \u901A\u904E":a==="fail"?"Gate \u5931\u6557":a==="no_data"?"Gate \u7121\u8CC7\u6599":"";return`${n?`<span class="badge ${a==="pass"?"badge-ok":a==="fail"?"badge-danger":"badge-neutral"}">${r(n)}</span>`:""}<div class="bench-metrics">
    ${ks("Law Recall",Es(t.law_recall))}
    ${ks("Article Recall",Es(t.article_recall))}
    ${ks("Citation Valid",Es(t.citation_valid_rate))}
    ${ks("Judge",ds(t.judge_overall))}
    ${ks("Human",ds(t.human_overall))}
    ${ks("p50",fe(e.duration_p50_ms))}
    ${ks("p95",fe(e.duration_p95_ms))}
    ${ks("Success",`${c(e.success||0)} / ${c(e.total||0)}`)}
  </div>`}function go(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${r(s.replace(/^rag\./,""))}</span>
      <strong>${fe(a.p50_ms)}</strong>
      <small>p95 ${fe(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function fo(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${Es(s.law_recall)}</span>
    <span>Article ${Es(s.article_recall)}</span>
    <span>Judge ${ds(s.judge_overall)}</span>
    <span>p95 ${fe(t.duration_p95_ms)}</span>`}function bo(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function ho(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${r(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${r(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${r(e.status||"")}">${gn(e.status)}</span>
      <span class="mono">${r(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${r(ye(e.started_at))}</span>
      <span data-bench-slot="run-completed">${c(e.completed_cases||0)} / ${c(e.total_cases||0)} \u984C</span>
      <span>${r(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${r(bo(e))}">${fo(e)}</span>
  </button>`}function Ar(e,t=[]){let s=e.metrics||{},a=e.judge||{},n=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([p])=>p.startsWith("rag.")).map(([p,f])=>`<span class="chip">${r(p)} ${fe(f)}</span>`).join(""),d=(e.law_sources||[]).map(p=>`<span class="chip">${r(p.law_name||"\u6CD5\u898F")} ${c((p.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${r(e.question)}</span>
      ${gn(e.status)}
      <span class="bench-case-time">${fe(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${ds(i.deterministic)} \xB7 Judge ${ds(i.judge)} \xB7 Human ${ds(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${r((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${r(e.fingerprint||"")}">${g("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
      </div>
      <div class="bench-case-stages">${l||'<span class="qb-muted">\u6C92\u6709 stage timing</span>'}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${Es(s.law_recall)}</span>
        <span>Article recall ${Es(s.article_recall)}</span>
        <span>Citation ${s.citation_valid?"valid":"invalid"}</span>
        <span>Refusal ${s.refusal_correct===null?"\u2014":s.refusal_correct?"correct":"wrong"}</span>
      </div>
      <div class="chips">${d||'<span class="qb-muted">\u6C92\u6709\u6CD5\u898F\u4F86\u6E90</span>'}</div>
      <div class="bench-answer"><strong>\u56DE\u7B54</strong><p>${r(e.answer||"\u2014")}</p></div>
      <div class="bench-judge"><strong>LLM judge</strong><p>${r(a.rationale||a.reason||"\u2014")}</p><span>${[["correctness",a.correctness],["grounding",a.grounding],["citation",a.citation],["clarity",a.clarity],["overall",a.overall]].map(([p,f])=>`${p} ${f??"\u2014"}`).join(" \xB7 ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${e.id}">
        <div class="bench-human-grid">
          ${[["correctness","\u6B63\u78BA\u6027",n.scores?.correctness??4],["grounding","\u6709\u64DA\u6027",n.scores?.grounding??4],["citation","\u5F15\u7528",n.scores?.citation??4],["clarity","\u6E05\u695A",n.scores?.clarity??4],["overall","\u6574\u9AD4",n.overall??4]].map(([p,f,$])=>Qa({name:`score_${p}`,label:f,value:$})).join("")}
        </div>
        <label class="field"><span class="field-label">\u4EBA\u5DE5\u6279\u6CE8</span><input class="input" name="comment" value="${r(n.comment||"")}" placeholder="\u56DE\u7B54\u54C1\u8CEA\u3001\u5F15\u7528\u6216\u4E8B\u5BE6\u932F\u8AA4" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${g("check",13)}<span>\u5132\u5B58\u4EBA\u5DE5\u8A55\u5206</span></button>
      </form>
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(p=>`<div class="bench-history-row"><span>${r(ye(p.run?.started_at))}</span><span>${r(p.run?.config?.llm_model||"\u2014")}</span><span>Det ${ds(p.metrics?.scores?.deterministic)}</span><span>Judge ${ds(p.metrics?.scores?.judge)}</span><span>Human ${ds(p.metrics?.scores?.human)}</span><span>${fe(p.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function xr(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function vo(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${Ar(e,t)}
  </details>`}function $o(e){return`${gn(e.status)}
    <span class="mono">${r(e.run_id)}</span>
    ${mn(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${g("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function qd(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${r(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${g("activity",14)}${r(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${r((e.status||"")+":"+e.run_id)}">
        ${$o(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${mo(e.summary||{})}</div>
    <div data-bench-detail="stages">${go(e.summary||{})}</div>
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
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>vo(a,t[a.fingerprint]||[])).join(""):Oe({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function yo(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${g("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${g("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function wo(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),n=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,n-i):0,l=(t||[]).filter(b=>["success","failed"].includes(b.status)).map(b=>Number(b.duration_ms)||0).filter(b=>b>0),d=null;if(l.length)d=l.reduce((b,_)=>b+_,0)/l.length;else if(a>0){let b=Date.parse(e.updated_at||""),_=Number.isFinite(b)?b:i;Number.isFinite(_)&&_>i?d=(_-i)/a:o>0&&(d=o/a)}let p=(t||[]).find(b=>b.status==="running")||null,f=0;if(a<s&&d&&d>0){let b=p?Date.parse(p.started_at||""):NaN,_=Date.parse(e.updated_at||""),k=Number.isFinite(b)?b:_;Number.isFinite(k)&&(f=Math.max(0,Math.min(.95,(n-k)/d)))}let $=Math.min(s,a+f),h=s>0?Math.max(0,Math.min(100,$/s*100)):0,u=d===null?null:Math.max(0,s-$)*d;return{total:s,completed:a,elapsedMs:o,averageMs:d,progress:h,etaMs:u,ratePerMin:d?6e4/d:null,running:p}}function _o(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${fe(e)}`}function ko(e,t=[]){let s=wo(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${r(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${c(s.completed)} / ${c(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${_o(s.etaMs)}</span>
      <span data-bench-slot="progress-rate">${s.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${s.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`}</span>
    </div>
    <div class="processing-bar processing-bar-lg bench-progress-bar${s.completed===0?" is-waiting":""}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.progress.toFixed(1)}" data-bench-slot="progress-bar">
      <span class="processing-bar-fill" data-bench-slot="progress-fill" style="width:${s.progress.toFixed(2)}%"></span>
    </div>
    <div class="bench-progress-foot">
      <span data-bench-slot="progress-elapsed">\u5DF2\u57F7\u884C ${fe(s.elapsedMs)}</span>
      <span data-bench-slot="progress-average">${s.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${fe(s.averageMs)}\uFF0F\u984C`}</span>
      <span>\u5373\u6642\u9810\u4F30 \xB7 \u6BCF\u5B8C\u6210\u4E00\u984C\u6821\u6B63</span>
    </div>
  </div>`}function Md(e){let t=e.models?.models||{},s=e.suites||[],a=Sa(e),n=e.selectedRun;return`<section class="report-card bench-card">
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
      <label class="field"><span class="field-label">Run \u6A19\u7C64</span><input class="input" name="label" value="${r(e.config.label||Ys())}" /></label>
      <div class="qb-actions" data-bench-actions data-signature="${r(a?`${a.run_id}:${a.status}`:"")}">
        ${yo(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${r(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?ko(a,qr(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>ho(i,n?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${n?qd(n,e.history):""}
  </section>`}function Sa(e){let t=(e.runs||[]).find(s=>mn(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!mn(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function qr(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function So(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:Ys(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",refreshStream:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),n=M=>{let q=new FormData(M);return{label:String(q.get("label")||"").trim()||Ys(),embedding_model:String(q.get("embedding_model")||""),llm_model:String(q.get("llm_model")||""),judge_model:String(q.get("judge_model")||""),top_k:Number(q.get("top_k")||4),score_threshold:Number(q.get("score_threshold")||.35),repeats:Number(q.get("repeats")||1),enable_law_retrieval:M.elements.enable_law_retrieval?.checked??!0,judge_enabled:M.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(M=>`${M.id}:${M.name}:${M.item_count}:${M.version}:${M.status}`)]:null,runs:(s.runs||[]).map(M=>`${M.run_id}:${M.label||""}:${M.suite_version||1}`)}),o=()=>{let q=a()?.querySelector("[data-bench-live]"),T=Sa(s);if(!q||!T)return;let X=wo(T,qr(s,T)),me=(Ae,I)=>{let Se=q.querySelector(`[data-bench-slot="${Ae}"]`);Se&&Se.textContent!==I&&(Se.textContent=I)};me("progress-count",`${c(X.completed)} / ${c(X.total)} \u984C`),me("progress-percent",`${X.progress.toFixed(1)}%`),me("progress-eta",_o(X.etaMs)),me("progress-rate",X.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${X.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),me("progress-elapsed",`\u5DF2\u57F7\u884C ${fe(X.elapsedMs)}`),me("progress-average",X.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${fe(X.averageMs)}\uFF0F\u984C`),me("progress-state",T.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let V=q.querySelector('[data-bench-slot="progress-bar"]');V&&(V.setAttribute("aria-valuenow",X.progress.toFixed(1)),V.classList.toggle("is-waiting",X.completed===0));let de=q.querySelector('[data-bench-slot="progress-fill"]');de&&(de.style.width=`${X.progress.toFixed(2)}%`)},l=M=>{let q=M.querySelector("[data-bench-actions]");if(!q)return;let T=Sa(s),X=T?`${T.run_id}:${T.status}`:"";q.dataset.signature!==X&&(q.dataset.signature=X,q.innerHTML=yo(T))},d=M=>{let q=M.querySelector("[data-bench-live-wrap]");if(!q)return;let T=Sa(s),X=T?`${T.run_id}:${T.status}:${T.total_cases}`:"";q.dataset.signature!==X&&(q.dataset.signature=X,q.innerHTML=T?ko(T,qr(s,T)):"")},p=M=>{let q=M.querySelector("[data-bench-runs]");if(!q)return;let T=s.runs||[],X=[...q.querySelectorAll("[data-run-id]")].map(V=>V.dataset.runId),me=T.map(V=>V.run_id);if(X.join("|")!==me.join("|")){q.innerHTML=T.length?T.map(V=>ho(V,s.selectedRun?.run_id===V.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let V of T){let de=q.querySelector(`[data-run-id="${V.run_id}"]`);if(!de)continue;de.classList.toggle("is-active",s.selectedRun?.run_id===V.run_id);let Ae=de.querySelector('[data-bench-slot="run-label"]');Ae&&Ae.textContent!==(V.label||"RAG Benchmark")&&(Ae.textContent=V.label||"RAG Benchmark");let I=de.querySelector('[data-bench-slot="run-status"]');I&&I.dataset.status!==(V.status||"")&&(I.dataset.status=V.status||"",I.innerHTML=gn(V.status));let Se=de.querySelector('[data-bench-slot="run-completed"]');if(Se){let Re=`${c(V.completed_cases||0)} / ${c(V.total_cases||0)} \u984C`;Se.textContent!==Re&&(Se.textContent=Re)}let oe=de.querySelector('[data-bench-slot="run-scores"]'),ke=bo(V);oe&&oe.dataset.signature!==ke&&(oe.dataset.signature=ke,oe.innerHTML=fo(V))}},f=M=>{let q=s.selectedRun;if(!q)return;let T=M.querySelector(`.bench-detail[data-run-id="${q.run_id}"]`);if(!T)return;let X=T.querySelector("[data-bench-detail-actions]");if(X){let oe=`${q.status||""}:${q.run_id}`;X.dataset.signature!==oe&&(X.dataset.signature=oe,X.innerHTML=$o(q))}let me=T.querySelector('[data-bench-detail="metrics"]');if(me){let oe=JSON.stringify(q.summary||{});me.dataset.signature!==oe&&(me.dataset.signature=oe,me.innerHTML=mo(q.summary||{}))}let V=T.querySelector('[data-bench-detail="stages"]');if(V){let oe=JSON.stringify((q.summary||{}).stages||{});V.dataset.signature!==oe&&(V.dataset.signature=oe,V.innerHTML=go(q.summary||{}))}let de=T.querySelector("[data-bench-cases]");if(!de)return;let Ae=q.cases||[];if(!Ae.length)return;let I=de.querySelector(".notice");I&&I.remove();let Se=new Map([...de.querySelectorAll("details.bench-case")].map(oe=>[Number(oe.dataset.resultId),oe]));for(let oe of Ae){let ke=s.history[oe.fingerprint]||[],Re=xr(oe,ke),Me=Se.get(Number(oe.id));if(!Me){de.insertAdjacentHTML("beforeend",vo(oe,ke)),Me=de.lastElementChild,Me&&(Me._benchSignature=Re);continue}if(Me._benchSignature===Re||!s.forcedCaseIds.delete(Number(oe.id))&&Me.contains(document.activeElement))continue;let ge=Me.open;Me.innerHTML=Ar(oe,ke),Me.open=ge,Me._benchSignature=Re}},$=()=>{Sa(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},h=()=>{let M=a();M&&(l(M),d(M),p(M),f(M),o(),$())},u=M=>{let q=s.selectedRun;if(!q)return;let T=M.querySelector('[data-bench-detail="metrics"]');T&&(T.dataset.signature=JSON.stringify(q.summary||{}));let X=M.querySelector('[data-bench-detail="stages"]');X&&(X.dataset.signature=JSON.stringify((q.summary||{}).stages||{}));let me=M.querySelector("[data-bench-cases]");if(!me)return;let V=new Map((q.cases||[]).map(de=>[Number(de.id),de]));for(let de of me.querySelectorAll("details.bench-case")){let Ae=V.get(Number(de.dataset.resultId));Ae&&(de._benchSignature=xr(Ae,s.history[Ae.fingerprint]||[]))}},b=(M=!1)=>{let q=a();if(!q)return;let T=i();if(!M&&s.renderSignature===T){h();return}s.renderSignature=T,s.forcedCaseIds.clear(),q.innerHTML=Md(s),u(q),h()},_=async({refreshAll:M=!1,runs:q=null}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||M;return}s.loading=!0;try{if(!s.referenceLoaded||M){let[I,Se]=await Promise.all([J.benchmarkModels(),J.benchmarkSuites()]);s.models=I,s.suites=Se.suites||[],s.indexVersion=I.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=I.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=I.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(I.models?.llm||[]).find(oe=>oe!==s.config.llm_model)||"")}let T=q?{runs:q}:await J.benchmarkRuns(30);s.runs=T.runs||[];let X=s.activeRunId,me=s.runs.find(I=>mn(I.status))||null;s.activeRunId=me?.run_id||"";let V=s.selectedRun?.run_id||"";V||(V=me?.run_id||s.runs[0]?.run_id||"");let de=!!(s.selectedRun&&X&&s.selectedRun.run_id===X);V&&(!s.selectedRun||s.selectedRun.run_id!==V||V===me?.run_id||de)?s.selectedRun=await J.benchmarkRun(V,!0):V||(s.selectedRun=null),s.loaded=!0,b()}catch(T){if(!s.loaded){s.renderSignature="";let X=a();X&&(X.innerHTML=Oe({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:r(T.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let T=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,_({refreshAll:T})}}},k=()=>{s.refreshStream||(s.refreshStream=wt("benchmark",(M,q)=>{s.loading||_({runs:q?.snapshot?.runs||null})}))},A=async M=>{try{s.selectedRun=await J.benchmarkRun(M,!0),b()}catch(q){N(q.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},S=async M=>{!s.labelTouched&&M.elements.label&&(M.elements.label.value=Ys());let q=n(M);s.config=q;let T=Number(M.elements.suite_id?.value||0);if(!T){N("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await J.startBenchmarkRun({suite_id:T,config:q,actor:"anonymous"}),N("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=Ys(),s.labelTouched=!1,await _()}catch(X){N(X.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},v=async M=>{try{await J.stopBenchmarkRun(M),N("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await _()}catch(q){N(q.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},j=async M=>{let q=Number(M.dataset.resultId||0),T=new FormData(M),X={};for(let me of["correctness","grounding","citation","clarity","overall"]){let V=Number(T.get(`score_${me}`));Number.isFinite(V)&&(X[me]=V)}try{await J.reviewBenchmarkResult(q,{reviewer:"anonymous",scores:X,comment:String(T.get("comment")||"")}),N("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await J.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(q)),b()}catch(me){N(me.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},W=async M=>{if(M)try{let q=await J.benchmarkFingerprintHistory(M,50);s.history[M]=q.cases||[];let T=s.selectedRun,X=a();if(!T||!X)return;let me=(T.cases||[]).filter(V=>V.fingerprint===M);for(let V of me){let de=X.querySelector(`details.bench-case[data-result-id="${V.id}"]`);if(!de)continue;let Ae=de.open;de.innerHTML=Ar(V,s.history[M]),de.open=Ae,de._benchSignature=xr(V,s.history[M])}}catch(q){N(q.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},Y=async M=>{let q=M.target.closest("[data-bench-action]");if(!q)return;let T=q.dataset.benchAction;T==="open-run"?await A(q.dataset.runId||""):T==="stop"?await v(q.dataset.runId||""):T==="fingerprint-history"&&await W(q.dataset.fingerprint||"")},we=async M=>{let q=M.target.closest("[data-bench-form]");q&&(M.preventDefault(),q.dataset.benchForm==="run"?await S(q):q.dataset.benchForm==="human"&&await j(q))},be=M=>{M&&(M.elements.label&&M.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=n(M),M.elements.suite_id&&(s.selectedSuiteId=Number(M.elements.suite_id.value)||s.selectedSuiteId))},ne=M=>{let q=M.target.closest('[data-bench-form="run"]');q&&be(q)};return e.addEventListener("click",Y),e.addEventListener("submit",we),e.addEventListener("input",ne),e.addEventListener("change",ne),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=Ys();let M=a()?.querySelector('input[name="label"]');M&&(M.value=s.config.label)}k(),_({refreshAll:!s.referenceLoaded})},refresh(){return k(),_({refreshAll:!0})},destroy(){e.removeEventListener("click",Y),e.removeEventListener("submit",we),e.removeEventListener("input",ne),e.removeEventListener("change",ne),s.refreshStream&&s.refreshStream(),s.refreshStream=null,s.tickTimer&&window.clearInterval(s.tickTimer)}}}var Cr={};rs(Cr,{exportCsv:()=>yn,exportableResult:()=>wn,render:()=>uu,renderReport:()=>hn,reportError:()=>$n,reportLoading:()=>xa});var Eo=[10,25,50,100],xo=500,Ld=["law_name","law_level","law_category","law_modified_date","article_count"],jd=["jid","court_normalized","title","jdate","matched_laws","citation_count"],Td={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function vn(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function fn(e,t){let s={};for(let a of e.fields||[]){let n=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?n:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{},fuzzyTerms:[]}}function Ed(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,n]of Object.entries(s))if(Array.isArray(n)&&!n.map(String).includes(String(t[a]??"")))return!1;return!0}function Rr(e,t){return(e.fields||[]).filter(s=>Ed(s,t))}function Nd(e,t){return`filter-${e.id}-${t}`}function Ns(e){return e==null?"":r(String(e))}function Mr(e,t,s){let a=s[t.key],n=Nd(e,t.key),i=t.help?`<span class="field-help">${r(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(d=>`<option value="${Ns(d.value)}" ${String(d.value)===String(a??"")?"selected":""}>${r(d.label??d.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${n}" name="${r(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),d=(t.options||[]).map(p=>`<label class="multi-option">
          <input type="checkbox" name="${r(t.key)}" value="${Ns(p.value)}" ${l.has(String(p.value))?"checked":""} />
          <span>${r(p.label??p.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${d}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${n}" name="${r(t.key)}"
        value="${Ns(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${Ns(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${n}" name="${r(t.key)}"
        value="${Ns(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${n}" name="${r(t.key)}"
      value="${Ns(a)}"
      placeholder="${Ns(t.placeholder||"")}" />
    ${i}
  </div>`}function Ao(e,t,{focusTable:s=!1}={}){let a=Rr(e,t.values),n=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(n.push(`<div class="field-row">${Mr(e,o,t.values)}${Mr(e,l,t.values)}</div>`),i+=1):n.push(Mr(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
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
  </form>`}function bn(e,t,s){let a={...s.values};for(let n of Rr(t,a))if(n.type==="checkbox"){let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=!!i?.checked}else if(n.type==="multiselect")a[n.key]=Array.from(e.querySelectorAll(`[name="${n.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=i?i.value:""}return a}function No(e,t){let s={};for(let a of Rr(e,t.values)){let n=t.values[a.key];a.type==="checkbox"?s[a.key]=!!n:a.type==="multiselect"?s[a.key]=Array.isArray(n)?n:[]:a.type==="number"?s[a.key]=n===""||n===null?"":Number(n):s[a.key]=n??""}return s}function Lr(e,t){let s=No(e,t);return Array.isArray(t.fuzzyTerms)&&t.fuzzyTerms.length&&(s.keywords=[...t.fuzzyTerms]),(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function Rd(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${Oe({tone:t,title:`${vn(e)} ${Ot(e.status).label}`,text:r(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function Cd(e,t){return`<label class="field data-source-field">
    <span class="field-label">\u8CC7\u6599\u4F86\u6E90</span>
    <select class="select" name="database">
      ${e.map(s=>{let a=Ot(s.status);return`<option value="${r(s.id)}" ${s.id===t?"selected":""}>${r(s.label)} \xB7 ${r(a.label)}</option>`}).join("")}
    </select>
  </label>`}function qo(e,t){return`<nav class="data-nav" aria-label="\u8CC7\u6599\u67E5\u8A62\u529F\u80FD">
    ${[{id:"law",label:"\u67E5\u8A62\u6CD5\u898F\u547D\u4EE4",hint:"Fuzzy \u6CD5\u898F\u540D\u7A31\u3001\u985E\u5225\u8207\u547D\u4EE4",icon:"file"},{id:"judgment",label:"\u67E5\u8A62\u5224\u6C7A",hint:"Fuzzy \u6CD5\u9662\u3001\u6848\u865F\u8207\u6848\u7531",icon:"layers"},{id:"schema",label:"\u8CC7\u6599\u5EAB Schema",hint:"\u8CC7\u6599\u8868\u3001\u6B04\u4F4D\u8207\u9810\u89BD",icon:"table"}].map(a=>{let n=a.id==="schema"?t==="schema":t==="query"&&e===a.id;return`<button class="data-nav-item${n?" is-active":""}" type="button"
          data-action="data-nav" data-tab="${a.id}" ${n?'aria-current="page"':""}>
          <span class="data-nav-icon">${g(a.icon,15)}</span>
          <span class="data-nav-copy">
            <strong>${r(a.label)}</strong>
            <small>${r(a.hint)}</small>
          </span>
        </button>`}).join("")}
  </nav>`}function Pd(e,t,s){if(t.id!=="postgres"&&t.id!=="parquet")return"";let a=Array.isArray(s.fuzzyTerms)?s.fuzzyTerms:[],n=e==="law"?"Fuzzy \u6CD5\u898F\uFF0F\u547D\u4EE4":"Fuzzy \u5224\u6C7A",i=e==="law"?"\u8F38\u5165\u6CD5\u898F\u540D\u7A31\u6216\u76F8\u8FD1\u5B57\u2026":"\u8F38\u5165\u6CD5\u9662\u3001\u6848\u865F\u3001\u6848\u7531\u6216\u76F8\u8FD1\u5B57\u2026";return`<div class="data-fuzzy" data-data-fuzzy data-fuzzy-kind="${e}">
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
  </div>`}function jr(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],n=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function Id(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||r(e.detail||"")}function Dd(e){return`<div class="report-empty">
    ${ft({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:r({postgres:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u6CD5\u898F\u6216\u5224\u6C7A\u689D\u4EF6\uFF0C\u518D\u8996\u9700\u8981\u5C55\u958B\u9032\u968E metadata \u689D\u4EF6\u3002",parquet:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u689D\u4EF6\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\uFF1B\u53EF\u5C55\u958B\u9032\u968E\u689D\u4EF6\u8ABF\u6574\u6B04\u4F4D\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
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
  </div>`}function xa(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(vn(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function $n(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(vn(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Oe({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${g("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Bd(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,n=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${r(s.label||"\u672A\u5206\u985E")}">${r(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${n.toFixed(1)}%"></span></span>
          <span class="dist-value">${c(a)}</span>
        </div>`}).join("")}
  </div>`}function Ro(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function Fd(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function Od(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function Hd(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${r(String(t))}"
    title="\u6AA2\u8996\u300C${r(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${r(String(t))}${g("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var zd={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function Ud(e,t,s,a=!1,n=!0,i=!1){let o=a?e.key:e.label||e.key,l=n?t?zd[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${r(o)}</th>`;let d=s?.key===l,p=d?s.direction:null,f=p==="asc"?"ascending":p==="desc"?"descending":"none",$=p==="asc"?"\u2191":p==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${f}">
    <button class="table-sort${d?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${r(l)}"
      title="\u4F9D${r(o)}\u6392\u5E8F">
      <span>${r(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${$}</span>
    </button>
  </th>`}function Gd(e,t){if(!Ro(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,n=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(n||""),lawName:String(t.law_name||"")}}function Qd(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${r(s.lawKey)}"
    data-law-source="${r(s.sourceType)}"
    data-law-name="${r(s.lawName)}"
    title="\u6AA2\u8996\u300C${r(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(String(a))}${g("chevronRight",12,"law-link-icon")}</button>`}function Co(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:n=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],d=(e.page-1)*e.page_size,p=Ro(e),f=Fd(e),$=Od(e),h=e.meta?.sort||null,u=n?`<tr class="schema-search-row">
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
      <span class="muted" style="font-size:10px">${c(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${p?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":f?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":$?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${u}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(b=>Ud(b,f,h,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((b,_)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${d+_+1}</td>
                ${o.map(k=>{if((f||$)&&k.key==="jid")return`<td class="cell-jid">${Hd(b)}</td>`;let A=p&&k.key==="law_name"?Gd(e,b):null;if(A)return`<td>${Qd(b,k,A)}</td>`;let v={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[k.type];return`<td${v?` class="${v}"`:""}>${Ga(b[k.key],k.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${ft({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function Jd(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Eo.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${g("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${g("chevronRight",13)}</button>
    </div>
  </div>`}function Po(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${r(t)}</div>`).join("")}</div>`}function hn(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],n=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",d=e.status||"ok",p=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${r(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${r(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${r(e.label||l)}
          ${Ke(d)}
          <span class="chip">${r(p)}</span>
        </div>
        <div class="report-sub">
          ${c(i)} \u7B46\u7B26\u5408 \xB7
          ${fe(e.duration_ms)} \xB7
          ${r(String(l).toUpperCase())} / ${r(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${g("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${g("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${Oe({tone:d==="not_configured"?"info":d==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:""}

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
        ${Bd(n)}
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
        ${Po(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?Co(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?Jd({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function Mo(e){return`<div class="report-card schema-preview">
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
  </div>`}function Tr(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let n=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${Oe({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${r(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${r(t||e.table||"\u8CC7\u6599\u8868")}
          ${Ke(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${r(String(e.database||""))} / ${r(String(e.table||"\u2014"))} \xB7 ${n.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${Co({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${Po(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${c(i.length)} \u7B46</span>
      <strong>\u5171 ${c(e.total)} \u7B46</strong>
    </div>
  </div>`}function Lo(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${r(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${Oe({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function Vd(e){return`<div class="report-empty">
    ${ft({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${vn(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function Er(e){return e.is_current===!0?Ke("ok","\u73FE\u884C"):e.law_abandon_note?Ke("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?Ke("empty","\u6B77\u53F2\u7248\u672C"):Ke("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function lt(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${r(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function Rs(e){return e?Ft(e):"\u2014"}function Wd(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function Nr(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${r(e)}</span>
    </div>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </div>`:""}function Kd(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${r(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${g("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </details>`:""}function Yd(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let n=a?.name||a?.url||"";return n?a.url?`<a class="law-attachment" href="${r(Et(a.url))}" target="_blank" rel="noopener noreferrer">
          ${g("file",12)}<span>${r(n)}</span>${g("external",11)}
        </a>`:`<span class="law-attachment">${g("file",12)}<span>${r(n)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${c(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function Io(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Xd(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,n=s?`${c(a)} \u689D \xB7 ${c(s)} \u7AE0\u7BC0`:`${c(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${r(l)}</div>`;let d=Td[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${r(Io(o.article_no))}">
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
  </div>`}function Zd(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function Xs(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${g("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function eu(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${Xs()}
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
  </div>`}function tu(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${Xs()}
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
        ${Oe({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function su(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let n=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",n,a.article_count_for_law?`${c(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${r(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${r(i)}</option>`}).join("")}
    </select>
  </label>`}function au(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let n={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${n[o]} ${c(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">\u7248\u672C\u8B8A\u66F4</span>
      <span class="muted">${r(i)}</span>
    </summary>
    <div class="law-version-change-list">
      ${a.length?a.slice(0,20).map(o=>{let l=o.change_type==="added"?"badge-ok":o.change_type==="removed"?"badge-danger":"badge-warn",d=o.before_content?`<details><summary>\u8B8A\u66F4\u524D</summary><pre>${r(o.before_content)}</pre></details>`:"",p=o.after_content?`<details><summary>\u8B8A\u66F4\u5F8C</summary><pre>${r(o.after_content)}</pre></details>`:"";return`<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${l}">${r(n[o.change_type]||o.change_type)}</span>
                    <strong>${r(o.article_no||o.article_key)}</strong>
                  </div>
                  ${d}${p}
                </div>`}).join(""):'<div class="report-empty-inline">\u6B64\u7248\u672C\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u8B8A\u66F4\u3002</div>'}
      ${e.changes_truncated?'<div class="report-empty-inline">\u50C5\u986F\u793A\u524D 20 \u7B46\u8B8A\u66F4\uFF1BAPI \u56DE\u50B3\u4E0A\u9650 200 \u7B46\u3002</div>':""}
    </div>
  </details>`}function nu(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let n=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(_=>_.article_type!=="C").length,l=Wd(e),d=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",p=e.meta?.snapshot||"",f=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",$=[l,d,f,p].filter(Boolean).join(" \xB7 "),h=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",u=e.version||{},b=[lt("\u6CD5\u898F\u4F4D\u968E",r(e.law_level||"\u2014")),lt("\u6CD5\u898F\u985E\u5225",r(e.law_category||"\u2014")),lt("\u7570\u52D5\u65E5\u671F",Rs(e.law_modified_date)),lt("\u751F\u6548\u65E5\u671F",Rs(e.law_effective_date)),lt("\u689D\u6587\u6578",c(e.article_count)),lt("\u8CC7\u6599\u72C0\u614B",Er(e)),lt("\u82F1\u8B6F\u540D\u7A31",r(e.eng_law_name||"\u2014")),lt("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${r(e.law_key||"\u2014")}</span>`)];return u.first_seen_version_id!==null&&u.first_seen_version_id!==void 0&&b.push(lt("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${r(u.first_seen_version_id)}`)),u.last_seen_version_id!==null&&u.last_seen_version_id!==void 0&&b.push(lt("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${r(u.last_seen_version_id)}`)),u.last_seen_at&&b.push(lt("\u6700\u5F8C\u6536\u9304\u6642\u9593",r(ye(u.last_seen_at)))),u.selected_version_id!==null&&u.selected_version_id!==void 0&&b.push(lt("\u689D\u6587\u7248\u672C",`#${r(u.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${Xs()}
      <span class="law-report-origin" title="${r($)}">${r($)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${r(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${r(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${r(i)}
            ${Er(e)}
            <span class="chip">${r(h)}</span>
          </div>
          <div class="report-sub">
            ${r([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${c(e.article_count)} \u689D \xB7 \u7570\u52D5 ${Rs(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${su(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">${g("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${n.length?`<div class="report-alert">${Oe({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n.map(_=>r(_)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${c(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${Rs(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${r(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${Er(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${r(l)}</span>
        </div>
        <div class="law-meta-grid">${b.join("")}</div>
      </div>

      ${au(e)}
      ${Nr("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${Kd("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${Nr("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${Nr("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${Yd(e.attachments)}
      ${Xd(e)}
    </div>
    ${o>100?Zd():""}
  </div>`}function ru(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Xs()}
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
  </div>`}function iu(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Xs()}
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
        ${Oe({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function ou(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${r(t)}"
    data-law-source=""
    data-law-name="${r(t)}"
    title="\u6AA2\u8996\u300C${r(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(t)}${g("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function lu(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let n=String(s.article_no||"").trim();n&&t.get(a).add(n)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${ou(s)}
          <span class="judgment-citation-articles">${[...a].map(n=>r(n)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function cu(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",n=String(e.full_text||""),i=Number(e.full_text_length)||n.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[lt("\u6848\u865F",r(e.jid||"\u2014")),lt("\u5E74\u5EA6",r(e.jyear||"\u2014")),lt("\u5B57\u5225",r(e.jcase||"\u2014")),lt("\u865F\u78BC",r(e.jno||"\u2014")),lt("\u6CD5\u9662",r(e.court||"\u2014")),lt("\u6848\u7531",r(e.title||"\u2014")),lt("\u88C1\u5224\u65E5\u671F",Rs(e.jdate)),lt("\u4F86\u6E90\u58D3\u7E2E\u6A94",r(e.source_archive||"\u2014")),lt("\u5168\u6587\u9577\u5EA6",`${c(i)} \u5B57`),lt("\u5F15\u7528\u6578",c(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(lt("\u532F\u5165 Run",`#${r(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Xs()}
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
            ${r(e.court||"\u2014")} \xB7 ${Rs(e.jdate)} \xB7
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
          <div class="summary-value">${Rs(e.jdate)}</div>
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
        ${lu(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${c(i)} \u5B57</span>
        </div>
        ${n?`<div class="judgment-fulltext">${r(n)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function jo(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function yn(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(jo).join(",")],n=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([n+o+1,...t.map(l=>i[l.key])].map(jo).join(","))}),`\uFEFF${a.join(`\r
`)}`}function wn(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,n]of Object.entries(t))a.startsWith("_")||(s[a]=n);return s})}}function du(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function To(e,t){let s=performance.now(),a=No(e,t),n=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,d=[],p=[],f=[],$=[];if(n==="audit_events"){try{let v=Number(await _s("audit.last_event_id",0))||0,j=await J.versioningAudit({since_id:v,limit:500}),W=Array.isArray(j?.events)?j.events:[];W.length&&await oo(W.map(we=>({...we,dataset:"judgment"})));let Y=Number(j?.latest_event_id||0);Y>v&&await ka("audit.last_event_id",Y)}catch(v){d.push(`\u7248\u672C audit \u540C\u6B65\u5931\u6557\uFF1A${v.message||v}`)}p=(await lo({keyword:i,limit:xo})).map(v=>({created_at:v.created_at,dataset:v.dataset,issue_month:v.issue_month,change_type:v.change_type,jid:v.jid,detail:v.detail})),f=[{key:"created_at",label:"\u6642\u9593",type:"datetime"},{key:"dataset",label:"\u8CC7\u6599\u96C6",type:"text"},{key:"issue_month",label:"\u6708\u4EFD",type:"mono"},{key:"change_type",label:"\u8B8A\u66F4",type:"status"},{key:"jid",label:"\u6848\u865F",type:"mono"},{key:"detail",label:"\u6458\u8981",type:"longtext"}];let S=new Map;p.forEach(v=>S.set(v.change_type||"unknown",(S.get(v.change_type||"unknown")||0)+1)),$=Array.from(S.entries()).map(([v,j])=>({label:v,value:j})).sort((v,j)=>j.value-v.value)}else if(n==="settings"){p=(await uo({keyword:i})).map(v=>({key:v.key,value:po(v.value),updated_at:v.updated_at})),f=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let S=new Map;p.forEach(v=>{let j=String(v.key||"").split(".")[0]||"\u5176\u4ED6";S.set(j,(S.get(j)||0)+1)}),$=Array.from(S.entries()).map(([v,j])=>({label:v,value:j})).sort((v,j)=>j.value-v.value)}else{p=(await un({keyword:i,limit:xo})).map(v=>({kind:du(v.kind),title:v.title,detail:v.detail,created_at:v.created_at})),f=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let S=new Map;p.forEach(v=>S.set(v.kind,(S.get(v.kind)||0)+1)),$=Array.from(S.entries()).map(([v,j])=>({label:v,value:j})).sort((v,j)=>j.value-v.value)}let h=p.length,u=(o-1)*l,b=p.slice(u,u+l),_=Math.round(performance.now()-s),k=no();return k&&d.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:k?"degraded":"ok",message:k?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:n,columns:f,rows:b,total:h,page:o,page_size:l,duration_ms:_,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(h)},{label:"\u76EE\u524D\u9801\u9762",value:`${b.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:ya()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${_} ms`}],distribution:$,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${n}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${u}`,warnings:d,meta:{store:n,filters:a,client_side:!0}}}async function uu(e,t){let s=!1,a=null,n=[],i="law",o=null,l={},d=0,p=25,f="query",$=null,h=null,u=0,b=[],_=null,k=-1,A=0,S=0,v=null,j=null,W=null;e.innerHTML=`<section class="page data-page">
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
      ${as(null,{loading:!0})}
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
  </section>`;let Y=e.querySelector("#query-sidebar"),we=e.querySelector("#data-nav"),be=e.querySelector("#db-options-wrap"),ne=e.querySelector("#filter-area"),M=e.querySelector("#schema-area"),q=e.querySelector("#query-main"),T=e.querySelector("#schema-suggest-popover"),X=e.querySelector("#catalog-meta"),me=e.querySelector("#refresh-catalog"),V=e.querySelector("#data-judgment-stats"),de=x=>n.find(E=>E.id===x),Ae=()=>de(i)?.databases||[],I=x=>Ae().find(E=>E.id===x),Se=(x,E)=>`${x}:${E}`,oe=(x,E=i)=>l[Se(E,x.id)],ke=(x,E)=>{ka(x,E).catch(()=>{})},Re=()=>{if(!a){X.textContent="CATALOG \xB7 \u96E2\u7DDA",X.className="badge badge-danger badge-mono";return}let x=Ae(),E=x.filter(F=>F.available).length,C=de(i);X.textContent=`CATALOG \xB7 ${C?.label||i} \xB7 ${E}/${x.length} \u53EF\u7528`,X.className="badge badge-neutral badge-mono"},Me=x=>{q.innerHTML=Dd(x)},Pe=()=>{let x=j?.returnScroll??W?.returnScroll;j=null,W=null;let E=I(o),C=E?oe(E):null;f==="schema"&&h?.result?q.innerHTML=Tr(h.result,qe(E,h.tableId),{columnFilters:h.columnFilters||{},searchEnabled:E.id==="postgres"||E.id==="parquet"}):C?.result?q.innerHTML=hn(C.result):E&&Me(E),typeof x=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:x,behavior:"smooth"}))},ge=(x="law-article-jump")=>{let E=q.querySelector(`#${x}`),C=Io(E?.value);if(!C){N("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),E?.focus();return}let Z=[...q.querySelectorAll("[data-article-no]")].find(ce=>ce.dataset.articleNo===C);if(!Z){N(`\u627E\u4E0D\u5230\u7B2C ${C} \u689D\u3002`,"warn");return}Z.scrollIntoView({behavior:"instant",block:"center"}),Z.classList.add("is-jump-target"),window.setTimeout(()=>Z.classList.remove("is-jump-target"),2400)},ee=async({lawKey:x,sourceType:E="",lawName:C="",versionId:F=""})=>{let Z=I(o),ce=Z?oe(Z):null,pe=f==="schema"?h?.result:null;if(!Z||!ce?.result&&!pe||!x)return;let Fe=++d;j={seq:Fe,lawKey:x,sourceType:E,lawName:C,versionId:F?String(F):"",page:1,detail:null,database:Z.id,returnScroll:window.scrollY},W=null,q.innerHTML=eu(C||x),q.scrollIntoView({behavior:"smooth",block:"start"});try{let Ie=await J.lawDetail(x,E,j.versionId);if(s||!j||j.seq!==Fe)return;j.detail=Ie,j.page=1,q.innerHTML=nu(Ie,{database:j.database,lawPage:j.page})}catch(Ie){if(s||!j||j.seq!==Fe)return;q.innerHTML=tu(Ie,C||x),N(Ie.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},ue=async({jid:x})=>{let E=I(o),C=E?oe(E):null,F=f==="schema"?h?.result:null;if(!E||!C?.result&&!F||!x)return;let Z=++d;j=null;let ce=E.id==="parquet"?"parquet":"postgres";W={seq:Z,jid:x,detail:null,database:E.id,source:ce,returnScroll:window.scrollY},q.innerHTML=ru(x),q.scrollIntoView({behavior:"smooth",block:"start"});try{let pe=await J.judgmentDetail(x,ce);if(s||!W||W.seq!==Z)return;W.detail=pe,q.innerHTML=cu(pe,{database:W.database})}catch(pe){if(s||!W||W.seq!==Z)return;q.innerHTML=iu(pe,x),N(pe.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},ve=(x,E)=>`${i}:${x.id}:${E}`,qe=(x,E)=>(x.tables||[]).find(C=>C.id===E)?.label||E,Be=(x,E,{sort:C=null,columnFilters:F={}}={})=>{let Z={column_filters:F};return x.id==="postgres"?(Z.table=E,Z.schema_preview=!0):x.id==="parquet"&&i==="judgment"?(Z.table="judgment_documents",Z.columns=jd):x.id==="parquet"&&(Z.dataset="all",Z.columns=Ld),C?.key&&(Z.sort=`${C.key}:${C.direction}`),Z},P=async(x,E,{sort:C=null,columnFilters:F={},quiet:Z=!1}={})=>{if(!E)return;st();let ce=ve(x,E),pe=++u,Fe=!!(Z&&h?.result&&h.key===ce);$={tableId:E},h={key:ce,tableId:E,loading:!0,result:null,error:null,sort:C,columnFilters:F},Fe?q.setAttribute("aria-busy","true"):(M.innerHTML=jr(x,de(i)?.label||i,E),q.innerHTML=Mo(qe(x,E)));try{let Ie;if(x.id==="indexeddb"){let Ce=fn(x,10);Ce.values.store=E,Ce.page=1,Ie=await To(x,Ce)}else x.id==="qdrant"?Ie={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:E,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(Ie=await J.query({database:x.id,filters:Be(x,E,{sort:C,columnFilters:F}),page:1,pageSize:10}),C?.key&&(Ie.meta={...Ie.meta||{},sort:C}));if(s||pe!==u)return;h={key:ce,tableId:E,loading:!1,result:Ie,error:null,sort:C,columnFilters:F},q.removeAttribute("aria-busy"),f==="schema"&&$?.tableId===E&&(M.innerHTML=jr(x,de(i)?.label||i,E),q.innerHTML=Tr(Ie,qe(x,E),{columnFilters:F,searchEnabled:x.id==="postgres"||x.id==="parquet"}))}catch(Ie){if(s||pe!==u)return;h={key:ce,tableId:E,loading:!1,result:null,error:Ie,sort:C,columnFilters:F},q.removeAttribute("aria-busy"),f==="schema"&&$?.tableId===E&&(q.innerHTML=Lo(Ie,qe(x,E)))}},B=()=>{let x=I(o);if(!x)return null;if(f==="schema"&&h?.result)return{db:x,tableId:h.tableId,columnFilters:h.columnFilters||{},sort:h.sort||null,mode:"schema"};let E=x?oe(x):null,C=E?.result;return C&&(x.id==="postgres"||x.id==="parquet")?{db:x,tableId:C.table,columnFilters:E.columnFilters||{},sort:E.sort||null,mode:"query"}:null},G=(x,E,C)=>{if(!x)return;let F=`${x.db.id}:${x.tableId}:${E}`,Z=R.get(F);Z&&(window.clearTimeout(Z),R.delete(F)),st();let ce={...x.columnFilters||{}},pe=String(C||"").trim();if(pe?ce[E]=pe:delete ce[E],x.mode==="schema"){P(x.db,x.tableId,{sort:x.sort,columnFilters:ce,quiet:!0});return}let Fe=oe(x.db);Fe.columnFilters=ce,Fe.page=1,Ge(1)},R=new Map,H=()=>{(!T||T.hidden)&&!b.length&&!_||(A+=1,b=[],_=null,k=-1,T&&(T.hidden=!0,T.innerHTML=""))},Q=(x,E)=>{let C=String(x||""),F=C.toLocaleLowerCase(),Z=String(E||"").toLocaleLowerCase(),ce=new Array(C.length).fill(!1),pe=(Ve,Xe)=>{for(let nt=Ve;nt<Ve+Xe;nt+=1)nt>=0&&nt<ce.length&&(ce[nt]=!0)},Fe=F.indexOf(Z);if(Fe>=0)for(;Fe>=0;)pe(Fe,Z.length),Fe=F.indexOf(Z,Fe+Z.length);else{let Ve=[];for(let Xe of Z.match(/[一-鿿]{2,}/g)||[])for(let nt=0;nt<Xe.length-1;nt+=1)Ve.push(Xe.slice(nt,nt+2));Ve.push(...Z.match(/[a-z0-9]+/g)||[]);for(let Xe of Ve){let nt=F.indexOf(Xe);for(;nt>=0;)pe(nt,Xe.length),nt=F.indexOf(Xe,nt+Xe.length)}}let Ie="",Ce=0;for(;Ce<C.length;)if(ce[Ce]){let Ve=Ce;for(;Ve<C.length&&ce[Ve];)Ve+=1;Ie+=`<mark>${r(C.slice(Ce,Ve))}</mark>`,Ce=Ve}else{let Ve=Ce;for(;Ve<C.length&&!ce[Ve];)Ve+=1;Ie+=r(C.slice(Ce,Ve)),Ce=Ve}return Ie||r(C)},_e=(x,E)=>{if(!T)return;let C=x.getBoundingClientRect(),F=Math.min(420,Math.max(220,C.width)),Z=Math.min(360,34+E*30),ce=C.bottom+4;ce+Z>window.innerHeight-8&&(ce=Math.max(8,C.top-Z-4));let pe=Math.min(window.innerWidth-F-8,Math.max(8,C.left));T.style.width=`${F}px`,T.style.left=`${pe}px`,T.style.top=`${ce}px`},Te=x=>{if(!T)return;let E=[...T.querySelectorAll(".schema-suggest-item")];E.length&&(k=Math.max(0,Math.min(E.length-1,x)),E.forEach((C,F)=>{C.classList.toggle("is-active",F===k)}),E[k].scrollIntoView({block:"nearest"}))},Ye=x=>{let E=b[x],C=_;!E||!C||(H(),G(C,C.column,E))},dt=async(x,E,C,F)=>{if(!x||!C.trim()){H();return}let Z=++A;_={...x,column:E,input:F},k=-1;try{let ce=await J.schemaSuggest({database:x.db.id,table:x.tableId,column:E,query:C,limit:1e3});if(Z!==A||document.activeElement!==F||!T)return;let pe=Array.isArray(ce.values)?ce.values:[];if(b=pe,!pe.length){H();return}let Fe=Number(ce.total)>pe.length?`\u5171 ${c(ce.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${c(pe.length)} \u500B`:`\u5171 ${c(ce.total)} \u500B\u7B26\u5408`;T.innerHTML=`<div class="schema-suggest-head">${r(Fe)}</div>${pe.map((Ie,Ce)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${Ce}"
            title="${r(Ie)}">${Q(Ie,C)}</button>`).join("")}`,_e(F,pe.length),T.hidden=!1}catch{H()}},st=()=>{let x=document.activeElement;x instanceof HTMLElement&&x.matches("[data-schema-search]")&&x.blur(),H()},Ze=(x,{resetReport:E=!1}={})=>{st();let C=oe(x);if(we.innerHTML=qo(i,f),be.innerHTML=Cd(Ae(),x.id),f==="schema")ne.hidden=!0,ne.innerHTML="",M.hidden=!1,M.innerHTML=`<div class="schema-category-switch" role="tablist" aria-label="Schema \u985E\u5225">
        ${["law","judgment"].map(F=>{let Z=n.find(ce=>ce.id===F);return Z?`<button class="chip${i===F?" is-active":""}" type="button" role="tab" aria-selected="${i===F}" data-action="schema-category" data-category="${F}">${r(Z.label)}</button>`:""}).join("")}
      </div>${jr(x,de(i)?.label||i,$?.tableId||"")}`;else{M.hidden=!0,M.innerHTML="",ne.hidden=!1;let F=Pd(i,x,C),Z=Ao(x,C);ne.innerHTML=`${Rd(x)}${F?`${F}<details class="data-advanced"><summary>\u9032\u968E metadata \u689D\u4EF6</summary>${Z}</details>`:Z}<div class="sidebar-note">${Id(x)}</div>`}if(Re(),f==="schema"){let F=$?ve(x,$.tableId):"";if(h&&h.key===F){let Z=qe(x,h.tableId);h.loading?q.innerHTML=Mo(Z):h.error?q.innerHTML=Lo(h.error,Z):q.innerHTML=Tr(h.result,Z,{columnFilters:h.columnFilters||{},searchEnabled:x.id==="postgres"||x.id==="parquet"})}else q.innerHTML=Vd(x);return}E?Me(x):C.result?q.innerHTML=hn(C.result):Me(x)},et=(x,{persist:E=!0,resetReport:C=!1}={})=>{let F=Ae(),Z=F.find(pe=>pe.id===x)||F[0];if(!Z)return;j=null,W=null,$=null,h=null,u+=1,o=Z.id;let ce=Se(i,Z.id);l[ce]||(l[ce]=fn(Z,p)),Ze(Z,{resetReport:C}),E&&(ke(`data.last_database.${i}`,Z.id),ke("data.last_category",i))},ae=(x,{persist:E=!0,resetReport:C=!0,databaseId:F=null}={})=>{let Z=de(x)||n[0];if(!Z)return;i=Z.id,j=null,W=null;let ce=Z.databases||[],pe=F&&ce.find(Fe=>Fe.id===F)||ce.find(Fe=>Fe.id===o)||ce[0];if(o=pe?.id||null,!pe){we.innerHTML=qo(i,f),be.innerHTML=`<div class="sidebar-notice">${Oe({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,ne.innerHTML="",Re();return}et(pe.id,{persist:!1,resetReport:C}),E&&(ke("data.last_category",Z.id),ke(`data.last_database.${Z.id}`,pe.id))},tt=x=>{let E=oe(x),C=ne.querySelector("#data-filter-form");C&&(E.values=bn(C,x,E))},Ge=async(x=null,{quiet:E=!1}={})=>{let C=I(o);if(!C)return;st();let F=oe(C);tt(C),x!==null&&(F.page=x),(!Number.isFinite(F.page)||F.page<1)&&(F.page=1);let Z=++d;j=null,W=null;let ce=q.querySelector(".report-card"),pe=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!ce?q.setAttribute("aria-busy","true"):(q.removeAttribute("aria-busy"),q.innerHTML=xa(C));let Ie=ne.querySelector("#run-query");E||Ee(Ie,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Ce;if(C.id==="indexeddb"?Ce=await To(C,F):Ce=await J.query({database:C.id,filters:Lr(C,F),page:F.page,pageSize:F.pageSize}),s||Z!==d)return;if(Ce.meta={...Ce.meta||{},column_filters:F.columnFilters||{},searchable:C.id==="postgres"||C.id==="parquet",sort:F.sort||Ce.meta?.sort||null},F.result=Ce,F.page=Number(Ce.page)||F.page,F.pageSize=Number(Ce.page_size)||F.pageSize,q.removeAttribute("aria-busy"),q.innerHTML=hn(Ce),pe!==null){let Xe=q.querySelector("[data-page-size]");Xe&&(Xe.value=String(F.pageSize),Xe.focus({preventScroll:!0}))}let Ve=de(i)?.label||i;await wa({kind:"data",title:`${Ve} \xB7 ${C.label} \xB7 ${Ce.table||Ce.label||"query"}`,detail:`${c(Ce.total)} \u7B46 \xB7 ${fe(Ce.duration_ms)}`,payload:{category:i,database:C.id,filters:Lr(C,F),page:F.page,page_size:F.pageSize}}),ke("data.last_query",{category:i,database:C.id,filters:Lr(C,F),page:F.page,page_size:F.pageSize,at:new Date().toISOString()})}catch(Ce){if(s||Z!==d)return;q.removeAttribute("aria-busy"),q.innerHTML=$n(Ce,C),N(Ce.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&Z===d&&Ee(Ie,!1)}},ot=(x,E)=>{let C=x?.querySelector("[data-data-fuzzy-results]");C&&(C.innerHTML=E.length?E.map(F=>`<button class="data-fuzzy-option" type="button" role="option" data-action="select-fuzzy-term" data-term="${r(F.value)}"><span>${r(F.label||F.value)}</span><small>${r(F.meta||"")}</small></button>`).join(""):'<div class="data-fuzzy-empty">\u6C92\u6709\u76F8\u8FD1\u7D50\u679C\uFF1B\u6309 Enter \u53EF\u76F4\u63A5\u52A0\u5165\u76EE\u524D\u8F38\u5165\u7684\u95DC\u9375\u5B57\u3002</div>')},mt=async(x,E="")=>{if(!x)return;let C=I(o),F=C?oe(C):null;if(!F)return;let Z=x.dataset.fuzzyKind||i,ce=x.querySelector("[data-data-fuzzy-results]"),pe=++S;ce&&(ce.innerHTML='<div class="data-fuzzy-loading"><span class="spinner"></span><span>\u641C\u5C0B\u76F8\u8FD1\u7D50\u679C\u2026</span></div>');try{let Fe=await J.dataSuggest({kind:Z,query:E,limit:12});if(pe!==S)return;let Ie=(Fe.suggestions||[]).filter(Ce=>!F.fuzzyTerms.includes(Ce.value));ot(x,Ie)}catch(Fe){if(pe!==S)return;ce&&(ce.innerHTML=`<div class="data-fuzzy-empty">${r(Fe.message||"\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},le=(x,{focus:E=!1}={})=>{if(!x)return;let C=x.querySelector("[data-data-fuzzy-popover]"),F=x.querySelector("[data-data-fuzzy-search]");!C||!F||(C.hidden&&(C.hidden=!1,F.value="",mt(x,"")),E&&(F.focus(),F.select()))},xe=x=>{v&&(window.clearTimeout(v),v=null);let E=x?.querySelector("[data-data-fuzzy-popover]");E&&(E.hidden=!0)},We=async x=>{let E=I(o);if(!E)return;let C=oe(E),F=String(x||"").trim();!F||C.fuzzyTerms.includes(F)||(C.fuzzyTerms=[...C.fuzzyTerms,F],xe(ne.querySelector("[data-data-fuzzy]")),Ze(E),await Ge(1))},He=async x=>{let E=I(o);if(!E)return;let C=oe(E),F=String(x||"").trim();C.fuzzyTerms=C.fuzzyTerms.filter(Z=>Z!==F),Ze(E),await Ge(1)},xt=async()=>{me.disabled=!0,Ee(me,!0,"\u6574\u7406\u4E2D\u2026");try{let x=os("judgment.catalog.v1",6e5),[E,C,F,Z,ce]=await Promise.all([x?Promise.resolve(x):J.catalog(),_s("data.last_category","law"),_s("data.last_database.law","postgres"),_s("data.last_database.judgment","postgres"),_s("data.page_size",25)]);if(s)return;x||ss("judgment.catalog.v1",E),a=E,V&&(V.innerHTML=as(a.judgment_stats)),n=Array.isArray(a.categories)?a.categories:[],p=Eo.includes(Number(ce))?Number(ce):25;for(let Ve of n)for(let Xe of Ve.databases||[]){let nt=Se(Ve.id,Xe.id);l[nt]||(l[nt]=fn(Xe,p))}let pe=n.find(Ve=>Ve.id===C)||n[0];if(!pe){we.innerHTML="",be.innerHTML=`<div class="sidebar-notice">${Oe({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let Fe=pe.id==="judgment"?Z:F;if(i=pe.id,o=null,ae(pe.id,{persist:!1,resetReport:!0,databaseId:Fe}),s)return;let Ie=I(o),Ce=Ie?oe(Ie):null;Ie&&Ce&&f==="query"&&!Ce.result&&(Ie.id==="postgres"||Ie.id==="parquet")&&Ge(1),N("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(x){if(s)return;a=null,n=[],we.innerHTML="",V&&(V.innerHTML=as(null)),Re(),be.innerHTML=`<div class="sidebar-notice">${Oe({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:r(x.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${g("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,q.innerHTML=`<div class="report-empty">${ft({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(me.disabled=!1,Ee(me,!1))}};Y.addEventListener("change",x=>{let E=x.target;if(E.name==="category"){ae(E.value);return}if(E.name==="database"){et(E.value);let ce=I(o),pe=ce?oe(ce):null;ce&&pe&&!pe.result&&f==="query"&&(ce.id==="postgres"||ce.id==="parquet")&&Ge(1);return}let C=I(o);if(!C)return;let F=oe(C),Z=ne.querySelector("#data-filter-form");!Z||!E.name||(F.values=bn(Z,C,F),F.page=1,E.name==="table"&&(j=null,W=null,F.sort=null,F.columnFilters={},F.result=null,ne.innerHTML=Ao(C,F),Me(C)))}),Y.addEventListener("input",x=>{let E=x.target.closest("[data-data-fuzzy-search]");if(E){let ce=E.closest("[data-data-fuzzy]");v&&window.clearTimeout(v),v=window.setTimeout(()=>{mt(ce,E.value)},160);return}let C=I(o);if(!C)return;let F=ne.querySelector("#data-filter-form");if(!F||!x.target.name||x.target.name==="table")return;let Z=oe(C);Z.values=bn(F,C,Z)}),Y.addEventListener("keydown",x=>{let E=x.target.closest("[data-data-fuzzy-search]");if(!E)return;let C=E.closest("[data-data-fuzzy]");if(x.key==="Escape")x.preventDefault(),xe(C),E.blur();else if(x.key==="Enter"){x.preventDefault();let F=C?.querySelector("[data-action='select-fuzzy-term']");F?F.click():We(E.value)}else x.key==="ArrowDown"&&(x.preventDefault(),C?.querySelector("[data-action='select-fuzzy-term']")?.focus())}),Y.addEventListener("mouseover",x=>{let E=x.target.closest("[data-action='open-fuzzy']");E&&le(E.closest("[data-data-fuzzy]"))}),Y.addEventListener("mouseout",x=>{let E=x.target.closest("[data-data-fuzzy]");E&&(x.relatedTarget&&E.contains(x.relatedTarget)||xe(E))}),Y.addEventListener("submit",x=>{x.target.id==="data-filter-form"&&(x.preventDefault(),Ge(1))}),Y.addEventListener("click",async x=>{let E=ne.querySelector("[data-data-fuzzy] [data-data-fuzzy-popover]:not([hidden])")?.closest("[data-data-fuzzy]");E&&!x.target.closest("[data-data-fuzzy]")&&xe(E);let C=x.target.closest("[data-action]"),F=C?.dataset.action;if(F==="data-nav"){let Z=C.dataset.tab,ce=I(o);if(Z==="schema"){if(f!=="schema"){if(ce){let Ce=oe(ce),Ve=ne.querySelector("#data-filter-form");Ve&&(Ce.values=bn(Ve,ce,Ce))}f="schema",ce&&Ze(ce)}return}let pe=Z==="judgment"?"judgment":"law";f==="schema"&&(f="query"),i!==pe?ae(pe,{databaseId:o,resetReport:!1}):ce&&Ze(ce);let Fe=I(o),Ie=Fe?oe(Fe):null;Fe&&Ie&&!Ie.result&&(Fe.id==="postgres"||Fe.id==="parquet")&&Ge(1);return}if(F==="open-fuzzy"){le(C.closest("[data-data-fuzzy]"),{focus:!0});return}if(F==="select-fuzzy-term"){await We(C.dataset.term);return}if(F==="remove-fuzzy-term"){await He(C.dataset.term);return}if(F==="schema-category"){f="schema",ae(C.dataset.category||"law",{resetReport:!0});return}if(F==="select-schema-table"){let Z=I(o);if(!Z)return;P(Z,C.dataset.tableId||"");return}if(F==="reset"){let Z=I(o);if(!Z)return;j=null,W=null;let ce=oe(Z);l[Se(i,Z.id)]=fn(Z,ce.pageSize),Ze(Z),Me(Z),N("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}x.target.closest("#catalog-retry")&&xt()}),q.addEventListener("input",x=>{let E=x.target.closest("[data-schema-search]");if(!E)return;let C=B();if(!C)return;let F=E.dataset.schemaSearch||"",Z=E.value,ce=`${C.mode}:${C.db.id}:${C.tableId}:${F}`,pe=R.get(ce);if(pe&&window.clearTimeout(pe),!Z.trim()){R.delete(ce),H(),G(C,F,"");return}let Fe=window.setTimeout(()=>{R.delete(ce),dt(C,F,Z,E)},250);R.set(ce,Fe)}),q.addEventListener("keydown",x=>{let E=x.target.closest("[data-schema-search]");if(!E)return;let C=B();if(C){if(x.key==="Escape"){H();return}if(x.key==="ArrowDown"||x.key==="ArrowUp"){if(!T||T.hidden)return;x.preventDefault();let F=x.key==="ArrowDown"?1:-1;Te(k<0?F>0?0:b.length-1:k+F);return}if(x.key==="Enter"){if(x.preventDefault(),T&&!T.hidden&&k>=0){Ye(k);return}G(C,E.dataset.schemaSearch||"",E.value)}}}),T?.addEventListener("mousedown",x=>{x.preventDefault()}),T?.addEventListener("click",x=>{let E=x.target.closest("[data-schema-suggest-index]");E&&Ye(Number(E.dataset.schemaSuggestIndex))});let pt=x=>{x.target.closest("[data-schema-search]")||T?.contains(x.target)||H()};return document.addEventListener("click",pt),window.addEventListener("scroll",H,{capture:!0,passive:!0}),window.addEventListener("resize",H),q.addEventListener("keydown",x=>{x.target.matches(".law-jump-input")&&x.key==="Enter"&&(x.preventDefault(),ge(x.target.id))}),q.addEventListener("click",async x=>{let E=x.target.closest("[data-action]");if(!E)return;let C=E.dataset.action,F=I(o),Z=F?oe(F):null,ce=Z?.result;if(C==="back-to-results"){Pe();return}if(C==="open-law"){ee({lawKey:E.dataset.lawKey||"",sourceType:E.dataset.lawSource||"",lawName:E.dataset.lawName||""});return}if(C==="open-judgment"){ue({jid:E.dataset.jid||""});return}if(C==="jump-article"){ge(E.dataset.jumpInput||"law-article-jump");return}if(C==="sort-column"){let pe=E.dataset.sortKey||"";if(!pe||!F)return;if(f==="schema"&&h?.result){let Ce=h.sort,Ve=pe==="jdate"||pe==="law_modified_date"||pe==="article_count"||pe==="citation_count"||pe==="full_text_length"||pe==="created_at"||pe==="updated_at",Xe=Ce?.key===pe?Ce.direction==="asc"?"desc":"asc":Ve?"desc":"asc";P(F,h.tableId,{sort:{key:pe,direction:Xe},columnFilters:h.columnFilters||{},quiet:!0});return}if(!Z)return;let Fe=Z.sort,Ie=Fe?.key===pe?Fe.direction==="asc"?"desc":"asc":pe==="jdate"?"desc":"asc";Z.sort={key:pe,direction:Ie},Ge(1,{quiet:!0});return}if(C==="retry"){Ge(Z?.page||1);return}if(ce){if(C==="prev-page"){Ge(Math.max(1,Number(ce.page)-1),{quiet:!0});return}if(C==="next-page"){let pe=Math.max(1,Math.ceil(Number(ce.total)/Number(ce.page_size)));Ge(Math.min(pe,Number(ce.page)+1),{quiet:!0});return}if(C==="copy-query"){let pe=await qs(ce.query_text||"");N(pe?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",pe?"ok":"warn");return}if(C==="export-json"){let pe=`${ce.database}-${ce.table||"query"}-page-${ce.page}.json`;Ht(pe,JSON.stringify(wn(ce),null,2),"application/json;charset=utf-8"),N(`\u5DF2\u532F\u51FA ${pe}`,"ok");return}if(C==="export-csv"){let pe=`${ce.database}-${ce.table||"query"}-page-${ce.page}.csv`;Ht(pe,yn(ce),"text/csv;charset=utf-8"),N(`\u5DF2\u532F\u51FA ${pe}`,"ok")}}}),q.addEventListener("change",x=>{let E=x.target.closest("[data-action='select-law-version']");if(E&&j){ee({lawKey:j.lawKey,sourceType:j.sourceType,lawName:j.lawName,versionId:E.value});return}if(!x.target.matches("[data-page-size]"))return;let C=I(o);if(!C)return;let F=oe(C);F.pageSize=Number(x.target.value)||25,F.page=1,ke("data.page_size",F.pageSize),Ge(1,{quiet:!0})}),me.addEventListener("click",()=>{xt()}),await xt(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0,v&&window.clearTimeout(v);for(let x of R.values())window.clearTimeout(x);R.clear(),H(),document.removeEventListener("click",pt),window.removeEventListener("scroll",H,{capture:!0}),window.removeEventListener("resize",H)}}var Go=[10,25,50,100],pu=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function Pr(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function mu(e,t=e){return`<option value="${r(e)}">${r(t)}</option>`}function Aa(e,t,s,a,n=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${r(t)}</span>
      <span class="field-tag">${r(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${r(e)}">
      ${mu("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${r(i)}" ${String(i)===String(a)?"selected":""}>${r(i)}</option>`).join("")}
    </select>
    ${n?`<span class="field-help">${r(n)}</span>`:""}
  </div>`}function gu(e,t){let s=pu.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${Aa("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${Aa("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${Aa("model","\u6A21\u578B",e.models||[],t.model)}
    ${Aa("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${Aa("method","\u65B9\u6CD5",e.methods||[],t.method)}
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
    </div>`}function Do(){let e=document.getElementById("performance-filter-form");if(!e)return Pr();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Bo(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function Fo(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),n=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${n}.${i}`}function fu(e,t){if(!e)return"";let s=new Date(e);return Number.isNaN(s.getTime())?"":new Date(s.getTime()+Math.max(0,Number(t)||0)).toISOString()}var bu=[{key:"parsing",label:"Parsing",hint:"\u8F38\u5165\u9577\u5EA6\u3001\u89E3\u6790\u6642\u9593",names:["rag.parse_question"],color:"#64748b"},{key:"embedding",label:"Embedding",hint:"Model\u3001Token\u3001Batch\u3001\u8017\u6642",names:["rag.embed_query"],color:"#3984c6"},{key:"qdrant",label:"Qdrant Search",hint:"Collection\u3001Filter\u3001Top K\u3001\u8017\u6642",names:["rag.qdrant_search"],color:"#d97706"},{key:"reranker",label:"Reranker",hint:"Model\u3001\u5019\u9078\u7B46\u6578\u3001\u8017\u6642",names:["rag.rerank"],color:"#8b5cf6"},{key:"context",label:"Context",hint:"Chunk \u6578\u3001Token \u6578\u3001\u8017\u6642",names:["rag.context"],fallbackNames:["rag.fetch_documents","rag.build_citations"],color:"#64748b"},{key:"llm",label:"LLM",hint:"Model\u3001Input/Output Token\u3001TTFT\u3001\u8017\u6642",names:["rag.llm_request"],color:"#16a34a"}],kn={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"};function Qo(e){let t=e?.metadata?.rag_response||{},s=String(t.status||e?.metadata?.rag_status||e?.status||"");return s==="operational"||s==="success"?{label:"Completed",tone:"ok"}:s==="retrieval_only"?{label:"Abstain",tone:"warn"}:s==="preview"?{label:"Preview",tone:"info"}:s==="failed"||s==="error"?{label:"Failed",tone:"danger"}:{label:s||"Unknown",tone:"idle"}}function Ir(e){let t=Math.max(0,Number(e?.offset_ms)||0),s=Math.max(0,Number(e?.duration_ms)||0),a=Math.max(t,Number(e?.end_offset_ms)||t+s);return{...e,offset:t,end:a,duration:Math.max(s,a-t)}}function Jo(e,t=0){let s=Array.isArray(e?.segments)?[...e.segments].sort((f,$)=>Number(f.offset_ms||0)-Number($.offset_ms||0)):[],a=Math.max(Number(e?.total_ms)||0,Number(t)||0,...s.map(f=>Ir(f).end),1),n=bu.map(f=>{let $=s.filter(_=>f.names.includes(_.name));!$.length&&f.fallbackNames&&($=s.filter(_=>f.fallbackNames.includes(_.name)));let h=$.map(Ir),u=h.length?Math.min(...h.map(_=>_.offset)):null,b=h.length?Math.max(...h.map(_=>_.end)):null;return{...f,spans:h,start:u,end:b,duration:u===null?null:b-u}});for(let f of n){if(f.key!=="embedding"&&f.key!=="llm")continue;let $=[];for(let b of f.spans){let _=b.metadata||{},k=Number(_.load_duration_ms),A=Number.isFinite(k)&&k>0?k:0,S=Math.max(0,Number(b.duration)||0);$.push({...b,offset:b.offset,end:b.offset+A,duration:A,metadata:{..._,source_stage:f.label,model_load_ms:A,request_duration_ms:S,warm_duration_ms:Math.max(0,S-A),cold_start:A>=100},params:{...b.params||{},source_stage:f.label}})}if(!$.length)continue;let h=$.reduce((b,_)=>b+_.duration,0),u=f.spans.reduce((b,_)=>b+Math.max(0,Number(_.duration)||0),0);f.loadInfo={spans:$,total:h,requestTotal:u,ratio:u>0?Math.min(1,Math.max(0,h/u)):0}}let i=[...n],o=Math.max(0,...i.flatMap(f=>f.spans.map($=>$.end))),l=e?.metadata?.rag_response||{},d=Qo(e),p=Math.min(a,o);return i.push({key:"response",label:"Response",hint:"\u7E3D\u8017\u6642\u3001\u5F15\u7528\u6578\u3001\u6210\u529F\u6216 Abstain",color:"#0f766e",spans:[{offset:p,end:a,duration:Math.max(0,a-p),status:d.tone==="danger"?"error":"ok",metadata:l,params:{},started_at:e?.started_at,finished_at:e?.finished_at}],start:p,end:a,duration:Math.max(0,a-p),responseMetadata:l}),hu(i,a),{total:a,stages:i,response:l,traceStatus:d,requestId:e?.request_id||"",startedAt:e?.started_at,finishedAt:e?.finished_at,client:e?.client||{},models:Array.isArray(e?.summary?.models)?e.summary.models:[],hasLoad:i.some(f=>!!f.loadInfo)}}function hu(e,t){let s=e.reduce((i,o)=>i+Math.max(0,Number(o.duration)||0),0),a=s>0?t/s:1,n=0;for(let i of e){let o=Math.max(0,Number(i.duration)||0)*a;i.displayStart=n,i.displayDuration=o,i.displayEnd=n+o;let l=i.spans[0]||null,d=[],p=!1;if(l){let $=Math.max(0,Number(l.duration)||0),h=i.loadInfo?Math.max(0,Number(i.loadInfo.total)||0):0;if(i.loadInfo&&h>0&&i.spans.length===1&&$>0){let u=Math.min(l.end,l.offset+h),b=Math.max(0,u-l.offset),_=Math.max(0,l.end-u);if(b>0&&_>0){let k=fu(l.started_at,b),A={...l,offset:l.offset,end:u,duration:b,finished_at:k,metadata:{...l.metadata||{},source_stage:i.label,model_load_ms:b,request_duration_ms:$,warm_duration_ms:Math.max(0,$-b),cold_start:b>=100},params:{...l.params||{},source_stage:i.label}},S={...l,offset:u,end:l.end,duration:_,started_at:k,finished_at:l.finished_at};d.push({kind:"load",label:"Model Load",span:A,duration:b}),d.push({kind:"stage",label:`${i.label} \u63A8\u8AD6`,span:S,duration:_}),p=!0}}p||d.push({kind:"stage",label:i.label,span:l,duration:$})}i.detailSegments=d;let f=[];if(l&&o>0)if(p){let[$,h]=d,u=$.duration+h.duration,b=u>0?o*($.duration/u):0,_={...i,key:"model_load",label:`Model Load \xB7 ${i.label}`,spans:[$.span],duration:$.duration},k={...i,label:`${i.label} \u63A8\u8AD6`,spans:[h.span],duration:h.duration};f.push({offset:n,duration:b,color:"#0ea5e9",kind:"load",tip:_n(_,$.span)}),f.push({offset:n+b,duration:Math.max(0,o-b),color:i.color,kind:"stage",tip:_n(k,h.span,{includeLoad:!1})})}else f.push({offset:n,duration:o,color:i.color,kind:"stage",tip:_n(i,l)});i.displaySegments=f,n+=o}}function Dr(e,{includeLoad:t=!0}={}){let s=[],a=(f,$)=>{$==null||$===""||s.push([f,String($)])},n=e.spans[0]||null;if(!n)return a("\u72C0\u614B","\u6B64\u7D00\u9304\u6C92\u6709\u9019\u500B span"),s;let i=n.params||{},o=n.metadata||{},l=Vo(n),d=Br(n),p=(f,$)=>{let h=Number(f?.load_duration_ms);if(!Number.isFinite(h))return;let u=Math.max(0,h);a("Model Load",fe(u)),a("\u51B7\u555F\u52D5",u>=100?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09");let b=Math.max(0,Number($)||0);if(b>0){let _=Math.max(0,b-u);a("\u6263\u9664\u8F09\u5165\u5F8C",fe(_)),a("\u8F09\u5165\u5360\u6BD4",`${(u/b*100).toFixed(u/b>=.1?0:1)}%`)}};if(e.key==="response")return a("Trace \u72C0\u614B",e.responseMetadata.status||"\u2014"),a("Answer source",e.responseMetadata.answer_source||"\u2014"),a("Abstain",e.responseMetadata.abstain?"\u662F":"\u5426"),a("\u5F15\u7528\u7E3D\u6578",e.responseMetadata.citation_count??"\u2014"),a("\u5224\u6C7A\uFF0F\u6CD5\u898F\u5F15\u7528",`${e.responseMetadata.judgment_citations??"\u2014"} / ${e.responseMetadata.law_citations??"\u2014"}`),a("\u7E3D\u8017\u6642",fe(e.duration)),s;if(a("\u958B\u59CB",`${Fo(n.started_at)||"\u2014"} \xB7 +${n.offset.toFixed(1)} ms`),a("\u7D50\u675F",`${Fo(n.finished_at)||"\u2014"} \xB7 +${n.end.toFixed(1)} ms`),a("\u8017\u6642",fe(n.duration)),e.key==="parsing")a("\u8F38\u5165\u9577\u5EA6",o.input_length??i.input_length),a("\u6B63\u898F\u5316\u9577\u5EA6",o.normalized_length??i.normalized_length),a("\u79FB\u9664\u7A7A\u767D",o.trimmed_chars);else if(e.key==="embedding")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.active_base_url||o.base_url),a("Input tokens",o.prompt_eval_count),a("Batch",o.batch),a("\u5411\u91CF\u7DAD\u5EA6",o.dimensions),a("Fallback",o.fallback_used?"\u662F":"\u5426"),t&&p(o,n.duration);else if(e.key==="qdrant")a("Collection",o.collection||i.collection),o.filter&&a("Filter",Bo(o.filter)),a("Top K",o.top_k??i.limit),a("Hits",o.hits),a("Unique judgments",o.unique_judgments),a("Top score",o.top_score);else if(e.key==="reranker")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Rerank \u72C0\u614B",o.status),a("Fallback",o.fallback_used?"\u662F":"\u5426"),a("\u5019\u9078\u7B46\u6578",o.candidates),a("\u9078\u7528\u7B46\u6578",o.selected),a("Top score",o.top_score),Array.isArray(o.errors)&&o.errors.length&&a("\u932F\u8AA4",o.errors.join(" \xB7 "));else if(e.key==="context")a("Chunks",o.chunks),a("\u5224\u6C7A chunks",o.judgment_chunks),a("\u6CD5\u898F chunks",o.law_chunks),a("Token \u4F30\u7B97",o.token_estimate),a("Context \u5B57\u5143",o.context_chars),a("\u6587\u4EF6\u6578",o.documents);else if(e.key==="llm")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Input tokens",o.input_tokens),a("Output tokens",o.output_tokens),a("TTFT",o.ttft_ms===null||o.ttft_ms===void 0?"\u2014":fe(o.ttft_ms)),a("API \u7E3D\u8017\u6642",o.total_duration_ms===null||o.total_duration_ms===void 0?"\u2014":fe(o.total_duration_ms)),t&&p(o,n.duration),a("Strict retry",o.strict?"\u662F":"\u5426");else if(e.key==="model_load"){if(a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("\u4F86\u6E90\u968E\u6BB5",o.source_stage),a("\u51B7\u555F\u52D5",o.cold_start?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09"),a("\u6A21\u578B\u547C\u53EB\u7E3D\u8017\u6642",o.request_duration_ms===null||o.request_duration_ms===void 0?"\u2014":fe(o.request_duration_ms)),a("\u8F09\u5165\u8017\u6642",o.model_load_ms===null||o.model_load_ms===void 0?"\u2014":fe(o.model_load_ms)),a("\u6263\u9664\u8F09\u5165\u5F8C\u6D41\u7A0B\u6642\u9593",o.warm_duration_ms===null||o.warm_duration_ms===void 0?"\u2014":fe(o.warm_duration_ms)),Number(o.request_duration_ms)>0&&Number(o.model_load_ms)>=0){let f=Number(o.model_load_ms)/Number(o.request_duration_ms)*100;a("\u8F09\u5165\u5360\u6BD4",`${f.toFixed(f>=10?0:1)}%`)}o.eval_duration_ms!==null&&o.eval_duration_ms!==void 0&&a("\u63A8\u8AD6\u8017\u6642",fe(o.eval_duration_ms))}else if(e.key==="segment"||e.key==="test_stage")if(a("Model",d||o.model||i.model),a("\u72C0\u614B",o.status||n.status),e.key==="test_stage")a("\u9032\u5EA6",o.progress===null||o.progress===void 0?"":`${Number(o.progress)||0}%`),n.error&&a("\u932F\u8AA4",n.error);else{n.error&&a("\u932F\u8AA4",n.error);for(let[f,$]of Object.entries(i).slice(0,10))a(f,Bo($))}return e.spans.length>1&&(e.key==="model_load"?a("\u5404\u6A21\u578B\u8F09\u5165",e.spans.map(f=>`${f.metadata?.source_stage||"model"} ${Br(f)} ${fe(f.metadata?.model_load_ms||0)}`).join(" \xB7 ")):(a("Span \u6578",e.spans.length),a("Span \u660E\u7D30",e.spans.map((f,$)=>`#${$+1} +${f.offset.toFixed(0)}ms/${fe(f.duration)}`).join(" \xB7 ")))),n.module&&a("Module",n.module),n.function&&a("Function",n.function),s}function vu(e){let t=String(e||"").trim();if(!t)return"";try{return new URL(t.includes("://")?t:`http://${t}`).hostname||t}catch{return t}}function Vo(e){let t=e?.metadata||{},s=String(t.provider_name||"").trim();if(s)return s;let a=String(t.active_base_url||t.base_url||e?.params?.url||"").trim();return vu(a)}function $u(e){let t=e?.metadata||{};return String(t.model||e?.params?.model||"").trim()}function Br(e){let t=Vo(e),s=$u(e);return s?t?`${t}:${s}`:s:""}function yu(e){let t=new Set;for(let s of e?.spans||[]){let a=Br(s);a&&t.add(a)}return[...t]}function _n(e,t,s={}){let a=Dr({...e,spans:[t]},s);return[String(e.label||""),...a.map(([n,i])=>`${n}: ${i}`)].join(`
`)}function wu(e,t){let s=e.spans||[],a=yu(e),n=Array.isArray(e.displaySegments)?e.displaySegments:null,i=7,o=Math.max(1,Math.min(4,s.length)),l=s.length>1,d=n?12:l?Math.max(12,o*i):12,p=n?n.map(k=>{if(Number(k.duration)<=0)return"";let A=Math.max(0,Math.min(100,k.offset/t*100)),S=Math.min(100-A,k.duration/t*100);return`<span class="rag-wf-bar is-sequential${k.kind==="load"?" is-load":""}" style="left:${A.toFixed(3)}%;width:${S.toFixed(4)}%;top:0;height:12px;--bar-color:${k.color}"
            data-rag-wf-tip="${r(k.tip)}"
            aria-label="${r(k.tip)}" role="img"></span>`}).join(""):s.slice(0,4).map((k,A)=>{if(Number(k.duration)<=0)return"";let S=Math.max(0,Math.min(100,k.offset/t*100)),v=Math.max(.35,Math.min(100-S,k.duration/t*100)),j=l?A*i:0,W=l?6:12,Y=_n(e,k);return`<span class="rag-wf-bar" style="left:${S.toFixed(3)}%;width:${v.toFixed(3)}%;top:${j}px;height:${W}px"
            data-rag-wf-tip="${r(Y)}"
            aria-label="${r(Y)}" role="img"></span>`}).join(""),f=Array.isArray(e.detailSegments)?e.detailSegments:[],$=f.length>1?f.map(k=>{let A=k.kind==="load"?{...e,key:"model_load",label:`Model Load \xB7 ${e.label}`,spans:[k.span],duration:k.duration}:{...e,label:`${e.label} \u63A8\u8AD6`,spans:[k.span],duration:k.duration},S=Dr(A,{includeLoad:k.kind!=="stage"});return`<div class="rag-wf-detail-group">
              <div class="rag-wf-detail-group-head">
                <strong>${r(k.label)}</strong>
                <span>${r(fe(k.duration))}</span>
              </div>
              <div class="rag-wf-detail-grid">${S.map(([v,j])=>`<span class="rag-wf-detail"><span>${r(v)}</span><strong>${r(j)}</strong></span>`).join("")}</div>
            </div>`}).join(""):"",h=Dr(e).map(([k,A])=>`<span class="rag-wf-detail"><span>${r(k)}</span><strong>${r(A)}</strong></span>`).join(""),u=f.length>1?`<div class="rag-wf-details is-split">${$}</div>`:`<div class="rag-wf-details">${h}</div>`,b=s.length?s.some(k=>k.status==="error")?"is-error":"":"is-missing",_=s.length?fe(e.duration):"\u672A\u8A18\u9304";return`<details class="rag-wf-stage ${b}" style="--stage-color:${e.color}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong>${r(e.label)}</strong><small>${r(e.hint)}</small>${a.length?`<small class="rag-wf-model-line">${r(a.join(" \xB7 "))}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${_} \xB7 ${s.length?`${s.length} span`:"\u2014"} <span class="rag-wf-chevron">${g("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:${d}px">${p}</span>
    </summary>
    ${u}
  </details>`}function Wo(e,t,s=!1){let a=e.response||{},n=e.client||{},i=e.models||[];return`<div class="rag-wf-summary">
      <span>\u7E3D\u8017\u6642 <strong>${r(fe(e.total))}</strong></span>
      <span>Server <strong>${r(fe(t))}</strong></span>
      ${n.total_ms?`<span>Client <strong>${r(fe(n.total_ms))}</strong></span>`:""}
      ${n.render_ms!==void 0?`<span>Render <strong>${r(fe(n.render_ms))}</strong></span>`:""}
      <span>\u5F15\u7528 <strong>${r(String(a.citation_count??"\u2014"))}</strong></span>
      <span>Abstain <strong>${a.abstain?"\u662F":"\u5426"}</strong></span>
      ${i.length?`<span>Model <strong>${r(i.join(" \xB7 "))}</strong></span>`:""}
      ${s?'<span class="rag-wf-updating">\u66F4\u65B0\u4E2D\u2026</span>':""}
    </div>`}function Zs(e,t,s="\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\uFF0C\u67E5\u770B\u53C3\u6578\u3001Token\u3001TTFT\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u4F86\u6E90\u6578\u91CF\u3002Waterfall \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u5E73\u884C\u57F7\u884C\u7684 span \u6703\u4F9D\u5BE6\u969B\u6642\u9593\u91CD\u758A\u986F\u793A\u3002",{legend:a=""}={}){return`<div class="rag-wf-axis"><span>0 ms</span><span>${r(fe(t))}</span></div>
    ${a}
    <div class="rag-wf-stages">${(e||[]).map(n=>wu(n,t)).join("")}</div>
    <p class="rag-wf-hint">${r(s)}</p>`}function Ko(e){let t=(e.stages||[]).some(n=>n.loadInfo),s=t?'<div class="rag-wf-legend"><span><i class="is-load"></i>Model Load\uFF08\u968E\u6BB5 bar \u524D\u6BB5\uFF09</span></div>':"",a=t?"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\uFF1BEmbedding\uFF0FLLM \u7684\u85CD\u8272\u524D\u6BB5\u70BA Model Load\uFF0C\u5F8C\u6BB5\u70BA\u63A8\u8AD6\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001Token \u8207\u8F09\u5165\u5360\u6BD4\u53EF\u5C55\u958B\u67E5\u770B\u3002":"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207 Token \u53EF\u5C55\u958B\u67E5\u770B\u3002";return Zs(e.stages,e.total,a,{legend:s})}function Sn(e,{serverDurationMs:t=0,loading:s=!1,embedded:a=!1}={}){if(!e||typeof e!="object")return"";let n=Jo(e,t),i=n.traceStatus;return`<section class="report-card rag-wf-card${a?" rag-wf-embedded":""}">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${kn[i.tone]||kn.idle}">${r(i.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(n.requestId||"\u2014")}</span>
          \xB7 ${r(ye(n.startedAt))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <a class="btn btn-secondary btn-sm" href="#/performance">
          ${g("activity",14)}<span>\u5B8C\u6574 Flow</span>
        </a>
      </div>
    </div>
    ${Wo(n,t,s)}
    ${Ko(n)}
  </section>`}var St=null;function _u(){return St||(St=document.createElement("div"),St.className="rag-wf-tooltip",St.hidden=!0,document.body.appendChild(St),St)}function Fr(){St&&(St.hidden=!0)}function Yo(e){if(!St||St.hidden)return;let t=14,s=10,a=St.getBoundingClientRect(),n=e.clientX+t,i=e.clientY+t;n+a.width>window.innerWidth-s&&(n=e.clientX-a.width-t),i+a.height>window.innerHeight-s&&(i=e.clientY-a.height-t),St.style.left=`${Math.max(s,n)}px`,St.style.top=`${Math.max(s,i)}px`}document.addEventListener("pointerover",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=_u(),a=t.dataset.ragWfTip||"";a&&(s.textContent=a,s.hidden=!1,Yo(e))});document.addEventListener("pointermove",e=>{if(!(!St||St.hidden)){if(!e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]")){Fr();return}Yo(e)}});document.addEventListener("pointerout",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=e.relatedTarget;s instanceof Node&&t.contains(s)||Fr()});window.addEventListener("scroll",Fr,{capture:!0,passive:!0});function ku(e,t,s,a){if(a&&!e.length)return`<div class="report-card rag-wf-card">
      ${Oe({tone:"danger",title:"RAG Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">${g("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;if(!e.length)return`<div class="report-card rag-wf-card">
      ${ft({iconName:"activity",title:s?"\u8B80\u53D6 RAG Pipeline\u2026":"\u5C1A\u7121 RAG Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684 RAG \u554F\u7B54 Trace\u3002":"\u7522\u751F\u65B0\u7684 RAG \u554F\u7B54\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A Parsing\u3001Embedding\u3001Qdrant\u3001Context\u3001LLM \u8207 Response \u7684 waterfall\u3002"})}
    </div>`;let n=e.find(p=>String(p.id)===String(t))||e[0],i=n.flow&&typeof n.flow=="object"?n.flow:{},o=Jo(i,n.duration_ms),l=o.traceStatus,d=e.map(p=>{let f=Qo(p.flow||{});return`<option value="${r(String(p.id))}" ${String(p.id)===String(n.id)?"selected":""}>#${r(String(p.id))} \xB7 ${r(ye(p.started_at))} \xB7 ${r(fe(p.duration_ms))} \xB7 ${r(f.label)}</option>`}).join("");return`<section class="report-card rag-wf-card">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${kn[l.tone]||kn.idle}">${r(l.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(o.requestId||n.request_id||"\u2014")}</span>
          \xB7 ${r(ye(n.started_at))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <label class="rag-wf-select">Trace
          <select class="select" data-rag-trace-select aria-label="\u9078\u64C7 RAG Trace">${d}</select>
        </label>
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">
          ${g("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    ${Wo(o,n.duration_ms,s)}
    ${Ko(o)}
  </section>`}function Su(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},n=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?fe(a.avg_total_ms??0):"\u2014",o=a.samples?fe(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
                    <span class="perf-model-count">${c(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${fe(l.avg_ms)}`:""}</span>
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
                    <span class="perf-seg-ms">${fe(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function ht(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),n=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(n).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:n?`${n}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function Xo(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function xu(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let n=Number(a.points_per_second)||0,i=Math.max(2,n/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${r(Xo(a))}</strong>
          <span>${r(ye(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${r(`${c(a.indexed_count)} \u7B46 \xB7 ${ht(a.duration_ms)} \xB7 ${c(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${n.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${c(a.indexed_count)} \u7B46 \xB7 ${ht(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function Au(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${r(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${r(`${s.label} ${ht(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${r(s.key)}"></i>
            <span>${r(s.label)}</span>
            <strong>${ht(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 llama-server Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function qu(e,t){let s=(Array.isArray(e)?e:[]).map(A=>({elapsed:Math.max(0,Number(A.elapsed_s)||0),indexed:Math.max(0,Number(A.indexed)||0)})).filter(A=>A.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(A=>A.elapsed),(Number(t)||0)/1e3,1),n=Math.max(...s.map(A=>A.indexed),1),i=760,o=150,l=12,d=12,p=i-l*2,f=o-d*2,$=s.map(A=>[l+A.elapsed/a*p,o-d-A.indexed/n*f]),h=$.map(([A,S],v)=>`${v===0?"M":"L"}${A.toFixed(1)},${S.toFixed(1)}`).join(" "),u=`${h} L${$[$.length-1][0].toFixed(1)},${o-d} L${$[0][0].toFixed(1)},${o-d} Z`,b=Math.max(1,Math.ceil($.length/14)),_=$.map(([A,S],v)=>v%b===0||v===$.length-1?`<circle cx="${A.toFixed(1)}" cy="${S.toFixed(1)}" r="2.6" />`:"").join(""),k=[0,1,2,3].map(A=>{let S=d+f/3*A;return`<line x1="${l}" y1="${S.toFixed(1)}" x2="${i-l}" y2="${S.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${c(n)} \u7B46 \xB7 ${ht(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${k}
      <path d="${u}" class="index-progress-area"></path>
      <path d="${h}" class="index-progress-line"></path>
      ${_}
      <line x1="${l}" y1="${o-d}" x2="${i-l}" y2="${o-d}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${d}" x2="${l}" y2="${o-d}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${ht(a*500)}</span>
      <span>${ht(a*1e3)}</span>
    </div>
  </div>`}function Mu(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},n=t.coverage||{},i=n.total_judgments>0?`${c(n.indexed_judgments)} / ${c(n.total_judgments)}\uFF08${(100*n.indexed_judgments/n.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:c(t.indexed_count),note:`${c(t.batch_count)} \u6279 \xD7 ${c(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:ht(t.duration_ms),note:`${c(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:ht(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${ht(t.batch_min_ms)} \xB7 \u6700\u6162 ${ht(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${c(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${r(Xo(t))}</span>
    </div>
    <div class="index-perf-summary">
      ${o.map(l=>`<div class="index-perf-stat">
            <div class="summary-label">${r(l.label)}</div>
            <div class="index-perf-value">${r(l.value)}</div>
            <div class="index-perf-note">${r(l.note)}</div>
          </div>`).join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${r(ye(t.started_at))}</span>
      <span><strong>batch</strong> ${c(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${c(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${c(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${r(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${ht(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${xu(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${ht(t.duration_ms)}</span>
        </div>
        ${Au(t)}
      </div>
    </div>
    ${qu(t.progress,t.duration_ms)}
  </section>`}var Oo=["#22d3ee","#a78bfa","#f59e0b","#ec4899","#3b82f6","#10b981","#f97316","#8b5cf6","#64748b"];function Ho(e){let t=String(e?.host||e?.url||"").trim(),s=e?.port?`:${e.port}`:"";return`${t||"\u2014"}${s}`}function Lu(e,t,s,a){if(a&&!e)return`<div class="report-card rag-wf-card">
      ${Oe({tone:"danger",title:"\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${g("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=Array.isArray(e?.runs)?e.runs:[];if(!n.length)return`<div class="report-card rag-wf-card">
      ${ft({iconName:"layers",title:s?"\u8B80\u53D6\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline\u2026":"\u5C1A\u7121\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684\u7248\u672C\u5316\u7D22\u5F15\u7D00\u9304\u3002":"\u57F7\u884C\u300CQdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A host/model\u3001Blue-Green collection \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002"})}
    </div>`;let i=n.find(S=>String(S.id)===String(t))||e?.latest||n[n.length-1],o=i?.pipeline&&typeof i.pipeline=="object"?i.pipeline:null,d=[...n].reverse().map(S=>{let v=Number(S.pipeline?.version_id||S.version_id||0),j=v?`v${String(v).padStart(3,"0")}`:"\u7D22\u5F15";return`<option value="${r(String(S.id))}" ${String(S.id)===String(i.id)?"selected":""}>${r(`${ye(S.started_at)} \xB7 ${j} \xB7 ${ht(S.duration_ms)}`)}</option>`}).join(""),p=Number(o?.version_id||i.version_id||0),f=p?`v${String(p).padStart(3,"0")}`:"\u2014",$=o?.host||{},h=Ho($),u=o?.model||i.model||"\u2014",b=Number(o?.total_ms)||Number(i.duration_ms)||0,_=Array.isArray(o?.stages)?o.stages:[],k=_.map((S,v)=>({...S,ms:Math.max(0,Number(S.duration_ms)||0),color:Oo[v%Oo.length]})).filter(S=>S.ms>0).map(S=>`<span class="index-pipeline-seg" style="width:${(S.ms/Math.max(1,b)*100).toFixed(2)}%;background:${r(S.color)}" title="${r(`${S.label} ${ht(S.ms)}`)}"></span>`).join(""),A=_.map((S,v)=>{let j=Math.max(0,Number(S.duration_ms)||0),W=b>0?j/b*100:0,Y=S.host&&typeof S.host=="object"?S.host:null;return`<div class="index-pipeline-row">
        <span class="index-pipeline-step">${String(v+1).padStart(2,"0")}</span>
        <div class="index-pipeline-copy">
          <div class="index-pipeline-title">
            <strong>${r(S.label||S.key||"\u968E\u6BB5")}</strong>
            ${Ke(S.status||"success")}
          </div>
          <span class="index-pipeline-detail">${r(S.detail||"\u2014")}</span>
          ${Y?`<span class="index-pipeline-host">${g("server",12)} ${r(Ho(Y))} \xB7 ${r(S.model||u)}</span>`:""}
        </div>
        <div class="index-pipeline-time">
          <strong>${ht(j)}</strong>
          <span>${W.toFixed(1)}%</span>
        </div>
      </div>`}).join("");return`<section class="index-perf-panel index-pipeline-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</div>
        <div class="index-perf-sub">Blue-Green collection\u3001host/model \u8207\u968E\u6BB5\u8017\u6642</div>
      </div>
      <div class="index-pipeline-actions">
        <select class="select index-pipeline-select" data-index-pipeline-select aria-label="\u9078\u64C7\u7D22\u5F15 Pipeline \u7D00\u9304">${d}</select>
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${g("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span></button>
      </div>
    </div>
    ${o?`<div class="index-pipeline-meta">
            <span><strong>\u7248\u672C</strong> ${r(f)}</span>
            <span><strong>collection</strong> ${r(String(o.collection||"\u2014"))}</span>
            <span><strong>\u6A21\u5F0F</strong> ${r(String(o.build_mode||"\u2014"))}</span>
            <span><strong>\u672C\u6B21</strong> ${o.resumed?`\u63A5\u7E8C\uFF08\u5DF2\u7D22\u5F15 ${c(o.resumed_indexed)} \u7B46\uFF09`:"\u65B0\u5EFA\u7248\u672C"}</span>
            <span><strong>Host</strong> ${r(h)}</span>
            <span><strong>Model</strong> ${r(String(u))}</span>
            <span><strong>\u7E3D\u8017\u6642</strong> ${ht(b)}</span>
          </div>
          <div class="index-pipeline-bar">${k}</div>
          <div class="index-pipeline-list">${A}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B Pipeline \u968E\u6BB5\u8CC7\u6599\uFF1B\u4E0B\u4E00\u6B21 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u6703\u8A18\u9304 host/model \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002</div>'}
  </section>`}function ju(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Go.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${g("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${g("chevronRight",13)}</button>
    </div>
  </div>`}function Tu(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"#65a30d":t.includes("judgment.rag")?"#8b5cf6":t.includes("judgment.web.app")?"#3b82f6":t.includes("judgment.web.query")?"#d97706":t.includes("judgment.judgment_index")?"#0d9488":"#64748b"}function Eu(e){let t=Ir(e),s=Math.max(0,Math.min(8,Number(e.depth)||0));return{key:"segment",label:`${"\u203A ".repeat(s)}${e.name||"unnamed"}`,hint:[e.module||"\u2014",e.function||"\u2014"].join(" \xB7 "),color:Tu(e),spans:[{...t,status:e.status||"ok",error:e.error,metadata:e.metadata||{},params:e.params||{},started_at:e.started_at,finished_at:e.finished_at}],start:t.offset,end:t.end,duration:t.duration}}function xn(e){return(e||[]).map(Eu)}function Nu(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((h,u)=>Number(h.seq)-Number(u.seq)):[],n=s?.summary||{},i=Array.isArray(n.models)?n.models:[],o=s?.client||{},l=s?.metadata||{},d=l.question||"",p=l.answer||"",f=d||p?`<div class="perf-flow-qa">
          ${d?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${r(d)}</span></div>`:""}
          ${p?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${r(p)}</span></div>`:""}
        </div>`:"",$=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(h=>(Number(h.offset_ms)||0)+(Number(h.duration_ms)||0)),1);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${r(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${r(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${r(e.method||"")} ${r(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${ye(e.started_at)}</span>
      <span class="perf-record-duration">${fe(e.duration_ms)}</span>
      ${Ke(e.status)}
      <span class="perf-record-chevron">${g("chevronRight",14)}</span>
    </summary>
    <div class="perf-record-body">
      <div class="perf-flow-meta">
        <span><strong>Request</strong> <span class="mono">${r(e.request_id||s?.request_id||"\u2014")}</span></span>
        <span><strong>Server</strong> ${fe(e.duration_ms)}</span>
        ${o.total_ms?`<span><strong>Client \u5168\u6D41\u7A0B</strong> ${fe(o.total_ms)}</span>`:""}
        ${o.render_ms!==void 0?`<span><strong>Render</strong> ${fe(o.render_ms)}</span>`:""}
        <span><strong>Flow</strong> ${a.length} \u6BB5</span>
        ${a.length?"<span><strong>Waterfall</strong> \u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\u3001\u53EF\u9EDE\u9078\u5C55\u958B\u53C3\u6578</span>":""}
      </div>
      ${f}
      ${i.length?`<div class="chips perf-record-models">${i.map(h=>`<span class="chip">${r(h)}</span>`).join("")}</div>`:""}
      ${a.length?Zs(xn(a),$,"\u6B64 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002"):`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${r(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${r(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var zo={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",rerank:"Reranker",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"};function Ru(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}var Cu={embedding:"#3984c6",retrieval:"#d97706",rerank:"#8b5cf6",context:"#64748b",llm:"#16a34a",validation:"#8b5cf6"};function Pu(e,t){let s=Date.parse(e.started_at||""),a=Date.now(),n=Array.isArray(e.stage_order)?[...e.stage_order]:Object.keys(zo);for(let p of t)p.stage&&!n.includes(p.stage)&&n.push(p.stage);let i=[],o=0;for(let p of n){let f=t.filter(u=>u.stage===p);if(!f.length)continue;let $=f.map(u=>{let b=Date.parse(u.started_at||""),_=Number.isFinite(s)&&Number.isFinite(b)?Math.max(0,b-s):0,k=Math.max(0,Number(u.duration_ms)||0);u.status==="running"&&Number.isFinite(b)&&(k=Math.max(k,a-b));let A=_+k;return o=Math.max(o,A),{offset:_,end:A,duration:k,status:u.status==="failed"?"error":u.status==="running"?"running":"ok",started_at:u.started_at,finished_at:u.finished_at,error:u.error_message,metadata:{...u.details||{},model:u.model,status:u.status,progress:Number(u.progress)||0,module:u.module,function:u.function},params:{model:u.model}}}),h=$.reduce((u,b)=>u+b.duration,0);i.push({key:"test_stage",label:zo[p]||p,hint:`${$.length} \u500B\u7A0B\u5E8F`,color:Cu[p]||"#64748b",spans:$,start:$.length?Math.min(...$.map(u=>u.offset)):null,end:$.length?Math.max(...$.map(u=>u.end)):null,duration:h})}let l=e.status==="running"&&Number.isFinite(s)?Math.max(0,a-s):0,d=Math.max(Number(e.total_ms)||0,l,o,1);return{stages:i,total:d}}function ea(e,t,s,a={}){let n=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(A=>`<option value="${r(A.run_id)}" ${A.run_id===s?"selected":""}>${r(Ru(A.status))} \xB7 ${r((A.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${r(ye(A.started_at))}</option>`)].join(""),o=n?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${g("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${g("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?Ke(e.status):""}</div>
      <div class="test-flow-question">${e?r(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${ft({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let d=Array.isArray(e.steps)?e.steps:[],p=Pu(e,d),f=e.models||{},$=e.status==="running"?`${fe(p.total)}\uFF08\u4F30\u7B97\uFF09`:fe(e.total_ms),h=d.find(A=>A.stage==="llm"&&A.model===e.summary?.primary_model)||d.find(A=>A.stage==="llm"&&A.details?.answer_preview),u=String(h?.details?.provider_name||"").trim(),b=u&&e.summary?.primary_model?`${u}:${e.summary.primary_model}`:e.summary?.primary_model||"",_=e.answer||h?.details?.answer_preview||"",k=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${b?`<span class="mono">${r(b)}</span>`:""}
    </div>
    <p>${_?r(_):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${r(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${r(ye(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${$}</span>
      <span><strong>Embedding</strong> ${Array.isArray(f.embedding)?f.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(f.llm)?f.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${r(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${k}
    ${p.stages.length?Zs(p.stages,p.total,"\u6E2C\u8A66 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B\u7A0B\u5E8F\u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u6A21\u578B\u3001\u72C0\u614B\u3001\u9032\u5EA6\u3001module\uFF0Ffunction \u8207\u932F\u8AA4\u3002"):'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":n?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${b?`<span class="mono">primary=${r(b)}</span>`:""}
    </div>
  </div>`}function Uo(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},n=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${Ke(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${c(e.total)} \u7B46\u7B26\u5408 \xB7 ${fe(e.duration_ms)} \xB7
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
    ${Mu(n)}
    ${Su(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>Nu(i,o)).join(""):ft({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${ju(e)}
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
  </div>`}async function Iu(e,t){let s=zt(),a=!1,n=Pr(),i={processes:[],modules:[],statuses:[],methods:[],models:[]},o=1,l=25,d=null,p=[],f="",$=!1,h=null,u=!1,b=null,_="",k=!1,A=null,S=!1;e.innerHTML=`<section class="page data-page performance-page">
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
          <button class="status-tab${s?" is-demo-locked":""}" type="button" data-performance-tab="benchmark"${s?' data-demo-lock-tooltip="\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B Benchmark \u57F7\u884C"':""}>
            <span class="status-tab-icon">${g("brain",15)}</span>
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
                    ${g("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
                  </button>
                </div>
              </form>
              <div class="sidebar-note">Flow \u5BEB\u5165 PostgreSQL \u7684 performance_records.flow\uFF08JSON\uFF09\uFF0C\u9810\u8A2D\u4FDD\u7559\u81F3\u5C11 90 \u5929\uFF1B\u53EF\u4F9D\u6A21\u578B\u3001\u7A0B\u5E8F\u3001\u6A21\u7D44\u8207\u8017\u6642\u7BE9\u9078\u3002</div>
            </aside>
            <section class="query-main" id="performance-main" aria-label="\u6548\u80FD\u5831\u8868" aria-live="polite">
              <div id="performance-test-flow"></div>
              <div id="performance-report">${xa({label:"\u6548\u80FD\u5831\u8868"})}</div>
            </section>
          </div>
        </div>
        <div id="performance-panel-pipeline" hidden></div>
        <div id="performance-panel-index-pipeline" hidden></div>
        <div id="performance-panel-benchmark" hidden></div>
      </section>
    </div>
  </section>`;let v=e.querySelector("#performance-filter-fields"),j=e.querySelector("#performance-filter-form"),W=e.querySelector("#performance-test-flow"),Y=e.querySelector("#performance-report"),we=e.querySelector("#performance-panel-pipeline"),be=e.querySelector("#performance-panel-index-pipeline"),ne=e.querySelector("#performance-meta"),M=e.querySelector("#performance-refresh"),q=[...e.querySelectorAll("[data-performance-tab]")],T={overview:e.querySelector("#performance-panel-overview"),pipeline:e.querySelector("#performance-panel-pipeline"),"index-pipeline":e.querySelector("#performance-panel-index-pipeline"),benchmark:e.querySelector("#performance-panel-benchmark")},X="overview",me=R=>{X=R;for(let H of q){let Q=H.dataset.performanceTab===R;H.classList.toggle("is-active",Q),Q?H.setAttribute("aria-current","page"):H.removeAttribute("aria-current")}for(let[H,Q]of Object.entries(T))Q&&(Q.hidden=H!==R);R==="benchmark"?ne.textContent="BENCHMARK \xB7 RAG":R==="pipeline"?ne.textContent="PERFORMANCE \xB7 RAG WATERFALL":R==="index-pipeline"?ne.textContent="PERFORMANCE \xB7 INDEX PIPELINE":d&&(ne.textContent=`PERFORMANCE \xB7 ${c(d.total)} \u7B46`)},V=So(e,{onNavigate:R=>me(R)});s&&(W.innerHTML=Ts("\u7CFB\u7D71\u6E2C\u8A66\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u6548\u80FD\u5831\u8868\u3001RAG Pipeline \u8207\u7D22\u5F15 Pipeline\uFF1B\u6E2C\u8A66\u6D41\u7A0B\u8207 Benchmark \u57F7\u884C\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002"));let de=()=>{we&&(we.innerHTML=ku(p,f,$,h))},Ae=async({force:R=!1}={})=>{if(!(a||$)){if(u&&!R){de();return}$=!0,p.length||de();try{let H=await J.performance({keyword:"/api/rag"},1,50);if(a)return;let Q=(Array.isArray(H.rows)?H.rows:[]).filter(_e=>_e.flow&&(String(_e.path||"").includes("/api/rag")||String(_e.process||"").includes("RAG")));p=Q,(!f||!Q.some(_e=>String(_e.id)===String(f)))&&(f=Q[0]?String(Q[0].id):""),h=null,u=!0}catch(H){if(a)return;h=H}finally{a||($=!1,de())}}},I=()=>{be&&(be.innerHTML=Lu(b,_,k,A))},Se=async({force:R=!1}={})=>{if(!(a||k)){if(S&&!R){I();return}k=!0,b||I();try{let H=await J.performance({},1,1);if(a)return;b=H.index_pipeline||H.index_stats||null;let Q=Array.isArray(b?.runs)?b.runs:[];(!_||!Q.some(_e=>String(_e.id)===String(_)))&&(_=b?.latest?String(b.latest.id):""),A=null,S=!0}catch(H){if(a)return;A=H}finally{a||(k=!1,I())}}},oe=R=>{if(me(R),R==="benchmark"){if(s){let H=T.benchmark;H&&(H.innerHTML=Ts("RAG Benchmark \u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u6548\u80FD\u5831\u8868\u8207 Pipeline\uFF1BBenchmark \u984C\u5EAB\u3001\u6A21\u578B\u8A2D\u5B9A\u3001\u57F7\u884C\u8207\u8A55\u5206\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002"));return}V.show()}R==="pipeline"&&Ae(),R==="index-pipeline"&&Se()};e.addEventListener("click",R=>{let H=R.target.closest("[data-performance-tab]");H&&oe(H.dataset.performanceTab||"overview")}),we?.addEventListener("change",R=>{R.target.matches("[data-rag-trace-select]")&&(f=String(R.target.value||""),de())}),we?.addEventListener("click",R=>{R.target.closest('[data-action="refresh-rag-waterfall"]')&&Ae({force:!0})}),be?.addEventListener("change",R=>{R.target.matches("[data-index-pipeline-select]")&&(_=String(R.target.value||""),I())}),be?.addEventListener("click",R=>{R.target.closest('[data-action="refresh-index-pipeline"]')&&Se({force:!0})});let ke=null,Re=[],Me="",Pe=null,ge="",ee=()=>{v.innerHTML=gu(i,n)},ue=()=>{let R=JSON.stringify({selected:Me,tick:ke?.status==="running"?Math.floor(Date.now()/1e3):0,runs:Re.map(H=>`${H.run_id}:${H.status}`),run:ke?{run_id:ke.run_id,status:ke.status,progress:ke.progress,total_ms:ke.total_ms,steps:(ke.steps||[]).map(H=>`${H.stage}:${H.model}:${H.status}:${H.progress}:${H.duration_ms}`)}:null});R!==ge&&(ge=R,W.innerHTML=ea(ke,Re,Me))},ve=async()=>{if(!s)try{let R=await J.testRuns(30);if(a)return;Re=Array.isArray(R.runs)?R.runs:[]}catch{if(a)return;Re=[]}},qe=async(R=null)=>{if(!s)try{let H=R&&!Me?R:Me?await J.testRun(Me):await J.testRunCurrent();if(a)return;ke=H.run||null,!Me&&ke&&ke.status!=="running"&&!Re.some(Q=>Q.run_id===ke.run_id)&&await ve(),ue()}catch{if(a)return;ke=null,ue()}},Be=async(R=null)=>{a||Me||await qe(R)},P=()=>{s||a||Pe||(Pe=wt("test-runs",(R,H)=>Be(H?.snapshot||null)))};W.addEventListener("change",async R=>{R.target.id==="test-run-select"&&(Me=String(R.target.value||""),await qe())}),W.addEventListener("click",async R=>{R.target.closest("#test-flow-refresh")&&(Me="",await ve(),await qe())});let B=async(R=o,{quiet:H=!1}={})=>{o=Math.max(1,Number(R)||1),n=Do();let Q=`judgment.performance.result.v1:${JSON.stringify({filters:n,page:o,pageSize:l})}`,_e=os(Q,120*1e3);_e&&o===1&&(d=_e,Y.innerHTML=Uo(_e),ne.textContent=`PERFORMANCE \xB7 ${c(_e.total)} \u7B46`);let Te=Y.querySelector(".report-card"),Ye=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!Te?Y.setAttribute("aria-busy","true"):(Y.removeAttribute("aria-busy"),Y.innerHTML=xa({label:"\u6548\u80FD\u5831\u8868"}));let st=e.querySelector("#performance-run");H||Ee(st,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Ze=await J.performance(n,o,l);if(a)return;if(d=Ze,ss(Q,Ze),Ze.index_pipeline){b=Ze.index_pipeline;let et=Array.isArray(b.runs)?b.runs:[];(!_||!et.some(ae=>String(ae.id)===String(_)))&&(_=b.latest?String(b.latest.id):""),S=!0,A=null}if(o=Number(Ze.page)||o,l=Number(Ze.page_size)||l,Y.removeAttribute("aria-busy"),Y.innerHTML=Uo(Ze),Ye!==null){let et=Y.querySelector("[data-page-size]");et&&(et.value=String(l),et.focus({preventScroll:!0}))}ne.textContent=`PERFORMANCE \xB7 ${c(Ze.total)} \u7B46`,ne.className="badge badge-neutral badge-mono"}catch(Ze){if(a)return;Y.removeAttribute("aria-busy"),Y.innerHTML=$n(Ze,{label:"\u6548\u80FD\u5831\u8868"}),N(Ze.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{a||Ee(st,!1)}},G=async()=>{let R=os("judgment.performance.options.v1",3e5);if(R){i=R,ee(),J.performanceOptions().then(H=>{i=H,ss("judgment.performance.options.v1",H),ee()}).catch(()=>{});return}try{i=await J.performanceOptions(),ss("judgment.performance.options.v1",i)}catch{i={processes:[],modules:[],statuses:[],methods:[],models:[]}}ee()};return j.addEventListener("submit",R=>{R.preventDefault(),B(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{n=Pr(),o=1,ee(),B(1)}),M.addEventListener("click",async()=>{if(X==="pipeline"){Ee(M,!0,"\u6574\u7406\u4E2D\u2026");try{await Ae({force:!0})}finally{a||Ee(M,!1)}return}if(X==="index-pipeline"){Ee(M,!0,"\u6574\u7406\u4E2D\u2026");try{await Se({force:!0})}finally{a||Ee(M,!1)}return}if(X==="benchmark"){if(s)return;Ee(M,!0,"\u6574\u7406\u4E2D\u2026");try{await V.refresh()}finally{a||Ee(M,!1)}return}n=Do(),M.disabled=!0,Ee(M,!0,"\u6574\u7406\u4E2D\u2026"),await G(),await ve(),a||await qe(),a||await B(1),a||(M.disabled=!1,Ee(M,!1))}),Y.addEventListener("click",async R=>{let H=R.target.closest("[data-action]");if(!H||!d)return;let Q=H.dataset.action;if(Q==="retry"){B(o);return}if(Q==="prev-page"){B(Math.max(1,Number(d.page)-1),{quiet:!0});return}if(Q==="next-page"){let _e=Math.max(1,Math.ceil(Number(d.total)/Number(d.page_size)));B(Math.min(_e,Number(d.page)+1),{quiet:!0});return}if(Q==="copy-query"){let _e=await qs(d.query_text||"");N(_e?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",_e?"ok":"warn");return}if(Q==="export-json"){let _e=`performance-page-${d.page}.json`;Ht(_e,JSON.stringify(wn(d),null,2),"application/json;charset=utf-8"),N(`\u5DF2\u532F\u51FA ${_e}`,"ok");return}if(Q==="export-csv"){let _e=`performance-page-${d.page}.csv`;Ht(_e,yn(d),"text/csv;charset=utf-8"),N(`\u5DF2\u532F\u51FA ${_e}`,"ok")}}),Y.addEventListener("change",R=>{R.target.matches("[data-page-size]")&&(l=Number(R.target.value)||25,Go.includes(l)||(l=25),B(1,{quiet:!0}))}),s?(await G(),a||await B(1)):(await Promise.allSettled([G(),ve()]),a||(await qe(),await B(1),P())),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{a=!0,Pe&&Pe(),V.destroy()}}var ll="q",cl="share",Qr="contentId",Jr="rag/share",Du=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5F9E\u696D\u4EBA\u54E1\u6709\u90A3\u4E9B\u898F\u5B9A\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function Bu(){return`<div class="answer-placeholder">
    <span class="empty-icon">${g("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function Hr(){return`<section class="card answer-card rag-empty-answer">${Bu()}</section>`}function dl(e){let t=r(e);return`<div class="rag-answer-actions" role="group" aria-label="\u56DE\u7B54\u64CD\u4F5C">
    <button class="rag-answer-action" type="button" data-rag-answer-action="copy" data-question="${t}" title="\u8907\u88FD\u56DE\u7B54" aria-label="\u8907\u88FD\u56DE\u7B54">${g("copy",15)}<span class="sr-only">\u8907\u88FD\u56DE\u7B54</span></button>
    <button class="rag-answer-action" type="button" data-rag-answer-action="share" data-question="${t}" title="\u5EFA\u7ACB\u516C\u958B\u9023\u7D50" aria-label="\u5EFA\u7ACB\u516C\u958B\u9023\u7D50">${g("share",15)}<span class="sr-only">\u5EFA\u7ACB\u516C\u958B\u9023\u7D50</span></button>
    <button class="rag-answer-action" type="button" data-rag-answer-action="reask" data-question="${t}" title="\u91CD\u65B0\u751F\u6210\u56DE\u7B54" aria-label="\u91CD\u65B0\u751F\u6210\u56DE\u7B54">${g("refresh",15)}<span class="sr-only">\u91CD\u65B0\u751F\u6210\u56DE\u7B54</span></button>
  </div>`}function Zo(e,t,{complete:s=!0}={}){let a=r(e);return`<div class="rag-turn${s?" is-complete":" is-pending"}">
    <div class="rag-user-block">
      <div class="rag-user-bubble">${a}</div>
      <div class="rag-user-actions" role="group" aria-label="\u554F\u984C\u64CD\u4F5C">
        <button class="rag-user-action" type="button" data-rag-question-action="copy" data-question="${a}" title="\u8907\u88FD\u554F\u984C" aria-label="\u8907\u88FD\u554F\u984C">${g("copy",15)}<span class="sr-only">\u8907\u88FD\u554F\u984C</span></button>
        <button class="rag-user-action" type="button" data-rag-question-action="share" data-question="${a}" title="\u5EFA\u7ACB\u516C\u958B\u9023\u7D50" aria-label="\u5EFA\u7ACB\u516C\u958B\u9023\u7D50">${g("share",15)}<span class="sr-only">\u5EFA\u7ACB\u516C\u958B\u9023\u7D50</span></button>
        <button class="rag-user-action" type="button" data-rag-question-action="edit" data-question="${a}" title="\u7DE8\u8F2F\u554F\u984C" aria-label="\u7DE8\u8F2F\u554F\u984C">${g("edit",15)}<span class="sr-only">\u7DE8\u8F2F\u554F\u984C</span></button>
        <button class="rag-user-action" type="button" data-rag-question-action="reask" data-question="${a}" title="\u91CD\u65B0\u63D0\u554F" aria-label="\u91CD\u65B0\u63D0\u554F">${g("refresh",15)}<span class="sr-only">\u91CD\u65B0\u63D0\u554F</span></button>
      </div>
    </div>
    <div class="rag-answer-block">
      <section class="card rag-assistant-turn" data-rag-answer>${t}</section>
    </div>
  </div>`}function Fu(e){let t=new URL(window.location.href);return t.search="",t.hash=`#/${Jr}?${Qr}=${encodeURIComponent(e)}`,t.toString()}function Ou(){let e=window.location.hash.replace(/^#\/?/,""),[t,s=""]=e.split("?"),a=t.replace(/\/+$/,"");if(a===Jr)return String(new URLSearchParams(s).get(Qr)||"").trim();let n=a.match(/^rag\/share\/([^/]+)$/);if(!n)return"";try{return decodeURIComponent(n[1])}catch{return n[1]}}function zr({keepToken:e=!1,token:t=""}={}){try{let s=new URL(window.location.href);s.searchParams.delete(ll),s.searchParams.delete(cl),s.hash=e&&t?`#/${Jr}?${Qr}=${encodeURIComponent(t)}`:"#/rag",window.history.replaceState(null,"",`${s.pathname}${s.search}${s.hash}`)}catch{}}function Hu(){try{let e=new URL(window.location.href),t=String(e.searchParams.get(cl)||"").trim(),s=Ou()||t,a=String(e.searchParams.get(ll)||"").trim();return!s&&!a?null:{token:s.slice(0,64),question:a.slice(0,500)}}catch{return null}}function Ur(e){if(!e)return"";let t=Array.from(e.querySelectorAll("[data-rag-answer] .answer-text")).map(a=>String(a.textContent||"").trim()).filter(Boolean);if(t.length)return t.join(`

`);let s=e.querySelector("[data-rag-answer]");return s?String(s.innerText||"").trim():""}function zu(e){let t=e&&typeof e=="object"?e:{};return{status:t.status,answer:t.answer,answer_source:t.answer_source,notice:t.notice,citations:Array.isArray(t.citations)?t.citations:[],judgments:Array.isArray(t.judgments)?t.judgments:[],reference_judgments:Array.isArray(t.reference_judgments)?t.reference_judgments:[],law_sources:Array.isArray(t.law_sources)?t.law_sources:[],matched_terms:Array.isArray(t.matched_terms)?t.matched_terms:[],law_answer:t.law_answer,law_framework:t.law_framework,llm_model:t.llm_model,embedding_model:t.embedding_model,duration_ms:t.duration_ms,show_sources:t.show_sources,retrieval:t.retrieval,rerank_degraded:t.rerank_degraded,degraded_reason:t.degraded_reason,partial:!1,streaming:!1}}async function el(e,t){let s=(Array.isArray(e)?e:[]).filter(o=>String(o?.question||"").trim()).map(o=>({question:String(o.question||"").trim().slice(0,500),asked_at:String(o.asked_at||""),payload:zu(o.payload)}));if(!s.length){N("\u6C92\u6709\u53EF\u5EFA\u7ACB\u516C\u958B\u9023\u7D50\u7684\u5C0D\u8A71\u3002","warn");return}let a=null;try{a=await J.ragShareCreate({title:String(t||s[0]?.question||"").slice(0,200),turns:s})}catch{a=null}if(!a?.id){N("\u7121\u6CD5\u5EFA\u7ACB\u516C\u958B\u9023\u7D50\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger",6e3);return}let n=Fu(a.id);if(!await qs(n)){N("\u7121\u6CD5\u8907\u88FD\u516C\u958B\u9023\u7D50\uFF0C\u8ACB\u78BA\u8A8D\u700F\u89BD\u5668\u526A\u8CBC\u7C3F\u6B0A\u9650\u3002","danger",6e3);return}N("\u5DF2\u8907\u88FD\u516C\u958B\u9023\u7D50","ok",7e3,{detail:"\u4EFB\u4F55\u64C1\u6709\u6B64\u9023\u7D50\u7684\u4EBA\u90FD\u53EF\u4EE5\u67E5\u770B\u9019\u6BB5\u5C0D\u8A71\u3002",actionLabel:"\u958B\u555F\u9023\u7D50",onAction:()=>{window.open(n,"_blank","noopener,noreferrer")}})}function Uu(e,t){return Promise.race([e,new Promise((s,a)=>{window.setTimeout(()=>a(new Error("pipeline lookup timed out")),t)})])}async function Gu(e){if(!e||e.pipeline_flow)return e;let t=String(e._client_request_id||e.request_id||"").trim();if(!t)return e;for(let s=0;s<3;s+=1){try{let a=await Uu(J.performance({keyword:t},1,5),1800),n=(Array.isArray(a.rows)?a.rows:[]).find(i=>String(i.request_id||"")===t&&i.flow&&typeof i.flow=="object");if(n)return e.pipeline_flow=n.flow,e}catch{}s<2&&await new Promise(a=>window.setTimeout(a,250))}return e}function tl(e){return{status:e.status,answer:e.answer,answer_source:e.answer_source,notice:e.notice,citations:Array.isArray(e.citations)?e.citations:[],judgments:Array.isArray(e.judgments)?e.judgments:[],law_sources:Array.isArray(e.law_sources)?e.law_sources:[],matched_terms:Array.isArray(e.matched_terms)?e.matched_terms:[],law_answer:e.law_answer,law_framework:e.law_framework,llm_model:e.llm_model,embedding_model:e.embedding_model,duration_ms:e.duration_ms,show_sources:e.show_sources,pipeline_flow:e.pipeline_flow||null,test_run:e.test_run||null,partial:!1,streaming:!1}}var Qu={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"llama-server embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"llama-server LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function Ju(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`llama-server run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`llama-server embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:Qu[t]||t||"backend step"}function sl(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function al(e){let t=Number(e);return Number.isFinite(t)?`${c(Math.max(0,Math.round(t)))} ms`:"\u2014"}function Gr(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function Vu(){return`<div class="rag-process is-open" id="rag-process">
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
  </div>`}function Wu(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),n=performance.now(),i=new Map,o=new Map,l=(u,b,_)=>{let k=u.querySelector(b);k&&(k.textContent=_)},d=u=>{if(u.failed){l(u.element,".rag-process-meta","\u5931\u6557");return}if(u.hasChildren){l(u.element,".rag-process-meta","");return}l(u.element,".rag-process-meta",al(u.durationMs))},p=u=>{let b=u-1,_=[...i.values()].reverse();for(let k of _){if(b<0)break;k.depth<=b&&(k.hasChildren||(k.hasChildren=!0,k.element.dataset.hasChildren="true",k.finished&&d(k)),b=k.depth-1)}},f=u=>{if(!s)return null;let b=String(u?.seq??`step-${i.size+1}`),_=i.get(b);if(!_){let k=Math.max(0,Math.min(6,Number(u?.depth)||0));p(k);let A=document.createElement("div");A.className="rag-process-item is-running",A.dataset.processKey=b,A.style.setProperty("--depth",String(k)),A.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(A),_={element:A,depth:k,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(b,_)}return l(_.element,".rag-process-label",Ju(u)),_.element.title=sl(u),_};return{step:u=>{let b=u?.segment;if(!b)return;o.set(String(b.seq??b.name??o.size),{...b});let _=f(b);if(_){if(u.type==="segment_start"){_.element.classList.add("is-running"),l(_.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(u.type==="segment_end"){let k=b.status==="error";_.element.classList.remove("is-running"),_.element.classList.toggle("is-error",k),_.finished=!0,_.failed=k,_.durationMs=Number(b.duration_ms)||0,d(_),_.element.title=[sl(b),k&&b.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(u=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(A=>{A.classList.remove("is-running");let S=A.dataset.hasChildren==="true";l(A,".rag-process-meta",S?"":u?"\u5B8C\u6210":"\u4E2D\u65B7")});let b=s?.children.length||i.size,_=al(Math.max(0,performance.now()-n));a&&(a.textContent=u?`\u5B8C\u6210 \xB7 ${b} \u6B65 \xB7 ${_}`:`\u5931\u6557 \xB7 ${b} \u6B65`);let k=[...o.values()].filter(A=>A?.name).sort((A,S)=>Number(A.offset_ms||0)-Number(S.offset_ms||0));if(s&&k.length){let A=Math.max(1,...k.map(S=>Number(S.end_offset_ms)||(Number(S.offset_ms)||0)+(Number(S.duration_ms)||0)));s.classList.add("is-waterfall"),s.innerHTML=Zs(xn(k),A,"\u5F8C\u7AEF Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B span \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002")}return t.classList.add("is-complete"),Gr(t,!1),t.outerHTML},collapse:()=>Gr(t,!1)}}function Ku(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${g("sparkles",16)}
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
    </div>`}function nl(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function qn(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let n=String(e||"").trim();return n?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t||n)}"
    data-source-type="${r(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(a||n)}</button>`:""}function ul(e){let t=String(e?.law_name||"").trim(),s=String(e?.article_no||"").replace(/\s+/g,"");if(!t||!s)return"";let a=(Array.isArray(e?.paragraphs)?e.paragraphs:[]).map(i=>String(i||"").trim()).filter(Boolean),n=`${t}${s}${a.join("\u3001")}`;return`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t)}"
    data-source-type=""
    data-article-no="${r(s)}"
    title="\u9EDE\u64CA\u67E5\u770B ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(n)}</button>`}function pl(e){let t=String(e?.citation_status||"");return t==="cited"?"\u7B54\u6848\u5F15\u7528":t==="provided_not_cited"?"\u5DF2\u63D0\u4F9B\u7D66\u6A21\u578B\uFF0C\u7B54\u6848\u672A\u5F15\u7528":t==="reference_only"||e?.used_for_generation===!1?"\u50C5\u4F9B\u53C3\u8003\uFF08\u672A\u9032\u5165\u751F\u6210 prompt\uFF09":e?.used_for_generation===!0?"\u5DF2\u63D0\u4F9B\u7D66\u6A21\u578B":""}function Yu(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map($=>`<span>${r($)}</span>`).join(""),n=pl(e),i=n?`<span>${r(n)}</span>`:"",o=(Array.isArray(e.law_citations)?e.law_citations:[]).map($=>ul($)).filter(Boolean).slice(0,12).join(""),l=o||(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map($=>qn($)).join(""),d=o?'<div class="citation-meta"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':"",p=e.jid?` data-action="open-parquet-judgment"
        data-jid="${r(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${r(e.jid)}"`:"",f=e.pdf_url?`<a class="citation-link" href="${r(Et(e.pdf_url))}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${g("external",11)}</a>`:"";return`<article class="citation">
    <span class="citation-index">[${e.index??t+1}]</span>
    <div class="citation-body">
      <div class="citation-head"${p}>
        <h4 class="citation-name">${r(e.jid||"\u672A\u77E5\u6848\u865F")}</h4>
        <div class="citation-meta">${a||"<span>\u5224\u6C7A metadata</span>"}${i}</div>
        ${e.title?`<div class="citation-meta"><span>\u6848\u7531\uFF1A${r(e.title)}</span></div>`:""}
      </div>
      ${d}
      ${l?`<div class="chips" style="margin-top:8px">${l}</div>`:""}
      ${e.snippet?`<p class="citation-snippet">${r(e.snippet)}</p>`:""}
    </div>
    <div class="citation-links">${f}</div>
  </article>`}function Xu(e){let t=[e.court,e.jdate].filter(Boolean).map(n=>`<span>${r(n)}</span>`).join(""),s=[e.vector_score!==null&&e.vector_score!==void 0?`\u5411\u91CF ${Number(e.vector_score).toFixed(4)}`:"",e.rerank_score!==null&&e.rerank_score!==void 0?`rerank ${Number(e.rerank_score).toFixed(4)}`:""].filter(Boolean).map(n=>`<span>${r(n)}</span>`).join("");return`<article class="citation reference-judgment">
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
  </article>`}function Zu(e,t){let s=[e.law_level,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${r(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${r(Et(e.law_url))}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${g("external",11)}</a>`:"",n=e.law_key||e.law_name||"",i=n?` data-action="open-law-source"
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
  </article>`}function ep(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",n=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${r(s)}</span>`,a,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${Ft(e.law_modified_date)}`:"",pl(e)].filter(Boolean).map(u=>`<span>${u}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${r(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${r(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${r(o.entity||"")}\u300D\u7684\u5224\u6C7A ${c(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${c(o.law_count||0)} \u6B21</span>
      </div>`:"",d=e.law_key||"",p=e.source_type||"",f=(Array.isArray(e.articles)?e.articles:[]).map(u=>{let b=String(u.article_no||"");return`<div class="law-source-article"${d&&b?` data-action="open-law-source"
        data-law-key="${r(d)}"
        data-source-type="${r(p)}"
        data-article-no="${r(b)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${r(b)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} ${r(b)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${r(u.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${r(u.article_content||"")}</p>
      </div>`}).join(""),$=e.law_url?`<a class="citation-link" href="${r(Et(e.law_url))}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${g("external",11)}</a>`:"",h=e.law_key?` data-action="open-law-source"
        data-law-key="${r(e.law_key)}"
        data-source-type="${r(e.source_type||"")}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u672C\u5730 Parquet \u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation law-source">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body"${h}>
      <h4 class="citation-name">${r(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${n}</div>
      ${i}
      ${l}
      ${f}
    </div>
    <div class="citation-links">${$}</div>
  </article>`}function tp(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function sp(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${r(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",n=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(n==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),d=s.index!=null?`<span class="law-answer-index">[${r(String(s.index))}]</span>`:"",p=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${r(a)}"
            data-source-type="${r(n)}"
            title="\u9EDE\u64CA\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587">${r(i)}</button>`:`<strong>${r(i)}</strong>`,f=Array.isArray(s.articles)?s.articles:[],$=f.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${f.map(h=>{let u=String(h.article_no||"").trim(),b=tp(h.article_content);return!a||!u?`<div class="law-answer-article is-static">
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
          ${p}
          <span class="law-answer-source-meta">\uFF08${r(o)}\uFF0C${c(l)} \u689D\uFF09</span>
          ${d}
        </div>
        ${$}
      </div>`}).join("")}</div>`}function ap(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let n=s.get(String(a));return n?.law_key?qn(a,{lawKey:n.law_key,sourceType:n.source_type||""}):`<span class="chip">${r(a)}</span>`}).join("")}</div>`}function np(e){let t=String(e||"");return t==="operational"?"is-ok":t==="standby"?"is-idle":"is-down"}function rp(e){let t=String(e||"");return t==="operational"?"":t==="standby"?"\u5099\u63F4":t==="disabled"?"\u505C\u7528":t==="not_configured"?"\u672A\u8A2D\u5B9A":"\u96E2\u7DDA"}function rl(e,{fallback:t=!1}={}){if(!e)return`<span class="rag-model-cell is-empty">
      <span class="rag-model-state is-idle" aria-hidden="true"></span>
      <span class="rag-model-name">\u672A\u8A2D\u5B9A</span>
    </span>`;let s=String(e.label||"").trim()||[e.host,e.model].filter(Boolean).join(":"),a=String(e.status||""),n=!["operational","standby"].includes(a),i=t&&!n?"\u5099\u63F4":rp(a),o=n?"is-down":t?"is-idle":np(a),l=[s,e.url,i].filter(Boolean).join(" \xB7 ");return`<span class="rag-model-cell" title="${r(l)}">
    <span class="rag-model-state ${o}" aria-hidden="true"></span>
    <span class="rag-model-name">${r(s)}</span>
    ${i?`<span class="rag-model-note">${r(i)}</span>`:""}
  </span>`}function ip(e,t){let s=Array.isArray(e)?e:[],a=[{kind:"chat",label:"Chat"},{kind:"embedding",label:"Embedding"},{kind:"rerank",label:"Rerank"}],n=new Map(s.map(o=>[String(o.kind||""),o])),i=a.map(o=>{let l=n.get(o.kind)||o;return`<tr>
        <td class="rag-model-kind">${r(l.label||o.label)}</td>
        <td>${rl(l.active)}</td>
        <td>${rl(l.fallback,{fallback:!0})}</td>
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
  </div>`}function An({tone:e,title:t,text:s,modelSummary:a=[],refreshing:n=!1}){let i=e==="ok"?"is-ok":e==="warn"?"is-warn":"is-info",o=e==="ok"?"check":e==="warn"?"alert":"info",l=e==="ok"?"badge-ok":e==="warn"?"badge-warn":"badge-info";return`<section class="rag-mode-card ${i}">
    <div class="rag-mode-head">
      <span class="rag-mode-icon" aria-hidden="true">${g(o,14)}</span>
      <div class="rag-mode-copy">
        <strong>${r(t)}</strong>
        <p>${r(s)}</p>
      </div>
      <span class="badge ${l}">3 \u500B\u6A21\u578B</span>
    </div>
    ${ip(a,n)}
  </section>`}function ml(e,t=""){let s=Array.isArray(e.citations)?e.citations:[],a=Array.isArray(e.judgments)?e.judgments:[],n=Array.isArray(e.reference_judgments)?e.reference_judgments:[],i=Array.isArray(e.law_sources)?e.law_sources:[],o=e.retrieval||{},l=Array.isArray(e.matched_terms)?e.matched_terms:[],d=e.status||"preview",p=!!e.partial,f=!!e.streaming,$=!!e.rerank_degraded,h=!!e.show_sources||!p,u=e.answer_source==="structured",b=String(e.law_answer||"").trim(),_=e.law_framework||null,k=Array.isArray(_?.rows)?_.rows:[],A=Array.isArray(_?.sources)?_.sources:[],S=k.length>0,v=!!b&&!u&&!S,j=a.filter(ue=>ue.used_for_generation===!0).length,W=a.some(ue=>ue.used_for_generation!==void 0),Y=a.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${a.length} \u7B46${W?`\uFF08${j} \u7B46\u9032\u5165 prompt\uFF09`:""}</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${a.map((ue,ve)=>Yu(ue,ve)).join("")}</div>`:"",we=o.judgment_limit_applied&&n.length?`<div class="reference-judgment-note">
          <span>\u672C\u984C\u4F9D\u984C\u610F\u4E3B\u8981\u8A62\u554F\u6CD5\u898F\u898F\u5B9A\uFF0C\u6545\u5224\u6C7A\u50C5\u986F\u793A ${a.length} \u7B46\u4F5C\u70BA\u53C3\u8003\u3002\u53E6\u6709 ${n.length} \u7B46\u76F8\u95DC\u5224\u6C7A\uFF08${n.some(ue=>ue.rerank_score!==null&&ue.rerank_score!==void 0)?"\u4F9D rerank \u5206\u6578\u6392\u5E8F":"\u4F9D\u6AA2\u7D22\u5206\u6578\u6392\u5E8F"}\uFF09\uFF0C</span>
          <details class="reference-judgments">
            <summary>\u5C55\u958B\u67E5\u770B</summary>
            <div class="citation-list reference-judgment-list">${n.map(ue=>Xu(ue)).join("")}</div>
          </details>
        </div>`:"",be=i.length&&!v?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${i.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${i.map((ue,ve)=>ep(ue,ve)).join("")}</div>`:"",ne=!a.length&&s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${s.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${s.map((ue,ve)=>Zu(ue,ve)).join("")}</div>`:"",M=h?Y+we+be+ne:"";!M&&!p&&!v&&!S&&(M=`<div class="answer-divider"></div>
      ${ft({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:d==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let q=ap(l,i),T=e.test_run,X=String(e.llm_model||T?.primary_model||"").trim(),me=String(e.embedding_model||"").trim(),V=[X?`LLM\uFF1A${X}`:"",me?`Embedding\uFF1A${me}`:""].filter(Boolean).join(" \xB7 "),de=f||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",Ae=S?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${r(_.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${k.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${k.map(ue=>`<tr>
                    <td>${r(ue.law_name||"\u2014")}</td>
                    <td class="cell-number">${r(ue.article_no||"\u2014")}</td>
                    <td>${r(ue.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${A.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${A.map(ue=>{let ve=String(ue?.law_name||ue||"").trim(),qe=ue&&ue.index!==null&&ue.index!==void 0?` [${r(ue.index)}]`:"";return qn(ve,{label:`${ve}${qe}`})}).join("")}
              </div>`:""}
      </div>`:"",I=e.answer_source==="llm"&&X?`<span class="answer-model" title="${r(V)}">${g("brain",11)}${r(X)}</span>`:u?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${g("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",Se=f?`${X||"LLM"} \xB7 \u751F\u6210\u4E2D`:I?X||"structured":"retrieval",oe=T?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${Ke(T.status)}
          <span class="mono">${r(T.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(T.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(T.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${r(T.primary_model||"\u2014")}</span>
          <span>${Number(T.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",ke=e.pipeline_flow&&typeof e.pipeline_flow=="object"?e.pipeline_flow:null,Re=!p&&ke?Sn(ke,{serverDurationMs:Number(e.duration_ms)||0,embedded:!0}):"",Pe=String(e.answer||"").trim()||(f?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":p?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),ge=f?" data-partial-answer":"",ee=f?" is-streaming":"";return`${Ae}
      ${v?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${p&&!h?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${i.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${sp(i,b)}</div>
            </div>`:""}
      <div class="answer-block">
        ${v||S?`<div class="answer-block-head">
                <span>${r(de)}</span>
                <span>${r(Se)}</span>
              </div>`:""}
        <p class="answer-text${ee}"${ge}>${r(Pe)}</p>
      </div>
      ${t}
      ${$?'<div class="answer-notice" data-rerank-degraded="true">\u6392\u5E8F\u7CBE\u7C21\u6A21\u5F0F\uFF1A\u672C\u6B21\u90E8\u5206 rerank \u903E\u6642\u6216\u964D\u7D1A\uFF0C\u4F86\u6E90\u53EF\u80FD\u4EE5\u5411\u91CF\u9806\u5E8F\u986F\u793A\u3002</div>':""}
      ${e.notice?`<div class="answer-notice">${r(e.notice)}</div>`:""}
      ${oe}
      ${q}
      ${M}
      ${Re}`}function il(e,t,s=""){let a=t.status||"preview",n=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),d=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),p=t.answer_source==="structured",f=t.answer_source==="llm"&&o?`<span class="answer-model" title="${r(d)}">${g("brain",11)}${r(o)}</span>`:p?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${g("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${g("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${Ke(a,n)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${f}
      </div>
      ${s}
    </div>
    <div class="answer-body">${ml(t,dl(e))}</div>`}function op(e,t="",s=""){return`<div class="answer-head">
      <div class="answer-head-left">${g("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${Oe({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      ${s?dl(s):""}
    </div>`}function lp(e){let t=Array.isArray(e.turns)?e.turns:[],s=t.length?t[t.length-1].payload||{}:e.payload||{},a=Array.isArray(s.citations)?s.citations.length:0,n=Array.isArray(s.judgments)?s.judgments.length:0,i=Array.isArray(s.law_sources)?s.law_sources.length:0;return a+n+i}function cp(e,t,s,a=null){let n=e.id??s,i=lp(e),o=t.get(String(e.project_id||"")),l=Array.isArray(e.turns)?e.turns:[],d=e.updated_at||e.created_at,p=a!=null&&String(a)===String(n);return`<div class="rag-history-item${e.pinned?" is-pinned":""}${p?" is-active":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${r(String(n))}">
      <span class="history-question">${r(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${r(ma(d))}</span>
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
  </div>`}function ol(e,t,s){let a=new Map;for(let i of t){let o=String(i.project_id||"");o&&a.set(o,(a.get(o)||0)+1)}let n=[`<button class="rag-project${s?"":" is-active"}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${s?"false":"true"}">
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
  </div>`),n.join("")}async function dp(e){let t=Hu();t&&!t.token&&zr();let s=new WeakMap,a=!1,n=[],i=!1,o=[],l=!1,d="",p=8,f="",$=0,h=null,u=[],b=!1,_=!1,k={embedding:[],llm:[]},A=null,S=null,v=!1;e.innerHTML=`<section class="page rag-page">
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
            \u6B77\u53F2\u6E05\u55AE\u53EA\u5B58\u5728\u6B64\u700F\u89BD\u5668\uFF1B\u9001\u51FA\u554F\u984C\u6642\u6703\u50B3\u9001\u5230\u4F3A\u670D\u5668\u7522\u751F\u7B54\u6848\uFF0C\u4F3A\u670D\u5668\u6703\u4FDD\u7559\u63D0\u554F\u8207\u56DE\u7B54\u6587\u5B57 90 \u5929\u7528\u65BC\u6548\u80FD\u8207\u54C1\u8CEA\u5206\u6790\u3002
          </div>
        </section>
      </aside>
      <div class="rag-workspace">
        <header class="rag-hero rag-hero-compact">
      <div id="rag-mode-notice">${Oe({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
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
            ${g("sparkles",16)}<span>\u958B\u59CB\u6AA2\u7D22</span>
          </button>
        </div>
      </form>
      <div class="example-chips" id="example-chips" aria-label="\u7BC4\u4F8B\u554F\u984C">
        ${Du.map(w=>`<button class="example-chip" type="button" data-question="${r(w)}">${r(w)}</button>`).join("")}
      </div>
    </header>

    <section class="rag-conversation" id="rag-conversation" aria-live="polite">
      <div class="rag-turns" id="rag-turns">
        ${Hr()}
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
  </section>`;let j=e.querySelector("#rag-form"),W=e.querySelector("#rag-question"),Y=e.querySelector("#rag-submit"),we=e.querySelector(".rag-page");we.classList.toggle("is-shared-view",!!t);let be=e.querySelector("#rag-turns"),ne=e.querySelector("#rag-followup-form"),M=e.querySelector("#rag-followup-question"),q=e.querySelector("#rag-followup-submit"),T=e.querySelector("#rag-history"),X=e.querySelector("#rag-storage-note"),me=e.querySelector("#rag-clear-history"),V=e.querySelector(".rag-library"),de=e.querySelector("#rag-pinned-body"),Ae=e.querySelector("#rag-projects-body"),I=e.querySelector("#rag-pinned-count"),Se=e.querySelector("#rag-projects-count"),oe=e.querySelector("#rag-recent-count"),ke=e.querySelector("#rag-library-context"),Re=e.querySelector("#rag-test-mode"),Me=e.querySelector("#rag-test-flow"),Pe=e.querySelector("#rag-history-menu"),ge=e.querySelector("#rag-judgment-dialog"),ee=e.querySelector("#rag-law-dialog"),ue=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};ge?.addEventListener("close",ue),ee?.addEventListener("close",ue);let ve=null,qe=null,Be,P=null,B=null,G=()=>{W.style.height="auto",W.style.height=`${Math.min(W.scrollHeight,220)}px`},R=()=>{M.style.height="auto",M.style.height=`${Math.min(M.scrollHeight,160)}px`},H=w=>{b=!!w,we.classList.toggle("has-conversation",b)},Q=()=>{b&&(ne.hidden=!1,R())},_e=()=>{ne.hidden=!0},Te=()=>{Pe.hidden&&!B||(Pe.hidden=!0,Pe.innerHTML="",B&&B.setAttribute("aria-expanded","false"),P=null,B=null)},Ye=(w,D)=>{let O=be.querySelector(".rag-empty-answer");O&&O.remove(),be.insertAdjacentHTML("beforeend",Zo(w,D,{complete:!1}));let se=be.lastElementChild,m=se?.querySelector("[data-rag-answer]");return window.requestAnimationFrame(()=>{se?.scrollIntoView({behavior:"smooth",block:"start"})}),{turnElement:se,answerElement:m}},dt=()=>{be.innerHTML=u.length?u.map(D=>Zo(D.question,il(D.question,D.payload||{},""))).join(""):Hr(),Array.from(be.querySelectorAll(".rag-turn")).forEach((D,O)=>{let se=u[O]?.payload;se&&s.set(D,se)})},st=async w=>{try{let D=await J.ragShareGet(w);if(a)return!1;let O=(Array.isArray(D?.turns)?D.turns:[]).map(se=>({question:String(se?.question||"").trim().slice(0,500),asked_at:String(se?.asked_at||""),payload:se?.payload&&typeof se.payload=="object"?se.payload:{}})).filter(se=>se.question);if(!O.length)throw new Error("\u5206\u4EAB\u5167\u5BB9\u662F\u7A7A\u7684\u3002");return h=null,u=O,f=O[O.length-1]?.question||"",H(!0),dt(),Q(),ae(),Ee(Y,!1),Ee(q,!1),zr({keepToken:!0,token:w}),window.scrollTo({top:0,behavior:"auto"}),N("\u5DF2\u8F09\u5165\u5206\u4EAB\u7684\u5C0D\u8A71\u3002","ok",3200),!0}catch{return zr(),a||N("\u5206\u4EAB\u9023\u7D50\u5DF2\u5931\u6548\u6216\u7121\u6CD5\u8F09\u5165\u3002","warn",5200),!1}},Ze=(w,D)=>{let O=Array.from(be.querySelectorAll(".rag-turn")),se=O.indexOf(w),m=se>=0?se+1:O.length,y=[];for(let L=0;L<m;L+=1){let z=O[L],K=u[L],U=String(K?.question||z?.querySelector(".rag-user-bubble")?.textContent||"").trim();if(!U)continue;let he=K?.payload||s.get(z)||(L===se?{status:"operational",answer:Ur(z),answer_source:"shared"}:{});y.push({question:U,asked_at:K?.asked_at||"",payload:he})}return!y.length&&D&&y.push({question:D,asked_at:"",payload:{status:"operational",answer:Ur(w),answer_source:"shared"}}),y},et=w=>{let D=Array.isArray(w.turns)?w.turns:[];return D.length?($+=1,Xt(),Jt(null),h=w.id??null,u=D.map(O=>({...O})),f=u[u.length-1]?.question||"",H(!0),dt(),Q(),ae(),Ee(Y,!1),Ee(q,!1),window.setTimeout(()=>{ne.scrollIntoView({behavior:"smooth",block:"end"})},50),!0):!1},ae=()=>{if(a)return;if(Te(),!i){T.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',de.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',I.textContent="0",oe.textContent="0",l&&(Ae.innerHTML=ol(o,[],d));return}let w=o.find(z=>String(z.id)===d)||null;d&&!w&&(d="");let D=new Map(o.map(z=>[String(z.id),z])),O=n.filter(z=>!!z.pinned),se=n.filter(z=>!z.pinned),m=d?se.filter(z=>String(z.project_id||"")===d):se,y=m.slice(0,p),L=(z,K)=>cp(z,D,K,h);de.innerHTML=O.length?O.map(L).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',Ae.innerHTML=ol(o,n,d),T.innerHTML=y.length?y.map(L).join(""):`<div class="rag-library-empty">${d?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u672A\u91D8\u9078\u7684\u9805\u76EE\u3002":O.length?"\u6700\u8FD1\u7684\u9805\u76EE\u90FD\u5DF2\u91D8\u9078\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,m.length>p&&T.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${c(m.length-p)} \u7B46</button>`),I.textContent=String(O.length),Se.textContent=String(o.length),oe.textContent=String(m.length),w?(ke.hidden=!1,ke.innerHTML=`<span>${g("folder",12)}<strong>${r(w.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${g("x",12)}</button>`):(ke.hidden=!0,ke.innerHTML="")},tt=async()=>{try{let w=await _s("rag.projects",[]);o=Array.isArray(w)?w.map(D=>({id:String(D?.id||""),name:String(D?.name||"").trim()})).filter(D=>D.id&&D.name):[]}catch{o=[]}l=!0,a||ae()},Ge=w=>{d=String(w||""),p=8,ae()},ot=()=>{let w=Ae.querySelector('[data-rag-form="project"]');w&&(w.hidden=!1,w.querySelector("input")?.focus())},mt=()=>{let w=Ae.querySelector('[data-rag-form="project"]');w&&(w.hidden=!0,w.reset())},le=async w=>{let D=w.elements.project_name,O=String(D?.value||"").trim();if(!O){N("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),D?.focus();return}if(o.some(m=>m.name.toLowerCase()===O.toLowerCase())){N("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),D?.focus();return}let se=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;o=[...o,{id:se,name:O.slice(0,60),created_at:new Date().toISOString()}],d=se,p=8,await ka("rag.projects",o),ae(),N(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${O}\u300D\u3002`,"ok")},xe=async w=>{let D=n.find(m=>String(m.id)===String(w));if(!D)return;let O=!D.pinned;if(!await _a(D.id,{pinned:O})){N("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}D.pinned=O,ae(),N(O?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},We=()=>{$+=1,Xt(),Jt(null),f="",h=null,u=[],H(!1),_e(),be.innerHTML=Hr(),W.value="",G(),M.value="",R(),Ee(Y,!1),Ee(q,!1),ae(),ge?.open&&ge.close(),ee?.open&&ee.close(),W.focus(),window.scrollTo({top:0,behavior:"smooth"})},He=w=>{if(!w||Pe.hidden)return;let D=w.getBoundingClientRect(),O=Pe.getBoundingClientRect(),se=6,m=D.bottom+se;m+O.height>window.innerHeight-8&&(m=Math.max(8,D.top-O.height-se));let y=D.right-O.width;y=Math.max(8,Math.min(y,window.innerWidth-O.width-8)),Pe.style.left=`${Math.round(y)}px`,Pe.style.top=`${Math.round(m)}px`},xt=w=>{Pe.innerHTML=`
      <button type="button" role="menuitem" data-menu-action="rename">${g("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${g("pin",13)}<span>${w.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${g("link",13)}<span>\u5EFA\u7ACB\u516C\u958B\u9023\u7D50</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${g("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${g("trash",13)}<span>\u522A\u9664</span></button>`},pt=w=>{let D=String(w.project_id||""),O=[{id:"",name:"\u672A\u5206\u985E"},...o.map(se=>({id:String(se.id),name:se.name}))];Pe.innerHTML=`
      <div class="rag-history-menu-head">${g("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${O.map(se=>`<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${r(se.id)}">
            <span class="rag-history-menu-check">${D===se.id?g("check",12):""}</span>
            <span>${r(se.name)}</span>
          </button>`).join("")}
      ${o.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${g("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},x=(w,D)=>{let O=n.find(se=>String(se.id)===String(D));O&&(Te(),P=String(O.id),B=w,xt(O),Pe.hidden=!1,w.setAttribute("aria-expanded","true"),He(w))},E=async w=>{let D=window.prompt("\u91CD\u65B0\u547D\u540D\u5C0D\u8A71",w.title||"");if(D===null)return;let O=D.trim();if(!O){N("\u540D\u7A31\u4E0D\u80FD\u7A7A\u767D\u3002","warn");return}if(O===w.title)return;if(!await _a(w.id,{title:O})){N("\u91CD\u65B0\u547D\u540D\u5931\u6557\u3002","danger");return}w.title=O,ae(),N("\u5C0D\u8A71\u5DF2\u91CD\u65B0\u547D\u540D\u3002","ok")},C=async w=>{let D=(Array.isArray(w.turns)?w.turns:[]).map(O=>({question:String(O?.question||"").trim(),asked_at:String(O?.asked_at||""),payload:O?.payload&&typeof O.payload=="object"?O.payload:{}}));D.length||D.push({question:w.title||"\u672A\u547D\u540D\u5C0D\u8A71",asked_at:"",payload:{}}),await el(D,w.title||"Judgment RAG \u5C0D\u8A71")},F=async w=>{if(!window.confirm(`\u522A\u9664\u5C0D\u8A71\u300C${w.title||"\u672A\u547D\u540D\u5C0D\u8A71"}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002`))return;if(!await ro(w.id)){N("\u522A\u9664\u5931\u6557\u3002","danger");return}let O=h!==null&&String(h)===String(w.id);n=n.filter(se=>String(se.id)!==String(w.id)),O?We():ae(),N("\u5C0D\u8A71\u5DF2\u522A\u9664\u3002","ok")},Z=async(w,D)=>{if(!await _a(w.id,{project_id:D})){N("\u79FB\u81F3\u5C08\u6848\u5931\u6557\u3002","danger");return}w.project_id=D;let se=o.find(m=>String(m.id)===String(D));ae(),N(se?`\u5DF2\u79FB\u81F3\u5C08\u6848\u300C${se.name}\u300D\u3002`:"\u5DF2\u79FB\u51FA\u5C08\u6848\u3002","ok")},ce=async w=>{let D=w.target.closest("[data-menu-action]");if(!D)return;let O=n.find(m=>String(m.id)===P);if(!O){Te();return}let se=D.dataset.menuAction;se==="rename"?(Te(),await E(O)):se==="toggle-pin"?(Te(),await xe(O.id)):se==="share"?(Te(),await C(O)):se==="move"?(pt(O),He(B)):se==="assign-project"?(Te(),await Z(O,D.dataset.projectId||"")):se==="back"?(xt(O),He(B)):se==="delete"&&(Te(),await F(O))},pe=w=>{Pe.hidden||(typeof w.composedPath=="function"?w.composedPath():[]).includes(Pe)||Pe.contains(w.target)||w.target.closest('[data-rag-action="open-history-menu"]')||Te()},Fe=w=>{w.key==="Escape"&&Te()},Ie=w=>{w.target instanceof Node&&Pe.contains(w.target)||Te()},Ce=async()=>{try{if(n=await un({limit:120}),a)return;i=!0,ae(),X.textContent=ya()==="indexeddb"?"\u6B77\u53F2\u6E05\u55AE\u53EA\u5B58\u5728\u6B64\u700F\u89BD\u5668\uFF1B\u9001\u51FA\u554F\u984C\u6642\u6703\u50B3\u9001\u5230\u4F3A\u670D\u5668\u7522\u751F\u7B54\u6848\uFF0C\u4F3A\u670D\u5668\u6703\u4FDD\u7559\u63D0\u554F\u8207\u56DE\u7B54\u6587\u5B57 90 \u5929\u7528\u65BC\u6548\u80FD\u8207\u54C1\u8CEA\u5206\u6790\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(a)return;n=[],i=!0,ae(),T.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},Ve=async(w,D,O,se)=>{let m=u,y=h;m.push({question:w,asked_at:new Date().toISOString(),payload:tl(D)});let L=Array.isArray(D.citations)?D.citations:[],z=Array.isArray(D.judgments)?D.judgments:[],K={question:w,status:D.status,citations:L.map(re=>re.law_name),judgments:z.map(re=>re.jid)},U=`${D.status||"preview"} \xB7 ${m.length} \u8F2A`,he=new Date().toISOString(),te=re=>{se===$&&(h=re)};if(y){if(!await _a(y,{turns:m,detail:U,payload:K,updated_at:he})){let $e=await wa({kind:"rag",title:m[0]?.question||w,detail:U,project_id:O,turns:m,payload:K,updated_at:he});te($e)}}else{let re=await wa({kind:"rag",title:m[0]?.question||w,detail:U,project_id:O,turns:m,payload:K,updated_at:he});te(re)}await Ce()},Xe=()=>{let w=e.querySelector("#rag-mode-notice");if(!w)return;if(zt()){w.innerHTML=Oe({tone:"info",title:"\u5C55\u793A\u6A21\u5F0F",text:"\u53EF\u76F4\u63A5\u8F38\u5165\u6CD5\u5F8B\u554F\u984C\uFF1B\u56DE\u7B54\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u6CD5\u898F\u8207\u5224\u6C7A\u5F15\u7528\u3002"});return}let D=Array.isArray(A?.model_summary)?A.model_summary:[];if(!A){if(!S)return;w.innerHTML=An({tone:"warn",title:"\u7121\u6CD5\u53D6\u5F97 RAG \u670D\u52D9\u72C0\u614B",text:S.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u524D\u5F80\u7CFB\u7D71\u72C0\u614B\u9801\u67E5\u770B\u3002",modelSummary:D,refreshing:v});return}let O=A.data||{},se=(A.services||[]).find(L=>L.id==="rag"),m=Number(O.judgment_indexed_count||0),y=Number(O.judgment_count||0);se?.status==="operational"?w.innerHTML=An({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${c(m)} / ${c(y)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`,modelSummary:D,refreshing:v}):se?.status==="degraded"?w.innerHTML=An({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:se.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002",modelSummary:D,refreshing:v}):w.innerHTML=An({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:se?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002",modelSummary:D,refreshing:v})},nt=async()=>{if(zt()){A=null,S=null,Xe();return}try{let w=await J.status();if(a)return;A=w,S=null}catch(w){if(a)return;A=null,S=w}Xe()},Ra=async()=>{if(!v){v=!0,Xe();try{let w=await J.status();if(a)return;A=w,S=null,N("\u5DF2\u66F4\u65B0\u6A21\u578B\u72C0\u614B\u3002","ok",2500)}catch(w){N(w.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u3002","danger",6e3)}finally{v=!1,a||Xe()}}},xs=()=>{if(!Re)return;if(!_){Re.innerHTML="";return}let w=Array.isArray(k.embedding)?k.embedding.length:0,D=Array.isArray(k.llm)?k.llm.length:0;Re.innerHTML=Oe({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${w} \u500B embedding \u8207 ${D} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},Dn=async()=>{if(zt()){_=!1,xs();return}try{let w=await J.testMode();if(a)return;_=!!w.enabled,k=w.models||{embedding:[],llm:[]},xs()}catch{if(a)return;_=!1,xs()}},aa=w=>{_=!!w.detail?.enabled,k=w.detail?.models||{embedding:[],llm:[]},xs()};window.addEventListener("judgment:test-mode",aa);let Jt=w=>{if(!Me)return;qe=w||null;let D=JSON.stringify(w?{run_id:w.run_id,status:w.status,progress:w.progress,total_ms:w.total_ms,stage:w.stage,answer:w.answer||"",steps:(w.steps||[]).map(O=>`${O.stage}:${O.model}:${O.status}:${O.progress}:${O.duration_ms}`)}:null);D!==Be&&(Be=D,Me.innerHTML=w?ea(w,[],"",{showHistory:!1}):"")},Xt=()=>{ve&&(ve(),ve=null)},Os=async(w=null)=>{if(!a)try{let D=w||await J.testRunCurrent();if(a)return;let O=D.run;O&&O.status==="running"&&Jt(O)}catch{}},gs=()=>{a||ve||(Os(),ve=wt("test-runs",(w,D)=>Os(D?.snapshot||null)))},At=async w=>{if(!w){Jt(null);return}try{let D=await J.testRun(w);if(a)return;Jt(D.run||null)}catch{a||N("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},na=async()=>{if(_)try{let w=await J.testRunCurrent();if(a)return;w.run?.status==="running"&&(Jt(w.run),gs())}catch{}},ra=0,Hs=(w,D)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${r(w)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${g("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${D}</div>`,ia=w=>{let D=(Array.isArray(w.citations)?w.citations:[]).map(L=>ul(L)).filter(Boolean).join(""),O=D||(Array.isArray(w.matched_laws)?w.matched_laws:[]).map(L=>qn(L)).join(""),se=[w.court,w.jdate,w.title?`\u6848\u7531\uFF1A${w.title}`:"",w.full_text_length?`${c(w.full_text_length)} \u5B57`:"",w.citation_count?`\u5F15\u7528 ${c(w.citation_count)} \u7B46`:""].filter(Boolean).map(L=>`<span>${r(L)}</span>`).join(""),m=w.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${r(String(w.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",y=w.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(w.pdf_url)}" target="_blank" rel="noopener noreferrer">${g("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return Hs(w.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${r(w.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${se}
      </div>
      ${D?'<div class="citation-meta" style="margin-top:8px"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':""}
      ${O?`<div class="chips" style="margin:8px 0 10px">${O}</div>`:""}
      <div class="judgment-dialog-source">${m}</div>
      <pre class="judgment-dialog-text">${r(w.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${y}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},jt=async w=>{if(!ge||!w)return;let D=++ra;ge.open||ge.showModal(),ue(),ge.innerHTML=Hs("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${r(w)}\u2026</span>
      </div>`);try{let O=await J.judgmentDetail(w,"parquet");if(a||D!==ra)return;ge.innerHTML=ia(O)}catch(O){if(a||D!==ra)return;ge.innerHTML=Hs("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(O.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},oa=0,la=(w,D)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${r(w)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${g("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${D}</div>`,Bn=(w,D="")=>{let O=String(w.selected_article_no||D||"").trim(),se=!!O,m=Array.isArray(w.articles)?w.articles:[],y=m.map(ze=>{let rt=String(ze.article_content||"").trim();return rt?ze.article_type==="C"?`<div class="law-chapter">${r(rt)}</div>`:`<article class="law-article" data-article-no="${r(nl(ze.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${r(ze.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${r(rt)}</div>
        </article>`:""}).join(""),L=(Array.isArray(w.warnings)?w.warnings:[]).map(ze=>r(ze)).join("<br />"),z=w.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",K=w.meta?.articles_source,U=K==="parquet"?"Parquet \u689D\u6587":K==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",he=w.meta?.snapshot||"",te=[w.law_level,w.law_category,w.article_count?`${c(w.article_count)} \u689D`:"",w.law_modified_date?`\u7570\u52D5 ${Ft(w.law_modified_date)}`:""].filter(Boolean).map(ze=>`<span>${r(ze)}</span>`).join(""),re=w.law_url?`<a class="btn btn-secondary btn-sm" href="${r(w.law_url)}" target="_blank" rel="noopener noreferrer">${g("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",$e=!se&&w.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${r(w.law_histories)}</div>
        </details>`:"",Le=se?`<span class="badge badge-mono">${r(O)}</span>`:"",De=!se&&m.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",je=se?`${w.law_name||w.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${O}`:w.law_name||w.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return la(je,`<div class="judgment-dialog-meta">
        <span class="badge ${w.source_type==="order"?"badge-warn":"badge-info"}">${r(z)}</span>
        ${Le}
        ${te}
      </div>
      <div class="judgment-dialog-source">${r([U,he].filter(Boolean).join(" \xB7 "))}</div>
      ${L?`<div class="law-dialog-warning">${L}</div>`:""}
      ${$e}
      ${De}
      <div class="law-dialog-articles">${y||`<div class="report-empty-inline">${se?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${re}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},Ca=(w,D)=>{let O=w?.querySelector(`#${D}`),se=nl(O?.value||"");if(!se){N("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),O?.focus();return}let m=[...w?.querySelectorAll("[data-article-no]")||[]].find(y=>y.dataset.articleNo===se);if(!m){N(`\u627E\u4E0D\u5230\u7B2C ${se} \u689D\u3002`,"warn");return}m.scrollIntoView({behavior:"instant",block:"center"}),m.classList.add("is-jump-target"),window.setTimeout(()=>m.classList.remove("is-jump-target"),2400)},zs=async(w,D="",O="")=>{if(!ee||!w)return;let se=++oa;ee.open||ee.showModal(),ue(),ee.innerHTML=la(O?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${r([w,O].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let m=await J.lawDetail(w,D,"",O);if(a||se!==oa)return;ee.innerHTML=Bn(m,O)}catch(m){if(a||se!==oa)return;ee.innerHTML=la("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(m.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};ee?.addEventListener("click",w=>{let D=w.target.closest('[data-action="jump-law-article"]');if(D){Ca(ee,D.dataset.jumpInput||"rag-law-article-jump");return}if(w.target.closest('[data-action="close-law-source"]')){ee.close();return}let O=ee.getBoundingClientRect();(w.clientX<O.left||w.clientX>O.right||w.clientY<O.top||w.clientY>O.bottom)&&ee.close()}),ee?.addEventListener("keydown",w=>{!w.target.matches(".law-jump-input")||w.key!=="Enter"||(w.preventDefault(),Ca(ee,w.target.id))}),ge?.addEventListener("click",w=>{let D=w.target.closest('[data-action="open-law-source"]');if(D){zs(D.dataset.lawKey||"",D.dataset.sourceType||"",D.dataset.articleNo||"");return}if(w.target.closest('[data-action="close-parquet-judgment"]')){ge.close();return}let O=ge.getBoundingClientRect();(w.clientX<O.left||w.clientX>O.right||w.clientY<O.top||w.clientY>O.bottom)&&ge.close()}),be.addEventListener("click",w=>{let D=w.target.closest(".rag-process-toggle");if(D){let se=D.closest(".rag-process"),m=D.getAttribute("aria-expanded")==="true";Gr(se,!m);return}let O=w.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(O){if(O.dataset.action==="open-law-source"){zs(O.dataset.lawKey||"",O.dataset.sourceType||"",O.dataset.articleNo||"");return}jt(O.dataset.jid||"")}}),be.addEventListener("keydown",w=>{if(w.key!=="Enter"&&w.key!==" ")return;let D=w.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!D||D.closest("a, button"))){if(w.preventDefault(),D.dataset.action==="open-law-source"){zs(D.dataset.lawKey||"",D.dataset.sourceType||"",D.dataset.articleNo||"");return}jt(D.dataset.jid||"")}});let fs=async(w,{fresh:D=!1,source:O="hero"}={})=>{let se=w.trim();if(!se){N("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),(O==="followup"?M:W).focus();return}(D||!b)&&(h=null,u=[],be.innerHTML="",ae());let m=++$,y=()=>a||m!==$,L=d;f=se,H(!0),_e(),O==="followup"?(M.value="",R()):(W.value="",G());let{turnElement:z,answerElement:K}=Ye(se,Ku(se,_)),U=_?null:Wu(K);_?(Jt(null),gs()):(Xt(),Jt(null)),Ee(Y,!0,"\u6AA2\u7D22\u4E2D\u2026"),Ee(q,!0,"\u6AA2\u7D22\u4E2D\u2026");let he=null,te="",re=je=>{if(y()||!je?.partial)return;let ze=K.querySelector(".answer-body");if(!ze)return;he=je,te=String(je.answer||""),ze.innerHTML=ml(je),U?.collapse?.();let rt=K.querySelector(".answer-head-title");rt&&(rt.textContent=je.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},$e=je=>{if(y()||!je||!he?.streaming)return;te+=je;let ze=K.querySelector("[data-partial-answer]");ze&&(ze.textContent=te)},Le=()=>{if(y()||!he?.streaming)return;te="";let je=K.querySelector("[data-partial-answer]");je&&(je.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")},De=je=>{if(y())return;let ze=K.querySelector(".answer-body");if(!ze)return;let rt=ze.querySelector("[data-summary-queue]");rt||(rt=document.createElement("div"),rt.className="answer-notice",rt.dataset.summaryQueue="true",ze.appendChild(rt));let Rt=Number(je.position||0),ct=Number(je.eta_s||0),$t=je.lane==="summary"?"\u6458\u8981":"\u6AA2\u7D22";rt.textContent=`${$t}\u6392\u968A\u4E2D\uFF1A\u524D\u9762 ${Rt} \u4F4D\uFF0C\u9810\u4F30\u7D04 ${Math.round(ct)} \u79D2\u3002`};try{let je=_?await J.rag(se,{testMode:_}):await J.ragStream(se,{onStep:rt=>{y()||U?.step(rt)},onPartial:re,onQueued:De,onToken:$e,onTokenReset:Le});if(y())return;Xt();let ze=U?.finish(!0)||"";if(K.innerHTML=il(se,je,ze),z&&s.set(z,tl(je)),z?.classList.remove("is-pending"),z?.classList.add("is-complete"),je.pipeline_flow||Gu(je).then(()=>{if(y()||!je.pipeline_flow)return;let rt=K.querySelector(".answer-body");if(!rt||rt.querySelector(".rag-wf-card"))return;let Rt=Sn(je.pipeline_flow,{serverDurationMs:Number(je.duration_ms)||0,embedded:!0});Rt&&rt.insertAdjacentHTML("beforeend",Rt)}),je.test_run?.run_id?await At(je.test_run.run_id):Jt(null),await Ve(se,je,L,m),y())return;Q()}catch(je){if(y())return;Xt();let ze=U?.finish(!1)||"";K.innerHTML=op(je,ze,se),z?.classList.remove("is-pending"),z?.classList.add("is-complete"),Q(),N(je.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{y()||(Xt(),Ee(Y,!1),Ee(q,!1))}};j.addEventListener("submit",w=>{w.preventDefault(),fs(W.value,{fresh:!0,source:"hero"})}),ne.addEventListener("submit",w=>{w.preventDefault(),fs(M.value,{fresh:!1,source:"followup"})}),W.addEventListener("input",G),W.addEventListener("keydown",w=>{w.key==="Enter"&&!w.shiftKey&&!w.isComposing&&(w.preventDefault(),j.requestSubmit())}),M.addEventListener("input",R),M.addEventListener("keydown",w=>{w.key==="Enter"&&!w.shiftKey&&!w.isComposing&&(w.preventDefault(),ne.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",w=>{let D=w.target.closest("[data-question]");D&&(W.value=D.dataset.question,G(),j.requestSubmit())}),e.addEventListener("click",async w=>{let D=w.target.closest("[data-rag-question-action]"),O=w.target.closest("[data-rag-answer-action]");if(D||O){w.preventDefault(),w.stopPropagation();let se=D?D.dataset.ragQuestionAction:O.dataset.ragAnswerAction,m=D||O,y=Number(w.detail||0)>0||!!window.matchMedia?.("(pointer: coarse)")?.matches,L=(U=!1)=>{(U||y)&&document.activeElement===m&&m.blur()},z=String(m?.dataset.question||"").trim(),K=m?.closest(".rag-turn");if(!z||!K)return;if(se==="copy"){try{let U=D?z:Ur(K),he=await qs(U);N(he?D?"\u5DF2\u8907\u88FD\u554F\u984C\u3002":"\u5DF2\u8907\u88FD\u56DE\u7B54\u3002":"\u7121\u6CD5\u8907\u88FD\u3002",he?"ok":"danger")}finally{L()}return}if(se==="share"){L(!0);try{await el(Ze(K,z),D?"Judgment RAG \u63D0\u554F":"Judgment RAG \u56DE\u7B54")}finally{L(!0)}return}if(se==="edit"){let U=b?M:W;b&&Q(),U.value=z,b?R():G(),U.scrollIntoView({behavior:"smooth",block:"center"}),U.focus({preventScroll:!0}),U.setSelectionRange(z.length,z.length);return}if(se==="reask"){if(Y.disabled){N("\u76EE\u524D\u4ECD\u5728\u6AA2\u7D22\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","warn");return}await fs(z,{fresh:!1,source:"followup"})}return}w.target.closest('[data-rag-action="refresh-models"]')&&await Ra()}),V.addEventListener("click",async w=>{let D=w.target.closest("[data-rag-toggle]");if(D){let z=D.closest(".rag-library-section").classList.toggle("is-collapsed");D.setAttribute("aria-expanded",String(!z));return}let O=w.target.closest("[data-rag-action]"),se=O?.dataset.ragAction||"";if(se==="new-chat"){We();return}if(se==="open-history-menu"){x(O,O.dataset.historyId);return}if(se==="toggle-pin"){await xe(O.dataset.historyId);return}if(se==="select-project"){Ge(O.dataset.projectId||"");return}if(se==="show-project-form"){ot();return}if(se==="cancel-project"){mt();return}if(se==="more-recent"){p+=12,ae();return}if(se==="clear-project"){Ge("");return}let m=w.target.closest("[data-history-open]");if(!m)return;let y=n.find(L=>String(L.id)===String(m.dataset.historyId));y&&(d=String(y.project_id||""),ae(),!et(y)&&(h=null,u=[],fs(y.title,{fresh:!0,source:"history"})))}),V.addEventListener("submit",async w=>{let D=w.target.closest('[data-rag-form="project"]');D&&(w.preventDefault(),await le(D))}),Pe.addEventListener("click",ce),document.addEventListener("click",pe),document.addEventListener("keydown",Fe),window.addEventListener("scroll",Ie,{capture:!0,passive:!0}),window.addEventListener("resize",Te),me.addEventListener("click",async()=>{if(!n.length){N("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await io(),await Ce(),N("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),G(),await Promise.allSettled([nt(),Ce(),tt(),Dn()]),await na();let ca=!1;if(t?.token&&(ca=await st(t.token)),!ca){let w="",D="home";try{w=window.sessionStorage.getItem("judgment.pending_question")||"",window.sessionStorage.removeItem("judgment.pending_question")}catch{w=""}!w&&typeof window.__judgmentPendingQuestion=="string"&&(w=window.__judgmentPendingQuestion),delete window.__judgmentPendingQuestion,!w&&t?.question&&(w=t.question,D="share"),w=String(w||"").trim().slice(0,500),w&&W&&(W.value=w,G(),window.setTimeout(()=>{a||fs(w,{fresh:!0,source:D})},40))}return()=>{a=!0,Xt(),Te(),document.removeEventListener("click",pe),document.removeEventListener("keydown",Fe),window.removeEventListener("scroll",Ie,{capture:!0}),window.removeEventListener("resize",Te),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",aa),f&&be.setAttribute("data-last-question",f)}}var ri={};rs(ri,{render:()=>pm});var Kr=new Set(["legal_index_versions","judgment_import","index_versions"]),gl=new Map,Yr=new Set,Xr=new Set;function qa(e){let t=Number(e);if(!Number.isFinite(t)||t<0)return"\u2014";if(t<60)return`${Math.round(t)} \u79D2`;let s=Math.floor(t/60),a=Math.round(t%60);if(s<60)return`${s} \u5206 ${a} \u79D2`;let n=Math.floor(s/60),i=s%60;if(n<24)return`${n} \u5C0F\u6642 ${i} \u5206`;let o=Math.floor(n/24),l=n%24;return`${o} \u5929 ${l} \u5C0F\u6642`}function Wr(e){return String(e||"").trim().replace(/:latest$/,"")}var up={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},partial:{label:"\u90E8\u5206\u5B8C\u6210",tone:"warn"},update:{label:"\u66F4\u65B0",tone:"warn"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"},provided:{label:"\u5916\u90E8\u63D0\u4F9B",tone:"info"}},Zr=["download","parquet","postgres","qdrant"],pp={download:"\u4E0B\u8F09",parquet:"Parquet",postgres:"PostgreSQL",qdrant:"Qdrant"},mp={judgment:{download:["download"],parquet:["raw_parquet","extract"],postgres:["postgres"],qdrant:["qdrant"]},law:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]},order:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]}},fl={complete:"\u5B8C\u6210",incomplete:"\u672A\u5B8C\u6210",pending:"\u5F85\u66F4\u65B0",processing:"\u8655\u7406\u4E2D",empty:"\u7121\u8CC7\u6599",not_applicable:"\u5DF2\u53D6\u4EE3"},bl={complete:"is-green",incomplete:"is-red",pending:"is-pending",processing:"is-gray",empty:"is-empty",not_applicable:"is-empty"};var Ut=new Map,Gt="",Cs="",hl={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},vl={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},gp={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"};var $l={law_download:"law",order_download:"order",judgment_download:"judgment"},yl={law_download:"\u6CD5\u898F\u4E0B\u8F09",order_download:"\u547D\u4EE4\u4E0B\u8F09",judgment_download:"\u5224\u6C7A\u4E0B\u8F09"},fp={law_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",order_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",judgment_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u5224\u6C7A RAR \u55CE\uFF1F\uFF08\u4E0D\u6703\u81EA\u52D5\u532F\u5165 PostgreSQL \u6216\u5EFA\u7ACB Qdrant \u7D22\u5F15\uFF09"},bp={law_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u6CD5\u898F RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",order_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u547D\u4EE4 RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",judgment_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u53EA\u4E0B\u8F09\u5224\u6C7A RAR\u3002PostgreSQL\uFF0FParquet \u532F\u5165\u8207 Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\u300C\u5224\u6C7A\u532F\u5165\u300D\u6216\u5B8C\u6574\u8CC7\u6599\u66F4\u65B0\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_import:"\u6D41\u7A0B\u7BC4\u570D\uFF1ARAR \u2192 \u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD \u2192 \u91D1\u878D\u6CD5\u898F\u7BE9\u9078 \u2192 PostgreSQL\u3002Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_parquet:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5F9E PostgreSQL \u532F\u51FA\u67E5\u8A62\u7528 Parquet \u5FEB\u7167\uFF1B\u4E0D\u5BEB\u5165 Qdrant\uFF0FIndexedDB\u3002",index_versions:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5EFA\u7ACB\u4E26\u9A57\u8B49\u65B0\u7684 Qdrant collection\uFF0C\u5B8C\u6210\u5F8C\u539F\u5B50\u5207\u63DB alias\uFF1BIndexedDB \u4E0D\u53C3\u8207\u3002"};function Ss(e){return up[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Dt(e,t){let s=Ss(e);return`<span class="badge ${hl[s.tone]||hl.idle}"><span class="status-dot ${vl[s.tone]||vl.idle}"></span>${r(t||s.label)}</span>`}function vt(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function wl(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":c(e)}function xl(e){return e&&e.color?String(e.color):"var(--accent)"}function ei(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return["skipped","pending","idle"].includes(e.status)?"\u2014":s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${Ne(s)} / ${Ne(a)}`:Ne(s):a?`${c(s)} / ${c(a)} ${t}`:`${c(s)} ${t}`}function Ps(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${r(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function hp(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},n=e.raw_backups||{},i=n.totals||{},o=e.state||{},l=e.capabilities||{},d=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",p=t.status==="operational",f=s.status==="operational",$=a.available!==!1,h=n.available!==!1,u=f?`${c(s.indexed)} / ${c(s.total)}`:Dt(s.status||"unavailable"),b=f?`${vt(s.percent)} \xB7 \u5C1A\u9918 ${c(s.remaining)} \u7B46`:r(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),_=$?`${c(a.unprocessed)} / ${c(a.total)}`:Dt("unavailable"),k=$?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${Ne(a.unprocessed_bytes)} \u5F85\u8655\u7406`:r(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${as(Tp(e))}
    ${Ps("\u8655\u7406\u72C0\u614B",Dt(e.status||"unknown"),`${r(d)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${Ps("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",r(_),k)}
    ${Ps("\u539F\u59CB\u8CC7\u6599\u5099\u4EFD",h?`${c(n.count)} \u6A94`:Dt("unavailable"),h?`\u5171 ${c(i.row_count)} \u7B46 \xB7 ${Ne(i.compressed_bytes)}`:r(n.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB\u8CC7\u6599\u5099\u4EFD\u3002"))}
    ${Ps("PostgreSQL \u5224\u6C7A",p?c(t.judgment_count):Dt("unavailable"),p?`\u6CD5\u898F ${wl(t.law_count)} \xB7 \u547D\u4EE4 ${wl(t.order_count)}`:r(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${Ps("Qdrant \u7D22\u5F15",u,b)}
    ${Ps("\u72C0\u614B\u6A94",Dt(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${r(ye(o.updated_at))}`:r(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${Ps("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?r(l.start_blocked_reason):`\u672A\u8655\u7406 ${c(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${c(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${c(l.external_processes)} \u500B`:""}`)}
  </div>`}function vp(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let n=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${r(o.color||"var(--accent)")}" title="${r(`${o.label} ${fe(o.duration_ms)} (${vt(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${r(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${r(o.label)}</span>
        <span class="mono">${fe(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${vt(o.percent)}</span>
        ${Dt(o.status)}
      </div>`).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section">
      <div class="processing-timeline-label">
        <span>${r(t.label||"\u968E\u6BB5\u8017\u6642")}</span>
        <span class="mono">\u7E3D\u8A08 ${fe(t.total_ms)}</span>
      </div>
      <div class="processing-stack" role="img" aria-label="\u968E\u6BB5\u8017\u6642\u6BD4\u4F8B">${n}</div>
      <div class="processing-legend">${i}</div>
    </div>
  </section>`}function $p(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let n=t.map(i=>{let o=s.get(i.branch)||gp[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${r(o)}</span>
          <strong>${r(i.title||"\u8655\u7406")}</strong>
          ${Dt(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${r(ye(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?fe(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${r(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${n}</div></div>
  </section>`}function yp(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>Oe({tone:s.tone||"info",title:s.title,text:r(s.message||"")})).join("")}</div>`:""}function Al(e,t){if(e==="law"||e==="order")return t==="qdrant"?"legal_index_versions":`${e}_download`;if(e==="judgment"){if(t==="download")return"judgment_download";if(t==="parquet"||t==="postgres")return"judgment_import";if(t==="qdrant")return"index_versions"}return""}function ti({month:e,year:t,monthNo:s,stageOrder:a,stageLabels:n,stageStatuses:i,overall:o,active:l,processing:d=!1,workflowForStage:p,stageProgress:f=null,variant:$="legacy"}){let h=i||{},u=$==="index"||$==="import",b=String(e?.month||`${t}${String(s).padStart(2,"0")}`),_=e?.month_label||`${t}-${String(s).padStart(2,"0")}`,k=M=>u&&M==="processing"?"\u57F7\u884C\u4E2D":fl[M]||fl.empty,A=M=>{let q=h[M]||"empty";if(!(q==="processing"||M==="qdrant"&&q==="incomplete"))return null;let X;if(typeof f=="function")X=f(M,b,q);else if($==="import"&&f&&typeof f=="object")X=f[M];else return null;let me=Number(X);return Number.isFinite(me)?Math.max(0,Math.min(100,me)):null},S=a.map(M=>{let q=h[M]||"empty",T=A(M),X=M==="qdrant"&&q==="incomplete"&&T!==null&&T>0,me=X?"\u5DF2\u8655\u7406":k(q),V=!X&&T!==null&&T>0?` ${T.toFixed(1)}%`:"";return`${n[M]||M}\uFF1A${me}${V}`}).join(" \xB7 "),v=(e?.versions||[]).map(M=>M.version_code).filter(Boolean),j=[...new Set([...e?.files||[],...e?.local_files||[],...e?.imported_files||[]])].filter(Boolean),W=v.length?` \xB7 \u7248\u672C ${v.join("\u3001")}`:j.length?` \xB7 ${j.join("\u3001")}`:"",Y=e?.detail?` \xB7 ${e.detail}`:"",we=e?`${_} \xB7 ${S}${W}${Y}`:`${_} \xB7 \u7121\u8CC7\u6599`,be=u?o==="empty"?"is-empty":"is-neutral":bl[o]||"is-empty",ne=a.map(M=>{let q=h[M]||"empty",T=q==="incomplete"||q==="pending"?p(M):"",X=T?"button":"span",me=T?` type="button" data-timeline-workflow="${r(T)}"`:"",V=A(M),de=M==="qdrant"&&q==="incomplete"&&V!==null&&V>0,Ae=q==="processing"&&V!==null?` ${V.toFixed(1)}%`:"",I=de?"\u5DF2\u8655\u7406":k(q),Se=q==="complete"?"is-complete":q==="processing"?"is-running":de?"is-partial":q==="incomplete"?"is-incomplete":q==="pending"?"is-pending":"is-empty",oe=u?["index-month-block","processing-month-stage",`is-${M}`,Se,T?"is-actionable":""]:["processing-month-stage",`is-${M}`,bl[q]||"is-empty",Se,T?"is-actionable":""],Re=(q==="processing"||de)&&V!==null?` style="--stage-progress:${V.toFixed(1)}%"`:"";return`<${X} class="${oe.filter(Boolean).join(" ")}"${me}${Re} title="${r(`${n[M]||M}\uFF1A${I}${Ae}${T?"\uFF08\u9EDE\u9078\u524D\u5F80\u8655\u7406\uFF09":""}`)}" aria-label="${r(`${_} ${n[M]||M} ${I}${Ae}${T?"\uFF0C\u9EDE\u9078\u524D\u5F80\u8655\u7406":""}`)}"></${X}>`}).join("");return u?`<td class="judgment-month index-month index-month-are processing-month ${be}${l?" is-current":""}${d&&!l?" is-processing-current":""}" data-month="${r(b)}" title="${r(we)}" aria-label="${r(we)}"${l?' aria-current="true"':""}>
    <span class="index-month-number">${s}</span>
    <span class="index-month-blocks">${ne}</span>
  </td>`:`<td class="judgment-month import-month processing-month${l?" is-current":""} is-${r(o)}" data-month="${r(b)}" title="${r(we)}" aria-label="${r(we)}"${l?' aria-current="true"':""}>
    <span class="processing-month-number">${s}</span>
    <span class="processing-month-stages">${ne}</span>
  </td>`}function wp(e,t,s,a,n){return ti({month:t,year:s,monthNo:a,stageOrder:Zr,stageLabels:pp,stageStatuses:t?.stages||{},overall:t?.overall||"empty",active:!!(t?.active||t?.overall==="processing"),workflowForStage:i=>Al(e.key,i),stageProgress:n,variant:"index"})}function _p(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=Number(s?.incomplete)||0,o=Number(s?.superseded)||0,l=a>0?(n+o)/a*100:null,d=["download","prepared","indexed"],p=0,f=0;for(let h of t){let u=h?.stages||{};for(let b of d){let _=u[b];!_||_==="empty"||_==="not_applicable"||(p+=1,_==="complete"&&(f+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(n),"\u5DF2\u5B8C\u6210 D\uFF0FP\uFF0FI \u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(i+(Number(s?.processing)||0)),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u5DF2\u53D6\u4EE3\u6708\u4EFD",c(o),"\u820A\u7248\u672C\u5DF2\u88AB\u76EE\u524D\u7248\u672C\u53D6\u4EE3\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",vt(l),"\u5B8C\u6210\u6216\u5DF2\u53D6\u4EE3\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c(f)} / ${c(p)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([h,u,b])=>`<span class="index-runtime-metric" title="${r(b)}"><span>${r(h)}</span><strong>${r(u)}</strong></span>`).join("")}</div>`}function kp(e,t,s,a){let n=Number(e?.total_months)||t.length||0,i=Number(s?.complete)||0,o=Number(s?.incomplete)||0,l=Number(s?.processing)||0,d=Number(a?.gray)||0,p=n>0?i/n*100:null,f=0,$=0;for(let u of t){let b=u?.import_stages||{};for(let _ of["extract","raw_parquet","filter","postgres"]){let k=b[_];!k||k==="empty"||(f+=1,k==="complete"&&($+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(i),"\u56DB\u500B\u532F\u5165\u968E\u6BB5\u90FD\u5B8C\u6210\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(o+l),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\uFF08\u542B\u8655\u7406\u4E2D\uFF09\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",c(d),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(n),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",vt(p),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c($)} / ${c(f)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([u,b,_])=>`<span class="index-runtime-metric" title="${r(_)}"><span>${r(u)}</span><strong>${r(b)}</strong></span>`).join("")}</div>`}function Sp(e,{titleSuffix:t="\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868"}={}){let s=`${r(e?.label||"\u6CD5\u898F\uFF0F\u547D\u4EE4")} ${r(t)}`,a=Array.isArray(e?.months)?e.months:[];if(!a.length)return`<section class="report-card processing-card import-files-card law-index-timeline-card">
      <div class="side-card-head">
        <span class="side-card-title">${g(e?.key==="order"?"file":"layers",14)}${s}</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u7121\u4E0B\u8F09\u7248\u672C\u6216\u7D22\u5F15\u7D00\u9304\u3002</div>
    </section>`;let n=new Map(a.map(h=>[String(h.month),h])),i=[...new Set(a.map(h=>h.year))].sort((h,u)=>String(u).localeCompare(String(h))),o=["download","prepared","indexed"],l=e.stage_labels||{download:"D \u4E0B\u8F09\u7248\u672C",prepared:"P \u8CC7\u6599\u5C31\u7DD2",indexed:"I \u7D22\u5F15\u8986\u84CB"},d=e.summary||{},p=e.current||{},f=i.map(h=>{let u=Array.from({length:12},(b,_)=>{let k=_+1,A=`${h}${String(k).padStart(2,"0")}`,S=n.get(A);return ti({month:S,year:h,monthNo:k,stageOrder:o,stageLabels:l,stageStatuses:S?.stages||{},overall:S?.overall||"empty",active:!!S?.active,workflowForStage:v=>v==="indexed"?"legal_index_versions":`${e.key}_download`,variant:"index"})}).join("");return`<tr><th scope="row">${r(h)}</th>${u}</tr>`}).join(""),$=p.month?`<div class="index-current-row">
        <span class="badge badge-info">${g("activity",11)}${r(p.label||"\u76EE\u524D\u7248\u672C")}</span>
        <strong class="mono">${r(p.month_label||jn(p.month))}</strong>
        <span class="mono">${r(p.file||"\u2014")}</span>
        <span class="index-current-copy">${r(p.detail||"")}</span>
      </div>`:"";return`<section class="report-card processing-card import-files-card law-index-timeline-card" data-law-index-timeline="${r(e.key||"")}">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${g(e.key==="order"?"file":"layers",14)}${s}</span>
      ${_p(e,a,d)}
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(h,u)=>`<th scope="col">${u+1}</th>`).join("")}</tr></thead>
          <tbody>${f}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">D\uFF1A\u4E0B\u8F09\u7248\u672C\uFF1BP\uFF1Araw Parquet + PostgreSQL \u5C31\u7DD2\uFF1BI\uFF1Aactive \u7D22\u5F15\u8986\u84CB\uFF08\u7531\u6CD5\u898F\uFF0F\u547D\u4EE4\u7D22\u5F15\u6D41\u7A0B\u7DAD\u8B77\uFF09\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF0C\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u5B8C\u6210\u8272\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u6216\u5DF2\u53D6\u4EE3\u3002\u820A\u7248\u672C\u986F\u793A\u300C\u5DF2\u53D6\u4EE3\u300D\uFF0C\u4E0D\u9700\u91CD\u5EFA\u7D22\u5F15\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u7DE8\u865F\u3001\u4E0B\u8F09\u6642\u9593\u8207\u7B46\u6578\u3002</p>
    </div>
  </section>`}function xp(e,t={}){let s=Array.isArray(e)?e:[];return s.length?`<div class="law-index-timelines">${s.map(a=>Sp(a,t)).join("")}</div>`:""}function ql({activeMonth:e,activeArchive:t,activePhase:s="",processingMonth:a="",processingArchive:n="",stageLabels:i={}}){if(!e||!t)return"";let o=`${String(e).slice(0,4)}-${String(e).slice(4,6)}`,l=i[s]||(s?"\u6E96\u5099\u4E2D":""),d=`${String(a||"").slice(0,4)}-${String(a||"").slice(4,6)}`,p=!!a&&(a!==e||n!==t);return`<span class="badge badge-info">${g("activity",11)}\u76EE\u524D\u532F\u5165</span>
    <strong class="mono">${r(o)}</strong>
    <span class="mono">${r(t)}</span>
    ${l?`<span class="badge badge-neutral">${r(l)}</span>`:""}
    ${p?`<span class="processing-current-processing">
            <span class="faint">\u8655\u7406\u4E2D</span>
            <strong class="mono">${r(d)}</strong>
            <span class="mono">${r(n||"\u2014")}</span>
          </span>`:""}`}function Ap(e,t,s,a){let n=[];for(let i=1;i<=12;i+=1){let o=`${t}${String(i).padStart(2,"0")}`;n.push(wp(e,s.get(o),t,i,a))}return`<tr><th scope="row">${t}</th>${n.join("")}</tr>`}function qp(e){let t=e?.models||{};return[["Embedding",t.embedding],["Rerank",t.rerank]].filter(([,s])=>s&&(s.label||s.model)).map(([s,a])=>{let n=a.label||[a.host,a.model].filter(Boolean).join(" ")||"\u2014",i=[`${s} \u4E3B\u6A5F\u8207\u6A21\u578B\uFF1A${n}`,a.url?`\u7AEF\u9EDE\uFF1A${a.url}`:"",s==="Rerank"&&a.enabled===!1?"RAG_RERANK_ENABLED=false":""].filter(Boolean).join(" \xB7 ");return`<span class="processing-timeline-model" title="${r(i)}">${s} <strong class="mono">${r(n)}</strong>${s==="Rerank"&&a.enabled===!1?' <span class="faint">\u672A\u555F\u7528</span>':""}</span>`}).join("")}function Mp(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=a>0?n/a*100:null,o=t.reduce((f,$)=>{let h=$?.stages||{};return f+Zr.filter(u=>!!h[u]&&h[u]!=="empty"&&h[u]!=="not_applicable").length},0),l=t.reduce((f,$)=>{let h=$?.stages||{};return f+Zr.filter(u=>h[u]==="complete").length},0),d=(Number(s?.incomplete)||0)+(Number(s?.processing)||0);return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(n),"\u5DF2\u5B8C\u6210\u5168\u90E8\u56DB\u500B\u968E\u6BB5\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(d),"\u4ECD\u6709\u81F3\u5C11\u4E00\u500B\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",c(s?.update||0),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",vt(i),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c(l)} / ${c(o)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([f,$,h])=>`<span class="index-runtime-metric" title="${r(h)}"><span>${r(f)}</span><strong>${r($)}</strong></span>`).join("")}</div>`}function Lp(e,t){let s=new Map((Array.isArray(e?.workflows)?e.workflows:[]).map(f=>[String(f.id||""),f])),a=t.key==="judgment"?"index_versions":"legal_index_versions",i=s.get(a)?.index_runtime||{},o=f=>{if(f==null||f==="")return null;let $=Number(f);return Number.isFinite($)?Math.max(0,Math.min(100,$)):null},l=new Map((Array.isArray(i.months)?i.months:[]).map(f=>[String(f?.month||""),o(f?.percent)])),d=new Map(Object.entries(i.active_coverage||{}).map(([f,$])=>[String(f),o($?.percent)])),p=(f,$)=>{let h=s.get(String(f||""));if(!h)return null;let u=h.progress||{},b=Array.isArray(u.stages)?u.stages:[];for(let _ of $){let k=b.find(S=>String(S.key)===_),A=o(k?.percent);if(A!==null)return A}return o(u.percent)};return(f,$,h)=>{let u=String($||"");if(f==="qdrant"){let k=l.get(u),A=d.get(u);if(h==="processing"){if(k!==null&&k>0)return k;if(A!==null&&A>0)return A}else return h==="incomplete"?k!==null&&k>0?k:A!==null&&A>0?A:0:null}let b=Al(t.key,f);if(!b)return null;let _=(mp[t.key]||{})[f]||[f];return p(b,_)}}function jp(e){let t=Array.isArray(e.file_timelines)?e.file_timelines:[];return t.length?`<div class="processing-timeline-overview">${t.map(s=>{let a=Array.isArray(s.months)?s.months:[],n=new Map(a.map(f=>[String(f.month||""),f])),i=[...new Set(a.map(f=>Number(f.year)))].filter(f=>Number.isFinite(f)).sort((f,$)=>$-f),o=s.summary||{},l=s.current||null,d=qp(s),p=Lp(e,s);return`<section class="report-card processing-card import-files-card processing-timeline-card" data-processing-timeline="${r(s.key||"")}">
        <div class="side-card-head index-runtime-head">
          <span class="side-card-title">${g(s.icon||"activity",14)}${r(s.title||`${s.label||""}\u8655\u7406\u6642\u9593\u8868`)}</span>
          ${Mp(s,a,o)}
        </div>
        ${d?`<div class="index-runtime-summary">${d}</div>`:""}
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
                    <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(f,$)=>`<th scope="col">${$+1}</th>`).join("")}</tr></thead>
                    <tbody>${i.map(f=>Ap(s,f,n,p)).join("")}</tbody>
                  </table>
                </div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u3002</div>'}
          <p class="judgment-months-hint">${s.key==="judgment"?"\u5224\u6C7A\u4EE5\u88C1\u5224\u66F8\u6708\u4EFD\u986F\u793A\u3002":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u4EE5\u4F86\u6E90\u7248\u672C\u6708\u4EFD\u986F\u793A\u3002"}\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA\u4E0B\u8F09\u3001Parquet\u3001PostgreSQL\u3001Qdrant \u56DB\u500B\u968E\u6BB5\uFF1B\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF0CQdrant \u4E4B\u524D\u5DF2\u8655\u7406\u4F46\u5C1A\u672A\u5B8C\u6210\u6642\u4EE5\u5B8C\u6210\u8272\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u6216\u8272\u584A\u53EF\u67E5\u770B\u5404\u968E\u6BB5\u72C0\u614B\u8207\u9032\u5EA6\u3002</p>
        </div>
      </section>`}).join("")}</div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u8655\u7406\u6642\u9593\u8868\u3002</div>'}function Tp(e){return e.judgment_stats&&typeof e.judgment_stats=="object"?e.judgment_stats:{judgment_total:(e.raw_backups?.totals||{}).row_count,financial_total:(e.database||{}).judgment_count}}function _l(e,t=new Set){return`${yp(e)}
    ${hp(e)}
    ${jp(e)}
    ${vp(e)}
    ${$p(e)}`}function Ep(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${Oe({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:r(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${r(ye(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${g("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}function Np(e,t){if(e.nodeType!==t.nodeType||e.nodeName!==t.nodeName){e.replaceWith(t.cloneNode(!0));return}if(e.nodeType===Node.TEXT_NODE){e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue);return}if(e.nodeType===Node.ELEMENT_NODE){for(let s of[...e.attributes])t.hasAttribute(s.name)||e.removeAttribute(s.name);for(let s of[...t.attributes])e.getAttribute(s.name)!==s.value&&e.setAttribute(s.name,s.value);t.hasAttribute("data-preserve-children")||Ml(e,t)}}function Ml(e,t){let s=[...e.childNodes],a=[...t.childNodes],n=Math.min(s.length,a.length);for(let i=0;i<n;i+=1)Np(s[i],a[i]);for(let i=n;i<s.length;i+=1)s[i].remove();for(let i=n;i<a.length;i+=1)e.appendChild(a[i].cloneNode(!0))}function us(e,t){let s=document.createElement("template");s.innerHTML=t,Ml(e,s.content)}var Ll={overview:"activity",law_download:"layers",order_download:"file",judgment_download:"download",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function Rp(e){let s=(Array.isArray(e.workflows)?e.workflows:[]).map(n=>{let i=n.active_run||null,o=i||n.last_run||null;return{...n,activeRun:i,lastRun:o,status:i?i.status||"running":n.update_available?"update":o?.status||"idle"}}),a=s.find(n=>n.id==="judgment_parquet");return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...s.filter(n=>n.id!=="judgment_parquet"),...a?[a]:[]]}function Mn(e,t){let s=Rp(e),a=new Set(["law_download","judgment_download","normalize_courts"]);return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${s.map(n=>{let i=n.id===t,o=Ll[n.id]||"terminal",l=a.has(n.id)?'<div class="status-tab-divider" role="separator" aria-hidden="true"></div>':"",d=Number(n.pending_count)||0,p=Number(n.update_count)||(n.update_available?d:0),f=n.update_available&&p>0&&!n.activeRun,$=[n.update_message||`${n.update_origin||"\u66F4\u65B0\u5075\u6E2C"}\u627E\u5230 ${c(p)} \u9805\u53EF\u66F4\u65B0\u5167\u5BB9`,n.update_origin?`\u4F86\u6E90\uFF1A${n.update_origin}`:"",n.update_mechanism?`\u6A5F\u5236\uFF1A${n.update_mechanism}`:""].filter(Boolean).join(" \xB7 ");return`${l}<button class="status-tab${i?" is-active":""}" type="button"
            data-processing-workflow="${r(n.id)}"
            ${i?'aria-current="page"':""}>
            <span class="status-tab-icon">${g(o,15)}</span>
            <span class="status-tab-copy">
              <strong>${r(n.label)}</strong>
              <small>${r(n.description||"")}</small>
            </span>
            ${f?`<span class="badge badge-warn badge-mono processing-update-count" title="${r($)}">${g("refresh",10)}${c(p)}</span>`:Dt(n.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${r(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function Cp(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${Dt(e.status)}
      <span class="mono">${r(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${r(ye(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${fe(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${r(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${r(t.log_path)}</strong>`:""}
    </div>
  </div>`}function Ma(e){return`${e.year}-${String(e.month_no).padStart(2,"0")}`}function jl(e){let t={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"},s=e.status||"red";return[Ma(e),t[s]||s,e.latest_fileset_id?`fileset ${e.latest_fileset_id}`:"",e.filename||"",e.local_filename&&e.local_filename!==e.filename?`\u672C\u6A5F\uFF1A${e.local_filename}`:""].filter(Boolean).join(" \xB7 ")}function Tl(e){if(!e.download_url)return"";let t=Ma(e);return`<a class="judgment-month-download" href="${r(Et(gt(e.download_url)))}" target="_blank" rel="noreferrer" title="\u4E0B\u8F09 ${t} \u5224\u6C7A" aria-label="\u4E0B\u8F09 ${t} \u5224\u6C7A">${g("download",11)}</a>`}function Pp(e){let t=e.status||"red";return`<td class="judgment-month is-${r(t)}" data-judgment-month-key="${r(Ma(e))}" title="${r(jl(e))}"><span>${e.month_no}</span>${Tl(e)}</td>`}function Ip(e){return e?.off_hours_enabled===!0}function El(e){return`\u7DA0\u8272\uFF1A\u6700\u65B0\u7248\u5DF2\u4E0B\u8F09\u5230 raw_rar\uFF1B\u7070\u8272\uFF1A\u672C\u6A5F\u4ECD\u662F\u820A\u7248\uFF0C\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u6703\u66F4\u65B0\uFF1B\u7D05\u8272\uFF1A\u8A72\u6708\u4EFD\u7F3A\u5C11\u5224\u6C7A\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u958B\u555F\u4E0B\u8F09\u9023\u7D50\uFF08${Ip(e)?"\u975E API \u6642\u6BB5\u4E5F\u53EF\u4E0B\u8F09\uFF0C\u5EFA\u8B70\u4E00\u6B21\u53EA\u4E0B\u8F09\u4E00\u500B\u6A94\u6848":"\u4E0B\u8F09\u9023\u7D50\u50C5\u5728 00:00\u201306:00 API \u6642\u6BB5\u53EF\u7528"}\uFF09\u3002\u5F85\u88DC\u9F4A\u6708\u4EFD\u6703\u512A\u5148\u4E0B\u8F09\uFF0C\u5168\u90E8\u88DC\u9F4A\u5F8C\u624D\u7531\u6700\u65B0\u6708\u4EFD\u5F80\u56DE\u9A57\u8B49\u65E2\u6709\u6A94\u6848\uFF1B\u4E2D\u65B7\u7684\u4E0B\u8F09\u6703\u4FDD\u7559 .part\uFF0C\u4F3A\u670D\u5668\u652F\u63F4 Range \u6642\u7E8C\u50B3\uFF0C\u5426\u5247\u5F9E\u96F6\u91CD\u65B0\u4E0B\u8F09\u3002\u9996\u6B21\u5B8C\u6574\u540C\u6B65\u53EF\u80FD\u9700\u4E0B\u8F09\u6578\u767E\u500B\u6708\u4EFD\uFF0C\u9810\u8A2D\u975E\u6642\u6BB5\u4E5F\u53EF\u7E8C\u50B3\uFF1B\u56B4\u683C\u6A21\u5F0F\u6703\u5728 00:00\u201306:00 \u4EE5\u5916\u505C\u6B62\u3002`}var Dp={completed:"\u5B8C\u6210",window_closed:"API \u6642\u6BB5\u7D50\u675F",deadline:"\u63A5\u8FD1 06:00\uFF0C\u4FDD\u7559\u5F85\u4E0B\u8F09\u6708\u4EFD",verification_window_closed:"API \u6642\u6BB5\u7D50\u675F\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",verification_deadline:"\u63A5\u8FD1 06:00\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",errors:"\u90E8\u5206\u6708\u4EFD\u4E0B\u8F09\u5931\u6557\uFF0C\u4E0B\u6B21\u91CD\u8A66",pending:"\u4ECD\u6709\u5F85\u4E0B\u8F09\u6708\u4EFD",check_only:"\u50C5\u6AA2\u67E5\uFF0C\u672A\u4E0B\u8F09",incremental:"\u589E\u91CF\u6AA2\u67E5\u5B8C\u6210",status_only:"\u50C5\u66F4\u65B0\u6708\u4EFD\u72C0\u614B",running:"\u57F7\u884C\u4E2D"};function si(e){let t=e?.backfill||{},s=t.verification||{},a=t.last_run||{},n=Number(t.pending_count)||0,i=Number(t.failure_count)||0,o=String(t.resume_from_month||""),l="\u9A57\u8B49\uFF1A\u672A\u958B\u59CB";s.status==="completed"?l="\u9A57\u8B49\u5B8C\u6210":s.next_month?l=`\u9A57\u8B49\u7E8C\u50B3 ${s.next_month}`:s.status==="in_progress"&&(l="\u9A57\u8B49\u9032\u884C\u4E2D");let d=String(a.stop_reason||""),p=d?`\u4E0A\u6B21\u505C\u6B62\uFF1A${Dp[d]||d}`:"";return{pending:n,failures:i,resume:o,verificationText:l,lastText:p}}function Bp(e){let t=si(e),s=t.pending>0?`\u5F85\u88DC\u9F4A ${c(t.pending)} \u500B\u6708${t.failures>0?`\uFF08${c(t.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708";return`<div class="judgment-backfill" data-judgment-backfill>
    <span class="badge ${t.pending>0?"badge-danger":"badge-ok"}" data-judgment-backfill-pending>${s}</span>
    <span class="badge badge-neutral" data-judgment-backfill-resume ${t.resume&&t.pending>0?"":"hidden"}>\u5F9E ${r(t.resume)} \u7E8C\u50B3</span>
    <span class="badge badge-info" data-judgment-backfill-verification>${r(t.verificationText)}</span>
    <span class="muted" data-judgment-backfill-last ${t.lastText?"":"hidden"}>${r(t.lastText)}</span>
  </div>`}function Fp(e,t){let s=si(t),a=e.querySelector("[data-judgment-backfill-pending]");a&&(a.textContent=s.pending>0?`\u5F85\u88DC\u9F4A ${c(s.pending)} \u500B\u6708${s.failures>0?`\uFF08${c(s.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708",a.classList.toggle("badge-danger",s.pending>0),a.classList.toggle("badge-ok",s.pending===0));let n=e.querySelector("[data-judgment-backfill-resume]");if(n){let l=!!s.resume&&s.pending>0;n.hidden=!l,n.textContent=l?`\u5F9E ${s.resume} \u7E8C\u50B3`:""}let i=e.querySelector("[data-judgment-backfill-verification]");i&&(i.textContent=s.verificationText);let o=e.querySelector("[data-judgment-backfill-last]");o&&(o.hidden=!s.lastText,o.textContent=s.lastText)}function ai(){return'<div class="judgment-months-loading"><span class="spinner"></span><span>\u8B80\u53D6\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B\u2026</span></div>'}function Op(e){if(e?.loading&&!e?.months?.length)return ai();if(e?.error&&!e?.months?.length)return Oe({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(e.error)});let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return'<div class="processing-empty">\u5C1A\u672A\u6709\u6708\u4EFD\u72C0\u614B\uFF1B\u8ACB\u5148\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u3002</div>';let s=new Map(t.map(o=>[Ma(o),o])),n=[...new Set(t.map(o=>o.year))].sort((o,l)=>l-o).map(o=>{let l=Array.from({length:12},(d,p)=>{let f=s.get(`${o}-${String(p+1).padStart(2,"0")}`);return f?Pp(f):`<td class="judgment-month is-empty"><span>${p+1}</span></td>`}).join("");return`<tr><th scope="row">${o}</th>${l}</tr>`}).join(""),i=e.summary||{};return`<div class="judgment-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" data-judgment-summary="green">\u6700\u65B0\u7248 ${c(i.green||0)}</span>
      <span class="badge badge-neutral" data-judgment-summary="gray">\u820A\u7248 ${c(i.gray||0)}</span>
      <span class="badge badge-danger" data-judgment-summary="red">\u7F3A\u5931 ${c(i.red||0)}</span>
      <span class="muted" data-judgment-total>\u5171 ${c(e.total_months||t.length)} \u500B\u6708</span>
    </div>
    ${Bp(e)}
    <div class="judgment-months-scroll">
      <table class="judgment-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(o,l)=>`<th scope="col">${l+1}</th>`).join("")}</tr></thead>
        <tbody>${n}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint" data-judgment-hint>${r(El(e))}</p>
  </div>`}function Hp(e,t){let s=Array.isArray(t?.months)?t.months:[],a=t.summary||{},n={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"};e.querySelectorAll("[data-judgment-summary]").forEach(l=>{let d=l.dataset.judgmentSummary||"";l.textContent=`${n[d]||d} ${c(a[d]||0)}`});let i=e.querySelector("[data-judgment-total]");i&&(i.textContent=`\u5171 ${c(t.total_months||s.length)} \u500B\u6708`),Fp(e,t);let o=e.querySelector("[data-judgment-hint]");if(o){let l=El(t);o.textContent!==l&&(o.textContent=l)}for(let l of s){let d=Ma(l),p=e.querySelector(`[data-judgment-month-key="${d}"]`);if(!p)continue;let f=l.status||"red";p.classList.contains(`is-${f}`)||(p.classList.remove("is-green","is-gray","is-red","is-empty"),p.classList.add(`is-${f}`));let $=jl(l);p.title!==$&&(p.title=$);let h=p.querySelector(".judgment-month-download");if(l.download_url){let u=gt(l.download_url);h?h.getAttribute("href")!==u&&(h.href=u):p.insertAdjacentHTML("beforeend",Tl(l))}else h&&h.remove()}}function zp(e){let t=Array.isArray(e)?e:[];return t.length?`<div class="processing-workflow-history">
    ${t.map(s=>`<div class="processing-workflow-history-row">
          <span class="processing-workflow-history-status">${Dt(s.status||"idle")}</span>
          <span class="mono">${r(ye(s.started_at))}</span>
          <span class="mono">${r(fe(s.duration_ms||0))}</span>
          <span class="processing-workflow-history-message">${r(s.message||"\u2014")}</span>
        </div>`).join("")}
  </div>`:'<div class="processing-workflow-empty">\u5C1A\u7121\u57F7\u884C\u7D00\u9304\u3002</div>'}function Up(e){let t=Array.isArray(e.update_history)?e.update_history:[];if(!t.length)return'<div class="processing-workflow-empty">\u5C1A\u7121\u7248\u672C\u6AA2\u67E5\u7D00\u9304\u3002</div>';let s={up_to_date:["\u5DF2\u662F\u6700\u65B0","badge-ok"],update_available:["\u6709\u66F4\u65B0","badge-warn"],error:["\u6AA2\u67E5\u5931\u6557","badge-danger"]};return`<div class="processing-workflow-history">
    ${t.map(a=>{let[n,i]=s[a.status]||[a.status||"\u672A\u77E5","badge-neutral"],o=a.remote_content_length!=null?Ne(a.remote_content_length):"\u2014",l=a.local_version_id?`v${a.local_version_id}`:"\u2014";return`<div class="processing-workflow-history-row">
          <span class="badge ${i}">${r(n)}</span>
          <span class="mono">${r(ye(a.checked_at))}</span>
          <span class="mono">\u9060\u7AEF ${r(o)}</span>
          <span class="mono">\u672C\u5730 ${r(l)}</span>
          <span class="processing-workflow-history-message">${r(a.message||"\u2014")}</span>
        </div>`}).join("")}
  </div>`}function Nl(e){let t=String(e.key||""),s=Ss(e.status);return[`data-stage-key="${r(t)}"`,`data-stage-label="${r(e.label||t)}"`,`data-stage-color="${r(xl(e))}"`,`data-stage-status-key="${r(e.status||"idle")}"`,`data-stage-status="${r(s.label)}"`,`data-stage-percent="${r(vt(e.percent))}"`,`data-stage-counts="${r(ei(e))}"`,`data-stage-duration="${r(Is(e.duration_ms||0))}"`,`data-stage-contribution="${r(vt(e.contribution_percent))}"`,`data-stage-message="${r(e.message||"")}"`].join(" ")}function Gp(e,t=Date.now()){let s=String(e.status||"idle"),a=Number(e.duration_ms)||0,n=Date.parse(e.started_at||"");if(s==="running"&&Number.isFinite(n))return Math.max(a,t-n);if(a>0)return a;let i=Date.parse(e.finished_at||"");return Number.isFinite(n)&&Number.isFinite(i)?Math.max(0,i-n):0}function Rl(e){if(e.key!=="filter")return null;let t=Number(e.financial_processed),s=Number(e.financial_matched);return e.financial_processed===null||e.financial_processed===void 0||!Number.isFinite(t)||!Number.isFinite(s)||t<=0?null:{processed:t,matched:s,percent:Math.round(s/t*100)}}function Qp(e){let t=String(e.status||"idle"),s=[],a=Number(e.total);if(e.key==="postgres"&&["success","no_change"].includes(t)&&Number.isFinite(a)&&a>0)s.push(`\u7E3D\u8A08 ${c(a)} \u7B46`);else{let i=ei(e);i!=="\u2014"&&s.push(i)}let n=Rl(e);return n&&s.push(`\u91D1\u878D\u4F54\u6BD4 ${n.percent}%`),s.join(" \xB7 ")}function Jp(e,t){let s=String(e.status||"idle"),a=[],n=(d,p,{always:f=!1}={})=>{let $=p==null?"":String(p).trim();!f&&!$||a.push(`<span class="rag-wf-detail"><span>${r(d)}</span><strong>${r($||"\u2014")}</strong></span>`)};n("\u72C0\u614B",Ss(s).label,{always:!0}),n("\u958B\u59CB",e.started_at?ye(e.started_at):"\u2014",{always:!0}),n("\u7D50\u675F",e.finished_at?ye(e.finished_at):"\u2014",{always:!0}),n("\u8017\u6642",t,{always:!0}),n("\u9032\u5EA6",vt(e.percent),{always:!0});let i=ei(e),o=["extract","raw_parquet"].includes(String(e.key||""));n(o?"\u7D2F\u8A08\u8CC7\u6599\u91CF":"\u8CC7\u6599\u91CF",i!=="\u2014"?i:"");let l=Rl(e);return l&&(n("\u91D1\u878D\u6848\u4EF6",`${c(l.matched)} \u7B46`),n("\u5168\u90E8\u6848\u4EF6",`${c(l.processed)} \u7B46`),n("\u91D1\u878D\u4F54\u6BD4",`${l.percent}%`)),n("\u6574\u9AD4\u5360\u6BD4",vt(e.contribution_percent)),s==="failed"||s==="stale"?(n("\u539F\u56E0",e.error||e.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002"),n("\u5EFA\u8B70",e.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002")):n("\u8AAA\u660E",e.message),a.join("")}function Vp(e){let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${g("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A host/model\u3001Blue-Green \u5EFA\u7F6E\u8207\u5404\u968E\u6BB5\u9032\u5EA6\u3002</div>
    </section>`;let a=new Map(s.map(ae=>[String(ae.key||""),ae])),n=a.get("ollama")||{},i=a.get("qdrant")||{},o=a.get("validate")||{},l=e.index_runtime||{},d=l.summary||{},p=l.copy||{},f=Number(l.index_prior_duration_ms||0),$=l.current||{},h=l.embedding||{},u=h.selected||{},b=h.active||{},_=Number(l.expected_count||d.total||i.total||0),k=Number(d.indexed??i.current??0),A=_>0?Math.min(100,k/_*100):i.status==="success"?100:0,S=Number(p.total||0),v=Number(p.copied||0),j=S>0?Math.min(100,v/S*100):p.status==="success"?100:0,W=String(l.build_mode||""),Y=String(t.run_status||""),we=!!Y&&!["running","success","no_change"].includes(Y),be=String(p.status||(W==="reuse"?"pending":"skipped"));we&&be==="pending"&&(be="stale");let ne=Number(p.duration_ms||0)/1e3,M=ne>0?v/ne:0,q=be==="running"&&M>0&&S>v?(S-v)/M:null,T=Il(e,l,k),X=Bl(l,k,_,T),me=X?.remainingMs&&X.remainingMs>0?X.remainingMs/1e3:null,V=be==="success"||be==="skipped"||k>0||i.status==="success",de=i.status==="success"?"success":V&&i.status||"pending",Ae=String(o.status||"pending"),I=Ae==="success"&&/alias 已切換/.test(String(o.message||"")),Se=I?"success":Ae==="failed"?"failed":Y==="running"?"pending":"skipped",oe=l.version_id?`v${String(l.version_id).padStart(3,"0")}`:"\u2014",ke=b.host||u.host||b.url||u.url||"\u2014",Re=b.port||u.port,Me=Re?`${ke}:${Re}`:String(ke),Pe=b.model||u.model||l.model||"\u2014",ge=V&&$.month?`${jn($.month)}${$.preparing?"\uFF08\u6E96\u5099\u4E2D\uFF09":""}`:t.run_status==="running"?"\u6E96\u5099\u4E2D":"\u2014",ee=String($.phase||"")==="embedding"?"E \u65B0 embedding":String($.phase||"")==="reuse"?"R \u91CD\u7528":"\u2014",ue=(()=>{let ae=Number(i.duration_ms)||0,tt=Date.parse(i.started_at||"");if(i.status==="running"&&Number.isFinite(tt))return Math.max(ae,Date.now()-tt);if(ae>0)return ae;let Ge=Date.parse(i.finished_at||"");return Number.isFinite(tt)&&Number.isFinite(Ge)?Math.max(0,Ge-tt):0})(),ve=[{key:"probe",label:"llama-server \u4E3B\u6A5F\uFF0F\u6A21\u578B\u6E2C\u8A66",caption:"\u4E3B\u6A5F\uFF0F\u6A21\u578B\u3001\u9023\u7DDA\u6E2C\u8A66",color:"#22c55e",status:n.status||"pending",percent:Number(n.percent)||0,current:Number(n.current)||0,total:Number(n.total)||0,unit:"\u53F0",duration_ms:n.duration_ms,started_at:n.started_at,finished_at:n.finished_at,extraDetails:[["\u4E3B\u6A5F",Me],["\u6A21\u578B",Pe],["\u6E2C\u8A66\u4E3B\u6A5F",`${c(n.current||0)} / ${c(n.total||0)} \u53F0`]],detail:`${c(n.current||0)} / ${c(n.total||0)} \u53F0 \xB7 ${Me} \xB7 ${Pe}`},{key:"version",label:"\u5EFA\u7ACB\uFF0F\u63A5\u7E8C Blue-Green \u7248\u672C",caption:"Blue-Green \u7248\u672C\u3001collection",color:"#06b6d4",status:l.version_id?"success":"pending",percent:l.version_id?100:0,current:l.version_id?1:0,total:1,unit:"\u968E\u6BB5",duration_ms:l.version_duration_ms,started_at:null,finished_at:null,extraDetails:[["\u7248\u672C",oe],["Collection",l.collection||"\u2014"],["\u6A21\u5F0F",W||"\u2014"]],detail:`${oe} \xB7 ${l.collection||"\u2014"} \xB7 ${W||"\u2014"}`},{key:"copy",label:"\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF",caption:"\u820A collection \u5411\u91CF\u8907\u88FD",color:"#f59e0b",status:be,percent:j,current:v,total:S,unit:"points",duration_ms:p.duration_ms,started_at:p.started_at,finished_at:p.finished_at,extraDetails:[["\u5DF2\u8907\u88FD",`${c(v)} points`],["\u7E3D points",c(S)],["\u7BC4\u570D","\u5168\u57DF points\uFF1B\u4E0D\u5217\u5165\u6708\u4EFD R\uFF0FE"],["\u8907\u88FD\u901F\u5EA6",M>0?`${M.toFixed(1)} points/\u79D2`:"\u2014"],p.resumed?["\u4F86\u6E90",`\u7E8C\u8DD1\u524D\u5B8C\u6210${p.resumed_from_run_id?`\uFF08${p.resumed_from_run_id}\uFF09`:""}`]:null,["\u9810\u4F30\u5269\u9918",q!==null?qa(q):"\u2014"]],detail:S>0?`${c(v)} / ${c(S)} points \xB7 \u820A collection \u5411\u91CF${p.resumed?" \xB7 \u7E8C\u8DD1\u524D\u5B8C\u6210":""}`:be==="skipped"?"\u672C\u6B21\u4E0D\u9700\u8907\u88FD\u820A\u5411\u91CF":be==="stale"?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5B8C\u6210\u8907\u88FD":"\u7B49\u5F85\u820A collection \u8907\u88FD"},{key:"index",label:"\u91D1\u878D\u5224\u6C7A\u5411\u91CF\u7D22\u5F15",caption:"R \u85CD\uFF0FE \u7D2B\uFF1B\u672C\u6B21 run \u9032\u5EA6",color:"#a78bfa",barColor:ee==="E \u65B0 embedding"?"#a78bfa":ee==="R \u91CD\u7528"?"#3b82f6":"",status:de,phaseKey:ee==="R \u91CD\u7528"?"reuse":ee==="E \u65B0 embedding"?"embedding":"",phaseLabel:de==="running"?ee:"",percent:A,current:k,total:_,unit:"\u7B46",duration_ms:V?i.duration_ms:0,extraDurationMs:f,started_at:V?i.started_at||l.started_at:null,finished_at:i.finished_at,extraDetails:[["\u5DF2\u7D22\u5F15",`${c(k)} / ${c(_)} \u7B46`],f>0?["\u524D\u6B21\u57F7\u884C",Is(f)]:null,f>0?["\u672C\u6B21\u57F7\u884C",Is(ue)]:null,["\u91CD\u7528",c(d.reused)],["\u65B0 embedding",c(d.embedded)],["\u76EE\u524D\u6708\u4EFD",ge],["\u76EE\u524D\u6279\u6B21",ee],["\u672C\u6279 R\uFF0FE",`R ${c($.reused||0)} \xB7 E ${c($.embedded||0)}`],["R \u5B9A\u7FA9","04 \u9010\u6708\u6383\u63CF\u6CBF\u7528\uFF1B03 \u8907\u88FD\u70BA\u5168\u57DF points"],["\u9810\u4F30\u5269\u9918",V&&me!==null?qa(me):"\u2014"]],htmlDetails:Zp(l),detail:V?`${c(k)} / ${c(_)} \u7B46 \xB7 \u91CD\u7528 ${c(d.reused)} \xB7 \u65B0 embedding ${c(d.embedded)}${ee==="\u2014"?"":` \xB7 ${ee}`}`:"\u7B49\u5F85\u7248\u672C\u6E96\u5099\uFF08\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF\uFF09\u5B8C\u6210"},{key:"validate",label:"\u9A57\u8B49\u65B0\u7248\u672C",caption:"\u7B46\u6578\u3001\u7DAD\u5EA6\u3001payload",color:"#eab308",status:Ae,percent:Ae==="success"?100:0,current:null,total:null,duration_ms:o.duration_ms,started_at:o.started_at,finished_at:o.finished_at,extraDetails:[["\u9A57\u8B49\u8A0A\u606F",o.message||"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210"]],detail:o.message||(we?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u9032\u884C\u9A57\u8B49\u3002":"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210\u5F8C\u9A57\u8B49\u7B46\u6578\u3001\u7DAD\u5EA6\u8207 payload\u3002")},{key:"activate",label:"\u5207\u63DB alias",caption:"judgments_current alias",color:"#3b82f6",status:Se,percent:I?100:0,current:null,total:null,duration_ms:0,started_at:null,finished_at:null,extraDetails:[["\u76EE\u6A19 alias","judgments_current"]],detail:I?o.message:we?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5207\u63DB alias\u3002":"\u9A57\u8B49\u901A\u904E\u5F8C\u5207\u63DB judgments_current\u3002"}],qe=ve.filter(ae=>ae.status!=="skipped"),Be=qe.length?qe.reduce((ae,tt)=>ae+tt.percent,0)/qe.length:0,P=ve.filter(ae=>ae.status==="success").length,B=vt(Be),G=Date.now(),R=ae=>{let tt=Number(ae.extraDurationMs)||0,Ge=Number(ae.duration_ms)||0,ot=Date.parse(ae.started_at||"");if(ae.status==="running"&&Number.isFinite(ot))return tt+Math.max(Ge,G-ot);if(Ge>0)return tt+Ge;let mt=Date.parse(ae.finished_at||"");return tt+(Number.isFinite(ot)&&Number.isFinite(mt)?Math.max(0,mt-ot):0)},H=ve.map(ae=>{let tt=R(ae);return{...ae,computedDuration:tt,drawable:!["skipped","pending"].includes(ae.status)}}),Q=Math.max(H.reduce((ae,tt)=>ae+(tt.drawable?tt.computedDuration:0),0),Number(t.duration_ms)||0,1),_e=1.25,Te=H.map(ae=>ae.drawable?Math.max(ae.computedDuration/Q*100,_e):0),Ye=Te.reduce((ae,tt)=>ae+tt,0),dt=Ye>100?100/Ye:1,st=0,et=H.map((ae,tt)=>{let Ge=Te[tt]*dt,ot=Ge>0?{start:st,width:Ge}:null;return ot&&(st+=Ge),{...ae,bar:ot}}).map((ae,tt)=>{let Ge=[`is-${ae.status}`,ae.status==="failed"||ae.status==="stale"?"is-error":"",["pending","skipped"].includes(ae.status)?"is-missing":"",ae.status==="running"?"is-running":""].filter(Boolean).join(" "),ot=["pending","skipped"].includes(ae.status)?"\u2014":Is(ae.computedDuration),mt=ae.status==="running"?` \xB7 ${vt(ae.percent)}`:"",le=ae.phaseLabel?`<span class="index-wf-phase is-${r(ae.phaseKey||"unknown")}">${r(ae.phaseLabel)}</span>`:"",xe="";if(ae.bar){let pt=Math.max(0,Math.min(100,ae.bar.start)),x=Math.max(0,Math.min(100-pt,ae.bar.width)),E=ae.status==="success"?100:Math.max(0,Math.min(100,Number(ae.percent)||0)),C=x*E/100,F=x-C,Z=r(ae.barColor||ae.color);C>0&&(xe+=`<span class="rag-wf-bar index-wf-bar is-sequential" style="left:${pt.toFixed(3)}%;width:${C.toFixed(4)}%;top:0;height:12px;--bar-color:${Z}" aria-hidden="true"></span>`),F>1e-4&&(xe+=`<span class="rag-wf-bar index-wf-bar is-hollow is-sequential" style="left:${(pt+C).toFixed(3)}%;width:${F.toFixed(4)}%;top:0;height:12px;--bar-color:${Z}" aria-hidden="true"></span>`)}let We=[],He=(pt,x)=>{x==null||x===""||We.push(`<span class="rag-wf-detail"><span>${r(pt)}</span><strong>${r(String(x))}</strong></span>`)};He("\u72C0\u614B",Ss(ae.status).label),He("\u958B\u59CB",ae.started_at?ye(ae.started_at):"\u2014"),He("\u7D50\u675F",ae.finished_at?ye(ae.finished_at):"\u2014"),He("\u8017\u6642",ot),He("\u9032\u5EA6",vt(ae.percent));for(let pt of ae.extraDetails||[]){if(!pt)continue;let[x,E]=pt;He(x,E)}He("\u8AAA\u660E",ae.detail);let xt={...ae,duration_ms:ae.computedDuration,contribution_percent:qe.length?(Number(ae.percent)||0)/qe.length:null,message:ae.detail};return`<details class="rag-wf-stage index-wf-stage ${Ge}" data-index-stage="${r(ae.key)}"${Yr.has(ae.key)?" open":""} style="--stage-color:${r(ae.color)}" ${Nl(xt)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="index-wf-step">${String(tt+1).padStart(2,"0")}</span> ${r(ae.label)}</strong><small>${r(ae.caption||"")}</small></span>
            </span>
            <span class="rag-wf-stage-meta">${r(ot)}${r(mt)}${le?` \xB7 ${le}`:""} \xB7 ${r(Ss(ae.status).label)} <span class="rag-wf-chevron">${g("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px">${xe}</span>
        </summary>
        <div class="rag-wf-details">${We.join("")}${ae.htmlDetails||""}</div>
      </details>`}).join("");return`<section class="report-card processing-card processing-workflow-progress-card index-wf-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${g("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
      <span class="badge ${t.run_status==="running"?"badge-info":"badge-neutral"}">${c(P)} / ${c(qe.length)} \u968E\u6BB5</span>
    </div>
    <div class="index-wf-summary">
      <span>\u6574\u9AD4 <strong class="mono">${B}</strong></span>
      <span>\u7248\u672C <strong class="mono">${r(oe)}</strong></span>
      <span>Collection <strong class="mono">${r(l.collection||"\u2014")}</strong></span>
      <span>\u6A21\u5F0F <strong>${r(W||"\u2014")}</strong></span>
      <span>Host <strong class="mono">${r(Me)}</strong></span>
      <span>Model <strong class="mono">${r(Pe)}</strong></span>
      <span>\u76EE\u524D <strong>${r(ge)}</strong></span>
    </div>
    <div class="index-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${Q>0?r(Is(Q)):"\u2014"}</span>
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
        <span class="mono">${B}</span>
      </div>
      <div class="index-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,Be)).toFixed(1)}%"></span>
      </div>
    </div>
  </section>`}function Wp(e){if(e.id==="index_versions")return Vp(e);let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${g("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u5404\u968E\u6BB5\u8207\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </section>`;let a=Date.now(),n=s.map(I=>{let Se=String(I.status||"idle");return{...I,status:Se,computedDuration:Gp(I,a),drawable:!["pending","skipped","idle"].includes(Se)}}),i=n.filter(I=>I.status!=="skipped"),o=n.filter(I=>I.drawable).reduce((I,Se)=>I+Se.computedDuration,0),l=Math.max(o,Number(t.duration_ms)||0,1),d=n.some(I=>I.computedDuration>0),p=1.25,f=n.map(I=>I.drawable?Math.max(I.computedDuration/l*100,p):0),$=f.reduce((I,Se)=>I+Se,0),h=$>100?100/$:1,u=0,b=n.map((I,Se)=>{let oe=f[Se]*h,ke=I.drawable?{start:u,width:oe}:null;return ke&&(u+=oe),{...I,bar:ke}}),_=n.filter(I=>["success","no_change"].includes(I.status)).length,k=n.find(I=>I.status==="running"),A=n.filter(I=>I.status==="running").length,S=n.filter(I=>["pending","idle"].includes(I.status)).length,v=n.filter(I=>I.status==="skipped").length,j=i.length||Number(t.total_stages)||0,W=t.overall_percent,Y=W==null||W===""?null:Number(W),we=Number.isFinite(Y)?vt(Y):"\u2014",be=d?Is(l):"\u2014",ne=String(t.run_status||""),M=ne?Ss(ne).label:"\u2014",q=k&&(k.label||k.key)||"\u2014",T=n.map(I=>Date.parse(I.started_at||"")).filter(I=>Number.isFinite(I)),X=n.map(I=>Date.parse(I.finished_at||"")).filter(I=>Number.isFinite(I)),me=T.length?new Date(Math.min(...T)).toISOString():null,V=k?null:X.length?new Date(Math.max(...X)).toISOString():null,de=b.map((I,Se)=>{let oe=I.status,ke=["failed","stale","interrupted"].includes(oe),Re=[`is-${oe}`,ke?"is-error":"",["pending","skipped","idle"].includes(oe)?"is-missing":"",oe==="running"?"is-running":""].filter(Boolean).join(" "),Me=I.drawable?Is(I.computedDuration):"\u2014",Pe=Ss(oe).label,ge=oe==="failed"?`\u539F\u56E0\uFF1A${String(I.error||I.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002").trim()}
\u5EFA\u8B70\uFF1A${String(I.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002").trim()}`:"",ee=ge?`<span class="badge badge-danger is-failure-tip" tabindex="0" aria-label="${r(ge)}" data-failure-tip="${r(ge)}"><span class="status-dot is-danger"></span>\u5931\u6557</span>`:r(Pe),ue=xl(I),ve=ke?"var(--danger)":ue,qe=oe==="running"?` \xB7 ${vt(I.percent)}`:"",Be="";if(I.bar){let Q=Math.max(0,Math.min(100,I.bar.start)),_e=Math.max(0,Math.min(100-Q,I.bar.width)),Te=["success","no_change"].includes(oe)?100:Math.max(0,Math.min(100,Number(I.percent)||0)),Ye=_e*Te/100,dt=_e-Ye;Ye>0&&(Be+=`<span class="rag-wf-bar workflow-wf-bar is-sequential" style="left:${Q.toFixed(3)}%;width:${Ye.toFixed(4)}%;top:0;height:12px;--bar-color:${r(ve)}" aria-hidden="true"></span>`),dt>1e-4&&(Be+=`<span class="rag-wf-bar workflow-wf-bar is-hollow is-sequential" style="left:${(Q+Ye).toFixed(3)}%;width:${dt.toFixed(4)}%;top:0;height:12px;--bar-color:${r(ve)}" aria-hidden="true"></span>`)}let P=I.label||I.key||"\u968E\u6BB5",B=Qp(I),G=`${P}\uFF1A${Pe}\uFF0C${oe==="running"?`\u9032\u5EA6 ${vt(I.percent)}\uFF0C`:""}\u8017\u6642 ${Me}`,R={...I,duration_ms:I.computedDuration,message:ge||I.message||B||""},H=`${e.id}:${I.key||Se}`;return`<details class="rag-wf-stage workflow-wf-stage ${Re}" data-workflow-wf-stage="${r(H)}"${Xr.has(H)?" open":""} style="--stage-color:${r(ue)}" ${Nl(R)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="workflow-wf-step">${String(Se+1).padStart(2,"0")}</span> ${r(P)}</strong>${B?`<small>${r(B)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(Me)}${r(qe)} \xB7 ${ee} <span class="rag-wf-chevron">${g("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(G)}">${Be}</span>
        </summary>
        <div class="rag-wf-details">${Jp(I,Me)}</div>
      </details>`}).join(""),Ae=bp[e.id]||"";return`<section class="report-card processing-card processing-workflow-progress-card workflow-wf-card" data-workflow-progress>
    <div class="side-card-head index-runtime-head workflow-wf-head">
      <span class="side-card-title">${g("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
      <div class="index-runtime-metrics workflow-wf-metrics">
        <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u5168\u90E8\u968E\u6BB5\u7684\u6578\u91CF\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${_} / ${j}</strong></span>
        <span class="index-runtime-metric" title="\u76EE\u524D\u57F7\u884C\u4E2D\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u57F7\u884C\u4E2D</span><strong>${A}</strong></span>
        <span class="index-runtime-metric" title="\u5C1A\u672A\u958B\u59CB\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7B49\u5F85</span><strong>${S}</strong></span>
        <span class="index-runtime-metric" title="\u672C\u6B21\u6D41\u7A0B\u4E0D\u9700\u8981\u57F7\u884C\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7565\u904E</span><strong>${v}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u968E\u6BB5\u8017\u6642\u5408\u8A08\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(be)}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u53C3\u8207\u968E\u6BB5\u5B8C\u6210\u6BD4\u4F8B\u7684\u5E73\u5747\u3002"><span>\u6574\u9AD4\u9032\u5EA6</span><strong>${we}</strong></span>
      </div>
    </div>
    <div class="workflow-wf-summary">
      <span>\u57F7\u884C <strong>${r(M)}</strong></span>
      <span>\u958B\u59CB <strong>${me?r(ye(me)):"\u2014"}</strong></span>
      <span>\u7D50\u675F <strong>${k?"\u9032\u884C\u4E2D":V?r(ye(V)):"\u2014"}</strong></span>
      <span>\u76EE\u524D <strong>${r(q)}</strong></span>
      <span>Run <strong class="mono">${r(t.run_id||"\u2014")}</strong></span>
    </div>
    <div class="workflow-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${r(be)}</span>
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
    ${Ae?`<p class="processing-workflow-scope-note">${g("info",12)}<span>${r(Ae)}</span></p>`:""}
  </section>`}function jn(e){let t=String(e||"");return t.length===6?`${t.slice(0,4)}-${t.slice(4)}`:t||"\u2014"}function Cl(e){return e?.scan_order==="issue_month"?"\u7D22\u5F15\u6383\u63CF\u9806\u5E8F\u4F9D\u6708\u4EFD\u7531\u820A\u5230\u65B0\uFF1B\u540C\u6708\u4EFD\u518D\u4F9D\u532F\u5165 ID\u3002":"\u6B64 run \u662F\u820A\u7248\u6383\u63CF\u9806\u5E8F\uFF08\u4F9D\u532F\u5165 ID\uFF0C\u975E\u6708\u4EFD\u9806\u5E8F\uFF09\uFF1B\u65B0 run \u624D\u6703\u7531\u6700\u820A\u6708\u4EFD\u958B\u59CB\u3002"}function Kp(e,t=!1){let s=Number(e?.reused),a=Number(e?.embedded);if(!Number.isFinite(s)||!Number.isFinite(a)||s<=0&&a<=0)return"";let n=[];if(s>0&&n.push(`<span class="index-current-phase is-reuse"
      title="R \xB7 \u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF0C\u672C\u6279 ${c(s)} \u7B46">
      <strong>R</strong><span>\u6CBF\u7528 ${c(s)} \u7B46</span>
    </span>`),a>0){let i=e.phase==="embedding"&&t?"\u8A08\u7B97\u4E2D":"\u65B0 embedding";n.push(`<span class="index-current-phase is-embed"
      title="E \xB7 \u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding\uFF0C\u672C\u6279 ${c(a)} \u7B46">
      <strong>E</strong><span>${i} ${c(a)} \u7B46</span>
    </span>`)}return`<span class="index-current-phases" aria-label="\u672C\u6279\u6B21 R\uFF0FE \u52D5\u4F5C">
    <span class="index-current-phase-label">\u672C\u6279</span>
    ${n.join("")}
  </span>`}function Yp(e){let t=Array.isArray(e.months)?e.months:[],s=new Map;for(let n of t){let i=String(n.month||"");if(!/^\d{6}$/.test(i))continue;let o=s.get(i);o||(o={total:0,processed:0},s.set(i,o)),o.total+=Number(n.total)||0,o.processed+=Number(n.processed)||0}let a=0;for(let n of s.values())n.total>0&&n.processed>=n.total&&(a+=1);return{completed:a,total:s.size}}function kl(e){let t=String(e||"").match(/(\d{8})Update/i);return t?Number(t[1]):0}function Qt(e){let t=Number(e);return Number.isFinite(t)&&t>0?t:0}function Sl(e,t){let s=Qt(t),a=Qt(e);if(s<=0)return{processed:0,total:0,percent:null,fill:0,complete:!1,empty:!0,stateClass:"is-empty"};let n=Math.min(100,Math.round(a/s*1e3)/10),i=a>=s;return{processed:a,total:s,percent:n,fill:i?100:n,complete:i,empty:!1,stateClass:i?"is-complete":"is-incomplete"}}function Pl(e){let t=Array.isArray(e.months)?e.months:[],s=e.current||{},a=!!s.preparing&&e.scan_order==="issue_month",n=new Map;for(let i of t){let o=String(i.month||"");if(!/^\d{6}$/.test(o))continue;let l=Number(o.slice(4,6));if(l<1||l>12)continue;let d=n.get(o);d||(d={key:o,year:o.slice(0,4),monthNo:l,rows:[],archives:[],current:!1,preparing:!1,currentArchive:"",jid:""},n.set(o,d));let p=String(i.archive||"");d.rows.push({archive:p,total:Qt(i.total),processed:Qt(i.processed)}),p&&d.archives.push(p),!a&&s.month===o&&(!s.archive||s.archive===p)&&(d.current=!0,d.preparing=!!s.preparing,d.currentArchive=String(s.archive||p||""),d.jid=String(s.jid||""))}return n}function Xp(e){let t=Pl(e),s=e.summary||{},a=e.copy||{},n=Qt(s.total),i=Qt(a.total),o=t.size,l=i>0?Math.min(i,n||i):0,d=i>0?Math.max(0,(n||i)-i):n,p=Qt(s.reused),f=Qt(s.embedded);return{totalMonths:o,reusePool:l,reused:p,reusePercent:l>0?Math.min(100,100*p/l):null,embedPool:d,embedded:f,embedPercent:d>0?Math.min(100,100*f/d):null}}function Zp(e){let t=Xp(e);if(!t.totalMonths)return"";let s=[],a=(n,i,o,l,d)=>{let p=l===null?0:Math.max(0,Math.min(100,l));s.push(`<div class="index-wf-are-row ${n}">
      <span class="index-wf-are-label"><i aria-hidden="true"></i>${r(i)}</span>
      <span class="index-wf-are-value">${r(o)}${d?`<small>${r(d)}</small>`:""}</span>
      <span class="index-wf-are-track" aria-hidden="true"><span style="width:${p.toFixed(1)}%"></span></span>
    </div>`)};return(t.reusePool>0||t.reused>0)&&a("is-reuse","R \u672C\u6B21\u6CBF\u7528",`${c(t.reused)} / ${c(t.reusePool)} \u7B46`,t.reusePercent,"04 \u9010\u6708\u6CBF\u7528"),t.embedPool>0?a("is-embed","E \u672C\u6B21\u65B0 embedding",`${c(t.embedded)} / ${c(t.embedPool)} \u7B46`,t.embedPercent,"E backlog"):a("is-embed is-complete","E \u672C\u6B21\u65B0 embedding","\u7121 E backlog",100,"\u4E0D\u9700\u65B0 embedding"),`<div class="index-wf-are-breakdown" aria-label="R\uFF0FE \u5206\u6D41">
    <div class="index-wf-are-head"><strong>R\uFF0FE \u5206\u6D41</strong><span>\u5169\u689D bar \u5404\u81EA\u4EE5\u81EA\u5DF1\u7684 total \u8A08\u7B97\uFF0C\u4E0D\u53EF\u76F8\u52A0\uFF1B\u7686\u70BA\u672C\u6B21 run\u3002</span></div>
    ${s.join("")}
  </div>`}function em(e){let t=e.current||{},s=!!e.coverage_only,a=e.active_archive_coverage||{},n=Pl(e);if(!n.size)return'<div class="processing-workflow-empty">\u5C1A\u7121\u53EF\u986F\u793A\u7684\u7D22\u5F15\u6708\u4EFD\uFF1B\u958B\u59CB\u7D22\u5F15\u5F8C\u6703\u4F9D\u6642\u9593\u5217\u51FA\u6708\u4EFD\u72C0\u614B\u3002</div>';let i={reuseComplete:0,reuseIncomplete:0,embedComplete:0,embedIncomplete:0};for(let u of n.values()){let b=[...u.rows].sort((V,de)=>kl(de.archive)-kl(V.archive)),_=b[0],k=b.length>1?b.slice(1):[_],S=(a[u.key]||{})[_.archive],v=Qt(S?.total),j=Qt(S?.processed),W=v>0&&j>=v,Y=k.reduce((V,de)=>V+de.total,0),we=k.reduce((V,de)=>V+de.processed,0),be=_.total,ne=_.processed,M=Sl(we,Y),q=!s&&W,me=Sl(q?j:ne,q?v:be);u.latest=_,u.baselineRows=k,u.reuseState=M,u.embedState=me,u.reuseComplete=M.complete,u.embedComplete=me.complete,u.embedNoBacklog=q,M.complete?i.reuseComplete+=1:i.reuseIncomplete+=1,me.complete?i.embedComplete+=1:i.embedIncomplete+=1}let l=[...new Set([...n.values()].map(u=>u.year))].sort((u,b)=>b.localeCompare(u)).map(u=>{let b=Array.from({length:12},(_,k)=>{let A=k+1,S=`${u}${String(A).padStart(2,"0")}`,v=n.get(S);if(!v)return`<td class="judgment-month is-empty"><span>${A}</span></td>`;let j=v.current&&e.run_status==="running",W=T=>T.percent===null?"\u2014":`${T.percent}%`,Y=T=>T.empty?"\u7121\u8CC7\u6599":T.complete?"\u5B8C\u6210":"\u672A\u5B8C\u6210",we=String(t.phase||"")==="embedding"?"E \u65B0 embedding":String(t.phase||"")==="reuse"?"R \u91CD\u7528":"R\uFF0FE",be=v.latest&&v.latest.total>0?`${(100*v.latest.processed/v.latest.total).toFixed(1)}%`:"\u2014",ne=v.current&&v.latest?`\u672C\u6B21 run ${we} ${c(v.latest.processed)} / ${c(v.latest.total)}\uFF08${be}\uFF09`:"",M=[`${v.year}-${String(v.monthNo).padStart(2,"0")}`,v.archives.join("\u3001")||"\u2014",`R \u672C\u6B21\u6CBF\u7528 ${c(v.reuseState.processed)} / ${c(v.reuseState.total)}\uFF08${W(v.reuseState)}\uFF09\xB7 ${Y(v.reuseState)}`,v.embedNoBacklog?`E \u7121 E backlog\uFF08latest archive \u5DF2\u7531 active \u7248\u672C\u8986\u84CB ${c(v.embedState.total)} \u7B46\uFF1B\u4E0D\u9700\u65B0 embedding\uFF09`:`E \u65B0 embedding ${c(v.embedState.processed)} / ${c(v.embedState.total)}\uFF08${W(v.embedState)}\uFF09\xB7 ${Y(v.embedState)}`,v.reuseComplete?"":"\u5F85\u5B8C\u6210\uFF1AR \u65E2\u6709\u5411\u91CF\u91CD\u7528",v.embedComplete?"":"\u5F85\u5B8C\u6210\uFF1AE \u65B0 embedding",ne,v.current?`${v.preparing?"\u6E96\u5099\u7D22\u5F15":j?"\u76EE\u524D\u7D22\u5F15":"\u6700\u5F8C\u7D22\u5F15"} \xB7 ${we}${v.jid?` \xB7 ${v.jid}`:""}`:""].filter(Boolean).join(" \xB7 "),q=[["is-reuse",v.reuseState],["is-embed",v.embedState]].map(([T,X])=>`<span class="index-month-block ${T} ${X.stateClass}" style="--fill:${X.fill.toFixed(1)}%"></span>`).join("");return`<td class="judgment-month index-month index-month-are processing-month is-neutral${j?" is-current":""}" title="${r(M)}"${j?' aria-current="true"':""}><span class="index-month-number">${A}</span><span class="index-month-blocks" aria-hidden="true">${q}</span></td>`}).join("");return`<tr><th scope="row">${r(u)}</th>${b}</tr>`}).join(""),d=e.copy||{},p=Qt(d.total),f=Qt(d.copied),$=d.status==="success"?"\u5B8C\u6210":d.status==="running"?"\u57F7\u884C\u4E2D":d.status==="stale"?"\u4E2D\u6B62":"\u7B49\u5F85";return`<div class="judgment-months index-months">
    ${!s&&p>0?`<div class="index-copy-global-chip" title="03 \u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF\u662F\u5168\u57DF points \u6E96\u5099\u968E\u6BB5\uFF0C\u4E0D\u5217\u5165\u6708\u4EFD R\uFF0FE\uFF1BR \u662F 04 \u9010\u6708\u6383\u63CF\u9032\u5EA6\u3002">
          <span class="badge badge-neutral">03 \u8907\u88FD\uFF08\u5168\u57DF\uFF09</span>
          <span class="mono">${c(f)} / ${c(p)} points</span>
          <span>\xB7 ${r($)} \xB7 \u4E0D\u5217\u5165\u6708\u4EFD R\uFF0FE</span>
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
    <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA R\uFF08\u672C\u6B21\u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF09\u3001E\uFF08\u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding\uFF09\uFF0C\u5169\u683C\u90FD\u662F\u672C\u6B21 run \u7684\u9032\u5EA6\uFF1B\u5B8C\u6210\u70BA\u5BE6\u5FC3\uFF1B\u672A\u5B8C\u6210\u6642\u5DF2\u5B8C\u6210\u6BD4\u4F8B\u70BA\u5BE6\u8272\u3001\u5269\u9918\u5340\u6BB5\u70BA\u540C\u8272 25% \u6DFA\u8272\uFF0C\u56E0\u6B64 0% \u6642\u6574\u683C\u90FD\u662F\u6DFA\u8272\uFF1B\u7121\u8CC7\u6599\u624D\u662F\u6DE1\u8272\u7A7A\u5FC3\u3002\u6700\u65B0 archive \u5DF2\u88AB active collection \u5B8C\u6574\u8986\u84CB\uFF08\u7121 E backlog\uFF09\u7684\u672A\u8B8A\u66F4\u6708\u4EFD\uFF0CE \u53EF\u4F7F\u7528 active \u8986\u84CB\u986F\u793A\u5B8C\u6210\uFF1BR \u4E00\u5F8B\u4F7F\u7528\u672C\u6B21 run \u7684 processed\uFF0Ftotal\uFF0C\u5C1A\u672A\u6383\u5230\u7684\u5F8C\u7E8C\u6708\u4EFD\u7DAD\u6301 25% \u6DFA\u8272\u3002\u4ECD\u6709 E backlog \u7684\u6708\u4EFD\uFF0CR\uFF0FE \u90FD\u4F7F\u7528\u672C\u6B21 run \u7684 processed\uFF0Ftotal\u3002E \u7121 backlog \u6642\u82E5\u986F\u793A\u5BE6\u5FC3\uFF0Ctooltip \u6703\u6A19\u793A\u4E0D\u9700\u65B0 embedding\u300203 \u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF\u662F\u5168\u57DF points \u6E96\u5099\u968E\u6BB5\uFF0C\u4E0D\u6703\u91CD\u8907\u756B\u6210\u6708\u4EFD\u5206\u683C\uFF1BR \u662F 04 \u9010\u6708\u6383\u63CF\u9032\u5EA6\u3002summary \u8207\u65B9\u584A\u4F7F\u7528\u540C\u4E00\u4EFD\u72C0\u614B\uFF0Csidebar \u66F4\u65B0 badge \u53E6\u4EE5 E backlog \u6708\u4EFD\u8A08\u3002\u540C\u4E00\u6708\u4EFD\u53EF\u80FD\u6709\u591A\u500B archive\uFF0CR \u4F7F\u7528\u8F03\u820A\u7684\u57FA\u7DDA archive\uFF0CE \u4F7F\u7528\u540D\u7A31\u4E2D\u66F4\u65B0\u65E5\u671F\u6700\u65B0\u7684 archive\uFF1B\u65B0\u820A archive \u4E0D\u6703\u76F8\u52A0\u3002E \u5B8C\u6210\uFF0F\u672A\u5B8C\u6210\u4EE5\u6708\u4EFD\u8A08\uFF0C\u4E0D\u662F RAR \u6A94\u6578\u3002${Cl(e)}\u7DA0\u6846\u53EA\u6A19\u793A\u76EE\u524D\u6279\u6B21\u6240\u5728\u6708\u4EFD\u3002\u76EE\u524D\u7D22\u5F15\u6708\u4EFD\u4EE5\u5BE6\u7DDA\u5916\u6846\u6A19\u793A\uFF0Cpadding \u4E0D\u4F7F\u7528\u72C0\u614B\u5E95\u8272\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B R\uFF0FE \u9032\u5EA6\u8207\u76EE\u524D\u6848\u865F\u3002</p>
  </div>`}function tm(e){let t=e.import_timeline||{},s=Array.isArray(t.months)?t.months:[];if(!s.length)return`<section class="report-card processing-card import-files-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u672A\u53D6\u5F97\u5224\u6C7A\u4E0B\u8F09 manifest \u6216\u672C\u6A5F\u58D3\u7E2E\u6A94\uFF1B\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u5F8C\u6703\u986F\u793A\u6708\u4EFD\u72C0\u614B\u3002</div>
    </section>`;let a=new Map(s.map(h=>[String(h.month),h])),n=[...new Set(s.map(h=>h.year))].sort((h,u)=>u-h),i=["extract","raw_parquet","filter","postgres"],o=t.stage_labels||{},l=n.map(h=>{let u=Array.from({length:12},(b,_)=>{let k=_+1,A=`${h}${String(k).padStart(2,"0")}`,S=a.get(A);return ti({month:S,year:h,monthNo:k,stageOrder:i,stageLabels:o,stageStatuses:S?.import_stages||{},stageProgress:S?.import_stage_progress||{},overall:S?.import_overall||"empty",active:!!S?.active,processing:String(S?.month||"")===String(t.processing_month||""),workflowForStage:()=>"judgment_import",variant:"import"})}).join("");return`<tr><th scope="row">${r(h)}</th>${u}</tr>`}).join(""),d=t.summary||{},p=t.stage_summary||{},f=s.find(h=>h.active),$=f?`<div class="index-current-row">${ql({activeMonth:t.active_month||String(f.month||""),activeArchive:t.active_archive||f.active_archive||"",activePhase:t.active_phase||"",processingMonth:t.processing_month||"",processingArchive:t.processing_archive||"",stageLabels:o})}</div>`:"";return`<section class="report-card processing-card import-files-card" data-import-timeline="judgment">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${g("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
      ${kp(t,s,p,d)}
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(h,u)=>`<th scope="col">${u+1}</th>`).join("")}</tr></thead>
          <tbody>${l}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\uFF1ARAR \u6AA2\u67E5\uFF0F\u89E3\u58D3\u7E2E\u3001\u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD\u3001\u91D1\u878D\u6CD5\u898F\u7BE9\u9078\u3001PostgreSQL metadata\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF1B\u6709\u5F85\u66F4\u65B0\u6A94\u6848\u6642\uFF0C\u5C1A\u672A\u91CD\u505A\u7684\u56DB\u500B\u968E\u6BB5\u65B9\u683C\u4EE5\u6DFA\u6A58\uFF0F\u6DFA\u7D05\uFF0F\u6DFA\u7D2B\uFF0F\u6DFA\u85CD\u8868\u793A\uFF0C\u5B8C\u6210\u5F8C\u8F49\u70BA\u5BE6\u5FC3\u6DF1\u8272\uFF1B\u5C1A\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF1B\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u5B8C\u6210\u8272\u5782\u76F4\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u672A\u5B8C\u6210\u5340\u6BB5\u7DAD\u6301 25% \u6DFA\u8272\uFF1B\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u539F\u59CB\u8CC7\u6599\u968E\u6BB5\u6703\u5148\u6AA2\u67E5\u65E2\u6709 Parquet\uFF0C\u53EF\u6CBF\u7528\u6642\u4E0D\u91CD\u65B0\u5099\u4EFD\uFF1B\u7F3A\u5C11\u6642\u6703\u986F\u793A\u300C\u5EFA\u7ACB YYYY-MM \u5099\u4EFD\u300D\uFF0C\u5B8C\u6210\u5F8C\u986F\u793A\u300C\u5DF2\u5EFA\u7ACB\u5099\u4EFD\u300D\u3002\u7BE9\u9078\u8207 PostgreSQL \u968E\u6BB5\u6703\u986F\u793A\u76EE\u524D\u8655\u7406\u7684\u6708\u4EFD\u8207 archive\u3002\u5BE6\u7DDA\u6846\u6A19\u793A\u76EE\u524D\u532F\u5165\u6708\u4EFD\uFF1B\u82E5\u5BE6\u969B\u8655\u7406\u7684\u662F\u8F03\u820A\u6708\u4EFD\uFF0C\u8A72\u6708\u53E6\u4EE5\u865B\u7DDA\u6846\u6A19\u793A\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u56DB\u500B\u968E\u6BB5\u7684\u72C0\u614B\u3001\u672C\u6A5F\u58D3\u7E2E\u6A94\u8207\u5DF2\u532F\u5165\u6A94\u540D\u3002</p>
    </div>
  </section>`}function Il(e,t,s){let n=[t.run_id||e.active_run?.id||e.last_run?.id||"",t.version_id??"",t.collection||"",t.started_at||""].join("|"),i=Date.now(),o=gl.get(n);if(!o){let h=Date.parse(t.started_at||""),u=Date.parse(t.finished_at||""),b=Date.parse(t.updated_at||"");t.run_status!=="running"&&Number.isFinite(h)&&(Number.isFinite(u)||Number.isFinite(b))?o={at:h,indexed:0}:o={at:i,indexed:Math.max(0,s)},gl.set(n,o)}let l=Date.parse(t.finished_at||""),d=Date.parse(t.updated_at||""),p=t.run_status==="running"?i:Number.isFinite(l)?l:Number.isFinite(d)?d:i,f=Math.max(0,(p-Number(o.at||0))/1e3),$=Math.max(0,Number(s)-Number(o.indexed||0));return f<=0||$<=0?0:$/f}function Is(e){let t=Number(e);return!Number.isFinite(t)||t<0?"\u2014":t>=36e5?Dl(t):fe(t)}function Dl(e){if(!Number.isFinite(e)||e<0)return"\u2014";let t=Math.max(0,Math.round(e/1e3)),s=Math.floor(t/3600),a=Math.floor(t%3600/60),n=t%60,i=String(n).padStart(2,"0");return s>0?`${s}h ${String(a).padStart(2,"0")}m ${i}s`:a>0?`${a}m ${i}s`:`${n}s`}function Bl(e,t,s,a){let n=Date.parse(e.started_at||"");if(!Number.isFinite(n))return{elapsedMs:null,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let i=e.run_status==="running",o=Date.parse(e.finished_at||""),l=Date.parse(e.updated_at||""),d=i?Date.now():Number.isFinite(o)?o:Number.isFinite(l)?l:Date.now(),p=Math.max(0,d-n),f=Number(s),$=Number(t);if(!Number.isFinite(f)||f<=0)return{elapsedMs:p,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let h=Math.max(0,f-Math.max(0,Number.isFinite($)?$:0));if(h<=0)return{elapsedMs:p,estimatedTotalMs:p,remainingMs:0,remainingCount:0};if(!i||a<=0)return{elapsedMs:p,estimatedTotalMs:null,remainingMs:null,remainingCount:h};let u=h/a*1e3;return{elapsedMs:p,estimatedTotalMs:p+u,remainingMs:u,remainingCount:h}}function sm(e){let t=e.index_runtime||{};if(!t.available)return"";let s=!!t.coverage_only,a=Cl(t),n=t.current||{},i=t.summary||{},o=Number(i.indexed??n.indexed??0),l=s?0:Il(e,t,o),d=Yp(t),p=s?null:Bl(t,o,i.total,l),f=p?.remainingCount>0?`\u8207\u5269\u9918 ${c(p.remainingCount)} \u7B46`:"",$=l>0?`\u4F9D\u672C\u6B21\u5E73\u5747 ${l.toFixed(1)} \u7B46/\u79D2${f}\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002\u5BE6\u969B\u901F\u5EA6\u6703\u96A8 embedding \u8207\u6279\u6B21\u5927\u5C0F\u8B8A\u52D5\u3002`:"\u5C1A\u7121\u8DB3\u5920\u7684\u672C\u9801\u89C0\u5BDF\u8CC7\u6599\u53EF\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002",h=v=>r(Dl(p?p[v]:null)),u=`<div class="index-runtime-metrics">
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
    <span class="index-runtime-metric" title="\u81EA\u672C\u6B21\u7D22\u5F15 run \u958B\u59CB\u6642\u9593 ${r(ye(t.started_at))} \u8D77\u7B97\uFF1B\u4E2D\u9014\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002">
      <span>Elapsed Time</span>
      <strong>${h("elapsedMs")}</strong>
    </span>
    <span class="index-runtime-metric" title="Elapsed Time \u52A0\u4E0A\u4F9D\u5269\u9918\u4EF6\u6578\u8207\u672C\u6B21\u5E73\u5747\u901F\u5EA6\u4F30\u7B97\u7684\u5269\u9918\u6642\u9593\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u5F9E 0 \u91CD\u65B0\u8A08\u6642\u3002">
      <span>Estimated Total</span>
      <strong>${h("estimatedTotalMs")}</strong>
    </span>
    <span class="index-runtime-metric" title="${r($)}">
      <span>Time Remaining</span>
      <strong>${h("remainingMs")}</strong>
    </span>
  </div>`,b=t.run_status==="running"?n.preparing?"\u6E96\u5099\u4E2D":"\u76EE\u524D\u8655\u7406":"\u6700\u5F8C\u8655\u7406",_=!!n.preparing&&t.scan_order==="issue_month",k=t.copy||{},A=Number(k.total)>0?`\u8907\u88FD ${c(k.copied)} / ${c(k.total)} points`:"\u5EFA\u7ACB\u65B0\u7248\u672C collection",S=_?`<div class="index-current-row">
        <span class="badge badge-info" title="${r(a)}">${g("activity",11)}\u6E96\u5099\u4E2D</span>
        <span class="index-current-copy">${r(A)}\uFF1B\u7248\u672C\u6E96\u5099\u5B8C\u6210\u5F8C\u6703\u5F9E\u6700\u820A\u6708\u4EFD\u958B\u59CB\u7D22\u5F15\uFF0C\u7B2C\u4E00\u6279\u958B\u59CB\u524D\u4E0D\u6A19\u793A\u76EE\u524D\u6708\u4EFD\u3002</span>
      </div>`:n.jid?`<div class="index-current-row">
        <span class="badge badge-info" title="${r(a)}">${g("activity",11)}${b}</span>
        <strong class="mono">${r(jn(n.month))}</strong>
        <span class="mono">${r(n.archive||"\u2014")}</span>
        ${n.preparing?"":Kp(n,t.run_status==="running")}
        <span class="mono">${r(n.jid||"\u2014")}</span>
        <span class="index-current-copy">${r([n.court,n.title].filter(Boolean).join(" \xB7 ")||"\u2014")}</span>
        <span class="faint">${n.preparing?"\u6E96\u5099\u4E2D":`\u6279\u6B21 ${c(n.batch_size)} \u7B46`}</span>
      </div>`:"";return`<section class="report-card processing-card index-files-card">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${g("table",14)}04 \u91D1\u878D\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6708\u4EFD R\uFF0FE</span>
      ${u}
    </div>
    ${t.error?`<div class="processing-update-notice index-runtime-error">${g("alert",13)}<span>${r(t.error)}</span></div>`:""}
    <div class="index-runtime-summary">
      <span>\u7248\u672C <strong class="mono">v${r(t.version_id??"\u2014")}</strong></span>
      <span>Collection <code>${r(t.collection||"\u2014")}</code></span>
      <span>\u6A21\u5F0F <strong>${r(t.build_mode||"\u2014")}</strong></span>
      <span>\u6383\u63CF\u9806\u5E8F <strong>${r(t.scan_order==="issue_month"?"\u6708\u4EFD\uFF08\u820A\u2192\u65B0\uFF09":"ID\uFF08\u820A run\uFF09")}</strong></span>
      ${s?"":`<span>\u91CD\u7528 <strong class="mono">${c(i.reused)}</strong></span>
            <span>\u65B0 embedding <strong class="mono">${c(i.embedded)}</strong></span>`}
    </div>
    ${S}
    ${em(t)}
    ${s?'<p class="judgment-months-hint index-coverage-note">\u76EE\u524D\u6C92\u6709\u672C\u6B21\u7D22\u5F15 run\uFF1BR\uFF0FE \u6642\u9593\u8868\u6703\u5728\u7248\u672C\u5EFA\u7F6E\u958B\u59CB\u5F8C\u986F\u793A\u672C\u6B21\u9032\u5EA6\u3002</p>':""}
  </section>`}function am(e={}){let{storage:t,loading:s,error:a}=e;if(a)return`<section class="report-card processing-card index-storage-card">
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
    </section>`;let n=t.qdrant_storage||{},o=(Array.isArray(t.databases)?t.databases:[]).find(f=>f.id==="qdrant")||{},l=n.volume_bytes??o.volume_bytes??null,d=n.points_count??o.points_count,p=n.segments_count??o.segments_count;return`<section class="report-card processing-card index-storage-card">
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
      <span>Volume \u5BB9\u91CF</span><strong class="mono">${Ne(l)}${n.volume_size?` \xB7 ${r(n.volume_size)}`:""}</strong>
      <span>Volume \u4F86\u6E90\u8DEF\u5F91</span><strong class="mono index-storage-path">${r(n.host_path||"\u2014")}</strong>
      <span>Collection</span><strong class="mono">${r(n.collection||o.collection||"\u2014")}</strong>
      <span>Alias</span><strong class="mono">${r(n.alias||"\u2014")}</strong>
      <span>Points\uFF0FSegments</span><strong class="mono">${c(d)} / ${c(p)}</strong>
    </div>
    <div class="index-runtime-foot">\u8CC7\u6599\u6642\u9593 ${r(ye(t.checked_at))}</div>
  </section>`}function ni({badge:e="",lead:t="",rows:s=[],note:a=""}){return`<section class="report-card processing-card parquet-help-card workflow-help-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("info",14)}\u529F\u80FD\u8AAA\u660E</span>
      ${e?`<span class="badge badge-neutral">${r(e)}</span>`:""}
    </div>
    <div class="parquet-help-body">
      <p class="parquet-help-lead">${t}</p>
      <div class="parquet-help-grid">${s.map(([n,i])=>`<span>${r(n)}</span><strong>${i}</strong>`).join("")}</div>
      ${a?`<p class="parquet-help-note">${a}</p>`:""}
    </div>
  </section>`}function nm(){return ni({badge:"\u552F\u8B80\u532F\u51FA",lead:"\u5C07 PostgreSQL \u76EE\u524D\u6709\u6548\u7684\u5224\u6C7A\uFF08<code>judgment_documents.is_current = true</code>\uFF09\u532F\u51FA\u6210\u7368\u7ACB\u7684 Parquet \u5FEB\u7167\uFF0C\u4F9B\u96E2\u7DDA\u5206\u6790\u3001\u8CC7\u6599\u4EA4\u63DB\u6216\u4FDD\u5B58\u3002",rows:[["\u4F86\u6E90","PostgreSQL <code>judgment_documents</code>\uFF0C\u53EA\u542B\u76EE\u524D\u6709\u6548\u4E14\u5DF2\u547D\u4E2D\u91D1\u878D\u6CD5\u898F\u6E05\u55AE\u7684\u5224\u6C7A\u3002"],["\u8F38\u51FA",'<span class="mono">JUDGMENT_DATA_DIR/parquet/judgments/YYYYMMDD/HHMMSS-xxxxxxxx/judgments.parquet</span>'],["\u9644\u5E36\u6A94",'<span class="mono">\u540C\u76EE\u9304 manifest.json\uFF08\u7B46\u6578\u3001\u6A94\u6848\u5927\u5C0F\u3001\u6B04\u4F4D\u3001\u7522\u751F\u6642\u9593\uFF09</span>'],["\u5167\u5BB9","\u6848\u865F\u3001\u6CD5\u9662\u3001\u6848\u7531\u3001\u5168\u6587\u3001\u547D\u4E2D\u6CD5\u898F\u3001\u5F15\u7528\u3001\u4F86\u6E90\u58D3\u7E2E\u6A94\u8207\u6642\u9593\u6B04\u4F4D\uFF1B<code>citations</code> \u4EE5 JSON \u5B57\u4E32\u4FDD\u5B58\u3002"],["\u8207\u539F\u59CB Parquet","\u8CC7\u6599\u9801\u8207 <code>source=parquet</code> \u4F7F\u7528 <code>parquet/raw_judgments/.../raw.parquet</code>\uFF1B\u672C\u6D41\u7A0B\u7684 <code>parquet/judgments/...</code> \u662F\u53E6\u4E00\u500B\u6B63\u898F\u5316\u5FEB\u7167\u3002"],["\u4E0D\u6703","\u4E0D\u5BEB\u56DE PostgreSQL\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u820A\u5FEB\u7167\uFF1B\u53EA\u532F\u51FA current \u8CC7\u6599\uFF0C\u4E0D\u542B\u6B77\u53F2\u7248\u672C\u3002"],["\u4E2D\u65B7","\u6BCF\u6B21\u57F7\u884C\u5EFA\u7ACB\u65B0\u7684\u5B8C\u6574\u5FEB\u7167\uFF1B\u4E2D\u65B7\u5F8C\u91CD\u65B0\u57F7\u884C\u4E0D\u6703\u7E8C\u5BEB\u540C\u4E00\u500B Parquet \u6A94\u3002"]],note:"\u9069\u5408 DuckDB\u3001pandas\u3001Spark \u7B49\u96E2\u7DDA\u5206\u6790\uFF0C\u6216\u9700\u8981\u56FA\u5B9A\u6642\u9593\u9EDE\u7684\u53EF\u91CD\u73FE\u8CC7\u6599\u5FEB\u7167\u3002\u65E5\u5E38 RAG \u67E5\u8A62\u8207\u8CC7\u6599\u9801\u700F\u89BD\u4E0D\u9700\u8981\u57F7\u884C\u6B64\u6D41\u7A0B\u3002"})}function rm(){return ni({badge:"PostgreSQL \u56DE\u586B",lead:"\u5C07\u5224\u6C7A\u7684 <code>court</code> \u8F49\u6210\u6A19\u6E96\u6CD5\u9662\u540D\u7A31\u4E26\u5BEB\u5165 <code>court_normalized</code>\uFF1B\u539F\u59CB <code>court</code> \u6703\u4FDD\u7559\u4F9B\u8FFD\u6EAF\u3002",rows:[["\u8655\u7406\u7BC4\u570D","\u9810\u8A2D\u53EA\u8655\u7406 <code>court_normalized</code> \u70BA\u7A7A\u7684\u8CC7\u6599\uFF1B\u5DF2\u6B63\u898F\u5316\u8CC7\u6599\u6703\u8DF3\u904E\uFF0C\u53EF\u7528 <code>--all</code> \u91CD\u65B0\u8A08\u7B97\u5168\u90E8\u3002"],["\u89E3\u6790\u9806\u5E8F","\u539F\u59CB\u6CD5\u9662\u503C\u958B\u982D\u7B26\u5408\u6A19\u6E96\u540D\u7A31 \u2192 \u5224\u6C7A\u5168\u6587\u524D 8,000 \u5B57\u6700\u65E9\u51FA\u73FE\u7684\u6CD5\u9662 \u2192 \u539F\u59CB\u6CD5\u9662\u503C\u4EFB\u610F\u4F4D\u7F6E\u7684\u6A19\u6E96\u540D\u7A31 \u2192 JID \u5B98\u65B9\u6CD5\u9662\u4EE3\u78BC\u3002"],["\u8F38\u51FA","\u5BEB\u5165 <code>judgment_documents.court_normalized</code>\uFF1B\u4E0D\u4FEE\u6539\u539F\u59CB <code>court</code>\u3001\u5168\u6587\u6216\u5176\u4ED6\u5224\u6C7A\u6B04\u4F4D\u3002"],["\u672A\u89E3\u6790","\u7121\u6CD5\u5224\u65B7\u6642\u4FDD\u7559\u7A7A\u503C\uFF0C\u4E0D\u731C\u6E2C\uFF1B\u6458\u8981\u6703\u5217\u51FA\u672A\u89E3\u6790\u7B46\u6578\u8207\u5E38\u898B\u6A23\u672C\u3002"],["\u5F71\u97FF","\u8CC7\u6599\u9801\u7684\u6CD5\u9662\u4E0B\u62C9\u3001\u7CBE\u78BA\u7BE9\u9078\u3001\u6392\u5E8F\u3001\u7D50\u679C\u6B04\u4F4D\u8207\u5224\u6C7A\u539F\u6587\u4F7F\u7528\u6B63\u898F\u5316\u540D\u7A31\uFF1BAPI \u4ECD\u56DE\u50B3 <code>court_raw</code>\u3002"],["\u4E0D\u6703","\u4E0D\u91CD\u65B0\u532F\u5165\u5224\u6C7A\u3001\u4E0D\u6539\u5168\u6587\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u8CC7\u6599\u3002"],["\u91CD\u8DD1","\u9810\u8A2D\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u898F\u5247\u66F4\u65B0\u5F8C\u53EF\u7528 <code>--all</code> \u91CD\u7B97\uFF0C\u6216\u5148\u7528 <code>--dry-run</code> \u7D71\u8A08\u3002"]],note:"\u9069\u5408\u5728\u5224\u6C7A\u532F\u5165\u5F8C\u3001\u6CD5\u9662\u540D\u7A31\u898F\u5247\u66F4\u65B0\u5F8C\uFF0C\u6216\u8CC7\u6599\u9801\u6CD5\u9662\u9078\u9805\u51FA\u73FE\u7F3A\u6F0F\u6642\u57F7\u884C\u3002\u7D50\u679C\u4E5F\u6703\u5BEB\u5165\u6548\u80FD\u7D00\u9304\u3002"})}function im(){return ni({badge:"\u689D\u6587\u6B77\u53F2\u5EFA\u6A94",lead:"\u70BA\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u5EFA\u7ACB <code>law_article_versions</code> \u6B77\u53F2\u689D\u6587\u5FEB\u7167\u8207 <code>law_article_change_events</code> \u8B8A\u66F4\u7D00\u9304\uFF0C\u8B93\u8CC7\u6599\u9801\u80FD\u5207\u63DB\u6B77\u53F2\u7248\u672C\u4E26\u67E5\u770B\u689D\u6587\u5DEE\u7570\u3002",rows:[["\u4F86\u6E90","PostgreSQL \u6CD5\u898F\u7248\u672C\uFF0C\u4EE5\u53CA <code>LAW_DATA_DIR/raw_parquet</code> \u5167\u5C0D\u61C9\u7684\u539F\u59CB\u6CD5\u898F Parquet \u5FEB\u7167\u3002"],["\u5339\u914D\u65B9\u5F0F","\u4EE5 raw Parquet manifest \u7684 <code>zip_sha256</code>\uFF0F<code>raw_json_sha256</code> \u5C0D\u61C9\u6CD5\u898F\u7248\u672C\uFF0C\u4E0D\u731C\u6E2C\u5167\u5BB9\u3002"],["\u7522\u751F\u5167\u5BB9","<code>article_key</code>\uFF08\u689D\u6587\u985E\u578B\uFF0B\u689D\u865F\uFF09\u3001<code>content_hash</code>\u3001\u689D\u6587\u5168\u6587\u8207\u751F\u6548\u65E5\uFF1B\u8207\u524D\u4E00\u7248\u672C\u6BD4\u8F03\u5F8C\u8A18\u9304 <code>added</code>\uFF0F<code>modified</code>\uFF0F<code>removed</code>\u3002"],["\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB","\u5206\u9801\u4E0A\u65B9\u7684\u552F\u8B80\u6AA2\u67E5\u6703\u8B80\u53D6 <code>law_article_versions</code> \u8207\u539F\u59CB Parquet\uFF0C\u5224\u65B7\u7248\u672C\u662F\u5426\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\uFF1B\u6AA2\u67E5\u672C\u8EAB\u4E0D\u6703\u4FEE\u6539\u8CC7\u6599\u5EAB\u3002"],["\u53EF\u5EFA\u7ACB","\u627E\u5230\u5C0D\u61C9\u539F\u59CB Parquet \u7684\u7248\u672C\uFF0C\u53EF\u76F4\u63A5\u57F7\u884C\u6B64\u6D41\u7A0B\u5EFA\u7ACB\u689D\u6587\u6B77\u53F2\u3002"],["\u7F3A\u539F\u59CB\u6A94","\u627E\u4E0D\u5230\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u6A19\u793A\u7121\u6CD5\u5EFA\u7ACB\uFF0C\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD\uFF1B\u6B64\u6D41\u7A0B\u6703\u8DF3\u904E\u4E26\u5217\u5728 <code>missing_versions</code>\u3002"],["\u6AA2\u67E5\u7D50\u679C","\u5E74\u4EFD\xD7\u6708\u4EFD\u8868\u986F\u793A\u5DF2\u5EFA\u7ACB\uFF0F\u672A\u5EFA\u7ACB\uFF0F\u90E8\u5206\u5EFA\u7ACB\uFF1B\u4E0B\u65B9\u5217\u51FA\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u7248\u672C\u65E5\u671F\u8207\u53EF\u5EFA\u7ACB\u72C0\u614B\u3002\u76EE\u524D\u72C0\u614B\u4EE5\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u5361\u7247\u5373\u6642\u986F\u793A\u3002"],["\u8DF3\u904E\u689D\u4EF6","\u5DF2\u6709\u689D\u6587\u5FEB\u7167\u7684\u7248\u672C\u6703\u8DF3\u904E\uFF1B\u627E\u4E0D\u5230\u53EF\u8B80\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u5217\u5165 <code>missing_versions</code>\uFF0C\u4E0D\u5EFA\u7ACB\u865B\u69CB\u689D\u6587\u3002"],["\u4E0D\u6703","\u4E0D\u4E0B\u8F09\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u4E0D\u89E3\u6790\u65B0 ZIP\u3001\u4E0D\u4FEE\u6539 <code>law_documents</code> \u6216\u76EE\u524D\u7248\u672C\u3001\u4E0D\u66F4\u65B0 Qdrant\uFF0FIndexedDB\u3002"],["\u8F38\u51FA\u6458\u8981","\u7248\u672C\u6578\u3001\u8DF3\u904E\u7248\u672C\u6578\u3001\u7F3A\u5C11\u5FEB\u7167\u7248\u672C\u3001\u5BEB\u5165\u689D\u6587\u6578\u8207\u689D\u6587\u8B8A\u66F4\u4E8B\u4EF6\u6578\u3002"],["\u91CD\u8DD1","\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u5DF2\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u4E0D\u6703\u91CD\u8907\u63D2\u5165\u3002"]],note:"\u9069\u5408\u5F9E\u820A\u7248 schema \u5347\u7D1A\u3001\u65E2\u6709\u6CD5\u898F\u7248\u672C\u7F3A\u5C11\u6B77\u53F2\u689D\u6587\uFF0C\u6216\u8CC7\u6599\u9801\u6B77\u53F2\u689D\u6587\u7248\u672C\u8207\u8B8A\u66F4\u7D00\u9304\u4E0D\u5B8C\u6574\u6642\u57F7\u884C\u3002\u57F7\u884C\u524D\u53EF\u5148\u7528\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u78BA\u8A8D\u54EA\u4E9B\u7248\u672C\u53EF\u5EFA\u7ACB\u3001\u54EA\u4E9B\u7F3A\u539F\u59CB\u6A94\u3002"})}function om(e={}){let t=e.courtCheck,s=!!e.courtCheckLoading,a=e.courtCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-court-check"${s?" disabled":""}>${g("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31"}</span></button>`;if(a)return`<section class="report-card processing-card court-check-card">
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
    </section>`;let d={green:"\u5DF2\u6AA2\u67E5",red:"\u9700\u6B63\u898F\u5316\uFF08\u5B8C\u5168\u672A\u6AA2\u67E5\uFF09",gray:"\u9700\u6B63\u898F\u5316"},p=new Map(i.map(h=>[String(h.month),h])),$=[...new Set(i.map(h=>h.year))].sort((h,u)=>u-h).map(h=>{let u=Array.from({length:12},(b,_)=>{let k=_+1,A=`${h}${String(k).padStart(2,"0")}`,S=p.get(A);if(!S)return`<td class="judgment-month is-empty"><span>${k}</span></td>`;let v=d[S.status]?S.status:"red",j=[`${h}-${String(k).padStart(2,"0")}`,d[v],`\u7E3D ${c(S.total)} \u7B46`,`\u5DF2\u6AA2\u67E5 ${c(S.checked)} \u7B46`,`\u672A\u6AA2\u67E5 ${c(S.unchecked)} \u7B46`,S.invalid?`\u7121\u6548\u503C ${c(S.invalid)} \u7B46`:"",`\u6709\u6548 ${vt(S.percent)}`].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month court-check-month is-${v==="gray"?"red":v}" title="${r(j)}"><span>${k}</span></td>`}).join("");return`<tr><th scope="row">${r(h)}</th>${u}</tr>`}).join("");return`<section class="report-card processing-card court-check-card">
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(h,u)=>`<th scope="col">${u+1}</th>`).join("")}</tr></thead>
          <tbody>${$}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u5168\u90E8\u5DF2\u6B63\u898F\u5316\uFF1B\u7D05\u8272\uFF1A\u9700\u6B63\u898F\u5316\uFF08\u542B\u5B8C\u5168\u672A\u6AA2\u67E5\u3001\u90E8\u5206\u672A\u6B63\u898F\u5316\u6216\u7121\u6548\u503C\uFF09\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002summary \u7684\u7D05\u8272\u6578\u5B57\u70BA\u9700\u6B63\u898F\u5316\u6708\u4EFD\u6578\uFF1B\u4E0B\u65B9\u660E\u7D30\u4ECD\u4FDD\u7559\u672A\u6AA2\u67E5\u8207\u7121\u6548\u503C\u7B46\u6578\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u8A73\u7D30\u7B46\u6578\u8207\u6709\u6548\u6BD4\u4F8B\u3002</p>
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(ye(t.checked_at))} \xB7 \u6A19\u6E96\u6CD5\u9662\u540D\u7A31 ${c(t.canonical_count)} \u500B</div>
    </div>
  </section>`}function lm(e={}){let t=e.lawVersionCheck,s=!!e.lawVersionCheckLoading,a=e.lawVersionCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-law-version-check"${s?" disabled":""}>${g("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB"}</span></button>`;if(a)return`<section class="report-card processing-card law-version-card">
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
    </section>`;let d={green:"\u5DF2\u5EFA\u7ACB",red:"\u672A\u5EFA\u7ACB",gray:"\u90E8\u5206\u5EFA\u7ACB"},p=new Map(i.map(ne=>[String(ne.month),ne])),$=[...new Set(i.map(ne=>ne.year))].sort((ne,M)=>M-ne).map(ne=>{let M=Array.from({length:12},(q,T)=>{let X=T+1,me=`${ne}${String(X).padStart(2,"0")}`,V=p.get(me);if(!V)return`<td class="judgment-month is-empty"><span>${X}</span></td>`;let de=d[V.status]?V.status:"red",Ae=[`${ne}-${String(X).padStart(2,"0")}`,d[de],`\u7248\u672C ${c(V.version_count)}\uFF08\u6CD5\u898F ${c(V.law_versions)}\uFF0F\u547D\u4EE4 ${c(V.order_versions)}\uFF09`,`\u5DF2\u5EFA\u7ACB ${c(V.backfilled_count)}`,`\u672A\u5EFA\u7ACB ${c(V.missing_count)}`,`\u9700\u5EFA\u7ACB ${c(V.needs_backfill_count)}\uFF08\u53EF\u5EFA\u7ACB ${c(V.backfillable_count)}\uFF0F\u7F3A\u539F\u59CB\u6A94 ${c(V.blocked_count)}\uFF09`,`\u689D\u6587\u5217 ${c(V.article_rows)} / \u9810\u671F ${c(V.article_count)}`,V.current?"\u76EE\u524D\u7248\u672C":"",V.versions?.length?`\u7248\u672C ${V.versions.map(I=>`#${I.version_id}`).join("\u3001")}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month law-version-month is-${de}${V.current?" is-current":""}" title="${r(Ae)}"><span>${X}</span></td>`}).join("");return`<tr><th scope="row">${r(ne)}</th>${M}</tr>`}).join(""),h={law:"\u6CD5\u898F",order:"\u547D\u4EE4"},u=i.flatMap(ne=>(ne.versions||[]).filter(M=>M.needs_backfill).map(M=>({...M,month:ne.month}))).sort((ne,M)=>M.version_id-ne.version_id),b=u.slice(0,20),_=b.map(ne=>{let M=ne.backfillable?"badge-info":ne.blocked?"badge-danger":"badge-neutral",q=ne.backfillable?"\u53EF\u5EFA\u7ACB":ne.blocked?"\u7F3A\u539F\u59CB\u6A94":"\u5F85\u6AA2\u67E5";return`<div class="law-backfill-needed-row">
        <strong class="mono">#${ne.version_id}</strong>
        <span class="badge ${M}">${q}</span>
        <span>${r(h[ne.source_type]||ne.source_type||"\u2014")}</span>
        <span class="mono">${r(ne.update_date||ne.month||"\u2014")}</span>
        <span class="law-backfill-needed-reason">${r(ne.reason||"\u2014")}</span>
      </div>`}).join(""),k=u.length?`<div class="law-backfill-needed">
        <div class="law-backfill-needed-head">\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C <span class="badge badge-warn">${c(u.length)}</span></div>
        <div class="law-backfill-needed-list">${_}</div>
        ${u.length>b.length?`<div class="law-backfill-needed-more">\u53E6\u6709 ${c(u.length-b.length)} \u500B\u7248\u672C\u672A\u5217\u51FA</div>`:""}
      </div>`:'<div class="law-backfill-needed is-clear">\u76EE\u524D\u6C92\u6709\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3002</div>',A=Number(l.needs_backfill_versions)||0,S=Number(l.backfillable_versions)||0,v=Number(l.blocked_versions)||0,j=Number(l.backfilled_versions)||0,W=Number(l.versions)||0,Y=A<=0?"ok":v>0?"danger":"warn",we=A<=0?"\u4E0D\u9700\u8981\u5EFA\u7ACB":"\u9700\u8981\u5EFA\u7ACB",be=A>0?`\u9700\u8981\u5EFA\u7ACB ${c(A)} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF1A\u53EF\u5EFA\u7ACB ${c(S)}\u3001\u7F3A\u539F\u59CB\u6A94 ${c(v)}\u3002\u5DF2\u6709\u6B77\u53F2\u689D\u6587 ${c(j)} \u500B\u7248\u672C${v>0?"\uFF1B\u7F3A\u539F\u59CB\u6A94\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD":""}\u3002`:`\u76EE\u524D ${c(W)} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`;return`<section class="report-card processing-card law-version-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
      ${n}
    </div>
    <div class="law-version-check-status is-${Y}" role="status" aria-live="polite">
      <span class="badge badge-${Y}">${we}</span>
      <span>${r(be)}</span>
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(ne,M)=>`<th scope="col">${M+1}</th>`).join("")}</tr></thead>
          <tbody>${$}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u8A72\u6708\u4EFD\u6240\u6709\u7248\u672C\u90FD\u6709\u6B77\u53F2\u689D\u6587\uFF1B\u7D05\u8272\uFF1A\u5B8C\u5168\u672A\u5EFA\u7ACB\uFF1B\u7070\u8272\uFF1A\u90E8\u5206\u7248\u672C\u5DF2\u5EFA\u7ACB\uFF1B\u5916\u6846\uFF1A\u76EE\u524D\u7248\u672C\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u7248\u672C\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u6578\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u6578\u8207\u689D\u6587\u5217\u3002</p>
      ${k}
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(ye(t.checked_at))}</div>
    </div>
  </section>`}function cm(){return`<div class="processing-ollama-loading">
    <span class="spinner" aria-hidden="true"></span>
    <span>\u6B63\u5728\u6AA2\u67E5 llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span>
  </div>`}function dm(e,t,s){let a=Array.isArray(e?.hosts)?e.hosts:[];if(s&&!a.length)return`${Oe({tone:"danger",title:"llama-server \u4E3B\u6A5F\u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
    <div class="processing-ollama-empty">
      <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh-ollama">
        ${g("refresh",13)}<span>\u91CD\u65B0\u6AA2\u67E5</span>
      </button>
    </div>`;if(!a.length)return t?cm():'<div class="processing-ollama-empty">\u5C1A\u672A\u8A2D\u5B9A llama-server \u4E3B\u6A5F\uFF1B\u8ACB\u5230\u300C\u7CFB\u7D71\u72C0\u614B \u2192 Model Provider\u300D\u65B0\u589E\u4E26\u9023\u63A5\u6A21\u578B\u3002</div>';let n=a.map((o,l)=>{let d=o.status==="operational",p=Array.isArray(o.models)?o.models:[],f=p.length?p.map(h=>`<span class="processing-ollama-model ${d?"is-online":"is-offline"}">${r(h.name||"")}</span>`).join(""):'<span class="processing-ollama-model is-offline">\u6C92\u6709\u53EF\u7528\u6A21\u578B</span>',$=[o.embedding_model?`<span class="processing-ollama-role ${d?"is-online":"is-offline"}">\u5D4C\u5165 \xB7 ${r(o.embedding_model)}</span>`:'<span class="processing-ollama-role is-offline">\u672A\u8A2D\u5B9A\u5D4C\u5165\u6A21\u578B</span>',o.chat_model?`<span class="processing-ollama-role is-offline">\u804A\u5929 \xB7 ${r(o.chat_model)}</span>`:""].filter(Boolean).join("");return`<article class="processing-ollama-host ${d?"is-online":"is-offline"}" data-ollama-host data-host-id="${Number(o.id)}">
        <span class="processing-ollama-handle" aria-hidden="true">${g("grid",14)}</span>
        <span class="processing-ollama-rank">${l+1}</span>
        <div class="processing-ollama-main">
          <div class="processing-ollama-title">
            <strong>${r(o.name||o.base_url||`\u4E3B\u6A5F #${o.id}`)}</strong>
            <span class="processing-ollama-status">${d?"\u53EF\u7528":"\u7121\u6CD5\u9023\u7DDA"}</span>
          </div>
          <span class="processing-ollama-url mono">${r(o.base_url||"\u2014")}</span>
          <div class="processing-ollama-models">${f}</div>
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
    <p class="processing-ollama-hint">\u62D6\u79FB\u6216\u4F7F\u7528\u7BAD\u982D\u8ABF\u6574 embedding \u512A\u5148\u9806\u5E8F\uFF1B\u76EE\u524D\u4E3B\u6A5F\u7121\u6CD5\u4F7F\u7528\u6642\uFF0C\u6703\u4F9D\u5E8F\u81EA\u52D5\u6539\u7528\u4E0B\u4E00\u53F0\uFF08\u5404\u53F0\u9700\u5177\u5099\u76F8\u540C\u7684 embedding \u6A21\u578B\uFF09\uFF0C\u76F4\u5230\u6709\u4E3B\u6A5F\u56DE\u50B3\u5411\u91CF\u3002</p>`}function um(e,t={}){let s=e.active_run||null,a=s||e.last_run||null,n=Gt===e.id,i=!!s||n,o=!!e.can_run&&!i,l=i?"\u6B64\u6D41\u7A0B\u6B63\u5728\u57F7\u884C\u4E2D\u3002":e.start_blocked_reason||"\u76EE\u524D\u6709\u5176\u4ED6\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",d=Array.isArray(e.command)?e.command.join(" "):"",p=Number(e.update_count)||e.update_available&&Number(e.pending_count)||0,f=e.update_origin||"\u66F4\u65B0\u5075\u6E2C",$=e.update_mechanism||"\u65E2\u6709\u66F4\u65B0\u6AA2\u67E5\u7D00\u9304",h=e.update_message||e.update_status&&e.update_status.message||"\u627E\u5230\u53EF\u66F4\u65B0\u5167\u5BB9\u3002",u=e.update_status&&e.update_status.checked_at?ye(e.update_status.checked_at):"",b=e.progress||{},_=Array.isArray(b.stages)?b.stages:[],k=String(b.active_stage||""),A=_.find(Y=>String(Y.key||"")===k),S=(e.index_runtime&&e.index_runtime.current?e.index_runtime.current.month:"")||"",v=S?jn(S):A&&(A.label||A.key)||"",j=n&&!s?"\u555F\u52D5\u4E2D":"\u57F7\u884C\u4E2D",W=`<section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${g(Ll[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
        <span class="badge badge-neutral badge-mono">${r(e.branch||"")}</span>
      </div>
      <div class="processing-workflow-command-grid">
        <span>\u7A0B\u5F0F</span><code>${r(e.program||"\u2014")}</code>
        <span>Shell\uFF0F\u5165\u53E3</span><code>${r(e.script||"\u2014")}</code>
        <span>\u5BE6\u969B\u547D\u4EE4</span><code class="processing-workflow-command">${r(d||"\u2014")}</code>
      </div>
      ${Kr.has(e.id)?'<div class="processing-embedding-strip-slot" data-processing-embedding-strip data-preserve-children></div>':""}
      <div class="processing-workflow-actions">
        <button class="btn btn-primary btn-sm" type="button"
          data-processing-action="run-workflow"
          data-workflow-id="${r(e.id)}"
          ${o?"":"disabled"}
          ${o?"":`title="${r(l)}"`}>
          ${i?'<span class="spinner" aria-hidden="true"></span>':g("play",14)}<span>${i?j:"\u57F7\u884C\u6B64\u6D41\u7A0B"}</span>
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
              <span class="badge badge-info">${g("activity",11)}${j}</span>
              ${s&&s.id?`<span class="mono">${r(s.id)}</span>`:""}
              ${s&&s.started_at?`<span>\u958B\u59CB ${r(ye(s.started_at))}</span>`:""}
              ${v?`<span>\u76EE\u524D\u8655\u7406 <strong class="mono">${r(v)}</strong></span>`:""}
            </div>`:""}
      <div class="side-card-foot">
        \u57F7\u884C\u7D50\u679C\u6703\u5BEB\u5165\u5171\u7528\u8655\u7406\u72C0\u614B\u6A94\uFF0C\u53EF\u5F9E\u8655\u7406\u7E3D\u89BD\u67E5\u770B\u3002
      </div>
    </section>`;return`<div class="processing-workflow-panel">
    ${Oe({tone:"info",title:e.label,text:e.description||""})}
    ${e.update_available?`<div class="processing-update-notice" role="status" data-processing-update-notice>
            <span class="processing-update-notice-icon">${g("refresh",14)}</span>
            <span class="processing-update-notice-copy">
              <strong>${r(f)}\u5075\u6E2C\u5230\u53EF\u66F4\u65B0\u5167\u5BB9</strong>
              <span class="processing-update-mechanism">\u5075\u6E2C\u6A5F\u5236\uFF1A${r($)}${u?` \xB7 \u6AA2\u67E5\u6642\u9593 ${r(u)}`:""}</span>
              <span class="processing-update-message" data-processing-update-message>${r(h)}</span>
            </span>
            ${p>0?`<span class="badge badge-warn badge-mono" data-processing-update-count>${g("refresh",10)}${c(p)}</span>`:'<span class="badge badge-warn">\u53EF\u66F4\u65B0</span>'}
            <button class="btn btn-primary btn-sm processing-update-action" type="button"
              data-processing-action="run-workflow"
              data-workflow-id="${r(e.id)}"
              ${o?"":"disabled"}
              title="${r(o?"\u7ACB\u5373\u57F7\u884C\uFF1B\u6703\u5148\u8A08\u7B97\u7E3D\u5927\u5C0F\u8207\u9810\u4F30\u6642\u9593":l)}">
              ${i?'<span class="spinner" aria-hidden="true"></span>':g("download",14)}<span>${i?j:"\u66F4\u65B0"}</span>
            </button>
          </div>`:""}
    ${["legal_index_versions","law_download","order_download"].includes(e.id)?xp(e.index_timelines,{titleSuffix:e.id==="legal_index_versions"?"\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868":"\u4E0B\u8F09\u6642\u9593\u8868"}):""}
    ${e.id==="normalize_courts"?W:""}
    ${e.id==="normalize_courts"?om(t):""}
    ${e.id==="backfill_law_articles"?lm(t):""}
    ${e.id!=="normalize_courts"?W:""}
    ${Wp(e)}
    ${e.id==="judgment_parquet"?nm():""}
    ${e.id==="normalize_courts"?rm():""}
    ${e.id==="backfill_law_articles"?im():""}
    ${e.id==="judgment_import"?tm(e):""}
    ${e.id==="index_versions"?sm(e):""}
    ${e.id==="index_versions"?am(t):""}
    ${e.id==="judgment_download"?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${g("calendar",14)}\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B</span>
              <button class="btn btn-ghost btn-sm" type="button" title="\u91CD\u65B0\u6383\u63CF raw_rar \u76EE\u9304\u8207\u6708\u4EFD\u72C0\u614B" data-processing-action="refresh-judgment-months">${g("refresh",13)}<span>\u91CD\u65B0\u6574\u7406</span></button>
            </div>
            <div data-judgment-months-slot data-preserve-children>${ai()}</div>
          </section>`:""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${Dt(a?.status||"idle")}
      </div>
      ${Cp(a)}
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("history",14)}\u57F7\u884C\u7D00\u9304</span>
        <span class="badge badge-neutral">\u6700\u8FD1 ${c((e.recent_runs||[]).length)} \u7B46</span>
      </div>
      ${zp(e.recent_runs)}
    </section>
    ${["law_download","order_download","judgment_download"].includes(e.id)?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${g("search",14)}\u7248\u672C\u6AA2\u67E5\u7D00\u9304</span>
              <span class="badge badge-neutral">\u6700\u8FD1 ${c((e.update_history||[]).length)} \u7B46</span>
            </div>
            ${Up(e)}
          </section>`:""}
  </div>`}function Ln(e,t,s={},a=new Set){if(t==="overview")return _l(e,a);let i=(Array.isArray(e.workflows)?e.workflows:[]).find(o=>o.id===t);return i?um(i,s):_l(e,a)}async function pm(e){let t=zt(),s=`judgment.processing.slim.${t?"visitor":"admin"}`,a=()=>{try{let m=JSON.parse(window.localStorage.getItem(s)||"null");return!m?.snapshot||!m.snapshot.slim||Date.now()-Number(m.saved_at||0)>600*1e3?null:m.snapshot}catch{return null}},n=m=>{if(m?.slim)try{window.localStorage.setItem(s,JSON.stringify({snapshot:m,saved_at:Date.now()}))}catch{}};e.innerHTML=`<section class="page processing-page">
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
  </section>`;let i=e.querySelector(".processing-page"),o=e.querySelector("#processing-root"),l=e.querySelector("#processing-workflows"),d=e.querySelector("#processing-stop"),p=!1,f=document.createElement("div");f.className="processing-stage-tooltip",f.hidden=!0,i.appendChild(f),Ut=new Map;let $=!1,h=!1,u=!1,b=null,_="",k="",A="overview",S=null,v=!1,j=null,W=null,Y=null,we=!1,be=null,ne=0,M=null,q=!1,T=null,X=0,me=null,V=!1,de=null,Ae=0,I=null,Se=!1,oe=null,ke=0,Re=!1,Me=null,Pe=!1,ge=!1,ee="",ue=new Set,ve=null,qe=null,Be=null,P=-1,B="",G=0,R=0,H=null,Q=[],_e=()=>({storage:Y,loading:we,error:be,courtCheck:M,courtCheckLoading:q,courtCheckError:T,lawVersionCheck:me,lawVersionCheckLoading:V,lawVersionCheckError:de}),Te=()=>{if(A!=="judgment_download")return;let m=o.querySelector(".processing-workflow-panel");if(!m)return;m.querySelectorAll(".judgment-month.is-active").forEach(Ue=>{Ue.classList.remove("is-active"),Ue.removeAttribute("aria-current")});let y=m.querySelector("[data-judgment-progress]");if(!y)return;let L=S?.progress,K=!!(b?.workflows||[]).find(Ue=>Ue.id==="judgment_download")?.active_run;if((!L||L.active===!1)&&!K){y.hidden=!0,y.classList.remove("is-indeterminate");let Ue=y.querySelector("[data-judgment-run]");Ue&&(Ue.hidden=!0);return}if(y.hidden=!1,!L||L.active===!1){let Ue=y.querySelector("[data-judgment-progress-phase]");Ue&&(Ue.textContent="\u6E96\u5099\u4E2D");let qt=y.querySelector("[data-judgment-progress-month]");qt&&(qt.textContent="\u2014");let at=y.querySelector("[data-judgment-progress-filename]");at&&(at.textContent="\u7B49\u5F85\u4E0B\u8F09\u7A0B\u5E8F\u56DE\u5831\u9032\u5EA6\u2026",at.title=""),y.classList.add("is-indeterminate");let Zt=y.querySelector("[data-judgment-progress-bar]");Zt&&(Zt.style.width="");let Tt=y.querySelector("[data-judgment-progress-percent]");Tt&&(Tt.textContent="\u2014");let Mt=y.querySelector("[data-judgment-progress-size]");Mt&&(Mt.textContent="\u2014");let hs=y.querySelector("[data-judgment-progress-note]");hs&&(hs.textContent="\u5DF2\u555F\u52D5\uFF0C\u7B49\u5F85\u9032\u5EA6\u56DE\u5831");let es=y.querySelector("[data-judgment-run]");es&&(es.hidden=!0);let Vt=y.querySelector("[data-judgment-downloads]");Vt&&(Vt.hidden=!0);let ts=y.querySelector("[data-judgment-current]");ts&&(ts.hidden=!1);return}let U={preparing:"\u6E96\u5099\u4E2D",planning:"\u8A08\u7B97\u5927\u5C0F",scanning:"\u6383\u63CF\u4E2D",checking:"\u6AA2\u67E5\u4E2D",downloading:"\u4E0B\u8F09\u4E2D",saving:"\u5132\u5B58\u4E2D",finalizing:"\u6574\u7406\u4E2D"},he=U[L.phase]||"\u8655\u7406\u4E2D",te=Array.isArray(L.downloads)?L.downloads:[],re=te.length>0,$e=y.querySelector("[data-judgment-current]");$e&&($e.hidden=re);let Le=y.querySelector("[data-judgment-downloads]");if(Le){Le.hidden=!re;let Ue=y.querySelector("[data-judgment-downloads-count]");Ue&&(Ue.textContent=`${c(te.length)} \u500B\u9032\u884C\u4E2D`);let qt=y.querySelector("[data-judgment-downloads-list]");qt&&re&&(qt.innerHTML=te.map(at=>{let Zt=U[at.phase]||he||"\u8655\u7406\u4E2D",Tt=Number(at.bytes_written),Mt=Number(at.total_bytes),hs=Number.isFinite(Mt)&&Mt>0,es=at.percent,Vt=es==null||es===""?hs&&Number.isFinite(Tt)?Tt/Mt*100:null:Number(es),ts=Vt===null||!Number.isFinite(Vt),Pa=ts?"\u2014":`${Math.min(100,Math.max(0,Vt)).toFixed(Vt>=10?0:1)}%`,Ia=hs?`${Ne(Tt)} / ${Ne(Mt)}`:Number.isFinite(Tt)&&Tt>0?Ne(Tt):"\u2014";return`<div class="processing-download-active-item">
              <div class="processing-download-active-line">
                <strong class="mono">${r(at.month||"\u2014")}</strong>
                <span class="processing-download-active-file mono" title="${r(at.filename||"")}">${r(at.filename||"\u2014")}</span>
                <span class="processing-download-active-percent mono">${r(Pa)}</span>
              </div>
              <div class="processing-download-active-track${ts?" is-indeterminate":""}"><span style="width:${ts?"":`${Math.min(100,Math.max(0,Vt)).toFixed(1)}%`}"></span></div>
              <div class="processing-download-active-meta">
                <span>${r(Zt)}</span>
                <span>${r(Ia)}</span>
              </div>
            </div>`}).join(""))}let De=y.querySelector("[data-judgment-progress-phase]");De&&(De.textContent=he);let je=L.month||"",ze=y.querySelector("[data-judgment-progress-month]");ze&&(ze.textContent=je||"\u2014");let rt=L.filename||"",Rt=y.querySelector("[data-judgment-progress-filename]");Rt&&(Rt.textContent=rt||"\u2014",Rt.title=rt);let ct=new Map;for(let Ue of te)Ue.month&&ct.set(String(Ue.month),{percent:Ue.percent,phase:Ue.phase});je&&!ct.has(je)&&ct.set(je,{percent:L.percent,phase:L.phase}),m.querySelectorAll(".judgment-month.is-active").forEach(Ue=>{Ue.classList.remove("is-active","is-downloading"),Ue.removeAttribute("aria-current"),Ue.style.removeProperty("--month-progress")});for(let[Ue,qt]of ct){let at=m.querySelector(`[data-judgment-month-key="${Ue}"]`);if(!at)continue;at.classList.add("is-active"),(qt?.phase==="downloading"||qt?.phase==="saving")&&at.classList.add("is-downloading"),at.setAttribute("aria-current","true");let Zt=Number(qt?.percent);Number.isFinite(Zt)&&at.style.setProperty("--month-progress",`${Math.min(100,Math.max(0,Zt)).toFixed(1)}%`)}let $t=Number(L.bytes_written),bs=Number(L.total_bytes),da=Number.isFinite(bs)&&bs>0,ua=null,pa=L.percent;pa!=null&&pa!==""&&Number.isFinite(Number(pa))?ua=Number(pa):da&&Number.isFinite($t)&&(ua=$t/bs*100);let Fn=ua===null;y.classList.toggle("is-indeterminate",Fn);let gi=y.querySelector("[data-judgment-progress-bar]");gi&&(gi.style.width=Fn?"":`${Math.min(100,Math.max(0,ua)).toFixed(1)}%`);let fi=y.querySelector("[data-judgment-progress-percent]");if(fi){let Ue=Fn?null:Math.min(100,Math.max(0,ua));fi.textContent=Ue===null?"\u2014":`${Ue.toFixed(Ue>=10?0:1)}%`}let bi=y.querySelector("[data-judgment-progress-size]");if(bi){let Ue=Number.isFinite($t)&&$t>0?Ne($t):"\u2014";bi.textContent=da?`${Ue} / ${Ne(bs)}`:Ue}let hi=y.querySelector("[data-judgment-progress-note]");if(hi){let Ue=[],qt=Number(L.candidate_index),at=Number(L.candidate_total);Number.isFinite(qt)&&qt>0&&Number.isFinite(at)&&at>0&&Ue.push(`\u7B2C ${c(qt)} / ${c(at)} \u500B\u6708`),L.fileset_id&&Ue.push(`fileset ${L.fileset_id}`),L.message&&L.phase!=="downloading"&&Ue.push(String(L.message)),hi.textContent=Ue.join(" \xB7 ")}let vi=y.querySelector("[data-judgment-run]"),$i=L.run_files_total!==null&&L.run_files_total!==void 0;if(vi&&(vi.hidden=!$i,$i)){let Ue=Number(L.run_files_total)||0,qt=Number(L.run_files_done)||0,at=L.run_bytes_total===null||L.run_bytes_total===void 0?null:Number(L.run_bytes_total),Zt=Number(L.run_bytes_done)||0,Tt=L.run_percent,Mt=Tt==null||Tt===""?null:Number(Tt),hs=y.querySelector("[data-judgment-run-bar]");hs&&(hs.style.width=Mt===null||!Number.isFinite(Mt)?"":`${Math.min(100,Math.max(0,Mt)).toFixed(1)}%`);let es=y.querySelector("[data-judgment-run-percent]");es&&(es.textContent=Mt===null||!Number.isFinite(Mt)?"\u2014":`${Mt.toFixed(Mt>=10?0:1)}%`);let Vt=y.querySelector("[data-judgment-run-files]");Vt&&(Vt.textContent=`${c(qt)} / ${c(Ue)} \u500B\u6708`);let ts=y.querySelector("[data-judgment-run-size]"),Pa=L.phase==="planning";ts&&(at!==null&&at>0?ts.textContent=`\u5DF2\u4E0B\u8F09 ${Ne(Zt)} / ${Ne(at)}`:ts.textContent=`\u5DF2\u4E0B\u8F09 ${Ne(Zt)} \xB7 ${Pa?"\u7E3D\u91CF\u8A08\u7B97\u4E2D":"\u7E3D\u91CF\u672A\u77E5"}`);let Ia=y.querySelector("[data-judgment-run-elapsed]");Ia&&(Ia.textContent=`\u5DF2\u82B1 ${qa(L.elapsed_seconds)}`);let On=y.querySelector("[data-judgment-run-eta]");if(On){let Hn=Number(L.eta_seconds),uc=Number(L.estimated_total_seconds);Number.isFinite(Hn)&&Hn>=0?On.textContent=`\u5269\u9918 ${qa(Hn)} \xB7 \u9810\u4F30\u7E3D\u8A08 ${qa(uc)}`:On.textContent=Pa&&(L.run_bytes_total===null||L.run_bytes_total===void 0)?"\u5269\u9918\u6642\u9593\uFF1A\u8A08\u7B97\u4E2D":"\u5269\u9918\u6642\u9593\uFF1A\u2014"}}},Ye=()=>{if(A!=="judgment_download")return;let m=o.querySelector("[data-judgment-months-slot]");if(m){let y=Array.isArray(S?.months)?S.months:[];j&&!S?(m.innerHTML=Oe({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(j)}),delete m.dataset.judgmentMonthCount):S?m.dataset.judgmentMonthCount!==String(y.length)?(m.innerHTML=Op(S),m.dataset.judgmentMonthCount=String(y.length)):Hp(m,S):(m.querySelector(".judgment-months-loading")||(m.innerHTML=ai()),delete m.dataset.judgmentMonthCount)}if(S){let y=si(S),L=W!==y.pending;W=y.pending;let z=(b?.workflows||[]).find(U=>U.id==="judgment_download");z&&(z.update_count=y.pending,z.update_available=y.pending>0);let K=o.querySelector("[data-processing-update-notice]");if(K)if(y.pending<=0)K.remove();else{let U=K.querySelector("[data-processing-update-count]");U&&(U.innerHTML=`${g("refresh",10)}${c(y.pending)}`);let he=K.querySelector("[data-processing-update-message]");he&&(he.textContent=`\u5224\u6C7A\u5F85\u88DC\u9F4A ${c(y.pending)} \u500B\u6708`)}L&&l&&b&&us(l,Mn(b,A))}Te()},dt=()=>{let m=Array.isArray(I?.hosts)?I.hosts:[];return JSON.stringify({loading:!m.length&&Se,error:!m.length&&oe?oe.message||String(oe):"",active:I?.active_host_id??null,hosts:m.map(y=>({id:y.id,name:y.name,url:y.base_url,status:y.status,detail:y.detail,embedding:y.embedding_model,chat:y.chat_model,models:(y.models||[]).map(L=>L.name)}))})},st=()=>{let m=o.querySelector("[data-processing-ollama]");if(!m||ke)return;let y=dt();m.dataset.ollamaSignature!==y&&(m.dataset.ollamaSignature=y,m.innerHTML=dm(I,Se,I?null:oe))},Ze=()=>{let y=((b?.sections||[]).find(L=>L.key==="legal")?.stages||[]).find(L=>L.key==="legal_qdrant");return Wr(y?.model?.label||"")},et=()=>{let m=o.querySelector("[data-processing-embedding-strip]");if(!m)return;let y=Array.isArray(I?.hosts)?I.hosts:[],L=[];for(let re of y)if(re.status==="operational")for(let $e of re.models||[])Array.isArray($e.capabilities)&&$e.capabilities.includes("embedding")&&L.push({hostId:Number(re.id),model:$e.name,label:Wr(`${re.name||re.base_url||`\u4E3B\u6A5F ${re.id}`}:${$e.name}`),baseUrl:re.base_url||""});let z=Ze(),K=y.find(re=>Number(re.id)===Number(I?.active_host_id)),U=L.map(re=>{let $e=re.label===z;return`<button class="rag-model-button${$e?" is-active":""}" type="button"
        data-processing-action="select-embedding-model"
        data-host-id="${re.hostId}"
        data-model="${r(re.model)}"
        title="${r(re.label)}"
        aria-pressed="${$e?"true":"false"}"
        ${ge?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(re.label)}</span>
        ${$e?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`});z&&!L.some(re=>re.label===z)&&U.unshift(`<button class="rag-model-button is-active is-static" type="button" aria-pressed="true" disabled>
          <span class="rag-model-state" aria-hidden="true"></span>
          <span>${r(z)}</span>
          <span class="rag-model-current">\u4F7F\u7528\u4E2D</span>
        </button>`);let he=L.length?`<div class="rag-model-buttons">${U.join("")}</div>`:`<p class="rag-model-empty">${Se?"\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\u8207 Embedding model\u2026":oe?`\u7121\u6CD5\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\uFF1A${r(oe.message||String(oe))}`:"\u76EE\u524D\u6C92\u6709\u53EF\u7528\u7684 Embedding model\u3002"}</p>`,te=`<div class="processing-embedding-strip rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${g("brain",13)} Embedding \u4E3B\u6A5F\uFF0F\u6A21\u578B</span>
        ${K?.base_url?`<span class="rag-model-strip-base mono">${r(K.base_url)}</span>`:""}
        <span class="rag-model-strip-current">\u76EE\u524D\uFF1A<strong>${r(z||"\u2014")}</strong></span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-processing-action="refresh-embedding-models"
          ${Se?"disabled":""}>
          ${g("refresh",12)}<span>\u6AA2\u67E5\u6A21\u578B</span>
        </button>
      </div>
      ${he}
      <p class="rag-model-hint">\u9EDE\u9078 <span class="mono">\u4E3B\u6A5F:\u6A21\u578B</span> \u5207\u63DB Embedding\uFF1B\u9078\u53D6\u5F8C\u6703\u6210\u70BA\u7B2C\u4E00\u512A\u5148\uFF0C\u5176\u4ED6\u4E3B\u6A5F\u4F9D\u5E8F\u4F5C\u70BA\u5099\u63F4\u3002\u5207\u63DB\u6A21\u578B\u5F8C\u65E2\u6709\u7D22\u5F15\u53EF\u80FD\u9700\u8981\u91CD\u5EFA\u3002</p>
    </div>`;m.innerHTML!==te&&(m.innerHTML=te)},ae=m=>{let y=o.querySelector('[data-import-timeline="judgment"]');if(!y)return;let L=String(m?.active_month||""),z=String(m?.processing_month||"");y.querySelectorAll(".processing-month").forEach(Le=>{let De=!!L&&Le.dataset.month===L;Le.classList.toggle("is-current",De),Le.classList.toggle("is-processing-current",!!z&&Le.dataset.month===z),De?Le.setAttribute("aria-current","true"):Le.removeAttribute("aria-current")});let K=y.querySelector(".index-current-row");if(!L||!m?.active_archive){K&&K.remove();return}let U=b?.workflows?.find(Le=>Le.id==="judgment_import")?.import_timeline?.stage_labels||{},he=ql({activeMonth:L,activeArchive:m.active_archive,activePhase:m.active_phase||"",processingMonth:m.processing_month||"",processingArchive:m.processing_archive||"",stageLabels:U});if(K){K.innerHTML=he;return}let te=document.createElement("div");te.className="index-current-row",te.innerHTML=he;let re=y.querySelector(":scope > .side-card-head");if(re){re.insertAdjacentElement("afterend",te);return}let $e=y.querySelector(".judgment-months");$e&&$e.prepend(te)},tt=m=>{let y=Number(m?.state_mtime_ns);return Number.isFinite(y)?y:-1},Ge=m=>{let y=String(m?.active_month||"");return/^\d{6}$/.test(y)?Number(y):-1},ot=m=>{if(!m)return;let y=tt(m);if(y>=0&&y<P){Be?.active_month&&ae(Be);return}y>=0&&(P=y);let L=String(m.active_month||"");if(!!(m.run_id&&m.run_id===Be?.run_id)&&Ge(m)>=0&&Ge(m)<Ge(Be)){let K={...m,active_month:Be.active_month,active_archive:Be.active_archive};Be=K,ae(K);return}if(!L&&m.run_status==="running"){Be?.active_month&&Be?.run_id===m.run_id?ae(Be):(Be=m,ae(m));return}Be=m,ae(m)},mt=m=>{let y=m?.active_import;if(y){ot(y);return}Be?.active_month&&ae(Be)},le=()=>{if(!($||ve)){if(t){qe=window.setInterval(()=>{$||jt({silent:!0,cached:!0})},3e4);return}ve=wt(["processing","judgment-download","system-usage","ollama","court-check","law-version-check"],(m,y)=>{if(!$){if(m==="processing"){y?.snapshot?.live?ia(y.snapshot):y?.snapshot?na(y.snapshot,{silent:!0}):jt({silent:!0,cached:!0});return}if(m==="judgment-download"){A==="judgment_download"&&ce({quiet:!0,payload:y?.snapshot||null});return}if(m==="system-usage"){A==="index_versions"&&pe({quiet:!0,force:!0,payload:y?.snapshot||null});return}if(m==="ollama"){Kr.has(A)&&He({quiet:!0,payload:y?.snapshot||null});return}if(m==="court-check"){A==="normalize_courts"&&Fe({quiet:!0,force:!0,payload:y?.snapshot||null});return}m==="law-version-check"&&A==="backfill_law_articles"&&Ie({quiet:!0,force:!0,payload:y?.snapshot||null})}},{onProgress:(m,y)=>{if(m!=="processing")return;let L=y?.event;L&&Hs(L)},onError:()=>{b||jt({silent:!0,cached:!0})}})}},xe=()=>{ve&&(ve(),ve=null)},We=async m=>{if(ge)return;let[y,...L]=String(m||"").split("|"),z=Number(y),K=L.join("|");if(!z||!K){et();return}let U=(I?.hosts||[]).find(te=>Number(te.id)===z);if(!U){et();return}let he=Wr(`${U.name||U.base_url||`\u4E3B\u6A5F ${U.id}`}:${K}`);if(he===Ze()){et();return}if(!window.confirm(`\u5207\u63DB Embedding \u70BA ${he}\uFF1F

\u5207\u63DB\u6A21\u578B\u5F8C\uFF0C\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u8207\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u53EF\u80FD\u4E0D\u76F8\u5BB9\uFF0C\u9700\u8981\u91CD\u65B0\u5EFA\u7ACB\u7D22\u5F15\u3002`)){et();return}ge=!0,et();try{await J.selectOllamaModel(z,{model:K,role:"embedding"});let te=(I?.hosts||[]).map($e=>Number($e.id)),re=[z,...te.filter($e=>$e!==z)];await J.reorderOllamaHosts(re),N(`\u5DF2\u5207\u63DB Embedding \u70BA ${he}\u3002`,"ok",6e3),I=null,await He({quiet:!0}),await jt({silent:!0})}catch(te){N(te.message||"\u7121\u6CD5\u5207\u63DB Embedding model\u3002","danger",7e3),await He({quiet:!0})}finally{ge=!1,et()}},He=async({quiet:m=!1,button:y=null,payload:L=null}={})=>{if(!($||Se)){if(t){Se=!1,oe=new Error("\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u8A2D\u5B9A\u3002"),st(),et();return}Se=!0,oe=null,I||(st(),et()),y&&Ee(y,!0,"\u6AA2\u67E5\u4E2D\u2026");try{let z=L||await J.ollamaHosts();if($)return;I=z}catch(z){if($)return;oe=z,m||N(z.message||"\u7121\u6CD5\u6AA2\u67E5 llama-server \u4E3B\u6A5F\u3002","danger",6e3)}finally{$||(Se=!1,y&&Ee(y,!1),st(),et())}}},xt=async m=>{if(Pe)return;let y=(I?.hosts||[]).map(U=>Number(U.id)),L=m.map(U=>Number(U));if(!L.length||L.length!==y.length||L.every((U,he)=>U===y[he])){st();return}Pe=!0;let z=new Map((I?.hosts||[]).map(U=>[Number(U.id),U])),K=L.map(U=>z.get(U)).filter(Boolean);if(I&&K.length===y.length){I={...I,hosts:K,active_host_id:L[0]};let U=o.querySelector("[data-processing-ollama]");U&&(U.dataset.ollamaSignature=""),st()}try{await J.reorderOllamaHosts(L),N("\u5DF2\u66F4\u65B0 llama-server \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","ok",3500)}catch(U){N(U.message||"\u7121\u6CD5\u66F4\u65B0 llama-server \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","danger",6e3),await He({quiet:!0})}finally{Pe=!1}},pt=()=>{let m=o.querySelector("[data-processing-ollama]");m&&(m.dataset.ollamaSignature=""),st()},x=()=>{let m=Me;if(!m)return;if(o.querySelector(`[data-ollama-host][data-host-id="${m.hostId}"]`)?.classList.remove("is-dragging"),m.captureTarget?.hasPointerCapture?.(m.pointerId))try{m.captureTarget.releasePointerCapture(m.pointerId)}catch{}document.documentElement.classList.remove("processing-ollama-dragging"),window.removeEventListener("pointermove",E),window.removeEventListener("pointerup",C),window.removeEventListener("pointercancel",F),Me=null,ke=0},E=m=>{let y=Me;if(!y||m.pointerId!==y.pointerId)return;if(!y.dragging){if(Math.hypot(m.clientX-y.startX,m.clientY-y.startY)<5)return;y.dragging=!0,ke=y.hostId,Re=!1,o.querySelector(`[data-ollama-host][data-host-id="${y.hostId}"]`)?.classList.add("is-dragging"),document.documentElement.classList.add("processing-ollama-dragging")}m.preventDefault();let L=64;m.clientY<L?window.scrollBy(0,-12):m.clientY>window.innerHeight-L&&window.scrollBy(0,12);let z=o.querySelector("[data-ollama-list]"),K=document.elementFromPoint(m.clientX,m.clientY)?.closest?.("[data-ollama-host]");if(!z||!K||!z.contains(K))return;let U=z.querySelector(`[data-ollama-host][data-host-id="${y.hostId}"]`);if(!U||U===K)return;let he=K.getBoundingClientRect(),te=m.clientY>he.top+he.height/2;z.insertBefore(U,te?K.nextSibling:K),Re=!0},C=m=>{let y=Me;if(!y||m.pointerId!==y.pointerId)return;let L=y.dragging,z=Re,K=o.querySelector("[data-ollama-list]"),U=L&&K?[...K.querySelectorAll("[data-ollama-host]")].map(he=>Number(he.dataset.hostId)):[];x(),L&&z&&U.length&&xt(U)},F=()=>{let m=!!Me?.dragging;x(),m&&pt()},Z=m=>{if(m.button!==0||m.pointerType==="mouse"&&m.buttons!==1||Pe||Me)return;let y=m.target.closest("[data-ollama-host]");if(!y||!o.contains(y)||m.target.closest("button")||m.pointerType==="touch"&&!m.target.closest(".processing-ollama-handle"))return;let L=Number(y.dataset.hostId)||0;if(L){m.preventDefault(),ke=L,Me={hostId:L,pointerId:m.pointerId,startX:m.clientX,startY:m.clientY,dragging:!1,captureTarget:y};try{y.setPointerCapture(m.pointerId)}catch{}window.addEventListener("pointermove",E,{passive:!1}),window.addEventListener("pointerup",C),window.addEventListener("pointercancel",F)}},ce=async({quiet:m=!1,payload:y=null}={})=>{if(!v){v=!0,!S&&A==="judgment_download"&&Ye();try{S=y||await J.judgmentDownloadStatus(),j=null}catch(L){j=L.message||"\u8B80\u53D6\u6708\u4EFD\u72C0\u614B\u5931\u6557\u3002",m||N(j,"danger",7e3)}finally{v=!1,A==="judgment_download"&&Ye()}}},pe=async({quiet:m=!0,force:y=!1,payload:L=null}={})=>{if(!we){if(t){we=!1,be=new Error("\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B Qdrant \u5BB9\u5668\u3001volume \u8207\u4E3B\u6A5F\u5132\u5B58\u8CC7\u8A0A\u3002"),A==="index_versions"&&At();return}if(!(!y&&Y&&Date.now()-ne<3e4)){we=!0;try{Y=L||await J.systemUsage(),be=null,ne=Date.now()}catch(z){be=z.message||"\u7121\u6CD5\u53D6\u5F97 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002",m||N(be,"danger",7e3)}finally{we=!1,A==="index_versions"&&At()}}}},Fe=async({quiet:m=!0,force:y=!1,payload:L=null}={})=>{if(!q&&!(!y&&M&&Date.now()-X<6e4)){q=!0;try{M=L||await J.checkCourts(),T=null,X=Date.now()}catch(z){T=z.message||"\u7121\u6CD5\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u3002",m||N(T,"danger",7e3)}finally{q=!1,A==="normalize_courts"&&At()}}},Ie=async({quiet:m=!0,force:y=!1,button:L=null,payload:z=null}={})=>{if(!V&&!(!y&&me&&Date.now()-Ae<6e4)){V=!0,L&&Ee(L,!0,"\u6AA2\u67E5\u4E2D\u2026");try{if(me=z||await J.checkLawVersions(),de=null,Ae=Date.now(),!m){let K=me.totals||{},U=Number(K.needs_backfill_versions)||0,he=Number(K.backfillable_versions)||0,te=Number(K.blocked_versions)||0;U>0?N(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u9700\u8981\u5EFA\u7ACB ${U} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF08\u53EF\u5EFA\u7ACB ${he}\u3001\u7F3A\u539F\u59CB\u6A94 ${te}\uFF09\u3002`,te>0?"danger":"warn",7e3):N(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D ${Number(K.versions)||0} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`,"ok",5e3)}}catch(K){de=K.message||"\u7121\u6CD5\u6AA2\u67E5\u689D\u6587\u6B77\u53F2\u72C0\u614B\u3002",m||N(de,"danger",7e3)}finally{V=!1,L&&Ee(L,!1)}}},Ce=m=>Array.from(o.querySelectorAll("[data-stage-key]")).find(y=>y.dataset.stageKey===m)||null,Ve=m=>{if(!m)return;ue.add(m);let y=Array.from(o.querySelectorAll(".processing-wf-stage[data-processing-stage]")).find(L=>L.dataset.processingStage===m);y&&(y.open=!0,y.scrollIntoView({behavior:"smooth",block:"center"}))},Xe=()=>{ee&&(ee="",f.hidden=!0,o.querySelectorAll("[data-stage-key]").forEach(m=>{m.classList.remove("is-stage-hovered")}))},nt=m=>{let y=m.dataset.stageKey||"";if(!y)return;ee=y,o.querySelectorAll("[data-stage-key]").forEach(ze=>{ze.classList.toggle("is-stage-hovered",ze.dataset.stageKey===y)});let L=m.dataset.stageStatusKey||"idle",z=m.dataset.stageStatus||Ss(L).label,K=m.dataset.stageColor||"var(--accent)",U=Number(m.dataset.stageUpdate)||0,he=Number(m.dataset.stagePending)||0,te=m.dataset.stageContributionLabel||"\u6574\u9AD4\u5360\u6BD4";f.innerHTML=`<div class="processing-stage-tooltip-head">
      <span class="processing-stage-tooltip-swatch" style="background:${r(K)}"></span>
      <strong>${r(m.dataset.stageLabel||y)}</strong>
      ${Dt(L,z)}
    </div>
    <div class="processing-stage-tooltip-meta">
      <span>\u968E\u6BB5\u9032\u5EA6 <strong>${r(m.dataset.stagePercent||"\u2014")}</strong></span>
      <span>${r(te)} <strong>${r(m.dataset.stageContribution||"\u2014")}</strong></span>
      <span class="mono">${r(m.dataset.stageDuration||"\u2014")}</span>
    </div>
    <div class="processing-stage-tooltip-counts">${r(m.dataset.stageCounts||"\u2014")}</div>
    ${U||he?`<div class="processing-stage-tooltip-badges">
            ${U?`<span class="processing-wf-count is-update">${g("refresh",11)}<strong>${c(U)}</strong><span>\u53EF\u66F4\u65B0</span></span>`:""}
            ${he?`<span class="processing-wf-count is-pending">${g("clock",11)}<strong>${c(he)}</strong><span>\u5F85\u57F7\u884C</span></span>`:""}
          </div>`:""}
    ${m.dataset.stageMessage?`<div class="processing-stage-tooltip-message">${r(m.dataset.stageMessage)}</div>`:""}`,f.hidden=!1;let re=Math.min(300,Math.max(220,window.innerWidth-24));f.style.width=`${re}px`;let $e=m.getBoundingClientRect(),Le=Math.min(window.innerWidth-re-12,Math.max(12,$e.left)),De=$e.top-f.offsetHeight-10,je=De>=12?De:Math.min(window.innerHeight-f.offsetHeight-12,$e.bottom+10);f.style.left=`${Le}px`,f.style.top=`${Math.max(12,je)}px`},Ra=m=>{if(m.target.closest(".is-failure-tip")){Xe();return}if(m.target.closest(".processing-wf-rail"))return;let y=m.target.closest("[data-stage-key]");!y||!o.contains(y)||y.contains(m.relatedTarget)||nt(y)},xs=m=>{let y=m.target.closest("[data-stage-key]");if(!y||!o.contains(y)||y.contains(m.relatedTarget))return;let L=m.relatedTarget?.closest?.("[data-stage-key]");L&&L.dataset.stageKey===y.dataset.stageKey||Xe()},Dn=m=>Array.isArray(m?.active_runs)&&m.active_runs.length||(m?.workflows||[]).some(y=>y.active_run)?!0:String(m?.update?.status||"")==="running",aa=()=>{o.querySelectorAll('[data-processing-action="stop"]').forEach(m=>Ee(m,!0,"\u505C\u6B62\u4E2D\u2026")),d&&Ee(d,!0,"\u505C\u6B62\u4E2D\u2026")},Jt=()=>{o.querySelectorAll('[data-processing-action="stop"]').forEach(m=>Ee(m,!1)),d&&Ee(d,!1)},Xt=new Set(["refresh","open-stage","refresh-judgment-months","refresh-court-check","refresh-law-version-check"]),Os=()=>{t&&(i.querySelectorAll("[data-processing-action]").forEach(m=>{Xt.has(m.dataset.processingAction||"")||("disabled"in m&&(m.disabled=!1),m.removeAttribute("disabled"),m.classList.add("is-demo-locked"),m.setAttribute("aria-disabled","true"),m.removeAttribute("title"),m.dataset.demoLockTooltip="\u5C55\u793A\u6A21\u5F0F\u50C5\u4F9B\u6AA2\u8996\uFF0C\u57F7\u884C\u8207\u8A2D\u5B9A\u7531\u7BA1\u7406\u8005\u64CD\u4F5C")}),i.querySelectorAll("[data-ollama-action], [data-processing-embedding-select]").forEach(m=>{m.disabled=!0,m.classList.add("is-demo-locked"),m.removeAttribute("title"),m.dataset.demoLockTooltip="\u5C55\u793A\u6A21\u5F0F\u50C5\u4F9B\u6AA2\u8996"}))},gs=m=>{let y=m.capabilities||{};p&&!Dn(m)&&(p=!1,Jt()),!u&&d&&(d.hidden=!y.can_stop_update),p&&aa(),Os()},At=()=>{if(!b)return;b.slim&&jt({silent:!0,cached:!0});let m=Ln(b,A,_e(),ue);m!==_&&(us(o,m),_=m),Ye(),st(),et(),mt(b),Os()},na=(m,{silent:y=!1}={})=>{if($||!m||m.slim&&b&&!b.slim)return;let L=Date.parse(m.generated_at||""),z=Date.parse(b?.generated_at||"");if(Number.isFinite(L)&&Number.isFinite(z)&&L<z)return;if(Gt){let re=(m.workflows||[]).find(Le=>Le.id===Gt),$e=re?.active_run?.id||re?.last_run?.id||"";(re?.active_run||$e&&$e!==Cs)&&(Gt="",Cs="")}b=m,window.dispatchEvent(new CustomEvent("judgment:processing-pending",{detail:{count:Number(m.capabilities?.unprocessed_archives)||0,index_pending:Number(m.capabilities?.index_pending_months)||0}}));let K=new Map;for(let re of m.sections||[])for(let $e of re.stages||[])K.set(`${re.key}-${$e.key}`,$e);for(let[re,$e]of Ut){if($e.kind!=="upgrade")continue;let Le=K.get(re);if(Le){if(Le.phase==="failed"||Le.phase==="running"&&Le.percent!==null){Ut.delete(re);continue}if(Le.phase==="completed"){let De=Date.parse(Le.last_run?.started_at||"");Number.isFinite(De)&&De>=Number($e.startedAt||0)-1e3&&Ut.delete(re)}}}let U=Mn(m,A);U!==k&&(us(l,U),k=U);let he=Ln(m,A,_e(),ue);if(he!==_&&(us(o,he),_=he),Ye(),st(),ee){let re=Ce(ee);re?nt(re):Xe()}let te=o.querySelector("[data-processing-updated-at]");if(te){let re=ye(m.generated_at);te.textContent!==re&&(te.textContent=re)}if(gs(m),et(),mt(m),!t&&!I&&!Se&&He({quiet:!0}),Q.length){let re=Q.splice(0);for(let $e of re)Hs($e)}},ra=m=>{if(H=m,typeof requestAnimationFrame>"u"){let y=H;H=null,y&&ia(y);return}R||(R=requestAnimationFrame(()=>{R=0;let y=H;H=null,y&&ia(y)}))},Hs=m=>{if(!m)return;if(!b){Q.push(m),Q.length>100&&Q.shift();return}let y=String(m.run_id||""),L=Number(m.seq)||0;if(y&&y===B&&L>0&&L<=G)return;y&&y!==B&&(B=y,G=0),L>0&&(G=L);let z=String(m.workflow_id||"judgment_import"),K=String(m.month||"").replace(/\D/g,"").slice(0,6),U=(b.workflows||[]).find(De=>De.id===z);if(!U)return;U.progress||(U.progress={stages:[]}),Array.isArray(U.progress.stages)||(U.progress.stages=[]);let he=String(m.stage||""),te=he?U.progress.stages.find(De=>String(De.key)===he):null,re=String(U.progress.run_id||"")===String(m.run_id||"");if(te&&m.type==="stage_progress"){let De=Number(m.current),je=Number(te.current);re&&m.status==="running"&&Number.isFinite(De)&&Number.isFinite(je)&&De<je||(m.status&&(te.status=String(m.status)),m.current!==void 0&&(te.current=Number(m.current)||0),m.total!==void 0&&(te.total=Number(m.total)||0),m.percent!==void 0&&(te.percent=Number(m.percent)||0),m.message&&(te.message=String(m.message)))}if(te&&m.extra&&typeof m.extra=="object")for(let De of["financial_processed","financial_matched","financial_percent"])m.extra[De]!==void 0&&(te[De]=Number(m.extra[De])||0);if(m.type==="stage_progress"&&m.overall_percent!==void 0){let De=Number(m.overall_percent)||0,je=Number(U.progress.overall_percent)||0;U.progress.overall_percent=re?Math.max(je,De):De}m.type!=="run_finished"&&(U.progress.run_status="running"),(m.type==="archive_started"||m.type==="stage_progress")&&!U.active_run&&m.run_id&&(U.active_run={id:m.run_id,status:"running",started_at:m.timestamp,message:m.message||""}),m.type==="run_finished"&&(U.active_run=null,U.progress.run_status=String(m.status||"success"),U.can_run=!0);let $e=[];K&&m.month_stages&&$e.push({month:K,import_stages:m.month_stages,import_overall:m.month_overall||""});let Le=null;if(m.type==="archive_started"&&K){let De=Date.parse(m.timestamp||"");Le={active_month:K,active_archive:m.archive,active_phase:m.stage||"filter",processing_month:K,processing_archive:m.archive,run_id:m.run_id,run_status:"running",state_mtime_ns:Number.isFinite(De)?De*1e6:Date.now()*1e6}}else m.type==="run_finished"&&(Le={...b.active_import||{},run_status:String(m.status||"success")});ra({live:!0,generated_at:m.timestamp,workflows:[{id:z,active_run:U.active_run,last_run:U.last_run,progress:U.progress,can_run:U.can_run}],import_timeline_months:$e,active_import:Le})},ia=m=>{if($||!m||!b)return;let y=new Map((m.workflows||[]).map(te=>[te.id,te]));if(Gt){let te=y.get(Gt),re=te?.active_run?.id||te?.last_run?.id||"";(te?.active_run||re&&re!==Cs)&&(Gt="",Cs="")}for(let te of b.workflows||[]){let re=y.get(te.id);if(re){if("active_run"in re&&(te.active_run=re.active_run),"last_run"in re&&(te.last_run=re.last_run),Array.isArray(re.recent_runs)&&(te.recent_runs=re.recent_runs),"index_runtime"in re){let $e=re.index_runtime;$e&&!$e.active_coverage&&te.index_runtime?.active_coverage&&($e.active_coverage=te.index_runtime.active_coverage),$e&&!$e.active_archive_coverage&&te.index_runtime?.active_archive_coverage&&($e.active_archive_coverage=te.index_runtime.active_archive_coverage),te.index_runtime=$e}if(re.progress){let $e=re.progress,Le=te.progress;if(te.id==="judgment_import"&&Le?.run_id&&Le.run_id===$e.run_id){let De=new Map((Le.stages||[]).map(je=>[String(je.key),je]));for(let je of $e.stages||[]){let ze=De.get(String(je.key));ze&&je.status==="running"&&Number(je.current)<Number(ze.current)&&(je.current=ze.current,je.total=ze.total,je.percent=ze.percent,je.message=ze.message)}$e.overall_percent=Math.max(Number(Le.overall_percent)||0,Number($e.overall_percent)||0)}te.progress=$e}typeof re.can_run=="boolean"&&(te.can_run=re.can_run)}}let L=te=>{if(!te||!Array.isArray(m.import_timeline_months))return;let re=new Map((te.months||[]).map(Le=>[String(Le.month),Le]));for(let Le of m.import_timeline_months){let De=re.get(String(Le.month));De&&(De.import_stages={...De.import_stages||{},...Le.import_stages||{}},Le.import_stage_progress&&(De.import_stage_progress={...De.import_stage_progress||{},...Le.import_stage_progress||{}}),Le.import_overall&&(De.import_overall=Le.import_overall))}let $e={complete:0,incomplete:0,processing:0,empty:0};for(let Le of te.months||[]){let De=String(Le.import_overall||"empty");$e[De]=Number($e[De]||0)+1}te.stage_summary=$e};(te=>{let re=(te.workflows||[]).find(ct=>ct.id==="index_versions"),$e=re?.index_runtime;if(!$e||!Array.isArray($e.months))return;let Le=(te.file_timelines||[]).find(ct=>ct.key==="judgment");if(!Le||!Array.isArray(Le.months))return;let De=(re.progress?.stages||[]).find(ct=>ct.key==="validate"),je=["success","no_change"].includes(String($e.run_status||""))||String($e.run_status||"")!=="running"&&/alias\s*已切換/.test(String(De?.message||"")),ze=String($e.current?.month||""),rt=new Map(Le.months.map(ct=>[String(ct.month),ct]));for(let ct of $e.months){let $t=rt.get(String(ct.month||""));if(!$t)continue;let bs=$t.stages||($t.stages={}),da=String(ct.status||"");da==="running"||String(ct.month)===ze?(bs.qdrant="processing",$t.overall="processing"):da==="success"&&bs.qdrant!=="complete"&&(bs.qdrant=je?"complete":"incomplete",$t.overall=je?"complete":"incomplete")}let Rt={complete:0,incomplete:0,processing:0,empty:0,update:0};for(let ct of Le.months){let $t=String(ct.overall||"empty");Rt[$t]=Number(Rt[$t]||0)+1,ct.has_update&&(Rt.update+=1)}Le.summary=Rt})(b),L(b.import_timeline);for(let te of b.workflows||[])te.id==="judgment_import"&&L(te.import_timeline);m.active_import&&(b.active_import=m.active_import),m.mode&&(b.mode=m.mode),m.generated_at&&(b.generated_at=m.generated_at);let K=Mn(b,A);K!==k&&(us(l,K),k=K);let U=Ln(b,A,_e(),ue);U!==_&&(us(o,U),_=U),Ye(),st(),et(),mt(b),gs(b);let he=o.querySelector("[data-processing-updated-at]");if(he&&m.generated_at){let te=ye(m.generated_at);he.textContent!==te&&(he.textContent=te)}},jt=async({silent:m=!1,cached:y=!1,slim:L=!1}={})=>{if(!($||h)){h=!0;try{let z=await J.processing({cached:y,slim:L});L&&n(z),na(z,{silent:m})}catch(z){if($)return;let K=Ep(z.message,b);K!==_&&(us(o,K),_=K),m||N(z.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{h=!1}}},oa=async(m,y="")=>{if(u)return;u=!0,Ee(m,!0,"\u6AA2\u67E5\u4E2D\u2026");let L=$l[y]||"",z=String(m.dataset.sourceTypes||"").split(",").map(he=>he.trim()).filter(Boolean),K=z.length?z:L?[L]:[],U=m.dataset.stageId||"";U&&(Ut.set(U,{kind:"check",phase:"updating",startedAt:Date.now()}),At());try{let he=await J.checkUpdates(K);if(he&&he.checking)U&&(Ut.delete(U),At()),N("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u8ACB\u7A0D\u5F8C\u91CD\u65B0\u6574\u7406\u3002","info",6e3);else if(K.length===1){let te=(he.sources||{})[K[0]]||{},re=yl[y]||(K[0]==="judgment"?"\u5224\u6C7A":K[0]==="law"?"\u6CD5\u898F":K[0]==="order"?"\u547D\u4EE4":"\u8CC7\u6599");te.status==="error"?N(`${re}\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF1A${te.message||"\u7121\u6CD5\u53D6\u5F97\u7DDA\u4E0A\u7248\u672C"}`,"danger",7e3):N(te.update_available?`${re}\u7DDA\u4E0A\u5DF2\u6709\u66F4\u65B0\u7248\u672C\u3002`:`${re}\u7DDA\u4E0A\u5DF2\u662F\u6700\u65B0\u7248\u672C\u3002`,te.update_available?"warn":"ok",6e3)}else if(K.length>1){let te=he.sources||{},re=K.filter(Le=>te[Le]?.update_available),$e=K.filter(Le=>te[Le]?.status==="error");$e.length?N(`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF0C\u4F46\u6709 ${$e.length} \u9805\u6AA2\u67E5\u5931\u6557\u3002`,"danger",7e3):N(re.length?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${re.length} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",re.length?"warn":"ok",6e3)}else{let te=Number(he.update_count)||0;N(te>0?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${te} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",te>0?"warn":"ok",6e3)}U&&(Ut.set(U,{kind:"check",phase:"updated",startedAt:Date.now()}),At()),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await jt({silent:!0})}catch(he){U&&(Ut.delete(U),At()),N(he.message||"\u66F4\u65B0\u6AA2\u67E5\u5931\u6557\u3002","danger",7e3)}finally{u=!1,Ee(m,!1),b&&gs(b)}},la=async m=>{let y=$l[m]||"";if(!y)return!0;let L=null;try{L=await J.checkUpdates([y])}catch(K){return N(`\u7121\u6CD5\u5B8C\u6210\u7248\u672C\u6AA2\u67E5\uFF08${K.message||"\u7DB2\u8DEF\u932F\u8AA4"}\uFF09\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002`,"warn",7e3),!0}if(!L||L.checking)return L&&L.checking&&N("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","info",6e3),!0;let z=(L.sources||{})[y];if(!z)return!0;if(window.dispatchEvent(new CustomEvent("judgment:updates-changed")),z.status==="up_to_date"&&!z.update_available){let K=yl[m]||"\u8CC7\u6599",U=z.checked_at?`\uFF08${ye(z.checked_at)} \u6AA2\u67E5\uFF09`:"",he=fp[m]||"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u55CE\uFF1F";return window.confirm(`${K}\u7DDA\u4E0A\u6AA2\u67E5\u70BA\u6700\u65B0\u7248\u672C${U}\u3002

${he}`)}return z.status==="error"&&N("\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","warn",6e3),!0},Bn=async(m,y)=>{if(u)return;u=!0;let L=(b?.workflows||[]).find(U=>U.id===y);Cs=L?.active_run?.id||L?.last_run?.id||"",Gt=y,Ee(m,!0,"\u57F7\u884C\u4E2D"),At();let z=m.dataset.stageId||"",K=!1;try{if(!await la(y))return;z&&(Ut.set(z,{kind:"upgrade",phase:"upgrading",startedAt:Date.now()}),At());let he;try{he=await J.startProcessingWorkflow(y)}catch(te){throw z&&(Ut.delete(z),At()),te}K=!0,N(`\u5DF2\u555F\u52D5\u300C${L?.label||y}\u300D\u6D41\u7A0B\u3002`,"ok",6e3),he&&he.run_id&&console.info("processing workflow started",he),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),jt({silent:!0}),window.setTimeout(()=>{Gt===y&&(Gt="",Cs="",jt({silent:!0}))},15e3)}catch(U){N(U.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{u=!1,(!K||Gt!==y)&&(Gt="",Cs="",b?(gs(b),_="",At()):Ee(m,!1))}},Ca=async m=>{if(!(u||p)){u=!0,p=!0,Ee(m,!0,"\u505C\u6B62\u4E2D\u2026");try{let y=await J.stopProcessingUpdate();for(let[L,z]of Ut)z.kind==="upgrade"&&Ut.delete(L);At(),jt({silent:!0}),N(y.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3)}catch(y){p=!1,Ee(m,!1),N(y.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{u=!1,p?aa():b&&gs(b)}}},zs=m=>{let y=m.target.closest("[data-processing-action]");if(!y||y.disabled)return;if(t&&!Xt.has(y.dataset.processingAction||"")){m.preventDefault(),m.stopPropagation(),N("\u5C55\u793A\u6A21\u5F0F\u50C5\u4F9B\u6AA2\u8996\uFF0C\u57F7\u884C\u8207\u8A2D\u5B9A\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002","info",4e3);return}y.closest(".processing-wf-rail")&&(m.preventDefault(),m.stopPropagation());let L=y.dataset.processingAction;if(L==="refresh")jt({silent:!1,cached:t});else if(L==="open-stage")Ve(y.dataset.stageId||"");else if(L==="refresh-judgment-months")ce({quiet:!1});else if(L==="refresh-index-storage")pe({quiet:!1,force:!0});else if(L==="refresh-court-check")Fe({quiet:!1,force:!0});else if(L==="refresh-law-version-check")Ie({quiet:!1,force:!0,button:y});else if(L==="refresh-ollama")He({quiet:!1,button:y});else if(L==="refresh-embedding-models")He({quiet:!1,button:y});else if(L==="select-embedding-model"){let z=y.dataset.hostId||"",K=y.dataset.model||"";We(`${z}|${K}`)}else if(L==="move-ollama-host"){let z=I?.hosts||[],K=z.findIndex(re=>Number(re.id)===Number(y.dataset.hostId)),U=y.dataset.direction,he=U==="up"?K-1:U==="down"?K+1:-1;if(K<0||he<0||he>=z.length)return;let te=z.map(re=>Number(re.id));[te[K],te[he]]=[te[he],te[K]],xt(te)}else if(L==="check-updates")oa(y,y.dataset.workflowId||"");else if(L==="run-workflow"){let z=y.dataset.workflowId||"";Bn(y,z)}else L==="stop"&&Ca(y)},fs=(m,{scroll:y=!1}={})=>{if(A=m||"overview",b){let L=Mn(b,A);us(l,L),k=L;let z=Ln(b,A,_e(),ue);if(us(o,z),_=z,Ye(),st(),et(),mt(b),ee){let K=Ce(ee);K?nt(K):Xe()}Os(),y&&o.scrollIntoView({behavior:"smooth",block:"start"})}!t&&Kr.has(A)&&He({quiet:!0}),A==="judgment_download"&&ce({quiet:!0}),A==="index_versions"&&(t?(be=new Error("\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B Qdrant \u5BB9\u5668\u3001volume \u8207\u4E3B\u6A5F\u5132\u5B58\u8CC7\u8A0A\u3002"),we=!1,At()):pe({quiet:!0})),A==="normalize_courts"&&Fe({quiet:!0}),A==="backfill_law_articles"&&Ie({quiet:!0})},ca=m=>{let y=m.target.closest("[data-processing-workflow]");y&&fs(y.dataset.processingWorkflow||"overview")},w=m=>{let y=m.target.closest("[data-timeline-workflow]");y&&(m.preventDefault(),fs(y.dataset.timelineWorkflow||"",{scroll:!0}))},D=m=>{let y=m.target.closest?.(".index-wf-stage[data-index-stage]");if(y&&o.contains(y)){let U=y.dataset.indexStage||"";U&&(y.open?Yr.add(U):Yr.delete(U));return}let L=m.target.closest?.(".workflow-wf-stage[data-workflow-wf-stage]");if(L&&o.contains(L)){let U=L.dataset.workflowWfStage||"";U&&(L.open?Xr.add(U):Xr.delete(U));return}let z=m.target.closest?.(".processing-wf-stage[data-processing-stage]");if(!z||!o.contains(z))return;let K=z.dataset.processingStage||"";K&&(z.open?ue.add(K):ue.delete(K))};i.addEventListener("click",zs),l.addEventListener("click",ca),o.addEventListener("click",w),o.addEventListener("pointerover",Ra),o.addEventListener("pointerout",xs),o.addEventListener("pointerdown",Z),o.addEventListener("toggle",D,!0),window.addEventListener("scroll",Xe,{capture:!0,passive:!0});let O=a();O&&na(O,{silent:!0});let se=jt({silent:!0,cached:!0,slim:!0});return le(),await se,()=>{$=!0,xe(),qe&&(window.clearInterval(qe),qe=null),i.removeEventListener("click",zs),l.removeEventListener("click",ca),o.removeEventListener("click",w),x(),o.removeEventListener("pointerover",Ra),o.removeEventListener("pointerout",xs),o.removeEventListener("pointerdown",Z),o.removeEventListener("toggle",D,!0),window.removeEventListener("scroll",Xe,{capture:!0})}}var di={};rs(di,{render:()=>Vm});var ii={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u522A\u9664\uFF0F\u9000\u5F79",badge:"badge-neutral"}},ns={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},ta={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},Fl={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function Ta(e){let t=ii[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${r(t.label)}</span>`}function oi(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function mm(e){return oi(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",source_type:a||""}})}function gm(e){return oi(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",article_no:a||""}})}function fm(e){return oi(e).map(t=>({jid:t.trim()}))}function bm(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function hm(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function vm(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function $m(e){return(e?.tags||[]).join(", ")}function ja(e){return`<div class="qb-empty">${g("info",18)}<span>${r(e)}</span></div>`}function li(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),n=[...t.map(i=>`<span class="chip">${r(i)}</span>`),...s.map(i=>`<span class="chip">${r(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${r(i)}</span>`)];return n.length?`<div class="chips qb-labels">${n.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function ci(){return`<details class="qb-import">
    <summary>${g("upload",14)}JSON \u6279\u6B21\u532F\u5165</summary>
    <p class="qb-muted">\u683C\u5F0F\uFF1A<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>\u3002\u76F8\u540C\u984C\u76EE fingerprint \u9810\u8A2D\u66F4\u65B0\u3002</p>
    <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
    <div class="qb-actions">
      <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${g("upload",13)}<span>\u532F\u5165 JSON</span></button>
    </div>
  </details>`}function ym(e){let t=e?.item||{},s=Array.isArray(e?.warnings)?e.warnings:[],a=Array.isArray(t.tags)?t.tags:[];return`<section class="report-card qb-card qb-ai-result">
    <div class="side-card-head">
      <span class="side-card-title">${g("sparkles",14)}llama-server \u5DF2\u5EFA\u7ACB\u984C\u76EE #${t.id}</span>
      ${Ta(t.status)}
    </div>
    <div class="qb-ai-answer">
      <strong>${r(t.question||"")}</strong>
      <div class="qb-ai-meta">
        ${r(ns[t.question_type]||t.question_type||"")}
        \xB7 ${r(ta[t.difficulty]||t.difficulty||"")}
        \xB7 ${r(e?.model||"\u672C\u6A5F llama-server")}
      </div>
      ${li(t)}
      ${t.reference_answer?`<div class="qb-reference"><span class="summary-label">llama-server \u53C3\u8003\u7B54\u6848</span><p>${r(t.reference_answer)}</p></div>`:""}
      ${a.length?`<div class="chips">${a.map(n=>`<span class="chip">${r(n)}</span>`).join("")}</div>`:""}
      ${s.length?`<div class="qb-ai-warnings"><strong>\u9700\u8981\u6CE8\u610F</strong><ul>${s.map(n=>`<li>${r(n)}</li>`).join("")}</ul></div>`:""}
      <div class="qb-actions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="review-ai-item">${g("shield",13)}<span>\u524D\u5F80\u9A57\u6536</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="reset-ai">${g("plus",13)}<span>\u518D\u65B0\u589E\u4E00\u984C</span></button>
      </div>
    </div>
    ${ci()}
  </section>`}function wm(e){return e.aiResult?ym(e.aiResult):`<section class="report-card qb-card">
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
    ${ci()}
  </section>`}var Ol=[["clarity","\u984C\u76EE\u6E05\u6670"],["labels","\u6CD5\u689D\u6A19\u6CE8"],["answer","\u53C3\u8003\u7B54\u6848"],["difficulty","\u96E3\u5EA6\u8207\u6A19\u7C64"],["overall","\u6574\u9AD4"]];function zl(e){let t=Array.isArray(e?.reviews)?e.reviews:[],s=`<div class="side-card-head">
    <span class="side-card-title">${g("shield",14)}\u4EBA\u5DE5\u9A57\u6536\u6279\u6CE8\u5206\u6578</span>
    <span class="badge badge-neutral badge-mono">${c(t.length)} \u7B46</span>
  </div>`;if(!t.length)return`<section class="qb-review-scores-block">
      ${s}
      <div class="qb-empty qb-score-history-empty">\u5C1A\u7121\u4EBA\u5DE5\u9A57\u6536\u8A55\u5206\uFF1B\u5B8C\u6210\u9A57\u6536\u5F8C\u6703\u986F\u793A\u4E94\u9805\u5206\u6578\u8207\u6279\u6CE8\u3002</div>
    </section>`;let a=t.map(n=>{let i=n.rubric_scores||{};return`<tr>
        <td class="cell-date">${r(ye(n.created_at))}</td>
        <td>${r(n.reviewer||"\u533F\u540D")}</td>
        ${Ol.map(([o])=>`<td class="cell-number"><strong class="qb-score-value ${Ul(i[o])}">${r(i[o]??"\u2014")}</strong></td>`).join("")}
        <td>${Ta(n.decision==="approved"?"accepted":n.decision)}</td>
        <td class="qb-score-comment">${r(n.comment||"\u2014")}</td>
      </tr>`}).join("");return`<section class="qb-review-scores-block">
    ${s}
    <div class="table-wrap">
      <table class="data-table is-compact qb-score-history-table">
        <thead>
          <tr>
            <th scope="col">\u6642\u9593</th>
            <th scope="col">\u5BE9\u6838\u8005</th>
            ${Ol.map(([,n])=>`<th scope="col" class="cell-number">${n}</th>`).join("")}
            <th scope="col">\u7D50\u679C</th>
            <th scope="col">\u6279\u6CE8</th>
          </tr>
        </thead>
        <tbody>${a}</tbody>
      </table>
    </div>
  </section>`}function _m(e){return`<section class="report-card qb-card">
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
          <select class="select" name="question_type">${Object.entries(ns).map(([t,s])=>`<option value="${t}" ${e?.question_type===t?"selected":""}>${s}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u96E3\u5EA6</span>
          <select class="select" name="difficulty">${Object.entries(ta).map(([t,s])=>`<option value="${t}" ${e?.difficulty===t?"selected":""}>${s}</option>`).join("")}</select>
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
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${r(bm(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${r(hm(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${r(vm(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${r(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${r($m(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
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
    ${zl(e)}
    ${ci()}
  </section>`}function km(e,t){return e?_m(e):wm(t)}function Ul(e){let t=Number(e);return!Number.isFinite(t)||t<=0?"":t>=4?"is-green":t===3?"is-yellow":"is-red"}var Sm=[["clarity","\u984C\u76EE\u6E05\u6670"],["labels","\u6CD5\u689D\u6A19\u6CE8"],["answer","\u53C3\u8003\u7B54\u6848"],["difficulty","\u96E3\u5EA6\u8207\u6A19\u7C64"],["overall","\u6574\u9AD4"]];function xm(e){let t=e?.latest_review||e?.reviews?.[0]||null;if(!t)return'<div class="qb-latest-scores is-empty">\u5C1A\u7121\u4EBA\u5DE5\u9A57\u6536\u8A55\u5206</div>';let s=t.rubric_scores||{};return`<div class="qb-latest-scores" title="${r(`${ye(t.created_at)} \xB7 ${t.reviewer||"\u533F\u540D"}`)}">
    <span class="qb-latest-scores-label">\u6700\u65B0\u8A55\u5206</span>
    ${Sm.map(([a,n])=>`<span>${n} <strong class="qb-score-value ${Ul(s[a])}">${r(s[a]??"\u2014")}</strong></span>`).join("")}
    <span class="qb-latest-scores-meta">${r(t.reviewer||"\u533F\u540D")} \xB7 ${r(ye(t.created_at))}</span>
  </div>`}function Am(e){let t=e.status==="retired"||!!e.deleted_at;return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${r(e.question)}</strong>
        <span class="qb-meta">
          ${r(ns[e.question_type]||e.question_type)}
          \xB7 ${r(ta[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${Ta(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${li(e)}
    <div class="qb-item-foot">
      <span>\u66F4\u65B0 ${r(ye(e.updated_at))}</span>
      ${e.reviewed_by?`<span>\u5BE9\u6838 ${r(e.reviewed_by)}</span>`:""}
      ${e.review_comment?`<span class="qb-comment">${r(e.review_comment)}</span>`:""}
      <div class="qb-actions">
        ${t?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="restore" data-id="${e.id}">${g("refresh",13)}<span>\u5FA9\u539F\u984C\u76EE</span></button>`:`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${g("edit",13)}<span>\u7DE8\u8F2F</span></button>
               ${["pending_review","changes_requested"].includes(e.status)?"":`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="submit-review" data-id="${e.id}">${g("upload",13)}<span>${e.status==="draft"?"\u9001\u5BE9":"\u91CD\u65B0\u9001\u5BE9"}</span></button>`}
               <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${e.id}">${g("shield",13)}<span>\u9A57\u6536</span></button>
               <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${g("trash",13)}<span>\u522A\u9664</span></button>`}
      </div>
      ${xm(e)}
    </div>
  </article>`}function qm(e){return`<section class="report-card qb-card">
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
        ${Object.entries(ii).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(ns).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(ta).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
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
      ${e.items.length?e.items.map(t=>Am(t)).join(""):ja("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${c(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}var Gl=[["queue","\u5F85\u5BE9\uFF0F\u9000\u56DE"],["accepted","\u5DF2\u6838\u51C6"],["rejected","\u5DF2\u62D2\u7D55"],["draft","\u8349\u7A3F"]];function Mm(e){let t=e.stats||{};return{queue:Number(t.pending_review||0)+Number(t.changes_requested||0),accepted:Number(t.accepted||0),rejected:Number(t.rejected||0),draft:Number(t.draft||0)}}function Lm(e,t){let s=e.reviewFilter||"queue",a={queue:{title:"\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u6216\u9000\u56DE\u4FEE\u6539\u7684\u984C\u76EE\u3002",text:t.accepted?`\u5DF2\u6709 ${c(t.accepted)} \u984C\u6838\u51C6\u3002\u65B0\u984C\u76EE\u5EFA\u7ACB\u5F8C\u6703\u81EA\u52D5\u9001\u5BE9\uFF0C\u4E5F\u53EF\u4EE5\u5207\u63DB\u5230\u300C\u5DF2\u6838\u51C6\u300D\u91CD\u65B0\u9A57\u6536\u65E2\u6709\u984C\u76EE\u3002`:"\u5EFA\u7ACB\u984C\u76EE\u5F8C\u6703\u9810\u8A2D\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\uFF1B\u82E5\u53EA\u60F3\u5148\u4FDD\u5B58\uFF0C\u5EFA\u7ACB\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5373\u53EF\u5B58\u6210\u8349\u7A3F\u3002"},accepted:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u6838\u51C6\u984C\u76EE\u3002",text:"\u984C\u76EE\u901A\u904E\u4EBA\u5DE5\u9A57\u6536\u5F8C\u6703\u5217\u5728\u9019\u88E1\uFF1B\u4E5F\u53EF\u4EE5\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u9001\u51FA\u9A57\u6536\u3002"},rejected:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u62D2\u7D55\u984C\u76EE\u3002",text:"\u88AB\u62D2\u7D55\u7684\u984C\u76EE\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u4E2D\uFF0C\u53EF\u4FEE\u6539\u5F8C\u91CD\u65B0\u9001\u5BE9\u3002"},draft:{title:"\u76EE\u524D\u6C92\u6709\u8349\u7A3F\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u984C\u76EE\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5C31\u6703\u5B58\u6210\u8349\u7A3F\uFF0C\u4E4B\u5F8C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002"}}[s]||{title:"\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u65B0\u984C\u76EE\u5F8C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"},n=[s!=="draft"?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="new">${g("plus",13)}<span>\u65B0\u589E\u984C\u76EE</span></button>`:"",s==="queue"&&t.accepted?`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="review-filter" data-filter="accepted">${g("shield",13)}<span>\u67E5\u770B\u5DF2\u6838\u51C6 ${c(t.accepted)}</span></button>`:"",`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="go-manage">${g("database",13)}<span>\u524D\u5F80\u984C\u5EAB\u7BA1\u7406</span></button>`].filter(Boolean).join("");return`<div class="qb-empty qb-empty-block">
    <span class="qb-empty-icon">${g("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>${r(a.title)}</strong>
      <p>${r(a.text)}</p>
      <div class="qb-actions">${n}</div>
    </div>
  </div>`}function jm(e){let t=Gl.find(([s])=>s===e);return t?t[1]:"\u5F85\u5BE9\uFF0F\u9000\u56DE"}function Tm(e,t){return`<button class="qb-review-item${t?" is-active":""}" type="button" data-qb-action="select-review-item" data-id="${e.id}" aria-pressed="${t?"true":"false"}">
    <span class="qb-review-item-top">
      <span class="qb-id">#${e.id}</span>
      <span class="qb-review-item-meta">
        ${r(ns[e.question_type]||e.question_type)}
        \xB7 ${r(ta[e.difficulty]||e.difficulty)}
        \xB7 v${e.version}
        ${e.benchmark_ready?" \xB7 Benchmark ready":""}
        ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
      </span>
      ${Ta(e.status)}
    </span>
    <strong>${r(e.question)}</strong>
  </button>`}function Em(e){return`<article class="qb-review-pane-card">
    <div class="qb-review-pane-head">
      <div class="qb-review-pane-title">
        <span class="qb-review-item-meta">#${e.id} \xB7 v${e.version} \xB7 ${r(ns[e.question_type]||e.question_type)} \xB7 ${r(ta[e.difficulty]||e.difficulty)}</span>
        <strong>${r(e.question)}</strong>
      </div>
      <div class="qb-review-pane-side">
        ${Ta(e.status)}
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${g("edit",13)}<span>\u7DE8\u8F2F</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${g("trash",13)}<span>\u522A\u9664</span></button>
        </div>
      </div>
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${li(e)}
    ${e.review_comment?`<div class="qb-review-note"><span class="summary-label">\u6700\u8FD1\u6279\u6CE8${e.reviewed_by?` \xB7 ${r(e.reviewed_by)}`:""}</span><p>${r(e.review_comment)}</p></div>`:""}
    ${e.reference_answer?`<div class="qb-reference"><span class="summary-label">\u53C3\u8003\u7B54\u6848</span><p>${r(e.reference_answer)}</p></div>`:""}
    <form class="qb-review-form" data-qb-form="review" data-id="${e.id}">
      <div class="qb-score-grid">
        ${[["clarity","\u984C\u76EE\u6E05\u6670"],["labels","\u6CD5\u689D\u6A19\u6CE8"],["answer","\u53C3\u8003\u7B54\u6848"],["difficulty","\u96E3\u5EA6\u8207\u6A19\u7C64"],["overall","\u6574\u9AD4"]].map(([t,s])=>Qa({name:`score_${t}`,label:s,value:4})).join("")}
      </div>
      <label class="field"><span class="field-label">\u6279\u6CE8</span><textarea class="input" name="comment" rows="3" placeholder="\u6A19\u8A3B\u7406\u7531\u3001\u9700\u8981\u4FEE\u6539\u7684\u6B04\u4F4D\uFF0C\u6216\u9A57\u6536\u7D50\u8AD6\u3002"></textarea></label>
      <div class="qb-actions qb-review-decisions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="decide" data-decision="approved">${g("check",13)}<span>\u6838\u51C6</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="decide" data-decision="changes_requested">${g("edit",13)}<span>\u9000\u56DE\u4FEE\u6539</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-qb-action="decide" data-decision="rejected">${g("x",13)}<span>\u62D2\u7D55</span></button>
      </div>
    </form>
    ${zl(e)}
  </article>`}function Nm(){return`<div class="qb-empty qb-empty-block qb-review-placeholder">
    <span class="qb-empty-icon">${g("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>\u5F9E\u5DE6\u5074\u9078\u64C7\u984C\u76EE</strong>
      <p>\u9EDE\u9078\u984C\u76EE\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u984C\u5E79\u3001\u9810\u671F\u6A19\u8A3B\u3001\u53C3\u8003\u7B54\u6848\u8207\u6838\u51C6\u9078\u9805\u3002</p>
    </div>
  </div>`}function Rm(e){let t=e.reviewDetail,s=Mm(e),a=e.reviewFilter||"queue",n=Gl.map(([l,d])=>`<button class="chip qb-review-tab${a===l?" is-active":""}" type="button" role="tab" aria-selected="${a===l?"true":"false"}" data-qb-action="review-filter" data-filter="${l}"><span>${d}</span><span class="qb-review-tab-count">${c(s[l]||0)}</span></button>`).join(""),i=e.reviewItems.length?e.reviewItems.map(l=>Tm(l,Number(t?.id)===Number(l.id))).join(""):`<div class="qb-empty qb-empty-compact">${g("info",16)}<span>\u76EE\u524D\u6C92\u6709${r(jm(a))}\u984C\u76EE\u3002</span></div>`,o=t?Em(t):e.reviewItems.length?Nm():Lm(e,s);return`<section class="report-card qb-card qb-review-card">
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
  </section>`}function La(e){if(e==null||e==="")return"";let t=Number(e);return Number.isFinite(t)?`${Math.round(t*100)}%`:""}function Cm(e){if(!e||typeof e!="object")return"\u5F15\u7528";let t=String(e.jid||"").trim();if(t)return t;let s=String(e.law_name||"").trim(),a=String(e.article_no||"").trim(),n=`${s} ${a}`.trim();return n||String(e.title||e.text||"\u5F15\u7528").slice(0,80)}function Pm(e){let t=e?.metrics||{},s=t.scores||{},a=[["\u6CD5\u898F\u53EC\u56DE",La(t.law_recall)],["\u689D\u6587\u53EC\u56DE",La(t.article_recall)],["\u898F\u5247\u5206",La(s.deterministic)],["Judge",La(s.judge)],["\u4EBA\u5DE5",La(s.human)]].filter(([,n])=>n);return a.length?`<div class="qb-bank-stats">${a.map(([n,i])=>`<span class="qb-bank-stat"><span>${r(n)}</span><strong>${r(i)}</strong></span>`).join("")}</div>`:""}function Im(e){let t=Array.isArray(e?.law_sources)?e.law_sources:[],s=Array.isArray(e?.citations)?e.citations:[],a=t.length?`<div class="qb-bank-sources">${t.map(i=>{let o=String(i.law_name||"\u672A\u547D\u540D\u6CD5\u898F"),l=(i.articles||[]).map(p=>String(p.article_no||"").trim()).filter(Boolean),d=`<strong>${r(o)}</strong>${l.length?`<small>${r(l.join("\u3001"))}</small>`:""}`;return i.law_url?`<a class="qb-bank-law" href="${r(Et(i.law_url))}" target="_blank" rel="noreferrer">${d}</a>`:`<span class="qb-bank-law">${d}</span>`}).join("")}</div>`:"",n=s.length?`<div class="qb-bank-sources qb-bank-citations">${s.map(i=>`<span class="chip chip-mono">${r(Cm(i))}</span>`).join("")}</div>`:"";return!a&&!n?"":`<div class="qb-bank-answer-block">
    <div class="qb-bank-section-label"><span>\u5F15\u7528\u4F86\u6E90</span><span>${c(t.length+s.length)} \u7B46</span></div>
    ${a}${n}
  </div>`}function Ql(e,t){if(!e)return`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${g("history",20)}</span>
      <strong>\u5C1A\u7121 RAG \u7B54\u6848</strong>
      <span>\u8DD1\u4E00\u6B21 Benchmark \u5F8C\uFF0C\u6700\u8FD1\u4E00\u6B21\u6210\u529F\u56DE\u7B54\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</span>
    </div>`;let s=Number(e.item_version||0),a=Number(t?.version||0),n=s&&a&&s!==a?`<span class="badge badge-warn">\u7B54\u6848 v${s} \xB7 \u984C\u76EE v${a}</span>`:"",i=e.answer_source==="llm"?"LLM \u751F\u6210":e.answer_source==="structured"?"\u6CD5\u898F\u8CC7\u6599\u5EAB":String(e.answer_source||"RAG");return`<div class="qb-bank-answer-meta">
      <span class="badge badge-ok"><span class="status-dot is-ok"></span>RAG \u5B8C\u6210</span>
      <span class="badge badge-neutral">${r(i)}</span>
      ${n}
      <span class="mono">${r(e.run_label||e.run_id||"")}</span>
      <span>${r(ye(e.finished_at))}</span>
      <span>${r(fe(e.duration_ms))}</span>
      ${e.llm_model?`<span class="mono">${r(e.llm_model)}</span>`:""}
    </div>
    <div class="qb-bank-answer-block">
      <div class="qb-bank-section-label"><span>\u56DE\u7B54</span><span>${c(String(e.answer||"").length)} \u5B57</span></div>
      <p class="qb-bank-answer-text">${r(String(e.answer||"").trim()||"\uFF08\u7A7A\u767D\u56DE\u7B54\uFF09")}</p>
    </div>
    ${Im(e)}
    ${Pm(e)}`}function Jl(e,t){let s=e.selectedSuiteId,a=t&&e.suiteAnswers?.[String(s)]?.[String(t.id)]||null;return t?`<div class="qb-bank-answer-head">
      <div class="qb-bank-answer-heading">
        <span class="qb-bank-answer-kicker">${g("sparkles",12)}RAG \u6700\u8FD1\u4E00\u6B21\u7B54\u6848</span>
        <strong class="qb-bank-answer-question">#${t.id} ${r(t.question)}</strong>
      </div>
      ${a?`<span class="qb-bank-answer-state">${r(ns[t.question_type]||t.question_type)} \xB7 v${t.version}</span>`:""}
    </div>
    ${Ql(a,t)}`:`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${g("cube",20)}</span>
      <strong>\u9078\u64C7\u984C\u76EE</strong>
      <span>\u5F9E\u5DE6\u5074\u6E05\u55AE\u9078\u64C7\u4E00\u984C\uFF0C\u67E5\u770B\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`}function Vl(e){return`<span class="qb-bank-actions">
    <button class="qb-bank-icon" type="button" data-qb-action="edit" data-id="${e.id}" title="\u7DE8\u8F2F\u984C\u76EE" aria-label="\u7DE8\u8F2F\u984C\u76EE #${e.id}">${g("edit",13)}</button>
    <button class="qb-bank-icon is-danger" type="button" data-qb-action="delete" data-id="${e.id}" title="\u5F9E\u984C\u5EAB\u79FB\u9664" aria-label="\u5F9E\u984C\u5EAB\u79FB\u9664 #${e.id}">${g("trash",13)}</button>
  </span>`}function Dm(e,t,{selected:s,hasAnswer:a}){return`<div class="qb-bank-row${s?" is-active":""}" data-id="${e.id}">
    <button class="qb-bank-select" type="button" data-qb-action="select-bank-item" data-id="${e.id}" aria-pressed="${s?"true":"false"}">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <span class="qb-bank-item-copy">
        <strong>${r(e.question)}</strong>
        <small>${r(ns[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${a?"\u5DF2\u6709 RAG \u7B54\u6848":"\u5C1A\u7121 RAG \u7B54\u6848"}</small>
      </span>
    </button>
    ${Vl(e)}
  </div>`}function Bm(e,t,s){return`<article class="qb-bank-full-item" data-id="${e.id}">
    <div class="qb-bank-full-head">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <div class="qb-bank-full-title">
        <strong>${r(e.question)}</strong>
        <small>${r(ns[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${r(ii[e.status]?.label||e.status||"")}</small>
      </div>
      ${Vl(e)}
    </div>
    ${Ql(s,e)}
  </article>`}function Hl(e){let t=e.editingSuite,s=Array.isArray(e.suites)?e.suites:[],a=s.find(u=>Number(u.id)===Number(e.selectedSuiteId))||s[0]||null,n=Array.isArray(a?.items)?a.items:[],i=e.suiteAnswers?.[String(a?.id)]||{},o=n.find(u=>Number(u.id)===Number(e.selectedBankItemId))||null,l=!!e.suiteAnswersLoading,d=String(e.suiteAnswersError||""),p=!!e.suiteManageOpen||!s.length,f=e.bankTab==="full"?"full":"split",$=s.length?`<div class="qb-bank-tabs" role="tablist" aria-label="Benchmark \u984C\u5EAB\u6AA2\u8996">
        <button class="qb-bank-tab${f==="split"?" is-active":""}" type="button" role="tab" aria-selected="${f==="split"?"true":"false"}" data-qb-action="bank-tab" data-tab="split">${g("grid",13)}<span>Benchmark \u984C\u5EAB</span><span class="badge badge-neutral">${c(n.length)}</span></button>
        <button class="qb-bank-tab${f==="full"?" is-active":""}" type="button" role="tab" aria-selected="${f==="full"?"true":"false"}" data-qb-action="bank-tab" data-tab="full">${g("table",13)}<span>\u984C\u5EAB\u5168\u5217\u8868</span><span class="badge badge-neutral">${c(n.length)}</span></button>
      </div>`:"",h="";if(!s.length)h=`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${g("cube",20)}</span>
      <strong>\u5C1A\u672A\u5EFA\u7ACB Benchmark \u984C\u5EAB</strong>
      <span>\u5C55\u958B\u4E0B\u65B9 Suite \u8A2D\u5B9A\u4E26\u5EFA\u7ACB\u984C\u5EAB\u5F8C\uFF0C\u5C31\u80FD\u5728\u9019\u88E1\u700F\u89BD\u984C\u76EE\u8207\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`;else if(l)h='<div class="qb-bank-loading"><span class="spinner" aria-hidden="true"></span><span>\u8B80\u53D6\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u4E2D\u2026</span></div>';else{let u=d?Oe({tone:"warn",title:"\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u8B80\u53D6\u5931\u6557",text:r(d)}):"";f==="full"?h=`${u}<div class="qb-bank-full" data-qb-bank-view="full">${n.length?n.map((b,_)=>Bm(b,_,i[String(b.id)]||null)).join(""):ja("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>`:h=`${u}<div class="qb-bank-split" data-qb-bank-view="split">
        <div class="qb-bank-list" data-qb-bank-list>${n.length?n.map((b,_)=>Dm(b,_,{selected:Number(b.id)===Number(o?.id),hasAnswer:!!i[String(b.id)]})).join(""):ja("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>
        <div class="qb-bank-answer-pane" data-qb-bank-answer>${Jl(e,o)}</div>
      </div>`}return`<section class="report-card qb-card qb-bank-card">
    <div class="side-card-head qb-bank-head">
      <div class="qb-bank-heading">
        <span class="side-card-title">${g("cube",14)}Benchmark \u984C\u5EAB</span>
        <span class="qb-bank-sub">${a?`${r(a.name)} \xB7 v${a.version} \xB7 ${c(a.item_count)} \u984C`:"\u5C1A\u672A\u5EFA\u7ACB suite"}</span>
      </div>
      <div class="qb-bank-controls">
        ${s.length?`<label class="qb-suite-picker"><span>Suite</span><select class="select" data-qb-suite-select aria-label="\u9078\u64C7 benchmark suite">${s.map(u=>`<option value="${u.id}" ${Number(u.id)===Number(a?.id)?"selected":""}>${r(u.name)} \xB7 ${c(u.item_count)} \u984C</option>`).join("")}</select></label>`:""}
        ${a?`<span class="badge ${a.status==="frozen"?"badge-ok":"badge-neutral"}">${a.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>`:""}
      </div>
    </div>
    ${$}
    ${h}
    <details class="qb-suite-manage" ${p?"open":""}>
      <summary>${g("sliders",14)}Suite \u8A2D\u5B9A\u8207\u7248\u672C <span class="qb-muted">${c(s.length)} \u500B suite \xB7 ${c(e.ready.length)} \u984C benchmark-ready</span></summary>
      <div class="qb-suite-manage-body">
        <form class="qb-suite-form" data-qb-form="suite">
          <input type="hidden" name="suite_id" value="${t?.id||""}" />
          <div class="qb-form-grid">
            <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${r(t?.name||"Pilot 30")}" /></label>
            <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(Fl).map(([u,b])=>`<option value="${u}" ${t?.tier===u?"selected":""}>${b}</option>`).join("")}</select></label>
          </div>
          <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${r(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
          <div class="qb-check-list">
            ${e.ready.length?e.ready.map(u=>{let b=t?t.items?.some(_=>Number(_.id)===Number(u.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${u.id}" ${b?"checked":""}/><span><strong>#${u.id}</strong> ${r(u.question)} <small>${r(ns[u.question_type]||u.question_type)}</small></span></label>`}).join(""):ja("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
          </div>
          <div class="qb-actions">
            <button class="btn btn-primary" type="submit">${g("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
            ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
          </div>
        </form>
        <div class="qb-list">
          ${s.length?s.map(u=>`<article class="qb-suite">
            <div class="qb-item-head">
              <div class="qb-item-title"><strong>${r(u.name)}</strong><span class="qb-meta">${r(Fl[u.tier]||u.tier)} \xB7 v${u.version} \xB7 ${c(u.item_count)} \u984C</span></div>
              <span class="badge ${u.status==="frozen"?"badge-ok":"badge-neutral"}">${u.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
            </div>
            <div class="qb-suite-items">${(u.items||[]).slice(0,8).map(b=>`<span class="chip">#${b.id} ${r(b.question.slice(0,22))}${b.question.length>22?"\u2026":""}</span>`).join("")}${u.item_count>8?`<span class="qb-muted">+${u.item_count-8}</span>`:""}</div>
            <div class="qb-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${u.id}">${g("edit",13)}<span>\u7DE8\u8F2F suite</span></button>
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${u.id}">${g("shield",13)}<span>\u51CD\u7D50</span></button>
              <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${u.id}">${g("trash",13)}<span>\u522A\u9664</span></button>
            </div>
          </article>`).join(""):ja("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
        </div>
      </div>
    </details>
  </section>`}function Fm(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),n=Number(a?.value);Number.isFinite(n)&&(t[s]=Math.max(1,Math.min(5,Math.round(n))))}return t}function Om(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:mm(t.get("expected_laws")),expected_articles:gm(t.get("expected_articles")),expected_judgments:fm(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function Wl(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},n={tab:"",editing:null,editingFrom:"",editingSuite:null,aiQuestion:"",aiLoading:!1,aiResult:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tags:[]},stats:{},suites:[],ready:[],selectedSuiteId:null,selectedBankItemId:null,bankTab:"split",suiteAnswers:{},suiteAnswersLoading:!1,suiteAnswersError:"",suiteManageOpen:!1,reviewItems:[],reviewDetail:null,reviewFilter:"queue"},i=P=>e.querySelector(`#quality-panel-${a[P]}`),o=(P,B)=>{P&&(P.childElementCount?P.setAttribute("aria-busy","true"):P.innerHTML=`<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>${B}</span></div></section>`)},l=P=>{P?.removeAttribute("aria-busy")},d=0,p=null,f=()=>"anonymous",$=()=>{s&&s(n.stats)},h=P=>{t&&t(P),de(P)},u=async()=>{try{n.stats=await J.questionBankStats()}catch{n.stats={}}$()},b=()=>{let P=i("create");P&&(P.innerHTML=km(n.editing,n))},_=(P,B)=>{let G=P?.querySelector("[data-qb-tag-results]");G&&(G.innerHTML=B.length?B.map(R=>`<button class="qb-tag-option" type="button" role="option" data-qb-action="select-tag" data-tag="${r(R.tag)}"><span>${r(R.tag)}</span><small>${c(R.count)}</small></button>`).join(""):'<div class="qb-tag-empty">\u6C92\u6709\u5176\u4ED6\u76F8\u7B26\u6A19\u7C64</div>')},k=async(P,B="")=>{if(!P)return;let G=P.querySelector("[data-qb-tag-results]"),R=++d;G&&(G.innerHTML='<div class="qb-tag-loading"><span class="spinner"></span><span>\u641C\u5C0B\u6A19\u7C64\u2026</span></div>');try{let H=await J.questionBankTags(B,12);if(R!==d)return;let Q=(H.tags||[]).filter(_e=>!n.filters.tags.includes(_e.tag));_(P,Q)}catch(H){if(R!==d)return;G&&(G.innerHTML=`<div class="qb-tag-empty">${r(H.message||"\u6A19\u7C64\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},A=(P,{focus:B=!1}={})=>{if(!P)return;let G=P.querySelector("[data-qb-tag-popover]"),R=P.querySelector("[data-qb-tag-search]");!G||!R||(G.hidden&&(G.hidden=!1,R.value="",k(P,"")),B&&(R.focus(),R.select()))},S=P=>{p&&(window.clearTimeout(p),p=null);let B=P?.querySelector("[data-qb-tag-popover]");B&&(B.hidden=!0)},v=async P=>{let B=String(P||"").trim();B&&(n.filters.tags.includes(B)?n.filters.tags=n.filters.tags.filter(G=>G!==B):n.filters.tags=[...n.filters.tags,B],n.offset=0,await q())},j=()=>{let P=Array.isArray(n.suites)?n.suites:[];if(!P.length)return n.selectedSuiteId=null,n.selectedBankItemId=null,null;let B=P.find(R=>Number(R.id)===Number(n.selectedSuiteId));B||(B=P[0],n.selectedSuiteId=B.id,n.selectedBankItemId=null);let G=Array.isArray(B.items)?B.items:[];return G.some(R=>Number(R.id)===Number(n.selectedBankItemId))||(n.selectedBankItemId=G[0]?.id??null),B},W=()=>{let P=i("suite");P&&(P.innerHTML=Hl(n))},Y=0,we=async(P,{force:B=!1}={})=>{if(!P)return;let G=++Y;if(!B&&n.suiteAnswers[String(P)]){n.suiteAnswersLoading=!1,n.suiteAnswersError="",W();return}n.suiteAnswersLoading=!0,n.suiteAnswersError="",W();try{let R=await J.benchmarkSuiteLatestAnswers(P);if(G!==Y)return;n.suiteAnswers[String(P)]=R.answers||{}}catch(R){if(G!==Y)return;n.suiteAnswersError=R.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}finally{G===Y&&(n.suiteAnswersLoading=!1,W())}},be=async P=>{n.selectedSuiteId=P,n.selectedBankItemId=null,n.suiteAnswersError="";let B=j();if(!B){W();return}await we(B.id)},ne=P=>{n.bankTab=P==="full"?"full":"split",W()},M=()=>{let P=i("suite");if(!P)return;let B=j(),R=(Array.isArray(B?.items)?B.items:[]).find(Q=>Number(Q.id)===Number(n.selectedBankItemId))||null;for(let Q of P.querySelectorAll(".qb-bank-row")){let _e=Number(Q.dataset.id)===Number(n.selectedBankItemId);Q.classList.toggle("is-active",_e);let Te=Q.querySelector("[data-qb-action='select-bank-item']");Te&&Te.setAttribute("aria-pressed",_e?"true":"false")}let H=P.querySelector("[data-qb-bank-answer]");H&&(H.innerHTML=Jl(n,R))},q=async()=>{let P=i("manage");if(P){p&&(window.clearTimeout(p),p=null),o(P,"\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026");try{let B=await J.questionBankItems({...n.filters,...n.filters.status==="retired"?{include_deleted:!0}:{}},n.limit,n.offset);n.items=B.items||[],n.total=Number(B.total||0),n.stats=B.stats||n.stats,l(P),P.innerHTML=qm(n),$()}catch(B){l(P),P.innerHTML=`<section class="report-card qb-card">${Oe({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(B.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},T=async({refreshAnswers:P=!1}={})=>{let B=i("suite");if(B){o(B,"\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026");try{let[G,R]=await Promise.all([J.benchmarkSuites(),J.benchmarkReadyQuestions(300)]);n.suites=G.suites||[],n.ready=R.items||[];let H=j();if(n.suiteAnswersError="",n.suiteAnswersLoading=!1,H&&(P||!n.suiteAnswers[String(H.id)]))try{let Q=await J.benchmarkSuiteLatestAnswers(H.id);n.suiteAnswers[String(H.id)]=Q.answers||{}}catch(Q){n.suiteAnswersError=Q.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}l(B),B.innerHTML=Hl(n)}catch(G){l(B),B.innerHTML=`<section class="report-card qb-card">${Oe({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(G.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},X=()=>{let P=i("review");P&&(P.innerHTML=Rm(n))},me=async P=>{let B=n.reviewItems.find(R=>Number(R.id)===Number(P));if(!B)return;n.reviewDetail=B,X();let G=i("review")?.querySelector(".qb-review-detail-pane");G&&window.matchMedia("(max-width: 1020px)").matches&&G.scrollIntoView({behavior:"smooth",block:"start"});try{let R=await J.questionBankItem(B.id);Number(n.reviewDetail?.id)===Number(B.id)&&(n.reviewDetail=R,X())}catch(R){N(R.message||"\u984C\u76EE\u5167\u5BB9\u8B80\u53D6\u5931\u6557\u3002","danger")}},V=async()=>{let P=i("review");if(!P)return;o(P,"\u8B80\u53D6\u9A57\u6536\u984C\u76EE\u4E2D\u2026");let B=n.reviewFilter||"queue",G=B==="queue"?["pending_review","changes_requested"]:B==="accepted"?["accepted"]:B==="rejected"?["rejected"]:["draft"];try{let R=await Promise.all(G.map(Te=>J.questionBankItems({status:Te},200,0)));n.reviewItems=R.flatMap(Te=>Te.items||[]),n.stats=R[0]?.stats||n.stats;let H=Number(n.reviewDetail?.id||0),_e=n.reviewItems.some(Te=>Number(Te.id)===H)?H:Number(n.reviewItems[0]?.id||0);n.reviewDetail=_e?await J.questionBankItem(_e):null,l(P),X(),$()}catch(R){l(P),P.innerHTML=`<section class="report-card qb-card">${Oe({tone:"danger",title:"\u9A57\u6536\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:r(R.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}};function de(P){let B=n.tab;n.tab=P;for(let G of Object.keys(a)){let R=i(G);R&&(R.hidden=G!==P)}P==="create"?(B!=="create"&&!n.editing&&(n.aiQuestion="",n.aiResult=null),b()):P==="manage"?q():P==="suite"?T():P==="review"&&V()}let Ae=P=>{let G=[...n.items,...n.reviewItems,...n.reviewDetail?[n.reviewDetail]:[]].find(H=>Number(H.id)===Number(P));n.reviewDetail=G||{id:Number(P)};let R=G?.status;["accepted","rejected","draft"].includes(R)?n.reviewFilter=R:R&&(n.reviewFilter="queue"),h("review")},I=async P=>{let B=Om(P),G=Number(P.elements.item_id?.value||0);G||(B.status=P.elements.submit_for_review?.checked?"pending_review":"draft");try{G?(await J.updateQuestionBankItem(G,{...B,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),N("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await J.createQuestionBankItem(B),N(B.status==="draft"?"\u984C\u76EE\u5DF2\u5B58\u70BA\u8349\u7A3F\uFF0C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002":"\u984C\u76EE\u5DF2\u5EFA\u7ACB\u4E26\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok")),n.editing=null;let R=["manage","suite","review"].includes(n.editingFrom)?n.editingFrom:"manage";n.editingFrom="",n.suiteAnswers={},await u(),h(R)}catch(R){let H=R.detail||R.payload?.detail,Q=H?.errors?.join(" \xB7 ")||H?.message||R.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";N(Q,"danger",8e3)}},Se=async P=>{let B=String(new FormData(P).get("question")||"").trim();if(B.length<4){N("\u984C\u76EE\u81F3\u5C11\u9700\u8981 4 \u500B\u5B57\u3002","danger");return}n.aiQuestion=B,n.aiLoading=!0,n.aiResult=null,b();try{let G=await J.createQuestionBankItemWithAI({question:B});n.aiResult=G,n.aiQuestion="",await u(),N(`llama-server \u5DF2\u5EFA\u7ACB\u984C\u76EE #${G.item.id}\uFF0C\u72C0\u614B\u70BA\u5F85\u5BE9\uFF0C\u8ACB\u4EBA\u5DE5\u8986\u6838\u3002`,"ok",8e3)}catch(G){let R=G.detail||G.payload?.detail,H=R?.errors?.join(" \xB7 ")||R?.message||G.message||"llama-server \u7522\u751F\u5931\u6557\u3002";N(H,"danger",12e3)}finally{n.aiLoading=!1,b()}},oe=async(P,B)=>{let G=Number(P.dataset.id||0);if(G)try{await J.reviewQuestionBankItem(G,{decision:B,reviewer:f(),rubric_scores:Fm(P),comment:String(P.querySelector('[name="comment"]')?.value||"")}),N(B==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":B==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",B==="approved"?"ok":"info"),await u(),await V()}catch(R){let H=R.detail||R.payload?.detail,Q=H?.errors?.join(" \xB7 ")||H?.message||R.message||"\u9A57\u6536\u5931\u6557\u3002";N(Q,"danger",8e3)}},ke=async P=>{let B=new FormData(P),G=Number(B.get("suite_id")||0),R=Array.from(P.querySelectorAll('input[name="item_ids"]:checked')).map(Q=>Number(Q.value)),H={name:String(B.get("name")||"").trim(),tier:String(B.get("tier")||"core"),description:String(B.get("description")||"").trim(),item_ids:R};try{G?(await J.updateBenchmarkSuite(G,H),N("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await J.createBenchmarkSuite(H),N("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),n.editingSuite=null,n.suiteManageOpen=!0,n.suiteAnswers={},await T()}catch(Q){let _e=Q.detail||Q.payload?.detail,Te=_e?.errors?.join(" \xB7 ")||_e?.message||Q.message||"Suite \u5132\u5B58\u5931\u6557\u3002";N(Te,"danger",8e3)}},Re=async P=>{let B=e.querySelector("[data-qb-tag-filter] [data-qb-tag-popover]:not([hidden])")?.closest("[data-qb-tag-filter]");B&&!P.target.closest("[data-qb-tag-filter]")&&S(B);let G=P.target.closest("[data-qb-action]")?.dataset.qbAction;if(!G)return;let R=P.target.closest("[data-qb-action]"),H=Number(R.dataset.id||0);if(G==="open-tag-search"){let Q=R.closest("[data-qb-tag-filter]");A(Q,{focus:!0});return}if(G==="select-tag"){await v(R.dataset.tag);return}if(G==="remove-tag"){await v(R.dataset.tag);return}if(G==="bank-tab"){ne(R.dataset.tab);return}if(G==="select-bank-item"){n.selectedBankItemId=H,M();return}if(G==="new"){n.editing=null,n.editingFrom="",n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,h("create");return}if(G==="reset-create"){n.editing=null,b();return}if(G==="reset-ai"){n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,b();return}if(G==="edit"){let Q=n.suites.find(dt=>Number(dt.id)===Number(n.selectedSuiteId)),Te=[...n.items,...n.reviewItems,...Q?.items||[],...n.reviewDetail?[n.reviewDetail]:[]].find(dt=>Number(dt.id)===H);if(!Te)return;let Ye=Te;try{Ye=await J.questionBankItem(H)}catch{Ye=Te}n.editing=Ye||Te,n.editingFrom=n.tab,h("create");return}if(G==="review"){Ae(H);return}if(G==="review-ai-item"){let Q=n.aiResult?.item;if(!Q)return;n.reviewFilter="queue",n.reviewDetail=Q,h("review");return}if(G==="review-filter"){let Q=String(R.dataset.filter||"queue");n.reviewFilter=["queue","accepted","rejected","draft"].includes(Q)?Q:"queue",n.reviewDetail=null,await V();return}if(G==="select-review-item"){await me(H);return}if(G==="go-manage"){h("manage");return}if(G==="submit-review"){try{await J.submitQuestionBankItemForReview(H),N("\u5DF2\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok"),await u(),n.tab==="manage"?await q():n.tab==="review"&&await V()}catch(Q){let _e=Q.detail||Q.payload?.detail,Te=_e?.errors?.join(" \xB7 ")||_e?.message||Q.message||"\u9001\u5BE9\u5931\u6557\u3002";N(Te,"danger",8e3)}return}if(G==="restore"){if(!window.confirm(`\u78BA\u5B9A\u5FA9\u539F\u984C\u76EE #${H}\uFF1F\u5FA9\u539F\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\u72C0\u614B\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002`))return;try{await J.restoreQuestionBankItem(H),N("\u984C\u76EE\u5DF2\u5FA9\u539F\u4E26\u56DE\u5230\u5F85\u5BE9\u3002","ok"),await u(),await q()}catch(Q){let _e=Q.detail||Q.payload?.detail,Te=_e?.errors?.join(" \xB7 ")||_e?.message||Q.message||"\u5FA9\u539F\u5931\u6557\u3002";N(Te,"danger",8e3)}return}if(G==="delete"){if(n.tab==="suite"){let Q=j();if(!Q||!(Q.items||[]).find(Te=>Number(Te.id)===H)||!window.confirm(`\u78BA\u5B9A\u5F9E\u300C${Q.name}\u300D\u79FB\u9664\u984C\u76EE #${H}\uFF1F\u984C\u76EE\u4ECD\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u7BA1\u7406\u4E2D\u3002`))return;try{await J.removeBenchmarkSuiteItem(Q.id,H),N("\u5DF2\u5F9E Benchmark \u984C\u5EAB\u79FB\u9664\u3002","info"),delete n.suiteAnswers[String(Q.id)],Number(n.selectedBankItemId)===H&&(n.selectedBankItemId=null),await T()}catch(Te){N(Te.message||"\u79FB\u9664\u5931\u6557\u3002","danger")}return}if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${H}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await J.deleteQuestionBankItem(H),N("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await u(),n.tab==="review"?(n.reviewDetail=null,await V()):await q()}catch(Q){N(Q.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(G==="revalidate"){try{let Q=await J.revalidateQuestionBank();N(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${c(Q.checked||0)} \u984C\uFF0C${c(Q.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await u(),await q()}catch(Q){N(Q.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(G==="export"){try{let Q=await J.exportQuestionBank({status:""});Ht(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(Q,null,2),"application/json;charset=utf-8")}catch(Q){N(Q.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(G==="import-json"){let Q=e.querySelector("#qb-import-json");try{let _e=JSON.parse(String(Q?.value||"").trim()),Te=await J.importQuestionBank(_e);N(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${Te.created}\u3001\u66F4\u65B0 ${Te.updated}\u3001\u932F\u8AA4 ${(Te.errors||[]).length}\u3002`,(Te.errors||[]).length?"warn":"ok",8e3),Q&&(Q.value=""),await u(),await q()}catch(_e){N(_e.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(G==="prev"||G==="next"){n.offset=Math.max(0,n.offset+(G==="next"?n.limit:-n.limit)),await q();return}if(G==="suite-edit"){let Q=n.suites.find(_e=>Number(_e.id)===H);if(!Q)return;n.editingSuite=Q,n.suiteManageOpen=!0,T();return}if(G==="suite-new"){n.editingSuite=null,n.suiteManageOpen=!0,T();return}if(G==="suite-freeze"){try{await J.updateBenchmarkSuite(H,{freeze:!0}),N("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),n.editingSuite=null,n.suiteManageOpen=!0,await T()}catch(Q){N(Q.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(G==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${H}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await J.deleteBenchmarkSuite(H),N("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),n.editingSuite=null,n.suiteAnswers={},n.suiteManageOpen=!0,await T()}catch(Q){N(Q.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(G==="decide"){let Q=R.closest("form[data-qb-form='review']");Q&&await oe(Q,String(R.dataset.decision||""))}},Me=async P=>{let B=P.target.closest("[data-qb-form]");if(!B)return;P.preventDefault();let G=B.dataset.qbForm;if(G==="create")await I(B);else if(G==="ai-create")await Se(B);else if(G==="filter"){let R=new FormData(B);n.filters={query:String(R.get("query")||"").trim(),status:String(R.get("status")||""),question_type:String(R.get("question_type")||""),difficulty:String(R.get("difficulty")||""),tags:R.getAll("tags").map(H=>String(H).trim()).filter(Boolean)},n.offset=0,await q()}else G==="suite"&&await ke(B)},Pe=async P=>{let B=P.target.closest?.("form[data-qb-form='filter'] select");if(B){B.form.requestSubmit();return}let G=P.target.closest?.("[data-qb-suite-select]");if(!G)return;let R=Number(G.value||0);!R||R===Number(n.selectedSuiteId)||await be(R)},ge=P=>{let B=P.target;B?.matches?.(".qb-suite-manage")&&(n.suiteManageOpen=!!B.open)},ee=P=>{let B=P.target.closest?.("[data-qb-action='open-tag-search']");B&&A(B.closest("[data-qb-tag-filter]"))},ue=P=>{let B=P.target.closest?.("[data-qb-tag-filter]");B&&(P.relatedTarget&&B.contains(P.relatedTarget)||S(B))},ve=P=>{let B=P.target.closest?.("[data-qb-tag-search]");if(!B)return;let G=B.closest("[data-qb-tag-filter]");p&&window.clearTimeout(p),p=window.setTimeout(()=>{k(G,B.value)},160)},qe=P=>{let B=P.target.closest?.("[data-qb-tag-search]");if(!B)return;let G=B.closest("[data-qb-tag-filter]");P.key==="Escape"?(P.preventDefault(),S(G),B.blur()):P.key==="Enter"?(P.preventDefault(),G?.querySelector("[data-qb-action='select-tag']")?.click()):P.key==="ArrowDown"&&(P.preventDefault(),G?.querySelector("[data-qb-action='select-tag']")?.focus())};e.addEventListener("click",Re),e.addEventListener("submit",Me),e.addEventListener("change",Pe),e.addEventListener("toggle",ge,!0),e.addEventListener("mouseover",ee),e.addEventListener("mouseout",ue),e.addEventListener("input",ve),e.addEventListener("keydown",qe);let Be=async()=>{await u(),n.tab==="create"?b():n.tab==="manage"?await q():n.tab==="suite"?await T({refreshAnswers:!0}):n.tab==="review"&&await V()};return u(),{show:de,refresh:Be,destroy(){p&&window.clearTimeout(p),e.removeEventListener("click",Re),e.removeEventListener("submit",Me),e.removeEventListener("change",Pe),e.removeEventListener("toggle",ge,!0),e.removeEventListener("mouseover",ee),e.removeEventListener("mouseout",ue),e.removeEventListener("input",ve),e.removeEventListener("keydown",qe)},getStats:()=>n.stats}}function En(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function Kl(e){return e==null?"\u2014":c(e)}function Hm(e){return e.count?e.severity==="danger"?Ke("failed","\u9700\u8655\u7406"):e.severity==="warn"?Ke("warning","\u6CE8\u610F"):Ke("preview","\u63D0\u793A"):Ke("success","\u901A\u904E")}function zm(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function Um(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${zm(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${r(e.label)}</span>
      ${Hm(e)}
    </div>
    <div class="quality-check-value">
      <strong>${c(t)}</strong>
      <span>\u7B46</span>
      <em>${r(En(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${r(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function Tn(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
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
  </div>`}function Gm(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},n=Number(s.matched_unique_jids??s.matched_rows??0),i=Number(s.matched_rows??n),o=Math.max(0,i-n),l=t.postgres_diff,d=l==null?"\u2014":l===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\uFF08\u53BB\u91CD JID\uFF09\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\uFF08\u53BB\u91CD JID\uFF09\u76F8\u5DEE ${c(Math.abs(l))} \u7B46`,p=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${c(t.vector_indexed)} / ${c(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${g("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\uFF08\u53BB\u91CD JID\uFF09</span></div>
      <div class="metric-value">${c(n)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u542B\u91CD\u8907 ${c(i)} \u7B46${o?`\uFF0C\u91CD\u8907 ${c(o)} \u7B46`:""}\uFF1B\u5171 ${c(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${g("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${Kl(t.postgres_judgments)}</div>
      <div class="metric-foot">${r(d)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${g("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${r(En(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${r(p)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${g("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${Kl(a.candidate_total)}</div>
      <div class="metric-foot">${c(a.candidate_archive_count)} / ${c(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function Qm(e){return e.length?`<div class="table-wrap">
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
              <td class="cell-number">${r(En(t.match_rate))}</td>
              <td class="cell-number">${c(t.short_text_rows)}</td>
              <td class="cell-number">${c(s)}</td>
              <td class="cell-number">${c(t.duplicate_content_rows)}</td>
              <td class="cell-date">${r(Ft(t.date_min))} \u2013 ${r(Ft(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:ft({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function Jm(e){let t=e.totals||{},s=Number(t.matched_unique_jids??t.matched_rows??0),a=e.source||{},n=Array.isArray(e.checks)?e.checks:[],i=e.summary||{},o=e.distributions||{},l=Array.isArray(e.warnings)?e.warnings:[],d=Ne(a.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${Ke(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${c(t.rows)} \u7B46 \xB7 ${c(a.raw_files)} \u500B\u6A94\u6848 \xB7
          ${d} \xB7 \u6383\u63CF ${fe(e.scan_ms||0)} \xB7
          ${r(ye(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${g("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${l.length?`<div class="report-alert">${Oe({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:l.map(p=>r(p)).join("<br>")})}</div>`:""}
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
        <div class="summary-value">${r(En(t.match_rate))}</div>
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
      <div class="quality-checks">${n.map(Um).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${Gm(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${c(a.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${Qm(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${Tn("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",o.courts)}
        ${Tn("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",o.years)}
        ${Tn("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",o.laws)}
        ${Tn("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",o.titles)}
      </div>
    </div>
  </div>`}async function Vm(e){let t=zt(),s=`judgment.quality.snapshot.${t?"visitor":"admin"}`,a=()=>{try{let v=JSON.parse(window.localStorage.getItem(s)||"null");return!v?.snapshot||Date.now()-Number(v.saved_at||0)>600*1e3?null:v.snapshot}catch{return null}},n=v=>{if(v)try{window.localStorage.setItem(s,JSON.stringify({snapshot:v,saved_at:Date.now()}))}catch{}};e.innerHTML=`<section class="page data-page quality-page">
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
          ${g("refresh",15)}<span>${t?"\u91CD\u65B0\u6574\u7406":"\u91CD\u65B0\u6383\u63CF"}</span>
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
  </section>`;let i=e.querySelector("#quality-content"),o=e.querySelector("#quality-refresh"),l=e.querySelector("#quality-meta"),d=[...e.querySelectorAll("[data-quality-tab]")],p={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},f=null,$="overview",h=()=>{if(!f)return;i.innerHTML=Jm(f),l.textContent=`DUCKDB \xB7 ${c(f.totals?.rows)} \u7B46 \xB7 ${fe(f.scan_ms||0)}`;let v=e.querySelector("#quality-badge-overview");v&&(v.textContent=c(f.totals?.rows||0))},u=v=>{$=v==="overview"?"overview":v;for(let j of d){let W=j.dataset.qualityTab===$;j.classList.toggle("is-active",W),W?j.setAttribute("aria-current","page"):j.removeAttribute("aria-current")}for(let[j,W]of Object.entries(p))W&&(W.hidden=j!==$);$!=="overview"?l.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":f&&h()},b=Wl(e,{onNavigate:v=>u(v),onStats:v=>{let j=v||{},W=e.querySelector("#quality-badge-manage"),Y=e.querySelector("#quality-badge-suite"),we=e.querySelector("#quality-badge-review");W&&(W.textContent=c(j.total||0)),Y&&(Y.textContent=c(j.benchmark_ready||0)),we&&(we.textContent=c((j.pending_review||0)+(j.changes_requested||0)))}}),_=v=>{if(u(v),v!=="overview"){if(t){let j=p[v];j&&(j.innerHTML=Ts("\u984C\u5EAB\u7BA1\u7406\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u5B8C\u6574\u7684\u8CC7\u6599\u54C1\u8CEA\u7E3D\u89BD\uFF1B\u984C\u5EAB\u65B0\u589E\u3001\u7BA1\u7406\u3001Benchmark \u8207\u4EBA\u5DE5\u9A57\u6536\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002"));return}b.show(v)}},k=async({cached:v=!1}={})=>{Ee(o,!0,v?"\u6574\u7406\u4E2D\u2026":"\u6383\u63CF\u4E2D\u2026");try{f=await J.quality({cached:v}),n(f),h()}catch(j){i.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${Oe({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:r(j.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,l.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",N("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{Ee(o,!1)}},A=async()=>{$==="overview"?await k():await b.refresh()};o.addEventListener("click",A),e.addEventListener("click",v=>{let j=v.target.closest("[data-quality-tab]");j&&_(j.dataset.qualityTab||"overview")}),i.addEventListener("click",v=>{!v.target.closest("[data-action='export-quality']")||!f||Ht(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(f,null,2),"application/json;charset=utf-8")}),u("overview");let S=a();if(S&&(f=S,h()),t)for(let v of d){if(v.dataset.qualityTab==="overview")continue;v.classList.add("is-demo-locked"),v.removeAttribute("title"),v.dataset.demoLockTooltip="\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B\u984C\u5EAB\u7BA1\u7406";let j=v.querySelector(".badge");j&&(j.textContent="LOCK")}await k({cached:!0})}var mi={};rs(mi,{render:()=>Lg});var Nn={};rs(Nn,{render:()=>ui});var Yl={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function Xl(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${r(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${r(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function Wm(e){let t=e?.supports_chat,s=t===!0?"badge-ok":t===!1?"badge-danger":"badge-neutral",a=t===!0?"\u652F\u63F4 chat":t===!1?"\u4E0D\u652F\u63F4 chat":"\u672A\u6E2C\u8A66",n=(Array.isArray(e?.capabilities)?e.capabilities:[]).map(i=>`<span class="chip chip-mono">${r(i)}</span>`).join("");return`<div class="tests-llm-row">
    <div class="tests-llm-model">
      <strong class="mono">${r(e?.model||"\u2014")}</strong>
      <small>${r(e?.detail||"")}</small>
    </div>
    <div class="tests-llm-meta">
      <span class="badge ${s}">${a}</span>
      ${e?.tested_now?'<span class="badge badge-info">\u672C\u6B21\u65B0\u6E2C</span>':""}
      ${n}
      <span class="tests-llm-time">${e?.tested_at?`\u6E2C\u8A66\u65BC ${r(ye(e.tested_at))}`:"\u5C1A\u7121\u6E2C\u8A66\u7D00\u9304"}</span>
    </div>
  </div>`}function Km(e){let t=Array.isArray(e?.models)?e.models:[],s=e?.counts||{},a=Array.isArray(e?.failures)?e.failures:[];return{summary:e?`<span>llama-server <strong>${s.available??t.length}</strong> \u500B\u6A21\u578B</span>
      <span>\u652F\u63F4 chat <strong>${s.chat??0}</strong></span>
      <span>\u4E0D\u652F\u63F4 <strong>${s.unsupported??0}</strong></span>
      <span>\u672A\u6E2C\u8A66 <strong>${s.untested??0}</strong></span>
      <span>\u672C\u6B21\u65B0\u6E2C <strong>${(e.tested_now||[]).length}</strong></span>
      <span class="muted">${r(e.detail||"")}</span>`:"<span>\u6B63\u5728\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u2026</span>",list:t.length?t.map(Wm).join(""):'<div class="tests-llm-empty">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u8ACB\u78BA\u8A8D llama-server \u5DF2\u555F\u52D5\u4E26\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66\u3002</div>',failures:a.length?`<div class="tests-llm-failures">${a.map(i=>`<span><strong class="mono">${r(i.model||"\u2014")}</strong> ${r(i.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function Ym(e){let t=String(e?.status||"degraded"),s=t==="operational"?"badge-ok":t==="disabled"?"badge-neutral":"badge-danger",a=Array.isArray(e?.scores)?e.scores.slice(0,4):[],n=Array.isArray(e?.results)?e.results[0]:null;return`<div class="tests-llm-row">
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
  </div>`}function Xm(e){if(!e)return{summary:"<span>\u6B63\u5728\u8B80\u53D6 reranker \u72C0\u614B\u2026</span>",list:"",failures:""};let t=Array.isArray(e.providers)?e.providers:[],s=e.active||{},a=String(e.status||"degraded"),n=a==="operational"?"badge-ok":a==="not_configured"?"badge-neutral":"badge-danger",i=t.flatMap(o=>(o.errors||[]).map(l=>({model:o.url,detail:l})));return{summary:`<span>\u72C0\u614B <span class="badge ${n}">${r(a)}</span></span>
      <span>\u6A21\u578B <strong>${r(e.model||"\u2014")}</strong></span>
      <span>\u555F\u7528 <strong>${e.enabled?"true":"false"}</strong></span>
      ${s.url?`<span>\u4F5C\u7528\u4E2D <strong class="mono">${r(s.url)}</strong></span>`:""}
      <span class="muted">${r(e.detail||"")}</span>`,list:t.length?t.map(Ym).join(""):'<div class="tests-llm-empty">\u6C92\u6709\u8A2D\u5B9A RERANK_URL\uFF1B\u8ACB\u8A2D\u5B9A primary \u6216 fallback reranker\u3002</div>',failures:i.length?`<div class="tests-llm-failures">${i.map(o=>`<span><strong class="mono">${r(o.model||"\u2014")}</strong> ${r(o.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function Zm(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,total_ms:e.total_ms,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}:${a.duration_ms}`)}:null})}async function ui(e,t,{embedded:s=!1}={}){let a=!1,n=!1,i={embedding:[],llm:[]},o=!1,l=null,d=!1,p=null,f=!1,$=null,h=[],u="",b=null,_="",k=`<div class="page-actions">
      <span class="badge badge-neutral badge-mono" id="tests-mode-badge">\u8B80\u53D6\u4E2D</span>
      <button class="btn btn-secondary" type="button" id="tests-refresh">
        ${g("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
            <span class="field-help">\u672C\u6A5F 127.0.0.1 \u53EF\u76F4\u63A5\u4F7F\u7528\uFF1B\u900F\u904E cloudflared \u6216\u5176\u4ED6\u4E3B\u6A5F\u9023\u7DDA\u6642\uFF0C\u9060\u7AEF\u7BA1\u7406 API \u9700\u8981\u6B64\u6B0A\u6756\u3002\u6B0A\u6756\u53EA\u4FDD\u7559\u5728\u76EE\u524D\u5206\u9801\uFF0C\u95DC\u9589\u5206\u9801\u5F8C\u9700\u91CD\u65B0\u8F38\u5165\uFF1B\u4E5F\u4E0D\u6703\u9001\u5F80 ?api= \u6307\u5B9A\u7684\u4F4D\u5740\u3002</span>
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
  </section>`;let S=e.querySelector("#tests-mode-badge"),v=e.querySelector("#tests-mode-toggle"),j=e.querySelector("#tests-mode-summary"),W=e.querySelector("#tests-mode-models"),Y=e.querySelector("#tests-mode-status"),we=e.querySelector("#tests-api-form"),be=e.querySelector("#tests-api-input"),ne=e.querySelector("#tests-admin-token-input"),M=e.querySelector("#tests-api-preview"),q=e.querySelector("#tests-api-status"),T=e.querySelector("#tests-api-note"),X=e.querySelector("#tests-api-test"),me=e.querySelector("#tests-api-reset"),V=e.querySelector("#tests-api-save"),de=e.querySelector("#tests-refresh"),Ae=e.querySelector("#tests-flow"),I=e.querySelector("#tests-llm-summary"),Se=e.querySelector("#tests-llm-list"),oe=e.querySelector("#tests-llm-failures"),ke=e.querySelector("#tests-llm-status"),Re=e.querySelector("#tests-llm-test"),Me=e.querySelector("#tests-rerank-summary"),Pe=e.querySelector("#tests-rerank-list"),ge=e.querySelector("#tests-rerank-failures"),ee=e.querySelector("#tests-rerank-status"),ue=e.querySelector("#tests-rerank-test");ne&&(ne.value=Oa());let ve=(le,xe,We="")=>{le&&(le.textContent=xe,le.className=`tests-status${We?` is-${We}`:""}`)},qe=(le,xe="")=>{q&&(q.textContent=le,q.className=`api-dialog-status${xe?` is-${xe}`:""}`)},Be=()=>Bt()==="query",P=()=>{let le=is(be.value);return le||(window.location.protocol==="file:"?Gn:"")},B=()=>{let le=P(),xe=Wt(),We=Yl[Bt()]||Bt()||"\u540C\u6E90";M.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${r(vs(xe))}</strong>${xe?`\uFF08${r(We)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${r(gt("/api/health",le))}`},G=()=>{let le=Bt(),xe=`\u76EE\u524D\u4F86\u6E90\uFF1A${Yl[le]||le||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,We="";le==="query"?(We="is-warn",xe="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):Fa()?(We="is-warn",xe="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(le==="file-default"||window.location.protocol==="file:")&&(xe="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),xe+=(ne?.value||Oa()).trim()?" \u7BA1\u7406\u6B0A\u6756\uFF1A\u5DF2\u8A2D\u5B9A\uFF0C\u6703\u9001\u5F80\u76EE\u524D\u8A2D\u5B9A\u7684 API Base\u3002":" \u7BA1\u7406\u6B0A\u6756\uFF1A\u672A\u8A2D\u5B9A\uFF1B\u672C\u6A5F loopback \u53EF\u76F4\u63A5\u4F7F\u7528\uFF0C\u9060\u7AEF\u7BA1\u7406 API \u6703\u88AB\u62D2\u7D55\u3002",T.textContent=xe,T.className=`api-dialog-note${We?` ${We}`:""}`;let He=le==="query";V.disabled=He,me.disabled=He,be.readOnly=He},R=()=>{if(!Qn(be.value))return qe("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),be.focus(),null;let le=P();return window.location.protocol==="https:"&&/^http:\/\//i.test(le)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(le)?(qe("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),be.focus(),null):le},H=()=>{be.value=Wt(),B(),G(),qe("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},Q=()=>{let le=Array.isArray(i.embedding)?i.embedding.length:0,xe=Array.isArray(i.llm)?i.llm.length:0;if(S&&(S.textContent=o?"\u5207\u63DB\u4E2D\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",S.className=`badge badge-mono ${o?"badge-info":n?"badge-warn":"badge-neutral"}`),v){v.disabled=o,v.classList.toggle("is-on",n),v.classList.toggle("is-off",!n&&!o),v.classList.toggle("is-busy",o),v.setAttribute("aria-checked",n?"true":"false"),v.setAttribute("aria-busy",o?"true":"false"),v.setAttribute("aria-label",o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":n?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),v.title=o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let We=v.querySelector(".header-power-label");We&&(We.textContent=o?"\u2026":n?"ON":"OFF")}j&&(j.textContent=n?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${le} \u500B embedding \u8207 ${xe} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),W&&(W.innerHTML=Xl("Embedding",i.embedding)+Xl("LLM",i.llm))},_e=async()=>{try{let le=await J.testMode();if(a)return;n=!!le.enabled,i=le.models||{embedding:[],llm:[]},ve(Y,"")}catch(le){if(a)return;n=!1,i={embedding:[],llm:[]},ve(Y,le.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}a||Q()},Te=async()=>{if(o)return;let le=!n;o=!0,Q(),ve(Y,le?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let xe=await J.setTestMode(le);if(a)return;n=!!xe.enabled,i=xe.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:n,models:i}}));let We=i.embedding?.length||0,He=i.llm?.length||0;ve(Y,n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${We} \u500B embedding \u8207 ${He} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),N(n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${We} \u500B embedding\u3001${He} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",n?"ok":"info",6e3),await ot()}catch(xe){a||(ve(Y,xe.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),N(xe.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{o=!1,a||Q()}},Ye=()=>{let le=Km(l);if(I&&(I.innerHTML=le.summary),Se&&(Se.innerHTML=le.list),oe&&(oe.innerHTML=le.failures),Re){Re.disabled=d,Re.setAttribute("aria-busy",d?"true":"false");let xe=Re.querySelector("span");xe&&(xe.textContent=d?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66")}},dt=async()=>{try{let le=await J.llmModels();if(a)return;l=le,ve(ke,"")}catch(le){if(a)return;l=null,ve(ke,le.message||"\u7121\u6CD5\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u3002","error")}a||Ye()},st=async()=>{if(!d){d=!0,Ye(),ve(ke,"\u6B63\u5728\u6AA2\u67E5 llama-server \u6A21\u578B\u8207 chat \u80FD\u529B\u2026");try{let le=await J.testLlmModels();if(a)return;l=le;let xe=le.tested_now?.length||0,We=le.chat_models?.length||0,He=le.failures?.length||0;ve(ke,`${xe?`\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u672C\u6B21\u65B0\u6E2C ${xe} \u500B\u6A21\u578B`:"\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u6C92\u6709\u65B0\u6A21\u578B"}\uFF0C\u76EE\u524D ${We} \u500B\u6A21\u578B\u652F\u63F4 chat${He?`\uFF1B${He} \u500B\u6A21\u578B\u66AB\u6642\u7121\u6CD5\u5224\u5B9A\uFF0C\u4E0B\u6B21\u6703\u91CD\u8A66`:""}\u3002`,He?"warn":"ok"),N(xe?`LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u65B0\u589E ${xe} \u7B46\u80FD\u529B\u7D00\u9304\u3002`:"LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u6C92\u6709\u65B0\u6A21\u578B\u9700\u8981\u6E2C\u8A66\u3002",He?"warn":"ok",5e3),await _e()}catch(le){a||(ve(ke,le.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),N(le.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{d=!1,a||Ye()}}},Ze=()=>{let le=Xm(p);if(Me&&(Me.innerHTML=le.summary),Pe&&(Pe.innerHTML=le.list),ge&&(ge.innerHTML=le.failures),ue){ue.disabled=f,ue.setAttribute("aria-busy",f?"true":"false");let xe=ue.querySelector("span");xe&&(xe.textContent=f?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C Reranker \u670D\u52D9\u6E2C\u8A66")}},et=async()=>{try{let le=await J.rerankStatus();if(a)return;p=le,ve(ee,"")}catch(le){if(a)return;p=null,ve(ee,le.message||"\u7121\u6CD5\u8B80\u53D6 reranker \u72C0\u614B\u3002","error")}a||Ze()},ae=async()=>{if(!f){f=!0,Ze(),ve(ee,"\u6B63\u5728\u5C0D primary\uFF0Ffallback reranker \u57F7\u884C\u5BE6\u969B rerank \u6E2C\u8A66\u2026");try{let le=await J.testReranker();if(a)return;p=le;let xe=Array.isArray(le.providers)?le.providers:[],We=xe.filter(xt=>xt.status==="operational").length,He=xe.reduce((xt,pt)=>xt+(Array.isArray(pt.errors)?pt.errors.length:0),0);ve(ee,He?`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${We} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C${He} \u500B\u932F\u8AA4\uFF1B\u8A73\u7D30\u5206\u6578\u5DF2\u5217\u5728\u4E0A\u65B9\u3002`:`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${We} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C\u6A21\u578B ${le.model||"\u2014"}\u3002`,He?"warn":"ok"),N(He?"Reranker \u90E8\u5206\u7AEF\u9EDE\u5931\u6557\uFF0C\u8ACB\u67E5\u770B\u6E2C\u8A66\u7D50\u679C\u3002":"Reranker \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\u3002",He?"warn":"ok",5e3)}catch(le){a||(ve(ee,le.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),N(le.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{f=!1,a||Ze()}}},tt=()=>{if(!Ae)return;let le=Zm($,h,u);le!==_&&(_=le,Ae.innerHTML=ea($,h,u))},Ge=async()=>{try{let le=await J.testRuns(30);if(a)return;h=Array.isArray(le.runs)?le.runs:[]}catch{if(a)return;h=[]}},ot=async(le=null)=>{try{let xe=le||(u?await J.testRun(u):await J.testRunCurrent());if(a)return;$=xe.run||null,!u&&$&&$.status!=="running"&&!h.some(We=>We.run_id===$.run_id)&&await Ge()}catch{if(a)return;$=null}a||tt()};be?.addEventListener("input",()=>{B(),qe("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),ne?.addEventListener("input",()=>{G()}),X?.addEventListener("click",async()=>{let le=R();if(le!==null){Ee(X,!0,"\u6E2C\u8A66\u4E2D\u2026"),qe(`\u6B63\u5728\u9023\u7DDA\u5230 ${vs(le)||"\u540C\u6E90"}\u2026`);try{let xe=await Si(le);if(a)return;qe(`\u9023\u7DDA\u6210\u529F \xB7 v${xe.version} \xB7 ${xe.duration_ms} ms \xB7 GET ${gt("/api/health",le)}`,"ok")}catch(xe){a||qe(xe.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{a||Ee(X,!1)}}}),we?.addEventListener("submit",le=>{if(le.preventDefault(),Be())return;let xe=R();xe!==null&&(Kn(xe),Ha(ne?.value||""),N(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${vs(xe)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),me?.addEventListener("click",()=>{Be()||(Kn(""),N("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),v?.addEventListener("click",Te),Re?.addEventListener("click",st),ue?.addEventListener("click",ae),Ae?.addEventListener("change",async le=>{le.target.id==="test-run-select"&&(u=String(le.target.value||""),await ot())}),Ae?.addEventListener("click",async le=>{le.target.closest("#test-flow-refresh")&&(u="",await Ge(),await ot())}),de?.addEventListener("click",async()=>{Ee(de,!0,"\u66F4\u65B0\u4E2D\u2026"),H(),await Promise.allSettled([_e(),Ge(),dt(),et()]),a||await ot(),a||(Ee(de,!1),N("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let mt=le=>{n=!!le.detail?.enabled,i=le.detail?.models||{embedding:[],llm:[]},Q()};return window.addEventListener("judgment:test-mode",mt),H(),Q(),Ye(),Ze(),await Promise.allSettled([_e(),Ge(),dt(),et()]),await ot(),b=wt("test-runs",async(le,xe)=>{a||document.hidden||u||await ot(xe?.snapshot||null)}),!s&&typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{a=!0,b&&b(),window.removeEventListener("judgment:test-mode",mt)}}var Zl={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var nc={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},pi=new Set,ec="judgment.status.payload.v1",rc=new Set(["tests","resources","local-model","api"]),ic=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"tests",label:"\u7CFB\u7D71\u6E2C\u8A66",hint:"API\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u6A21\u578B Flow",icon:"terminal"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"local-model",label:"Model Provider",hint:"llama-server \u4E3B\u6A5F\u8207\u6A21\u578B",icon:"server"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 API \u2192 Pipeline \u2192 Data",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}],Ea=[{id:"system",label:"\u7CFB\u7D71\u8207\u5373\u6642\u72C0\u614B",icon:"activity",prefixes:["/api/health","/api/status","/api/system-usage","/api/events/stream","/api/processing/events/status","/api/docs","/api/openapi.json"]},{id:"processing",label:"\u8CC7\u6599\u8655\u7406\u8207\u66F4\u65B0",icon:"database",prefixes:["/api/processing","/api/judgment-download","/api/updates","/api/courts","/api/law-versions"]},{id:"data",label:"\u67E5\u8A62\u8207\u8CC7\u6599",icon:"search",prefixes:["/api/query","/api/data","/api/judgment","/api/law","/api/schema","/api/catalog","/api/judgment-stats","/api/quality"]},{id:"rag",label:"RAG \u554F\u7B54",icon:"message",prefixes:["/api/rag"]},{id:"index",label:"\u7248\u672C\u8207\u7D22\u5F15",icon:"layers",prefixes:["/api/index-versions","/api/index-alias","/api/versioning"]},{id:"models",label:"\u6A21\u578B\u8207\u670D\u52D9",icon:"brain",prefixes:["/api/ollama","/api/llm","/api/rerank","/api/test-mode"]},{id:"tests",label:"\u6E2C\u8A66\u8207\u6548\u80FD",icon:"activity",prefixes:["/api/test-runs","/api/performance"]},{id:"question-bank",label:"\u984C\u5EAB",icon:"file",prefixes:["/api/question-bank"]},{id:"benchmark",label:"Benchmark",icon:"grid",prefixes:["/api/benchmark"]},{id:"other",label:"\u5176\u4ED6",icon:"terminal",prefixes:[]}];function eg(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Ot(e).label,tone:Ot(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function tg(e){let t=Ot(e.status),s=Zl[e.kind]||Zl.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${c(e.latency_ms)} ms</span>`;return`<article class="service-card">
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
  </article>`}function sg(e,t){let s=typeof e=="string"?{label:e}:e||{},a=String(s.label||"\u2014"),n=s.service?t.find(l=>l.id===s.service):null,i=n?n.status==="operational":a==="IndexedDB"?ao():!0,o=[s.detail||"",n?`\u72C0\u614B\uFF1A${Ot(n.status).label}`:""].filter(Boolean).join(" \xB7 ");return`<div class="arch-node ${i?"":"is-muted"}" title="${r(o||(i?a:"\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"))}">
    <strong>${r(a)}</strong>
    ${s.detail?`<span class="arch-node-detail">${r(s.detail)}</span>`:""}
  </div>`}function ag(e,t,s=!1){let a=e?.layers||[];if(!a.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let n=a.map(o=>{let l=(o.nodes||[]).map(d=>sg(d,t)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${r(o.label||o.id)}</div>
      <div class="arch-nodes">${l}</div>
    </div>`}),i=[];return n.forEach((o,l)=>{l&&i.push(`<div class="arch-arrow" aria-hidden="true">${g("arrowRight",15)}</div>`),i.push(o)}),`<div class="arch-flow">${i.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${g("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>
    ${ng(s)}`}function ng(e=!1){return`<figure class="arch-diagram">
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
  </figure>`}function oc(e){let t=String(e||""),s=a=>t===a||t.startsWith(`${a}/`);for(let a of Ea)if(a.prefixes.some(s))return a;return Ea[Ea.length-1]}function rg(e){return`is-${String(e||"get").toLowerCase()}`}function ig(e){return`<div class="endpoint-row${e.deprecated?" is-deprecated":""}">
    <span class="endpoint-method ${rg(e.method)}">${r(e.method||"GET")}</span>
    <span class="endpoint-path" title="${r(e.path||"")}">${r(e.path||"")}</span>
    <span class="endpoint-label">${r(e.label||"")}</span>
  </div>`}function og(e){if(!Array.isArray(e)||!e.length)return'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>';let t=new Map(Ea.map(s=>[s.id,{group:s,endpoints:[]}]));for(let s of e){let a=oc(s.path),n=t.get(a.id);n&&n.endpoints.push(s)}return`<div class="api-endpoint-groups">${Ea.map(s=>{let n=t.get(s.id)?.endpoints||[];return n.length?(n.sort((i,o)=>String(i.path).localeCompare(String(o.path))||String(i.method).localeCompare(String(o.method))),`<section class="card api-endpoint-group">
        <div class="side-card-head">
          <span class="side-card-title">${g(s.icon,14)}${r(s.label)}</span>
          <span class="badge badge-neutral badge-mono">${c(n.length)}</span>
        </div>
        <div class="endpoint-list">${n.map(ig).join("")}</div>
      </section>`):""}).join("")}</div>`}function ps(e,t){return`<div class="detail-row">
    <span class="detail-label">${r(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function Je(e,t,{mono:s=!1,wide:a=!1}={}){return`<div class="data-version-fact${a?" is-wide":""}">
    <span>${r(e)}</span>
    <strong class="${s?"mono":""}">${r(String(t??"\u2014"))}</strong>
  </div>`}function tc(e,t,s,a=""){let n=t==null?null:Math.max(0,Math.min(100,Number(t)||0));return`<div class="data-version-coverage ${a}">
    <div class="data-version-coverage-head">
      <span>${r(e)}</span>
      <strong>${Rn(n)}</strong>
    </div>
    <div class="data-version-coverage-track"><span style="width:${n===null?0:n.toFixed(1)}%"></span></div>
    <div class="data-version-coverage-foot">${r(s)}</div>
  </div>`}function lg(e){if(!Array.isArray(e)||!e.length)return ft({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${r(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${Ga(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function cg(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=new Map(s.map(_=>[_.id,_])),n=a.get("qdrant"),i=a.get("embedding"),o=a.get("rag"),l=a.get("llm"),d=Number(t.judgment_indexed_count||0),p=Number(t.judgment_count||0),f=p?(d/p*100).toFixed(1):"0.0",$=t.judgment_vector_points===null||t.judgment_vector_points===void 0?"\u2014":c(t.judgment_vector_points),h=Number(t.judgment_index_remaining||0),u=o?.status==="operational"?"RAG \u5C31\u7DD2":o?.status==="not_configured"?"\u672A\u8A2D\u5B9A":o?.status==="degraded"?"\u964D\u7D1A":"\u672A\u77E5",b=[["cube","Qdrant \u5411\u91CF\u7D22\u5F15",n],["layers",`Embedding\uFF08${t.judgment_vector_model||"\u2014"}\uFF09`,i],["brain","RAG \u56DE\u7B54\u7BA1\u7DDA",o],["sparkles","LLM \u6A21\u578B",l]];return`<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("database",14)}RAG \u8CC7\u6599\u73FE\u6CC1</span>
      ${Ke(o?.status,u)}
    </div>
    <div class="side-card-body">
      <div class="mini-stats">
        <div class="mini-stat">
          <div class="mini-stat-value">${c(p)}</div>
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
        ${b.map(([_,k,A])=>`<div class="side-status-row">
              <span>${g(_,13)}${r(k)}</span>
              ${Ke(A?.status,A?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
            </div>`).join("")}
      </div>
      <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
        Collection\uFF1A${r(t.judgment_vector_collection||"\u2014")} \xB7
        ${$} points \xB7 \u5269\u9918 ${c(h)} \u7B46\u5F85\u7D22\u5F15
      </div>
    </div>
    <div class="side-card-foot">
      PostgreSQL \u5224\u6C7A\u6587\u4EF6\u3001Qdrant \u5411\u91CF\u7D22\u5F15\u8207 llama-server \u6A21\u578B\u72C0\u614B\u7686\u70BA\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u5C31\u7DD2\u6642\u6703\u660E\u78BA\u964D\u7D1A\u3002
    </div>
  </section>`}function Rn(e){let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function ms(e){return Math.max(0,Number(e?.duration_ms)||0)}function dg(e,t){let s=e?.pipeline&&typeof e.pipeline=="object"?e.pipeline:null,a=Array.isArray(s?.stages)?s.stages:[],n=Number(s?.total_ms)||a.reduce((h,u)=>h+ms(u),0),i=Math.max(0,Number(t?.initMs)||0),o=Math.max(0,Number(t?.requestMs)||0),l=Math.max(o,n),d=Math.max(0,l-n),p=[],f=t?.requestStartedAt||e?.checked_at||null,$=t?.requestFinishedAt||e?.checked_at||null;if(i>.5&&p.push({key:"page-init",label:"\u9801\u9762\u521D\u59CB\u5316",caption:"\u5EFA\u7ACB\u670D\u52D9\u7E3D\u89BD\u9AA8\u67B6\u8207\u5C0E\u89BD",color:"#64748b",status:"success",duration_ms:i,started_at:t?.initStartedAt||f,finished_at:f,message:"\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u3001\u8F09\u5165\u6A21\u7D44\u4E26\u6E96\u5099\u8ACB\u6C42\u3002"}),a.length){d>.5&&p.push({key:"http",label:"HTTP \u50B3\u8F38\uFF0F\u6392\u968A",caption:"\u700F\u89BD\u5668 \u2192 FastAPI",color:"#94a3b8",status:"success",duration_ms:d,started_at:f,finished_at:$,message:"\u5305\u542B\u9023\u7DDA\u3001\u8ACB\u6C42\u6392\u968A\u8207\u56DE\u61C9\u50B3\u8F38\u3002"}),p.push(...a);let h=a.reduce((b,_)=>b+ms(_),0),u=Math.max(0,n-h);u>.5&&p.push({key:"server-assemble",label:"\u4F3A\u670D\u5668\u5F59\u6574",caption:"\u72C0\u614B\u56DE\u61C9\u7D44\u88DD",color:"#cbd5e1",status:"success",duration_ms:u,started_at:a[a.length-1]?.finished_at||f,finished_at:$,message:"\u7D44\u88DD\u670D\u52D9\u3001\u8CC7\u6599\u91CF\u8207\u67B6\u69CB payload\u3002"})}else p.push({key:"status-request",label:"GET /api/status",caption:"\u670D\u52D9\u72C0\u614B\u8207\u8CC7\u6599\u91CF",color:"#64748b",status:"success",duration_ms:l,started_at:f,finished_at:$,message:"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF1B\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593\u3002"});return{total_ms:i+l,started_at:t?.initStartedAt||f,finished_at:$,stages:p,server_ms:n,request_ms:l,transport_ms:d,init_ms:i,detailed:!!s}}function ug(e){let t=e?.page_pipeline,s=Array.isArray(t?.stages)?t.stages:[];if(!t||!s.length)return"";let a=Math.max(0,Number(t.total_ms)||s.reduce((v,j)=>v+ms(j),0)),n=Math.max(a,s.reduce((v,j)=>v+ms(j),0),1),i=1.25,o=s.filter(v=>String(v.status||"success")!=="skipped"),l=s.filter(v=>["success","no_change"].includes(String(v.status||"success"))).length,d=s.filter(v=>v.status==="failed").length,p=s.reduce((v,j)=>ms(j)>ms(v)?j:v,s[0]),f=Math.max(0,Number(t.server_ms)||Number(e?.pipeline?.total_ms)||0),$=Math.max(0,Number(t.transport_ms)||0),h=Math.max(0,Number(t.init_ms)||0),u=s.map(v=>String(v.status||"success")==="skipped"?0:Math.max(ms(v)/n*100,i)),b=u.reduce((v,j)=>v+j,0),_=b>100?100/b:1,k=0,A=s.map((v,j)=>{let W=String(v.status||"success"),Y=W==="skipped",we=v.label||v.key||`\u968E\u6BB5 ${j+1}`,be=v.caption||"",ne=ms(v),M=Y?"\u2014":fe(ne),q=n>0?ne/n*100:0,T=Y?0:u[j]*_,X=k;Y||(k+=T);let me=v.color||"#64748b",V=W==="failed"?"var(--danger)":me,de=[`is-${W}`,W==="failed"?"is-error":"",Y?"is-missing":""].filter(Boolean).join(" "),Ae=T>0?`<span class="rag-wf-bar status-wf-bar is-sequential" style="left:${X.toFixed(3)}%;width:${T.toFixed(4)}%;top:0;height:12px;--bar-color:${r(V)}" aria-hidden="true"></span>`:"",I=Y?"\u7565\u904E":W==="failed"?"\u5931\u6557":"\u5B8C\u6210",Se=`${t.label||"status"}:${v.key||j}`,oe=[["\u72C0\u614B",I,!0],["\u958B\u59CB",v.started_at?ye(v.started_at):"\u2014",!0],["\u7D50\u675F",v.finished_at?ye(v.finished_at):"\u2014",!0],["\u8017\u6642",M,!0],["\u5360\u6574\u9AD4",Rn(q),!0],["\u8AAA\u660E",v.message||"",!1]].map(([ke,Re,Me])=>Me||Re?`<span class="rag-wf-detail"><span>${r(ke)}</span><strong>${r(String(Re||"\u2014"))}</strong></span>`:"").join("");return`<details class="rag-wf-stage status-wf-stage ${de}" data-status-wf-stage="${r(Se)}"${pi.has(Se)?" open":""} style="--stage-color:${r(me)}">
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="status-wf-step">${String(j+1).padStart(2,"0")}</span> ${r(we)}</strong>${be?`<small>${r(be)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(M)} \xB7 ${r(I)} <span class="rag-wf-chevron">${g("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${we}\uFF1A${I}\uFF0C\u8017\u6642 ${M}\uFF0C\u5360\u6574\u9AD4 ${Rn(q)}`)}">${Ae}</span>
        </summary>
        <div class="rag-wf-details">${oe}</div>
      </details>`}).join(""),S=t.detailed?"\u5F8C\u7AEF /api/status \u968E\u6BB5\u660E\u7D30":"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF0C\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593";return`<section class="report-card status-wf-card" data-status-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${g("activity",14)}\u670D\u52D9\u7E3D\u89BD\u8F09\u5165 Pipeline</span>
      <div class="index-runtime-metrics">
        <span class="index-runtime-metric" title="\u672C\u6B21\u9801\u9762\u521D\u59CB\u5316\u5230\u72C0\u614B\u56DE\u61C9\u5B8C\u6210\u7684\u7E3D\u6642\u9593\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(fe(a))}</strong></span>
        <span class="index-runtime-metric" title="\u5F8C\u7AEF /api/status \u6AA2\u67E5\u968E\u6BB5\u7684\u5408\u8A08\u6642\u9593\u3002"><span>Server</span><strong>${r(fe(f))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u8ACB\u6C42\u6642\u9593\u6263\u6389\u5F8C\u7AEF\u6AA2\u67E5\u5F8C\u7684\u50B3\u8F38\u8207\u6392\u968A\u6642\u9593\u3002"><span>HTTP \u50B3\u8F38</span><strong>${r(fe($))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u9AA8\u67B6\u8207\u8F09\u5165\u6A21\u7D44\u7684\u6642\u9593\u3002"><span>\u9801\u9762\u521D\u59CB\u5316</span><strong>${r(fe(h))}</strong></span>
        <span class="index-runtime-metric" title="\u8017\u6642\u6700\u9577\u7684\u6AA2\u67E5\u968E\u6BB5\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${p?.label||"\u2014"} \xB7 ${fe(ms(p))}`)}</strong></span>
        <span class="index-runtime-metric" title="\u5B8C\u6210\u7684\u6AA2\u67E5\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\uFF1B\u5931\u6557\u968E\u6BB5\u6703\u4EE5\u7D05\u8272\u6A19\u793A\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${c(l)} / ${c(s.length)}${d?` \xB7 \u5931\u6557 ${c(d)}`:""}</strong></span>
      </div>
    </div>
    <div class="status-wf-summary">
      <span>\u6AA2\u67E5 <strong>${r(ye(e.checked_at))}</strong></span>
      <span>API <strong class="mono">${r(vs())}</strong></span>
      <span>\u7248\u672C <strong class="mono">v${r(e.version||"\u2014")}</strong></span>
      <span>\u74B0\u5883 <strong>${r(e.environment||"\u2014")}</strong></span>
      <span>${r(S)}</span>
    </div>
    <div class="status-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${r(fe(a))}</span>
      </div>
      <div class="rag-wf-legend workflow-wf-legend" aria-label="\u968E\u6BB5\u72C0\u614B\u5716\u4F8B">
        <span><i class="is-solid-state"></i>\u5B8C\u6210</span>
        <span><i class="is-failed-state"></i>\u5931\u6557</span>
        <span><i class="is-empty-state"></i>\u7565\u904E</span>
      </div>
      <div class="rag-wf-stages">${A}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u986F\u793A\u672C\u6B21\u958B\u555F\u670D\u52D9\u7E3D\u89BD\u7684\u9801\u9762\u521D\u59CB\u5316\u3001HTTP \u5F80\u8FD4\u3001\u5F8C\u7AEF\u6AA2\u67E5\u8207\u56DE\u61C9\u5F59\u6574\u3002\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u5931\u6557\u968E\u6BB5\u4EE5\u7D05\u8272\u6A19\u793A\uFF0C\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\uFF1B\u6975\u77ED\u968E\u6BB5\u4FDD\u7559\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function pg(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=eg(e.status),n=s.find(p=>p.id==="qdrant"),i=s.find(p=>p.id==="rag"),o=s.find(p=>p.id==="llm"),l=Bt(),d=nc[l]||l;return`<section class="status-hero">
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
          <span>${g("clock",11)} \u6AA2\u67E5\u6642\u9593 ${ye(e.checked_at)} \xB7 ${r(ma(e.checked_at))}</span>
          <span>${g("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${g("database",11)} ${c(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${g("layers",11)} ${c(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${r(d)}">${g("link",11)} ${r(vs())}</span>
        </div>
      </div>
    </section>

    ${ug(e)}

    <div class="service-grid">${s.map(tg).join("")}</div>

    ${cg(e)}

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

    ${n?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${Oe({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${r(n?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${r(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${r(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}`}function mg(e,t=!1){let s=Array.isArray(e.services)?e.services:[],a=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Pipelines \u2192 Data \xB7 \u6700\u65B0\u5C08\u6848\u5143\u4EF6\u8207\u5373\u6642\u5065\u5EB7\u72C0\u614B</div>
      </div>
      <span class="badge badge-neutral badge-mono">${c((a.flow||[]).length)} layers</span>
    </div>
    ${ag(a,s,t)}
  </div>`}function gg(e){let t=Array.isArray(e.endpoints)?e.endpoints:[],s=Bt(),a=nc[s]||s,n=gt("/api/docs"),i=gt("/api/openapi.json"),o=new Set(t.map(p=>oc(p.path).id)),l=t.reduce((p,f)=>{let $=String(f.method||"GET").toUpperCase();return p[$]=(p[$]||0)+1,p},{}),d=["GET","POST","PATCH","PUT","DELETE"].filter(p=>l[p]).map(p=>`${p} ${c(l[p])}`).join(" \xB7 ");return`<section class="status-hero api-endpoint-hero">
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
          <span>${g("server",11)} API Base <span class="mono">${r(vs())}</span>\uFF08${r(a)}\uFF09</span>
          <span>${g("terminal",11)} ${r(d||"\u2014")}</span>
          <span>${g("clock",11)} \u66F4\u65B0\u6642\u9593 ${ye(e.checked_at)}</span>
        </div>
      </div>
      <div class="api-endpoint-actions">
        <a class="btn btn-secondary btn-sm" href="${r(n)}" target="_blank" rel="noopener noreferrer">${g("external",13)}<span>Swagger UI</span></a>
        <a class="btn btn-ghost btn-sm" href="${r(i)}" target="_blank" rel="noopener noreferrer">OpenAPI JSON ${g("external",11)}</a>
      </div>
    </section>
    ${og(t)}
    <p class="status-footnote">\u7AEF\u9EDE\u7531 FastAPI route table \u52D5\u614B\u7522\u751F\uFF1B\u4E92\u52D5\u5F0F\u6587\u4EF6\u4F4D\u65BC <a href="${r(n)}" target="_blank" rel="noopener noreferrer"><code>${r(n)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${r(i)}" target="_blank" rel="noopener noreferrer"><code>${r(i)}</code></a>\u3002\u7AEF\u9EDE\u8B8A\u66F4\u5F8C\u91CD\u65B0\u6574\u7406\u6B64\u9801\u5373\u53EF\u53D6\u5F97\u6700\u65B0\u6E05\u55AE\u3002</p>`}function fg(e,t={}){let s=e.data||{},a=t.info||null,n=a?.counts||{},i=Number(s.judgment_indexed_count||0),o=Number(s.judgment_count||0),l=Number(s.judgment_index_remaining??Math.max(0,o-i)),d=Number(s.judgment_index_pending??l)||0,p=Number(s.judgment_index_changed||0),f=Number(s.judgment_index_stale||0),$=o>0?Math.max(0,Math.min(100,i/o*100)):null,h=Rn($),u=s.judgment_index_fresh===!1||d>0||String(s.judgment_index_staleness?.status||"")==="stale",b=u?"is-warn":"",_=s.last_version||{},k=s.last_run||{},A=_.source_type==="law"?"\u6CD5\u898F":_.source_type==="order"?"\u547D\u4EE4":"\u2014",S=_.version_code?String(_.version_code):_.id?`#${c(_.id)}`:"\u2014",v=Number(s.legal_article_indexed_count||s.legal_index?.points_count||0),j=Number(s.legal_article_count||s.legal_index?.article_count||0),W=j>0?Math.max(0,Math.min(100,v/j*100)):null,Y=s.legal_article_stale===!0||String(s.legal_index?.status||"")==="stale",we=Y?"is-warn":"",be=s.judgment_vector_alias||"\u2014",ne=s.judgment_vector_collection||"\u2014",M=s.legal_article_vector_alias||s.legal_index?.alias||"\u2014",q=s.legal_article_vector_collection||s.legal_index?.collection||"\u2014",T=u?"\u5224\u6C7A\u7D22\u5F15\u5F85\u66F4\u65B0":"\u8CC7\u6599\u7248\u672C\u4E00\u81F4",X=u?`\u5224\u6C7A\u7D22\u5F15\u5C1A\u7F3A ${c(d)} \u7B46`:"\u5224\u6C7A\u8CC7\u6599\u8207\u5411\u91CF\u7D22\u5F15\u4E00\u81F4",me=u?`PostgreSQL \u76EE\u524D\u6709 ${c(o)} \u7B46\u5224\u6C7A\uFF0CQdrant ${ne} \u5DF2\u7D22\u5F15 ${c(i)} \u7B46\uFF1B\u5C1A\u6709 ${c(d)} \u7B46\u5F85\u7D22\u5F15\u3002`:"PostgreSQL \u8207 Qdrant \u5224\u6C7A\u7B46\u6578\u4E00\u81F4\uFF1B\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u8207\u7D22\u5F15\u72C0\u614B\u540C\u6B65\u3002",V=Ot(k.status||"idle").label,de=k.finished_at||k.started_at;return`<section class="status-hero data-version-hero">
      <div class="status-hero-main">
        <div class="overall-row">
          <span class="overall-badge ${b}">
            <span class="status-dot ${u?"is-warn":"is-ok"}" aria-hidden="true"></span>
            ${r(T)}
          </span>
          <span class="badge badge-neutral badge-mono">${c(s.version_count)} \u500B\u8CC7\u6599\u7248\u672C</span>
          <span class="badge badge-neutral">${r(A)} \u6700\u65B0\u7248\u672C ${r(S)}</span>
        </div>
        <h2 class="status-headline">${r(X)}</h2>
        <p class="status-copy">${r(me)}</p>
        <div class="status-meta">
          <span>${g("clock",11)} \u6AA2\u67E5\u6642\u9593 ${ye(e.checked_at)}</span>
          <span>${g("database",11)} \u73FE\u884C\u8CC7\u6599 ${c(s.total_current)} \u7B46</span>
          <span>${g("layers",11)} \u539F\u59CB Parquet ${c(s.parquet_files)} \u500B \xB7 ${Ne(s.parquet_bytes)}</span>
          <span title="Qdrant alias \u8207\u76EE\u524D\u7248\u672C collection">${g("link",11)} <span class="mono">${r(be)} \u2192 ${r(ne)}</span></span>
        </div>
      </div>
      <div class="data-version-ring ${b}" style="--coverage:${$===null?0:$.toFixed(1)}%">
        <div class="data-version-ring-inner">
          <strong>${h}</strong>
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
        <div class="metric-foot">${c(s.parquet_files)} \u500B\u539F\u59CB Parquet \xB7 ${Ne(s.parquet_bytes)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u5224\u6C7A\u6587\u4EF6</div>
        <div class="metric-value">${c(s.judgment_count)}</div>
        <div class="metric-foot">PostgreSQL current</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Qdrant \u5224\u6C7A\u5411\u91CF\u7D22\u5F15</div>
        <div class="metric-value">${c(s.judgment_indexed_count)}</div>
        <div class="metric-foot">${h} \xB7 \u5269\u9918 ${c(d)} \u7B46</div>
      </div>
    </div>

    <div class="status-columns data-version-grid">
      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${g("database",14)}PostgreSQL \u8CC7\u6599\u7248\u672C</span>
          ${Ke(_.is_current?"operational":"degraded",_.is_current?"CURRENT":"HISTORY")}
        </div>
        ${_.id?`<div class="index-current-row">
                <span class="badge badge-info">${g("activity",11)}${r(A)} ${r(S)}</span>
                <strong class="mono">${ye(_.downloaded_at)}</strong>
                <span class="index-current-copy" title="${r(_.parquet_path||"")}">${r(_.parquet_path||"\u2014")}</span>
              </div>
              <div class="data-version-facts">
                ${Je("\u8CC7\u6599\u7248\u672C\u7E3D\u6578",c(s.version_count),{mono:!0})}
                ${Je("\u4E0B\u8F09\u57F7\u884C\u7E3D\u6578",c(s.run_count),{mono:!0})}
                ${Je("\u7248\u672C ID",`#${c(_.id)}`,{mono:!0})}
                ${Je("\u8CC7\u6599\u985E\u578B",A)}
                ${Je("\u4F86\u6E90\u66F4\u65B0\u65E5",_.update_date||"\u2014")}
                ${Je(`${A}\uFF0F\u689D\u6587`,`${c(_.law_count)} / ${c(_.article_count)}`)}
                ${Je("\u4E0B\u8F09\u6642\u9593",ye(_.downloaded_at),{mono:!0})}
                ${Je("\u8CC7\u6599\u72C0\u614B",_.is_current?"current":"history",{mono:!0})}
                ${Je("Parquet \u6A94\u6848",_.parquet_path||"\u2014",{mono:!0,wide:!0})}
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
                ${Je("Schema \u7248\u672C",`v${c(a.version)}`,{mono:!0})}
                ${Je("\u5132\u5B58\u6A21\u5F0F",a.mode||"\u2014",{mono:!0})}
                ${Je("query_history",`${c(n.query_history)} / ${c(a.caps?.history)}`,{mono:!0})}
                ${Je("audit_events",`${c(n.audit_events)} / ${c(a.caps?.audit)}`,{mono:!0})}
                ${Je("settings",c(n.settings),{mono:!0})}
                ${Je("\u7E3D\u7D00\u9304\u6578",c(a.total),{mono:!0})}
                ${Je("\u5DF2\u7528\u5BB9\u91CF",Ne(a.usage_bytes),{mono:!0})}
                ${Je("\u53EF\u7528\u914D\u984D",Ne(a.quota_bytes),{mono:!0})}
              </div>
              <p class="data-version-note">${g("info",12)}
                IndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u7AEF\u63D0\u554F\u6B77\u53F2\u3001\u8A2D\u5B9A\u8207\u7248\u672C\u7A3D\u6838\u4E8B\u4EF6\uFF1B\u4F3A\u670D\u5668\u8CC7\u6599\u4EE5 PostgreSQL \u8207 Parquet \u70BA\u6E96\u3002
              </p>`:`<div class="report-empty-inline">${t.loading||!t.error?"\u6B63\u5728\u8B80\u53D6\u700F\u89BD\u5668 IndexedDB\u2026":r(t.error?.message||"IndexedDB \u5C1A\u7121\u8CC7\u6599\u6216\u7121\u6CD5\u8B80\u53D6\u3002")}</div>`}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${g("brain",14)}Qdrant \u5224\u6C7A\u5411\u91CF\u7D22\u5F15</span>
          ${Ke(u?"degraded":"operational",u?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${g("link",11)}Alias</span>
          <strong class="mono">${r(be)}</strong>
          <span class="mono">\u2192 ${r(ne)}</span>
          <span class="index-current-copy">v#${c(s.judgment_vector_version_id)} \xB7 ${r(s.judgment_vector_model||"\u2014")}</span>
        </div>
        ${tc("\u7D22\u5F15\u8986\u84CB",$,`\u5DF2\u7D22\u5F15 ${c(i)} / ${c(o)} \u7B46 \xB7 \u5269\u9918 ${c(d)} \u7B46`,b)}
        <div class="data-version-facts">
          ${Je("Qdrant points",c(s.judgment_vector_points),{mono:!0})}
          ${Je("\u7D22\u5F15\u7248\u672C",`#${c(s.judgment_vector_version_id)} \xB7 ${s.judgment_vector_version_status||"legacy"}`,{mono:!0})}
          ${Je("\u524D\u4E00\u7248\u672C",s.judgment_vector_previous_version_id?`#${c(s.judgment_vector_previous_version_id)}`:"\u2014",{mono:!0})}
          ${Je("\u5F85\u88DC\uFF0F\u8B8A\u66F4\uFF0F\u5931\u6548",`${c(d)} / ${c(p)} / ${c(f)}`)}
          ${Je("\u6700\u8FD1\u7D22\u5F15",ye(s.judgment_indexed_at),{mono:!0})}
          ${Je("\u6A21\u578B",s.judgment_vector_model||"\u2014",{mono:!0})}
        </div>
        ${d>0?`<p class="data-version-note is-warn">${g("info",12)}\u5C1A\u6709 ${c(d)} \u7B46\u5224\u6C7A\u5C1A\u672A\u7D22\u5F15\uFF1B\u8ACB\u81F3\u300C\u8CC7\u6599\u8655\u7406 \u2192 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u63A5\u7E8C\u88DC\u9F4A\u3002</p>`:""}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${g("shield",14)}Qdrant \u6CD5\u898F\uFF0F\u547D\u4EE4\u5411\u91CF\u7D22\u5F15</span>
          ${Ke(Y?"degraded":"operational",Y?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${g("link",11)}Alias</span>
          <strong class="mono">${r(M)}</strong>
          <span class="mono">\u2192 ${r(q)}</span>
          <span class="index-current-copy">v#${c(s.legal_article_vector_version_id||s.legal_index?.version_id)}</span>
        </div>
        ${tc("\u689D\u6587\u7D22\u5F15\u8986\u84CB",W,`\u5DF2\u7D22\u5F15 ${c(v)} / ${c(j)} \u689D`,we)}
        <div class="data-version-facts">
          ${Je("Qdrant points",c(v),{mono:!0})}
          ${Je("\u73FE\u884C\u689D\u6587",c(j),{mono:!0})}
          ${Je("\u5411\u91CF\u7DAD\u5EA6",c(s.legal_index?.dimension),{mono:!0})}
          ${Je("\u6700\u8FD1\u7D22\u5F15",ye(s.legal_article_indexed_at||s.legal_index?.indexed_at),{mono:!0})}
          ${Je("\u7D22\u5F15\u72C0\u614B",Y?"stale":"fresh",{mono:!0})}
          ${Je("Collection",q,{mono:!0})}
        </div>
      </section>

      <section class="card data-version-card is-wide-grid">
        <div class="side-card-head">
          <span class="side-card-title">${g("folder",14)}Parquet \u8207\u57F7\u884C\u72C0\u614B</span>
          <span class="badge badge-neutral badge-mono">${c(s.parquet_files)} FILES</span>
        </div>
        <div class="data-version-facts">
          ${Je("\u539F\u59CB Parquet \u6A94\u6848",c(s.parquet_files),{mono:!0})}
          ${Je("\u5408\u8A08\u5BB9\u91CF",Ne(s.parquet_bytes),{mono:!0})}
          ${Je("PostgreSQL \u73FE\u884C\u8CC7\u6599",c(s.total_current),{mono:!0})}
          ${Je("\u8CC7\u6599\u7248\u672C\u7E3D\u6578",c(s.version_count),{mono:!0})}
          ${Je("\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C",k.status?V:"\u2014")}
          ${Je("\u6700\u8FD1\u57F7\u884C\u6642\u9593",de?ye(de):"\u2014",{mono:!0})}
          ${Je("\u6700\u8FD1\u57F7\u884C\u8017\u6642",k.duration_ms?fe(k.duration_ms):"\u2014",{mono:!0})}
          ${Je("\u6700\u8FD1\u57F7\u884C\u7248\u672C",k.version_id?`#${c(k.version_id)}`:"\u2014",{mono:!0})}
        </div>
        <p class="data-version-note">${g("info",12)}
          \u539F\u59CB Parquet \u4FDD\u7559 raw\uFF0Fdelta \u8207 manifest\uFF1BPostgreSQL \u63D0\u4F9B current metadata \u8207\u7248\u672C\u72C0\u614B\uFF1BQdrant \u53EA\u4FDD\u5B58\u5411\u91CF\u8207 payload\u3002
        </p>
      </section>
    </div>`}function bg(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${g("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${c(t.run_count)} TOTAL</span>
    </div>
    ${lg(e.recent_runs)}
  </section>`}function hg(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function lc(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function Ds(e,t,s,a,n){let i=hg(n);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${g(t,14)}${r(e)}</span>
      <strong>${r(s)}</strong>
    </div>
    ${lc(n,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function vg(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${g("layers",14)}Docker</span>
        ${Ke("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${r(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,d=o.service?0:1;return l-d||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${r(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${r(i.service)}</span>`:""}</td>
        <td>${Ke(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
        <td class="cell-number">${i.cpu_percent===null||i.cpu_percent===void 0?"\u2014":`${c(i.cpu_percent)}%`}</td>
        <td class="cell-number">${Ne(i.memory_used)}${i.memory_limit?` / ${Ne(i.memory_limit)}`:""}</td>
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
  </section>`}function $g(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",n=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${ps("\u8CC7\u6599\u5EAB",`<code>${r(s.database||"\u2014")}</code>`)}
           ${ps("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${Ne(s.storage_bytes)}</strong>`)}
           ${ps("Docker volume",`<strong>${Ne(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${ps("\u9023\u7DDA\u6578",`<strong>${c(s.connections)}</strong>`)}`:`${ps("Collection",`<code>${r(s.collection||"\u2014")}</code>`)}
           ${ps("Docker volume",`<strong>${Ne(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${ps("\u5411\u91CF\u9EDE\u6578",`<strong>${c(s.points_count)}</strong>`)}
           ${ps("Collections",`<strong>${c(s.collections)}</strong>`)}
           ${ps("Segments",`<strong>${c(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${r(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${r(s.kind||"")}</div>
          </div>
          ${Ke(i)}
        </div>
        <div class="resource-db-metrics">
          <div><span>CPU</span><strong>${s.cpu_percent===null||s.cpu_percent===void 0?"\u2014":`${c(s.cpu_percent)}%`}</strong></div>
          <div><span>RAM</span><strong>${Ne(s.memory_used)}</strong><small>${s.memory_limit?` / ${Ne(s.memory_limit)}`:""}</small></div>
          <div><span>\u5BB9\u5668</span><strong class="mono">${r(s.container||"\u2014")}</strong><small>${r(s.container_status||"\u2014")}</small></div>
        </div>
        <div class="detail-list">${o}</div>
        ${n.length?`<div class="resource-table-wrap">
                <table class="data-table is-compact">
                  <thead><tr><th scope="col">\u8CC7\u6599\u8868</th><th scope="col">\u5927\u5C0F</th></tr></thead>
                  <tbody>${n.map(l=>`<tr>
                        <td class="mono">${r(l.name||"\u2014")}</td>
                        <td class="cell-number">${Ne(l.bytes)}</td>
                      </tr>`).join("")}</tbody>
                </table>
              </div>`:""}
        <div class="side-card-foot">${r(s.detail||"")}</div>
      </article>`}).join("")}</div>`}function sa(e,t,s,a){let n=Number(t)||0,i=a?n/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${r(e)}</span>
      <strong>${Ne(n)}</strong>
    </div>
    ${lc(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function yg(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},n=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},d=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${g("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${Ne(d)}</span>
    </div>
    <div class="storage-list">
      ${sa("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${r(s.frontend_path||"\u2014")}</span>`,d)}
      ${sa("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${r(s.backend_path||"\u2014")}</span>`,d)}
      ${sa("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",n.layers_bytes,`Images ${Ne(n.images_bytes)} \xB7 Containers ${Ne(n.containers_bytes)} \xB7 Build cache ${Ne(n.build_cache_bytes)}`,d)}
      ${sa("PostgreSQL volume",o.size_bytes,`<span class="mono">${r(o.name||"\u2014")}</span>`,d)}
      ${sa("Qdrant volume",l.size_bytes,`<span class="mono">${r(l.name||"\u2014")}</span>`,d)}
      ${sa("Parquet",a.total_bytes,`\u6CD5\u898F ${Ne(a.law_bytes)} \xB7 \u5224\u6C7A ${Ne(a.judgment_bytes)}`,d)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${Ne(d)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function wg(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},n=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),d=Array.isArray(e.disk)?e.disk:[],p=d[0]||{},f=Number(o.total_bytes||p.total||0),$=f?l/f*100:0,h=[s.load_1,s.load_5,s.load_15].map(_=>_??"\u2014").join(" / "),u=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":fe(Number(t.uptime_seconds)*1e3),b=[p.label?Ds("HDD \u5DF2\u4F7F\u7528","database",`${c(p.percent)}%`,`${Ne(p.used)} / ${Ne(p.total)} \xB7 \u5269\u9918 ${Ne(p.free)}<br><span class="mono">${r(p.path||"")}</span>`,p.percent):"",l?Ds("Judgment \u5143\u4EF6\u5408\u8A08","layers",Ne(l),`\u7D04\u5360 HDD ${c($)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,$):"",...d.slice(1).map(_=>Ds(`\u786C\u789F \xB7 ${_.label}`,"layers",`${c(_.percent)}%`,`${Ne(_.used)} / ${Ne(_.total)} \xB7 \u5269\u9918 ${Ne(_.free)}<br><span class="mono">${r(_.path||"")}</span>`,_.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${ye(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${Ds("CPU \u4F7F\u7528\u7387","cpu",`${c(s.percent)}%`,`${c(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${c(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${r(h)}`,s.percent)}
      ${Ds("\u8A18\u61B6\u9AD4","server",`${c(a.percent)}%`,`${Ne(a.used)} / ${Ne(a.total)} \xB7 \u53EF\u7528 ${Ne(a.available)}`,a.percent)}
      ${Ds("Swap","layers",`${c(n.percent)}%`,`${Ne(n.used)} / ${Ne(n.total)}`,n.percent)}
      ${Ds("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${c(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${r(u)}<br>${r(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${b||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${yg(e)}
    ${vg(e)}
    ${$g(e)}`}function sc(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function _g(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SYSTEM RESOURCE USAGE</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Oe({tone:"danger",title:"\u8CC7\u6E90 API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-resources-retry">
          ${g("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function kg(e){return e.status==="operational"?{label:"\u5DF2\u9023\u7DDA",badge:"badge-ok"}:{label:"\u7121\u6CD5\u9023\u7DDA",badge:"badge-danger"}}function Sg(e,t){let s=kg(e),a=Array.isArray(e.models)?e.models:[],n=a.length?a.map(i=>{let o=String(i.name||""),l=e.chat_model===o,d=e.embedding_model===o,p=i.size?Ne(i.size):"",f=i.modified_at?ye(i.modified_at):"",$=new Set((i.capabilities||[]).map(u=>String(u||"").toLowerCase())),h=[];return i.supports_chat===!0&&h.push(["Chat","badge-ok"]),$.has("embedding")&&h.push(["Embedding","badge-info"]),$.has("vision")&&h.push(["Vision","badge-neutral"]),$.has("tools")&&h.push(["Tools","badge-neutral"]),$.has("thinking")&&h.push(["Thinking","badge-neutral"]),$.has("speech")&&h.push(["Speech","badge-warn"]),i.is_reranker&&h.push(["Reranker","badge-neutral"]),h.length||h.push([i.capability_status==="untested"?"\u672A\u6E2C\u8A66":"\u7121 chat \u80FD\u529B","badge-neutral"]),`<div class="ollama-model-row">
            <div class="ollama-model-main">
              <strong>${r(o)}</strong>
              <span class="ollama-model-meta">${[p,f].filter(Boolean).map(u=>r(u)).join(" \xB7 ")||"\u2014"}</span>
              <div class="ollama-model-capabilities">${h.map(([u,b])=>`<span class="badge ${b}">${r(u)}</span>`).join("")}</div>
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
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="edit-host" data-id="${e.id}">${g("edit",13)}<span>\u7DE8\u8F2F</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="delete-host" data-id="${e.id}">${g("trash",13)}<span>\u522A\u9664</span></button>
      </div>
    </div>
    <div class="ollama-model-list">${n}</div>
  </article>`}function xg(e,t,s,a){if(s)return`<div class="report-card">
      ${Oe({tone:"danger",title:"Model Provider \u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${g("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=e||{hosts:[],active_host_id:null},i=Array.isArray(n.hosts)?n.hosts:[],o=a?i.find(p=>Number(p.id)===Number(a)):null,l=o?o.base_url.replace(new RegExp(`:${o.port}$`),""):"http://127.0.0.1",d=o?"\u5132\u5B58\u8B8A\u66F4":"\u65B0\u589E\u4E3B\u6A5F";return`<div class="report-card ollama-card">
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
          <button class="btn btn-primary btn-sm" type="submit">${g("check",13)}<span>${d}</span></button>
          ${o?'<button class="btn btn-ghost btn-sm" type="button" data-ollama-action="cancel-host-edit">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
        </div>
      </form>
      ${t?'<div class="ollama-loading"><span class="spinner"></span><span>\u8B80\u53D6 llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span></div>':i.length?`<div class="ollama-host-list">${i.map(p=>Sg(p,a)).join("")}</div>`:ft({iconName:"server",title:"\u5C1A\u672A\u8A2D\u5B9A llama-server \u4E3B\u6A5F",text:"\u8ACB\u5728\u4E0A\u65B9\u8F38\u5165\u7DB2\u5740\u8207 Port \u65B0\u589E\uFF0C\u6216\u4F7F\u7528 .env \u7684\u9810\u8A2D\u9023\u7DDA\u3002"})}
      <p class="report-sub" style="margin-top:12px">\u8A2D\u70BA\u804A\u5929\u6216\u5D4C\u5165\u6A21\u578B\u5F8C\uFF0C\u7CFB\u7D71\u6703\u4F7F\u7528\u76EE\u524D\u4E3B\u6A5F\u7684\u5C0D\u61C9\u6A21\u578B\u57F7\u884C AI \u51FA\u984C\u8207 RAG\uFF1B\u672A\u8A2D\u5B9A\u6642\u6CBF\u7528 .env \u7684 LLM_MODEL\uFF0FEMBEDDING_MODEL\u3002</p>
    </div>
  </div>`}function Ag(e,t,s,a=!1){let n=e?.data||{},i=e?Ot(e.status):null,o=s?Ot(s.status):null,l={overview:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(i.label)}</span>`:"",resources:o?`<span class="badge ${o.tone==="ok"?"badge-ok":o.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(o.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${c(n.version_count)}</span>`,tests:'<span class="badge badge-neutral badge-mono">TEST</span>',"local-model":'<span class="badge badge-neutral badge-mono">LLAMA-SERVER</span>',runs:`<span class="badge badge-neutral badge-mono">${c(n.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${ic.map(d=>{let p=d.id===t,f=a&&rc.has(d.id);return`<button class="status-tab${p?" is-active":""}${f?" is-demo-locked":""}" type="button"
          data-status-tab="${d.id}" ${p?'aria-current="page"':""} ${f?'data-demo-lock-tooltip="\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B\u6B64\u7BA1\u7406\u529F\u80FD"':""}>
          <span class="status-tab-icon">${g(d.icon,15)}</span>
          <span class="status-tab-copy">
            <strong>${r(d.label)}</strong>
            <small>${r(d.hint)}</small>
          </span>
          ${f?'<span class="badge badge-neutral badge-mono">LOCK</span>':l[d.id]||""}
        </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u6AA2\u67E5\u6642\u9593</span>
      <span class="mono">${r(e?ye(e.checked_at):"\u2014")}</span>
    </div>`}function qg(e,t,s,a,n,i,o,l=!1){if(e==="resources")return s?wg(s):a?sc():n?_g(n):sc();if(e==="local-model"){let d=i||{},p=!!d.loading||!d.hosts&&!d.error;return xg(d.hosts||null,p,d.error||null,d.editingId||null)}return e==="architecture"?mg(t,l):e==="api"?gg(t):e==="data"?fg(t,o):e==="runs"?bg(t):pg(t)}function Mg(){return`<div class="status-hero">
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
    </div>`}function ac(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u5FEB\u53D6\u6216\u63A8\u6E2C\u7684\u670D\u52D9\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Oe({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${g("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function Lg(e,t){let s=zt(),a=!1,n=null,i=null,o="overview",l=null,d=!1,p=null,f=null,$=!1,h=null,u=null,b=null,_=!1,k=null,A=!1,S=!1,v=null,j=0,W="",Y="",we=performance.now(),be=new Date().toISOString(),ne=!1;e.innerHTML=`<section class="page status-page">
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
      <section class="status-panel" id="status-content">${Mg()}</section>
    </div>
  </section>`;let M=e.querySelector("#status-nav"),q=e.querySelector("#status-content"),T=e.querySelector("#refresh-status"),X=e.querySelector("#auto-refresh"),me=()=>{if(j+=1,typeof v=="function")try{v()}catch{}v=null,A=!1,S=!1},V=async()=>{let ge=++j;S=!0,Y="",q.innerHTML="";try{let ee=await ui(q,{setTitle:()=>{}},{embedded:!0});if(ge!==j||o!=="tests"){typeof ee=="function"&&ee();return}v=typeof ee=="function"?ee:null,A=!0}catch(ee){ge===j&&o==="tests"&&(q.innerHTML=ac(ee))}finally{ge===j&&(S=!1)}},de=()=>{if(!i)return;let ge=Ag(i,o,l,s);if(ge!==W&&(M.innerHTML=ge,W=ge),s&&rc.has(o)){me();let ue=Ts("\u6B64\u5206\u985E\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u670D\u52D9\u7E3D\u89BD\u3001\u524D\u5F8C\u7AEF\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u4E0B\u8F09\uFF1B\u7CFB\u7D71\u6E2C\u8A66\u3001\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528\u3001Model Provider \u8207 OpenAPI \u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002");q.innerHTML!==ue&&(q.innerHTML=ue),Y=ue;return}if(o==="tests"){!A&&!S&&V();return}me();let ee=qg(o,i,l,d,p,{hosts:f,loading:$,error:h,editingId:u},{info:b,loading:_,error:k},s);ee!==Y&&(q.innerHTML=ee,Y=ee)},Ae=async({quiet:ge=!1}={})=>{if(!d){d=!0,p=null,o==="resources"&&!l&&de();try{let ee=await J.systemUsage();if(a)return;l=ee}catch(ee){if(a)return;p=ee,ge||N(ee.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{a||(d=!1,o==="resources"&&de())}}},I=async({quiet:ge=!1}={})=>{if(!_){_=!0,k=null,o==="data"&&!b&&de();try{let ee=await co();if(a)return;b=ee}catch(ee){if(a)return;k=ee,ge||N(ee.message||"\u7121\u6CD5\u8B80\u53D6 IndexedDB\u3002","danger")}finally{a||(_=!1,o==="data"&&de())}}},Se=async({quiet:ge=!1}={})=>{if(!$){$=!0,h=null,o==="local-model"&&!f&&de();try{let ee=await J.ollamaHosts();if(a)return;f=ee}catch(ee){if(a)return;h=ee,ge||N(ee.message||"\u7121\u6CD5\u53D6\u5F97 llama-server \u4E3B\u6A5F\u3002","danger")}finally{a||($=!1,o==="local-model"&&de())}}},oe=async()=>{await Se({quiet:!0}),await ke({quiet:!0})},ke=async({quiet:ge=!1,status:ee=null}={})=>{ge||(T.disabled=!0,Ee(T,!0,"\u6AA2\u67E5\u4E2D\u2026"));let ue=performance.now(),ve=new Date().toISOString(),qe=ue,Be=ve;try{let P=ee||await J.status();if(qe=performance.now(),Be=new Date().toISOString(),a)return;let B=!ee&&!ne?Math.max(0,ue-we):0;P.page_pipeline=P.pipeline||!i?.page_pipeline?dg(P,{initMs:B,initStartedAt:be,requestStartedAt:ve,requestFinishedAt:Be,requestMs:qe-ue}):i.page_pipeline,ne=!0,i=P,ss(ec,P),de(),ge||N("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(P){if(a)return;o!=="tests"&&(Y="",q.innerHTML=ac(P)),ge||N(P.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{a||(T.disabled=!1,Ee(T,!1))}},Re=async({quiet:ge=!1,status:ee=null}={})=>{if(await ke({quiet:ge,status:ee}),!s&&(o==="resources"&&await Ae({quiet:ge}),o==="local-model"&&await Se({quiet:ge}),!ge&&o==="tests")){let ue=q.querySelector("#tests-refresh");ue&&ue.click()}};M.addEventListener("click",ge=>{let ee=ge.target.closest("[data-status-tab]");if(!ee)return;let ue=ee.dataset.statusTab;ic.some(ve=>ve.id===ue)&&(o=ue,de(),!s&&(o==="resources"&&!l&&!d&&Ae(),o==="data"&&!b&&!_&&I(),o==="local-model"&&Se()))}),q.addEventListener("click",ge=>{ge.target.closest("#status-retry")&&ke(),ge.target.closest("#status-resources-retry")&&Ae()}),q.addEventListener("click",async ge=>{let ee=ge.target.closest("[data-ollama-action]");if(!ee)return;let ue=ee.dataset.ollamaAction,ve=Number(ee.dataset.id||0);if(ue==="refresh-hosts"){await Se();return}if(ue==="edit-host"){u=ve,de(),e.querySelector(".ollama-host-form")?.scrollIntoView({behavior:"smooth",block:"center"});return}if(ue==="cancel-host-edit"){u=null,de();return}if(ue==="delete-host"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 llama-server \u4E3B\u6A5F #${ve}\uFF1F`))return;try{await J.deleteOllamaHost(ve),Number(u)===ve&&(u=null),N("llama-server \u4E3B\u6A5F\u5DF2\u522A\u9664\u3002","info"),await oe()}catch(qe){N(qe.message||"\u522A\u9664\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(ue==="activate-host"){try{await J.activateOllamaHost(ve),N("\u5DF2\u5207\u63DB\u4F7F\u7528\u7684 llama-server \u4E3B\u6A5F\u3002","ok"),await oe()}catch(qe){N(qe.message||"\u5207\u63DB\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(ue==="deactivate-host"){try{await J.deactivateOllamaHosts(),N("\u5DF2\u505C\u7528\u6307\u5B9A\u7684 llama-server \u4E3B\u6A5F\uFF0C\u5C07\u6CBF\u7528 .env \u8A2D\u5B9A\u3002","info"),await oe()}catch(qe){N(qe.message||"\u505C\u7528\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(ue==="check-capabilities"){Ee(ee,!0,"\u6AA2\u67E5\u4E2D\u2026");try{await J.checkOllamaCapabilities(),N("\u5DF2\u66F4\u65B0\u6240\u6709\u4E3B\u6A5F\u7684\u6A21\u578B\u80FD\u529B\u3002","ok",4e3),await oe()}catch(qe){N(qe.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u80FD\u529B\u3002","danger",7e3)}finally{Ee(ee,!1)}return}if(ue==="select-model"||ue==="clear-model"){let qe=String(ee.dataset.model||""),Be=String(ee.dataset.role||"");try{ue==="select-model"?(await J.selectOllamaModel(ve,{model:qe,role:Be}),N(`\u5DF2\u8A2D\u5B9A ${Be==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\uFF1A${qe}`,"ok")):(await J.clearOllamaModel(ve,{model:qe,role:Be}),N(`\u5DF2\u53D6\u6D88 ${Be==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\u3002`,"info")),await oe()}catch(P){N(P.message||"\u6A21\u578B\u8A2D\u5B9A\u5931\u6557\u3002","danger")}}}),q.addEventListener("submit",async ge=>{let ee=ge.target.closest("form[data-ollama-form='host']");if(!ee)return;ge.preventDefault();let ue=new FormData(ee),ve=Number(ue.get("host_id")||0),qe={name:String(ue.get("name")||"").trim(),url:String(ue.get("url")||"").trim(),port:Number(ue.get("port")||11434)};try{ve?(await J.updateOllamaHost(ve,qe),N("llama-server \u4E3B\u6A5F\u5DF2\u66F4\u65B0\u3002","ok")):(await J.addOllamaHost(qe),N("llama-server \u4E3B\u6A5F\u5DF2\u65B0\u589E\u3002","ok")),u=null,await oe()}catch(Be){let P=Be.detail||Be.payload?.detail,B=P?.errors?.join(" \xB7 ")||P?.message||Be.message||"\u5132\u5B58\u4E3B\u6A5F\u5931\u6557\u3002";N(B,"danger",8e3)}}),q.addEventListener("toggle",ge=>{let ee=ge.target.closest?.(".status-wf-stage[data-status-wf-stage]");if(!ee||!q.contains(ee))return;let ue=ee.dataset.statusWfStage||"";ue&&(ee.open?pi.add(ue):pi.delete(ue))},!0),T.addEventListener("click",()=>Re());let Me=()=>{n&&(n(),n=null)};X&&X.addEventListener("change",()=>{Me(),X.checked&&(n=wt("status",(ge,ee)=>{a||Re({quiet:!0,status:ee?.snapshot||null})}),Re({quiet:!0}),N("\u5DF2\u555F\u7528\u5F8C\u7AEF\u63A8\u9001\u81EA\u52D5\u66F4\u65B0\uFF08\u6BCF 30 \u79D2\uFF09\u3002","info",2200))});let Pe=os(ec,120*1e3);return Pe?(i=Pe,ne=!0,de(),ke({quiet:!0})):await ke({quiet:!0}),I({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{a=!0,me(),Me()}}var cc="home",In={home:{page:Sr,title:"Judgment RAG Console \xB7 \u6CD5\u898F\u8207\u5224\u6C7A\u6AA2\u7D22"},rag:{page:Vr,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:Cr,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:di,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:Or,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:ri,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:mi,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:Nn,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"},admin:{page:fr,title:"\u7BA1\u7406\u8A2D\u5B9A \xB7 Judgment RAG Console"}},Bs=document.getElementById("app-main"),Cn=null,Pn=0;function Na(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||cc;return Object.prototype.hasOwnProperty.call(In,t)?t:cc}function jg(){try{let e=new URLSearchParams(window.location.search);if(!(!!e.get("q")?.trim()||!!e.get("share")?.trim())||Na()==="rag")return;window.history.replaceState(null,"",`${window.location.pathname}${window.location.search}#/rag`)}catch{}}function Tg(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function Eg(e){return`<section class="page">
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
  </section>`}async function Fs(){let e=Na(),t=++Pn;Tg(e);let s=`#/${e}`,a=window.location.hash;if(a!==s&&!a.startsWith(`${s}/`)&&window.history.replaceState(null,"",s),typeof Cn=="function"){try{Cn()}catch{}Cn=null}if(js(),!Ws()){if(e==="admin"){document.title="\u7BA1\u7406\u8A2D\u5B9A \xB7 Judgment RAG Console",Bs.innerHTML=rn();return}if(e==="tests"){document.title="\u5C55\u793A\u6A21\u5F0F \xB7 Judgment RAG Console",gr(Bs,e);return}if(!Ki()){document.title="\u5C55\u793A\u76EE\u524D\u672A\u958B\u653E \xB7 Judgment RAG Console",Yi(Bs);return}if(!mr(e)){document.title="\u5C55\u793A\u6A21\u5F0F \xB7 Judgment RAG Console",gr(Bs,e);return}}document.title=In[e].title;let n={route:e,navigate(i){In[i]&&(window.location.hash=`#/${i}`)},setTitle(i){t===Pn&&i&&(document.title=i)}};try{let i=In[e].page.render(Bs,n);Hi(),window.scrollTo({top:0,behavior:"auto"}),Bs.focus({preventScroll:!0});let o=await i;if(t!==Pn){typeof o=="function"&&o();return}Cn=typeof o=="function"?o:null}catch(i){if(t!==Pn)return;console.error("Failed to render route",e,i),Bs.innerHTML=Eg(i);let o=document.getElementById("route-retry");o&&o.addEventListener("click",()=>Fs()),N("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function Ng(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable))return;let a=Na(),n=a==="home"?"home-question":a==="rag"?"rag-question":"";if(!n)return;let i=document.getElementById(n);i&&(e.preventDefault(),i.focus())})}function Rg(){let e=document.querySelector('[data-route="processing"]');if(!e)return;let t=e.querySelector(".nav-update-badge");t||(t=document.createElement("span"),t.className="nav-update-badge",t.hidden=!0,e.appendChild(t));let s=0,a=0,n=0,i=()=>{let l=[];if(s>0&&l.push(`\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0F\u5224\u6C7A\u6709 ${s} \u9805\u4F86\u6E90\u66F4\u65B0`),a>0&&l.push(`\u5224\u6C7A\u532F\u5165\u5F85\u8655\u7406 ${a} \u500B\u6708`),n>0&&l.push(`Qdrant \u5411\u91CF\u7D22\u5F15\u5F85\u88DC ${n} \u500B\u6708`),!l.length){t.hidden=!0;return}let d=(s>0?1:0)+(a>0?1:0)+(n>0?1:0);t.textContent=String(d===1?s||a||n:d),t.title=l.join("\uFF1B"),t.hidden=!1},o=async(l=null)=>{try{let d=l||await J.updatesStatus();s=Number(d.update_count)||0,d&&Object.prototype.hasOwnProperty.call(d,"import_pending_count")&&(a=Number(d.import_pending_count)||0),d&&Object.prototype.hasOwnProperty.call(d,"index_pending_count")&&(n=Number(d.index_pending_count)||0),i()}catch{t.hidden=!0}};o(),wt("updates",(l,d)=>o(d?.snapshot||null)),window.addEventListener("judgment:processing-pending",l=>{a=Number(l.detail?.count)||0,l.detail&&Object.prototype.hasOwnProperty.call(l.detail,"index_pending")&&(n=Number(l.detail.index_pending)||0),i()}),window.addEventListener("judgment:updates-changed",()=>o())}function Cg(e,t){return!e||!t?!0:!!e.admin!=!!t.admin||!!e.enabled!=!!t.enabled||String(e.expiresAt||"")!==String(t.expiresAt||"")||JSON.stringify(e.features||{})!==JSON.stringify(t.features||{})}async function dc(){jg();let e=Na();e==="processing"?J.processing({cached:!0,slim:!0}).catch(()=>null):e==="quality"&&J.quality({cached:!0}).catch(()=>null);let t=Vi();t&&Wi(t);let s=nn();tn(),Ua(),Ui(),Ng();let a=!1,n=()=>{Ws()&&!a&&(Rg(),a=!0)};window.addEventListener("hashchange",Fs),window.addEventListener("judgment:auth-changed",async()=>{let o=await nn();Ja(o.me),n(),js(),Fs()}),window.addEventListener("judgment:demo-denied",async()=>{let o=await nn();Ja(o.me),n(),js(),Fs()}),t&&(tr({user:t.me}),n(),js(),Fs());let i=await s;t?(Ja(i.me),n(),js(),Cg(t,i)&&Fs()):(tr({user:i.me}),n(),js(),Fs()),Fa()&&window.setTimeout(()=>{let o=Na();(o==="rag"||o==="admin")&&(window.location.hash=Ws()?"#/tests":"#/home")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",dc):dc();})();
