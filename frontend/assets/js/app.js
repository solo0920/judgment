(()=>{var Gl=Object.defineProperty;var os=(e,t)=>{for(var s in t)Gl(e,s,{get:t[s],enumerable:!0})};var Cn="judgment.api_base",Pn="judgment.admin_token",Dn="http://127.0.0.1:9200",wt=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function di(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function ls(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${di(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function Bn(e){let t=ls(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function Fn(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?ls(e.get("api")):null}catch{return null}}function On(){try{let e=window.localStorage.getItem(Cn);return e===null?null:ls(e)}catch{return null}}function Hn(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return ls(e||"")}function Yt(){let e=Fn();if(e!==null)return e;let t=On();if(t!==null)return t;let s=Hn();return s||(window.location.protocol==="file:"?Dn:"")}function Ul(){if(Fn()!==null)return!0;let e=On();return e!==null?!!e:!!Hn()}function Ot(){return Fn()!==null?"query":On()!==null?"storage":Hn()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function Ca(){return Ul()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!di(window.location.hostname)}function zn(e){let t=ls(e);try{t?window.localStorage.setItem(Cn,t):window.localStorage.removeItem(Cn)}catch{}return t}function Pa(){try{return String(window.localStorage.getItem(Pn)||"").trim()}catch{return""}}function ui(e){let t=String(e||"").trim();try{t?window.localStorage.setItem(Pn,t):window.localStorage.removeItem(Pn)}catch{}return t}function In(){return Ot()==="query"?"":Pa()}function vs(e=Yt()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function bt(e,t=Yt()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function ci(){return Ot()==="query"?"":Yt()}async function Ql(){let e=In(),t={Accept:"application/json"};e&&(t["X-Judgment-Admin-Token"]=e);try{let s=await fetch(bt("/api/auth/sse-ticket"),{method:"POST",headers:t,credentials:"include"});if(!s.ok)return"";let a=await s.json();return String(a.ticket||"")}catch{return""}}function _t(e,t,{onError:s=null,onProgress:a=null}={}){if(document.body.classList.contains("is-demo-visitor"))return()=>{};let n=(Array.isArray(e)?e:[e]).map(h=>String(h||"").trim()).filter(Boolean);if(!n.length||typeof EventSource>"u")return()=>{};let i=null,o=0,l=!1,d=null,p=h=>{let u={};try{u=JSON.parse(h.data||"{}")}catch{u={}}u.initial&&o<=1&&!u.snapshot||t?.(u.topic||n[0],u)},g=h=>{let u={};try{u=JSON.parse(h.data||"{}")}catch{u={}}a?.(u.topic||n[0],u)},$=async()=>{if(l)return;let h=await Ql();if(l)return;let u=new URLSearchParams({topic:n.join(",")});h&&u.set("ticket",h),i=new EventSource(bt(`/api/events/stream?${u.toString()}`),{withCredentials:!0}),i.onopen=()=>{o+=1,d&&(window.clearTimeout(d),d=null)},i.addEventListener("refresh",p),i.addEventListener("progress",g),i.onerror=()=>{s?.(),!(l||!i)&&(i.close(),i=null,!d&&(d=window.setTimeout(()=>{d=null,$()},3e3)))}};return $(),()=>{l=!0,d&&(window.clearTimeout(d),d=null),i&&(i.removeEventListener("refresh",p),i.removeEventListener("progress",g),i.close(),i=null)}}var Ra=new Map;function Jl({cached:e=!1,slim:t=!1}={}){let s=new URLSearchParams;e&&s.set("cached","1"),t&&s.set("slim","1");let a=s.toString(),n=`/api/processing${a?`?${a}`:""}`,i=Ra.get(n);if(i)return i;let o=ie(n,{timeout:45e3,trackClient:!1});Ra.set(n,o);let l=()=>window.setTimeout(()=>{Ra.get(n)===o&&Ra.delete(n)},1500);return o.then(l,l),o}function Gn(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function ie(e,t={}){let{base:s,...a}=t,n=s!==void 0?ls(s):Yt(),i=new AbortController,o=t.timeout===void 0?3e4:t.timeout,l=o>0?window.setTimeout(()=>i.abort(),o):null,d=Date.now(),p=performance.now(),g=t.requestId||pi(),$={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":g,"X-Judgment-Client-Started-At":String(d),...In()?{"X-Judgment-Admin-Token":In()}:{},...t.headers||{}},h;try{h=await fetch(bt(e,n),{...a,headers:$,credentials:"include",signal:i.signal})}catch(x){throw x.name==="AbortError"?new wt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new wt(Gn(n),0,x)}finally{l&&window.clearTimeout(l)}let u=null;if((h.headers.get("content-type")||"").includes("application/json"))try{u=await h.json()}catch{u=null}else try{u=await h.text()}catch{u=null}let v=performance.now(),k=h.headers.get("X-Judgment-Request-Id")||g;if(t.trackClient!==!1&&k){let x=Math.round(performance.now()-p);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{mi({request_id:k,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:x,render_ms:Math.max(0,Math.round(performance.now()-v)),status:h.ok?"success":"failed"})})})}if(!h.ok){h.status===403&&u&&typeof u=="object"&&["demo_closed","demo_hard_disabled"].includes(u.code)&&window.dispatchEvent(new CustomEvent("judgment:demo-denied",{detail:u}));let x=u&&typeof u=="object"?u.detail||u.message:u,_=typeof x=="string"&&x?x:`\u4F3A\u670D\u5668\u56DE\u61C9 ${h.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new wt(_,h.status,x)}return u}function pi(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function mi(e){if(!document.body.classList.contains("is-demo-visitor"))try{fetch(bt("/api/performance/client",Yt()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),credentials:"include",keepalive:!0}).catch(()=>{})}catch{}}async function gi(e){let t=ls(e);if(!Bn(t))throw new wt("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,n=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(bt("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new wt(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof wt?i:i.name==="AbortError"?new wt("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new wt(Gn(t),0,i)}finally{window.clearTimeout(n)}}var Q={health(){return ie("/api/health")},authMe(){return ie("/api/auth/me",{base:ci(),trackClient:!1})},authLogout(){return ie("/api/auth/logout",{method:"POST",base:ci(),trackClient:!1})},demoStatus(){return ie("/api/demo/status",{timeout:15e3,trackClient:!1})},adminDemo(){return ie("/api/admin/demo",{timeout:15e3,trackClient:!1})},updateDemo(e){return ie("/api/admin/demo",{method:"PUT",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},closeDemo(){return ie("/api/admin/demo/close",{method:"POST",body:JSON.stringify({}),timeout:3e4,trackClient:!1})},demoAudit(e=20){let t=new URLSearchParams({limit:String(e)});return ie(`/api/admin/demo/audit?${t.toString()}`,{timeout:15e3,trackClient:!1})},status(){return ie("/api/status",{trackClient:!1})},ollamaHosts(){return ie("/api/llama-server/hosts",{timeout:3e4,trackClient:!1})},addOllamaHost(e){return ie("/api/llama-server/hosts",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},updateOllamaHost(e,t){return ie(`/api/llama-server/hosts/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},deleteOllamaHost(e){return ie(`/api/llama-server/hosts/${encodeURIComponent(e)}`,{method:"DELETE",timeout:3e4,trackClient:!1})},activateOllamaHost(e){return ie(`/api/llama-server/hosts/${encodeURIComponent(e)}/activate`,{method:"POST",timeout:3e4,trackClient:!1})},deactivateOllamaHosts(){return ie("/api/llama-server/hosts/deactivate",{method:"POST",timeout:3e4,trackClient:!1})},reorderOllamaHosts(e){return ie("/api/llama-server/hosts/reorder",{method:"POST",body:JSON.stringify({host_ids:e}),timeout:3e4,trackClient:!1})},checkOllamaCapabilities(){return ie("/api/llama-server/hosts/capabilities/test",{method:"POST",timeout:18e4,trackClient:!1})},selectOllamaModel(e,t){return ie(`/api/llama-server/hosts/${encodeURIComponent(e)}/models/select`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},clearOllamaModel(e,t){return ie(`/api/llama-server/hosts/${encodeURIComponent(e)}/models/clear`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},systemUsage(){return ie("/api/system-usage",{trackClient:!1})},indexVersions(){return ie("/api/index-versions",{trackClient:!1})},indexVersion(e){return ie(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return ie(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return ie(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return ie("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){let t=new URLSearchParams({repair:e?"true":"false"});return ie(`/api/index-alias/reconcile?${t.toString()}`,{trackClient:!1})},catalog(){return ie("/api/catalog")},homeSummary(){return ie("/api/home")},judgmentStats(){return ie("/api/judgment-stats")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return ie("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},dataSuggest({kind:e,query:t="",limit:s=12}){let a=new URLSearchParams({kind:e,query:t,limit:String(s)});return ie(`/api/data/suggest?${a.toString()}`,{timeout:45e3,trackClient:!1})},schemaSuggest({database:e,table:t,column:s,query:a,limit:n=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(n)});return ie(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let n=new URLSearchParams({law_key:e});return t&&n.set("source_type",t),s&&n.set("version_id",String(s)),a&&n.set("article_no",String(a)),ie(`/api/law?${n.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),ie(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return ie("/api/test-mode",{trackClient:!1})},llmModels(){return ie("/api/llm/models",{timeout:6e4,trackClient:!1})},testLlmModels(){return ie("/api/llm/models/test",{method:"POST",timeout:12e4,trackClient:!1})},rerankStatus(){return ie("/api/rerank/status",{timeout:6e4,trackClient:!1})},testReranker(){return ie("/api/rerank/test",{method:"POST",timeout:12e4,trackClient:!1})},selectLlmModel(e,t=null){return ie("/api/llm/model",{method:"POST",body:JSON.stringify({model:e,host_id:t}),timeout:3e4,trackClient:!1})},setTestMode(e){return ie("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return ie(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return ie("/api/test-runs/current",{trackClient:!1})},testRun(e){return ie(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return ie("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))i==null||i===""||a.set(n,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),ie(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return ie("/api/quality",{timeout:18e4,trackClient:!1})},demoQuality(){return ie("/api/demo/quality",{timeout:2e4,trackClient:!1})},processing({cached:e=!1,slim:t=!1}={}){return Jl({cached:e,slim:t})},demoProcessing(){return ie("/api/demo/processing",{timeout:2e4,trackClient:!1})},processingActive(){return ie("/api/processing/active",{timeout:3e3,trackClient:!1})},judgmentDownloadStatus(){return ie("/api/judgment-download/status",{timeout:3e4,trackClient:!1})},versioningSummary(){return ie("/api/versioning/summary",{trackClient:!1})},updatesStatus(){return ie("/api/updates/status",{trackClient:!1})},checkCourts(){return ie("/api/courts/check",{timeout:6e4,trackClient:!1})},checkLawVersions(){return ie("/api/law-versions/check",{timeout:6e4,trackClient:!1})},checkUpdates(e=[]){let t=Array.isArray(e)&&e.length?{source_types:e}:{};return ie("/api/updates/check",{method:"POST",body:JSON.stringify(t),timeout:12e4,trackClient:!1})},versioningSnapshots(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.limit&&t.set("limit",String(e.limit)),ie(`/api/versioning/judgments/snapshots?${t.toString()}`,{trackClient:!1})},versioningChanges(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit)),ie(`/api/versioning/judgments/changes?${t.toString()}`,{trackClient:!1})},versioningJudgment(e){return ie(`/api/versioning/judgments/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVersion(e){return ie(`/api/versioning/judgments/versions/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVector(e,t){return ie(`/api/versioning/judgments/${encodeURIComponent(e)}/vectors/${encodeURIComponent(t)}`,{trackClient:!1})},versioningAudit(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit||500)),ie(`/api/versioning/audit?${t.toString()}`,{trackClient:!1})},questionBankStats(){return ie("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))if(!(i==null||i==="")){if(Array.isArray(i)){for(let o of i)o==null||o===""||a.append(n,String(o));continue}a.set(n,String(i))}return a.set("limit",String(t)),a.set("offset",String(s)),ie(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankTags(e="",t=12){let s=new URLSearchParams({query:e,limit:String(t)});return ie(`/api/question-bank/tags?${s.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return ie(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return ie("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},createQuestionBankItemWithAI(e){return ie("/api/question-bank/ai-items",{method:"POST",body:JSON.stringify(e),timeout:42e4,trackClient:!1})},updateQuestionBankItem(e,t){return ie(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return ie(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},restoreQuestionBankItem(e){return ie(`/api/question-bank/items/${encodeURIComponent(e)}/restore`,{method:"POST",timeout:45e3,trackClient:!1})},submitQuestionBankItemForReview(e){return ie(`/api/question-bank/items/${encodeURIComponent(e)}/submit`,{method:"POST",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return ie(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return ie("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return ie(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return ie("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return ie(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return ie("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},benchmarkSuiteLatestAnswers(e){return ie(`/api/benchmark/suites/${encodeURIComponent(e)}/latest-answers`,{timeout:45e3,trackClient:!1})},removeBenchmarkSuiteItem(e,t){return ie(`/api/benchmark/suites/${encodeURIComponent(e)}/items/${encodeURIComponent(t)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return ie("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return ie(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return ie(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return ie(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return ie("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return ie(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return ie(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return ie(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return ie("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return ie(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return ie("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return ie(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return ie("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return ie("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return ie("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onQueued:n=null,onToken:i=null,onTokenReset:o=null}={}){let l=Yt(),d=new AbortController,p=t?0:3e5,g=p>0?window.setTimeout(()=>d.abort(),p):null,$=Date.now(),h=performance.now(),u=pi(),b={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":u,"X-Judgment-Client-Started-At":String($)},v;try{v=await fetch(bt("/api/rag/query/stream",l),{method:"POST",headers:b,body:JSON.stringify({question:e}),credentials:"include",signal:d.signal})}catch(V){throw V.name==="AbortError"?new wt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new wt(Gn(l),0,V)}finally{g&&window.clearTimeout(g)}if(!v.ok){let V=null;try{V=await v.json()}catch{V=null}let $e=V&&typeof V=="object"&&V.detail?String(V.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${v.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new wt($e,v.status,V)}if(!v.body)throw new wt("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let k=v.body.getReader(),x=new TextDecoder,_="",y=null,I=null;try{for(;;){let{value:V,done:$e}=await k.read();if($e)break;_+=x.decode(V,{stream:!0});let he=_.indexOf(`

`);for(;he>=0;){let ae=_.slice(0,he).replace(/\r/g,"");_=_.slice(he+2);let q="message",A=[];for(let j of ae.split(`
`))j.startsWith("event:")?q=j.slice(6).trim():j.startsWith("data:")&&A.push(j.slice(5).trimStart());if(A.length){let j=null;try{j=JSON.parse(A.join(`
`))}catch{j=null}if(j)if(q==="step"&&typeof s=="function")try{s(j)}catch{}else if(q==="partial"){if(typeof a=="function")try{a(j)}catch{}}else if(q==="queued"){if(typeof n=="function")try{n(j)}catch{}}else if(q==="token"){if(typeof i=="function")try{i(String(j.text||""))}catch{}}else if(q==="token_reset"){if(typeof o=="function")try{o()}catch{}}else q==="result"?y=j:q==="error"&&(I=new wt(j.message||j.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,j))}he=_.indexOf(`

`)}}}finally{try{await k.cancel()}catch{}g&&window.clearTimeout(g)}if(I)throw I;if(!y)throw new wt("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let pe=Math.round(performance.now()-h);return mi({request_id:u,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:pe,render_ms:0,status:"success"}),y&&typeof y=="object"&&(y._client_request_id=u),y}};var Vl={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Wl={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},Kl={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},Yl={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},fi={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',palette:'<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10h-4Z"/><circle cx="7.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/><circle cx="10" cy="6.8" r=".8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="6.8" r=".8" fill="currentColor" stroke="none"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',more:'<circle cx="4.2" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="19.8" cy="12" r="2.6" fill="currentColor" stroke="none"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function r(e){return String(e??"").replace(/[&<>"']/g,t=>Vl[t])}function m(e,t=16,s=""){let a=fi[e]||fi.info;return`<svg${s?` class="${r(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function c(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function Ee(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function Un(e){if(e instanceof Date)return e;if(typeof e=="number"){let n=new Date(e);return Number.isNaN(n.getTime())?null:n}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function Ht(e){let t=Un(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?r(e):"\u2014"}function we(e){let t=Un(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?r(e):"\u2014"}function ca(e){let t=Un(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:Ht(t)}function fe(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function zt(e){return Wl[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Xe(e,t){let s=zt(e);return`<span class="badge ${Kl[s.tone]}"><span class="status-dot ${Yl[s.tone]}"></span>${r(t||s.label)}</span>`}function Xl(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${r(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function Ia(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function Da(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return Xe(String(e));case"source":return Xl(String(e));case"number":return`<span class="mono">${c(e)}</span>`;case"duration":return`<span class="mono">${fe(e)}</span>`;case"datetime":return`<span class="mono">${we(e)}</span>`;case"date":return`<span class="mono">${Ht(e)}</span>`;case"url":{let s=String(e),a=Ia(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${r(s)}" target="_blank" rel="noopener noreferrer" title="${r(s)}">${m("external",10)}${r(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${r(s)}">${r(Ia(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(Ia(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(Ia(s,90))}</span>`}}}function Be({tone:e="info",title:t,text:s,iconName:a="info"}){let n=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
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
  </div>`}function Ne(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${r(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function N(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let n={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${n[t]||"i"}</span>
    <div class="toast-body">${r(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function Hs(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function Gt(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),n=URL.createObjectURL(a),i=document.createElement("a");i.href=n,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(n),1e3)}var Zl=`
  <svg class="auth-google-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z"/>
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.58A10 10 0 0 0 12 22Z"/>
    <path fill="#FBBC05" d="M6.41 13.92A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.92V7.5H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.5l3.35-2.58Z"/>
    <path fill="#EA4335" d="M12 6.04c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.5l3.35 2.58C7.2 7.8 9.4 6.04 12 6.04Z"/>
  </svg>`,ec={google_not_configured:"Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A GOOGLE_CLIENT_ID \u8207 GOOGLE_CLIENT_SECRET\u3002",state_mismatch:"\u767B\u5165\u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u767B\u5165\u3002",access_denied:"\u4F60\u53D6\u6D88\u4E86 Google \u767B\u5165\u3002",email_unverified:"\u9019\u500B Google \u5E33\u865F\u7684\u96FB\u5B50\u90F5\u4EF6\u5C1A\u672A\u9A57\u8B49\u3002",not_allowed:"\u9019\u500B Google \u5E33\u865F\u6C92\u6709\u7BA1\u7406\u54E1\u6B0A\u9650\u3002",oauth_failed:"Google \u767B\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"},Pt=null;function tc(){return Ot()==="query"?"":Yt()}function sc(){let e=tc(),t=`${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;return bt(`/api/auth/google/start?next=${encodeURIComponent(t)}`,e)}function bi(e){let t=String(e?.name||"").trim();if(t)return t;let s=String(e?.email||"").trim();return s?s.split("@")[0]:"\u5DF2\u767B\u5165"}function ac(e){return bi(e).slice(0,1).toUpperCase()||"A"}function Qn(){let e=Pt?.querySelector("#auth-menu"),t=Pt?.querySelector("#auth-user-trigger");e&&(e.hidden=!0),t&&t.setAttribute("aria-expanded","false")}function hi(e={}){let t=!!e.google_enabled;Pt.innerHTML=`
    <a class="auth-login${t?"":" is-disabled"}"
       id="auth-login"
       href="${r(sc())}"
       aria-label="\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165"
       title="${t?"\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165":"Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A"}"
       ${t?"":'aria-disabled="true"'}>
      ${Zl}
      <span>\u767B\u5165</span>
    </a>`,t||Pt.querySelector("#auth-login")?.addEventListener("click",a=>{a.preventDefault(),N("Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A GOOGLE_CLIENT_ID \u8207 GOOGLE_CLIENT_SECRET\u3002","warn",5200)})}function nc(e){let t=bi(e),s=String(e?.email||""),a=e?.admin?"\u7BA1\u7406\u54E1":"\u4F7F\u7528\u8005";Pt.innerHTML=`
    <div class="auth-user">
      <button type="button"
              class="auth-user-trigger"
              id="auth-user-trigger"
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="\u5DF2\u767B\u5165\uFF1A${r(s||t)}\uFF0C\u958B\u555F\u5E33\u865F\u9078\u55AE"
              title="${r(s||t)}">
        <span class="auth-avatar" aria-hidden="true">${r(ac(e))}</span>
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
    </div>`;let n=Pt.querySelector("#auth-user-trigger"),i=Pt.querySelector("#auth-menu");n?.addEventListener("click",o=>{o.stopPropagation();let l=!!i?.hidden;i&&(i.hidden=!l),n.setAttribute("aria-expanded",l?"true":"false")}),Pt.querySelector("#auth-admin-settings")?.addEventListener("click",()=>{Qn()}),Pt.querySelector("#auth-logout")?.addEventListener("click",async o=>{let l=o.currentTarget;l.disabled=!0,l.textContent="\u767B\u51FA\u4E2D\u2026";try{await Q.authLogout(),N("\u5DF2\u767B\u51FA\u3002","ok",2400),await vi(),window.dispatchEvent(new CustomEvent("judgment:auth-changed"))}catch(d){l.disabled=!1,l.textContent="\u767B\u51FA",N(d.message||"\u767B\u51FA\u5931\u6557\u3002","danger",5200)}})}function Jn(e){e?.authenticated?nc(e):hi(e||{google_enabled:!1})}async function vi(){if(Pt)try{Jn(await Q.authMe())}catch{hi({google_enabled:!1})}}function rc(){let e;try{e=new URL(window.location.href)}catch{return}let t=e.searchParams.get("auth"),s=e.searchParams.get("auth_error");!t&&!s||(e.searchParams.delete("auth"),e.searchParams.delete("auth_error"),window.history.replaceState(null,"",`${e.pathname}${e.search}${e.hash}`),t==="ok"?N("\u5DF2\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165\u3002","ok",3600):s&&N(ec[s]||"Google \u767B\u5165\u5931\u6557\u3002","danger",6e3))}function Ba(e){Pt&&Jn(e)}function Vn({user:e=null}={}){Pt=document.getElementById("auth-slot"),Pt&&(rc(),document.addEventListener("click",t=>{t.target.closest(".auth-user")||Qn()}),document.addEventListener("keydown",t=>{t.key==="Escape"&&Qn()}),e?Jn(e):vi())}var $i="judgment.theme",Wn="nvidia",Fa=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#0070f3","#171717","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#0066cc","#1d1d1f","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#17171d","#5e6ad2","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#0d99ff","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#0075de","#191918","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],Kn=new Map(Fa.map(e=>[e.id,e]));function ic(e){return Kn.has(e)}function oc(e){return Kn.get(e)||Kn.get(Wn)}function Yn(){try{let e=window.localStorage.getItem($i);return ic(e)?e:Wn}catch{return Wn}}function Xn(e,{persist:t=!0}={}){let s=oc(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");if(a&&a.setAttribute("content",s.metaColor),document.querySelectorAll(".theme-option").forEach(n=>{let i=n.dataset.themeId===s.id;n.classList.toggle("is-active",i),n.setAttribute("aria-checked",i?"true":"false")}),t)try{window.localStorage.setItem($i,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}var Oa="judgment.fontSizes.v1",ar="judgment.appearance",xi=new Set(["light","dark","system"]),yi="light",da=window.matchMedia("(prefers-color-scheme: dark)"),lc="font-size",pa=[{id:"page-title",label:"\u9801\u9762\u6A19\u984C",hint:"\u5404\u9801\u6700\u4E0A\u65B9\u7684 h1 \u6A19\u984C",selectors:[".page-title"],defaultPx:40,min:20,max:72},{id:"home-title",label:"\u9996\u9801\u4E3B\u8996\u89BA\u6A19\u984C",hint:"\u9996\u9801\u6700\u5927\u7684\u4E3B\u6A19\u984C",selectors:[".home-title"],defaultPx:88,min:40,max:140},{id:"section-title",label:"\u5340\u584A\u6A19\u984C",hint:"\u5831\u8868\u3001\u5361\u7247\u8207\u5340\u584A\u6A19\u984C",selectors:[".section-title",".report-title",".side-card-title",".filter-title",".tests-card-title",".status-sidebar-title",".judgment-dialog-head h2"],defaultPx:16,min:10,max:36},{id:"body",label:"\u5167\u6587\u8207\u8AAA\u660E",hint:"\u6BB5\u843D\u3001\u56DE\u7B54\u3001\u8AAA\u660E\u8207\u6458\u8981\u6587\u5B57",selectors:[".answer-text",".page-subtitle",".report-sub",".home-lead",".empty-text",".notice-body p",".citation-snippet",".side-card-body",".detail-list",".field-help",".report-empty-inline",".processing-section-sub",".summary-value-text",".status-summary",".warnings",".law-dialog-warning"],defaultPx:14,min:8,max:28},{id:"table",label:"\u8868\u683C\u5167\u5BB9",hint:"\u8CC7\u6599\u8868\u683C\u7684\u8868\u982D\u8207\u5132\u5B58\u683C",selectors:[".data-table th",".data-table td"],defaultPx:12,min:8,max:24},{id:"meta",label:"\u6A19\u7C64\u8207\u8F14\u52A9\u6587\u5B57",hint:"badge\u3001chip\u3001\u6B04\u4F4D\u6A19\u7C64\u8207 metadata",selectors:[".badge",".chip",".citation-meta",".citation-index",".answer-section-label",".report-kicker",".report-section-title",".eyebrow",".field-label",".summary-label",".metric-label",".footer-bottom",".nav-update-badge"],defaultPx:10,min:7,max:20},{id:"button",label:"\u6309\u9215\u8207\u5C0E\u89BD",hint:"\u64CD\u4F5C\u6309\u9215\u3001\u9801\u9996\u5C0E\u89BD\u8207\u9023\u7D50",selectors:[".btn",".nav-link",".page-btn",".law-link",".judgment-link",".theme-option-name",".theme-option-desc"],defaultPx:13,min:9,max:24},{id:"form",label:"\u8868\u55AE\u8207\u8F38\u5165",hint:"\u8F38\u5165\u6846\u3001\u4E0B\u62C9\u9078\u55AE\u8207 textarea",selectors:["input","textarea","select",".input",".field-input"],defaultPx:14,min:9,max:28},{id:"mono",label:"\u7A0B\u5F0F\u78BC\u8207\u6578\u503C",hint:"\u7B49\u5BEC\u6587\u5B57\u3001\u67E5\u8A62\u8A9E\u53E5\u8207\u7D71\u8A08\u6578\u503C",selectors:[".mono",".cell-mono",".cell-number",".query-code","code",".metric-value",".summary-value",".perf-stat-value",".mini-stat-value"],defaultPx:13,min:8,max:30},{id:"law-page",label:"\u6CD5\u898F\u689D\u6587\uFF08\u9801\u9762\uFF09",hint:"\u6CD5\u898F\u6AA2\u7D22\u7D50\u679C\u8207\u6CD5\u898F\u4F86\u6E90\u5361\u689D\u6587",selectors:[".law-answer-article-text",".law-answer-article-no",".law-source-article-text",".law-source-article-no",".law-article-text",".law-article-no"],excludeAncestors:[".law-dialog"],defaultPx:12,min:9,max:28},{id:"law-dialog",label:"\u6CD5\u898F\u689D\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u6309\u4E0B\u689D\u6587\u5F8C\u958B\u555F\u7684\u6CD5\u898F dialog",selectors:[".law-dialog .law-article-text",".law-dialog .law-article-no",".law-dialog .law-chapter"],defaultPx:16,min:10,max:32},{id:"judgment-dialog",label:"\u5224\u6C7A\u5168\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u5224\u6C7A\u539F\u6587 dialog \u7684\u5168\u6587\u5340\u584A",selectors:[".judgment-dialog-text"],defaultPx:23,min:12,max:48}],Us=new Map(pa.map(e=>[e.id,e])),ua=new WeakMap,cs=Li(),jt={...cs},ds=Mi(),Zn=new Set,Gs=null,zs=null,kt=null,As=null,wi=null,$s=lc,ys=!1,er=null,tr=!1,Ha="";function Ai(e,t,s){return Math.min(s,Math.max(t,e))}function nr(e){return Math.round(e*10)/10}function Ga(e){return Number.isInteger(e)?String(e):e.toFixed(1)}function Mi(){try{let e=window.localStorage.getItem(ar);return xi.has(e)?e:yi}catch{return yi}}function cc(){return ds==="system"?da.matches?"dark":"light":ds}function qi(){document.querySelectorAll("[data-appearance-option]").forEach(e=>{let t=e.dataset.appearanceOption===ds;e.classList.toggle("is-active",t),e.setAttribute("aria-pressed",t?"true":"false")})}function za({persist:e=!1}={}){if(document.documentElement.dataset.appearance=cc(),document.documentElement.dataset.appearanceMode=ds,qi(),e)try{window.localStorage.setItem(ar,ds)}catch{}}function dc(e){xi.has(e)&&(ds=e,za({persist:!0}))}function _i(){ds==="system"&&za()}typeof da.addEventListener=="function"?da.addEventListener("change",_i):typeof da.addListener=="function"&&da.addListener(_i);function Li(){let e=null;try{e=JSON.parse(window.localStorage.getItem(Oa)||"null")}catch{e=null}if(!e||typeof e!="object"||Array.isArray(e))return{};let t={};for(let s of pa){let a=Number(e[s.id]);Number.isFinite(a)&&(t[s.id]=nr(Ai(a,s.min,s.max)))}return t}function uc(){try{return Object.keys(cs).length?window.localStorage.setItem(Oa,JSON.stringify(cs)):window.localStorage.removeItem(Oa),!0}catch{return!1}}function ga(e){let t=new Set;for(let s of e.selectors)document.querySelectorAll(s).forEach(a=>{a.closest(".settings-sidebar")||Array.isArray(e.excludeAncestors)&&e.excludeAncestors.some(n=>a.closest(n))||t.add(a)});return Array.from(t)}function ji(){if(!Ha)return;let e=Us.get(Ha);if(e)for(let t of ga(e))t.classList.add("font-size-highlight")}function Ti(e){if(Qs(),!Us.get(e))return;Ha=e;let s=kt.querySelector(`.font-size-row[data-font-group="${e}"]`);s&&s.classList.add("is-previewing"),ji()}function Qs(){Ha="",kt.querySelectorAll(".font-size-row.is-previewing").forEach(e=>e.classList.remove("is-previewing")),document.querySelectorAll(".font-size-highlight").forEach(e=>e.classList.remove("font-size-highlight"))}function pc(e){if(ua.has(e))return ua.get(e);let t={inline:e.style.fontSize||"",computed:parseFloat(window.getComputedStyle(e).fontSize)||0};return ua.set(e,t),t}function mc(e){let t=ua.get(e);t&&(t.inline?e.style.fontSize=t.inline:e.style.removeProperty("font-size"))}function gc(e){let t=jt[e.id];if(Number.isFinite(t))for(let s of ga(e))pc(s),s.style.fontSize=`${t}px`}function fc(e){for(let t of ga(e))mc(t)}function ws(){for(let e of Zn){let t=Us.get(e);t&&fc(t)}Zn=new Set;for(let e of pa)Number.isFinite(jt[e.id])&&(gc(e),Zn.add(e.id));ji()}function Ei(){ws(),ys&&$s==="font-size"&&ma()}function Ni(){tr||(tr=!0,window.requestAnimationFrame(()=>{tr=!1,ws()}))}function bc(){er||!document.body||(er=new MutationObserver(e=>{if(Object.keys(jt).length){for(let t of e)if(t.type==="childList"&&(t.addedNodes.length||t.removedNodes.length)){Ni();return}}}),er.observe(document.body,{childList:!0,subtree:!0}))}function hc(e){let t=e.filter(s=>typeof s.getClientRects=="function"&&s.getClientRects().length);return t.length?t:e}function vc(){let e=pa.filter(t=>ga(t).length>0||Number.isFinite(jt[t.id]));return e.length?e:pa}function Ua(e){let t=jt[e.id];if(Number.isFinite(t))return t;let a=hc(ga(e)).map(o=>{let l=ua.get(o);return l&&l.computed?l.computed:parseFloat(window.getComputedStyle(o).fontSize)||0}).filter(o=>o>0).sort((o,l)=>o-l);if(!a.length)return e.defaultPx;let n=Math.floor(a.length/2),i=a.length%2?a[n]:(a[n-1]+a[n])/2;return nr(i)}function $c(){let e=[{id:"font-size",label:"\u5B57\u578B\u5927\u5C0F",hint:"\u8ABF\u6574\u5404\u6587\u5B57\u5340\u584A",glyph:'<span class="settings-option-aa" aria-hidden="true">Aa</span>'},{id:"theme",label:"\u4ECB\u9762\u98A8\u683C",hint:"\u5207\u63DB\u54C1\u724C\u8996\u89BA\u8A9E\u8A00",glyph:m("palette",15)}];As.innerHTML=e.map(t=>`<button class="settings-option${$s===t.id?" is-active":""}" type="button" role="tab"
        data-settings-panel="${t.id}"
        aria-selected="${$s===t.id?"true":"false"}">
        <span class="settings-option-icon">${t.glyph}</span>
        <span class="settings-option-copy">
          <strong>${r(t.label)}</strong>
          <small>${r(t.hint)}</small>
        </span>
        ${m("chevronRight",12,"settings-option-chevron")}
      </button>`).join("")}function ma(){Qs();let e=vc(),t=e.map(s=>{let a=Ga(Ua(s));return`<section class="font-size-row" data-font-group="${s.id}">
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
    </div>`}function yc(){Qs();let e=Yn(),t=Fa.map((n,i)=>{let o=n.swatches.map(l=>`<i style="--swatch:${r(l)}"></i>`).join("");return`<button class="theme-option${n.id===e?" is-active":""}" type="button" role="menuitemradio"
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
          aria-pressed="${ds===n.id?"true":"false"}"
          title="${n.id==="system"?"\u8DDF\u96A8\u7CFB\u7D71\u660E\u6697":`${n.label}\u8272\u6A21\u5F0F`}">${n.label}</button>`).join("")}
  </div>`;kt.innerHTML=`<div class="settings-panel-head">
      <div>
        <h3>\u4ECB\u9762\u98A8\u683C</h3>
        <p>\u9078\u64C7\u4E3B\u63A7\u53F0\u7684\u54C1\u724C\u8996\u89BA\u8A9E\u8A00\uFF1B\u4E3B\u984C\u6703\u7ACB\u5373\u5957\u7528\u4E26\u4FDD\u7559\u3002</p>
      </div>
      <div class="settings-panel-head-actions">
        <span class="badge badge-info">${Fa.length} \u7A2E</span>
        ${a}
      </div>
    </div>
    <div class="settings-theme-list" role="menu" aria-label="\u4ECB\u9762\u98A8\u683C">${t}</div>`,qi()}function wc(){As.querySelectorAll("[data-settings-panel]").forEach(e=>{let t=e.dataset.settingsPanel===$s;e.classList.toggle("is-active",t),e.setAttribute("aria-selected",t?"true":"false")})}function rr(e=$s){$s=e==="theme"?"theme":"font-size",wc(),$s==="theme"?yc():ma()}function ki(e,t,s){let a=Number(t);if(!Number.isFinite(a))return;let n=nr(Ai(a,e.min,e.max));jt[e.id]=n;let i=s?.querySelector(".font-size-slider");i&&(i.value=String(n));let o=s?.querySelector(".font-size-preview");o&&(o.style.fontSize=`${n}px`),Ni()}function _c(){kt.querySelectorAll(".font-size-row").forEach(e=>{let t=Us.get(e.dataset.fontGroup);if(!t)return;let s=jt[t.id]??Ua(t),a=e.querySelector(".font-size-number-input");a&&(a.value=Ga(s));let n=e.querySelector(".font-size-slider");n&&(n.value=String(s));let i=e.querySelector(".font-size-preview");i&&(i.style.fontSize=`${s}px`)})}function Si(e){let t=e.target.closest(".font-size-row");if(!t)return;let s=Us.get(t.dataset.fontGroup);if(!s)return;let a=e.target.classList.contains("font-size-number-input");if(!(a&&e.target.value==="")){if(e.type==="input"&&a){let n=Number(e.target.value);if(!Number.isFinite(n))return;ki(s,n,t);return}if(ki(s,e.target.value,t),e.type==="input"){let n=t.querySelector(".font-size-number-input");n&&document.activeElement!==n&&(n.value=Ga(jt[s.id]??Ua(s)))}}}function kc(e){if(!e.target.classList.contains("font-size-number-input"))return;let t=e.target.closest(".font-size-row"),s=t?Us.get(t.dataset.fontGroup):null;if(!s)return;let a=jt[s.id]??Ua(s);e.target.value=Ga(a)}function Sc(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Ti(t.dataset.fontGroup)}function xc(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Qs()}function Ac(e){let t=e.target.closest(".font-size-row");t&&Ti(t.dataset.fontGroup)}function Mc(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Qs()}function qc(e){let t=e.target.closest("[data-settings-panel]");if(t){rr(t.dataset.settingsPanel);return}let s=e.target.closest("[data-settings-action]");if(s){let i=s.dataset.settingsAction;if(i==="save"){cs={...jt};let o=uc();_c(),N(o?"\u5B57\u578B\u5927\u5C0F\u5DF2\u5132\u5B58\u3002":"\u5B57\u578B\u5927\u5C0F\u5DF2\u5957\u7528\uFF0C\u4F46\u700F\u89BD\u5668\u7121\u6CD5\u5132\u5B58\u8A2D\u5B9A\u3002",o?"ok":"warn");return}if(i==="cancel"){jt={...cs},ws(),ma(),N("\u5DF2\u53D6\u6D88\u672A\u5132\u5B58\u7684\u5B57\u578B\u8B8A\u66F4\u3002","info");return}i==="reset"&&(jt={},ws(),ma(),N("\u5DF2\u56DE\u5FA9\u9810\u8A2D\u5B57\u578B\uFF1B\u6309\u300C\u5132\u5B58\u300D\u4FDD\u7559\u8B8A\u66F4\u3002","info"));return}let a=e.target.closest("[data-appearance-option]");if(a){dc(a.dataset.appearanceOption);return}let n=e.target.closest(".theme-option");n&&Xn(n.dataset.themeId)}function Lc(){ys||(ys=!0,jt={...cs},document.body.classList.add("settings-open"),Gs.removeAttribute("inert"),Gs.setAttribute("aria-hidden","false"),zs.setAttribute("aria-expanded","true"),rr($s),ws(),window.requestAnimationFrame(()=>{let e=As.querySelector(".settings-option.is-active")||As.querySelector(".settings-option");e&&e.focus({preventScroll:!0})}))}function sr({restoreFocus:e=!0}={}){ys&&(ys=!1,Qs(),jt={...cs},ws(),document.body.classList.remove("settings-open"),e&&zs.focus({preventScroll:!0}),Gs.setAttribute("aria-hidden","true"),Gs.setAttribute("inert",""),zs.setAttribute("aria-expanded","false"))}function Ri(){Gs=document.getElementById("settings-sidebar"),zs=document.getElementById("settings-trigger"),kt=document.getElementById("settings-panel"),As=document.getElementById("settings-options"),wi=document.getElementById("settings-close"),!(!Gs||!zs||!kt||!As)&&(za(),Xn(Yn(),{persist:!1}),$c(),ma(),bc(),ws(),zs.addEventListener("click",()=>{ys?sr():Lc()}),wi?.addEventListener("click",()=>sr()),As.addEventListener("click",e=>{let t=e.target.closest("[data-settings-panel]");t&&rr(t.dataset.settingsPanel)}),kt.addEventListener("click",qc),kt.addEventListener("input",Si),kt.addEventListener("change",Si),kt.addEventListener("blur",kc,!0),kt.addEventListener("pointerover",Sc),kt.addEventListener("pointerout",xc),kt.addEventListener("focusin",Ac),kt.addEventListener("focusout",Mc),kt.addEventListener("keydown",e=>{e.key==="Enter"&&e.target.classList.contains("font-size-number-input")&&(e.preventDefault(),e.target.blur())}),document.addEventListener("keydown",e=>{e.key==="Escape"&&ys&&sr()}),window.addEventListener("storage",e=>{if(e.key===ar){ds=Mi(),za();return}e.key===Oa&&(cs=Li(),ys||(jt={...cs},ws()))}))}var Pi=["rag","data","quality","performance","processing","status"],Va={rag:"RAG \u63D0\u554F",data:"\u8CC7\u6599\u5EAB",quality:"\u8CC7\u6599\u54C1\u8CEA",performance:"\u6548\u80FD\u5831\u8868",processing:"\u8CC7\u6599\u8655\u7406",status:"\u7CFB\u7D71\u72C0\u614B"},Je={loaded:!1,admin:!1,enabled:!1,features:{},expiresAt:null,reason:"",me:null},Ii="judgment.demo_context.v1",jc=300*1e3;function Di(){try{let e=JSON.parse(window.localStorage.getItem(Ii)||"null");return!e||typeof e!="object"||Date.now()-Number(e.saved_at||0)>jc||typeof e.admin!="boolean"?null:e}catch{return null}}function Bi(e){return e&&(Je.admin=!!e.admin,Je.enabled=!!e.enabled,Je.features=e.features||{},Je.expiresAt=e.expiresAt||null,Je.reason=e.reason||"",Je.me=e.me||null,Je.loaded=!0),Je}function Tc(){try{window.localStorage.setItem(Ii,JSON.stringify({admin:Je.admin,enabled:Je.enabled,features:Je.features,expiresAt:Je.expiresAt,reason:Je.reason,me:Je.me,saved_at:Date.now()}))}catch{}}function Vs(){return!!Je.admin}function Ut(){return!Je.admin}function Fi(){return!!Je.enabled}function ir(e){return Je.admin?!0:e==="home"?Je.enabled:!!(Je.enabled&&Je.features?.[e])}function Ec(e){return Va[e]||e}function Wa(e){if(!e)return"\u2014";let t=Date.parse(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.round((t-Date.now())/1e3));if(s<=0)return"\u5DF2\u5230\u671F";let a=Math.floor(s/3600),n=Math.floor(s%3600/60);return a>0?`${a} \u5C0F\u6642 ${n} \u5206`:`${Math.max(1,n)} \u5206`}async function Ka(){let e=await Promise.allSettled([Q.authMe()]),t=e[0].status==="fulfilled"?e[0].value:null,s=t?.demo||await Q.demoStatus().catch(()=>null);return Je.admin=!!t?.admin,Je.enabled=!!s?.enabled,Je.features=s?.features||{},Je.expiresAt=s?.expires_at||null,Je.reason=s?.reason||"",Je.me=t,Je.loaded=!0,Tc(),Je.admin&&(Je.enabled=!1),Je}function qs(){let e=!Je.admin,t=!!Je.enabled;document.body.classList.toggle("is-demo-visitor",e&&t),document.body.classList.toggle("is-demo-closed",e&&!t),document.body.classList.toggle("is-admin",Je.admin),document.querySelectorAll("[data-route]").forEach(a=>{let n=a.dataset.route||"";if(!e){a.hidden=!1;return}if(n==="tests"){a.hidden=!0;return}a.hidden=!Je.enabled||!ir(n)});let s=document.getElementById("demo-banner");s&&(e&&t?(s.hidden=!1,s.innerHTML=`<span class="demo-banner-dot" aria-hidden="true"></span>
      <strong>\u5C55\u793A\u6A21\u5F0F</strong>
      <span>\u5269\u9918 ${r(Wa(Je.expiresAt))}</span>
      <span class="demo-banner-note">\u53EF\u700F\u89BD\u5B8C\u6574\u8CC7\u6599\u9801\uFF1B\u7BA1\u7406\u64CD\u4F5C\u5DF2\u9396\u5B9A</span>`):(s.hidden=!0,s.innerHTML=""))}function Oi(e){e.innerHTML=`<section class="page demo-closed-page">
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
  </section>`}function or(e,t){e.innerHTML=`<section class="page demo-closed-page">
    <div class="demo-state-card">
      <div class="demo-state-mark">${m("shield",22)}</div>
      <div class="eyebrow">DEMO MODE</div>
      <h1 class="page-title">\u6B64\u529F\u80FD\u76EE\u524D\u672A\u958B\u653E\u5C55\u793A</h1>
      <p class="page-subtitle">
        ${r(t==="tests"?"\u7CFB\u7D71\u6E2C\u8A66":Ec(t))}\u76EE\u524D\u7531\u7BA1\u7406\u8005\u95DC\u9589\uFF1B\u5C55\u793A\u671F\u9593\u4ECD\u53EF\u5207\u63DB\u5176\u4ED6\u5DF2\u958B\u653E\u529F\u80FD\u3002
      </p>
      <div class="demo-state-actions">
        <a class="btn btn-primary" href="#/home">\u56DE\u5230\u9996\u9801</a>
      </div>
    </div>
  </section>`}function Ya(){return`<section class="page demo-closed-page">
    <div class="demo-state-card">
      <div class="demo-state-mark">${m("shield",22)}</div>
      <div class="eyebrow">ADMIN ONLY</div>
      <h1 class="page-title">\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650</h1>
      <p class="page-subtitle">\u8ACB\u7531\u53F3\u4E0A\u89D2\u4EE5\u7BA1\u7406\u8005 Google \u5E33\u865F\u767B\u5165\u3002</p>
    </div>
  </section>`}function Ls(e,t){return`<div class="demo-lock-card">
    <span class="demo-lock-icon">${m("shield",18)}</span>
    <div class="demo-lock-copy">
      <strong>${r(e||"\u6B64\u529F\u80FD\u7531\u7BA1\u7406\u8005\u64CD\u4F5C")}</strong>
      <p>${r(t||"\u5C55\u793A\u6A21\u5F0F\u50C5\u63D0\u4F9B\u6AA2\u8996\uFF0C\u57F7\u884C\u3001\u8A2D\u5B9A\u8207\u7BA1\u7406\u6309\u9215\u5DF2\u9396\u5B9A\u3002")}</p>
      <span class="badge badge-neutral badge-mono">\u5C55\u793A\u6A21\u5F0F \xB7 \u552F\u8B80</span>
    </div>
  </div>`}var St=null,fa=0,Ms=null,Js={x:0,y:0};function Nc(){return St?.isConnected||(St=document.createElement("div"),St.className="demo-lock-tooltip",St.setAttribute("role","tooltip"),St.hidden=!0,document.body.appendChild(St)),St}function Hi(){if(!St||St.hidden)return;let e=18,t=St.getBoundingClientRect(),s=Js.x+e,a=Js.y+14;s+t.width>window.innerWidth-8&&(s=Js.x-t.width-e),a+t.height>window.innerHeight-8&&(a=Js.y-t.height-14),St.style.transform=`translate3d(${Math.round(Math.max(8,s))}px, ${Math.round(Math.max(8,a))}px, 0)`}function Rc(e){let t=String(e?.dataset.demoLockTooltip||"").trim();if(!t)return;let s=Nc();s.textContent=t,s.hidden=!1,Hi()}function Qa(){fa&&(window.clearTimeout(fa),fa=0),Ms=null,St&&(St.hidden=!0)}function Ci(e,t,s){!e||Ms===e||(Qa(),Ms=e,Js={x:t,y:s},fa=window.setTimeout(()=>{fa=0,Ms===e&&Rc(e)},200))}function Ja(){Ja.installed||(Ja.installed=!0,document.addEventListener("pointerover",e=>{let t=e.target.closest?.("[data-demo-lock-tooltip]");t&&Ci(t,e.clientX,e.clientY)}),document.addEventListener("pointermove",e=>{Ms&&(Js={x:e.clientX,y:e.clientY},St&&!St.hidden&&Hi())}),document.addEventListener("pointerout",e=>{if(!Ms)return;let t=e.relatedTarget;t&&Ms.contains?.(t)||Qa()}),document.addEventListener("focusin",e=>{let t=e.target.closest?.("[data-demo-lock-tooltip]");if(!t)return;let s=t.getBoundingClientRect();Ci(t,s.right,s.top)}),document.addEventListener("focusout",()=>Qa()),window.addEventListener("scroll",Qa,{capture:!0,passive:!0}))}var lr={};os(lr,{render:()=>Dc});var Cc=[{hours:2,label:"2 \u5C0F\u6642"},{hours:24,label:"24 \u5C0F\u6642"},{hours:168,label:"7 \u5929"}];function Pc(e,t){return`<label class="demo-toggle-row" for="demo-feature-${e}">
    <span class="demo-toggle-copy">
      <strong>${r(Va[e]||e)}</strong>
      <small>${t?"\u8A2A\u5BA2\u53EF\u4F7F\u7528\u6B64\u529F\u80FD\u7684\u552F\u8B80\uFF0F\u516C\u958B\u90E8\u5206":"\u76EE\u524D\u672A\u958B\u653E\u7D66\u8A2A\u5BA2"}</small>
    </span>
    <span class="demo-switch">
      <input type="checkbox" id="demo-feature-${e}" data-demo-feature="${e}" aria-label="${r(Va[e]||e)}" ${t?"checked":""} />
      <span aria-hidden="true"></span>
    </span>
  </label>`}function Ic(e){return e?.length?`<div class="demo-audit-list">${e.map(t=>`<div class="demo-audit-row">
        <span>${r(t.created_at||"\u2014")}</span>
        <strong>${r(t.action||"\u2014")}</strong>
        <small>${r(t.actor_email||"\u2014")}</small>
      </div>`).join("")}</div>`:'<div class="demo-empty">\u5C1A\u7121\u5207\u63DB\u7D00\u9304\u3002</div>'}async function Dc(e){if(!Vs()){e.innerHTML=Ya();return}e.innerHTML=`<section class="page admin-page">
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
  </section>`;let t=e.querySelector("#demo-admin-panel"),s=e.querySelector("#demo-admin-badge"),a=null,n=0,i=()=>{let d=t.querySelector("[data-demo-remaining]");d&&(d.textContent=Wa(a?.effective?.expires_at))},o=()=>{if(!a)return;let d=a.stored||{},p=a.effective||{},g=a.usage||{},$=d.features||{},h=!!p.enabled,u=!!a.hard_disabled;s.textContent=h?"DEMO \xB7 \u5DF2\u958B\u555F":"DEMO \xB7 \u5DF2\u95DC\u9589",s.classList.toggle("badge-ok",h),s.classList.toggle("badge-danger",!h),t.innerHTML=`<div class="report-card">
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
                <span class="notice-icon" aria-hidden="true">${m("alert",12)}</span>
                <div class="notice-body"><strong>\u74B0\u5883\u8B8A\u6578\u5F37\u5236\u95DC\u9589</strong>
                <p>JUDGMENT_DEMO_HARD_DISABLE=1\uFF0CDB \u958B\u95DC\u76EE\u524D\u7121\u6548\u3002</p></div>
              </div>`:""}
        <div class="demo-admin-stats">
          <div><span>\u5269\u9918\u6642\u9593</span><strong data-demo-remaining>${r(Wa(p.expires_at))}</strong></div>
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
          ${Pi.map(_=>Pc(_,!!$[_])).join("")}
        </div>

        <div class="demo-open-controls">
          <label class="field-label" for="demo-duration">\u958B\u653E\u6642\u9593</label>
          <select class="select" id="demo-duration">
            ${Cc.map(_=>`<option value="${_.hours}">${_.label}</option>`).join("")}
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
          ${Ic(a.audit)}
        </div>
      </div>
    </div>`;let b=t.querySelector("#demo-enabled"),v=[...t.querySelectorAll("[data-demo-feature]")],k=()=>Object.fromEntries(v.map(_=>[_.dataset.demoFeature,_.checked])),x=async(_,{enabled:y,label:I})=>{_.disabled=!0;let pe=Number(t.querySelector("#demo-duration")?.value||2),V=k();if(y&&!Object.values(V).some(Boolean)){N("\u8ACB\u81F3\u5C11\u958B\u555F\u4E00\u500B\u529F\u80FD\uFF0C\u624D\u80FD\u958B\u555F\u5C55\u793A\u3002","warn",5200),_.disabled=!1;return}try{a=await Q.updateDemo({enabled:y,duration_hours:y?pe:null,features:V,version:a?.stored?.version}),N(I,"ok",3200),o()}catch($e){N($e.message||"\u7121\u6CD5\u66F4\u65B0\u5C55\u793A\u8A2D\u5B9A\u3002","danger",6e3)}finally{_.disabled=!1}};t.querySelector("#demo-save")?.addEventListener("click",_=>{x(_.currentTarget,{enabled:!!b?.checked,label:b?.checked?"\u5C55\u793A\u8A2D\u5B9A\u5DF2\u5132\u5B58\uFF0C\u5C55\u793A\u4ECD\u7DAD\u6301\u958B\u555F\u3002":"\u5C55\u793A\u8A2D\u5B9A\u5DF2\u5132\u5B58\uFF0C\u5C55\u793A\u4ECD\u7DAD\u6301\u95DC\u9589\u3002"})}),t.querySelector("#demo-open")?.addEventListener("click",_=>{x(_.currentTarget,{enabled:!0,label:"\u5C55\u793A\u6A21\u5F0F\u5DF2\u958B\u555F\u3002"})}),t.querySelector("#demo-close")?.addEventListener("click",async _=>{let y=_.currentTarget;y.disabled=!0;try{a=await Q.closeDemo(),N("\u5C55\u793A\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok",3200),o()}catch(I){N(I.message||"\u7121\u6CD5\u95DC\u9589\u5C55\u793A\u6A21\u5F0F\u3002","danger",6e3)}finally{y.disabled=!1}}),n&&window.clearInterval(n),n=window.setInterval(i,1e3)};return await(async()=>{try{a=await Q.adminDemo(),o()}catch(d){t.innerHTML=`<div class="report-card"><div class="report-head">
        <div class="report-title-group"><div class="report-kicker">ADMIN SETTINGS</div>
        <div class="report-title">\u7121\u6CD5\u8B80\u53D6\u5C55\u793A\u8A2D\u5B9A</div>
        <div class="report-sub">${r(d.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}</div></div>
      </div></div>`}})(),()=>{n&&window.clearInterval(n),n=0}}var hr={};os(hr,{render:()=>Xc});function Bc(e){let t=e&&typeof e=="object"?e:{},s=t.judgment_total,a=t.financial_total,n=Number(s),i=Number(a),o=s!=null&&Number.isFinite(n)&&n>=0,l=a!=null&&Number.isFinite(i)&&i>=0;return{total:o?n:null,financial:l?i:null,ratio:o&&l&&n>0?i/n*100:null}}function ns(e,{loading:t=!1}={}){let s=Bc(e),a=t?"\u8B80\u53D6\u4E2D\u2026":c(s.total),n=t?"\u8B80\u53D6\u4E2D\u2026":c(s.financial),i=t?"\u8B80\u53D6\u4E2D\u2026":s.ratio===null?"\u2014":`${s.ratio.toFixed(1)}%`;return`<div class="processing-summary-card">
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
  </div>`}var cr=11,Fc=15e3,Xa=new Set,Oc=[{route:"rag",icon:"message",kicker:"RAG",title:"RAG \u63D0\u554F",summary:"\u7528\u81EA\u7136\u8A9E\u8A00\u627E\u5230\u76F8\u4F3C\u5224\u6C7A\u8207\u73FE\u884C\u6CD5\u898F\uFF0C\u56DE\u7B54\u9644\u4E0A\u53EF\u56DE\u6EAF\u7684\u5F15\u7528\u3002",metric:"Citations first",tone:"feature",wide:!0,metricKey:"rag"},{route:"data",icon:"database",kicker:"EXPLORE",title:"\u8CC7\u6599\u5EAB\u67E5\u8A62",summary:"\u8DE8 PostgreSQL\u3001Parquet\u3001Qdrant \u8207 IndexedDB \u6AA2\u8996\u539F\u59CB\u8CC7\u6599\u3002",metric:"4 \u7A2E\u8CC7\u6599\u4F86\u6E90",tone:"blue",metricKey:"data"},{route:"quality",icon:"shield",kicker:"QUALITY",title:"\u8CC7\u6599\u54C1\u8CEA",summary:"\u7528 DuckDB \u6AA2\u67E5\u539F\u59CB\u5224\u6C7A\u7684\u91CD\u8907\u3001\u7F3A\u6F0F\u8207\u5F15\u7528\u4E00\u81F4\u6027\u3002",metric:"DuckDB native",tone:"green",metricKey:"quality"},{route:"performance",icon:"activity",kicker:"OBSERVE",title:"\u6548\u80FD\u5831\u8868",summary:"\u5F9E\u55AE\u6B21 RAG \u5230\u7D22\u5F15\u5EFA\u7F6E\uFF0C\u8FFD\u8E64\u6BCF\u500B\u968E\u6BB5\u7684\u8017\u6642\u8207\u74F6\u9838\u3002",metric:"Flow \xB7 Waterfall",tone:"amber",metricKey:"performance"},{route:"processing",icon:"sliders",kicker:"PIPELINE",title:"\u8CC7\u6599\u8655\u7406",summary:"\u4E0B\u8F09\u3001\u532F\u5165\u3001\u5099\u4EFD\u8207\u7D22\u5F15\uFF0C\u96C6\u4E2D\u7BA1\u7406\u8CC7\u6599\u751F\u547D\u9031\u671F\u3002",metric:"End-to-end",tone:"violet",metricKey:"processing"},{route:"status",icon:"server",kicker:"STATUS",title:"\u7CFB\u7D71\u72C0\u614B",summary:"\u6AA2\u8996\u670D\u52D9\u5065\u5EB7\u3001\u8F09\u5165 Pipeline\u3001\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207 API \u76EE\u9304\u3002",metric:"10 \u670D\u52D9\u5143\u4EF6",tone:"slate",metricKey:"status"},{route:"tests",icon:"check",kicker:"VERIFY",title:"\u7CFB\u7D71\u6E2C\u8A66",summary:"\u8A2D\u5B9A API Base\uFF0C\u6E2C\u8A66 LLM \u6A21\u578B\u8207 Reranker \u670D\u52D9\u3002",metric:"LLM \xB7 Reranker",tone:"rose",metricKey:"tests"}];function Ws(e,t=1){let s=Number(e);return Number.isFinite(s)?`${s.toFixed(t)}%`:"\u2014"}function ur(e){let t=e?.year_min,s=e?.year_max;return!t&&!s?"\u2014":t&&s&&t!==s?`${t}\u2013${s}`:String(t||s)}function zi(e){let t=Number(e?.year_span);return Number.isFinite(t)&&t>0?`${t} \u5E74`:"\u2014"}function Hc(e){return`<a class="home-tile tone-${r(e.tone)}${e.wide?" is-wide":""}" href="#/${e.route}">
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
  </a>`}function pr(e,{loading:t=!1}={}){let s=e?.laws||{},a=n=>t?"\u8B80\u53D6\u4E2D\u2026":c(n);return`<div class="processing-summary-card">
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
  </div>`}function zc(e,{loading:t=!1}={}){if(t)return`<div class="home-live-rows is-loading">
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
      <span class="home-live-value mono">${r(ur(a))} <i>\xB7</i> ${r(zi(a))}</span>
    </div>
    <div class="home-live-row">
      <span class="home-live-label">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15</span>
      <span class="home-live-value mono">${c(n.indexed)} <i>\xB7</i> ${r(Ws(n.coverage_pct))}</span>
    </div>
  </div>`}function en(e,{loading:t=!1,error:s="",generatedAt:a=""}={}){return s?`<div class="home-live-error" role="status">
      <span class="home-live-error-icon">${m("alert",18)}</span>
      <div>
        <strong>\u5373\u6642\u6458\u8981\u66AB\u6642\u7121\u6CD5\u53D6\u5F97</strong>
        <p>${r(s)}</p>
        <button class="btn btn-secondary btn-sm" type="button" id="home-retry">
          ${m("refresh",13)}<span>\u91CD\u65B0\u8F09\u5165</span>
        </button>
      </div>
    </div>`:`${zc(e,{loading:t})}
    <div class="home-live-foot">
      <span class="home-live-source">${m("link",12)}\u53F8\u6CD5\u9662 OpenData \xB7 \u5168\u570B\u6CD5\u898F\u8CC7\u6599\u5EAB</span>
      <span class="home-live-time">${t||!a?"\u540C\u6B65\u4E2D\u2026":`\u66F4\u65B0 ${we(a)}`}</span>
    </div>`}function mr(e,{loading:t=!1}={}){if(t)return`<span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>
      <span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>
      <span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>`;let s=e?.judgments||{},a=e?.raw||{},n=e?.rag?.judgment_index||{};return`<span class="home-fact">
      <span class="home-fact-label">\u539F\u59CB\u5224\u6C7A\u5099\u4EFD</span>
      <strong>${c(a.raw_total)}</strong>
      <small>${c(a.archive_count)} \u500B archive \xB7 \u53F8\u6CD5\u9662 OpenData</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">\u91D1\u878D\u5224\u6C7A\u5E74\u4EFD</span>
      <strong>${r(ur(s))}</strong>
      <small>${r(zi(s))} \xB7 ${c(s.financial_total)} \u7B46 current</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">\u5411\u91CF\u7D22\u5F15\u8986\u84CB</span>
      <strong>${r(Ws(n.coverage_pct))}</strong>
      <small>${c(n.indexed)} / ${c(n.total)} \u7B46 \xB7 ${r(n.model||"\u2014")}</small>
    </span>`}function Za(e,t){let s=t?.laws||{},a=t?.judgments||{},n=t?.raw||{},i=t?.sources||{};if(e==="opendata"){let l=i.opendata||{};return`<article class="home-source-card">
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
        <div><dt>\u88C1\u5224\u5E74\u4EFD</dt><dd>${r(ur(a))}</dd></div>
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
  </article>`}function gr(e,{loading:t=!1,error:s=""}={}){if(t)return'<div class="home-laws-loading skeleton skeleton-card"></div>';if(s)return`<div class="home-laws-error" role="status">${m("alert",16)}<span>${r(s)}</span></div>`;let a=e?.financial_laws||{},n=Array.isArray(a.laws)?a.laws:[],i=Number(a.count)||n.length,o=Math.ceil(i/cr)||0,l=String(a.source_sha256||""),d=l?`${l.slice(0,12)}\u2026`:"\u2014",p=a.modified_at?Ht(a.modified_at):"\u2014";return`<details class="home-laws" id="home-laws">
    <summary class="home-laws-summary">
      <span class="home-laws-count">${c(i)}</span>
      <span class="home-laws-title">
        <strong>\u91D1\u878D\u6CD5\u898F\u6E05\u55AE</strong>
        <small>${r(a.source_path||"documents/\u91D1\u878D\u6CD5\u898F.md")} \xB7 ${cr} \u6B04 \xD7 ${o} \u5217</small>
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
      ${n.length?`<div class="home-laws-grid" style="--home-law-columns:${cr}" role="list">
              ${n.map((g,$)=>`<span class="home-law" role="listitem" title="${r(g)}">
                    <span class="home-law-index">${String($+1).padStart(2,"0")}</span>
                    <span class="home-law-name">${r(g)}</span>
                  </span>`).join("")}
            </div>`:'<p class="home-laws-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u6CD5\u898F\u540D\u7A31\u3002</p>'}
    </div>
  </details>`}function fr(e,{loading:t=!1,error:s=""}={}){if(t)return`<div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>`;if(s)return`<div class="home-rag-error">${m("alert",16)}<span>${r(s)}</span></div>`;let a=e?.rag||{},n=a.judgment_index||{},i=a.legal_index||{},o=a.models||{},l=Number(n.coverage_pct),d=Number.isFinite(l)?Math.max(0,Math.min(100,l)):0;return`<article class="home-rag-card">
      <span class="home-rag-kicker">JUDGMENT RETRIEVAL</span>
      <strong class="home-rag-value mono">${c(n.indexed)}<small> / ${c(n.total)}</small></strong>
      <span class="home-rag-label">\u5DF2\u7D22\u5F15 / \u91D1\u878D\u5224\u6C7A</span>
      <span class="home-rag-progress" role="img" aria-label="\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u8986\u84CB ${r(Ws(n.coverage_pct))}"><span style="width:${d.toFixed(1)}%"></span></span>
      <span class="home-rag-meta">${r(Ws(n.coverage_pct))} \xB7 ${r(n.model||"\u2014")} \xB7 ${r(n.alias||"\u2014")} \u2192 ${r(n.collection||"\u2014")}</span>
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
    </article>`}function Gc(){return`<ol class="home-rag-flow" aria-label="RAG \u57F7\u884C\u6D41\u7A0B">
    ${[["01","\u554F\u984C","1\u2013500 \u5B57","message"],["02","Embedding","bge-m3","brain"],["03","\u6AA2\u7D22","\u5224\u6C7A + \u6CD5\u898F\uFF0F\u547D\u4EE4","database"],["04","Rerank","cross-encoder","sliders"],["05","LLM","\u4F9D\u6AA2\u7D22\u5167\u5BB9\u56DE\u7B54","sparkles"],["06","\u5F15\u7528","[n] \u2192 \u539F\u59CB\u4F86\u6E90","link"]].map(([t,s,a,n])=>`<li class="home-rag-step">
          <span class="home-rag-step-icon">${m(n,17)}</span>
          <span class="home-rag-step-copy">
            <small>${t}</small>
            <strong>${r(s)}</strong>
            <span>${r(a)}</span>
          </span>
        </li>`).join("")}
  </ol>`}function Uc(){return`<div class="home-trace">
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
  </div>`}function dr(e){return e==="failed"?"\u5931\u6557":e==="skipped"?"\u7565\u904E":e==="running"?"\u57F7\u884C\u4E2D":e==="pending"?"\u7B49\u5F85":"\u5B8C\u6210"}function Qc(e,t,s,a,n,i){let o=String(e.status||"success"),l=o==="skipped"||o==="pending",d=Math.max(0,Number(e.duration_ms)||0),p=l?"\u2014":fe(d),g=o==="failed"?"var(--danger)":e.color||"#64748b",$=[`is-${o}`,o==="failed"?"is-error":"",l?"is-missing":"",i&&e.key===i?"is-slowest":""].filter(Boolean).join(" "),h=String(e.key||`stage-${t}`),u=[["\u72C0\u614B",dr(o),!0],["\u958B\u59CB",e.started_at?we(e.started_at):"\u2014",!0],["\u7D50\u675F",e.finished_at?we(e.finished_at):"\u2014",!0],["\u8017\u6642",p,!0],["\u5360\u6574\u9AD4",Ws(n),!0],["\u8AAA\u660E",e.message||e.caption||"",!1]].map(([v,k,x])=>x||k?`<span class="rag-wf-detail"><span>${r(v)}</span><strong>${r(String(k||"\u2014"))}</strong></span>`:"").join(""),b=l?"":`<span class="rag-wf-bar is-sequential" style="left:${s.toFixed(3)}%;width:${a.toFixed(4)}%;top:0;height:12px;--bar-color:${r(g)}" aria-hidden="true"></span>`;return`<details class="rag-wf-stage home-wf-stage ${$}${Xa.has(h)?" is-open":""}" data-home-wf-stage="${r(h)}"${Xa.has(h)?" open":""} style="--stage-color:${r(e.color||"#64748b")}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong><span class="home-wf-step">${String(t+1).padStart(2,"0")}</span> ${r(e.label||e.key||"\u968E\u6BB5")}${i&&e.key===i?' <span class="home-wf-slow">\u6700\u6162</span>':""}</strong>${e.caption?`<small>${r(e.caption)}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${r(p)} \xB7 ${r(dr(o))} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${e.label||e.key}\uFF1A${dr(o)}\uFF0C\u8017\u6642 ${p}\uFF0C\u5360\u6574\u9AD4 ${Ws(n)}`)}">${b}</span>
    </summary>
    <div class="rag-wf-details">${u}</div>
  </details>`}function br(e,{loading:t=!1,error:s="",clientMs:a=null}={}){if(t)return`<div class="report-card home-wf-loading" aria-live="polite">
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
    </div>`;let o=Math.max(0,Number(n.total_ms)||i.reduce((_,y)=>_+(Number(y.duration_ms)||0),0)),l=Math.max(0,Number(a)||0),d=Math.max(0,l-o),p=Math.max(o,i.reduce((_,y)=>_+(Number(y.duration_ms)||0),0),1),g=i.reduce((_,y)=>(Number(y.duration_ms)||0)>(Number(_?.duration_ms)||0)?y:_,i[0]),$=1.25,h=i.map(_=>String(_.status||"success")==="skipped"?0:Math.max((Number(_.duration_ms)||0)/p*100,$)),u=h.reduce((_,y)=>_+y,0),b=u>100?100/u:1,v=0,k=i.map((_,y)=>{let I=["skipped","pending"].includes(String(_.status||"success")),pe=I?0:h[y]*b,V=v;I||(v+=pe);let $e=p>0?(Number(_.duration_ms)||0)/p*100:0;return Qc(_,y,V,pe,$e,g?.key)}).join(""),x=i.filter(_=>_.status==="failed").length;return`<section class="report-card status-wf-card home-wf-card" data-home-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m("activity",14)}\u9996\u9801\u5373\u6642\u8CC7\u6599\u8F09\u5165 Pipeline</span>
      <span class="home-wf-links">
        <a class="home-wf-link" href="#/status">\u5B8C\u6574\u670D\u52D9 Pipeline ${m("arrowRight",11)}</a>
        <a class="home-wf-link" href="#/performance">RAG Flow ${m("arrowRight",11)}</a>
      </span>
    </div>
    <div class="index-runtime-metrics home-wf-metrics">
      <span class="index-runtime-metric" title="\u5F8C\u7AEF /api/home \u5F9E\u7B2C\u4E00\u500B\u67E5\u8A62\u5230\u56DE\u61C9\u7D44\u88DD\u5B8C\u6210\u7684\u968E\u6BB5\u7E3D\u8017\u6642\u3002"><span>\u968E\u6BB5\u7E3D\u8017\u6642</span><strong>${r(fe(o))}</strong></span>
      <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u5F9E\u9001\u51FA\u8ACB\u6C42\u5230\u6536\u5230\u56DE\u61C9\u7684\u5BE6\u969B\u5F80\u8FD4\u6642\u9593\u3002"><span>HTTP \u5F80\u8FD4</span><strong>${r(l?fe(l):"\u2014")}</strong></span>
      <span class="index-runtime-metric" title="HTTP \u5F80\u8FD4\u6263\u6389\u5F8C\u7AEF\u968E\u6BB5\u7E3D\u8017\u6642\u5F8C\u7684\u50B3\u8F38\u8207\u6392\u968A\u6642\u9593\u3002"><span>\u50B3\u8F38\uFF0F\u6392\u968A</span><strong>${r(l?fe(d):"\u2014")}</strong></span>
      <span class="index-runtime-metric" title="\u672C\u6B21\u8F09\u5165\u8017\u6642\u6700\u9577\u7684\u968E\u6BB5\uFF0C\u4E5F\u5C31\u662F\u76EE\u524D\u6700\u660E\u986F\u7684\u74F6\u9838\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${g?.label||"\u2014"} \xB7 ${fe(g?.duration_ms||0)}`)}</strong></span>
      <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${c(i.length-x)} / ${c(i.length)}${x?` \xB7 \u5931\u6557 ${c(x)}`:""}</strong></span>
      <span class="index-runtime-metric" title="\u672C\u6B21\u6458\u8981\u7684\u7522\u751F\u6642\u9593\u3002"><span>\u66F4\u65B0\u6642\u9593</span><strong>${r(n.finished_at?we(n.finished_at):"\u2014")}</strong></span>
    </div>
    <div class="status-wf-chart">
      <div class="rag-wf-axis"><span>0 ms</span><span>${r(fe(o))}</span></div>
      <div class="rag-wf-stages">${k}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u5BE6\u969B\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0Cbar \u9577\u5EA6\u70BA\u8A72\u968E\u6BB5\u8017\u6642\u5360\u6BD4\uFF1B\u6A19\u793A\u300C\u6700\u6162\u300D\u7684\u968E\u6BB5\u5373\u672C\u6B21\u8F09\u5165\u74F6\u9838\u3002\u9EDE\u64CA\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u3001\u5360\u6BD4\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function Jc(e){return`<div class="home-source-error">${m("alert",16)}<span>${r(e)}</span></div>`}function Vc(){let e=Oc.map(Hc).join("");return`<section class="page home-page" id="home-page">
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
        <div id="home-live-body" aria-live="polite">${en(null,{loading:!0})}</div>
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
          ${ns(null,{loading:!0})}
        </div>
        <div class="home-metric-group" id="home-law-metrics">
          ${pr(null,{loading:!0})}
        </div>
      </div>
      <div class="home-metric-strip" id="home-metric-strip">
        ${mr(null,{loading:!0})}
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
      ${Gc()}
      <div class="home-rag-values" id="home-rag-values">
        ${fr(null,{loading:!0})}
      </div>
      ${Uc()}
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
        ${Za("opendata",null)}
        ${Za("laws",null)}
      </div>
      <div id="home-laws-slot">
        ${gr(null,{loading:!0})}
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
        ${br(null,{loading:!0})}
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
  </section>`}function Wc(e,t){let s=t?.laws||{},a=t?.judgments||{},n=t?.raw||{},i=t?.rag?.judgment_index||{},o={rag:`${c(i.indexed)} \u7B46\u7D22\u5F15`,data:`${c(s.law_count)} \u6CD5\u898F \xB7 ${c(s.order_count)} \u547D\u4EE4`,quality:`${c(n.raw_total)} \u539F\u59CB\u5224\u6C7A`,processing:`${c(n.archive_count)} archive`,performance:"Flow \xB7 Waterfall",status:"10 \u670D\u52D9\u5143\u4EF6",tests:"LLM \xB7 Reranker"};e.querySelectorAll("[data-home-tile-metric]").forEach(l=>{let d=l.dataset.homeTileMetric;d&&o[d]&&(l.textContent=o[d])})}function Kc(e,t,{clientMs:s=null}={}){let a=t?.data||{},n=t?.generated_at||"",i=e.querySelector("#home-live-body");i&&(i.innerHTML=en(a,{generatedAt:n}));let o=e.querySelector("#home-judgment-stats"),l=a.judgments||{};o&&(o.innerHTML=ns({judgment_total:l.raw_total,financial_total:l.financial_total,financial_ratio:l.financial_ratio}));let d=e.querySelector("#home-law-metrics");d&&(d.innerHTML=pr(a));let p=e.querySelector("#home-metric-strip");p&&(p.innerHTML=mr(a));let g=e.querySelector("#home-rag-values");g&&(g.innerHTML=fr(a));let $=e.querySelector("#home-source-grid");$&&($.innerHTML=`${Za("opendata",a)}${Za("laws",a)}`);let h=e.querySelector("#home-laws-slot");if(h){let v=!!h.querySelector("#home-laws")?.open;h.innerHTML=gr(a);let k=h.querySelector("#home-laws");k&&v&&(k.open=!0)}let u=e.querySelector("#home-waterfall-slot");u&&(u.innerHTML=br({...a,pipeline:t?.pipeline},{clientMs:s})),Wc(e,a)}function Yc(e,t){let s=e.querySelector("#home-live-body");s&&(s.innerHTML=en(null,{error:t}));let a=e.querySelector("#home-judgment-stats");a&&(a.innerHTML=ns(null));let n=e.querySelector("#home-law-metrics");n&&(n.innerHTML=pr(null));let i=e.querySelector("#home-metric-strip");i&&(i.innerHTML=mr(null));let o=e.querySelector("#home-rag-values");o&&(o.innerHTML=fr(null,{error:t}));let l=e.querySelector("#home-source-grid");l&&(l.innerHTML=Jc(t));let d=e.querySelector("#home-laws-slot");d&&(d.innerHTML=gr(null,{error:t}));let p=e.querySelector("#home-waterfall-slot");p&&(p.innerHTML=br(null,{error:t}))}async function Xc(e,t){let s=!1,a=!1,n=!1,i=null,o=null,l=null,d=null,p=0;e.innerHTML=Vc();let g=e.querySelector("#home-ask-form"),$=e.querySelector("#home-question"),h=e.querySelector("#home-refresh"),u=()=>{let _=String($?.value||"").trim().slice(0,500);if(!_){$?.focus();return}try{window.sessionStorage.setItem("judgment.pending_question",_)}catch{}window.__judgmentPendingQuestion=_,t&&typeof t.navigate=="function"?t.navigate("rag"):window.location.hash="#/rag"},b=()=>{$&&($.style.height="auto",$.style.height=`${Math.min($.scrollHeight,140)}px`)},v=_=>{h&&(h.disabled=_,h.classList.toggle("is-loading",_),h.setAttribute("aria-busy",_?"true":"false"))},k=async({quiet:_=!1}={})=>{if(s)return;if(a){n=!0;return}if(a=!0,p=Date.now(),v(!0),!_){let I=e.querySelector("#home-live-body");I&&(I.innerHTML=en(null,{loading:!0}))}let y=performance.now();try{let I=await Q.homeSummary();if(s||!e.isConnected)return;o=I?.data||null,l=I?.data?.financial_laws||null,Kc(e,I,{clientMs:Math.round(performance.now()-y)})}catch(I){if(s||!e.isConnected)return;Yc(e,I.message||"\u7121\u6CD5\u53D6\u5F97\u9996\u9801\u5373\u6642\u8CC7\u6599\u3002")}finally{a=!1,v(!1),n&&!s&&(n=!1,k({quiet:!0}))}};$?.addEventListener("input",b),g?.addEventListener("submit",_=>{_.preventDefault(),u()}),$?.addEventListener("keydown",_=>{_.key==="Enter"&&!_.shiftKey&&!_.isComposing&&(_.preventDefault(),u())});let x=()=>{if(s||d)return;let _=Math.max(0,Fc-(Date.now()-p));if(_===0){k({quiet:!0});return}d=window.setTimeout(()=>{d=null,s||k({quiet:!0})},_)};if(e.addEventListener("click",_=>{if(_.target.closest("#home-refresh")||_.target.closest("#home-retry")){d&&(window.clearTimeout(d),d=null),k();return}if(_.target.closest("#home-laws-download")){let y=l?.content||`${(l?.laws||[]).join(`
`)}
`;y.trim()&&Gt("\u91D1\u878D\u6CD5\u898F.md",y)}}),e.addEventListener("toggle",_=>{let y=_.target.closest?.("[data-home-wf-stage]");if(!y||!e.contains(y))return;let I=y.dataset.homeWfStage||"";I&&(y.open?Xa.add(I):Xa.delete(I))},!0),b(),$?.focus({preventScroll:!0}),await k(),!s)try{i=_t("processing",(_,y)=>{s||y?.initial||x()},{onError:()=>{}})}catch{i=null}return()=>{s=!0,d&&(window.clearTimeout(d),d=null),typeof i=="function"&&i(),i=null}}var Ir={};os(Ir,{render:()=>Fu});var Gi="judgment-console";var vt="query_history",Xt="settings",Zt="audit_events";var ot={history:[],settings:new Map,audit:[],nextId:1},tn=null,mt=!("indexedDB"in window);function It(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function Ct(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function Dt(){return tn||(tn=new Promise((e,t)=>{if(!("indexedDB"in window)){mt=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(Gi,2)}catch(a){mt=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(vt)){let n=a.createObjectStore(vt,{keyPath:"id",autoIncrement:!0});n.createIndex("created_at","created_at"),n.createIndex("kind","kind")}if(a.objectStoreNames.contains(Xt)||a.createObjectStore(Xt,{keyPath:"key"}),!a.objectStoreNames.contains(Zt)){let n=a.createObjectStore(Zt,{keyPath:"key"});n.createIndex("created_at","created_at"),n.createIndex("dataset","dataset"),n.createIndex("jid","jid"),n.createIndex("issue_month","issue_month")}},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{mt=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{mt=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),tn)}function Ui(){return"indexedDB"in window}function Qi(){return mt}function ba(){return mt?"memory":"indexeddb"}function Zc(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},turns:Array.isArray(e.turns)?e.turns:[],pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t,updated_at:e.updated_at||t}}async function ed(){try{let t=(await Dt()).transaction(vt,"readwrite"),s=t.objectStore(vt),a=await It(s.count());if(a>120){let n=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let d=i.result;if(!d||n<=0){o();return}d.delete(),n-=1,d.continue()},i.onerror=()=>l(i.error)})}await Ct(t)}catch{mt=!0}}async function ha(e){let t=Zc(e);try{let a=(await Dt()).transaction(vt,"readwrite"),n=a.objectStore(vt),i=await It(n.add(t));return await Ct(a),await ed(),i}catch{mt=!0;let a=ot.nextId++;return ot.history.push({id:a,...t}),ot.history.length>120&&ot.history.shift(),a}}async function va(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let n=(await Dt()).transaction(vt,"readwrite"),i=n.objectStore(vt),o=await It(i.get(s));if(!o)return await Ct(n),null;let l={...o,...t,id:s};return await It(i.put(l)),await Ct(n),l}catch{mt=!0;let n=ot.history.findIndex(i=>Number(i.id)===s);return n===-1?null:(ot.history[n]={...ot.history[n],...t,id:s},ot.history[n])}}async function Ji(e){let t=Number(e);if(!Number.isFinite(t))return!1;try{let a=(await Dt()).transaction(vt,"readwrite");return a.objectStore(vt).delete(t),await Ct(a),!0}catch{mt=!0;let a=ot.history.findIndex(n=>Number(n.id)===t);return a===-1?!1:(ot.history.splice(a,1),!0)}}async function sn({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let n=(await Dt()).transaction(vt,"readonly"),i=n.objectStore(vt),o=await It(i.getAll());return await Ct(n),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,d)=>String(d.updated_at||d.created_at).localeCompare(String(l.updated_at||l.created_at))).slice(0,t)}catch{return mt=!0,ot.history.filter(n=>s?`${n.kind} ${n.title} ${n.detail}`.toLowerCase().includes(s):!0).slice().sort((n,i)=>String(i.updated_at||i.created_at).localeCompare(String(n.updated_at||n.created_at))).slice(0,t)}}async function Vi(){try{let t=(await Dt()).transaction(vt,"readwrite");t.objectStore(vt).clear(),await Ct(t)}catch{mt=!0}ot.history=[]}function td(e){let t=Number(e.id??e.event_id??0)||0,s=String(e.dataset||e.kind||"judgment"),a=String(e.key||`${s}:${t||`${Date.now()}:${Math.random().toString(36).slice(2)}`}`),n=String(e.jid||""),i=String(e.issue_month||""),o=String(e.change_type||""),l=String(e.detected_at||e.created_at||new Date().toISOString());return{key:a,event_id:t,dataset:s,jid:n,issue_month:i,change_type:o,title:String(e.title||n||i||"\u7248\u672C\u8B8A\u66F4"),detail:String(e.detail||[o,i,n].filter(Boolean).join(" \xB7 ")),created_at:l,payload:e}}async function sd(){try{let t=(await Dt()).transaction(Zt,"readwrite"),s=t.objectStore(Zt),a=await It(s.count());if(a>2e3){let n=a-2e3,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let d=i.result;if(!d||n<=0){o();return}d.delete(),n-=1,d.continue()},i.onerror=()=>l(i.error)})}await Ct(t)}catch{mt=!0}}async function Wi(e){let t=(Array.isArray(e)?e:[]).filter(s=>s&&typeof s=="object").map(td);if(!t.length)return 0;try{let a=(await Dt()).transaction(Zt,"readwrite"),n=a.objectStore(Zt);for(let i of t)await It(n.put(i));return await Ct(a),await sd(),t.length}catch{mt=!0;let a=new Map(ot.audit.map(n=>[n.key,n]));for(let n of t)a.set(n.key,n);return ot.audit=Array.from(a.values()).sort((n,i)=>String(i.created_at).localeCompare(String(n.created_at))).slice(0,2e3),t.length}}async function Ki({keyword:e="",limit:t=200}={}){let s=e.trim().toLowerCase(),a=n=>s?`${n.dataset} ${n.jid} ${n.issue_month} ${n.change_type} ${n.detail}`.toLowerCase().includes(s):!0;try{let i=(await Dt()).transaction(Zt,"readonly"),o=i.objectStore(Zt),l=await It(o.getAll());return await Ct(i),l.filter(a).sort((d,p)=>String(p.created_at).localeCompare(String(d.created_at))).slice(0,t)}catch{return mt=!0,ot.audit.filter(a).slice().sort((i,o)=>String(o.created_at).localeCompare(String(i.created_at))).slice(0,t)}}async function Yi(){let e={name:Gi,version:2,supported:"indexedDB"in window,mode:ba(),degraded:mt,stores:[vt,Xt,Zt],caps:{history:120,audit:2e3},usage_bytes:null,quota_bytes:null};if(typeof navigator<"u"&&navigator.storage?.estimate)try{let t=await navigator.storage.estimate();e.usage_bytes=Number.isFinite(t.usage)?t.usage:null,e.quota_bytes=Number.isFinite(t.quota)?t.quota:null}catch{}try{let s=(await Dt()).transaction([vt,Xt,Zt],"readonly"),a=Ct(s),[n,i,o]=await Promise.all([It(s.objectStore(vt).count()),It(s.objectStore(Xt).count()),It(s.objectStore(Zt).count()),a]);return{...e,available:!0,counts:{query_history:n,settings:i,audit_events:o},total:n+i+o}}catch{return mt=!0,{...e,available:!1,degraded:!0,mode:"memory",counts:{query_history:ot.history.length,settings:ot.settings.size,audit_events:ot.audit.length},total:ot.history.length+ot.settings.size+ot.audit.length}}}async function $a(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let n=(await Dt()).transaction(Xt,"readwrite");return n.objectStore(Xt).put(s),await Ct(n),s}catch{return mt=!0,ot.settings.set(s.key,s),s}}async function _s(e,t=null){try{let a=(await Dt()).transaction(Xt,"readonly"),n=a.objectStore(Xt),i=await It(n.get(String(e)));return await Ct(a),i?i.value:t}catch{mt=!0;let a=ot.settings.get(String(e));return a?a.value:t}}async function Xi({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await Dt()).transaction(Xt,"readonly"),n=a.objectStore(Xt),i=await It(n.getAll());return await Ct(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return mt=!0,Array.from(ot.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function Zi(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var Rr={};os(Rr,{buildFlowWaterfallStages:()=>hn,render:()=>bu,renderRagPipelineWaterfall:()=>bn,renderTestFlowPanel:()=>Zs,renderWaterfallStages:()=>Xs});var ad={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},nd=new Set(["running","stopping"]);function rn(e){let[t,s]=ad[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${r(t)}</span>`}function an(e){return String(e).padStart(2,"0")}function Ks(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${an(t.getMonth()+1)}-${an(t.getDate())} ${an(t.getHours())}:${an(t.getMinutes())}`}function nn(e){return nd.has(e)}function us(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function js(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function ks(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${r(e)}</span>
    <strong>${r(String(t))}</strong>
    ${s?`<small>${r(s)}</small>`:""}
  </div>`}function eo(e={}){let t=e.score_components||e,s=e.gate||{},a=String(s.status||""),n=a==="pass"?"Gate \u901A\u904E":a==="fail"?"Gate \u5931\u6557":a==="no_data"?"Gate \u7121\u8CC7\u6599":"";return`${n?`<span class="badge ${a==="pass"?"badge-ok":a==="fail"?"badge-danger":"badge-neutral"}">${r(n)}</span>`:""}<div class="bench-metrics">
    ${ks("Law Recall",js(t.law_recall))}
    ${ks("Article Recall",js(t.article_recall))}
    ${ks("Citation Valid",js(t.citation_valid_rate))}
    ${ks("Judge",us(t.judge_overall))}
    ${ks("Human",us(t.human_overall))}
    ${ks("p50",fe(e.duration_p50_ms))}
    ${ks("p95",fe(e.duration_p95_ms))}
    ${ks("Success",`${c(e.success||0)} / ${c(e.total||0)}`)}
  </div>`}function to(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${r(s.replace(/^rag\./,""))}</span>
      <strong>${fe(a.p50_ms)}</strong>
      <small>p95 ${fe(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function so(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${js(s.law_recall)}</span>
    <span>Article ${js(s.article_recall)}</span>
    <span>Judge ${us(s.judge_overall)}</span>
    <span>p95 ${fe(t.duration_p95_ms)}</span>`}function ao(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function no(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${r(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${r(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${r(e.status||"")}">${rn(e.status)}</span>
      <span class="mono">${r(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${r(we(e.started_at))}</span>
      <span data-bench-slot="run-completed">${c(e.completed_cases||0)} / ${c(e.total_cases||0)} \u984C</span>
      <span>${r(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${r(ao(e))}">${so(e)}</span>
  </button>`}function $r(e,t=[]){let s=e.metrics||{},a=e.judge||{},n=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([p])=>p.startsWith("rag.")).map(([p,g])=>`<span class="chip">${r(p)} ${fe(g)}</span>`).join(""),d=(e.law_sources||[]).map(p=>`<span class="chip">${r(p.law_name||"\u6CD5\u898F")} ${c((p.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${r(e.question)}</span>
      ${rn(e.status)}
      <span class="bench-case-time">${fe(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${us(i.deterministic)} \xB7 Judge ${us(i.judge)} \xB7 Human ${us(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${r((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${r(e.fingerprint||"")}">${m("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
      </div>
      <div class="bench-case-stages">${l||'<span class="qb-muted">\u6C92\u6709 stage timing</span>'}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${js(s.law_recall)}</span>
        <span>Article recall ${js(s.article_recall)}</span>
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
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(p=>`<div class="bench-history-row"><span>${r(we(p.run?.started_at))}</span><span>${r(p.run?.config?.llm_model||"\u2014")}</span><span>Det ${us(p.metrics?.scores?.deterministic)}</span><span>Judge ${us(p.metrics?.scores?.judge)}</span><span>Human ${us(p.metrics?.scores?.human)}</span><span>${fe(p.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function vr(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function ro(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${$r(e,t)}
  </details>`}function io(e){return`${rn(e.status)}
    <span class="mono">${r(e.run_id)}</span>
    ${nn(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${m("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function rd(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${r(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${m("activity",14)}${r(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${r((e.status||"")+":"+e.run_id)}">
        ${io(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${eo(e.summary||{})}</div>
    <div data-bench-detail="stages">${to(e.summary||{})}</div>
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
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>ro(a,t[a.fingerprint]||[])).join(""):Be({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function oo(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${m("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${m("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function lo(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),n=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,n-i):0,l=(t||[]).filter(b=>["success","failed"].includes(b.status)).map(b=>Number(b.duration_ms)||0).filter(b=>b>0),d=null;if(l.length)d=l.reduce((b,v)=>b+v,0)/l.length;else if(a>0){let b=Date.parse(e.updated_at||""),v=Number.isFinite(b)?b:i;Number.isFinite(v)&&v>i?d=(v-i)/a:o>0&&(d=o/a)}let p=(t||[]).find(b=>b.status==="running")||null,g=0;if(a<s&&d&&d>0){let b=p?Date.parse(p.started_at||""):NaN,v=Date.parse(e.updated_at||""),k=Number.isFinite(b)?b:v;Number.isFinite(k)&&(g=Math.max(0,Math.min(.95,(n-k)/d)))}let $=Math.min(s,a+g),h=s>0?Math.max(0,Math.min(100,$/s*100)):0,u=d===null?null:Math.max(0,s-$)*d;return{total:s,completed:a,elapsedMs:o,averageMs:d,progress:h,etaMs:u,ratePerMin:d?6e4/d:null,running:p}}function co(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${fe(e)}`}function uo(e,t=[]){let s=lo(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${r(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${c(s.completed)} / ${c(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${co(s.etaMs)}</span>
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
  </div>`}function id(e){let t=e.models?.models||{},s=e.suites||[],a=ya(e),n=e.selectedRun;return`<section class="report-card bench-card">
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
      <label class="field"><span class="field-label">Run \u6A19\u7C64</span><input class="input" name="label" value="${r(e.config.label||Ks())}" /></label>
      <div class="qb-actions" data-bench-actions data-signature="${r(a?`${a.run_id}:${a.status}`:"")}">
        ${oo(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${r(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?uo(a,yr(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>no(i,n?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${n?rd(n,e.history):""}
  </section>`}function ya(e){let t=(e.runs||[]).find(s=>nn(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!nn(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function yr(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function po(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:Ks(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",refreshStream:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),n=q=>{let A=new FormData(q);return{label:String(A.get("label")||"").trim()||Ks(),embedding_model:String(A.get("embedding_model")||""),llm_model:String(A.get("llm_model")||""),judge_model:String(A.get("judge_model")||""),top_k:Number(A.get("top_k")||4),score_threshold:Number(A.get("score_threshold")||.35),repeats:Number(A.get("repeats")||1),enable_law_retrieval:q.elements.enable_law_retrieval?.checked??!0,judge_enabled:q.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(q=>`${q.id}:${q.name}:${q.item_count}:${q.version}:${q.status}`)]:null,runs:(s.runs||[]).map(q=>`${q.run_id}:${q.label||""}:${q.suite_version||1}`)}),o=()=>{let A=a()?.querySelector("[data-bench-live]"),j=ya(s);if(!A||!j)return;let K=lo(j,yr(s,j)),ge=(je,C)=>{let ye=A.querySelector(`[data-bench-slot="${je}"]`);ye&&ye.textContent!==C&&(ye.textContent=C)};ge("progress-count",`${c(K.completed)} / ${c(K.total)} \u984C`),ge("progress-percent",`${K.progress.toFixed(1)}%`),ge("progress-eta",co(K.etaMs)),ge("progress-rate",K.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${K.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),ge("progress-elapsed",`\u5DF2\u57F7\u884C ${fe(K.elapsedMs)}`),ge("progress-average",K.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${fe(K.averageMs)}\uFF0F\u984C`),ge("progress-state",j.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let O=A.querySelector('[data-bench-slot="progress-bar"]');O&&(O.setAttribute("aria-valuenow",K.progress.toFixed(1)),O.classList.toggle("is-waiting",K.completed===0));let oe=A.querySelector('[data-bench-slot="progress-fill"]');oe&&(oe.style.width=`${K.progress.toFixed(2)}%`)},l=q=>{let A=q.querySelector("[data-bench-actions]");if(!A)return;let j=ya(s),K=j?`${j.run_id}:${j.status}`:"";A.dataset.signature!==K&&(A.dataset.signature=K,A.innerHTML=oo(j))},d=q=>{let A=q.querySelector("[data-bench-live-wrap]");if(!A)return;let j=ya(s),K=j?`${j.run_id}:${j.status}:${j.total_cases}`:"";A.dataset.signature!==K&&(A.dataset.signature=K,A.innerHTML=j?uo(j,yr(s,j)):"")},p=q=>{let A=q.querySelector("[data-bench-runs]");if(!A)return;let j=s.runs||[],K=[...A.querySelectorAll("[data-run-id]")].map(O=>O.dataset.runId),ge=j.map(O=>O.run_id);if(K.join("|")!==ge.join("|")){A.innerHTML=j.length?j.map(O=>no(O,s.selectedRun?.run_id===O.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let O of j){let oe=A.querySelector(`[data-run-id="${O.run_id}"]`);if(!oe)continue;oe.classList.toggle("is-active",s.selectedRun?.run_id===O.run_id);let je=oe.querySelector('[data-bench-slot="run-label"]');je&&je.textContent!==(O.label||"RAG Benchmark")&&(je.textContent=O.label||"RAG Benchmark");let C=oe.querySelector('[data-bench-slot="run-status"]');C&&C.dataset.status!==(O.status||"")&&(C.dataset.status=O.status||"",C.innerHTML=rn(O.status));let ye=oe.querySelector('[data-bench-slot="run-completed"]');if(ye){let qe=`${c(O.completed_cases||0)} / ${c(O.total_cases||0)} \u984C`;ye.textContent!==qe&&(ye.textContent=qe)}let te=oe.querySelector('[data-bench-slot="run-scores"]'),Se=ao(O);te&&te.dataset.signature!==Se&&(te.dataset.signature=Se,te.innerHTML=so(O))}},g=q=>{let A=s.selectedRun;if(!A)return;let j=q.querySelector(`.bench-detail[data-run-id="${A.run_id}"]`);if(!j)return;let K=j.querySelector("[data-bench-detail-actions]");if(K){let te=`${A.status||""}:${A.run_id}`;K.dataset.signature!==te&&(K.dataset.signature=te,K.innerHTML=io(A))}let ge=j.querySelector('[data-bench-detail="metrics"]');if(ge){let te=JSON.stringify(A.summary||{});ge.dataset.signature!==te&&(ge.dataset.signature=te,ge.innerHTML=eo(A.summary||{}))}let O=j.querySelector('[data-bench-detail="stages"]');if(O){let te=JSON.stringify((A.summary||{}).stages||{});O.dataset.signature!==te&&(O.dataset.signature=te,O.innerHTML=to(A.summary||{}))}let oe=j.querySelector("[data-bench-cases]");if(!oe)return;let je=A.cases||[];if(!je.length)return;let C=oe.querySelector(".notice");C&&C.remove();let ye=new Map([...oe.querySelectorAll("details.bench-case")].map(te=>[Number(te.dataset.resultId),te]));for(let te of je){let Se=s.history[te.fingerprint]||[],qe=vr(te,Se),ve=ye.get(Number(te.id));if(!ve){oe.insertAdjacentHTML("beforeend",ro(te,Se)),ve=oe.lastElementChild,ve&&(ve._benchSignature=qe);continue}if(ve._benchSignature===qe||!s.forcedCaseIds.delete(Number(te.id))&&ve.contains(document.activeElement))continue;let ce=ve.open;ve.innerHTML=$r(te,Se),ve.open=ce,ve._benchSignature=qe}},$=()=>{ya(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},h=()=>{let q=a();q&&(l(q),d(q),p(q),g(q),o(),$())},u=q=>{let A=s.selectedRun;if(!A)return;let j=q.querySelector('[data-bench-detail="metrics"]');j&&(j.dataset.signature=JSON.stringify(A.summary||{}));let K=q.querySelector('[data-bench-detail="stages"]');K&&(K.dataset.signature=JSON.stringify((A.summary||{}).stages||{}));let ge=q.querySelector("[data-bench-cases]");if(!ge)return;let O=new Map((A.cases||[]).map(oe=>[Number(oe.id),oe]));for(let oe of ge.querySelectorAll("details.bench-case")){let je=O.get(Number(oe.dataset.resultId));je&&(oe._benchSignature=vr(je,s.history[je.fingerprint]||[]))}},b=(q=!1)=>{let A=a();if(!A)return;let j=i();if(!q&&s.renderSignature===j){h();return}s.renderSignature=j,s.forcedCaseIds.clear(),A.innerHTML=id(s),u(A),h()},v=async({refreshAll:q=!1,runs:A=null}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||q;return}s.loading=!0;try{if(!s.referenceLoaded||q){let[C,ye]=await Promise.all([Q.benchmarkModels(),Q.benchmarkSuites()]);s.models=C,s.suites=ye.suites||[],s.indexVersion=C.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=C.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=C.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(C.models?.llm||[]).find(te=>te!==s.config.llm_model)||"")}let j=A?{runs:A}:await Q.benchmarkRuns(30);s.runs=j.runs||[];let K=s.activeRunId,ge=s.runs.find(C=>nn(C.status))||null;s.activeRunId=ge?.run_id||"";let O=s.selectedRun?.run_id||"";O||(O=ge?.run_id||s.runs[0]?.run_id||"");let oe=!!(s.selectedRun&&K&&s.selectedRun.run_id===K);O&&(!s.selectedRun||s.selectedRun.run_id!==O||O===ge?.run_id||oe)?s.selectedRun=await Q.benchmarkRun(O,!0):O||(s.selectedRun=null),s.loaded=!0,b()}catch(j){if(!s.loaded){s.renderSignature="";let K=a();K&&(K.innerHTML=Be({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:r(j.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let j=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,v({refreshAll:j})}}},k=()=>{s.refreshStream||(s.refreshStream=_t("benchmark",(q,A)=>{s.loading||v({runs:A?.snapshot?.runs||null})}))},x=async q=>{try{s.selectedRun=await Q.benchmarkRun(q,!0),b()}catch(A){N(A.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},_=async q=>{!s.labelTouched&&q.elements.label&&(q.elements.label.value=Ks());let A=n(q);s.config=A;let j=Number(q.elements.suite_id?.value||0);if(!j){N("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await Q.startBenchmarkRun({suite_id:j,config:A,actor:"anonymous"}),N("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=Ks(),s.labelTouched=!1,await v()}catch(K){N(K.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},y=async q=>{try{await Q.stopBenchmarkRun(q),N("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await v()}catch(A){N(A.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},I=async q=>{let A=Number(q.dataset.resultId||0),j=new FormData(q),K={};for(let ge of["correctness","grounding","citation","clarity","overall"]){let O=Number(j.get(`score_${ge}`));Number.isFinite(O)&&(K[ge]=O)}try{await Q.reviewBenchmarkResult(A,{reviewer:"anonymous",scores:K,comment:String(j.get("comment")||"")}),N("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await Q.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(A)),b()}catch(ge){N(ge.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},pe=async q=>{if(q)try{let A=await Q.benchmarkFingerprintHistory(q,50);s.history[q]=A.cases||[];let j=s.selectedRun,K=a();if(!j||!K)return;let ge=(j.cases||[]).filter(O=>O.fingerprint===q);for(let O of ge){let oe=K.querySelector(`details.bench-case[data-result-id="${O.id}"]`);if(!oe)continue;let je=oe.open;oe.innerHTML=$r(O,s.history[q]),oe.open=je,oe._benchSignature=vr(O,s.history[q])}}catch(A){N(A.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},V=async q=>{let A=q.target.closest("[data-bench-action]");if(!A)return;let j=A.dataset.benchAction;j==="open-run"?await x(A.dataset.runId||""):j==="stop"?await y(A.dataset.runId||""):j==="fingerprint-history"&&await pe(A.dataset.fingerprint||"")},$e=async q=>{let A=q.target.closest("[data-bench-form]");A&&(q.preventDefault(),A.dataset.benchForm==="run"?await _(A):A.dataset.benchForm==="human"&&await I(A))},he=q=>{q&&(q.elements.label&&q.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=n(q),q.elements.suite_id&&(s.selectedSuiteId=Number(q.elements.suite_id.value)||s.selectedSuiteId))},ae=q=>{let A=q.target.closest('[data-bench-form="run"]');A&&he(A)};return e.addEventListener("click",V),e.addEventListener("submit",$e),e.addEventListener("input",ae),e.addEventListener("change",ae),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=Ks();let q=a()?.querySelector('input[name="label"]');q&&(q.value=s.config.label)}k(),v({refreshAll:!s.referenceLoaded})},refresh(){return k(),v({refreshAll:!0})},destroy(){e.removeEventListener("click",V),e.removeEventListener("submit",$e),e.removeEventListener("input",ae),e.removeEventListener("change",ae),s.refreshStream&&s.refreshStream(),s.refreshStream=null,s.tickTimer&&window.clearInterval(s.tickTimer)}}}var qr={};os(qr,{exportCsv:()=>pn,exportableResult:()=>mn,render:()=>zd,renderReport:()=>cn,reportError:()=>un,reportLoading:()=>wa});var yo=[10,25,50,100],mo=500,od=["law_name","law_level","law_category","law_modified_date","article_count"],ld=["jid","court_normalized","title","jdate","matched_laws","citation_count"],cd={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function dn(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function on(e,t){let s={};for(let a of e.fields||[]){let n=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?n:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{},fuzzyTerms:[]}}function dd(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,n]of Object.entries(s))if(Array.isArray(n)&&!n.map(String).includes(String(t[a]??"")))return!1;return!0}function Mr(e,t){return(e.fields||[]).filter(s=>dd(s,t))}function ud(e,t){return`filter-${e.id}-${t}`}function Ts(e){return e==null?"":r(String(e))}function wr(e,t,s){let a=s[t.key],n=ud(e,t.key),i=t.help?`<span class="field-help">${r(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(d=>`<option value="${Ts(d.value)}" ${String(d.value)===String(a??"")?"selected":""}>${r(d.label??d.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${n}" name="${r(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),d=(t.options||[]).map(p=>`<label class="multi-option">
          <input type="checkbox" name="${r(t.key)}" value="${Ts(p.value)}" ${l.has(String(p.value))?"checked":""} />
          <span>${r(p.label??p.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${d}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${n}" name="${r(t.key)}"
        value="${Ts(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${Ts(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${n}" name="${r(t.key)}"
        value="${Ts(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${n}" name="${r(t.key)}"
      value="${Ts(a)}"
      placeholder="${Ts(t.placeholder||"")}" />
    ${i}
  </div>`}function go(e,t,{focusTable:s=!1}={}){let a=Mr(e,t.values),n=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(n.push(`<div class="field-row">${wr(e,o,t.values)}${wr(e,l,t.values)}</div>`),i+=1):n.push(wr(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
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
  </form>`}function ln(e,t,s){let a={...s.values};for(let n of Mr(t,a))if(n.type==="checkbox"){let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=!!i?.checked}else if(n.type==="multiselect")a[n.key]=Array.from(e.querySelectorAll(`[name="${n.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=i?i.value:""}return a}function wo(e,t){let s={};for(let a of Mr(e,t.values)){let n=t.values[a.key];a.type==="checkbox"?s[a.key]=!!n:a.type==="multiselect"?s[a.key]=Array.isArray(n)?n:[]:a.type==="number"?s[a.key]=n===""||n===null?"":Number(n):s[a.key]=n??""}return s}function _r(e,t){let s=wo(e,t);return Array.isArray(t.fuzzyTerms)&&t.fuzzyTerms.length&&(s.keywords=[...t.fuzzyTerms]),(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function pd(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${Be({tone:t,title:`${dn(e)} ${zt(e.status).label}`,text:r(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function md(e,t){return`<label class="field data-source-field">
    <span class="field-label">\u8CC7\u6599\u4F86\u6E90</span>
    <select class="select" name="database">
      ${e.map(s=>{let a=zt(s.status);return`<option value="${r(s.id)}" ${s.id===t?"selected":""}>${r(s.label)} \xB7 ${r(a.label)}</option>`}).join("")}
    </select>
  </label>`}function fo(e,t){return`<nav class="data-nav" aria-label="\u8CC7\u6599\u67E5\u8A62\u529F\u80FD">
    ${[{id:"law",label:"\u67E5\u8A62\u6CD5\u898F\u547D\u4EE4",hint:"Fuzzy \u6CD5\u898F\u540D\u7A31\u3001\u985E\u5225\u8207\u547D\u4EE4",icon:"file"},{id:"judgment",label:"\u67E5\u8A62\u5224\u6C7A",hint:"Fuzzy \u6CD5\u9662\u3001\u6848\u865F\u8207\u6848\u7531",icon:"layers"},{id:"schema",label:"\u8CC7\u6599\u5EAB Schema",hint:"\u8CC7\u6599\u8868\u3001\u6B04\u4F4D\u8207\u9810\u89BD",icon:"table"}].map(a=>{let n=a.id==="schema"?t==="schema":t==="query"&&e===a.id;return`<button class="data-nav-item${n?" is-active":""}" type="button"
          data-action="data-nav" data-tab="${a.id}" ${n?'aria-current="page"':""}>
          <span class="data-nav-icon">${m(a.icon,15)}</span>
          <span class="data-nav-copy">
            <strong>${r(a.label)}</strong>
            <small>${r(a.hint)}</small>
          </span>
        </button>`}).join("")}
  </nav>`}function gd(e,t,s){if(t.id!=="postgres"&&t.id!=="parquet")return"";let a=Array.isArray(s.fuzzyTerms)?s.fuzzyTerms:[],n=e==="law"?"Fuzzy \u6CD5\u898F\uFF0F\u547D\u4EE4":"Fuzzy \u5224\u6C7A",i=e==="law"?"\u8F38\u5165\u6CD5\u898F\u540D\u7A31\u6216\u76F8\u8FD1\u5B57\u2026":"\u8F38\u5165\u6CD5\u9662\u3001\u6848\u865F\u3001\u6848\u7531\u6216\u76F8\u8FD1\u5B57\u2026";return`<div class="data-fuzzy" data-data-fuzzy data-fuzzy-kind="${e}">
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
  </div>`}function kr(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],n=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function fd(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||r(e.detail||"")}function bd(e){return`<div class="report-empty">
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
  </div>`}function wa(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(dn(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function un(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(dn(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Be({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function hd(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,n=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${r(s.label||"\u672A\u5206\u985E")}">${r(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${n.toFixed(1)}%"></span></span>
          <span class="dist-value">${c(a)}</span>
        </div>`}).join("")}
  </div>`}function _o(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function vd(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function $d(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function yd(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${r(String(t))}"
    title="\u6AA2\u8996\u300C${r(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${r(String(t))}${m("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var wd={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function _d(e,t,s,a=!1,n=!0,i=!1){let o=a?e.key:e.label||e.key,l=n?t?wd[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${r(o)}</th>`;let d=s?.key===l,p=d?s.direction:null,g=p==="asc"?"ascending":p==="desc"?"descending":"none",$=p==="asc"?"\u2191":p==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${g}">
    <button class="table-sort${d?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${r(l)}"
      title="\u4F9D${r(o)}\u6392\u5E8F">
      <span>${r(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${$}</span>
    </button>
  </th>`}function kd(e,t){if(!_o(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,n=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(n||""),lawName:String(t.law_name||"")}}function Sd(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${r(s.lawKey)}"
    data-law-source="${r(s.sourceType)}"
    data-law-name="${r(s.lawName)}"
    title="\u6AA2\u8996\u300C${r(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(String(a))}${m("chevronRight",12,"law-link-icon")}</button>`}function ko(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:n=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],d=(e.page-1)*e.page_size,p=_o(e),g=vd(e),$=$d(e),h=e.meta?.sort||null,u=n?`<tr class="schema-search-row">
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
          ${o.map(b=>_d(b,g,h,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((b,v)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${d+v+1}</td>
                ${o.map(k=>{if((g||$)&&k.key==="jid")return`<td class="cell-jid">${yd(b)}</td>`;let x=p&&k.key==="law_name"?kd(e,b):null;if(x)return`<td>${Sd(b,k,x)}</td>`;let y={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[k.type];return`<td${y?` class="${y}"`:""}>${Da(b[k.key],k.type||"text")}</td>`}).join("")}
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
    </div>`}function xd(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${yo.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${m("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${m("chevronRight",13)}</button>
    </div>
  </div>`}function So(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${r(t)}</div>`).join("")}</div>`}function cn(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],n=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",d=e.status||"ok",p=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${r(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${r(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${r(e.label||l)}
          ${Xe(d)}
          <span class="chip">${r(p)}</span>
        </div>
        <div class="report-sub">
          ${c(i)} \u7B46\u7B26\u5408 \xB7
          ${fe(e.duration_ms)} \xB7
          ${r(String(l).toUpperCase())} / ${r(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${m("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${m("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${Be({tone:d==="not_configured"?"info":d==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:""}

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
        ${hd(n)}
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
        ${So(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?ko(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?xd({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function bo(e){return`<div class="report-card schema-preview">
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
  </div>`}function Sr(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let n=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${Be({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${r(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${r(t||e.table||"\u8CC7\u6599\u8868")}
          ${Xe(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${r(String(e.database||""))} / ${r(String(e.table||"\u2014"))} \xB7 ${n.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${ko({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${So(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${c(i.length)} \u7B46</span>
      <strong>\u5171 ${c(e.total)} \u7B46</strong>
    </div>
  </div>`}function ho(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${r(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${Be({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function Ad(e){return`<div class="report-empty">
    ${ht({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${dn(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function xr(e){return e.is_current===!0?Xe("ok","\u73FE\u884C"):e.law_abandon_note?Xe("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?Xe("empty","\u6B77\u53F2\u7248\u672C"):Xe("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function ct(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${r(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function Es(e){return e?Ht(e):"\u2014"}function Md(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function Ar(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${r(e)}</span>
    </div>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </div>`:""}function qd(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${r(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${m("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </details>`:""}function Ld(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let n=a?.name||a?.url||"";return n?a.url?`<a class="law-attachment" href="${r(a.url)}" target="_blank" rel="noopener noreferrer">
          ${m("file",12)}<span>${r(n)}</span>${m("external",11)}
        </a>`:`<span class="law-attachment">${m("file",12)}<span>${r(n)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${c(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function xo(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function jd(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,n=s?`${c(a)} \u689D \xB7 ${c(s)} \u7AE0\u7BC0`:`${c(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${r(l)}</div>`;let d=cd[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${r(xo(o.article_no))}">
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
  </div>`}function Td(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function Ys(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${m("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function Ed(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${Ys()}
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
  </div>`}function Nd(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${Ys()}
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
        ${Be({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function Rd(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let n=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",n,a.article_count_for_law?`${c(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${r(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${r(i)}</option>`}).join("")}
    </select>
  </label>`}function Cd(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let n={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${n[o]} ${c(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
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
  </details>`}function Pd(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let n=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(v=>v.article_type!=="C").length,l=Md(e),d=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",p=e.meta?.snapshot||"",g=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",$=[l,d,g,p].filter(Boolean).join(" \xB7 "),h=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",u=e.version||{},b=[ct("\u6CD5\u898F\u4F4D\u968E",r(e.law_level||"\u2014")),ct("\u6CD5\u898F\u985E\u5225",r(e.law_category||"\u2014")),ct("\u7570\u52D5\u65E5\u671F",Es(e.law_modified_date)),ct("\u751F\u6548\u65E5\u671F",Es(e.law_effective_date)),ct("\u689D\u6587\u6578",c(e.article_count)),ct("\u8CC7\u6599\u72C0\u614B",xr(e)),ct("\u82F1\u8B6F\u540D\u7A31",r(e.eng_law_name||"\u2014")),ct("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${r(e.law_key||"\u2014")}</span>`)];return u.first_seen_version_id!==null&&u.first_seen_version_id!==void 0&&b.push(ct("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${r(u.first_seen_version_id)}`)),u.last_seen_version_id!==null&&u.last_seen_version_id!==void 0&&b.push(ct("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${r(u.last_seen_version_id)}`)),u.last_seen_at&&b.push(ct("\u6700\u5F8C\u6536\u9304\u6642\u9593",r(we(u.last_seen_at)))),u.selected_version_id!==null&&u.selected_version_id!==void 0&&b.push(ct("\u689D\u6587\u7248\u672C",`#${r(u.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${Ys()}
      <span class="law-report-origin" title="${r($)}">${r($)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${r(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${r(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${r(i)}
            ${xr(e)}
            <span class="chip">${r(h)}</span>
          </div>
          <div class="report-sub">
            ${r([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${c(e.article_count)} \u689D \xB7 \u7570\u52D5 ${Es(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${Rd(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">${m("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${n.length?`<div class="report-alert">${Be({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n.map(v=>r(v)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${c(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${Es(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${r(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${xr(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${r(l)}</span>
        </div>
        <div class="law-meta-grid">${b.join("")}</div>
      </div>

      ${Cd(e)}
      ${Ar("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${qd("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${Ar("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${Ar("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${Ld(e.attachments)}
      ${jd(e)}
    </div>
    ${o>100?Td():""}
  </div>`}function Id(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Ys()}
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
  </div>`}function Dd(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Ys()}
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
        ${Be({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function Bd(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${r(t)}"
    data-law-source=""
    data-law-name="${r(t)}"
    title="\u6AA2\u8996\u300C${r(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(t)}${m("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function Fd(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let n=String(s.article_no||"").trim();n&&t.get(a).add(n)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${Bd(s)}
          <span class="judgment-citation-articles">${[...a].map(n=>r(n)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function Od(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",n=String(e.full_text||""),i=Number(e.full_text_length)||n.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[ct("\u6848\u865F",r(e.jid||"\u2014")),ct("\u5E74\u5EA6",r(e.jyear||"\u2014")),ct("\u5B57\u5225",r(e.jcase||"\u2014")),ct("\u865F\u78BC",r(e.jno||"\u2014")),ct("\u6CD5\u9662",r(e.court||"\u2014")),ct("\u6848\u7531",r(e.title||"\u2014")),ct("\u88C1\u5224\u65E5\u671F",Es(e.jdate)),ct("\u4F86\u6E90\u58D3\u7E2E\u6A94",r(e.source_archive||"\u2014")),ct("\u5168\u6587\u9577\u5EA6",`${c(i)} \u5B57`),ct("\u5F15\u7528\u6578",c(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(ct("\u532F\u5165 Run",`#${r(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Ys()}
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
            ${r(e.court||"\u2014")} \xB7 ${Es(e.jdate)} \xB7
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
          <div class="summary-value">${Es(e.jdate)}</div>
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
        ${Fd(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${c(i)} \u5B57</span>
        </div>
        ${n?`<div class="judgment-fulltext">${r(n)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function vo(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function pn(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(vo).join(",")],n=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([n+o+1,...t.map(l=>i[l.key])].map(vo).join(","))}),`\uFEFF${a.join(`\r
`)}`}function mn(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,n]of Object.entries(t))a.startsWith("_")||(s[a]=n);return s})}}function Hd(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function $o(e,t){let s=performance.now(),a=wo(e,t),n=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,d=[],p=[],g=[],$=[];if(n==="audit_events"){try{let y=Number(await _s("audit.last_event_id",0))||0,I=await Q.versioningAudit({since_id:y,limit:500}),pe=Array.isArray(I?.events)?I.events:[];pe.length&&await Wi(pe.map($e=>({...$e,dataset:"judgment"})));let V=Number(I?.latest_event_id||0);V>y&&await $a("audit.last_event_id",V)}catch(y){d.push(`\u7248\u672C audit \u540C\u6B65\u5931\u6557\uFF1A${y.message||y}`)}p=(await Ki({keyword:i,limit:mo})).map(y=>({created_at:y.created_at,dataset:y.dataset,issue_month:y.issue_month,change_type:y.change_type,jid:y.jid,detail:y.detail})),g=[{key:"created_at",label:"\u6642\u9593",type:"datetime"},{key:"dataset",label:"\u8CC7\u6599\u96C6",type:"text"},{key:"issue_month",label:"\u6708\u4EFD",type:"mono"},{key:"change_type",label:"\u8B8A\u66F4",type:"status"},{key:"jid",label:"\u6848\u865F",type:"mono"},{key:"detail",label:"\u6458\u8981",type:"longtext"}];let _=new Map;p.forEach(y=>_.set(y.change_type||"unknown",(_.get(y.change_type||"unknown")||0)+1)),$=Array.from(_.entries()).map(([y,I])=>({label:y,value:I})).sort((y,I)=>I.value-y.value)}else if(n==="settings"){p=(await Xi({keyword:i})).map(y=>({key:y.key,value:Zi(y.value),updated_at:y.updated_at})),g=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let _=new Map;p.forEach(y=>{let I=String(y.key||"").split(".")[0]||"\u5176\u4ED6";_.set(I,(_.get(I)||0)+1)}),$=Array.from(_.entries()).map(([y,I])=>({label:y,value:I})).sort((y,I)=>I.value-y.value)}else{p=(await sn({keyword:i,limit:mo})).map(y=>({kind:Hd(y.kind),title:y.title,detail:y.detail,created_at:y.created_at})),g=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let _=new Map;p.forEach(y=>_.set(y.kind,(_.get(y.kind)||0)+1)),$=Array.from(_.entries()).map(([y,I])=>({label:y,value:I})).sort((y,I)=>I.value-y.value)}let h=p.length,u=(o-1)*l,b=p.slice(u,u+l),v=Math.round(performance.now()-s),k=Qi();return k&&d.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:k?"degraded":"ok",message:k?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:n,columns:g,rows:b,total:h,page:o,page_size:l,duration_ms:v,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(h)},{label:"\u76EE\u524D\u9801\u9762",value:`${b.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:ba()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${v} ms`}],distribution:$,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${n}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${u}`,warnings:d,meta:{store:n,filters:a,client_side:!0}}}async function zd(e,t){let s=!1,a=null,n=[],i="law",o=null,l={},d=0,p=25,g="query",$=null,h=null,u=0,b=[],v=null,k=-1,x=0,_=0,y=null,I=null,pe=null;e.innerHTML=`<section class="page data-page">
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
      ${ns(null,{loading:!0})}
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
  </section>`;let V=e.querySelector("#query-sidebar"),$e=e.querySelector("#data-nav"),he=e.querySelector("#db-options-wrap"),ae=e.querySelector("#filter-area"),q=e.querySelector("#schema-area"),A=e.querySelector("#query-main"),j=e.querySelector("#schema-suggest-popover"),K=e.querySelector("#catalog-meta"),ge=e.querySelector("#refresh-catalog"),O=e.querySelector("#data-judgment-stats"),oe=M=>n.find(L=>L.id===M),je=()=>oe(i)?.databases||[],C=M=>je().find(L=>L.id===M),ye=(M,L)=>`${M}:${L}`,te=(M,L=i)=>l[ye(L,M.id)],Se=(M,L)=>{$a(M,L).catch(()=>{})},qe=()=>{if(!a){K.textContent="CATALOG \xB7 \u96E2\u7DDA",K.className="badge badge-danger badge-mono";return}let M=je(),L=M.filter(D=>D.available).length,E=oe(i);K.textContent=`CATALOG \xB7 ${E?.label||i} \xB7 ${L}/${M.length} \u53EF\u7528`,K.className="badge badge-neutral badge-mono"},ve=M=>{A.innerHTML=bd(M)},me=()=>{let M=I?.returnScroll??pe?.returnScroll;I=null,pe=null;let L=C(o),E=L?te(L):null;g==="schema"&&h?.result?A.innerHTML=Sr(h.result,Re(L,h.tableId),{columnFilters:h.columnFilters||{},searchEnabled:L.id==="postgres"||L.id==="parquet"}):E?.result?A.innerHTML=cn(E.result):L&&ve(L),typeof M=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:M,behavior:"smooth"}))},ce=(M="law-article-jump")=>{let L=A.querySelector(`#${M}`),E=xo(L?.value);if(!E){N("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),L?.focus();return}let W=[...A.querySelectorAll("[data-article-no]")].find(ee=>ee.dataset.articleNo===E);if(!W){N(`\u627E\u4E0D\u5230\u7B2C ${E} \u689D\u3002`,"warn");return}W.scrollIntoView({behavior:"instant",block:"center"}),W.classList.add("is-jump-target"),window.setTimeout(()=>W.classList.remove("is-jump-target"),2400)},se=async({lawKey:M,sourceType:L="",lawName:E="",versionId:D=""})=>{let W=C(o),ee=W?te(W):null,be=g==="schema"?h?.result:null;if(!W||!ee?.result&&!be||!M)return;let Pe=++d;I={seq:Pe,lawKey:M,sourceType:L,lawName:E,versionId:D?String(D):"",page:1,detail:null,database:W.id,returnScroll:window.scrollY},pe=null,A.innerHTML=Ed(E||M),A.scrollIntoView({behavior:"smooth",block:"start"});try{let Fe=await Q.lawDetail(M,L,I.versionId);if(s||!I||I.seq!==Pe)return;I.detail=Fe,I.page=1,A.innerHTML=Pd(Fe,{database:I.database,lawPage:I.page})}catch(Fe){if(s||!I||I.seq!==Pe)return;A.innerHTML=Nd(Fe,E||M),N(Fe.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},Te=async({jid:M})=>{let L=C(o),E=L?te(L):null,D=g==="schema"?h?.result:null;if(!L||!E?.result&&!D||!M)return;let W=++d;I=null;let ee=L.id==="parquet"?"parquet":"postgres";pe={seq:W,jid:M,detail:null,database:L.id,source:ee,returnScroll:window.scrollY},A.innerHTML=Id(M),A.scrollIntoView({behavior:"smooth",block:"start"});try{let be=await Q.judgmentDetail(M,ee);if(s||!pe||pe.seq!==W)return;pe.detail=be,A.innerHTML=Od(be,{database:pe.database})}catch(be){if(s||!pe||pe.seq!==W)return;A.innerHTML=Dd(be,M),N(be.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},xe=(M,L)=>`${i}:${M.id}:${L}`,Re=(M,L)=>(M.tables||[]).find(E=>E.id===L)?.label||L,Ce=(M,L,{sort:E=null,columnFilters:D={}}={})=>{let W={column_filters:D};return M.id==="postgres"?(W.table=L,W.schema_preview=!0):M.id==="parquet"&&i==="judgment"?(W.table="judgment_documents",W.columns=ld):M.id==="parquet"&&(W.dataset="all",W.columns=od),E?.key&&(W.sort=`${E.key}:${E.direction}`),W},P=async(M,L,{sort:E=null,columnFilters:D={},quiet:W=!1}={})=>{if(!L)return;tt();let ee=xe(M,L),be=++u,Pe=!!(W&&h?.result&&h.key===ee);$={tableId:L},h={key:ee,tableId:L,loading:!0,result:null,error:null,sort:E,columnFilters:D},Pe?A.setAttribute("aria-busy","true"):(q.innerHTML=kr(M,oe(i)?.label||i,L),A.innerHTML=bo(Re(M,L)));try{let Fe;if(M.id==="indexeddb"){let Ie=on(M,10);Ie.values.store=L,Ie.page=1,Fe=await $o(M,Ie)}else M.id==="qdrant"?Fe={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:L,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(Fe=await Q.query({database:M.id,filters:Ce(M,L,{sort:E,columnFilters:D}),page:1,pageSize:10}),E?.key&&(Fe.meta={...Fe.meta||{},sort:E}));if(s||be!==u)return;h={key:ee,tableId:L,loading:!1,result:Fe,error:null,sort:E,columnFilters:D},A.removeAttribute("aria-busy"),g==="schema"&&$?.tableId===L&&(q.innerHTML=kr(M,oe(i)?.label||i,L),A.innerHTML=Sr(Fe,Re(M,L),{columnFilters:D,searchEnabled:M.id==="postgres"||M.id==="parquet"}))}catch(Fe){if(s||be!==u)return;h={key:ee,tableId:L,loading:!1,result:null,error:Fe,sort:E,columnFilters:D},A.removeAttribute("aria-busy"),g==="schema"&&$?.tableId===L&&(A.innerHTML=ho(Fe,Re(M,L)))}},B=()=>{let M=C(o);if(!M)return null;if(g==="schema"&&h?.result)return{db:M,tableId:h.tableId,columnFilters:h.columnFilters||{},sort:h.sort||null,mode:"schema"};let L=M?te(M):null,E=L?.result;return E&&(M.id==="postgres"||M.id==="parquet")?{db:M,tableId:E.table,columnFilters:L.columnFilters||{},sort:L.sort||null,mode:"query"}:null},U=(M,L,E)=>{if(!M)return;let D=`${M.db.id}:${M.tableId}:${L}`,W=R.get(D);W&&(window.clearTimeout(W),R.delete(D)),tt();let ee={...M.columnFilters||{}},be=String(E||"").trim();if(be?ee[L]=be:delete ee[L],M.mode==="schema"){P(M.db,M.tableId,{sort:M.sort,columnFilters:ee,quiet:!0});return}let Pe=te(M.db);Pe.columnFilters=ee,Pe.page=1,Qe(1)},R=new Map,z=()=>{(!j||j.hidden)&&!b.length&&!v||(x+=1,b=[],v=null,k=-1,j&&(j.hidden=!0,j.innerHTML=""))},F=(M,L)=>{let E=String(M||""),D=E.toLocaleLowerCase(),W=String(L||"").toLocaleLowerCase(),ee=new Array(E.length).fill(!1),be=(We,st)=>{for(let dt=We;dt<We+st;dt+=1)dt>=0&&dt<ee.length&&(ee[dt]=!0)},Pe=D.indexOf(W);if(Pe>=0)for(;Pe>=0;)be(Pe,W.length),Pe=D.indexOf(W,Pe+W.length);else{let We=[];for(let st of W.match(/[一-鿿]{2,}/g)||[])for(let dt=0;dt<st.length-1;dt+=1)We.push(st.slice(dt,dt+2));We.push(...W.match(/[a-z0-9]+/g)||[]);for(let st of We){let dt=D.indexOf(st);for(;dt>=0;)be(dt,st.length),dt=D.indexOf(st,dt+st.length)}}let Fe="",Ie=0;for(;Ie<E.length;)if(ee[Ie]){let We=Ie;for(;We<E.length&&ee[We];)We+=1;Fe+=`<mark>${r(E.slice(Ie,We))}</mark>`,Ie=We}else{let We=Ie;for(;We<E.length&&!ee[We];)We+=1;Fe+=r(E.slice(Ie,We)),Ie=We}return Fe||r(E)},ke=(M,L)=>{if(!j)return;let E=M.getBoundingClientRect(),D=Math.min(420,Math.max(220,E.width)),W=Math.min(360,34+L*30),ee=E.bottom+4;ee+W>window.innerHeight-8&&(ee=Math.max(8,E.top-W-4));let be=Math.min(window.innerWidth-D-8,Math.max(8,E.left));j.style.width=`${D}px`,j.style.left=`${be}px`,j.style.top=`${ee}px`},Oe=M=>{if(!j)return;let L=[...j.querySelectorAll(".schema-suggest-item")];L.length&&(k=Math.max(0,Math.min(L.length-1,M)),L.forEach((E,D)=>{E.classList.toggle("is-active",D===k)}),L[k].scrollIntoView({block:"nearest"}))},Ye=M=>{let L=b[M],E=v;!L||!E||(z(),U(E,E.column,L))},Ue=async(M,L,E,D)=>{if(!M||!E.trim()){z();return}let W=++x;v={...M,column:L,input:D},k=-1;try{let ee=await Q.schemaSuggest({database:M.db.id,table:M.tableId,column:L,query:E,limit:1e3});if(W!==x||document.activeElement!==D||!j)return;let be=Array.isArray(ee.values)?ee.values:[];if(b=be,!be.length){z();return}let Pe=Number(ee.total)>be.length?`\u5171 ${c(ee.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${c(be.length)} \u500B`:`\u5171 ${c(ee.total)} \u500B\u7B26\u5408`;j.innerHTML=`<div class="schema-suggest-head">${r(Pe)}</div>${be.map((Fe,Ie)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${Ie}"
            title="${r(Fe)}">${F(Fe,E)}</button>`).join("")}`,ke(D,be.length),j.hidden=!1}catch{z()}},tt=()=>{let M=document.activeElement;M instanceof HTMLElement&&M.matches("[data-schema-search]")&&M.blur(),z()},ut=(M,{resetReport:L=!1}={})=>{tt();let E=te(M);if($e.innerHTML=fo(i,g),he.innerHTML=md(je(),M.id),g==="schema")ae.hidden=!0,ae.innerHTML="",q.hidden=!1,q.innerHTML=`<div class="schema-category-switch" role="tablist" aria-label="Schema \u985E\u5225">
        ${["law","judgment"].map(D=>{let W=n.find(ee=>ee.id===D);return W?`<button class="chip${i===D?" is-active":""}" type="button" role="tab" aria-selected="${i===D}" data-action="schema-category" data-category="${D}">${r(W.label)}</button>`:""}).join("")}
      </div>${kr(M,oe(i)?.label||i,$?.tableId||"")}`;else{q.hidden=!0,q.innerHTML="",ae.hidden=!1;let D=gd(i,M,E),W=go(M,E);ae.innerHTML=`${pd(M)}${D?`${D}<details class="data-advanced"><summary>\u9032\u968E metadata \u689D\u4EF6</summary>${W}</details>`:W}<div class="sidebar-note">${fd(M)}</div>`}if(qe(),g==="schema"){let D=$?xe(M,$.tableId):"";if(h&&h.key===D){let W=Re(M,h.tableId);h.loading?A.innerHTML=bo(W):h.error?A.innerHTML=ho(h.error,W):A.innerHTML=Sr(h.result,W,{columnFilters:h.columnFilters||{},searchEnabled:M.id==="postgres"||M.id==="parquet"})}else A.innerHTML=Ad(M);return}L?ve(M):E.result?A.innerHTML=cn(E.result):ve(M)},lt=(M,{persist:L=!0,resetReport:E=!1}={})=>{let D=je(),W=D.find(be=>be.id===M)||D[0];if(!W)return;I=null,pe=null,$=null,h=null,u+=1,o=W.id;let ee=ye(i,W.id);l[ee]||(l[ee]=on(W,p)),ut(W,{resetReport:E}),L&&(Se(`data.last_database.${i}`,W.id),Se("data.last_category",i))},de=(M,{persist:L=!0,resetReport:E=!0,databaseId:D=null}={})=>{let W=oe(M)||n[0];if(!W)return;i=W.id,I=null,pe=null;let ee=W.databases||[],be=D&&ee.find(Pe=>Pe.id===D)||ee.find(Pe=>Pe.id===o)||ee[0];if(o=be?.id||null,!be){$e.innerHTML=fo(i,g),he.innerHTML=`<div class="sidebar-notice">${Be({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,ae.innerHTML="",qe();return}lt(be.id,{persist:!1,resetReport:E}),L&&(Se("data.last_category",W.id),Se(`data.last_database.${W.id}`,be.id))},et=M=>{let L=te(M),E=ae.querySelector("#data-filter-form");E&&(L.values=ln(E,M,L))},Qe=async(M=null,{quiet:L=!1}={})=>{let E=C(o);if(!E)return;tt();let D=te(E);et(E),M!==null&&(D.page=M),(!Number.isFinite(D.page)||D.page<1)&&(D.page=1);let W=++d;I=null,pe=null;let ee=A.querySelector(".report-card"),be=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!ee?A.setAttribute("aria-busy","true"):(A.removeAttribute("aria-busy"),A.innerHTML=wa(E));let Fe=ae.querySelector("#run-query");L||Ne(Fe,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Ie;if(E.id==="indexeddb"?Ie=await $o(E,D):Ie=await Q.query({database:E.id,filters:_r(E,D),page:D.page,pageSize:D.pageSize}),s||W!==d)return;if(Ie.meta={...Ie.meta||{},column_filters:D.columnFilters||{},searchable:E.id==="postgres"||E.id==="parquet",sort:D.sort||Ie.meta?.sort||null},D.result=Ie,D.page=Number(Ie.page)||D.page,D.pageSize=Number(Ie.page_size)||D.pageSize,A.removeAttribute("aria-busy"),A.innerHTML=cn(Ie),be!==null){let st=A.querySelector("[data-page-size]");st&&(st.value=String(D.pageSize),st.focus({preventScroll:!0}))}let We=oe(i)?.label||i;await ha({kind:"data",title:`${We} \xB7 ${E.label} \xB7 ${Ie.table||Ie.label||"query"}`,detail:`${c(Ie.total)} \u7B46 \xB7 ${fe(Ie.duration_ms)}`,payload:{category:i,database:E.id,filters:_r(E,D),page:D.page,page_size:D.pageSize}}),Se("data.last_query",{category:i,database:E.id,filters:_r(E,D),page:D.page,page_size:D.pageSize,at:new Date().toISOString()})}catch(Ie){if(s||W!==d)return;A.removeAttribute("aria-busy"),A.innerHTML=un(Ie,E),N(Ie.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&W===d&&Ne(Fe,!1)}},it=(M,L)=>{let E=M?.querySelector("[data-data-fuzzy-results]");E&&(E.innerHTML=L.length?L.map(D=>`<button class="data-fuzzy-option" type="button" role="option" data-action="select-fuzzy-term" data-term="${r(D.value)}"><span>${r(D.label||D.value)}</span><small>${r(D.meta||"")}</small></button>`).join(""):'<div class="data-fuzzy-empty">\u6C92\u6709\u76F8\u8FD1\u7D50\u679C\uFF1B\u6309 Enter \u53EF\u76F4\u63A5\u52A0\u5165\u76EE\u524D\u8F38\u5165\u7684\u95DC\u9375\u5B57\u3002</div>')},gt=async(M,L="")=>{if(!M)return;let E=C(o),D=E?te(E):null;if(!D)return;let W=M.dataset.fuzzyKind||i,ee=M.querySelector("[data-data-fuzzy-results]"),be=++_;ee&&(ee.innerHTML='<div class="data-fuzzy-loading"><span class="spinner"></span><span>\u641C\u5C0B\u76F8\u8FD1\u7D50\u679C\u2026</span></div>');try{let Pe=await Q.dataSuggest({kind:W,query:L,limit:12});if(be!==_)return;let Fe=(Pe.suggestions||[]).filter(Ie=>!D.fuzzyTerms.includes(Ie.value));it(M,Fe)}catch(Pe){if(be!==_)return;ee&&(ee.innerHTML=`<div class="data-fuzzy-empty">${r(Pe.message||"\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},ne=(M,{focus:L=!1}={})=>{if(!M)return;let E=M.querySelector("[data-data-fuzzy-popover]"),D=M.querySelector("[data-data-fuzzy-search]");!E||!D||(E.hidden&&(E.hidden=!1,D.value="",gt(M,"")),L&&(D.focus(),D.select()))},Ae=M=>{y&&(window.clearTimeout(y),y=null);let L=M?.querySelector("[data-data-fuzzy-popover]");L&&(L.hidden=!0)},Ke=async M=>{let L=C(o);if(!L)return;let E=te(L),D=String(M||"").trim();!D||E.fuzzyTerms.includes(D)||(E.fuzzyTerms=[...E.fuzzyTerms,D],Ae(ae.querySelector("[data-data-fuzzy]")),ut(L),await Qe(1))},ze=async M=>{let L=C(o);if(!L)return;let E=te(L),D=String(M||"").trim();E.fuzzyTerms=E.fuzzyTerms.filter(W=>W!==D),ut(L),await Qe(1)},Tt=async()=>{ge.disabled=!0,Ne(ge,!0,"\u6574\u7406\u4E2D\u2026");try{let[M,L,E,D,W]=await Promise.all([Q.catalog(),_s("data.last_category","law"),_s("data.last_database.law","postgres"),_s("data.last_database.judgment","postgres"),_s("data.page_size",25)]);if(s)return;a=M,O&&(O.innerHTML=ns(a.judgment_stats)),n=Array.isArray(a.categories)?a.categories:[],p=yo.includes(Number(W))?Number(W):25;for(let Ie of n)for(let We of Ie.databases||[]){let st=ye(Ie.id,We.id);l[st]||(l[st]=on(We,p))}let ee=n.find(Ie=>Ie.id===L)||n[0];if(!ee){$e.innerHTML="",he.innerHTML=`<div class="sidebar-notice">${Be({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let be=ee.id==="judgment"?D:E;if(i=ee.id,o=null,de(ee.id,{persist:!1,resetReport:!0,databaseId:be}),s)return;let Pe=C(o),Fe=Pe?te(Pe):null;Pe&&Fe&&g==="query"&&!Fe.result&&(Pe.id==="postgres"||Pe.id==="parquet")&&Qe(1),N("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(M){if(s)return;a=null,n=[],$e.innerHTML="",O&&(O.innerHTML=ns(null)),qe(),he.innerHTML=`<div class="sidebar-notice">${Be({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:r(M.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${m("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,A.innerHTML=`<div class="report-empty">${ht({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(ge.disabled=!1,Ne(ge,!1))}};V.addEventListener("change",M=>{let L=M.target;if(L.name==="category"){de(L.value);return}if(L.name==="database"){lt(L.value);let ee=C(o),be=ee?te(ee):null;ee&&be&&!be.result&&g==="query"&&(ee.id==="postgres"||ee.id==="parquet")&&Qe(1);return}let E=C(o);if(!E)return;let D=te(E),W=ae.querySelector("#data-filter-form");!W||!L.name||(D.values=ln(W,E,D),D.page=1,L.name==="table"&&(I=null,pe=null,D.sort=null,D.columnFilters={},D.result=null,ae.innerHTML=go(E,D),ve(E)))}),V.addEventListener("input",M=>{let L=M.target.closest("[data-data-fuzzy-search]");if(L){let ee=L.closest("[data-data-fuzzy]");y&&window.clearTimeout(y),y=window.setTimeout(()=>{gt(ee,L.value)},160);return}let E=C(o);if(!E)return;let D=ae.querySelector("#data-filter-form");if(!D||!M.target.name||M.target.name==="table")return;let W=te(E);W.values=ln(D,E,W)}),V.addEventListener("keydown",M=>{let L=M.target.closest("[data-data-fuzzy-search]");if(!L)return;let E=L.closest("[data-data-fuzzy]");if(M.key==="Escape")M.preventDefault(),Ae(E),L.blur();else if(M.key==="Enter"){M.preventDefault();let D=E?.querySelector("[data-action='select-fuzzy-term']");D?D.click():Ke(L.value)}else M.key==="ArrowDown"&&(M.preventDefault(),E?.querySelector("[data-action='select-fuzzy-term']")?.focus())}),V.addEventListener("mouseover",M=>{let L=M.target.closest("[data-action='open-fuzzy']");L&&ne(L.closest("[data-data-fuzzy]"))}),V.addEventListener("mouseout",M=>{let L=M.target.closest("[data-data-fuzzy]");L&&(M.relatedTarget&&L.contains(M.relatedTarget)||Ae(L))}),V.addEventListener("submit",M=>{M.target.id==="data-filter-form"&&(M.preventDefault(),Qe(1))}),V.addEventListener("click",async M=>{let L=ae.querySelector("[data-data-fuzzy] [data-data-fuzzy-popover]:not([hidden])")?.closest("[data-data-fuzzy]");L&&!M.target.closest("[data-data-fuzzy]")&&Ae(L);let E=M.target.closest("[data-action]"),D=E?.dataset.action;if(D==="data-nav"){let W=E.dataset.tab,ee=C(o);if(W==="schema"){if(g!=="schema"){if(ee){let Ie=te(ee),We=ae.querySelector("#data-filter-form");We&&(Ie.values=ln(We,ee,Ie))}g="schema",ee&&ut(ee)}return}let be=W==="judgment"?"judgment":"law";g==="schema"&&(g="query"),i!==be?de(be,{databaseId:o,resetReport:!1}):ee&&ut(ee);let Pe=C(o),Fe=Pe?te(Pe):null;Pe&&Fe&&!Fe.result&&(Pe.id==="postgres"||Pe.id==="parquet")&&Qe(1);return}if(D==="open-fuzzy"){ne(E.closest("[data-data-fuzzy]"),{focus:!0});return}if(D==="select-fuzzy-term"){await Ke(E.dataset.term);return}if(D==="remove-fuzzy-term"){await ze(E.dataset.term);return}if(D==="schema-category"){g="schema",de(E.dataset.category||"law",{resetReport:!0});return}if(D==="select-schema-table"){let W=C(o);if(!W)return;P(W,E.dataset.tableId||"");return}if(D==="reset"){let W=C(o);if(!W)return;I=null,pe=null;let ee=te(W);l[ye(i,W.id)]=on(W,ee.pageSize),ut(W),ve(W),N("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}M.target.closest("#catalog-retry")&&Tt()}),A.addEventListener("input",M=>{let L=M.target.closest("[data-schema-search]");if(!L)return;let E=B();if(!E)return;let D=L.dataset.schemaSearch||"",W=L.value,ee=`${E.mode}:${E.db.id}:${E.tableId}:${D}`,be=R.get(ee);if(be&&window.clearTimeout(be),!W.trim()){R.delete(ee),z(),U(E,D,"");return}let Pe=window.setTimeout(()=>{R.delete(ee),Ue(E,D,W,L)},250);R.set(ee,Pe)}),A.addEventListener("keydown",M=>{let L=M.target.closest("[data-schema-search]");if(!L)return;let E=B();if(E){if(M.key==="Escape"){z();return}if(M.key==="ArrowDown"||M.key==="ArrowUp"){if(!j||j.hidden)return;M.preventDefault();let D=M.key==="ArrowDown"?1:-1;Oe(k<0?D>0?0:b.length-1:k+D);return}if(M.key==="Enter"){if(M.preventDefault(),j&&!j.hidden&&k>=0){Ye(k);return}U(E,L.dataset.schemaSearch||"",L.value)}}}),j?.addEventListener("mousedown",M=>{M.preventDefault()}),j?.addEventListener("click",M=>{let L=M.target.closest("[data-schema-suggest-index]");L&&Ye(Number(L.dataset.schemaSuggestIndex))});let ft=M=>{M.target.closest("[data-schema-search]")||j?.contains(M.target)||z()};return document.addEventListener("click",ft),window.addEventListener("scroll",z,{capture:!0,passive:!0}),window.addEventListener("resize",z),A.addEventListener("keydown",M=>{M.target.matches(".law-jump-input")&&M.key==="Enter"&&(M.preventDefault(),ce(M.target.id))}),A.addEventListener("click",async M=>{let L=M.target.closest("[data-action]");if(!L)return;let E=L.dataset.action,D=C(o),W=D?te(D):null,ee=W?.result;if(E==="back-to-results"){me();return}if(E==="open-law"){se({lawKey:L.dataset.lawKey||"",sourceType:L.dataset.lawSource||"",lawName:L.dataset.lawName||""});return}if(E==="open-judgment"){Te({jid:L.dataset.jid||""});return}if(E==="jump-article"){ce(L.dataset.jumpInput||"law-article-jump");return}if(E==="sort-column"){let be=L.dataset.sortKey||"";if(!be||!D)return;if(g==="schema"&&h?.result){let Ie=h.sort,We=be==="jdate"||be==="law_modified_date"||be==="article_count"||be==="citation_count"||be==="full_text_length"||be==="created_at"||be==="updated_at",st=Ie?.key===be?Ie.direction==="asc"?"desc":"asc":We?"desc":"asc";P(D,h.tableId,{sort:{key:be,direction:st},columnFilters:h.columnFilters||{},quiet:!0});return}if(!W)return;let Pe=W.sort,Fe=Pe?.key===be?Pe.direction==="asc"?"desc":"asc":be==="jdate"?"desc":"asc";W.sort={key:be,direction:Fe},Qe(1,{quiet:!0});return}if(E==="retry"){Qe(W?.page||1);return}if(ee){if(E==="prev-page"){Qe(Math.max(1,Number(ee.page)-1),{quiet:!0});return}if(E==="next-page"){let be=Math.max(1,Math.ceil(Number(ee.total)/Number(ee.page_size)));Qe(Math.min(be,Number(ee.page)+1),{quiet:!0});return}if(E==="copy-query"){let be=await Hs(ee.query_text||"");N(be?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",be?"ok":"warn");return}if(E==="export-json"){let be=`${ee.database}-${ee.table||"query"}-page-${ee.page}.json`;Gt(be,JSON.stringify(mn(ee),null,2),"application/json;charset=utf-8"),N(`\u5DF2\u532F\u51FA ${be}`,"ok");return}if(E==="export-csv"){let be=`${ee.database}-${ee.table||"query"}-page-${ee.page}.csv`;Gt(be,pn(ee),"text/csv;charset=utf-8"),N(`\u5DF2\u532F\u51FA ${be}`,"ok")}}}),A.addEventListener("change",M=>{let L=M.target.closest("[data-action='select-law-version']");if(L&&I){se({lawKey:I.lawKey,sourceType:I.sourceType,lawName:I.lawName,versionId:L.value});return}if(!M.target.matches("[data-page-size]"))return;let E=C(o);if(!E)return;let D=te(E);D.pageSize=Number(M.target.value)||25,D.page=1,Se("data.page_size",D.pageSize),Qe(1,{quiet:!0})}),ge.addEventListener("click",()=>{Tt()}),await Tt(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0,y&&window.clearTimeout(y);for(let M of R.values())window.clearTimeout(M);R.clear(),z(),document.removeEventListener("click",ft),window.removeEventListener("scroll",z,{capture:!0}),window.removeEventListener("resize",z)}}var Eo=[10,25,50,100],Gd=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function Lr(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function Ud(e,t=e){return`<option value="${r(e)}">${r(t)}</option>`}function _a(e,t,s,a,n=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${r(t)}</span>
      <span class="field-tag">${r(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${r(e)}">
      ${Ud("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${r(i)}" ${String(i)===String(a)?"selected":""}>${r(i)}</option>`).join("")}
    </select>
    ${n?`<span class="field-help">${r(n)}</span>`:""}
  </div>`}function Qd(e,t){let s=Gd.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${_a("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${_a("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${_a("model","\u6A21\u578B",e.models||[],t.model)}
    ${_a("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${_a("method","\u65B9\u6CD5",e.methods||[],t.method)}
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
    </div>`}function Ao(){let e=document.getElementById("performance-filter-form");if(!e)return Lr();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Mo(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function qo(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),n=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${n}.${i}`}function Jd(e,t){if(!e)return"";let s=new Date(e);return Number.isNaN(s.getTime())?"":new Date(s.getTime()+Math.max(0,Number(t)||0)).toISOString()}var Vd=[{key:"parsing",label:"Parsing",hint:"\u8F38\u5165\u9577\u5EA6\u3001\u89E3\u6790\u6642\u9593",names:["rag.parse_question"],color:"#64748b"},{key:"embedding",label:"Embedding",hint:"Model\u3001Token\u3001Batch\u3001\u8017\u6642",names:["rag.embed_query"],color:"#3984c6"},{key:"qdrant",label:"Qdrant Search",hint:"Collection\u3001Filter\u3001Top K\u3001\u8017\u6642",names:["rag.qdrant_search"],color:"#d97706"},{key:"reranker",label:"Reranker",hint:"Model\u3001\u5019\u9078\u7B46\u6578\u3001\u8017\u6642",names:["rag.rerank"],color:"#8b5cf6"},{key:"context",label:"Context",hint:"Chunk \u6578\u3001Token \u6578\u3001\u8017\u6642",names:["rag.context"],fallbackNames:["rag.fetch_documents","rag.build_citations"],color:"#64748b"},{key:"llm",label:"LLM",hint:"Model\u3001Input/Output Token\u3001TTFT\u3001\u8017\u6642",names:["rag.llm_request"],color:"#16a34a"}],fn={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"};function No(e){let t=e?.metadata?.rag_response||{},s=String(t.status||e?.metadata?.rag_status||e?.status||"");return s==="operational"||s==="success"?{label:"Completed",tone:"ok"}:s==="retrieval_only"?{label:"Abstain",tone:"warn"}:s==="preview"?{label:"Preview",tone:"info"}:s==="failed"||s==="error"?{label:"Failed",tone:"danger"}:{label:s||"Unknown",tone:"idle"}}function jr(e){let t=Math.max(0,Number(e?.offset_ms)||0),s=Math.max(0,Number(e?.duration_ms)||0),a=Math.max(t,Number(e?.end_offset_ms)||t+s);return{...e,offset:t,end:a,duration:Math.max(s,a-t)}}function Ro(e,t=0){let s=Array.isArray(e?.segments)?[...e.segments].sort((g,$)=>Number(g.offset_ms||0)-Number($.offset_ms||0)):[],a=Math.max(Number(e?.total_ms)||0,Number(t)||0,...s.map(g=>jr(g).end),1),n=Vd.map(g=>{let $=s.filter(v=>g.names.includes(v.name));!$.length&&g.fallbackNames&&($=s.filter(v=>g.fallbackNames.includes(v.name)));let h=$.map(jr),u=h.length?Math.min(...h.map(v=>v.offset)):null,b=h.length?Math.max(...h.map(v=>v.end)):null;return{...g,spans:h,start:u,end:b,duration:u===null?null:b-u}});for(let g of n){if(g.key!=="embedding"&&g.key!=="llm")continue;let $=[];for(let b of g.spans){let v=b.metadata||{},k=Number(v.load_duration_ms),x=Number.isFinite(k)&&k>0?k:0,_=Math.max(0,Number(b.duration)||0);$.push({...b,offset:b.offset,end:b.offset+x,duration:x,metadata:{...v,source_stage:g.label,model_load_ms:x,request_duration_ms:_,warm_duration_ms:Math.max(0,_-x),cold_start:x>=100},params:{...b.params||{},source_stage:g.label}})}if(!$.length)continue;let h=$.reduce((b,v)=>b+v.duration,0),u=g.spans.reduce((b,v)=>b+Math.max(0,Number(v.duration)||0),0);g.loadInfo={spans:$,total:h,requestTotal:u,ratio:u>0?Math.min(1,Math.max(0,h/u)):0}}let i=[...n],o=Math.max(0,...i.flatMap(g=>g.spans.map($=>$.end))),l=e?.metadata?.rag_response||{},d=No(e),p=Math.min(a,o);return i.push({key:"response",label:"Response",hint:"\u7E3D\u8017\u6642\u3001\u5F15\u7528\u6578\u3001\u6210\u529F\u6216 Abstain",color:"#0f766e",spans:[{offset:p,end:a,duration:Math.max(0,a-p),status:d.tone==="danger"?"error":"ok",metadata:l,params:{},started_at:e?.started_at,finished_at:e?.finished_at}],start:p,end:a,duration:Math.max(0,a-p),responseMetadata:l}),Wd(i,a),{total:a,stages:i,response:l,traceStatus:d,requestId:e?.request_id||"",startedAt:e?.started_at,finishedAt:e?.finished_at,client:e?.client||{},models:Array.isArray(e?.summary?.models)?e.summary.models:[],hasLoad:i.some(g=>!!g.loadInfo)}}function Wd(e,t){let s=e.reduce((i,o)=>i+Math.max(0,Number(o.duration)||0),0),a=s>0?t/s:1,n=0;for(let i of e){let o=Math.max(0,Number(i.duration)||0)*a;i.displayStart=n,i.displayDuration=o,i.displayEnd=n+o;let l=i.spans[0]||null,d=[],p=!1;if(l){let $=Math.max(0,Number(l.duration)||0),h=i.loadInfo?Math.max(0,Number(i.loadInfo.total)||0):0;if(i.loadInfo&&h>0&&i.spans.length===1&&$>0){let u=Math.min(l.end,l.offset+h),b=Math.max(0,u-l.offset),v=Math.max(0,l.end-u);if(b>0&&v>0){let k=Jd(l.started_at,b),x={...l,offset:l.offset,end:u,duration:b,finished_at:k,metadata:{...l.metadata||{},source_stage:i.label,model_load_ms:b,request_duration_ms:$,warm_duration_ms:Math.max(0,$-b),cold_start:b>=100},params:{...l.params||{},source_stage:i.label}},_={...l,offset:u,end:l.end,duration:v,started_at:k,finished_at:l.finished_at};d.push({kind:"load",label:"Model Load",span:x,duration:b}),d.push({kind:"stage",label:`${i.label} \u63A8\u8AD6`,span:_,duration:v}),p=!0}}p||d.push({kind:"stage",label:i.label,span:l,duration:$})}i.detailSegments=d;let g=[];if(l&&o>0)if(p){let[$,h]=d,u=$.duration+h.duration,b=u>0?o*($.duration/u):0,v={...i,key:"model_load",label:`Model Load \xB7 ${i.label}`,spans:[$.span],duration:$.duration},k={...i,label:`${i.label} \u63A8\u8AD6`,spans:[h.span],duration:h.duration};g.push({offset:n,duration:b,color:"#0ea5e9",kind:"load",tip:gn(v,$.span)}),g.push({offset:n+b,duration:Math.max(0,o-b),color:i.color,kind:"stage",tip:gn(k,h.span,{includeLoad:!1})})}else g.push({offset:n,duration:o,color:i.color,kind:"stage",tip:gn(i,l)});i.displaySegments=g,n+=o}}function Tr(e,{includeLoad:t=!0}={}){let s=[],a=(g,$)=>{$==null||$===""||s.push([g,String($)])},n=e.spans[0]||null;if(!n)return a("\u72C0\u614B","\u6B64\u7D00\u9304\u6C92\u6709\u9019\u500B span"),s;let i=n.params||{},o=n.metadata||{},l=Co(n),d=Er(n),p=(g,$)=>{let h=Number(g?.load_duration_ms);if(!Number.isFinite(h))return;let u=Math.max(0,h);a("Model Load",fe(u)),a("\u51B7\u555F\u52D5",u>=100?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09");let b=Math.max(0,Number($)||0);if(b>0){let v=Math.max(0,b-u);a("\u6263\u9664\u8F09\u5165\u5F8C",fe(v)),a("\u8F09\u5165\u5360\u6BD4",`${(u/b*100).toFixed(u/b>=.1?0:1)}%`)}};if(e.key==="response")return a("Trace \u72C0\u614B",e.responseMetadata.status||"\u2014"),a("Answer source",e.responseMetadata.answer_source||"\u2014"),a("Abstain",e.responseMetadata.abstain?"\u662F":"\u5426"),a("\u5F15\u7528\u7E3D\u6578",e.responseMetadata.citation_count??"\u2014"),a("\u5224\u6C7A\uFF0F\u6CD5\u898F\u5F15\u7528",`${e.responseMetadata.judgment_citations??"\u2014"} / ${e.responseMetadata.law_citations??"\u2014"}`),a("\u7E3D\u8017\u6642",fe(e.duration)),s;if(a("\u958B\u59CB",`${qo(n.started_at)||"\u2014"} \xB7 +${n.offset.toFixed(1)} ms`),a("\u7D50\u675F",`${qo(n.finished_at)||"\u2014"} \xB7 +${n.end.toFixed(1)} ms`),a("\u8017\u6642",fe(n.duration)),e.key==="parsing")a("\u8F38\u5165\u9577\u5EA6",o.input_length??i.input_length),a("\u6B63\u898F\u5316\u9577\u5EA6",o.normalized_length??i.normalized_length),a("\u79FB\u9664\u7A7A\u767D",o.trimmed_chars);else if(e.key==="embedding")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.active_base_url||o.base_url),a("Input tokens",o.prompt_eval_count),a("Batch",o.batch),a("\u5411\u91CF\u7DAD\u5EA6",o.dimensions),a("Fallback",o.fallback_used?"\u662F":"\u5426"),t&&p(o,n.duration);else if(e.key==="qdrant")a("Collection",o.collection||i.collection),o.filter&&a("Filter",Mo(o.filter)),a("Top K",o.top_k??i.limit),a("Hits",o.hits),a("Unique judgments",o.unique_judgments),a("Top score",o.top_score);else if(e.key==="reranker")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Rerank \u72C0\u614B",o.status),a("Fallback",o.fallback_used?"\u662F":"\u5426"),a("\u5019\u9078\u7B46\u6578",o.candidates),a("\u9078\u7528\u7B46\u6578",o.selected),a("Top score",o.top_score),Array.isArray(o.errors)&&o.errors.length&&a("\u932F\u8AA4",o.errors.join(" \xB7 "));else if(e.key==="context")a("Chunks",o.chunks),a("\u5224\u6C7A chunks",o.judgment_chunks),a("\u6CD5\u898F chunks",o.law_chunks),a("Token \u4F30\u7B97",o.token_estimate),a("Context \u5B57\u5143",o.context_chars),a("\u6587\u4EF6\u6578",o.documents);else if(e.key==="llm")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Input tokens",o.input_tokens),a("Output tokens",o.output_tokens),a("TTFT",o.ttft_ms===null||o.ttft_ms===void 0?"\u2014":fe(o.ttft_ms)),a("API \u7E3D\u8017\u6642",o.total_duration_ms===null||o.total_duration_ms===void 0?"\u2014":fe(o.total_duration_ms)),t&&p(o,n.duration),a("Strict retry",o.strict?"\u662F":"\u5426");else if(e.key==="model_load"){if(a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("\u4F86\u6E90\u968E\u6BB5",o.source_stage),a("\u51B7\u555F\u52D5",o.cold_start?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09"),a("\u6A21\u578B\u547C\u53EB\u7E3D\u8017\u6642",o.request_duration_ms===null||o.request_duration_ms===void 0?"\u2014":fe(o.request_duration_ms)),a("\u8F09\u5165\u8017\u6642",o.model_load_ms===null||o.model_load_ms===void 0?"\u2014":fe(o.model_load_ms)),a("\u6263\u9664\u8F09\u5165\u5F8C\u6D41\u7A0B\u6642\u9593",o.warm_duration_ms===null||o.warm_duration_ms===void 0?"\u2014":fe(o.warm_duration_ms)),Number(o.request_duration_ms)>0&&Number(o.model_load_ms)>=0){let g=Number(o.model_load_ms)/Number(o.request_duration_ms)*100;a("\u8F09\u5165\u5360\u6BD4",`${g.toFixed(g>=10?0:1)}%`)}o.eval_duration_ms!==null&&o.eval_duration_ms!==void 0&&a("\u63A8\u8AD6\u8017\u6642",fe(o.eval_duration_ms))}else if(e.key==="segment"||e.key==="test_stage")if(a("Model",d||o.model||i.model),a("\u72C0\u614B",o.status||n.status),e.key==="test_stage")a("\u9032\u5EA6",o.progress===null||o.progress===void 0?"":`${Number(o.progress)||0}%`),n.error&&a("\u932F\u8AA4",n.error);else{n.error&&a("\u932F\u8AA4",n.error);for(let[g,$]of Object.entries(i).slice(0,10))a(g,Mo($))}return e.spans.length>1&&(e.key==="model_load"?a("\u5404\u6A21\u578B\u8F09\u5165",e.spans.map(g=>`${g.metadata?.source_stage||"model"} ${Er(g)} ${fe(g.metadata?.model_load_ms||0)}`).join(" \xB7 ")):(a("Span \u6578",e.spans.length),a("Span \u660E\u7D30",e.spans.map((g,$)=>`#${$+1} +${g.offset.toFixed(0)}ms/${fe(g.duration)}`).join(" \xB7 ")))),n.module&&a("Module",n.module),n.function&&a("Function",n.function),s}function Kd(e){let t=String(e||"").trim();if(!t)return"";try{return new URL(t.includes("://")?t:`http://${t}`).hostname||t}catch{return t}}function Co(e){let t=e?.metadata||{},s=String(t.provider_name||"").trim();if(s)return s;let a=String(t.active_base_url||t.base_url||e?.params?.url||"").trim();return Kd(a)}function Yd(e){let t=e?.metadata||{};return String(t.model||e?.params?.model||"").trim()}function Er(e){let t=Co(e),s=Yd(e);return s?t?`${t}:${s}`:s:""}function Xd(e){let t=new Set;for(let s of e?.spans||[]){let a=Er(s);a&&t.add(a)}return[...t]}function gn(e,t,s={}){let a=Tr({...e,spans:[t]},s);return[String(e.label||""),...a.map(([n,i])=>`${n}: ${i}`)].join(`
`)}function Zd(e,t){let s=e.spans||[],a=Xd(e),n=Array.isArray(e.displaySegments)?e.displaySegments:null,i=7,o=Math.max(1,Math.min(4,s.length)),l=s.length>1,d=n?12:l?Math.max(12,o*i):12,p=n?n.map(k=>{if(Number(k.duration)<=0)return"";let x=Math.max(0,Math.min(100,k.offset/t*100)),_=Math.min(100-x,k.duration/t*100);return`<span class="rag-wf-bar is-sequential${k.kind==="load"?" is-load":""}" style="left:${x.toFixed(3)}%;width:${_.toFixed(4)}%;top:0;height:12px;--bar-color:${k.color}"
            data-rag-wf-tip="${r(k.tip)}"
            aria-label="${r(k.tip)}" role="img"></span>`}).join(""):s.slice(0,4).map((k,x)=>{if(Number(k.duration)<=0)return"";let _=Math.max(0,Math.min(100,k.offset/t*100)),y=Math.max(.35,Math.min(100-_,k.duration/t*100)),I=l?x*i:0,pe=l?6:12,V=gn(e,k);return`<span class="rag-wf-bar" style="left:${_.toFixed(3)}%;width:${y.toFixed(3)}%;top:${I}px;height:${pe}px"
            data-rag-wf-tip="${r(V)}"
            aria-label="${r(V)}" role="img"></span>`}).join(""),g=Array.isArray(e.detailSegments)?e.detailSegments:[],$=g.length>1?g.map(k=>{let x=k.kind==="load"?{...e,key:"model_load",label:`Model Load \xB7 ${e.label}`,spans:[k.span],duration:k.duration}:{...e,label:`${e.label} \u63A8\u8AD6`,spans:[k.span],duration:k.duration},_=Tr(x,{includeLoad:k.kind!=="stage"});return`<div class="rag-wf-detail-group">
              <div class="rag-wf-detail-group-head">
                <strong>${r(k.label)}</strong>
                <span>${r(fe(k.duration))}</span>
              </div>
              <div class="rag-wf-detail-grid">${_.map(([y,I])=>`<span class="rag-wf-detail"><span>${r(y)}</span><strong>${r(I)}</strong></span>`).join("")}</div>
            </div>`}).join(""):"",h=Tr(e).map(([k,x])=>`<span class="rag-wf-detail"><span>${r(k)}</span><strong>${r(x)}</strong></span>`).join(""),u=g.length>1?`<div class="rag-wf-details is-split">${$}</div>`:`<div class="rag-wf-details">${h}</div>`,b=s.length?s.some(k=>k.status==="error")?"is-error":"":"is-missing",v=s.length?fe(e.duration):"\u672A\u8A18\u9304";return`<details class="rag-wf-stage ${b}" style="--stage-color:${e.color}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong>${r(e.label)}</strong><small>${r(e.hint)}</small>${a.length?`<small class="rag-wf-model-line">${r(a.join(" \xB7 "))}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${v} \xB7 ${s.length?`${s.length} span`:"\u2014"} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:${d}px">${p}</span>
    </summary>
    ${u}
  </details>`}function Po(e,t,s=!1){let a=e.response||{},n=e.client||{},i=e.models||[];return`<div class="rag-wf-summary">
      <span>\u7E3D\u8017\u6642 <strong>${r(fe(e.total))}</strong></span>
      <span>Server <strong>${r(fe(t))}</strong></span>
      ${n.total_ms?`<span>Client <strong>${r(fe(n.total_ms))}</strong></span>`:""}
      ${n.render_ms!==void 0?`<span>Render <strong>${r(fe(n.render_ms))}</strong></span>`:""}
      <span>\u5F15\u7528 <strong>${r(String(a.citation_count??"\u2014"))}</strong></span>
      <span>Abstain <strong>${a.abstain?"\u662F":"\u5426"}</strong></span>
      ${i.length?`<span>Model <strong>${r(i.join(" \xB7 "))}</strong></span>`:""}
      ${s?'<span class="rag-wf-updating">\u66F4\u65B0\u4E2D\u2026</span>':""}
    </div>`}function Xs(e,t,s="\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\uFF0C\u67E5\u770B\u53C3\u6578\u3001Token\u3001TTFT\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u4F86\u6E90\u6578\u91CF\u3002Waterfall \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u5E73\u884C\u57F7\u884C\u7684 span \u6703\u4F9D\u5BE6\u969B\u6642\u9593\u91CD\u758A\u986F\u793A\u3002",{legend:a=""}={}){return`<div class="rag-wf-axis"><span>0 ms</span><span>${r(fe(t))}</span></div>
    ${a}
    <div class="rag-wf-stages">${(e||[]).map(n=>Zd(n,t)).join("")}</div>
    <p class="rag-wf-hint">${r(s)}</p>`}function Io(e){let t=(e.stages||[]).some(n=>n.loadInfo),s=t?'<div class="rag-wf-legend"><span><i class="is-load"></i>Model Load\uFF08\u968E\u6BB5 bar \u524D\u6BB5\uFF09</span></div>':"",a=t?"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\uFF1BEmbedding\uFF0FLLM \u7684\u85CD\u8272\u524D\u6BB5\u70BA Model Load\uFF0C\u5F8C\u6BB5\u70BA\u63A8\u8AD6\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001Token \u8207\u8F09\u5165\u5360\u6BD4\u53EF\u5C55\u958B\u67E5\u770B\u3002":"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207 Token \u53EF\u5C55\u958B\u67E5\u770B\u3002";return Xs(e.stages,e.total,a,{legend:s})}function bn(e,{serverDurationMs:t=0,loading:s=!1,embedded:a=!1}={}){if(!e||typeof e!="object")return"";let n=Ro(e,t),i=n.traceStatus;return`<section class="report-card rag-wf-card${a?" rag-wf-embedded":""}">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${fn[i.tone]||fn.idle}">${r(i.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(n.requestId||"\u2014")}</span>
          \xB7 ${r(we(n.startedAt))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <a class="btn btn-secondary btn-sm" href="#/performance">
          ${m("activity",14)}<span>\u5B8C\u6574 Flow</span>
        </a>
      </div>
    </div>
    ${Po(n,t,s)}
    ${Io(n)}
  </section>`}var xt=null;function eu(){return xt||(xt=document.createElement("div"),xt.className="rag-wf-tooltip",xt.hidden=!0,document.body.appendChild(xt),xt)}function Nr(){xt&&(xt.hidden=!0)}function Do(e){if(!xt||xt.hidden)return;let t=14,s=10,a=xt.getBoundingClientRect(),n=e.clientX+t,i=e.clientY+t;n+a.width>window.innerWidth-s&&(n=e.clientX-a.width-t),i+a.height>window.innerHeight-s&&(i=e.clientY-a.height-t),xt.style.left=`${Math.max(s,n)}px`,xt.style.top=`${Math.max(s,i)}px`}document.addEventListener("pointerover",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=eu(),a=t.dataset.ragWfTip||"";a&&(s.textContent=a,s.hidden=!1,Do(e))});document.addEventListener("pointermove",e=>{if(!(!xt||xt.hidden)){if(!e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]")){Nr();return}Do(e)}});document.addEventListener("pointerout",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=e.relatedTarget;s instanceof Node&&t.contains(s)||Nr()});window.addEventListener("scroll",Nr,{capture:!0,passive:!0});function tu(e,t,s,a){if(a&&!e.length)return`<div class="report-card rag-wf-card">
      ${Be({tone:"danger",title:"RAG Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">${m("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;if(!e.length)return`<div class="report-card rag-wf-card">
      ${ht({iconName:"activity",title:s?"\u8B80\u53D6 RAG Pipeline\u2026":"\u5C1A\u7121 RAG Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684 RAG \u554F\u7B54 Trace\u3002":"\u7522\u751F\u65B0\u7684 RAG \u554F\u7B54\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A Parsing\u3001Embedding\u3001Qdrant\u3001Context\u3001LLM \u8207 Response \u7684 waterfall\u3002"})}
    </div>`;let n=e.find(p=>String(p.id)===String(t))||e[0],i=n.flow&&typeof n.flow=="object"?n.flow:{},o=Ro(i,n.duration_ms),l=o.traceStatus,d=e.map(p=>{let g=No(p.flow||{});return`<option value="${r(String(p.id))}" ${String(p.id)===String(n.id)?"selected":""}>#${r(String(p.id))} \xB7 ${r(we(p.started_at))} \xB7 ${r(fe(p.duration_ms))} \xB7 ${r(g.label)}</option>`}).join("");return`<section class="report-card rag-wf-card">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${fn[l.tone]||fn.idle}">${r(l.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(o.requestId||n.request_id||"\u2014")}</span>
          \xB7 ${r(we(n.started_at))}
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
    ${Po(o,n.duration_ms,s)}
    ${Io(o)}
  </section>`}function su(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},n=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?fe(a.avg_total_ms??0):"\u2014",o=a.samples?fe(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
  </div>`}function $t(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),n=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(n).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:n?`${n}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function Bo(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function au(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let n=Number(a.points_per_second)||0,i=Math.max(2,n/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${r(Bo(a))}</strong>
          <span>${r(we(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${r(`${c(a.indexed_count)} \u7B46 \xB7 ${$t(a.duration_ms)} \xB7 ${c(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${n.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${c(a.indexed_count)} \u7B46 \xB7 ${$t(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function nu(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${r(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${r(`${s.label} ${$t(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${r(s.key)}"></i>
            <span>${r(s.label)}</span>
            <strong>${$t(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 llama-server Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function ru(e,t){let s=(Array.isArray(e)?e:[]).map(x=>({elapsed:Math.max(0,Number(x.elapsed_s)||0),indexed:Math.max(0,Number(x.indexed)||0)})).filter(x=>x.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(x=>x.elapsed),(Number(t)||0)/1e3,1),n=Math.max(...s.map(x=>x.indexed),1),i=760,o=150,l=12,d=12,p=i-l*2,g=o-d*2,$=s.map(x=>[l+x.elapsed/a*p,o-d-x.indexed/n*g]),h=$.map(([x,_],y)=>`${y===0?"M":"L"}${x.toFixed(1)},${_.toFixed(1)}`).join(" "),u=`${h} L${$[$.length-1][0].toFixed(1)},${o-d} L${$[0][0].toFixed(1)},${o-d} Z`,b=Math.max(1,Math.ceil($.length/14)),v=$.map(([x,_],y)=>y%b===0||y===$.length-1?`<circle cx="${x.toFixed(1)}" cy="${_.toFixed(1)}" r="2.6" />`:"").join(""),k=[0,1,2,3].map(x=>{let _=d+g/3*x;return`<line x1="${l}" y1="${_.toFixed(1)}" x2="${i-l}" y2="${_.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${c(n)} \u7B46 \xB7 ${$t(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${k}
      <path d="${u}" class="index-progress-area"></path>
      <path d="${h}" class="index-progress-line"></path>
      ${v}
      <line x1="${l}" y1="${o-d}" x2="${i-l}" y2="${o-d}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${d}" x2="${l}" y2="${o-d}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${$t(a*500)}</span>
      <span>${$t(a*1e3)}</span>
    </div>
  </div>`}function iu(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},n=t.coverage||{},i=n.total_judgments>0?`${c(n.indexed_judgments)} / ${c(n.total_judgments)}\uFF08${(100*n.indexed_judgments/n.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:c(t.indexed_count),note:`${c(t.batch_count)} \u6279 \xD7 ${c(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:$t(t.duration_ms),note:`${c(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:$t(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${$t(t.batch_min_ms)} \xB7 \u6700\u6162 ${$t(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${c(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${r(Bo(t))}</span>
    </div>
    <div class="index-perf-summary">
      ${o.map(l=>`<div class="index-perf-stat">
            <div class="summary-label">${r(l.label)}</div>
            <div class="index-perf-value">${r(l.value)}</div>
            <div class="index-perf-note">${r(l.note)}</div>
          </div>`).join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${r(we(t.started_at))}</span>
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
        ${au(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${$t(t.duration_ms)}</span>
        </div>
        ${nu(t)}
      </div>
    </div>
    ${ru(t.progress,t.duration_ms)}
  </section>`}var Lo=["#22d3ee","#a78bfa","#f59e0b","#ec4899","#3b82f6","#10b981","#f97316","#8b5cf6","#64748b"];function jo(e){let t=String(e?.host||e?.url||"").trim(),s=e?.port?`:${e.port}`:"";return`${t||"\u2014"}${s}`}function ou(e,t,s,a){if(a&&!e)return`<div class="report-card rag-wf-card">
      ${Be({tone:"danger",title:"\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${m("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=Array.isArray(e?.runs)?e.runs:[];if(!n.length)return`<div class="report-card rag-wf-card">
      ${ht({iconName:"layers",title:s?"\u8B80\u53D6\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline\u2026":"\u5C1A\u7121\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684\u7248\u672C\u5316\u7D22\u5F15\u7D00\u9304\u3002":"\u57F7\u884C\u300CQdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A host/model\u3001Blue-Green collection \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002"})}
    </div>`;let i=n.find(_=>String(_.id)===String(t))||e?.latest||n[n.length-1],o=i?.pipeline&&typeof i.pipeline=="object"?i.pipeline:null,d=[...n].reverse().map(_=>{let y=Number(_.pipeline?.version_id||_.version_id||0),I=y?`v${String(y).padStart(3,"0")}`:"\u7D22\u5F15";return`<option value="${r(String(_.id))}" ${String(_.id)===String(i.id)?"selected":""}>${r(`${we(_.started_at)} \xB7 ${I} \xB7 ${$t(_.duration_ms)}`)}</option>`}).join(""),p=Number(o?.version_id||i.version_id||0),g=p?`v${String(p).padStart(3,"0")}`:"\u2014",$=o?.host||{},h=jo($),u=o?.model||i.model||"\u2014",b=Number(o?.total_ms)||Number(i.duration_ms)||0,v=Array.isArray(o?.stages)?o.stages:[],k=v.map((_,y)=>({..._,ms:Math.max(0,Number(_.duration_ms)||0),color:Lo[y%Lo.length]})).filter(_=>_.ms>0).map(_=>`<span class="index-pipeline-seg" style="width:${(_.ms/Math.max(1,b)*100).toFixed(2)}%;background:${r(_.color)}" title="${r(`${_.label} ${$t(_.ms)}`)}"></span>`).join(""),x=v.map((_,y)=>{let I=Math.max(0,Number(_.duration_ms)||0),pe=b>0?I/b*100:0,V=_.host&&typeof _.host=="object"?_.host:null;return`<div class="index-pipeline-row">
        <span class="index-pipeline-step">${String(y+1).padStart(2,"0")}</span>
        <div class="index-pipeline-copy">
          <div class="index-pipeline-title">
            <strong>${r(_.label||_.key||"\u968E\u6BB5")}</strong>
            ${Xe(_.status||"success")}
          </div>
          <span class="index-pipeline-detail">${r(_.detail||"\u2014")}</span>
          ${V?`<span class="index-pipeline-host">${m("server",12)} ${r(jo(V))} \xB7 ${r(_.model||u)}</span>`:""}
        </div>
        <div class="index-pipeline-time">
          <strong>${$t(I)}</strong>
          <span>${pe.toFixed(1)}%</span>
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
            <span><strong>Host</strong> ${r(h)}</span>
            <span><strong>Model</strong> ${r(String(u))}</span>
            <span><strong>\u7E3D\u8017\u6642</strong> ${$t(b)}</span>
          </div>
          <div class="index-pipeline-bar">${k}</div>
          <div class="index-pipeline-list">${x}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B Pipeline \u968E\u6BB5\u8CC7\u6599\uFF1B\u4E0B\u4E00\u6B21 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u6703\u8A18\u9304 host/model \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002</div>'}
  </section>`}function lu(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
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
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${m("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${m("chevronRight",13)}</button>
    </div>
  </div>`}function cu(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"#65a30d":t.includes("judgment.rag")?"#8b5cf6":t.includes("judgment.web.app")?"#3b82f6":t.includes("judgment.web.query")?"#d97706":t.includes("judgment.judgment_index")?"#0d9488":"#64748b"}function du(e){let t=jr(e),s=Math.max(0,Math.min(8,Number(e.depth)||0));return{key:"segment",label:`${"\u203A ".repeat(s)}${e.name||"unnamed"}`,hint:[e.module||"\u2014",e.function||"\u2014"].join(" \xB7 "),color:cu(e),spans:[{...t,status:e.status||"ok",error:e.error,metadata:e.metadata||{},params:e.params||{},started_at:e.started_at,finished_at:e.finished_at}],start:t.offset,end:t.end,duration:t.duration}}function hn(e){return(e||[]).map(du)}function uu(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((h,u)=>Number(h.seq)-Number(u.seq)):[],n=s?.summary||{},i=Array.isArray(n.models)?n.models:[],o=s?.client||{},l=s?.metadata||{},d=l.question||"",p=l.answer||"",g=d||p?`<div class="perf-flow-qa">
          ${d?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${r(d)}</span></div>`:""}
          ${p?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${r(p)}</span></div>`:""}
        </div>`:"",$=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(h=>(Number(h.offset_ms)||0)+(Number(h.duration_ms)||0)),1);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${r(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${r(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${r(e.method||"")} ${r(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${we(e.started_at)}</span>
      <span class="perf-record-duration">${fe(e.duration_ms)}</span>
      ${Xe(e.status)}
      <span class="perf-record-chevron">${m("chevronRight",14)}</span>
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
      ${g}
      ${i.length?`<div class="chips perf-record-models">${i.map(h=>`<span class="chip">${r(h)}</span>`).join("")}</div>`:""}
      ${a.length?Xs(hn(a),$,"\u6B64 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002"):`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${r(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${r(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var To={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",rerank:"Reranker",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"};function pu(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}var mu={embedding:"#3984c6",retrieval:"#d97706",rerank:"#8b5cf6",context:"#64748b",llm:"#16a34a",validation:"#8b5cf6"};function gu(e,t){let s=Date.parse(e.started_at||""),a=Date.now(),n=Array.isArray(e.stage_order)?[...e.stage_order]:Object.keys(To);for(let p of t)p.stage&&!n.includes(p.stage)&&n.push(p.stage);let i=[],o=0;for(let p of n){let g=t.filter(u=>u.stage===p);if(!g.length)continue;let $=g.map(u=>{let b=Date.parse(u.started_at||""),v=Number.isFinite(s)&&Number.isFinite(b)?Math.max(0,b-s):0,k=Math.max(0,Number(u.duration_ms)||0);u.status==="running"&&Number.isFinite(b)&&(k=Math.max(k,a-b));let x=v+k;return o=Math.max(o,x),{offset:v,end:x,duration:k,status:u.status==="failed"?"error":u.status==="running"?"running":"ok",started_at:u.started_at,finished_at:u.finished_at,error:u.error_message,metadata:{...u.details||{},model:u.model,status:u.status,progress:Number(u.progress)||0,module:u.module,function:u.function},params:{model:u.model}}}),h=$.reduce((u,b)=>u+b.duration,0);i.push({key:"test_stage",label:To[p]||p,hint:`${$.length} \u500B\u7A0B\u5E8F`,color:mu[p]||"#64748b",spans:$,start:$.length?Math.min(...$.map(u=>u.offset)):null,end:$.length?Math.max(...$.map(u=>u.end)):null,duration:h})}let l=e.status==="running"&&Number.isFinite(s)?Math.max(0,a-s):0,d=Math.max(Number(e.total_ms)||0,l,o,1);return{stages:i,total:d}}function Zs(e,t,s,a={}){let n=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(x=>`<option value="${r(x.run_id)}" ${x.run_id===s?"selected":""}>${r(pu(x.status))} \xB7 ${r((x.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${r(we(x.started_at))}</option>`)].join(""),o=n?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${m("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${m("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?Xe(e.status):""}</div>
      <div class="test-flow-question">${e?r(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${ht({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let d=Array.isArray(e.steps)?e.steps:[],p=gu(e,d),g=e.models||{},$=e.status==="running"?`${fe(p.total)}\uFF08\u4F30\u7B97\uFF09`:fe(e.total_ms),h=d.find(x=>x.stage==="llm"&&x.model===e.summary?.primary_model)||d.find(x=>x.stage==="llm"&&x.details?.answer_preview),u=String(h?.details?.provider_name||"").trim(),b=u&&e.summary?.primary_model?`${u}:${e.summary.primary_model}`:e.summary?.primary_model||"",v=e.answer||h?.details?.answer_preview||"",k=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${b?`<span class="mono">${r(b)}</span>`:""}
    </div>
    <p>${v?r(v):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${r(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${r(we(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${$}</span>
      <span><strong>Embedding</strong> ${Array.isArray(g.embedding)?g.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(g.llm)?g.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${r(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${k}
    ${p.stages.length?Xs(p.stages,p.total,"\u6E2C\u8A66 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B\u7A0B\u5E8F\u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u6A21\u578B\u3001\u72C0\u614B\u3001\u9032\u5EA6\u3001module\uFF0Ffunction \u8207\u932F\u8AA4\u3002"):'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":n?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${b?`<span class="mono">primary=${r(b)}</span>`:""}
    </div>
  </div>`}function fu(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},n=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${Xe(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${c(e.total)} \u7B46\u7B26\u5408 \xB7 ${fe(e.duration_ms)} \xB7
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
    ${iu(n)}
    ${su(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>uu(i,o)).join(""):ht({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${lu(e)}
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
  </div>`}async function bu(e,t){let s=Ut(),a=!1,n=Lr(),i={processes:[],modules:[],statuses:[],methods:[],models:[]},o=1,l=25,d=null,p=[],g="",$=!1,h=null,u=!1,b=null,v="",k=!1,x=null,_=!1;e.innerHTML=`<section class="page data-page performance-page">
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
              <div id="performance-report">${wa({label:"\u6548\u80FD\u5831\u8868"})}</div>
            </section>
          </div>
        </div>
        <div id="performance-panel-pipeline" hidden></div>
        <div id="performance-panel-index-pipeline" hidden></div>
        <div id="performance-panel-benchmark" hidden></div>
      </section>
    </div>
  </section>`;let y=e.querySelector("#performance-filter-fields"),I=e.querySelector("#performance-filter-form"),pe=e.querySelector("#performance-test-flow"),V=e.querySelector("#performance-report"),$e=e.querySelector("#performance-panel-pipeline"),he=e.querySelector("#performance-panel-index-pipeline"),ae=e.querySelector("#performance-meta"),q=e.querySelector("#performance-refresh"),A=[...e.querySelectorAll("[data-performance-tab]")],j={overview:e.querySelector("#performance-panel-overview"),pipeline:e.querySelector("#performance-panel-pipeline"),"index-pipeline":e.querySelector("#performance-panel-index-pipeline"),benchmark:e.querySelector("#performance-panel-benchmark")},K="overview",ge=R=>{K=R;for(let z of A){let F=z.dataset.performanceTab===R;z.classList.toggle("is-active",F),F?z.setAttribute("aria-current","page"):z.removeAttribute("aria-current")}for(let[z,F]of Object.entries(j))F&&(F.hidden=z!==R);R==="benchmark"?ae.textContent="BENCHMARK \xB7 RAG":R==="pipeline"?ae.textContent="PERFORMANCE \xB7 RAG WATERFALL":R==="index-pipeline"?ae.textContent="PERFORMANCE \xB7 INDEX PIPELINE":d&&(ae.textContent=`PERFORMANCE \xB7 ${c(d.total)} \u7B46`)},O=po(e,{onNavigate:R=>ge(R)});s&&(pe.innerHTML=Ls("\u7CFB\u7D71\u6E2C\u8A66\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u6548\u80FD\u5831\u8868\u3001RAG Pipeline \u8207\u7D22\u5F15 Pipeline\uFF1B\u6E2C\u8A66\u6D41\u7A0B\u8207 Benchmark \u57F7\u884C\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002"));let oe=()=>{$e&&($e.innerHTML=tu(p,g,$,h))},je=async({force:R=!1}={})=>{if(!(a||$)){if(u&&!R){oe();return}$=!0,p.length||oe();try{let z=await Q.performance({keyword:"/api/rag"},1,50);if(a)return;let F=(Array.isArray(z.rows)?z.rows:[]).filter(ke=>ke.flow&&(String(ke.path||"").includes("/api/rag")||String(ke.process||"").includes("RAG")));p=F,(!g||!F.some(ke=>String(ke.id)===String(g)))&&(g=F[0]?String(F[0].id):""),h=null,u=!0}catch(z){if(a)return;h=z}finally{a||($=!1,oe())}}},C=()=>{he&&(he.innerHTML=ou(b,v,k,x))},ye=async({force:R=!1}={})=>{if(!(a||k)){if(_&&!R){C();return}k=!0,b||C();try{let z=await Q.performance({},1,1);if(a)return;b=z.index_pipeline||z.index_stats||null;let F=Array.isArray(b?.runs)?b.runs:[];(!v||!F.some(ke=>String(ke.id)===String(v)))&&(v=b?.latest?String(b.latest.id):""),x=null,_=!0}catch(z){if(a)return;x=z}finally{a||(k=!1,C())}}},te=R=>{if(ge(R),R==="benchmark"){if(s){let z=j.benchmark;z&&(z.innerHTML=Ls("RAG Benchmark \u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u6548\u80FD\u5831\u8868\u8207 Pipeline\uFF1BBenchmark \u984C\u5EAB\u3001\u6A21\u578B\u8A2D\u5B9A\u3001\u57F7\u884C\u8207\u8A55\u5206\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002"));return}O.show()}R==="pipeline"&&je(),R==="index-pipeline"&&ye()};e.addEventListener("click",R=>{let z=R.target.closest("[data-performance-tab]");z&&te(z.dataset.performanceTab||"overview")}),$e?.addEventListener("change",R=>{R.target.matches("[data-rag-trace-select]")&&(g=String(R.target.value||""),oe())}),$e?.addEventListener("click",R=>{R.target.closest('[data-action="refresh-rag-waterfall"]')&&je({force:!0})}),he?.addEventListener("change",R=>{R.target.matches("[data-index-pipeline-select]")&&(v=String(R.target.value||""),C())}),he?.addEventListener("click",R=>{R.target.closest('[data-action="refresh-index-pipeline"]')&&ye({force:!0})});let Se=null,qe=[],ve="",me=null,ce="",se=()=>{y.innerHTML=Qd(i,n)},Te=()=>{let R=JSON.stringify({selected:ve,tick:Se?.status==="running"?Math.floor(Date.now()/1e3):0,runs:qe.map(z=>`${z.run_id}:${z.status}`),run:Se?{run_id:Se.run_id,status:Se.status,progress:Se.progress,total_ms:Se.total_ms,steps:(Se.steps||[]).map(z=>`${z.stage}:${z.model}:${z.status}:${z.progress}:${z.duration_ms}`)}:null});R!==ce&&(ce=R,pe.innerHTML=Zs(Se,qe,ve))},xe=async()=>{if(!s)try{let R=await Q.testRuns(30);if(a)return;qe=Array.isArray(R.runs)?R.runs:[]}catch{if(a)return;qe=[]}},Re=async(R=null)=>{if(!s)try{let z=R&&!ve?R:ve?await Q.testRun(ve):await Q.testRunCurrent();if(a)return;Se=z.run||null,!ve&&Se&&Se.status!=="running"&&!qe.some(F=>F.run_id===Se.run_id)&&await xe(),Te()}catch{if(a)return;Se=null,Te()}},Ce=async(R=null)=>{a||ve||await Re(R)},P=()=>{s||a||me||(me=_t("test-runs",(R,z)=>Ce(z?.snapshot||null)))};pe.addEventListener("change",async R=>{R.target.id==="test-run-select"&&(ve=String(R.target.value||""),await Re())}),pe.addEventListener("click",async R=>{R.target.closest("#test-flow-refresh")&&(ve="",await xe(),await Re())});let B=async(R=o,{quiet:z=!1}={})=>{o=Math.max(1,Number(R)||1),n=Ao();let F=V.querySelector(".report-card"),ke=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!F?V.setAttribute("aria-busy","true"):(V.removeAttribute("aria-busy"),V.innerHTML=wa({label:"\u6548\u80FD\u5831\u8868"}));let Ye=e.querySelector("#performance-run");z||Ne(Ye,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Ue=await Q.performance(n,o,l);if(a)return;if(d=Ue,Ue.index_pipeline){b=Ue.index_pipeline;let tt=Array.isArray(b.runs)?b.runs:[];(!v||!tt.some(ut=>String(ut.id)===String(v)))&&(v=b.latest?String(b.latest.id):""),_=!0,x=null}if(o=Number(Ue.page)||o,l=Number(Ue.page_size)||l,V.removeAttribute("aria-busy"),V.innerHTML=fu(Ue),ke!==null){let tt=V.querySelector("[data-page-size]");tt&&(tt.value=String(l),tt.focus({preventScroll:!0}))}ae.textContent=`PERFORMANCE \xB7 ${c(Ue.total)} \u7B46`,ae.className="badge badge-neutral badge-mono"}catch(Ue){if(a)return;V.removeAttribute("aria-busy"),V.innerHTML=un(Ue,{label:"\u6548\u80FD\u5831\u8868"}),N(Ue.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{a||Ne(Ye,!1)}},U=async()=>{try{i=await Q.performanceOptions()}catch{i={processes:[],modules:[],statuses:[],methods:[],models:[]}}se()};return I.addEventListener("submit",R=>{R.preventDefault(),B(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{n=Lr(),o=1,se(),B(1)}),q.addEventListener("click",async()=>{if(K==="pipeline"){Ne(q,!0,"\u6574\u7406\u4E2D\u2026");try{await je({force:!0})}finally{a||Ne(q,!1)}return}if(K==="index-pipeline"){Ne(q,!0,"\u6574\u7406\u4E2D\u2026");try{await ye({force:!0})}finally{a||Ne(q,!1)}return}if(K==="benchmark"){if(s)return;Ne(q,!0,"\u6574\u7406\u4E2D\u2026");try{await O.refresh()}finally{a||Ne(q,!1)}return}n=Ao(),q.disabled=!0,Ne(q,!0,"\u6574\u7406\u4E2D\u2026"),await U(),await xe(),a||await Re(),a||await B(1),a||(q.disabled=!1,Ne(q,!1))}),V.addEventListener("click",async R=>{let z=R.target.closest("[data-action]");if(!z||!d)return;let F=z.dataset.action;if(F==="retry"){B(o);return}if(F==="prev-page"){B(Math.max(1,Number(d.page)-1),{quiet:!0});return}if(F==="next-page"){let ke=Math.max(1,Math.ceil(Number(d.total)/Number(d.page_size)));B(Math.min(ke,Number(d.page)+1),{quiet:!0});return}if(F==="copy-query"){let ke=await Hs(d.query_text||"");N(ke?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",ke?"ok":"warn");return}if(F==="export-json"){let ke=`performance-page-${d.page}.json`;Gt(ke,JSON.stringify(mn(d),null,2),"application/json;charset=utf-8"),N(`\u5DF2\u532F\u51FA ${ke}`,"ok");return}if(F==="export-csv"){let ke=`performance-page-${d.page}.csv`;Gt(ke,pn(d),"text/csv;charset=utf-8"),N(`\u5DF2\u532F\u51FA ${ke}`,"ok")}}),V.addEventListener("change",R=>{R.target.matches("[data-page-size]")&&(l=Number(R.target.value)||25,Eo.includes(l)||(l=25),B(1,{quiet:!0}))}),s?(await U(),a||await B(1)):(await Promise.allSettled([U(),xe()]),a||(await Re(),await B(1),P())),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{a=!0,me&&me(),O.destroy()}}var hu=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5F9E\u696D\u4EBA\u54E1\u6709\u90A3\u4E9B\u898F\u5B9A\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function vu(){return`<div class="answer-placeholder">
    <span class="empty-icon">${m("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function Cr(){return`<section class="card answer-card rag-empty-answer">${vu()}</section>`}function Fo(e,t){return`<div class="rag-turn">
    <div class="rag-user-bubble">${r(e)}</div>
    <section class="card rag-assistant-turn" data-rag-answer>${t}</section>
  </div>`}function $u(e,t){return Promise.race([e,new Promise((s,a)=>{window.setTimeout(()=>a(new Error("pipeline lookup timed out")),t)})])}async function yu(e){if(!e||e.pipeline_flow)return e;let t=String(e._client_request_id||e.request_id||"").trim();if(!t)return e;for(let s=0;s<3;s+=1){try{let a=await $u(Q.performance({keyword:t},1,5),1800),n=(Array.isArray(a.rows)?a.rows:[]).find(i=>String(i.request_id||"")===t&&i.flow&&typeof i.flow=="object");if(n)return e.pipeline_flow=n.flow,e}catch{}s<2&&await new Promise(a=>window.setTimeout(a,250))}return e}function wu(e){return{status:e.status,answer:e.answer,answer_source:e.answer_source,notice:e.notice,citations:Array.isArray(e.citations)?e.citations:[],judgments:Array.isArray(e.judgments)?e.judgments:[],law_sources:Array.isArray(e.law_sources)?e.law_sources:[],matched_terms:Array.isArray(e.matched_terms)?e.matched_terms:[],law_answer:e.law_answer,law_framework:e.law_framework,llm_model:e.llm_model,embedding_model:e.embedding_model,duration_ms:e.duration_ms,show_sources:e.show_sources,pipeline_flow:e.pipeline_flow||null,test_run:e.test_run||null,partial:!1,streaming:!1}}var _u={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"llama-server embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"llama-server LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function ku(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`llama-server run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`llama-server embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:_u[t]||t||"backend step"}function Oo(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function Ho(e){let t=Number(e);return Number.isFinite(t)?`${c(Math.max(0,Math.round(t)))} ms`:"\u2014"}function Pr(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function Su(){return`<div class="rag-process is-open" id="rag-process">
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
  </div>`}function xu(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),n=performance.now(),i=new Map,o=new Map,l=(u,b,v)=>{let k=u.querySelector(b);k&&(k.textContent=v)},d=u=>{if(u.failed){l(u.element,".rag-process-meta","\u5931\u6557");return}if(u.hasChildren){l(u.element,".rag-process-meta","");return}l(u.element,".rag-process-meta",Ho(u.durationMs))},p=u=>{let b=u-1,v=[...i.values()].reverse();for(let k of v){if(b<0)break;k.depth<=b&&(k.hasChildren||(k.hasChildren=!0,k.element.dataset.hasChildren="true",k.finished&&d(k)),b=k.depth-1)}},g=u=>{if(!s)return null;let b=String(u?.seq??`step-${i.size+1}`),v=i.get(b);if(!v){let k=Math.max(0,Math.min(6,Number(u?.depth)||0));p(k);let x=document.createElement("div");x.className="rag-process-item is-running",x.dataset.processKey=b,x.style.setProperty("--depth",String(k)),x.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(x),v={element:x,depth:k,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(b,v)}return l(v.element,".rag-process-label",ku(u)),v.element.title=Oo(u),v};return{step:u=>{let b=u?.segment;if(!b)return;o.set(String(b.seq??b.name??o.size),{...b});let v=g(b);if(v){if(u.type==="segment_start"){v.element.classList.add("is-running"),l(v.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(u.type==="segment_end"){let k=b.status==="error";v.element.classList.remove("is-running"),v.element.classList.toggle("is-error",k),v.finished=!0,v.failed=k,v.durationMs=Number(b.duration_ms)||0,d(v),v.element.title=[Oo(b),k&&b.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(u=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(x=>{x.classList.remove("is-running");let _=x.dataset.hasChildren==="true";l(x,".rag-process-meta",_?"":u?"\u5B8C\u6210":"\u4E2D\u65B7")});let b=s?.children.length||i.size,v=Ho(Math.max(0,performance.now()-n));a&&(a.textContent=u?`\u5B8C\u6210 \xB7 ${b} \u6B65 \xB7 ${v}`:`\u5931\u6557 \xB7 ${b} \u6B65`);let k=[...o.values()].filter(x=>x?.name).sort((x,_)=>Number(x.offset_ms||0)-Number(_.offset_ms||0));if(s&&k.length){let x=Math.max(1,...k.map(_=>Number(_.end_offset_ms)||(Number(_.offset_ms)||0)+(Number(_.duration_ms)||0)));s.classList.add("is-waterfall"),s.innerHTML=Xs(hn(k),x,"\u5F8C\u7AEF Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B span \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002")}return t.classList.add("is-complete"),Pr(t,!1),t.outerHTML},collapse:()=>Pr(t,!1)}}function Au(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${m("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":Su()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${r(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function zo(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function $n(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let n=String(e||"").trim();return n?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t||n)}"
    data-source-type="${r(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(a||n)}</button>`:""}function Jo(e){let t=String(e?.law_name||"").trim(),s=String(e?.article_no||"").replace(/\s+/g,"");if(!t||!s)return"";let a=(Array.isArray(e?.paragraphs)?e.paragraphs:[]).map(i=>String(i||"").trim()).filter(Boolean),n=`${t}${s}${a.join("\u3001")}`;return`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t)}"
    data-source-type=""
    data-article-no="${r(s)}"
    title="\u9EDE\u64CA\u67E5\u770B ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(n)}</button>`}function Vo(e){let t=String(e?.citation_status||"");return t==="cited"?"\u7B54\u6848\u5F15\u7528":t==="provided_not_cited"?"\u5DF2\u63D0\u4F9B\u7D66\u6A21\u578B\uFF0C\u7B54\u6848\u672A\u5F15\u7528":t==="reference_only"||e?.used_for_generation===!1?"\u50C5\u4F9B\u53C3\u8003\uFF08\u672A\u9032\u5165\u751F\u6210 prompt\uFF09":e?.used_for_generation===!0?"\u5DF2\u63D0\u4F9B\u7D66\u6A21\u578B":""}function Mu(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map($=>`<span>${r($)}</span>`).join(""),n=Vo(e),i=n?`<span>${r(n)}</span>`:"",o=(Array.isArray(e.law_citations)?e.law_citations:[]).map($=>Jo($)).filter(Boolean).slice(0,12).join(""),l=o||(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map($=>$n($)).join(""),d=o?'<div class="citation-meta"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':"",p=e.jid?` data-action="open-parquet-judgment"
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
  </article>`}function qu(e){let t=[e.court,e.jdate].filter(Boolean).map(n=>`<span>${r(n)}</span>`).join(""),s=[e.vector_score!==null&&e.vector_score!==void 0?`\u5411\u91CF ${Number(e.vector_score).toFixed(4)}`:"",e.rerank_score!==null&&e.rerank_score!==void 0?`rerank ${Number(e.rerank_score).toFixed(4)}`:""].filter(Boolean).map(n=>`<span>${r(n)}</span>`).join("");return`<article class="citation reference-judgment">
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
  </article>`}function Lu(e,t){let s=[e.law_level,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${r(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${m("external",11)}</a>`:"",n=e.law_key||e.law_name||"",i=n?` data-action="open-law-source"
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
  </article>`}function ju(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",n=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${r(s)}</span>`,a,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${Ht(e.law_modified_date)}`:"",Vo(e)].filter(Boolean).map(u=>`<span>${u}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${r(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${r(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
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
      </div>`}).join(""),$=e.law_url?`<a class="citation-link" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${m("external",11)}</a>`:"",h=e.law_key?` data-action="open-law-source"
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
      ${g}
    </div>
    <div class="citation-links">${$}</div>
  </article>`}function Tu(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function Eu(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${r(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",n=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(n==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),d=s.index!=null?`<span class="law-answer-index">[${r(String(s.index))}]</span>`:"",p=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${r(a)}"
            data-source-type="${r(n)}"
            title="\u9EDE\u64CA\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587">${r(i)}</button>`:`<strong>${r(i)}</strong>`,g=Array.isArray(s.articles)?s.articles:[],$=g.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${g.map(h=>{let u=String(h.article_no||"").trim(),b=Tu(h.article_content);return!a||!u?`<div class="law-answer-article is-static">
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
      </div>`}).join("")}</div>`}function Nu(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let n=s.get(String(a));return n?.law_key?$n(a,{lawKey:n.law_key,sourceType:n.source_type||""}):`<span class="chip">${r(a)}</span>`}).join("")}</div>`}function Ru(e){let t=String(e||"");return t==="operational"?"is-ok":t==="standby"?"is-idle":"is-down"}function Cu(e){let t=String(e||"");return t==="operational"?"":t==="standby"?"\u5099\u63F4":t==="disabled"?"\u505C\u7528":t==="not_configured"?"\u672A\u8A2D\u5B9A":"\u96E2\u7DDA"}function Go(e,{fallback:t=!1}={}){if(!e)return`<span class="rag-model-cell is-empty">
      <span class="rag-model-state is-idle" aria-hidden="true"></span>
      <span class="rag-model-name">\u672A\u8A2D\u5B9A</span>
    </span>`;let s=String(e.label||"").trim()||[e.host,e.model].filter(Boolean).join(":"),a=String(e.status||""),n=!["operational","standby"].includes(a),i=t&&!n?"\u5099\u63F4":Cu(a),o=n?"is-down":t?"is-idle":Ru(a),l=[s,e.url,i].filter(Boolean).join(" \xB7 ");return`<span class="rag-model-cell" title="${r(l)}">
    <span class="rag-model-state ${o}" aria-hidden="true"></span>
    <span class="rag-model-name">${r(s)}</span>
    ${i?`<span class="rag-model-note">${r(i)}</span>`:""}
  </span>`}function Pu(e,t){let s=Array.isArray(e)?e:[],a=[{kind:"chat",label:"Chat"},{kind:"embedding",label:"Embedding"},{kind:"rerank",label:"Rerank"}],n=new Map(s.map(o=>[String(o.kind||""),o])),i=a.map(o=>{let l=n.get(o.kind)||o;return`<tr>
        <td class="rag-model-kind">${r(l.label||o.label)}</td>
        <td>${Go(l.active)}</td>
        <td>${Go(l.fallback,{fallback:!0})}</td>
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
  </div>`}function vn({tone:e,title:t,text:s,modelSummary:a=[],refreshing:n=!1}){let i=e==="ok"?"is-ok":e==="warn"?"is-warn":"is-info",o=e==="ok"?"check":e==="warn"?"alert":"info",l=e==="ok"?"badge-ok":e==="warn"?"badge-warn":"badge-info";return`<section class="rag-mode-card ${i}">
    <div class="rag-mode-head">
      <span class="rag-mode-icon" aria-hidden="true">${m(o,14)}</span>
      <div class="rag-mode-copy">
        <strong>${r(t)}</strong>
        <p>${r(s)}</p>
      </div>
      <span class="badge ${l}">3 \u500B\u6A21\u578B</span>
    </div>
    ${Pu(a,n)}
  </section>`}function Wo(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.reference_judgments)?e.reference_judgments:[],n=Array.isArray(e.law_sources)?e.law_sources:[],i=e.retrieval||{},o=Array.isArray(e.matched_terms)?e.matched_terms:[],l=e.status||"preview",d=!!e.partial,p=!!e.streaming,g=!!e.rerank_degraded,$=!!e.show_sources||!d,h=e.answer_source==="structured",u=String(e.law_answer||"").trim(),b=e.law_framework||null,v=Array.isArray(b?.rows)?b.rows:[],k=Array.isArray(b?.sources)?b.sources:[],x=v.length>0,_=!!u&&!h&&!x,y=s.filter(se=>se.used_for_generation===!0).length,I=s.some(se=>se.used_for_generation!==void 0),pe=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46${I?`\uFF08${y} \u7B46\u9032\u5165 prompt\uFF09`:""}</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((se,Te)=>Mu(se,Te)).join("")}</div>`:"",V=i.judgment_limit_applied&&a.length?`<div class="reference-judgment-note">
          <span>\u672C\u984C\u4F9D\u984C\u610F\u4E3B\u8981\u8A62\u554F\u6CD5\u898F\u898F\u5B9A\uFF0C\u6545\u5224\u6C7A\u50C5\u986F\u793A ${s.length} \u7B46\u4F5C\u70BA\u53C3\u8003\u3002\u53E6\u6709 ${a.length} \u7B46\u76F8\u95DC\u5224\u6C7A\uFF08${a.some(se=>se.rerank_score!==null&&se.rerank_score!==void 0)?"\u4F9D rerank \u5206\u6578\u6392\u5E8F":"\u4F9D\u6AA2\u7D22\u5206\u6578\u6392\u5E8F"}\uFF09\uFF0C</span>
          <details class="reference-judgments">
            <summary>\u5C55\u958B\u67E5\u770B</summary>
            <div class="citation-list reference-judgment-list">${a.map(se=>qu(se)).join("")}</div>
          </details>
        </div>`:"",$e=n.length&&!_?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${n.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${n.map((se,Te)=>ju(se,Te)).join("")}</div>`:"",he=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((se,Te)=>Lu(se,Te)).join("")}</div>`:"",ae=$?pe+V+$e+he:"";!ae&&!d&&!_&&!x&&(ae=`<div class="answer-divider"></div>
      ${ht({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:l==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let q=Nu(o,n),A=e.test_run,j=String(e.llm_model||A?.primary_model||"").trim(),K=String(e.embedding_model||"").trim(),ge=[j?`LLM\uFF1A${j}`:"",K?`Embedding\uFF1A${K}`:""].filter(Boolean).join(" \xB7 "),O=p||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",oe=x?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${r(b.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${v.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${v.map(se=>`<tr>
                    <td>${r(se.law_name||"\u2014")}</td>
                    <td class="cell-number">${r(se.article_no||"\u2014")}</td>
                    <td>${r(se.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${k.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${k.map(se=>{let Te=String(se?.law_name||se||"").trim(),xe=se&&se.index!==null&&se.index!==void 0?` [${r(se.index)}]`:"";return $n(Te,{label:`${Te}${xe}`})}).join("")}
              </div>`:""}
      </div>`:"",je=e.answer_source==="llm"&&j?`<span class="answer-model" title="${r(ge)}">${m("brain",11)}${r(j)}</span>`:h?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${m("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",C=p?`${j||"LLM"} \xB7 \u751F\u6210\u4E2D`:je?j||"structured":"retrieval",ye=A?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${Xe(A.status)}
          <span class="mono">${r(A.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(A.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(A.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${r(A.primary_model||"\u2014")}</span>
          <span>${Number(A.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",te=e.pipeline_flow&&typeof e.pipeline_flow=="object"?e.pipeline_flow:null,Se=!d&&te?bn(te,{serverDurationMs:Number(e.duration_ms)||0,embedded:!0}):"",ve=String(e.answer||"").trim()||(p?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":d?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),me=p?" data-partial-answer":"",ce=p?" is-streaming":"";return`${oe}
      ${_?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${d&&!$?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${n.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${Eu(n,u)}</div>
            </div>`:""}
      <div class="answer-block">
        ${_||x?`<div class="answer-block-head">
                <span>${r(O)}</span>
                <span>${r(C)}</span>
              </div>`:""}
        <p class="answer-text${ce}"${me}>${r(ve)}</p>
      </div>
      ${g?'<div class="answer-notice" data-rerank-degraded="true">\u6392\u5E8F\u7CBE\u7C21\u6A21\u5F0F\uFF1A\u672C\u6B21\u90E8\u5206 rerank \u903E\u6642\u6216\u964D\u7D1A\uFF0C\u4F86\u6E90\u53EF\u80FD\u4EE5\u5411\u91CF\u9806\u5E8F\u986F\u793A\u3002</div>':""}
      ${e.notice?`<div class="answer-notice">${r(e.notice)}</div>`:""}
      ${ye}
      ${q}
      ${ae}
      ${Se}`}function Uo(e,t,s=""){let a=t.status||"preview",n=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),d=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),p=t.answer_source==="structured",g=t.answer_source==="llm"&&o?`<span class="answer-model" title="${r(d)}">${m("brain",11)}${r(o)}</span>`:p?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${m("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${m("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${Xe(a,n)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${g}
      </div>
      ${s}
    </div>
    <div class="answer-body">${Wo(t)}</div>`}function Iu(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${m("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${Be({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function Du(e){let t=Array.isArray(e.turns)?e.turns:[],s=t.length?t[t.length-1].payload||{}:e.payload||{},a=Array.isArray(s.citations)?s.citations.length:0,n=Array.isArray(s.judgments)?s.judgments.length:0,i=Array.isArray(s.law_sources)?s.law_sources.length:0;return a+n+i}function Bu(e,t,s,a=null){let n=e.id??s,i=Du(e),o=t.get(String(e.project_id||"")),l=Array.isArray(e.turns)?e.turns:[],d=e.updated_at||e.created_at,p=a!=null&&String(a)===String(n);return`<div class="rag-history-item${e.pinned?" is-pinned":""}${p?" is-active":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${r(String(n))}">
      <span class="history-question">${r(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${r(ca(d))}</span>
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
  </div>`}function Qo(e,t,s){let a=new Map;for(let i of t){let o=String(i.project_id||"");o&&a.set(o,(a.get(o)||0)+1)}let n=[`<button class="rag-project${s?"":" is-active"}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${s?"false":"true"}">
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
  </div>`),n.join("")}async function Fu(e){let t=!1,s=[],a=!1,n=[],i=!1,o="",l=8,d="",p=0,g=null,$=[],h=!1,u=!1,b={embedding:[],llm:[]},v=null,k=null,x=!1;e.innerHTML=`<section class="page rag-page">
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
      <div id="rag-mode-notice">${Be({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
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
        ${hu.map(w=>`<button class="example-chip" type="button" data-question="${r(w)}">${r(w)}</button>`).join("")}
      </div>
    </header>

    <section class="rag-conversation" id="rag-conversation" aria-live="polite">
      <div class="rag-turns" id="rag-turns">
        ${Cr()}
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
  </section>`;let _=e.querySelector("#rag-form"),y=e.querySelector("#rag-question"),I=e.querySelector("#rag-submit"),pe=e.querySelector(".rag-page"),V=e.querySelector("#rag-turns"),$e=e.querySelector("#rag-followup-form"),he=e.querySelector("#rag-followup-question"),ae=e.querySelector("#rag-followup-submit"),q=e.querySelector("#rag-history"),A=e.querySelector("#rag-storage-note"),j=e.querySelector("#rag-clear-history"),K=e.querySelector(".rag-library"),ge=e.querySelector("#rag-pinned-body"),O=e.querySelector("#rag-projects-body"),oe=e.querySelector("#rag-pinned-count"),je=e.querySelector("#rag-projects-count"),C=e.querySelector("#rag-recent-count"),ye=e.querySelector("#rag-library-context"),te=e.querySelector("#rag-test-mode"),Se=e.querySelector("#rag-test-flow"),qe=e.querySelector("#rag-history-menu"),ve=e.querySelector("#rag-judgment-dialog"),me=e.querySelector("#rag-law-dialog"),ce=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};ve?.addEventListener("close",ce),me?.addEventListener("close",ce);let se=null,Te=null,xe,Re=null,Ce=null,P=()=>{y.style.height="auto",y.style.height=`${Math.min(y.scrollHeight,220)}px`},B=()=>{he.style.height="auto",he.style.height=`${Math.min(he.scrollHeight,160)}px`},U=w=>{h=!!w,pe.classList.toggle("has-conversation",h)},R=()=>{h&&($e.hidden=!1,B())},z=()=>{$e.hidden=!0},F=()=>{qe.hidden&&!Ce||(qe.hidden=!0,qe.innerHTML="",Ce&&Ce.setAttribute("aria-expanded","false"),Re=null,Ce=null)},ke=(w,G)=>{let J=V.querySelector(".rag-empty-answer");J&&J.remove(),V.insertAdjacentHTML("beforeend",Fo(w,G));let ue=V.lastElementChild,Le=ue?.querySelector("[data-rag-answer]");return window.requestAnimationFrame(()=>{ue?.scrollIntoView({behavior:"smooth",block:"start"})}),{turnElement:ue,answerElement:Le}},Oe=()=>{V.innerHTML=$.length?$.map(w=>Fo(w.question,Uo(w.question,w.payload||{},""))).join(""):Cr()},Ye=w=>{let G=Array.isArray(w.turns)?w.turns:[];return G.length?(p+=1,es(),Ft(null),g=w.id??null,$=G.map(J=>({...J})),d=$[$.length-1]?.question||"",U(!0),Oe(),R(),Ue(),Ne(I,!1),Ne(ae,!1),window.setTimeout(()=>{$e.scrollIntoView({behavior:"smooth",block:"end"})},50),!0):!1},Ue=()=>{if(t)return;if(F(),!a){q.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',ge.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',oe.textContent="0",C.textContent="0",i&&(O.innerHTML=Qo(n,[],o));return}let w=n.find(Ze=>String(Ze.id)===o)||null;o&&!w&&(o="");let G=new Map(n.map(Ze=>[String(Ze.id),Ze])),J=s.filter(Ze=>!!Ze.pinned),ue=s.filter(Ze=>!Ze.pinned),Le=o?ue.filter(Ze=>String(Ze.project_id||"")===o):ue,He=Le.slice(0,l),nt=(Ze,f)=>Bu(Ze,G,f,g);ge.innerHTML=J.length?J.map(nt).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',O.innerHTML=Qo(n,s,o),q.innerHTML=He.length?He.map(nt).join(""):`<div class="rag-library-empty">${o?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u672A\u91D8\u9078\u7684\u9805\u76EE\u3002":J.length?"\u6700\u8FD1\u7684\u9805\u76EE\u90FD\u5DF2\u91D8\u9078\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,Le.length>l&&q.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${c(Le.length-l)} \u7B46</button>`),oe.textContent=String(J.length),je.textContent=String(n.length),C.textContent=String(Le.length),w?(ye.hidden=!1,ye.innerHTML=`<span>${m("folder",12)}<strong>${r(w.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${m("x",12)}</button>`):(ye.hidden=!0,ye.innerHTML="")},tt=async()=>{try{let w=await _s("rag.projects",[]);n=Array.isArray(w)?w.map(G=>({id:String(G?.id||""),name:String(G?.name||"").trim()})).filter(G=>G.id&&G.name):[]}catch{n=[]}i=!0,t||Ue()},ut=w=>{o=String(w||""),l=8,Ue()},lt=()=>{let w=O.querySelector('[data-rag-form="project"]');w&&(w.hidden=!1,w.querySelector("input")?.focus())},de=()=>{let w=O.querySelector('[data-rag-form="project"]');w&&(w.hidden=!0,w.reset())},et=async w=>{let G=w.elements.project_name,J=String(G?.value||"").trim();if(!J){N("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),G?.focus();return}if(n.some(Le=>Le.name.toLowerCase()===J.toLowerCase())){N("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),G?.focus();return}let ue=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;n=[...n,{id:ue,name:J.slice(0,60),created_at:new Date().toISOString()}],o=ue,l=8,await $a("rag.projects",n),Ue(),N(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${J}\u300D\u3002`,"ok")},Qe=async w=>{let G=s.find(Le=>String(Le.id)===String(w));if(!G)return;let J=!G.pinned;if(!await va(G.id,{pinned:J})){N("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}G.pinned=J,Ue(),N(J?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},it=()=>{p+=1,es(),Ft(null),d="",g=null,$=[],U(!1),z(),V.innerHTML=Cr(),y.value="",P(),he.value="",B(),Ne(I,!1),Ne(ae,!1),Ue(),ve?.open&&ve.close(),me?.open&&me.close(),y.focus(),window.scrollTo({top:0,behavior:"smooth"})},gt=w=>{if(!w||qe.hidden)return;let G=w.getBoundingClientRect(),J=qe.getBoundingClientRect(),ue=6,Le=G.bottom+ue;Le+J.height>window.innerHeight-8&&(Le=Math.max(8,G.top-J.height-ue));let He=G.right-J.width;He=Math.max(8,Math.min(He,window.innerWidth-J.width-8)),qe.style.left=`${Math.round(He)}px`,qe.style.top=`${Math.round(Le)}px`},ne=w=>{qe.innerHTML=`
      <button type="button" role="menuitem" data-menu-action="rename">${m("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${m("pin",13)}<span>${w.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${m("link",13)}<span>\u5206\u4EAB</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${m("trash",13)}<span>\u522A\u9664</span></button>`},Ae=w=>{let G=String(w.project_id||""),J=[{id:"",name:"\u672A\u5206\u985E"},...n.map(ue=>({id:String(ue.id),name:ue.name}))];qe.innerHTML=`
      <div class="rag-history-menu-head">${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${J.map(ue=>`<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${r(ue.id)}">
            <span class="rag-history-menu-check">${G===ue.id?m("check",12):""}</span>
            <span>${r(ue.name)}</span>
          </button>`).join("")}
      ${n.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${m("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},Ke=(w,G)=>{let J=s.find(ue=>String(ue.id)===String(G));J&&(F(),Re=String(J.id),Ce=w,ne(J),qe.hidden=!1,w.setAttribute("aria-expanded","true"),gt(w))},ze=async w=>{let G=window.prompt("\u91CD\u65B0\u547D\u540D\u5C0D\u8A71",w.title||"");if(G===null)return;let J=G.trim();if(!J){N("\u540D\u7A31\u4E0D\u80FD\u7A7A\u767D\u3002","warn");return}if(J===w.title)return;if(!await va(w.id,{title:J})){N("\u91CD\u65B0\u547D\u540D\u5931\u6557\u3002","danger");return}w.title=J,Ue(),N("\u5C0D\u8A71\u5DF2\u91CD\u65B0\u547D\u540D\u3002","ok")},Tt=async w=>{let G=Array.isArray(w.turns)?w.turns:[],J=[`# ${w.title||"\u672A\u547D\u540D\u5C0D\u8A71"}`,""];if(G.length)for(let Le of G){J.push("## \u554F\u984C","",Le.question||"",""),J.push("## \u56DE\u7B54","",Le.payload?.answer||"\uFF08\u6C92\u6709\u56DE\u7B54\u5167\u5BB9\uFF09","");let He=Array.isArray(Le.payload?.law_sources)?Le.payload.law_sources.map(nt=>nt.law_name).filter(Boolean):[];He.length&&J.push(`\u5F15\u7528\uFF1A${[...new Set(He)].join("\u3001")}`,"")}else J.push(w.title||"");let ue=await Hs(J.join(`
`));N(ue?"\u5C0D\u8A71\u5167\u5BB9\u5DF2\u8907\u88FD\uFF0C\u53EF\u76F4\u63A5\u8CBC\u4E0A\u5206\u4EAB\u3002":"\u7121\u6CD5\u8907\u88FD\u5C0D\u8A71\u5167\u5BB9\u3002",ue?"ok":"warn")},ft=async w=>{if(!window.confirm(`\u522A\u9664\u5C0D\u8A71\u300C${w.title||"\u672A\u547D\u540D\u5C0D\u8A71"}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002`))return;if(!await Ji(w.id)){N("\u522A\u9664\u5931\u6557\u3002","danger");return}let J=g!==null&&String(g)===String(w.id);s=s.filter(ue=>String(ue.id)!==String(w.id)),J?it():Ue(),N("\u5C0D\u8A71\u5DF2\u522A\u9664\u3002","ok")},M=async(w,G)=>{if(!await va(w.id,{project_id:G})){N("\u79FB\u81F3\u5C08\u6848\u5931\u6557\u3002","danger");return}w.project_id=G;let ue=n.find(Le=>String(Le.id)===String(G));Ue(),N(ue?`\u5DF2\u79FB\u81F3\u5C08\u6848\u300C${ue.name}\u300D\u3002`:"\u5DF2\u79FB\u51FA\u5C08\u6848\u3002","ok")},L=async w=>{let G=w.target.closest("[data-menu-action]");if(!G)return;let J=s.find(Le=>String(Le.id)===Re);if(!J){F();return}let ue=G.dataset.menuAction;ue==="rename"?(F(),await ze(J)):ue==="toggle-pin"?(F(),await Qe(J.id)):ue==="share"?(F(),await Tt(J)):ue==="move"?(Ae(J),gt(Ce)):ue==="assign-project"?(F(),await M(J,G.dataset.projectId||"")):ue==="back"?(ne(J),gt(Ce)):ue==="delete"&&(F(),await ft(J))},E=w=>{qe.hidden||(typeof w.composedPath=="function"?w.composedPath():[]).includes(qe)||qe.contains(w.target)||w.target.closest('[data-rag-action="open-history-menu"]')||F()},D=w=>{w.key==="Escape"&&F()},W=w=>{w.target instanceof Node&&qe.contains(w.target)||F()},ee=async()=>{try{if(s=await sn({limit:120}),t)return;a=!0,Ue(),A.textContent=ba()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;s=[],a=!0,Ue(),q.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},be=async(w,G,J,ue)=>{let Le=$,He=g;Le.push({question:w,asked_at:new Date().toISOString(),payload:wu(G)});let nt=Array.isArray(G.citations)?G.citations:[],Ze=Array.isArray(G.judgments)?G.judgments:[],f={question:w,status:G.status,citations:nt.map(X=>X.law_name),judgments:Ze.map(X=>X.jid)},S=`${G.status||"preview"} \xB7 ${Le.length} \u8F2A`,T=new Date().toISOString(),re=X=>{ue===p&&(g=X)};if(He){if(!await va(He,{turns:Le,detail:S,payload:f,updated_at:T})){let Y=await ha({kind:"rag",title:Le[0]?.question||w,detail:S,project_id:J,turns:Le,payload:f,updated_at:T});re(Y)}}else{let X=await ha({kind:"rag",title:Le[0]?.question||w,detail:S,project_id:J,turns:Le,payload:f,updated_at:T});re(X)}await ee()},Pe=()=>{let w=e.querySelector("#rag-mode-notice");if(!w)return;if(Ut()){w.innerHTML=Be({tone:"info",title:"\u5C55\u793A\u6A21\u5F0F",text:"\u53EF\u76F4\u63A5\u8F38\u5165\u6CD5\u5F8B\u554F\u984C\uFF1B\u56DE\u7B54\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u6CD5\u898F\u8207\u5224\u6C7A\u5F15\u7528\u3002"});return}let G=Array.isArray(v?.model_summary)?v.model_summary:[];if(!v){if(!k)return;w.innerHTML=vn({tone:"warn",title:"\u7121\u6CD5\u53D6\u5F97 RAG \u670D\u52D9\u72C0\u614B",text:k.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u524D\u5F80\u7CFB\u7D71\u72C0\u614B\u9801\u67E5\u770B\u3002",modelSummary:G,refreshing:x});return}let J=v.data||{},ue=(v.services||[]).find(nt=>nt.id==="rag"),Le=Number(J.judgment_indexed_count||0),He=Number(J.judgment_count||0);ue?.status==="operational"?w.innerHTML=vn({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${c(Le)} / ${c(He)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`,modelSummary:G,refreshing:x}):ue?.status==="degraded"?w.innerHTML=vn({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:ue.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002",modelSummary:G,refreshing:x}):w.innerHTML=vn({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:ue?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002",modelSummary:G,refreshing:x})},Fe=async()=>{if(Ut()){v=null,k=null,Pe();return}try{let w=await Q.status();if(t)return;v=w,k=null}catch(w){if(t)return;v=null,k=w}Pe()},Ie=async()=>{if(!x){x=!0,Pe();try{let w=await Q.status();if(t)return;v=w,k=null,N("\u5DF2\u66F4\u65B0\u6A21\u578B\u72C0\u614B\u3002","ok",2500)}catch(w){N(w.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u3002","danger",6e3)}finally{x=!1,t||Pe()}}},We=()=>{if(!te)return;if(!u){te.innerHTML="";return}let w=Array.isArray(b.embedding)?b.embedding.length:0,G=Array.isArray(b.llm)?b.llm.length:0;te.innerHTML=Be({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${w} \u500B embedding \u8207 ${G} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},st=async()=>{if(Ut()){u=!1,We();return}try{let w=await Q.testMode();if(t)return;u=!!w.enabled,b=w.models||{embedding:[],llm:[]},We()}catch{if(t)return;u=!1,We()}},dt=w=>{u=!!w.detail?.enabled,b=w.detail?.models||{embedding:[],llm:[]},We()};window.addEventListener("judgment:test-mode",dt);let Ft=w=>{if(!Se)return;Te=w||null;let G=JSON.stringify(w?{run_id:w.run_id,status:w.status,progress:w.progress,total_ms:w.total_ms,stage:w.stage,answer:w.answer||"",steps:(w.steps||[]).map(J=>`${J.stage}:${J.model}:${J.status}:${J.progress}:${J.duration_ms}`)}:null);G!==xe&&(xe=G,Se.innerHTML=w?Zs(w,[],"",{showHistory:!1}):"")},es=()=>{se&&(se(),se=null)},La=async(w=null)=>{if(!t)try{let G=w||await Q.testRunCurrent();if(t)return;let J=G.run;J&&J.status==="running"&&Ft(J)}catch{}},sa=()=>{t||se||(La(),se=_t("test-runs",(w,G)=>La(G?.snapshot||null)))},Tn=async w=>{if(!w){Ft(null);return}try{let G=await Q.testRun(w);if(t)return;Ft(G.run||null)}catch{t||N("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},ja=async()=>{if(u)try{let w=await Q.testRunCurrent();if(t)return;w.run?.status==="running"&&(Ft(w.run),sa())}catch{}},xs=0,is=(w,G)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${r(w)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${m("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${G}</div>`,At=w=>{let G=(Array.isArray(w.citations)?w.citations:[]).map(nt=>Jo(nt)).filter(Boolean).join(""),J=G||(Array.isArray(w.matched_laws)?w.matched_laws:[]).map(nt=>$n(nt)).join(""),ue=[w.court,w.jdate,w.title?`\u6848\u7531\uFF1A${w.title}`:"",w.full_text_length?`${c(w.full_text_length)} \u5B57`:"",w.citation_count?`\u5F15\u7528 ${c(w.citation_count)} \u7B46`:""].filter(Boolean).map(nt=>`<span>${r(nt)}</span>`).join(""),Le=w.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${r(String(w.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",He=w.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(w.pdf_url)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return is(w.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${r(w.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${ue}
      </div>
      ${G?'<div class="citation-meta" style="margin-top:8px"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':""}
      ${J?`<div class="chips" style="margin:8px 0 10px">${J}</div>`:""}
      <div class="judgment-dialog-source">${Le}</div>
      <pre class="judgment-dialog-text">${r(w.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${He}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},Bs=async w=>{if(!ve||!w)return;let G=++xs;ve.open||ve.showModal(),ce(),ve.innerHTML=is("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${r(w)}\u2026</span>
      </div>`);try{let J=await Q.judgmentDetail(w,"parquet");if(t||G!==xs)return;ve.innerHTML=At(J)}catch(J){if(t||G!==xs)return;ve.innerHTML=is("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(J.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},aa=0,Fs=(w,G)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${r(w)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${m("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${G}</div>`,na=(w,G="")=>{let J=String(w.selected_article_no||G||"").trim(),ue=!!J,Le=Array.isArray(w.articles)?w.articles:[],He=Le.map(le=>{let Me=String(le.article_content||"").trim();return Me?le.article_type==="C"?`<div class="law-chapter">${r(Me)}</div>`:`<article class="law-article" data-article-no="${r(zo(le.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${r(le.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${r(Me)}</div>
        </article>`:""}).join(""),nt=(Array.isArray(w.warnings)?w.warnings:[]).map(le=>r(le)).join("<br />"),Ze=w.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",f=w.meta?.articles_source,S=f==="parquet"?"Parquet \u689D\u6587":f==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",T=w.meta?.snapshot||"",re=[w.law_level,w.law_category,w.article_count?`${c(w.article_count)} \u689D`:"",w.law_modified_date?`\u7570\u52D5 ${Ht(w.law_modified_date)}`:""].filter(Boolean).map(le=>`<span>${r(le)}</span>`).join(""),X=w.law_url?`<a class="btn btn-secondary btn-sm" href="${r(w.law_url)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",Y=!ue&&w.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${r(w.law_histories)}</div>
        </details>`:"",_e=ue?`<span class="badge badge-mono">${r(J)}</span>`:"",H=!ue&&Le.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",Z=ue?`${w.law_name||w.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${J}`:w.law_name||w.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return Fs(Z,`<div class="judgment-dialog-meta">
        <span class="badge ${w.source_type==="order"?"badge-warn":"badge-info"}">${r(Ze)}</span>
        ${_e}
        ${re}
      </div>
      <div class="judgment-dialog-source">${r([S,T].filter(Boolean).join(" \xB7 "))}</div>
      ${nt?`<div class="law-dialog-warning">${nt}</div>`:""}
      ${Y}
      ${H}
      <div class="law-dialog-articles">${He||`<div class="report-empty-inline">${ue?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${X}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},Et=(w,G)=>{let J=w?.querySelector(`#${G}`),ue=zo(J?.value||"");if(!ue){N("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),J?.focus();return}let Le=[...w?.querySelectorAll("[data-article-no]")||[]].find(He=>He.dataset.articleNo===ue);if(!Le){N(`\u627E\u4E0D\u5230\u7B2C ${ue} \u689D\u3002`,"warn");return}Le.scrollIntoView({behavior:"instant",block:"center"}),Le.classList.add("is-jump-target"),window.setTimeout(()=>Le.classList.remove("is-jump-target"),2400)},ra=async(w,G="",J="")=>{if(!me||!w)return;let ue=++aa;me.open||me.showModal(),ce(),me.innerHTML=Fs(J?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${r([w,J].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let Le=await Q.lawDetail(w,G,"",J);if(t||ue!==aa)return;me.innerHTML=na(Le,J)}catch(Le){if(t||ue!==aa)return;me.innerHTML=Fs("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(Le.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};me?.addEventListener("click",w=>{let G=w.target.closest('[data-action="jump-law-article"]');if(G){Et(me,G.dataset.jumpInput||"rag-law-article-jump");return}if(w.target.closest('[data-action="close-law-source"]')){me.close();return}let J=me.getBoundingClientRect();(w.clientX<J.left||w.clientX>J.right||w.clientY<J.top||w.clientY>J.bottom)&&me.close()}),me?.addEventListener("keydown",w=>{!w.target.matches(".law-jump-input")||w.key!=="Enter"||(w.preventDefault(),Et(me,w.target.id))}),ve?.addEventListener("click",w=>{let G=w.target.closest('[data-action="open-law-source"]');if(G){ra(G.dataset.lawKey||"",G.dataset.sourceType||"",G.dataset.articleNo||"");return}if(w.target.closest('[data-action="close-parquet-judgment"]')){ve.close();return}let J=ve.getBoundingClientRect();(w.clientX<J.left||w.clientX>J.right||w.clientY<J.top||w.clientY>J.bottom)&&ve.close()}),V.addEventListener("click",w=>{let G=w.target.closest(".rag-process-toggle");if(G){let ue=G.closest(".rag-process"),Le=G.getAttribute("aria-expanded")==="true";Pr(ue,!Le);return}let J=w.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(J){if(J.dataset.action==="open-law-source"){ra(J.dataset.lawKey||"",J.dataset.sourceType||"",J.dataset.articleNo||"");return}Bs(J.dataset.jid||"")}}),V.addEventListener("keydown",w=>{if(w.key!=="Enter"&&w.key!==" ")return;let G=w.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!G||G.closest("a, button"))){if(w.preventDefault(),G.dataset.action==="open-law-source"){ra(G.dataset.lawKey||"",G.dataset.sourceType||"",G.dataset.articleNo||"");return}Bs(G.dataset.jid||"")}});let Os=async(w,{fresh:G=!1,source:J="hero"}={})=>{let ue=w.trim();if(!ue){N("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),(J==="followup"?he:y).focus();return}(G||!h)&&(g=null,$=[],V.innerHTML="",Ue());let Le=++p,He=()=>t||Le!==p,nt=o;d=ue,U(!0),z(),J==="followup"?(he.value="",B()):(y.value="",P());let{answerElement:Ze}=ke(ue,Au(ue,u)),f=u?null:xu(Ze);u?(Ft(null),sa()):(es(),Ft(null)),Ne(I,!0,"\u6AA2\u7D22\u4E2D\u2026"),Ne(ae,!0,"\u6AA2\u7D22\u4E2D\u2026");let S=null,T="",re=H=>{if(He()||!H?.partial)return;let Z=Ze.querySelector(".answer-body");if(!Z)return;S=H,T=String(H.answer||""),Z.innerHTML=Wo(H),f?.collapse?.();let le=Ze.querySelector(".answer-head-title");le&&(le.textContent=H.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},X=H=>{if(He()||!H||!S?.streaming)return;T+=H;let Z=Ze.querySelector("[data-partial-answer]");Z&&(Z.textContent=T)},Y=()=>{if(He()||!S?.streaming)return;T="";let H=Ze.querySelector("[data-partial-answer]");H&&(H.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")},_e=H=>{if(He())return;let Z=Ze.querySelector(".answer-body");if(!Z)return;let le=Z.querySelector("[data-summary-queue]");le||(le=document.createElement("div"),le.className="answer-notice",le.dataset.summaryQueue="true",Z.appendChild(le));let Me=Number(H.position||0),De=Number(H.eta_s||0),at=H.lane==="summary"?"\u6458\u8981":"\u6AA2\u7D22";le.textContent=`${at}\u6392\u968A\u4E2D\uFF1A\u524D\u9762 ${Me} \u4F4D\uFF0C\u9810\u4F30\u7D04 ${Math.round(De)} \u79D2\u3002`};try{let H=u?await Q.rag(ue,{testMode:u}):await Q.ragStream(ue,{onStep:le=>{He()||f?.step(le)},onPartial:re,onQueued:_e,onToken:X,onTokenReset:Y});if(He())return;es();let Z=f?.finish(!0)||"";if(Ze.innerHTML=Uo(ue,H,Z),H.pipeline_flow||yu(H).then(()=>{if(He()||!H.pipeline_flow)return;let le=Ze.querySelector(".answer-body");if(!le||le.querySelector(".rag-wf-card"))return;let Me=bn(H.pipeline_flow,{serverDurationMs:Number(H.duration_ms)||0,embedded:!0});Me&&le.insertAdjacentHTML("beforeend",Me)}),H.test_run?.run_id?await Tn(H.test_run.run_id):Ft(null),await be(ue,H,nt,Le),He())return;R()}catch(H){if(He())return;es();let Z=f?.finish(!1)||"";Ze.innerHTML=Iu(H,Z),R(),N(H.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{He()||(es(),Ne(I,!1),Ne(ae,!1))}};_.addEventListener("submit",w=>{w.preventDefault(),Os(y.value,{fresh:!0,source:"hero"})}),$e.addEventListener("submit",w=>{w.preventDefault(),Os(he.value,{fresh:!1,source:"followup"})}),y.addEventListener("input",P),y.addEventListener("keydown",w=>{w.key==="Enter"&&!w.shiftKey&&!w.isComposing&&(w.preventDefault(),_.requestSubmit())}),he.addEventListener("input",B),he.addEventListener("keydown",w=>{w.key==="Enter"&&!w.shiftKey&&!w.isComposing&&(w.preventDefault(),$e.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",w=>{let G=w.target.closest("[data-question]");G&&(y.value=G.dataset.question,P(),_.requestSubmit())}),e.addEventListener("click",async w=>{w.target.closest('[data-rag-action="refresh-models"]')&&await Ie()}),K.addEventListener("click",async w=>{let G=w.target.closest("[data-rag-toggle]");if(G){let Ze=G.closest(".rag-library-section").classList.toggle("is-collapsed");G.setAttribute("aria-expanded",String(!Ze));return}let J=w.target.closest("[data-rag-action]"),ue=J?.dataset.ragAction||"";if(ue==="new-chat"){it();return}if(ue==="open-history-menu"){Ke(J,J.dataset.historyId);return}if(ue==="toggle-pin"){await Qe(J.dataset.historyId);return}if(ue==="select-project"){ut(J.dataset.projectId||"");return}if(ue==="show-project-form"){lt();return}if(ue==="cancel-project"){de();return}if(ue==="more-recent"){l+=12,Ue();return}if(ue==="clear-project"){ut("");return}let Le=w.target.closest("[data-history-open]");if(!Le)return;let He=s.find(nt=>String(nt.id)===String(Le.dataset.historyId));He&&(o=String(He.project_id||""),Ue(),!Ye(He)&&(g=null,$=[],Os(He.title,{fresh:!0,source:"history"})))}),K.addEventListener("submit",async w=>{let G=w.target.closest('[data-rag-form="project"]');G&&(w.preventDefault(),await et(G))}),qe.addEventListener("click",L),document.addEventListener("click",E),document.addEventListener("keydown",D),window.addEventListener("scroll",W,{capture:!0,passive:!0}),window.addEventListener("resize",F),j.addEventListener("click",async()=>{if(!s.length){N("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await Vi(),await ee(),N("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),P(),await Promise.allSettled([Fe(),ee(),tt(),st()]),await ja();let Wt="";try{Wt=window.sessionStorage.getItem("judgment.pending_question")||"",window.sessionStorage.removeItem("judgment.pending_question")}catch{Wt=""}return!Wt&&typeof window.__judgmentPendingQuestion=="string"&&(Wt=window.__judgmentPendingQuestion),delete window.__judgmentPendingQuestion,Wt=String(Wt||"").trim().slice(0,500),Wt&&y&&(y.value=Wt,P(),window.setTimeout(()=>{t||Os(Wt,{fresh:!0,source:"home"})},40)),()=>{t=!0,es(),F(),document.removeEventListener("click",E),document.removeEventListener("keydown",D),window.removeEventListener("scroll",W,{capture:!0}),window.removeEventListener("resize",F),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",dt),d&&V.setAttribute("data-last-question",d)}}var Vr={};os(Vr,{render:()=>Hp});var Br=new Set(["legal_index_versions","judgment_import","index_versions"]),Ko=new Map,Fr=new Set,Or=new Set;function ka(e){let t=Number(e);if(!Number.isFinite(t)||t<0)return"\u2014";if(t<60)return`${Math.round(t)} \u79D2`;let s=Math.floor(t/60),a=Math.round(t%60);if(s<60)return`${s} \u5206 ${a} \u79D2`;let n=Math.floor(s/60),i=s%60;if(n<24)return`${n} \u5C0F\u6642 ${i} \u5206`;let o=Math.floor(n/24),l=n%24;return`${o} \u5929 ${l} \u5C0F\u6642`}function Dr(e){return String(e||"").trim().replace(/:latest$/,"")}var Ou={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},partial:{label:"\u90E8\u5206\u5B8C\u6210",tone:"warn"},update:{label:"\u66F4\u65B0",tone:"warn"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"},provided:{label:"\u5916\u90E8\u63D0\u4F9B",tone:"info"}},Hr=["download","parquet","postgres","qdrant"],Hu={download:"\u4E0B\u8F09",parquet:"Parquet",postgres:"PostgreSQL",qdrant:"Qdrant"},zu={judgment:{download:["download"],parquet:["raw_parquet","extract"],postgres:["postgres"],qdrant:["qdrant"]},law:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]},order:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]}},Yo={complete:"\u5B8C\u6210",incomplete:"\u672A\u5B8C\u6210",pending:"\u5F85\u66F4\u65B0",processing:"\u8655\u7406\u4E2D",empty:"\u7121\u8CC7\u6599",not_applicable:"\u5DF2\u53D6\u4EE3"},Xo={complete:"is-green",incomplete:"is-red",pending:"is-pending",processing:"is-gray",empty:"is-empty",not_applicable:"is-empty"};var Qt=new Map,Jt="",Ns="",Zo={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},el={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Gu={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"};var tl={law_download:"law",order_download:"order",judgment_download:"judgment"},sl={law_download:"\u6CD5\u898F\u4E0B\u8F09",order_download:"\u547D\u4EE4\u4E0B\u8F09",judgment_download:"\u5224\u6C7A\u4E0B\u8F09"},Uu={law_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",order_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",judgment_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u5224\u6C7A RAR \u55CE\uFF1F\uFF08\u4E0D\u6703\u81EA\u52D5\u532F\u5165 PostgreSQL \u6216\u5EFA\u7ACB Qdrant \u7D22\u5F15\uFF09"},Qu={law_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u6CD5\u898F RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",order_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u547D\u4EE4 RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",judgment_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u53EA\u4E0B\u8F09\u5224\u6C7A RAR\u3002PostgreSQL\uFF0FParquet \u532F\u5165\u8207 Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\u300C\u5224\u6C7A\u532F\u5165\u300D\u6216\u5B8C\u6574\u8CC7\u6599\u66F4\u65B0\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_import:"\u6D41\u7A0B\u7BC4\u570D\uFF1ARAR \u2192 \u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD \u2192 \u91D1\u878D\u6CD5\u898F\u7BE9\u9078 \u2192 PostgreSQL\u3002Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_parquet:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5F9E PostgreSQL \u532F\u51FA\u67E5\u8A62\u7528 Parquet \u5FEB\u7167\uFF1B\u4E0D\u5BEB\u5165 Qdrant\uFF0FIndexedDB\u3002",index_versions:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5EFA\u7ACB\u4E26\u9A57\u8B49\u65B0\u7684 Qdrant collection\uFF0C\u5B8C\u6210\u5F8C\u539F\u5B50\u5207\u63DB alias\uFF1BIndexedDB \u4E0D\u53C3\u8207\u3002"};function Ss(e){return Ou[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Bt(e,t){let s=Ss(e);return`<span class="badge ${Zo[s.tone]||Zo.idle}"><span class="status-dot ${el[s.tone]||el.idle}"></span>${r(t||s.label)}</span>`}function yt(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function al(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":c(e)}function ol(e){return e&&e.color?String(e.color):"var(--accent)"}function zr(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return["skipped","pending","idle"].includes(e.status)?"\u2014":s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${Ee(s)} / ${Ee(a)}`:Ee(s):a?`${c(s)} / ${c(a)} ${t}`:`${c(s)} ${t}`}function Rs(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${r(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function Ju(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},n=e.raw_backups||{},i=n.totals||{},o=e.state||{},l=e.capabilities||{},d=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",p=t.status==="operational",g=s.status==="operational",$=a.available!==!1,h=n.available!==!1,u=g?`${c(s.indexed)} / ${c(s.total)}`:Bt(s.status||"unavailable"),b=g?`${yt(s.percent)} \xB7 \u5C1A\u9918 ${c(s.remaining)} \u7B46`:r(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),v=$?`${c(a.unprocessed)} / ${c(a.total)}`:Bt("unavailable"),k=$?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${Ee(a.unprocessed_bytes)} \u5F85\u8655\u7406`:r(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${ns(op(e))}
    ${Rs("\u8655\u7406\u72C0\u614B",Bt(e.status||"unknown"),`${r(d)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${Rs("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",r(v),k)}
    ${Rs("\u539F\u59CB\u8CC7\u6599\u5099\u4EFD",h?`${c(n.count)} \u6A94`:Bt("unavailable"),h?`\u5171 ${c(i.row_count)} \u7B46 \xB7 ${Ee(i.compressed_bytes)}`:r(n.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB\u8CC7\u6599\u5099\u4EFD\u3002"))}
    ${Rs("PostgreSQL \u5224\u6C7A",p?c(t.judgment_count):Bt("unavailable"),p?`\u6CD5\u898F ${al(t.law_count)} \xB7 \u547D\u4EE4 ${al(t.order_count)}`:r(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${Rs("Qdrant \u7D22\u5F15",u,b)}
    ${Rs("\u72C0\u614B\u6A94",Bt(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${r(we(o.updated_at))}`:r(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${Rs("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?r(l.start_blocked_reason):`\u672A\u8655\u7406 ${c(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${c(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${c(l.external_processes)} \u500B`:""}`)}
  </div>`}function Vu(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let n=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${r(o.color||"var(--accent)")}" title="${r(`${o.label} ${fe(o.duration_ms)} (${yt(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${r(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${r(o.label)}</span>
        <span class="mono">${fe(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${yt(o.percent)}</span>
        ${Bt(o.status)}
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
  </section>`}function Wu(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let n=t.map(i=>{let o=s.get(i.branch)||Gu[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${r(o)}</span>
          <strong>${r(i.title||"\u8655\u7406")}</strong>
          ${Bt(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${r(we(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?fe(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${r(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${n}</div></div>
  </section>`}function Ku(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>Be({tone:s.tone||"info",title:s.title,text:r(s.message||"")})).join("")}</div>`:""}function ll(e,t){if(e==="law"||e==="order")return t==="qdrant"?"legal_index_versions":`${e}_download`;if(e==="judgment"){if(t==="download")return"judgment_download";if(t==="parquet"||t==="postgres")return"judgment_import";if(t==="qdrant")return"index_versions"}return""}function Gr({month:e,year:t,monthNo:s,stageOrder:a,stageLabels:n,stageStatuses:i,overall:o,active:l,processing:d=!1,workflowForStage:p,stageProgress:g=null,variant:$="legacy"}){let h=i||{},u=$==="index"||$==="import",b=String(e?.month||`${t}${String(s).padStart(2,"0")}`),v=e?.month_label||`${t}-${String(s).padStart(2,"0")}`,k=q=>u&&q==="processing"?"\u57F7\u884C\u4E2D":Yo[q]||Yo.empty,x=q=>{let A=h[q]||"empty";if(!(A==="processing"||q==="qdrant"&&A==="incomplete"))return null;let K;if(typeof g=="function")K=g(q,b,A);else if($==="import"&&g&&typeof g=="object")K=g[q];else return null;let ge=Number(K);return Number.isFinite(ge)?Math.max(0,Math.min(100,ge)):null},_=a.map(q=>{let A=h[q]||"empty",j=x(q),K=q==="qdrant"&&A==="incomplete"&&j!==null&&j>0,ge=K?"\u5DF2\u8655\u7406":k(A),O=!K&&j!==null&&j>0?` ${j.toFixed(1)}%`:"";return`${n[q]||q}\uFF1A${ge}${O}`}).join(" \xB7 "),y=(e?.versions||[]).map(q=>q.version_code).filter(Boolean),I=[...new Set([...e?.files||[],...e?.local_files||[],...e?.imported_files||[]])].filter(Boolean),pe=y.length?` \xB7 \u7248\u672C ${y.join("\u3001")}`:I.length?` \xB7 ${I.join("\u3001")}`:"",V=e?.detail?` \xB7 ${e.detail}`:"",$e=e?`${v} \xB7 ${_}${pe}${V}`:`${v} \xB7 \u7121\u8CC7\u6599`,he=u?o==="empty"?"is-empty":"is-neutral":Xo[o]||"is-empty",ae=a.map(q=>{let A=h[q]||"empty",j=A==="incomplete"||A==="pending"?p(q):"",K=j?"button":"span",ge=j?` type="button" data-timeline-workflow="${r(j)}"`:"",O=x(q),oe=q==="qdrant"&&A==="incomplete"&&O!==null&&O>0,je=A==="processing"&&O!==null?` ${O.toFixed(1)}%`:"",C=oe?"\u5DF2\u8655\u7406":k(A),ye=A==="complete"?"is-complete":A==="processing"?"is-running":oe?"is-partial":A==="incomplete"?"is-incomplete":A==="pending"?"is-pending":"is-empty",te=u?["index-month-block","processing-month-stage",`is-${q}`,ye,j?"is-actionable":""]:["processing-month-stage",`is-${q}`,Xo[A]||"is-empty",ye,j?"is-actionable":""],qe=(A==="processing"||oe)&&O!==null?` style="--stage-progress:${O.toFixed(1)}%"`:"";return`<${K} class="${te.filter(Boolean).join(" ")}"${ge}${qe} title="${r(`${n[q]||q}\uFF1A${C}${je}${j?"\uFF08\u9EDE\u9078\u524D\u5F80\u8655\u7406\uFF09":""}`)}" aria-label="${r(`${v} ${n[q]||q} ${C}${je}${j?"\uFF0C\u9EDE\u9078\u524D\u5F80\u8655\u7406":""}`)}"></${K}>`}).join("");return u?`<td class="judgment-month index-month index-month-are processing-month ${he}${l?" is-current":""}${d&&!l?" is-processing-current":""}" data-month="${r(b)}" title="${r($e)}" aria-label="${r($e)}"${l?' aria-current="true"':""}>
    <span class="index-month-number">${s}</span>
    <span class="index-month-blocks">${ae}</span>
  </td>`:`<td class="judgment-month import-month processing-month${l?" is-current":""} is-${r(o)}" data-month="${r(b)}" title="${r($e)}" aria-label="${r($e)}"${l?' aria-current="true"':""}>
    <span class="processing-month-number">${s}</span>
    <span class="processing-month-stages">${ae}</span>
  </td>`}function Yu(e,t,s,a,n){return Gr({month:t,year:s,monthNo:a,stageOrder:Hr,stageLabels:Hu,stageStatuses:t?.stages||{},overall:t?.overall||"empty",active:!!(t?.active||t?.overall==="processing"),workflowForStage:i=>ll(e.key,i),stageProgress:n,variant:"index"})}function Xu(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=Number(s?.incomplete)||0,o=Number(s?.superseded)||0,l=a>0?(n+o)/a*100:null,d=["download","prepared","indexed"],p=0,g=0;for(let h of t){let u=h?.stages||{};for(let b of d){let v=u[b];!v||v==="empty"||v==="not_applicable"||(p+=1,v==="complete"&&(g+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(n),"\u5DF2\u5B8C\u6210 D\uFF0FP\uFF0FI \u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(i+(Number(s?.processing)||0)),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u5DF2\u53D6\u4EE3\u6708\u4EFD",c(o),"\u820A\u7248\u672C\u5DF2\u88AB\u76EE\u524D\u7248\u672C\u53D6\u4EE3\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",yt(l),"\u5B8C\u6210\u6216\u5DF2\u53D6\u4EE3\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c(g)} / ${c(p)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([h,u,b])=>`<span class="index-runtime-metric" title="${r(b)}"><span>${r(h)}</span><strong>${r(u)}</strong></span>`).join("")}</div>`}function Zu(e,t,s,a){let n=Number(e?.total_months)||t.length||0,i=Number(s?.complete)||0,o=Number(s?.incomplete)||0,l=Number(s?.processing)||0,d=Number(a?.gray)||0,p=n>0?i/n*100:null,g=0,$=0;for(let u of t){let b=u?.import_stages||{};for(let v of["extract","raw_parquet","filter","postgres"]){let k=b[v];!k||k==="empty"||(g+=1,k==="complete"&&($+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(i),"\u56DB\u500B\u532F\u5165\u968E\u6BB5\u90FD\u5B8C\u6210\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(o+l),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\uFF08\u542B\u8655\u7406\u4E2D\uFF09\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",c(d),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(n),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",yt(p),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c($)} / ${c(g)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([u,b,v])=>`<span class="index-runtime-metric" title="${r(v)}"><span>${r(u)}</span><strong>${r(b)}</strong></span>`).join("")}</div>`}function ep(e,{titleSuffix:t="\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868"}={}){let s=`${r(e?.label||"\u6CD5\u898F\uFF0F\u547D\u4EE4")} ${r(t)}`,a=Array.isArray(e?.months)?e.months:[];if(!a.length)return`<section class="report-card processing-card import-files-card law-index-timeline-card">
      <div class="side-card-head">
        <span class="side-card-title">${m(e?.key==="order"?"file":"layers",14)}${s}</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u7121\u4E0B\u8F09\u7248\u672C\u6216\u7D22\u5F15\u7D00\u9304\u3002</div>
    </section>`;let n=new Map(a.map(h=>[String(h.month),h])),i=[...new Set(a.map(h=>h.year))].sort((h,u)=>String(u).localeCompare(String(h))),o=["download","prepared","indexed"],l=e.stage_labels||{download:"D \u4E0B\u8F09\u7248\u672C",prepared:"P \u8CC7\u6599\u5C31\u7DD2",indexed:"I \u7D22\u5F15\u8986\u84CB"},d=e.summary||{},p=e.current||{},g=i.map(h=>{let u=Array.from({length:12},(b,v)=>{let k=v+1,x=`${h}${String(k).padStart(2,"0")}`,_=n.get(x);return Gr({month:_,year:h,monthNo:k,stageOrder:o,stageLabels:l,stageStatuses:_?.stages||{},overall:_?.overall||"empty",active:!!_?.active,workflowForStage:y=>y==="indexed"?"legal_index_versions":`${e.key}_download`,variant:"index"})}).join("");return`<tr><th scope="row">${r(h)}</th>${u}</tr>`}).join(""),$=p.month?`<div class="index-current-row">
        <span class="badge badge-info">${m("activity",11)}${r(p.label||"\u76EE\u524D\u7248\u672C")}</span>
        <strong class="mono">${r(p.month_label||_n(p.month))}</strong>
        <span class="mono">${r(p.file||"\u2014")}</span>
        <span class="index-current-copy">${r(p.detail||"")}</span>
      </div>`:"";return`<section class="report-card processing-card import-files-card law-index-timeline-card" data-law-index-timeline="${r(e.key||"")}">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m(e.key==="order"?"file":"layers",14)}${s}</span>
      ${Xu(e,a,d)}
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
          <tbody>${g}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">D\uFF1A\u4E0B\u8F09\u7248\u672C\uFF1BP\uFF1Araw Parquet + PostgreSQL \u5C31\u7DD2\uFF1BI\uFF1Aactive \u7D22\u5F15\u8986\u84CB\uFF08\u7531\u6CD5\u898F\uFF0F\u547D\u4EE4\u7D22\u5F15\u6D41\u7A0B\u7DAD\u8B77\uFF09\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF0C\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u5B8C\u6210\u8272\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u6216\u5DF2\u53D6\u4EE3\u3002\u820A\u7248\u672C\u986F\u793A\u300C\u5DF2\u53D6\u4EE3\u300D\uFF0C\u4E0D\u9700\u91CD\u5EFA\u7D22\u5F15\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u7DE8\u865F\u3001\u4E0B\u8F09\u6642\u9593\u8207\u7B46\u6578\u3002</p>
    </div>
  </section>`}function tp(e,t={}){let s=Array.isArray(e)?e:[];return s.length?`<div class="law-index-timelines">${s.map(a=>ep(a,t)).join("")}</div>`:""}function cl({activeMonth:e,activeArchive:t,activePhase:s="",processingMonth:a="",processingArchive:n="",stageLabels:i={}}){if(!e||!t)return"";let o=`${String(e).slice(0,4)}-${String(e).slice(4,6)}`,l=i[s]||(s?"\u6E96\u5099\u4E2D":""),d=`${String(a||"").slice(0,4)}-${String(a||"").slice(4,6)}`,p=!!a&&(a!==e||n!==t);return`<span class="badge badge-info">${m("activity",11)}\u76EE\u524D\u532F\u5165</span>
    <strong class="mono">${r(o)}</strong>
    <span class="mono">${r(t)}</span>
    ${l?`<span class="badge badge-neutral">${r(l)}</span>`:""}
    ${p?`<span class="processing-current-processing">
            <span class="faint">\u8655\u7406\u4E2D</span>
            <strong class="mono">${r(d)}</strong>
            <span class="mono">${r(n||"\u2014")}</span>
          </span>`:""}`}function sp(e,t,s,a){let n=[];for(let i=1;i<=12;i+=1){let o=`${t}${String(i).padStart(2,"0")}`;n.push(Yu(e,s.get(o),t,i,a))}return`<tr><th scope="row">${t}</th>${n.join("")}</tr>`}function ap(e){let t=e?.models||{};return[["Embedding",t.embedding],["Rerank",t.rerank]].filter(([,s])=>s&&(s.label||s.model)).map(([s,a])=>{let n=a.label||[a.host,a.model].filter(Boolean).join(" ")||"\u2014",i=[`${s} \u4E3B\u6A5F\u8207\u6A21\u578B\uFF1A${n}`,a.url?`\u7AEF\u9EDE\uFF1A${a.url}`:"",s==="Rerank"&&a.enabled===!1?"RAG_RERANK_ENABLED=false":""].filter(Boolean).join(" \xB7 ");return`<span class="processing-timeline-model" title="${r(i)}">${s} <strong class="mono">${r(n)}</strong>${s==="Rerank"&&a.enabled===!1?' <span class="faint">\u672A\u555F\u7528</span>':""}</span>`}).join("")}function np(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=a>0?n/a*100:null,o=t.reduce((g,$)=>{let h=$?.stages||{};return g+Hr.filter(u=>!!h[u]&&h[u]!=="empty"&&h[u]!=="not_applicable").length},0),l=t.reduce((g,$)=>{let h=$?.stages||{};return g+Hr.filter(u=>h[u]==="complete").length},0),d=(Number(s?.incomplete)||0)+(Number(s?.processing)||0);return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",c(n),"\u5DF2\u5B8C\u6210\u5168\u90E8\u56DB\u500B\u968E\u6BB5\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",c(d),"\u4ECD\u6709\u81F3\u5C11\u4E00\u500B\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",c(s?.update||0),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",c(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",yt(i),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${c(l)} / ${c(o)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([g,$,h])=>`<span class="index-runtime-metric" title="${r(h)}"><span>${r(g)}</span><strong>${r($)}</strong></span>`).join("")}</div>`}function rp(e,t){let s=new Map((Array.isArray(e?.workflows)?e.workflows:[]).map(g=>[String(g.id||""),g])),a=t.key==="judgment"?"index_versions":"legal_index_versions",i=s.get(a)?.index_runtime||{},o=g=>{if(g==null||g==="")return null;let $=Number(g);return Number.isFinite($)?Math.max(0,Math.min(100,$)):null},l=new Map((Array.isArray(i.months)?i.months:[]).map(g=>[String(g?.month||""),o(g?.percent)])),d=new Map(Object.entries(i.active_coverage||{}).map(([g,$])=>[String(g),o($?.percent)])),p=(g,$)=>{let h=s.get(String(g||""));if(!h)return null;let u=h.progress||{},b=Array.isArray(u.stages)?u.stages:[];for(let v of $){let k=b.find(_=>String(_.key)===v),x=o(k?.percent);if(x!==null)return x}return o(u.percent)};return(g,$,h)=>{let u=String($||"");if(g==="qdrant"){let k=l.get(u),x=d.get(u);if(h==="processing"){if(k!==null&&k>0)return k;if(x!==null&&x>0)return x}else return h==="incomplete"?k!==null&&k>0?k:x!==null&&x>0?x:0:null}let b=ll(t.key,g);if(!b)return null;let v=(zu[t.key]||{})[g]||[g];return p(b,v)}}function ip(e){let t=Array.isArray(e.file_timelines)?e.file_timelines:[];return t.length?`<div class="processing-timeline-overview">${t.map(s=>{let a=Array.isArray(s.months)?s.months:[],n=new Map(a.map(g=>[String(g.month||""),g])),i=[...new Set(a.map(g=>Number(g.year)))].filter(g=>Number.isFinite(g)).sort((g,$)=>$-g),o=s.summary||{},l=s.current||null,d=ap(s),p=rp(e,s);return`<section class="report-card processing-card import-files-card processing-timeline-card" data-processing-timeline="${r(s.key||"")}">
        <div class="side-card-head index-runtime-head">
          <span class="side-card-title">${m(s.icon||"activity",14)}${r(s.title||`${s.label||""}\u8655\u7406\u6642\u9593\u8868`)}</span>
          ${np(s,a,o)}
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
                    <tbody>${i.map(g=>sp(s,g,n,p)).join("")}</tbody>
                  </table>
                </div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u3002</div>'}
          <p class="judgment-months-hint">${s.key==="judgment"?"\u5224\u6C7A\u4EE5\u88C1\u5224\u66F8\u6708\u4EFD\u986F\u793A\u3002":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u4EE5\u4F86\u6E90\u7248\u672C\u6708\u4EFD\u986F\u793A\u3002"}\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA\u4E0B\u8F09\u3001Parquet\u3001PostgreSQL\u3001Qdrant \u56DB\u500B\u968E\u6BB5\uFF1B\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF0CQdrant \u4E4B\u524D\u5DF2\u8655\u7406\u4F46\u5C1A\u672A\u5B8C\u6210\u6642\u4EE5\u5B8C\u6210\u8272\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u6216\u8272\u584A\u53EF\u67E5\u770B\u5404\u968E\u6BB5\u72C0\u614B\u8207\u9032\u5EA6\u3002</p>
        </div>
      </section>`}).join("")}</div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u8655\u7406\u6642\u9593\u8868\u3002</div>'}function op(e){return e.judgment_stats&&typeof e.judgment_stats=="object"?e.judgment_stats:{judgment_total:(e.raw_backups?.totals||{}).row_count,financial_total:(e.database||{}).judgment_count}}function nl(e,t=new Set){return`${Ku(e)}
    ${Ju(e)}
    ${ip(e)}
    ${Vu(e)}
    ${Wu(e)}`}function lp(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${Be({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:r(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${r(we(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${m("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}function cp(e,t){if(e.nodeType!==t.nodeType||e.nodeName!==t.nodeName){e.replaceWith(t.cloneNode(!0));return}if(e.nodeType===Node.TEXT_NODE){e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue);return}if(e.nodeType===Node.ELEMENT_NODE){for(let s of[...e.attributes])t.hasAttribute(s.name)||e.removeAttribute(s.name);for(let s of[...t.attributes])e.getAttribute(s.name)!==s.value&&e.setAttribute(s.name,s.value);t.hasAttribute("data-preserve-children")||dl(e,t)}}function dl(e,t){let s=[...e.childNodes],a=[...t.childNodes],n=Math.min(s.length,a.length);for(let i=0;i<n;i+=1)cp(s[i],a[i]);for(let i=n;i<s.length;i+=1)s[i].remove();for(let i=n;i<a.length;i+=1)e.appendChild(a[i].cloneNode(!0))}function ps(e,t){let s=document.createElement("template");s.innerHTML=t,dl(e,s.content)}var ul={overview:"activity",law_download:"layers",order_download:"file",judgment_download:"download",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function dp(e){let s=(Array.isArray(e.workflows)?e.workflows:[]).map(n=>{let i=n.active_run||null,o=i||n.last_run||null;return{...n,activeRun:i,lastRun:o,status:i?i.status||"running":n.update_available?"update":o?.status||"idle"}}),a=s.find(n=>n.id==="judgment_parquet");return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...s.filter(n=>n.id!=="judgment_parquet"),...a?[a]:[]]}function yn(e,t){let s=dp(e),a=new Set(["law_download","judgment_download","normalize_courts"]);return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${s.map(n=>{let i=n.id===t,o=ul[n.id]||"terminal",l=a.has(n.id)?'<div class="status-tab-divider" role="separator" aria-hidden="true"></div>':"",d=Number(n.pending_count)||0,p=Number(n.update_count)||(n.update_available?d:0),g=n.update_available&&p>0&&!n.activeRun,$=[n.update_message||`${n.update_origin||"\u66F4\u65B0\u5075\u6E2C"}\u627E\u5230 ${c(p)} \u9805\u53EF\u66F4\u65B0\u5167\u5BB9`,n.update_origin?`\u4F86\u6E90\uFF1A${n.update_origin}`:"",n.update_mechanism?`\u6A5F\u5236\uFF1A${n.update_mechanism}`:""].filter(Boolean).join(" \xB7 ");return`${l}<button class="status-tab${i?" is-active":""}" type="button"
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
    </div>`}function up(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${Bt(e.status)}
      <span class="mono">${r(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${r(we(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${fe(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${r(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${r(t.log_path)}</strong>`:""}
    </div>
  </div>`}function Sa(e){return`${e.year}-${String(e.month_no).padStart(2,"0")}`}function pl(e){let t={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"},s=e.status||"red";return[Sa(e),t[s]||s,e.latest_fileset_id?`fileset ${e.latest_fileset_id}`:"",e.filename||"",e.local_filename&&e.local_filename!==e.filename?`\u672C\u6A5F\uFF1A${e.local_filename}`:""].filter(Boolean).join(" \xB7 ")}function ml(e){if(!e.download_url)return"";let t=Sa(e);return`<a class="judgment-month-download" href="${r(bt(e.download_url))}" target="_blank" rel="noreferrer" title="\u4E0B\u8F09 ${t} \u5224\u6C7A" aria-label="\u4E0B\u8F09 ${t} \u5224\u6C7A">${m("download",11)}</a>`}function pp(e){let t=e.status||"red";return`<td class="judgment-month is-${r(t)}" data-judgment-month-key="${r(Sa(e))}" title="${r(pl(e))}"><span>${e.month_no}</span>${ml(e)}</td>`}function mp(e){return e?.off_hours_enabled===!0}function gl(e){return`\u7DA0\u8272\uFF1A\u6700\u65B0\u7248\u5DF2\u4E0B\u8F09\u5230 raw_rar\uFF1B\u7070\u8272\uFF1A\u672C\u6A5F\u4ECD\u662F\u820A\u7248\uFF0C\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u6703\u66F4\u65B0\uFF1B\u7D05\u8272\uFF1A\u8A72\u6708\u4EFD\u7F3A\u5C11\u5224\u6C7A\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u958B\u555F\u4E0B\u8F09\u9023\u7D50\uFF08${mp(e)?"\u975E API \u6642\u6BB5\u4E5F\u53EF\u4E0B\u8F09\uFF0C\u5EFA\u8B70\u4E00\u6B21\u53EA\u4E0B\u8F09\u4E00\u500B\u6A94\u6848":"\u4E0B\u8F09\u9023\u7D50\u50C5\u5728 00:00\u201306:00 API \u6642\u6BB5\u53EF\u7528"}\uFF09\u3002\u5F85\u88DC\u9F4A\u6708\u4EFD\u6703\u512A\u5148\u4E0B\u8F09\uFF0C\u5168\u90E8\u88DC\u9F4A\u5F8C\u624D\u7531\u6700\u65B0\u6708\u4EFD\u5F80\u56DE\u9A57\u8B49\u65E2\u6709\u6A94\u6848\uFF1B\u4E2D\u65B7\u7684\u4E0B\u8F09\u6703\u4FDD\u7559 .part\uFF0C\u4F3A\u670D\u5668\u652F\u63F4 Range \u6642\u7E8C\u50B3\uFF0C\u5426\u5247\u5F9E\u96F6\u91CD\u65B0\u4E0B\u8F09\u3002\u9996\u6B21\u5B8C\u6574\u540C\u6B65\u53EF\u80FD\u9700\u4E0B\u8F09\u6578\u767E\u500B\u6708\u4EFD\uFF0C\u9810\u8A2D\u975E\u6642\u6BB5\u4E5F\u53EF\u7E8C\u50B3\uFF1B\u56B4\u683C\u6A21\u5F0F\u6703\u5728 00:00\u201306:00 \u4EE5\u5916\u505C\u6B62\u3002`}var gp={completed:"\u5B8C\u6210",window_closed:"API \u6642\u6BB5\u7D50\u675F",deadline:"\u63A5\u8FD1 06:00\uFF0C\u4FDD\u7559\u5F85\u4E0B\u8F09\u6708\u4EFD",verification_window_closed:"API \u6642\u6BB5\u7D50\u675F\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",verification_deadline:"\u63A5\u8FD1 06:00\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",errors:"\u90E8\u5206\u6708\u4EFD\u4E0B\u8F09\u5931\u6557\uFF0C\u4E0B\u6B21\u91CD\u8A66",pending:"\u4ECD\u6709\u5F85\u4E0B\u8F09\u6708\u4EFD",check_only:"\u50C5\u6AA2\u67E5\uFF0C\u672A\u4E0B\u8F09",incremental:"\u589E\u91CF\u6AA2\u67E5\u5B8C\u6210",status_only:"\u50C5\u66F4\u65B0\u6708\u4EFD\u72C0\u614B",running:"\u57F7\u884C\u4E2D"};function Ur(e){let t=e?.backfill||{},s=t.verification||{},a=t.last_run||{},n=Number(t.pending_count)||0,i=Number(t.failure_count)||0,o=String(t.resume_from_month||""),l="\u9A57\u8B49\uFF1A\u672A\u958B\u59CB";s.status==="completed"?l="\u9A57\u8B49\u5B8C\u6210":s.next_month?l=`\u9A57\u8B49\u7E8C\u50B3 ${s.next_month}`:s.status==="in_progress"&&(l="\u9A57\u8B49\u9032\u884C\u4E2D");let d=String(a.stop_reason||""),p=d?`\u4E0A\u6B21\u505C\u6B62\uFF1A${gp[d]||d}`:"";return{pending:n,failures:i,resume:o,verificationText:l,lastText:p}}function fp(e){let t=Ur(e),s=t.pending>0?`\u5F85\u88DC\u9F4A ${c(t.pending)} \u500B\u6708${t.failures>0?`\uFF08${c(t.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708";return`<div class="judgment-backfill" data-judgment-backfill>
    <span class="badge ${t.pending>0?"badge-danger":"badge-ok"}" data-judgment-backfill-pending>${s}</span>
    <span class="badge badge-neutral" data-judgment-backfill-resume ${t.resume&&t.pending>0?"":"hidden"}>\u5F9E ${r(t.resume)} \u7E8C\u50B3</span>
    <span class="badge badge-info" data-judgment-backfill-verification>${r(t.verificationText)}</span>
    <span class="muted" data-judgment-backfill-last ${t.lastText?"":"hidden"}>${r(t.lastText)}</span>
  </div>`}function bp(e,t){let s=Ur(t),a=e.querySelector("[data-judgment-backfill-pending]");a&&(a.textContent=s.pending>0?`\u5F85\u88DC\u9F4A ${c(s.pending)} \u500B\u6708${s.failures>0?`\uFF08${c(s.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708",a.classList.toggle("badge-danger",s.pending>0),a.classList.toggle("badge-ok",s.pending===0));let n=e.querySelector("[data-judgment-backfill-resume]");if(n){let l=!!s.resume&&s.pending>0;n.hidden=!l,n.textContent=l?`\u5F9E ${s.resume} \u7E8C\u50B3`:""}let i=e.querySelector("[data-judgment-backfill-verification]");i&&(i.textContent=s.verificationText);let o=e.querySelector("[data-judgment-backfill-last]");o&&(o.hidden=!s.lastText,o.textContent=s.lastText)}function Qr(){return'<div class="judgment-months-loading"><span class="spinner"></span><span>\u8B80\u53D6\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B\u2026</span></div>'}function hp(e){if(e?.loading&&!e?.months?.length)return Qr();if(e?.error&&!e?.months?.length)return Be({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(e.error)});let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return'<div class="processing-empty">\u5C1A\u672A\u6709\u6708\u4EFD\u72C0\u614B\uFF1B\u8ACB\u5148\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u3002</div>';let s=new Map(t.map(o=>[Sa(o),o])),n=[...new Set(t.map(o=>o.year))].sort((o,l)=>l-o).map(o=>{let l=Array.from({length:12},(d,p)=>{let g=s.get(`${o}-${String(p+1).padStart(2,"0")}`);return g?pp(g):`<td class="judgment-month is-empty"><span>${p+1}</span></td>`}).join("");return`<tr><th scope="row">${o}</th>${l}</tr>`}).join(""),i=e.summary||{};return`<div class="judgment-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" data-judgment-summary="green">\u6700\u65B0\u7248 ${c(i.green||0)}</span>
      <span class="badge badge-neutral" data-judgment-summary="gray">\u820A\u7248 ${c(i.gray||0)}</span>
      <span class="badge badge-danger" data-judgment-summary="red">\u7F3A\u5931 ${c(i.red||0)}</span>
      <span class="muted" data-judgment-total>\u5171 ${c(e.total_months||t.length)} \u500B\u6708</span>
    </div>
    ${fp(e)}
    <div class="judgment-months-scroll">
      <table class="judgment-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(o,l)=>`<th scope="col">${l+1}</th>`).join("")}</tr></thead>
        <tbody>${n}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint" data-judgment-hint>${r(gl(e))}</p>
  </div>`}function vp(e,t){let s=Array.isArray(t?.months)?t.months:[],a=t.summary||{},n={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"};e.querySelectorAll("[data-judgment-summary]").forEach(l=>{let d=l.dataset.judgmentSummary||"";l.textContent=`${n[d]||d} ${c(a[d]||0)}`});let i=e.querySelector("[data-judgment-total]");i&&(i.textContent=`\u5171 ${c(t.total_months||s.length)} \u500B\u6708`),bp(e,t);let o=e.querySelector("[data-judgment-hint]");if(o){let l=gl(t);o.textContent!==l&&(o.textContent=l)}for(let l of s){let d=Sa(l),p=e.querySelector(`[data-judgment-month-key="${d}"]`);if(!p)continue;let g=l.status||"red";p.classList.contains(`is-${g}`)||(p.classList.remove("is-green","is-gray","is-red","is-empty"),p.classList.add(`is-${g}`));let $=pl(l);p.title!==$&&(p.title=$);let h=p.querySelector(".judgment-month-download");if(l.download_url){let u=bt(l.download_url);h?h.getAttribute("href")!==u&&(h.href=u):p.insertAdjacentHTML("beforeend",ml(l))}else h&&h.remove()}}function $p(e){let t=Array.isArray(e)?e:[];return t.length?`<div class="processing-workflow-history">
    ${t.map(s=>`<div class="processing-workflow-history-row">
          <span class="processing-workflow-history-status">${Bt(s.status||"idle")}</span>
          <span class="mono">${r(we(s.started_at))}</span>
          <span class="mono">${r(fe(s.duration_ms||0))}</span>
          <span class="processing-workflow-history-message">${r(s.message||"\u2014")}</span>
        </div>`).join("")}
  </div>`:'<div class="processing-workflow-empty">\u5C1A\u7121\u57F7\u884C\u7D00\u9304\u3002</div>'}function yp(e){let t=Array.isArray(e.update_history)?e.update_history:[];if(!t.length)return'<div class="processing-workflow-empty">\u5C1A\u7121\u7248\u672C\u6AA2\u67E5\u7D00\u9304\u3002</div>';let s={up_to_date:["\u5DF2\u662F\u6700\u65B0","badge-ok"],update_available:["\u6709\u66F4\u65B0","badge-warn"],error:["\u6AA2\u67E5\u5931\u6557","badge-danger"]};return`<div class="processing-workflow-history">
    ${t.map(a=>{let[n,i]=s[a.status]||[a.status||"\u672A\u77E5","badge-neutral"],o=a.remote_content_length!=null?Ee(a.remote_content_length):"\u2014",l=a.local_version_id?`v${a.local_version_id}`:"\u2014";return`<div class="processing-workflow-history-row">
          <span class="badge ${i}">${r(n)}</span>
          <span class="mono">${r(we(a.checked_at))}</span>
          <span class="mono">\u9060\u7AEF ${r(o)}</span>
          <span class="mono">\u672C\u5730 ${r(l)}</span>
          <span class="processing-workflow-history-message">${r(a.message||"\u2014")}</span>
        </div>`}).join("")}
  </div>`}function fl(e){let t=String(e.key||""),s=Ss(e.status);return[`data-stage-key="${r(t)}"`,`data-stage-label="${r(e.label||t)}"`,`data-stage-color="${r(ol(e))}"`,`data-stage-status-key="${r(e.status||"idle")}"`,`data-stage-status="${r(s.label)}"`,`data-stage-percent="${r(yt(e.percent))}"`,`data-stage-counts="${r(zr(e))}"`,`data-stage-duration="${r(Cs(e.duration_ms||0))}"`,`data-stage-contribution="${r(yt(e.contribution_percent))}"`,`data-stage-message="${r(e.message||"")}"`].join(" ")}function wp(e,t=Date.now()){let s=String(e.status||"idle"),a=Number(e.duration_ms)||0,n=Date.parse(e.started_at||"");if(s==="running"&&Number.isFinite(n))return Math.max(a,t-n);if(a>0)return a;let i=Date.parse(e.finished_at||"");return Number.isFinite(n)&&Number.isFinite(i)?Math.max(0,i-n):0}function bl(e){if(e.key!=="filter")return null;let t=Number(e.financial_processed),s=Number(e.financial_matched);return e.financial_processed===null||e.financial_processed===void 0||!Number.isFinite(t)||!Number.isFinite(s)||t<=0?null:{processed:t,matched:s,percent:Math.round(s/t*100)}}function _p(e){let t=String(e.status||"idle"),s=[],a=Number(e.total);if(e.key==="postgres"&&["success","no_change"].includes(t)&&Number.isFinite(a)&&a>0)s.push(`\u7E3D\u8A08 ${c(a)} \u7B46`);else{let i=zr(e);i!=="\u2014"&&s.push(i)}let n=bl(e);return n&&s.push(`\u91D1\u878D\u4F54\u6BD4 ${n.percent}%`),s.join(" \xB7 ")}function kp(e,t){let s=String(e.status||"idle"),a=[],n=(d,p,{always:g=!1}={})=>{let $=p==null?"":String(p).trim();!g&&!$||a.push(`<span class="rag-wf-detail"><span>${r(d)}</span><strong>${r($||"\u2014")}</strong></span>`)};n("\u72C0\u614B",Ss(s).label,{always:!0}),n("\u958B\u59CB",e.started_at?we(e.started_at):"\u2014",{always:!0}),n("\u7D50\u675F",e.finished_at?we(e.finished_at):"\u2014",{always:!0}),n("\u8017\u6642",t,{always:!0}),n("\u9032\u5EA6",yt(e.percent),{always:!0});let i=zr(e),o=["extract","raw_parquet"].includes(String(e.key||""));n(o?"\u7D2F\u8A08\u8CC7\u6599\u91CF":"\u8CC7\u6599\u91CF",i!=="\u2014"?i:"");let l=bl(e);return l&&(n("\u91D1\u878D\u6848\u4EF6",`${c(l.matched)} \u7B46`),n("\u5168\u90E8\u6848\u4EF6",`${c(l.processed)} \u7B46`),n("\u91D1\u878D\u4F54\u6BD4",`${l.percent}%`)),n("\u6574\u9AD4\u5360\u6BD4",yt(e.contribution_percent)),s==="failed"||s==="stale"?(n("\u539F\u56E0",e.error||e.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002"),n("\u5EFA\u8B70",e.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002")):n("\u8AAA\u660E",e.message),a.join("")}function Sp(e){let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${m("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A host/model\u3001Blue-Green \u5EFA\u7F6E\u8207\u5404\u968E\u6BB5\u9032\u5EA6\u3002</div>
    </section>`;let a=new Map(s.map(de=>[String(de.key||""),de])),n=a.get("ollama")||{},i=a.get("qdrant")||{},o=a.get("validate")||{},l=e.index_runtime||{},d=l.summary||{},p=l.copy||{},g=Number(l.index_prior_duration_ms||0),$=l.current||{},h=l.embedding||{},u=h.selected||{},b=h.active||{},v=Number(l.expected_count||d.total||i.total||0),k=Number(d.indexed??i.current??0),x=v>0?Math.min(100,k/v*100):i.status==="success"?100:0,_=Number(p.total||0),y=Number(p.copied||0),I=_>0?Math.min(100,y/_*100):p.status==="success"?100:0,pe=String(l.build_mode||""),V=String(t.run_status||""),$e=!!V&&!["running","success","no_change"].includes(V),he=String(p.status||(pe==="reuse"?"pending":"skipped"));$e&&he==="pending"&&(he="stale");let ae=Number(p.duration_ms||0)/1e3,q=ae>0?y/ae:0,A=he==="running"&&q>0&&_>y?(_-y)/q:null,j=$l(e,l,k),K=wl(l,k,v,j),ge=K?.remainingMs&&K.remainingMs>0?K.remainingMs/1e3:null,O=he==="success"||he==="skipped"||k>0||i.status==="success",oe=i.status==="success"?"success":O&&i.status||"pending",je=String(o.status||"pending"),C=je==="success"&&/alias 已切換/.test(String(o.message||"")),ye=C?"success":je==="failed"?"failed":V==="running"?"pending":"skipped",te=l.version_id?`v${String(l.version_id).padStart(3,"0")}`:"\u2014",Se=b.host||u.host||b.url||u.url||"\u2014",qe=b.port||u.port,ve=qe?`${Se}:${qe}`:String(Se),me=b.model||u.model||l.model||"\u2014",ce=O&&$.month?`${_n($.month)}${$.preparing?"\uFF08\u6E96\u5099\u4E2D\uFF09":""}`:t.run_status==="running"?"\u6E96\u5099\u4E2D":"\u2014",se=String($.phase||"")==="embedding"?"E \u65B0 embedding":String($.phase||"")==="reuse"?"R \u91CD\u7528":"\u2014",Te=(()=>{let de=Number(i.duration_ms)||0,et=Date.parse(i.started_at||"");if(i.status==="running"&&Number.isFinite(et))return Math.max(de,Date.now()-et);if(de>0)return de;let Qe=Date.parse(i.finished_at||"");return Number.isFinite(et)&&Number.isFinite(Qe)?Math.max(0,Qe-et):0})(),xe=[{key:"probe",label:"llama-server \u4E3B\u6A5F\uFF0F\u6A21\u578B\u6E2C\u8A66",caption:"\u4E3B\u6A5F\uFF0F\u6A21\u578B\u3001\u9023\u7DDA\u6E2C\u8A66",color:"#22c55e",status:n.status||"pending",percent:Number(n.percent)||0,current:Number(n.current)||0,total:Number(n.total)||0,unit:"\u53F0",duration_ms:n.duration_ms,started_at:n.started_at,finished_at:n.finished_at,extraDetails:[["\u4E3B\u6A5F",ve],["\u6A21\u578B",me],["\u6E2C\u8A66\u4E3B\u6A5F",`${c(n.current||0)} / ${c(n.total||0)} \u53F0`]],detail:`${c(n.current||0)} / ${c(n.total||0)} \u53F0 \xB7 ${ve} \xB7 ${me}`},{key:"version",label:"\u5EFA\u7ACB\uFF0F\u63A5\u7E8C Blue-Green \u7248\u672C",caption:"Blue-Green \u7248\u672C\u3001collection",color:"#06b6d4",status:l.version_id?"success":"pending",percent:l.version_id?100:0,current:l.version_id?1:0,total:1,unit:"\u968E\u6BB5",duration_ms:l.version_duration_ms,started_at:null,finished_at:null,extraDetails:[["\u7248\u672C",te],["Collection",l.collection||"\u2014"],["\u6A21\u5F0F",pe||"\u2014"]],detail:`${te} \xB7 ${l.collection||"\u2014"} \xB7 ${pe||"\u2014"}`},{key:"copy",label:"\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF",caption:"\u820A collection \u5411\u91CF\u8907\u88FD",color:"#f59e0b",status:he,percent:I,current:y,total:_,unit:"points",duration_ms:p.duration_ms,started_at:p.started_at,finished_at:p.finished_at,extraDetails:[["\u5DF2\u8907\u88FD",`${c(y)} points`],["\u7E3D points",c(_)],["\u7BC4\u570D","\u5168\u57DF points\uFF1B\u4E0D\u5217\u5165\u6708\u4EFD R\uFF0FE"],["\u8907\u88FD\u901F\u5EA6",q>0?`${q.toFixed(1)} points/\u79D2`:"\u2014"],p.resumed?["\u4F86\u6E90",`\u7E8C\u8DD1\u524D\u5B8C\u6210${p.resumed_from_run_id?`\uFF08${p.resumed_from_run_id}\uFF09`:""}`]:null,["\u9810\u4F30\u5269\u9918",A!==null?ka(A):"\u2014"]],detail:_>0?`${c(y)} / ${c(_)} points \xB7 \u820A collection \u5411\u91CF${p.resumed?" \xB7 \u7E8C\u8DD1\u524D\u5B8C\u6210":""}`:he==="skipped"?"\u672C\u6B21\u4E0D\u9700\u8907\u88FD\u820A\u5411\u91CF":he==="stale"?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5B8C\u6210\u8907\u88FD":"\u7B49\u5F85\u820A collection \u8907\u88FD"},{key:"index",label:"\u91D1\u878D\u5224\u6C7A\u5411\u91CF\u7D22\u5F15",caption:"R \u85CD\uFF0FE \u7D2B\uFF1B\u672C\u6B21 run \u9032\u5EA6",color:"#a78bfa",barColor:se==="E \u65B0 embedding"?"#a78bfa":se==="R \u91CD\u7528"?"#3b82f6":"",status:oe,phaseKey:se==="R \u91CD\u7528"?"reuse":se==="E \u65B0 embedding"?"embedding":"",phaseLabel:oe==="running"?se:"",percent:x,current:k,total:v,unit:"\u7B46",duration_ms:O?i.duration_ms:0,extraDurationMs:g,started_at:O?i.started_at||l.started_at:null,finished_at:i.finished_at,extraDetails:[["\u5DF2\u7D22\u5F15",`${c(k)} / ${c(v)} \u7B46`],g>0?["\u524D\u6B21\u57F7\u884C",Cs(g)]:null,g>0?["\u672C\u6B21\u57F7\u884C",Cs(Te)]:null,["\u91CD\u7528",c(d.reused)],["\u65B0 embedding",c(d.embedded)],["\u76EE\u524D\u6708\u4EFD",ce],["\u76EE\u524D\u6279\u6B21",se],["\u672C\u6279 R\uFF0FE",`R ${c($.reused||0)} \xB7 E ${c($.embedded||0)}`],["R \u5B9A\u7FA9","04 \u9010\u6708\u6383\u63CF\u6CBF\u7528\uFF1B03 \u8907\u88FD\u70BA\u5168\u57DF points"],["\u9810\u4F30\u5269\u9918",O&&ge!==null?ka(ge):"\u2014"]],htmlDetails:Lp(l),detail:O?`${c(k)} / ${c(v)} \u7B46 \xB7 \u91CD\u7528 ${c(d.reused)} \xB7 \u65B0 embedding ${c(d.embedded)}${se==="\u2014"?"":` \xB7 ${se}`}`:"\u7B49\u5F85\u7248\u672C\u6E96\u5099\uFF08\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF\uFF09\u5B8C\u6210"},{key:"validate",label:"\u9A57\u8B49\u65B0\u7248\u672C",caption:"\u7B46\u6578\u3001\u7DAD\u5EA6\u3001payload",color:"#eab308",status:je,percent:je==="success"?100:0,current:null,total:null,duration_ms:o.duration_ms,started_at:o.started_at,finished_at:o.finished_at,extraDetails:[["\u9A57\u8B49\u8A0A\u606F",o.message||"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210"]],detail:o.message||($e?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u9032\u884C\u9A57\u8B49\u3002":"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210\u5F8C\u9A57\u8B49\u7B46\u6578\u3001\u7DAD\u5EA6\u8207 payload\u3002")},{key:"activate",label:"\u5207\u63DB alias",caption:"judgments_current alias",color:"#3b82f6",status:ye,percent:C?100:0,current:null,total:null,duration_ms:0,started_at:null,finished_at:null,extraDetails:[["\u76EE\u6A19 alias","judgments_current"]],detail:C?o.message:$e?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5207\u63DB alias\u3002":"\u9A57\u8B49\u901A\u904E\u5F8C\u5207\u63DB judgments_current\u3002"}],Re=xe.filter(de=>de.status!=="skipped"),Ce=Re.length?Re.reduce((de,et)=>de+et.percent,0)/Re.length:0,P=xe.filter(de=>de.status==="success").length,B=yt(Ce),U=Date.now(),R=de=>{let et=Number(de.extraDurationMs)||0,Qe=Number(de.duration_ms)||0,it=Date.parse(de.started_at||"");if(de.status==="running"&&Number.isFinite(it))return et+Math.max(Qe,U-it);if(Qe>0)return et+Qe;let gt=Date.parse(de.finished_at||"");return et+(Number.isFinite(it)&&Number.isFinite(gt)?Math.max(0,gt-it):0)},z=xe.map(de=>{let et=R(de);return{...de,computedDuration:et,drawable:!["skipped","pending"].includes(de.status)}}),F=Math.max(z.reduce((de,et)=>de+(et.drawable?et.computedDuration:0),0),Number(t.duration_ms)||0,1),ke=1.25,Oe=z.map(de=>de.drawable?Math.max(de.computedDuration/F*100,ke):0),Ye=Oe.reduce((de,et)=>de+et,0),Ue=Ye>100?100/Ye:1,tt=0,lt=z.map((de,et)=>{let Qe=Oe[et]*Ue,it=Qe>0?{start:tt,width:Qe}:null;return it&&(tt+=Qe),{...de,bar:it}}).map((de,et)=>{let Qe=[`is-${de.status}`,de.status==="failed"||de.status==="stale"?"is-error":"",["pending","skipped"].includes(de.status)?"is-missing":"",de.status==="running"?"is-running":""].filter(Boolean).join(" "),it=["pending","skipped"].includes(de.status)?"\u2014":Cs(de.computedDuration),gt=de.status==="running"?` \xB7 ${yt(de.percent)}`:"",ne=de.phaseLabel?`<span class="index-wf-phase is-${r(de.phaseKey||"unknown")}">${r(de.phaseLabel)}</span>`:"",Ae="";if(de.bar){let ft=Math.max(0,Math.min(100,de.bar.start)),M=Math.max(0,Math.min(100-ft,de.bar.width)),L=de.status==="success"?100:Math.max(0,Math.min(100,Number(de.percent)||0)),E=M*L/100,D=M-E,W=r(de.barColor||de.color);E>0&&(Ae+=`<span class="rag-wf-bar index-wf-bar is-sequential" style="left:${ft.toFixed(3)}%;width:${E.toFixed(4)}%;top:0;height:12px;--bar-color:${W}" aria-hidden="true"></span>`),D>1e-4&&(Ae+=`<span class="rag-wf-bar index-wf-bar is-hollow is-sequential" style="left:${(ft+E).toFixed(3)}%;width:${D.toFixed(4)}%;top:0;height:12px;--bar-color:${W}" aria-hidden="true"></span>`)}let Ke=[],ze=(ft,M)=>{M==null||M===""||Ke.push(`<span class="rag-wf-detail"><span>${r(ft)}</span><strong>${r(String(M))}</strong></span>`)};ze("\u72C0\u614B",Ss(de.status).label),ze("\u958B\u59CB",de.started_at?we(de.started_at):"\u2014"),ze("\u7D50\u675F",de.finished_at?we(de.finished_at):"\u2014"),ze("\u8017\u6642",it),ze("\u9032\u5EA6",yt(de.percent));for(let ft of de.extraDetails||[]){if(!ft)continue;let[M,L]=ft;ze(M,L)}ze("\u8AAA\u660E",de.detail);let Tt={...de,duration_ms:de.computedDuration,contribution_percent:Re.length?(Number(de.percent)||0)/Re.length:null,message:de.detail};return`<details class="rag-wf-stage index-wf-stage ${Qe}" data-index-stage="${r(de.key)}"${Fr.has(de.key)?" open":""} style="--stage-color:${r(de.color)}" ${fl(Tt)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="index-wf-step">${String(et+1).padStart(2,"0")}</span> ${r(de.label)}</strong><small>${r(de.caption||"")}</small></span>
            </span>
            <span class="rag-wf-stage-meta">${r(it)}${r(gt)}${ne?` \xB7 ${ne}`:""} \xB7 ${r(Ss(de.status).label)} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px">${Ae}</span>
        </summary>
        <div class="rag-wf-details">${Ke.join("")}${de.htmlDetails||""}</div>
      </details>`}).join("");return`<section class="report-card processing-card processing-workflow-progress-card index-wf-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${m("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
      <span class="badge ${t.run_status==="running"?"badge-info":"badge-neutral"}">${c(P)} / ${c(Re.length)} \u968E\u6BB5</span>
    </div>
    <div class="index-wf-summary">
      <span>\u6574\u9AD4 <strong class="mono">${B}</strong></span>
      <span>\u7248\u672C <strong class="mono">${r(te)}</strong></span>
      <span>Collection <strong class="mono">${r(l.collection||"\u2014")}</strong></span>
      <span>\u6A21\u5F0F <strong>${r(pe||"\u2014")}</strong></span>
      <span>Host <strong class="mono">${r(ve)}</strong></span>
      <span>Model <strong class="mono">${r(me)}</strong></span>
      <span>\u76EE\u524D <strong>${r(ce)}</strong></span>
    </div>
    <div class="index-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${F>0?r(Cs(F)):"\u2014"}</span>
      </div>
      <div class="rag-wf-legend index-wf-are-legend" aria-label="\u5224\u6C7A\u7D22\u5F15 R\uFF0FE \u984F\u8272\u5716\u4F8B">
        <span><i class="is-reuse"></i>R \u672C\u6B21\u6CBF\u7528\uFF0804 \u85CD\uFF09</span>
        <span><i class="is-embed"></i>E \u65B0 embedding\uFF0804 \u7D2B\uFF09</span>
        <span><i class="is-hollow"></i>04 \u672A\u5B8C\u6210\uFF0825% \u6DFA\u8272\uFF09</span>
      </div>
      <div class="rag-wf-stages">${lt}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7684\u7D50\u675F\u5373\u4E0B\u4E00\u968E\u6BB5\u7684\u958B\u59CB\uFF1B\u5DF2\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u9032\u884C\u4E2D\u6216\u672A\u5B8C\u6210\u968E\u6BB5\u53EA\u8457\u8272\u5DF2\u5B8C\u6210\u6BD4\u4F8B\uFF0C\u5176\u9918\u672A\u5B8C\u6210\u5340\u6BB5\u4EE5\u540C\u8272 25% \u6DFA\u8272\u8868\u793A\uFF0C\u7B49\u5F85\u968E\u6BB5\u4FDD\u7559\u7A7A\u5FC3\u8ECC\u9053\u3001\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\u3002\u6975\u77ED\u968E\u6BB5\u6703\u4EE5\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u5448\u73FE\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u9032\u5EA6\u8207\u8A73\u7D30\u6578\u64DA\u3002</p>
    </div>
    <div class="index-wf-overall">
      <div class="index-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${B}</span>
      </div>
      <div class="index-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,Ce)).toFixed(1)}%"></span>
      </div>
    </div>
  </section>`}function xp(e){if(e.id==="index_versions")return Sp(e);let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${m("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u5404\u968E\u6BB5\u8207\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </section>`;let a=Date.now(),n=s.map(C=>{let ye=String(C.status||"idle");return{...C,status:ye,computedDuration:wp(C,a),drawable:!["pending","skipped","idle"].includes(ye)}}),i=n.filter(C=>C.status!=="skipped"),o=n.filter(C=>C.drawable).reduce((C,ye)=>C+ye.computedDuration,0),l=Math.max(o,Number(t.duration_ms)||0,1),d=n.some(C=>C.computedDuration>0),p=1.25,g=n.map(C=>C.drawable?Math.max(C.computedDuration/l*100,p):0),$=g.reduce((C,ye)=>C+ye,0),h=$>100?100/$:1,u=0,b=n.map((C,ye)=>{let te=g[ye]*h,Se=C.drawable?{start:u,width:te}:null;return Se&&(u+=te),{...C,bar:Se}}),v=n.filter(C=>["success","no_change"].includes(C.status)).length,k=n.find(C=>C.status==="running"),x=n.filter(C=>C.status==="running").length,_=n.filter(C=>["pending","idle"].includes(C.status)).length,y=n.filter(C=>C.status==="skipped").length,I=i.length||Number(t.total_stages)||0,pe=t.overall_percent,V=pe==null||pe===""?null:Number(pe),$e=Number.isFinite(V)?yt(V):"\u2014",he=d?Cs(l):"\u2014",ae=String(t.run_status||""),q=ae?Ss(ae).label:"\u2014",A=k&&(k.label||k.key)||"\u2014",j=n.map(C=>Date.parse(C.started_at||"")).filter(C=>Number.isFinite(C)),K=n.map(C=>Date.parse(C.finished_at||"")).filter(C=>Number.isFinite(C)),ge=j.length?new Date(Math.min(...j)).toISOString():null,O=k?null:K.length?new Date(Math.max(...K)).toISOString():null,oe=b.map((C,ye)=>{let te=C.status,Se=["failed","stale","interrupted"].includes(te),qe=[`is-${te}`,Se?"is-error":"",["pending","skipped","idle"].includes(te)?"is-missing":"",te==="running"?"is-running":""].filter(Boolean).join(" "),ve=C.drawable?Cs(C.computedDuration):"\u2014",me=Ss(te).label,ce=te==="failed"?`\u539F\u56E0\uFF1A${String(C.error||C.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002").trim()}
\u5EFA\u8B70\uFF1A${String(C.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002").trim()}`:"",se=ce?`<span class="badge badge-danger is-failure-tip" tabindex="0" aria-label="${r(ce)}" data-failure-tip="${r(ce)}"><span class="status-dot is-danger"></span>\u5931\u6557</span>`:r(me),Te=ol(C),xe=Se?"var(--danger)":Te,Re=te==="running"?` \xB7 ${yt(C.percent)}`:"",Ce="";if(C.bar){let F=Math.max(0,Math.min(100,C.bar.start)),ke=Math.max(0,Math.min(100-F,C.bar.width)),Oe=["success","no_change"].includes(te)?100:Math.max(0,Math.min(100,Number(C.percent)||0)),Ye=ke*Oe/100,Ue=ke-Ye;Ye>0&&(Ce+=`<span class="rag-wf-bar workflow-wf-bar is-sequential" style="left:${F.toFixed(3)}%;width:${Ye.toFixed(4)}%;top:0;height:12px;--bar-color:${r(xe)}" aria-hidden="true"></span>`),Ue>1e-4&&(Ce+=`<span class="rag-wf-bar workflow-wf-bar is-hollow is-sequential" style="left:${(F+Ye).toFixed(3)}%;width:${Ue.toFixed(4)}%;top:0;height:12px;--bar-color:${r(xe)}" aria-hidden="true"></span>`)}let P=C.label||C.key||"\u968E\u6BB5",B=_p(C),U=`${P}\uFF1A${me}\uFF0C${te==="running"?`\u9032\u5EA6 ${yt(C.percent)}\uFF0C`:""}\u8017\u6642 ${ve}`,R={...C,duration_ms:C.computedDuration,message:ce||C.message||B||""},z=`${e.id}:${C.key||ye}`;return`<details class="rag-wf-stage workflow-wf-stage ${qe}" data-workflow-wf-stage="${r(z)}"${Or.has(z)?" open":""} style="--stage-color:${r(Te)}" ${fl(R)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="workflow-wf-step">${String(ye+1).padStart(2,"0")}</span> ${r(P)}</strong>${B?`<small>${r(B)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(ve)}${r(Re)} \xB7 ${se} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(U)}">${Ce}</span>
        </summary>
        <div class="rag-wf-details">${kp(C,ve)}</div>
      </details>`}).join(""),je=Qu[e.id]||"";return`<section class="report-card processing-card processing-workflow-progress-card workflow-wf-card" data-workflow-progress>
    <div class="side-card-head index-runtime-head workflow-wf-head">
      <span class="side-card-title">${m("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
      <div class="index-runtime-metrics workflow-wf-metrics">
        <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u5168\u90E8\u968E\u6BB5\u7684\u6578\u91CF\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${v} / ${I}</strong></span>
        <span class="index-runtime-metric" title="\u76EE\u524D\u57F7\u884C\u4E2D\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u57F7\u884C\u4E2D</span><strong>${x}</strong></span>
        <span class="index-runtime-metric" title="\u5C1A\u672A\u958B\u59CB\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7B49\u5F85</span><strong>${_}</strong></span>
        <span class="index-runtime-metric" title="\u672C\u6B21\u6D41\u7A0B\u4E0D\u9700\u8981\u57F7\u884C\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7565\u904E</span><strong>${y}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u968E\u6BB5\u8017\u6642\u5408\u8A08\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(he)}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u53C3\u8207\u968E\u6BB5\u5B8C\u6210\u6BD4\u4F8B\u7684\u5E73\u5747\u3002"><span>\u6574\u9AD4\u9032\u5EA6</span><strong>${$e}</strong></span>
      </div>
    </div>
    <div class="workflow-wf-summary">
      <span>\u57F7\u884C <strong>${r(q)}</strong></span>
      <span>\u958B\u59CB <strong>${ge?r(we(ge)):"\u2014"}</strong></span>
      <span>\u7D50\u675F <strong>${k?"\u9032\u884C\u4E2D":O?r(we(O)):"\u2014"}</strong></span>
      <span>\u76EE\u524D <strong>${r(A)}</strong></span>
      <span>Run <strong class="mono">${r(t.run_id||"\u2014")}</strong></span>
    </div>
    <div class="workflow-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${r(he)}</span>
      </div>
      <div class="rag-wf-legend workflow-wf-legend" aria-label="\u968E\u6BB5\u72C0\u614B\u5716\u4F8B">
        <span><i class="is-solid-state"></i>\u5B8C\u6210</span>
        <span><i class="is-hollow-state"></i>\u672A\u5B8C\u6210\uFF0825% \u6DFA\u8272\uFF09</span>
        <span><i class="is-progress-state"></i>\u57F7\u884C\u4E2D\uFF08\u9032\u5EA6\u689D\uFF09</span>
        <span><i class="is-empty-state"></i>\u7B49\u5F85\uFF0F\u7565\u904E</span>
      </div>
      <div class="rag-wf-stages">${oe}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7684\u7D50\u675F\u5373\u4E0B\u4E00\u968E\u6BB5\u7684\u958B\u59CB\uFF1B\u5DF2\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u57F7\u884C\u4E2D\u6216\u672A\u5B8C\u6210\u968E\u6BB5\u53EA\u8457\u8272\u5DF2\u5B8C\u6210\u6BD4\u4F8B\uFF0C\u5176\u9918\u672A\u5B8C\u6210\u5340\u6BB5\u4EE5\u540C\u8272 25% \u6DFA\u8272\u8868\u793A\uFF0C\u7B49\u5F85\u968E\u6BB5\u4FDD\u7559\u7A7A\u5FC3\u8ECC\u9053\u3001\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\u3002\u6975\u77ED\u968E\u6BB5\u6703\u4EE5\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u5448\u73FE\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u9032\u5EA6\u8207\u8A73\u7D30\u6578\u64DA\u3002</p>
    </div>
    <div class="workflow-wf-overall">
      <div class="workflow-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${$e}</span>
      </div>
      <div class="workflow-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,Number.isFinite(V)?V:0)).toFixed(1)}%"></span>
      </div>
    </div>
    ${je?`<p class="processing-workflow-scope-note">${m("info",12)}<span>${r(je)}</span></p>`:""}
  </section>`}function _n(e){let t=String(e||"");return t.length===6?`${t.slice(0,4)}-${t.slice(4)}`:t||"\u2014"}function hl(e){return e?.scan_order==="issue_month"?"\u7D22\u5F15\u6383\u63CF\u9806\u5E8F\u4F9D\u6708\u4EFD\u7531\u820A\u5230\u65B0\uFF1B\u540C\u6708\u4EFD\u518D\u4F9D\u532F\u5165 ID\u3002":"\u6B64 run \u662F\u820A\u7248\u6383\u63CF\u9806\u5E8F\uFF08\u4F9D\u532F\u5165 ID\uFF0C\u975E\u6708\u4EFD\u9806\u5E8F\uFF09\uFF1B\u65B0 run \u624D\u6703\u7531\u6700\u820A\u6708\u4EFD\u958B\u59CB\u3002"}function Ap(e,t=!1){let s=Number(e?.reused),a=Number(e?.embedded);if(!Number.isFinite(s)||!Number.isFinite(a)||s<=0&&a<=0)return"";let n=[];if(s>0&&n.push(`<span class="index-current-phase is-reuse"
      title="R \xB7 \u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF0C\u672C\u6279 ${c(s)} \u7B46">
      <strong>R</strong><span>\u6CBF\u7528 ${c(s)} \u7B46</span>
    </span>`),a>0){let i=e.phase==="embedding"&&t?"\u8A08\u7B97\u4E2D":"\u65B0 embedding";n.push(`<span class="index-current-phase is-embed"
      title="E \xB7 \u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding\uFF0C\u672C\u6279 ${c(a)} \u7B46">
      <strong>E</strong><span>${i} ${c(a)} \u7B46</span>
    </span>`)}return`<span class="index-current-phases" aria-label="\u672C\u6279\u6B21 R\uFF0FE \u52D5\u4F5C">
    <span class="index-current-phase-label">\u672C\u6279</span>
    ${n.join("")}
  </span>`}function Mp(e){let t=Array.isArray(e.months)?e.months:[],s=new Map;for(let n of t){let i=String(n.month||"");if(!/^\d{6}$/.test(i))continue;let o=s.get(i);o||(o={total:0,processed:0},s.set(i,o)),o.total+=Number(n.total)||0,o.processed+=Number(n.processed)||0}let a=0;for(let n of s.values())n.total>0&&n.processed>=n.total&&(a+=1);return{completed:a,total:s.size}}function rl(e){let t=String(e||"").match(/(\d{8})Update/i);return t?Number(t[1]):0}function Vt(e){let t=Number(e);return Number.isFinite(t)&&t>0?t:0}function il(e,t){let s=Vt(t),a=Vt(e);if(s<=0)return{processed:0,total:0,percent:null,fill:0,complete:!1,empty:!0,stateClass:"is-empty"};let n=Math.min(100,Math.round(a/s*1e3)/10),i=a>=s;return{processed:a,total:s,percent:n,fill:i?100:n,complete:i,empty:!1,stateClass:i?"is-complete":"is-incomplete"}}function vl(e){let t=Array.isArray(e.months)?e.months:[],s=e.current||{},a=!!s.preparing&&e.scan_order==="issue_month",n=new Map;for(let i of t){let o=String(i.month||"");if(!/^\d{6}$/.test(o))continue;let l=Number(o.slice(4,6));if(l<1||l>12)continue;let d=n.get(o);d||(d={key:o,year:o.slice(0,4),monthNo:l,rows:[],archives:[],current:!1,preparing:!1,currentArchive:"",jid:""},n.set(o,d));let p=String(i.archive||"");d.rows.push({archive:p,total:Vt(i.total),processed:Vt(i.processed)}),p&&d.archives.push(p),!a&&s.month===o&&(!s.archive||s.archive===p)&&(d.current=!0,d.preparing=!!s.preparing,d.currentArchive=String(s.archive||p||""),d.jid=String(s.jid||""))}return n}function qp(e){let t=vl(e),s=e.summary||{},a=e.copy||{},n=Vt(s.total),i=Vt(a.total),o=t.size,l=i>0?Math.min(i,n||i):0,d=i>0?Math.max(0,(n||i)-i):n,p=Vt(s.reused),g=Vt(s.embedded);return{totalMonths:o,reusePool:l,reused:p,reusePercent:l>0?Math.min(100,100*p/l):null,embedPool:d,embedded:g,embedPercent:d>0?Math.min(100,100*g/d):null}}function Lp(e){let t=qp(e);if(!t.totalMonths)return"";let s=[],a=(n,i,o,l,d)=>{let p=l===null?0:Math.max(0,Math.min(100,l));s.push(`<div class="index-wf-are-row ${n}">
      <span class="index-wf-are-label"><i aria-hidden="true"></i>${r(i)}</span>
      <span class="index-wf-are-value">${r(o)}${d?`<small>${r(d)}</small>`:""}</span>
      <span class="index-wf-are-track" aria-hidden="true"><span style="width:${p.toFixed(1)}%"></span></span>
    </div>`)};return(t.reusePool>0||t.reused>0)&&a("is-reuse","R \u672C\u6B21\u6CBF\u7528",`${c(t.reused)} / ${c(t.reusePool)} \u7B46`,t.reusePercent,"04 \u9010\u6708\u6CBF\u7528"),t.embedPool>0?a("is-embed","E \u672C\u6B21\u65B0 embedding",`${c(t.embedded)} / ${c(t.embedPool)} \u7B46`,t.embedPercent,"E backlog"):a("is-embed is-complete","E \u672C\u6B21\u65B0 embedding","\u7121 E backlog",100,"\u4E0D\u9700\u65B0 embedding"),`<div class="index-wf-are-breakdown" aria-label="R\uFF0FE \u5206\u6D41">
    <div class="index-wf-are-head"><strong>R\uFF0FE \u5206\u6D41</strong><span>\u5169\u689D bar \u5404\u81EA\u4EE5\u81EA\u5DF1\u7684 total \u8A08\u7B97\uFF0C\u4E0D\u53EF\u76F8\u52A0\uFF1B\u7686\u70BA\u672C\u6B21 run\u3002</span></div>
    ${s.join("")}
  </div>`}function jp(e){let t=e.current||{},s=!!e.coverage_only,a=e.active_archive_coverage||{},n=vl(e);if(!n.size)return'<div class="processing-workflow-empty">\u5C1A\u7121\u53EF\u986F\u793A\u7684\u7D22\u5F15\u6708\u4EFD\uFF1B\u958B\u59CB\u7D22\u5F15\u5F8C\u6703\u4F9D\u6642\u9593\u5217\u51FA\u6708\u4EFD\u72C0\u614B\u3002</div>';let i={reuseComplete:0,reuseIncomplete:0,embedComplete:0,embedIncomplete:0};for(let u of n.values()){let b=[...u.rows].sort((O,oe)=>rl(oe.archive)-rl(O.archive)),v=b[0],k=b.length>1?b.slice(1):[v],_=(a[u.key]||{})[v.archive],y=Vt(_?.total),I=Vt(_?.processed),pe=y>0&&I>=y,V=k.reduce((O,oe)=>O+oe.total,0),$e=k.reduce((O,oe)=>O+oe.processed,0),he=v.total,ae=v.processed,q=il($e,V),A=!s&&pe,ge=il(A?I:ae,A?y:he);u.latest=v,u.baselineRows=k,u.reuseState=q,u.embedState=ge,u.reuseComplete=q.complete,u.embedComplete=ge.complete,u.embedNoBacklog=A,q.complete?i.reuseComplete+=1:i.reuseIncomplete+=1,ge.complete?i.embedComplete+=1:i.embedIncomplete+=1}let l=[...new Set([...n.values()].map(u=>u.year))].sort((u,b)=>b.localeCompare(u)).map(u=>{let b=Array.from({length:12},(v,k)=>{let x=k+1,_=`${u}${String(x).padStart(2,"0")}`,y=n.get(_);if(!y)return`<td class="judgment-month is-empty"><span>${x}</span></td>`;let I=y.current&&e.run_status==="running",pe=j=>j.percent===null?"\u2014":`${j.percent}%`,V=j=>j.empty?"\u7121\u8CC7\u6599":j.complete?"\u5B8C\u6210":"\u672A\u5B8C\u6210",$e=String(t.phase||"")==="embedding"?"E \u65B0 embedding":String(t.phase||"")==="reuse"?"R \u91CD\u7528":"R\uFF0FE",he=y.latest&&y.latest.total>0?`${(100*y.latest.processed/y.latest.total).toFixed(1)}%`:"\u2014",ae=y.current&&y.latest?`\u672C\u6B21 run ${$e} ${c(y.latest.processed)} / ${c(y.latest.total)}\uFF08${he}\uFF09`:"",q=[`${y.year}-${String(y.monthNo).padStart(2,"0")}`,y.archives.join("\u3001")||"\u2014",`R \u672C\u6B21\u6CBF\u7528 ${c(y.reuseState.processed)} / ${c(y.reuseState.total)}\uFF08${pe(y.reuseState)}\uFF09\xB7 ${V(y.reuseState)}`,y.embedNoBacklog?`E \u7121 E backlog\uFF08latest archive \u5DF2\u7531 active \u7248\u672C\u8986\u84CB ${c(y.embedState.total)} \u7B46\uFF1B\u4E0D\u9700\u65B0 embedding\uFF09`:`E \u65B0 embedding ${c(y.embedState.processed)} / ${c(y.embedState.total)}\uFF08${pe(y.embedState)}\uFF09\xB7 ${V(y.embedState)}`,y.reuseComplete?"":"\u5F85\u5B8C\u6210\uFF1AR \u65E2\u6709\u5411\u91CF\u91CD\u7528",y.embedComplete?"":"\u5F85\u5B8C\u6210\uFF1AE \u65B0 embedding",ae,y.current?`${y.preparing?"\u6E96\u5099\u7D22\u5F15":I?"\u76EE\u524D\u7D22\u5F15":"\u6700\u5F8C\u7D22\u5F15"} \xB7 ${$e}${y.jid?` \xB7 ${y.jid}`:""}`:""].filter(Boolean).join(" \xB7 "),A=[["is-reuse",y.reuseState],["is-embed",y.embedState]].map(([j,K])=>`<span class="index-month-block ${j} ${K.stateClass}" style="--fill:${K.fill.toFixed(1)}%"></span>`).join("");return`<td class="judgment-month index-month index-month-are processing-month is-neutral${I?" is-current":""}" title="${r(q)}"${I?' aria-current="true"':""}><span class="index-month-number">${x}</span><span class="index-month-blocks" aria-hidden="true">${A}</span></td>`}).join("");return`<tr><th scope="row">${r(u)}</th>${b}</tr>`}).join(""),d=e.copy||{},p=Vt(d.total),g=Vt(d.copied),$=d.status==="success"?"\u5B8C\u6210":d.status==="running"?"\u57F7\u884C\u4E2D":d.status==="stale"?"\u4E2D\u6B62":"\u7B49\u5F85";return`<div class="judgment-months index-months">
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
    <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA R\uFF08\u672C\u6B21\u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF09\u3001E\uFF08\u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding\uFF09\uFF0C\u5169\u683C\u90FD\u662F\u672C\u6B21 run \u7684\u9032\u5EA6\uFF1B\u5B8C\u6210\u70BA\u5BE6\u5FC3\uFF1B\u672A\u5B8C\u6210\u6642\u5DF2\u5B8C\u6210\u6BD4\u4F8B\u70BA\u5BE6\u8272\u3001\u5269\u9918\u5340\u6BB5\u70BA\u540C\u8272 25% \u6DFA\u8272\uFF0C\u56E0\u6B64 0% \u6642\u6574\u683C\u90FD\u662F\u6DFA\u8272\uFF1B\u7121\u8CC7\u6599\u624D\u662F\u6DE1\u8272\u7A7A\u5FC3\u3002\u6700\u65B0 archive \u5DF2\u88AB active collection \u5B8C\u6574\u8986\u84CB\uFF08\u7121 E backlog\uFF09\u7684\u672A\u8B8A\u66F4\u6708\u4EFD\uFF0CE \u53EF\u4F7F\u7528 active \u8986\u84CB\u986F\u793A\u5B8C\u6210\uFF1BR \u4E00\u5F8B\u4F7F\u7528\u672C\u6B21 run \u7684 processed\uFF0Ftotal\uFF0C\u5C1A\u672A\u6383\u5230\u7684\u5F8C\u7E8C\u6708\u4EFD\u7DAD\u6301 25% \u6DFA\u8272\u3002\u4ECD\u6709 E backlog \u7684\u6708\u4EFD\uFF0CR\uFF0FE \u90FD\u4F7F\u7528\u672C\u6B21 run \u7684 processed\uFF0Ftotal\u3002E \u7121 backlog \u6642\u82E5\u986F\u793A\u5BE6\u5FC3\uFF0Ctooltip \u6703\u6A19\u793A\u4E0D\u9700\u65B0 embedding\u300203 \u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF\u662F\u5168\u57DF points \u6E96\u5099\u968E\u6BB5\uFF0C\u4E0D\u6703\u91CD\u8907\u756B\u6210\u6708\u4EFD\u5206\u683C\uFF1BR \u662F 04 \u9010\u6708\u6383\u63CF\u9032\u5EA6\u3002summary \u8207\u65B9\u584A\u4F7F\u7528\u540C\u4E00\u4EFD\u72C0\u614B\uFF0Csidebar \u66F4\u65B0 badge \u53E6\u4EE5 E backlog \u6708\u4EFD\u8A08\u3002\u540C\u4E00\u6708\u4EFD\u53EF\u80FD\u6709\u591A\u500B archive\uFF0CR \u4F7F\u7528\u8F03\u820A\u7684\u57FA\u7DDA archive\uFF0CE \u4F7F\u7528\u540D\u7A31\u4E2D\u66F4\u65B0\u65E5\u671F\u6700\u65B0\u7684 archive\uFF1B\u65B0\u820A archive \u4E0D\u6703\u76F8\u52A0\u3002E \u5B8C\u6210\uFF0F\u672A\u5B8C\u6210\u4EE5\u6708\u4EFD\u8A08\uFF0C\u4E0D\u662F RAR \u6A94\u6578\u3002${hl(e)}\u7DA0\u6846\u53EA\u6A19\u793A\u76EE\u524D\u6279\u6B21\u6240\u5728\u6708\u4EFD\u3002\u76EE\u524D\u7D22\u5F15\u6708\u4EFD\u4EE5\u5BE6\u7DDA\u5916\u6846\u6A19\u793A\uFF0Cpadding \u4E0D\u4F7F\u7528\u72C0\u614B\u5E95\u8272\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B R\uFF0FE \u9032\u5EA6\u8207\u76EE\u524D\u6848\u865F\u3002</p>
  </div>`}function Tp(e){let t=e.import_timeline||{},s=Array.isArray(t.months)?t.months:[];if(!s.length)return`<section class="report-card processing-card import-files-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u672A\u53D6\u5F97\u5224\u6C7A\u4E0B\u8F09 manifest \u6216\u672C\u6A5F\u58D3\u7E2E\u6A94\uFF1B\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u5F8C\u6703\u986F\u793A\u6708\u4EFD\u72C0\u614B\u3002</div>
    </section>`;let a=new Map(s.map(h=>[String(h.month),h])),n=[...new Set(s.map(h=>h.year))].sort((h,u)=>u-h),i=["extract","raw_parquet","filter","postgres"],o=t.stage_labels||{},l=n.map(h=>{let u=Array.from({length:12},(b,v)=>{let k=v+1,x=`${h}${String(k).padStart(2,"0")}`,_=a.get(x);return Gr({month:_,year:h,monthNo:k,stageOrder:i,stageLabels:o,stageStatuses:_?.import_stages||{},stageProgress:_?.import_stage_progress||{},overall:_?.import_overall||"empty",active:!!_?.active,processing:String(_?.month||"")===String(t.processing_month||""),workflowForStage:()=>"judgment_import",variant:"import"})}).join("");return`<tr><th scope="row">${r(h)}</th>${u}</tr>`}).join(""),d=t.summary||{},p=t.stage_summary||{},g=s.find(h=>h.active),$=g?`<div class="index-current-row">${cl({activeMonth:t.active_month||String(g.month||""),activeArchive:t.active_archive||g.active_archive||"",activePhase:t.active_phase||"",processingMonth:t.processing_month||"",processingArchive:t.processing_archive||"",stageLabels:o})}</div>`:"";return`<section class="report-card processing-card import-files-card" data-import-timeline="judgment">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
      ${Zu(t,s,p,d)}
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
  </section>`}function $l(e,t,s){let n=[t.run_id||e.active_run?.id||e.last_run?.id||"",t.version_id??"",t.collection||"",t.started_at||""].join("|"),i=Date.now(),o=Ko.get(n);if(!o){let h=Date.parse(t.started_at||""),u=Date.parse(t.finished_at||""),b=Date.parse(t.updated_at||"");t.run_status!=="running"&&Number.isFinite(h)&&(Number.isFinite(u)||Number.isFinite(b))?o={at:h,indexed:0}:o={at:i,indexed:Math.max(0,s)},Ko.set(n,o)}let l=Date.parse(t.finished_at||""),d=Date.parse(t.updated_at||""),p=t.run_status==="running"?i:Number.isFinite(l)?l:Number.isFinite(d)?d:i,g=Math.max(0,(p-Number(o.at||0))/1e3),$=Math.max(0,Number(s)-Number(o.indexed||0));return g<=0||$<=0?0:$/g}function Cs(e){let t=Number(e);return!Number.isFinite(t)||t<0?"\u2014":t>=36e5?yl(t):fe(t)}function yl(e){if(!Number.isFinite(e)||e<0)return"\u2014";let t=Math.max(0,Math.round(e/1e3)),s=Math.floor(t/3600),a=Math.floor(t%3600/60),n=t%60,i=String(n).padStart(2,"0");return s>0?`${s}h ${String(a).padStart(2,"0")}m ${i}s`:a>0?`${a}m ${i}s`:`${n}s`}function wl(e,t,s,a){let n=Date.parse(e.started_at||"");if(!Number.isFinite(n))return{elapsedMs:null,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let i=e.run_status==="running",o=Date.parse(e.finished_at||""),l=Date.parse(e.updated_at||""),d=i?Date.now():Number.isFinite(o)?o:Number.isFinite(l)?l:Date.now(),p=Math.max(0,d-n),g=Number(s),$=Number(t);if(!Number.isFinite(g)||g<=0)return{elapsedMs:p,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let h=Math.max(0,g-Math.max(0,Number.isFinite($)?$:0));if(h<=0)return{elapsedMs:p,estimatedTotalMs:p,remainingMs:0,remainingCount:0};if(!i||a<=0)return{elapsedMs:p,estimatedTotalMs:null,remainingMs:null,remainingCount:h};let u=h/a*1e3;return{elapsedMs:p,estimatedTotalMs:p+u,remainingMs:u,remainingCount:h}}function Ep(e){let t=e.index_runtime||{};if(!t.available)return"";let s=!!t.coverage_only,a=hl(t),n=t.current||{},i=t.summary||{},o=Number(i.indexed??n.indexed??0),l=s?0:$l(e,t,o),d=Mp(t),p=s?null:wl(t,o,i.total,l),g=p?.remainingCount>0?`\u8207\u5269\u9918 ${c(p.remainingCount)} \u7B46`:"",$=l>0?`\u4F9D\u672C\u6B21\u5E73\u5747 ${l.toFixed(1)} \u7B46/\u79D2${g}\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002\u5BE6\u969B\u901F\u5EA6\u6703\u96A8 embedding \u8207\u6279\u6B21\u5927\u5C0F\u8B8A\u52D5\u3002`:"\u5C1A\u7121\u8DB3\u5920\u7684\u672C\u9801\u89C0\u5BDF\u8CC7\u6599\u53EF\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002",h=y=>r(yl(p?p[y]:null)),u=`<div class="index-runtime-metrics">
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
    <span class="index-runtime-metric" title="\u81EA\u672C\u6B21\u7D22\u5F15 run \u958B\u59CB\u6642\u9593 ${r(we(t.started_at))} \u8D77\u7B97\uFF1B\u4E2D\u9014\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002">
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
  </div>`,b=t.run_status==="running"?n.preparing?"\u6E96\u5099\u4E2D":"\u76EE\u524D\u8655\u7406":"\u6700\u5F8C\u8655\u7406",v=!!n.preparing&&t.scan_order==="issue_month",k=t.copy||{},x=Number(k.total)>0?`\u8907\u88FD ${c(k.copied)} / ${c(k.total)} points`:"\u5EFA\u7ACB\u65B0\u7248\u672C collection",_=v?`<div class="index-current-row">
        <span class="badge badge-info" title="${r(a)}">${m("activity",11)}\u6E96\u5099\u4E2D</span>
        <span class="index-current-copy">${r(x)}\uFF1B\u7248\u672C\u6E96\u5099\u5B8C\u6210\u5F8C\u6703\u5F9E\u6700\u820A\u6708\u4EFD\u958B\u59CB\u7D22\u5F15\uFF0C\u7B2C\u4E00\u6279\u958B\u59CB\u524D\u4E0D\u6A19\u793A\u76EE\u524D\u6708\u4EFD\u3002</span>
      </div>`:n.jid?`<div class="index-current-row">
        <span class="badge badge-info" title="${r(a)}">${m("activity",11)}${b}</span>
        <strong class="mono">${r(_n(n.month))}</strong>
        <span class="mono">${r(n.archive||"\u2014")}</span>
        ${n.preparing?"":Ap(n,t.run_status==="running")}
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
    ${_}
    ${jp(t)}
    ${s?'<p class="judgment-months-hint index-coverage-note">\u76EE\u524D\u6C92\u6709\u672C\u6B21\u7D22\u5F15 run\uFF1BR\uFF0FE \u6642\u9593\u8868\u6703\u5728\u7248\u672C\u5EFA\u7F6E\u958B\u59CB\u5F8C\u986F\u793A\u672C\u6B21\u9032\u5EA6\u3002</p>':""}
  </section>`}function Np(e={}){let{storage:t,loading:s,error:a}=e;if(a)return`<section class="report-card processing-card index-storage-card">
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
    <div class="index-runtime-foot">\u8CC7\u6599\u6642\u9593 ${r(we(t.checked_at))}</div>
  </section>`}function Jr({badge:e="",lead:t="",rows:s=[],note:a=""}){return`<section class="report-card processing-card parquet-help-card workflow-help-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("info",14)}\u529F\u80FD\u8AAA\u660E</span>
      ${e?`<span class="badge badge-neutral">${r(e)}</span>`:""}
    </div>
    <div class="parquet-help-body">
      <p class="parquet-help-lead">${t}</p>
      <div class="parquet-help-grid">${s.map(([n,i])=>`<span>${r(n)}</span><strong>${i}</strong>`).join("")}</div>
      ${a?`<p class="parquet-help-note">${a}</p>`:""}
    </div>
  </section>`}function Rp(){return Jr({badge:"\u552F\u8B80\u532F\u51FA",lead:"\u5C07 PostgreSQL \u76EE\u524D\u6709\u6548\u7684\u5224\u6C7A\uFF08<code>judgment_documents.is_current = true</code>\uFF09\u532F\u51FA\u6210\u7368\u7ACB\u7684 Parquet \u5FEB\u7167\uFF0C\u4F9B\u96E2\u7DDA\u5206\u6790\u3001\u8CC7\u6599\u4EA4\u63DB\u6216\u4FDD\u5B58\u3002",rows:[["\u4F86\u6E90","PostgreSQL <code>judgment_documents</code>\uFF0C\u53EA\u542B\u76EE\u524D\u6709\u6548\u4E14\u5DF2\u547D\u4E2D\u91D1\u878D\u6CD5\u898F\u6E05\u55AE\u7684\u5224\u6C7A\u3002"],["\u8F38\u51FA",'<span class="mono">JUDGMENT_DATA_DIR/parquet/judgments/YYYYMMDD/HHMMSS-xxxxxxxx/judgments.parquet</span>'],["\u9644\u5E36\u6A94",'<span class="mono">\u540C\u76EE\u9304 manifest.json\uFF08\u7B46\u6578\u3001\u6A94\u6848\u5927\u5C0F\u3001\u6B04\u4F4D\u3001\u7522\u751F\u6642\u9593\uFF09</span>'],["\u5167\u5BB9","\u6848\u865F\u3001\u6CD5\u9662\u3001\u6848\u7531\u3001\u5168\u6587\u3001\u547D\u4E2D\u6CD5\u898F\u3001\u5F15\u7528\u3001\u4F86\u6E90\u58D3\u7E2E\u6A94\u8207\u6642\u9593\u6B04\u4F4D\uFF1B<code>citations</code> \u4EE5 JSON \u5B57\u4E32\u4FDD\u5B58\u3002"],["\u8207\u539F\u59CB Parquet","\u8CC7\u6599\u9801\u8207 <code>source=parquet</code> \u4F7F\u7528 <code>parquet/raw_judgments/.../raw.parquet</code>\uFF1B\u672C\u6D41\u7A0B\u7684 <code>parquet/judgments/...</code> \u662F\u53E6\u4E00\u500B\u6B63\u898F\u5316\u5FEB\u7167\u3002"],["\u4E0D\u6703","\u4E0D\u5BEB\u56DE PostgreSQL\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u820A\u5FEB\u7167\uFF1B\u53EA\u532F\u51FA current \u8CC7\u6599\uFF0C\u4E0D\u542B\u6B77\u53F2\u7248\u672C\u3002"],["\u4E2D\u65B7","\u6BCF\u6B21\u57F7\u884C\u5EFA\u7ACB\u65B0\u7684\u5B8C\u6574\u5FEB\u7167\uFF1B\u4E2D\u65B7\u5F8C\u91CD\u65B0\u57F7\u884C\u4E0D\u6703\u7E8C\u5BEB\u540C\u4E00\u500B Parquet \u6A94\u3002"]],note:"\u9069\u5408 DuckDB\u3001pandas\u3001Spark \u7B49\u96E2\u7DDA\u5206\u6790\uFF0C\u6216\u9700\u8981\u56FA\u5B9A\u6642\u9593\u9EDE\u7684\u53EF\u91CD\u73FE\u8CC7\u6599\u5FEB\u7167\u3002\u65E5\u5E38 RAG \u67E5\u8A62\u8207\u8CC7\u6599\u9801\u700F\u89BD\u4E0D\u9700\u8981\u57F7\u884C\u6B64\u6D41\u7A0B\u3002"})}function Cp(){return Jr({badge:"PostgreSQL \u56DE\u586B",lead:"\u5C07\u5224\u6C7A\u7684 <code>court</code> \u8F49\u6210\u6A19\u6E96\u6CD5\u9662\u540D\u7A31\u4E26\u5BEB\u5165 <code>court_normalized</code>\uFF1B\u539F\u59CB <code>court</code> \u6703\u4FDD\u7559\u4F9B\u8FFD\u6EAF\u3002",rows:[["\u8655\u7406\u7BC4\u570D","\u9810\u8A2D\u53EA\u8655\u7406 <code>court_normalized</code> \u70BA\u7A7A\u7684\u8CC7\u6599\uFF1B\u5DF2\u6B63\u898F\u5316\u8CC7\u6599\u6703\u8DF3\u904E\uFF0C\u53EF\u7528 <code>--all</code> \u91CD\u65B0\u8A08\u7B97\u5168\u90E8\u3002"],["\u89E3\u6790\u9806\u5E8F","\u539F\u59CB\u6CD5\u9662\u503C\u958B\u982D\u7B26\u5408\u6A19\u6E96\u540D\u7A31 \u2192 \u5224\u6C7A\u5168\u6587\u524D 8,000 \u5B57\u6700\u65E9\u51FA\u73FE\u7684\u6CD5\u9662 \u2192 \u539F\u59CB\u6CD5\u9662\u503C\u4EFB\u610F\u4F4D\u7F6E\u7684\u6A19\u6E96\u540D\u7A31 \u2192 JID \u5B98\u65B9\u6CD5\u9662\u4EE3\u78BC\u3002"],["\u8F38\u51FA","\u5BEB\u5165 <code>judgment_documents.court_normalized</code>\uFF1B\u4E0D\u4FEE\u6539\u539F\u59CB <code>court</code>\u3001\u5168\u6587\u6216\u5176\u4ED6\u5224\u6C7A\u6B04\u4F4D\u3002"],["\u672A\u89E3\u6790","\u7121\u6CD5\u5224\u65B7\u6642\u4FDD\u7559\u7A7A\u503C\uFF0C\u4E0D\u731C\u6E2C\uFF1B\u6458\u8981\u6703\u5217\u51FA\u672A\u89E3\u6790\u7B46\u6578\u8207\u5E38\u898B\u6A23\u672C\u3002"],["\u5F71\u97FF","\u8CC7\u6599\u9801\u7684\u6CD5\u9662\u4E0B\u62C9\u3001\u7CBE\u78BA\u7BE9\u9078\u3001\u6392\u5E8F\u3001\u7D50\u679C\u6B04\u4F4D\u8207\u5224\u6C7A\u539F\u6587\u4F7F\u7528\u6B63\u898F\u5316\u540D\u7A31\uFF1BAPI \u4ECD\u56DE\u50B3 <code>court_raw</code>\u3002"],["\u4E0D\u6703","\u4E0D\u91CD\u65B0\u532F\u5165\u5224\u6C7A\u3001\u4E0D\u6539\u5168\u6587\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u8CC7\u6599\u3002"],["\u91CD\u8DD1","\u9810\u8A2D\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u898F\u5247\u66F4\u65B0\u5F8C\u53EF\u7528 <code>--all</code> \u91CD\u7B97\uFF0C\u6216\u5148\u7528 <code>--dry-run</code> \u7D71\u8A08\u3002"]],note:"\u9069\u5408\u5728\u5224\u6C7A\u532F\u5165\u5F8C\u3001\u6CD5\u9662\u540D\u7A31\u898F\u5247\u66F4\u65B0\u5F8C\uFF0C\u6216\u8CC7\u6599\u9801\u6CD5\u9662\u9078\u9805\u51FA\u73FE\u7F3A\u6F0F\u6642\u57F7\u884C\u3002\u7D50\u679C\u4E5F\u6703\u5BEB\u5165\u6548\u80FD\u7D00\u9304\u3002"})}function Pp(){return Jr({badge:"\u689D\u6587\u6B77\u53F2\u5EFA\u6A94",lead:"\u70BA\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u5EFA\u7ACB <code>law_article_versions</code> \u6B77\u53F2\u689D\u6587\u5FEB\u7167\u8207 <code>law_article_change_events</code> \u8B8A\u66F4\u7D00\u9304\uFF0C\u8B93\u8CC7\u6599\u9801\u80FD\u5207\u63DB\u6B77\u53F2\u7248\u672C\u4E26\u67E5\u770B\u689D\u6587\u5DEE\u7570\u3002",rows:[["\u4F86\u6E90","PostgreSQL \u6CD5\u898F\u7248\u672C\uFF0C\u4EE5\u53CA <code>LAW_DATA_DIR/raw_parquet</code> \u5167\u5C0D\u61C9\u7684\u539F\u59CB\u6CD5\u898F Parquet \u5FEB\u7167\u3002"],["\u5339\u914D\u65B9\u5F0F","\u4EE5 raw Parquet manifest \u7684 <code>zip_sha256</code>\uFF0F<code>raw_json_sha256</code> \u5C0D\u61C9\u6CD5\u898F\u7248\u672C\uFF0C\u4E0D\u731C\u6E2C\u5167\u5BB9\u3002"],["\u7522\u751F\u5167\u5BB9","<code>article_key</code>\uFF08\u689D\u6587\u985E\u578B\uFF0B\u689D\u865F\uFF09\u3001<code>content_hash</code>\u3001\u689D\u6587\u5168\u6587\u8207\u751F\u6548\u65E5\uFF1B\u8207\u524D\u4E00\u7248\u672C\u6BD4\u8F03\u5F8C\u8A18\u9304 <code>added</code>\uFF0F<code>modified</code>\uFF0F<code>removed</code>\u3002"],["\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB","\u5206\u9801\u4E0A\u65B9\u7684\u552F\u8B80\u6AA2\u67E5\u6703\u8B80\u53D6 <code>law_article_versions</code> \u8207\u539F\u59CB Parquet\uFF0C\u5224\u65B7\u7248\u672C\u662F\u5426\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\uFF1B\u6AA2\u67E5\u672C\u8EAB\u4E0D\u6703\u4FEE\u6539\u8CC7\u6599\u5EAB\u3002"],["\u53EF\u5EFA\u7ACB","\u627E\u5230\u5C0D\u61C9\u539F\u59CB Parquet \u7684\u7248\u672C\uFF0C\u53EF\u76F4\u63A5\u57F7\u884C\u6B64\u6D41\u7A0B\u5EFA\u7ACB\u689D\u6587\u6B77\u53F2\u3002"],["\u7F3A\u539F\u59CB\u6A94","\u627E\u4E0D\u5230\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u6A19\u793A\u7121\u6CD5\u5EFA\u7ACB\uFF0C\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD\uFF1B\u6B64\u6D41\u7A0B\u6703\u8DF3\u904E\u4E26\u5217\u5728 <code>missing_versions</code>\u3002"],["\u6AA2\u67E5\u7D50\u679C","\u5E74\u4EFD\xD7\u6708\u4EFD\u8868\u986F\u793A\u5DF2\u5EFA\u7ACB\uFF0F\u672A\u5EFA\u7ACB\uFF0F\u90E8\u5206\u5EFA\u7ACB\uFF1B\u4E0B\u65B9\u5217\u51FA\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u7248\u672C\u65E5\u671F\u8207\u53EF\u5EFA\u7ACB\u72C0\u614B\u3002\u76EE\u524D\u72C0\u614B\u4EE5\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u5361\u7247\u5373\u6642\u986F\u793A\u3002"],["\u8DF3\u904E\u689D\u4EF6","\u5DF2\u6709\u689D\u6587\u5FEB\u7167\u7684\u7248\u672C\u6703\u8DF3\u904E\uFF1B\u627E\u4E0D\u5230\u53EF\u8B80\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u5217\u5165 <code>missing_versions</code>\uFF0C\u4E0D\u5EFA\u7ACB\u865B\u69CB\u689D\u6587\u3002"],["\u4E0D\u6703","\u4E0D\u4E0B\u8F09\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u4E0D\u89E3\u6790\u65B0 ZIP\u3001\u4E0D\u4FEE\u6539 <code>law_documents</code> \u6216\u76EE\u524D\u7248\u672C\u3001\u4E0D\u66F4\u65B0 Qdrant\uFF0FIndexedDB\u3002"],["\u8F38\u51FA\u6458\u8981","\u7248\u672C\u6578\u3001\u8DF3\u904E\u7248\u672C\u6578\u3001\u7F3A\u5C11\u5FEB\u7167\u7248\u672C\u3001\u5BEB\u5165\u689D\u6587\u6578\u8207\u689D\u6587\u8B8A\u66F4\u4E8B\u4EF6\u6578\u3002"],["\u91CD\u8DD1","\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u5DF2\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u4E0D\u6703\u91CD\u8907\u63D2\u5165\u3002"]],note:"\u9069\u5408\u5F9E\u820A\u7248 schema \u5347\u7D1A\u3001\u65E2\u6709\u6CD5\u898F\u7248\u672C\u7F3A\u5C11\u6B77\u53F2\u689D\u6587\uFF0C\u6216\u8CC7\u6599\u9801\u6B77\u53F2\u689D\u6587\u7248\u672C\u8207\u8B8A\u66F4\u7D00\u9304\u4E0D\u5B8C\u6574\u6642\u57F7\u884C\u3002\u57F7\u884C\u524D\u53EF\u5148\u7528\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u78BA\u8A8D\u54EA\u4E9B\u7248\u672C\u53EF\u5EFA\u7ACB\u3001\u54EA\u4E9B\u7F3A\u539F\u59CB\u6A94\u3002"})}function Ip(e={}){let t=e.courtCheck,s=!!e.courtCheckLoading,a=e.courtCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-court-check"${s?" disabled":""}>${m("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31"}</span></button>`;if(a)return`<section class="report-card processing-card court-check-card">
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
    </section>`;let d={green:"\u5DF2\u6AA2\u67E5",red:"\u9700\u6B63\u898F\u5316\uFF08\u5B8C\u5168\u672A\u6AA2\u67E5\uFF09",gray:"\u9700\u6B63\u898F\u5316"},p=new Map(i.map(h=>[String(h.month),h])),$=[...new Set(i.map(h=>h.year))].sort((h,u)=>u-h).map(h=>{let u=Array.from({length:12},(b,v)=>{let k=v+1,x=`${h}${String(k).padStart(2,"0")}`,_=p.get(x);if(!_)return`<td class="judgment-month is-empty"><span>${k}</span></td>`;let y=d[_.status]?_.status:"red",I=[`${h}-${String(k).padStart(2,"0")}`,d[y],`\u7E3D ${c(_.total)} \u7B46`,`\u5DF2\u6AA2\u67E5 ${c(_.checked)} \u7B46`,`\u672A\u6AA2\u67E5 ${c(_.unchecked)} \u7B46`,_.invalid?`\u7121\u6548\u503C ${c(_.invalid)} \u7B46`:"",`\u6709\u6548 ${yt(_.percent)}`].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month court-check-month is-${y==="gray"?"red":y}" title="${r(I)}"><span>${k}</span></td>`}).join("");return`<tr><th scope="row">${r(h)}</th>${u}</tr>`}).join("");return`<section class="report-card processing-card court-check-card">
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(h,u)=>`<th scope="col">${u+1}</th>`).join("")}</tr></thead>
          <tbody>${$}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u5168\u90E8\u5DF2\u6B63\u898F\u5316\uFF1B\u7D05\u8272\uFF1A\u9700\u6B63\u898F\u5316\uFF08\u542B\u5B8C\u5168\u672A\u6AA2\u67E5\u3001\u90E8\u5206\u672A\u6B63\u898F\u5316\u6216\u7121\u6548\u503C\uFF09\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002summary \u7684\u7D05\u8272\u6578\u5B57\u70BA\u9700\u6B63\u898F\u5316\u6708\u4EFD\u6578\uFF1B\u4E0B\u65B9\u660E\u7D30\u4ECD\u4FDD\u7559\u672A\u6AA2\u67E5\u8207\u7121\u6548\u503C\u7B46\u6578\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u8A73\u7D30\u7B46\u6578\u8207\u6709\u6548\u6BD4\u4F8B\u3002</p>
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(we(t.checked_at))} \xB7 \u6A19\u6E96\u6CD5\u9662\u540D\u7A31 ${c(t.canonical_count)} \u500B</div>
    </div>
  </section>`}function Dp(e={}){let t=e.lawVersionCheck,s=!!e.lawVersionCheckLoading,a=e.lawVersionCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-law-version-check"${s?" disabled":""}>${m("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB"}</span></button>`;if(a)return`<section class="report-card processing-card law-version-card">
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
    </section>`;let d={green:"\u5DF2\u5EFA\u7ACB",red:"\u672A\u5EFA\u7ACB",gray:"\u90E8\u5206\u5EFA\u7ACB"},p=new Map(i.map(ae=>[String(ae.month),ae])),$=[...new Set(i.map(ae=>ae.year))].sort((ae,q)=>q-ae).map(ae=>{let q=Array.from({length:12},(A,j)=>{let K=j+1,ge=`${ae}${String(K).padStart(2,"0")}`,O=p.get(ge);if(!O)return`<td class="judgment-month is-empty"><span>${K}</span></td>`;let oe=d[O.status]?O.status:"red",je=[`${ae}-${String(K).padStart(2,"0")}`,d[oe],`\u7248\u672C ${c(O.version_count)}\uFF08\u6CD5\u898F ${c(O.law_versions)}\uFF0F\u547D\u4EE4 ${c(O.order_versions)}\uFF09`,`\u5DF2\u5EFA\u7ACB ${c(O.backfilled_count)}`,`\u672A\u5EFA\u7ACB ${c(O.missing_count)}`,`\u9700\u5EFA\u7ACB ${c(O.needs_backfill_count)}\uFF08\u53EF\u5EFA\u7ACB ${c(O.backfillable_count)}\uFF0F\u7F3A\u539F\u59CB\u6A94 ${c(O.blocked_count)}\uFF09`,`\u689D\u6587\u5217 ${c(O.article_rows)} / \u9810\u671F ${c(O.article_count)}`,O.current?"\u76EE\u524D\u7248\u672C":"",O.versions?.length?`\u7248\u672C ${O.versions.map(C=>`#${C.version_id}`).join("\u3001")}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month law-version-month is-${oe}${O.current?" is-current":""}" title="${r(je)}"><span>${K}</span></td>`}).join("");return`<tr><th scope="row">${r(ae)}</th>${q}</tr>`}).join(""),h={law:"\u6CD5\u898F",order:"\u547D\u4EE4"},u=i.flatMap(ae=>(ae.versions||[]).filter(q=>q.needs_backfill).map(q=>({...q,month:ae.month}))).sort((ae,q)=>q.version_id-ae.version_id),b=u.slice(0,20),v=b.map(ae=>{let q=ae.backfillable?"badge-info":ae.blocked?"badge-danger":"badge-neutral",A=ae.backfillable?"\u53EF\u5EFA\u7ACB":ae.blocked?"\u7F3A\u539F\u59CB\u6A94":"\u5F85\u6AA2\u67E5";return`<div class="law-backfill-needed-row">
        <strong class="mono">#${ae.version_id}</strong>
        <span class="badge ${q}">${A}</span>
        <span>${r(h[ae.source_type]||ae.source_type||"\u2014")}</span>
        <span class="mono">${r(ae.update_date||ae.month||"\u2014")}</span>
        <span class="law-backfill-needed-reason">${r(ae.reason||"\u2014")}</span>
      </div>`}).join(""),k=u.length?`<div class="law-backfill-needed">
        <div class="law-backfill-needed-head">\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C <span class="badge badge-warn">${c(u.length)}</span></div>
        <div class="law-backfill-needed-list">${v}</div>
        ${u.length>b.length?`<div class="law-backfill-needed-more">\u53E6\u6709 ${c(u.length-b.length)} \u500B\u7248\u672C\u672A\u5217\u51FA</div>`:""}
      </div>`:'<div class="law-backfill-needed is-clear">\u76EE\u524D\u6C92\u6709\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3002</div>',x=Number(l.needs_backfill_versions)||0,_=Number(l.backfillable_versions)||0,y=Number(l.blocked_versions)||0,I=Number(l.backfilled_versions)||0,pe=Number(l.versions)||0,V=x<=0?"ok":y>0?"danger":"warn",$e=x<=0?"\u4E0D\u9700\u8981\u5EFA\u7ACB":"\u9700\u8981\u5EFA\u7ACB",he=x>0?`\u9700\u8981\u5EFA\u7ACB ${c(x)} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF1A\u53EF\u5EFA\u7ACB ${c(_)}\u3001\u7F3A\u539F\u59CB\u6A94 ${c(y)}\u3002\u5DF2\u6709\u6B77\u53F2\u689D\u6587 ${c(I)} \u500B\u7248\u672C${y>0?"\uFF1B\u7F3A\u539F\u59CB\u6A94\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD":""}\u3002`:`\u76EE\u524D ${c(pe)} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`;return`<section class="report-card processing-card law-version-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
      ${n}
    </div>
    <div class="law-version-check-status is-${V}" role="status" aria-live="polite">
      <span class="badge badge-${V}">${$e}</span>
      <span>${r(he)}</span>
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(ae,q)=>`<th scope="col">${q+1}</th>`).join("")}</tr></thead>
          <tbody>${$}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u8A72\u6708\u4EFD\u6240\u6709\u7248\u672C\u90FD\u6709\u6B77\u53F2\u689D\u6587\uFF1B\u7D05\u8272\uFF1A\u5B8C\u5168\u672A\u5EFA\u7ACB\uFF1B\u7070\u8272\uFF1A\u90E8\u5206\u7248\u672C\u5DF2\u5EFA\u7ACB\uFF1B\u5916\u6846\uFF1A\u76EE\u524D\u7248\u672C\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u7248\u672C\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u6578\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u6578\u8207\u689D\u6587\u5217\u3002</p>
      ${k}
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(we(t.checked_at))}</div>
    </div>
  </section>`}function Bp(){return`<div class="processing-ollama-loading">
    <span class="spinner" aria-hidden="true"></span>
    <span>\u6B63\u5728\u6AA2\u67E5 llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span>
  </div>`}function Fp(e,t,s){let a=Array.isArray(e?.hosts)?e.hosts:[];if(s&&!a.length)return`${Be({tone:"danger",title:"llama-server \u4E3B\u6A5F\u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
    <div class="processing-ollama-empty">
      <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh-ollama">
        ${m("refresh",13)}<span>\u91CD\u65B0\u6AA2\u67E5</span>
      </button>
    </div>`;if(!a.length)return t?Bp():'<div class="processing-ollama-empty">\u5C1A\u672A\u8A2D\u5B9A llama-server \u4E3B\u6A5F\uFF1B\u8ACB\u5230\u300C\u7CFB\u7D71\u72C0\u614B \u2192 Model Provider\u300D\u65B0\u589E\u4E26\u9023\u63A5\u6A21\u578B\u3002</div>';let n=a.map((o,l)=>{let d=o.status==="operational",p=Array.isArray(o.models)?o.models:[],g=p.length?p.map(h=>`<span class="processing-ollama-model ${d?"is-online":"is-offline"}">${r(h.name||"")}</span>`).join(""):'<span class="processing-ollama-model is-offline">\u6C92\u6709\u53EF\u7528\u6A21\u578B</span>',$=[o.embedding_model?`<span class="processing-ollama-role ${d?"is-online":"is-offline"}">\u5D4C\u5165 \xB7 ${r(o.embedding_model)}</span>`:'<span class="processing-ollama-role is-offline">\u672A\u8A2D\u5B9A\u5D4C\u5165\u6A21\u578B</span>',o.chat_model?`<span class="processing-ollama-role is-offline">\u804A\u5929 \xB7 ${r(o.chat_model)}</span>`:""].filter(Boolean).join("");return`<article class="processing-ollama-host ${d?"is-online":"is-offline"}" data-ollama-host data-host-id="${Number(o.id)}">
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
    <p class="processing-ollama-hint">\u62D6\u79FB\u6216\u4F7F\u7528\u7BAD\u982D\u8ABF\u6574 embedding \u512A\u5148\u9806\u5E8F\uFF1B\u76EE\u524D\u4E3B\u6A5F\u7121\u6CD5\u4F7F\u7528\u6642\uFF0C\u6703\u4F9D\u5E8F\u81EA\u52D5\u6539\u7528\u4E0B\u4E00\u53F0\uFF08\u5404\u53F0\u9700\u5177\u5099\u76F8\u540C\u7684 embedding \u6A21\u578B\uFF09\uFF0C\u76F4\u5230\u6709\u4E3B\u6A5F\u56DE\u50B3\u5411\u91CF\u3002</p>`}function Op(e,t={}){let s=e.active_run||null,a=s||e.last_run||null,n=Jt===e.id,i=!!s||n,o=!!e.can_run&&!i,l=i?"\u6B64\u6D41\u7A0B\u6B63\u5728\u57F7\u884C\u4E2D\u3002":e.start_blocked_reason||"\u76EE\u524D\u6709\u5176\u4ED6\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",d=Array.isArray(e.command)?e.command.join(" "):"",p=Number(e.update_count)||e.update_available&&Number(e.pending_count)||0,g=e.update_origin||"\u66F4\u65B0\u5075\u6E2C",$=e.update_mechanism||"\u65E2\u6709\u66F4\u65B0\u6AA2\u67E5\u7D00\u9304",h=e.update_message||e.update_status&&e.update_status.message||"\u627E\u5230\u53EF\u66F4\u65B0\u5167\u5BB9\u3002",u=e.update_status&&e.update_status.checked_at?we(e.update_status.checked_at):"",b=e.progress||{},v=Array.isArray(b.stages)?b.stages:[],k=String(b.active_stage||""),x=v.find(V=>String(V.key||"")===k),_=(e.index_runtime&&e.index_runtime.current?e.index_runtime.current.month:"")||"",y=_?_n(_):x&&(x.label||x.key)||"",I=n&&!s?"\u555F\u52D5\u4E2D":"\u57F7\u884C\u4E2D",pe=`<section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m(ul[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
        <span class="badge badge-neutral badge-mono">${r(e.branch||"")}</span>
      </div>
      <div class="processing-workflow-command-grid">
        <span>\u7A0B\u5F0F</span><code>${r(e.program||"\u2014")}</code>
        <span>Shell\uFF0F\u5165\u53E3</span><code>${r(e.script||"\u2014")}</code>
        <span>\u5BE6\u969B\u547D\u4EE4</span><code class="processing-workflow-command">${r(d||"\u2014")}</code>
      </div>
      ${Br.has(e.id)?'<div class="processing-embedding-strip-slot" data-processing-embedding-strip data-preserve-children></div>':""}
      <div class="processing-workflow-actions">
        <button class="btn btn-primary btn-sm" type="button"
          data-processing-action="run-workflow"
          data-workflow-id="${r(e.id)}"
          ${o?"":"disabled"}
          ${o?"":`title="${r(l)}"`}>
          ${i?'<span class="spinner" aria-hidden="true"></span>':m("play",14)}<span>${i?I:"\u57F7\u884C\u6B64\u6D41\u7A0B"}</span>
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
              <span class="badge badge-info">${m("activity",11)}${I}</span>
              ${s&&s.id?`<span class="mono">${r(s.id)}</span>`:""}
              ${s&&s.started_at?`<span>\u958B\u59CB ${r(we(s.started_at))}</span>`:""}
              ${y?`<span>\u76EE\u524D\u8655\u7406 <strong class="mono">${r(y)}</strong></span>`:""}
            </div>`:""}
      <div class="side-card-foot">
        \u57F7\u884C\u7D50\u679C\u6703\u5BEB\u5165\u5171\u7528\u8655\u7406\u72C0\u614B\u6A94\uFF0C\u53EF\u5F9E\u8655\u7406\u7E3D\u89BD\u67E5\u770B\u3002
      </div>
    </section>`;return`<div class="processing-workflow-panel">
    ${Be({tone:"info",title:e.label,text:e.description||""})}
    ${e.update_available?`<div class="processing-update-notice" role="status" data-processing-update-notice>
            <span class="processing-update-notice-icon">${m("refresh",14)}</span>
            <span class="processing-update-notice-copy">
              <strong>${r(g)}\u5075\u6E2C\u5230\u53EF\u66F4\u65B0\u5167\u5BB9</strong>
              <span class="processing-update-mechanism">\u5075\u6E2C\u6A5F\u5236\uFF1A${r($)}${u?` \xB7 \u6AA2\u67E5\u6642\u9593 ${r(u)}`:""}</span>
              <span class="processing-update-message" data-processing-update-message>${r(h)}</span>
            </span>
            ${p>0?`<span class="badge badge-warn badge-mono" data-processing-update-count>${m("refresh",10)}${c(p)}</span>`:'<span class="badge badge-warn">\u53EF\u66F4\u65B0</span>'}
            <button class="btn btn-primary btn-sm processing-update-action" type="button"
              data-processing-action="run-workflow"
              data-workflow-id="${r(e.id)}"
              ${o?"":"disabled"}
              title="${r(o?"\u7ACB\u5373\u57F7\u884C\uFF1B\u6703\u5148\u8A08\u7B97\u7E3D\u5927\u5C0F\u8207\u9810\u4F30\u6642\u9593":l)}">
              ${i?'<span class="spinner" aria-hidden="true"></span>':m("download",14)}<span>${i?I:"\u66F4\u65B0"}</span>
            </button>
          </div>`:""}
    ${["legal_index_versions","law_download","order_download"].includes(e.id)?tp(e.index_timelines,{titleSuffix:e.id==="legal_index_versions"?"\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868":"\u4E0B\u8F09\u6642\u9593\u8868"}):""}
    ${e.id==="normalize_courts"?pe:""}
    ${e.id==="normalize_courts"?Ip(t):""}
    ${e.id==="backfill_law_articles"?Dp(t):""}
    ${e.id!=="normalize_courts"?pe:""}
    ${xp(e)}
    ${e.id==="judgment_parquet"?Rp():""}
    ${e.id==="normalize_courts"?Cp():""}
    ${e.id==="backfill_law_articles"?Pp():""}
    ${e.id==="judgment_import"?Tp(e):""}
    ${e.id==="index_versions"?Ep(e):""}
    ${e.id==="index_versions"?Np(t):""}
    ${e.id==="judgment_download"?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${m("calendar",14)}\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B</span>
              <button class="btn btn-ghost btn-sm" type="button" title="\u91CD\u65B0\u6383\u63CF raw_rar \u76EE\u9304\u8207\u6708\u4EFD\u72C0\u614B" data-processing-action="refresh-judgment-months">${m("refresh",13)}<span>\u91CD\u65B0\u6574\u7406</span></button>
            </div>
            <div data-judgment-months-slot data-preserve-children>${Qr()}</div>
          </section>`:""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${Bt(a?.status||"idle")}
      </div>
      ${up(a)}
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("history",14)}\u57F7\u884C\u7D00\u9304</span>
        <span class="badge badge-neutral">\u6700\u8FD1 ${c((e.recent_runs||[]).length)} \u7B46</span>
      </div>
      ${$p(e.recent_runs)}
    </section>
    ${["law_download","order_download","judgment_download"].includes(e.id)?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${m("search",14)}\u7248\u672C\u6AA2\u67E5\u7D00\u9304</span>
              <span class="badge badge-neutral">\u6700\u8FD1 ${c((e.update_history||[]).length)} \u7B46</span>
            </div>
            ${yp(e)}
          </section>`:""}
  </div>`}function wn(e,t,s={},a=new Set){if(t==="overview")return nl(e,a);let i=(Array.isArray(e.workflows)?e.workflows:[]).find(o=>o.id===t);return i?Op(i,s):nl(e,a)}async function Hp(e){let t=Ut(),s=`judgment.processing.slim.${t?"visitor":"admin"}`,a=()=>{try{let f=JSON.parse(window.localStorage.getItem(s)||"null");return!f?.snapshot||!f.snapshot.slim||Date.now()-Number(f.saved_at||0)>600*1e3?null:f.snapshot}catch{return null}},n=f=>{if(f?.slim)try{window.localStorage.setItem(s,JSON.stringify({snapshot:f,saved_at:Date.now()}))}catch{}};e.innerHTML=`<section class="page processing-page">
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
  </section>`;let i=e.querySelector(".processing-page"),o=e.querySelector("#processing-root"),l=e.querySelector("#processing-workflows"),d=e.querySelector("#processing-stop"),p=!1,g=document.createElement("div");g.className="processing-stage-tooltip",g.hidden=!0,i.appendChild(g),Qt=new Map;let $=!1,h=!1,u=!1,b=null,v="",k="",x="overview",_=null,y=!1,I=null,pe=null,V=null,$e=!1,he=null,ae=0,q=null,A=!1,j=null,K=0,ge=null,O=!1,oe=null,je=0,C=null,ye=!1,te=null,Se=0,qe=!1,ve=null,me=!1,ce=!1,se="",Te=new Set,xe=null,Re=null,Ce=null,P=-1,B="",U=0,R=0,z=null,F=[],ke=()=>({storage:V,loading:$e,error:he,courtCheck:q,courtCheckLoading:A,courtCheckError:j,lawVersionCheck:ge,lawVersionCheckLoading:O,lawVersionCheckError:oe}),Oe=()=>{if(x!=="judgment_download")return;let f=o.querySelector(".processing-workflow-panel");if(!f)return;f.querySelectorAll(".judgment-month.is-active").forEach(Ge=>{Ge.classList.remove("is-active"),Ge.removeAttribute("aria-current")});let S=f.querySelector("[data-judgment-progress]");if(!S)return;let T=_?.progress,X=!!(b?.workflows||[]).find(Ge=>Ge.id==="judgment_download")?.active_run;if((!T||T.active===!1)&&!X){S.hidden=!0,S.classList.remove("is-indeterminate");let Ge=S.querySelector("[data-judgment-run]");Ge&&(Ge.hidden=!0);return}if(S.hidden=!1,!T||T.active===!1){let Ge=S.querySelector("[data-judgment-progress-phase]");Ge&&(Ge.textContent="\u6E96\u5099\u4E2D");let qt=S.querySelector("[data-judgment-progress-month]");qt&&(qt.textContent="\u2014");let rt=S.querySelector("[data-judgment-progress-filename]");rt&&(rt.textContent="\u7B49\u5F85\u4E0B\u8F09\u7A0B\u5E8F\u56DE\u5831\u9032\u5EA6\u2026",rt.title=""),S.classList.add("is-indeterminate");let ts=S.querySelector("[data-judgment-progress-bar]");ts&&(ts.style.width="");let Rt=S.querySelector("[data-judgment-progress-percent]");Rt&&(Rt.textContent="\u2014");let Lt=S.querySelector("[data-judgment-progress-size]");Lt&&(Lt.textContent="\u2014");let hs=S.querySelector("[data-judgment-progress-note]");hs&&(hs.textContent="\u5DF2\u555F\u52D5\uFF0C\u7B49\u5F85\u9032\u5EA6\u56DE\u5831");let ss=S.querySelector("[data-judgment-run]");ss&&(ss.hidden=!0);let Kt=S.querySelector("[data-judgment-downloads]");Kt&&(Kt.hidden=!0);let as=S.querySelector("[data-judgment-current]");as&&(as.hidden=!1);return}let Y={preparing:"\u6E96\u5099\u4E2D",planning:"\u8A08\u7B97\u5927\u5C0F",scanning:"\u6383\u63CF\u4E2D",checking:"\u6AA2\u67E5\u4E2D",downloading:"\u4E0B\u8F09\u4E2D",saving:"\u5132\u5B58\u4E2D",finalizing:"\u6574\u7406\u4E2D"},_e=Y[T.phase]||"\u8655\u7406\u4E2D",H=Array.isArray(T.downloads)?T.downloads:[],Z=H.length>0,le=S.querySelector("[data-judgment-current]");le&&(le.hidden=Z);let Me=S.querySelector("[data-judgment-downloads]");if(Me){Me.hidden=!Z;let Ge=S.querySelector("[data-judgment-downloads-count]");Ge&&(Ge.textContent=`${c(H.length)} \u500B\u9032\u884C\u4E2D`);let qt=S.querySelector("[data-judgment-downloads-list]");qt&&Z&&(qt.innerHTML=H.map(rt=>{let ts=Y[rt.phase]||_e||"\u8655\u7406\u4E2D",Rt=Number(rt.bytes_written),Lt=Number(rt.total_bytes),hs=Number.isFinite(Lt)&&Lt>0,ss=rt.percent,Kt=ss==null||ss===""?hs&&Number.isFinite(Rt)?Rt/Lt*100:null:Number(ss),as=Kt===null||!Number.isFinite(Kt),Ea=as?"\u2014":`${Math.min(100,Math.max(0,Kt)).toFixed(Kt>=10?0:1)}%`,Na=hs?`${Ee(Rt)} / ${Ee(Lt)}`:Number.isFinite(Rt)&&Rt>0?Ee(Rt):"\u2014";return`<div class="processing-download-active-item">
              <div class="processing-download-active-line">
                <strong class="mono">${r(rt.month||"\u2014")}</strong>
                <span class="processing-download-active-file mono" title="${r(rt.filename||"")}">${r(rt.filename||"\u2014")}</span>
                <span class="processing-download-active-percent mono">${r(Ea)}</span>
              </div>
              <div class="processing-download-active-track${as?" is-indeterminate":""}"><span style="width:${as?"":`${Math.min(100,Math.max(0,Kt)).toFixed(1)}%`}"></span></div>
              <div class="processing-download-active-meta">
                <span>${r(ts)}</span>
                <span>${r(Na)}</span>
              </div>
            </div>`}).join(""))}let De=S.querySelector("[data-judgment-progress-phase]");De&&(De.textContent=_e);let at=T.month||"",Mt=S.querySelector("[data-judgment-progress-month]");Mt&&(Mt.textContent=at||"\u2014");let Ta=T.filename||"",fs=S.querySelector("[data-judgment-progress-filename]");fs&&(fs.textContent=Ta||"\u2014",fs.title=Ta);let pt=new Map;for(let Ge of H)Ge.month&&pt.set(String(Ge.month),{percent:Ge.percent,phase:Ge.phase});at&&!pt.has(at)&&pt.set(at,{percent:T.percent,phase:T.phase}),f.querySelectorAll(".judgment-month.is-active").forEach(Ge=>{Ge.classList.remove("is-active","is-downloading"),Ge.removeAttribute("aria-current"),Ge.style.removeProperty("--month-progress")});for(let[Ge,qt]of pt){let rt=f.querySelector(`[data-judgment-month-key="${Ge}"]`);if(!rt)continue;rt.classList.add("is-active"),(qt?.phase==="downloading"||qt?.phase==="saving")&&rt.classList.add("is-downloading"),rt.setAttribute("aria-current","true");let ts=Number(qt?.percent);Number.isFinite(ts)&&rt.style.setProperty("--month-progress",`${Math.min(100,Math.max(0,ts)).toFixed(1)}%`)}let Nt=Number(T.bytes_written),bs=Number(T.total_bytes),ia=Number.isFinite(bs)&&bs>0,oa=null,la=T.percent;la!=null&&la!==""&&Number.isFinite(Number(la))?oa=Number(la):ia&&Number.isFinite(Nt)&&(oa=Nt/bs*100);let En=oa===null;S.classList.toggle("is-indeterminate",En);let ai=S.querySelector("[data-judgment-progress-bar]");ai&&(ai.style.width=En?"":`${Math.min(100,Math.max(0,oa)).toFixed(1)}%`);let ni=S.querySelector("[data-judgment-progress-percent]");if(ni){let Ge=En?null:Math.min(100,Math.max(0,oa));ni.textContent=Ge===null?"\u2014":`${Ge.toFixed(Ge>=10?0:1)}%`}let ri=S.querySelector("[data-judgment-progress-size]");if(ri){let Ge=Number.isFinite(Nt)&&Nt>0?Ee(Nt):"\u2014";ri.textContent=ia?`${Ge} / ${Ee(bs)}`:Ge}let ii=S.querySelector("[data-judgment-progress-note]");if(ii){let Ge=[],qt=Number(T.candidate_index),rt=Number(T.candidate_total);Number.isFinite(qt)&&qt>0&&Number.isFinite(rt)&&rt>0&&Ge.push(`\u7B2C ${c(qt)} / ${c(rt)} \u500B\u6708`),T.fileset_id&&Ge.push(`fileset ${T.fileset_id}`),T.message&&T.phase!=="downloading"&&Ge.push(String(T.message)),ii.textContent=Ge.join(" \xB7 ")}let oi=S.querySelector("[data-judgment-run]"),li=T.run_files_total!==null&&T.run_files_total!==void 0;if(oi&&(oi.hidden=!li,li)){let Ge=Number(T.run_files_total)||0,qt=Number(T.run_files_done)||0,rt=T.run_bytes_total===null||T.run_bytes_total===void 0?null:Number(T.run_bytes_total),ts=Number(T.run_bytes_done)||0,Rt=T.run_percent,Lt=Rt==null||Rt===""?null:Number(Rt),hs=S.querySelector("[data-judgment-run-bar]");hs&&(hs.style.width=Lt===null||!Number.isFinite(Lt)?"":`${Math.min(100,Math.max(0,Lt)).toFixed(1)}%`);let ss=S.querySelector("[data-judgment-run-percent]");ss&&(ss.textContent=Lt===null||!Number.isFinite(Lt)?"\u2014":`${Lt.toFixed(Lt>=10?0:1)}%`);let Kt=S.querySelector("[data-judgment-run-files]");Kt&&(Kt.textContent=`${c(qt)} / ${c(Ge)} \u500B\u6708`);let as=S.querySelector("[data-judgment-run-size]"),Ea=T.phase==="planning";as&&(rt!==null&&rt>0?as.textContent=`\u5DF2\u4E0B\u8F09 ${Ee(ts)} / ${Ee(rt)}`:as.textContent=`\u5DF2\u4E0B\u8F09 ${Ee(ts)} \xB7 ${Ea?"\u7E3D\u91CF\u8A08\u7B97\u4E2D":"\u7E3D\u91CF\u672A\u77E5"}`);let Na=S.querySelector("[data-judgment-run-elapsed]");Na&&(Na.textContent=`\u5DF2\u82B1 ${ka(T.elapsed_seconds)}`);let Nn=S.querySelector("[data-judgment-run-eta]");if(Nn){let Rn=Number(T.eta_seconds),zl=Number(T.estimated_total_seconds);Number.isFinite(Rn)&&Rn>=0?Nn.textContent=`\u5269\u9918 ${ka(Rn)} \xB7 \u9810\u4F30\u7E3D\u8A08 ${ka(zl)}`:Nn.textContent=Ea&&(T.run_bytes_total===null||T.run_bytes_total===void 0)?"\u5269\u9918\u6642\u9593\uFF1A\u8A08\u7B97\u4E2D":"\u5269\u9918\u6642\u9593\uFF1A\u2014"}}},Ye=()=>{if(x!=="judgment_download")return;let f=o.querySelector("[data-judgment-months-slot]");if(f){let S=Array.isArray(_?.months)?_.months:[];I&&!_?(f.innerHTML=Be({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(I)}),delete f.dataset.judgmentMonthCount):_?f.dataset.judgmentMonthCount!==String(S.length)?(f.innerHTML=hp(_),f.dataset.judgmentMonthCount=String(S.length)):vp(f,_):(f.querySelector(".judgment-months-loading")||(f.innerHTML=Qr()),delete f.dataset.judgmentMonthCount)}if(_){let S=Ur(_),T=pe!==S.pending;pe=S.pending;let re=(b?.workflows||[]).find(Y=>Y.id==="judgment_download");re&&(re.update_count=S.pending,re.update_available=S.pending>0);let X=o.querySelector("[data-processing-update-notice]");if(X)if(S.pending<=0)X.remove();else{let Y=X.querySelector("[data-processing-update-count]");Y&&(Y.innerHTML=`${m("refresh",10)}${c(S.pending)}`);let _e=X.querySelector("[data-processing-update-message]");_e&&(_e.textContent=`\u5224\u6C7A\u5F85\u88DC\u9F4A ${c(S.pending)} \u500B\u6708`)}T&&l&&b&&ps(l,yn(b,x))}Oe()},Ue=()=>{let f=Array.isArray(C?.hosts)?C.hosts:[];return JSON.stringify({loading:!f.length&&ye,error:!f.length&&te?te.message||String(te):"",active:C?.active_host_id??null,hosts:f.map(S=>({id:S.id,name:S.name,url:S.base_url,status:S.status,detail:S.detail,embedding:S.embedding_model,chat:S.chat_model,models:(S.models||[]).map(T=>T.name)}))})},tt=()=>{let f=o.querySelector("[data-processing-ollama]");if(!f||Se)return;let S=Ue();f.dataset.ollamaSignature!==S&&(f.dataset.ollamaSignature=S,f.innerHTML=Fp(C,ye,C?null:te))},ut=()=>{let S=((b?.sections||[]).find(T=>T.key==="legal")?.stages||[]).find(T=>T.key==="legal_qdrant");return Dr(S?.model?.label||"")},lt=()=>{let f=o.querySelector("[data-processing-embedding-strip]");if(!f)return;let S=Array.isArray(C?.hosts)?C.hosts:[],T=[];for(let Z of S)if(Z.status==="operational")for(let le of Z.models||[])Array.isArray(le.capabilities)&&le.capabilities.includes("embedding")&&T.push({hostId:Number(Z.id),model:le.name,label:Dr(`${Z.name||Z.base_url||`\u4E3B\u6A5F ${Z.id}`}:${le.name}`),baseUrl:Z.base_url||""});let re=ut(),X=S.find(Z=>Number(Z.id)===Number(C?.active_host_id)),Y=T.map(Z=>{let le=Z.label===re;return`<button class="rag-model-button${le?" is-active":""}" type="button"
        data-processing-action="select-embedding-model"
        data-host-id="${Z.hostId}"
        data-model="${r(Z.model)}"
        title="${r(Z.label)}"
        aria-pressed="${le?"true":"false"}"
        ${ce?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(Z.label)}</span>
        ${le?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`});re&&!T.some(Z=>Z.label===re)&&Y.unshift(`<button class="rag-model-button is-active is-static" type="button" aria-pressed="true" disabled>
          <span class="rag-model-state" aria-hidden="true"></span>
          <span>${r(re)}</span>
          <span class="rag-model-current">\u4F7F\u7528\u4E2D</span>
        </button>`);let _e=T.length?`<div class="rag-model-buttons">${Y.join("")}</div>`:`<p class="rag-model-empty">${ye?"\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\u8207 Embedding model\u2026":te?`\u7121\u6CD5\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\uFF1A${r(te.message||String(te))}`:"\u76EE\u524D\u6C92\u6709\u53EF\u7528\u7684 Embedding model\u3002"}</p>`,H=`<div class="processing-embedding-strip rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${m("brain",13)} Embedding \u4E3B\u6A5F\uFF0F\u6A21\u578B</span>
        ${X?.base_url?`<span class="rag-model-strip-base mono">${r(X.base_url)}</span>`:""}
        <span class="rag-model-strip-current">\u76EE\u524D\uFF1A<strong>${r(re||"\u2014")}</strong></span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-processing-action="refresh-embedding-models"
          ${ye?"disabled":""}>
          ${m("refresh",12)}<span>\u6AA2\u67E5\u6A21\u578B</span>
        </button>
      </div>
      ${_e}
      <p class="rag-model-hint">\u9EDE\u9078 <span class="mono">\u4E3B\u6A5F:\u6A21\u578B</span> \u5207\u63DB Embedding\uFF1B\u9078\u53D6\u5F8C\u6703\u6210\u70BA\u7B2C\u4E00\u512A\u5148\uFF0C\u5176\u4ED6\u4E3B\u6A5F\u4F9D\u5E8F\u4F5C\u70BA\u5099\u63F4\u3002\u5207\u63DB\u6A21\u578B\u5F8C\u65E2\u6709\u7D22\u5F15\u53EF\u80FD\u9700\u8981\u91CD\u5EFA\u3002</p>
    </div>`;f.innerHTML!==H&&(f.innerHTML=H)},de=f=>{let S=o.querySelector('[data-import-timeline="judgment"]');if(!S)return;let T=String(f?.active_month||""),re=String(f?.processing_month||"");S.querySelectorAll(".processing-month").forEach(Me=>{let De=!!T&&Me.dataset.month===T;Me.classList.toggle("is-current",De),Me.classList.toggle("is-processing-current",!!re&&Me.dataset.month===re),De?Me.setAttribute("aria-current","true"):Me.removeAttribute("aria-current")});let X=S.querySelector(".index-current-row");if(!T||!f?.active_archive){X&&X.remove();return}let Y=b?.workflows?.find(Me=>Me.id==="judgment_import")?.import_timeline?.stage_labels||{},_e=cl({activeMonth:T,activeArchive:f.active_archive,activePhase:f.active_phase||"",processingMonth:f.processing_month||"",processingArchive:f.processing_archive||"",stageLabels:Y});if(X){X.innerHTML=_e;return}let H=document.createElement("div");H.className="index-current-row",H.innerHTML=_e;let Z=S.querySelector(":scope > .side-card-head");if(Z){Z.insertAdjacentElement("afterend",H);return}let le=S.querySelector(".judgment-months");le&&le.prepend(H)},et=f=>{let S=Number(f?.state_mtime_ns);return Number.isFinite(S)?S:-1},Qe=f=>{let S=String(f?.active_month||"");return/^\d{6}$/.test(S)?Number(S):-1},it=f=>{if(!f)return;let S=et(f);if(S>=0&&S<P){Ce?.active_month&&de(Ce);return}S>=0&&(P=S);let T=String(f.active_month||"");if(!!(f.run_id&&f.run_id===Ce?.run_id)&&Qe(f)>=0&&Qe(f)<Qe(Ce)){let X={...f,active_month:Ce.active_month,active_archive:Ce.active_archive};Ce=X,de(X);return}if(!T&&f.run_status==="running"){Ce?.active_month&&Ce?.run_id===f.run_id?de(Ce):(Ce=f,de(f));return}Ce=f,de(f)},gt=f=>{let S=f?.active_import;if(S){it(S);return}Ce?.active_month&&de(Ce)},ne=()=>{if(!($||xe)){if(t){Re=window.setInterval(()=>{$||Et({silent:!0,cached:!0})},3e4);return}xe=_t(["processing","judgment-download","system-usage","ollama","court-check","law-version-check"],(f,S)=>{if(!$){if(f==="processing"){S?.snapshot?.live?na(S.snapshot):S?.snapshot?Bs(S.snapshot,{silent:!0}):Et({silent:!0,cached:!0});return}if(f==="judgment-download"){x==="judgment_download"&&ee({quiet:!0,payload:S?.snapshot||null});return}if(f==="system-usage"){x==="index_versions"&&be({quiet:!0,force:!0,payload:S?.snapshot||null});return}if(f==="ollama"){Br.has(x)&&ze({quiet:!0,payload:S?.snapshot||null});return}if(f==="court-check"){x==="normalize_courts"&&Pe({quiet:!0,force:!0,payload:S?.snapshot||null});return}f==="law-version-check"&&x==="backfill_law_articles"&&Fe({quiet:!0,force:!0,payload:S?.snapshot||null})}},{onProgress:(f,S)=>{if(f!=="processing")return;let T=S?.event;T&&Fs(T)},onError:()=>{b||Et({silent:!0,cached:!0})}})}},Ae=()=>{xe&&(xe(),xe=null)},Ke=async f=>{if(ce)return;let[S,...T]=String(f||"").split("|"),re=Number(S),X=T.join("|");if(!re||!X){lt();return}let Y=(C?.hosts||[]).find(H=>Number(H.id)===re);if(!Y){lt();return}let _e=Dr(`${Y.name||Y.base_url||`\u4E3B\u6A5F ${Y.id}`}:${X}`);if(_e===ut()){lt();return}if(!window.confirm(`\u5207\u63DB Embedding \u70BA ${_e}\uFF1F

\u5207\u63DB\u6A21\u578B\u5F8C\uFF0C\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u8207\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u53EF\u80FD\u4E0D\u76F8\u5BB9\uFF0C\u9700\u8981\u91CD\u65B0\u5EFA\u7ACB\u7D22\u5F15\u3002`)){lt();return}ce=!0,lt();try{await Q.selectOllamaModel(re,{model:X,role:"embedding"});let H=(C?.hosts||[]).map(le=>Number(le.id)),Z=[re,...H.filter(le=>le!==re)];await Q.reorderOllamaHosts(Z),N(`\u5DF2\u5207\u63DB Embedding \u70BA ${_e}\u3002`,"ok",6e3),C=null,await ze({quiet:!0}),await Et({silent:!0})}catch(H){N(H.message||"\u7121\u6CD5\u5207\u63DB Embedding model\u3002","danger",7e3),await ze({quiet:!0})}finally{ce=!1,lt()}},ze=async({quiet:f=!1,button:S=null,payload:T=null}={})=>{if(!($||ye)){if(t){ye=!1,te=new Error("\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u8A2D\u5B9A\u3002"),tt(),lt();return}ye=!0,te=null,C||(tt(),lt()),S&&Ne(S,!0,"\u6AA2\u67E5\u4E2D\u2026");try{let re=T||await Q.ollamaHosts();if($)return;C=re}catch(re){if($)return;te=re,f||N(re.message||"\u7121\u6CD5\u6AA2\u67E5 llama-server \u4E3B\u6A5F\u3002","danger",6e3)}finally{$||(ye=!1,S&&Ne(S,!1),tt(),lt())}}},Tt=async f=>{if(me)return;let S=(C?.hosts||[]).map(Y=>Number(Y.id)),T=f.map(Y=>Number(Y));if(!T.length||T.length!==S.length||T.every((Y,_e)=>Y===S[_e])){tt();return}me=!0;let re=new Map((C?.hosts||[]).map(Y=>[Number(Y.id),Y])),X=T.map(Y=>re.get(Y)).filter(Boolean);if(C&&X.length===S.length){C={...C,hosts:X,active_host_id:T[0]};let Y=o.querySelector("[data-processing-ollama]");Y&&(Y.dataset.ollamaSignature=""),tt()}try{await Q.reorderOllamaHosts(T),N("\u5DF2\u66F4\u65B0 llama-server \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","ok",3500)}catch(Y){N(Y.message||"\u7121\u6CD5\u66F4\u65B0 llama-server \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","danger",6e3),await ze({quiet:!0})}finally{me=!1}},ft=()=>{let f=o.querySelector("[data-processing-ollama]");f&&(f.dataset.ollamaSignature=""),tt()},M=()=>{let f=ve;if(!f)return;if(o.querySelector(`[data-ollama-host][data-host-id="${f.hostId}"]`)?.classList.remove("is-dragging"),f.captureTarget?.hasPointerCapture?.(f.pointerId))try{f.captureTarget.releasePointerCapture(f.pointerId)}catch{}document.documentElement.classList.remove("processing-ollama-dragging"),window.removeEventListener("pointermove",L),window.removeEventListener("pointerup",E),window.removeEventListener("pointercancel",D),ve=null,Se=0},L=f=>{let S=ve;if(!S||f.pointerId!==S.pointerId)return;if(!S.dragging){if(Math.hypot(f.clientX-S.startX,f.clientY-S.startY)<5)return;S.dragging=!0,Se=S.hostId,qe=!1,o.querySelector(`[data-ollama-host][data-host-id="${S.hostId}"]`)?.classList.add("is-dragging"),document.documentElement.classList.add("processing-ollama-dragging")}f.preventDefault();let T=64;f.clientY<T?window.scrollBy(0,-12):f.clientY>window.innerHeight-T&&window.scrollBy(0,12);let re=o.querySelector("[data-ollama-list]"),X=document.elementFromPoint(f.clientX,f.clientY)?.closest?.("[data-ollama-host]");if(!re||!X||!re.contains(X))return;let Y=re.querySelector(`[data-ollama-host][data-host-id="${S.hostId}"]`);if(!Y||Y===X)return;let _e=X.getBoundingClientRect(),H=f.clientY>_e.top+_e.height/2;re.insertBefore(Y,H?X.nextSibling:X),qe=!0},E=f=>{let S=ve;if(!S||f.pointerId!==S.pointerId)return;let T=S.dragging,re=qe,X=o.querySelector("[data-ollama-list]"),Y=T&&X?[...X.querySelectorAll("[data-ollama-host]")].map(_e=>Number(_e.dataset.hostId)):[];M(),T&&re&&Y.length&&Tt(Y)},D=()=>{let f=!!ve?.dragging;M(),f&&ft()},W=f=>{if(f.button!==0||f.pointerType==="mouse"&&f.buttons!==1||me||ve)return;let S=f.target.closest("[data-ollama-host]");if(!S||!o.contains(S)||f.target.closest("button")||f.pointerType==="touch"&&!f.target.closest(".processing-ollama-handle"))return;let T=Number(S.dataset.hostId)||0;if(T){f.preventDefault(),Se=T,ve={hostId:T,pointerId:f.pointerId,startX:f.clientX,startY:f.clientY,dragging:!1,captureTarget:S};try{S.setPointerCapture(f.pointerId)}catch{}window.addEventListener("pointermove",L,{passive:!1}),window.addEventListener("pointerup",E),window.addEventListener("pointercancel",D)}},ee=async({quiet:f=!1,payload:S=null}={})=>{if(!y){y=!0,!_&&x==="judgment_download"&&Ye();try{_=S||await Q.judgmentDownloadStatus(),I=null}catch(T){I=T.message||"\u8B80\u53D6\u6708\u4EFD\u72C0\u614B\u5931\u6557\u3002",f||N(I,"danger",7e3)}finally{y=!1,x==="judgment_download"&&Ye()}}},be=async({quiet:f=!0,force:S=!1,payload:T=null}={})=>{if(!$e){if(t){$e=!1,he=new Error("\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B Qdrant \u5BB9\u5668\u3001volume \u8207\u4E3B\u6A5F\u5132\u5B58\u8CC7\u8A0A\u3002"),x==="index_versions"&&At();return}if(!(!S&&V&&Date.now()-ae<3e4)){$e=!0;try{V=T||await Q.systemUsage(),he=null,ae=Date.now()}catch(re){he=re.message||"\u7121\u6CD5\u53D6\u5F97 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002",f||N(he,"danger",7e3)}finally{$e=!1,x==="index_versions"&&At()}}}},Pe=async({quiet:f=!0,force:S=!1,payload:T=null}={})=>{if(!A&&!(!S&&q&&Date.now()-K<6e4)){A=!0;try{q=T||await Q.checkCourts(),j=null,K=Date.now()}catch(re){j=re.message||"\u7121\u6CD5\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u3002",f||N(j,"danger",7e3)}finally{A=!1,x==="normalize_courts"&&At()}}},Fe=async({quiet:f=!0,force:S=!1,button:T=null,payload:re=null}={})=>{if(!O&&!(!S&&ge&&Date.now()-je<6e4)){O=!0,T&&Ne(T,!0,"\u6AA2\u67E5\u4E2D\u2026");try{if(ge=re||await Q.checkLawVersions(),oe=null,je=Date.now(),!f){let X=ge.totals||{},Y=Number(X.needs_backfill_versions)||0,_e=Number(X.backfillable_versions)||0,H=Number(X.blocked_versions)||0;Y>0?N(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u9700\u8981\u5EFA\u7ACB ${Y} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF08\u53EF\u5EFA\u7ACB ${_e}\u3001\u7F3A\u539F\u59CB\u6A94 ${H}\uFF09\u3002`,H>0?"danger":"warn",7e3):N(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D ${Number(X.versions)||0} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`,"ok",5e3)}}catch(X){oe=X.message||"\u7121\u6CD5\u6AA2\u67E5\u689D\u6587\u6B77\u53F2\u72C0\u614B\u3002",f||N(oe,"danger",7e3)}finally{O=!1,T&&Ne(T,!1)}}},Ie=f=>Array.from(o.querySelectorAll("[data-stage-key]")).find(S=>S.dataset.stageKey===f)||null,We=f=>{if(!f)return;Te.add(f);let S=Array.from(o.querySelectorAll(".processing-wf-stage[data-processing-stage]")).find(T=>T.dataset.processingStage===f);S&&(S.open=!0,S.scrollIntoView({behavior:"smooth",block:"center"}))},st=()=>{se&&(se="",g.hidden=!0,o.querySelectorAll("[data-stage-key]").forEach(f=>{f.classList.remove("is-stage-hovered")}))},dt=f=>{let S=f.dataset.stageKey||"";if(!S)return;se=S,o.querySelectorAll("[data-stage-key]").forEach(Mt=>{Mt.classList.toggle("is-stage-hovered",Mt.dataset.stageKey===S)});let T=f.dataset.stageStatusKey||"idle",re=f.dataset.stageStatus||Ss(T).label,X=f.dataset.stageColor||"var(--accent)",Y=Number(f.dataset.stageUpdate)||0,_e=Number(f.dataset.stagePending)||0,H=f.dataset.stageContributionLabel||"\u6574\u9AD4\u5360\u6BD4";g.innerHTML=`<div class="processing-stage-tooltip-head">
      <span class="processing-stage-tooltip-swatch" style="background:${r(X)}"></span>
      <strong>${r(f.dataset.stageLabel||S)}</strong>
      ${Bt(T,re)}
    </div>
    <div class="processing-stage-tooltip-meta">
      <span>\u968E\u6BB5\u9032\u5EA6 <strong>${r(f.dataset.stagePercent||"\u2014")}</strong></span>
      <span>${r(H)} <strong>${r(f.dataset.stageContribution||"\u2014")}</strong></span>
      <span class="mono">${r(f.dataset.stageDuration||"\u2014")}</span>
    </div>
    <div class="processing-stage-tooltip-counts">${r(f.dataset.stageCounts||"\u2014")}</div>
    ${Y||_e?`<div class="processing-stage-tooltip-badges">
            ${Y?`<span class="processing-wf-count is-update">${m("refresh",11)}<strong>${c(Y)}</strong><span>\u53EF\u66F4\u65B0</span></span>`:""}
            ${_e?`<span class="processing-wf-count is-pending">${m("clock",11)}<strong>${c(_e)}</strong><span>\u5F85\u57F7\u884C</span></span>`:""}
          </div>`:""}
    ${f.dataset.stageMessage?`<div class="processing-stage-tooltip-message">${r(f.dataset.stageMessage)}</div>`:""}`,g.hidden=!1;let Z=Math.min(300,Math.max(220,window.innerWidth-24));g.style.width=`${Z}px`;let le=f.getBoundingClientRect(),Me=Math.min(window.innerWidth-Z-12,Math.max(12,le.left)),De=le.top-g.offsetHeight-10,at=De>=12?De:Math.min(window.innerHeight-g.offsetHeight-12,le.bottom+10);g.style.left=`${Me}px`,g.style.top=`${Math.max(12,at)}px`},Ft=f=>{if(f.target.closest(".is-failure-tip")){st();return}if(f.target.closest(".processing-wf-rail"))return;let S=f.target.closest("[data-stage-key]");!S||!o.contains(S)||S.contains(f.relatedTarget)||dt(S)},es=f=>{let S=f.target.closest("[data-stage-key]");if(!S||!o.contains(S)||S.contains(f.relatedTarget))return;let T=f.relatedTarget?.closest?.("[data-stage-key]");T&&T.dataset.stageKey===S.dataset.stageKey||st()},La=f=>Array.isArray(f?.active_runs)&&f.active_runs.length||(f?.workflows||[]).some(S=>S.active_run)?!0:String(f?.update?.status||"")==="running",sa=()=>{o.querySelectorAll('[data-processing-action="stop"]').forEach(f=>Ne(f,!0,"\u505C\u6B62\u4E2D\u2026")),d&&Ne(d,!0,"\u505C\u6B62\u4E2D\u2026")},Tn=()=>{o.querySelectorAll('[data-processing-action="stop"]').forEach(f=>Ne(f,!1)),d&&Ne(d,!1)},ja=new Set(["refresh","open-stage","refresh-judgment-months","refresh-court-check","refresh-law-version-check"]),xs=()=>{t&&(i.querySelectorAll("[data-processing-action]").forEach(f=>{ja.has(f.dataset.processingAction||"")||("disabled"in f&&(f.disabled=!1),f.removeAttribute("disabled"),f.classList.add("is-demo-locked"),f.setAttribute("aria-disabled","true"),f.removeAttribute("title"),f.dataset.demoLockTooltip="\u5C55\u793A\u6A21\u5F0F\u50C5\u4F9B\u6AA2\u8996\uFF0C\u57F7\u884C\u8207\u8A2D\u5B9A\u7531\u7BA1\u7406\u8005\u64CD\u4F5C")}),i.querySelectorAll("[data-ollama-action], [data-processing-embedding-select]").forEach(f=>{f.disabled=!0,f.classList.add("is-demo-locked"),f.removeAttribute("title"),f.dataset.demoLockTooltip="\u5C55\u793A\u6A21\u5F0F\u50C5\u4F9B\u6AA2\u8996"}))},is=f=>{let S=f.capabilities||{};p&&!La(f)&&(p=!1,Tn()),!u&&d&&(d.hidden=!S.can_stop_update),p&&sa(),xs()},At=()=>{if(!b)return;b.slim&&Et({silent:!0,cached:!0});let f=wn(b,x,ke(),Te);f!==v&&(ps(o,f),v=f),Ye(),tt(),lt(),gt(b),xs()},Bs=(f,{silent:S=!1}={})=>{if($||!f||f.slim&&b&&!b.slim)return;let T=Date.parse(f.generated_at||""),re=Date.parse(b?.generated_at||"");if(Number.isFinite(T)&&Number.isFinite(re)&&T<re)return;if(Jt){let Z=(f.workflows||[]).find(Me=>Me.id===Jt),le=Z?.active_run?.id||Z?.last_run?.id||"";(Z?.active_run||le&&le!==Ns)&&(Jt="",Ns="")}b=f,window.dispatchEvent(new CustomEvent("judgment:processing-pending",{detail:{count:Number(f.capabilities?.unprocessed_archives)||0,index_pending:Number(f.capabilities?.index_pending_months)||0}}));let X=new Map;for(let Z of f.sections||[])for(let le of Z.stages||[])X.set(`${Z.key}-${le.key}`,le);for(let[Z,le]of Qt){if(le.kind!=="upgrade")continue;let Me=X.get(Z);if(Me){if(Me.phase==="failed"||Me.phase==="running"&&Me.percent!==null){Qt.delete(Z);continue}if(Me.phase==="completed"){let De=Date.parse(Me.last_run?.started_at||"");Number.isFinite(De)&&De>=Number(le.startedAt||0)-1e3&&Qt.delete(Z)}}}let Y=yn(f,x);Y!==k&&(ps(l,Y),k=Y);let _e=wn(f,x,ke(),Te);if(_e!==v&&(ps(o,_e),v=_e),Ye(),tt(),se){let Z=Ie(se);Z?dt(Z):st()}let H=o.querySelector("[data-processing-updated-at]");if(H){let Z=we(f.generated_at);H.textContent!==Z&&(H.textContent=Z)}if(is(f),lt(),gt(f),!t&&!C&&!ye&&ze({quiet:!0}),F.length){let Z=F.splice(0);for(let le of Z)Fs(le)}},aa=f=>{if(z=f,typeof requestAnimationFrame>"u"){let S=z;z=null,S&&na(S);return}R||(R=requestAnimationFrame(()=>{R=0;let S=z;z=null,S&&na(S)}))},Fs=f=>{if(!f)return;if(!b){F.push(f),F.length>100&&F.shift();return}let S=String(f.run_id||""),T=Number(f.seq)||0;if(S&&S===B&&T>0&&T<=U)return;S&&S!==B&&(B=S,U=0),T>0&&(U=T);let re=String(f.workflow_id||"judgment_import"),X=String(f.month||"").replace(/\D/g,"").slice(0,6),Y=(b.workflows||[]).find(De=>De.id===re);if(!Y)return;Y.progress||(Y.progress={stages:[]}),Array.isArray(Y.progress.stages)||(Y.progress.stages=[]);let _e=String(f.stage||""),H=_e?Y.progress.stages.find(De=>String(De.key)===_e):null,Z=String(Y.progress.run_id||"")===String(f.run_id||"");if(H&&f.type==="stage_progress"){let De=Number(f.current),at=Number(H.current);Z&&f.status==="running"&&Number.isFinite(De)&&Number.isFinite(at)&&De<at||(f.status&&(H.status=String(f.status)),f.current!==void 0&&(H.current=Number(f.current)||0),f.total!==void 0&&(H.total=Number(f.total)||0),f.percent!==void 0&&(H.percent=Number(f.percent)||0),f.message&&(H.message=String(f.message)))}if(H&&f.extra&&typeof f.extra=="object")for(let De of["financial_processed","financial_matched","financial_percent"])f.extra[De]!==void 0&&(H[De]=Number(f.extra[De])||0);if(f.type==="stage_progress"&&f.overall_percent!==void 0){let De=Number(f.overall_percent)||0,at=Number(Y.progress.overall_percent)||0;Y.progress.overall_percent=Z?Math.max(at,De):De}f.type!=="run_finished"&&(Y.progress.run_status="running"),(f.type==="archive_started"||f.type==="stage_progress")&&!Y.active_run&&f.run_id&&(Y.active_run={id:f.run_id,status:"running",started_at:f.timestamp,message:f.message||""}),f.type==="run_finished"&&(Y.active_run=null,Y.progress.run_status=String(f.status||"success"),Y.can_run=!0);let le=[];X&&f.month_stages&&le.push({month:X,import_stages:f.month_stages,import_overall:f.month_overall||""});let Me=null;if(f.type==="archive_started"&&X){let De=Date.parse(f.timestamp||"");Me={active_month:X,active_archive:f.archive,active_phase:f.stage||"filter",processing_month:X,processing_archive:f.archive,run_id:f.run_id,run_status:"running",state_mtime_ns:Number.isFinite(De)?De*1e6:Date.now()*1e6}}else f.type==="run_finished"&&(Me={...b.active_import||{},run_status:String(f.status||"success")});aa({live:!0,generated_at:f.timestamp,workflows:[{id:re,active_run:Y.active_run,last_run:Y.last_run,progress:Y.progress,can_run:Y.can_run}],import_timeline_months:le,active_import:Me})},na=f=>{if($||!f||!b)return;let S=new Map((f.workflows||[]).map(H=>[H.id,H]));if(Jt){let H=S.get(Jt),Z=H?.active_run?.id||H?.last_run?.id||"";(H?.active_run||Z&&Z!==Ns)&&(Jt="",Ns="")}for(let H of b.workflows||[]){let Z=S.get(H.id);if(Z){if("active_run"in Z&&(H.active_run=Z.active_run),"last_run"in Z&&(H.last_run=Z.last_run),Array.isArray(Z.recent_runs)&&(H.recent_runs=Z.recent_runs),"index_runtime"in Z){let le=Z.index_runtime;le&&!le.active_coverage&&H.index_runtime?.active_coverage&&(le.active_coverage=H.index_runtime.active_coverage),le&&!le.active_archive_coverage&&H.index_runtime?.active_archive_coverage&&(le.active_archive_coverage=H.index_runtime.active_archive_coverage),H.index_runtime=le}if(Z.progress){let le=Z.progress,Me=H.progress;if(H.id==="judgment_import"&&Me?.run_id&&Me.run_id===le.run_id){let De=new Map((Me.stages||[]).map(at=>[String(at.key),at]));for(let at of le.stages||[]){let Mt=De.get(String(at.key));Mt&&at.status==="running"&&Number(at.current)<Number(Mt.current)&&(at.current=Mt.current,at.total=Mt.total,at.percent=Mt.percent,at.message=Mt.message)}le.overall_percent=Math.max(Number(Me.overall_percent)||0,Number(le.overall_percent)||0)}H.progress=le}typeof Z.can_run=="boolean"&&(H.can_run=Z.can_run)}}let T=H=>{if(!H||!Array.isArray(f.import_timeline_months))return;let Z=new Map((H.months||[]).map(Me=>[String(Me.month),Me]));for(let Me of f.import_timeline_months){let De=Z.get(String(Me.month));De&&(De.import_stages={...De.import_stages||{},...Me.import_stages||{}},Me.import_stage_progress&&(De.import_stage_progress={...De.import_stage_progress||{},...Me.import_stage_progress||{}}),Me.import_overall&&(De.import_overall=Me.import_overall))}let le={complete:0,incomplete:0,processing:0,empty:0};for(let Me of H.months||[]){let De=String(Me.import_overall||"empty");le[De]=Number(le[De]||0)+1}H.stage_summary=le};(H=>{let Z=(H.workflows||[]).find(pt=>pt.id==="index_versions"),le=Z?.index_runtime;if(!le||!Array.isArray(le.months))return;let Me=(H.file_timelines||[]).find(pt=>pt.key==="judgment");if(!Me||!Array.isArray(Me.months))return;let De=(Z.progress?.stages||[]).find(pt=>pt.key==="validate"),at=["success","no_change"].includes(String(le.run_status||""))||String(le.run_status||"")!=="running"&&/alias\s*已切換/.test(String(De?.message||"")),Mt=String(le.current?.month||""),Ta=new Map(Me.months.map(pt=>[String(pt.month),pt]));for(let pt of le.months){let Nt=Ta.get(String(pt.month||""));if(!Nt)continue;let bs=Nt.stages||(Nt.stages={}),ia=String(pt.status||"");ia==="running"||String(pt.month)===Mt?(bs.qdrant="processing",Nt.overall="processing"):ia==="success"&&bs.qdrant!=="complete"&&(bs.qdrant=at?"complete":"incomplete",Nt.overall=at?"complete":"incomplete")}let fs={complete:0,incomplete:0,processing:0,empty:0,update:0};for(let pt of Me.months){let Nt=String(pt.overall||"empty");fs[Nt]=Number(fs[Nt]||0)+1,pt.has_update&&(fs.update+=1)}Me.summary=fs})(b),T(b.import_timeline);for(let H of b.workflows||[])H.id==="judgment_import"&&T(H.import_timeline);f.active_import&&(b.active_import=f.active_import),f.mode&&(b.mode=f.mode),f.generated_at&&(b.generated_at=f.generated_at);let X=yn(b,x);X!==k&&(ps(l,X),k=X);let Y=wn(b,x,ke(),Te);Y!==v&&(ps(o,Y),v=Y),Ye(),tt(),lt(),gt(b),is(b);let _e=o.querySelector("[data-processing-updated-at]");if(_e&&f.generated_at){let H=we(f.generated_at);_e.textContent!==H&&(_e.textContent=H)}},Et=async({silent:f=!1,cached:S=!1,slim:T=!1}={})=>{if(!($||h)){h=!0;try{let re=await Q.processing({cached:S,slim:T});T&&n(re),Bs(re,{silent:f})}catch(re){if($)return;let X=lp(re.message,b);X!==v&&(ps(o,X),v=X),f||N(re.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{h=!1}}},ra=async(f,S="")=>{if(u)return;u=!0,Ne(f,!0,"\u6AA2\u67E5\u4E2D\u2026");let T=tl[S]||"",re=String(f.dataset.sourceTypes||"").split(",").map(_e=>_e.trim()).filter(Boolean),X=re.length?re:T?[T]:[],Y=f.dataset.stageId||"";Y&&(Qt.set(Y,{kind:"check",phase:"updating",startedAt:Date.now()}),At());try{let _e=await Q.checkUpdates(X);if(_e&&_e.checking)Y&&(Qt.delete(Y),At()),N("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u8ACB\u7A0D\u5F8C\u91CD\u65B0\u6574\u7406\u3002","info",6e3);else if(X.length===1){let H=(_e.sources||{})[X[0]]||{},Z=sl[S]||(X[0]==="judgment"?"\u5224\u6C7A":X[0]==="law"?"\u6CD5\u898F":X[0]==="order"?"\u547D\u4EE4":"\u8CC7\u6599");H.status==="error"?N(`${Z}\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF1A${H.message||"\u7121\u6CD5\u53D6\u5F97\u7DDA\u4E0A\u7248\u672C"}`,"danger",7e3):N(H.update_available?`${Z}\u7DDA\u4E0A\u5DF2\u6709\u66F4\u65B0\u7248\u672C\u3002`:`${Z}\u7DDA\u4E0A\u5DF2\u662F\u6700\u65B0\u7248\u672C\u3002`,H.update_available?"warn":"ok",6e3)}else if(X.length>1){let H=_e.sources||{},Z=X.filter(Me=>H[Me]?.update_available),le=X.filter(Me=>H[Me]?.status==="error");le.length?N(`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF0C\u4F46\u6709 ${le.length} \u9805\u6AA2\u67E5\u5931\u6557\u3002`,"danger",7e3):N(Z.length?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${Z.length} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",Z.length?"warn":"ok",6e3)}else{let H=Number(_e.update_count)||0;N(H>0?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${H} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",H>0?"warn":"ok",6e3)}Y&&(Qt.set(Y,{kind:"check",phase:"updated",startedAt:Date.now()}),At()),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await Et({silent:!0})}catch(_e){Y&&(Qt.delete(Y),At()),N(_e.message||"\u66F4\u65B0\u6AA2\u67E5\u5931\u6557\u3002","danger",7e3)}finally{u=!1,Ne(f,!1),b&&is(b)}},Os=async f=>{let S=tl[f]||"";if(!S)return!0;let T=null;try{T=await Q.checkUpdates([S])}catch(X){return N(`\u7121\u6CD5\u5B8C\u6210\u7248\u672C\u6AA2\u67E5\uFF08${X.message||"\u7DB2\u8DEF\u932F\u8AA4"}\uFF09\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002`,"warn",7e3),!0}if(!T||T.checking)return T&&T.checking&&N("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","info",6e3),!0;let re=(T.sources||{})[S];if(!re)return!0;if(window.dispatchEvent(new CustomEvent("judgment:updates-changed")),re.status==="up_to_date"&&!re.update_available){let X=sl[f]||"\u8CC7\u6599",Y=re.checked_at?`\uFF08${we(re.checked_at)} \u6AA2\u67E5\uFF09`:"",_e=Uu[f]||"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u55CE\uFF1F";return window.confirm(`${X}\u7DDA\u4E0A\u6AA2\u67E5\u70BA\u6700\u65B0\u7248\u672C${Y}\u3002

${_e}`)}return re.status==="error"&&N("\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","warn",6e3),!0},Wt=async(f,S)=>{if(u)return;u=!0;let T=(b?.workflows||[]).find(Y=>Y.id===S);Ns=T?.active_run?.id||T?.last_run?.id||"",Jt=S,Ne(f,!0,"\u57F7\u884C\u4E2D"),At();let re=f.dataset.stageId||"",X=!1;try{if(!await Os(S))return;re&&(Qt.set(re,{kind:"upgrade",phase:"upgrading",startedAt:Date.now()}),At());let _e;try{_e=await Q.startProcessingWorkflow(S)}catch(H){throw re&&(Qt.delete(re),At()),H}X=!0,N(`\u5DF2\u555F\u52D5\u300C${T?.label||S}\u300D\u6D41\u7A0B\u3002`,"ok",6e3),_e&&_e.run_id&&console.info("processing workflow started",_e),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),Et({silent:!0}),window.setTimeout(()=>{Jt===S&&(Jt="",Ns="",Et({silent:!0}))},15e3)}catch(Y){N(Y.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{u=!1,(!X||Jt!==S)&&(Jt="",Ns="",b?(is(b),v="",At()):Ne(f,!1))}},w=async f=>{if(!(u||p)){u=!0,p=!0,Ne(f,!0,"\u505C\u6B62\u4E2D\u2026");try{let S=await Q.stopProcessingUpdate();for(let[T,re]of Qt)re.kind==="upgrade"&&Qt.delete(T);At(),Et({silent:!0}),N(S.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3)}catch(S){p=!1,Ne(f,!1),N(S.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{u=!1,p?sa():b&&is(b)}}},G=f=>{let S=f.target.closest("[data-processing-action]");if(!S||S.disabled)return;if(t&&!ja.has(S.dataset.processingAction||"")){f.preventDefault(),f.stopPropagation(),N("\u5C55\u793A\u6A21\u5F0F\u50C5\u4F9B\u6AA2\u8996\uFF0C\u57F7\u884C\u8207\u8A2D\u5B9A\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002","info",4e3);return}S.closest(".processing-wf-rail")&&(f.preventDefault(),f.stopPropagation());let T=S.dataset.processingAction;if(T==="refresh")Et({silent:!1,cached:t});else if(T==="open-stage")We(S.dataset.stageId||"");else if(T==="refresh-judgment-months")ee({quiet:!1});else if(T==="refresh-index-storage")be({quiet:!1,force:!0});else if(T==="refresh-court-check")Pe({quiet:!1,force:!0});else if(T==="refresh-law-version-check")Fe({quiet:!1,force:!0,button:S});else if(T==="refresh-ollama")ze({quiet:!1,button:S});else if(T==="refresh-embedding-models")ze({quiet:!1,button:S});else if(T==="select-embedding-model"){let re=S.dataset.hostId||"",X=S.dataset.model||"";Ke(`${re}|${X}`)}else if(T==="move-ollama-host"){let re=C?.hosts||[],X=re.findIndex(Z=>Number(Z.id)===Number(S.dataset.hostId)),Y=S.dataset.direction,_e=Y==="up"?X-1:Y==="down"?X+1:-1;if(X<0||_e<0||_e>=re.length)return;let H=re.map(Z=>Number(Z.id));[H[X],H[_e]]=[H[_e],H[X]],Tt(H)}else if(T==="check-updates")ra(S,S.dataset.workflowId||"");else if(T==="run-workflow"){let re=S.dataset.workflowId||"";Wt(S,re)}else T==="stop"&&w(S)},J=(f,{scroll:S=!1}={})=>{if(x=f||"overview",b){let T=yn(b,x);ps(l,T),k=T;let re=wn(b,x,ke(),Te);if(ps(o,re),v=re,Ye(),tt(),lt(),gt(b),se){let X=Ie(se);X?dt(X):st()}xs(),S&&o.scrollIntoView({behavior:"smooth",block:"start"})}!t&&Br.has(x)&&ze({quiet:!0}),x==="judgment_download"&&ee({quiet:!0}),x==="index_versions"&&(t?(he=new Error("\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B Qdrant \u5BB9\u5668\u3001volume \u8207\u4E3B\u6A5F\u5132\u5B58\u8CC7\u8A0A\u3002"),$e=!1,At()):be({quiet:!0})),x==="normalize_courts"&&Pe({quiet:!0}),x==="backfill_law_articles"&&Fe({quiet:!0})},ue=f=>{let S=f.target.closest("[data-processing-workflow]");S&&J(S.dataset.processingWorkflow||"overview")},Le=f=>{let S=f.target.closest("[data-timeline-workflow]");S&&(f.preventDefault(),J(S.dataset.timelineWorkflow||"",{scroll:!0}))},He=f=>{let S=f.target.closest?.(".index-wf-stage[data-index-stage]");if(S&&o.contains(S)){let Y=S.dataset.indexStage||"";Y&&(S.open?Fr.add(Y):Fr.delete(Y));return}let T=f.target.closest?.(".workflow-wf-stage[data-workflow-wf-stage]");if(T&&o.contains(T)){let Y=T.dataset.workflowWfStage||"";Y&&(T.open?Or.add(Y):Or.delete(Y));return}let re=f.target.closest?.(".processing-wf-stage[data-processing-stage]");if(!re||!o.contains(re))return;let X=re.dataset.processingStage||"";X&&(re.open?Te.add(X):Te.delete(X))};i.addEventListener("click",G),l.addEventListener("click",ue),o.addEventListener("click",Le),o.addEventListener("pointerover",Ft),o.addEventListener("pointerout",es),o.addEventListener("pointerdown",W),o.addEventListener("toggle",He,!0),window.addEventListener("scroll",st,{capture:!0,passive:!0});let nt=a();nt&&Bs(nt,{silent:!0});let Ze=Et({silent:!0,cached:!0,slim:!0});return ne(),await Ze,()=>{$=!0,Ae(),Re&&(window.clearInterval(Re),Re=null),i.removeEventListener("click",G),l.removeEventListener("click",ue),o.removeEventListener("click",Le),M(),o.removeEventListener("pointerover",Ft),o.removeEventListener("pointerout",es),o.removeEventListener("pointerdown",W),o.removeEventListener("toggle",He,!0),window.removeEventListener("scroll",st,{capture:!0})}}var Zr={};os(Zr,{render:()=>_m});var Wr={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u522A\u9664\uFF0F\u9000\u5F79",badge:"badge-neutral"}},rs={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},ea={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},_l={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function Ma(e){let t=Wr[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${r(t.label)}</span>`}function Kr(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function zp(e){return Kr(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",source_type:a||""}})}function Gp(e){return Kr(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",article_no:a||""}})}function Up(e){return Kr(e).map(t=>({jid:t.trim()}))}function Qp(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function Jp(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function Vp(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function Wp(e){return(e?.tags||[]).join(", ")}function Aa(e){return`<div class="qb-empty">${m("info",18)}<span>${r(e)}</span></div>`}function Yr(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),n=[...t.map(i=>`<span class="chip">${r(i)}</span>`),...s.map(i=>`<span class="chip">${r(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${r(i)}</span>`)];return n.length?`<div class="chips qb-labels">${n.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function Xr(){return`<details class="qb-import">
    <summary>${m("upload",14)}JSON \u6279\u6B21\u532F\u5165</summary>
    <p class="qb-muted">\u683C\u5F0F\uFF1A<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>\u3002\u76F8\u540C\u984C\u76EE fingerprint \u9810\u8A2D\u66F4\u65B0\u3002</p>
    <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
    <div class="qb-actions">
      <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${m("upload",13)}<span>\u532F\u5165 JSON</span></button>
    </div>
  </details>`}function Kp(e){let t=e?.item||{},s=Array.isArray(e?.warnings)?e.warnings:[],a=Array.isArray(t.tags)?t.tags:[];return`<section class="report-card qb-card qb-ai-result">
    <div class="side-card-head">
      <span class="side-card-title">${m("sparkles",14)}llama-server \u5DF2\u5EFA\u7ACB\u984C\u76EE #${t.id}</span>
      ${Ma(t.status)}
    </div>
    <div class="qb-ai-answer">
      <strong>${r(t.question||"")}</strong>
      <div class="qb-ai-meta">
        ${r(rs[t.question_type]||t.question_type||"")}
        \xB7 ${r(ea[t.difficulty]||t.difficulty||"")}
        \xB7 ${r(e?.model||"\u672C\u6A5F llama-server")}
      </div>
      ${Yr(t)}
      ${t.reference_answer?`<div class="qb-reference"><span class="summary-label">llama-server \u53C3\u8003\u7B54\u6848</span><p>${r(t.reference_answer)}</p></div>`:""}
      ${a.length?`<div class="chips">${a.map(n=>`<span class="chip">${r(n)}</span>`).join("")}</div>`:""}
      ${s.length?`<div class="qb-ai-warnings"><strong>\u9700\u8981\u6CE8\u610F</strong><ul>${s.map(n=>`<li>${r(n)}</li>`).join("")}</ul></div>`:""}
      <div class="qb-actions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="review-ai-item">${m("shield",13)}<span>\u524D\u5F80\u9A57\u6536</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="reset-ai">${m("plus",13)}<span>\u518D\u65B0\u589E\u4E00\u984C</span></button>
      </div>
    </div>
    ${Xr()}
  </section>`}function Yp(e){return e.aiResult?Kp(e.aiResult):`<section class="report-card qb-card">
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
    ${Xr()}
  </section>`}function Xp(e){return`<section class="report-card qb-card">
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
          <select class="select" name="question_type">${Object.entries(rs).map(([t,s])=>`<option value="${t}" ${e?.question_type===t?"selected":""}>${s}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u96E3\u5EA6</span>
          <select class="select" name="difficulty">${Object.entries(ea).map(([t,s])=>`<option value="${t}" ${e?.difficulty===t?"selected":""}>${s}</option>`).join("")}</select>
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
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${r(Qp(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${r(Jp(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${r(Vp(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${r(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${r(Wp(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
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
    ${Xr()}
  </section>`}function Zp(e,t){return e?Xp(e):Yp(t)}function em(e){let t=e.status==="retired"||!!e.deleted_at;return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${r(e.question)}</strong>
        <span class="qb-meta">
          ${r(rs[e.question_type]||e.question_type)}
          \xB7 ${r(ea[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${Ma(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${Yr(e)}
    <div class="qb-item-foot">
      <span>\u66F4\u65B0 ${r(we(e.updated_at))}</span>
      ${e.reviewed_by?`<span>\u5BE9\u6838 ${r(e.reviewed_by)}</span>`:""}
      ${e.review_comment?`<span class="qb-comment">${r(e.review_comment)}</span>`:""}
      <div class="qb-actions">
        ${t?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="restore" data-id="${e.id}">${m("refresh",13)}<span>\u5FA9\u539F\u984C\u76EE</span></button>`:`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${m("edit",13)}<span>\u7DE8\u8F2F</span></button>
               ${["pending_review","changes_requested"].includes(e.status)?"":`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="submit-review" data-id="${e.id}">${m("upload",13)}<span>${e.status==="draft"?"\u9001\u5BE9":"\u91CD\u65B0\u9001\u5BE9"}</span></button>`}
               <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${e.id}">${m("shield",13)}<span>\u9A57\u6536</span></button>
               <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${m("trash",13)}<span>\u522A\u9664</span></button>`}
      </div>
    </div>
  </article>`}function tm(e){return`<section class="report-card qb-card">
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
        ${Object.entries(Wr).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(rs).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(ea).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
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
      ${e.items.length?e.items.map(t=>em(t)).join(""):Aa("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${c(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}var Sl=[["queue","\u5F85\u5BE9\uFF0F\u9000\u56DE"],["accepted","\u5DF2\u6838\u51C6"],["rejected","\u5DF2\u62D2\u7D55"],["draft","\u8349\u7A3F"]];function sm(e){let t=e.stats||{};return{queue:Number(t.pending_review||0)+Number(t.changes_requested||0),accepted:Number(t.accepted||0),rejected:Number(t.rejected||0),draft:Number(t.draft||0)}}function am(e,t){let s=e.reviewFilter||"queue",a={queue:{title:"\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u6216\u9000\u56DE\u4FEE\u6539\u7684\u984C\u76EE\u3002",text:t.accepted?`\u5DF2\u6709 ${c(t.accepted)} \u984C\u6838\u51C6\u3002\u65B0\u984C\u76EE\u5EFA\u7ACB\u5F8C\u6703\u81EA\u52D5\u9001\u5BE9\uFF0C\u4E5F\u53EF\u4EE5\u5207\u63DB\u5230\u300C\u5DF2\u6838\u51C6\u300D\u91CD\u65B0\u9A57\u6536\u65E2\u6709\u984C\u76EE\u3002`:"\u5EFA\u7ACB\u984C\u76EE\u5F8C\u6703\u9810\u8A2D\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\uFF1B\u82E5\u53EA\u60F3\u5148\u4FDD\u5B58\uFF0C\u5EFA\u7ACB\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5373\u53EF\u5B58\u6210\u8349\u7A3F\u3002"},accepted:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u6838\u51C6\u984C\u76EE\u3002",text:"\u984C\u76EE\u901A\u904E\u4EBA\u5DE5\u9A57\u6536\u5F8C\u6703\u5217\u5728\u9019\u88E1\uFF1B\u4E5F\u53EF\u4EE5\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u9001\u51FA\u9A57\u6536\u3002"},rejected:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u62D2\u7D55\u984C\u76EE\u3002",text:"\u88AB\u62D2\u7D55\u7684\u984C\u76EE\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u4E2D\uFF0C\u53EF\u4FEE\u6539\u5F8C\u91CD\u65B0\u9001\u5BE9\u3002"},draft:{title:"\u76EE\u524D\u6C92\u6709\u8349\u7A3F\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u984C\u76EE\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5C31\u6703\u5B58\u6210\u8349\u7A3F\uFF0C\u4E4B\u5F8C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002"}}[s]||{title:"\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u65B0\u984C\u76EE\u5F8C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"},n=[s!=="draft"?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="new">${m("plus",13)}<span>\u65B0\u589E\u984C\u76EE</span></button>`:"",s==="queue"&&t.accepted?`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="review-filter" data-filter="accepted">${m("shield",13)}<span>\u67E5\u770B\u5DF2\u6838\u51C6 ${c(t.accepted)}</span></button>`:"",`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="go-manage">${m("database",13)}<span>\u524D\u5F80\u984C\u5EAB\u7BA1\u7406</span></button>`].filter(Boolean).join("");return`<div class="qb-empty qb-empty-block">
    <span class="qb-empty-icon">${m("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>${r(a.title)}</strong>
      <p>${r(a.text)}</p>
      <div class="qb-actions">${n}</div>
    </div>
  </div>`}function nm(e){let t=Sl.find(([s])=>s===e);return t?t[1]:"\u5F85\u5BE9\uFF0F\u9000\u56DE"}function rm(e,t){return`<button class="qb-review-item${t?" is-active":""}" type="button" data-qb-action="select-review-item" data-id="${e.id}" aria-pressed="${t?"true":"false"}">
    <span class="qb-review-item-top">
      <span class="qb-id">#${e.id}</span>
      <span class="qb-review-item-meta">
        ${r(rs[e.question_type]||e.question_type)}
        \xB7 ${r(ea[e.difficulty]||e.difficulty)}
        \xB7 v${e.version}
        ${e.benchmark_ready?" \xB7 Benchmark ready":""}
        ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
      </span>
      ${Ma(e.status)}
    </span>
    <strong>${r(e.question)}</strong>
  </button>`}function im(e){return`<article class="qb-review-pane-card">
    <div class="qb-review-pane-head">
      <div class="qb-review-pane-title">
        <span class="qb-review-item-meta">#${e.id} \xB7 v${e.version} \xB7 ${r(rs[e.question_type]||e.question_type)} \xB7 ${r(ea[e.difficulty]||e.difficulty)}</span>
        <strong>${r(e.question)}</strong>
      </div>
      <div class="qb-review-pane-side">
        ${Ma(e.status)}
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${m("edit",13)}<span>\u7DE8\u8F2F</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
        </div>
      </div>
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${Yr(e)}
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
    ${e.reviews?.length?`<div class="qb-review-history"><span class="summary-label">\u5BE9\u6838\u7D00\u9304</span>${e.reviews.map(t=>`<div class="qb-review-row"><span>${r(t.reviewer||"\u533F\u540D")}</span>${Ma(t.decision==="approved"?"accepted":t.decision)}<span>${r(we(t.created_at))}</span><p>${r(t.comment||"\u2014")}</p></div>`).join("")}</div>`:""}
  </article>`}function om(){return`<div class="qb-empty qb-empty-block qb-review-placeholder">
    <span class="qb-empty-icon">${m("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>\u5F9E\u5DE6\u5074\u9078\u64C7\u984C\u76EE</strong>
      <p>\u9EDE\u9078\u984C\u76EE\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u984C\u5E79\u3001\u9810\u671F\u6A19\u8A3B\u3001\u53C3\u8003\u7B54\u6848\u8207\u6838\u51C6\u9078\u9805\u3002</p>
    </div>
  </div>`}function lm(e){let t=e.reviewDetail,s=sm(e),a=e.reviewFilter||"queue",n=Sl.map(([l,d])=>`<button class="chip qb-review-tab${a===l?" is-active":""}" type="button" role="tab" aria-selected="${a===l?"true":"false"}" data-qb-action="review-filter" data-filter="${l}"><span>${d}</span><span class="qb-review-tab-count">${c(s[l]||0)}</span></button>`).join(""),i=e.reviewItems.length?e.reviewItems.map(l=>rm(l,Number(t?.id)===Number(l.id))).join(""):`<div class="qb-empty qb-empty-compact">${m("info",16)}<span>\u76EE\u524D\u6C92\u6709${r(nm(a))}\u984C\u76EE\u3002</span></div>`,o=t?im(t):e.reviewItems.length?om():am(e,s);return`<section class="report-card qb-card qb-review-card">
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
  </section>`}function xa(e){if(e==null||e==="")return"";let t=Number(e);return Number.isFinite(t)?`${Math.round(t*100)}%`:""}function cm(e){if(!e||typeof e!="object")return"\u5F15\u7528";let t=String(e.jid||"").trim();if(t)return t;let s=String(e.law_name||"").trim(),a=String(e.article_no||"").trim(),n=`${s} ${a}`.trim();return n||String(e.title||e.text||"\u5F15\u7528").slice(0,80)}function dm(e){let t=e?.metrics||{},s=t.scores||{},a=[["\u6CD5\u898F\u53EC\u56DE",xa(t.law_recall)],["\u689D\u6587\u53EC\u56DE",xa(t.article_recall)],["\u898F\u5247\u5206",xa(s.deterministic)],["Judge",xa(s.judge)],["\u4EBA\u5DE5",xa(s.human)]].filter(([,n])=>n);return a.length?`<div class="qb-bank-stats">${a.map(([n,i])=>`<span class="qb-bank-stat"><span>${r(n)}</span><strong>${r(i)}</strong></span>`).join("")}</div>`:""}function um(e){let t=Array.isArray(e?.law_sources)?e.law_sources:[],s=Array.isArray(e?.citations)?e.citations:[],a=t.length?`<div class="qb-bank-sources">${t.map(i=>{let o=String(i.law_name||"\u672A\u547D\u540D\u6CD5\u898F"),l=(i.articles||[]).map(p=>String(p.article_no||"").trim()).filter(Boolean),d=`<strong>${r(o)}</strong>${l.length?`<small>${r(l.join("\u3001"))}</small>`:""}`;return i.law_url?`<a class="qb-bank-law" href="${r(i.law_url)}" target="_blank" rel="noreferrer">${d}</a>`:`<span class="qb-bank-law">${d}</span>`}).join("")}</div>`:"",n=s.length?`<div class="qb-bank-sources qb-bank-citations">${s.map(i=>`<span class="chip chip-mono">${r(cm(i))}</span>`).join("")}</div>`:"";return!a&&!n?"":`<div class="qb-bank-answer-block">
    <div class="qb-bank-section-label"><span>\u5F15\u7528\u4F86\u6E90</span><span>${c(t.length+s.length)} \u7B46</span></div>
    ${a}${n}
  </div>`}function xl(e,t){if(!e)return`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("history",20)}</span>
      <strong>\u5C1A\u7121 RAG \u7B54\u6848</strong>
      <span>\u8DD1\u4E00\u6B21 Benchmark \u5F8C\uFF0C\u6700\u8FD1\u4E00\u6B21\u6210\u529F\u56DE\u7B54\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</span>
    </div>`;let s=Number(e.item_version||0),a=Number(t?.version||0),n=s&&a&&s!==a?`<span class="badge badge-warn">\u7B54\u6848 v${s} \xB7 \u984C\u76EE v${a}</span>`:"",i=e.answer_source==="llm"?"LLM \u751F\u6210":e.answer_source==="structured"?"\u6CD5\u898F\u8CC7\u6599\u5EAB":String(e.answer_source||"RAG");return`<div class="qb-bank-answer-meta">
      <span class="badge badge-ok"><span class="status-dot is-ok"></span>RAG \u5B8C\u6210</span>
      <span class="badge badge-neutral">${r(i)}</span>
      ${n}
      <span class="mono">${r(e.run_label||e.run_id||"")}</span>
      <span>${r(we(e.finished_at))}</span>
      <span>${r(fe(e.duration_ms))}</span>
      ${e.llm_model?`<span class="mono">${r(e.llm_model)}</span>`:""}
    </div>
    <div class="qb-bank-answer-block">
      <div class="qb-bank-section-label"><span>\u56DE\u7B54</span><span>${c(String(e.answer||"").length)} \u5B57</span></div>
      <p class="qb-bank-answer-text">${r(String(e.answer||"").trim()||"\uFF08\u7A7A\u767D\u56DE\u7B54\uFF09")}</p>
    </div>
    ${um(e)}
    ${dm(e)}`}function Al(e,t){let s=e.selectedSuiteId,a=t&&e.suiteAnswers?.[String(s)]?.[String(t.id)]||null;return t?`<div class="qb-bank-answer-head">
      <div class="qb-bank-answer-heading">
        <span class="qb-bank-answer-kicker">${m("sparkles",12)}RAG \u6700\u8FD1\u4E00\u6B21\u7B54\u6848</span>
        <strong class="qb-bank-answer-question">#${t.id} ${r(t.question)}</strong>
      </div>
      ${a?`<span class="qb-bank-answer-state">${r(rs[t.question_type]||t.question_type)} \xB7 v${t.version}</span>`:""}
    </div>
    ${xl(a,t)}`:`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("cube",20)}</span>
      <strong>\u9078\u64C7\u984C\u76EE</strong>
      <span>\u5F9E\u5DE6\u5074\u6E05\u55AE\u9078\u64C7\u4E00\u984C\uFF0C\u67E5\u770B\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`}function Ml(e){return`<span class="qb-bank-actions">
    <button class="qb-bank-icon" type="button" data-qb-action="edit" data-id="${e.id}" title="\u7DE8\u8F2F\u984C\u76EE" aria-label="\u7DE8\u8F2F\u984C\u76EE #${e.id}">${m("edit",13)}</button>
    <button class="qb-bank-icon is-danger" type="button" data-qb-action="delete" data-id="${e.id}" title="\u5F9E\u984C\u5EAB\u79FB\u9664" aria-label="\u5F9E\u984C\u5EAB\u79FB\u9664 #${e.id}">${m("trash",13)}</button>
  </span>`}function pm(e,t,{selected:s,hasAnswer:a}){return`<div class="qb-bank-row${s?" is-active":""}" data-id="${e.id}">
    <button class="qb-bank-select" type="button" data-qb-action="select-bank-item" data-id="${e.id}" aria-pressed="${s?"true":"false"}">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <span class="qb-bank-item-copy">
        <strong>${r(e.question)}</strong>
        <small>${r(rs[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${a?"\u5DF2\u6709 RAG \u7B54\u6848":"\u5C1A\u7121 RAG \u7B54\u6848"}</small>
      </span>
    </button>
    ${Ml(e)}
  </div>`}function mm(e,t,s){return`<article class="qb-bank-full-item" data-id="${e.id}">
    <div class="qb-bank-full-head">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <div class="qb-bank-full-title">
        <strong>${r(e.question)}</strong>
        <small>${r(rs[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${r(Wr[e.status]?.label||e.status||"")}</small>
      </div>
      ${Ml(e)}
    </div>
    ${xl(s,e)}
  </article>`}function kl(e){let t=e.editingSuite,s=Array.isArray(e.suites)?e.suites:[],a=s.find(u=>Number(u.id)===Number(e.selectedSuiteId))||s[0]||null,n=Array.isArray(a?.items)?a.items:[],i=e.suiteAnswers?.[String(a?.id)]||{},o=n.find(u=>Number(u.id)===Number(e.selectedBankItemId))||null,l=!!e.suiteAnswersLoading,d=String(e.suiteAnswersError||""),p=!!e.suiteManageOpen||!s.length,g=e.bankTab==="full"?"full":"split",$=s.length?`<div class="qb-bank-tabs" role="tablist" aria-label="Benchmark \u984C\u5EAB\u6AA2\u8996">
        <button class="qb-bank-tab${g==="split"?" is-active":""}" type="button" role="tab" aria-selected="${g==="split"?"true":"false"}" data-qb-action="bank-tab" data-tab="split">${m("grid",13)}<span>Benchmark \u984C\u5EAB</span><span class="badge badge-neutral">${c(n.length)}</span></button>
        <button class="qb-bank-tab${g==="full"?" is-active":""}" type="button" role="tab" aria-selected="${g==="full"?"true":"false"}" data-qb-action="bank-tab" data-tab="full">${m("table",13)}<span>\u984C\u5EAB\u5168\u5217\u8868</span><span class="badge badge-neutral">${c(n.length)}</span></button>
      </div>`:"",h="";if(!s.length)h=`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("cube",20)}</span>
      <strong>\u5C1A\u672A\u5EFA\u7ACB Benchmark \u984C\u5EAB</strong>
      <span>\u5C55\u958B\u4E0B\u65B9 Suite \u8A2D\u5B9A\u4E26\u5EFA\u7ACB\u984C\u5EAB\u5F8C\uFF0C\u5C31\u80FD\u5728\u9019\u88E1\u700F\u89BD\u984C\u76EE\u8207\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`;else if(l)h='<div class="qb-bank-loading"><span class="spinner" aria-hidden="true"></span><span>\u8B80\u53D6\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u4E2D\u2026</span></div>';else{let u=d?Be({tone:"warn",title:"\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u8B80\u53D6\u5931\u6557",text:r(d)}):"";g==="full"?h=`${u}<div class="qb-bank-full" data-qb-bank-view="full">${n.length?n.map((b,v)=>mm(b,v,i[String(b.id)]||null)).join(""):Aa("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>`:h=`${u}<div class="qb-bank-split" data-qb-bank-view="split">
        <div class="qb-bank-list" data-qb-bank-list>${n.length?n.map((b,v)=>pm(b,v,{selected:Number(b.id)===Number(o?.id),hasAnswer:!!i[String(b.id)]})).join(""):Aa("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>
        <div class="qb-bank-answer-pane" data-qb-bank-answer>${Al(e,o)}</div>
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
    ${h}
    <details class="qb-suite-manage" ${p?"open":""}>
      <summary>${m("sliders",14)}Suite \u8A2D\u5B9A\u8207\u7248\u672C <span class="qb-muted">${c(s.length)} \u500B suite \xB7 ${c(e.ready.length)} \u984C benchmark-ready</span></summary>
      <div class="qb-suite-manage-body">
        <form class="qb-suite-form" data-qb-form="suite">
          <input type="hidden" name="suite_id" value="${t?.id||""}" />
          <div class="qb-form-grid">
            <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${r(t?.name||"Pilot 30")}" /></label>
            <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(_l).map(([u,b])=>`<option value="${u}" ${t?.tier===u?"selected":""}>${b}</option>`).join("")}</select></label>
          </div>
          <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${r(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
          <div class="qb-check-list">
            ${e.ready.length?e.ready.map(u=>{let b=t?t.items?.some(v=>Number(v.id)===Number(u.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${u.id}" ${b?"checked":""}/><span><strong>#${u.id}</strong> ${r(u.question)} <small>${r(rs[u.question_type]||u.question_type)}</small></span></label>`}).join(""):Aa("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
          </div>
          <div class="qb-actions">
            <button class="btn btn-primary" type="submit">${m("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
            ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
          </div>
        </form>
        <div class="qb-list">
          ${s.length?s.map(u=>`<article class="qb-suite">
            <div class="qb-item-head">
              <div class="qb-item-title"><strong>${r(u.name)}</strong><span class="qb-meta">${r(_l[u.tier]||u.tier)} \xB7 v${u.version} \xB7 ${c(u.item_count)} \u984C</span></div>
              <span class="badge ${u.status==="frozen"?"badge-ok":"badge-neutral"}">${u.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
            </div>
            <div class="qb-suite-items">${(u.items||[]).slice(0,8).map(b=>`<span class="chip">#${b.id} ${r(b.question.slice(0,22))}${b.question.length>22?"\u2026":""}</span>`).join("")}${u.item_count>8?`<span class="qb-muted">+${u.item_count-8}</span>`:""}</div>
            <div class="qb-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${u.id}">${m("edit",13)}<span>\u7DE8\u8F2F suite</span></button>
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${u.id}">${m("shield",13)}<span>\u51CD\u7D50</span></button>
              <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${u.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
            </div>
          </article>`).join(""):Aa("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
        </div>
      </div>
    </details>
  </section>`}function gm(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),n=Number(a?.value);Number.isFinite(n)&&(t[s]=Math.max(1,Math.min(5,Math.round(n))))}return t}function fm(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:zp(t.get("expected_laws")),expected_articles:Gp(t.get("expected_articles")),expected_judgments:Up(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function ql(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},n={tab:"",editing:null,editingFrom:"",editingSuite:null,aiQuestion:"",aiLoading:!1,aiResult:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tags:[]},stats:{},suites:[],ready:[],selectedSuiteId:null,selectedBankItemId:null,bankTab:"split",suiteAnswers:{},suiteAnswersLoading:!1,suiteAnswersError:"",suiteManageOpen:!1,reviewItems:[],reviewDetail:null,reviewFilter:"queue"},i=P=>e.querySelector(`#quality-panel-${a[P]}`),o=(P,B)=>{P&&(P.childElementCount?P.setAttribute("aria-busy","true"):P.innerHTML=`<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>${B}</span></div></section>`)},l=P=>{P?.removeAttribute("aria-busy")},d=0,p=null,g=()=>"anonymous",$=()=>{s&&s(n.stats)},h=P=>{t&&t(P),oe(P)},u=async()=>{try{n.stats=await Q.questionBankStats()}catch{n.stats={}}$()},b=()=>{let P=i("create");P&&(P.innerHTML=Zp(n.editing,n))},v=(P,B)=>{let U=P?.querySelector("[data-qb-tag-results]");U&&(U.innerHTML=B.length?B.map(R=>`<button class="qb-tag-option" type="button" role="option" data-qb-action="select-tag" data-tag="${r(R.tag)}"><span>${r(R.tag)}</span><small>${c(R.count)}</small></button>`).join(""):'<div class="qb-tag-empty">\u6C92\u6709\u5176\u4ED6\u76F8\u7B26\u6A19\u7C64</div>')},k=async(P,B="")=>{if(!P)return;let U=P.querySelector("[data-qb-tag-results]"),R=++d;U&&(U.innerHTML='<div class="qb-tag-loading"><span class="spinner"></span><span>\u641C\u5C0B\u6A19\u7C64\u2026</span></div>');try{let z=await Q.questionBankTags(B,12);if(R!==d)return;let F=(z.tags||[]).filter(ke=>!n.filters.tags.includes(ke.tag));v(P,F)}catch(z){if(R!==d)return;U&&(U.innerHTML=`<div class="qb-tag-empty">${r(z.message||"\u6A19\u7C64\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},x=(P,{focus:B=!1}={})=>{if(!P)return;let U=P.querySelector("[data-qb-tag-popover]"),R=P.querySelector("[data-qb-tag-search]");!U||!R||(U.hidden&&(U.hidden=!1,R.value="",k(P,"")),B&&(R.focus(),R.select()))},_=P=>{p&&(window.clearTimeout(p),p=null);let B=P?.querySelector("[data-qb-tag-popover]");B&&(B.hidden=!0)},y=async P=>{let B=String(P||"").trim();B&&(n.filters.tags.includes(B)?n.filters.tags=n.filters.tags.filter(U=>U!==B):n.filters.tags=[...n.filters.tags,B],n.offset=0,await A())},I=()=>{let P=Array.isArray(n.suites)?n.suites:[];if(!P.length)return n.selectedSuiteId=null,n.selectedBankItemId=null,null;let B=P.find(R=>Number(R.id)===Number(n.selectedSuiteId));B||(B=P[0],n.selectedSuiteId=B.id,n.selectedBankItemId=null);let U=Array.isArray(B.items)?B.items:[];return U.some(R=>Number(R.id)===Number(n.selectedBankItemId))||(n.selectedBankItemId=U[0]?.id??null),B},pe=()=>{let P=i("suite");P&&(P.innerHTML=kl(n))},V=0,$e=async(P,{force:B=!1}={})=>{if(!P)return;let U=++V;if(!B&&n.suiteAnswers[String(P)]){n.suiteAnswersLoading=!1,n.suiteAnswersError="",pe();return}n.suiteAnswersLoading=!0,n.suiteAnswersError="",pe();try{let R=await Q.benchmarkSuiteLatestAnswers(P);if(U!==V)return;n.suiteAnswers[String(P)]=R.answers||{}}catch(R){if(U!==V)return;n.suiteAnswersError=R.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}finally{U===V&&(n.suiteAnswersLoading=!1,pe())}},he=async P=>{n.selectedSuiteId=P,n.selectedBankItemId=null,n.suiteAnswersError="";let B=I();if(!B){pe();return}await $e(B.id)},ae=P=>{n.bankTab=P==="full"?"full":"split",pe()},q=()=>{let P=i("suite");if(!P)return;let B=I(),R=(Array.isArray(B?.items)?B.items:[]).find(F=>Number(F.id)===Number(n.selectedBankItemId))||null;for(let F of P.querySelectorAll(".qb-bank-row")){let ke=Number(F.dataset.id)===Number(n.selectedBankItemId);F.classList.toggle("is-active",ke);let Oe=F.querySelector("[data-qb-action='select-bank-item']");Oe&&Oe.setAttribute("aria-pressed",ke?"true":"false")}let z=P.querySelector("[data-qb-bank-answer]");z&&(z.innerHTML=Al(n,R))},A=async()=>{let P=i("manage");if(P){p&&(window.clearTimeout(p),p=null),o(P,"\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026");try{let B=await Q.questionBankItems({...n.filters,...n.filters.status==="retired"?{include_deleted:!0}:{}},n.limit,n.offset);n.items=B.items||[],n.total=Number(B.total||0),n.stats=B.stats||n.stats,l(P),P.innerHTML=tm(n),$()}catch(B){l(P),P.innerHTML=`<section class="report-card qb-card">${Be({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(B.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},j=async({refreshAnswers:P=!1}={})=>{let B=i("suite");if(B){o(B,"\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026");try{let[U,R]=await Promise.all([Q.benchmarkSuites(),Q.benchmarkReadyQuestions(300)]);n.suites=U.suites||[],n.ready=R.items||[];let z=I();if(n.suiteAnswersError="",n.suiteAnswersLoading=!1,z&&(P||!n.suiteAnswers[String(z.id)]))try{let F=await Q.benchmarkSuiteLatestAnswers(z.id);n.suiteAnswers[String(z.id)]=F.answers||{}}catch(F){n.suiteAnswersError=F.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}l(B),B.innerHTML=kl(n)}catch(U){l(B),B.innerHTML=`<section class="report-card qb-card">${Be({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(U.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},K=()=>{let P=i("review");P&&(P.innerHTML=lm(n))},ge=async P=>{let B=n.reviewItems.find(R=>Number(R.id)===Number(P));if(!B)return;n.reviewDetail=B,K();let U=i("review")?.querySelector(".qb-review-detail-pane");U&&window.matchMedia("(max-width: 1020px)").matches&&U.scrollIntoView({behavior:"smooth",block:"start"});try{let R=await Q.questionBankItem(B.id);Number(n.reviewDetail?.id)===Number(B.id)&&(n.reviewDetail=R,K())}catch(R){N(R.message||"\u984C\u76EE\u5167\u5BB9\u8B80\u53D6\u5931\u6557\u3002","danger")}},O=async()=>{let P=i("review");if(!P)return;o(P,"\u8B80\u53D6\u9A57\u6536\u984C\u76EE\u4E2D\u2026");let B=n.reviewFilter||"queue",U=B==="queue"?["pending_review","changes_requested"]:B==="accepted"?["accepted"]:B==="rejected"?["rejected"]:["draft"];try{let R=await Promise.all(U.map(Oe=>Q.questionBankItems({status:Oe},200,0)));n.reviewItems=R.flatMap(Oe=>Oe.items||[]),n.stats=R[0]?.stats||n.stats;let z=Number(n.reviewDetail?.id||0),ke=n.reviewItems.some(Oe=>Number(Oe.id)===z)?z:Number(n.reviewItems[0]?.id||0);n.reviewDetail=ke?await Q.questionBankItem(ke):null,l(P),K(),$()}catch(R){l(P),P.innerHTML=`<section class="report-card qb-card">${Be({tone:"danger",title:"\u9A57\u6536\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:r(R.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}};function oe(P){let B=n.tab;n.tab=P;for(let U of Object.keys(a)){let R=i(U);R&&(R.hidden=U!==P)}P==="create"?(B!=="create"&&!n.editing&&(n.aiQuestion="",n.aiResult=null),b()):P==="manage"?A():P==="suite"?j():P==="review"&&O()}let je=P=>{let U=[...n.items,...n.reviewItems,...n.reviewDetail?[n.reviewDetail]:[]].find(z=>Number(z.id)===Number(P));n.reviewDetail=U||{id:Number(P)};let R=U?.status;["accepted","rejected","draft"].includes(R)?n.reviewFilter=R:R&&(n.reviewFilter="queue"),h("review")},C=async P=>{let B=fm(P),U=Number(P.elements.item_id?.value||0);U||(B.status=P.elements.submit_for_review?.checked?"pending_review":"draft");try{U?(await Q.updateQuestionBankItem(U,{...B,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),N("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await Q.createQuestionBankItem(B),N(B.status==="draft"?"\u984C\u76EE\u5DF2\u5B58\u70BA\u8349\u7A3F\uFF0C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002":"\u984C\u76EE\u5DF2\u5EFA\u7ACB\u4E26\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok")),n.editing=null;let R=["manage","suite","review"].includes(n.editingFrom)?n.editingFrom:"manage";n.editingFrom="",n.suiteAnswers={},await u(),h(R)}catch(R){let z=R.detail||R.payload?.detail,F=z?.errors?.join(" \xB7 ")||z?.message||R.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";N(F,"danger",8e3)}},ye=async P=>{let B=String(new FormData(P).get("question")||"").trim();if(B.length<4){N("\u984C\u76EE\u81F3\u5C11\u9700\u8981 4 \u500B\u5B57\u3002","danger");return}n.aiQuestion=B,n.aiLoading=!0,n.aiResult=null,b();try{let U=await Q.createQuestionBankItemWithAI({question:B});n.aiResult=U,n.aiQuestion="",await u(),N(`llama-server \u5DF2\u5EFA\u7ACB\u984C\u76EE #${U.item.id}\uFF0C\u72C0\u614B\u70BA\u5F85\u5BE9\uFF0C\u8ACB\u4EBA\u5DE5\u8986\u6838\u3002`,"ok",8e3)}catch(U){let R=U.detail||U.payload?.detail,z=R?.errors?.join(" \xB7 ")||R?.message||U.message||"llama-server \u7522\u751F\u5931\u6557\u3002";N(z,"danger",12e3)}finally{n.aiLoading=!1,b()}},te=async(P,B)=>{let U=Number(P.dataset.id||0);if(U)try{await Q.reviewQuestionBankItem(U,{decision:B,reviewer:g(),rubric_scores:gm(P),comment:String(P.querySelector('[name="comment"]')?.value||"")}),N(B==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":B==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",B==="approved"?"ok":"info"),await u(),await O()}catch(R){let z=R.detail||R.payload?.detail,F=z?.errors?.join(" \xB7 ")||z?.message||R.message||"\u9A57\u6536\u5931\u6557\u3002";N(F,"danger",8e3)}},Se=async P=>{let B=new FormData(P),U=Number(B.get("suite_id")||0),R=Array.from(P.querySelectorAll('input[name="item_ids"]:checked')).map(F=>Number(F.value)),z={name:String(B.get("name")||"").trim(),tier:String(B.get("tier")||"core"),description:String(B.get("description")||"").trim(),item_ids:R};try{U?(await Q.updateBenchmarkSuite(U,z),N("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await Q.createBenchmarkSuite(z),N("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),n.editingSuite=null,n.suiteManageOpen=!0,n.suiteAnswers={},await j()}catch(F){let ke=F.detail||F.payload?.detail,Oe=ke?.errors?.join(" \xB7 ")||ke?.message||F.message||"Suite \u5132\u5B58\u5931\u6557\u3002";N(Oe,"danger",8e3)}},qe=async P=>{let B=e.querySelector("[data-qb-tag-filter] [data-qb-tag-popover]:not([hidden])")?.closest("[data-qb-tag-filter]");B&&!P.target.closest("[data-qb-tag-filter]")&&_(B);let U=P.target.closest("[data-qb-action]")?.dataset.qbAction;if(!U)return;let R=P.target.closest("[data-qb-action]"),z=Number(R.dataset.id||0);if(U==="open-tag-search"){let F=R.closest("[data-qb-tag-filter]");x(F,{focus:!0});return}if(U==="select-tag"){await y(R.dataset.tag);return}if(U==="remove-tag"){await y(R.dataset.tag);return}if(U==="bank-tab"){ae(R.dataset.tab);return}if(U==="select-bank-item"){n.selectedBankItemId=z,q();return}if(U==="new"){n.editing=null,n.editingFrom="",n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,h("create");return}if(U==="reset-create"){n.editing=null,b();return}if(U==="reset-ai"){n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,b();return}if(U==="edit"){let F=n.suites.find(Ye=>Number(Ye.id)===Number(n.selectedSuiteId)),Oe=[...n.items,...n.reviewItems,...F?.items||[],...n.reviewDetail?[n.reviewDetail]:[]].find(Ye=>Number(Ye.id)===z);if(!Oe)return;n.editing=Oe,n.editingFrom=n.tab,h("create");return}if(U==="review"){je(z);return}if(U==="review-ai-item"){let F=n.aiResult?.item;if(!F)return;n.reviewFilter="queue",n.reviewDetail=F,h("review");return}if(U==="review-filter"){let F=String(R.dataset.filter||"queue");n.reviewFilter=["queue","accepted","rejected","draft"].includes(F)?F:"queue",n.reviewDetail=null,await O();return}if(U==="select-review-item"){await ge(z);return}if(U==="go-manage"){h("manage");return}if(U==="submit-review"){try{await Q.submitQuestionBankItemForReview(z),N("\u5DF2\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok"),await u(),n.tab==="manage"?await A():n.tab==="review"&&await O()}catch(F){let ke=F.detail||F.payload?.detail,Oe=ke?.errors?.join(" \xB7 ")||ke?.message||F.message||"\u9001\u5BE9\u5931\u6557\u3002";N(Oe,"danger",8e3)}return}if(U==="restore"){if(!window.confirm(`\u78BA\u5B9A\u5FA9\u539F\u984C\u76EE #${z}\uFF1F\u5FA9\u539F\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\u72C0\u614B\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002`))return;try{await Q.restoreQuestionBankItem(z),N("\u984C\u76EE\u5DF2\u5FA9\u539F\u4E26\u56DE\u5230\u5F85\u5BE9\u3002","ok"),await u(),await A()}catch(F){let ke=F.detail||F.payload?.detail,Oe=ke?.errors?.join(" \xB7 ")||ke?.message||F.message||"\u5FA9\u539F\u5931\u6557\u3002";N(Oe,"danger",8e3)}return}if(U==="delete"){if(n.tab==="suite"){let F=I();if(!F||!(F.items||[]).find(Oe=>Number(Oe.id)===z)||!window.confirm(`\u78BA\u5B9A\u5F9E\u300C${F.name}\u300D\u79FB\u9664\u984C\u76EE #${z}\uFF1F\u984C\u76EE\u4ECD\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u7BA1\u7406\u4E2D\u3002`))return;try{await Q.removeBenchmarkSuiteItem(F.id,z),N("\u5DF2\u5F9E Benchmark \u984C\u5EAB\u79FB\u9664\u3002","info"),delete n.suiteAnswers[String(F.id)],Number(n.selectedBankItemId)===z&&(n.selectedBankItemId=null),await j()}catch(Oe){N(Oe.message||"\u79FB\u9664\u5931\u6557\u3002","danger")}return}if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${z}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await Q.deleteQuestionBankItem(z),N("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await u(),n.tab==="review"?(n.reviewDetail=null,await O()):await A()}catch(F){N(F.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(U==="revalidate"){try{let F=await Q.revalidateQuestionBank();N(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${c(F.checked||0)} \u984C\uFF0C${c(F.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await u(),await A()}catch(F){N(F.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(U==="export"){try{let F=await Q.exportQuestionBank({status:""});Gt(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(F,null,2),"application/json;charset=utf-8")}catch(F){N(F.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(U==="import-json"){let F=e.querySelector("#qb-import-json");try{let ke=JSON.parse(String(F?.value||"").trim()),Oe=await Q.importQuestionBank(ke);N(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${Oe.created}\u3001\u66F4\u65B0 ${Oe.updated}\u3001\u932F\u8AA4 ${(Oe.errors||[]).length}\u3002`,(Oe.errors||[]).length?"warn":"ok",8e3),F&&(F.value=""),await u(),await A()}catch(ke){N(ke.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(U==="prev"||U==="next"){n.offset=Math.max(0,n.offset+(U==="next"?n.limit:-n.limit)),await A();return}if(U==="suite-edit"){let F=n.suites.find(ke=>Number(ke.id)===z);if(!F)return;n.editingSuite=F,n.suiteManageOpen=!0,j();return}if(U==="suite-new"){n.editingSuite=null,n.suiteManageOpen=!0,j();return}if(U==="suite-freeze"){try{await Q.updateBenchmarkSuite(z,{freeze:!0}),N("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),n.editingSuite=null,n.suiteManageOpen=!0,await j()}catch(F){N(F.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(U==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${z}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await Q.deleteBenchmarkSuite(z),N("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),n.editingSuite=null,n.suiteAnswers={},n.suiteManageOpen=!0,await j()}catch(F){N(F.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(U==="decide"){let F=R.closest("form[data-qb-form='review']");F&&await te(F,String(R.dataset.decision||""))}},ve=async P=>{let B=P.target.closest("[data-qb-form]");if(!B)return;P.preventDefault();let U=B.dataset.qbForm;if(U==="create")await C(B);else if(U==="ai-create")await ye(B);else if(U==="filter"){let R=new FormData(B);n.filters={query:String(R.get("query")||"").trim(),status:String(R.get("status")||""),question_type:String(R.get("question_type")||""),difficulty:String(R.get("difficulty")||""),tags:R.getAll("tags").map(z=>String(z).trim()).filter(Boolean)},n.offset=0,await A()}else U==="suite"&&await Se(B)},me=async P=>{let B=P.target.closest?.("form[data-qb-form='filter'] select");if(B){B.form.requestSubmit();return}let U=P.target.closest?.("[data-qb-suite-select]");if(!U)return;let R=Number(U.value||0);!R||R===Number(n.selectedSuiteId)||await he(R)},ce=P=>{let B=P.target;B?.matches?.(".qb-suite-manage")&&(n.suiteManageOpen=!!B.open)},se=P=>{let B=P.target.closest?.("[data-qb-action='open-tag-search']");B&&x(B.closest("[data-qb-tag-filter]"))},Te=P=>{let B=P.target.closest?.("[data-qb-tag-filter]");B&&(P.relatedTarget&&B.contains(P.relatedTarget)||_(B))},xe=P=>{let B=P.target.closest?.("[data-qb-tag-search]");if(!B)return;let U=B.closest("[data-qb-tag-filter]");p&&window.clearTimeout(p),p=window.setTimeout(()=>{k(U,B.value)},160)},Re=P=>{let B=P.target.closest?.("[data-qb-tag-search]");if(!B)return;let U=B.closest("[data-qb-tag-filter]");P.key==="Escape"?(P.preventDefault(),_(U),B.blur()):P.key==="Enter"?(P.preventDefault(),U?.querySelector("[data-qb-action='select-tag']")?.click()):P.key==="ArrowDown"&&(P.preventDefault(),U?.querySelector("[data-qb-action='select-tag']")?.focus())};e.addEventListener("click",qe),e.addEventListener("submit",ve),e.addEventListener("change",me),e.addEventListener("toggle",ce,!0),e.addEventListener("mouseover",se),e.addEventListener("mouseout",Te),e.addEventListener("input",xe),e.addEventListener("keydown",Re);let Ce=async()=>{await u(),n.tab==="create"?b():n.tab==="manage"?await A():n.tab==="suite"?await j({refreshAnswers:!0}):n.tab==="review"&&await O()};return u(),{show:oe,refresh:Ce,destroy(){p&&window.clearTimeout(p),e.removeEventListener("click",qe),e.removeEventListener("submit",ve),e.removeEventListener("change",me),e.removeEventListener("toggle",ce,!0),e.removeEventListener("mouseover",se),e.removeEventListener("mouseout",Te),e.removeEventListener("input",xe),e.removeEventListener("keydown",Re)},getStats:()=>n.stats}}function Sn(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function Ll(e){return e==null?"\u2014":c(e)}function bm(e){return e.count?e.severity==="danger"?Xe("failed","\u9700\u8655\u7406"):e.severity==="warn"?Xe("warning","\u6CE8\u610F"):Xe("preview","\u63D0\u793A"):Xe("success","\u901A\u904E")}function hm(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function vm(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${hm(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${r(e.label)}</span>
      ${bm(e)}
    </div>
    <div class="quality-check-value">
      <strong>${c(t)}</strong>
      <span>\u7B46</span>
      <em>${r(Sn(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${r(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function kn(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
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
  </div>`}function $m(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},n=t.postgres_diff,i=n==null?"\u2014":n===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${c(Math.abs(n))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${c(t.vector_indexed)} / ${c(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${m("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${c(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${c(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${Ll(t.postgres_judgments)}</div>
      <div class="metric-foot">${r(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${r(Sn(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${r(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${Ll(a.candidate_total)}</div>
      <div class="metric-foot">${c(a.candidate_archive_count)} / ${c(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function ym(e){return e.length?`<div class="table-wrap">
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
              <td class="cell-number">${r(Sn(t.match_rate))}</td>
              <td class="cell-number">${c(t.short_text_rows)}</td>
              <td class="cell-number">${c(s)}</td>
              <td class="cell-number">${c(t.duplicate_content_rows)}</td>
              <td class="cell-date">${r(Ht(t.date_min))} \u2013 ${r(Ht(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:ht({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function wm(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],n=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=Ee(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${Xe(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${c(t.rows)} \u7B46 \xB7 ${c(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${fe(e.scan_ms||0)} \xB7
          ${r(we(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${m("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${Be({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(d=>r(d)).join("<br>")})}</div>`:""}
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
        <div class="summary-value">${r(Sn(t.match_rate))}</div>
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
      <div class="quality-checks">${a.map(vm).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${$m(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${c(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${ym(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${kn("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${kn("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${kn("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${kn("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function _m(e){let t=Ut();e.innerHTML=`<section class="page data-page quality-page">
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
  </section>`;let s=e.querySelector("#quality-content"),a=e.querySelector("#quality-refresh"),n=e.querySelector("#quality-meta"),i=[...e.querySelectorAll("[data-quality-tab]")],o={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},l=null,d="overview",p=()=>{if(!l)return;s.innerHTML=wm(l),n.textContent=`DUCKDB \xB7 ${c(l.totals?.rows)} \u7B46 \xB7 ${fe(l.scan_ms||0)}`;let v=e.querySelector("#quality-badge-overview");v&&(v.textContent=c(l.totals?.rows||0))},g=v=>{d=v==="overview"?"overview":v;for(let k of i){let x=k.dataset.qualityTab===d;k.classList.toggle("is-active",x),x?k.setAttribute("aria-current","page"):k.removeAttribute("aria-current")}for(let[k,x]of Object.entries(o))x&&(x.hidden=k!==d);d!=="overview"?n.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":l&&p()},$=ql(e,{onNavigate:v=>g(v),onStats:v=>{let k=v||{},x=e.querySelector("#quality-badge-manage"),_=e.querySelector("#quality-badge-suite"),y=e.querySelector("#quality-badge-review");x&&(x.textContent=c(k.total||0)),_&&(_.textContent=c(k.benchmark_ready||0)),y&&(y.textContent=c((k.pending_review||0)+(k.changes_requested||0)))}}),h=v=>{if(g(v),v!=="overview"){if(t){let k=o[v];k&&(k.innerHTML=Ls("\u984C\u5EAB\u7BA1\u7406\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u5B8C\u6574\u7684\u8CC7\u6599\u54C1\u8CEA\u7E3D\u89BD\uFF1B\u984C\u5EAB\u65B0\u589E\u3001\u7BA1\u7406\u3001Benchmark \u8207\u4EBA\u5DE5\u9A57\u6536\u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002"));return}$.show(v)}},u=async()=>{Ne(a,!0,"\u6383\u63CF\u4E2D\u2026");try{l=await Q.quality(),p()}catch(v){s.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${Be({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:r(v.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,n.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",N("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{Ne(a,!1)}},b=async()=>{d==="overview"?await u():await $.refresh()};if(a.addEventListener("click",b),e.addEventListener("click",v=>{let k=v.target.closest("[data-quality-tab]");k&&h(k.dataset.qualityTab||"overview")}),s.addEventListener("click",v=>{!v.target.closest("[data-action='export-quality']")||!l||Gt(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(l,null,2),"application/json;charset=utf-8")}),g("overview"),t)for(let v of i){if(v.dataset.qualityTab==="overview")continue;v.classList.add("is-demo-locked"),v.removeAttribute("title"),v.dataset.demoLockTooltip="\u5C55\u793A\u6A21\u5F0F\u4E0D\u63D0\u4F9B\u984C\u5EAB\u7BA1\u7406";let k=v.querySelector(".badge");k&&(k.textContent="LOCK")}await u()}var si={};os(si,{render:()=>ag});var xn={};os(xn,{render:()=>ei});var jl={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function Tl(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${r(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${r(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function km(e){let t=e?.supports_chat,s=t===!0?"badge-ok":t===!1?"badge-danger":"badge-neutral",a=t===!0?"\u652F\u63F4 chat":t===!1?"\u4E0D\u652F\u63F4 chat":"\u672A\u6E2C\u8A66",n=(Array.isArray(e?.capabilities)?e.capabilities:[]).map(i=>`<span class="chip chip-mono">${r(i)}</span>`).join("");return`<div class="tests-llm-row">
    <div class="tests-llm-model">
      <strong class="mono">${r(e?.model||"\u2014")}</strong>
      <small>${r(e?.detail||"")}</small>
    </div>
    <div class="tests-llm-meta">
      <span class="badge ${s}">${a}</span>
      ${e?.tested_now?'<span class="badge badge-info">\u672C\u6B21\u65B0\u6E2C</span>':""}
      ${n}
      <span class="tests-llm-time">${e?.tested_at?`\u6E2C\u8A66\u65BC ${r(we(e.tested_at))}`:"\u5C1A\u7121\u6E2C\u8A66\u7D00\u9304"}</span>
    </div>
  </div>`}function Sm(e){let t=Array.isArray(e?.models)?e.models:[],s=e?.counts||{},a=Array.isArray(e?.failures)?e.failures:[];return{summary:e?`<span>llama-server <strong>${s.available??t.length}</strong> \u500B\u6A21\u578B</span>
      <span>\u652F\u63F4 chat <strong>${s.chat??0}</strong></span>
      <span>\u4E0D\u652F\u63F4 <strong>${s.unsupported??0}</strong></span>
      <span>\u672A\u6E2C\u8A66 <strong>${s.untested??0}</strong></span>
      <span>\u672C\u6B21\u65B0\u6E2C <strong>${(e.tested_now||[]).length}</strong></span>
      <span class="muted">${r(e.detail||"")}</span>`:"<span>\u6B63\u5728\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u2026</span>",list:t.length?t.map(km).join(""):'<div class="tests-llm-empty">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u8ACB\u78BA\u8A8D llama-server \u5DF2\u555F\u52D5\u4E26\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66\u3002</div>',failures:a.length?`<div class="tests-llm-failures">${a.map(i=>`<span><strong class="mono">${r(i.model||"\u2014")}</strong> ${r(i.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function xm(e){let t=String(e?.status||"degraded"),s=t==="operational"?"badge-ok":t==="disabled"?"badge-neutral":"badge-danger",a=Array.isArray(e?.scores)?e.scores.slice(0,4):[],n=Array.isArray(e?.results)?e.results[0]:null;return`<div class="tests-llm-row">
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
  </div>`}function Am(e){if(!e)return{summary:"<span>\u6B63\u5728\u8B80\u53D6 reranker \u72C0\u614B\u2026</span>",list:"",failures:""};let t=Array.isArray(e.providers)?e.providers:[],s=e.active||{},a=String(e.status||"degraded"),n=a==="operational"?"badge-ok":a==="not_configured"?"badge-neutral":"badge-danger",i=t.flatMap(o=>(o.errors||[]).map(l=>({model:o.url,detail:l})));return{summary:`<span>\u72C0\u614B <span class="badge ${n}">${r(a)}</span></span>
      <span>\u6A21\u578B <strong>${r(e.model||"\u2014")}</strong></span>
      <span>\u555F\u7528 <strong>${e.enabled?"true":"false"}</strong></span>
      ${s.url?`<span>\u4F5C\u7528\u4E2D <strong class="mono">${r(s.url)}</strong></span>`:""}
      <span class="muted">${r(e.detail||"")}</span>`,list:t.length?t.map(xm).join(""):'<div class="tests-llm-empty">\u6C92\u6709\u8A2D\u5B9A RERANK_URL\uFF1B\u8ACB\u8A2D\u5B9A primary \u6216 fallback reranker\u3002</div>',failures:i.length?`<div class="tests-llm-failures">${i.map(o=>`<span><strong class="mono">${r(o.model||"\u2014")}</strong> ${r(o.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function Mm(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,total_ms:e.total_ms,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}:${a.duration_ms}`)}:null})}async function ei(e,t,{embedded:s=!1}={}){let a=!1,n=!1,i={embedding:[],llm:[]},o=!1,l=null,d=!1,p=null,g=!1,$=null,h=[],u="",b=null,v="",k=`<div class="page-actions">
      <span class="badge badge-neutral badge-mono" id="tests-mode-badge">\u8B80\u53D6\u4E2D</span>
      <button class="btn btn-secondary" type="button" id="tests-refresh">
        ${m("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
      </button>
    </div>`,x=s?`<div class="tests-embed-head">
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
    ${x}

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
  </section>`;let _=e.querySelector("#tests-mode-badge"),y=e.querySelector("#tests-mode-toggle"),I=e.querySelector("#tests-mode-summary"),pe=e.querySelector("#tests-mode-models"),V=e.querySelector("#tests-mode-status"),$e=e.querySelector("#tests-api-form"),he=e.querySelector("#tests-api-input"),ae=e.querySelector("#tests-admin-token-input"),q=e.querySelector("#tests-api-preview"),A=e.querySelector("#tests-api-status"),j=e.querySelector("#tests-api-note"),K=e.querySelector("#tests-api-test"),ge=e.querySelector("#tests-api-reset"),O=e.querySelector("#tests-api-save"),oe=e.querySelector("#tests-refresh"),je=e.querySelector("#tests-flow"),C=e.querySelector("#tests-llm-summary"),ye=e.querySelector("#tests-llm-list"),te=e.querySelector("#tests-llm-failures"),Se=e.querySelector("#tests-llm-status"),qe=e.querySelector("#tests-llm-test"),ve=e.querySelector("#tests-rerank-summary"),me=e.querySelector("#tests-rerank-list"),ce=e.querySelector("#tests-rerank-failures"),se=e.querySelector("#tests-rerank-status"),Te=e.querySelector("#tests-rerank-test");ae&&(ae.value=Pa());let xe=(ne,Ae,Ke="")=>{ne&&(ne.textContent=Ae,ne.className=`tests-status${Ke?` is-${Ke}`:""}`)},Re=(ne,Ae="")=>{A&&(A.textContent=ne,A.className=`api-dialog-status${Ae?` is-${Ae}`:""}`)},Ce=()=>Ot()==="query",P=()=>{let ne=ls(he.value);return ne||(window.location.protocol==="file:"?Dn:"")},B=()=>{let ne=P(),Ae=Yt(),Ke=jl[Ot()]||Ot()||"\u540C\u6E90";q.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${r(vs(Ae))}</strong>${Ae?`\uFF08${r(Ke)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${r(bt("/api/health",ne))}`},U=()=>{let ne=Ot(),Ae=`\u76EE\u524D\u4F86\u6E90\uFF1A${jl[ne]||ne||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,Ke="";ne==="query"?(Ke="is-warn",Ae="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):Ca()?(Ke="is-warn",Ae="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(ne==="file-default"||window.location.protocol==="file:")&&(Ae="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),Ae+=(ae?.value||Pa()).trim()?" \u7BA1\u7406\u6B0A\u6756\uFF1A\u5DF2\u8A2D\u5B9A\uFF0C\u6703\u9001\u5F80\u76EE\u524D\u8A2D\u5B9A\u7684 API Base\u3002":" \u7BA1\u7406\u6B0A\u6756\uFF1A\u672A\u8A2D\u5B9A\uFF1B\u672C\u6A5F loopback \u53EF\u76F4\u63A5\u4F7F\u7528\uFF0C\u9060\u7AEF\u7BA1\u7406 API \u6703\u88AB\u62D2\u7D55\u3002",j.textContent=Ae,j.className=`api-dialog-note${Ke?` ${Ke}`:""}`;let ze=ne==="query";O.disabled=ze,ge.disabled=ze,he.readOnly=ze},R=()=>{if(!Bn(he.value))return Re("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),he.focus(),null;let ne=P();return window.location.protocol==="https:"&&/^http:\/\//i.test(ne)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(ne)?(Re("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),he.focus(),null):ne},z=()=>{he.value=Yt(),B(),U(),Re("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},F=()=>{let ne=Array.isArray(i.embedding)?i.embedding.length:0,Ae=Array.isArray(i.llm)?i.llm.length:0;if(_&&(_.textContent=o?"\u5207\u63DB\u4E2D\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",_.className=`badge badge-mono ${o?"badge-info":n?"badge-warn":"badge-neutral"}`),y){y.disabled=o,y.classList.toggle("is-on",n),y.classList.toggle("is-off",!n&&!o),y.classList.toggle("is-busy",o),y.setAttribute("aria-checked",n?"true":"false"),y.setAttribute("aria-busy",o?"true":"false"),y.setAttribute("aria-label",o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":n?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),y.title=o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let Ke=y.querySelector(".header-power-label");Ke&&(Ke.textContent=o?"\u2026":n?"ON":"OFF")}I&&(I.textContent=n?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${ne} \u500B embedding \u8207 ${Ae} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),pe&&(pe.innerHTML=Tl("Embedding",i.embedding)+Tl("LLM",i.llm))},ke=async()=>{try{let ne=await Q.testMode();if(a)return;n=!!ne.enabled,i=ne.models||{embedding:[],llm:[]},xe(V,"")}catch(ne){if(a)return;n=!1,i={embedding:[],llm:[]},xe(V,ne.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}a||F()},Oe=async()=>{if(o)return;let ne=!n;o=!0,F(),xe(V,ne?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let Ae=await Q.setTestMode(ne);if(a)return;n=!!Ae.enabled,i=Ae.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:n,models:i}}));let Ke=i.embedding?.length||0,ze=i.llm?.length||0;xe(V,n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${Ke} \u500B embedding \u8207 ${ze} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),N(n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${Ke} \u500B embedding\u3001${ze} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",n?"ok":"info",6e3),await it()}catch(Ae){a||(xe(V,Ae.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),N(Ae.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{o=!1,a||F()}},Ye=()=>{let ne=Sm(l);if(C&&(C.innerHTML=ne.summary),ye&&(ye.innerHTML=ne.list),te&&(te.innerHTML=ne.failures),qe){qe.disabled=d,qe.setAttribute("aria-busy",d?"true":"false");let Ae=qe.querySelector("span");Ae&&(Ae.textContent=d?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66")}},Ue=async()=>{try{let ne=await Q.llmModels();if(a)return;l=ne,xe(Se,"")}catch(ne){if(a)return;l=null,xe(Se,ne.message||"\u7121\u6CD5\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u3002","error")}a||Ye()},tt=async()=>{if(!d){d=!0,Ye(),xe(Se,"\u6B63\u5728\u6AA2\u67E5 llama-server \u6A21\u578B\u8207 chat \u80FD\u529B\u2026");try{let ne=await Q.testLlmModels();if(a)return;l=ne;let Ae=ne.tested_now?.length||0,Ke=ne.chat_models?.length||0,ze=ne.failures?.length||0;xe(Se,`${Ae?`\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u672C\u6B21\u65B0\u6E2C ${Ae} \u500B\u6A21\u578B`:"\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u6C92\u6709\u65B0\u6A21\u578B"}\uFF0C\u76EE\u524D ${Ke} \u500B\u6A21\u578B\u652F\u63F4 chat${ze?`\uFF1B${ze} \u500B\u6A21\u578B\u66AB\u6642\u7121\u6CD5\u5224\u5B9A\uFF0C\u4E0B\u6B21\u6703\u91CD\u8A66`:""}\u3002`,ze?"warn":"ok"),N(Ae?`LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u65B0\u589E ${Ae} \u7B46\u80FD\u529B\u7D00\u9304\u3002`:"LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u6C92\u6709\u65B0\u6A21\u578B\u9700\u8981\u6E2C\u8A66\u3002",ze?"warn":"ok",5e3),await ke()}catch(ne){a||(xe(Se,ne.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),N(ne.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{d=!1,a||Ye()}}},ut=()=>{let ne=Am(p);if(ve&&(ve.innerHTML=ne.summary),me&&(me.innerHTML=ne.list),ce&&(ce.innerHTML=ne.failures),Te){Te.disabled=g,Te.setAttribute("aria-busy",g?"true":"false");let Ae=Te.querySelector("span");Ae&&(Ae.textContent=g?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C Reranker \u670D\u52D9\u6E2C\u8A66")}},lt=async()=>{try{let ne=await Q.rerankStatus();if(a)return;p=ne,xe(se,"")}catch(ne){if(a)return;p=null,xe(se,ne.message||"\u7121\u6CD5\u8B80\u53D6 reranker \u72C0\u614B\u3002","error")}a||ut()},de=async()=>{if(!g){g=!0,ut(),xe(se,"\u6B63\u5728\u5C0D primary\uFF0Ffallback reranker \u57F7\u884C\u5BE6\u969B rerank \u6E2C\u8A66\u2026");try{let ne=await Q.testReranker();if(a)return;p=ne;let Ae=Array.isArray(ne.providers)?ne.providers:[],Ke=Ae.filter(Tt=>Tt.status==="operational").length,ze=Ae.reduce((Tt,ft)=>Tt+(Array.isArray(ft.errors)?ft.errors.length:0),0);xe(se,ze?`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${Ke} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C${ze} \u500B\u932F\u8AA4\uFF1B\u8A73\u7D30\u5206\u6578\u5DF2\u5217\u5728\u4E0A\u65B9\u3002`:`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${Ke} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C\u6A21\u578B ${ne.model||"\u2014"}\u3002`,ze?"warn":"ok"),N(ze?"Reranker \u90E8\u5206\u7AEF\u9EDE\u5931\u6557\uFF0C\u8ACB\u67E5\u770B\u6E2C\u8A66\u7D50\u679C\u3002":"Reranker \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\u3002",ze?"warn":"ok",5e3)}catch(ne){a||(xe(se,ne.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),N(ne.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{g=!1,a||ut()}}},et=()=>{if(!je)return;let ne=Mm($,h,u);ne!==v&&(v=ne,je.innerHTML=Zs($,h,u))},Qe=async()=>{try{let ne=await Q.testRuns(30);if(a)return;h=Array.isArray(ne.runs)?ne.runs:[]}catch{if(a)return;h=[]}},it=async(ne=null)=>{try{let Ae=ne||(u?await Q.testRun(u):await Q.testRunCurrent());if(a)return;$=Ae.run||null,!u&&$&&$.status!=="running"&&!h.some(Ke=>Ke.run_id===$.run_id)&&await Qe()}catch{if(a)return;$=null}a||et()};he?.addEventListener("input",()=>{B(),Re("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),ae?.addEventListener("input",()=>{U()}),K?.addEventListener("click",async()=>{let ne=R();if(ne!==null){Ne(K,!0,"\u6E2C\u8A66\u4E2D\u2026"),Re(`\u6B63\u5728\u9023\u7DDA\u5230 ${vs(ne)||"\u540C\u6E90"}\u2026`);try{let Ae=await gi(ne);if(a)return;Re(`\u9023\u7DDA\u6210\u529F \xB7 v${Ae.version} \xB7 ${Ae.duration_ms} ms \xB7 GET ${bt("/api/health",ne)}`,"ok")}catch(Ae){a||Re(Ae.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{a||Ne(K,!1)}}}),$e?.addEventListener("submit",ne=>{if(ne.preventDefault(),Ce())return;let Ae=R();Ae!==null&&(zn(Ae),ui(ae?.value||""),N(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${vs(Ae)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),ge?.addEventListener("click",()=>{Ce()||(zn(""),N("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),y?.addEventListener("click",Oe),qe?.addEventListener("click",tt),Te?.addEventListener("click",de),je?.addEventListener("change",async ne=>{ne.target.id==="test-run-select"&&(u=String(ne.target.value||""),await it())}),je?.addEventListener("click",async ne=>{ne.target.closest("#test-flow-refresh")&&(u="",await Qe(),await it())}),oe?.addEventListener("click",async()=>{Ne(oe,!0,"\u66F4\u65B0\u4E2D\u2026"),z(),await Promise.allSettled([ke(),Qe(),Ue(),lt()]),a||await it(),a||(Ne(oe,!1),N("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let gt=ne=>{n=!!ne.detail?.enabled,i=ne.detail?.models||{embedding:[],llm:[]},F()};return window.addEventListener("judgment:test-mode",gt),z(),F(),Ye(),ut(),await Promise.allSettled([ke(),Qe(),Ue(),lt()]),await it(),b=_t("test-runs",async(ne,Ae)=>{a||document.hidden||u||await it(Ae?.snapshot||null)}),!s&&typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{a=!0,b&&b(),window.removeEventListener("judgment:test-mode",gt)}}var El={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var Pl={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},ti=new Set,Il=new Set(["tests","resources","local-model","api"]),Dl=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"tests",label:"\u7CFB\u7D71\u6E2C\u8A66",hint:"API\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u6A21\u578B Flow",icon:"terminal"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"local-model",label:"Model Provider",hint:"llama-server \u4E3B\u6A5F\u8207\u6A21\u578B",icon:"server"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 API \u2192 Pipeline \u2192 Data",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}],qa=[{id:"system",label:"\u7CFB\u7D71\u8207\u5373\u6642\u72C0\u614B",icon:"activity",prefixes:["/api/health","/api/status","/api/system-usage","/api/events/stream","/api/processing/events/status","/api/docs","/api/openapi.json"]},{id:"processing",label:"\u8CC7\u6599\u8655\u7406\u8207\u66F4\u65B0",icon:"database",prefixes:["/api/processing","/api/judgment-download","/api/updates","/api/courts","/api/law-versions"]},{id:"data",label:"\u67E5\u8A62\u8207\u8CC7\u6599",icon:"search",prefixes:["/api/query","/api/data","/api/judgment","/api/law","/api/schema","/api/catalog","/api/judgment-stats","/api/quality"]},{id:"rag",label:"RAG \u554F\u7B54",icon:"message",prefixes:["/api/rag"]},{id:"index",label:"\u7248\u672C\u8207\u7D22\u5F15",icon:"layers",prefixes:["/api/index-versions","/api/index-alias","/api/versioning"]},{id:"models",label:"\u6A21\u578B\u8207\u670D\u52D9",icon:"brain",prefixes:["/api/ollama","/api/llm","/api/rerank","/api/test-mode"]},{id:"tests",label:"\u6E2C\u8A66\u8207\u6548\u80FD",icon:"activity",prefixes:["/api/test-runs","/api/performance"]},{id:"question-bank",label:"\u984C\u5EAB",icon:"file",prefixes:["/api/question-bank"]},{id:"benchmark",label:"Benchmark",icon:"grid",prefixes:["/api/benchmark"]},{id:"other",label:"\u5176\u4ED6",icon:"terminal",prefixes:[]}];function qm(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:zt(e).label,tone:zt(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function Lm(e){let t=zt(e.status),s=El[e.kind]||El.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${c(e.latency_ms)} ms</span>`;return`<article class="service-card">
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
  </article>`}function jm(e,t){let s=typeof e=="string"?{label:e}:e||{},a=String(s.label||"\u2014"),n=s.service?t.find(l=>l.id===s.service):null,i=n?n.status==="operational":a==="IndexedDB"?Ui():!0,o=[s.detail||"",n?`\u72C0\u614B\uFF1A${zt(n.status).label}`:""].filter(Boolean).join(" \xB7 ");return`<div class="arch-node ${i?"":"is-muted"}" title="${r(o||(i?a:"\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"))}">
    <strong>${r(a)}</strong>
    ${s.detail?`<span class="arch-node-detail">${r(s.detail)}</span>`:""}
  </div>`}function Tm(e,t,s=!1){let a=e?.layers||[];if(!a.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let n=a.map(o=>{let l=(o.nodes||[]).map(d=>jm(d,t)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${r(o.label||o.id)}</div>
      <div class="arch-nodes">${l}</div>
    </div>`}),i=[];return n.forEach((o,l)=>{l&&i.push(`<div class="arch-arrow" aria-hidden="true">${m("arrowRight",15)}</div>`),i.push(o)}),`<div class="arch-flow">${i.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${m("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>
    ${Em(s)}`}function Em(e=!1){return`<figure class="arch-diagram">
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
  </figure>`}function Bl(e){let t=String(e||""),s=a=>t===a||t.startsWith(`${a}/`);for(let a of qa)if(a.prefixes.some(s))return a;return qa[qa.length-1]}function Nm(e){return`is-${String(e||"get").toLowerCase()}`}function Rm(e){return`<div class="endpoint-row${e.deprecated?" is-deprecated":""}">
    <span class="endpoint-method ${Nm(e.method)}">${r(e.method||"GET")}</span>
    <span class="endpoint-path" title="${r(e.path||"")}">${r(e.path||"")}</span>
    <span class="endpoint-label">${r(e.label||"")}</span>
  </div>`}function Cm(e){if(!Array.isArray(e)||!e.length)return'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>';let t=new Map(qa.map(s=>[s.id,{group:s,endpoints:[]}]));for(let s of e){let a=Bl(s.path),n=t.get(a.id);n&&n.endpoints.push(s)}return`<div class="api-endpoint-groups">${qa.map(s=>{let n=t.get(s.id)?.endpoints||[];return n.length?(n.sort((i,o)=>String(i.path).localeCompare(String(o.path))||String(i.method).localeCompare(String(o.method))),`<section class="card api-endpoint-group">
        <div class="side-card-head">
          <span class="side-card-title">${m(s.icon,14)}${r(s.label)}</span>
          <span class="badge badge-neutral badge-mono">${c(n.length)}</span>
        </div>
        <div class="endpoint-list">${n.map(Rm).join("")}</div>
      </section>`):""}).join("")}</div>`}function ms(e,t){return`<div class="detail-row">
    <span class="detail-label">${r(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function Ve(e,t,{mono:s=!1,wide:a=!1}={}){return`<div class="data-version-fact${a?" is-wide":""}">
    <span>${r(e)}</span>
    <strong class="${s?"mono":""}">${r(String(t??"\u2014"))}</strong>
  </div>`}function Nl(e,t,s,a=""){let n=t==null?null:Math.max(0,Math.min(100,Number(t)||0));return`<div class="data-version-coverage ${a}">
    <div class="data-version-coverage-head">
      <span>${r(e)}</span>
      <strong>${An(n)}</strong>
    </div>
    <div class="data-version-coverage-track"><span style="width:${n===null?0:n.toFixed(1)}%"></span></div>
    <div class="data-version-coverage-foot">${r(s)}</div>
  </div>`}function Pm(e){if(!Array.isArray(e)||!e.length)return ht({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${r(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${Da(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function Im(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=new Map(s.map(v=>[v.id,v])),n=a.get("qdrant"),i=a.get("embedding"),o=a.get("rag"),l=a.get("llm"),d=Number(t.judgment_indexed_count||0),p=Number(t.judgment_count||0),g=p?(d/p*100).toFixed(1):"0.0",$=t.judgment_vector_points===null||t.judgment_vector_points===void 0?"\u2014":c(t.judgment_vector_points),h=Number(t.judgment_index_remaining||0),u=o?.status==="operational"?"RAG \u5C31\u7DD2":o?.status==="not_configured"?"\u672A\u8A2D\u5B9A":o?.status==="degraded"?"\u964D\u7D1A":"\u672A\u77E5",b=[["cube","Qdrant \u5411\u91CF\u7D22\u5F15",n],["layers",`Embedding\uFF08${t.judgment_vector_model||"\u2014"}\uFF09`,i],["brain","RAG \u56DE\u7B54\u7BA1\u7DDA",o],["sparkles","LLM \u6A21\u578B",l]];return`<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}RAG \u8CC7\u6599\u73FE\u6CC1</span>
      ${Xe(o?.status,u)}
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
        ${b.map(([v,k,x])=>`<div class="side-status-row">
              <span>${m(v,13)}${r(k)}</span>
              ${Xe(x?.status,x?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
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
  </section>`}function An(e){let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function gs(e){return Math.max(0,Number(e?.duration_ms)||0)}function Dm(e,t){let s=e?.pipeline&&typeof e.pipeline=="object"?e.pipeline:null,a=Array.isArray(s?.stages)?s.stages:[],n=Number(s?.total_ms)||a.reduce((h,u)=>h+gs(u),0),i=Math.max(0,Number(t?.initMs)||0),o=Math.max(0,Number(t?.requestMs)||0),l=Math.max(o,n),d=Math.max(0,l-n),p=[],g=t?.requestStartedAt||e?.checked_at||null,$=t?.requestFinishedAt||e?.checked_at||null;if(i>.5&&p.push({key:"page-init",label:"\u9801\u9762\u521D\u59CB\u5316",caption:"\u5EFA\u7ACB\u670D\u52D9\u7E3D\u89BD\u9AA8\u67B6\u8207\u5C0E\u89BD",color:"#64748b",status:"success",duration_ms:i,started_at:t?.initStartedAt||g,finished_at:g,message:"\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u3001\u8F09\u5165\u6A21\u7D44\u4E26\u6E96\u5099\u8ACB\u6C42\u3002"}),a.length){d>.5&&p.push({key:"http",label:"HTTP \u50B3\u8F38\uFF0F\u6392\u968A",caption:"\u700F\u89BD\u5668 \u2192 FastAPI",color:"#94a3b8",status:"success",duration_ms:d,started_at:g,finished_at:$,message:"\u5305\u542B\u9023\u7DDA\u3001\u8ACB\u6C42\u6392\u968A\u8207\u56DE\u61C9\u50B3\u8F38\u3002"}),p.push(...a);let h=a.reduce((b,v)=>b+gs(v),0),u=Math.max(0,n-h);u>.5&&p.push({key:"server-assemble",label:"\u4F3A\u670D\u5668\u5F59\u6574",caption:"\u72C0\u614B\u56DE\u61C9\u7D44\u88DD",color:"#cbd5e1",status:"success",duration_ms:u,started_at:a[a.length-1]?.finished_at||g,finished_at:$,message:"\u7D44\u88DD\u670D\u52D9\u3001\u8CC7\u6599\u91CF\u8207\u67B6\u69CB payload\u3002"})}else p.push({key:"status-request",label:"GET /api/status",caption:"\u670D\u52D9\u72C0\u614B\u8207\u8CC7\u6599\u91CF",color:"#64748b",status:"success",duration_ms:l,started_at:g,finished_at:$,message:"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF1B\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593\u3002"});return{total_ms:i+l,started_at:t?.initStartedAt||g,finished_at:$,stages:p,server_ms:n,request_ms:l,transport_ms:d,init_ms:i,detailed:!!s}}function Bm(e){let t=e?.page_pipeline,s=Array.isArray(t?.stages)?t.stages:[];if(!t||!s.length)return"";let a=Math.max(0,Number(t.total_ms)||s.reduce((y,I)=>y+gs(I),0)),n=Math.max(a,s.reduce((y,I)=>y+gs(I),0),1),i=1.25,o=s.filter(y=>String(y.status||"success")!=="skipped"),l=s.filter(y=>["success","no_change"].includes(String(y.status||"success"))).length,d=s.filter(y=>y.status==="failed").length,p=s.reduce((y,I)=>gs(I)>gs(y)?I:y,s[0]),g=Math.max(0,Number(t.server_ms)||Number(e?.pipeline?.total_ms)||0),$=Math.max(0,Number(t.transport_ms)||0),h=Math.max(0,Number(t.init_ms)||0),u=s.map(y=>String(y.status||"success")==="skipped"?0:Math.max(gs(y)/n*100,i)),b=u.reduce((y,I)=>y+I,0),v=b>100?100/b:1,k=0,x=s.map((y,I)=>{let pe=String(y.status||"success"),V=pe==="skipped",$e=y.label||y.key||`\u968E\u6BB5 ${I+1}`,he=y.caption||"",ae=gs(y),q=V?"\u2014":fe(ae),A=n>0?ae/n*100:0,j=V?0:u[I]*v,K=k;V||(k+=j);let ge=y.color||"#64748b",O=pe==="failed"?"var(--danger)":ge,oe=[`is-${pe}`,pe==="failed"?"is-error":"",V?"is-missing":""].filter(Boolean).join(" "),je=j>0?`<span class="rag-wf-bar status-wf-bar is-sequential" style="left:${K.toFixed(3)}%;width:${j.toFixed(4)}%;top:0;height:12px;--bar-color:${r(O)}" aria-hidden="true"></span>`:"",C=V?"\u7565\u904E":pe==="failed"?"\u5931\u6557":"\u5B8C\u6210",ye=`${t.label||"status"}:${y.key||I}`,te=[["\u72C0\u614B",C,!0],["\u958B\u59CB",y.started_at?we(y.started_at):"\u2014",!0],["\u7D50\u675F",y.finished_at?we(y.finished_at):"\u2014",!0],["\u8017\u6642",q,!0],["\u5360\u6574\u9AD4",An(A),!0],["\u8AAA\u660E",y.message||"",!1]].map(([Se,qe,ve])=>ve||qe?`<span class="rag-wf-detail"><span>${r(Se)}</span><strong>${r(String(qe||"\u2014"))}</strong></span>`:"").join("");return`<details class="rag-wf-stage status-wf-stage ${oe}" data-status-wf-stage="${r(ye)}"${ti.has(ye)?" open":""} style="--stage-color:${r(ge)}">
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="status-wf-step">${String(I+1).padStart(2,"0")}</span> ${r($e)}</strong>${he?`<small>${r(he)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(q)} \xB7 ${r(C)} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${$e}\uFF1A${C}\uFF0C\u8017\u6642 ${q}\uFF0C\u5360\u6574\u9AD4 ${An(A)}`)}">${je}</span>
        </summary>
        <div class="rag-wf-details">${te}</div>
      </details>`}).join(""),_=t.detailed?"\u5F8C\u7AEF /api/status \u968E\u6BB5\u660E\u7D30":"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF0C\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593";return`<section class="report-card status-wf-card" data-status-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${m("activity",14)}\u670D\u52D9\u7E3D\u89BD\u8F09\u5165 Pipeline</span>
      <div class="index-runtime-metrics">
        <span class="index-runtime-metric" title="\u672C\u6B21\u9801\u9762\u521D\u59CB\u5316\u5230\u72C0\u614B\u56DE\u61C9\u5B8C\u6210\u7684\u7E3D\u6642\u9593\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(fe(a))}</strong></span>
        <span class="index-runtime-metric" title="\u5F8C\u7AEF /api/status \u6AA2\u67E5\u968E\u6BB5\u7684\u5408\u8A08\u6642\u9593\u3002"><span>Server</span><strong>${r(fe(g))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u8ACB\u6C42\u6642\u9593\u6263\u6389\u5F8C\u7AEF\u6AA2\u67E5\u5F8C\u7684\u50B3\u8F38\u8207\u6392\u968A\u6642\u9593\u3002"><span>HTTP \u50B3\u8F38</span><strong>${r(fe($))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u9AA8\u67B6\u8207\u8F09\u5165\u6A21\u7D44\u7684\u6642\u9593\u3002"><span>\u9801\u9762\u521D\u59CB\u5316</span><strong>${r(fe(h))}</strong></span>
        <span class="index-runtime-metric" title="\u8017\u6642\u6700\u9577\u7684\u6AA2\u67E5\u968E\u6BB5\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${p?.label||"\u2014"} \xB7 ${fe(gs(p))}`)}</strong></span>
        <span class="index-runtime-metric" title="\u5B8C\u6210\u7684\u6AA2\u67E5\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\uFF1B\u5931\u6557\u968E\u6BB5\u6703\u4EE5\u7D05\u8272\u6A19\u793A\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${c(l)} / ${c(s.length)}${d?` \xB7 \u5931\u6557 ${c(d)}`:""}</strong></span>
      </div>
    </div>
    <div class="status-wf-summary">
      <span>\u6AA2\u67E5 <strong>${r(we(e.checked_at))}</strong></span>
      <span>API <strong class="mono">${r(vs())}</strong></span>
      <span>\u7248\u672C <strong class="mono">v${r(e.version||"\u2014")}</strong></span>
      <span>\u74B0\u5883 <strong>${r(e.environment||"\u2014")}</strong></span>
      <span>${r(_)}</span>
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
      <div class="rag-wf-stages">${x}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u986F\u793A\u672C\u6B21\u958B\u555F\u670D\u52D9\u7E3D\u89BD\u7684\u9801\u9762\u521D\u59CB\u5316\u3001HTTP \u5F80\u8FD4\u3001\u5F8C\u7AEF\u6AA2\u67E5\u8207\u56DE\u61C9\u5F59\u6574\u3002\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u5931\u6557\u968E\u6BB5\u4EE5\u7D05\u8272\u6A19\u793A\uFF0C\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\uFF1B\u6975\u77ED\u968E\u6BB5\u4FDD\u7559\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function Fm(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=qm(e.status),n=s.find(p=>p.id==="qdrant"),i=s.find(p=>p.id==="rag"),o=s.find(p=>p.id==="llm"),l=Ot(),d=Pl[l]||l;return`<section class="status-hero">
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
          <span>${m("clock",11)} \u6AA2\u67E5\u6642\u9593 ${we(e.checked_at)} \xB7 ${r(ca(e.checked_at))}</span>
          <span>${m("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${m("database",11)} ${c(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${m("layers",11)} ${c(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${r(d)}">${m("link",11)} ${r(vs())}</span>
        </div>
      </div>
    </section>

    ${Bm(e)}

    <div class="service-grid">${s.map(Lm).join("")}</div>

    ${Im(e)}

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

    ${n?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${Be({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${r(n?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${r(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${r(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}`}function Om(e,t=!1){let s=Array.isArray(e.services)?e.services:[],a=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Pipelines \u2192 Data \xB7 \u6700\u65B0\u5C08\u6848\u5143\u4EF6\u8207\u5373\u6642\u5065\u5EB7\u72C0\u614B</div>
      </div>
      <span class="badge badge-neutral badge-mono">${c((a.flow||[]).length)} layers</span>
    </div>
    ${Tm(a,s,t)}
  </div>`}function Hm(e){let t=Array.isArray(e.endpoints)?e.endpoints:[],s=Ot(),a=Pl[s]||s,n=bt("/api/docs"),i=bt("/api/openapi.json"),o=new Set(t.map(p=>Bl(p.path).id)),l=t.reduce((p,g)=>{let $=String(g.method||"GET").toUpperCase();return p[$]=(p[$]||0)+1,p},{}),d=["GET","POST","PATCH","PUT","DELETE"].filter(p=>l[p]).map(p=>`${p} ${c(l[p])}`).join(" \xB7 ");return`<section class="status-hero api-endpoint-hero">
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
          <span>${m("server",11)} API Base <span class="mono">${r(vs())}</span>\uFF08${r(a)}\uFF09</span>
          <span>${m("terminal",11)} ${r(d||"\u2014")}</span>
          <span>${m("clock",11)} \u66F4\u65B0\u6642\u9593 ${we(e.checked_at)}</span>
        </div>
      </div>
      <div class="api-endpoint-actions">
        <a class="btn btn-secondary btn-sm" href="${r(n)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>Swagger UI</span></a>
        <a class="btn btn-ghost btn-sm" href="${r(i)}" target="_blank" rel="noopener noreferrer">OpenAPI JSON ${m("external",11)}</a>
      </div>
    </section>
    ${Cm(t)}
    <p class="status-footnote">\u7AEF\u9EDE\u7531 FastAPI route table \u52D5\u614B\u7522\u751F\uFF1B\u4E92\u52D5\u5F0F\u6587\u4EF6\u4F4D\u65BC <a href="${r(n)}" target="_blank" rel="noopener noreferrer"><code>${r(n)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${r(i)}" target="_blank" rel="noopener noreferrer"><code>${r(i)}</code></a>\u3002\u7AEF\u9EDE\u8B8A\u66F4\u5F8C\u91CD\u65B0\u6574\u7406\u6B64\u9801\u5373\u53EF\u53D6\u5F97\u6700\u65B0\u6E05\u55AE\u3002</p>`}function zm(e,t={}){let s=e.data||{},a=t.info||null,n=a?.counts||{},i=Number(s.judgment_indexed_count||0),o=Number(s.judgment_count||0),l=Number(s.judgment_index_remaining??Math.max(0,o-i)),d=Number(s.judgment_index_pending??l)||0,p=Number(s.judgment_index_changed||0),g=Number(s.judgment_index_stale||0),$=o>0?Math.max(0,Math.min(100,i/o*100)):null,h=An($),u=s.judgment_index_fresh===!1||d>0||String(s.judgment_index_staleness?.status||"")==="stale",b=u?"is-warn":"",v=s.last_version||{},k=s.last_run||{},x=v.source_type==="law"?"\u6CD5\u898F":v.source_type==="order"?"\u547D\u4EE4":"\u2014",_=v.version_code?String(v.version_code):v.id?`#${c(v.id)}`:"\u2014",y=Number(s.legal_article_indexed_count||s.legal_index?.points_count||0),I=Number(s.legal_article_count||s.legal_index?.article_count||0),pe=I>0?Math.max(0,Math.min(100,y/I*100)):null,V=s.legal_article_stale===!0||String(s.legal_index?.status||"")==="stale",$e=V?"is-warn":"",he=s.judgment_vector_alias||"\u2014",ae=s.judgment_vector_collection||"\u2014",q=s.legal_article_vector_alias||s.legal_index?.alias||"\u2014",A=s.legal_article_vector_collection||s.legal_index?.collection||"\u2014",j=u?"\u5224\u6C7A\u7D22\u5F15\u5F85\u66F4\u65B0":"\u8CC7\u6599\u7248\u672C\u4E00\u81F4",K=u?`\u5224\u6C7A\u7D22\u5F15\u5C1A\u7F3A ${c(d)} \u7B46`:"\u5224\u6C7A\u8CC7\u6599\u8207\u5411\u91CF\u7D22\u5F15\u4E00\u81F4",ge=u?`PostgreSQL \u76EE\u524D\u6709 ${c(o)} \u7B46\u5224\u6C7A\uFF0CQdrant ${ae} \u5DF2\u7D22\u5F15 ${c(i)} \u7B46\uFF1B\u5C1A\u6709 ${c(d)} \u7B46\u5F85\u7D22\u5F15\u3002`:"PostgreSQL \u8207 Qdrant \u5224\u6C7A\u7B46\u6578\u4E00\u81F4\uFF1B\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u8207\u7D22\u5F15\u72C0\u614B\u540C\u6B65\u3002",O=zt(k.status||"idle").label,oe=k.finished_at||k.started_at;return`<section class="status-hero data-version-hero">
      <div class="status-hero-main">
        <div class="overall-row">
          <span class="overall-badge ${b}">
            <span class="status-dot ${u?"is-warn":"is-ok"}" aria-hidden="true"></span>
            ${r(j)}
          </span>
          <span class="badge badge-neutral badge-mono">${c(s.version_count)} \u500B\u8CC7\u6599\u7248\u672C</span>
          <span class="badge badge-neutral">${r(x)} \u6700\u65B0\u7248\u672C ${r(_)}</span>
        </div>
        <h2 class="status-headline">${r(K)}</h2>
        <p class="status-copy">${r(ge)}</p>
        <div class="status-meta">
          <span>${m("clock",11)} \u6AA2\u67E5\u6642\u9593 ${we(e.checked_at)}</span>
          <span>${m("database",11)} \u73FE\u884C\u8CC7\u6599 ${c(s.total_current)} \u7B46</span>
          <span>${m("layers",11)} \u539F\u59CB Parquet ${c(s.parquet_files)} \u500B \xB7 ${Ee(s.parquet_bytes)}</span>
          <span title="Qdrant alias \u8207\u76EE\u524D\u7248\u672C collection">${m("link",11)} <span class="mono">${r(he)} \u2192 ${r(ae)}</span></span>
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
        <div class="metric-foot">${h} \xB7 \u5269\u9918 ${c(d)} \u7B46</div>
      </div>
    </div>

    <div class="status-columns data-version-grid">
      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${m("database",14)}PostgreSQL \u8CC7\u6599\u7248\u672C</span>
          ${Xe(v.is_current?"operational":"degraded",v.is_current?"CURRENT":"HISTORY")}
        </div>
        ${v.id?`<div class="index-current-row">
                <span class="badge badge-info">${m("activity",11)}${r(x)} ${r(_)}</span>
                <strong class="mono">${we(v.downloaded_at)}</strong>
                <span class="index-current-copy" title="${r(v.parquet_path||"")}">${r(v.parquet_path||"\u2014")}</span>
              </div>
              <div class="data-version-facts">
                ${Ve("\u8CC7\u6599\u7248\u672C\u7E3D\u6578",c(s.version_count),{mono:!0})}
                ${Ve("\u4E0B\u8F09\u57F7\u884C\u7E3D\u6578",c(s.run_count),{mono:!0})}
                ${Ve("\u7248\u672C ID",`#${c(v.id)}`,{mono:!0})}
                ${Ve("\u8CC7\u6599\u985E\u578B",x)}
                ${Ve("\u4F86\u6E90\u66F4\u65B0\u65E5",v.update_date||"\u2014")}
                ${Ve(`${x}\uFF0F\u689D\u6587`,`${c(v.law_count)} / ${c(v.article_count)}`)}
                ${Ve("\u4E0B\u8F09\u6642\u9593",we(v.downloaded_at),{mono:!0})}
                ${Ve("\u8CC7\u6599\u72C0\u614B",v.is_current?"current":"history",{mono:!0})}
                ${Ve("Parquet \u6A94\u6848",v.parquet_path||"\u2014",{mono:!0,wide:!0})}
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
          ${Xe(u?"degraded":"operational",u?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${m("link",11)}Alias</span>
          <strong class="mono">${r(he)}</strong>
          <span class="mono">\u2192 ${r(ae)}</span>
          <span class="index-current-copy">v#${c(s.judgment_vector_version_id)} \xB7 ${r(s.judgment_vector_model||"\u2014")}</span>
        </div>
        ${Nl("\u7D22\u5F15\u8986\u84CB",$,`\u5DF2\u7D22\u5F15 ${c(i)} / ${c(o)} \u7B46 \xB7 \u5269\u9918 ${c(d)} \u7B46`,b)}
        <div class="data-version-facts">
          ${Ve("Qdrant points",c(s.judgment_vector_points),{mono:!0})}
          ${Ve("\u7D22\u5F15\u7248\u672C",`#${c(s.judgment_vector_version_id)} \xB7 ${s.judgment_vector_version_status||"legacy"}`,{mono:!0})}
          ${Ve("\u524D\u4E00\u7248\u672C",s.judgment_vector_previous_version_id?`#${c(s.judgment_vector_previous_version_id)}`:"\u2014",{mono:!0})}
          ${Ve("\u5F85\u88DC\uFF0F\u8B8A\u66F4\uFF0F\u5931\u6548",`${c(d)} / ${c(p)} / ${c(g)}`)}
          ${Ve("\u6700\u8FD1\u7D22\u5F15",we(s.judgment_indexed_at),{mono:!0})}
          ${Ve("\u6A21\u578B",s.judgment_vector_model||"\u2014",{mono:!0})}
        </div>
        ${d>0?`<p class="data-version-note is-warn">${m("info",12)}\u5C1A\u6709 ${c(d)} \u7B46\u5224\u6C7A\u5C1A\u672A\u7D22\u5F15\uFF1B\u8ACB\u81F3\u300C\u8CC7\u6599\u8655\u7406 \u2192 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u63A5\u7E8C\u88DC\u9F4A\u3002</p>`:""}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${m("shield",14)}Qdrant \u6CD5\u898F\uFF0F\u547D\u4EE4\u5411\u91CF\u7D22\u5F15</span>
          ${Xe(V?"degraded":"operational",V?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${m("link",11)}Alias</span>
          <strong class="mono">${r(q)}</strong>
          <span class="mono">\u2192 ${r(A)}</span>
          <span class="index-current-copy">v#${c(s.legal_article_vector_version_id||s.legal_index?.version_id)}</span>
        </div>
        ${Nl("\u689D\u6587\u7D22\u5F15\u8986\u84CB",pe,`\u5DF2\u7D22\u5F15 ${c(y)} / ${c(I)} \u689D`,$e)}
        <div class="data-version-facts">
          ${Ve("Qdrant points",c(y),{mono:!0})}
          ${Ve("\u73FE\u884C\u689D\u6587",c(I),{mono:!0})}
          ${Ve("\u5411\u91CF\u7DAD\u5EA6",c(s.legal_index?.dimension),{mono:!0})}
          ${Ve("\u6700\u8FD1\u7D22\u5F15",we(s.legal_article_indexed_at||s.legal_index?.indexed_at),{mono:!0})}
          ${Ve("\u7D22\u5F15\u72C0\u614B",V?"stale":"fresh",{mono:!0})}
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
          ${Ve("\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C",k.status?O:"\u2014")}
          ${Ve("\u6700\u8FD1\u57F7\u884C\u6642\u9593",oe?we(oe):"\u2014",{mono:!0})}
          ${Ve("\u6700\u8FD1\u57F7\u884C\u8017\u6642",k.duration_ms?fe(k.duration_ms):"\u2014",{mono:!0})}
          ${Ve("\u6700\u8FD1\u57F7\u884C\u7248\u672C",k.version_id?`#${c(k.version_id)}`:"\u2014",{mono:!0})}
        </div>
        <p class="data-version-note">${m("info",12)}
          \u539F\u59CB Parquet \u4FDD\u7559 raw\uFF0Fdelta \u8207 manifest\uFF1BPostgreSQL \u63D0\u4F9B current metadata \u8207\u7248\u672C\u72C0\u614B\uFF1BQdrant \u53EA\u4FDD\u5B58\u5411\u91CF\u8207 payload\u3002
        </p>
      </section>
    </div>`}function Gm(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${c(t.run_count)} TOTAL</span>
    </div>
    ${Pm(e.recent_runs)}
  </section>`}function Um(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function Fl(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function Ps(e,t,s,a,n){let i=Um(n);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${m(t,14)}${r(e)}</span>
      <strong>${r(s)}</strong>
    </div>
    ${Fl(n,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function Qm(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${m("layers",14)}Docker</span>
        ${Xe("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${r(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,d=o.service?0:1;return l-d||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${r(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${r(i.service)}</span>`:""}</td>
        <td>${Xe(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
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
  </section>`}function Jm(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",n=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${ms("\u8CC7\u6599\u5EAB",`<code>${r(s.database||"\u2014")}</code>`)}
           ${ms("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${Ee(s.storage_bytes)}</strong>`)}
           ${ms("Docker volume",`<strong>${Ee(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${ms("\u9023\u7DDA\u6578",`<strong>${c(s.connections)}</strong>`)}`:`${ms("Collection",`<code>${r(s.collection||"\u2014")}</code>`)}
           ${ms("Docker volume",`<strong>${Ee(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${ms("\u5411\u91CF\u9EDE\u6578",`<strong>${c(s.points_count)}</strong>`)}
           ${ms("Collections",`<strong>${c(s.collections)}</strong>`)}
           ${ms("Segments",`<strong>${c(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${r(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${r(s.kind||"")}</div>
          </div>
          ${Xe(i)}
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
      </article>`}).join("")}</div>`}function ta(e,t,s,a){let n=Number(t)||0,i=a?n/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${r(e)}</span>
      <strong>${Ee(n)}</strong>
    </div>
    ${Fl(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function Vm(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},n=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},d=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${Ee(d)}</span>
    </div>
    <div class="storage-list">
      ${ta("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${r(s.frontend_path||"\u2014")}</span>`,d)}
      ${ta("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${r(s.backend_path||"\u2014")}</span>`,d)}
      ${ta("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",n.layers_bytes,`Images ${Ee(n.images_bytes)} \xB7 Containers ${Ee(n.containers_bytes)} \xB7 Build cache ${Ee(n.build_cache_bytes)}`,d)}
      ${ta("PostgreSQL volume",o.size_bytes,`<span class="mono">${r(o.name||"\u2014")}</span>`,d)}
      ${ta("Qdrant volume",l.size_bytes,`<span class="mono">${r(l.name||"\u2014")}</span>`,d)}
      ${ta("Parquet",a.total_bytes,`\u6CD5\u898F ${Ee(a.law_bytes)} \xB7 \u5224\u6C7A ${Ee(a.judgment_bytes)}`,d)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${Ee(d)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function Wm(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},n=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),d=Array.isArray(e.disk)?e.disk:[],p=d[0]||{},g=Number(o.total_bytes||p.total||0),$=g?l/g*100:0,h=[s.load_1,s.load_5,s.load_15].map(v=>v??"\u2014").join(" / "),u=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":fe(Number(t.uptime_seconds)*1e3),b=[p.label?Ps("HDD \u5DF2\u4F7F\u7528","database",`${c(p.percent)}%`,`${Ee(p.used)} / ${Ee(p.total)} \xB7 \u5269\u9918 ${Ee(p.free)}<br><span class="mono">${r(p.path||"")}</span>`,p.percent):"",l?Ps("Judgment \u5143\u4EF6\u5408\u8A08","layers",Ee(l),`\u7D04\u5360 HDD ${c($)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,$):"",...d.slice(1).map(v=>Ps(`\u786C\u789F \xB7 ${v.label}`,"layers",`${c(v.percent)}%`,`${Ee(v.used)} / ${Ee(v.total)} \xB7 \u5269\u9918 ${Ee(v.free)}<br><span class="mono">${r(v.path||"")}</span>`,v.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${we(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${Ps("CPU \u4F7F\u7528\u7387","cpu",`${c(s.percent)}%`,`${c(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${c(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${r(h)}`,s.percent)}
      ${Ps("\u8A18\u61B6\u9AD4","server",`${c(a.percent)}%`,`${Ee(a.used)} / ${Ee(a.total)} \xB7 \u53EF\u7528 ${Ee(a.available)}`,a.percent)}
      ${Ps("Swap","layers",`${c(n.percent)}%`,`${Ee(n.used)} / ${Ee(n.total)}`,n.percent)}
      ${Ps("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${c(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${r(u)}<br>${r(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${b||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${Vm(e)}
    ${Qm(e)}
    ${Jm(e)}`}function Rl(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function Km(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SYSTEM RESOURCE USAGE</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Be({tone:"danger",title:"\u8CC7\u6E90 API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-resources-retry">
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Ym(e){return e.status==="operational"?{label:"\u5DF2\u9023\u7DDA",badge:"badge-ok"}:{label:"\u7121\u6CD5\u9023\u7DDA",badge:"badge-danger"}}function Xm(e,t){let s=Ym(e),a=Array.isArray(e.models)?e.models:[],n=a.length?a.map(i=>{let o=String(i.name||""),l=e.chat_model===o,d=e.embedding_model===o,p=i.size?Ee(i.size):"",g=i.modified_at?we(i.modified_at):"",$=new Set((i.capabilities||[]).map(u=>String(u||"").toLowerCase())),h=[];return i.supports_chat===!0&&h.push(["Chat","badge-ok"]),$.has("embedding")&&h.push(["Embedding","badge-info"]),$.has("vision")&&h.push(["Vision","badge-neutral"]),$.has("tools")&&h.push(["Tools","badge-neutral"]),$.has("thinking")&&h.push(["Thinking","badge-neutral"]),$.has("speech")&&h.push(["Speech","badge-warn"]),i.is_reranker&&h.push(["Reranker","badge-neutral"]),h.length||h.push([i.capability_status==="untested"?"\u672A\u6E2C\u8A66":"\u7121 chat \u80FD\u529B","badge-neutral"]),`<div class="ollama-model-row">
            <div class="ollama-model-main">
              <strong>${r(o)}</strong>
              <span class="ollama-model-meta">${[p,g].filter(Boolean).map(u=>r(u)).join(" \xB7 ")||"\u2014"}</span>
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
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="edit-host" data-id="${e.id}">${m("edit",13)}<span>\u7DE8\u8F2F</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="delete-host" data-id="${e.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
      </div>
    </div>
    <div class="ollama-model-list">${n}</div>
  </article>`}function Zm(e,t,s,a){if(s)return`<div class="report-card">
      ${Be({tone:"danger",title:"Model Provider \u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
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
      ${t?'<div class="ollama-loading"><span class="spinner"></span><span>\u8B80\u53D6 llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span></div>':i.length?`<div class="ollama-host-list">${i.map(p=>Xm(p,a)).join("")}</div>`:ht({iconName:"server",title:"\u5C1A\u672A\u8A2D\u5B9A llama-server \u4E3B\u6A5F",text:"\u8ACB\u5728\u4E0A\u65B9\u8F38\u5165\u7DB2\u5740\u8207 Port \u65B0\u589E\uFF0C\u6216\u4F7F\u7528 .env \u7684\u9810\u8A2D\u9023\u7DDA\u3002"})}
      <p class="report-sub" style="margin-top:12px">\u8A2D\u70BA\u804A\u5929\u6216\u5D4C\u5165\u6A21\u578B\u5F8C\uFF0C\u7CFB\u7D71\u6703\u4F7F\u7528\u76EE\u524D\u4E3B\u6A5F\u7684\u5C0D\u61C9\u6A21\u578B\u57F7\u884C AI \u51FA\u984C\u8207 RAG\uFF1B\u672A\u8A2D\u5B9A\u6642\u6CBF\u7528 .env \u7684 LLM_MODEL\uFF0FEMBEDDING_MODEL\u3002</p>
    </div>
  </div>`}function eg(e,t,s,a=!1){let n=e?.data||{},i=e?zt(e.status):null,o=s?zt(s.status):null,l={overview:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(i.label)}</span>`:"",resources:o?`<span class="badge ${o.tone==="ok"?"badge-ok":o.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(o.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${c(n.version_count)}</span>`,tests:'<span class="badge badge-neutral badge-mono">TEST</span>',"local-model":'<span class="badge badge-neutral badge-mono">LLAMA-SERVER</span>',runs:`<span class="badge badge-neutral badge-mono">${c(n.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${Dl.map(d=>{let p=d.id===t,g=a&&Il.has(d.id);return`<button class="status-tab${p?" is-active":""}${g?" is-demo-locked":""}" type="button"
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
      <span class="mono">${r(e?we(e.checked_at):"\u2014")}</span>
    </div>`}function tg(e,t,s,a,n,i,o,l=!1){if(e==="resources")return s?Wm(s):a?Rl():n?Km(n):Rl();if(e==="local-model"){let d=i||{},p=!!d.loading||!d.hosts&&!d.error;return Zm(d.hosts||null,p,d.error||null,d.editingId||null)}return e==="architecture"?Om(t,l):e==="api"?Hm(t):e==="data"?zm(t,o):e==="runs"?Gm(t):Fm(t)}function sg(){return`<div class="status-hero">
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
    </div>`}function Cl(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u5FEB\u53D6\u6216\u63A8\u6E2C\u7684\u670D\u52D9\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Be({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function ag(e,t){let s=Ut(),a=!1,n=null,i=null,o="overview",l=null,d=!1,p=null,g=null,$=!1,h=null,u=null,b=null,v=!1,k=null,x=!1,_=!1,y=null,I=0,pe="",V="",$e=performance.now(),he=new Date().toISOString(),ae=!1;e.innerHTML=`<section class="page status-page">
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
      <section class="status-panel" id="status-content">${sg()}</section>
    </div>
  </section>`;let q=e.querySelector("#status-nav"),A=e.querySelector("#status-content"),j=e.querySelector("#refresh-status"),K=e.querySelector("#auto-refresh"),ge=()=>{if(I+=1,typeof y=="function")try{y()}catch{}y=null,x=!1,_=!1},O=async()=>{let me=++I;_=!0,V="",A.innerHTML="";try{let ce=await ei(A,{setTitle:()=>{}},{embedded:!0});if(me!==I||o!=="tests"){typeof ce=="function"&&ce();return}y=typeof ce=="function"?ce:null,x=!0}catch(ce){me===I&&o==="tests"&&(A.innerHTML=Cl(ce))}finally{me===I&&(_=!1)}},oe=()=>{if(!i)return;let me=eg(i,o,l,s);if(me!==pe&&(q.innerHTML=me,pe=me),s&&Il.has(o)){ge();let se=Ls("\u6B64\u5206\u985E\u9700\u8981\u7BA1\u7406\u8005\u6B0A\u9650","\u5C55\u793A\u6A21\u5F0F\u53EF\u700F\u89BD\u670D\u52D9\u7E3D\u89BD\u3001\u524D\u5F8C\u7AEF\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u4E0B\u8F09\uFF1B\u7CFB\u7D71\u6E2C\u8A66\u3001\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528\u3001Model Provider \u8207 OpenAPI \u7531\u7BA1\u7406\u8005\u64CD\u4F5C\u3002");A.innerHTML!==se&&(A.innerHTML=se),V=se;return}if(o==="tests"){!x&&!_&&O();return}ge();let ce=tg(o,i,l,d,p,{hosts:g,loading:$,error:h,editingId:u},{info:b,loading:v,error:k},s);ce!==V&&(A.innerHTML=ce,V=ce)},je=async({quiet:me=!1}={})=>{if(!d){d=!0,p=null,o==="resources"&&!l&&oe();try{let ce=await Q.systemUsage();if(a)return;l=ce}catch(ce){if(a)return;p=ce,me||N(ce.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{a||(d=!1,o==="resources"&&oe())}}},C=async({quiet:me=!1}={})=>{if(!v){v=!0,k=null,o==="data"&&!b&&oe();try{let ce=await Yi();if(a)return;b=ce}catch(ce){if(a)return;k=ce,me||N(ce.message||"\u7121\u6CD5\u8B80\u53D6 IndexedDB\u3002","danger")}finally{a||(v=!1,o==="data"&&oe())}}},ye=async({quiet:me=!1}={})=>{if(!$){$=!0,h=null,o==="local-model"&&!g&&oe();try{let ce=await Q.ollamaHosts();if(a)return;g=ce}catch(ce){if(a)return;h=ce,me||N(ce.message||"\u7121\u6CD5\u53D6\u5F97 llama-server \u4E3B\u6A5F\u3002","danger")}finally{a||($=!1,o==="local-model"&&oe())}}},te=async()=>{await ye({quiet:!0}),await Se({quiet:!0})},Se=async({quiet:me=!1,status:ce=null}={})=>{me||(j.disabled=!0,Ne(j,!0,"\u6AA2\u67E5\u4E2D\u2026"));let se=performance.now(),Te=new Date().toISOString(),xe=se,Re=Te;try{let Ce=ce||await Q.status();if(xe=performance.now(),Re=new Date().toISOString(),a)return;let P=!ce&&!ae?Math.max(0,se-$e):0;Ce.page_pipeline=Ce.pipeline||!i?.page_pipeline?Dm(Ce,{initMs:P,initStartedAt:he,requestStartedAt:Te,requestFinishedAt:Re,requestMs:xe-se}):i.page_pipeline,ae=!0,i=Ce,oe(),me||N("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(Ce){if(a)return;o!=="tests"&&(V="",A.innerHTML=Cl(Ce)),me||N(Ce.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{a||(j.disabled=!1,Ne(j,!1))}},qe=async({quiet:me=!1,status:ce=null}={})=>{if(await Se({quiet:me,status:ce}),!s&&(o==="resources"&&await je({quiet:me}),o==="local-model"&&await ye({quiet:me}),!me&&o==="tests")){let se=A.querySelector("#tests-refresh");se&&se.click()}};q.addEventListener("click",me=>{let ce=me.target.closest("[data-status-tab]");if(!ce)return;let se=ce.dataset.statusTab;Dl.some(Te=>Te.id===se)&&(o=se,oe(),!s&&(o==="resources"&&!l&&!d&&je(),o==="data"&&!b&&!v&&C(),o==="local-model"&&ye()))}),A.addEventListener("click",me=>{me.target.closest("#status-retry")&&Se(),me.target.closest("#status-resources-retry")&&je()}),A.addEventListener("click",async me=>{let ce=me.target.closest("[data-ollama-action]");if(!ce)return;let se=ce.dataset.ollamaAction,Te=Number(ce.dataset.id||0);if(se==="refresh-hosts"){await ye();return}if(se==="edit-host"){u=Te,oe(),e.querySelector(".ollama-host-form")?.scrollIntoView({behavior:"smooth",block:"center"});return}if(se==="cancel-host-edit"){u=null,oe();return}if(se==="delete-host"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 llama-server \u4E3B\u6A5F #${Te}\uFF1F`))return;try{await Q.deleteOllamaHost(Te),Number(u)===Te&&(u=null),N("llama-server \u4E3B\u6A5F\u5DF2\u522A\u9664\u3002","info"),await te()}catch(xe){N(xe.message||"\u522A\u9664\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(se==="activate-host"){try{await Q.activateOllamaHost(Te),N("\u5DF2\u5207\u63DB\u4F7F\u7528\u7684 llama-server \u4E3B\u6A5F\u3002","ok"),await te()}catch(xe){N(xe.message||"\u5207\u63DB\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(se==="deactivate-host"){try{await Q.deactivateOllamaHosts(),N("\u5DF2\u505C\u7528\u6307\u5B9A\u7684 llama-server \u4E3B\u6A5F\uFF0C\u5C07\u6CBF\u7528 .env \u8A2D\u5B9A\u3002","info"),await te()}catch(xe){N(xe.message||"\u505C\u7528\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(se==="check-capabilities"){Ne(ce,!0,"\u6AA2\u67E5\u4E2D\u2026");try{await Q.checkOllamaCapabilities(),N("\u5DF2\u66F4\u65B0\u6240\u6709\u4E3B\u6A5F\u7684\u6A21\u578B\u80FD\u529B\u3002","ok",4e3),await te()}catch(xe){N(xe.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u80FD\u529B\u3002","danger",7e3)}finally{Ne(ce,!1)}return}if(se==="select-model"||se==="clear-model"){let xe=String(ce.dataset.model||""),Re=String(ce.dataset.role||"");try{se==="select-model"?(await Q.selectOllamaModel(Te,{model:xe,role:Re}),N(`\u5DF2\u8A2D\u5B9A ${Re==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\uFF1A${xe}`,"ok")):(await Q.clearOllamaModel(Te,{model:xe,role:Re}),N(`\u5DF2\u53D6\u6D88 ${Re==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\u3002`,"info")),await te()}catch(Ce){N(Ce.message||"\u6A21\u578B\u8A2D\u5B9A\u5931\u6557\u3002","danger")}}}),A.addEventListener("submit",async me=>{let ce=me.target.closest("form[data-ollama-form='host']");if(!ce)return;me.preventDefault();let se=new FormData(ce),Te=Number(se.get("host_id")||0),xe={name:String(se.get("name")||"").trim(),url:String(se.get("url")||"").trim(),port:Number(se.get("port")||11434)};try{Te?(await Q.updateOllamaHost(Te,xe),N("llama-server \u4E3B\u6A5F\u5DF2\u66F4\u65B0\u3002","ok")):(await Q.addOllamaHost(xe),N("llama-server \u4E3B\u6A5F\u5DF2\u65B0\u589E\u3002","ok")),u=null,await te()}catch(Re){let Ce=Re.detail||Re.payload?.detail,P=Ce?.errors?.join(" \xB7 ")||Ce?.message||Re.message||"\u5132\u5B58\u4E3B\u6A5F\u5931\u6557\u3002";N(P,"danger",8e3)}}),A.addEventListener("toggle",me=>{let ce=me.target.closest?.(".status-wf-stage[data-status-wf-stage]");if(!ce||!A.contains(ce))return;let se=ce.dataset.statusWfStage||"";se&&(ce.open?ti.add(se):ti.delete(se))},!0),j.addEventListener("click",()=>qe());let ve=()=>{n&&(n(),n=null)};return K&&K.addEventListener("change",()=>{ve(),K.checked&&(n=_t("status",(me,ce)=>{a||qe({quiet:!0,status:ce?.snapshot||null})}),qe({quiet:!0}),N("\u5DF2\u555F\u7528\u5F8C\u7AEF\u63A8\u9001\u81EA\u52D5\u66F4\u65B0\uFF08\u6BCF 30 \u79D2\uFF09\u3002","info",2200))}),await Se({quiet:!0}),C({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{a=!0,ge(),ve()}}var Ol="home",Ln={home:{page:hr,title:"Judgment RAG Console \xB7 \u6CD5\u898F\u8207\u5224\u6C7A\u6AA2\u7D22"},rag:{page:Ir,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:qr,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:Zr,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:Rr,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:Vr,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:si,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:xn,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"},admin:{page:lr,title:"\u7BA1\u7406\u8A2D\u5B9A \xB7 Judgment RAG Console"}},Is=document.getElementById("app-main"),Mn=null,qn=0;function jn(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||Ol;return Object.prototype.hasOwnProperty.call(Ln,t)?t:Ol}function ng(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function rg(e){return`<section class="page">
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
  </section>`}async function Ds(){let e=jn(),t=++qn;if(ng(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof Mn=="function"){try{Mn()}catch{}Mn=null}if(qs(),!Vs()){if(e==="admin"){document.title="\u7BA1\u7406\u8A2D\u5B9A \xB7 Judgment RAG Console",Is.innerHTML=Ya();return}if(e==="tests"){document.title="\u5C55\u793A\u6A21\u5F0F \xB7 Judgment RAG Console",or(Is,e);return}if(!Fi()){document.title="\u5C55\u793A\u76EE\u524D\u672A\u958B\u653E \xB7 Judgment RAG Console",Oi(Is);return}if(!ir(e)){document.title="\u5C55\u793A\u6A21\u5F0F \xB7 Judgment RAG Console",or(Is,e);return}}document.title=Ln[e].title;let s={route:e,navigate(a){Ln[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===qn&&a&&(document.title=a)}};try{let a=Ln[e].page.render(Is,s);Ei(),window.scrollTo({top:0,behavior:"auto"}),Is.focus({preventScroll:!0});let n=await a;if(t!==qn){typeof n=="function"&&n();return}Mn=typeof n=="function"?n:null}catch(a){if(t!==qn)return;console.error("Failed to render route",e,a),Is.innerHTML=rg(a);let n=document.getElementById("route-retry");n&&n.addEventListener("click",()=>Ds()),N("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function ig(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable))return;let a=jn(),n=a==="home"?"home-question":a==="rag"?"rag-question":"";if(!n)return;let i=document.getElementById(n);i&&(e.preventDefault(),i.focus())})}function og(){let e=document.querySelector('[data-route="processing"]');if(!e)return;let t=e.querySelector(".nav-update-badge");t||(t=document.createElement("span"),t.className="nav-update-badge",t.hidden=!0,e.appendChild(t));let s=0,a=0,n=0,i=()=>{let l=[];if(s>0&&l.push(`\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0F\u5224\u6C7A\u6709 ${s} \u9805\u4F86\u6E90\u66F4\u65B0`),a>0&&l.push(`\u5224\u6C7A\u532F\u5165\u5F85\u8655\u7406 ${a} \u500B\u6708`),n>0&&l.push(`Qdrant \u5411\u91CF\u7D22\u5F15\u5F85\u88DC ${n} \u500B\u6708`),!l.length){t.hidden=!0;return}let d=(s>0?1:0)+(a>0?1:0)+(n>0?1:0);t.textContent=String(d===1?s||a||n:d),t.title=l.join("\uFF1B"),t.hidden=!1},o=async(l=null)=>{try{let d=l||await Q.updatesStatus();s=Number(d.update_count)||0,d&&Object.prototype.hasOwnProperty.call(d,"import_pending_count")&&(a=Number(d.import_pending_count)||0),d&&Object.prototype.hasOwnProperty.call(d,"index_pending_count")&&(n=Number(d.index_pending_count)||0),i()}catch{t.hidden=!0}};o(),_t("updates",(l,d)=>o(d?.snapshot||null)),window.addEventListener("judgment:processing-pending",l=>{a=Number(l.detail?.count)||0,l.detail&&Object.prototype.hasOwnProperty.call(l.detail,"index_pending")&&(n=Number(l.detail.index_pending)||0),i()}),window.addEventListener("judgment:updates-changed",()=>o())}function lg(e,t){return!e||!t?!0:!!e.admin!=!!t.admin||!!e.enabled!=!!t.enabled||String(e.expiresAt||"")!==String(t.expiresAt||"")||JSON.stringify(e.features||{})!==JSON.stringify(t.features||{})}async function Hl(){jn()==="processing"&&Q.processing({cached:!0,slim:!0}).catch(()=>null);let e=Di();e&&Bi(e);let t=Ka();Ja(),Ri(),ig();let s=!1,a=()=>{Vs()&&!s&&(og(),s=!0)};window.addEventListener("hashchange",Ds),window.addEventListener("judgment:auth-changed",async()=>{let i=await Ka();Ba(i.me),a(),qs(),Ds()}),window.addEventListener("judgment:demo-denied",async()=>{let i=await Ka();Ba(i.me),a(),qs(),Ds()}),e&&(Vn({user:e.me}),a(),qs(),Ds());let n=await t;e?(Ba(n.me),a(),qs(),lg(e,n)&&Ds()):(Vn({user:n.me}),a(),qs(),Ds()),Ca()&&window.setTimeout(()=>{let i=jn();(i==="rag"||i==="admin")&&(window.location.hash=Vs()?"#/tests":"#/home")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Hl):Hl();})();
