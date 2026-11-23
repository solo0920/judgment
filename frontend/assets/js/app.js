(()=>{var Cc=Object.defineProperty;var hs=(e,t)=>{for(var s in t)Cc(e,s,{get:t[s],enumerable:!0})};var er="judgment.api_base",Fs="judgment.admin_token",sr="http://127.0.0.1:9200",Rt=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function Ni(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function $s(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${Ni(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function ar(e){let t=$s(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function nr(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?$s(e.get("api")):null}catch{return null}}function rr(){try{let e=window.localStorage.getItem(er);return e===null?null:$s(e)}catch{return null}}function ir(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return $s(e||"")}function cs(){let e=nr();if(e!==null)return e;let t=rr();if(t!==null)return t;let s=ir();return s||(window.location.protocol==="file:"?sr:"")}function Pc(){if(nr()!==null)return!0;let e=rr();return e!==null?!!e:!!ir()}function as(){return nr()!==null?"query":rr()!==null?"storage":ir()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function Va(){return Pc()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!Ni(window.location.hostname)}function or(e){let t=$s(e);try{t?window.localStorage.setItem(er,t):window.localStorage.removeItem(er)}catch{}return t}function Ka(){try{let e=String(window.sessionStorage.getItem(Fs)||"").trim();if(e)return e;let t=String(window.localStorage.getItem(Fs)||"").trim();return t?(window.sessionStorage.setItem(Fs,t),window.localStorage.removeItem(Fs),t):""}catch{return""}}function Ya(e){let t=String(e||"").trim();try{t?window.sessionStorage.setItem(Fs,t):window.sessionStorage.removeItem(Fs),window.localStorage.removeItem(Fs)}catch{}return t}function tr(){return as()==="query"?"":Ka()}function Ls(e=cs()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function Lt(e,t=cs()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function Zn(){return as()==="query"?"":cs()}async function Ic(){let e=tr(),t={Accept:"application/json"};e&&(t["X-Judgment-Admin-Token"]=e);try{let s=await fetch(Lt("/api/auth/sse-ticket"),{method:"POST",headers:t,credentials:"include"});if(!s.ok)return"";let a=await s.json();return String(a.ticket||"")}catch{return""}}function Ct(e,t,{onError:s=null,onProgress:a=null}={}){if(document.body.classList.contains("is-demo-visitor"))return()=>{};let n=(Array.isArray(e)?e:[e]).map(b=>String(b||"").trim()).filter(Boolean);if(!n.length||typeof EventSource>"u")return()=>{};let i=null,o=0,l=!1,d=null,u=b=>{let p={};try{p=JSON.parse(b.data||"{}")}catch{p={}}p.initial&&o<=1&&!p.snapshot||t?.(p.topic||n[0],p)},f=b=>{let p={};try{p=JSON.parse(b.data||"{}")}catch{p={}}a?.(p.topic||n[0],p)},y=async()=>{if(l)return;let b=await Ic();if(l)return;let p=new URLSearchParams({topic:n.join(",")});b&&p.set("ticket",b),i=new EventSource(Lt(`/api/events/stream?${p.toString()}`),{withCredentials:!0}),i.onopen=()=>{o+=1,d&&(window.clearTimeout(d),d=null)},i.addEventListener("refresh",u),i.addEventListener("progress",f),i.onerror=()=>{s?.(),!(l||!i)&&(i.close(),i=null,!d&&(d=window.setTimeout(()=>{d=null,y()},3e3)))}};return y(),()=>{l=!0,d&&(window.clearTimeout(d),d=null),i&&(i.removeEventListener("refresh",u),i.removeEventListener("progress",f),i.close(),i=null)}}var Ja=new Map,Wa=new Map;function Dc({cached:e=!1}={}){let t=e?"/api/quality?cached=1":"/api/quality",s=Wa.get(t);if(s)return s;let a=Z(t,{timeout:18e4,trackClient:!1});Wa.set(t,a);let n=()=>window.setTimeout(()=>{Wa.get(t)===a&&Wa.delete(t)},1500);return a.then(n,n),a}function Fc({cached:e=!1,slim:t=!1}={}){let s=new URLSearchParams;e&&s.set("cached","1"),t&&s.set("slim","1");let a=s.toString(),n=`/api/processing${a?`?${a}`:""}`,i=Ja.get(n);if(i)return i;let o=Z(n,{timeout:45e3,trackClient:!1});Ja.set(n,o);let l=()=>window.setTimeout(()=>{Ja.get(n)===o&&Ja.delete(n)},1500);return o.then(l,l),o}function lr(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function Z(e,t={}){let{base:s,...a}=t,n=s!==void 0?$s(s):cs(),i=new AbortController,o=t.timeout===void 0?3e4:t.timeout,l=o>0?window.setTimeout(()=>i.abort(),o):null,d=Date.now(),u=performance.now(),f=t.requestId||Ri(),y={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":f,"X-Judgment-Client-Started-At":String(d),...tr()?{"X-Judgment-Admin-Token":tr()}:{},...t.headers||{}},b;try{b=await fetch(Lt(e,n),{...a,headers:y,credentials:"include",signal:i.signal})}catch(k){throw k.name==="AbortError"?new Rt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new Rt(lr(n),0,k)}finally{l&&window.clearTimeout(l)}let p=null;if((b.headers.get("content-type")||"").includes("application/json"))try{p=await b.json()}catch{p=null}else try{p=await b.text()}catch{p=null}let w=performance.now(),q=b.headers.get("X-Judgment-Request-Id")||f;if(t.trackClient!==!1&&q){let k=Math.round(performance.now()-u);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{Ci({request_id:q,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:k,render_ms:Math.max(0,Math.round(performance.now()-w)),status:b.ok?"success":"failed"})})})}if(!b.ok){b.status===403&&p&&typeof p=="object"&&["demo_closed","demo_hard_disabled"].includes(p.code)&&window.dispatchEvent(new CustomEvent("judgment:demo-denied",{detail:p}));let k=p&&typeof p=="object"?p.detail||p.message:p,S=typeof k=="string"&&k?k:`\u4F3A\u670D\u5668\u56DE\u61C9 ${b.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new Rt(S,b.status,k)}return p}function Ri(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function Ci(e){if(!document.body.classList.contains("is-demo-visitor"))try{fetch(Lt("/api/performance/client",cs()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),credentials:"include",keepalive:!0}).catch(()=>{})}catch{}}async function Pi(e){let t=$s(e);if(!ar(t))throw new Rt("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,n=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(Lt("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new Rt(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof Rt?i:i.name==="AbortError"?new Rt("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new Rt(lr(t),0,i)}finally{window.clearTimeout(n)}}var O={health(){return Z("/api/health")},authMe(){return Z("/api/auth/me",{base:Zn(),trackClient:!1})},authLogout(){return Z("/api/auth/logout",{method:"POST",base:Zn(),trackClient:!1})},authLogoutAll(){return Z("/api/auth/logout-all",{method:"POST",base:Zn(),trackClient:!1})},demoStatus(){return Z("/api/demo/status",{timeout:15e3,trackClient:!1})},adminDemo(){return Z("/api/admin/demo",{timeout:15e3,trackClient:!1})},updateDemo(e){return Z("/api/admin/demo",{method:"PUT",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},adminSecurityAudit(e=20){return Z(`/api/admin/security-audit?limit=${encodeURIComponent(e)}`,{timeout:15e3,trackClient:!1})},closeDemo(){return Z("/api/admin/demo/close",{method:"POST",body:JSON.stringify({}),timeout:3e4,trackClient:!1})},demoAudit(e=20){let t=new URLSearchParams({limit:String(e)});return Z(`/api/admin/demo/audit?${t.toString()}`,{timeout:15e3,trackClient:!1})},status(){return Z("/api/status",{trackClient:!1})},ollamaHosts(){return Z("/api/llama-server/hosts",{timeout:3e4,trackClient:!1})},addOllamaHost(e){return Z("/api/llama-server/hosts",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},updateOllamaHost(e,t){return Z(`/api/llama-server/hosts/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},deleteOllamaHost(e){return Z(`/api/llama-server/hosts/${encodeURIComponent(e)}`,{method:"DELETE",timeout:3e4,trackClient:!1})},activateOllamaHost(e){return Z(`/api/llama-server/hosts/${encodeURIComponent(e)}/activate`,{method:"POST",timeout:3e4,trackClient:!1})},deactivateOllamaHosts(){return Z("/api/llama-server/hosts/deactivate",{method:"POST",timeout:3e4,trackClient:!1})},reorderOllamaHosts(e){return Z("/api/llama-server/hosts/reorder",{method:"POST",body:JSON.stringify({host_ids:e}),timeout:3e4,trackClient:!1})},checkOllamaCapabilities(){return Z("/api/llama-server/hosts/capabilities/test",{method:"POST",timeout:18e4,trackClient:!1})},selectOllamaModel(e,t){return Z(`/api/llama-server/hosts/${encodeURIComponent(e)}/models/select`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},clearOllamaModel(e,t){return Z(`/api/llama-server/hosts/${encodeURIComponent(e)}/models/clear`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},systemUsage(){return Z("/api/system-usage",{trackClient:!1})},indexVersions(){return Z("/api/index-versions",{trackClient:!1})},indexVersion(e){return Z(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return Z(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return Z(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return Z("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){return Z("/api/index-alias/reconcile",{method:"POST",body:JSON.stringify({repair:!!e}),trackClient:!1})},catalog(){return Z("/api/catalog")},homeSummary(){return Z("/api/home")},judgmentStats(){return Z("/api/judgment-stats")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return Z("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},dataSuggest({kind:e,query:t="",limit:s=12}){let a=new URLSearchParams({kind:e,query:t,limit:String(s)});return Z(`/api/data/suggest?${a.toString()}`,{timeout:45e3,trackClient:!1})},schemaSuggest({database:e,table:t,column:s,query:a,limit:n=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(n)});return Z(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let n=new URLSearchParams({law_key:e});return t&&n.set("source_type",t),s&&n.set("version_id",String(s)),a&&n.set("article_no",String(a)),Z(`/api/law?${n.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),Z(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return Z("/api/test-mode",{trackClient:!1})},llmModels(){return Z("/api/llm/models",{timeout:6e4,trackClient:!1})},testLlmModels(){return Z("/api/llm/models/test",{method:"POST",timeout:12e4,trackClient:!1})},rerankStatus(){return Z("/api/rerank/status",{timeout:6e4,trackClient:!1})},testReranker(){return Z("/api/rerank/test",{method:"POST",timeout:12e4,trackClient:!1})},selectLlmModel(e,t=null){return Z("/api/llm/model",{method:"POST",body:JSON.stringify({model:e,host_id:t}),timeout:3e4,trackClient:!1})},setTestMode(e){return Z("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return Z(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return Z("/api/test-runs/current",{trackClient:!1})},testRun(e){return Z(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return Z("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))i==null||i===""||a.set(n,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),Z(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality({cached:e=!1}={}){return Dc({cached:e})},demoQuality(){return Z("/api/demo/quality",{timeout:2e4,trackClient:!1})},processing({cached:e=!1,slim:t=!1}={}){return Fc({cached:e,slim:t})},demoProcessing(){return Z("/api/demo/processing",{timeout:2e4,trackClient:!1})},processingActive(){return Z("/api/processing/active",{timeout:3e3,trackClient:!1})},judgmentDownloadStatus(){return Z("/api/judgment-download/status",{timeout:3e4,trackClient:!1})},versioningSummary(){return Z("/api/versioning/summary",{trackClient:!1})},updatesStatus(){return Z("/api/updates/status",{trackClient:!1})},checkCourts(){return Z("/api/courts/check",{timeout:6e4,trackClient:!1})},checkLawVersions(){return Z("/api/law-versions/check",{timeout:6e4,trackClient:!1})},checkUpdates(e=[]){let t=Array.isArray(e)&&e.length?{source_types:e}:{};return Z("/api/updates/check",{method:"POST",body:JSON.stringify(t),timeout:12e4,trackClient:!1})},versioningSnapshots(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.limit&&t.set("limit",String(e.limit)),Z(`/api/versioning/judgments/snapshots?${t.toString()}`,{trackClient:!1})},versioningChanges(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit)),Z(`/api/versioning/judgments/changes?${t.toString()}`,{trackClient:!1})},versioningJudgment(e){return Z(`/api/versioning/judgments/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVersion(e){return Z(`/api/versioning/judgments/versions/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVector(e,t){return Z(`/api/versioning/judgments/${encodeURIComponent(e)}/vectors/${encodeURIComponent(t)}`,{trackClient:!1})},versioningAudit(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit||500)),Z(`/api/versioning/audit?${t.toString()}`,{trackClient:!1})},questionBankStats(){return Z("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))if(!(i==null||i==="")){if(Array.isArray(i)){for(let o of i)o==null||o===""||a.append(n,String(o));continue}a.set(n,String(i))}return a.set("limit",String(t)),a.set("offset",String(s)),Z(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankTags(e="",t=12){let s=new URLSearchParams({query:e,limit:String(t)});return Z(`/api/question-bank/tags?${s.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return Z(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return Z("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},createQuestionBankItemWithAI(e){return Z("/api/question-bank/ai-items",{method:"POST",body:JSON.stringify(e),timeout:42e4,trackClient:!1})},updateQuestionBankItem(e,t){return Z(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return Z(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},restoreQuestionBankItem(e){return Z(`/api/question-bank/items/${encodeURIComponent(e)}/restore`,{method:"POST",timeout:45e3,trackClient:!1})},submitQuestionBankItemForReview(e){return Z(`/api/question-bank/items/${encodeURIComponent(e)}/submit`,{method:"POST",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return Z(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return Z("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return Z(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return Z("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return Z(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return Z("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},benchmarkSuiteLatestAnswers(e){return Z(`/api/benchmark/suites/${encodeURIComponent(e)}/latest-answers`,{timeout:45e3,trackClient:!1})},removeBenchmarkSuiteItem(e,t){return Z(`/api/benchmark/suites/${encodeURIComponent(e)}/items/${encodeURIComponent(t)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return Z("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return Z(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return Z(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return Z(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return Z("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return Z(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return Z(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return Z(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return Z("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return Z(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return Z("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return Z(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return Z("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return Z("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return Z("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},ragShareCreate(e){return Z("/api/rag/share",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},ragShareGet(e){return Z(`/api/rag/share/${encodeURIComponent(e)}`,{timeout:3e4,trackClient:!1})},ragFeedbackCreate(e){return Z("/api/rag/feedback",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},ragFeedbackStats(){return Z("/api/rag/feedback/stats",{timeout:3e4,trackClient:!1})},ragFeedbackList(e={}){let t=new URLSearchParams;for(let[a,n]of Object.entries(e))n==null||n===""||t.set(a,String(n));let s=t.toString()?`?${t.toString()}`:"";return Z(`/api/rag/feedback${s}`,{timeout:45e3,trackClient:!1})},ragFeedbackIssues(e={}){let t=new URLSearchParams;for(let[a,n]of Object.entries(e))n==null||n===""||t.set(a,String(n));let s=t.toString()?`?${t.toString()}`:"";return Z(`/api/rag/feedback-issues${s}`,{timeout:3e4,trackClient:!1})},ragFeedbackIssueCreate(e){return Z("/api/rag/feedback-issues",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},ragFeedbackIssueUpdate(e,t){return Z(`/api/rag/feedback-issues/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},ragFeedbackDetail(e){return Z(`/api/rag/feedback/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},ragFeedbackUpdate(e,t){return Z(`/api/rag/feedback/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},ragFeedbackPromote(e){return Z(`/api/rag/feedback/${encodeURIComponent(e)}/promote`,{method:"POST",body:JSON.stringify({}),timeout:6e4,trackClient:!1})},ragFeedbackRerun(e){return Z(`/api/rag/feedback/${encodeURIComponent(e)}/rerun`,{method:"POST",body:JSON.stringify({}),timeout:3e5,trackClient:!1})},ragReviewQueue(e={}){let t=new URLSearchParams;for(let[a,n]of Object.entries(e))n==null||n===""||t.set(a,String(n));let s=t.toString()?`?${t.toString()}`:"";return Z(`/api/rag/feedback/review-queue${s}`,{timeout:45e3,trackClient:!1})},ragReviewCandidate(e){return Z(`/api/rag/feedback/review-queue/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},ragReviewMark(e,t){return Z(`/api/rag/feedback/review-queue/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},ragFeedbackExperiment(e){return Z("/api/rag/feedback/experiments",{method:"POST",body:JSON.stringify(e),timeout:9e5,trackClient:!1})},ragFeedbackExperiments(e=20){return Z(`/api/rag/feedback/experiments?limit=${encodeURIComponent(e)}`,{timeout:3e4,trackClient:!1})},ragFeedbackEvaluate(e){return Z("/api/rag/feedback/evaluate",{method:"POST",body:JSON.stringify(e),timeout:6e5,trackClient:!1})},ragFeedbackEvaluations(e=20){return Z(`/api/rag/feedback/evaluations?limit=${encodeURIComponent(e)}`,{timeout:3e4,trackClient:!1})},async ragFeedbackExport(e={}){let t=new URLSearchParams;for(let[a,n]of Object.entries(e))n==null||n===""||t.set(a,String(n));let s=t.toString()?`?${t.toString()}`:"";return Z(`/api/rag/feedback/export${s}`,{timeout:6e4,trackClient:!1})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onQueued:n=null,onToken:i=null,onTokenReset:o=null}={}){let l=cs(),d=new AbortController,u=t?0:3e5,f=u>0?window.setTimeout(()=>d.abort(),u):null,y=Date.now(),b=performance.now(),p=Ri(),v={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":p,"X-Judgment-Client-Started-At":String(y)},w;try{w=await fetch(Lt("/api/rag/query/stream",l),{method:"POST",headers:v,body:JSON.stringify({question:e}),credentials:"include",signal:d.signal})}catch(P){throw P.name==="AbortError"?new Rt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new Rt(lr(l),0,P)}finally{f&&window.clearTimeout(f)}if(!w.ok){let P=null;try{P=await w.json()}catch{P=null}let Y=P&&typeof P=="object"&&P.detail?String(P.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${w.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new Rt(Y,w.status,P)}if(!w.body)throw new Rt("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let q=w.body.getReader(),k=new TextDecoder,S="",$=null,L=null;try{for(;;){let{value:P,done:Y}=await q.read();if(Y)break;S+=k.decode(P,{stream:!0});let me=S.indexOf(`

`);for(;me>=0;){let X=S.slice(0,me).replace(/\r/g,"");S=S.slice(me+2);let j="message",x=[];for(let E of X.split(`
`))E.startsWith("event:")?j=E.slice(6).trim():E.startsWith("data:")&&x.push(E.slice(5).trimStart());if(x.length){let E=null;try{E=JSON.parse(x.join(`
`))}catch{E=null}if(E)if(j==="step"&&typeof s=="function")try{s(E)}catch{}else if(j==="partial"){if(typeof a=="function")try{a(E)}catch{}}else if(j==="queued"){if(typeof n=="function")try{n(E)}catch{}}else if(j==="token"){if(typeof i=="function")try{i(String(E.text||""))}catch{}}else if(j==="token_reset"){if(typeof o=="function")try{o()}catch{}}else j==="result"?$=E:j==="error"&&(L=new Rt(E.message||E.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,E))}me=S.indexOf(`

`)}}}finally{try{await q.cancel()}catch{}f&&window.clearTimeout(f)}if(L)throw L;if(!$)throw new Rt("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let z=Math.round(performance.now()-b);return Ci({request_id:p,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:z,render_ms:0,status:"success"}),$&&typeof $=="object"&&($._client_request_id=p),$}};var Ot="Judgment\uFF5C\u91D1\u878D\u6CD5\u5F8B\u5224\u6C7A RAG AI \u667A\u6167\u5206\u6790\u5E73\u53F0",Bc={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Oc={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},Hc={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},zc={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Ii={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',share:'<path d="M12 16V4"/><path d="m8 8 4-4 4 4"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/><path d="M12 8H7.5a2.5 2.5 0 1 1 0-5H12"/><path d="M12 8h4.5a2.5 2.5 0 1 0 0-5H12"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',thumbUp:'<path d="M7 10v10H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h3Z"/><path d="M7 10.5 11.2 3a2.2 2.2 0 0 1 3.6 2.3L13.5 9H19a2 2 0 0 1 2 2.4l-1.4 6.8A2.2 2.2 0 0 1 17.4 20H7"/>',thumbDown:'<path d="M7 14V4H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3Z"/><path d="M7 13.5 11.2 21a2.2 2.2 0 0 0 3.6-2.3L13.5 15H19a2 2 0 0 0 2-2.4l-1.4-6.8A2.2 2.2 0 0 0 17.4 4H7"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',palette:'<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10h-4Z"/><circle cx="7.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/><circle cx="10" cy="6.8" r=".8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="6.8" r=".8" fill="currentColor" stroke="none"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',more:'<circle cx="4.2" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="19.8" cy="12" r="2.6" fill="currentColor" stroke="none"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function r(e){return String(e??"").replace(/[&<>"']/g,t=>Bc[t])}function Pt(e,t="#"){let s=String(e??"").trim();if(!s)return t;if(s.startsWith("#"))return s;if(s.startsWith("//")||s.startsWith("/\\"))return t;if(s.startsWith("/"))return s;try{let a=new URL(s,window.location.origin);return["http:","https:"].includes(a.protocol)?s:t}catch{return t}}function m(e,t=16,s=""){let a=Ii[e]||Ii.info;return`<svg${s?` class="${r(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function c(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function Ie(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function cr(e){if(e instanceof Date)return e;if(typeof e=="number"){let n=new Date(e);return Number.isNaN(n.getTime())?null:n}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function Kt(e){let t=cr(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?r(e):"\u2014"}function $e(e){let t=cr(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?r(e):"\u2014"}function _a(e){let t=cr(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:Kt(t)}function be(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function ns(e){return Oc[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Pe(e,t){let s=ns(e);return`<span class="badge ${Hc[s.tone]}"><span class="status-dot ${zc[s.tone]}"></span>${r(t||s.label)}</span>`}function Uc(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${r(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function Xa(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function en(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return Pe(String(e));case"source":return Uc(String(e));case"number":return`<span class="mono">${c(e)}</span>`;case"duration":return`<span class="mono">${be(e)}</span>`;case"datetime":return`<span class="mono">${$e(e)}</span>`;case"date":return`<span class="mono">${Kt(e)}</span>`;case"url":{let s=String(e),a=Xa(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${r(Pt(s))}" target="_blank" rel="noopener noreferrer" title="${r(s)}">${m("external",10)}${r(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${r(s)}">${r(Xa(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(Xa(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(Xa(s,90))}</span>`}}}function Ge({tone:e="info",title:t,text:s,iconName:a="info"}){let n=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
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
  </div>`}function he(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${r(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function T(e,t="info",s=4200,a={}){let n=document.getElementById("toast-region");if(!n)return null;let{detail:i="",actionLabel:o="",onAction:l=null}=a&&typeof a=="object"?a:{},d={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},u=document.createElement("div");u.className=`toast toast-${t}`,u.setAttribute("role",t==="danger"?"alert":"status"),u.innerHTML=`<span class="toast-mark" aria-hidden="true">${d[t]||"i"}</span>
    <div class="toast-body">${r(e)}${i?`<span class="toast-detail">${r(i)}</span>`:""}</div>
    ${o?`<button class="toast-action" type="button">${r(o)}</button>`:""}
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let f=()=>{u.isConnected&&(u.classList.add("is-leaving"),window.setTimeout(()=>u.remove(),190))};u.querySelector(".toast-close").addEventListener("click",f);let y=u.querySelector(".toast-action");return y&&typeof l=="function"&&y.addEventListener("click",b=>{b.preventDefault(),l(),f()}),n.appendChild(u),s>0&&window.setTimeout(f,s),u}async function js(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function Qt(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),n=URL.createObjectURL(a),i=document.createElement("a");i.href=n,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(n),1e3)}function ys(e,t){try{let s=JSON.parse(window.localStorage.getItem(e)||"null");return!s||!Object.prototype.hasOwnProperty.call(s,"value")||Date.now()-Number(s.saved_at||0)>t?null:s.value}catch{return null}}function gs(e,t){try{window.localStorage.setItem(e,JSON.stringify({value:t,saved_at:Date.now()}))}catch{}}function tn({name:e,label:t,value:s=4}={}){let a=Math.max(1,Math.min(5,Math.round(Number(s)||4)));return`<div class="field qb-score-field" data-score-field>
    <span class="field-label">${r(t||"")}</span>
    <div class="qb-score-cells" role="radiogroup" aria-label="${r(t||"")}\u5206\u6578">
      ${[1,2,3,4,5].map(n=>`<button class="qb-score-cell${n===a?" is-active":""}" type="button" role="radio" aria-checked="${n===a?"true":"false"}" data-score-cell data-score="${n}" aria-label="${r(t||"")} ${n} \u5206">${n}</button>`).join("")}
    </div>
    <input type="hidden" name="${r(e||"")}" value="${a}" data-score-input />
  </div>`}function Za(){Za.installed||(Za.installed=!0,document.addEventListener("click",e=>{let t=e.target.closest?.("[data-score-cell]");if(!t)return;let s=t.closest("[data-score-field]");if(!s)return;let a=Math.max(1,Math.min(5,Math.round(Number(t.dataset.score)||0)));s.querySelectorAll("[data-score-cell]").forEach(i=>{let o=Number(i.dataset.score)===a;i.classList.toggle("is-active",o),i.setAttribute("aria-checked",o?"true":"false")});let n=s.querySelector("[data-score-input]");n&&(n.value=String(a))}))}var Gc=`
  <svg class="auth-google-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z"/>
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.58A10 10 0 0 0 12 22Z"/>
    <path fill="#FBBC05" d="M6.41 13.92A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.92V7.5H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.5l3.35-2.58Z"/>
    <path fill="#EA4335" d="M12 6.04c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.5l3.35 2.58C7.2 7.8 9.4 6.04 12 6.04Z"/>
  </svg>`,Qc={google_not_configured:"Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A GOOGLE_CLIENT_ID \u8207 GOOGLE_CLIENT_SECRET\u3002",state_mismatch:"\u767B\u5165\u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u767B\u5165\u3002",access_denied:"\u4F60\u53D6\u6D88\u4E86 Google \u767B\u5165\u3002",email_unverified:"\u9019\u500B Google \u5E33\u865F\u7684\u96FB\u5B50\u90F5\u4EF6\u5C1A\u672A\u9A57\u8B49\u3002",not_allowed:"\u9019\u500B Google \u5E33\u865F\u6C92\u6709\u7BA1\u7406\u54E1\u6B0A\u9650\u3002",oauth_failed:"Google \u767B\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"},Jt=null;function Jc(){return as()==="query"?"":cs()}function Wc(){let e=Jc(),t=`${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;return Lt(`/api/auth/google/start?next=${encodeURIComponent(t)}`,e)}function Di(e){let t=String(e?.name||"").trim();if(t)return t;let s=String(e?.email||"").trim();return s?s.split("@")[0]:"\u5DF2\u767B\u5165"}function Vc(e){return Di(e).slice(0,1).toUpperCase()||"A"}function dr(){let e=Jt?.querySelector("#auth-menu"),t=Jt?.querySelector("#auth-user-trigger");e&&(e.hidden=!0),t&&t.setAttribute("aria-expanded","false")}function Fi(e={}){let t=!!e.google_enabled;Jt.innerHTML=`
    <a class="auth-login${t?"":" is-disabled"}"
       id="auth-login"
       href="${r(Wc())}"
       aria-label="\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165"
       title="${t?"\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165":"Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A"}"
       ${t?"":'aria-disabled="true"'}>
      ${Gc}
      <span>\u767B\u5165</span>
    </a>`,t||Jt.querySelector("#auth-login")?.addEventListener("click",a=>{a.preventDefault(),T("Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A GOOGLE_CLIENT_ID \u8207 GOOGLE_CLIENT_SECRET\u3002","warn",5200)})}function Kc(e){let t=Di(e),s=String(e?.email||""),a=e?.admin?"\u7BA1\u7406\u54E1":"\u4F7F\u7528\u8005";Jt.innerHTML=`
    <div class="auth-user">
      <button type="button"
              class="auth-user-trigger"
              id="auth-user-trigger"
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="\u5DF2\u767B\u5165\uFF1A${r(s||t)}\uFF0C\u958B\u555F\u5E33\u865F\u9078\u55AE"
              title="${r(s||t)}">
        <span class="auth-avatar" aria-hidden="true">${r(Vc(e))}</span>
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
    </div>`;let n=Jt.querySelector("#auth-user-trigger"),i=Jt.querySelector("#auth-menu");n?.addEventListener("click",o=>{o.stopPropagation();let l=!!i?.hidden;i&&(i.hidden=!l),n.setAttribute("aria-expanded",l?"true":"false")}),Jt.querySelector("#auth-admin-settings")?.addEventListener("click",()=>{dr()}),Jt.querySelector("#auth-logout-all")?.addEventListener("click",async o=>{if(!window.confirm("\u9019\u6703\u8B93\u6240\u6709\u88DD\u7F6E\u4E0A\u7684 Google \u767B\u5165\u7ACB\u5373\u5931\u6548\uFF0C\u5305\u542B\u76EE\u524D\u9019\u53F0\u88DD\u7F6E\u3002\u78BA\u5B9A\u8981\u7E7C\u7E8C\u55CE\uFF1F"))return;let l=o.currentTarget;l.disabled=!0,l.textContent="\u767B\u51FA\u6240\u6709\u88DD\u7F6E\u4E2D\u2026";try{await O.authLogoutAll(),T("\u5DF2\u767B\u51FA\u6240\u6709\u88DD\u7F6E\u3002","ok",3e3),await ur(),window.dispatchEvent(new CustomEvent("judgment:auth-changed"))}catch(d){l.disabled=!1,l.textContent="\u767B\u51FA\u6240\u6709\u88DD\u7F6E",T(d.message||"\u767B\u51FA\u6240\u6709\u88DD\u7F6E\u5931\u6557\u3002","danger",5200)}}),Jt.querySelector("#auth-logout")?.addEventListener("click",async o=>{let l=o.currentTarget;l.disabled=!0,l.textContent="\u767B\u51FA\u4E2D\u2026";try{await O.authLogout(),T("\u5DF2\u767B\u51FA\u3002","ok",2400),await ur(),window.dispatchEvent(new CustomEvent("judgment:auth-changed"))}catch(d){l.disabled=!1,l.textContent="\u767B\u51FA",T(d.message||"\u767B\u51FA\u5931\u6557\u3002","danger",5200)}})}function pr(e){e?.authenticated?Kc(e):Fi(e||{google_enabled:!1})}async function ur(){if(Jt)try{let e=await O.authMe();e?.authenticated&&Ya(""),pr(e)}catch{Fi({google_enabled:!1})}}function Yc(){let e;try{e=new URL(window.location.href)}catch{return}let t=e.searchParams.get("auth"),s=e.searchParams.get("auth_error");!t&&!s||(e.searchParams.delete("auth"),e.searchParams.delete("auth_error"),window.history.replaceState(null,"",`${e.pathname}${e.search}${e.hash}`),t==="ok"?T("\u5DF2\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165\u3002","ok",3600):s&&T(Qc[s]||"Google \u767B\u5165\u5931\u6557\u3002","danger",6e3))}function sn(e){Jt&&pr(e)}function mr({user:e=null}={}){Jt=document.getElementById("auth-slot"),Jt&&(Yc(),document.addEventListener("click",t=>{t.target.closest(".auth-user")||dr()}),document.addEventListener("keydown",t=>{t.key==="Escape"&&dr()}),e?pr(e):ur())}var Bi="judgment.theme",gr="nvidia",an=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#0070f3","#171717","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#0066cc","#1d1d1f","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#17171d","#5e6ad2","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#0d99ff","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#0075de","#191918","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],fr=new Map(an.map(e=>[e.id,e]));function Xc(e){return fr.has(e)}function Zc(e){return fr.get(e)||fr.get(gr)}function br(){try{let e=window.localStorage.getItem(Bi);return Xc(e)?e:gr}catch{return gr}}function vr(e,{persist:t=!0}={}){let s=Zc(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");if(a&&a.setAttribute("content",s.metaColor),document.querySelectorAll(".theme-option").forEach(n=>{let i=n.dataset.themeId===s.id;n.classList.toggle("is-active",i),n.setAttribute("aria-checked",i?"true":"false")}),t)try{window.localStorage.setItem(Bi,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}var nn="judgment.fontSizes.v1",_r="judgment.appearance",Qi=new Set(["light","dark","system"]),Oi="light",ka=window.matchMedia("(prefers-color-scheme: dark)"),ed="font-size",xa=[{id:"page-title",label:"\u9801\u9762\u6A19\u984C",hint:"\u5404\u9801\u6700\u4E0A\u65B9\u7684 h1 \u6A19\u984C",selectors:[".page-title"],defaultPx:40,min:20,max:72},{id:"home-title",label:"\u9996\u9801\u4E3B\u8996\u89BA\u6A19\u984C",hint:"\u9996\u9801\u6700\u5927\u7684\u4E3B\u6A19\u984C",selectors:[".home-title"],defaultPx:88,min:40,max:140},{id:"section-title",label:"\u5340\u584A\u6A19\u984C",hint:"\u5831\u8868\u3001\u5361\u7247\u8207\u5340\u584A\u6A19\u984C",selectors:[".section-title",".report-title",".side-card-title",".filter-title",".tests-card-title",".status-sidebar-title",".judgment-dialog-head h2"],defaultPx:16,min:10,max:36},{id:"body",label:"\u5167\u6587\u8207\u8AAA\u660E",hint:"\u6BB5\u843D\u3001\u56DE\u7B54\u3001\u8AAA\u660E\u8207\u6458\u8981\u6587\u5B57",selectors:[".answer-text",".page-subtitle",".report-sub",".home-lead",".empty-text",".notice-body p",".citation-snippet",".side-card-body",".detail-list",".field-help",".report-empty-inline",".processing-section-sub",".summary-value-text",".status-summary",".warnings",".law-dialog-warning"],defaultPx:14,min:8,max:28},{id:"table",label:"\u8868\u683C\u5167\u5BB9",hint:"\u8CC7\u6599\u8868\u683C\u7684\u8868\u982D\u8207\u5132\u5B58\u683C",selectors:[".data-table th",".data-table td"],defaultPx:12,min:8,max:24},{id:"meta",label:"\u6A19\u7C64\u8207\u8F14\u52A9\u6587\u5B57",hint:"badge\u3001chip\u3001\u6B04\u4F4D\u6A19\u7C64\u8207 metadata",selectors:[".badge",".chip",".citation-meta",".citation-index",".answer-section-label",".report-kicker",".report-section-title",".eyebrow",".field-label",".summary-label",".metric-label",".footer-bottom",".nav-update-badge"],defaultPx:10,min:7,max:20},{id:"button",label:"\u6309\u9215\u8207\u5C0E\u89BD",hint:"\u64CD\u4F5C\u6309\u9215\u3001\u9801\u9996\u5C0E\u89BD\u8207\u9023\u7D50",selectors:[".btn",".nav-link",".page-btn",".law-link",".judgment-link",".theme-option-name",".theme-option-desc"],defaultPx:13,min:9,max:24},{id:"form",label:"\u8868\u55AE\u8207\u8F38\u5165",hint:"\u8F38\u5165\u6846\u3001\u4E0B\u62C9\u9078\u55AE\u8207 textarea",selectors:["input","textarea","select",".input",".field-input"],defaultPx:14,min:9,max:28},{id:"mono",label:"\u7A0B\u5F0F\u78BC\u8207\u6578\u503C",hint:"\u7B49\u5BEC\u6587\u5B57\u3001\u67E5\u8A62\u8A9E\u53E5\u8207\u7D71\u8A08\u6578\u503C",selectors:[".mono",".cell-mono",".cell-number",".query-code","code",".metric-value",".summary-value",".perf-stat-value",".mini-stat-value"],defaultPx:13,min:8,max:30},{id:"law-page",label:"\u6CD5\u898F\u689D\u6587\uFF08\u9801\u9762\uFF09",hint:"\u6CD5\u898F\u6AA2\u7D22\u7D50\u679C\u8207\u6CD5\u898F\u4F86\u6E90\u5361\u689D\u6587",selectors:[".law-answer-article-text",".law-answer-article-no",".law-source-article-text",".law-source-article-no",".law-article-text",".law-article-no"],excludeAncestors:[".law-dialog"],defaultPx:12,min:9,max:28},{id:"law-dialog",label:"\u6CD5\u898F\u689D\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u6309\u4E0B\u689D\u6587\u5F8C\u958B\u555F\u7684\u6CD5\u898F dialog",selectors:[".law-dialog .law-article-text",".law-dialog .law-article-no",".law-dialog .law-chapter"],defaultPx:16,min:10,max:32},{id:"judgment-dialog",label:"\u5224\u6C7A\u5168\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u5224\u6C7A\u539F\u6587 dialog \u7684\u5168\u6587\u5340\u584A",selectors:[".judgment-dialog-text"],defaultPx:23,min:12,max:48}],aa=new Map(xa.map(e=>[e.id,e])),Sa=new WeakMap,ws=Ki(),Ht={...ws},_s=Wi(),hr=new Set,sa=null,ta=null,It=null,Bs=null,Hi=null,Ts=ed,Es=!1,$r=null,yr=!1,rn="";function Ji(e,t,s){return Math.min(s,Math.max(t,e))}function kr(e){return Math.round(e*10)/10}function ln(e){return Number.isInteger(e)?String(e):e.toFixed(1)}function Wi(){try{let e=window.localStorage.getItem(_r);return Qi.has(e)?e:Oi}catch{return Oi}}function td(){return _s==="system"?ka.matches?"dark":"light":_s}function Vi(){document.querySelectorAll("[data-appearance-option]").forEach(e=>{let t=e.dataset.appearanceOption===_s;e.classList.toggle("is-active",t),e.setAttribute("aria-pressed",t?"true":"false")})}function on({persist:e=!1}={}){if(document.documentElement.dataset.appearance=td(),document.documentElement.dataset.appearanceMode=_s,Vi(),e)try{window.localStorage.setItem(_r,_s)}catch{}}function sd(e){Qi.has(e)&&(_s=e,on({persist:!0}))}function zi(){_s==="system"&&on()}typeof ka.addEventListener=="function"?ka.addEventListener("change",zi):typeof ka.addListener=="function"&&ka.addListener(zi);function Ki(){let e=null;try{e=JSON.parse(window.localStorage.getItem(nn)||"null")}catch{e=null}if(!e||typeof e!="object"||Array.isArray(e))return{};let t={};for(let s of xa){let a=Number(e[s.id]);Number.isFinite(a)&&(t[s.id]=kr(Ji(a,s.min,s.max)))}return t}function ad(){try{return Object.keys(ws).length?window.localStorage.setItem(nn,JSON.stringify(ws)):window.localStorage.removeItem(nn),!0}catch{return!1}}function qa(e){let t=new Set;for(let s of e.selectors)document.querySelectorAll(s).forEach(a=>{a.closest(".settings-sidebar")||Array.isArray(e.excludeAncestors)&&e.excludeAncestors.some(n=>a.closest(n))||t.add(a)});return Array.from(t)}function Yi(){if(!rn)return;let e=aa.get(rn);if(e)for(let t of qa(e))t.classList.add("font-size-highlight")}function Xi(e){if(na(),!aa.get(e))return;rn=e;let s=It.querySelector(`.font-size-row[data-font-group="${e}"]`);s&&s.classList.add("is-previewing"),Yi()}function na(){rn="",It.querySelectorAll(".font-size-row.is-previewing").forEach(e=>e.classList.remove("is-previewing")),document.querySelectorAll(".font-size-highlight").forEach(e=>e.classList.remove("font-size-highlight"))}function nd(e){if(Sa.has(e))return Sa.get(e);let t={inline:e.style.fontSize||"",computed:parseFloat(window.getComputedStyle(e).fontSize)||0};return Sa.set(e,t),t}function rd(e){let t=Sa.get(e);t&&(t.inline?e.style.fontSize=t.inline:e.style.removeProperty("font-size"))}function id(e){let t=Ht[e.id];if(Number.isFinite(t))for(let s of qa(e))nd(s),s.style.fontSize=`${t}px`}function od(e){for(let t of qa(e))rd(t)}function Ns(){for(let e of hr){let t=aa.get(e);t&&od(t)}hr=new Set;for(let e of xa)Number.isFinite(Ht[e.id])&&(id(e),hr.add(e.id));Yi()}function Zi(){Ns(),Es&&Ts==="font-size"&&Aa()}function eo(){yr||(yr=!0,window.requestAnimationFrame(()=>{yr=!1,Ns()}))}function ld(){$r||!document.body||($r=new MutationObserver(e=>{if(Object.keys(Ht).length){for(let t of e)if(t.type==="childList"&&(t.addedNodes.length||t.removedNodes.length)){eo();return}}}),$r.observe(document.body,{childList:!0,subtree:!0}))}function cd(e){let t=e.filter(s=>typeof s.getClientRects=="function"&&s.getClientRects().length);return t.length?t:e}function dd(){let e=xa.filter(t=>qa(t).length>0||Number.isFinite(Ht[t.id]));return e.length?e:xa}function cn(e){let t=Ht[e.id];if(Number.isFinite(t))return t;let a=cd(qa(e)).map(o=>{let l=Sa.get(o);return l&&l.computed?l.computed:parseFloat(window.getComputedStyle(o).fontSize)||0}).filter(o=>o>0).sort((o,l)=>o-l);if(!a.length)return e.defaultPx;let n=Math.floor(a.length/2),i=a.length%2?a[n]:(a[n-1]+a[n])/2;return kr(i)}function ud(){let e=[{id:"font-size",label:"\u5B57\u578B\u5927\u5C0F",hint:"\u8ABF\u6574\u5404\u6587\u5B57\u5340\u584A",glyph:'<span class="settings-option-aa" aria-hidden="true">Aa</span>'},{id:"theme",label:"\u4ECB\u9762\u98A8\u683C",hint:"\u5207\u63DB\u54C1\u724C\u8996\u89BA\u8A9E\u8A00",glyph:m("palette",15)}];Bs.innerHTML=e.map(t=>`<button class="settings-option${Ts===t.id?" is-active":""}" type="button" role="tab"
        data-settings-panel="${t.id}"
        aria-selected="${Ts===t.id?"true":"false"}">
        <span class="settings-option-icon">${t.glyph}</span>
        <span class="settings-option-copy">
          <strong>${r(t.label)}</strong>
          <small>${r(t.hint)}</small>
        </span>
        ${m("chevronRight",12,"settings-option-chevron")}
      </button>`).join("")}function Aa(){na();let e=dd(),t=e.map(s=>{let a=ln(cn(s));return`<section class="font-size-row" data-font-group="${s.id}">
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
    </section>`}).join("");It.innerHTML=`<div class="settings-panel-head">
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
    </div>`}function pd(){na();let e=br(),t=an.map((n,i)=>{let o=n.swatches.map(l=>`<i style="--swatch:${r(l)}"></i>`).join("");return`<button class="theme-option${n.id===e?" is-active":""}" type="button" role="menuitemradio"
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
          aria-pressed="${_s===n.id?"true":"false"}"
          title="${n.id==="system"?"\u8DDF\u96A8\u7CFB\u7D71\u660E\u6697":`${n.label}\u8272\u6A21\u5F0F`}">${n.label}</button>`).join("")}
  </div>`;It.innerHTML=`<div class="settings-panel-head">
      <div>
        <h3>\u4ECB\u9762\u98A8\u683C</h3>
        <p>\u9078\u64C7\u4E3B\u63A7\u53F0\u7684\u54C1\u724C\u8996\u89BA\u8A9E\u8A00\uFF1B\u4E3B\u984C\u6703\u7ACB\u5373\u5957\u7528\u4E26\u4FDD\u7559\u3002</p>
      </div>
      <div class="settings-panel-head-actions">
        <span class="badge badge-info">${an.length} \u7A2E</span>
        ${a}
      </div>
    </div>
    <div class="settings-theme-list" role="menu" aria-label="\u4ECB\u9762\u98A8\u683C">${t}</div>`,Vi()}function md(){Bs.querySelectorAll("[data-settings-panel]").forEach(e=>{let t=e.dataset.settingsPanel===Ts;e.classList.toggle("is-active",t),e.setAttribute("aria-selected",t?"true":"false")})}function Sr(e=Ts){Ts=e==="theme"?"theme":"font-size",md(),Ts==="theme"?pd():Aa()}function Ui(e,t,s){let a=Number(t);if(!Number.isFinite(a))return;let n=kr(Ji(a,e.min,e.max));Ht[e.id]=n;let i=s?.querySelector(".font-size-slider");i&&(i.value=String(n));let o=s?.querySelector(".font-size-preview");o&&(o.style.fontSize=`${n}px`),eo()}function gd(){It.querySelectorAll(".font-size-row").forEach(e=>{let t=aa.get(e.dataset.fontGroup);if(!t)return;let s=Ht[t.id]??cn(t),a=e.querySelector(".font-size-number-input");a&&(a.value=ln(s));let n=e.querySelector(".font-size-slider");n&&(n.value=String(s));let i=e.querySelector(".font-size-preview");i&&(i.style.fontSize=`${s}px`)})}function Gi(e){let t=e.target.closest(".font-size-row");if(!t)return;let s=aa.get(t.dataset.fontGroup);if(!s)return;let a=e.target.classList.contains("font-size-number-input");if(!(a&&e.target.value==="")){if(e.type==="input"&&a){let n=Number(e.target.value);if(!Number.isFinite(n))return;Ui(s,n,t);return}if(Ui(s,e.target.value,t),e.type==="input"){let n=t.querySelector(".font-size-number-input");n&&document.activeElement!==n&&(n.value=ln(Ht[s.id]??cn(s)))}}}function fd(e){if(!e.target.classList.contains("font-size-number-input"))return;let t=e.target.closest(".font-size-row"),s=t?aa.get(t.dataset.fontGroup):null;if(!s)return;let a=Ht[s.id]??cn(s);e.target.value=ln(a)}function bd(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Xi(t.dataset.fontGroup)}function vd(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||na()}function hd(e){let t=e.target.closest(".font-size-row");t&&Xi(t.dataset.fontGroup)}function $d(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||na()}function yd(e){let t=e.target.closest("[data-settings-panel]");if(t){Sr(t.dataset.settingsPanel);return}let s=e.target.closest("[data-settings-action]");if(s){let i=s.dataset.settingsAction;if(i==="save"){ws={...Ht};let o=ad();gd(),T(o?"\u5B57\u578B\u5927\u5C0F\u5DF2\u5132\u5B58\u3002":"\u5B57\u578B\u5927\u5C0F\u5DF2\u5957\u7528\uFF0C\u4F46\u700F\u89BD\u5668\u7121\u6CD5\u5132\u5B58\u8A2D\u5B9A\u3002",o?"ok":"warn");return}if(i==="cancel"){Ht={...ws},Ns(),Aa(),T("\u5DF2\u53D6\u6D88\u672A\u5132\u5B58\u7684\u5B57\u578B\u8B8A\u66F4\u3002","info");return}i==="reset"&&(Ht={},Ns(),Aa(),T("\u5DF2\u56DE\u5FA9\u9810\u8A2D\u5B57\u578B\uFF1B\u6309\u300C\u5132\u5B58\u300D\u4FDD\u7559\u8B8A\u66F4\u3002","info"));return}let a=e.target.closest("[data-appearance-option]");if(a){sd(a.dataset.appearanceOption);return}let n=e.target.closest(".theme-option");n&&vr(n.dataset.themeId)}function wd(){Es||(Es=!0,Ht={...ws},document.body.classList.add("settings-open"),sa.removeAttribute("inert"),sa.setAttribute("aria-hidden","false"),ta.setAttribute("aria-expanded","true"),Sr(Ts),Ns(),window.requestAnimationFrame(()=>{let e=Bs.querySelector(".settings-option.is-active")||Bs.querySelector(".settings-option");e&&e.focus({preventScroll:!0})}))}function wr({restoreFocus:e=!0}={}){Es&&(Es=!1,na(),Ht={...ws},Ns(),document.body.classList.remove("settings-open"),e&&ta.focus({preventScroll:!0}),sa.setAttribute("aria-hidden","true"),sa.setAttribute("inert",""),ta.setAttribute("aria-expanded","false"))}function to(){sa=document.getElementById("settings-sidebar"),ta=document.getElementById("settings-trigger"),It=document.getElementById("settings-panel"),Bs=document.getElementById("settings-options"),Hi=document.getElementById("settings-close"),!(!sa||!ta||!It||!Bs)&&(on(),vr(br(),{persist:!1}),ud(),Aa(),ld(),Ns(),ta.addEventListener("click",()=>{Es?wr():wd()}),Hi?.addEventListener("click",()=>wr()),Bs.addEventListener("click",e=>{let t=e.target.closest("[data-settings-panel]");t&&Sr(t.dataset.settingsPanel)}),It.addEventListener("click",yd),It.addEventListener("input",Gi),It.addEventListener("change",Gi),It.addEventListener("blur",fd,!0),It.addEventListener("pointerover",bd),It.addEventListener("pointerout",vd),It.addEventListener("focusin",hd),It.addEventListener("focusout",$d),It.addEventListener("keydown",e=>{e.key==="Enter"&&e.target.classList.contains("font-size-number-input")&&(e.preventDefault(),e.target.blur())}),document.addEventListener("keydown",e=>{e.key==="Escape"&&Es&&wr()}),window.addEventListener("storage",e=>{if(e.key===_r){_s=Wi(),on();return}e.key===nn&&(ws=Ki(),Es||(Ht={...ws},Ns()))}))}var ao=["rag","data","quality","performance","processing","status"],pn={rag:"RAG \u63D0\u554F",data:"\u8CC7\u6599\u5EAB",quality:"\u8CC7\u6599\u54C1\u8CEA",performance:"\u6548\u80FD\u5831\u8868",processing:"\u8CC7\u6599\u8655\u7406",status:"\u7CFB\u7D71\u72C0\u614B"},We={loaded:!1,admin:!1,enabled:!1,features:{},expiresAt:null,reason:"",me:null},no="judgment.demo_context.v1",_d=300*1e3;function ro(){try{let e=JSON.parse(window.localStorage.getItem(no)||"null");return!e||typeof e!="object"||Date.now()-Number(e.saved_at||0)>_d||typeof e.admin!="boolean"?null:e}catch{return null}}function io(e){return e&&(We.admin=!!e.admin,We.enabled=!!e.enabled,We.features=e.features||{},We.expiresAt=e.expiresAt||null,We.reason=e.reason||"",We.me=e.me||null,We.loaded=!0),We}function kd(){try{window.localStorage.setItem(no,JSON.stringify({admin:We.admin,enabled:We.enabled,features:We.features,expiresAt:We.expiresAt,reason:We.reason,me:We.me,saved_at:Date.now()}))}catch{}}function ia(){return!!We.admin}function rs(){return!We.admin}function oo(){return!!We.enabled}function xr(e){return We.admin?!0:e==="home"?We.enabled:!!(We.enabled&&We.features?.[e])}function Sd(e){return pn[e]||e}function mn(e){if(!e)return"\u2014";let t=Date.parse(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.round((t-Date.now())/1e3));if(s<=0)return"\u5DF2\u5230\u671F";let a=Math.floor(s/3600),n=Math.floor(s%3600/60);return a>0?`${a} \u5C0F\u6642 ${n} \u5206`:`${Math.max(1,n)} \u5206`}async function gn(){let e=await Promise.allSettled([O.authMe()]),t=e[0].status==="fulfilled"?e[0].value:null,s=t?.demo||await O.demoStatus().catch(()=>null);return We.admin=!!t?.admin,We.enabled=!!s?.enabled,We.features=s?.features||{},We.expiresAt=s?.expires_at||null,We.reason=s?.reason||"",We.me=t,We.loaded=!0,kd(),We.admin&&(We.enabled=!1),We}function Hs(){let e=!We.admin,t=!!We.enabled;document.body.classList.toggle("is-demo-visitor",e&&t),document.body.classList.toggle("is-demo-closed",e&&!t),document.body.classList.toggle("is-admin",We.admin),document.querySelectorAll("[data-route]").forEach(a=>{let n=a.dataset.route||"";if(!e){a.hidden=!1;return}if(n==="tests"){a.hidden=!0;return}a.hidden=!We.enabled||!xr(n)});let s=document.getElementById("demo-banner");s&&(e&&t?(s.hidden=!1,s.innerHTML=`<span class="demo-banner-dot" aria-hidden="true"></span>
      <strong>\u5C55\u793A\u6A21\u5F0F</strong>
      <span>\u5269\u9918 ${r(mn(We.expiresAt))}</span>
      <span class="demo-banner-note">\u53EF\u700F\u89BD\u5B8C\u6574\u8CC7\u6599\u9801\uFF1B\u7BA1\u7406\u64CD\u4F5C\u5DF2\u9396\u5B9A</span>`):(s.hidden=!0,s.innerHTML=""))}function lo(e){e.innerHTML=`<section class="page demo-closed-page">
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
  </section>`}function Ar(e,t){e.innerHTML=`<section class="page demo-closed-page">
    <div class="demo-state-card">
      <div class="demo-state-mark">${m("shield",22)}</div>
      <div class="eyebrow">DEMO MODE</div>
      <h1 class="page-title">\u6B64\u529F\u80FD\u76EE\u524D\u672A\u958B\u653E\u5C55\u793A</h1>
      <p class="page-subtitle">
        ${r(t==="tests"?"\u7CFB\u7D71\u6E2C\u8A66":Sd(t))}\u76EE\u524D\u7531\u7BA1\u7406\u8005\u95DC\u9589\uFF1B\u5C55\u793A\u671F\u9593\u4ECD\u53EF\u5207\u63DB\u5176\u4ED6\u5DF2\u958B\u653E\u529F\u80FD\u3002
      </p>
      <div class="demo-state-actions">
        <a class="btn btn-primary" href="#/home">\u56DE\u5230\u9996\u9801</a>
      </div>
    </div>
  </section>`}function fn(){return`<section class="page demo-closed-page">
    <div class="demo-state-card">
      <div class="demo-state-mark">${m("shield",22)}</div>
      <div class="eyebrow">ADMIN ONLY</div>
      <h1 class="page-title">\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650</h1>
      <p class="page-subtitle">\u8ACB\u7531\u53F3\u4E0A\u89D2\u4EE5\u7BA1\u7406\u8005 Google \u5E33\u865F\u767B\u5165\u3002</p>
    </div>
  </section>`}function zs(e,t){return`<div class="demo-lock-card">
    <span class="demo-lock-icon">${m("shield",18)}</span>
    <div class="demo-lock-copy">
      <strong>${r(e||"\u6B64\u529F\u80FD\u7531\u7BA1\u7406\u8005\u64CD\u4F5C")}</strong>
      <p>${r(t||"\u5C55\u793A\u6A21\u5F0F\u50C5\u63D0\u4F9B\u6AA2\u8996\uFF0C\u57F7\u884C\u3001\u8A2D\u5B9A\u8207\u7BA1\u7406\u6309\u9215\u5DF2\u9396\u5B9A\u3002")}</p>
      <span class="badge badge-neutral badge-mono">\u5C55\u793A\u6A21\u5F0F \xB7 \u552F\u8B80</span>
    </div>
  </div>`}var Dt=null,Ma=0,Os=null,ra={x:0,y:0};function xd(){return Dt?.isConnected||(Dt=document.createElement("div"),Dt.className="demo-lock-tooltip",Dt.setAttribute("role","tooltip"),Dt.hidden=!0,document.body.appendChild(Dt)),Dt}function co(){if(!Dt||Dt.hidden)return;let e=18,t=Dt.getBoundingClientRect(),s=ra.x+e,a=ra.y+14;s+t.width>window.innerWidth-8&&(s=ra.x-t.width-e),a+t.height>window.innerHeight-8&&(a=ra.y-t.height-14),Dt.style.transform=`translate3d(${Math.round(Math.max(8,s))}px, ${Math.round(Math.max(8,a))}px, 0)`}function Ad(e){let t=String(e?.dataset.demoLockTooltip||"").trim();if(!t)return;let s=xd();s.textContent=t,s.hidden=!1,co()}function dn(){Ma&&(window.clearTimeout(Ma),Ma=0),Os=null,Dt&&(Dt.hidden=!0)}function so(e,t,s){!e||Os===e||(dn(),Os=e,ra={x:t,y:s},Ma=window.setTimeout(()=>{Ma=0,Os===e&&Ad(e)},200))}function un(){un.installed||(un.installed=!0,document.addEventListener("pointerover",e=>{let t=e.target.closest?.("[data-demo-lock-tooltip]");t&&so(t,e.clientX,e.clientY)}),document.addEventListener("pointermove",e=>{Os&&(ra={x:e.clientX,y:e.clientY},Dt&&!Dt.hidden&&co())}),document.addEventListener("pointerout",e=>{if(!Os)return;let t=e.relatedTarget;t&&Os.contains?.(t)||dn()}),document.addEventListener("focusin",e=>{let t=e.target.closest?.("[data-demo-lock-tooltip]");if(!t)return;let s=t.getBoundingClientRect();so(t,s.right,s.top)}),document.addEventListener("focusout",()=>dn()),window.addEventListener("scroll",dn,{capture:!0,passive:!0}))}var qr={};hs(qr,{render:()=>jd,securityAuditRows:()=>uo});var qd=[{hours:2,label:"2 \u5C0F\u6642"},{hours:24,label:"24 \u5C0F\u6642"},{hours:168,label:"7 \u5929"}];function Md(e,t){return`<label class="demo-toggle-row" for="demo-feature-${e}">
    <span class="demo-toggle-copy">
      <strong>${r(pn[e]||e)}</strong>
      <small>${t?"\u8A2A\u5BA2\u53EF\u4F7F\u7528\u6B64\u529F\u80FD\u7684\u552F\u8B80\uFF0F\u516C\u958B\u90E8\u5206":"\u76EE\u524D\u672A\u958B\u653E\u7D66\u8A2A\u5BA2"}</small>
    </span>
    <span class="demo-switch">
      <input type="checkbox" id="demo-feature-${e}" data-demo-feature="${e}" aria-label="${r(pn[e]||e)}" ${t?"checked":""} />
      <span aria-hidden="true"></span>
    </span>
  </label>`}function Ld(e){return e?.length?`<div class="demo-audit-list">${e.map(t=>`<div class="demo-audit-row">
        <span>${r(t.created_at||"\u2014")}</span>
        <strong>${r(t.action||"\u2014")}</strong>
        <small>${r(t.actor_email||"\u2014")}</small>
      </div>`).join("")}</div>`:'<div class="demo-empty">\u5C1A\u7121\u5207\u63DB\u7D00\u9304\u3002</div>'}function uo(e){return e?.length?`<div class="security-audit-list">${e.map(t=>`<div class="security-audit-row">
        <span>${r(t.created_at||"\u2014")}</span>
        <strong>${r(`${t.event_type||"\u2014"} \xB7 ${t.outcome||"\u2014"}`)}</strong>
        <span>${r(`${t.method||""} ${t.path||""}`.trim()||"\u2014")}</span>
        <small>${r([t.actor||t.source||"\u2014",t.client_ip_hash?`IP ${t.client_ip_hash}`:""].filter(Boolean).join(" \xB7 "))}</small>
      </div>`).join("")}</div>`:'<div class="demo-empty">\u5C1A\u7121\u5B89\u5168\u7A3D\u6838\u4E8B\u4EF6\u3002</div>'}async function jd(e){if(!ia()){e.innerHTML=fn();return}e.innerHTML=`<section class="page admin-page">
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
  </section>`;let t=e.querySelector("#demo-admin-panel"),s=e.querySelector("#demo-admin-badge"),a=null,n={events:[]},i=0,o=()=>{let u=t.querySelector("[data-demo-remaining]");u&&(u.textContent=mn(a?.effective?.expires_at))},l=()=>{if(!a)return;let u=a.stored||{},f=a.effective||{},y=a.usage||{},b=u.features||{},p=!!f.enabled,v=!!a.hard_disabled;s.textContent=p?"DEMO \xB7 \u5DF2\u958B\u555F":"DEMO \xB7 \u5DF2\u95DC\u9589",s.classList.toggle("badge-ok",p),s.classList.toggle("badge-danger",!p),t.innerHTML=`<div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">DEMO MODE</div>
          <div class="report-title">\u5C55\u793A\u6A21\u5F0F</div>
          <div class="report-sub">
            \u5BE6\u969B\u751F\u6548\uFF1A<strong>${p?"\u958B\u555F":"\u95DC\u9589"}</strong>
            ${f.reason?` \xB7 \u539F\u56E0\uFF1A${r(f.reason)}`:""}
          </div>
        </div>
        <div class="demo-status-pill ${p?"is-on":"is-off"}">${p?"ON":"OFF"}</div>
      </div>
      <div class="report-section">
        ${v?`<div class="notice notice-danger" role="alert">
                <span class="notice-icon" aria-hidden="true">${m("alert",12)}</span>
                <div class="notice-body"><strong>\u74B0\u5883\u8B8A\u6578\u5F37\u5236\u95DC\u9589</strong>
                <p>JUDGMENT_DEMO_HARD_DISABLE=1\uFF0CDB \u958B\u95DC\u76EE\u524D\u7121\u6548\u3002</p></div>
              </div>`:""}
        <div class="demo-admin-stats">
          <div><span>\u5269\u9918\u6642\u9593</span><strong data-demo-remaining>${r(mn(f.expires_at))}</strong></div>
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
          ${ao.map($=>Md($,!!b[$])).join("")}
        </div>

        <div class="demo-open-controls">
          <label class="field-label" for="demo-duration">\u958B\u653E\u6642\u9593</label>
          <select class="select" id="demo-duration">
            ${qd.map($=>`<option value="${$.hours}">${$.label}</option>`).join("")}
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
          ${Ld(a.audit)}
        </div>

        <div class="demo-admin-section">
          <div class="report-section-head"><span class="report-section-title">\u5B89\u5168\u7A3D\u6838\uFF08\u6700\u8FD1 20 \u7B46\uFF09</span></div>
          ${uo(n.events)}
        </div>
      </div>
    </div>`;let w=t.querySelector("#demo-enabled"),q=[...t.querySelectorAll("[data-demo-feature]")],k=()=>Object.fromEntries(q.map($=>[$.dataset.demoFeature,$.checked])),S=async($,{enabled:L,label:z})=>{$.disabled=!0;let P=Number(t.querySelector("#demo-duration")?.value||2),Y=k();if(L&&!Object.values(Y).some(Boolean)){T("\u8ACB\u81F3\u5C11\u958B\u555F\u4E00\u500B\u529F\u80FD\uFF0C\u624D\u80FD\u958B\u555F\u5C55\u793A\u3002","warn",5200),$.disabled=!1;return}try{a=await O.updateDemo({enabled:L,duration_hours:L?P:null,features:Y,version:a?.stored?.version}),T(z,"ok",3200),l()}catch(me){T(me.message||"\u7121\u6CD5\u66F4\u65B0\u5C55\u793A\u8A2D\u5B9A\u3002","danger",6e3)}finally{$.disabled=!1}};t.querySelector("#demo-save")?.addEventListener("click",$=>{S($.currentTarget,{enabled:!!w?.checked,label:w?.checked?"\u5C55\u793A\u8A2D\u5B9A\u5DF2\u5132\u5B58\uFF0C\u5C55\u793A\u4ECD\u7DAD\u6301\u958B\u555F\u3002":"\u5C55\u793A\u8A2D\u5B9A\u5DF2\u5132\u5B58\uFF0C\u5C55\u793A\u4ECD\u7DAD\u6301\u95DC\u9589\u3002"})}),t.querySelector("#demo-open")?.addEventListener("click",$=>{S($.currentTarget,{enabled:!0,label:"\u5C55\u793A\u6A21\u5F0F\u5DF2\u958B\u555F\u3002"})}),t.querySelector("#demo-close")?.addEventListener("click",async $=>{let L=$.currentTarget;L.disabled=!0;try{a=await O.closeDemo(),T("\u5C55\u793A\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok",3200),l()}catch(z){T(z.message||"\u7121\u6CD5\u95DC\u9589\u5C55\u793A\u6A21\u5F0F\u3002","danger",6e3)}finally{L.disabled=!1}}),i&&window.clearInterval(i),i=window.setInterval(o,1e3)};return await(async()=>{try{let[u,f]=await Promise.all([O.adminDemo(),O.adminSecurityAudit(20).catch(()=>({events:[]}))]);a=u,n=f||{events:[]},l()}catch(u){t.innerHTML=`<div class="report-card"><div class="report-head">
        <div class="report-title-group"><div class="report-kicker">ADMIN SETTINGS</div>
        <div class="report-title">\u7121\u6CD5\u8B80\u53D6\u5C55\u793A\u8A2D\u5B9A</div>
        <div class="report-sub">${r(u.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}</div></div>
      </div></div>`}})(),()=>{i&&window.clearInterval(i),i=0}}var Pr={};hs(Pr,{render:()=>zd});function Td(e){let t=e&&typeof e=="object"?e:{},s=t.judgment_total,a=t.financial_total,n=Number(s),i=Number(a),o=s!=null&&Number.isFinite(n)&&n>=0,l=a!=null&&Number.isFinite(i)&&i>=0;return{total:o?n:null,financial:l?i:null,ratio:o&&l&&n>0?i/n*100:null}}function fs(e,{loading:t=!1}={}){let s=Td(e),a=t?"\u8B80\u53D6\u4E2D\u2026":c(s.total),n=t?"\u8B80\u53D6\u4E2D\u2026":c(s.financial),i=t?"\u8B80\u53D6\u4E2D\u2026":s.ratio===null?"\u2014":`${s.ratio.toFixed(1)}%`;return`<div class="processing-summary-card">
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
  </div>`}var Mr=11,Ed=15e3,po="judgment.home.summary.v1",bn=new Set,Nd=[{route:"rag",icon:"message",kicker:"RAG",title:"RAG \u63D0\u554F",summary:"\u7528\u81EA\u7136\u8A9E\u8A00\u627E\u5230\u76F8\u4F3C\u5224\u6C7A\u8207\u73FE\u884C\u6CD5\u898F\uFF0C\u56DE\u7B54\u9644\u4E0A\u53EF\u56DE\u6EAF\u7684\u5F15\u7528\u3002",metric:"Citations first",tone:"feature",wide:!0,metricKey:"rag"},{route:"data",icon:"database",kicker:"EXPLORE",title:"\u8CC7\u6599\u5EAB\u67E5\u8A62",summary:"\u8DE8 PostgreSQL\u3001Parquet\u3001Qdrant \u8207 IndexedDB \u6AA2\u8996\u539F\u59CB\u8CC7\u6599\u3002",metric:"4 \u7A2E\u8CC7\u6599\u4F86\u6E90",tone:"blue",metricKey:"data"},{route:"quality",icon:"shield",kicker:"QUALITY",title:"\u8CC7\u6599\u54C1\u8CEA",summary:"\u7528 DuckDB \u6AA2\u67E5\u539F\u59CB\u5224\u6C7A\u7684\u91CD\u8907\u3001\u7F3A\u6F0F\u8207\u5F15\u7528\u4E00\u81F4\u6027\u3002",metric:"DuckDB native",tone:"green",metricKey:"quality"},{route:"performance",icon:"activity",kicker:"OBSERVE",title:"\u6548\u80FD\u5831\u8868",summary:"\u5F9E\u55AE\u6B21 RAG \u5230\u7D22\u5F15\u5EFA\u7F6E\uFF0C\u8FFD\u8E64\u6BCF\u500B\u968E\u6BB5\u7684\u8017\u6642\u8207\u74F6\u9838\u3002",metric:"Flow \xB7 Waterfall",tone:"amber",metricKey:"performance"},{route:"processing",icon:"sliders",kicker:"PIPELINE",title:"\u8CC7\u6599\u8655\u7406",summary:"\u4E0B\u8F09\u3001\u532F\u5165\u3001\u5099\u4EFD\u8207\u7D22\u5F15\uFF0C\u96C6\u4E2D\u7BA1\u7406\u8CC7\u6599\u751F\u547D\u9031\u671F\u3002",metric:"End-to-end",tone:"violet",metricKey:"processing"},{route:"status",icon:"server",kicker:"STATUS",title:"\u7CFB\u7D71\u72C0\u614B",summary:"\u6AA2\u8996\u670D\u52D9\u5065\u5EB7\u3001\u8F09\u5165 Pipeline\u3001\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207 API \u76EE\u9304\u3002",metric:"10 \u670D\u52D9\u5143\u4EF6",tone:"slate",metricKey:"status"},{route:"tests",icon:"check",kicker:"VERIFY",title:"\u7CFB\u7D71\u6E2C\u8A66",summary:"\u8A2D\u5B9A API Base\uFF0C\u6E2C\u8A66 LLM \u6A21\u578B\u8207 Reranker \u670D\u52D9\u3002",metric:"LLM \xB7 Reranker",tone:"rose",metricKey:"tests"}];function oa(e,t=1){let s=Number(e);return Number.isFinite(s)?`${s.toFixed(t)}%`:"\u2014"}function jr(e){let t=e?.year_min,s=e?.year_max;return!t&&!s?"\u2014":t&&s&&t!==s?`${t}\u2013${s}`:String(t||s)}function go(e){let t=Number(e?.year_span);return Number.isFinite(t)&&t>0?`${t} \u5E74`:"\u2014"}function Rd(e){return`<a class="home-tile tone-${r(e.tone)}${e.wide?" is-wide":""}" href="#/${e.route}">
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
  </a>`}function Tr(e,{loading:t=!1}={}){let s=e?.laws||{},a=n=>t?"\u8B80\u53D6\u4E2D\u2026":c(n);return`<div class="processing-summary-card">
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
  </div>`}function Cd(e,{loading:t=!1}={}){if(t)return`<div class="home-live-rows is-loading">
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
      <span class="home-live-value mono">${r(jr(a))} <i>\xB7</i> ${r(go(a))}</span>
    </div>
    <div class="home-live-row">
      <span class="home-live-label">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15</span>
      <span class="home-live-value mono">${c(n.indexed)} <i>\xB7</i> ${r(oa(n.coverage_pct))}</span>
    </div>
  </div>`}function hn(e,{loading:t=!1,error:s="",generatedAt:a=""}={}){return s?`<div class="home-live-error" role="status">
      <span class="home-live-error-icon">${m("alert",18)}</span>
      <div>
        <strong>\u5373\u6642\u6458\u8981\u66AB\u6642\u7121\u6CD5\u53D6\u5F97</strong>
        <p>${r(s)}</p>
        <button class="btn btn-secondary btn-sm" type="button" id="home-retry">
          ${m("refresh",13)}<span>\u91CD\u65B0\u8F09\u5165</span>
        </button>
      </div>
    </div>`:`${Cd(e,{loading:t})}
    <div class="home-live-foot">
      <span class="home-live-source">${m("link",12)}\u53F8\u6CD5\u9662 OpenData \xB7 \u5168\u570B\u6CD5\u898F\u8CC7\u6599\u5EAB</span>
      <span class="home-live-time">${t||!a?"\u540C\u6B65\u4E2D\u2026":`\u66F4\u65B0 ${$e(a)}`}</span>
    </div>`}function Er(e,{loading:t=!1}={}){if(t)return`<span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>
      <span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>
      <span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>`;let s=e?.judgments||{},a=e?.raw||{},n=e?.rag?.judgment_index||{};return`<span class="home-fact">
      <span class="home-fact-label">\u539F\u59CB\u5224\u6C7A\u5099\u4EFD</span>
      <strong>${c(a.raw_total)}</strong>
      <small>${c(a.archive_count)} \u500B archive \xB7 \u53F8\u6CD5\u9662 OpenData</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">\u91D1\u878D\u5224\u6C7A\u5E74\u4EFD</span>
      <strong>${r(jr(s))}</strong>
      <small>${r(go(s))} \xB7 ${c(s.financial_total)} \u7B46 current</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">\u5411\u91CF\u7D22\u5F15\u8986\u84CB</span>
      <strong>${r(oa(n.coverage_pct))}</strong>
      <small>${c(n.indexed)} / ${c(n.total)} \u7B46 \xB7 ${r(n.model||"\u2014")}</small>
    </span>`}function vn(e,t){let s=t?.laws||{},a=t?.judgments||{},n=t?.raw||{},i=t?.sources||{};if(e==="opendata"){let l=i.opendata||{};return`<article class="home-source-card">
      <div class="home-source-head">
        <span class="home-source-icon">${m("cloud",20)}</span>
        <div>
          <strong>${r(l.label||"\u53F8\u6CD5\u9662\u8CC7\u6599\u958B\u653E\u5E73\u81FA")}</strong>
          <small>\u88C1\u5224\u66F8\u539F\u59CB\u8CC7\u6599</small>
        </div>
        <a class="home-source-link" href="${r(Pt(l.url,"https://opendata.judicial.gov.tw/"))}" target="_blank" rel="noopener noreferrer">${m("external",12)}\u4F86\u6E90</a>
      </div>
      <p class="home-source-copy">\u5224\u6C7A\u5168\u6587\u3001\u6848\u865F\u3001\u6CD5\u9662\u3001\u88C1\u5224\u65E5\u671F\u8207 PDF \u9023\u7D50\u7686\u4FDD\u7559\u539F\u59CB\u6B04\u4F4D\uFF1B\u532F\u5165\u524D\u5148\u5BEB\u5165\u4E0D\u53EF\u8B8A\u7684 raw Parquet \u5099\u4EFD\u3002</p>
      <dl class="home-source-facts">
        <div><dt>\u539F\u59CB\u5224\u6C7A</dt><dd>${c(n.raw_total)}</dd></div>
        <div><dt>Archive</dt><dd>${c(n.archive_count)}</dd></div>
        <div><dt>\u88C1\u5224\u5E74\u4EFD</dt><dd>${r(jr(a))}</dd></div>
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
      <a class="home-source-link" href="${r(Pt(o.url,"https://law.moj.gov.tw/"))}" target="_blank" rel="noopener noreferrer">${m("external",12)}\u4F86\u6E90</a>
    </div>
    <p class="home-source-copy">\u4EE5\u5B98\u65B9 JSON \u7AEF\u9EDE\u4E0B\u8F09\u73FE\u884C\u6CD5\u898F\u8207\u547D\u4EE4\uFF0C\u4FDD\u7559\u7248\u672C\u3001\u689D\u6587\u8207\u8B8A\u66F4\u4E8B\u4EF6\uFF1B\u5224\u6C7A\u5F15\u7528\u53EF\u56DE\u5230\u5C0D\u61C9\u689D\u865F\u3002</p>
    <dl class="home-source-facts">
      <div><dt>\u6CD5\u898F</dt><dd>${c(s.law_count)}</dd></div>
      <div><dt>\u547D\u4EE4</dt><dd>${c(s.order_count)}</dd></div>
      <div><dt>\u689D\u6587</dt><dd>${c(s.article_count)}</dd></div>
      <div><dt>\u8CC7\u6599\u7248\u672C</dt><dd>${c(s.version_count)}</dd></div>
    </dl>
    <div class="home-source-flow"><span>ZIP</span>${m("arrowRight",11)}<span>Parquet</span>${m("arrowRight",11)}<span>PostgreSQL</span>${m("arrowRight",11)}<span>Qdrant</span></div>
  </article>`}function Nr(e,{loading:t=!1,error:s=""}={}){if(t)return'<div class="home-laws-loading skeleton skeleton-card"></div>';if(s)return`<div class="home-laws-error" role="status">${m("alert",16)}<span>${r(s)}</span></div>`;let a=e?.financial_laws||{},n=Array.isArray(a.laws)?a.laws:[],i=Number(a.count)||n.length,o=Math.ceil(i/Mr)||0,l=String(a.source_sha256||""),d=l?`${l.slice(0,12)}\u2026`:"\u2014",u=a.modified_at?Kt(a.modified_at):"\u2014";return`<details class="home-laws" id="home-laws">
    <summary class="home-laws-summary">
      <span class="home-laws-count">${c(i)}</span>
      <span class="home-laws-title">
        <strong>\u91D1\u878D\u6CD5\u898F\u6E05\u55AE</strong>
        <small>${r(a.source_path||"documents/\u91D1\u878D\u6CD5\u898F.md")} \xB7 ${Mr} \u6B04 \xD7 ${o} \u5217</small>
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
      ${n.length?`<div class="home-laws-grid" style="--home-law-columns:${Mr}" role="list">
              ${n.map((f,y)=>`<span class="home-law" role="listitem" title="${r(f)}">
                    <span class="home-law-index">${String(y+1).padStart(2,"0")}</span>
                    <span class="home-law-name">${r(f)}</span>
                  </span>`).join("")}
            </div>`:'<p class="home-laws-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u6CD5\u898F\u540D\u7A31\u3002</p>'}
    </div>
  </details>`}function Rr(e,{loading:t=!1,error:s=""}={}){if(t)return`<div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>`;if(s)return`<div class="home-rag-error">${m("alert",16)}<span>${r(s)}</span></div>`;let a=e?.rag||{},n=a.judgment_index||{},i=a.legal_index||{},o=a.models||{},l=Number(n.coverage_pct),d=Number.isFinite(l)?Math.max(0,Math.min(100,l)):0;return`<article class="home-rag-card">
      <span class="home-rag-kicker">JUDGMENT RETRIEVAL</span>
      <strong class="home-rag-value mono">${c(n.indexed)}<small> / ${c(n.total)}</small></strong>
      <span class="home-rag-label">\u5DF2\u7D22\u5F15 / \u91D1\u878D\u5224\u6C7A</span>
      <span class="home-rag-progress" role="img" aria-label="\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u8986\u84CB ${r(oa(n.coverage_pct))}"><span style="width:${d.toFixed(1)}%"></span></span>
      <span class="home-rag-meta">${r(oa(n.coverage_pct))} \xB7 ${r(n.model||"\u2014")} \xB7 ${r(n.alias||"\u2014")} \u2192 ${r(n.collection||"\u2014")}</span>
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
    </article>`}function Pd(){return`<ol class="home-rag-flow" aria-label="RAG \u57F7\u884C\u6D41\u7A0B">
    ${[["01","\u554F\u984C","1\u2013500 \u5B57","message"],["02","Embedding","bge-m3","brain"],["03","\u6AA2\u7D22","\u5224\u6C7A + \u6CD5\u898F\uFF0F\u547D\u4EE4","database"],["04","Rerank","cross-encoder","sliders"],["05","LLM","\u4F9D\u6AA2\u7D22\u5167\u5BB9\u56DE\u7B54","sparkles"],["06","\u5F15\u7528","[n] \u2192 \u539F\u59CB\u4F86\u6E90","link"]].map(([t,s,a,n])=>`<li class="home-rag-step">
          <span class="home-rag-step-icon">${m(n,17)}</span>
          <span class="home-rag-step-copy">
            <small>${t}</small>
            <strong>${r(s)}</strong>
            <span>${r(a)}</span>
          </span>
        </li>`).join("")}
  </ol>`}function Id(){return`<div class="home-trace">
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
  </div>`}function Lr(e){return e==="failed"?"\u5931\u6557":e==="skipped"?"\u7565\u904E":e==="running"?"\u57F7\u884C\u4E2D":e==="pending"?"\u7B49\u5F85":"\u5B8C\u6210"}function Dd(e,t,s,a,n,i){let o=String(e.status||"success"),l=o==="skipped"||o==="pending",d=Math.max(0,Number(e.duration_ms)||0),u=l?"\u2014":be(d),f=o==="failed"?"var(--danger)":e.color||"#64748b",y=[`is-${o}`,o==="failed"?"is-error":"",l?"is-missing":"",i&&e.key===i?"is-slowest":""].filter(Boolean).join(" "),b=String(e.key||`stage-${t}`),p=[["\u72C0\u614B",Lr(o),!0],["\u958B\u59CB",e.started_at?$e(e.started_at):"\u2014",!0],["\u7D50\u675F",e.finished_at?$e(e.finished_at):"\u2014",!0],["\u8017\u6642",u,!0],["\u5360\u6574\u9AD4",oa(n),!0],["\u8AAA\u660E",e.message||e.caption||"",!1]].map(([w,q,k])=>k||q?`<span class="rag-wf-detail"><span>${r(w)}</span><strong>${r(String(q||"\u2014"))}</strong></span>`:"").join(""),v=l?"":`<span class="rag-wf-bar is-sequential" style="left:${s.toFixed(3)}%;width:${a.toFixed(4)}%;top:0;height:12px;--bar-color:${r(f)}" aria-hidden="true"></span>`;return`<details class="rag-wf-stage home-wf-stage ${y}${bn.has(b)?" is-open":""}" data-home-wf-stage="${r(b)}"${bn.has(b)?" open":""} style="--stage-color:${r(e.color||"#64748b")}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong><span class="home-wf-step">${String(t+1).padStart(2,"0")}</span> ${r(e.label||e.key||"\u968E\u6BB5")}${i&&e.key===i?' <span class="home-wf-slow">\u6700\u6162</span>':""}</strong>${e.caption?`<small>${r(e.caption)}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${r(u)} \xB7 ${r(Lr(o))} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${e.label||e.key}\uFF1A${Lr(o)}\uFF0C\u8017\u6642 ${u}\uFF0C\u5360\u6574\u9AD4 ${oa(n)}`)}">${v}</span>
    </summary>
    <div class="rag-wf-details">${p}</div>
  </details>`}function Cr(e,{loading:t=!1,error:s="",clientMs:a=null}={}){if(t)return`<div class="report-card home-wf-loading" aria-live="polite">
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
    </div>`;let o=Math.max(0,Number(n.total_ms)||i.reduce((S,$)=>S+(Number($.duration_ms)||0),0)),l=Math.max(0,Number(a)||0),d=Math.max(0,l-o),u=Math.max(o,i.reduce((S,$)=>S+(Number($.duration_ms)||0),0),1),f=i.reduce((S,$)=>(Number($.duration_ms)||0)>(Number(S?.duration_ms)||0)?$:S,i[0]),y=1.25,b=i.map(S=>String(S.status||"success")==="skipped"?0:Math.max((Number(S.duration_ms)||0)/u*100,y)),p=b.reduce((S,$)=>S+$,0),v=p>100?100/p:1,w=0,q=i.map((S,$)=>{let L=["skipped","pending"].includes(String(S.status||"success")),z=L?0:b[$]*v,P=w;L||(w+=z);let Y=u>0?(Number(S.duration_ms)||0)/u*100:0;return Dd(S,$,P,z,Y,f?.key)}).join(""),k=i.filter(S=>S.status==="failed").length;return`<section class="report-card status-wf-card home-wf-card" data-home-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m("activity",14)}\u9996\u9801\u5373\u6642\u8CC7\u6599\u8F09\u5165 Pipeline</span>
      <span class="home-wf-links">
        <a class="home-wf-link" href="#/status">\u5B8C\u6574\u670D\u52D9 Pipeline ${m("arrowRight",11)}</a>
        <a class="home-wf-link" href="#/performance">RAG Flow ${m("arrowRight",11)}</a>
      </span>
    </div>
    <div class="index-runtime-metrics home-wf-metrics">
      <span class="index-runtime-metric" title="\u5F8C\u7AEF /api/home \u5F9E\u7B2C\u4E00\u500B\u67E5\u8A62\u5230\u56DE\u61C9\u7D44\u88DD\u5B8C\u6210\u7684\u968E\u6BB5\u7E3D\u8017\u6642\u3002"><span>\u968E\u6BB5\u7E3D\u8017\u6642</span><strong>${r(be(o))}</strong></span>
      <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u5F9E\u9001\u51FA\u8ACB\u6C42\u5230\u6536\u5230\u56DE\u61C9\u7684\u5BE6\u969B\u5F80\u8FD4\u6642\u9593\u3002"><span>HTTP \u5F80\u8FD4</span><strong>${r(l?be(l):"\u2014")}</strong></span>
      <span class="index-runtime-metric" title="HTTP \u5F80\u8FD4\u6263\u6389\u5F8C\u7AEF\u968E\u6BB5\u7E3D\u8017\u6642\u5F8C\u7684\u50B3\u8F38\u8207\u6392\u968A\u6642\u9593\u3002"><span>\u50B3\u8F38\uFF0F\u6392\u968A</span><strong>${r(l?be(d):"\u2014")}</strong></span>
      <span class="index-runtime-metric" title="\u672C\u6B21\u8F09\u5165\u8017\u6642\u6700\u9577\u7684\u968E\u6BB5\uFF0C\u4E5F\u5C31\u662F\u76EE\u524D\u6700\u660E\u986F\u7684\u74F6\u9838\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${f?.label||"\u2014"} \xB7 ${be(f?.duration_ms||0)}`)}</strong></span>
      <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${c(i.length-k)} / ${c(i.length)}${k?` \xB7 \u5931\u6557 ${c(k)}`:""}</strong></span>
      <span class="index-runtime-metric" title="\u672C\u6B21\u6458\u8981\u7684\u7522\u751F\u6642\u9593\u3002"><span>\u66F4\u65B0\u6642\u9593</span><strong>${r(n.finished_at?$e(n.finished_at):"\u2014")}</strong></span>
    </div>
    <div class="status-wf-chart">
      <div class="rag-wf-axis"><span>0 ms</span><span>${r(be(o))}</span></div>
      <div class="rag-wf-stages">${q}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u5BE6\u969B\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0Cbar \u9577\u5EA6\u70BA\u8A72\u968E\u6BB5\u8017\u6642\u5360\u6BD4\uFF1B\u6A19\u793A\u300C\u6700\u6162\u300D\u7684\u968E\u6BB5\u5373\u672C\u6B21\u8F09\u5165\u74F6\u9838\u3002\u9EDE\u64CA\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u3001\u5360\u6BD4\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function Fd(e){return`<div class="home-source-error">${m("alert",16)}<span>${r(e)}</span></div>`}function Bd(){let e=Nd.map(Rd).join("");return`<section class="page home-page" id="home-page">
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
        <div id="home-live-body" aria-live="polite">${hn(null,{loading:!0})}</div>
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
          ${fs(null,{loading:!0})}
        </div>
        <div class="home-metric-group" id="home-law-metrics">
          ${Tr(null,{loading:!0})}
        </div>
      </div>
      <div class="home-metric-strip" id="home-metric-strip">
        ${Er(null,{loading:!0})}
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
      ${Pd()}
      <div class="home-rag-values" id="home-rag-values">
        ${Rr(null,{loading:!0})}
      </div>
      ${Id()}
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
        ${vn("opendata",null)}
        ${vn("laws",null)}
      </div>
      <div id="home-laws-slot">
        ${Nr(null,{loading:!0})}
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
        ${Cr(null,{loading:!0})}
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
  </section>`}function Od(e,t){let s=t?.laws||{},a=t?.judgments||{},n=t?.raw||{},i=t?.rag?.judgment_index||{},o={rag:`${c(i.indexed)} \u7B46\u7D22\u5F15`,data:`${c(s.law_count)} \u6CD5\u898F \xB7 ${c(s.order_count)} \u547D\u4EE4`,quality:`${c(n.raw_total)} \u539F\u59CB\u5224\u6C7A`,processing:`${c(n.archive_count)} archive`,performance:"Flow \xB7 Waterfall",status:"10 \u670D\u52D9\u5143\u4EF6",tests:"LLM \xB7 Reranker"};e.querySelectorAll("[data-home-tile-metric]").forEach(l=>{let d=l.dataset.homeTileMetric;d&&o[d]&&(l.textContent=o[d])})}function mo(e,t,{clientMs:s=null}={}){let a=t?.data||{},n=t?.generated_at||"",i=e.querySelector("#home-live-body");i&&(i.innerHTML=hn(a,{generatedAt:n}));let o=e.querySelector("#home-judgment-stats"),l=a.judgments||{};o&&(o.innerHTML=fs({judgment_total:l.raw_total,financial_total:l.financial_total,financial_ratio:l.financial_ratio}));let d=e.querySelector("#home-law-metrics");d&&(d.innerHTML=Tr(a));let u=e.querySelector("#home-metric-strip");u&&(u.innerHTML=Er(a));let f=e.querySelector("#home-rag-values");f&&(f.innerHTML=Rr(a));let y=e.querySelector("#home-source-grid");y&&(y.innerHTML=`${vn("opendata",a)}${vn("laws",a)}`);let b=e.querySelector("#home-laws-slot");if(b){let w=!!b.querySelector("#home-laws")?.open;b.innerHTML=Nr(a);let q=b.querySelector("#home-laws");q&&w&&(q.open=!0)}let p=e.querySelector("#home-waterfall-slot");p&&(p.innerHTML=Cr({...a,pipeline:t?.pipeline},{clientMs:s})),Od(e,a)}function Hd(e,t){let s=e.querySelector("#home-live-body");s&&(s.innerHTML=hn(null,{error:t}));let a=e.querySelector("#home-judgment-stats");a&&(a.innerHTML=fs(null));let n=e.querySelector("#home-law-metrics");n&&(n.innerHTML=Tr(null));let i=e.querySelector("#home-metric-strip");i&&(i.innerHTML=Er(null));let o=e.querySelector("#home-rag-values");o&&(o.innerHTML=Rr(null,{error:t}));let l=e.querySelector("#home-source-grid");l&&(l.innerHTML=Fd(t));let d=e.querySelector("#home-laws-slot");d&&(d.innerHTML=Nr(null,{error:t}));let u=e.querySelector("#home-waterfall-slot");u&&(u.innerHTML=Cr(null,{error:t}))}async function zd(e,t){let s=!1,a=!1,n=!1,i=null,o=null,l=null,d=null,u=0;e.innerHTML=Bd();let f=e.querySelector("#home-ask-form"),y=e.querySelector("#home-question"),b=e.querySelector("#home-refresh"),p=()=>{let $=String(y?.value||"").trim().slice(0,500);if(!$){y?.focus();return}try{window.sessionStorage.setItem("judgment.pending_question",$)}catch{}window.__judgmentPendingQuestion=$,t&&typeof t.navigate=="function"?t.navigate("rag"):window.location.hash="#/rag"},v=()=>{y&&(y.style.height="auto",y.style.height=`${Math.min(y.scrollHeight,140)}px`)},w=$=>{b&&(b.disabled=$,b.classList.toggle("is-loading",$),b.setAttribute("aria-busy",$?"true":"false"))},q=async({quiet:$=!1}={})=>{if(s)return;if(a){n=!0;return}if(a=!0,u=Date.now(),w(!0),!$){let z=e.querySelector("#home-live-body");z&&(z.innerHTML=hn(null,{loading:!0}))}let L=performance.now();try{let z=await O.homeSummary();if(s||!e.isConnected)return;o=z?.data||null,l=z?.data?.financial_laws||null,gs(po,z),mo(e,z,{clientMs:Math.round(performance.now()-L)})}catch(z){if(s||!e.isConnected)return;Hd(e,z.message||"\u7121\u6CD5\u53D6\u5F97\u9996\u9801\u5373\u6642\u8CC7\u6599\u3002")}finally{a=!1,w(!1),n&&!s&&(n=!1,q({quiet:!0}))}};y?.addEventListener("input",v),f?.addEventListener("submit",$=>{$.preventDefault(),p()}),y?.addEventListener("keydown",$=>{$.key==="Enter"&&!$.shiftKey&&!$.isComposing&&($.preventDefault(),p())});let k=()=>{if(s||d)return;let $=Math.max(0,Ed-(Date.now()-u));if($===0){q({quiet:!0});return}d=window.setTimeout(()=>{d=null,s||q({quiet:!0})},$)};e.addEventListener("click",$=>{if($.target.closest("#home-refresh")||$.target.closest("#home-retry")){d&&(window.clearTimeout(d),d=null),q();return}if($.target.closest("#home-laws-download")){let L=l?.content||`${(l?.laws||[]).join(`
`)}
`;L.trim()&&Qt("\u91D1\u878D\u6CD5\u898F.md",L)}}),e.addEventListener("toggle",$=>{let L=$.target.closest?.("[data-home-wf-stage]");if(!L||!e.contains(L))return;let z=L.dataset.homeWfStage||"";z&&(L.open?bn.add(z):bn.delete(z))},!0),v(),y?.focus({preventScroll:!0});let S=ys(po,300*1e3);if(S?(o=S?.data||null,l=S?.data?.financial_laws||null,mo(e,S,{clientMs:0}),q({quiet:!0})):await q(),!s)try{i=Ct("processing",($,L)=>{s||L?.initial||k()},{onError:()=>{}})}catch{i=null}return()=>{s=!0,d&&(window.clearTimeout(d),d=null),typeof i=="function"&&i(),i=null}}var li={};hs(li,{render:()=>Ip});var fo="judgment-console";var jt="query_history",ds="settings",us="audit_events";var gt={history:[],settings:new Map,audit:[],nextId:1},$n=null,_t=!("indexedDB"in window);function Yt(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function Wt(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function Xt(){return $n||($n=new Promise((e,t)=>{if(!("indexedDB"in window)){_t=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(fo,2)}catch(a){_t=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(jt)){let n=a.createObjectStore(jt,{keyPath:"id",autoIncrement:!0});n.createIndex("created_at","created_at"),n.createIndex("kind","kind")}if(a.objectStoreNames.contains(ds)||a.createObjectStore(ds,{keyPath:"key"}),!a.objectStoreNames.contains(us)){let n=a.createObjectStore(us,{keyPath:"key"});n.createIndex("created_at","created_at"),n.createIndex("dataset","dataset"),n.createIndex("jid","jid"),n.createIndex("issue_month","issue_month")}},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{_t=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{_t=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),$n)}function bo(){return"indexedDB"in window}function vo(){return _t}function La(){return _t?"memory":"indexeddb"}function Ud(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},turns:Array.isArray(e.turns)?e.turns:[],pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t,updated_at:e.updated_at||t}}async function Gd(){try{let t=(await Xt()).transaction(jt,"readwrite"),s=t.objectStore(jt),a=await Yt(s.count());if(a>120){let n=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let d=i.result;if(!d||n<=0){o();return}d.delete(),n-=1,d.continue()},i.onerror=()=>l(i.error)})}await Wt(t)}catch{_t=!0}}async function ja(e){let t=Ud(e);try{let a=(await Xt()).transaction(jt,"readwrite"),n=a.objectStore(jt),i=await Yt(n.add(t));return await Wt(a),await Gd(),i}catch{_t=!0;let a=gt.nextId++;return gt.history.push({id:a,...t}),gt.history.length>120&&gt.history.shift(),a}}async function la(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let n=(await Xt()).transaction(jt,"readwrite"),i=n.objectStore(jt),o=await Yt(i.get(s));if(!o)return await Wt(n),null;let l={...o,...t,id:s};return await Yt(i.put(l)),await Wt(n),l}catch{_t=!0;let n=gt.history.findIndex(i=>Number(i.id)===s);return n===-1?null:(gt.history[n]={...gt.history[n],...t,id:s},gt.history[n])}}async function ho(e){let t=Number(e);if(!Number.isFinite(t))return!1;try{let a=(await Xt()).transaction(jt,"readwrite");return a.objectStore(jt).delete(t),await Wt(a),!0}catch{_t=!0;let a=gt.history.findIndex(n=>Number(n.id)===t);return a===-1?!1:(gt.history.splice(a,1),!0)}}async function yn({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let n=(await Xt()).transaction(jt,"readonly"),i=n.objectStore(jt),o=await Yt(i.getAll());return await Wt(n),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,d)=>String(d.updated_at||d.created_at).localeCompare(String(l.updated_at||l.created_at))).slice(0,t)}catch{return _t=!0,gt.history.filter(n=>s?`${n.kind} ${n.title} ${n.detail}`.toLowerCase().includes(s):!0).slice().sort((n,i)=>String(i.updated_at||i.created_at).localeCompare(String(n.updated_at||n.created_at))).slice(0,t)}}async function $o(){try{let t=(await Xt()).transaction(jt,"readwrite");t.objectStore(jt).clear(),await Wt(t)}catch{_t=!0}gt.history=[]}function Qd(e){let t=Number(e.id??e.event_id??0)||0,s=String(e.dataset||e.kind||"judgment"),a=String(e.key||`${s}:${t||`${Date.now()}:${Math.random().toString(36).slice(2)}`}`),n=String(e.jid||""),i=String(e.issue_month||""),o=String(e.change_type||""),l=String(e.detected_at||e.created_at||new Date().toISOString());return{key:a,event_id:t,dataset:s,jid:n,issue_month:i,change_type:o,title:String(e.title||n||i||"\u7248\u672C\u8B8A\u66F4"),detail:String(e.detail||[o,i,n].filter(Boolean).join(" \xB7 ")),created_at:l,payload:e}}async function Jd(){try{let t=(await Xt()).transaction(us,"readwrite"),s=t.objectStore(us),a=await Yt(s.count());if(a>2e3){let n=a-2e3,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let d=i.result;if(!d||n<=0){o();return}d.delete(),n-=1,d.continue()},i.onerror=()=>l(i.error)})}await Wt(t)}catch{_t=!0}}async function yo(e){let t=(Array.isArray(e)?e:[]).filter(s=>s&&typeof s=="object").map(Qd);if(!t.length)return 0;try{let a=(await Xt()).transaction(us,"readwrite"),n=a.objectStore(us);for(let i of t)await Yt(n.put(i));return await Wt(a),await Jd(),t.length}catch{_t=!0;let a=new Map(gt.audit.map(n=>[n.key,n]));for(let n of t)a.set(n.key,n);return gt.audit=Array.from(a.values()).sort((n,i)=>String(i.created_at).localeCompare(String(n.created_at))).slice(0,2e3),t.length}}async function wo({keyword:e="",limit:t=200}={}){let s=e.trim().toLowerCase(),a=n=>s?`${n.dataset} ${n.jid} ${n.issue_month} ${n.change_type} ${n.detail}`.toLowerCase().includes(s):!0;try{let i=(await Xt()).transaction(us,"readonly"),o=i.objectStore(us),l=await Yt(o.getAll());return await Wt(i),l.filter(a).sort((d,u)=>String(u.created_at).localeCompare(String(d.created_at))).slice(0,t)}catch{return _t=!0,gt.audit.filter(a).slice().sort((i,o)=>String(o.created_at).localeCompare(String(i.created_at))).slice(0,t)}}async function _o(){let e={name:fo,version:2,supported:"indexedDB"in window,mode:La(),degraded:_t,stores:[jt,ds,us],caps:{history:120,audit:2e3},usage_bytes:null,quota_bytes:null};if(typeof navigator<"u"&&navigator.storage?.estimate)try{let t=await navigator.storage.estimate();e.usage_bytes=Number.isFinite(t.usage)?t.usage:null,e.quota_bytes=Number.isFinite(t.quota)?t.quota:null}catch{}try{let s=(await Xt()).transaction([jt,ds,us],"readonly"),a=Wt(s),[n,i,o]=await Promise.all([Yt(s.objectStore(jt).count()),Yt(s.objectStore(ds).count()),Yt(s.objectStore(us).count()),a]);return{...e,available:!0,counts:{query_history:n,settings:i,audit_events:o},total:n+i+o}}catch{return _t=!0,{...e,available:!1,degraded:!0,mode:"memory",counts:{query_history:gt.history.length,settings:gt.settings.size,audit_events:gt.audit.length},total:gt.history.length+gt.settings.size+gt.audit.length}}}async function Ta(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let n=(await Xt()).transaction(ds,"readwrite");return n.objectStore(ds).put(s),await Wt(n),s}catch{return _t=!0,gt.settings.set(s.key,s),s}}async function Rs(e,t=null){try{let a=(await Xt()).transaction(ds,"readonly"),n=a.objectStore(ds),i=await Yt(n.get(String(e)));return await Wt(a),i?i.value:t}catch{_t=!0;let a=gt.settings.get(String(e));return a?a.value:t}}async function ko({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await Xt()).transaction(ds,"readonly"),n=a.objectStore(ds),i=await Yt(n.getAll());return await Wt(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return _t=!0,Array.from(gt.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function So(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var Zr={};hs(Zr,{buildFlowWaterfallStages:()=>pl,render:()=>dp,renderRagPipelineWaterfall:()=>ua,renderTestFlowPanel:()=>pa,renderWaterfallStages:()=>Nn});var Wd={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},Vd=new Set(["running","stopping"]);function kn(e){let[t,s]=Wd[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${r(t)}</span>`}function wn(e){return String(e).padStart(2,"0")}function ca(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${wn(t.getMonth()+1)}-${wn(t.getDate())} ${wn(t.getHours())}:${wn(t.getMinutes())}`}function _n(e){return Vd.has(e)}function ks(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function Us(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function Cs(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${r(e)}</span>
    <strong>${r(String(t))}</strong>
    ${s?`<small>${r(s)}</small>`:""}
  </div>`}function xo(e={}){let t=e.score_components||e,s=e.gate||{},a=String(s.status||""),n=a==="pass"?"Gate \u901A\u904E":a==="fail"?"Gate \u5931\u6557":a==="no_data"?"Gate \u7121\u8CC7\u6599":"";return`${n?`<span class="badge ${a==="pass"?"badge-ok":a==="fail"?"badge-danger":"badge-neutral"}">${r(n)}</span>`:""}<div class="bench-metrics">
    ${Cs("Law Recall",Us(t.law_recall))}
    ${Cs("Article Recall",Us(t.article_recall))}
    ${Cs("Citation Valid",Us(t.citation_valid_rate))}
    ${Cs("Judge",ks(t.judge_overall))}
    ${Cs("Human",ks(t.human_overall))}
    ${Cs("p50",be(e.duration_p50_ms))}
    ${Cs("p95",be(e.duration_p95_ms))}
    ${Cs("Success",`${c(e.success||0)} / ${c(e.total||0)}`)}
  </div>`}function Ao(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${r(s.replace(/^rag\./,""))}</span>
      <strong>${be(a.p50_ms)}</strong>
      <small>p95 ${be(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function qo(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${Us(s.law_recall)}</span>
    <span>Article ${Us(s.article_recall)}</span>
    <span>Judge ${ks(s.judge_overall)}</span>
    <span>p95 ${be(t.duration_p95_ms)}</span>`}function Mo(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function Lo(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${r(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${r(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${r(e.status||"")}">${kn(e.status)}</span>
      <span class="mono">${r(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${r($e(e.started_at))}</span>
      <span data-bench-slot="run-completed">${c(e.completed_cases||0)} / ${c(e.total_cases||0)} \u984C</span>
      <span>${r(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${r(Mo(e))}">${qo(e)}</span>
  </button>`}function Dr(e,t=[]){let s=e.metrics||{},a=e.judge||{},n=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([u])=>u.startsWith("rag.")).map(([u,f])=>`<span class="chip">${r(u)} ${be(f)}</span>`).join(""),d=(e.law_sources||[]).map(u=>`<span class="chip">${r(u.law_name||"\u6CD5\u898F")} ${c((u.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${r(e.question)}</span>
      ${kn(e.status)}
      <span class="bench-case-time">${be(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${ks(i.deterministic)} \xB7 Judge ${ks(i.judge)} \xB7 Human ${ks(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${r((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${r(e.fingerprint||"")}">${m("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
      </div>
      <div class="bench-case-stages">${l||'<span class="qb-muted">\u6C92\u6709 stage timing</span>'}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${Us(s.law_recall)}</span>
        <span>Article recall ${Us(s.article_recall)}</span>
        <span>Citation ${s.citation_valid?"valid":"invalid"}</span>
        <span>Refusal ${s.refusal_correct===null?"\u2014":s.refusal_correct?"correct":"wrong"}</span>
      </div>
      <div class="chips">${d||'<span class="qb-muted">\u6C92\u6709\u6CD5\u898F\u4F86\u6E90</span>'}</div>
      <div class="bench-answer"><strong>\u56DE\u7B54</strong><p>${r(e.answer||"\u2014")}</p></div>
      <div class="bench-judge"><strong>LLM judge</strong><p>${r(a.rationale||a.reason||"\u2014")}</p><span>${[["correctness",a.correctness],["grounding",a.grounding],["citation",a.citation],["clarity",a.clarity],["overall",a.overall]].map(([u,f])=>`${u} ${f??"\u2014"}`).join(" \xB7 ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${e.id}">
        <div class="bench-human-grid">
          ${[["correctness","\u6B63\u78BA\u6027",n.scores?.correctness??4],["grounding","\u6709\u64DA\u6027",n.scores?.grounding??4],["citation","\u5F15\u7528",n.scores?.citation??4],["clarity","\u6E05\u695A",n.scores?.clarity??4],["overall","\u6574\u9AD4",n.overall??4]].map(([u,f,y])=>tn({name:`score_${u}`,label:f,value:y})).join("")}
        </div>
        <label class="field"><span class="field-label">\u4EBA\u5DE5\u6279\u6CE8</span><input class="input" name="comment" value="${r(n.comment||"")}" placeholder="\u56DE\u7B54\u54C1\u8CEA\u3001\u5F15\u7528\u6216\u4E8B\u5BE6\u932F\u8AA4" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${m("check",13)}<span>\u5132\u5B58\u4EBA\u5DE5\u8A55\u5206</span></button>
      </form>
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(u=>`<div class="bench-history-row"><span>${r($e(u.run?.started_at))}</span><span>${r(u.run?.config?.llm_model||"\u2014")}</span><span>Det ${ks(u.metrics?.scores?.deterministic)}</span><span>Judge ${ks(u.metrics?.scores?.judge)}</span><span>Human ${ks(u.metrics?.scores?.human)}</span><span>${be(u.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function Ir(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function jo(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${Dr(e,t)}
  </details>`}function To(e){return`${kn(e.status)}
    <span class="mono">${r(e.run_id)}</span>
    ${_n(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${m("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function Kd(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${r(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${m("activity",14)}${r(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${r((e.status||"")+":"+e.run_id)}">
        ${To(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${xo(e.summary||{})}</div>
    <div data-bench-detail="stages">${Ao(e.summary||{})}</div>
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
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>jo(a,t[a.fingerprint]||[])).join(""):Ge({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function Eo(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${m("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${m("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function No(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),n=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,n-i):0,l=(t||[]).filter(v=>["success","failed"].includes(v.status)).map(v=>Number(v.duration_ms)||0).filter(v=>v>0),d=null;if(l.length)d=l.reduce((v,w)=>v+w,0)/l.length;else if(a>0){let v=Date.parse(e.updated_at||""),w=Number.isFinite(v)?v:i;Number.isFinite(w)&&w>i?d=(w-i)/a:o>0&&(d=o/a)}let u=(t||[]).find(v=>v.status==="running")||null,f=0;if(a<s&&d&&d>0){let v=u?Date.parse(u.started_at||""):NaN,w=Date.parse(e.updated_at||""),q=Number.isFinite(v)?v:w;Number.isFinite(q)&&(f=Math.max(0,Math.min(.95,(n-q)/d)))}let y=Math.min(s,a+f),b=s>0?Math.max(0,Math.min(100,y/s*100)):0,p=d===null?null:Math.max(0,s-y)*d;return{total:s,completed:a,elapsedMs:o,averageMs:d,progress:b,etaMs:p,ratePerMin:d?6e4/d:null,running:u}}function Ro(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${be(e)}`}function Co(e,t=[]){let s=No(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${r(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${c(s.completed)} / ${c(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${Ro(s.etaMs)}</span>
      <span data-bench-slot="progress-rate">${s.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${s.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`}</span>
    </div>
    <div class="processing-bar processing-bar-lg bench-progress-bar${s.completed===0?" is-waiting":""}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.progress.toFixed(1)}" data-bench-slot="progress-bar">
      <span class="processing-bar-fill" data-bench-slot="progress-fill" style="width:${s.progress.toFixed(2)}%"></span>
    </div>
    <div class="bench-progress-foot">
      <span data-bench-slot="progress-elapsed">\u5DF2\u57F7\u884C ${be(s.elapsedMs)}</span>
      <span data-bench-slot="progress-average">${s.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${be(s.averageMs)}\uFF0F\u984C`}</span>
      <span>\u5373\u6642\u9810\u4F30 \xB7 \u6BCF\u5B8C\u6210\u4E00\u984C\u6821\u6B63</span>
    </div>
  </div>`}function Yd(e){let t=e.models?.models||{},s=e.suites||[],a=Ea(e),n=e.selectedRun;return`<section class="report-card bench-card">
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
      <label class="field"><span class="field-label">Run \u6A19\u7C64</span><input class="input" name="label" value="${r(e.config.label||ca())}" /></label>
      <div class="qb-actions" data-bench-actions data-signature="${r(a?`${a.run_id}:${a.status}`:"")}">
        ${Eo(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${r(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?Co(a,Fr(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>Lo(i,n?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${n?Kd(n,e.history):""}
  </section>`}function Ea(e){let t=(e.runs||[]).find(s=>_n(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!_n(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function Fr(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function Po(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:ca(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",refreshStream:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),n=j=>{let x=new FormData(j);return{label:String(x.get("label")||"").trim()||ca(),embedding_model:String(x.get("embedding_model")||""),llm_model:String(x.get("llm_model")||""),judge_model:String(x.get("judge_model")||""),top_k:Number(x.get("top_k")||4),score_threshold:Number(x.get("score_threshold")||.35),repeats:Number(x.get("repeats")||1),enable_law_retrieval:j.elements.enable_law_retrieval?.checked??!0,judge_enabled:j.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(j=>`${j.id}:${j.name}:${j.item_count}:${j.version}:${j.status}`)]:null,runs:(s.runs||[]).map(j=>`${j.run_id}:${j.label||""}:${j.suite_version||1}`)}),o=()=>{let x=a()?.querySelector("[data-bench-live]"),E=Ea(s);if(!x||!E)return;let H=No(E,Fr(s,E)),te=(Te,B)=>{let we=x.querySelector(`[data-bench-slot="${Te}"]`);we&&we.textContent!==B&&(we.textContent=B)};te("progress-count",`${c(H.completed)} / ${c(H.total)} \u984C`),te("progress-percent",`${H.progress.toFixed(1)}%`),te("progress-eta",Ro(H.etaMs)),te("progress-rate",H.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${H.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),te("progress-elapsed",`\u5DF2\u57F7\u884C ${be(H.elapsedMs)}`),te("progress-average",H.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${be(H.averageMs)}\uFF0F\u984C`),te("progress-state",E.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let U=x.querySelector('[data-bench-slot="progress-bar"]');U&&(U.setAttribute("aria-valuenow",H.progress.toFixed(1)),U.classList.toggle("is-waiting",H.completed===0));let ie=x.querySelector('[data-bench-slot="progress-fill"]');ie&&(ie.style.width=`${H.progress.toFixed(2)}%`)},l=j=>{let x=j.querySelector("[data-bench-actions]");if(!x)return;let E=Ea(s),H=E?`${E.run_id}:${E.status}`:"";x.dataset.signature!==H&&(x.dataset.signature=H,x.innerHTML=Eo(E))},d=j=>{let x=j.querySelector("[data-bench-live-wrap]");if(!x)return;let E=Ea(s),H=E?`${E.run_id}:${E.status}:${E.total_cases}`:"";x.dataset.signature!==H&&(x.dataset.signature=H,x.innerHTML=E?Co(E,Fr(s,E)):"")},u=j=>{let x=j.querySelector("[data-bench-runs]");if(!x)return;let E=s.runs||[],H=[...x.querySelectorAll("[data-run-id]")].map(U=>U.dataset.runId),te=E.map(U=>U.run_id);if(H.join("|")!==te.join("|")){x.innerHTML=E.length?E.map(U=>Lo(U,s.selectedRun?.run_id===U.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let U of E){let ie=x.querySelector(`[data-run-id="${U.run_id}"]`);if(!ie)continue;ie.classList.toggle("is-active",s.selectedRun?.run_id===U.run_id);let Te=ie.querySelector('[data-bench-slot="run-label"]');Te&&Te.textContent!==(U.label||"RAG Benchmark")&&(Te.textContent=U.label||"RAG Benchmark");let B=ie.querySelector('[data-bench-slot="run-status"]');B&&B.dataset.status!==(U.status||"")&&(B.dataset.status=U.status||"",B.innerHTML=kn(U.status));let we=ie.querySelector('[data-bench-slot="run-completed"]');if(we){let Oe=`${c(U.completed_cases||0)} / ${c(U.total_cases||0)} \u984C`;we.textContent!==Oe&&(we.textContent=Oe)}let ce=ie.querySelector('[data-bench-slot="run-scores"]'),Le=Mo(U);ce&&ce.dataset.signature!==Le&&(ce.dataset.signature=Le,ce.innerHTML=qo(U))}},f=j=>{let x=s.selectedRun;if(!x)return;let E=j.querySelector(`.bench-detail[data-run-id="${x.run_id}"]`);if(!E)return;let H=E.querySelector("[data-bench-detail-actions]");if(H){let ce=`${x.status||""}:${x.run_id}`;H.dataset.signature!==ce&&(H.dataset.signature=ce,H.innerHTML=To(x))}let te=E.querySelector('[data-bench-detail="metrics"]');if(te){let ce=JSON.stringify(x.summary||{});te.dataset.signature!==ce&&(te.dataset.signature=ce,te.innerHTML=xo(x.summary||{}))}let U=E.querySelector('[data-bench-detail="stages"]');if(U){let ce=JSON.stringify((x.summary||{}).stages||{});U.dataset.signature!==ce&&(U.dataset.signature=ce,U.innerHTML=Ao(x.summary||{}))}let ie=E.querySelector("[data-bench-cases]");if(!ie)return;let Te=x.cases||[];if(!Te.length)return;let B=ie.querySelector(".notice");B&&B.remove();let we=new Map([...ie.querySelectorAll("details.bench-case")].map(ce=>[Number(ce.dataset.resultId),ce]));for(let ce of Te){let Le=s.history[ce.fingerprint]||[],Oe=Ir(ce,Le),Ne=we.get(Number(ce.id));if(!Ne){ie.insertAdjacentHTML("beforeend",jo(ce,Le)),Ne=ie.lastElementChild,Ne&&(Ne._benchSignature=Oe);continue}if(Ne._benchSignature===Oe||!s.forcedCaseIds.delete(Number(ce.id))&&Ne.contains(document.activeElement))continue;let ue=Ne.open;Ne.innerHTML=Dr(ce,Le),Ne.open=ue,Ne._benchSignature=Oe}},y=()=>{Ea(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},b=()=>{let j=a();j&&(l(j),d(j),u(j),f(j),o(),y())},p=j=>{let x=s.selectedRun;if(!x)return;let E=j.querySelector('[data-bench-detail="metrics"]');E&&(E.dataset.signature=JSON.stringify(x.summary||{}));let H=j.querySelector('[data-bench-detail="stages"]');H&&(H.dataset.signature=JSON.stringify((x.summary||{}).stages||{}));let te=j.querySelector("[data-bench-cases]");if(!te)return;let U=new Map((x.cases||[]).map(ie=>[Number(ie.id),ie]));for(let ie of te.querySelectorAll("details.bench-case")){let Te=U.get(Number(ie.dataset.resultId));Te&&(ie._benchSignature=Ir(Te,s.history[Te.fingerprint]||[]))}},v=(j=!1)=>{let x=a();if(!x)return;let E=i();if(!j&&s.renderSignature===E){b();return}s.renderSignature=E,s.forcedCaseIds.clear(),x.innerHTML=Yd(s),p(x),b()},w=async({refreshAll:j=!1,runs:x=null}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||j;return}s.loading=!0;try{if(!s.referenceLoaded||j){let[B,we]=await Promise.all([O.benchmarkModels(),O.benchmarkSuites()]);s.models=B,s.suites=we.suites||[],s.indexVersion=B.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=B.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=B.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(B.models?.llm||[]).find(ce=>ce!==s.config.llm_model)||"")}let E=x?{runs:x}:await O.benchmarkRuns(30);s.runs=E.runs||[];let H=s.activeRunId,te=s.runs.find(B=>_n(B.status))||null;s.activeRunId=te?.run_id||"";let U=s.selectedRun?.run_id||"";U||(U=te?.run_id||s.runs[0]?.run_id||"");let ie=!!(s.selectedRun&&H&&s.selectedRun.run_id===H);U&&(!s.selectedRun||s.selectedRun.run_id!==U||U===te?.run_id||ie)?s.selectedRun=await O.benchmarkRun(U,!0):U||(s.selectedRun=null),s.loaded=!0,v()}catch(E){if(!s.loaded){s.renderSignature="";let H=a();H&&(H.innerHTML=Ge({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:r(E.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let E=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,w({refreshAll:E})}}},q=()=>{s.refreshStream||(s.refreshStream=Ct("benchmark",(j,x)=>{s.loading||w({runs:x?.snapshot?.runs||null})}))},k=async j=>{try{s.selectedRun=await O.benchmarkRun(j,!0),v()}catch(x){T(x.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},S=async j=>{!s.labelTouched&&j.elements.label&&(j.elements.label.value=ca());let x=n(j);s.config=x;let E=Number(j.elements.suite_id?.value||0);if(!E){T("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await O.startBenchmarkRun({suite_id:E,config:x,actor:"anonymous"}),T("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=ca(),s.labelTouched=!1,await w()}catch(H){T(H.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},$=async j=>{try{await O.stopBenchmarkRun(j),T("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await w()}catch(x){T(x.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},L=async j=>{let x=Number(j.dataset.resultId||0),E=new FormData(j),H={};for(let te of["correctness","grounding","citation","clarity","overall"]){let U=Number(E.get(`score_${te}`));Number.isFinite(U)&&(H[te]=U)}try{await O.reviewBenchmarkResult(x,{reviewer:"anonymous",scores:H,comment:String(E.get("comment")||"")}),T("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await O.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(x)),v()}catch(te){T(te.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},z=async j=>{if(j)try{let x=await O.benchmarkFingerprintHistory(j,50);s.history[j]=x.cases||[];let E=s.selectedRun,H=a();if(!E||!H)return;let te=(E.cases||[]).filter(U=>U.fingerprint===j);for(let U of te){let ie=H.querySelector(`details.bench-case[data-result-id="${U.id}"]`);if(!ie)continue;let Te=ie.open;ie.innerHTML=Dr(U,s.history[j]),ie.open=Te,ie._benchSignature=Ir(U,s.history[j])}}catch(x){T(x.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},P=async j=>{let x=j.target.closest("[data-bench-action]");if(!x)return;let E=x.dataset.benchAction;E==="open-run"?await k(x.dataset.runId||""):E==="stop"?await $(x.dataset.runId||""):E==="fingerprint-history"&&await z(x.dataset.fingerprint||"")},Y=async j=>{let x=j.target.closest("[data-bench-form]");x&&(j.preventDefault(),x.dataset.benchForm==="run"?await S(x):x.dataset.benchForm==="human"&&await L(x))},me=j=>{j&&(j.elements.label&&j.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=n(j),j.elements.suite_id&&(s.selectedSuiteId=Number(j.elements.suite_id.value)||s.selectedSuiteId))},X=j=>{let x=j.target.closest('[data-bench-form="run"]');x&&me(x)};return e.addEventListener("click",P),e.addEventListener("submit",Y),e.addEventListener("input",X),e.addEventListener("change",X),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=ca();let j=a()?.querySelector('input[name="label"]');j&&(j.value=s.config.label)}q(),w({refreshAll:!s.referenceLoaded})},refresh(){return q(),w({refreshAll:!0})},destroy(){e.removeEventListener("click",P),e.removeEventListener("submit",Y),e.removeEventListener("input",X),e.removeEventListener("change",X),s.refreshStream&&s.refreshStream(),s.refreshStream=null,s.tickTimer&&window.clearInterval(s.tickTimer)}}}var Jr={};hs(Jr,{exportCsv:()=>Ln,exportableResult:()=>jn,render:()=>Ru,renderReport:()=>An,reportError:()=>Mn,reportLoading:()=>Na});var Uo=[10,25,50,100],Io=500,Xd=["law_name","law_level","law_category","law_modified_date","article_count"],Zd=["jid","court_normalized","title","jdate","matched_laws","citation_count"],eu={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function qn(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function Sn(e,t){let s={};for(let a of e.fields||[]){let n=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?n:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{},fuzzyTerms:[]}}function tu(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,n]of Object.entries(s))if(Array.isArray(n)&&!n.map(String).includes(String(t[a]??"")))return!1;return!0}function Qr(e,t){return(e.fields||[]).filter(s=>tu(s,t))}function su(e,t){return`filter-${e.id}-${t}`}function Gs(e){return e==null?"":r(String(e))}function Br(e,t,s){let a=s[t.key],n=su(e,t.key),i=t.help?`<span class="field-help">${r(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(d=>`<option value="${Gs(d.value)}" ${String(d.value)===String(a??"")?"selected":""}>${r(d.label??d.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${n}" name="${r(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),d=(t.options||[]).map(u=>`<label class="multi-option">
          <input type="checkbox" name="${r(t.key)}" value="${Gs(u.value)}" ${l.has(String(u.value))?"checked":""} />
          <span>${r(u.label??u.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${d}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${n}" name="${r(t.key)}"
        value="${Gs(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${Gs(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${n}" name="${r(t.key)}"
        value="${Gs(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${n}" name="${r(t.key)}"
      value="${Gs(a)}"
      placeholder="${Gs(t.placeholder||"")}" />
    ${i}
  </div>`}function Do(e,t,{focusTable:s=!1}={}){let a=Qr(e,t.values),n=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(n.push(`<div class="field-row">${Br(e,o,t.values)}${Br(e,l,t.values)}</div>`),i+=1):n.push(Br(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
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
  </form>`}function xn(e,t,s){let a={...s.values};for(let n of Qr(t,a))if(n.type==="checkbox"){let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=!!i?.checked}else if(n.type==="multiselect")a[n.key]=Array.from(e.querySelectorAll(`[name="${n.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=i?i.value:""}return a}function Go(e,t){let s={};for(let a of Qr(e,t.values)){let n=t.values[a.key];a.type==="checkbox"?s[a.key]=!!n:a.type==="multiselect"?s[a.key]=Array.isArray(n)?n:[]:a.type==="number"?s[a.key]=n===""||n===null?"":Number(n):s[a.key]=n??""}return s}function Or(e,t){let s=Go(e,t);return Array.isArray(t.fuzzyTerms)&&t.fuzzyTerms.length&&(s.keywords=[...t.fuzzyTerms]),(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function au(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${Ge({tone:t,title:`${qn(e)} ${ns(e.status).label}`,text:r(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function nu(e,t){return`<label class="field data-source-field">
    <span class="field-label">\u8CC7\u6599\u4F86\u6E90</span>
    <select class="select" name="database">
      ${e.map(s=>{let a=ns(s.status);return`<option value="${r(s.id)}" ${s.id===t?"selected":""}>${r(s.label)} \xB7 ${r(a.label)}</option>`}).join("")}
    </select>
  </label>`}function Fo(e,t){return`<nav class="data-nav" aria-label="\u8CC7\u6599\u67E5\u8A62\u529F\u80FD">
    ${[{id:"law",label:"\u67E5\u8A62\u6CD5\u898F\u547D\u4EE4",hint:"Fuzzy \u6CD5\u898F\u540D\u7A31\u3001\u985E\u5225\u8207\u547D\u4EE4",icon:"file"},{id:"judgment",label:"\u67E5\u8A62\u5224\u6C7A",hint:"Fuzzy \u6CD5\u9662\u3001\u6848\u865F\u8207\u6848\u7531",icon:"layers"},{id:"schema",label:"\u8CC7\u6599\u5EAB Schema",hint:"\u8CC7\u6599\u8868\u3001\u6B04\u4F4D\u8207\u9810\u89BD",icon:"table"}].map(a=>{let n=a.id==="schema"?t==="schema":t==="query"&&e===a.id;return`<button class="data-nav-item${n?" is-active":""}" type="button"
          data-action="data-nav" data-tab="${a.id}" ${n?'aria-current="page"':""}>
          <span class="data-nav-icon">${m(a.icon,15)}</span>
          <span class="data-nav-copy">
            <strong>${r(a.label)}</strong>
            <small>${r(a.hint)}</small>
          </span>
        </button>`}).join("")}
  </nav>`}function ru(e,t,s){if(t.id!=="postgres"&&t.id!=="parquet")return"";let a=Array.isArray(s.fuzzyTerms)?s.fuzzyTerms:[],n=e==="law"?"Fuzzy \u6CD5\u898F\uFF0F\u547D\u4EE4":"Fuzzy \u5224\u6C7A",i=e==="law"?"\u8F38\u5165\u6CD5\u898F\u540D\u7A31\u6216\u76F8\u8FD1\u5B57\u2026":"\u8F38\u5165\u6CD5\u9662\u3001\u6848\u865F\u3001\u6848\u7531\u6216\u76F8\u8FD1\u5B57\u2026";return`<div class="data-fuzzy" data-data-fuzzy data-fuzzy-kind="${e}">
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
  </div>`}function Hr(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],n=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function iu(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||r(e.detail||"")}function ou(e){return`<div class="report-empty">
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
  </div>`}function Na(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(qn(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function Mn(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(qn(t))} \u67E5\u8A62\u5931\u6557</div>
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
  </div>`}function lu(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,n=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${r(s.label||"\u672A\u5206\u985E")}">${r(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${n.toFixed(1)}%"></span></span>
          <span class="dist-value">${c(a)}</span>
        </div>`}).join("")}
  </div>`}function Qo(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function cu(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function du(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function uu(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${r(String(t))}"
    title="\u6AA2\u8996\u300C${r(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${r(String(t))}${m("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var pu={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function mu(e,t,s,a=!1,n=!0,i=!1){let o=a?e.key:e.label||e.key,l=n?t?pu[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${r(o)}</th>`;let d=s?.key===l,u=d?s.direction:null,f=u==="asc"?"ascending":u==="desc"?"descending":"none",y=u==="asc"?"\u2191":u==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${f}">
    <button class="table-sort${d?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${r(l)}"
      title="\u4F9D${r(o)}\u6392\u5E8F">
      <span>${r(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${y}</span>
    </button>
  </th>`}function gu(e,t){if(!Qo(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,n=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(n||""),lawName:String(t.law_name||"")}}function fu(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${r(s.lawKey)}"
    data-law-source="${r(s.sourceType)}"
    data-law-name="${r(s.lawName)}"
    title="\u6AA2\u8996\u300C${r(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(String(a))}${m("chevronRight",12,"law-link-icon")}</button>`}function Jo(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:n=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],d=(e.page-1)*e.page_size,u=Qo(e),f=cu(e),y=du(e),b=e.meta?.sort||null,p=n?`<tr class="schema-search-row">
        <th scope="col" class="cell-index-head"></th>
        ${o.map(v=>`<th scope="col">
              <div class="schema-search-wrap">
                <input class="schema-search-input" type="search"
                  data-schema-search="${r(v.key)}"
                  value="${r(String(n[v.key]??""))}"
                  placeholder="\u641C\u5C0B ${r(v.key)}"
                  autocomplete="off" />
              </div>
            </th>`).join("")}
      </tr>`:"";return o.length?l.length?`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">${c(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${u?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":f?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":y?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${p}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(v=>mu(v,f,b,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((v,w)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${d+w+1}</td>
                ${o.map(q=>{if((f||y)&&q.key==="jid")return`<td class="cell-jid">${uu(v)}</td>`;let k=u&&q.key==="law_name"?gu(e,v):null;if(k)return`<td>${fu(v,q,k)}</td>`;let $={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[q.type];return`<td${$?` class="${$}"`:""}>${en(v[q.key],q.type||"text")}</td>`}).join("")}
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
    </div>`}function bu(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Uo.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${m("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${m("chevronRight",13)}</button>
    </div>
  </div>`}function Wo(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${r(t)}</div>`).join("")}</div>`}function An(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],n=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",d=e.status||"ok",u=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${r(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${r(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${r(e.label||l)}
          ${Pe(d)}
          <span class="chip">${r(u)}</span>
        </div>
        <div class="report-sub">
          ${c(i)} \u7B46\u7B26\u5408 \xB7
          ${be(e.duration_ms)} \xB7
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
        ${lu(n)}
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
        ${Wo(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?Jo(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?bu({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function Bo(e){return`<div class="report-card schema-preview">
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
  </div>`}function zr(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let n=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${Ge({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${r(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${r(t||e.table||"\u8CC7\u6599\u8868")}
          ${Pe(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${r(String(e.database||""))} / ${r(String(e.table||"\u2014"))} \xB7 ${n.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${Jo({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${Wo(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${c(i.length)} \u7B46</span>
      <strong>\u5171 ${c(e.total)} \u7B46</strong>
    </div>
  </div>`}function Oo(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${r(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${Ge({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function vu(e){return`<div class="report-empty">
    ${xt({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${qn(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function Ur(e){return e.is_current===!0?Pe("ok","\u73FE\u884C"):e.law_abandon_note?Pe("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?Pe("empty","\u6B77\u53F2\u7248\u672C"):Pe("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function vt(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${r(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function Qs(e){return e?Kt(e):"\u2014"}function hu(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function Gr(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${r(e)}</span>
    </div>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </div>`:""}function $u(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${r(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${m("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </details>`:""}function yu(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let n=a?.name||a?.url||"";return n?a.url?`<a class="law-attachment" href="${r(Pt(a.url))}" target="_blank" rel="noopener noreferrer">
          ${m("file",12)}<span>${r(n)}</span>${m("external",11)}
        </a>`:`<span class="law-attachment">${m("file",12)}<span>${r(n)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${c(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function Vo(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function wu(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,n=s?`${c(a)} \u689D \xB7 ${c(s)} \u7AE0\u7BC0`:`${c(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${r(l)}</div>`;let d=eu[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${r(Vo(o.article_no))}">
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
  </div>`}function _u(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function da(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${m("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function ku(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${da()}
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
  </div>`}function Su(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${da()}
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
  </div>`}function xu(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let n=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",n,a.article_count_for_law?`${c(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${r(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${r(i)}</option>`}).join("")}
    </select>
  </label>`}function Au(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let n={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${n[o]} ${c(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
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
  </details>`}function qu(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let n=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(w=>w.article_type!=="C").length,l=hu(e),d=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",u=e.meta?.snapshot||"",f=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",y=[l,d,f,u].filter(Boolean).join(" \xB7 "),b=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",p=e.version||{},v=[vt("\u6CD5\u898F\u4F4D\u968E",r(e.law_level||"\u2014")),vt("\u6CD5\u898F\u985E\u5225",r(e.law_category||"\u2014")),vt("\u7570\u52D5\u65E5\u671F",Qs(e.law_modified_date)),vt("\u751F\u6548\u65E5\u671F",Qs(e.law_effective_date)),vt("\u689D\u6587\u6578",c(e.article_count)),vt("\u8CC7\u6599\u72C0\u614B",Ur(e)),vt("\u82F1\u8B6F\u540D\u7A31",r(e.eng_law_name||"\u2014")),vt("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${r(e.law_key||"\u2014")}</span>`)];return p.first_seen_version_id!==null&&p.first_seen_version_id!==void 0&&v.push(vt("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${r(p.first_seen_version_id)}`)),p.last_seen_version_id!==null&&p.last_seen_version_id!==void 0&&v.push(vt("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${r(p.last_seen_version_id)}`)),p.last_seen_at&&v.push(vt("\u6700\u5F8C\u6536\u9304\u6642\u9593",r($e(p.last_seen_at)))),p.selected_version_id!==null&&p.selected_version_id!==void 0&&v.push(vt("\u689D\u6587\u7248\u672C",`#${r(p.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${da()}
      <span class="law-report-origin" title="${r(y)}">${r(y)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${r(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${r(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${r(i)}
            ${Ur(e)}
            <span class="chip">${r(b)}</span>
          </div>
          <div class="report-sub">
            ${r([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${c(e.article_count)} \u689D \xB7 \u7570\u52D5 ${Qs(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${xu(e)}
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
          <div class="summary-value">${Qs(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${r(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${Ur(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${r(l)}</span>
        </div>
        <div class="law-meta-grid">${v.join("")}</div>
      </div>

      ${Au(e)}
      ${Gr("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${$u("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${Gr("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${Gr("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${yu(e.attachments)}
      ${wu(e)}
    </div>
    ${o>100?_u():""}
  </div>`}function Mu(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${da()}
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
  </div>`}function Lu(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${da()}
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
  </div>`}function ju(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${r(t)}"
    data-law-source=""
    data-law-name="${r(t)}"
    title="\u6AA2\u8996\u300C${r(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(t)}${m("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function Tu(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let n=String(s.article_no||"").trim();n&&t.get(a).add(n)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${ju(s)}
          <span class="judgment-citation-articles">${[...a].map(n=>r(n)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function Eu(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",n=String(e.full_text||""),i=Number(e.full_text_length)||n.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[vt("\u6848\u865F",r(e.jid||"\u2014")),vt("\u5E74\u5EA6",r(e.jyear||"\u2014")),vt("\u5B57\u5225",r(e.jcase||"\u2014")),vt("\u865F\u78BC",r(e.jno||"\u2014")),vt("\u6CD5\u9662",r(e.court||"\u2014")),vt("\u6848\u7531",r(e.title||"\u2014")),vt("\u88C1\u5224\u65E5\u671F",Qs(e.jdate)),vt("\u4F86\u6E90\u58D3\u7E2E\u6A94",r(e.source_archive||"\u2014")),vt("\u5168\u6587\u9577\u5EA6",`${c(i)} \u5B57`),vt("\u5F15\u7528\u6578",c(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(vt("\u532F\u5165 Run",`#${r(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${da()}
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
            ${r(e.court||"\u2014")} \xB7 ${Qs(e.jdate)} \xB7
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
          <div class="summary-value">${Qs(e.jdate)}</div>
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
        ${Tu(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${c(i)} \u5B57</span>
        </div>
        ${n?`<div class="judgment-fulltext">${r(n)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function Ho(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function Ln(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(Ho).join(",")],n=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([n+o+1,...t.map(l=>i[l.key])].map(Ho).join(","))}),`\uFEFF${a.join(`\r
`)}`}function jn(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,n]of Object.entries(t))a.startsWith("_")||(s[a]=n);return s})}}function Nu(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function zo(e,t){let s=performance.now(),a=Go(e,t),n=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,d=[],u=[],f=[],y=[];if(n==="audit_events"){try{let $=Number(await Rs("audit.last_event_id",0))||0,L=await O.versioningAudit({since_id:$,limit:500}),z=Array.isArray(L?.events)?L.events:[];z.length&&await yo(z.map(Y=>({...Y,dataset:"judgment"})));let P=Number(L?.latest_event_id||0);P>$&&await Ta("audit.last_event_id",P)}catch($){d.push(`\u7248\u672C audit \u540C\u6B65\u5931\u6557\uFF1A${$.message||$}`)}u=(await wo({keyword:i,limit:Io})).map($=>({created_at:$.created_at,dataset:$.dataset,issue_month:$.issue_month,change_type:$.change_type,jid:$.jid,detail:$.detail})),f=[{key:"created_at",label:"\u6642\u9593",type:"datetime"},{key:"dataset",label:"\u8CC7\u6599\u96C6",type:"text"},{key:"issue_month",label:"\u6708\u4EFD",type:"mono"},{key:"change_type",label:"\u8B8A\u66F4",type:"status"},{key:"jid",label:"\u6848\u865F",type:"mono"},{key:"detail",label:"\u6458\u8981",type:"longtext"}];let S=new Map;u.forEach($=>S.set($.change_type||"unknown",(S.get($.change_type||"unknown")||0)+1)),y=Array.from(S.entries()).map(([$,L])=>({label:$,value:L})).sort(($,L)=>L.value-$.value)}else if(n==="settings"){u=(await ko({keyword:i})).map($=>({key:$.key,value:So($.value),updated_at:$.updated_at})),f=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let S=new Map;u.forEach($=>{let L=String($.key||"").split(".")[0]||"\u5176\u4ED6";S.set(L,(S.get(L)||0)+1)}),y=Array.from(S.entries()).map(([$,L])=>({label:$,value:L})).sort(($,L)=>L.value-$.value)}else{u=(await yn({keyword:i,limit:Io})).map($=>({kind:Nu($.kind),title:$.title,detail:$.detail,created_at:$.created_at})),f=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let S=new Map;u.forEach($=>S.set($.kind,(S.get($.kind)||0)+1)),y=Array.from(S.entries()).map(([$,L])=>({label:$,value:L})).sort(($,L)=>L.value-$.value)}let b=u.length,p=(o-1)*l,v=u.slice(p,p+l),w=Math.round(performance.now()-s),q=vo();return q&&d.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:q?"degraded":"ok",message:q?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:n,columns:f,rows:v,total:b,page:o,page_size:l,duration_ms:w,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(b)},{label:"\u76EE\u524D\u9801\u9762",value:`${v.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:La()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${w} ms`}],distribution:y,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${n}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${p}`,warnings:d,meta:{store:n,filters:a,client_side:!0}}}async function Ru(e,t){let s=!1,a=null,n=[],i="law",o=null,l={},d=0,u=25,f="query",y=null,b=null,p=0,v=[],w=null,q=-1,k=0,S=0,$=null,L=null,z=null;e.innerHTML=`<section class="page data-page">
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
      ${fs(null,{loading:!0})}
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
  </section>`;let P=e.querySelector("#query-sidebar"),Y=e.querySelector("#data-nav"),me=e.querySelector("#db-options-wrap"),X=e.querySelector("#filter-area"),j=e.querySelector("#schema-area"),x=e.querySelector("#query-main"),E=e.querySelector("#schema-suggest-popover"),H=e.querySelector("#catalog-meta"),te=e.querySelector("#refresh-catalog"),U=e.querySelector("#data-judgment-stats"),ie=M=>n.find(R=>R.id===M),Te=()=>ie(i)?.databases||[],B=M=>Te().find(R=>R.id===M),we=(M,R)=>`${M}:${R}`,ce=(M,R=i)=>l[we(R,M.id)],Le=(M,R)=>{Ta(M,R).catch(()=>{})},Oe=()=>{if(!a){H.textContent="CATALOG \xB7 \u96E2\u7DDA",H.className="badge badge-danger badge-mono";return}let M=Te(),R=M.filter(Q=>Q.available).length,D=ie(i);H.textContent=`CATALOG \xB7 ${D?.label||i} \xB7 ${R}/${M.length} \u53EF\u7528`,H.className="badge badge-neutral badge-mono"},Ne=M=>{x.innerHTML=ou(M)},et=()=>{let M=L?.returnScroll??z?.returnScroll;L=null,z=null;let R=B(o),D=R?ce(R):null;f==="schema"&&b?.result?x.innerHTML=zr(b.result,_e(R,b.tableId),{columnFilters:b.columnFilters||{},searchEnabled:R.id==="postgres"||R.id==="parquet"}):D?.result?x.innerHTML=An(D.result):R&&Ne(R),typeof M=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:M,behavior:"smooth"}))},ue=(M="law-article-jump")=>{let R=x.querySelector(`#${M}`),D=Vo(R?.value);if(!D){T("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),R?.focus();return}let ee=[...x.querySelectorAll("[data-article-no]")].find(de=>de.dataset.articleNo===D);if(!ee){T(`\u627E\u4E0D\u5230\u7B2C ${D} \u689D\u3002`,"warn");return}ee.scrollIntoView({behavior:"instant",block:"center"}),ee.classList.add("is-jump-target"),window.setTimeout(()=>ee.classList.remove("is-jump-target"),2400)},re=async({lawKey:M,sourceType:R="",lawName:D="",versionId:Q=""})=>{let ee=B(o),de=ee?ce(ee):null,ve=f==="schema"?b?.result:null;if(!ee||!de?.result&&!ve||!M)return;let He=++d;L={seq:He,lawKey:M,sourceType:R,lawName:D,versionId:Q?String(Q):"",page:1,detail:null,database:ee.id,returnScroll:window.scrollY},z=null,x.innerHTML=ku(D||M),x.scrollIntoView({behavior:"smooth",block:"start"});try{let ze=await O.lawDetail(M,R,L.versionId);if(s||!L||L.seq!==He)return;L.detail=ze,L.page=1,x.innerHTML=qu(ze,{database:L.database,lawPage:L.page})}catch(ze){if(s||!L||L.seq!==He)return;x.innerHTML=Su(ze,D||M),T(ze.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},qe=async({jid:M})=>{let R=B(o),D=R?ce(R):null,Q=f==="schema"?b?.result:null;if(!R||!D?.result&&!Q||!M)return;let ee=++d;L=null;let de=R.id==="parquet"?"parquet":"postgres";z={seq:ee,jid:M,detail:null,database:R.id,source:de,returnScroll:window.scrollY},x.innerHTML=Mu(M),x.scrollIntoView({behavior:"smooth",block:"start"});try{let ve=await O.judgmentDetail(M,de);if(s||!z||z.seq!==ee)return;z.detail=ve,x.innerHTML=Eu(ve,{database:z.database})}catch(ve){if(s||!z||z.seq!==ee)return;x.innerHTML=Lu(ve,M),T(ve.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},ye=(M,R)=>`${i}:${M.id}:${R}`,_e=(M,R)=>(M.tables||[]).find(D=>D.id===R)?.label||R,Ee=(M,R,{sort:D=null,columnFilters:Q={}}={})=>{let ee={column_filters:Q};return M.id==="postgres"?(ee.table=R,ee.schema_preview=!0):M.id==="parquet"&&i==="judgment"?(ee.table="judgment_documents",ee.columns=Zd):M.id==="parquet"&&(ee.dataset="all",ee.columns=Xd),D?.key&&(ee.sort=`${D.key}:${D.direction}`),ee},C=async(M,R,{sort:D=null,columnFilters:Q={},quiet:ee=!1}={})=>{if(!R)return;lt();let de=ye(M,R),ve=++p,He=!!(ee&&b?.result&&b.key===de);y={tableId:R},b={key:de,tableId:R,loading:!0,result:null,error:null,sort:D,columnFilters:Q},He?x.setAttribute("aria-busy","true"):(j.innerHTML=Hr(M,ie(i)?.label||i,R),x.innerHTML=Bo(_e(M,R)));try{let ze;if(M.id==="indexeddb"){let Be=Sn(M,10);Be.values.store=R,Be.page=1,ze=await zo(M,Be)}else M.id==="qdrant"?ze={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:R,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(ze=await O.query({database:M.id,filters:Ee(M,R,{sort:D,columnFilters:Q}),page:1,pageSize:10}),D?.key&&(ze.meta={...ze.meta||{},sort:D}));if(s||ve!==p)return;b={key:de,tableId:R,loading:!1,result:ze,error:null,sort:D,columnFilters:Q},x.removeAttribute("aria-busy"),f==="schema"&&y?.tableId===R&&(j.innerHTML=Hr(M,ie(i)?.label||i,R),x.innerHTML=zr(ze,_e(M,R),{columnFilters:Q,searchEnabled:M.id==="postgres"||M.id==="parquet"}))}catch(ze){if(s||ve!==p)return;b={key:de,tableId:R,loading:!1,result:null,error:ze,sort:D,columnFilters:Q},x.removeAttribute("aria-busy"),f==="schema"&&y?.tableId===R&&(x.innerHTML=Oo(ze,_e(M,R)))}},G=()=>{let M=B(o);if(!M)return null;if(f==="schema"&&b?.result)return{db:M,tableId:b.tableId,columnFilters:b.columnFilters||{},sort:b.sort||null,mode:"schema"};let R=M?ce(M):null,D=R?.result;return D&&(M.id==="postgres"||M.id==="parquet")?{db:M,tableId:D.table,columnFilters:R.columnFilters||{},sort:R.sort||null,mode:"query"}:null},V=(M,R,D)=>{if(!M)return;let Q=`${M.db.id}:${M.tableId}:${R}`,ee=I.get(Q);ee&&(window.clearTimeout(ee),I.delete(Q)),lt();let de={...M.columnFilters||{}},ve=String(D||"").trim();if(ve?de[R]=ve:delete de[R],M.mode==="schema"){C(M.db,M.tableId,{sort:M.sort,columnFilters:de,quiet:!0});return}let He=ce(M.db);He.columnFilters=de,He.page=1,Ke(1)},I=new Map,W=()=>{(!E||E.hidden)&&!v.length&&!w||(k+=1,v=[],w=null,q=-1,E&&(E.hidden=!0,E.innerHTML=""))},K=(M,R)=>{let D=String(M||""),Q=D.toLocaleLowerCase(),ee=String(R||"").toLocaleLowerCase(),de=new Array(D.length).fill(!1),ve=(Xe,ct)=>{for(let pt=Xe;pt<Xe+ct;pt+=1)pt>=0&&pt<de.length&&(de[pt]=!0)},He=Q.indexOf(ee);if(He>=0)for(;He>=0;)ve(He,ee.length),He=Q.indexOf(ee,He+ee.length);else{let Xe=[];for(let ct of ee.match(/[一-鿿]{2,}/g)||[])for(let pt=0;pt<ct.length-1;pt+=1)Xe.push(ct.slice(pt,pt+2));Xe.push(...ee.match(/[a-z0-9]+/g)||[]);for(let ct of Xe){let pt=Q.indexOf(ct);for(;pt>=0;)ve(pt,ct.length),pt=Q.indexOf(ct,pt+ct.length)}}let ze="",Be=0;for(;Be<D.length;)if(de[Be]){let Xe=Be;for(;Xe<D.length&&de[Xe];)Xe+=1;ze+=`<mark>${r(D.slice(Be,Xe))}</mark>`,Be=Xe}else{let Xe=Be;for(;Xe<D.length&&!de[Xe];)Xe+=1;ze+=r(D.slice(Be,Xe)),Be=Xe}return ze||r(D)},ke=(M,R)=>{if(!E)return;let D=M.getBoundingClientRect(),Q=Math.min(420,Math.max(220,D.width)),ee=Math.min(360,34+R*30),de=D.bottom+4;de+ee>window.innerHeight-8&&(de=Math.max(8,D.top-ee-4));let ve=Math.min(window.innerWidth-Q-8,Math.max(8,D.left));E.style.width=`${Q}px`,E.style.left=`${ve}px`,E.style.top=`${de}px`},Fe=M=>{if(!E)return;let R=[...E.querySelectorAll(".schema-suggest-item")];R.length&&(q=Math.max(0,Math.min(R.length-1,M)),R.forEach((D,Q)=>{D.classList.toggle("is-active",Q===q)}),R[q].scrollIntoView({block:"nearest"}))},Ye=M=>{let R=v[M],D=w;!R||!D||(W(),V(D,D.column,R))},ht=async(M,R,D,Q)=>{if(!M||!D.trim()){W();return}let ee=++k;w={...M,column:R,input:Q},q=-1;try{let de=await O.schemaSuggest({database:M.db.id,table:M.tableId,column:R,query:D,limit:1e3});if(ee!==k||document.activeElement!==Q||!E)return;let ve=Array.isArray(de.values)?de.values:[];if(v=ve,!ve.length){W();return}let He=Number(de.total)>ve.length?`\u5171 ${c(de.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${c(ve.length)} \u500B`:`\u5171 ${c(de.total)} \u500B\u7B26\u5408`;E.innerHTML=`<div class="schema-suggest-head">${r(He)}</div>${ve.map((ze,Be)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${Be}"
            title="${r(ze)}">${K(ze,D)}</button>`).join("")}`,ke(Q,ve.length),E.hidden=!1}catch{W()}},lt=()=>{let M=document.activeElement;M instanceof HTMLElement&&M.matches("[data-schema-search]")&&M.blur(),W()},tt=(M,{resetReport:R=!1}={})=>{lt();let D=ce(M);if(Y.innerHTML=Fo(i,f),me.innerHTML=nu(Te(),M.id),f==="schema")X.hidden=!0,X.innerHTML="",j.hidden=!1,j.innerHTML=`<div class="schema-category-switch" role="tablist" aria-label="Schema \u985E\u5225">
        ${["law","judgment"].map(Q=>{let ee=n.find(de=>de.id===Q);return ee?`<button class="chip${i===Q?" is-active":""}" type="button" role="tab" aria-selected="${i===Q}" data-action="schema-category" data-category="${Q}">${r(ee.label)}</button>`:""}).join("")}
      </div>${Hr(M,ie(i)?.label||i,y?.tableId||"")}`;else{j.hidden=!0,j.innerHTML="",X.hidden=!1;let Q=ru(i,M,D),ee=Do(M,D);X.innerHTML=`${au(M)}${Q?`${Q}<details class="data-advanced"><summary>\u9032\u968E metadata \u689D\u4EF6</summary>${ee}</details>`:ee}<div class="sidebar-note">${iu(M)}</div>`}if(Oe(),f==="schema"){let Q=y?ye(M,y.tableId):"";if(b&&b.key===Q){let ee=_e(M,b.tableId);b.loading?x.innerHTML=Bo(ee):b.error?x.innerHTML=Oo(b.error,ee):x.innerHTML=zr(b.result,ee,{columnFilters:b.columnFilters||{},searchEnabled:M.id==="postgres"||M.id==="parquet"})}else x.innerHTML=vu(M);return}R?Ne(M):D.result?x.innerHTML=An(D.result):Ne(M)},rt=(M,{persist:R=!0,resetReport:D=!1}={})=>{let Q=Te(),ee=Q.find(ve=>ve.id===M)||Q[0];if(!ee)return;L=null,z=null,y=null,b=null,p+=1,o=ee.id;let de=we(i,ee.id);l[de]||(l[de]=Sn(ee,u)),tt(ee,{resetReport:D}),R&&(Le(`data.last_database.${i}`,ee.id),Le("data.last_category",i))},ae=(M,{persist:R=!0,resetReport:D=!0,databaseId:Q=null}={})=>{let ee=ie(M)||n[0];if(!ee)return;i=ee.id,L=null,z=null;let de=ee.databases||[],ve=Q&&de.find(He=>He.id===Q)||de.find(He=>He.id===o)||de[0];if(o=ve?.id||null,!ve){Y.innerHTML=Fo(i,f),me.innerHTML=`<div class="sidebar-notice">${Ge({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,X.innerHTML="",Oe();return}rt(ve.id,{persist:!1,resetReport:D}),R&&(Le("data.last_category",ee.id),Le(`data.last_database.${ee.id}`,ve.id))},it=M=>{let R=ce(M),D=X.querySelector("#data-filter-form");D&&(R.values=xn(D,M,R))},Ke=async(M=null,{quiet:R=!1}={})=>{let D=B(o);if(!D)return;lt();let Q=ce(D);it(D),M!==null&&(Q.page=M),(!Number.isFinite(Q.page)||Q.page<1)&&(Q.page=1);let ee=++d;L=null,z=null;let de=x.querySelector(".report-card"),ve=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!de?x.setAttribute("aria-busy","true"):(x.removeAttribute("aria-busy"),x.innerHTML=Na(D));let ze=X.querySelector("#run-query");R||he(ze,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Be;if(D.id==="indexeddb"?Be=await zo(D,Q):Be=await O.query({database:D.id,filters:Or(D,Q),page:Q.page,pageSize:Q.pageSize}),s||ee!==d)return;if(Be.meta={...Be.meta||{},column_filters:Q.columnFilters||{},searchable:D.id==="postgres"||D.id==="parquet",sort:Q.sort||Be.meta?.sort||null},Q.result=Be,Q.page=Number(Be.page)||Q.page,Q.pageSize=Number(Be.page_size)||Q.pageSize,x.removeAttribute("aria-busy"),x.innerHTML=An(Be),ve!==null){let ct=x.querySelector("[data-page-size]");ct&&(ct.value=String(Q.pageSize),ct.focus({preventScroll:!0}))}let Xe=ie(i)?.label||i;await ja({kind:"data",title:`${Xe} \xB7 ${D.label} \xB7 ${Be.table||Be.label||"query"}`,detail:`${c(Be.total)} \u7B46 \xB7 ${be(Be.duration_ms)}`,payload:{category:i,database:D.id,filters:Or(D,Q),page:Q.page,page_size:Q.pageSize}}),Le("data.last_query",{category:i,database:D.id,filters:Or(D,Q),page:Q.page,page_size:Q.pageSize,at:new Date().toISOString()})}catch(Be){if(s||ee!==d)return;x.removeAttribute("aria-busy"),x.innerHTML=Mn(Be,D),T(Be.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&ee===d&&he(ze,!1)}},ft=(M,R)=>{let D=M?.querySelector("[data-data-fuzzy-results]");D&&(D.innerHTML=R.length?R.map(Q=>`<button class="data-fuzzy-option" type="button" role="option" data-action="select-fuzzy-term" data-term="${r(Q.value)}"><span>${r(Q.label||Q.value)}</span><small>${r(Q.meta||"")}</small></button>`).join(""):'<div class="data-fuzzy-empty">\u6C92\u6709\u76F8\u8FD1\u7D50\u679C\uFF1B\u6309 Enter \u53EF\u76F4\u63A5\u52A0\u5165\u76EE\u524D\u8F38\u5165\u7684\u95DC\u9375\u5B57\u3002</div>')},Mt=async(M,R="")=>{if(!M)return;let D=B(o),Q=D?ce(D):null;if(!Q)return;let ee=M.dataset.fuzzyKind||i,de=M.querySelector("[data-data-fuzzy-results]"),ve=++S;de&&(de.innerHTML='<div class="data-fuzzy-loading"><span class="spinner"></span><span>\u641C\u5C0B\u76F8\u8FD1\u7D50\u679C\u2026</span></div>');try{let He=await O.dataSuggest({kind:ee,query:R,limit:12});if(ve!==S)return;let ze=(He.suggestions||[]).filter(Be=>!Q.fuzzyTerms.includes(Be.value));ft(M,ze)}catch(He){if(ve!==S)return;de&&(de.innerHTML=`<div class="data-fuzzy-empty">${r(He.message||"\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},oe=(M,{focus:R=!1}={})=>{if(!M)return;let D=M.querySelector("[data-data-fuzzy-popover]"),Q=M.querySelector("[data-data-fuzzy-search]");!D||!Q||(D.hidden&&(D.hidden=!1,Q.value="",Mt(M,"")),R&&(Q.focus(),Q.select()))},Se=M=>{$&&(window.clearTimeout($),$=null);let R=M?.querySelector("[data-data-fuzzy-popover]");R&&(R.hidden=!0)},st=async M=>{let R=B(o);if(!R)return;let D=ce(R),Q=String(M||"").trim();!Q||D.fuzzyTerms.includes(Q)||(D.fuzzyTerms=[...D.fuzzyTerms,Q],Se(X.querySelector("[data-data-fuzzy]")),tt(R),await Ke(1))},Je=async M=>{let R=B(o);if(!R)return;let D=ce(R),Q=String(M||"").trim();D.fuzzyTerms=D.fuzzyTerms.filter(ee=>ee!==Q),tt(R),await Ke(1)},zt=async()=>{te.disabled=!0,he(te,!0,"\u6574\u7406\u4E2D\u2026");try{let M=ys("judgment.catalog.v1",6e5),[R,D,Q,ee,de]=await Promise.all([M?Promise.resolve(M):O.catalog(),Rs("data.last_category","law"),Rs("data.last_database.law","postgres"),Rs("data.last_database.judgment","postgres"),Rs("data.page_size",25)]);if(s)return;M||gs("judgment.catalog.v1",R),a=R,U&&(U.innerHTML=fs(a.judgment_stats)),n=Array.isArray(a.categories)?a.categories:[],u=Uo.includes(Number(de))?Number(de):25;for(let Xe of n)for(let ct of Xe.databases||[]){let pt=we(Xe.id,ct.id);l[pt]||(l[pt]=Sn(ct,u))}let ve=n.find(Xe=>Xe.id===D)||n[0];if(!ve){Y.innerHTML="",me.innerHTML=`<div class="sidebar-notice">${Ge({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let He=ve.id==="judgment"?ee:Q;if(i=ve.id,o=null,ae(ve.id,{persist:!1,resetReport:!0,databaseId:He}),s)return;let ze=B(o),Be=ze?ce(ze):null;ze&&Be&&f==="query"&&!Be.result&&(ze.id==="postgres"||ze.id==="parquet")&&Ke(1),T("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(M){if(s)return;a=null,n=[],Y.innerHTML="",U&&(U.innerHTML=fs(null)),Oe(),me.innerHTML=`<div class="sidebar-notice">${Ge({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:r(M.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${m("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,x.innerHTML=`<div class="report-empty">${xt({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(te.disabled=!1,he(te,!1))}};P.addEventListener("change",M=>{let R=M.target;if(R.name==="category"){ae(R.value);return}if(R.name==="database"){rt(R.value);let de=B(o),ve=de?ce(de):null;de&&ve&&!ve.result&&f==="query"&&(de.id==="postgres"||de.id==="parquet")&&Ke(1);return}let D=B(o);if(!D)return;let Q=ce(D),ee=X.querySelector("#data-filter-form");!ee||!R.name||(Q.values=xn(ee,D,Q),Q.page=1,R.name==="table"&&(L=null,z=null,Q.sort=null,Q.columnFilters={},Q.result=null,X.innerHTML=Do(D,Q),Ne(D)))}),P.addEventListener("input",M=>{let R=M.target.closest("[data-data-fuzzy-search]");if(R){let de=R.closest("[data-data-fuzzy]");$&&window.clearTimeout($),$=window.setTimeout(()=>{Mt(de,R.value)},160);return}let D=B(o);if(!D)return;let Q=X.querySelector("#data-filter-form");if(!Q||!M.target.name||M.target.name==="table")return;let ee=ce(D);ee.values=xn(Q,D,ee)}),P.addEventListener("keydown",M=>{let R=M.target.closest("[data-data-fuzzy-search]");if(!R)return;let D=R.closest("[data-data-fuzzy]");if(M.key==="Escape")M.preventDefault(),Se(D),R.blur();else if(M.key==="Enter"){M.preventDefault();let Q=D?.querySelector("[data-action='select-fuzzy-term']");Q?Q.click():st(R.value)}else M.key==="ArrowDown"&&(M.preventDefault(),D?.querySelector("[data-action='select-fuzzy-term']")?.focus())}),P.addEventListener("mouseover",M=>{let R=M.target.closest("[data-action='open-fuzzy']");R&&oe(R.closest("[data-data-fuzzy]"))}),P.addEventListener("mouseout",M=>{let R=M.target.closest("[data-data-fuzzy]");R&&(M.relatedTarget&&R.contains(M.relatedTarget)||Se(R))}),P.addEventListener("submit",M=>{M.target.id==="data-filter-form"&&(M.preventDefault(),Ke(1))}),P.addEventListener("click",async M=>{let R=X.querySelector("[data-data-fuzzy] [data-data-fuzzy-popover]:not([hidden])")?.closest("[data-data-fuzzy]");R&&!M.target.closest("[data-data-fuzzy]")&&Se(R);let D=M.target.closest("[data-action]"),Q=D?.dataset.action;if(Q==="data-nav"){let ee=D.dataset.tab,de=B(o);if(ee==="schema"){if(f!=="schema"){if(de){let Be=ce(de),Xe=X.querySelector("#data-filter-form");Xe&&(Be.values=xn(Xe,de,Be))}f="schema",de&&tt(de)}return}let ve=ee==="judgment"?"judgment":"law";f==="schema"&&(f="query"),i!==ve?ae(ve,{databaseId:o,resetReport:!1}):de&&tt(de);let He=B(o),ze=He?ce(He):null;He&&ze&&!ze.result&&(He.id==="postgres"||He.id==="parquet")&&Ke(1);return}if(Q==="open-fuzzy"){oe(D.closest("[data-data-fuzzy]"),{focus:!0});return}if(Q==="select-fuzzy-term"){await st(D.dataset.term);return}if(Q==="remove-fuzzy-term"){await Je(D.dataset.term);return}if(Q==="schema-category"){f="schema",ae(D.dataset.category||"law",{resetReport:!0});return}if(Q==="select-schema-table"){let ee=B(o);if(!ee)return;C(ee,D.dataset.tableId||"");return}if(Q==="reset"){let ee=B(o);if(!ee)return;L=null,z=null;let de=ce(ee);l[we(i,ee.id)]=Sn(ee,de.pageSize),tt(ee),Ne(ee),T("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}M.target.closest("#catalog-retry")&&zt()}),x.addEventListener("input",M=>{let R=M.target.closest("[data-schema-search]");if(!R)return;let D=G();if(!D)return;let Q=R.dataset.schemaSearch||"",ee=R.value,de=`${D.mode}:${D.db.id}:${D.tableId}:${Q}`,ve=I.get(de);if(ve&&window.clearTimeout(ve),!ee.trim()){I.delete(de),W(),V(D,Q,"");return}let He=window.setTimeout(()=>{I.delete(de),ht(D,Q,ee,R)},250);I.set(de,He)}),x.addEventListener("keydown",M=>{let R=M.target.closest("[data-schema-search]");if(!R)return;let D=G();if(D){if(M.key==="Escape"){W();return}if(M.key==="ArrowDown"||M.key==="ArrowUp"){if(!E||E.hidden)return;M.preventDefault();let Q=M.key==="ArrowDown"?1:-1;Fe(q<0?Q>0?0:v.length-1:q+Q);return}if(M.key==="Enter"){if(M.preventDefault(),E&&!E.hidden&&q>=0){Ye(q);return}V(D,R.dataset.schemaSearch||"",R.value)}}}),E?.addEventListener("mousedown",M=>{M.preventDefault()}),E?.addEventListener("click",M=>{let R=M.target.closest("[data-schema-suggest-index]");R&&Ye(Number(R.dataset.schemaSuggestIndex))});let At=M=>{M.target.closest("[data-schema-search]")||E?.contains(M.target)||W()};return document.addEventListener("click",At),window.addEventListener("scroll",W,{capture:!0,passive:!0}),window.addEventListener("resize",W),x.addEventListener("keydown",M=>{M.target.matches(".law-jump-input")&&M.key==="Enter"&&(M.preventDefault(),ue(M.target.id))}),x.addEventListener("click",async M=>{let R=M.target.closest("[data-action]");if(!R)return;let D=R.dataset.action,Q=B(o),ee=Q?ce(Q):null,de=ee?.result;if(D==="back-to-results"){et();return}if(D==="open-law"){re({lawKey:R.dataset.lawKey||"",sourceType:R.dataset.lawSource||"",lawName:R.dataset.lawName||""});return}if(D==="open-judgment"){qe({jid:R.dataset.jid||""});return}if(D==="jump-article"){ue(R.dataset.jumpInput||"law-article-jump");return}if(D==="sort-column"){let ve=R.dataset.sortKey||"";if(!ve||!Q)return;if(f==="schema"&&b?.result){let Be=b.sort,Xe=ve==="jdate"||ve==="law_modified_date"||ve==="article_count"||ve==="citation_count"||ve==="full_text_length"||ve==="created_at"||ve==="updated_at",ct=Be?.key===ve?Be.direction==="asc"?"desc":"asc":Xe?"desc":"asc";C(Q,b.tableId,{sort:{key:ve,direction:ct},columnFilters:b.columnFilters||{},quiet:!0});return}if(!ee)return;let He=ee.sort,ze=He?.key===ve?He.direction==="asc"?"desc":"asc":ve==="jdate"?"desc":"asc";ee.sort={key:ve,direction:ze},Ke(1,{quiet:!0});return}if(D==="retry"){Ke(ee?.page||1);return}if(de){if(D==="prev-page"){Ke(Math.max(1,Number(de.page)-1),{quiet:!0});return}if(D==="next-page"){let ve=Math.max(1,Math.ceil(Number(de.total)/Number(de.page_size)));Ke(Math.min(ve,Number(de.page)+1),{quiet:!0});return}if(D==="copy-query"){let ve=await js(de.query_text||"");T(ve?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",ve?"ok":"warn");return}if(D==="export-json"){let ve=`${de.database}-${de.table||"query"}-page-${de.page}.json`;Qt(ve,JSON.stringify(jn(de),null,2),"application/json;charset=utf-8"),T(`\u5DF2\u532F\u51FA ${ve}`,"ok");return}if(D==="export-csv"){let ve=`${de.database}-${de.table||"query"}-page-${de.page}.csv`;Qt(ve,Ln(de),"text/csv;charset=utf-8"),T(`\u5DF2\u532F\u51FA ${ve}`,"ok")}}}),x.addEventListener("change",M=>{let R=M.target.closest("[data-action='select-law-version']");if(R&&L){re({lawKey:L.lawKey,sourceType:L.sourceType,lawName:L.lawName,versionId:R.value});return}if(!M.target.matches("[data-page-size]"))return;let D=B(o);if(!D)return;let Q=ce(D);Q.pageSize=Number(M.target.value)||25,Q.page=1,Le("data.page_size",Q.pageSize),Ke(1,{quiet:!0})}),te.addEventListener("click",()=>{zt()}),await zt(),t&&typeof t.setTitle=="function"&&t.setTitle(Ot),()=>{s=!0,$&&window.clearTimeout($);for(let M of I.values())window.clearTimeout(M);I.clear(),W(),document.removeEventListener("click",At),window.removeEventListener("scroll",W,{capture:!0}),window.removeEventListener("resize",W)}}var al=[10,25,50,100],Cu=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function Wr(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function Pu(e,t=e){return`<option value="${r(e)}">${r(t)}</option>`}function Ra(e,t,s,a,n=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${r(t)}</span>
      <span class="field-tag">${r(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${r(e)}">
      ${Pu("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${r(i)}" ${String(i)===String(a)?"selected":""}>${r(i)}</option>`).join("")}
    </select>
    ${n?`<span class="field-help">${r(n)}</span>`:""}
  </div>`}function Iu(e,t){let s=Cu.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${Ra("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${Ra("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${Ra("model","\u6A21\u578B",e.models||[],t.model)}
    ${Ra("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${Ra("method","\u65B9\u6CD5",e.methods||[],t.method)}
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
    </div>`}function Ko(){let e=document.getElementById("performance-filter-form");if(!e)return Wr();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Yo(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function Xo(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),n=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${n}.${i}`}function Du(e,t){if(!e)return"";let s=new Date(e);return Number.isNaN(s.getTime())?"":new Date(s.getTime()+Math.max(0,Number(t)||0)).toISOString()}var Fu=[{key:"parsing",label:"Parsing",hint:"\u8F38\u5165\u9577\u5EA6\u3001\u89E3\u6790\u6642\u9593",names:["rag.parse_question"],color:"#64748b"},{key:"embedding",label:"Embedding",hint:"Model\u3001Token\u3001Batch\u3001\u8017\u6642",names:["rag.embed_query"],color:"#3984c6"},{key:"qdrant",label:"Qdrant Search",hint:"Collection\u3001Filter\u3001Top K\u3001\u8017\u6642",names:["rag.qdrant_search"],color:"#d97706"},{key:"reranker",label:"Reranker",hint:"Model\u3001\u5019\u9078\u7B46\u6578\u3001\u8017\u6642",names:["rag.rerank"],color:"#8b5cf6"},{key:"context",label:"Context",hint:"Chunk \u6578\u3001Token \u6578\u3001\u8017\u6642",names:["rag.context"],fallbackNames:["rag.fetch_documents","rag.build_citations"],color:"#64748b"},{key:"llm",label:"LLM",hint:"Model\u3001Input/Output Token\u3001TTFT\u3001\u8017\u6642",names:["rag.llm_request"],color:"#16a34a"}],Bu=[{key:"parsing",label:"Parsing",hint:"\u8F38\u5165\u9577\u5EA6\u3001\u89E3\u6790\u6642\u9593",names:["rag.parse_question"],color:"#64748b"},{key:"law_retrieval",label:"\u6CD5\u898F\u6AA2\u7D22\u8207\u7D71\u8A08",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u3001\u5224\u6C7A\u5F15\u7528\u7D71\u8A08",names:["rag.law_retrieval","rag.law_stats"],color:"#0ea5e9"},{key:"law_content",label:"\u6CD5\u689D\u8F09\u5165",hint:"Parquet \u689D\u6587\u8F09\u5165",names:["rag.law_content"],color:"#64748b"}],En={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"};function nl(e){let t=e?.metadata?.rag_response||{},s=String(t.status||e?.metadata?.rag_status||e?.status||"");return s==="operational"||s==="success"?{label:"Completed",tone:"ok"}:s==="retrieval_only"?{label:"Abstain",tone:"warn"}:s==="preview"?{label:"Preview",tone:"info"}:s==="failed"||s==="error"?{label:"Failed",tone:"danger"}:{label:s||"Unknown",tone:"idle"}}function Vr(e){let t=Math.max(0,Number(e?.offset_ms)||0),s=Math.max(0,Number(e?.duration_ms)||0),a=Math.max(t,Number(e?.end_offset_ms)||t+s);return{...e,offset:t,end:a,duration:Math.max(s,a-t)}}function rl(e,t=0){let s=Array.isArray(e?.segments)?[...e.segments].sort((v,w)=>Number(v.offset_ms||0)-Number(w.offset_ms||0)):[],a=Math.max(Number(e?.total_ms)||0,Number(t)||0,...s.map(v=>Vr(v).end),1),n=String(e?.metadata?.rag_response?.answer_source||""),i=n==="structured"&&s.some(v=>v.name==="rag.law_retrieval"),l=(i?Bu:Fu).map(v=>{let w=s.filter($=>v.names.includes($.name));!w.length&&v.fallbackNames&&(w=s.filter($=>v.fallbackNames.includes($.name)));let q=w.map(Vr),k=q.length?Math.min(...q.map($=>$.offset)):null,S=q.length?Math.max(...q.map($=>$.end)):null;return{...v,spans:q,start:k,end:S,duration:k===null?null:S-k}});for(let v of l){if(v.key!=="embedding"&&v.key!=="llm")continue;let w=[];for(let S of v.spans){let $=S.metadata||{},L=Number($.load_duration_ms),z=Number.isFinite(L)&&L>0?L:0,P=Math.max(0,Number(S.duration)||0);w.push({...S,offset:S.offset,end:S.offset+z,duration:z,metadata:{...$,source_stage:v.label,model_load_ms:z,request_duration_ms:P,warm_duration_ms:Math.max(0,P-z),cold_start:z>=100},params:{...S.params||{},source_stage:v.label}})}if(!w.length)continue;let q=w.reduce((S,$)=>S+$.duration,0),k=v.spans.reduce((S,$)=>S+Math.max(0,Number($.duration)||0),0);v.loadInfo={spans:w,total:q,requestTotal:k,ratio:k>0?Math.min(1,Math.max(0,q/k)):0}}let d=[...l],u=Math.max(0,...d.flatMap(v=>v.spans.map(w=>w.end))),f=e?.metadata?.rag_response||{},y=nl(e),b=Math.min(a,u);d.push({key:"response",label:"Response",hint:"\u7E3D\u8017\u6642\u3001\u5F15\u7528\u6578\u3001\u6210\u529F\u6216 Abstain",color:"#0f766e",spans:[{offset:b,end:a,duration:Math.max(0,a-b),status:y.tone==="danger"?"error":"ok",metadata:f,params:{},started_at:e?.started_at,finished_at:e?.finished_at}],start:b,end:a,duration:Math.max(0,a-b),responseMetadata:f});let p=Array.isArray(e?.decisions)?[...e.decisions].sort((v,w)=>Number(v.offset_ms||0)-Number(w.offset_ms||0)):[];for(let v of p){let w=v.stage==="routing"?"parsing":String(v.stage||""),q=d.find(k=>k.key===w)||d[d.length-1];q&&(Array.isArray(q.decisions)||(q.decisions=[]),q.decisions.push(v))}return Ou(d,a),{total:a,stages:d,decisions:p,decisionCount:p.length,response:f,traceStatus:y,requestId:e?.request_id||"",startedAt:e?.started_at,finishedAt:e?.finished_at,client:e?.client||{},models:Array.isArray(e?.summary?.models)?e.summary.models:[],hasLoad:d.some(v=>!!v.loadInfo),answerSource:n,structuredLaw:i}}function Ou(e,t){let s=e.reduce((i,o)=>i+Math.max(0,Number(o.duration)||0),0),a=s>0?t/s:1,n=0;for(let i of e){let o=Math.max(0,Number(i.duration)||0)*a;i.displayStart=n,i.displayDuration=o,i.displayEnd=n+o;let l=i.spans[0]||null,d=[],u=!1;if(l){let y=Math.max(0,Number(l.duration)||0),b=i.loadInfo?Math.max(0,Number(i.loadInfo.total)||0):0;if(i.loadInfo&&b>0&&i.spans.length===1&&y>0){let p=Math.min(l.end,l.offset+b),v=Math.max(0,p-l.offset),w=Math.max(0,l.end-p);if(v>0&&w>0){let q=Du(l.started_at,v),k={...l,offset:l.offset,end:p,duration:v,finished_at:q,metadata:{...l.metadata||{},source_stage:i.label,model_load_ms:v,request_duration_ms:y,warm_duration_ms:Math.max(0,y-v),cold_start:v>=100},params:{...l.params||{},source_stage:i.label}},S={...l,offset:p,end:l.end,duration:w,started_at:q,finished_at:l.finished_at};d.push({kind:"load",label:"Model Load",span:k,duration:v}),d.push({kind:"stage",label:`${i.label} \u63A8\u8AD6`,span:S,duration:w}),u=!0}}u||d.push({kind:"stage",label:i.label,span:l,duration:y})}i.detailSegments=d;let f=[];if(l&&o>0)if(u){let[y,b]=d,p=y.duration+b.duration,v=p>0?o*(y.duration/p):0,w={...i,key:"model_load",label:`Model Load \xB7 ${i.label}`,spans:[y.span],duration:y.duration},q={...i,label:`${i.label} \u63A8\u8AD6`,spans:[b.span],duration:b.duration};f.push({offset:n,duration:v,color:"#0ea5e9",kind:"load",tip:Tn(w,y.span)}),f.push({offset:n+v,duration:Math.max(0,o-v),color:i.color,kind:"stage",tip:Tn(q,b.span,{includeLoad:!1})})}else f.push({offset:n,duration:o,color:i.color,kind:"stage",tip:Tn(i,l)});i.displaySegments=f,n+=o}}function Kr(e,{includeLoad:t=!0}={}){let s=[],a=(f,y)=>{y==null||y===""||s.push([f,String(y)])},n=e.spans[0]||null;if(!n)return a("\u72C0\u614B","\u6B64\u7D00\u9304\u6C92\u6709\u9019\u500B span"),s;let i=n.params||{},o=n.metadata||{},l=il(n),d=Yr(n),u=(f,y)=>{let b=Number(f?.load_duration_ms);if(!Number.isFinite(b))return;let p=Math.max(0,b);a("Model Load",be(p)),a("\u51B7\u555F\u52D5",p>=100?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09");let v=Math.max(0,Number(y)||0);if(v>0){let w=Math.max(0,v-p);a("\u6263\u9664\u8F09\u5165\u5F8C",be(w)),a("\u8F09\u5165\u5360\u6BD4",`${(p/v*100).toFixed(p/v>=.1?0:1)}%`)}};if(e.key==="response")return a("Trace \u72C0\u614B",e.responseMetadata.status||"\u2014"),a("Answer source",e.responseMetadata.answer_source||"\u2014"),a("Abstain",e.responseMetadata.abstain?"\u662F":"\u5426"),a("\u5F15\u7528\u7E3D\u6578",e.responseMetadata.citation_count??"\u2014"),a("\u5224\u6C7A\uFF0F\u6CD5\u898F\u5F15\u7528",`${e.responseMetadata.judgment_citations??"\u2014"} / ${e.responseMetadata.law_citations??"\u2014"}`),a("\u7E3D\u8017\u6642",be(e.duration)),s;if(a("\u958B\u59CB",`${Xo(n.started_at)||"\u2014"} \xB7 +${n.offset.toFixed(1)} ms`),a("\u7D50\u675F",`${Xo(n.finished_at)||"\u2014"} \xB7 +${n.end.toFixed(1)} ms`),a("\u8017\u6642",be(n.duration)),e.key==="parsing")a("\u8F38\u5165\u9577\u5EA6",o.input_length??i.input_length),a("\u6B63\u898F\u5316\u9577\u5EA6",o.normalized_length??i.normalized_length),a("\u79FB\u9664\u7A7A\u767D",o.trimmed_chars);else if(e.key==="embedding")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.active_base_url||o.base_url),a("Input tokens",o.prompt_eval_count),a("Batch",o.batch),a("\u5411\u91CF\u7DAD\u5EA6",o.dimensions),a("Fallback",o.fallback_used?"\u662F":"\u5426"),t&&u(o,n.duration);else if(e.key==="qdrant")a("Collection",o.collection||i.collection),o.filter&&a("Filter",Yo(o.filter)),a("Top K",o.top_k??i.limit),a("Hits",o.hits),a("Unique judgments",o.unique_judgments),a("Top score",o.top_score);else if(e.key==="reranker")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Rerank \u72C0\u614B",o.status),a("Fallback",o.fallback_used?"\u662F":"\u5426"),a("\u5019\u9078\u7B46\u6578",o.candidates),a("\u9078\u7528\u7B46\u6578",o.selected),a("Top score",o.top_score),Array.isArray(o.errors)&&o.errors.length&&a("\u932F\u8AA4",o.errors.join(" \xB7 "));else if(e.key==="context")a("Chunks",o.chunks),a("\u5224\u6C7A chunks",o.judgment_chunks),a("\u6CD5\u898F chunks",o.law_chunks),a("Token \u4F30\u7B97",o.token_estimate),a("Context \u5B57\u5143",o.context_chars),a("\u6587\u4EF6\u6578",o.documents);else if(e.key==="llm")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Input tokens",o.input_tokens),a("Output tokens",o.output_tokens),a("TTFT",o.ttft_ms===null||o.ttft_ms===void 0?"\u2014":be(o.ttft_ms)),a("API \u7E3D\u8017\u6642",o.total_duration_ms===null||o.total_duration_ms===void 0?"\u2014":be(o.total_duration_ms)),t&&u(o,n.duration),a("Strict retry",o.strict?"\u662F":"\u5426");else if(e.key==="model_load"){if(a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("\u4F86\u6E90\u968E\u6BB5",o.source_stage),a("\u51B7\u555F\u52D5",o.cold_start?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09"),a("\u6A21\u578B\u547C\u53EB\u7E3D\u8017\u6642",o.request_duration_ms===null||o.request_duration_ms===void 0?"\u2014":be(o.request_duration_ms)),a("\u8F09\u5165\u8017\u6642",o.model_load_ms===null||o.model_load_ms===void 0?"\u2014":be(o.model_load_ms)),a("\u6263\u9664\u8F09\u5165\u5F8C\u6D41\u7A0B\u6642\u9593",o.warm_duration_ms===null||o.warm_duration_ms===void 0?"\u2014":be(o.warm_duration_ms)),Number(o.request_duration_ms)>0&&Number(o.model_load_ms)>=0){let f=Number(o.model_load_ms)/Number(o.request_duration_ms)*100;a("\u8F09\u5165\u5360\u6BD4",`${f.toFixed(f>=10?0:1)}%`)}o.eval_duration_ms!==null&&o.eval_duration_ms!==void 0&&a("\u63A8\u8AD6\u8017\u6642",be(o.eval_duration_ms))}else if(e.key==="segment"||e.key==="test_stage")if(a("Model",d||o.model||i.model),a("\u72C0\u614B",o.status||n.status),e.key==="test_stage")a("\u9032\u5EA6",o.progress===null||o.progress===void 0?"":`${Number(o.progress)||0}%`),n.error&&a("\u932F\u8AA4",n.error);else{n.error&&a("\u932F\u8AA4",n.error);for(let[f,y]of Object.entries(i).slice(0,10))a(f,Yo(y))}return e.spans.length>1&&(e.key==="model_load"?a("\u5404\u6A21\u578B\u8F09\u5165",e.spans.map(f=>`${f.metadata?.source_stage||"model"} ${Yr(f)} ${be(f.metadata?.model_load_ms||0)}`).join(" \xB7 ")):(a("Span \u6578",e.spans.length),a("Span \u660E\u7D30",e.spans.map((f,y)=>`#${y+1} +${f.offset.toFixed(0)}ms/${be(f.duration)}`).join(" \xB7 ")))),n.module&&a("Module",n.module),n.function&&a("Function",n.function),s}function Hu(e){let t=String(e||"").trim();if(!t)return"";try{return new URL(t.includes("://")?t:`http://${t}`).hostname||t}catch{return t}}function il(e){let t=e?.metadata||{},s=String(t.provider_name||"").trim();if(s)return s;let a=String(t.active_base_url||t.base_url||e?.params?.url||"").trim();return Hu(a)}function zu(e){let t=e?.metadata||{};return String(t.model||e?.params?.model||"").trim()}function Yr(e){let t=il(e),s=zu(e);return s?t?`${t}:${s}`:s:""}function Uu(e){let t=new Set;for(let s of e?.spans||[]){let a=Yr(s);a&&t.add(a)}return[...t]}function Tn(e,t,s={}){let a=Kr({...e,spans:[t]},s);return[String(e.label||""),...a.map(([n,i])=>`${n}: ${i}`)].join(`
`)}function Gu(e,t){let s=e.spans||[],a=Array.isArray(e.decisions)?e.decisions:[],n=Uu(e),i=Array.isArray(e.displaySegments)?e.displaySegments:null,o=7,l=Math.max(1,Math.min(4,s.length)),d=s.length>1,u=i?12:d?Math.max(12,l*o):12,f=i?i.map(k=>{if(Number(k.duration)<=0)return"";let S=Math.max(0,Math.min(100,k.offset/t*100)),$=Math.min(100-S,k.duration/t*100);return`<span class="rag-wf-bar is-sequential${k.kind==="load"?" is-load":""}" style="left:${S.toFixed(3)}%;width:${$.toFixed(4)}%;top:0;height:12px;--bar-color:${k.color}"
            data-rag-wf-tip="${r(k.tip)}"
            aria-label="${r(k.tip)}" role="img"></span>`}).join(""):s.slice(0,4).map((k,S)=>{if(Number(k.duration)<=0)return"";let $=Math.max(0,Math.min(100,k.offset/t*100)),L=Math.max(.35,Math.min(100-$,k.duration/t*100)),z=d?S*o:0,P=d?6:12,Y=Tn(e,k);return`<span class="rag-wf-bar" style="left:${$.toFixed(3)}%;width:${L.toFixed(3)}%;top:${z}px;height:${P}px"
            data-rag-wf-tip="${r(Y)}"
            aria-label="${r(Y)}" role="img"></span>`}).join(""),y=Array.isArray(e.detailSegments)?e.detailSegments:[],b=y.length>1?y.map(k=>{let S=k.kind==="load"?{...e,key:"model_load",label:`Model Load \xB7 ${e.label}`,spans:[k.span],duration:k.duration}:{...e,label:`${e.label} \u63A8\u8AD6`,spans:[k.span],duration:k.duration},$=Kr(S,{includeLoad:k.kind!=="stage"});return`<div class="rag-wf-detail-group">
              <div class="rag-wf-detail-group-head">
                <strong>${r(k.label)}</strong>
                <span>${r(be(k.duration))}</span>
              </div>
              <div class="rag-wf-detail-grid">${$.map(([L,z])=>`<span class="rag-wf-detail"><span>${r(L)}</span><strong>${r(z)}</strong></span>`).join("")}</div>
            </div>`}).join(""):"",p=Kr(e).map(([k,S])=>`<span class="rag-wf-detail"><span>${r(k)}</span><strong>${r(S)}</strong></span>`).join(""),v=y.length>1?`<div class="rag-wf-details is-split">${b}</div>`:`<div class="rag-wf-details">${p}</div>`,w=s.length?s.some(k=>k.status==="error")?"is-error":"":"is-missing",q=s.length?be(e.duration):"\u672A\u8A18\u9304";return`<details class="rag-wf-stage ${w}" style="--stage-color:${e.color}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong>${r(e.label)}</strong><small>${r(e.hint)}</small>${n.length?`<small class="rag-wf-model-line">${r(n.join(" \xB7 "))}</small>`:""}${a.length?`<small class="rag-wf-decision-badge">${c(a.length)} \u6C7A\u7B56</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${q} \xB7 ${s.length?`${s.length} span`:"\u2014"} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:${u}px">${f}</span>
    </summary>
    ${Wu(a)}
    ${v}
  </details>`}function ol(e,t,s=!1){let a=e.response||{},n=e.client||{},i=e.models||[];return`<div class="rag-wf-summary">
      <span>\u7E3D\u8017\u6642 <strong>${r(be(e.total))}</strong></span>
      <span>Server <strong>${r(be(t))}</strong></span>
      ${n.total_ms?`<span>Client <strong>${r(be(n.total_ms))}</strong></span>`:""}
      ${n.render_ms!==void 0?`<span>Render <strong>${r(be(n.render_ms))}</strong></span>`:""}
      <span>\u5F15\u7528 <strong>${r(String(a.citation_count??"\u2014"))}</strong></span>
      <span>Abstain <strong>${a.abstain?"\u662F":"\u5426"}</strong></span>
      ${e.decisionCount?`<span>\u6C7A\u7B56 <strong>${c(e.decisionCount)}</strong></span>`:""}
      ${i.length?`<span>Model <strong>${r(i.join(" \xB7 "))}</strong></span>`:""}
      ${s?'<span class="rag-wf-updating">\u66F4\u65B0\u4E2D\u2026</span>':""}
    </div>`}function Nn(e,t,s="\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\uFF0C\u67E5\u770B\u53C3\u6578\u3001Token\u3001TTFT\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u4F86\u6E90\u6578\u91CF\u3002Waterfall \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u5E73\u884C\u57F7\u884C\u7684 span \u6703\u4F9D\u5BE6\u969B\u6642\u9593\u91CD\u758A\u986F\u793A\u3002",{legend:a=""}={}){return`<div class="rag-wf-axis"><span>0 ms</span><span>${r(be(t))}</span></div>
    ${a}
    <div class="rag-wf-stages">${(e||[]).map(n=>Gu(n,t)).join("")}</div>
    <p class="rag-wf-hint">${r(s)}</p>`}function Qu(e){let t=Array.isArray(e?.selected)?e.selected:e?.selected?[e.selected]:[],s=(Array.isArray(e?.options)?e.options:[]).filter(a=>t.includes(a.id)).map(a=>a.label||a.id);return s.length?s.join("\u3001"):t.length?t.join("\u3001"):"\u2014"}function ll(e){if(e==null||e==="")return"\u2014";if(Array.isArray(e))return e.length?e.map(t=>ll(t)).join("\u3001"):"\u2014";if(typeof e=="object")try{return JSON.stringify(e)}catch{return"\u2014"}return String(e)}function Ju(e){let t=Object.entries(e||{}).filter(([,s])=>s!=null&&s!=="").slice(0,10);return t.length?`<div class="rag-wf-decision-result">
    ${t.map(([s,a])=>`<span class="rag-wf-decision-result-item"><span>${r(s)}</span><strong>${r(ll(a))}</strong></span>`).join("")}
  </div>`:""}function Wu(e){return!Array.isArray(e)||!e.length?"":`<div class="rag-wf-decisions">
    <div class="rag-wf-decisions-head">
      <span>\u6C7A\u7B56\u8A18\u9304</span>
      <span class="badge badge-neutral badge-mono">${c(e.length)}</span>
    </div>
    ${e.map((t,s)=>{let a=Qu(t),n=(Array.isArray(t.options)?t.options:[]).map(i=>{let o=!!i.selected,l=i.evaluated!==!1;return`<div class="rag-wf-decision-option ${o?"is-selected":l?"is-considered":"is-skipped"}">
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
              <span>\u8017\u6642</span><strong>${r(be(t.duration_ms||0))}</strong>
            </div>
            ${n||'<div class="rag-wf-decision-empty">\u6C92\u6709\u8A18\u9304\u9078\u9805\u3002</div>'}
            ${Ju(t.result)}
            ${t.opaque?'<p class="rag-wf-decision-note">LLM \u5167\u90E8\u63A8\u7406\u4E0D\u53EF\u898B\uFF1B\u53EA\u8A18\u9304\u8F38\u5165\u6458\u8981\u3001\u8F38\u51FA\u8207\u8017\u6642\u3002</p>':""}
          </div>
        </details>`}).join("")}
  </div>`}function cl(e){let t=(e.stages||[]).some(i=>i.loadInfo),s=t?'<div class="rag-wf-legend"><span><i class="is-load"></i>Model Load\uFF08\u968E\u6BB5 bar \u524D\u6BB5\uFF09</span></div>':"",a=e.decisionCount?" \u6BCF\u500B\u968E\u6BB5\u53EF\u5C55\u958B\u6C7A\u7B56\u8A18\u9304\uFF1B\u672A\u8A55\u4F30\u7684\u9078\u9805\u6703\u6A19\u793A\u300C\u672A\u8A55\u4F30\u300D\uFF0C\u4E0D\u6703\u4E8B\u5F8C\u88DC\u7406\u7531\u3002":"",n=(e.structuredLaw?"\u6B64\u984C\u4F7F\u7528\u7D50\u69CB\u5316\u6CD5\u898F\u67E5\u8A62\uFF1A\u5BE6\u969B\u57F7\u884C Parsing\u3001\u6CD5\u898F\u6AA2\u7D22\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u3001\u6CD5\u689D\u8F09\u5165\u8207 Response\uFF1BEmbedding\uFF0FQdrant\uFF0FReranker\uFF0FContext\uFF0FLLM \u672A\u57F7\u884C\uFF0C\u56E0\u6B64\u4E0D\u5217\u5165\u6B64 waterfall\u3002":t?"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\uFF1BEmbedding\uFF0FLLM \u7684\u85CD\u8272\u524D\u6BB5\u70BA Model Load\uFF0C\u5F8C\u6BB5\u70BA\u63A8\u8AD6\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001Token \u8207\u8F09\u5165\u5360\u6BD4\u53EF\u5C55\u958B\u67E5\u770B\u3002":"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207 Token \u53EF\u5C55\u958B\u67E5\u770B\u3002")+a;return Nn(e.stages,e.total,n,{legend:s})}function ua(e,{serverDurationMs:t=0,loading:s=!1,embedded:a=!1}={}){if(!e||typeof e!="object")return"";let n=rl(e,t),i=n.traceStatus;return`<section class="report-card rag-wf-card${a?" rag-wf-embedded":""}">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${En[i.tone]||En.idle}">${r(i.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(n.requestId||"\u2014")}</span>
          \xB7 ${r($e(n.startedAt))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <a class="btn btn-secondary btn-sm" href="#/performance">
          ${m("activity",14)}<span>\u5B8C\u6574 Flow</span>
        </a>
      </div>
    </div>
    ${ol(n,t,s)}
    ${cl(n)}
  </section>`}var Ft=null;function Vu(){return Ft||(Ft=document.createElement("div"),Ft.className="rag-wf-tooltip",Ft.hidden=!0,document.body.appendChild(Ft),Ft)}function Xr(){Ft&&(Ft.hidden=!0)}function dl(e){if(!Ft||Ft.hidden)return;let t=14,s=10,a=Ft.getBoundingClientRect(),n=e.clientX+t,i=e.clientY+t;n+a.width>window.innerWidth-s&&(n=e.clientX-a.width-t),i+a.height>window.innerHeight-s&&(i=e.clientY-a.height-t),Ft.style.left=`${Math.max(s,n)}px`,Ft.style.top=`${Math.max(s,i)}px`}document.addEventListener("pointerover",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=Vu(),a=t.dataset.ragWfTip||"";a&&(s.textContent=a,s.hidden=!1,dl(e))});document.addEventListener("pointermove",e=>{if(!(!Ft||Ft.hidden)){if(!e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]")){Xr();return}dl(e)}});document.addEventListener("pointerout",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=e.relatedTarget;s instanceof Node&&t.contains(s)||Xr()});window.addEventListener("scroll",Xr,{capture:!0,passive:!0});function Ku(e,t,s,a){if(a&&!e.length)return`<div class="report-card rag-wf-card">
      ${Ge({tone:"danger",title:"RAG Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">${m("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;if(!e.length)return`<div class="report-card rag-wf-card">
      ${xt({iconName:"activity",title:s?"\u8B80\u53D6 RAG Pipeline\u2026":"\u5C1A\u7121 RAG Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684 RAG \u554F\u7B54 Trace\u3002":"\u7522\u751F\u65B0\u7684 RAG \u554F\u7B54\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A Parsing\u3001Embedding\u3001Qdrant\u3001Context\u3001LLM \u8207 Response \u7684 waterfall\u3002"})}
    </div>`;let n=e.find(u=>String(u.id)===String(t))||e[0],i=n.flow&&typeof n.flow=="object"?n.flow:{},o=rl(i,n.duration_ms),l=o.traceStatus,d=e.map(u=>{let f=nl(u.flow||{});return`<option value="${r(String(u.id))}" ${String(u.id)===String(n.id)?"selected":""}>#${r(String(u.id))} \xB7 ${r($e(u.started_at))} \xB7 ${r(be(u.duration_ms))} \xB7 ${r(f.label)}</option>`}).join("");return`<section class="report-card rag-wf-card">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${En[l.tone]||En.idle}">${r(l.label)}</span>
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
          ${m("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    ${ol(o,n.duration_ms,s)}
    ${cl(o)}
  </section>`}function Yu(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},n=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?be(a.avg_total_ms??0):"\u2014",o=a.samples?be(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
                    <span class="perf-model-count">${c(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${be(l.avg_ms)}`:""}</span>
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
                    <span class="perf-seg-ms">${be(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function Tt(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),n=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(n).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:n?`${n}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function ul(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function Xu(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let n=Number(a.points_per_second)||0,i=Math.max(2,n/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${r(ul(a))}</strong>
          <span>${r($e(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${r(`${c(a.indexed_count)} \u7B46 \xB7 ${Tt(a.duration_ms)} \xB7 ${c(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${n.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${c(a.indexed_count)} \u7B46 \xB7 ${Tt(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function Zu(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${r(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${r(`${s.label} ${Tt(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${r(s.key)}"></i>
            <span>${r(s.label)}</span>
            <strong>${Tt(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 llama-server Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function ep(e,t){let s=(Array.isArray(e)?e:[]).map(k=>({elapsed:Math.max(0,Number(k.elapsed_s)||0),indexed:Math.max(0,Number(k.indexed)||0)})).filter(k=>k.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(k=>k.elapsed),(Number(t)||0)/1e3,1),n=Math.max(...s.map(k=>k.indexed),1),i=760,o=150,l=12,d=12,u=i-l*2,f=o-d*2,y=s.map(k=>[l+k.elapsed/a*u,o-d-k.indexed/n*f]),b=y.map(([k,S],$)=>`${$===0?"M":"L"}${k.toFixed(1)},${S.toFixed(1)}`).join(" "),p=`${b} L${y[y.length-1][0].toFixed(1)},${o-d} L${y[0][0].toFixed(1)},${o-d} Z`,v=Math.max(1,Math.ceil(y.length/14)),w=y.map(([k,S],$)=>$%v===0||$===y.length-1?`<circle cx="${k.toFixed(1)}" cy="${S.toFixed(1)}" r="2.6" />`:"").join(""),q=[0,1,2,3].map(k=>{let S=d+f/3*k;return`<line x1="${l}" y1="${S.toFixed(1)}" x2="${i-l}" y2="${S.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${c(n)} \u7B46 \xB7 ${Tt(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${q}
      <path d="${p}" class="index-progress-area"></path>
      <path d="${b}" class="index-progress-line"></path>
      ${w}
      <line x1="${l}" y1="${o-d}" x2="${i-l}" y2="${o-d}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${d}" x2="${l}" y2="${o-d}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${Tt(a*500)}</span>
      <span>${Tt(a*1e3)}</span>
    </div>
  </div>`}function tp(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},n=t.coverage||{},i=n.total_judgments>0?`${c(n.indexed_judgments)} / ${c(n.total_judgments)}\uFF08${(100*n.indexed_judgments/n.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:c(t.indexed_count),note:`${c(t.batch_count)} \u6279 \xD7 ${c(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:Tt(t.duration_ms),note:`${c(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:Tt(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${Tt(t.batch_min_ms)} \xB7 \u6700\u6162 ${Tt(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${c(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${r(ul(t))}</span>
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
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${Tt(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${Xu(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${Tt(t.duration_ms)}</span>
        </div>
        ${Zu(t)}
      </div>
    </div>
    ${ep(t.progress,t.duration_ms)}
  </section>`}var Zo=["#22d3ee","#a78bfa","#f59e0b","#ec4899","#3b82f6","#10b981","#f97316","#8b5cf6","#64748b"];function el(e){let t=String(e?.host||e?.url||"").trim(),s=e?.port?`:${e.port}`:"";return`${t||"\u2014"}${s}`}function sp(e,t,s,a){if(a&&!e)return`<div class="report-card rag-wf-card">
      ${Ge({tone:"danger",title:"\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${m("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=Array.isArray(e?.runs)?e.runs:[];if(!n.length)return`<div class="report-card rag-wf-card">
      ${xt({iconName:"layers",title:s?"\u8B80\u53D6\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline\u2026":"\u5C1A\u7121\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684\u7248\u672C\u5316\u7D22\u5F15\u7D00\u9304\u3002":"\u57F7\u884C\u300CQdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A host/model\u3001Blue-Green collection \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002"})}
    </div>`;let i=n.find(S=>String(S.id)===String(t))||e?.latest||n[n.length-1],o=i?.pipeline&&typeof i.pipeline=="object"?i.pipeline:null,d=[...n].reverse().map(S=>{let $=Number(S.pipeline?.version_id||S.version_id||0),L=$?`v${String($).padStart(3,"0")}`:"\u7D22\u5F15";return`<option value="${r(String(S.id))}" ${String(S.id)===String(i.id)?"selected":""}>${r(`${$e(S.started_at)} \xB7 ${L} \xB7 ${Tt(S.duration_ms)}`)}</option>`}).join(""),u=Number(o?.version_id||i.version_id||0),f=u?`v${String(u).padStart(3,"0")}`:"\u2014",y=o?.host||{},b=el(y),p=o?.model||i.model||"\u2014",v=Number(o?.total_ms)||Number(i.duration_ms)||0,w=Array.isArray(o?.stages)?o.stages:[],q=w.map((S,$)=>({...S,ms:Math.max(0,Number(S.duration_ms)||0),color:Zo[$%Zo.length]})).filter(S=>S.ms>0).map(S=>`<span class="index-pipeline-seg" style="width:${(S.ms/Math.max(1,v)*100).toFixed(2)}%;background:${r(S.color)}" title="${r(`${S.label} ${Tt(S.ms)}`)}"></span>`).join(""),k=w.map((S,$)=>{let L=Math.max(0,Number(S.duration_ms)||0),z=v>0?L/v*100:0,P=S.host&&typeof S.host=="object"?S.host:null;return`<div class="index-pipeline-row">
        <span class="index-pipeline-step">${String($+1).padStart(2,"0")}</span>
        <div class="index-pipeline-copy">
          <div class="index-pipeline-title">
            <strong>${r(S.label||S.key||"\u968E\u6BB5")}</strong>
            ${Pe(S.status||"success")}
          </div>
          <span class="index-pipeline-detail">${r(S.detail||"\u2014")}</span>
          ${P?`<span class="index-pipeline-host">${m("server",12)} ${r(el(P))} \xB7 ${r(S.model||p)}</span>`:""}
        </div>
        <div class="index-pipeline-time">
          <strong>${Tt(L)}</strong>
          <span>${z.toFixed(1)}%</span>
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
            <span><strong>\u7248\u672C</strong> ${r(f)}</span>
            <span><strong>collection</strong> ${r(String(o.collection||"\u2014"))}</span>
            <span><strong>\u6A21\u5F0F</strong> ${r(String(o.build_mode||"\u2014"))}</span>
            <span><strong>\u672C\u6B21</strong> ${o.resumed?`\u63A5\u7E8C\uFF08\u5DF2\u7D22\u5F15 ${c(o.resumed_indexed)} \u7B46\uFF09`:"\u65B0\u5EFA\u7248\u672C"}</span>
            <span><strong>Host</strong> ${r(b)}</span>
            <span><strong>Model</strong> ${r(String(p))}</span>
            <span><strong>\u7E3D\u8017\u6642</strong> ${Tt(v)}</span>
          </div>
          <div class="index-pipeline-bar">${q}</div>
          <div class="index-pipeline-list">${k}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B Pipeline \u968E\u6BB5\u8CC7\u6599\uFF1B\u4E0B\u4E00\u6B21 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u6703\u8A18\u9304 host/model \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002</div>'}
  </section>`}function ap(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${al.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${m("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${m("chevronRight",13)}</button>
    </div>
  </div>`}function np(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"#65a30d":t.includes("judgment.rag")?"#8b5cf6":t.includes("judgment.web.app")?"#3b82f6":t.includes("judgment.web.query")?"#d97706":t.includes("judgment.judgment_index")?"#0d9488":"#64748b"}function rp(e){let t=Vr(e),s=Math.max(0,Math.min(8,Number(e.depth)||0));return{key:"segment",label:`${"\u203A ".repeat(s)}${e.name||"unnamed"}`,hint:[e.module||"\u2014",e.function||"\u2014"].join(" \xB7 "),color:np(e),spans:[{...t,status:e.status||"ok",error:e.error,metadata:e.metadata||{},params:e.params||{},started_at:e.started_at,finished_at:e.finished_at}],start:t.offset,end:t.end,duration:t.duration}}function pl(e){return(e||[]).map(rp)}function ip(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((b,p)=>Number(b.seq)-Number(p.seq)):[],n=s?.summary||{},i=Array.isArray(n.models)?n.models:[],o=s?.client||{},l=s?.metadata||{},d=l.question||"",u=l.answer||"",f=d||u?`<div class="perf-flow-qa">
          ${d?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${r(d)}</span></div>`:""}
          ${u?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${r(u)}</span></div>`:""}
        </div>`:"",y=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(b=>(Number(b.offset_ms)||0)+(Number(b.duration_ms)||0)),1);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${r(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${r(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${r(e.method||"")} ${r(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${$e(e.started_at)}</span>
      <span class="perf-record-duration">${be(e.duration_ms)}</span>
      ${Pe(e.status)}
      <span class="perf-record-chevron">${m("chevronRight",14)}</span>
    </summary>
    <div class="perf-record-body">
      <div class="perf-flow-meta">
        <span><strong>Request</strong> <span class="mono">${r(e.request_id||s?.request_id||"\u2014")}</span></span>
        <span><strong>Server</strong> ${be(e.duration_ms)}</span>
        ${o.total_ms?`<span><strong>Client \u5168\u6D41\u7A0B</strong> ${be(o.total_ms)}</span>`:""}
        ${o.render_ms!==void 0?`<span><strong>Render</strong> ${be(o.render_ms)}</span>`:""}
        <span><strong>Flow</strong> ${a.length} \u6BB5</span>
        ${a.length?"<span><strong>Waterfall</strong> \u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\u3001\u53EF\u9EDE\u9078\u5C55\u958B\u53C3\u6578</span>":""}
      </div>
      ${f}
      ${i.length?`<div class="chips perf-record-models">${i.map(b=>`<span class="chip">${r(b)}</span>`).join("")}</div>`:""}
      ${a.length?Nn(pl(a),y,"\u6B64 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002"):`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${r(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${r(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var tl={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",rerank:"Reranker",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"};function op(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}var lp={embedding:"#3984c6",retrieval:"#d97706",rerank:"#8b5cf6",context:"#64748b",llm:"#16a34a",validation:"#8b5cf6"};function cp(e,t){let s=Date.parse(e.started_at||""),a=Date.now(),n=Array.isArray(e.stage_order)?[...e.stage_order]:Object.keys(tl);for(let u of t)u.stage&&!n.includes(u.stage)&&n.push(u.stage);let i=[],o=0;for(let u of n){let f=t.filter(p=>p.stage===u);if(!f.length)continue;let y=f.map(p=>{let v=Date.parse(p.started_at||""),w=Number.isFinite(s)&&Number.isFinite(v)?Math.max(0,v-s):0,q=Math.max(0,Number(p.duration_ms)||0);p.status==="running"&&Number.isFinite(v)&&(q=Math.max(q,a-v));let k=w+q;return o=Math.max(o,k),{offset:w,end:k,duration:q,status:p.status==="failed"?"error":p.status==="running"?"running":"ok",started_at:p.started_at,finished_at:p.finished_at,error:p.error_message,metadata:{...p.details||{},model:p.model,status:p.status,progress:Number(p.progress)||0,module:p.module,function:p.function},params:{model:p.model}}}),b=y.reduce((p,v)=>p+v.duration,0);i.push({key:"test_stage",label:tl[u]||u,hint:`${y.length} \u500B\u7A0B\u5E8F`,color:lp[u]||"#64748b",spans:y,start:y.length?Math.min(...y.map(p=>p.offset)):null,end:y.length?Math.max(...y.map(p=>p.end)):null,duration:b})}let l=e.status==="running"&&Number.isFinite(s)?Math.max(0,a-s):0,d=Math.max(Number(e.total_ms)||0,l,o,1);return{stages:i,total:d}}function pa(e,t,s,a={}){let n=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(k=>`<option value="${r(k.run_id)}" ${k.run_id===s?"selected":""}>${r(op(k.status))} \xB7 ${r((k.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${r($e(k.started_at))}</option>`)].join(""),o=n?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${m("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${m("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?Pe(e.status):""}</div>
      <div class="test-flow-question">${e?r(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${xt({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let d=Array.isArray(e.steps)?e.steps:[],u=cp(e,d),f=e.models||{},y=e.status==="running"?`${be(u.total)}\uFF08\u4F30\u7B97\uFF09`:be(e.total_ms),b=d.find(k=>k.stage==="llm"&&k.model===e.summary?.primary_model)||d.find(k=>k.stage==="llm"&&k.details?.answer_preview),p=String(b?.details?.provider_name||"").trim(),v=p&&e.summary?.primary_model?`${p}:${e.summary.primary_model}`:e.summary?.primary_model||"",w=e.answer||b?.details?.answer_preview||"",q=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${v?`<span class="mono">${r(v)}</span>`:""}
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
    ${q}
    ${u.stages.length?Nn(u.stages,u.total,"\u6E2C\u8A66 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B\u7A0B\u5E8F\u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u6A21\u578B\u3001\u72C0\u614B\u3001\u9032\u5EA6\u3001module\uFF0Ffunction \u8207\u932F\u8AA4\u3002"):'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":n?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${v?`<span class="mono">primary=${r(v)}</span>`:""}
    </div>
  </div>`}function sl(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},n=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${Pe(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${c(e.total)} \u7B46\u7B26\u5408 \xB7 ${be(e.duration_ms)} \xB7
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
    ${tp(n)}
    ${Yu(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>ip(i,o)).join(""):xt({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${ap(e)}
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
  </div>`}async function dp(e,t){let s=rs(),a=!1,n=Wr(),i={processes:[],modules:[],statuses:[],methods:[],models:[]},o=1,l=25,d=null,u=[],f="",y=!1,b=null,p=!1,v=null,w="",q=!1,k=null,S=!1;e.innerHTML=`<section class="page data-page performance-page">
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
              <div id="performance-report">${Na({label:"\u6548\u80FD\u5831\u8868"})}</div>
            </section>
          </div>
        </div>
        <div id="performance-panel-pipeline" hidden></div>
        <div id="performance-panel-index-pipeline" hidden></div>
        <div id="performance-panel-benchmark" hidden></div>
      </section>
    </div>
  </section>`;let $=e.querySelector("#performance-filter-fields"),L=e.querySelector("#performance-filter-form"),z=e.querySelector("#performance-test-flow"),P=e.querySelector("#performance-report"),Y=e.querySelector("#performance-panel-pipeline"),me=e.querySelector("#performance-panel-index-pipeline"),X=e.querySelector("#performance-meta"),j=e.querySelector("#performance-refresh"),x=[...e.querySelectorAll("[data-performance-tab]")],E={overview:e.querySelector("#performance-panel-overview"),pipeline:e.querySelector("#performance-panel-pipeline"),"index-pipeline":e.querySelector("#performance-panel-index-pipeline"),benchmark:e.querySelector("#performance-panel-benchmark")},H="overview",te=I=>{H=I;for(let W of x){let K=W.dataset.performanceTab===I;W.classList.toggle("is-active",K),K?W.setAttribute("aria-current","page"):W.removeAttribute("aria-current")}for(let[W,K]of Object.entries(E))K&&(K.hidden=W!==I);I==="benchmark"?X.textContent="BENCHMARK \xB7 RAG":I==="pipeline"?X.textContent="PERFORMANCE \xB7 RAG WATERFALL":I==="index-pipeline"?X.textContent="PERFORMANCE \xB7 INDEX PIPELINE":d&&(X.textContent=`PERFORMANCE \xB7 ${c(d.total)} \u7B46`)},U=Po(e,{onNavigate:I=>te(I)});s&&(z.innerHTML=zs("\u7CFB\u7D71\u6E2C\u8A66\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u6548\u80FD\u5831\u8868\u3001RAG Pipeline \u8207\u7D22\u5F15 Pipeline\uFF1B\u6E2C\u8A66\u6D41\u7A0B\u8207 Benchmark \u57F7\u884C\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002"));let ie=()=>{Y&&(Y.innerHTML=Ku(u,f,y,b))},Te=async({force:I=!1}={})=>{if(!(a||y)){if(p&&!I){ie();return}y=!0,u.length||ie();try{let W=await O.performance({keyword:"/api/rag"},1,50);if(a)return;let K=(Array.isArray(W.rows)?W.rows:[]).filter(ke=>ke.flow&&(String(ke.path||"").includes("/api/rag")||String(ke.process||"").includes("RAG")));u=K,(!f||!K.some(ke=>String(ke.id)===String(f)))&&(f=K[0]?String(K[0].id):""),b=null,p=!0}catch(W){if(a)return;b=W}finally{a||(y=!1,ie())}}},B=()=>{me&&(me.innerHTML=sp(v,w,q,k))},we=async({force:I=!1}={})=>{if(!(a||q)){if(S&&!I){B();return}q=!0,v||B();try{let W=await O.performance({},1,1);if(a)return;v=W.index_pipeline||W.index_stats||null;let K=Array.isArray(v?.runs)?v.runs:[];(!w||!K.some(ke=>String(ke.id)===String(w)))&&(w=v?.latest?String(v.latest.id):""),k=null,S=!0}catch(W){if(a)return;k=W}finally{a||(q=!1,B())}}},ce=I=>{if(te(I),I==="benchmark"){if(s){let W=E.benchmark;W&&(W.innerHTML=zs("RAG Benchmark \u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u6548\u80FD\u5831\u8868\u8207 Pipeline\uFF1BBenchmark \u984C\u5EAB\u3001\u6A21\u578B\u8A2D\u5B9A\u3001\u57F7\u884C\u8207\u8A55\u5206\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002"));return}U.show()}I==="pipeline"&&Te(),I==="index-pipeline"&&we()};e.addEventListener("click",I=>{let W=I.target.closest("[data-performance-tab]");W&&ce(W.dataset.performanceTab||"overview")}),Y?.addEventListener("change",I=>{I.target.matches("[data-rag-trace-select]")&&(f=String(I.target.value||""),ie())}),Y?.addEventListener("click",I=>{I.target.closest('[data-action="refresh-rag-waterfall"]')&&Te({force:!0})}),me?.addEventListener("change",I=>{I.target.matches("[data-index-pipeline-select]")&&(w=String(I.target.value||""),B())}),me?.addEventListener("click",I=>{I.target.closest('[data-action="refresh-index-pipeline"]')&&we({force:!0})});let Le=null,Oe=[],Ne="",et=null,ue="",re=()=>{$.innerHTML=Iu(i,n)},qe=()=>{let I=JSON.stringify({selected:Ne,tick:Le?.status==="running"?Math.floor(Date.now()/1e3):0,runs:Oe.map(W=>`${W.run_id}:${W.status}`),run:Le?{run_id:Le.run_id,status:Le.status,progress:Le.progress,total_ms:Le.total_ms,steps:(Le.steps||[]).map(W=>`${W.stage}:${W.model}:${W.status}:${W.progress}:${W.duration_ms}`)}:null});I!==ue&&(ue=I,z.innerHTML=pa(Le,Oe,Ne))},ye=async()=>{if(!s)try{let I=await O.testRuns(30);if(a)return;Oe=Array.isArray(I.runs)?I.runs:[]}catch{if(a)return;Oe=[]}},_e=async(I=null)=>{if(!s)try{let W=I&&!Ne?I:Ne?await O.testRun(Ne):await O.testRunCurrent();if(a)return;Le=W.run||null,!Ne&&Le&&Le.status!=="running"&&!Oe.some(K=>K.run_id===Le.run_id)&&await ye(),qe()}catch{if(a)return;Le=null,qe()}},Ee=async(I=null)=>{a||Ne||await _e(I)},C=()=>{s||a||et||(et=Ct("test-runs",(I,W)=>Ee(W?.snapshot||null)))};z.addEventListener("change",async I=>{I.target.id==="test-run-select"&&(Ne=String(I.target.value||""),await _e())}),z.addEventListener("click",async I=>{I.target.closest("#test-flow-refresh")&&(Ne="",await ye(),await _e())});let G=async(I=o,{quiet:W=!1}={})=>{o=Math.max(1,Number(I)||1),n=Ko();let K=`judgment.performance.result.v1:${JSON.stringify({filters:n,page:o,pageSize:l})}`,ke=ys(K,120*1e3);ke&&o===1&&(d=ke,P.innerHTML=sl(ke),X.textContent=`PERFORMANCE \xB7 ${c(ke.total)} \u7B46`);let Fe=P.querySelector(".report-card"),Ye=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!Fe?P.setAttribute("aria-busy","true"):(P.removeAttribute("aria-busy"),P.innerHTML=Na({label:"\u6548\u80FD\u5831\u8868"}));let lt=e.querySelector("#performance-run");W||he(lt,!0,"\u67E5\u8A62\u4E2D\u2026");try{let tt=await O.performance(n,o,l);if(a)return;if(d=tt,gs(K,tt),tt.index_pipeline){v=tt.index_pipeline;let rt=Array.isArray(v.runs)?v.runs:[];(!w||!rt.some(ae=>String(ae.id)===String(w)))&&(w=v.latest?String(v.latest.id):""),S=!0,k=null}if(o=Number(tt.page)||o,l=Number(tt.page_size)||l,P.removeAttribute("aria-busy"),P.innerHTML=sl(tt),Ye!==null){let rt=P.querySelector("[data-page-size]");rt&&(rt.value=String(l),rt.focus({preventScroll:!0}))}X.textContent=`PERFORMANCE \xB7 ${c(tt.total)} \u7B46`,X.className="badge badge-neutral badge-mono"}catch(tt){if(a)return;P.removeAttribute("aria-busy"),P.innerHTML=Mn(tt,{label:"\u6548\u80FD\u5831\u8868"}),T(tt.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{a||he(lt,!1)}},V=async()=>{let I=ys("judgment.performance.options.v1",3e5);if(I){i=I,re(),O.performanceOptions().then(W=>{i=W,gs("judgment.performance.options.v1",W),re()}).catch(()=>{});return}try{i=await O.performanceOptions(),gs("judgment.performance.options.v1",i)}catch{i={processes:[],modules:[],statuses:[],methods:[],models:[]}}re()};return L.addEventListener("submit",I=>{I.preventDefault(),G(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{n=Wr(),o=1,re(),G(1)}),j.addEventListener("click",async()=>{if(H==="pipeline"){he(j,!0,"\u6574\u7406\u4E2D\u2026");try{await Te({force:!0})}finally{a||he(j,!1)}return}if(H==="index-pipeline"){he(j,!0,"\u6574\u7406\u4E2D\u2026");try{await we({force:!0})}finally{a||he(j,!1)}return}if(H==="benchmark"){if(s)return;he(j,!0,"\u6574\u7406\u4E2D\u2026");try{await U.refresh()}finally{a||he(j,!1)}return}n=Ko(),j.disabled=!0,he(j,!0,"\u6574\u7406\u4E2D\u2026"),await V(),await ye(),a||await _e(),a||await G(1),a||(j.disabled=!1,he(j,!1))}),P.addEventListener("click",async I=>{let W=I.target.closest("[data-action]");if(!W||!d)return;let K=W.dataset.action;if(K==="retry"){G(o);return}if(K==="prev-page"){G(Math.max(1,Number(d.page)-1),{quiet:!0});return}if(K==="next-page"){let ke=Math.max(1,Math.ceil(Number(d.total)/Number(d.page_size)));G(Math.min(ke,Number(d.page)+1),{quiet:!0});return}if(K==="copy-query"){let ke=await js(d.query_text||"");T(ke?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",ke?"ok":"warn");return}if(K==="export-json"){let ke=`performance-page-${d.page}.json`;Qt(ke,JSON.stringify(jn(d),null,2),"application/json;charset=utf-8"),T(`\u5DF2\u532F\u51FA ${ke}`,"ok");return}if(K==="export-csv"){let ke=`performance-page-${d.page}.csv`;Qt(ke,Ln(d),"text/csv;charset=utf-8"),T(`\u5DF2\u532F\u51FA ${ke}`,"ok")}}),P.addEventListener("change",I=>{I.target.matches("[data-page-size]")&&(l=Number(I.target.value)||25,al.includes(l)||(l=25),G(1,{quiet:!0}))}),s?(await V(),a||await G(1)):(await Promise.allSettled([V(),ye()]),a||(await _e(),await G(1),C())),t&&typeof t.setTitle=="function"&&t.setTitle(Ot),()=>{a=!0,et&&et(),U.destroy()}}var kl="q",Sl="share",ri="contentId",ii="rag/share",ml="https://judgment.ragdemo.win",up=[["wrong_citation","\u5F15\u7528\u6216\u689D\u865F\u6709\u8AA4"],["incomplete","\u7B54\u6848\u4E0D\u5B8C\u6574"],["wrong_question","\u4E0D\u662F\u6211\u554F\u7684"],["wrong_refusal","\u4E0D\u8A72\u62D2\u7B54\u537B\u62D2\u7B54"],["slow_or_error","\u56DE\u61C9\u592A\u6162\u6216\u51FA\u932F"],["not_helpful","\u5167\u5BB9\u6C92\u6709\u5E6B\u52A9\u6216\u7121\u6CD5\u4F7F\u7528"],["tone_style","\u98A8\u683C\u6216\u8A9E\u6C23"],["safety_legal","\u5B89\u5168\u6216\u6CD5\u5F8B\u7591\u616E"],["other","\u5176\u4ED6"]],pp=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5F9E\u696D\u4EBA\u54E1\u6709\u90A3\u4E9B\u898F\u5B9A\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function mp(){return`<div class="answer-placeholder">
    <span class="empty-icon">${m("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function ei(){return`<section class="card answer-card rag-empty-answer">${mp()}</section>`}function xl(e,t={}){let s=r(e),n=!!(t?.feedback||{}).token,i=String(t?.feedback_sentiment||""),o=n?`<span class="rag-feedback-divider" aria-hidden="true"></span>
      <button class="rag-answer-action rag-feedback-action${i==="satisfied"?" is-selected":""}" type="button" data-rag-answer-action="feedback" data-sentiment="satisfied" data-question="${s}" title="\u56DE\u61C9\u826F\u597D" aria-label="\u56DE\u61C9\u826F\u597D" aria-pressed="${i==="satisfied"}">${m("thumbUp",15)}<span class="sr-only">\u56DE\u61C9\u826F\u597D</span></button>
      <button class="rag-answer-action rag-feedback-action${i==="unsatisfied"?" is-selected":""}" type="button" data-rag-answer-action="feedback" data-sentiment="unsatisfied" data-question="${s}" title="\u56DE\u61C9\u6B20\u4F73" aria-label="\u56DE\u61C9\u6B20\u4F73" aria-pressed="${i==="unsatisfied"}">${m("thumbDown",15)}<span class="sr-only">\u56DE\u61C9\u6B20\u4F73</span></button>`:"";return`<div class="rag-answer-actions" role="group" aria-label="\u56DE\u7B54\u64CD\u4F5C">
    <button class="rag-answer-action" type="button" data-rag-answer-action="copy" data-question="${s}" title="\u8907\u88FD\u56DE\u7B54" aria-label="\u8907\u88FD\u56DE\u7B54">${m("copy",15)}<span class="sr-only">\u8907\u88FD\u56DE\u7B54</span></button>
    <button class="rag-answer-action" type="button" data-rag-answer-action="share" data-question="${s}" title="\u5EFA\u7ACB\u516C\u958B\u9023\u7D50" aria-label="\u5EFA\u7ACB\u516C\u958B\u9023\u7D50">${m("share",15)}<span class="sr-only">\u5EFA\u7ACB\u516C\u958B\u9023\u7D50</span></button>
    <button class="rag-answer-action" type="button" data-rag-answer-action="reask" data-question="${s}" title="\u91CD\u65B0\u751F\u6210\u56DE\u7B54" aria-label="\u91CD\u65B0\u751F\u6210\u56DE\u7B54">${m("refresh",15)}<span class="sr-only">\u91CD\u65B0\u751F\u6210\u56DE\u7B54</span></button>
    ${o}
    ${n?`<span class="rag-feedback-note" data-rag-feedback-note>${i?"\u5DF2\u6536\u5230\u56DE\u994B":"\u9019\u5247\u56DE\u7B54\u6709\u5E6B\u52A9\u55CE\uFF1F"}</span>`:""}
  </div>`}function gl(e,t,{complete:s=!0}={}){let a=r(e);return`<div class="rag-turn${s?" is-complete":" is-pending"}">
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
  </div>`}function gp(e){let t=new URL(window.location.href);return t.search="",t.hash=`#/${ii}?${ri}=${encodeURIComponent(e)}`,t.toString()}function fp(){let e=window.location.hash.replace(/^#\/?/,""),[t,s=""]=e.split("?"),a=t.replace(/\/+$/,"");if(a===ii)return String(new URLSearchParams(s).get(ri)||"").trim();let n=a.match(/^rag\/share\/([^/]+)$/);if(!n)return"";try{return decodeURIComponent(n[1])}catch{return n[1]}}function ti({keepToken:e=!1,token:t=""}={}){try{let s=new URL(window.location.href);s.searchParams.delete(kl),s.searchParams.delete(Sl),s.hash=e&&t?`#/${ii}?${ri}=${encodeURIComponent(t)}`:"#/rag",window.history.replaceState(null,"",`${s.pathname}${s.search}${s.hash}`)}catch{}}function bp(){try{let e=new URL(window.location.href),t=String(e.searchParams.get(Sl)||"").trim(),s=fp()||t,a=String(e.searchParams.get(kl)||"").trim();return!s&&!a?null:{token:s.slice(0,64),question:a.slice(0,500)}}catch{return null}}function si(e){if(!e)return"";let t=Array.from(e.querySelectorAll("[data-rag-answer] .answer-text")).map(a=>String(a.textContent||"").trim()).filter(Boolean);if(t.length)return t.join(`

`);let s=e.querySelector("[data-rag-answer]");return s?String(s.innerText||"").trim():""}function vp(e){let t=e&&typeof e=="object"?e:{};return{status:t.status,answer:t.answer,answer_source:t.answer_source,notice:t.notice,citations:Array.isArray(t.citations)?t.citations:[],judgments:Array.isArray(t.judgments)?t.judgments:[],reference_judgments:Array.isArray(t.reference_judgments)?t.reference_judgments:[],law_sources:Array.isArray(t.law_sources)?t.law_sources:[],matched_terms:Array.isArray(t.matched_terms)?t.matched_terms:[],law_answer:t.law_answer,law_framework:t.law_framework,llm_model:t.llm_model,embedding_model:t.embedding_model,duration_ms:t.duration_ms,show_sources:t.show_sources,retrieval:t.retrieval,rerank_degraded:t.rerank_degraded,degraded_reason:t.degraded_reason,partial:!1,streaming:!1}}async function ai(e,t){let s=(Array.isArray(e)?e:[]).filter(o=>String(o?.question||"").trim()).map(o=>({question:String(o.question||"").trim().slice(0,500),asked_at:String(o.asked_at||""),payload:vp(o.payload)}));if(!s.length){T("\u6C92\u6709\u53EF\u5EFA\u7ACB\u516C\u958B\u9023\u7D50\u7684\u5C0D\u8A71\u3002","warn");return}let a=null;try{a=await O.ragShareCreate({title:String(t||s[0]?.question||"").slice(0,200),turns:s})}catch{a=null}if(!a?.id){T("\u7121\u6CD5\u5EFA\u7ACB\u516C\u958B\u9023\u7D50\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger",6e3);return}let n=gp(a.id);if(!await js(n)){T("\u7121\u6CD5\u8907\u88FD\u516C\u958B\u9023\u7D50\uFF0C\u8ACB\u78BA\u8A8D\u700F\u89BD\u5668\u526A\u8CBC\u7C3F\u6B0A\u9650\u3002","danger",6e3);return}T("\u5DF2\u8907\u88FD\u516C\u958B\u9023\u7D50","ok",7e3,{detail:"\u4EFB\u4F55\u64C1\u6709\u6B64\u9023\u7D50\u7684\u4EBA\u90FD\u53EF\u4EE5\u67E5\u770B\u9019\u6BB5\u5C0D\u8A71\u3002",actionLabel:"\u958B\u555F\u9023\u7D50",onAction:()=>{window.open(n,"_blank","noopener,noreferrer")}})}function hp(e,t){return Promise.race([e,new Promise((s,a)=>{window.setTimeout(()=>a(new Error("pipeline lookup timed out")),t)})])}async function $p(e){if(!e||e.pipeline_flow)return e;let t=String(e._client_request_id||e.request_id||"").trim();if(!t)return e;for(let s=0;s<3;s+=1){try{let a=await hp(O.performance({keyword:t},1,5),1800),n=(Array.isArray(a.rows)?a.rows:[]).find(i=>String(i.request_id||"")===t&&i.flow&&typeof i.flow=="object");if(n)return e.pipeline_flow=n.flow,e}catch{}s<2&&await new Promise(a=>window.setTimeout(a,250))}return e}function fl(e){return{status:e.status,answer:e.answer,answer_source:e.answer_source,notice:e.notice,citations:Array.isArray(e.citations)?e.citations:[],judgments:Array.isArray(e.judgments)?e.judgments:[],law_sources:Array.isArray(e.law_sources)?e.law_sources:[],matched_terms:Array.isArray(e.matched_terms)?e.matched_terms:[],law_answer:e.law_answer,law_framework:e.law_framework,llm_model:e.llm_model,embedding_model:e.embedding_model,duration_ms:e.duration_ms,show_sources:e.show_sources,pipeline_flow:e.pipeline_flow||null,test_run:e.test_run||null,request_id:e.request_id||"",feedback:e.feedback||null,feedback_sentiment:e.feedback_sentiment||"",partial:!1,streaming:!1}}var yp={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"llama-server embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"llama-server LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function wp(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`llama-server run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`llama-server embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:yp[t]||t||"backend step"}function bl(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function vl(e){let t=Number(e);return Number.isFinite(t)?`${c(Math.max(0,Math.round(t)))} ms`:"\u2014"}function ni(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function _p(){return`<div class="rag-process is-open" id="rag-process">
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
  </div>`}function Al(e){let t=e?.pipeline_flow&&typeof e.pipeline_flow=="object"?e.pipeline_flow:null;if(!t)return"";let s=ua(t,{serverDurationMs:Number(e.duration_ms)||0,embedded:!0});if(!s)return"";let a=Array.isArray(t.decisions)?t.decisions.length:0;return`<div class="rag-process is-complete" id="rag-process">
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
  </div>`}function kp(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),n=performance.now(),i=new Map,o=(b,p,v)=>{let w=b.querySelector(p);w&&(w.textContent=v)},l=b=>{if(b.failed){o(b.element,".rag-process-meta","\u5931\u6557");return}if(b.hasChildren){o(b.element,".rag-process-meta","");return}o(b.element,".rag-process-meta",vl(b.durationMs))},d=b=>{let p=b-1,v=[...i.values()].reverse();for(let w of v){if(p<0)break;w.depth<=p&&(w.hasChildren||(w.hasChildren=!0,w.element.dataset.hasChildren="true",w.finished&&l(w)),p=w.depth-1)}},u=b=>{if(!s)return null;let p=String(b?.seq??`step-${i.size+1}`),v=i.get(p);if(!v){let w=Math.max(0,Math.min(6,Number(b?.depth)||0));d(w);let q=document.createElement("div");q.className="rag-process-item is-running",q.dataset.processKey=p,q.style.setProperty("--depth",String(w)),q.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(q),v={element:q,depth:w,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(p,v)}return o(v.element,".rag-process-label",wp(b)),v.element.title=bl(b),v};return{step:b=>{let p=b?.segment;if(!p)return;let v=u(p);if(v){if(b.type==="segment_start"){v.element.classList.add("is-running"),o(v.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(b.type==="segment_end"){let w=p.status==="error";v.element.classList.remove("is-running"),v.element.classList.toggle("is-error",w),v.finished=!0,v.failed=w,v.durationMs=Number(p.duration_ms)||0,l(v),v.element.title=[bl(p),w&&p.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(b=!0,p=null)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(k=>{k.classList.remove("is-running");let S=k.dataset.hasChildren==="true";o(k,".rag-process-meta",S?"":b?"\u5B8C\u6210":"\u4E2D\u65B7")});let v=s?.children.length||i.size,w=vl(Math.max(0,performance.now()-n)),q=b&&p?.pipeline_flow&&typeof p.pipeline_flow=="object"?p.pipeline_flow:null;if(a&&(a.textContent=b?`\u5B8C\u6210 \xB7 ${v} \u6B65 \xB7 ${w}`:`\u5931\u6557 \xB7 ${v} \u6B65`),q){let k=ua(q,{serverDurationMs:Number(p.duration_ms)||0,embedded:!0}),S=t.querySelector("#rag-process-body");k&&S&&(S.innerHTML=k)}return t.classList.add("is-complete"),ni(t,!1),t.outerHTML},collapse:()=>ni(t,!1)}}function hl(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${m("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":_p()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${r(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function $l(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Cn(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let n=String(e||"").trim();return n?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t||n)}"
    data-source-type="${r(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(a||n)}</button>`:""}function ql(e){let t=String(e?.law_name||"").trim(),s=String(e?.article_no||"").replace(/\s+/g,"");if(!t||!s)return"";let a=(Array.isArray(e?.paragraphs)?e.paragraphs:[]).map(i=>String(i||"").trim()).filter(Boolean),n=`${t}${s}${a.join("\u3001")}`;return`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t)}"
    data-source-type=""
    data-article-no="${r(s)}"
    title="\u9EDE\u64CA\u67E5\u770B ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(n)}</button>`}function Ml(e){let t=String(e?.citation_status||"");return t==="cited"?"\u7B54\u6848\u5F15\u7528":t==="provided_not_cited"?"\u5DF2\u63D0\u4F9B\u7D66\u6A21\u578B\uFF0C\u7B54\u6848\u672A\u5F15\u7528":t==="reference_only"||e?.used_for_generation===!1?"\u50C5\u4F9B\u53C3\u8003\uFF08\u672A\u9032\u5165\u751F\u6210 prompt\uFF09":e?.used_for_generation===!0?"\u5DF2\u63D0\u4F9B\u7D66\u6A21\u578B":""}function oi(e,t){let s=Number(e);return Number.isFinite(s)?s:t}function Sp(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(y=>`<span>${r(y)}</span>`).join(""),n=Ml(e),i=n?`<span>${r(n)}</span>`:"",o=(Array.isArray(e.law_citations)?e.law_citations:[]).map(y=>ql(y)).filter(Boolean).slice(0,12).join(""),l=o||(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(y=>Cn(y)).join(""),d=o?'<div class="citation-meta"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':"",u=e.jid?` data-action="open-parquet-judgment"
        data-jid="${r(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${r(e.jid)}"`:"",f=e.pdf_url?`<a class="citation-link" href="${r(Pt(e.pdf_url))}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${m("external",11)}</a>`:"";return`<article class="citation">
    <span class="citation-index">[${oi(e.index,t+1)}]</span>
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
    <div class="citation-links">${f}</div>
  </article>`}function xp(e){let t=[e.court,e.jdate].filter(Boolean).map(n=>`<span>${r(n)}</span>`).join(""),s=[e.vector_score!==null&&e.vector_score!==void 0?`\u5411\u91CF ${Number(e.vector_score).toFixed(4)}`:"",e.rerank_score!==null&&e.rerank_score!==void 0?`rerank ${Number(e.rerank_score).toFixed(4)}`:""].filter(Boolean).map(n=>`<span>${r(n)}</span>`).join("");return`<article class="citation reference-judgment">
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
  </article>`}function Ap(e,t){let s=[e.law_level,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${r(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${r(Pt(e.law_url))}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${m("external",11)}</a>`:"",n=e.law_key||e.law_name||"",i=n?` data-action="open-law-source"
        data-law-key="${r(n)}"
        data-source-type=""
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation">
    <span class="citation-index">${String(oi(e.index,t+1)).padStart(2,"0")}</span>
    <div class="citation-body"${i}>
      <h4 class="citation-name">${r(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${s||"<span>\u6CD5\u898F metadata</span>"}</div>
      ${e.snippet?`<p class="citation-snippet">${r(e.snippet)}</p>`:""}
    </div>
    ${a}
  </article>`}function qp(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",n=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${r(s)}</span>`,a?r(a):"",e.law_category?r(e.law_category):"",e.article_live||e.article_count?`${c(e.article_live||e.article_count)} \u689D\u751F\u6548${e.article_deleted?`\uFF08\u5171 ${c(e.article_total||e.article_count)} \u689D\u865F\uFF0C\u5DF2\u522A\u9664 ${c(e.article_deleted)} \u689D\uFF09`:""}`:"",e.dataset_update_date?`\u8CC7\u6599\u622A\u81F3 ${Kt(e.dataset_update_date)}`:"",e.law_modified_date?`\u7570\u52D5 ${Kt(e.law_modified_date)}`:"",Ml(e)].filter(Boolean).map(p=>`<span>${p}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${r(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${r(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>${o.sampled?`\u53D6\u6A23 ${c(o.judgment_count||0)} \u7B46\u63D0\u53CA\u300C${r(o.entity||"")}\u300D\u7684\u5224\u6C7A`:`\u63D0\u53CA\u300C${r(o.entity||"")}\u300D\u7684\u5224\u6C7A ${c(o.judgment_count||0)} \u7B46`}</span>
        <span>${o.sampled?"\u53D6\u6A23\u4E2D":"\u672C\u6CD5\u898F"}\u88AB\u5F15\u7528 ${c(o.law_count||0)} \u6B21</span>
      </div>`:"",d=e.law_key||"",u=e.source_type||"",f=(Array.isArray(e.articles)?e.articles:[]).map(p=>{let v=String(p.article_no||"");return`<div class="law-source-article"${d&&v?` data-action="open-law-source"
        data-law-key="${r(d)}"
        data-source-type="${r(u)}"
        data-article-no="${r(v)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${r(v)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} ${r(v)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${r(p.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${r(p.article_content||"")}</p>
      </div>`}).join(""),y=e.law_url?`<a class="citation-link" href="${r(Pt(e.law_url))}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${m("external",11)}</a>`:"",b=e.law_key?` data-action="open-law-source"
        data-law-key="${r(e.law_key)}"
        data-source-type="${r(e.source_type||"")}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u672C\u5730 Parquet \u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation law-source">
    <span class="citation-index">${String(oi(e.index,t+1)).padStart(2,"0")}</span>
    <div class="citation-body"${b}>
      <h4 class="citation-name">${r(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${n}</div>
      ${i}
      ${l}
      ${f}
    </div>
    <div class="citation-links">${y}</div>
  </article>`}function Mp(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function Lp(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${r(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",n=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(n==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),d=s.index!=null?`<span class="law-answer-index">[${r(String(s.index))}]</span>`:"",u=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${r(a)}"
            data-source-type="${r(n)}"
            title="\u9EDE\u64CA\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587">${r(i)}</button>`:`<strong>${r(i)}</strong>`,f=Array.isArray(s.articles)?s.articles:[],y=f.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${f.map(b=>{let p=String(b.article_no||"").trim(),v=Mp(b.article_content);return!a||!p?`<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${r(p||"\u689D\u6587")}</span>
                  <span class="law-answer-article-text">${r(v)}</span>
                </div>`:`<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${r(a)}"
                data-source-type="${r(n)}"
                data-article-no="${r(p)}"
                title="\u9EDE\u64CA\u67E5\u770B ${r(p)} \u7684\u5B8C\u6574\u5167\u5BB9"
                aria-label="\u958B\u555F ${r(i)} ${r(p)} \u7684\u5B8C\u6574\u689D\u6587">
                <span class="law-answer-article-no">${r(p)}</span>
                <span class="law-answer-article-text">${r(v)}</span>
              </button>`}).join("")}</div>`:"";return`<div class="law-answer-source">
        <div class="law-answer-source-head">
          ${u}
          <span class="law-answer-source-meta">\uFF08${r(o)}\uFF0C${c(l)} \u689D\uFF09</span>
          ${d}
        </div>
        ${y}
      </div>`}).join("")}</div>`}function jp(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let n=s.get(String(a));return n?.law_key?Cn(a,{lawKey:n.law_key,sourceType:n.source_type||""}):`<span class="chip">${r(a)}</span>`}).join("")}</div>`}function Tp(e){let t=String(e||"");return t==="operational"?"is-ok":t==="standby"?"is-idle":"is-down"}function Ep(e){let t=String(e||"");return t==="operational"?"":t==="standby"?"\u5099\u63F4":t==="disabled"?"\u505C\u7528":t==="not_configured"?"\u672A\u8A2D\u5B9A":"\u96E2\u7DDA"}function yl(e,{fallback:t=!1}={}){if(!e)return`<span class="rag-model-cell is-empty">
      <span class="rag-model-state is-idle" aria-hidden="true"></span>
      <span class="rag-model-name">\u672A\u8A2D\u5B9A</span>
    </span>`;let s=String(e.label||"").trim()||[e.host,e.model].filter(Boolean).join(":"),a=String(e.status||""),n=!["operational","standby"].includes(a),i=t&&!n?"\u5099\u63F4":Ep(a),o=n?"is-down":t?"is-idle":Tp(a),l=[s,e.url,i].filter(Boolean).join(" \xB7 ");return`<span class="rag-model-cell" title="${r(l)}">
    <span class="rag-model-state ${o}" aria-hidden="true"></span>
    <span class="rag-model-name">${r(s)}</span>
    ${i?`<span class="rag-model-note">${r(i)}</span>`:""}
  </span>`}function Np(e,t){let s=Array.isArray(e)?e:[],a=[{kind:"chat",label:"Chat"},{kind:"embedding",label:"Embedding"},{kind:"rerank",label:"Rerank"}],n=new Map(s.map(o=>[String(o.kind||""),o])),i=a.map(o=>{let l=n.get(o.kind)||o;return`<tr>
        <td class="rag-model-kind">${r(l.label||o.label)}</td>
        <td>${yl(l.active)}</td>
        <td>${yl(l.fallback,{fallback:!0})}</td>
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
  </div>`}function Rn({tone:e,title:t,text:s,modelSummary:a=[],refreshing:n=!1,expanded:i=!1}){let o=e==="ok"?"is-ok":e==="warn"?"is-warn":"is-info",l=e==="ok"?"check":e==="warn"?"alert":"info",d=e==="ok"?"badge-ok":e==="warn"?"badge-warn":"badge-info";return`<section class="rag-mode-card ${o}${i?" is-expanded":""}">
    <div class="rag-mode-head" role="button" tabindex="0" aria-expanded="${i}">
      <span class="rag-mode-icon" aria-hidden="true">${m(l,14)}</span>
      <div class="rag-mode-copy">
        <strong>${r(t)}</strong>
        <p>${r(s)}</p>
      </div>
      <span class="badge ${d}">3 \u500B\u6A21\u578B</span>
      <span class="rag-mode-chevron" aria-hidden="true">${m("chevronDown",14)}</span>
    </div>
    ${Np(a,n)}
  </section>`}function Ll(e,t=""){let s=Array.isArray(e.citations)?e.citations:[],a=Array.isArray(e.judgments)?e.judgments:[],n=Array.isArray(e.reference_judgments)?e.reference_judgments:[],i=Array.isArray(e.law_sources)?e.law_sources:[],o=e.retrieval||{},l=Array.isArray(e.matched_terms)?e.matched_terms:[],d=e.status||"preview",u=!!e.partial,f=!!e.streaming,y=!!e.rerank_degraded,b=!!e.show_sources||!u,p=e.answer_source==="structured",v=String(e.law_answer||"").trim(),w=e.law_framework||null,q=Array.isArray(w?.rows)?w.rows:[],k=Array.isArray(w?.sources)?w.sources:[],S=q.length>0,$=!!v&&!p&&!S,L=a.filter(ue=>ue.used_for_generation===!0).length,z=a.some(ue=>ue.used_for_generation!==void 0),P=a.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${a.length} \u7B46${z?`\uFF08${L} \u7B46\u9032\u5165 prompt\uFF09`:""}</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${a.map((ue,re)=>Sp(ue,re)).join("")}</div>`:"",Y=o.judgment_limit_applied&&n.length?`<div class="reference-judgment-note">
          <span>\u672C\u984C\u4F9D\u984C\u610F\u4E3B\u8981\u8A62\u554F\u6CD5\u898F\u898F\u5B9A\uFF0C\u6545\u5224\u6C7A\u50C5\u986F\u793A ${a.length} \u7B46\u4F5C\u70BA\u53C3\u8003\u3002\u53E6\u6709 ${n.length} \u7B46\u76F8\u95DC\u5224\u6C7A\uFF08${n.some(ue=>ue.rerank_score!==null&&ue.rerank_score!==void 0)?"\u4F9D rerank \u5206\u6578\u6392\u5E8F":"\u4F9D\u6AA2\u7D22\u5206\u6578\u6392\u5E8F"}\uFF09\uFF0C</span>
          <details class="reference-judgments">
            <summary>\u5C55\u958B\u67E5\u770B</summary>
            <div class="citation-list reference-judgment-list">${n.map(ue=>xp(ue)).join("")}</div>
          </details>
        </div>`:"",me=i.length&&!$?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${i.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${i.map((ue,re)=>qp(ue,re)).join("")}</div>`:"",X=!a.length&&s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${s.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${s.map((ue,re)=>Ap(ue,re)).join("")}</div>`:"",j=b?P+Y+me+X:"";!j&&!u&&!$&&!S&&(j=`<div class="answer-divider"></div>
      ${xt({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:d==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let x=jp(l,i),E=e.test_run,H=String(e.llm_model||E?.primary_model||"").trim(),te=String(e.embedding_model||"").trim(),U=[H?`LLM\uFF1A${H}`:"",te?`Embedding\uFF1A${te}`:""].filter(Boolean).join(" \xB7 "),ie=f||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",Te=S?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${r(w.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${q.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${q.map(ue=>`<tr>
                    <td>${r(ue.law_name||"\u2014")}</td>
                    <td class="cell-number">${r(ue.article_no||"\u2014")}</td>
                    <td>${r(ue.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${k.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${k.map(ue=>{let re=String(ue?.law_name||ue||"").trim(),qe=ue&&ue.index!==null&&ue.index!==void 0?` [${r(ue.index)}]`:"";return Cn(re,{label:`${re}${qe}`})}).join("")}
              </div>`:""}
      </div>`:"",B=e.answer_source==="llm"&&H?`<span class="answer-model" title="${r(U)}">${m("brain",11)}${r(H)}</span>`:p?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${m("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",we=f?`${H||"LLM"} \xB7 \u751F\u6210\u4E2D`:B?H||"structured":"retrieval",ce=E?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${Pe(E.status)}
          <span class="mono">${r(E.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(E.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(E.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${r(E.primary_model||"\u2014")}</span>
          <span>${Number(E.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",Oe=String(e.answer||"").trim()||(f?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":u?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),Ne=f?" data-partial-answer":"",et=f?" is-streaming":"";return`${Te}
      ${$?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${u&&!b?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${i.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${Lp(i,v)}</div>
            </div>`:""}
      <div class="answer-block">
        ${$||S?`<div class="answer-block-head">
                <span>${r(ie)}</span>
                <span>${r(we)}</span>
              </div>`:""}
        <p class="answer-text${et}"${Ne}>${r(Oe)}</p>
      </div>
      ${t}
      ${y?'<div class="answer-notice" data-rerank-degraded="true">\u6392\u5E8F\u7CBE\u7C21\u6A21\u5F0F\uFF1A\u672C\u6B21\u90E8\u5206 rerank \u903E\u6642\u6216\u964D\u7D1A\uFF0C\u4F86\u6E90\u53EF\u80FD\u4EE5\u5411\u91CF\u9806\u5E8F\u986F\u793A\u3002</div>':""}
      ${e.notice?`<div class="answer-notice">${r(e.notice)}</div>`:""}
      ${ce}
      ${x}
      ${j}`}function wl(e,t,s=""){let a=t.status||"preview",n=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),d=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),u=t.answer_source==="structured",f=s||Al(t),y=t.answer_source==="llm"&&o?`<span class="answer-model" title="${r(d)}">${m("brain",11)}${r(o)}</span>`:u?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${m("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${m("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${Pe(a,n)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${y}
      </div>
      ${f}
    </div>
    <div class="answer-body">${Ll(t,xl(e,t))}</div>`}function Rp(e,t="",s=""){return`<div class="answer-head">
      <div class="answer-head-left">${m("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${Ge({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      ${s?xl(s):""}
    </div>`}function Cp(e){let t=Array.isArray(e.turns)?e.turns:[],s=t.length?t[t.length-1].payload||{}:e.payload||{},a=Array.isArray(s.citations)?s.citations.length:0,n=Array.isArray(s.judgments)?s.judgments.length:0,i=Array.isArray(s.law_sources)?s.law_sources.length:0;return a+n+i}function Pp(e,t,s,a=null){let n=e.id??s,i=Cp(e),o=t.get(String(e.project_id||"")),l=Array.isArray(e.turns)?e.turns:[],d=e.updated_at||e.created_at,u=a!=null&&String(a)===String(n);return`<div class="rag-history-item${e.pinned?" is-pinned":""}${u?" is-active":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${r(String(n))}">
      <span class="history-question">${r(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${r(_a(d))}</span>
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
  </div>`}function _l(e,t,s){let a=new Map;for(let i of t){let o=String(i.project_id||"");o&&a.set(o,(a.get(o)||0)+1)}let n=[`<button class="rag-project${s?"":" is-active"}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${s?"false":"true"}">
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
  </div>`),n.join("")}async function Ip(e){let t=bp();t&&!t.token&&ti();let s=new WeakMap,a=!1,n=[],i=!1,o=[],l=!1,d="",u=8,f="",y=0,b=null,p=[],v=!1,w=!1,q={embedding:[],llm:[]},k=null,S=null,$=!1,L=!1;e.innerHTML=`<section class="page rag-page">
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
            \u6B77\u53F2\u6E05\u55AE\u53EA\u5B58\u5728\u6B64\u700F\u89BD\u5668\uFF1B\u9001\u51FA\u554F\u984C\u6642\u6703\u50B3\u9001\u5230\u4F3A\u670D\u5668\u7522\u751F\u7B54\u6848\u3002\u4F3A\u670D\u5668\u4FDD\u7559\u63D0\u554F\u8207\u56DE\u7B54\u5FEB\u7167 180 \u5929\u3001\u4F7F\u7528\u8005\u56DE\u994B 180 \u5929\u6216\u7D50\u6848\u5F8C 180 \u5929\u3001\u5B89\u5168\u7A3D\u6838\u4E8B\u4EF6 180 \u5929\uFF1B\u5099\u4EFD\u4F9D 90 \u5929\u8F2A\u66FF\u653F\u7B56\u7531\u7DAD\u904B\u522A\u9664\uFF0C\u7A0B\u5F0F\u4E0D\u81EA\u52D5\u522A\u9664\u5099\u4EFD\u3002
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
        <p class="ask-privacy-note">\u8ACB\u52FF\u8F38\u5165\u500B\u4EBA\u8CC7\u6599\uFF1B\u63D0\u554F\u8207\u56DE\u7B54\u5FEB\u7167\u4FDD\u7559 180 \u5929\u3001\u4F7F\u7528\u8005\u56DE\u994B\u4FDD\u7559 180 \u5929\u6216\u7D50\u6848\u5F8C 180 \u5929\u3001\u5B89\u5168\u7A3D\u6838\u4FDD\u7559 180 \u5929\uFF1B\u5099\u4EFD\u4F9D 90 \u5929\u8F2A\u66FF\u653F\u7B56\u7BA1\u7406\u3002</p>
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
        ${pp.map(g=>`<button class="example-chip" type="button" data-question="${r(g)}">${r(g)}</button>`).join("")}
      </div>
    </header>

    <section class="rag-conversation" id="rag-conversation" aria-live="polite">
      <div class="rag-turns" id="rag-turns">
        ${ei()}
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
    <dialog id="rag-feedback-dialog" class="judgment-dialog rag-feedback-dialog"></dialog>
  </section>`;let z=e.querySelector("#rag-form"),P=e.querySelector("#rag-question"),Y=e.querySelector("#rag-submit"),me=e.querySelector(".rag-page");me.classList.toggle("is-shared-view",!!t);let X=e.querySelector(".rag-workspace-toolbar"),j=e.querySelector("#rag-workspace-menu"),x=e.querySelector('[data-workspace-action="menu"]'),E=e.querySelector("#rag-turns"),H=e.querySelector("#rag-followup-form"),te=e.querySelector("#rag-followup-question"),U=e.querySelector("#rag-followup-submit"),ie=e.querySelector("#rag-history"),Te=e.querySelector("#rag-storage-note"),B=e.querySelector("#rag-clear-history"),we=e.querySelector(".rag-library"),ce=e.querySelector("#rag-pinned-body"),Le=e.querySelector("#rag-projects-body"),Oe=e.querySelector("#rag-pinned-count"),Ne=e.querySelector("#rag-projects-count"),et=e.querySelector("#rag-recent-count"),ue=e.querySelector("#rag-library-context"),re=e.querySelector("#rag-test-mode"),qe=e.querySelector("#rag-test-flow"),ye=e.querySelector("#rag-history-menu"),_e=e.querySelector("#rag-judgment-dialog"),Ee=e.querySelector("#rag-law-dialog"),C=e.querySelector("#rag-feedback-dialog"),G=e.querySelector("#rag-mode-notice"),V=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};_e?.addEventListener("close",V),Ee?.addEventListener("close",V),C?.addEventListener("close",V);let I=null,W=null,K,ke=null,Fe=null,Ye=()=>{P.style.height="auto",P.style.height=`${Math.min(P.scrollHeight,220)}px`},ht=()=>{te.style.height="auto",te.style.height=`${Math.min(te.scrollHeight,160)}px`},lt=g=>{v=!!g,me.classList.toggle("has-conversation",v)},tt=()=>{v&&(H.hidden=!1,ht())},rt=()=>{H.hidden=!0},ae=()=>{ye.hidden&&!Fe||(ye.hidden=!0,ye.innerHTML="",Fe&&Fe.setAttribute("aria-expanded","false"),ke=null,Fe=null)},it=(g,A)=>{let N=E.querySelector(".rag-empty-answer");N&&N.remove(),E.insertAdjacentHTML("beforeend",gl(g,A,{complete:!1}));let J=E.lastElementChild,fe=J?.querySelector("[data-rag-answer]");return window.requestAnimationFrame(()=>{J?.scrollIntoView({behavior:"smooth",block:"start"})}),{turnElement:J,answerElement:fe}},Ke=(g,A)=>{let N=g?.querySelector(".rag-user-bubble");N&&(N.textContent=A),g?.querySelectorAll("[data-rag-question-action], [data-rag-answer-action]").forEach(J=>{J.dataset.question=A})},ft=g=>{let A=s.get(g)||{};return{payload:A,requestId:String(A.request_id||"").trim(),token:String(A.feedback?.token||"").trim()}},Mt=(g,A)=>{if(!g)return;g.dataset.feedbackSentiment=A;let N=s.get(g);N&&(N.feedback_sentiment=A);let J=Array.from(E.querySelectorAll(".rag-turn")).indexOf(g);J>=0&&p[J]?.payload&&(p[J].payload.feedback_sentiment=A),b&&la(b,{turns:p,updated_at:new Date().toISOString()}),g.querySelectorAll('[data-rag-answer-action="feedback"]').forEach(je=>{let De=je.dataset.sentiment===A;je.classList.toggle("is-selected",De),je.setAttribute("aria-pressed",String(De))});let fe=g.querySelector("[data-rag-feedback-note]");fe&&(fe.textContent=A==="satisfied"?"\u5DF2\u6536\u5230\u56DE\u994B\uFF1A\u6EFF\u610F":"\u5DF2\u6536\u5230\u56DE\u994B\uFF1A\u4E0D\u6EFF\u610F")},oe=async(g,{sentiment:A,reasons:N=[],comment:J=""})=>{let{requestId:fe,token:je}=ft(g);if(!fe||!je)return T("\u9019\u5247\u56DE\u7B54\u5DF2\u8D85\u904E\u53EF\u56DE\u994B\u671F\u9650\u3002","warn"),!1;try{return await O.ragFeedbackCreate({request_id:fe,feedback_token:je,sentiment:A,reasons:N,comment:J}),Mt(g,A),T(A==="satisfied"?"\u8B1D\u8B1D\uFF0C\u5DF2\u8A18\u9304\u6EFF\u610F\u56DE\u994B\u3002":"\u5DF2\u9001\u51FA\u56DE\u994B\uFF0C\u8B1D\u8B1D\u3002","ok"),!0}catch(De){return De.status===410?T("\u6B64\u56DE\u7B54\u5DF2\u8D85\u904E\u56DE\u994B\u671F\u9650\u3002","warn",5200):De.status===409?T("\u6B64\u56DE\u994B\u5DF2\u8D85\u904E 15 \u5206\u9418\u4FEE\u6539\u671F\u9650\u3002","warn",5200):T(De.message||"\u56DE\u994B\u9001\u51FA\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger"),!1}},Se=()=>{C?.open&&C.close(),C?.classList.remove("is-open")},st=g=>{if(!C||a)return;let A=up.map(([N,J])=>`<label class="rag-feedback-option">
        <input type="checkbox" name="feedback_reason" value="${r(N)}" />
        <span>${r(J)}</span>
      </label>`).join("");C.innerHTML=`<div class="judgment-dialog-head">
        <div>
          <div class="report-kicker">ANSWER FEEDBACK</div>
          <h2>\u54EA\u88E1\u9700\u8981\u6539\u9032\uFF1F</h2>
        </div>
        <button class="judgment-dialog-close" type="button"
          data-rag-feedback-action="cancel" aria-label="\u95DC\u9589\u56DE\u994B">${m("x",14)}</button>
      </div>
      <form class="judgment-dialog-body rag-feedback-form" data-rag-feedback-form>
        <p class="rag-feedback-intro">\u8ACB\u9078\u64C7\u4E0D\u6EFF\u610F\u7684\u539F\u56E0\uFF0C\u53EF\u88DC\u5145\u8AAA\u660E\u3002\u9019\u5247\u56DE\u994B\u6703\u9023\u7D50\u5230\u7576\u6642\u7684\u554F\u984C\u3001\u56DE\u7B54\u8207 Pipeline \u5FEB\u7167\uFF0C\u4F9B\u7BA1\u7406\u8005\u91CD\u73FE\u3002</p>
        <fieldset class="rag-feedback-reasons">
          <legend class="sr-only">\u4E0D\u6EFF\u610F\u539F\u56E0</legend>
          ${A}
        </fieldset>
        <label class="rag-feedback-comment-label" for="rag-feedback-comment">\u88DC\u5145\u8AAA\u660E\uFF08\u9078\u586B\uFF09</label>
        <textarea class="input rag-feedback-comment" id="rag-feedback-comment"
          name="comment" rows="4" maxlength="4000"
          placeholder="\u4F8B\u5982\uFF1A\u5F15\u7528\u689D\u865F\u932F\u8AA4\u3001\u65E5\u671F\u7BC4\u570D\u4E0D\u5C0D\u3001\u56DE\u7B54\u6C92\u6709\u56DE\u7B54\u5230\u554F\u984C\u2026"></textarea>
        <p class="rag-feedback-privacy">\u8ACB\u52FF\u8F38\u5165\u500B\u4EBA\u8CC7\u6599\u3002\u56DE\u994B\u8207\u56DE\u7B54\u5FEB\u7167\u4FDD\u7559 180 \u5929\uFF0C\u6216\u7D50\u6848\u5F8C 180 \u5929\uFF1B\u539F\u59CB\u7559\u8A00\u53EA\u4F9B\u7BA1\u7406\u8005\u6AA2\u8996\uFF0C\u4E0D\u6703\u76F4\u63A5\u653E\u9032\u81EA\u52D5\u6539\u5584\u4EE3\u7406\u7684\u63D0\u793A\u3002</p>
        <div class="rag-feedback-error" data-rag-feedback-error hidden></div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary" type="button" data-rag-feedback-action="cancel">\u53D6\u6D88</button>
          <button class="btn btn-primary" type="submit" data-rag-feedback-submit>\u9001\u51FA\u56DE\u994B</button>
        </div>
      </form>`,C._turnElement=g,C.classList.add("is-open"),C.open||C.showModal(),C.querySelector('input[name="feedback_reason"]')?.focus({preventScroll:!0})};C?.addEventListener("click",g=>{if(g.target.closest("[data-rag-feedback-action]")?.dataset.ragFeedbackAction==="cancel"){Se();return}g.target===C&&Se()}),C?.addEventListener("submit",async g=>{g.preventDefault();let A=g.target.closest("[data-rag-feedback-form]");if(!A)return;let N=Array.from(A.querySelectorAll('input[name="feedback_reason"]:checked')).map(xe=>xe.value),J=String(A.elements.comment?.value||"").trim();if(!N.length){let xe=A.querySelector("[data-rag-feedback-error]");xe&&(xe.hidden=!1,xe.textContent="\u8ACB\u81F3\u5C11\u9078\u4E00\u500B\u539F\u56E0\u3002"),A.querySelector('input[name="feedback_reason"]')?.focus();return}let fe=C._turnElement;if(!fe){Se();return}let je=A.querySelector("[data-rag-feedback-submit]");he(je,!0,"\u9001\u51FA\u4E2D\u2026");let De=await oe(fe,{sentiment:"unsatisfied",reasons:N,comment:J});he(je,!1),De&&Se()});let Je=()=>{E.innerHTML=p.length?p.map(A=>gl(A.question,wl(A.question,A.payload||{},""))).join(""):ei(),Array.from(E.querySelectorAll(".rag-turn")).forEach((A,N)=>{let J=p[N]?.payload;J&&s.set(A,J)})},zt=async g=>{try{let A=await O.ragShareGet(g);if(a)return!1;let N=(Array.isArray(A?.turns)?A.turns:[]).map(J=>({question:String(J?.question||"").trim().slice(0,500),asked_at:String(J?.asked_at||""),payload:J?.payload&&typeof J.payload=="object"?J.payload:{}})).filter(J=>J.question);if(!N.length)throw new Error("\u5206\u4EAB\u5167\u5BB9\u662F\u7A7A\u7684\u3002");return b=null,p=N,f=N[N.length-1]?.question||"",lt(!0),Je(),tt(),R(),he(Y,!1),he(U,!1),ti({keepToken:!0,token:g}),window.scrollTo({top:0,behavior:"auto"}),T("\u5DF2\u8F09\u5165\u5206\u4EAB\u7684\u5C0D\u8A71\u3002","ok",3200),!0}catch{return ti(),a||T("\u5206\u4EAB\u9023\u7D50\u5DF2\u5931\u6548\u6216\u7121\u6CD5\u8F09\u5165\u3002","warn",5200),!1}},At=(g,A)=>{let N=Array.from(E.querySelectorAll(".rag-turn")),J=N.indexOf(g),fe=J>=0?J+1:N.length,je=[];for(let De=0;De<fe;De+=1){let xe=N[De],dt=p[De],nt=String(dt?.question||xe?.querySelector(".rag-user-bubble")?.textContent||"").trim();if(!nt)continue;let qt=dt?.payload||s.get(xe)||(De===J?{status:"operational",answer:si(xe),answer_source:"shared"}:{});je.push({question:nt,asked_at:dt?.asked_at||"",payload:qt})}return!je.length&&A&&je.push({question:A,asked_at:"",payload:{status:"operational",answer:si(g),answer_source:"shared"}}),je},M=g=>{let A=Array.isArray(g.turns)?g.turns:[];return A.length?(Bt(),y+=1,ps(),es(null),b=g.id??null,p=A.map(N=>({...N})),f=p[p.length-1]?.question||"",lt(!0),Je(),tt(),R(),he(Y,!1),he(U,!1),window.setTimeout(()=>{H.scrollIntoView({behavior:"smooth",block:"end"})},50),!0):!1},R=()=>{if(a)return;if(ae(),!i){ie.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',ce.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',Oe.textContent="0",et.textContent="0",l&&(Le.innerHTML=_l(o,[],d));return}let g=o.find(xe=>String(xe.id)===d)||null;d&&!g&&(d="");let A=new Map(o.map(xe=>[String(xe.id),xe])),N=n.filter(xe=>!!xe.pinned),J=n.filter(xe=>!xe.pinned),fe=d?J.filter(xe=>String(xe.project_id||"")===d):J,je=fe.slice(0,u),De=(xe,dt)=>Pp(xe,A,dt,b);ce.innerHTML=N.length?N.map(De).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',Le.innerHTML=_l(o,n,d),ie.innerHTML=je.length?je.map(De).join(""):`<div class="rag-library-empty">${d?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u672A\u91D8\u9078\u7684\u9805\u76EE\u3002":N.length?"\u6700\u8FD1\u7684\u9805\u76EE\u90FD\u5DF2\u91D8\u9078\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,fe.length>u&&ie.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${c(fe.length-u)} \u7B46</button>`),Oe.textContent=String(N.length),Ne.textContent=String(o.length),et.textContent=String(fe.length),g?(ue.hidden=!1,ue.innerHTML=`<span>${m("folder",12)}<strong>${r(g.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${m("x",12)}</button>`):(ue.hidden=!0,ue.innerHTML="")},D=async()=>{try{let g=await Rs("rag.projects",[]);o=Array.isArray(g)?g.map(A=>({id:String(A?.id||""),name:String(A?.name||"").trim()})).filter(A=>A.id&&A.name):[]}catch{o=[]}l=!0,a||R()},Q=g=>{d=String(g||""),u=8,R()},ee=()=>{let g=Le.querySelector('[data-rag-form="project"]');g&&(g.hidden=!1,g.querySelector("input")?.focus())},de=()=>{let g=Le.querySelector('[data-rag-form="project"]');g&&(g.hidden=!0,g.reset())},ve=async g=>{let A=g.elements.project_name,N=String(A?.value||"").trim();if(!N){T("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),A?.focus();return}if(o.some(fe=>fe.name.toLowerCase()===N.toLowerCase())){T("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),A?.focus();return}let J=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;o=[...o,{id:J,name:N.slice(0,60),created_at:new Date().toISOString()}],d=J,u=8,await Ta("rag.projects",o),R(),T(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${N}\u300D\u3002`,"ok")},He=async g=>{let A=n.find(fe=>String(fe.id)===String(g));if(!A)return;let N=!A.pinned;if(!await la(A.id,{pinned:N})){T("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}A.pinned=N,R(),T(N?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},ze=()=>{Bt(),y+=1,ps(),es(null),f="",b=null,p=[],lt(!1),rt(),E.innerHTML=ei(),P.value="",Ye(),te.value="",ht(),he(Y,!1),he(U,!1),R(),_e?.open&&_e.close(),Ee?.open&&Ee.close(),Se(),P.focus(),window.scrollTo({top:0,behavior:"smooth"})},Be=g=>{if(!g||ye.hidden)return;let A=g.getBoundingClientRect(),N=ye.getBoundingClientRect(),J=6,fe=A.bottom+J;fe+N.height>window.innerHeight-8&&(fe=Math.max(8,A.top-N.height-J));let je=A.right-N.width;je=Math.max(8,Math.min(je,window.innerWidth-N.width-8)),ye.style.left=`${Math.round(je)}px`,ye.style.top=`${Math.round(fe)}px`},Xe=g=>{ye.innerHTML=`
      <button type="button" role="menuitem" data-menu-action="rename">${m("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${m("pin",13)}<span>${g.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${m("link",13)}<span>\u5EFA\u7ACB\u516C\u958B\u9023\u7D50</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${m("trash",13)}<span>\u522A\u9664</span></button>`},ct=g=>{let A=String(g.project_id||""),N=[{id:"",name:"\u672A\u5206\u985E"},...o.map(J=>({id:String(J.id),name:J.name}))];ye.innerHTML=`
      <div class="rag-history-menu-head">${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${N.map(J=>`<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${r(J.id)}">
            <span class="rag-history-menu-check">${A===J.id?m("check",12):""}</span>
            <span>${r(J.name)}</span>
          </button>`).join("")}
      ${o.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${m("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},pt=(g,A)=>{let N=n.find(J=>String(J.id)===String(A));N&&(ae(),ke=String(N.id),Fe=g,Xe(N),ye.hidden=!1,g.setAttribute("aria-expanded","true"),Be(g))},fa=async g=>{let A=window.prompt("\u91CD\u65B0\u547D\u540D\u5C0D\u8A71",g.title||"");if(A===null)return;let N=A.trim();if(!N){T("\u540D\u7A31\u4E0D\u80FD\u7A7A\u767D\u3002","warn");return}if(N===g.title)return;if(!await la(g.id,{title:N})){T("\u91CD\u65B0\u547D\u540D\u5931\u6557\u3002","danger");return}g.title=N,R(),T("\u5C0D\u8A71\u5DF2\u91CD\u65B0\u547D\u540D\u3002","ok")},Ha=async g=>{let A=(Array.isArray(g.turns)?g.turns:[]).map(N=>({question:String(N?.question||"").trim(),asked_at:String(N?.asked_at||""),payload:N?.payload&&typeof N.payload=="object"?N.payload:{}}));A.length||A.push({question:g.title||"\u672A\u547D\u540D\u5C0D\u8A71",asked_at:"",payload:{}}),await ai(A,g.title||"Judgment RAG \u5C0D\u8A71")},za=async g=>{if(!window.confirm(`\u522A\u9664\u5C0D\u8A71\u300C${g.title||"\u672A\u547D\u540D\u5C0D\u8A71"}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002`))return;if(!await ho(g.id)){T("\u522A\u9664\u5931\u6557\u3002","danger");return}let N=b!==null&&String(b)===String(g.id);n=n.filter(J=>String(J.id)!==String(g.id)),N?ze():R(),T("\u5C0D\u8A71\u5DF2\u522A\u9664\u3002","ok")},ba=async(g,A)=>{if(!await la(g.id,{project_id:A})){T("\u79FB\u81F3\u5C08\u6848\u5931\u6557\u3002","danger");return}g.project_id=A;let J=o.find(fe=>String(fe.id)===String(A));R(),T(J?`\u5DF2\u79FB\u81F3\u5C08\u6848\u300C${J.name}\u300D\u3002`:"\u5DF2\u79FB\u51FA\u5C08\u6848\u3002","ok")},va=()=>n.find(g=>b!==null&&String(g.id)===String(b))||null,Bt=()=>{j&&(j.hidden=!0,j.innerHTML="",x?.setAttribute("aria-expanded","false"))},Xs=()=>{let g=va(),A=g?"":" disabled";j.innerHTML=`
      <button type="button" role="menuitem" data-workspace-menu-action="rename"${A}>${m("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-workspace-menu-action="pin"${A}>${m("pin",13)}<span>${g?.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078\u5C0D\u8A71"}</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-workspace-menu-action="delete"${A}>${m("trash",13)}<span>\u522A\u9664</span></button>
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-workspace-menu-action="move"${A}>${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      ${g?"":'<div class="rag-history-menu-note">\u76EE\u524D\u6C92\u6709\u53EF\u7BA1\u7406\u7684\u5C0D\u8A71\u3002</div>'}`},qs=g=>{let A=String(g.project_id||""),N=[{id:"",name:"\u672A\u5206\u985E"},...o.map(J=>({id:String(J.id),name:J.name}))];j.innerHTML=`
      <div class="rag-history-menu-head">${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${N.map(J=>`<button type="button" role="menuitem"
            data-workspace-menu-action="assign-project" data-project-id="${r(J.id)}">
            <span class="rag-history-menu-check">${A===J.id?m("check",12):""}</span>
            <span>${r(J.name)}</span>
          </button>`).join("")}
      ${o.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-workspace-menu-action="back">${m("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},Nt=()=>{ae(),Xs(),j.hidden=!1,x?.setAttribute("aria-expanded","true")},ha=async()=>{let g=va(),A=p.map(N=>({question:N.question,asked_at:N.asked_at||"",payload:N.payload||{}}));if(!A.length&&Array.isArray(g?.turns)&&(A=g.turns.map(N=>({...N}))),!A.length){T("\u76EE\u524D\u6C92\u6709\u53EF\u5EFA\u7ACB\u516C\u958B\u9023\u7D50\u7684\u5C0D\u8A71\u3002","warn");return}await ai(A,g?.title||"Judgment RAG \u5C0D\u8A71")},Vn=async g=>{let A=g.target.closest("[data-menu-action]");if(!A)return;let N=n.find(fe=>String(fe.id)===ke);if(!N){ae();return}let J=A.dataset.menuAction;J==="rename"?(ae(),await fa(N)):J==="toggle-pin"?(ae(),await He(N.id)):J==="share"?(ae(),await Ha(N)):J==="move"?(ct(N),Be(Fe)):J==="assign-project"?(ae(),await ba(N,A.dataset.projectId||"")):J==="back"?(Xe(N),Be(Fe)):J==="delete"&&(ae(),await za(N))},$a=g=>{let A=typeof g.composedPath=="function"?g.composedPath():[];ye.hidden||!(A.includes(ye)||ye.contains(g.target))&&!g.target.closest('[data-rag-action="open-history-menu"]')&&ae(),j.hidden||!(A.includes(j)||j.contains(g.target))&&!g.target.closest('[data-workspace-action="menu"]')&&Bt()},Zs=g=>{g.key==="Escape"&&(ae(),Bt())},Ut=g=>{g.target instanceof Node&&ye.contains(g.target)||(ae(),j.hidden||Bt())},ya=async()=>{try{if(n=await yn({limit:120}),a)return;i=!0,R(),Te.textContent=La()==="indexeddb"?"\u6B77\u53F2\u6E05\u55AE\u53EA\u5B58\u5728\u6B64\u700F\u89BD\u5668\uFF1B\u9001\u51FA\u554F\u984C\u6642\u6703\u50B3\u9001\u5230\u4F3A\u670D\u5668\u7522\u751F\u7B54\u6848\u3002\u4F3A\u670D\u5668\u4FDD\u7559\u63D0\u554F\u8207\u56DE\u7B54\u5FEB\u7167 180 \u5929\u3001\u4F7F\u7528\u8005\u56DE\u994B 180 \u5929\u6216\u7D50\u6848\u5F8C 180 \u5929\u3001\u5B89\u5168\u7A3D\u6838\u4E8B\u4EF6 180 \u5929\uFF1B\u5099\u4EFD\u4F9D 90 \u5929\u8F2A\u66FF\u653F\u7B56\u7BA1\u7406\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(a)return;n=[],i=!0,R(),ie.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},Kn=async(g,A,N,J,{replaceIndex:fe=null}={})=>{let je=p,De=b,xe={question:g,asked_at:new Date().toISOString(),payload:fl(A)};Number.isInteger(fe)&&fe>=0&&fe<=je.length?je[fe]=xe:je.push(xe);let dt=Array.isArray(A.citations)?A.citations:[],nt=Array.isArray(A.judgments)?A.judgments:[],qt={question:g,status:A.status,citations:dt.map(Qe=>Qe.law_name),judgments:nt.map(Qe=>Qe.jid)},ut=`${A.status||"preview"} \xB7 ${je.length} \u8F2A`,Ce=new Date().toISOString(),mt=Qe=>{J===y&&(b=Qe)};if(De){if(!await la(De,{turns:je,detail:ut,payload:qt,updated_at:Ce})){let kt=await ja({kind:"rag",title:je[0]?.question||g,detail:ut,project_id:N,turns:je,payload:qt,updated_at:Ce});mt(kt)}}else{let Qe=await ja({kind:"rag",title:je[0]?.question||g,detail:ut,project_id:N,turns:je,payload:qt,updated_at:Ce});mt(Qe)}await ya()},ea=()=>{let g=e.querySelector("#rag-mode-notice");if(!g)return;if(rs()){g.innerHTML=Ge({tone:"info",title:"\u5C55\u793A\u6A21\u5F0F",text:"\u53EF\u76F4\u63A5\u8F38\u5165\u6CD5\u5F8B\u554F\u984C\uFF1B\u56DE\u7B54\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u6CD5\u898F\u8207\u5224\u6C7A\u5F15\u7528\u3002"});return}let A=Array.isArray(k?.model_summary)?k.model_summary:[];if(!k){if(!S)return;g.innerHTML=Rn({tone:"warn",title:"\u7121\u6CD5\u53D6\u5F97 RAG \u670D\u52D9\u72C0\u614B",text:S.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u524D\u5F80\u7CFB\u7D71\u72C0\u614B\u9801\u67E5\u770B\u3002",modelSummary:A,refreshing:$,expanded:L});return}let N=k.data||{},J=(k.services||[]).find(De=>De.id==="rag"),fe=Number(N.judgment_indexed_count||0),je=Number(N.judgment_count||0);J?.status==="operational"?g.innerHTML=Rn({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${c(fe)} / ${c(je)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`,modelSummary:A,refreshing:$,expanded:L}):J?.status==="degraded"?g.innerHTML=Rn({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:J.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002",modelSummary:A,refreshing:$,expanded:L}):g.innerHTML=Rn({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:J?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002",modelSummary:A,refreshing:$,expanded:L})},Yn=async()=>{if(rs()){k=null,S=null,ea();return}try{let g=await O.status();if(a)return;k=g,S=null}catch(g){if(a)return;k=null,S=g}ea()},Ua=async()=>{if(!$){$=!0,ea();try{let g=await O.status();if(a)return;k=g,S=null,T("\u5DF2\u66F4\u65B0\u6A21\u578B\u72C0\u614B\u3002","ok",2500)}catch(g){T(g.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u3002","danger",6e3)}finally{$=!1,a||ea()}}},Ds=()=>{if(!re)return;if(!w){re.innerHTML="";return}let g=Array.isArray(q.embedding)?q.embedding.length:0,A=Array.isArray(q.llm)?q.llm.length:0;re.innerHTML=Ge({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${g} \u500B embedding \u8207 ${A} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},Ga=async()=>{if(rs()){w=!1,Ds();return}try{let g=await O.testMode();if(a)return;w=!!g.enabled,q=g.models||{embedding:[],llm:[]},Ds()}catch{if(a)return;w=!1,Ds()}},wa=g=>{w=!!g.detail?.enabled,q=g.detail?.models||{embedding:[],llm:[]},Ds()};window.addEventListener("judgment:test-mode",wa);let es=g=>{if(!qe)return;W=g||null;let A=JSON.stringify(g?{run_id:g.run_id,status:g.status,progress:g.progress,total_ms:g.total_ms,stage:g.stage,answer:g.answer||"",steps:(g.steps||[]).map(N=>`${N.stage}:${N.model}:${N.status}:${N.progress}:${N.duration_ms}`)}:null);A!==K&&(K=A,qe.innerHTML=g?pa(g,[],"",{showHistory:!1}):"")},ps=()=>{I&&(I(),I=null)},Qa=async(g=null)=>{if(!a)try{let A=g||await O.testRunCurrent();if(a)return;let N=A.run;N&&N.status==="running"&&es(N)}catch{}},h=()=>{a||I||(Qa(),I=Ct("test-runs",(g,A)=>Qa(A?.snapshot||null)))},_=async g=>{if(!g){es(null);return}try{let A=await O.testRun(g);if(a)return;es(A.run||null)}catch{a||T("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},F=async()=>{if(w)try{let g=await O.testRunCurrent();if(a)return;g.run?.status==="running"&&(es(g.run),h())}catch{}},pe=0,le=(g,A)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${r(g)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${m("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${A}</div>`,se=g=>{let A=(Array.isArray(g.citations)?g.citations:[]).map(De=>ql(De)).filter(Boolean).join(""),N=A||(Array.isArray(g.matched_laws)?g.matched_laws:[]).map(De=>Cn(De)).join(""),J=[g.court,g.jdate,g.title?`\u6848\u7531\uFF1A${g.title}`:"",g.full_text_length?`${c(g.full_text_length)} \u5B57`:"",g.citation_count?`\u5F15\u7528 ${c(g.citation_count)} \u7B46`:""].filter(Boolean).map(De=>`<span>${r(De)}</span>`).join(""),fe=g.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${r(String(g.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",je=g.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(g.pdf_url)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return le(g.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${r(g.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${J}
      </div>
      ${A?'<div class="citation-meta" style="margin-top:8px"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':""}
      ${N?`<div class="chips" style="margin:8px 0 10px">${N}</div>`:""}
      <div class="judgment-dialog-source">${fe}</div>
      <pre class="judgment-dialog-text">${r(g.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${je}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},Me=async g=>{if(!_e||!g)return;let A=++pe;_e.open||_e.showModal(),V(),_e.innerHTML=le("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${r(g)}\u2026</span>
      </div>`);try{let N=await O.judgmentDetail(g,"parquet");if(a||A!==pe)return;_e.innerHTML=se(N)}catch(N){if(a||A!==pe)return;_e.innerHTML=le("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(N.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},ne=0,ge=(g,A)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${r(g)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${m("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${A}</div>`,Ae=(g,A="")=>{let N=String(g.selected_article_no||A||"").trim(),J=!!N,fe=Array.isArray(g.articles)?g.articles:[],je=fe.map(ot=>{let Gt=String(ot.article_content||"").trim();return Gt?ot.article_type==="C"?`<div class="law-chapter">${r(Gt)}</div>`:`<article class="law-article" data-article-no="${r($l(ot.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${r(ot.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${r(Gt)}</div>
        </article>`:""}).join(""),De=(Array.isArray(g.warnings)?g.warnings:[]).map(ot=>r(ot)).join("<br />"),xe=g.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",dt=g.meta?.articles_source,nt=dt==="parquet"?"Parquet \u689D\u6587":dt==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",qt=g.meta?.snapshot||"",ut=[g.law_level,g.law_category,g.article_count?`${c(g.article_count)} \u689D`:"",g.law_modified_date?`\u7570\u52D5 ${Kt(g.law_modified_date)}`:""].filter(Boolean).map(ot=>`<span>${r(ot)}</span>`).join(""),Ce=g.law_url?`<a class="btn btn-secondary btn-sm" href="${r(g.law_url)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",mt=!J&&g.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${r(g.law_histories)}</div>
        </details>`:"",Qe=J?`<span class="badge badge-mono">${r(N)}</span>`:"",kt=!J&&fe.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",wt=J?`${g.law_name||g.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${N}`:g.law_name||g.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return ge(wt,`<div class="judgment-dialog-meta">
        <span class="badge ${g.source_type==="order"?"badge-warn":"badge-info"}">${r(xe)}</span>
        ${Qe}
        ${ut}
      </div>
      <div class="judgment-dialog-source">${r([nt,qt].filter(Boolean).join(" \xB7 "))}</div>
      ${De?`<div class="law-dialog-warning">${De}</div>`:""}
      ${mt}
      ${kt}
      <div class="law-dialog-articles">${je||`<div class="report-empty-inline">${J?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${Ce}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},Re=(g,A)=>{let N=g?.querySelector(`#${A}`),J=$l(N?.value||"");if(!J){T("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),N?.focus();return}let fe=[...g?.querySelectorAll("[data-article-no]")||[]].find(je=>je.dataset.articleNo===J);if(!fe){T(`\u627E\u4E0D\u5230\u7B2C ${J} \u689D\u3002`,"warn");return}fe.scrollIntoView({behavior:"instant",block:"center"}),fe.classList.add("is-jump-target"),window.setTimeout(()=>fe.classList.remove("is-jump-target"),2400)},Ue=async(g,A="",N="")=>{if(!Ee||!g)return;let J=++ne;Ee.open||Ee.showModal(),V(),Ee.innerHTML=ge(N?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${r([g,N].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let fe=await O.lawDetail(g,A,"",N);if(a||J!==ne)return;Ee.innerHTML=Ae(fe,N)}catch(fe){if(a||J!==ne)return;Ee.innerHTML=ge("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(fe.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};Ee?.addEventListener("click",g=>{let A=g.target.closest('[data-action="jump-law-article"]');if(A){Re(Ee,A.dataset.jumpInput||"rag-law-article-jump");return}if(g.target.closest('[data-action="close-law-source"]')){Ee.close();return}let N=Ee.getBoundingClientRect();(g.clientX<N.left||g.clientX>N.right||g.clientY<N.top||g.clientY>N.bottom)&&Ee.close()}),Ee?.addEventListener("keydown",g=>{!g.target.matches(".law-jump-input")||g.key!=="Enter"||(g.preventDefault(),Re(Ee,g.target.id))}),_e?.addEventListener("click",g=>{let A=g.target.closest('[data-action="open-law-source"]');if(A){Ue(A.dataset.lawKey||"",A.dataset.sourceType||"",A.dataset.articleNo||"");return}if(g.target.closest('[data-action="close-parquet-judgment"]')){_e.close();return}let N=_e.getBoundingClientRect();(g.clientX<N.left||g.clientX>N.right||g.clientY<N.top||g.clientY>N.bottom)&&_e.close()}),E.addEventListener("click",g=>{let A=g.target.closest(".rag-process-toggle");if(A){let J=A.closest(".rag-process"),fe=A.getAttribute("aria-expanded")==="true";ni(J,!fe);return}let N=g.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(N){if(N.dataset.action==="open-law-source"){Ue(N.dataset.lawKey||"",N.dataset.sourceType||"",N.dataset.articleNo||"");return}Me(N.dataset.jid||"")}}),E.addEventListener("keydown",g=>{if(g.key!=="Enter"&&g.key!==" ")return;let A=g.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!A||A.closest("a, button"))){if(g.preventDefault(),A.dataset.action==="open-law-source"){Ue(A.dataset.lawKey||"",A.dataset.sourceType||"",A.dataset.articleNo||"");return}Me(A.dataset.jid||"")}});let at=async(g,{fresh:A=!1,source:N="hero",replaceTurnElement:J=null}={})=>{let fe=g.trim();if(!fe){T("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),(N==="followup"?te:P).focus();return}Bt();let je=J instanceof HTMLElement&&E.contains(J)?J:null,De=je?Array.from(E.querySelectorAll(".rag-turn")).indexOf(je):null,xe=!!je?.querySelector("[data-rag-answer]")&&Number.isInteger(De)&&De>=0;!xe&&(A||!v)&&(b=null,p=[],E.innerHTML="",R());let dt=++y,nt=()=>a||dt!==y,qt=d;f=fe,lt(!0),rt(),xe||(N==="followup"?(te.value="",ht()):(P.value="",Ye()));let ut,Ce,mt="",Qe=null;xe?(ut=je,Ce=ut.querySelector("[data-rag-answer]"),mt=ut.outerHTML,Qe=s.get(ut)||null,Ke(ut,fe),ut.classList.remove("is-complete"),ut.classList.add("is-pending"),Ce.innerHTML=hl(fe,w),s.delete(ut)):{turnElement:ut,answerElement:Ce}=it(fe,hl(fe,w));let kt=w?null:kp(Ce);w?(es(null),h()):(ps(),es(null)),he(Y,!0,"\u6AA2\u7D22\u4E2D\u2026"),he(U,!0,"\u6AA2\u7D22\u4E2D\u2026");let wt=null,ot="",Gt=Ze=>{if(nt()||!Ze?.partial)return;let $t=Ce.querySelector(".answer-body");if(!$t)return;wt=Ze,ot=String(Ze.answer||""),$t.innerHTML=Ll(Ze),kt?.collapse?.();let St=Ce.querySelector(".answer-head-title");St&&(St.textContent=Ze.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},ts=Ze=>{if(nt()||!Ze||!wt?.streaming)return;ot+=Ze;let $t=Ce.querySelector("[data-partial-answer]");$t&&($t.textContent=ot)},Vt=()=>{if(nt()||!wt?.streaming)return;ot="";let Ze=Ce.querySelector("[data-partial-answer]");Ze&&(Ze.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")},ss=Ze=>{if(nt())return;let $t=Ce.querySelector(".answer-body");if(!$t)return;let St=$t.querySelector("[data-summary-queue]");St||(St=document.createElement("div"),St.className="answer-notice",St.dataset.summaryQueue="true",$t.appendChild(St));let Ms=Number(Ze.position||0),Xn=Number(Ze.eta_s||0),Rc=Ze.lane==="summary"?"\u6458\u8981":"\u6AA2\u7D22";St.textContent=`${Rc}\u6392\u968A\u4E2D\uFF1A\u524D\u9762 ${Ms} \u4F4D\uFF0C\u9810\u4F30\u7D04 ${Math.round(Xn)} \u79D2\u3002`};try{let Ze=w?await O.rag(fe,{testMode:w}):await O.ragStream(fe,{onStep:St=>{nt()||kt?.step(St)},onPartial:Gt,onQueued:ss,onToken:ts,onTokenReset:Vt});if(nt())return;ps();let $t=kt?.finish(!0,Ze)||"";if(Ce.innerHTML=wl(fe,Ze,$t),ut&&s.set(ut,fl(Ze)),ut?.classList.remove("is-pending"),ut?.classList.add("is-complete"),Ze.pipeline_flow||$p(Ze).then(()=>{if(nt()||!Ze.pipeline_flow)return;let St=Ce.querySelector(".answer-head");if(!St||St.querySelector(".rag-wf-card"))return;let Ms=Al(Ze);Ms&&St.insertAdjacentHTML("beforeend",Ms)}),Ze.test_run?.run_id?await _(Ze.test_run.run_id):es(null),await Kn(fe,Ze,qt,dt,{replaceIndex:De}),nt())return;tt()}catch(Ze){if(nt())return;if(ps(),xe&&mt){ut.outerHTML=mt;let $t=E.querySelectorAll(".rag-turn")[De];$t&&Qe&&s.set($t,Qe)}else{let $t=kt?.finish(!1)||"";Ce.innerHTML=Rp(Ze,$t,fe),ut?.classList.remove("is-pending"),ut?.classList.add("is-complete")}tt(),T(Ze.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{nt()||(ps(),he(Y,!1),he(U,!1))}},yt=null,vs=({restoreFocus:g=!0}={})=>{let A=yt;if(!A)return;yt=null;let{bubble:N,turnElement:J,originalQuestion:fe,width:je,maxWidth:De}=A;if(N&&(N.classList.remove("is-editing"),N.style.removeProperty("--rag-edit-width"),N.style.width=je,N.style.maxWidth=De,N.textContent=fe),g){let xe=J?.querySelector('[data-rag-question-action="edit"]');xe instanceof HTMLElement&&xe.focus({preventScroll:!0})}},ms=(g,A)=>{vs({restoreFocus:!1});let N=g?.querySelector(".rag-user-bubble");if(!N)return;let J=String(A||N.textContent||"").trim();if(!J)return;let fe=N.style.width,je=N.style.maxWidth,De=Math.max(160,N.getBoundingClientRect().width||0),xe=document.createElement("textarea");xe.className="rag-user-edit",xe.value=J,xe.rows=1,xe.setAttribute("aria-label","\u7DE8\u8F2F\u554F\u984C"),N.classList.add("is-editing"),N.style.setProperty("--rag-edit-width",`${De}px`),N.textContent="",N.appendChild(xe),yt={bubble:N,turnElement:g,textarea:xe,originalQuestion:J,width:fe,maxWidth:je};let dt=()=>{xe.style.height="auto",xe.style.height=`${xe.scrollHeight}px`};xe.addEventListener("input",dt),xe.addEventListener("keydown",async nt=>{if(nt.isComposing)return;if(nt.key==="Escape"){nt.preventDefault(),vs();return}if(nt.key!=="Enter"||nt.shiftKey)return;nt.preventDefault();let qt=xe.value.trim();if(!qt){T("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),xe.focus();return}if(Y.disabled||U.disabled){T("\u76EE\u524D\u4ECD\u5728\u6AA2\u7D22\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","warn");return}vs({restoreFocus:!1}),await at(qt,{fresh:!1,source:"inline_edit",replaceTurnElement:g})}),xe.addEventListener("blur",()=>{window.setTimeout(()=>{yt?.textarea===xe&&document.activeElement!==xe&&vs({restoreFocus:!1})},0)}),requestAnimationFrame(()=>{dt(),xe.focus({preventScroll:!0}),xe.select(),xe.setSelectionRange(0,xe.value.length)})};z.addEventListener("submit",g=>{g.preventDefault(),at(P.value,{fresh:!0,source:"hero"})}),H.addEventListener("submit",g=>{g.preventDefault(),at(te.value,{fresh:!1,source:"followup"})}),P.addEventListener("input",Ye),P.addEventListener("keydown",g=>{g.key==="Enter"&&!g.shiftKey&&!g.isComposing&&(g.preventDefault(),z.requestSubmit())}),te.addEventListener("input",ht),te.addEventListener("keydown",g=>{g.key==="Enter"&&!g.shiftKey&&!g.isComposing&&(g.preventDefault(),H.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",g=>{let A=g.target.closest("[data-question]");A&&(P.value=A.dataset.question,Ye(),z.requestSubmit())}),e.addEventListener("click",async g=>{let A=g.target.closest("[data-rag-question-action]"),N=g.target.closest("[data-rag-answer-action]");if(A||N){g.preventDefault(),g.stopPropagation();let J=A?A.dataset.ragQuestionAction:N.dataset.ragAnswerAction,fe=A||N,je=Number(g.detail||0)>0||!!window.matchMedia?.("(pointer: coarse)")?.matches,De=(nt=!1)=>{(nt||je)&&document.activeElement===fe&&fe.blur()},xe=String(fe?.dataset.question||"").trim(),dt=fe?.closest(".rag-turn");if(!xe||!dt)return;if(J==="feedback"){De(!0),fe.dataset.sentiment==="satisfied"?await oe(dt,{sentiment:"satisfied"}):st(dt);return}if(J==="copy"){try{let nt=A?xe:si(dt),qt=await js(nt);T(qt?A?"\u5DF2\u8907\u88FD\u554F\u984C\u3002":"\u5DF2\u8907\u88FD\u56DE\u7B54\u3002":"\u7121\u6CD5\u8907\u88FD\u3002",qt?"ok":"danger")}finally{De()}return}if(J==="share"){De(!0);try{await ai(At(dt,xe),A?"Judgment RAG \u63D0\u554F":"Judgment RAG \u56DE\u7B54")}finally{De(!0)}return}if(J==="edit"){ms(dt,xe);return}if(J==="reask"){if(Y.disabled){T("\u76EE\u524D\u4ECD\u5728\u6AA2\u7D22\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","warn");return}await at(xe,{fresh:!1,source:"followup"})}return}g.target.closest('[data-rag-action="refresh-models"]')&&await Ua()}),we.addEventListener("click",async g=>{let A=g.target.closest("[data-rag-toggle]");if(A){let xe=A.closest(".rag-library-section").classList.toggle("is-collapsed");A.setAttribute("aria-expanded",String(!xe));return}let N=g.target.closest("[data-rag-action]"),J=N?.dataset.ragAction||"";if(J==="new-chat"){ze();return}if(J==="open-history-menu"){pt(N,N.dataset.historyId);return}if(J==="toggle-pin"){await He(N.dataset.historyId);return}if(J==="select-project"){Q(N.dataset.projectId||"");return}if(J==="show-project-form"){ee();return}if(J==="cancel-project"){de();return}if(J==="more-recent"){u+=12,R();return}if(J==="clear-project"){Q("");return}let fe=g.target.closest("[data-history-open]");if(!fe)return;let je=n.find(De=>String(De.id)===String(fe.dataset.historyId));je&&(d=String(je.project_id||""),R(),!M(je)&&(b=null,p=[],at(je.title,{fresh:!0,source:"history"})))}),we.addEventListener("submit",async g=>{let A=g.target.closest('[data-rag-form="project"]');A&&(g.preventDefault(),await ve(A))}),G.addEventListener("click",g=>{let A=g.target.closest(".rag-mode-head");!A||g.target.closest("button, a")||(L=!L,A.closest(".rag-mode-card")?.classList.toggle("is-expanded",L),A.setAttribute("aria-expanded",String(L)))}),G.addEventListener("keydown",g=>{if(g.key!=="Enter"&&g.key!==" ")return;let A=g.target.closest(".rag-mode-head");A&&(g.preventDefault(),A.click())}),X.addEventListener("click",async g=>{let A=g.target.closest("[data-workspace-action]");if(!A)return;let N=A.dataset.workspaceAction;if(N==="friend-share"){g.preventDefault();let J=Number(g.detail||0)>0||!!window.matchMedia?.("(pointer: coarse)")?.matches;try{if(typeof navigator.share=="function")try{await navigator.share({title:"Judgment RAG Console",url:ml});return}catch(je){if(je?.name==="AbortError")return}let fe=await js(ml);T(fe?"\u5DF2\u8907\u88FD\u7DB2\u7AD9\u9023\u7D50\u3002":"\u7121\u6CD5\u5206\u4EAB\u7DB2\u7AD9\u9023\u7D50\u3002",fe?"ok":"danger")}finally{J&&A.blur()}return}if(N==="menu"){j.hidden?Nt():Bt();return}if(N==="share"){let J=Number(g.detail||0)>0||!!window.matchMedia?.("(pointer: coarse)")?.matches;J&&A.blur();try{await ha()}finally{J&&A.blur()}}}),j.addEventListener("click",async g=>{let A=g.target.closest("[data-workspace-menu-action]");if(!A)return;let N=A.dataset.workspaceMenuAction;if(N==="back"){Xs();return}let J=va();if(!J){Bt(),T("\u76EE\u524D\u6C92\u6709\u53EF\u7BA1\u7406\u7684\u5C0D\u8A71\u3002","warn");return}N==="rename"?(Bt(),await fa(J)):N==="pin"?(Bt(),await He(J.id)):N==="delete"?(Bt(),await za(J)):N==="move"?qs(J):N==="assign-project"&&(Bt(),await ba(J,A.dataset.projectId||""))}),ye.addEventListener("click",Vn),document.addEventListener("click",$a),document.addEventListener("keydown",Zs),window.addEventListener("scroll",Ut,{capture:!0,passive:!0}),window.addEventListener("resize",ae),B.addEventListener("click",async()=>{if(!n.length){T("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await $o(),await ya(),T("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),Ye(),await Promise.allSettled([Yn(),ya(),D(),Ga()]),await F();let bt=!1;if(t?.token&&(bt=await zt(t.token)),!bt){let g="",A="home";try{g=window.sessionStorage.getItem("judgment.pending_question")||"",window.sessionStorage.removeItem("judgment.pending_question")}catch{g=""}!g&&typeof window.__judgmentPendingQuestion=="string"&&(g=window.__judgmentPendingQuestion),delete window.__judgmentPendingQuestion,!g&&t?.question&&(g=t.question,A="share"),g=String(g||"").trim().slice(0,500),g&&P&&(P.value=g,Ye(),window.setTimeout(()=>{a||at(g,{fresh:!0,source:A})},40))}return()=>{a=!0,ps(),ae(),Se(),document.removeEventListener("click",$a),document.removeEventListener("keydown",Zs),window.removeEventListener("scroll",Ut,{capture:!0}),window.removeEventListener("resize",ae),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",wa),f&&E.setAttribute("data-last-question",f)}}var wi={};hs(wi,{clearUpdateConsumed:()=>gi,isUpdateConsumed:()=>Bn,markUpdateConsumed:()=>Bl,newRunVisible:()=>Dn,render:()=>Bm,workflowPanelMarkup:()=>sc});var di=new Set(["legal_index_versions","judgment_import","index_versions"]),jl=new Map,ui=new Set,pi=new Set;function Ca(e){let t=Number(e);if(!Number.isFinite(t)||t<0)return"\u2014";if(t<60)return`${Math.round(t)} \u79D2`;let s=Math.floor(t/60),a=Math.round(t%60);if(s<60)return`${s} \u5206 ${a} \u79D2`;let n=Math.floor(s/60),i=s%60;if(n<24)return`${n} \u5C0F\u6642 ${i} \u5206`;let o=Math.floor(n/24),l=n%24;return`${o} \u5929 ${l} \u5C0F\u6642`}function Dn(e,t=""){let s=e?.active_run?.id||e?.last_run?.id||"";return!!e?.active_run||!!(s&&s!==t)}function ci(e){return String(e||"").trim().replace(/:latest$/,"")}var Dp={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},partial:{label:"\u90E8\u5206\u5B8C\u6210",tone:"warn"},update:{label:"\u66F4\u65B0",tone:"warn"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u5B8C\u6210",tone:"ok"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"},provided:{label:"\u5916\u90E8\u63D0\u4F9B",tone:"info"}},mi=["download","parquet","postgres","qdrant"],Fp={download:"\u4E0B\u8F09",parquet:"Parquet",postgres:"PostgreSQL",qdrant:"Qdrant"},Bp={judgment:{download:["download"],parquet:["raw_parquet","extract"],postgres:["postgres"],qdrant:["qdrant"]},law:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]},order:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]}},Tl={complete:"\u5B8C\u6210",incomplete:"\u672A\u5B8C\u6210",pending:"\u5F85\u66F4\u65B0",processing:"\u8655\u7406\u4E2D",empty:"\u7121\u8CC7\u6599",not_applicable:"\u5DF2\u53D6\u4EE3"},El={complete:"is-green",incomplete:"is-red",pending:"is-pending",processing:"is-gray",empty:"is-empty",not_applicable:"is-empty"};var is=new Map,os="",Ps="",fi=new Set;function Bl(e){e&&fi.add(String(e))}function gi(e){e&&fi.delete(String(e))}function Bn(e){return fi.has(String(e))}var Nl={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},Rl={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Op={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"};var Fn={law_download:"law",order_download:"order",judgment_download:"judgment"},Hp={law:"law_download",order:"order_download",judgment:"judgment_download"},Cl={law_download:"\u6CD5\u898F\u4E0B\u8F09",order_download:"\u547D\u4EE4\u4E0B\u8F09",judgment_download:"\u5224\u6C7A\u4E0B\u8F09"},zp={law_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",order_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",judgment_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u5224\u6C7A RAR \u55CE\uFF1F\uFF08\u4E0D\u6703\u81EA\u52D5\u532F\u5165 PostgreSQL \u6216\u5EFA\u7ACB Qdrant \u7D22\u5F15\uFF09"},Up=new Set(["law_download","order_download","judgment_download","legal_index_versions","index_versions"]),Gp={law_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u6CD5\u898F RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",order_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u547D\u4EE4 RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",judgment_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u53EA\u4E0B\u8F09\u5224\u6C7A RAR\u3002PostgreSQL\uFF0FParquet \u532F\u5165\u8207 Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\u300C\u5224\u6C7A\u532F\u5165\u300D\u6216\u5B8C\u6574\u8CC7\u6599\u66F4\u65B0\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_import:"\u6D41\u7A0B\u7BC4\u570D\uFF1ARAR \u2192 \u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD \u2192 \u91D1\u878D\u6CD5\u898F\u7BE9\u9078 \u2192 PostgreSQL\u3002Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_parquet:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5F9E PostgreSQL \u532F\u51FA\u67E5\u8A62\u7528 Parquet \u5FEB\u7167\uFF1B\u4E0D\u5BEB\u5165 Qdrant\uFF0FIndexedDB\u3002",index_versions:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5EFA\u7ACB\u4E26\u9A57\u8B49\u65B0\u7684 Qdrant collection\uFF0C\u5B8C\u6210\u5F8C\u539F\u5B50\u5207\u63DB alias\uFF1BIndexedDB \u4E0D\u53C3\u8207\u3002"};function Is(e){return Dp[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Zt(e,t){let s=Is(e);return`<span class="badge ${Nl[s.tone]||Nl.idle}"><span class="status-dot ${Rl[s.tone]||Rl.idle}"></span>${r(t||s.label)}</span>`}function Et(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function Pl(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":c(e)}function Ol(e){return e&&e.color?String(e.color):"var(--accent)"}function bi(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return["skipped","pending","idle"].includes(e.status)?"\u2014":s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${Ie(s)} / ${Ie(a)}`:Ie(s):a?`${c(s)} / ${c(a)} ${t}`:`${c(s)} ${t}`}function Js(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${r(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function Qp(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},n=e.raw_backups||{},i=n.totals||{},o=e.state||{},l=e.capabilities||{},d=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",u=t.status==="operational",f=s.status==="operational",y=a.available!==!1,b=n.available!==!1,p=f?`${c(s.indexed)} / ${c(s.total)}`:Zt(s.status||"unavailable"),v=f?`${Et(s.percent)} \xB7 \u5C1A\u9918 ${c(s.remaining)} \u7B46`:r(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),w=y?`${c(a.unprocessed)} / ${c(a.total)}`:Zt("unavailable"),q=y?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${Ie(a.unprocessed_bytes)} \u5F85\u8655\u7406`:r(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${fs(im(e))}
    ${Js("\u8655\u7406\u72C0\u614B",Zt(e.status||"unknown"),`${r(d)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${Js("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",r(w),q)}
    ${Js("\u539F\u59CB\u8CC7\u6599\u5099\u4EFD",b?`${c(n.count)} \u6A94`:Zt("unavailable"),b?`\u5171 ${c(i.row_count)} \u7B46 \xB7 ${Ie(i.compressed_bytes)}`:r(n.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB\u8CC7\u6599\u5099\u4EFD\u3002"))}
    ${Js("PostgreSQL \u5224\u6C7A",u?c(t.judgment_count):Zt("unavailable"),u?`\u6CD5\u898F ${Pl(t.law_count)} \xB7 \u547D\u4EE4 ${Pl(t.order_count)}`:r(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${Js("Qdrant \u7D22\u5F15",p,v)}
    ${Js("\u72C0\u614B\u6A94",Zt(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${r($e(o.updated_at))}`:r(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${Js("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?r(l.start_blocked_reason):`\u672A\u8655\u7406 ${c(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${c(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${c(l.external_processes)} \u500B`:""}`)}
  </div>`}function Jp(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let n=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${r(o.color||"var(--accent)")}" title="${r(`${o.label} ${be(o.duration_ms)} (${Et(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${r(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${r(o.label)}</span>
        <span class="mono">${be(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${Et(o.percent)}</span>
        ${Zt(o.status)}
      </div>`).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section">
      <div class="processing-timeline-label">
        <span>${r(t.label||"\u968E\u6BB5\u8017\u6642")}</span>
        <span class="mono">\u7E3D\u8A08 ${be(t.total_ms)}</span>
      </div>
      <div class="processing-stack" role="img" aria-label="\u968E\u6BB5\u8017\u6642\u6BD4\u4F8B">${n}</div>
      <div class="processing-legend">${i}</div>
    </div>
  </section>`}function Wp(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let n=t.map(i=>{let o=s.get(i.branch)||Op[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${r(o)}</span>
          <strong>${r(i.title||"\u8655\u7406")}</strong>
          ${Zt(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${r($e(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?be(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${r(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${n}</div></div>
  </section>`}function Vp(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>Ge({tone:s.tone||"info",title:s.title,text:r(s.message||"")})).join("")}</div>`:""}function Hl(e,t){if(e==="law"||e==="order")return t==="qdrant"?"legal_index_versions":`${e}_download`;if(e==="judgment"){if(t==="download")return"judgment_download";if(t==="parquet"||t==="postgres")return"judgment_import";if(t==="qdrant")return"index_versions"}return""}function vi({month:e,year:t,monthNo:s,stageOrder:a,stageLabels:n,stageStatuses:i,overall:o,active:l,processing:d=!1,workflowForStage:u,stageProgress:f=null,variant:y="legacy"}){let b=i||{},p=y==="index"||y==="import",v=String(e?.month||`${t}${String(s).padStart(2,"0")}`),w=e?.month_label||`${t}-${String(s).padStart(2,"0")}`,q=j=>p&&j==="processing"?"\u57F7\u884C\u4E2D":Tl[j]||Tl.empty,k=j=>{let x=b[j]||"empty";if(!(x==="processing"||j==="qdrant"&&x==="incomplete"))return null;let H;if(typeof f=="function")H=f(j,v,x);else if(y==="import"&&f&&typeof f=="object")H=f[j];else return null;let te=Number(H);return Number.isFinite(te)?Math.max(0,Math.min(100,te)):null},S=a.map(j=>{let x=b[j]||"empty",E=k(j),H=j==="qdrant"&&x==="incomplete"&&E!==null&&E>0,te=H?"\u5DF2\u8655\u7406":q(x),U=!H&&E!==null&&E>0?` ${E.toFixed(1)}%`:"";return`${n[j]||j}\uFF1A${te}${U}`}).join(" \xB7 "),$=(e?.versions||[]).map(j=>j.version_code).filter(Boolean),L=[...new Set([...e?.files||[],...e?.local_files||[],...e?.imported_files||[]])].filter(Boolean),z=$.length?` \xB7 \u7248\u672C ${$.join("\u3001")}`:L.length?` \xB7 ${L.join("\u3001")}`:"",P=e?.detail?` \xB7 ${e.detail}`:"",Y=e?`${w} \xB7 ${S}${z}${P}`:`${w} \xB7 \u7121\u8CC7\u6599`,me=p?o==="empty"?"is-empty":"is-neutral":El[o]||"is-empty",X=a.map(j=>{let x=b[j]||"empty",E=x==="incomplete"||x==="pending"?u(j):"",H=E?"button":"span",te=E?` type="button" data-timeline-workflow="${r(E)}"`:"",U=k(j),ie=j==="qdrant"&&x==="incomplete"&&U!==null&&U>0,Te=x==="processing"&&U!==null?` ${U.toFixed(1)}%`:"",B=ie?"\u5DF2\u8655\u7406":q(x),we=x==="complete"?"is-complete":x==="processing"?"is-running":ie?"is-partial":x==="incomplete"?"is-incomplete":x==="pending"?"is-pending":"is-empty",ce=p?["index-month-block","processing-month-stage",`is-${j}`,we,E?"is-actionable":""]:["processing-month-stage",`is-${j}`,El[x]||"is-empty",we,E?"is-actionable":""],Oe=(x==="processing"||ie)&&U!==null?` style="--stage-progress:${U.toFixed(1)}%"`:"";return`<${H} class="${ce.filter(Boolean).join(" ")}"${te}${Oe} title="${r(`${n[j]||j}\uFF1A${B}${Te}${E?"\uFF08\u9EDE\u9078\u524D\u5F80\u8655\u7406\uFF09":""}`)}" aria-label="${r(`${w} ${n[j]||j} ${B}${Te}${E?"\uFF0C\u9EDE\u9078\u524D\u5F80\u8655\u7406":""}`)}"></${H}>`}).join("");return p?`<td class="judgment-month index-month index-month-are processing-month ${me}${l?" is-current":""}${d&&!l?" is-processing-current":""}" data-month="${r(v)}" title="${r(Y)}" aria-label="${r(Y)}"${l?' aria-current="true"':""}>
    <span class="index-month-number">${s}</span>
    <span class="index-month-blocks">${X}</span>
  </td>`:`<td class="judgment-month import-month processing-month${l?" is-current":""} is-${r(o)}" data-month="${r(v)}" title="${r(Y)}" aria-label="${r(Y)}"${l?' aria-current="true"':""}>
    <span class="processing-month-number">${s}</span>
    <span class="processing-month-stages">${X}</span>
  </td>`}function Kp(e,t,s,a,n){return vi({month:t,year:s,monthNo:a,stageOrder:mi,stageLabels:Fp,stageStatuses:t?.stages||{},overall:t?.overall||"empty",active:!!(t?.active||t?.overall==="processing"),workflowForStage:i=>Hl(e.key,i),stageProgress:n,variant:"index"})}function Yp(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=Number(s?.incomplete)||0,o=Number(s?.superseded)||0,l=a>0?(n+o)/a*100:null,d=["download","prepared","indexed"],u=0,f=0;for(let b of t){let p=b?.stages||{};for(let v of d){let w=p[v];!w||w==="empty"||w==="not_applicable"||(u+=1,w==="complete"&&(f+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(n),"\u5DF2\u5B8C\u6210 D\uFF0FP\uFF0FI \u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(i+(Number(s?.processing)||0)),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u5DF2\u53D6\u4EE3\u6708\u4EFD",c(o),"\u820A\u7248\u672C\u5DF2\u88AB\u76EE\u524D\u7248\u672C\u53D6\u4EE3\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",Et(l),"\u5B8C\u6210\u6216\u5DF2\u53D6\u4EE3\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c(f)} / ${c(u)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([b,p,v])=>`<span class="index-runtime-metric" title="${r(v)}"><span>${r(b)}</span><strong>${r(p)}</strong></span>`).join("")}</div>`}function Xp(e,t,s,a){let n=Number(e?.total_months)||t.length||0,i=Number(s?.complete)||0,o=Number(s?.incomplete)||0,l=Number(s?.processing)||0,d=Number(a?.gray)||0,u=n>0?i/n*100:null,f=0,y=0;for(let p of t){let v=p?.import_stages||{};for(let w of["extract","raw_parquet","filter","postgres"]){let q=v[w];!q||q==="empty"||(f+=1,q==="complete"&&(y+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(i),"\u56DB\u500B\u532F\u5165\u968E\u6BB5\u90FD\u5B8C\u6210\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(o+l),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\uFF08\u542B\u8655\u7406\u4E2D\uFF09\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",c(d),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(n),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",Et(u),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c(y)} / ${c(f)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([p,v,w])=>`<span class="index-runtime-metric" title="${r(w)}"><span>${r(p)}</span><strong>${r(v)}</strong></span>`).join("")}</div>`}function Zp(e,{titleSuffix:t="\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868"}={}){let s=`${r(e?.label||"\u6CD5\u898F\uFF0F\u547D\u4EE4")} ${r(t)}`,a=Array.isArray(e?.months)?e.months:[];if(!a.length)return`<section class="report-card processing-card import-files-card law-index-timeline-card">
      <div class="side-card-head">
        <span class="side-card-title">${m(e?.key==="order"?"file":"layers",14)}${s}</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u7121\u4E0B\u8F09\u7248\u672C\u6216\u7D22\u5F15\u7D00\u9304\u3002</div>
    </section>`;let n=new Map(a.map(b=>[String(b.month),b])),i=[...new Set(a.map(b=>b.year))].sort((b,p)=>String(p).localeCompare(String(b))),o=["download","prepared","indexed"],l=e.stage_labels||{download:"D \u4E0B\u8F09\u7248\u672C",prepared:"P \u8CC7\u6599\u5C31\u7DD2",indexed:"I \u7D22\u5F15\u8986\u84CB"},d=e.summary||{},u=e.current||{},f=i.map(b=>{let p=Array.from({length:12},(v,w)=>{let q=w+1,k=`${b}${String(q).padStart(2,"0")}`,S=n.get(k);return vi({month:S,year:b,monthNo:q,stageOrder:o,stageLabels:l,stageStatuses:S?.stages||{},overall:S?.overall||"empty",active:!!S?.active,workflowForStage:$=>$==="indexed"?"legal_index_versions":`${e.key}_download`,variant:"index"})}).join("");return`<tr><th scope="row">${r(b)}</th>${p}</tr>`}).join(""),y=u.month?`<div class="index-current-row">
        <span class="badge badge-info">${m("activity",11)}${r(u.label||"\u76EE\u524D\u7248\u672C")}</span>
        <strong class="mono">${r(u.month_label||On(u.month))}</strong>
        <span class="mono">${r(u.file||"\u2014")}</span>
        <span class="index-current-copy">${r(u.detail||"")}</span>
      </div>`:"";return`<section class="report-card processing-card import-files-card law-index-timeline-card" data-law-index-timeline="${r(e.key||"")}">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m(e.key==="order"?"file":"layers",14)}${s}</span>
      ${Yp(e,a,d)}
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(b,p)=>`<th scope="col">${p+1}</th>`).join("")}</tr></thead>
          <tbody>${f}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">D\uFF1A\u4E0B\u8F09\u7248\u672C\uFF1BP\uFF1Araw Parquet + PostgreSQL \u5C31\u7DD2\uFF1BI\uFF1Aactive \u7D22\u5F15\u8986\u84CB\uFF08\u7531\u6CD5\u898F\uFF0F\u547D\u4EE4\u7D22\u5F15\u6D41\u7A0B\u7DAD\u8B77\uFF09\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF0C\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u5B8C\u6210\u8272\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u6216\u5DF2\u53D6\u4EE3\u3002\u820A\u7248\u672C\u986F\u793A\u300C\u5DF2\u53D6\u4EE3\u300D\uFF0C\u4E0D\u9700\u91CD\u5EFA\u7D22\u5F15\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u7DE8\u865F\u3001\u4E0B\u8F09\u6642\u9593\u8207\u7B46\u6578\u3002</p>
    </div>
  </section>`}function em(e,t={}){let s=Array.isArray(e)?e:[];return s.length?`<div class="law-index-timelines">${s.map(a=>Zp(a,t)).join("")}</div>`:""}function zl({activeMonth:e,activeArchive:t,activePhase:s="",processingMonth:a="",processingArchive:n="",stageLabels:i={}}){if(!e||!t)return"";let o=`${String(e).slice(0,4)}-${String(e).slice(4,6)}`,l=i[s]||(s?"\u6E96\u5099\u4E2D":""),d=`${String(a||"").slice(0,4)}-${String(a||"").slice(4,6)}`,u=!!a&&(a!==e||n!==t);return`<span class="badge badge-info">${m("activity",11)}\u76EE\u524D\u532F\u5165</span>
    <strong class="mono">${r(o)}</strong>
    <span class="mono">${r(t)}</span>
    ${l?`<span class="badge badge-neutral">${r(l)}</span>`:""}
    ${u?`<span class="processing-current-processing">
            <span class="faint">\u8655\u7406\u4E2D</span>
            <strong class="mono">${r(d)}</strong>
            <span class="mono">${r(n||"\u2014")}</span>
          </span>`:""}`}function tm(e,t,s,a){let n=[];for(let i=1;i<=12;i+=1){let o=`${t}${String(i).padStart(2,"0")}`;n.push(Kp(e,s.get(o),t,i,a))}return`<tr><th scope="row">${t}</th>${n.join("")}</tr>`}function sm(e){let t=e?.models||{};return[["Embedding",t.embedding],["Rerank",t.rerank]].filter(([,s])=>s&&(s.label||s.model)).map(([s,a])=>{let n=a.label||[a.host,a.model].filter(Boolean).join(" ")||"\u2014",i=[`${s} \u4E3B\u6A5F\u8207\u6A21\u578B\uFF1A${n}`,a.url?`\u7AEF\u9EDE\uFF1A${a.url}`:"",s==="Rerank"&&a.enabled===!1?"RAG_RERANK_ENABLED=false":""].filter(Boolean).join(" \xB7 ");return`<span class="processing-timeline-model" title="${r(i)}">${s} <strong class="mono">${r(n)}</strong>${s==="Rerank"&&a.enabled===!1?' <span class="faint">\u672A\u555F\u7528</span>':""}</span>`}).join("")}function am(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=a>0?n/a*100:null,o=t.reduce((f,y)=>{let b=y?.stages||{};return f+mi.filter(p=>!!b[p]&&b[p]!=="empty"&&b[p]!=="not_applicable").length},0),l=t.reduce((f,y)=>{let b=y?.stages||{};return f+mi.filter(p=>b[p]==="complete").length},0),d=(Number(s?.incomplete)||0)+(Number(s?.processing)||0);return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(n),"\u5DF2\u5B8C\u6210\u5168\u90E8\u56DB\u500B\u968E\u6BB5\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(d),"\u4ECD\u6709\u81F3\u5C11\u4E00\u500B\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",c(s?.update||0),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",Et(i),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c(l)} / ${c(o)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([f,y,b])=>`<span class="index-runtime-metric" title="${r(b)}"><span>${r(f)}</span><strong>${r(y)}</strong></span>`).join("")}</div>`}function nm(e,t){let s=new Map((Array.isArray(e?.workflows)?e.workflows:[]).map(f=>[String(f.id||""),f])),a=t.key==="judgment"?"index_versions":"legal_index_versions",i=s.get(a)?.index_runtime||{},o=f=>{if(f==null||f==="")return null;let y=Number(f);return Number.isFinite(y)?Math.max(0,Math.min(100,y)):null},l=new Map((Array.isArray(i.months)?i.months:[]).map(f=>[String(f?.month||""),o(f?.percent)])),d=new Map(Object.entries(i.active_coverage||{}).map(([f,y])=>[String(f),o(y?.percent)])),u=(f,y)=>{let b=s.get(String(f||""));if(!b)return null;let p=b.progress||{},v=Array.isArray(p.stages)?p.stages:[];for(let w of y){let q=v.find(S=>String(S.key)===w),k=o(q?.percent);if(k!==null)return k}return o(p.percent)};return(f,y,b)=>{let p=String(y||"");if(f==="qdrant"){let q=l.get(p),k=d.get(p);if(b==="processing"){if(q!==null&&q>0)return q;if(k!==null&&k>0)return k}else return b==="incomplete"?q!==null&&q>0?q:k!==null&&k>0?k:0:null}let v=Hl(t.key,f);if(!v)return null;let w=(Bp[t.key]||{})[f]||[f];return u(v,w)}}function rm(e){let t=Array.isArray(e.file_timelines)?e.file_timelines:[];return t.length?`<div class="processing-timeline-overview">${t.map(s=>{let a=Array.isArray(s.months)?s.months:[],n=new Map(a.map(f=>[String(f.month||""),f])),i=[...new Set(a.map(f=>Number(f.year)))].filter(f=>Number.isFinite(f)).sort((f,y)=>y-f),o=s.summary||{},l=s.current||null,d=sm(s),u=nm(e,s);return`<section class="report-card processing-card import-files-card processing-timeline-card" data-processing-timeline="${r(s.key||"")}">
        <div class="side-card-head index-runtime-head">
          <span class="side-card-title">${m(s.icon||"activity",14)}${r(s.title||`${s.label||""}\u8655\u7406\u6642\u9593\u8868`)}</span>
          ${am(s,a,o)}
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
                    <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(f,y)=>`<th scope="col">${y+1}</th>`).join("")}</tr></thead>
                    <tbody>${i.map(f=>tm(s,f,n,u)).join("")}</tbody>
                  </table>
                </div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u3002</div>'}
          <p class="judgment-months-hint">${s.key==="judgment"?"\u5224\u6C7A\u4EE5\u88C1\u5224\u66F8\u6708\u4EFD\u986F\u793A\u3002":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u4EE5\u4F86\u6E90\u7248\u672C\u6708\u4EFD\u986F\u793A\u3002"}\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA\u4E0B\u8F09\u3001Parquet\u3001PostgreSQL\u3001Qdrant \u56DB\u500B\u968E\u6BB5\uFF1B\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF0CQdrant \u4E4B\u524D\u5DF2\u8655\u7406\u4F46\u5C1A\u672A\u5B8C\u6210\u6642\u4EE5\u5B8C\u6210\u8272\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u6216\u8272\u584A\u53EF\u67E5\u770B\u5404\u968E\u6BB5\u72C0\u614B\u8207\u9032\u5EA6\u3002</p>
        </div>
      </section>`}).join("")}</div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u8655\u7406\u6642\u9593\u8868\u3002</div>'}function im(e){return e.judgment_stats&&typeof e.judgment_stats=="object"?e.judgment_stats:{judgment_total:(e.raw_backups?.totals||{}).row_count,financial_total:(e.database||{}).judgment_count}}function Il(e,t=new Set){return`${Vp(e)}
    ${Qp(e)}
    ${rm(e)}
    ${Jp(e)}
    ${Wp(e)}`}function om(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${Ge({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:r(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${r($e(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${m("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}function lm(e,t){if(e.nodeType!==t.nodeType||e.nodeName!==t.nodeName){e.replaceWith(t.cloneNode(!0));return}if(e.nodeType===Node.TEXT_NODE){e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue);return}if(e.nodeType===Node.ELEMENT_NODE){for(let s of[...e.attributes])t.hasAttribute(s.name)||e.removeAttribute(s.name);for(let s of[...t.attributes])e.getAttribute(s.name)!==s.value&&e.setAttribute(s.name,s.value);t.hasAttribute("data-preserve-children")||Ul(e,t)}}function Ul(e,t){let s=[...e.childNodes],a=[...t.childNodes],n=Math.min(s.length,a.length);for(let i=0;i<n;i+=1)lm(s[i],a[i]);for(let i=n;i<s.length;i+=1)s[i].remove();for(let i=n;i<a.length;i+=1)e.appendChild(a[i].cloneNode(!0))}function Ss(e,t){let s=document.createElement("template");s.innerHTML=t,Ul(e,s.content)}var Gl={overview:"activity",law_download:"layers",order_download:"file",judgment_download:"download",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function cm(e){let s=(Array.isArray(e.workflows)?e.workflows:[]).map(n=>{let i=n.active_run||null,o=i||n.last_run||null;return{...n,activeRun:i,lastRun:o,status:i?i.status||"running":n.update_available&&!Bn(n.id)?"update":o?.status||"idle"}}),a=s.find(n=>n.id==="judgment_parquet");return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...s.filter(n=>n.id!=="judgment_parquet"),...a?[a]:[]]}function Pn(e,t){let s=cm(e),a=new Set(["law_download","judgment_download","normalize_courts"]);return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${s.map(n=>{let i=n.id===t,o=Gl[n.id]||"terminal",l=a.has(n.id)?'<div class="status-tab-divider" role="separator" aria-hidden="true"></div>':"",d=Number(n.pending_count)||0,u=n.update_available&&!Bn(n.id),f=Number(n.update_count)||(u?d:0),y=u&&f>0&&!n.activeRun,b=[n.update_message||`${n.update_origin||"\u66F4\u65B0\u5075\u6E2C"}\u627E\u5230 ${c(f)} \u9805\u53EF\u66F4\u65B0\u5167\u5BB9`,n.update_origin?`\u4F86\u6E90\uFF1A${n.update_origin}`:"",n.update_mechanism?`\u6A5F\u5236\uFF1A${n.update_mechanism}`:""].filter(Boolean).join(" \xB7 ");return`${l}<button class="status-tab${i?" is-active":""}" type="button"
            data-processing-workflow="${r(n.id)}"
            ${i?'aria-current="page"':""}>
            <span class="status-tab-icon">${m(o,15)}</span>
            <span class="status-tab-copy">
              <strong>${r(n.label)}</strong>
              <small>${r(n.description||"")}</small>
            </span>
            ${y?`<span class="badge badge-warn badge-mono processing-update-count" title="${r(b)}">${m(n.id==="judgment_import"?"download":"refresh",10)}${c(f)}</span>`:Zt(n.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${r(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function dm(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${Zt(e.status)}
      <span class="mono">${r(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${r($e(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${be(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${r(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${r(t.log_path)}</strong>`:""}
    </div>
  </div>`}function Pa(e){return`${e.year}-${String(e.month_no).padStart(2,"0")}`}function Ql(e){let t={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"},s=e.status||"red";return[Pa(e),t[s]||s,e.latest_fileset_id?`fileset ${e.latest_fileset_id}`:"",e.filename||"",e.local_filename&&e.local_filename!==e.filename?`\u672C\u6A5F\uFF1A${e.local_filename}`:""].filter(Boolean).join(" \xB7 ")}function Jl(e){if(!e.download_url)return"";let t=Pa(e);return`<a class="judgment-month-download" href="${r(Pt(Lt(e.download_url)))}" target="_blank" rel="noreferrer" title="\u4E0B\u8F09 ${t} \u5224\u6C7A" aria-label="\u4E0B\u8F09 ${t} \u5224\u6C7A">${m("download",11)}</a>`}function um(e){let t=e.status||"red";return`<td class="judgment-month is-${r(t)}" data-judgment-month-key="${r(Pa(e))}" title="${r(Ql(e))}"><span>${e.month_no}</span>${Jl(e)}</td>`}function pm(e){return e?.off_hours_enabled===!0}function Wl(e){return`\u7DA0\u8272\uFF1A\u6700\u65B0\u7248\u5DF2\u4E0B\u8F09\u5230 raw_rar\uFF1B\u7070\u8272\uFF1A\u672C\u6A5F\u4ECD\u662F\u820A\u7248\uFF0C\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u6703\u66F4\u65B0\uFF1B\u7D05\u8272\uFF1A\u8A72\u6708\u4EFD\u7F3A\u5C11\u5224\u6C7A\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u958B\u555F\u4E0B\u8F09\u9023\u7D50\uFF08${pm(e)?"\u975E API \u6642\u6BB5\u4E5F\u53EF\u4E0B\u8F09\uFF0C\u5EFA\u8B70\u4E00\u6B21\u53EA\u4E0B\u8F09\u4E00\u500B\u6A94\u6848":"\u4E0B\u8F09\u9023\u7D50\u50C5\u5728 00:00\u201306:00 API \u6642\u6BB5\u53EF\u7528"}\uFF09\u3002\u5F85\u88DC\u9F4A\u6708\u4EFD\u6703\u512A\u5148\u4E0B\u8F09\uFF0C\u5168\u90E8\u88DC\u9F4A\u5F8C\u624D\u7531\u6700\u65B0\u6708\u4EFD\u5F80\u56DE\u9A57\u8B49\u65E2\u6709\u6A94\u6848\uFF1B\u4E2D\u65B7\u7684\u4E0B\u8F09\u6703\u4FDD\u7559 .part\uFF0C\u4F3A\u670D\u5668\u652F\u63F4 Range \u6642\u7E8C\u50B3\uFF0C\u5426\u5247\u5F9E\u96F6\u91CD\u65B0\u4E0B\u8F09\u3002\u9996\u6B21\u5B8C\u6574\u540C\u6B65\u53EF\u80FD\u9700\u4E0B\u8F09\u6578\u767E\u500B\u6708\u4EFD\uFF0C\u9810\u8A2D\u975E\u6642\u6BB5\u4E5F\u53EF\u7E8C\u50B3\uFF1B\u56B4\u683C\u6A21\u5F0F\u6703\u5728 00:00\u201306:00 \u4EE5\u5916\u505C\u6B62\u3002`}var mm={completed:"\u5B8C\u6210",window_closed:"API \u6642\u6BB5\u7D50\u675F",deadline:"\u63A5\u8FD1 06:00\uFF0C\u4FDD\u7559\u5F85\u4E0B\u8F09\u6708\u4EFD",verification_window_closed:"API \u6642\u6BB5\u7D50\u675F\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",verification_deadline:"\u63A5\u8FD1 06:00\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",errors:"\u90E8\u5206\u6708\u4EFD\u4E0B\u8F09\u5931\u6557\uFF0C\u4E0B\u6B21\u91CD\u8A66",pending:"\u4ECD\u6709\u5F85\u4E0B\u8F09\u6708\u4EFD",check_only:"\u50C5\u6AA2\u67E5\uFF0C\u672A\u4E0B\u8F09",incremental:"\u589E\u91CF\u6AA2\u67E5\u5B8C\u6210",status_only:"\u50C5\u66F4\u65B0\u6708\u4EFD\u72C0\u614B",running:"\u57F7\u884C\u4E2D"};function hi(e){let t=e?.backfill||{},s=t.verification||{},a=t.last_run||{},n=Number(t.pending_count)||0,i=Number(t.failure_count)||0,o=String(t.resume_from_month||""),l="\u9A57\u8B49\uFF1A\u672A\u958B\u59CB";s.status==="completed"?l="\u9A57\u8B49\u5B8C\u6210":s.next_month?l=`\u9A57\u8B49\u7E8C\u50B3 ${s.next_month}`:s.status==="in_progress"&&(l="\u9A57\u8B49\u9032\u884C\u4E2D");let d=String(a.stop_reason||""),u=d?`\u4E0A\u6B21\u505C\u6B62\uFF1A${mm[d]||d}`:"";return{pending:n,failures:i,resume:o,verificationText:l,lastText:u}}function gm(e){let t=hi(e),s=t.pending>0?`\u5F85\u88DC\u9F4A ${c(t.pending)} \u500B\u6708${t.failures>0?`\uFF08${c(t.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708";return`<div class="judgment-backfill" data-judgment-backfill>
    <span class="badge ${t.pending>0?"badge-danger":"badge-ok"}" data-judgment-backfill-pending>${s}</span>
    <span class="badge badge-neutral" data-judgment-backfill-resume ${t.resume&&t.pending>0?"":"hidden"}>\u5F9E ${r(t.resume)} \u7E8C\u50B3</span>
    <span class="badge badge-info" data-judgment-backfill-verification>${r(t.verificationText)}</span>
    <span class="muted" data-judgment-backfill-last ${t.lastText?"":"hidden"}>${r(t.lastText)}</span>
  </div>`}function fm(e,t){let s=hi(t),a=e.querySelector("[data-judgment-backfill-pending]");a&&(a.textContent=s.pending>0?`\u5F85\u88DC\u9F4A ${c(s.pending)} \u500B\u6708${s.failures>0?`\uFF08${c(s.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708",a.classList.toggle("badge-danger",s.pending>0),a.classList.toggle("badge-ok",s.pending===0));let n=e.querySelector("[data-judgment-backfill-resume]");if(n){let l=!!s.resume&&s.pending>0;n.hidden=!l,n.textContent=l?`\u5F9E ${s.resume} \u7E8C\u50B3`:""}let i=e.querySelector("[data-judgment-backfill-verification]");i&&(i.textContent=s.verificationText);let o=e.querySelector("[data-judgment-backfill-last]");o&&(o.hidden=!s.lastText,o.textContent=s.lastText)}function $i(){return'<div class="judgment-months-loading"><span class="spinner"></span><span>\u8B80\u53D6\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B\u2026</span></div>'}function bm(e){if(e?.loading&&!e?.months?.length)return $i();if(e?.error&&!e?.months?.length)return Ge({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(e.error)});let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return'<div class="processing-empty">\u5C1A\u672A\u6709\u6708\u4EFD\u72C0\u614B\uFF1B\u8ACB\u5148\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u3002</div>';let s=new Map(t.map(o=>[Pa(o),o])),n=[...new Set(t.map(o=>o.year))].sort((o,l)=>l-o).map(o=>{let l=Array.from({length:12},(d,u)=>{let f=s.get(`${o}-${String(u+1).padStart(2,"0")}`);return f?um(f):`<td class="judgment-month is-empty"><span>${u+1}</span></td>`}).join("");return`<tr><th scope="row">${o}</th>${l}</tr>`}).join(""),i=e.summary||{};return`<div class="judgment-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" data-judgment-summary="green">\u6700\u65B0\u7248 ${c(i.green||0)}</span>
      <span class="badge badge-neutral" data-judgment-summary="gray">\u820A\u7248 ${c(i.gray||0)}</span>
      <span class="badge badge-danger" data-judgment-summary="red">\u7F3A\u5931 ${c(i.red||0)}</span>
      <span class="muted" data-judgment-total>\u5171 ${c(e.total_months||t.length)} \u500B\u6708</span>
    </div>
    ${gm(e)}
    <div class="judgment-months-scroll">
      <table class="judgment-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(o,l)=>`<th scope="col">${l+1}</th>`).join("")}</tr></thead>
        <tbody>${n}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint" data-judgment-hint>${r(Wl(e))}</p>
  </div>`}function vm(e,t){let s=Array.isArray(t?.months)?t.months:[],a=t.summary||{},n={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"};e.querySelectorAll("[data-judgment-summary]").forEach(l=>{let d=l.dataset.judgmentSummary||"";l.textContent=`${n[d]||d} ${c(a[d]||0)}`});let i=e.querySelector("[data-judgment-total]");i&&(i.textContent=`\u5171 ${c(t.total_months||s.length)} \u500B\u6708`),fm(e,t);let o=e.querySelector("[data-judgment-hint]");if(o){let l=Wl(t);o.textContent!==l&&(o.textContent=l)}for(let l of s){let d=Pa(l),u=e.querySelector(`[data-judgment-month-key="${d}"]`);if(!u)continue;let f=l.status||"red";u.classList.contains(`is-${f}`)||(u.classList.remove("is-green","is-gray","is-red","is-empty"),u.classList.add(`is-${f}`));let y=Ql(l);u.title!==y&&(u.title=y);let b=u.querySelector(".judgment-month-download");if(l.download_url){let p=Lt(l.download_url);b?b.getAttribute("href")!==p&&(b.href=p):u.insertAdjacentHTML("beforeend",Jl(l))}else b&&b.remove()}}function hm(e){let t=Array.isArray(e)?e:[];return t.length?`<div class="processing-workflow-history">
    ${t.map(s=>`<div class="processing-workflow-history-row">
          <span class="processing-workflow-history-status">${Zt(s.status||"idle")}</span>
          <span class="mono">${r($e(s.started_at))}</span>
          <span class="mono">${r(be(s.duration_ms||0))}</span>
          <span class="processing-workflow-history-message">${r(s.message||"\u2014")}</span>
        </div>`).join("")}
  </div>`:'<div class="processing-workflow-empty">\u5C1A\u7121\u57F7\u884C\u7D00\u9304\u3002</div>'}function $m(e){let t=Array.isArray(e.update_history)?e.update_history:[];if(!t.length)return'<div class="processing-workflow-empty">\u5C1A\u7121\u7248\u672C\u6AA2\u67E5\u7D00\u9304\u3002</div>';let s={up_to_date:["\u5DF2\u662F\u6700\u65B0","badge-ok"],update_available:["\u6709\u66F4\u65B0","badge-warn"],error:["\u6AA2\u67E5\u5931\u6557","badge-danger"]};return`<div class="processing-workflow-history">
    ${t.map(a=>{let[n,i]=s[a.status]||[a.status||"\u672A\u77E5","badge-neutral"],o=a.remote_content_length!=null?Ie(a.remote_content_length):"\u2014",l=a.local_version_id?`v${a.local_version_id}`:"\u2014";return`<div class="processing-workflow-history-row">
          <span class="badge ${i}">${r(n)}</span>
          <span class="mono">${r($e(a.checked_at))}</span>
          <span class="mono">\u9060\u7AEF ${r(o)}</span>
          <span class="mono">\u672C\u5730 ${r(l)}</span>
          <span class="processing-workflow-history-message">${r(a.message||"\u2014")}</span>
        </div>`}).join("")}
  </div>`}function Vl(e){let t=String(e.key||""),s=Is(e.status);return[`data-stage-key="${r(t)}"`,`data-stage-label="${r(e.label||t)}"`,`data-stage-color="${r(Ol(e))}"`,`data-stage-status-key="${r(e.status||"idle")}"`,`data-stage-status="${r(s.label)}"`,`data-stage-percent="${r(Et(e.percent))}"`,`data-stage-counts="${r(bi(e))}"`,`data-stage-duration="${r(Ws(e.duration_ms||0))}"`,`data-stage-contribution="${r(Et(e.contribution_percent))}"`,`data-stage-message="${r(e.message||"")}"`].join(" ")}function ym(e,t=Date.now()){let s=String(e.status||"idle"),a=Number(e.duration_ms)||0,n=Date.parse(e.started_at||"");if(s==="running"&&Number.isFinite(n))return Math.max(a,t-n);if(a>0)return a;let i=Date.parse(e.finished_at||"");return Number.isFinite(n)&&Number.isFinite(i)?Math.max(0,i-n):0}function Kl(e){if(e.key!=="filter")return null;let t=Number(e.financial_processed),s=Number(e.financial_matched);return e.financial_processed===null||e.financial_processed===void 0||!Number.isFinite(t)||!Number.isFinite(s)||t<=0?null:{processed:t,matched:s,percent:Math.round(s/t*100)}}function wm(e){let t=String(e.status||"idle"),s=[],a=Number(e.total);if(e.key==="postgres"&&["success","no_change"].includes(t)&&Number.isFinite(a)&&a>0)s.push(`\u7E3D\u8A08 ${c(a)} \u7B46`);else{let i=bi(e);i!=="\u2014"&&s.push(i)}let n=Kl(e);return n&&s.push(`\u91D1\u878D\u4F54\u6BD4 ${n.percent}%`),s.join(" \xB7 ")}function _m(e,t){let s=String(e.status||"idle"),a=[],n=(d,u,{always:f=!1}={})=>{let y=u==null?"":String(u).trim();!f&&!y||a.push(`<span class="rag-wf-detail"><span>${r(d)}</span><strong>${r(y||"\u2014")}</strong></span>`)};n("\u72C0\u614B",Is(s).label,{always:!0}),n("\u958B\u59CB",e.started_at?$e(e.started_at):"\u2014",{always:!0}),n("\u7D50\u675F",e.finished_at?$e(e.finished_at):"\u2014",{always:!0}),n("\u8017\u6642",t,{always:!0}),n("\u9032\u5EA6",Et(e.percent),{always:!0});let i=bi(e),o=["extract","raw_parquet"].includes(String(e.key||""));n(o?"\u7D2F\u8A08\u8CC7\u6599\u91CF":"\u8CC7\u6599\u91CF",i!=="\u2014"?i:"");let l=Kl(e);return l&&(n("\u91D1\u878D\u6848\u4EF6",`${c(l.matched)} \u7B46`),n("\u5168\u90E8\u6848\u4EF6",`${c(l.processed)} \u7B46`),n("\u91D1\u878D\u4F54\u6BD4",`${l.percent}%`)),n("\u6574\u9AD4\u5360\u6BD4",Et(e.contribution_percent)),s==="failed"||s==="stale"?(n("\u539F\u56E0",e.error||e.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002"),n("\u5EFA\u8B70",e.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002")):n("\u8AAA\u660E",e.message),a.join("")}function km(e){let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${m("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A host/model\u3001Blue-Green \u5EFA\u7F6E\u8207\u5404\u968E\u6BB5\u9032\u5EA6\u3002</div>
    </section>`;let a=new Map(s.map(ae=>[String(ae.key||""),ae])),n=a.get("ollama")||{},i=a.get("qdrant")||{},o=a.get("validate")||{},l=e.index_runtime||{},d=l.summary||{},u=l.copy||{},f=Number(l.index_prior_duration_ms||0),y=l.current||{},b=l.embedding||{},p=b.selected||{},v=b.active||{},w=Number(l.expected_count||d.total||i.total||0),q=Number(d.indexed??i.current??0),k=w>0?Math.min(100,q/w*100):i.status==="success"?100:0,S=Number(u.total||0),$=Number(u.copied||0),L=S>0?Math.min(100,$/S*100):u.status==="success"?100:0,z=String(l.build_mode||""),P=String(t.run_status||""),Y=!!P&&!["running","success","no_change"].includes(P),me=String(u.status||(z==="reuse"?"pending":"skipped"));Y&&me==="pending"&&(me="stale");let X=Number(u.duration_ms||0)/1e3,j=X>0?$/X:0,x=me==="running"&&j>0&&S>$?(S-$)/j:null,E=Zl(e,l,q),H=tc(l,q,w,E),te=H?.remainingMs&&H.remainingMs>0?H.remainingMs/1e3:null,U=me==="success"||me==="skipped"||q>0||i.status==="success",ie=i.status==="success"?"success":U&&i.status||"pending",Te=String(o.status||"pending"),B=Te==="success"&&/alias 已切換/.test(String(o.message||"")),we=B?"success":Te==="failed"?"failed":P==="running"?"pending":"skipped",ce=l.version_id?`v${String(l.version_id).padStart(3,"0")}`:"\u2014",Le=v.host||p.host||v.url||p.url||"\u2014",Oe=v.port||p.port,Ne=Oe?`${Le}:${Oe}`:String(Le),et=v.model||p.model||l.model||"\u2014",ue=U&&y.month?`${On(y.month)}${y.preparing?"\uFF08\u6E96\u5099\u4E2D\uFF09":""}`:t.run_status==="running"?"\u6E96\u5099\u4E2D":"\u2014",re=String(y.phase||"")==="embedding"?"E \u65B0 embedding":String(y.phase||"")==="reuse"?"R \u91CD\u7528":"\u2014",qe=(()=>{let ae=Number(i.duration_ms)||0,it=Date.parse(i.started_at||"");if(i.status==="running"&&Number.isFinite(it))return Math.max(ae,Date.now()-it);if(ae>0)return ae;let Ke=Date.parse(i.finished_at||"");return Number.isFinite(it)&&Number.isFinite(Ke)?Math.max(0,Ke-it):0})(),ye=[{key:"probe",label:"llama-server \u4E3B\u6A5F\uFF0F\u6A21\u578B\u6E2C\u8A66",caption:"\u4E3B\u6A5F\uFF0F\u6A21\u578B\u3001\u9023\u7DDA\u6E2C\u8A66",color:"#22c55e",status:n.status||"pending",percent:Number(n.percent)||0,current:Number(n.current)||0,total:Number(n.total)||0,unit:"\u53F0",duration_ms:n.duration_ms,started_at:n.started_at,finished_at:n.finished_at,extraDetails:[["\u4E3B\u6A5F",Ne],["\u6A21\u578B",et],["\u6E2C\u8A66\u4E3B\u6A5F",`${c(n.current||0)} / ${c(n.total||0)} \u53F0`]],detail:`${c(n.current||0)} / ${c(n.total||0)} \u53F0 \xB7 ${Ne} \xB7 ${et}`},{key:"version",label:"\u5EFA\u7ACB\uFF0F\u63A5\u7E8C Blue-Green \u7248\u672C",caption:"Blue-Green \u7248\u672C\u3001collection",color:"#06b6d4",status:l.version_id?"success":"pending",percent:l.version_id?100:0,current:l.version_id?1:0,total:1,unit:"\u968E\u6BB5",duration_ms:l.version_duration_ms,started_at:null,finished_at:null,extraDetails:[["\u7248\u672C",ce],["Collection",l.collection||"\u2014"],["\u6A21\u5F0F",z||"\u2014"]],detail:`${ce} \xB7 ${l.collection||"\u2014"} \xB7 ${z||"\u2014"}`},{key:"copy",label:"\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF",caption:"\u820A collection \u5411\u91CF\u8907\u88FD",color:"#f59e0b",status:me,percent:L,current:$,total:S,unit:"points",duration_ms:u.duration_ms,started_at:u.started_at,finished_at:u.finished_at,extraDetails:[["\u5DF2\u8907\u88FD",`${c($)} points`],["\u7E3D points",c(S)],["\u7BC4\u570D","\u5168\u57DF points\uFF1B\u4E0D\u5217\u5165\u6708\u4EFD R\uFF0FE"],["\u8907\u88FD\u901F\u5EA6",j>0?`${j.toFixed(1)} points/\u79D2`:"\u2014"],u.resumed?["\u4F86\u6E90",`\u7E8C\u8DD1\u524D\u5B8C\u6210${u.resumed_from_run_id?`\uFF08${u.resumed_from_run_id}\uFF09`:""}`]:null,["\u9810\u4F30\u5269\u9918",x!==null?Ca(x):"\u2014"]],detail:S>0?`${c($)} / ${c(S)} points \xB7 \u820A collection \u5411\u91CF${u.resumed?" \xB7 \u7E8C\u8DD1\u524D\u5B8C\u6210":""}`:me==="skipped"?"\u672C\u6B21\u4E0D\u9700\u8907\u88FD\u820A\u5411\u91CF":me==="stale"?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5B8C\u6210\u8907\u88FD":"\u7B49\u5F85\u820A collection \u8907\u88FD"},{key:"index",label:"\u91D1\u878D\u5224\u6C7A\u5411\u91CF\u7D22\u5F15",caption:"R \u85CD\uFF0FE \u7D2B\uFF1B\u672C\u6B21 run \u9032\u5EA6",color:"#a78bfa",barColor:re==="E \u65B0 embedding"?"#a78bfa":re==="R \u91CD\u7528"?"#3b82f6":"",status:ie,phaseKey:re==="R \u91CD\u7528"?"reuse":re==="E \u65B0 embedding"?"embedding":"",phaseLabel:ie==="running"?re:"",percent:k,current:q,total:w,unit:"\u7B46",duration_ms:U?i.duration_ms:0,extraDurationMs:f,started_at:U?i.started_at||l.started_at:null,finished_at:i.finished_at,extraDetails:[["\u5DF2\u7D22\u5F15",`${c(q)} / ${c(w)} \u7B46`],f>0?["\u524D\u6B21\u57F7\u884C",Ws(f)]:null,f>0?["\u672C\u6B21\u57F7\u884C",Ws(qe)]:null,["\u91CD\u7528",c(d.reused)],["\u65B0 embedding",c(d.embedded)],["\u76EE\u524D\u6708\u4EFD",ue],["\u76EE\u524D\u6279\u6B21",re],["\u672C\u6279 R\uFF0FE",`R ${c(y.reused||0)} \xB7 E ${c(y.embedded||0)}`],["R \u5B9A\u7FA9","04 \u9010\u6708\u6383\u63CF\u6CBF\u7528\uFF1B03 \u8907\u88FD\u70BA\u5168\u57DF points"],["\u9810\u4F30\u5269\u9918",U&&te!==null?Ca(te):"\u2014"]],htmlDetails:Mm(l),detail:U?`${c(q)} / ${c(w)} \u7B46 \xB7 \u91CD\u7528 ${c(d.reused)} \xB7 \u65B0 embedding ${c(d.embedded)}${re==="\u2014"?"":` \xB7 ${re}`}`:"\u7B49\u5F85\u7248\u672C\u6E96\u5099\uFF08\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF\uFF09\u5B8C\u6210"},{key:"validate",label:"\u9A57\u8B49\u65B0\u7248\u672C",caption:"\u7B46\u6578\u3001\u7DAD\u5EA6\u3001payload",color:"#eab308",status:Te,percent:Te==="success"?100:0,current:null,total:null,duration_ms:o.duration_ms,started_at:o.started_at,finished_at:o.finished_at,extraDetails:[["\u9A57\u8B49\u8A0A\u606F",o.message||"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210"]],detail:o.message||(Y?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u9032\u884C\u9A57\u8B49\u3002":"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210\u5F8C\u9A57\u8B49\u7B46\u6578\u3001\u7DAD\u5EA6\u8207 payload\u3002")},{key:"activate",label:"\u5207\u63DB alias",caption:"judgments_current alias",color:"#3b82f6",status:we,percent:B?100:0,current:null,total:null,duration_ms:0,started_at:null,finished_at:null,extraDetails:[["\u76EE\u6A19 alias","judgments_current"]],detail:B?o.message:Y?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5207\u63DB alias\u3002":"\u9A57\u8B49\u901A\u904E\u5F8C\u5207\u63DB judgments_current\u3002"}],_e=ye.filter(ae=>ae.status!=="skipped"),Ee=_e.length?_e.reduce((ae,it)=>ae+it.percent,0)/_e.length:0,C=ye.filter(ae=>ae.status==="success").length,G=Et(Ee),V=Date.now(),I=ae=>{let it=Number(ae.extraDurationMs)||0,Ke=Number(ae.duration_ms)||0,ft=Date.parse(ae.started_at||"");if(ae.status==="running"&&Number.isFinite(ft))return it+Math.max(Ke,V-ft);if(Ke>0)return it+Ke;let Mt=Date.parse(ae.finished_at||"");return it+(Number.isFinite(ft)&&Number.isFinite(Mt)?Math.max(0,Mt-ft):0)},W=ye.map(ae=>{let it=I(ae);return{...ae,computedDuration:it,drawable:!["skipped","pending"].includes(ae.status)}}),K=Math.max(W.reduce((ae,it)=>ae+(it.drawable?it.computedDuration:0),0),Number(t.duration_ms)||0,1),ke=1.25,Fe=W.map(ae=>ae.drawable?Math.max(ae.computedDuration/K*100,ke):0),Ye=Fe.reduce((ae,it)=>ae+it,0),ht=Ye>100?100/Ye:1,lt=0,rt=W.map((ae,it)=>{let Ke=Fe[it]*ht,ft=Ke>0?{start:lt,width:Ke}:null;return ft&&(lt+=Ke),{...ae,bar:ft}}).map((ae,it)=>{let Ke=[`is-${ae.status}`,ae.status==="failed"||ae.status==="stale"?"is-error":"",["pending","skipped"].includes(ae.status)?"is-missing":"",ae.status==="running"?"is-running":""].filter(Boolean).join(" "),ft=["pending","skipped"].includes(ae.status)?"\u2014":Ws(ae.computedDuration),Mt=ae.status==="running"?` \xB7 ${Et(ae.percent)}`:"",oe=ae.phaseLabel?`<span class="index-wf-phase is-${r(ae.phaseKey||"unknown")}">${r(ae.phaseLabel)}</span>`:"",Se="";if(ae.bar){let At=Math.max(0,Math.min(100,ae.bar.start)),M=Math.max(0,Math.min(100-At,ae.bar.width)),R=ae.status==="success"?100:Math.max(0,Math.min(100,Number(ae.percent)||0)),D=M*R/100,Q=M-D,ee=r(ae.barColor||ae.color);D>0&&(Se+=`<span class="rag-wf-bar index-wf-bar is-sequential" style="left:${At.toFixed(3)}%;width:${D.toFixed(4)}%;top:0;height:12px;--bar-color:${ee}" aria-hidden="true"></span>`),Q>1e-4&&(Se+=`<span class="rag-wf-bar index-wf-bar is-hollow is-sequential" style="left:${(At+D).toFixed(3)}%;width:${Q.toFixed(4)}%;top:0;height:12px;--bar-color:${ee}" aria-hidden="true"></span>`)}let st=[],Je=(At,M)=>{M==null||M===""||st.push(`<span class="rag-wf-detail"><span>${r(At)}</span><strong>${r(String(M))}</strong></span>`)};Je("\u72C0\u614B",Is(ae.status).label),Je("\u958B\u59CB",ae.started_at?$e(ae.started_at):"\u2014"),Je("\u7D50\u675F",ae.finished_at?$e(ae.finished_at):"\u2014"),Je("\u8017\u6642",ft),Je("\u9032\u5EA6",Et(ae.percent));for(let At of ae.extraDetails||[]){if(!At)continue;let[M,R]=At;Je(M,R)}Je("\u8AAA\u660E",ae.detail);let zt={...ae,duration_ms:ae.computedDuration,contribution_percent:_e.length?(Number(ae.percent)||0)/_e.length:null,message:ae.detail};return`<details class="rag-wf-stage index-wf-stage ${Ke}" data-index-stage="${r(ae.key)}"${ui.has(ae.key)?" open":""} style="--stage-color:${r(ae.color)}" ${Vl(zt)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="index-wf-step">${String(it+1).padStart(2,"0")}</span> ${r(ae.label)}</strong><small>${r(ae.caption||"")}</small></span>
            </span>
            <span class="rag-wf-stage-meta">${r(ft)}${r(Mt)}${oe?` \xB7 ${oe}`:""} \xB7 ${r(Is(ae.status).label)} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px">${Se}</span>
        </summary>
        <div class="rag-wf-details">${st.join("")}${ae.htmlDetails||""}</div>
      </details>`}).join("");return`<section class="report-card processing-card processing-workflow-progress-card index-wf-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${m("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
      <span class="badge ${t.run_status==="running"?"badge-info":"badge-neutral"}">${c(C)} / ${c(_e.length)} \u968E\u6BB5</span>
    </div>
    <div class="index-wf-summary">
      <span>\u6574\u9AD4 <strong class="mono">${G}</strong></span>
      <span>\u7248\u672C <strong class="mono">${r(ce)}</strong></span>
      <span>Collection <strong class="mono">${r(l.collection||"\u2014")}</strong></span>
      <span>\u6A21\u5F0F <strong>${r(z||"\u2014")}</strong></span>
      <span>Host <strong class="mono">${r(Ne)}</strong></span>
      <span>Model <strong class="mono">${r(et)}</strong></span>
      <span>\u76EE\u524D <strong>${r(ue)}</strong></span>
    </div>
    <div class="index-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${K>0?r(Ws(K)):"\u2014"}</span>
      </div>
      <div class="rag-wf-legend index-wf-are-legend" aria-label="\u5224\u6C7A\u7D22\u5F15 R\uFF0FE \u984F\u8272\u5716\u4F8B">
        <span><i class="is-reuse"></i>R \u672C\u6B21\u6CBF\u7528\uFF0804 \u85CD\uFF09</span>
        <span><i class="is-embed"></i>E \u65B0 embedding\uFF0804 \u7D2B\uFF09</span>
        <span><i class="is-hollow"></i>04 \u672A\u5B8C\u6210\uFF0825% \u6DFA\u8272\uFF09</span>
      </div>
      <div class="rag-wf-stages">${rt}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7684\u7D50\u675F\u5373\u4E0B\u4E00\u968E\u6BB5\u7684\u958B\u59CB\uFF1B\u5DF2\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u9032\u884C\u4E2D\u6216\u672A\u5B8C\u6210\u968E\u6BB5\u53EA\u8457\u8272\u5DF2\u5B8C\u6210\u6BD4\u4F8B\uFF0C\u5176\u9918\u672A\u5B8C\u6210\u5340\u6BB5\u4EE5\u540C\u8272 25% \u6DFA\u8272\u8868\u793A\uFF0C\u7B49\u5F85\u968E\u6BB5\u4FDD\u7559\u7A7A\u5FC3\u8ECC\u9053\u3001\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\u3002\u6975\u77ED\u968E\u6BB5\u6703\u4EE5\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u5448\u73FE\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u9032\u5EA6\u8207\u8A73\u7D30\u6578\u64DA\u3002</p>
    </div>
    <div class="index-wf-overall">
      <div class="index-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${G}</span>
      </div>
      <div class="index-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,Ee)).toFixed(1)}%"></span>
      </div>
    </div>
  </section>`}function Sm(e){if(e.id==="index_versions")return km(e);let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${m("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u5404\u968E\u6BB5\u8207\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </section>`;let a=Date.now(),n=s.map(B=>{let we=String(B.status||"idle");return{...B,status:we,computedDuration:ym(B,a),drawable:!["pending","skipped","idle"].includes(we)}}),i=n.filter(B=>B.status!=="skipped"),o=n.filter(B=>B.drawable).reduce((B,we)=>B+we.computedDuration,0),l=Math.max(o,Number(t.duration_ms)||0,1),d=n.some(B=>B.computedDuration>0),u=1.25,f=n.map(B=>B.drawable?Math.max(B.computedDuration/l*100,u):0),y=f.reduce((B,we)=>B+we,0),b=y>100?100/y:1,p=0,v=n.map((B,we)=>{let ce=f[we]*b,Le=B.drawable?{start:p,width:ce}:null;return Le&&(p+=ce),{...B,bar:Le}}),w=n.filter(B=>["success","no_change"].includes(B.status)).length,q=n.find(B=>B.status==="running"),k=n.filter(B=>B.status==="running").length,S=n.filter(B=>["pending","idle"].includes(B.status)).length,$=n.filter(B=>B.status==="skipped").length,L=i.length||Number(t.total_stages)||0,z=t.overall_percent,P=z==null||z===""?null:Number(z),Y=Number.isFinite(P)?Et(P):"\u2014",me=d?Ws(l):"\u2014",X=String(t.run_status||""),j=X?Is(X).label:"\u2014",x=q&&(q.label||q.key)||"\u2014",E=n.map(B=>Date.parse(B.started_at||"")).filter(B=>Number.isFinite(B)),H=n.map(B=>Date.parse(B.finished_at||"")).filter(B=>Number.isFinite(B)),te=E.length?new Date(Math.min(...E)).toISOString():null,U=q?null:H.length?new Date(Math.max(...H)).toISOString():null,ie=v.map((B,we)=>{let ce=B.status,Le=["failed","stale","interrupted"].includes(ce),Oe=[`is-${ce}`,Le?"is-error":"",["pending","skipped","idle"].includes(ce)?"is-missing":"",ce==="running"?"is-running":""].filter(Boolean).join(" "),Ne=B.drawable?Ws(B.computedDuration):"\u2014",et=Is(ce).label,ue=ce==="failed"?`\u539F\u56E0\uFF1A${String(B.error||B.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002").trim()}
\u5EFA\u8B70\uFF1A${String(B.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002").trim()}`:"",re=ue?`<span class="badge badge-danger is-failure-tip" tabindex="0" aria-label="${r(ue)}" data-failure-tip="${r(ue)}"><span class="status-dot is-danger"></span>\u5931\u6557</span>`:r(et),qe=Ol(B),ye=Le?"var(--danger)":qe,_e=ce==="running"?` \xB7 ${Et(B.percent)}`:"",Ee="";if(B.bar){let K=Math.max(0,Math.min(100,B.bar.start)),ke=Math.max(0,Math.min(100-K,B.bar.width)),Fe=["success","no_change"].includes(ce)?100:Math.max(0,Math.min(100,Number(B.percent)||0)),Ye=ke*Fe/100,ht=ke-Ye;Ye>0&&(Ee+=`<span class="rag-wf-bar workflow-wf-bar is-sequential" style="left:${K.toFixed(3)}%;width:${Ye.toFixed(4)}%;top:0;height:12px;--bar-color:${r(ye)}" aria-hidden="true"></span>`),ht>1e-4&&(Ee+=`<span class="rag-wf-bar workflow-wf-bar is-hollow is-sequential" style="left:${(K+Ye).toFixed(3)}%;width:${ht.toFixed(4)}%;top:0;height:12px;--bar-color:${r(ye)}" aria-hidden="true"></span>`)}let C=B.label||B.key||"\u968E\u6BB5",G=wm(B),V=`${C}\uFF1A${et}\uFF0C${ce==="running"?`\u9032\u5EA6 ${Et(B.percent)}\uFF0C`:""}\u8017\u6642 ${Ne}`,I={...B,duration_ms:B.computedDuration,message:ue||B.message||G||""},W=`${e.id}:${B.key||we}`;return`<details class="rag-wf-stage workflow-wf-stage ${Oe}" data-workflow-wf-stage="${r(W)}"${pi.has(W)?" open":""} style="--stage-color:${r(qe)}" ${Vl(I)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="workflow-wf-step">${String(we+1).padStart(2,"0")}</span> ${r(C)}</strong>${G?`<small>${r(G)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(Ne)}${r(_e)} \xB7 ${re} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(V)}">${Ee}</span>
        </summary>
        <div class="rag-wf-details">${_m(B,Ne)}</div>
      </details>`}).join(""),Te=Gp[e.id]||"";return`<section class="report-card processing-card processing-workflow-progress-card workflow-wf-card" data-workflow-progress>
    <div class="side-card-head index-runtime-head workflow-wf-head">
      <span class="side-card-title">${m("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
      <div class="index-runtime-metrics workflow-wf-metrics">
        <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u5168\u90E8\u968E\u6BB5\u7684\u6578\u91CF\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${w} / ${L}</strong></span>
        <span class="index-runtime-metric" title="\u76EE\u524D\u57F7\u884C\u4E2D\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u57F7\u884C\u4E2D</span><strong>${k}</strong></span>
        <span class="index-runtime-metric" title="\u5C1A\u672A\u958B\u59CB\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7B49\u5F85</span><strong>${S}</strong></span>
        <span class="index-runtime-metric" title="\u672C\u6B21\u6D41\u7A0B\u4E0D\u9700\u8981\u57F7\u884C\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7565\u904E</span><strong>${$}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u968E\u6BB5\u8017\u6642\u5408\u8A08\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(me)}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u53C3\u8207\u968E\u6BB5\u5B8C\u6210\u6BD4\u4F8B\u7684\u5E73\u5747\u3002"><span>\u6574\u9AD4\u9032\u5EA6</span><strong>${Y}</strong></span>
      </div>
    </div>
    <div class="workflow-wf-summary">
      <span>\u57F7\u884C <strong>${r(j)}</strong></span>
      <span>\u958B\u59CB <strong>${te?r($e(te)):"\u2014"}</strong></span>
      <span>\u7D50\u675F <strong>${q?"\u9032\u884C\u4E2D":U?r($e(U)):"\u2014"}</strong></span>
      <span>\u76EE\u524D <strong>${r(x)}</strong></span>
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
      <div class="rag-wf-stages">${ie}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7684\u7D50\u675F\u5373\u4E0B\u4E00\u968E\u6BB5\u7684\u958B\u59CB\uFF1B\u5DF2\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u57F7\u884C\u4E2D\u6216\u672A\u5B8C\u6210\u968E\u6BB5\u53EA\u8457\u8272\u5DF2\u5B8C\u6210\u6BD4\u4F8B\uFF0C\u5176\u9918\u672A\u5B8C\u6210\u5340\u6BB5\u4EE5\u540C\u8272 25% \u6DFA\u8272\u8868\u793A\uFF0C\u7B49\u5F85\u968E\u6BB5\u4FDD\u7559\u7A7A\u5FC3\u8ECC\u9053\u3001\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\u3002\u6975\u77ED\u968E\u6BB5\u6703\u4EE5\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u5448\u73FE\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u9032\u5EA6\u8207\u8A73\u7D30\u6578\u64DA\u3002</p>
    </div>
    <div class="workflow-wf-overall">
      <div class="workflow-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${Y}</span>
      </div>
      <div class="workflow-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,Number.isFinite(P)?P:0)).toFixed(1)}%"></span>
      </div>
    </div>
    ${Te?`<p class="processing-workflow-scope-note">${m("info",12)}<span>${r(Te)}</span></p>`:""}
  </section>`}function On(e){let t=String(e||"");return t.length===6?`${t.slice(0,4)}-${t.slice(4)}`:t||"\u2014"}function Yl(e){return e?.scan_order==="issue_month"?"\u7D22\u5F15\u6383\u63CF\u9806\u5E8F\u4F9D\u6708\u4EFD\u7531\u820A\u5230\u65B0\uFF1B\u540C\u6708\u4EFD\u518D\u4F9D\u532F\u5165 ID\u3002":"\u6B64 run \u662F\u820A\u7248\u6383\u63CF\u9806\u5E8F\uFF08\u4F9D\u532F\u5165 ID\uFF0C\u975E\u6708\u4EFD\u9806\u5E8F\uFF09\uFF1B\u65B0 run \u624D\u6703\u7531\u6700\u820A\u6708\u4EFD\u958B\u59CB\u3002"}function xm(e,t=!1){let s=Number(e?.reused),a=Number(e?.embedded);if(!Number.isFinite(s)||!Number.isFinite(a)||s<=0&&a<=0)return"";let n=[];if(s>0&&n.push(`<span class="index-current-phase is-reuse"
      title="R \xB7 \u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF0C\u672C\u6279 ${c(s)} \u7B46">
      <strong>R</strong><span>\u6CBF\u7528 ${c(s)} \u7B46</span>
    </span>`),a>0){let i=e.phase==="embedding"&&t?"\u8A08\u7B97\u4E2D":"\u65B0 embedding";n.push(`<span class="index-current-phase is-embed"
      title="E \xB7 \u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding\uFF0C\u672C\u6279 ${c(a)} \u7B46">
      <strong>E</strong><span>${i} ${c(a)} \u7B46</span>
    </span>`)}return`<span class="index-current-phases" aria-label="\u672C\u6279\u6B21 R\uFF0FE \u52D5\u4F5C">
    <span class="index-current-phase-label">\u672C\u6279</span>
    ${n.join("")}
  </span>`}function Am(e){let t=Array.isArray(e.months)?e.months:[],s=new Map;for(let n of t){let i=String(n.month||"");if(!/^\d{6}$/.test(i))continue;let o=s.get(i);o||(o={total:0,processed:0},s.set(i,o)),o.total+=Number(n.total)||0,o.processed+=Number(n.processed)||0}let a=0;for(let n of s.values())n.total>0&&n.processed>=n.total&&(a+=1);return{completed:a,total:s.size}}function Dl(e){let t=String(e||"").match(/(\d{8})Update/i);return t?Number(t[1]):0}function ls(e){let t=Number(e);return Number.isFinite(t)&&t>0?t:0}function Fl(e,t){let s=ls(t),a=ls(e);if(s<=0)return{processed:0,total:0,percent:null,fill:0,complete:!1,empty:!0,stateClass:"is-empty"};let n=Math.min(100,Math.round(a/s*1e3)/10),i=a>=s;return{processed:a,total:s,percent:n,fill:i?100:n,complete:i,empty:!1,stateClass:i?"is-complete":"is-incomplete"}}function Xl(e){let t=Array.isArray(e.months)?e.months:[],s=e.current||{},a=!!s.preparing&&e.scan_order==="issue_month",n=new Map;for(let i of t){let o=String(i.month||"");if(!/^\d{6}$/.test(o))continue;let l=Number(o.slice(4,6));if(l<1||l>12)continue;let d=n.get(o);d||(d={key:o,year:o.slice(0,4),monthNo:l,rows:[],archives:[],current:!1,preparing:!1,currentArchive:"",jid:""},n.set(o,d));let u=String(i.archive||"");d.rows.push({archive:u,total:ls(i.total),processed:ls(i.processed)}),u&&d.archives.push(u),!a&&s.month===o&&(!s.archive||s.archive===u)&&(d.current=!0,d.preparing=!!s.preparing,d.currentArchive=String(s.archive||u||""),d.jid=String(s.jid||""))}return n}function qm(e){let t=Xl(e),s=e.summary||{},a=e.copy||{},n=ls(s.total),i=ls(a.total),o=t.size,l=i>0?Math.min(i,n||i):0,d=i>0?Math.max(0,(n||i)-i):n,u=ls(s.reused),f=ls(s.embedded);return{totalMonths:o,reusePool:l,reused:u,reusePercent:l>0?Math.min(100,100*u/l):null,embedPool:d,embedded:f,embedPercent:d>0?Math.min(100,100*f/d):null}}function Mm(e){let t=qm(e);if(!t.totalMonths)return"";let s=[],a=(n,i,o,l,d)=>{let u=l===null?0:Math.max(0,Math.min(100,l));s.push(`<div class="index-wf-are-row ${n}">
      <span class="index-wf-are-label"><i aria-hidden="true"></i>${r(i)}</span>
      <span class="index-wf-are-value">${r(o)}${d?`<small>${r(d)}</small>`:""}</span>
      <span class="index-wf-are-track" aria-hidden="true"><span style="width:${u.toFixed(1)}%"></span></span>
    </div>`)};return(t.reusePool>0||t.reused>0)&&a("is-reuse","R \u672C\u6B21\u6CBF\u7528",`${c(t.reused)} / ${c(t.reusePool)} \u7B46`,t.reusePercent,"04 \u9010\u6708\u6CBF\u7528"),t.embedPool>0?a("is-embed","E \u672C\u6B21\u65B0 embedding",`${c(t.embedded)} / ${c(t.embedPool)} \u7B46`,t.embedPercent,"E backlog"):a("is-embed is-complete","E \u672C\u6B21\u65B0 embedding","\u7121 E backlog",100,"\u4E0D\u9700\u65B0 embedding"),`<div class="index-wf-are-breakdown" aria-label="R\uFF0FE \u5206\u6D41">
    <div class="index-wf-are-head"><strong>R\uFF0FE \u5206\u6D41</strong><span>\u5169\u689D bar \u5404\u81EA\u4EE5\u81EA\u5DF1\u7684 total \u8A08\u7B97\uFF0C\u4E0D\u53EF\u76F8\u52A0\uFF1B\u7686\u70BA\u672C\u6B21 run\u3002</span></div>
    ${s.join("")}
  </div>`}function Lm(e){let t=e.current||{},s=!!e.coverage_only,a=e.active_archive_coverage||{},n=Xl(e);if(!n.size)return'<div class="processing-workflow-empty">\u5C1A\u7121\u53EF\u986F\u793A\u7684\u7D22\u5F15\u6708\u4EFD\uFF1B\u958B\u59CB\u7D22\u5F15\u5F8C\u6703\u4F9D\u6642\u9593\u5217\u51FA\u6708\u4EFD\u72C0\u614B\u3002</div>';let i={reuseComplete:0,reuseIncomplete:0,embedComplete:0,embedIncomplete:0};for(let p of n.values()){let v=[...p.rows].sort((U,ie)=>Dl(ie.archive)-Dl(U.archive)),w=v[0],q=v.length>1?v.slice(1):[w],S=(a[p.key]||{})[w.archive],$=ls(S?.total),L=ls(S?.processed),z=$>0&&L>=$,P=q.reduce((U,ie)=>U+ie.total,0),Y=q.reduce((U,ie)=>U+ie.processed,0),me=w.total,X=w.processed,j=Fl(Y,P),x=!s&&z,te=Fl(x?L:X,x?$:me);p.latest=w,p.baselineRows=q,p.reuseState=j,p.embedState=te,p.reuseComplete=j.complete,p.embedComplete=te.complete,p.embedNoBacklog=x,j.complete?i.reuseComplete+=1:i.reuseIncomplete+=1,te.complete?i.embedComplete+=1:i.embedIncomplete+=1}let l=[...new Set([...n.values()].map(p=>p.year))].sort((p,v)=>v.localeCompare(p)).map(p=>{let v=Array.from({length:12},(w,q)=>{let k=q+1,S=`${p}${String(k).padStart(2,"0")}`,$=n.get(S);if(!$)return`<td class="judgment-month is-empty"><span>${k}</span></td>`;let L=$.current&&e.run_status==="running",z=E=>E.percent===null?"\u2014":`${E.percent}%`,P=E=>E.empty?"\u7121\u8CC7\u6599":E.complete?"\u5B8C\u6210":"\u672A\u5B8C\u6210",Y=String(t.phase||"")==="embedding"?"E \u65B0 embedding":String(t.phase||"")==="reuse"?"R \u91CD\u7528":"R\uFF0FE",me=$.latest&&$.latest.total>0?`${(100*$.latest.processed/$.latest.total).toFixed(1)}%`:"\u2014",X=$.current&&$.latest?`\u672C\u6B21 run ${Y} ${c($.latest.processed)} / ${c($.latest.total)}\uFF08${me}\uFF09`:"",j=[`${$.year}-${String($.monthNo).padStart(2,"0")}`,$.archives.join("\u3001")||"\u2014",`R \u672C\u6B21\u6CBF\u7528 ${c($.reuseState.processed)} / ${c($.reuseState.total)}\uFF08${z($.reuseState)}\uFF09\xB7 ${P($.reuseState)}`,$.embedNoBacklog?`E \u7121 E backlog\uFF08latest archive \u5DF2\u7531 active \u7248\u672C\u8986\u84CB ${c($.embedState.total)} \u7B46\uFF1B\u4E0D\u9700\u65B0 embedding\uFF09`:`E \u65B0 embedding ${c($.embedState.processed)} / ${c($.embedState.total)}\uFF08${z($.embedState)}\uFF09\xB7 ${P($.embedState)}`,$.reuseComplete?"":"\u5F85\u5B8C\u6210\uFF1AR \u65E2\u6709\u5411\u91CF\u91CD\u7528",$.embedComplete?"":"\u5F85\u5B8C\u6210\uFF1AE \u65B0 embedding",X,$.current?`${$.preparing?"\u6E96\u5099\u7D22\u5F15":L?"\u76EE\u524D\u7D22\u5F15":"\u6700\u5F8C\u7D22\u5F15"} \xB7 ${Y}${$.jid?` \xB7 ${$.jid}`:""}`:""].filter(Boolean).join(" \xB7 "),x=[["is-reuse",$.reuseState],["is-embed",$.embedState]].map(([E,H])=>`<span class="index-month-block ${E} ${H.stateClass}" style="--fill:${H.fill.toFixed(1)}%"></span>`).join("");return`<td class="judgment-month index-month index-month-are processing-month is-neutral${L?" is-current":""}" title="${r(j)}"${L?' aria-current="true"':""}><span class="index-month-number">${k}</span><span class="index-month-blocks" aria-hidden="true">${x}</span></td>`}).join("");return`<tr><th scope="row">${r(p)}</th>${v}</tr>`}).join(""),d=e.copy||{},u=ls(d.total),f=ls(d.copied),y=d.status==="success"?"\u5B8C\u6210":d.status==="running"?"\u57F7\u884C\u4E2D":d.status==="stale"?"\u4E2D\u6B62":"\u7B49\u5F85";return`<div class="judgment-months index-months">
    ${!s&&u>0?`<div class="index-copy-global-chip" title="03 \u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF\u662F\u5168\u57DF points \u6E96\u5099\u968E\u6BB5\uFF0C\u4E0D\u5217\u5165\u6708\u4EFD R\uFF0FE\uFF1BR \u662F 04 \u9010\u6708\u6383\u63CF\u9032\u5EA6\u3002">
          <span class="badge badge-neutral">03 \u8907\u88FD\uFF08\u5168\u57DF\uFF09</span>
          <span class="mono">${c(f)} / ${c(u)} points</span>
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
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(p,v)=>`<th scope="col">${v+1}</th>`).join("")}</tr></thead>
        <tbody>${l}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA R\uFF08\u672C\u6B21\u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF09\u3001E\uFF08\u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding\uFF09\uFF0C\u5169\u683C\u90FD\u662F\u672C\u6B21 run \u7684\u9032\u5EA6\uFF1B\u5B8C\u6210\u70BA\u5BE6\u5FC3\uFF1B\u672A\u5B8C\u6210\u6642\u5DF2\u5B8C\u6210\u6BD4\u4F8B\u70BA\u5BE6\u8272\u3001\u5269\u9918\u5340\u6BB5\u70BA\u540C\u8272 25% \u6DFA\u8272\uFF0C\u56E0\u6B64 0% \u6642\u6574\u683C\u90FD\u662F\u6DFA\u8272\uFF1B\u7121\u8CC7\u6599\u624D\u662F\u6DE1\u8272\u7A7A\u5FC3\u3002\u6700\u65B0 archive \u5DF2\u88AB active collection \u5B8C\u6574\u8986\u84CB\uFF08\u7121 E backlog\uFF09\u7684\u672A\u8B8A\u66F4\u6708\u4EFD\uFF0CE \u53EF\u4F7F\u7528 active \u8986\u84CB\u986F\u793A\u5B8C\u6210\uFF1BR \u4E00\u5F8B\u4F7F\u7528\u672C\u6B21 run \u7684 processed\uFF0Ftotal\uFF0C\u5C1A\u672A\u6383\u5230\u7684\u5F8C\u7E8C\u6708\u4EFD\u7DAD\u6301 25% \u6DFA\u8272\u3002\u4ECD\u6709 E backlog \u7684\u6708\u4EFD\uFF0CR\uFF0FE \u90FD\u4F7F\u7528\u672C\u6B21 run \u7684 processed\uFF0Ftotal\u3002E \u7121 backlog \u6642\u82E5\u986F\u793A\u5BE6\u5FC3\uFF0Ctooltip \u6703\u6A19\u793A\u4E0D\u9700\u65B0 embedding\u300203 \u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF\u662F\u5168\u57DF points \u6E96\u5099\u968E\u6BB5\uFF0C\u4E0D\u6703\u91CD\u8907\u756B\u6210\u6708\u4EFD\u5206\u683C\uFF1BR \u662F 04 \u9010\u6708\u6383\u63CF\u9032\u5EA6\u3002summary \u8207\u65B9\u584A\u4F7F\u7528\u540C\u4E00\u4EFD\u72C0\u614B\uFF0Csidebar \u66F4\u65B0 badge \u53E6\u4EE5 E backlog \u6708\u4EFD\u8A08\u3002\u540C\u4E00\u6708\u4EFD\u53EF\u80FD\u6709\u591A\u500B archive\uFF0CR \u4F7F\u7528\u8F03\u820A\u7684\u57FA\u7DDA archive\uFF0CE \u4F7F\u7528\u540D\u7A31\u4E2D\u66F4\u65B0\u65E5\u671F\u6700\u65B0\u7684 archive\uFF1B\u65B0\u820A archive \u4E0D\u6703\u76F8\u52A0\u3002E \u5B8C\u6210\uFF0F\u672A\u5B8C\u6210\u4EE5\u6708\u4EFD\u8A08\uFF0C\u4E0D\u662F RAR \u6A94\u6578\u3002${Yl(e)}\u7DA0\u6846\u53EA\u6A19\u793A\u76EE\u524D\u6279\u6B21\u6240\u5728\u6708\u4EFD\u3002\u76EE\u524D\u7D22\u5F15\u6708\u4EFD\u4EE5\u5BE6\u7DDA\u5916\u6846\u6A19\u793A\uFF0Cpadding \u4E0D\u4F7F\u7528\u72C0\u614B\u5E95\u8272\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B R\uFF0FE \u9032\u5EA6\u8207\u76EE\u524D\u6848\u865F\u3002</p>
  </div>`}function jm(e){let t=e.import_timeline||{},s=Array.isArray(t.months)?t.months:[];if(!s.length)return`<section class="report-card processing-card import-files-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u672A\u53D6\u5F97\u5224\u6C7A\u4E0B\u8F09 manifest \u6216\u672C\u6A5F\u58D3\u7E2E\u6A94\uFF1B\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u5F8C\u6703\u986F\u793A\u6708\u4EFD\u72C0\u614B\u3002</div>
    </section>`;let a=new Map(s.map(b=>[String(b.month),b])),n=[...new Set(s.map(b=>b.year))].sort((b,p)=>p-b),i=["extract","raw_parquet","filter","postgres"],o=t.stage_labels||{},l=n.map(b=>{let p=Array.from({length:12},(v,w)=>{let q=w+1,k=`${b}${String(q).padStart(2,"0")}`,S=a.get(k);return vi({month:S,year:b,monthNo:q,stageOrder:i,stageLabels:o,stageStatuses:S?.import_stages||{},stageProgress:S?.import_stage_progress||{},overall:S?.import_overall||"empty",active:!!S?.active,processing:String(S?.month||"")===String(t.processing_month||""),workflowForStage:()=>"judgment_import",variant:"import"})}).join("");return`<tr><th scope="row">${r(b)}</th>${p}</tr>`}).join(""),d=t.summary||{},u=t.stage_summary||{},f=s.find(b=>b.active),y=f?`<div class="index-current-row">${zl({activeMonth:t.active_month||String(f.month||""),activeArchive:t.active_archive||f.active_archive||"",activePhase:t.active_phase||"",processingMonth:t.processing_month||"",processingArchive:t.processing_archive||"",stageLabels:o})}</div>`:"";return`<section class="report-card processing-card import-files-card" data-import-timeline="judgment">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
      ${Xp(t,s,u,d)}
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(b,p)=>`<th scope="col">${p+1}</th>`).join("")}</tr></thead>
          <tbody>${l}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\uFF1ARAR \u6AA2\u67E5\uFF0F\u89E3\u58D3\u7E2E\u3001\u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD\u3001\u91D1\u878D\u6CD5\u898F\u7BE9\u9078\u3001PostgreSQL metadata\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF1B\u6709\u5F85\u66F4\u65B0\u6A94\u6848\u6642\uFF0C\u5C1A\u672A\u91CD\u505A\u7684\u56DB\u500B\u968E\u6BB5\u65B9\u683C\u4EE5\u6DFA\u6A58\uFF0F\u6DFA\u7D05\uFF0F\u6DFA\u7D2B\uFF0F\u6DFA\u85CD\u8868\u793A\uFF0C\u5B8C\u6210\u5F8C\u8F49\u70BA\u5BE6\u5FC3\u6DF1\u8272\uFF1B\u5C1A\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF1B\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u5B8C\u6210\u8272\u5782\u76F4\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u672A\u5B8C\u6210\u5340\u6BB5\u7DAD\u6301 25% \u6DFA\u8272\uFF1B\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u539F\u59CB\u8CC7\u6599\u968E\u6BB5\u6703\u5148\u6AA2\u67E5\u65E2\u6709 Parquet\uFF0C\u53EF\u6CBF\u7528\u6642\u4E0D\u91CD\u65B0\u5099\u4EFD\uFF1B\u7F3A\u5C11\u6642\u6703\u986F\u793A\u300C\u5EFA\u7ACB YYYY-MM \u5099\u4EFD\u300D\uFF0C\u5B8C\u6210\u5F8C\u986F\u793A\u300C\u5DF2\u5EFA\u7ACB\u5099\u4EFD\u300D\u3002\u7BE9\u9078\u8207 PostgreSQL \u968E\u6BB5\u6703\u986F\u793A\u76EE\u524D\u8655\u7406\u7684\u6708\u4EFD\u8207 archive\u3002\u5BE6\u7DDA\u6846\u6A19\u793A\u76EE\u524D\u532F\u5165\u6708\u4EFD\uFF1B\u82E5\u5BE6\u969B\u8655\u7406\u7684\u662F\u8F03\u820A\u6708\u4EFD\uFF0C\u8A72\u6708\u53E6\u4EE5\u865B\u7DDA\u6846\u6A19\u793A\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u56DB\u500B\u968E\u6BB5\u7684\u72C0\u614B\u3001\u672C\u6A5F\u58D3\u7E2E\u6A94\u8207\u5DF2\u532F\u5165\u6A94\u540D\u3002</p>
    </div>
  </section>`}function Zl(e,t,s){let n=[t.run_id||e.active_run?.id||e.last_run?.id||"",t.version_id??"",t.collection||"",t.started_at||""].join("|"),i=Date.now(),o=jl.get(n);if(!o){let b=Date.parse(t.started_at||""),p=Date.parse(t.finished_at||""),v=Date.parse(t.updated_at||"");t.run_status!=="running"&&Number.isFinite(b)&&(Number.isFinite(p)||Number.isFinite(v))?o={at:b,indexed:0}:o={at:i,indexed:Math.max(0,s)},jl.set(n,o)}let l=Date.parse(t.finished_at||""),d=Date.parse(t.updated_at||""),u=t.run_status==="running"?i:Number.isFinite(l)?l:Number.isFinite(d)?d:i,f=Math.max(0,(u-Number(o.at||0))/1e3),y=Math.max(0,Number(s)-Number(o.indexed||0));return f<=0||y<=0?0:y/f}function Ws(e){let t=Number(e);return!Number.isFinite(t)||t<0?"\u2014":t>=36e5?ec(t):be(t)}function ec(e){if(!Number.isFinite(e)||e<0)return"\u2014";let t=Math.max(0,Math.round(e/1e3)),s=Math.floor(t/3600),a=Math.floor(t%3600/60),n=t%60,i=String(n).padStart(2,"0");return s>0?`${s}h ${String(a).padStart(2,"0")}m ${i}s`:a>0?`${a}m ${i}s`:`${n}s`}function tc(e,t,s,a){let n=Date.parse(e.started_at||"");if(!Number.isFinite(n))return{elapsedMs:null,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let i=e.run_status==="running",o=Date.parse(e.finished_at||""),l=Date.parse(e.updated_at||""),d=i?Date.now():Number.isFinite(o)?o:Number.isFinite(l)?l:Date.now(),u=Math.max(0,d-n),f=Number(s),y=Number(t);if(!Number.isFinite(f)||f<=0)return{elapsedMs:u,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let b=Math.max(0,f-Math.max(0,Number.isFinite(y)?y:0));if(b<=0)return{elapsedMs:u,estimatedTotalMs:u,remainingMs:0,remainingCount:0};if(!i||a<=0)return{elapsedMs:u,estimatedTotalMs:null,remainingMs:null,remainingCount:b};let p=b/a*1e3;return{elapsedMs:u,estimatedTotalMs:u+p,remainingMs:p,remainingCount:b}}function Tm(e){let t=e.index_runtime||{};if(!t.available)return"";let s=!!t.coverage_only,a=Yl(t),n=t.current||{},i=t.summary||{},o=Number(i.indexed??n.indexed??0),l=s?0:Zl(e,t,o),d=Am(t),u=s?null:tc(t,o,i.total,l),f=u?.remainingCount>0?`\u8207\u5269\u9918 ${c(u.remainingCount)} \u7B46`:"",y=l>0?`\u4F9D\u672C\u6B21\u5E73\u5747 ${l.toFixed(1)} \u7B46/\u79D2${f}\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002\u5BE6\u969B\u901F\u5EA6\u6703\u96A8 embedding \u8207\u6279\u6B21\u5927\u5C0F\u8B8A\u52D5\u3002`:"\u5C1A\u7121\u8DB3\u5920\u7684\u672C\u9801\u89C0\u5BDF\u8CC7\u6599\u53EF\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002",b=$=>r(ec(u?u[$]:null)),p=`<div class="index-runtime-metrics">
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
      <strong>${b("elapsedMs")}</strong>
    </span>
    <span class="index-runtime-metric" title="Elapsed Time \u52A0\u4E0A\u4F9D\u5269\u9918\u4EF6\u6578\u8207\u672C\u6B21\u5E73\u5747\u901F\u5EA6\u4F30\u7B97\u7684\u5269\u9918\u6642\u9593\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u5F9E 0 \u91CD\u65B0\u8A08\u6642\u3002">
      <span>Estimated Total</span>
      <strong>${b("estimatedTotalMs")}</strong>
    </span>
    <span class="index-runtime-metric" title="${r(y)}">
      <span>Time Remaining</span>
      <strong>${b("remainingMs")}</strong>
    </span>
  </div>`,v=t.run_status==="running"?n.preparing?"\u6E96\u5099\u4E2D":"\u76EE\u524D\u8655\u7406":"\u6700\u5F8C\u8655\u7406",w=!!n.preparing&&t.scan_order==="issue_month",q=t.copy||{},k=Number(q.total)>0?`\u8907\u88FD ${c(q.copied)} / ${c(q.total)} points`:"\u5EFA\u7ACB\u65B0\u7248\u672C collection",S=w?`<div class="index-current-row">
        <span class="badge badge-info" title="${r(a)}">${m("activity",11)}\u6E96\u5099\u4E2D</span>
        <span class="index-current-copy">${r(k)}\uFF1B\u7248\u672C\u6E96\u5099\u5B8C\u6210\u5F8C\u6703\u5F9E\u6700\u820A\u6708\u4EFD\u958B\u59CB\u7D22\u5F15\uFF0C\u7B2C\u4E00\u6279\u958B\u59CB\u524D\u4E0D\u6A19\u793A\u76EE\u524D\u6708\u4EFD\u3002</span>
      </div>`:n.jid?`<div class="index-current-row">
        <span class="badge badge-info" title="${r(a)}">${m("activity",11)}${v}</span>
        <strong class="mono">${r(On(n.month))}</strong>
        <span class="mono">${r(n.archive||"\u2014")}</span>
        ${n.preparing?"":xm(n,t.run_status==="running")}
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
    ${Lm(t)}
    ${s?'<p class="judgment-months-hint index-coverage-note">\u76EE\u524D\u6C92\u6709\u672C\u6B21\u7D22\u5F15 run\uFF1BR\uFF0FE \u6642\u9593\u8868\u6703\u5728\u7248\u672C\u5EFA\u7F6E\u958B\u59CB\u5F8C\u986F\u793A\u672C\u6B21\u9032\u5EA6\u3002</p>':""}
  </section>`}function Em(e={}){let{storage:t,loading:s,error:a}=e;if(a)return`<section class="report-card processing-card index-storage-card">
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
    </section>`;let n=t.qdrant_storage||{},o=(Array.isArray(t.databases)?t.databases:[]).find(f=>f.id==="qdrant")||{},l=n.volume_bytes??o.volume_bytes??null,d=n.points_count??o.points_count,u=n.segments_count??o.segments_count;return`<section class="report-card processing-card index-storage-card">
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
      <span>Volume \u5BB9\u91CF</span><strong class="mono">${Ie(l)}${n.volume_size?` \xB7 ${r(n.volume_size)}`:""}</strong>
      <span>Volume \u4F86\u6E90\u8DEF\u5F91</span><strong class="mono index-storage-path">${r(n.host_path||"\u2014")}</strong>
      <span>Collection</span><strong class="mono">${r(n.collection||o.collection||"\u2014")}</strong>
      <span>Alias</span><strong class="mono">${r(n.alias||"\u2014")}</strong>
      <span>Points\uFF0FSegments</span><strong class="mono">${c(d)} / ${c(u)}</strong>
    </div>
    <div class="index-runtime-foot">\u8CC7\u6599\u6642\u9593 ${r($e(t.checked_at))}</div>
  </section>`}function yi({badge:e="",lead:t="",rows:s=[],note:a=""}){return`<section class="report-card processing-card parquet-help-card workflow-help-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("info",14)}\u529F\u80FD\u8AAA\u660E</span>
      ${e?`<span class="badge badge-neutral">${r(e)}</span>`:""}
    </div>
    <div class="parquet-help-body">
      <p class="parquet-help-lead">${t}</p>
      <div class="parquet-help-grid">${s.map(([n,i])=>`<span>${r(n)}</span><strong>${i}</strong>`).join("")}</div>
      ${a?`<p class="parquet-help-note">${a}</p>`:""}
    </div>
  </section>`}function Nm(){return yi({badge:"\u552F\u8B80\u532F\u51FA",lead:"\u5C07 PostgreSQL \u76EE\u524D\u6709\u6548\u7684\u5224\u6C7A\uFF08<code>judgment_documents.is_current = true</code>\uFF09\u532F\u51FA\u6210\u7368\u7ACB\u7684 Parquet \u5FEB\u7167\uFF0C\u4F9B\u96E2\u7DDA\u5206\u6790\u3001\u8CC7\u6599\u4EA4\u63DB\u6216\u4FDD\u5B58\u3002",rows:[["\u4F86\u6E90","PostgreSQL <code>judgment_documents</code>\uFF0C\u53EA\u542B\u76EE\u524D\u6709\u6548\u4E14\u5DF2\u547D\u4E2D\u91D1\u878D\u6CD5\u898F\u6E05\u55AE\u7684\u5224\u6C7A\u3002"],["\u8F38\u51FA",'<span class="mono">JUDGMENT_DATA_DIR/parquet/judgments/YYYYMMDD/HHMMSS-xxxxxxxx/judgments.parquet</span>'],["\u9644\u5E36\u6A94",'<span class="mono">\u540C\u76EE\u9304 manifest.json\uFF08\u7B46\u6578\u3001\u6A94\u6848\u5927\u5C0F\u3001\u6B04\u4F4D\u3001\u7522\u751F\u6642\u9593\uFF09</span>'],["\u5167\u5BB9","\u6848\u865F\u3001\u6CD5\u9662\u3001\u6848\u7531\u3001\u5168\u6587\u3001\u547D\u4E2D\u6CD5\u898F\u3001\u5F15\u7528\u3001\u4F86\u6E90\u58D3\u7E2E\u6A94\u8207\u6642\u9593\u6B04\u4F4D\uFF1B<code>citations</code> \u4EE5 JSON \u5B57\u4E32\u4FDD\u5B58\u3002"],["\u8207\u539F\u59CB Parquet","\u8CC7\u6599\u9801\u8207 <code>source=parquet</code> \u4F7F\u7528 <code>parquet/raw_judgments/.../raw.parquet</code>\uFF1B\u672C\u6D41\u7A0B\u7684 <code>parquet/judgments/...</code> \u662F\u53E6\u4E00\u500B\u6B63\u898F\u5316\u5FEB\u7167\u3002"],["\u4E0D\u6703","\u4E0D\u5BEB\u56DE PostgreSQL\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u820A\u5FEB\u7167\uFF1B\u53EA\u532F\u51FA current \u8CC7\u6599\uFF0C\u4E0D\u542B\u6B77\u53F2\u7248\u672C\u3002"],["\u4E2D\u65B7","\u6BCF\u6B21\u57F7\u884C\u5EFA\u7ACB\u65B0\u7684\u5B8C\u6574\u5FEB\u7167\uFF1B\u4E2D\u65B7\u5F8C\u91CD\u65B0\u57F7\u884C\u4E0D\u6703\u7E8C\u5BEB\u540C\u4E00\u500B Parquet \u6A94\u3002"]],note:"\u9069\u5408 DuckDB\u3001pandas\u3001Spark \u7B49\u96E2\u7DDA\u5206\u6790\uFF0C\u6216\u9700\u8981\u56FA\u5B9A\u6642\u9593\u9EDE\u7684\u53EF\u91CD\u73FE\u8CC7\u6599\u5FEB\u7167\u3002\u65E5\u5E38 RAG \u67E5\u8A62\u8207\u8CC7\u6599\u9801\u700F\u89BD\u4E0D\u9700\u8981\u57F7\u884C\u6B64\u6D41\u7A0B\u3002"})}function Rm(){return yi({badge:"PostgreSQL \u56DE\u586B",lead:"\u5C07\u5224\u6C7A\u7684 <code>court</code> \u8F49\u6210\u6A19\u6E96\u6CD5\u9662\u540D\u7A31\u4E26\u5BEB\u5165 <code>court_normalized</code>\uFF1B\u539F\u59CB <code>court</code> \u6703\u4FDD\u7559\u4F9B\u8FFD\u6EAF\u3002",rows:[["\u8655\u7406\u7BC4\u570D","\u9810\u8A2D\u53EA\u8655\u7406 <code>court_normalized</code> \u70BA\u7A7A\u7684\u8CC7\u6599\uFF1B\u5DF2\u6B63\u898F\u5316\u8CC7\u6599\u6703\u8DF3\u904E\uFF0C\u53EF\u7528 <code>--all</code> \u91CD\u65B0\u8A08\u7B97\u5168\u90E8\u3002"],["\u89E3\u6790\u9806\u5E8F","\u539F\u59CB\u6CD5\u9662\u503C\u958B\u982D\u7B26\u5408\u6A19\u6E96\u540D\u7A31 \u2192 \u5224\u6C7A\u5168\u6587\u524D 8,000 \u5B57\u6700\u65E9\u51FA\u73FE\u7684\u6CD5\u9662 \u2192 \u539F\u59CB\u6CD5\u9662\u503C\u4EFB\u610F\u4F4D\u7F6E\u7684\u6A19\u6E96\u540D\u7A31 \u2192 JID \u5B98\u65B9\u6CD5\u9662\u4EE3\u78BC\u3002"],["\u8F38\u51FA","\u5BEB\u5165 <code>judgment_documents.court_normalized</code>\uFF1B\u4E0D\u4FEE\u6539\u539F\u59CB <code>court</code>\u3001\u5168\u6587\u6216\u5176\u4ED6\u5224\u6C7A\u6B04\u4F4D\u3002"],["\u672A\u89E3\u6790","\u7121\u6CD5\u5224\u65B7\u6642\u4FDD\u7559\u7A7A\u503C\uFF0C\u4E0D\u731C\u6E2C\uFF1B\u6458\u8981\u6703\u5217\u51FA\u672A\u89E3\u6790\u7B46\u6578\u8207\u5E38\u898B\u6A23\u672C\u3002"],["\u5F71\u97FF","\u8CC7\u6599\u9801\u7684\u6CD5\u9662\u4E0B\u62C9\u3001\u7CBE\u78BA\u7BE9\u9078\u3001\u6392\u5E8F\u3001\u7D50\u679C\u6B04\u4F4D\u8207\u5224\u6C7A\u539F\u6587\u4F7F\u7528\u6B63\u898F\u5316\u540D\u7A31\uFF1BAPI \u4ECD\u56DE\u50B3 <code>court_raw</code>\u3002"],["\u4E0D\u6703","\u4E0D\u91CD\u65B0\u532F\u5165\u5224\u6C7A\u3001\u4E0D\u6539\u5168\u6587\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u8CC7\u6599\u3002"],["\u91CD\u8DD1","\u9810\u8A2D\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u898F\u5247\u66F4\u65B0\u5F8C\u53EF\u7528 <code>--all</code> \u91CD\u7B97\uFF0C\u6216\u5148\u7528 <code>--dry-run</code> \u7D71\u8A08\u3002"]],note:"\u9069\u5408\u5728\u5224\u6C7A\u532F\u5165\u5F8C\u3001\u6CD5\u9662\u540D\u7A31\u898F\u5247\u66F4\u65B0\u5F8C\uFF0C\u6216\u8CC7\u6599\u9801\u6CD5\u9662\u9078\u9805\u51FA\u73FE\u7F3A\u6F0F\u6642\u57F7\u884C\u3002\u7D50\u679C\u4E5F\u6703\u5BEB\u5165\u6548\u80FD\u7D00\u9304\u3002"})}function Cm(){return yi({badge:"\u689D\u6587\u6B77\u53F2\u5EFA\u6A94",lead:"\u70BA\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u5EFA\u7ACB <code>law_article_versions</code> \u6B77\u53F2\u689D\u6587\u5FEB\u7167\u8207 <code>law_article_change_events</code> \u8B8A\u66F4\u7D00\u9304\uFF0C\u8B93\u8CC7\u6599\u9801\u80FD\u5207\u63DB\u6B77\u53F2\u7248\u672C\u4E26\u67E5\u770B\u689D\u6587\u5DEE\u7570\u3002",rows:[["\u4F86\u6E90","PostgreSQL \u6CD5\u898F\u7248\u672C\uFF0C\u4EE5\u53CA <code>LAW_DATA_DIR/raw_parquet</code> \u5167\u5C0D\u61C9\u7684\u539F\u59CB\u6CD5\u898F Parquet \u5FEB\u7167\u3002"],["\u5339\u914D\u65B9\u5F0F","\u4EE5 raw Parquet manifest \u7684 <code>zip_sha256</code>\uFF0F<code>raw_json_sha256</code> \u5C0D\u61C9\u6CD5\u898F\u7248\u672C\uFF0C\u4E0D\u731C\u6E2C\u5167\u5BB9\u3002"],["\u7522\u751F\u5167\u5BB9","<code>article_key</code>\uFF08\u689D\u6587\u985E\u578B\uFF0B\u689D\u865F\uFF09\u3001<code>content_hash</code>\u3001\u689D\u6587\u5168\u6587\u8207\u751F\u6548\u65E5\uFF1B\u8207\u524D\u4E00\u7248\u672C\u6BD4\u8F03\u5F8C\u8A18\u9304 <code>added</code>\uFF0F<code>modified</code>\uFF0F<code>removed</code>\u3002"],["\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB","\u5206\u9801\u4E0A\u65B9\u7684\u552F\u8B80\u6AA2\u67E5\u6703\u8B80\u53D6 <code>law_article_versions</code> \u8207\u539F\u59CB Parquet\uFF0C\u5224\u65B7\u7248\u672C\u662F\u5426\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\uFF1B\u6AA2\u67E5\u672C\u8EAB\u4E0D\u6703\u4FEE\u6539\u8CC7\u6599\u5EAB\u3002"],["\u53EF\u5EFA\u7ACB","\u627E\u5230\u5C0D\u61C9\u539F\u59CB Parquet \u7684\u7248\u672C\uFF0C\u53EF\u76F4\u63A5\u57F7\u884C\u6B64\u6D41\u7A0B\u5EFA\u7ACB\u689D\u6587\u6B77\u53F2\u3002"],["\u7F3A\u539F\u59CB\u6A94","\u627E\u4E0D\u5230\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u6A19\u793A\u7121\u6CD5\u5EFA\u7ACB\uFF0C\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD\uFF1B\u6B64\u6D41\u7A0B\u6703\u8DF3\u904E\u4E26\u5217\u5728 <code>missing_versions</code>\u3002"],["\u6AA2\u67E5\u7D50\u679C","\u5E74\u4EFD\xD7\u6708\u4EFD\u8868\u986F\u793A\u5DF2\u5EFA\u7ACB\uFF0F\u672A\u5EFA\u7ACB\uFF0F\u90E8\u5206\u5EFA\u7ACB\uFF1B\u4E0B\u65B9\u5217\u51FA\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u7248\u672C\u65E5\u671F\u8207\u53EF\u5EFA\u7ACB\u72C0\u614B\u3002\u76EE\u524D\u72C0\u614B\u4EE5\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u5361\u7247\u5373\u6642\u986F\u793A\u3002"],["\u8DF3\u904E\u689D\u4EF6","\u5DF2\u6709\u689D\u6587\u5FEB\u7167\u7684\u7248\u672C\u6703\u8DF3\u904E\uFF1B\u627E\u4E0D\u5230\u53EF\u8B80\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u5217\u5165 <code>missing_versions</code>\uFF0C\u4E0D\u5EFA\u7ACB\u865B\u69CB\u689D\u6587\u3002"],["\u4E0D\u6703","\u4E0D\u4E0B\u8F09\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u4E0D\u89E3\u6790\u65B0 ZIP\u3001\u4E0D\u4FEE\u6539 <code>law_documents</code> \u6216\u76EE\u524D\u7248\u672C\u3001\u4E0D\u66F4\u65B0 Qdrant\uFF0FIndexedDB\u3002"],["\u8F38\u51FA\u6458\u8981","\u7248\u672C\u6578\u3001\u8DF3\u904E\u7248\u672C\u6578\u3001\u7F3A\u5C11\u5FEB\u7167\u7248\u672C\u3001\u5BEB\u5165\u689D\u6587\u6578\u8207\u689D\u6587\u8B8A\u66F4\u4E8B\u4EF6\u6578\u3002"],["\u91CD\u8DD1","\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u5DF2\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u4E0D\u6703\u91CD\u8907\u63D2\u5165\u3002"]],note:"\u9069\u5408\u5F9E\u820A\u7248 schema \u5347\u7D1A\u3001\u65E2\u6709\u6CD5\u898F\u7248\u672C\u7F3A\u5C11\u6B77\u53F2\u689D\u6587\uFF0C\u6216\u8CC7\u6599\u9801\u6B77\u53F2\u689D\u6587\u7248\u672C\u8207\u8B8A\u66F4\u7D00\u9304\u4E0D\u5B8C\u6574\u6642\u57F7\u884C\u3002\u57F7\u884C\u524D\u53EF\u5148\u7528\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u78BA\u8A8D\u54EA\u4E9B\u7248\u672C\u53EF\u5EFA\u7ACB\u3001\u54EA\u4E9B\u7F3A\u539F\u59CB\u6A94\u3002"})}function Pm(e={}){let t=e.courtCheck,s=!!e.courtCheckLoading,a=e.courtCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-court-check"${s?" disabled":""}>${m("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31"}</span></button>`;if(a)return`<section class="report-card processing-card court-check-card">
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
    </section>`;let d={green:"\u5DF2\u6AA2\u67E5",red:"\u9700\u6B63\u898F\u5316\uFF08\u5B8C\u5168\u672A\u6AA2\u67E5\uFF09",gray:"\u9700\u6B63\u898F\u5316"},u=new Map(i.map(b=>[String(b.month),b])),y=[...new Set(i.map(b=>b.year))].sort((b,p)=>p-b).map(b=>{let p=Array.from({length:12},(v,w)=>{let q=w+1,k=`${b}${String(q).padStart(2,"0")}`,S=u.get(k);if(!S)return`<td class="judgment-month is-empty"><span>${q}</span></td>`;let $=d[S.status]?S.status:"red",L=[`${b}-${String(q).padStart(2,"0")}`,d[$],`\u7E3D ${c(S.total)} \u7B46`,`\u5DF2\u6AA2\u67E5 ${c(S.checked)} \u7B46`,`\u672A\u6AA2\u67E5 ${c(S.unchecked)} \u7B46`,S.invalid?`\u7121\u6548\u503C ${c(S.invalid)} \u7B46`:"",`\u6709\u6548 ${Et(S.percent)}`].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month court-check-month is-${$==="gray"?"red":$}" title="${r(L)}"><span>${q}</span></td>`}).join("");return`<tr><th scope="row">${r(b)}</th>${p}</tr>`}).join("");return`<section class="report-card processing-card court-check-card">
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(b,p)=>`<th scope="col">${p+1}</th>`).join("")}</tr></thead>
          <tbody>${y}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u5168\u90E8\u5DF2\u6B63\u898F\u5316\uFF1B\u7D05\u8272\uFF1A\u9700\u6B63\u898F\u5316\uFF08\u542B\u5B8C\u5168\u672A\u6AA2\u67E5\u3001\u90E8\u5206\u672A\u6B63\u898F\u5316\u6216\u7121\u6548\u503C\uFF09\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002summary \u7684\u7D05\u8272\u6578\u5B57\u70BA\u9700\u6B63\u898F\u5316\u6708\u4EFD\u6578\uFF1B\u4E0B\u65B9\u660E\u7D30\u4ECD\u4FDD\u7559\u672A\u6AA2\u67E5\u8207\u7121\u6548\u503C\u7B46\u6578\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u8A73\u7D30\u7B46\u6578\u8207\u6709\u6548\u6BD4\u4F8B\u3002</p>
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r($e(t.checked_at))} \xB7 \u6A19\u6E96\u6CD5\u9662\u540D\u7A31 ${c(t.canonical_count)} \u500B</div>
    </div>
  </section>`}function Im(e={}){let t=e.lawVersionCheck,s=!!e.lawVersionCheckLoading,a=e.lawVersionCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-law-version-check"${s?" disabled":""}>${m("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB"}</span></button>`;if(a)return`<section class="report-card processing-card law-version-card">
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
    </section>`;let d={green:"\u5DF2\u5EFA\u7ACB",red:"\u672A\u5EFA\u7ACB",gray:"\u90E8\u5206\u5EFA\u7ACB"},u=new Map(i.map(X=>[String(X.month),X])),y=[...new Set(i.map(X=>X.year))].sort((X,j)=>j-X).map(X=>{let j=Array.from({length:12},(x,E)=>{let H=E+1,te=`${X}${String(H).padStart(2,"0")}`,U=u.get(te);if(!U)return`<td class="judgment-month is-empty"><span>${H}</span></td>`;let ie=d[U.status]?U.status:"red",Te=[`${X}-${String(H).padStart(2,"0")}`,d[ie],`\u7248\u672C ${c(U.version_count)}\uFF08\u6CD5\u898F ${c(U.law_versions)}\uFF0F\u547D\u4EE4 ${c(U.order_versions)}\uFF09`,`\u5DF2\u5EFA\u7ACB ${c(U.backfilled_count)}`,`\u672A\u5EFA\u7ACB ${c(U.missing_count)}`,`\u9700\u5EFA\u7ACB ${c(U.needs_backfill_count)}\uFF08\u53EF\u5EFA\u7ACB ${c(U.backfillable_count)}\uFF0F\u7F3A\u539F\u59CB\u6A94 ${c(U.blocked_count)}\uFF09`,`\u689D\u6587\u5217 ${c(U.article_rows)} / \u9810\u671F ${c(U.article_count)}`,U.current?"\u76EE\u524D\u7248\u672C":"",U.versions?.length?`\u7248\u672C ${U.versions.map(B=>`#${B.version_id}`).join("\u3001")}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month law-version-month is-${ie}${U.current?" is-current":""}" title="${r(Te)}"><span>${H}</span></td>`}).join("");return`<tr><th scope="row">${r(X)}</th>${j}</tr>`}).join(""),b={law:"\u6CD5\u898F",order:"\u547D\u4EE4"},p=i.flatMap(X=>(X.versions||[]).filter(j=>j.needs_backfill).map(j=>({...j,month:X.month}))).sort((X,j)=>j.version_id-X.version_id),v=p.slice(0,20),w=v.map(X=>{let j=X.backfillable?"badge-info":X.blocked?"badge-danger":"badge-neutral",x=X.backfillable?"\u53EF\u5EFA\u7ACB":X.blocked?"\u7F3A\u539F\u59CB\u6A94":"\u5F85\u6AA2\u67E5";return`<div class="law-backfill-needed-row">
        <strong class="mono">#${X.version_id}</strong>
        <span class="badge ${j}">${x}</span>
        <span>${r(b[X.source_type]||X.source_type||"\u2014")}</span>
        <span class="mono">${r(X.update_date||X.month||"\u2014")}</span>
        <span class="law-backfill-needed-reason">${r(X.reason||"\u2014")}</span>
      </div>`}).join(""),q=p.length?`<div class="law-backfill-needed">
        <div class="law-backfill-needed-head">\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C <span class="badge badge-warn">${c(p.length)}</span></div>
        <div class="law-backfill-needed-list">${w}</div>
        ${p.length>v.length?`<div class="law-backfill-needed-more">\u53E6\u6709 ${c(p.length-v.length)} \u500B\u7248\u672C\u672A\u5217\u51FA</div>`:""}
      </div>`:'<div class="law-backfill-needed is-clear">\u76EE\u524D\u6C92\u6709\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3002</div>',k=Number(l.needs_backfill_versions)||0,S=Number(l.backfillable_versions)||0,$=Number(l.blocked_versions)||0,L=Number(l.backfilled_versions)||0,z=Number(l.versions)||0,P=k<=0?"ok":$>0?"danger":"warn",Y=k<=0?"\u4E0D\u9700\u8981\u5EFA\u7ACB":"\u9700\u8981\u5EFA\u7ACB",me=k>0?`\u9700\u8981\u5EFA\u7ACB ${c(k)} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF1A\u53EF\u5EFA\u7ACB ${c(S)}\u3001\u7F3A\u539F\u59CB\u6A94 ${c($)}\u3002\u5DF2\u6709\u6B77\u53F2\u689D\u6587 ${c(L)} \u500B\u7248\u672C${$>0?"\uFF1B\u7F3A\u539F\u59CB\u6A94\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD":""}\u3002`:`\u76EE\u524D ${c(z)} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`;return`<section class="report-card processing-card law-version-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
      ${n}
    </div>
    <div class="law-version-check-status is-${P}" role="status" aria-live="polite">
      <span class="badge badge-${P}">${Y}</span>
      <span>${r(me)}</span>
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(X,j)=>`<th scope="col">${j+1}</th>`).join("")}</tr></thead>
          <tbody>${y}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u8A72\u6708\u4EFD\u6240\u6709\u7248\u672C\u90FD\u6709\u6B77\u53F2\u689D\u6587\uFF1B\u7D05\u8272\uFF1A\u5B8C\u5168\u672A\u5EFA\u7ACB\uFF1B\u7070\u8272\uFF1A\u90E8\u5206\u7248\u672C\u5DF2\u5EFA\u7ACB\uFF1B\u5916\u6846\uFF1A\u76EE\u524D\u7248\u672C\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u7248\u672C\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u6578\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u6578\u8207\u689D\u6587\u5217\u3002</p>
      ${q}
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r($e(t.checked_at))}</div>
    </div>
  </section>`}function Dm(){return`<div class="processing-ollama-loading">
    <span class="spinner" aria-hidden="true"></span>
    <span>\u6B63\u5728\u6AA2\u67E5 llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span>
  </div>`}function Fm(e,t,s){let a=Array.isArray(e?.hosts)?e.hosts:[];if(s&&!a.length)return`${Ge({tone:"danger",title:"llama-server \u4E3B\u6A5F\u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
    <div class="processing-ollama-empty">
      <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh-ollama">
        ${m("refresh",13)}<span>\u91CD\u65B0\u6AA2\u67E5</span>
      </button>
    </div>`;if(!a.length)return t?Dm():'<div class="processing-ollama-empty">\u5C1A\u672A\u8A2D\u5B9A llama-server \u4E3B\u6A5F\uFF1B\u8ACB\u5230\u300C\u7CFB\u7D71\u72C0\u614B \u2192 Model Provider\u300D\u65B0\u589E\u4E26\u9023\u63A5\u6A21\u578B\u3002</div>';let n=a.map((o,l)=>{let d=o.status==="operational",u=Array.isArray(o.models)?o.models:[],f=u.length?u.map(b=>`<span class="processing-ollama-model ${d?"is-online":"is-offline"}">${r(b.name||"")}</span>`).join(""):'<span class="processing-ollama-model is-offline">\u6C92\u6709\u53EF\u7528\u6A21\u578B</span>',y=[o.embedding_model?`<span class="processing-ollama-role ${d?"is-online":"is-offline"}">\u5D4C\u5165 \xB7 ${r(o.embedding_model)}</span>`:'<span class="processing-ollama-role is-offline">\u672A\u8A2D\u5B9A\u5D4C\u5165\u6A21\u578B</span>',o.chat_model?`<span class="processing-ollama-role is-offline">\u804A\u5929 \xB7 ${r(o.chat_model)}</span>`:""].filter(Boolean).join("");return`<article class="processing-ollama-host ${d?"is-online":"is-offline"}" data-ollama-host data-host-id="${Number(o.id)}">
        <span class="processing-ollama-handle" aria-hidden="true">${m("grid",14)}</span>
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
    <p class="processing-ollama-hint">\u62D6\u79FB\u6216\u4F7F\u7528\u7BAD\u982D\u8ABF\u6574 embedding \u512A\u5148\u9806\u5E8F\uFF1B\u76EE\u524D\u4E3B\u6A5F\u7121\u6CD5\u4F7F\u7528\u6642\uFF0C\u6703\u4F9D\u5E8F\u81EA\u52D5\u6539\u7528\u4E0B\u4E00\u53F0\uFF08\u5404\u53F0\u9700\u5177\u5099\u76F8\u540C\u7684 embedding \u6A21\u578B\uFF09\uFF0C\u76F4\u5230\u6709\u4E3B\u6A5F\u56DE\u50B3\u5411\u91CF\u3002</p>`}function sc(e,t={}){let s=e.active_run||null,a=s||e.last_run||null,n=os===e.id,i=!!s||n,o=Fn[e.id]!==void 0,l=Up.has(e.id),d=Bn(e.id),u=!l||!!e.update_available&&!d,y=!!e.can_run&&!i&&u,b=i?"\u6B64\u6D41\u7A0B\u6B63\u5728\u57F7\u884C\u4E2D\u3002":e.can_run?u?"":o?e.update_status?.status==="error"?"\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF0C\u8ACB\u5148\u6309\u300C\u6AA2\u67E5\u66F4\u65B0\u300D\u3002":e.update_status?.status==="up_to_date"?"\u76EE\u524D\u5DF2\u662F\u6700\u65B0\u7248\u672C\uFF0C\u6C92\u6709\u53EF\u66F4\u65B0\u5167\u5BB9\u3002":"\u8ACB\u5148\u6309\u300C\u6AA2\u67E5\u66F4\u65B0\u300D\uFF0C\u78BA\u8A8D\u662F\u5426\u6709\u65B0\u7248\u3002":"\u76EE\u524D\u672A\u5075\u6E2C\u5230\u53EF\u91CD\u5EFA\u7684\u7D22\u5F15\u5167\u5BB9\u3002":e.start_blocked_reason||"\u76EE\u524D\u6709\u5176\u4ED6\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",p=y?e.id==="legal_index_versions"?"\u7ACB\u5373\u91CD\u5EFA\u6CD5\u898F\uFF0F\u547D\u4EE4\u7D22\u5F15\uFF1B\u5B8C\u6210\u9A57\u8B49\u5F8C\u5207\u63DB alias":e.id==="index_versions"?"\u7ACB\u5373\u5EFA\u7ACB\u6216\u63A5\u7E8C\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\uFF1B\u5B8C\u6210\u9A57\u8B49\u5F8C\u5207\u63DB alias":"\u7ACB\u5373\u66F4\u65B0\uFF1B\u6703\u5148\u6AA2\u67E5\u7248\u672C\u4E26\u8A08\u7B97\u7E3D\u5927\u5C0F\u8207\u9810\u4F30\u6642\u9593":b,v=Array.isArray(e.command)?e.command.join(" "):"",w=d?0:Number(e.update_count)||e.update_available&&Number(e.pending_count)||0,q=e.update_origin||"\u66F4\u65B0\u5075\u6E2C",k=e.update_mechanism||"\u65E2\u6709\u66F4\u65B0\u6AA2\u67E5\u7D00\u9304",S=e.update_message||e.update_status&&e.update_status.message||"\u627E\u5230\u53EF\u66F4\u65B0\u5167\u5BB9\u3002",$=e.update_status&&e.update_status.checked_at?$e(e.update_status.checked_at):"",L=e.progress||{},z=Array.isArray(L.stages)?L.stages:[],P=String(L.active_stage||""),Y=z.find(H=>String(H.key||"")===P),me=(e.index_runtime&&e.index_runtime.current?e.index_runtime.current.month:"")||"",X=me?On(me):Y&&(Y.label||Y.key)||"",j=n&&!s?"\u555F\u52D5\u4E2D":"\u57F7\u884C\u4E2D",x=`<details class="processing-workflow-details">
      <summary>
        <span class="processing-workflow-details-title">${m(Gl[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
      </summary>
      <div class="processing-workflow-command-grid">
        <span>\u7A0B\u5F0F</span><code>${r(e.program||"\u2014")}</code>
        <span>Shell\uFF0F\u5165\u53E3</span><code>${r(e.script||"\u2014")}</code>
        <span>\u5BE6\u969B\u547D\u4EE4</span><code class="processing-workflow-command">${r(v||"\u2014")}</code>
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
          ${i?'<span class="spinner" aria-hidden="true"></span>':m("play",14)}<span>${i?j:"\u66F4\u65B0"}</span>
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
              <span class="badge badge-info">${m("activity",11)}${j}</span>
              ${s&&s.id?`<span class="mono">${r(s.id)}</span>`:""}
              ${s&&s.started_at?`<span>\u958B\u59CB ${r($e(s.started_at))}</span>`:""}
              ${X?`<span>\u76EE\u524D\u8655\u7406 <strong class="mono">${r(X)}</strong></span>`:""}
            </div>`:""}

        ${di.has(e.id)?'<div class="processing-embedding-strip-slot" data-processing-embedding-strip data-preserve-children></div>':""}
        ${e.update_available&&u?`<div class="processing-inline-update" role="status" data-processing-update-notice>
                ${m("refresh",13)}
                <span class="processing-inline-update-copy">
                  <strong>${r(q)}\u5075\u6E2C\u5230\u53EF\u66F4\u65B0\u5167\u5BB9</strong>
                  <small>\u5075\u6E2C\u6A5F\u5236\uFF1A${r(k)}${$?` \xB7 \u6AA2\u67E5\u6642\u9593 ${r($)}`:""}</small>
                  <span data-processing-update-message>${r(S)}</span>
                </span>
                ${w>0?`<span class="badge badge-warn badge-mono" data-processing-update-count>${m("refresh",10)}${c(w)}</span>`:'<span class="badge badge-warn">\u53EF\u66F4\u65B0</span>'}
              </div>`:""}
        ${x}
      </div>
    </div>`}
    ${["legal_index_versions","law_download","order_download"].includes(e.id)?em(e.index_timelines,{titleSuffix:e.id==="legal_index_versions"?"\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868":"\u4E0B\u8F09\u6642\u9593\u8868"}):""}
    ${e.id==="normalize_courts"?Pm(t):""}
    ${e.id==="backfill_law_articles"?Im(t):""}
    ${Sm(e)}
    ${e.id==="judgment_parquet"?Nm():""}
    ${e.id==="normalize_courts"?Rm():""}
    ${e.id==="backfill_law_articles"?Cm():""}
    ${e.id==="judgment_import"?jm(e):""}
    ${e.id==="index_versions"?Tm(e):""}
    ${e.id==="index_versions"?Em(t):""}
    ${e.id==="judgment_download"?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${m("calendar",14)}\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B</span>
              <button class="btn btn-ghost btn-sm" type="button" title="\u91CD\u65B0\u6383\u63CF raw_rar \u76EE\u9304\u8207\u6708\u4EFD\u72C0\u614B" data-processing-action="refresh-judgment-months">${m("refresh",13)}<span>\u91CD\u65B0\u6574\u7406</span></button>
            </div>
            <div data-judgment-months-slot data-preserve-children>${$i()}</div>
          </section>`:""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${Zt(a?.status||"idle")}
      </div>
      ${dm(a)}
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("history",14)}\u57F7\u884C\u7D00\u9304</span>
        <span class="badge badge-neutral">\u6700\u8FD1 ${c((e.recent_runs||[]).length)} \u7B46</span>
      </div>
      ${hm(e.recent_runs)}
    </section>
    ${["law_download","order_download","judgment_download"].includes(e.id)?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${m("search",14)}\u7248\u672C\u6AA2\u67E5\u7D00\u9304</span>
              <span class="badge badge-neutral">\u6700\u8FD1 ${c((e.update_history||[]).length)} \u7B46</span>
            </div>
            ${$m(e)}
          </section>`:""}
  </div>`}function In(e,t,s={},a=new Set){if(t==="overview")return Il(e,a);let i=(Array.isArray(e.workflows)?e.workflows:[]).find(o=>o.id===t);return i?sc(i,s):Il(e,a)}async function Bm(e){let t=rs(),s=`judgment.processing.slim.${t?"visitor":"admin"}`,a=()=>{try{let h=JSON.parse(window.localStorage.getItem(s)||"null");return!h?.snapshot||!h.snapshot.slim||Date.now()-Number(h.saved_at||0)>600*1e3?null:h.snapshot}catch{return null}},n=h=>{if(h?.slim)try{window.localStorage.setItem(s,JSON.stringify({snapshot:h,saved_at:Date.now()}))}catch{}};e.innerHTML=`<section class="page processing-page">
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
  </section>`;let i=e.querySelector(".processing-page"),o=e.querySelector("#processing-root"),l=e.querySelector("#processing-workflows"),d=e.querySelector("#processing-stop"),u=!1,f=document.createElement("div");f.className="processing-stage-tooltip",f.hidden=!0,i.appendChild(f),is=new Map;let y=!1,b=!1,p=!1,v=null,w="",q="",k="overview",S=null,$=!1,L=null,z=null,P=null,Y=!1,me=null,X=0,j=null,x=!1,E=null,H=0,te=null,U=!1,ie=null,Te=0,B=null,we=!1,ce=null,Le=0,Oe=!1,Ne=null,et=!1,ue=!1,re="",qe=new Set,ye=null,_e=null,Ee=null,C=-1,G="",V=0,I=0,W=null,K=[],ke=()=>({storage:P,loading:Y,error:me,courtCheck:j,courtCheckLoading:x,courtCheckError:E,lawVersionCheck:te,lawVersionCheckLoading:U,lawVersionCheckError:ie}),Fe=()=>{if(k!=="judgment_download")return;let h=o.querySelector(".processing-workflow-panel");if(!h)return;h.querySelectorAll(".judgment-month.is-active").forEach(Ce=>{Ce.classList.remove("is-active"),Ce.removeAttribute("aria-current")});let _=h.querySelector("[data-judgment-progress]");if(!_)return;let F=S?.progress,le=!!(v?.workflows||[]).find(Ce=>Ce.id==="judgment_download")?.active_run;if((!F||F.active===!1)&&!le){_.hidden=!0,_.classList.remove("is-indeterminate");let Ce=_.querySelector("[data-judgment-run]");Ce&&(Ce.hidden=!0);return}if(_.hidden=!1,!F||F.active===!1){let Ce=_.querySelector("[data-judgment-progress-phase]");Ce&&(Ce.textContent="\u6E96\u5099\u4E2D");let mt=_.querySelector("[data-judgment-progress-month]");mt&&(mt.textContent="\u2014");let Qe=_.querySelector("[data-judgment-progress-filename]");Qe&&(Qe.textContent="\u7B49\u5F85\u4E0B\u8F09\u7A0B\u5E8F\u56DE\u5831\u9032\u5EA6\u2026",Qe.title=""),_.classList.add("is-indeterminate");let kt=_.querySelector("[data-judgment-progress-bar]");kt&&(kt.style.width="");let wt=_.querySelector("[data-judgment-progress-percent]");wt&&(wt.textContent="\u2014");let ot=_.querySelector("[data-judgment-progress-size]");ot&&(ot.textContent="\u2014");let Gt=_.querySelector("[data-judgment-progress-note]");Gt&&(Gt.textContent="\u5DF2\u555F\u52D5\uFF0C\u7B49\u5F85\u9032\u5EA6\u56DE\u5831");let ts=_.querySelector("[data-judgment-run]");ts&&(ts.hidden=!0);let Vt=_.querySelector("[data-judgment-downloads]");Vt&&(Vt.hidden=!0);let ss=_.querySelector("[data-judgment-current]");ss&&(ss.hidden=!1);return}let se={preparing:"\u6E96\u5099\u4E2D",planning:"\u8A08\u7B97\u5927\u5C0F",scanning:"\u6383\u63CF\u4E2D",checking:"\u6AA2\u67E5\u4E2D",downloading:"\u4E0B\u8F09\u4E2D",saving:"\u5132\u5B58\u4E2D",finalizing:"\u6574\u7406\u4E2D"},Me=se[F.phase]||"\u8655\u7406\u4E2D",ne=Array.isArray(F.downloads)?F.downloads:[],ge=ne.length>0,Ae=_.querySelector("[data-judgment-current]");Ae&&(Ae.hidden=ge);let Re=_.querySelector("[data-judgment-downloads]");if(Re){Re.hidden=!ge;let Ce=_.querySelector("[data-judgment-downloads-count]");Ce&&(Ce.textContent=`${c(ne.length)} \u500B\u9032\u884C\u4E2D`);let mt=_.querySelector("[data-judgment-downloads-list]");mt&&ge&&(mt.innerHTML=ne.map(Qe=>{let kt=se[Qe.phase]||Me||"\u8655\u7406\u4E2D",wt=Number(Qe.bytes_written),ot=Number(Qe.total_bytes),Gt=Number.isFinite(ot)&&ot>0,ts=Qe.percent,Vt=ts==null||ts===""?Gt&&Number.isFinite(wt)?wt/ot*100:null:Number(ts),ss=Vt===null||!Number.isFinite(Vt),Ze=ss?"\u2014":`${Math.min(100,Math.max(0,Vt)).toFixed(Vt>=10?0:1)}%`,$t=Gt?`${Ie(wt)} / ${Ie(ot)}`:Number.isFinite(wt)&&wt>0?Ie(wt):"\u2014";return`<div class="processing-download-active-item">
              <div class="processing-download-active-line">
                <strong class="mono">${r(Qe.month||"\u2014")}</strong>
                <span class="processing-download-active-file mono" title="${r(Qe.filename||"")}">${r(Qe.filename||"\u2014")}</span>
                <span class="processing-download-active-percent mono">${r(Ze)}</span>
              </div>
              <div class="processing-download-active-track${ss?" is-indeterminate":""}"><span style="width:${ss?"":`${Math.min(100,Math.max(0,Vt)).toFixed(1)}%`}"></span></div>
              <div class="processing-download-active-meta">
                <span>${r(kt)}</span>
                <span>${r($t)}</span>
              </div>
            </div>`}).join(""))}let Ue=_.querySelector("[data-judgment-progress-phase]");Ue&&(Ue.textContent=Me);let at=F.month||"",yt=_.querySelector("[data-judgment-progress-month]");yt&&(yt.textContent=at||"\u2014");let vs=F.filename||"",ms=_.querySelector("[data-judgment-progress-filename]");ms&&(ms.textContent=vs||"\u2014",ms.title=vs);let bt=new Map;for(let Ce of ne)Ce.month&&bt.set(String(Ce.month),{percent:Ce.percent,phase:Ce.phase});at&&!bt.has(at)&&bt.set(at,{percent:F.percent,phase:F.phase}),h.querySelectorAll(".judgment-month.is-active").forEach(Ce=>{Ce.classList.remove("is-active","is-downloading"),Ce.removeAttribute("aria-current"),Ce.style.removeProperty("--month-progress")});for(let[Ce,mt]of bt){let Qe=h.querySelector(`[data-judgment-month-key="${Ce}"]`);if(!Qe)continue;Qe.classList.add("is-active"),(mt?.phase==="downloading"||mt?.phase==="saving")&&Qe.classList.add("is-downloading"),Qe.setAttribute("aria-current","true");let kt=Number(mt?.percent);Number.isFinite(kt)&&Qe.style.setProperty("--month-progress",`${Math.min(100,Math.max(0,kt)).toFixed(1)}%`)}let g=Number(F.bytes_written),A=Number(F.total_bytes),N=Number.isFinite(A)&&A>0,J=null,fe=F.percent;fe!=null&&fe!==""&&Number.isFinite(Number(fe))?J=Number(fe):N&&Number.isFinite(g)&&(J=g/A*100);let je=J===null;_.classList.toggle("is-indeterminate",je);let De=_.querySelector("[data-judgment-progress-bar]");De&&(De.style.width=je?"":`${Math.min(100,Math.max(0,J)).toFixed(1)}%`);let xe=_.querySelector("[data-judgment-progress-percent]");if(xe){let Ce=je?null:Math.min(100,Math.max(0,J));xe.textContent=Ce===null?"\u2014":`${Ce.toFixed(Ce>=10?0:1)}%`}let dt=_.querySelector("[data-judgment-progress-size]");if(dt){let Ce=Number.isFinite(g)&&g>0?Ie(g):"\u2014";dt.textContent=N?`${Ce} / ${Ie(A)}`:Ce}let nt=_.querySelector("[data-judgment-progress-note]");if(nt){let Ce=[],mt=Number(F.candidate_index),Qe=Number(F.candidate_total);Number.isFinite(mt)&&mt>0&&Number.isFinite(Qe)&&Qe>0&&Ce.push(`\u7B2C ${c(mt)} / ${c(Qe)} \u500B\u6708`),F.fileset_id&&Ce.push(`fileset ${F.fileset_id}`),F.message&&F.phase!=="downloading"&&Ce.push(String(F.message)),nt.textContent=Ce.join(" \xB7 ")}let qt=_.querySelector("[data-judgment-run]"),ut=F.run_files_total!==null&&F.run_files_total!==void 0;if(qt&&(qt.hidden=!ut,ut)){let Ce=Number(F.run_files_total)||0,mt=Number(F.run_files_done)||0,Qe=F.run_bytes_total===null||F.run_bytes_total===void 0?null:Number(F.run_bytes_total),kt=Number(F.run_bytes_done)||0,wt=F.run_percent,ot=wt==null||wt===""?null:Number(wt),Gt=_.querySelector("[data-judgment-run-bar]");Gt&&(Gt.style.width=ot===null||!Number.isFinite(ot)?"":`${Math.min(100,Math.max(0,ot)).toFixed(1)}%`);let ts=_.querySelector("[data-judgment-run-percent]");ts&&(ts.textContent=ot===null||!Number.isFinite(ot)?"\u2014":`${ot.toFixed(ot>=10?0:1)}%`);let Vt=_.querySelector("[data-judgment-run-files]");Vt&&(Vt.textContent=`${c(mt)} / ${c(Ce)} \u500B\u6708`);let ss=_.querySelector("[data-judgment-run-size]"),Ze=F.phase==="planning";ss&&(Qe!==null&&Qe>0?ss.textContent=`\u5DF2\u4E0B\u8F09 ${Ie(kt)} / ${Ie(Qe)}`:ss.textContent=`\u5DF2\u4E0B\u8F09 ${Ie(kt)} \xB7 ${Ze?"\u7E3D\u91CF\u8A08\u7B97\u4E2D":"\u7E3D\u91CF\u672A\u77E5"}`);let $t=_.querySelector("[data-judgment-run-elapsed]");$t&&($t.textContent=`\u5DF2\u82B1 ${Ca(F.elapsed_seconds)}`);let St=_.querySelector("[data-judgment-run-eta]");if(St){let Ms=Number(F.eta_seconds),Xn=Number(F.estimated_total_seconds);Number.isFinite(Ms)&&Ms>=0?St.textContent=`\u5269\u9918 ${Ca(Ms)} \xB7 \u9810\u4F30\u7E3D\u8A08 ${Ca(Xn)}`:St.textContent=Ze&&(F.run_bytes_total===null||F.run_bytes_total===void 0)?"\u5269\u9918\u6642\u9593\uFF1A\u8A08\u7B97\u4E2D":"\u5269\u9918\u6642\u9593\uFF1A\u2014"}}},Ye=()=>{if(k!=="judgment_download")return;let h=o.querySelector("[data-judgment-months-slot]");if(h){let _=Array.isArray(S?.months)?S.months:[];L&&!S?(h.innerHTML=Ge({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(L)}),delete h.dataset.judgmentMonthCount):S?h.dataset.judgmentMonthCount!==String(_.length)?(h.innerHTML=bm(S),h.dataset.judgmentMonthCount=String(_.length)):vm(h,S):(h.querySelector(".judgment-months-loading")||(h.innerHTML=$i()),delete h.dataset.judgmentMonthCount)}if(S){let _=hi(S),F=z!==_.pending;z=_.pending;let pe=(v?.workflows||[]).find(se=>se.id==="judgment_download");pe&&(pe.update_count=_.pending,pe.update_available=_.pending>0);let le=o.querySelector("[data-processing-update-notice]");if(le)if(_.pending<=0)le.remove();else{let se=le.querySelector("[data-processing-update-count]");se&&(se.innerHTML=`${m("refresh",10)}${c(_.pending)}`);let Me=le.querySelector("[data-processing-update-message]");Me&&(Me.textContent=`\u5224\u6C7A\u5F85\u88DC\u9F4A ${c(_.pending)} \u500B\u6708`)}F&&l&&v&&Ss(l,Pn(v,k))}Fe()},ht=()=>{let h=Array.isArray(B?.hosts)?B.hosts:[];return JSON.stringify({loading:!h.length&&we,error:!h.length&&ce?ce.message||String(ce):"",active:B?.active_host_id??null,hosts:h.map(_=>({id:_.id,name:_.name,url:_.base_url,status:_.status,detail:_.detail,embedding:_.embedding_model,chat:_.chat_model,models:(_.models||[]).map(F=>F.name)}))})},lt=()=>{let h=o.querySelector("[data-processing-ollama]");if(!h||Le)return;let _=ht();h.dataset.ollamaSignature!==_&&(h.dataset.ollamaSignature=_,h.innerHTML=Fm(B,we,B?null:ce))},tt=()=>{let _=((v?.sections||[]).find(F=>F.key==="legal")?.stages||[]).find(F=>F.key==="legal_qdrant");return ci(_?.model?.label||"")},rt=()=>{let h=o.querySelector("[data-processing-embedding-strip]");if(!h)return;let _=Array.isArray(B?.hosts)?B.hosts:[],F=[];for(let ge of _)if(ge.status==="operational")for(let Ae of ge.models||[])Array.isArray(Ae.capabilities)&&Ae.capabilities.includes("embedding")&&F.push({hostId:Number(ge.id),model:Ae.name,label:ci(`${ge.name||ge.base_url||`\u4E3B\u6A5F ${ge.id}`}:${Ae.name}`),baseUrl:ge.base_url||""});let pe=tt(),le=_.find(ge=>Number(ge.id)===Number(B?.active_host_id)),se=F.map(ge=>{let Ae=ge.label===pe;return`<button class="rag-model-button${Ae?" is-active":""}" type="button"
        data-processing-action="select-embedding-model"
        data-host-id="${ge.hostId}"
        data-model="${r(ge.model)}"
        title="${r(ge.label)}"
        aria-pressed="${Ae?"true":"false"}"
        ${ue?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(ge.label)}</span>
        ${Ae?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`});pe&&!F.some(ge=>ge.label===pe)&&se.unshift(`<button class="rag-model-button is-active is-static" type="button" aria-pressed="true" disabled>
          <span class="rag-model-state" aria-hidden="true"></span>
          <span>${r(pe)}</span>
          <span class="rag-model-current">\u4F7F\u7528\u4E2D</span>
        </button>`);let Me=F.length?`<div class="rag-model-buttons">${se.join("")}</div>`:`<p class="rag-model-empty">${we?"\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\u8207 Embedding model\u2026":ce?`\u7121\u6CD5\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\uFF1A${r(ce.message||String(ce))}`:"\u76EE\u524D\u6C92\u6709\u53EF\u7528\u7684 Embedding model\u3002"}</p>`,ne=`<div class="processing-embedding-strip rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${m("brain",13)} Embedding \u4E3B\u6A5F\uFF0F\u6A21\u578B</span>
        ${le?.base_url?`<span class="rag-model-strip-base mono">${r(le.base_url)}</span>`:""}
        <span class="rag-model-strip-current">\u76EE\u524D\uFF1A<strong>${r(pe||"\u2014")}</strong></span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-processing-action="refresh-embedding-models"
          ${we?"disabled":""}>
          ${m("refresh",12)}<span>\u6AA2\u67E5\u6A21\u578B</span>
        </button>
      </div>
      ${Me}
      <p class="rag-model-hint">\u9EDE\u9078 <span class="mono">\u4E3B\u6A5F:\u6A21\u578B</span> \u5207\u63DB Embedding\uFF1B\u9078\u53D6\u5F8C\u6703\u6210\u70BA\u7B2C\u4E00\u512A\u5148\uFF0C\u5176\u4ED6\u4E3B\u6A5F\u4F9D\u5E8F\u4F5C\u70BA\u5099\u63F4\u3002\u5207\u63DB\u6A21\u578B\u5F8C\u65E2\u6709\u7D22\u5F15\u53EF\u80FD\u9700\u8981\u91CD\u5EFA\u3002</p>
    </div>`;h.innerHTML!==ne&&(h.innerHTML=ne)},ae=h=>{let _=o.querySelector('[data-import-timeline="judgment"]');if(!_)return;let F=String(h?.active_month||""),pe=String(h?.processing_month||"");_.querySelectorAll(".processing-month").forEach(Re=>{let Ue=!!F&&Re.dataset.month===F;Re.classList.toggle("is-current",Ue),Re.classList.toggle("is-processing-current",!!pe&&Re.dataset.month===pe),Ue?Re.setAttribute("aria-current","true"):Re.removeAttribute("aria-current")});let le=_.querySelector(".index-current-row");if(!F||!h?.active_archive){le&&le.remove();return}let se=v?.workflows?.find(Re=>Re.id==="judgment_import")?.import_timeline?.stage_labels||{},Me=zl({activeMonth:F,activeArchive:h.active_archive,activePhase:h.active_phase||"",processingMonth:h.processing_month||"",processingArchive:h.processing_archive||"",stageLabels:se});if(le){le.innerHTML=Me;return}let ne=document.createElement("div");ne.className="index-current-row",ne.innerHTML=Me;let ge=_.querySelector(":scope > .side-card-head");if(ge){ge.insertAdjacentElement("afterend",ne);return}let Ae=_.querySelector(".judgment-months");Ae&&Ae.prepend(ne)},it=h=>{let _=Number(h?.state_mtime_ns);return Number.isFinite(_)?_:-1},Ke=h=>{let _=String(h?.active_month||"");return/^\d{6}$/.test(_)?Number(_):-1},ft=h=>{if(!h)return;let _=it(h);if(_>=0&&_<C){Ee?.active_month&&ae(Ee);return}_>=0&&(C=_);let F=String(h.active_month||"");if(!!(h.run_id&&h.run_id===Ee?.run_id)&&Ke(h)>=0&&Ke(h)<Ke(Ee)){let le={...h,active_month:Ee.active_month,active_archive:Ee.active_archive};Ee=le,ae(le);return}if(!F&&h.run_status==="running"){Ee?.active_month&&Ee?.run_id===h.run_id?ae(Ee):(Ee=h,ae(h));return}Ee=h,ae(h)},Mt=h=>{let _=h?.active_import;if(_){ft(_);return}Ee?.active_month&&ae(Ee)},oe=()=>{if(!(y||ye)){if(t){_e=window.setInterval(()=>{y||Ut({silent:!0,cached:!0})},3e4);return}ye=Ct(["processing","judgment-download","system-usage","ollama","court-check","law-version-check"],(h,_)=>{if(!y){if(h==="processing"){_?.snapshot?.live?Zs(_.snapshot):_?.snapshot?ha(_.snapshot,{silent:!0}):Ut({silent:!0,cached:!0});return}if(h==="judgment-download"){k==="judgment_download"&&de({quiet:!0,payload:_?.snapshot||null});return}if(h==="system-usage"){k==="index_versions"&&ve({quiet:!0,force:!0,payload:_?.snapshot||null});return}if(h==="ollama"){di.has(k)&&Je({quiet:!0,payload:_?.snapshot||null});return}if(h==="court-check"){k==="normalize_courts"&&He({quiet:!0,force:!0,payload:_?.snapshot||null});return}h==="law-version-check"&&k==="backfill_law_articles"&&ze({quiet:!0,force:!0,payload:_?.snapshot||null})}},{onProgress:(h,_)=>{if(h!=="processing")return;let F=_?.event;F&&$a(F)},onError:()=>{v||Ut({silent:!0,cached:!0})}})}},Se=()=>{ye&&(ye(),ye=null)},st=async h=>{if(ue)return;let[_,...F]=String(h||"").split("|"),pe=Number(_),le=F.join("|");if(!pe||!le){rt();return}let se=(B?.hosts||[]).find(ne=>Number(ne.id)===pe);if(!se){rt();return}let Me=ci(`${se.name||se.base_url||`\u4E3B\u6A5F ${se.id}`}:${le}`);if(Me===tt()){rt();return}if(!window.confirm(`\u5207\u63DB Embedding \u70BA ${Me}\uFF1F

\u5207\u63DB\u6A21\u578B\u5F8C\uFF0C\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u8207\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u53EF\u80FD\u4E0D\u76F8\u5BB9\uFF0C\u9700\u8981\u91CD\u65B0\u5EFA\u7ACB\u7D22\u5F15\u3002`)){rt();return}ue=!0,rt();try{await O.selectOllamaModel(pe,{model:le,role:"embedding"});let ne=(B?.hosts||[]).map(Ae=>Number(Ae.id)),ge=[pe,...ne.filter(Ae=>Ae!==pe)];await O.reorderOllamaHosts(ge),T(`\u5DF2\u5207\u63DB Embedding \u70BA ${Me}\u3002`,"ok",6e3),B=null,await Je({quiet:!0}),await Ut({silent:!0})}catch(ne){T(ne.message||"\u7121\u6CD5\u5207\u63DB Embedding model\u3002","danger",7e3),await Je({quiet:!0})}finally{ue=!1,rt()}},Je=async({quiet:h=!1,button:_=null,payload:F=null}={})=>{if(!(y||we)){if(t){we=!1,ce=new Error("\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u8A2D\u5B9A\u3002"),lt(),rt();return}we=!0,ce=null,B||(lt(),rt()),_&&he(_,!0,"\u6AA2\u67E5\u4E2D\u2026");try{let pe=F||await O.ollamaHosts();if(y)return;B=pe}catch(pe){if(y)return;ce=pe,h||T(pe.message||"\u7121\u6CD5\u6AA2\u67E5 llama-server \u4E3B\u6A5F\u3002","danger",6e3)}finally{y||(we=!1,_&&he(_,!1),lt(),rt())}}},zt=async h=>{if(et)return;let _=(B?.hosts||[]).map(se=>Number(se.id)),F=h.map(se=>Number(se));if(!F.length||F.length!==_.length||F.every((se,Me)=>se===_[Me])){lt();return}et=!0;let pe=new Map((B?.hosts||[]).map(se=>[Number(se.id),se])),le=F.map(se=>pe.get(se)).filter(Boolean);if(B&&le.length===_.length){B={...B,hosts:le,active_host_id:F[0]};let se=o.querySelector("[data-processing-ollama]");se&&(se.dataset.ollamaSignature=""),lt()}try{await O.reorderOllamaHosts(F),T("\u5DF2\u66F4\u65B0 llama-server \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","ok",3500)}catch(se){T(se.message||"\u7121\u6CD5\u66F4\u65B0 llama-server \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","danger",6e3),await Je({quiet:!0})}finally{et=!1}},At=()=>{let h=o.querySelector("[data-processing-ollama]");h&&(h.dataset.ollamaSignature=""),lt()},M=()=>{let h=Ne;if(!h)return;if(o.querySelector(`[data-ollama-host][data-host-id="${h.hostId}"]`)?.classList.remove("is-dragging"),h.captureTarget?.hasPointerCapture?.(h.pointerId))try{h.captureTarget.releasePointerCapture(h.pointerId)}catch{}document.documentElement.classList.remove("processing-ollama-dragging"),window.removeEventListener("pointermove",R),window.removeEventListener("pointerup",D),window.removeEventListener("pointercancel",Q),Ne=null,Le=0},R=h=>{let _=Ne;if(!_||h.pointerId!==_.pointerId)return;if(!_.dragging){if(Math.hypot(h.clientX-_.startX,h.clientY-_.startY)<5)return;_.dragging=!0,Le=_.hostId,Oe=!1,o.querySelector(`[data-ollama-host][data-host-id="${_.hostId}"]`)?.classList.add("is-dragging"),document.documentElement.classList.add("processing-ollama-dragging")}h.preventDefault();let F=64;h.clientY<F?window.scrollBy(0,-12):h.clientY>window.innerHeight-F&&window.scrollBy(0,12);let pe=o.querySelector("[data-ollama-list]"),le=document.elementFromPoint(h.clientX,h.clientY)?.closest?.("[data-ollama-host]");if(!pe||!le||!pe.contains(le))return;let se=pe.querySelector(`[data-ollama-host][data-host-id="${_.hostId}"]`);if(!se||se===le)return;let Me=le.getBoundingClientRect(),ne=h.clientY>Me.top+Me.height/2;pe.insertBefore(se,ne?le.nextSibling:le),Oe=!0},D=h=>{let _=Ne;if(!_||h.pointerId!==_.pointerId)return;let F=_.dragging,pe=Oe,le=o.querySelector("[data-ollama-list]"),se=F&&le?[...le.querySelectorAll("[data-ollama-host]")].map(Me=>Number(Me.dataset.hostId)):[];M(),F&&pe&&se.length&&zt(se)},Q=()=>{let h=!!Ne?.dragging;M(),h&&At()},ee=h=>{if(h.button!==0||h.pointerType==="mouse"&&h.buttons!==1||et||Ne)return;let _=h.target.closest("[data-ollama-host]");if(!_||!o.contains(_)||h.target.closest("button")||h.pointerType==="touch"&&!h.target.closest(".processing-ollama-handle"))return;let F=Number(_.dataset.hostId)||0;if(F){h.preventDefault(),Le=F,Ne={hostId:F,pointerId:h.pointerId,startX:h.clientX,startY:h.clientY,dragging:!1,captureTarget:_};try{_.setPointerCapture(h.pointerId)}catch{}window.addEventListener("pointermove",R,{passive:!1}),window.addEventListener("pointerup",D),window.addEventListener("pointercancel",Q)}},de=async({quiet:h=!1,payload:_=null}={})=>{if(!$){$=!0,!S&&k==="judgment_download"&&Ye();try{S=_||await O.judgmentDownloadStatus(),L=null}catch(F){L=F.message||"\u8B80\u53D6\u6708\u4EFD\u72C0\u614B\u5931\u6557\u3002",h||T(L,"danger",7e3)}finally{$=!1,k==="judgment_download"&&Ye()}}},ve=async({quiet:h=!0,force:_=!1,payload:F=null}={})=>{if(!Y){if(t){Y=!1,me=new Error("\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B Qdrant \u5BB9\u5668\u3001volume \u8207\u4E3B\u6A5F\u5132\u5B58\u8CC7\u8A0A\u3002"),k==="index_versions"&&Nt();return}if(!(!_&&P&&Date.now()-X<3e4)){Y=!0;try{P=F||await O.systemUsage(),me=null,X=Date.now()}catch(pe){me=pe.message||"\u7121\u6CD5\u53D6\u5F97 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002",h||T(me,"danger",7e3)}finally{Y=!1,k==="index_versions"&&Nt()}}}},He=async({quiet:h=!0,force:_=!1,payload:F=null}={})=>{if(!x&&!(!_&&j&&Date.now()-H<6e4)){x=!0;try{j=F||await O.checkCourts(),E=null,H=Date.now()}catch(pe){E=pe.message||"\u7121\u6CD5\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u3002",h||T(E,"danger",7e3)}finally{x=!1,k==="normalize_courts"&&Nt()}}},ze=async({quiet:h=!0,force:_=!1,button:F=null,payload:pe=null}={})=>{if(!U&&!(!_&&te&&Date.now()-Te<6e4)){U=!0,F&&he(F,!0,"\u6AA2\u67E5\u4E2D\u2026");try{if(te=pe||await O.checkLawVersions(),ie=null,Te=Date.now(),!h){let le=te.totals||{},se=Number(le.needs_backfill_versions)||0,Me=Number(le.backfillable_versions)||0,ne=Number(le.blocked_versions)||0;se>0?T(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u9700\u8981\u5EFA\u7ACB ${se} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF08\u53EF\u5EFA\u7ACB ${Me}\u3001\u7F3A\u539F\u59CB\u6A94 ${ne}\uFF09\u3002`,ne>0?"danger":"warn",7e3):T(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D ${Number(le.versions)||0} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`,"ok",5e3)}}catch(le){ie=le.message||"\u7121\u6CD5\u6AA2\u67E5\u689D\u6587\u6B77\u53F2\u72C0\u614B\u3002",h||T(ie,"danger",7e3)}finally{U=!1,F&&he(F,!1)}}},Be=h=>Array.from(o.querySelectorAll("[data-stage-key]")).find(_=>_.dataset.stageKey===h)||null,Xe=h=>{if(!h)return;qe.add(h);let _=Array.from(o.querySelectorAll(".processing-wf-stage[data-processing-stage]")).find(F=>F.dataset.processingStage===h);_&&(_.open=!0,_.scrollIntoView({behavior:"smooth",block:"center"}))},ct=()=>{re&&(re="",f.hidden=!0,o.querySelectorAll("[data-stage-key]").forEach(h=>{h.classList.remove("is-stage-hovered")}))},pt=h=>{let _=h.dataset.stageKey||"";if(!_)return;re=_,o.querySelectorAll("[data-stage-key]").forEach(yt=>{yt.classList.toggle("is-stage-hovered",yt.dataset.stageKey===_)});let F=h.dataset.stageStatusKey||"idle",pe=h.dataset.stageStatus||Is(F).label,le=h.dataset.stageColor||"var(--accent)",se=Number(h.dataset.stageUpdate)||0,Me=Number(h.dataset.stagePending)||0,ne=h.dataset.stageContributionLabel||"\u6574\u9AD4\u5360\u6BD4";f.innerHTML=`<div class="processing-stage-tooltip-head">
      <span class="processing-stage-tooltip-swatch" style="background:${r(le)}"></span>
      <strong>${r(h.dataset.stageLabel||_)}</strong>
      ${Zt(F,pe)}
    </div>
    <div class="processing-stage-tooltip-meta">
      <span>\u968E\u6BB5\u9032\u5EA6 <strong>${r(h.dataset.stagePercent||"\u2014")}</strong></span>
      <span>${r(ne)} <strong>${r(h.dataset.stageContribution||"\u2014")}</strong></span>
      <span class="mono">${r(h.dataset.stageDuration||"\u2014")}</span>
    </div>
    <div class="processing-stage-tooltip-counts">${r(h.dataset.stageCounts||"\u2014")}</div>
    ${se||Me?`<div class="processing-stage-tooltip-badges">
            ${se?`<span class="processing-wf-count is-update">${m("refresh",11)}<strong>${c(se)}</strong><span>\u53EF\u66F4\u65B0</span></span>`:""}
            ${Me?`<span class="processing-wf-count is-pending">${m("clock",11)}<strong>${c(Me)}</strong><span>\u5F85\u57F7\u884C</span></span>`:""}
          </div>`:""}
    ${h.dataset.stageMessage?`<div class="processing-stage-tooltip-message">${r(h.dataset.stageMessage)}</div>`:""}`,f.hidden=!1;let ge=Math.min(300,Math.max(220,window.innerWidth-24));f.style.width=`${ge}px`;let Ae=h.getBoundingClientRect(),Re=Math.min(window.innerWidth-ge-12,Math.max(12,Ae.left)),Ue=Ae.top-f.offsetHeight-10,at=Ue>=12?Ue:Math.min(window.innerHeight-f.offsetHeight-12,Ae.bottom+10);f.style.left=`${Re}px`,f.style.top=`${Math.max(12,at)}px`},fa=h=>{if(h.target.closest(".is-failure-tip")){ct();return}if(h.target.closest(".processing-wf-rail"))return;let _=h.target.closest("[data-stage-key]");!_||!o.contains(_)||_.contains(h.relatedTarget)||pt(_)},Ha=h=>{let _=h.target.closest("[data-stage-key]");if(!_||!o.contains(_)||_.contains(h.relatedTarget))return;let F=h.relatedTarget?.closest?.("[data-stage-key]");F&&F.dataset.stageKey===_.dataset.stageKey||ct()},za=h=>Array.isArray(h?.active_runs)&&h.active_runs.length||(h?.workflows||[]).some(_=>_.active_run)?!0:String(h?.update?.status||"")==="running",ba=()=>{o.querySelectorAll('[data-processing-action="stop"]').forEach(h=>he(h,!0,"\u505C\u6B62\u4E2D\u2026")),d&&he(d,!0,"\u505C\u6B62\u4E2D\u2026")},va=()=>{o.querySelectorAll('[data-processing-action="stop"]').forEach(h=>he(h,!1)),d&&he(d,!1)},Bt=new Set(["refresh","open-stage","refresh-judgment-months","refresh-court-check","refresh-law-version-check"]),Xs=()=>{t&&(i.querySelectorAll("[data-processing-action]").forEach(h=>{Bt.has(h.dataset.processingAction||"")||("disabled"in h&&(h.disabled=!1),h.removeAttribute("disabled"),h.classList.add("is-demo-locked"),h.setAttribute("aria-disabled","true"),h.removeAttribute("title"),h.dataset.demoLockTooltip="\u5C55\u793A\u6A21\u5F0F\u50C5\u4F9B\u6AA2\u8996\uFF0C\u57F7\u884C\u8207\u8A2D\u5B9A\u7531\u7BA1\u7406\u8005\u64CD\u4F5C")}),i.querySelectorAll("[data-ollama-action], [data-processing-embedding-select]").forEach(h=>{h.disabled=!0,h.classList.add("is-demo-locked"),h.removeAttribute("title"),h.dataset.demoLockTooltip="\u5C55\u793A\u6A21\u5F0F\u50C5\u4F9B\u6AA2\u8996"}))},qs=h=>{let _=h.capabilities||{};u&&!za(h)&&(u=!1,va()),!p&&d&&(d.hidden=!_.can_stop_update),u&&ba(),Xs()},Nt=()=>{if(!v)return;v.slim&&Ut({silent:!0,cached:!0});let h=In(v,k,ke(),qe);h!==w&&(Ss(o,h),w=h),Ye(),lt(),rt(),Mt(v),Xs()},ha=(h,{silent:_=!1}={})=>{if(y||!h||h.slim&&v&&!v.slim)return;let F=Date.parse(h.generated_at||""),pe=Date.parse(v?.generated_at||"");if(Number.isFinite(F)&&Number.isFinite(pe)&&F<pe)return;if(os){let ge=(h.workflows||[]).find(Ae=>Ae.id===os);Dn(ge,Ps)&&(os="",Ps="")}v=h,window.dispatchEvent(new CustomEvent("judgment:processing-pending",{detail:{count:Number(h.capabilities?.unprocessed_archives)||0,index_pending:Number(h.capabilities?.index_pending_months)||0,legal_index_pending:Number(h.capabilities?.legal_index_pending_count)||0}}));let le=new Map;for(let ge of h.sections||[])for(let Ae of ge.stages||[])le.set(`${ge.key}-${Ae.key}`,Ae);for(let[ge,Ae]of is){if(Ae.kind!=="upgrade")continue;let Re=le.get(ge);if(Re){if(Re.phase==="failed"||Re.phase==="running"&&Re.percent!==null){is.delete(ge);continue}if(Re.phase==="completed"){let Ue=Date.parse(Re.last_run?.started_at||"");Number.isFinite(Ue)&&Ue>=Number(Ae.startedAt||0)-1e3&&is.delete(ge)}}}let se=Pn(h,k);se!==q&&(Ss(l,se),q=se);let Me=In(h,k,ke(),qe);if(Me!==w&&(Ss(o,Me),w=Me),Ye(),lt(),re){let ge=Be(re);ge?pt(ge):ct()}let ne=o.querySelector("[data-processing-updated-at]");if(ne){let ge=$e(h.generated_at);ne.textContent!==ge&&(ne.textContent=ge)}if(qs(h),rt(),Mt(h),!t&&!B&&!we&&Je({quiet:!0}),K.length){let ge=K.splice(0);for(let Ae of ge)$a(Ae)}},Vn=h=>{if(W=h,typeof requestAnimationFrame>"u"){let _=W;W=null,_&&Zs(_);return}I||(I=requestAnimationFrame(()=>{I=0;let _=W;W=null,_&&Zs(_)}))},$a=h=>{if(!h)return;if(!v){K.push(h),K.length>100&&K.shift();return}let _=String(h.run_id||""),F=Number(h.seq)||0;if(_&&_===G&&F>0&&F<=V)return;_&&_!==G&&(G=_,V=0),F>0&&(V=F);let pe=String(h.workflow_id||"judgment_import"),le=String(h.month||"").replace(/\D/g,"").slice(0,6),se=(v.workflows||[]).find(Ue=>Ue.id===pe);if(!se)return;se.progress||(se.progress={stages:[]}),Array.isArray(se.progress.stages)||(se.progress.stages=[]);let Me=String(h.stage||""),ne=Me?se.progress.stages.find(Ue=>String(Ue.key)===Me):null,ge=String(se.progress.run_id||"")===String(h.run_id||"");if(ne&&h.type==="stage_progress"){let Ue=Number(h.current),at=Number(ne.current);ge&&h.status==="running"&&Number.isFinite(Ue)&&Number.isFinite(at)&&Ue<at||(h.status&&(ne.status=String(h.status)),h.current!==void 0&&(ne.current=Number(h.current)||0),h.total!==void 0&&(ne.total=Number(h.total)||0),h.percent!==void 0&&(ne.percent=Number(h.percent)||0),h.message&&(ne.message=String(h.message)))}if(ne&&h.extra&&typeof h.extra=="object")for(let Ue of["financial_processed","financial_matched","financial_percent"])h.extra[Ue]!==void 0&&(ne[Ue]=Number(h.extra[Ue])||0);if(h.type==="stage_progress"&&h.overall_percent!==void 0){let Ue=Number(h.overall_percent)||0,at=Number(se.progress.overall_percent)||0;se.progress.overall_percent=ge?Math.max(at,Ue):Ue}h.type!=="run_finished"&&(se.progress.run_status="running"),(h.type==="archive_started"||h.type==="stage_progress")&&!se.active_run&&h.run_id&&(se.active_run={id:h.run_id,status:"running",started_at:h.timestamp,message:h.message||""}),h.type==="run_finished"&&(se.active_run=null,se.progress.run_status=String(h.status||"success"),se.can_run=!0);let Ae=[];le&&h.month_stages&&Ae.push({month:le,import_stages:h.month_stages,import_overall:h.month_overall||""});let Re=null;if(h.type==="archive_started"&&le){let Ue=Date.parse(h.timestamp||"");Re={active_month:le,active_archive:h.archive,active_phase:h.stage||"filter",processing_month:le,processing_archive:h.archive,run_id:h.run_id,run_status:"running",state_mtime_ns:Number.isFinite(Ue)?Ue*1e6:Date.now()*1e6}}else h.type==="run_finished"&&(Re={...v.active_import||{},run_status:String(h.status||"success")});Vn({live:!0,generated_at:h.timestamp,workflows:[{id:pe,active_run:se.active_run,last_run:se.last_run,progress:se.progress,can_run:se.can_run}],import_timeline_months:Ae,active_import:Re})},Zs=h=>{if(y||!h||!v)return;let _=new Map((h.workflows||[]).map(ne=>[ne.id,ne]));if(os){let ne=_.get(os);Dn(ne,Ps)&&(os="",Ps="")}for(let ne of v.workflows||[]){let ge=_.get(ne.id);if(ge){if("active_run"in ge&&(ne.active_run=ge.active_run),"last_run"in ge&&(ne.last_run=ge.last_run),Array.isArray(ge.recent_runs)&&(ne.recent_runs=ge.recent_runs),"index_runtime"in ge){let Ae=ge.index_runtime;Ae&&!Ae.active_coverage&&ne.index_runtime?.active_coverage&&(Ae.active_coverage=ne.index_runtime.active_coverage),Ae&&!Ae.active_archive_coverage&&ne.index_runtime?.active_archive_coverage&&(Ae.active_archive_coverage=ne.index_runtime.active_archive_coverage),ne.index_runtime=Ae}if(ge.progress){let Ae=ge.progress,Re=ne.progress;if(ne.id==="judgment_import"&&Re?.run_id&&Re.run_id===Ae.run_id){let Ue=new Map((Re.stages||[]).map(at=>[String(at.key),at]));for(let at of Ae.stages||[]){let yt=Ue.get(String(at.key));yt&&at.status==="running"&&Number(at.current)<Number(yt.current)&&(at.current=yt.current,at.total=yt.total,at.percent=yt.percent,at.message=yt.message)}Ae.overall_percent=Math.max(Number(Re.overall_percent)||0,Number(Ae.overall_percent)||0)}ne.progress=Ae}typeof ge.can_run=="boolean"&&(ne.can_run=ge.can_run)}}let F=ne=>{if(!ne||!Array.isArray(h.import_timeline_months))return;let ge=new Map((ne.months||[]).map(Re=>[String(Re.month),Re]));for(let Re of h.import_timeline_months){let Ue=ge.get(String(Re.month));Ue&&(Ue.import_stages={...Ue.import_stages||{},...Re.import_stages||{}},Re.import_stage_progress&&(Ue.import_stage_progress={...Ue.import_stage_progress||{},...Re.import_stage_progress||{}}),Re.import_overall&&(Ue.import_overall=Re.import_overall))}let Ae={complete:0,incomplete:0,processing:0,empty:0};for(let Re of ne.months||[]){let Ue=String(Re.import_overall||"empty");Ae[Ue]=Number(Ae[Ue]||0)+1}ne.stage_summary=Ae};(ne=>{let ge=(ne.workflows||[]).find(bt=>bt.id==="index_versions"),Ae=ge?.index_runtime;if(!Ae||!Array.isArray(Ae.months))return;let Re=(ne.file_timelines||[]).find(bt=>bt.key==="judgment");if(!Re||!Array.isArray(Re.months))return;let Ue=(ge.progress?.stages||[]).find(bt=>bt.key==="validate"),at=["success","no_change"].includes(String(Ae.run_status||""))||String(Ae.run_status||"")!=="running"&&/alias\s*已切換/.test(String(Ue?.message||"")),yt=String(Ae.current?.month||""),vs=new Map(Re.months.map(bt=>[String(bt.month),bt]));for(let bt of Ae.months){let g=vs.get(String(bt.month||""));if(!g)continue;let A=g.stages||(g.stages={}),N=String(bt.status||"");N==="running"||String(bt.month)===yt?(A.qdrant="processing",g.overall="processing"):N==="success"&&A.qdrant!=="complete"&&(A.qdrant=at?"complete":"incomplete",g.overall=at?"complete":"incomplete")}let ms={complete:0,incomplete:0,processing:0,empty:0,update:0};for(let bt of Re.months){let g=String(bt.overall||"empty");ms[g]=Number(ms[g]||0)+1,bt.has_update&&(ms.update+=1)}Re.summary=ms})(v),F(v.import_timeline);for(let ne of v.workflows||[])ne.id==="judgment_import"&&F(ne.import_timeline);h.active_import&&(v.active_import=h.active_import),h.mode&&(v.mode=h.mode),h.generated_at&&(v.generated_at=h.generated_at);let le=Pn(v,k);le!==q&&(Ss(l,le),q=le);let se=In(v,k,ke(),qe);se!==w&&(Ss(o,se),w=se),Ye(),lt(),rt(),Mt(v),qs(v);let Me=o.querySelector("[data-processing-updated-at]");if(Me&&h.generated_at){let ne=$e(h.generated_at);Me.textContent!==ne&&(Me.textContent=ne)}},Ut=async({silent:h=!1,cached:_=!1,slim:F=!1}={})=>{if(!(y||b)){b=!0;try{let pe=await O.processing({cached:_,slim:F});F&&n(pe),ha(pe,{silent:h})}catch(pe){if(y)return;let le=om(pe.message,v);le!==w&&(Ss(o,le),w=le),h||T(pe.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{b=!1}}},ya=async(h,_="")=>{if(p)return;p=!0,he(h,!0,"\u6AA2\u67E5\u4E2D\u2026");let F=Fn[_]||"",pe=String(h.dataset.sourceTypes||"").split(",").map(Me=>Me.trim()).filter(Boolean),le=pe.length?pe:F?[F]:[],se=h.dataset.stageId||"";se&&(is.set(se,{kind:"check",phase:"updating",startedAt:Date.now()}),Nt());try{let Me=await O.checkUpdates(le);if(Me&&Me.checking)se&&(is.delete(se),Nt()),T("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u8ACB\u7A0D\u5F8C\u91CD\u65B0\u6574\u7406\u3002","info",6e3);else if(le.length===1){let ne=(Me.sources||{})[le[0]]||{},ge=Cl[_]||(le[0]==="judgment"?"\u5224\u6C7A":le[0]==="law"?"\u6CD5\u898F":le[0]==="order"?"\u547D\u4EE4":"\u8CC7\u6599");ne.status==="error"?T(ne.message||`${ge}\u7248\u672C\u6AA2\u67E5\u5931\u6557`,ne.details?.retryable?"warn":"danger",8e3):T(ne.update_available?`${ge}\u7DDA\u4E0A\u5DF2\u6709\u66F4\u65B0\u7248\u672C\u3002`:`${ge}\u7DDA\u4E0A\u5DF2\u662F\u6700\u65B0\u7248\u672C\u3002`,ne.update_available?"warn":"ok",6e3)}else if(le.length>1){let ne=Me.sources||{},ge=le.filter(Re=>ne[Re]?.update_available),Ae=le.filter(Re=>ne[Re]?.status==="error");if(Ae.length){let Re=ne[Ae[0]]||{};T(Re.message||`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF0C\u4F46\u6709 ${Ae.length} \u9805\u6AA2\u67E5\u5931\u6557\u3002`,Re.details?.retryable?"warn":"danger",8e3)}else T(ge.length?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${ge.length} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",ge.length?"warn":"ok",6e3)}else{let ne=Number(Me.update_count)||0;T(ne>0?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${ne} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",ne>0?"warn":"ok",6e3)}if(!(Me&&Me.checking))for(let ne of le)gi(Hp[ne]);se&&(is.set(se,{kind:"check",phase:"updated",startedAt:Date.now()}),Nt()),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await Ut({silent:!0})}catch(Me){se&&(is.delete(se),Nt()),T(Me.message||"\u66F4\u65B0\u6AA2\u67E5\u5931\u6557\u3002","danger",7e3)}finally{p=!1,he(h,!1),v&&qs(v)}},Kn=async h=>{let _=Fn[h]||"";if(!_)return!0;let F=null;try{F=await O.checkUpdates([_])}catch(le){return T(`\u7121\u6CD5\u5B8C\u6210\u7248\u672C\u6AA2\u67E5\uFF08${le.message||"\u7DB2\u8DEF\u932F\u8AA4"}\uFF09\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002`,"warn",7e3),!0}if(!F||F.checking)return F&&F.checking&&T("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","info",6e3),!0;let pe=(F.sources||{})[_];if(!pe)return!0;if(window.dispatchEvent(new CustomEvent("judgment:updates-changed")),pe.status==="up_to_date"&&!pe.update_available){let le=Cl[h]||"\u8CC7\u6599",se=pe.checked_at?`\uFF08${$e(pe.checked_at)} \u6AA2\u67E5\uFF09`:"",Me=zp[h]||"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u55CE\uFF1F";return window.confirm(`${le}\u7DDA\u4E0A\u6AA2\u67E5\u70BA\u6700\u65B0\u7248\u672C${se}\u3002

${Me}`)}return pe.status==="error"&&T(pe.message||"\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002",pe.details?.retryable?"warn":"danger",8e3),!0},ea=async(h,_)=>{if(p)return;p=!0;let F=(v?.workflows||[]).find(se=>se.id===_);Ps=F?.active_run?.id||F?.last_run?.id||"",os=_,Fn[_]&&Bl(_),he(h,!0,"\u57F7\u884C\u4E2D"),Nt();let pe=h.dataset.stageId||"",le=!1;try{if(!await Kn(_))return;pe&&(is.set(pe,{kind:"upgrade",phase:"upgrading",startedAt:Date.now()}),Nt());let Me;try{Me=await O.startProcessingWorkflow(_)}catch(ne){throw pe&&(is.delete(pe),Nt()),ne}le=!0,T(`\u5DF2\u555F\u52D5\u300C${F?.label||_}\u300D\u6D41\u7A0B\u3002`,"ok",6e3),Me&&Me.run_id&&console.info("processing workflow started",Me),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),Ut({silent:!0}),window.setTimeout(()=>{if(os!==_)return;let ne=(v?.workflows||[]).find(ge=>ge.id===_);Dn(ne,Ps)||(os="",Ps="",v&&(qs(v),w="",Nt())),Ut({silent:!0})},12e4)}catch(se){T(se.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{p=!1,le||gi(_),(!le||os!==_)&&(os="",Ps="",v?(qs(v),w="",Nt()):he(h,!1))}},Yn=async h=>{if(!(p||u)){p=!0,u=!0,he(h,!0,"\u505C\u6B62\u4E2D\u2026");try{let _=await O.stopProcessingUpdate();for(let[F,pe]of is)pe.kind==="upgrade"&&is.delete(F);Nt(),Ut({silent:!0}),T(_.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3)}catch(_){u=!1,he(h,!1),T(_.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{p=!1,u?ba():v&&qs(v)}}},Ua=h=>{let _=h.target.closest("[data-processing-action]");if(!_||_.disabled)return;if(t&&!Bt.has(_.dataset.processingAction||"")){h.preventDefault(),h.stopPropagation(),T("\u5C55\u793A\u6A21\u5F0F\u50C5\u4F9B\u6AA2\u8996\uFF0C\u57F7\u884C\u8207\u8A2D\u5B9A\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002","info",4e3);return}_.closest(".processing-wf-rail")&&(h.preventDefault(),h.stopPropagation());let F=_.dataset.processingAction;if(F==="run-workflow"&&v?.capabilities?.can_start_workflow===!1){h.preventDefault(),h.stopPropagation(),T(v.capabilities.start_blocked_reason||"\u76EE\u524D\u6709\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","info",5e3);return}if(F==="refresh")Ut({silent:!1,cached:t});else if(F==="open-stage")Xe(_.dataset.stageId||"");else if(F==="refresh-judgment-months")de({quiet:!1});else if(F==="refresh-index-storage")ve({quiet:!1,force:!0});else if(F==="refresh-court-check")He({quiet:!1,force:!0});else if(F==="refresh-law-version-check")ze({quiet:!1,force:!0,button:_});else if(F==="refresh-ollama")Je({quiet:!1,button:_});else if(F==="refresh-embedding-models")Je({quiet:!1,button:_});else if(F==="select-embedding-model"){let pe=_.dataset.hostId||"",le=_.dataset.model||"";st(`${pe}|${le}`)}else if(F==="move-ollama-host"){let pe=B?.hosts||[],le=pe.findIndex(ge=>Number(ge.id)===Number(_.dataset.hostId)),se=_.dataset.direction,Me=se==="up"?le-1:se==="down"?le+1:-1;if(le<0||Me<0||Me>=pe.length)return;let ne=pe.map(ge=>Number(ge.id));[ne[le],ne[Me]]=[ne[Me],ne[le]],zt(ne)}else if(F==="check-updates")ya(_,_.dataset.workflowId||"");else if(F==="run-workflow"){let pe=_.dataset.workflowId||"";ea(_,pe)}else F==="stop"&&Yn(_)},Ds=(h,{scroll:_=!1}={})=>{if(k=h||"overview",v){let F=Pn(v,k);Ss(l,F),q=F;let pe=In(v,k,ke(),qe);if(Ss(o,pe),w=pe,Ye(),lt(),rt(),Mt(v),re){let le=Be(re);le?pt(le):ct()}Xs(),_&&o.scrollIntoView({behavior:"smooth",block:"start"})}!t&&di.has(k)&&Je({quiet:!0}),k==="judgment_download"&&de({quiet:!0}),k==="index_versions"&&(t?(me=new Error("\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B Qdrant \u5BB9\u5668\u3001volume \u8207\u4E3B\u6A5F\u5132\u5B58\u8CC7\u8A0A\u3002"),Y=!1,Nt()):ve({quiet:!0})),k==="normalize_courts"&&He({quiet:!0}),k==="backfill_law_articles"&&ze({quiet:!0})},Ga=h=>{let _=h.target.closest("[data-processing-workflow]");_&&Ds(_.dataset.processingWorkflow||"overview")},wa=h=>{let _=h.target.closest("[data-timeline-workflow]");_&&(h.preventDefault(),Ds(_.dataset.timelineWorkflow||"",{scroll:!0}))},es=h=>{let _=h.target.closest?.(".index-wf-stage[data-index-stage]");if(_&&o.contains(_)){let se=_.dataset.indexStage||"";se&&(_.open?ui.add(se):ui.delete(se));return}let F=h.target.closest?.(".workflow-wf-stage[data-workflow-wf-stage]");if(F&&o.contains(F)){let se=F.dataset.workflowWfStage||"";se&&(F.open?pi.add(se):pi.delete(se));return}let pe=h.target.closest?.(".processing-wf-stage[data-processing-stage]");if(!pe||!o.contains(pe))return;let le=pe.dataset.processingStage||"";le&&(pe.open?qe.add(le):qe.delete(le))};i.addEventListener("click",Ua),l.addEventListener("click",Ga),o.addEventListener("click",wa),o.addEventListener("pointerover",fa),o.addEventListener("pointerout",Ha),o.addEventListener("pointerdown",ee),o.addEventListener("toggle",es,!0),window.addEventListener("scroll",ct,{capture:!0,passive:!0});let ps=a();ps&&ha(ps,{silent:!0});let Qa=Ut({silent:!0,cached:!0,slim:!0});return oe(),await Qa,()=>{y=!0,Se(),_e&&(window.clearInterval(_e),_e=null),i.removeEventListener("click",Ua),l.removeEventListener("click",Ga),o.removeEventListener("click",wa),M(),o.removeEventListener("pointerover",fa),o.removeEventListener("pointerout",Ha),o.removeEventListener("pointerdown",ee),o.removeEventListener("toggle",es,!0),window.removeEventListener("scroll",ct,{capture:!0})}}var Mi={};hs(Mi,{render:()=>Bg});var ic={new:"warning",triaged:"info",planned:"preview",resolved:"success",dismissed:"neutral"};var _i={new:"\u5F85\u8655\u7406",triaged:"\u5DF2\u5206\u985E",planned:"\u5DF2\u6392\u5165",resolved:"\u5DF2\u89E3\u6C7A",dismissed:"\u4E0D\u8655\u7406"},oc={low:"\u4F4E",medium:"\u4E2D",high:"\u9AD8"},ki=[["unknown","\u5C1A\u672A\u5224\u5B9A"],["query_parse","\u554F\u984C\u89E3\u6790\uFF0F\u65E5\u671F\u689D\u4EF6"],["financial_scope","\u91D1\u878D\u7BC4\u570D\u5224\u65B7"],["law_retrieval","\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22"],["judgment_retrieval","\u5224\u6C7A\u6AA2\u7D22"],["reranker","Reranker \u6392\u5E8F"],["context_builder","Context \u7D44\u88DD"],["llm_generation","LLM \u751F\u6210"],["citation_audit","\u5F15\u7528\u9A57\u8B49"],["answer_routing","\u56DE\u7B54\u6A21\u5F0F\u8DEF\u7531"],["refusal_policy","\u62D2\u7B54\u653F\u7B56"],["data_quality","\u8CC7\u6599\u54C1\u8CEA\uFF0F\u7248\u672C"]],Om=[["unknown","\u5C1A\u672A\u5224\u5B9A"],["correct","\u6B63\u78BA"],["partial","\u90E8\u5206\u6B63\u78BA"],["incorrect","\u932F\u8AA4"]],Hm=[["unknown","\u5C1A\u672A\u6307\u5B9A"],["law_first","\u6CD5\u898F\u512A\u5148"],["list","\u5224\u6C7A\u5217\u8868"],["structured","\u7D50\u69CB\u5316\u56DE\u7B54"],["semantic","\u4E00\u822C\u8A9E\u610F\u554F\u7B54"],["refusal","\u61C9\u62D2\u7B54"]],zm=[["unspecified","\u672A\u6307\u5B9A"],["should_answer","\u61C9\u8A72\u56DE\u7B54"],["should_refuse","\u61C9\u8A72\u62D2\u7B54"]],Um={open:"\u5F85\u8655\u7406",triaged:"\u5DF2\u5206\u985E",planned:"\u5DF2\u6392\u5165",resolved:"\u5DF2\u89E3\u6C7A",dismissed:"\u4E0D\u8655\u7406"},Gm=[["","\u672A\u6A19\u8A3B"],["supports","\u652F\u6301\u7B54\u6848"],["irrelevant","\u8207\u7B54\u6848\u7121\u95DC"],["wrong","\u5167\u5BB9\u6216\u689D\u865F\u932F\u8AA4"],["unsure","\u4E0D\u78BA\u5B9A"]];function ac(e,t){return String(e[t]||"")}function Hn(e,t=96){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:"\uFF08\u6C92\u6709\u53EF\u91CD\u73FE\u7684\u554F\u984C\uFF09"}function Qm(e){let t=e?.unsatisfied_rate===null||e?.unsatisfied_rate===void 0?"\u2014":`${Number(e.unsatisfied_rate).toFixed(2)}%`;return`<div class="metric-grid quality-coverage-grid rag-feedback-metrics">
    <div class="metric-card"><div class="metric-label">\u7E3D\u56DE\u994B</div><div class="metric-value">${c(e?.total||0)}</div><div class="metric-desc">\u5305\u542B\u6EFF\u610F\u8207\u4E0D\u6EFF\u610F</div></div>
    <div class="metric-card"><div class="metric-label">\u4E0D\u6EFF\u610F</div><div class="metric-value">${c(e?.unsatisfied||0)}</div><div class="metric-desc">\u4E3B\u8981\u6539\u5584\u4F86\u6E90</div></div>
    <div class="metric-card"><div class="metric-label">\u4E0D\u6EFF\u610F\u7387</div><div class="metric-value">${t}</div><div class="metric-desc">\u4E0D\u6EFF\u610F \xF7 \u7E3D\u56DE\u994B</div></div>
    <div class="metric-card"><div class="metric-label">\u5F85\u8655\u7406</div><div class="metric-value">${c(e?.new||0)}</div><div class="metric-desc">\u72C0\u614B\u70BA\u5F85\u8655\u7406</div></div>
    <div class="metric-card"><div class="metric-label">\u53EF\u884C\u52D5</div><div class="metric-value">${c(e?.actionable||0)}</div><div class="metric-desc">\u5DF2\u6A19\u8A18\u53EF\u8F49 regression</div></div>
    <div class="metric-card"><div class="metric-label">\u554F\u984C\u7FA4\u7D44</div><div class="metric-value">${c(e?.open_issues||0)}</div><div class="metric-desc">\u672A\u7D50\u6848 Issue</div></div>
  </div>
  ${Jm(e)}`}function Jm(e){let t=Array.isArray(e?.by_root_cause)?e.by_root_cause:[];if(!t.length)return"";let s=Math.max(...t.map(a=>Number(a.count)||0),1);return`<div class="rag-feedback-attribution-stats">
    <div class="report-section-title">\u932F\u8AA4\u968E\u6BB5\u5206\u5E03</div>
    ${t.map(a=>{let n=Number(a.count)||0,i=Math.max(2,n/s*100);return`<div class="rag-feedback-attribution-row">
          <span>${r(a.label||a.code)}</span>
          <span class="rag-feedback-attribution-track"><i style="width:${i}%"></i></span>
          <strong>${c(n)}</strong>
        </div>`}).join("")}
  </div>`}function Wm(e,t){let s=e.find(([a])=>a===t);return s?s[1]:t||"\u2014"}function nc(e){let t=String(e||"");return t==="unreviewed_recent"?"\u5C1A\u672A\u6AA2\u8996":t.startsWith("status:")?`\u72C0\u614B ${t.split(":")[1]||""}`:t.startsWith("retrieval:")?`\u6AA2\u7D22 ${t.split(":").slice(1).join(":")}`:t.startsWith("rerank:")?`Rerank ${t.split(":").slice(1).join(":")}`:t.startsWith("citation_audit:")?`\u5F15\u7528 ${t.split(":").slice(1).join(":")}`:t.startsWith("degraded:")?"\u964D\u7D1A\u56DE\u7B54":t==="missing_answer"?"\u6C92\u6709\u56DE\u7B54\u6587\u5B57":t==="answer_source:retrieval"?"\u53EA\u6709\u6AA2\u7D22\u7D50\u679C":t==="scope_probe:notice"?"\u7BC4\u570D\u908A\u754C":t}function Vm(e,t){let s=Array.isArray(e)?e:[],a=t?`<div class="rag-feedback-review-detail" data-review-request="${r(t.request_id)}">
        <div class="rag-feedback-review-head">
          <div>
            <div class="report-kicker">ACTIVE LEARNING SAMPLE</div>
            <div class="report-title">${r(t.question||"\uFF08\u6C92\u6709\u554F\u984C\u6587\u5B57\uFF09")}</div>
            <div class="report-sub">${r($e(t.created_at))} \xB7 request_id <span class="mono">${r(t.request_id)}</span> \xB7 \u98A8\u96AA ${c(t.risk_score)}</div>
          </div>
          <div class="rag-feedback-detail-head-actions">
            ${Pe("info",t.answer_source||"\u2014")}
            ${Pe("neutral",t.status||"\u2014")}
            <button class="judgment-dialog-close" type="button" data-review-action="close" aria-label="\u95DC\u9589\u62BD\u6A23\u660E\u7D30">${m("x",14)}</button>
          </div>
        </div>
        <div class="rag-feedback-review-reasons">
          ${(t.reasons||[]).map(n=>`<span class="badge badge-warn">${r(nc(n))}</span>`).join(" ")}
        </div>
        <pre class="rag-feedback-replay-answer">${r(t.answer_preview||"\uFF08\u6C92\u6709\u56DE\u7B54\u6587\u5B57\uFF09")}</pre>
        ${t.snapshot?.notice?`<div class="answer-notice">${r(t.snapshot.notice)}</div>`:""}
        <div class="rag-feedback-detail-grid">
          <div><span class="muted">\u6AA2\u7D22\u72C0\u614B</span><strong>${r(t.retrieval?.status||"\u2014")}</strong></div>
          <div><span class="muted">\u6AA2\u7D22\u7B46\u6578</span><strong>${c(t.retrieval?.hits||0)}</strong></div>
          <div><span class="muted">Top score</span><strong>${r(t.retrieval?.top_score??"\u2014")}</strong></div>
          <div><span class="muted">LLM</span><strong>${r(t.llm_model||"\u2014")}</strong></div>
        </div>
        <div class="rag-feedback-triage-actions">
          <button class="btn btn-primary btn-sm" type="button" data-review-action="mark" data-review-status="reviewed">${m("check",13)}<span>\u6A19\u8A18\u5DF2\u6AA2\u8996</span></button>
          <button class="btn btn-secondary btn-sm" type="button" data-review-action="mark" data-review-status="dismissed"><span>\u7565\u904E</span></button>
        </div>
      </div>`:"";return`<div class="rag-feedback-review-queue">
    <div class="rag-feedback-issues-head">
      <div>
        <div class="report-section-title">\u4E3B\u52D5\u5B78\u7FD2\u62BD\u6A23</div>
        <p class="rag-feedback-issues-note">\u5F9E\u5C1A\u672A\u6536\u5230\u56DE\u994B\u7684\u56DE\u7B54\u4E2D\uFF0C\u512A\u5148\u6311\u51FA\u964D\u7D1A\u3001\u96F6\u547D\u4E2D\u3001\u5F15\u7528\u7570\u5E38\u3001rerank \u7570\u5E38\u8207\u4F4E\u5206\u6578\u908A\u754C\u6848\u4F8B\u3002</p>
      </div>
      <div class="rag-feedback-detail-head-actions">
        <span class="badge badge-neutral badge-mono">${c(s.length)} \u7B46</span>
        <button class="btn btn-secondary btn-sm" type="button" data-feedback-action="refresh-review">${m("refresh",13)}<span>\u91CD\u65B0\u62BD\u6A23</span></button>
      </div>
    </div>
    ${s.length?`<div class="rag-feedback-review-list">${s.map(n=>`<button type="button" class="rag-feedback-review-row${t?.request_id===n.request_id?" is-active":""}"
              data-review-open="${r(n.request_id)}">
              <span class="rag-feedback-review-main">
                <strong>${r(Hn(n.question,92))}</strong>
                <small>${r(n.answer_source||"\u2014")} \xB7 ${r(n.status||"\u2014")} \xB7 ${r($e(n.created_at))}</small>
              </span>
              <span class="rag-feedback-review-risk">
                <span class="badge badge-warn">\u98A8\u96AA ${c(n.risk_score)}</span>
                ${(n.reasons||[]).slice(0,2).map(i=>`<span class="badge badge-neutral">${r(nc(i))}</span>`).join("")}
              </span>
            </button>`).join("")}</div>`:'<p class="cell-empty">\u76EE\u524D\u6C92\u6709\u9700\u8981\u4E3B\u52D5\u62BD\u6A23\u7684\u6848\u4F8B\u3002</p>'}
    ${a}
  </div>`}function Km(e,t){let s=Array.isArray(e)?e:[],a=String(t?.issue_id||"");return`<div class="rag-feedback-issues-head">
      <div>
        <div class="report-section-title">\u554F\u984C\u7FA4\u7D44\uFF08Issue\uFF09</div>
        <p class="rag-feedback-issues-note">\u628A\u76F8\u540C root cause \u7684\u56DE\u994B\u9023\u5230\u540C\u4E00\u500B\u7FA4\u7D44\uFF1B\u9EDE\u9078\u7FA4\u7D44\u53EF\u7BE9\u9078\u56DE\u994B\u3002</p>
      </div>
      <span class="badge badge-neutral badge-mono">${c(s.length)} \u7D44</span>
    </div>
    ${s.length?`<div class="rag-feedback-issues">${s.map(n=>`<button type="button" class="rag-feedback-issue${a===String(n.id)?" is-active":""}"
              data-feedback-issue-id="${n.id}">
              <span class="rag-feedback-issue-main">
                <strong>${r(n.title)}</strong>
                <small>${r(Wm(ki,n.root_cause_stage))} \xB7 ${r(Um[n.status]||n.status)}</small>
              </span>
              <span class="rag-feedback-issue-meta">
                <span class="badge badge-neutral">${c(n.feedback_count||0)} \u7B46</span>
                ${n.linked_pr_url?`<a href="${Pt(n.linked_pr_url)}" target="_blank" rel="noopener noreferrer">PR</a>`:""}
              </span>
            </button>`).join("")}</div>`:'<p class="cell-empty">\u5C1A\u672A\u5EFA\u7ACB\u554F\u984C\u7FA4\u7D44\u3002</p>'}`}function Ym(e,t){let s=e?.reason_options||[],a=e?.status_options||[],n=e?.severity_options||[];return`<form class="rag-feedback-filter" data-feedback-filter>
    <input type="hidden" name="issue_id" value="${r(ac(t,"issue_id"))}" />
    <label>\u6EFF\u610F\u5EA6
      <select name="sentiment" class="input">
        <option value="">\u5168\u90E8</option>
        <option value="unsatisfied" ${t.sentiment==="unsatisfied"?"selected":""}>\u4E0D\u6EFF\u610F</option>
        <option value="satisfied" ${t.sentiment==="satisfied"?"selected":""}>\u6EFF\u610F</option>
      </select>
    </label>
    <label>\u72C0\u614B
      <select name="status" class="input">
        <option value="">\u5168\u90E8</option>
        ${a.map(i=>`<option value="${r(i.code)}" ${t.status===i.code?"selected":""}>${r(i.label)}</option>`).join("")}
      </select>
    </label>
    <label>\u539F\u56E0
      <select name="reason" class="input">
        <option value="">\u5168\u90E8</option>
        ${s.map(i=>`<option value="${r(i.code)}" ${t.reason===i.code?"selected":""}>${r(i.label)}</option>`).join("")}
      </select>
    </label>
    <label>\u56B4\u91CD\u5EA6
      <select name="severity" class="input">
        <option value="">\u5168\u90E8</option>
        ${n.map(i=>`<option value="${r(i.code)}" ${t.severity===i.code?"selected":""}>${r(i.label)}</option>`).join("")}
      </select>
    </label>
    <label>\u932F\u8AA4\u968E\u6BB5
      <select name="root_cause_stage" class="input">
        <option value="">\u5168\u90E8</option>
        ${ki.map(([i,o])=>`<option value="${i}" ${t.root_cause_stage===i?"selected":""}>${r(o)}</option>`).join("")}
      </select>
    </label>
    <label class="rag-feedback-filter-wide">\u95DC\u9375\u5B57
      <input class="input" type="search" name="keyword" maxlength="120" value="${r(ac(t,"keyword"))}" placeholder="\u554F\u984C\u3001\u7559\u8A00\u3001request_id" />
    </label>
    <label class="rag-feedback-filter-check">
      <input type="checkbox" name="actionable" ${t.actionable?"checked":""} />
      <span>\u53EA\u770B\u53EF\u884C\u52D5</span>
    </label>
    <div class="rag-feedback-filter-actions">
      <button class="btn btn-secondary btn-sm" type="submit">\u5957\u7528\u7BE9\u9078</button>
      <button class="btn btn-ghost btn-sm" type="button" data-feedback-action="reset">\u6E05\u9664</button>
      <button class="btn btn-secondary btn-sm" type="button" data-feedback-action="export">${m("download",13)}<span>\u532F\u51FA\u4EE3\u7406 JSONL</span></button>
      <button class="btn btn-secondary btn-sm" type="button" data-feedback-action="evaluate">${m("refresh",13)}<span>\u6279\u6B21\u91CD\u8DD1\u8A55\u4F30</span></button>
      <button class="btn btn-secondary btn-sm" type="button" data-feedback-action="experiment">${m("sliders",13)}<span>A/B \u53C3\u6578\u5BE6\u9A57</span></button>
    </div>
  </form>`}function Xm(e,t){let s=e?.items||[];return s.length?`<div class="table-wrap">
    <table class="data-table is-compact rag-feedback-table">
      <thead><tr>
        <th>\u6642\u9593</th><th>\u6EFF\u610F\u5EA6</th><th>\u539F\u56E0</th><th>\u554F\u984C\u6458\u8981</th>
        <th>answer_source</th><th>\u72C0\u614B</th><th>\u56B4\u91CD\u5EA6</th><th>\u53EF\u884C\u52D5</th>
      </tr></thead>
      <tbody>
        ${s.map(a=>`<tr data-feedback-id="${a.id}" class="${Number(t)===Number(a.id)?"is-selected":""}">
              <td class="mono">${r($e(a.created_at))}</td>
              <td>${a.sentiment==="satisfied"?Pe("success","\u6EFF\u610F"):Pe("warning","\u4E0D\u6EFF\u610F")}</td>
              <td>${(a.reasons||[]).map(n=>`<span class="badge badge-neutral">${r(n)}</span>`).join(" ")||'<span class="cell-empty">\u2014</span>'}</td>
              <td class="rag-feedback-question-cell">${r(Hn(a.question))}</td>
              <td class="mono">${r(a.answer_source||"\u2014")}</td>
              <td>${Pe(ic[a.status]||"neutral",_i[a.status]||a.status||"\u2014")}</td>
              <td>${r(oc[a.severity]||a.severity||"\u2014")}</td>
              <td>${a.actionable?Pe("success","\u662F"):Pe("neutral","\u5426")}</td>
            </tr>`).join("")}
      </tbody>
    </table>
  </div>
  <div class="rag-feedback-pager">
    <span>\u7B2C ${c(e.page||1)} / ${c(e.pages||1)} \u9801\uFF0C\u5171 ${c(e.total||0)} \u7B46</span>
    <button class="btn btn-ghost btn-sm" type="button" data-feedback-action="prev" ${Number(e.page||1)<=1?"disabled":""}>\u4E0A\u4E00\u9801</button>
    <button class="btn btn-ghost btn-sm" type="button" data-feedback-action="next" ${Number(e.page||1)>=Number(e.pages||1)?"disabled":""}>\u4E0B\u4E00\u9801</button>
  </div>`:xt({iconName:"message",title:"\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u4F7F\u7528\u8005\u56DE\u994B",text:"RAG \u56DE\u7B54\u4E0B\u65B9\u7684\u6EFF\u610F\u5EA6\u6309\u9215\u9001\u51FA\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u51FA\u73FE\u53EF\u91CD\u73FE\u7684\u5FEB\u7167\u3002"})}function Zm(e){let t=String(e?.jid||"").trim();return t?`jid:${t}`:`law:${String(e?.law_name||"").trim()}:${String(e?.article_no||"").trim()}`}function rc(e,t){let s=Zm(e),a=String(t?.[s]||"");return`<label class="rag-feedback-citation-verdict">\u4F86\u6E90\u5224\u5B9A
    <select class="input" data-citation-verdict data-citation-key="${r(s)}">
      ${Gm.map(([n,i])=>`<option value="${r(n)}" ${a===n?"selected":""}>${r(i)}</option>`).join("")}
    </select>
  </label>`}function eg(e,t){let s=Array.isArray(e?.citations)&&e.citations.length?e.citations:Array.isArray(e?.judgments)?e.judgments:[],a=Array.isArray(e?.law_sources)?e.law_sources:[],n=t?.citation_verdicts||{};return`<div class="rag-feedback-replay-grid">
    <section class="rag-feedback-replay-card">
      <div class="report-section-title">\u5224\u6C7A\u5F15\u7528 ${s.length} \u7B46</div>
      ${s.length?s.map(i=>`<article class="rag-feedback-citation">
                <div class="rag-feedback-citation-head">
                  <strong>${r(i.title||i.jid||"\u5224\u6C7A")}</strong>
                  <span class="mono">${r(i.jid||"")}</span>
                </div>
                <div class="rag-feedback-citation-meta">${r([i.court,i.jdate].filter(Boolean).join(" \xB7 "))}</div>
                ${i.snippet?`<p>${r(i.snippet)}</p>`:""}
                ${rc(i,n)}
              </article>`).join(""):'<p class="cell-empty">\u6C92\u6709\u5224\u6C7A\u5F15\u7528\u3002</p>'}
    </section>
    <section class="rag-feedback-replay-card">
      <div class="report-section-title">\u6CD5\u898F\u4F86\u6E90 ${a.length} \u7B46</div>
      ${a.length?a.map(i=>`<article class="rag-feedback-citation">
                <div class="rag-feedback-citation-head">
                  <strong>${r(i.law_name||"\u6CD5\u898F")}</strong>
                  <span>${r(i.article_no||"")}</span>
                </div>
                ${i.snippet||i.text?`<p>${r(i.snippet||i.text)}</p>`:""}
                ${rc(i,n)}
              </article>`).join(""):'<p class="cell-empty">\u6C92\u6709\u6CD5\u898F\u4F86\u6E90\u3002</p>'}
    </section>
  </div>`}function tg(e){if(!e)return"";let t=e.diff||{},s=[["\u7B54\u6848\u8B8A\u66F4",t.answer_changed],["\u4F86\u6E90\u6A21\u5F0F\u8B8A\u66F4",t.answer_source_changed],["\u72C0\u614B\u8B8A\u66F4",t.status_changed],["\u6AA2\u7D22\u6A21\u5F0F\u8B8A\u66F4",t.retrieval_mode_changed]],a=(n,i,o)=>`<div class="rag-feedback-rerun-list">
    <strong>${r(n)}</strong>
    ${(i||[]).length?i.map(l=>`<span class="badge badge-${o}">${r(l)}</span>`).join(" "):'<span class="cell-empty">\u7121</span>'}
  </div>`;return`<section class="report-card rag-feedback-rerun" data-feedback-rerun>
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">CURRENT PIPELINE RERUN</div>
        <div class="report-title">\u7528\u76EE\u524D\u7CFB\u7D71\u91CD\u8DD1\u540C\u4E00\u984C</div>
        <div class="report-sub">\u6B64\u7D50\u679C\u4E0D\u6703\u8986\u5BEB\u539F\u59CB\u5FEB\u7167\uFF1B\u7528\u4F86\u6BD4\u8F03\u4FEE\u6B63\u524D\u5F8C\u3002</div>
      </div>
      <div class="rag-feedback-detail-head-actions">
        ${s.map(([n,i])=>Pe(i?"warning":"success",`${n}\uFF1A${i?"\u6709":"\u7121"}`)).join("")}
      </div>
    </div>
    <div class="report-section">
      <div class="rag-feedback-rerun-grid">
        <div>
          <div class="report-section-title">\u539F\u59CB\u56DE\u7B54</div>
          <pre class="rag-feedback-replay-answer">${r(e.previous?.answer||"")}</pre>
        </div>
        <div>
          <div class="report-section-title">\u76EE\u524D\u7CFB\u7D71\u56DE\u7B54</div>
          <pre class="rag-feedback-replay-answer">${r(e.current?.answer||"")}</pre>
        </div>
      </div>
      <div class="rag-feedback-rerun-lists">
        ${a("\u65B0\u589E\u5224\u6C7A\u5F15\u7528",t.citations_added,"ok")}
        ${a("\u79FB\u9664\u5224\u6C7A\u5F15\u7528",t.citations_removed,"warn")}
        ${a("\u65B0\u589E\u6CD5\u898F\u4F86\u6E90",t.laws_added,"ok")}
        ${a("\u79FB\u9664\u6CD5\u898F\u4F86\u6E90",t.laws_removed,"warn")}
      </div>
      <div class="rag-feedback-detail-grid">
        <div><span class="muted">\u539F\u59CB answer_source</span><strong>${r(e.previous?.answer_source||"\u2014")}</strong></div>
        <div><span class="muted">\u76EE\u524D answer_source</span><strong>${r(e.current?.answer_source||"\u2014")}</strong></div>
        <div><span class="muted">\u539F\u59CB\u6AA2\u7D22\u6A21\u5F0F</span><strong>${r(e.previous?.retrieval_mode||"\u2014")}</strong></div>
        <div><span class="muted">\u76EE\u524D\u6AA2\u7D22\u6A21\u5F0F</span><strong>${r(e.current?.retrieval_mode||"\u2014")}</strong></div>
      </div>
    </div>
  </section>`}function sg(e){if(!e)return"";let t=e.summary||{},s=Array.isArray(e.results)?e.results:[],a=(n,i,o="")=>`<div class="metric-card"><div class="metric-label">${r(n)}</div><div class="metric-value">${c(i||0)}</div>${o?`<div class="metric-desc">${r(o)}</div>`:""}</div>`;return`<div class="report-card rag-feedback-evaluation" data-feedback-evaluation="${e.id}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">OFFLINE COUNTERFACTUAL EVALUATION</div>
        <div class="report-title">\u6279\u6B21\u91CD\u8DD1\u8A55\u4F30 #${e.id}</div>
        <div class="report-sub">\u5171 ${c(e.total||0)} \u7B46 \xB7 ${r(be(e.duration_ms||0))} \xB7 \u4EE5\u76EE\u524D pipeline \u91CD\u8DD1\uFF0C\u5C0D\u7167\u539F\u59CB\u5FEB\u7167</div>
      </div>
      <div class="rag-feedback-detail-head-actions">
        ${Pe(t.failed?"warning":"success",t.failed?`${c(t.failed)} \u7B46\u5931\u6557`:"\u5168\u90E8\u5B8C\u6210")}
      </div>
    </div>
    <div class="report-section">
      <div class="metric-grid quality-coverage-grid rag-feedback-evaluation-metrics">
        ${a("\u6210\u529F",t.succeeded)}
        ${a("\u5931\u6557",t.failed)}
        ${a("\u7B54\u6848\u8B8A\u66F4",t.answer_changed)}
        ${a("\u4F86\u6E90\u6A21\u5F0F\u8B8A\u66F4",t.answer_source_changed)}
        ${a("\u5224\u6C7A\u5F15\u7528\u65B0\u589E",t.citations_added_total)}
        ${a("\u5224\u6C7A\u5F15\u7528\u79FB\u9664",t.citations_removed_total)}
      </div>
      <div class="rag-feedback-evaluation-list">
        ${s.map(n=>`<button type="button" class="rag-feedback-evaluation-row"
              data-feedback-evaluate-open="${n.feedback_id}">
              <span class="rag-feedback-evaluation-question">#${n.feedback_id} ${r(Hn(n.question||"",80))}</span>
              <span class="rag-feedback-evaluation-badges">
                ${Pe(n.status==="success"?"success":"danger",n.status==="success"?"\u5B8C\u6210":"\u5931\u6557")}
                ${n.diff?.answer_changed?Pe("warning","\u7B54\u6848\u8B8A\u66F4"):""}
                ${n.diff?.answer_source_changed?Pe("warning","\u4F86\u6E90\u8B8A\u66F4"):""}
                ${(n.diff?.citations_added||[]).length?Pe("info",`+${n.diff.citations_added.length} \u5F15\u7528`):""}
                ${(n.diff?.citations_removed||[]).length?Pe("info",`-${n.diff.citations_removed.length} \u5F15\u7528`):""}
              </span>
            </button>`).join("")}
      </div>
      <details class="rag-feedback-raw">
        <summary>\u5B8C\u6574\u8A55\u4F30 JSON</summary>
        <pre>${r(JSON.stringify(e,null,2))}</pre>
      </details>
    </div>
  </div>`}function ag(e){if(!e)return"";let t=Array.isArray(e.variants)?e.variants:[],s=Array.isArray(e.results)?e.results:[],a=e.summary||{};return`<div class="report-card rag-feedback-experiment" data-feedback-experiment="${e.id}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">OFFLINE A/B PARAMETER EXPERIMENT</div>
        <div class="report-title">A/B \u53C3\u6578\u5BE6\u9A57 #${e.id}</div>
        <div class="report-sub">${c(e.feedback_ids?.length||0)} \u7B46\u56DE\u994B \xB7 ${c(t.length)} \u500B\u8B8A\u9AD4 \xB7 ${r(be(e.duration_ms||0))}</div>
      </div>
      <div class="rag-feedback-detail-head-actions">
        ${Pe("info","\u96E2\u7DDA\u6BD4\u8F03")}
      </div>
    </div>
    <div class="report-section">
      <div class="table-wrap">
        <table class="data-table is-compact rag-feedback-experiment-table">
          <thead><tr>
            <th>\u8B8A\u9AD4</th><th>\u53C3\u6578</th><th>\u6210\u529F</th><th>\u7B54\u6848\u8B8A\u66F4</th>
            <th>\u4F86\u6E90\u8B8A\u66F4</th><th>\u76EE\u524D\u5F15\u7528\u5E73\u5747</th><th>\u5E73\u5747\u8017\u6642</th>
          </tr></thead>
          <tbody>
            ${t.map((n,i)=>{let o=a[n.name]||s[i]?.summary||{},l=n.overrides||{},d=Object.keys(l).length?Object.entries(l).map(([y,b])=>`${y}=${b}`).join(" \xB7 "):"\u76EE\u524D\u8A2D\u5B9A",u=Number(o.succeeded||0),f=u?(Number(o.current_citations_total||0)/u).toFixed(1):"\u2014";return`<tr>
                  <td><strong>${r(n.name)}</strong></td>
                  <td class="mono">${r(d)}</td>
                  <td>${c(u)} / ${c(Number(o.failed||0)+u)}</td>
                  <td>${c(o.answer_changed||0)}</td>
                  <td>${c(o.answer_source_changed||0)}</td>
                  <td>${r(f)}</td>
                  <td>${r(be(o.avg_duration_ms||0))}</td>
                </tr>`}).join("")}
          </tbody>
        </table>
      </div>
      <p class="rag-feedback-issues-note">\u9019\u662F\u96E2\u7DDA\u5DEE\u7570\u6BD4\u8F03\uFF0C\u4E0D\u662F\u81EA\u52D5\u5224\u5B9A\u54EA\u500B\u8B8A\u9AD4\u6B63\u78BA\uFF1B\u4ECD\u9700\u4EBA\u5DE5 expected behavior \u8207 benchmark \u9A57\u6536\u3002</p>
      <details class="rag-feedback-raw">
        <summary>\u5B8C\u6574\u5BE6\u9A57 JSON</summary>
        <pre>${r(JSON.stringify(e,null,2))}</pre>
      </details>
    </div>
  </div>`}function ng(e,t=[]){let s=e?.snapshot||{},a=s.pipeline_flow,n=a?ua(a,{serverDurationMs:Number(s.duration_ms)||0,embedded:!0}):"",i=Array.isArray(e?.events)?e.events:[],o=`<div class="report-section rag-feedback-priority">
      <div class="rag-feedback-priority-head">
        <span class="report-section-title">\u4F7F\u7528\u8005\u56DE\u994B \xB7 \u6700\u512A\u5148\u6AA2\u8996</span>
        ${e.sentiment==="satisfied"?Pe("success","\u6EFF\u610F"):Pe("warning","\u4E0D\u6EFF\u610F")}
      </div>
      <div class="rag-feedback-user-reasons">
        ${(e.reasons||[]).map(l=>`<span class="badge badge-warn">${r(l)}</span>`).join(" ")||'<span class="cell-empty">\u6C92\u6709\u9078\u539F\u56E0</span>'}
      </div>
      ${e.comment?`<blockquote class="rag-feedback-comment-view">${r(e.comment)}</blockquote>`:'<p class="cell-empty">\u6C92\u6709\u7559\u8A00\u3002</p>'}
    </div>`;return`<section class="report-card rag-feedback-detail" data-feedback-detail="${e.id}">
    ${o}
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">FEEDBACK REPLAY \xB7 #${e.id}</div>
        <div class="report-title">${r(Hn(e.question,140))}</div>
        <div class="report-sub">\u9001\u51FA\u6642\u9593 ${r($e(e.created_at))} \xB7 revision ${c(e.revision)} \xB7 request_id <span class="mono">${r(e.request_id)}</span></div>
      </div>
      <div class="rag-feedback-detail-head-actions">
        ${e.sentiment==="satisfied"?Pe("success","\u6EFF\u610F"):Pe("warning","\u4E0D\u6EFF\u610F")}
        ${Pe(ic[e.status]||"neutral",_i[e.status]||e.status)}
        ${e.issue?Pe("info",`Issue #${e.issue.id}`):""}
        ${e.linked_question_id?Pe("info",`\u984C\u5EAB #${e.linked_question_id}`):""}
      </div>
    </div>
    <div class="report-section">
      <div class="rag-feedback-detail-grid">
        <div><span class="muted">answer_source</span><strong>${r(e.answer_source||"\u2014")}</strong></div>
        <div><span class="muted">LLM</span><strong>${r(e.llm_model||"\u2014")}</strong></div>
        <div><span class="muted">\u8017\u6642</span><strong>${r(be(e.duration_ms||0))}</strong></div>
        <div><span class="muted">\u53EF\u7DE8\u8F2F\u81F3</span><strong>${r($e(e.editable_until))}</strong></div>
        <div><span class="muted">\u984C\u5EAB draft</span><strong>${e.linked_question_id?`#${e.linked_question_id} \xB7 pending_review`:"\u5C1A\u672A\u5EFA\u7ACB"}</strong></div>
      </div>
    </div>
    <div class="report-section">
      <div class="report-section-title">\u91CD\u73FE\u4F7F\u7528\u8005\u770B\u5230\u7684\u554F\u984C\u8207\u56DE\u7B54</div>
      <div class="rag-feedback-replay">
        <div class="rag-feedback-replay-question">${r(s.question||e.question||"")}</div>
        <pre class="rag-feedback-replay-answer">${r(s.answer||"\uFF08\u6C92\u6709\u56DE\u7B54\u6587\u5B57\uFF09")}</pre>
        ${s.notice?`<div class="answer-notice">${r(s.notice)}</div>`:""}
      </div>
      ${eg(s,e)}
    </div>
    ${n?`<div class="report-section"><div class="report-section-title">Pipeline \u5FEB\u7167</div><div class="rag-process-body">${n}</div></div>`:""}
    <div class="report-section">
      <details class="rag-feedback-raw">
        <summary>Retrieval\u3001\u6C7A\u7B56\u8207\u7CFB\u7D71\u7248\u672C</summary>
        <pre>${r(JSON.stringify({retrieval:s.retrieval,system_version:e.system_version,decisions:a?.decisions||[]},null,2))}</pre>
      </details>
      <details class="rag-feedback-raw">
        <summary>\u56DE\u994B\u4E8B\u4EF6 ${i.length} \u7B46</summary>
        <pre>${r(JSON.stringify(i,null,2))}</pre>
      </details>
    </div>
    <div class="report-section">
      <div class="report-section-title">\u7BA1\u7406\u8005 triage</div>
      <form class="rag-feedback-triage" data-feedback-triage>
        <div class="rag-feedback-choice-row rag-feedback-triage-wide">
          <fieldset class="rag-feedback-choice-group">
            <legend>\u72C0\u614B</legend>
            <div class="rag-feedback-choice-options">
              ${["new","triaged","planned","resolved","dismissed"].map(l=>`<label class="rag-feedback-choice-pill">
                <input type="radio" name="status" value="${l}" ${e.status===l?"checked":""} />
                <span>${r(_i[l]||l)}</span>
              </label>`).join("")}
            </div>
          </fieldset>
        </div>
        <div class="rag-feedback-choice-row rag-feedback-triage-wide">
          <fieldset class="rag-feedback-choice-group">
            <legend>\u56B4\u91CD\u5EA6</legend>
            <div class="rag-feedback-choice-options">
              ${["low","medium","high"].map(l=>`<label class="rag-feedback-choice-pill">
                <input type="radio" name="severity" value="${l}" ${e.severity===l?"checked":""} />
                <span>${r(oc[l]||l)}</span>
              </label>`).join("")}
            </div>
          </fieldset>
          <label class="rag-feedback-filter-check">
            <input type="checkbox" name="actionable" ${e.actionable?"checked":""} />
            <span>\u53EF\u884C\u52D5 / \u8F49 regression</span>
          </label>
        </div>
        <div class="rag-feedback-choice-row rag-feedback-triage-wide">
          <fieldset class="rag-feedback-choice-group">
            <legend>\u4E3B\u8981\u932F\u8AA4\u968E\u6BB5</legend>
            <div class="rag-feedback-choice-options">
              ${ki.map(([l,d])=>`<label class="rag-feedback-choice-pill">
                <input type="radio" name="root_cause_stage" value="${l}" ${e.root_cause_stage===l?"checked":""} />
                <span>${r(d)}</span>
              </label>`).join("")}
            </div>
          </fieldset>
        </div>
        <div class="rag-feedback-choice-row rag-feedback-triage-wide">
          <fieldset class="rag-feedback-choice-group">
            <legend>\u9810\u671F\u56DE\u7B54\u6A21\u5F0F</legend>
            <div class="rag-feedback-choice-options">
              ${Hm.map(([l,d])=>`<label class="rag-feedback-choice-pill">
                <input type="radio" name="expected_answer_mode" value="${l}" ${e.expected_answer_mode===l?"checked":""} />
                <span>${r(d)}</span>
              </label>`).join("")}
            </div>
          </fieldset>
        </div>
        <div class="rag-feedback-attribution rag-feedback-triage-wide">
          <label>\u9810\u671F\u65E5\u671F\u8D77
            <input class="input" type="date" name="expected_date_from" value="${r(e.expected_date_from||"")}" />
          </label>
          <label>\u9810\u671F\u65E5\u671F\u8FC4
            <input class="input" type="date" name="expected_date_to" value="${r(e.expected_date_to||"")}" />
          </label>
        </div>
        <div class="rag-feedback-issue-link rag-feedback-triage-wide">
          <label>\u554F\u984C\u7FA4\u7D44
            <select class="input" name="issue_id">
              <option value="">\u672A\u5206\u985E</option>
              ${t.map(l=>`<option value="${l.id}" ${Number(e.issue_id)===Number(l.id)?"selected":""}>#${l.id} ${r(l.title)}\uFF08${c(l.feedback_count||0)} \u7B46\uFF09</option>`).join("")}
            </select>
          </label>
          <label>\u5EFA\u7ACB\u65B0\u7FA4\u7D44
            <input class="input" type="text" name="new_issue_title" maxlength="300" placeholder="\u4F8B\uFF1A\u8FD1\u4E8C\u5E74\u65E5\u671F filter \u672A\u5957\u7528" />
          </label>
          <button class="btn btn-secondary btn-sm" type="button" data-feedback-action="create-issue" data-feedback-id="${e.id}">
            ${m("plus",13)}<span>\u5EFA\u7ACB\u4E26\u9023\u7D50</span>
          </button>
        </div>
        <div class="rag-feedback-choice-row rag-feedback-triage-wide">
          <fieldset class="rag-feedback-choice-group">
            <legend>\u7B54\u6848\u5224\u5B9A</legend>
            <div class="rag-feedback-choice-options">
              ${Om.map(([l,d])=>`<label class="rag-feedback-choice-pill">
                <input type="radio" name="answer_verdict" value="${l}" ${e.answer_verdict===l?"checked":""} />
                <span>${r(d)}</span>
              </label>`).join("")}
            </div>
          </fieldset>
        </div>
        <div class="rag-feedback-choice-row rag-feedback-triage-wide">
          <fieldset class="rag-feedback-choice-group">
            <legend>\u9810\u671F\u62D2\u7B54\u5224\u5B9A</legend>
            <div class="rag-feedback-choice-options">
              ${zm.map(([l,d])=>`<label class="rag-feedback-choice-pill">
                <input type="radio" name="expected_refusal" value="${l}" ${e.expected_refusal===l?"checked":""} />
                <span>${r(d)}</span>
              </label>`).join("")}
            </div>
          </fieldset>
          <label class="rag-feedback-filter-check">
            <input type="checkbox" name="citation_missing" ${e.citation_verdicts?.missing?"checked":""} />
            <span>\u6709\u61C9\u8A72\u5F15\u7528\u4F46\u6F0F\u6389\u7684\u4F86\u6E90</span>
          </label>
        </div>
        <label class="rag-feedback-triage-wide">\u4EBA\u5DE5\u5EFA\u8B70 Agent \u4FEE\u6B63\u7684\u65B9\u5411 prompt\uFF08\u6703\u9032 Agent JSONL\uFF0C\u4E0D\u542B\u539F\u59CB\u7559\u8A00\uFF09
          <textarea class="input" name="expected_behavior" rows="3" maxlength="4000"
            placeholder="\u4F8B\uFF1A\u8FD1\u4E8C\u5E74\u67E5\u8A62\u5FC5\u9808\u986F\u793A\u5BE6\u969B\u65E5\u671F\u7BC4\u570D\uFF0C\u4E14\u53EA\u5F15\u7528\u8A72\u7BC4\u570D\u5167\u7684\u5224\u6C7A\uFF1B\u67E5\u7121\u8CC7\u6599\u6642\u660E\u78BA\u8AAA\u660E\uFF0C\u4E0D\u8981\u751F\u6210\u5224\u6C7A\u6E05\u55AE\u3002">${r(e.expected_behavior||"")}</textarea>
        </label>
        <label class="rag-feedback-triage-wide">\u5BE9\u67E5\u5099\u8A3B\uFF08\u50C5\u7BA1\u7406\u8005\u53EF\u898B\uFF09
          <textarea class="input" name="review_comment" rows="3" maxlength="4000"
            placeholder="\u4F8B\uFF1A\u5DF2\u78BA\u8A8D\u662F\u5F15\u7528\u689D\u865F\u932F\u8AA4\uFF1B\u4EA4\u7531 #123 \u4FEE\u6B63\uFF0C\u5B8C\u6210\u5F8C\u56DE\u586B PR\u3002">${r(e.review_comment||"")}</textarea>
        </label>
        <div class="rag-feedback-triage-actions">
          <button class="btn btn-primary btn-sm" type="submit">${m("check",13)}<span>\u5132\u5B58 triage</span></button>
          <button class="btn btn-secondary btn-sm" type="button"
            data-feedback-action="rerun" data-feedback-id="${e.id}">
            ${m("refresh",13)}<span>\u7528\u76EE\u524D\u7CFB\u7D71\u91CD\u8DD1</span>
          </button>
          <button class="btn btn-secondary btn-sm" type="button"
            data-feedback-action="promote" data-feedback-id="${e.id}"
            ${e.linked_question_id||!e.actionable||!String(e.expected_behavior||"").trim()?"disabled":""}
            title="${e.linked_question_id?"\u5DF2\u5EFA\u7ACB\u984C\u5EAB draft":"\u9700\u5148\u6A19\u8A18\u53EF\u884C\u52D5\u4E26\u586B\u5BEB\u4EBA\u5DE5\u5EFA\u8B70 Agent \u4FEE\u6B63\u65B9\u5411\u7684 prompt"}">
            ${m("plus",13)}<span>${e.linked_question_id?`\u5DF2\u5EFA\u7ACB\u984C\u5EAB draft #${e.linked_question_id}`:"\u5EFA\u7ACB\u984C\u5EAB draft"}</span>
          </button>
        </div>
      </form>
    </div>
  </section>`}function lc(e,{onStats:t}={}){let s=null,a={sentiment:"unsatisfied"},n=1,i=null,o=null,l=null,d=[],u=null,f=null,y=[],b=null,p=!1,v=P=>{typeof t=="function"&&t(P)},w=()=>{e.innerHTML=`<div class="report-card rag-feedback-workspace">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">USER FEEDBACK</div>
          <div class="report-title">\u4F7F\u7528\u8005\u56DE\u994B</div>
          <div class="report-sub">\u53EA\u986F\u793A server-side snapshot\uFF1B\u539F\u59CB\u7559\u8A00\u50C5\u4F9B\u7BA1\u7406\u8005\u6AA2\u8996\uFF0C\u4EE3\u7406\u532F\u51FA\u4E0D\u542B\u7559\u8A00\u3002</div>
        </div>
        <button class="btn btn-secondary btn-sm" type="button" data-feedback-action="refresh">${m("refresh",13)}<span>\u91CD\u65B0\u6574\u7406</span></button>
      </div>
      <div class="report-section" data-feedback-stats></div>
      <div class="report-section" data-feedback-review-queue></div>
      <div class="report-section" data-feedback-issues></div>
      <div class="report-section" data-feedback-filter-slot></div>
      <div class="report-section" data-feedback-list></div>
      <div data-feedback-evaluation-slot></div>
      <div data-feedback-experiment-slot></div>
      <div data-feedback-detail-slot></div>
    </div>`},q=()=>{if(!s||p)return;let P=e.querySelector("[data-feedback-stats]"),Y=e.querySelector("[data-feedback-review-queue]"),me=e.querySelector("[data-feedback-issues]"),X=e.querySelector("[data-feedback-filter-slot]"),j=e.querySelector("[data-feedback-list]"),x=e.querySelector("[data-feedback-evaluation-slot]"),E=e.querySelector("[data-feedback-experiment-slot]"),H=e.querySelector("[data-feedback-detail-slot]");P&&(P.innerHTML=Qm(s.stats||{})),Y&&(Y.innerHTML=Vm(y,b)),me&&(me.innerHTML=Km(d,a)),X&&(X.innerHTML=Ym(s,a)),j&&(j.innerHTML=Xm(s,i)),x&&(x.innerHTML=sg(u)),E&&(E.innerHTML=ag(f)),H&&(H.innerHTML=o?`${ng(o,d)}${tg(l)}`:""),v(s.stats||{})},k=async()=>{try{let P=await O.ragReviewQueue({limit:10});y=Array.isArray(P?.candidates)?P.candidates:[]}catch{y=[]}p||q()},S=async()=>{try{let P=await O.ragFeedbackIssues({limit:100});d=Array.isArray(P?.issues)?P.issues:[]}catch{d=[]}p||q()},$=async()=>{he(e.querySelector('[data-feedback-action="refresh"]'),!0,"\u8B80\u53D6\u4E2D\u2026");try{s=await O.ragFeedbackList({...a,page:n,page_size:25}),q()}catch(P){let Y=e.querySelector("[data-feedback-list]");Y&&(Y.innerHTML=Ge({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6\u4F7F\u7528\u8005\u56DE\u994B",text:r(P.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})),T("\u4F7F\u7528\u8005\u56DE\u994B\u8B80\u53D6\u5931\u6557\u3002","danger")}finally{he(e.querySelector('[data-feedback-action="refresh"]'),!1)}},L=async P=>{i=Number(P),l=null,q();try{o=await O.ragFeedbackDetail(i),p||q()}catch(Y){T(Y.message||"\u7121\u6CD5\u8B80\u53D6\u56DE\u994B\u660E\u7D30\u3002","danger")}},z=P=>{let Y=new FormData(P);a={sentiment:String(Y.get("sentiment")||""),status:String(Y.get("status")||""),reason:String(Y.get("reason")||""),severity:String(Y.get("severity")||""),issue_id:String(Y.get("issue_id")||""),root_cause_stage:String(Y.get("root_cause_stage")||""),keyword:String(Y.get("keyword")||"").trim(),actionable:Y.get("actionable")?"1":""},u=null,f=null,n=1};return e.addEventListener("submit",async P=>{let Y=P.target.closest("[data-feedback-filter]");if(Y){P.preventDefault(),z(Y),i=null,o=null,l=null,await $();return}let me=P.target.closest("[data-feedback-triage]");if(me){if(P.preventDefault(),!o)return;let X=new FormData(me),j={};e.querySelectorAll("[data-citation-verdict]").forEach(E=>{let H=String(E.value||"").trim(),te=String(E.dataset.citationKey||"").trim();H&&te&&(j[te]=H)}),X.get("citation_missing")&&(j.missing=!0);let x=me.querySelector('button[type="submit"]');he(x,!0,"\u5132\u5B58\u4E2D\u2026");try{o=await O.ragFeedbackUpdate(o.id,{status:String(X.get("status")||""),severity:String(X.get("severity")||""),actionable:!!X.get("actionable"),expected_behavior:String(X.get("expected_behavior")||""),root_cause_stage:String(X.get("root_cause_stage")||"unknown"),answer_verdict:String(X.get("answer_verdict")||"unknown"),expected_answer_mode:String(X.get("expected_answer_mode")||"unknown"),expected_refusal:String(X.get("expected_refusal")||"unspecified"),expected_date_from:String(X.get("expected_date_from")||""),expected_date_to:String(X.get("expected_date_to")||""),citation_verdicts:j,issue_id:String(X.get("issue_id")||""),review_comment:String(X.get("review_comment")||"")}),q(),T("\u5DF2\u5132\u5B58\u56DE\u994B triage\u3002","ok"),s=await O.ragFeedbackList({...a,page:n,page_size:25}),q()}catch(E){T(E.message||"triage \u5132\u5B58\u5931\u6557\u3002","danger")}finally{he(x,!1)}}}),e.addEventListener("click",async P=>{let Y=P.target.closest("[data-feedback-action]");if(Y){let H=Y.dataset.feedbackAction;if(H==="refresh"){await $();return}if(H==="reset"){a={sentiment:"unsatisfied"},n=1,i=null,o=null,await $();return}if(H==="prev"){if(n<=1)return;n-=1,await $();return}if(H==="next"){if(n>=Number(s?.pages||1))return;n+=1,await $();return}if(H==="experiment"){he(Y,!0,"\u5BE6\u9A57\u4E2D\u2026");try{f=await O.ragFeedbackExperiment({filters:a,limit:5,variants:EXPERIMENT_PRESETS}),q(),T(`\u5DF2\u5B8C\u6210 ${c(f.feedback_ids?.length||0)} \u7B46 A/B \u53C3\u6578\u5BE6\u9A57\u3002`,"ok",6200)}catch(te){T(te.message||"A/B \u5BE6\u9A57\u5931\u6557\u3002","danger")}finally{he(Y,!1)}return}if(H==="evaluate"){he(Y,!0,"\u8A55\u4F30\u4E2D\u2026");try{u=await O.ragFeedbackEvaluate({filters:a,limit:10}),q(),T(`\u5DF2\u5B8C\u6210 ${c(u.total||0)} \u7B46\u6279\u6B21\u91CD\u8DD1\u8A55\u4F30\u3002`,"ok",6200)}catch(te){T(te.message||"\u6279\u6B21\u8A55\u4F30\u5931\u6557\u3002","danger")}finally{he(Y,!1)}return}if(H==="export"){he(Y,!0,"\u532F\u51FA\u4E2D\u2026");try{let te=await O.ragFeedbackExport(a);Qt(`rag-feedback-agent-${new Date().toISOString().slice(0,10)}.jsonl`,te,"application/x-ndjson;charset=utf-8"),T("\u5DF2\u532F\u51FA\u4EE3\u7406\u7528 JSONL\uFF1B\u4E0D\u542B\u539F\u59CB\u7559\u8A00\u3002","ok")}catch(te){T(te.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}finally{he(Y,!1)}return}if(H==="refresh-review"){await k(),T("\u5DF2\u91CD\u65B0\u62BD\u6A23\u3002","ok",3200);return}if(H==="create-issue"){let te=Y.dataset.feedbackId,U=Y.closest("[data-feedback-triage]"),ie=String(U?.elements.new_issue_title?.value||"").trim();if(ie.length<4){T("\u554F\u984C\u7FA4\u7D44\u6A19\u984C\u81F3\u5C11\u9700\u8981 4 \u500B\u5B57\u3002","warn"),U?.elements.new_issue_title?.focus();return}let Te=String(U?.elements.root_cause_stage?.value||"unknown"),B=U?.querySelector('input[name="severity"]:checked')?.value||"medium";he(Y,!0,"\u5EFA\u7ACB\u4E2D\u2026");try{let we=await O.ragFeedbackIssueCreate({title:ie,root_cause_stage:Te,severity:B,description:""});o=await O.ragFeedbackUpdate(te,{issue_id:we.id}),await S(),q(),T(`\u5DF2\u5EFA\u7ACB\u554F\u984C\u7FA4\u7D44 #${we.id} \u4E26\u9023\u7D50\u3002`,"ok",6200)}catch(we){T(we.message||"\u5EFA\u7ACB\u554F\u984C\u7FA4\u7D44\u5931\u6557\u3002","danger")}finally{he(Y,!1)}return}if(H==="rerun"){let te=Y.dataset.feedbackId;he(Y,!0,"\u91CD\u8DD1\u4E2D\u2026");try{l=await O.ragFeedbackRerun(te),q(),T("\u5DF2\u5B8C\u6210\u76EE\u524D\u7CFB\u7D71\u91CD\u8DD1\uFF0C\u8ACB\u67E5\u770B diff\u3002","ok",5200)}catch(U){T(U.message||"\u91CD\u8DD1\u5931\u6557\u3002","danger")}finally{he(Y,!1)}return}if(H==="promote"){let te=Y.dataset.feedbackId;he(Y,!0,"\u5EFA\u7ACB\u4E2D\u2026");try{let U=await O.ragFeedbackPromote(te);o=U.feedback,await S(),q(),T(U.reused?`\u5DF2\u9023\u7D50\u65E2\u6709\u984C\u5EAB draft #${U.item.id}\u3002`:`\u5DF2\u5EFA\u7ACB\u984C\u5EAB draft #${U.item.id}\uFF08pending_review\uFF09\u3002`,"ok",6200),s=await O.ragFeedbackList({...a,page:n,page_size:25}),q()}catch(U){T(U.message||"\u5EFA\u7ACB\u984C\u5EAB draft \u5931\u6557\u3002","danger")}finally{he(Y,!1)}return}}let me=P.target.closest("[data-review-action]");if(me){let H=me.dataset.reviewAction;if(H==="close"){b=null,q();return}if(H==="mark"&&b){he(me,!0,"\u5132\u5B58\u4E2D\u2026");try{await O.ragReviewMark(b.request_id,{status:me.dataset.reviewStatus||"reviewed"}),b=null,await k(),q(),T("\u5DF2\u66F4\u65B0\u4E3B\u52D5\u62BD\u6A23\u72C0\u614B\u3002","ok",4200)}catch(te){T(te.message||"\u66F4\u65B0\u62BD\u6A23\u72C0\u614B\u5931\u6557\u3002","danger")}finally{he(me,!1)}return}}let X=P.target.closest("[data-review-open]");if(X){try{b=await O.ragReviewCandidate(X.dataset.reviewOpen),q()}catch(H){T(H.message||"\u7121\u6CD5\u8B80\u53D6\u62BD\u6A23\u660E\u7D30\u3002","danger")}return}let j=P.target.closest("[data-feedback-evaluate-open]");if(j){await L(j.dataset.feedbackEvaluateOpen);return}let x=P.target.closest("[data-feedback-issue-id]");if(x){if(P.target.closest("a"))return;let H=String(x.dataset.feedbackIssueId||"");a.issue_id=String(a.issue_id||"")===H?"":H,n=1,i=null,o=null,l=null,u=null,f=null,await $();return}let E=P.target.closest("tr[data-feedback-id]");E&&await L(E.dataset.feedbackId)}),w(),{show(){if(!p)return q(),S(),k(),$()},refresh(){return S(),k(),$()},dispose(){p=!0}}}var Si={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u522A\u9664\uFF0F\u9000\u5F79",badge:"badge-neutral"}},bs={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},ma={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},cc={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function Fa(e){let t=Si[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${r(t.label)}</span>`}function xi(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function rg(e){return xi(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",source_type:a||""}})}function ig(e){return xi(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",article_no:a||""}})}function og(e){return xi(e).map(t=>({jid:t.trim()}))}function lg(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function cg(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function dg(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function ug(e){return(e?.tags||[]).join(", ")}function Da(e){return`<div class="qb-empty">${m("info",18)}<span>${r(e)}</span></div>`}function Ai(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),n=[...t.map(i=>`<span class="chip">${r(i)}</span>`),...s.map(i=>`<span class="chip">${r(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${r(i)}</span>`)];return n.length?`<div class="chips qb-labels">${n.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function qi(){return`<details class="qb-import">
    <summary>${m("upload",14)}JSON \u6279\u6B21\u532F\u5165</summary>
    <p class="qb-muted">\u683C\u5F0F\uFF1A<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>\u3002\u76F8\u540C\u984C\u76EE fingerprint \u9810\u8A2D\u66F4\u65B0\u3002</p>
    <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
    <div class="qb-actions">
      <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${m("upload",13)}<span>\u532F\u5165 JSON</span></button>
    </div>
  </details>`}function pg(e){let t=e?.item||{},s=Array.isArray(e?.warnings)?e.warnings:[],a=Array.isArray(t.tags)?t.tags:[];return`<section class="report-card qb-card qb-ai-result">
    <div class="side-card-head">
      <span class="side-card-title">${m("sparkles",14)}llama-server \u5DF2\u5EFA\u7ACB\u984C\u76EE #${t.id}</span>
      ${Fa(t.status)}
    </div>
    <div class="qb-ai-answer">
      <strong>${r(t.question||"")}</strong>
      <div class="qb-ai-meta">
        ${r(bs[t.question_type]||t.question_type||"")}
        \xB7 ${r(ma[t.difficulty]||t.difficulty||"")}
        \xB7 ${r(e?.model||"\u672C\u6A5F llama-server")}
      </div>
      ${Ai(t)}
      ${t.reference_answer?`<div class="qb-reference"><span class="summary-label">llama-server \u53C3\u8003\u7B54\u6848</span><p>${r(t.reference_answer)}</p></div>`:""}
      ${a.length?`<div class="chips">${a.map(n=>`<span class="chip">${r(n)}</span>`).join("")}</div>`:""}
      ${s.length?`<div class="qb-ai-warnings"><strong>\u9700\u8981\u6CE8\u610F</strong><ul>${s.map(n=>`<li>${r(n)}</li>`).join("")}</ul></div>`:""}
      <div class="qb-actions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="review-ai-item">${m("shield",13)}<span>\u524D\u5F80\u9A57\u6536</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="reset-ai">${m("plus",13)}<span>\u518D\u65B0\u589E\u4E00\u984C</span></button>
      </div>
    </div>
    ${qi()}
  </section>`}function mg(e){return e.aiResult?pg(e.aiResult):`<section class="report-card qb-card">
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
    ${qi()}
  </section>`}var dc=[["clarity","\u984C\u76EE\u6E05\u6670"],["labels","\u6CD5\u689D\u6A19\u6CE8"],["answer","\u53C3\u8003\u7B54\u6848"],["difficulty","\u96E3\u5EA6\u8207\u6A19\u7C64"],["overall","\u6574\u9AD4"]];function pc(e){let t=Array.isArray(e?.reviews)?e.reviews:[],s=`<div class="side-card-head">
    <span class="side-card-title">${m("shield",14)}\u4EBA\u5DE5\u9A57\u6536\u6279\u6CE8\u5206\u6578</span>
    <span class="badge badge-neutral badge-mono">${c(t.length)} \u7B46</span>
  </div>`;if(!t.length)return`<section class="qb-review-scores-block">
      ${s}
      <div class="qb-empty qb-score-history-empty">\u5C1A\u7121\u4EBA\u5DE5\u9A57\u6536\u8A55\u5206\uFF1B\u5B8C\u6210\u9A57\u6536\u5F8C\u6703\u986F\u793A\u4E94\u9805\u5206\u6578\u8207\u6279\u6CE8\u3002</div>
    </section>`;let a=t.map(n=>{let i=n.rubric_scores||{};return`<tr>
        <td class="cell-date">${r($e(n.created_at))}</td>
        <td>${r(n.reviewer||"\u533F\u540D")}</td>
        ${dc.map(([o])=>`<td class="cell-number"><strong class="qb-score-value ${mc(i[o])}">${r(i[o]??"\u2014")}</strong></td>`).join("")}
        <td>${Fa(n.decision==="approved"?"accepted":n.decision)}</td>
        <td class="qb-score-comment">${r(n.comment||"\u2014")}</td>
      </tr>`}).join("");return`<section class="qb-review-scores-block">
    ${s}
    <div class="table-wrap">
      <table class="data-table is-compact qb-score-history-table">
        <thead>
          <tr>
            <th scope="col">\u6642\u9593</th>
            <th scope="col">\u5BE9\u6838\u8005</th>
            ${dc.map(([,n])=>`<th scope="col" class="cell-number">${n}</th>`).join("")}
            <th scope="col">\u7D50\u679C</th>
            <th scope="col">\u6279\u6CE8</th>
          </tr>
        </thead>
        <tbody>${a}</tbody>
      </table>
    </div>
  </section>`}function gg(e){return`<section class="report-card qb-card">
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
          <select class="select" name="question_type">${Object.entries(bs).map(([t,s])=>`<option value="${t}" ${e?.question_type===t?"selected":""}>${s}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u96E3\u5EA6</span>
          <select class="select" name="difficulty">${Object.entries(ma).map(([t,s])=>`<option value="${t}" ${e?.difficulty===t?"selected":""}>${s}</option>`).join("")}</select>
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
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${r(lg(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${r(cg(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${r(dg(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${r(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${r(ug(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
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
    ${pc(e)}
    ${qi()}
  </section>`}function fg(e,t){return e?gg(e):mg(t)}function mc(e){let t=Number(e);return!Number.isFinite(t)||t<=0?"":t>=4?"is-green":t===3?"is-yellow":"is-red"}var bg=[["clarity","\u984C\u76EE\u6E05\u6670"],["labels","\u6CD5\u689D\u6A19\u6CE8"],["answer","\u53C3\u8003\u7B54\u6848"],["difficulty","\u96E3\u5EA6\u8207\u6A19\u7C64"],["overall","\u6574\u9AD4"]];function vg(e){let t=e?.latest_review||e?.reviews?.[0]||null;if(!t)return'<div class="qb-latest-scores is-empty">\u5C1A\u7121\u4EBA\u5DE5\u9A57\u6536\u8A55\u5206</div>';let s=t.rubric_scores||{};return`<div class="qb-latest-scores" title="${r(`${$e(t.created_at)} \xB7 ${t.reviewer||"\u533F\u540D"}`)}">
    <span class="qb-latest-scores-label">\u6700\u65B0\u8A55\u5206</span>
    ${bg.map(([a,n])=>`<span>${n} <strong class="qb-score-value ${mc(s[a])}">${r(s[a]??"\u2014")}</strong></span>`).join("")}
    <span class="qb-latest-scores-meta">${r(t.reviewer||"\u533F\u540D")} \xB7 ${r($e(t.created_at))}</span>
  </div>`}function hg(e){let t=e.status==="retired"||!!e.deleted_at;return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${r(e.question)}</strong>
        <span class="qb-meta">
          ${r(bs[e.question_type]||e.question_type)}
          \xB7 ${r(ma[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${Fa(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${Ai(e)}
    <div class="qb-item-foot">
      <span>\u66F4\u65B0 ${r($e(e.updated_at))}</span>
      ${e.reviewed_by?`<span>\u5BE9\u6838 ${r(e.reviewed_by)}</span>`:""}
      ${e.review_comment?`<span class="qb-comment">${r(e.review_comment)}</span>`:""}
      <div class="qb-actions">
        ${t?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="restore" data-id="${e.id}">${m("refresh",13)}<span>\u5FA9\u539F\u984C\u76EE</span></button>`:`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${m("edit",13)}<span>\u7DE8\u8F2F</span></button>
               ${["pending_review","changes_requested"].includes(e.status)?"":`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="submit-review" data-id="${e.id}">${m("upload",13)}<span>${e.status==="draft"?"\u9001\u5BE9":"\u91CD\u65B0\u9001\u5BE9"}</span></button>`}
               <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${e.id}">${m("shield",13)}<span>\u9A57\u6536</span></button>
               <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${m("trash",13)}<span>\u522A\u9664</span></button>`}
      </div>
      ${vg(e)}
    </div>
  </article>`}function $g(e){return`<section class="report-card qb-card">
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
        ${Object.entries(Si).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(bs).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(ma).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
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
      ${e.items.length?e.items.map(t=>hg(t)).join(""):Da("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${c(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}var gc=[["queue","\u5F85\u5BE9\uFF0F\u9000\u56DE"],["accepted","\u5DF2\u6838\u51C6"],["rejected","\u5DF2\u62D2\u7D55"],["draft","\u8349\u7A3F"]];function yg(e){let t=e.stats||{};return{queue:Number(t.pending_review||0)+Number(t.changes_requested||0),accepted:Number(t.accepted||0),rejected:Number(t.rejected||0),draft:Number(t.draft||0)}}function wg(e,t){let s=e.reviewFilter||"queue",a={queue:{title:"\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u6216\u9000\u56DE\u4FEE\u6539\u7684\u984C\u76EE\u3002",text:t.accepted?`\u5DF2\u6709 ${c(t.accepted)} \u984C\u6838\u51C6\u3002\u65B0\u984C\u76EE\u5EFA\u7ACB\u5F8C\u6703\u81EA\u52D5\u9001\u5BE9\uFF0C\u4E5F\u53EF\u4EE5\u5207\u63DB\u5230\u300C\u5DF2\u6838\u51C6\u300D\u91CD\u65B0\u9A57\u6536\u65E2\u6709\u984C\u76EE\u3002`:"\u5EFA\u7ACB\u984C\u76EE\u5F8C\u6703\u9810\u8A2D\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\uFF1B\u82E5\u53EA\u60F3\u5148\u4FDD\u5B58\uFF0C\u5EFA\u7ACB\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5373\u53EF\u5B58\u6210\u8349\u7A3F\u3002"},accepted:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u6838\u51C6\u984C\u76EE\u3002",text:"\u984C\u76EE\u901A\u904E\u4EBA\u5DE5\u9A57\u6536\u5F8C\u6703\u5217\u5728\u9019\u88E1\uFF1B\u4E5F\u53EF\u4EE5\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u9001\u51FA\u9A57\u6536\u3002"},rejected:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u62D2\u7D55\u984C\u76EE\u3002",text:"\u88AB\u62D2\u7D55\u7684\u984C\u76EE\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u4E2D\uFF0C\u53EF\u4FEE\u6539\u5F8C\u91CD\u65B0\u9001\u5BE9\u3002"},draft:{title:"\u76EE\u524D\u6C92\u6709\u8349\u7A3F\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u984C\u76EE\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5C31\u6703\u5B58\u6210\u8349\u7A3F\uFF0C\u4E4B\u5F8C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002"}}[s]||{title:"\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u65B0\u984C\u76EE\u5F8C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"},n=[s!=="draft"?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="new">${m("plus",13)}<span>\u65B0\u589E\u984C\u76EE</span></button>`:"",s==="queue"&&t.accepted?`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="review-filter" data-filter="accepted">${m("shield",13)}<span>\u67E5\u770B\u5DF2\u6838\u51C6 ${c(t.accepted)}</span></button>`:"",`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="go-manage">${m("database",13)}<span>\u524D\u5F80\u984C\u5EAB\u7BA1\u7406</span></button>`].filter(Boolean).join("");return`<div class="qb-empty qb-empty-block">
    <span class="qb-empty-icon">${m("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>${r(a.title)}</strong>
      <p>${r(a.text)}</p>
      <div class="qb-actions">${n}</div>
    </div>
  </div>`}function _g(e){let t=gc.find(([s])=>s===e);return t?t[1]:"\u5F85\u5BE9\uFF0F\u9000\u56DE"}function kg(e,t){return`<button class="qb-review-item${t?" is-active":""}" type="button" data-qb-action="select-review-item" data-id="${e.id}" aria-pressed="${t?"true":"false"}">
    <span class="qb-review-item-top">
      <span class="qb-id">#${e.id}</span>
      <span class="qb-review-item-meta">
        ${r(bs[e.question_type]||e.question_type)}
        \xB7 ${r(ma[e.difficulty]||e.difficulty)}
        \xB7 v${e.version}
        ${e.benchmark_ready?" \xB7 Benchmark ready":""}
        ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
      </span>
      ${Fa(e.status)}
    </span>
    <strong>${r(e.question)}</strong>
  </button>`}function Sg(e){return`<article class="qb-review-pane-card">
    <div class="qb-review-pane-head">
      <div class="qb-review-pane-title">
        <span class="qb-review-item-meta">#${e.id} \xB7 v${e.version} \xB7 ${r(bs[e.question_type]||e.question_type)} \xB7 ${r(ma[e.difficulty]||e.difficulty)}</span>
        <strong>${r(e.question)}</strong>
      </div>
      <div class="qb-review-pane-side">
        ${Fa(e.status)}
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${m("edit",13)}<span>\u7DE8\u8F2F</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
        </div>
      </div>
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${Ai(e)}
    ${e.review_comment?`<div class="qb-review-note"><span class="summary-label">\u6700\u8FD1\u6279\u6CE8${e.reviewed_by?` \xB7 ${r(e.reviewed_by)}`:""}</span><p>${r(e.review_comment)}</p></div>`:""}
    ${e.reference_answer?`<div class="qb-reference"><span class="summary-label">\u53C3\u8003\u7B54\u6848</span><p>${r(e.reference_answer)}</p></div>`:""}
    <form class="qb-review-form" data-qb-form="review" data-id="${e.id}">
      <div class="qb-score-grid">
        ${[["clarity","\u984C\u76EE\u6E05\u6670"],["labels","\u6CD5\u689D\u6A19\u6CE8"],["answer","\u53C3\u8003\u7B54\u6848"],["difficulty","\u96E3\u5EA6\u8207\u6A19\u7C64"],["overall","\u6574\u9AD4"]].map(([t,s])=>tn({name:`score_${t}`,label:s,value:4})).join("")}
      </div>
      <label class="field"><span class="field-label">\u6279\u6CE8</span><textarea class="input" name="comment" rows="3" placeholder="\u6A19\u8A3B\u7406\u7531\u3001\u9700\u8981\u4FEE\u6539\u7684\u6B04\u4F4D\uFF0C\u6216\u9A57\u6536\u7D50\u8AD6\u3002"></textarea></label>
      <div class="qb-actions qb-review-decisions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="decide" data-decision="approved">${m("check",13)}<span>\u6838\u51C6</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="decide" data-decision="changes_requested">${m("edit",13)}<span>\u9000\u56DE\u4FEE\u6539</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-qb-action="decide" data-decision="rejected">${m("x",13)}<span>\u62D2\u7D55</span></button>
      </div>
    </form>
    ${pc(e)}
  </article>`}function xg(){return`<div class="qb-empty qb-empty-block qb-review-placeholder">
    <span class="qb-empty-icon">${m("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>\u5F9E\u5DE6\u5074\u9078\u64C7\u984C\u76EE</strong>
      <p>\u9EDE\u9078\u984C\u76EE\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u984C\u5E79\u3001\u9810\u671F\u6A19\u8A3B\u3001\u53C3\u8003\u7B54\u6848\u8207\u6838\u51C6\u9078\u9805\u3002</p>
    </div>
  </div>`}function Ag(e){let t=e.reviewDetail,s=yg(e),a=e.reviewFilter||"queue",n=gc.map(([l,d])=>`<button class="chip qb-review-tab${a===l?" is-active":""}" type="button" role="tab" aria-selected="${a===l?"true":"false"}" data-qb-action="review-filter" data-filter="${l}"><span>${d}</span><span class="qb-review-tab-count">${c(s[l]||0)}</span></button>`).join(""),i=e.reviewItems.length?e.reviewItems.map(l=>kg(l,Number(t?.id)===Number(l.id))).join(""):`<div class="qb-empty qb-empty-compact">${m("info",16)}<span>\u76EE\u524D\u6C92\u6709${r(_g(a))}\u984C\u76EE\u3002</span></div>`,o=t?Sg(t):e.reviewItems.length?xg():wg(e,s);return`<section class="report-card qb-card qb-review-card">
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
  </section>`}function Ia(e){if(e==null||e==="")return"";let t=Number(e);return Number.isFinite(t)?`${Math.round(t*100)}%`:""}function qg(e){if(!e||typeof e!="object")return"\u5F15\u7528";let t=String(e.jid||"").trim();if(t)return t;let s=String(e.law_name||"").trim(),a=String(e.article_no||"").trim(),n=`${s} ${a}`.trim();return n||String(e.title||e.text||"\u5F15\u7528").slice(0,80)}function Mg(e){let t=e?.metrics||{},s=t.scores||{},a=[["\u6CD5\u898F\u53EC\u56DE",Ia(t.law_recall)],["\u689D\u6587\u53EC\u56DE",Ia(t.article_recall)],["\u898F\u5247\u5206",Ia(s.deterministic)],["Judge",Ia(s.judge)],["\u4EBA\u5DE5",Ia(s.human)]].filter(([,n])=>n);return a.length?`<div class="qb-bank-stats">${a.map(([n,i])=>`<span class="qb-bank-stat"><span>${r(n)}</span><strong>${r(i)}</strong></span>`).join("")}</div>`:""}function Lg(e){let t=Array.isArray(e?.law_sources)?e.law_sources:[],s=Array.isArray(e?.citations)?e.citations:[],a=t.length?`<div class="qb-bank-sources">${t.map(i=>{let o=String(i.law_name||"\u672A\u547D\u540D\u6CD5\u898F"),l=(i.articles||[]).map(u=>String(u.article_no||"").trim()).filter(Boolean),d=`<strong>${r(o)}</strong>${l.length?`<small>${r(l.join("\u3001"))}</small>`:""}`;return i.law_url?`<a class="qb-bank-law" href="${r(Pt(i.law_url))}" target="_blank" rel="noreferrer">${d}</a>`:`<span class="qb-bank-law">${d}</span>`}).join("")}</div>`:"",n=s.length?`<div class="qb-bank-sources qb-bank-citations">${s.map(i=>`<span class="chip chip-mono">${r(qg(i))}</span>`).join("")}</div>`:"";return!a&&!n?"":`<div class="qb-bank-answer-block">
    <div class="qb-bank-section-label"><span>\u5F15\u7528\u4F86\u6E90</span><span>${c(t.length+s.length)} \u7B46</span></div>
    ${a}${n}
  </div>`}function fc(e,t){if(!e)return`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("history",20)}</span>
      <strong>\u5C1A\u7121 RAG \u7B54\u6848</strong>
      <span>\u8DD1\u4E00\u6B21 Benchmark \u5F8C\uFF0C\u6700\u8FD1\u4E00\u6B21\u6210\u529F\u56DE\u7B54\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</span>
    </div>`;let s=Number(e.item_version||0),a=Number(t?.version||0),n=s&&a&&s!==a?`<span class="badge badge-warn">\u7B54\u6848 v${s} \xB7 \u984C\u76EE v${a}</span>`:"",i=e.answer_source==="llm"?"LLM \u751F\u6210":e.answer_source==="structured"?"\u6CD5\u898F\u8CC7\u6599\u5EAB":String(e.answer_source||"RAG");return`<div class="qb-bank-answer-meta">
      <span class="badge badge-ok"><span class="status-dot is-ok"></span>RAG \u5B8C\u6210</span>
      <span class="badge badge-neutral">${r(i)}</span>
      ${n}
      <span class="mono">${r(e.run_label||e.run_id||"")}</span>
      <span>${r($e(e.finished_at))}</span>
      <span>${r(be(e.duration_ms))}</span>
      ${e.llm_model?`<span class="mono">${r(e.llm_model)}</span>`:""}
    </div>
    <div class="qb-bank-answer-block">
      <div class="qb-bank-section-label"><span>\u56DE\u7B54</span><span>${c(String(e.answer||"").length)} \u5B57</span></div>
      <p class="qb-bank-answer-text">${r(String(e.answer||"").trim()||"\uFF08\u7A7A\u767D\u56DE\u7B54\uFF09")}</p>
    </div>
    ${Lg(e)}
    ${Mg(e)}`}function bc(e,t){let s=e.selectedSuiteId,a=t&&e.suiteAnswers?.[String(s)]?.[String(t.id)]||null;return t?`<div class="qb-bank-answer-head">
      <div class="qb-bank-answer-heading">
        <span class="qb-bank-answer-kicker">${m("sparkles",12)}RAG \u6700\u8FD1\u4E00\u6B21\u7B54\u6848</span>
        <strong class="qb-bank-answer-question">#${t.id} ${r(t.question)}</strong>
      </div>
      ${a?`<span class="qb-bank-answer-state">${r(bs[t.question_type]||t.question_type)} \xB7 v${t.version}</span>`:""}
    </div>
    ${fc(a,t)}`:`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("cube",20)}</span>
      <strong>\u9078\u64C7\u984C\u76EE</strong>
      <span>\u5F9E\u5DE6\u5074\u6E05\u55AE\u9078\u64C7\u4E00\u984C\uFF0C\u67E5\u770B\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`}function vc(e){return`<span class="qb-bank-actions">
    <button class="qb-bank-icon" type="button" data-qb-action="edit" data-id="${e.id}" title="\u7DE8\u8F2F\u984C\u76EE" aria-label="\u7DE8\u8F2F\u984C\u76EE #${e.id}">${m("edit",13)}</button>
    <button class="qb-bank-icon is-danger" type="button" data-qb-action="delete" data-id="${e.id}" title="\u5F9E\u984C\u5EAB\u79FB\u9664" aria-label="\u5F9E\u984C\u5EAB\u79FB\u9664 #${e.id}">${m("trash",13)}</button>
  </span>`}function jg(e,t,{selected:s,hasAnswer:a}){return`<div class="qb-bank-row${s?" is-active":""}" data-id="${e.id}">
    <button class="qb-bank-select" type="button" data-qb-action="select-bank-item" data-id="${e.id}" aria-pressed="${s?"true":"false"}">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <span class="qb-bank-item-copy">
        <strong>${r(e.question)}</strong>
        <small>${r(bs[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${a?"\u5DF2\u6709 RAG \u7B54\u6848":"\u5C1A\u7121 RAG \u7B54\u6848"}</small>
      </span>
    </button>
    ${vc(e)}
  </div>`}function Tg(e,t,s){return`<article class="qb-bank-full-item" data-id="${e.id}">
    <div class="qb-bank-full-head">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <div class="qb-bank-full-title">
        <strong>${r(e.question)}</strong>
        <small>${r(bs[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${r(Si[e.status]?.label||e.status||"")}</small>
      </div>
      ${vc(e)}
    </div>
    ${fc(s,e)}
  </article>`}function uc(e){let t=e.editingSuite,s=Array.isArray(e.suites)?e.suites:[],a=s.find(p=>Number(p.id)===Number(e.selectedSuiteId))||s[0]||null,n=Array.isArray(a?.items)?a.items:[],i=e.suiteAnswers?.[String(a?.id)]||{},o=n.find(p=>Number(p.id)===Number(e.selectedBankItemId))||null,l=!!e.suiteAnswersLoading,d=String(e.suiteAnswersError||""),u=!!e.suiteManageOpen||!s.length,f=e.bankTab==="full"?"full":"split",y=s.length?`<div class="qb-bank-tabs" role="tablist" aria-label="Benchmark \u984C\u5EAB\u6AA2\u8996">
        <button class="qb-bank-tab${f==="split"?" is-active":""}" type="button" role="tab" aria-selected="${f==="split"?"true":"false"}" data-qb-action="bank-tab" data-tab="split">${m("grid",13)}<span>Benchmark \u984C\u5EAB</span><span class="badge badge-neutral">${c(n.length)}</span></button>
        <button class="qb-bank-tab${f==="full"?" is-active":""}" type="button" role="tab" aria-selected="${f==="full"?"true":"false"}" data-qb-action="bank-tab" data-tab="full">${m("table",13)}<span>\u984C\u5EAB\u5168\u5217\u8868</span><span class="badge badge-neutral">${c(n.length)}</span></button>
      </div>`:"",b="";if(!s.length)b=`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("cube",20)}</span>
      <strong>\u5C1A\u672A\u5EFA\u7ACB Benchmark \u984C\u5EAB</strong>
      <span>\u5C55\u958B\u4E0B\u65B9 Suite \u8A2D\u5B9A\u4E26\u5EFA\u7ACB\u984C\u5EAB\u5F8C\uFF0C\u5C31\u80FD\u5728\u9019\u88E1\u700F\u89BD\u984C\u76EE\u8207\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`;else if(l)b='<div class="qb-bank-loading"><span class="spinner" aria-hidden="true"></span><span>\u8B80\u53D6\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u4E2D\u2026</span></div>';else{let p=d?Ge({tone:"warn",title:"\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u8B80\u53D6\u5931\u6557",text:r(d)}):"";f==="full"?b=`${p}<div class="qb-bank-full" data-qb-bank-view="full">${n.length?n.map((v,w)=>Tg(v,w,i[String(v.id)]||null)).join(""):Da("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>`:b=`${p}<div class="qb-bank-split" data-qb-bank-view="split">
        <div class="qb-bank-list" data-qb-bank-list>${n.length?n.map((v,w)=>jg(v,w,{selected:Number(v.id)===Number(o?.id),hasAnswer:!!i[String(v.id)]})).join(""):Da("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>
        <div class="qb-bank-answer-pane" data-qb-bank-answer>${bc(e,o)}</div>
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
    ${b}
    <details class="qb-suite-manage" ${u?"open":""}>
      <summary>${m("sliders",14)}Suite \u8A2D\u5B9A\u8207\u7248\u672C <span class="qb-muted">${c(s.length)} \u500B suite \xB7 ${c(e.ready.length)} \u984C benchmark-ready</span></summary>
      <div class="qb-suite-manage-body">
        <form class="qb-suite-form" data-qb-form="suite">
          <input type="hidden" name="suite_id" value="${t?.id||""}" />
          <div class="qb-form-grid">
            <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${r(t?.name||"Pilot 30")}" /></label>
            <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(cc).map(([p,v])=>`<option value="${p}" ${t?.tier===p?"selected":""}>${v}</option>`).join("")}</select></label>
          </div>
          <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${r(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
          <div class="qb-check-list">
            ${e.ready.length?e.ready.map(p=>{let v=t?t.items?.some(w=>Number(w.id)===Number(p.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${p.id}" ${v?"checked":""}/><span><strong>#${p.id}</strong> ${r(p.question)} <small>${r(bs[p.question_type]||p.question_type)}</small></span></label>`}).join(""):Da("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
          </div>
          <div class="qb-actions">
            <button class="btn btn-primary" type="submit">${m("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
            ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
          </div>
        </form>
        <div class="qb-list">
          ${s.length?s.map(p=>`<article class="qb-suite">
            <div class="qb-item-head">
              <div class="qb-item-title"><strong>${r(p.name)}</strong><span class="qb-meta">${r(cc[p.tier]||p.tier)} \xB7 v${p.version} \xB7 ${c(p.item_count)} \u984C</span></div>
              <span class="badge ${p.status==="frozen"?"badge-ok":"badge-neutral"}">${p.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
            </div>
            <div class="qb-suite-items">${(p.items||[]).slice(0,8).map(v=>`<span class="chip">#${v.id} ${r(v.question.slice(0,22))}${v.question.length>22?"\u2026":""}</span>`).join("")}${p.item_count>8?`<span class="qb-muted">+${p.item_count-8}</span>`:""}</div>
            <div class="qb-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${p.id}">${m("edit",13)}<span>\u7DE8\u8F2F suite</span></button>
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${p.id}">${m("shield",13)}<span>\u51CD\u7D50</span></button>
              <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${p.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
            </div>
          </article>`).join(""):Da("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
        </div>
      </div>
    </details>
  </section>`}function Eg(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),n=Number(a?.value);Number.isFinite(n)&&(t[s]=Math.max(1,Math.min(5,Math.round(n))))}return t}function Ng(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:rg(t.get("expected_laws")),expected_articles:ig(t.get("expected_articles")),expected_judgments:og(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function hc(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},n={tab:"",editing:null,editingFrom:"",editingSuite:null,aiQuestion:"",aiLoading:!1,aiResult:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tags:[]},stats:{},suites:[],ready:[],selectedSuiteId:null,selectedBankItemId:null,bankTab:"split",suiteAnswers:{},suiteAnswersLoading:!1,suiteAnswersError:"",suiteManageOpen:!1,reviewItems:[],reviewDetail:null,reviewFilter:"queue"},i=C=>e.querySelector(`#quality-panel-${a[C]}`),o=(C,G)=>{C&&(C.childElementCount?C.setAttribute("aria-busy","true"):C.innerHTML=`<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>${G}</span></div></section>`)},l=C=>{C?.removeAttribute("aria-busy")},d=0,u=null,f=()=>"anonymous",y=()=>{s&&s(n.stats)},b=C=>{t&&t(C),ie(C)},p=async()=>{try{n.stats=await O.questionBankStats()}catch{n.stats={}}y()},v=()=>{let C=i("create");C&&(C.innerHTML=fg(n.editing,n))},w=(C,G)=>{let V=C?.querySelector("[data-qb-tag-results]");V&&(V.innerHTML=G.length?G.map(I=>`<button class="qb-tag-option" type="button" role="option" data-qb-action="select-tag" data-tag="${r(I.tag)}"><span>${r(I.tag)}</span><small>${c(I.count)}</small></button>`).join(""):'<div class="qb-tag-empty">\u6C92\u6709\u5176\u4ED6\u76F8\u7B26\u6A19\u7C64</div>')},q=async(C,G="")=>{if(!C)return;let V=C.querySelector("[data-qb-tag-results]"),I=++d;V&&(V.innerHTML='<div class="qb-tag-loading"><span class="spinner"></span><span>\u641C\u5C0B\u6A19\u7C64\u2026</span></div>');try{let W=await O.questionBankTags(G,12);if(I!==d)return;let K=(W.tags||[]).filter(ke=>!n.filters.tags.includes(ke.tag));w(C,K)}catch(W){if(I!==d)return;V&&(V.innerHTML=`<div class="qb-tag-empty">${r(W.message||"\u6A19\u7C64\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},k=(C,{focus:G=!1}={})=>{if(!C)return;let V=C.querySelector("[data-qb-tag-popover]"),I=C.querySelector("[data-qb-tag-search]");!V||!I||(V.hidden&&(V.hidden=!1,I.value="",q(C,"")),G&&(I.focus(),I.select()))},S=C=>{u&&(window.clearTimeout(u),u=null);let G=C?.querySelector("[data-qb-tag-popover]");G&&(G.hidden=!0)},$=async C=>{let G=String(C||"").trim();G&&(n.filters.tags.includes(G)?n.filters.tags=n.filters.tags.filter(V=>V!==G):n.filters.tags=[...n.filters.tags,G],n.offset=0,await x())},L=()=>{let C=Array.isArray(n.suites)?n.suites:[];if(!C.length)return n.selectedSuiteId=null,n.selectedBankItemId=null,null;let G=C.find(I=>Number(I.id)===Number(n.selectedSuiteId));G||(G=C[0],n.selectedSuiteId=G.id,n.selectedBankItemId=null);let V=Array.isArray(G.items)?G.items:[];return V.some(I=>Number(I.id)===Number(n.selectedBankItemId))||(n.selectedBankItemId=V[0]?.id??null),G},z=()=>{let C=i("suite");C&&(C.innerHTML=uc(n))},P=0,Y=async(C,{force:G=!1}={})=>{if(!C)return;let V=++P;if(!G&&n.suiteAnswers[String(C)]){n.suiteAnswersLoading=!1,n.suiteAnswersError="",z();return}n.suiteAnswersLoading=!0,n.suiteAnswersError="",z();try{let I=await O.benchmarkSuiteLatestAnswers(C);if(V!==P)return;n.suiteAnswers[String(C)]=I.answers||{}}catch(I){if(V!==P)return;n.suiteAnswersError=I.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}finally{V===P&&(n.suiteAnswersLoading=!1,z())}},me=async C=>{n.selectedSuiteId=C,n.selectedBankItemId=null,n.suiteAnswersError="";let G=L();if(!G){z();return}await Y(G.id)},X=C=>{n.bankTab=C==="full"?"full":"split",z()},j=()=>{let C=i("suite");if(!C)return;let G=L(),I=(Array.isArray(G?.items)?G.items:[]).find(K=>Number(K.id)===Number(n.selectedBankItemId))||null;for(let K of C.querySelectorAll(".qb-bank-row")){let ke=Number(K.dataset.id)===Number(n.selectedBankItemId);K.classList.toggle("is-active",ke);let Fe=K.querySelector("[data-qb-action='select-bank-item']");Fe&&Fe.setAttribute("aria-pressed",ke?"true":"false")}let W=C.querySelector("[data-qb-bank-answer]");W&&(W.innerHTML=bc(n,I))},x=async()=>{let C=i("manage");if(C){u&&(window.clearTimeout(u),u=null),o(C,"\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026");try{let G=await O.questionBankItems({...n.filters,...n.filters.status==="retired"?{include_deleted:!0}:{}},n.limit,n.offset);n.items=G.items||[],n.total=Number(G.total||0),n.stats=G.stats||n.stats,l(C),C.innerHTML=$g(n),y()}catch(G){l(C),C.innerHTML=`<section class="report-card qb-card">${Ge({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(G.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},E=async({refreshAnswers:C=!1}={})=>{let G=i("suite");if(G){o(G,"\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026");try{let[V,I]=await Promise.all([O.benchmarkSuites(),O.benchmarkReadyQuestions(300)]);n.suites=V.suites||[],n.ready=I.items||[];let W=L();if(n.suiteAnswersError="",n.suiteAnswersLoading=!1,W&&(C||!n.suiteAnswers[String(W.id)]))try{let K=await O.benchmarkSuiteLatestAnswers(W.id);n.suiteAnswers[String(W.id)]=K.answers||{}}catch(K){n.suiteAnswersError=K.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}l(G),G.innerHTML=uc(n)}catch(V){l(G),G.innerHTML=`<section class="report-card qb-card">${Ge({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(V.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},H=()=>{let C=i("review");C&&(C.innerHTML=Ag(n))},te=async C=>{let G=n.reviewItems.find(I=>Number(I.id)===Number(C));if(!G)return;n.reviewDetail=G,H();let V=i("review")?.querySelector(".qb-review-detail-pane");V&&window.matchMedia("(max-width: 1020px)").matches&&V.scrollIntoView({behavior:"smooth",block:"start"});try{let I=await O.questionBankItem(G.id);Number(n.reviewDetail?.id)===Number(G.id)&&(n.reviewDetail=I,H())}catch(I){T(I.message||"\u984C\u76EE\u5167\u5BB9\u8B80\u53D6\u5931\u6557\u3002","danger")}},U=async()=>{let C=i("review");if(!C)return;o(C,"\u8B80\u53D6\u9A57\u6536\u984C\u76EE\u4E2D\u2026");let G=n.reviewFilter||"queue",V=G==="queue"?["pending_review","changes_requested"]:G==="accepted"?["accepted"]:G==="rejected"?["rejected"]:["draft"];try{let I=await Promise.all(V.map(Fe=>O.questionBankItems({status:Fe},200,0)));n.reviewItems=I.flatMap(Fe=>Fe.items||[]),n.stats=I[0]?.stats||n.stats;let W=Number(n.reviewDetail?.id||0),ke=n.reviewItems.some(Fe=>Number(Fe.id)===W)?W:Number(n.reviewItems[0]?.id||0);n.reviewDetail=ke?await O.questionBankItem(ke):null,l(C),H(),y()}catch(I){l(C),C.innerHTML=`<section class="report-card qb-card">${Ge({tone:"danger",title:"\u9A57\u6536\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:r(I.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}};function ie(C){let G=n.tab;n.tab=C;for(let V of Object.keys(a)){let I=i(V);I&&(I.hidden=V!==C)}C==="create"?(G!=="create"&&!n.editing&&(n.aiQuestion="",n.aiResult=null),v()):C==="manage"?x():C==="suite"?E():C==="review"&&U()}let Te=C=>{let V=[...n.items,...n.reviewItems,...n.reviewDetail?[n.reviewDetail]:[]].find(W=>Number(W.id)===Number(C));n.reviewDetail=V||{id:Number(C)};let I=V?.status;["accepted","rejected","draft"].includes(I)?n.reviewFilter=I:I&&(n.reviewFilter="queue"),b("review")},B=async C=>{let G=Ng(C),V=Number(C.elements.item_id?.value||0);V||(G.status=C.elements.submit_for_review?.checked?"pending_review":"draft");try{V?(await O.updateQuestionBankItem(V,{...G,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),T("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await O.createQuestionBankItem(G),T(G.status==="draft"?"\u984C\u76EE\u5DF2\u5B58\u70BA\u8349\u7A3F\uFF0C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002":"\u984C\u76EE\u5DF2\u5EFA\u7ACB\u4E26\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok")),n.editing=null;let I=["manage","suite","review"].includes(n.editingFrom)?n.editingFrom:"manage";n.editingFrom="",n.suiteAnswers={},await p(),b(I)}catch(I){let W=I.detail||I.payload?.detail,K=W?.errors?.join(" \xB7 ")||W?.message||I.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";T(K,"danger",8e3)}},we=async C=>{let G=String(new FormData(C).get("question")||"").trim();if(G.length<4){T("\u984C\u76EE\u81F3\u5C11\u9700\u8981 4 \u500B\u5B57\u3002","danger");return}n.aiQuestion=G,n.aiLoading=!0,n.aiResult=null,v();try{let V=await O.createQuestionBankItemWithAI({question:G});n.aiResult=V,n.aiQuestion="",await p(),T(`llama-server \u5DF2\u5EFA\u7ACB\u984C\u76EE #${V.item.id}\uFF0C\u72C0\u614B\u70BA\u5F85\u5BE9\uFF0C\u8ACB\u4EBA\u5DE5\u8986\u6838\u3002`,"ok",8e3)}catch(V){let I=V.detail||V.payload?.detail,W=I?.errors?.join(" \xB7 ")||I?.message||V.message||"llama-server \u7522\u751F\u5931\u6557\u3002";T(W,"danger",12e3)}finally{n.aiLoading=!1,v()}},ce=async(C,G)=>{let V=Number(C.dataset.id||0);if(V)try{await O.reviewQuestionBankItem(V,{decision:G,reviewer:f(),rubric_scores:Eg(C),comment:String(C.querySelector('[name="comment"]')?.value||"")}),T(G==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":G==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",G==="approved"?"ok":"info"),await p(),await U()}catch(I){let W=I.detail||I.payload?.detail,K=W?.errors?.join(" \xB7 ")||W?.message||I.message||"\u9A57\u6536\u5931\u6557\u3002";T(K,"danger",8e3)}},Le=async C=>{let G=new FormData(C),V=Number(G.get("suite_id")||0),I=Array.from(C.querySelectorAll('input[name="item_ids"]:checked')).map(K=>Number(K.value)),W={name:String(G.get("name")||"").trim(),tier:String(G.get("tier")||"core"),description:String(G.get("description")||"").trim(),item_ids:I};try{V?(await O.updateBenchmarkSuite(V,W),T("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await O.createBenchmarkSuite(W),T("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),n.editingSuite=null,n.suiteManageOpen=!0,n.suiteAnswers={},await E()}catch(K){let ke=K.detail||K.payload?.detail,Fe=ke?.errors?.join(" \xB7 ")||ke?.message||K.message||"Suite \u5132\u5B58\u5931\u6557\u3002";T(Fe,"danger",8e3)}},Oe=async C=>{let G=e.querySelector("[data-qb-tag-filter] [data-qb-tag-popover]:not([hidden])")?.closest("[data-qb-tag-filter]");G&&!C.target.closest("[data-qb-tag-filter]")&&S(G);let V=C.target.closest("[data-qb-action]")?.dataset.qbAction;if(!V)return;let I=C.target.closest("[data-qb-action]"),W=Number(I.dataset.id||0);if(V==="open-tag-search"){let K=I.closest("[data-qb-tag-filter]");k(K,{focus:!0});return}if(V==="select-tag"){await $(I.dataset.tag);return}if(V==="remove-tag"){await $(I.dataset.tag);return}if(V==="bank-tab"){X(I.dataset.tab);return}if(V==="select-bank-item"){n.selectedBankItemId=W,j();return}if(V==="new"){n.editing=null,n.editingFrom="",n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,b("create");return}if(V==="reset-create"){n.editing=null,v();return}if(V==="reset-ai"){n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,v();return}if(V==="edit"){let K=n.suites.find(ht=>Number(ht.id)===Number(n.selectedSuiteId)),Fe=[...n.items,...n.reviewItems,...K?.items||[],...n.reviewDetail?[n.reviewDetail]:[]].find(ht=>Number(ht.id)===W);if(!Fe)return;let Ye=Fe;try{Ye=await O.questionBankItem(W)}catch{Ye=Fe}n.editing=Ye||Fe,n.editingFrom=n.tab,b("create");return}if(V==="review"){Te(W);return}if(V==="review-ai-item"){let K=n.aiResult?.item;if(!K)return;n.reviewFilter="queue",n.reviewDetail=K,b("review");return}if(V==="review-filter"){let K=String(I.dataset.filter||"queue");n.reviewFilter=["queue","accepted","rejected","draft"].includes(K)?K:"queue",n.reviewDetail=null,await U();return}if(V==="select-review-item"){await te(W);return}if(V==="go-manage"){b("manage");return}if(V==="submit-review"){try{await O.submitQuestionBankItemForReview(W),T("\u5DF2\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok"),await p(),n.tab==="manage"?await x():n.tab==="review"&&await U()}catch(K){let ke=K.detail||K.payload?.detail,Fe=ke?.errors?.join(" \xB7 ")||ke?.message||K.message||"\u9001\u5BE9\u5931\u6557\u3002";T(Fe,"danger",8e3)}return}if(V==="restore"){if(!window.confirm(`\u78BA\u5B9A\u5FA9\u539F\u984C\u76EE #${W}\uFF1F\u5FA9\u539F\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\u72C0\u614B\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002`))return;try{await O.restoreQuestionBankItem(W),T("\u984C\u76EE\u5DF2\u5FA9\u539F\u4E26\u56DE\u5230\u5F85\u5BE9\u3002","ok"),await p(),await x()}catch(K){let ke=K.detail||K.payload?.detail,Fe=ke?.errors?.join(" \xB7 ")||ke?.message||K.message||"\u5FA9\u539F\u5931\u6557\u3002";T(Fe,"danger",8e3)}return}if(V==="delete"){if(n.tab==="suite"){let K=L();if(!K||!(K.items||[]).find(Fe=>Number(Fe.id)===W)||!window.confirm(`\u78BA\u5B9A\u5F9E\u300C${K.name}\u300D\u79FB\u9664\u984C\u76EE #${W}\uFF1F\u984C\u76EE\u4ECD\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u7BA1\u7406\u4E2D\u3002`))return;try{await O.removeBenchmarkSuiteItem(K.id,W),T("\u5DF2\u5F9E Benchmark \u984C\u5EAB\u79FB\u9664\u3002","info"),delete n.suiteAnswers[String(K.id)],Number(n.selectedBankItemId)===W&&(n.selectedBankItemId=null),await E()}catch(Fe){T(Fe.message||"\u79FB\u9664\u5931\u6557\u3002","danger")}return}if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${W}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await O.deleteQuestionBankItem(W),T("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await p(),n.tab==="review"?(n.reviewDetail=null,await U()):await x()}catch(K){T(K.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(V==="revalidate"){try{let K=await O.revalidateQuestionBank();T(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${c(K.checked||0)} \u984C\uFF0C${c(K.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await p(),await x()}catch(K){T(K.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(V==="export"){try{let K=await O.exportQuestionBank({status:""});Qt(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(K,null,2),"application/json;charset=utf-8")}catch(K){T(K.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(V==="import-json"){let K=e.querySelector("#qb-import-json");try{let ke=JSON.parse(String(K?.value||"").trim()),Fe=await O.importQuestionBank(ke);T(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${Fe.created}\u3001\u66F4\u65B0 ${Fe.updated}\u3001\u932F\u8AA4 ${(Fe.errors||[]).length}\u3002`,(Fe.errors||[]).length?"warn":"ok",8e3),K&&(K.value=""),await p(),await x()}catch(ke){T(ke.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(V==="prev"||V==="next"){n.offset=Math.max(0,n.offset+(V==="next"?n.limit:-n.limit)),await x();return}if(V==="suite-edit"){let K=n.suites.find(ke=>Number(ke.id)===W);if(!K)return;n.editingSuite=K,n.suiteManageOpen=!0,E();return}if(V==="suite-new"){n.editingSuite=null,n.suiteManageOpen=!0,E();return}if(V==="suite-freeze"){try{await O.updateBenchmarkSuite(W,{freeze:!0}),T("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),n.editingSuite=null,n.suiteManageOpen=!0,await E()}catch(K){T(K.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(V==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${W}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await O.deleteBenchmarkSuite(W),T("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),n.editingSuite=null,n.suiteAnswers={},n.suiteManageOpen=!0,await E()}catch(K){T(K.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(V==="decide"){let K=I.closest("form[data-qb-form='review']");K&&await ce(K,String(I.dataset.decision||""))}},Ne=async C=>{let G=C.target.closest("[data-qb-form]");if(!G)return;C.preventDefault();let V=G.dataset.qbForm;if(V==="create")await B(G);else if(V==="ai-create")await we(G);else if(V==="filter"){let I=new FormData(G);n.filters={query:String(I.get("query")||"").trim(),status:String(I.get("status")||""),question_type:String(I.get("question_type")||""),difficulty:String(I.get("difficulty")||""),tags:I.getAll("tags").map(W=>String(W).trim()).filter(Boolean)},n.offset=0,await x()}else V==="suite"&&await Le(G)},et=async C=>{let G=C.target.closest?.("form[data-qb-form='filter'] select");if(G){G.form.requestSubmit();return}let V=C.target.closest?.("[data-qb-suite-select]");if(!V)return;let I=Number(V.value||0);!I||I===Number(n.selectedSuiteId)||await me(I)},ue=C=>{let G=C.target;G?.matches?.(".qb-suite-manage")&&(n.suiteManageOpen=!!G.open)},re=C=>{let G=C.target.closest?.("[data-qb-action='open-tag-search']");G&&k(G.closest("[data-qb-tag-filter]"))},qe=C=>{let G=C.target.closest?.("[data-qb-tag-filter]");G&&(C.relatedTarget&&G.contains(C.relatedTarget)||S(G))},ye=C=>{let G=C.target.closest?.("[data-qb-tag-search]");if(!G)return;let V=G.closest("[data-qb-tag-filter]");u&&window.clearTimeout(u),u=window.setTimeout(()=>{q(V,G.value)},160)},_e=C=>{let G=C.target.closest?.("[data-qb-tag-search]");if(!G)return;let V=G.closest("[data-qb-tag-filter]");C.key==="Escape"?(C.preventDefault(),S(V),G.blur()):C.key==="Enter"?(C.preventDefault(),V?.querySelector("[data-qb-action='select-tag']")?.click()):C.key==="ArrowDown"&&(C.preventDefault(),V?.querySelector("[data-qb-action='select-tag']")?.focus())};e.addEventListener("click",Oe),e.addEventListener("submit",Ne),e.addEventListener("change",et),e.addEventListener("toggle",ue,!0),e.addEventListener("mouseover",re),e.addEventListener("mouseout",qe),e.addEventListener("input",ye),e.addEventListener("keydown",_e);let Ee=async()=>{await p(),n.tab==="create"?v():n.tab==="manage"?await x():n.tab==="suite"?await E({refreshAnswers:!0}):n.tab==="review"&&await U()};return p(),{show:ie,refresh:Ee,destroy(){u&&window.clearTimeout(u),e.removeEventListener("click",Oe),e.removeEventListener("submit",Ne),e.removeEventListener("change",et),e.removeEventListener("toggle",ue,!0),e.removeEventListener("mouseover",re),e.removeEventListener("mouseout",qe),e.removeEventListener("input",ye),e.removeEventListener("keydown",_e)},getStats:()=>n.stats}}function Un(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function $c(e){return e==null?"\u2014":c(e)}function Rg(e){return e.count?e.severity==="danger"?Pe("failed","\u9700\u8655\u7406"):e.severity==="warn"?Pe("warning","\u6CE8\u610F"):Pe("preview","\u63D0\u793A"):Pe("success","\u901A\u904E")}function Cg(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function Pg(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${Cg(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${r(e.label)}</span>
      ${Rg(e)}
    </div>
    <div class="quality-check-value">
      <strong>${c(t)}</strong>
      <span>\u7B46</span>
      <em>${r(Un(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${r(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function zn(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
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
  </div>`}function Ig(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},n=Number(s.matched_unique_jids??s.matched_rows??0),i=Number(s.matched_rows??n),o=Math.max(0,i-n),l=t.postgres_diff,d=l==null?"\u2014":l===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\uFF08\u53BB\u91CD JID\uFF09\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\uFF08\u53BB\u91CD JID\uFF09\u76F8\u5DEE ${c(Math.abs(l))} \u7B46`,u=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${c(t.vector_indexed)} / ${c(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${m("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\uFF08\u53BB\u91CD JID\uFF09</span></div>
      <div class="metric-value">${c(n)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u542B\u91CD\u8907 ${c(i)} \u7B46${o?`\uFF0C\u91CD\u8907 ${c(o)} \u7B46`:""}\uFF1B\u5171 ${c(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${$c(t.postgres_judgments)}</div>
      <div class="metric-foot">${r(d)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${r(Un(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${r(u)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${$c(a.candidate_total)}</div>
      <div class="metric-foot">${c(a.candidate_archive_count)} / ${c(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function Dg(e){return e.length?`<div class="table-wrap">
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
              <td class="cell-number">${r(Un(t.match_rate))}</td>
              <td class="cell-number">${c(t.short_text_rows)}</td>
              <td class="cell-number">${c(s)}</td>
              <td class="cell-number">${c(t.duplicate_content_rows)}</td>
              <td class="cell-date">${r(Kt(t.date_min))} \u2013 ${r(Kt(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:xt({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function Fg(e){let t=e.totals||{},s=Number(t.matched_unique_jids??t.matched_rows??0),a=e.source||{},n=Array.isArray(e.checks)?e.checks:[],i=e.summary||{},o=e.distributions||{},l=Array.isArray(e.warnings)?e.warnings:[],d=Ie(a.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${Pe(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${c(t.rows)} \u7B46 \xB7 ${c(a.raw_files)} \u500B\u6A94\u6848 \xB7
          ${d} \xB7 \u6383\u63CF ${be(e.scan_ms||0)} \xB7
          ${r($e(e.generated_at))}
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
        <div class="summary-value">${r(Un(t.match_rate))}</div>
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
      <div class="quality-checks">${n.map(Pg).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${Ig(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${c(a.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${Dg(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${zn("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",o.courts)}
        ${zn("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",o.years)}
        ${zn("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",o.laws)}
        ${zn("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",o.titles)}
      </div>
    </div>
  </div>`}async function Bg(e){let t=rs(),s=`judgment.quality.snapshot.${t?"visitor":"admin"}`,a=()=>{try{let L=JSON.parse(window.localStorage.getItem(s)||"null");return!L?.snapshot||Date.now()-Number(L.saved_at||0)>600*1e3?null:L.snapshot}catch{return null}},n=L=>{if(L)try{window.localStorage.setItem(s,JSON.stringify({snapshot:L,saved_at:Date.now()}))}catch{}};e.innerHTML=`<section class="page data-page quality-page">
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
          <button class="status-tab" type="button" data-quality-tab="feedback">
            <span class="status-tab-icon">${m("message",15)}</span>
            <span class="status-tab-copy"><strong>\u4F7F\u7528\u8005\u56DE\u994B</strong><small>\u91CD\u73FE\u56DE\u7B54\u3001\u6AA2\u8996\u4E0D\u6EFF\u610F\u539F\u56E0\u8207 triage</small></span>
            <span class="badge badge-warn" id="quality-badge-feedback">\u2014</span>
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
        <div id="quality-panel-feedback" hidden></div>
      </section>
    </div>
  </section>`;let i=e.querySelector("#quality-content"),o=e.querySelector("#quality-refresh"),l=e.querySelector("#quality-meta"),d=[...e.querySelectorAll("[data-quality-tab]")],u={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review"),feedback:e.querySelector("#quality-panel-feedback")},f=null,y="overview",b=()=>{if(!f)return;i.innerHTML=Fg(f),l.textContent=`DUCKDB \xB7 ${c(f.totals?.rows)} \u7B46 \xB7 ${be(f.scan_ms||0)}`;let L=e.querySelector("#quality-badge-overview");L&&(L.textContent=c(f.totals?.rows||0))},p=L=>{y=L==="overview"?"overview":L;for(let z of d){let P=z.dataset.qualityTab===y;z.classList.toggle("is-active",P),P?z.setAttribute("aria-current","page"):z.removeAttribute("aria-current")}for(let[z,P]of Object.entries(u))P&&(P.hidden=z!==y);y==="feedback"?l.textContent="USER FEEDBACK \xB7 \u4F7F\u7528\u8005\u56DE\u994B":y!=="overview"?l.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":f&&b()},v=t?null:lc(u.feedback,{onStats:L=>{let z=e.querySelector("#quality-badge-feedback");z&&(z.textContent=c(L?.new||0))}});t||O.ragFeedbackStats().then(L=>{let z=e.querySelector("#quality-badge-feedback");z&&(z.textContent=c(L?.new||0))}).catch(()=>{});let w=hc(e,{onNavigate:L=>p(L),onStats:L=>{let z=L||{},P=e.querySelector("#quality-badge-manage"),Y=e.querySelector("#quality-badge-suite"),me=e.querySelector("#quality-badge-review");P&&(P.textContent=c(z.total||0)),Y&&(Y.textContent=c(z.benchmark_ready||0)),me&&(me.textContent=c((z.pending_review||0)+(z.changes_requested||0)))}}),q=L=>{if(p(L),L!=="overview"){if(t){let z=u[L];z&&(z.innerHTML=zs(L==="feedback"?"\u4F7F\u7528\u8005\u56DE\u994B\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650":"\u984C\u5EAB\u7BA1\u7406\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650",L==="feedback"?"\u5C55\u793A\u6A21\u5F0F\u53EF\u9001\u51FA\u56DE\u994B\uFF0C\u4F46\u4E0D\u80FD\u8B80\u53D6\u5176\u4ED6\u4EBA\u7684\u554F\u984C\u3001\u56DE\u7B54\u5FEB\u7167\u6216\u7559\u8A00\u3002":"\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u5B8C\u6574\u7684\u8CC7\u6599\u54C1\u8CEA\u7E3D\u89BD\uFF1B\u984C\u5EAB\u65B0\u589E\u3001\u7BA1\u7406\u3001Benchmark \u8207\u4EBA\u5DE5\u9A57\u6536\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002"));return}if(L==="feedback"){v?.show();return}w.show(L)}},k=async({cached:L=!1}={})=>{he(o,!0,L?"\u6574\u7406\u4E2D\u2026":"\u6383\u63CF\u4E2D\u2026");try{f=await O.quality({cached:L}),n(f),b()}catch(z){i.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${Ge({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:r(z.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,l.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",T("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{he(o,!1)}},S=async()=>{y==="overview"?await k():y==="feedback"?await v?.refresh():await w.refresh()};o.addEventListener("click",S),e.addEventListener("click",L=>{let z=L.target.closest("[data-quality-tab]");z&&q(z.dataset.qualityTab||"overview")}),i.addEventListener("click",L=>{!L.target.closest("[data-action='export-quality']")||!f||Qt(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(f,null,2),"application/json;charset=utf-8")}),p("overview");let $=a();if($&&(f=$,b()),t)for(let L of d){if(L.dataset.qualityTab==="overview")continue;L.classList.add("is-demo-locked"),L.removeAttribute("title"),L.dataset.demoLockTooltip=L.dataset.qualityTab==="feedback"?"\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B\u4F7F\u7528\u8005\u56DE\u994B\u6AA2\u8996":"\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B\u984C\u5EAB\u7BA1\u7406";let z=L.querySelector(".badge");z&&(z.textContent="LOCK")}await k({cached:!0})}var Ti={};hs(Ti,{render:()=>_f});var Gn={};hs(Gn,{render:()=>Li});var yc={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function wc(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${r(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${r(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function Og(e){let t=e?.supports_chat,s=t===!0?"badge-ok":t===!1?"badge-danger":"badge-neutral",a=t===!0?"\u652F\u63F4 chat":t===!1?"\u4E0D\u652F\u63F4 chat":"\u672A\u6E2C\u8A66",n=(Array.isArray(e?.capabilities)?e.capabilities:[]).map(i=>`<span class="chip chip-mono">${r(i)}</span>`).join("");return`<div class="tests-llm-row">
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
  </div>`}function Hg(e){let t=Array.isArray(e?.models)?e.models:[],s=e?.counts||{},a=Array.isArray(e?.failures)?e.failures:[];return{summary:e?`<span>llama-server <strong>${s.available??t.length}</strong> \u500B\u6A21\u578B</span>
      <span>\u652F\u63F4 chat <strong>${s.chat??0}</strong></span>
      <span>\u4E0D\u652F\u63F4 <strong>${s.unsupported??0}</strong></span>
      <span>\u672A\u6E2C\u8A66 <strong>${s.untested??0}</strong></span>
      <span>\u672C\u6B21\u65B0\u6E2C <strong>${(e.tested_now||[]).length}</strong></span>
      <span class="muted">${r(e.detail||"")}</span>`:"<span>\u6B63\u5728\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u2026</span>",list:t.length?t.map(Og).join(""):'<div class="tests-llm-empty">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u8ACB\u78BA\u8A8D llama-server \u5DF2\u555F\u52D5\u4E26\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66\u3002</div>',failures:a.length?`<div class="tests-llm-failures">${a.map(i=>`<span><strong class="mono">${r(i.model||"\u2014")}</strong> ${r(i.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function zg(e){let t=String(e?.status||"degraded"),s=t==="operational"?"badge-ok":t==="disabled"?"badge-neutral":"badge-danger",a=Array.isArray(e?.scores)?e.scores.slice(0,4):[],n=Array.isArray(e?.results)?e.results[0]:null;return`<div class="tests-llm-row">
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
  </div>`}function Ug(e){if(!e)return{summary:"<span>\u6B63\u5728\u8B80\u53D6 reranker \u72C0\u614B\u2026</span>",list:"",failures:""};let t=Array.isArray(e.providers)?e.providers:[],s=e.active||{},a=String(e.status||"degraded"),n=a==="operational"?"badge-ok":a==="not_configured"?"badge-neutral":"badge-danger",i=t.flatMap(o=>(o.errors||[]).map(l=>({model:o.url,detail:l})));return{summary:`<span>\u72C0\u614B <span class="badge ${n}">${r(a)}</span></span>
      <span>\u6A21\u578B <strong>${r(e.model||"\u2014")}</strong></span>
      <span>\u555F\u7528 <strong>${e.enabled?"true":"false"}</strong></span>
      ${s.url?`<span>\u4F5C\u7528\u4E2D <strong class="mono">${r(s.url)}</strong></span>`:""}
      <span class="muted">${r(e.detail||"")}</span>`,list:t.length?t.map(zg).join(""):'<div class="tests-llm-empty">\u6C92\u6709\u8A2D\u5B9A RERANK_URL\uFF1B\u8ACB\u8A2D\u5B9A primary \u6216 fallback reranker\u3002</div>',failures:i.length?`<div class="tests-llm-failures">${i.map(o=>`<span><strong class="mono">${r(o.model||"\u2014")}</strong> ${r(o.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function Gg(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,total_ms:e.total_ms,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}:${a.duration_ms}`)}:null})}async function Li(e,t,{embedded:s=!1}={}){let a=!1,n=!1,i={embedding:[],llm:[]},o=!1,l=null,d=!1,u=null,f=!1,y=null,b=[],p="",v=null,w="",q=`<div class="page-actions">
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
        ${q}
      </div>`:`<div class="page-header">
      <div>
        <div class="eyebrow">SYSTEM TEST</div>
        <h1 class="page-title">\u7CFB\u7D71\u6E2C\u8A66</h1>
        <p class="page-subtitle">\u5408\u4F75\u5F8C\u7AEF API \u9023\u7DDA\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u591A\u6A21\u578B\u6E2C\u8A66 Flow\u3002
          \u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207\u5177\u5099 chat \u80FD\u529B\u7684 LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002</p>
      </div>
      ${q}
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
  </section>`;let S=e.querySelector("#tests-mode-badge"),$=e.querySelector("#tests-mode-toggle"),L=e.querySelector("#tests-mode-summary"),z=e.querySelector("#tests-mode-models"),P=e.querySelector("#tests-mode-status"),Y=e.querySelector("#tests-api-form"),me=e.querySelector("#tests-api-input"),X=e.querySelector("#tests-admin-token-input"),j=e.querySelector("#tests-api-preview"),x=e.querySelector("#tests-api-status"),E=e.querySelector("#tests-api-note"),H=e.querySelector("#tests-api-test"),te=e.querySelector("#tests-api-reset"),U=e.querySelector("#tests-api-save"),ie=e.querySelector("#tests-refresh"),Te=e.querySelector("#tests-flow"),B=e.querySelector("#tests-llm-summary"),we=e.querySelector("#tests-llm-list"),ce=e.querySelector("#tests-llm-failures"),Le=e.querySelector("#tests-llm-status"),Oe=e.querySelector("#tests-llm-test"),Ne=e.querySelector("#tests-rerank-summary"),et=e.querySelector("#tests-rerank-list"),ue=e.querySelector("#tests-rerank-failures"),re=e.querySelector("#tests-rerank-status"),qe=e.querySelector("#tests-rerank-test");X&&(X.value=Ka());let ye=(oe,Se,st="")=>{oe&&(oe.textContent=Se,oe.className=`tests-status${st?` is-${st}`:""}`)},_e=(oe,Se="")=>{x&&(x.textContent=oe,x.className=`api-dialog-status${Se?` is-${Se}`:""}`)},Ee=()=>as()==="query",C=()=>{let oe=$s(me.value);return oe||(window.location.protocol==="file:"?sr:"")},G=()=>{let oe=C(),Se=cs(),st=yc[as()]||as()||"\u540C\u6E90";j.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${r(Ls(Se))}</strong>${Se?`\uFF08${r(st)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${r(Lt("/api/health",oe))}`},V=()=>{let oe=as(),Se=`\u76EE\u524D\u4F86\u6E90\uFF1A${yc[oe]||oe||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,st="";oe==="query"?(st="is-warn",Se="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):Va()?(st="is-warn",Se="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(oe==="file-default"||window.location.protocol==="file:")&&(Se="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),Se+=(X?.value||Ka()).trim()?" \u7BA1\u7406\u6B0A\u6756\uFF1A\u5DF2\u8A2D\u5B9A\uFF0C\u6703\u9001\u5F80\u76EE\u524D\u8A2D\u5B9A\u7684 API Base\u3002":" \u7BA1\u7406\u6B0A\u6756\uFF1A\u672A\u8A2D\u5B9A\uFF1B\u672C\u6A5F loopback \u53EF\u76F4\u63A5\u4F7F\u7528\uFF0C\u9060\u7AEF\u7BA1\u7406 API \u6703\u88AB\u62D2\u7D55\u3002",E.textContent=Se,E.className=`api-dialog-note${st?` ${st}`:""}`;let Je=oe==="query";U.disabled=Je,te.disabled=Je,me.readOnly=Je},I=()=>{if(!ar(me.value))return _e("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),me.focus(),null;let oe=C();return window.location.protocol==="https:"&&/^http:\/\//i.test(oe)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(oe)?(_e("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),me.focus(),null):oe},W=()=>{me.value=cs(),G(),V(),_e("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},K=()=>{let oe=Array.isArray(i.embedding)?i.embedding.length:0,Se=Array.isArray(i.llm)?i.llm.length:0;if(S&&(S.textContent=o?"\u5207\u63DB\u4E2D\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",S.className=`badge badge-mono ${o?"badge-info":n?"badge-warn":"badge-neutral"}`),$){$.disabled=o,$.classList.toggle("is-on",n),$.classList.toggle("is-off",!n&&!o),$.classList.toggle("is-busy",o),$.setAttribute("aria-checked",n?"true":"false"),$.setAttribute("aria-busy",o?"true":"false"),$.setAttribute("aria-label",o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":n?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),$.title=o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let st=$.querySelector(".header-power-label");st&&(st.textContent=o?"\u2026":n?"ON":"OFF")}L&&(L.textContent=n?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${oe} \u500B embedding \u8207 ${Se} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),z&&(z.innerHTML=wc("Embedding",i.embedding)+wc("LLM",i.llm))},ke=async()=>{try{let oe=await O.testMode();if(a)return;n=!!oe.enabled,i=oe.models||{embedding:[],llm:[]},ye(P,"")}catch(oe){if(a)return;n=!1,i={embedding:[],llm:[]},ye(P,oe.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}a||K()},Fe=async()=>{if(o)return;let oe=!n;o=!0,K(),ye(P,oe?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let Se=await O.setTestMode(oe);if(a)return;n=!!Se.enabled,i=Se.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:n,models:i}}));let st=i.embedding?.length||0,Je=i.llm?.length||0;ye(P,n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${st} \u500B embedding \u8207 ${Je} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),T(n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${st} \u500B embedding\u3001${Je} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",n?"ok":"info",6e3),await ft()}catch(Se){a||(ye(P,Se.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),T(Se.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{o=!1,a||K()}},Ye=()=>{let oe=Hg(l);if(B&&(B.innerHTML=oe.summary),we&&(we.innerHTML=oe.list),ce&&(ce.innerHTML=oe.failures),Oe){Oe.disabled=d,Oe.setAttribute("aria-busy",d?"true":"false");let Se=Oe.querySelector("span");Se&&(Se.textContent=d?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66")}},ht=async()=>{try{let oe=await O.llmModels();if(a)return;l=oe,ye(Le,"")}catch(oe){if(a)return;l=null,ye(Le,oe.message||"\u7121\u6CD5\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u3002","error")}a||Ye()},lt=async()=>{if(!d){d=!0,Ye(),ye(Le,"\u6B63\u5728\u6AA2\u67E5 llama-server \u6A21\u578B\u8207 chat \u80FD\u529B\u2026");try{let oe=await O.testLlmModels();if(a)return;l=oe;let Se=oe.tested_now?.length||0,st=oe.chat_models?.length||0,Je=oe.failures?.length||0;ye(Le,`${Se?`\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u672C\u6B21\u65B0\u6E2C ${Se} \u500B\u6A21\u578B`:"\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u6C92\u6709\u65B0\u6A21\u578B"}\uFF0C\u76EE\u524D ${st} \u500B\u6A21\u578B\u652F\u63F4 chat${Je?`\uFF1B${Je} \u500B\u6A21\u578B\u66AB\u6642\u7121\u6CD5\u5224\u5B9A\uFF0C\u4E0B\u6B21\u6703\u91CD\u8A66`:""}\u3002`,Je?"warn":"ok"),T(Se?`LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u65B0\u589E ${Se} \u7B46\u80FD\u529B\u7D00\u9304\u3002`:"LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u6C92\u6709\u65B0\u6A21\u578B\u9700\u8981\u6E2C\u8A66\u3002",Je?"warn":"ok",5e3),await ke()}catch(oe){a||(ye(Le,oe.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),T(oe.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{d=!1,a||Ye()}}},tt=()=>{let oe=Ug(u);if(Ne&&(Ne.innerHTML=oe.summary),et&&(et.innerHTML=oe.list),ue&&(ue.innerHTML=oe.failures),qe){qe.disabled=f,qe.setAttribute("aria-busy",f?"true":"false");let Se=qe.querySelector("span");Se&&(Se.textContent=f?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C Reranker \u670D\u52D9\u6E2C\u8A66")}},rt=async()=>{try{let oe=await O.rerankStatus();if(a)return;u=oe,ye(re,"")}catch(oe){if(a)return;u=null,ye(re,oe.message||"\u7121\u6CD5\u8B80\u53D6 reranker \u72C0\u614B\u3002","error")}a||tt()},ae=async()=>{if(!f){f=!0,tt(),ye(re,"\u6B63\u5728\u5C0D primary\uFF0Ffallback reranker \u57F7\u884C\u5BE6\u969B rerank \u6E2C\u8A66\u2026");try{let oe=await O.testReranker();if(a)return;u=oe;let Se=Array.isArray(oe.providers)?oe.providers:[],st=Se.filter(zt=>zt.status==="operational").length,Je=Se.reduce((zt,At)=>zt+(Array.isArray(At.errors)?At.errors.length:0),0);ye(re,Je?`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${st} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C${Je} \u500B\u932F\u8AA4\uFF1B\u8A73\u7D30\u5206\u6578\u5DF2\u5217\u5728\u4E0A\u65B9\u3002`:`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${st} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C\u6A21\u578B ${oe.model||"\u2014"}\u3002`,Je?"warn":"ok"),T(Je?"Reranker \u90E8\u5206\u7AEF\u9EDE\u5931\u6557\uFF0C\u8ACB\u67E5\u770B\u6E2C\u8A66\u7D50\u679C\u3002":"Reranker \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\u3002",Je?"warn":"ok",5e3)}catch(oe){a||(ye(re,oe.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),T(oe.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{f=!1,a||tt()}}},it=()=>{if(!Te)return;let oe=Gg(y,b,p);oe!==w&&(w=oe,Te.innerHTML=pa(y,b,p))},Ke=async()=>{try{let oe=await O.testRuns(30);if(a)return;b=Array.isArray(oe.runs)?oe.runs:[]}catch{if(a)return;b=[]}},ft=async(oe=null)=>{try{let Se=oe||(p?await O.testRun(p):await O.testRunCurrent());if(a)return;y=Se.run||null,!p&&y&&y.status!=="running"&&!b.some(st=>st.run_id===y.run_id)&&await Ke()}catch{if(a)return;y=null}a||it()};me?.addEventListener("input",()=>{G(),_e("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),X?.addEventListener("input",()=>{V()}),H?.addEventListener("click",async()=>{let oe=I();if(oe!==null){he(H,!0,"\u6E2C\u8A66\u4E2D\u2026"),_e(`\u6B63\u5728\u9023\u7DDA\u5230 ${Ls(oe)||"\u540C\u6E90"}\u2026`);try{let Se=await Pi(oe);if(a)return;_e(`\u9023\u7DDA\u6210\u529F \xB7 v${Se.version} \xB7 ${Se.duration_ms} ms \xB7 GET ${Lt("/api/health",oe)}`,"ok")}catch(Se){a||_e(Se.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{a||he(H,!1)}}}),Y?.addEventListener("submit",oe=>{if(oe.preventDefault(),Ee())return;let Se=I();Se!==null&&(or(Se),Ya(X?.value||""),T(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${Ls(Se)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),te?.addEventListener("click",()=>{Ee()||(or(""),T("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),$?.addEventListener("click",Fe),Oe?.addEventListener("click",lt),qe?.addEventListener("click",ae),Te?.addEventListener("change",async oe=>{oe.target.id==="test-run-select"&&(p=String(oe.target.value||""),await ft())}),Te?.addEventListener("click",async oe=>{oe.target.closest("#test-flow-refresh")&&(p="",await Ke(),await ft())}),ie?.addEventListener("click",async()=>{he(ie,!0,"\u66F4\u65B0\u4E2D\u2026"),W(),await Promise.allSettled([ke(),Ke(),ht(),rt()]),a||await ft(),a||(he(ie,!1),T("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let Mt=oe=>{n=!!oe.detail?.enabled,i=oe.detail?.models||{embedding:[],llm:[]},K()};return window.addEventListener("judgment:test-mode",Mt),W(),K(),Ye(),tt(),await Promise.allSettled([ke(),Ke(),ht(),rt()]),await ft(),v=Ct("test-runs",async(oe,Se)=>{a||document.hidden||p||await ft(Se?.snapshot||null)}),!s&&typeof t?.setTitle=="function"&&t.setTitle(Ot),()=>{a=!0,v&&v(),window.removeEventListener("judgment:test-mode",Mt)}}var _c={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var qc={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},ji=new Set,kc="judgment.status.payload.v1",Mc=new Set(["tests","resources","local-model","api"]),Lc=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"tests",label:"\u7CFB\u7D71\u6E2C\u8A66",hint:"API\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u6A21\u578B Flow",icon:"terminal"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"local-model",label:"Model Provider",hint:"llama-server \u4E3B\u6A5F\u8207\u6A21\u578B",icon:"server"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 API \u2192 Pipeline \u2192 Data",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}],Ba=[{id:"system",label:"\u7CFB\u7D71\u8207\u5373\u6642\u72C0\u614B",icon:"activity",prefixes:["/api/health","/api/status","/api/system-usage","/api/events/stream","/api/processing/events/status","/api/docs","/api/openapi.json"]},{id:"processing",label:"\u8CC7\u6599\u8655\u7406\u8207\u66F4\u65B0",icon:"database",prefixes:["/api/processing","/api/judgment-download","/api/updates","/api/courts","/api/law-versions"]},{id:"data",label:"\u67E5\u8A62\u8207\u8CC7\u6599",icon:"search",prefixes:["/api/query","/api/data","/api/judgment","/api/law","/api/schema","/api/catalog","/api/judgment-stats","/api/quality"]},{id:"rag",label:"RAG \u554F\u7B54",icon:"message",prefixes:["/api/rag"]},{id:"index",label:"\u7248\u672C\u8207\u7D22\u5F15",icon:"layers",prefixes:["/api/index-versions","/api/index-alias","/api/versioning"]},{id:"models",label:"\u6A21\u578B\u8207\u670D\u52D9",icon:"brain",prefixes:["/api/ollama","/api/llm","/api/rerank","/api/test-mode"]},{id:"tests",label:"\u6E2C\u8A66\u8207\u6548\u80FD",icon:"activity",prefixes:["/api/test-runs","/api/performance"]},{id:"question-bank",label:"\u984C\u5EAB",icon:"file",prefixes:["/api/question-bank"]},{id:"benchmark",label:"Benchmark",icon:"grid",prefixes:["/api/benchmark"]},{id:"other",label:"\u5176\u4ED6",icon:"terminal",prefixes:[]}];function Qg(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:ns(e).label,tone:ns(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function Jg(e){let t=ns(e.status),s=_c[e.kind]||_c.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${c(e.latency_ms)} ms</span>`;return`<article class="service-card">
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
  </article>`}function Wg(e,t){let s=typeof e=="string"?{label:e}:e||{},a=String(s.label||"\u2014"),n=s.service?t.find(l=>l.id===s.service):null,i=n?n.status==="operational":a==="IndexedDB"?bo():!0,o=[s.detail||"",n?`\u72C0\u614B\uFF1A${ns(n.status).label}`:""].filter(Boolean).join(" \xB7 ");return`<div class="arch-node ${i?"":"is-muted"}" title="${r(o||(i?a:"\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"))}">
    <strong>${r(a)}</strong>
    ${s.detail?`<span class="arch-node-detail">${r(s.detail)}</span>`:""}
  </div>`}function Vg(e,t,s=!1){let a=e?.layers||[];if(!a.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let n=a.map(o=>{let l=(o.nodes||[]).map(d=>Wg(d,t)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${r(o.label||o.id)}</div>
      <div class="arch-nodes">${l}</div>
    </div>`}),i=[];return n.forEach((o,l)=>{l&&i.push(`<div class="arch-arrow" aria-hidden="true">${m("arrowRight",15)}</div>`),i.push(o)}),`<div class="arch-flow">${i.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${m("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>
    ${Kg(s)}`}function Kg(e=!1){return`<figure class="arch-diagram">
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
  </figure>`}function jc(e){let t=String(e||""),s=a=>t===a||t.startsWith(`${a}/`);for(let a of Ba)if(a.prefixes.some(s))return a;return Ba[Ba.length-1]}function Yg(e){return`is-${String(e||"get").toLowerCase()}`}function Xg(e){return`<div class="endpoint-row${e.deprecated?" is-deprecated":""}">
    <span class="endpoint-method ${Yg(e.method)}">${r(e.method||"GET")}</span>
    <span class="endpoint-path" title="${r(e.path||"")}">${r(e.path||"")}</span>
    <span class="endpoint-label">${r(e.label||"")}</span>
  </div>`}function Zg(e){if(!Array.isArray(e)||!e.length)return'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>';let t=new Map(Ba.map(s=>[s.id,{group:s,endpoints:[]}]));for(let s of e){let a=jc(s.path),n=t.get(a.id);n&&n.endpoints.push(s)}return`<div class="api-endpoint-groups">${Ba.map(s=>{let n=t.get(s.id)?.endpoints||[];return n.length?(n.sort((i,o)=>String(i.path).localeCompare(String(o.path))||String(i.method).localeCompare(String(o.method))),`<section class="card api-endpoint-group">
        <div class="side-card-head">
          <span class="side-card-title">${m(s.icon,14)}${r(s.label)}</span>
          <span class="badge badge-neutral badge-mono">${c(n.length)}</span>
        </div>
        <div class="endpoint-list">${n.map(Xg).join("")}</div>
      </section>`):""}).join("")}</div>`}function xs(e,t){return`<div class="detail-row">
    <span class="detail-label">${r(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function Ve(e,t,{mono:s=!1,wide:a=!1}={}){return`<div class="data-version-fact${a?" is-wide":""}">
    <span>${r(e)}</span>
    <strong class="${s?"mono":""}">${r(String(t??"\u2014"))}</strong>
  </div>`}function Sc(e,t,s,a=""){let n=t==null?null:Math.max(0,Math.min(100,Number(t)||0));return`<div class="data-version-coverage ${a}">
    <div class="data-version-coverage-head">
      <span>${r(e)}</span>
      <strong>${Qn(n)}</strong>
    </div>
    <div class="data-version-coverage-track"><span style="width:${n===null?0:n.toFixed(1)}%"></span></div>
    <div class="data-version-coverage-foot">${r(s)}</div>
  </div>`}function ef(e){if(!Array.isArray(e)||!e.length)return xt({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${r(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${en(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function tf(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=new Map(s.map(w=>[w.id,w])),n=a.get("qdrant"),i=a.get("embedding"),o=a.get("rag"),l=a.get("llm"),d=Number(t.judgment_indexed_count||0),u=Number(t.judgment_count||0),f=u?(d/u*100).toFixed(1):"0.0",y=t.judgment_vector_points===null||t.judgment_vector_points===void 0?"\u2014":c(t.judgment_vector_points),b=Number(t.judgment_index_remaining||0),p=o?.status==="operational"?"RAG \u5C31\u7DD2":o?.status==="not_configured"?"\u672A\u8A2D\u5B9A":o?.status==="degraded"?"\u964D\u7D1A":"\u672A\u77E5",v=[["cube","Qdrant \u5411\u91CF\u7D22\u5F15",n],["layers",`Embedding\uFF08${t.judgment_vector_model||"\u2014"}\uFF09`,i],["brain","RAG \u56DE\u7B54\u7BA1\u7DDA",o],["sparkles","LLM \u6A21\u578B",l]];return`<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}RAG \u8CC7\u6599\u73FE\u6CC1</span>
      ${Pe(o?.status,p)}
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
          <div class="mini-stat-value">${f}%</div>
          <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
        </div>
      </div>
      <div class="side-status-list">
        ${v.map(([w,q,k])=>`<div class="side-status-row">
              <span>${m(w,13)}${r(q)}</span>
              ${Pe(k?.status,k?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
            </div>`).join("")}
      </div>
      <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
        Collection\uFF1A${r(t.judgment_vector_collection||"\u2014")} \xB7
        ${y} points \xB7 \u5269\u9918 ${c(b)} \u7B46\u5F85\u7D22\u5F15
      </div>
    </div>
    <div class="side-card-foot">
      PostgreSQL \u5224\u6C7A\u6587\u4EF6\u3001Qdrant \u5411\u91CF\u7D22\u5F15\u8207 llama-server \u6A21\u578B\u72C0\u614B\u7686\u70BA\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u5C31\u7DD2\u6642\u6703\u660E\u78BA\u964D\u7D1A\u3002
    </div>
  </section>`}function Qn(e){let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function As(e){return Math.max(0,Number(e?.duration_ms)||0)}function sf(e,t){let s=e?.pipeline&&typeof e.pipeline=="object"?e.pipeline:null,a=Array.isArray(s?.stages)?s.stages:[],n=Number(s?.total_ms)||a.reduce((b,p)=>b+As(p),0),i=Math.max(0,Number(t?.initMs)||0),o=Math.max(0,Number(t?.requestMs)||0),l=Math.max(o,n),d=Math.max(0,l-n),u=[],f=t?.requestStartedAt||e?.checked_at||null,y=t?.requestFinishedAt||e?.checked_at||null;if(i>.5&&u.push({key:"page-init",label:"\u9801\u9762\u521D\u59CB\u5316",caption:"\u5EFA\u7ACB\u670D\u52D9\u7E3D\u89BD\u9AA8\u67B6\u8207\u5C0E\u89BD",color:"#64748b",status:"success",duration_ms:i,started_at:t?.initStartedAt||f,finished_at:f,message:"\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u3001\u8F09\u5165\u6A21\u7D44\u4E26\u6E96\u5099\u8ACB\u6C42\u3002"}),a.length){d>.5&&u.push({key:"http",label:"HTTP \u50B3\u8F38\uFF0F\u6392\u968A",caption:"\u700F\u89BD\u5668 \u2192 FastAPI",color:"#94a3b8",status:"success",duration_ms:d,started_at:f,finished_at:y,message:"\u5305\u542B\u9023\u7DDA\u3001\u8ACB\u6C42\u6392\u968A\u8207\u56DE\u61C9\u50B3\u8F38\u3002"}),u.push(...a);let b=a.reduce((v,w)=>v+As(w),0),p=Math.max(0,n-b);p>.5&&u.push({key:"server-assemble",label:"\u4F3A\u670D\u5668\u5F59\u6574",caption:"\u72C0\u614B\u56DE\u61C9\u7D44\u88DD",color:"#cbd5e1",status:"success",duration_ms:p,started_at:a[a.length-1]?.finished_at||f,finished_at:y,message:"\u7D44\u88DD\u670D\u52D9\u3001\u8CC7\u6599\u91CF\u8207\u67B6\u69CB payload\u3002"})}else u.push({key:"status-request",label:"GET /api/status",caption:"\u670D\u52D9\u72C0\u614B\u8207\u8CC7\u6599\u91CF",color:"#64748b",status:"success",duration_ms:l,started_at:f,finished_at:y,message:"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF1B\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593\u3002"});return{total_ms:i+l,started_at:t?.initStartedAt||f,finished_at:y,stages:u,server_ms:n,request_ms:l,transport_ms:d,init_ms:i,detailed:!!s}}function af(e){let t=e?.page_pipeline,s=Array.isArray(t?.stages)?t.stages:[];if(!t||!s.length)return"";let a=Math.max(0,Number(t.total_ms)||s.reduce(($,L)=>$+As(L),0)),n=Math.max(a,s.reduce(($,L)=>$+As(L),0),1),i=1.25,o=s.filter($=>String($.status||"success")!=="skipped"),l=s.filter($=>["success","no_change"].includes(String($.status||"success"))).length,d=s.filter($=>$.status==="failed").length,u=s.reduce(($,L)=>As(L)>As($)?L:$,s[0]),f=Math.max(0,Number(t.server_ms)||Number(e?.pipeline?.total_ms)||0),y=Math.max(0,Number(t.transport_ms)||0),b=Math.max(0,Number(t.init_ms)||0),p=s.map($=>String($.status||"success")==="skipped"?0:Math.max(As($)/n*100,i)),v=p.reduce(($,L)=>$+L,0),w=v>100?100/v:1,q=0,k=s.map(($,L)=>{let z=String($.status||"success"),P=z==="skipped",Y=$.label||$.key||`\u968E\u6BB5 ${L+1}`,me=$.caption||"",X=As($),j=P?"\u2014":be(X),x=n>0?X/n*100:0,E=P?0:p[L]*w,H=q;P||(q+=E);let te=$.color||"#64748b",U=z==="failed"?"var(--danger)":te,ie=[`is-${z}`,z==="failed"?"is-error":"",P?"is-missing":""].filter(Boolean).join(" "),Te=E>0?`<span class="rag-wf-bar status-wf-bar is-sequential" style="left:${H.toFixed(3)}%;width:${E.toFixed(4)}%;top:0;height:12px;--bar-color:${r(U)}" aria-hidden="true"></span>`:"",B=P?"\u7565\u904E":z==="failed"?"\u5931\u6557":"\u5B8C\u6210",we=`${t.label||"status"}:${$.key||L}`,ce=[["\u72C0\u614B",B,!0],["\u958B\u59CB",$.started_at?$e($.started_at):"\u2014",!0],["\u7D50\u675F",$.finished_at?$e($.finished_at):"\u2014",!0],["\u8017\u6642",j,!0],["\u5360\u6574\u9AD4",Qn(x),!0],["\u8AAA\u660E",$.message||"",!1]].map(([Le,Oe,Ne])=>Ne||Oe?`<span class="rag-wf-detail"><span>${r(Le)}</span><strong>${r(String(Oe||"\u2014"))}</strong></span>`:"").join("");return`<details class="rag-wf-stage status-wf-stage ${ie}" data-status-wf-stage="${r(we)}"${ji.has(we)?" open":""} style="--stage-color:${r(te)}">
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="status-wf-step">${String(L+1).padStart(2,"0")}</span> ${r(Y)}</strong>${me?`<small>${r(me)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(j)} \xB7 ${r(B)} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${Y}\uFF1A${B}\uFF0C\u8017\u6642 ${j}\uFF0C\u5360\u6574\u9AD4 ${Qn(x)}`)}">${Te}</span>
        </summary>
        <div class="rag-wf-details">${ce}</div>
      </details>`}).join(""),S=t.detailed?"\u5F8C\u7AEF /api/status \u968E\u6BB5\u660E\u7D30":"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF0C\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593";return`<section class="report-card status-wf-card" data-status-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m("activity",14)}\u670D\u52D9\u7E3D\u89BD\u8F09\u5165 Pipeline</span>
      <div class="index-runtime-metrics">
        <span class="index-runtime-metric" title="\u672C\u6B21\u9801\u9762\u521D\u59CB\u5316\u5230\u72C0\u614B\u56DE\u61C9\u5B8C\u6210\u7684\u7E3D\u6642\u9593\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(be(a))}</strong></span>
        <span class="index-runtime-metric" title="\u5F8C\u7AEF /api/status \u6AA2\u67E5\u968E\u6BB5\u7684\u5408\u8A08\u6642\u9593\u3002"><span>Server</span><strong>${r(be(f))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u8ACB\u6C42\u6642\u9593\u6263\u6389\u5F8C\u7AEF\u6AA2\u67E5\u5F8C\u7684\u50B3\u8F38\u8207\u6392\u968A\u6642\u9593\u3002"><span>HTTP \u50B3\u8F38</span><strong>${r(be(y))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u9AA8\u67B6\u8207\u8F09\u5165\u6A21\u7D44\u7684\u6642\u9593\u3002"><span>\u9801\u9762\u521D\u59CB\u5316</span><strong>${r(be(b))}</strong></span>
        <span class="index-runtime-metric" title="\u8017\u6642\u6700\u9577\u7684\u6AA2\u67E5\u968E\u6BB5\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${u?.label||"\u2014"} \xB7 ${be(As(u))}`)}</strong></span>
        <span class="index-runtime-metric" title="\u5B8C\u6210\u7684\u6AA2\u67E5\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\uFF1B\u5931\u6557\u968E\u6BB5\u6703\u4EE5\u7D05\u8272\u6A19\u793A\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${c(l)} / ${c(s.length)}${d?` \xB7 \u5931\u6557 ${c(d)}`:""}</strong></span>
      </div>
    </div>
    <div class="status-wf-summary">
      <span>\u6AA2\u67E5 <strong>${r($e(e.checked_at))}</strong></span>
      <span>API <strong class="mono">${r(Ls())}</strong></span>
      <span>\u7248\u672C <strong class="mono">v${r(e.version||"\u2014")}</strong></span>
      <span>\u74B0\u5883 <strong>${r(e.environment||"\u2014")}</strong></span>
      <span>${r(S)}</span>
    </div>
    <div class="status-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${r(be(a))}</span>
      </div>
      <div class="rag-wf-legend workflow-wf-legend" aria-label="\u968E\u6BB5\u72C0\u614B\u5716\u4F8B">
        <span><i class="is-solid-state"></i>\u5B8C\u6210</span>
        <span><i class="is-failed-state"></i>\u5931\u6557</span>
        <span><i class="is-empty-state"></i>\u7565\u904E</span>
      </div>
      <div class="rag-wf-stages">${k}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u986F\u793A\u672C\u6B21\u958B\u555F\u670D\u52D9\u7E3D\u89BD\u7684\u9801\u9762\u521D\u59CB\u5316\u3001HTTP \u5F80\u8FD4\u3001\u5F8C\u7AEF\u6AA2\u67E5\u8207\u56DE\u61C9\u5F59\u6574\u3002\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u5931\u6557\u968E\u6BB5\u4EE5\u7D05\u8272\u6A19\u793A\uFF0C\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\uFF1B\u6975\u77ED\u968E\u6BB5\u4FDD\u7559\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function nf(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=Qg(e.status),n=s.find(u=>u.id==="qdrant"),i=s.find(u=>u.id==="rag"),o=s.find(u=>u.id==="llm"),l=as(),d=qc[l]||l;return`<section class="status-hero">
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
          <span>${m("clock",11)} \u6AA2\u67E5\u6642\u9593 ${$e(e.checked_at)} \xB7 ${r(_a(e.checked_at))}</span>
          <span>${m("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${m("database",11)} ${c(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${m("layers",11)} ${c(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${r(d)}">${m("link",11)} ${r(Ls())}</span>
        </div>
      </div>
    </section>

    ${af(e)}

    <div class="service-grid">${s.map(Jg).join("")}</div>

    ${tf(e)}

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

    ${n?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${Ge({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${r(n?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${r(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${r(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}`}function rf(e,t=!1){let s=Array.isArray(e.services)?e.services:[],a=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Pipelines \u2192 Data \xB7 \u6700\u65B0\u5C08\u6848\u5143\u4EF6\u8207\u5373\u6642\u5065\u5EB7\u72C0\u614B</div>
      </div>
      <span class="badge badge-neutral badge-mono">${c((a.flow||[]).length)} layers</span>
    </div>
    ${Vg(a,s,t)}
  </div>`}function of(e){let t=Array.isArray(e.endpoints)?e.endpoints:[],s=as(),a=qc[s]||s,n=Lt("/api/docs"),i=Lt("/api/openapi.json"),o=new Set(t.map(u=>jc(u.path).id)),l=t.reduce((u,f)=>{let y=String(f.method||"GET").toUpperCase();return u[y]=(u[y]||0)+1,u},{}),d=["GET","POST","PATCH","PUT","DELETE"].filter(u=>l[u]).map(u=>`${u} ${c(l[u])}`).join(" \xB7 ");return`<section class="status-hero api-endpoint-hero">
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
          <span>${m("server",11)} API Base <span class="mono">${r(Ls())}</span>\uFF08${r(a)}\uFF09</span>
          <span>${m("terminal",11)} ${r(d||"\u2014")}</span>
          <span>${m("clock",11)} \u66F4\u65B0\u6642\u9593 ${$e(e.checked_at)}</span>
        </div>
      </div>
      <div class="api-endpoint-actions">
        <a class="btn btn-secondary btn-sm" href="${r(n)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>Swagger UI</span></a>
        <a class="btn btn-ghost btn-sm" href="${r(i)}" target="_blank" rel="noopener noreferrer">OpenAPI JSON ${m("external",11)}</a>
      </div>
    </section>
    ${Zg(t)}
    <p class="status-footnote">\u7AEF\u9EDE\u7531 FastAPI route table \u52D5\u614B\u7522\u751F\uFF1B\u4E92\u52D5\u5F0F\u6587\u4EF6\u4F4D\u65BC <a href="${r(n)}" target="_blank" rel="noopener noreferrer"><code>${r(n)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${r(i)}" target="_blank" rel="noopener noreferrer"><code>${r(i)}</code></a>\u3002\u7AEF\u9EDE\u8B8A\u66F4\u5F8C\u91CD\u65B0\u6574\u7406\u6B64\u9801\u5373\u53EF\u53D6\u5F97\u6700\u65B0\u6E05\u55AE\u3002</p>`}function lf(e,t={}){let s=e.data||{},a=t.info||null,n=a?.counts||{},i=Number(s.judgment_indexed_count||0),o=Number(s.judgment_count||0),l=Number(s.judgment_index_remaining??Math.max(0,o-i)),d=Number(s.judgment_index_pending??l)||0,u=Number(s.judgment_index_changed||0),f=Number(s.judgment_index_stale||0),y=o>0?Math.max(0,Math.min(100,i/o*100)):null,b=Qn(y),p=s.judgment_index_fresh===!1||d>0||String(s.judgment_index_staleness?.status||"")==="stale",v=p?"is-warn":"",w=s.last_version||{},q=s.last_run||{},k=w.source_type==="law"?"\u6CD5\u898F":w.source_type==="order"?"\u547D\u4EE4":"\u2014",S=w.version_code?String(w.version_code):w.id?`#${c(w.id)}`:"\u2014",$=Number(s.legal_article_indexed_count||s.legal_index?.points_count||0),L=Number(s.legal_article_count||s.legal_index?.article_count||0),z=L>0?Math.max(0,Math.min(100,$/L*100)):null,P=s.legal_article_stale===!0||String(s.legal_index?.status||"")==="stale",Y=P?"is-warn":"",me=s.judgment_vector_alias||"\u2014",X=s.judgment_vector_collection||"\u2014",j=s.legal_article_vector_alias||s.legal_index?.alias||"\u2014",x=s.legal_article_vector_collection||s.legal_index?.collection||"\u2014",E=p?"\u5224\u6C7A\u7D22\u5F15\u5F85\u66F4\u65B0":"\u8CC7\u6599\u7248\u672C\u4E00\u81F4",H=p?`\u5224\u6C7A\u7D22\u5F15\u5C1A\u7F3A ${c(d)} \u7B46`:"\u5224\u6C7A\u8CC7\u6599\u8207\u5411\u91CF\u7D22\u5F15\u4E00\u81F4",te=p?`PostgreSQL \u76EE\u524D\u6709 ${c(o)} \u7B46\u5224\u6C7A\uFF0CQdrant ${X} \u5DF2\u7D22\u5F15 ${c(i)} \u7B46\uFF1B\u5C1A\u6709 ${c(d)} \u7B46\u5F85\u7D22\u5F15\u3002`:"PostgreSQL \u8207 Qdrant \u5224\u6C7A\u7B46\u6578\u4E00\u81F4\uFF1B\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u8207\u7D22\u5F15\u72C0\u614B\u540C\u6B65\u3002",U=ns(q.status||"idle").label,ie=q.finished_at||q.started_at;return`<section class="status-hero data-version-hero">
      <div class="status-hero-main">
        <div class="overall-row">
          <span class="overall-badge ${v}">
            <span class="status-dot ${p?"is-warn":"is-ok"}" aria-hidden="true"></span>
            ${r(E)}
          </span>
          <span class="badge badge-neutral badge-mono">${c(s.version_count)} \u500B\u8CC7\u6599\u7248\u672C</span>
          <span class="badge badge-neutral">${r(k)} \u6700\u65B0\u7248\u672C ${r(S)}</span>
        </div>
        <h2 class="status-headline">${r(H)}</h2>
        <p class="status-copy">${r(te)}</p>
        <div class="status-meta">
          <span>${m("clock",11)} \u6AA2\u67E5\u6642\u9593 ${$e(e.checked_at)}</span>
          <span>${m("database",11)} \u73FE\u884C\u8CC7\u6599 ${c(s.total_current)} \u7B46</span>
          <span>${m("layers",11)} \u539F\u59CB Parquet ${c(s.parquet_files)} \u500B \xB7 ${Ie(s.parquet_bytes)}</span>
          <span title="Qdrant alias \u8207\u76EE\u524D\u7248\u672C collection">${m("link",11)} <span class="mono">${r(me)} \u2192 ${r(X)}</span></span>
        </div>
      </div>
      <div class="data-version-ring ${v}" style="--coverage:${y===null?0:y.toFixed(1)}%">
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
        <div class="metric-foot">${c(s.parquet_files)} \u500B\u539F\u59CB Parquet \xB7 ${Ie(s.parquet_bytes)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u5224\u6C7A\u6587\u4EF6</div>
        <div class="metric-value">${c(s.judgment_count)}</div>
        <div class="metric-foot">PostgreSQL current</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Qdrant \u5224\u6C7A\u5411\u91CF\u7D22\u5F15</div>
        <div class="metric-value">${c(s.judgment_indexed_count)}</div>
        <div class="metric-foot">${b} \xB7 \u5269\u9918 ${c(d)} \u7B46</div>
      </div>
    </div>

    <div class="status-columns data-version-grid">
      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${m("database",14)}PostgreSQL \u8CC7\u6599\u7248\u672C</span>
          ${Pe(w.is_current?"operational":"degraded",w.is_current?"CURRENT":"HISTORY")}
        </div>
        ${w.id?`<div class="index-current-row">
                <span class="badge badge-info">${m("activity",11)}${r(k)} ${r(S)}</span>
                <strong class="mono">${$e(w.downloaded_at)}</strong>
                <span class="index-current-copy" title="${r(w.parquet_path||"")}">${r(w.parquet_path||"\u2014")}</span>
              </div>
              <div class="data-version-facts">
                ${Ve("\u8CC7\u6599\u7248\u672C\u7E3D\u6578",c(s.version_count),{mono:!0})}
                ${Ve("\u4E0B\u8F09\u57F7\u884C\u7E3D\u6578",c(s.run_count),{mono:!0})}
                ${Ve("\u7248\u672C ID",`#${c(w.id)}`,{mono:!0})}
                ${Ve("\u8CC7\u6599\u985E\u578B",k)}
                ${Ve("\u4F86\u6E90\u66F4\u65B0\u65E5",w.update_date||"\u2014")}
                ${Ve(`${k}\uFF0F\u689D\u6587`,`${c(w.law_count)} / ${c(w.article_count)}`)}
                ${Ve("\u4E0B\u8F09\u6642\u9593",$e(w.downloaded_at),{mono:!0})}
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
                ${Ve("\u5DF2\u7528\u5BB9\u91CF",Ie(a.usage_bytes),{mono:!0})}
                ${Ve("\u53EF\u7528\u914D\u984D",Ie(a.quota_bytes),{mono:!0})}
              </div>
              <p class="data-version-note">${m("info",12)}
                IndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u7AEF\u63D0\u554F\u6B77\u53F2\u3001\u8A2D\u5B9A\u8207\u7248\u672C\u7A3D\u6838\u4E8B\u4EF6\uFF1B\u4F3A\u670D\u5668\u8CC7\u6599\u4EE5 PostgreSQL \u8207 Parquet \u70BA\u6E96\u3002
              </p>`:`<div class="report-empty-inline">${t.loading||!t.error?"\u6B63\u5728\u8B80\u53D6\u700F\u89BD\u5668 IndexedDB\u2026":r(t.error?.message||"IndexedDB \u5C1A\u7121\u8CC7\u6599\u6216\u7121\u6CD5\u8B80\u53D6\u3002")}</div>`}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${m("brain",14)}Qdrant \u5224\u6C7A\u5411\u91CF\u7D22\u5F15</span>
          ${Pe(p?"degraded":"operational",p?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${m("link",11)}Alias</span>
          <strong class="mono">${r(me)}</strong>
          <span class="mono">\u2192 ${r(X)}</span>
          <span class="index-current-copy">v#${c(s.judgment_vector_version_id)} \xB7 ${r(s.judgment_vector_model||"\u2014")}</span>
        </div>
        ${Sc("\u7D22\u5F15\u8986\u84CB",y,`\u5DF2\u7D22\u5F15 ${c(i)} / ${c(o)} \u7B46 \xB7 \u5269\u9918 ${c(d)} \u7B46`,v)}
        <div class="data-version-facts">
          ${Ve("Qdrant points",c(s.judgment_vector_points),{mono:!0})}
          ${Ve("\u7D22\u5F15\u7248\u672C",`#${c(s.judgment_vector_version_id)} \xB7 ${s.judgment_vector_version_status||"legacy"}`,{mono:!0})}
          ${Ve("\u524D\u4E00\u7248\u672C",s.judgment_vector_previous_version_id?`#${c(s.judgment_vector_previous_version_id)}`:"\u2014",{mono:!0})}
          ${Ve("\u5F85\u88DC\uFF0F\u8B8A\u66F4\uFF0F\u5931\u6548",`${c(d)} / ${c(u)} / ${c(f)}`)}
          ${Ve("\u6700\u8FD1\u7D22\u5F15",$e(s.judgment_indexed_at),{mono:!0})}
          ${Ve("\u6A21\u578B",s.judgment_vector_model||"\u2014",{mono:!0})}
        </div>
        ${d>0?`<p class="data-version-note is-warn">${m("info",12)}\u5C1A\u6709 ${c(d)} \u7B46\u5224\u6C7A\u5C1A\u672A\u7D22\u5F15\uFF1B\u8ACB\u81F3\u300C\u8CC7\u6599\u8655\u7406 \u2192 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u63A5\u7E8C\u88DC\u9F4A\u3002</p>`:""}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${m("shield",14)}Qdrant \u6CD5\u898F\uFF0F\u547D\u4EE4\u5411\u91CF\u7D22\u5F15</span>
          ${Pe(P?"degraded":"operational",P?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${m("link",11)}Alias</span>
          <strong class="mono">${r(j)}</strong>
          <span class="mono">\u2192 ${r(x)}</span>
          <span class="index-current-copy">v#${c(s.legal_article_vector_version_id||s.legal_index?.version_id)}</span>
        </div>
        ${Sc("\u689D\u6587\u7D22\u5F15\u8986\u84CB",z,`\u5DF2\u7D22\u5F15 ${c($)} / ${c(L)} \u689D`,Y)}
        <div class="data-version-facts">
          ${Ve("Qdrant points",c($),{mono:!0})}
          ${Ve("\u73FE\u884C\u689D\u6587",c(L),{mono:!0})}
          ${Ve("\u5411\u91CF\u7DAD\u5EA6",c(s.legal_index?.dimension),{mono:!0})}
          ${Ve("\u6700\u8FD1\u7D22\u5F15",$e(s.legal_article_indexed_at||s.legal_index?.indexed_at),{mono:!0})}
          ${Ve("\u7D22\u5F15\u72C0\u614B",P?"stale":"fresh",{mono:!0})}
          ${Ve("Collection",x,{mono:!0})}
        </div>
      </section>

      <section class="card data-version-card is-wide-grid">
        <div class="side-card-head">
          <span class="side-card-title">${m("folder",14)}Parquet \u8207\u57F7\u884C\u72C0\u614B</span>
          <span class="badge badge-neutral badge-mono">${c(s.parquet_files)} FILES</span>
        </div>
        <div class="data-version-facts">
          ${Ve("\u539F\u59CB Parquet \u6A94\u6848",c(s.parquet_files),{mono:!0})}
          ${Ve("\u5408\u8A08\u5BB9\u91CF",Ie(s.parquet_bytes),{mono:!0})}
          ${Ve("PostgreSQL \u73FE\u884C\u8CC7\u6599",c(s.total_current),{mono:!0})}
          ${Ve("\u8CC7\u6599\u7248\u672C\u7E3D\u6578",c(s.version_count),{mono:!0})}
          ${Ve("\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C",q.status?U:"\u2014")}
          ${Ve("\u6700\u8FD1\u57F7\u884C\u6642\u9593",ie?$e(ie):"\u2014",{mono:!0})}
          ${Ve("\u6700\u8FD1\u57F7\u884C\u8017\u6642",q.duration_ms?be(q.duration_ms):"\u2014",{mono:!0})}
          ${Ve("\u6700\u8FD1\u57F7\u884C\u7248\u672C",q.version_id?`#${c(q.version_id)}`:"\u2014",{mono:!0})}
        </div>
        <p class="data-version-note">${m("info",12)}
          \u539F\u59CB Parquet \u4FDD\u7559 raw\uFF0Fdelta \u8207 manifest\uFF1BPostgreSQL \u63D0\u4F9B current metadata \u8207\u7248\u672C\u72C0\u614B\uFF1BQdrant \u53EA\u4FDD\u5B58\u5411\u91CF\u8207 payload\u3002
        </p>
      </section>
    </div>`}function cf(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${c(t.run_count)} TOTAL</span>
    </div>
    ${ef(e.recent_runs)}
  </section>`}function df(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function Tc(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function Vs(e,t,s,a,n){let i=df(n);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${m(t,14)}${r(e)}</span>
      <strong>${r(s)}</strong>
    </div>
    ${Tc(n,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function uf(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${m("layers",14)}Docker</span>
        ${Pe("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${r(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,d=o.service?0:1;return l-d||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${r(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${r(i.service)}</span>`:""}</td>
        <td>${Pe(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
        <td class="cell-number">${i.cpu_percent===null||i.cpu_percent===void 0?"\u2014":`${c(i.cpu_percent)}%`}</td>
        <td class="cell-number">${Ie(i.memory_used)}${i.memory_limit?` / ${Ie(i.memory_limit)}`:""}</td>
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
  </section>`}function pf(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",n=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${xs("\u8CC7\u6599\u5EAB",`<code>${r(s.database||"\u2014")}</code>`)}
           ${xs("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${Ie(s.storage_bytes)}</strong>`)}
           ${xs("Docker volume",`<strong>${Ie(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${xs("\u9023\u7DDA\u6578",`<strong>${c(s.connections)}</strong>`)}`:`${xs("Collection",`<code>${r(s.collection||"\u2014")}</code>`)}
           ${xs("Docker volume",`<strong>${Ie(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${xs("\u5411\u91CF\u9EDE\u6578",`<strong>${c(s.points_count)}</strong>`)}
           ${xs("Collections",`<strong>${c(s.collections)}</strong>`)}
           ${xs("Segments",`<strong>${c(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${r(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${r(s.kind||"")}</div>
          </div>
          ${Pe(i)}
        </div>
        <div class="resource-db-metrics">
          <div><span>CPU</span><strong>${s.cpu_percent===null||s.cpu_percent===void 0?"\u2014":`${c(s.cpu_percent)}%`}</strong></div>
          <div><span>RAM</span><strong>${Ie(s.memory_used)}</strong><small>${s.memory_limit?` / ${Ie(s.memory_limit)}`:""}</small></div>
          <div><span>\u5BB9\u5668</span><strong class="mono">${r(s.container||"\u2014")}</strong><small>${r(s.container_status||"\u2014")}</small></div>
        </div>
        <div class="detail-list">${o}</div>
        ${n.length?`<div class="resource-table-wrap">
                <table class="data-table is-compact">
                  <thead><tr><th scope="col">\u8CC7\u6599\u8868</th><th scope="col">\u5927\u5C0F</th></tr></thead>
                  <tbody>${n.map(l=>`<tr>
                        <td class="mono">${r(l.name||"\u2014")}</td>
                        <td class="cell-number">${Ie(l.bytes)}</td>
                      </tr>`).join("")}</tbody>
                </table>
              </div>`:""}
        <div class="side-card-foot">${r(s.detail||"")}</div>
      </article>`}).join("")}</div>`}function ga(e,t,s,a){let n=Number(t)||0,i=a?n/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${r(e)}</span>
      <strong>${Ie(n)}</strong>
    </div>
    ${Tc(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function mf(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},n=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},d=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${Ie(d)}</span>
    </div>
    <div class="storage-list">
      ${ga("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${r(s.frontend_path||"\u2014")}</span>`,d)}
      ${ga("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${r(s.backend_path||"\u2014")}</span>`,d)}
      ${ga("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",n.layers_bytes,`Images ${Ie(n.images_bytes)} \xB7 Containers ${Ie(n.containers_bytes)} \xB7 Build cache ${Ie(n.build_cache_bytes)}`,d)}
      ${ga("PostgreSQL volume",o.size_bytes,`<span class="mono">${r(o.name||"\u2014")}</span>`,d)}
      ${ga("Qdrant volume",l.size_bytes,`<span class="mono">${r(l.name||"\u2014")}</span>`,d)}
      ${ga("Parquet",a.total_bytes,`\u6CD5\u898F ${Ie(a.law_bytes)} \xB7 \u5224\u6C7A ${Ie(a.judgment_bytes)}`,d)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${Ie(d)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function gf(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},n=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),d=Array.isArray(e.disk)?e.disk:[],u=d[0]||{},f=Number(o.total_bytes||u.total||0),y=f?l/f*100:0,b=[s.load_1,s.load_5,s.load_15].map(w=>w??"\u2014").join(" / "),p=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":be(Number(t.uptime_seconds)*1e3),v=[u.label?Vs("HDD \u5DF2\u4F7F\u7528","database",`${c(u.percent)}%`,`${Ie(u.used)} / ${Ie(u.total)} \xB7 \u5269\u9918 ${Ie(u.free)}<br><span class="mono">${r(u.path||"")}</span>`,u.percent):"",l?Vs("Judgment \u5143\u4EF6\u5408\u8A08","layers",Ie(l),`\u7D04\u5360 HDD ${c(y)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,y):"",...d.slice(1).map(w=>Vs(`\u786C\u789F \xB7 ${w.label}`,"layers",`${c(w.percent)}%`,`${Ie(w.used)} / ${Ie(w.total)} \xB7 \u5269\u9918 ${Ie(w.free)}<br><span class="mono">${r(w.path||"")}</span>`,w.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${$e(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${Vs("CPU \u4F7F\u7528\u7387","cpu",`${c(s.percent)}%`,`${c(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${c(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${r(b)}`,s.percent)}
      ${Vs("\u8A18\u61B6\u9AD4","server",`${c(a.percent)}%`,`${Ie(a.used)} / ${Ie(a.total)} \xB7 \u53EF\u7528 ${Ie(a.available)}`,a.percent)}
      ${Vs("Swap","layers",`${c(n.percent)}%`,`${Ie(n.used)} / ${Ie(n.total)}`,n.percent)}
      ${Vs("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${c(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${r(p)}<br>${r(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${v||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${mf(e)}
    ${uf(e)}
    ${pf(e)}`}function xc(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function ff(e){return`<div class="report-card">
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
  </div>`}function bf(e){return e.status==="operational"?{label:"\u5DF2\u9023\u7DDA",badge:"badge-ok"}:{label:"\u7121\u6CD5\u9023\u7DDA",badge:"badge-danger"}}function vf(e,t){let s=bf(e),a=Array.isArray(e.models)?e.models:[],n=a.length?a.map(i=>{let o=String(i.name||""),l=e.chat_model===o,d=e.embedding_model===o,u=i.size?Ie(i.size):"",f=i.modified_at?$e(i.modified_at):"",y=new Set((i.capabilities||[]).map(p=>String(p||"").toLowerCase())),b=[];return i.supports_chat===!0&&b.push(["Chat","badge-ok"]),y.has("embedding")&&b.push(["Embedding","badge-info"]),y.has("vision")&&b.push(["Vision","badge-neutral"]),y.has("tools")&&b.push(["Tools","badge-neutral"]),y.has("thinking")&&b.push(["Thinking","badge-neutral"]),y.has("speech")&&b.push(["Speech","badge-warn"]),i.is_reranker&&b.push(["Reranker","badge-neutral"]),b.length||b.push([i.capability_status==="untested"?"\u672A\u6E2C\u8A66":"\u7121 chat \u80FD\u529B","badge-neutral"]),`<div class="ollama-model-row">
            <div class="ollama-model-main">
              <strong>${r(o)}</strong>
              <span class="ollama-model-meta">${[u,f].filter(Boolean).map(p=>r(p)).join(" \xB7 ")||"\u2014"}</span>
              <div class="ollama-model-capabilities">${b.map(([p,v])=>`<span class="badge ${v}">${r(p)}</span>`).join("")}</div>
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
  </article>`}function hf(e,t,s,a){if(s)return`<div class="report-card">
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
      ${t?'<div class="ollama-loading"><span class="spinner"></span><span>\u8B80\u53D6 llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span></div>':i.length?`<div class="ollama-host-list">${i.map(u=>vf(u,a)).join("")}</div>`:xt({iconName:"server",title:"\u5C1A\u672A\u8A2D\u5B9A llama-server \u4E3B\u6A5F",text:"\u8ACB\u5728\u4E0A\u65B9\u8F38\u5165\u7DB2\u5740\u8207 Port \u65B0\u589E\uFF0C\u6216\u4F7F\u7528 .env \u7684\u9810\u8A2D\u9023\u7DDA\u3002"})}
      <p class="report-sub" style="margin-top:12px">\u8A2D\u70BA\u804A\u5929\u6216\u5D4C\u5165\u6A21\u578B\u5F8C\uFF0C\u7CFB\u7D71\u6703\u4F7F\u7528\u76EE\u524D\u4E3B\u6A5F\u7684\u5C0D\u61C9\u6A21\u578B\u57F7\u884C AI \u51FA\u984C\u8207 RAG\uFF1B\u672A\u8A2D\u5B9A\u6642\u6CBF\u7528 .env \u7684 LLM_MODEL\uFF0FEMBEDDING_MODEL\u3002</p>
    </div>
  </div>`}function $f(e,t,s,a=!1){let n=e?.data||{},i=e?ns(e.status):null,o=s?ns(s.status):null,l={overview:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(i.label)}</span>`:"",resources:o?`<span class="badge ${o.tone==="ok"?"badge-ok":o.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(o.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${c(n.version_count)}</span>`,tests:'<span class="badge badge-neutral badge-mono">TEST</span>',"local-model":'<span class="badge badge-neutral badge-mono">LLAMA-SERVER</span>',runs:`<span class="badge badge-neutral badge-mono">${c(n.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${Lc.map(d=>{let u=d.id===t,f=a&&Mc.has(d.id);return`<button class="status-tab${u?" is-active":""}${f?" is-demo-locked":""}" type="button"
          data-status-tab="${d.id}" ${u?'aria-current="page"':""} ${f?'data-demo-lock-tooltip="\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B\u6B64\u7BA1\u7406\u529F\u80FD"':""}>
          <span class="status-tab-icon">${m(d.icon,15)}</span>
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
    </div>`}function yf(e,t,s,a,n,i,o,l=!1){if(e==="resources")return s?gf(s):a?xc():n?ff(n):xc();if(e==="local-model"){let d=i||{},u=!!d.loading||!d.hosts&&!d.error;return hf(d.hosts||null,u,d.error||null,d.editingId||null)}return e==="architecture"?rf(t,l):e==="api"?of(t):e==="data"?lf(t,o):e==="runs"?cf(t):nf(t)}function wf(){return`<div class="status-hero">
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
    </div>`}function Ac(e){return`<div class="report-card">
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
  </div>`}async function _f(e,t){let s=rs(),a=!1,n=null,i=null,o="overview",l=null,d=!1,u=null,f=null,y=!1,b=null,p=null,v=null,w=!1,q=null,k=!1,S=!1,$=null,L=0,z="",P="",Y=performance.now(),me=new Date().toISOString(),X=!1;e.innerHTML=`<section class="page status-page">
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
      <section class="status-panel" id="status-content">${wf()}</section>
    </div>
  </section>`;let j=e.querySelector("#status-nav"),x=e.querySelector("#status-content"),E=e.querySelector("#refresh-status"),H=e.querySelector("#auto-refresh"),te=()=>{if(L+=1,typeof $=="function")try{$()}catch{}$=null,k=!1,S=!1},U=async()=>{let ue=++L;S=!0,P="",x.innerHTML="";try{let re=await Li(x,{setTitle:()=>{}},{embedded:!0});if(ue!==L||o!=="tests"){typeof re=="function"&&re();return}$=typeof re=="function"?re:null,k=!0}catch(re){ue===L&&o==="tests"&&(x.innerHTML=Ac(re))}finally{ue===L&&(S=!1)}},ie=()=>{if(!i)return;let ue=$f(i,o,l,s);if(ue!==z&&(j.innerHTML=ue,z=ue),s&&Mc.has(o)){te();let qe=zs("\u6B64\u5206\u985E\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u670D\u52D9\u7E3D\u89BD\u3001\u524D\u5F8C\u7AEF\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u4E0B\u8F09\uFF1B\u7CFB\u7D71\u6E2C\u8A66\u3001\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528\u3001Model Provider \u8207 OpenAPI \u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002");x.innerHTML!==qe&&(x.innerHTML=qe),P=qe;return}if(o==="tests"){!k&&!S&&U();return}te();let re=yf(o,i,l,d,u,{hosts:f,loading:y,error:b,editingId:p},{info:v,loading:w,error:q},s);re!==P&&(x.innerHTML=re,P=re)},Te=async({quiet:ue=!1}={})=>{if(!d){d=!0,u=null,o==="resources"&&!l&&ie();try{let re=await O.systemUsage();if(a)return;l=re}catch(re){if(a)return;u=re,ue||T(re.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{a||(d=!1,o==="resources"&&ie())}}},B=async({quiet:ue=!1}={})=>{if(!w){w=!0,q=null,o==="data"&&!v&&ie();try{let re=await _o();if(a)return;v=re}catch(re){if(a)return;q=re,ue||T(re.message||"\u7121\u6CD5\u8B80\u53D6 IndexedDB\u3002","danger")}finally{a||(w=!1,o==="data"&&ie())}}},we=async({quiet:ue=!1}={})=>{if(!y){y=!0,b=null,o==="local-model"&&!f&&ie();try{let re=await O.ollamaHosts();if(a)return;f=re}catch(re){if(a)return;b=re,ue||T(re.message||"\u7121\u6CD5\u53D6\u5F97 llama-server \u4E3B\u6A5F\u3002","danger")}finally{a||(y=!1,o==="local-model"&&ie())}}},ce=async()=>{await we({quiet:!0}),await Le({quiet:!0})},Le=async({quiet:ue=!1,status:re=null}={})=>{ue||(E.disabled=!0,he(E,!0,"\u6AA2\u67E5\u4E2D\u2026"));let qe=performance.now(),ye=new Date().toISOString(),_e=qe,Ee=ye;try{let C=re||await O.status();if(_e=performance.now(),Ee=new Date().toISOString(),a)return;let G=!re&&!X?Math.max(0,qe-Y):0;C.page_pipeline=C.pipeline||!i?.page_pipeline?sf(C,{initMs:G,initStartedAt:me,requestStartedAt:ye,requestFinishedAt:Ee,requestMs:_e-qe}):i.page_pipeline,X=!0,i=C,gs(kc,C),ie(),ue||T("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(C){if(a)return;o!=="tests"&&(P="",x.innerHTML=Ac(C)),ue||T(C.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{a||(E.disabled=!1,he(E,!1))}},Oe=async({quiet:ue=!1,status:re=null}={})=>{if(await Le({quiet:ue,status:re}),!s&&(o==="resources"&&await Te({quiet:ue}),o==="local-model"&&await we({quiet:ue}),!ue&&o==="tests")){let qe=x.querySelector("#tests-refresh");qe&&qe.click()}};j.addEventListener("click",ue=>{let re=ue.target.closest("[data-status-tab]");if(!re)return;let qe=re.dataset.statusTab;Lc.some(ye=>ye.id===qe)&&(o=qe,ie(),!s&&(o==="resources"&&!l&&!d&&Te(),o==="data"&&!v&&!w&&B(),o==="local-model"&&we()))}),x.addEventListener("click",ue=>{ue.target.closest("#status-retry")&&Le(),ue.target.closest("#status-resources-retry")&&Te()}),x.addEventListener("click",async ue=>{let re=ue.target.closest("[data-ollama-action]");if(!re)return;let qe=re.dataset.ollamaAction,ye=Number(re.dataset.id||0);if(qe==="refresh-hosts"){await we();return}if(qe==="edit-host"){p=ye,ie(),e.querySelector(".ollama-host-form")?.scrollIntoView({behavior:"smooth",block:"center"});return}if(qe==="cancel-host-edit"){p=null,ie();return}if(qe==="delete-host"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 llama-server \u4E3B\u6A5F #${ye}\uFF1F`))return;try{await O.deleteOllamaHost(ye),Number(p)===ye&&(p=null),T("llama-server \u4E3B\u6A5F\u5DF2\u522A\u9664\u3002","info"),await ce()}catch(_e){T(_e.message||"\u522A\u9664\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(qe==="activate-host"){try{await O.activateOllamaHost(ye),T("\u5DF2\u5207\u63DB\u4F7F\u7528\u7684 llama-server \u4E3B\u6A5F\u3002","ok"),await ce()}catch(_e){T(_e.message||"\u5207\u63DB\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(qe==="deactivate-host"){try{await O.deactivateOllamaHosts(),T("\u5DF2\u505C\u7528\u6307\u5B9A\u7684 llama-server \u4E3B\u6A5F\uFF0C\u5C07\u6CBF\u7528 .env \u8A2D\u5B9A\u3002","info"),await ce()}catch(_e){T(_e.message||"\u505C\u7528\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(qe==="check-capabilities"){he(re,!0,"\u6AA2\u67E5\u4E2D\u2026");try{await O.checkOllamaCapabilities(),T("\u5DF2\u66F4\u65B0\u6240\u6709\u4E3B\u6A5F\u7684\u6A21\u578B\u80FD\u529B\u3002","ok",4e3),await ce()}catch(_e){T(_e.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u80FD\u529B\u3002","danger",7e3)}finally{he(re,!1)}return}if(qe==="select-model"||qe==="clear-model"){let _e=String(re.dataset.model||""),Ee=String(re.dataset.role||"");try{qe==="select-model"?(await O.selectOllamaModel(ye,{model:_e,role:Ee}),T(`\u5DF2\u8A2D\u5B9A ${Ee==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\uFF1A${_e}`,"ok")):(await O.clearOllamaModel(ye,{model:_e,role:Ee}),T(`\u5DF2\u53D6\u6D88 ${Ee==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\u3002`,"info")),await ce()}catch(C){T(C.message||"\u6A21\u578B\u8A2D\u5B9A\u5931\u6557\u3002","danger")}}}),x.addEventListener("submit",async ue=>{let re=ue.target.closest("form[data-ollama-form='host']");if(!re)return;ue.preventDefault();let qe=new FormData(re),ye=Number(qe.get("host_id")||0),_e={name:String(qe.get("name")||"").trim(),url:String(qe.get("url")||"").trim(),port:Number(qe.get("port")||11434)};try{ye?(await O.updateOllamaHost(ye,_e),T("llama-server \u4E3B\u6A5F\u5DF2\u66F4\u65B0\u3002","ok")):(await O.addOllamaHost(_e),T("llama-server \u4E3B\u6A5F\u5DF2\u65B0\u589E\u3002","ok")),p=null,await ce()}catch(Ee){let C=Ee.detail||Ee.payload?.detail,G=C?.errors?.join(" \xB7 ")||C?.message||Ee.message||"\u5132\u5B58\u4E3B\u6A5F\u5931\u6557\u3002";T(G,"danger",8e3)}}),x.addEventListener("toggle",ue=>{let re=ue.target.closest?.(".status-wf-stage[data-status-wf-stage]");if(!re||!x.contains(re))return;let qe=re.dataset.statusWfStage||"";qe&&(re.open?ji.add(qe):ji.delete(qe))},!0),E.addEventListener("click",()=>Oe());let Ne=()=>{n&&(n(),n=null)};H&&H.addEventListener("change",()=>{Ne(),H.checked&&(n=Ct("status",(ue,re)=>{a||Oe({quiet:!0,status:re?.snapshot||null})}),Oe({quiet:!0}),T("\u5DF2\u555F\u7528\u5F8C\u7AEF\u63A8\u9001\u81EA\u52D5\u66F4\u65B0\uFF08\u6BCF 30 \u79D2\uFF09\u3002","info",2200))});let et=ys(kc,120*1e3);return et?(i=et,X=!0,ie(),Le({quiet:!0})):await Le({quiet:!0}),B({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle(Ot),()=>{a=!0,te(),Ne()}}var Ec="home",Ei={home:{page:Pr},rag:{page:li},data:{page:Jr},quality:{page:Mi},performance:{page:Zr},processing:{page:wi},status:{page:Ti},tests:{page:Gn},admin:{page:qr}},Ks=document.getElementById("app-main"),Jn=null,Wn=0;function Oa(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||Ec;return Object.prototype.hasOwnProperty.call(Ei,t)?t:Ec}function kf(){try{let e=new URLSearchParams(window.location.search);if(!(!!e.get("q")?.trim()||!!e.get("share")?.trim())||Oa()==="rag")return;window.history.replaceState(null,"",`${window.location.pathname}${window.location.search}#/rag`)}catch{}}function Sf(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function xf(e){return`<section class="page">
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
  </section>`}async function Ys(){let e=Oa(),t=++Wn;Sf(e);let s=`#/${e}`,a=window.location.hash;if(a!==s&&!a.startsWith(`${s}/`)&&window.history.replaceState(null,"",s),typeof Jn=="function"){try{Jn()}catch{}Jn=null}if(Hs(),!ia()){if(e==="admin"){document.title=Ot,Ks.innerHTML=fn();return}if(e==="tests"){document.title=Ot,Ar(Ks,e);return}if(!oo()){document.title=Ot,lo(Ks);return}if(!xr(e)){document.title=Ot,Ar(Ks,e);return}}document.title=Ot;let n={route:e,navigate(i){Ei[i]&&(window.location.hash=`#/${i}`)},setTitle(){t===Wn&&(document.title=Ot)}};try{let i=Ei[e].page.render(Ks,n);Zi(),window.scrollTo({top:0,behavior:"auto"}),Ks.focus({preventScroll:!0});let o=await i;if(t!==Wn){typeof o=="function"&&o();return}Jn=typeof o=="function"?o:null}catch(i){if(t!==Wn)return;console.error("Failed to render route",e,i),Ks.innerHTML=xf(i);let o=document.getElementById("route-retry");o&&o.addEventListener("click",()=>Ys()),T("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function Af(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable))return;let a=Oa(),n=a==="home"?"home-question":a==="rag"?"rag-question":"";if(!n)return;let i=document.getElementById(n);i&&(e.preventDefault(),i.focus())})}function qf(){let e=document.querySelector('[data-route="processing"]');if(!e)return;let t=e.querySelector(".nav-update-badge");t||(t=document.createElement("span"),t.className="nav-update-badge",t.hidden=!0,e.appendChild(t));let s=0,a=0,n=0,i=0,o=()=>{let d=[];s>0&&d.push(`\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0F\u5224\u6C7A\u6709 ${s} \u9805\u4F86\u6E90\u66F4\u65B0`),a>0&&d.push(`\u5224\u6C7A\u532F\u5165\u5F85\u8655\u7406 ${a} \u500B\u6708`),n>0&&d.push(`Qdrant \u5411\u91CF\u7D22\u5F15\u5F85\u88DC ${n} \u500B\u6708`),i>0&&d.push(`\u6CD5\u898F\uFF0F\u547D\u4EE4\u7D22\u5F15\u5F85\u91CD\u5EFA ${i} \u9805`);let u=s+a+n+i;if(!d.length||u<=0){t.hidden=!0;return}t.textContent=String(u),t.title=d.join("\uFF1B"),t.hidden=!1},l=async(d=null)=>{try{let u=d||await O.updatesStatus();s=Number(u.update_count)||0,u&&Object.prototype.hasOwnProperty.call(u,"import_pending_count")&&(a=Number(u.import_pending_count)||0),u&&Object.prototype.hasOwnProperty.call(u,"index_pending_count")&&(n=Number(u.index_pending_count)||0),u&&Object.prototype.hasOwnProperty.call(u,"legal_index_pending_count")&&(i=Number(u.legal_index_pending_count)||0),o()}catch{t.hidden=!0}};l(),Ct("updates",(d,u)=>l(u?.snapshot||null)),window.addEventListener("judgment:processing-pending",d=>{a=Number(d.detail?.count)||0,d.detail&&Object.prototype.hasOwnProperty.call(d.detail,"index_pending")&&(n=Number(d.detail.index_pending)||0),d.detail&&Object.prototype.hasOwnProperty.call(d.detail,"legal_index_pending")&&(i=Number(d.detail.legal_index_pending)||0),o()}),window.addEventListener("judgment:updates-changed",()=>l())}function Mf(e,t){return!e||!t?!0:!!e.admin!=!!t.admin||!!e.enabled!=!!t.enabled||String(e.expiresAt||"")!==String(t.expiresAt||"")||JSON.stringify(e.features||{})!==JSON.stringify(t.features||{})}async function Nc(){kf();let e=Oa();e==="processing"?O.processing({cached:!0,slim:!0}).catch(()=>null):e==="quality"&&O.quality({cached:!0}).catch(()=>null);let t=ro();t&&io(t);let s=gn();un(),Za(),to(),Af();let a=!1,n=()=>{ia()&&!a&&(qf(),a=!0)};window.addEventListener("hashchange",Ys),window.addEventListener("judgment:auth-changed",async()=>{let o=await gn();sn(o.me),n(),Hs(),Ys()}),window.addEventListener("judgment:demo-denied",async()=>{let o=await gn();sn(o.me),n(),Hs(),Ys()}),t&&(mr({user:t.me}),n(),Hs(),Ys());let i=await s;t?(sn(i.me),n(),Hs(),Mf(t,i)&&Ys()):(mr({user:i.me}),n(),Hs(),Ys()),Va()&&window.setTimeout(()=>{let o=Oa();(o==="rag"||o==="admin")&&(window.location.hash=ia()?"#/tests":"#/home")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Nc):Nc();})();
