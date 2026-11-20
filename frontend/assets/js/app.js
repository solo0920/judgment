(()=>{var nl=Object.defineProperty;var rs=(e,t)=>{for(var s in t)nl(e,s,{get:t[s],enumerable:!0})};var rn="judgment.api_base",on="judgment.admin_token",cn="http://127.0.0.1:9200",bt=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function Er(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function Yt(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${Er(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function dn(e){let t=Yt(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function un(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?Yt(e.get("api")):null}catch{return null}}function pn(){try{let e=window.localStorage.getItem(rn);return e===null?null:Yt(e)}catch{return null}}function mn(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return Yt(e||"")}function Ft(){let e=un();if(e!==null)return e;let t=pn();if(t!==null)return t;let s=mn();return s||(window.location.protocol==="file:"?cn:"")}function rl(){if(un()!==null)return!0;let e=pn();return e!==null?!!e:!!mn()}function Et(){return un()!==null?"query":pn()!==null?"storage":mn()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function ga(){return rl()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!Er(window.location.hostname)}function gn(e){let t=Yt(e);try{t?window.localStorage.setItem(rn,t):window.localStorage.removeItem(rn)}catch{}return t}function fa(){try{return String(window.localStorage.getItem(on)||"").trim()}catch{return""}}function Rr(e){let t=String(e||"").trim();try{t?window.localStorage.setItem(on,t):window.localStorage.removeItem(on)}catch{}return t}function ln(){return Et()==="query"?"":fa()}function is(e=Ft()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function lt(e,t=Ft()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function Nr(){return Et()==="query"?"":Ft()}async function il(){let e=ln(),t={Accept:"application/json"};e&&(t["X-Judgment-Admin-Token"]=e);try{let s=await fetch(lt("/api/auth/sse-ticket"),{method:"POST",headers:t,credentials:"include"});if(!s.ok)return"";let a=await s.json();return String(a.ticket||"")}catch{return""}}function ht(e,t,{onError:s=null,onProgress:a=null}={}){let n=(Array.isArray(e)?e:[e]).map(b=>String(b||"").trim()).filter(Boolean);if(!n.length||typeof EventSource>"u")return()=>{};let i=null,o=0,l=!1,p=null,f=b=>{let u={};try{u=JSON.parse(b.data||"{}")}catch{u={}}u.initial&&o<=1&&!u.snapshot||t?.(u.topic||n[0],u)},m=b=>{let u={};try{u=JSON.parse(b.data||"{}")}catch{u={}}a?.(u.topic||n[0],u)},y=async()=>{if(l)return;let b=await il();if(l)return;let u=new URLSearchParams({topic:n.join(",")});b&&u.set("ticket",b),i=new EventSource(lt(`/api/events/stream?${u.toString()}`),{withCredentials:!0}),i.onopen=()=>{o+=1,p&&(window.clearTimeout(p),p=null)},i.addEventListener("refresh",f),i.addEventListener("progress",m),i.onerror=()=>{s?.(),!(l||!i)&&(i.close(),i=null,!p&&(p=window.setTimeout(()=>{p=null,y()},3e3)))}};return y(),()=>{l=!0,p&&(window.clearTimeout(p),p=null),i&&(i.removeEventListener("refresh",f),i.removeEventListener("progress",m),i.close(),i=null)}}function fn(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function le(e,t={}){let{base:s,...a}=t,n=s!==void 0?Yt(s):Ft(),i=new AbortController,o=t.timeout===void 0?3e4:t.timeout,l=o>0?window.setTimeout(()=>i.abort(),o):null,p=Date.now(),f=performance.now(),m=t.requestId||Cr(),y={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":m,"X-Judgment-Client-Started-At":String(p),...ln()?{"X-Judgment-Admin-Token":ln()}:{},...t.headers||{}},b;try{b=await fetch(lt(e,n),{...a,headers:y,credentials:"include",signal:i.signal})}catch(x){throw x.name==="AbortError"?new bt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new bt(fn(n),0,x)}finally{l&&window.clearTimeout(l)}let u=null;if((b.headers.get("content-type")||"").includes("application/json"))try{u=await b.json()}catch{u=null}else try{u=await b.text()}catch{u=null}let w=performance.now(),_=b.headers.get("X-Judgment-Request-Id")||m;if(t.trackClient!==!1&&_){let x=Math.round(performance.now()-f);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{Pr({request_id:_,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:x,render_ms:Math.max(0,Math.round(performance.now()-w)),status:b.ok?"success":"failed"})})})}if(!b.ok){let x=u&&typeof u=="object"?u.detail||u.message:u,S=typeof x=="string"&&x?x:`\u4F3A\u670D\u5668\u56DE\u61C9 ${b.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new bt(S,b.status,x)}return u}function Cr(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function Pr(e){try{fetch(lt("/api/performance/client",Ft()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),credentials:"include",keepalive:!0}).catch(()=>{})}catch{}}async function Ir(e){let t=Yt(e);if(!dn(t))throw new bt("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,n=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(lt("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new bt(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof bt?i:i.name==="AbortError"?new bt("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new bt(fn(t),0,i)}finally{window.clearTimeout(n)}}var V={health(){return le("/api/health")},authMe(){return le("/api/auth/me",{base:Nr(),trackClient:!1})},authLogout(){return le("/api/auth/logout",{method:"POST",base:Nr(),trackClient:!1})},status(){return le("/api/status",{trackClient:!1})},ollamaHosts(){return le("/api/llama-server/hosts",{timeout:3e4,trackClient:!1})},addOllamaHost(e){return le("/api/llama-server/hosts",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},updateOllamaHost(e,t){return le(`/api/llama-server/hosts/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},deleteOllamaHost(e){return le(`/api/llama-server/hosts/${encodeURIComponent(e)}`,{method:"DELETE",timeout:3e4,trackClient:!1})},activateOllamaHost(e){return le(`/api/llama-server/hosts/${encodeURIComponent(e)}/activate`,{method:"POST",timeout:3e4,trackClient:!1})},deactivateOllamaHosts(){return le("/api/llama-server/hosts/deactivate",{method:"POST",timeout:3e4,trackClient:!1})},reorderOllamaHosts(e){return le("/api/llama-server/hosts/reorder",{method:"POST",body:JSON.stringify({host_ids:e}),timeout:3e4,trackClient:!1})},checkOllamaCapabilities(){return le("/api/llama-server/hosts/capabilities/test",{method:"POST",timeout:18e4,trackClient:!1})},selectOllamaModel(e,t){return le(`/api/llama-server/hosts/${encodeURIComponent(e)}/models/select`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},clearOllamaModel(e,t){return le(`/api/llama-server/hosts/${encodeURIComponent(e)}/models/clear`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},systemUsage(){return le("/api/system-usage",{trackClient:!1})},indexVersions(){return le("/api/index-versions",{trackClient:!1})},indexVersion(e){return le(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return le(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return le(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return le("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){let t=new URLSearchParams({repair:e?"true":"false"});return le(`/api/index-alias/reconcile?${t.toString()}`,{trackClient:!1})},catalog(){return le("/api/catalog")},homeSummary(){return le("/api/home")},judgmentStats(){return le("/api/judgment-stats")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return le("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},dataSuggest({kind:e,query:t="",limit:s=12}){let a=new URLSearchParams({kind:e,query:t,limit:String(s)});return le(`/api/data/suggest?${a.toString()}`,{timeout:45e3,trackClient:!1})},schemaSuggest({database:e,table:t,column:s,query:a,limit:n=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(n)});return le(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let n=new URLSearchParams({law_key:e});return t&&n.set("source_type",t),s&&n.set("version_id",String(s)),a&&n.set("article_no",String(a)),le(`/api/law?${n.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),le(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return le("/api/test-mode",{trackClient:!1})},llmModels(){return le("/api/llm/models",{timeout:6e4,trackClient:!1})},testLlmModels(){return le("/api/llm/models/test",{method:"POST",timeout:12e4,trackClient:!1})},rerankStatus(){return le("/api/rerank/status",{timeout:6e4,trackClient:!1})},testReranker(){return le("/api/rerank/test",{method:"POST",timeout:12e4,trackClient:!1})},selectLlmModel(e,t=null){return le("/api/llm/model",{method:"POST",body:JSON.stringify({model:e,host_id:t}),timeout:3e4,trackClient:!1})},setTestMode(e){return le("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return le(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return le("/api/test-runs/current",{trackClient:!1})},testRun(e){return le(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return le("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))i==null||i===""||a.set(n,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),le(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return le("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return le("/api/processing",{timeout:45e3,trackClient:!1})},processingActive(){return le("/api/processing/active",{timeout:3e3,trackClient:!1})},judgmentDownloadStatus(){return le("/api/judgment-download/status",{timeout:3e4,trackClient:!1})},versioningSummary(){return le("/api/versioning/summary",{trackClient:!1})},updatesStatus(){return le("/api/updates/status",{trackClient:!1})},checkCourts(){return le("/api/courts/check",{timeout:6e4,trackClient:!1})},checkLawVersions(){return le("/api/law-versions/check",{timeout:6e4,trackClient:!1})},checkUpdates(e=[]){let t=Array.isArray(e)&&e.length?{source_types:e}:{};return le("/api/updates/check",{method:"POST",body:JSON.stringify(t),timeout:12e4,trackClient:!1})},versioningSnapshots(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.limit&&t.set("limit",String(e.limit)),le(`/api/versioning/judgments/snapshots?${t.toString()}`,{trackClient:!1})},versioningChanges(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit)),le(`/api/versioning/judgments/changes?${t.toString()}`,{trackClient:!1})},versioningJudgment(e){return le(`/api/versioning/judgments/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVersion(e){return le(`/api/versioning/judgments/versions/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVector(e,t){return le(`/api/versioning/judgments/${encodeURIComponent(e)}/vectors/${encodeURIComponent(t)}`,{trackClient:!1})},versioningAudit(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit||500)),le(`/api/versioning/audit?${t.toString()}`,{trackClient:!1})},questionBankStats(){return le("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))if(!(i==null||i==="")){if(Array.isArray(i)){for(let o of i)o==null||o===""||a.append(n,String(o));continue}a.set(n,String(i))}return a.set("limit",String(t)),a.set("offset",String(s)),le(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankTags(e="",t=12){let s=new URLSearchParams({query:e,limit:String(t)});return le(`/api/question-bank/tags?${s.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return le(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return le("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},createQuestionBankItemWithAI(e){return le("/api/question-bank/ai-items",{method:"POST",body:JSON.stringify(e),timeout:42e4,trackClient:!1})},updateQuestionBankItem(e,t){return le(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return le(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},restoreQuestionBankItem(e){return le(`/api/question-bank/items/${encodeURIComponent(e)}/restore`,{method:"POST",timeout:45e3,trackClient:!1})},submitQuestionBankItemForReview(e){return le(`/api/question-bank/items/${encodeURIComponent(e)}/submit`,{method:"POST",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return le(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return le("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return le(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return le("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return le(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return le("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},benchmarkSuiteLatestAnswers(e){return le(`/api/benchmark/suites/${encodeURIComponent(e)}/latest-answers`,{timeout:45e3,trackClient:!1})},removeBenchmarkSuiteItem(e,t){return le(`/api/benchmark/suites/${encodeURIComponent(e)}/items/${encodeURIComponent(t)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return le("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return le(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return le(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return le(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return le("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return le(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return le(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return le(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return le("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return le(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return le("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return le(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return le("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return le("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return le("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onQueued:n=null,onToken:i=null,onTokenReset:o=null}={}){let l=Ft(),p=new AbortController,f=t?0:3e5,m=f>0?window.setTimeout(()=>p.abort(),f):null,y=Date.now(),b=performance.now(),u=Cr(),v={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":u,"X-Judgment-Client-Started-At":String(y)},w;try{w=await fetch(lt("/api/rag/query/stream",l),{method:"POST",headers:v,body:JSON.stringify({question:e}),credentials:"include",signal:p.signal})}catch(O){throw O.name==="AbortError"?new bt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new bt(fn(l),0,O)}finally{m&&window.clearTimeout(m)}if(!w.ok){let O=null;try{O=await w.json()}catch{O=null}let be=O&&typeof O=="object"&&O.detail?String(O.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${w.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new bt(be,w.status,O)}if(!w.body)throw new bt("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let _=w.body.getReader(),x=new TextDecoder,S="",k=null,D=null;try{for(;;){let{value:O,done:be}=await _.read();if(be)break;S+=x.decode(O,{stream:!0});let fe=S.indexOf(`

`);for(;fe>=0;){let W=S.slice(0,fe).replace(/\r/g,"");S=S.slice(fe+2);let L="message",q=[];for(let E of W.split(`
`))E.startsWith("event:")?L=E.slice(6).trim():E.startsWith("data:")&&q.push(E.slice(5).trimStart());if(q.length){let E=null;try{E=JSON.parse(q.join(`
`))}catch{E=null}if(E)if(L==="step"&&typeof s=="function")try{s(E)}catch{}else if(L==="partial"){if(typeof a=="function")try{a(E)}catch{}}else if(L==="queued"){if(typeof n=="function")try{n(E)}catch{}}else if(L==="token"){if(typeof i=="function")try{i(String(E.text||""))}catch{}}else if(L==="token_reset"){if(typeof o=="function")try{o()}catch{}}else L==="result"?k=E:L==="error"&&(D=new bt(E.message||E.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,E))}fe=S.indexOf(`

`)}}}finally{try{await _.cancel()}catch{}m&&window.clearTimeout(m)}if(D)throw D;if(!k)throw new bt("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let oe=Math.round(performance.now()-b);return Pr({request_id:u,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:oe,render_ms:0,status:"success"}),k&&typeof k=="object"&&(k._client_request_id=u),k}};var ol={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},ll={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},cl={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},dl={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Dr={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',palette:'<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10h-4Z"/><circle cx="7.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/><circle cx="10" cy="6.8" r=".8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="6.8" r=".8" fill="currentColor" stroke="none"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',more:'<circle cx="4.2" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="19.8" cy="12" r="2.6" fill="currentColor" stroke="none"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function r(e){return String(e??"").replace(/[&<>"']/g,t=>ol[t])}function g(e,t=16,s=""){let a=Dr[e]||Dr.info;return`<svg${s?` class="${r(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function d(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function qe(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function bn(e){if(e instanceof Date)return e;if(typeof e=="number"){let n=new Date(e);return Number.isNaN(n.getTime())?null:n}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function Rt(e){let t=bn(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?r(e):"\u2014"}function ye(e){let t=bn(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?r(e):"\u2014"}function Hs(e){let t=bn(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:Rt(t)}function ue(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Ct(e){return ll[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Je(e,t){let s=Ct(e);return`<span class="badge ${cl[s.tone]}"><span class="status-dot ${dl[s.tone]}"></span>${r(t||s.label)}</span>`}function ul(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${r(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function ba(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function ha(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return Je(String(e));case"source":return ul(String(e));case"number":return`<span class="mono">${d(e)}</span>`;case"duration":return`<span class="mono">${ue(e)}</span>`;case"datetime":return`<span class="mono">${ye(e)}</span>`;case"date":return`<span class="mono">${Rt(e)}</span>`;case"url":{let s=String(e),a=ba(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${r(s)}" target="_blank" rel="noopener noreferrer" title="${r(s)}">${g("external",10)}${r(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${r(s)}">${r(ba(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(ba(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(ba(s,90))}</span>`}}}function Ce({tone:e="info",title:t,text:s,iconName:a="info"}){let n=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
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
  </div>`}function Me(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${r(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function I(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let n={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${n[t]||"i"}</span>
    <div class="toast-body">${r(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function xs(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function Pt(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),n=URL.createObjectURL(a),i=document.createElement("a");i.href=n,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(n),1e3)}var pl=`
  <svg class="auth-google-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z"/>
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.58A10 10 0 0 0 12 22Z"/>
    <path fill="#FBBC05" d="M6.41 13.92A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.92V7.5H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.5l3.35-2.58Z"/>
    <path fill="#EA4335" d="M12 6.04c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.5l3.35 2.58C7.2 7.8 9.4 6.04 12 6.04Z"/>
  </svg>`,ml={google_not_configured:"Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A GOOGLE_CLIENT_ID \u8207 GOOGLE_CLIENT_SECRET\u3002",state_mismatch:"\u767B\u5165\u6D41\u7A0B\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u767B\u5165\u3002",access_denied:"\u4F60\u53D6\u6D88\u4E86 Google \u767B\u5165\u3002",email_unverified:"\u9019\u500B Google \u5E33\u865F\u7684\u96FB\u5B50\u90F5\u4EF6\u5C1A\u672A\u9A57\u8B49\u3002",not_allowed:"\u9019\u500B Google \u5E33\u865F\u6C92\u6709\u7BA1\u7406\u54E1\u6B0A\u9650\u3002",oauth_failed:"Google \u767B\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"},Ot=null;function gl(){return Et()==="query"?"":Ft()}function fl(){let e=gl(),t=`${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;return lt(`/api/auth/google/start?next=${encodeURIComponent(t)}`,e)}function Or(e){let t=String(e?.name||"").trim();if(t)return t;let s=String(e?.email||"").trim();return s?s.split("@")[0]:"\u5DF2\u767B\u5165"}function bl(e){return Or(e).slice(0,1).toUpperCase()||"A"}function Br(){let e=Ot?.querySelector("#auth-menu"),t=Ot?.querySelector("#auth-user-trigger");e&&(e.hidden=!0),t&&t.setAttribute("aria-expanded","false")}function Fr(e={}){let t=!!e.google_enabled;Ot.innerHTML=`
    <a class="auth-login${t?"":" is-disabled"}"
       id="auth-login"
       href="${r(fl())}"
       aria-label="\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165"
       title="${t?"\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165":"Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A"}"
       ${t?"":'aria-disabled="true"'}>
      ${pl}
      <span>\u767B\u5165</span>
    </a>`,t||Ot.querySelector("#auth-login")?.addEventListener("click",a=>{a.preventDefault(),I("Google \u767B\u5165\u5C1A\u672A\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u8A2D\u5B9A GOOGLE_CLIENT_ID \u8207 GOOGLE_CLIENT_SECRET\u3002","warn",5200)})}function hl(e){let t=Or(e),s=String(e?.email||""),a=e?.admin?"\u7BA1\u7406\u54E1":"\u5DF2\u767B\u5165";Ot.innerHTML=`
    <div class="auth-user">
      <button type="button"
              class="auth-user-trigger"
              id="auth-user-trigger"
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="\u5DF2\u767B\u5165\uFF1A${r(s||t)}\uFF0C\u958B\u555F\u5E33\u865F\u9078\u55AE"
              title="${r(s||t)}">
        <span class="auth-avatar" aria-hidden="true">${r(bl(e))}</span>
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
    </div>`;let n=Ot.querySelector("#auth-user-trigger"),i=Ot.querySelector("#auth-menu");n?.addEventListener("click",o=>{o.stopPropagation();let l=!!i?.hidden;i&&(i.hidden=!l),n.setAttribute("aria-expanded",l?"true":"false")}),Ot.querySelector("#auth-logout")?.addEventListener("click",async o=>{let l=o.currentTarget;l.disabled=!0,l.textContent="\u767B\u51FA\u4E2D\u2026";try{await V.authLogout(),I("\u5DF2\u767B\u51FA\u3002","ok",2400),await Hr()}catch(p){l.disabled=!1,l.textContent="\u767B\u51FA",I(p.message||"\u767B\u51FA\u5931\u6557\u3002","danger",5200)}})}async function Hr(){if(Ot)try{let e=await V.authMe();e?.authenticated?hl(e):Fr(e)}catch{Fr({google_enabled:!1})}}function vl(){let e;try{e=new URL(window.location.href)}catch{return}let t=e.searchParams.get("auth"),s=e.searchParams.get("auth_error");!t&&!s||(e.searchParams.delete("auth"),e.searchParams.delete("auth_error"),window.history.replaceState(null,"",`${e.pathname}${e.search}${e.hash}`),t==="ok"?I("\u5DF2\u4F7F\u7528 Google \u5E33\u865F\u767B\u5165\u3002","ok",3600):s&&I(ml[s]||"Google \u767B\u5165\u5931\u6557\u3002","danger",6e3))}function zr(){Ot=document.getElementById("auth-slot"),Ot&&(vl(),document.addEventListener("click",e=>{e.target.closest(".auth-user")||Br()}),document.addEventListener("keydown",e=>{e.key==="Escape"&&Br()}),Hr())}var Gr="judgment.theme",hn="nvidia",va=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#0070f3","#171717","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#0066cc","#1d1d1f","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#17171d","#5e6ad2","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#0d99ff","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#0075de","#191918","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],vn=new Map(va.map(e=>[e.id,e]));function $l(e){return vn.has(e)}function yl(e){return vn.get(e)||vn.get(hn)}function $n(){try{let e=window.localStorage.getItem(Gr);return $l(e)?e:hn}catch{return hn}}function yn(e,{persist:t=!0}={}){let s=yl(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");if(a&&a.setAttribute("content",s.metaColor),document.querySelectorAll(".theme-option").forEach(n=>{let i=n.dataset.themeId===s.id;n.classList.toggle("is-active",i),n.setAttribute("aria-checked",i?"true":"false")}),t)try{window.localStorage.setItem(Gr,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}var $a="judgment.fontSizes.v1",xn="judgment.appearance",Kr=new Set(["light","dark","system"]),Ur="light",zs=window.matchMedia("(prefers-color-scheme: dark)"),wl="font-size",Us=[{id:"page-title",label:"\u9801\u9762\u6A19\u984C",hint:"\u5404\u9801\u6700\u4E0A\u65B9\u7684 h1 \u6A19\u984C",selectors:[".page-title"],defaultPx:40,min:20,max:72},{id:"home-title",label:"\u9996\u9801\u4E3B\u8996\u89BA\u6A19\u984C",hint:"\u9996\u9801\u6700\u5927\u7684\u4E3B\u6A19\u984C",selectors:[".home-title"],defaultPx:88,min:40,max:140},{id:"section-title",label:"\u5340\u584A\u6A19\u984C",hint:"\u5831\u8868\u3001\u5361\u7247\u8207\u5340\u584A\u6A19\u984C",selectors:[".section-title",".report-title",".side-card-title",".filter-title",".tests-card-title",".status-sidebar-title",".judgment-dialog-head h2"],defaultPx:16,min:10,max:36},{id:"body",label:"\u5167\u6587\u8207\u8AAA\u660E",hint:"\u6BB5\u843D\u3001\u56DE\u7B54\u3001\u8AAA\u660E\u8207\u6458\u8981\u6587\u5B57",selectors:[".answer-text",".page-subtitle",".report-sub",".home-lead",".empty-text",".notice-body p",".citation-snippet",".side-card-body",".detail-list",".field-help",".report-empty-inline",".processing-section-sub",".summary-value-text",".status-summary",".warnings",".law-dialog-warning"],defaultPx:14,min:8,max:28},{id:"table",label:"\u8868\u683C\u5167\u5BB9",hint:"\u8CC7\u6599\u8868\u683C\u7684\u8868\u982D\u8207\u5132\u5B58\u683C",selectors:[".data-table th",".data-table td"],defaultPx:12,min:8,max:24},{id:"meta",label:"\u6A19\u7C64\u8207\u8F14\u52A9\u6587\u5B57",hint:"badge\u3001chip\u3001\u6B04\u4F4D\u6A19\u7C64\u8207 metadata",selectors:[".badge",".chip",".citation-meta",".citation-index",".answer-section-label",".report-kicker",".report-section-title",".eyebrow",".field-label",".summary-label",".metric-label",".footer-bottom",".nav-update-badge"],defaultPx:10,min:7,max:20},{id:"button",label:"\u6309\u9215\u8207\u5C0E\u89BD",hint:"\u64CD\u4F5C\u6309\u9215\u3001\u9801\u9996\u5C0E\u89BD\u8207\u9023\u7D50",selectors:[".btn",".nav-link",".page-btn",".law-link",".judgment-link",".theme-option-name",".theme-option-desc"],defaultPx:13,min:9,max:24},{id:"form",label:"\u8868\u55AE\u8207\u8F38\u5165",hint:"\u8F38\u5165\u6846\u3001\u4E0B\u62C9\u9078\u55AE\u8207 textarea",selectors:["input","textarea","select",".input",".field-input"],defaultPx:14,min:9,max:28},{id:"mono",label:"\u7A0B\u5F0F\u78BC\u8207\u6578\u503C",hint:"\u7B49\u5BEC\u6587\u5B57\u3001\u67E5\u8A62\u8A9E\u53E5\u8207\u7D71\u8A08\u6578\u503C",selectors:[".mono",".cell-mono",".cell-number",".query-code","code",".metric-value",".summary-value",".perf-stat-value",".mini-stat-value"],defaultPx:13,min:8,max:30},{id:"law-page",label:"\u6CD5\u898F\u689D\u6587\uFF08\u9801\u9762\uFF09",hint:"\u6CD5\u898F\u6AA2\u7D22\u7D50\u679C\u8207\u6CD5\u898F\u4F86\u6E90\u5361\u689D\u6587",selectors:[".law-answer-article-text",".law-answer-article-no",".law-source-article-text",".law-source-article-no",".law-article-text",".law-article-no"],excludeAncestors:[".law-dialog"],defaultPx:12,min:9,max:28},{id:"law-dialog",label:"\u6CD5\u898F\u689D\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u6309\u4E0B\u689D\u6587\u5F8C\u958B\u555F\u7684\u6CD5\u898F dialog",selectors:[".law-dialog .law-article-text",".law-dialog .law-article-no",".law-dialog .law-chapter"],defaultPx:16,min:10,max:32},{id:"judgment-dialog",label:"\u5224\u6C7A\u5168\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u5224\u6C7A\u539F\u6587 dialog \u7684\u5168\u6587\u5340\u584A",selectors:[".judgment-dialog-text"],defaultPx:23,min:12,max:48}],Ms=new Map(Us.map(e=>[e.id,e])),Gs=new WeakMap,Xt=ei(),kt={...Xt},Zt=Xr(),wn=new Set,qs=null,As=null,vt=null,bs=null,Qr=null,os=wl,ls=!1,_n=null,kn=!1,ya="";function Yr(e,t,s){return Math.min(s,Math.max(t,e))}function An(e){return Math.round(e*10)/10}function _a(e){return Number.isInteger(e)?String(e):e.toFixed(1)}function Xr(){try{let e=window.localStorage.getItem(xn);return Kr.has(e)?e:Ur}catch{return Ur}}function _l(){return Zt==="system"?zs.matches?"dark":"light":Zt}function Zr(){document.querySelectorAll("[data-appearance-option]").forEach(e=>{let t=e.dataset.appearanceOption===Zt;e.classList.toggle("is-active",t),e.setAttribute("aria-pressed",t?"true":"false")})}function wa({persist:e=!1}={}){if(document.documentElement.dataset.appearance=_l(),document.documentElement.dataset.appearanceMode=Zt,Zr(),e)try{window.localStorage.setItem(xn,Zt)}catch{}}function kl(e){Kr.has(e)&&(Zt=e,wa({persist:!0}))}function Jr(){Zt==="system"&&wa()}typeof zs.addEventListener=="function"?zs.addEventListener("change",Jr):typeof zs.addListener=="function"&&zs.addListener(Jr);function ei(){let e=null;try{e=JSON.parse(window.localStorage.getItem($a)||"null")}catch{e=null}if(!e||typeof e!="object"||Array.isArray(e))return{};let t={};for(let s of Us){let a=Number(e[s.id]);Number.isFinite(a)&&(t[s.id]=An(Yr(a,s.min,s.max)))}return t}function Sl(){try{return Object.keys(Xt).length?window.localStorage.setItem($a,JSON.stringify(Xt)):window.localStorage.removeItem($a),!0}catch{return!1}}function Js(e){let t=new Set;for(let s of e.selectors)document.querySelectorAll(s).forEach(a=>{a.closest(".settings-sidebar")||Array.isArray(e.excludeAncestors)&&e.excludeAncestors.some(n=>a.closest(n))||t.add(a)});return Array.from(t)}function ti(){if(!ya)return;let e=Ms.get(ya);if(e)for(let t of Js(e))t.classList.add("font-size-highlight")}function si(e){if(Ls(),!Ms.get(e))return;ya=e;let s=vt.querySelector(`.font-size-row[data-font-group="${e}"]`);s&&s.classList.add("is-previewing"),ti()}function Ls(){ya="",vt.querySelectorAll(".font-size-row.is-previewing").forEach(e=>e.classList.remove("is-previewing")),document.querySelectorAll(".font-size-highlight").forEach(e=>e.classList.remove("font-size-highlight"))}function xl(e){if(Gs.has(e))return Gs.get(e);let t={inline:e.style.fontSize||"",computed:parseFloat(window.getComputedStyle(e).fontSize)||0};return Gs.set(e,t),t}function Al(e){let t=Gs.get(e);t&&(t.inline?e.style.fontSize=t.inline:e.style.removeProperty("font-size"))}function ql(e){let t=kt[e.id];if(Number.isFinite(t))for(let s of Js(e))xl(s),s.style.fontSize=`${t}px`}function Ml(e){for(let t of Js(e))Al(t)}function cs(){for(let e of wn){let t=Ms.get(e);t&&Ml(t)}wn=new Set;for(let e of Us)Number.isFinite(kt[e.id])&&(ql(e),wn.add(e.id));ti()}function ai(){cs(),ls&&os==="font-size"&&Qs()}function ni(){kn||(kn=!0,window.requestAnimationFrame(()=>{kn=!1,cs()}))}function Ll(){_n||!document.body||(_n=new MutationObserver(e=>{if(Object.keys(kt).length){for(let t of e)if(t.type==="childList"&&(t.addedNodes.length||t.removedNodes.length)){ni();return}}}),_n.observe(document.body,{childList:!0,subtree:!0}))}function jl(e){let t=e.filter(s=>typeof s.getClientRects=="function"&&s.getClientRects().length);return t.length?t:e}function Tl(){let e=Us.filter(t=>Js(t).length>0||Number.isFinite(kt[t.id]));return e.length?e:Us}function ka(e){let t=kt[e.id];if(Number.isFinite(t))return t;let a=jl(Js(e)).map(o=>{let l=Gs.get(o);return l&&l.computed?l.computed:parseFloat(window.getComputedStyle(o).fontSize)||0}).filter(o=>o>0).sort((o,l)=>o-l);if(!a.length)return e.defaultPx;let n=Math.floor(a.length/2),i=a.length%2?a[n]:(a[n-1]+a[n])/2;return An(i)}function Nl(){let e=[{id:"font-size",label:"\u5B57\u578B\u5927\u5C0F",hint:"\u8ABF\u6574\u5404\u6587\u5B57\u5340\u584A",glyph:'<span class="settings-option-aa" aria-hidden="true">Aa</span>'},{id:"theme",label:"\u4ECB\u9762\u98A8\u683C",hint:"\u5207\u63DB\u54C1\u724C\u8996\u89BA\u8A9E\u8A00",glyph:g("palette",15)}];bs.innerHTML=e.map(t=>`<button class="settings-option${os===t.id?" is-active":""}" type="button" role="tab"
        data-settings-panel="${t.id}"
        aria-selected="${os===t.id?"true":"false"}">
        <span class="settings-option-icon">${t.glyph}</span>
        <span class="settings-option-copy">
          <strong>${r(t.label)}</strong>
          <small>${r(t.hint)}</small>
        </span>
        ${g("chevronRight",12,"settings-option-chevron")}
      </button>`).join("")}function Qs(){Ls();let e=Tl(),t=e.map(s=>{let a=_a(ka(s));return`<section class="font-size-row" data-font-group="${s.id}">
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
    </section>`}).join("");vt.innerHTML=`<div class="settings-panel-head">
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
    </div>`}function El(){Ls();let e=$n(),t=va.map((n,i)=>{let o=n.swatches.map(l=>`<i style="--swatch:${r(l)}"></i>`).join("");return`<button class="theme-option${n.id===e?" is-active":""}" type="button" role="menuitemradio"
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
          aria-pressed="${Zt===n.id?"true":"false"}"
          title="${n.id==="system"?"\u8DDF\u96A8\u7CFB\u7D71\u660E\u6697":`${n.label}\u8272\u6A21\u5F0F`}">${n.label}</button>`).join("")}
  </div>`;vt.innerHTML=`<div class="settings-panel-head">
      <div>
        <h3>\u4ECB\u9762\u98A8\u683C</h3>
        <p>\u9078\u64C7\u4E3B\u63A7\u53F0\u7684\u54C1\u724C\u8996\u89BA\u8A9E\u8A00\uFF1B\u4E3B\u984C\u6703\u7ACB\u5373\u5957\u7528\u4E26\u4FDD\u7559\u3002</p>
      </div>
      <div class="settings-panel-head-actions">
        <span class="badge badge-info">${va.length} \u7A2E</span>
        ${a}
      </div>
    </div>
    <div class="settings-theme-list" role="menu" aria-label="\u4ECB\u9762\u98A8\u683C">${t}</div>`,Zr()}function Rl(){bs.querySelectorAll("[data-settings-panel]").forEach(e=>{let t=e.dataset.settingsPanel===os;e.classList.toggle("is-active",t),e.setAttribute("aria-selected",t?"true":"false")})}function qn(e=os){os=e==="theme"?"theme":"font-size",Rl(),os==="theme"?El():Qs()}function Vr(e,t,s){let a=Number(t);if(!Number.isFinite(a))return;let n=An(Yr(a,e.min,e.max));kt[e.id]=n;let i=s?.querySelector(".font-size-slider");i&&(i.value=String(n));let o=s?.querySelector(".font-size-preview");o&&(o.style.fontSize=`${n}px`),ni()}function Cl(){vt.querySelectorAll(".font-size-row").forEach(e=>{let t=Ms.get(e.dataset.fontGroup);if(!t)return;let s=kt[t.id]??ka(t),a=e.querySelector(".font-size-number-input");a&&(a.value=_a(s));let n=e.querySelector(".font-size-slider");n&&(n.value=String(s));let i=e.querySelector(".font-size-preview");i&&(i.style.fontSize=`${s}px`)})}function Wr(e){let t=e.target.closest(".font-size-row");if(!t)return;let s=Ms.get(t.dataset.fontGroup);if(!s)return;let a=e.target.classList.contains("font-size-number-input");if(!(a&&e.target.value==="")){if(e.type==="input"&&a){let n=Number(e.target.value);if(!Number.isFinite(n))return;Vr(s,n,t);return}if(Vr(s,e.target.value,t),e.type==="input"){let n=t.querySelector(".font-size-number-input");n&&document.activeElement!==n&&(n.value=_a(kt[s.id]??ka(s)))}}}function Pl(e){if(!e.target.classList.contains("font-size-number-input"))return;let t=e.target.closest(".font-size-row"),s=t?Ms.get(t.dataset.fontGroup):null;if(!s)return;let a=kt[s.id]??ka(s);e.target.value=_a(a)}function Il(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||si(t.dataset.fontGroup)}function Dl(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Ls()}function Bl(e){let t=e.target.closest(".font-size-row");t&&si(t.dataset.fontGroup)}function Fl(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||Ls()}function Ol(e){let t=e.target.closest("[data-settings-panel]");if(t){qn(t.dataset.settingsPanel);return}let s=e.target.closest("[data-settings-action]");if(s){let i=s.dataset.settingsAction;if(i==="save"){Xt={...kt};let o=Sl();Cl(),I(o?"\u5B57\u578B\u5927\u5C0F\u5DF2\u5132\u5B58\u3002":"\u5B57\u578B\u5927\u5C0F\u5DF2\u5957\u7528\uFF0C\u4F46\u700F\u89BD\u5668\u7121\u6CD5\u5132\u5B58\u8A2D\u5B9A\u3002",o?"ok":"warn");return}if(i==="cancel"){kt={...Xt},cs(),Qs(),I("\u5DF2\u53D6\u6D88\u672A\u5132\u5B58\u7684\u5B57\u578B\u8B8A\u66F4\u3002","info");return}i==="reset"&&(kt={},cs(),Qs(),I("\u5DF2\u56DE\u5FA9\u9810\u8A2D\u5B57\u578B\uFF1B\u6309\u300C\u5132\u5B58\u300D\u4FDD\u7559\u8B8A\u66F4\u3002","info"));return}let a=e.target.closest("[data-appearance-option]");if(a){kl(a.dataset.appearanceOption);return}let n=e.target.closest(".theme-option");n&&yn(n.dataset.themeId)}function Hl(){ls||(ls=!0,kt={...Xt},document.body.classList.add("settings-open"),qs.removeAttribute("inert"),qs.setAttribute("aria-hidden","false"),As.setAttribute("aria-expanded","true"),qn(os),cs(),window.requestAnimationFrame(()=>{let e=bs.querySelector(".settings-option.is-active")||bs.querySelector(".settings-option");e&&e.focus({preventScroll:!0})}))}function Sn({restoreFocus:e=!0}={}){ls&&(ls=!1,Ls(),kt={...Xt},cs(),document.body.classList.remove("settings-open"),e&&As.focus({preventScroll:!0}),qs.setAttribute("aria-hidden","true"),qs.setAttribute("inert",""),As.setAttribute("aria-expanded","false"))}function ri(){qs=document.getElementById("settings-sidebar"),As=document.getElementById("settings-trigger"),vt=document.getElementById("settings-panel"),bs=document.getElementById("settings-options"),Qr=document.getElementById("settings-close"),!(!qs||!As||!vt||!bs)&&(wa(),yn($n(),{persist:!1}),Nl(),Qs(),Ll(),cs(),As.addEventListener("click",()=>{ls?Sn():Hl()}),Qr?.addEventListener("click",()=>Sn()),bs.addEventListener("click",e=>{let t=e.target.closest("[data-settings-panel]");t&&qn(t.dataset.settingsPanel)}),vt.addEventListener("click",Ol),vt.addEventListener("input",Wr),vt.addEventListener("change",Wr),vt.addEventListener("blur",Pl,!0),vt.addEventListener("pointerover",Il),vt.addEventListener("pointerout",Dl),vt.addEventListener("focusin",Bl),vt.addEventListener("focusout",Fl),vt.addEventListener("keydown",e=>{e.key==="Enter"&&e.target.classList.contains("font-size-number-input")&&(e.preventDefault(),e.target.blur())}),document.addEventListener("keydown",e=>{e.key==="Escape"&&ls&&Sn()}),window.addEventListener("storage",e=>{if(e.key===xn){Zt=Xr(),wa();return}e.key===$a&&(Xt=ei(),ls||(kt={...Xt},cs()))}))}var Pn={};rs(Pn,{render:()=>sc});function zl(e){let t=e&&typeof e=="object"?e:{},s=t.judgment_total,a=t.financial_total,n=Number(s),i=Number(a),o=s!=null&&Number.isFinite(n)&&n>=0,l=a!=null&&Number.isFinite(i)&&i>=0;return{total:o?n:null,financial:l?i:null,ratio:o&&l&&n>0?i/n*100:null}}function Vt(e,{loading:t=!1}={}){let s=zl(e),a=t?"\u8B80\u53D6\u4E2D\u2026":d(s.total),n=t?"\u8B80\u53D6\u4E2D\u2026":d(s.financial),i=t?"\u8B80\u53D6\u4E2D\u2026":s.ratio===null?"\u2014":`${s.ratio.toFixed(1)}%`;return`<div class="processing-summary-card">
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
  </div>`}var Mn=11,Gl=15e3,Sa=new Set,Ul=[{route:"rag",icon:"message",kicker:"RAG",title:"RAG \u63D0\u554F",summary:"\u7528\u81EA\u7136\u8A9E\u8A00\u627E\u5230\u76F8\u4F3C\u5224\u6C7A\u8207\u73FE\u884C\u6CD5\u898F\uFF0C\u56DE\u7B54\u9644\u4E0A\u53EF\u56DE\u6EAF\u7684\u5F15\u7528\u3002",metric:"Citations first",tone:"feature",wide:!0,metricKey:"rag"},{route:"data",icon:"database",kicker:"EXPLORE",title:"\u8CC7\u6599\u5EAB\u67E5\u8A62",summary:"\u8DE8 PostgreSQL\u3001Parquet\u3001Qdrant \u8207 IndexedDB \u6AA2\u8996\u539F\u59CB\u8CC7\u6599\u3002",metric:"4 \u7A2E\u8CC7\u6599\u4F86\u6E90",tone:"blue",metricKey:"data"},{route:"quality",icon:"shield",kicker:"QUALITY",title:"\u8CC7\u6599\u54C1\u8CEA",summary:"\u7528 DuckDB \u6AA2\u67E5\u539F\u59CB\u5224\u6C7A\u7684\u91CD\u8907\u3001\u7F3A\u6F0F\u8207\u5F15\u7528\u4E00\u81F4\u6027\u3002",metric:"DuckDB native",tone:"green",metricKey:"quality"},{route:"performance",icon:"activity",kicker:"OBSERVE",title:"\u6548\u80FD\u5831\u8868",summary:"\u5F9E\u55AE\u6B21 RAG \u5230\u7D22\u5F15\u5EFA\u7F6E\uFF0C\u8FFD\u8E64\u6BCF\u500B\u968E\u6BB5\u7684\u8017\u6642\u8207\u74F6\u9838\u3002",metric:"Flow \xB7 Waterfall",tone:"amber",metricKey:"performance"},{route:"processing",icon:"sliders",kicker:"PIPELINE",title:"\u8CC7\u6599\u8655\u7406",summary:"\u4E0B\u8F09\u3001\u532F\u5165\u3001\u5099\u4EFD\u8207\u7D22\u5F15\uFF0C\u96C6\u4E2D\u7BA1\u7406\u8CC7\u6599\u751F\u547D\u9031\u671F\u3002",metric:"End-to-end",tone:"violet",metricKey:"processing"},{route:"status",icon:"server",kicker:"STATUS",title:"\u7CFB\u7D71\u72C0\u614B",summary:"\u6AA2\u8996\u670D\u52D9\u5065\u5EB7\u3001\u8F09\u5165 Pipeline\u3001\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207 API \u76EE\u9304\u3002",metric:"10 \u670D\u52D9\u5143\u4EF6",tone:"slate",metricKey:"status"},{route:"tests",icon:"check",kicker:"VERIFY",title:"\u7CFB\u7D71\u6E2C\u8A66",summary:"\u8A2D\u5B9A API Base\uFF0C\u6E2C\u8A66 LLM \u6A21\u578B\u8207 Reranker \u670D\u52D9\u3002",metric:"LLM \xB7 Reranker",tone:"rose",metricKey:"tests"}];function js(e,t=1){let s=Number(e);return Number.isFinite(s)?`${s.toFixed(t)}%`:"\u2014"}function jn(e){let t=e?.year_min,s=e?.year_max;return!t&&!s?"\u2014":t&&s&&t!==s?`${t}\u2013${s}`:String(t||s)}function ii(e){let t=Number(e?.year_span);return Number.isFinite(t)&&t>0?`${t} \u5E74`:"\u2014"}function Ql(e){return`<a class="home-tile tone-${r(e.tone)}${e.wide?" is-wide":""}" href="#/${e.route}">
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
  </div>`}function Jl(e,{loading:t=!1}={}){if(t)return`<div class="home-live-rows is-loading">
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
      <span class="home-live-value mono">${r(jn(a))} <i>\xB7</i> ${r(ii(a))}</span>
    </div>
    <div class="home-live-row">
      <span class="home-live-label">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15</span>
      <span class="home-live-value mono">${d(n.indexed)} <i>\xB7</i> ${r(js(n.coverage_pct))}</span>
    </div>
  </div>`}function Aa(e,{loading:t=!1,error:s="",generatedAt:a=""}={}){return s?`<div class="home-live-error" role="status">
      <span class="home-live-error-icon">${g("alert",18)}</span>
      <div>
        <strong>\u5373\u6642\u6458\u8981\u66AB\u6642\u7121\u6CD5\u53D6\u5F97</strong>
        <p>${r(s)}</p>
        <button class="btn btn-secondary btn-sm" type="button" id="home-retry">
          ${g("refresh",13)}<span>\u91CD\u65B0\u8F09\u5165</span>
        </button>
      </div>
    </div>`:`${Jl(e,{loading:t})}
    <div class="home-live-foot">
      <span class="home-live-source">${g("link",12)}\u53F8\u6CD5\u9662 OpenData \xB7 \u5168\u570B\u6CD5\u898F\u8CC7\u6599\u5EAB</span>
      <span class="home-live-time">${t||!a?"\u540C\u6B65\u4E2D\u2026":`\u66F4\u65B0 ${ye(a)}`}</span>
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
      <small>${r(ii(s))} \xB7 ${d(s.financial_total)} \u7B46 current</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">\u5411\u91CF\u7D22\u5F15\u8986\u84CB</span>
      <strong>${r(js(n.coverage_pct))}</strong>
      <small>${d(n.indexed)} / ${d(n.total)} \u7B46 \xB7 ${r(n.model||"\u2014")}</small>
    </span>`}function xa(e,t){let s=t?.laws||{},a=t?.judgments||{},n=t?.raw||{},i=t?.sources||{};if(e==="opendata"){let l=i.opendata||{};return`<article class="home-source-card">
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
  </article>`}function En(e,{loading:t=!1,error:s=""}={}){if(t)return'<div class="home-laws-loading skeleton skeleton-card"></div>';if(s)return`<div class="home-laws-error" role="status">${g("alert",16)}<span>${r(s)}</span></div>`;let a=e?.financial_laws||{},n=Array.isArray(a.laws)?a.laws:[],i=Number(a.count)||n.length,o=Math.ceil(i/Mn)||0,l=String(a.source_sha256||""),p=l?`${l.slice(0,12)}\u2026`:"\u2014",f=a.modified_at?Rt(a.modified_at):"\u2014";return`<details class="home-laws" id="home-laws">
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
        <span>\u4F86\u6E90 ${r(a.source_path||"documents/\u91D1\u878D\u6CD5\u898F.md")} \xB7 SHA-256 <span class="mono">${r(p)}</span> \xB7 \u4FEE\u6539 ${r(f)}</span>
        <button class="btn btn-secondary btn-sm" type="button" id="home-laws-download">
          ${g("download",13)}<span>\u4E0B\u8F09\u6E05\u55AE</span>
        </button>
      </div>
      ${n.length?`<div class="home-laws-grid" style="--home-law-columns:${Mn}" role="list">
              ${n.map((m,y)=>`<span class="home-law" role="listitem" title="${r(m)}">
                    <span class="home-law-index">${String(y+1).padStart(2,"0")}</span>
                    <span class="home-law-name">${r(m)}</span>
                  </span>`).join("")}
            </div>`:'<p class="home-laws-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u6CD5\u898F\u540D\u7A31\u3002</p>'}
    </div>
  </details>`}function Rn(e,{loading:t=!1,error:s=""}={}){if(t)return`<div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>`;if(s)return`<div class="home-rag-error">${g("alert",16)}<span>${r(s)}</span></div>`;let a=e?.rag||{},n=a.judgment_index||{},i=a.legal_index||{},o=a.models||{},l=Number(n.coverage_pct),p=Number.isFinite(l)?Math.max(0,Math.min(100,l)):0;return`<article class="home-rag-card">
      <span class="home-rag-kicker">JUDGMENT RETRIEVAL</span>
      <strong class="home-rag-value mono">${d(n.indexed)}<small> / ${d(n.total)}</small></strong>
      <span class="home-rag-label">\u5DF2\u7D22\u5F15 / \u91D1\u878D\u5224\u6C7A</span>
      <span class="home-rag-progress" role="img" aria-label="\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u8986\u84CB ${r(js(n.coverage_pct))}"><span style="width:${p.toFixed(1)}%"></span></span>
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
    </article>`}function Vl(){return`<ol class="home-rag-flow" aria-label="RAG \u57F7\u884C\u6D41\u7A0B">
    ${[["01","\u554F\u984C","1\u2013500 \u5B57","message"],["02","Embedding","bge-m3","brain"],["03","\u6AA2\u7D22","\u5224\u6C7A + \u6CD5\u898F\uFF0F\u547D\u4EE4","database"],["04","Rerank","cross-encoder","sliders"],["05","LLM","\u4F9D\u6AA2\u7D22\u5167\u5BB9\u56DE\u7B54","sparkles"],["06","\u5F15\u7528","[n] \u2192 \u539F\u59CB\u4F86\u6E90","link"]].map(([t,s,a,n])=>`<li class="home-rag-step">
          <span class="home-rag-step-icon">${g(n,17)}</span>
          <span class="home-rag-step-copy">
            <small>${t}</small>
            <strong>${r(s)}</strong>
            <span>${r(a)}</span>
          </span>
        </li>`).join("")}
  </ol>`}function Wl(){return`<div class="home-trace">
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
  </div>`}function Ln(e){return e==="failed"?"\u5931\u6557":e==="skipped"?"\u7565\u904E":e==="running"?"\u57F7\u884C\u4E2D":e==="pending"?"\u7B49\u5F85":"\u5B8C\u6210"}function Kl(e,t,s,a,n,i){let o=String(e.status||"success"),l=o==="skipped"||o==="pending",p=Math.max(0,Number(e.duration_ms)||0),f=l?"\u2014":ue(p),m=o==="failed"?"var(--danger)":e.color||"#64748b",y=[`is-${o}`,o==="failed"?"is-error":"",l?"is-missing":"",i&&e.key===i?"is-slowest":""].filter(Boolean).join(" "),b=String(e.key||`stage-${t}`),u=[["\u72C0\u614B",Ln(o),!0],["\u958B\u59CB",e.started_at?ye(e.started_at):"\u2014",!0],["\u7D50\u675F",e.finished_at?ye(e.finished_at):"\u2014",!0],["\u8017\u6642",f,!0],["\u5360\u6574\u9AD4",js(n),!0],["\u8AAA\u660E",e.message||e.caption||"",!1]].map(([w,_,x])=>x||_?`<span class="rag-wf-detail"><span>${r(w)}</span><strong>${r(String(_||"\u2014"))}</strong></span>`:"").join(""),v=l?"":`<span class="rag-wf-bar is-sequential" style="left:${s.toFixed(3)}%;width:${a.toFixed(4)}%;top:0;height:12px;--bar-color:${r(m)}" aria-hidden="true"></span>`;return`<details class="rag-wf-stage home-wf-stage ${y}${Sa.has(b)?" is-open":""}" data-home-wf-stage="${r(b)}"${Sa.has(b)?" open":""} style="--stage-color:${r(e.color||"#64748b")}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong><span class="home-wf-step">${String(t+1).padStart(2,"0")}</span> ${r(e.label||e.key||"\u968E\u6BB5")}${i&&e.key===i?' <span class="home-wf-slow">\u6700\u6162</span>':""}</strong>${e.caption?`<small>${r(e.caption)}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${r(f)} \xB7 ${r(Ln(o))} <span class="rag-wf-chevron">${g("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${e.label||e.key}\uFF1A${Ln(o)}\uFF0C\u8017\u6642 ${f}\uFF0C\u5360\u6574\u9AD4 ${js(n)}`)}">${v}</span>
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
    </div>`;let o=Math.max(0,Number(n.total_ms)||i.reduce((S,k)=>S+(Number(k.duration_ms)||0),0)),l=Math.max(0,Number(a)||0),p=Math.max(0,l-o),f=Math.max(o,i.reduce((S,k)=>S+(Number(k.duration_ms)||0),0),1),m=i.reduce((S,k)=>(Number(k.duration_ms)||0)>(Number(S?.duration_ms)||0)?k:S,i[0]),y=1.25,b=i.map(S=>String(S.status||"success")==="skipped"?0:Math.max((Number(S.duration_ms)||0)/f*100,y)),u=b.reduce((S,k)=>S+k,0),v=u>100?100/u:1,w=0,_=i.map((S,k)=>{let D=["skipped","pending"].includes(String(S.status||"success")),oe=D?0:b[k]*v,O=w;D||(w+=oe);let be=f>0?(Number(S.duration_ms)||0)/f*100:0;return Kl(S,k,O,oe,be,m?.key)}).join(""),x=i.filter(S=>S.status==="failed").length;return`<section class="report-card status-wf-card home-wf-card" data-home-pipeline>
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
      <span class="index-runtime-metric" title="HTTP \u5F80\u8FD4\u6263\u6389\u5F8C\u7AEF\u968E\u6BB5\u7E3D\u8017\u6642\u5F8C\u7684\u50B3\u8F38\u8207\u6392\u968A\u6642\u9593\u3002"><span>\u50B3\u8F38\uFF0F\u6392\u968A</span><strong>${r(l?ue(p):"\u2014")}</strong></span>
      <span class="index-runtime-metric" title="\u672C\u6B21\u8F09\u5165\u8017\u6642\u6700\u9577\u7684\u968E\u6BB5\uFF0C\u4E5F\u5C31\u662F\u76EE\u524D\u6700\u660E\u986F\u7684\u74F6\u9838\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${m?.label||"\u2014"} \xB7 ${ue(m?.duration_ms||0)}`)}</strong></span>
      <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${d(i.length-x)} / ${d(i.length)}${x?` \xB7 \u5931\u6557 ${d(x)}`:""}</strong></span>
      <span class="index-runtime-metric" title="\u672C\u6B21\u6458\u8981\u7684\u7522\u751F\u6642\u9593\u3002"><span>\u66F4\u65B0\u6642\u9593</span><strong>${r(n.finished_at?ye(n.finished_at):"\u2014")}</strong></span>
    </div>
    <div class="status-wf-chart">
      <div class="rag-wf-axis"><span>0 ms</span><span>${r(ue(o))}</span></div>
      <div class="rag-wf-stages">${_}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u5BE6\u969B\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0Cbar \u9577\u5EA6\u70BA\u8A72\u968E\u6BB5\u8017\u6642\u5360\u6BD4\uFF1B\u6A19\u793A\u300C\u6700\u6162\u300D\u7684\u968E\u6BB5\u5373\u672C\u6B21\u8F09\u5165\u74F6\u9838\u3002\u9EDE\u64CA\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u3001\u5360\u6BD4\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function Yl(e){return`<div class="home-source-error">${g("alert",16)}<span>${r(e)}</span></div>`}function Xl(){let e=Ul.map(Ql).join("");return`<section class="page home-page" id="home-page">
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
        <div id="home-live-body" aria-live="polite">${Aa(null,{loading:!0})}</div>
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
      ${Vl()}
      <div class="home-rag-values" id="home-rag-values">
        ${Rn(null,{loading:!0})}
      </div>
      ${Wl()}
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
        ${xa("opendata",null)}
        ${xa("laws",null)}
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
  </section>`}function Zl(e,t){let s=t?.laws||{},a=t?.judgments||{},n=t?.raw||{},i=t?.rag?.judgment_index||{},o={rag:`${d(i.indexed)} \u7B46\u7D22\u5F15`,data:`${d(s.law_count)} \u6CD5\u898F \xB7 ${d(s.order_count)} \u547D\u4EE4`,quality:`${d(n.raw_total)} \u539F\u59CB\u5224\u6C7A`,processing:`${d(n.archive_count)} archive`,performance:"Flow \xB7 Waterfall",status:"10 \u670D\u52D9\u5143\u4EF6",tests:"LLM \xB7 Reranker"};e.querySelectorAll("[data-home-tile-metric]").forEach(l=>{let p=l.dataset.homeTileMetric;p&&o[p]&&(l.textContent=o[p])})}function ec(e,t,{clientMs:s=null}={}){let a=t?.data||{},n=t?.generated_at||"",i=e.querySelector("#home-live-body");i&&(i.innerHTML=Aa(a,{generatedAt:n}));let o=e.querySelector("#home-judgment-stats"),l=a.judgments||{};o&&(o.innerHTML=Vt({judgment_total:l.raw_total,financial_total:l.financial_total,financial_ratio:l.financial_ratio}));let p=e.querySelector("#home-law-metrics");p&&(p.innerHTML=Tn(a));let f=e.querySelector("#home-metric-strip");f&&(f.innerHTML=Nn(a));let m=e.querySelector("#home-rag-values");m&&(m.innerHTML=Rn(a));let y=e.querySelector("#home-source-grid");y&&(y.innerHTML=`${xa("opendata",a)}${xa("laws",a)}`);let b=e.querySelector("#home-laws-slot");if(b){let w=!!b.querySelector("#home-laws")?.open;b.innerHTML=En(a);let _=b.querySelector("#home-laws");_&&w&&(_.open=!0)}let u=e.querySelector("#home-waterfall-slot");u&&(u.innerHTML=Cn({...a,pipeline:t?.pipeline},{clientMs:s})),Zl(e,a)}function tc(e,t){let s=e.querySelector("#home-live-body");s&&(s.innerHTML=Aa(null,{error:t}));let a=e.querySelector("#home-judgment-stats");a&&(a.innerHTML=Vt(null));let n=e.querySelector("#home-law-metrics");n&&(n.innerHTML=Tn(null));let i=e.querySelector("#home-metric-strip");i&&(i.innerHTML=Nn(null));let o=e.querySelector("#home-rag-values");o&&(o.innerHTML=Rn(null,{error:t}));let l=e.querySelector("#home-source-grid");l&&(l.innerHTML=Yl(t));let p=e.querySelector("#home-laws-slot");p&&(p.innerHTML=En(null,{error:t}));let f=e.querySelector("#home-waterfall-slot");f&&(f.innerHTML=Cn(null,{error:t}))}async function sc(e,t){let s=!1,a=!1,n=!1,i=null,o=null,l=null,p=null,f=0;e.innerHTML=Xl();let m=e.querySelector("#home-ask-form"),y=e.querySelector("#home-question"),b=e.querySelector("#home-refresh"),u=()=>{let S=String(y?.value||"").trim().slice(0,500);if(!S){y?.focus();return}try{window.sessionStorage.setItem("judgment.pending_question",S)}catch{}window.__judgmentPendingQuestion=S,t&&typeof t.navigate=="function"?t.navigate("rag"):window.location.hash="#/rag"},v=()=>{y&&(y.style.height="auto",y.style.height=`${Math.min(y.scrollHeight,140)}px`)},w=S=>{b&&(b.disabled=S,b.classList.toggle("is-loading",S),b.setAttribute("aria-busy",S?"true":"false"))},_=async({quiet:S=!1}={})=>{if(s)return;if(a){n=!0;return}if(a=!0,f=Date.now(),w(!0),!S){let D=e.querySelector("#home-live-body");D&&(D.innerHTML=Aa(null,{loading:!0}))}let k=performance.now();try{let D=await V.homeSummary();if(s||!e.isConnected)return;o=D?.data||null,l=D?.data?.financial_laws||null,ec(e,D,{clientMs:Math.round(performance.now()-k)})}catch(D){if(s||!e.isConnected)return;tc(e,D.message||"\u7121\u6CD5\u53D6\u5F97\u9996\u9801\u5373\u6642\u8CC7\u6599\u3002")}finally{a=!1,w(!1),n&&!s&&(n=!1,_({quiet:!0}))}};y?.addEventListener("input",v),m?.addEventListener("submit",S=>{S.preventDefault(),u()}),y?.addEventListener("keydown",S=>{S.key==="Enter"&&!S.shiftKey&&!S.isComposing&&(S.preventDefault(),u())});let x=()=>{if(s||p)return;let S=Math.max(0,Gl-(Date.now()-f));if(S===0){_({quiet:!0});return}p=window.setTimeout(()=>{p=null,s||_({quiet:!0})},S)};if(e.addEventListener("click",S=>{if(S.target.closest("#home-refresh")||S.target.closest("#home-retry")){p&&(window.clearTimeout(p),p=null),_();return}if(S.target.closest("#home-laws-download")){let k=l?.content||`${(l?.laws||[]).join(`
`)}
`;k.trim()&&Pt("\u91D1\u878D\u6CD5\u898F.md",k)}}),e.addEventListener("toggle",S=>{let k=S.target.closest?.("[data-home-wf-stage]");if(!k||!e.contains(k))return;let D=k.dataset.homeWfStage||"";D&&(k.open?Sa.add(D):Sa.delete(D))},!0),v(),y?.focus({preventScroll:!0}),await _(),!s)try{i=ht("processing",(S,k)=>{s||k?.initial||x()},{onError:()=>{}})}catch{i=null}return()=>{s=!0,p&&(window.clearTimeout(p),p=null),typeof i=="function"&&i(),i=null}}var sr={};rs(sr,{render:()=>Gd});var oi="judgment-console";var dt="query_history",Ht="settings",zt="audit_events";var Ze={history:[],settings:new Map,audit:[],nextId:1},qa=null,it=!("indexedDB"in window);function Mt(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function At(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function Lt(){return qa||(qa=new Promise((e,t)=>{if(!("indexedDB"in window)){it=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(oi,2)}catch(a){it=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(dt)){let n=a.createObjectStore(dt,{keyPath:"id",autoIncrement:!0});n.createIndex("created_at","created_at"),n.createIndex("kind","kind")}if(a.objectStoreNames.contains(Ht)||a.createObjectStore(Ht,{keyPath:"key"}),!a.objectStoreNames.contains(zt)){let n=a.createObjectStore(zt,{keyPath:"key"});n.createIndex("created_at","created_at"),n.createIndex("dataset","dataset"),n.createIndex("jid","jid"),n.createIndex("issue_month","issue_month")}},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{it=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{it=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),qa)}function li(){return"indexedDB"in window}function ci(){return it}function Vs(){return it?"memory":"indexeddb"}function ac(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},turns:Array.isArray(e.turns)?e.turns:[],pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t,updated_at:e.updated_at||t}}async function nc(){try{let t=(await Lt()).transaction(dt,"readwrite"),s=t.objectStore(dt),a=await Mt(s.count());if(a>120){let n=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let p=i.result;if(!p||n<=0){o();return}p.delete(),n-=1,p.continue()},i.onerror=()=>l(i.error)})}await At(t)}catch{it=!0}}async function Ws(e){let t=ac(e);try{let a=(await Lt()).transaction(dt,"readwrite"),n=a.objectStore(dt),i=await Mt(n.add(t));return await At(a),await nc(),i}catch{it=!0;let a=Ze.nextId++;return Ze.history.push({id:a,...t}),Ze.history.length>120&&Ze.history.shift(),a}}async function Ks(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let n=(await Lt()).transaction(dt,"readwrite"),i=n.objectStore(dt),o=await Mt(i.get(s));if(!o)return await At(n),null;let l={...o,...t,id:s};return await Mt(i.put(l)),await At(n),l}catch{it=!0;let n=Ze.history.findIndex(i=>Number(i.id)===s);return n===-1?null:(Ze.history[n]={...Ze.history[n],...t,id:s},Ze.history[n])}}async function di(e){let t=Number(e);if(!Number.isFinite(t))return!1;try{let a=(await Lt()).transaction(dt,"readwrite");return a.objectStore(dt).delete(t),await At(a),!0}catch{it=!0;let a=Ze.history.findIndex(n=>Number(n.id)===t);return a===-1?!1:(Ze.history.splice(a,1),!0)}}async function Ma({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let n=(await Lt()).transaction(dt,"readonly"),i=n.objectStore(dt),o=await Mt(i.getAll());return await At(n),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,p)=>String(p.updated_at||p.created_at).localeCompare(String(l.updated_at||l.created_at))).slice(0,t)}catch{return it=!0,Ze.history.filter(n=>s?`${n.kind} ${n.title} ${n.detail}`.toLowerCase().includes(s):!0).slice().sort((n,i)=>String(i.updated_at||i.created_at).localeCompare(String(n.updated_at||n.created_at))).slice(0,t)}}async function ui(){try{let t=(await Lt()).transaction(dt,"readwrite");t.objectStore(dt).clear(),await At(t)}catch{it=!0}Ze.history=[]}function rc(e){let t=Number(e.id??e.event_id??0)||0,s=String(e.dataset||e.kind||"judgment"),a=String(e.key||`${s}:${t||`${Date.now()}:${Math.random().toString(36).slice(2)}`}`),n=String(e.jid||""),i=String(e.issue_month||""),o=String(e.change_type||""),l=String(e.detected_at||e.created_at||new Date().toISOString());return{key:a,event_id:t,dataset:s,jid:n,issue_month:i,change_type:o,title:String(e.title||n||i||"\u7248\u672C\u8B8A\u66F4"),detail:String(e.detail||[o,i,n].filter(Boolean).join(" \xB7 ")),created_at:l,payload:e}}async function ic(){try{let t=(await Lt()).transaction(zt,"readwrite"),s=t.objectStore(zt),a=await Mt(s.count());if(a>2e3){let n=a-2e3,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let p=i.result;if(!p||n<=0){o();return}p.delete(),n-=1,p.continue()},i.onerror=()=>l(i.error)})}await At(t)}catch{it=!0}}async function pi(e){let t=(Array.isArray(e)?e:[]).filter(s=>s&&typeof s=="object").map(rc);if(!t.length)return 0;try{let a=(await Lt()).transaction(zt,"readwrite"),n=a.objectStore(zt);for(let i of t)await Mt(n.put(i));return await At(a),await ic(),t.length}catch{it=!0;let a=new Map(Ze.audit.map(n=>[n.key,n]));for(let n of t)a.set(n.key,n);return Ze.audit=Array.from(a.values()).sort((n,i)=>String(i.created_at).localeCompare(String(n.created_at))).slice(0,2e3),t.length}}async function mi({keyword:e="",limit:t=200}={}){let s=e.trim().toLowerCase(),a=n=>s?`${n.dataset} ${n.jid} ${n.issue_month} ${n.change_type} ${n.detail}`.toLowerCase().includes(s):!0;try{let i=(await Lt()).transaction(zt,"readonly"),o=i.objectStore(zt),l=await Mt(o.getAll());return await At(i),l.filter(a).sort((p,f)=>String(f.created_at).localeCompare(String(p.created_at))).slice(0,t)}catch{return it=!0,Ze.audit.filter(a).slice().sort((i,o)=>String(o.created_at).localeCompare(String(i.created_at))).slice(0,t)}}async function gi(){let e={name:oi,version:2,supported:"indexedDB"in window,mode:Vs(),degraded:it,stores:[dt,Ht,zt],caps:{history:120,audit:2e3},usage_bytes:null,quota_bytes:null};if(typeof navigator<"u"&&navigator.storage?.estimate)try{let t=await navigator.storage.estimate();e.usage_bytes=Number.isFinite(t.usage)?t.usage:null,e.quota_bytes=Number.isFinite(t.quota)?t.quota:null}catch{}try{let s=(await Lt()).transaction([dt,Ht,zt],"readonly"),a=At(s),[n,i,o]=await Promise.all([Mt(s.objectStore(dt).count()),Mt(s.objectStore(Ht).count()),Mt(s.objectStore(zt).count()),a]);return{...e,available:!0,counts:{query_history:n,settings:i,audit_events:o},total:n+i+o}}catch{return it=!0,{...e,available:!1,degraded:!0,mode:"memory",counts:{query_history:Ze.history.length,settings:Ze.settings.size,audit_events:Ze.audit.length},total:Ze.history.length+Ze.settings.size+Ze.audit.length}}}async function Ys(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let n=(await Lt()).transaction(Ht,"readwrite");return n.objectStore(Ht).put(s),await At(n),s}catch{return it=!0,Ze.settings.set(s.key,s),s}}async function ds(e,t=null){try{let a=(await Lt()).transaction(Ht,"readonly"),n=a.objectStore(Ht),i=await Mt(n.get(String(e)));return await At(a),i?i.value:t}catch{it=!0;let a=Ze.settings.get(String(e));return a?a.value:t}}async function fi({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await Lt()).transaction(Ht,"readonly"),n=a.objectStore(Ht),i=await Mt(n.getAll());return await At(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return it=!0,Array.from(Ze.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function bi(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var Zn={};rs(Zn,{buildFlowWaterfallStages:()=>Ha,render:()=>yd,renderRagPipelineWaterfall:()=>Oa,renderTestFlowPanel:()=>Rs,renderWaterfallStages:()=>Es});var oc={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},lc=new Set(["running","stopping"]);function Ta(e){let[t,s]=oc[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${r(t)}</span>`}function La(e){return String(e).padStart(2,"0")}function Ts(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${La(t.getMonth()+1)}-${La(t.getDate())} ${La(t.getHours())}:${La(t.getMinutes())}`}function ja(e){return lc.has(e)}function es(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function hs(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function us(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${r(e)}</span>
    <strong>${r(String(t))}</strong>
    ${s?`<small>${r(s)}</small>`:""}
  </div>`}function hi(e={}){let t=e.score_components||e,s=e.gate||{},a=String(s.status||""),n=a==="pass"?"Gate \u901A\u904E":a==="fail"?"Gate \u5931\u6557":a==="no_data"?"Gate \u7121\u8CC7\u6599":"";return`${n?`<span class="badge ${a==="pass"?"badge-ok":a==="fail"?"badge-danger":"badge-neutral"}">${r(n)}</span>`:""}<div class="bench-metrics">
    ${us("Law Recall",hs(t.law_recall))}
    ${us("Article Recall",hs(t.article_recall))}
    ${us("Citation Valid",hs(t.citation_valid_rate))}
    ${us("Judge",es(t.judge_overall))}
    ${us("Human",es(t.human_overall))}
    ${us("p50",ue(e.duration_p50_ms))}
    ${us("p95",ue(e.duration_p95_ms))}
    ${us("Success",`${d(e.success||0)} / ${d(e.total||0)}`)}
  </div>`}function vi(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${r(s.replace(/^rag\./,""))}</span>
      <strong>${ue(a.p50_ms)}</strong>
      <small>p95 ${ue(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function $i(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${hs(s.law_recall)}</span>
    <span>Article ${hs(s.article_recall)}</span>
    <span>Judge ${es(s.judge_overall)}</span>
    <span>p95 ${ue(t.duration_p95_ms)}</span>`}function yi(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function wi(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${r(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${r(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${r(e.status||"")}">${Ta(e.status)}</span>
      <span class="mono">${r(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${r(ye(e.started_at))}</span>
      <span data-bench-slot="run-completed">${d(e.completed_cases||0)} / ${d(e.total_cases||0)} \u984C</span>
      <span>${r(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${r(yi(e))}">${$i(e)}</span>
  </button>`}function Dn(e,t=[]){let s=e.metrics||{},a=e.judge||{},n=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([f])=>f.startsWith("rag.")).map(([f,m])=>`<span class="chip">${r(f)} ${ue(m)}</span>`).join(""),p=(e.law_sources||[]).map(f=>`<span class="chip">${r(f.law_name||"\u6CD5\u898F")} ${d((f.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${r(e.question)}</span>
      ${Ta(e.status)}
      <span class="bench-case-time">${ue(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${es(i.deterministic)} \xB7 Judge ${es(i.judge)} \xB7 Human ${es(i.human)}</span>
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
      <div class="chips">${p||'<span class="qb-muted">\u6C92\u6709\u6CD5\u898F\u4F86\u6E90</span>'}</div>
      <div class="bench-answer"><strong>\u56DE\u7B54</strong><p>${r(e.answer||"\u2014")}</p></div>
      <div class="bench-judge"><strong>LLM judge</strong><p>${r(a.rationale||a.reason||"\u2014")}</p><span>${[["correctness",a.correctness],["grounding",a.grounding],["citation",a.citation],["clarity",a.clarity],["overall",a.overall]].map(([f,m])=>`${f} ${m??"\u2014"}`).join(" \xB7 ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${e.id}">
        <div class="bench-human-grid">
          ${[["correctness","\u6B63\u78BA\u6027",n.scores?.correctness??4],["grounding","\u6709\u64DA\u6027",n.scores?.grounding??4],["citation","\u5F15\u7528",n.scores?.citation??4],["clarity","\u6E05\u695A",n.scores?.clarity??4],["overall","\u6574\u9AD4",n.overall??4]].map(([f,m,y])=>`<label class="field"><span class="field-label">${m} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${f}" value="${r(String(y))}" /></label>`).join("")}
        </div>
        <label class="field"><span class="field-label">\u4EBA\u5DE5\u6279\u6CE8</span><input class="input" name="comment" value="${r(n.comment||"")}" placeholder="\u56DE\u7B54\u54C1\u8CEA\u3001\u5F15\u7528\u6216\u4E8B\u5BE6\u932F\u8AA4" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${g("check",13)}<span>\u5132\u5B58\u4EBA\u5DE5\u8A55\u5206</span></button>
      </form>
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(f=>`<div class="bench-history-row"><span>${r(ye(f.run?.started_at))}</span><span>${r(f.run?.config?.llm_model||"\u2014")}</span><span>Det ${es(f.metrics?.scores?.deterministic)}</span><span>Judge ${es(f.metrics?.scores?.judge)}</span><span>Human ${es(f.metrics?.scores?.human)}</span><span>${ue(f.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function In(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function _i(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${Dn(e,t)}
  </details>`}function ki(e){return`${Ta(e.status)}
    <span class="mono">${r(e.run_id)}</span>
    ${ja(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${g("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function cc(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${r(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${g("activity",14)}${r(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${r((e.status||"")+":"+e.run_id)}">
        ${ki(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${hi(e.summary||{})}</div>
    <div data-bench-detail="stages">${vi(e.summary||{})}</div>
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
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>_i(a,t[a.fingerprint]||[])).join(""):Ce({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function Si(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${g("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${g("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function xi(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),n=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,n-i):0,l=(t||[]).filter(v=>["success","failed"].includes(v.status)).map(v=>Number(v.duration_ms)||0).filter(v=>v>0),p=null;if(l.length)p=l.reduce((v,w)=>v+w,0)/l.length;else if(a>0){let v=Date.parse(e.updated_at||""),w=Number.isFinite(v)?v:i;Number.isFinite(w)&&w>i?p=(w-i)/a:o>0&&(p=o/a)}let f=(t||[]).find(v=>v.status==="running")||null,m=0;if(a<s&&p&&p>0){let v=f?Date.parse(f.started_at||""):NaN,w=Date.parse(e.updated_at||""),_=Number.isFinite(v)?v:w;Number.isFinite(_)&&(m=Math.max(0,Math.min(.95,(n-_)/p)))}let y=Math.min(s,a+m),b=s>0?Math.max(0,Math.min(100,y/s*100)):0,u=p===null?null:Math.max(0,s-y)*p;return{total:s,completed:a,elapsedMs:o,averageMs:p,progress:b,etaMs:u,ratePerMin:p?6e4/p:null,running:f}}function Ai(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${ue(e)}`}function qi(e,t=[]){let s=xi(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${r(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${d(s.completed)} / ${d(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${Ai(s.etaMs)}</span>
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
  </div>`}function dc(e){let t=e.models?.models||{},s=e.suites||[],a=Xs(e),n=e.selectedRun;return`<section class="report-card bench-card">
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
        ${Si(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${r(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?qi(a,Bn(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>wi(i,n?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${n?cc(n,e.history):""}
  </section>`}function Xs(e){let t=(e.runs||[]).find(s=>ja(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!ja(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function Bn(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function Mi(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:Ts(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",refreshStream:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),n=L=>{let q=new FormData(L);return{label:String(q.get("label")||"").trim()||Ts(),embedding_model:String(q.get("embedding_model")||""),llm_model:String(q.get("llm_model")||""),judge_model:String(q.get("judge_model")||""),top_k:Number(q.get("top_k")||4),score_threshold:Number(q.get("score_threshold")||.35),repeats:Number(q.get("repeats")||1),enable_law_retrieval:L.elements.enable_law_retrieval?.checked??!0,judge_enabled:L.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(L=>`${L.id}:${L.name}:${L.item_count}:${L.version}:${L.status}`)]:null,runs:(s.runs||[]).map(L=>`${L.run_id}:${L.label||""}:${L.suite_version||1}`)}),o=()=>{let q=a()?.querySelector("[data-bench-live]"),E=Xs(s);if(!q||!E)return;let X=xi(E,Bn(s,E)),ee=(_e,z)=>{let ve=q.querySelector(`[data-bench-slot="${_e}"]`);ve&&ve.textContent!==z&&(ve.textContent=z)};ee("progress-count",`${d(X.completed)} / ${d(X.total)} \u984C`),ee("progress-percent",`${X.progress.toFixed(1)}%`),ee("progress-eta",Ai(X.etaMs)),ee("progress-rate",X.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${X.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),ee("progress-elapsed",`\u5DF2\u57F7\u884C ${ue(X.elapsedMs)}`),ee("progress-average",X.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${ue(X.averageMs)}\uFF0F\u984C`),ee("progress-state",E.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let F=q.querySelector('[data-bench-slot="progress-bar"]');F&&(F.setAttribute("aria-valuenow",X.progress.toFixed(1)),F.classList.toggle("is-waiting",X.completed===0));let ie=q.querySelector('[data-bench-slot="progress-fill"]');ie&&(ie.style.width=`${X.progress.toFixed(2)}%`)},l=L=>{let q=L.querySelector("[data-bench-actions]");if(!q)return;let E=Xs(s),X=E?`${E.run_id}:${E.status}`:"";q.dataset.signature!==X&&(q.dataset.signature=X,q.innerHTML=Si(E))},p=L=>{let q=L.querySelector("[data-bench-live-wrap]");if(!q)return;let E=Xs(s),X=E?`${E.run_id}:${E.status}:${E.total_cases}`:"";q.dataset.signature!==X&&(q.dataset.signature=X,q.innerHTML=E?qi(E,Bn(s,E)):"")},f=L=>{let q=L.querySelector("[data-bench-runs]");if(!q)return;let E=s.runs||[],X=[...q.querySelectorAll("[data-run-id]")].map(F=>F.dataset.runId),ee=E.map(F=>F.run_id);if(X.join("|")!==ee.join("|")){q.innerHTML=E.length?E.map(F=>wi(F,s.selectedRun?.run_id===F.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let F of E){let ie=q.querySelector(`[data-run-id="${F.run_id}"]`);if(!ie)continue;ie.classList.toggle("is-active",s.selectedRun?.run_id===F.run_id);let _e=ie.querySelector('[data-bench-slot="run-label"]');_e&&_e.textContent!==(F.label||"RAG Benchmark")&&(_e.textContent=F.label||"RAG Benchmark");let z=ie.querySelector('[data-bench-slot="run-status"]');z&&z.dataset.status!==(F.status||"")&&(z.dataset.status=F.status||"",z.innerHTML=Ta(F.status));let ve=ie.querySelector('[data-bench-slot="run-completed"]');if(ve){let pe=`${d(F.completed_cases||0)} / ${d(F.total_cases||0)} \u984C`;ve.textContent!==pe&&(ve.textContent=pe)}let Z=ie.querySelector('[data-bench-slot="run-scores"]'),Se=yi(F);Z&&Z.dataset.signature!==Se&&(Z.dataset.signature=Se,Z.innerHTML=$i(F))}},m=L=>{let q=s.selectedRun;if(!q)return;let E=L.querySelector(`.bench-detail[data-run-id="${q.run_id}"]`);if(!E)return;let X=E.querySelector("[data-bench-detail-actions]");if(X){let Z=`${q.status||""}:${q.run_id}`;X.dataset.signature!==Z&&(X.dataset.signature=Z,X.innerHTML=ki(q))}let ee=E.querySelector('[data-bench-detail="metrics"]');if(ee){let Z=JSON.stringify(q.summary||{});ee.dataset.signature!==Z&&(ee.dataset.signature=Z,ee.innerHTML=hi(q.summary||{}))}let F=E.querySelector('[data-bench-detail="stages"]');if(F){let Z=JSON.stringify((q.summary||{}).stages||{});F.dataset.signature!==Z&&(F.dataset.signature=Z,F.innerHTML=vi(q.summary||{}))}let ie=E.querySelector("[data-bench-cases]");if(!ie)return;let _e=q.cases||[];if(!_e.length)return;let z=ie.querySelector(".notice");z&&z.remove();let ve=new Map([...ie.querySelectorAll("details.bench-case")].map(Z=>[Number(Z.dataset.resultId),Z]));for(let Z of _e){let Se=s.history[Z.fingerprint]||[],pe=In(Z,Se),K=ve.get(Number(Z.id));if(!K){ie.insertAdjacentHTML("beforeend",_i(Z,Se)),K=ie.lastElementChild,K&&(K._benchSignature=pe);continue}if(K._benchSignature===pe||!s.forcedCaseIds.delete(Number(Z.id))&&K.contains(document.activeElement))continue;let me=K.open;K.innerHTML=Dn(Z,Se),K.open=me,K._benchSignature=pe}},y=()=>{Xs(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},b=()=>{let L=a();L&&(l(L),p(L),f(L),m(L),o(),y())},u=L=>{let q=s.selectedRun;if(!q)return;let E=L.querySelector('[data-bench-detail="metrics"]');E&&(E.dataset.signature=JSON.stringify(q.summary||{}));let X=L.querySelector('[data-bench-detail="stages"]');X&&(X.dataset.signature=JSON.stringify((q.summary||{}).stages||{}));let ee=L.querySelector("[data-bench-cases]");if(!ee)return;let F=new Map((q.cases||[]).map(ie=>[Number(ie.id),ie]));for(let ie of ee.querySelectorAll("details.bench-case")){let _e=F.get(Number(ie.dataset.resultId));_e&&(ie._benchSignature=In(_e,s.history[_e.fingerprint]||[]))}},v=(L=!1)=>{let q=a();if(!q)return;let E=i();if(!L&&s.renderSignature===E){b();return}s.renderSignature=E,s.forcedCaseIds.clear(),q.innerHTML=dc(s),u(q),b()},w=async({refreshAll:L=!1,runs:q=null}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||L;return}s.loading=!0;try{if(!s.referenceLoaded||L){let[z,ve]=await Promise.all([V.benchmarkModels(),V.benchmarkSuites()]);s.models=z,s.suites=ve.suites||[],s.indexVersion=z.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=z.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=z.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(z.models?.llm||[]).find(Z=>Z!==s.config.llm_model)||"")}let E=q?{runs:q}:await V.benchmarkRuns(30);s.runs=E.runs||[];let X=s.activeRunId,ee=s.runs.find(z=>ja(z.status))||null;s.activeRunId=ee?.run_id||"";let F=s.selectedRun?.run_id||"";F||(F=ee?.run_id||s.runs[0]?.run_id||"");let ie=!!(s.selectedRun&&X&&s.selectedRun.run_id===X);F&&(!s.selectedRun||s.selectedRun.run_id!==F||F===ee?.run_id||ie)?s.selectedRun=await V.benchmarkRun(F,!0):F||(s.selectedRun=null),s.loaded=!0,v()}catch(E){if(!s.loaded){s.renderSignature="";let X=a();X&&(X.innerHTML=Ce({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:r(E.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let E=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,w({refreshAll:E})}}},_=()=>{s.refreshStream||(s.refreshStream=ht("benchmark",(L,q)=>{s.loading||w({runs:q?.snapshot?.runs||null})}))},x=async L=>{try{s.selectedRun=await V.benchmarkRun(L,!0),v()}catch(q){I(q.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},S=async L=>{!s.labelTouched&&L.elements.label&&(L.elements.label.value=Ts());let q=n(L);s.config=q;let E=Number(L.elements.suite_id?.value||0);if(!E){I("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await V.startBenchmarkRun({suite_id:E,config:q,actor:"anonymous"}),I("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=Ts(),s.labelTouched=!1,await w()}catch(X){I(X.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},k=async L=>{try{await V.stopBenchmarkRun(L),I("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await w()}catch(q){I(q.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},D=async L=>{let q=Number(L.dataset.resultId||0),E=new FormData(L),X={};for(let ee of["correctness","grounding","citation","clarity","overall"]){let F=Number(E.get(`score_${ee}`));Number.isFinite(F)&&(X[ee]=F)}try{await V.reviewBenchmarkResult(q,{reviewer:"anonymous",scores:X,comment:String(E.get("comment")||"")}),I("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await V.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(q)),v()}catch(ee){I(ee.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},oe=async L=>{if(L)try{let q=await V.benchmarkFingerprintHistory(L,50);s.history[L]=q.cases||[];let E=s.selectedRun,X=a();if(!E||!X)return;let ee=(E.cases||[]).filter(F=>F.fingerprint===L);for(let F of ee){let ie=X.querySelector(`details.bench-case[data-result-id="${F.id}"]`);if(!ie)continue;let _e=ie.open;ie.innerHTML=Dn(F,s.history[L]),ie.open=_e,ie._benchSignature=In(F,s.history[L])}}catch(q){I(q.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},O=async L=>{let q=L.target.closest("[data-bench-action]");if(!q)return;let E=q.dataset.benchAction;E==="open-run"?await x(q.dataset.runId||""):E==="stop"?await k(q.dataset.runId||""):E==="fingerprint-history"&&await oe(q.dataset.fingerprint||"")},be=async L=>{let q=L.target.closest("[data-bench-form]");q&&(L.preventDefault(),q.dataset.benchForm==="run"?await S(q):q.dataset.benchForm==="human"&&await D(q))},fe=L=>{L&&(L.elements.label&&L.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=n(L),L.elements.suite_id&&(s.selectedSuiteId=Number(L.elements.suite_id.value)||s.selectedSuiteId))},W=L=>{let q=L.target.closest('[data-bench-form="run"]');q&&fe(q)};return e.addEventListener("click",O),e.addEventListener("submit",be),e.addEventListener("input",W),e.addEventListener("change",W),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=Ts();let L=a()?.querySelector('input[name="label"]');L&&(L.value=s.config.label)}_(),w({refreshAll:!s.referenceLoaded})},refresh(){return _(),w({refreshAll:!0})},destroy(){e.removeEventListener("click",O),e.removeEventListener("submit",be),e.removeEventListener("input",W),e.removeEventListener("change",W),s.refreshStream&&s.refreshStream(),s.refreshStream=null,s.tickTimer&&window.clearInterval(s.tickTimer)}}}var Jn={};rs(Jn,{exportCsv:()=>Ia,exportableResult:()=>Da,render:()=>Jc,renderReport:()=>Ra,reportError:()=>Pa,reportLoading:()=>Zs});var Pi=[10,25,50,100],Li=500,uc=["law_name","law_level","law_category","law_modified_date","article_count"],pc=["jid","court_normalized","title","jdate","matched_laws","citation_count"],mc={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function Ca(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function Na(e,t){let s={};for(let a of e.fields||[]){let n=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?n:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{},fuzzyTerms:[]}}function gc(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,n]of Object.entries(s))if(Array.isArray(n)&&!n.map(String).includes(String(t[a]??"")))return!1;return!0}function Qn(e,t){return(e.fields||[]).filter(s=>gc(s,t))}function fc(e,t){return`filter-${e.id}-${t}`}function vs(e){return e==null?"":r(String(e))}function Fn(e,t,s){let a=s[t.key],n=fc(e,t.key),i=t.help?`<span class="field-help">${r(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(p=>`<option value="${vs(p.value)}" ${String(p.value)===String(a??"")?"selected":""}>${r(p.label??p.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${n}" name="${r(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),p=(t.options||[]).map(f=>`<label class="multi-option">
          <input type="checkbox" name="${r(t.key)}" value="${vs(f.value)}" ${l.has(String(f.value))?"checked":""} />
          <span>${r(f.label??f.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${p}</div>
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
  </div>`}function ji(e,t,{focusTable:s=!1}={}){let a=Qn(e,t.values),n=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(n.push(`<div class="field-row">${Fn(e,o,t.values)}${Fn(e,l,t.values)}</div>`),i+=1):n.push(Fn(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
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
  </form>`}function Ea(e,t,s){let a={...s.values};for(let n of Qn(t,a))if(n.type==="checkbox"){let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=!!i?.checked}else if(n.type==="multiselect")a[n.key]=Array.from(e.querySelectorAll(`[name="${n.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=i?i.value:""}return a}function Ii(e,t){let s={};for(let a of Qn(e,t.values)){let n=t.values[a.key];a.type==="checkbox"?s[a.key]=!!n:a.type==="multiselect"?s[a.key]=Array.isArray(n)?n:[]:a.type==="number"?s[a.key]=n===""||n===null?"":Number(n):s[a.key]=n??""}return s}function On(e,t){let s=Ii(e,t);return Array.isArray(t.fuzzyTerms)&&t.fuzzyTerms.length&&(s.keywords=[...t.fuzzyTerms]),(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function bc(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${Ce({tone:t,title:`${Ca(e)} ${Ct(e.status).label}`,text:r(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function hc(e,t){return`<label class="field data-source-field">
    <span class="field-label">\u8CC7\u6599\u4F86\u6E90</span>
    <select class="select" name="database">
      ${e.map(s=>{let a=Ct(s.status);return`<option value="${r(s.id)}" ${s.id===t?"selected":""}>${r(s.label)} \xB7 ${r(a.label)}</option>`}).join("")}
    </select>
  </label>`}function Ti(e,t){return`<nav class="data-nav" aria-label="\u8CC7\u6599\u67E5\u8A62\u529F\u80FD">
    ${[{id:"law",label:"\u67E5\u8A62\u6CD5\u898F\u547D\u4EE4",hint:"Fuzzy \u6CD5\u898F\u540D\u7A31\u3001\u985E\u5225\u8207\u547D\u4EE4",icon:"file"},{id:"judgment",label:"\u67E5\u8A62\u5224\u6C7A",hint:"Fuzzy \u6CD5\u9662\u3001\u6848\u865F\u8207\u6848\u7531",icon:"layers"},{id:"schema",label:"\u8CC7\u6599\u5EAB Schema",hint:"\u8CC7\u6599\u8868\u3001\u6B04\u4F4D\u8207\u9810\u89BD",icon:"table"}].map(a=>{let n=a.id==="schema"?t==="schema":t==="query"&&e===a.id;return`<button class="data-nav-item${n?" is-active":""}" type="button"
          data-action="data-nav" data-tab="${a.id}" ${n?'aria-current="page"':""}>
          <span class="data-nav-icon">${g(a.icon,15)}</span>
          <span class="data-nav-copy">
            <strong>${r(a.label)}</strong>
            <small>${r(a.hint)}</small>
          </span>
        </button>`}).join("")}
  </nav>`}function vc(e,t,s){if(t.id!=="postgres"&&t.id!=="parquet")return"";let a=Array.isArray(s.fuzzyTerms)?s.fuzzyTerms:[],n=e==="law"?"Fuzzy \u6CD5\u898F\uFF0F\u547D\u4EE4":"Fuzzy \u5224\u6C7A",i=e==="law"?"\u8F38\u5165\u6CD5\u898F\u540D\u7A31\u6216\u76F8\u8FD1\u5B57\u2026":"\u8F38\u5165\u6CD5\u9662\u3001\u6848\u865F\u3001\u6848\u7531\u6216\u76F8\u8FD1\u5B57\u2026";return`<div class="data-fuzzy" data-data-fuzzy data-fuzzy-kind="${e}">
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
  </div>`}function $c(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||r(e.detail||"")}function yc(e){return`<div class="report-empty">
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
  </div>`}function Zs(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(Ca(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function Pa(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(Ca(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Ce({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${g("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function wc(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,n=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${r(s.label||"\u672A\u5206\u985E")}">${r(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${n.toFixed(1)}%"></span></span>
          <span class="dist-value">${d(a)}</span>
        </div>`}).join("")}
  </div>`}function Di(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function _c(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function kc(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function Sc(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${r(String(t))}"
    title="\u6AA2\u8996\u300C${r(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${r(String(t))}${g("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var xc={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function Ac(e,t,s,a=!1,n=!0,i=!1){let o=a?e.key:e.label||e.key,l=n?t?xc[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${r(o)}</th>`;let p=s?.key===l,f=p?s.direction:null,m=f==="asc"?"ascending":f==="desc"?"descending":"none",y=f==="asc"?"\u2191":f==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${m}">
    <button class="table-sort${p?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${r(l)}"
      title="\u4F9D${r(o)}\u6392\u5E8F">
      <span>${r(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${y}</span>
    </button>
  </th>`}function qc(e,t){if(!Di(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,n=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(n||""),lawName:String(t.law_name||"")}}function Mc(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${r(s.lawKey)}"
    data-law-source="${r(s.sourceType)}"
    data-law-name="${r(s.lawName)}"
    title="\u6AA2\u8996\u300C${r(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(String(a))}${g("chevronRight",12,"law-link-icon")}</button>`}function Bi(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:n=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],p=(e.page-1)*e.page_size,f=Di(e),m=_c(e),y=kc(e),b=e.meta?.sort||null,u=n?`<tr class="schema-search-row">
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
      <span class="muted" style="font-size:10px">${d(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${f?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":m?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":y?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${u}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(v=>Ac(v,m,b,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((v,w)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${p+w+1}</td>
                ${o.map(_=>{if((m||y)&&_.key==="jid")return`<td class="cell-jid">${Sc(v)}</td>`;let x=f&&_.key==="law_name"?qc(e,v):null;if(x)return`<td>${Mc(v,_,x)}</td>`;let k={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[_.type];return`<td${k?` class="${k}"`:""}>${ha(v[_.key],_.type||"text")}</td>`}).join("")}
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
    </div>`}function Lc(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${d(i)}\u2013${d(o)} / ${d(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Pi.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${g("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${g("chevronRight",13)}</button>
    </div>
  </div>`}function Fi(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${r(t)}</div>`).join("")}</div>`}function Ra(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],n=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",p=e.status||"ok",f=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${r(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${r(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${r(e.label||l)}
          ${Je(p)}
          <span class="chip">${r(f)}</span>
        </div>
        <div class="report-sub">
          ${d(i)} \u7B46\u7B26\u5408 \xB7
          ${ue(e.duration_ms)} \xB7
          ${r(String(l).toUpperCase())} / ${r(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${g("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${g("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${Ce({tone:p==="not_configured"?"info":p==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:""}

    ${a.length?`<div class="summary-strip">
            ${a.slice(0,4).map(m=>`<div class="summary-item">
                  <div class="summary-label">${r(m.label)}</div>
                  <div class="summary-value">${r(m.value)}</div>
                </div>`).join("")}
          </div>`:""}

    <div class="report-grid">
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u7D50\u679C\u5206\u5E03</span>
          <span class="muted" style="font-size:9.5px">${n.length} groups</span>
        </div>
        ${wc(n)}
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
        ${Fi(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?Bi(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?Lc({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function Ni(e){return`<div class="report-card schema-preview">
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
  </div>`}function zn(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let n=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${Ce({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${r(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${r(t||e.table||"\u8CC7\u6599\u8868")}
          ${Je(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${r(String(e.database||""))} / ${r(String(e.table||"\u2014"))} \xB7 ${n.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${Bi({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${Fi(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${d(i.length)} \u7B46</span>
      <strong>\u5171 ${d(e.total)} \u7B46</strong>
    </div>
  </div>`}function Ei(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${r(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${Ce({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function jc(e){return`<div class="report-empty">
    ${ct({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${Ca(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function Gn(e){return e.is_current===!0?Je("ok","\u73FE\u884C"):e.law_abandon_note?Je("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?Je("empty","\u6B77\u53F2\u7248\u672C"):Je("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function st(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${r(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function $s(e){return e?Rt(e):"\u2014"}function Tc(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function Un(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${r(e)}</span>
    </div>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </div>`:""}function Nc(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${r(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${g("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </details>`:""}function Ec(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let n=a?.name||a?.url||"";return n?a.url?`<a class="law-attachment" href="${r(a.url)}" target="_blank" rel="noopener noreferrer">
          ${g("file",12)}<span>${r(n)}</span>${g("external",11)}
        </a>`:`<span class="law-attachment">${g("file",12)}<span>${r(n)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${d(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function Oi(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Rc(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,n=s?`${d(a)} \u689D \xB7 ${d(s)} \u7AE0\u7BC0`:`${d(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${r(l)}</div>`;let p=mc[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${r(Oi(o.article_no))}">
        <div class="law-article-head">
          <span class="law-article-no">${r(o.article_no||"\u689D\u6587")}</span>
          ${p&&p!=="\u689D\u6587"?`<span class="chip">${r(p)}</span>`:""}
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
  </div>`}function Cc(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function Ns(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${g("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function Pc(e){return`<div class="law-report">
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
  </div>`}function Ic(e,t){return`<div class="law-report">
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
        ${Ce({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function Dc(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let n=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",n,a.article_count_for_law?`${d(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${r(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${r(i)}</option>`}).join("")}
    </select>
  </label>`}function Bc(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let n={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${n[o]} ${d(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">\u7248\u672C\u8B8A\u66F4</span>
      <span class="muted">${r(i)}</span>
    </summary>
    <div class="law-version-change-list">
      ${a.length?a.slice(0,20).map(o=>{let l=o.change_type==="added"?"badge-ok":o.change_type==="removed"?"badge-danger":"badge-warn",p=o.before_content?`<details><summary>\u8B8A\u66F4\u524D</summary><pre>${r(o.before_content)}</pre></details>`:"",f=o.after_content?`<details><summary>\u8B8A\u66F4\u5F8C</summary><pre>${r(o.after_content)}</pre></details>`:"";return`<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${l}">${r(n[o.change_type]||o.change_type)}</span>
                    <strong>${r(o.article_no||o.article_key)}</strong>
                  </div>
                  ${p}${f}
                </div>`}).join(""):'<div class="report-empty-inline">\u6B64\u7248\u672C\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u8B8A\u66F4\u3002</div>'}
      ${e.changes_truncated?'<div class="report-empty-inline">\u50C5\u986F\u793A\u524D 20 \u7B46\u8B8A\u66F4\uFF1BAPI \u56DE\u50B3\u4E0A\u9650 200 \u7B46\u3002</div>':""}
    </div>
  </details>`}function Fc(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let n=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(w=>w.article_type!=="C").length,l=Tc(e),p=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",f=e.meta?.snapshot||"",m=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",y=[l,p,m,f].filter(Boolean).join(" \xB7 "),b=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",u=e.version||{},v=[st("\u6CD5\u898F\u4F4D\u968E",r(e.law_level||"\u2014")),st("\u6CD5\u898F\u985E\u5225",r(e.law_category||"\u2014")),st("\u7570\u52D5\u65E5\u671F",$s(e.law_modified_date)),st("\u751F\u6548\u65E5\u671F",$s(e.law_effective_date)),st("\u689D\u6587\u6578",d(e.article_count)),st("\u8CC7\u6599\u72C0\u614B",Gn(e)),st("\u82F1\u8B6F\u540D\u7A31",r(e.eng_law_name||"\u2014")),st("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${r(e.law_key||"\u2014")}</span>`)];return u.first_seen_version_id!==null&&u.first_seen_version_id!==void 0&&v.push(st("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${r(u.first_seen_version_id)}`)),u.last_seen_version_id!==null&&u.last_seen_version_id!==void 0&&v.push(st("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${r(u.last_seen_version_id)}`)),u.last_seen_at&&v.push(st("\u6700\u5F8C\u6536\u9304\u6642\u9593",r(ye(u.last_seen_at)))),u.selected_version_id!==null&&u.selected_version_id!==void 0&&v.push(st("\u689D\u6587\u7248\u672C",`#${r(u.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${Ns()}
      <span class="law-report-origin" title="${r(y)}">${r(y)}</span>
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
          ${Dc(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">${g("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${n.length?`<div class="report-alert">${Ce({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n.map(w=>r(w)).join("<br />")})}</div>`:""}

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
        <div class="law-meta-grid">${v.join("")}</div>
      </div>

      ${Bc(e)}
      ${Un("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${Nc("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${Un("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${Un("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${Ec(e.attachments)}
      ${Rc(e)}
    </div>
    ${o>100?Cc():""}
  </div>`}function Oc(e){return`<div class="law-report judgment-report">
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
  </div>`}function Hc(e,t){return`<div class="law-report judgment-report">
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
        ${Ce({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function zc(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${r(t)}"
    data-law-source=""
    data-law-name="${r(t)}"
    title="\u6AA2\u8996\u300C${r(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(t)}${g("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function Gc(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let n=String(s.article_no||"").trim();n&&t.get(a).add(n)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${zc(s)}
          <span class="judgment-citation-articles">${[...a].map(n=>r(n)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function Uc(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",n=String(e.full_text||""),i=Number(e.full_text_length)||n.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[st("\u6848\u865F",r(e.jid||"\u2014")),st("\u5E74\u5EA6",r(e.jyear||"\u2014")),st("\u5B57\u5225",r(e.jcase||"\u2014")),st("\u865F\u78BC",r(e.jno||"\u2014")),st("\u6CD5\u9662",r(e.court||"\u2014")),st("\u6848\u7531",r(e.title||"\u2014")),st("\u88C1\u5224\u65E5\u671F",$s(e.jdate)),st("\u4F86\u6E90\u58D3\u7E2E\u6A94",r(e.source_archive||"\u2014")),st("\u5168\u6587\u9577\u5EA6",`${d(i)} \u5B57`),st("\u5F15\u7528\u6578",d(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(st("\u532F\u5165 Run",`#${r(e.import_run_id)}`)),`<div class="law-report judgment-report">
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
        ${Gc(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${d(i)} \u5B57</span>
        </div>
        ${n?`<div class="judgment-fulltext">${r(n)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function Ri(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function Ia(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(Ri).join(",")],n=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([n+o+1,...t.map(l=>i[l.key])].map(Ri).join(","))}),`\uFEFF${a.join(`\r
`)}`}function Da(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,n]of Object.entries(t))a.startsWith("_")||(s[a]=n);return s})}}function Qc(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function Ci(e,t){let s=performance.now(),a=Ii(e,t),n=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,p=[],f=[],m=[],y=[];if(n==="audit_events"){try{let k=Number(await ds("audit.last_event_id",0))||0,D=await V.versioningAudit({since_id:k,limit:500}),oe=Array.isArray(D?.events)?D.events:[];oe.length&&await pi(oe.map(be=>({...be,dataset:"judgment"})));let O=Number(D?.latest_event_id||0);O>k&&await Ys("audit.last_event_id",O)}catch(k){p.push(`\u7248\u672C audit \u540C\u6B65\u5931\u6557\uFF1A${k.message||k}`)}f=(await mi({keyword:i,limit:Li})).map(k=>({created_at:k.created_at,dataset:k.dataset,issue_month:k.issue_month,change_type:k.change_type,jid:k.jid,detail:k.detail})),m=[{key:"created_at",label:"\u6642\u9593",type:"datetime"},{key:"dataset",label:"\u8CC7\u6599\u96C6",type:"text"},{key:"issue_month",label:"\u6708\u4EFD",type:"mono"},{key:"change_type",label:"\u8B8A\u66F4",type:"status"},{key:"jid",label:"\u6848\u865F",type:"mono"},{key:"detail",label:"\u6458\u8981",type:"longtext"}];let S=new Map;f.forEach(k=>S.set(k.change_type||"unknown",(S.get(k.change_type||"unknown")||0)+1)),y=Array.from(S.entries()).map(([k,D])=>({label:k,value:D})).sort((k,D)=>D.value-k.value)}else if(n==="settings"){f=(await fi({keyword:i})).map(k=>({key:k.key,value:bi(k.value),updated_at:k.updated_at})),m=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let S=new Map;f.forEach(k=>{let D=String(k.key||"").split(".")[0]||"\u5176\u4ED6";S.set(D,(S.get(D)||0)+1)}),y=Array.from(S.entries()).map(([k,D])=>({label:k,value:D})).sort((k,D)=>D.value-k.value)}else{f=(await Ma({keyword:i,limit:Li})).map(k=>({kind:Qc(k.kind),title:k.title,detail:k.detail,created_at:k.created_at})),m=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let S=new Map;f.forEach(k=>S.set(k.kind,(S.get(k.kind)||0)+1)),y=Array.from(S.entries()).map(([k,D])=>({label:k,value:D})).sort((k,D)=>D.value-k.value)}let b=f.length,u=(o-1)*l,v=f.slice(u,u+l),w=Math.round(performance.now()-s),_=ci();return _&&p.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:_?"degraded":"ok",message:_?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:n,columns:m,rows:v,total:b,page:o,page_size:l,duration_ms:w,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(b)},{label:"\u76EE\u524D\u9801\u9762",value:`${v.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:Vs()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${w} ms`}],distribution:y,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${n}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${u}`,warnings:p,meta:{store:n,filters:a,client_side:!0}}}async function Jc(e,t){let s=!1,a=null,n=[],i="law",o=null,l={},p=0,f=25,m="query",y=null,b=null,u=0,v=[],w=null,_=-1,x=0,S=0,k=null,D=null,oe=null;e.innerHTML=`<section class="page data-page">
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
  </section>`;let O=e.querySelector("#query-sidebar"),be=e.querySelector("#data-nav"),fe=e.querySelector("#db-options-wrap"),W=e.querySelector("#filter-area"),L=e.querySelector("#schema-area"),q=e.querySelector("#query-main"),E=e.querySelector("#schema-suggest-popover"),X=e.querySelector("#catalog-meta"),ee=e.querySelector("#refresh-catalog"),F=e.querySelector("#data-judgment-stats"),ie=A=>n.find(N=>N.id===A),_e=()=>ie(i)?.databases||[],z=A=>_e().find(N=>N.id===A),ve=(A,N)=>`${A}:${N}`,Z=(A,N=i)=>l[ve(N,A.id)],Se=(A,N)=>{Ys(A,N).catch(()=>{})},pe=()=>{if(!a){X.textContent="CATALOG \xB7 \u96E2\u7DDA",X.className="badge badge-danger badge-mono";return}let A=_e(),N=A.filter(H=>H.available).length,R=ie(i);X.textContent=`CATALOG \xB7 ${R?.label||i} \xB7 ${N}/${A.length} \u53EF\u7528`,X.className="badge badge-neutral badge-mono"},K=A=>{q.innerHTML=yc(A)},re=()=>{let A=D?.returnScroll??oe?.returnScroll;D=null,oe=null;let N=z(o),R=N?Z(N):null;m==="schema"&&b?.result?q.innerHTML=zn(b.result,Ee(N,b.tableId),{columnFilters:b.columnFilters||{},searchEnabled:N.id==="postgres"||N.id==="parquet"}):R?.result?q.innerHTML=Ra(R.result):N&&K(N),typeof A=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:A,behavior:"smooth"}))},me=(A="law-article-jump")=>{let N=q.querySelector(`#${A}`),R=Oi(N?.value);if(!R){I("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),N?.focus();return}let Y=[...q.querySelectorAll("[data-article-no]")].find(ae=>ae.dataset.articleNo===R);if(!Y){I(`\u627E\u4E0D\u5230\u7B2C ${R} \u689D\u3002`,"warn");return}Y.scrollIntoView({behavior:"instant",block:"center"}),Y.classList.add("is-jump-target"),window.setTimeout(()=>Y.classList.remove("is-jump-target"),2400)},he=async({lawKey:A,sourceType:N="",lawName:R="",versionId:H=""})=>{let Y=z(o),ae=Y?Z(Y):null,ce=m==="schema"?b?.result:null;if(!Y||!ae?.result&&!ce||!A)return;let Te=++p;D={seq:Te,lawKey:A,sourceType:N,lawName:R,versionId:H?String(H):"",page:1,detail:null,database:Y.id,returnScroll:window.scrollY},oe=null,q.innerHTML=Pc(R||A),q.scrollIntoView({behavior:"smooth",block:"start"});try{let Pe=await V.lawDetail(A,N,D.versionId);if(s||!D||D.seq!==Te)return;D.detail=Pe,D.page=1,q.innerHTML=Fc(Pe,{database:D.database,lawPage:D.page})}catch(Pe){if(s||!D||D.seq!==Te)return;q.innerHTML=Ic(Pe,R||A),I(Pe.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},ke=async({jid:A})=>{let N=z(o),R=N?Z(N):null,H=m==="schema"?b?.result:null;if(!N||!R?.result&&!H||!A)return;let Y=++p;D=null;let ae=N.id==="parquet"?"parquet":"postgres";oe={seq:Y,jid:A,detail:null,database:N.id,source:ae,returnScroll:window.scrollY},q.innerHTML=Oc(A),q.scrollIntoView({behavior:"smooth",block:"start"});try{let ce=await V.judgmentDetail(A,ae);if(s||!oe||oe.seq!==Y)return;oe.detail=ce,q.innerHTML=Uc(ce,{database:oe.database})}catch(ce){if(s||!oe||oe.seq!==Y)return;q.innerHTML=Hc(ce,A),I(ce.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},xe=(A,N)=>`${i}:${A.id}:${N}`,Ee=(A,N)=>(A.tables||[]).find(R=>R.id===N)?.label||N,Oe=(A,N,{sort:R=null,columnFilters:H={}}={})=>{let Y={column_filters:H};return A.id==="postgres"?(Y.table=N,Y.schema_preview=!0):A.id==="parquet"&&i==="judgment"?(Y.table="judgment_documents",Y.columns=pc):A.id==="parquet"&&(Y.dataset="all",Y.columns=uc),R?.key&&(Y.sort=`${R.key}:${R.direction}`),Y},P=async(A,N,{sort:R=null,columnFilters:H={},quiet:Y=!1}={})=>{if(!N)return;mt();let ae=xe(A,N),ce=++u,Te=!!(Y&&b?.result&&b.key===ae);y={tableId:N},b={key:ae,tableId:N,loading:!0,result:null,error:null,sort:R,columnFilters:H},Te?q.setAttribute("aria-busy","true"):(L.innerHTML=Hn(A,ie(i)?.label||i,N),q.innerHTML=Ni(Ee(A,N)));try{let Pe;if(A.id==="indexeddb"){let Ne=Na(A,10);Ne.values.store=N,Ne.page=1,Pe=await Ci(A,Ne)}else A.id==="qdrant"?Pe={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:N,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(Pe=await V.query({database:A.id,filters:Oe(A,N,{sort:R,columnFilters:H}),page:1,pageSize:10}),R?.key&&(Pe.meta={...Pe.meta||{},sort:R}));if(s||ce!==u)return;b={key:ae,tableId:N,loading:!1,result:Pe,error:null,sort:R,columnFilters:H},q.removeAttribute("aria-busy"),m==="schema"&&y?.tableId===N&&(L.innerHTML=Hn(A,ie(i)?.label||i,N),q.innerHTML=zn(Pe,Ee(A,N),{columnFilters:H,searchEnabled:A.id==="postgres"||A.id==="parquet"}))}catch(Pe){if(s||ce!==u)return;b={key:ae,tableId:N,loading:!1,result:null,error:Pe,sort:R,columnFilters:H},q.removeAttribute("aria-busy"),m==="schema"&&y?.tableId===N&&(q.innerHTML=Ei(Pe,Ee(A,N)))}},U=()=>{let A=z(o);if(!A)return null;if(m==="schema"&&b?.result)return{db:A,tableId:b.tableId,columnFilters:b.columnFilters||{},sort:b.sort||null,mode:"schema"};let N=A?Z(A):null,R=N?.result;return R&&(A.id==="postgres"||A.id==="parquet")?{db:A,tableId:R.table,columnFilters:N.columnFilters||{},sort:N.sort||null,mode:"query"}:null},j=(A,N,R)=>{if(!A)return;let H=`${A.db.id}:${A.tableId}:${N}`,Y=B.get(H);Y&&(window.clearTimeout(Y),B.delete(H)),mt();let ae={...A.columnFilters||{}},ce=String(R||"").trim();if(ce?ae[N]=ce:delete ae[N],A.mode==="schema"){P(A.db,A.tableId,{sort:A.sort,columnFilters:ae,quiet:!0});return}let Te=Z(A.db);Te.columnFilters=ae,Te.page=1,Xe(1)},B=new Map,te=()=>{(!E||E.hidden)&&!v.length&&!w||(x+=1,v=[],w=null,_=-1,E&&(E.hidden=!0,E.innerHTML=""))},G=(A,N)=>{let R=String(A||""),H=R.toLocaleLowerCase(),Y=String(N||"").toLocaleLowerCase(),ae=new Array(R.length).fill(!1),ce=(Fe,tt)=>{for(let rt=Fe;rt<Fe+tt;rt+=1)rt>=0&&rt<ae.length&&(ae[rt]=!0)},Te=H.indexOf(Y);if(Te>=0)for(;Te>=0;)ce(Te,Y.length),Te=H.indexOf(Y,Te+Y.length);else{let Fe=[];for(let tt of Y.match(/[一-鿿]{2,}/g)||[])for(let rt=0;rt<tt.length-1;rt+=1)Fe.push(tt.slice(rt,rt+2));Fe.push(...Y.match(/[a-z0-9]+/g)||[]);for(let tt of Fe){let rt=H.indexOf(tt);for(;rt>=0;)ce(rt,tt.length),rt=H.indexOf(tt,rt+tt.length)}}let Pe="",Ne=0;for(;Ne<R.length;)if(ae[Ne]){let Fe=Ne;for(;Fe<R.length&&ae[Fe];)Fe+=1;Pe+=`<mark>${r(R.slice(Ne,Fe))}</mark>`,Ne=Fe}else{let Fe=Ne;for(;Fe<R.length&&!ae[Fe];)Fe+=1;Pe+=r(R.slice(Ne,Fe)),Ne=Fe}return Pe||r(R)},Re=(A,N)=>{if(!E)return;let R=A.getBoundingClientRect(),H=Math.min(420,Math.max(220,R.width)),Y=Math.min(360,34+N*30),ae=R.bottom+4;ae+Y>window.innerHeight-8&&(ae=Math.max(8,R.top-Y-4));let ce=Math.min(window.innerWidth-H-8,Math.max(8,R.left));E.style.width=`${H}px`,E.style.left=`${ce}px`,E.style.top=`${ae}px`},Le=A=>{if(!E)return;let N=[...E.querySelectorAll(".schema-suggest-item")];N.length&&(_=Math.max(0,Math.min(N.length-1,A)),N.forEach((R,H)=>{R.classList.toggle("is-active",H===_)}),N[_].scrollIntoView({block:"nearest"}))},Ie=A=>{let N=v[A],R=w;!N||!R||(te(),j(R,R.column,N))},Qe=async(A,N,R,H)=>{if(!A||!R.trim()){te();return}let Y=++x;w={...A,column:N,input:H},_=-1;try{let ae=await V.schemaSuggest({database:A.db.id,table:A.tableId,column:N,query:R,limit:1e3});if(Y!==x||document.activeElement!==H||!E)return;let ce=Array.isArray(ae.values)?ae.values:[];if(v=ce,!ce.length){te();return}let Te=Number(ae.total)>ce.length?`\u5171 ${d(ae.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${d(ce.length)} \u500B`:`\u5171 ${d(ae.total)} \u500B\u7B26\u5408`;E.innerHTML=`<div class="schema-suggest-head">${r(Te)}</div>${ce.map((Pe,Ne)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${Ne}"
            title="${r(Pe)}">${G(Pe,R)}</button>`).join("")}`,Re(H,ce.length),E.hidden=!1}catch{te()}},mt=()=>{let A=document.activeElement;A instanceof HTMLElement&&A.matches("[data-schema-search]")&&A.blur(),te()},de=(A,{resetReport:N=!1}={})=>{mt();let R=Z(A);if(be.innerHTML=Ti(i,m),fe.innerHTML=hc(_e(),A.id),m==="schema")W.hidden=!0,W.innerHTML="",L.hidden=!1,L.innerHTML=`<div class="schema-category-switch" role="tablist" aria-label="Schema \u985E\u5225">
        ${["law","judgment"].map(H=>{let Y=n.find(ae=>ae.id===H);return Y?`<button class="chip${i===H?" is-active":""}" type="button" role="tab" aria-selected="${i===H}" data-action="schema-category" data-category="${H}">${r(Y.label)}</button>`:""}).join("")}
      </div>${Hn(A,ie(i)?.label||i,y?.tableId||"")}`;else{L.hidden=!0,L.innerHTML="",W.hidden=!1;let H=vc(i,A,R),Y=ji(A,R);W.innerHTML=`${bc(A)}${H?`${H}<details class="data-advanced"><summary>\u9032\u968E metadata \u689D\u4EF6</summary>${Y}</details>`:Y}<div class="sidebar-note">${$c(A)}</div>`}if(pe(),m==="schema"){let H=y?xe(A,y.tableId):"";if(b&&b.key===H){let Y=Ee(A,b.tableId);b.loading?q.innerHTML=Ni(Y):b.error?q.innerHTML=Ei(b.error,Y):q.innerHTML=zn(b.result,Y,{columnFilters:b.columnFilters||{},searchEnabled:A.id==="postgres"||A.id==="parquet"})}else q.innerHTML=jc(A);return}N?K(A):R.result?q.innerHTML=Ra(R.result):K(A)},We=(A,{persist:N=!0,resetReport:R=!1}={})=>{let H=_e(),Y=H.find(ce=>ce.id===A)||H[0];if(!Y)return;D=null,oe=null,y=null,b=null,u+=1,o=Y.id;let ae=ve(i,Y.id);l[ae]||(l[ae]=Na(Y,f)),de(Y,{resetReport:R}),N&&(Se(`data.last_database.${i}`,Y.id),Se("data.last_category",i))},nt=(A,{persist:N=!0,resetReport:R=!0,databaseId:H=null}={})=>{let Y=ie(A)||n[0];if(!Y)return;i=Y.id,D=null,oe=null;let ae=Y.databases||[],ce=H&&ae.find(Te=>Te.id===H)||ae.find(Te=>Te.id===o)||ae[0];if(o=ce?.id||null,!ce){be.innerHTML=Ti(i,m),fe.innerHTML=`<div class="sidebar-notice">${Ce({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,W.innerHTML="",pe();return}We(ce.id,{persist:!1,resetReport:R}),N&&(Se("data.last_category",Y.id),Se(`data.last_database.${Y.id}`,ce.id))},gt=A=>{let N=Z(A),R=W.querySelector("#data-filter-form");R&&(N.values=Ea(R,A,N))},Xe=async(A=null,{quiet:N=!1}={})=>{let R=z(o);if(!R)return;mt();let H=Z(R);gt(R),A!==null&&(H.page=A),(!Number.isFinite(H.page)||H.page<1)&&(H.page=1);let Y=++p;D=null,oe=null;let ae=q.querySelector(".report-card"),ce=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!ae?q.setAttribute("aria-busy","true"):(q.removeAttribute("aria-busy"),q.innerHTML=Zs(R));let Pe=W.querySelector("#run-query");N||Me(Pe,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Ne;if(R.id==="indexeddb"?Ne=await Ci(R,H):Ne=await V.query({database:R.id,filters:On(R,H),page:H.page,pageSize:H.pageSize}),s||Y!==p)return;if(Ne.meta={...Ne.meta||{},column_filters:H.columnFilters||{},searchable:R.id==="postgres"||R.id==="parquet",sort:H.sort||Ne.meta?.sort||null},H.result=Ne,H.page=Number(Ne.page)||H.page,H.pageSize=Number(Ne.page_size)||H.pageSize,q.removeAttribute("aria-busy"),q.innerHTML=Ra(Ne),ce!==null){let tt=q.querySelector("[data-page-size]");tt&&(tt.value=String(H.pageSize),tt.focus({preventScroll:!0}))}let Fe=ie(i)?.label||i;await Ws({kind:"data",title:`${Fe} \xB7 ${R.label} \xB7 ${Ne.table||Ne.label||"query"}`,detail:`${d(Ne.total)} \u7B46 \xB7 ${ue(Ne.duration_ms)}`,payload:{category:i,database:R.id,filters:On(R,H),page:H.page,page_size:H.pageSize}}),Se("data.last_query",{category:i,database:R.id,filters:On(R,H),page:H.page,page_size:H.pageSize,at:new Date().toISOString()})}catch(Ne){if(s||Y!==p)return;q.removeAttribute("aria-busy"),q.innerHTML=Pa(Ne,R),I(Ne.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&Y===p&&Me(Pe,!1)}},et=(A,N)=>{let R=A?.querySelector("[data-data-fuzzy-results]");R&&(R.innerHTML=N.length?N.map(H=>`<button class="data-fuzzy-option" type="button" role="option" data-action="select-fuzzy-term" data-term="${r(H.value)}"><span>${r(H.label||H.value)}</span><small>${r(H.meta||"")}</small></button>`).join(""):'<div class="data-fuzzy-empty">\u6C92\u6709\u76F8\u8FD1\u7D50\u679C\uFF1B\u6309 Enter \u53EF\u76F4\u63A5\u52A0\u5165\u76EE\u524D\u8F38\u5165\u7684\u95DC\u9375\u5B57\u3002</div>')},ft=async(A,N="")=>{if(!A)return;let R=z(o),H=R?Z(R):null;if(!H)return;let Y=A.dataset.fuzzyKind||i,ae=A.querySelector("[data-data-fuzzy-results]"),ce=++S;ae&&(ae.innerHTML='<div class="data-fuzzy-loading"><span class="spinner"></span><span>\u641C\u5C0B\u76F8\u8FD1\u7D50\u679C\u2026</span></div>');try{let Te=await V.dataSuggest({kind:Y,query:N,limit:12});if(ce!==S)return;let Pe=(Te.suggestions||[]).filter(Ne=>!H.fuzzyTerms.includes(Ne.value));et(A,Pe)}catch(Te){if(ce!==S)return;ae&&(ae.innerHTML=`<div class="data-fuzzy-empty">${r(Te.message||"\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},se=(A,{focus:N=!1}={})=>{if(!A)return;let R=A.querySelector("[data-data-fuzzy-popover]"),H=A.querySelector("[data-data-fuzzy-search]");!R||!H||(R.hidden&&(R.hidden=!1,H.value="",ft(A,"")),N&&(H.focus(),H.select()))},$e=A=>{k&&(window.clearTimeout(k),k=null);let N=A?.querySelector("[data-data-fuzzy-popover]");N&&(N.hidden=!0)},ze=async A=>{let N=z(o);if(!N)return;let R=Z(N),H=String(A||"").trim();!H||R.fuzzyTerms.includes(H)||(R.fuzzyTerms=[...R.fuzzyTerms,H],$e(W.querySelector("[data-data-fuzzy]")),de(N),await Xe(1))},Ge=async A=>{let N=z(o);if(!N)return;let R=Z(N),H=String(A||"").trim();R.fuzzyTerms=R.fuzzyTerms.filter(Y=>Y!==H),de(N),await Xe(1)},at=async()=>{ee.disabled=!0,Me(ee,!0,"\u6574\u7406\u4E2D\u2026");try{let[A,N,R,H,Y]=await Promise.all([V.catalog(),ds("data.last_category","law"),ds("data.last_database.law","postgres"),ds("data.last_database.judgment","postgres"),ds("data.page_size",25)]);if(s)return;a=A,F&&(F.innerHTML=Vt(a.judgment_stats)),n=Array.isArray(a.categories)?a.categories:[],f=Pi.includes(Number(Y))?Number(Y):25;for(let Ne of n)for(let Fe of Ne.databases||[]){let tt=ve(Ne.id,Fe.id);l[tt]||(l[tt]=Na(Fe,f))}let ae=n.find(Ne=>Ne.id===N)||n[0];if(!ae){be.innerHTML="",fe.innerHTML=`<div class="sidebar-notice">${Ce({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let ce=ae.id==="judgment"?H:R;if(i=ae.id,o=null,nt(ae.id,{persist:!1,resetReport:!0,databaseId:ce}),s)return;let Te=z(o),Pe=Te?Z(Te):null;Te&&Pe&&m==="query"&&!Pe.result&&(Te.id==="postgres"||Te.id==="parquet")&&Xe(1),I("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(A){if(s)return;a=null,n=[],be.innerHTML="",F&&(F.innerHTML=Vt(null)),pe(),fe.innerHTML=`<div class="sidebar-notice">${Ce({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:r(A.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${g("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,q.innerHTML=`<div class="report-empty">${ct({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(ee.disabled=!1,Me(ee,!1))}};O.addEventListener("change",A=>{let N=A.target;if(N.name==="category"){nt(N.value);return}if(N.name==="database"){We(N.value);let ae=z(o),ce=ae?Z(ae):null;ae&&ce&&!ce.result&&m==="query"&&(ae.id==="postgres"||ae.id==="parquet")&&Xe(1);return}let R=z(o);if(!R)return;let H=Z(R),Y=W.querySelector("#data-filter-form");!Y||!N.name||(H.values=Ea(Y,R,H),H.page=1,N.name==="table"&&(D=null,oe=null,H.sort=null,H.columnFilters={},H.result=null,W.innerHTML=ji(R,H),K(R)))}),O.addEventListener("input",A=>{let N=A.target.closest("[data-data-fuzzy-search]");if(N){let ae=N.closest("[data-data-fuzzy]");k&&window.clearTimeout(k),k=window.setTimeout(()=>{ft(ae,N.value)},160);return}let R=z(o);if(!R)return;let H=W.querySelector("#data-filter-form");if(!H||!A.target.name||A.target.name==="table")return;let Y=Z(R);Y.values=Ea(H,R,Y)}),O.addEventListener("keydown",A=>{let N=A.target.closest("[data-data-fuzzy-search]");if(!N)return;let R=N.closest("[data-data-fuzzy]");if(A.key==="Escape")A.preventDefault(),$e(R),N.blur();else if(A.key==="Enter"){A.preventDefault();let H=R?.querySelector("[data-action='select-fuzzy-term']");H?H.click():ze(N.value)}else A.key==="ArrowDown"&&(A.preventDefault(),R?.querySelector("[data-action='select-fuzzy-term']")?.focus())}),O.addEventListener("mouseover",A=>{let N=A.target.closest("[data-action='open-fuzzy']");N&&se(N.closest("[data-data-fuzzy]"))}),O.addEventListener("mouseout",A=>{let N=A.target.closest("[data-data-fuzzy]");N&&(A.relatedTarget&&N.contains(A.relatedTarget)||$e(N))}),O.addEventListener("submit",A=>{A.target.id==="data-filter-form"&&(A.preventDefault(),Xe(1))}),O.addEventListener("click",async A=>{let N=W.querySelector("[data-data-fuzzy] [data-data-fuzzy-popover]:not([hidden])")?.closest("[data-data-fuzzy]");N&&!A.target.closest("[data-data-fuzzy]")&&$e(N);let R=A.target.closest("[data-action]"),H=R?.dataset.action;if(H==="data-nav"){let Y=R.dataset.tab,ae=z(o);if(Y==="schema"){if(m!=="schema"){if(ae){let Ne=Z(ae),Fe=W.querySelector("#data-filter-form");Fe&&(Ne.values=Ea(Fe,ae,Ne))}m="schema",ae&&de(ae)}return}let ce=Y==="judgment"?"judgment":"law";m==="schema"&&(m="query"),i!==ce?nt(ce,{databaseId:o,resetReport:!1}):ae&&de(ae);let Te=z(o),Pe=Te?Z(Te):null;Te&&Pe&&!Pe.result&&(Te.id==="postgres"||Te.id==="parquet")&&Xe(1);return}if(H==="open-fuzzy"){se(R.closest("[data-data-fuzzy]"),{focus:!0});return}if(H==="select-fuzzy-term"){await ze(R.dataset.term);return}if(H==="remove-fuzzy-term"){await Ge(R.dataset.term);return}if(H==="schema-category"){m="schema",nt(R.dataset.category||"law",{resetReport:!0});return}if(H==="select-schema-table"){let Y=z(o);if(!Y)return;P(Y,R.dataset.tableId||"");return}if(H==="reset"){let Y=z(o);if(!Y)return;D=null,oe=null;let ae=Z(Y);l[ve(i,Y.id)]=Na(Y,ae.pageSize),de(Y),K(Y),I("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}A.target.closest("#catalog-retry")&&at()}),q.addEventListener("input",A=>{let N=A.target.closest("[data-schema-search]");if(!N)return;let R=U();if(!R)return;let H=N.dataset.schemaSearch||"",Y=N.value,ae=`${R.mode}:${R.db.id}:${R.tableId}:${H}`,ce=B.get(ae);if(ce&&window.clearTimeout(ce),!Y.trim()){B.delete(ae),te(),j(R,H,"");return}let Te=window.setTimeout(()=>{B.delete(ae),Qe(R,H,Y,N)},250);B.set(ae,Te)}),q.addEventListener("keydown",A=>{let N=A.target.closest("[data-schema-search]");if(!N)return;let R=U();if(R){if(A.key==="Escape"){te();return}if(A.key==="ArrowDown"||A.key==="ArrowUp"){if(!E||E.hidden)return;A.preventDefault();let H=A.key==="ArrowDown"?1:-1;Le(_<0?H>0?0:v.length-1:_+H);return}if(A.key==="Enter"){if(A.preventDefault(),E&&!E.hidden&&_>=0){Ie(_);return}j(R,N.dataset.schemaSearch||"",N.value)}}}),E?.addEventListener("mousedown",A=>{A.preventDefault()}),E?.addEventListener("click",A=>{let N=A.target.closest("[data-schema-suggest-index]");N&&Ie(Number(N.dataset.schemaSuggestIndex))});let Tt=A=>{A.target.closest("[data-schema-search]")||E?.contains(A.target)||te()};return document.addEventListener("click",Tt),window.addEventListener("scroll",te,{capture:!0,passive:!0}),window.addEventListener("resize",te),q.addEventListener("keydown",A=>{A.target.matches(".law-jump-input")&&A.key==="Enter"&&(A.preventDefault(),me(A.target.id))}),q.addEventListener("click",async A=>{let N=A.target.closest("[data-action]");if(!N)return;let R=N.dataset.action,H=z(o),Y=H?Z(H):null,ae=Y?.result;if(R==="back-to-results"){re();return}if(R==="open-law"){he({lawKey:N.dataset.lawKey||"",sourceType:N.dataset.lawSource||"",lawName:N.dataset.lawName||""});return}if(R==="open-judgment"){ke({jid:N.dataset.jid||""});return}if(R==="jump-article"){me(N.dataset.jumpInput||"law-article-jump");return}if(R==="sort-column"){let ce=N.dataset.sortKey||"";if(!ce||!H)return;if(m==="schema"&&b?.result){let Ne=b.sort,Fe=ce==="jdate"||ce==="law_modified_date"||ce==="article_count"||ce==="citation_count"||ce==="full_text_length"||ce==="created_at"||ce==="updated_at",tt=Ne?.key===ce?Ne.direction==="asc"?"desc":"asc":Fe?"desc":"asc";P(H,b.tableId,{sort:{key:ce,direction:tt},columnFilters:b.columnFilters||{},quiet:!0});return}if(!Y)return;let Te=Y.sort,Pe=Te?.key===ce?Te.direction==="asc"?"desc":"asc":ce==="jdate"?"desc":"asc";Y.sort={key:ce,direction:Pe},Xe(1,{quiet:!0});return}if(R==="retry"){Xe(Y?.page||1);return}if(ae){if(R==="prev-page"){Xe(Math.max(1,Number(ae.page)-1),{quiet:!0});return}if(R==="next-page"){let ce=Math.max(1,Math.ceil(Number(ae.total)/Number(ae.page_size)));Xe(Math.min(ce,Number(ae.page)+1),{quiet:!0});return}if(R==="copy-query"){let ce=await xs(ae.query_text||"");I(ce?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",ce?"ok":"warn");return}if(R==="export-json"){let ce=`${ae.database}-${ae.table||"query"}-page-${ae.page}.json`;Pt(ce,JSON.stringify(Da(ae),null,2),"application/json;charset=utf-8"),I(`\u5DF2\u532F\u51FA ${ce}`,"ok");return}if(R==="export-csv"){let ce=`${ae.database}-${ae.table||"query"}-page-${ae.page}.csv`;Pt(ce,Ia(ae),"text/csv;charset=utf-8"),I(`\u5DF2\u532F\u51FA ${ce}`,"ok")}}}),q.addEventListener("change",A=>{let N=A.target.closest("[data-action='select-law-version']");if(N&&D){he({lawKey:D.lawKey,sourceType:D.sourceType,lawName:D.lawName,versionId:N.value});return}if(!A.target.matches("[data-page-size]"))return;let R=z(o);if(!R)return;let H=Z(R);H.pageSize=Number(A.target.value)||25,H.page=1,Se("data.page_size",H.pageSize),Xe(1,{quiet:!0})}),ee.addEventListener("click",()=>{at()}),await at(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0,k&&window.clearTimeout(k);for(let A of B.values())window.clearTimeout(A);B.clear(),te(),document.removeEventListener("click",Tt),window.removeEventListener("scroll",te,{capture:!0}),window.removeEventListener("resize",te)}}var Vi=[10,25,50,100],Vc=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function Vn(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function Wc(e,t=e){return`<option value="${r(e)}">${r(t)}</option>`}function ea(e,t,s,a,n=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${r(t)}</span>
      <span class="field-tag">${r(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${r(e)}">
      ${Wc("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${r(i)}" ${String(i)===String(a)?"selected":""}>${r(i)}</option>`).join("")}
    </select>
    ${n?`<span class="field-help">${r(n)}</span>`:""}
  </div>`}function Kc(e,t){let s=Vc.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
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
    </div>`}function Hi(){let e=document.getElementById("performance-filter-form");if(!e)return Vn();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function zi(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function Gi(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),n=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${n}.${i}`}function Yc(e,t){if(!e)return"";let s=new Date(e);return Number.isNaN(s.getTime())?"":new Date(s.getTime()+Math.max(0,Number(t)||0)).toISOString()}var Xc=[{key:"parsing",label:"Parsing",hint:"\u8F38\u5165\u9577\u5EA6\u3001\u89E3\u6790\u6642\u9593",names:["rag.parse_question"],color:"#64748b"},{key:"embedding",label:"Embedding",hint:"Model\u3001Token\u3001Batch\u3001\u8017\u6642",names:["rag.embed_query"],color:"#3984c6"},{key:"qdrant",label:"Qdrant Search",hint:"Collection\u3001Filter\u3001Top K\u3001\u8017\u6642",names:["rag.qdrant_search"],color:"#d97706"},{key:"reranker",label:"Reranker",hint:"Model\u3001\u5019\u9078\u7B46\u6578\u3001\u8017\u6642",names:["rag.rerank"],color:"#8b5cf6"},{key:"context",label:"Context",hint:"Chunk \u6578\u3001Token \u6578\u3001\u8017\u6642",names:["rag.context"],fallbackNames:["rag.fetch_documents","rag.build_citations"],color:"#64748b"},{key:"llm",label:"LLM",hint:"Model\u3001Input/Output Token\u3001TTFT\u3001\u8017\u6642",names:["rag.llm_request"],color:"#16a34a"}],Fa={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"};function Wi(e){let t=e?.metadata?.rag_response||{},s=String(t.status||e?.metadata?.rag_status||e?.status||"");return s==="operational"||s==="success"?{label:"Completed",tone:"ok"}:s==="retrieval_only"?{label:"Abstain",tone:"warn"}:s==="preview"?{label:"Preview",tone:"info"}:s==="failed"||s==="error"?{label:"Failed",tone:"danger"}:{label:s||"Unknown",tone:"idle"}}function Wn(e){let t=Math.max(0,Number(e?.offset_ms)||0),s=Math.max(0,Number(e?.duration_ms)||0),a=Math.max(t,Number(e?.end_offset_ms)||t+s);return{...e,offset:t,end:a,duration:Math.max(s,a-t)}}function Ki(e,t=0){let s=Array.isArray(e?.segments)?[...e.segments].sort((m,y)=>Number(m.offset_ms||0)-Number(y.offset_ms||0)):[],a=Math.max(Number(e?.total_ms)||0,Number(t)||0,...s.map(m=>Wn(m).end),1),n=Xc.map(m=>{let y=s.filter(w=>m.names.includes(w.name));!y.length&&m.fallbackNames&&(y=s.filter(w=>m.fallbackNames.includes(w.name)));let b=y.map(Wn),u=b.length?Math.min(...b.map(w=>w.offset)):null,v=b.length?Math.max(...b.map(w=>w.end)):null;return{...m,spans:b,start:u,end:v,duration:u===null?null:v-u}});for(let m of n){if(m.key!=="embedding"&&m.key!=="llm")continue;let y=[];for(let v of m.spans){let w=v.metadata||{},_=Number(w.load_duration_ms),x=Number.isFinite(_)&&_>0?_:0,S=Math.max(0,Number(v.duration)||0);y.push({...v,offset:v.offset,end:v.offset+x,duration:x,metadata:{...w,source_stage:m.label,model_load_ms:x,request_duration_ms:S,warm_duration_ms:Math.max(0,S-x),cold_start:x>=100},params:{...v.params||{},source_stage:m.label}})}if(!y.length)continue;let b=y.reduce((v,w)=>v+w.duration,0),u=m.spans.reduce((v,w)=>v+Math.max(0,Number(w.duration)||0),0);m.loadInfo={spans:y,total:b,requestTotal:u,ratio:u>0?Math.min(1,Math.max(0,b/u)):0}}let i=[...n],o=Math.max(0,...i.flatMap(m=>m.spans.map(y=>y.end))),l=e?.metadata?.rag_response||{},p=Wi(e),f=Math.min(a,o);return i.push({key:"response",label:"Response",hint:"\u7E3D\u8017\u6642\u3001\u5F15\u7528\u6578\u3001\u6210\u529F\u6216 Abstain",color:"#0f766e",spans:[{offset:f,end:a,duration:Math.max(0,a-f),status:p.tone==="danger"?"error":"ok",metadata:l,params:{},started_at:e?.started_at,finished_at:e?.finished_at}],start:f,end:a,duration:Math.max(0,a-f),responseMetadata:l}),Zc(i,a),{total:a,stages:i,response:l,traceStatus:p,requestId:e?.request_id||"",startedAt:e?.started_at,finishedAt:e?.finished_at,client:e?.client||{},models:Array.isArray(e?.summary?.models)?e.summary.models:[],hasLoad:i.some(m=>!!m.loadInfo)}}function Zc(e,t){let s=e.reduce((i,o)=>i+Math.max(0,Number(o.duration)||0),0),a=s>0?t/s:1,n=0;for(let i of e){let o=Math.max(0,Number(i.duration)||0)*a;i.displayStart=n,i.displayDuration=o,i.displayEnd=n+o;let l=i.spans[0]||null,p=[],f=!1;if(l){let y=Math.max(0,Number(l.duration)||0),b=i.loadInfo?Math.max(0,Number(i.loadInfo.total)||0):0;if(i.loadInfo&&b>0&&i.spans.length===1&&y>0){let u=Math.min(l.end,l.offset+b),v=Math.max(0,u-l.offset),w=Math.max(0,l.end-u);if(v>0&&w>0){let _=Yc(l.started_at,v),x={...l,offset:l.offset,end:u,duration:v,finished_at:_,metadata:{...l.metadata||{},source_stage:i.label,model_load_ms:v,request_duration_ms:y,warm_duration_ms:Math.max(0,y-v),cold_start:v>=100},params:{...l.params||{},source_stage:i.label}},S={...l,offset:u,end:l.end,duration:w,started_at:_,finished_at:l.finished_at};p.push({kind:"load",label:"Model Load",span:x,duration:v}),p.push({kind:"stage",label:`${i.label} \u63A8\u8AD6`,span:S,duration:w}),f=!0}}f||p.push({kind:"stage",label:i.label,span:l,duration:y})}i.detailSegments=p;let m=[];if(l&&o>0)if(f){let[y,b]=p,u=y.duration+b.duration,v=u>0?o*(y.duration/u):0,w={...i,key:"model_load",label:`Model Load \xB7 ${i.label}`,spans:[y.span],duration:y.duration},_={...i,label:`${i.label} \u63A8\u8AD6`,spans:[b.span],duration:b.duration};m.push({offset:n,duration:v,color:"#0ea5e9",kind:"load",tip:Ba(w,y.span)}),m.push({offset:n+v,duration:Math.max(0,o-v),color:i.color,kind:"stage",tip:Ba(_,b.span,{includeLoad:!1})})}else m.push({offset:n,duration:o,color:i.color,kind:"stage",tip:Ba(i,l)});i.displaySegments=m,n+=o}}function Kn(e,{includeLoad:t=!0}={}){let s=[],a=(m,y)=>{y==null||y===""||s.push([m,String(y)])},n=e.spans[0]||null;if(!n)return a("\u72C0\u614B","\u6B64\u7D00\u9304\u6C92\u6709\u9019\u500B span"),s;let i=n.params||{},o=n.metadata||{},l=Yi(n),p=Yn(n),f=(m,y)=>{let b=Number(m?.load_duration_ms);if(!Number.isFinite(b))return;let u=Math.max(0,b);a("Model Load",ue(u)),a("\u51B7\u555F\u52D5",u>=100?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09");let v=Math.max(0,Number(y)||0);if(v>0){let w=Math.max(0,v-u);a("\u6263\u9664\u8F09\u5165\u5F8C",ue(w)),a("\u8F09\u5165\u5360\u6BD4",`${(u/v*100).toFixed(u/v>=.1?0:1)}%`)}};if(e.key==="response")return a("Trace \u72C0\u614B",e.responseMetadata.status||"\u2014"),a("Answer source",e.responseMetadata.answer_source||"\u2014"),a("Abstain",e.responseMetadata.abstain?"\u662F":"\u5426"),a("\u5F15\u7528\u7E3D\u6578",e.responseMetadata.citation_count??"\u2014"),a("\u5224\u6C7A\uFF0F\u6CD5\u898F\u5F15\u7528",`${e.responseMetadata.judgment_citations??"\u2014"} / ${e.responseMetadata.law_citations??"\u2014"}`),a("\u7E3D\u8017\u6642",ue(e.duration)),s;if(a("\u958B\u59CB",`${Gi(n.started_at)||"\u2014"} \xB7 +${n.offset.toFixed(1)} ms`),a("\u7D50\u675F",`${Gi(n.finished_at)||"\u2014"} \xB7 +${n.end.toFixed(1)} ms`),a("\u8017\u6642",ue(n.duration)),e.key==="parsing")a("\u8F38\u5165\u9577\u5EA6",o.input_length??i.input_length),a("\u6B63\u898F\u5316\u9577\u5EA6",o.normalized_length??i.normalized_length),a("\u79FB\u9664\u7A7A\u767D",o.trimmed_chars);else if(e.key==="embedding")a("Model",p||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.active_base_url||o.base_url),a("Input tokens",o.prompt_eval_count),a("Batch",o.batch),a("\u5411\u91CF\u7DAD\u5EA6",o.dimensions),a("Fallback",o.fallback_used?"\u662F":"\u5426"),t&&f(o,n.duration);else if(e.key==="qdrant")a("Collection",o.collection||i.collection),o.filter&&a("Filter",zi(o.filter)),a("Top K",o.top_k??i.limit),a("Hits",o.hits),a("Unique judgments",o.unique_judgments),a("Top score",o.top_score);else if(e.key==="reranker")a("Model",p||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Rerank \u72C0\u614B",o.status),a("Fallback",o.fallback_used?"\u662F":"\u5426"),a("\u5019\u9078\u7B46\u6578",o.candidates),a("\u9078\u7528\u7B46\u6578",o.selected),a("Top score",o.top_score),Array.isArray(o.errors)&&o.errors.length&&a("\u932F\u8AA4",o.errors.join(" \xB7 "));else if(e.key==="context")a("Chunks",o.chunks),a("\u5224\u6C7A chunks",o.judgment_chunks),a("\u6CD5\u898F chunks",o.law_chunks),a("Token \u4F30\u7B97",o.token_estimate),a("Context \u5B57\u5143",o.context_chars),a("\u6587\u4EF6\u6578",o.documents);else if(e.key==="llm")a("Model",p||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Input tokens",o.input_tokens),a("Output tokens",o.output_tokens),a("TTFT",o.ttft_ms===null||o.ttft_ms===void 0?"\u2014":ue(o.ttft_ms)),a("API \u7E3D\u8017\u6642",o.total_duration_ms===null||o.total_duration_ms===void 0?"\u2014":ue(o.total_duration_ms)),t&&f(o,n.duration),a("Strict retry",o.strict?"\u662F":"\u5426");else if(e.key==="model_load"){if(a("Model",p||o.model||i.model),a("\u4E3B\u6A5F",l),a("\u4F86\u6E90\u968E\u6BB5",o.source_stage),a("\u51B7\u555F\u52D5",o.cold_start?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09"),a("\u6A21\u578B\u547C\u53EB\u7E3D\u8017\u6642",o.request_duration_ms===null||o.request_duration_ms===void 0?"\u2014":ue(o.request_duration_ms)),a("\u8F09\u5165\u8017\u6642",o.model_load_ms===null||o.model_load_ms===void 0?"\u2014":ue(o.model_load_ms)),a("\u6263\u9664\u8F09\u5165\u5F8C\u6D41\u7A0B\u6642\u9593",o.warm_duration_ms===null||o.warm_duration_ms===void 0?"\u2014":ue(o.warm_duration_ms)),Number(o.request_duration_ms)>0&&Number(o.model_load_ms)>=0){let m=Number(o.model_load_ms)/Number(o.request_duration_ms)*100;a("\u8F09\u5165\u5360\u6BD4",`${m.toFixed(m>=10?0:1)}%`)}o.eval_duration_ms!==null&&o.eval_duration_ms!==void 0&&a("\u63A8\u8AD6\u8017\u6642",ue(o.eval_duration_ms))}else if(e.key==="segment"||e.key==="test_stage")if(a("Model",p||o.model||i.model),a("\u72C0\u614B",o.status||n.status),e.key==="test_stage")a("\u9032\u5EA6",o.progress===null||o.progress===void 0?"":`${Number(o.progress)||0}%`),n.error&&a("\u932F\u8AA4",n.error);else{n.error&&a("\u932F\u8AA4",n.error);for(let[m,y]of Object.entries(i).slice(0,10))a(m,zi(y))}return e.spans.length>1&&(e.key==="model_load"?a("\u5404\u6A21\u578B\u8F09\u5165",e.spans.map(m=>`${m.metadata?.source_stage||"model"} ${Yn(m)} ${ue(m.metadata?.model_load_ms||0)}`).join(" \xB7 ")):(a("Span \u6578",e.spans.length),a("Span \u660E\u7D30",e.spans.map((m,y)=>`#${y+1} +${m.offset.toFixed(0)}ms/${ue(m.duration)}`).join(" \xB7 ")))),n.module&&a("Module",n.module),n.function&&a("Function",n.function),s}function ed(e){let t=String(e||"").trim();if(!t)return"";try{return new URL(t.includes("://")?t:`http://${t}`).hostname||t}catch{return t}}function Yi(e){let t=e?.metadata||{},s=String(t.provider_name||"").trim();if(s)return s;let a=String(t.active_base_url||t.base_url||e?.params?.url||"").trim();return ed(a)}function td(e){let t=e?.metadata||{};return String(t.model||e?.params?.model||"").trim()}function Yn(e){let t=Yi(e),s=td(e);return s?t?`${t}:${s}`:s:""}function sd(e){let t=new Set;for(let s of e?.spans||[]){let a=Yn(s);a&&t.add(a)}return[...t]}function Ba(e,t,s={}){let a=Kn({...e,spans:[t]},s);return[String(e.label||""),...a.map(([n,i])=>`${n}: ${i}`)].join(`
`)}function ad(e,t){let s=e.spans||[],a=sd(e),n=Array.isArray(e.displaySegments)?e.displaySegments:null,i=7,o=Math.max(1,Math.min(4,s.length)),l=s.length>1,p=n?12:l?Math.max(12,o*i):12,f=n?n.map(_=>{if(Number(_.duration)<=0)return"";let x=Math.max(0,Math.min(100,_.offset/t*100)),S=Math.min(100-x,_.duration/t*100);return`<span class="rag-wf-bar is-sequential${_.kind==="load"?" is-load":""}" style="left:${x.toFixed(3)}%;width:${S.toFixed(4)}%;top:0;height:12px;--bar-color:${_.color}"
            data-rag-wf-tip="${r(_.tip)}"
            aria-label="${r(_.tip)}" role="img"></span>`}).join(""):s.slice(0,4).map((_,x)=>{if(Number(_.duration)<=0)return"";let S=Math.max(0,Math.min(100,_.offset/t*100)),k=Math.max(.35,Math.min(100-S,_.duration/t*100)),D=l?x*i:0,oe=l?6:12,O=Ba(e,_);return`<span class="rag-wf-bar" style="left:${S.toFixed(3)}%;width:${k.toFixed(3)}%;top:${D}px;height:${oe}px"
            data-rag-wf-tip="${r(O)}"
            aria-label="${r(O)}" role="img"></span>`}).join(""),m=Array.isArray(e.detailSegments)?e.detailSegments:[],y=m.length>1?m.map(_=>{let x=_.kind==="load"?{...e,key:"model_load",label:`Model Load \xB7 ${e.label}`,spans:[_.span],duration:_.duration}:{...e,label:`${e.label} \u63A8\u8AD6`,spans:[_.span],duration:_.duration},S=Kn(x,{includeLoad:_.kind!=="stage"});return`<div class="rag-wf-detail-group">
              <div class="rag-wf-detail-group-head">
                <strong>${r(_.label)}</strong>
                <span>${r(ue(_.duration))}</span>
              </div>
              <div class="rag-wf-detail-grid">${S.map(([k,D])=>`<span class="rag-wf-detail"><span>${r(k)}</span><strong>${r(D)}</strong></span>`).join("")}</div>
            </div>`}).join(""):"",b=Kn(e).map(([_,x])=>`<span class="rag-wf-detail"><span>${r(_)}</span><strong>${r(x)}</strong></span>`).join(""),u=m.length>1?`<div class="rag-wf-details is-split">${y}</div>`:`<div class="rag-wf-details">${b}</div>`,v=s.length?s.some(_=>_.status==="error")?"is-error":"":"is-missing",w=s.length?ue(e.duration):"\u672A\u8A18\u9304";return`<details class="rag-wf-stage ${v}" style="--stage-color:${e.color}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong>${r(e.label)}</strong><small>${r(e.hint)}</small>${a.length?`<small class="rag-wf-model-line">${r(a.join(" \xB7 "))}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${w} \xB7 ${s.length?`${s.length} span`:"\u2014"} <span class="rag-wf-chevron">${g("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:${p}px">${f}</span>
    </summary>
    ${u}
  </details>`}function Xi(e,t,s=!1){let a=e.response||{},n=e.client||{},i=e.models||[];return`<div class="rag-wf-summary">
      <span>\u7E3D\u8017\u6642 <strong>${r(ue(e.total))}</strong></span>
      <span>Server <strong>${r(ue(t))}</strong></span>
      ${n.total_ms?`<span>Client <strong>${r(ue(n.total_ms))}</strong></span>`:""}
      ${n.render_ms!==void 0?`<span>Render <strong>${r(ue(n.render_ms))}</strong></span>`:""}
      <span>\u5F15\u7528 <strong>${r(String(a.citation_count??"\u2014"))}</strong></span>
      <span>Abstain <strong>${a.abstain?"\u662F":"\u5426"}</strong></span>
      ${i.length?`<span>Model <strong>${r(i.join(" \xB7 "))}</strong></span>`:""}
      ${s?'<span class="rag-wf-updating">\u66F4\u65B0\u4E2D\u2026</span>':""}
    </div>`}function Es(e,t,s="\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\uFF0C\u67E5\u770B\u53C3\u6578\u3001Token\u3001TTFT\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u4F86\u6E90\u6578\u91CF\u3002Waterfall \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u5E73\u884C\u57F7\u884C\u7684 span \u6703\u4F9D\u5BE6\u969B\u6642\u9593\u91CD\u758A\u986F\u793A\u3002",{legend:a=""}={}){return`<div class="rag-wf-axis"><span>0 ms</span><span>${r(ue(t))}</span></div>
    ${a}
    <div class="rag-wf-stages">${(e||[]).map(n=>ad(n,t)).join("")}</div>
    <p class="rag-wf-hint">${r(s)}</p>`}function Zi(e){let t=(e.stages||[]).some(n=>n.loadInfo),s=t?'<div class="rag-wf-legend"><span><i class="is-load"></i>Model Load\uFF08\u968E\u6BB5 bar \u524D\u6BB5\uFF09</span></div>':"",a=t?"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\uFF1BEmbedding\uFF0FLLM \u7684\u85CD\u8272\u524D\u6BB5\u70BA Model Load\uFF0C\u5F8C\u6BB5\u70BA\u63A8\u8AD6\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001Token \u8207\u8F09\u5165\u5360\u6BD4\u53EF\u5C55\u958B\u67E5\u770B\u3002":"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207 Token \u53EF\u5C55\u958B\u67E5\u770B\u3002";return Es(e.stages,e.total,a,{legend:s})}function Oa(e,{serverDurationMs:t=0,loading:s=!1,embedded:a=!1}={}){if(!e||typeof e!="object")return"";let n=Ki(e,t),i=n.traceStatus;return`<section class="report-card rag-wf-card${a?" rag-wf-embedded":""}">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${Fa[i.tone]||Fa.idle}">${r(i.label)}</span>
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
    ${Xi(n,t,s)}
    ${Zi(n)}
  </section>`}var $t=null;function nd(){return $t||($t=document.createElement("div"),$t.className="rag-wf-tooltip",$t.hidden=!0,document.body.appendChild($t),$t)}function Xn(){$t&&($t.hidden=!0)}function eo(e){if(!$t||$t.hidden)return;let t=14,s=10,a=$t.getBoundingClientRect(),n=e.clientX+t,i=e.clientY+t;n+a.width>window.innerWidth-s&&(n=e.clientX-a.width-t),i+a.height>window.innerHeight-s&&(i=e.clientY-a.height-t),$t.style.left=`${Math.max(s,n)}px`,$t.style.top=`${Math.max(s,i)}px`}document.addEventListener("pointerover",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=nd(),a=t.dataset.ragWfTip||"";a&&(s.textContent=a,s.hidden=!1,eo(e))});document.addEventListener("pointermove",e=>{if(!(!$t||$t.hidden)){if(!e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]")){Xn();return}eo(e)}});document.addEventListener("pointerout",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=e.relatedTarget;s instanceof Node&&t.contains(s)||Xn()});window.addEventListener("scroll",Xn,{capture:!0,passive:!0});function rd(e,t,s,a){if(a&&!e.length)return`<div class="report-card rag-wf-card">
      ${Ce({tone:"danger",title:"RAG Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">${g("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;if(!e.length)return`<div class="report-card rag-wf-card">
      ${ct({iconName:"activity",title:s?"\u8B80\u53D6 RAG Pipeline\u2026":"\u5C1A\u7121 RAG Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684 RAG \u554F\u7B54 Trace\u3002":"\u7522\u751F\u65B0\u7684 RAG \u554F\u7B54\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A Parsing\u3001Embedding\u3001Qdrant\u3001Context\u3001LLM \u8207 Response \u7684 waterfall\u3002"})}
    </div>`;let n=e.find(f=>String(f.id)===String(t))||e[0],i=n.flow&&typeof n.flow=="object"?n.flow:{},o=Ki(i,n.duration_ms),l=o.traceStatus,p=e.map(f=>{let m=Wi(f.flow||{});return`<option value="${r(String(f.id))}" ${String(f.id)===String(n.id)?"selected":""}>#${r(String(f.id))} \xB7 ${r(ye(f.started_at))} \xB7 ${r(ue(f.duration_ms))} \xB7 ${r(m.label)}</option>`}).join("");return`<section class="report-card rag-wf-card">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${Fa[l.tone]||Fa.idle}">${r(l.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(o.requestId||n.request_id||"\u2014")}</span>
          \xB7 ${r(ye(n.started_at))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <label class="rag-wf-select">Trace
          <select class="select" data-rag-trace-select aria-label="\u9078\u64C7 RAG Trace">${p}</select>
        </label>
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">
          ${g("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    ${Xi(o,n.duration_ms,s)}
    ${Zi(o)}
  </section>`}function id(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},n=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?ue(a.avg_total_ms??0):"\u2014",o=a.samples?ue(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
                    <span class="perf-model-count">${d(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${ue(l.avg_ms)}`:""}</span>
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
                    <span class="perf-seg-ms">${ue(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function ut(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),n=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(n).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:n?`${n}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function to(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function od(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let n=Number(a.points_per_second)||0,i=Math.max(2,n/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${r(to(a))}</strong>
          <span>${r(ye(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${r(`${d(a.indexed_count)} \u7B46 \xB7 ${ut(a.duration_ms)} \xB7 ${d(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${n.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${d(a.indexed_count)} \u7B46 \xB7 ${ut(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function ld(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${r(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${r(`${s.label} ${ut(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${r(s.key)}"></i>
            <span>${r(s.label)}</span>
            <strong>${ut(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 llama-server Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function cd(e,t){let s=(Array.isArray(e)?e:[]).map(x=>({elapsed:Math.max(0,Number(x.elapsed_s)||0),indexed:Math.max(0,Number(x.indexed)||0)})).filter(x=>x.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(x=>x.elapsed),(Number(t)||0)/1e3,1),n=Math.max(...s.map(x=>x.indexed),1),i=760,o=150,l=12,p=12,f=i-l*2,m=o-p*2,y=s.map(x=>[l+x.elapsed/a*f,o-p-x.indexed/n*m]),b=y.map(([x,S],k)=>`${k===0?"M":"L"}${x.toFixed(1)},${S.toFixed(1)}`).join(" "),u=`${b} L${y[y.length-1][0].toFixed(1)},${o-p} L${y[0][0].toFixed(1)},${o-p} Z`,v=Math.max(1,Math.ceil(y.length/14)),w=y.map(([x,S],k)=>k%v===0||k===y.length-1?`<circle cx="${x.toFixed(1)}" cy="${S.toFixed(1)}" r="2.6" />`:"").join(""),_=[0,1,2,3].map(x=>{let S=p+m/3*x;return`<line x1="${l}" y1="${S.toFixed(1)}" x2="${i-l}" y2="${S.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${d(n)} \u7B46 \xB7 ${ut(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${_}
      <path d="${u}" class="index-progress-area"></path>
      <path d="${b}" class="index-progress-line"></path>
      ${w}
      <line x1="${l}" y1="${o-p}" x2="${i-l}" y2="${o-p}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${p}" x2="${l}" y2="${o-p}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${ut(a*500)}</span>
      <span>${ut(a*1e3)}</span>
    </div>
  </div>`}function dd(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},n=t.coverage||{},i=n.total_judgments>0?`${d(n.indexed_judgments)} / ${d(n.total_judgments)}\uFF08${(100*n.indexed_judgments/n.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:d(t.indexed_count),note:`${d(t.batch_count)} \u6279 \xD7 ${d(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:ut(t.duration_ms),note:`${d(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:ut(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${ut(t.batch_min_ms)} \xB7 \u6700\u6162 ${ut(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${d(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${r(to(t))}</span>
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
      <span><strong>batch</strong> ${d(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${d(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${d(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${r(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${ut(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${od(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${ut(t.duration_ms)}</span>
        </div>
        ${ld(t)}
      </div>
    </div>
    ${cd(t.progress,t.duration_ms)}
  </section>`}var Ui=["#22d3ee","#a78bfa","#f59e0b","#ec4899","#3b82f6","#10b981","#f97316","#8b5cf6","#64748b"];function Qi(e){let t=String(e?.host||e?.url||"").trim(),s=e?.port?`:${e.port}`:"";return`${t||"\u2014"}${s}`}function ud(e,t,s,a){if(a&&!e)return`<div class="report-card rag-wf-card">
      ${Ce({tone:"danger",title:"\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${g("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=Array.isArray(e?.runs)?e.runs:[];if(!n.length)return`<div class="report-card rag-wf-card">
      ${ct({iconName:"layers",title:s?"\u8B80\u53D6\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline\u2026":"\u5C1A\u7121\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684\u7248\u672C\u5316\u7D22\u5F15\u7D00\u9304\u3002":"\u57F7\u884C\u300CQdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A host/model\u3001Blue-Green collection \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002"})}
    </div>`;let i=n.find(S=>String(S.id)===String(t))||e?.latest||n[n.length-1],o=i?.pipeline&&typeof i.pipeline=="object"?i.pipeline:null,p=[...n].reverse().map(S=>{let k=Number(S.pipeline?.version_id||S.version_id||0),D=k?`v${String(k).padStart(3,"0")}`:"\u7D22\u5F15";return`<option value="${r(String(S.id))}" ${String(S.id)===String(i.id)?"selected":""}>${r(`${ye(S.started_at)} \xB7 ${D} \xB7 ${ut(S.duration_ms)}`)}</option>`}).join(""),f=Number(o?.version_id||i.version_id||0),m=f?`v${String(f).padStart(3,"0")}`:"\u2014",y=o?.host||{},b=Qi(y),u=o?.model||i.model||"\u2014",v=Number(o?.total_ms)||Number(i.duration_ms)||0,w=Array.isArray(o?.stages)?o.stages:[],_=w.map((S,k)=>({...S,ms:Math.max(0,Number(S.duration_ms)||0),color:Ui[k%Ui.length]})).filter(S=>S.ms>0).map(S=>`<span class="index-pipeline-seg" style="width:${(S.ms/Math.max(1,v)*100).toFixed(2)}%;background:${r(S.color)}" title="${r(`${S.label} ${ut(S.ms)}`)}"></span>`).join(""),x=w.map((S,k)=>{let D=Math.max(0,Number(S.duration_ms)||0),oe=v>0?D/v*100:0,O=S.host&&typeof S.host=="object"?S.host:null;return`<div class="index-pipeline-row">
        <span class="index-pipeline-step">${String(k+1).padStart(2,"0")}</span>
        <div class="index-pipeline-copy">
          <div class="index-pipeline-title">
            <strong>${r(S.label||S.key||"\u968E\u6BB5")}</strong>
            ${Je(S.status||"success")}
          </div>
          <span class="index-pipeline-detail">${r(S.detail||"\u2014")}</span>
          ${O?`<span class="index-pipeline-host">${g("server",12)} ${r(Qi(O))} \xB7 ${r(S.model||u)}</span>`:""}
        </div>
        <div class="index-pipeline-time">
          <strong>${ut(D)}</strong>
          <span>${oe.toFixed(1)}%</span>
        </div>
      </div>`}).join("");return`<section class="index-perf-panel index-pipeline-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</div>
        <div class="index-perf-sub">Blue-Green collection\u3001host/model \u8207\u968E\u6BB5\u8017\u6642</div>
      </div>
      <div class="index-pipeline-actions">
        <select class="select index-pipeline-select" data-index-pipeline-select aria-label="\u9078\u64C7\u7D22\u5F15 Pipeline \u7D00\u9304">${p}</select>
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${g("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span></button>
      </div>
    </div>
    ${o?`<div class="index-pipeline-meta">
            <span><strong>\u7248\u672C</strong> ${r(m)}</span>
            <span><strong>collection</strong> ${r(String(o.collection||"\u2014"))}</span>
            <span><strong>\u6A21\u5F0F</strong> ${r(String(o.build_mode||"\u2014"))}</span>
            <span><strong>\u672C\u6B21</strong> ${o.resumed?`\u63A5\u7E8C\uFF08\u5DF2\u7D22\u5F15 ${d(o.resumed_indexed)} \u7B46\uFF09`:"\u65B0\u5EFA\u7248\u672C"}</span>
            <span><strong>Host</strong> ${r(b)}</span>
            <span><strong>Model</strong> ${r(String(u))}</span>
            <span><strong>\u7E3D\u8017\u6642</strong> ${ut(v)}</span>
          </div>
          <div class="index-pipeline-bar">${_}</div>
          <div class="index-pipeline-list">${x}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B Pipeline \u968E\u6BB5\u8CC7\u6599\uFF1B\u4E0B\u4E00\u6B21 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u6703\u8A18\u9304 host/model \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002</div>'}
  </section>`}function pd(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${d(i)}\u2013${d(o)} / ${d(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Vi.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${g("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${g("chevronRight",13)}</button>
    </div>
  </div>`}function md(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"#65a30d":t.includes("judgment.rag")?"#8b5cf6":t.includes("judgment.web.app")?"#3b82f6":t.includes("judgment.web.query")?"#d97706":t.includes("judgment.judgment_index")?"#0d9488":"#64748b"}function gd(e){let t=Wn(e),s=Math.max(0,Math.min(8,Number(e.depth)||0));return{key:"segment",label:`${"\u203A ".repeat(s)}${e.name||"unnamed"}`,hint:[e.module||"\u2014",e.function||"\u2014"].join(" \xB7 "),color:md(e),spans:[{...t,status:e.status||"ok",error:e.error,metadata:e.metadata||{},params:e.params||{},started_at:e.started_at,finished_at:e.finished_at}],start:t.offset,end:t.end,duration:t.duration}}function Ha(e){return(e||[]).map(gd)}function fd(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((b,u)=>Number(b.seq)-Number(u.seq)):[],n=s?.summary||{},i=Array.isArray(n.models)?n.models:[],o=s?.client||{},l=s?.metadata||{},p=l.question||"",f=l.answer||"",m=p||f?`<div class="perf-flow-qa">
          ${p?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${r(p)}</span></div>`:""}
          ${f?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${r(f)}</span></div>`:""}
        </div>`:"",y=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(b=>(Number(b.offset_ms)||0)+(Number(b.duration_ms)||0)),1);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${r(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${r(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${r(e.method||"")} ${r(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${ye(e.started_at)}</span>
      <span class="perf-record-duration">${ue(e.duration_ms)}</span>
      ${Je(e.status)}
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
      ${m}
      ${i.length?`<div class="chips perf-record-models">${i.map(b=>`<span class="chip">${r(b)}</span>`).join("")}</div>`:""}
      ${a.length?Es(Ha(a),y,"\u6B64 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002"):`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${r(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${r(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var Ji={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",rerank:"Reranker",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"};function bd(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}var hd={embedding:"#3984c6",retrieval:"#d97706",rerank:"#8b5cf6",context:"#64748b",llm:"#16a34a",validation:"#8b5cf6"};function vd(e,t){let s=Date.parse(e.started_at||""),a=Date.now(),n=Array.isArray(e.stage_order)?[...e.stage_order]:Object.keys(Ji);for(let f of t)f.stage&&!n.includes(f.stage)&&n.push(f.stage);let i=[],o=0;for(let f of n){let m=t.filter(u=>u.stage===f);if(!m.length)continue;let y=m.map(u=>{let v=Date.parse(u.started_at||""),w=Number.isFinite(s)&&Number.isFinite(v)?Math.max(0,v-s):0,_=Math.max(0,Number(u.duration_ms)||0);u.status==="running"&&Number.isFinite(v)&&(_=Math.max(_,a-v));let x=w+_;return o=Math.max(o,x),{offset:w,end:x,duration:_,status:u.status==="failed"?"error":u.status==="running"?"running":"ok",started_at:u.started_at,finished_at:u.finished_at,error:u.error_message,metadata:{...u.details||{},model:u.model,status:u.status,progress:Number(u.progress)||0,module:u.module,function:u.function},params:{model:u.model}}}),b=y.reduce((u,v)=>u+v.duration,0);i.push({key:"test_stage",label:Ji[f]||f,hint:`${y.length} \u500B\u7A0B\u5E8F`,color:hd[f]||"#64748b",spans:y,start:y.length?Math.min(...y.map(u=>u.offset)):null,end:y.length?Math.max(...y.map(u=>u.end)):null,duration:b})}let l=e.status==="running"&&Number.isFinite(s)?Math.max(0,a-s):0,p=Math.max(Number(e.total_ms)||0,l,o,1);return{stages:i,total:p}}function Rs(e,t,s,a={}){let n=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(x=>`<option value="${r(x.run_id)}" ${x.run_id===s?"selected":""}>${r(bd(x.status))} \xB7 ${r((x.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${r(ye(x.started_at))}</option>`)].join(""),o=n?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${g("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${g("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?Je(e.status):""}</div>
      <div class="test-flow-question">${e?r(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${ct({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let p=Array.isArray(e.steps)?e.steps:[],f=vd(e,p),m=e.models||{},y=e.status==="running"?`${ue(f.total)}\uFF08\u4F30\u7B97\uFF09`:ue(e.total_ms),b=p.find(x=>x.stage==="llm"&&x.model===e.summary?.primary_model)||p.find(x=>x.stage==="llm"&&x.details?.answer_preview),u=String(b?.details?.provider_name||"").trim(),v=u&&e.summary?.primary_model?`${u}:${e.summary.primary_model}`:e.summary?.primary_model||"",w=e.answer||b?.details?.answer_preview||"",_=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${v?`<span class="mono">${r(v)}</span>`:""}
    </div>
    <p>${w?r(w):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${r(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${r(ye(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${y}</span>
      <span><strong>Embedding</strong> ${Array.isArray(m.embedding)?m.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(m.llm)?m.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${r(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${_}
    ${f.stages.length?Es(f.stages,f.total,"\u6E2C\u8A66 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B\u7A0B\u5E8F\u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u6A21\u578B\u3001\u72C0\u614B\u3001\u9032\u5EA6\u3001module\uFF0Ffunction \u8207\u932F\u8AA4\u3002"):'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":n?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${v?`<span class="mono">primary=${r(v)}</span>`:""}
    </div>
  </div>`}function $d(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},n=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${Je(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${d(e.total)} \u7B46\u7B26\u5408 \xB7 ${ue(e.duration_ms)} \xB7
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
    ${dd(n)}
    ${id(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>fd(i,o)).join(""):ct({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${pd(e)}
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
  </div>`}async function yd(e,t){let s=!1,a=Vn(),n={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null,p=[],f="",m=!1,y=null,b=!1,u=null,v="",w=!1,_=null,x=!1;e.innerHTML=`<section class="page data-page performance-page">
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
  </section>`;let S=e.querySelector("#performance-filter-fields"),k=e.querySelector("#performance-filter-form"),D=e.querySelector("#performance-test-flow"),oe=e.querySelector("#performance-report"),O=e.querySelector("#performance-panel-pipeline"),be=e.querySelector("#performance-panel-index-pipeline"),fe=e.querySelector("#performance-meta"),W=e.querySelector("#performance-refresh"),L=[...e.querySelectorAll("[data-performance-tab]")],q={overview:e.querySelector("#performance-panel-overview"),pipeline:e.querySelector("#performance-panel-pipeline"),"index-pipeline":e.querySelector("#performance-panel-index-pipeline"),benchmark:e.querySelector("#performance-panel-benchmark")},E="overview",X=j=>{E=j;for(let B of L){let te=B.dataset.performanceTab===j;B.classList.toggle("is-active",te),te?B.setAttribute("aria-current","page"):B.removeAttribute("aria-current")}for(let[B,te]of Object.entries(q))te&&(te.hidden=B!==j);j==="benchmark"?fe.textContent="BENCHMARK \xB7 RAG":j==="pipeline"?fe.textContent="PERFORMANCE \xB7 RAG WATERFALL":j==="index-pipeline"?fe.textContent="PERFORMANCE \xB7 INDEX PIPELINE":l&&(fe.textContent=`PERFORMANCE \xB7 ${d(l.total)} \u7B46`)},ee=Mi(e,{onNavigate:j=>X(j)}),F=()=>{O&&(O.innerHTML=rd(p,f,m,y))},ie=async({force:j=!1}={})=>{if(!(s||m)){if(b&&!j){F();return}m=!0,p.length||F();try{let B=await V.performance({keyword:"/api/rag"},1,50);if(s)return;let te=(Array.isArray(B.rows)?B.rows:[]).filter(G=>G.flow&&(String(G.path||"").includes("/api/rag")||String(G.process||"").includes("RAG")));p=te,(!f||!te.some(G=>String(G.id)===String(f)))&&(f=te[0]?String(te[0].id):""),y=null,b=!0}catch(B){if(s)return;y=B}finally{s||(m=!1,F())}}},_e=()=>{be&&(be.innerHTML=ud(u,v,w,_))},z=async({force:j=!1}={})=>{if(!(s||w)){if(x&&!j){_e();return}w=!0,u||_e();try{let B=await V.performance({},1,1);if(s)return;u=B.index_pipeline||B.index_stats||null;let te=Array.isArray(u?.runs)?u.runs:[];(!v||!te.some(G=>String(G.id)===String(v)))&&(v=u?.latest?String(u.latest.id):""),_=null,x=!0}catch(B){if(s)return;_=B}finally{s||(w=!1,_e())}}},ve=j=>{X(j),j==="benchmark"&&ee.show(),j==="pipeline"&&ie(),j==="index-pipeline"&&z()};e.addEventListener("click",j=>{let B=j.target.closest("[data-performance-tab]");B&&ve(B.dataset.performanceTab||"overview")}),O?.addEventListener("change",j=>{j.target.matches("[data-rag-trace-select]")&&(f=String(j.target.value||""),F())}),O?.addEventListener("click",j=>{j.target.closest('[data-action="refresh-rag-waterfall"]')&&ie({force:!0})}),be?.addEventListener("change",j=>{j.target.matches("[data-index-pipeline-select]")&&(v=String(j.target.value||""),_e())}),be?.addEventListener("click",j=>{j.target.closest('[data-action="refresh-index-pipeline"]')&&z({force:!0})});let Z=null,Se=[],pe="",K=null,re="",me=()=>{S.innerHTML=Kc(n,a)},he=()=>{let j=JSON.stringify({selected:pe,tick:Z?.status==="running"?Math.floor(Date.now()/1e3):0,runs:Se.map(B=>`${B.run_id}:${B.status}`),run:Z?{run_id:Z.run_id,status:Z.status,progress:Z.progress,total_ms:Z.total_ms,steps:(Z.steps||[]).map(B=>`${B.stage}:${B.model}:${B.status}:${B.progress}:${B.duration_ms}`)}:null});j!==re&&(re=j,D.innerHTML=Rs(Z,Se,pe))},ke=async()=>{try{let j=await V.testRuns(30);if(s)return;Se=Array.isArray(j.runs)?j.runs:[]}catch{if(s)return;Se=[]}},xe=async(j=null)=>{try{let B=j&&!pe?j:pe?await V.testRun(pe):await V.testRunCurrent();if(s)return;Z=B.run||null,!pe&&Z&&Z.status!=="running"&&!Se.some(te=>te.run_id===Z.run_id)&&await ke(),he()}catch{if(s)return;Z=null,he()}},Ee=async(j=null)=>{s||pe||await xe(j)},Oe=()=>{s||K||(K=ht("test-runs",(j,B)=>Ee(B?.snapshot||null)))};D.addEventListener("change",async j=>{j.target.id==="test-run-select"&&(pe=String(j.target.value||""),await xe())}),D.addEventListener("click",async j=>{j.target.closest("#test-flow-refresh")&&(pe="",await ke(),await xe())});let P=async(j=i,{quiet:B=!1}={})=>{i=Math.max(1,Number(j)||1),a=Hi();let te=oe.querySelector(".report-card"),G=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!te?oe.setAttribute("aria-busy","true"):(oe.removeAttribute("aria-busy"),oe.innerHTML=Zs({label:"\u6548\u80FD\u5831\u8868"}));let Le=e.querySelector("#performance-run");B||Me(Le,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Ie=await V.performance(a,i,o);if(s)return;if(l=Ie,Ie.index_pipeline){u=Ie.index_pipeline;let Qe=Array.isArray(u.runs)?u.runs:[];(!v||!Qe.some(mt=>String(mt.id)===String(v)))&&(v=u.latest?String(u.latest.id):""),x=!0,_=null}if(i=Number(Ie.page)||i,o=Number(Ie.page_size)||o,oe.removeAttribute("aria-busy"),oe.innerHTML=$d(Ie),G!==null){let Qe=oe.querySelector("[data-page-size]");Qe&&(Qe.value=String(o),Qe.focus({preventScroll:!0}))}fe.textContent=`PERFORMANCE \xB7 ${d(Ie.total)} \u7B46`,fe.className="badge badge-neutral badge-mono"}catch(Ie){if(s)return;oe.removeAttribute("aria-busy"),oe.innerHTML=Pa(Ie,{label:"\u6548\u80FD\u5831\u8868"}),I(Ie.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||Me(Le,!1)}},U=async()=>{try{n=await V.performanceOptions()}catch{n={processes:[],modules:[],statuses:[],methods:[],models:[]}}me()};return k.addEventListener("submit",j=>{j.preventDefault(),P(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=Vn(),i=1,me(),P(1)}),W.addEventListener("click",async()=>{if(E==="pipeline"){Me(W,!0,"\u6574\u7406\u4E2D\u2026");try{await ie({force:!0})}finally{s||Me(W,!1)}return}if(E==="index-pipeline"){Me(W,!0,"\u6574\u7406\u4E2D\u2026");try{await z({force:!0})}finally{s||Me(W,!1)}return}if(E==="benchmark"){Me(W,!0,"\u6574\u7406\u4E2D\u2026");try{await ee.refresh()}finally{s||Me(W,!1)}return}a=Hi(),W.disabled=!0,Me(W,!0,"\u6574\u7406\u4E2D\u2026"),await U(),await ke(),s||await xe(),s||await P(1),s||(W.disabled=!1,Me(W,!1))}),oe.addEventListener("click",async j=>{let B=j.target.closest("[data-action]");if(!B||!l)return;let te=B.dataset.action;if(te==="retry"){P(i);return}if(te==="prev-page"){P(Math.max(1,Number(l.page)-1),{quiet:!0});return}if(te==="next-page"){let G=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));P(Math.min(G,Number(l.page)+1),{quiet:!0});return}if(te==="copy-query"){let G=await xs(l.query_text||"");I(G?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",G?"ok":"warn");return}if(te==="export-json"){let G=`performance-page-${l.page}.json`;Pt(G,JSON.stringify(Da(l),null,2),"application/json;charset=utf-8"),I(`\u5DF2\u532F\u51FA ${G}`,"ok");return}if(te==="export-csv"){let G=`performance-page-${l.page}.csv`;Pt(G,Ia(l),"text/csv;charset=utf-8"),I(`\u5DF2\u532F\u51FA ${G}`,"ok")}}),oe.addEventListener("change",j=>{j.target.matches("[data-page-size]")&&(o=Number(j.target.value)||25,Vi.includes(o)||(o=25),P(1,{quiet:!0}))}),await Promise.allSettled([U(),ke()]),s||(await xe(),await P(1),Oe()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,K&&K(),ee.destroy()}}var wd=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5F9E\u696D\u4EBA\u54E1\u6709\u90A3\u4E9B\u898F\u5B9A\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function _d(){return`<div class="answer-placeholder">
    <span class="empty-icon">${g("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function er(){return`<section class="card answer-card rag-empty-answer">${_d()}</section>`}function so(e,t){return`<div class="rag-turn">
    <div class="rag-user-bubble">${r(e)}</div>
    <section class="card rag-assistant-turn" data-rag-answer>${t}</section>
  </div>`}function kd(e,t){return Promise.race([e,new Promise((s,a)=>{window.setTimeout(()=>a(new Error("pipeline lookup timed out")),t)})])}async function Sd(e){if(!e||e.pipeline_flow)return e;let t=String(e._client_request_id||e.request_id||"").trim();if(!t)return e;for(let s=0;s<3;s+=1){try{let a=await kd(V.performance({keyword:t},1,5),1800),n=(Array.isArray(a.rows)?a.rows:[]).find(i=>String(i.request_id||"")===t&&i.flow&&typeof i.flow=="object");if(n)return e.pipeline_flow=n.flow,e}catch{}s<2&&await new Promise(a=>window.setTimeout(a,250))}return e}function xd(e){return{status:e.status,answer:e.answer,answer_source:e.answer_source,notice:e.notice,citations:Array.isArray(e.citations)?e.citations:[],judgments:Array.isArray(e.judgments)?e.judgments:[],law_sources:Array.isArray(e.law_sources)?e.law_sources:[],matched_terms:Array.isArray(e.matched_terms)?e.matched_terms:[],law_answer:e.law_answer,law_framework:e.law_framework,llm_model:e.llm_model,embedding_model:e.embedding_model,duration_ms:e.duration_ms,show_sources:e.show_sources,pipeline_flow:e.pipeline_flow||null,test_run:e.test_run||null,partial:!1,streaming:!1}}var Ad={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"llama-server embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"llama-server LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function qd(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`llama-server run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`llama-server embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:Ad[t]||t||"backend step"}function ao(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function no(e){let t=Number(e);return Number.isFinite(t)?`${d(Math.max(0,Math.round(t)))} ms`:"\u2014"}function tr(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function Md(){return`<div class="rag-process is-open" id="rag-process">
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
  </div>`}function Ld(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),n=performance.now(),i=new Map,o=new Map,l=(u,v,w)=>{let _=u.querySelector(v);_&&(_.textContent=w)},p=u=>{if(u.failed){l(u.element,".rag-process-meta","\u5931\u6557");return}if(u.hasChildren){l(u.element,".rag-process-meta","");return}l(u.element,".rag-process-meta",no(u.durationMs))},f=u=>{let v=u-1,w=[...i.values()].reverse();for(let _ of w){if(v<0)break;_.depth<=v&&(_.hasChildren||(_.hasChildren=!0,_.element.dataset.hasChildren="true",_.finished&&p(_)),v=_.depth-1)}},m=u=>{if(!s)return null;let v=String(u?.seq??`step-${i.size+1}`),w=i.get(v);if(!w){let _=Math.max(0,Math.min(6,Number(u?.depth)||0));f(_);let x=document.createElement("div");x.className="rag-process-item is-running",x.dataset.processKey=v,x.style.setProperty("--depth",String(_)),x.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(x),w={element:x,depth:_,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(v,w)}return l(w.element,".rag-process-label",qd(u)),w.element.title=ao(u),w};return{step:u=>{let v=u?.segment;if(!v)return;o.set(String(v.seq??v.name??o.size),{...v});let w=m(v);if(w){if(u.type==="segment_start"){w.element.classList.add("is-running"),l(w.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(u.type==="segment_end"){let _=v.status==="error";w.element.classList.remove("is-running"),w.element.classList.toggle("is-error",_),w.finished=!0,w.failed=_,w.durationMs=Number(v.duration_ms)||0,p(w),w.element.title=[ao(v),_&&v.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(u=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(x=>{x.classList.remove("is-running");let S=x.dataset.hasChildren==="true";l(x,".rag-process-meta",S?"":u?"\u5B8C\u6210":"\u4E2D\u65B7")});let v=s?.children.length||i.size,w=no(Math.max(0,performance.now()-n));a&&(a.textContent=u?`\u5B8C\u6210 \xB7 ${v} \u6B65 \xB7 ${w}`:`\u5931\u6557 \xB7 ${v} \u6B65`);let _=[...o.values()].filter(x=>x?.name).sort((x,S)=>Number(x.offset_ms||0)-Number(S.offset_ms||0));if(s&&_.length){let x=Math.max(1,..._.map(S=>Number(S.end_offset_ms)||(Number(S.offset_ms)||0)+(Number(S.duration_ms)||0)));s.classList.add("is-waterfall"),s.innerHTML=Es(Ha(_),x,"\u5F8C\u7AEF Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B span \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002")}return t.classList.add("is-complete"),tr(t,!1),t.outerHTML},collapse:()=>tr(t,!1)}}function jd(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${g("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":Md()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${r(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function ro(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Ga(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let n=String(e||"").trim();return n?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t||n)}"
    data-source-type="${r(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(a||n)}</button>`:""}function co(e){let t=String(e?.law_name||"").trim(),s=String(e?.article_no||"").replace(/\s+/g,"");if(!t||!s)return"";let a=(Array.isArray(e?.paragraphs)?e.paragraphs:[]).map(i=>String(i||"").trim()).filter(Boolean),n=`${t}${s}${a.join("\u3001")}`;return`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t)}"
    data-source-type=""
    data-article-no="${r(s)}"
    title="\u9EDE\u64CA\u67E5\u770B ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(n)}</button>`}function uo(e){let t=String(e?.citation_status||"");return t==="cited"?"\u7B54\u6848\u5F15\u7528":t==="provided_not_cited"?"\u5DF2\u63D0\u4F9B\u7D66\u6A21\u578B\uFF0C\u7B54\u6848\u672A\u5F15\u7528":t==="reference_only"||e?.used_for_generation===!1?"\u50C5\u4F9B\u53C3\u8003\uFF08\u672A\u9032\u5165\u751F\u6210 prompt\uFF09":e?.used_for_generation===!0?"\u5DF2\u63D0\u4F9B\u7D66\u6A21\u578B":""}function Td(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(y=>`<span>${r(y)}</span>`).join(""),n=uo(e),i=n?`<span>${r(n)}</span>`:"",o=(Array.isArray(e.law_citations)?e.law_citations:[]).map(y=>co(y)).filter(Boolean).slice(0,12).join(""),l=o||(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(y=>Ga(y)).join(""),p=o?'<div class="citation-meta"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':"",f=e.jid?` data-action="open-parquet-judgment"
        data-jid="${r(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${r(e.jid)}"`:"",m=e.pdf_url?`<a class="citation-link" href="${r(e.pdf_url)}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${g("external",11)}</a>`:"";return`<article class="citation">
    <span class="citation-index">[${e.index??t+1}]</span>
    <div class="citation-body">
      <div class="citation-head"${f}>
        <h4 class="citation-name">${r(e.jid||"\u672A\u77E5\u6848\u865F")}</h4>
        <div class="citation-meta">${a||"<span>\u5224\u6C7A metadata</span>"}${i}</div>
        ${e.title?`<div class="citation-meta"><span>\u6848\u7531\uFF1A${r(e.title)}</span></div>`:""}
      </div>
      ${p}
      ${l?`<div class="chips" style="margin-top:8px">${l}</div>`:""}
      ${e.snippet?`<p class="citation-snippet">${r(e.snippet)}</p>`:""}
    </div>
    <div class="citation-links">${m}</div>
  </article>`}function Nd(e){let t=[e.court,e.jdate].filter(Boolean).map(n=>`<span>${r(n)}</span>`).join(""),s=[e.vector_score!==null&&e.vector_score!==void 0?`\u5411\u91CF ${Number(e.vector_score).toFixed(4)}`:"",e.rerank_score!==null&&e.rerank_score!==void 0?`rerank ${Number(e.rerank_score).toFixed(4)}`:""].filter(Boolean).map(n=>`<span>${r(n)}</span>`).join("");return`<article class="citation reference-judgment">
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
  </article>`}function Ed(e,t){let s=[e.law_level,e.law_category,e.article_count?`${d(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${r(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${g("external",11)}</a>`:"",n=e.law_key||e.law_name||"",i=n?` data-action="open-law-source"
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
  </article>`}function Rd(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",n=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${r(s)}</span>`,a,e.law_category,e.article_count?`${d(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${Rt(e.law_modified_date)}`:"",uo(e)].filter(Boolean).map(u=>`<span>${u}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${r(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${r(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${r(o.entity||"")}\u300D\u7684\u5224\u6C7A ${d(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${d(o.law_count||0)} \u6B21</span>
      </div>`:"",p=e.law_key||"",f=e.source_type||"",m=(Array.isArray(e.articles)?e.articles:[]).map(u=>{let v=String(u.article_no||"");return`<div class="law-source-article"${p&&v?` data-action="open-law-source"
        data-law-key="${r(p)}"
        data-source-type="${r(f)}"
        data-article-no="${r(v)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${r(v)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} ${r(v)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${r(u.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${r(u.article_content||"")}</p>
      </div>`}).join(""),y=e.law_url?`<a class="citation-link" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${g("external",11)}</a>`:"",b=e.law_key?` data-action="open-law-source"
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
      ${m}
    </div>
    <div class="citation-links">${y}</div>
  </article>`}function Cd(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function Pd(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${r(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",n=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(n==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),p=s.index!=null?`<span class="law-answer-index">[${r(String(s.index))}]</span>`:"",f=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${r(a)}"
            data-source-type="${r(n)}"
            title="\u9EDE\u64CA\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587">${r(i)}</button>`:`<strong>${r(i)}</strong>`,m=Array.isArray(s.articles)?s.articles:[],y=m.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${m.map(b=>{let u=String(b.article_no||"").trim(),v=Cd(b.article_content);return!a||!u?`<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${r(u||"\u689D\u6587")}</span>
                  <span class="law-answer-article-text">${r(v)}</span>
                </div>`:`<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${r(a)}"
                data-source-type="${r(n)}"
                data-article-no="${r(u)}"
                title="\u9EDE\u64CA\u67E5\u770B ${r(u)} \u7684\u5B8C\u6574\u5167\u5BB9"
                aria-label="\u958B\u555F ${r(i)} ${r(u)} \u7684\u5B8C\u6574\u689D\u6587">
                <span class="law-answer-article-no">${r(u)}</span>
                <span class="law-answer-article-text">${r(v)}</span>
              </button>`}).join("")}</div>`:"";return`<div class="law-answer-source">
        <div class="law-answer-source-head">
          ${f}
          <span class="law-answer-source-meta">\uFF08${r(o)}\uFF0C${d(l)} \u689D\uFF09</span>
          ${p}
        </div>
        ${y}
      </div>`}).join("")}</div>`}function Id(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let n=s.get(String(a));return n?.law_key?Ga(a,{lawKey:n.law_key,sourceType:n.source_type||""}):`<span class="chip">${r(a)}</span>`}).join("")}</div>`}function Dd(e){let t=String(e||"");return t==="operational"?"is-ok":t==="standby"?"is-idle":"is-down"}function Bd(e){let t=String(e||"");return t==="operational"?"":t==="standby"?"\u5099\u63F4":t==="disabled"?"\u505C\u7528":t==="not_configured"?"\u672A\u8A2D\u5B9A":"\u96E2\u7DDA"}function io(e,{fallback:t=!1}={}){if(!e)return`<span class="rag-model-cell is-empty">
      <span class="rag-model-state is-idle" aria-hidden="true"></span>
      <span class="rag-model-name">\u672A\u8A2D\u5B9A</span>
    </span>`;let s=String(e.label||"").trim()||[e.host,e.model].filter(Boolean).join(":"),a=String(e.status||""),n=!["operational","standby"].includes(a),i=t&&!n?"\u5099\u63F4":Bd(a),o=n?"is-down":t?"is-idle":Dd(a),l=[s,e.url,i].filter(Boolean).join(" \xB7 ");return`<span class="rag-model-cell" title="${r(l)}">
    <span class="rag-model-state ${o}" aria-hidden="true"></span>
    <span class="rag-model-name">${r(s)}</span>
    ${i?`<span class="rag-model-note">${r(i)}</span>`:""}
  </span>`}function Fd(e,t){let s=Array.isArray(e)?e:[],a=[{kind:"chat",label:"Chat"},{kind:"embedding",label:"Embedding"},{kind:"rerank",label:"Rerank"}],n=new Map(s.map(o=>[String(o.kind||""),o])),i=a.map(o=>{let l=n.get(o.kind)||o;return`<tr>
        <td class="rag-model-kind">${r(l.label||o.label)}</td>
        <td>${io(l.active)}</td>
        <td>${io(l.fallback,{fallback:!0})}</td>
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
  </div>`}function za({tone:e,title:t,text:s,modelSummary:a=[],refreshing:n=!1}){let i=e==="ok"?"is-ok":e==="warn"?"is-warn":"is-info",o=e==="ok"?"check":e==="warn"?"alert":"info",l=e==="ok"?"badge-ok":e==="warn"?"badge-warn":"badge-info";return`<section class="rag-mode-card ${i}">
    <div class="rag-mode-head">
      <span class="rag-mode-icon" aria-hidden="true">${g(o,14)}</span>
      <div class="rag-mode-copy">
        <strong>${r(t)}</strong>
        <p>${r(s)}</p>
      </div>
      <span class="badge ${l}">3 \u500B\u6A21\u578B</span>
    </div>
    ${Fd(a,n)}
  </section>`}function po(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.reference_judgments)?e.reference_judgments:[],n=Array.isArray(e.law_sources)?e.law_sources:[],i=e.retrieval||{},o=Array.isArray(e.matched_terms)?e.matched_terms:[],l=e.status||"preview",p=!!e.partial,f=!!e.streaming,m=!!e.rerank_degraded,y=!!e.show_sources||!p,b=e.answer_source==="structured",u=String(e.law_answer||"").trim(),v=e.law_framework||null,w=Array.isArray(v?.rows)?v.rows:[],_=Array.isArray(v?.sources)?v.sources:[],x=w.length>0,S=!!u&&!b&&!x,k=s.filter(he=>he.used_for_generation===!0).length,D=s.some(he=>he.used_for_generation!==void 0),oe=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46${D?`\uFF08${k} \u7B46\u9032\u5165 prompt\uFF09`:""}</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((he,ke)=>Td(he,ke)).join("")}</div>`:"",O=i.judgment_limit_applied&&a.length?`<div class="reference-judgment-note">
          <span>\u672C\u984C\u4F9D\u984C\u610F\u4E3B\u8981\u8A62\u554F\u6CD5\u898F\u898F\u5B9A\uFF0C\u6545\u5224\u6C7A\u50C5\u986F\u793A ${s.length} \u7B46\u4F5C\u70BA\u53C3\u8003\u3002\u53E6\u6709 ${a.length} \u7B46\u76F8\u95DC\u5224\u6C7A\uFF08${a.some(he=>he.rerank_score!==null&&he.rerank_score!==void 0)?"\u4F9D rerank \u5206\u6578\u6392\u5E8F":"\u4F9D\u6AA2\u7D22\u5206\u6578\u6392\u5E8F"}\uFF09\uFF0C</span>
          <details class="reference-judgments">
            <summary>\u5C55\u958B\u67E5\u770B</summary>
            <div class="citation-list reference-judgment-list">${a.map(he=>Nd(he)).join("")}</div>
          </details>
        </div>`:"",be=n.length&&!S?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${n.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${n.map((he,ke)=>Rd(he,ke)).join("")}</div>`:"",fe=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((he,ke)=>Ed(he,ke)).join("")}</div>`:"",W=y?oe+O+be+fe:"";!W&&!p&&!S&&!x&&(W=`<div class="answer-divider"></div>
      ${ct({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:l==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let L=Id(o,n),q=e.test_run,E=String(e.llm_model||q?.primary_model||"").trim(),X=String(e.embedding_model||"").trim(),ee=[E?`LLM\uFF1A${E}`:"",X?`Embedding\uFF1A${X}`:""].filter(Boolean).join(" \xB7 "),F=f||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",ie=x?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${r(v.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${w.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${w.map(he=>`<tr>
                    <td>${r(he.law_name||"\u2014")}</td>
                    <td class="cell-number">${r(he.article_no||"\u2014")}</td>
                    <td>${r(he.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${_.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${_.map(he=>{let ke=String(he?.law_name||he||"").trim(),xe=he&&he.index!==null&&he.index!==void 0?` [${r(he.index)}]`:"";return Ga(ke,{label:`${ke}${xe}`})}).join("")}
              </div>`:""}
      </div>`:"",_e=e.answer_source==="llm"&&E?`<span class="answer-model" title="${r(ee)}">${g("brain",11)}${r(E)}</span>`:b?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${g("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",z=f?`${E||"LLM"} \xB7 \u751F\u6210\u4E2D`:_e?E||"structured":"retrieval",ve=q?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${Je(q.status)}
          <span class="mono">${r(q.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(q.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(q.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${r(q.primary_model||"\u2014")}</span>
          <span>${Number(q.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",Z=e.pipeline_flow&&typeof e.pipeline_flow=="object"?e.pipeline_flow:null,Se=!p&&Z?Oa(Z,{serverDurationMs:Number(e.duration_ms)||0,embedded:!0}):"",K=String(e.answer||"").trim()||(f?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":p?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),re=f?" data-partial-answer":"",me=f?" is-streaming":"";return`${ie}
      ${S?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${p&&!y?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${n.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${Pd(n,u)}</div>
            </div>`:""}
      <div class="answer-block">
        ${S||x?`<div class="answer-block-head">
                <span>${r(F)}</span>
                <span>${r(z)}</span>
              </div>`:""}
        <p class="answer-text${me}"${re}>${r(K)}</p>
      </div>
      ${m?'<div class="answer-notice" data-rerank-degraded="true">\u6392\u5E8F\u7CBE\u7C21\u6A21\u5F0F\uFF1A\u672C\u6B21\u90E8\u5206 rerank \u903E\u6642\u6216\u964D\u7D1A\uFF0C\u4F86\u6E90\u53EF\u80FD\u4EE5\u5411\u91CF\u9806\u5E8F\u986F\u793A\u3002</div>':""}
      ${e.notice?`<div class="answer-notice">${r(e.notice)}</div>`:""}
      ${ve}
      ${L}
      ${W}
      ${Se}`}function oo(e,t,s=""){let a=t.status||"preview",n=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),p=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),f=t.answer_source==="structured",m=t.answer_source==="llm"&&o?`<span class="answer-model" title="${r(p)}">${g("brain",11)}${r(o)}</span>`:f?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${g("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${g("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${Je(a,n)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${m}
      </div>
      ${s}
    </div>
    <div class="answer-body">${po(t)}</div>`}function Od(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${g("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${Ce({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function Hd(e){let t=Array.isArray(e.turns)?e.turns:[],s=t.length?t[t.length-1].payload||{}:e.payload||{},a=Array.isArray(s.citations)?s.citations.length:0,n=Array.isArray(s.judgments)?s.judgments.length:0,i=Array.isArray(s.law_sources)?s.law_sources.length:0;return a+n+i}function zd(e,t,s,a=null){let n=e.id??s,i=Hd(e),o=t.get(String(e.project_id||"")),l=Array.isArray(e.turns)?e.turns:[],p=e.updated_at||e.created_at,f=a!=null&&String(a)===String(n);return`<div class="rag-history-item${e.pinned?" is-pinned":""}${f?" is-active":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${r(String(n))}">
      <span class="history-question">${r(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${r(Hs(p))}</span>
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
  </div>`}function lo(e,t,s){let a=new Map;for(let i of t){let o=String(i.project_id||"");o&&a.set(o,(a.get(o)||0)+1)}let n=[`<button class="rag-project${s?"":" is-active"}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${s?"false":"true"}">
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
  </div>`),n.join("")}async function Gd(e){let t=!1,s=[],a=!1,n=[],i=!1,o="",l=8,p="",f=0,m=null,y=[],b=!1,u=!1,v={embedding:[],llm:[]},w=null,_=null,x=!1;e.innerHTML=`<section class="page rag-page">
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
      <div id="rag-mode-notice">${Ce({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
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
        ${wd.map(c=>`<button class="example-chip" type="button" data-question="${r(c)}">${r(c)}</button>`).join("")}
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
  </section>`;let S=e.querySelector("#rag-form"),k=e.querySelector("#rag-question"),D=e.querySelector("#rag-submit"),oe=e.querySelector(".rag-page"),O=e.querySelector("#rag-turns"),be=e.querySelector("#rag-followup-form"),fe=e.querySelector("#rag-followup-question"),W=e.querySelector("#rag-followup-submit"),L=e.querySelector("#rag-history"),q=e.querySelector("#rag-storage-note"),E=e.querySelector("#rag-clear-history"),X=e.querySelector(".rag-library"),ee=e.querySelector("#rag-pinned-body"),F=e.querySelector("#rag-projects-body"),ie=e.querySelector("#rag-pinned-count"),_e=e.querySelector("#rag-projects-count"),z=e.querySelector("#rag-recent-count"),ve=e.querySelector("#rag-library-context"),Z=e.querySelector("#rag-test-mode"),Se=e.querySelector("#rag-test-flow"),pe=e.querySelector("#rag-history-menu"),K=e.querySelector("#rag-judgment-dialog"),re=e.querySelector("#rag-law-dialog"),me=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};K?.addEventListener("close",me),re?.addEventListener("close",me);let he=null,ke=null,xe,Ee=null,Oe=null,P=()=>{k.style.height="auto",k.style.height=`${Math.min(k.scrollHeight,220)}px`},U=()=>{fe.style.height="auto",fe.style.height=`${Math.min(fe.scrollHeight,160)}px`},j=c=>{b=!!c,oe.classList.toggle("has-conversation",b)},B=()=>{b&&(be.hidden=!1,U())},te=()=>{be.hidden=!0},G=()=>{pe.hidden&&!Oe||(pe.hidden=!0,pe.innerHTML="",Oe&&Oe.setAttribute("aria-expanded","false"),Ee=null,Oe=null)},Re=(c,$)=>{let M=O.querySelector(".rag-empty-answer");M&&M.remove(),O.insertAdjacentHTML("beforeend",so(c,$));let T=O.lastElementChild,C=T?.querySelector("[data-rag-answer]");return window.requestAnimationFrame(()=>{T?.scrollIntoView({behavior:"smooth",block:"start"})}),{turnElement:T,answerElement:C}},Le=()=>{O.innerHTML=y.length?y.map(c=>so(c.question,oo(c.question,c.payload||{},""))).join(""):er()},Ie=c=>{let $=Array.isArray(c.turns)?c.turns:[];return $.length?(f+=1,ot(),yt(null),m=c.id??null,y=$.map(M=>({...M})),p=y[y.length-1]?.question||"",j(!0),Le(),B(),Qe(),Me(D,!1),Me(W,!1),window.setTimeout(()=>{be.scrollIntoView({behavior:"smooth",block:"end"})},50),!0):!1},Qe=()=>{if(t)return;if(G(),!a){L.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',ee.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',ie.textContent="0",z.textContent="0",i&&(F.innerHTML=lo(n,[],o));return}let c=n.find(J=>String(J.id)===o)||null;o&&!c&&(o="");let $=new Map(n.map(J=>[String(J.id),J])),M=s.filter(J=>!!J.pinned),T=s.filter(J=>!J.pinned),C=o?T.filter(J=>String(J.project_id||"")===o):T,ne=C.slice(0,l),Q=(J,ge)=>zd(J,$,ge,m);ee.innerHTML=M.length?M.map(Q).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',F.innerHTML=lo(n,s,o),L.innerHTML=ne.length?ne.map(Q).join(""):`<div class="rag-library-empty">${o?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u672A\u91D8\u9078\u7684\u9805\u76EE\u3002":M.length?"\u6700\u8FD1\u7684\u9805\u76EE\u90FD\u5DF2\u91D8\u9078\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,C.length>l&&L.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${d(C.length-l)} \u7B46</button>`),ie.textContent=String(M.length),_e.textContent=String(n.length),z.textContent=String(C.length),c?(ve.hidden=!1,ve.innerHTML=`<span>${g("folder",12)}<strong>${r(c.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${g("x",12)}</button>`):(ve.hidden=!0,ve.innerHTML="")},mt=async()=>{try{let c=await ds("rag.projects",[]);n=Array.isArray(c)?c.map($=>({id:String($?.id||""),name:String($?.name||"").trim()})).filter($=>$.id&&$.name):[]}catch{n=[]}i=!0,t||Qe()},de=c=>{o=String(c||""),l=8,Qe()},We=()=>{let c=F.querySelector('[data-rag-form="project"]');c&&(c.hidden=!1,c.querySelector("input")?.focus())},nt=()=>{let c=F.querySelector('[data-rag-form="project"]');c&&(c.hidden=!0,c.reset())},gt=async c=>{let $=c.elements.project_name,M=String($?.value||"").trim();if(!M){I("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),$?.focus();return}if(n.some(C=>C.name.toLowerCase()===M.toLowerCase())){I("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),$?.focus();return}let T=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;n=[...n,{id:T,name:M.slice(0,60),created_at:new Date().toISOString()}],o=T,l=8,await Ys("rag.projects",n),Qe(),I(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${M}\u300D\u3002`,"ok")},Xe=async c=>{let $=s.find(C=>String(C.id)===String(c));if(!$)return;let M=!$.pinned;if(!await Ks($.id,{pinned:M})){I("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}$.pinned=M,Qe(),I(M?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},et=()=>{f+=1,ot(),yt(null),p="",m=null,y=[],j(!1),te(),O.innerHTML=er(),k.value="",P(),fe.value="",U(),Me(D,!1),Me(W,!1),Qe(),K?.open&&K.close(),re?.open&&re.close(),k.focus(),window.scrollTo({top:0,behavior:"smooth"})},ft=c=>{if(!c||pe.hidden)return;let $=c.getBoundingClientRect(),M=pe.getBoundingClientRect(),T=6,C=$.bottom+T;C+M.height>window.innerHeight-8&&(C=Math.max(8,$.top-M.height-T));let ne=$.right-M.width;ne=Math.max(8,Math.min(ne,window.innerWidth-M.width-8)),pe.style.left=`${Math.round(ne)}px`,pe.style.top=`${Math.round(C)}px`},se=c=>{pe.innerHTML=`
      <button type="button" role="menuitem" data-menu-action="rename">${g("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${g("pin",13)}<span>${c.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${g("link",13)}<span>\u5206\u4EAB</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${g("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${g("trash",13)}<span>\u522A\u9664</span></button>`},$e=c=>{let $=String(c.project_id||""),M=[{id:"",name:"\u672A\u5206\u985E"},...n.map(T=>({id:String(T.id),name:T.name}))];pe.innerHTML=`
      <div class="rag-history-menu-head">${g("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${M.map(T=>`<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${r(T.id)}">
            <span class="rag-history-menu-check">${$===T.id?g("check",12):""}</span>
            <span>${r(T.name)}</span>
          </button>`).join("")}
      ${n.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${g("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},ze=(c,$)=>{let M=s.find(T=>String(T.id)===String($));M&&(G(),Ee=String(M.id),Oe=c,se(M),pe.hidden=!1,c.setAttribute("aria-expanded","true"),ft(c))},Ge=async c=>{let $=window.prompt("\u91CD\u65B0\u547D\u540D\u5C0D\u8A71",c.title||"");if($===null)return;let M=$.trim();if(!M){I("\u540D\u7A31\u4E0D\u80FD\u7A7A\u767D\u3002","warn");return}if(M===c.title)return;if(!await Ks(c.id,{title:M})){I("\u91CD\u65B0\u547D\u540D\u5931\u6557\u3002","danger");return}c.title=M,Qe(),I("\u5C0D\u8A71\u5DF2\u91CD\u65B0\u547D\u540D\u3002","ok")},at=async c=>{let $=Array.isArray(c.turns)?c.turns:[],M=[`# ${c.title||"\u672A\u547D\u540D\u5C0D\u8A71"}`,""];if($.length)for(let C of $){M.push("## \u554F\u984C","",C.question||"",""),M.push("## \u56DE\u7B54","",C.payload?.answer||"\uFF08\u6C92\u6709\u56DE\u7B54\u5167\u5BB9\uFF09","");let ne=Array.isArray(C.payload?.law_sources)?C.payload.law_sources.map(Q=>Q.law_name).filter(Boolean):[];ne.length&&M.push(`\u5F15\u7528\uFF1A${[...new Set(ne)].join("\u3001")}`,"")}else M.push(c.title||"");let T=await xs(M.join(`
`));I(T?"\u5C0D\u8A71\u5167\u5BB9\u5DF2\u8907\u88FD\uFF0C\u53EF\u76F4\u63A5\u8CBC\u4E0A\u5206\u4EAB\u3002":"\u7121\u6CD5\u8907\u88FD\u5C0D\u8A71\u5167\u5BB9\u3002",T?"ok":"warn")},Tt=async c=>{if(!window.confirm(`\u522A\u9664\u5C0D\u8A71\u300C${c.title||"\u672A\u547D\u540D\u5C0D\u8A71"}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002`))return;if(!await di(c.id)){I("\u522A\u9664\u5931\u6557\u3002","danger");return}let M=m!==null&&String(m)===String(c.id);s=s.filter(T=>String(T.id)!==String(c.id)),M?et():Qe(),I("\u5C0D\u8A71\u5DF2\u522A\u9664\u3002","ok")},A=async(c,$)=>{if(!await Ks(c.id,{project_id:$})){I("\u79FB\u81F3\u5C08\u6848\u5931\u6557\u3002","danger");return}c.project_id=$;let T=n.find(C=>String(C.id)===String($));Qe(),I(T?`\u5DF2\u79FB\u81F3\u5C08\u6848\u300C${T.name}\u300D\u3002`:"\u5DF2\u79FB\u51FA\u5C08\u6848\u3002","ok")},N=async c=>{let $=c.target.closest("[data-menu-action]");if(!$)return;let M=s.find(C=>String(C.id)===Ee);if(!M){G();return}let T=$.dataset.menuAction;T==="rename"?(G(),await Ge(M)):T==="toggle-pin"?(G(),await Xe(M.id)):T==="share"?(G(),await at(M)):T==="move"?($e(M),ft(Oe)):T==="assign-project"?(G(),await A(M,$.dataset.projectId||"")):T==="back"?(se(M),ft(Oe)):T==="delete"&&(G(),await Tt(M))},R=c=>{pe.hidden||(typeof c.composedPath=="function"?c.composedPath():[]).includes(pe)||pe.contains(c.target)||c.target.closest('[data-rag-action="open-history-menu"]')||G()},H=c=>{c.key==="Escape"&&G()},Y=c=>{c.target instanceof Node&&pe.contains(c.target)||G()},ae=async()=>{try{if(s=await Ma({limit:120}),t)return;a=!0,Qe(),q.textContent=Vs()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;s=[],a=!0,Qe(),L.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},ce=async(c,$,M,T)=>{let C=y,ne=m;C.push({question:c,asked_at:new Date().toISOString(),payload:xd($)});let Q=Array.isArray($.citations)?$.citations:[],J=Array.isArray($.judgments)?$.judgments:[],ge={question:c,status:$.status,citations:Q.map(Ke=>Ke.law_name),judgments:J.map(Ke=>Ke.jid)},we=`${$.status||"preview"} \xB7 ${C.length} \u8F2A`,Ae=new Date().toISOString(),Ue=Ke=>{T===f&&(m=Ke)};if(ne){if(!await Ks(ne,{turns:C,detail:we,payload:ge,updated_at:Ae})){let Gt=await Ws({kind:"rag",title:C[0]?.question||c,detail:we,project_id:M,turns:C,payload:ge,updated_at:Ae});Ue(Gt)}}else{let Ke=await Ws({kind:"rag",title:C[0]?.question||c,detail:we,project_id:M,turns:C,payload:ge,updated_at:Ae});Ue(Ke)}await ae()},Te=()=>{let c=e.querySelector("#rag-mode-notice");if(!c)return;let $=Array.isArray(w?.model_summary)?w.model_summary:[];if(!w){if(!_)return;c.innerHTML=za({tone:"warn",title:"\u7121\u6CD5\u53D6\u5F97 RAG \u670D\u52D9\u72C0\u614B",text:_.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u524D\u5F80\u7CFB\u7D71\u72C0\u614B\u9801\u67E5\u770B\u3002",modelSummary:$,refreshing:x});return}let M=w.data||{},T=(w.services||[]).find(Q=>Q.id==="rag"),C=Number(M.judgment_indexed_count||0),ne=Number(M.judgment_count||0);T?.status==="operational"?c.innerHTML=za({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${d(C)} / ${d(ne)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`,modelSummary:$,refreshing:x}):T?.status==="degraded"?c.innerHTML=za({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:T.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002",modelSummary:$,refreshing:x}):c.innerHTML=za({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:T?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002",modelSummary:$,refreshing:x})},Pe=async()=>{try{let c=await V.status();if(t)return;w=c,_=null}catch(c){if(t)return;w=null,_=c}Te()},Ne=async()=>{if(!x){x=!0,Te();try{let c=await V.status();if(t)return;w=c,_=null,I("\u5DF2\u66F4\u65B0\u6A21\u578B\u72C0\u614B\u3002","ok",2500)}catch(c){I(c.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u3002","danger",6e3)}finally{x=!1,t||Te()}}},Fe=()=>{if(!Z)return;if(!u){Z.innerHTML="";return}let c=Array.isArray(v.embedding)?v.embedding.length:0,$=Array.isArray(v.llm)?v.llm.length:0;Z.innerHTML=Ce({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${c} \u500B embedding \u8207 ${$} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},tt=async()=>{try{let c=await V.testMode();if(t)return;u=!!c.enabled,v=c.models||{embedding:[],llm:[]},Fe()}catch{if(t)return;u=!1,Fe()}},rt=c=>{u=!!c.detail?.enabled,v=c.detail?.models||{embedding:[],llm:[]},Fe()};window.addEventListener("judgment:test-mode",rt);let yt=c=>{if(!Se)return;ke=c||null;let $=JSON.stringify(c?{run_id:c.run_id,status:c.status,progress:c.progress,total_ms:c.total_ms,stage:c.stage,answer:c.answer||"",steps:(c.steps||[]).map(M=>`${M.stage}:${M.model}:${M.status}:${M.progress}:${M.duration_ms}`)}:null);$!==xe&&(xe=$,Se.innerHTML=c?Rs(c,[],"",{showHistory:!1}):"")},ot=()=>{he&&(he(),he=null)},Is=async(c=null)=>{if(!t)try{let $=c||await V.testRunCurrent();if(t)return;let M=$.run;M&&M.status==="running"&&yt(M)}catch{}},la=()=>{t||he||(Is(),he=ht("test-runs",(c,$)=>Is($?.snapshot||null)))},ca=async c=>{if(!c){yt(null);return}try{let $=await V.testRun(c);if(t)return;yt($.run||null)}catch{t||I("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},Ds=async()=>{if(u)try{let c=await V.testRunCurrent();if(t)return;c.run?.status==="running"&&(yt(c.run),la())}catch{}},qt=0,Bs=(c,$)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${r(c)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${g("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${$}</div>`,tn=c=>{let $=(Array.isArray(c.citations)?c.citations:[]).map(Q=>co(Q)).filter(Boolean).join(""),M=$||(Array.isArray(c.matched_laws)?c.matched_laws:[]).map(Q=>Ga(Q)).join(""),T=[c.court,c.jdate,c.title?`\u6848\u7531\uFF1A${c.title}`:"",c.full_text_length?`${d(c.full_text_length)} \u5B57`:"",c.citation_count?`\u5F15\u7528 ${d(c.citation_count)} \u7B46`:""].filter(Boolean).map(Q=>`<span>${r(Q)}</span>`).join(""),C=c.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${r(String(c.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",ne=c.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(c.pdf_url)}" target="_blank" rel="noopener noreferrer">${g("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return Bs(c.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${r(c.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${T}
      </div>
      ${$?'<div class="citation-meta" style="margin-top:8px"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':""}
      ${M?`<div class="chips" style="margin:8px 0 10px">${M}</div>`:""}
      <div class="judgment-dialog-source">${C}</div>
      <pre class="judgment-dialog-text">${r(c.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${ne}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},da=async c=>{if(!K||!c)return;let $=++qt;K.open||K.showModal(),me(),K.innerHTML=Bs("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${r(c)}\u2026</span>
      </div>`);try{let M=await V.judgmentDetail(c,"parquet");if(t||$!==qt)return;K.innerHTML=tn(M)}catch(M){if(t||$!==qt)return;K.innerHTML=Bs("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(M.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},Fs=0,ks=(c,$)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${r(c)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${g("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${$}</div>`,ua=(c,$="")=>{let M=String(c.selected_article_no||$||"").trim(),T=!!M,C=Array.isArray(c.articles)?c.articles:[],ne=C.map(He=>{let St=String(He.article_content||"").trim();return St?He.article_type==="C"?`<div class="law-chapter">${r(St)}</div>`:`<article class="law-article" data-article-no="${r(ro(He.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${r(He.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${r(St)}</div>
        </article>`:""}).join(""),Q=(Array.isArray(c.warnings)?c.warnings:[]).map(He=>r(He)).join("<br />"),J=c.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",ge=c.meta?.articles_source,we=ge==="parquet"?"Parquet \u689D\u6587":ge==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",Ae=c.meta?.snapshot||"",Ue=[c.law_level,c.law_category,c.article_count?`${d(c.article_count)} \u689D`:"",c.law_modified_date?`\u7570\u52D5 ${Rt(c.law_modified_date)}`:""].filter(Boolean).map(He=>`<span>${r(He)}</span>`).join(""),Ke=c.law_url?`<a class="btn btn-secondary btn-sm" href="${r(c.law_url)}" target="_blank" rel="noopener noreferrer">${g("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",Gt=!T&&c.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${r(c.law_histories)}</div>
        </details>`:"",Nt=T?`<span class="badge badge-mono">${r(M)}</span>`:"",je=!T&&C.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",Ve=T?`${c.law_name||c.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${M}`:c.law_name||c.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return ks(Ve,`<div class="judgment-dialog-meta">
        <span class="badge ${c.source_type==="order"?"badge-warn":"badge-info"}">${r(J)}</span>
        ${Nt}
        ${Ue}
      </div>
      <div class="judgment-dialog-source">${r([we,Ae].filter(Boolean).join(" \xB7 "))}</div>
      ${Q?`<div class="law-dialog-warning">${Q}</div>`:""}
      ${Gt}
      ${je}
      <div class="law-dialog-articles">${ne||`<div class="report-empty-inline">${T?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${Ke}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},Os=(c,$)=>{let M=c?.querySelector(`#${$}`),T=ro(M?.value||"");if(!T){I("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),M?.focus();return}let C=[...c?.querySelectorAll("[data-article-no]")||[]].find(ne=>ne.dataset.articleNo===T);if(!C){I(`\u627E\u4E0D\u5230\u7B2C ${T} \u689D\u3002`,"warn");return}C.scrollIntoView({behavior:"instant",block:"center"}),C.classList.add("is-jump-target"),window.setTimeout(()=>C.classList.remove("is-jump-target"),2400)},Ss=async(c,$="",M="")=>{if(!re||!c)return;let T=++Fs;re.open||re.showModal(),me(),re.innerHTML=ks(M?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${r([c,M].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let C=await V.lawDetail(c,$,"",M);if(t||T!==Fs)return;re.innerHTML=ua(C,M)}catch(C){if(t||T!==Fs)return;re.innerHTML=ks("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(C.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};re?.addEventListener("click",c=>{let $=c.target.closest('[data-action="jump-law-article"]');if($){Os(re,$.dataset.jumpInput||"rag-law-article-jump");return}if(c.target.closest('[data-action="close-law-source"]')){re.close();return}let M=re.getBoundingClientRect();(c.clientX<M.left||c.clientX>M.right||c.clientY<M.top||c.clientY>M.bottom)&&re.close()}),re?.addEventListener("keydown",c=>{!c.target.matches(".law-jump-input")||c.key!=="Enter"||(c.preventDefault(),Os(re,c.target.id))}),K?.addEventListener("click",c=>{let $=c.target.closest('[data-action="open-law-source"]');if($){Ss($.dataset.lawKey||"",$.dataset.sourceType||"",$.dataset.articleNo||"");return}if(c.target.closest('[data-action="close-parquet-judgment"]')){K.close();return}let M=K.getBoundingClientRect();(c.clientX<M.left||c.clientX>M.right||c.clientY<M.top||c.clientY>M.bottom)&&K.close()}),O.addEventListener("click",c=>{let $=c.target.closest(".rag-process-toggle");if($){let T=$.closest(".rag-process"),C=$.getAttribute("aria-expanded")==="true";tr(T,!C);return}let M=c.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(M){if(M.dataset.action==="open-law-source"){Ss(M.dataset.lawKey||"",M.dataset.sourceType||"",M.dataset.articleNo||"");return}da(M.dataset.jid||"")}}),O.addEventListener("keydown",c=>{if(c.key!=="Enter"&&c.key!==" ")return;let $=c.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!$||$.closest("a, button"))){if(c.preventDefault(),$.dataset.action==="open-law-source"){Ss($.dataset.lawKey||"",$.dataset.sourceType||"",$.dataset.articleNo||"");return}da($.dataset.jid||"")}});let ms=async(c,{fresh:$=!1,source:M="hero"}={})=>{let T=c.trim();if(!T){I("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),(M==="followup"?fe:k).focus();return}($||!b)&&(m=null,y=[],O.innerHTML="",Qe());let C=++f,ne=()=>t||C!==f,Q=o;p=T,j(!0),te(),M==="followup"?(fe.value="",U()):(k.value="",P());let{answerElement:J}=Re(T,jd(T,u)),ge=u?null:Ld(J);u?(yt(null),la()):(ot(),yt(null)),Me(D,!0,"\u6AA2\u7D22\u4E2D\u2026"),Me(W,!0,"\u6AA2\u7D22\u4E2D\u2026");let we=null,Ae="",Ue=je=>{if(ne()||!je?.partial)return;let Ve=J.querySelector(".answer-body");if(!Ve)return;we=je,Ae=String(je.answer||""),Ve.innerHTML=po(je),ge?.collapse?.();let He=J.querySelector(".answer-head-title");He&&(He.textContent=je.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},Ke=je=>{if(ne()||!je||!we?.streaming)return;Ae+=je;let Ve=J.querySelector("[data-partial-answer]");Ve&&(Ve.textContent=Ae)},Gt=()=>{if(ne()||!we?.streaming)return;Ae="";let je=J.querySelector("[data-partial-answer]");je&&(je.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")},Nt=je=>{if(ne())return;let Ve=J.querySelector(".answer-body");if(!Ve)return;let He=Ve.querySelector("[data-summary-queue]");He||(He=document.createElement("div"),He.className="answer-notice",He.dataset.summaryQueue="true",Ve.appendChild(He));let St=Number(je.position||0),gs=Number(je.eta_s||0),fs=je.lane==="summary"?"\u6458\u8981":"\u6AA2\u7D22";He.textContent=`${fs}\u6392\u968A\u4E2D\uFF1A\u524D\u9762 ${St} \u4F4D\uFF0C\u9810\u4F30\u7D04 ${Math.round(gs)} \u79D2\u3002`};try{let je=u?await V.rag(T,{testMode:u}):await V.ragStream(T,{onStep:He=>{ne()||ge?.step(He)},onPartial:Ue,onQueued:Nt,onToken:Ke,onTokenReset:Gt});if(ne())return;ot();let Ve=ge?.finish(!0)||"";if(J.innerHTML=oo(T,je,Ve),je.pipeline_flow||Sd(je).then(()=>{if(ne()||!je.pipeline_flow)return;let He=J.querySelector(".answer-body");if(!He||He.querySelector(".rag-wf-card"))return;let St=Oa(je.pipeline_flow,{serverDurationMs:Number(je.duration_ms)||0,embedded:!0});St&&He.insertAdjacentHTML("beforeend",St)}),je.test_run?.run_id?await ca(je.test_run.run_id):yt(null),await ce(T,je,Q,C),ne())return;B()}catch(je){if(ne())return;ot();let Ve=ge?.finish(!1)||"";J.innerHTML=Od(je,Ve),B(),I(je.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{ne()||(ot(),Me(D,!1),Me(W,!1))}};S.addEventListener("submit",c=>{c.preventDefault(),ms(k.value,{fresh:!0,source:"hero"})}),be.addEventListener("submit",c=>{c.preventDefault(),ms(fe.value,{fresh:!1,source:"followup"})}),k.addEventListener("input",P),k.addEventListener("keydown",c=>{c.key==="Enter"&&!c.shiftKey&&!c.isComposing&&(c.preventDefault(),S.requestSubmit())}),fe.addEventListener("input",U),fe.addEventListener("keydown",c=>{c.key==="Enter"&&!c.shiftKey&&!c.isComposing&&(c.preventDefault(),be.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",c=>{let $=c.target.closest("[data-question]");$&&(k.value=$.dataset.question,P(),S.requestSubmit())}),e.addEventListener("click",async c=>{c.target.closest('[data-rag-action="refresh-models"]')&&await Ne()}),X.addEventListener("click",async c=>{let $=c.target.closest("[data-rag-toggle]");if($){let J=$.closest(".rag-library-section").classList.toggle("is-collapsed");$.setAttribute("aria-expanded",String(!J));return}let M=c.target.closest("[data-rag-action]"),T=M?.dataset.ragAction||"";if(T==="new-chat"){et();return}if(T==="open-history-menu"){ze(M,M.dataset.historyId);return}if(T==="toggle-pin"){await Xe(M.dataset.historyId);return}if(T==="select-project"){de(M.dataset.projectId||"");return}if(T==="show-project-form"){We();return}if(T==="cancel-project"){nt();return}if(T==="more-recent"){l+=12,Qe();return}if(T==="clear-project"){de("");return}let C=c.target.closest("[data-history-open]");if(!C)return;let ne=s.find(Q=>String(Q.id)===String(C.dataset.historyId));ne&&(o=String(ne.project_id||""),Qe(),!Ie(ne)&&(m=null,y=[],ms(ne.title,{fresh:!0,source:"history"})))}),X.addEventListener("submit",async c=>{let $=c.target.closest('[data-rag-form="project"]');$&&(c.preventDefault(),await gt($))}),pe.addEventListener("click",N),document.addEventListener("click",R),document.addEventListener("keydown",H),window.addEventListener("scroll",Y,{capture:!0,passive:!0}),window.addEventListener("resize",G),E.addEventListener("click",async()=>{if(!s.length){I("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await ui(),await ae(),I("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),P(),await Promise.allSettled([Pe(),ae(),mt(),tt()]),await Ds();let h="";try{h=window.sessionStorage.getItem("judgment.pending_question")||"",window.sessionStorage.removeItem("judgment.pending_question")}catch{h=""}return!h&&typeof window.__judgmentPendingQuestion=="string"&&(h=window.__judgmentPendingQuestion),delete window.__judgmentPendingQuestion,h=String(h||"").trim().slice(0,500),h&&k&&(k.value=h,P(),window.setTimeout(()=>{t||ms(h,{fresh:!0,source:"home"})},40)),()=>{t=!0,ot(),G(),document.removeEventListener("click",R),document.removeEventListener("keydown",H),window.removeEventListener("scroll",Y,{capture:!0}),window.removeEventListener("resize",G),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",rt),p&&O.setAttribute("data-last-question",p)}}var gr={};rs(gr,{render:()=>Gu});var rr=new Set(["legal_index_versions","judgment_import","index_versions"]),mo=new Map,ir=new Set,or=new Set;function ta(e){let t=Number(e);if(!Number.isFinite(t)||t<0)return"\u2014";if(t<60)return`${Math.round(t)} \u79D2`;let s=Math.floor(t/60),a=Math.round(t%60);if(s<60)return`${s} \u5206 ${a} \u79D2`;let n=Math.floor(s/60),i=s%60;if(n<24)return`${n} \u5C0F\u6642 ${i} \u5206`;let o=Math.floor(n/24),l=n%24;return`${o} \u5929 ${l} \u5C0F\u6642`}function ar(e){return String(e||"").trim().replace(/:latest$/,"")}var Ud={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},partial:{label:"\u90E8\u5206\u5B8C\u6210",tone:"warn"},update:{label:"\u66F4\u65B0",tone:"warn"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"},provided:{label:"\u5916\u90E8\u63D0\u4F9B",tone:"info"}},lr=["download","parquet","postgres","qdrant"],Qd={download:"\u4E0B\u8F09",parquet:"Parquet",postgres:"PostgreSQL",qdrant:"Qdrant"},Jd={judgment:{download:["download"],parquet:["raw_parquet","extract"],postgres:["postgres"],qdrant:["qdrant"]},law:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]},order:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]}},go={complete:"\u5B8C\u6210",incomplete:"\u672A\u5B8C\u6210",pending:"\u5F85\u66F4\u65B0",processing:"\u8655\u7406\u4E2D",empty:"\u7121\u8CC7\u6599",not_applicable:"\u5DF2\u53D6\u4EE3"},fo={complete:"is-green",incomplete:"is-red",pending:"is-pending",processing:"is-gray",empty:"is-empty",not_applicable:"is-empty"};var It=new Map,Dt="",ys="",bo={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},ho={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Vd={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"};var vo={law_download:"law",order_download:"order",judgment_download:"judgment"},$o={law_download:"\u6CD5\u898F\u4E0B\u8F09",order_download:"\u547D\u4EE4\u4E0B\u8F09",judgment_download:"\u5224\u6C7A\u4E0B\u8F09"},Wd={law_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",order_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",judgment_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u5224\u6C7A RAR \u55CE\uFF1F\uFF08\u4E0D\u6703\u81EA\u52D5\u532F\u5165 PostgreSQL \u6216\u5EFA\u7ACB Qdrant \u7D22\u5F15\uFF09"},Kd={law_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u6CD5\u898F RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",order_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u547D\u4EE4 RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",judgment_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u53EA\u4E0B\u8F09\u5224\u6C7A RAR\u3002PostgreSQL\uFF0FParquet \u532F\u5165\u8207 Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\u300C\u5224\u6C7A\u532F\u5165\u300D\u6216\u5B8C\u6574\u8CC7\u6599\u66F4\u65B0\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_import:"\u6D41\u7A0B\u7BC4\u570D\uFF1ARAR \u2192 \u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD \u2192 \u91D1\u878D\u6CD5\u898F\u7BE9\u9078 \u2192 PostgreSQL\u3002Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_parquet:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5F9E PostgreSQL \u532F\u51FA\u67E5\u8A62\u7528 Parquet \u5FEB\u7167\uFF1B\u4E0D\u5BEB\u5165 Qdrant\uFF0FIndexedDB\u3002",index_versions:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5EFA\u7ACB\u4E26\u9A57\u8B49\u65B0\u7684 Qdrant collection\uFF0C\u5B8C\u6210\u5F8C\u539F\u5B50\u5207\u63DB alias\uFF1BIndexedDB \u4E0D\u53C3\u8207\u3002"};function ps(e){return Ud[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function jt(e,t){let s=ps(e);return`<span class="badge ${bo[s.tone]||bo.idle}"><span class="status-dot ${ho[s.tone]||ho.idle}"></span>${r(t||s.label)}</span>`}function pt(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function yo(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":d(e)}function ko(e){return e&&e.color?String(e.color):"var(--accent)"}function cr(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return["skipped","pending","idle"].includes(e.status)?"\u2014":s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${qe(s)} / ${qe(a)}`:qe(s):a?`${d(s)} / ${d(a)} ${t}`:`${d(s)} ${t}`}function ws(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${r(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function Yd(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},n=e.raw_backups||{},i=n.totals||{},o=e.state||{},l=e.capabilities||{},p=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",f=t.status==="operational",m=s.status==="operational",y=a.available!==!1,b=n.available!==!1,u=m?`${d(s.indexed)} / ${d(s.total)}`:jt(s.status||"unavailable"),v=m?`${pt(s.percent)} \xB7 \u5C1A\u9918 ${d(s.remaining)} \u7B46`:r(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),w=y?`${d(a.unprocessed)} / ${d(a.total)}`:jt("unavailable"),_=y?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${qe(a.unprocessed_bytes)} \u5F85\u8655\u7406`:r(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${Vt(uu(e))}
    ${ws("\u8655\u7406\u72C0\u614B",jt(e.status||"unknown"),`${r(p)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${ws("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",r(w),_)}
    ${ws("\u539F\u59CB\u8CC7\u6599\u5099\u4EFD",b?`${d(n.count)} \u6A94`:jt("unavailable"),b?`\u5171 ${d(i.row_count)} \u7B46 \xB7 ${qe(i.compressed_bytes)}`:r(n.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB\u8CC7\u6599\u5099\u4EFD\u3002"))}
    ${ws("PostgreSQL \u5224\u6C7A",f?d(t.judgment_count):jt("unavailable"),f?`\u6CD5\u898F ${yo(t.law_count)} \xB7 \u547D\u4EE4 ${yo(t.order_count)}`:r(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${ws("Qdrant \u7D22\u5F15",u,v)}
    ${ws("\u72C0\u614B\u6A94",jt(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${r(ye(o.updated_at))}`:r(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${ws("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?r(l.start_blocked_reason):`\u672A\u8655\u7406 ${d(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${d(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${d(l.external_processes)} \u500B`:""}`)}
  </div>`}function Xd(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
        ${jt(o.status)}
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
  </section>`}function Zd(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let n=t.map(i=>{let o=s.get(i.branch)||Vd[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${r(o)}</span>
          <strong>${r(i.title||"\u8655\u7406")}</strong>
          ${jt(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${r(ye(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?ue(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${r(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${n}</div></div>
  </section>`}function eu(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>Ce({tone:s.tone||"info",title:s.title,text:r(s.message||"")})).join("")}</div>`:""}function So(e,t){if(e==="law"||e==="order")return t==="qdrant"?"legal_index_versions":`${e}_download`;if(e==="judgment"){if(t==="download")return"judgment_download";if(t==="parquet"||t==="postgres")return"judgment_import";if(t==="qdrant")return"index_versions"}return""}function dr({month:e,year:t,monthNo:s,stageOrder:a,stageLabels:n,stageStatuses:i,overall:o,active:l,processing:p=!1,workflowForStage:f,stageProgress:m=null,variant:y="legacy"}){let b=i||{},u=y==="index"||y==="import",v=String(e?.month||`${t}${String(s).padStart(2,"0")}`),w=e?.month_label||`${t}-${String(s).padStart(2,"0")}`,_=L=>u&&L==="processing"?"\u57F7\u884C\u4E2D":go[L]||go.empty,x=L=>{let q=b[L]||"empty";if(!(q==="processing"||L==="qdrant"&&q==="incomplete"))return null;let X;if(typeof m=="function")X=m(L,v,q);else if(y==="import"&&m&&typeof m=="object")X=m[L];else return null;let ee=Number(X);return Number.isFinite(ee)?Math.max(0,Math.min(100,ee)):null},S=a.map(L=>{let q=b[L]||"empty",E=x(L),X=L==="qdrant"&&q==="incomplete"&&E!==null&&E>0,ee=X?"\u5DF2\u8655\u7406":_(q),F=!X&&E!==null&&E>0?` ${E.toFixed(1)}%`:"";return`${n[L]||L}\uFF1A${ee}${F}`}).join(" \xB7 "),k=(e?.versions||[]).map(L=>L.version_code).filter(Boolean),D=[...new Set([...e?.files||[],...e?.local_files||[],...e?.imported_files||[]])].filter(Boolean),oe=k.length?` \xB7 \u7248\u672C ${k.join("\u3001")}`:D.length?` \xB7 ${D.join("\u3001")}`:"",O=e?.detail?` \xB7 ${e.detail}`:"",be=e?`${w} \xB7 ${S}${oe}${O}`:`${w} \xB7 \u7121\u8CC7\u6599`,fe=u?o==="empty"?"is-empty":"is-neutral":fo[o]||"is-empty",W=a.map(L=>{let q=b[L]||"empty",E=q==="incomplete"||q==="pending"?f(L):"",X=E?"button":"span",ee=E?` type="button" data-timeline-workflow="${r(E)}"`:"",F=x(L),ie=L==="qdrant"&&q==="incomplete"&&F!==null&&F>0,_e=q==="processing"&&F!==null?` ${F.toFixed(1)}%`:"",z=ie?"\u5DF2\u8655\u7406":_(q),ve=q==="complete"?"is-complete":q==="processing"?"is-running":ie?"is-partial":q==="incomplete"?"is-incomplete":q==="pending"?"is-pending":"is-empty",Z=u?["index-month-block","processing-month-stage",`is-${L}`,ve,E?"is-actionable":""]:["processing-month-stage",`is-${L}`,fo[q]||"is-empty",ve,E?"is-actionable":""],pe=(q==="processing"||ie)&&F!==null?` style="--stage-progress:${F.toFixed(1)}%"`:"";return`<${X} class="${Z.filter(Boolean).join(" ")}"${ee}${pe} title="${r(`${n[L]||L}\uFF1A${z}${_e}${E?"\uFF08\u9EDE\u9078\u524D\u5F80\u8655\u7406\uFF09":""}`)}" aria-label="${r(`${w} ${n[L]||L} ${z}${_e}${E?"\uFF0C\u9EDE\u9078\u524D\u5F80\u8655\u7406":""}`)}"></${X}>`}).join("");return u?`<td class="judgment-month index-month index-month-are processing-month ${fe}${l?" is-current":""}${p&&!l?" is-processing-current":""}" data-month="${r(v)}" title="${r(be)}" aria-label="${r(be)}"${l?' aria-current="true"':""}>
    <span class="index-month-number">${s}</span>
    <span class="index-month-blocks">${W}</span>
  </td>`:`<td class="judgment-month import-month processing-month${l?" is-current":""} is-${r(o)}" data-month="${r(v)}" title="${r(be)}" aria-label="${r(be)}"${l?' aria-current="true"':""}>
    <span class="processing-month-number">${s}</span>
    <span class="processing-month-stages">${W}</span>
  </td>`}function tu(e,t,s,a,n){return dr({month:t,year:s,monthNo:a,stageOrder:lr,stageLabels:Qd,stageStatuses:t?.stages||{},overall:t?.overall||"empty",active:!!(t?.active||t?.overall==="processing"),workflowForStage:i=>So(e.key,i),stageProgress:n,variant:"index"})}function su(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=Number(s?.incomplete)||0,o=Number(s?.superseded)||0,l=a>0?(n+o)/a*100:null,p=["download","prepared","indexed"],f=0,m=0;for(let b of t){let u=b?.stages||{};for(let v of p){let w=u[v];!w||w==="empty"||w==="not_applicable"||(f+=1,w==="complete"&&(m+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",d(n),"\u5DF2\u5B8C\u6210 D\uFF0FP\uFF0FI \u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",d(i+(Number(s?.processing)||0)),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u5DF2\u53D6\u4EE3\u6708\u4EFD",d(o),"\u820A\u7248\u672C\u5DF2\u88AB\u76EE\u524D\u7248\u672C\u53D6\u4EE3\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",d(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",pt(l),"\u5B8C\u6210\u6216\u5DF2\u53D6\u4EE3\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${d(m)} / ${d(f)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([b,u,v])=>`<span class="index-runtime-metric" title="${r(v)}"><span>${r(b)}</span><strong>${r(u)}</strong></span>`).join("")}</div>`}function au(e,t,s,a){let n=Number(e?.total_months)||t.length||0,i=Number(s?.complete)||0,o=Number(s?.incomplete)||0,l=Number(s?.processing)||0,p=Number(a?.gray)||0,f=n>0?i/n*100:null,m=0,y=0;for(let u of t){let v=u?.import_stages||{};for(let w of["extract","raw_parquet","filter","postgres"]){let _=v[w];!_||_==="empty"||(m+=1,_==="complete"&&(y+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",d(i),"\u56DB\u500B\u532F\u5165\u968E\u6BB5\u90FD\u5B8C\u6210\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",d(o+l),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\uFF08\u542B\u8655\u7406\u4E2D\uFF09\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",d(p),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",d(n),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",pt(f),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${d(y)} / ${d(m)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([u,v,w])=>`<span class="index-runtime-metric" title="${r(w)}"><span>${r(u)}</span><strong>${r(v)}</strong></span>`).join("")}</div>`}function nu(e,{titleSuffix:t="\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868"}={}){let s=`${r(e?.label||"\u6CD5\u898F\uFF0F\u547D\u4EE4")} ${r(t)}`,a=Array.isArray(e?.months)?e.months:[];if(!a.length)return`<section class="report-card processing-card import-files-card law-index-timeline-card">
      <div class="side-card-head">
        <span class="side-card-title">${g(e?.key==="order"?"file":"layers",14)}${s}</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u7121\u4E0B\u8F09\u7248\u672C\u6216\u7D22\u5F15\u7D00\u9304\u3002</div>
    </section>`;let n=new Map(a.map(b=>[String(b.month),b])),i=[...new Set(a.map(b=>b.year))].sort((b,u)=>String(u).localeCompare(String(b))),o=["download","prepared","indexed"],l=e.stage_labels||{download:"D \u4E0B\u8F09\u7248\u672C",prepared:"P \u8CC7\u6599\u5C31\u7DD2",indexed:"I \u7D22\u5F15\u8986\u84CB"},p=e.summary||{},f=e.current||{},m=i.map(b=>{let u=Array.from({length:12},(v,w)=>{let _=w+1,x=`${b}${String(_).padStart(2,"0")}`,S=n.get(x);return dr({month:S,year:b,monthNo:_,stageOrder:o,stageLabels:l,stageStatuses:S?.stages||{},overall:S?.overall||"empty",active:!!S?.active,workflowForStage:k=>k==="indexed"?"legal_index_versions":`${e.key}_download`,variant:"index"})}).join("");return`<tr><th scope="row">${r(b)}</th>${u}</tr>`}).join(""),y=f.month?`<div class="index-current-row">
        <span class="badge badge-info">${g("activity",11)}${r(f.label||"\u76EE\u524D\u7248\u672C")}</span>
        <strong class="mono">${r(f.month_label||Ja(f.month))}</strong>
        <span class="mono">${r(f.file||"\u2014")}</span>
        <span class="index-current-copy">${r(f.detail||"")}</span>
      </div>`:"";return`<section class="report-card processing-card import-files-card law-index-timeline-card" data-law-index-timeline="${r(e.key||"")}">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${g(e.key==="order"?"file":"layers",14)}${s}</span>
      ${su(e,a,p)}
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(b,u)=>`<th scope="col">${u+1}</th>`).join("")}</tr></thead>
          <tbody>${m}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">D\uFF1A\u4E0B\u8F09\u7248\u672C\uFF1BP\uFF1Araw Parquet + PostgreSQL \u5C31\u7DD2\uFF1BI\uFF1Aactive \u7D22\u5F15\u8986\u84CB\uFF08\u7531\u6CD5\u898F\uFF0F\u547D\u4EE4\u7D22\u5F15\u6D41\u7A0B\u7DAD\u8B77\uFF09\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF0C\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u5B8C\u6210\u8272\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u6216\u5DF2\u53D6\u4EE3\u3002\u820A\u7248\u672C\u986F\u793A\u300C\u5DF2\u53D6\u4EE3\u300D\uFF0C\u4E0D\u9700\u91CD\u5EFA\u7D22\u5F15\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u7DE8\u865F\u3001\u4E0B\u8F09\u6642\u9593\u8207\u7B46\u6578\u3002</p>
    </div>
  </section>`}function ru(e,t={}){let s=Array.isArray(e)?e:[];return s.length?`<div class="law-index-timelines">${s.map(a=>nu(a,t)).join("")}</div>`:""}function xo({activeMonth:e,activeArchive:t,activePhase:s="",processingMonth:a="",processingArchive:n="",stageLabels:i={}}){if(!e||!t)return"";let o=`${String(e).slice(0,4)}-${String(e).slice(4,6)}`,l=i[s]||(s?"\u6E96\u5099\u4E2D":""),p=`${String(a||"").slice(0,4)}-${String(a||"").slice(4,6)}`,f=!!a&&(a!==e||n!==t);return`<span class="badge badge-info">${g("activity",11)}\u76EE\u524D\u532F\u5165</span>
    <strong class="mono">${r(o)}</strong>
    <span class="mono">${r(t)}</span>
    ${l?`<span class="badge badge-neutral">${r(l)}</span>`:""}
    ${f?`<span class="processing-current-processing">
            <span class="faint">\u8655\u7406\u4E2D</span>
            <strong class="mono">${r(p)}</strong>
            <span class="mono">${r(n||"\u2014")}</span>
          </span>`:""}`}function iu(e,t,s,a){let n=[];for(let i=1;i<=12;i+=1){let o=`${t}${String(i).padStart(2,"0")}`;n.push(tu(e,s.get(o),t,i,a))}return`<tr><th scope="row">${t}</th>${n.join("")}</tr>`}function ou(e){let t=e?.models||{};return[["Embedding",t.embedding],["Rerank",t.rerank]].filter(([,s])=>s&&(s.label||s.model)).map(([s,a])=>{let n=a.label||[a.host,a.model].filter(Boolean).join(" ")||"\u2014",i=[`${s} \u4E3B\u6A5F\u8207\u6A21\u578B\uFF1A${n}`,a.url?`\u7AEF\u9EDE\uFF1A${a.url}`:"",s==="Rerank"&&a.enabled===!1?"RAG_RERANK_ENABLED=false":""].filter(Boolean).join(" \xB7 ");return`<span class="processing-timeline-model" title="${r(i)}">${s} <strong class="mono">${r(n)}</strong>${s==="Rerank"&&a.enabled===!1?' <span class="faint">\u672A\u555F\u7528</span>':""}</span>`}).join("")}function lu(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=a>0?n/a*100:null,o=t.reduce((m,y)=>{let b=y?.stages||{};return m+lr.filter(u=>!!b[u]&&b[u]!=="empty"&&b[u]!=="not_applicable").length},0),l=t.reduce((m,y)=>{let b=y?.stages||{};return m+lr.filter(u=>b[u]==="complete").length},0),p=(Number(s?.incomplete)||0)+(Number(s?.processing)||0);return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",d(n),"\u5DF2\u5B8C\u6210\u5168\u90E8\u56DB\u500B\u968E\u6BB5\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",d(p),"\u4ECD\u6709\u81F3\u5C11\u4E00\u500B\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",d(s?.update||0),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",d(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",pt(i),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${d(l)} / ${d(o)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([m,y,b])=>`<span class="index-runtime-metric" title="${r(b)}"><span>${r(m)}</span><strong>${r(y)}</strong></span>`).join("")}</div>`}function cu(e,t){let s=new Map((Array.isArray(e?.workflows)?e.workflows:[]).map(m=>[String(m.id||""),m])),a=t.key==="judgment"?"index_versions":"legal_index_versions",i=s.get(a)?.index_runtime||{},o=m=>{if(m==null||m==="")return null;let y=Number(m);return Number.isFinite(y)?Math.max(0,Math.min(100,y)):null},l=new Map((Array.isArray(i.months)?i.months:[]).map(m=>[String(m?.month||""),o(m?.percent)])),p=new Map(Object.entries(i.active_coverage||{}).map(([m,y])=>[String(m),o(y?.percent)])),f=(m,y)=>{let b=s.get(String(m||""));if(!b)return null;let u=b.progress||{},v=Array.isArray(u.stages)?u.stages:[];for(let w of y){let _=v.find(S=>String(S.key)===w),x=o(_?.percent);if(x!==null)return x}return o(u.percent)};return(m,y,b)=>{let u=String(y||"");if(m==="qdrant"){let _=l.get(u),x=p.get(u);if(b==="processing"){if(_!==null&&_>0)return _;if(x!==null&&x>0)return x}else return b==="incomplete"?_!==null&&_>0?_:x!==null&&x>0?x:0:null}let v=So(t.key,m);if(!v)return null;let w=(Jd[t.key]||{})[m]||[m];return f(v,w)}}function du(e){let t=Array.isArray(e.file_timelines)?e.file_timelines:[];return t.length?`<div class="processing-timeline-overview">${t.map(s=>{let a=Array.isArray(s.months)?s.months:[],n=new Map(a.map(m=>[String(m.month||""),m])),i=[...new Set(a.map(m=>Number(m.year)))].filter(m=>Number.isFinite(m)).sort((m,y)=>y-m),o=s.summary||{},l=s.current||null,p=ou(s),f=cu(e,s);return`<section class="report-card processing-card import-files-card processing-timeline-card" data-processing-timeline="${r(s.key||"")}">
        <div class="side-card-head index-runtime-head">
          <span class="side-card-title">${g(s.icon||"activity",14)}${r(s.title||`${s.label||""}\u8655\u7406\u6642\u9593\u8868`)}</span>
          ${lu(s,a,o)}
        </div>
        ${p?`<div class="index-runtime-summary">${p}</div>`:""}
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
                    <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(m,y)=>`<th scope="col">${y+1}</th>`).join("")}</tr></thead>
                    <tbody>${i.map(m=>iu(s,m,n,f)).join("")}</tbody>
                  </table>
                </div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u3002</div>'}
          <p class="judgment-months-hint">${s.key==="judgment"?"\u5224\u6C7A\u4EE5\u88C1\u5224\u66F8\u6708\u4EFD\u986F\u793A\u3002":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u4EE5\u4F86\u6E90\u7248\u672C\u6708\u4EFD\u986F\u793A\u3002"}\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA\u4E0B\u8F09\u3001Parquet\u3001PostgreSQL\u3001Qdrant \u56DB\u500B\u968E\u6BB5\uFF1B\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF0CQdrant \u4E4B\u524D\u5DF2\u8655\u7406\u4F46\u5C1A\u672A\u5B8C\u6210\u6642\u4EE5\u5B8C\u6210\u8272\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u6216\u8272\u584A\u53EF\u67E5\u770B\u5404\u968E\u6BB5\u72C0\u614B\u8207\u9032\u5EA6\u3002</p>
        </div>
      </section>`}).join("")}</div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u8655\u7406\u6642\u9593\u8868\u3002</div>'}function uu(e){return e.judgment_stats&&typeof e.judgment_stats=="object"?e.judgment_stats:{judgment_total:(e.raw_backups?.totals||{}).row_count,financial_total:(e.database||{}).judgment_count}}function wo(e,t=new Set){return`${eu(e)}
    ${Yd(e)}
    ${du(e)}
    ${Xd(e)}
    ${Zd(e)}`}function pu(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${Ce({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:r(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${r(ye(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${g("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}function mu(e,t){if(e.nodeType!==t.nodeType||e.nodeName!==t.nodeName){e.replaceWith(t.cloneNode(!0));return}if(e.nodeType===Node.TEXT_NODE){e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue);return}if(e.nodeType===Node.ELEMENT_NODE){for(let s of[...e.attributes])t.hasAttribute(s.name)||e.removeAttribute(s.name);for(let s of[...t.attributes])e.getAttribute(s.name)!==s.value&&e.setAttribute(s.name,s.value);t.hasAttribute("data-preserve-children")||Ao(e,t)}}function Ao(e,t){let s=[...e.childNodes],a=[...t.childNodes],n=Math.min(s.length,a.length);for(let i=0;i<n;i+=1)mu(s[i],a[i]);for(let i=n;i<s.length;i+=1)s[i].remove();for(let i=n;i<a.length;i+=1)e.appendChild(a[i].cloneNode(!0))}function ts(e,t){let s=document.createElement("template");s.innerHTML=t,Ao(e,s.content)}var qo={overview:"activity",law_download:"layers",order_download:"file",judgment_download:"download",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function gu(e){let s=(Array.isArray(e.workflows)?e.workflows:[]).map(n=>{let i=n.active_run||null,o=i||n.last_run||null;return{...n,activeRun:i,lastRun:o,status:i?i.status||"running":n.update_available?"update":o?.status||"idle"}}),a=s.find(n=>n.id==="judgment_parquet");return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...s.filter(n=>n.id!=="judgment_parquet"),...a?[a]:[]]}function Ua(e,t){let s=gu(e),a=new Set(["law_download","judgment_download","normalize_courts"]);return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${s.map(n=>{let i=n.id===t,o=qo[n.id]||"terminal",l=a.has(n.id)?'<div class="status-tab-divider" role="separator" aria-hidden="true"></div>':"",p=Number(n.pending_count)||0,f=Number(n.update_count)||(n.update_available?p:0),m=n.update_available&&f>0&&!n.activeRun,y=[n.update_message||`${n.update_origin||"\u66F4\u65B0\u5075\u6E2C"}\u627E\u5230 ${d(f)} \u9805\u53EF\u66F4\u65B0\u5167\u5BB9`,n.update_origin?`\u4F86\u6E90\uFF1A${n.update_origin}`:"",n.update_mechanism?`\u6A5F\u5236\uFF1A${n.update_mechanism}`:""].filter(Boolean).join(" \xB7 ");return`${l}<button class="status-tab${i?" is-active":""}" type="button"
            data-processing-workflow="${r(n.id)}"
            ${i?'aria-current="page"':""}>
            <span class="status-tab-icon">${g(o,15)}</span>
            <span class="status-tab-copy">
              <strong>${r(n.label)}</strong>
              <small>${r(n.description||"")}</small>
            </span>
            ${m?`<span class="badge badge-warn badge-mono processing-update-count" title="${r(y)}">${g("refresh",10)}${d(f)}</span>`:jt(n.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${r(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function fu(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${jt(e.status)}
      <span class="mono">${r(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${r(ye(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${ue(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${r(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${r(t.log_path)}</strong>`:""}
    </div>
  </div>`}function aa(e){return`${e.year}-${String(e.month_no).padStart(2,"0")}`}function Mo(e){let t={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"},s=e.status||"red";return[aa(e),t[s]||s,e.latest_fileset_id?`fileset ${e.latest_fileset_id}`:"",e.filename||"",e.local_filename&&e.local_filename!==e.filename?`\u672C\u6A5F\uFF1A${e.local_filename}`:""].filter(Boolean).join(" \xB7 ")}function Lo(e){if(!e.download_url)return"";let t=aa(e);return`<a class="judgment-month-download" href="${r(lt(e.download_url))}" target="_blank" rel="noreferrer" title="\u4E0B\u8F09 ${t} \u5224\u6C7A" aria-label="\u4E0B\u8F09 ${t} \u5224\u6C7A">${g("download",11)}</a>`}function bu(e){let t=e.status||"red";return`<td class="judgment-month is-${r(t)}" data-judgment-month-key="${r(aa(e))}" title="${r(Mo(e))}"><span>${e.month_no}</span>${Lo(e)}</td>`}function hu(e){return e?.off_hours_enabled===!0}function jo(e){return`\u7DA0\u8272\uFF1A\u6700\u65B0\u7248\u5DF2\u4E0B\u8F09\u5230 raw_rar\uFF1B\u7070\u8272\uFF1A\u672C\u6A5F\u4ECD\u662F\u820A\u7248\uFF0C\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u6703\u66F4\u65B0\uFF1B\u7D05\u8272\uFF1A\u8A72\u6708\u4EFD\u7F3A\u5C11\u5224\u6C7A\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u958B\u555F\u4E0B\u8F09\u9023\u7D50\uFF08${hu(e)?"\u975E API \u6642\u6BB5\u4E5F\u53EF\u4E0B\u8F09\uFF0C\u5EFA\u8B70\u4E00\u6B21\u53EA\u4E0B\u8F09\u4E00\u500B\u6A94\u6848":"\u4E0B\u8F09\u9023\u7D50\u50C5\u5728 00:00\u201306:00 API \u6642\u6BB5\u53EF\u7528"}\uFF09\u3002\u5F85\u88DC\u9F4A\u6708\u4EFD\u6703\u512A\u5148\u4E0B\u8F09\uFF0C\u5168\u90E8\u88DC\u9F4A\u5F8C\u624D\u7531\u6700\u65B0\u6708\u4EFD\u5F80\u56DE\u9A57\u8B49\u65E2\u6709\u6A94\u6848\uFF1B\u4E2D\u65B7\u7684\u4E0B\u8F09\u6703\u4FDD\u7559 .part\uFF0C\u4F3A\u670D\u5668\u652F\u63F4 Range \u6642\u7E8C\u50B3\uFF0C\u5426\u5247\u5F9E\u96F6\u91CD\u65B0\u4E0B\u8F09\u3002\u9996\u6B21\u5B8C\u6574\u540C\u6B65\u53EF\u80FD\u9700\u4E0B\u8F09\u6578\u767E\u500B\u6708\u4EFD\uFF0C\u9810\u8A2D\u975E\u6642\u6BB5\u4E5F\u53EF\u7E8C\u50B3\uFF1B\u56B4\u683C\u6A21\u5F0F\u6703\u5728 00:00\u201306:00 \u4EE5\u5916\u505C\u6B62\u3002`}var vu={completed:"\u5B8C\u6210",window_closed:"API \u6642\u6BB5\u7D50\u675F",deadline:"\u63A5\u8FD1 06:00\uFF0C\u4FDD\u7559\u5F85\u4E0B\u8F09\u6708\u4EFD",verification_window_closed:"API \u6642\u6BB5\u7D50\u675F\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",verification_deadline:"\u63A5\u8FD1 06:00\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",errors:"\u90E8\u5206\u6708\u4EFD\u4E0B\u8F09\u5931\u6557\uFF0C\u4E0B\u6B21\u91CD\u8A66",pending:"\u4ECD\u6709\u5F85\u4E0B\u8F09\u6708\u4EFD",check_only:"\u50C5\u6AA2\u67E5\uFF0C\u672A\u4E0B\u8F09",incremental:"\u589E\u91CF\u6AA2\u67E5\u5B8C\u6210",status_only:"\u50C5\u66F4\u65B0\u6708\u4EFD\u72C0\u614B",running:"\u57F7\u884C\u4E2D"};function ur(e){let t=e?.backfill||{},s=t.verification||{},a=t.last_run||{},n=Number(t.pending_count)||0,i=Number(t.failure_count)||0,o=String(t.resume_from_month||""),l="\u9A57\u8B49\uFF1A\u672A\u958B\u59CB";s.status==="completed"?l="\u9A57\u8B49\u5B8C\u6210":s.next_month?l=`\u9A57\u8B49\u7E8C\u50B3 ${s.next_month}`:s.status==="in_progress"&&(l="\u9A57\u8B49\u9032\u884C\u4E2D");let p=String(a.stop_reason||""),f=p?`\u4E0A\u6B21\u505C\u6B62\uFF1A${vu[p]||p}`:"";return{pending:n,failures:i,resume:o,verificationText:l,lastText:f}}function $u(e){let t=ur(e),s=t.pending>0?`\u5F85\u88DC\u9F4A ${d(t.pending)} \u500B\u6708${t.failures>0?`\uFF08${d(t.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708";return`<div class="judgment-backfill" data-judgment-backfill>
    <span class="badge ${t.pending>0?"badge-danger":"badge-ok"}" data-judgment-backfill-pending>${s}</span>
    <span class="badge badge-neutral" data-judgment-backfill-resume ${t.resume&&t.pending>0?"":"hidden"}>\u5F9E ${r(t.resume)} \u7E8C\u50B3</span>
    <span class="badge badge-info" data-judgment-backfill-verification>${r(t.verificationText)}</span>
    <span class="muted" data-judgment-backfill-last ${t.lastText?"":"hidden"}>${r(t.lastText)}</span>
  </div>`}function yu(e,t){let s=ur(t),a=e.querySelector("[data-judgment-backfill-pending]");a&&(a.textContent=s.pending>0?`\u5F85\u88DC\u9F4A ${d(s.pending)} \u500B\u6708${s.failures>0?`\uFF08${d(s.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708",a.classList.toggle("badge-danger",s.pending>0),a.classList.toggle("badge-ok",s.pending===0));let n=e.querySelector("[data-judgment-backfill-resume]");if(n){let l=!!s.resume&&s.pending>0;n.hidden=!l,n.textContent=l?`\u5F9E ${s.resume} \u7E8C\u50B3`:""}let i=e.querySelector("[data-judgment-backfill-verification]");i&&(i.textContent=s.verificationText);let o=e.querySelector("[data-judgment-backfill-last]");o&&(o.hidden=!s.lastText,o.textContent=s.lastText)}function pr(){return'<div class="judgment-months-loading"><span class="spinner"></span><span>\u8B80\u53D6\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B\u2026</span></div>'}function wu(e){if(e?.loading&&!e?.months?.length)return pr();if(e?.error&&!e?.months?.length)return Ce({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(e.error)});let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return'<div class="processing-empty">\u5C1A\u672A\u6709\u6708\u4EFD\u72C0\u614B\uFF1B\u8ACB\u5148\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u3002</div>';let s=new Map(t.map(o=>[aa(o),o])),n=[...new Set(t.map(o=>o.year))].sort((o,l)=>l-o).map(o=>{let l=Array.from({length:12},(p,f)=>{let m=s.get(`${o}-${String(f+1).padStart(2,"0")}`);return m?bu(m):`<td class="judgment-month is-empty"><span>${f+1}</span></td>`}).join("");return`<tr><th scope="row">${o}</th>${l}</tr>`}).join(""),i=e.summary||{};return`<div class="judgment-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" data-judgment-summary="green">\u6700\u65B0\u7248 ${d(i.green||0)}</span>
      <span class="badge badge-neutral" data-judgment-summary="gray">\u820A\u7248 ${d(i.gray||0)}</span>
      <span class="badge badge-danger" data-judgment-summary="red">\u7F3A\u5931 ${d(i.red||0)}</span>
      <span class="muted" data-judgment-total>\u5171 ${d(e.total_months||t.length)} \u500B\u6708</span>
    </div>
    ${$u(e)}
    <div class="judgment-months-scroll">
      <table class="judgment-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(o,l)=>`<th scope="col">${l+1}</th>`).join("")}</tr></thead>
        <tbody>${n}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint" data-judgment-hint>${r(jo(e))}</p>
  </div>`}function _u(e,t){let s=Array.isArray(t?.months)?t.months:[],a=t.summary||{},n={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"};e.querySelectorAll("[data-judgment-summary]").forEach(l=>{let p=l.dataset.judgmentSummary||"";l.textContent=`${n[p]||p} ${d(a[p]||0)}`});let i=e.querySelector("[data-judgment-total]");i&&(i.textContent=`\u5171 ${d(t.total_months||s.length)} \u500B\u6708`),yu(e,t);let o=e.querySelector("[data-judgment-hint]");if(o){let l=jo(t);o.textContent!==l&&(o.textContent=l)}for(let l of s){let p=aa(l),f=e.querySelector(`[data-judgment-month-key="${p}"]`);if(!f)continue;let m=l.status||"red";f.classList.contains(`is-${m}`)||(f.classList.remove("is-green","is-gray","is-red","is-empty"),f.classList.add(`is-${m}`));let y=Mo(l);f.title!==y&&(f.title=y);let b=f.querySelector(".judgment-month-download");if(l.download_url){let u=lt(l.download_url);b?b.getAttribute("href")!==u&&(b.href=u):f.insertAdjacentHTML("beforeend",Lo(l))}else b&&b.remove()}}function ku(e){let t=Array.isArray(e)?e:[];return t.length?`<div class="processing-workflow-history">
    ${t.map(s=>`<div class="processing-workflow-history-row">
          <span class="processing-workflow-history-status">${jt(s.status||"idle")}</span>
          <span class="mono">${r(ye(s.started_at))}</span>
          <span class="mono">${r(ue(s.duration_ms||0))}</span>
          <span class="processing-workflow-history-message">${r(s.message||"\u2014")}</span>
        </div>`).join("")}
  </div>`:'<div class="processing-workflow-empty">\u5C1A\u7121\u57F7\u884C\u7D00\u9304\u3002</div>'}function Su(e){let t=Array.isArray(e.update_history)?e.update_history:[];if(!t.length)return'<div class="processing-workflow-empty">\u5C1A\u7121\u7248\u672C\u6AA2\u67E5\u7D00\u9304\u3002</div>';let s={up_to_date:["\u5DF2\u662F\u6700\u65B0","badge-ok"],update_available:["\u6709\u66F4\u65B0","badge-warn"],error:["\u6AA2\u67E5\u5931\u6557","badge-danger"]};return`<div class="processing-workflow-history">
    ${t.map(a=>{let[n,i]=s[a.status]||[a.status||"\u672A\u77E5","badge-neutral"],o=a.remote_content_length!=null?qe(a.remote_content_length):"\u2014",l=a.local_version_id?`v${a.local_version_id}`:"\u2014";return`<div class="processing-workflow-history-row">
          <span class="badge ${i}">${r(n)}</span>
          <span class="mono">${r(ye(a.checked_at))}</span>
          <span class="mono">\u9060\u7AEF ${r(o)}</span>
          <span class="mono">\u672C\u5730 ${r(l)}</span>
          <span class="processing-workflow-history-message">${r(a.message||"\u2014")}</span>
        </div>`}).join("")}
  </div>`}function To(e){let t=String(e.key||""),s=ps(e.status);return[`data-stage-key="${r(t)}"`,`data-stage-label="${r(e.label||t)}"`,`data-stage-color="${r(ko(e))}"`,`data-stage-status-key="${r(e.status||"idle")}"`,`data-stage-status="${r(s.label)}"`,`data-stage-percent="${r(pt(e.percent))}"`,`data-stage-counts="${r(cr(e))}"`,`data-stage-duration="${r(sa(e.duration_ms||0))}"`,`data-stage-contribution="${r(pt(e.contribution_percent))}"`,`data-stage-message="${r(e.message||"")}"`].join(" ")}function xu(e,t=Date.now()){let s=String(e.status||"idle"),a=Number(e.duration_ms)||0,n=Date.parse(e.started_at||"");if(s==="running"&&Number.isFinite(n))return Math.max(a,t-n);if(a>0)return a;let i=Date.parse(e.finished_at||"");return Number.isFinite(n)&&Number.isFinite(i)?Math.max(0,i-n):0}function No(e){if(e.key!=="filter")return null;let t=Number(e.financial_processed),s=Number(e.financial_matched);return e.financial_processed===null||e.financial_processed===void 0||!Number.isFinite(t)||!Number.isFinite(s)||t<=0?null:{processed:t,matched:s,percent:Math.round(s/t*100)}}function Au(e){let t=String(e.status||"idle"),s=[],a=Number(e.total);if(e.key==="postgres"&&["success","no_change"].includes(t)&&Number.isFinite(a)&&a>0)s.push(`\u7E3D\u8A08 ${d(a)} \u7B46`);else{let i=cr(e);i!=="\u2014"&&s.push(i)}let n=No(e);return n&&s.push(`\u91D1\u878D\u4F54\u6BD4 ${n.percent}%`),s.join(" \xB7 ")}function qu(e,t){let s=String(e.status||"idle"),a=[],n=(p,f,{always:m=!1}={})=>{let y=f==null?"":String(f).trim();!m&&!y||a.push(`<span class="rag-wf-detail"><span>${r(p)}</span><strong>${r(y||"\u2014")}</strong></span>`)};n("\u72C0\u614B",ps(s).label,{always:!0}),n("\u958B\u59CB",e.started_at?ye(e.started_at):"\u2014",{always:!0}),n("\u7D50\u675F",e.finished_at?ye(e.finished_at):"\u2014",{always:!0}),n("\u8017\u6642",t,{always:!0}),n("\u9032\u5EA6",pt(e.percent),{always:!0});let i=cr(e),o=["extract","raw_parquet"].includes(String(e.key||""));n(o?"\u7D2F\u8A08\u8CC7\u6599\u91CF":"\u8CC7\u6599\u91CF",i!=="\u2014"?i:"");let l=No(e);return l&&(n("\u91D1\u878D\u6848\u4EF6",`${d(l.matched)} \u7B46`),n("\u5168\u90E8\u6848\u4EF6",`${d(l.processed)} \u7B46`),n("\u91D1\u878D\u4F54\u6BD4",`${l.percent}%`)),n("\u6574\u9AD4\u5360\u6BD4",pt(e.contribution_percent)),s==="failed"||s==="stale"?(n("\u539F\u56E0",e.error||e.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002"),n("\u5EFA\u8B70",e.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002")):n("\u8AAA\u660E",e.message),a.join("")}function Mu(e){let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${g("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A host/model\u3001Blue-Green \u5EFA\u7F6E\u8207\u5404\u968E\u6BB5\u9032\u5EA6\u3002</div>
    </section>`;let a=new Map(s.map(de=>[String(de.key||""),de])),n=a.get("ollama")||{},i=a.get("qdrant")||{},o=a.get("validate")||{},l=e.index_runtime||{},p=l.summary||{},f=l.copy||{},m=l.current||{},y=l.embedding||{},b=y.selected||{},u=y.active||{},v=Number(l.expected_count||p.total||i.total||0),w=Number(p.indexed??i.current??0),_=v>0?Math.min(100,w/v*100):i.status==="success"?100:0,x=Number(f.total||0),S=Number(f.copied||0),k=x>0?Math.min(100,S/x*100):f.status==="success"?100:0,D=String(l.build_mode||""),oe=String(t.run_status||""),O=!!oe&&!["running","success","no_change"].includes(oe),be=String(f.status||(D==="reuse"?"pending":"skipped"));O&&be==="pending"&&(be="stale");let fe=Number(f.duration_ms||0)/1e3,W=fe>0?S/fe:0,L=be==="running"&&W>0&&x>S?(x-S)/W:null,q=Ro(e,l,w),E=Po(l,w,v,q),X=E?.remainingMs&&E.remainingMs>0?E.remainingMs/1e3:null,ee=be==="success"||be==="skipped"||w>0||i.status==="success",F=i.status==="success"?"success":ee&&i.status||"pending",ie=String(o.status||"pending"),_e=ie==="success"&&/alias 已切換/.test(String(o.message||"")),z=_e?"success":ie==="failed"?"failed":oe==="running"?"pending":"skipped",ve=l.version_id?`v${String(l.version_id).padStart(3,"0")}`:"\u2014",Z=u.host||b.host||u.url||b.url||"\u2014",Se=u.port||b.port,pe=Se?`${Z}:${Se}`:String(Z),K=u.model||b.model||l.model||"\u2014",re=ee&&m.month?`${Ja(m.month)}${m.preparing?"\uFF08\u6E96\u5099\u4E2D\uFF09":""}`:t.run_status==="running"?"\u6E96\u5099\u4E2D":"\u2014",me=String(m.phase||"")==="embedding"?"E \u65B0 embedding":String(m.phase||"")==="reuse"?"R \u91CD\u7528":"\u2014",he=[{key:"probe",label:"llama-server \u4E3B\u6A5F\uFF0F\u6A21\u578B\u6E2C\u8A66",caption:"\u4E3B\u6A5F\uFF0F\u6A21\u578B\u3001\u9023\u7DDA\u6E2C\u8A66",color:"#22c55e",status:n.status||"pending",percent:Number(n.percent)||0,current:Number(n.current)||0,total:Number(n.total)||0,unit:"\u53F0",duration_ms:n.duration_ms,started_at:n.started_at,finished_at:n.finished_at,extraDetails:[["\u4E3B\u6A5F",pe],["\u6A21\u578B",K],["\u6E2C\u8A66\u4E3B\u6A5F",`${d(n.current||0)} / ${d(n.total||0)} \u53F0`]],detail:`${d(n.current||0)} / ${d(n.total||0)} \u53F0 \xB7 ${pe} \xB7 ${K}`},{key:"version",label:"\u5EFA\u7ACB\uFF0F\u63A5\u7E8C Blue-Green \u7248\u672C",caption:"Blue-Green \u7248\u672C\u3001collection",color:"#06b6d4",status:l.version_id?"success":"pending",percent:l.version_id?100:0,current:l.version_id?1:0,total:1,unit:"\u968E\u6BB5",duration_ms:l.version_duration_ms,started_at:null,finished_at:null,extraDetails:[["\u7248\u672C",ve],["Collection",l.collection||"\u2014"],["\u6A21\u5F0F",D||"\u2014"]],detail:`${ve} \xB7 ${l.collection||"\u2014"} \xB7 ${D||"\u2014"}`},{key:"copy",label:"\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF",caption:"\u820A collection \u5411\u91CF\u8907\u88FD",color:"#f59e0b",status:be,percent:k,current:S,total:x,unit:"points",duration_ms:f.duration_ms,started_at:f.started_at,finished_at:f.finished_at,extraDetails:[["\u5DF2\u8907\u88FD",`${d(S)} points`],["\u7E3D points",d(x)],["\u7BC4\u570D","\u5168\u57DF points\uFF1B\u4E0D\u5217\u5165\u6708\u4EFD A\uFF0FR\uFF0FE"],["\u8907\u88FD\u901F\u5EA6",W>0?`${W.toFixed(1)} points/\u79D2`:"\u2014"],["\u9810\u4F30\u5269\u9918",L!==null?ta(L):"\u2014"]],detail:x>0?`${d(S)} / ${d(x)} points \xB7 \u820A collection \u5411\u91CF`:be==="skipped"?"\u672C\u6B21\u4E0D\u9700\u8907\u88FD\u820A\u5411\u91CF":be==="stale"?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5B8C\u6210\u8907\u88FD":"\u7B49\u5F85\u820A collection \u8907\u88FD"},{key:"index",label:"\u91D1\u878D\u5224\u6C7A\u5411\u91CF\u7D22\u5F15",caption:"\u6E96\u5099\u5B8C\u6210\u5F8C\uFF0C\u5206\u6279\u986F\u793A R \u91CD\u7528\uFF0FE \u65B0 embedding",color:"#a78bfa",status:F,phaseKey:me==="R \u91CD\u7528"?"reuse":me==="E \u65B0 embedding"?"embedding":"",phaseLabel:F==="running"?me:"",percent:_,current:w,total:v,unit:"\u7B46",duration_ms:ee?i.duration_ms:0,started_at:ee?i.started_at||l.started_at:null,finished_at:i.finished_at,extraDetails:[["\u5DF2\u7D22\u5F15",`${d(w)} / ${d(v)} \u7B46`],["\u91CD\u7528",d(p.reused)],["\u65B0 embedding",d(p.embedded)],["\u76EE\u524D\u6708\u4EFD",re],["\u76EE\u524D\u6279\u6B21",me],["\u672C\u6279 R\uFF0FE",`R ${d(m.reused||0)} \xB7 E ${d(m.embedded||0)}`],["R \u5B9A\u7FA9","04 \u9010\u6708\u6383\u63CF\u6CBF\u7528\uFF1B03 \u8907\u88FD\u70BA\u5168\u57DF points"],["\u9810\u4F30\u5269\u9918",ee&&X!==null?ta(X):"\u2014"]],detail:ee?`${d(w)} / ${d(v)} \u7B46 \xB7 \u91CD\u7528 ${d(p.reused)} \xB7 \u65B0 embedding ${d(p.embedded)}${me==="\u2014"?"":` \xB7 ${me}`}`:"\u7B49\u5F85\u7248\u672C\u6E96\u5099\uFF08\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF\uFF09\u5B8C\u6210"},{key:"validate",label:"\u9A57\u8B49\u65B0\u7248\u672C",caption:"\u7B46\u6578\u3001\u7DAD\u5EA6\u3001payload",color:"#eab308",status:ie,percent:ie==="success"?100:0,current:null,total:null,duration_ms:o.duration_ms,started_at:o.started_at,finished_at:o.finished_at,extraDetails:[["\u9A57\u8B49\u8A0A\u606F",o.message||"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210"]],detail:o.message||(O?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u9032\u884C\u9A57\u8B49\u3002":"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210\u5F8C\u9A57\u8B49\u7B46\u6578\u3001\u7DAD\u5EA6\u8207 payload\u3002")},{key:"activate",label:"\u5207\u63DB alias",caption:"judgments_current alias",color:"#3b82f6",status:z,percent:_e?100:0,current:null,total:null,duration_ms:0,started_at:null,finished_at:null,extraDetails:[["\u76EE\u6A19 alias","judgments_current"]],detail:_e?o.message:O?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5207\u63DB alias\u3002":"\u9A57\u8B49\u901A\u904E\u5F8C\u5207\u63DB judgments_current\u3002"}],ke=he.filter(de=>de.status!=="skipped"),xe=ke.length?ke.reduce((de,We)=>de+We.percent,0)/ke.length:0,Ee=he.filter(de=>de.status==="success").length,Oe=pt(xe),P=Date.now(),U=de=>{let We=Number(de.duration_ms)||0,nt=Date.parse(de.started_at||"");if(de.status==="running"&&Number.isFinite(nt))return Math.max(We,P-nt);if(We>0)return We;let gt=Date.parse(de.finished_at||"");return Number.isFinite(nt)&&Number.isFinite(gt)?Math.max(0,gt-nt):0},j=he.map(de=>{let We=U(de);return{...de,computedDuration:We,drawable:!["skipped","pending"].includes(de.status)}}),B=Math.max(j.reduce((de,We)=>de+(We.drawable?We.computedDuration:0),0),Number(t.duration_ms)||0,1),te=1.25,G=j.map(de=>de.drawable?Math.max(de.computedDuration/B*100,te):0),Re=G.reduce((de,We)=>de+We,0),Le=Re>100?100/Re:1,Ie=0,mt=j.map((de,We)=>{let nt=G[We]*Le,gt=nt>0?{start:Ie,width:nt}:null;return gt&&(Ie+=nt),{...de,bar:gt}}).map((de,We)=>{let nt=[`is-${de.status}`,de.status==="failed"||de.status==="stale"?"is-error":"",["pending","skipped"].includes(de.status)?"is-missing":"",de.status==="running"?"is-running":""].filter(Boolean).join(" "),gt=["pending","skipped"].includes(de.status)?"\u2014":sa(de.computedDuration),Xe=de.status==="running"?` \xB7 ${pt(de.percent)}`:"",et=de.phaseLabel?`<span class="index-wf-phase is-${r(de.phaseKey||"unknown")}">${r(de.phaseLabel)}</span>`:"",ft="";if(de.bar){let Ge=Math.max(0,Math.min(100,de.bar.start)),at=Math.max(0,Math.min(100-Ge,de.bar.width)),Tt=de.status==="success"?100:Math.max(0,Math.min(100,Number(de.percent)||0)),A=at*Tt/100,N=at-A,R=r(de.color);A>0&&(ft+=`<span class="rag-wf-bar index-wf-bar is-sequential" style="left:${Ge.toFixed(3)}%;width:${A.toFixed(4)}%;top:0;height:12px;--bar-color:${R}" aria-hidden="true"></span>`),N>1e-4&&(ft+=`<span class="rag-wf-bar index-wf-bar is-hollow is-sequential" style="left:${(Ge+A).toFixed(3)}%;width:${N.toFixed(4)}%;top:0;height:12px;--bar-color:${R}" aria-hidden="true"></span>`)}let se=[],$e=(Ge,at)=>{at==null||at===""||se.push(`<span class="rag-wf-detail"><span>${r(Ge)}</span><strong>${r(String(at))}</strong></span>`)};$e("\u72C0\u614B",ps(de.status).label),$e("\u958B\u59CB",de.started_at?ye(de.started_at):"\u2014"),$e("\u7D50\u675F",de.finished_at?ye(de.finished_at):"\u2014"),$e("\u8017\u6642",gt),$e("\u9032\u5EA6",pt(de.percent));for(let[Ge,at]of de.extraDetails||[])$e(Ge,at);$e("\u8AAA\u660E",de.detail);let ze={...de,duration_ms:de.computedDuration,contribution_percent:ke.length?(Number(de.percent)||0)/ke.length:null,message:de.detail};return`<details class="rag-wf-stage index-wf-stage ${nt}" data-index-stage="${r(de.key)}"${ir.has(de.key)?" open":""} style="--stage-color:${r(de.color)}" ${To(ze)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="index-wf-step">${String(We+1).padStart(2,"0")}</span> ${r(de.label)}</strong><small>${r(de.caption||"")}</small></span>
            </span>
            <span class="rag-wf-stage-meta">${r(gt)}${r(Xe)}${et?` \xB7 ${et}`:""} \xB7 ${r(ps(de.status).label)} <span class="rag-wf-chevron">${g("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px">${ft}</span>
        </summary>
        <div class="rag-wf-details">${se.join("")}</div>
      </details>`}).join("");return`<section class="report-card processing-card processing-workflow-progress-card index-wf-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${g("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
      <span class="badge ${t.run_status==="running"?"badge-info":"badge-neutral"}">${d(Ee)} / ${d(ke.length)} \u968E\u6BB5</span>
    </div>
    <div class="index-wf-summary">
      <span>\u6574\u9AD4 <strong class="mono">${Oe}</strong></span>
      <span>\u7248\u672C <strong class="mono">${r(ve)}</strong></span>
      <span>Collection <strong class="mono">${r(l.collection||"\u2014")}</strong></span>
      <span>\u6A21\u5F0F <strong>${r(D||"\u2014")}</strong></span>
      <span>Host <strong class="mono">${r(pe)}</strong></span>
      <span>Model <strong class="mono">${r(K)}</strong></span>
      <span>\u76EE\u524D <strong>${r(re)}</strong></span>
    </div>
    <div class="index-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${B>0?r(sa(B)):"\u2014"}</span>
      </div>
      <div class="rag-wf-stages">${mt}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7684\u7D50\u675F\u5373\u4E0B\u4E00\u968E\u6BB5\u7684\u958B\u59CB\uFF1B\u5DF2\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u9032\u884C\u4E2D\u6216\u672A\u5B8C\u6210\u968E\u6BB5\u53EA\u8457\u8272\u5DF2\u5B8C\u6210\u6BD4\u4F8B\uFF0C\u5176\u9918\u672A\u5B8C\u6210\u5340\u6BB5\u4EE5\u540C\u8272 25% \u6DFA\u8272\u8868\u793A\uFF0C\u7B49\u5F85\u968E\u6BB5\u4FDD\u7559\u7A7A\u5FC3\u8ECC\u9053\u3001\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\u3002\u6975\u77ED\u968E\u6BB5\u6703\u4EE5\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u5448\u73FE\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u9032\u5EA6\u8207\u8A73\u7D30\u6578\u64DA\u3002</p>
    </div>
    <div class="index-wf-overall">
      <div class="index-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${Oe}</span>
      </div>
      <div class="index-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,xe)).toFixed(1)}%"></span>
      </div>
    </div>
  </section>`}function Lu(e){if(e.id==="index_versions")return Mu(e);let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${g("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u5404\u968E\u6BB5\u8207\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </section>`;let a=Date.now(),n=s.map(z=>{let ve=String(z.status||"idle");return{...z,status:ve,computedDuration:xu(z,a),drawable:!["pending","skipped","idle"].includes(ve)}}),i=n.filter(z=>z.status!=="skipped"),o=n.filter(z=>z.drawable).reduce((z,ve)=>z+ve.computedDuration,0),l=Math.max(o,Number(t.duration_ms)||0,1),p=n.some(z=>z.computedDuration>0),f=1.25,m=n.map(z=>z.drawable?Math.max(z.computedDuration/l*100,f):0),y=m.reduce((z,ve)=>z+ve,0),b=y>100?100/y:1,u=0,v=n.map((z,ve)=>{let Z=m[ve]*b,Se=z.drawable?{start:u,width:Z}:null;return Se&&(u+=Z),{...z,bar:Se}}),w=n.filter(z=>["success","no_change"].includes(z.status)).length,_=n.find(z=>z.status==="running"),x=n.filter(z=>z.status==="running").length,S=n.filter(z=>["pending","idle"].includes(z.status)).length,k=n.filter(z=>z.status==="skipped").length,D=i.length||Number(t.total_stages)||0,oe=t.overall_percent,O=oe==null||oe===""?null:Number(oe),be=Number.isFinite(O)?pt(O):"\u2014",fe=p?sa(l):"\u2014",W=String(t.run_status||""),L=W?ps(W).label:"\u2014",q=_&&(_.label||_.key)||"\u2014",E=n.map(z=>Date.parse(z.started_at||"")).filter(z=>Number.isFinite(z)),X=n.map(z=>Date.parse(z.finished_at||"")).filter(z=>Number.isFinite(z)),ee=E.length?new Date(Math.min(...E)).toISOString():null,F=_?null:X.length?new Date(Math.max(...X)).toISOString():null,ie=v.map((z,ve)=>{let Z=z.status,Se=["failed","stale","interrupted"].includes(Z),pe=[`is-${Z}`,Se?"is-error":"",["pending","skipped","idle"].includes(Z)?"is-missing":"",Z==="running"?"is-running":""].filter(Boolean).join(" "),K=z.drawable?sa(z.computedDuration):"\u2014",re=ps(Z).label,me=Z==="failed"?`\u539F\u56E0\uFF1A${String(z.error||z.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002").trim()}
\u5EFA\u8B70\uFF1A${String(z.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002").trim()}`:"",he=me?`<span class="badge badge-danger is-failure-tip" tabindex="0" aria-label="${r(me)}" data-failure-tip="${r(me)}"><span class="status-dot is-danger"></span>\u5931\u6557</span>`:r(re),ke=ko(z),xe=Se?"var(--danger)":ke,Ee=Z==="running"?` \xB7 ${pt(z.percent)}`:"",Oe="";if(z.bar){let G=Math.max(0,Math.min(100,z.bar.start)),Re=Math.max(0,Math.min(100-G,z.bar.width)),Le=["success","no_change"].includes(Z)?100:Math.max(0,Math.min(100,Number(z.percent)||0)),Ie=Re*Le/100,Qe=Re-Ie;Ie>0&&(Oe+=`<span class="rag-wf-bar workflow-wf-bar is-sequential" style="left:${G.toFixed(3)}%;width:${Ie.toFixed(4)}%;top:0;height:12px;--bar-color:${r(xe)}" aria-hidden="true"></span>`),Qe>1e-4&&(Oe+=`<span class="rag-wf-bar workflow-wf-bar is-hollow is-sequential" style="left:${(G+Ie).toFixed(3)}%;width:${Qe.toFixed(4)}%;top:0;height:12px;--bar-color:${r(xe)}" aria-hidden="true"></span>`)}let P=z.label||z.key||"\u968E\u6BB5",U=Au(z),j=`${P}\uFF1A${re}\uFF0C${Z==="running"?`\u9032\u5EA6 ${pt(z.percent)}\uFF0C`:""}\u8017\u6642 ${K}`,B={...z,duration_ms:z.computedDuration,message:me||z.message||U||""},te=`${e.id}:${z.key||ve}`;return`<details class="rag-wf-stage workflow-wf-stage ${pe}" data-workflow-wf-stage="${r(te)}"${or.has(te)?" open":""} style="--stage-color:${r(ke)}" ${To(B)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="workflow-wf-step">${String(ve+1).padStart(2,"0")}</span> ${r(P)}</strong>${U?`<small>${r(U)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(K)}${r(Ee)} \xB7 ${he} <span class="rag-wf-chevron">${g("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(j)}">${Oe}</span>
        </summary>
        <div class="rag-wf-details">${qu(z,K)}</div>
      </details>`}).join(""),_e=Kd[e.id]||"";return`<section class="report-card processing-card processing-workflow-progress-card workflow-wf-card" data-workflow-progress>
    <div class="side-card-head index-runtime-head workflow-wf-head">
      <span class="side-card-title">${g("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
      <div class="index-runtime-metrics workflow-wf-metrics">
        <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u5168\u90E8\u968E\u6BB5\u7684\u6578\u91CF\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${w} / ${D}</strong></span>
        <span class="index-runtime-metric" title="\u76EE\u524D\u57F7\u884C\u4E2D\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u57F7\u884C\u4E2D</span><strong>${x}</strong></span>
        <span class="index-runtime-metric" title="\u5C1A\u672A\u958B\u59CB\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7B49\u5F85</span><strong>${S}</strong></span>
        <span class="index-runtime-metric" title="\u672C\u6B21\u6D41\u7A0B\u4E0D\u9700\u8981\u57F7\u884C\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7565\u904E</span><strong>${k}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u968E\u6BB5\u8017\u6642\u5408\u8A08\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(fe)}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u53C3\u8207\u968E\u6BB5\u5B8C\u6210\u6BD4\u4F8B\u7684\u5E73\u5747\u3002"><span>\u6574\u9AD4\u9032\u5EA6</span><strong>${be}</strong></span>
      </div>
    </div>
    <div class="workflow-wf-summary">
      <span>\u57F7\u884C <strong>${r(L)}</strong></span>
      <span>\u958B\u59CB <strong>${ee?r(ye(ee)):"\u2014"}</strong></span>
      <span>\u7D50\u675F <strong>${_?"\u9032\u884C\u4E2D":F?r(ye(F)):"\u2014"}</strong></span>
      <span>\u76EE\u524D <strong>${r(q)}</strong></span>
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
      <div class="rag-wf-stages">${ie}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7684\u7D50\u675F\u5373\u4E0B\u4E00\u968E\u6BB5\u7684\u958B\u59CB\uFF1B\u5DF2\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u57F7\u884C\u4E2D\u6216\u672A\u5B8C\u6210\u968E\u6BB5\u53EA\u8457\u8272\u5DF2\u5B8C\u6210\u6BD4\u4F8B\uFF0C\u5176\u9918\u672A\u5B8C\u6210\u5340\u6BB5\u4EE5\u540C\u8272 25% \u6DFA\u8272\u8868\u793A\uFF0C\u7B49\u5F85\u968E\u6BB5\u4FDD\u7559\u7A7A\u5FC3\u8ECC\u9053\u3001\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\u3002\u6975\u77ED\u968E\u6BB5\u6703\u4EE5\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u5448\u73FE\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u9032\u5EA6\u8207\u8A73\u7D30\u6578\u64DA\u3002</p>
    </div>
    <div class="workflow-wf-overall">
      <div class="workflow-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${be}</span>
      </div>
      <div class="workflow-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,Number.isFinite(O)?O:0)).toFixed(1)}%"></span>
      </div>
    </div>
    ${_e?`<p class="processing-workflow-scope-note">${g("info",12)}<span>${r(_e)}</span></p>`:""}
  </section>`}function Ja(e){let t=String(e||"");return t.length===6?`${t.slice(0,4)}-${t.slice(4)}`:t||"\u2014"}function Eo(e){return e?.scan_order==="issue_month"?"\u7D22\u5F15\u6383\u63CF\u9806\u5E8F\u4F9D\u6708\u4EFD\u7531\u820A\u5230\u65B0\uFF1B\u540C\u6708\u4EFD\u518D\u4F9D\u532F\u5165 ID\u3002":"\u6B64 run \u662F\u820A\u7248\u6383\u63CF\u9806\u5E8F\uFF08\u4F9D\u532F\u5165 ID\uFF0C\u975E\u6708\u4EFD\u9806\u5E8F\uFF09\uFF1B\u65B0 run \u624D\u6703\u7531\u6700\u820A\u6708\u4EFD\u958B\u59CB\u3002"}function ju(e,t=!1){let s=Number(e?.reused),a=Number(e?.embedded);if(!Number.isFinite(s)||!Number.isFinite(a)||s<=0&&a<=0)return"";let n=[];if(s>0&&n.push(`<span class="index-current-phase is-reuse"
      title="R \xB7 \u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF0C\u672C\u6279 ${d(s)} \u7B46">
      <strong>R</strong><span>\u6CBF\u7528 ${d(s)} \u7B46</span>
    </span>`),a>0){let i=e.phase==="embedding"&&t?"\u8A08\u7B97\u4E2D":"\u65B0 embedding";n.push(`<span class="index-current-phase is-embed"
      title="E \xB7 \u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding\uFF0C\u672C\u6279 ${d(a)} \u7B46">
      <strong>E</strong><span>${i} ${d(a)} \u7B46</span>
    </span>`)}return`<span class="index-current-phases" aria-label="\u672C\u6279\u6B21 R\uFF0FE \u52D5\u4F5C">
    <span class="index-current-phase-label">\u672C\u6279</span>
    ${n.join("")}
  </span>`}function Tu(e){let t=Array.isArray(e.months)?e.months:[],s=new Map;for(let n of t){let i=String(n.month||"");if(!/^\d{6}$/.test(i))continue;let o=s.get(i);o||(o={total:0,processed:0},s.set(i,o)),o.total+=Number(n.total)||0,o.processed+=Number(n.processed)||0}let a=0;for(let n of s.values())n.total>0&&n.processed>=n.total&&(a+=1);return{completed:a,total:s.size}}function _o(e){let t=String(e||"").match(/(\d{8})Update/i);return t?Number(t[1]):0}function Wt(e){let t=Number(e);return Number.isFinite(t)&&t>0?t:0}function nr(e,t){let s=Wt(t),a=Wt(e);if(s<=0)return{processed:0,total:0,percent:null,fill:0,complete:!1,empty:!0,stateClass:"is-empty"};let n=Math.min(100,Math.round(a/s*1e3)/10),i=a>=s;return{processed:a,total:s,percent:n,fill:i?100:n,complete:i,empty:!1,stateClass:i?"is-complete":"is-incomplete"}}function Nu(e){let t=Array.isArray(e.months)?e.months:[],s=e.current||{},a=!!e.coverage_only,n=e.active_coverage||{},i=e.active_archive_coverage||{},o=!!s.preparing&&e.scan_order==="issue_month",l=new Map;for(let _ of t){let x=String(_.month||"");if(!/^\d{6}$/.test(x))continue;let S=Number(x.slice(4,6));if(S<1||S>12)continue;let k=l.get(x);k||(k={key:x,year:x.slice(0,4),monthNo:S,rows:[],archives:[],current:!1,preparing:!1,currentArchive:"",jid:""},l.set(x,k));let D=String(_.archive||"");k.rows.push({archive:D,total:Wt(_.total),processed:Wt(_.processed)}),D&&k.archives.push(D),!o&&s.month===x&&(!s.archive||s.archive===D)&&(k.current=!0,k.preparing=!!s.preparing,k.currentArchive=String(s.archive||D||""),k.jid=String(s.jid||""))}if(!l.size)return'<div class="processing-workflow-empty">\u5C1A\u7121\u53EF\u986F\u793A\u7684\u7D22\u5F15\u6708\u4EFD\uFF1B\u958B\u59CB\u7D22\u5F15\u5F8C\u6703\u4F9D\u6642\u9593\u5217\u51FA\u6708\u4EFD\u72C0\u614B\u3002</div>';let p={active:0,reuseComplete:0,reuseIncomplete:0,embedComplete:0,embedIncomplete:0};for(let _ of l.values()){let x=[..._.rows].sort((pe,K)=>_o(K.archive)-_o(pe.archive)),S=x[0],k=x.length>1?x.slice(1):[S],D=n[_.key]||{},oe=i[_.key]||{},O=Wt(D.total),be=Wt(D.processed),fe=oe[S.archive],W=Wt(fe?.total),L=Wt(fe?.processed),q=W>0&&L>=W,E=k.reduce((pe,K)=>pe+K.total,0),X=k.reduce((pe,K)=>pe+K.processed,0),ee=S.total,F=S.processed;a?(O=x.reduce((pe,K)=>pe+K.total,0),be=x.reduce((pe,K)=>pe+K.processed,0)):O<=0&&(O=E,be=X);let ie=nr(be,O),_e=nr(X,E),z=!a&&q,Se=nr(z?L:F,z?W:ee);_.latest=S,_.baselineRows=k,_.activeState=ie,_.reuseState=_e,_.embedState=Se,_.reuseComplete=_e.complete,_.embedComplete=Se.complete,_.embedNoBacklog=z,ie.complete&&(p.active+=1),_e.complete?p.reuseComplete+=1:p.reuseIncomplete+=1,Se.complete?p.embedComplete+=1:p.embedIncomplete+=1}let m=[...new Set([...l.values()].map(_=>_.year))].sort((_,x)=>x.localeCompare(_)).map(_=>{let x=Array.from({length:12},(S,k)=>{let D=k+1,oe=`${_}${String(D).padStart(2,"0")}`,O=l.get(oe);if(!O)return`<td class="judgment-month is-empty"><span>${D}</span></td>`;let be=O.current&&e.run_status==="running",fe=F=>F.percent===null?"\u2014":`${F.percent}%`,W=F=>F.empty?"\u7121\u8CC7\u6599":F.complete?"\u5B8C\u6210":"\u672A\u5B8C\u6210",L=String(s.phase||"")==="embedding"?"E \u65B0 embedding":String(s.phase||"")==="reuse"?"R \u91CD\u7528":"R\uFF0FE",q=O.latest&&O.latest.total>0?`${(100*O.latest.processed/O.latest.total).toFixed(1)}%`:"\u2014",E=O.current&&O.latest?`\u672C\u6B21 run ${L} ${d(O.latest.processed)} / ${d(O.latest.total)}\uFF08${q}\uFF09`:"",X=[`${O.year}-${String(O.monthNo).padStart(2,"0")}`,O.archives.join("\u3001")||"\u2014",`A \u4E0A\u4E00\u500B\u6B63\u5F0F\u7248\u672C ${d(O.activeState.processed)} / ${d(O.activeState.total)}\uFF08${fe(O.activeState)}\uFF09\xB7 ${W(O.activeState)}`,`A\uFF0FR \u57FA\u7DDA ${d(O.reuseState.processed)} / ${d(O.reuseState.total)}\uFF08${fe(O.reuseState)}\uFF09\xB7 ${W(O.reuseState)}`,O.embedNoBacklog?`E \u7121 E backlog\uFF08active \u5DF2\u8986\u84CB ${d(O.embedState.total)} \u7B46\uFF1B\u4E0D\u9700\u65B0 embedding\uFF09`:`E \u65B0 embedding ${d(O.embedState.processed)} / ${d(O.embedState.total)}\uFF08${fe(O.embedState)}\uFF09\xB7 ${W(O.embedState)}`,O.reuseComplete?"":"\u5F85\u5B8C\u6210\uFF1AR \u65E2\u6709\u5411\u91CF\u91CD\u7528",O.embedComplete?"":"\u5F85\u5B8C\u6210\uFF1AE \u65B0 embedding",E,O.current?`${O.preparing?"\u6E96\u5099\u7D22\u5F15":be?"\u76EE\u524D\u7D22\u5F15":"\u6700\u5F8C\u7D22\u5F15"} \xB7 ${L}${O.jid?` \xB7 ${O.jid}`:""}`:""].filter(Boolean).join(" \xB7 "),ee=[["is-active",O.activeState],["is-reuse",O.reuseState],["is-embed",O.embedState]].map(([F,ie])=>`<span class="index-month-block ${F} ${ie.stateClass}" style="--fill:${ie.fill.toFixed(1)}%"></span>`).join("");return`<td class="judgment-month index-month index-month-are processing-month is-neutral${be?" is-current":""}" title="${r(X)}"${be?' aria-current="true"':""}><span class="index-month-number">${D}</span><span class="index-month-blocks" aria-hidden="true">${ee}</span></td>`}).join("");return`<tr><th scope="row">${r(_)}</th>${x}</tr>`}).join(""),y=e.copy||{},b=Wt(y.total),u=Wt(y.copied),v=y.status==="success"?"\u5B8C\u6210":y.status==="running"?"\u57F7\u884C\u4E2D":y.status==="stale"?"\u4E2D\u6B62":"\u7B49\u5F85";return`<div class="judgment-months index-months">
    ${!a&&b>0?`<div class="index-copy-global-chip" title="03 \u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF\u662F\u5168\u57DF points \u6E96\u5099\u968E\u6BB5\uFF0C\u4E0D\u5217\u5165\u6708\u4EFD A\uFF0FR\uFF0FE\uFF1BR \u662F 04 \u9010\u6708\u6383\u63CF\u9032\u5EA6\u3002">
          <span class="badge badge-neutral">03 \u8907\u88FD\uFF08\u5168\u57DF\uFF09</span>
          <span class="mono">${d(u)} / ${d(b)} points</span>
          <span>\xB7 ${r(v)} \xB7 \u4E0D\u5217\u5165\u6708\u4EFD A\uFF0FR\uFF0FE</span>
        </div>`:""}
    <div class="index-runtime-summary index-month-are-summary">
      <span title="A\uFF1A\u4E0A\u4E00\u500B\u6B63\u5F0F\u7248\u672C\u57FA\u7DDA archive \u5DF2\u5B8C\u6210\u7684\u6708\u4EFD\u6578\uFF1B\u4E0D\u5217\u5165\u65B0\u7248\u672C\u5B8C\u6210\u6578\uFF1B\u4EE5\u6708\u4EFD\u8A08\u3002">A \u57FA\u7DDA\u6708\u4EFD <strong class="mono">${d(p.active)}</strong></span>
      <span title="R \u5B8C\u6210\uFF1A\u672C\u6B21 run \u5DF2\u8655\u7406\u5B8C\u6210\u7684\u6708\u4EFD\u6578\uFF1B\u5C1A\u672A\u6383\u5230\u7684\u6708\u4EFD\u4E0D\u5217\u5165\u5B8C\u6210\uFF1B\u4EE5\u6708\u4EFD\u8A08\u3002">R \u5B8C\u6210\u6708\u4EFD <strong class="mono">${d(p.reuseComplete)}</strong></span>
      <span title="R \u672A\u5B8C\u6210\uFF1A\u672C\u6B21 run \u5C1A\u672A\u5B8C\u6210 R \u7684\u6708\u4EFD\u6578\uFF1B\u5305\u542B\u5C1A\u672A\u6383\u5230\u7684\u5F8C\u7E8C\u6708\u4EFD\uFF1B\u4EE5\u6708\u4EFD\u8A08\u3002">R \u672A\u5B8C\u6210\u6708\u4EFD <strong class="mono">${d(p.reuseIncomplete)}</strong></span>
      <span title="E \u5B8C\u6210\uFF1Alatest archive \u5DF2\u5B8C\u6574\u8986\u84CB\u3001\u7121\u9700\u65B0 embedding \u7684\u6708\u4EFD\u6578\uFF1B\u5305\u542B\u672A\u8B8A\u66F4\u6708\u4EFD\uFF1B\u4EE5\u6708\u4EFD\u8A08\uFF0C\u4E0D\u662F RAR \u6A94\u6578\u3002">E \u5B8C\u6210\u6708\u4EFD <strong class="mono">${d(p.embedComplete)}</strong></span>
      <span title="E \u672A\u5B8C\u6210\uFF1Alatest archive \u4ECD\u6709\u5F85\u88DC\u65B0 embedding \u7684\u6708\u4EFD\u6578\uFF1B\u4EE5\u6708\u4EFD\u8A08\uFF0C\u4E0D\u662F RAR \u6A94\u6578\u3002">E \u672A\u5B8C\u6210\u6708\u4EFD <strong class="mono">${d(p.embedIncomplete)}</strong></span>
      <span>\u7E3D\u6708\u4EFD <strong class="mono">${d(l.size)}</strong></span>
    </div>
    <div class="index-month-are-key processing-timeline-legend" aria-label="A\uFF0FR\uFF0FE \u968E\u6BB5\u5716\u4F8B">
      <span class="processing-timeline-legend-label">04 \u6708\u4EFD</span>
      <span><i class="is-active"></i>A \xB7 active \u57FA\u7DDA\uFF08\u975E 03 copy\uFF09</span>
      <span><i class="is-reuse"></i>R \xB7 04 \u9010\u6708\u6CBF\u7528</span>
      <span><i class="is-embed"></i>E \xB7 04 \u9010\u6708\u65B0 embedding</span>
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
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(_,x)=>`<th scope="col">${x+1}</th>`).join("")}</tr></thead>
        <tbody>${m}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA A\uFF08\u4E0A\u4E00\u500B\u6B63\u5F0F\u7248\u672C\u65E2\u6709\u8986\u84CB\uFF09\u3001R\uFF08\u672C\u6B21\u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF09\u3001E\uFF08\u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding\uFF09\u3002A \u4E0D\u5217\u5165\u65B0\u7248\u672C\u5B8C\u6210\u6578\uFF0CR\uFF0FE \u624D\u662F\u672C\u6B21\u5EFA\u7F6E\u9032\u5EA6\uFF1B\u5B8C\u6210\u70BA\u5BE6\u5FC3\uFF1B\u672A\u5B8C\u6210\u6642\u5DF2\u5B8C\u6210\u6BD4\u4F8B\u70BA\u5BE6\u8272\u3001\u5269\u9918\u5340\u6BB5\u70BA\u540C\u8272 25% \u6DFA\u8272\uFF0C\u56E0\u6B64 0% \u6642\u6574\u683C\u90FD\u662F\u6DFA\u8272\uFF1B\u7121\u8CC7\u6599\u624D\u662F\u6DE1\u8272\u7A7A\u5FC3\u3002\u6700\u65B0 archive \u5DF2\u88AB active collection \u5B8C\u6574\u8986\u84CB\uFF08\u7121 E backlog\uFF09\u7684\u672A\u8B8A\u66F4\u6708\u4EFD\uFF0CE \u53EF\u4F7F\u7528 active \u8986\u84CB\u986F\u793A\u5B8C\u6210\uFF1BR \u4E00\u5F8B\u4F7F\u7528\u672C\u6B21 run \u7684 processed\uFF0Ftotal\uFF0C\u5C1A\u672A\u6383\u5230\u7684\u5F8C\u7E8C\u6708\u4EFD\u7DAD\u6301 25% \u6DFA\u8272\u3002\u4ECD\u6709 E backlog \u7684\u6708\u4EFD\uFF0CR\uFF0FE \u90FD\u4F7F\u7528\u672C\u6B21 run \u7684 processed\uFF0Ftotal\u3002E \u7121 backlog \u6642\u82E5\u986F\u793A\u5BE6\u5FC3\uFF0Ctooltip \u6703\u6A19\u793A\u4E0D\u9700\u65B0 embedding\u300203 \u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF\u662F\u5168\u57DF points \u6E96\u5099\u968E\u6BB5\uFF0C\u4E0D\u6703\u91CD\u8907\u756B\u6210\u6708\u4EFD\u5206\u683C\uFF1BR \u662F 04 \u9010\u6708\u6383\u63CF\u9032\u5EA6\u3002summary \u8207\u65B9\u584A\u4F7F\u7528\u540C\u4E00\u4EFD\u72C0\u614B\uFF0Csidebar \u66F4\u65B0 badge \u53E6\u4EE5 E backlog \u6708\u4EFD\u8A08\u3002\u540C\u4E00\u6708\u4EFD\u53EF\u80FD\u6709\u591A\u500B archive\uFF0CA\uFF0FR \u4F7F\u7528\u8F03\u820A\u7684\u57FA\u7DDA archive\uFF0CE \u4F7F\u7528\u540D\u7A31\u4E2D\u66F4\u65B0\u65E5\u671F\u6700\u65B0\u7684 archive\uFF1B\u65B0\u820A archive \u4E0D\u6703\u76F8\u52A0\u3002E \u5B8C\u6210\uFF0F\u672A\u5B8C\u6210\u4EE5\u6708\u4EFD\u8A08\uFF0C\u4E0D\u662F RAR \u6A94\u6578\u3002${Eo(e)}\u7DA0\u6846\u53EA\u6A19\u793A\u76EE\u524D\u6279\u6B21\u6240\u5728\u6708\u4EFD\u3002\u76EE\u524D\u7D22\u5F15\u6708\u4EFD\u4EE5\u5BE6\u7DDA\u5916\u6846\u6A19\u793A\uFF0Cpadding \u4E0D\u4F7F\u7528\u72C0\u614B\u5E95\u8272\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B active \u8986\u84CB\u3001A\uFF0FR \u57FA\u7DDA\u3001E \u9032\u5EA6\u8207\u76EE\u524D\u6848\u865F\u3002</p>
  </div>`}function Eu(e){let t=e.import_timeline||{},s=Array.isArray(t.months)?t.months:[];if(!s.length)return`<section class="report-card processing-card import-files-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u672A\u53D6\u5F97\u5224\u6C7A\u4E0B\u8F09 manifest \u6216\u672C\u6A5F\u58D3\u7E2E\u6A94\uFF1B\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u5F8C\u6703\u986F\u793A\u6708\u4EFD\u72C0\u614B\u3002</div>
    </section>`;let a=new Map(s.map(b=>[String(b.month),b])),n=[...new Set(s.map(b=>b.year))].sort((b,u)=>u-b),i=["extract","raw_parquet","filter","postgres"],o=t.stage_labels||{},l=n.map(b=>{let u=Array.from({length:12},(v,w)=>{let _=w+1,x=`${b}${String(_).padStart(2,"0")}`,S=a.get(x);return dr({month:S,year:b,monthNo:_,stageOrder:i,stageLabels:o,stageStatuses:S?.import_stages||{},stageProgress:S?.import_stage_progress||{},overall:S?.import_overall||"empty",active:!!S?.active,processing:String(S?.month||"")===String(t.processing_month||""),workflowForStage:()=>"judgment_import",variant:"import"})}).join("");return`<tr><th scope="row">${r(b)}</th>${u}</tr>`}).join(""),p=t.summary||{},f=t.stage_summary||{},m=s.find(b=>b.active),y=m?`<div class="index-current-row">${xo({activeMonth:t.active_month||String(m.month||""),activeArchive:t.active_archive||m.active_archive||"",activePhase:t.active_phase||"",processingMonth:t.processing_month||"",processingArchive:t.processing_archive||"",stageLabels:o})}</div>`:"";return`<section class="report-card processing-card import-files-card" data-import-timeline="judgment">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${g("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
      ${au(t,s,f,p)}
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(b,u)=>`<th scope="col">${u+1}</th>`).join("")}</tr></thead>
          <tbody>${l}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\uFF1ARAR \u6AA2\u67E5\uFF0F\u89E3\u58D3\u7E2E\u3001\u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD\u3001\u91D1\u878D\u6CD5\u898F\u7BE9\u9078\u3001PostgreSQL metadata\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF1B\u6709\u5F85\u66F4\u65B0\u6A94\u6848\u6642\uFF0C\u5C1A\u672A\u91CD\u505A\u7684\u56DB\u500B\u968E\u6BB5\u65B9\u683C\u4EE5\u6DFA\u6A58\uFF0F\u6DFA\u7D05\uFF0F\u6DFA\u7D2B\uFF0F\u6DFA\u85CD\u8868\u793A\uFF0C\u5B8C\u6210\u5F8C\u8F49\u70BA\u5BE6\u5FC3\u6DF1\u8272\uFF1B\u5C1A\u672A\u5B8C\u6210\u968E\u6BB5\u4EE5 25% \u6DFA\u8272\u8868\u793A\uFF1B\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u5B8C\u6210\u8272\u5782\u76F4\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u672A\u5B8C\u6210\u5340\u6BB5\u7DAD\u6301 25% \u6DFA\u8272\uFF1B\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u539F\u59CB\u8CC7\u6599\u968E\u6BB5\u6703\u5148\u6AA2\u67E5\u65E2\u6709 Parquet\uFF0C\u53EF\u6CBF\u7528\u6642\u4E0D\u91CD\u65B0\u5099\u4EFD\uFF1B\u7F3A\u5C11\u6642\u6703\u986F\u793A\u300C\u5EFA\u7ACB YYYY-MM \u5099\u4EFD\u300D\uFF0C\u5B8C\u6210\u5F8C\u986F\u793A\u300C\u5DF2\u5EFA\u7ACB\u5099\u4EFD\u300D\u3002\u7BE9\u9078\u8207 PostgreSQL \u968E\u6BB5\u6703\u986F\u793A\u76EE\u524D\u8655\u7406\u7684\u6708\u4EFD\u8207 archive\u3002\u5BE6\u7DDA\u6846\u6A19\u793A\u76EE\u524D\u532F\u5165\u6708\u4EFD\uFF1B\u82E5\u5BE6\u969B\u8655\u7406\u7684\u662F\u8F03\u820A\u6708\u4EFD\uFF0C\u8A72\u6708\u53E6\u4EE5\u865B\u7DDA\u6846\u6A19\u793A\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u56DB\u500B\u968E\u6BB5\u7684\u72C0\u614B\u3001\u672C\u6A5F\u58D3\u7E2E\u6A94\u8207\u5DF2\u532F\u5165\u6A94\u540D\u3002</p>
    </div>
  </section>`}function Ro(e,t,s){let n=[t.run_id||e.active_run?.id||e.last_run?.id||"",t.version_id??"",t.collection||"",t.started_at||""].join("|"),i=Date.now(),o=mo.get(n);if(!o){let b=Date.parse(t.started_at||""),u=Date.parse(t.finished_at||""),v=Date.parse(t.updated_at||"");t.run_status!=="running"&&Number.isFinite(b)&&(Number.isFinite(u)||Number.isFinite(v))?o={at:b,indexed:0}:o={at:i,indexed:Math.max(0,s)},mo.set(n,o)}let l=Date.parse(t.finished_at||""),p=Date.parse(t.updated_at||""),f=t.run_status==="running"?i:Number.isFinite(l)?l:Number.isFinite(p)?p:i,m=Math.max(0,(f-Number(o.at||0))/1e3),y=Math.max(0,Number(s)-Number(o.indexed||0));return m<=0||y<=0?0:y/m}function sa(e){let t=Number(e);return!Number.isFinite(t)||t<0?"\u2014":t>=36e5?Co(t):ue(t)}function Co(e){if(!Number.isFinite(e)||e<0)return"\u2014";let t=Math.max(0,Math.round(e/1e3)),s=Math.floor(t/3600),a=Math.floor(t%3600/60),n=t%60,i=String(n).padStart(2,"0");return s>0?`${s}h ${String(a).padStart(2,"0")}m ${i}s`:a>0?`${a}m ${i}s`:`${n}s`}function Po(e,t,s,a){let n=Date.parse(e.started_at||"");if(!Number.isFinite(n))return{elapsedMs:null,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let i=e.run_status==="running",o=Date.parse(e.finished_at||""),l=Date.parse(e.updated_at||""),p=i?Date.now():Number.isFinite(o)?o:Number.isFinite(l)?l:Date.now(),f=Math.max(0,p-n),m=Number(s),y=Number(t);if(!Number.isFinite(m)||m<=0)return{elapsedMs:f,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let b=Math.max(0,m-Math.max(0,Number.isFinite(y)?y:0));if(b<=0)return{elapsedMs:f,estimatedTotalMs:f,remainingMs:0,remainingCount:0};if(!i||a<=0)return{elapsedMs:f,estimatedTotalMs:null,remainingMs:null,remainingCount:b};let u=b/a*1e3;return{elapsedMs:f,estimatedTotalMs:f+u,remainingMs:u,remainingCount:b}}function Ru(e){let t=e.index_runtime||{};if(!t.available)return"";let s=!!t.coverage_only,a=Eo(t),n=t.current||{},i=t.summary||{},o=Number(i.indexed??n.indexed??0),l=s?0:Ro(e,t,o),p=Tu(t),f=s?null:Po(t,o,i.total,l),m=f?.remainingCount>0?`\u8207\u5269\u9918 ${d(f.remainingCount)} \u7B46`:"",y=l>0?`\u4F9D\u672C\u6B21\u5E73\u5747 ${l.toFixed(1)} \u7B46/\u79D2${m}\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002\u5BE6\u969B\u901F\u5EA6\u6703\u96A8 embedding \u8207\u6279\u6B21\u5927\u5C0F\u8B8A\u52D5\u3002`:"\u5C1A\u7121\u8DB3\u5920\u7684\u672C\u9801\u89C0\u5BDF\u8CC7\u6599\u53EF\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002",b=k=>r(Co(f?f[k]:null)),u=`<div class="index-runtime-metrics">
    <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u7D22\u5F15\u7684\u6708\u4EFD\u6578\uFF1B\u76EE\u524D\u8655\u7406\u4E2D\u7684\u6708\u4EFD\u4E0D\u5217\u5165\uFF0C\u7E3D\u6578\u70BA\u7D22\u5F15\u7BC4\u570D\u5167\u7684\u6709\u6548\u6708\u4EFD\u3002">
      <span>\u5DF2\u8655\u7406\u6708\u4EFD</span>
      <strong>${d(p.completed)} / ${d(p.total)}</strong>
    </span>
    <span class="index-runtime-metric" title="\u5DF2\u7D22\u5F15\u7B46\u6578 / \u7D22\u5F15\u7BC4\u570D\u7E3D\u7B46\u6578\u3002">
      <span>\u5DF2\u8655\u7406\u7B46\u6578</span>
      <strong>${d(o)} / ${d(i.total)}</strong>
    </span>
    <span class="index-runtime-metric" title="\u81EA\u672C\u6B21\u9801\u9762\u958B\u59CB\u89C0\u5BDF\u7684\u7D2F\u8A08\u5E73\u5747\uFF1B\u4E2D\u9014\u52A0\u5165\u4EE5\u9996\u6B21\u89C0\u5BDF\u6642\u9593\u8207\u7B46\u6578\u70BA\u57FA\u6E96\u3002\u5F8C\u6BB5\u82E5\u4EE5\u65B0 embedding \u70BA\u4E3B\uFF0C\u901F\u5EA6\u6703\u4E0B\u964D\u3002">
      <span>\u672C\u6B21\u5E73\u5747</span>
      <strong>${l>0?`${l.toFixed(1)} \u7B46/\u79D2`:"\u2014"}</strong>
    </span>
    <span class="index-runtime-metric" title="\u81EA\u672C\u6B21\u7D22\u5F15 run \u958B\u59CB\u6642\u9593 ${r(ye(t.started_at))} \u8D77\u7B97\uFF1B\u4E2D\u9014\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002">
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
  </div>`,v=t.run_status==="running"?n.preparing?"\u6E96\u5099\u4E2D":"\u76EE\u524D\u8655\u7406":"\u6700\u5F8C\u8655\u7406",w=!!n.preparing&&t.scan_order==="issue_month",_=t.copy||{},x=Number(_.total)>0?`\u8907\u88FD ${d(_.copied)} / ${d(_.total)} points`:"\u5EFA\u7ACB\u65B0\u7248\u672C collection",S=w?`<div class="index-current-row">
        <span class="badge badge-info" title="${r(a)}">${g("activity",11)}\u6E96\u5099\u4E2D</span>
        <span class="index-current-copy">${r(x)}\uFF1B\u7248\u672C\u6E96\u5099\u5B8C\u6210\u5F8C\u6703\u5F9E\u6700\u820A\u6708\u4EFD\u958B\u59CB\u7D22\u5F15\uFF0C\u7B2C\u4E00\u6279\u958B\u59CB\u524D\u4E0D\u6A19\u793A\u76EE\u524D\u6708\u4EFD\u3002</span>
      </div>`:n.jid?`<div class="index-current-row">
        <span class="badge badge-info" title="${r(a)}">${g("activity",11)}${v}</span>
        <strong class="mono">${r(Ja(n.month))}</strong>
        <span class="mono">${r(n.archive||"\u2014")}</span>
        ${n.preparing?"":ju(n,t.run_status==="running")}
        <span class="mono">${r(n.jid||"\u2014")}</span>
        <span class="index-current-copy">${r([n.court,n.title].filter(Boolean).join(" \xB7 ")||"\u2014")}</span>
        <span class="faint">${n.preparing?"\u6E96\u5099\u4E2D":`\u6279\u6B21 ${d(n.batch_size)} \u7B46`}</span>
      </div>`:"";return`<section class="report-card processing-card index-files-card">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${g("table",14)}04 \u91D1\u878D\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6708\u4EFD A\uFF0FR\uFF0FE</span>
      ${u}
    </div>
    ${t.error?`<div class="processing-update-notice index-runtime-error">${g("alert",13)}<span>${r(t.error)}</span></div>`:""}
    <div class="index-runtime-summary">
      <span>\u7248\u672C <strong class="mono">v${r(t.version_id??"\u2014")}</strong></span>
      <span>Collection <code>${r(t.collection||"\u2014")}</code></span>
      <span>\u6A21\u5F0F <strong>${r(t.build_mode||"\u2014")}</strong></span>
      <span>\u6383\u63CF\u9806\u5E8F <strong>${r(t.scan_order==="issue_month"?"\u6708\u4EFD\uFF08\u820A\u2192\u65B0\uFF09":"ID\uFF08\u820A run\uFF09")}</strong></span>
      ${s?"":`<span>\u91CD\u7528 <strong class="mono">${d(i.reused)}</strong></span>
            <span>\u65B0 embedding <strong class="mono">${d(i.embedded)}</strong></span>`}
    </div>
    ${S}
    ${Nu(t)}
    ${s?'<p class="judgment-months-hint index-coverage-note">\u76EE\u524D\u986F\u793A active collection \u7684\u6708\u4EFD\u7D22\u5F15\u8986\u84CB\uFF1B\u57F7\u884C Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u5F8C\u6703\u986F\u793A\u672C\u6B21\u7D22\u5F15\u9032\u5EA6\u8207 A\uFF0FR\uFF0FE \u6642\u9593\u8868\u3002</p>':""}
  </section>`}function Cu(e={}){let{storage:t,loading:s,error:a}=e;if(a)return`<section class="report-card processing-card index-storage-card">
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
    </section>`;let n=t.qdrant_storage||{},o=(Array.isArray(t.databases)?t.databases:[]).find(m=>m.id==="qdrant")||{},l=n.volume_bytes??o.volume_bytes??null,p=n.points_count??o.points_count,f=n.segments_count??o.segments_count;return`<section class="report-card processing-card index-storage-card">
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
      <span>Points\uFF0FSegments</span><strong class="mono">${d(p)} / ${d(f)}</strong>
    </div>
    <div class="index-runtime-foot">\u8CC7\u6599\u6642\u9593 ${r(ye(t.checked_at))}</div>
  </section>`}function mr({badge:e="",lead:t="",rows:s=[],note:a=""}){return`<section class="report-card processing-card parquet-help-card workflow-help-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("info",14)}\u529F\u80FD\u8AAA\u660E</span>
      ${e?`<span class="badge badge-neutral">${r(e)}</span>`:""}
    </div>
    <div class="parquet-help-body">
      <p class="parquet-help-lead">${t}</p>
      <div class="parquet-help-grid">${s.map(([n,i])=>`<span>${r(n)}</span><strong>${i}</strong>`).join("")}</div>
      ${a?`<p class="parquet-help-note">${a}</p>`:""}
    </div>
  </section>`}function Pu(){return mr({badge:"\u552F\u8B80\u532F\u51FA",lead:"\u5C07 PostgreSQL \u76EE\u524D\u6709\u6548\u7684\u5224\u6C7A\uFF08<code>judgment_documents.is_current = true</code>\uFF09\u532F\u51FA\u6210\u7368\u7ACB\u7684 Parquet \u5FEB\u7167\uFF0C\u4F9B\u96E2\u7DDA\u5206\u6790\u3001\u8CC7\u6599\u4EA4\u63DB\u6216\u4FDD\u5B58\u3002",rows:[["\u4F86\u6E90","PostgreSQL <code>judgment_documents</code>\uFF0C\u53EA\u542B\u76EE\u524D\u6709\u6548\u4E14\u5DF2\u547D\u4E2D\u91D1\u878D\u6CD5\u898F\u6E05\u55AE\u7684\u5224\u6C7A\u3002"],["\u8F38\u51FA",'<span class="mono">JUDGMENT_DATA_DIR/parquet/judgments/YYYYMMDD/HHMMSS-xxxxxxxx/judgments.parquet</span>'],["\u9644\u5E36\u6A94",'<span class="mono">\u540C\u76EE\u9304 manifest.json\uFF08\u7B46\u6578\u3001\u6A94\u6848\u5927\u5C0F\u3001\u6B04\u4F4D\u3001\u7522\u751F\u6642\u9593\uFF09</span>'],["\u5167\u5BB9","\u6848\u865F\u3001\u6CD5\u9662\u3001\u6848\u7531\u3001\u5168\u6587\u3001\u547D\u4E2D\u6CD5\u898F\u3001\u5F15\u7528\u3001\u4F86\u6E90\u58D3\u7E2E\u6A94\u8207\u6642\u9593\u6B04\u4F4D\uFF1B<code>citations</code> \u4EE5 JSON \u5B57\u4E32\u4FDD\u5B58\u3002"],["\u8207\u539F\u59CB Parquet","\u8CC7\u6599\u9801\u8207 <code>source=parquet</code> \u4F7F\u7528 <code>parquet/raw_judgments/.../raw.parquet</code>\uFF1B\u672C\u6D41\u7A0B\u7684 <code>parquet/judgments/...</code> \u662F\u53E6\u4E00\u500B\u6B63\u898F\u5316\u5FEB\u7167\u3002"],["\u4E0D\u6703","\u4E0D\u5BEB\u56DE PostgreSQL\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u820A\u5FEB\u7167\uFF1B\u53EA\u532F\u51FA current \u8CC7\u6599\uFF0C\u4E0D\u542B\u6B77\u53F2\u7248\u672C\u3002"],["\u4E2D\u65B7","\u6BCF\u6B21\u57F7\u884C\u5EFA\u7ACB\u65B0\u7684\u5B8C\u6574\u5FEB\u7167\uFF1B\u4E2D\u65B7\u5F8C\u91CD\u65B0\u57F7\u884C\u4E0D\u6703\u7E8C\u5BEB\u540C\u4E00\u500B Parquet \u6A94\u3002"]],note:"\u9069\u5408 DuckDB\u3001pandas\u3001Spark \u7B49\u96E2\u7DDA\u5206\u6790\uFF0C\u6216\u9700\u8981\u56FA\u5B9A\u6642\u9593\u9EDE\u7684\u53EF\u91CD\u73FE\u8CC7\u6599\u5FEB\u7167\u3002\u65E5\u5E38 RAG \u67E5\u8A62\u8207\u8CC7\u6599\u9801\u700F\u89BD\u4E0D\u9700\u8981\u57F7\u884C\u6B64\u6D41\u7A0B\u3002"})}function Iu(){return mr({badge:"PostgreSQL \u56DE\u586B",lead:"\u5C07\u5224\u6C7A\u7684 <code>court</code> \u8F49\u6210\u6A19\u6E96\u6CD5\u9662\u540D\u7A31\u4E26\u5BEB\u5165 <code>court_normalized</code>\uFF1B\u539F\u59CB <code>court</code> \u6703\u4FDD\u7559\u4F9B\u8FFD\u6EAF\u3002",rows:[["\u8655\u7406\u7BC4\u570D","\u9810\u8A2D\u53EA\u8655\u7406 <code>court_normalized</code> \u70BA\u7A7A\u7684\u8CC7\u6599\uFF1B\u5DF2\u6B63\u898F\u5316\u8CC7\u6599\u6703\u8DF3\u904E\uFF0C\u53EF\u7528 <code>--all</code> \u91CD\u65B0\u8A08\u7B97\u5168\u90E8\u3002"],["\u89E3\u6790\u9806\u5E8F","\u539F\u59CB\u6CD5\u9662\u503C\u958B\u982D\u7B26\u5408\u6A19\u6E96\u540D\u7A31 \u2192 \u5224\u6C7A\u5168\u6587\u524D 8,000 \u5B57\u6700\u65E9\u51FA\u73FE\u7684\u6CD5\u9662 \u2192 \u539F\u59CB\u6CD5\u9662\u503C\u4EFB\u610F\u4F4D\u7F6E\u7684\u6A19\u6E96\u540D\u7A31 \u2192 JID \u5B98\u65B9\u6CD5\u9662\u4EE3\u78BC\u3002"],["\u8F38\u51FA","\u5BEB\u5165 <code>judgment_documents.court_normalized</code>\uFF1B\u4E0D\u4FEE\u6539\u539F\u59CB <code>court</code>\u3001\u5168\u6587\u6216\u5176\u4ED6\u5224\u6C7A\u6B04\u4F4D\u3002"],["\u672A\u89E3\u6790","\u7121\u6CD5\u5224\u65B7\u6642\u4FDD\u7559\u7A7A\u503C\uFF0C\u4E0D\u731C\u6E2C\uFF1B\u6458\u8981\u6703\u5217\u51FA\u672A\u89E3\u6790\u7B46\u6578\u8207\u5E38\u898B\u6A23\u672C\u3002"],["\u5F71\u97FF","\u8CC7\u6599\u9801\u7684\u6CD5\u9662\u4E0B\u62C9\u3001\u7CBE\u78BA\u7BE9\u9078\u3001\u6392\u5E8F\u3001\u7D50\u679C\u6B04\u4F4D\u8207\u5224\u6C7A\u539F\u6587\u4F7F\u7528\u6B63\u898F\u5316\u540D\u7A31\uFF1BAPI \u4ECD\u56DE\u50B3 <code>court_raw</code>\u3002"],["\u4E0D\u6703","\u4E0D\u91CD\u65B0\u532F\u5165\u5224\u6C7A\u3001\u4E0D\u6539\u5168\u6587\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u8CC7\u6599\u3002"],["\u91CD\u8DD1","\u9810\u8A2D\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u898F\u5247\u66F4\u65B0\u5F8C\u53EF\u7528 <code>--all</code> \u91CD\u7B97\uFF0C\u6216\u5148\u7528 <code>--dry-run</code> \u7D71\u8A08\u3002"]],note:"\u9069\u5408\u5728\u5224\u6C7A\u532F\u5165\u5F8C\u3001\u6CD5\u9662\u540D\u7A31\u898F\u5247\u66F4\u65B0\u5F8C\uFF0C\u6216\u8CC7\u6599\u9801\u6CD5\u9662\u9078\u9805\u51FA\u73FE\u7F3A\u6F0F\u6642\u57F7\u884C\u3002\u7D50\u679C\u4E5F\u6703\u5BEB\u5165\u6548\u80FD\u7D00\u9304\u3002"})}function Du(){return mr({badge:"\u689D\u6587\u6B77\u53F2\u5EFA\u6A94",lead:"\u70BA\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u5EFA\u7ACB <code>law_article_versions</code> \u6B77\u53F2\u689D\u6587\u5FEB\u7167\u8207 <code>law_article_change_events</code> \u8B8A\u66F4\u7D00\u9304\uFF0C\u8B93\u8CC7\u6599\u9801\u80FD\u5207\u63DB\u6B77\u53F2\u7248\u672C\u4E26\u67E5\u770B\u689D\u6587\u5DEE\u7570\u3002",rows:[["\u4F86\u6E90","PostgreSQL \u6CD5\u898F\u7248\u672C\uFF0C\u4EE5\u53CA <code>LAW_DATA_DIR/raw_parquet</code> \u5167\u5C0D\u61C9\u7684\u539F\u59CB\u6CD5\u898F Parquet \u5FEB\u7167\u3002"],["\u5339\u914D\u65B9\u5F0F","\u4EE5 raw Parquet manifest \u7684 <code>zip_sha256</code>\uFF0F<code>raw_json_sha256</code> \u5C0D\u61C9\u6CD5\u898F\u7248\u672C\uFF0C\u4E0D\u731C\u6E2C\u5167\u5BB9\u3002"],["\u7522\u751F\u5167\u5BB9","<code>article_key</code>\uFF08\u689D\u6587\u985E\u578B\uFF0B\u689D\u865F\uFF09\u3001<code>content_hash</code>\u3001\u689D\u6587\u5168\u6587\u8207\u751F\u6548\u65E5\uFF1B\u8207\u524D\u4E00\u7248\u672C\u6BD4\u8F03\u5F8C\u8A18\u9304 <code>added</code>\uFF0F<code>modified</code>\uFF0F<code>removed</code>\u3002"],["\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB","\u5206\u9801\u4E0A\u65B9\u7684\u552F\u8B80\u6AA2\u67E5\u6703\u8B80\u53D6 <code>law_article_versions</code> \u8207\u539F\u59CB Parquet\uFF0C\u5224\u65B7\u7248\u672C\u662F\u5426\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\uFF1B\u6AA2\u67E5\u672C\u8EAB\u4E0D\u6703\u4FEE\u6539\u8CC7\u6599\u5EAB\u3002"],["\u53EF\u5EFA\u7ACB","\u627E\u5230\u5C0D\u61C9\u539F\u59CB Parquet \u7684\u7248\u672C\uFF0C\u53EF\u76F4\u63A5\u57F7\u884C\u6B64\u6D41\u7A0B\u5EFA\u7ACB\u689D\u6587\u6B77\u53F2\u3002"],["\u7F3A\u539F\u59CB\u6A94","\u627E\u4E0D\u5230\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u6A19\u793A\u7121\u6CD5\u5EFA\u7ACB\uFF0C\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD\uFF1B\u6B64\u6D41\u7A0B\u6703\u8DF3\u904E\u4E26\u5217\u5728 <code>missing_versions</code>\u3002"],["\u6AA2\u67E5\u7D50\u679C","\u5E74\u4EFD\xD7\u6708\u4EFD\u8868\u986F\u793A\u5DF2\u5EFA\u7ACB\uFF0F\u672A\u5EFA\u7ACB\uFF0F\u90E8\u5206\u5EFA\u7ACB\uFF1B\u4E0B\u65B9\u5217\u51FA\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u7248\u672C\u65E5\u671F\u8207\u53EF\u5EFA\u7ACB\u72C0\u614B\u3002\u76EE\u524D\u72C0\u614B\u4EE5\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u5361\u7247\u5373\u6642\u986F\u793A\u3002"],["\u8DF3\u904E\u689D\u4EF6","\u5DF2\u6709\u689D\u6587\u5FEB\u7167\u7684\u7248\u672C\u6703\u8DF3\u904E\uFF1B\u627E\u4E0D\u5230\u53EF\u8B80\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u5217\u5165 <code>missing_versions</code>\uFF0C\u4E0D\u5EFA\u7ACB\u865B\u69CB\u689D\u6587\u3002"],["\u4E0D\u6703","\u4E0D\u4E0B\u8F09\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u4E0D\u89E3\u6790\u65B0 ZIP\u3001\u4E0D\u4FEE\u6539 <code>law_documents</code> \u6216\u76EE\u524D\u7248\u672C\u3001\u4E0D\u66F4\u65B0 Qdrant\uFF0FIndexedDB\u3002"],["\u8F38\u51FA\u6458\u8981","\u7248\u672C\u6578\u3001\u8DF3\u904E\u7248\u672C\u6578\u3001\u7F3A\u5C11\u5FEB\u7167\u7248\u672C\u3001\u5BEB\u5165\u689D\u6587\u6578\u8207\u689D\u6587\u8B8A\u66F4\u4E8B\u4EF6\u6578\u3002"],["\u91CD\u8DD1","\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u5DF2\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u4E0D\u6703\u91CD\u8907\u63D2\u5165\u3002"]],note:"\u9069\u5408\u5F9E\u820A\u7248 schema \u5347\u7D1A\u3001\u65E2\u6709\u6CD5\u898F\u7248\u672C\u7F3A\u5C11\u6B77\u53F2\u689D\u6587\uFF0C\u6216\u8CC7\u6599\u9801\u6B77\u53F2\u689D\u6587\u7248\u672C\u8207\u8B8A\u66F4\u7D00\u9304\u4E0D\u5B8C\u6574\u6642\u57F7\u884C\u3002\u57F7\u884C\u524D\u53EF\u5148\u7528\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u78BA\u8A8D\u54EA\u4E9B\u7248\u672C\u53EF\u5EFA\u7ACB\u3001\u54EA\u4E9B\u7F3A\u539F\u59CB\u6A94\u3002"})}function Bu(e={}){let t=e.courtCheck,s=!!e.courtCheckLoading,a=e.courtCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-court-check"${s?" disabled":""}>${g("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31"}</span></button>`;if(a)return`<section class="report-card processing-card court-check-card">
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
    </section>`;let p={green:"\u5DF2\u6AA2\u67E5",red:"\u9700\u6B63\u898F\u5316\uFF08\u5B8C\u5168\u672A\u6AA2\u67E5\uFF09",gray:"\u9700\u6B63\u898F\u5316"},f=new Map(i.map(b=>[String(b.month),b])),y=[...new Set(i.map(b=>b.year))].sort((b,u)=>u-b).map(b=>{let u=Array.from({length:12},(v,w)=>{let _=w+1,x=`${b}${String(_).padStart(2,"0")}`,S=f.get(x);if(!S)return`<td class="judgment-month is-empty"><span>${_}</span></td>`;let k=p[S.status]?S.status:"red",D=[`${b}-${String(_).padStart(2,"0")}`,p[k],`\u7E3D ${d(S.total)} \u7B46`,`\u5DF2\u6AA2\u67E5 ${d(S.checked)} \u7B46`,`\u672A\u6AA2\u67E5 ${d(S.unchecked)} \u7B46`,S.invalid?`\u7121\u6548\u503C ${d(S.invalid)} \u7B46`:"",`\u6709\u6548 ${pt(S.percent)}`].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month court-check-month is-${k==="gray"?"red":k}" title="${r(D)}"><span>${_}</span></td>`}).join("");return`<tr><th scope="row">${r(b)}</th>${u}</tr>`}).join("");return`<section class="report-card processing-card court-check-card">
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
          <tbody>${y}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u5168\u90E8\u5DF2\u6B63\u898F\u5316\uFF1B\u7D05\u8272\uFF1A\u9700\u6B63\u898F\u5316\uFF08\u542B\u5B8C\u5168\u672A\u6AA2\u67E5\u3001\u90E8\u5206\u672A\u6B63\u898F\u5316\u6216\u7121\u6548\u503C\uFF09\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002summary \u7684\u7D05\u8272\u6578\u5B57\u70BA\u9700\u6B63\u898F\u5316\u6708\u4EFD\u6578\uFF1B\u4E0B\u65B9\u660E\u7D30\u4ECD\u4FDD\u7559\u672A\u6AA2\u67E5\u8207\u7121\u6548\u503C\u7B46\u6578\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u8A73\u7D30\u7B46\u6578\u8207\u6709\u6548\u6BD4\u4F8B\u3002</p>
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(ye(t.checked_at))} \xB7 \u6A19\u6E96\u6CD5\u9662\u540D\u7A31 ${d(t.canonical_count)} \u500B</div>
    </div>
  </section>`}function Fu(e={}){let t=e.lawVersionCheck,s=!!e.lawVersionCheckLoading,a=e.lawVersionCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-law-version-check"${s?" disabled":""}>${g("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB"}</span></button>`;if(a)return`<section class="report-card processing-card law-version-card">
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
    </section>`;let p={green:"\u5DF2\u5EFA\u7ACB",red:"\u672A\u5EFA\u7ACB",gray:"\u90E8\u5206\u5EFA\u7ACB"},f=new Map(i.map(W=>[String(W.month),W])),y=[...new Set(i.map(W=>W.year))].sort((W,L)=>L-W).map(W=>{let L=Array.from({length:12},(q,E)=>{let X=E+1,ee=`${W}${String(X).padStart(2,"0")}`,F=f.get(ee);if(!F)return`<td class="judgment-month is-empty"><span>${X}</span></td>`;let ie=p[F.status]?F.status:"red",_e=[`${W}-${String(X).padStart(2,"0")}`,p[ie],`\u7248\u672C ${d(F.version_count)}\uFF08\u6CD5\u898F ${d(F.law_versions)}\uFF0F\u547D\u4EE4 ${d(F.order_versions)}\uFF09`,`\u5DF2\u5EFA\u7ACB ${d(F.backfilled_count)}`,`\u672A\u5EFA\u7ACB ${d(F.missing_count)}`,`\u9700\u5EFA\u7ACB ${d(F.needs_backfill_count)}\uFF08\u53EF\u5EFA\u7ACB ${d(F.backfillable_count)}\uFF0F\u7F3A\u539F\u59CB\u6A94 ${d(F.blocked_count)}\uFF09`,`\u689D\u6587\u5217 ${d(F.article_rows)} / \u9810\u671F ${d(F.article_count)}`,F.current?"\u76EE\u524D\u7248\u672C":"",F.versions?.length?`\u7248\u672C ${F.versions.map(z=>`#${z.version_id}`).join("\u3001")}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month law-version-month is-${ie}${F.current?" is-current":""}" title="${r(_e)}"><span>${X}</span></td>`}).join("");return`<tr><th scope="row">${r(W)}</th>${L}</tr>`}).join(""),b={law:"\u6CD5\u898F",order:"\u547D\u4EE4"},u=i.flatMap(W=>(W.versions||[]).filter(L=>L.needs_backfill).map(L=>({...L,month:W.month}))).sort((W,L)=>L.version_id-W.version_id),v=u.slice(0,20),w=v.map(W=>{let L=W.backfillable?"badge-info":W.blocked?"badge-danger":"badge-neutral",q=W.backfillable?"\u53EF\u5EFA\u7ACB":W.blocked?"\u7F3A\u539F\u59CB\u6A94":"\u5F85\u6AA2\u67E5";return`<div class="law-backfill-needed-row">
        <strong class="mono">#${W.version_id}</strong>
        <span class="badge ${L}">${q}</span>
        <span>${r(b[W.source_type]||W.source_type||"\u2014")}</span>
        <span class="mono">${r(W.update_date||W.month||"\u2014")}</span>
        <span class="law-backfill-needed-reason">${r(W.reason||"\u2014")}</span>
      </div>`}).join(""),_=u.length?`<div class="law-backfill-needed">
        <div class="law-backfill-needed-head">\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C <span class="badge badge-warn">${d(u.length)}</span></div>
        <div class="law-backfill-needed-list">${w}</div>
        ${u.length>v.length?`<div class="law-backfill-needed-more">\u53E6\u6709 ${d(u.length-v.length)} \u500B\u7248\u672C\u672A\u5217\u51FA</div>`:""}
      </div>`:'<div class="law-backfill-needed is-clear">\u76EE\u524D\u6C92\u6709\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3002</div>',x=Number(l.needs_backfill_versions)||0,S=Number(l.backfillable_versions)||0,k=Number(l.blocked_versions)||0,D=Number(l.backfilled_versions)||0,oe=Number(l.versions)||0,O=x<=0?"ok":k>0?"danger":"warn",be=x<=0?"\u4E0D\u9700\u8981\u5EFA\u7ACB":"\u9700\u8981\u5EFA\u7ACB",fe=x>0?`\u9700\u8981\u5EFA\u7ACB ${d(x)} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF1A\u53EF\u5EFA\u7ACB ${d(S)}\u3001\u7F3A\u539F\u59CB\u6A94 ${d(k)}\u3002\u5DF2\u6709\u6B77\u53F2\u689D\u6587 ${d(D)} \u500B\u7248\u672C${k>0?"\uFF1B\u7F3A\u539F\u59CB\u6A94\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD":""}\u3002`:`\u76EE\u524D ${d(oe)} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`;return`<section class="report-card processing-card law-version-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
      ${n}
    </div>
    <div class="law-version-check-status is-${O}" role="status" aria-live="polite">
      <span class="badge badge-${O}">${be}</span>
      <span>${r(fe)}</span>
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(W,L)=>`<th scope="col">${L+1}</th>`).join("")}</tr></thead>
          <tbody>${y}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u8A72\u6708\u4EFD\u6240\u6709\u7248\u672C\u90FD\u6709\u6B77\u53F2\u689D\u6587\uFF1B\u7D05\u8272\uFF1A\u5B8C\u5168\u672A\u5EFA\u7ACB\uFF1B\u7070\u8272\uFF1A\u90E8\u5206\u7248\u672C\u5DF2\u5EFA\u7ACB\uFF1B\u5916\u6846\uFF1A\u76EE\u524D\u7248\u672C\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u7248\u672C\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u6578\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u6578\u8207\u689D\u6587\u5217\u3002</p>
      ${_}
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(ye(t.checked_at))}</div>
    </div>
  </section>`}function Ou(){return`<div class="processing-ollama-loading">
    <span class="spinner" aria-hidden="true"></span>
    <span>\u6B63\u5728\u6AA2\u67E5 llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span>
  </div>`}function Hu(e,t,s){let a=Array.isArray(e?.hosts)?e.hosts:[];if(s&&!a.length)return`${Ce({tone:"danger",title:"llama-server \u4E3B\u6A5F\u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
    <div class="processing-ollama-empty">
      <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh-ollama">
        ${g("refresh",13)}<span>\u91CD\u65B0\u6AA2\u67E5</span>
      </button>
    </div>`;if(!a.length)return t?Ou():'<div class="processing-ollama-empty">\u5C1A\u672A\u8A2D\u5B9A llama-server \u4E3B\u6A5F\uFF1B\u8ACB\u5230\u300C\u7CFB\u7D71\u72C0\u614B \u2192 Model Provider\u300D\u65B0\u589E\u4E26\u9023\u63A5\u6A21\u578B\u3002</div>';let n=a.map((o,l)=>{let p=o.status==="operational",f=Array.isArray(o.models)?o.models:[],m=f.length?f.map(b=>`<span class="processing-ollama-model ${p?"is-online":"is-offline"}">${r(b.name||"")}</span>`).join(""):'<span class="processing-ollama-model is-offline">\u6C92\u6709\u53EF\u7528\u6A21\u578B</span>',y=[o.embedding_model?`<span class="processing-ollama-role ${p?"is-online":"is-offline"}">\u5D4C\u5165 \xB7 ${r(o.embedding_model)}</span>`:'<span class="processing-ollama-role is-offline">\u672A\u8A2D\u5B9A\u5D4C\u5165\u6A21\u578B</span>',o.chat_model?`<span class="processing-ollama-role is-offline">\u804A\u5929 \xB7 ${r(o.chat_model)}</span>`:""].filter(Boolean).join("");return`<article class="processing-ollama-host ${p?"is-online":"is-offline"}" data-ollama-host data-host-id="${Number(o.id)}">
        <span class="processing-ollama-handle" aria-hidden="true">${g("grid",14)}</span>
        <span class="processing-ollama-rank">${l+1}</span>
        <div class="processing-ollama-main">
          <div class="processing-ollama-title">
            <strong>${r(o.name||o.base_url||`\u4E3B\u6A5F #${o.id}`)}</strong>
            <span class="processing-ollama-status">${p?"\u53EF\u7528":"\u7121\u6CD5\u9023\u7DDA"}</span>
          </div>
          <span class="processing-ollama-url mono">${r(o.base_url||"\u2014")}</span>
          <div class="processing-ollama-models">${m}</div>
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
      <span>\u5171 ${d(a.length)} \u53F0\u4E3B\u6A5F</span>
      <span>\u7B2C\u4E00\u512A\u5148\uFF1A<strong>${r(i)}</strong></span>
      <span class="muted">${t?"\u91CD\u65B0\u6AA2\u67E5\u4E2D\u2026":"\u6BCF 30 \u79D2\u81EA\u52D5\u6AA2\u67E5"}</span>
    </div>
    <div class="processing-ollama-list" data-ollama-list>${n}</div>
    <p class="processing-ollama-hint">\u62D6\u79FB\u6216\u4F7F\u7528\u7BAD\u982D\u8ABF\u6574 embedding \u512A\u5148\u9806\u5E8F\uFF1B\u76EE\u524D\u4E3B\u6A5F\u7121\u6CD5\u4F7F\u7528\u6642\uFF0C\u6703\u4F9D\u5E8F\u81EA\u52D5\u6539\u7528\u4E0B\u4E00\u53F0\uFF08\u5404\u53F0\u9700\u5177\u5099\u76F8\u540C\u7684 embedding \u6A21\u578B\uFF09\uFF0C\u76F4\u5230\u6709\u4E3B\u6A5F\u56DE\u50B3\u5411\u91CF\u3002</p>`}function zu(e,t={}){let s=e.active_run||null,a=s||e.last_run||null,n=Dt===e.id,i=!!s||n,o=!!e.can_run&&!i,l=i?"\u6B64\u6D41\u7A0B\u6B63\u5728\u57F7\u884C\u4E2D\u3002":e.start_blocked_reason||"\u76EE\u524D\u6709\u5176\u4ED6\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",p=Array.isArray(e.command)?e.command.join(" "):"",f=Number(e.update_count)||e.update_available&&Number(e.pending_count)||0,m=e.update_origin||"\u66F4\u65B0\u5075\u6E2C",y=e.update_mechanism||"\u65E2\u6709\u66F4\u65B0\u6AA2\u67E5\u7D00\u9304",b=e.update_message||e.update_status&&e.update_status.message||"\u627E\u5230\u53EF\u66F4\u65B0\u5167\u5BB9\u3002",u=e.update_status&&e.update_status.checked_at?ye(e.update_status.checked_at):"",v=e.progress||{},w=Array.isArray(v.stages)?v.stages:[],_=String(v.active_stage||""),x=w.find(O=>String(O.key||"")===_),S=(e.index_runtime&&e.index_runtime.current?e.index_runtime.current.month:"")||"",k=S?Ja(S):x&&(x.label||x.key)||"",D=n&&!s?"\u555F\u52D5\u4E2D":"\u57F7\u884C\u4E2D",oe=`<section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${g(qo[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
        <span class="badge badge-neutral badge-mono">${r(e.branch||"")}</span>
      </div>
      <div class="processing-workflow-command-grid">
        <span>\u7A0B\u5F0F</span><code>${r(e.program||"\u2014")}</code>
        <span>Shell\uFF0F\u5165\u53E3</span><code>${r(e.script||"\u2014")}</code>
        <span>\u5BE6\u969B\u547D\u4EE4</span><code class="processing-workflow-command">${r(p||"\u2014")}</code>
      </div>
      ${rr.has(e.id)?'<div class="processing-embedding-strip-slot" data-processing-embedding-strip data-preserve-children></div>':""}
      <div class="processing-workflow-actions">
        <button class="btn btn-primary btn-sm" type="button"
          data-processing-action="run-workflow"
          data-workflow-id="${r(e.id)}"
          ${o?"":"disabled"}
          ${o?"":`title="${r(l)}"`}>
          ${i?'<span class="spinner" aria-hidden="true"></span>':g("play",14)}<span>${i?D:"\u57F7\u884C\u6B64\u6D41\u7A0B"}</span>
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
              <span class="badge badge-info">${g("activity",11)}${D}</span>
              ${s&&s.id?`<span class="mono">${r(s.id)}</span>`:""}
              ${s&&s.started_at?`<span>\u958B\u59CB ${r(ye(s.started_at))}</span>`:""}
              ${k?`<span>\u76EE\u524D\u8655\u7406 <strong class="mono">${r(k)}</strong></span>`:""}
            </div>`:""}
      <div class="side-card-foot">
        \u57F7\u884C\u7D50\u679C\u6703\u5BEB\u5165\u5171\u7528\u8655\u7406\u72C0\u614B\u6A94\uFF0C\u53EF\u5F9E\u8655\u7406\u7E3D\u89BD\u67E5\u770B\u3002
      </div>
    </section>`;return`<div class="processing-workflow-panel">
    ${Ce({tone:"info",title:e.label,text:e.description||""})}
    ${e.update_available?`<div class="processing-update-notice" role="status" data-processing-update-notice>
            <span class="processing-update-notice-icon">${g("refresh",14)}</span>
            <span class="processing-update-notice-copy">
              <strong>${r(m)}\u5075\u6E2C\u5230\u53EF\u66F4\u65B0\u5167\u5BB9</strong>
              <span class="processing-update-mechanism">\u5075\u6E2C\u6A5F\u5236\uFF1A${r(y)}${u?` \xB7 \u6AA2\u67E5\u6642\u9593 ${r(u)}`:""}</span>
              <span class="processing-update-message" data-processing-update-message>${r(b)}</span>
            </span>
            ${f>0?`<span class="badge badge-warn badge-mono" data-processing-update-count>${g("refresh",10)}${d(f)}</span>`:'<span class="badge badge-warn">\u53EF\u66F4\u65B0</span>'}
            <button class="btn btn-primary btn-sm processing-update-action" type="button"
              data-processing-action="run-workflow"
              data-workflow-id="${r(e.id)}"
              ${o?"":"disabled"}
              title="${r(o?"\u7ACB\u5373\u57F7\u884C\uFF1B\u6703\u5148\u8A08\u7B97\u7E3D\u5927\u5C0F\u8207\u9810\u4F30\u6642\u9593":l)}">
              ${i?'<span class="spinner" aria-hidden="true"></span>':g("download",14)}<span>${i?D:"\u66F4\u65B0"}</span>
            </button>
          </div>`:""}
    ${["legal_index_versions","law_download","order_download"].includes(e.id)?ru(e.index_timelines,{titleSuffix:e.id==="legal_index_versions"?"\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868":"\u4E0B\u8F09\u6642\u9593\u8868"}):""}
    ${e.id==="normalize_courts"?oe:""}
    ${e.id==="normalize_courts"?Bu(t):""}
    ${e.id==="backfill_law_articles"?Fu(t):""}
    ${e.id!=="normalize_courts"?oe:""}
    ${Lu(e)}
    ${e.id==="judgment_parquet"?Pu():""}
    ${e.id==="normalize_courts"?Iu():""}
    ${e.id==="backfill_law_articles"?Du():""}
    ${e.id==="judgment_import"?Eu(e):""}
    ${e.id==="index_versions"?Ru(e):""}
    ${e.id==="index_versions"?Cu(t):""}
    ${e.id==="judgment_download"?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${g("calendar",14)}\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B</span>
              <button class="btn btn-ghost btn-sm" type="button" title="\u91CD\u65B0\u6383\u63CF raw_rar \u76EE\u9304\u8207\u6708\u4EFD\u72C0\u614B" data-processing-action="refresh-judgment-months">${g("refresh",13)}<span>\u91CD\u65B0\u6574\u7406</span></button>
            </div>
            <div data-judgment-months-slot data-preserve-children>${pr()}</div>
          </section>`:""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${jt(a?.status||"idle")}
      </div>
      ${fu(a)}
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${g("history",14)}\u57F7\u884C\u7D00\u9304</span>
        <span class="badge badge-neutral">\u6700\u8FD1 ${d((e.recent_runs||[]).length)} \u7B46</span>
      </div>
      ${ku(e.recent_runs)}
    </section>
    ${["law_download","order_download","judgment_download"].includes(e.id)?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${g("search",14)}\u7248\u672C\u6AA2\u67E5\u7D00\u9304</span>
              <span class="badge badge-neutral">\u6700\u8FD1 ${d((e.update_history||[]).length)} \u7B46</span>
            </div>
            ${Su(e)}
          </section>`:""}
  </div>`}function Qa(e,t,s={},a=new Set){if(t==="overview")return wo(e,a);let i=(Array.isArray(e.workflows)?e.workflows:[]).find(o=>o.id===t);return i?zu(i,s):wo(e,a)}async function Gu(e){e.innerHTML=`<section class="page processing-page">
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
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-workflows"),n=e.querySelector("#processing-stop"),i=!1,o=document.createElement("div");o.className="processing-stage-tooltip",o.hidden=!0,t.appendChild(o),It=new Map;let l=!1,p=!1,f=!1,m=null,y="",b="",u="overview",v=null,w=!1,_=null,x=null,S=null,k=!1,D=null,oe=0,O=null,be=!1,fe=null,W=0,L=null,q=!1,E=null,X=0,ee=null,F=!1,ie=null,_e=0,z=!1,ve=null,Z=!1,Se=!1,pe="",K=new Set,re=null,me=null,he=-1,ke="",xe=0,Ee=0,Oe=null,P=[],U=()=>({storage:S,loading:k,error:D,courtCheck:O,courtCheckLoading:be,courtCheckError:fe,lawVersionCheck:L,lawVersionCheckLoading:q,lawVersionCheckError:E}),j=()=>{if(u!=="judgment_download")return;let h=s.querySelector(".processing-workflow-panel");if(!h)return;h.querySelectorAll(".judgment-month.is-active").forEach(De=>{De.classList.remove("is-active"),De.removeAttribute("aria-current")});let c=h.querySelector("[data-judgment-progress]");if(!c)return;let $=v?.progress,T=!!(m?.workflows||[]).find(De=>De.id==="judgment_download")?.active_run;if((!$||$.active===!1)&&!T){c.hidden=!0,c.classList.remove("is-indeterminate");let De=c.querySelector("[data-judgment-run]");De&&(De.hidden=!0);return}if(c.hidden=!1,!$||$.active===!1){let De=c.querySelector("[data-judgment-progress-phase]");De&&(De.textContent="\u6E96\u5099\u4E2D");let wt=c.querySelector("[data-judgment-progress-month]");wt&&(wt.textContent="\u2014");let Ye=c.querySelector("[data-judgment-progress-filename]");Ye&&(Ye.textContent="\u7B49\u5F85\u4E0B\u8F09\u7A0B\u5E8F\u56DE\u5831\u9032\u5EA6\u2026",Ye.title=""),c.classList.add("is-indeterminate");let Ut=c.querySelector("[data-judgment-progress-bar]");Ut&&(Ut.style.width="");let xt=c.querySelector("[data-judgment-progress-percent]");xt&&(xt.textContent="\u2014");let _t=c.querySelector("[data-judgment-progress-size]");_t&&(_t.textContent="\u2014");let ns=c.querySelector("[data-judgment-progress-note]");ns&&(ns.textContent="\u5DF2\u555F\u52D5\uFF0C\u7B49\u5F85\u9032\u5EA6\u56DE\u5831");let Qt=c.querySelector("[data-judgment-run]");Qt&&(Qt.hidden=!0);let Bt=c.querySelector("[data-judgment-downloads]");Bt&&(Bt.hidden=!0);let Jt=c.querySelector("[data-judgment-current]");Jt&&(Jt.hidden=!1);return}let C={preparing:"\u6E96\u5099\u4E2D",planning:"\u8A08\u7B97\u5927\u5C0F",scanning:"\u6383\u63CF\u4E2D",checking:"\u6AA2\u67E5\u4E2D",downloading:"\u4E0B\u8F09\u4E2D",saving:"\u5132\u5B58\u4E2D",finalizing:"\u6574\u7406\u4E2D"},ne=C[$.phase]||"\u8655\u7406\u4E2D",Q=Array.isArray($.downloads)?$.downloads:[],J=Q.length>0,ge=c.querySelector("[data-judgment-current]");ge&&(ge.hidden=J);let we=c.querySelector("[data-judgment-downloads]");if(we){we.hidden=!J;let De=c.querySelector("[data-judgment-downloads-count]");De&&(De.textContent=`${d(Q.length)} \u500B\u9032\u884C\u4E2D`);let wt=c.querySelector("[data-judgment-downloads-list]");wt&&J&&(wt.innerHTML=Q.map(Ye=>{let Ut=C[Ye.phase]||ne||"\u8655\u7406\u4E2D",xt=Number(Ye.bytes_written),_t=Number(Ye.total_bytes),ns=Number.isFinite(_t)&&_t>0,Qt=Ye.percent,Bt=Qt==null||Qt===""?ns&&Number.isFinite(xt)?xt/_t*100:null:Number(Qt),Jt=Bt===null||!Number.isFinite(Bt),pa=Jt?"\u2014":`${Math.min(100,Math.max(0,Bt)).toFixed(Bt>=10?0:1)}%`,ma=ns?`${qe(xt)} / ${qe(_t)}`:Number.isFinite(xt)&&xt>0?qe(xt):"\u2014";return`<div class="processing-download-active-item">
              <div class="processing-download-active-line">
                <strong class="mono">${r(Ye.month||"\u2014")}</strong>
                <span class="processing-download-active-file mono" title="${r(Ye.filename||"")}">${r(Ye.filename||"\u2014")}</span>
                <span class="processing-download-active-percent mono">${r(pa)}</span>
              </div>
              <div class="processing-download-active-track${Jt?" is-indeterminate":""}"><span style="width:${Jt?"":`${Math.min(100,Math.max(0,Bt)).toFixed(1)}%`}"></span></div>
              <div class="processing-download-active-meta">
                <span>${r(Ut)}</span>
                <span>${r(ma)}</span>
              </div>
            </div>`}).join(""))}let Ae=c.querySelector("[data-judgment-progress-phase]");Ae&&(Ae.textContent=ne);let Ue=$.month||"",Ke=c.querySelector("[data-judgment-progress-month]");Ke&&(Ke.textContent=Ue||"\u2014");let Gt=$.filename||"",Nt=c.querySelector("[data-judgment-progress-filename]");Nt&&(Nt.textContent=Gt||"\u2014",Nt.title=Gt);let je=new Map;for(let De of Q)De.month&&je.set(String(De.month),{percent:De.percent,phase:De.phase});Ue&&!je.has(Ue)&&je.set(Ue,{percent:$.percent,phase:$.phase}),h.querySelectorAll(".judgment-month.is-active").forEach(De=>{De.classList.remove("is-active","is-downloading"),De.removeAttribute("aria-current"),De.style.removeProperty("--month-progress")});for(let[De,wt]of je){let Ye=h.querySelector(`[data-judgment-month-key="${De}"]`);if(!Ye)continue;Ye.classList.add("is-active"),(wt?.phase==="downloading"||wt?.phase==="saving")&&Ye.classList.add("is-downloading"),Ye.setAttribute("aria-current","true");let Ut=Number(wt?.percent);Number.isFinite(Ut)&&Ye.style.setProperty("--month-progress",`${Math.min(100,Math.max(0,Ut)).toFixed(1)}%`)}let Ve=Number($.bytes_written),He=Number($.total_bytes),St=Number.isFinite(He)&&He>0,gs=null,fs=$.percent;fs!=null&&fs!==""&&Number.isFinite(Number(fs))?gs=Number(fs):St&&Number.isFinite(Ve)&&(gs=Ve/He*100);let sn=gs===null;c.classList.toggle("is-indeterminate",sn);let Ar=c.querySelector("[data-judgment-progress-bar]");Ar&&(Ar.style.width=sn?"":`${Math.min(100,Math.max(0,gs)).toFixed(1)}%`);let qr=c.querySelector("[data-judgment-progress-percent]");if(qr){let De=sn?null:Math.min(100,Math.max(0,gs));qr.textContent=De===null?"\u2014":`${De.toFixed(De>=10?0:1)}%`}let Mr=c.querySelector("[data-judgment-progress-size]");if(Mr){let De=Number.isFinite(Ve)&&Ve>0?qe(Ve):"\u2014";Mr.textContent=St?`${De} / ${qe(He)}`:De}let Lr=c.querySelector("[data-judgment-progress-note]");if(Lr){let De=[],wt=Number($.candidate_index),Ye=Number($.candidate_total);Number.isFinite(wt)&&wt>0&&Number.isFinite(Ye)&&Ye>0&&De.push(`\u7B2C ${d(wt)} / ${d(Ye)} \u500B\u6708`),$.fileset_id&&De.push(`fileset ${$.fileset_id}`),$.message&&$.phase!=="downloading"&&De.push(String($.message)),Lr.textContent=De.join(" \xB7 ")}let jr=c.querySelector("[data-judgment-run]"),Tr=$.run_files_total!==null&&$.run_files_total!==void 0;if(jr&&(jr.hidden=!Tr,Tr)){let De=Number($.run_files_total)||0,wt=Number($.run_files_done)||0,Ye=$.run_bytes_total===null||$.run_bytes_total===void 0?null:Number($.run_bytes_total),Ut=Number($.run_bytes_done)||0,xt=$.run_percent,_t=xt==null||xt===""?null:Number(xt),ns=c.querySelector("[data-judgment-run-bar]");ns&&(ns.style.width=_t===null||!Number.isFinite(_t)?"":`${Math.min(100,Math.max(0,_t)).toFixed(1)}%`);let Qt=c.querySelector("[data-judgment-run-percent]");Qt&&(Qt.textContent=_t===null||!Number.isFinite(_t)?"\u2014":`${_t.toFixed(_t>=10?0:1)}%`);let Bt=c.querySelector("[data-judgment-run-files]");Bt&&(Bt.textContent=`${d(wt)} / ${d(De)} \u500B\u6708`);let Jt=c.querySelector("[data-judgment-run-size]"),pa=$.phase==="planning";Jt&&(Ye!==null&&Ye>0?Jt.textContent=`\u5DF2\u4E0B\u8F09 ${qe(Ut)} / ${qe(Ye)}`:Jt.textContent=`\u5DF2\u4E0B\u8F09 ${qe(Ut)} \xB7 ${pa?"\u7E3D\u91CF\u8A08\u7B97\u4E2D":"\u7E3D\u91CF\u672A\u77E5"}`);let ma=c.querySelector("[data-judgment-run-elapsed]");ma&&(ma.textContent=`\u5DF2\u82B1 ${ta($.elapsed_seconds)}`);let an=c.querySelector("[data-judgment-run-eta]");if(an){let nn=Number($.eta_seconds),al=Number($.estimated_total_seconds);Number.isFinite(nn)&&nn>=0?an.textContent=`\u5269\u9918 ${ta(nn)} \xB7 \u9810\u4F30\u7E3D\u8A08 ${ta(al)}`:an.textContent=pa&&($.run_bytes_total===null||$.run_bytes_total===void 0)?"\u5269\u9918\u6642\u9593\uFF1A\u8A08\u7B97\u4E2D":"\u5269\u9918\u6642\u9593\uFF1A\u2014"}}},B=()=>{if(u!=="judgment_download")return;let h=s.querySelector("[data-judgment-months-slot]");if(h){let c=Array.isArray(v?.months)?v.months:[];_&&!v?(h.innerHTML=Ce({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(_)}),delete h.dataset.judgmentMonthCount):v?h.dataset.judgmentMonthCount!==String(c.length)?(h.innerHTML=wu(v),h.dataset.judgmentMonthCount=String(c.length)):_u(h,v):(h.querySelector(".judgment-months-loading")||(h.innerHTML=pr()),delete h.dataset.judgmentMonthCount)}if(v){let c=ur(v),$=x!==c.pending;x=c.pending;let M=(m?.workflows||[]).find(C=>C.id==="judgment_download");M&&(M.update_count=c.pending,M.update_available=c.pending>0);let T=s.querySelector("[data-processing-update-notice]");if(T)if(c.pending<=0)T.remove();else{let C=T.querySelector("[data-processing-update-count]");C&&(C.innerHTML=`${g("refresh",10)}${d(c.pending)}`);let ne=T.querySelector("[data-processing-update-message]");ne&&(ne.textContent=`\u5224\u6C7A\u5F85\u88DC\u9F4A ${d(c.pending)} \u500B\u6708`)}$&&a&&m&&ts(a,Ua(m,u))}j()},te=()=>{let h=Array.isArray(ee?.hosts)?ee.hosts:[];return JSON.stringify({loading:!h.length&&F,error:!h.length&&ie?ie.message||String(ie):"",active:ee?.active_host_id??null,hosts:h.map(c=>({id:c.id,name:c.name,url:c.base_url,status:c.status,detail:c.detail,embedding:c.embedding_model,chat:c.chat_model,models:(c.models||[]).map($=>$.name)}))})},G=()=>{let h=s.querySelector("[data-processing-ollama]");if(!h||_e)return;let c=te();h.dataset.ollamaSignature!==c&&(h.dataset.ollamaSignature=c,h.innerHTML=Hu(ee,F,ee?null:ie))},Re=()=>{let c=((m?.sections||[]).find($=>$.key==="legal")?.stages||[]).find($=>$.key==="legal_qdrant");return ar(c?.model?.label||"")},Le=()=>{let h=s.querySelector("[data-processing-embedding-strip]");if(!h)return;let c=Array.isArray(ee?.hosts)?ee.hosts:[],$=[];for(let J of c)if(J.status==="operational")for(let ge of J.models||[])Array.isArray(ge.capabilities)&&ge.capabilities.includes("embedding")&&$.push({hostId:Number(J.id),model:ge.name,label:ar(`${J.name||J.base_url||`\u4E3B\u6A5F ${J.id}`}:${ge.name}`),baseUrl:J.base_url||""});let M=Re(),T=c.find(J=>Number(J.id)===Number(ee?.active_host_id)),C=$.map(J=>{let ge=J.label===M;return`<button class="rag-model-button${ge?" is-active":""}" type="button"
        data-processing-action="select-embedding-model"
        data-host-id="${J.hostId}"
        data-model="${r(J.model)}"
        title="${r(J.label)}"
        aria-pressed="${ge?"true":"false"}"
        ${Se?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(J.label)}</span>
        ${ge?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`});M&&!$.some(J=>J.label===M)&&C.unshift(`<button class="rag-model-button is-active is-static" type="button" aria-pressed="true" disabled>
          <span class="rag-model-state" aria-hidden="true"></span>
          <span>${r(M)}</span>
          <span class="rag-model-current">\u4F7F\u7528\u4E2D</span>
        </button>`);let ne=$.length?`<div class="rag-model-buttons">${C.join("")}</div>`:`<p class="rag-model-empty">${F?"\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\u8207 Embedding model\u2026":ie?`\u7121\u6CD5\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\uFF1A${r(ie.message||String(ie))}`:"\u76EE\u524D\u6C92\u6709\u53EF\u7528\u7684 Embedding model\u3002"}</p>`,Q=`<div class="processing-embedding-strip rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${g("brain",13)} Embedding \u4E3B\u6A5F\uFF0F\u6A21\u578B</span>
        ${T?.base_url?`<span class="rag-model-strip-base mono">${r(T.base_url)}</span>`:""}
        <span class="rag-model-strip-current">\u76EE\u524D\uFF1A<strong>${r(M||"\u2014")}</strong></span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-processing-action="refresh-embedding-models"
          ${F?"disabled":""}>
          ${g("refresh",12)}<span>\u6AA2\u67E5\u6A21\u578B</span>
        </button>
      </div>
      ${ne}
      <p class="rag-model-hint">\u9EDE\u9078 <span class="mono">\u4E3B\u6A5F:\u6A21\u578B</span> \u5207\u63DB Embedding\uFF1B\u9078\u53D6\u5F8C\u6703\u6210\u70BA\u7B2C\u4E00\u512A\u5148\uFF0C\u5176\u4ED6\u4E3B\u6A5F\u4F9D\u5E8F\u4F5C\u70BA\u5099\u63F4\u3002\u5207\u63DB\u6A21\u578B\u5F8C\u65E2\u6709\u7D22\u5F15\u53EF\u80FD\u9700\u8981\u91CD\u5EFA\u3002</p>
    </div>`;h.innerHTML!==Q&&(h.innerHTML=Q)},Ie=h=>{let c=s.querySelector('[data-import-timeline="judgment"]');if(!c)return;let $=String(h?.active_month||""),M=String(h?.processing_month||"");c.querySelectorAll(".processing-month").forEach(we=>{let Ae=!!$&&we.dataset.month===$;we.classList.toggle("is-current",Ae),we.classList.toggle("is-processing-current",!!M&&we.dataset.month===M),Ae?we.setAttribute("aria-current","true"):we.removeAttribute("aria-current")});let T=c.querySelector(".index-current-row");if(!$||!h?.active_archive){T&&T.remove();return}let C=m?.workflows?.find(we=>we.id==="judgment_import")?.import_timeline?.stage_labels||{},ne=xo({activeMonth:$,activeArchive:h.active_archive,activePhase:h.active_phase||"",processingMonth:h.processing_month||"",processingArchive:h.processing_archive||"",stageLabels:C});if(T){T.innerHTML=ne;return}let Q=document.createElement("div");Q.className="index-current-row",Q.innerHTML=ne;let J=c.querySelector(":scope > .side-card-head");if(J){J.insertAdjacentElement("afterend",Q);return}let ge=c.querySelector(".judgment-months");ge&&ge.prepend(Q)},Qe=h=>{let c=Number(h?.state_mtime_ns);return Number.isFinite(c)?c:-1},mt=h=>{let c=String(h?.active_month||"");return/^\d{6}$/.test(c)?Number(c):-1},de=h=>{if(!h)return;let c=Qe(h);if(c>=0&&c<he){me?.active_month&&Ie(me);return}c>=0&&(he=c);let $=String(h.active_month||"");if(!!(h.run_id&&h.run_id===me?.run_id)&&mt(h)>=0&&mt(h)<mt(me)){let T={...h,active_month:me.active_month,active_archive:me.active_archive};me=T,Ie(T);return}if(!$&&h.run_status==="running"){me?.active_month&&me?.run_id===h.run_id?Ie(me):(me=h,Ie(h));return}me=h,Ie(h)},We=h=>{let c=h?.active_import;if(c){de(c);return}me?.active_month&&Ie(me)},nt=()=>{l||re||(re=ht(["processing","judgment-download","system-usage","ollama","court-check","law-version-check"],(h,c)=>{if(!l){if(h==="processing"){c?.snapshot?.live?Ds(c.snapshot):c?.snapshot?Is(c.snapshot,{silent:!0}):qt({silent:!0});return}if(h==="judgment-download"){u==="judgment_download"&&A({quiet:!0,payload:c?.snapshot||null});return}if(h==="system-usage"){u==="index_versions"&&N({quiet:!0,force:!0,payload:c?.snapshot||null});return}if(h==="ollama"){rr.has(u)&&et({quiet:!0,payload:c?.snapshot||null});return}if(h==="court-check"){u==="normalize_courts"&&R({quiet:!0,force:!0,payload:c?.snapshot||null});return}h==="law-version-check"&&u==="backfill_law_articles"&&H({quiet:!0,force:!0,payload:c?.snapshot||null})}},{onProgress:(h,c)=>{if(h!=="processing")return;let $=c?.event;$&&ca($)},onError:()=>{m||qt({silent:!0})}}))},gt=()=>{re&&(re(),re=null)},Xe=async h=>{if(Se)return;let[c,...$]=String(h||"").split("|"),M=Number(c),T=$.join("|");if(!M||!T){Le();return}let C=(ee?.hosts||[]).find(Q=>Number(Q.id)===M);if(!C){Le();return}let ne=ar(`${C.name||C.base_url||`\u4E3B\u6A5F ${C.id}`}:${T}`);if(ne===Re()){Le();return}if(!window.confirm(`\u5207\u63DB Embedding \u70BA ${ne}\uFF1F

\u5207\u63DB\u6A21\u578B\u5F8C\uFF0C\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u8207\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u53EF\u80FD\u4E0D\u76F8\u5BB9\uFF0C\u9700\u8981\u91CD\u65B0\u5EFA\u7ACB\u7D22\u5F15\u3002`)){Le();return}Se=!0,Le();try{await V.selectOllamaModel(M,{model:T,role:"embedding"});let Q=(ee?.hosts||[]).map(ge=>Number(ge.id)),J=[M,...Q.filter(ge=>ge!==M)];await V.reorderOllamaHosts(J),I(`\u5DF2\u5207\u63DB Embedding \u70BA ${ne}\u3002`,"ok",6e3),ee=null,await et({quiet:!0}),await qt({silent:!0})}catch(Q){I(Q.message||"\u7121\u6CD5\u5207\u63DB Embedding model\u3002","danger",7e3),await et({quiet:!0})}finally{Se=!1,Le()}},et=async({quiet:h=!1,button:c=null,payload:$=null}={})=>{if(!(l||F)){F=!0,ie=null,ee||(G(),Le()),c&&Me(c,!0,"\u6AA2\u67E5\u4E2D\u2026");try{let M=$||await V.ollamaHosts();if(l)return;ee=M}catch(M){if(l)return;ie=M,h||I(M.message||"\u7121\u6CD5\u6AA2\u67E5 llama-server \u4E3B\u6A5F\u3002","danger",6e3)}finally{l||(F=!1,c&&Me(c,!1),G(),Le())}}},ft=async h=>{if(Z)return;let c=(ee?.hosts||[]).map(C=>Number(C.id)),$=h.map(C=>Number(C));if(!$.length||$.length!==c.length||$.every((C,ne)=>C===c[ne])){G();return}Z=!0;let M=new Map((ee?.hosts||[]).map(C=>[Number(C.id),C])),T=$.map(C=>M.get(C)).filter(Boolean);if(ee&&T.length===c.length){ee={...ee,hosts:T,active_host_id:$[0]};let C=s.querySelector("[data-processing-ollama]");C&&(C.dataset.ollamaSignature=""),G()}try{await V.reorderOllamaHosts($),I("\u5DF2\u66F4\u65B0 llama-server \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","ok",3500)}catch(C){I(C.message||"\u7121\u6CD5\u66F4\u65B0 llama-server \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","danger",6e3),await et({quiet:!0})}finally{Z=!1}},se=()=>{let h=s.querySelector("[data-processing-ollama]");h&&(h.dataset.ollamaSignature=""),G()},$e=()=>{let h=ve;if(!h)return;if(s.querySelector(`[data-ollama-host][data-host-id="${h.hostId}"]`)?.classList.remove("is-dragging"),h.captureTarget?.hasPointerCapture?.(h.pointerId))try{h.captureTarget.releasePointerCapture(h.pointerId)}catch{}document.documentElement.classList.remove("processing-ollama-dragging"),window.removeEventListener("pointermove",ze),window.removeEventListener("pointerup",Ge),window.removeEventListener("pointercancel",at),ve=null,_e=0},ze=h=>{let c=ve;if(!c||h.pointerId!==c.pointerId)return;if(!c.dragging){if(Math.hypot(h.clientX-c.startX,h.clientY-c.startY)<5)return;c.dragging=!0,_e=c.hostId,z=!1,s.querySelector(`[data-ollama-host][data-host-id="${c.hostId}"]`)?.classList.add("is-dragging"),document.documentElement.classList.add("processing-ollama-dragging")}h.preventDefault();let $=64;h.clientY<$?window.scrollBy(0,-12):h.clientY>window.innerHeight-$&&window.scrollBy(0,12);let M=s.querySelector("[data-ollama-list]"),T=document.elementFromPoint(h.clientX,h.clientY)?.closest?.("[data-ollama-host]");if(!M||!T||!M.contains(T))return;let C=M.querySelector(`[data-ollama-host][data-host-id="${c.hostId}"]`);if(!C||C===T)return;let ne=T.getBoundingClientRect(),Q=h.clientY>ne.top+ne.height/2;M.insertBefore(C,Q?T.nextSibling:T),z=!0},Ge=h=>{let c=ve;if(!c||h.pointerId!==c.pointerId)return;let $=c.dragging,M=z,T=s.querySelector("[data-ollama-list]"),C=$&&T?[...T.querySelectorAll("[data-ollama-host]")].map(ne=>Number(ne.dataset.hostId)):[];$e(),$&&M&&C.length&&ft(C)},at=()=>{let h=!!ve?.dragging;$e(),h&&se()},Tt=h=>{if(h.button!==0||h.pointerType==="mouse"&&h.buttons!==1||Z||ve)return;let c=h.target.closest("[data-ollama-host]");if(!c||!s.contains(c)||h.target.closest("button")||h.pointerType==="touch"&&!h.target.closest(".processing-ollama-handle"))return;let $=Number(c.dataset.hostId)||0;if($){h.preventDefault(),_e=$,ve={hostId:$,pointerId:h.pointerId,startX:h.clientX,startY:h.clientY,dragging:!1,captureTarget:c};try{c.setPointerCapture(h.pointerId)}catch{}window.addEventListener("pointermove",ze,{passive:!1}),window.addEventListener("pointerup",Ge),window.addEventListener("pointercancel",at)}},A=async({quiet:h=!1,payload:c=null}={})=>{if(!w){w=!0,!v&&u==="judgment_download"&&B();try{v=c||await V.judgmentDownloadStatus(),_=null}catch($){_=$.message||"\u8B80\u53D6\u6708\u4EFD\u72C0\u614B\u5931\u6557\u3002",h||I(_,"danger",7e3)}finally{w=!1,u==="judgment_download"&&B()}}},N=async({quiet:h=!0,force:c=!1,payload:$=null}={})=>{if(!k&&!(!c&&S&&Date.now()-oe<3e4)){k=!0;try{S=$||await V.systemUsage(),D=null,oe=Date.now()}catch(M){D=M.message||"\u7121\u6CD5\u53D6\u5F97 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002",h||I(D,"danger",7e3)}finally{k=!1,u==="index_versions"&&ot()}}},R=async({quiet:h=!0,force:c=!1,payload:$=null}={})=>{if(!be&&!(!c&&O&&Date.now()-W<6e4)){be=!0;try{O=$||await V.checkCourts(),fe=null,W=Date.now()}catch(M){fe=M.message||"\u7121\u6CD5\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u3002",h||I(fe,"danger",7e3)}finally{be=!1,u==="normalize_courts"&&ot()}}},H=async({quiet:h=!0,force:c=!1,button:$=null,payload:M=null}={})=>{if(!q&&!(!c&&L&&Date.now()-X<6e4)){q=!0,$&&Me($,!0,"\u6AA2\u67E5\u4E2D\u2026");try{if(L=M||await V.checkLawVersions(),E=null,X=Date.now(),!h){let T=L.totals||{},C=Number(T.needs_backfill_versions)||0,ne=Number(T.backfillable_versions)||0,Q=Number(T.blocked_versions)||0;C>0?I(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u9700\u8981\u5EFA\u7ACB ${C} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF08\u53EF\u5EFA\u7ACB ${ne}\u3001\u7F3A\u539F\u59CB\u6A94 ${Q}\uFF09\u3002`,Q>0?"danger":"warn",7e3):I(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D ${Number(T.versions)||0} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`,"ok",5e3)}}catch(T){E=T.message||"\u7121\u6CD5\u6AA2\u67E5\u689D\u6587\u6B77\u53F2\u72C0\u614B\u3002",h||I(E,"danger",7e3)}finally{q=!1,$&&Me($,!1)}}},Y=h=>Array.from(s.querySelectorAll("[data-stage-key]")).find(c=>c.dataset.stageKey===h)||null,ae=h=>{if(!h)return;K.add(h);let c=Array.from(s.querySelectorAll(".processing-wf-stage[data-processing-stage]")).find($=>$.dataset.processingStage===h);c&&(c.open=!0,c.scrollIntoView({behavior:"smooth",block:"center"}))},ce=()=>{pe&&(pe="",o.hidden=!0,s.querySelectorAll("[data-stage-key]").forEach(h=>{h.classList.remove("is-stage-hovered")}))},Te=h=>{let c=h.dataset.stageKey||"";if(!c)return;pe=c,s.querySelectorAll("[data-stage-key]").forEach(Ke=>{Ke.classList.toggle("is-stage-hovered",Ke.dataset.stageKey===c)});let $=h.dataset.stageStatusKey||"idle",M=h.dataset.stageStatus||ps($).label,T=h.dataset.stageColor||"var(--accent)",C=Number(h.dataset.stageUpdate)||0,ne=Number(h.dataset.stagePending)||0,Q=h.dataset.stageContributionLabel||"\u6574\u9AD4\u5360\u6BD4";o.innerHTML=`<div class="processing-stage-tooltip-head">
      <span class="processing-stage-tooltip-swatch" style="background:${r(T)}"></span>
      <strong>${r(h.dataset.stageLabel||c)}</strong>
      ${jt($,M)}
    </div>
    <div class="processing-stage-tooltip-meta">
      <span>\u968E\u6BB5\u9032\u5EA6 <strong>${r(h.dataset.stagePercent||"\u2014")}</strong></span>
      <span>${r(Q)} <strong>${r(h.dataset.stageContribution||"\u2014")}</strong></span>
      <span class="mono">${r(h.dataset.stageDuration||"\u2014")}</span>
    </div>
    <div class="processing-stage-tooltip-counts">${r(h.dataset.stageCounts||"\u2014")}</div>
    ${C||ne?`<div class="processing-stage-tooltip-badges">
            ${C?`<span class="processing-wf-count is-update">${g("refresh",11)}<strong>${d(C)}</strong><span>\u53EF\u66F4\u65B0</span></span>`:""}
            ${ne?`<span class="processing-wf-count is-pending">${g("clock",11)}<strong>${d(ne)}</strong><span>\u5F85\u57F7\u884C</span></span>`:""}
          </div>`:""}
    ${h.dataset.stageMessage?`<div class="processing-stage-tooltip-message">${r(h.dataset.stageMessage)}</div>`:""}`,o.hidden=!1;let J=Math.min(300,Math.max(220,window.innerWidth-24));o.style.width=`${J}px`;let ge=h.getBoundingClientRect(),we=Math.min(window.innerWidth-J-12,Math.max(12,ge.left)),Ae=ge.top-o.offsetHeight-10,Ue=Ae>=12?Ae:Math.min(window.innerHeight-o.offsetHeight-12,ge.bottom+10);o.style.left=`${we}px`,o.style.top=`${Math.max(12,Ue)}px`},Pe=h=>{if(h.target.closest(".is-failure-tip")){ce();return}if(h.target.closest(".processing-wf-rail"))return;let c=h.target.closest("[data-stage-key]");!c||!s.contains(c)||c.contains(h.relatedTarget)||Te(c)},Ne=h=>{let c=h.target.closest("[data-stage-key]");if(!c||!s.contains(c)||c.contains(h.relatedTarget))return;let $=h.relatedTarget?.closest?.("[data-stage-key]");$&&$.dataset.stageKey===c.dataset.stageKey||ce()},Fe=h=>Array.isArray(h?.active_runs)&&h.active_runs.length||(h?.workflows||[]).some(c=>c.active_run)?!0:String(h?.update?.status||"")==="running",tt=()=>{s.querySelectorAll('[data-processing-action="stop"]').forEach(h=>Me(h,!0,"\u505C\u6B62\u4E2D\u2026")),n&&Me(n,!0,"\u505C\u6B62\u4E2D\u2026")},rt=()=>{s.querySelectorAll('[data-processing-action="stop"]').forEach(h=>Me(h,!1)),n&&Me(n,!1)},yt=h=>{let c=h.capabilities||{};i&&!Fe(h)&&(i=!1,rt()),!f&&n&&(n.hidden=!c.can_stop_update),i&&tt()},ot=()=>{if(!m)return;let h=Qa(m,u,U(),K);h!==y&&(ts(s,h),y=h),B(),G(),Le(),We(m)},Is=(h,{silent:c=!1}={})=>{if(l||!h)return;let $=Date.parse(h.generated_at||""),M=Date.parse(m?.generated_at||"");if(Number.isFinite($)&&Number.isFinite(M)&&$<M)return;if(Dt){let J=(h.workflows||[]).find(we=>we.id===Dt),ge=J?.active_run?.id||J?.last_run?.id||"";(J?.active_run||ge&&ge!==ys)&&(Dt="",ys="")}m=h,window.dispatchEvent(new CustomEvent("judgment:processing-pending",{detail:{count:Number(h.capabilities?.unprocessed_archives)||0,index_pending:Number(h.capabilities?.index_pending_months)||0}}));let T=new Map;for(let J of h.sections||[])for(let ge of J.stages||[])T.set(`${J.key}-${ge.key}`,ge);for(let[J,ge]of It){if(ge.kind!=="upgrade")continue;let we=T.get(J);if(we){if(we.phase==="failed"||we.phase==="running"&&we.percent!==null){It.delete(J);continue}if(we.phase==="completed"){let Ae=Date.parse(we.last_run?.started_at||"");Number.isFinite(Ae)&&Ae>=Number(ge.startedAt||0)-1e3&&It.delete(J)}}}let C=Ua(h,u);C!==b&&(ts(a,C),b=C);let ne=Qa(h,u,U(),K);if(ne!==y&&(ts(s,ne),y=ne),B(),G(),pe){let J=Y(pe);J?Te(J):ce()}let Q=s.querySelector("[data-processing-updated-at]");if(Q){let J=ye(h.generated_at);Q.textContent!==J&&(Q.textContent=J)}if(yt(h),Le(),We(h),!ee&&!F&&et({quiet:!0}),P.length){let J=P.splice(0);for(let ge of J)ca(ge)}},la=h=>{if(Oe=h,typeof requestAnimationFrame>"u"){let c=Oe;Oe=null,c&&Ds(c);return}Ee||(Ee=requestAnimationFrame(()=>{Ee=0;let c=Oe;Oe=null,c&&Ds(c)}))},ca=h=>{if(!h)return;if(!m){P.push(h),P.length>100&&P.shift();return}let c=String(h.run_id||""),$=Number(h.seq)||0;if(c&&c===ke&&$>0&&$<=xe)return;c&&c!==ke&&(ke=c,xe=0),$>0&&(xe=$);let M=String(h.workflow_id||"judgment_import"),T=String(h.month||"").replace(/\D/g,"").slice(0,6),C=(m.workflows||[]).find(Ae=>Ae.id===M);if(!C)return;C.progress||(C.progress={stages:[]}),Array.isArray(C.progress.stages)||(C.progress.stages=[]);let ne=String(h.stage||""),Q=ne?C.progress.stages.find(Ae=>String(Ae.key)===ne):null,J=String(C.progress.run_id||"")===String(h.run_id||"");if(Q&&h.type==="stage_progress"){let Ae=Number(h.current),Ue=Number(Q.current);J&&h.status==="running"&&Number.isFinite(Ae)&&Number.isFinite(Ue)&&Ae<Ue||(h.status&&(Q.status=String(h.status)),h.current!==void 0&&(Q.current=Number(h.current)||0),h.total!==void 0&&(Q.total=Number(h.total)||0),h.percent!==void 0&&(Q.percent=Number(h.percent)||0),h.message&&(Q.message=String(h.message)))}if(Q&&h.extra&&typeof h.extra=="object")for(let Ae of["financial_processed","financial_matched","financial_percent"])h.extra[Ae]!==void 0&&(Q[Ae]=Number(h.extra[Ae])||0);if(h.type==="stage_progress"&&h.overall_percent!==void 0){let Ae=Number(h.overall_percent)||0,Ue=Number(C.progress.overall_percent)||0;C.progress.overall_percent=J?Math.max(Ue,Ae):Ae}h.type!=="run_finished"&&(C.progress.run_status="running"),(h.type==="archive_started"||h.type==="stage_progress")&&!C.active_run&&h.run_id&&(C.active_run={id:h.run_id,status:"running",started_at:h.timestamp,message:h.message||""}),h.type==="run_finished"&&(C.active_run=null,C.progress.run_status=String(h.status||"success"),C.can_run=!0);let ge=[];T&&h.month_stages&&ge.push({month:T,import_stages:h.month_stages,import_overall:h.month_overall||""});let we=null;if(h.type==="archive_started"&&T){let Ae=Date.parse(h.timestamp||"");we={active_month:T,active_archive:h.archive,active_phase:h.stage||"filter",processing_month:T,processing_archive:h.archive,run_id:h.run_id,run_status:"running",state_mtime_ns:Number.isFinite(Ae)?Ae*1e6:Date.now()*1e6}}else h.type==="run_finished"&&(we={...m.active_import||{},run_status:String(h.status||"success")});la({live:!0,generated_at:h.timestamp,workflows:[{id:M,active_run:C.active_run,last_run:C.last_run,progress:C.progress,can_run:C.can_run}],import_timeline_months:ge,active_import:we})},Ds=h=>{if(l||!h||!m)return;let c=new Map((h.workflows||[]).map(Q=>[Q.id,Q]));if(Dt){let Q=c.get(Dt),J=Q?.active_run?.id||Q?.last_run?.id||"";(Q?.active_run||J&&J!==ys)&&(Dt="",ys="")}for(let Q of m.workflows||[]){let J=c.get(Q.id);if(J){if("active_run"in J&&(Q.active_run=J.active_run),"last_run"in J&&(Q.last_run=J.last_run),Array.isArray(J.recent_runs)&&(Q.recent_runs=J.recent_runs),"index_runtime"in J){let ge=J.index_runtime;ge&&!ge.active_coverage&&Q.index_runtime?.active_coverage&&(ge.active_coverage=Q.index_runtime.active_coverage),ge&&!ge.active_archive_coverage&&Q.index_runtime?.active_archive_coverage&&(ge.active_archive_coverage=Q.index_runtime.active_archive_coverage),Q.index_runtime=ge}if(J.progress){let ge=J.progress,we=Q.progress;if(Q.id==="judgment_import"&&we?.run_id&&we.run_id===ge.run_id){let Ae=new Map((we.stages||[]).map(Ue=>[String(Ue.key),Ue]));for(let Ue of ge.stages||[]){let Ke=Ae.get(String(Ue.key));Ke&&Ue.status==="running"&&Number(Ue.current)<Number(Ke.current)&&(Ue.current=Ke.current,Ue.total=Ke.total,Ue.percent=Ke.percent,Ue.message=Ke.message)}ge.overall_percent=Math.max(Number(we.overall_percent)||0,Number(ge.overall_percent)||0)}Q.progress=ge}typeof J.can_run=="boolean"&&(Q.can_run=J.can_run)}}let $=Q=>{if(!Q||!Array.isArray(h.import_timeline_months))return;let J=new Map((Q.months||[]).map(we=>[String(we.month),we]));for(let we of h.import_timeline_months){let Ae=J.get(String(we.month));Ae&&(Ae.import_stages={...Ae.import_stages||{},...we.import_stages||{}},we.import_stage_progress&&(Ae.import_stage_progress={...Ae.import_stage_progress||{},...we.import_stage_progress||{}}),we.import_overall&&(Ae.import_overall=we.import_overall))}let ge={complete:0,incomplete:0,processing:0,empty:0};for(let we of Q.months||[]){let Ae=String(we.import_overall||"empty");ge[Ae]=Number(ge[Ae]||0)+1}Q.stage_summary=ge};(Q=>{let J=(Q.workflows||[]).find(je=>je.id==="index_versions"),ge=J?.index_runtime;if(!ge||!Array.isArray(ge.months))return;let we=(Q.file_timelines||[]).find(je=>je.key==="judgment");if(!we||!Array.isArray(we.months))return;let Ae=(J.progress?.stages||[]).find(je=>je.key==="validate"),Ue=["success","no_change"].includes(String(ge.run_status||""))||String(ge.run_status||"")!=="running"&&/alias\s*已切換/.test(String(Ae?.message||"")),Ke=String(ge.current?.month||""),Gt=new Map(we.months.map(je=>[String(je.month),je]));for(let je of ge.months){let Ve=Gt.get(String(je.month||""));if(!Ve)continue;let He=Ve.stages||(Ve.stages={}),St=String(je.status||"");St==="running"||String(je.month)===Ke?(He.qdrant="processing",Ve.overall="processing"):St==="success"&&He.qdrant!=="complete"&&(He.qdrant=Ue?"complete":"incomplete",Ve.overall=Ue?"complete":"incomplete")}let Nt={complete:0,incomplete:0,processing:0,empty:0,update:0};for(let je of we.months){let Ve=String(je.overall||"empty");Nt[Ve]=Number(Nt[Ve]||0)+1,je.has_update&&(Nt.update+=1)}we.summary=Nt})(m),$(m.import_timeline);for(let Q of m.workflows||[])Q.id==="judgment_import"&&$(Q.import_timeline);h.active_import&&(m.active_import=h.active_import),h.mode&&(m.mode=h.mode),h.generated_at&&(m.generated_at=h.generated_at);let T=Ua(m,u);T!==b&&(ts(a,T),b=T);let C=Qa(m,u,U(),K);C!==y&&(ts(s,C),y=C),B(),G(),Le(),We(m),yt(m);let ne=s.querySelector("[data-processing-updated-at]");if(ne&&h.generated_at){let Q=ye(h.generated_at);ne.textContent!==Q&&(ne.textContent=Q)}},qt=async({silent:h=!1}={})=>{if(!(l||p)){p=!0;try{let c=await V.processing();Is(c,{silent:h})}catch(c){if(l)return;let $=pu(c.message,m);$!==y&&(ts(s,$),y=$),h||I(c.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{p=!1}}},Bs=async(h,c="")=>{if(f)return;f=!0,Me(h,!0,"\u6AA2\u67E5\u4E2D\u2026");let $=vo[c]||"",M=String(h.dataset.sourceTypes||"").split(",").map(ne=>ne.trim()).filter(Boolean),T=M.length?M:$?[$]:[],C=h.dataset.stageId||"";C&&(It.set(C,{kind:"check",phase:"updating",startedAt:Date.now()}),ot());try{let ne=await V.checkUpdates(T);if(ne&&ne.checking)C&&(It.delete(C),ot()),I("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u8ACB\u7A0D\u5F8C\u91CD\u65B0\u6574\u7406\u3002","info",6e3);else if(T.length===1){let Q=(ne.sources||{})[T[0]]||{},J=$o[c]||(T[0]==="judgment"?"\u5224\u6C7A":T[0]==="law"?"\u6CD5\u898F":T[0]==="order"?"\u547D\u4EE4":"\u8CC7\u6599");Q.status==="error"?I(`${J}\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF1A${Q.message||"\u7121\u6CD5\u53D6\u5F97\u7DDA\u4E0A\u7248\u672C"}`,"danger",7e3):I(Q.update_available?`${J}\u7DDA\u4E0A\u5DF2\u6709\u66F4\u65B0\u7248\u672C\u3002`:`${J}\u7DDA\u4E0A\u5DF2\u662F\u6700\u65B0\u7248\u672C\u3002`,Q.update_available?"warn":"ok",6e3)}else if(T.length>1){let Q=ne.sources||{},J=T.filter(we=>Q[we]?.update_available),ge=T.filter(we=>Q[we]?.status==="error");ge.length?I(`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF0C\u4F46\u6709 ${ge.length} \u9805\u6AA2\u67E5\u5931\u6557\u3002`,"danger",7e3):I(J.length?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${J.length} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",J.length?"warn":"ok",6e3)}else{let Q=Number(ne.update_count)||0;I(Q>0?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${Q} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",Q>0?"warn":"ok",6e3)}C&&(It.set(C,{kind:"check",phase:"updated",startedAt:Date.now()}),ot()),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await qt({silent:!0})}catch(ne){C&&(It.delete(C),ot()),I(ne.message||"\u66F4\u65B0\u6AA2\u67E5\u5931\u6557\u3002","danger",7e3)}finally{f=!1,Me(h,!1),m&&yt(m)}},tn=async h=>{let c=vo[h]||"";if(!c)return!0;let $=null;try{$=await V.checkUpdates([c])}catch(T){return I(`\u7121\u6CD5\u5B8C\u6210\u7248\u672C\u6AA2\u67E5\uFF08${T.message||"\u7DB2\u8DEF\u932F\u8AA4"}\uFF09\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002`,"warn",7e3),!0}if(!$||$.checking)return $&&$.checking&&I("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","info",6e3),!0;let M=($.sources||{})[c];if(!M)return!0;if(window.dispatchEvent(new CustomEvent("judgment:updates-changed")),M.status==="up_to_date"&&!M.update_available){let T=$o[h]||"\u8CC7\u6599",C=M.checked_at?`\uFF08${ye(M.checked_at)} \u6AA2\u67E5\uFF09`:"",ne=Wd[h]||"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u55CE\uFF1F";return window.confirm(`${T}\u7DDA\u4E0A\u6AA2\u67E5\u70BA\u6700\u65B0\u7248\u672C${C}\u3002

${ne}`)}return M.status==="error"&&I("\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","warn",6e3),!0},da=async(h,c)=>{if(f)return;f=!0;let $=(m?.workflows||[]).find(C=>C.id===c);ys=$?.active_run?.id||$?.last_run?.id||"",Dt=c,Me(h,!0,"\u57F7\u884C\u4E2D"),ot();let M=h.dataset.stageId||"",T=!1;try{if(!await tn(c))return;M&&(It.set(M,{kind:"upgrade",phase:"upgrading",startedAt:Date.now()}),ot());let ne;try{ne=await V.startProcessingWorkflow(c)}catch(Q){throw M&&(It.delete(M),ot()),Q}T=!0,I(`\u5DF2\u555F\u52D5\u300C${$?.label||c}\u300D\u6D41\u7A0B\u3002`,"ok",6e3),ne&&ne.run_id&&console.info("processing workflow started",ne),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),qt({silent:!0}),window.setTimeout(()=>{Dt===c&&(Dt="",ys="",qt({silent:!0}))},15e3)}catch(C){I(C.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{f=!1,(!T||Dt!==c)&&(Dt="",ys="",m?(yt(m),y="",ot()):Me(h,!1))}},Fs=async h=>{if(!(f||i)){f=!0,i=!0,Me(h,!0,"\u505C\u6B62\u4E2D\u2026");try{let c=await V.stopProcessingUpdate();for(let[$,M]of It)M.kind==="upgrade"&&It.delete($);ot(),qt({silent:!0}),I(c.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3)}catch(c){i=!1,Me(h,!1),I(c.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{f=!1,i?tt():m&&yt(m)}}},ks=h=>{let c=h.target.closest("[data-processing-action]");if(!c||c.disabled)return;c.closest(".processing-wf-rail")&&(h.preventDefault(),h.stopPropagation());let $=c.dataset.processingAction;if($==="refresh")qt({silent:!1});else if($==="open-stage")ae(c.dataset.stageId||"");else if($==="refresh-judgment-months")A({quiet:!1});else if($==="refresh-index-storage")N({quiet:!1,force:!0});else if($==="refresh-court-check")R({quiet:!1,force:!0});else if($==="refresh-law-version-check")H({quiet:!1,force:!0,button:c});else if($==="refresh-ollama")et({quiet:!1,button:c});else if($==="refresh-embedding-models")et({quiet:!1,button:c});else if($==="select-embedding-model"){let M=c.dataset.hostId||"",T=c.dataset.model||"";Xe(`${M}|${T}`)}else if($==="move-ollama-host"){let M=ee?.hosts||[],T=M.findIndex(J=>Number(J.id)===Number(c.dataset.hostId)),C=c.dataset.direction,ne=C==="up"?T-1:C==="down"?T+1:-1;if(T<0||ne<0||ne>=M.length)return;let Q=M.map(J=>Number(J.id));[Q[T],Q[ne]]=[Q[ne],Q[T]],ft(Q)}else if($==="check-updates")Bs(c,c.dataset.workflowId||"");else if($==="run-workflow"){let M=c.dataset.workflowId||"";da(c,M)}else $==="stop"&&Fs(c)},ua=(h,{scroll:c=!1}={})=>{if(u=h||"overview",m){let $=Ua(m,u);ts(a,$),b=$;let M=Qa(m,u,U(),K);if(ts(s,M),y=M,B(),G(),Le(),We(m),pe){let T=Y(pe);T?Te(T):ce()}c&&s.scrollIntoView({behavior:"smooth",block:"start"})}rr.has(u)&&et({quiet:!0}),u==="judgment_download"&&A({quiet:!0}),u==="index_versions"&&N({quiet:!0}),u==="normalize_courts"&&R({quiet:!0}),u==="backfill_law_articles"&&H({quiet:!0})},Os=h=>{let c=h.target.closest("[data-processing-workflow]");c&&ua(c.dataset.processingWorkflow||"overview")},Ss=h=>{let c=h.target.closest("[data-timeline-workflow]");c&&(h.preventDefault(),ua(c.dataset.timelineWorkflow||"",{scroll:!0}))},ms=h=>{let c=h.target.closest?.(".index-wf-stage[data-index-stage]");if(c&&s.contains(c)){let C=c.dataset.indexStage||"";C&&(c.open?ir.add(C):ir.delete(C));return}let $=h.target.closest?.(".workflow-wf-stage[data-workflow-wf-stage]");if($&&s.contains($)){let C=$.dataset.workflowWfStage||"";C&&($.open?or.add(C):or.delete(C));return}let M=h.target.closest?.(".processing-wf-stage[data-processing-stage]");if(!M||!s.contains(M))return;let T=M.dataset.processingStage||"";T&&(M.open?K.add(T):K.delete(T))};return t.addEventListener("click",ks),a.addEventListener("click",Os),s.addEventListener("click",Ss),s.addEventListener("pointerover",Pe),s.addEventListener("pointerout",Ne),s.addEventListener("pointerdown",Tt),s.addEventListener("toggle",ms,!0),window.addEventListener("scroll",ce,{capture:!0,passive:!0}),nt(),typeof EventSource>"u"&&await qt({silent:!1}),()=>{l=!0,gt(),t.removeEventListener("click",ks),a.removeEventListener("click",Os),s.removeEventListener("click",Ss),$e(),s.removeEventListener("pointerover",Pe),s.removeEventListener("pointerout",Ne),s.removeEventListener("pointerdown",Tt),s.removeEventListener("toggle",ms,!0),window.removeEventListener("scroll",ce,{capture:!0})}}var $r={};rs($r,{render:()=>Sp});var fr={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u522A\u9664\uFF0F\u9000\u5F79",badge:"badge-neutral"}},Kt={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},Cs={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},Io={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function ia(e){let t=fr[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${r(t.label)}</span>`}function br(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function Uu(e){return br(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",source_type:a||""}})}function Qu(e){return br(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",article_no:a||""}})}function Ju(e){return br(e).map(t=>({jid:t.trim()}))}function Vu(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function Wu(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function Ku(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function Yu(e){return(e?.tags||[]).join(", ")}function ra(e){return`<div class="qb-empty">${g("info",18)}<span>${r(e)}</span></div>`}function hr(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),n=[...t.map(i=>`<span class="chip">${r(i)}</span>`),...s.map(i=>`<span class="chip">${r(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${r(i)}</span>`)];return n.length?`<div class="chips qb-labels">${n.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function vr(){return`<details class="qb-import">
    <summary>${g("upload",14)}JSON \u6279\u6B21\u532F\u5165</summary>
    <p class="qb-muted">\u683C\u5F0F\uFF1A<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>\u3002\u76F8\u540C\u984C\u76EE fingerprint \u9810\u8A2D\u66F4\u65B0\u3002</p>
    <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
    <div class="qb-actions">
      <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${g("upload",13)}<span>\u532F\u5165 JSON</span></button>
    </div>
  </details>`}function Xu(e){let t=e?.item||{},s=Array.isArray(e?.warnings)?e.warnings:[],a=Array.isArray(t.tags)?t.tags:[];return`<section class="report-card qb-card qb-ai-result">
    <div class="side-card-head">
      <span class="side-card-title">${g("sparkles",14)}llama-server \u5DF2\u5EFA\u7ACB\u984C\u76EE #${t.id}</span>
      ${ia(t.status)}
    </div>
    <div class="qb-ai-answer">
      <strong>${r(t.question||"")}</strong>
      <div class="qb-ai-meta">
        ${r(Kt[t.question_type]||t.question_type||"")}
        \xB7 ${r(Cs[t.difficulty]||t.difficulty||"")}
        \xB7 ${r(e?.model||"\u672C\u6A5F llama-server")}
      </div>
      ${hr(t)}
      ${t.reference_answer?`<div class="qb-reference"><span class="summary-label">llama-server \u53C3\u8003\u7B54\u6848</span><p>${r(t.reference_answer)}</p></div>`:""}
      ${a.length?`<div class="chips">${a.map(n=>`<span class="chip">${r(n)}</span>`).join("")}</div>`:""}
      ${s.length?`<div class="qb-ai-warnings"><strong>\u9700\u8981\u6CE8\u610F</strong><ul>${s.map(n=>`<li>${r(n)}</li>`).join("")}</ul></div>`:""}
      <div class="qb-actions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="review-ai-item">${g("shield",13)}<span>\u524D\u5F80\u9A57\u6536</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="reset-ai">${g("plus",13)}<span>\u518D\u65B0\u589E\u4E00\u984C</span></button>
      </div>
    </div>
    ${vr()}
  </section>`}function Zu(e){return e.aiResult?Xu(e.aiResult):`<section class="report-card qb-card">
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
    ${vr()}
  </section>`}function ep(e){return`<section class="report-card qb-card">
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
          <select class="select" name="question_type">${Object.entries(Kt).map(([t,s])=>`<option value="${t}" ${e?.question_type===t?"selected":""}>${s}</option>`).join("")}</select>
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
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${r(Vu(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${r(Wu(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${r(Ku(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${r(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${r(Yu(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
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
    ${vr()}
  </section>`}function tp(e,t){return e?ep(e):Zu(t)}function sp(e){let t=e.status==="retired"||!!e.deleted_at;return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${r(e.question)}</strong>
        <span class="qb-meta">
          ${r(Kt[e.question_type]||e.question_type)}
          \xB7 ${r(Cs[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${ia(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${hr(e)}
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
    </div>
  </article>`}function ap(e){return`<section class="report-card qb-card">
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
        ${Object.entries(fr).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(Kt).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
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
      ${e.items.length?e.items.map(t=>sp(t)).join(""):ra("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${d(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}var Bo=[["queue","\u5F85\u5BE9\uFF0F\u9000\u56DE"],["accepted","\u5DF2\u6838\u51C6"],["rejected","\u5DF2\u62D2\u7D55"],["draft","\u8349\u7A3F"]];function np(e){let t=e.stats||{};return{queue:Number(t.pending_review||0)+Number(t.changes_requested||0),accepted:Number(t.accepted||0),rejected:Number(t.rejected||0),draft:Number(t.draft||0)}}function rp(e,t){let s=e.reviewFilter||"queue",a={queue:{title:"\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u6216\u9000\u56DE\u4FEE\u6539\u7684\u984C\u76EE\u3002",text:t.accepted?`\u5DF2\u6709 ${d(t.accepted)} \u984C\u6838\u51C6\u3002\u65B0\u984C\u76EE\u5EFA\u7ACB\u5F8C\u6703\u81EA\u52D5\u9001\u5BE9\uFF0C\u4E5F\u53EF\u4EE5\u5207\u63DB\u5230\u300C\u5DF2\u6838\u51C6\u300D\u91CD\u65B0\u9A57\u6536\u65E2\u6709\u984C\u76EE\u3002`:"\u5EFA\u7ACB\u984C\u76EE\u5F8C\u6703\u9810\u8A2D\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\uFF1B\u82E5\u53EA\u60F3\u5148\u4FDD\u5B58\uFF0C\u5EFA\u7ACB\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5373\u53EF\u5B58\u6210\u8349\u7A3F\u3002"},accepted:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u6838\u51C6\u984C\u76EE\u3002",text:"\u984C\u76EE\u901A\u904E\u4EBA\u5DE5\u9A57\u6536\u5F8C\u6703\u5217\u5728\u9019\u88E1\uFF1B\u4E5F\u53EF\u4EE5\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u9001\u51FA\u9A57\u6536\u3002"},rejected:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u62D2\u7D55\u984C\u76EE\u3002",text:"\u88AB\u62D2\u7D55\u7684\u984C\u76EE\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u4E2D\uFF0C\u53EF\u4FEE\u6539\u5F8C\u91CD\u65B0\u9001\u5BE9\u3002"},draft:{title:"\u76EE\u524D\u6C92\u6709\u8349\u7A3F\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u984C\u76EE\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5C31\u6703\u5B58\u6210\u8349\u7A3F\uFF0C\u4E4B\u5F8C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002"}}[s]||{title:"\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u65B0\u984C\u76EE\u5F8C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"},n=[s!=="draft"?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="new">${g("plus",13)}<span>\u65B0\u589E\u984C\u76EE</span></button>`:"",s==="queue"&&t.accepted?`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="review-filter" data-filter="accepted">${g("shield",13)}<span>\u67E5\u770B\u5DF2\u6838\u51C6 ${d(t.accepted)}</span></button>`:"",`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="go-manage">${g("database",13)}<span>\u524D\u5F80\u984C\u5EAB\u7BA1\u7406</span></button>`].filter(Boolean).join("");return`<div class="qb-empty qb-empty-block">
    <span class="qb-empty-icon">${g("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>${r(a.title)}</strong>
      <p>${r(a.text)}</p>
      <div class="qb-actions">${n}</div>
    </div>
  </div>`}function ip(e){let t=Bo.find(([s])=>s===e);return t?t[1]:"\u5F85\u5BE9\uFF0F\u9000\u56DE"}function op(e,t){return`<button class="qb-review-item${t?" is-active":""}" type="button" data-qb-action="select-review-item" data-id="${e.id}" aria-pressed="${t?"true":"false"}">
    <span class="qb-review-item-top">
      <span class="qb-id">#${e.id}</span>
      <span class="qb-review-item-meta">
        ${r(Kt[e.question_type]||e.question_type)}
        \xB7 ${r(Cs[e.difficulty]||e.difficulty)}
        \xB7 v${e.version}
        ${e.benchmark_ready?" \xB7 Benchmark ready":""}
        ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
      </span>
      ${ia(e.status)}
    </span>
    <strong>${r(e.question)}</strong>
  </button>`}function lp(e){return`<article class="qb-review-pane-card">
    <div class="qb-review-pane-head">
      <div class="qb-review-pane-title">
        <span class="qb-review-item-meta">#${e.id} \xB7 v${e.version} \xB7 ${r(Kt[e.question_type]||e.question_type)} \xB7 ${r(Cs[e.difficulty]||e.difficulty)}</span>
        <strong>${r(e.question)}</strong>
      </div>
      <div class="qb-review-pane-side">
        ${ia(e.status)}
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${g("edit",13)}<span>\u7DE8\u8F2F</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${g("trash",13)}<span>\u522A\u9664</span></button>
        </div>
      </div>
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${hr(e)}
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
    ${e.reviews?.length?`<div class="qb-review-history"><span class="summary-label">\u5BE9\u6838\u7D00\u9304</span>${e.reviews.map(t=>`<div class="qb-review-row"><span>${r(t.reviewer||"\u533F\u540D")}</span>${ia(t.decision==="approved"?"accepted":t.decision)}<span>${r(ye(t.created_at))}</span><p>${r(t.comment||"\u2014")}</p></div>`).join("")}</div>`:""}
  </article>`}function cp(){return`<div class="qb-empty qb-empty-block qb-review-placeholder">
    <span class="qb-empty-icon">${g("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>\u5F9E\u5DE6\u5074\u9078\u64C7\u984C\u76EE</strong>
      <p>\u9EDE\u9078\u984C\u76EE\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u984C\u5E79\u3001\u9810\u671F\u6A19\u8A3B\u3001\u53C3\u8003\u7B54\u6848\u8207\u6838\u51C6\u9078\u9805\u3002</p>
    </div>
  </div>`}function dp(e){let t=e.reviewDetail,s=np(e),a=e.reviewFilter||"queue",n=Bo.map(([l,p])=>`<button class="chip qb-review-tab${a===l?" is-active":""}" type="button" role="tab" aria-selected="${a===l?"true":"false"}" data-qb-action="review-filter" data-filter="${l}"><span>${p}</span><span class="qb-review-tab-count">${d(s[l]||0)}</span></button>`).join(""),i=e.reviewItems.length?e.reviewItems.map(l=>op(l,Number(t?.id)===Number(l.id))).join(""):`<div class="qb-empty qb-empty-compact">${g("info",16)}<span>\u76EE\u524D\u6C92\u6709${r(ip(a))}\u984C\u76EE\u3002</span></div>`,o=t?lp(t):e.reviewItems.length?cp():rp(e,s);return`<section class="report-card qb-card qb-review-card">
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
  </section>`}function na(e){if(e==null||e==="")return"";let t=Number(e);return Number.isFinite(t)?`${Math.round(t*100)}%`:""}function up(e){if(!e||typeof e!="object")return"\u5F15\u7528";let t=String(e.jid||"").trim();if(t)return t;let s=String(e.law_name||"").trim(),a=String(e.article_no||"").trim(),n=`${s} ${a}`.trim();return n||String(e.title||e.text||"\u5F15\u7528").slice(0,80)}function pp(e){let t=e?.metrics||{},s=t.scores||{},a=[["\u6CD5\u898F\u53EC\u56DE",na(t.law_recall)],["\u689D\u6587\u53EC\u56DE",na(t.article_recall)],["\u898F\u5247\u5206",na(s.deterministic)],["Judge",na(s.judge)],["\u4EBA\u5DE5",na(s.human)]].filter(([,n])=>n);return a.length?`<div class="qb-bank-stats">${a.map(([n,i])=>`<span class="qb-bank-stat"><span>${r(n)}</span><strong>${r(i)}</strong></span>`).join("")}</div>`:""}function mp(e){let t=Array.isArray(e?.law_sources)?e.law_sources:[],s=Array.isArray(e?.citations)?e.citations:[],a=t.length?`<div class="qb-bank-sources">${t.map(i=>{let o=String(i.law_name||"\u672A\u547D\u540D\u6CD5\u898F"),l=(i.articles||[]).map(f=>String(f.article_no||"").trim()).filter(Boolean),p=`<strong>${r(o)}</strong>${l.length?`<small>${r(l.join("\u3001"))}</small>`:""}`;return i.law_url?`<a class="qb-bank-law" href="${r(i.law_url)}" target="_blank" rel="noreferrer">${p}</a>`:`<span class="qb-bank-law">${p}</span>`}).join("")}</div>`:"",n=s.length?`<div class="qb-bank-sources qb-bank-citations">${s.map(i=>`<span class="chip chip-mono">${r(up(i))}</span>`).join("")}</div>`:"";return!a&&!n?"":`<div class="qb-bank-answer-block">
    <div class="qb-bank-section-label"><span>\u5F15\u7528\u4F86\u6E90</span><span>${d(t.length+s.length)} \u7B46</span></div>
    ${a}${n}
  </div>`}function Fo(e,t){if(!e)return`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${g("history",20)}</span>
      <strong>\u5C1A\u7121 RAG \u7B54\u6848</strong>
      <span>\u8DD1\u4E00\u6B21 Benchmark \u5F8C\uFF0C\u6700\u8FD1\u4E00\u6B21\u6210\u529F\u56DE\u7B54\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</span>
    </div>`;let s=Number(e.item_version||0),a=Number(t?.version||0),n=s&&a&&s!==a?`<span class="badge badge-warn">\u7B54\u6848 v${s} \xB7 \u984C\u76EE v${a}</span>`:"",i=e.answer_source==="llm"?"LLM \u751F\u6210":e.answer_source==="structured"?"\u6CD5\u898F\u8CC7\u6599\u5EAB":String(e.answer_source||"RAG");return`<div class="qb-bank-answer-meta">
      <span class="badge badge-ok"><span class="status-dot is-ok"></span>RAG \u5B8C\u6210</span>
      <span class="badge badge-neutral">${r(i)}</span>
      ${n}
      <span class="mono">${r(e.run_label||e.run_id||"")}</span>
      <span>${r(ye(e.finished_at))}</span>
      <span>${r(ue(e.duration_ms))}</span>
      ${e.llm_model?`<span class="mono">${r(e.llm_model)}</span>`:""}
    </div>
    <div class="qb-bank-answer-block">
      <div class="qb-bank-section-label"><span>\u56DE\u7B54</span><span>${d(String(e.answer||"").length)} \u5B57</span></div>
      <p class="qb-bank-answer-text">${r(String(e.answer||"").trim()||"\uFF08\u7A7A\u767D\u56DE\u7B54\uFF09")}</p>
    </div>
    ${mp(e)}
    ${pp(e)}`}function Oo(e,t){let s=e.selectedSuiteId,a=t&&e.suiteAnswers?.[String(s)]?.[String(t.id)]||null;return t?`<div class="qb-bank-answer-head">
      <div class="qb-bank-answer-heading">
        <span class="qb-bank-answer-kicker">${g("sparkles",12)}RAG \u6700\u8FD1\u4E00\u6B21\u7B54\u6848</span>
        <strong class="qb-bank-answer-question">#${t.id} ${r(t.question)}</strong>
      </div>
      ${a?`<span class="qb-bank-answer-state">${r(Kt[t.question_type]||t.question_type)} \xB7 v${t.version}</span>`:""}
    </div>
    ${Fo(a,t)}`:`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${g("cube",20)}</span>
      <strong>\u9078\u64C7\u984C\u76EE</strong>
      <span>\u5F9E\u5DE6\u5074\u6E05\u55AE\u9078\u64C7\u4E00\u984C\uFF0C\u67E5\u770B\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`}function Ho(e){return`<span class="qb-bank-actions">
    <button class="qb-bank-icon" type="button" data-qb-action="edit" data-id="${e.id}" title="\u7DE8\u8F2F\u984C\u76EE" aria-label="\u7DE8\u8F2F\u984C\u76EE #${e.id}">${g("edit",13)}</button>
    <button class="qb-bank-icon is-danger" type="button" data-qb-action="delete" data-id="${e.id}" title="\u5F9E\u984C\u5EAB\u79FB\u9664" aria-label="\u5F9E\u984C\u5EAB\u79FB\u9664 #${e.id}">${g("trash",13)}</button>
  </span>`}function gp(e,t,{selected:s,hasAnswer:a}){return`<div class="qb-bank-row${s?" is-active":""}" data-id="${e.id}">
    <button class="qb-bank-select" type="button" data-qb-action="select-bank-item" data-id="${e.id}" aria-pressed="${s?"true":"false"}">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <span class="qb-bank-item-copy">
        <strong>${r(e.question)}</strong>
        <small>${r(Kt[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${a?"\u5DF2\u6709 RAG \u7B54\u6848":"\u5C1A\u7121 RAG \u7B54\u6848"}</small>
      </span>
    </button>
    ${Ho(e)}
  </div>`}function fp(e,t,s){return`<article class="qb-bank-full-item" data-id="${e.id}">
    <div class="qb-bank-full-head">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <div class="qb-bank-full-title">
        <strong>${r(e.question)}</strong>
        <small>${r(Kt[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${r(fr[e.status]?.label||e.status||"")}</small>
      </div>
      ${Ho(e)}
    </div>
    ${Fo(s,e)}
  </article>`}function Do(e){let t=e.editingSuite,s=Array.isArray(e.suites)?e.suites:[],a=s.find(u=>Number(u.id)===Number(e.selectedSuiteId))||s[0]||null,n=Array.isArray(a?.items)?a.items:[],i=e.suiteAnswers?.[String(a?.id)]||{},o=n.find(u=>Number(u.id)===Number(e.selectedBankItemId))||null,l=!!e.suiteAnswersLoading,p=String(e.suiteAnswersError||""),f=!!e.suiteManageOpen||!s.length,m=e.bankTab==="full"?"full":"split",y=s.length?`<div class="qb-bank-tabs" role="tablist" aria-label="Benchmark \u984C\u5EAB\u6AA2\u8996">
        <button class="qb-bank-tab${m==="split"?" is-active":""}" type="button" role="tab" aria-selected="${m==="split"?"true":"false"}" data-qb-action="bank-tab" data-tab="split">${g("grid",13)}<span>Benchmark \u984C\u5EAB</span><span class="badge badge-neutral">${d(n.length)}</span></button>
        <button class="qb-bank-tab${m==="full"?" is-active":""}" type="button" role="tab" aria-selected="${m==="full"?"true":"false"}" data-qb-action="bank-tab" data-tab="full">${g("table",13)}<span>\u984C\u5EAB\u5168\u5217\u8868</span><span class="badge badge-neutral">${d(n.length)}</span></button>
      </div>`:"",b="";if(!s.length)b=`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${g("cube",20)}</span>
      <strong>\u5C1A\u672A\u5EFA\u7ACB Benchmark \u984C\u5EAB</strong>
      <span>\u5C55\u958B\u4E0B\u65B9 Suite \u8A2D\u5B9A\u4E26\u5EFA\u7ACB\u984C\u5EAB\u5F8C\uFF0C\u5C31\u80FD\u5728\u9019\u88E1\u700F\u89BD\u984C\u76EE\u8207\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`;else if(l)b='<div class="qb-bank-loading"><span class="spinner" aria-hidden="true"></span><span>\u8B80\u53D6\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u4E2D\u2026</span></div>';else{let u=p?Ce({tone:"warn",title:"\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u8B80\u53D6\u5931\u6557",text:r(p)}):"";m==="full"?b=`${u}<div class="qb-bank-full" data-qb-bank-view="full">${n.length?n.map((v,w)=>fp(v,w,i[String(v.id)]||null)).join(""):ra("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>`:b=`${u}<div class="qb-bank-split" data-qb-bank-view="split">
        <div class="qb-bank-list" data-qb-bank-list>${n.length?n.map((v,w)=>gp(v,w,{selected:Number(v.id)===Number(o?.id),hasAnswer:!!i[String(v.id)]})).join(""):ra("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>
        <div class="qb-bank-answer-pane" data-qb-bank-answer>${Oo(e,o)}</div>
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
    ${y}
    ${b}
    <details class="qb-suite-manage" ${f?"open":""}>
      <summary>${g("sliders",14)}Suite \u8A2D\u5B9A\u8207\u7248\u672C <span class="qb-muted">${d(s.length)} \u500B suite \xB7 ${d(e.ready.length)} \u984C benchmark-ready</span></summary>
      <div class="qb-suite-manage-body">
        <form class="qb-suite-form" data-qb-form="suite">
          <input type="hidden" name="suite_id" value="${t?.id||""}" />
          <div class="qb-form-grid">
            <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${r(t?.name||"Pilot 30")}" /></label>
            <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(Io).map(([u,v])=>`<option value="${u}" ${t?.tier===u?"selected":""}>${v}</option>`).join("")}</select></label>
          </div>
          <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${r(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
          <div class="qb-check-list">
            ${e.ready.length?e.ready.map(u=>{let v=t?t.items?.some(w=>Number(w.id)===Number(u.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${u.id}" ${v?"checked":""}/><span><strong>#${u.id}</strong> ${r(u.question)} <small>${r(Kt[u.question_type]||u.question_type)}</small></span></label>`}).join(""):ra("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
          </div>
          <div class="qb-actions">
            <button class="btn btn-primary" type="submit">${g("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
            ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
          </div>
        </form>
        <div class="qb-list">
          ${s.length?s.map(u=>`<article class="qb-suite">
            <div class="qb-item-head">
              <div class="qb-item-title"><strong>${r(u.name)}</strong><span class="qb-meta">${r(Io[u.tier]||u.tier)} \xB7 v${u.version} \xB7 ${d(u.item_count)} \u984C</span></div>
              <span class="badge ${u.status==="frozen"?"badge-ok":"badge-neutral"}">${u.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
            </div>
            <div class="qb-suite-items">${(u.items||[]).slice(0,8).map(v=>`<span class="chip">#${v.id} ${r(v.question.slice(0,22))}${v.question.length>22?"\u2026":""}</span>`).join("")}${u.item_count>8?`<span class="qb-muted">+${u.item_count-8}</span>`:""}</div>
            <div class="qb-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${u.id}">${g("edit",13)}<span>\u7DE8\u8F2F suite</span></button>
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${u.id}">${g("shield",13)}<span>\u51CD\u7D50</span></button>
              <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${u.id}">${g("trash",13)}<span>\u522A\u9664</span></button>
            </div>
          </article>`).join(""):ra("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
        </div>
      </div>
    </details>
  </section>`}function bp(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),n=Number(a?.value);Number.isFinite(n)&&(t[s]=Math.max(1,Math.min(5,Math.round(n))))}return t}function hp(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:Uu(t.get("expected_laws")),expected_articles:Qu(t.get("expected_articles")),expected_judgments:Ju(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function zo(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},n={tab:"",editing:null,editingFrom:"",editingSuite:null,aiQuestion:"",aiLoading:!1,aiResult:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tags:[]},stats:{},suites:[],ready:[],selectedSuiteId:null,selectedBankItemId:null,bankTab:"split",suiteAnswers:{},suiteAnswersLoading:!1,suiteAnswersError:"",suiteManageOpen:!1,reviewItems:[],reviewDetail:null,reviewFilter:"queue"},i=P=>e.querySelector(`#quality-panel-${a[P]}`),o=(P,U)=>{P&&(P.childElementCount?P.setAttribute("aria-busy","true"):P.innerHTML=`<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>${U}</span></div></section>`)},l=P=>{P?.removeAttribute("aria-busy")},p=0,f=null,m=()=>"anonymous",y=()=>{s&&s(n.stats)},b=P=>{t&&t(P),ie(P)},u=async()=>{try{n.stats=await V.questionBankStats()}catch{n.stats={}}y()},v=()=>{let P=i("create");P&&(P.innerHTML=tp(n.editing,n))},w=(P,U)=>{let j=P?.querySelector("[data-qb-tag-results]");j&&(j.innerHTML=U.length?U.map(B=>`<button class="qb-tag-option" type="button" role="option" data-qb-action="select-tag" data-tag="${r(B.tag)}"><span>${r(B.tag)}</span><small>${d(B.count)}</small></button>`).join(""):'<div class="qb-tag-empty">\u6C92\u6709\u5176\u4ED6\u76F8\u7B26\u6A19\u7C64</div>')},_=async(P,U="")=>{if(!P)return;let j=P.querySelector("[data-qb-tag-results]"),B=++p;j&&(j.innerHTML='<div class="qb-tag-loading"><span class="spinner"></span><span>\u641C\u5C0B\u6A19\u7C64\u2026</span></div>');try{let te=await V.questionBankTags(U,12);if(B!==p)return;let G=(te.tags||[]).filter(Re=>!n.filters.tags.includes(Re.tag));w(P,G)}catch(te){if(B!==p)return;j&&(j.innerHTML=`<div class="qb-tag-empty">${r(te.message||"\u6A19\u7C64\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},x=(P,{focus:U=!1}={})=>{if(!P)return;let j=P.querySelector("[data-qb-tag-popover]"),B=P.querySelector("[data-qb-tag-search]");!j||!B||(j.hidden&&(j.hidden=!1,B.value="",_(P,"")),U&&(B.focus(),B.select()))},S=P=>{f&&(window.clearTimeout(f),f=null);let U=P?.querySelector("[data-qb-tag-popover]");U&&(U.hidden=!0)},k=async P=>{let U=String(P||"").trim();U&&(n.filters.tags.includes(U)?n.filters.tags=n.filters.tags.filter(j=>j!==U):n.filters.tags=[...n.filters.tags,U],n.offset=0,await q())},D=()=>{let P=Array.isArray(n.suites)?n.suites:[];if(!P.length)return n.selectedSuiteId=null,n.selectedBankItemId=null,null;let U=P.find(B=>Number(B.id)===Number(n.selectedSuiteId));U||(U=P[0],n.selectedSuiteId=U.id,n.selectedBankItemId=null);let j=Array.isArray(U.items)?U.items:[];return j.some(B=>Number(B.id)===Number(n.selectedBankItemId))||(n.selectedBankItemId=j[0]?.id??null),U},oe=()=>{let P=i("suite");P&&(P.innerHTML=Do(n))},O=0,be=async(P,{force:U=!1}={})=>{if(!P)return;let j=++O;if(!U&&n.suiteAnswers[String(P)]){n.suiteAnswersLoading=!1,n.suiteAnswersError="",oe();return}n.suiteAnswersLoading=!0,n.suiteAnswersError="",oe();try{let B=await V.benchmarkSuiteLatestAnswers(P);if(j!==O)return;n.suiteAnswers[String(P)]=B.answers||{}}catch(B){if(j!==O)return;n.suiteAnswersError=B.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}finally{j===O&&(n.suiteAnswersLoading=!1,oe())}},fe=async P=>{n.selectedSuiteId=P,n.selectedBankItemId=null,n.suiteAnswersError="";let U=D();if(!U){oe();return}await be(U.id)},W=P=>{n.bankTab=P==="full"?"full":"split",oe()},L=()=>{let P=i("suite");if(!P)return;let U=D(),B=(Array.isArray(U?.items)?U.items:[]).find(G=>Number(G.id)===Number(n.selectedBankItemId))||null;for(let G of P.querySelectorAll(".qb-bank-row")){let Re=Number(G.dataset.id)===Number(n.selectedBankItemId);G.classList.toggle("is-active",Re);let Le=G.querySelector("[data-qb-action='select-bank-item']");Le&&Le.setAttribute("aria-pressed",Re?"true":"false")}let te=P.querySelector("[data-qb-bank-answer]");te&&(te.innerHTML=Oo(n,B))},q=async()=>{let P=i("manage");if(P){f&&(window.clearTimeout(f),f=null),o(P,"\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026");try{let U=await V.questionBankItems({...n.filters,...n.filters.status==="retired"?{include_deleted:!0}:{}},n.limit,n.offset);n.items=U.items||[],n.total=Number(U.total||0),n.stats=U.stats||n.stats,l(P),P.innerHTML=ap(n),y()}catch(U){l(P),P.innerHTML=`<section class="report-card qb-card">${Ce({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(U.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},E=async({refreshAnswers:P=!1}={})=>{let U=i("suite");if(U){o(U,"\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026");try{let[j,B]=await Promise.all([V.benchmarkSuites(),V.benchmarkReadyQuestions(300)]);n.suites=j.suites||[],n.ready=B.items||[];let te=D();if(n.suiteAnswersError="",n.suiteAnswersLoading=!1,te&&(P||!n.suiteAnswers[String(te.id)]))try{let G=await V.benchmarkSuiteLatestAnswers(te.id);n.suiteAnswers[String(te.id)]=G.answers||{}}catch(G){n.suiteAnswersError=G.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}l(U),U.innerHTML=Do(n)}catch(j){l(U),U.innerHTML=`<section class="report-card qb-card">${Ce({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(j.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},X=()=>{let P=i("review");P&&(P.innerHTML=dp(n))},ee=async P=>{let U=n.reviewItems.find(B=>Number(B.id)===Number(P));if(!U)return;n.reviewDetail=U,X();let j=i("review")?.querySelector(".qb-review-detail-pane");j&&window.matchMedia("(max-width: 1020px)").matches&&j.scrollIntoView({behavior:"smooth",block:"start"});try{let B=await V.questionBankItem(U.id);Number(n.reviewDetail?.id)===Number(U.id)&&(n.reviewDetail=B,X())}catch(B){I(B.message||"\u984C\u76EE\u5167\u5BB9\u8B80\u53D6\u5931\u6557\u3002","danger")}},F=async()=>{let P=i("review");if(!P)return;o(P,"\u8B80\u53D6\u9A57\u6536\u984C\u76EE\u4E2D\u2026");let U=n.reviewFilter||"queue",j=U==="queue"?["pending_review","changes_requested"]:U==="accepted"?["accepted"]:U==="rejected"?["rejected"]:["draft"];try{let B=await Promise.all(j.map(Le=>V.questionBankItems({status:Le},200,0)));n.reviewItems=B.flatMap(Le=>Le.items||[]),n.stats=B[0]?.stats||n.stats;let te=Number(n.reviewDetail?.id||0),Re=n.reviewItems.some(Le=>Number(Le.id)===te)?te:Number(n.reviewItems[0]?.id||0);n.reviewDetail=Re?await V.questionBankItem(Re):null,l(P),X(),y()}catch(B){l(P),P.innerHTML=`<section class="report-card qb-card">${Ce({tone:"danger",title:"\u9A57\u6536\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:r(B.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}};function ie(P){let U=n.tab;n.tab=P;for(let j of Object.keys(a)){let B=i(j);B&&(B.hidden=j!==P)}P==="create"?(U!=="create"&&!n.editing&&(n.aiQuestion="",n.aiResult=null),v()):P==="manage"?q():P==="suite"?E():P==="review"&&F()}let _e=P=>{let j=[...n.items,...n.reviewItems,...n.reviewDetail?[n.reviewDetail]:[]].find(te=>Number(te.id)===Number(P));n.reviewDetail=j||{id:Number(P)};let B=j?.status;["accepted","rejected","draft"].includes(B)?n.reviewFilter=B:B&&(n.reviewFilter="queue"),b("review")},z=async P=>{let U=hp(P),j=Number(P.elements.item_id?.value||0);j||(U.status=P.elements.submit_for_review?.checked?"pending_review":"draft");try{j?(await V.updateQuestionBankItem(j,{...U,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),I("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await V.createQuestionBankItem(U),I(U.status==="draft"?"\u984C\u76EE\u5DF2\u5B58\u70BA\u8349\u7A3F\uFF0C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002":"\u984C\u76EE\u5DF2\u5EFA\u7ACB\u4E26\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok")),n.editing=null;let B=["manage","suite","review"].includes(n.editingFrom)?n.editingFrom:"manage";n.editingFrom="",n.suiteAnswers={},await u(),b(B)}catch(B){let te=B.detail||B.payload?.detail,G=te?.errors?.join(" \xB7 ")||te?.message||B.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";I(G,"danger",8e3)}},ve=async P=>{let U=String(new FormData(P).get("question")||"").trim();if(U.length<4){I("\u984C\u76EE\u81F3\u5C11\u9700\u8981 4 \u500B\u5B57\u3002","danger");return}n.aiQuestion=U,n.aiLoading=!0,n.aiResult=null,v();try{let j=await V.createQuestionBankItemWithAI({question:U});n.aiResult=j,n.aiQuestion="",await u(),I(`llama-server \u5DF2\u5EFA\u7ACB\u984C\u76EE #${j.item.id}\uFF0C\u72C0\u614B\u70BA\u5F85\u5BE9\uFF0C\u8ACB\u4EBA\u5DE5\u8986\u6838\u3002`,"ok",8e3)}catch(j){let B=j.detail||j.payload?.detail,te=B?.errors?.join(" \xB7 ")||B?.message||j.message||"llama-server \u7522\u751F\u5931\u6557\u3002";I(te,"danger",12e3)}finally{n.aiLoading=!1,v()}},Z=async(P,U)=>{let j=Number(P.dataset.id||0);if(j)try{await V.reviewQuestionBankItem(j,{decision:U,reviewer:m(),rubric_scores:bp(P),comment:String(P.querySelector('[name="comment"]')?.value||"")}),I(U==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":U==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",U==="approved"?"ok":"info"),await u(),await F()}catch(B){let te=B.detail||B.payload?.detail,G=te?.errors?.join(" \xB7 ")||te?.message||B.message||"\u9A57\u6536\u5931\u6557\u3002";I(G,"danger",8e3)}},Se=async P=>{let U=new FormData(P),j=Number(U.get("suite_id")||0),B=Array.from(P.querySelectorAll('input[name="item_ids"]:checked')).map(G=>Number(G.value)),te={name:String(U.get("name")||"").trim(),tier:String(U.get("tier")||"core"),description:String(U.get("description")||"").trim(),item_ids:B};try{j?(await V.updateBenchmarkSuite(j,te),I("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await V.createBenchmarkSuite(te),I("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),n.editingSuite=null,n.suiteManageOpen=!0,n.suiteAnswers={},await E()}catch(G){let Re=G.detail||G.payload?.detail,Le=Re?.errors?.join(" \xB7 ")||Re?.message||G.message||"Suite \u5132\u5B58\u5931\u6557\u3002";I(Le,"danger",8e3)}},pe=async P=>{let U=e.querySelector("[data-qb-tag-filter] [data-qb-tag-popover]:not([hidden])")?.closest("[data-qb-tag-filter]");U&&!P.target.closest("[data-qb-tag-filter]")&&S(U);let j=P.target.closest("[data-qb-action]")?.dataset.qbAction;if(!j)return;let B=P.target.closest("[data-qb-action]"),te=Number(B.dataset.id||0);if(j==="open-tag-search"){let G=B.closest("[data-qb-tag-filter]");x(G,{focus:!0});return}if(j==="select-tag"){await k(B.dataset.tag);return}if(j==="remove-tag"){await k(B.dataset.tag);return}if(j==="bank-tab"){W(B.dataset.tab);return}if(j==="select-bank-item"){n.selectedBankItemId=te,L();return}if(j==="new"){n.editing=null,n.editingFrom="",n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,b("create");return}if(j==="reset-create"){n.editing=null,v();return}if(j==="reset-ai"){n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,v();return}if(j==="edit"){let G=n.suites.find(Ie=>Number(Ie.id)===Number(n.selectedSuiteId)),Le=[...n.items,...n.reviewItems,...G?.items||[],...n.reviewDetail?[n.reviewDetail]:[]].find(Ie=>Number(Ie.id)===te);if(!Le)return;n.editing=Le,n.editingFrom=n.tab,b("create");return}if(j==="review"){_e(te);return}if(j==="review-ai-item"){let G=n.aiResult?.item;if(!G)return;n.reviewFilter="queue",n.reviewDetail=G,b("review");return}if(j==="review-filter"){let G=String(B.dataset.filter||"queue");n.reviewFilter=["queue","accepted","rejected","draft"].includes(G)?G:"queue",n.reviewDetail=null,await F();return}if(j==="select-review-item"){await ee(te);return}if(j==="go-manage"){b("manage");return}if(j==="submit-review"){try{await V.submitQuestionBankItemForReview(te),I("\u5DF2\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok"),await u(),n.tab==="manage"?await q():n.tab==="review"&&await F()}catch(G){let Re=G.detail||G.payload?.detail,Le=Re?.errors?.join(" \xB7 ")||Re?.message||G.message||"\u9001\u5BE9\u5931\u6557\u3002";I(Le,"danger",8e3)}return}if(j==="restore"){if(!window.confirm(`\u78BA\u5B9A\u5FA9\u539F\u984C\u76EE #${te}\uFF1F\u5FA9\u539F\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\u72C0\u614B\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002`))return;try{await V.restoreQuestionBankItem(te),I("\u984C\u76EE\u5DF2\u5FA9\u539F\u4E26\u56DE\u5230\u5F85\u5BE9\u3002","ok"),await u(),await q()}catch(G){let Re=G.detail||G.payload?.detail,Le=Re?.errors?.join(" \xB7 ")||Re?.message||G.message||"\u5FA9\u539F\u5931\u6557\u3002";I(Le,"danger",8e3)}return}if(j==="delete"){if(n.tab==="suite"){let G=D();if(!G||!(G.items||[]).find(Le=>Number(Le.id)===te)||!window.confirm(`\u78BA\u5B9A\u5F9E\u300C${G.name}\u300D\u79FB\u9664\u984C\u76EE #${te}\uFF1F\u984C\u76EE\u4ECD\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u7BA1\u7406\u4E2D\u3002`))return;try{await V.removeBenchmarkSuiteItem(G.id,te),I("\u5DF2\u5F9E Benchmark \u984C\u5EAB\u79FB\u9664\u3002","info"),delete n.suiteAnswers[String(G.id)],Number(n.selectedBankItemId)===te&&(n.selectedBankItemId=null),await E()}catch(Le){I(Le.message||"\u79FB\u9664\u5931\u6557\u3002","danger")}return}if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${te}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await V.deleteQuestionBankItem(te),I("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await u(),n.tab==="review"?(n.reviewDetail=null,await F()):await q()}catch(G){I(G.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(j==="revalidate"){try{let G=await V.revalidateQuestionBank();I(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${d(G.checked||0)} \u984C\uFF0C${d(G.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await u(),await q()}catch(G){I(G.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(j==="export"){try{let G=await V.exportQuestionBank({status:""});Pt(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(G,null,2),"application/json;charset=utf-8")}catch(G){I(G.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(j==="import-json"){let G=e.querySelector("#qb-import-json");try{let Re=JSON.parse(String(G?.value||"").trim()),Le=await V.importQuestionBank(Re);I(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${Le.created}\u3001\u66F4\u65B0 ${Le.updated}\u3001\u932F\u8AA4 ${(Le.errors||[]).length}\u3002`,(Le.errors||[]).length?"warn":"ok",8e3),G&&(G.value=""),await u(),await q()}catch(Re){I(Re.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(j==="prev"||j==="next"){n.offset=Math.max(0,n.offset+(j==="next"?n.limit:-n.limit)),await q();return}if(j==="suite-edit"){let G=n.suites.find(Re=>Number(Re.id)===te);if(!G)return;n.editingSuite=G,n.suiteManageOpen=!0,E();return}if(j==="suite-new"){n.editingSuite=null,n.suiteManageOpen=!0,E();return}if(j==="suite-freeze"){try{await V.updateBenchmarkSuite(te,{freeze:!0}),I("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),n.editingSuite=null,n.suiteManageOpen=!0,await E()}catch(G){I(G.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(j==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${te}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await V.deleteBenchmarkSuite(te),I("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),n.editingSuite=null,n.suiteAnswers={},n.suiteManageOpen=!0,await E()}catch(G){I(G.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(j==="decide"){let G=B.closest("form[data-qb-form='review']");G&&await Z(G,String(B.dataset.decision||""))}},K=async P=>{let U=P.target.closest("[data-qb-form]");if(!U)return;P.preventDefault();let j=U.dataset.qbForm;if(j==="create")await z(U);else if(j==="ai-create")await ve(U);else if(j==="filter"){let B=new FormData(U);n.filters={query:String(B.get("query")||"").trim(),status:String(B.get("status")||""),question_type:String(B.get("question_type")||""),difficulty:String(B.get("difficulty")||""),tags:B.getAll("tags").map(te=>String(te).trim()).filter(Boolean)},n.offset=0,await q()}else j==="suite"&&await Se(U)},re=async P=>{let U=P.target.closest?.("form[data-qb-form='filter'] select");if(U){U.form.requestSubmit();return}let j=P.target.closest?.("[data-qb-suite-select]");if(!j)return;let B=Number(j.value||0);!B||B===Number(n.selectedSuiteId)||await fe(B)},me=P=>{let U=P.target;U?.matches?.(".qb-suite-manage")&&(n.suiteManageOpen=!!U.open)},he=P=>{let U=P.target.closest?.("[data-qb-action='open-tag-search']");U&&x(U.closest("[data-qb-tag-filter]"))},ke=P=>{let U=P.target.closest?.("[data-qb-tag-filter]");U&&(P.relatedTarget&&U.contains(P.relatedTarget)||S(U))},xe=P=>{let U=P.target.closest?.("[data-qb-tag-search]");if(!U)return;let j=U.closest("[data-qb-tag-filter]");f&&window.clearTimeout(f),f=window.setTimeout(()=>{_(j,U.value)},160)},Ee=P=>{let U=P.target.closest?.("[data-qb-tag-search]");if(!U)return;let j=U.closest("[data-qb-tag-filter]");P.key==="Escape"?(P.preventDefault(),S(j),U.blur()):P.key==="Enter"?(P.preventDefault(),j?.querySelector("[data-qb-action='select-tag']")?.click()):P.key==="ArrowDown"&&(P.preventDefault(),j?.querySelector("[data-qb-action='select-tag']")?.focus())};e.addEventListener("click",pe),e.addEventListener("submit",K),e.addEventListener("change",re),e.addEventListener("toggle",me,!0),e.addEventListener("mouseover",he),e.addEventListener("mouseout",ke),e.addEventListener("input",xe),e.addEventListener("keydown",Ee);let Oe=async()=>{await u(),n.tab==="create"?v():n.tab==="manage"?await q():n.tab==="suite"?await E({refreshAnswers:!0}):n.tab==="review"&&await F()};return u(),{show:ie,refresh:Oe,destroy(){f&&window.clearTimeout(f),e.removeEventListener("click",pe),e.removeEventListener("submit",K),e.removeEventListener("change",re),e.removeEventListener("toggle",me,!0),e.removeEventListener("mouseover",he),e.removeEventListener("mouseout",ke),e.removeEventListener("input",xe),e.removeEventListener("keydown",Ee)},getStats:()=>n.stats}}function Wa(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function Go(e){return e==null?"\u2014":d(e)}function vp(e){return e.count?e.severity==="danger"?Je("failed","\u9700\u8655\u7406"):e.severity==="warn"?Je("warning","\u6CE8\u610F"):Je("preview","\u63D0\u793A"):Je("success","\u901A\u904E")}function $p(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function yp(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${$p(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${r(e.label)}</span>
      ${vp(e)}
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
  </div>`}function wp(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},n=t.postgres_diff,i=n==null?"\u2014":n===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${d(Math.abs(n))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${d(t.vector_indexed)} / ${d(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${g("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${d(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${d(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${g("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${Go(t.postgres_judgments)}</div>
      <div class="metric-foot">${r(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${g("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${r(Wa(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${r(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${g("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${Go(a.candidate_total)}</div>
      <div class="metric-foot">${d(a.candidate_archive_count)} / ${d(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function _p(e){return e.length?`<div class="table-wrap">
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
              <td class="cell-date">${r(Rt(t.date_min))} \u2013 ${r(Rt(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:ct({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function kp(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],n=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=qe(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${Je(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${d(t.rows)} \u7B46 \xB7 ${d(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${ue(e.scan_ms||0)} \xB7
          ${r(ye(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${g("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${Ce({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(p=>r(p)).join("<br>")})}</div>`:""}
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
      <div class="quality-checks">${a.map(yp).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${wp(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${d(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${_p(Array.isArray(e.archives)?e.archives:[])}
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
  </div>`}async function Sp(e){e.innerHTML=`<section class="page data-page quality-page">
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),n=[...e.querySelectorAll("[data-quality-tab]")],i={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},o=null,l="overview",p=()=>{if(!o)return;t.innerHTML=kp(o),a.textContent=`DUCKDB \xB7 ${d(o.totals?.rows)} \u7B46 \xB7 ${ue(o.scan_ms||0)}`;let v=e.querySelector("#quality-badge-overview");v&&(v.textContent=d(o.totals?.rows||0))},f=v=>{l=v==="overview"?"overview":v;for(let w of n){let _=w.dataset.qualityTab===l;w.classList.toggle("is-active",_),_?w.setAttribute("aria-current","page"):w.removeAttribute("aria-current")}for(let[w,_]of Object.entries(i))_&&(_.hidden=w!==l);l!=="overview"?a.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":o&&p()},m=zo(e,{onNavigate:v=>f(v),onStats:v=>{let w=v||{},_=e.querySelector("#quality-badge-manage"),x=e.querySelector("#quality-badge-suite"),S=e.querySelector("#quality-badge-review");_&&(_.textContent=d(w.total||0)),x&&(x.textContent=d(w.benchmark_ready||0)),S&&(S.textContent=d((w.pending_review||0)+(w.changes_requested||0)))}}),y=v=>{f(v),v!=="overview"&&m.show(v)},b=async()=>{Me(s,!0,"\u6383\u63CF\u4E2D\u2026");try{o=await V.quality(),p()}catch(v){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${Ce({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:r(v.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",I("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{Me(s,!1)}},u=async()=>{l==="overview"?await b():await m.refresh()};s.addEventListener("click",u),e.addEventListener("click",v=>{let w=v.target.closest("[data-quality-tab]");w&&y(w.dataset.qualityTab||"overview")}),t.addEventListener("click",v=>{!v.target.closest("[data-action='export-quality']")||!o||Pt(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(o,null,2),"application/json;charset=utf-8")}),f("overview"),await b()}var _r={};rs(_r,{render:()=>rm});var Ka={};rs(Ka,{render:()=>yr});var Uo={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function Qo(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${r(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${r(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function xp(e){let t=e?.supports_chat,s=t===!0?"badge-ok":t===!1?"badge-danger":"badge-neutral",a=t===!0?"\u652F\u63F4 chat":t===!1?"\u4E0D\u652F\u63F4 chat":"\u672A\u6E2C\u8A66",n=(Array.isArray(e?.capabilities)?e.capabilities:[]).map(i=>`<span class="chip chip-mono">${r(i)}</span>`).join("");return`<div class="tests-llm-row">
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
  </div>`}function Ap(e){let t=Array.isArray(e?.models)?e.models:[],s=e?.counts||{},a=Array.isArray(e?.failures)?e.failures:[];return{summary:e?`<span>llama-server <strong>${s.available??t.length}</strong> \u500B\u6A21\u578B</span>
      <span>\u652F\u63F4 chat <strong>${s.chat??0}</strong></span>
      <span>\u4E0D\u652F\u63F4 <strong>${s.unsupported??0}</strong></span>
      <span>\u672A\u6E2C\u8A66 <strong>${s.untested??0}</strong></span>
      <span>\u672C\u6B21\u65B0\u6E2C <strong>${(e.tested_now||[]).length}</strong></span>
      <span class="muted">${r(e.detail||"")}</span>`:"<span>\u6B63\u5728\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u2026</span>",list:t.length?t.map(xp).join(""):'<div class="tests-llm-empty">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u8ACB\u78BA\u8A8D llama-server \u5DF2\u555F\u52D5\u4E26\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66\u3002</div>',failures:a.length?`<div class="tests-llm-failures">${a.map(i=>`<span><strong class="mono">${r(i.model||"\u2014")}</strong> ${r(i.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function qp(e){let t=String(e?.status||"degraded"),s=t==="operational"?"badge-ok":t==="disabled"?"badge-neutral":"badge-danger",a=Array.isArray(e?.scores)?e.scores.slice(0,4):[],n=Array.isArray(e?.results)?e.results[0]:null;return`<div class="tests-llm-row">
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
  </div>`}function Mp(e){if(!e)return{summary:"<span>\u6B63\u5728\u8B80\u53D6 reranker \u72C0\u614B\u2026</span>",list:"",failures:""};let t=Array.isArray(e.providers)?e.providers:[],s=e.active||{},a=String(e.status||"degraded"),n=a==="operational"?"badge-ok":a==="not_configured"?"badge-neutral":"badge-danger",i=t.flatMap(o=>(o.errors||[]).map(l=>({model:o.url,detail:l})));return{summary:`<span>\u72C0\u614B <span class="badge ${n}">${r(a)}</span></span>
      <span>\u6A21\u578B <strong>${r(e.model||"\u2014")}</strong></span>
      <span>\u555F\u7528 <strong>${e.enabled?"true":"false"}</strong></span>
      ${s.url?`<span>\u4F5C\u7528\u4E2D <strong class="mono">${r(s.url)}</strong></span>`:""}
      <span class="muted">${r(e.detail||"")}</span>`,list:t.length?t.map(qp).join(""):'<div class="tests-llm-empty">\u6C92\u6709\u8A2D\u5B9A RERANK_URL\uFF1B\u8ACB\u8A2D\u5B9A primary \u6216 fallback reranker\u3002</div>',failures:i.length?`<div class="tests-llm-failures">${i.map(o=>`<span><strong class="mono">${r(o.model||"\u2014")}</strong> ${r(o.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function Lp(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,total_ms:e.total_ms,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}:${a.duration_ms}`)}:null})}async function yr(e,t,{embedded:s=!1}={}){let a=!1,n=!1,i={embedding:[],llm:[]},o=!1,l=null,p=!1,f=null,m=!1,y=null,b=[],u="",v=null,w="",_=`<div class="page-actions">
      <span class="badge badge-neutral badge-mono" id="tests-mode-badge">\u8B80\u53D6\u4E2D</span>
      <button class="btn btn-secondary" type="button" id="tests-refresh">
        ${g("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
      </button>
    </div>`,x=s?`<div class="tests-embed-head">
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
    ${x}

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
  </section>`;let S=e.querySelector("#tests-mode-badge"),k=e.querySelector("#tests-mode-toggle"),D=e.querySelector("#tests-mode-summary"),oe=e.querySelector("#tests-mode-models"),O=e.querySelector("#tests-mode-status"),be=e.querySelector("#tests-api-form"),fe=e.querySelector("#tests-api-input"),W=e.querySelector("#tests-admin-token-input"),L=e.querySelector("#tests-api-preview"),q=e.querySelector("#tests-api-status"),E=e.querySelector("#tests-api-note"),X=e.querySelector("#tests-api-test"),ee=e.querySelector("#tests-api-reset"),F=e.querySelector("#tests-api-save"),ie=e.querySelector("#tests-refresh"),_e=e.querySelector("#tests-flow"),z=e.querySelector("#tests-llm-summary"),ve=e.querySelector("#tests-llm-list"),Z=e.querySelector("#tests-llm-failures"),Se=e.querySelector("#tests-llm-status"),pe=e.querySelector("#tests-llm-test"),K=e.querySelector("#tests-rerank-summary"),re=e.querySelector("#tests-rerank-list"),me=e.querySelector("#tests-rerank-failures"),he=e.querySelector("#tests-rerank-status"),ke=e.querySelector("#tests-rerank-test");W&&(W.value=fa());let xe=(se,$e,ze="")=>{se&&(se.textContent=$e,se.className=`tests-status${ze?` is-${ze}`:""}`)},Ee=(se,$e="")=>{q&&(q.textContent=se,q.className=`api-dialog-status${$e?` is-${$e}`:""}`)},Oe=()=>Et()==="query",P=()=>{let se=Yt(fe.value);return se||(window.location.protocol==="file:"?cn:"")},U=()=>{let se=P(),$e=Ft(),ze=Uo[Et()]||Et()||"\u540C\u6E90";L.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${r(is($e))}</strong>${$e?`\uFF08${r(ze)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${r(lt("/api/health",se))}`},j=()=>{let se=Et(),$e=`\u76EE\u524D\u4F86\u6E90\uFF1A${Uo[se]||se||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,ze="";se==="query"?(ze="is-warn",$e="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):ga()?(ze="is-warn",$e="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(se==="file-default"||window.location.protocol==="file:")&&($e="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),$e+=(W?.value||fa()).trim()?" \u7BA1\u7406\u6B0A\u6756\uFF1A\u5DF2\u8A2D\u5B9A\uFF0C\u6703\u9001\u5F80\u76EE\u524D\u8A2D\u5B9A\u7684 API Base\u3002":" \u7BA1\u7406\u6B0A\u6756\uFF1A\u672A\u8A2D\u5B9A\uFF1B\u672C\u6A5F loopback \u53EF\u76F4\u63A5\u4F7F\u7528\uFF0C\u9060\u7AEF\u7BA1\u7406 API \u6703\u88AB\u62D2\u7D55\u3002",E.textContent=$e,E.className=`api-dialog-note${ze?` ${ze}`:""}`;let Ge=se==="query";F.disabled=Ge,ee.disabled=Ge,fe.readOnly=Ge},B=()=>{if(!dn(fe.value))return Ee("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),fe.focus(),null;let se=P();return window.location.protocol==="https:"&&/^http:\/\//i.test(se)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(se)?(Ee("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),fe.focus(),null):se},te=()=>{fe.value=Ft(),U(),j(),Ee("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},G=()=>{let se=Array.isArray(i.embedding)?i.embedding.length:0,$e=Array.isArray(i.llm)?i.llm.length:0;if(S&&(S.textContent=o?"\u5207\u63DB\u4E2D\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",S.className=`badge badge-mono ${o?"badge-info":n?"badge-warn":"badge-neutral"}`),k){k.disabled=o,k.classList.toggle("is-on",n),k.classList.toggle("is-off",!n&&!o),k.classList.toggle("is-busy",o),k.setAttribute("aria-checked",n?"true":"false"),k.setAttribute("aria-busy",o?"true":"false"),k.setAttribute("aria-label",o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":n?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),k.title=o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let ze=k.querySelector(".header-power-label");ze&&(ze.textContent=o?"\u2026":n?"ON":"OFF")}D&&(D.textContent=n?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${se} \u500B embedding \u8207 ${$e} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),oe&&(oe.innerHTML=Qo("Embedding",i.embedding)+Qo("LLM",i.llm))},Re=async()=>{try{let se=await V.testMode();if(a)return;n=!!se.enabled,i=se.models||{embedding:[],llm:[]},xe(O,"")}catch(se){if(a)return;n=!1,i={embedding:[],llm:[]},xe(O,se.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}a||G()},Le=async()=>{if(o)return;let se=!n;o=!0,G(),xe(O,se?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let $e=await V.setTestMode(se);if(a)return;n=!!$e.enabled,i=$e.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:n,models:i}}));let ze=i.embedding?.length||0,Ge=i.llm?.length||0;xe(O,n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${ze} \u500B embedding \u8207 ${Ge} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),I(n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${ze} \u500B embedding\u3001${Ge} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",n?"ok":"info",6e3),await et()}catch($e){a||(xe(O,$e.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),I($e.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{o=!1,a||G()}},Ie=()=>{let se=Ap(l);if(z&&(z.innerHTML=se.summary),ve&&(ve.innerHTML=se.list),Z&&(Z.innerHTML=se.failures),pe){pe.disabled=p,pe.setAttribute("aria-busy",p?"true":"false");let $e=pe.querySelector("span");$e&&($e.textContent=p?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66")}},Qe=async()=>{try{let se=await V.llmModels();if(a)return;l=se,xe(Se,"")}catch(se){if(a)return;l=null,xe(Se,se.message||"\u7121\u6CD5\u8B80\u53D6 llama-server \u6A21\u578B\u6E05\u55AE\u3002","error")}a||Ie()},mt=async()=>{if(!p){p=!0,Ie(),xe(Se,"\u6B63\u5728\u6AA2\u67E5 llama-server \u6A21\u578B\u8207 chat \u80FD\u529B\u2026");try{let se=await V.testLlmModels();if(a)return;l=se;let $e=se.tested_now?.length||0,ze=se.chat_models?.length||0,Ge=se.failures?.length||0;xe(Se,`${$e?`\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u672C\u6B21\u65B0\u6E2C ${$e} \u500B\u6A21\u578B`:"\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u6C92\u6709\u65B0\u6A21\u578B"}\uFF0C\u76EE\u524D ${ze} \u500B\u6A21\u578B\u652F\u63F4 chat${Ge?`\uFF1B${Ge} \u500B\u6A21\u578B\u66AB\u6642\u7121\u6CD5\u5224\u5B9A\uFF0C\u4E0B\u6B21\u6703\u91CD\u8A66`:""}\u3002`,Ge?"warn":"ok"),I($e?`LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u65B0\u589E ${$e} \u7B46\u80FD\u529B\u7D00\u9304\u3002`:"LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u6C92\u6709\u65B0\u6A21\u578B\u9700\u8981\u6E2C\u8A66\u3002",Ge?"warn":"ok",5e3),await Re()}catch(se){a||(xe(Se,se.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),I(se.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{p=!1,a||Ie()}}},de=()=>{let se=Mp(f);if(K&&(K.innerHTML=se.summary),re&&(re.innerHTML=se.list),me&&(me.innerHTML=se.failures),ke){ke.disabled=m,ke.setAttribute("aria-busy",m?"true":"false");let $e=ke.querySelector("span");$e&&($e.textContent=m?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C Reranker \u670D\u52D9\u6E2C\u8A66")}},We=async()=>{try{let se=await V.rerankStatus();if(a)return;f=se,xe(he,"")}catch(se){if(a)return;f=null,xe(he,se.message||"\u7121\u6CD5\u8B80\u53D6 reranker \u72C0\u614B\u3002","error")}a||de()},nt=async()=>{if(!m){m=!0,de(),xe(he,"\u6B63\u5728\u5C0D primary\uFF0Ffallback reranker \u57F7\u884C\u5BE6\u969B rerank \u6E2C\u8A66\u2026");try{let se=await V.testReranker();if(a)return;f=se;let $e=Array.isArray(se.providers)?se.providers:[],ze=$e.filter(at=>at.status==="operational").length,Ge=$e.reduce((at,Tt)=>at+(Array.isArray(Tt.errors)?Tt.errors.length:0),0);xe(he,Ge?`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${ze} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C${Ge} \u500B\u932F\u8AA4\uFF1B\u8A73\u7D30\u5206\u6578\u5DF2\u5217\u5728\u4E0A\u65B9\u3002`:`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${ze} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C\u6A21\u578B ${se.model||"\u2014"}\u3002`,Ge?"warn":"ok"),I(Ge?"Reranker \u90E8\u5206\u7AEF\u9EDE\u5931\u6557\uFF0C\u8ACB\u67E5\u770B\u6E2C\u8A66\u7D50\u679C\u3002":"Reranker \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\u3002",Ge?"warn":"ok",5e3)}catch(se){a||(xe(he,se.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),I(se.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{m=!1,a||de()}}},gt=()=>{if(!_e)return;let se=Lp(y,b,u);se!==w&&(w=se,_e.innerHTML=Rs(y,b,u))},Xe=async()=>{try{let se=await V.testRuns(30);if(a)return;b=Array.isArray(se.runs)?se.runs:[]}catch{if(a)return;b=[]}},et=async(se=null)=>{try{let $e=se||(u?await V.testRun(u):await V.testRunCurrent());if(a)return;y=$e.run||null,!u&&y&&y.status!=="running"&&!b.some(ze=>ze.run_id===y.run_id)&&await Xe()}catch{if(a)return;y=null}a||gt()};fe?.addEventListener("input",()=>{U(),Ee("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),W?.addEventListener("input",()=>{j()}),X?.addEventListener("click",async()=>{let se=B();if(se!==null){Me(X,!0,"\u6E2C\u8A66\u4E2D\u2026"),Ee(`\u6B63\u5728\u9023\u7DDA\u5230 ${is(se)||"\u540C\u6E90"}\u2026`);try{let $e=await Ir(se);if(a)return;Ee(`\u9023\u7DDA\u6210\u529F \xB7 v${$e.version} \xB7 ${$e.duration_ms} ms \xB7 GET ${lt("/api/health",se)}`,"ok")}catch($e){a||Ee($e.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{a||Me(X,!1)}}}),be?.addEventListener("submit",se=>{if(se.preventDefault(),Oe())return;let $e=B();$e!==null&&(gn($e),Rr(W?.value||""),I(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${is($e)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),ee?.addEventListener("click",()=>{Oe()||(gn(""),I("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),k?.addEventListener("click",Le),pe?.addEventListener("click",mt),ke?.addEventListener("click",nt),_e?.addEventListener("change",async se=>{se.target.id==="test-run-select"&&(u=String(se.target.value||""),await et())}),_e?.addEventListener("click",async se=>{se.target.closest("#test-flow-refresh")&&(u="",await Xe(),await et())}),ie?.addEventListener("click",async()=>{Me(ie,!0,"\u66F4\u65B0\u4E2D\u2026"),te(),await Promise.allSettled([Re(),Xe(),Qe(),We()]),a||await et(),a||(Me(ie,!1),I("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let ft=se=>{n=!!se.detail?.enabled,i=se.detail?.models||{embedding:[],llm:[]},G()};return window.addEventListener("judgment:test-mode",ft),te(),G(),Ie(),de(),await Promise.allSettled([Re(),Xe(),Qe(),We()]),await et(),v=ht("test-runs",async(se,$e)=>{a||document.hidden||u||await et($e?.snapshot||null)}),!s&&typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{a=!0,v&&v(),window.removeEventListener("judgment:test-mode",ft)}}var Jo={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var Yo={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},wr=new Set,Xo=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"tests",label:"\u7CFB\u7D71\u6E2C\u8A66",hint:"API\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u6A21\u578B Flow",icon:"terminal"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"local-model",label:"Model Provider",hint:"llama-server \u4E3B\u6A5F\u8207\u6A21\u578B",icon:"server"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 API \u2192 Pipeline \u2192 Data",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}],oa=[{id:"system",label:"\u7CFB\u7D71\u8207\u5373\u6642\u72C0\u614B",icon:"activity",prefixes:["/api/health","/api/status","/api/system-usage","/api/events/stream","/api/processing/events/status","/api/docs","/api/openapi.json"]},{id:"processing",label:"\u8CC7\u6599\u8655\u7406\u8207\u66F4\u65B0",icon:"database",prefixes:["/api/processing","/api/judgment-download","/api/updates","/api/courts","/api/law-versions"]},{id:"data",label:"\u67E5\u8A62\u8207\u8CC7\u6599",icon:"search",prefixes:["/api/query","/api/data","/api/judgment","/api/law","/api/schema","/api/catalog","/api/judgment-stats","/api/quality"]},{id:"rag",label:"RAG \u554F\u7B54",icon:"message",prefixes:["/api/rag"]},{id:"index",label:"\u7248\u672C\u8207\u7D22\u5F15",icon:"layers",prefixes:["/api/index-versions","/api/index-alias","/api/versioning"]},{id:"models",label:"\u6A21\u578B\u8207\u670D\u52D9",icon:"brain",prefixes:["/api/ollama","/api/llm","/api/rerank","/api/test-mode"]},{id:"tests",label:"\u6E2C\u8A66\u8207\u6548\u80FD",icon:"activity",prefixes:["/api/test-runs","/api/performance"]},{id:"question-bank",label:"\u984C\u5EAB",icon:"file",prefixes:["/api/question-bank"]},{id:"benchmark",label:"Benchmark",icon:"grid",prefixes:["/api/benchmark"]},{id:"other",label:"\u5176\u4ED6",icon:"terminal",prefixes:[]}];function jp(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Ct(e).label,tone:Ct(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function Tp(e){let t=Ct(e.status),s=Jo[e.kind]||Jo.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${d(e.latency_ms)} ms</span>`;return`<article class="service-card">
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
  </article>`}function Np(e,t){let s=typeof e=="string"?{label:e}:e||{},a=String(s.label||"\u2014"),n=s.service?t.find(l=>l.id===s.service):null,i=n?n.status==="operational":a==="IndexedDB"?li():!0,o=[s.detail||"",n?`\u72C0\u614B\uFF1A${Ct(n.status).label}`:""].filter(Boolean).join(" \xB7 ");return`<div class="arch-node ${i?"":"is-muted"}" title="${r(o||(i?a:"\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"))}">
    <strong>${r(a)}</strong>
    ${s.detail?`<span class="arch-node-detail">${r(s.detail)}</span>`:""}
  </div>`}function Ep(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>Np(l,t)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${r(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),n=[];return a.forEach((i,o)=>{o&&n.push(`<div class="arch-arrow" aria-hidden="true">${g("arrowRight",15)}</div>`),n.push(i)}),`<div class="arch-flow">${n.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${g("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>
    ${Rp()}`}function Rp(){return`<figure class="arch-diagram">
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
  </figure>`}function Zo(e){let t=String(e||""),s=a=>t===a||t.startsWith(`${a}/`);for(let a of oa)if(a.prefixes.some(s))return a;return oa[oa.length-1]}function Cp(e){return`is-${String(e||"get").toLowerCase()}`}function Pp(e){return`<div class="endpoint-row${e.deprecated?" is-deprecated":""}">
    <span class="endpoint-method ${Cp(e.method)}">${r(e.method||"GET")}</span>
    <span class="endpoint-path" title="${r(e.path||"")}">${r(e.path||"")}</span>
    <span class="endpoint-label">${r(e.label||"")}</span>
  </div>`}function Ip(e){if(!Array.isArray(e)||!e.length)return'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>';let t=new Map(oa.map(s=>[s.id,{group:s,endpoints:[]}]));for(let s of e){let a=Zo(s.path),n=t.get(a.id);n&&n.endpoints.push(s)}return`<div class="api-endpoint-groups">${oa.map(s=>{let n=t.get(s.id)?.endpoints||[];return n.length?(n.sort((i,o)=>String(i.path).localeCompare(String(o.path))||String(i.method).localeCompare(String(o.method))),`<section class="card api-endpoint-group">
        <div class="side-card-head">
          <span class="side-card-title">${g(s.icon,14)}${r(s.label)}</span>
          <span class="badge badge-neutral badge-mono">${d(n.length)}</span>
        </div>
        <div class="endpoint-list">${n.map(Pp).join("")}</div>
      </section>`):""}).join("")}</div>`}function ss(e,t){return`<div class="detail-row">
    <span class="detail-label">${r(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function Be(e,t,{mono:s=!1,wide:a=!1}={}){return`<div class="data-version-fact${a?" is-wide":""}">
    <span>${r(e)}</span>
    <strong class="${s?"mono":""}">${r(String(t??"\u2014"))}</strong>
  </div>`}function Vo(e,t,s,a=""){let n=t==null?null:Math.max(0,Math.min(100,Number(t)||0));return`<div class="data-version-coverage ${a}">
    <div class="data-version-coverage-head">
      <span>${r(e)}</span>
      <strong>${Ya(n)}</strong>
    </div>
    <div class="data-version-coverage-track"><span style="width:${n===null?0:n.toFixed(1)}%"></span></div>
    <div class="data-version-coverage-foot">${r(s)}</div>
  </div>`}function Dp(e){if(!Array.isArray(e)||!e.length)return ct({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${r(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${ha(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function Bp(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=new Map(s.map(w=>[w.id,w])),n=a.get("qdrant"),i=a.get("embedding"),o=a.get("rag"),l=a.get("llm"),p=Number(t.judgment_indexed_count||0),f=Number(t.judgment_count||0),m=f?(p/f*100).toFixed(1):"0.0",y=t.judgment_vector_points===null||t.judgment_vector_points===void 0?"\u2014":d(t.judgment_vector_points),b=Number(t.judgment_index_remaining||0),u=o?.status==="operational"?"RAG \u5C31\u7DD2":o?.status==="not_configured"?"\u672A\u8A2D\u5B9A":o?.status==="degraded"?"\u964D\u7D1A":"\u672A\u77E5",v=[["cube","Qdrant \u5411\u91CF\u7D22\u5F15",n],["layers",`Embedding\uFF08${t.judgment_vector_model||"\u2014"}\uFF09`,i],["brain","RAG \u56DE\u7B54\u7BA1\u7DDA",o],["sparkles","LLM \u6A21\u578B",l]];return`<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${g("database",14)}RAG \u8CC7\u6599\u73FE\u6CC1</span>
      ${Je(o?.status,u)}
    </div>
    <div class="side-card-body">
      <div class="mini-stats">
        <div class="mini-stat">
          <div class="mini-stat-value">${d(f)}</div>
          <div class="mini-stat-label">\u5224\u6C7A</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${d(p)}</div>
          <div class="mini-stat-label">\u5DF2\u7D22\u5F15</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${m}%</div>
          <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
        </div>
      </div>
      <div class="side-status-list">
        ${v.map(([w,_,x])=>`<div class="side-status-row">
              <span>${g(w,13)}${r(_)}</span>
              ${Je(x?.status,x?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
            </div>`).join("")}
      </div>
      <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
        Collection\uFF1A${r(t.judgment_vector_collection||"\u2014")} \xB7
        ${y} points \xB7 \u5269\u9918 ${d(b)} \u7B46\u5F85\u7D22\u5F15
      </div>
    </div>
    <div class="side-card-foot">
      PostgreSQL \u5224\u6C7A\u6587\u4EF6\u3001Qdrant \u5411\u91CF\u7D22\u5F15\u8207 llama-server \u6A21\u578B\u72C0\u614B\u7686\u70BA\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u5C31\u7DD2\u6642\u6703\u660E\u78BA\u964D\u7D1A\u3002
    </div>
  </section>`}function Ya(e){let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function as(e){return Math.max(0,Number(e?.duration_ms)||0)}function Fp(e,t){let s=e?.pipeline&&typeof e.pipeline=="object"?e.pipeline:null,a=Array.isArray(s?.stages)?s.stages:[],n=Number(s?.total_ms)||a.reduce((b,u)=>b+as(u),0),i=Math.max(0,Number(t?.initMs)||0),o=Math.max(0,Number(t?.requestMs)||0),l=Math.max(o,n),p=Math.max(0,l-n),f=[],m=t?.requestStartedAt||e?.checked_at||null,y=t?.requestFinishedAt||e?.checked_at||null;if(i>.5&&f.push({key:"page-init",label:"\u9801\u9762\u521D\u59CB\u5316",caption:"\u5EFA\u7ACB\u670D\u52D9\u7E3D\u89BD\u9AA8\u67B6\u8207\u5C0E\u89BD",color:"#64748b",status:"success",duration_ms:i,started_at:t?.initStartedAt||m,finished_at:m,message:"\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u3001\u8F09\u5165\u6A21\u7D44\u4E26\u6E96\u5099\u8ACB\u6C42\u3002"}),a.length){p>.5&&f.push({key:"http",label:"HTTP \u50B3\u8F38\uFF0F\u6392\u968A",caption:"\u700F\u89BD\u5668 \u2192 FastAPI",color:"#94a3b8",status:"success",duration_ms:p,started_at:m,finished_at:y,message:"\u5305\u542B\u9023\u7DDA\u3001\u8ACB\u6C42\u6392\u968A\u8207\u56DE\u61C9\u50B3\u8F38\u3002"}),f.push(...a);let b=a.reduce((v,w)=>v+as(w),0),u=Math.max(0,n-b);u>.5&&f.push({key:"server-assemble",label:"\u4F3A\u670D\u5668\u5F59\u6574",caption:"\u72C0\u614B\u56DE\u61C9\u7D44\u88DD",color:"#cbd5e1",status:"success",duration_ms:u,started_at:a[a.length-1]?.finished_at||m,finished_at:y,message:"\u7D44\u88DD\u670D\u52D9\u3001\u8CC7\u6599\u91CF\u8207\u67B6\u69CB payload\u3002"})}else f.push({key:"status-request",label:"GET /api/status",caption:"\u670D\u52D9\u72C0\u614B\u8207\u8CC7\u6599\u91CF",color:"#64748b",status:"success",duration_ms:l,started_at:m,finished_at:y,message:"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF1B\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593\u3002"});return{total_ms:i+l,started_at:t?.initStartedAt||m,finished_at:y,stages:f,server_ms:n,request_ms:l,transport_ms:p,init_ms:i,detailed:!!s}}function Op(e){let t=e?.page_pipeline,s=Array.isArray(t?.stages)?t.stages:[];if(!t||!s.length)return"";let a=Math.max(0,Number(t.total_ms)||s.reduce((k,D)=>k+as(D),0)),n=Math.max(a,s.reduce((k,D)=>k+as(D),0),1),i=1.25,o=s.filter(k=>String(k.status||"success")!=="skipped"),l=s.filter(k=>["success","no_change"].includes(String(k.status||"success"))).length,p=s.filter(k=>k.status==="failed").length,f=s.reduce((k,D)=>as(D)>as(k)?D:k,s[0]),m=Math.max(0,Number(t.server_ms)||Number(e?.pipeline?.total_ms)||0),y=Math.max(0,Number(t.transport_ms)||0),b=Math.max(0,Number(t.init_ms)||0),u=s.map(k=>String(k.status||"success")==="skipped"?0:Math.max(as(k)/n*100,i)),v=u.reduce((k,D)=>k+D,0),w=v>100?100/v:1,_=0,x=s.map((k,D)=>{let oe=String(k.status||"success"),O=oe==="skipped",be=k.label||k.key||`\u968E\u6BB5 ${D+1}`,fe=k.caption||"",W=as(k),L=O?"\u2014":ue(W),q=n>0?W/n*100:0,E=O?0:u[D]*w,X=_;O||(_+=E);let ee=k.color||"#64748b",F=oe==="failed"?"var(--danger)":ee,ie=[`is-${oe}`,oe==="failed"?"is-error":"",O?"is-missing":""].filter(Boolean).join(" "),_e=E>0?`<span class="rag-wf-bar status-wf-bar is-sequential" style="left:${X.toFixed(3)}%;width:${E.toFixed(4)}%;top:0;height:12px;--bar-color:${r(F)}" aria-hidden="true"></span>`:"",z=O?"\u7565\u904E":oe==="failed"?"\u5931\u6557":"\u5B8C\u6210",ve=`${t.label||"status"}:${k.key||D}`,Z=[["\u72C0\u614B",z,!0],["\u958B\u59CB",k.started_at?ye(k.started_at):"\u2014",!0],["\u7D50\u675F",k.finished_at?ye(k.finished_at):"\u2014",!0],["\u8017\u6642",L,!0],["\u5360\u6574\u9AD4",Ya(q),!0],["\u8AAA\u660E",k.message||"",!1]].map(([Se,pe,K])=>K||pe?`<span class="rag-wf-detail"><span>${r(Se)}</span><strong>${r(String(pe||"\u2014"))}</strong></span>`:"").join("");return`<details class="rag-wf-stage status-wf-stage ${ie}" data-status-wf-stage="${r(ve)}"${wr.has(ve)?" open":""} style="--stage-color:${r(ee)}">
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="status-wf-step">${String(D+1).padStart(2,"0")}</span> ${r(be)}</strong>${fe?`<small>${r(fe)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(L)} \xB7 ${r(z)} <span class="rag-wf-chevron">${g("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${be}\uFF1A${z}\uFF0C\u8017\u6642 ${L}\uFF0C\u5360\u6574\u9AD4 ${Ya(q)}`)}">${_e}</span>
        </summary>
        <div class="rag-wf-details">${Z}</div>
      </details>`}).join(""),S=t.detailed?"\u5F8C\u7AEF /api/status \u968E\u6BB5\u660E\u7D30":"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF0C\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593";return`<section class="report-card status-wf-card" data-status-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${g("activity",14)}\u670D\u52D9\u7E3D\u89BD\u8F09\u5165 Pipeline</span>
      <div class="index-runtime-metrics">
        <span class="index-runtime-metric" title="\u672C\u6B21\u9801\u9762\u521D\u59CB\u5316\u5230\u72C0\u614B\u56DE\u61C9\u5B8C\u6210\u7684\u7E3D\u6642\u9593\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(ue(a))}</strong></span>
        <span class="index-runtime-metric" title="\u5F8C\u7AEF /api/status \u6AA2\u67E5\u968E\u6BB5\u7684\u5408\u8A08\u6642\u9593\u3002"><span>Server</span><strong>${r(ue(m))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u8ACB\u6C42\u6642\u9593\u6263\u6389\u5F8C\u7AEF\u6AA2\u67E5\u5F8C\u7684\u50B3\u8F38\u8207\u6392\u968A\u6642\u9593\u3002"><span>HTTP \u50B3\u8F38</span><strong>${r(ue(y))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u9AA8\u67B6\u8207\u8F09\u5165\u6A21\u7D44\u7684\u6642\u9593\u3002"><span>\u9801\u9762\u521D\u59CB\u5316</span><strong>${r(ue(b))}</strong></span>
        <span class="index-runtime-metric" title="\u8017\u6642\u6700\u9577\u7684\u6AA2\u67E5\u968E\u6BB5\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${f?.label||"\u2014"} \xB7 ${ue(as(f))}`)}</strong></span>
        <span class="index-runtime-metric" title="\u5B8C\u6210\u7684\u6AA2\u67E5\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\uFF1B\u5931\u6557\u968E\u6BB5\u6703\u4EE5\u7D05\u8272\u6A19\u793A\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${d(l)} / ${d(s.length)}${p?` \xB7 \u5931\u6557 ${d(p)}`:""}</strong></span>
      </div>
    </div>
    <div class="status-wf-summary">
      <span>\u6AA2\u67E5 <strong>${r(ye(e.checked_at))}</strong></span>
      <span>API <strong class="mono">${r(is())}</strong></span>
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
      <div class="rag-wf-stages">${x}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u986F\u793A\u672C\u6B21\u958B\u555F\u670D\u52D9\u7E3D\u89BD\u7684\u9801\u9762\u521D\u59CB\u5316\u3001HTTP \u5F80\u8FD4\u3001\u5F8C\u7AEF\u6AA2\u67E5\u8207\u56DE\u61C9\u5F59\u6574\u3002\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u5931\u6557\u968E\u6BB5\u4EE5\u7D05\u8272\u6A19\u793A\uFF0C\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\uFF1B\u6975\u77ED\u968E\u6BB5\u4FDD\u7559\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function Hp(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=jp(e.status),n=s.find(f=>f.id==="qdrant"),i=s.find(f=>f.id==="rag"),o=s.find(f=>f.id==="llm"),l=Et(),p=Yo[l]||l;return`<section class="status-hero">
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
          <span>${g("clock",11)} \u6AA2\u67E5\u6642\u9593 ${ye(e.checked_at)} \xB7 ${r(Hs(e.checked_at))}</span>
          <span>${g("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${g("database",11)} ${d(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${g("layers",11)} ${d(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${r(p)}">${g("link",11)} ${r(is())}</span>
        </div>
      </div>
    </section>

    ${Op(e)}

    <div class="service-grid">${s.map(Tp).join("")}</div>

    ${Bp(e)}

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

    ${n?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${Ce({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${r(n?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${r(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${r(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}`}function zp(e){let t=Array.isArray(e.services)?e.services:[],s=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Pipelines \u2192 Data \xB7 \u6700\u65B0\u5C08\u6848\u5143\u4EF6\u8207\u5373\u6642\u5065\u5EB7\u72C0\u614B</div>
      </div>
      <span class="badge badge-neutral badge-mono">${d((s.flow||[]).length)} layers</span>
    </div>
    ${Ep(s,t)}
  </div>`}function Gp(e){let t=Array.isArray(e.endpoints)?e.endpoints:[],s=Et(),a=Yo[s]||s,n=lt("/api/docs"),i=lt("/api/openapi.json"),o=new Set(t.map(f=>Zo(f.path).id)),l=t.reduce((f,m)=>{let y=String(m.method||"GET").toUpperCase();return f[y]=(f[y]||0)+1,f},{}),p=["GET","POST","PATCH","PUT","DELETE"].filter(f=>l[f]).map(f=>`${f} ${d(l[f])}`).join(" \xB7 ");return`<section class="status-hero api-endpoint-hero">
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
          <span>${g("terminal",11)} ${r(p||"\u2014")}</span>
          <span>${g("clock",11)} \u66F4\u65B0\u6642\u9593 ${ye(e.checked_at)}</span>
        </div>
      </div>
      <div class="api-endpoint-actions">
        <a class="btn btn-secondary btn-sm" href="${r(n)}" target="_blank" rel="noopener noreferrer">${g("external",13)}<span>Swagger UI</span></a>
        <a class="btn btn-ghost btn-sm" href="${r(i)}" target="_blank" rel="noopener noreferrer">OpenAPI JSON ${g("external",11)}</a>
      </div>
    </section>
    ${Ip(t)}
    <p class="status-footnote">\u7AEF\u9EDE\u7531 FastAPI route table \u52D5\u614B\u7522\u751F\uFF1B\u4E92\u52D5\u5F0F\u6587\u4EF6\u4F4D\u65BC <a href="${r(n)}" target="_blank" rel="noopener noreferrer"><code>${r(n)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${r(i)}" target="_blank" rel="noopener noreferrer"><code>${r(i)}</code></a>\u3002\u7AEF\u9EDE\u8B8A\u66F4\u5F8C\u91CD\u65B0\u6574\u7406\u6B64\u9801\u5373\u53EF\u53D6\u5F97\u6700\u65B0\u6E05\u55AE\u3002</p>`}function Up(e,t={}){let s=e.data||{},a=t.info||null,n=a?.counts||{},i=Number(s.judgment_indexed_count||0),o=Number(s.judgment_count||0),l=Number(s.judgment_index_remaining??Math.max(0,o-i)),p=Number(s.judgment_index_pending??l)||0,f=Number(s.judgment_index_changed||0),m=Number(s.judgment_index_stale||0),y=o>0?Math.max(0,Math.min(100,i/o*100)):null,b=Ya(y),u=s.judgment_index_fresh===!1||p>0||String(s.judgment_index_staleness?.status||"")==="stale",v=u?"is-warn":"",w=s.last_version||{},_=s.last_run||{},x=w.source_type==="law"?"\u6CD5\u898F":w.source_type==="order"?"\u547D\u4EE4":"\u2014",S=w.version_code?String(w.version_code):w.id?`#${d(w.id)}`:"\u2014",k=Number(s.legal_article_indexed_count||s.legal_index?.points_count||0),D=Number(s.legal_article_count||s.legal_index?.article_count||0),oe=D>0?Math.max(0,Math.min(100,k/D*100)):null,O=s.legal_article_stale===!0||String(s.legal_index?.status||"")==="stale",be=O?"is-warn":"",fe=s.judgment_vector_alias||"\u2014",W=s.judgment_vector_collection||"\u2014",L=s.legal_article_vector_alias||s.legal_index?.alias||"\u2014",q=s.legal_article_vector_collection||s.legal_index?.collection||"\u2014",E=u?"\u5224\u6C7A\u7D22\u5F15\u5F85\u66F4\u65B0":"\u8CC7\u6599\u7248\u672C\u4E00\u81F4",X=u?`\u5224\u6C7A\u7D22\u5F15\u5C1A\u7F3A ${d(p)} \u7B46`:"\u5224\u6C7A\u8CC7\u6599\u8207\u5411\u91CF\u7D22\u5F15\u4E00\u81F4",ee=u?`PostgreSQL \u76EE\u524D\u6709 ${d(o)} \u7B46\u5224\u6C7A\uFF0CQdrant ${W} \u5DF2\u7D22\u5F15 ${d(i)} \u7B46\uFF1B\u5C1A\u6709 ${d(p)} \u7B46\u5F85\u7D22\u5F15\u3002`:"PostgreSQL \u8207 Qdrant \u5224\u6C7A\u7B46\u6578\u4E00\u81F4\uFF1B\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u8207\u7D22\u5F15\u72C0\u614B\u540C\u6B65\u3002",F=Ct(_.status||"idle").label,ie=_.finished_at||_.started_at;return`<section class="status-hero data-version-hero">
      <div class="status-hero-main">
        <div class="overall-row">
          <span class="overall-badge ${v}">
            <span class="status-dot ${u?"is-warn":"is-ok"}" aria-hidden="true"></span>
            ${r(E)}
          </span>
          <span class="badge badge-neutral badge-mono">${d(s.version_count)} \u500B\u8CC7\u6599\u7248\u672C</span>
          <span class="badge badge-neutral">${r(x)} \u6700\u65B0\u7248\u672C ${r(S)}</span>
        </div>
        <h2 class="status-headline">${r(X)}</h2>
        <p class="status-copy">${r(ee)}</p>
        <div class="status-meta">
          <span>${g("clock",11)} \u6AA2\u67E5\u6642\u9593 ${ye(e.checked_at)}</span>
          <span>${g("database",11)} \u73FE\u884C\u8CC7\u6599 ${d(s.total_current)} \u7B46</span>
          <span>${g("layers",11)} \u539F\u59CB Parquet ${d(s.parquet_files)} \u500B \xB7 ${qe(s.parquet_bytes)}</span>
          <span title="Qdrant alias \u8207\u76EE\u524D\u7248\u672C collection">${g("link",11)} <span class="mono">${r(fe)} \u2192 ${r(W)}</span></span>
        </div>
      </div>
      <div class="data-version-ring ${v}" style="--coverage:${y===null?0:y.toFixed(1)}%">
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
        <div class="metric-foot">${b} \xB7 \u5269\u9918 ${d(p)} \u7B46</div>
      </div>
    </div>

    <div class="status-columns data-version-grid">
      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${g("database",14)}PostgreSQL \u8CC7\u6599\u7248\u672C</span>
          ${Je(w.is_current?"operational":"degraded",w.is_current?"CURRENT":"HISTORY")}
        </div>
        ${w.id?`<div class="index-current-row">
                <span class="badge badge-info">${g("activity",11)}${r(x)} ${r(S)}</span>
                <strong class="mono">${ye(w.downloaded_at)}</strong>
                <span class="index-current-copy" title="${r(w.parquet_path||"")}">${r(w.parquet_path||"\u2014")}</span>
              </div>
              <div class="data-version-facts">
                ${Be("\u8CC7\u6599\u7248\u672C\u7E3D\u6578",d(s.version_count),{mono:!0})}
                ${Be("\u4E0B\u8F09\u57F7\u884C\u7E3D\u6578",d(s.run_count),{mono:!0})}
                ${Be("\u7248\u672C ID",`#${d(w.id)}`,{mono:!0})}
                ${Be("\u8CC7\u6599\u985E\u578B",x)}
                ${Be("\u4F86\u6E90\u66F4\u65B0\u65E5",w.update_date||"\u2014")}
                ${Be(`${x}\uFF0F\u689D\u6587`,`${d(w.law_count)} / ${d(w.article_count)}`)}
                ${Be("\u4E0B\u8F09\u6642\u9593",ye(w.downloaded_at),{mono:!0})}
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
          ${Je(u?"degraded":"operational",u?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${g("link",11)}Alias</span>
          <strong class="mono">${r(fe)}</strong>
          <span class="mono">\u2192 ${r(W)}</span>
          <span class="index-current-copy">v#${d(s.judgment_vector_version_id)} \xB7 ${r(s.judgment_vector_model||"\u2014")}</span>
        </div>
        ${Vo("\u7D22\u5F15\u8986\u84CB",y,`\u5DF2\u7D22\u5F15 ${d(i)} / ${d(o)} \u7B46 \xB7 \u5269\u9918 ${d(p)} \u7B46`,v)}
        <div class="data-version-facts">
          ${Be("Qdrant points",d(s.judgment_vector_points),{mono:!0})}
          ${Be("\u7D22\u5F15\u7248\u672C",`#${d(s.judgment_vector_version_id)} \xB7 ${s.judgment_vector_version_status||"legacy"}`,{mono:!0})}
          ${Be("\u524D\u4E00\u7248\u672C",s.judgment_vector_previous_version_id?`#${d(s.judgment_vector_previous_version_id)}`:"\u2014",{mono:!0})}
          ${Be("\u5F85\u88DC\uFF0F\u8B8A\u66F4\uFF0F\u5931\u6548",`${d(p)} / ${d(f)} / ${d(m)}`)}
          ${Be("\u6700\u8FD1\u7D22\u5F15",ye(s.judgment_indexed_at),{mono:!0})}
          ${Be("\u6A21\u578B",s.judgment_vector_model||"\u2014",{mono:!0})}
        </div>
        ${p>0?`<p class="data-version-note is-warn">${g("info",12)}\u5C1A\u6709 ${d(p)} \u7B46\u5224\u6C7A\u5C1A\u672A\u7D22\u5F15\uFF1B\u8ACB\u81F3\u300C\u8CC7\u6599\u8655\u7406 \u2192 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u63A5\u7E8C\u88DC\u9F4A\u3002</p>`:""}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${g("shield",14)}Qdrant \u6CD5\u898F\uFF0F\u547D\u4EE4\u5411\u91CF\u7D22\u5F15</span>
          ${Je(O?"degraded":"operational",O?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${g("link",11)}Alias</span>
          <strong class="mono">${r(L)}</strong>
          <span class="mono">\u2192 ${r(q)}</span>
          <span class="index-current-copy">v#${d(s.legal_article_vector_version_id||s.legal_index?.version_id)}</span>
        </div>
        ${Vo("\u689D\u6587\u7D22\u5F15\u8986\u84CB",oe,`\u5DF2\u7D22\u5F15 ${d(k)} / ${d(D)} \u689D`,be)}
        <div class="data-version-facts">
          ${Be("Qdrant points",d(k),{mono:!0})}
          ${Be("\u73FE\u884C\u689D\u6587",d(D),{mono:!0})}
          ${Be("\u5411\u91CF\u7DAD\u5EA6",d(s.legal_index?.dimension),{mono:!0})}
          ${Be("\u6700\u8FD1\u7D22\u5F15",ye(s.legal_article_indexed_at||s.legal_index?.indexed_at),{mono:!0})}
          ${Be("\u7D22\u5F15\u72C0\u614B",O?"stale":"fresh",{mono:!0})}
          ${Be("Collection",q,{mono:!0})}
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
          ${Be("\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C",_.status?F:"\u2014")}
          ${Be("\u6700\u8FD1\u57F7\u884C\u6642\u9593",ie?ye(ie):"\u2014",{mono:!0})}
          ${Be("\u6700\u8FD1\u57F7\u884C\u8017\u6642",_.duration_ms?ue(_.duration_ms):"\u2014",{mono:!0})}
          ${Be("\u6700\u8FD1\u57F7\u884C\u7248\u672C",_.version_id?`#${d(_.version_id)}`:"\u2014",{mono:!0})}
        </div>
        <p class="data-version-note">${g("info",12)}
          \u539F\u59CB Parquet \u4FDD\u7559 raw\uFF0Fdelta \u8207 manifest\uFF1BPostgreSQL \u63D0\u4F9B current metadata \u8207\u7248\u672C\u72C0\u614B\uFF1BQdrant \u53EA\u4FDD\u5B58\u5411\u91CF\u8207 payload\u3002
        </p>
      </section>
    </div>`}function Qp(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${g("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${d(t.run_count)} TOTAL</span>
    </div>
    ${Dp(e.recent_runs)}
  </section>`}function Jp(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function el(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function _s(e,t,s,a,n){let i=Jp(n);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${g(t,14)}${r(e)}</span>
      <strong>${r(s)}</strong>
    </div>
    ${el(n,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function Vp(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${g("layers",14)}Docker</span>
        ${Je("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${r(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,p=o.service?0:1;return l-p||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${r(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${r(i.service)}</span>`:""}</td>
        <td>${Je(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
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
  </section>`}function Wp(e){return`<div class="resource-section-head">
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
          ${Je(i)}
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
    ${el(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function Kp(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},n=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},p=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${g("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${qe(p)}</span>
    </div>
    <div class="storage-list">
      ${Ps("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${r(s.frontend_path||"\u2014")}</span>`,p)}
      ${Ps("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${r(s.backend_path||"\u2014")}</span>`,p)}
      ${Ps("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",n.layers_bytes,`Images ${qe(n.images_bytes)} \xB7 Containers ${qe(n.containers_bytes)} \xB7 Build cache ${qe(n.build_cache_bytes)}`,p)}
      ${Ps("PostgreSQL volume",o.size_bytes,`<span class="mono">${r(o.name||"\u2014")}</span>`,p)}
      ${Ps("Qdrant volume",l.size_bytes,`<span class="mono">${r(l.name||"\u2014")}</span>`,p)}
      ${Ps("Parquet",a.total_bytes,`\u6CD5\u898F ${qe(a.law_bytes)} \xB7 \u5224\u6C7A ${qe(a.judgment_bytes)}`,p)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${qe(p)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function Yp(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},n=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),p=Array.isArray(e.disk)?e.disk:[],f=p[0]||{},m=Number(o.total_bytes||f.total||0),y=m?l/m*100:0,b=[s.load_1,s.load_5,s.load_15].map(w=>w??"\u2014").join(" / "),u=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":ue(Number(t.uptime_seconds)*1e3),v=[f.label?_s("HDD \u5DF2\u4F7F\u7528","database",`${d(f.percent)}%`,`${qe(f.used)} / ${qe(f.total)} \xB7 \u5269\u9918 ${qe(f.free)}<br><span class="mono">${r(f.path||"")}</span>`,f.percent):"",l?_s("Judgment \u5143\u4EF6\u5408\u8A08","layers",qe(l),`\u7D04\u5360 HDD ${d(y)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,y):"",...p.slice(1).map(w=>_s(`\u786C\u789F \xB7 ${w.label}`,"layers",`${d(w.percent)}%`,`${qe(w.used)} / ${qe(w.total)} \xB7 \u5269\u9918 ${qe(w.free)}<br><span class="mono">${r(w.path||"")}</span>`,w.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${ye(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${_s("CPU \u4F7F\u7528\u7387","cpu",`${d(s.percent)}%`,`${d(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${d(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${r(b)}`,s.percent)}
      ${_s("\u8A18\u61B6\u9AD4","server",`${d(a.percent)}%`,`${qe(a.used)} / ${qe(a.total)} \xB7 \u53EF\u7528 ${qe(a.available)}`,a.percent)}
      ${_s("Swap","layers",`${d(n.percent)}%`,`${qe(n.used)} / ${qe(n.total)}`,n.percent)}
      ${_s("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${d(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${r(u)}<br>${r(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${v||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${Kp(e)}
    ${Vp(e)}
    ${Wp(e)}`}function Wo(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function Xp(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SYSTEM RESOURCE USAGE</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Ce({tone:"danger",title:"\u8CC7\u6E90 API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-resources-retry">
          ${g("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Zp(e){return e.status==="operational"?{label:"\u5DF2\u9023\u7DDA",badge:"badge-ok"}:{label:"\u7121\u6CD5\u9023\u7DDA",badge:"badge-danger"}}function em(e,t){let s=Zp(e),a=Array.isArray(e.models)?e.models:[],n=a.length?a.map(i=>{let o=String(i.name||""),l=e.chat_model===o,p=e.embedding_model===o,f=i.size?qe(i.size):"",m=i.modified_at?ye(i.modified_at):"",y=new Set((i.capabilities||[]).map(u=>String(u||"").toLowerCase())),b=[];return i.supports_chat===!0&&b.push(["Chat","badge-ok"]),y.has("embedding")&&b.push(["Embedding","badge-info"]),y.has("vision")&&b.push(["Vision","badge-neutral"]),y.has("tools")&&b.push(["Tools","badge-neutral"]),y.has("thinking")&&b.push(["Thinking","badge-neutral"]),y.has("speech")&&b.push(["Speech","badge-warn"]),i.is_reranker&&b.push(["Reranker","badge-neutral"]),b.length||b.push([i.capability_status==="untested"?"\u672A\u6E2C\u8A66":"\u7121 chat \u80FD\u529B","badge-neutral"]),`<div class="ollama-model-row">
            <div class="ollama-model-main">
              <strong>${r(o)}</strong>
              <span class="ollama-model-meta">${[f,m].filter(Boolean).map(u=>r(u)).join(" \xB7 ")||"\u2014"}</span>
              <div class="ollama-model-capabilities">${b.map(([u,v])=>`<span class="badge ${v}">${r(u)}</span>`).join("")}</div>
            </div>
            <div class="ollama-model-roles">
              ${l?'<span class="badge badge-ok">\u804A\u5929</span>':""}
              ${p?'<span class="badge badge-ok">\u5D4C\u5165</span>':""}
            </div>
            <div class="ollama-model-actions">
              <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="${l?"clear-model":"select-model"}" data-id="${e.id}" data-model="${r(o)}" data-role="chat">
                ${l?"\u65B7\u958B\u804A\u5929":"\u9023\u63A5\u804A\u5929"}
              </button>
              <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="${p?"clear-model":"select-model"}" data-id="${e.id}" data-model="${r(o)}" data-role="embedding">
                ${p?"\u65B7\u958B\u5D4C\u5165":"\u9023\u63A5\u5D4C\u5165"}
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
  </article>`}function tm(e,t,s,a){if(s)return`<div class="report-card">
      ${Ce({tone:"danger",title:"Model Provider \u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${g("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=e||{hosts:[],active_host_id:null},i=Array.isArray(n.hosts)?n.hosts:[],o=a?i.find(f=>Number(f.id)===Number(a)):null,l=o?o.base_url.replace(new RegExp(`:${o.port}$`),""):"http://127.0.0.1",p=o?"\u5132\u5B58\u8B8A\u66F4":"\u65B0\u589E\u4E3B\u6A5F";return`<div class="report-card ollama-card">
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
          <button class="btn btn-primary btn-sm" type="submit">${g("check",13)}<span>${p}</span></button>
          ${o?'<button class="btn btn-ghost btn-sm" type="button" data-ollama-action="cancel-host-edit">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
        </div>
      </form>
      ${t?'<div class="ollama-loading"><span class="spinner"></span><span>\u8B80\u53D6 llama-server \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span></div>':i.length?`<div class="ollama-host-list">${i.map(f=>em(f,a)).join("")}</div>`:ct({iconName:"server",title:"\u5C1A\u672A\u8A2D\u5B9A llama-server \u4E3B\u6A5F",text:"\u8ACB\u5728\u4E0A\u65B9\u8F38\u5165\u7DB2\u5740\u8207 Port \u65B0\u589E\uFF0C\u6216\u4F7F\u7528 .env \u7684\u9810\u8A2D\u9023\u7DDA\u3002"})}
      <p class="report-sub" style="margin-top:12px">\u8A2D\u70BA\u804A\u5929\u6216\u5D4C\u5165\u6A21\u578B\u5F8C\uFF0C\u7CFB\u7D71\u6703\u4F7F\u7528\u76EE\u524D\u4E3B\u6A5F\u7684\u5C0D\u61C9\u6A21\u578B\u57F7\u884C AI \u51FA\u984C\u8207 RAG\uFF1B\u672A\u8A2D\u5B9A\u6642\u6CBF\u7528 .env \u7684 LLM_MODEL\uFF0FEMBEDDING_MODEL\u3002</p>
    </div>
  </div>`}function sm(e,t,s){let a=e?.data||{},n=e?Ct(e.status):null,i=s?Ct(s.status):null,o={overview:n?`<span class="badge ${n.tone==="ok"?"badge-ok":n.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(n.label)}</span>`:"",resources:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(i.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${d(a.version_count)}</span>`,tests:'<span class="badge badge-neutral badge-mono">TEST</span>',"local-model":'<span class="badge badge-neutral badge-mono">LLAMA-SERVER</span>',runs:`<span class="badge badge-neutral badge-mono">${d(a.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${Xo.map(l=>{let p=l.id===t;return`<button class="status-tab${p?" is-active":""}" type="button"
          data-status-tab="${l.id}" ${p?'aria-current="page"':""}>
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
      <span class="mono">${r(e?ye(e.checked_at):"\u2014")}</span>
    </div>`}function am(e,t,s,a,n,i,o){if(e==="resources")return s?Yp(s):a?Wo():n?Xp(n):Wo();if(e==="local-model"){let l=i||{},p=!!l.loading||!l.hosts&&!l.error;return tm(l.hosts||null,p,l.error||null,l.editingId||null)}return e==="architecture"?zp(t):e==="api"?Gp(t):e==="data"?Up(t,o):e==="runs"?Qp(t):Hp(t)}function nm(){return`<div class="status-hero">
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
    </div>`}function Ko(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u5FEB\u53D6\u6216\u63A8\u6E2C\u7684\u670D\u52D9\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Ce({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${g("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function rm(e,t){let s=!1,a=null,n=null,i="overview",o=null,l=!1,p=null,f=null,m=!1,y=null,b=null,u=null,v=!1,w=null,_=!1,x=!1,S=null,k=0,D="",oe="",O=performance.now(),be=new Date().toISOString(),fe=!1;e.innerHTML=`<section class="page status-page">
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
      <section class="status-panel" id="status-content">${nm()}</section>
    </div>
  </section>`;let W=e.querySelector("#status-nav"),L=e.querySelector("#status-content"),q=e.querySelector("#refresh-status"),E=e.querySelector("#auto-refresh"),X=()=>{if(k+=1,typeof S=="function")try{S()}catch{}S=null,_=!1,x=!1},ee=async()=>{let K=++k;x=!0,oe="",L.innerHTML="";try{let re=await yr(L,{setTitle:()=>{}},{embedded:!0});if(K!==k||i!=="tests"){typeof re=="function"&&re();return}S=typeof re=="function"?re:null,_=!0}catch(re){K===k&&i==="tests"&&(L.innerHTML=Ko(re))}finally{K===k&&(x=!1)}},F=()=>{if(!n)return;let K=sm(n,i,o);if(K!==D&&(W.innerHTML=K,D=K),i==="tests"){!_&&!x&&ee();return}X();let re=am(i,n,o,l,p,{hosts:f,loading:m,error:y,editingId:b},{info:u,loading:v,error:w});re!==oe&&(L.innerHTML=re,oe=re)},ie=async({quiet:K=!1}={})=>{if(!l){l=!0,p=null,i==="resources"&&!o&&F();try{let re=await V.systemUsage();if(s)return;o=re}catch(re){if(s)return;p=re,K||I(re.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{s||(l=!1,i==="resources"&&F())}}},_e=async({quiet:K=!1}={})=>{if(!v){v=!0,w=null,i==="data"&&!u&&F();try{let re=await gi();if(s)return;u=re}catch(re){if(s)return;w=re,K||I(re.message||"\u7121\u6CD5\u8B80\u53D6 IndexedDB\u3002","danger")}finally{s||(v=!1,i==="data"&&F())}}},z=async({quiet:K=!1}={})=>{if(!m){m=!0,y=null,i==="local-model"&&!f&&F();try{let re=await V.ollamaHosts();if(s)return;f=re}catch(re){if(s)return;y=re,K||I(re.message||"\u7121\u6CD5\u53D6\u5F97 llama-server \u4E3B\u6A5F\u3002","danger")}finally{s||(m=!1,i==="local-model"&&F())}}},ve=async()=>{await z({quiet:!0}),await Z({quiet:!0})},Z=async({quiet:K=!1,status:re=null}={})=>{K||(q.disabled=!0,Me(q,!0,"\u6AA2\u67E5\u4E2D\u2026"));let me=performance.now(),he=new Date().toISOString(),ke=me,xe=he;try{let Ee=re||await V.status();if(ke=performance.now(),xe=new Date().toISOString(),s)return;let Oe=!re&&!fe?Math.max(0,me-O):0;Ee.page_pipeline=Ee.pipeline||!n?.page_pipeline?Fp(Ee,{initMs:Oe,initStartedAt:be,requestStartedAt:he,requestFinishedAt:xe,requestMs:ke-me}):n.page_pipeline,fe=!0,n=Ee,F(),K||I("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(Ee){if(s)return;i!=="tests"&&(oe="",L.innerHTML=Ko(Ee)),K||I(Ee.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(q.disabled=!1,Me(q,!1))}},Se=async({quiet:K=!1,status:re=null}={})=>{if(await Z({quiet:K,status:re}),i==="resources"&&await ie({quiet:K}),i==="local-model"&&await z({quiet:K}),!K&&i==="tests"){let me=L.querySelector("#tests-refresh");me&&me.click()}};W.addEventListener("click",K=>{let re=K.target.closest("[data-status-tab]");if(!re)return;let me=re.dataset.statusTab;Xo.some(he=>he.id===me)&&(i=me,F(),i==="resources"&&!o&&!l&&ie(),i==="data"&&!u&&!v&&_e(),i==="local-model"&&z())}),L.addEventListener("click",K=>{K.target.closest("#status-retry")&&Z(),K.target.closest("#status-resources-retry")&&ie()}),L.addEventListener("click",async K=>{let re=K.target.closest("[data-ollama-action]");if(!re)return;let me=re.dataset.ollamaAction,he=Number(re.dataset.id||0);if(me==="refresh-hosts"){await z();return}if(me==="edit-host"){b=he,F(),e.querySelector(".ollama-host-form")?.scrollIntoView({behavior:"smooth",block:"center"});return}if(me==="cancel-host-edit"){b=null,F();return}if(me==="delete-host"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 llama-server \u4E3B\u6A5F #${he}\uFF1F`))return;try{await V.deleteOllamaHost(he),Number(b)===he&&(b=null),I("llama-server \u4E3B\u6A5F\u5DF2\u522A\u9664\u3002","info"),await ve()}catch(ke){I(ke.message||"\u522A\u9664\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(me==="activate-host"){try{await V.activateOllamaHost(he),I("\u5DF2\u5207\u63DB\u4F7F\u7528\u7684 llama-server \u4E3B\u6A5F\u3002","ok"),await ve()}catch(ke){I(ke.message||"\u5207\u63DB\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(me==="deactivate-host"){try{await V.deactivateOllamaHosts(),I("\u5DF2\u505C\u7528\u6307\u5B9A\u7684 llama-server \u4E3B\u6A5F\uFF0C\u5C07\u6CBF\u7528 .env \u8A2D\u5B9A\u3002","info"),await ve()}catch(ke){I(ke.message||"\u505C\u7528\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(me==="check-capabilities"){Me(re,!0,"\u6AA2\u67E5\u4E2D\u2026");try{await V.checkOllamaCapabilities(),I("\u5DF2\u66F4\u65B0\u6240\u6709\u4E3B\u6A5F\u7684\u6A21\u578B\u80FD\u529B\u3002","ok",4e3),await ve()}catch(ke){I(ke.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u80FD\u529B\u3002","danger",7e3)}finally{Me(re,!1)}return}if(me==="select-model"||me==="clear-model"){let ke=String(re.dataset.model||""),xe=String(re.dataset.role||"");try{me==="select-model"?(await V.selectOllamaModel(he,{model:ke,role:xe}),I(`\u5DF2\u8A2D\u5B9A ${xe==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\uFF1A${ke}`,"ok")):(await V.clearOllamaModel(he,{model:ke,role:xe}),I(`\u5DF2\u53D6\u6D88 ${xe==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\u3002`,"info")),await ve()}catch(Ee){I(Ee.message||"\u6A21\u578B\u8A2D\u5B9A\u5931\u6557\u3002","danger")}}}),L.addEventListener("submit",async K=>{let re=K.target.closest("form[data-ollama-form='host']");if(!re)return;K.preventDefault();let me=new FormData(re),he=Number(me.get("host_id")||0),ke={name:String(me.get("name")||"").trim(),url:String(me.get("url")||"").trim(),port:Number(me.get("port")||11434)};try{he?(await V.updateOllamaHost(he,ke),I("llama-server \u4E3B\u6A5F\u5DF2\u66F4\u65B0\u3002","ok")):(await V.addOllamaHost(ke),I("llama-server \u4E3B\u6A5F\u5DF2\u65B0\u589E\u3002","ok")),b=null,await ve()}catch(xe){let Ee=xe.detail||xe.payload?.detail,Oe=Ee?.errors?.join(" \xB7 ")||Ee?.message||xe.message||"\u5132\u5B58\u4E3B\u6A5F\u5931\u6557\u3002";I(Oe,"danger",8e3)}}),L.addEventListener("toggle",K=>{let re=K.target.closest?.(".status-wf-stage[data-status-wf-stage]");if(!re||!L.contains(re))return;let me=re.dataset.statusWfStage||"";me&&(re.open?wr.add(me):wr.delete(me))},!0),q.addEventListener("click",()=>Se());let pe=()=>{a&&(a(),a=null)};return E.addEventListener("change",()=>{pe(),E.checked&&(a=ht("status",(K,re)=>{s||Se({quiet:!0,status:re?.snapshot||null})}),Se({quiet:!0}),I("\u5DF2\u555F\u7528\u5F8C\u7AEF\u63A8\u9001\u81EA\u52D5\u66F4\u65B0\uFF08\u6BCF 30 \u79D2\uFF09\u3002","info",2200))}),await Z({quiet:!0}),_e({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,X(),pe()}}var tl="home",en={home:{page:Pn,title:"Judgment RAG Console \xB7 \u6CD5\u898F\u8207\u5224\u6C7A\u6AA2\u7D22"},rag:{page:sr,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:Jn,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:$r,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:Zn,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:gr,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:_r,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:Ka,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"}},kr=document.getElementById("app-main"),Xa=null,Za=0;function xr(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||tl;return Object.prototype.hasOwnProperty.call(en,t)?t:tl}function im(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function om(e){return`<section class="page">
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
  </section>`}async function Sr(){let e=xr(),t=++Za;if(im(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof Xa=="function"){try{Xa()}catch{}Xa=null}document.title=en[e].title;let s={route:e,navigate(a){en[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===Za&&a&&(document.title=a)}};try{let a=en[e].page.render(kr,s);ai(),window.scrollTo({top:0,behavior:"auto"}),kr.focus({preventScroll:!0});let n=await a;if(t!==Za){typeof n=="function"&&n();return}Xa=typeof n=="function"?n:null}catch(a){if(t!==Za)return;console.error("Failed to render route",e,a),kr.innerHTML=om(a);let n=document.getElementById("route-retry");n&&n.addEventListener("click",()=>Sr()),I("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function lm(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable))return;let a=xr(),n=a==="home"?"home-question":a==="rag"?"rag-question":"";if(!n)return;let i=document.getElementById(n);i&&(e.preventDefault(),i.focus())})}function cm(){let e=document.querySelector('[data-route="processing"]');if(!e)return;let t=e.querySelector(".nav-update-badge");t||(t=document.createElement("span"),t.className="nav-update-badge",t.hidden=!0,e.appendChild(t));let s=0,a=0,n=0,i=()=>{let l=[];if(s>0&&l.push(`\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0F\u5224\u6C7A\u6709 ${s} \u9805\u4F86\u6E90\u66F4\u65B0`),a>0&&l.push(`\u5224\u6C7A\u532F\u5165\u5F85\u8655\u7406 ${a} \u500B\u6708`),n>0&&l.push(`Qdrant \u5411\u91CF\u7D22\u5F15\u5F85\u88DC ${n} \u500B\u6708`),!l.length){t.hidden=!0;return}let p=(s>0?1:0)+(a>0?1:0)+(n>0?1:0);t.textContent=String(p===1?s||a||n:p),t.title=l.join("\uFF1B"),t.hidden=!1},o=async(l=null)=>{try{let p=l||await V.updatesStatus();s=Number(p.update_count)||0,p&&Object.prototype.hasOwnProperty.call(p,"import_pending_count")&&(a=Number(p.import_pending_count)||0),p&&Object.prototype.hasOwnProperty.call(p,"index_pending_count")&&(n=Number(p.index_pending_count)||0),i()}catch{t.hidden=!0}};o(),ht("updates",(l,p)=>o(p?.snapshot||null)),window.addEventListener("judgment:processing-pending",l=>{a=Number(l.detail?.count)||0,l.detail&&Object.prototype.hasOwnProperty.call(l.detail,"index_pending")&&(n=Number(l.detail.index_pending)||0),i()}),window.addEventListener("judgment:updates-changed",()=>o())}function sl(){zr(),ri(),lm(),cm(),window.addEventListener("hashchange",Sr),Sr(),ga()&&window.setTimeout(()=>{xr()==="rag"&&(window.location.hash="#/tests")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",sl):sl();})();
