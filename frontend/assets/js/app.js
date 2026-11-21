(()=>{var Yl=Object.defineProperty;var ls=(e,t)=>{for(var s in t)Yl(e,s,{get:t[s],enumerable:!0})};var Dn="judgment.api_base",Bn="judgment.admin_token",On="http://127.0.0.1:9200",wt=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function mi(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function cs(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${mi(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function Hn(e){let t=cs(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function zn(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?cs(e.get("api")):null}catch{return null}}function Gn(){try{let e=window.localStorage.getItem(Dn);return e===null?null:cs(e)}catch{return null}}function Un(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return cs(e||"")}function Yt(){let e=zn();if(e!==null)return e;let t=Gn();if(t!==null)return t;let s=Un();return s||(window.location.protocol==="file:"?On:"")}function Xl(){if(zn()!==null)return!0;let e=Gn();return e!==null?!!e:!!Un()}function Ot(){return zn()!==null?"query":Gn()!==null?"storage":Un()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function Da(){return Xl()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!mi(window.location.hostname)}function Qn(e){let t=cs(e);try{t?window.localStorage.setItem(Dn,t):window.localStorage.removeItem(Dn)}catch{}return t}function Ba(){try{return String(window.localStorage.getItem(Bn)||"").trim()}catch{return""}}function gi(e){let t=String(e||"").trim();try{t?window.localStorage.setItem(Bn,t):window.localStorage.removeItem(Bn)}catch{}return t}function Fn(){return Ot()==="query"?"":Ba()}function ys(e=Yt()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function bt(e,t=Yt()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function pi(){return Ot()==="query"?"":Yt()}async function Zl(){let e=Fn(),t={Accept:"application/json"};e&&(t["X-Judgment-Admin-Token"]=e);try{let s=await fetch(bt("/api/auth/sse-ticket"),{method:"POST",headers:t,credentials:"include"});if(!s.ok)return"";let a=await s.json();return String(a.ticket||"")}catch{return""}}function _t(e,t,{onError:s=null,onProgress:a=null}={}){if(document.body.classList.contains("is-demo-visitor"))return()=>{};let n=(Array.isArray(e)?e:[e]).map(v=>String(v||"").trim()).filter(Boolean);if(!n.length||typeof EventSource>"u")return()=>{};let i=null,o=0,l=!1,d=null,p=v=>{let u={};try{u=JSON.parse(v.data||"{}")}catch{u={}}u.initial&&o<=1&&!u.snapshot||t?.(u.topic||n[0],u)},g=v=>{let u={};try{u=JSON.parse(v.data||"{}")}catch{u={}}a?.(u.topic||n[0],u)},$=async()=>{if(l)return;let v=await Zl();if(l)return;let u=new URLSearchParams({topic:n.join(",")});v&&u.set("ticket",v),i=new EventSource(bt(`/api/events/stream?${u.toString()}`),{withCredentials:!0}),i.onopen=()=>{o+=1,d&&(window.clearTimeout(d),d=null)},i.addEventListener("refresh",p),i.addEventListener("progress",g),i.onerror=()=>{s?.(),!(l||!i)&&(i.close(),i=null,!d&&(d=window.setTimeout(()=>{d=null,$()},3e3)))}};return $(),()=>{l=!0,d&&(window.clearTimeout(d),d=null),i&&(i.removeEventListener("refresh",p),i.removeEventListener("progress",g),i.close(),i=null)}}var Pa=new Map,Ia=new Map;function ec({cached:e=!1}={}){let t=e?"/api/quality?cached=1":"/api/quality",s=Ia.get(t);if(s)return s;let a=oe(t,{timeout:18e4,trackClient:!1});Ia.set(t,a);let n=()=>window.setTimeout(()=>{Ia.get(t)===a&&Ia.delete(t)},1500);return a.then(n,n),a}function tc({cached:e=!1,slim:t=!1}={}){let s=new URLSearchParams;e&&s.set("cached","1"),t&&s.set("slim","1");let a=s.toString(),n=`/api/processing${a?`?${a}`:""}`,i=Pa.get(n);if(i)return i;let o=oe(n,{timeout:45e3,trackClient:!1});Pa.set(n,o);let l=()=>window.setTimeout(()=>{Pa.get(n)===o&&Pa.delete(n)},1500);return o.then(l,l),o}function Jn(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function oe(e,t={}){let{base:s,...a}=t,n=s!==void 0?cs(s):Yt(),i=new AbortController,o=t.timeout===void 0?3e4:t.timeout,l=o>0?window.setTimeout(()=>i.abort(),o):null,d=Date.now(),p=performance.now(),g=t.requestId||fi(),$={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":g,"X-Judgment-Client-Started-At":String(d),...Fn()?{"X-Judgment-Admin-Token":Fn()}:{},...t.headers||{}},v;try{v=await fetch(bt(e,n),{...a,headers:$,credentials:"include",signal:i.signal})}catch(M){throw M.name==="AbortError"?new wt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new wt(Jn(n),0,M)}finally{l&&window.clearTimeout(l)}let u=null;if((v.headers.get("content-type")||"").includes("application/json"))try{u=await v.json()}catch{u=null}else try{u=await v.text()}catch{u=null}let y=performance.now(),k=v.headers.get("X-Judgment-Request-Id")||g;if(t.trackClient!==!1&&k){let M=Math.round(performance.now()-p);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{bi({request_id:k,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:M,render_ms:Math.max(0,Math.round(performance.now()-y)),status:v.ok?"success":"failed"})})})}if(!v.ok){v.status===403&&u&&typeof u=="object"&&["demo_closed","demo_hard_disabled"].includes(u.code)&&window.dispatchEvent(new CustomEvent("judgment:demo-denied",{detail:u}));let M=u&&typeof u=="object"?u.detail||u.message:u,S=typeof M=="string"&&M?M:`\u4F3A\u670D\u5668\u56DE\u61C9 ${v.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new wt(S,v.status,M)}return u}function fi(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function bi(e){if(!document.body.classList.contains("is-demo-visitor"))try{fetch(bt("/api/performance/client",Yt()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),credentials:"include",keepalive:!0}).catch(()=>{})}catch{}}async function hi(e){let t=cs(e);if(!Hn(t))throw new wt("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,n=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(bt("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new wt(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof wt?i:i.name==="AbortError"?new wt("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new wt(Jn(t),0,i)}finally{window.clearTimeout(n)}}var U={health(){return oe("/api/health")},authMe(){return oe("/api/auth/me",{base:pi(),trackClient:!1})},authLogout(){return oe("/api/auth/logout",{method:"POST",base:pi(),trackClient:!1})},demoStatus(){return oe("/api/demo/status",{timeout:15e3,trackClient:!1})},adminDemo(){return oe("/api/admin/demo",{timeout:15e3,trackClient:!1})},updateDemo(e){return oe("/api/admin/demo",{method:"PUT",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},closeDemo(){return oe("/api/admin/demo/close",{method:"POST",body:JSON.stringify({}),timeout:3e4,trackClient:!1})},demoAudit(e=20){let t=new URLSearchParams({limit:String(e)});return oe(`/api/admin/demo/audit?${t.toString()}`,{timeout:15e3,trackClient:!1})},status(){return oe("/api/status",{trackClient:!1})},ollamaHosts(){return oe("/api/llama-server/hosts",{timeout:3e4,trackClient:!1})},addOllamaHost(e){return oe("/api/llama-server/hosts",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},updateOllamaHost(e,t){return oe(`/api/llama-server/hosts/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},deleteOllamaHost(e){return oe(`/api/llama-server/hosts/${encodeURIComponent(e)}`,{method:"DELETE",timeout:3e4,trackClient:!1})},activateOllamaHost(e){return oe(`/api/llama-server/hosts/${encodeURIComponent(e)}/activate`,{method:"POST",timeout:3e4,trackClient:!1})},deactivateOllamaHosts(){return oe("/api/llama-server/hosts/deactivate",{method:"POST",timeout:3e4,trackClient:!1})},reorderOllamaHosts(e){return oe("/api/llama-server/hosts/reorder",{method:"POST",body:JSON.stringify({host_ids:e}),timeout:3e4,trackClient:!1})},checkOllamaCapabilities(){return oe("/api/llama-server/hosts/capabilities/test",{method:"POST",timeout:18e4,trackClient:!1})},selectOllamaModel(e,t){return oe(`/api/llama-server/hosts/${encodeURIComponent(e)}/models/select`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},clearOllamaModel(e,t){return oe(`/api/llama-server/hosts/${encodeURIComponent(e)}/models/clear`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},systemUsage(){return oe("/api/system-usage",{trackClient:!1})},indexVersions(){return oe("/api/index-versions",{trackClient:!1})},indexVersion(e){return oe(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return oe(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return oe(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return oe("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){let t=new URLSearchParams({repair:e?"true":"false"});return oe(`/api/index-alias/reconcile?${t.toString()}`,{trackClient:!1})},catalog(){return oe("/api/catalog")},homeSummary(){return oe("/api/home")},judgmentStats(){return oe("/api/judgment-stats")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return oe("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},dataSuggest({kind:e,query:t="",limit:s=12}){let a=new URLSearchParams({kind:e,query:t,limit:String(s)});return oe(`/api/data/suggest?${a.toString()}`,{timeout:45e3,trackClient:!1})},schemaSuggest({database:e,table:t,column:s,query:a,limit:n=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(n)});return oe(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let n=new URLSearchParams({law_key:e});return t&&n.set("source_type",t),s&&n.set("version_id",String(s)),a&&n.set("article_no",String(a)),oe(`/api/law?${n.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),oe(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return oe("/api/test-mode",{trackClient:!1})},llmModels(){return oe("/api/llm/models",{timeout:6e4,trackClient:!1})},testLlmModels(){return oe("/api/llm/models/test",{method:"POST",timeout:12e4,trackClient:!1})},rerankStatus(){return oe("/api/rerank/status",{timeout:6e4,trackClient:!1})},testReranker(){return oe("/api/rerank/test",{method:"POST",timeout:12e4,trackClient:!1})},selectLlmModel(e,t=null){return oe("/api/llm/model",{method:"POST",body:JSON.stringify({model:e,host_id:t}),timeout:3e4,trackClient:!1})},setTestMode(e){return oe("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return oe(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return oe("/api/test-runs/current",{trackClient:!1})},testRun(e){return oe(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return oe("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))i==null||i===""||a.set(n,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),oe(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality({cached:e=!1}={}){return ec({cached:e})},demoQuality(){return oe("/api/demo/quality",{timeout:2e4,trackClient:!1})},processing({cached:e=!1,slim:t=!1}={}){return tc({cached:e,slim:t})},demoProcessing(){return oe("/api/demo/processing",{timeout:2e4,trackClient:!1})},processingActive(){return oe("/api/processing/active",{timeout:3e3,trackClient:!1})},judgmentDownloadStatus(){return oe("/api/judgment-download/status",{timeout:3e4,trackClient:!1})},versioningSummary(){return oe("/api/versioning/summary",{trackClient:!1})},updatesStatus(){return oe("/api/updates/status",{trackClient:!1})},checkCourts(){return oe("/api/courts/check",{timeout:6e4,trackClient:!1})},checkLawVersions(){return oe("/api/law-versions/check",{timeout:6e4,trackClient:!1})},checkUpdates(e=[]){let t=Array.isArray(e)&&e.length?{source_types:e}:{};return oe("/api/updates/check",{method:"POST",body:JSON.stringify(t),timeout:12e4,trackClient:!1})},versioningSnapshots(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.limit&&t.set("limit",String(e.limit)),oe(`/api/versioning/judgments/snapshots?${t.toString()}`,{trackClient:!1})},versioningChanges(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit)),oe(`/api/versioning/judgments/changes?${t.toString()}`,{trackClient:!1})},versioningJudgment(e){return oe(`/api/versioning/judgments/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVersion(e){return oe(`/api/versioning/judgments/versions/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVector(e,t){return oe(`/api/versioning/judgments/${encodeURIComponent(e)}/vectors/${encodeURIComponent(t)}`,{trackClient:!1})},versioningAudit(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit||500)),oe(`/api/versioning/audit?${t.toString()}`,{trackClient:!1})},questionBankStats(){return oe("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))if(!(i==null||i==="")){if(Array.isArray(i)){for(let o of i)o==null||o===""||a.append(n,String(o));continue}a.set(n,String(i))}return a.set("limit",String(t)),a.set("offset",String(s)),oe(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankTags(e="",t=12){let s=new URLSearchParams({query:e,limit:String(t)});return oe(`/api/question-bank/tags?${s.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return oe(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return oe("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},createQuestionBankItemWithAI(e){return oe("/api/question-bank/ai-items",{method:"POST",body:JSON.stringify(e),timeout:42e4,trackClient:!1})},updateQuestionBankItem(e,t){return oe(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return oe(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},restoreQuestionBankItem(e){return oe(`/api/question-bank/items/${encodeURIComponent(e)}/restore`,{method:"POST",timeout:45e3,trackClient:!1})},submitQuestionBankItemForReview(e){return oe(`/api/question-bank/items/${encodeURIComponent(e)}/submit`,{method:"POST",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return oe(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return oe("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return oe(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return oe("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return oe(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return oe("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},benchmarkSuiteLatestAnswers(e){return oe(`/api/benchmark/suites/${encodeURIComponent(e)}/latest-answers`,{timeout:45e3,trackClient:!1})},removeBenchmarkSuiteItem(e,t){return oe(`/api/benchmark/suites/${encodeURIComponent(e)}/items/${encodeURIComponent(t)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return oe("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return oe(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return oe(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return oe(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return oe("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return oe(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return oe(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return oe(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return oe("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return oe(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return oe("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return oe(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return oe("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return oe("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return oe("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onQueued:n=null,onToken:i=null,onTokenReset:o=null}={}){let l=Yt(),d=new AbortController,p=t?0:3e5,g=p>0?window.setTimeout(()=>d.abort(),p):null,$=Date.now(),v=performance.now(),u=fi(),b={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":u,"X-Judgment-Client-Started-At":String($)},y;try{y=await fetch(bt("/api/rag/query/stream",l),{method:"POST",headers:b,body:JSON.stringify({question:e}),credentials:"include",signal:d.signal})}catch(J){throw J.name==="AbortError"?new wt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new wt(Jn(l),0,J)}finally{g&&window.clearTimeout(g)}if(!y.ok){let J=null;try{J=await y.json()}catch{J=null}let ve=J&&typeof J=="object"&&J.detail?String(J.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${y.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new wt(ve,y.status,J)}if(!y.body)throw new wt("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let k=y.body.getReader(),M=new TextDecoder,S="",h=null,L=null;try{for(;;){let{value:J,done:ve}=await k.read();if(ve)break;S+=M.decode(J,{stream:!0});let fe=S.indexOf(`

`);for(;fe>=0;){let se=S.slice(0,fe).replace(/\r/g,"");S=S.slice(fe+2);let q="message",A=[];for(let T of se.split(`
`))T.startsWith("event:")?q=T.slice(6).trim():T.startsWith("data:")&&A.push(T.slice(5).trimStart());if(A.length){let T=null;try{T=JSON.parse(A.join(`
`))}catch{T=null}if(T)if(q==="step"&&typeof s=="function")try{s(T)}catch{}else if(q==="partial"){if(typeof a=="function")try{a(T)}catch{}}else if(q==="queued"){if(typeof n=="function")try{n(T)}catch{}}else if(q==="token"){if(typeof i=="function")try{i(String(T.text||""))}catch{}}else if(q==="token_reset"){if(typeof o=="function")try{o()}catch{}}else q==="result"?h=T:q==="error"&&(L=new wt(T.message||T.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,T))}fe=S.indexOf(`

`)}}}finally{try{await k.cancel()}catch{}g&&window.clearTimeout(g)}if(L)throw L;if(!h)throw new wt("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let X=Math.round(performance.now()-v);return bi({request_id:u,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:X,render_ms:0,status:"success"}),h&&typeof h=="object"&&(h._client_request_id=u),h}};var sc={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},ac={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},nc={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},rc={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},vi={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',palette:'<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10h-4Z"/><circle cx="7.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/><circle cx="10" cy="6.8" r=".8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="6.8" r=".8" fill="currentColor" stroke="none"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',more:'<circle cx="4.2" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="19.8" cy="12" r="2.6" fill="currentColor" stroke="none"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function r(e){return String(e??"").replace(/[&<>"']/g,t=>sc[t])}function m(e,t=16,s=""){let a=vi[e]||vi.info;return`<svg${s?` class="${r(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function c(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function Ee(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function Vn(e){if(e instanceof Date)return e;if(typeof e=="number"){let n=new Date(e);return Number.isNaN(n.getTime())?null:n}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function Ht(e){let t=Vn(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?r(e):"\u2014"}function _e(e){let t=Vn(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?r(e):"\u2014"}function ua(e){let t=Vn(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:Ht(t)}function ge(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function zt(e){return ac[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Ke(e,t){let s=zt(e);return`<span class="badge ${nc[s.tone]}"><span class="status-dot ${rc[s.tone]}"></span>${r(t||s.label)}</span>`}function ic(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${r(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function Fa(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function Oa(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return Ke(String(e));case"source":return ic(String(e));case"number":return`<span class="mono">${c(e)}</span>`;case"duration":return`<span class="mono">${ge(e)}</span>`;case"datetime":return`<span class="mono">${_e(e)}</span>`;case"date":return`<span class="mono">${Ht(e)}</span>`;case"url":{let s=String(e),a=Fa(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${r(s)}" target="_blank" rel="noopener noreferrer" title="${r(s)}">${m("external",10)}${r(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${r(s)}">${r(Fa(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(Fa(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(Fa(s,90))}</span>`}}}function Fe({tone:e="info",title:t,text:s,iconName:a="info"}){let n=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${n==="i"?"i":m(n,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${r(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function ht({iconName:e="search",title:t,text:s="",actions:a="",className:n=""}){return`<div class="empty-state ${n}">
    <span class="empty-icon">${m(e,24)}</span>
    <h3 class="empty-title">${r(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function Ne(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${r(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function P(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let n={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${n[t]||"i"}</span>
    <div class="toast-body">${r(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function Gs(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function Gt(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),n=URL.createObjectURL(a),i=document.createElement("a");i.href=n,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(n),1e3)}function ds(e,t){try{let s=JSON.parse(window.localStorage.getItem(e)||"null");return!s||!Object.prototype.hasOwnProperty.call(s,"value")||Date.now()-Number(s.saved_at||0)>t?null:s.value}catch{return null}}function ns(e,t){try{window.localStorage.setItem(e,JSON.stringify({value:t,saved_at:Date.now()}))}catch{}}var oc=`
  <svg class="auth-google-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z"/>
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.58A10 10 0 0 0 12 22Z"/>
    <path fill="#FBBC05" d="M6.41 13.92A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.92V7.5H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.5l3.35-2.58Z"/>
    <path fill="#EA4335" d="M12 6.04c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.5l3.35 2.58C7.2 7.8 9.4 6.04 12 6.04Z"/>
  </svg>`,lc={google_not_configured:"Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A GOOGLE_CLIENT_ID \u8207 GOOGLE_CLIENT_SECRET\u3002",state_mismatch:"\u767B\u5165\u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u767B\u5165\u3002",access_denied:"\u4F60\u53D6\u6D88\u4E86 Google \u767B\u5165\u3002",email_unverified:"\u9019\u500B Google \u5E33\u865F\u7684\u96FB\u5B50\u90F5\u4EF6\u5C1A\u672A\u9A57\u8B49\u3002",not_allowed:"\u9019\u500B Google \u5E33\u865F\u6C92\u6709\u7BA1\u7406\u54E1\u6B0A\u9650\u3002",oauth_failed:"Google \u767B\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"},Pt=null;function cc(){return Ot()==="query"?"":Yt()}function dc(){let e=cc(),t=`${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;return bt(`/api/auth/google/start?next=${encodeURIComponent(t)}`,e)}function $i(e){let t=String(e?.name||"").trim();if(t)return t;let s=String(e?.email||"").trim();return s?s.split("@")[0]:"\u5DF2\u767B\u5165"}function uc(e){return $i(e).slice(0,1).toUpperCase()||"A"}function Wn(){let e=Pt?.querySelector("#auth-menu"),t=Pt?.querySelector("#auth-user-trigger");e&&(e.hidden=!0),t&&t.setAttribute("aria-expanded","false")}function yi(e={}){let t=!!e.google_enabled;Pt.innerHTML=`
    <a class="auth-login${t?"":" is-disabled"}"
       id="auth-login"
       href="${r(dc())}"
       aria-label="\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165"
       title="${t?"\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165":"Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A"}"
       ${t?"":'aria-disabled="true"'}>
      ${oc}
      <span>\u767B\u5165</span>
    </a>`,t||Pt.querySelector("#auth-login")?.addEventListener("click",a=>{a.preventDefault(),P("Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A GOOGLE_CLIENT_ID \u8207 GOOGLE_CLIENT_SECRET\u3002","warn",5200)})}function pc(e){let t=$i(e),s=String(e?.email||""),a=e?.admin?"\u7BA1\u7406\u54E1":"\u4F7F\u7528\u8005";Pt.innerHTML=`
    <div class="auth-user">
      <button type="button"
              class="auth-user-trigger"
              id="auth-user-trigger"
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="\u5DF2\u767B\u5165\uFF1A${r(s||t)}\uFF0C\u958B\u555F\u5E33\u865F\u9078\u55AE"
              title="${r(s||t)}">
        <span class="auth-avatar" aria-hidden="true">${r(uc(e))}</span>
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
    </div>`;let n=Pt.querySelector("#auth-user-trigger"),i=Pt.querySelector("#auth-menu");n?.addEventListener("click",o=>{o.stopPropagation();let l=!!i?.hidden;i&&(i.hidden=!l),n.setAttribute("aria-expanded",l?"true":"false")}),Pt.querySelector("#auth-admin-settings")?.addEventListener("click",()=>{Wn()}),Pt.querySelector("#auth-logout")?.addEventListener("click",async o=>{let l=o.currentTarget;l.disabled=!0,l.textContent="\u767B\u51FA\u4E2D\u2026";try{await U.authLogout(),P("\u5DF2\u767B\u51FA\u3002","ok",2400),await wi(),window.dispatchEvent(new CustomEvent("judgment:auth-changed"))}catch(d){l.disabled=!1,l.textContent="\u767B\u51FA",P(d.message||"\u767B\u51FA\u5931\u6557\u3002","danger",5200)}})}function Kn(e){e?.authenticated?pc(e):yi(e||{google_enabled:!1})}async function wi(){if(Pt)try{Kn(await U.authMe())}catch{yi({google_enabled:!1})}}function mc(){let e;try{e=new URL(window.location.href)}catch{return}let t=e.searchParams.get("auth"),s=e.searchParams.get("auth_error");!t&&!s||(e.searchParams.delete("auth"),e.searchParams.delete("auth_error"),window.history.replaceState(null,"",`${e.pathname}${e.search}${e.hash}`),t==="ok"?P("\u5DF2\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165\u3002","ok",3600):s&&P(lc[s]||"Google \u767B\u5165\u5931\u6557\u3002","danger",6e3))}function Ha(e){Pt&&Kn(e)}function Yn({user:e=null}={}){Pt=document.getElementById("auth-slot"),Pt&&(mc(),document.addEventListener("click",t=>{t.target.closest(".auth-user")||Wn()}),document.addEventListener("keydown",t=>{t.key==="Escape"&&Wn()}),e?Kn(e):wi())}var _i="judgment.theme",Xn="nvidia",za=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#0070f3","#171717","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#0066cc","#1d1d1f","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#17171d","#5e6ad2","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#0d99ff","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#0075de","#191918","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],Zn=new Map(za.map(e=>[e.id,e]));function gc(e){return Zn.has(e)}function fc(e){return Zn.get(e)||Zn.get(Xn)}function er(){try{let e=window.localStorage.getItem(_i);return gc(e)?e:Xn}catch{return Xn}}function tr(e,{persist:t=!0}={}){let s=fc(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");if(a&&a.setAttribute("content",s.metaColor),document.querySelectorAll(".theme-option").forEach(n=>{let i=n.dataset.themeId===s.id;n.classList.toggle("is-active",i),n.setAttribute("aria-checked",i?"true":"false")}),t)try{window.localStorage.setItem(_i,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}var Ga="judgment.fontSizes.v1",ir="judgment.appearance",qi=new Set(["light","dark","system"]),ki="light",pa=window.matchMedia("(prefers-color-scheme: dark)"),bc="font-size",ga=[{id:"page-title",label:"\u9801\u9762\u6A19\u984C",hint:"\u5404\u9801\u6700\u4E0A\u65B9\u7684 h1 \u6A19\u984C",selectors:[".page-title"],defaultPx:40,min:20,max:72},{id:"home-title",label:"\u9996\u9801\u4E3B\u8996\u89BA\u6A19\u984C",hint:"\u9996\u9801\u6700\u5927\u7684\u4E3B\u6A19\u984C",selectors:[".home-title"],defaultPx:88,min:40,max:140},{id:"section-title",label:"\u5340\u584A\u6A19\u984C",hint:"\u5831\u8868\u3001\u5361\u7247\u8207\u5340\u584A\u6A19\u984C",selectors:[".section-title",".report-title",".side-card-title",".filter-title",".tests-card-title",".status-sidebar-title",".judgment-dialog-head h2"],defaultPx:16,min:10,max:36},{id:"body",label:"\u5167\u6587\u8207\u8AAA\u660E",hint:"\u6BB5\u843D\u3001\u56DE\u7B54\u3001\u8AAA\u660E\u8207\u6458\u8981\u6587\u5B57",selectors:[".answer-text",".page-subtitle",".report-sub",".home-lead",".empty-text",".notice-body p",".citation-snippet",".side-card-body",".detail-list",".field-help",".report-empty-inline",".processing-section-sub",".summary-value-text",".status-summary",".warnings",".law-dialog-warning"],defaultPx:14,min:8,max:28},{id:"table",label:"\u8868\u683C\u5167\u5BB9",hint:"\u8CC7\u6599\u8868\u683C\u7684\u8868\u982D\u8207\u5132\u5B58\u683C",selectors:[".data-table th",".data-table td"],defaultPx:12,min:8,max:24},{id:"meta",label:"\u6A19\u7C64\u8207\u8F14\u52A9\u6587\u5B57",hint:"badge\u3001chip\u3001\u6B04\u4F4D\u6A19\u7C64\u8207 metadata",selectors:[".badge",".chip",".citation-meta",".citation-index",".answer-section-label",".report-kicker",".report-section-title",".eyebrow",".field-label",".summary-label",".metric-label",".footer-bottom",".nav-update-badge"],defaultPx:10,min:7,max:20},{id:"button",label:"\u6309\u9215\u8207\u5C0E\u89BD",hint:"\u64CD\u4F5C\u6309\u9215\u3001\u9801\u9996\u5C0E\u89BD\u8207\u9023\u7D50",selectors:[".btn",".nav-link",".page-btn",".law-link",".judgment-link",".theme-option-name",".theme-option-desc"],defaultPx:13,min:9,max:24},{id:"form",label:"\u8868\u55AE\u8207\u8F38\u5165",hint:"\u8F38\u5165\u6846\u3001\u4E0B\u62C9\u9078\u55AE\u8207 textarea",selectors:["input","textarea","select",".input",".field-input"],defaultPx:14,min:9,max:28},{id:"mono",label:"\u7A0B\u5F0F\u78BC\u8207\u6578\u503C",hint:"\u7B49\u5BEC\u6587\u5B57\u3001\u67E5\u8A62\u8A9E\u53E5\u8207\u7D71\u8A08\u6578\u503C",selectors:[".mono",".cell-mono",".cell-number",".query-code","code",".metric-value",".summary-value",".perf-stat-value",".mini-stat-value"],defaultPx:13,min:8,max:30},{id:"law-page",label:"\u6CD5\u898F\u689D\u6587\uFF08\u9801\u9762\uFF09",hint:"\u6CD5\u898F\u6AA2\u7D22\u7D50\u679C\u8207\u6CD5\u898F\u4F86\u6E90\u5361\u689D\u6587",selectors:[".law-answer-article-text",".law-answer-article-no",".law-source-article-text",".law-source-article-no",".law-article-text",".law-article-no"],excludeAncestors:[".law-dialog"],defaultPx:12,min:9,max:28},{id:"law-dialog",label:"\u6CD5\u898F\u689D\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u6309\u4E0B\u689D\u6587\u5F8C\u958B\u555F\u7684\u6CD5\u898F dialog",selectors:[".law-dialog .law-article-text",".law-dialog .law-article-no",".law-dialog .law-chapter"],defaultPx:16,min:10,max:32},{id:"judgment-dialog",label:"\u5224\u6C7A\u5168\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u5224\u6C7A\u539F\u6587 dialog \u7684\u5168\u6587\u5340\u584A",selectors:[".judgment-dialog-text"],defaultPx:23,min:12,max:48}],Js=new Map(ga.map(e=>[e.id,e])),ma=new WeakMap,us=Ei(),jt={...us},ps=ji(),sr=new Set,Qs=null,Us=null,kt=null,qs=null,Si=null,ws=bc,_s=!1,ar=null,nr=!1,Ua="";function Li(e,t,s){return Math.min(s,Math.max(t,e))}function or(e){return Math.round(e*10)/10}function Ja(e){return Number.isInteger(e)?String(e):e.toFixed(1)}function ji(){try{let e=window.localStorage.getItem(ir);return qi.has(e)?e:ki}catch{return ki}}function hc(){return ps==="system"?pa.matches?"dark":"light":ps}function Ti(){document.querySelectorAll("[data-appearance-option]").forEach(e=>{let t=e.dataset.appearanceOption===ps;e.classList.toggle("is-active",t),e.setAttribute("aria-pressed",t?"true":"false")})}function Qa({persist:e=!1}={}){if(document.documentElement.dataset.appearance=hc(),document.documentElement.dataset.appearanceMode=ps,Ti(),e)try{window.localStorage.setItem(ir,ps)}catch{}}function vc(e){qi.has(e)&&(ps=e,Qa({persist:!0}))}function xi(){ps==="system"&&Qa()}typeof pa.addEventListener=="function"?pa.addEventListener("change",xi):typeof pa.addListener=="function"&&pa.addListener(xi);function Ei(){let e=null;try{e=JSON.parse(window.localStorage.getItem(Ga)||"null")}catch{e=null}if(!e||typeof e!="object"||Array.isArray(e))return{};let t={};for(let s of ga){let a=Number(e[s.id]);Number.isFinite(a)&&(t[s.id]=or(Li(a,s.min,s.max)))}return t}function $c(){try{return Object.keys(us).length?window.localStorage.setItem(Ga,JSON.stringify(us)):window.localStorage.removeItem(Ga),!0}catch{return!1}}function ba(e){let t=new Set;for(let s of e.selectors)document.querySelectorAll(s).forEach(a=>{a.closest(".settings-sidebar")||Array.isArray(e.excludeAncestors)&&e.excludeAncestors.some(n=>a.closest(n))||t.add(a)});return Array.from(t)}function Ni(){if(!Ua)return;let e=Js.get(Ua);if(e)for(let t of ba(e))t.classList.add("font-size-highlight")}function Ri(e){if(Vs(),!Js.get(e))return;Ua=e;let s=kt.querySelector(`.font-size-row[data-font-group="${e}"]`);s&&s.classList.add("is-previewing"),Ni()}function Vs(){Ua="",kt.querySelectorAll(".font-size-row.is-previewing").forEach(e=>e.classList.remove("is-previewing")),document.querySelectorAll(".font-size-highlight").forEach(e=>e.classList.remove("font-size-highlight"))}function yc(e){if(ma.has(e))return ma.get(e);let t={inline:e.style.fontSize||"",computed:parseFloat(window.getComputedStyle(e).fontSize)||0};return ma.set(e,t),t}function wc(e){let t=ma.get(e);t&&(t.inline?e.style.fontSize=t.inline:e.style.removeProperty("font-size"))}function _c(e){let t=jt[e.id];if(Number.isFinite(t))for(let s of ba(e))yc(s),s.style.fontSize=`${t}px`}function kc(e){for(let t of ba(e))wc(t)}function ks(){for(let e of sr){let t=Js.get(e);t&&kc(t)}sr=new Set;for(let e of ga)Number.isFinite(jt[e.id])&&(_c(e),sr.add(e.id));Ni()}function Ci(){ks(),_s&&ws==="font-size"&&fa()}function Pi(){nr||(nr=!0,window.requestAnimationFrame(()=>{nr=!1,ks()}))}function Sc(){ar||!document.body||(ar=new MutationObserver(e=>{if(Object.keys(jt).length){for(let t of e)if(t.type==="childList"&&(t.addedNodes.length||t.removedNodes.length)){Pi();return}}}),ar.observe(document.body,{childList:!0,subtree:!0}))}function xc(e){let t=e.filter(s=>typeof s.getClientRects=="function"&&s.getClientRects().length);return t.length?t:e}function Ac(){let e=ga.filter(t=>ba(t).length>0||Number.isFinite(jt[t.id]));return e.length?e:ga}function Va(e){let t=jt[e.id];if(Number.isFinite(t))return t;let a=xc(ba(e)).map(o=>{let l=ma.get(o);return l&&l.computed?l.computed:parseFloat(window.getComputedStyle(o).fontSize)||0}).filter(o=>o>0).sort((o,l)=>o-l);if(!a.length)return e.defaultPx;let n=Math.floor(a.length/2),i=a.length%2?a[n]:(a[n-1]+a[n])/2;return or(i)}function Mc(){let e=[{id:"font-size",label:"\u5B57\u578B\u5927\u5C0F",hint:"\u8ABF\u6574\u5404\u6587\u5B57\u5340\u584A",glyph:'<span class="settings-option-aa" aria-hidden="true">Aa</span>'},{id:"theme",label:"\u4ECB\u9762\u98A8\u683C",hint:"\u5207\u63DB\u54C1\u724C\u8996\u89BA\u8A9E\u8A00",glyph:m("palette",15)}];qs.innerHTML=e.map(t=>`<button class="settings-option${ws===t.id?" is-active":""}" type="button" role="tab"
        data-settings-panel="${t.id}"
        aria-selected="${ws===t.id?"true":"false"}">
        <span class="settings-option-icon">${t.glyph}</span>
        <span class="settings-option-copy">
          <strong>${r(t.label)}</strong>
          <small>${r(t.hint)}</small>
        </span>
        ${m("chevronRight",12,"settings-option-chevron")}
      </button>`).join("")}function fa(){Vs();let e=Ac(),t=e.map(s=>{let a=Ja(Va(s));return`<section class="font-size-row" data-font-group="${s.id}">
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
    </section>`}).join("");kt.innerHTML=`<div class="settings-panel-head">
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
    </div>`}function qc(){Vs();let e=er(),t=za.map((n,i)=>{let o=n.swatches.map(l=>`<i style="--swatch:${r(l)}"></i>`).join("");return`<button class="theme-option${n.id===e?" is-active":""}" type="button" role="menuitemradio"
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
          aria-pressed="${ps===n.id?"true":"false"}"
          title="${n.id==="system"?"\u8DDF\u96A8\u7CFB\u7D71\u660E\u6697":`${n.label}\u8272\u6A21\u5F0F`}">${n.label}</button>`).join("")}
  </div>`;kt.innerHTML=`<div class="settings-panel-head">
      <div>
        <h3>\u4ECB\u9762\u98A8\u683C</h3>
        <p>\u9078\u64C7\u4E3B\u63A7\u53F0\u7684\u54C1\u724C\u8996\u89BA\u8A9E\u8A00\uFF1B\u4E3B\u984C\u6703\u7ACB\u5373\u5957\u7528\u4E26\u4FDD\u7559\u3002</p>
      </div>
      <div class="settings-panel-head-actions">
        <span class="badge badge-info">${za.length} \u7A2E</span>
        ${a}
      </div>
    </div>
    <div class="settings-theme-list" role="menu" aria-label="\u4ECB\u9762\u98A8\u683C">${t}</div>`,Ti()}function Lc(){qs.querySelectorAll("[data-settings-panel]").forEach(e=>{let t=e.dataset.settingsPanel===ws;e.classList.toggle("is-active",t),e.setAttribute("aria-selected",t?"true":"false")})}function lr(e=ws){ws=e==="theme"?"theme":"font-size",Lc(),ws==="theme"?qc():fa()}function Ai(e,t,s){let a=Number(t);if(!Number.isFinite(a))return;let n=or(Li(a,e.min,e.max));jt[e.id]=n;let i=s?.querySelector(".font-size-slider");i&&(i.value=String(n));let o=s?.querySelector(".font-size-preview");o&&(o.style.fontSize=`${n}px`),Pi()}function jc(){kt.querySelectorAll(".font-size-row").forEach(e=>{let t=Js.get(e.dataset.fontGroup);if(!t)return;let s=jt[t.id]??Va(t),a=e.querySelector(".font-size-number-input");a&&(a.value=Ja(s));let n=e.querySelector(".font-size-slider");n&&(n.value=String(s));let i=e.querySelector(".font-size-preview");i&&(i.style.fontSize=`${s}px`)})}function Mi(e){let t=e.target.closest(".font-size-row");if(!t)return;let s=Js.get(t.dataset.fontGroup);if(!s)return;let a=e.target.classList.contains("font-size-number-input");if(!(a&&e.target.value==="")){if(e.type==="input"&&a){let n=Number(e.target.value);if(!Number.isFinite(n))return;Ai(s,n,t);return}if(Ai(s,e.target.value,t),e.type==="input"){let n=t.querySelector(".font-size-number-input");n&&document.activeElement!==n&&(n.value=Ja(jt[s.id]??Va(s)))}}}function Tc(e){if(!e.target.classList.contains("font-size-number-input"))return;let t=e.target.closest(".font-size-row"),s=t?Js.get(t.dataset.fontGroup):null;if(!s)return;let a=jt[s.id]??Va(s);e.target.value=Ja(a)}function Ec(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Ri(t.dataset.fontGroup)}function Nc(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Vs()}function Rc(e){let t=e.target.closest(".font-size-row");t&&Ri(t.dataset.fontGroup)}function Cc(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Vs()}function Pc(e){let t=e.target.closest("[data-settings-panel]");if(t){lr(t.dataset.settingsPanel);return}let s=e.target.closest("[data-settings-action]");if(s){let i=s.dataset.settingsAction;if(i==="save"){us={...jt};let o=$c();jc(),P(o?"\u5B57\u578B\u5927\u5C0F\u5DF2\u5132\u5B58\u3002":"\u5B57\u578B\u5927\u5C0F\u5DF2\u5957\u7528\uFF0C\u4F46\u700F\u89BD\u5668\u7121\u6CD5\u5132\u5B58\u8A2D\u5B9A\u3002",o?"ok":"warn");return}if(i==="cancel"){jt={...us},ks(),fa(),P("\u5DF2\u53D6\u6D88\u672A\u5132\u5B58\u7684\u5B57\u578B\u8B8A\u66F4\u3002","info");return}i==="reset"&&(jt={},ks(),fa(),P("\u5DF2\u56DE\u5FA9\u9810\u8A2D\u5B57\u578B\uFF1B\u6309\u300C\u5132\u5B58\u300D\u4FDD\u7559\u8B8A\u66F4\u3002","info"));return}let a=e.target.closest("[data-appearance-option]");if(a){vc(a.dataset.appearanceOption);return}let n=e.target.closest(".theme-option");n&&tr(n.dataset.themeId)}function Ic(){_s||(_s=!0,jt={...us},document.body.classList.add("settings-open"),Qs.removeAttribute("inert"),Qs.setAttribute("aria-hidden","false"),Us.setAttribute("aria-expanded","true"),lr(ws),ks(),window.requestAnimationFrame(()=>{let e=qs.querySelector(".settings-option.is-active")||qs.querySelector(".settings-option");e&&e.focus({preventScroll:!0})}))}function rr({restoreFocus:e=!0}={}){_s&&(_s=!1,Vs(),jt={...us},ks(),document.body.classList.remove("settings-open"),e&&Us.focus({preventScroll:!0}),Qs.setAttribute("aria-hidden","true"),Qs.setAttribute("inert",""),Us.setAttribute("aria-expanded","false"))}function Ii(){Qs=document.getElementById("settings-sidebar"),Us=document.getElementById("settings-trigger"),kt=document.getElementById("settings-panel"),qs=document.getElementById("settings-options"),Si=document.getElementById("settings-close"),!(!Qs||!Us||!kt||!qs)&&(Qa(),tr(er(),{persist:!1}),Mc(),fa(),Sc(),ks(),Us.addEventListener("click",()=>{_s?rr():Ic()}),Si?.addEventListener("click",()=>rr()),qs.addEventListener("click",e=>{let t=e.target.closest("[data-settings-panel]");t&&lr(t.dataset.settingsPanel)}),kt.addEventListener("click",Pc),kt.addEventListener("input",Mi),kt.addEventListener("change",Mi),kt.addEventListener("blur",Tc,!0),kt.addEventListener("pointerover",Ec),kt.addEventListener("pointerout",Nc),kt.addEventListener("focusin",Rc),kt.addEventListener("focusout",Cc),kt.addEventListener("keydown",e=>{e.key==="Enter"&&e.target.classList.contains("font-size-number-input")&&(e.preventDefault(),e.target.blur())}),document.addEventListener("keydown",e=>{e.key==="Escape"&&_s&&rr()}),window.addEventListener("storage",e=>{if(e.key===ir){ps=ji(),Qa();return}e.key===Ga&&(us=Ei(),_s||(jt={...us},ks()))}))}var Bi=["rag","data","quality","performance","processing","status"],Ya={rag:"RAG \u63D0\u554F",data:"\u8CC7\u6599\u5EAB",quality:"\u8CC7\u6599\u54C1\u8CEA",performance:"\u6548\u80FD\u5831\u8868",processing:"\u8CC7\u6599\u8655\u7406",status:"\u7CFB\u7D71\u72C0\u614B"},Je={loaded:!1,admin:!1,enabled:!1,features:{},expiresAt:null,reason:"",me:null},Fi="judgment.demo_context.v1",Dc=300*1e3;function Oi(){try{let e=JSON.parse(window.localStorage.getItem(Fi)||"null");return!e||typeof e!="object"||Date.now()-Number(e.saved_at||0)>Dc||typeof e.admin!="boolean"?null:e}catch{return null}}function Hi(e){return e&&(Je.admin=!!e.admin,Je.enabled=!!e.enabled,Je.features=e.features||{},Je.expiresAt=e.expiresAt||null,Je.reason=e.reason||"",Je.me=e.me||null,Je.loaded=!0),Je}function Bc(){try{window.localStorage.setItem(Fi,JSON.stringify({admin:Je.admin,enabled:Je.enabled,features:Je.features,expiresAt:Je.expiresAt,reason:Je.reason,me:Je.me,saved_at:Date.now()}))}catch{}}function Ks(){return!!Je.admin}function Ut(){return!Je.admin}function zi(){return!!Je.enabled}function cr(e){return Je.admin?!0:e==="home"?Je.enabled:!!(Je.enabled&&Je.features?.[e])}function Fc(e){return Ya[e]||e}function Xa(e){if(!e)return"\u2014";let t=Date.parse(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.round((t-Date.now())/1e3));if(s<=0)return"\u5DF2\u5230\u671F";let a=Math.floor(s/3600),n=Math.floor(s%3600/60);return a>0?`${a} \u5C0F\u6642 ${n} \u5206`:`${Math.max(1,n)} \u5206`}async function Za(){let e=await Promise.allSettled([U.authMe()]),t=e[0].status==="fulfilled"?e[0].value:null,s=t?.demo||await U.demoStatus().catch(()=>null);return Je.admin=!!t?.admin,Je.enabled=!!s?.enabled,Je.features=s?.features||{},Je.expiresAt=s?.expires_at||null,Je.reason=s?.reason||"",Je.me=t,Je.loaded=!0,Bc(),Je.admin&&(Je.enabled=!1),Je}function js(){let e=!Je.admin,t=!!Je.enabled;document.body.classList.toggle("is-demo-visitor",e&&t),document.body.classList.toggle("is-demo-closed",e&&!t),document.body.classList.toggle("is-admin",Je.admin),document.querySelectorAll("[data-route]").forEach(a=>{let n=a.dataset.route||"";if(!e){a.hidden=!1;return}if(n==="tests"){a.hidden=!0;return}a.hidden=!Je.enabled||!cr(n)});let s=document.getElementById("demo-banner");s&&(e&&t?(s.hidden=!1,s.innerHTML=`<span class="demo-banner-dot" aria-hidden="true"></span>
      <strong>\u5C55\u793A\u6A21\u5F0F</strong>
      <span>\u5269\u9918 ${r(Xa(Je.expiresAt))}</span>
      <span class="demo-banner-note">\u53EF\u700F\u89BD\u5B8C\u6574\u8CC7\u6599\u9801\uFF1B\u7BA1\u7406\u64CD\u4F5C\u5DF2\u9396\u5B9A</span>`):(s.hidden=!0,s.innerHTML=""))}function Gi(e){e.innerHTML=`<section class="page demo-closed-page">
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
  </section>`}function dr(e,t){e.innerHTML=`<section class="page demo-closed-page">
    <div class="demo-state-card">
      <div class="demo-state-mark">${m("shield",22)}</div>
      <div class="eyebrow">DEMO MODE</div>
      <h1 class="page-title">\u6B64\u529F\u80FD\u76EE\u524D\u672A\u958B\u653E\u5C55\u793A</h1>
      <p class="page-subtitle">
        ${r(t==="tests"?"\u7CFB\u7D71\u6E2C\u8A66":Fc(t))}\u76EE\u524D\u7531\u7BA1\u7406\u8005\u95DC\u9589\uFF1B\u5C55\u793A\u671F\u9593\u4ECD\u53EF\u5207\u63DB\u5176\u4ED6\u5DF2\u958B\u653E\u529F\u80FD\u3002
      </p>
      <div class="demo-state-actions">
        <a class="btn btn-primary" href="#/home">\u56DE\u5230\u9996\u9801</a>
      </div>
    </div>
  </section>`}function en(){return`<section class="page demo-closed-page">
    <div class="demo-state-card">
      <div class="demo-state-mark">${m("shield",22)}</div>
      <div class="eyebrow">ADMIN ONLY</div>
      <h1 class="page-title">\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650</h1>
      <p class="page-subtitle">\u8ACB\u7531\u53F3\u4E0A\u89D2\u4EE5\u7BA1\u7406\u8005 Google \u5E33\u865F\u767B\u5165\u3002</p>
    </div>
  </section>`}function Ts(e,t){return`<div class="demo-lock-card">
    <span class="demo-lock-icon">${m("shield",18)}</span>
    <div class="demo-lock-copy">
      <strong>${r(e||"\u6B64\u529F\u80FD\u7531\u7BA1\u7406\u8005\u64CD\u4F5C")}</strong>
      <p>${r(t||"\u5C55\u793A\u6A21\u5F0F\u50C5\u63D0\u4F9B\u6AA2\u8996\uFF0C\u57F7\u884C\u3001\u8A2D\u5B9A\u8207\u7BA1\u7406\u6309\u9215\u5DF2\u9396\u5B9A\u3002")}</p>
      <span class="badge badge-neutral badge-mono">\u5C55\u793A\u6A21\u5F0F \xB7 \u552F\u8B80</span>
    </div>
  </div>`}var St=null,ha=0,Ls=null,Ws={x:0,y:0};function Oc(){return St?.isConnected||(St=document.createElement("div"),St.className="demo-lock-tooltip",St.setAttribute("role","tooltip"),St.hidden=!0,document.body.appendChild(St)),St}function Ui(){if(!St||St.hidden)return;let e=18,t=St.getBoundingClientRect(),s=Ws.x+e,a=Ws.y+14;s+t.width>window.innerWidth-8&&(s=Ws.x-t.width-e),a+t.height>window.innerHeight-8&&(a=Ws.y-t.height-14),St.style.transform=`translate3d(${Math.round(Math.max(8,s))}px, ${Math.round(Math.max(8,a))}px, 0)`}function Hc(e){let t=String(e?.dataset.demoLockTooltip||"").trim();if(!t)return;let s=Oc();s.textContent=t,s.hidden=!1,Ui()}function Wa(){ha&&(window.clearTimeout(ha),ha=0),Ls=null,St&&(St.hidden=!0)}function Di(e,t,s){!e||Ls===e||(Wa(),Ls=e,Ws={x:t,y:s},ha=window.setTimeout(()=>{ha=0,Ls===e&&Hc(e)},200))}function Ka(){Ka.installed||(Ka.installed=!0,document.addEventListener("pointerover",e=>{let t=e.target.closest?.("[data-demo-lock-tooltip]");t&&Di(t,e.clientX,e.clientY)}),document.addEventListener("pointermove",e=>{Ls&&(Ws={x:e.clientX,y:e.clientY},St&&!St.hidden&&Ui())}),document.addEventListener("pointerout",e=>{if(!Ls)return;let t=e.relatedTarget;t&&Ls.contains?.(t)||Wa()}),document.addEventListener("focusin",e=>{let t=e.target.closest?.("[data-demo-lock-tooltip]");if(!t)return;let s=t.getBoundingClientRect();Di(t,s.right,s.top)}),document.addEventListener("focusout",()=>Wa()),window.addEventListener("scroll",Wa,{capture:!0,passive:!0}))}var ur={};ls(ur,{render:()=>Qc});var zc=[{hours:2,label:"2 \u5C0F\u6642"},{hours:24,label:"24 \u5C0F\u6642"},{hours:168,label:"7 \u5929"}];function Gc(e,t){return`<label class="demo-toggle-row" for="demo-feature-${e}">
    <span class="demo-toggle-copy">
      <strong>${r(Ya[e]||e)}</strong>
      <small>${t?"\u8A2A\u5BA2\u53EF\u4F7F\u7528\u6B64\u529F\u80FD\u7684\u552F\u8B80\uFF0F\u516C\u958B\u90E8\u5206":"\u76EE\u524D\u672A\u958B\u653E\u7D66\u8A2A\u5BA2"}</small>
    </span>
    <span class="demo-switch">
      <input type="checkbox" id="demo-feature-${e}" data-demo-feature="${e}" aria-label="${r(Ya[e]||e)}" ${t?"checked":""} />
      <span aria-hidden="true"></span>
    </span>
  </label>`}function Uc(e){return e?.length?`<div class="demo-audit-list">${e.map(t=>`<div class="demo-audit-row">
        <span>${r(t.created_at||"\u2014")}</span>
        <strong>${r(t.action||"\u2014")}</strong>
        <small>${r(t.actor_email||"\u2014")}</small>
      </div>`).join("")}</div>`:'<div class="demo-empty">\u5C1A\u7121\u5207\u63DB\u7D00\u9304\u3002</div>'}async function Qc(e){if(!Ks()){e.innerHTML=en();return}e.innerHTML=`<section class="page admin-page">
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
  </section>`;let t=e.querySelector("#demo-admin-panel"),s=e.querySelector("#demo-admin-badge"),a=null,n=0,i=()=>{let d=t.querySelector("[data-demo-remaining]");d&&(d.textContent=Xa(a?.effective?.expires_at))},o=()=>{if(!a)return;let d=a.stored||{},p=a.effective||{},g=a.usage||{},$=d.features||{},v=!!p.enabled,u=!!a.hard_disabled;s.textContent=v?"DEMO \xB7 \u5DF2\u958B\u555F":"DEMO \xB7 \u5DF2\u95DC\u9589",s.classList.toggle("badge-ok",v),s.classList.toggle("badge-danger",!v),t.innerHTML=`<div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">DEMO MODE</div>
          <div class="report-title">\u5C55\u793A\u6A21\u5F0F</div>
          <div class="report-sub">
            \u5BE6\u969B\u751F\u6548\uFF1A<strong>${v?"\u958B\u555F":"\u95DC\u9589"}</strong>
            ${p.reason?` \xB7 \u539F\u56E0\uFF1A${r(p.reason)}`:""}
          </div>
        </div>
        <div class="demo-status-pill ${v?"is-on":"is-off"}">${v?"ON":"OFF"}</div>
      </div>
      <div class="report-section">
        ${u?`<div class="notice notice-danger" role="alert">
                <span class="notice-icon" aria-hidden="true">${m("alert",12)}</span>
                <div class="notice-body"><strong>\u74B0\u5883\u8B8A\u6578\u5F37\u5236\u95DC\u9589</strong>
                <p>JUDGMENT_DEMO_HARD_DISABLE=1\uFF0CDB \u958B\u95DC\u76EE\u524D\u7121\u6548\u3002</p></div>
              </div>`:""}
        <div class="demo-admin-stats">
          <div><span>\u5269\u9918\u6642\u9593</span><strong data-demo-remaining>${r(Xa(p.expires_at))}</strong></div>
          <div><span>\u4ECA\u65E5\u63D0\u554F</span><strong>${c(g.requests||0)}</strong></div>
          <div><span>\u4ECA\u65E5 tokens</span><strong>${c(g.tokens||0)}</strong></div>
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
          ${Bi.map(S=>Gc(S,!!$[S])).join("")}
        </div>

        <div class="demo-open-controls">
          <label class="field-label" for="demo-duration">\u958B\u653E\u6642\u9593</label>
          <select class="select" id="demo-duration">
            ${zc.map(S=>`<option value="${S.hours}">${S.label}</option>`).join("")}
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
          ${Uc(a.audit)}
        </div>
      </div>
    </div>`;let b=t.querySelector("#demo-enabled"),y=[...t.querySelectorAll("[data-demo-feature]")],k=()=>Object.fromEntries(y.map(S=>[S.dataset.demoFeature,S.checked])),M=async(S,{enabled:h,label:L})=>{S.disabled=!0;let X=Number(t.querySelector("#demo-duration")?.value||2),J=k();if(h&&!Object.values(J).some(Boolean)){P("\u8ACB\u81F3\u5C11\u958B\u555F\u4E00\u500B\u529F\u80FD\uFF0C\u624D\u80FD\u958B\u555F\u5C55\u793A\u3002","warn",5200),S.disabled=!1;return}try{a=await U.updateDemo({enabled:h,duration_hours:h?X:null,features:J,version:a?.stored?.version}),P(L,"ok",3200),o()}catch(ve){P(ve.message||"\u7121\u6CD5\u66F4\u65B0\u5C55\u793A\u8A2D\u5B9A\u3002","danger",6e3)}finally{S.disabled=!1}};t.querySelector("#demo-save")?.addEventListener("click",S=>{M(S.currentTarget,{enabled:!!b?.checked,label:b?.checked?"\u5C55\u793A\u8A2D\u5B9A\u5DF2\u5132\u5B58\uFF0C\u5C55\u793A\u4ECD\u7DAD\u6301\u958B\u555F\u3002":"\u5C55\u793A\u8A2D\u5B9A\u5DF2\u5132\u5B58\uFF0C\u5C55\u793A\u4ECD\u7DAD\u6301\u95DC\u9589\u3002"})}),t.querySelector("#demo-open")?.addEventListener("click",S=>{M(S.currentTarget,{enabled:!0,label:"\u5C55\u793A\u6A21\u5F0F\u5DF2\u958B\u555F\u3002"})}),t.querySelector("#demo-close")?.addEventListener("click",async S=>{let h=S.currentTarget;h.disabled=!0;try{a=await U.closeDemo(),P("\u5C55\u793A\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok",3200),o()}catch(L){P(L.message||"\u7121\u6CD5\u95DC\u9589\u5C55\u793A\u6A21\u5F0F\u3002","danger",6e3)}finally{h.disabled=!1}}),n&&window.clearInterval(n),n=window.setInterval(i,1e3)};return await(async()=>{try{a=await U.adminDemo(),o()}catch(d){t.innerHTML=`<div class="report-card"><div class="report-head">
        <div class="report-title-group"><div class="report-kicker">ADMIN SETTINGS</div>
        <div class="report-title">\u7121\u6CD5\u8B80\u53D6\u5C55\u793A\u8A2D\u5B9A</div>
        <div class="report-sub">${r(d.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}</div></div>
      </div></div>`}})(),()=>{n&&window.clearInterval(n),n=0}}var yr={};ls(yr,{render:()=>rd});function Jc(e){let t=e&&typeof e=="object"?e:{},s=t.judgment_total,a=t.financial_total,n=Number(s),i=Number(a),o=s!=null&&Number.isFinite(n)&&n>=0,l=a!=null&&Number.isFinite(i)&&i>=0;return{total:o?n:null,financial:l?i:null,ratio:o&&l&&n>0?i/n*100:null}}function rs(e,{loading:t=!1}={}){let s=Jc(e),a=t?"\u8B80\u53D6\u4E2D\u2026":c(s.total),n=t?"\u8B80\u53D6\u4E2D\u2026":c(s.financial),i=t?"\u8B80\u53D6\u4E2D\u2026":s.ratio===null?"\u2014":`${s.ratio.toFixed(1)}%`;return`<div class="processing-summary-card">
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
  </div>`}var pr=11,Vc=15e3,Qi="judgment.home.summary.v1",tn=new Set,Wc=[{route:"rag",icon:"message",kicker:"RAG",title:"RAG \u63D0\u554F",summary:"\u7528\u81EA\u7136\u8A9E\u8A00\u627E\u5230\u76F8\u4F3C\u5224\u6C7A\u8207\u73FE\u884C\u6CD5\u898F\uFF0C\u56DE\u7B54\u9644\u4E0A\u53EF\u56DE\u6EAF\u7684\u5F15\u7528\u3002",metric:"Citations first",tone:"feature",wide:!0,metricKey:"rag"},{route:"data",icon:"database",kicker:"EXPLORE",title:"\u8CC7\u6599\u5EAB\u67E5\u8A62",summary:"\u8DE8 PostgreSQL\u3001Parquet\u3001Qdrant \u8207 IndexedDB \u6AA2\u8996\u539F\u59CB\u8CC7\u6599\u3002",metric:"4 \u7A2E\u8CC7\u6599\u4F86\u6E90",tone:"blue",metricKey:"data"},{route:"quality",icon:"shield",kicker:"QUALITY",title:"\u8CC7\u6599\u54C1\u8CEA",summary:"\u7528 DuckDB \u6AA2\u67E5\u539F\u59CB\u5224\u6C7A\u7684\u91CD\u8907\u3001\u7F3A\u6F0F\u8207\u5F15\u7528\u4E00\u81F4\u6027\u3002",metric:"DuckDB native",tone:"green",metricKey:"quality"},{route:"performance",icon:"activity",kicker:"OBSERVE",title:"\u6548\u80FD\u5831\u8868",summary:"\u5F9E\u55AE\u6B21 RAG \u5230\u7D22\u5F15\u5EFA\u7F6E\uFF0C\u8FFD\u8E64\u6BCF\u500B\u968E\u6BB5\u7684\u8017\u6642\u8207\u74F6\u9838\u3002",metric:"Flow \xB7 Waterfall",tone:"amber",metricKey:"performance"},{route:"processing",icon:"sliders",kicker:"PIPELINE",title:"\u8CC7\u6599\u8655\u7406",summary:"\u4E0B\u8F09\u3001\u532F\u5165\u3001\u5099\u4EFD\u8207\u7D22\u5F15\uFF0C\u96C6\u4E2D\u7BA1\u7406\u8CC7\u6599\u751F\u547D\u9031\u671F\u3002",metric:"End-to-end",tone:"violet",metricKey:"processing"},{route:"status",icon:"server",kicker:"STATUS",title:"\u7CFB\u7D71\u72C0\u614B",summary:"\u6AA2\u8996\u670D\u52D9\u5065\u5EB7\u3001\u8F09\u5165 Pipeline\u3001\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207 API \u76EE\u9304\u3002",metric:"10 \u670D\u52D9\u5143\u4EF6",tone:"slate",metricKey:"status"},{route:"tests",icon:"check",kicker:"VERIFY",title:"\u7CFB\u7D71\u6E2C\u8A66",summary:"\u8A2D\u5B9A API Base\uFF0C\u6E2C\u8A66 LLM \u6A21\u578B\u8207 Reranker \u670D\u52D9\u3002",metric:"LLM \xB7 Reranker",tone:"rose",metricKey:"tests"}];function Ys(e,t=1){let s=Number(e);return Number.isFinite(s)?`${s.toFixed(t)}%`:"\u2014"}function gr(e){let t=e?.year_min,s=e?.year_max;return!t&&!s?"\u2014":t&&s&&t!==s?`${t}\u2013${s}`:String(t||s)}function Vi(e){let t=Number(e?.year_span);return Number.isFinite(t)&&t>0?`${t} \u5E74`:"\u2014"}function Kc(e){return`<a class="home-tile tone-${r(e.tone)}${e.wide?" is-wide":""}" href="#/${e.route}">
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
  </a>`}function fr(e,{loading:t=!1}={}){let s=e?.laws||{},a=n=>t?"\u8B80\u53D6\u4E2D\u2026":c(n);return`<div class="processing-summary-card">
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
  </div>`}function Yc(e,{loading:t=!1}={}){if(t)return`<div class="home-live-rows is-loading">
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
      <span class="home-live-value mono">${r(gr(a))} <i>\xB7</i> ${r(Vi(a))}</span>
    </div>
    <div class="home-live-row">
      <span class="home-live-label">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15</span>
      <span class="home-live-value mono">${c(n.indexed)} <i>\xB7</i> ${r(Ys(n.coverage_pct))}</span>
    </div>
  </div>`}function an(e,{loading:t=!1,error:s="",generatedAt:a=""}={}){return s?`<div class="home-live-error" role="status">
      <span class="home-live-error-icon">${m("alert",18)}</span>
      <div>
        <strong>\u5373\u6642\u6458\u8981\u66AB\u6642\u7121\u6CD5\u53D6\u5F97</strong>
        <p>${r(s)}</p>
        <button class="btn btn-secondary btn-sm" type="button" id="home-retry">
          ${m("refresh",13)}<span>\u91CD\u65B0\u8F09\u5165</span>
        </button>
      </div>
    </div>`:`${Yc(e,{loading:t})}
    <div class="home-live-foot">
      <span class="home-live-source">${m("link",12)}\u53F8\u6CD5\u9662 OpenData \xB7 \u5168\u570B\u6CD5\u898F\u8CC7\u6599\u5EAB</span>
      <span class="home-live-time">${t||!a?"\u540C\u6B65\u4E2D\u2026":`\u66F4\u65B0 ${_e(a)}`}</span>
    </div>`}function br(e,{loading:t=!1}={}){if(t)return`<span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>
      <span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>
      <span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>`;let s=e?.judgments||{},a=e?.raw||{},n=e?.rag?.judgment_index||{};return`<span class="home-fact">
      <span class="home-fact-label">\u539F\u59CB\u5224\u6C7A\u5099\u4EFD</span>
      <strong>${c(a.raw_total)}</strong>
      <small>${c(a.archive_count)} \u500B archive \xB7 \u53F8\u6CD5\u9662 OpenData</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">\u91D1\u878D\u5224\u6C7A\u5E74\u4EFD</span>
      <strong>${r(gr(s))}</strong>
      <small>${r(Vi(s))} \xB7 ${c(s.financial_total)} \u7B46 current</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">\u5411\u91CF\u7D22\u5F15\u8986\u84CB</span>
      <strong>${r(Ys(n.coverage_pct))}</strong>
      <small>${c(n.indexed)} / ${c(n.total)} \u7B46 \xB7 ${r(n.model||"\u2014")}</small>
    </span>`}function sn(e,t){let s=t?.laws||{},a=t?.judgments||{},n=t?.raw||{},i=t?.sources||{};if(e==="opendata"){let l=i.opendata||{};return`<article class="home-source-card">
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
        <div><dt>\u88C1\u5224\u5E74\u4EFD</dt><dd>${r(gr(a))}</dd></div>
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
  </article>`}function hr(e,{loading:t=!1,error:s=""}={}){if(t)return'<div class="home-laws-loading skeleton skeleton-card"></div>';if(s)return`<div class="home-laws-error" role="status">${m("alert",16)}<span>${r(s)}</span></div>`;let a=e?.financial_laws||{},n=Array.isArray(a.laws)?a.laws:[],i=Number(a.count)||n.length,o=Math.ceil(i/pr)||0,l=String(a.source_sha256||""),d=l?`${l.slice(0,12)}\u2026`:"\u2014",p=a.modified_at?Ht(a.modified_at):"\u2014";return`<details class="home-laws" id="home-laws">
    <summary class="home-laws-summary">
      <span class="home-laws-count">${c(i)}</span>
      <span class="home-laws-title">
        <strong>\u91D1\u878D\u6CD5\u898F\u6E05\u55AE</strong>
        <small>${r(a.source_path||"documents/\u91D1\u878D\u6CD5\u898F.md")} \xB7 ${pr} \u6B04 \xD7 ${o} \u5217</small>
      </span>
      <span class="home-laws-toggle">
        <span>\u5C55\u958B\u6E05\u55AE</span>${m("chevronDown",14)}
      </span>
    </summary>
    <div class="home-laws-body">
      <div class="home-laws-toolbar">
        <span>\u4F86\u6E90 ${r(a.source_path||"documents/\u91D1\u878D\u6CD5\u898F.md")} \xB7 SHA-256 <span class="mono">${r(d)}</span> \xB7 \u4FEE\u6539 ${r(p)}</span>
        <button class="btn btn-secondary btn-sm" type="button" id="home-laws-download">
          ${m("download",13)}<span>\u4E0B\u8F09\u6E05\u55AE</span>
        </button>
      </div>
      ${n.length?`<div class="home-laws-grid" style="--home-law-columns:${pr}" role="list">
              ${n.map((g,$)=>`<span class="home-law" role="listitem" title="${r(g)}">
                    <span class="home-law-index">${String($+1).padStart(2,"0")}</span>
                    <span class="home-law-name">${r(g)}</span>
                  </span>`).join("")}
            </div>`:'<p class="home-laws-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u6CD5\u898F\u540D\u7A31\u3002</p>'}
    </div>
  </details>`}function vr(e,{loading:t=!1,error:s=""}={}){if(t)return`<div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>`;if(s)return`<div class="home-rag-error">${m("alert",16)}<span>${r(s)}</span></div>`;let a=e?.rag||{},n=a.judgment_index||{},i=a.legal_index||{},o=a.models||{},l=Number(n.coverage_pct),d=Number.isFinite(l)?Math.max(0,Math.min(100,l)):0;return`<article class="home-rag-card">
      <span class="home-rag-kicker">JUDGMENT RETRIEVAL</span>
      <strong class="home-rag-value mono">${c(n.indexed)}<small> / ${c(n.total)}</small></strong>
      <span class="home-rag-label">\u5DF2\u7D22\u5F15 / \u91D1\u878D\u5224\u6C7A</span>
      <span class="home-rag-progress" role="img" aria-label="\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u8986\u84CB ${r(Ys(n.coverage_pct))}"><span style="width:${d.toFixed(1)}%"></span></span>
      <span class="home-rag-meta">${r(Ys(n.coverage_pct))} \xB7 ${r(n.model||"\u2014")} \xB7 ${r(n.alias||"\u2014")} \u2192 ${r(n.collection||"\u2014")}</span>
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
    </article>`}function Xc(){return`<ol class="home-rag-flow" aria-label="RAG \u57F7\u884C\u6D41\u7A0B">
    ${[["01","\u554F\u984C","1\u2013500 \u5B57","message"],["02","Embedding","bge-m3","brain"],["03","\u6AA2\u7D22","\u5224\u6C7A + \u6CD5\u898F\uFF0F\u547D\u4EE4","database"],["04","Rerank","cross-encoder","sliders"],["05","LLM","\u4F9D\u6AA2\u7D22\u5167\u5BB9\u56DE\u7B54","sparkles"],["06","\u5F15\u7528","[n] \u2192 \u539F\u59CB\u4F86\u6E90","link"]].map(([t,s,a,n])=>`<li class="home-rag-step">
          <span class="home-rag-step-icon">${m(n,17)}</span>
          <span class="home-rag-step-copy">
            <small>${t}</small>
            <strong>${r(s)}</strong>
            <span>${r(a)}</span>
          </span>
        </li>`).join("")}
  </ol>`}function Zc(){return`<div class="home-trace">
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
  </div>`}function mr(e){return e==="failed"?"\u5931\u6557":e==="skipped"?"\u7565\u904E":e==="running"?"\u57F7\u884C\u4E2D":e==="pending"?"\u7B49\u5F85":"\u5B8C\u6210"}function ed(e,t,s,a,n,i){let o=String(e.status||"success"),l=o==="skipped"||o==="pending",d=Math.max(0,Number(e.duration_ms)||0),p=l?"\u2014":ge(d),g=o==="failed"?"var(--danger)":e.color||"#64748b",$=[`is-${o}`,o==="failed"?"is-error":"",l?"is-missing":"",i&&e.key===i?"is-slowest":""].filter(Boolean).join(" "),v=String(e.key||`stage-${t}`),u=[["\u72C0\u614B",mr(o),!0],["\u958B\u59CB",e.started_at?_e(e.started_at):"\u2014",!0],["\u7D50\u675F",e.finished_at?_e(e.finished_at):"\u2014",!0],["\u8017\u6642",p,!0],["\u5360\u6574\u9AD4",Ys(n),!0],["\u8AAA\u660E",e.message||e.caption||"",!1]].map(([y,k,M])=>M||k?`<span class="rag-wf-detail"><span>${r(y)}</span><strong>${r(String(k||"\u2014"))}</strong></span>`:"").join(""),b=l?"":`<span class="rag-wf-bar is-sequential" style="left:${s.toFixed(3)}%;width:${a.toFixed(4)}%;top:0;height:12px;--bar-color:${r(g)}" aria-hidden="true"></span>`;return`<details class="rag-wf-stage home-wf-stage ${$}${tn.has(v)?" is-open":""}" data-home-wf-stage="${r(v)}"${tn.has(v)?" open":""} style="--stage-color:${r(e.color||"#64748b")}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong><span class="home-wf-step">${String(t+1).padStart(2,"0")}</span> ${r(e.label||e.key||"\u968E\u6BB5")}${i&&e.key===i?' <span class="home-wf-slow">\u6700\u6162</span>':""}</strong>${e.caption?`<small>${r(e.caption)}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${r(p)} \xB7 ${r(mr(o))} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${e.label||e.key}\uFF1A${mr(o)}\uFF0C\u8017\u6642 ${p}\uFF0C\u5360\u6574\u9AD4 ${Ys(n)}`)}">${b}</span>
    </summary>
    <div class="rag-wf-details">${u}</div>
  </details>`}function $r(e,{loading:t=!1,error:s="",clientMs:a=null}={}){if(t)return`<div class="report-card home-wf-loading" aria-live="polite">
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
    </div>`;let o=Math.max(0,Number(n.total_ms)||i.reduce((S,h)=>S+(Number(h.duration_ms)||0),0)),l=Math.max(0,Number(a)||0),d=Math.max(0,l-o),p=Math.max(o,i.reduce((S,h)=>S+(Number(h.duration_ms)||0),0),1),g=i.reduce((S,h)=>(Number(h.duration_ms)||0)>(Number(S?.duration_ms)||0)?h:S,i[0]),$=1.25,v=i.map(S=>String(S.status||"success")==="skipped"?0:Math.max((Number(S.duration_ms)||0)/p*100,$)),u=v.reduce((S,h)=>S+h,0),b=u>100?100/u:1,y=0,k=i.map((S,h)=>{let L=["skipped","pending"].includes(String(S.status||"success")),X=L?0:v[h]*b,J=y;L||(y+=X);let ve=p>0?(Number(S.duration_ms)||0)/p*100:0;return ed(S,h,J,X,ve,g?.key)}).join(""),M=i.filter(S=>S.status==="failed").length;return`<section class="report-card status-wf-card home-wf-card" data-home-pipeline>
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
      <span class="index-runtime-metric" title="\u672C\u6B21\u8F09\u5165\u8017\u6642\u6700\u9577\u7684\u968E\u6BB5\uFF0C\u4E5F\u5C31\u662F\u76EE\u524D\u6700\u660E\u986F\u7684\u74F6\u9838\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${g?.label||"\u2014"} \xB7 ${ge(g?.duration_ms||0)}`)}</strong></span>
      <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${c(i.length-M)} / ${c(i.length)}${M?` \xB7 \u5931\u6557 ${c(M)}`:""}</strong></span>
      <span class="index-runtime-metric" title="\u672C\u6B21\u6458\u8981\u7684\u7522\u751F\u6642\u9593\u3002"><span>\u66F4\u65B0\u6642\u9593</span><strong>${r(n.finished_at?_e(n.finished_at):"\u2014")}</strong></span>
    </div>
    <div class="status-wf-chart">
      <div class="rag-wf-axis"><span>0 ms</span><span>${r(ge(o))}</span></div>
      <div class="rag-wf-stages">${k}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u5BE6\u969B\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0Cbar \u9577\u5EA6\u70BA\u8A72\u968E\u6BB5\u8017\u6642\u5360\u6BD4\uFF1B\u6A19\u793A\u300C\u6700\u6162\u300D\u7684\u968E\u6BB5\u5373\u672C\u6B21\u8F09\u5165\u74F6\u9838\u3002\u9EDE\u64CA\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u3001\u5360\u6BD4\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function td(e){return`<div class="home-source-error">${m("alert",16)}<span>${r(e)}</span></div>`}function sd(){let e=Wc.map(Kc).join("");return`<section class="page home-page" id="home-page">
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
        <div id="home-live-body" aria-live="polite">${an(null,{loading:!0})}</div>
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
          ${rs(null,{loading:!0})}
        </div>
        <div class="home-metric-group" id="home-law-metrics">
          ${fr(null,{loading:!0})}
        </div>
      </div>
      <div class="home-metric-strip" id="home-metric-strip">
        ${br(null,{loading:!0})}
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
      ${Xc()}
      <div class="home-rag-values" id="home-rag-values">
        ${vr(null,{loading:!0})}
      </div>
      ${Zc()}
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
        ${sn("opendata",null)}
        ${sn("laws",null)}
      </div>
      <div id="home-laws-slot">
        ${hr(null,{loading:!0})}
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
        ${$r(null,{loading:!0})}
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
  </section>`}function ad(e,t){let s=t?.laws||{},a=t?.judgments||{},n=t?.raw||{},i=t?.rag?.judgment_index||{},o={rag:`${c(i.indexed)} \u7B46\u7D22\u5F15`,data:`${c(s.law_count)} \u6CD5\u898F \xB7 ${c(s.order_count)} \u547D\u4EE4`,quality:`${c(n.raw_total)} \u539F\u59CB\u5224\u6C7A`,processing:`${c(n.archive_count)} archive`,performance:"Flow \xB7 Waterfall",status:"10 \u670D\u52D9\u5143\u4EF6",tests:"LLM \xB7 Reranker"};e.querySelectorAll("[data-home-tile-metric]").forEach(l=>{let d=l.dataset.homeTileMetric;d&&o[d]&&(l.textContent=o[d])})}function Ji(e,t,{clientMs:s=null}={}){let a=t?.data||{},n=t?.generated_at||"",i=e.querySelector("#home-live-body");i&&(i.innerHTML=an(a,{generatedAt:n}));let o=e.querySelector("#home-judgment-stats"),l=a.judgments||{};o&&(o.innerHTML=rs({judgment_total:l.raw_total,financial_total:l.financial_total,financial_ratio:l.financial_ratio}));let d=e.querySelector("#home-law-metrics");d&&(d.innerHTML=fr(a));let p=e.querySelector("#home-metric-strip");p&&(p.innerHTML=br(a));let g=e.querySelector("#home-rag-values");g&&(g.innerHTML=vr(a));let $=e.querySelector("#home-source-grid");$&&($.innerHTML=`${sn("opendata",a)}${sn("laws",a)}`);let v=e.querySelector("#home-laws-slot");if(v){let y=!!v.querySelector("#home-laws")?.open;v.innerHTML=hr(a);let k=v.querySelector("#home-laws");k&&y&&(k.open=!0)}let u=e.querySelector("#home-waterfall-slot");u&&(u.innerHTML=$r({...a,pipeline:t?.pipeline},{clientMs:s})),ad(e,a)}function nd(e,t){let s=e.querySelector("#home-live-body");s&&(s.innerHTML=an(null,{error:t}));let a=e.querySelector("#home-judgment-stats");a&&(a.innerHTML=rs(null));let n=e.querySelector("#home-law-metrics");n&&(n.innerHTML=fr(null));let i=e.querySelector("#home-metric-strip");i&&(i.innerHTML=br(null));let o=e.querySelector("#home-rag-values");o&&(o.innerHTML=vr(null,{error:t}));let l=e.querySelector("#home-source-grid");l&&(l.innerHTML=td(t));let d=e.querySelector("#home-laws-slot");d&&(d.innerHTML=hr(null,{error:t}));let p=e.querySelector("#home-waterfall-slot");p&&(p.innerHTML=$r(null,{error:t}))}async function rd(e,t){let s=!1,a=!1,n=!1,i=null,o=null,l=null,d=null,p=0;e.innerHTML=sd();let g=e.querySelector("#home-ask-form"),$=e.querySelector("#home-question"),v=e.querySelector("#home-refresh"),u=()=>{let h=String($?.value||"").trim().slice(0,500);if(!h){$?.focus();return}try{window.sessionStorage.setItem("judgment.pending_question",h)}catch{}window.__judgmentPendingQuestion=h,t&&typeof t.navigate=="function"?t.navigate("rag"):window.location.hash="#/rag"},b=()=>{$&&($.style.height="auto",$.style.height=`${Math.min($.scrollHeight,140)}px`)},y=h=>{v&&(v.disabled=h,v.classList.toggle("is-loading",h),v.setAttribute("aria-busy",h?"true":"false"))},k=async({quiet:h=!1}={})=>{if(s)return;if(a){n=!0;return}if(a=!0,p=Date.now(),y(!0),!h){let X=e.querySelector("#home-live-body");X&&(X.innerHTML=an(null,{loading:!0}))}let L=performance.now();try{let X=await U.homeSummary();if(s||!e.isConnected)return;o=X?.data||null,l=X?.data?.financial_laws||null,ns(Qi,X),Ji(e,X,{clientMs:Math.round(performance.now()-L)})}catch(X){if(s||!e.isConnected)return;nd(e,X.message||"\u7121\u6CD5\u53D6\u5F97\u9996\u9801\u5373\u6642\u8CC7\u6599\u3002")}finally{a=!1,y(!1),n&&!s&&(n=!1,k({quiet:!0}))}};$?.addEventListener("input",b),g?.addEventListener("submit",h=>{h.preventDefault(),u()}),$?.addEventListener("keydown",h=>{h.key==="Enter"&&!h.shiftKey&&!h.isComposing&&(h.preventDefault(),u())});let M=()=>{if(s||d)return;let h=Math.max(0,Vc-(Date.now()-p));if(h===0){k({quiet:!0});return}d=window.setTimeout(()=>{d=null,s||k({quiet:!0})},h)};e.addEventListener("click",h=>{if(h.target.closest("#home-refresh")||h.target.closest("#home-retry")){d&&(window.clearTimeout(d),d=null),k();return}if(h.target.closest("#home-laws-download")){let L=l?.content||`${(l?.laws||[]).join(`
`)}
`;L.trim()&&Gt("\u91D1\u878D\u6CD5\u898F.md",L)}}),e.addEventListener("toggle",h=>{let L=h.target.closest?.("[data-home-wf-stage]");if(!L||!e.contains(L))return;let X=L.dataset.homeWfStage||"";X&&(L.open?tn.add(X):tn.delete(X))},!0),b(),$?.focus({preventScroll:!0});let S=ds(Qi,300*1e3);if(S?(o=S?.data||null,l=S?.data?.financial_laws||null,Ji(e,S,{clientMs:0}),k({quiet:!0})):await k(),!s)try{i=_t("processing",(h,L)=>{s||L?.initial||M()},{onError:()=>{}})}catch{i=null}return()=>{s=!0,d&&(window.clearTimeout(d),d=null),typeof i=="function"&&i(),i=null}}var Fr={};ls(Fr,{render:()=>Qu});var Wi="judgment-console";var vt="query_history",Xt="settings",Zt="audit_events";var dt={history:[],settings:new Map,audit:[],nextId:1},nn=null,mt=!("indexedDB"in window);function It(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function Ct(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function Dt(){return nn||(nn=new Promise((e,t)=>{if(!("indexedDB"in window)){mt=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(Wi,2)}catch(a){mt=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(vt)){let n=a.createObjectStore(vt,{keyPath:"id",autoIncrement:!0});n.createIndex("created_at","created_at"),n.createIndex("kind","kind")}if(a.objectStoreNames.contains(Xt)||a.createObjectStore(Xt,{keyPath:"key"}),!a.objectStoreNames.contains(Zt)){let n=a.createObjectStore(Zt,{keyPath:"key"});n.createIndex("created_at","created_at"),n.createIndex("dataset","dataset"),n.createIndex("jid","jid"),n.createIndex("issue_month","issue_month")}},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{mt=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{mt=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),nn)}function Ki(){return"indexedDB"in window}function Yi(){return mt}function va(){return mt?"memory":"indexeddb"}function id(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},turns:Array.isArray(e.turns)?e.turns:[],pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t,updated_at:e.updated_at||t}}async function od(){try{let t=(await Dt()).transaction(vt,"readwrite"),s=t.objectStore(vt),a=await It(s.count());if(a>120){let n=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let d=i.result;if(!d||n<=0){o();return}d.delete(),n-=1,d.continue()},i.onerror=()=>l(i.error)})}await Ct(t)}catch{mt=!0}}async function $a(e){let t=id(e);try{let a=(await Dt()).transaction(vt,"readwrite"),n=a.objectStore(vt),i=await It(n.add(t));return await Ct(a),await od(),i}catch{mt=!0;let a=dt.nextId++;return dt.history.push({id:a,...t}),dt.history.length>120&&dt.history.shift(),a}}async function ya(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let n=(await Dt()).transaction(vt,"readwrite"),i=n.objectStore(vt),o=await It(i.get(s));if(!o)return await Ct(n),null;let l={...o,...t,id:s};return await It(i.put(l)),await Ct(n),l}catch{mt=!0;let n=dt.history.findIndex(i=>Number(i.id)===s);return n===-1?null:(dt.history[n]={...dt.history[n],...t,id:s},dt.history[n])}}async function Xi(e){let t=Number(e);if(!Number.isFinite(t))return!1;try{let a=(await Dt()).transaction(vt,"readwrite");return a.objectStore(vt).delete(t),await Ct(a),!0}catch{mt=!0;let a=dt.history.findIndex(n=>Number(n.id)===t);return a===-1?!1:(dt.history.splice(a,1),!0)}}async function rn({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let n=(await Dt()).transaction(vt,"readonly"),i=n.objectStore(vt),o=await It(i.getAll());return await Ct(n),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,d)=>String(d.updated_at||d.created_at).localeCompare(String(l.updated_at||l.created_at))).slice(0,t)}catch{return mt=!0,dt.history.filter(n=>s?`${n.kind} ${n.title} ${n.detail}`.toLowerCase().includes(s):!0).slice().sort((n,i)=>String(i.updated_at||i.created_at).localeCompare(String(n.updated_at||n.created_at))).slice(0,t)}}async function Zi(){try{let t=(await Dt()).transaction(vt,"readwrite");t.objectStore(vt).clear(),await Ct(t)}catch{mt=!0}dt.history=[]}function ld(e){let t=Number(e.id??e.event_id??0)||0,s=String(e.dataset||e.kind||"judgment"),a=String(e.key||`${s}:${t||`${Date.now()}:${Math.random().toString(36).slice(2)}`}`),n=String(e.jid||""),i=String(e.issue_month||""),o=String(e.change_type||""),l=String(e.detected_at||e.created_at||new Date().toISOString());return{key:a,event_id:t,dataset:s,jid:n,issue_month:i,change_type:o,title:String(e.title||n||i||"\u7248\u672C\u8B8A\u66F4"),detail:String(e.detail||[o,i,n].filter(Boolean).join(" \xB7 ")),created_at:l,payload:e}}async function cd(){try{let t=(await Dt()).transaction(Zt,"readwrite"),s=t.objectStore(Zt),a=await It(s.count());if(a>2e3){let n=a-2e3,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let d=i.result;if(!d||n<=0){o();return}d.delete(),n-=1,d.continue()},i.onerror=()=>l(i.error)})}await Ct(t)}catch{mt=!0}}async function eo(e){let t=(Array.isArray(e)?e:[]).filter(s=>s&&typeof s=="object").map(ld);if(!t.length)return 0;try{let a=(await Dt()).transaction(Zt,"readwrite"),n=a.objectStore(Zt);for(let i of t)await It(n.put(i));return await Ct(a),await cd(),t.length}catch{mt=!0;let a=new Map(dt.audit.map(n=>[n.key,n]));for(let n of t)a.set(n.key,n);return dt.audit=Array.from(a.values()).sort((n,i)=>String(i.created_at).localeCompare(String(n.created_at))).slice(0,2e3),t.length}}async function to({keyword:e="",limit:t=200}={}){let s=e.trim().toLowerCase(),a=n=>s?`${n.dataset} ${n.jid} ${n.issue_month} ${n.change_type} ${n.detail}`.toLowerCase().includes(s):!0;try{let i=(await Dt()).transaction(Zt,"readonly"),o=i.objectStore(Zt),l=await It(o.getAll());return await Ct(i),l.filter(a).sort((d,p)=>String(p.created_at).localeCompare(String(d.created_at))).slice(0,t)}catch{return mt=!0,dt.audit.filter(a).slice().sort((i,o)=>String(o.created_at).localeCompare(String(i.created_at))).slice(0,t)}}async function so(){let e={name:Wi,version:2,supported:"indexedDB"in window,mode:va(),degraded:mt,stores:[vt,Xt,Zt],caps:{history:120,audit:2e3},usage_bytes:null,quota_bytes:null};if(typeof navigator<"u"&&navigator.storage?.estimate)try{let t=await navigator.storage.estimate();e.usage_bytes=Number.isFinite(t.usage)?t.usage:null,e.quota_bytes=Number.isFinite(t.quota)?t.quota:null}catch{}try{let s=(await Dt()).transaction([vt,Xt,Zt],"readonly"),a=Ct(s),[n,i,o]=await Promise.all([It(s.objectStore(vt).count()),It(s.objectStore(Xt).count()),It(s.objectStore(Zt).count()),a]);return{...e,available:!0,counts:{query_history:n,settings:i,audit_events:o},total:n+i+o}}catch{return mt=!0,{...e,available:!1,degraded:!0,mode:"memory",counts:{query_history:dt.history.length,settings:dt.settings.size,audit_events:dt.audit.length},total:dt.history.length+dt.settings.size+dt.audit.length}}}async function wa(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let n=(await Dt()).transaction(Xt,"readwrite");return n.objectStore(Xt).put(s),await Ct(n),s}catch{return mt=!0,dt.settings.set(s.key,s),s}}async function Ss(e,t=null){try{let a=(await Dt()).transaction(Xt,"readonly"),n=a.objectStore(Xt),i=await It(n.get(String(e)));return await Ct(a),i?i.value:t}catch{mt=!0;let a=dt.settings.get(String(e));return a?a.value:t}}async function ao({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await Dt()).transaction(Xt,"readonly"),n=a.objectStore(Xt),i=await It(n.getAll());return await Ct(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return mt=!0,Array.from(dt.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function no(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var Ir={};ls(Ir,{buildFlowWaterfallStages:()=>yn,render:()=>_u,renderRagPipelineWaterfall:()=>$n,renderTestFlowPanel:()=>ta,renderWaterfallStages:()=>ea});var dd={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},ud=new Set(["running","stopping"]);function cn(e){let[t,s]=dd[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${r(t)}</span>`}function on(e){return String(e).padStart(2,"0")}function Xs(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${on(t.getMonth()+1)}-${on(t.getDate())} ${on(t.getHours())}:${on(t.getMinutes())}`}function ln(e){return ud.has(e)}function ms(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function Es(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function xs(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${r(e)}</span>
    <strong>${r(String(t))}</strong>
    ${s?`<small>${r(s)}</small>`:""}
  </div>`}function ro(e={}){let t=e.score_components||e,s=e.gate||{},a=String(s.status||""),n=a==="pass"?"Gate \u901A\u904E":a==="fail"?"Gate \u5931\u6557":a==="no_data"?"Gate \u7121\u8CC7\u6599":"";return`${n?`<span class="badge ${a==="pass"?"badge-ok":a==="fail"?"badge-danger":"badge-neutral"}">${r(n)}</span>`:""}<div class="bench-metrics">
    ${xs("Law Recall",Es(t.law_recall))}
    ${xs("Article Recall",Es(t.article_recall))}
    ${xs("Citation Valid",Es(t.citation_valid_rate))}
    ${xs("Judge",ms(t.judge_overall))}
    ${xs("Human",ms(t.human_overall))}
    ${xs("p50",ge(e.duration_p50_ms))}
    ${xs("p95",ge(e.duration_p95_ms))}
    ${xs("Success",`${c(e.success||0)} / ${c(e.total||0)}`)}
  </div>`}function io(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${r(s.replace(/^rag\./,""))}</span>
      <strong>${ge(a.p50_ms)}</strong>
      <small>p95 ${ge(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function oo(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${Es(s.law_recall)}</span>
    <span>Article ${Es(s.article_recall)}</span>
    <span>Judge ${ms(s.judge_overall)}</span>
    <span>p95 ${ge(t.duration_p95_ms)}</span>`}function lo(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function co(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${r(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${r(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${r(e.status||"")}">${cn(e.status)}</span>
      <span class="mono">${r(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${r(_e(e.started_at))}</span>
      <span data-bench-slot="run-completed">${c(e.completed_cases||0)} / ${c(e.total_cases||0)} \u984C</span>
      <span>${r(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${r(lo(e))}">${oo(e)}</span>
  </button>`}function _r(e,t=[]){let s=e.metrics||{},a=e.judge||{},n=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([p])=>p.startsWith("rag.")).map(([p,g])=>`<span class="chip">${r(p)} ${ge(g)}</span>`).join(""),d=(e.law_sources||[]).map(p=>`<span class="chip">${r(p.law_name||"\u6CD5\u898F")} ${c((p.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${r(e.question)}</span>
      ${cn(e.status)}
      <span class="bench-case-time">${ge(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${ms(i.deterministic)} \xB7 Judge ${ms(i.judge)} \xB7 Human ${ms(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${r((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${r(e.fingerprint||"")}">${m("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
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
      <div class="bench-judge"><strong>LLM judge</strong><p>${r(a.rationale||a.reason||"\u2014")}</p><span>${[["correctness",a.correctness],["grounding",a.grounding],["citation",a.citation],["clarity",a.clarity],["overall",a.overall]].map(([p,g])=>`${p} ${g??"\u2014"}`).join(" \xB7 ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${e.id}">
        <div class="bench-human-grid">
          ${[["correctness","\u6B63\u78BA\u6027",n.scores?.correctness??4],["grounding","\u6709\u64DA\u6027",n.scores?.grounding??4],["citation","\u5F15\u7528",n.scores?.citation??4],["clarity","\u6E05\u695A",n.scores?.clarity??4],["overall","\u6574\u9AD4",n.overall??4]].map(([p,g,$])=>`<label class="field"><span class="field-label">${g} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${p}" value="${r(String($))}" /></label>`).join("")}
        </div>
        <label class="field"><span class="field-label">\u4EBA\u5DE5\u6279\u6CE8</span><input class="input" name="comment" value="${r(n.comment||"")}" placeholder="\u56DE\u7B54\u54C1\u8CEA\u3001\u5F15\u7528\u6216\u4E8B\u5BE6\u932F\u8AA4" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${m("check",13)}<span>\u5132\u5B58\u4EBA\u5DE5\u8A55\u5206</span></button>
      </form>
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(p=>`<div class="bench-history-row"><span>${r(_e(p.run?.started_at))}</span><span>${r(p.run?.config?.llm_model||"\u2014")}</span><span>Det ${ms(p.metrics?.scores?.deterministic)}</span><span>Judge ${ms(p.metrics?.scores?.judge)}</span><span>Human ${ms(p.metrics?.scores?.human)}</span><span>${ge(p.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function wr(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function uo(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${_r(e,t)}
  </details>`}function po(e){return`${cn(e.status)}
    <span class="mono">${r(e.run_id)}</span>
    ${ln(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${m("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function pd(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${r(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${m("activity",14)}${r(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${r((e.status||"")+":"+e.run_id)}">
        ${po(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${ro(e.summary||{})}</div>
    <div data-bench-detail="stages">${io(e.summary||{})}</div>
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
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>uo(a,t[a.fingerprint]||[])).join(""):Fe({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function mo(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${m("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${m("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function go(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),n=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,n-i):0,l=(t||[]).filter(b=>["success","failed"].includes(b.status)).map(b=>Number(b.duration_ms)||0).filter(b=>b>0),d=null;if(l.length)d=l.reduce((b,y)=>b+y,0)/l.length;else if(a>0){let b=Date.parse(e.updated_at||""),y=Number.isFinite(b)?b:i;Number.isFinite(y)&&y>i?d=(y-i)/a:o>0&&(d=o/a)}let p=(t||[]).find(b=>b.status==="running")||null,g=0;if(a<s&&d&&d>0){let b=p?Date.parse(p.started_at||""):NaN,y=Date.parse(e.updated_at||""),k=Number.isFinite(b)?b:y;Number.isFinite(k)&&(g=Math.max(0,Math.min(.95,(n-k)/d)))}let $=Math.min(s,a+g),v=s>0?Math.max(0,Math.min(100,$/s*100)):0,u=d===null?null:Math.max(0,s-$)*d;return{total:s,completed:a,elapsedMs:o,averageMs:d,progress:v,etaMs:u,ratePerMin:d?6e4/d:null,running:p}}function fo(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${ge(e)}`}function bo(e,t=[]){let s=go(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${r(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${c(s.completed)} / ${c(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${fo(s.etaMs)}</span>
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
  </div>`}function md(e){let t=e.models?.models||{},s=e.suites||[],a=_a(e),n=e.selectedRun;return`<section class="report-card bench-card">
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
      <label class="field"><span class="field-label">Run \u6A19\u7C64</span><input class="input" name="label" value="${r(e.config.label||Xs())}" /></label>
      <div class="qb-actions" data-bench-actions data-signature="${r(a?`${a.run_id}:${a.status}`:"")}">
        ${mo(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${r(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?bo(a,kr(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>co(i,n?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${n?pd(n,e.history):""}
  </section>`}function _a(e){let t=(e.runs||[]).find(s=>ln(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!ln(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function kr(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function ho(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:Xs(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",refreshStream:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),n=q=>{let A=new FormData(q);return{label:String(A.get("label")||"").trim()||Xs(),embedding_model:String(A.get("embedding_model")||""),llm_model:String(A.get("llm_model")||""),judge_model:String(A.get("judge_model")||""),top_k:Number(A.get("top_k")||4),score_threshold:Number(A.get("score_threshold")||.35),repeats:Number(A.get("repeats")||1),enable_law_retrieval:q.elements.enable_law_retrieval?.checked??!0,judge_enabled:q.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(q=>`${q.id}:${q.name}:${q.item_count}:${q.version}:${q.status}`)]:null,runs:(s.runs||[]).map(q=>`${q.run_id}:${q.label||""}:${q.suite_version||1}`)}),o=()=>{let A=a()?.querySelector("[data-bench-live]"),T=_a(s);if(!A||!T)return;let K=go(T,kr(s,T)),me=(Te,I)=>{let ye=A.querySelector(`[data-bench-slot="${Te}"]`);ye&&ye.textContent!==I&&(ye.textContent=I)};me("progress-count",`${c(K.completed)} / ${c(K.total)} \u984C`),me("progress-percent",`${K.progress.toFixed(1)}%`),me("progress-eta",fo(K.etaMs)),me("progress-rate",K.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${K.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),me("progress-elapsed",`\u5DF2\u57F7\u884C ${ge(K.elapsedMs)}`),me("progress-average",K.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${ge(K.averageMs)}\uFF0F\u984C`),me("progress-state",T.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let H=A.querySelector('[data-bench-slot="progress-bar"]');H&&(H.setAttribute("aria-valuenow",K.progress.toFixed(1)),H.classList.toggle("is-waiting",K.completed===0));let le=A.querySelector('[data-bench-slot="progress-fill"]');le&&(le.style.width=`${K.progress.toFixed(2)}%`)},l=q=>{let A=q.querySelector("[data-bench-actions]");if(!A)return;let T=_a(s),K=T?`${T.run_id}:${T.status}`:"";A.dataset.signature!==K&&(A.dataset.signature=K,A.innerHTML=mo(T))},d=q=>{let A=q.querySelector("[data-bench-live-wrap]");if(!A)return;let T=_a(s),K=T?`${T.run_id}:${T.status}:${T.total_cases}`:"";A.dataset.signature!==K&&(A.dataset.signature=K,A.innerHTML=T?bo(T,kr(s,T)):"")},p=q=>{let A=q.querySelector("[data-bench-runs]");if(!A)return;let T=s.runs||[],K=[...A.querySelectorAll("[data-run-id]")].map(H=>H.dataset.runId),me=T.map(H=>H.run_id);if(K.join("|")!==me.join("|")){A.innerHTML=T.length?T.map(H=>co(H,s.selectedRun?.run_id===H.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let H of T){let le=A.querySelector(`[data-run-id="${H.run_id}"]`);if(!le)continue;le.classList.toggle("is-active",s.selectedRun?.run_id===H.run_id);let Te=le.querySelector('[data-bench-slot="run-label"]');Te&&Te.textContent!==(H.label||"RAG Benchmark")&&(Te.textContent=H.label||"RAG Benchmark");let I=le.querySelector('[data-bench-slot="run-status"]');I&&I.dataset.status!==(H.status||"")&&(I.dataset.status=H.status||"",I.innerHTML=cn(H.status));let ye=le.querySelector('[data-bench-slot="run-completed"]');if(ye){let Me=`${c(H.completed_cases||0)} / ${c(H.total_cases||0)} \u984C`;ye.textContent!==Me&&(ye.textContent=Me)}let ae=le.querySelector('[data-bench-slot="run-scores"]'),Se=lo(H);ae&&ae.dataset.signature!==Se&&(ae.dataset.signature=Se,ae.innerHTML=oo(H))}},g=q=>{let A=s.selectedRun;if(!A)return;let T=q.querySelector(`.bench-detail[data-run-id="${A.run_id}"]`);if(!T)return;let K=T.querySelector("[data-bench-detail-actions]");if(K){let ae=`${A.status||""}:${A.run_id}`;K.dataset.signature!==ae&&(K.dataset.signature=ae,K.innerHTML=po(A))}let me=T.querySelector('[data-bench-detail="metrics"]');if(me){let ae=JSON.stringify(A.summary||{});me.dataset.signature!==ae&&(me.dataset.signature=ae,me.innerHTML=ro(A.summary||{}))}let H=T.querySelector('[data-bench-detail="stages"]');if(H){let ae=JSON.stringify((A.summary||{}).stages||{});H.dataset.signature!==ae&&(H.dataset.signature=ae,H.innerHTML=io(A.summary||{}))}let le=T.querySelector("[data-bench-cases]");if(!le)return;let Te=A.cases||[];if(!Te.length)return;let I=le.querySelector(".notice");I&&I.remove();let ye=new Map([...le.querySelectorAll("details.bench-case")].map(ae=>[Number(ae.dataset.resultId),ae]));for(let ae of Te){let Se=s.history[ae.fingerprint]||[],Me=wr(ae,Se),$e=ye.get(Number(ae.id));if(!$e){le.insertAdjacentHTML("beforeend",uo(ae,Se)),$e=le.lastElementChild,$e&&($e._benchSignature=Me);continue}if($e._benchSignature===Me||!s.forcedCaseIds.delete(Number(ae.id))&&$e.contains(document.activeElement))continue;let be=$e.open;$e.innerHTML=_r(ae,Se),$e.open=be,$e._benchSignature=Me}},$=()=>{_a(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},v=()=>{let q=a();q&&(l(q),d(q),p(q),g(q),o(),$())},u=q=>{let A=s.selectedRun;if(!A)return;let T=q.querySelector('[data-bench-detail="metrics"]');T&&(T.dataset.signature=JSON.stringify(A.summary||{}));let K=q.querySelector('[data-bench-detail="stages"]');K&&(K.dataset.signature=JSON.stringify((A.summary||{}).stages||{}));let me=q.querySelector("[data-bench-cases]");if(!me)return;let H=new Map((A.cases||[]).map(le=>[Number(le.id),le]));for(let le of me.querySelectorAll("details.bench-case")){let Te=H.get(Number(le.dataset.resultId));Te&&(le._benchSignature=wr(Te,s.history[Te.fingerprint]||[]))}},b=(q=!1)=>{let A=a();if(!A)return;let T=i();if(!q&&s.renderSignature===T){v();return}s.renderSignature=T,s.forcedCaseIds.clear(),A.innerHTML=md(s),u(A),v()},y=async({refreshAll:q=!1,runs:A=null}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||q;return}s.loading=!0;try{if(!s.referenceLoaded||q){let[I,ye]=await Promise.all([U.benchmarkModels(),U.benchmarkSuites()]);s.models=I,s.suites=ye.suites||[],s.indexVersion=I.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=I.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=I.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(I.models?.llm||[]).find(ae=>ae!==s.config.llm_model)||"")}let T=A?{runs:A}:await U.benchmarkRuns(30);s.runs=T.runs||[];let K=s.activeRunId,me=s.runs.find(I=>ln(I.status))||null;s.activeRunId=me?.run_id||"";let H=s.selectedRun?.run_id||"";H||(H=me?.run_id||s.runs[0]?.run_id||"");let le=!!(s.selectedRun&&K&&s.selectedRun.run_id===K);H&&(!s.selectedRun||s.selectedRun.run_id!==H||H===me?.run_id||le)?s.selectedRun=await U.benchmarkRun(H,!0):H||(s.selectedRun=null),s.loaded=!0,b()}catch(T){if(!s.loaded){s.renderSignature="";let K=a();K&&(K.innerHTML=Fe({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:r(T.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let T=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,y({refreshAll:T})}}},k=()=>{s.refreshStream||(s.refreshStream=_t("benchmark",(q,A)=>{s.loading||y({runs:A?.snapshot?.runs||null})}))},M=async q=>{try{s.selectedRun=await U.benchmarkRun(q,!0),b()}catch(A){P(A.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},S=async q=>{!s.labelTouched&&q.elements.label&&(q.elements.label.value=Xs());let A=n(q);s.config=A;let T=Number(q.elements.suite_id?.value||0);if(!T){P("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await U.startBenchmarkRun({suite_id:T,config:A,actor:"anonymous"}),P("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=Xs(),s.labelTouched=!1,await y()}catch(K){P(K.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},h=async q=>{try{await U.stopBenchmarkRun(q),P("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await y()}catch(A){P(A.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},L=async q=>{let A=Number(q.dataset.resultId||0),T=new FormData(q),K={};for(let me of["correctness","grounding","citation","clarity","overall"]){let H=Number(T.get(`score_${me}`));Number.isFinite(H)&&(K[me]=H)}try{await U.reviewBenchmarkResult(A,{reviewer:"anonymous",scores:K,comment:String(T.get("comment")||"")}),P("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await U.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(A)),b()}catch(me){P(me.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},X=async q=>{if(q)try{let A=await U.benchmarkFingerprintHistory(q,50);s.history[q]=A.cases||[];let T=s.selectedRun,K=a();if(!T||!K)return;let me=(T.cases||[]).filter(H=>H.fingerprint===q);for(let H of me){let le=K.querySelector(`details.bench-case[data-result-id="${H.id}"]`);if(!le)continue;let Te=le.open;le.innerHTML=_r(H,s.history[q]),le.open=Te,le._benchSignature=wr(H,s.history[q])}}catch(A){P(A.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},J=async q=>{let A=q.target.closest("[data-bench-action]");if(!A)return;let T=A.dataset.benchAction;T==="open-run"?await M(A.dataset.runId||""):T==="stop"?await h(A.dataset.runId||""):T==="fingerprint-history"&&await X(A.dataset.fingerprint||"")},ve=async q=>{let A=q.target.closest("[data-bench-form]");A&&(q.preventDefault(),A.dataset.benchForm==="run"?await S(A):A.dataset.benchForm==="human"&&await L(A))},fe=q=>{q&&(q.elements.label&&q.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=n(q),q.elements.suite_id&&(s.selectedSuiteId=Number(q.elements.suite_id.value)||s.selectedSuiteId))},se=q=>{let A=q.target.closest('[data-bench-form="run"]');A&&fe(A)};return e.addEventListener("click",J),e.addEventListener("submit",ve),e.addEventListener("input",se),e.addEventListener("change",se),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=Xs();let q=a()?.querySelector('input[name="label"]');q&&(q.value=s.config.label)}k(),y({refreshAll:!s.referenceLoaded})},refresh(){return k(),y({refreshAll:!0})},destroy(){e.removeEventListener("click",J),e.removeEventListener("submit",ve),e.removeEventListener("input",se),e.removeEventListener("change",se),s.refreshStream&&s.refreshStream(),s.refreshStream=null,s.tickTimer&&window.clearInterval(s.tickTimer)}}}var Tr={};ls(Tr,{exportCsv:()=>fn,exportableResult:()=>bn,render:()=>Kd,renderReport:()=>pn,reportError:()=>gn,reportLoading:()=>ka});var xo=[10,25,50,100],vo=500,gd=["law_name","law_level","law_category","law_modified_date","article_count"],fd=["jid","court_normalized","title","jdate","matched_laws","citation_count"],bd={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function mn(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function dn(e,t){let s={};for(let a of e.fields||[]){let n=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?n:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{},fuzzyTerms:[]}}function hd(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,n]of Object.entries(s))if(Array.isArray(n)&&!n.map(String).includes(String(t[a]??"")))return!1;return!0}function jr(e,t){return(e.fields||[]).filter(s=>hd(s,t))}function vd(e,t){return`filter-${e.id}-${t}`}function Ns(e){return e==null?"":r(String(e))}function Sr(e,t,s){let a=s[t.key],n=vd(e,t.key),i=t.help?`<span class="field-help">${r(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
  </div>`}function $o(e,t,{focusTable:s=!1}={}){let a=jr(e,t.values),n=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(n.push(`<div class="field-row">${Sr(e,o,t.values)}${Sr(e,l,t.values)}</div>`),i+=1):n.push(Sr(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
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
  </form>`}function un(e,t,s){let a={...s.values};for(let n of jr(t,a))if(n.type==="checkbox"){let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=!!i?.checked}else if(n.type==="multiselect")a[n.key]=Array.from(e.querySelectorAll(`[name="${n.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=i?i.value:""}return a}function Ao(e,t){let s={};for(let a of jr(e,t.values)){let n=t.values[a.key];a.type==="checkbox"?s[a.key]=!!n:a.type==="multiselect"?s[a.key]=Array.isArray(n)?n:[]:a.type==="number"?s[a.key]=n===""||n===null?"":Number(n):s[a.key]=n??""}return s}function xr(e,t){let s=Ao(e,t);return Array.isArray(t.fuzzyTerms)&&t.fuzzyTerms.length&&(s.keywords=[...t.fuzzyTerms]),(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function $d(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${Fe({tone:t,title:`${mn(e)} ${zt(e.status).label}`,text:r(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function yd(e,t){return`<label class="field data-source-field">
    <span class="field-label">\u8CC7\u6599\u4F86\u6E90</span>
    <select class="select" name="database">
      ${e.map(s=>{let a=zt(s.status);return`<option value="${r(s.id)}" ${s.id===t?"selected":""}>${r(s.label)} \xB7 ${r(a.label)}</option>`}).join("")}
    </select>
  </label>`}function yo(e,t){return`<nav class="data-nav" aria-label="\u8CC7\u6599\u67E5\u8A62\u529F\u80FD">
    ${[{id:"law",label:"\u67E5\u8A62\u6CD5\u898F\u547D\u4EE4",hint:"Fuzzy \u6CD5\u898F\u540D\u7A31\u3001\u985E\u5225\u8207\u547D\u4EE4",icon:"file"},{id:"judgment",label:"\u67E5\u8A62\u5224\u6C7A",hint:"Fuzzy \u6CD5\u9662\u3001\u6848\u865F\u8207\u6848\u7531",icon:"layers"},{id:"schema",label:"\u8CC7\u6599\u5EAB Schema",hint:"\u8CC7\u6599\u8868\u3001\u6B04\u4F4D\u8207\u9810\u89BD",icon:"table"}].map(a=>{let n=a.id==="schema"?t==="schema":t==="query"&&e===a.id;return`<button class="data-nav-item${n?" is-active":""}" type="button"
          data-action="data-nav" data-tab="${a.id}" ${n?'aria-current="page"':""}>
          <span class="data-nav-icon">${m(a.icon,15)}</span>
          <span class="data-nav-copy">
            <strong>${r(a.label)}</strong>
            <small>${r(a.hint)}</small>
          </span>
        </button>`}).join("")}
  </nav>`}function wd(e,t,s){if(t.id!=="postgres"&&t.id!=="parquet")return"";let a=Array.isArray(s.fuzzyTerms)?s.fuzzyTerms:[],n=e==="law"?"Fuzzy \u6CD5\u898F\uFF0F\u547D\u4EE4":"Fuzzy \u5224\u6C7A",i=e==="law"?"\u8F38\u5165\u6CD5\u898F\u540D\u7A31\u6216\u76F8\u8FD1\u5B57\u2026":"\u8F38\u5165\u6CD5\u9662\u3001\u6848\u865F\u3001\u6848\u7531\u6216\u76F8\u8FD1\u5B57\u2026";return`<div class="data-fuzzy" data-data-fuzzy data-fuzzy-kind="${e}">
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
  </div>`}function Ar(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],n=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function _d(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||r(e.detail||"")}function kd(e){return`<div class="report-empty">
    ${ht({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:r({postgres:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u6CD5\u898F\u6216\u5224\u6C7A\u689D\u4EF6\uFF0C\u518D\u8996\u9700\u8981\u5C55\u958B\u9032\u968E metadata \u689D\u4EF6\u3002",parquet:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u689D\u4EF6\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\uFF1B\u53EF\u5C55\u958B\u9032\u968E\u689D\u4EF6\u8ABF\u6574\u6B04\u4F4D\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
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
  </div>`}function ka(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(mn(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function gn(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(mn(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Fe({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Sd(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,n=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${r(s.label||"\u672A\u5206\u985E")}">${r(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${n.toFixed(1)}%"></span></span>
          <span class="dist-value">${c(a)}</span>
        </div>`}).join("")}
  </div>`}function Mo(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function xd(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function Ad(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function Md(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${r(String(t))}"
    title="\u6AA2\u8996\u300C${r(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${r(String(t))}${m("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var qd={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function Ld(e,t,s,a=!1,n=!0,i=!1){let o=a?e.key:e.label||e.key,l=n?t?qd[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${r(o)}</th>`;let d=s?.key===l,p=d?s.direction:null,g=p==="asc"?"ascending":p==="desc"?"descending":"none",$=p==="asc"?"\u2191":p==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${g}">
    <button class="table-sort${d?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${r(l)}"
      title="\u4F9D${r(o)}\u6392\u5E8F">
      <span>${r(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${$}</span>
    </button>
  </th>`}function jd(e,t){if(!Mo(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,n=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(n||""),lawName:String(t.law_name||"")}}function Td(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${r(s.lawKey)}"
    data-law-source="${r(s.sourceType)}"
    data-law-name="${r(s.lawName)}"
    title="\u6AA2\u8996\u300C${r(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(String(a))}${m("chevronRight",12,"law-link-icon")}</button>`}function qo(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:n=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],d=(e.page-1)*e.page_size,p=Mo(e),g=xd(e),$=Ad(e),v=e.meta?.sort||null,u=n?`<tr class="schema-search-row">
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
      <span class="muted" style="font-size:10px">${c(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${p?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":g?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":$?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${u}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(b=>Ld(b,g,v,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((b,y)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${d+y+1}</td>
                ${o.map(k=>{if((g||$)&&k.key==="jid")return`<td class="cell-jid">${Md(b)}</td>`;let M=p&&k.key==="law_name"?jd(e,b):null;if(M)return`<td>${Td(b,k,M)}</td>`;let h={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[k.type];return`<td${h?` class="${h}"`:""}>${Oa(b[k.key],k.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${ht({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function Ed(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${xo.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${m("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${m("chevronRight",13)}</button>
    </div>
  </div>`}function Lo(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${r(t)}</div>`).join("")}</div>`}function pn(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],n=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",d=e.status||"ok",p=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${r(l)}">
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
          ${ge(e.duration_ms)} \xB7
          ${r(String(l).toUpperCase())} / ${r(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${m("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${m("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${Fe({tone:d==="not_configured"?"info":d==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:""}

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
        ${Sd(n)}
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
        ${Lo(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?qo(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?Ed({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function wo(e){return`<div class="report-card schema-preview">
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
  </div>`}function Mr(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let n=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${Fe({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
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
    ${qo({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${Lo(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${c(i.length)} \u7B46</span>
      <strong>\u5171 ${c(e.total)} \u7B46</strong>
    </div>
  </div>`}function _o(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${r(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${Fe({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function Nd(e){return`<div class="report-empty">
    ${ht({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${mn(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function qr(e){return e.is_current===!0?Ke("ok","\u73FE\u884C"):e.law_abandon_note?Ke("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?Ke("empty","\u6B77\u53F2\u7248\u672C"):Ke("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function ut(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${r(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function Rs(e){return e?Ht(e):"\u2014"}function Rd(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function Lr(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${r(e)}</span>
    </div>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </div>`:""}function Cd(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${r(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${m("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </details>`:""}function Pd(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let n=a?.name||a?.url||"";return n?a.url?`<a class="law-attachment" href="${r(a.url)}" target="_blank" rel="noopener noreferrer">
          ${m("file",12)}<span>${r(n)}</span>${m("external",11)}
        </a>`:`<span class="law-attachment">${m("file",12)}<span>${r(n)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${c(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function jo(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Id(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,n=s?`${c(a)} \u689D \xB7 ${c(s)} \u7AE0\u7BC0`:`${c(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${r(l)}</div>`;let d=bd[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${r(jo(o.article_no))}">
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
  </div>`}function Dd(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function Zs(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${m("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function Bd(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${Zs()}
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
  </div>`}function Fd(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${Zs()}
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
        ${Fe({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function Od(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let n=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",n,a.article_count_for_law?`${c(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${r(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${r(i)}</option>`}).join("")}
    </select>
  </label>`}function Hd(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let n={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${n[o]} ${c(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
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
  </details>`}function zd(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let n=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(y=>y.article_type!=="C").length,l=Rd(e),d=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",p=e.meta?.snapshot||"",g=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",$=[l,d,g,p].filter(Boolean).join(" \xB7 "),v=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",u=e.version||{},b=[ut("\u6CD5\u898F\u4F4D\u968E",r(e.law_level||"\u2014")),ut("\u6CD5\u898F\u985E\u5225",r(e.law_category||"\u2014")),ut("\u7570\u52D5\u65E5\u671F",Rs(e.law_modified_date)),ut("\u751F\u6548\u65E5\u671F",Rs(e.law_effective_date)),ut("\u689D\u6587\u6578",c(e.article_count)),ut("\u8CC7\u6599\u72C0\u614B",qr(e)),ut("\u82F1\u8B6F\u540D\u7A31",r(e.eng_law_name||"\u2014")),ut("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${r(e.law_key||"\u2014")}</span>`)];return u.first_seen_version_id!==null&&u.first_seen_version_id!==void 0&&b.push(ut("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${r(u.first_seen_version_id)}`)),u.last_seen_version_id!==null&&u.last_seen_version_id!==void 0&&b.push(ut("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${r(u.last_seen_version_id)}`)),u.last_seen_at&&b.push(ut("\u6700\u5F8C\u6536\u9304\u6642\u9593",r(_e(u.last_seen_at)))),u.selected_version_id!==null&&u.selected_version_id!==void 0&&b.push(ut("\u689D\u6587\u7248\u672C",`#${r(u.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${Zs()}
      <span class="law-report-origin" title="${r($)}">${r($)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${r(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${r(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${r(i)}
            ${qr(e)}
            <span class="chip">${r(v)}</span>
          </div>
          <div class="report-sub">
            ${r([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${c(e.article_count)} \u689D \xB7 \u7570\u52D5 ${Rs(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${Od(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">${m("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${n.length?`<div class="report-alert">${Fe({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n.map(y=>r(y)).join("<br />")})}</div>`:""}

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
          <div class="summary-value">${qr(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${r(l)}</span>
        </div>
        <div class="law-meta-grid">${b.join("")}</div>
      </div>

      ${Hd(e)}
      ${Lr("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${Cd("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${Lr("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${Lr("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${Pd(e.attachments)}
      ${Id(e)}
    </div>
    ${o>100?Dd():""}
  </div>`}function Gd(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Zs()}
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
  </div>`}function Ud(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Zs()}
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
        ${Fe({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function Qd(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${r(t)}"
    data-law-source=""
    data-law-name="${r(t)}"
    title="\u6AA2\u8996\u300C${r(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(t)}${m("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function Jd(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let n=String(s.article_no||"").trim();n&&t.get(a).add(n)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${Qd(s)}
          <span class="judgment-citation-articles">${[...a].map(n=>r(n)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function Vd(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",n=String(e.full_text||""),i=Number(e.full_text_length)||n.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[ut("\u6848\u865F",r(e.jid||"\u2014")),ut("\u5E74\u5EA6",r(e.jyear||"\u2014")),ut("\u5B57\u5225",r(e.jcase||"\u2014")),ut("\u865F\u78BC",r(e.jno||"\u2014")),ut("\u6CD5\u9662",r(e.court||"\u2014")),ut("\u6848\u7531",r(e.title||"\u2014")),ut("\u88C1\u5224\u65E5\u671F",Rs(e.jdate)),ut("\u4F86\u6E90\u58D3\u7E2E\u6A94",r(e.source_archive||"\u2014")),ut("\u5168\u6587\u9577\u5EA6",`${c(i)} \u5B57`),ut("\u5F15\u7528\u6578",c(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(ut("\u532F\u5165 Run",`#${r(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Zs()}
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
          ${e.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(e.pdf_url)}" target="_blank" rel="noopener noreferrer">${m("external",14)}<span>PDF</span></a>`:""}
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
        ${Jd(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${c(i)} \u5B57</span>
        </div>
        ${n?`<div class="judgment-fulltext">${r(n)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function ko(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function fn(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(ko).join(",")],n=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([n+o+1,...t.map(l=>i[l.key])].map(ko).join(","))}),`\uFEFF${a.join(`\r
`)}`}function bn(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,n]of Object.entries(t))a.startsWith("_")||(s[a]=n);return s})}}function Wd(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function So(e,t){let s=performance.now(),a=Ao(e,t),n=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,d=[],p=[],g=[],$=[];if(n==="audit_events"){try{let h=Number(await Ss("audit.last_event_id",0))||0,L=await U.versioningAudit({since_id:h,limit:500}),X=Array.isArray(L?.events)?L.events:[];X.length&&await eo(X.map(ve=>({...ve,dataset:"judgment"})));let J=Number(L?.latest_event_id||0);J>h&&await wa("audit.last_event_id",J)}catch(h){d.push(`\u7248\u672C audit \u540C\u6B65\u5931\u6557\uFF1A${h.message||h}`)}p=(await to({keyword:i,limit:vo})).map(h=>({created_at:h.created_at,dataset:h.dataset,issue_month:h.issue_month,change_type:h.change_type,jid:h.jid,detail:h.detail})),g=[{key:"created_at",label:"\u6642\u9593",type:"datetime"},{key:"dataset",label:"\u8CC7\u6599\u96C6",type:"text"},{key:"issue_month",label:"\u6708\u4EFD",type:"mono"},{key:"change_type",label:"\u8B8A\u66F4",type:"status"},{key:"jid",label:"\u6848\u865F",type:"mono"},{key:"detail",label:"\u6458\u8981",type:"longtext"}];let S=new Map;p.forEach(h=>S.set(h.change_type||"unknown",(S.get(h.change_type||"unknown")||0)+1)),$=Array.from(S.entries()).map(([h,L])=>({label:h,value:L})).sort((h,L)=>L.value-h.value)}else if(n==="settings"){p=(await ao({keyword:i})).map(h=>({key:h.key,value:no(h.value),updated_at:h.updated_at})),g=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let S=new Map;p.forEach(h=>{let L=String(h.key||"").split(".")[0]||"\u5176\u4ED6";S.set(L,(S.get(L)||0)+1)}),$=Array.from(S.entries()).map(([h,L])=>({label:h,value:L})).sort((h,L)=>L.value-h.value)}else{p=(await rn({keyword:i,limit:vo})).map(h=>({kind:Wd(h.kind),title:h.title,detail:h.detail,created_at:h.created_at})),g=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let S=new Map;p.forEach(h=>S.set(h.kind,(S.get(h.kind)||0)+1)),$=Array.from(S.entries()).map(([h,L])=>({label:h,value:L})).sort((h,L)=>L.value-h.value)}let v=p.length,u=(o-1)*l,b=p.slice(u,u+l),y=Math.round(performance.now()-s),k=Yi();return k&&d.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:k?"degraded":"ok",message:k?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:n,columns:g,rows:b,total:v,page:o,page_size:l,duration_ms:y,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(v)},{label:"\u76EE\u524D\u9801\u9762",value:`${b.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:va()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${y} ms`}],distribution:$,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${n}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${u}`,warnings:d,meta:{store:n,filters:a,client_side:!0}}}async function Kd(e,t){let s=!1,a=null,n=[],i="law",o=null,l={},d=0,p=25,g="query",$=null,v=null,u=0,b=[],y=null,k=-1,M=0,S=0,h=null,L=null,X=null;e.innerHTML=`<section class="page data-page">
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
      ${rs(null,{loading:!0})}
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
  </section>`;let J=e.querySelector("#query-sidebar"),ve=e.querySelector("#data-nav"),fe=e.querySelector("#db-options-wrap"),se=e.querySelector("#filter-area"),q=e.querySelector("#schema-area"),A=e.querySelector("#query-main"),T=e.querySelector("#schema-suggest-popover"),K=e.querySelector("#catalog-meta"),me=e.querySelector("#refresh-catalog"),H=e.querySelector("#data-judgment-stats"),le=x=>n.find(j=>j.id===x),Te=()=>le(i)?.databases||[],I=x=>Te().find(j=>j.id===x),ye=(x,j)=>`${x}:${j}`,ae=(x,j=i)=>l[ye(j,x.id)],Se=(x,j)=>{wa(x,j).catch(()=>{})},Me=()=>{if(!a){K.textContent="CATALOG \xB7 \u96E2\u7DDA",K.className="badge badge-danger badge-mono";return}let x=Te(),j=x.filter(B=>B.available).length,N=le(i);K.textContent=`CATALOG \xB7 ${N?.label||i} \xB7 ${j}/${x.length} \u53EF\u7528`,K.className="badge badge-neutral badge-mono"},$e=x=>{A.innerHTML=kd(x)},Ce=()=>{let x=L?.returnScroll??X?.returnScroll;L=null,X=null;let j=I(o),N=j?ae(j):null;g==="schema"&&v?.result?A.innerHTML=Mr(v.result,Le(j,v.tableId),{columnFilters:v.columnFilters||{},searchEnabled:j.id==="postgres"||j.id==="parquet"}):N?.result?A.innerHTML=pn(N.result):j&&$e(j),typeof x=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:x,behavior:"smooth"}))},be=(x="law-article-jump")=>{let j=A.querySelector(`#${x}`),N=jo(j?.value);if(!N){P("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),j?.focus();return}let Y=[...A.querySelectorAll("[data-article-no]")].find(re=>re.dataset.articleNo===N);if(!Y){P(`\u627E\u4E0D\u5230\u7B2C ${N} \u689D\u3002`,"warn");return}Y.scrollIntoView({behavior:"instant",block:"center"}),Y.classList.add("is-jump-target"),window.setTimeout(()=>Y.classList.remove("is-jump-target"),2400)},V=async({lawKey:x,sourceType:j="",lawName:N="",versionId:B=""})=>{let Y=I(o),re=Y?ae(Y):null,pe=g==="schema"?v?.result:null;if(!Y||!re?.result&&!pe||!x)return;let Pe=++d;L={seq:Pe,lawKey:x,sourceType:j,lawName:N,versionId:B?String(B):"",page:1,detail:null,database:Y.id,returnScroll:window.scrollY},X=null,A.innerHTML=Bd(N||x),A.scrollIntoView({behavior:"smooth",block:"start"});try{let De=await U.lawDetail(x,j,L.versionId);if(s||!L||L.seq!==Pe)return;L.detail=De,L.page=1,A.innerHTML=zd(De,{database:L.database,lawPage:L.page})}catch(De){if(s||!L||L.seq!==Pe)return;A.innerHTML=Fd(De,N||x),P(De.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},he=async({jid:x})=>{let j=I(o),N=j?ae(j):null,B=g==="schema"?v?.result:null;if(!j||!N?.result&&!B||!x)return;let Y=++d;L=null;let re=j.id==="parquet"?"parquet":"postgres";X={seq:Y,jid:x,detail:null,database:j.id,source:re,returnScroll:window.scrollY},A.innerHTML=Gd(x),A.scrollIntoView({behavior:"smooth",block:"start"});try{let pe=await U.judgmentDetail(x,re);if(s||!X||X.seq!==Y)return;X.detail=pe,A.innerHTML=Vd(pe,{database:X.database})}catch(pe){if(s||!X||X.seq!==Y)return;A.innerHTML=Ud(pe,x),P(pe.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},qe=(x,j)=>`${i}:${x.id}:${j}`,Le=(x,j)=>(x.tables||[]).find(N=>N.id===j)?.label||j,Re=(x,j,{sort:N=null,columnFilters:B={}}={})=>{let Y={column_filters:B};return x.id==="postgres"?(Y.table=j,Y.schema_preview=!0):x.id==="parquet"&&i==="judgment"?(Y.table="judgment_documents",Y.columns=fd):x.id==="parquet"&&(Y.dataset="all",Y.columns=gd),N?.key&&(Y.sort=`${N.key}:${N.direction}`),Y},R=async(x,j,{sort:N=null,columnFilters:B={},quiet:Y=!1}={})=>{if(!j)return;rt();let re=qe(x,j),pe=++u,Pe=!!(Y&&v?.result&&v.key===re);$={tableId:j},v={key:re,tableId:j,loading:!0,result:null,error:null,sort:N,columnFilters:B},Pe?A.setAttribute("aria-busy","true"):(q.innerHTML=Ar(x,le(i)?.label||i,j),A.innerHTML=wo(Le(x,j)));try{let De;if(x.id==="indexeddb"){let Ie=dn(x,10);Ie.values.store=j,Ie.page=1,De=await So(x,Ie)}else x.id==="qdrant"?De={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:j,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(De=await U.query({database:x.id,filters:Re(x,j,{sort:N,columnFilters:B}),page:1,pageSize:10}),N?.key&&(De.meta={...De.meta||{},sort:N}));if(s||pe!==u)return;v={key:re,tableId:j,loading:!1,result:De,error:null,sort:N,columnFilters:B},A.removeAttribute("aria-busy"),g==="schema"&&$?.tableId===j&&(q.innerHTML=Ar(x,le(i)?.label||i,j),A.innerHTML=Mr(De,Le(x,j),{columnFilters:B,searchEnabled:x.id==="postgres"||x.id==="parquet"}))}catch(De){if(s||pe!==u)return;v={key:re,tableId:j,loading:!1,result:null,error:De,sort:N,columnFilters:B},A.removeAttribute("aria-busy"),g==="schema"&&$?.tableId===j&&(A.innerHTML=_o(De,Le(x,j)))}},D=()=>{let x=I(o);if(!x)return null;if(g==="schema"&&v?.result)return{db:x,tableId:v.tableId,columnFilters:v.columnFilters||{},sort:v.sort||null,mode:"schema"};let j=x?ae(x):null,N=j?.result;return N&&(x.id==="postgres"||x.id==="parquet")?{db:x,tableId:N.table,columnFilters:j.columnFilters||{},sort:j.sort||null,mode:"query"}:null},Q=(x,j,N)=>{if(!x)return;let B=`${x.db.id}:${x.tableId}:${j}`,Y=C.get(B);Y&&(window.clearTimeout(Y),C.delete(B)),rt();let re={...x.columnFilters||{}},pe=String(N||"").trim();if(pe?re[j]=pe:delete re[j],x.mode==="schema"){R(x.db,x.tableId,{sort:x.sort,columnFilters:re,quiet:!0});return}let Pe=ae(x.db);Pe.columnFilters=re,Pe.page=1,Ue(1)},C=new Map,O=()=>{(!T||T.hidden)&&!b.length&&!y||(M+=1,b=[],y=null,k=-1,T&&(T.hidden=!0,T.innerHTML=""))},F=(x,j)=>{let N=String(x||""),B=N.toLocaleLowerCase(),Y=String(j||"").toLocaleLowerCase(),re=new Array(N.length).fill(!1),pe=(Qe,at)=>{for(let it=Qe;it<Qe+at;it+=1)it>=0&&it<re.length&&(re[it]=!0)},Pe=B.indexOf(Y);if(Pe>=0)for(;Pe>=0;)pe(Pe,Y.length),Pe=B.indexOf(Y,Pe+Y.length);else{let Qe=[];for(let at of Y.match(/[一-鿿]{2,}/g)||[])for(let it=0;it<at.length-1;it+=1)Qe.push(at.slice(it,it+2));Qe.push(...Y.match(/[a-z0-9]+/g)||[]);for(let at of Qe){let it=B.indexOf(at);for(;it>=0;)pe(it,at.length),it=B.indexOf(at,it+at.length)}}let De="",Ie=0;for(;Ie<N.length;)if(re[Ie]){let Qe=Ie;for(;Qe<N.length&&re[Qe];)Qe+=1;De+=`<mark>${r(N.slice(Ie,Qe))}</mark>`,Ie=Qe}else{let Qe=Ie;for(;Qe<N.length&&!re[Qe];)Qe+=1;De+=r(N.slice(Ie,Qe)),Ie=Qe}return De||r(N)},we=(x,j)=>{if(!T)return;let N=x.getBoundingClientRect(),B=Math.min(420,Math.max(220,N.width)),Y=Math.min(360,34+j*30),re=N.bottom+4;re+Y>window.innerHeight-8&&(re=Math.max(8,N.top-Y-4));let pe=Math.min(window.innerWidth-B-8,Math.max(8,N.left));T.style.width=`${B}px`,T.style.left=`${pe}px`,T.style.top=`${re}px`},Oe=x=>{if(!T)return;let j=[...T.querySelectorAll(".schema-suggest-item")];j.length&&(k=Math.max(0,Math.min(j.length-1,x)),j.forEach((N,B)=>{N.classList.toggle("is-active",B===k)}),j[k].scrollIntoView({block:"nearest"}))},Ye=x=>{let j=b[x],N=y;!j||!N||(O(),Q(N,N.column,j))},st=async(x,j,N,B)=>{if(!x||!N.trim()){O();return}let Y=++M;y={...x,column:j,input:B},k=-1;try{let re=await U.schemaSuggest({database:x.db.id,table:x.tableId,column:j,query:N,limit:1e3});if(Y!==M||document.activeElement!==B||!T)return;let pe=Array.isArray(re.values)?re.values:[];if(b=pe,!pe.length){O();return}let Pe=Number(re.total)>pe.length?`\u5171 ${c(re.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${c(pe.length)} \u500B`:`\u5171 ${c(re.total)} \u500B\u7B26\u5408`;T.innerHTML=`<div class="schema-suggest-head">${r(Pe)}</div>${pe.map((De,Ie)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${Ie}"
            title="${r(De)}">${F(De,N)}</button>`).join("")}`,we(B,pe.length),T.hidden=!1}catch{O()}},rt=()=>{let x=document.activeElement;x instanceof HTMLElement&&x.matches("[data-schema-search]")&&x.blur(),O()},Xe=(x,{resetReport:j=!1}={})=>{rt();let N=ae(x);if(ve.innerHTML=yo(i,g),fe.innerHTML=yd(Te(),x.id),g==="schema")se.hidden=!0,se.innerHTML="",q.hidden=!1,q.innerHTML=`<div class="schema-category-switch" role="tablist" aria-label="Schema \u985E\u5225">
        ${["law","judgment"].map(B=>{let Y=n.find(re=>re.id===B);return Y?`<button class="chip${i===B?" is-active":""}" type="button" role="tab" aria-selected="${i===B}" data-action="schema-category" data-category="${B}">${r(Y.label)}</button>`:""}).join("")}
      </div>${Ar(x,le(i)?.label||i,$?.tableId||"")}`;else{q.hidden=!0,q.innerHTML="",se.hidden=!1;let B=wd(i,x,N),Y=$o(x,N);se.innerHTML=`${$d(x)}${B?`${B}<details class="data-advanced"><summary>\u9032\u968E metadata \u689D\u4EF6</summary>${Y}</details>`:Y}<div class="sidebar-note">${_d(x)}</div>`}if(Me(),g==="schema"){let B=$?qe(x,$.tableId):"";if(v&&v.key===B){let Y=Le(x,v.tableId);v.loading?A.innerHTML=wo(Y):v.error?A.innerHTML=_o(v.error,Y):A.innerHTML=Mr(v.result,Y,{columnFilters:v.columnFilters||{},searchEnabled:x.id==="postgres"||x.id==="parquet"})}else A.innerHTML=Nd(x);return}j?$e(x):N.result?A.innerHTML=pn(N.result):$e(x)},et=(x,{persist:j=!0,resetReport:N=!1}={})=>{let B=Te(),Y=B.find(pe=>pe.id===x)||B[0];if(!Y)return;L=null,X=null,$=null,v=null,u+=1,o=Y.id;let re=ye(i,Y.id);l[re]||(l[re]=dn(Y,p)),Xe(Y,{resetReport:N}),j&&(Se(`data.last_database.${i}`,Y.id),Se("data.last_category",i))},de=(x,{persist:j=!0,resetReport:N=!0,databaseId:B=null}={})=>{let Y=le(x)||n[0];if(!Y)return;i=Y.id,L=null,X=null;let re=Y.databases||[],pe=B&&re.find(Pe=>Pe.id===B)||re.find(Pe=>Pe.id===o)||re[0];if(o=pe?.id||null,!pe){ve.innerHTML=yo(i,g),fe.innerHTML=`<div class="sidebar-notice">${Fe({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,se.innerHTML="",Me();return}et(pe.id,{persist:!1,resetReport:N}),j&&(Se("data.last_category",Y.id),Se(`data.last_database.${Y.id}`,pe.id))},tt=x=>{let j=ae(x),N=se.querySelector("#data-filter-form");N&&(j.values=un(N,x,j))},Ue=async(x=null,{quiet:j=!1}={})=>{let N=I(o);if(!N)return;rt();let B=ae(N);tt(N),x!==null&&(B.page=x),(!Number.isFinite(B.page)||B.page<1)&&(B.page=1);let Y=++d;L=null,X=null;let re=A.querySelector(".report-card"),pe=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!re?A.setAttribute("aria-busy","true"):(A.removeAttribute("aria-busy"),A.innerHTML=ka(N));let De=se.querySelector("#run-query");j||Ne(De,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Ie;if(N.id==="indexeddb"?Ie=await So(N,B):Ie=await U.query({database:N.id,filters:xr(N,B),page:B.page,pageSize:B.pageSize}),s||Y!==d)return;if(Ie.meta={...Ie.meta||{},column_filters:B.columnFilters||{},searchable:N.id==="postgres"||N.id==="parquet",sort:B.sort||Ie.meta?.sort||null},B.result=Ie,B.page=Number(Ie.page)||B.page,B.pageSize=Number(Ie.page_size)||B.pageSize,A.removeAttribute("aria-busy"),A.innerHTML=pn(Ie),pe!==null){let at=A.querySelector("[data-page-size]");at&&(at.value=String(B.pageSize),at.focus({preventScroll:!0}))}let Qe=le(i)?.label||i;await $a({kind:"data",title:`${Qe} \xB7 ${N.label} \xB7 ${Ie.table||Ie.label||"query"}`,detail:`${c(Ie.total)} \u7B46 \xB7 ${ge(Ie.duration_ms)}`,payload:{category:i,database:N.id,filters:xr(N,B),page:B.page,page_size:B.pageSize}}),Se("data.last_query",{category:i,database:N.id,filters:xr(N,B),page:B.page,page_size:B.pageSize,at:new Date().toISOString()})}catch(Ie){if(s||Y!==d)return;A.removeAttribute("aria-busy"),A.innerHTML=gn(Ie,N),P(Ie.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&Y===d&&Ne(De,!1)}},ct=(x,j)=>{let N=x?.querySelector("[data-data-fuzzy-results]");N&&(N.innerHTML=j.length?j.map(B=>`<button class="data-fuzzy-option" type="button" role="option" data-action="select-fuzzy-term" data-term="${r(B.value)}"><span>${r(B.label||B.value)}</span><small>${r(B.meta||"")}</small></button>`).join(""):'<div class="data-fuzzy-empty">\u6C92\u6709\u76F8\u8FD1\u7D50\u679C\uFF1B\u6309 Enter \u53EF\u76F4\u63A5\u52A0\u5165\u76EE\u524D\u8F38\u5165\u7684\u95DC\u9375\u5B57\u3002</div>')},gt=async(x,j="")=>{if(!x)return;let N=I(o),B=N?ae(N):null;if(!B)return;let Y=x.dataset.fuzzyKind||i,re=x.querySelector("[data-data-fuzzy-results]"),pe=++S;re&&(re.innerHTML='<div class="data-fuzzy-loading"><span class="spinner"></span><span>\u641C\u5C0B\u76F8\u8FD1\u7D50\u679C\u2026</span></div>');try{let Pe=await U.dataSuggest({kind:Y,query:j,limit:12});if(pe!==S)return;let De=(Pe.suggestions||[]).filter(Ie=>!B.fuzzyTerms.includes(Ie.value));ct(x,De)}catch(Pe){if(pe!==S)return;re&&(re.innerHTML=`<div class="data-fuzzy-empty">${r(Pe.message||"\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},ne=(x,{focus:j=!1}={})=>{if(!x)return;let N=x.querySelector("[data-data-fuzzy-popover]"),B=x.querySelector("[data-data-fuzzy-search]");!N||!B||(N.hidden&&(N.hidden=!1,B.value="",gt(x,"")),j&&(B.focus(),B.select()))},xe=x=>{h&&(window.clearTimeout(h),h=null);let j=x?.querySelector("[data-data-fuzzy-popover]");j&&(j.hidden=!0)},We=async x=>{let j=I(o);if(!j)return;let N=ae(j),B=String(x||"").trim();!B||N.fuzzyTerms.includes(B)||(N.fuzzyTerms=[...N.fuzzyTerms,B],xe(se.querySelector("[data-data-fuzzy]")),Xe(j),await Ue(1))},ze=async x=>{let j=I(o);if(!j)return;let N=ae(j),B=String(x||"").trim();N.fuzzyTerms=N.fuzzyTerms.filter(Y=>Y!==B),Xe(j),await Ue(1)},Tt=async()=>{me.disabled=!0,Ne(me,!0,"\u6574\u7406\u4E2D\u2026");try{let x=ds("judgment.catalog.v1",6e5),[j,N,B,Y,re]=await Promise.all([x?Promise.resolve(x):U.catalog(),Ss("data.last_category","law"),Ss("data.last_database.law","postgres"),Ss("data.last_database.judgment","postgres"),Ss("data.page_size",25)]);if(s)return;x||ns("judgment.catalog.v1",j),a=j,H&&(H.innerHTML=rs(a.judgment_stats)),n=Array.isArray(a.categories)?a.categories:[],p=xo.includes(Number(re))?Number(re):25;for(let Qe of n)for(let at of Qe.databases||[]){let it=ye(Qe.id,at.id);l[it]||(l[it]=dn(at,p))}let pe=n.find(Qe=>Qe.id===N)||n[0];if(!pe){ve.innerHTML="",fe.innerHTML=`<div class="sidebar-notice">${Fe({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let Pe=pe.id==="judgment"?Y:B;if(i=pe.id,o=null,de(pe.id,{persist:!1,resetReport:!0,databaseId:Pe}),s)return;let De=I(o),Ie=De?ae(De):null;De&&Ie&&g==="query"&&!Ie.result&&(De.id==="postgres"||De.id==="parquet")&&Ue(1),P("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(x){if(s)return;a=null,n=[],ve.innerHTML="",H&&(H.innerHTML=rs(null)),Me(),fe.innerHTML=`<div class="sidebar-notice">${Fe({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:r(x.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${m("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,A.innerHTML=`<div class="report-empty">${ht({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(me.disabled=!1,Ne(me,!1))}};J.addEventListener("change",x=>{let j=x.target;if(j.name==="category"){de(j.value);return}if(j.name==="database"){et(j.value);let re=I(o),pe=re?ae(re):null;re&&pe&&!pe.result&&g==="query"&&(re.id==="postgres"||re.id==="parquet")&&Ue(1);return}let N=I(o);if(!N)return;let B=ae(N),Y=se.querySelector("#data-filter-form");!Y||!j.name||(B.values=un(Y,N,B),B.page=1,j.name==="table"&&(L=null,X=null,B.sort=null,B.columnFilters={},B.result=null,se.innerHTML=$o(N,B),$e(N)))}),J.addEventListener("input",x=>{let j=x.target.closest("[data-data-fuzzy-search]");if(j){let re=j.closest("[data-data-fuzzy]");h&&window.clearTimeout(h),h=window.setTimeout(()=>{gt(re,j.value)},160);return}let N=I(o);if(!N)return;let B=se.querySelector("#data-filter-form");if(!B||!x.target.name||x.target.name==="table")return;let Y=ae(N);Y.values=un(B,N,Y)}),J.addEventListener("keydown",x=>{let j=x.target.closest("[data-data-fuzzy-search]");if(!j)return;let N=j.closest("[data-data-fuzzy]");if(x.key==="Escape")x.preventDefault(),xe(N),j.blur();else if(x.key==="Enter"){x.preventDefault();let B=N?.querySelector("[data-action='select-fuzzy-term']");B?B.click():We(j.value)}else x.key==="ArrowDown"&&(x.preventDefault(),N?.querySelector("[data-action='select-fuzzy-term']")?.focus())}),J.addEventListener("mouseover",x=>{let j=x.target.closest("[data-action='open-fuzzy']");j&&ne(j.closest("[data-data-fuzzy]"))}),J.addEventListener("mouseout",x=>{let j=x.target.closest("[data-data-fuzzy]");j&&(x.relatedTarget&&j.contains(x.relatedTarget)||xe(j))}),J.addEventListener("submit",x=>{x.target.id==="data-filter-form"&&(x.preventDefault(),Ue(1))}),J.addEventListener("click",async x=>{let j=se.querySelector("[data-data-fuzzy] [data-data-fuzzy-popover]:not([hidden])")?.closest("[data-data-fuzzy]");j&&!x.target.closest("[data-data-fuzzy]")&&xe(j);let N=x.target.closest("[data-action]"),B=N?.dataset.action;if(B==="data-nav"){let Y=N.dataset.tab,re=I(o);if(Y==="schema"){if(g!=="schema"){if(re){let Ie=ae(re),Qe=se.querySelector("#data-filter-form");Qe&&(Ie.values=un(Qe,re,Ie))}g="schema",re&&Xe(re)}return}let pe=Y==="judgment"?"judgment":"law";g==="schema"&&(g="query"),i!==pe?de(pe,{databaseId:o,resetReport:!1}):re&&Xe(re);let Pe=I(o),De=Pe?ae(Pe):null;Pe&&De&&!De.result&&(Pe.id==="postgres"||Pe.id==="parquet")&&Ue(1);return}if(B==="open-fuzzy"){ne(N.closest("[data-data-fuzzy]"),{focus:!0});return}if(B==="select-fuzzy-term"){await We(N.dataset.term);return}if(B==="remove-fuzzy-term"){await ze(N.dataset.term);return}if(B==="schema-category"){g="schema",de(N.dataset.category||"law",{resetReport:!0});return}if(B==="select-schema-table"){let Y=I(o);if(!Y)return;R(Y,N.dataset.tableId||"");return}if(B==="reset"){let Y=I(o);if(!Y)return;L=null,X=null;let re=ae(Y);l[ye(i,Y.id)]=dn(Y,re.pageSize),Xe(Y),$e(Y),P("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}x.target.closest("#catalog-retry")&&Tt()}),A.addEventListener("input",x=>{let j=x.target.closest("[data-schema-search]");if(!j)return;let N=D();if(!N)return;let B=j.dataset.schemaSearch||"",Y=j.value,re=`${N.mode}:${N.db.id}:${N.tableId}:${B}`,pe=C.get(re);if(pe&&window.clearTimeout(pe),!Y.trim()){C.delete(re),O(),Q(N,B,"");return}let Pe=window.setTimeout(()=>{C.delete(re),st(N,B,Y,j)},250);C.set(re,Pe)}),A.addEventListener("keydown",x=>{let j=x.target.closest("[data-schema-search]");if(!j)return;let N=D();if(N){if(x.key==="Escape"){O();return}if(x.key==="ArrowDown"||x.key==="ArrowUp"){if(!T||T.hidden)return;x.preventDefault();let B=x.key==="ArrowDown"?1:-1;Oe(k<0?B>0?0:b.length-1:k+B);return}if(x.key==="Enter"){if(x.preventDefault(),T&&!T.hidden&&k>=0){Ye(k);return}Q(N,j.dataset.schemaSearch||"",j.value)}}}),T?.addEventListener("mousedown",x=>{x.preventDefault()}),T?.addEventListener("click",x=>{let j=x.target.closest("[data-schema-suggest-index]");j&&Ye(Number(j.dataset.schemaSuggestIndex))});let ft=x=>{x.target.closest("[data-schema-search]")||T?.contains(x.target)||O()};return document.addEventListener("click",ft),window.addEventListener("scroll",O,{capture:!0,passive:!0}),window.addEventListener("resize",O),A.addEventListener("keydown",x=>{x.target.matches(".law-jump-input")&&x.key==="Enter"&&(x.preventDefault(),be(x.target.id))}),A.addEventListener("click",async x=>{let j=x.target.closest("[data-action]");if(!j)return;let N=j.dataset.action,B=I(o),Y=B?ae(B):null,re=Y?.result;if(N==="back-to-results"){Ce();return}if(N==="open-law"){V({lawKey:j.dataset.lawKey||"",sourceType:j.dataset.lawSource||"",lawName:j.dataset.lawName||""});return}if(N==="open-judgment"){he({jid:j.dataset.jid||""});return}if(N==="jump-article"){be(j.dataset.jumpInput||"law-article-jump");return}if(N==="sort-column"){let pe=j.dataset.sortKey||"";if(!pe||!B)return;if(g==="schema"&&v?.result){let Ie=v.sort,Qe=pe==="jdate"||pe==="law_modified_date"||pe==="article_count"||pe==="citation_count"||pe==="full_text_length"||pe==="created_at"||pe==="updated_at",at=Ie?.key===pe?Ie.direction==="asc"?"desc":"asc":Qe?"desc":"asc";R(B,v.tableId,{sort:{key:pe,direction:at},columnFilters:v.columnFilters||{},quiet:!0});return}if(!Y)return;let Pe=Y.sort,De=Pe?.key===pe?Pe.direction==="asc"?"desc":"asc":pe==="jdate"?"desc":"asc";Y.sort={key:pe,direction:De},Ue(1,{quiet:!0});return}if(N==="retry"){Ue(Y?.page||1);return}if(re){if(N==="prev-page"){Ue(Math.max(1,Number(re.page)-1),{quiet:!0});return}if(N==="next-page"){let pe=Math.max(1,Math.ceil(Number(re.total)/Number(re.page_size)));Ue(Math.min(pe,Number(re.page)+1),{quiet:!0});return}if(N==="copy-query"){let pe=await Gs(re.query_text||"");P(pe?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",pe?"ok":"warn");return}if(N==="export-json"){let pe=`${re.database}-${re.table||"query"}-page-${re.page}.json`;Gt(pe,JSON.stringify(bn(re),null,2),"application/json;charset=utf-8"),P(`\u5DF2\u532F\u51FA ${pe}`,"ok");return}if(N==="export-csv"){let pe=`${re.database}-${re.table||"query"}-page-${re.page}.csv`;Gt(pe,fn(re),"text/csv;charset=utf-8"),P(`\u5DF2\u532F\u51FA ${pe}`,"ok")}}}),A.addEventListener("change",x=>{let j=x.target.closest("[data-action='select-law-version']");if(j&&L){V({lawKey:L.lawKey,sourceType:L.sourceType,lawName:L.lawName,versionId:j.value});return}if(!x.target.matches("[data-page-size]"))return;let N=I(o);if(!N)return;let B=ae(N);B.pageSize=Number(x.target.value)||25,B.page=1,Se("data.page_size",B.pageSize),Ue(1,{quiet:!0})}),me.addEventListener("click",()=>{Tt()}),await Tt(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0,h&&window.clearTimeout(h);for(let x of C.values())window.clearTimeout(x);C.clear(),O(),document.removeEventListener("click",ft),window.removeEventListener("scroll",O,{capture:!0}),window.removeEventListener("resize",O)}}var Do=[10,25,50,100],Yd=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function Er(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function Xd(e,t=e){return`<option value="${r(e)}">${r(t)}</option>`}function Sa(e,t,s,a,n=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${r(t)}</span>
      <span class="field-tag">${r(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${r(e)}">
      ${Xd("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${r(i)}" ${String(i)===String(a)?"selected":""}>${r(i)}</option>`).join("")}
    </select>
    ${n?`<span class="field-help">${r(n)}</span>`:""}
  </div>`}function Zd(e,t){let s=Yd.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${Sa("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${Sa("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${Sa("model","\u6A21\u578B",e.models||[],t.model)}
    ${Sa("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${Sa("method","\u65B9\u6CD5",e.methods||[],t.method)}
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
    </div>`}function To(){let e=document.getElementById("performance-filter-form");if(!e)return Er();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Eo(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function No(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),n=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${n}.${i}`}function eu(e,t){if(!e)return"";let s=new Date(e);return Number.isNaN(s.getTime())?"":new Date(s.getTime()+Math.max(0,Number(t)||0)).toISOString()}var tu=[{key:"parsing",label:"Parsing",hint:"\u8F38\u5165\u9577\u5EA6\u3001\u89E3\u6790\u6642\u9593",names:["rag.parse_question"],color:"#64748b"},{key:"embedding",label:"Embedding",hint:"Model\u3001Token\u3001Batch\u3001\u8017\u6642",names:["rag.embed_query"],color:"#3984c6"},{key:"qdrant",label:"Qdrant Search",hint:"Collection\u3001Filter\u3001Top K\u3001\u8017\u6642",names:["rag.qdrant_search"],color:"#d97706"},{key:"reranker",label:"Reranker",hint:"Model\u3001\u5019\u9078\u7B46\u6578\u3001\u8017\u6642",names:["rag.rerank"],color:"#8b5cf6"},{key:"context",label:"Context",hint:"Chunk \u6578\u3001Token \u6578\u3001\u8017\u6642",names:["rag.context"],fallbackNames:["rag.fetch_documents","rag.build_citations"],color:"#64748b"},{key:"llm",label:"LLM",hint:"Model\u3001Input/Output Token\u3001TTFT\u3001\u8017\u6642",names:["rag.llm_request"],color:"#16a34a"}],vn={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"};function Bo(e){let t=e?.metadata?.rag_response||{},s=String(t.status||e?.metadata?.rag_status||e?.status||"");return s==="operational"||s==="success"?{label:"Completed",tone:"ok"}:s==="retrieval_only"?{label:"Abstain",tone:"warn"}:s==="preview"?{label:"Preview",tone:"info"}:s==="failed"||s==="error"?{label:"Failed",tone:"danger"}:{label:s||"Unknown",tone:"idle"}}function Nr(e){let t=Math.max(0,Number(e?.offset_ms)||0),s=Math.max(0,Number(e?.duration_ms)||0),a=Math.max(t,Number(e?.end_offset_ms)||t+s);return{...e,offset:t,end:a,duration:Math.max(s,a-t)}}function Fo(e,t=0){let s=Array.isArray(e?.segments)?[...e.segments].sort((g,$)=>Number(g.offset_ms||0)-Number($.offset_ms||0)):[],a=Math.max(Number(e?.total_ms)||0,Number(t)||0,...s.map(g=>Nr(g).end),1),n=tu.map(g=>{let $=s.filter(y=>g.names.includes(y.name));!$.length&&g.fallbackNames&&($=s.filter(y=>g.fallbackNames.includes(y.name)));let v=$.map(Nr),u=v.length?Math.min(...v.map(y=>y.offset)):null,b=v.length?Math.max(...v.map(y=>y.end)):null;return{...g,spans:v,start:u,end:b,duration:u===null?null:b-u}});for(let g of n){if(g.key!=="embedding"&&g.key!=="llm")continue;let $=[];for(let b of g.spans){let y=b.metadata||{},k=Number(y.load_duration_ms),M=Number.isFinite(k)&&k>0?k:0,S=Math.max(0,Number(b.duration)||0);$.push({...b,offset:b.offset,end:b.offset+M,duration:M,metadata:{...y,source_stage:g.label,model_load_ms:M,request_duration_ms:S,warm_duration_ms:Math.max(0,S-M),cold_start:M>=100},params:{...b.params||{},source_stage:g.label}})}if(!$.length)continue;let v=$.reduce((b,y)=>b+y.duration,0),u=g.spans.reduce((b,y)=>b+Math.max(0,Number(y.duration)||0),0);g.loadInfo={spans:$,total:v,requestTotal:u,ratio:u>0?Math.min(1,Math.max(0,v/u)):0}}let i=[...n],o=Math.max(0,...i.flatMap(g=>g.spans.map($=>$.end))),l=e?.metadata?.rag_response||{},d=Bo(e),p=Math.min(a,o);return i.push({key:"response",label:"Response",hint:"\u7E3D\u8017\u6642\u3001\u5F15\u7528\u6578\u3001\u6210\u529F\u6216 Abstain",color:"#0f766e",spans:[{offset:p,end:a,duration:Math.max(0,a-p),status:d.tone==="danger"?"error":"ok",metadata:l,params:{},started_at:e?.started_at,finished_at:e?.finished_at}],start:p,end:a,duration:Math.max(0,a-p),responseMetadata:l}),su(i,a),{total:a,stages:i,response:l,traceStatus:d,requestId:e?.request_id||"",startedAt:e?.started_at,finishedAt:e?.finished_at,client:e?.client||{},models:Array.isArray(e?.summary?.models)?e.summary.models:[],hasLoad:i.some(g=>!!g.loadInfo)}}function su(e,t){let s=e.reduce((i,o)=>i+Math.max(0,Number(o.duration)||0),0),a=s>0?t/s:1,n=0;for(let i of e){let o=Math.max(0,Number(i.duration)||0)*a;i.displayStart=n,i.displayDuration=o,i.displayEnd=n+o;let l=i.spans[0]||null,d=[],p=!1;if(l){let $=Math.max(0,Number(l.duration)||0),v=i.loadInfo?Math.max(0,Number(i.loadInfo.total)||0):0;if(i.loadInfo&&v>0&&i.spans.length===1&&$>0){let u=Math.min(l.end,l.offset+v),b=Math.max(0,u-l.offset),y=Math.max(0,l.end-u);if(b>0&&y>0){let k=eu(l.started_at,b),M={...l,offset:l.offset,end:u,duration:b,finished_at:k,metadata:{...l.metadata||{},source_stage:i.label,model_load_ms:b,request_duration_ms:$,warm_duration_ms:Math.max(0,$-b),cold_start:b>=100},params:{...l.params||{},source_stage:i.label}},S={...l,offset:u,end:l.end,duration:y,started_at:k,finished_at:l.finished_at};d.push({kind:"load",label:"Model Load",span:M,duration:b}),d.push({kind:"stage",label:`${i.label} \u63A8\u8AD6`,span:S,duration:y}),p=!0}}p||d.push({kind:"stage",label:i.label,span:l,duration:$})}i.detailSegments=d;let g=[];if(l&&o>0)if(p){let[$,v]=d,u=$.duration+v.duration,b=u>0?o*($.duration/u):0,y={...i,key:"model_load",label:`Model Load \xB7 ${i.label}`,spans:[$.span],duration:$.duration},k={...i,label:`${i.label} \u63A8\u8AD6`,spans:[v.span],duration:v.duration};g.push({offset:n,duration:b,color:"#0ea5e9",kind:"load",tip:hn(y,$.span)}),g.push({offset:n+b,duration:Math.max(0,o-b),color:i.color,kind:"stage",tip:hn(k,v.span,{includeLoad:!1})})}else g.push({offset:n,duration:o,color:i.color,kind:"stage",tip:hn(i,l)});i.displaySegments=g,n+=o}}function Rr(e,{includeLoad:t=!0}={}){let s=[],a=(g,$)=>{$==null||$===""||s.push([g,String($)])},n=e.spans[0]||null;if(!n)return a("\u72C0\u614B","\u6B64\u7D00\u9304\u6C92\u6709\u9019\u500B span"),s;let i=n.params||{},o=n.metadata||{},l=Oo(n),d=Cr(n),p=(g,$)=>{let v=Number(g?.load_duration_ms);if(!Number.isFinite(v))return;let u=Math.max(0,v);a("Model Load",ge(u)),a("\u51B7\u555F\u52D5",u>=100?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09");let b=Math.max(0,Number($)||0);if(b>0){let y=Math.max(0,b-u);a("\u6263\u9664\u8F09\u5165\u5F8C",ge(y)),a("\u8F09\u5165\u5360\u6BD4",`${(u/b*100).toFixed(u/b>=.1?0:1)}%`)}};if(e.key==="response")return a("Trace \u72C0\u614B",e.responseMetadata.status||"\u2014"),a("Answer source",e.responseMetadata.answer_source||"\u2014"),a("Abstain",e.responseMetadata.abstain?"\u662F":"\u5426"),a("\u5F15\u7528\u7E3D\u6578",e.responseMetadata.citation_count??"\u2014"),a("\u5224\u6C7A\uFF0F\u6CD5\u898F\u5F15\u7528",`${e.responseMetadata.judgment_citations??"\u2014"} / ${e.responseMetadata.law_citations??"\u2014"}`),a("\u7E3D\u8017\u6642",ge(e.duration)),s;if(a("\u958B\u59CB",`${No(n.started_at)||"\u2014"} \xB7 +${n.offset.toFixed(1)} ms`),a("\u7D50\u675F",`${No(n.finished_at)||"\u2014"} \xB7 +${n.end.toFixed(1)} ms`),a("\u8017\u6642",ge(n.duration)),e.key==="parsing")a("\u8F38\u5165\u9577\u5EA6",o.input_length??i.input_length),a("\u6B63\u898F\u5316\u9577\u5EA6",o.normalized_length??i.normalized_length),a("\u79FB\u9664\u7A7A\u767D",o.trimmed_chars);else if(e.key==="embedding")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.active_base_url||o.base_url),a("Input tokens",o.prompt_eval_count),a("Batch",o.batch),a("\u5411\u91CF\u7DAD\u5EA6",o.dimensions),a("Fallback",o.fallback_used?"\u662F":"\u5426"),t&&p(o,n.duration);else if(e.key==="qdrant")a("Collection",o.collection||i.collection),o.filter&&a("Filter",Eo(o.filter)),a("Top K",o.top_k??i.limit),a("Hits",o.hits),a("Unique judgments",o.unique_judgments),a("Top score",o.top_score);else if(e.key==="reranker")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Rerank \u72C0\u614B",o.status),a("Fallback",o.fallback_used?"\u662F":"\u5426"),a("\u5019\u9078\u7B46\u6578",o.candidates),a("\u9078\u7528\u7B46\u6578",o.selected),a("Top score",o.top_score),Array.isArray(o.errors)&&o.errors.length&&a("\u932F\u8AA4",o.errors.join(" \xB7 "));else if(e.key==="context")a("Chunks",o.chunks),a("\u5224\u6C7A chunks",o.judgment_chunks),a("\u6CD5\u898F chunks",o.law_chunks),a("Token \u4F30\u7B97",o.token_estimate),a("Context \u5B57\u5143",o.context_chars),a("\u6587\u4EF6\u6578",o.documents);else if(e.key==="llm")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Input tokens",o.input_tokens),a("Output tokens",o.output_tokens),a("TTFT",o.ttft_ms===null||o.ttft_ms===void 0?"\u2014":ge(o.ttft_ms)),a("API \u7E3D\u8017\u6642",o.total_duration_ms===null||o.total_duration_ms===void 0?"\u2014":ge(o.total_duration_ms)),t&&p(o,n.duration),a("Strict retry",o.strict?"\u662F":"\u5426");else if(e.key==="model_load"){if(a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("\u4F86\u6E90\u968E\u6BB5",o.source_stage),a("\u51B7\u555F\u52D5",o.cold_start?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09"),a("\u6A21\u578B\u547C\u53EB\u7E3D\u8017\u6642",o.request_duration_ms===null||o.request_duration_ms===void 0?"\u2014":ge(o.request_duration_ms)),a("\u8F09\u5165\u8017\u6642",o.model_load_ms===null||o.model_load_ms===void 0?"\u2014":ge(o.model_load_ms)),a("\u6263\u9664\u8F09\u5165\u5F8C\u6D41\u7A0B\u6642\u9593",o.warm_duration_ms===null||o.warm_duration_ms===void 0?"\u2014":ge(o.warm_duration_ms)),Number(o.request_duration_ms)>0&&Number(o.model_load_ms)>=0){let g=Number(o.model_load_ms)/Number(o.request_duration_ms)*100;a("\u8F09\u5165\u5360\u6BD4",`${g.toFixed(g>=10?0:1)}%`)}o.eval_duration_ms!==null&&o.eval_duration_ms!==void 0&&a("\u63A8\u8AD6\u8017\u6642",ge(o.eval_duration_ms))}else if(e.key==="segment"||e.key==="test_stage")if(a("Model",d||o.model||i.model),a("\u72C0\u614B",o.status||n.status),e.key==="test_stage")a("\u9032\u5EA6",o.progress===null||o.progress===void 0?"":`${Number(o.progress)||0}%`),n.error&&a("\u932F\u8AA4",n.error);else{n.error&&a("\u932F\u8AA4",n.error);for(let[g,$]of Object.entries(i).slice(0,10))a(g,Eo($))}return e.spans.length>1&&(e.key==="model_load"?a("\u5404\u6A21\u578B\u8F09\u5165",e.spans.map(g=>`${g.metadata?.source_stage||"model"} ${Cr(g)} ${ge(g.metadata?.model_load_ms||0)}`).join(" \xB7 ")):(a("Span \u6578",e.spans.length),a("Span \u660E\u7D30",e.spans.map((g,$)=>`#${$+1} +${g.offset.toFixed(0)}ms/${ge(g.duration)}`).join(" \xB7 ")))),n.module&&a("Module",n.module),n.function&&a("Function",n.function),s}function au(e){let t=String(e||"").trim();if(!t)return"";try{return new URL(t.includes("://")?t:`http://${t}`).hostname||t}catch{return t}}function Oo(e){let t=e?.metadata||{},s=String(t.provider_name||"").trim();if(s)return s;let a=String(t.active_base_url||t.base_url||e?.params?.url||"").trim();return au(a)}function nu(e){let t=e?.metadata||{};return String(t.model||e?.params?.model||"").trim()}function Cr(e){let t=Oo(e),s=nu(e);return s?t?`${t}:${s}`:s:""}function ru(e){let t=new Set;for(let s of e?.spans||[]){let a=Cr(s);a&&t.add(a)}return[...t]}function hn(e,t,s={}){let a=Rr({...e,spans:[t]},s);return[String(e.label||""),...a.map(([n,i])=>`${n}: ${i}`)].join(`
`)}function iu(e,t){let s=e.spans||[],a=ru(e),n=Array.isArray(e.displaySegments)?e.displaySegments:null,i=7,o=Math.max(1,Math.min(4,s.length)),l=s.length>1,d=n?12:l?Math.max(12,o*i):12,p=n?n.map(k=>{if(Number(k.duration)<=0)return"";let M=Math.max(0,Math.min(100,k.offset/t*100)),S=Math.min(100-M,k.duration/t*100);return`<span class="rag-wf-bar is-sequential${k.kind==="load"?" is-load":""}" style="left:${M.toFixed(3)}%;width:${S.toFixed(4)}%;top:0;height:12px;--bar-color:${k.color}"
            data-rag-wf-tip="${r(k.tip)}"
            aria-label="${r(k.tip)}" role="img"></span>`}).join(""):s.slice(0,4).map((k,M)=>{if(Number(k.duration)<=0)return"";let S=Math.max(0,Math.min(100,k.offset/t*100)),h=Math.max(.35,Math.min(100-S,k.duration/t*100)),L=l?M*i:0,X=l?6:12,J=hn(e,k);return`<span class="rag-wf-bar" style="left:${S.toFixed(3)}%;width:${h.toFixed(3)}%;top:${L}px;height:${X}px"
            data-rag-wf-tip="${r(J)}"
            aria-label="${r(J)}" role="img"></span>`}).join(""),g=Array.isArray(e.detailSegments)?e.detailSegments:[],$=g.length>1?g.map(k=>{let M=k.kind==="load"?{...e,key:"model_load",label:`Model Load \xB7 ${e.label}`,spans:[k.span],duration:k.duration}:{...e,label:`${e.label} \u63A8\u8AD6`,spans:[k.span],duration:k.duration},S=Rr(M,{includeLoad:k.kind!=="stage"});return`<div class="rag-wf-detail-group">
              <div class="rag-wf-detail-group-head">
                <strong>${r(k.label)}</strong>
                <span>${r(ge(k.duration))}</span>
              </div>
              <div class="rag-wf-detail-grid">${S.map(([h,L])=>`<span class="rag-wf-detail"><span>${r(h)}</span><strong>${r(L)}</strong></span>`).join("")}</div>
            </div>`}).join(""):"",v=Rr(e).map(([k,M])=>`<span class="rag-wf-detail"><span>${r(k)}</span><strong>${r(M)}</strong></span>`).join(""),u=g.length>1?`<div class="rag-wf-details is-split">${$}</div>`:`<div class="rag-wf-details">${v}</div>`,b=s.length?s.some(k=>k.status==="error")?"is-error":"":"is-missing",y=s.length?ge(e.duration):"\u672A\u8A18\u9304";return`<details class="rag-wf-stage ${b}" style="--stage-color:${e.color}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong>${r(e.label)}</strong><small>${r(e.hint)}</small>${a.length?`<small class="rag-wf-model-line">${r(a.join(" \xB7 "))}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${y} \xB7 ${s.length?`${s.length} span`:"\u2014"} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:${d}px">${p}</span>
    </summary>
    ${u}
  </details>`}function Ho(e,t,s=!1){let a=e.response||{},n=e.client||{},i=e.models||[];return`<div class="rag-wf-summary">
      <span>\u7E3D\u8017\u6642 <strong>${r(ge(e.total))}</strong></span>
      <span>Server <strong>${r(ge(t))}</strong></span>
      ${n.total_ms?`<span>Client <strong>${r(ge(n.total_ms))}</strong></span>`:""}
      ${n.render_ms!==void 0?`<span>Render <strong>${r(ge(n.render_ms))}</strong></span>`:""}
      <span>\u5F15\u7528 <strong>${r(String(a.citation_count??"\u2014"))}</strong></span>
      <span>Abstain <strong>${a.abstain?"\u662F":"\u5426"}</strong></span>
      ${i.length?`<span>Model <strong>${r(i.join(" \xB7 "))}</strong></span>`:""}
      ${s?'<span class="rag-wf-updating">\u66F4\u65B0\u4E2D\u2026</span>':""}
    </div>`}function ea(e,t,s="\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\uFF0C\u67E5\u770B\u53C3\u6578\u3001Token\u3001TTFT\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u4F86\u6E90\u6578\u91CF\u3002Waterfall \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u5E73\u884C\u57F7\u884C\u7684 span \u6703\u4F9D\u5BE6\u969B\u6642\u9593\u91CD\u758A\u986F\u793A\u3002",{legend:a=""}={}){return`<div class="rag-wf-axis"><span>0 ms</span><span>${r(ge(t))}</span></div>
    ${a}
    <div class="rag-wf-stages">${(e||[]).map(n=>iu(n,t)).join("")}</div>
    <p class="rag-wf-hint">${r(s)}</p>`}function zo(e){let t=(e.stages||[]).some(n=>n.loadInfo),s=t?'<div class="rag-wf-legend"><span><i class="is-load"></i>Model Load\uFF08\u968E\u6BB5 bar \u524D\u6BB5\uFF09</span></div>':"",a=t?"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\uFF1BEmbedding\uFF0FLLM \u7684\u85CD\u8272\u524D\u6BB5\u70BA Model Load\uFF0C\u5F8C\u6BB5\u70BA\u63A8\u8AD6\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001Token \u8207\u8F09\u5165\u5360\u6BD4\u53EF\u5C55\u958B\u67E5\u770B\u3002":"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207 Token \u53EF\u5C55\u958B\u67E5\u770B\u3002";return ea(e.stages,e.total,a,{legend:s})}function $n(e,{serverDurationMs:t=0,loading:s=!1,embedded:a=!1}={}){if(!e||typeof e!="object")return"";let n=Fo(e,t),i=n.traceStatus;return`<section class="report-card rag-wf-card${a?" rag-wf-embedded":""}">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${vn[i.tone]||vn.idle}">${r(i.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(n.requestId||"\u2014")}</span>
          \xB7 ${r(_e(n.startedAt))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <a class="btn btn-secondary btn-sm" href="#/performance">
          ${m("activity",14)}<span>\u5B8C\u6574 Flow</span>
        </a>
      </div>
    </div>
    ${Ho(n,t,s)}
    ${zo(n)}
  </section>`}var xt=null;function ou(){return xt||(xt=document.createElement("div"),xt.className="rag-wf-tooltip",xt.hidden=!0,document.body.appendChild(xt),xt)}function Pr(){xt&&(xt.hidden=!0)}function Go(e){if(!xt||xt.hidden)return;let t=14,s=10,a=xt.getBoundingClientRect(),n=e.clientX+t,i=e.clientY+t;n+a.width>window.innerWidth-s&&(n=e.clientX-a.width-t),i+a.height>window.innerHeight-s&&(i=e.clientY-a.height-t),xt.style.left=`${Math.max(s,n)}px`,xt.style.top=`${Math.max(s,i)}px`}document.addEventListener("pointerover",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=ou(),a=t.dataset.ragWfTip||"";a&&(s.textContent=a,s.hidden=!1,Go(e))});document.addEventListener("pointermove",e=>{if(!(!xt||xt.hidden)){if(!e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]")){Pr();return}Go(e)}});document.addEventListener("pointerout",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=e.relatedTarget;s instanceof Node&&t.contains(s)||Pr()});window.addEventListener("scroll",Pr,{capture:!0,passive:!0});function lu(e,t,s,a){if(a&&!e.length)return`<div class="report-card rag-wf-card">
      ${Fe({tone:"danger",title:"RAG Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">${m("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;if(!e.length)return`<div class="report-card rag-wf-card">
      ${ht({iconName:"activity",title:s?"\u8B80\u53D6 RAG Pipeline\u2026":"\u5C1A\u7121 RAG Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684 RAG \u554F\u7B54 Trace\u3002":"\u7522\u751F\u65B0\u7684 RAG \u554F\u7B54\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A Parsing\u3001Embedding\u3001Qdrant\u3001Context\u3001LLM \u8207 Response \u7684 waterfall\u3002"})}
    </div>`;let n=e.find(p=>String(p.id)===String(t))||e[0],i=n.flow&&typeof n.flow=="object"?n.flow:{},o=Fo(i,n.duration_ms),l=o.traceStatus,d=e.map(p=>{let g=Bo(p.flow||{});return`<option value="${r(String(p.id))}" ${String(p.id)===String(n.id)?"selected":""}>#${r(String(p.id))} \xB7 ${r(_e(p.started_at))} \xB7 ${r(ge(p.duration_ms))} \xB7 ${r(g.label)}</option>`}).join("");return`<section class="report-card rag-wf-card">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${vn[l.tone]||vn.idle}">${r(l.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(o.requestId||n.request_id||"\u2014")}</span>
          \xB7 ${r(_e(n.started_at))}
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
    ${Ho(o,n.duration_ms,s)}
    ${zo(o)}
  </section>`}function cu(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},n=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?ge(a.avg_total_ms??0):"\u2014",o=a.samples?ge(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
  </div>`}function $t(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),n=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(n).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:n?`${n}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function Uo(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function du(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let n=Number(a.points_per_second)||0,i=Math.max(2,n/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${r(Uo(a))}</strong>
          <span>${r(_e(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${r(`${c(a.indexed_count)} \u7B46 \xB7 ${$t(a.duration_ms)} \xB7 ${c(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${n.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${c(a.indexed_count)} \u7B46 \xB7 ${$t(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function uu(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${r(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${r(`${s.label} ${$t(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${r(s.key)}"></i>
            <span>${r(s.label)}</span>
            <strong>${$t(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 llama-server Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function pu(e,t){let s=(Array.isArray(e)?e:[]).map(M=>({elapsed:Math.max(0,Number(M.elapsed_s)||0),indexed:Math.max(0,Number(M.indexed)||0)})).filter(M=>M.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(M=>M.elapsed),(Number(t)||0)/1e3,1),n=Math.max(...s.map(M=>M.indexed),1),i=760,o=150,l=12,d=12,p=i-l*2,g=o-d*2,$=s.map(M=>[l+M.elapsed/a*p,o-d-M.indexed/n*g]),v=$.map(([M,S],h)=>`${h===0?"M":"L"}${M.toFixed(1)},${S.toFixed(1)}`).join(" "),u=`${v} L${$[$.length-1][0].toFixed(1)},${o-d} L${$[0][0].toFixed(1)},${o-d} Z`,b=Math.max(1,Math.ceil($.length/14)),y=$.map(([M,S],h)=>h%b===0||h===$.length-1?`<circle cx="${M.toFixed(1)}" cy="${S.toFixed(1)}" r="2.6" />`:"").join(""),k=[0,1,2,3].map(M=>{let S=d+g/3*M;return`<line x1="${l}" y1="${S.toFixed(1)}" x2="${i-l}" y2="${S.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${c(n)} \u7B46 \xB7 ${$t(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${k}
      <path d="${u}" class="index-progress-area"></path>
      <path d="${v}" class="index-progress-line"></path>
      ${y}
      <line x1="${l}" y1="${o-d}" x2="${i-l}" y2="${o-d}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${d}" x2="${l}" y2="${o-d}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${$t(a*500)}</span>
      <span>${$t(a*1e3)}</span>
    </div>
  </div>`}function mu(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},n=t.coverage||{},i=n.total_judgments>0?`${c(n.indexed_judgments)} / ${c(n.total_judgments)}\uFF08${(100*n.indexed_judgments/n.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:c(t.indexed_count),note:`${c(t.batch_count)} \u6279 \xD7 ${c(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:$t(t.duration_ms),note:`${c(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:$t(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${$t(t.batch_min_ms)} \xB7 \u6700\u6162 ${$t(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${c(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${r(Uo(t))}</span>
    </div>
    <div class="index-perf-summary">
      ${o.map(l=>`<div class="index-perf-stat">
            <div class="summary-label">${r(l.label)}</div>
            <div class="index-perf-value">${r(l.value)}</div>
            <div class="index-perf-note">${r(l.note)}</div>
          </div>`).join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${r(_e(t.started_at))}</span>
      <span><strong>batch</strong> ${c(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${c(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${c(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${r(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${$t(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${du(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${$t(t.duration_ms)}</span>
        </div>
        ${uu(t)}
      </div>
    </div>
    ${pu(t.progress,t.duration_ms)}
  </section>`}var Ro=["#22d3ee","#a78bfa","#f59e0b","#ec4899","#3b82f6","#10b981","#f97316","#8b5cf6","#64748b"];function Co(e){let t=String(e?.host||e?.url||"").trim(),s=e?.port?`:${e.port}`:"";return`${t||"\u2014"}${s}`}function gu(e,t,s,a){if(a&&!e)return`<div class="report-card rag-wf-card">
      ${Fe({tone:"danger",title:"\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${m("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=Array.isArray(e?.runs)?e.runs:[];if(!n.length)return`<div class="report-card rag-wf-card">
      ${ht({iconName:"layers",title:s?"\u8B80\u53D6\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline\u2026":"\u5C1A\u7121\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684\u7248\u672C\u5316\u7D22\u5F15\u7D00\u9304\u3002":"\u57F7\u884C\u300CQdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A host/model\u3001Blue-Green collection \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002"})}
    </div>`;let i=n.find(S=>String(S.id)===String(t))||e?.latest||n[n.length-1],o=i?.pipeline&&typeof i.pipeline=="object"?i.pipeline:null,d=[...n].reverse().map(S=>{let h=Number(S.pipeline?.version_id||S.version_id||0),L=h?`v${String(h).padStart(3,"0")}`:"\u7D22\u5F15";return`<option value="${r(String(S.id))}" ${String(S.id)===String(i.id)?"selected":""}>${r(`${_e(S.started_at)} \xB7 ${L} \xB7 ${$t(S.duration_ms)}`)}</option>`}).join(""),p=Number(o?.version_id||i.version_id||0),g=p?`v${String(p).padStart(3,"0")}`:"\u2014",$=o?.host||{},v=Co($),u=o?.model||i.model||"\u2014",b=Number(o?.total_ms)||Number(i.duration_ms)||0,y=Array.isArray(o?.stages)?o.stages:[],k=y.map((S,h)=>({...S,ms:Math.max(0,Number(S.duration_ms)||0),color:Ro[h%Ro.length]})).filter(S=>S.ms>0).map(S=>`<span class="index-pipeline-seg" style="width:${(S.ms/Math.max(1,b)*100).toFixed(2)}%;background:${r(S.color)}" title="${r(`${S.label} ${$t(S.ms)}`)}"></span>`).join(""),M=y.map((S,h)=>{let L=Math.max(0,Number(S.duration_ms)||0),X=b>0?L/b*100:0,J=S.host&&typeof S.host=="object"?S.host:null;return`<div class="index-pipeline-row">
        <span class="index-pipeline-step">${String(h+1).padStart(2,"0")}</span>
        <div class="index-pipeline-copy">
          <div class="index-pipeline-title">
            <strong>${r(S.label||S.key||"\u968E\u6BB5")}</strong>
            ${Ke(S.status||"success")}
          </div>
          <span class="index-pipeline-detail">${r(S.detail||"\u2014")}</span>
          ${J?`<span class="index-pipeline-host">${m("server",12)} ${r(Co(J))} \xB7 ${r(S.model||u)}</span>`:""}
        </div>
        <div class="index-pipeline-time">
          <strong>${$t(L)}</strong>
          <span>${X.toFixed(1)}%</span>
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
            <span><strong>\u7248\u672C</strong> ${r(g)}</span>
            <span><strong>collection</strong> ${r(String(o.collection||"\u2014"))}</span>
            <span><strong>\u6A21\u5F0F</strong> ${r(String(o.build_mode||"\u2014"))}</span>
            <span><strong>\u672C\u6B21</strong> ${o.resumed?`\u63A5\u7E8C\uFF08\u5DF2\u7D22\u5F15 ${c(o.resumed_indexed)} \u7B46\uFF09`:"\u65B0\u5EFA\u7248\u672C"}</span>
            <span><strong>Host</strong> ${r(v)}</span>
            <span><strong>Model</strong> ${r(String(u))}</span>
            <span><strong>\u7E3D\u8017\u6642</strong> ${$t(b)}</span>
          </div>
          <div class="index-pipeline-bar">${k}</div>
          <div class="index-pipeline-list">${M}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B Pipeline \u968E\u6BB5\u8CC7\u6599\uFF1B\u4E0B\u4E00\u6B21 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u6703\u8A18\u9304 host/model \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002</div>'}
  </section>`}function fu(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Do.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${m("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${m("chevronRight",13)}</button>
    </div>
  </div>`}function bu(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"#65a30d":t.includes("judgment.rag")?"#8b5cf6":t.includes("judgment.web.app")?"#3b82f6":t.includes("judgment.web.query")?"#d97706":t.includes("judgment.judgment_index")?"#0d9488":"#64748b"}function hu(e){let t=Nr(e),s=Math.max(0,Math.min(8,Number(e.depth)||0));return{key:"segment",label:`${"\u203A ".repeat(s)}${e.name||"unnamed"}`,hint:[e.module||"\u2014",e.function||"\u2014"].join(" \xB7 "),color:bu(e),spans:[{...t,status:e.status||"ok",error:e.error,metadata:e.metadata||{},params:e.params||{},started_at:e.started_at,finished_at:e.finished_at}],start:t.offset,end:t.end,duration:t.duration}}function yn(e){return(e||[]).map(hu)}function vu(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((v,u)=>Number(v.seq)-Number(u.seq)):[],n=s?.summary||{},i=Array.isArray(n.models)?n.models:[],o=s?.client||{},l=s?.metadata||{},d=l.question||"",p=l.answer||"",g=d||p?`<div class="perf-flow-qa">
          ${d?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${r(d)}</span></div>`:""}
          ${p?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${r(p)}</span></div>`:""}
        </div>`:"",$=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(v=>(Number(v.offset_ms)||0)+(Number(v.duration_ms)||0)),1);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${r(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${r(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${r(e.method||"")} ${r(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${_e(e.started_at)}</span>
      <span class="perf-record-duration">${ge(e.duration_ms)}</span>
      ${Ke(e.status)}
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
      ${g}
      ${i.length?`<div class="chips perf-record-models">${i.map(v=>`<span class="chip">${r(v)}</span>`).join("")}</div>`:""}
      ${a.length?ea(yn(a),$,"\u6B64 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002"):`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${r(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${r(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var Po={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",rerank:"Reranker",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"};function $u(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}var yu={embedding:"#3984c6",retrieval:"#d97706",rerank:"#8b5cf6",context:"#64748b",llm:"#16a34a",validation:"#8b5cf6"};function wu(e,t){let s=Date.parse(e.started_at||""),a=Date.now(),n=Array.isArray(e.stage_order)?[...e.stage_order]:Object.keys(Po);for(let p of t)p.stage&&!n.includes(p.stage)&&n.push(p.stage);let i=[],o=0;for(let p of n){let g=t.filter(u=>u.stage===p);if(!g.length)continue;let $=g.map(u=>{let b=Date.parse(u.started_at||""),y=Number.isFinite(s)&&Number.isFinite(b)?Math.max(0,b-s):0,k=Math.max(0,Number(u.duration_ms)||0);u.status==="running"&&Number.isFinite(b)&&(k=Math.max(k,a-b));let M=y+k;return o=Math.max(o,M),{offset:y,end:M,duration:k,status:u.status==="failed"?"error":u.status==="running"?"running":"ok",started_at:u.started_at,finished_at:u.finished_at,error:u.error_message,metadata:{...u.details||{},model:u.model,status:u.status,progress:Number(u.progress)||0,module:u.module,function:u.function},params:{model:u.model}}}),v=$.reduce((u,b)=>u+b.duration,0);i.push({key:"test_stage",label:Po[p]||p,hint:`${$.length} \u500B\u7A0B\u5E8F`,color:yu[p]||"#64748b",spans:$,start:$.length?Math.min(...$.map(u=>u.offset)):null,end:$.length?Math.max(...$.map(u=>u.end)):null,duration:v})}let l=e.status==="running"&&Number.isFinite(s)?Math.max(0,a-s):0,d=Math.max(Number(e.total_ms)||0,l,o,1);return{stages:i,total:d}}function ta(e,t,s,a={}){let n=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(M=>`<option value="${r(M.run_id)}" ${M.run_id===s?"selected":""}>${r($u(M.status))} \xB7 ${r((M.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${r(_e(M.started_at))}</option>`)].join(""),o=n?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${m("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${m("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?Ke(e.status):""}</div>
      <div class="test-flow-question">${e?r(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${ht({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let d=Array.isArray(e.steps)?e.steps:[],p=wu(e,d),g=e.models||{},$=e.status==="running"?`${ge(p.total)}\uFF08\u4F30\u7B97\uFF09`:ge(e.total_ms),v=d.find(M=>M.stage==="llm"&&M.model===e.summary?.primary_model)||d.find(M=>M.stage==="llm"&&M.details?.answer_preview),u=String(v?.details?.provider_name||"").trim(),b=u&&e.summary?.primary_model?`${u}:${e.summary.primary_model}`:e.summary?.primary_model||"",y=e.answer||v?.details?.answer_preview||"",k=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${b?`<span class="mono">${r(b)}</span>`:""}
    </div>
    <p>${y?r(y):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${r(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${r(_e(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${$}</span>
      <span><strong>Embedding</strong> ${Array.isArray(g.embedding)?g.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(g.llm)?g.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${r(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${k}
    ${p.stages.length?ea(p.stages,p.total,"\u6E2C\u8A66 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B\u7A0B\u5E8F\u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u6A21\u578B\u3001\u72C0\u614B\u3001\u9032\u5EA6\u3001module\uFF0Ffunction \u8207\u932F\u8AA4\u3002"):'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":n?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${b?`<span class="mono">primary=${r(b)}</span>`:""}
    </div>
  </div>`}function Io(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},n=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${Ke(e.status||"ok")}
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
    ${mu(n)}
    ${cu(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>vu(i,o)).join(""):ht({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${fu(e)}
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
  </div>`}async function _u(e,t){let s=Ut(),a=!1,n=Er(),i={processes:[],modules:[],statuses:[],methods:[],models:[]},o=1,l=25,d=null,p=[],g="",$=!1,v=null,u=!1,b=null,y="",k=!1,M=null,S=!1;e.innerHTML=`<section class="page data-page performance-page">
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
              <div id="performance-report">${ka({label:"\u6548\u80FD\u5831\u8868"})}</div>
            </section>
          </div>
        </div>
        <div id="performance-panel-pipeline" hidden></div>
        <div id="performance-panel-index-pipeline" hidden></div>
        <div id="performance-panel-benchmark" hidden></div>
      </section>
    </div>
  </section>`;let h=e.querySelector("#performance-filter-fields"),L=e.querySelector("#performance-filter-form"),X=e.querySelector("#performance-test-flow"),J=e.querySelector("#performance-report"),ve=e.querySelector("#performance-panel-pipeline"),fe=e.querySelector("#performance-panel-index-pipeline"),se=e.querySelector("#performance-meta"),q=e.querySelector("#performance-refresh"),A=[...e.querySelectorAll("[data-performance-tab]")],T={overview:e.querySelector("#performance-panel-overview"),pipeline:e.querySelector("#performance-panel-pipeline"),"index-pipeline":e.querySelector("#performance-panel-index-pipeline"),benchmark:e.querySelector("#performance-panel-benchmark")},K="overview",me=C=>{K=C;for(let O of A){let F=O.dataset.performanceTab===C;O.classList.toggle("is-active",F),F?O.setAttribute("aria-current","page"):O.removeAttribute("aria-current")}for(let[O,F]of Object.entries(T))F&&(F.hidden=O!==C);C==="benchmark"?se.textContent="BENCHMARK \xB7 RAG":C==="pipeline"?se.textContent="PERFORMANCE \xB7 RAG WATERFALL":C==="index-pipeline"?se.textContent="PERFORMANCE \xB7 INDEX PIPELINE":d&&(se.textContent=`PERFORMANCE \xB7 ${c(d.total)} \u7B46`)},H=ho(e,{onNavigate:C=>me(C)});s&&(X.innerHTML=Ts("\u7CFB\u7D71\u6E2C\u8A66\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u6548\u80FD\u5831\u8868\u3001RAG Pipeline \u8207\u7D22\u5F15 Pipeline\uFF1B\u6E2C\u8A66\u6D41\u7A0B\u8207 Benchmark \u57F7\u884C\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002"));let le=()=>{ve&&(ve.innerHTML=lu(p,g,$,v))},Te=async({force:C=!1}={})=>{if(!(a||$)){if(u&&!C){le();return}$=!0,p.length||le();try{let O=await U.performance({keyword:"/api/rag"},1,50);if(a)return;let F=(Array.isArray(O.rows)?O.rows:[]).filter(we=>we.flow&&(String(we.path||"").includes("/api/rag")||String(we.process||"").includes("RAG")));p=F,(!g||!F.some(we=>String(we.id)===String(g)))&&(g=F[0]?String(F[0].id):""),v=null,u=!0}catch(O){if(a)return;v=O}finally{a||($=!1,le())}}},I=()=>{fe&&(fe.innerHTML=gu(b,y,k,M))},ye=async({force:C=!1}={})=>{if(!(a||k)){if(S&&!C){I();return}k=!0,b||I();try{let O=await U.performance({},1,1);if(a)return;b=O.index_pipeline||O.index_stats||null;let F=Array.isArray(b?.runs)?b.runs:[];(!y||!F.some(we=>String(we.id)===String(y)))&&(y=b?.latest?String(b.latest.id):""),M=null,S=!0}catch(O){if(a)return;M=O}finally{a||(k=!1,I())}}},ae=C=>{if(me(C),C==="benchmark"){if(s){let O=T.benchmark;O&&(O.innerHTML=Ts("RAG Benchmark \u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u6548\u80FD\u5831\u8868\u8207 Pipeline\uFF1BBenchmark \u984C\u5EAB\u3001\u6A21\u578B\u8A2D\u5B9A\u3001\u57F7\u884C\u8207\u8A55\u5206\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002"));return}H.show()}C==="pipeline"&&Te(),C==="index-pipeline"&&ye()};e.addEventListener("click",C=>{let O=C.target.closest("[data-performance-tab]");O&&ae(O.dataset.performanceTab||"overview")}),ve?.addEventListener("change",C=>{C.target.matches("[data-rag-trace-select]")&&(g=String(C.target.value||""),le())}),ve?.addEventListener("click",C=>{C.target.closest('[data-action="refresh-rag-waterfall"]')&&Te({force:!0})}),fe?.addEventListener("change",C=>{C.target.matches("[data-index-pipeline-select]")&&(y=String(C.target.value||""),I())}),fe?.addEventListener("click",C=>{C.target.closest('[data-action="refresh-index-pipeline"]')&&ye({force:!0})});let Se=null,Me=[],$e="",Ce=null,be="",V=()=>{h.innerHTML=Zd(i,n)},he=()=>{let C=JSON.stringify({selected:$e,tick:Se?.status==="running"?Math.floor(Date.now()/1e3):0,runs:Me.map(O=>`${O.run_id}:${O.status}`),run:Se?{run_id:Se.run_id,status:Se.status,progress:Se.progress,total_ms:Se.total_ms,steps:(Se.steps||[]).map(O=>`${O.stage}:${O.model}:${O.status}:${O.progress}:${O.duration_ms}`)}:null});C!==be&&(be=C,X.innerHTML=ta(Se,Me,$e))},qe=async()=>{if(!s)try{let C=await U.testRuns(30);if(a)return;Me=Array.isArray(C.runs)?C.runs:[]}catch{if(a)return;Me=[]}},Le=async(C=null)=>{if(!s)try{let O=C&&!$e?C:$e?await U.testRun($e):await U.testRunCurrent();if(a)return;Se=O.run||null,!$e&&Se&&Se.status!=="running"&&!Me.some(F=>F.run_id===Se.run_id)&&await qe(),he()}catch{if(a)return;Se=null,he()}},Re=async(C=null)=>{a||$e||await Le(C)},R=()=>{s||a||Ce||(Ce=_t("test-runs",(C,O)=>Re(O?.snapshot||null)))};X.addEventListener("change",async C=>{C.target.id==="test-run-select"&&($e=String(C.target.value||""),await Le())}),X.addEventListener("click",async C=>{C.target.closest("#test-flow-refresh")&&($e="",await qe(),await Le())});let D=async(C=o,{quiet:O=!1}={})=>{o=Math.max(1,Number(C)||1),n=To();let F=`judgment.performance.result.v1:${JSON.stringify({filters:n,page:o,pageSize:l})}`,we=ds(F,120*1e3);we&&o===1&&(d=we,J.innerHTML=Io(we),se.textContent=`PERFORMANCE \xB7 ${c(we.total)} \u7B46`);let Oe=J.querySelector(".report-card"),Ye=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!Oe?J.setAttribute("aria-busy","true"):(J.removeAttribute("aria-busy"),J.innerHTML=ka({label:"\u6548\u80FD\u5831\u8868"}));let rt=e.querySelector("#performance-run");O||Ne(rt,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Xe=await U.performance(n,o,l);if(a)return;if(d=Xe,ns(F,Xe),Xe.index_pipeline){b=Xe.index_pipeline;let et=Array.isArray(b.runs)?b.runs:[];(!y||!et.some(de=>String(de.id)===String(y)))&&(y=b.latest?String(b.latest.id):""),S=!0,M=null}if(o=Number(Xe.page)||o,l=Number(Xe.page_size)||l,J.removeAttribute("aria-busy"),J.innerHTML=Io(Xe),Ye!==null){let et=J.querySelector("[data-page-size]");et&&(et.value=String(l),et.focus({preventScroll:!0}))}se.textContent=`PERFORMANCE \xB7 ${c(Xe.total)} \u7B46`,se.className="badge badge-neutral badge-mono"}catch(Xe){if(a)return;J.removeAttribute("aria-busy"),J.innerHTML=gn(Xe,{label:"\u6548\u80FD\u5831\u8868"}),P(Xe.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{a||Ne(rt,!1)}},Q=async()=>{let C=ds("judgment.performance.options.v1",3e5);if(C){i=C,V(),U.performanceOptions().then(O=>{i=O,ns("judgment.performance.options.v1",O),V()}).catch(()=>{});return}try{i=await U.performanceOptions(),ns("judgment.performance.options.v1",i)}catch{i={processes:[],modules:[],statuses:[],methods:[],models:[]}}V()};return L.addEventListener("submit",C=>{C.preventDefault(),D(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{n=Er(),o=1,V(),D(1)}),q.addEventListener("click",async()=>{if(K==="pipeline"){Ne(q,!0,"\u6574\u7406\u4E2D\u2026");try{await Te({force:!0})}finally{a||Ne(q,!1)}return}if(K==="index-pipeline"){Ne(q,!0,"\u6574\u7406\u4E2D\u2026");try{await ye({force:!0})}finally{a||Ne(q,!1)}return}if(K==="benchmark"){if(s)return;Ne(q,!0,"\u6574\u7406\u4E2D\u2026");try{await H.refresh()}finally{a||Ne(q,!1)}return}n=To(),q.disabled=!0,Ne(q,!0,"\u6574\u7406\u4E2D\u2026"),await Q(),await qe(),a||await Le(),a||await D(1),a||(q.disabled=!1,Ne(q,!1))}),J.addEventListener("click",async C=>{let O=C.target.closest("[data-action]");if(!O||!d)return;let F=O.dataset.action;if(F==="retry"){D(o);return}if(F==="prev-page"){D(Math.max(1,Number(d.page)-1),{quiet:!0});return}if(F==="next-page"){let we=Math.max(1,Math.ceil(Number(d.total)/Number(d.page_size)));D(Math.min(we,Number(d.page)+1),{quiet:!0});return}if(F==="copy-query"){let we=await Gs(d.query_text||"");P(we?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",we?"ok":"warn");return}if(F==="export-json"){let we=`performance-page-${d.page}.json`;Gt(we,JSON.stringify(bn(d),null,2),"application/json;charset=utf-8"),P(`\u5DF2\u532F\u51FA ${we}`,"ok");return}if(F==="export-csv"){let we=`performance-page-${d.page}.csv`;Gt(we,fn(d),"text/csv;charset=utf-8"),P(`\u5DF2\u532F\u51FA ${we}`,"ok")}}),J.addEventListener("change",C=>{C.target.matches("[data-page-size]")&&(l=Number(C.target.value)||25,Do.includes(l)||(l=25),D(1,{quiet:!0}))}),s?(await Q(),a||await D(1)):(await Promise.allSettled([Q(),qe()]),a||(await Le(),await D(1),R())),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{a=!0,Ce&&Ce(),H.destroy()}}var ku=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5F9E\u696D\u4EBA\u54E1\u6709\u90A3\u4E9B\u898F\u5B9A\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function Su(){return`<div class="answer-placeholder">
    <span class="empty-icon">${m("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function Dr(){return`<section class="card answer-card rag-empty-answer">${Su()}</section>`}function Qo(e,t){return`<div class="rag-turn">
    <div class="rag-user-bubble">${r(e)}</div>
    <section class="card rag-assistant-turn" data-rag-answer>${t}</section>
  </div>`}function xu(e,t){return Promise.race([e,new Promise((s,a)=>{window.setTimeout(()=>a(new Error("pipeline lookup timed out")),t)})])}async function Au(e){if(!e||e.pipeline_flow)return e;let t=String(e._client_request_id||e.request_id||"").trim();if(!t)return e;for(let s=0;s<3;s+=1){try{let a=await xu(U.performance({keyword:t},1,5),1800),n=(Array.isArray(a.rows)?a.rows:[]).find(i=>String(i.request_id||"")===t&&i.flow&&typeof i.flow=="object");if(n)return e.pipeline_flow=n.flow,e}catch{}s<2&&await new Promise(a=>window.setTimeout(a,250))}return e}function Mu(e){return{status:e.status,answer:e.answer,answer_source:e.answer_source,notice:e.notice,citations:Array.isArray(e.citations)?e.citations:[],judgments:Array.isArray(e.judgments)?e.judgments:[],law_sources:Array.isArray(e.law_sources)?e.law_sources:[],matched_terms:Array.isArray(e.matched_terms)?e.matched_terms:[],law_answer:e.law_answer,law_framework:e.law_framework,llm_model:e.llm_model,embedding_model:e.embedding_model,duration_ms:e.duration_ms,show_sources:e.show_sources,pipeline_flow:e.pipeline_flow||null,test_run:e.test_run||null,partial:!1,streaming:!1}}var qu={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"llama-server embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"llama-server LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function Lu(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`llama-server run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`llama-server embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:qu[t]||t||"backend step"}function Jo(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function Vo(e){let t=Number(e);return Number.isFinite(t)?`${c(Math.max(0,Math.round(t)))} ms`:"\u2014"}function Br(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function ju(){return`<div class="rag-process is-open" id="rag-process">
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
  </div>`}function Tu(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),n=performance.now(),i=new Map,o=new Map,l=(u,b,y)=>{let k=u.querySelector(b);k&&(k.textContent=y)},d=u=>{if(u.failed){l(u.element,".rag-process-meta","\u5931\u6557");return}if(u.hasChildren){l(u.element,".rag-process-meta","");return}l(u.element,".rag-process-meta",Vo(u.durationMs))},p=u=>{let b=u-1,y=[...i.values()].reverse();for(let k of y){if(b<0)break;k.depth<=b&&(k.hasChildren||(k.hasChildren=!0,k.element.dataset.hasChildren="true",k.finished&&d(k)),b=k.depth-1)}},g=u=>{if(!s)return null;let b=String(u?.seq??`step-${i.size+1}`),y=i.get(b);if(!y){let k=Math.max(0,Math.min(6,Number(u?.depth)||0));p(k);let M=document.createElement("div");M.className="rag-process-item is-running",M.dataset.processKey=b,M.style.setProperty("--depth",String(k)),M.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(M),y={element:M,depth:k,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(b,y)}return l(y.element,".rag-process-label",Lu(u)),y.element.title=Jo(u),y};return{step:u=>{let b=u?.segment;if(!b)return;o.set(String(b.seq??b.name??o.size),{...b});let y=g(b);if(y){if(u.type==="segment_start"){y.element.classList.add("is-running"),l(y.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(u.type==="segment_end"){let k=b.status==="error";y.element.classList.remove("is-running"),y.element.classList.toggle("is-error",k),y.finished=!0,y.failed=k,y.durationMs=Number(b.duration_ms)||0,d(y),y.element.title=[Jo(b),k&&b.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(u=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(M=>{M.classList.remove("is-running");let S=M.dataset.hasChildren==="true";l(M,".rag-process-meta",S?"":u?"\u5B8C\u6210":"\u4E2D\u65B7")});let b=s?.children.length||i.size,y=Vo(Math.max(0,performance.now()-n));a&&(a.textContent=u?`\u5B8C\u6210 \xB7 ${b} \u6B65 \xB7 ${y}`:`\u5931\u6557 \xB7 ${b} \u6B65`);let k=[...o.values()].filter(M=>M?.name).sort((M,S)=>Number(M.offset_ms||0)-Number(S.offset_ms||0));if(s&&k.length){let M=Math.max(1,...k.map(S=>Number(S.end_offset_ms)||(Number(S.offset_ms)||0)+(Number(S.duration_ms)||0)));s.classList.add("is-waterfall"),s.innerHTML=ea(yn(k),M,"\u5F8C\u7AEF Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B span \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002")}return t.classList.add("is-complete"),Br(t,!1),t.outerHTML},collapse:()=>Br(t,!1)}}function Eu(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${m("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":ju()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${r(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function Wo(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function _n(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let n=String(e||"").trim();return n?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t||n)}"
    data-source-type="${r(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(a||n)}</button>`:""}function Zo(e){let t=String(e?.law_name||"").trim(),s=String(e?.article_no||"").replace(/\s+/g,"");if(!t||!s)return"";let a=(Array.isArray(e?.paragraphs)?e.paragraphs:[]).map(i=>String(i||"").trim()).filter(Boolean),n=`${t}${s}${a.join("\u3001")}`;return`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t)}"
    data-source-type=""
    data-article-no="${r(s)}"
    title="\u9EDE\u64CA\u67E5\u770B ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(n)}</button>`}function el(e){let t=String(e?.citation_status||"");return t==="cited"?"\u7B54\u6848\u5F15\u7528":t==="provided_not_cited"?"\u5DF2\u63D0\u4F9B\u7D66\u6A21\u578B\uFF0C\u7B54\u6848\u672A\u5F15\u7528":t==="reference_only"||e?.used_for_generation===!1?"\u50C5\u4F9B\u53C3\u8003\uFF08\u672A\u9032\u5165\u751F\u6210 prompt\uFF09":e?.used_for_generation===!0?"\u5DF2\u63D0\u4F9B\u7D66\u6A21\u578B":""}function Nu(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map($=>`<span>${r($)}</span>`).join(""),n=el(e),i=n?`<span>${r(n)}</span>`:"",o=(Array.isArray(e.law_citations)?e.law_citations:[]).map($=>Zo($)).filter(Boolean).slice(0,12).join(""),l=o||(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map($=>_n($)).join(""),d=o?'<div class="citation-meta"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':"",p=e.jid?` data-action="open-parquet-judgment"
        data-jid="${r(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${r(e.jid)}"`:"",g=e.pdf_url?`<a class="citation-link" href="${r(e.pdf_url)}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${m("external",11)}</a>`:"";return`<article class="citation">
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
    <div class="citation-links">${g}</div>
  </article>`}function Ru(e){let t=[e.court,e.jdate].filter(Boolean).map(n=>`<span>${r(n)}</span>`).join(""),s=[e.vector_score!==null&&e.vector_score!==void 0?`\u5411\u91CF ${Number(e.vector_score).toFixed(4)}`:"",e.rerank_score!==null&&e.rerank_score!==void 0?`rerank ${Number(e.rerank_score).toFixed(4)}`:""].filter(Boolean).map(n=>`<span>${r(n)}</span>`).join("");return`<article class="citation reference-judgment">
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
  </article>`}function Cu(e,t){let s=[e.law_level,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${r(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${m("external",11)}</a>`:"",n=e.law_key||e.law_name||"",i=n?` data-action="open-law-source"
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
  </article>`}function Pu(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",n=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${r(s)}</span>`,a,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${Ht(e.law_modified_date)}`:"",el(e)].filter(Boolean).map(u=>`<span>${u}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${r(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${r(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${r(o.entity||"")}\u300D\u7684\u5224\u6C7A ${c(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${c(o.law_count||0)} \u6B21</span>
      </div>`:"",d=e.law_key||"",p=e.source_type||"",g=(Array.isArray(e.articles)?e.articles:[]).map(u=>{let b=String(u.article_no||"");return`<div class="law-source-article"${d&&b?` data-action="open-law-source"
        data-law-key="${r(d)}"
        data-source-type="${r(p)}"
        data-article-no="${r(b)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${r(b)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} ${r(b)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${r(u.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${r(u.article_content||"")}</p>
      </div>`}).join(""),$=e.law_url?`<a class="citation-link" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${m("external",11)}</a>`:"",v=e.law_key?` data-action="open-law-source"
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
      ${g}
    </div>
    <div class="citation-links">${$}</div>
  </article>`}function Iu(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function Du(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${r(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",n=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(n==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),d=s.index!=null?`<span class="law-answer-index">[${r(String(s.index))}]</span>`:"",p=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${r(a)}"
            data-source-type="${r(n)}"
            title="\u9EDE\u64CA\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587">${r(i)}</button>`:`<strong>${r(i)}</strong>`,g=Array.isArray(s.articles)?s.articles:[],$=g.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${g.map(v=>{let u=String(v.article_no||"").trim(),b=Iu(v.article_content);return!a||!u?`<div class="law-answer-article is-static">
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
      </div>`}).join("")}</div>`}function Bu(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let n=s.get(String(a));return n?.law_key?_n(a,{lawKey:n.law_key,sourceType:n.source_type||""}):`<span class="chip">${r(a)}</span>`}).join("")}</div>`}function Fu(e){let t=String(e||"");return t==="operational"?"is-ok":t==="standby"?"is-idle":"is-down"}function Ou(e){let t=String(e||"");return t==="operational"?"":t==="standby"?"\u5099\u63F4":t==="disabled"?"\u505C\u7528":t==="not_configured"?"\u672A\u8A2D\u5B9A":"\u96E2\u7DDA"}function Ko(e,{fallback:t=!1}={}){if(!e)return`<span class="rag-model-cell is-empty">
      <span class="rag-model-state is-idle" aria-hidden="true"></span>
      <span class="rag-model-name">\u672A\u8A2D\u5B9A</span>
    </span>`;let s=String(e.label||"").trim()||[e.host,e.model].filter(Boolean).join(":"),a=String(e.status||""),n=!["operational","standby"].includes(a),i=t&&!n?"\u5099\u63F4":Ou(a),o=n?"is-down":t?"is-idle":Fu(a),l=[s,e.url,i].filter(Boolean).join(" \xB7 ");return`<span class="rag-model-cell" title="${r(l)}">
    <span class="rag-model-state ${o}" aria-hidden="true"></span>
    <span class="rag-model-name">${r(s)}</span>
    ${i?`<span class="rag-model-note">${r(i)}</span>`:""}
  </span>`}function Hu(e,t){let s=Array.isArray(e)?e:[],a=[{kind:"chat",label:"Chat"},{kind:"embedding",label:"Embedding"},{kind:"rerank",label:"Rerank"}],n=new Map(s.map(o=>[String(o.kind||""),o])),i=a.map(o=>{let l=n.get(o.kind)||o;return`<tr>
        <td class="rag-model-kind">${r(l.label||o.label)}</td>
        <td>${Ko(l.active)}</td>
        <td>${Ko(l.fallback,{fallback:!0})}</td>
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
  </div>`}function wn({tone:e,title:t,text:s,modelSummary:a=[],refreshing:n=!1}){let i=e==="ok"?"is-ok":e==="warn"?"is-warn":"is-info",o=e==="ok"?"check":e==="warn"?"alert":"info",l=e==="ok"?"badge-ok":e==="warn"?"badge-warn":"badge-info";return`<section class="rag-mode-card ${i}">
    <div class="rag-mode-head">
      <span class="rag-mode-icon" aria-hidden="true">${m(o,14)}</span>
      <div class="rag-mode-copy">
        <strong>${r(t)}</strong>
        <p>${r(s)}</p>
      </div>
      <span class="badge ${l}">3 \u500B\u6A21\u578B</span>
    </div>
    ${Hu(a,n)}
  </section>`}function tl(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.reference_judgments)?e.reference_judgments:[],n=Array.isArray(e.law_sources)?e.law_sources:[],i=e.retrieval||{},o=Array.isArray(e.matched_terms)?e.matched_terms:[],l=e.status||"preview",d=!!e.partial,p=!!e.streaming,g=!!e.rerank_degraded,$=!!e.show_sources||!d,v=e.answer_source==="structured",u=String(e.law_answer||"").trim(),b=e.law_framework||null,y=Array.isArray(b?.rows)?b.rows:[],k=Array.isArray(b?.sources)?b.sources:[],M=y.length>0,S=!!u&&!v&&!M,h=s.filter(V=>V.used_for_generation===!0).length,L=s.some(V=>V.used_for_generation!==void 0),X=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46${L?`\uFF08${h} \u7B46\u9032\u5165 prompt\uFF09`:""}</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((V,he)=>Nu(V,he)).join("")}</div>`:"",J=i.judgment_limit_applied&&a.length?`<div class="reference-judgment-note">
          <span>\u672C\u984C\u4F9D\u984C\u610F\u4E3B\u8981\u8A62\u554F\u6CD5\u898F\u898F\u5B9A\uFF0C\u6545\u5224\u6C7A\u50C5\u986F\u793A ${s.length} \u7B46\u4F5C\u70BA\u53C3\u8003\u3002\u53E6\u6709 ${a.length} \u7B46\u76F8\u95DC\u5224\u6C7A\uFF08${a.some(V=>V.rerank_score!==null&&V.rerank_score!==void 0)?"\u4F9D rerank \u5206\u6578\u6392\u5E8F":"\u4F9D\u6AA2\u7D22\u5206\u6578\u6392\u5E8F"}\uFF09\uFF0C</span>
          <details class="reference-judgments">
            <summary>\u5C55\u958B\u67E5\u770B</summary>
            <div class="citation-list reference-judgment-list">${a.map(V=>Ru(V)).join("")}</div>
          </details>
        </div>`:"",ve=n.length&&!S?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${n.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${n.map((V,he)=>Pu(V,he)).join("")}</div>`:"",fe=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((V,he)=>Cu(V,he)).join("")}</div>`:"",se=$?X+J+ve+fe:"";!se&&!d&&!S&&!M&&(se=`<div class="answer-divider"></div>
      ${ht({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:l==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let q=Bu(o,n),A=e.test_run,T=String(e.llm_model||A?.primary_model||"").trim(),K=String(e.embedding_model||"").trim(),me=[T?`LLM\uFF1A${T}`:"",K?`Embedding\uFF1A${K}`:""].filter(Boolean).join(" \xB7 "),H=p||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",le=M?`<div class="answer-block law-framework-block">
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
              ${y.map(V=>`<tr>
                    <td>${r(V.law_name||"\u2014")}</td>
                    <td class="cell-number">${r(V.article_no||"\u2014")}</td>
                    <td>${r(V.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${k.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${k.map(V=>{let he=String(V?.law_name||V||"").trim(),qe=V&&V.index!==null&&V.index!==void 0?` [${r(V.index)}]`:"";return _n(he,{label:`${he}${qe}`})}).join("")}
              </div>`:""}
      </div>`:"",Te=e.answer_source==="llm"&&T?`<span class="answer-model" title="${r(me)}">${m("brain",11)}${r(T)}</span>`:v?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${m("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",I=p?`${T||"LLM"} \xB7 \u751F\u6210\u4E2D`:Te?T||"structured":"retrieval",ye=A?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${Ke(A.status)}
          <span class="mono">${r(A.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(A.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(A.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${r(A.primary_model||"\u2014")}</span>
          <span>${Number(A.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",ae=e.pipeline_flow&&typeof e.pipeline_flow=="object"?e.pipeline_flow:null,Se=!d&&ae?$n(ae,{serverDurationMs:Number(e.duration_ms)||0,embedded:!0}):"",$e=String(e.answer||"").trim()||(p?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":d?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),Ce=p?" data-partial-answer":"",be=p?" is-streaming":"";return`${le}
      ${S?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${d&&!$?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${n.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${Du(n,u)}</div>
            </div>`:""}
      <div class="answer-block">
        ${S||M?`<div class="answer-block-head">
                <span>${r(H)}</span>
                <span>${r(I)}</span>
              </div>`:""}
        <p class="answer-text${be}"${Ce}>${r($e)}</p>
      </div>
      ${g?'<div class="answer-notice" data-rerank-degraded="true">\u6392\u5E8F\u7CBE\u7C21\u6A21\u5F0F\uFF1A\u672C\u6B21\u90E8\u5206 rerank \u903E\u6642\u6216\u964D\u7D1A\uFF0C\u4F86\u6E90\u53EF\u80FD\u4EE5\u5411\u91CF\u9806\u5E8F\u986F\u793A\u3002</div>':""}
      ${e.notice?`<div class="answer-notice">${r(e.notice)}</div>`:""}
      ${ye}
      ${q}
      ${se}
      ${Se}`}function Yo(e,t,s=""){let a=t.status||"preview",n=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),d=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),p=t.answer_source==="structured",g=t.answer_source==="llm"&&o?`<span class="answer-model" title="${r(d)}">${m("brain",11)}${r(o)}</span>`:p?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${m("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${m("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${Ke(a,n)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${g}
      </div>
      ${s}
    </div>
    <div class="answer-body">${tl(t)}</div>`}function zu(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${m("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${Fe({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function Gu(e){let t=Array.isArray(e.turns)?e.turns:[],s=t.length?t[t.length-1].payload||{}:e.payload||{},a=Array.isArray(s.citations)?s.citations.length:0,n=Array.isArray(s.judgments)?s.judgments.length:0,i=Array.isArray(s.law_sources)?s.law_sources.length:0;return a+n+i}function Uu(e,t,s,a=null){let n=e.id??s,i=Gu(e),o=t.get(String(e.project_id||"")),l=Array.isArray(e.turns)?e.turns:[],d=e.updated_at||e.created_at,p=a!=null&&String(a)===String(n);return`<div class="rag-history-item${e.pinned?" is-pinned":""}${p?" is-active":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${r(String(n))}">
      <span class="history-question">${r(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${r(ua(d))}</span>
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
  </div>`}function Xo(e,t,s){let a=new Map;for(let i of t){let o=String(i.project_id||"");o&&a.set(o,(a.get(o)||0)+1)}let n=[`<button class="rag-project${s?"":" is-active"}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${s?"false":"true"}">
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
  </div>`),n.join("")}async function Qu(e){let t=!1,s=[],a=!1,n=[],i=!1,o="",l=8,d="",p=0,g=null,$=[],v=!1,u=!1,b={embedding:[],llm:[]},y=null,k=null,M=!1;e.innerHTML=`<section class="page rag-page">
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
      <div id="rag-mode-notice">${Fe({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
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
        ${ku.map(w=>`<button class="example-chip" type="button" data-question="${r(w)}">${r(w)}</button>`).join("")}
      </div>
    </header>

    <section class="rag-conversation" id="rag-conversation" aria-live="polite">
      <div class="rag-turns" id="rag-turns">
        ${Dr()}
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
  </section>`;let S=e.querySelector("#rag-form"),h=e.querySelector("#rag-question"),L=e.querySelector("#rag-submit"),X=e.querySelector(".rag-page"),J=e.querySelector("#rag-turns"),ve=e.querySelector("#rag-followup-form"),fe=e.querySelector("#rag-followup-question"),se=e.querySelector("#rag-followup-submit"),q=e.querySelector("#rag-history"),A=e.querySelector("#rag-storage-note"),T=e.querySelector("#rag-clear-history"),K=e.querySelector(".rag-library"),me=e.querySelector("#rag-pinned-body"),H=e.querySelector("#rag-projects-body"),le=e.querySelector("#rag-pinned-count"),Te=e.querySelector("#rag-projects-count"),I=e.querySelector("#rag-recent-count"),ye=e.querySelector("#rag-library-context"),ae=e.querySelector("#rag-test-mode"),Se=e.querySelector("#rag-test-flow"),Me=e.querySelector("#rag-history-menu"),$e=e.querySelector("#rag-judgment-dialog"),Ce=e.querySelector("#rag-law-dialog"),be=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};$e?.addEventListener("close",be),Ce?.addEventListener("close",be);let V=null,he=null,qe,Le=null,Re=null,R=()=>{h.style.height="auto",h.style.height=`${Math.min(h.scrollHeight,220)}px`},D=()=>{fe.style.height="auto",fe.style.height=`${Math.min(fe.scrollHeight,160)}px`},Q=w=>{v=!!w,X.classList.toggle("has-conversation",v)},C=()=>{v&&(ve.hidden=!1,D())},O=()=>{ve.hidden=!0},F=()=>{Me.hidden&&!Re||(Me.hidden=!0,Me.innerHTML="",Re&&Re.setAttribute("aria-expanded","false"),Le=null,Re=null)},we=(w,G)=>{let W=J.querySelector(".rag-empty-answer");W&&W.remove(),J.insertAdjacentHTML("beforeend",Qo(w,G));let ue=J.lastElementChild,je=ue?.querySelector("[data-rag-answer]");return window.requestAnimationFrame(()=>{ue?.scrollIntoView({behavior:"smooth",block:"start"})}),{turnElement:ue,answerElement:je}},Oe=()=>{J.innerHTML=$.length?$.map(w=>Qo(w.question,Yo(w.question,w.payload||{},""))).join(""):Dr()},Ye=w=>{let G=Array.isArray(w.turns)?w.turns:[];return G.length?(p+=1,es(),Ft(null),g=w.id??null,$=G.map(W=>({...W})),d=$[$.length-1]?.question||"",Q(!0),Oe(),C(),st(),Ne(L,!1),Ne(se,!1),window.setTimeout(()=>{ve.scrollIntoView({behavior:"smooth",block:"end"})},50),!0):!1},st=()=>{if(t)return;if(F(),!a){q.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',me.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',le.textContent="0",I.textContent="0",i&&(H.innerHTML=Xo(n,[],o));return}let w=n.find(Ze=>String(Ze.id)===o)||null;o&&!w&&(o="");let G=new Map(n.map(Ze=>[String(Ze.id),Ze])),W=s.filter(Ze=>!!Ze.pinned),ue=s.filter(Ze=>!Ze.pinned),je=o?ue.filter(Ze=>String(Ze.project_id||"")===o):ue,He=je.slice(0,l),ot=(Ze,f)=>Uu(Ze,G,f,g);me.innerHTML=W.length?W.map(ot).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',H.innerHTML=Xo(n,s,o),q.innerHTML=He.length?He.map(ot).join(""):`<div class="rag-library-empty">${o?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u672A\u91D8\u9078\u7684\u9805\u76EE\u3002":W.length?"\u6700\u8FD1\u7684\u9805\u76EE\u90FD\u5DF2\u91D8\u9078\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,je.length>l&&q.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${c(je.length-l)} \u7B46</button>`),le.textContent=String(W.length),Te.textContent=String(n.length),I.textContent=String(je.length),w?(ye.hidden=!1,ye.innerHTML=`<span>${m("folder",12)}<strong>${r(w.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${m("x",12)}</button>`):(ye.hidden=!0,ye.innerHTML="")},rt=async()=>{try{let w=await Ss("rag.projects",[]);n=Array.isArray(w)?w.map(G=>({id:String(G?.id||""),name:String(G?.name||"").trim()})).filter(G=>G.id&&G.name):[]}catch{n=[]}i=!0,t||st()},Xe=w=>{o=String(w||""),l=8,st()},et=()=>{let w=H.querySelector('[data-rag-form="project"]');w&&(w.hidden=!1,w.querySelector("input")?.focus())},de=()=>{let w=H.querySelector('[data-rag-form="project"]');w&&(w.hidden=!0,w.reset())},tt=async w=>{let G=w.elements.project_name,W=String(G?.value||"").trim();if(!W){P("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),G?.focus();return}if(n.some(je=>je.name.toLowerCase()===W.toLowerCase())){P("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),G?.focus();return}let ue=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;n=[...n,{id:ue,name:W.slice(0,60),created_at:new Date().toISOString()}],o=ue,l=8,await wa("rag.projects",n),st(),P(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${W}\u300D\u3002`,"ok")},Ue=async w=>{let G=s.find(je=>String(je.id)===String(w));if(!G)return;let W=!G.pinned;if(!await ya(G.id,{pinned:W})){P("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}G.pinned=W,st(),P(W?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},ct=()=>{p+=1,es(),Ft(null),d="",g=null,$=[],Q(!1),O(),J.innerHTML=Dr(),h.value="",R(),fe.value="",D(),Ne(L,!1),Ne(se,!1),st(),$e?.open&&$e.close(),Ce?.open&&Ce.close(),h.focus(),window.scrollTo({top:0,behavior:"smooth"})},gt=w=>{if(!w||Me.hidden)return;let G=w.getBoundingClientRect(),W=Me.getBoundingClientRect(),ue=6,je=G.bottom+ue;je+W.height>window.innerHeight-8&&(je=Math.max(8,G.top-W.height-ue));let He=G.right-W.width;He=Math.max(8,Math.min(He,window.innerWidth-W.width-8)),Me.style.left=`${Math.round(He)}px`,Me.style.top=`${Math.round(je)}px`},ne=w=>{Me.innerHTML=`
      <button type="button" role="menuitem" data-menu-action="rename">${m("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${m("pin",13)}<span>${w.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${m("link",13)}<span>\u5206\u4EAB</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${m("trash",13)}<span>\u522A\u9664</span></button>`},xe=w=>{let G=String(w.project_id||""),W=[{id:"",name:"\u672A\u5206\u985E"},...n.map(ue=>({id:String(ue.id),name:ue.name}))];Me.innerHTML=`
      <div class="rag-history-menu-head">${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${W.map(ue=>`<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${r(ue.id)}">
            <span class="rag-history-menu-check">${G===ue.id?m("check",12):""}</span>
            <span>${r(ue.name)}</span>
          </button>`).join("")}
      ${n.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${m("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},We=(w,G)=>{let W=s.find(ue=>String(ue.id)===String(G));W&&(F(),Le=String(W.id),Re=w,ne(W),Me.hidden=!1,w.setAttribute("aria-expanded","true"),gt(w))},ze=async w=>{let G=window.prompt("\u91CD\u65B0\u547D\u540D\u5C0D\u8A71",w.title||"");if(G===null)return;let W=G.trim();if(!W){P("\u540D\u7A31\u4E0D\u80FD\u7A7A\u767D\u3002","warn");return}if(W===w.title)return;if(!await ya(w.id,{title:W})){P("\u91CD\u65B0\u547D\u540D\u5931\u6557\u3002","danger");return}w.title=W,st(),P("\u5C0D\u8A71\u5DF2\u91CD\u65B0\u547D\u540D\u3002","ok")},Tt=async w=>{let G=Array.isArray(w.turns)?w.turns:[],W=[`# ${w.title||"\u672A\u547D\u540D\u5C0D\u8A71"}`,""];if(G.length)for(let je of G){W.push("## \u554F\u984C","",je.question||"",""),W.push("## \u56DE\u7B54","",je.payload?.answer||"\uFF08\u6C92\u6709\u56DE\u7B54\u5167\u5BB9\uFF09","");let He=Array.isArray(je.payload?.law_sources)?je.payload.law_sources.map(ot=>ot.law_name).filter(Boolean):[];He.length&&W.push(`\u5F15\u7528\uFF1A${[...new Set(He)].join("\u3001")}`,"")}else W.push(w.title||"");let ue=await Gs(W.join(`
`));P(ue?"\u5C0D\u8A71\u5167\u5BB9\u5DF2\u8907\u88FD\uFF0C\u53EF\u76F4\u63A5\u8CBC\u4E0A\u5206\u4EAB\u3002":"\u7121\u6CD5\u8907\u88FD\u5C0D\u8A71\u5167\u5BB9\u3002",ue?"ok":"warn")},ft=async w=>{if(!window.confirm(`\u522A\u9664\u5C0D\u8A71\u300C${w.title||"\u672A\u547D\u540D\u5C0D\u8A71"}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002`))return;if(!await Xi(w.id)){P("\u522A\u9664\u5931\u6557\u3002","danger");return}let W=g!==null&&String(g)===String(w.id);s=s.filter(ue=>String(ue.id)!==String(w.id)),W?ct():st(),P("\u5C0D\u8A71\u5DF2\u522A\u9664\u3002","ok")},x=async(w,G)=>{if(!await ya(w.id,{project_id:G})){P("\u79FB\u81F3\u5C08\u6848\u5931\u6557\u3002","danger");return}w.project_id=G;let ue=n.find(je=>String(je.id)===String(G));st(),P(ue?`\u5DF2\u79FB\u81F3\u5C08\u6848\u300C${ue.name}\u300D\u3002`:"\u5DF2\u79FB\u51FA\u5C08\u6848\u3002","ok")},j=async w=>{let G=w.target.closest("[data-menu-action]");if(!G)return;let W=s.find(je=>String(je.id)===Le);if(!W){F();return}let ue=G.dataset.menuAction;ue==="rename"?(F(),await ze(W)):ue==="toggle-pin"?(F(),await Ue(W.id)):ue==="share"?(F(),await Tt(W)):ue==="move"?(xe(W),gt(Re)):ue==="assign-project"?(F(),await x(W,G.dataset.projectId||"")):ue==="back"?(ne(W),gt(Re)):ue==="delete"&&(F(),await ft(W))},N=w=>{Me.hidden||(typeof w.composedPath=="function"?w.composedPath():[]).includes(Me)||Me.contains(w.target)||w.target.closest('[data-rag-action="open-history-menu"]')||F()},B=w=>{w.key==="Escape"&&F()},Y=w=>{w.target instanceof Node&&Me.contains(w.target)||F()},re=async()=>{try{if(s=await rn({limit:120}),t)return;a=!0,st(),A.textContent=va()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;s=[],a=!0,st(),q.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},pe=async(w,G,W,ue)=>{let je=$,He=g;je.push({question:w,asked_at:new Date().toISOString(),payload:Mu(G)});let ot=Array.isArray(G.citations)?G.citations:[],Ze=Array.isArray(G.judgments)?G.judgments:[],f={question:w,status:G.status,citations:ot.map(ee=>ee.law_name),judgments:Ze.map(ee=>ee.jid)},_=`${G.status||"preview"} \xB7 ${je.length} \u8F2A`,E=new Date().toISOString(),ie=ee=>{ue===p&&(g=ee)};if(He){if(!await ya(He,{turns:je,detail:_,payload:f,updated_at:E})){let Z=await $a({kind:"rag",title:je[0]?.question||w,detail:_,project_id:W,turns:je,payload:f,updated_at:E});ie(Z)}}else{let ee=await $a({kind:"rag",title:je[0]?.question||w,detail:_,project_id:W,turns:je,payload:f,updated_at:E});ie(ee)}await re()},Pe=()=>{let w=e.querySelector("#rag-mode-notice");if(!w)return;if(Ut()){w.innerHTML=Fe({tone:"info",title:"\u5C55\u793A\u6A21\u5F0F",text:"\u53EF\u76F4\u63A5\u8F38\u5165\u6CD5\u5F8B\u554F\u984C\uFF1B\u56DE\u7B54\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u6CD5\u898F\u8207\u5224\u6C7A\u5F15\u7528\u3002"});return}let G=Array.isArray(y?.model_summary)?y.model_summary:[];if(!y){if(!k)return;w.innerHTML=wn({tone:"warn",title:"\u7121\u6CD5\u53D6\u5F97 RAG \u670D\u52D9\u72C0\u614B",text:k.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u524D\u5F80\u7CFB\u7D71\u72C0\u614B\u9801\u67E5\u770B\u3002",modelSummary:G,refreshing:M});return}let W=y.data||{},ue=(y.services||[]).find(ot=>ot.id==="rag"),je=Number(W.judgment_indexed_count||0),He=Number(W.judgment_count||0);ue?.status==="operational"?w.innerHTML=wn({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${c(je)} / ${c(He)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`,modelSummary:G,refreshing:M}):ue?.status==="degraded"?w.innerHTML=wn({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:ue.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002",modelSummary:G,refreshing:M}):w.innerHTML=wn({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:ue?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002",modelSummary:G,refreshing:M})},De=async()=>{if(Ut()){y=null,k=null,Pe();return}try{let w=await U.status();if(t)return;y=w,k=null}catch(w){if(t)return;y=null,k=w}Pe()},Ie=async()=>{if(!M){M=!0,Pe();try{let w=await U.status();if(t)return;y=w,k=null,P("\u5DF2\u66F4\u65B0\u6A21\u578B\u72C0\u614B\u3002","ok",2500)}catch(w){P(w.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u3002","danger",6e3)}finally{M=!1,t||Pe()}}},Qe=()=>{if(!ae)return;if(!u){ae.innerHTML="";return}let w=Array.isArray(b.embedding)?b.embedding.length:0,G=Array.isArray(b.llm)?b.llm.length:0;ae.innerHTML=Fe({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${w} \u500B embedding \u8207 ${G} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},at=async()=>{if(Ut()){u=!1,Qe();return}try{let w=await U.testMode();if(t)return;u=!!w.enabled,b=w.models||{embedding:[],llm:[]},Qe()}catch{if(t)return;u=!1,Qe()}},it=w=>{u=!!w.detail?.enabled,b=w.detail?.models||{embedding:[],llm:[]},Qe()};window.addEventListener("judgment:test-mode",it);let Ft=w=>{if(!Se)return;he=w||null;let G=JSON.stringify(w?{run_id:w.run_id,status:w.status,progress:w.progress,total_ms:w.total_ms,stage:w.stage,answer:w.answer||"",steps:(w.steps||[]).map(W=>`${W.stage}:${W.model}:${W.status}:${W.progress}:${W.duration_ms}`)}:null);G!==qe&&(qe=G,Se.innerHTML=w?ta(w,[],"",{showHistory:!1}):"")},es=()=>{V&&(V(),V=null)},Ta=async(w=null)=>{if(!t)try{let G=w||await U.testRunCurrent();if(t)return;let W=G.run;W&&W.status==="running"&&Ft(W)}catch{}},na=()=>{t||V||(Ta(),V=_t("test-runs",(w,G)=>Ta(G?.snapshot||null)))},Rn=async w=>{if(!w){Ft(null);return}try{let G=await U.testRun(w);if(t)return;Ft(G.run||null)}catch{t||P("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},Ea=async()=>{if(u)try{let w=await U.testRunCurrent();if(t)return;w.run?.status==="running"&&(Ft(w.run),na())}catch{}},Ms=0,os=(w,G)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${r(w)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${m("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${G}</div>`,At=w=>{let G=(Array.isArray(w.citations)?w.citations:[]).map(ot=>Zo(ot)).filter(Boolean).join(""),W=G||(Array.isArray(w.matched_laws)?w.matched_laws:[]).map(ot=>_n(ot)).join(""),ue=[w.court,w.jdate,w.title?`\u6848\u7531\uFF1A${w.title}`:"",w.full_text_length?`${c(w.full_text_length)} \u5B57`:"",w.citation_count?`\u5F15\u7528 ${c(w.citation_count)} \u7B46`:""].filter(Boolean).map(ot=>`<span>${r(ot)}</span>`).join(""),je=w.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${r(String(w.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",He=w.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(w.pdf_url)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return os(w.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${r(w.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${ue}
      </div>
      ${G?'<div class="citation-meta" style="margin-top:8px"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':""}
      ${W?`<div class="chips" style="margin:8px 0 10px">${W}</div>`:""}
      <div class="judgment-dialog-source">${je}</div>
      <pre class="judgment-dialog-text">${r(w.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${He}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},Os=async w=>{if(!$e||!w)return;let G=++Ms;$e.open||$e.showModal(),be(),$e.innerHTML=os("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${r(w)}\u2026</span>
      </div>`);try{let W=await U.judgmentDetail(w,"parquet");if(t||G!==Ms)return;$e.innerHTML=At(W)}catch(W){if(t||G!==Ms)return;$e.innerHTML=os("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(W.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},ra=0,Hs=(w,G)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${r(w)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${m("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${G}</div>`,ia=(w,G="")=>{let W=String(w.selected_article_no||G||"").trim(),ue=!!W,je=Array.isArray(w.articles)?w.articles:[],He=je.map(ce=>{let Ae=String(ce.article_content||"").trim();return Ae?ce.article_type==="C"?`<div class="law-chapter">${r(Ae)}</div>`:`<article class="law-article" data-article-no="${r(Wo(ce.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${r(ce.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${r(Ae)}</div>
        </article>`:""}).join(""),ot=(Array.isArray(w.warnings)?w.warnings:[]).map(ce=>r(ce)).join("<br />"),Ze=w.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",f=w.meta?.articles_source,_=f==="parquet"?"Parquet \u689D\u6587":f==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",E=w.meta?.snapshot||"",ie=[w.law_level,w.law_category,w.article_count?`${c(w.article_count)} \u689D`:"",w.law_modified_date?`\u7570\u52D5 ${Ht(w.law_modified_date)}`:""].filter(Boolean).map(ce=>`<span>${r(ce)}</span>`).join(""),ee=w.law_url?`<a class="btn btn-secondary btn-sm" href="${r(w.law_url)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",Z=!ue&&w.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${r(w.law_histories)}</div>
        </details>`:"",ke=ue?`<span class="badge badge-mono">${r(W)}</span>`:"",z=!ue&&je.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",te=ue?`${w.law_name||w.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${W}`:w.law_name||w.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return Hs(te,`<div class="judgment-dialog-meta">
        <span class="badge ${w.source_type==="order"?"badge-warn":"badge-info"}">${r(Ze)}</span>
        ${ke}
        ${ie}
      </div>
      <div class="judgment-dialog-source">${r([_,E].filter(Boolean).join(" \xB7 "))}</div>
      ${ot?`<div class="law-dialog-warning">${ot}</div>`:""}
      ${Z}
      ${z}
      <div class="law-dialog-articles">${He||`<div class="report-empty-inline">${ue?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${ee}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},Et=(w,G)=>{let W=w?.querySelector(`#${G}`),ue=Wo(W?.value||"");if(!ue){P("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),W?.focus();return}let je=[...w?.querySelectorAll("[data-article-no]")||[]].find(He=>He.dataset.articleNo===ue);if(!je){P(`\u627E\u4E0D\u5230\u7B2C ${ue} \u689D\u3002`,"warn");return}je.scrollIntoView({behavior:"instant",block:"center"}),je.classList.add("is-jump-target"),window.setTimeout(()=>je.classList.remove("is-jump-target"),2400)},oa=async(w,G="",W="")=>{if(!Ce||!w)return;let ue=++ra;Ce.open||Ce.showModal(),be(),Ce.innerHTML=Hs(W?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${r([w,W].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let je=await U.lawDetail(w,G,"",W);if(t||ue!==ra)return;Ce.innerHTML=ia(je,W)}catch(je){if(t||ue!==ra)return;Ce.innerHTML=Hs("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(je.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};Ce?.addEventListener("click",w=>{let G=w.target.closest('[data-action="jump-law-article"]');if(G){Et(Ce,G.dataset.jumpInput||"rag-law-article-jump");return}if(w.target.closest('[data-action="close-law-source"]')){Ce.close();return}let W=Ce.getBoundingClientRect();(w.clientX<W.left||w.clientX>W.right||w.clientY<W.top||w.clientY>W.bottom)&&Ce.close()}),Ce?.addEventListener("keydown",w=>{!w.target.matches(".law-jump-input")||w.key!=="Enter"||(w.preventDefault(),Et(Ce,w.target.id))}),$e?.addEventListener("click",w=>{let G=w.target.closest('[data-action="open-law-source"]');if(G){oa(G.dataset.lawKey||"",G.dataset.sourceType||"",G.dataset.articleNo||"");return}if(w.target.closest('[data-action="close-parquet-judgment"]')){$e.close();return}let W=$e.getBoundingClientRect();(w.clientX<W.left||w.clientX>W.right||w.clientY<W.top||w.clientY>W.bottom)&&$e.close()}),J.addEventListener("click",w=>{let G=w.target.closest(".rag-process-toggle");if(G){let ue=G.closest(".rag-process"),je=G.getAttribute("aria-expanded")==="true";Br(ue,!je);return}let W=w.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(W){if(W.dataset.action==="open-law-source"){oa(W.dataset.lawKey||"",W.dataset.sourceType||"",W.dataset.articleNo||"");return}Os(W.dataset.jid||"")}}),J.addEventListener("keydown",w=>{if(w.key!=="Enter"&&w.key!==" ")return;let G=w.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!G||G.closest("a, button"))){if(w.preventDefault(),G.dataset.action==="open-law-source"){oa(G.dataset.lawKey||"",G.dataset.sourceType||"",G.dataset.articleNo||"");return}Os(G.dataset.jid||"")}});let zs=async(w,{fresh:G=!1,source:W="hero"}={})=>{let ue=w.trim();if(!ue){P("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),(W==="followup"?fe:h).focus();return}(G||!v)&&(g=null,$=[],J.innerHTML="",st());let je=++p,He=()=>t||je!==p,ot=o;d=ue,Q(!0),O(),W==="followup"?(fe.value="",D()):(h.value="",R());let{answerElement:Ze}=we(ue,Eu(ue,u)),f=u?null:Tu(Ze);u?(Ft(null),na()):(es(),Ft(null)),Ne(L,!0,"\u6AA2\u7D22\u4E2D\u2026"),Ne(se,!0,"\u6AA2\u7D22\u4E2D\u2026");let _=null,E="",ie=z=>{if(He()||!z?.partial)return;let te=Ze.querySelector(".answer-body");if(!te)return;_=z,E=String(z.answer||""),te.innerHTML=tl(z),f?.collapse?.();let ce=Ze.querySelector(".answer-head-title");ce&&(ce.textContent=z.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},ee=z=>{if(He()||!z||!_?.streaming)return;E+=z;let te=Ze.querySelector("[data-partial-answer]");te&&(te.textContent=E)},Z=()=>{if(He()||!_?.streaming)return;E="";let z=Ze.querySelector("[data-partial-answer]");z&&(z.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")},ke=z=>{if(He())return;let te=Ze.querySelector(".answer-body");if(!te)return;let ce=te.querySelector("[data-summary-queue]");ce||(ce=document.createElement("div"),ce.className="answer-notice",ce.dataset.summaryQueue="true",te.appendChild(ce));let Ae=Number(z.position||0),Be=Number(z.eta_s||0),nt=z.lane==="summary"?"\u6458\u8981":"\u6AA2\u7D22";ce.textContent=`${nt}\u6392\u968A\u4E2D\uFF1A\u524D\u9762 ${Ae} \u4F4D\uFF0C\u9810\u4F30\u7D04 ${Math.round(Be)} \u79D2\u3002`};try{let z=u?await U.rag(ue,{testMode:u}):await U.ragStream(ue,{onStep:ce=>{He()||f?.step(ce)},onPartial:ie,onQueued:ke,onToken:ee,onTokenReset:Z});if(He())return;es();let te=f?.finish(!0)||"";if(Ze.innerHTML=Yo(ue,z,te),z.pipeline_flow||Au(z).then(()=>{if(He()||!z.pipeline_flow)return;let ce=Ze.querySelector(".answer-body");if(!ce||ce.querySelector(".rag-wf-card"))return;let Ae=$n(z.pipeline_flow,{serverDurationMs:Number(z.duration_ms)||0,embedded:!0});Ae&&ce.insertAdjacentHTML("beforeend",Ae)}),z.test_run?.run_id?await Rn(z.test_run.run_id):Ft(null),await pe(ue,z,ot,je),He())return;C()}catch(z){if(He())return;es();let te=f?.finish(!1)||"";Ze.innerHTML=zu(z,te),C(),P(z.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{He()||(es(),Ne(L,!1),Ne(se,!1))}};S.addEventListener("submit",w=>{w.preventDefault(),zs(h.value,{fresh:!0,source:"hero"})}),ve.addEventListener("submit",w=>{w.preventDefault(),zs(fe.value,{fresh:!1,source:"followup"})}),h.addEventListener("input",R),h.addEventListener("keydown",w=>{w.key==="Enter"&&!w.shiftKey&&!w.isComposing&&(w.preventDefault(),S.requestSubmit())}),fe.addEventListener("input",D),fe.addEventListener("keydown",w=>{w.key==="Enter"&&!w.shiftKey&&!w.isComposing&&(w.preventDefault(),ve.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",w=>{let G=w.target.closest("[data-question]");G&&(h.value=G.dataset.question,R(),S.requestSubmit())}),e.addEventListener("click",async w=>{w.target.closest('[data-rag-action="refresh-models"]')&&await Ie()}),K.addEventListener("click",async w=>{let G=w.target.closest("[data-rag-toggle]");if(G){let Ze=G.closest(".rag-library-section").classList.toggle("is-collapsed");G.setAttribute("aria-expanded",String(!Ze));return}let W=w.target.closest("[data-rag-action]"),ue=W?.dataset.ragAction||"";if(ue==="new-chat"){ct();return}if(ue==="open-history-menu"){We(W,W.dataset.historyId);return}if(ue==="toggle-pin"){await Ue(W.dataset.historyId);return}if(ue==="select-project"){Xe(W.dataset.projectId||"");return}if(ue==="show-project-form"){et();return}if(ue==="cancel-project"){de();return}if(ue==="more-recent"){l+=12,st();return}if(ue==="clear-project"){Xe("");return}let je=w.target.closest("[data-history-open]");if(!je)return;let He=s.find(ot=>String(ot.id)===String(je.dataset.historyId));He&&(o=String(He.project_id||""),st(),!Ye(He)&&(g=null,$=[],zs(He.title,{fresh:!0,source:"history"})))}),K.addEventListener("submit",async w=>{let G=w.target.closest('[data-rag-form="project"]');G&&(w.preventDefault(),await tt(G))}),Me.addEventListener("click",j),document.addEventListener("click",N),document.addEventListener("keydown",B),window.addEventListener("scroll",Y,{capture:!0,passive:!0}),window.addEventListener("resize",F),T.addEventListener("click",async()=>{if(!s.length){P("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await Zi(),await re(),P("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),R(),await Promise.allSettled([De(),re(),rt(),at()]),await Ea();let Wt="";try{Wt=window.sessionStorage.getItem("judgment.pending_question")||"",window.sessionStorage.removeItem("judgment.pending_question")}catch{Wt=""}return!Wt&&typeof window.__judgmentPendingQuestion=="string"&&(Wt=window.__judgmentPendingQuestion),delete window.__judgmentPendingQuestion,Wt=String(Wt||"").trim().slice(0,500),Wt&&h&&(h.value=Wt,R(),window.setTimeout(()=>{t||zs(Wt,{fresh:!0,source:"home"})},40)),()=>{t=!0,es(),F(),document.removeEventListener("click",N),document.removeEventListener("keydown",B),window.removeEventListener("scroll",Y,{capture:!0}),window.removeEventListener("resize",F),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",it),d&&J.setAttribute("data-last-question",d)}}var Yr={};ls(Yr,{render:()=>Vp});var Hr=new Set(["legal_index_versions","judgment_import","index_versions"]),sl=new Map,zr=new Set,Gr=new Set;function xa(e){let t=Number(e);if(!Number.isFinite(t)||t<0)return"\u2014";if(t<60)return`${Math.round(t)} \u79D2`;let s=Math.floor(t/60),a=Math.round(t%60);if(s<60)return`${s} \u5206 ${a} \u79D2`;let n=Math.floor(s/60),i=s%60;if(n<24)return`${n} \u5C0F\u6642 ${i} \u5206`;let o=Math.floor(n/24),l=n%24;return`${o} \u5929 ${l} \u5C0F\u6642`}function Or(e){return String(e||"").trim().replace(/:latest$/,"")}var Ju={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},partial:{label:"\u90E8\u5206\u5B8C\u6210",tone:"warn"},update:{label:"\u66F4\u65B0",tone:"warn"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"},provided:{label:"\u5916\u90E8\u63D0\u4F9B",tone:"info"}},Ur=["download","parquet","postgres","qdrant"],Vu={download:"\u4E0B\u8F09",parquet:"Parquet",postgres:"PostgreSQL",qdrant:"Qdrant"},Wu={judgment:{download:["download"],parquet:["raw_parquet","extract"],postgres:["postgres"],qdrant:["qdrant"]},law:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]},order:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]}},al={complete:"\u5B8C\u6210",incomplete:"\u672A\u5B8C\u6210",pending:"\u5F85\u66F4\u65B0",processing:"\u8655\u7406\u4E2D",empty:"\u7121\u8CC7\u6599",not_applicable:"\u5DF2\u53D6\u4EE3"},nl={complete:"is-green",incomplete:"is-red",pending:"is-pending",processing:"is-gray",empty:"is-empty",not_applicable:"is-empty"};var Qt=new Map,Jt="",Cs="",rl={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},il={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Ku={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"};var ol={law_download:"law",order_download:"order",judgment_download:"judgment"},ll={law_download:"\u6CD5\u898F\u4E0B\u8F09",order_download:"\u547D\u4EE4\u4E0B\u8F09",judgment_download:"\u5224\u6C7A\u4E0B\u8F09"},Yu={law_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",order_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",judgment_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u5224\u6C7A RAR \u55CE\uFF1F\uFF08\u4E0D\u6703\u81EA\u52D5\u532F\u5165 PostgreSQL \u6216\u5EFA\u7ACB Qdrant \u7D22\u5F15\uFF09"},Xu={law_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u6CD5\u898F RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",order_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u547D\u4EE4 RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",judgment_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u53EA\u4E0B\u8F09\u5224\u6C7A RAR\u3002PostgreSQL\uFF0FParquet \u532F\u5165\u8207 Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\u300C\u5224\u6C7A\u532F\u5165\u300D\u6216\u5B8C\u6574\u8CC7\u6599\u66F4\u65B0\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_import:"\u6D41\u7A0B\u7BC4\u570D\uFF1ARAR \u2192 \u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD \u2192 \u91D1\u878D\u6CD5\u898F\u7BE9\u9078 \u2192 PostgreSQL\u3002Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_parquet:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5F9E PostgreSQL \u532F\u51FA\u67E5\u8A62\u7528 Parquet \u5FEB\u7167\uFF1B\u4E0D\u5BEB\u5165 Qdrant\uFF0FIndexedDB\u3002",index_versions:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5EFA\u7ACB\u4E26\u9A57\u8B49\u65B0\u7684 Qdrant collection\uFF0C\u5B8C\u6210\u5F8C\u539F\u5B50\u5207\u63DB alias\uFF1BIndexedDB \u4E0D\u53C3\u8207\u3002"};function As(e){return Ju[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Bt(e,t){let s=As(e);return`<span class="badge ${rl[s.tone]||rl.idle}"><span class="status-dot ${il[s.tone]||il.idle}"></span>${r(t||s.label)}</span>`}function yt(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function cl(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":c(e)}function ml(e){return e&&e.color?String(e.color):"var(--accent)"}function Qr(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return["skipped","pending","idle"].includes(e.status)?"\u2014":s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${Ee(s)} / ${Ee(a)}`:Ee(s):a?`${c(s)} / ${c(a)} ${t}`:`${c(s)} ${t}`}function Ps(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${r(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function Zu(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},n=e.raw_backups||{},i=n.totals||{},o=e.state||{},l=e.capabilities||{},d=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",p=t.status==="operational",g=s.status==="operational",$=a.available!==!1,v=n.available!==!1,u=g?`${c(s.indexed)} / ${c(s.total)}`:Bt(s.status||"unavailable"),b=g?`${yt(s.percent)} \xB7 \u5C1A\u9918 ${c(s.remaining)} \u7B46`:r(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),y=$?`${c(a.unprocessed)} / ${c(a.total)}`:Bt("unavailable"),k=$?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${Ee(a.unprocessed_bytes)} \u5F85\u8655\u7406`:r(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${rs(mp(e))}
    ${Ps("\u8655\u7406\u72C0\u614B",Bt(e.status||"unknown"),`${r(d)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${Ps("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",r(y),k)}
    ${Ps("\u539F\u59CB\u8CC7\u6599\u5099\u4EFD",v?`${c(n.count)} \u6A94`:Bt("unavailable"),v?`\u5171 ${c(i.row_count)} \u7B46 \xB7 ${Ee(i.compressed_bytes)}`:r(n.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB\u8CC7\u6599\u5099\u4EFD\u3002"))}
    ${Ps("PostgreSQL \u5224\u6C7A",p?c(t.judgment_count):Bt("unavailable"),p?`\u6CD5\u898F ${cl(t.law_count)} \xB7 \u547D\u4EE4 ${cl(t.order_count)}`:r(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${Ps("Qdrant \u7D22\u5F15",u,b)}
    ${Ps("\u72C0\u614B\u6A94",Bt(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${r(_e(o.updated_at))}`:r(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${Ps("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?r(l.start_blocked_reason):`\u672A\u8655\u7406 ${c(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${c(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${c(l.external_processes)} \u500B`:""}`)}
  </div>`}function ep(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let n=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${r(o.color||"var(--accent)")}" title="${r(`${o.label} ${ge(o.duration_ms)} (${yt(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${r(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${r(o.label)}</span>
        <span class="mono">${ge(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${yt(o.percent)}</span>
        ${Bt(o.status)}
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
  </section>`}function tp(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let n=t.map(i=>{let o=s.get(i.branch)||Ku[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${r(o)}</span>
          <strong>${r(i.title||"\u8655\u7406")}</strong>
          ${Bt(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${r(_e(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?ge(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${r(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${n}</div></div>
  </section>`}function sp(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>Fe({tone:s.tone||"info",title:s.title,text:r(s.message||"")})).join("")}</div>`:""}function gl(e,t){if(e==="law"||e==="order")return t==="qdrant"?"legal_index_versions":`${e}_download`;if(e==="judgment"){if(t==="download")return"judgment_download";if(t==="parquet"||t==="postgres")return"judgment_import";if(t==="qdrant")return"index_versions"}return""}function Jr({month:e,year:t,monthNo:s,stageOrder:a,stageLabels:n,stageStatuses:i,overall:o,active:l,processing:d=!1,workflowForStage:p,stageProgress:g=null,variant:$="legacy"}){let v=i||{},u=$==="index"||$==="import",b=String(e?.month||`${t}${String(s).padStart(2,"0")}`),y=e?.month_label||`${t}-${String(s).padStart(2,"0")}`,k=q=>u&&q==="processing"?"\u57F7\u884C\u4E2D":al[q]||al.empty,M=q=>{let A=v[q]||"empty";if(!(A==="processing"||q==="qdrant"&&A==="incomplete"))return null;let K;if(typeof g=="function")K=g(q,b,A);else if($==="import"&&g&&typeof g=="object")K=g[q];else return null;let me=Number(K);return Number.isFinite(me)?Math.max(0,Math.min(100,me)):null},S=a.map(q=>{let A=v[q]||"empty",T=M(q),K=q==="qdrant"&&A==="incomplete"&&T!==null&&T>0,me=K?"\u5DF2\u8655\u7406":k(A),H=!K&&T!==null&&T>0?` ${T.toFixed(1)}%`:"";return`${n[q]||q}\uFF1A${me}${H}`}).join(" \xB7 "),h=(e?.versions||[]).map(q=>q.version_code).filter(Boolean),L=[...new Set([...e?.files||[],...e?.local_files||[],...e?.imported_files||[]])].filter(Boolean),X=h.length?` \xB7 \u7248\u672C ${h.join("\u3001")}`:L.length?` \xB7 ${L.join("\u3001")}`:"",J=e?.detail?` \xB7 ${e.detail}`:"",ve=e?`${y} \xB7 ${S}${X}${J}`:`${y} \xB7 \u7121\u8CC7\u6599`,fe=u?o==="empty"?"is-empty":"is-neutral":nl[o]||"is-empty",se=a.map(q=>{let A=v[q]||"empty",T=A==="incomplete"||A==="pending"?p(q):"",K=T?"button":"span",me=T?` type="button" data-timeline-workflow="${r(T)}"`:"",H=M(q),le=q==="qdrant"&&A==="incomplete"&&H!==null&&H>0,Te=A==="processing"&&H!==null?` ${H.toFixed(1)}%`:"",I=le?"\u5DF2\u8655\u7406":k(A),ye=A==="complete"?"is-complete":A==="processing"?"is-running":le?"is-partial":A==="incomplete"?"is-incomplete":A==="pending"?"is-pending":"is-empty",ae=u?["index-month-block","processing-month-stage",`is-${q}`,ye,T?"is-actionable":""]:["processing-month-stage",`is-${q}`,nl[A]||"is-empty",ye,T?"is-actionable":""],Me=(A==="processing"||le)&&H!==null?` style="--stage-progress:${H.toFixed(1)}%"`:"";return`<${K} class="${ae.filter(Boolean).join(" ")}"${me}${Me} title="${r(`${n[q]||q}\uFF1A${I}${Te}${T?"\uFF08\u9EDE\u9078\u524D\u5F80\u8655\u7406\uFF09":""}`)}" aria-label="${r(`${y} ${n[q]||q} ${I}${Te}${T?"\uFF0C\u9EDE\u9078\u524D\u5F80\u8655\u7406":""}`)}"></${K}>`}).join("");return u?`<td class="judgment-month index-month index-month-are processing-month ${fe}${l?" is-current":""}${d&&!l?" is-processing-current":""}" data-month="${r(b)}" title="${r(ve)}" aria-label="${r(ve)}"${l?' aria-current="true"':""}>
    <span class="index-month-number">${s}</span>
    <span class="index-month-blocks">${se}</span>
  </td>`:`<td class="judgment-month import-month processing-month${l?" is-current":""} is-${r(o)}" data-month="${r(b)}" title="${r(ve)}" aria-label="${r(ve)}"${l?' aria-current="true"':""}>
    <span class="processing-month-number">${s}</span>
    <span class="processing-month-stages">${se}</span>
  </td>`}function ap(e,t,s,a,n){return Jr({month:t,year:s,monthNo:a,stageOrder:Ur,stageLabels:Vu,stageStatuses:t?.stages||{},overall:t?.overall||"empty",active:!!(t?.active||t?.overall==="processing"),workflowForStage:i=>gl(e.key,i),stageProgress:n,variant:"index"})}function np(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=Number(s?.incomplete)||0,o=Number(s?.superseded)||0,l=a>0?(n+o)/a*100:null,d=["download","prepared","indexed"],p=0,g=0;for(let v of t){let u=v?.stages||{};for(let b of d){let y=u[b];!y||y==="empty"||y==="not_applicable"||(p+=1,y==="complete"&&(g+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(n),"\u5DF2\u5B8C\u6210 D\uFF0FP\uFF0FI \u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(i+(Number(s?.processing)||0)),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u5DF2\u53D6\u4EE3\u6708\u4EFD",c(o),"\u820A\u7248\u672C\u5DF2\u88AB\u76EE\u524D\u7248\u672C\u53D6\u4EE3\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",yt(l),"\u5B8C\u6210\u6216\u5DF2\u53D6\u4EE3\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c(g)} / ${c(p)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([v,u,b])=>`<span class="index-runtime-metric" title="${r(b)}"><span>${r(v)}</span><strong>${r(u)}</strong></span>`).join("")}</div>`}function rp(e,t,s,a){let n=Number(e?.total_months)||t.length||0,i=Number(s?.complete)||0,o=Number(s?.incomplete)||0,l=Number(s?.processing)||0,d=Number(a?.gray)||0,p=n>0?i/n*100:null,g=0,$=0;for(let u of t){let b=u?.import_stages||{};for(let y of["extract","raw_parquet","filter","postgres"]){let k=b[y];!k||k==="empty"||(g+=1,k==="complete"&&($+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(i),"\u56DB\u500B\u532F\u5165\u968E\u6BB5\u90FD\u5B8C\u6210\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(o+l),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\uFF08\u542B\u8655\u7406\u4E2D\uFF09\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",c(d),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(n),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",yt(p),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c($)} / ${c(g)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([u,b,y])=>`<span class="index-runtime-metric" title="${r(y)}"><span>${r(u)}</span><strong>${r(b)}</strong></span>`).join("")}</div>`}function ip(e,{titleSuffix:t="\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868"}={}){let s=`${r(e?.label||"\u6CD5\u898F\uFF0F\u547D\u4EE4")} ${r(t)}`,a=Array.isArray(e?.months)?e.months:[];if(!a.length)return`<section class="report-card processing-card import-files-card law-index-timeline-card">
      <div class="side-card-head">
        <span class="side-card-title">${m(e?.key==="order"?"file":"layers",14)}${s}</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u7121\u4E0B\u8F09\u7248\u672C\u6216\u7D22\u5F15\u7D00\u9304\u3002</div>
    </section>`;let n=new Map(a.map(v=>[String(v.month),v])),i=[...new Set(a.map(v=>v.year))].sort((v,u)=>String(u).localeCompare(String(v))),o=["download","prepared","indexed"],l=e.stage_labels||{download:"D \u4E0B\u8F09\u7248\u672C",prepared:"P \u8CC7\u6599\u5C31\u7DD2",indexed:"I \u7D22\u5F15\u8986\u84CB"},d=e.summary||{},p=e.current||{},g=i.map(v=>{let u=Array.from({length:12},(b,y)=>{let k=y+1,M=`${v}${String(k).padStart(2,"0")}`,S=n.get(M);return Jr({month:S,year:v,monthNo:k,stageOrder:o,stageLabels:l,stageStatuses:S?.stages||{},overall:S?.overall||"empty",active:!!S?.active,workflowForStage:h=>h==="indexed"?"legal_index_versions":`${e.key}_download`,variant:"index"})}).join("");return`<tr><th scope="row">${r(v)}</th>${u}</tr>`}).join(""),$=p.month?`<div class="index-current-row">
        <span class="badge badge-info">${m("activity",11)}${r(p.label||"\u76EE\u524D\u7248\u672C")}</span>
        <strong class="mono">${r(p.month_label||xn(p.month))}</strong>
        <span class="mono">${r(p.file||"\u2014")}</span>
        <span class="index-current-copy">${r(p.detail||"")}</span>
      </div>`:"";return`<section class="report-card processing-card import-files-card law-index-timeline-card" data-law-index-timeline="${r(e.key||"")}">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m(e.key==="order"?"file":"layers",14)}${s}</span>
      ${np(e,a,d)}
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(v,u)=>`<th scope="col">${u+1}</th>`).join("")}</tr></thead>
          <tbody>${g}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">D\uFF1A\u4E0B\u8F09\u7248\u672C\uFF1BP\uFF1Araw Parquet + PostgreSQL \u5C31\u7DD2\uFF1BI\uFF1Aactive \u7D22\u5F15\u8986\u84CB\uFF08\u7531\u6CD5\u898F\uFF0F\u547D\u4EE4\u7D22\u5F15\u6D41\u7A0B\u7DAD\u8B77\uFF09\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF0C\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u5B8C\u6210\u8272\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u6216\u5DF2\u53D6\u4EE3\u3002\u820A\u7248\u672C\u986F\u793A\u300C\u5DF2\u53D6\u4EE3\u300D\uFF0C\u4E0D\u9700\u91CD\u5EFA\u7D22\u5F15\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u7DE8\u865F\u3001\u4E0B\u8F09\u6642\u9593\u8207\u7B46\u6578\u3002</p>
    </div>
  </section>`}function op(e,t={}){let s=Array.isArray(e)?e:[];return s.length?`<div class="law-index-timelines">${s.map(a=>ip(a,t)).join("")}</div>`:""}function fl({activeMonth:e,activeArchive:t,activePhase:s="",processingMonth:a="",processingArchive:n="",stageLabels:i={}}){if(!e||!t)return"";let o=`${String(e).slice(0,4)}-${String(e).slice(4,6)}`,l=i[s]||(s?"\u6E96\u5099\u4E2D":""),d=`${String(a||"").slice(0,4)}-${String(a||"").slice(4,6)}`,p=!!a&&(a!==e||n!==t);return`<span class="badge badge-info">${m("activity",11)}\u76EE\u524D\u532F\u5165</span>
    <strong class="mono">${r(o)}</strong>
    <span class="mono">${r(t)}</span>
    ${l?`<span class="badge badge-neutral">${r(l)}</span>`:""}
    ${p?`<span class="processing-current-processing">
            <span class="faint">\u8655\u7406\u4E2D</span>
            <strong class="mono">${r(d)}</strong>
            <span class="mono">${r(n||"\u2014")}</span>
          </span>`:""}`}function lp(e,t,s,a){let n=[];for(let i=1;i<=12;i+=1){let o=`${t}${String(i).padStart(2,"0")}`;n.push(ap(e,s.get(o),t,i,a))}return`<tr><th scope="row">${t}</th>${n.join("")}</tr>`}function cp(e){let t=e?.models||{};return[["Embedding",t.embedding],["Rerank",t.rerank]].filter(([,s])=>s&&(s.label||s.model)).map(([s,a])=>{let n=a.label||[a.host,a.model].filter(Boolean).join(" ")||"\u2014",i=[`${s} \u4E3B\u6A5F\u8207\u6A21\u578B\uFF1A${n}`,a.url?`\u7AEF\u9EDE\uFF1A${a.url}`:"",s==="Rerank"&&a.enabled===!1?"RAG_RERANK_ENABLED=false":""].filter(Boolean).join(" \xB7 ");return`<span class="processing-timeline-model" title="${r(i)}">${s} <strong class="mono">${r(n)}</strong>${s==="Rerank"&&a.enabled===!1?' <span class="faint">\u672A\u555F\u7528</span>':""}</span>`}).join("")}function dp(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=a>0?n/a*100:null,o=t.reduce((g,$)=>{let v=$?.stages||{};return g+Ur.filter(u=>!!v[u]&&v[u]!=="empty"&&v[u]!=="not_applicable").length},0),l=t.reduce((g,$)=>{let v=$?.stages||{};return g+Ur.filter(u=>v[u]==="complete").length},0),d=(Number(s?.incomplete)||0)+(Number(s?.processing)||0);return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(n),"\u5DF2\u5B8C\u6210\u5168\u90E8\u56DB\u500B\u968E\u6BB5\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(d),"\u4ECD\u6709\u81F3\u5C11\u4E00\u500B\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",c(s?.update||0),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",yt(i),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c(l)} / ${c(o)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([g,$,v])=>`<span class="index-runtime-metric" title="${r(v)}"><span>${r(g)}</span><strong>${r($)}</strong></span>`).join("")}</div>`}function up(e,t){let s=new Map((Array.isArray(e?.workflows)?e.workflows:[]).map(g=>[String(g.id||""),g])),a=t.key==="judgment"?"index_versions":"legal_index_versions",i=s.get(a)?.index_runtime||{},o=g=>{if(g==null||g==="")return null;let $=Number(g);return Number.isFinite($)?Math.max(0,Math.min(100,$)):null},l=new Map((Array.isArray(i.months)?i.months:[]).map(g=>[String(g?.month||""),o(g?.percent)])),d=new Map(Object.entries(i.active_coverage||{}).map(([g,$])=>[String(g),o($?.percent)])),p=(g,$)=>{let v=s.get(String(g||""));if(!v)return null;let u=v.progress||{},b=Array.isArray(u.stages)?u.stages:[];for(let y of $){let k=b.find(S=>String(S.key)===y),M=o(k?.percent);if(M!==null)return M}return o(u.percent)};return(g,$,v)=>{let u=String($||"");if(g==="qdrant"){let k=l.get(u),M=d.get(u);if(v==="processing"){if(k!==null&&k>0)return k;if(M!==null&&M>0)return M}else return v==="incomplete"?k!==null&&k>0?k:M!==null&&M>0?M:0:null}let b=gl(t.key,g);if(!b)return null;let y=(Wu[t.key]||{})[g]||[g];return p(b,y)}}function pp(e){let t=Array.isArray(e.file_timelines)?e.file_timelines:[];return t.length?`<div class="processing-timeline-overview">${t.map(s=>{let a=Array.isArray(s.months)?s.months:[],n=new Map(a.map(g=>[String(g.month||""),g])),i=[...new Set(a.map(g=>Number(g.year)))].filter(g=>Number.isFinite(g)).sort((g,$)=>$-g),o=s.summary||{},l=s.current||null,d=cp(s),p=up(e,s);return`<section class="report-card processing-card import-files-card processing-timeline-card" data-processing-timeline="${r(s.key||"")}">
        <div class="side-card-head index-runtime-head">
          <span class="side-card-title">${m(s.icon||"activity",14)}${r(s.title||`${s.label||""}\u8655\u7406\u6642\u9593\u8868`)}</span>
          ${dp(s,a,o)}
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
                    <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(g,$)=>`<th scope="col">${$+1}</th>`).join("")}</tr></thead>
                    <tbody>${i.map(g=>lp(s,g,n,p)).join("")}</tbody>
                  </table>
                </div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u3002</div>'}
          <p class="judgment-months-hint">${s.key==="judgment"?"\u5224\u6C7A\u4EE5\u88C1\u5224\u66F8\u6708\u4EFD\u986F\u793A\u3002":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u4EE5\u4F86\u6E90\u7248\u672C\u6708\u4EFD\u986F\u793A\u3002"}\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA\u4E0B\u8F09\u3001Parquet\u3001PostgreSQL\u3001Qdrant \u56DB\u500B\u968E\u6BB5\uFF1B\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF0CQdrant \u4E4B\u524D\u5DF2\u8655\u7406\u4F46\u5C1A\u672A\u5B8C\u6210\u6642\u4EE5\u5B8C\u6210\u8272\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u6216\u8272\u584A\u53EF\u67E5\u770B\u5404\u968E\u6BB5\u72C0\u614B\u8207\u9032\u5EA6\u3002</p>
        </div>
      </section>`}).join("")}</div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u8655\u7406\u6642\u9593\u8868\u3002</div>'}function mp(e){return e.judgment_stats&&typeof e.judgment_stats=="object"?e.judgment_stats:{judgment_total:(e.raw_backups?.totals||{}).row_count,financial_total:(e.database||{}).judgment_count}}function dl(e,t=new Set){return`${sp(e)}
    ${Zu(e)}
    ${pp(e)}
    ${ep(e)}
    ${tp(e)}`}function gp(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${Fe({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:r(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${r(_e(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${m("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}function fp(e,t){if(e.nodeType!==t.nodeType||e.nodeName!==t.nodeName){e.replaceWith(t.cloneNode(!0));return}if(e.nodeType===Node.TEXT_NODE){e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue);return}if(e.nodeType===Node.ELEMENT_NODE){for(let s of[...e.attributes])t.hasAttribute(s.name)||e.removeAttribute(s.name);for(let s of[...t.attributes])e.getAttribute(s.name)!==s.value&&e.setAttribute(s.name,s.value);t.hasAttribute("data-preserve-children")||bl(e,t)}}function bl(e,t){let s=[...e.childNodes],a=[...t.childNodes],n=Math.min(s.length,a.length);for(let i=0;i<n;i+=1)fp(s[i],a[i]);for(let i=n;i<s.length;i+=1)s[i].remove();for(let i=n;i<a.length;i+=1)e.appendChild(a[i].cloneNode(!0))}function gs(e,t){let s=document.createElement("template");s.innerHTML=t,bl(e,s.content)}var hl={overview:"activity",law_download:"layers",order_download:"file",judgment_download:"download",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function bp(e){let s=(Array.isArray(e.workflows)?e.workflows:[]).map(n=>{let i=n.active_run||null,o=i||n.last_run||null;return{...n,activeRun:i,lastRun:o,status:i?i.status||"running":n.update_available?"update":o?.status||"idle"}}),a=s.find(n=>n.id==="judgment_parquet");return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...s.filter(n=>n.id!=="judgment_parquet"),...a?[a]:[]]}function kn(e,t){let s=bp(e),a=new Set(["law_download","judgment_download","normalize_courts"]);return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${s.map(n=>{let i=n.id===t,o=hl[n.id]||"terminal",l=a.has(n.id)?'<div class="status-tab-divider" role="separator" aria-hidden="true"></div>':"",d=Number(n.pending_count)||0,p=Number(n.update_count)||(n.update_available?d:0),g=n.update_available&&p>0&&!n.activeRun,$=[n.update_message||`${n.update_origin||"\u66F4\u65B0\u5075\u6E2C"}\u627E\u5230 ${c(p)} \u9805\u53EF\u66F4\u65B0\u5167\u5BB9`,n.update_origin?`\u4F86\u6E90\uFF1A${n.update_origin}`:"",n.update_mechanism?`\u6A5F\u5236\uFF1A${n.update_mechanism}`:""].filter(Boolean).join(" \xB7 ");return`${l}<button class="status-tab${i?" is-active":""}" type="button"
            data-processing-workflow="${r(n.id)}"
            ${i?'aria-current="page"':""}>
            <span class="status-tab-icon">${m(o,15)}</span>
            <span class="status-tab-copy">
              <strong>${r(n.label)}</strong>
              <small>${r(n.description||"")}</small>
            </span>
            ${g?`<span class="badge badge-warn badge-mono processing-update-count" title="${r($)}">${m("refresh",10)}${c(p)}</span>`:Bt(n.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${r(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function hp(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${Bt(e.status)}
      <span class="mono">${r(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${r(_e(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${ge(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${r(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${r(t.log_path)}</strong>`:""}
    </div>
  </div>`}function Aa(e){return`${e.year}-${String(e.month_no).padStart(2,"0")}`}function vl(e){let t={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"},s=e.status||"red";return[Aa(e),t[s]||s,e.latest_fileset_id?`fileset ${e.latest_fileset_id}`:"",e.filename||"",e.local_filename&&e.local_filename!==e.filename?`\u672C\u6A5F\uFF1A${e.local_filename}`:""].filter(Boolean).join(" \xB7 ")}function $l(e){if(!e.download_url)return"";let t=Aa(e);return`<a class="judgment-month-download" href="${r(bt(e.download_url))}" target="_blank" rel="noreferrer" title="\u4E0B\u8F09 ${t} \u5224\u6C7A" aria-label="\u4E0B\u8F09 ${t} \u5224\u6C7A">${m("download",11)}</a>`}function vp(e){let t=e.status||"red";return`<td class="judgment-month is-${r(t)}" data-judgment-month-key="${r(Aa(e))}" title="${r(vl(e))}"><span>${e.month_no}</span>${$l(e)}</td>`}function $p(e){return e?.off_hours_enabled===!0}function yl(e){return`\u7DA0\u8272\uFF1A\u6700\u65B0\u7248\u5DF2\u4E0B\u8F09\u5230 raw_rar\uFF1B\u7070\u8272\uFF1A\u672C\u6A5F\u4ECD\u662F\u820A\u7248\uFF0C\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u6703\u66F4\u65B0\uFF1B\u7D05\u8272\uFF1A\u8A72\u6708\u4EFD\u7F3A\u5C11\u5224\u6C7A\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u958B\u555F\u4E0B\u8F09\u9023\u7D50\uFF08${$p(e)?"\u975E API \u6642\u6BB5\u4E5F\u53EF\u4E0B\u8F09\uFF0C\u5EFA\u8B70\u4E00\u6B21\u53EA\u4E0B\u8F09\u4E00\u500B\u6A94\u6848":"\u4E0B\u8F09\u9023\u7D50\u50C5\u5728 00:00\u201306:00 API \u6642\u6BB5\u53EF\u7528"}\uFF09\u3002\u5F85\u88DC\u9F4A\u6708\u4EFD\u6703\u512A\u5148\u4E0B\u8F09\uFF0C\u5168\u90E8\u88DC\u9F4A\u5F8C\u624D\u7531\u6700\u65B0\u6708\u4EFD\u5F80\u56DE\u9A57\u8B49\u65E2\u6709\u6A94\u6848\uFF1B\u4E2D\u65B7\u7684\u4E0B\u8F09\u6703\u4FDD\u7559 .part\uFF0C\u4F3A\u670D\u5668\u652F\u63F4 Range \u6642\u7E8C\u50B3\uFF0C\u5426\u5247\u5F9E\u96F6\u91CD\u65B0\u4E0B\u8F09\u3002\u9996\u6B21\u5B8C\u6574\u540C\u6B65\u53EF\u80FD\u9700\u4E0B\u8F09\u6578\u767E\u500B\u6708\u4EFD\uFF0C\u9810\u8A2D\u975E\u6642\u6BB5\u4E5F\u53EF\u7E8C\u50B3\uFF1B\u56B4\u683C\u6A21\u5F0F\u6703\u5728 00:00\u201306:00 \u4EE5\u5916\u505C\u6B62\u3002`}var yp={completed:"\u5B8C\u6210",window_closed:"API \u6642\u6BB5\u7D50\u675F",deadline:"\u63A5\u8FD1 06:00\uFF0C\u4FDD\u7559\u5F85\u4E0B\u8F09\u6708\u4EFD",verification_window_closed:"API \u6642\u6BB5\u7D50\u675F\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",verification_deadline:"\u63A5\u8FD1 06:00\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",errors:"\u90E8\u5206\u6708\u4EFD\u4E0B\u8F09\u5931\u6557\uFF0C\u4E0B\u6B21\u91CD\u8A66",pending:"\u4ECD\u6709\u5F85\u4E0B\u8F09\u6708\u4EFD",check_only:"\u50C5\u6AA2\u67E5\uFF0C\u672A\u4E0B\u8F09",incremental:"\u589E\u91CF\u6AA2\u67E5\u5B8C\u6210",status_only:"\u50C5\u66F4\u65B0\u6708\u4EFD\u72C0\u614B",running:"\u57F7\u884C\u4E2D"};function Vr(e){let t=e?.backfill||{},s=t.verification||{},a=t.last_run||{},n=Number(t.pending_count)||0,i=Number(t.failure_count)||0,o=String(t.resume_from_month||""),l="\u9A57\u8B49\uFF1A\u672A\u958B\u59CB";s.status==="completed"?l="\u9A57\u8B49\u5B8C\u6210":s.next_month?l=`\u9A57\u8B49\u7E8C\u50B3 ${s.next_month}`:s.status==="in_progress"&&(l="\u9A57\u8B49\u9032\u884C\u4E2D");let d=String(a.stop_reason||""),p=d?`\u4E0A\u6B21\u505C\u6B62\uFF1A${yp[d]||d}`:"";return{pending:n,failures:i,resume:o,verificationText:l,lastText:p}}function wp(e){let t=Vr(e),s=t.pending>0?`\u5F85\u88DC\u9F4A ${c(t.pending)} \u500B\u6708${t.failures>0?`\uFF08${c(t.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708";return`<div class="judgment-backfill" data-judgment-backfill>
    <span class="badge ${t.pending>0?"badge-danger":"badge-ok"}" data-judgment-backfill-pending>${s}</span>
    <span class="badge badge-neutral" data-judgment-backfill-resume ${t.resume&&t.pending>0?"":"hidden"}>\u5F9E ${r(t.resume)} \u7E8C\u50B3</span>
    <span class="badge badge-info" data-judgment-backfill-verification>${r(t.verificationText)}</span>
    <span class="muted" data-judgment-backfill-last ${t.lastText?"":"hidden"}>${r(t.lastText)}</span>
  </div>`}function _p(e,t){let s=Vr(t),a=e.querySelector("[data-judgment-backfill-pending]");a&&(a.textContent=s.pending>0?`\u5F85\u88DC\u9F4A ${c(s.pending)} \u500B\u6708${s.failures>0?`\uFF08${c(s.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708",a.classList.toggle("badge-danger",s.pending>0),a.classList.toggle("badge-ok",s.pending===0));let n=e.querySelector("[data-judgment-backfill-resume]");if(n){let l=!!s.resume&&s.pending>0;n.hidden=!l,n.textContent=l?`\u5F9E ${s.resume} \u7E8C\u50B3`:""}let i=e.querySelector("[data-judgment-backfill-verification]");i&&(i.textContent=s.verificationText);let o=e.querySelector("[data-judgment-backfill-last]");o&&(o.hidden=!s.lastText,o.textContent=s.lastText)}function Wr(){return'<div class="judgment-months-loading"><span class="spinner"></span><span>\u8B80\u53D6\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B\u2026</span></div>'}function kp(e){if(e?.loading&&!e?.months?.length)return Wr();if(e?.error&&!e?.months?.length)return Fe({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(e.error)});let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return'<div class="processing-empty">\u5C1A\u672A\u6709\u6708\u4EFD\u72C0\u614B\uFF1B\u8ACB\u5148\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u3002</div>';let s=new Map(t.map(o=>[Aa(o),o])),n=[...new Set(t.map(o=>o.year))].sort((o,l)=>l-o).map(o=>{let l=Array.from({length:12},(d,p)=>{let g=s.get(`${o}-${String(p+1).padStart(2,"0")}`);return g?vp(g):`<td class="judgment-month is-empty"><span>${p+1}</span></td>`}).join("");return`<tr><th scope="row">${o}</th>${l}</tr>`}).join(""),i=e.summary||{};return`<div class="judgment-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" data-judgment-summary="green">\u6700\u65B0\u7248 ${c(i.green||0)}</span>
      <span class="badge badge-neutral" data-judgment-summary="gray">\u820A\u7248 ${c(i.gray||0)}</span>
      <span class="badge badge-danger" data-judgment-summary="red">\u7F3A\u5931 ${c(i.red||0)}</span>
      <span class="muted" data-judgment-total>\u5171 ${c(e.total_months||t.length)} \u500B\u6708</span>
    </div>
    ${wp(e)}
    <div class="judgment-months-scroll">
      <table class="judgment-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(o,l)=>`<th scope="col">${l+1}</th>`).join("")}</tr></thead>
        <tbody>${n}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint" data-judgment-hint>${r(yl(e))}</p>
  </div>`}function Sp(e,t){let s=Array.isArray(t?.months)?t.months:[],a=t.summary||{},n={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"};e.querySelectorAll("[data-judgment-summary]").forEach(l=>{let d=l.dataset.judgmentSummary||"";l.textContent=`${n[d]||d} ${c(a[d]||0)}`});let i=e.querySelector("[data-judgment-total]");i&&(i.textContent=`\u5171 ${c(t.total_months||s.length)} \u500B\u6708`),_p(e,t);let o=e.querySelector("[data-judgment-hint]");if(o){let l=yl(t);o.textContent!==l&&(o.textContent=l)}for(let l of s){let d=Aa(l),p=e.querySelector(`[data-judgment-month-key="${d}"]`);if(!p)continue;let g=l.status||"red";p.classList.contains(`is-${g}`)||(p.classList.remove("is-green","is-gray","is-red","is-empty"),p.classList.add(`is-${g}`));let $=vl(l);p.title!==$&&(p.title=$);let v=p.querySelector(".judgment-month-download");if(l.download_url){let u=bt(l.download_url);v?v.getAttribute("href")!==u&&(v.href=u):p.insertAdjacentHTML("beforeend",$l(l))}else v&&v.remove()}}function xp(e){let t=Array.isArray(e)?e:[];return t.length?`<div class="processing-workflow-history">
    ${t.map(s=>`<div class="processing-workflow-history-row">
          <span class="processing-workflow-history-status">${Bt(s.status||"idle")}</span>
          <span class="mono">${r(_e(s.started_at))}</span>
          <span class="mono">${r(ge(s.duration_ms||0))}</span>
          <span class="processing-workflow-history-message">${r(s.message||"\u2014")}</span>
        </div>`).join("")}
  </div>`:'<div class="processing-workflow-empty">\u5C1A\u7121\u57F7\u884C\u7D00\u9304\u3002</div>'}function Ap(e){let t=Array.isArray(e.update_history)?e.update_history:[];if(!t.length)return'<div class="processing-workflow-empty">\u5C1A\u7121\u7248\u672C\u6AA2\u67E5\u7D00\u9304\u3002</div>';let s={up_to_date:["\u5DF2\u662F\u6700\u65B0","badge-ok"],update_available:["\u6709\u66F4\u65B0","badge-warn"],error:["\u6AA2\u67E5\u5931\u6557","badge-danger"]};return`<div class="processing-workflow-history">
    ${t.map(a=>{let[n,i]=s[a.status]||[a.status||"\u672A\u77E5","badge-neutral"],o=a.remote_content_length!=null?Ee(a.remote_content_length):"\u2014",l=a.local_version_id?`v${a.local_version_id}`:"\u2014";return`<div class="processing-workflow-history-row">
          <span class="badge ${i}">${r(n)}</span>
          <span class="mono">${r(_e(a.checked_at))}</span>
          <span class="mono">\u9060\u7AEF ${r(o)}</span>
          <span class="mono">\u672C\u5730 ${r(l)}</span>
          <span class="processing-workflow-history-message">${r(a.message||"\u2014")}</span>
        </div>`}).join("")}
  </div>`}function wl(e){let t=String(e.key||""),s=As(e.status);return[`data-stage-key="${r(t)}"`,`data-stage-label="${r(e.label||t)}"`,`data-stage-color="${r(ml(e))}"`,`data-stage-status-key="${r(e.status||"idle")}"`,`data-stage-status="${r(s.label)}"`,`data-stage-percent="${r(yt(e.percent))}"`,`data-stage-counts="${r(Qr(e))}"`,`data-stage-duration="${r(Is(e.duration_ms||0))}"`,`data-stage-contribution="${r(yt(e.contribution_percent))}"`,`data-stage-message="${r(e.message||"")}"`].join(" ")}function Mp(e,t=Date.now()){let s=String(e.status||"idle"),a=Number(e.duration_ms)||0,n=Date.parse(e.started_at||"");if(s==="running"&&Number.isFinite(n))return Math.max(a,t-n);if(a>0)return a;let i=Date.parse(e.finished_at||"");return Number.isFinite(n)&&Number.isFinite(i)?Math.max(0,i-n):0}function _l(e){if(e.key!=="filter")return null;let t=Number(e.financial_processed),s=Number(e.financial_matched);return e.financial_processed===null||e.financial_processed===void 0||!Number.isFinite(t)||!Number.isFinite(s)||t<=0?null:{processed:t,matched:s,percent:Math.round(s/t*100)}}function qp(e){let t=String(e.status||"idle"),s=[],a=Number(e.total);if(e.key==="postgres"&&["success","no_change"].includes(t)&&Number.isFinite(a)&&a>0)s.push(`\u7E3D\u8A08 ${c(a)} \u7B46`);else{let i=Qr(e);i!=="\u2014"&&s.push(i)}let n=_l(e);return n&&s.push(`\u91D1\u878D\u4F54\u6BD4 ${n.percent}%`),s.join(" \xB7 ")}function Lp(e,t){let s=String(e.status||"idle"),a=[],n=(d,p,{always:g=!1}={})=>{let $=p==null?"":String(p).trim();!g&&!$||a.push(`<span class="rag-wf-detail"><span>${r(d)}</span><strong>${r($||"\u2014")}</strong></span>`)};n("\u72C0\u614B",As(s).label,{always:!0}),n("\u958B\u59CB",e.started_at?_e(e.started_at):"\u2014",{always:!0}),n("\u7D50\u675F",e.finished_at?_e(e.finished_at):"\u2014",{always:!0}),n("\u8017\u6642",t,{always:!0}),n("\u9032\u5EA6",yt(e.percent),{always:!0});let i=Qr(e),o=["extract","raw_parquet"].includes(String(e.key||""));n(o?"\u7D2F\u8A08\u8CC7\u6599\u91CF":"\u8CC7\u6599\u91CF",i!=="\u2014"?i:"");let l=_l(e);return l&&(n("\u91D1\u878D\u6848\u4EF6",`${c(l.matched)} \u7B46`),n("\u5168\u90E8\u6848\u4EF6",`${c(l.processed)} \u7B46`),n("\u91D1\u878D\u4F54\u6BD4",`${l.percent}%`)),n("\u6574\u9AD4\u5360\u6BD4",yt(e.contribution_percent)),s==="failed"||s==="stale"?(n("\u539F\u56E0",e.error||e.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002"),n("\u5EFA\u8B70",e.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002")):n("\u8AAA\u660E",e.message),a.join("")}function jp(e){let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${m("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A host/model\u3001Blue-Green \u5EFA\u7F6E\u8207\u5404\u968E\u6BB5\u9032\u5EA6\u3002</div>
    </section>`;let a=new Map(s.map(de=>[String(de.key||""),de])),n=a.get("ollama")||{},i=a.get("qdrant")||{},o=a.get("validate")||{},l=e.index_runtime||{},d=l.summary||{},p=l.copy||{},g=Number(l.index_prior_duration_ms||0),$=l.current||{},v=l.embedding||{},u=v.selected||{},b=v.active||{},y=Number(l.expected_count||d.total||i.total||0),k=Number(d.indexed??i.current??0),M=y>0?Math.min(100,k/y*100):i.status==="success"?100:0,S=Number(p.total||0),h=Number(p.copied||0),L=S>0?Math.min(100,h/S*100):p.status==="success"?100:0,X=String(l.build_mode||""),J=String(t.run_status||""),ve=!!J&&!["running","success","no_change"].includes(J),fe=String(p.status||(X==="reuse"?"pending":"skipped"));ve&&fe==="pending"&&(fe="stale");let se=Number(p.duration_ms||0)/1e3,q=se>0?h/se:0,A=fe==="running"&&q>0&&S>h?(S-h)/q:null,T=xl(e,l,k),K=Ml(l,k,y,T),me=K?.remainingMs&&K.remainingMs>0?K.remainingMs/1e3:null,H=fe==="success"||fe==="skipped"||k>0||i.status==="success",le=i.status==="success"?"success":H&&i.status||"pending",Te=String(o.status||"pending"),I=Te==="success"&&/alias 已切換/.test(String(o.message||"")),ye=I?"success":Te==="failed"?"failed":J==="running"?"pending":"skipped",ae=l.version_id?`v${String(l.version_id).padStart(3,"0")}`:"\u2014",Se=b.host||u.host||b.url||u.url||"\u2014",Me=b.port||u.port,$e=Me?`${Se}:${Me}`:String(Se),Ce=b.model||u.model||l.model||"\u2014",be=H&&$.month?`${xn($.month)}${$.preparing?"\uFF08\u6E96\u5099\u4E2D\uFF09":""}`:t.run_status==="running"?"\u6E96\u5099\u4E2D":"\u2014",V=String($.phase||"")==="embedding"?"E \u65B0 embedding":String($.phase||"")==="reuse"?"R \u91CD\u7528":"\u2014",he=(()=>{let de=Number(i.duration_ms)||0,tt=Date.parse(i.started_at||"");if(i.status==="running"&&Number.isFinite(tt))return Math.max(de,Date.now()-tt);if(de>0)return de;let Ue=Date.parse(i.finished_at||"");return Number.isFinite(tt)&&Number.isFinite(Ue)?Math.max(0,Ue-tt):0})(),qe=[{key:"probe",label:"llama-server \u4E3B\u6A5F\uFF0F\u6A21\u578B\u6E2C\u8A66",caption:"\u4E3B\u6A5F\uFF0F\u6A21\u578B\u3001\u9023\u7DDA\u6E2C\u8A66",color:"#22c55e",status:n.status||"pending",percent:Number(n.percent)||0,current:Number(n.current)||0,total:Number(n.total)||0,unit:"\u53F0",duration_ms:n.duration_ms,started_at:n.started_at,finished_at:n.finished_at,extraDetails:[["\u4E3B\u6A5F",$e],["\u6A21\u578B",Ce],["\u6E2C\u8A66\u4E3B\u6A5F",`${c(n.current||0)} / ${c(n.total||0)} \u53F0`]],detail:`${c(n.current||0)} / ${c(n.total||0)} \u53F0 \xB7 ${$e} \xB7 ${Ce}`},{key:"version",label:"\u5EFA\u7ACB\uFF0F\u63A5\u7E8C Blue-Green \u7248\u672C",caption:"Blue-Green \u7248\u672C\u3001collection",color:"#06b6d4",status:l.version_id?"success":"pending",percent:l.version_id?100:0,current:l.version_id?1:0,total:1,unit:"\u968E\u6BB5",duration_ms:l.version_duration_ms,started_at:null,finished_at:null,extraDetails:[["\u7248\u672C",ae],["Collection",l.collection||"\u2014"],["\u6A21\u5F0F",X||"\u2014"]],detail:`${ae} \xB7 ${l.collection||"\u2014"} \xB7 ${X||"\u2014"}`},{key:"copy",label:"\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF",caption:"\u820A collection \u5411\u91CF\u8907\u88FD",color:"#f59e0b",status:fe,percent:L,current:h,total:S,unit:"points",duration_ms:p.duration_ms,started_at:p.started_at,finished_at:p.finished_at,extraDetails:[["\u5DF2\u8907\u88FD",`${c(h)} points`],["\u7E3D points",c(S)],["\u7BC4\u570D","\u5168\u57DF points\uFF1B\u4E0D\u5217\u5165\u6708\u4EFD R\uFF0FE"],["\u8907\u88FD\u901F\u5EA6",q>0?`${q.toFixed(1)} points/\u79D2`:"\u2014"],p.resumed?["\u4F86\u6E90",`\u7E8C\u8DD1\u524D\u5B8C\u6210${p.resumed_from_run_id?`\uFF08${p.resumed_from_run_id}\uFF09`:""}`]:null,["\u9810\u4F30\u5269\u9918",A!==null?xa(A):"\u2014"]],detail:S>0?`${c(h)} / ${c(S)} points \xB7 \u820A collection \u5411\u91CF${p.resumed?" \xB7 \u7E8C\u8DD1\u524D\u5B8C\u6210":""}`:fe==="skipped"?"\u672C\u6B21\u4E0D\u9700\u8907\u88FD\u820A\u5411\u91CF":fe==="stale"?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5B8C\u6210\u8907\u88FD":"\u7B49\u5F85\u820A collection \u8907\u88FD"},{key:"index",label:"\u91D1\u878D\u5224\u6C7A\u5411\u91CF\u7D22\u5F15",caption:"R \u85CD\uFF0FE \u7D2B\uFF1B\u672C\u6B21 run \u9032\u5EA6",color:"#a78bfa",barColor:V==="E \u65B0 embedding"?"#a78bfa":V==="R \u91CD\u7528"?"#3b82f6":"",status:le,phaseKey:V==="R \u91CD\u7528"?"reuse":V==="E \u65B0 embedding"?"embedding":"",phaseLabel:le==="running"?V:"",percent:M,current:k,total:y,unit:"\u7B46",duration_ms:H?i.duration_ms:0,extraDurationMs:g,started_at:H?i.started_at||l.started_at:null,finished_at:i.finished_at,extraDetails:[["\u5DF2\u7D22\u5F15",`${c(k)} / ${c(y)} \u7B46`],g>0?["\u524D\u6B21\u57F7\u884C",Is(g)]:null,g>0?["\u672C\u6B21\u57F7\u884C",Is(he)]:null,["\u91CD\u7528",c(d.reused)],["\u65B0 embedding",c(d.embedded)],["\u76EE\u524D\u6708\u4EFD",be],["\u76EE\u524D\u6279\u6B21",V],["\u672C\u6279 R\uFF0FE",`R ${c($.reused||0)} \xB7 E ${c($.embedded||0)}`],["R \u5B9A\u7FA9","04 \u9010\u6708\u6383\u63CF\u6CBF\u7528\uFF1B03 \u8907\u88FD\u70BA\u5168\u57DF points"],["\u9810\u4F30\u5269\u9918",H&&me!==null?xa(me):"\u2014"]],htmlDetails:Cp(l),detail:H?`${c(k)} / ${c(y)} \u7B46 \xB7 \u91CD\u7528 ${c(d.reused)} \xB7 \u65B0 embedding ${c(d.embedded)}${V==="\u2014"?"":` \xB7 ${V}`}`:"\u7B49\u5F85\u7248\u672C\u6E96\u5099\uFF08\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF\uFF09\u5B8C\u6210"},{key:"validate",label:"\u9A57\u8B49\u65B0\u7248\u672C",caption:"\u7B46\u6578\u3001\u7DAD\u5EA6\u3001payload",color:"#eab308",status:Te,percent:Te==="success"?100:0,current:null,total:null,duration_ms:o.duration_ms,started_at:o.started_at,finished_at:o.finished_at,extraDetails:[["\u9A57\u8B49\u8A0A\u606F",o.message||"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210"]],detail:o.message||(ve?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u9032\u884C\u9A57\u8B49\u3002":"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210\u5F8C\u9A57\u8B49\u7B46\u6578\u3001\u7DAD\u5EA6\u8207 payload\u3002")},{key:"activate",label:"\u5207\u63DB alias",caption:"judgments_current alias",color:"#3b82f6",status:ye,percent:I?100:0,current:null,total:null,duration_ms:0,started_at:null,finished_at:null,extraDetails:[["\u76EE\u6A19 alias","judgments_current"]],detail:I?o.message:ve?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5207\u63DB alias\u3002":"\u9A57\u8B49\u901A\u904E\u5F8C\u5207\u63DB judgments_current\u3002"}],Le=qe.filter(de=>de.status!=="skipped"),Re=Le.length?Le.reduce((de,tt)=>de+tt.percent,0)/Le.length:0,R=qe.filter(de=>de.status==="success").length,D=yt(Re),Q=Date.now(),C=de=>{let tt=Number(de.extraDurationMs)||0,Ue=Number(de.duration_ms)||0,ct=Date.parse(de.started_at||"");if(de.status==="running"&&Number.isFinite(ct))return tt+Math.max(Ue,Q-ct);if(Ue>0)return tt+Ue;let gt=Date.parse(de.finished_at||"");return tt+(Number.isFinite(ct)&&Number.isFinite(gt)?Math.max(0,gt-ct):0)},O=qe.map(de=>{let tt=C(de);return{...de,computedDuration:tt,drawable:!["skipped","pending"].includes(de.status)}}),F=Math.max(O.reduce((de,tt)=>de+(tt.drawable?tt.computedDuration:0),0),Number(t.duration_ms)||0,1),we=1.25,Oe=O.map(de=>de.drawable?Math.max(de.computedDuration/F*100,we):0),Ye=Oe.reduce((de,tt)=>de+tt,0),st=Ye>100?100/Ye:1,rt=0,et=O.map((de,tt)=>{let Ue=Oe[tt]*st,ct=Ue>0?{start:rt,width:Ue}:null;return ct&&(rt+=Ue),{...de,bar:ct}}).map((de,tt)=>{let Ue=[`is-${de.status}`,de.status==="failed"||de.status==="stale"?"is-error":"",["pending","skipped"].includes(de.status)?"is-missing":"",de.status==="running"?"is-running":""].filter(Boolean).join(" "),ct=["pending","skipped"].includes(de.status)?"\u2014":Is(de.computedDuration),gt=de.status==="running"?` \xB7 ${yt(de.percent)}`:"",ne=de.phaseLabel?`<span class="index-wf-phase is-${r(de.phaseKey||"unknown")}">${r(de.phaseLabel)}</span>`:"",xe="";if(de.bar){let ft=Math.max(0,Math.min(100,de.bar.start)),x=Math.max(0,Math.min(100-ft,de.bar.width)),j=de.status==="success"?100:Math.max(0,Math.min(100,Number(de.percent)||0)),N=x*j/100,B=x-N,Y=r(de.barColor||de.color);N>0&&(xe+=`<span class="rag-wf-bar index-wf-bar is-sequential" style="left:${ft.toFixed(3)}%;width:${N.toFixed(4)}%;top:0;height:12px;--bar-color:${Y}" aria-hidden="true"></span>`),B>1e-4&&(xe+=`<span class="rag-wf-bar index-wf-bar is-hollow is-sequential" style="left:${(ft+N).toFixed(3)}%;width:${B.toFixed(4)}%;top:0;height:12px;--bar-color:${Y}" aria-hidden="true"></span>`)}let We=[],ze=(ft,x)=>{x==null||x===""||We.push(`<span class="rag-wf-detail"><span>${r(ft)}</span><strong>${r(String(x))}</strong></span>`)};ze("\u72C0\u614B",As(de.status).label),ze("\u958B\u59CB",de.started_at?_e(de.started_at):"\u2014"),ze("\u7D50\u675F",de.finished_at?_e(de.finished_at):"\u2014"),ze("\u8017\u6642",ct),ze("\u9032\u5EA6",yt(de.percent));for(let ft of de.extraDetails||[]){if(!ft)continue;let[x,j]=ft;ze(x,j)}ze("\u8AAA\u660E",de.detail);let Tt={...de,duration_ms:de.computedDuration,contribution_percent:Le.length?(Number(de.percent)||0)/Le.length:null,message:de.detail};return`<details class="rag-wf-stage index-wf-stage ${Ue}" data-index-stage="${r(de.key)}"${zr.has(de.key)?" open":""} style="--stage-color:${r(de.color)}" ${wl(Tt)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="index-wf-step">${String(tt+1).padStart(2,"0")}</span> ${r(de.label)}</strong><small>${r(de.caption||"")}</small></span>
            </span>
            <span class="rag-wf-stage-meta">${r(ct)}${r(gt)}${ne?` \xB7 ${ne}`:""} \xB7 ${r(As(de.status).label)} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px">${xe}</span>
        </summary>
        <div class="rag-wf-details">${We.join("")}${de.htmlDetails||""}</div>
      </details>`}).join("");return`<section class="report-card processing-card processing-workflow-progress-card index-wf-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${m("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
      <span class="badge ${t.run_status==="running"?"badge-info":"badge-neutral"}">${c(R)} / ${c(Le.length)} \u968E\u6BB5</span>
    </div>
    <div class="index-wf-summary">
      <span>\u6574\u9AD4 <strong class="mono">${D}</strong></span>
      <span>\u7248\u672C <strong class="mono">${r(ae)}</strong></span>
      <span>Collection <strong class="mono">${r(l.collection||"\u2014")}</strong></span>
      <span>\u6A21\u5F0F <strong>${r(X||"\u2014")}</strong></span>
      <span>Host <strong class="mono">${r($e)}</strong></span>
      <span>Model <strong class="mono">${r(Ce)}</strong></span>
      <span>\u76EE\u524D <strong>${r(be)}</strong></span>
    </div>
    <div class="index-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${F>0?r(Is(F)):"\u2014"}</span>
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
        <span style="width:${Math.max(0,Math.min(100,Re)).toFixed(1)}%"></span>
      </div>
    </div>
  </section>`}function Tp(e){if(e.id==="index_versions")return jp(e);let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${m("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u5404\u968E\u6BB5\u8207\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </section>`;let a=Date.now(),n=s.map(I=>{let ye=String(I.status||"idle");return{...I,status:ye,computedDuration:Mp(I,a),drawable:!["pending","skipped","idle"].includes(ye)}}),i=n.filter(I=>I.status!=="skipped"),o=n.filter(I=>I.drawable).reduce((I,ye)=>I+ye.computedDuration,0),l=Math.max(o,Number(t.duration_ms)||0,1),d=n.some(I=>I.computedDuration>0),p=1.25,g=n.map(I=>I.drawable?Math.max(I.computedDuration/l*100,p):0),$=g.reduce((I,ye)=>I+ye,0),v=$>100?100/$:1,u=0,b=n.map((I,ye)=>{let ae=g[ye]*v,Se=I.drawable?{start:u,width:ae}:null;return Se&&(u+=ae),{...I,bar:Se}}),y=n.filter(I=>["success","no_change"].includes(I.status)).length,k=n.find(I=>I.status==="running"),M=n.filter(I=>I.status==="running").length,S=n.filter(I=>["pending","idle"].includes(I.status)).length,h=n.filter(I=>I.status==="skipped").length,L=i.length||Number(t.total_stages)||0,X=t.overall_percent,J=X==null||X===""?null:Number(X),ve=Number.isFinite(J)?yt(J):"\u2014",fe=d?Is(l):"\u2014",se=String(t.run_status||""),q=se?As(se).label:"\u2014",A=k&&(k.label||k.key)||"\u2014",T=n.map(I=>Date.parse(I.started_at||"")).filter(I=>Number.isFinite(I)),K=n.map(I=>Date.parse(I.finished_at||"")).filter(I=>Number.isFinite(I)),me=T.length?new Date(Math.min(...T)).toISOString():null,H=k?null:K.length?new Date(Math.max(...K)).toISOString():null,le=b.map((I,ye)=>{let ae=I.status,Se=["failed","stale","interrupted"].includes(ae),Me=[`is-${ae}`,Se?"is-error":"",["pending","skipped","idle"].includes(ae)?"is-missing":"",ae==="running"?"is-running":""].filter(Boolean).join(" "),$e=I.drawable?Is(I.computedDuration):"\u2014",Ce=As(ae).label,be=ae==="failed"?`\u539F\u56E0\uFF1A${String(I.error||I.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002").trim()}
\u5EFA\u8B70\uFF1A${String(I.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002").trim()}`:"",V=be?`<span class="badge badge-danger is-failure-tip" tabindex="0" aria-label="${r(be)}" data-failure-tip="${r(be)}"><span class="status-dot is-danger"></span>\u5931\u6557</span>`:r(Ce),he=ml(I),qe=Se?"var(--danger)":he,Le=ae==="running"?` \xB7 ${yt(I.percent)}`:"",Re="";if(I.bar){let F=Math.max(0,Math.min(100,I.bar.start)),we=Math.max(0,Math.min(100-F,I.bar.width)),Oe=["success","no_change"].includes(ae)?100:Math.max(0,Math.min(100,Number(I.percent)||0)),Ye=we*Oe/100,st=we-Ye;Ye>0&&(Re+=`<span class="rag-wf-bar workflow-wf-bar is-sequential" style="left:${F.toFixed(3)}%;width:${Ye.toFixed(4)}%;top:0;height:12px;--bar-color:${r(qe)}" aria-hidden="true"></span>`),st>1e-4&&(Re+=`<span class="rag-wf-bar workflow-wf-bar is-hollow is-sequential" style="left:${(F+Ye).toFixed(3)}%;width:${st.toFixed(4)}%;top:0;height:12px;--bar-color:${r(qe)}" aria-hidden="true"></span>`)}let R=I.label||I.key||"\u968E\u6BB5",D=qp(I),Q=`${R}\uFF1A${Ce}\uFF0C${ae==="running"?`\u9032\u5EA6 ${yt(I.percent)}\uFF0C`:""}\u8017\u6642 ${$e}`,C={...I,duration_ms:I.computedDuration,message:be||I.message||D||""},O=`${e.id}:${I.key||ye}`;return`<details class="rag-wf-stage workflow-wf-stage ${Me}" data-workflow-wf-stage="${r(O)}"${Gr.has(O)?" open":""} style="--stage-color:${r(he)}" ${wl(C)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="workflow-wf-step">${String(ye+1).padStart(2,"0")}</span> ${r(R)}</strong>${D?`<small>${r(D)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r($e)}${r(Le)} \xB7 ${V} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(Q)}">${Re}</span>
        </summary>
        <div class="rag-wf-details">${Lp(I,$e)}</div>
      </details>`}).join(""),Te=Xu[e.id]||"";return`<section class="report-card processing-card processing-workflow-progress-card workflow-wf-card" data-workflow-progress>
    <div class="side-card-head index-runtime-head workflow-wf-head">
      <span class="side-card-title">${m("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
      <div class="index-runtime-metrics workflow-wf-metrics">
        <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u5168\u90E8\u968E\u6BB5\u7684\u6578\u91CF\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${y} / ${L}</strong></span>
        <span class="index-runtime-metric" title="\u76EE\u524D\u57F7\u884C\u4E2D\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u57F7\u884C\u4E2D</span><strong>${M}</strong></span>
        <span class="index-runtime-metric" title="\u5C1A\u672A\u958B\u59CB\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7B49\u5F85</span><strong>${S}</strong></span>
        <span class="index-runtime-metric" title="\u672C\u6B21\u6D41\u7A0B\u4E0D\u9700\u8981\u57F7\u884C\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7565\u904E</span><strong>${h}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u968E\u6BB5\u8017\u6642\u5408\u8A08\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(fe)}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u53C3\u8207\u968E\u6BB5\u5B8C\u6210\u6BD4\u4F8B\u7684\u5E73\u5747\u3002"><span>\u6574\u9AD4\u9032\u5EA6</span><strong>${ve}</strong></span>
      </div>
    </div>
    <div class="workflow-wf-summary">
      <span>\u57F7\u884C <strong>${r(q)}</strong></span>
      <span>\u958B\u59CB <strong>${me?r(_e(me)):"\u2014"}</strong></span>
      <span>\u7D50\u675F <strong>${k?"\u9032\u884C\u4E2D":H?r(_e(H)):"\u2014"}</strong></span>
      <span>\u76EE\u524D <strong>${r(A)}</strong></span>
      <span>Run <strong class="mono">${r(t.run_id||"\u2014")}</strong></span>
    </div>
    <div class="workflow-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${r(fe)}</span>
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
        <span class="mono">${ve}</span>
      </div>
      <div class="workflow-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,Number.isFinite(J)?J:0)).toFixed(1)}%"></span>
      </div>
    </div>
    ${Te?`<p class="processing-workflow-scope-note">${m("info",12)}<span>${r(Te)}</span></p>`:""}
  </section>`}function xn(e){let t=String(e||"");return t.length===6?`${t.slice(0,4)}-${t.slice(4)}`:t||"\u2014"}function kl(e){return e?.scan_order==="issue_month"?"\u7D22\u5F15\u6383\u63CF\u9806\u5E8F\u4F9D\u6708\u4EFD\u7531\u820A\u5230\u65B0\uFF1B\u540C\u6708\u4EFD\u518D\u4F9D\u532F\u5165 ID\u3002":"\u6B64 run \u662F\u820A\u7248\u6383\u63CF\u9806\u5E8F\uFF08\u4F9D\u532F\u5165 ID\uFF0C\u975E\u6708\u4EFD\u9806\u5E8F\uFF09\uFF1B\u65B0 run \u624D\u6703\u7531\u6700\u820A\u6708\u4EFD\u958B\u59CB\u3002"}function Ep(e,t=!1){let s=Number(e?.reused),a=Number(e?.embedded);if(!Number.isFinite(s)||!Number.isFinite(a)||s<=0&&a<=0)return"";let n=[];if(s>0&&n.push(`<span class="index-current-phase is-reuse"
      title="R \xB7 \u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF0C\u672C\u6279 ${c(s)} \u7B46">
      <strong>R</strong><span>\u6CBF\u7528 ${c(s)} \u7B46</span>
    </span>`),a>0){let i=e.phase==="embedding"&&t?"\u8A08\u7B97\u4E2D":"\u65B0 embedding";n.push(`<span class="index-current-phase is-embed"
      title="E \xB7 \u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding\uFF0C\u672C\u6279 ${c(a)} \u7B46">
      <strong>E</strong><span>${i} ${c(a)} \u7B46</span>
    </span>`)}return`<span class="index-current-phases" aria-label="\u672C\u6279\u6B21 R\uFF0FE \u52D5\u4F5C">
    <span class="index-current-phase-label">\u672C\u6279</span>
    ${n.join("")}
  </span>`}function Np(e){let t=Array.isArray(e.months)?e.months:[],s=new Map;for(let n of t){let i=String(n.month||"");if(!/^\d{6}$/.test(i))continue;let o=s.get(i);o||(o={total:0,processed:0},s.set(i,o)),o.total+=Number(n.total)||0,o.processed+=Number(n.processed)||0}let a=0;for(let n of s.values())n.total>0&&n.processed>=n.total&&(a+=1);return{completed:a,total:s.size}}function ul(e){let t=String(e||"").match(/(\d{8})Update/i);return t?Number(t[1]):0}function Vt(e){let t=Number(e);return Number.isFinite(t)&&t>0?t:0}function pl(e,t){let s=Vt(t),a=Vt(e);if(s<=0)return{processed:0,total:0,percent:null,fill:0,complete:!1,empty:!0,stateClass:"is-empty"};let n=Math.min(100,Math.round(a/s*1e3)/10),i=a>=s;return{processed:a,total:s,percent:n,fill:i?100:n,complete:i,empty:!1,stateClass:i?"is-complete":"is-incomplete"}}function Sl(e){let t=Array.isArray(e.months)?e.months:[],s=e.current||{},a=!!s.preparing&&e.scan_order==="issue_month",n=new Map;for(let i of t){let o=String(i.month||"");if(!/^\d{6}$/.test(o))continue;let l=Number(o.slice(4,6));if(l<1||l>12)continue;let d=n.get(o);d||(d={key:o,year:o.slice(0,4),monthNo:l,rows:[],archives:[],current:!1,preparing:!1,currentArchive:"",jid:""},n.set(o,d));let p=String(i.archive||"");d.rows.push({archive:p,total:Vt(i.total),processed:Vt(i.processed)}),p&&d.archives.push(p),!a&&s.month===o&&(!s.archive||s.archive===p)&&(d.current=!0,d.preparing=!!s.preparing,d.currentArchive=String(s.archive||p||""),d.jid=String(s.jid||""))}return n}function Rp(e){let t=Sl(e),s=e.summary||{},a=e.copy||{},n=Vt(s.total),i=Vt(a.total),o=t.size,l=i>0?Math.min(i,n||i):0,d=i>0?Math.max(0,(n||i)-i):n,p=Vt(s.reused),g=Vt(s.embedded);return{totalMonths:o,reusePool:l,reused:p,reusePercent:l>0?Math.min(100,100*p/l):null,embedPool:d,embedded:g,embedPercent:d>0?Math.min(100,100*g/d):null}}function Cp(e){let t=Rp(e);if(!t.totalMonths)return"";let s=[],a=(n,i,o,l,d)=>{let p=l===null?0:Math.max(0,Math.min(100,l));s.push(`<div class="index-wf-are-row ${n}">
      <span class="index-wf-are-label"><i aria-hidden="true"></i>${r(i)}</span>
      <span class="index-wf-are-value">${r(o)}${d?`<small>${r(d)}</small>`:""}</span>
      <span class="index-wf-are-track" aria-hidden="true"><span style="width:${p.toFixed(1)}%"></span></span>
    </div>`)};return(t.reusePool>0||t.reused>0)&&a("is-reuse","R \u672C\u6B21\u6CBF\u7528",`${c(t.reused)} / ${c(t.reusePool)} \u7B46`,t.reusePercent,"04 \u9010\u6708\u6CBF\u7528"),t.embedPool>0?a("is-embed","E \u672C\u6B21\u65B0 embedding",`${c(t.embedded)} / ${c(t.embedPool)} \u7B46`,t.embedPercent,"E backlog"):a("is-embed is-complete","E \u672C\u6B21\u65B0 embedding","\u7121 E backlog",100,"\u4E0D\u9700\u65B0 embedding"),`<div class="index-wf-are-breakdown" aria-label="R\uFF0FE \u5206\u6D41">
    <div class="index-wf-are-head"><strong>R\uFF0FE \u5206\u6D41</strong><span>\u5169\u689D bar \u5404\u81EA\u4EE5\u81EA\u5DF1\u7684 total \u8A08\u7B97\uFF0C\u4E0D\u53EF\u76F8\u52A0\uFF1B\u7686\u70BA\u672C\u6B21 run\u3002</span></div>
    ${s.join("")}
  </div>`}function Pp(e){let t=e.current||{},s=!!e.coverage_only,a=e.active_archive_coverage||{},n=Sl(e);if(!n.size)return'<div class="processing-workflow-empty">\u5C1A\u7121\u53EF\u986F\u793A\u7684\u7D22\u5F15\u6708\u4EFD\uFF1B\u958B\u59CB\u7D22\u5F15\u5F8C\u6703\u4F9D\u6642\u9593\u5217\u51FA\u6708\u4EFD\u72C0\u614B\u3002</div>';let i={reuseComplete:0,reuseIncomplete:0,embedComplete:0,embedIncomplete:0};for(let u of n.values()){let b=[...u.rows].sort((H,le)=>ul(le.archive)-ul(H.archive)),y=b[0],k=b.length>1?b.slice(1):[y],S=(a[u.key]||{})[y.archive],h=Vt(S?.total),L=Vt(S?.processed),X=h>0&&L>=h,J=k.reduce((H,le)=>H+le.total,0),ve=k.reduce((H,le)=>H+le.processed,0),fe=y.total,se=y.processed,q=pl(ve,J),A=!s&&X,me=pl(A?L:se,A?h:fe);u.latest=y,u.baselineRows=k,u.reuseState=q,u.embedState=me,u.reuseComplete=q.complete,u.embedComplete=me.complete,u.embedNoBacklog=A,q.complete?i.reuseComplete+=1:i.reuseIncomplete+=1,me.complete?i.embedComplete+=1:i.embedIncomplete+=1}let l=[...new Set([...n.values()].map(u=>u.year))].sort((u,b)=>b.localeCompare(u)).map(u=>{let b=Array.from({length:12},(y,k)=>{let M=k+1,S=`${u}${String(M).padStart(2,"0")}`,h=n.get(S);if(!h)return`<td class="judgment-month is-empty"><span>${M}</span></td>`;let L=h.current&&e.run_status==="running",X=T=>T.percent===null?"\u2014":`${T.percent}%`,J=T=>T.empty?"\u7121\u8CC7\u6599":T.complete?"\u5B8C\u6210":"\u672A\u5B8C\u6210",ve=String(t.phase||"")==="embedding"?"E \u65B0 embedding":String(t.phase||"")==="reuse"?"R \u91CD\u7528":"R\uFF0FE",fe=h.latest&&h.latest.total>0?`${(100*h.latest.processed/h.latest.total).toFixed(1)}%`:"\u2014",se=h.current&&h.latest?`\u672C\u6B21 run ${ve} ${c(h.latest.processed)} / ${c(h.latest.total)}\uFF08${fe}\uFF09`:"",q=[`${h.year}-${String(h.monthNo).padStart(2,"0")}`,h.archives.join("\u3001")||"\u2014",`R \u672C\u6B21\u6CBF\u7528 ${c(h.reuseState.processed)} / ${c(h.reuseState.total)}\uFF08${X(h.reuseState)}\uFF09\xB7 ${J(h.reuseState)}`,h.embedNoBacklog?`E \u7121 E backlog\uFF08latest archive \u5DF2\u7531 active \u7248\u672C\u8986\u84CB ${c(h.embedState.total)} \u7B46\uFF1B\u4E0D\u9700\u65B0 embedding\uFF09`:`E \u65B0 embedding ${c(h.embedState.processed)} / ${c(h.embedState.total)}\uFF08${X(h.embedState)}\uFF09\xB7 ${J(h.embedState)}`,h.reuseComplete?"":"\u5F85\u5B8C\u6210\uFF1AR \u65E2\u6709\u5411\u91CF\u91CD\u7528",h.embedComplete?"":"\u5F85\u5B8C\u6210\uFF1AE \u65B0 embedding",se,h.current?`${h.preparing?"\u6E96\u5099\u7D22\u5F15":L?"\u76EE\u524D\u7D22\u5F15":"\u6700\u5F8C\u7D22\u5F15"} \xB7 ${ve}${h.jid?` \xB7 ${h.jid}`:""}`:""].filter(Boolean).join(" \xB7 "),A=[["is-reuse",h.reuseState],["is-embed",h.embedState]].map(([T,K])=>`<span class="index-month-block ${T} ${K.stateClass}" style="--fill:${K.fill.toFixed(1)}%"></span>`).join("");return`<td class="judgment-month index-month index-month-are processing-month is-neutral${L?" is-current":""}" title="${r(q)}"${L?' aria-current="true"':""}><span class="index-month-number">${M}</span><span class="index-month-blocks" aria-hidden="true">${A}</span></td>`}).join("");return`<tr><th scope="row">${r(u)}</th>${b}</tr>`}).join(""),d=e.copy||{},p=Vt(d.total),g=Vt(d.copied),$=d.status==="success"?"\u5B8C\u6210":d.status==="running"?"\u57F7\u884C\u4E2D":d.status==="stale"?"\u4E2D\u6B62":"\u7B49\u5F85";return`<div class="judgment-months index-months">
    ${!s&&p>0?`<div class="index-copy-global-chip" title="03 \u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF\u662F\u5168\u57DF points \u6E96\u5099\u968E\u6BB5\uFF0C\u4E0D\u5217\u5165\u6708\u4EFD R\uFF0FE\uFF1BR \u662F 04 \u9010\u6708\u6383\u63CF\u9032\u5EA6\u3002">
          <span class="badge badge-neutral">03 \u8907\u88FD\uFF08\u5168\u57DF\uFF09</span>
          <span class="mono">${c(g)} / ${c(p)} points</span>
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
    <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA R\uFF08\u672C\u6B21\u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF09\u3001E\uFF08\u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding\uFF09\uFF0C\u5169\u683C\u90FD\u662F\u672C\u6B21 run \u7684\u9032\u5EA6\uFF1B\u5B8C\u6210\u70BA\u5BE6\u5FC3\uFF1B\u672A\u5B8C\u6210\u6642\u5DF2\u5B8C\u6210\u6BD4\u4F8B\u70BA\u5BE6\u8272\u3001\u5269\u9918\u5340\u6BB5\u70BA\u540C\u8272 25% \u6DFA\u8272\uFF0C\u56E0\u6B64 0% \u6642\u6574\u683C\u90FD\u662F\u6DFA\u8272\uFF1B\u7121\u8CC7\u6599\u624D\u662F\u6DE1\u8272\u7A7A\u5FC3\u3002\u6700\u65B0 archive \u5DF2\u88AB active collection \u5B8C\u6574\u8986\u84CB\uFF08\u7121 E backlog\uFF09\u7684\u672A\u8B8A\u66F4\u6708\u4EFD\uFF0CE \u53EF\u4F7F\u7528 active \u8986\u84CB\u986F\u793A\u5B8C\u6210\uFF1BR \u4E00\u5F8B\u4F7F\u7528\u672C\u6B21 run \u7684 processed\uFF0Ftotal\uFF0C\u5C1A\u672A\u6383\u5230\u7684\u5F8C\u7E8C\u6708\u4EFD\u7DAD\u6301 25% \u6DFA\u8272\u3002\u4ECD\u6709 E backlog \u7684\u6708\u4EFD\uFF0CR\uFF0FE \u90FD\u4F7F\u7528\u672C\u6B21 run \u7684 processed\uFF0Ftotal\u3002E \u7121 backlog \u6642\u82E5\u986F\u793A\u5BE6\u5FC3\uFF0Ctooltip \u6703\u6A19\u793A\u4E0D\u9700\u65B0 embedding\u300203 \u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF\u662F\u5168\u57DF points \u6E96\u5099\u968E\u6BB5\uFF0C\u4E0D\u6703\u91CD\u8907\u756B\u6210\u6708\u4EFD\u5206\u683C\uFF1BR \u662F 04 \u9010\u6708\u6383\u63CF\u9032\u5EA6\u3002summary \u8207\u65B9\u584A\u4F7F\u7528\u540C\u4E00\u4EFD\u72C0\u614B\uFF0Csidebar \u66F4\u65B0 badge \u53E6\u4EE5 E backlog \u6708\u4EFD\u8A08\u3002\u540C\u4E00\u6708\u4EFD\u53EF\u80FD\u6709\u591A\u500B archive\uFF0CR \u4F7F\u7528\u8F03\u820A\u7684\u57FA\u7DDA archive\uFF0CE \u4F7F\u7528\u540D\u7A31\u4E2D\u66F4\u65B0\u65E5\u671F\u6700\u65B0\u7684 archive\uFF1B\u65B0\u820A archive \u4E0D\u6703\u76F8\u52A0\u3002E \u5B8C\u6210\uFF0F\u672A\u5B8C\u6210\u4EE5\u6708\u4EFD\u8A08\uFF0C\u4E0D\u662F RAR \u6A94\u6578\u3002${kl(e)}\u7DA0\u6846\u53EA\u6A19\u793A\u76EE\u524D\u6279\u6B21\u6240\u5728\u6708\u4EFD\u3002\u76EE\u524D\u7D22\u5F15\u6708\u4EFD\u4EE5\u5BE6\u7DDA\u5916\u6846\u6A19\u793A\uFF0Cpadding \u4E0D\u4F7F\u7528\u72C0\u614B\u5E95\u8272\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B R\uFF0FE \u9032\u5EA6\u8207\u76EE\u524D\u6848\u865F\u3002</p>
  </div>`}function Ip(e){let t=e.import_timeline||{},s=Array.isArray(t.months)?t.months:[];if(!s.length)return`<section class="report-card processing-card import-files-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u672A\u53D6\u5F97\u5224\u6C7A\u4E0B\u8F09 manifest \u6216\u672C\u6A5F\u58D3\u7E2E\u6A94\uFF1B\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u5F8C\u6703\u986F\u793A\u6708\u4EFD\u72C0\u614B\u3002</div>
    </section>`;let a=new Map(s.map(v=>[String(v.month),v])),n=[...new Set(s.map(v=>v.year))].sort((v,u)=>u-v),i=["extract","raw_parquet","filter","postgres"],o=t.stage_labels||{},l=n.map(v=>{let u=Array.from({length:12},(b,y)=>{let k=y+1,M=`${v}${String(k).padStart(2,"0")}`,S=a.get(M);return Jr({month:S,year:v,monthNo:k,stageOrder:i,stageLabels:o,stageStatuses:S?.import_stages||{},stageProgress:S?.import_stage_progress||{},overall:S?.import_overall||"empty",active:!!S?.active,processing:String(S?.month||"")===String(t.processing_month||""),workflowForStage:()=>"judgment_import",variant:"import"})}).join("");return`<tr><th scope="row">${r(v)}</th>${u}</tr>`}).join(""),d=t.summary||{},p=t.stage_summary||{},g=s.find(v=>v.active),$=g?`<div class="index-current-row">${fl({activeMonth:t.active_month||String(g.month||""),activeArchive:t.active_archive||g.active_archive||"",activePhase:t.active_phase||"",processingMonth:t.processing_month||"",processingArchive:t.processing_archive||"",stageLabels:o})}</div>`:"";return`<section class="report-card processing-card import-files-card" data-import-timeline="judgment">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
      ${rp(t,s,p,d)}
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(v,u)=>`<th scope="col">${u+1}</th>`).join("")}</tr></thead>
          <tbody>${l}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\uFF1ARAR \u6AA2\u67E5\uFF0F\u89E3\u58D3\u7E2E\u3001\u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD\u3001\u91D1\u878D\u6CD5\u898F\u7BE9\u9078\u3001PostgreSQL metadata\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF1B\u6709\u5F85\u66F4\u65B0\u6A94\u6848\u6642\uFF0C\u5C1A\u672A\u91CD\u505A\u7684\u56DB\u500B\u968E\u6BB5\u65B9\u683C\u4EE5\u6DFA\u6A58\uFF0F\u6DFA\u7D05\uFF0F\u6DFA\u7D2B\uFF0F\u6DFA\u85CD\u8868\u793A\uFF0C\u5B8C\u6210\u5F8C\u8F49\u70BA\u5BE6\u5FC3\u6DF1\u8272\uFF1B\u5C1A\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF1B\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u5B8C\u6210\u8272\u5782\u76F4\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u672A\u5B8C\u6210\u5340\u6BB5\u7DAD\u6301 25% \u6DFA\u8272\uFF1B\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u539F\u59CB\u8CC7\u6599\u968E\u6BB5\u6703\u5148\u6AA2\u67E5\u65E2\u6709 Parquet\uFF0C\u53EF\u6CBF\u7528\u6642\u4E0D\u91CD\u65B0\u5099\u4EFD\uFF1B\u7F3A\u5C11\u6642\u6703\u986F\u793A\u300C\u5EFA\u7ACB YYYY-MM \u5099\u4EFD\u300D\uFF0C\u5B8C\u6210\u5F8C\u986F\u793A\u300C\u5DF2\u5EFA\u7ACB\u5099\u4EFD\u300D\u3002\u7BE9\u9078\u8207 PostgreSQL \u968E\u6BB5\u6703\u986F\u793A\u76EE\u524D\u8655\u7406\u7684\u6708\u4EFD\u8207 archive\u3002\u5BE6\u7DDA\u6846\u6A19\u793A\u76EE\u524D\u532F\u5165\u6708\u4EFD\uFF1B\u82E5\u5BE6\u969B\u8655\u7406\u7684\u662F\u8F03\u820A\u6708\u4EFD\uFF0C\u8A72\u6708\u53E6\u4EE5\u865B\u7DDA\u6846\u6A19\u793A\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u56DB\u500B\u968E\u6BB5\u7684\u72C0\u614B\u3001\u672C\u6A5F\u58D3\u7E2E\u6A94\u8207\u5DF2\u532F\u5165\u6A94\u540D\u3002</p>
    </div>
  </section>`}function xl(e,t,s){let n=[t.run_id||e.active_run?.id||e.last_run?.id||"",t.version_id??"",t.collection||"",t.started_at||""].join("|"),i=Date.now(),o=sl.get(n);if(!o){let v=Date.parse(t.started_at||""),u=Date.parse(t.finished_at||""),b=Date.parse(t.updated_at||"");t.run_status!=="running"&&Number.isFinite(v)&&(Number.isFinite(u)||Number.isFinite(b))?o={at:v,indexed:0}:o={at:i,indexed:Math.max(0,s)},sl.set(n,o)}let l=Date.parse(t.finished_at||""),d=Date.parse(t.updated_at||""),p=t.run_status==="running"?i:Number.isFinite(l)?l:Number.isFinite(d)?d:i,g=Math.max(0,(p-Number(o.at||0))/1e3),$=Math.max(0,Number(s)-Number(o.indexed||0));return g<=0||$<=0?0:$/g}function Is(e){let t=Number(e);return!Number.isFinite(t)||t<0?"\u2014":t>=36e5?Al(t):ge(t)}function Al(e){if(!Number.isFinite(e)||e<0)return"\u2014";let t=Math.max(0,Math.round(e/1e3)),s=Math.floor(t/3600),a=Math.floor(t%3600/60),n=t%60,i=String(n).padStart(2,"0");return s>0?`${s}h ${String(a).padStart(2,"0")}m ${i}s`:a>0?`${a}m ${i}s`:`${n}s`}function Ml(e,t,s,a){let n=Date.parse(e.started_at||"");if(!Number.isFinite(n))return{elapsedMs:null,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let i=e.run_status==="running",o=Date.parse(e.finished_at||""),l=Date.parse(e.updated_at||""),d=i?Date.now():Number.isFinite(o)?o:Number.isFinite(l)?l:Date.now(),p=Math.max(0,d-n),g=Number(s),$=Number(t);if(!Number.isFinite(g)||g<=0)return{elapsedMs:p,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let v=Math.max(0,g-Math.max(0,Number.isFinite($)?$:0));if(v<=0)return{elapsedMs:p,estimatedTotalMs:p,remainingMs:0,remainingCount:0};if(!i||a<=0)return{elapsedMs:p,estimatedTotalMs:null,remainingMs:null,remainingCount:v};let u=v/a*1e3;return{elapsedMs:p,estimatedTotalMs:p+u,remainingMs:u,remainingCount:v}}function Dp(e){let t=e.index_runtime||{};if(!t.available)return"";let s=!!t.coverage_only,a=kl(t),n=t.current||{},i=t.summary||{},o=Number(i.indexed??n.indexed??0),l=s?0:xl(e,t,o),d=Np(t),p=s?null:Ml(t,o,i.total,l),g=p?.remainingCount>0?`\u8207\u5269\u9918 ${c(p.remainingCount)} \u7B46`:"",$=l>0?`\u4F9D\u672C\u6B21\u5E73\u5747 ${l.toFixed(1)} \u7B46/\u79D2${g}\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002\u5BE6\u969B\u901F\u5EA6\u6703\u96A8 embedding \u8207\u6279\u6B21\u5927\u5C0F\u8B8A\u52D5\u3002`:"\u5C1A\u7121\u8DB3\u5920\u7684\u672C\u9801\u89C0\u5BDF\u8CC7\u6599\u53EF\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002",v=h=>r(Al(p?p[h]:null)),u=`<div class="index-runtime-metrics">
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
    <span class="index-runtime-metric" title="\u81EA\u672C\u6B21\u7D22\u5F15 run \u958B\u59CB\u6642\u9593 ${r(_e(t.started_at))} \u8D77\u7B97\uFF1B\u4E2D\u9014\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002">
      <span>Elapsed Time</span>
      <strong>${v("elapsedMs")}</strong>
    </span>
    <span class="index-runtime-metric" title="Elapsed Time \u52A0\u4E0A\u4F9D\u5269\u9918\u4EF6\u6578\u8207\u672C\u6B21\u5E73\u5747\u901F\u5EA6\u4F30\u7B97\u7684\u5269\u9918\u6642\u9593\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u5F9E 0 \u91CD\u65B0\u8A08\u6642\u3002">
      <span>Estimated Total</span>
      <strong>${v("estimatedTotalMs")}</strong>
    </span>
    <span class="index-runtime-metric" title="${r($)}">
      <span>Time Remaining</span>
      <strong>${v("remainingMs")}</strong>
    </span>
  </div>`,b=t.run_status==="running"?n.preparing?"\u6E96\u5099\u4E2D":"\u76EE\u524D\u8655\u7406":"\u6700\u5F8C\u8655\u7406",y=!!n.preparing&&t.scan_order==="issue_month",k=t.copy||{},M=Number(k.total)>0?`\u8907\u88FD ${c(k.copied)} / ${c(k.total)} points`:"\u5EFA\u7ACB\u65B0\u7248\u672C collection",S=y?`<div class="index-current-row">
        <span class="badge badge-info" title="${r(a)}">${m("activity",11)}\u6E96\u5099\u4E2D</span>
        <span class="index-current-copy">${r(M)}\uFF1B\u7248\u672C\u6E96\u5099\u5B8C\u6210\u5F8C\u6703\u5F9E\u6700\u820A\u6708\u4EFD\u958B\u59CB\u7D22\u5F15\uFF0C\u7B2C\u4E00\u6279\u958B\u59CB\u524D\u4E0D\u6A19\u793A\u76EE\u524D\u6708\u4EFD\u3002</span>
      </div>`:n.jid?`<div class="index-current-row">
        <span class="badge badge-info" title="${r(a)}">${m("activity",11)}${b}</span>
        <strong class="mono">${r(xn(n.month))}</strong>
        <span class="mono">${r(n.archive||"\u2014")}</span>
        ${n.preparing?"":Ep(n,t.run_status==="running")}
        <span class="mono">${r(n.jid||"\u2014")}</span>
        <span class="index-current-copy">${r([n.court,n.title].filter(Boolean).join(" \xB7 ")||"\u2014")}</span>
        <span class="faint">${n.preparing?"\u6E96\u5099\u4E2D":`\u6279\u6B21 ${c(n.batch_size)} \u7B46`}</span>
      </div>`:"";return`<section class="report-card processing-card index-files-card">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m("table",14)}04 \u91D1\u878D\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6708\u4EFD R\uFF0FE</span>
      ${u}
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
    ${Pp(t)}
    ${s?'<p class="judgment-months-hint index-coverage-note">\u76EE\u524D\u6C92\u6709\u672C\u6B21\u7D22\u5F15 run\uFF1BR\uFF0FE \u6642\u9593\u8868\u6703\u5728\u7248\u672C\u5EFA\u7F6E\u958B\u59CB\u5F8C\u986F\u793A\u672C\u6B21\u9032\u5EA6\u3002</p>':""}
  </section>`}function Bp(e={}){let{storage:t,loading:s,error:a}=e;if(a)return`<section class="report-card processing-card index-storage-card">
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
    </section>`;let n=t.qdrant_storage||{},o=(Array.isArray(t.databases)?t.databases:[]).find(g=>g.id==="qdrant")||{},l=n.volume_bytes??o.volume_bytes??null,d=n.points_count??o.points_count,p=n.segments_count??o.segments_count;return`<section class="report-card processing-card index-storage-card">
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
      <span>Volume \u5BB9\u91CF</span><strong class="mono">${Ee(l)}${n.volume_size?` \xB7 ${r(n.volume_size)}`:""}</strong>
      <span>Volume \u4F86\u6E90\u8DEF\u5F91</span><strong class="mono index-storage-path">${r(n.host_path||"\u2014")}</strong>
      <span>Collection</span><strong class="mono">${r(n.collection||o.collection||"\u2014")}</strong>
      <span>Alias</span><strong class="mono">${r(n.alias||"\u2014")}</strong>
      <span>Points\uFF0FSegments</span><strong class="mono">${c(d)} / ${c(p)}</strong>
    </div>
    <div class="index-runtime-foot">\u8CC7\u6599\u6642\u9593 ${r(_e(t.checked_at))}</div>
  </section>`}function Kr({badge:e="",lead:t="",rows:s=[],note:a=""}){return`<section class="report-card processing-card parquet-help-card workflow-help-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("info",14)}\u529F\u80FD\u8AAA\u660E</span>
      ${e?`<span class="badge badge-neutral">${r(e)}</span>`:""}
    </div>
    <div class="parquet-help-body">
      <p class="parquet-help-lead">${t}</p>
      <div class="parquet-help-grid">${s.map(([n,i])=>`<span>${r(n)}</span><strong>${i}</strong>`).join("")}</div>
      ${a?`<p class="parquet-help-note">${a}</p>`:""}
    </div>
  </section>`}function Fp(){return Kr({badge:"\u552F\u8B80\u532F\u51FA",lead:"\u5C07 PostgreSQL \u76EE\u524D\u6709\u6548\u7684\u5224\u6C7A\uFF08<code>judgment_documents.is_current = true</code>\uFF09\u532F\u51FA\u6210\u7368\u7ACB\u7684 Parquet \u5FEB\u7167\uFF0C\u4F9B\u96E2\u7DDA\u5206\u6790\u3001\u8CC7\u6599\u4EA4\u63DB\u6216\u4FDD\u5B58\u3002",rows:[["\u4F86\u6E90","PostgreSQL <code>judgment_documents</code>\uFF0C\u53EA\u542B\u76EE\u524D\u6709\u6548\u4E14\u5DF2\u547D\u4E2D\u91D1\u878D\u6CD5\u898F\u6E05\u55AE\u7684\u5224\u6C7A\u3002"],["\u8F38\u51FA",'<span class="mono">JUDGMENT_DATA_DIR/parquet/judgments/YYYYMMDD/HHMMSS-xxxxxxxx/judgments.parquet</span>'],["\u9644\u5E36\u6A94",'<span class="mono">\u540C\u76EE\u9304 manifest.json\uFF08\u7B46\u6578\u3001\u6A94\u6848\u5927\u5C0F\u3001\u6B04\u4F4D\u3001\u7522\u751F\u6642\u9593\uFF09</span>'],["\u5167\u5BB9","\u6848\u865F\u3001\u6CD5\u9662\u3001\u6848\u7531\u3001\u5168\u6587\u3001\u547D\u4E2D\u6CD5\u898F\u3001\u5F15\u7528\u3001\u4F86\u6E90\u58D3\u7E2E\u6A94\u8207\u6642\u9593\u6B04\u4F4D\uFF1B<code>citations</code> \u4EE5 JSON \u5B57\u4E32\u4FDD\u5B58\u3002"],["\u8207\u539F\u59CB Parquet","\u8CC7\u6599\u9801\u8207 <code>source=parquet</code> \u4F7F\u7528 <code>parquet/raw_judgments/.../raw.parquet</code>\uFF1B\u672C\u6D41\u7A0B\u7684 <code>parquet/judgments/...</code> \u662F\u53E6\u4E00\u500B\u6B63\u898F\u5316\u5FEB\u7167\u3002"],["\u4E0D\u6703","\u4E0D\u5BEB\u56DE PostgreSQL\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u820A\u5FEB\u7167\uFF1B\u53EA\u532F\u51FA current \u8CC7\u6599\uFF0C\u4E0D\u542B\u6B77\u53F2\u7248\u672C\u3002"],["\u4E2D\u65B7","\u6BCF\u6B21\u57F7\u884C\u5EFA\u7ACB\u65B0\u7684\u5B8C\u6574\u5FEB\u7167\uFF1B\u4E2D\u65B7\u5F8C\u91CD\u65B0\u57F7\u884C\u4E0D\u6703\u7E8C\u5BEB\u540C\u4E00\u500B Parquet \u6A94\u3002"]],note:"\u9069\u5408 DuckDB\u3001pandas\u3001Spark \u7B49\u96E2\u7DDA\u5206\u6790\uFF0C\u6216\u9700\u8981\u56FA\u5B9A\u6642\u9593\u9EDE\u7684\u53EF\u91CD\u73FE\u8CC7\u6599\u5FEB\u7167\u3002\u65E5\u5E38 RAG \u67E5\u8A62\u8207\u8CC7\u6599\u9801\u700F\u89BD\u4E0D\u9700\u8981\u57F7\u884C\u6B64\u6D41\u7A0B\u3002"})}function Op(){return Kr({badge:"PostgreSQL \u56DE\u586B",lead:"\u5C07\u5224\u6C7A\u7684 <code>court</code> \u8F49\u6210\u6A19\u6E96\u6CD5\u9662\u540D\u7A31\u4E26\u5BEB\u5165 <code>court_normalized</code>\uFF1B\u539F\u59CB <code>court</code> \u6703\u4FDD\u7559\u4F9B\u8FFD\u6EAF\u3002",rows:[["\u8655\u7406\u7BC4\u570D","\u9810\u8A2D\u53EA\u8655\u7406 <code>court_normalized</code> \u70BA\u7A7A\u7684\u8CC7\u6599\uFF1B\u5DF2\u6B63\u898F\u5316\u8CC7\u6599\u6703\u8DF3\u904E\uFF0C\u53EF\u7528 <code>--all</code> \u91CD\u65B0\u8A08\u7B97\u5168\u90E8\u3002"],["\u89E3\u6790\u9806\u5E8F","\u539F\u59CB\u6CD5\u9662\u503C\u958B\u982D\u7B26\u5408\u6A19\u6E96\u540D\u7A31 \u2192 \u5224\u6C7A\u5168\u6587\u524D 8,000 \u5B57\u6700\u65E9\u51FA\u73FE\u7684\u6CD5\u9662 \u2192 \u539F\u59CB\u6CD5\u9662\u503C\u4EFB\u610F\u4F4D\u7F6E\u7684\u6A19\u6E96\u540D\u7A31 \u2192 JID \u5B98\u65B9\u6CD5\u9662\u4EE3\u78BC\u3002"],["\u8F38\u51FA","\u5BEB\u5165 <code>judgment_documents.court_normalized</code>\uFF1B\u4E0D\u4FEE\u6539\u539F\u59CB <code>court</code>\u3001\u5168\u6587\u6216\u5176\u4ED6\u5224\u6C7A\u6B04\u4F4D\u3002"],["\u672A\u89E3\u6790","\u7121\u6CD5\u5224\u65B7\u6642\u4FDD\u7559\u7A7A\u503C\uFF0C\u4E0D\u731C\u6E2C\uFF1B\u6458\u8981\u6703\u5217\u51FA\u672A\u89E3\u6790\u7B46\u6578\u8207\u5E38\u898B\u6A23\u672C\u3002"],["\u5F71\u97FF","\u8CC7\u6599\u9801\u7684\u6CD5\u9662\u4E0B\u62C9\u3001\u7CBE\u78BA\u7BE9\u9078\u3001\u6392\u5E8F\u3001\u7D50\u679C\u6B04\u4F4D\u8207\u5224\u6C7A\u539F\u6587\u4F7F\u7528\u6B63\u898F\u5316\u540D\u7A31\uFF1BAPI \u4ECD\u56DE\u50B3 <code>court_raw</code>\u3002"],["\u4E0D\u6703","\u4E0D\u91CD\u65B0\u532F\u5165\u5224\u6C7A\u3001\u4E0D\u6539\u5168\u6587\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u8CC7\u6599\u3002"],["\u91CD\u8DD1","\u9810\u8A2D\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u898F\u5247\u66F4\u65B0\u5F8C\u53EF\u7528 <code>--all</code> \u91CD\u7B97\uFF0C\u6216\u5148\u7528 <code>--dry-run</code> \u7D71\u8A08\u3002"]],note:"\u9069\u5408\u5728\u5224\u6C7A\u532F\u5165\u5F8C\u3001\u6CD5\u9662\u540D\u7A31\u898F\u5247\u66F4\u65B0\u5F8C\uFF0C\u6216\u8CC7\u6599\u9801\u6CD5\u9662\u9078\u9805\u51FA\u73FE\u7F3A\u6F0F\u6642\u57F7\u884C\u3002\u7D50\u679C\u4E5F\u6703\u5BEB\u5165\u6548\u80FD\u7D00\u9304\u3002"})}function Hp(){return Kr({badge:"\u689D\u6587\u6B77\u53F2\u5EFA\u6A94",lead:"\u70BA\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u5EFA\u7ACB <code>law_article_versions</code> \u6B77\u53F2\u689D\u6587\u5FEB\u7167\u8207 <code>law_article_change_events</code> \u8B8A\u66F4\u7D00\u9304\uFF0C\u8B93\u8CC7\u6599\u9801\u80FD\u5207\u63DB\u6B77\u53F2\u7248\u672C\u4E26\u67E5\u770B\u689D\u6587\u5DEE\u7570\u3002",rows:[["\u4F86\u6E90","PostgreSQL \u6CD5\u898F\u7248\u672C\uFF0C\u4EE5\u53CA <code>LAW_DATA_DIR/raw_parquet</code> \u5167\u5C0D\u61C9\u7684\u539F\u59CB\u6CD5\u898F Parquet \u5FEB\u7167\u3002"],["\u5339\u914D\u65B9\u5F0F","\u4EE5 raw Parquet manifest \u7684 <code>zip_sha256</code>\uFF0F<code>raw_json_sha256</code> \u5C0D\u61C9\u6CD5\u898F\u7248\u672C\uFF0C\u4E0D\u731C\u6E2C\u5167\u5BB9\u3002"],["\u7522\u751F\u5167\u5BB9","<code>article_key</code>\uFF08\u689D\u6587\u985E\u578B\uFF0B\u689D\u865F\uFF09\u3001<code>content_hash</code>\u3001\u689D\u6587\u5168\u6587\u8207\u751F\u6548\u65E5\uFF1B\u8207\u524D\u4E00\u7248\u672C\u6BD4\u8F03\u5F8C\u8A18\u9304 <code>added</code>\uFF0F<code>modified</code>\uFF0F<code>removed</code>\u3002"],["\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB","\u5206\u9801\u4E0A\u65B9\u7684\u552F\u8B80\u6AA2\u67E5\u6703\u8B80\u53D6 <code>law_article_versions</code> \u8207\u539F\u59CB Parquet\uFF0C\u5224\u65B7\u7248\u672C\u662F\u5426\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\uFF1B\u6AA2\u67E5\u672C\u8EAB\u4E0D\u6703\u4FEE\u6539\u8CC7\u6599\u5EAB\u3002"],["\u53EF\u5EFA\u7ACB","\u627E\u5230\u5C0D\u61C9\u539F\u59CB Parquet \u7684\u7248\u672C\uFF0C\u53EF\u76F4\u63A5\u57F7\u884C\u6B64\u6D41\u7A0B\u5EFA\u7ACB\u689D\u6587\u6B77\u53F2\u3002"],["\u7F3A\u539F\u59CB\u6A94","\u627E\u4E0D\u5230\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u6A19\u793A\u7121\u6CD5\u5EFA\u7ACB\uFF0C\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD\uFF1B\u6B64\u6D41\u7A0B\u6703\u8DF3\u904E\u4E26\u5217\u5728 <code>missing_versions</code>\u3002"],["\u6AA2\u67E5\u7D50\u679C","\u5E74\u4EFD\xD7\u6708\u4EFD\u8868\u986F\u793A\u5DF2\u5EFA\u7ACB\uFF0F\u672A\u5EFA\u7ACB\uFF0F\u90E8\u5206\u5EFA\u7ACB\uFF1B\u4E0B\u65B9\u5217\u51FA\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u7248\u672C\u65E5\u671F\u8207\u53EF\u5EFA\u7ACB\u72C0\u614B\u3002\u76EE\u524D\u72C0\u614B\u4EE5\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u5361\u7247\u5373\u6642\u986F\u793A\u3002"],["\u8DF3\u904E\u689D\u4EF6","\u5DF2\u6709\u689D\u6587\u5FEB\u7167\u7684\u7248\u672C\u6703\u8DF3\u904E\uFF1B\u627E\u4E0D\u5230\u53EF\u8B80\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u5217\u5165 <code>missing_versions</code>\uFF0C\u4E0D\u5EFA\u7ACB\u865B\u69CB\u689D\u6587\u3002"],["\u4E0D\u6703","\u4E0D\u4E0B\u8F09\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u4E0D\u89E3\u6790\u65B0 ZIP\u3001\u4E0D\u4FEE\u6539 <code>law_documents</code> \u6216\u76EE\u524D\u7248\u672C\u3001\u4E0D\u66F4\u65B0 Qdrant\uFF0FIndexedDB\u3002"],["\u8F38\u51FA\u6458\u8981","\u7248\u672C\u6578\u3001\u8DF3\u904E\u7248\u672C\u6578\u3001\u7F3A\u5C11\u5FEB\u7167\u7248\u672C\u3001\u5BEB\u5165\u689D\u6587\u6578\u8207\u689D\u6587\u8B8A\u66F4\u4E8B\u4EF6\u6578\u3002"],["\u91CD\u8DD1","\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u5DF2\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u4E0D\u6703\u91CD\u8907\u63D2\u5165\u3002"]],note:"\u9069\u5408\u5F9E\u820A\u7248 schema \u5347\u7D1A\u3001\u65E2\u6709\u6CD5\u898F\u7248\u672C\u7F3A\u5C11\u6B77\u53F2\u689D\u6587\uFF0C\u6216\u8CC7\u6599\u9801\u6B77\u53F2\u689D\u6587\u7248\u672C\u8207\u8B8A\u66F4\u7D00\u9304\u4E0D\u5B8C\u6574\u6642\u57F7\u884C\u3002\u57F7\u884C\u524D\u53EF\u5148\u7528\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u78BA\u8A8D\u54EA\u4E9B\u7248\u672C\u53EF\u5EFA\u7ACB\u3001\u54EA\u4E9B\u7F3A\u539F\u59CB\u6A94\u3002"})}function zp(e={}){let t=e.courtCheck,s=!!e.courtCheckLoading,a=e.courtCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-court-check"${s?" disabled":""}>${m("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31"}</span></button>`;if(a)return`<section class="report-card processing-card court-check-card">
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
    </section>`;let d={green:"\u5DF2\u6AA2\u67E5",red:"\u9700\u6B63\u898F\u5316\uFF08\u5B8C\u5168\u672A\u6AA2\u67E5\uFF09",gray:"\u9700\u6B63\u898F\u5316"},p=new Map(i.map(v=>[String(v.month),v])),$=[...new Set(i.map(v=>v.year))].sort((v,u)=>u-v).map(v=>{let u=Array.from({length:12},(b,y)=>{let k=y+1,M=`${v}${String(k).padStart(2,"0")}`,S=p.get(M);if(!S)return`<td class="judgment-month is-empty"><span>${k}</span></td>`;let h=d[S.status]?S.status:"red",L=[`${v}-${String(k).padStart(2,"0")}`,d[h],`\u7E3D ${c(S.total)} \u7B46`,`\u5DF2\u6AA2\u67E5 ${c(S.checked)} \u7B46`,`\u672A\u6AA2\u67E5 ${c(S.unchecked)} \u7B46`,S.invalid?`\u7121\u6548\u503C ${c(S.invalid)} \u7B46`:"",`\u6709\u6548 ${yt(S.percent)}`].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month court-check-month is-${h==="gray"?"red":h}" title="${r(L)}"><span>${k}</span></td>`}).join("");return`<tr><th scope="row">${r(v)}</th>${u}</tr>`}).join("");return`<section class="report-card processing-card court-check-card">
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(v,u)=>`<th scope="col">${u+1}</th>`).join("")}</tr></thead>
          <tbody>${$}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u5168\u90E8\u5DF2\u6B63\u898F\u5316\uFF1B\u7D05\u8272\uFF1A\u9700\u6B63\u898F\u5316\uFF08\u542B\u5B8C\u5168\u672A\u6AA2\u67E5\u3001\u90E8\u5206\u672A\u6B63\u898F\u5316\u6216\u7121\u6548\u503C\uFF09\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002summary \u7684\u7D05\u8272\u6578\u5B57\u70BA\u9700\u6B63\u898F\u5316\u6708\u4EFD\u6578\uFF1B\u4E0B\u65B9\u660E\u7D30\u4ECD\u4FDD\u7559\u672A\u6AA2\u67E5\u8207\u7121\u6548\u503C\u7B46\u6578\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u8A73\u7D30\u7B46\u6578\u8207\u6709\u6548\u6BD4\u4F8B\u3002</p>
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(_e(t.checked_at))} \xB7 \u6A19\u6E96\u6CD5\u9662\u540D\u7A31 ${c(t.canonical_count)} \u500B</div>
    </div>
  </section>`}function Gp(e={}){let t=e.lawVersionCheck,s=!!e.lawVersionCheckLoading,a=e.lawVersionCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-law-version-check"${s?" disabled":""}>${m("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB"}</span></button>`;if(a)return`<section class="report-card processing-card law-version-card">
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
    </section>`;let d={green:"\u5DF2\u5EFA\u7ACB",red:"\u672A\u5EFA\u7ACB",gray:"\u90E8\u5206\u5EFA\u7ACB"},p=new Map(i.map(se=>[String(se.month),se])),$=[...new Set(i.map(se=>se.year))].sort((se,q)=>q-se).map(se=>{let q=Array.from({length:12},(A,T)=>{let K=T+1,me=`${se}${String(K).padStart(2,"0")}`,H=p.get(me);if(!H)return`<td class="judgment-month is-empty"><span>${K}</span></td>`;let le=d[H.status]?H.status:"red",Te=[`${se}-${String(K).padStart(2,"0")}`,d[le],`\u7248\u672C ${c(H.version_count)}\uFF08\u6CD5\u898F ${c(H.law_versions)}\uFF0F\u547D\u4EE4 ${c(H.order_versions)}\uFF09`,`\u5DF2\u5EFA\u7ACB ${c(H.backfilled_count)}`,`\u672A\u5EFA\u7ACB ${c(H.missing_count)}`,`\u9700\u5EFA\u7ACB ${c(H.needs_backfill_count)}\uFF08\u53EF\u5EFA\u7ACB ${c(H.backfillable_count)}\uFF0F\u7F3A\u539F\u59CB\u6A94 ${c(H.blocked_count)}\uFF09`,`\u689D\u6587\u5217 ${c(H.article_rows)} / \u9810\u671F ${c(H.article_count)}`,H.current?"\u76EE\u524D\u7248\u672C":"",H.versions?.length?`\u7248\u672C ${H.versions.map(I=>`#${I.version_id}`).join("\u3001")}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month law-version-month is-${le}${H.current?" is-current":""}" title="${r(Te)}"><span>${K}</span></td>`}).join("");return`<tr><th scope="row">${r(se)}</th>${q}</tr>`}).join(""),v={law:"\u6CD5\u898F",order:"\u547D\u4EE4"},u=i.flatMap(se=>(se.versions||[]).filter(q=>q.needs_backfill).map(q=>({...q,month:se.month}))).sort((se,q)=>q.version_id-se.version_id),b=u.slice(0,20),y=b.map(se=>{let q=se.backfillable?"badge-info":se.blocked?"badge-danger":"badge-neutral",A=se.backfillable?"\u53EF\u5EFA\u7ACB":se.blocked?"\u7F3A\u539F\u59CB\u6A94":"\u5F85\u6AA2\u67E5";return`<div class="law-backfill-needed-row">
        <strong class="mono">#${se.version_id}</strong>
        <span class="badge ${q}">${A}</span>
        <span>${r(v[se.source_type]||se.source_type||"\u2014")}</span>
        <span class="mono">${r(se.update_date||se.month||"\u2014")}</span>
        <span class="law-backfill-needed-reason">${r(se.reason||"\u2014")}</span>
      </div>`}).join(""),k=u.length?`<div class="law-backfill-needed">
        <div class="law-backfill-needed-head">\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C <span class="badge badge-warn">${c(u.length)}</span></div>
        <div class="law-backfill-needed-list">${y}</div>
        ${u.length>b.length?`<div class="law-backfill-needed-more">\u53E6\u6709 ${c(u.length-b.length)} \u500B\u7248\u672C\u672A\u5217\u51FA</div>`:""}
      </div>`:'<div class="law-backfill-needed is-clear">\u76EE\u524D\u6C92\u6709\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3002</div>',M=Number(l.needs_backfill_versions)||0,S=Number(l.backfillable_versions)||0,h=Number(l.blocked_versions)||0,L=Number(l.backfilled_versions)||0,X=Number(l.versions)||0,J=M<=0?"ok":h>0?"danger":"warn",ve=M<=0?"\u4E0D\u9700\u8981\u5EFA\u7ACB":"\u9700\u8981\u5EFA\u7ACB",fe=M>0?`\u9700\u8981\u5EFA\u7ACB ${c(M)} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF1A\u53EF\u5EFA\u7ACB ${c(S)}\u3001\u7F3A\u539F\u59CB\u6A94 ${c(h)}\u3002\u5DF2\u6709\u6B77\u53F2\u689D\u6587 ${c(L)} \u500B\u7248\u672C${h>0?"\uFF1B\u7F3A\u539F\u59CB\u6A94\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD":""}\u3002`:`\u76EE\u524D ${c(X)} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`;return`<section class="report-card processing-card law-version-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
      ${n}
    </div>
    <div class="law-version-check-status is-${J}" role="status" aria-live="polite">
      <span class="badge badge-${J}">${ve}</span>
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(se,q)=>`<th scope="col">${q+1}</th>`).join("")}</tr></thead>
          <tbody>${$}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u8A72\u6708\u4EFD\u6240\u6709\u7248\u672C\u90FD\u6709\u6B77\u53F2\u689D\u6587\uFF1B\u7D05\u8272\uFF1A\u5B8C\u5168\u672A\u5EFA\u7ACB\uFF1B\u7070\u8272\uFF1A\u90E8\u5206\u7248\u672C\u5DF2\u5EFA\u7ACB\uFF1B\u5916\u6846\uFF1A\u76EE\u524D\u7248\u672C\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u7248\u672C\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u6578\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u6578\u8207\u689D\u6587\u5217\u3002</p>
      ${k}
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(_e(t.checked_at))}</div>
    </div>
  </section>`}function Up(){return`<div class="processing-ollama-loading">
    <span class="spinner" aria-hidden="true"></span>
    <span>\u6B63\u5728\u6AA2\u67E5 llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span>
  </div>`}function Qp(e,t,s){let a=Array.isArray(e?.hosts)?e.hosts:[];if(s&&!a.length)return`${Fe({tone:"danger",title:"llama-server \u4E3B\u6A5F\u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
    <div class="processing-ollama-empty">
      <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh-ollama">
        ${m("refresh",13)}<span>\u91CD\u65B0\u6AA2\u67E5</span>
      </button>
    </div>`;if(!a.length)return t?Up():'<div class="processing-ollama-empty">\u5C1A\u672A\u8A2D\u5B9A llama-server \u4E3B\u6A5F\uFF1B\u8ACB\u5230\u300C\u7CFB\u7D71\u72C0\u614B \u2192 Model Provider\u300D\u65B0\u589E\u4E26\u9023\u63A5\u6A21\u578B\u3002</div>';let n=a.map((o,l)=>{let d=o.status==="operational",p=Array.isArray(o.models)?o.models:[],g=p.length?p.map(v=>`<span class="processing-ollama-model ${d?"is-online":"is-offline"}">${r(v.name||"")}</span>`).join(""):'<span class="processing-ollama-model is-offline">\u6C92\u6709\u53EF\u7528\u6A21\u578B</span>',$=[o.embedding_model?`<span class="processing-ollama-role ${d?"is-online":"is-offline"}">\u5D4C\u5165 \xB7 ${r(o.embedding_model)}</span>`:'<span class="processing-ollama-role is-offline">\u672A\u8A2D\u5B9A\u5D4C\u5165\u6A21\u578B</span>',o.chat_model?`<span class="processing-ollama-role is-offline">\u804A\u5929 \xB7 ${r(o.chat_model)}</span>`:""].filter(Boolean).join("");return`<article class="processing-ollama-host ${d?"is-online":"is-offline"}" data-ollama-host data-host-id="${Number(o.id)}">
        <span class="processing-ollama-handle" aria-hidden="true">${m("grid",14)}</span>
        <span class="processing-ollama-rank">${l+1}</span>
        <div class="processing-ollama-main">
          <div class="processing-ollama-title">
            <strong>${r(o.name||o.base_url||`\u4E3B\u6A5F #${o.id}`)}</strong>
            <span class="processing-ollama-status">${d?"\u53EF\u7528":"\u7121\u6CD5\u9023\u7DDA"}</span>
          </div>
          <span class="processing-ollama-url mono">${r(o.base_url||"\u2014")}</span>
          <div class="processing-ollama-models">${g}</div>
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
    <p class="processing-ollama-hint">\u62D6\u79FB\u6216\u4F7F\u7528\u7BAD\u982D\u8ABF\u6574 embedding \u512A\u5148\u9806\u5E8F\uFF1B\u76EE\u524D\u4E3B\u6A5F\u7121\u6CD5\u4F7F\u7528\u6642\uFF0C\u6703\u4F9D\u5E8F\u81EA\u52D5\u6539\u7528\u4E0B\u4E00\u53F0\uFF08\u5404\u53F0\u9700\u5177\u5099\u76F8\u540C\u7684 embedding \u6A21\u578B\uFF09\uFF0C\u76F4\u5230\u6709\u4E3B\u6A5F\u56DE\u50B3\u5411\u91CF\u3002</p>`}function Jp(e,t={}){let s=e.active_run||null,a=s||e.last_run||null,n=Jt===e.id,i=!!s||n,o=!!e.can_run&&!i,l=i?"\u6B64\u6D41\u7A0B\u6B63\u5728\u57F7\u884C\u4E2D\u3002":e.start_blocked_reason||"\u76EE\u524D\u6709\u5176\u4ED6\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",d=Array.isArray(e.command)?e.command.join(" "):"",p=Number(e.update_count)||e.update_available&&Number(e.pending_count)||0,g=e.update_origin||"\u66F4\u65B0\u5075\u6E2C",$=e.update_mechanism||"\u65E2\u6709\u66F4\u65B0\u6AA2\u67E5\u7D00\u9304",v=e.update_message||e.update_status&&e.update_status.message||"\u627E\u5230\u53EF\u66F4\u65B0\u5167\u5BB9\u3002",u=e.update_status&&e.update_status.checked_at?_e(e.update_status.checked_at):"",b=e.progress||{},y=Array.isArray(b.stages)?b.stages:[],k=String(b.active_stage||""),M=y.find(J=>String(J.key||"")===k),S=(e.index_runtime&&e.index_runtime.current?e.index_runtime.current.month:"")||"",h=S?xn(S):M&&(M.label||M.key)||"",L=n&&!s?"\u555F\u52D5\u4E2D":"\u57F7\u884C\u4E2D",X=`<section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m(hl[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
        <span class="badge badge-neutral badge-mono">${r(e.branch||"")}</span>
      </div>
      <div class="processing-workflow-command-grid">
        <span>\u7A0B\u5F0F</span><code>${r(e.program||"\u2014")}</code>
        <span>Shell\uFF0F\u5165\u53E3</span><code>${r(e.script||"\u2014")}</code>
        <span>\u5BE6\u969B\u547D\u4EE4</span><code class="processing-workflow-command">${r(d||"\u2014")}</code>
      </div>
      ${Hr.has(e.id)?'<div class="processing-embedding-strip-slot" data-processing-embedding-strip data-preserve-children></div>':""}
      <div class="processing-workflow-actions">
        <button class="btn btn-primary btn-sm" type="button"
          data-processing-action="run-workflow"
          data-workflow-id="${r(e.id)}"
          ${o?"":"disabled"}
          ${o?"":`title="${r(l)}"`}>
          ${i?'<span class="spinner" aria-hidden="true"></span>':m("play",14)}<span>${i?L:"\u57F7\u884C\u6B64\u6D41\u7A0B"}</span>
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
              ${s&&s.started_at?`<span>\u958B\u59CB ${r(_e(s.started_at))}</span>`:""}
              ${h?`<span>\u76EE\u524D\u8655\u7406 <strong class="mono">${r(h)}</strong></span>`:""}
            </div>`:""}
      <div class="side-card-foot">
        \u57F7\u884C\u7D50\u679C\u6703\u5BEB\u5165\u5171\u7528\u8655\u7406\u72C0\u614B\u6A94\uFF0C\u53EF\u5F9E\u8655\u7406\u7E3D\u89BD\u67E5\u770B\u3002
      </div>
    </section>`;return`<div class="processing-workflow-panel">
    ${Fe({tone:"info",title:e.label,text:e.description||""})}
    ${e.update_available?`<div class="processing-update-notice" role="status" data-processing-update-notice>
            <span class="processing-update-notice-icon">${m("refresh",14)}</span>
            <span class="processing-update-notice-copy">
              <strong>${r(g)}\u5075\u6E2C\u5230\u53EF\u66F4\u65B0\u5167\u5BB9</strong>
              <span class="processing-update-mechanism">\u5075\u6E2C\u6A5F\u5236\uFF1A${r($)}${u?` \xB7 \u6AA2\u67E5\u6642\u9593 ${r(u)}`:""}</span>
              <span class="processing-update-message" data-processing-update-message>${r(v)}</span>
            </span>
            ${p>0?`<span class="badge badge-warn badge-mono" data-processing-update-count>${m("refresh",10)}${c(p)}</span>`:'<span class="badge badge-warn">\u53EF\u66F4\u65B0</span>'}
            <button class="btn btn-primary btn-sm processing-update-action" type="button"
              data-processing-action="run-workflow"
              data-workflow-id="${r(e.id)}"
              ${o?"":"disabled"}
              title="${r(o?"\u7ACB\u5373\u57F7\u884C\uFF1B\u6703\u5148\u8A08\u7B97\u7E3D\u5927\u5C0F\u8207\u9810\u4F30\u6642\u9593":l)}">
              ${i?'<span class="spinner" aria-hidden="true"></span>':m("download",14)}<span>${i?L:"\u66F4\u65B0"}</span>
            </button>
          </div>`:""}
    ${["legal_index_versions","law_download","order_download"].includes(e.id)?op(e.index_timelines,{titleSuffix:e.id==="legal_index_versions"?"\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868":"\u4E0B\u8F09\u6642\u9593\u8868"}):""}
    ${e.id==="normalize_courts"?X:""}
    ${e.id==="normalize_courts"?zp(t):""}
    ${e.id==="backfill_law_articles"?Gp(t):""}
    ${e.id!=="normalize_courts"?X:""}
    ${Tp(e)}
    ${e.id==="judgment_parquet"?Fp():""}
    ${e.id==="normalize_courts"?Op():""}
    ${e.id==="backfill_law_articles"?Hp():""}
    ${e.id==="judgment_import"?Ip(e):""}
    ${e.id==="index_versions"?Dp(e):""}
    ${e.id==="index_versions"?Bp(t):""}
    ${e.id==="judgment_download"?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${m("calendar",14)}\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B</span>
              <button class="btn btn-ghost btn-sm" type="button" title="\u91CD\u65B0\u6383\u63CF raw_rar \u76EE\u9304\u8207\u6708\u4EFD\u72C0\u614B" data-processing-action="refresh-judgment-months">${m("refresh",13)}<span>\u91CD\u65B0\u6574\u7406</span></button>
            </div>
            <div data-judgment-months-slot data-preserve-children>${Wr()}</div>
          </section>`:""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${Bt(a?.status||"idle")}
      </div>
      ${hp(a)}
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("history",14)}\u57F7\u884C\u7D00\u9304</span>
        <span class="badge badge-neutral">\u6700\u8FD1 ${c((e.recent_runs||[]).length)} \u7B46</span>
      </div>
      ${xp(e.recent_runs)}
    </section>
    ${["law_download","order_download","judgment_download"].includes(e.id)?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${m("search",14)}\u7248\u672C\u6AA2\u67E5\u7D00\u9304</span>
              <span class="badge badge-neutral">\u6700\u8FD1 ${c((e.update_history||[]).length)} \u7B46</span>
            </div>
            ${Ap(e)}
          </section>`:""}
  </div>`}function Sn(e,t,s={},a=new Set){if(t==="overview")return dl(e,a);let i=(Array.isArray(e.workflows)?e.workflows:[]).find(o=>o.id===t);return i?Jp(i,s):dl(e,a)}async function Vp(e){let t=Ut(),s=`judgment.processing.slim.${t?"visitor":"admin"}`,a=()=>{try{let f=JSON.parse(window.localStorage.getItem(s)||"null");return!f?.snapshot||!f.snapshot.slim||Date.now()-Number(f.saved_at||0)>600*1e3?null:f.snapshot}catch{return null}},n=f=>{if(f?.slim)try{window.localStorage.setItem(s,JSON.stringify({snapshot:f,saved_at:Date.now()}))}catch{}};e.innerHTML=`<section class="page processing-page">
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
  </section>`;let i=e.querySelector(".processing-page"),o=e.querySelector("#processing-root"),l=e.querySelector("#processing-workflows"),d=e.querySelector("#processing-stop"),p=!1,g=document.createElement("div");g.className="processing-stage-tooltip",g.hidden=!0,i.appendChild(g),Qt=new Map;let $=!1,v=!1,u=!1,b=null,y="",k="",M="overview",S=null,h=!1,L=null,X=null,J=null,ve=!1,fe=null,se=0,q=null,A=!1,T=null,K=0,me=null,H=!1,le=null,Te=0,I=null,ye=!1,ae=null,Se=0,Me=!1,$e=null,Ce=!1,be=!1,V="",he=new Set,qe=null,Le=null,Re=null,R=-1,D="",Q=0,C=0,O=null,F=[],we=()=>({storage:J,loading:ve,error:fe,courtCheck:q,courtCheckLoading:A,courtCheckError:T,lawVersionCheck:me,lawVersionCheckLoading:H,lawVersionCheckError:le}),Oe=()=>{if(M!=="judgment_download")return;let f=o.querySelector(".processing-workflow-panel");if(!f)return;f.querySelectorAll(".judgment-month.is-active").forEach(Ge=>{Ge.classList.remove("is-active"),Ge.removeAttribute("aria-current")});let _=f.querySelector("[data-judgment-progress]");if(!_)return;let E=S?.progress,ee=!!(b?.workflows||[]).find(Ge=>Ge.id==="judgment_download")?.active_run;if((!E||E.active===!1)&&!ee){_.hidden=!0,_.classList.remove("is-indeterminate");let Ge=_.querySelector("[data-judgment-run]");Ge&&(Ge.hidden=!0);return}if(_.hidden=!1,!E||E.active===!1){let Ge=_.querySelector("[data-judgment-progress-phase]");Ge&&(Ge.textContent="\u6E96\u5099\u4E2D");let qt=_.querySelector("[data-judgment-progress-month]");qt&&(qt.textContent="\u2014");let lt=_.querySelector("[data-judgment-progress-filename]");lt&&(lt.textContent="\u7B49\u5F85\u4E0B\u8F09\u7A0B\u5E8F\u56DE\u5831\u9032\u5EA6\u2026",lt.title=""),_.classList.add("is-indeterminate");let ts=_.querySelector("[data-judgment-progress-bar]");ts&&(ts.style.width="");let Rt=_.querySelector("[data-judgment-progress-percent]");Rt&&(Rt.textContent="\u2014");let Lt=_.querySelector("[data-judgment-progress-size]");Lt&&(Lt.textContent="\u2014");let $s=_.querySelector("[data-judgment-progress-note]");$s&&($s.textContent="\u5DF2\u555F\u52D5\uFF0C\u7B49\u5F85\u9032\u5EA6\u56DE\u5831");let ss=_.querySelector("[data-judgment-run]");ss&&(ss.hidden=!0);let Kt=_.querySelector("[data-judgment-downloads]");Kt&&(Kt.hidden=!0);let as=_.querySelector("[data-judgment-current]");as&&(as.hidden=!1);return}let Z={preparing:"\u6E96\u5099\u4E2D",planning:"\u8A08\u7B97\u5927\u5C0F",scanning:"\u6383\u63CF\u4E2D",checking:"\u6AA2\u67E5\u4E2D",downloading:"\u4E0B\u8F09\u4E2D",saving:"\u5132\u5B58\u4E2D",finalizing:"\u6574\u7406\u4E2D"},ke=Z[E.phase]||"\u8655\u7406\u4E2D",z=Array.isArray(E.downloads)?E.downloads:[],te=z.length>0,ce=_.querySelector("[data-judgment-current]");ce&&(ce.hidden=te);let Ae=_.querySelector("[data-judgment-downloads]");if(Ae){Ae.hidden=!te;let Ge=_.querySelector("[data-judgment-downloads-count]");Ge&&(Ge.textContent=`${c(z.length)} \u500B\u9032\u884C\u4E2D`);let qt=_.querySelector("[data-judgment-downloads-list]");qt&&te&&(qt.innerHTML=z.map(lt=>{let ts=Z[lt.phase]||ke||"\u8655\u7406\u4E2D",Rt=Number(lt.bytes_written),Lt=Number(lt.total_bytes),$s=Number.isFinite(Lt)&&Lt>0,ss=lt.percent,Kt=ss==null||ss===""?$s&&Number.isFinite(Rt)?Rt/Lt*100:null:Number(ss),as=Kt===null||!Number.isFinite(Kt),Ra=as?"\u2014":`${Math.min(100,Math.max(0,Kt)).toFixed(Kt>=10?0:1)}%`,Ca=$s?`${Ee(Rt)} / ${Ee(Lt)}`:Number.isFinite(Rt)&&Rt>0?Ee(Rt):"\u2014";return`<div class="processing-download-active-item">
              <div class="processing-download-active-line">
                <strong class="mono">${r(lt.month||"\u2014")}</strong>
                <span class="processing-download-active-file mono" title="${r(lt.filename||"")}">${r(lt.filename||"\u2014")}</span>
                <span class="processing-download-active-percent mono">${r(Ra)}</span>
              </div>
              <div class="processing-download-active-track${as?" is-indeterminate":""}"><span style="width:${as?"":`${Math.min(100,Math.max(0,Kt)).toFixed(1)}%`}"></span></div>
              <div class="processing-download-active-meta">
                <span>${r(ts)}</span>
                <span>${r(Ca)}</span>
              </div>
            </div>`}).join(""))}let Be=_.querySelector("[data-judgment-progress-phase]");Be&&(Be.textContent=ke);let nt=E.month||"",Mt=_.querySelector("[data-judgment-progress-month]");Mt&&(Mt.textContent=nt||"\u2014");let Na=E.filename||"",hs=_.querySelector("[data-judgment-progress-filename]");hs&&(hs.textContent=Na||"\u2014",hs.title=Na);let pt=new Map;for(let Ge of z)Ge.month&&pt.set(String(Ge.month),{percent:Ge.percent,phase:Ge.phase});nt&&!pt.has(nt)&&pt.set(nt,{percent:E.percent,phase:E.phase}),f.querySelectorAll(".judgment-month.is-active").forEach(Ge=>{Ge.classList.remove("is-active","is-downloading"),Ge.removeAttribute("aria-current"),Ge.style.removeProperty("--month-progress")});for(let[Ge,qt]of pt){let lt=f.querySelector(`[data-judgment-month-key="${Ge}"]`);if(!lt)continue;lt.classList.add("is-active"),(qt?.phase==="downloading"||qt?.phase==="saving")&&lt.classList.add("is-downloading"),lt.setAttribute("aria-current","true");let ts=Number(qt?.percent);Number.isFinite(ts)&&lt.style.setProperty("--month-progress",`${Math.min(100,Math.max(0,ts)).toFixed(1)}%`)}let Nt=Number(E.bytes_written),vs=Number(E.total_bytes),la=Number.isFinite(vs)&&vs>0,ca=null,da=E.percent;da!=null&&da!==""&&Number.isFinite(Number(da))?ca=Number(da):la&&Number.isFinite(Nt)&&(ca=Nt/vs*100);let Cn=ca===null;_.classList.toggle("is-indeterminate",Cn);let ii=_.querySelector("[data-judgment-progress-bar]");ii&&(ii.style.width=Cn?"":`${Math.min(100,Math.max(0,ca)).toFixed(1)}%`);let oi=_.querySelector("[data-judgment-progress-percent]");if(oi){let Ge=Cn?null:Math.min(100,Math.max(0,ca));oi.textContent=Ge===null?"\u2014":`${Ge.toFixed(Ge>=10?0:1)}%`}let li=_.querySelector("[data-judgment-progress-size]");if(li){let Ge=Number.isFinite(Nt)&&Nt>0?Ee(Nt):"\u2014";li.textContent=la?`${Ge} / ${Ee(vs)}`:Ge}let ci=_.querySelector("[data-judgment-progress-note]");if(ci){let Ge=[],qt=Number(E.candidate_index),lt=Number(E.candidate_total);Number.isFinite(qt)&&qt>0&&Number.isFinite(lt)&&lt>0&&Ge.push(`\u7B2C ${c(qt)} / ${c(lt)} \u500B\u6708`),E.fileset_id&&Ge.push(`fileset ${E.fileset_id}`),E.message&&E.phase!=="downloading"&&Ge.push(String(E.message)),ci.textContent=Ge.join(" \xB7 ")}let di=_.querySelector("[data-judgment-run]"),ui=E.run_files_total!==null&&E.run_files_total!==void 0;if(di&&(di.hidden=!ui,ui)){let Ge=Number(E.run_files_total)||0,qt=Number(E.run_files_done)||0,lt=E.run_bytes_total===null||E.run_bytes_total===void 0?null:Number(E.run_bytes_total),ts=Number(E.run_bytes_done)||0,Rt=E.run_percent,Lt=Rt==null||Rt===""?null:Number(Rt),$s=_.querySelector("[data-judgment-run-bar]");$s&&($s.style.width=Lt===null||!Number.isFinite(Lt)?"":`${Math.min(100,Math.max(0,Lt)).toFixed(1)}%`);let ss=_.querySelector("[data-judgment-run-percent]");ss&&(ss.textContent=Lt===null||!Number.isFinite(Lt)?"\u2014":`${Lt.toFixed(Lt>=10?0:1)}%`);let Kt=_.querySelector("[data-judgment-run-files]");Kt&&(Kt.textContent=`${c(qt)} / ${c(Ge)} \u500B\u6708`);let as=_.querySelector("[data-judgment-run-size]"),Ra=E.phase==="planning";as&&(lt!==null&&lt>0?as.textContent=`\u5DF2\u4E0B\u8F09 ${Ee(ts)} / ${Ee(lt)}`:as.textContent=`\u5DF2\u4E0B\u8F09 ${Ee(ts)} \xB7 ${Ra?"\u7E3D\u91CF\u8A08\u7B97\u4E2D":"\u7E3D\u91CF\u672A\u77E5"}`);let Ca=_.querySelector("[data-judgment-run-elapsed]");Ca&&(Ca.textContent=`\u5DF2\u82B1 ${xa(E.elapsed_seconds)}`);let Pn=_.querySelector("[data-judgment-run-eta]");if(Pn){let In=Number(E.eta_seconds),Kl=Number(E.estimated_total_seconds);Number.isFinite(In)&&In>=0?Pn.textContent=`\u5269\u9918 ${xa(In)} \xB7 \u9810\u4F30\u7E3D\u8A08 ${xa(Kl)}`:Pn.textContent=Ra&&(E.run_bytes_total===null||E.run_bytes_total===void 0)?"\u5269\u9918\u6642\u9593\uFF1A\u8A08\u7B97\u4E2D":"\u5269\u9918\u6642\u9593\uFF1A\u2014"}}},Ye=()=>{if(M!=="judgment_download")return;let f=o.querySelector("[data-judgment-months-slot]");if(f){let _=Array.isArray(S?.months)?S.months:[];L&&!S?(f.innerHTML=Fe({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(L)}),delete f.dataset.judgmentMonthCount):S?f.dataset.judgmentMonthCount!==String(_.length)?(f.innerHTML=kp(S),f.dataset.judgmentMonthCount=String(_.length)):Sp(f,S):(f.querySelector(".judgment-months-loading")||(f.innerHTML=Wr()),delete f.dataset.judgmentMonthCount)}if(S){let _=Vr(S),E=X!==_.pending;X=_.pending;let ie=(b?.workflows||[]).find(Z=>Z.id==="judgment_download");ie&&(ie.update_count=_.pending,ie.update_available=_.pending>0);let ee=o.querySelector("[data-processing-update-notice]");if(ee)if(_.pending<=0)ee.remove();else{let Z=ee.querySelector("[data-processing-update-count]");Z&&(Z.innerHTML=`${m("refresh",10)}${c(_.pending)}`);let ke=ee.querySelector("[data-processing-update-message]");ke&&(ke.textContent=`\u5224\u6C7A\u5F85\u88DC\u9F4A ${c(_.pending)} \u500B\u6708`)}E&&l&&b&&gs(l,kn(b,M))}Oe()},st=()=>{let f=Array.isArray(I?.hosts)?I.hosts:[];return JSON.stringify({loading:!f.length&&ye,error:!f.length&&ae?ae.message||String(ae):"",active:I?.active_host_id??null,hosts:f.map(_=>({id:_.id,name:_.name,url:_.base_url,status:_.status,detail:_.detail,embedding:_.embedding_model,chat:_.chat_model,models:(_.models||[]).map(E=>E.name)}))})},rt=()=>{let f=o.querySelector("[data-processing-ollama]");if(!f||Se)return;let _=st();f.dataset.ollamaSignature!==_&&(f.dataset.ollamaSignature=_,f.innerHTML=Qp(I,ye,I?null:ae))},Xe=()=>{let _=((b?.sections||[]).find(E=>E.key==="legal")?.stages||[]).find(E=>E.key==="legal_qdrant");return Or(_?.model?.label||"")},et=()=>{let f=o.querySelector("[data-processing-embedding-strip]");if(!f)return;let _=Array.isArray(I?.hosts)?I.hosts:[],E=[];for(let te of _)if(te.status==="operational")for(let ce of te.models||[])Array.isArray(ce.capabilities)&&ce.capabilities.includes("embedding")&&E.push({hostId:Number(te.id),model:ce.name,label:Or(`${te.name||te.base_url||`\u4E3B\u6A5F ${te.id}`}:${ce.name}`),baseUrl:te.base_url||""});let ie=Xe(),ee=_.find(te=>Number(te.id)===Number(I?.active_host_id)),Z=E.map(te=>{let ce=te.label===ie;return`<button class="rag-model-button${ce?" is-active":""}" type="button"
        data-processing-action="select-embedding-model"
        data-host-id="${te.hostId}"
        data-model="${r(te.model)}"
        title="${r(te.label)}"
        aria-pressed="${ce?"true":"false"}"
        ${be?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(te.label)}</span>
        ${ce?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`});ie&&!E.some(te=>te.label===ie)&&Z.unshift(`<button class="rag-model-button is-active is-static" type="button" aria-pressed="true" disabled>
          <span class="rag-model-state" aria-hidden="true"></span>
          <span>${r(ie)}</span>
          <span class="rag-model-current">\u4F7F\u7528\u4E2D</span>
        </button>`);let ke=E.length?`<div class="rag-model-buttons">${Z.join("")}</div>`:`<p class="rag-model-empty">${ye?"\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\u8207 Embedding model\u2026":ae?`\u7121\u6CD5\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\uFF1A${r(ae.message||String(ae))}`:"\u76EE\u524D\u6C92\u6709\u53EF\u7528\u7684 Embedding model\u3002"}</p>`,z=`<div class="processing-embedding-strip rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${m("brain",13)} Embedding \u4E3B\u6A5F\uFF0F\u6A21\u578B</span>
        ${ee?.base_url?`<span class="rag-model-strip-base mono">${r(ee.base_url)}</span>`:""}
        <span class="rag-model-strip-current">\u76EE\u524D\uFF1A<strong>${r(ie||"\u2014")}</strong></span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-processing-action="refresh-embedding-models"
          ${ye?"disabled":""}>
          ${m("refresh",12)}<span>\u6AA2\u67E5\u6A21\u578B</span>
        </button>
      </div>
      ${ke}
      <p class="rag-model-hint">\u9EDE\u9078 <span class="mono">\u4E3B\u6A5F:\u6A21\u578B</span> \u5207\u63DB Embedding\uFF1B\u9078\u53D6\u5F8C\u6703\u6210\u70BA\u7B2C\u4E00\u512A\u5148\uFF0C\u5176\u4ED6\u4E3B\u6A5F\u4F9D\u5E8F\u4F5C\u70BA\u5099\u63F4\u3002\u5207\u63DB\u6A21\u578B\u5F8C\u65E2\u6709\u7D22\u5F15\u53EF\u80FD\u9700\u8981\u91CD\u5EFA\u3002</p>
    </div>`;f.innerHTML!==z&&(f.innerHTML=z)},de=f=>{let _=o.querySelector('[data-import-timeline="judgment"]');if(!_)return;let E=String(f?.active_month||""),ie=String(f?.processing_month||"");_.querySelectorAll(".processing-month").forEach(Ae=>{let Be=!!E&&Ae.dataset.month===E;Ae.classList.toggle("is-current",Be),Ae.classList.toggle("is-processing-current",!!ie&&Ae.dataset.month===ie),Be?Ae.setAttribute("aria-current","true"):Ae.removeAttribute("aria-current")});let ee=_.querySelector(".index-current-row");if(!E||!f?.active_archive){ee&&ee.remove();return}let Z=b?.workflows?.find(Ae=>Ae.id==="judgment_import")?.import_timeline?.stage_labels||{},ke=fl({activeMonth:E,activeArchive:f.active_archive,activePhase:f.active_phase||"",processingMonth:f.processing_month||"",processingArchive:f.processing_archive||"",stageLabels:Z});if(ee){ee.innerHTML=ke;return}let z=document.createElement("div");z.className="index-current-row",z.innerHTML=ke;let te=_.querySelector(":scope > .side-card-head");if(te){te.insertAdjacentElement("afterend",z);return}let ce=_.querySelector(".judgment-months");ce&&ce.prepend(z)},tt=f=>{let _=Number(f?.state_mtime_ns);return Number.isFinite(_)?_:-1},Ue=f=>{let _=String(f?.active_month||"");return/^\d{6}$/.test(_)?Number(_):-1},ct=f=>{if(!f)return;let _=tt(f);if(_>=0&&_<R){Re?.active_month&&de(Re);return}_>=0&&(R=_);let E=String(f.active_month||"");if(!!(f.run_id&&f.run_id===Re?.run_id)&&Ue(f)>=0&&Ue(f)<Ue(Re)){let ee={...f,active_month:Re.active_month,active_archive:Re.active_archive};Re=ee,de(ee);return}if(!E&&f.run_status==="running"){Re?.active_month&&Re?.run_id===f.run_id?de(Re):(Re=f,de(f));return}Re=f,de(f)},gt=f=>{let _=f?.active_import;if(_){ct(_);return}Re?.active_month&&de(Re)},ne=()=>{if(!($||qe)){if(t){Le=window.setInterval(()=>{$||Et({silent:!0,cached:!0})},3e4);return}qe=_t(["processing","judgment-download","system-usage","ollama","court-check","law-version-check"],(f,_)=>{if(!$){if(f==="processing"){_?.snapshot?.live?ia(_.snapshot):_?.snapshot?Os(_.snapshot,{silent:!0}):Et({silent:!0,cached:!0});return}if(f==="judgment-download"){M==="judgment_download"&&re({quiet:!0,payload:_?.snapshot||null});return}if(f==="system-usage"){M==="index_versions"&&pe({quiet:!0,force:!0,payload:_?.snapshot||null});return}if(f==="ollama"){Hr.has(M)&&ze({quiet:!0,payload:_?.snapshot||null});return}if(f==="court-check"){M==="normalize_courts"&&Pe({quiet:!0,force:!0,payload:_?.snapshot||null});return}f==="law-version-check"&&M==="backfill_law_articles"&&De({quiet:!0,force:!0,payload:_?.snapshot||null})}},{onProgress:(f,_)=>{if(f!=="processing")return;let E=_?.event;E&&Hs(E)},onError:()=>{b||Et({silent:!0,cached:!0})}})}},xe=()=>{qe&&(qe(),qe=null)},We=async f=>{if(be)return;let[_,...E]=String(f||"").split("|"),ie=Number(_),ee=E.join("|");if(!ie||!ee){et();return}let Z=(I?.hosts||[]).find(z=>Number(z.id)===ie);if(!Z){et();return}let ke=Or(`${Z.name||Z.base_url||`\u4E3B\u6A5F ${Z.id}`}:${ee}`);if(ke===Xe()){et();return}if(!window.confirm(`\u5207\u63DB Embedding \u70BA ${ke}\uFF1F

\u5207\u63DB\u6A21\u578B\u5F8C\uFF0C\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u8207\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u53EF\u80FD\u4E0D\u76F8\u5BB9\uFF0C\u9700\u8981\u91CD\u65B0\u5EFA\u7ACB\u7D22\u5F15\u3002`)){et();return}be=!0,et();try{await U.selectOllamaModel(ie,{model:ee,role:"embedding"});let z=(I?.hosts||[]).map(ce=>Number(ce.id)),te=[ie,...z.filter(ce=>ce!==ie)];await U.reorderOllamaHosts(te),P(`\u5DF2\u5207\u63DB Embedding \u70BA ${ke}\u3002`,"ok",6e3),I=null,await ze({quiet:!0}),await Et({silent:!0})}catch(z){P(z.message||"\u7121\u6CD5\u5207\u63DB Embedding model\u3002","danger",7e3),await ze({quiet:!0})}finally{be=!1,et()}},ze=async({quiet:f=!1,button:_=null,payload:E=null}={})=>{if(!($||ye)){if(t){ye=!1,ae=new Error("\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u8A2D\u5B9A\u3002"),rt(),et();return}ye=!0,ae=null,I||(rt(),et()),_&&Ne(_,!0,"\u6AA2\u67E5\u4E2D\u2026");try{let ie=E||await U.ollamaHosts();if($)return;I=ie}catch(ie){if($)return;ae=ie,f||P(ie.message||"\u7121\u6CD5\u6AA2\u67E5 llama-server \u4E3B\u6A5F\u3002","danger",6e3)}finally{$||(ye=!1,_&&Ne(_,!1),rt(),et())}}},Tt=async f=>{if(Ce)return;let _=(I?.hosts||[]).map(Z=>Number(Z.id)),E=f.map(Z=>Number(Z));if(!E.length||E.length!==_.length||E.every((Z,ke)=>Z===_[ke])){rt();return}Ce=!0;let ie=new Map((I?.hosts||[]).map(Z=>[Number(Z.id),Z])),ee=E.map(Z=>ie.get(Z)).filter(Boolean);if(I&&ee.length===_.length){I={...I,hosts:ee,active_host_id:E[0]};let Z=o.querySelector("[data-processing-ollama]");Z&&(Z.dataset.ollamaSignature=""),rt()}try{await U.reorderOllamaHosts(E),P("\u5DF2\u66F4\u65B0 llama-server \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","ok",3500)}catch(Z){P(Z.message||"\u7121\u6CD5\u66F4\u65B0 llama-server \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","danger",6e3),await ze({quiet:!0})}finally{Ce=!1}},ft=()=>{let f=o.querySelector("[data-processing-ollama]");f&&(f.dataset.ollamaSignature=""),rt()},x=()=>{let f=$e;if(!f)return;if(o.querySelector(`[data-ollama-host][data-host-id="${f.hostId}"]`)?.classList.remove("is-dragging"),f.captureTarget?.hasPointerCapture?.(f.pointerId))try{f.captureTarget.releasePointerCapture(f.pointerId)}catch{}document.documentElement.classList.remove("processing-ollama-dragging"),window.removeEventListener("pointermove",j),window.removeEventListener("pointerup",N),window.removeEventListener("pointercancel",B),$e=null,Se=0},j=f=>{let _=$e;if(!_||f.pointerId!==_.pointerId)return;if(!_.dragging){if(Math.hypot(f.clientX-_.startX,f.clientY-_.startY)<5)return;_.dragging=!0,Se=_.hostId,Me=!1,o.querySelector(`[data-ollama-host][data-host-id="${_.hostId}"]`)?.classList.add("is-dragging"),document.documentElement.classList.add("processing-ollama-dragging")}f.preventDefault();let E=64;f.clientY<E?window.scrollBy(0,-12):f.clientY>window.innerHeight-E&&window.scrollBy(0,12);let ie=o.querySelector("[data-ollama-list]"),ee=document.elementFromPoint(f.clientX,f.clientY)?.closest?.("[data-ollama-host]");if(!ie||!ee||!ie.contains(ee))return;let Z=ie.querySelector(`[data-ollama-host][data-host-id="${_.hostId}"]`);if(!Z||Z===ee)return;let ke=ee.getBoundingClientRect(),z=f.clientY>ke.top+ke.height/2;ie.insertBefore(Z,z?ee.nextSibling:ee),Me=!0},N=f=>{let _=$e;if(!_||f.pointerId!==_.pointerId)return;let E=_.dragging,ie=Me,ee=o.querySelector("[data-ollama-list]"),Z=E&&ee?[...ee.querySelectorAll("[data-ollama-host]")].map(ke=>Number(ke.dataset.hostId)):[];x(),E&&ie&&Z.length&&Tt(Z)},B=()=>{let f=!!$e?.dragging;x(),f&&ft()},Y=f=>{if(f.button!==0||f.pointerType==="mouse"&&f.buttons!==1||Ce||$e)return;let _=f.target.closest("[data-ollama-host]");if(!_||!o.contains(_)||f.target.closest("button")||f.pointerType==="touch"&&!f.target.closest(".processing-ollama-handle"))return;let E=Number(_.dataset.hostId)||0;if(E){f.preventDefault(),Se=E,$e={hostId:E,pointerId:f.pointerId,startX:f.clientX,startY:f.clientY,dragging:!1,captureTarget:_};try{_.setPointerCapture(f.pointerId)}catch{}window.addEventListener("pointermove",j,{passive:!1}),window.addEventListener("pointerup",N),window.addEventListener("pointercancel",B)}},re=async({quiet:f=!1,payload:_=null}={})=>{if(!h){h=!0,!S&&M==="judgment_download"&&Ye();try{S=_||await U.judgmentDownloadStatus(),L=null}catch(E){L=E.message||"\u8B80\u53D6\u6708\u4EFD\u72C0\u614B\u5931\u6557\u3002",f||P(L,"danger",7e3)}finally{h=!1,M==="judgment_download"&&Ye()}}},pe=async({quiet:f=!0,force:_=!1,payload:E=null}={})=>{if(!ve){if(t){ve=!1,fe=new Error("\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B Qdrant \u5BB9\u5668\u3001volume \u8207\u4E3B\u6A5F\u5132\u5B58\u8CC7\u8A0A\u3002"),M==="index_versions"&&At();return}if(!(!_&&J&&Date.now()-se<3e4)){ve=!0;try{J=E||await U.systemUsage(),fe=null,se=Date.now()}catch(ie){fe=ie.message||"\u7121\u6CD5\u53D6\u5F97 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002",f||P(fe,"danger",7e3)}finally{ve=!1,M==="index_versions"&&At()}}}},Pe=async({quiet:f=!0,force:_=!1,payload:E=null}={})=>{if(!A&&!(!_&&q&&Date.now()-K<6e4)){A=!0;try{q=E||await U.checkCourts(),T=null,K=Date.now()}catch(ie){T=ie.message||"\u7121\u6CD5\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u3002",f||P(T,"danger",7e3)}finally{A=!1,M==="normalize_courts"&&At()}}},De=async({quiet:f=!0,force:_=!1,button:E=null,payload:ie=null}={})=>{if(!H&&!(!_&&me&&Date.now()-Te<6e4)){H=!0,E&&Ne(E,!0,"\u6AA2\u67E5\u4E2D\u2026");try{if(me=ie||await U.checkLawVersions(),le=null,Te=Date.now(),!f){let ee=me.totals||{},Z=Number(ee.needs_backfill_versions)||0,ke=Number(ee.backfillable_versions)||0,z=Number(ee.blocked_versions)||0;Z>0?P(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u9700\u8981\u5EFA\u7ACB ${Z} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF08\u53EF\u5EFA\u7ACB ${ke}\u3001\u7F3A\u539F\u59CB\u6A94 ${z}\uFF09\u3002`,z>0?"danger":"warn",7e3):P(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D ${Number(ee.versions)||0} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`,"ok",5e3)}}catch(ee){le=ee.message||"\u7121\u6CD5\u6AA2\u67E5\u689D\u6587\u6B77\u53F2\u72C0\u614B\u3002",f||P(le,"danger",7e3)}finally{H=!1,E&&Ne(E,!1)}}},Ie=f=>Array.from(o.querySelectorAll("[data-stage-key]")).find(_=>_.dataset.stageKey===f)||null,Qe=f=>{if(!f)return;he.add(f);let _=Array.from(o.querySelectorAll(".processing-wf-stage[data-processing-stage]")).find(E=>E.dataset.processingStage===f);_&&(_.open=!0,_.scrollIntoView({behavior:"smooth",block:"center"}))},at=()=>{V&&(V="",g.hidden=!0,o.querySelectorAll("[data-stage-key]").forEach(f=>{f.classList.remove("is-stage-hovered")}))},it=f=>{let _=f.dataset.stageKey||"";if(!_)return;V=_,o.querySelectorAll("[data-stage-key]").forEach(Mt=>{Mt.classList.toggle("is-stage-hovered",Mt.dataset.stageKey===_)});let E=f.dataset.stageStatusKey||"idle",ie=f.dataset.stageStatus||As(E).label,ee=f.dataset.stageColor||"var(--accent)",Z=Number(f.dataset.stageUpdate)||0,ke=Number(f.dataset.stagePending)||0,z=f.dataset.stageContributionLabel||"\u6574\u9AD4\u5360\u6BD4";g.innerHTML=`<div class="processing-stage-tooltip-head">
      <span class="processing-stage-tooltip-swatch" style="background:${r(ee)}"></span>
      <strong>${r(f.dataset.stageLabel||_)}</strong>
      ${Bt(E,ie)}
    </div>
    <div class="processing-stage-tooltip-meta">
      <span>\u968E\u6BB5\u9032\u5EA6 <strong>${r(f.dataset.stagePercent||"\u2014")}</strong></span>
      <span>${r(z)} <strong>${r(f.dataset.stageContribution||"\u2014")}</strong></span>
      <span class="mono">${r(f.dataset.stageDuration||"\u2014")}</span>
    </div>
    <div class="processing-stage-tooltip-counts">${r(f.dataset.stageCounts||"\u2014")}</div>
    ${Z||ke?`<div class="processing-stage-tooltip-badges">
            ${Z?`<span class="processing-wf-count is-update">${m("refresh",11)}<strong>${c(Z)}</strong><span>\u53EF\u66F4\u65B0</span></span>`:""}
            ${ke?`<span class="processing-wf-count is-pending">${m("clock",11)}<strong>${c(ke)}</strong><span>\u5F85\u57F7\u884C</span></span>`:""}
          </div>`:""}
    ${f.dataset.stageMessage?`<div class="processing-stage-tooltip-message">${r(f.dataset.stageMessage)}</div>`:""}`,g.hidden=!1;let te=Math.min(300,Math.max(220,window.innerWidth-24));g.style.width=`${te}px`;let ce=f.getBoundingClientRect(),Ae=Math.min(window.innerWidth-te-12,Math.max(12,ce.left)),Be=ce.top-g.offsetHeight-10,nt=Be>=12?Be:Math.min(window.innerHeight-g.offsetHeight-12,ce.bottom+10);g.style.left=`${Ae}px`,g.style.top=`${Math.max(12,nt)}px`},Ft=f=>{if(f.target.closest(".is-failure-tip")){at();return}if(f.target.closest(".processing-wf-rail"))return;let _=f.target.closest("[data-stage-key]");!_||!o.contains(_)||_.contains(f.relatedTarget)||it(_)},es=f=>{let _=f.target.closest("[data-stage-key]");if(!_||!o.contains(_)||_.contains(f.relatedTarget))return;let E=f.relatedTarget?.closest?.("[data-stage-key]");E&&E.dataset.stageKey===_.dataset.stageKey||at()},Ta=f=>Array.isArray(f?.active_runs)&&f.active_runs.length||(f?.workflows||[]).some(_=>_.active_run)?!0:String(f?.update?.status||"")==="running",na=()=>{o.querySelectorAll('[data-processing-action="stop"]').forEach(f=>Ne(f,!0,"\u505C\u6B62\u4E2D\u2026")),d&&Ne(d,!0,"\u505C\u6B62\u4E2D\u2026")},Rn=()=>{o.querySelectorAll('[data-processing-action="stop"]').forEach(f=>Ne(f,!1)),d&&Ne(d,!1)},Ea=new Set(["refresh","open-stage","refresh-judgment-months","refresh-court-check","refresh-law-version-check"]),Ms=()=>{t&&(i.querySelectorAll("[data-processing-action]").forEach(f=>{Ea.has(f.dataset.processingAction||"")||("disabled"in f&&(f.disabled=!1),f.removeAttribute("disabled"),f.classList.add("is-demo-locked"),f.setAttribute("aria-disabled","true"),f.removeAttribute("title"),f.dataset.demoLockTooltip="\u5C55\u793A\u6A21\u5F0F\u50C5\u4F9B\u6AA2\u8996\uFF0C\u57F7\u884C\u8207\u8A2D\u5B9A\u7531\u7BA1\u7406\u8005\u64CD\u4F5C")}),i.querySelectorAll("[data-ollama-action], [data-processing-embedding-select]").forEach(f=>{f.disabled=!0,f.classList.add("is-demo-locked"),f.removeAttribute("title"),f.dataset.demoLockTooltip="\u5C55\u793A\u6A21\u5F0F\u50C5\u4F9B\u6AA2\u8996"}))},os=f=>{let _=f.capabilities||{};p&&!Ta(f)&&(p=!1,Rn()),!u&&d&&(d.hidden=!_.can_stop_update),p&&na(),Ms()},At=()=>{if(!b)return;b.slim&&Et({silent:!0,cached:!0});let f=Sn(b,M,we(),he);f!==y&&(gs(o,f),y=f),Ye(),rt(),et(),gt(b),Ms()},Os=(f,{silent:_=!1}={})=>{if($||!f||f.slim&&b&&!b.slim)return;let E=Date.parse(f.generated_at||""),ie=Date.parse(b?.generated_at||"");if(Number.isFinite(E)&&Number.isFinite(ie)&&E<ie)return;if(Jt){let te=(f.workflows||[]).find(Ae=>Ae.id===Jt),ce=te?.active_run?.id||te?.last_run?.id||"";(te?.active_run||ce&&ce!==Cs)&&(Jt="",Cs="")}b=f,window.dispatchEvent(new CustomEvent("judgment:processing-pending",{detail:{count:Number(f.capabilities?.unprocessed_archives)||0,index_pending:Number(f.capabilities?.index_pending_months)||0}}));let ee=new Map;for(let te of f.sections||[])for(let ce of te.stages||[])ee.set(`${te.key}-${ce.key}`,ce);for(let[te,ce]of Qt){if(ce.kind!=="upgrade")continue;let Ae=ee.get(te);if(Ae){if(Ae.phase==="failed"||Ae.phase==="running"&&Ae.percent!==null){Qt.delete(te);continue}if(Ae.phase==="completed"){let Be=Date.parse(Ae.last_run?.started_at||"");Number.isFinite(Be)&&Be>=Number(ce.startedAt||0)-1e3&&Qt.delete(te)}}}let Z=kn(f,M);Z!==k&&(gs(l,Z),k=Z);let ke=Sn(f,M,we(),he);if(ke!==y&&(gs(o,ke),y=ke),Ye(),rt(),V){let te=Ie(V);te?it(te):at()}let z=o.querySelector("[data-processing-updated-at]");if(z){let te=_e(f.generated_at);z.textContent!==te&&(z.textContent=te)}if(os(f),et(),gt(f),!t&&!I&&!ye&&ze({quiet:!0}),F.length){let te=F.splice(0);for(let ce of te)Hs(ce)}},ra=f=>{if(O=f,typeof requestAnimationFrame>"u"){let _=O;O=null,_&&ia(_);return}C||(C=requestAnimationFrame(()=>{C=0;let _=O;O=null,_&&ia(_)}))},Hs=f=>{if(!f)return;if(!b){F.push(f),F.length>100&&F.shift();return}let _=String(f.run_id||""),E=Number(f.seq)||0;if(_&&_===D&&E>0&&E<=Q)return;_&&_!==D&&(D=_,Q=0),E>0&&(Q=E);let ie=String(f.workflow_id||"judgment_import"),ee=String(f.month||"").replace(/\D/g,"").slice(0,6),Z=(b.workflows||[]).find(Be=>Be.id===ie);if(!Z)return;Z.progress||(Z.progress={stages:[]}),Array.isArray(Z.progress.stages)||(Z.progress.stages=[]);let ke=String(f.stage||""),z=ke?Z.progress.stages.find(Be=>String(Be.key)===ke):null,te=String(Z.progress.run_id||"")===String(f.run_id||"");if(z&&f.type==="stage_progress"){let Be=Number(f.current),nt=Number(z.current);te&&f.status==="running"&&Number.isFinite(Be)&&Number.isFinite(nt)&&Be<nt||(f.status&&(z.status=String(f.status)),f.current!==void 0&&(z.current=Number(f.current)||0),f.total!==void 0&&(z.total=Number(f.total)||0),f.percent!==void 0&&(z.percent=Number(f.percent)||0),f.message&&(z.message=String(f.message)))}if(z&&f.extra&&typeof f.extra=="object")for(let Be of["financial_processed","financial_matched","financial_percent"])f.extra[Be]!==void 0&&(z[Be]=Number(f.extra[Be])||0);if(f.type==="stage_progress"&&f.overall_percent!==void 0){let Be=Number(f.overall_percent)||0,nt=Number(Z.progress.overall_percent)||0;Z.progress.overall_percent=te?Math.max(nt,Be):Be}f.type!=="run_finished"&&(Z.progress.run_status="running"),(f.type==="archive_started"||f.type==="stage_progress")&&!Z.active_run&&f.run_id&&(Z.active_run={id:f.run_id,status:"running",started_at:f.timestamp,message:f.message||""}),f.type==="run_finished"&&(Z.active_run=null,Z.progress.run_status=String(f.status||"success"),Z.can_run=!0);let ce=[];ee&&f.month_stages&&ce.push({month:ee,import_stages:f.month_stages,import_overall:f.month_overall||""});let Ae=null;if(f.type==="archive_started"&&ee){let Be=Date.parse(f.timestamp||"");Ae={active_month:ee,active_archive:f.archive,active_phase:f.stage||"filter",processing_month:ee,processing_archive:f.archive,run_id:f.run_id,run_status:"running",state_mtime_ns:Number.isFinite(Be)?Be*1e6:Date.now()*1e6}}else f.type==="run_finished"&&(Ae={...b.active_import||{},run_status:String(f.status||"success")});ra({live:!0,generated_at:f.timestamp,workflows:[{id:ie,active_run:Z.active_run,last_run:Z.last_run,progress:Z.progress,can_run:Z.can_run}],import_timeline_months:ce,active_import:Ae})},ia=f=>{if($||!f||!b)return;let _=new Map((f.workflows||[]).map(z=>[z.id,z]));if(Jt){let z=_.get(Jt),te=z?.active_run?.id||z?.last_run?.id||"";(z?.active_run||te&&te!==Cs)&&(Jt="",Cs="")}for(let z of b.workflows||[]){let te=_.get(z.id);if(te){if("active_run"in te&&(z.active_run=te.active_run),"last_run"in te&&(z.last_run=te.last_run),Array.isArray(te.recent_runs)&&(z.recent_runs=te.recent_runs),"index_runtime"in te){let ce=te.index_runtime;ce&&!ce.active_coverage&&z.index_runtime?.active_coverage&&(ce.active_coverage=z.index_runtime.active_coverage),ce&&!ce.active_archive_coverage&&z.index_runtime?.active_archive_coverage&&(ce.active_archive_coverage=z.index_runtime.active_archive_coverage),z.index_runtime=ce}if(te.progress){let ce=te.progress,Ae=z.progress;if(z.id==="judgment_import"&&Ae?.run_id&&Ae.run_id===ce.run_id){let Be=new Map((Ae.stages||[]).map(nt=>[String(nt.key),nt]));for(let nt of ce.stages||[]){let Mt=Be.get(String(nt.key));Mt&&nt.status==="running"&&Number(nt.current)<Number(Mt.current)&&(nt.current=Mt.current,nt.total=Mt.total,nt.percent=Mt.percent,nt.message=Mt.message)}ce.overall_percent=Math.max(Number(Ae.overall_percent)||0,Number(ce.overall_percent)||0)}z.progress=ce}typeof te.can_run=="boolean"&&(z.can_run=te.can_run)}}let E=z=>{if(!z||!Array.isArray(f.import_timeline_months))return;let te=new Map((z.months||[]).map(Ae=>[String(Ae.month),Ae]));for(let Ae of f.import_timeline_months){let Be=te.get(String(Ae.month));Be&&(Be.import_stages={...Be.import_stages||{},...Ae.import_stages||{}},Ae.import_stage_progress&&(Be.import_stage_progress={...Be.import_stage_progress||{},...Ae.import_stage_progress||{}}),Ae.import_overall&&(Be.import_overall=Ae.import_overall))}let ce={complete:0,incomplete:0,processing:0,empty:0};for(let Ae of z.months||[]){let Be=String(Ae.import_overall||"empty");ce[Be]=Number(ce[Be]||0)+1}z.stage_summary=ce};(z=>{let te=(z.workflows||[]).find(pt=>pt.id==="index_versions"),ce=te?.index_runtime;if(!ce||!Array.isArray(ce.months))return;let Ae=(z.file_timelines||[]).find(pt=>pt.key==="judgment");if(!Ae||!Array.isArray(Ae.months))return;let Be=(te.progress?.stages||[]).find(pt=>pt.key==="validate"),nt=["success","no_change"].includes(String(ce.run_status||""))||String(ce.run_status||"")!=="running"&&/alias\s*已切換/.test(String(Be?.message||"")),Mt=String(ce.current?.month||""),Na=new Map(Ae.months.map(pt=>[String(pt.month),pt]));for(let pt of ce.months){let Nt=Na.get(String(pt.month||""));if(!Nt)continue;let vs=Nt.stages||(Nt.stages={}),la=String(pt.status||"");la==="running"||String(pt.month)===Mt?(vs.qdrant="processing",Nt.overall="processing"):la==="success"&&vs.qdrant!=="complete"&&(vs.qdrant=nt?"complete":"incomplete",Nt.overall=nt?"complete":"incomplete")}let hs={complete:0,incomplete:0,processing:0,empty:0,update:0};for(let pt of Ae.months){let Nt=String(pt.overall||"empty");hs[Nt]=Number(hs[Nt]||0)+1,pt.has_update&&(hs.update+=1)}Ae.summary=hs})(b),E(b.import_timeline);for(let z of b.workflows||[])z.id==="judgment_import"&&E(z.import_timeline);f.active_import&&(b.active_import=f.active_import),f.mode&&(b.mode=f.mode),f.generated_at&&(b.generated_at=f.generated_at);let ee=kn(b,M);ee!==k&&(gs(l,ee),k=ee);let Z=Sn(b,M,we(),he);Z!==y&&(gs(o,Z),y=Z),Ye(),rt(),et(),gt(b),os(b);let ke=o.querySelector("[data-processing-updated-at]");if(ke&&f.generated_at){let z=_e(f.generated_at);ke.textContent!==z&&(ke.textContent=z)}},Et=async({silent:f=!1,cached:_=!1,slim:E=!1}={})=>{if(!($||v)){v=!0;try{let ie=await U.processing({cached:_,slim:E});E&&n(ie),Os(ie,{silent:f})}catch(ie){if($)return;let ee=gp(ie.message,b);ee!==y&&(gs(o,ee),y=ee),f||P(ie.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{v=!1}}},oa=async(f,_="")=>{if(u)return;u=!0,Ne(f,!0,"\u6AA2\u67E5\u4E2D\u2026");let E=ol[_]||"",ie=String(f.dataset.sourceTypes||"").split(",").map(ke=>ke.trim()).filter(Boolean),ee=ie.length?ie:E?[E]:[],Z=f.dataset.stageId||"";Z&&(Qt.set(Z,{kind:"check",phase:"updating",startedAt:Date.now()}),At());try{let ke=await U.checkUpdates(ee);if(ke&&ke.checking)Z&&(Qt.delete(Z),At()),P("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u8ACB\u7A0D\u5F8C\u91CD\u65B0\u6574\u7406\u3002","info",6e3);else if(ee.length===1){let z=(ke.sources||{})[ee[0]]||{},te=ll[_]||(ee[0]==="judgment"?"\u5224\u6C7A":ee[0]==="law"?"\u6CD5\u898F":ee[0]==="order"?"\u547D\u4EE4":"\u8CC7\u6599");z.status==="error"?P(`${te}\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF1A${z.message||"\u7121\u6CD5\u53D6\u5F97\u7DDA\u4E0A\u7248\u672C"}`,"danger",7e3):P(z.update_available?`${te}\u7DDA\u4E0A\u5DF2\u6709\u66F4\u65B0\u7248\u672C\u3002`:`${te}\u7DDA\u4E0A\u5DF2\u662F\u6700\u65B0\u7248\u672C\u3002`,z.update_available?"warn":"ok",6e3)}else if(ee.length>1){let z=ke.sources||{},te=ee.filter(Ae=>z[Ae]?.update_available),ce=ee.filter(Ae=>z[Ae]?.status==="error");ce.length?P(`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF0C\u4F46\u6709 ${ce.length} \u9805\u6AA2\u67E5\u5931\u6557\u3002`,"danger",7e3):P(te.length?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${te.length} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",te.length?"warn":"ok",6e3)}else{let z=Number(ke.update_count)||0;P(z>0?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${z} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",z>0?"warn":"ok",6e3)}Z&&(Qt.set(Z,{kind:"check",phase:"updated",startedAt:Date.now()}),At()),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await Et({silent:!0})}catch(ke){Z&&(Qt.delete(Z),At()),P(ke.message||"\u66F4\u65B0\u6AA2\u67E5\u5931\u6557\u3002","danger",7e3)}finally{u=!1,Ne(f,!1),b&&os(b)}},zs=async f=>{let _=ol[f]||"";if(!_)return!0;let E=null;try{E=await U.checkUpdates([_])}catch(ee){return P(`\u7121\u6CD5\u5B8C\u6210\u7248\u672C\u6AA2\u67E5\uFF08${ee.message||"\u7DB2\u8DEF\u932F\u8AA4"}\uFF09\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002`,"warn",7e3),!0}if(!E||E.checking)return E&&E.checking&&P("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","info",6e3),!0;let ie=(E.sources||{})[_];if(!ie)return!0;if(window.dispatchEvent(new CustomEvent("judgment:updates-changed")),ie.status==="up_to_date"&&!ie.update_available){let ee=ll[f]||"\u8CC7\u6599",Z=ie.checked_at?`\uFF08${_e(ie.checked_at)} \u6AA2\u67E5\uFF09`:"",ke=Yu[f]||"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u55CE\uFF1F";return window.confirm(`${ee}\u7DDA\u4E0A\u6AA2\u67E5\u70BA\u6700\u65B0\u7248\u672C${Z}\u3002

${ke}`)}return ie.status==="error"&&P("\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","warn",6e3),!0},Wt=async(f,_)=>{if(u)return;u=!0;let E=(b?.workflows||[]).find(Z=>Z.id===_);Cs=E?.active_run?.id||E?.last_run?.id||"",Jt=_,Ne(f,!0,"\u57F7\u884C\u4E2D"),At();let ie=f.dataset.stageId||"",ee=!1;try{if(!await zs(_))return;ie&&(Qt.set(ie,{kind:"upgrade",phase:"upgrading",startedAt:Date.now()}),At());let ke;try{ke=await U.startProcessingWorkflow(_)}catch(z){throw ie&&(Qt.delete(ie),At()),z}ee=!0,P(`\u5DF2\u555F\u52D5\u300C${E?.label||_}\u300D\u6D41\u7A0B\u3002`,"ok",6e3),ke&&ke.run_id&&console.info("processing workflow started",ke),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),Et({silent:!0}),window.setTimeout(()=>{Jt===_&&(Jt="",Cs="",Et({silent:!0}))},15e3)}catch(Z){P(Z.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{u=!1,(!ee||Jt!==_)&&(Jt="",Cs="",b?(os(b),y="",At()):Ne(f,!1))}},w=async f=>{if(!(u||p)){u=!0,p=!0,Ne(f,!0,"\u505C\u6B62\u4E2D\u2026");try{let _=await U.stopProcessingUpdate();for(let[E,ie]of Qt)ie.kind==="upgrade"&&Qt.delete(E);At(),Et({silent:!0}),P(_.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3)}catch(_){p=!1,Ne(f,!1),P(_.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{u=!1,p?na():b&&os(b)}}},G=f=>{let _=f.target.closest("[data-processing-action]");if(!_||_.disabled)return;if(t&&!Ea.has(_.dataset.processingAction||"")){f.preventDefault(),f.stopPropagation(),P("\u5C55\u793A\u6A21\u5F0F\u50C5\u4F9B\u6AA2\u8996\uFF0C\u57F7\u884C\u8207\u8A2D\u5B9A\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002","info",4e3);return}_.closest(".processing-wf-rail")&&(f.preventDefault(),f.stopPropagation());let E=_.dataset.processingAction;if(E==="refresh")Et({silent:!1,cached:t});else if(E==="open-stage")Qe(_.dataset.stageId||"");else if(E==="refresh-judgment-months")re({quiet:!1});else if(E==="refresh-index-storage")pe({quiet:!1,force:!0});else if(E==="refresh-court-check")Pe({quiet:!1,force:!0});else if(E==="refresh-law-version-check")De({quiet:!1,force:!0,button:_});else if(E==="refresh-ollama")ze({quiet:!1,button:_});else if(E==="refresh-embedding-models")ze({quiet:!1,button:_});else if(E==="select-embedding-model"){let ie=_.dataset.hostId||"",ee=_.dataset.model||"";We(`${ie}|${ee}`)}else if(E==="move-ollama-host"){let ie=I?.hosts||[],ee=ie.findIndex(te=>Number(te.id)===Number(_.dataset.hostId)),Z=_.dataset.direction,ke=Z==="up"?ee-1:Z==="down"?ee+1:-1;if(ee<0||ke<0||ke>=ie.length)return;let z=ie.map(te=>Number(te.id));[z[ee],z[ke]]=[z[ke],z[ee]],Tt(z)}else if(E==="check-updates")oa(_,_.dataset.workflowId||"");else if(E==="run-workflow"){let ie=_.dataset.workflowId||"";Wt(_,ie)}else E==="stop"&&w(_)},W=(f,{scroll:_=!1}={})=>{if(M=f||"overview",b){let E=kn(b,M);gs(l,E),k=E;let ie=Sn(b,M,we(),he);if(gs(o,ie),y=ie,Ye(),rt(),et(),gt(b),V){let ee=Ie(V);ee?it(ee):at()}Ms(),_&&o.scrollIntoView({behavior:"smooth",block:"start"})}!t&&Hr.has(M)&&ze({quiet:!0}),M==="judgment_download"&&re({quiet:!0}),M==="index_versions"&&(t?(fe=new Error("\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B Qdrant \u5BB9\u5668\u3001volume \u8207\u4E3B\u6A5F\u5132\u5B58\u8CC7\u8A0A\u3002"),ve=!1,At()):pe({quiet:!0})),M==="normalize_courts"&&Pe({quiet:!0}),M==="backfill_law_articles"&&De({quiet:!0})},ue=f=>{let _=f.target.closest("[data-processing-workflow]");_&&W(_.dataset.processingWorkflow||"overview")},je=f=>{let _=f.target.closest("[data-timeline-workflow]");_&&(f.preventDefault(),W(_.dataset.timelineWorkflow||"",{scroll:!0}))},He=f=>{let _=f.target.closest?.(".index-wf-stage[data-index-stage]");if(_&&o.contains(_)){let Z=_.dataset.indexStage||"";Z&&(_.open?zr.add(Z):zr.delete(Z));return}let E=f.target.closest?.(".workflow-wf-stage[data-workflow-wf-stage]");if(E&&o.contains(E)){let Z=E.dataset.workflowWfStage||"";Z&&(E.open?Gr.add(Z):Gr.delete(Z));return}let ie=f.target.closest?.(".processing-wf-stage[data-processing-stage]");if(!ie||!o.contains(ie))return;let ee=ie.dataset.processingStage||"";ee&&(ie.open?he.add(ee):he.delete(ee))};i.addEventListener("click",G),l.addEventListener("click",ue),o.addEventListener("click",je),o.addEventListener("pointerover",Ft),o.addEventListener("pointerout",es),o.addEventListener("pointerdown",Y),o.addEventListener("toggle",He,!0),window.addEventListener("scroll",at,{capture:!0,passive:!0});let ot=a();ot&&Os(ot,{silent:!0});let Ze=Et({silent:!0,cached:!0,slim:!0});return ne(),await Ze,()=>{$=!0,xe(),Le&&(window.clearInterval(Le),Le=null),i.removeEventListener("click",G),l.removeEventListener("click",ue),o.removeEventListener("click",je),x(),o.removeEventListener("pointerover",Ft),o.removeEventListener("pointerout",es),o.removeEventListener("pointerdown",Y),o.removeEventListener("toggle",He,!0),window.removeEventListener("scroll",at,{capture:!0})}}var si={};ls(si,{render:()=>qm});var Xr={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u522A\u9664\uFF0F\u9000\u5F79",badge:"badge-neutral"}},is={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},sa={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},ql={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function La(e){let t=Xr[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${r(t.label)}</span>`}function Zr(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function Wp(e){return Zr(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",source_type:a||""}})}function Kp(e){return Zr(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",article_no:a||""}})}function Yp(e){return Zr(e).map(t=>({jid:t.trim()}))}function Xp(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function Zp(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function em(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function tm(e){return(e?.tags||[]).join(", ")}function qa(e){return`<div class="qb-empty">${m("info",18)}<span>${r(e)}</span></div>`}function ei(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),n=[...t.map(i=>`<span class="chip">${r(i)}</span>`),...s.map(i=>`<span class="chip">${r(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${r(i)}</span>`)];return n.length?`<div class="chips qb-labels">${n.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function ti(){return`<details class="qb-import">
    <summary>${m("upload",14)}JSON \u6279\u6B21\u532F\u5165</summary>
    <p class="qb-muted">\u683C\u5F0F\uFF1A<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>\u3002\u76F8\u540C\u984C\u76EE fingerprint \u9810\u8A2D\u66F4\u65B0\u3002</p>
    <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
    <div class="qb-actions">
      <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${m("upload",13)}<span>\u532F\u5165 JSON</span></button>
    </div>
  </details>`}function sm(e){let t=e?.item||{},s=Array.isArray(e?.warnings)?e.warnings:[],a=Array.isArray(t.tags)?t.tags:[];return`<section class="report-card qb-card qb-ai-result">
    <div class="side-card-head">
      <span class="side-card-title">${m("sparkles",14)}llama-server \u5DF2\u5EFA\u7ACB\u984C\u76EE #${t.id}</span>
      ${La(t.status)}
    </div>
    <div class="qb-ai-answer">
      <strong>${r(t.question||"")}</strong>
      <div class="qb-ai-meta">
        ${r(is[t.question_type]||t.question_type||"")}
        \xB7 ${r(sa[t.difficulty]||t.difficulty||"")}
        \xB7 ${r(e?.model||"\u672C\u6A5F llama-server")}
      </div>
      ${ei(t)}
      ${t.reference_answer?`<div class="qb-reference"><span class="summary-label">llama-server \u53C3\u8003\u7B54\u6848</span><p>${r(t.reference_answer)}</p></div>`:""}
      ${a.length?`<div class="chips">${a.map(n=>`<span class="chip">${r(n)}</span>`).join("")}</div>`:""}
      ${s.length?`<div class="qb-ai-warnings"><strong>\u9700\u8981\u6CE8\u610F</strong><ul>${s.map(n=>`<li>${r(n)}</li>`).join("")}</ul></div>`:""}
      <div class="qb-actions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="review-ai-item">${m("shield",13)}<span>\u524D\u5F80\u9A57\u6536</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="reset-ai">${m("plus",13)}<span>\u518D\u65B0\u589E\u4E00\u984C</span></button>
      </div>
    </div>
    ${ti()}
  </section>`}function am(e){return e.aiResult?sm(e.aiResult):`<section class="report-card qb-card">
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
    ${ti()}
  </section>`}function nm(e){return`<section class="report-card qb-card">
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
          <select class="select" name="question_type">${Object.entries(is).map(([t,s])=>`<option value="${t}" ${e?.question_type===t?"selected":""}>${s}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u96E3\u5EA6</span>
          <select class="select" name="difficulty">${Object.entries(sa).map(([t,s])=>`<option value="${t}" ${e?.difficulty===t?"selected":""}>${s}</option>`).join("")}</select>
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
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${r(Xp(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${r(Zp(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${r(em(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${r(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${r(tm(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
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
    ${ti()}
  </section>`}function rm(e,t){return e?nm(e):am(t)}function im(e){let t=e.status==="retired"||!!e.deleted_at;return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${r(e.question)}</strong>
        <span class="qb-meta">
          ${r(is[e.question_type]||e.question_type)}
          \xB7 ${r(sa[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${La(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${ei(e)}
    <div class="qb-item-foot">
      <span>\u66F4\u65B0 ${r(_e(e.updated_at))}</span>
      ${e.reviewed_by?`<span>\u5BE9\u6838 ${r(e.reviewed_by)}</span>`:""}
      ${e.review_comment?`<span class="qb-comment">${r(e.review_comment)}</span>`:""}
      <div class="qb-actions">
        ${t?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="restore" data-id="${e.id}">${m("refresh",13)}<span>\u5FA9\u539F\u984C\u76EE</span></button>`:`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${m("edit",13)}<span>\u7DE8\u8F2F</span></button>
               ${["pending_review","changes_requested"].includes(e.status)?"":`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="submit-review" data-id="${e.id}">${m("upload",13)}<span>${e.status==="draft"?"\u9001\u5BE9":"\u91CD\u65B0\u9001\u5BE9"}</span></button>`}
               <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${e.id}">${m("shield",13)}<span>\u9A57\u6536</span></button>
               <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${m("trash",13)}<span>\u522A\u9664</span></button>`}
      </div>
    </div>
  </article>`}function om(e){return`<section class="report-card qb-card">
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
        ${Object.entries(Xr).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(is).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(sa).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
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
      ${e.items.length?e.items.map(t=>im(t)).join(""):qa("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${c(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}var jl=[["queue","\u5F85\u5BE9\uFF0F\u9000\u56DE"],["accepted","\u5DF2\u6838\u51C6"],["rejected","\u5DF2\u62D2\u7D55"],["draft","\u8349\u7A3F"]];function lm(e){let t=e.stats||{};return{queue:Number(t.pending_review||0)+Number(t.changes_requested||0),accepted:Number(t.accepted||0),rejected:Number(t.rejected||0),draft:Number(t.draft||0)}}function cm(e,t){let s=e.reviewFilter||"queue",a={queue:{title:"\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u6216\u9000\u56DE\u4FEE\u6539\u7684\u984C\u76EE\u3002",text:t.accepted?`\u5DF2\u6709 ${c(t.accepted)} \u984C\u6838\u51C6\u3002\u65B0\u984C\u76EE\u5EFA\u7ACB\u5F8C\u6703\u81EA\u52D5\u9001\u5BE9\uFF0C\u4E5F\u53EF\u4EE5\u5207\u63DB\u5230\u300C\u5DF2\u6838\u51C6\u300D\u91CD\u65B0\u9A57\u6536\u65E2\u6709\u984C\u76EE\u3002`:"\u5EFA\u7ACB\u984C\u76EE\u5F8C\u6703\u9810\u8A2D\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\uFF1B\u82E5\u53EA\u60F3\u5148\u4FDD\u5B58\uFF0C\u5EFA\u7ACB\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5373\u53EF\u5B58\u6210\u8349\u7A3F\u3002"},accepted:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u6838\u51C6\u984C\u76EE\u3002",text:"\u984C\u76EE\u901A\u904E\u4EBA\u5DE5\u9A57\u6536\u5F8C\u6703\u5217\u5728\u9019\u88E1\uFF1B\u4E5F\u53EF\u4EE5\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u9001\u51FA\u9A57\u6536\u3002"},rejected:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u62D2\u7D55\u984C\u76EE\u3002",text:"\u88AB\u62D2\u7D55\u7684\u984C\u76EE\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u4E2D\uFF0C\u53EF\u4FEE\u6539\u5F8C\u91CD\u65B0\u9001\u5BE9\u3002"},draft:{title:"\u76EE\u524D\u6C92\u6709\u8349\u7A3F\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u984C\u76EE\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5C31\u6703\u5B58\u6210\u8349\u7A3F\uFF0C\u4E4B\u5F8C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002"}}[s]||{title:"\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u65B0\u984C\u76EE\u5F8C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"},n=[s!=="draft"?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="new">${m("plus",13)}<span>\u65B0\u589E\u984C\u76EE</span></button>`:"",s==="queue"&&t.accepted?`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="review-filter" data-filter="accepted">${m("shield",13)}<span>\u67E5\u770B\u5DF2\u6838\u51C6 ${c(t.accepted)}</span></button>`:"",`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="go-manage">${m("database",13)}<span>\u524D\u5F80\u984C\u5EAB\u7BA1\u7406</span></button>`].filter(Boolean).join("");return`<div class="qb-empty qb-empty-block">
    <span class="qb-empty-icon">${m("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>${r(a.title)}</strong>
      <p>${r(a.text)}</p>
      <div class="qb-actions">${n}</div>
    </div>
  </div>`}function dm(e){let t=jl.find(([s])=>s===e);return t?t[1]:"\u5F85\u5BE9\uFF0F\u9000\u56DE"}function um(e,t){return`<button class="qb-review-item${t?" is-active":""}" type="button" data-qb-action="select-review-item" data-id="${e.id}" aria-pressed="${t?"true":"false"}">
    <span class="qb-review-item-top">
      <span class="qb-id">#${e.id}</span>
      <span class="qb-review-item-meta">
        ${r(is[e.question_type]||e.question_type)}
        \xB7 ${r(sa[e.difficulty]||e.difficulty)}
        \xB7 v${e.version}
        ${e.benchmark_ready?" \xB7 Benchmark ready":""}
        ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
      </span>
      ${La(e.status)}
    </span>
    <strong>${r(e.question)}</strong>
  </button>`}function pm(e){return`<article class="qb-review-pane-card">
    <div class="qb-review-pane-head">
      <div class="qb-review-pane-title">
        <span class="qb-review-item-meta">#${e.id} \xB7 v${e.version} \xB7 ${r(is[e.question_type]||e.question_type)} \xB7 ${r(sa[e.difficulty]||e.difficulty)}</span>
        <strong>${r(e.question)}</strong>
      </div>
      <div class="qb-review-pane-side">
        ${La(e.status)}
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${m("edit",13)}<span>\u7DE8\u8F2F</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
        </div>
      </div>
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${ei(e)}
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
    ${e.reviews?.length?`<div class="qb-review-history"><span class="summary-label">\u5BE9\u6838\u7D00\u9304</span>${e.reviews.map(t=>`<div class="qb-review-row"><span>${r(t.reviewer||"\u533F\u540D")}</span>${La(t.decision==="approved"?"accepted":t.decision)}<span>${r(_e(t.created_at))}</span><p>${r(t.comment||"\u2014")}</p></div>`).join("")}</div>`:""}
  </article>`}function mm(){return`<div class="qb-empty qb-empty-block qb-review-placeholder">
    <span class="qb-empty-icon">${m("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>\u5F9E\u5DE6\u5074\u9078\u64C7\u984C\u76EE</strong>
      <p>\u9EDE\u9078\u984C\u76EE\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u984C\u5E79\u3001\u9810\u671F\u6A19\u8A3B\u3001\u53C3\u8003\u7B54\u6848\u8207\u6838\u51C6\u9078\u9805\u3002</p>
    </div>
  </div>`}function gm(e){let t=e.reviewDetail,s=lm(e),a=e.reviewFilter||"queue",n=jl.map(([l,d])=>`<button class="chip qb-review-tab${a===l?" is-active":""}" type="button" role="tab" aria-selected="${a===l?"true":"false"}" data-qb-action="review-filter" data-filter="${l}"><span>${d}</span><span class="qb-review-tab-count">${c(s[l]||0)}</span></button>`).join(""),i=e.reviewItems.length?e.reviewItems.map(l=>um(l,Number(t?.id)===Number(l.id))).join(""):`<div class="qb-empty qb-empty-compact">${m("info",16)}<span>\u76EE\u524D\u6C92\u6709${r(dm(a))}\u984C\u76EE\u3002</span></div>`,o=t?pm(t):e.reviewItems.length?mm():cm(e,s);return`<section class="report-card qb-card qb-review-card">
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
  </section>`}function Ma(e){if(e==null||e==="")return"";let t=Number(e);return Number.isFinite(t)?`${Math.round(t*100)}%`:""}function fm(e){if(!e||typeof e!="object")return"\u5F15\u7528";let t=String(e.jid||"").trim();if(t)return t;let s=String(e.law_name||"").trim(),a=String(e.article_no||"").trim(),n=`${s} ${a}`.trim();return n||String(e.title||e.text||"\u5F15\u7528").slice(0,80)}function bm(e){let t=e?.metrics||{},s=t.scores||{},a=[["\u6CD5\u898F\u53EC\u56DE",Ma(t.law_recall)],["\u689D\u6587\u53EC\u56DE",Ma(t.article_recall)],["\u898F\u5247\u5206",Ma(s.deterministic)],["Judge",Ma(s.judge)],["\u4EBA\u5DE5",Ma(s.human)]].filter(([,n])=>n);return a.length?`<div class="qb-bank-stats">${a.map(([n,i])=>`<span class="qb-bank-stat"><span>${r(n)}</span><strong>${r(i)}</strong></span>`).join("")}</div>`:""}function hm(e){let t=Array.isArray(e?.law_sources)?e.law_sources:[],s=Array.isArray(e?.citations)?e.citations:[],a=t.length?`<div class="qb-bank-sources">${t.map(i=>{let o=String(i.law_name||"\u672A\u547D\u540D\u6CD5\u898F"),l=(i.articles||[]).map(p=>String(p.article_no||"").trim()).filter(Boolean),d=`<strong>${r(o)}</strong>${l.length?`<small>${r(l.join("\u3001"))}</small>`:""}`;return i.law_url?`<a class="qb-bank-law" href="${r(i.law_url)}" target="_blank" rel="noreferrer">${d}</a>`:`<span class="qb-bank-law">${d}</span>`}).join("")}</div>`:"",n=s.length?`<div class="qb-bank-sources qb-bank-citations">${s.map(i=>`<span class="chip chip-mono">${r(fm(i))}</span>`).join("")}</div>`:"";return!a&&!n?"":`<div class="qb-bank-answer-block">
    <div class="qb-bank-section-label"><span>\u5F15\u7528\u4F86\u6E90</span><span>${c(t.length+s.length)} \u7B46</span></div>
    ${a}${n}
  </div>`}function Tl(e,t){if(!e)return`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("history",20)}</span>
      <strong>\u5C1A\u7121 RAG \u7B54\u6848</strong>
      <span>\u8DD1\u4E00\u6B21 Benchmark \u5F8C\uFF0C\u6700\u8FD1\u4E00\u6B21\u6210\u529F\u56DE\u7B54\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</span>
    </div>`;let s=Number(e.item_version||0),a=Number(t?.version||0),n=s&&a&&s!==a?`<span class="badge badge-warn">\u7B54\u6848 v${s} \xB7 \u984C\u76EE v${a}</span>`:"",i=e.answer_source==="llm"?"LLM \u751F\u6210":e.answer_source==="structured"?"\u6CD5\u898F\u8CC7\u6599\u5EAB":String(e.answer_source||"RAG");return`<div class="qb-bank-answer-meta">
      <span class="badge badge-ok"><span class="status-dot is-ok"></span>RAG \u5B8C\u6210</span>
      <span class="badge badge-neutral">${r(i)}</span>
      ${n}
      <span class="mono">${r(e.run_label||e.run_id||"")}</span>
      <span>${r(_e(e.finished_at))}</span>
      <span>${r(ge(e.duration_ms))}</span>
      ${e.llm_model?`<span class="mono">${r(e.llm_model)}</span>`:""}
    </div>
    <div class="qb-bank-answer-block">
      <div class="qb-bank-section-label"><span>\u56DE\u7B54</span><span>${c(String(e.answer||"").length)} \u5B57</span></div>
      <p class="qb-bank-answer-text">${r(String(e.answer||"").trim()||"\uFF08\u7A7A\u767D\u56DE\u7B54\uFF09")}</p>
    </div>
    ${hm(e)}
    ${bm(e)}`}function El(e,t){let s=e.selectedSuiteId,a=t&&e.suiteAnswers?.[String(s)]?.[String(t.id)]||null;return t?`<div class="qb-bank-answer-head">
      <div class="qb-bank-answer-heading">
        <span class="qb-bank-answer-kicker">${m("sparkles",12)}RAG \u6700\u8FD1\u4E00\u6B21\u7B54\u6848</span>
        <strong class="qb-bank-answer-question">#${t.id} ${r(t.question)}</strong>
      </div>
      ${a?`<span class="qb-bank-answer-state">${r(is[t.question_type]||t.question_type)} \xB7 v${t.version}</span>`:""}
    </div>
    ${Tl(a,t)}`:`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("cube",20)}</span>
      <strong>\u9078\u64C7\u984C\u76EE</strong>
      <span>\u5F9E\u5DE6\u5074\u6E05\u55AE\u9078\u64C7\u4E00\u984C\uFF0C\u67E5\u770B\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`}function Nl(e){return`<span class="qb-bank-actions">
    <button class="qb-bank-icon" type="button" data-qb-action="edit" data-id="${e.id}" title="\u7DE8\u8F2F\u984C\u76EE" aria-label="\u7DE8\u8F2F\u984C\u76EE #${e.id}">${m("edit",13)}</button>
    <button class="qb-bank-icon is-danger" type="button" data-qb-action="delete" data-id="${e.id}" title="\u5F9E\u984C\u5EAB\u79FB\u9664" aria-label="\u5F9E\u984C\u5EAB\u79FB\u9664 #${e.id}">${m("trash",13)}</button>
  </span>`}function vm(e,t,{selected:s,hasAnswer:a}){return`<div class="qb-bank-row${s?" is-active":""}" data-id="${e.id}">
    <button class="qb-bank-select" type="button" data-qb-action="select-bank-item" data-id="${e.id}" aria-pressed="${s?"true":"false"}">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <span class="qb-bank-item-copy">
        <strong>${r(e.question)}</strong>
        <small>${r(is[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${a?"\u5DF2\u6709 RAG \u7B54\u6848":"\u5C1A\u7121 RAG \u7B54\u6848"}</small>
      </span>
    </button>
    ${Nl(e)}
  </div>`}function $m(e,t,s){return`<article class="qb-bank-full-item" data-id="${e.id}">
    <div class="qb-bank-full-head">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <div class="qb-bank-full-title">
        <strong>${r(e.question)}</strong>
        <small>${r(is[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${r(Xr[e.status]?.label||e.status||"")}</small>
      </div>
      ${Nl(e)}
    </div>
    ${Tl(s,e)}
  </article>`}function Ll(e){let t=e.editingSuite,s=Array.isArray(e.suites)?e.suites:[],a=s.find(u=>Number(u.id)===Number(e.selectedSuiteId))||s[0]||null,n=Array.isArray(a?.items)?a.items:[],i=e.suiteAnswers?.[String(a?.id)]||{},o=n.find(u=>Number(u.id)===Number(e.selectedBankItemId))||null,l=!!e.suiteAnswersLoading,d=String(e.suiteAnswersError||""),p=!!e.suiteManageOpen||!s.length,g=e.bankTab==="full"?"full":"split",$=s.length?`<div class="qb-bank-tabs" role="tablist" aria-label="Benchmark \u984C\u5EAB\u6AA2\u8996">
        <button class="qb-bank-tab${g==="split"?" is-active":""}" type="button" role="tab" aria-selected="${g==="split"?"true":"false"}" data-qb-action="bank-tab" data-tab="split">${m("grid",13)}<span>Benchmark \u984C\u5EAB</span><span class="badge badge-neutral">${c(n.length)}</span></button>
        <button class="qb-bank-tab${g==="full"?" is-active":""}" type="button" role="tab" aria-selected="${g==="full"?"true":"false"}" data-qb-action="bank-tab" data-tab="full">${m("table",13)}<span>\u984C\u5EAB\u5168\u5217\u8868</span><span class="badge badge-neutral">${c(n.length)}</span></button>
      </div>`:"",v="";if(!s.length)v=`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("cube",20)}</span>
      <strong>\u5C1A\u672A\u5EFA\u7ACB Benchmark \u984C\u5EAB</strong>
      <span>\u5C55\u958B\u4E0B\u65B9 Suite \u8A2D\u5B9A\u4E26\u5EFA\u7ACB\u984C\u5EAB\u5F8C\uFF0C\u5C31\u80FD\u5728\u9019\u88E1\u700F\u89BD\u984C\u76EE\u8207\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`;else if(l)v='<div class="qb-bank-loading"><span class="spinner" aria-hidden="true"></span><span>\u8B80\u53D6\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u4E2D\u2026</span></div>';else{let u=d?Fe({tone:"warn",title:"\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u8B80\u53D6\u5931\u6557",text:r(d)}):"";g==="full"?v=`${u}<div class="qb-bank-full" data-qb-bank-view="full">${n.length?n.map((b,y)=>$m(b,y,i[String(b.id)]||null)).join(""):qa("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>`:v=`${u}<div class="qb-bank-split" data-qb-bank-view="split">
        <div class="qb-bank-list" data-qb-bank-list>${n.length?n.map((b,y)=>vm(b,y,{selected:Number(b.id)===Number(o?.id),hasAnswer:!!i[String(b.id)]})).join(""):qa("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>
        <div class="qb-bank-answer-pane" data-qb-bank-answer>${El(e,o)}</div>
      </div>`}return`<section class="report-card qb-card qb-bank-card">
    <div class="side-card-head qb-bank-head">
      <div class="qb-bank-heading">
        <span class="side-card-title">${m("cube",14)}Benchmark \u984C\u5EAB</span>
        <span class="qb-bank-sub">${a?`${r(a.name)} \xB7 v${a.version} \xB7 ${c(a.item_count)} \u984C`:"\u5C1A\u672A\u5EFA\u7ACB suite"}</span>
      </div>
      <div class="qb-bank-controls">
        ${s.length?`<label class="qb-suite-picker"><span>Suite</span><select class="select" data-qb-suite-select aria-label="\u9078\u64C7 benchmark suite">${s.map(u=>`<option value="${u.id}" ${Number(u.id)===Number(a?.id)?"selected":""}>${r(u.name)} \xB7 ${c(u.item_count)} \u984C</option>`).join("")}</select></label>`:""}
        ${a?`<span class="badge ${a.status==="frozen"?"badge-ok":"badge-neutral"}">${a.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>`:""}
      </div>
    </div>
    ${$}
    ${v}
    <details class="qb-suite-manage" ${p?"open":""}>
      <summary>${m("sliders",14)}Suite \u8A2D\u5B9A\u8207\u7248\u672C <span class="qb-muted">${c(s.length)} \u500B suite \xB7 ${c(e.ready.length)} \u984C benchmark-ready</span></summary>
      <div class="qb-suite-manage-body">
        <form class="qb-suite-form" data-qb-form="suite">
          <input type="hidden" name="suite_id" value="${t?.id||""}" />
          <div class="qb-form-grid">
            <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${r(t?.name||"Pilot 30")}" /></label>
            <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(ql).map(([u,b])=>`<option value="${u}" ${t?.tier===u?"selected":""}>${b}</option>`).join("")}</select></label>
          </div>
          <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${r(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
          <div class="qb-check-list">
            ${e.ready.length?e.ready.map(u=>{let b=t?t.items?.some(y=>Number(y.id)===Number(u.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${u.id}" ${b?"checked":""}/><span><strong>#${u.id}</strong> ${r(u.question)} <small>${r(is[u.question_type]||u.question_type)}</small></span></label>`}).join(""):qa("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
          </div>
          <div class="qb-actions">
            <button class="btn btn-primary" type="submit">${m("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
            ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
          </div>
        </form>
        <div class="qb-list">
          ${s.length?s.map(u=>`<article class="qb-suite">
            <div class="qb-item-head">
              <div class="qb-item-title"><strong>${r(u.name)}</strong><span class="qb-meta">${r(ql[u.tier]||u.tier)} \xB7 v${u.version} \xB7 ${c(u.item_count)} \u984C</span></div>
              <span class="badge ${u.status==="frozen"?"badge-ok":"badge-neutral"}">${u.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
            </div>
            <div class="qb-suite-items">${(u.items||[]).slice(0,8).map(b=>`<span class="chip">#${b.id} ${r(b.question.slice(0,22))}${b.question.length>22?"\u2026":""}</span>`).join("")}${u.item_count>8?`<span class="qb-muted">+${u.item_count-8}</span>`:""}</div>
            <div class="qb-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${u.id}">${m("edit",13)}<span>\u7DE8\u8F2F suite</span></button>
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${u.id}">${m("shield",13)}<span>\u51CD\u7D50</span></button>
              <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${u.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
            </div>
          </article>`).join(""):qa("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
        </div>
      </div>
    </details>
  </section>`}function ym(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),n=Number(a?.value);Number.isFinite(n)&&(t[s]=Math.max(1,Math.min(5,Math.round(n))))}return t}function wm(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:Wp(t.get("expected_laws")),expected_articles:Kp(t.get("expected_articles")),expected_judgments:Yp(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function Rl(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},n={tab:"",editing:null,editingFrom:"",editingSuite:null,aiQuestion:"",aiLoading:!1,aiResult:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tags:[]},stats:{},suites:[],ready:[],selectedSuiteId:null,selectedBankItemId:null,bankTab:"split",suiteAnswers:{},suiteAnswersLoading:!1,suiteAnswersError:"",suiteManageOpen:!1,reviewItems:[],reviewDetail:null,reviewFilter:"queue"},i=R=>e.querySelector(`#quality-panel-${a[R]}`),o=(R,D)=>{R&&(R.childElementCount?R.setAttribute("aria-busy","true"):R.innerHTML=`<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>${D}</span></div></section>`)},l=R=>{R?.removeAttribute("aria-busy")},d=0,p=null,g=()=>"anonymous",$=()=>{s&&s(n.stats)},v=R=>{t&&t(R),le(R)},u=async()=>{try{n.stats=await U.questionBankStats()}catch{n.stats={}}$()},b=()=>{let R=i("create");R&&(R.innerHTML=rm(n.editing,n))},y=(R,D)=>{let Q=R?.querySelector("[data-qb-tag-results]");Q&&(Q.innerHTML=D.length?D.map(C=>`<button class="qb-tag-option" type="button" role="option" data-qb-action="select-tag" data-tag="${r(C.tag)}"><span>${r(C.tag)}</span><small>${c(C.count)}</small></button>`).join(""):'<div class="qb-tag-empty">\u6C92\u6709\u5176\u4ED6\u76F8\u7B26\u6A19\u7C64</div>')},k=async(R,D="")=>{if(!R)return;let Q=R.querySelector("[data-qb-tag-results]"),C=++d;Q&&(Q.innerHTML='<div class="qb-tag-loading"><span class="spinner"></span><span>\u641C\u5C0B\u6A19\u7C64\u2026</span></div>');try{let O=await U.questionBankTags(D,12);if(C!==d)return;let F=(O.tags||[]).filter(we=>!n.filters.tags.includes(we.tag));y(R,F)}catch(O){if(C!==d)return;Q&&(Q.innerHTML=`<div class="qb-tag-empty">${r(O.message||"\u6A19\u7C64\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},M=(R,{focus:D=!1}={})=>{if(!R)return;let Q=R.querySelector("[data-qb-tag-popover]"),C=R.querySelector("[data-qb-tag-search]");!Q||!C||(Q.hidden&&(Q.hidden=!1,C.value="",k(R,"")),D&&(C.focus(),C.select()))},S=R=>{p&&(window.clearTimeout(p),p=null);let D=R?.querySelector("[data-qb-tag-popover]");D&&(D.hidden=!0)},h=async R=>{let D=String(R||"").trim();D&&(n.filters.tags.includes(D)?n.filters.tags=n.filters.tags.filter(Q=>Q!==D):n.filters.tags=[...n.filters.tags,D],n.offset=0,await A())},L=()=>{let R=Array.isArray(n.suites)?n.suites:[];if(!R.length)return n.selectedSuiteId=null,n.selectedBankItemId=null,null;let D=R.find(C=>Number(C.id)===Number(n.selectedSuiteId));D||(D=R[0],n.selectedSuiteId=D.id,n.selectedBankItemId=null);let Q=Array.isArray(D.items)?D.items:[];return Q.some(C=>Number(C.id)===Number(n.selectedBankItemId))||(n.selectedBankItemId=Q[0]?.id??null),D},X=()=>{let R=i("suite");R&&(R.innerHTML=Ll(n))},J=0,ve=async(R,{force:D=!1}={})=>{if(!R)return;let Q=++J;if(!D&&n.suiteAnswers[String(R)]){n.suiteAnswersLoading=!1,n.suiteAnswersError="",X();return}n.suiteAnswersLoading=!0,n.suiteAnswersError="",X();try{let C=await U.benchmarkSuiteLatestAnswers(R);if(Q!==J)return;n.suiteAnswers[String(R)]=C.answers||{}}catch(C){if(Q!==J)return;n.suiteAnswersError=C.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}finally{Q===J&&(n.suiteAnswersLoading=!1,X())}},fe=async R=>{n.selectedSuiteId=R,n.selectedBankItemId=null,n.suiteAnswersError="";let D=L();if(!D){X();return}await ve(D.id)},se=R=>{n.bankTab=R==="full"?"full":"split",X()},q=()=>{let R=i("suite");if(!R)return;let D=L(),C=(Array.isArray(D?.items)?D.items:[]).find(F=>Number(F.id)===Number(n.selectedBankItemId))||null;for(let F of R.querySelectorAll(".qb-bank-row")){let we=Number(F.dataset.id)===Number(n.selectedBankItemId);F.classList.toggle("is-active",we);let Oe=F.querySelector("[data-qb-action='select-bank-item']");Oe&&Oe.setAttribute("aria-pressed",we?"true":"false")}let O=R.querySelector("[data-qb-bank-answer]");O&&(O.innerHTML=El(n,C))},A=async()=>{let R=i("manage");if(R){p&&(window.clearTimeout(p),p=null),o(R,"\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026");try{let D=await U.questionBankItems({...n.filters,...n.filters.status==="retired"?{include_deleted:!0}:{}},n.limit,n.offset);n.items=D.items||[],n.total=Number(D.total||0),n.stats=D.stats||n.stats,l(R),R.innerHTML=om(n),$()}catch(D){l(R),R.innerHTML=`<section class="report-card qb-card">${Fe({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(D.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},T=async({refreshAnswers:R=!1}={})=>{let D=i("suite");if(D){o(D,"\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026");try{let[Q,C]=await Promise.all([U.benchmarkSuites(),U.benchmarkReadyQuestions(300)]);n.suites=Q.suites||[],n.ready=C.items||[];let O=L();if(n.suiteAnswersError="",n.suiteAnswersLoading=!1,O&&(R||!n.suiteAnswers[String(O.id)]))try{let F=await U.benchmarkSuiteLatestAnswers(O.id);n.suiteAnswers[String(O.id)]=F.answers||{}}catch(F){n.suiteAnswersError=F.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}l(D),D.innerHTML=Ll(n)}catch(Q){l(D),D.innerHTML=`<section class="report-card qb-card">${Fe({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(Q.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},K=()=>{let R=i("review");R&&(R.innerHTML=gm(n))},me=async R=>{let D=n.reviewItems.find(C=>Number(C.id)===Number(R));if(!D)return;n.reviewDetail=D,K();let Q=i("review")?.querySelector(".qb-review-detail-pane");Q&&window.matchMedia("(max-width: 1020px)").matches&&Q.scrollIntoView({behavior:"smooth",block:"start"});try{let C=await U.questionBankItem(D.id);Number(n.reviewDetail?.id)===Number(D.id)&&(n.reviewDetail=C,K())}catch(C){P(C.message||"\u984C\u76EE\u5167\u5BB9\u8B80\u53D6\u5931\u6557\u3002","danger")}},H=async()=>{let R=i("review");if(!R)return;o(R,"\u8B80\u53D6\u9A57\u6536\u984C\u76EE\u4E2D\u2026");let D=n.reviewFilter||"queue",Q=D==="queue"?["pending_review","changes_requested"]:D==="accepted"?["accepted"]:D==="rejected"?["rejected"]:["draft"];try{let C=await Promise.all(Q.map(Oe=>U.questionBankItems({status:Oe},200,0)));n.reviewItems=C.flatMap(Oe=>Oe.items||[]),n.stats=C[0]?.stats||n.stats;let O=Number(n.reviewDetail?.id||0),we=n.reviewItems.some(Oe=>Number(Oe.id)===O)?O:Number(n.reviewItems[0]?.id||0);n.reviewDetail=we?await U.questionBankItem(we):null,l(R),K(),$()}catch(C){l(R),R.innerHTML=`<section class="report-card qb-card">${Fe({tone:"danger",title:"\u9A57\u6536\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:r(C.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}};function le(R){let D=n.tab;n.tab=R;for(let Q of Object.keys(a)){let C=i(Q);C&&(C.hidden=Q!==R)}R==="create"?(D!=="create"&&!n.editing&&(n.aiQuestion="",n.aiResult=null),b()):R==="manage"?A():R==="suite"?T():R==="review"&&H()}let Te=R=>{let Q=[...n.items,...n.reviewItems,...n.reviewDetail?[n.reviewDetail]:[]].find(O=>Number(O.id)===Number(R));n.reviewDetail=Q||{id:Number(R)};let C=Q?.status;["accepted","rejected","draft"].includes(C)?n.reviewFilter=C:C&&(n.reviewFilter="queue"),v("review")},I=async R=>{let D=wm(R),Q=Number(R.elements.item_id?.value||0);Q||(D.status=R.elements.submit_for_review?.checked?"pending_review":"draft");try{Q?(await U.updateQuestionBankItem(Q,{...D,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),P("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await U.createQuestionBankItem(D),P(D.status==="draft"?"\u984C\u76EE\u5DF2\u5B58\u70BA\u8349\u7A3F\uFF0C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002":"\u984C\u76EE\u5DF2\u5EFA\u7ACB\u4E26\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok")),n.editing=null;let C=["manage","suite","review"].includes(n.editingFrom)?n.editingFrom:"manage";n.editingFrom="",n.suiteAnswers={},await u(),v(C)}catch(C){let O=C.detail||C.payload?.detail,F=O?.errors?.join(" \xB7 ")||O?.message||C.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";P(F,"danger",8e3)}},ye=async R=>{let D=String(new FormData(R).get("question")||"").trim();if(D.length<4){P("\u984C\u76EE\u81F3\u5C11\u9700\u8981 4 \u500B\u5B57\u3002","danger");return}n.aiQuestion=D,n.aiLoading=!0,n.aiResult=null,b();try{let Q=await U.createQuestionBankItemWithAI({question:D});n.aiResult=Q,n.aiQuestion="",await u(),P(`llama-server \u5DF2\u5EFA\u7ACB\u984C\u76EE #${Q.item.id}\uFF0C\u72C0\u614B\u70BA\u5F85\u5BE9\uFF0C\u8ACB\u4EBA\u5DE5\u8986\u6838\u3002`,"ok",8e3)}catch(Q){let C=Q.detail||Q.payload?.detail,O=C?.errors?.join(" \xB7 ")||C?.message||Q.message||"llama-server \u7522\u751F\u5931\u6557\u3002";P(O,"danger",12e3)}finally{n.aiLoading=!1,b()}},ae=async(R,D)=>{let Q=Number(R.dataset.id||0);if(Q)try{await U.reviewQuestionBankItem(Q,{decision:D,reviewer:g(),rubric_scores:ym(R),comment:String(R.querySelector('[name="comment"]')?.value||"")}),P(D==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":D==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",D==="approved"?"ok":"info"),await u(),await H()}catch(C){let O=C.detail||C.payload?.detail,F=O?.errors?.join(" \xB7 ")||O?.message||C.message||"\u9A57\u6536\u5931\u6557\u3002";P(F,"danger",8e3)}},Se=async R=>{let D=new FormData(R),Q=Number(D.get("suite_id")||0),C=Array.from(R.querySelectorAll('input[name="item_ids"]:checked')).map(F=>Number(F.value)),O={name:String(D.get("name")||"").trim(),tier:String(D.get("tier")||"core"),description:String(D.get("description")||"").trim(),item_ids:C};try{Q?(await U.updateBenchmarkSuite(Q,O),P("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await U.createBenchmarkSuite(O),P("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),n.editingSuite=null,n.suiteManageOpen=!0,n.suiteAnswers={},await T()}catch(F){let we=F.detail||F.payload?.detail,Oe=we?.errors?.join(" \xB7 ")||we?.message||F.message||"Suite \u5132\u5B58\u5931\u6557\u3002";P(Oe,"danger",8e3)}},Me=async R=>{let D=e.querySelector("[data-qb-tag-filter] [data-qb-tag-popover]:not([hidden])")?.closest("[data-qb-tag-filter]");D&&!R.target.closest("[data-qb-tag-filter]")&&S(D);let Q=R.target.closest("[data-qb-action]")?.dataset.qbAction;if(!Q)return;let C=R.target.closest("[data-qb-action]"),O=Number(C.dataset.id||0);if(Q==="open-tag-search"){let F=C.closest("[data-qb-tag-filter]");M(F,{focus:!0});return}if(Q==="select-tag"){await h(C.dataset.tag);return}if(Q==="remove-tag"){await h(C.dataset.tag);return}if(Q==="bank-tab"){se(C.dataset.tab);return}if(Q==="select-bank-item"){n.selectedBankItemId=O,q();return}if(Q==="new"){n.editing=null,n.editingFrom="",n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,v("create");return}if(Q==="reset-create"){n.editing=null,b();return}if(Q==="reset-ai"){n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,b();return}if(Q==="edit"){let F=n.suites.find(Ye=>Number(Ye.id)===Number(n.selectedSuiteId)),Oe=[...n.items,...n.reviewItems,...F?.items||[],...n.reviewDetail?[n.reviewDetail]:[]].find(Ye=>Number(Ye.id)===O);if(!Oe)return;n.editing=Oe,n.editingFrom=n.tab,v("create");return}if(Q==="review"){Te(O);return}if(Q==="review-ai-item"){let F=n.aiResult?.item;if(!F)return;n.reviewFilter="queue",n.reviewDetail=F,v("review");return}if(Q==="review-filter"){let F=String(C.dataset.filter||"queue");n.reviewFilter=["queue","accepted","rejected","draft"].includes(F)?F:"queue",n.reviewDetail=null,await H();return}if(Q==="select-review-item"){await me(O);return}if(Q==="go-manage"){v("manage");return}if(Q==="submit-review"){try{await U.submitQuestionBankItemForReview(O),P("\u5DF2\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok"),await u(),n.tab==="manage"?await A():n.tab==="review"&&await H()}catch(F){let we=F.detail||F.payload?.detail,Oe=we?.errors?.join(" \xB7 ")||we?.message||F.message||"\u9001\u5BE9\u5931\u6557\u3002";P(Oe,"danger",8e3)}return}if(Q==="restore"){if(!window.confirm(`\u78BA\u5B9A\u5FA9\u539F\u984C\u76EE #${O}\uFF1F\u5FA9\u539F\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\u72C0\u614B\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002`))return;try{await U.restoreQuestionBankItem(O),P("\u984C\u76EE\u5DF2\u5FA9\u539F\u4E26\u56DE\u5230\u5F85\u5BE9\u3002","ok"),await u(),await A()}catch(F){let we=F.detail||F.payload?.detail,Oe=we?.errors?.join(" \xB7 ")||we?.message||F.message||"\u5FA9\u539F\u5931\u6557\u3002";P(Oe,"danger",8e3)}return}if(Q==="delete"){if(n.tab==="suite"){let F=L();if(!F||!(F.items||[]).find(Oe=>Number(Oe.id)===O)||!window.confirm(`\u78BA\u5B9A\u5F9E\u300C${F.name}\u300D\u79FB\u9664\u984C\u76EE #${O}\uFF1F\u984C\u76EE\u4ECD\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u7BA1\u7406\u4E2D\u3002`))return;try{await U.removeBenchmarkSuiteItem(F.id,O),P("\u5DF2\u5F9E Benchmark \u984C\u5EAB\u79FB\u9664\u3002","info"),delete n.suiteAnswers[String(F.id)],Number(n.selectedBankItemId)===O&&(n.selectedBankItemId=null),await T()}catch(Oe){P(Oe.message||"\u79FB\u9664\u5931\u6557\u3002","danger")}return}if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${O}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await U.deleteQuestionBankItem(O),P("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await u(),n.tab==="review"?(n.reviewDetail=null,await H()):await A()}catch(F){P(F.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(Q==="revalidate"){try{let F=await U.revalidateQuestionBank();P(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${c(F.checked||0)} \u984C\uFF0C${c(F.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await u(),await A()}catch(F){P(F.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(Q==="export"){try{let F=await U.exportQuestionBank({status:""});Gt(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(F,null,2),"application/json;charset=utf-8")}catch(F){P(F.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(Q==="import-json"){let F=e.querySelector("#qb-import-json");try{let we=JSON.parse(String(F?.value||"").trim()),Oe=await U.importQuestionBank(we);P(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${Oe.created}\u3001\u66F4\u65B0 ${Oe.updated}\u3001\u932F\u8AA4 ${(Oe.errors||[]).length}\u3002`,(Oe.errors||[]).length?"warn":"ok",8e3),F&&(F.value=""),await u(),await A()}catch(we){P(we.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(Q==="prev"||Q==="next"){n.offset=Math.max(0,n.offset+(Q==="next"?n.limit:-n.limit)),await A();return}if(Q==="suite-edit"){let F=n.suites.find(we=>Number(we.id)===O);if(!F)return;n.editingSuite=F,n.suiteManageOpen=!0,T();return}if(Q==="suite-new"){n.editingSuite=null,n.suiteManageOpen=!0,T();return}if(Q==="suite-freeze"){try{await U.updateBenchmarkSuite(O,{freeze:!0}),P("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),n.editingSuite=null,n.suiteManageOpen=!0,await T()}catch(F){P(F.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(Q==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${O}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await U.deleteBenchmarkSuite(O),P("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),n.editingSuite=null,n.suiteAnswers={},n.suiteManageOpen=!0,await T()}catch(F){P(F.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(Q==="decide"){let F=C.closest("form[data-qb-form='review']");F&&await ae(F,String(C.dataset.decision||""))}},$e=async R=>{let D=R.target.closest("[data-qb-form]");if(!D)return;R.preventDefault();let Q=D.dataset.qbForm;if(Q==="create")await I(D);else if(Q==="ai-create")await ye(D);else if(Q==="filter"){let C=new FormData(D);n.filters={query:String(C.get("query")||"").trim(),status:String(C.get("status")||""),question_type:String(C.get("question_type")||""),difficulty:String(C.get("difficulty")||""),tags:C.getAll("tags").map(O=>String(O).trim()).filter(Boolean)},n.offset=0,await A()}else Q==="suite"&&await Se(D)},Ce=async R=>{let D=R.target.closest?.("form[data-qb-form='filter'] select");if(D){D.form.requestSubmit();return}let Q=R.target.closest?.("[data-qb-suite-select]");if(!Q)return;let C=Number(Q.value||0);!C||C===Number(n.selectedSuiteId)||await fe(C)},be=R=>{let D=R.target;D?.matches?.(".qb-suite-manage")&&(n.suiteManageOpen=!!D.open)},V=R=>{let D=R.target.closest?.("[data-qb-action='open-tag-search']");D&&M(D.closest("[data-qb-tag-filter]"))},he=R=>{let D=R.target.closest?.("[data-qb-tag-filter]");D&&(R.relatedTarget&&D.contains(R.relatedTarget)||S(D))},qe=R=>{let D=R.target.closest?.("[data-qb-tag-search]");if(!D)return;let Q=D.closest("[data-qb-tag-filter]");p&&window.clearTimeout(p),p=window.setTimeout(()=>{k(Q,D.value)},160)},Le=R=>{let D=R.target.closest?.("[data-qb-tag-search]");if(!D)return;let Q=D.closest("[data-qb-tag-filter]");R.key==="Escape"?(R.preventDefault(),S(Q),D.blur()):R.key==="Enter"?(R.preventDefault(),Q?.querySelector("[data-qb-action='select-tag']")?.click()):R.key==="ArrowDown"&&(R.preventDefault(),Q?.querySelector("[data-qb-action='select-tag']")?.focus())};e.addEventListener("click",Me),e.addEventListener("submit",$e),e.addEventListener("change",Ce),e.addEventListener("toggle",be,!0),e.addEventListener("mouseover",V),e.addEventListener("mouseout",he),e.addEventListener("input",qe),e.addEventListener("keydown",Le);let Re=async()=>{await u(),n.tab==="create"?b():n.tab==="manage"?await A():n.tab==="suite"?await T({refreshAnswers:!0}):n.tab==="review"&&await H()};return u(),{show:le,refresh:Re,destroy(){p&&window.clearTimeout(p),e.removeEventListener("click",Me),e.removeEventListener("submit",$e),e.removeEventListener("change",Ce),e.removeEventListener("toggle",be,!0),e.removeEventListener("mouseover",V),e.removeEventListener("mouseout",he),e.removeEventListener("input",qe),e.removeEventListener("keydown",Le)},getStats:()=>n.stats}}function Mn(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function Cl(e){return e==null?"\u2014":c(e)}function _m(e){return e.count?e.severity==="danger"?Ke("failed","\u9700\u8655\u7406"):e.severity==="warn"?Ke("warning","\u6CE8\u610F"):Ke("preview","\u63D0\u793A"):Ke("success","\u901A\u904E")}function km(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function Sm(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${km(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${r(e.label)}</span>
      ${_m(e)}
    </div>
    <div class="quality-check-value">
      <strong>${c(t)}</strong>
      <span>\u7B46</span>
      <em>${r(Mn(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${r(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function An(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
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
  </div>`}function xm(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},n=t.postgres_diff,i=n==null?"\u2014":n===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${c(Math.abs(n))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${c(t.vector_indexed)} / ${c(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${m("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${c(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${c(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${Cl(t.postgres_judgments)}</div>
      <div class="metric-foot">${r(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${r(Mn(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${r(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${Cl(a.candidate_total)}</div>
      <div class="metric-foot">${c(a.candidate_archive_count)} / ${c(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function Am(e){return e.length?`<div class="table-wrap">
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
              <td class="cell-number">${r(Mn(t.match_rate))}</td>
              <td class="cell-number">${c(t.short_text_rows)}</td>
              <td class="cell-number">${c(s)}</td>
              <td class="cell-number">${c(t.duplicate_content_rows)}</td>
              <td class="cell-date">${r(Ht(t.date_min))} \u2013 ${r(Ht(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:ht({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function Mm(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],n=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=Ee(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${Ke(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${c(t.rows)} \u7B46 \xB7 ${c(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${ge(e.scan_ms||0)} \xB7
          ${r(_e(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${m("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${Fe({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(d=>r(d)).join("<br>")})}</div>`:""}
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
        <div class="summary-value">${r(Mn(t.match_rate))}</div>
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
      <div class="quality-checks">${a.map(Sm).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${xm(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${c(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${Am(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${An("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${An("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${An("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${An("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function qm(e){let t=Ut(),s=`judgment.quality.snapshot.${t?"visitor":"admin"}`,a=()=>{try{let h=JSON.parse(window.localStorage.getItem(s)||"null");return!h?.snapshot||Date.now()-Number(h.saved_at||0)>600*1e3?null:h.snapshot}catch{return null}},n=h=>{if(h)try{window.localStorage.setItem(s,JSON.stringify({snapshot:h,saved_at:Date.now()}))}catch{}};e.innerHTML=`<section class="page data-page quality-page">
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
  </section>`;let i=e.querySelector("#quality-content"),o=e.querySelector("#quality-refresh"),l=e.querySelector("#quality-meta"),d=[...e.querySelectorAll("[data-quality-tab]")],p={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},g=null,$="overview",v=()=>{if(!g)return;i.innerHTML=Mm(g),l.textContent=`DUCKDB \xB7 ${c(g.totals?.rows)} \u7B46 \xB7 ${ge(g.scan_ms||0)}`;let h=e.querySelector("#quality-badge-overview");h&&(h.textContent=c(g.totals?.rows||0))},u=h=>{$=h==="overview"?"overview":h;for(let L of d){let X=L.dataset.qualityTab===$;L.classList.toggle("is-active",X),X?L.setAttribute("aria-current","page"):L.removeAttribute("aria-current")}for(let[L,X]of Object.entries(p))X&&(X.hidden=L!==$);$!=="overview"?l.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":g&&v()},b=Rl(e,{onNavigate:h=>u(h),onStats:h=>{let L=h||{},X=e.querySelector("#quality-badge-manage"),J=e.querySelector("#quality-badge-suite"),ve=e.querySelector("#quality-badge-review");X&&(X.textContent=c(L.total||0)),J&&(J.textContent=c(L.benchmark_ready||0)),ve&&(ve.textContent=c((L.pending_review||0)+(L.changes_requested||0)))}}),y=h=>{if(u(h),h!=="overview"){if(t){let L=p[h];L&&(L.innerHTML=Ts("\u984C\u5EAB\u7BA1\u7406\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u5B8C\u6574\u7684\u8CC7\u6599\u54C1\u8CEA\u7E3D\u89BD\uFF1B\u984C\u5EAB\u65B0\u589E\u3001\u7BA1\u7406\u3001Benchmark \u8207\u4EBA\u5DE5\u9A57\u6536\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002"));return}b.show(h)}},k=async({cached:h=!1}={})=>{Ne(o,!0,h?"\u6574\u7406\u4E2D\u2026":"\u6383\u63CF\u4E2D\u2026");try{g=await U.quality({cached:h}),n(g),v()}catch(L){i.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${Fe({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:r(L.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,l.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",P("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{Ne(o,!1)}},M=async()=>{$==="overview"?await k():await b.refresh()};o.addEventListener("click",M),e.addEventListener("click",h=>{let L=h.target.closest("[data-quality-tab]");L&&y(L.dataset.qualityTab||"overview")}),i.addEventListener("click",h=>{!h.target.closest("[data-action='export-quality']")||!g||Gt(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(g,null,2),"application/json;charset=utf-8")}),u("overview");let S=a();if(S&&(g=S,v()),t)for(let h of d){if(h.dataset.qualityTab==="overview")continue;h.classList.add("is-demo-locked"),h.removeAttribute("title"),h.dataset.demoLockTooltip="\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B\u984C\u5EAB\u7BA1\u7406";let L=h.querySelector(".badge");L&&(L.textContent="LOCK")}await k({cached:!0})}var ri={};ls(ri,{render:()=>cg});var qn={};ls(qn,{render:()=>ai});var Pl={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function Il(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${r(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${r(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function Lm(e){let t=e?.supports_chat,s=t===!0?"badge-ok":t===!1?"badge-danger":"badge-neutral",a=t===!0?"\u652F\u63F4 chat":t===!1?"\u4E0D\u652F\u63F4 chat":"\u672A\u6E2C\u8A66",n=(Array.isArray(e?.capabilities)?e.capabilities:[]).map(i=>`<span class="chip chip-mono">${r(i)}</span>`).join("");return`<div class="tests-llm-row">
    <div class="tests-llm-model">
      <strong class="mono">${r(e?.model||"\u2014")}</strong>
      <small>${r(e?.detail||"")}</small>
    </div>
    <div class="tests-llm-meta">
      <span class="badge ${s}">${a}</span>
      ${e?.tested_now?'<span class="badge badge-info">\u672C\u6B21\u65B0\u6E2C</span>':""}
      ${n}
      <span class="tests-llm-time">${e?.tested_at?`\u6E2C\u8A66\u65BC ${r(_e(e.tested_at))}`:"\u5C1A\u7121\u6E2C\u8A66\u7D00\u9304"}</span>
    </div>
  </div>`}function jm(e){let t=Array.isArray(e?.models)?e.models:[],s=e?.counts||{},a=Array.isArray(e?.failures)?e.failures:[];return{summary:e?`<span>llama-server <strong>${s.available??t.length}</strong> \u500B\u6A21\u578B</span>
      <span>\u652F\u63F4 chat <strong>${s.chat??0}</strong></span>
      <span>\u4E0D\u652F\u63F4 <strong>${s.unsupported??0}</strong></span>
      <span>\u672A\u6E2C\u8A66 <strong>${s.untested??0}</strong></span>
      <span>\u672C\u6B21\u65B0\u6E2C <strong>${(e.tested_now||[]).length}</strong></span>
      <span class="muted">${r(e.detail||"")}</span>`:"<span>\u6B63\u5728\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u2026</span>",list:t.length?t.map(Lm).join(""):'<div class="tests-llm-empty">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u8ACB\u78BA\u8A8D llama-server \u5DF2\u555F\u52D5\u4E26\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66\u3002</div>',failures:a.length?`<div class="tests-llm-failures">${a.map(i=>`<span><strong class="mono">${r(i.model||"\u2014")}</strong> ${r(i.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function Tm(e){let t=String(e?.status||"degraded"),s=t==="operational"?"badge-ok":t==="disabled"?"badge-neutral":"badge-danger",a=Array.isArray(e?.scores)?e.scores.slice(0,4):[],n=Array.isArray(e?.results)?e.results[0]:null;return`<div class="tests-llm-row">
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
  </div>`}function Em(e){if(!e)return{summary:"<span>\u6B63\u5728\u8B80\u53D6 reranker \u72C0\u614B\u2026</span>",list:"",failures:""};let t=Array.isArray(e.providers)?e.providers:[],s=e.active||{},a=String(e.status||"degraded"),n=a==="operational"?"badge-ok":a==="not_configured"?"badge-neutral":"badge-danger",i=t.flatMap(o=>(o.errors||[]).map(l=>({model:o.url,detail:l})));return{summary:`<span>\u72C0\u614B <span class="badge ${n}">${r(a)}</span></span>
      <span>\u6A21\u578B <strong>${r(e.model||"\u2014")}</strong></span>
      <span>\u555F\u7528 <strong>${e.enabled?"true":"false"}</strong></span>
      ${s.url?`<span>\u4F5C\u7528\u4E2D <strong class="mono">${r(s.url)}</strong></span>`:""}
      <span class="muted">${r(e.detail||"")}</span>`,list:t.length?t.map(Tm).join(""):'<div class="tests-llm-empty">\u6C92\u6709\u8A2D\u5B9A RERANK_URL\uFF1B\u8ACB\u8A2D\u5B9A primary \u6216 fallback reranker\u3002</div>',failures:i.length?`<div class="tests-llm-failures">${i.map(o=>`<span><strong class="mono">${r(o.model||"\u2014")}</strong> ${r(o.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function Nm(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,total_ms:e.total_ms,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}:${a.duration_ms}`)}:null})}async function ai(e,t,{embedded:s=!1}={}){let a=!1,n=!1,i={embedding:[],llm:[]},o=!1,l=null,d=!1,p=null,g=!1,$=null,v=[],u="",b=null,y="",k=`<div class="page-actions">
      <span class="badge badge-neutral badge-mono" id="tests-mode-badge">\u8B80\u53D6\u4E2D</span>
      <button class="btn btn-secondary" type="button" id="tests-refresh">
        ${m("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
      </button>
    </div>`,M=s?`<div class="tests-embed-head">
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
    ${M}

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
  </section>`;let S=e.querySelector("#tests-mode-badge"),h=e.querySelector("#tests-mode-toggle"),L=e.querySelector("#tests-mode-summary"),X=e.querySelector("#tests-mode-models"),J=e.querySelector("#tests-mode-status"),ve=e.querySelector("#tests-api-form"),fe=e.querySelector("#tests-api-input"),se=e.querySelector("#tests-admin-token-input"),q=e.querySelector("#tests-api-preview"),A=e.querySelector("#tests-api-status"),T=e.querySelector("#tests-api-note"),K=e.querySelector("#tests-api-test"),me=e.querySelector("#tests-api-reset"),H=e.querySelector("#tests-api-save"),le=e.querySelector("#tests-refresh"),Te=e.querySelector("#tests-flow"),I=e.querySelector("#tests-llm-summary"),ye=e.querySelector("#tests-llm-list"),ae=e.querySelector("#tests-llm-failures"),Se=e.querySelector("#tests-llm-status"),Me=e.querySelector("#tests-llm-test"),$e=e.querySelector("#tests-rerank-summary"),Ce=e.querySelector("#tests-rerank-list"),be=e.querySelector("#tests-rerank-failures"),V=e.querySelector("#tests-rerank-status"),he=e.querySelector("#tests-rerank-test");se&&(se.value=Ba());let qe=(ne,xe,We="")=>{ne&&(ne.textContent=xe,ne.className=`tests-status${We?` is-${We}`:""}`)},Le=(ne,xe="")=>{A&&(A.textContent=ne,A.className=`api-dialog-status${xe?` is-${xe}`:""}`)},Re=()=>Ot()==="query",R=()=>{let ne=cs(fe.value);return ne||(window.location.protocol==="file:"?On:"")},D=()=>{let ne=R(),xe=Yt(),We=Pl[Ot()]||Ot()||"\u540C\u6E90";q.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${r(ys(xe))}</strong>${xe?`\uFF08${r(We)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${r(bt("/api/health",ne))}`},Q=()=>{let ne=Ot(),xe=`\u76EE\u524D\u4F86\u6E90\uFF1A${Pl[ne]||ne||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,We="";ne==="query"?(We="is-warn",xe="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):Da()?(We="is-warn",xe="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(ne==="file-default"||window.location.protocol==="file:")&&(xe="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),xe+=(se?.value||Ba()).trim()?" \u7BA1\u7406\u6B0A\u6756\uFF1A\u5DF2\u8A2D\u5B9A\uFF0C\u6703\u9001\u5F80\u76EE\u524D\u8A2D\u5B9A\u7684 API Base\u3002":" \u7BA1\u7406\u6B0A\u6756\uFF1A\u672A\u8A2D\u5B9A\uFF1B\u672C\u6A5F loopback \u53EF\u76F4\u63A5\u4F7F\u7528\uFF0C\u9060\u7AEF\u7BA1\u7406 API \u6703\u88AB\u62D2\u7D55\u3002",T.textContent=xe,T.className=`api-dialog-note${We?` ${We}`:""}`;let ze=ne==="query";H.disabled=ze,me.disabled=ze,fe.readOnly=ze},C=()=>{if(!Hn(fe.value))return Le("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),fe.focus(),null;let ne=R();return window.location.protocol==="https:"&&/^http:\/\//i.test(ne)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(ne)?(Le("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),fe.focus(),null):ne},O=()=>{fe.value=Yt(),D(),Q(),Le("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},F=()=>{let ne=Array.isArray(i.embedding)?i.embedding.length:0,xe=Array.isArray(i.llm)?i.llm.length:0;if(S&&(S.textContent=o?"\u5207\u63DB\u4E2D\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",S.className=`badge badge-mono ${o?"badge-info":n?"badge-warn":"badge-neutral"}`),h){h.disabled=o,h.classList.toggle("is-on",n),h.classList.toggle("is-off",!n&&!o),h.classList.toggle("is-busy",o),h.setAttribute("aria-checked",n?"true":"false"),h.setAttribute("aria-busy",o?"true":"false"),h.setAttribute("aria-label",o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":n?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),h.title=o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let We=h.querySelector(".header-power-label");We&&(We.textContent=o?"\u2026":n?"ON":"OFF")}L&&(L.textContent=n?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${ne} \u500B embedding \u8207 ${xe} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),X&&(X.innerHTML=Il("Embedding",i.embedding)+Il("LLM",i.llm))},we=async()=>{try{let ne=await U.testMode();if(a)return;n=!!ne.enabled,i=ne.models||{embedding:[],llm:[]},qe(J,"")}catch(ne){if(a)return;n=!1,i={embedding:[],llm:[]},qe(J,ne.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}a||F()},Oe=async()=>{if(o)return;let ne=!n;o=!0,F(),qe(J,ne?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let xe=await U.setTestMode(ne);if(a)return;n=!!xe.enabled,i=xe.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:n,models:i}}));let We=i.embedding?.length||0,ze=i.llm?.length||0;qe(J,n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${We} \u500B embedding \u8207 ${ze} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),P(n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${We} \u500B embedding\u3001${ze} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",n?"ok":"info",6e3),await ct()}catch(xe){a||(qe(J,xe.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),P(xe.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{o=!1,a||F()}},Ye=()=>{let ne=jm(l);if(I&&(I.innerHTML=ne.summary),ye&&(ye.innerHTML=ne.list),ae&&(ae.innerHTML=ne.failures),Me){Me.disabled=d,Me.setAttribute("aria-busy",d?"true":"false");let xe=Me.querySelector("span");xe&&(xe.textContent=d?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66")}},st=async()=>{try{let ne=await U.llmModels();if(a)return;l=ne,qe(Se,"")}catch(ne){if(a)return;l=null,qe(Se,ne.message||"\u7121\u6CD5\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u3002","error")}a||Ye()},rt=async()=>{if(!d){d=!0,Ye(),qe(Se,"\u6B63\u5728\u6AA2\u67E5 llama-server \u6A21\u578B\u8207 chat \u80FD\u529B\u2026");try{let ne=await U.testLlmModels();if(a)return;l=ne;let xe=ne.tested_now?.length||0,We=ne.chat_models?.length||0,ze=ne.failures?.length||0;qe(Se,`${xe?`\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u672C\u6B21\u65B0\u6E2C ${xe} \u500B\u6A21\u578B`:"\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u6C92\u6709\u65B0\u6A21\u578B"}\uFF0C\u76EE\u524D ${We} \u500B\u6A21\u578B\u652F\u63F4 chat${ze?`\uFF1B${ze} \u500B\u6A21\u578B\u66AB\u6642\u7121\u6CD5\u5224\u5B9A\uFF0C\u4E0B\u6B21\u6703\u91CD\u8A66`:""}\u3002`,ze?"warn":"ok"),P(xe?`LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u65B0\u589E ${xe} \u7B46\u80FD\u529B\u7D00\u9304\u3002`:"LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u6C92\u6709\u65B0\u6A21\u578B\u9700\u8981\u6E2C\u8A66\u3002",ze?"warn":"ok",5e3),await we()}catch(ne){a||(qe(Se,ne.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),P(ne.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{d=!1,a||Ye()}}},Xe=()=>{let ne=Em(p);if($e&&($e.innerHTML=ne.summary),Ce&&(Ce.innerHTML=ne.list),be&&(be.innerHTML=ne.failures),he){he.disabled=g,he.setAttribute("aria-busy",g?"true":"false");let xe=he.querySelector("span");xe&&(xe.textContent=g?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C Reranker \u670D\u52D9\u6E2C\u8A66")}},et=async()=>{try{let ne=await U.rerankStatus();if(a)return;p=ne,qe(V,"")}catch(ne){if(a)return;p=null,qe(V,ne.message||"\u7121\u6CD5\u8B80\u53D6 reranker \u72C0\u614B\u3002","error")}a||Xe()},de=async()=>{if(!g){g=!0,Xe(),qe(V,"\u6B63\u5728\u5C0D primary\uFF0Ffallback reranker \u57F7\u884C\u5BE6\u969B rerank \u6E2C\u8A66\u2026");try{let ne=await U.testReranker();if(a)return;p=ne;let xe=Array.isArray(ne.providers)?ne.providers:[],We=xe.filter(Tt=>Tt.status==="operational").length,ze=xe.reduce((Tt,ft)=>Tt+(Array.isArray(ft.errors)?ft.errors.length:0),0);qe(V,ze?`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${We} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C${ze} \u500B\u932F\u8AA4\uFF1B\u8A73\u7D30\u5206\u6578\u5DF2\u5217\u5728\u4E0A\u65B9\u3002`:`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${We} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C\u6A21\u578B ${ne.model||"\u2014"}\u3002`,ze?"warn":"ok"),P(ze?"Reranker \u90E8\u5206\u7AEF\u9EDE\u5931\u6557\uFF0C\u8ACB\u67E5\u770B\u6E2C\u8A66\u7D50\u679C\u3002":"Reranker \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\u3002",ze?"warn":"ok",5e3)}catch(ne){a||(qe(V,ne.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),P(ne.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{g=!1,a||Xe()}}},tt=()=>{if(!Te)return;let ne=Nm($,v,u);ne!==y&&(y=ne,Te.innerHTML=ta($,v,u))},Ue=async()=>{try{let ne=await U.testRuns(30);if(a)return;v=Array.isArray(ne.runs)?ne.runs:[]}catch{if(a)return;v=[]}},ct=async(ne=null)=>{try{let xe=ne||(u?await U.testRun(u):await U.testRunCurrent());if(a)return;$=xe.run||null,!u&&$&&$.status!=="running"&&!v.some(We=>We.run_id===$.run_id)&&await Ue()}catch{if(a)return;$=null}a||tt()};fe?.addEventListener("input",()=>{D(),Le("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),se?.addEventListener("input",()=>{Q()}),K?.addEventListener("click",async()=>{let ne=C();if(ne!==null){Ne(K,!0,"\u6E2C\u8A66\u4E2D\u2026"),Le(`\u6B63\u5728\u9023\u7DDA\u5230 ${ys(ne)||"\u540C\u6E90"}\u2026`);try{let xe=await hi(ne);if(a)return;Le(`\u9023\u7DDA\u6210\u529F \xB7 v${xe.version} \xB7 ${xe.duration_ms} ms \xB7 GET ${bt("/api/health",ne)}`,"ok")}catch(xe){a||Le(xe.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{a||Ne(K,!1)}}}),ve?.addEventListener("submit",ne=>{if(ne.preventDefault(),Re())return;let xe=C();xe!==null&&(Qn(xe),gi(se?.value||""),P(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${ys(xe)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),me?.addEventListener("click",()=>{Re()||(Qn(""),P("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),h?.addEventListener("click",Oe),Me?.addEventListener("click",rt),he?.addEventListener("click",de),Te?.addEventListener("change",async ne=>{ne.target.id==="test-run-select"&&(u=String(ne.target.value||""),await ct())}),Te?.addEventListener("click",async ne=>{ne.target.closest("#test-flow-refresh")&&(u="",await Ue(),await ct())}),le?.addEventListener("click",async()=>{Ne(le,!0,"\u66F4\u65B0\u4E2D\u2026"),O(),await Promise.allSettled([we(),Ue(),st(),et()]),a||await ct(),a||(Ne(le,!1),P("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let gt=ne=>{n=!!ne.detail?.enabled,i=ne.detail?.models||{embedding:[],llm:[]},F()};return window.addEventListener("judgment:test-mode",gt),O(),F(),Ye(),Xe(),await Promise.allSettled([we(),Ue(),st(),et()]),await ct(),b=_t("test-runs",async(ne,xe)=>{a||document.hidden||u||await ct(xe?.snapshot||null)}),!s&&typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{a=!0,b&&b(),window.removeEventListener("judgment:test-mode",gt)}}var Dl={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var zl={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},ni=new Set,Bl="judgment.status.payload.v1",Gl=new Set(["tests","resources","local-model","api"]),Ul=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"tests",label:"\u7CFB\u7D71\u6E2C\u8A66",hint:"API\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u6A21\u578B Flow",icon:"terminal"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"local-model",label:"Model Provider",hint:"llama-server \u4E3B\u6A5F\u8207\u6A21\u578B",icon:"server"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 API \u2192 Pipeline \u2192 Data",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}],ja=[{id:"system",label:"\u7CFB\u7D71\u8207\u5373\u6642\u72C0\u614B",icon:"activity",prefixes:["/api/health","/api/status","/api/system-usage","/api/events/stream","/api/processing/events/status","/api/docs","/api/openapi.json"]},{id:"processing",label:"\u8CC7\u6599\u8655\u7406\u8207\u66F4\u65B0",icon:"database",prefixes:["/api/processing","/api/judgment-download","/api/updates","/api/courts","/api/law-versions"]},{id:"data",label:"\u67E5\u8A62\u8207\u8CC7\u6599",icon:"search",prefixes:["/api/query","/api/data","/api/judgment","/api/law","/api/schema","/api/catalog","/api/judgment-stats","/api/quality"]},{id:"rag",label:"RAG \u554F\u7B54",icon:"message",prefixes:["/api/rag"]},{id:"index",label:"\u7248\u672C\u8207\u7D22\u5F15",icon:"layers",prefixes:["/api/index-versions","/api/index-alias","/api/versioning"]},{id:"models",label:"\u6A21\u578B\u8207\u670D\u52D9",icon:"brain",prefixes:["/api/ollama","/api/llm","/api/rerank","/api/test-mode"]},{id:"tests",label:"\u6E2C\u8A66\u8207\u6548\u80FD",icon:"activity",prefixes:["/api/test-runs","/api/performance"]},{id:"question-bank",label:"\u984C\u5EAB",icon:"file",prefixes:["/api/question-bank"]},{id:"benchmark",label:"Benchmark",icon:"grid",prefixes:["/api/benchmark"]},{id:"other",label:"\u5176\u4ED6",icon:"terminal",prefixes:[]}];function Rm(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:zt(e).label,tone:zt(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function Cm(e){let t=zt(e.status),s=Dl[e.kind]||Dl.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${c(e.latency_ms)} ms</span>`;return`<article class="service-card">
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
  </article>`}function Pm(e,t){let s=typeof e=="string"?{label:e}:e||{},a=String(s.label||"\u2014"),n=s.service?t.find(l=>l.id===s.service):null,i=n?n.status==="operational":a==="IndexedDB"?Ki():!0,o=[s.detail||"",n?`\u72C0\u614B\uFF1A${zt(n.status).label}`:""].filter(Boolean).join(" \xB7 ");return`<div class="arch-node ${i?"":"is-muted"}" title="${r(o||(i?a:"\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"))}">
    <strong>${r(a)}</strong>
    ${s.detail?`<span class="arch-node-detail">${r(s.detail)}</span>`:""}
  </div>`}function Im(e,t,s=!1){let a=e?.layers||[];if(!a.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let n=a.map(o=>{let l=(o.nodes||[]).map(d=>Pm(d,t)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${r(o.label||o.id)}</div>
      <div class="arch-nodes">${l}</div>
    </div>`}),i=[];return n.forEach((o,l)=>{l&&i.push(`<div class="arch-arrow" aria-hidden="true">${m("arrowRight",15)}</div>`),i.push(o)}),`<div class="arch-flow">${i.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${m("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>
    ${Dm(s)}`}function Dm(e=!1){return`<figure class="arch-diagram">
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
  </figure>`}function Ql(e){let t=String(e||""),s=a=>t===a||t.startsWith(`${a}/`);for(let a of ja)if(a.prefixes.some(s))return a;return ja[ja.length-1]}function Bm(e){return`is-${String(e||"get").toLowerCase()}`}function Fm(e){return`<div class="endpoint-row${e.deprecated?" is-deprecated":""}">
    <span class="endpoint-method ${Bm(e.method)}">${r(e.method||"GET")}</span>
    <span class="endpoint-path" title="${r(e.path||"")}">${r(e.path||"")}</span>
    <span class="endpoint-label">${r(e.label||"")}</span>
  </div>`}function Om(e){if(!Array.isArray(e)||!e.length)return'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>';let t=new Map(ja.map(s=>[s.id,{group:s,endpoints:[]}]));for(let s of e){let a=Ql(s.path),n=t.get(a.id);n&&n.endpoints.push(s)}return`<div class="api-endpoint-groups">${ja.map(s=>{let n=t.get(s.id)?.endpoints||[];return n.length?(n.sort((i,o)=>String(i.path).localeCompare(String(o.path))||String(i.method).localeCompare(String(o.method))),`<section class="card api-endpoint-group">
        <div class="side-card-head">
          <span class="side-card-title">${m(s.icon,14)}${r(s.label)}</span>
          <span class="badge badge-neutral badge-mono">${c(n.length)}</span>
        </div>
        <div class="endpoint-list">${n.map(Fm).join("")}</div>
      </section>`):""}).join("")}</div>`}function fs(e,t){return`<div class="detail-row">
    <span class="detail-label">${r(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function Ve(e,t,{mono:s=!1,wide:a=!1}={}){return`<div class="data-version-fact${a?" is-wide":""}">
    <span>${r(e)}</span>
    <strong class="${s?"mono":""}">${r(String(t??"\u2014"))}</strong>
  </div>`}function Fl(e,t,s,a=""){let n=t==null?null:Math.max(0,Math.min(100,Number(t)||0));return`<div class="data-version-coverage ${a}">
    <div class="data-version-coverage-head">
      <span>${r(e)}</span>
      <strong>${Ln(n)}</strong>
    </div>
    <div class="data-version-coverage-track"><span style="width:${n===null?0:n.toFixed(1)}%"></span></div>
    <div class="data-version-coverage-foot">${r(s)}</div>
  </div>`}function Hm(e){if(!Array.isArray(e)||!e.length)return ht({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${r(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${Oa(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function zm(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=new Map(s.map(y=>[y.id,y])),n=a.get("qdrant"),i=a.get("embedding"),o=a.get("rag"),l=a.get("llm"),d=Number(t.judgment_indexed_count||0),p=Number(t.judgment_count||0),g=p?(d/p*100).toFixed(1):"0.0",$=t.judgment_vector_points===null||t.judgment_vector_points===void 0?"\u2014":c(t.judgment_vector_points),v=Number(t.judgment_index_remaining||0),u=o?.status==="operational"?"RAG \u5C31\u7DD2":o?.status==="not_configured"?"\u672A\u8A2D\u5B9A":o?.status==="degraded"?"\u964D\u7D1A":"\u672A\u77E5",b=[["cube","Qdrant \u5411\u91CF\u7D22\u5F15",n],["layers",`Embedding\uFF08${t.judgment_vector_model||"\u2014"}\uFF09`,i],["brain","RAG \u56DE\u7B54\u7BA1\u7DDA",o],["sparkles","LLM \u6A21\u578B",l]];return`<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}RAG \u8CC7\u6599\u73FE\u6CC1</span>
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
          <div class="mini-stat-value">${g}%</div>
          <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
        </div>
      </div>
      <div class="side-status-list">
        ${b.map(([y,k,M])=>`<div class="side-status-row">
              <span>${m(y,13)}${r(k)}</span>
              ${Ke(M?.status,M?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
            </div>`).join("")}
      </div>
      <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
        Collection\uFF1A${r(t.judgment_vector_collection||"\u2014")} \xB7
        ${$} points \xB7 \u5269\u9918 ${c(v)} \u7B46\u5F85\u7D22\u5F15
      </div>
    </div>
    <div class="side-card-foot">
      PostgreSQL \u5224\u6C7A\u6587\u4EF6\u3001Qdrant \u5411\u91CF\u7D22\u5F15\u8207 llama-server \u6A21\u578B\u72C0\u614B\u7686\u70BA\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u5C31\u7DD2\u6642\u6703\u660E\u78BA\u964D\u7D1A\u3002
    </div>
  </section>`}function Ln(e){let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function bs(e){return Math.max(0,Number(e?.duration_ms)||0)}function Gm(e,t){let s=e?.pipeline&&typeof e.pipeline=="object"?e.pipeline:null,a=Array.isArray(s?.stages)?s.stages:[],n=Number(s?.total_ms)||a.reduce((v,u)=>v+bs(u),0),i=Math.max(0,Number(t?.initMs)||0),o=Math.max(0,Number(t?.requestMs)||0),l=Math.max(o,n),d=Math.max(0,l-n),p=[],g=t?.requestStartedAt||e?.checked_at||null,$=t?.requestFinishedAt||e?.checked_at||null;if(i>.5&&p.push({key:"page-init",label:"\u9801\u9762\u521D\u59CB\u5316",caption:"\u5EFA\u7ACB\u670D\u52D9\u7E3D\u89BD\u9AA8\u67B6\u8207\u5C0E\u89BD",color:"#64748b",status:"success",duration_ms:i,started_at:t?.initStartedAt||g,finished_at:g,message:"\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u3001\u8F09\u5165\u6A21\u7D44\u4E26\u6E96\u5099\u8ACB\u6C42\u3002"}),a.length){d>.5&&p.push({key:"http",label:"HTTP \u50B3\u8F38\uFF0F\u6392\u968A",caption:"\u700F\u89BD\u5668 \u2192 FastAPI",color:"#94a3b8",status:"success",duration_ms:d,started_at:g,finished_at:$,message:"\u5305\u542B\u9023\u7DDA\u3001\u8ACB\u6C42\u6392\u968A\u8207\u56DE\u61C9\u50B3\u8F38\u3002"}),p.push(...a);let v=a.reduce((b,y)=>b+bs(y),0),u=Math.max(0,n-v);u>.5&&p.push({key:"server-assemble",label:"\u4F3A\u670D\u5668\u5F59\u6574",caption:"\u72C0\u614B\u56DE\u61C9\u7D44\u88DD",color:"#cbd5e1",status:"success",duration_ms:u,started_at:a[a.length-1]?.finished_at||g,finished_at:$,message:"\u7D44\u88DD\u670D\u52D9\u3001\u8CC7\u6599\u91CF\u8207\u67B6\u69CB payload\u3002"})}else p.push({key:"status-request",label:"GET /api/status",caption:"\u670D\u52D9\u72C0\u614B\u8207\u8CC7\u6599\u91CF",color:"#64748b",status:"success",duration_ms:l,started_at:g,finished_at:$,message:"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF1B\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593\u3002"});return{total_ms:i+l,started_at:t?.initStartedAt||g,finished_at:$,stages:p,server_ms:n,request_ms:l,transport_ms:d,init_ms:i,detailed:!!s}}function Um(e){let t=e?.page_pipeline,s=Array.isArray(t?.stages)?t.stages:[];if(!t||!s.length)return"";let a=Math.max(0,Number(t.total_ms)||s.reduce((h,L)=>h+bs(L),0)),n=Math.max(a,s.reduce((h,L)=>h+bs(L),0),1),i=1.25,o=s.filter(h=>String(h.status||"success")!=="skipped"),l=s.filter(h=>["success","no_change"].includes(String(h.status||"success"))).length,d=s.filter(h=>h.status==="failed").length,p=s.reduce((h,L)=>bs(L)>bs(h)?L:h,s[0]),g=Math.max(0,Number(t.server_ms)||Number(e?.pipeline?.total_ms)||0),$=Math.max(0,Number(t.transport_ms)||0),v=Math.max(0,Number(t.init_ms)||0),u=s.map(h=>String(h.status||"success")==="skipped"?0:Math.max(bs(h)/n*100,i)),b=u.reduce((h,L)=>h+L,0),y=b>100?100/b:1,k=0,M=s.map((h,L)=>{let X=String(h.status||"success"),J=X==="skipped",ve=h.label||h.key||`\u968E\u6BB5 ${L+1}`,fe=h.caption||"",se=bs(h),q=J?"\u2014":ge(se),A=n>0?se/n*100:0,T=J?0:u[L]*y,K=k;J||(k+=T);let me=h.color||"#64748b",H=X==="failed"?"var(--danger)":me,le=[`is-${X}`,X==="failed"?"is-error":"",J?"is-missing":""].filter(Boolean).join(" "),Te=T>0?`<span class="rag-wf-bar status-wf-bar is-sequential" style="left:${K.toFixed(3)}%;width:${T.toFixed(4)}%;top:0;height:12px;--bar-color:${r(H)}" aria-hidden="true"></span>`:"",I=J?"\u7565\u904E":X==="failed"?"\u5931\u6557":"\u5B8C\u6210",ye=`${t.label||"status"}:${h.key||L}`,ae=[["\u72C0\u614B",I,!0],["\u958B\u59CB",h.started_at?_e(h.started_at):"\u2014",!0],["\u7D50\u675F",h.finished_at?_e(h.finished_at):"\u2014",!0],["\u8017\u6642",q,!0],["\u5360\u6574\u9AD4",Ln(A),!0],["\u8AAA\u660E",h.message||"",!1]].map(([Se,Me,$e])=>$e||Me?`<span class="rag-wf-detail"><span>${r(Se)}</span><strong>${r(String(Me||"\u2014"))}</strong></span>`:"").join("");return`<details class="rag-wf-stage status-wf-stage ${le}" data-status-wf-stage="${r(ye)}"${ni.has(ye)?" open":""} style="--stage-color:${r(me)}">
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="status-wf-step">${String(L+1).padStart(2,"0")}</span> ${r(ve)}</strong>${fe?`<small>${r(fe)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(q)} \xB7 ${r(I)} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${ve}\uFF1A${I}\uFF0C\u8017\u6642 ${q}\uFF0C\u5360\u6574\u9AD4 ${Ln(A)}`)}">${Te}</span>
        </summary>
        <div class="rag-wf-details">${ae}</div>
      </details>`}).join(""),S=t.detailed?"\u5F8C\u7AEF /api/status \u968E\u6BB5\u660E\u7D30":"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF0C\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593";return`<section class="report-card status-wf-card" data-status-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m("activity",14)}\u670D\u52D9\u7E3D\u89BD\u8F09\u5165 Pipeline</span>
      <div class="index-runtime-metrics">
        <span class="index-runtime-metric" title="\u672C\u6B21\u9801\u9762\u521D\u59CB\u5316\u5230\u72C0\u614B\u56DE\u61C9\u5B8C\u6210\u7684\u7E3D\u6642\u9593\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(ge(a))}</strong></span>
        <span class="index-runtime-metric" title="\u5F8C\u7AEF /api/status \u6AA2\u67E5\u968E\u6BB5\u7684\u5408\u8A08\u6642\u9593\u3002"><span>Server</span><strong>${r(ge(g))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u8ACB\u6C42\u6642\u9593\u6263\u6389\u5F8C\u7AEF\u6AA2\u67E5\u5F8C\u7684\u50B3\u8F38\u8207\u6392\u968A\u6642\u9593\u3002"><span>HTTP \u50B3\u8F38</span><strong>${r(ge($))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u9AA8\u67B6\u8207\u8F09\u5165\u6A21\u7D44\u7684\u6642\u9593\u3002"><span>\u9801\u9762\u521D\u59CB\u5316</span><strong>${r(ge(v))}</strong></span>
        <span class="index-runtime-metric" title="\u8017\u6642\u6700\u9577\u7684\u6AA2\u67E5\u968E\u6BB5\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${p?.label||"\u2014"} \xB7 ${ge(bs(p))}`)}</strong></span>
        <span class="index-runtime-metric" title="\u5B8C\u6210\u7684\u6AA2\u67E5\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\uFF1B\u5931\u6557\u968E\u6BB5\u6703\u4EE5\u7D05\u8272\u6A19\u793A\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${c(l)} / ${c(s.length)}${d?` \xB7 \u5931\u6557 ${c(d)}`:""}</strong></span>
      </div>
    </div>
    <div class="status-wf-summary">
      <span>\u6AA2\u67E5 <strong>${r(_e(e.checked_at))}</strong></span>
      <span>API <strong class="mono">${r(ys())}</strong></span>
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
      <div class="rag-wf-stages">${M}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u986F\u793A\u672C\u6B21\u958B\u555F\u670D\u52D9\u7E3D\u89BD\u7684\u9801\u9762\u521D\u59CB\u5316\u3001HTTP \u5F80\u8FD4\u3001\u5F8C\u7AEF\u6AA2\u67E5\u8207\u56DE\u61C9\u5F59\u6574\u3002\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u5931\u6557\u968E\u6BB5\u4EE5\u7D05\u8272\u6A19\u793A\uFF0C\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\uFF1B\u6975\u77ED\u968E\u6BB5\u4FDD\u7559\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function Qm(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=Rm(e.status),n=s.find(p=>p.id==="qdrant"),i=s.find(p=>p.id==="rag"),o=s.find(p=>p.id==="llm"),l=Ot(),d=zl[l]||l;return`<section class="status-hero">
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
          <span>${m("clock",11)} \u6AA2\u67E5\u6642\u9593 ${_e(e.checked_at)} \xB7 ${r(ua(e.checked_at))}</span>
          <span>${m("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${m("database",11)} ${c(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${m("layers",11)} ${c(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${r(d)}">${m("link",11)} ${r(ys())}</span>
        </div>
      </div>
    </section>

    ${Um(e)}

    <div class="service-grid">${s.map(Cm).join("")}</div>

    ${zm(e)}

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

    ${n?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${Fe({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${r(n?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${r(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${r(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}`}function Jm(e,t=!1){let s=Array.isArray(e.services)?e.services:[],a=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Pipelines \u2192 Data \xB7 \u6700\u65B0\u5C08\u6848\u5143\u4EF6\u8207\u5373\u6642\u5065\u5EB7\u72C0\u614B</div>
      </div>
      <span class="badge badge-neutral badge-mono">${c((a.flow||[]).length)} layers</span>
    </div>
    ${Im(a,s,t)}
  </div>`}function Vm(e){let t=Array.isArray(e.endpoints)?e.endpoints:[],s=Ot(),a=zl[s]||s,n=bt("/api/docs"),i=bt("/api/openapi.json"),o=new Set(t.map(p=>Ql(p.path).id)),l=t.reduce((p,g)=>{let $=String(g.method||"GET").toUpperCase();return p[$]=(p[$]||0)+1,p},{}),d=["GET","POST","PATCH","PUT","DELETE"].filter(p=>l[p]).map(p=>`${p} ${c(l[p])}`).join(" \xB7 ");return`<section class="status-hero api-endpoint-hero">
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
          <span>${m("server",11)} API Base <span class="mono">${r(ys())}</span>\uFF08${r(a)}\uFF09</span>
          <span>${m("terminal",11)} ${r(d||"\u2014")}</span>
          <span>${m("clock",11)} \u66F4\u65B0\u6642\u9593 ${_e(e.checked_at)}</span>
        </div>
      </div>
      <div class="api-endpoint-actions">
        <a class="btn btn-secondary btn-sm" href="${r(n)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>Swagger UI</span></a>
        <a class="btn btn-ghost btn-sm" href="${r(i)}" target="_blank" rel="noopener noreferrer">OpenAPI JSON ${m("external",11)}</a>
      </div>
    </section>
    ${Om(t)}
    <p class="status-footnote">\u7AEF\u9EDE\u7531 FastAPI route table \u52D5\u614B\u7522\u751F\uFF1B\u4E92\u52D5\u5F0F\u6587\u4EF6\u4F4D\u65BC <a href="${r(n)}" target="_blank" rel="noopener noreferrer"><code>${r(n)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${r(i)}" target="_blank" rel="noopener noreferrer"><code>${r(i)}</code></a>\u3002\u7AEF\u9EDE\u8B8A\u66F4\u5F8C\u91CD\u65B0\u6574\u7406\u6B64\u9801\u5373\u53EF\u53D6\u5F97\u6700\u65B0\u6E05\u55AE\u3002</p>`}function Wm(e,t={}){let s=e.data||{},a=t.info||null,n=a?.counts||{},i=Number(s.judgment_indexed_count||0),o=Number(s.judgment_count||0),l=Number(s.judgment_index_remaining??Math.max(0,o-i)),d=Number(s.judgment_index_pending??l)||0,p=Number(s.judgment_index_changed||0),g=Number(s.judgment_index_stale||0),$=o>0?Math.max(0,Math.min(100,i/o*100)):null,v=Ln($),u=s.judgment_index_fresh===!1||d>0||String(s.judgment_index_staleness?.status||"")==="stale",b=u?"is-warn":"",y=s.last_version||{},k=s.last_run||{},M=y.source_type==="law"?"\u6CD5\u898F":y.source_type==="order"?"\u547D\u4EE4":"\u2014",S=y.version_code?String(y.version_code):y.id?`#${c(y.id)}`:"\u2014",h=Number(s.legal_article_indexed_count||s.legal_index?.points_count||0),L=Number(s.legal_article_count||s.legal_index?.article_count||0),X=L>0?Math.max(0,Math.min(100,h/L*100)):null,J=s.legal_article_stale===!0||String(s.legal_index?.status||"")==="stale",ve=J?"is-warn":"",fe=s.judgment_vector_alias||"\u2014",se=s.judgment_vector_collection||"\u2014",q=s.legal_article_vector_alias||s.legal_index?.alias||"\u2014",A=s.legal_article_vector_collection||s.legal_index?.collection||"\u2014",T=u?"\u5224\u6C7A\u7D22\u5F15\u5F85\u66F4\u65B0":"\u8CC7\u6599\u7248\u672C\u4E00\u81F4",K=u?`\u5224\u6C7A\u7D22\u5F15\u5C1A\u7F3A ${c(d)} \u7B46`:"\u5224\u6C7A\u8CC7\u6599\u8207\u5411\u91CF\u7D22\u5F15\u4E00\u81F4",me=u?`PostgreSQL \u76EE\u524D\u6709 ${c(o)} \u7B46\u5224\u6C7A\uFF0CQdrant ${se} \u5DF2\u7D22\u5F15 ${c(i)} \u7B46\uFF1B\u5C1A\u6709 ${c(d)} \u7B46\u5F85\u7D22\u5F15\u3002`:"PostgreSQL \u8207 Qdrant \u5224\u6C7A\u7B46\u6578\u4E00\u81F4\uFF1B\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u8207\u7D22\u5F15\u72C0\u614B\u540C\u6B65\u3002",H=zt(k.status||"idle").label,le=k.finished_at||k.started_at;return`<section class="status-hero data-version-hero">
      <div class="status-hero-main">
        <div class="overall-row">
          <span class="overall-badge ${b}">
            <span class="status-dot ${u?"is-warn":"is-ok"}" aria-hidden="true"></span>
            ${r(T)}
          </span>
          <span class="badge badge-neutral badge-mono">${c(s.version_count)} \u500B\u8CC7\u6599\u7248\u672C</span>
          <span class="badge badge-neutral">${r(M)} \u6700\u65B0\u7248\u672C ${r(S)}</span>
        </div>
        <h2 class="status-headline">${r(K)}</h2>
        <p class="status-copy">${r(me)}</p>
        <div class="status-meta">
          <span>${m("clock",11)} \u6AA2\u67E5\u6642\u9593 ${_e(e.checked_at)}</span>
          <span>${m("database",11)} \u73FE\u884C\u8CC7\u6599 ${c(s.total_current)} \u7B46</span>
          <span>${m("layers",11)} \u539F\u59CB Parquet ${c(s.parquet_files)} \u500B \xB7 ${Ee(s.parquet_bytes)}</span>
          <span title="Qdrant alias \u8207\u76EE\u524D\u7248\u672C collection">${m("link",11)} <span class="mono">${r(fe)} \u2192 ${r(se)}</span></span>
        </div>
      </div>
      <div class="data-version-ring ${b}" style="--coverage:${$===null?0:$.toFixed(1)}%">
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
        <div class="metric-foot">${c(s.parquet_files)} \u500B\u539F\u59CB Parquet \xB7 ${Ee(s.parquet_bytes)}</div>
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
          ${Ke(y.is_current?"operational":"degraded",y.is_current?"CURRENT":"HISTORY")}
        </div>
        ${y.id?`<div class="index-current-row">
                <span class="badge badge-info">${m("activity",11)}${r(M)} ${r(S)}</span>
                <strong class="mono">${_e(y.downloaded_at)}</strong>
                <span class="index-current-copy" title="${r(y.parquet_path||"")}">${r(y.parquet_path||"\u2014")}</span>
              </div>
              <div class="data-version-facts">
                ${Ve("\u8CC7\u6599\u7248\u672C\u7E3D\u6578",c(s.version_count),{mono:!0})}
                ${Ve("\u4E0B\u8F09\u57F7\u884C\u7E3D\u6578",c(s.run_count),{mono:!0})}
                ${Ve("\u7248\u672C ID",`#${c(y.id)}`,{mono:!0})}
                ${Ve("\u8CC7\u6599\u985E\u578B",M)}
                ${Ve("\u4F86\u6E90\u66F4\u65B0\u65E5",y.update_date||"\u2014")}
                ${Ve(`${M}\uFF0F\u689D\u6587`,`${c(y.law_count)} / ${c(y.article_count)}`)}
                ${Ve("\u4E0B\u8F09\u6642\u9593",_e(y.downloaded_at),{mono:!0})}
                ${Ve("\u8CC7\u6599\u72C0\u614B",y.is_current?"current":"history",{mono:!0})}
                ${Ve("Parquet \u6A94\u6848",y.parquet_path||"\u2014",{mono:!0,wide:!0})}
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
                ${Ve("\u5DF2\u7528\u5BB9\u91CF",Ee(a.usage_bytes),{mono:!0})}
                ${Ve("\u53EF\u7528\u914D\u984D",Ee(a.quota_bytes),{mono:!0})}
              </div>
              <p class="data-version-note">${m("info",12)}
                IndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u7AEF\u63D0\u554F\u6B77\u53F2\u3001\u8A2D\u5B9A\u8207\u7248\u672C\u7A3D\u6838\u4E8B\u4EF6\uFF1B\u4F3A\u670D\u5668\u8CC7\u6599\u4EE5 PostgreSQL \u8207 Parquet \u70BA\u6E96\u3002
              </p>`:`<div class="report-empty-inline">${t.loading||!t.error?"\u6B63\u5728\u8B80\u53D6\u700F\u89BD\u5668 IndexedDB\u2026":r(t.error?.message||"IndexedDB \u5C1A\u7121\u8CC7\u6599\u6216\u7121\u6CD5\u8B80\u53D6\u3002")}</div>`}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${m("brain",14)}Qdrant \u5224\u6C7A\u5411\u91CF\u7D22\u5F15</span>
          ${Ke(u?"degraded":"operational",u?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${m("link",11)}Alias</span>
          <strong class="mono">${r(fe)}</strong>
          <span class="mono">\u2192 ${r(se)}</span>
          <span class="index-current-copy">v#${c(s.judgment_vector_version_id)} \xB7 ${r(s.judgment_vector_model||"\u2014")}</span>
        </div>
        ${Fl("\u7D22\u5F15\u8986\u84CB",$,`\u5DF2\u7D22\u5F15 ${c(i)} / ${c(o)} \u7B46 \xB7 \u5269\u9918 ${c(d)} \u7B46`,b)}
        <div class="data-version-facts">
          ${Ve("Qdrant points",c(s.judgment_vector_points),{mono:!0})}
          ${Ve("\u7D22\u5F15\u7248\u672C",`#${c(s.judgment_vector_version_id)} \xB7 ${s.judgment_vector_version_status||"legacy"}`,{mono:!0})}
          ${Ve("\u524D\u4E00\u7248\u672C",s.judgment_vector_previous_version_id?`#${c(s.judgment_vector_previous_version_id)}`:"\u2014",{mono:!0})}
          ${Ve("\u5F85\u88DC\uFF0F\u8B8A\u66F4\uFF0F\u5931\u6548",`${c(d)} / ${c(p)} / ${c(g)}`)}
          ${Ve("\u6700\u8FD1\u7D22\u5F15",_e(s.judgment_indexed_at),{mono:!0})}
          ${Ve("\u6A21\u578B",s.judgment_vector_model||"\u2014",{mono:!0})}
        </div>
        ${d>0?`<p class="data-version-note is-warn">${m("info",12)}\u5C1A\u6709 ${c(d)} \u7B46\u5224\u6C7A\u5C1A\u672A\u7D22\u5F15\uFF1B\u8ACB\u81F3\u300C\u8CC7\u6599\u8655\u7406 \u2192 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u63A5\u7E8C\u88DC\u9F4A\u3002</p>`:""}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${m("shield",14)}Qdrant \u6CD5\u898F\uFF0F\u547D\u4EE4\u5411\u91CF\u7D22\u5F15</span>
          ${Ke(J?"degraded":"operational",J?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${m("link",11)}Alias</span>
          <strong class="mono">${r(q)}</strong>
          <span class="mono">\u2192 ${r(A)}</span>
          <span class="index-current-copy">v#${c(s.legal_article_vector_version_id||s.legal_index?.version_id)}</span>
        </div>
        ${Fl("\u689D\u6587\u7D22\u5F15\u8986\u84CB",X,`\u5DF2\u7D22\u5F15 ${c(h)} / ${c(L)} \u689D`,ve)}
        <div class="data-version-facts">
          ${Ve("Qdrant points",c(h),{mono:!0})}
          ${Ve("\u73FE\u884C\u689D\u6587",c(L),{mono:!0})}
          ${Ve("\u5411\u91CF\u7DAD\u5EA6",c(s.legal_index?.dimension),{mono:!0})}
          ${Ve("\u6700\u8FD1\u7D22\u5F15",_e(s.legal_article_indexed_at||s.legal_index?.indexed_at),{mono:!0})}
          ${Ve("\u7D22\u5F15\u72C0\u614B",J?"stale":"fresh",{mono:!0})}
          ${Ve("Collection",A,{mono:!0})}
        </div>
      </section>

      <section class="card data-version-card is-wide-grid">
        <div class="side-card-head">
          <span class="side-card-title">${m("folder",14)}Parquet \u8207\u57F7\u884C\u72C0\u614B</span>
          <span class="badge badge-neutral badge-mono">${c(s.parquet_files)} FILES</span>
        </div>
        <div class="data-version-facts">
          ${Ve("\u539F\u59CB Parquet \u6A94\u6848",c(s.parquet_files),{mono:!0})}
          ${Ve("\u5408\u8A08\u5BB9\u91CF",Ee(s.parquet_bytes),{mono:!0})}
          ${Ve("PostgreSQL \u73FE\u884C\u8CC7\u6599",c(s.total_current),{mono:!0})}
          ${Ve("\u8CC7\u6599\u7248\u672C\u7E3D\u6578",c(s.version_count),{mono:!0})}
          ${Ve("\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C",k.status?H:"\u2014")}
          ${Ve("\u6700\u8FD1\u57F7\u884C\u6642\u9593",le?_e(le):"\u2014",{mono:!0})}
          ${Ve("\u6700\u8FD1\u57F7\u884C\u8017\u6642",k.duration_ms?ge(k.duration_ms):"\u2014",{mono:!0})}
          ${Ve("\u6700\u8FD1\u57F7\u884C\u7248\u672C",k.version_id?`#${c(k.version_id)}`:"\u2014",{mono:!0})}
        </div>
        <p class="data-version-note">${m("info",12)}
          \u539F\u59CB Parquet \u4FDD\u7559 raw\uFF0Fdelta \u8207 manifest\uFF1BPostgreSQL \u63D0\u4F9B current metadata \u8207\u7248\u672C\u72C0\u614B\uFF1BQdrant \u53EA\u4FDD\u5B58\u5411\u91CF\u8207 payload\u3002
        </p>
      </section>
    </div>`}function Km(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${c(t.run_count)} TOTAL</span>
    </div>
    ${Hm(e.recent_runs)}
  </section>`}function Ym(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function Jl(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function Ds(e,t,s,a,n){let i=Ym(n);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${m(t,14)}${r(e)}</span>
      <strong>${r(s)}</strong>
    </div>
    ${Jl(n,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function Xm(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${m("layers",14)}Docker</span>
        ${Ke("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${r(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,d=o.service?0:1;return l-d||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${r(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${r(i.service)}</span>`:""}</td>
        <td>${Ke(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
        <td class="cell-number">${i.cpu_percent===null||i.cpu_percent===void 0?"\u2014":`${c(i.cpu_percent)}%`}</td>
        <td class="cell-number">${Ee(i.memory_used)}${i.memory_limit?` / ${Ee(i.memory_limit)}`:""}</td>
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
  </section>`}function Zm(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",n=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${fs("\u8CC7\u6599\u5EAB",`<code>${r(s.database||"\u2014")}</code>`)}
           ${fs("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${Ee(s.storage_bytes)}</strong>`)}
           ${fs("Docker volume",`<strong>${Ee(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${fs("\u9023\u7DDA\u6578",`<strong>${c(s.connections)}</strong>`)}`:`${fs("Collection",`<code>${r(s.collection||"\u2014")}</code>`)}
           ${fs("Docker volume",`<strong>${Ee(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${fs("\u5411\u91CF\u9EDE\u6578",`<strong>${c(s.points_count)}</strong>`)}
           ${fs("Collections",`<strong>${c(s.collections)}</strong>`)}
           ${fs("Segments",`<strong>${c(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${r(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${r(s.kind||"")}</div>
          </div>
          ${Ke(i)}
        </div>
        <div class="resource-db-metrics">
          <div><span>CPU</span><strong>${s.cpu_percent===null||s.cpu_percent===void 0?"\u2014":`${c(s.cpu_percent)}%`}</strong></div>
          <div><span>RAM</span><strong>${Ee(s.memory_used)}</strong><small>${s.memory_limit?` / ${Ee(s.memory_limit)}`:""}</small></div>
          <div><span>\u5BB9\u5668</span><strong class="mono">${r(s.container||"\u2014")}</strong><small>${r(s.container_status||"\u2014")}</small></div>
        </div>
        <div class="detail-list">${o}</div>
        ${n.length?`<div class="resource-table-wrap">
                <table class="data-table is-compact">
                  <thead><tr><th scope="col">\u8CC7\u6599\u8868</th><th scope="col">\u5927\u5C0F</th></tr></thead>
                  <tbody>${n.map(l=>`<tr>
                        <td class="mono">${r(l.name||"\u2014")}</td>
                        <td class="cell-number">${Ee(l.bytes)}</td>
                      </tr>`).join("")}</tbody>
                </table>
              </div>`:""}
        <div class="side-card-foot">${r(s.detail||"")}</div>
      </article>`}).join("")}</div>`}function aa(e,t,s,a){let n=Number(t)||0,i=a?n/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${r(e)}</span>
      <strong>${Ee(n)}</strong>
    </div>
    ${Jl(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function eg(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},n=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},d=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${Ee(d)}</span>
    </div>
    <div class="storage-list">
      ${aa("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${r(s.frontend_path||"\u2014")}</span>`,d)}
      ${aa("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${r(s.backend_path||"\u2014")}</span>`,d)}
      ${aa("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",n.layers_bytes,`Images ${Ee(n.images_bytes)} \xB7 Containers ${Ee(n.containers_bytes)} \xB7 Build cache ${Ee(n.build_cache_bytes)}`,d)}
      ${aa("PostgreSQL volume",o.size_bytes,`<span class="mono">${r(o.name||"\u2014")}</span>`,d)}
      ${aa("Qdrant volume",l.size_bytes,`<span class="mono">${r(l.name||"\u2014")}</span>`,d)}
      ${aa("Parquet",a.total_bytes,`\u6CD5\u898F ${Ee(a.law_bytes)} \xB7 \u5224\u6C7A ${Ee(a.judgment_bytes)}`,d)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${Ee(d)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function tg(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},n=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),d=Array.isArray(e.disk)?e.disk:[],p=d[0]||{},g=Number(o.total_bytes||p.total||0),$=g?l/g*100:0,v=[s.load_1,s.load_5,s.load_15].map(y=>y??"\u2014").join(" / "),u=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":ge(Number(t.uptime_seconds)*1e3),b=[p.label?Ds("HDD \u5DF2\u4F7F\u7528","database",`${c(p.percent)}%`,`${Ee(p.used)} / ${Ee(p.total)} \xB7 \u5269\u9918 ${Ee(p.free)}<br><span class="mono">${r(p.path||"")}</span>`,p.percent):"",l?Ds("Judgment \u5143\u4EF6\u5408\u8A08","layers",Ee(l),`\u7D04\u5360 HDD ${c($)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,$):"",...d.slice(1).map(y=>Ds(`\u786C\u789F \xB7 ${y.label}`,"layers",`${c(y.percent)}%`,`${Ee(y.used)} / ${Ee(y.total)} \xB7 \u5269\u9918 ${Ee(y.free)}<br><span class="mono">${r(y.path||"")}</span>`,y.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${_e(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${Ds("CPU \u4F7F\u7528\u7387","cpu",`${c(s.percent)}%`,`${c(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${c(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${r(v)}`,s.percent)}
      ${Ds("\u8A18\u61B6\u9AD4","server",`${c(a.percent)}%`,`${Ee(a.used)} / ${Ee(a.total)} \xB7 \u53EF\u7528 ${Ee(a.available)}`,a.percent)}
      ${Ds("Swap","layers",`${c(n.percent)}%`,`${Ee(n.used)} / ${Ee(n.total)}`,n.percent)}
      ${Ds("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${c(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${r(u)}<br>${r(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${b||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${eg(e)}
    ${Xm(e)}
    ${Zm(e)}`}function Ol(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function sg(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SYSTEM RESOURCE USAGE</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Fe({tone:"danger",title:"\u8CC7\u6E90 API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-resources-retry">
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function ag(e){return e.status==="operational"?{label:"\u5DF2\u9023\u7DDA",badge:"badge-ok"}:{label:"\u7121\u6CD5\u9023\u7DDA",badge:"badge-danger"}}function ng(e,t){let s=ag(e),a=Array.isArray(e.models)?e.models:[],n=a.length?a.map(i=>{let o=String(i.name||""),l=e.chat_model===o,d=e.embedding_model===o,p=i.size?Ee(i.size):"",g=i.modified_at?_e(i.modified_at):"",$=new Set((i.capabilities||[]).map(u=>String(u||"").toLowerCase())),v=[];return i.supports_chat===!0&&v.push(["Chat","badge-ok"]),$.has("embedding")&&v.push(["Embedding","badge-info"]),$.has("vision")&&v.push(["Vision","badge-neutral"]),$.has("tools")&&v.push(["Tools","badge-neutral"]),$.has("thinking")&&v.push(["Thinking","badge-neutral"]),$.has("speech")&&v.push(["Speech","badge-warn"]),i.is_reranker&&v.push(["Reranker","badge-neutral"]),v.length||v.push([i.capability_status==="untested"?"\u672A\u6E2C\u8A66":"\u7121 chat \u80FD\u529B","badge-neutral"]),`<div class="ollama-model-row">
            <div class="ollama-model-main">
              <strong>${r(o)}</strong>
              <span class="ollama-model-meta">${[p,g].filter(Boolean).map(u=>r(u)).join(" \xB7 ")||"\u2014"}</span>
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
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="edit-host" data-id="${e.id}">${m("edit",13)}<span>\u7DE8\u8F2F</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="delete-host" data-id="${e.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
      </div>
    </div>
    <div class="ollama-model-list">${n}</div>
  </article>`}function rg(e,t,s,a){if(s)return`<div class="report-card">
      ${Fe({tone:"danger",title:"Model Provider \u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${m("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=e||{hosts:[],active_host_id:null},i=Array.isArray(n.hosts)?n.hosts:[],o=a?i.find(p=>Number(p.id)===Number(a)):null,l=o?o.base_url.replace(new RegExp(`:${o.port}$`),""):"http://127.0.0.1",d=o?"\u5132\u5B58\u8B8A\u66F4":"\u65B0\u589E\u4E3B\u6A5F";return`<div class="report-card ollama-card">
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
      ${t?'<div class="ollama-loading"><span class="spinner"></span><span>\u8B80\u53D6 llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span></div>':i.length?`<div class="ollama-host-list">${i.map(p=>ng(p,a)).join("")}</div>`:ht({iconName:"server",title:"\u5C1A\u672A\u8A2D\u5B9A llama-server \u4E3B\u6A5F",text:"\u8ACB\u5728\u4E0A\u65B9\u8F38\u5165\u7DB2\u5740\u8207 Port \u65B0\u589E\uFF0C\u6216\u4F7F\u7528 .env \u7684\u9810\u8A2D\u9023\u7DDA\u3002"})}
      <p class="report-sub" style="margin-top:12px">\u8A2D\u70BA\u804A\u5929\u6216\u5D4C\u5165\u6A21\u578B\u5F8C\uFF0C\u7CFB\u7D71\u6703\u4F7F\u7528\u76EE\u524D\u4E3B\u6A5F\u7684\u5C0D\u61C9\u6A21\u578B\u57F7\u884C AI \u51FA\u984C\u8207 RAG\uFF1B\u672A\u8A2D\u5B9A\u6642\u6CBF\u7528 .env \u7684 LLM_MODEL\uFF0FEMBEDDING_MODEL\u3002</p>
    </div>
  </div>`}function ig(e,t,s,a=!1){let n=e?.data||{},i=e?zt(e.status):null,o=s?zt(s.status):null,l={overview:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(i.label)}</span>`:"",resources:o?`<span class="badge ${o.tone==="ok"?"badge-ok":o.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(o.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${c(n.version_count)}</span>`,tests:'<span class="badge badge-neutral badge-mono">TEST</span>',"local-model":'<span class="badge badge-neutral badge-mono">LLAMA-SERVER</span>',runs:`<span class="badge badge-neutral badge-mono">${c(n.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${Ul.map(d=>{let p=d.id===t,g=a&&Gl.has(d.id);return`<button class="status-tab${p?" is-active":""}${g?" is-demo-locked":""}" type="button"
          data-status-tab="${d.id}" ${p?'aria-current="page"':""} ${g?'data-demo-lock-tooltip="\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B\u6B64\u7BA1\u7406\u529F\u80FD"':""}>
          <span class="status-tab-icon">${m(d.icon,15)}</span>
          <span class="status-tab-copy">
            <strong>${r(d.label)}</strong>
            <small>${r(d.hint)}</small>
          </span>
          ${g?'<span class="badge badge-neutral badge-mono">LOCK</span>':l[d.id]||""}
        </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u6AA2\u67E5\u6642\u9593</span>
      <span class="mono">${r(e?_e(e.checked_at):"\u2014")}</span>
    </div>`}function og(e,t,s,a,n,i,o,l=!1){if(e==="resources")return s?tg(s):a?Ol():n?sg(n):Ol();if(e==="local-model"){let d=i||{},p=!!d.loading||!d.hosts&&!d.error;return rg(d.hosts||null,p,d.error||null,d.editingId||null)}return e==="architecture"?Jm(t,l):e==="api"?Vm(t):e==="data"?Wm(t,o):e==="runs"?Km(t):Qm(t)}function lg(){return`<div class="status-hero">
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
    </div>`}function Hl(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u5FEB\u53D6\u6216\u63A8\u6E2C\u7684\u670D\u52D9\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Fe({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function cg(e,t){let s=Ut(),a=!1,n=null,i=null,o="overview",l=null,d=!1,p=null,g=null,$=!1,v=null,u=null,b=null,y=!1,k=null,M=!1,S=!1,h=null,L=0,X="",J="",ve=performance.now(),fe=new Date().toISOString(),se=!1;e.innerHTML=`<section class="page status-page">
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
      <section class="status-panel" id="status-content">${lg()}</section>
    </div>
  </section>`;let q=e.querySelector("#status-nav"),A=e.querySelector("#status-content"),T=e.querySelector("#refresh-status"),K=e.querySelector("#auto-refresh"),me=()=>{if(L+=1,typeof h=="function")try{h()}catch{}h=null,M=!1,S=!1},H=async()=>{let be=++L;S=!0,J="",A.innerHTML="";try{let V=await ai(A,{setTitle:()=>{}},{embedded:!0});if(be!==L||o!=="tests"){typeof V=="function"&&V();return}h=typeof V=="function"?V:null,M=!0}catch(V){be===L&&o==="tests"&&(A.innerHTML=Hl(V))}finally{be===L&&(S=!1)}},le=()=>{if(!i)return;let be=ig(i,o,l,s);if(be!==X&&(q.innerHTML=be,X=be),s&&Gl.has(o)){me();let he=Ts("\u6B64\u5206\u985E\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u670D\u52D9\u7E3D\u89BD\u3001\u524D\u5F8C\u7AEF\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u4E0B\u8F09\uFF1B\u7CFB\u7D71\u6E2C\u8A66\u3001\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528\u3001Model Provider \u8207 OpenAPI \u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002");A.innerHTML!==he&&(A.innerHTML=he),J=he;return}if(o==="tests"){!M&&!S&&H();return}me();let V=og(o,i,l,d,p,{hosts:g,loading:$,error:v,editingId:u},{info:b,loading:y,error:k},s);V!==J&&(A.innerHTML=V,J=V)},Te=async({quiet:be=!1}={})=>{if(!d){d=!0,p=null,o==="resources"&&!l&&le();try{let V=await U.systemUsage();if(a)return;l=V}catch(V){if(a)return;p=V,be||P(V.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{a||(d=!1,o==="resources"&&le())}}},I=async({quiet:be=!1}={})=>{if(!y){y=!0,k=null,o==="data"&&!b&&le();try{let V=await so();if(a)return;b=V}catch(V){if(a)return;k=V,be||P(V.message||"\u7121\u6CD5\u8B80\u53D6 IndexedDB\u3002","danger")}finally{a||(y=!1,o==="data"&&le())}}},ye=async({quiet:be=!1}={})=>{if(!$){$=!0,v=null,o==="local-model"&&!g&&le();try{let V=await U.ollamaHosts();if(a)return;g=V}catch(V){if(a)return;v=V,be||P(V.message||"\u7121\u6CD5\u53D6\u5F97 llama-server \u4E3B\u6A5F\u3002","danger")}finally{a||($=!1,o==="local-model"&&le())}}},ae=async()=>{await ye({quiet:!0}),await Se({quiet:!0})},Se=async({quiet:be=!1,status:V=null}={})=>{be||(T.disabled=!0,Ne(T,!0,"\u6AA2\u67E5\u4E2D\u2026"));let he=performance.now(),qe=new Date().toISOString(),Le=he,Re=qe;try{let R=V||await U.status();if(Le=performance.now(),Re=new Date().toISOString(),a)return;let D=!V&&!se?Math.max(0,he-ve):0;R.page_pipeline=R.pipeline||!i?.page_pipeline?Gm(R,{initMs:D,initStartedAt:fe,requestStartedAt:qe,requestFinishedAt:Re,requestMs:Le-he}):i.page_pipeline,se=!0,i=R,ns(Bl,R),le(),be||P("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(R){if(a)return;o!=="tests"&&(J="",A.innerHTML=Hl(R)),be||P(R.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{a||(T.disabled=!1,Ne(T,!1))}},Me=async({quiet:be=!1,status:V=null}={})=>{if(await Se({quiet:be,status:V}),!s&&(o==="resources"&&await Te({quiet:be}),o==="local-model"&&await ye({quiet:be}),!be&&o==="tests")){let he=A.querySelector("#tests-refresh");he&&he.click()}};q.addEventListener("click",be=>{let V=be.target.closest("[data-status-tab]");if(!V)return;let he=V.dataset.statusTab;Ul.some(qe=>qe.id===he)&&(o=he,le(),!s&&(o==="resources"&&!l&&!d&&Te(),o==="data"&&!b&&!y&&I(),o==="local-model"&&ye()))}),A.addEventListener("click",be=>{be.target.closest("#status-retry")&&Se(),be.target.closest("#status-resources-retry")&&Te()}),A.addEventListener("click",async be=>{let V=be.target.closest("[data-ollama-action]");if(!V)return;let he=V.dataset.ollamaAction,qe=Number(V.dataset.id||0);if(he==="refresh-hosts"){await ye();return}if(he==="edit-host"){u=qe,le(),e.querySelector(".ollama-host-form")?.scrollIntoView({behavior:"smooth",block:"center"});return}if(he==="cancel-host-edit"){u=null,le();return}if(he==="delete-host"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 llama-server \u4E3B\u6A5F #${qe}\uFF1F`))return;try{await U.deleteOllamaHost(qe),Number(u)===qe&&(u=null),P("llama-server \u4E3B\u6A5F\u5DF2\u522A\u9664\u3002","info"),await ae()}catch(Le){P(Le.message||"\u522A\u9664\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(he==="activate-host"){try{await U.activateOllamaHost(qe),P("\u5DF2\u5207\u63DB\u4F7F\u7528\u7684 llama-server \u4E3B\u6A5F\u3002","ok"),await ae()}catch(Le){P(Le.message||"\u5207\u63DB\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(he==="deactivate-host"){try{await U.deactivateOllamaHosts(),P("\u5DF2\u505C\u7528\u6307\u5B9A\u7684 llama-server \u4E3B\u6A5F\uFF0C\u5C07\u6CBF\u7528 .env \u8A2D\u5B9A\u3002","info"),await ae()}catch(Le){P(Le.message||"\u505C\u7528\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(he==="check-capabilities"){Ne(V,!0,"\u6AA2\u67E5\u4E2D\u2026");try{await U.checkOllamaCapabilities(),P("\u5DF2\u66F4\u65B0\u6240\u6709\u4E3B\u6A5F\u7684\u6A21\u578B\u80FD\u529B\u3002","ok",4e3),await ae()}catch(Le){P(Le.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u80FD\u529B\u3002","danger",7e3)}finally{Ne(V,!1)}return}if(he==="select-model"||he==="clear-model"){let Le=String(V.dataset.model||""),Re=String(V.dataset.role||"");try{he==="select-model"?(await U.selectOllamaModel(qe,{model:Le,role:Re}),P(`\u5DF2\u8A2D\u5B9A ${Re==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\uFF1A${Le}`,"ok")):(await U.clearOllamaModel(qe,{model:Le,role:Re}),P(`\u5DF2\u53D6\u6D88 ${Re==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\u3002`,"info")),await ae()}catch(R){P(R.message||"\u6A21\u578B\u8A2D\u5B9A\u5931\u6557\u3002","danger")}}}),A.addEventListener("submit",async be=>{let V=be.target.closest("form[data-ollama-form='host']");if(!V)return;be.preventDefault();let he=new FormData(V),qe=Number(he.get("host_id")||0),Le={name:String(he.get("name")||"").trim(),url:String(he.get("url")||"").trim(),port:Number(he.get("port")||11434)};try{qe?(await U.updateOllamaHost(qe,Le),P("llama-server \u4E3B\u6A5F\u5DF2\u66F4\u65B0\u3002","ok")):(await U.addOllamaHost(Le),P("llama-server \u4E3B\u6A5F\u5DF2\u65B0\u589E\u3002","ok")),u=null,await ae()}catch(Re){let R=Re.detail||Re.payload?.detail,D=R?.errors?.join(" \xB7 ")||R?.message||Re.message||"\u5132\u5B58\u4E3B\u6A5F\u5931\u6557\u3002";P(D,"danger",8e3)}}),A.addEventListener("toggle",be=>{let V=be.target.closest?.(".status-wf-stage[data-status-wf-stage]");if(!V||!A.contains(V))return;let he=V.dataset.statusWfStage||"";he&&(V.open?ni.add(he):ni.delete(he))},!0),T.addEventListener("click",()=>Me());let $e=()=>{n&&(n(),n=null)};K&&K.addEventListener("change",()=>{$e(),K.checked&&(n=_t("status",(be,V)=>{a||Me({quiet:!0,status:V?.snapshot||null})}),Me({quiet:!0}),P("\u5DF2\u555F\u7528\u5F8C\u7AEF\u63A8\u9001\u81EA\u52D5\u66F4\u65B0\uFF08\u6BCF 30 \u79D2\uFF09\u3002","info",2200))});let Ce=ds(Bl,120*1e3);return Ce?(i=Ce,se=!0,le(),Se({quiet:!0})):await Se({quiet:!0}),I({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{a=!0,me(),$e()}}var Vl="home",En={home:{page:yr,title:"Judgment RAG Console \xB7 \u6CD5\u898F\u8207\u5224\u6C7A\u6AA2\u7D22"},rag:{page:Fr,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:Tr,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:si,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:Ir,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:Yr,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:ri,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:qn,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"},admin:{page:ur,title:"\u7BA1\u7406\u8A2D\u5B9A \xB7 Judgment RAG Console"}},Bs=document.getElementById("app-main"),jn=null,Tn=0;function Nn(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||Vl;return Object.prototype.hasOwnProperty.call(En,t)?t:Vl}function dg(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function ug(e){return`<section class="page">
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
  </section>`}async function Fs(){let e=Nn(),t=++Tn;if(dg(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof jn=="function"){try{jn()}catch{}jn=null}if(js(),!Ks()){if(e==="admin"){document.title="\u7BA1\u7406\u8A2D\u5B9A \xB7 Judgment RAG Console",Bs.innerHTML=en();return}if(e==="tests"){document.title="\u5C55\u793A\u6A21\u5F0F \xB7 Judgment RAG Console",dr(Bs,e);return}if(!zi()){document.title="\u5C55\u793A\u76EE\u524D\u672A\u958B\u653E \xB7 Judgment RAG Console",Gi(Bs);return}if(!cr(e)){document.title="\u5C55\u793A\u6A21\u5F0F \xB7 Judgment RAG Console",dr(Bs,e);return}}document.title=En[e].title;let s={route:e,navigate(a){En[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===Tn&&a&&(document.title=a)}};try{let a=En[e].page.render(Bs,s);Ci(),window.scrollTo({top:0,behavior:"auto"}),Bs.focus({preventScroll:!0});let n=await a;if(t!==Tn){typeof n=="function"&&n();return}jn=typeof n=="function"?n:null}catch(a){if(t!==Tn)return;console.error("Failed to render route",e,a),Bs.innerHTML=ug(a);let n=document.getElementById("route-retry");n&&n.addEventListener("click",()=>Fs()),P("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function pg(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable))return;let a=Nn(),n=a==="home"?"home-question":a==="rag"?"rag-question":"";if(!n)return;let i=document.getElementById(n);i&&(e.preventDefault(),i.focus())})}function mg(){let e=document.querySelector('[data-route="processing"]');if(!e)return;let t=e.querySelector(".nav-update-badge");t||(t=document.createElement("span"),t.className="nav-update-badge",t.hidden=!0,e.appendChild(t));let s=0,a=0,n=0,i=()=>{let l=[];if(s>0&&l.push(`\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0F\u5224\u6C7A\u6709 ${s} \u9805\u4F86\u6E90\u66F4\u65B0`),a>0&&l.push(`\u5224\u6C7A\u532F\u5165\u5F85\u8655\u7406 ${a} \u500B\u6708`),n>0&&l.push(`Qdrant \u5411\u91CF\u7D22\u5F15\u5F85\u88DC ${n} \u500B\u6708`),!l.length){t.hidden=!0;return}let d=(s>0?1:0)+(a>0?1:0)+(n>0?1:0);t.textContent=String(d===1?s||a||n:d),t.title=l.join("\uFF1B"),t.hidden=!1},o=async(l=null)=>{try{let d=l||await U.updatesStatus();s=Number(d.update_count)||0,d&&Object.prototype.hasOwnProperty.call(d,"import_pending_count")&&(a=Number(d.import_pending_count)||0),d&&Object.prototype.hasOwnProperty.call(d,"index_pending_count")&&(n=Number(d.index_pending_count)||0),i()}catch{t.hidden=!0}};o(),_t("updates",(l,d)=>o(d?.snapshot||null)),window.addEventListener("judgment:processing-pending",l=>{a=Number(l.detail?.count)||0,l.detail&&Object.prototype.hasOwnProperty.call(l.detail,"index_pending")&&(n=Number(l.detail.index_pending)||0),i()}),window.addEventListener("judgment:updates-changed",()=>o())}function gg(e,t){return!e||!t?!0:!!e.admin!=!!t.admin||!!e.enabled!=!!t.enabled||String(e.expiresAt||"")!==String(t.expiresAt||"")||JSON.stringify(e.features||{})!==JSON.stringify(t.features||{})}async function Wl(){let e=Nn();e==="processing"?U.processing({cached:!0,slim:!0}).catch(()=>null):e==="quality"&&U.quality({cached:!0}).catch(()=>null);let t=Oi();t&&Hi(t);let s=Za();Ka(),Ii(),pg();let a=!1,n=()=>{Ks()&&!a&&(mg(),a=!0)};window.addEventListener("hashchange",Fs),window.addEventListener("judgment:auth-changed",async()=>{let o=await Za();Ha(o.me),n(),js(),Fs()}),window.addEventListener("judgment:demo-denied",async()=>{let o=await Za();Ha(o.me),n(),js(),Fs()}),t&&(Yn({user:t.me}),n(),js(),Fs());let i=await s;t?(Ha(i.me),n(),js(),gg(t,i)&&Fs()):(Yn({user:i.me}),n(),js(),Fs()),Da()&&window.setTimeout(()=>{let o=Nn();(o==="rag"||o==="admin")&&(window.location.hash=Ks()?"#/tests":"#/home")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Wl):Wl();})();
