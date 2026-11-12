(()=>{var Br=Object.defineProperty;var It=(e,t)=>{for(var s in t)Br(e,s,{get:t[s],enumerable:!0})};var ta="judgment.api_base",sa="http://127.0.0.1:9200",We=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function Ja(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function jt(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${Ja(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function aa(e){let t=jt(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function na(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?jt(e.get("api")):null}catch{return null}}function ra(){try{let e=window.localStorage.getItem(ta);return e===null?null:jt(e)}catch{return null}}function ia(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return jt(e||"")}function Lt(){let e=na();if(e!==null)return e;let t=ra();if(t!==null)return t;let s=ia();return s||(window.location.protocol==="file:"?sa:"")}function Dr(){if(na()!==null)return!0;let e=ra();return e!==null?!!e:!!ia()}function Mt(){return na()!==null?"query":ra()!==null?"storage":ia()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function qs(){return Dr()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!Ja(window.location.hostname)}function oa(e){let t=jt(e);try{t?window.localStorage.setItem(ta,t):window.localStorage.removeItem(ta)}catch{}return t}function Ot(e=Lt()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function st(e,t=Lt()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function la(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function Z(e,t={}){let s=Lt(),a=new AbortController,r=t.timeout===void 0?3e4:t.timeout,i=r>0?window.setTimeout(()=>a.abort(),r):null,o=Date.now(),l=performance.now(),d=t.requestId||Va(),p={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":d,"X-Judgment-Client-Started-At":String(o),...t.headers||{}},v;try{v=await fetch(st(e,s),{...t,headers:p,signal:a.signal})}catch(w){throw w.name==="AbortError"?new We("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new We(la(s),0,w)}finally{i&&window.clearTimeout(i)}let k=null;if((v.headers.get("content-type")||"").includes("application/json"))try{k=await v.json()}catch{k=null}else try{k=await v.text()}catch{k=null}let b=performance.now(),h=v.headers.get("X-Judgment-Request-Id")||d;if(t.trackClient!==!1&&h){let w=Math.round(performance.now()-l);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{Wa({request_id:h,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:w,render_ms:Math.max(0,Math.round(performance.now()-b)),status:v.ok?"success":"failed"})})})}if(!v.ok){let w=k&&typeof k=="object"?k.detail||k.message:k,A=typeof w=="string"&&w?w:`\u4F3A\u670D\u5668\u56DE\u61C9 ${v.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new We(A,v.status,w)}return k}function Va(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function Wa(e){try{fetch(st("/api/performance/client",Lt()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),keepalive:!0}).catch(()=>{})}catch{}}async function Ka(e){let t=jt(e);if(!aa(t))throw new We("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,r=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(st("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new We(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof We?i:i.name==="AbortError"?new We("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new We(la(t),0,i)}finally{window.clearTimeout(r)}}var F={health(){return Z("/api/health")},status(){return Z("/api/status",{trackClient:!1})},ollamaHosts(){return Z("/api/ollama/hosts",{timeout:3e4,trackClient:!1})},addOllamaHost(e){return Z("/api/ollama/hosts",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},updateOllamaHost(e,t){return Z(`/api/ollama/hosts/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},deleteOllamaHost(e){return Z(`/api/ollama/hosts/${encodeURIComponent(e)}`,{method:"DELETE",timeout:3e4,trackClient:!1})},activateOllamaHost(e){return Z(`/api/ollama/hosts/${encodeURIComponent(e)}/activate`,{method:"POST",timeout:3e4,trackClient:!1})},deactivateOllamaHosts(){return Z("/api/ollama/hosts/deactivate",{method:"POST",timeout:3e4,trackClient:!1})},reorderOllamaHosts(e){return Z("/api/ollama/hosts/reorder",{method:"POST",body:JSON.stringify({host_ids:e}),timeout:3e4,trackClient:!1})},checkOllamaCapabilities(){return Z("/api/ollama/hosts/capabilities/test",{method:"POST",timeout:18e4,trackClient:!1})},selectOllamaModel(e,t){return Z(`/api/ollama/hosts/${encodeURIComponent(e)}/models/select`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},clearOllamaModel(e,t){return Z(`/api/ollama/hosts/${encodeURIComponent(e)}/models/clear`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},systemUsage(){return Z("/api/system-usage",{trackClient:!1})},indexVersions(){return Z("/api/index-versions",{trackClient:!1})},indexVersion(e){return Z(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return Z(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return Z(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return Z("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){let t=new URLSearchParams({repair:e?"true":"false"});return Z(`/api/index-alias/reconcile?${t.toString()}`,{trackClient:!1})},catalog(){return Z("/api/catalog")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return Z("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},dataSuggest({kind:e,query:t="",limit:s=12}){let a=new URLSearchParams({kind:e,query:t,limit:String(s)});return Z(`/api/data/suggest?${a.toString()}`,{timeout:45e3,trackClient:!1})},schemaSuggest({database:e,table:t,column:s,query:a,limit:r=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(r)});return Z(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let r=new URLSearchParams({law_key:e});return t&&r.set("source_type",t),s&&r.set("version_id",String(s)),a&&r.set("article_no",String(a)),Z(`/api/law?${r.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),Z(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return Z("/api/test-mode",{trackClient:!1})},llmModels(){return Z("/api/llm/models",{timeout:6e4,trackClient:!1})},testLlmModels(){return Z("/api/llm/models/test",{method:"POST",timeout:12e4,trackClient:!1})},selectLlmModel(e,t=null){return Z("/api/llm/model",{method:"POST",body:JSON.stringify({model:e,host_id:t}),timeout:3e4,trackClient:!1})},setTestMode(e){return Z("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return Z(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return Z("/api/test-runs/current",{trackClient:!1})},testRun(e){return Z(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return Z("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[r,i]of Object.entries(e))i==null||i===""||a.set(r,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),Z(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return Z("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return Z("/api/processing",{timeout:45e3,trackClient:!1})},judgmentDownloadStatus(){return Z("/api/judgment-download/status",{timeout:3e4,trackClient:!1})},versioningSummary(){return Z("/api/versioning/summary",{trackClient:!1})},updatesStatus(){return Z("/api/updates/status",{trackClient:!1})},checkCourts(){return Z("/api/courts/check",{timeout:6e4,trackClient:!1})},checkLawVersions(){return Z("/api/law-versions/check",{timeout:6e4,trackClient:!1})},checkUpdates(e=[]){let t=Array.isArray(e)&&e.length?{source_types:e}:{};return Z("/api/updates/check",{method:"POST",body:JSON.stringify(t),timeout:12e4,trackClient:!1})},versioningSnapshots(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.limit&&t.set("limit",String(e.limit)),Z(`/api/versioning/judgments/snapshots?${t.toString()}`,{trackClient:!1})},versioningChanges(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit)),Z(`/api/versioning/judgments/changes?${t.toString()}`,{trackClient:!1})},versioningJudgment(e){return Z(`/api/versioning/judgments/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVersion(e){return Z(`/api/versioning/judgments/versions/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVector(e,t){return Z(`/api/versioning/judgments/${encodeURIComponent(e)}/vectors/${encodeURIComponent(t)}`,{trackClient:!1})},versioningAudit(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit||500)),Z(`/api/versioning/audit?${t.toString()}`,{trackClient:!1})},questionBankStats(){return Z("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[r,i]of Object.entries(e))if(!(i==null||i==="")){if(Array.isArray(i)){for(let o of i)o==null||o===""||a.append(r,String(o));continue}a.set(r,String(i))}return a.set("limit",String(t)),a.set("offset",String(s)),Z(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankTags(e="",t=12){let s=new URLSearchParams({query:e,limit:String(t)});return Z(`/api/question-bank/tags?${s.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return Z(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return Z("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},createQuestionBankItemWithAI(e){return Z("/api/question-bank/ai-items",{method:"POST",body:JSON.stringify(e),timeout:42e4,trackClient:!1})},updateQuestionBankItem(e,t){return Z(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return Z(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},restoreQuestionBankItem(e){return Z(`/api/question-bank/items/${encodeURIComponent(e)}/restore`,{method:"POST",timeout:45e3,trackClient:!1})},submitQuestionBankItemForReview(e){return Z(`/api/question-bank/items/${encodeURIComponent(e)}/submit`,{method:"POST",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return Z(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return Z("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return Z(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return Z("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return Z(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return Z("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},benchmarkSuiteLatestAnswers(e){return Z(`/api/benchmark/suites/${encodeURIComponent(e)}/latest-answers`,{timeout:45e3,trackClient:!1})},removeBenchmarkSuiteItem(e,t){return Z(`/api/benchmark/suites/${encodeURIComponent(e)}/items/${encodeURIComponent(t)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return Z("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return Z(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return Z(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return Z(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return Z("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return Z(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return Z(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return Z(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return Z("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return Z(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return Z("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return Z(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return Z("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return Z("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return Z("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onToken:r=null,onTokenReset:i=null}={}){let o=Lt(),l=new AbortController,d=t?0:3e5,p=d>0?window.setTimeout(()=>l.abort(),d):null,v=Date.now(),k=performance.now(),$=Va(),b={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":$,"X-Judgment-Client-Started-At":String(v)},h;try{h=await fetch(st("/api/rag/query/stream",o),{method:"POST",headers:b,body:JSON.stringify({question:e}),signal:l.signal})}catch(te){throw te.name==="AbortError"?new We("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new We(la(o),0,te)}finally{p&&window.clearTimeout(p)}if(!h.ok){let te=null;try{te=await h.json()}catch{te=null}let de=te&&typeof te=="object"&&te.detail?String(te.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${h.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new We(de,h.status,te)}if(!h.body)throw new We("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let w=h.body.getReader(),A=new TextDecoder,B="",Q=null,D=null;try{for(;;){let{value:te,done:de}=await w.read();if(de)break;B+=A.decode(te,{stream:!0});let ke=B.indexOf(`

`);for(;ke>=0;){let we=B.slice(0,ke).replace(/\r/g,"");B=B.slice(ke+2);let W="message",E=[];for(let S of we.split(`
`))S.startsWith("event:")?W=S.slice(6).trim():S.startsWith("data:")&&E.push(S.slice(5).trimStart());if(E.length){let S=null;try{S=JSON.parse(E.join(`
`))}catch{S=null}if(S)if(W==="step"&&typeof s=="function")try{s(S)}catch{}else if(W==="partial"){if(typeof a=="function")try{a(S)}catch{}}else if(W==="token"){if(typeof r=="function")try{r(String(S.text||""))}catch{}}else if(W==="token_reset"){if(typeof i=="function")try{i()}catch{}}else W==="result"?Q=S:W==="error"&&(D=new We(S.message||S.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,S))}ke=B.indexOf(`

`)}}}finally{try{await w.cancel()}catch{}p&&window.clearTimeout(p)}if(D)throw D;if(!Q)throw new We("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let H=Math.round(performance.now()-k);return Wa({request_id:$,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:H,render_ms:0,status:"success"}),Q&&typeof Q=="object"&&(Q._client_request_id=$),Q}};var Fr={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Hr={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},zr={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},Ur={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Ya={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',more:'<circle cx="4.2" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="19.8" cy="12" r="2.6" fill="currentColor" stroke="none"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function n(e){return String(e??"").replace(/[&<>"']/g,t=>Fr[t])}function m(e,t=16,s=""){let a=Ya[e]||Ya.info;return`<svg${s?` class="${n(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function c(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function be(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function ca(e){if(e instanceof Date)return e;if(typeof e=="number"){let r=new Date(e);return Number.isNaN(r.getTime())?null:r}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function vt(e){let t=ca(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?n(e):"\u2014"}function $e(e){let t=ca(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?n(e):"\u2014"}function ts(e){let t=ca(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:vt(t)}function ie(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function ht(e){return Hr[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Le(e,t){let s=ht(e);return`<span class="badge ${zr[s.tone]}"><span class="status-dot ${Ur[s.tone]}"></span>${n(t||s.label)}</span>`}function Qr(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${n(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function As(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function js(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return Le(String(e));case"source":return Qr(String(e));case"number":return`<span class="mono">${c(e)}</span>`;case"duration":return`<span class="mono">${ie(e)}</span>`;case"datetime":return`<span class="mono">${$e(e)}</span>`;case"date":return`<span class="mono">${vt(e)}</span>`;case"url":{let s=String(e),a=As(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${n(s)}" target="_blank" rel="noopener noreferrer" title="${n(s)}">${m("external",10)}${n(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${n(s)}">${n(As(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(As(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(As(s,90))}</span>`}}}function ye({tone:e="info",title:t,text:s,iconName:a="info"}){let r=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${r==="i"?"i":m(r,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${n(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function Ke({iconName:e="search",title:t,text:s="",actions:a="",className:r=""}){return`<div class="empty-state ${r}">
    <span class="empty-icon">${m(e,24)}</span>
    <h3 class="empty-title">${n(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function pe(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${n(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function L(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let r={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${r[t]||"i"}</span>
    <div class="toast-body">${n(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function ss(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function $t(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),r=URL.createObjectURL(a),i=document.createElement("a");i.href=r,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(r),1e3)}var Za="judgment.theme",da="nvidia",en=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#171717","#0070f3","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#1d1d1f","#0071e3","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#5e6ad2","#010102","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#f24e1e","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#191918","#0075de","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],ua=new Map(en.map(e=>[e.id,e]));function Gr(e){return ua.has(e)}function Jr(e){return ua.get(e)||ua.get(da)}function Vr(){try{let e=window.localStorage.getItem(Za);return Gr(e)?e:da}catch{return da}}function Xa(e,{persist:t=!0}={}){let s=Jr(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");if(a&&a.setAttribute("content",s.metaColor),document.querySelectorAll(".theme-option").forEach(r=>{let i=r.dataset.themeId===s.id;r.classList.toggle("is-active",i),r.setAttribute("aria-checked",i?"true":"false")}),t)try{window.localStorage.setItem(Za,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}function Wr(e){let t=en.map((s,a)=>{let r=s.swatches.map(i=>`<i style="--swatch:${n(i)}"></i>`).join("");return`<button class="theme-option" type="button" role="menuitemradio"
        data-theme-id="${s.id}" aria-checked="false">
        <span class="theme-option-index">${String(a+1).padStart(2,"0")}</span>
        <span class="theme-option-body">
          <span class="theme-option-name">${n(s.name)}</span>
          <span class="theme-option-desc">${n(s.description)}</span>
        </span>
        <span class="theme-option-swatches" aria-hidden="true">${r}</span>
        <span class="theme-option-check" aria-hidden="true">${m("check",14)}</span>
      </button>`}).join("");e.innerHTML=`<div class="style-menu-head">
      <strong>\u9078\u64C7\u4ECB\u9762\u98A8\u683C</strong>
      <span>10 \u7A2E\u79D1\u6280\u54C1\u724C\u8A9E\u8A00</span>
    </div>${t}`}function tn(){let e=document.getElementById("style-picker"),t=document.getElementById("style-trigger"),s=document.getElementById("style-menu");if(!e||!t||!s)return;Wr(s),Xa(Vr(),{persist:!1});let a=()=>Array.from(s.querySelectorAll(".theme-option")),r=()=>{s.hidden=!1,t.setAttribute("aria-expanded","true");let o=s.querySelector(".theme-option.is-active")||a()[0];o&&o.focus()},i=({restoreFocus:o=!1}={})=>{s.hidden||(s.hidden=!0,t.setAttribute("aria-expanded","false"),o&&t.focus())};t.addEventListener("click",()=>{s.hidden?r():i({restoreFocus:!0})}),t.addEventListener("keydown",o=>{(o.key==="ArrowDown"||o.key==="ArrowUp")&&(o.preventDefault(),r())}),s.addEventListener("click",o=>{let l=o.target.closest(".theme-option");l&&(Xa(l.dataset.themeId),i({restoreFocus:!0}))}),s.addEventListener("keydown",o=>{let l=a(),d=l.indexOf(document.activeElement);if(o.key==="Escape"){o.preventDefault(),i({restoreFocus:!0});return}if(o.key==="ArrowDown"||o.key==="ArrowUp"){o.preventDefault();let p=o.key==="ArrowDown"?1:-1,v=l[(d+p+l.length)%l.length];v&&v.focus();return}if(o.key==="Home"||o.key==="End"){o.preventDefault();let p=o.key==="Home"?l[0]:l[l.length-1];p&&p.focus()}}),document.addEventListener("pointerdown",o=>{e.contains(o.target)||i()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&i()})}var Ma={};It(Ma,{render:()=>No});var Kr="judgment-console";var tt="query_history",Tt="settings",Et="audit_events";var Ge={history:[],settings:new Map,audit:[],nextId:1},Ls=null,Je=!("indexedDB"in window);function yt(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function at(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function lt(){return Ls||(Ls=new Promise((e,t)=>{if(!("indexedDB"in window)){Je=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(Kr,2)}catch(a){Je=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(tt)){let r=a.createObjectStore(tt,{keyPath:"id",autoIncrement:!0});r.createIndex("created_at","created_at"),r.createIndex("kind","kind")}if(a.objectStoreNames.contains(Tt)||a.createObjectStore(Tt,{keyPath:"key"}),!a.objectStoreNames.contains(Et)){let r=a.createObjectStore(Et,{keyPath:"key"});r.createIndex("created_at","created_at"),r.createIndex("dataset","dataset"),r.createIndex("jid","jid"),r.createIndex("issue_month","issue_month")}},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{Je=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{Je=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),Ls)}function sn(){return"indexedDB"in window}function an(){return Je}function Ms(){return Je?"memory":"indexeddb"}function Yr(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},turns:Array.isArray(e.turns)?e.turns:[],pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t,updated_at:e.updated_at||t}}async function Xr(){try{let t=(await lt()).transaction(tt,"readwrite"),s=t.objectStore(tt),a=await yt(s.count());if(a>120){let r=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let d=i.result;if(!d||r<=0){o();return}d.delete(),r-=1,d.continue()},i.onerror=()=>l(i.error)})}await at(t)}catch{Je=!0}}async function us(e){let t=Yr(e);try{let a=(await lt()).transaction(tt,"readwrite"),r=a.objectStore(tt),i=await yt(r.add(t));return await at(a),await Xr(),i}catch{Je=!0;let a=Ge.nextId++;return Ge.history.push({id:a,...t}),Ge.history.length>120&&Ge.history.shift(),a}}async function ps(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let r=(await lt()).transaction(tt,"readwrite"),i=r.objectStore(tt),o=await yt(i.get(s));if(!o)return await at(r),null;let l={...o,...t,id:s};return await yt(i.put(l)),await at(r),l}catch{Je=!0;let r=Ge.history.findIndex(i=>Number(i.id)===s);return r===-1?null:(Ge.history[r]={...Ge.history[r],...t,id:s},Ge.history[r])}}async function nn(e){let t=Number(e);if(!Number.isFinite(t))return!1;try{let a=(await lt()).transaction(tt,"readwrite");return a.objectStore(tt).delete(t),await at(a),!0}catch{Je=!0;let a=Ge.history.findIndex(r=>Number(r.id)===t);return a===-1?!1:(Ge.history.splice(a,1),!0)}}async function Ts({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let r=(await lt()).transaction(tt,"readonly"),i=r.objectStore(tt),o=await yt(i.getAll());return await at(r),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,d)=>String(d.updated_at||d.created_at).localeCompare(String(l.updated_at||l.created_at))).slice(0,t)}catch{return Je=!0,Ge.history.filter(r=>s?`${r.kind} ${r.title} ${r.detail}`.toLowerCase().includes(s):!0).slice().sort((r,i)=>String(i.updated_at||i.created_at).localeCompare(String(r.updated_at||r.created_at))).slice(0,t)}}async function rn(){try{let t=(await lt()).transaction(tt,"readwrite");t.objectStore(tt).clear(),await at(t)}catch{Je=!0}Ge.history=[]}function Zr(e){let t=Number(e.id??e.event_id??0)||0,s=String(e.dataset||e.kind||"judgment"),a=String(e.key||`${s}:${t||`${Date.now()}:${Math.random().toString(36).slice(2)}`}`),r=String(e.jid||""),i=String(e.issue_month||""),o=String(e.change_type||""),l=String(e.detected_at||e.created_at||new Date().toISOString());return{key:a,event_id:t,dataset:s,jid:r,issue_month:i,change_type:o,title:String(e.title||r||i||"\u7248\u672C\u8B8A\u66F4"),detail:String(e.detail||[o,i,r].filter(Boolean).join(" \xB7 ")),created_at:l,payload:e}}async function ei(){try{let t=(await lt()).transaction(Et,"readwrite"),s=t.objectStore(Et),a=await yt(s.count());if(a>2e3){let r=a-2e3,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let d=i.result;if(!d||r<=0){o();return}d.delete(),r-=1,d.continue()},i.onerror=()=>l(i.error)})}await at(t)}catch{Je=!0}}async function on(e){let t=(Array.isArray(e)?e:[]).filter(s=>s&&typeof s=="object").map(Zr);if(!t.length)return 0;try{let a=(await lt()).transaction(Et,"readwrite"),r=a.objectStore(Et);for(let i of t)await yt(r.put(i));return await at(a),await ei(),t.length}catch{Je=!0;let a=new Map(Ge.audit.map(r=>[r.key,r]));for(let r of t)a.set(r.key,r);return Ge.audit=Array.from(a.values()).sort((r,i)=>String(i.created_at).localeCompare(String(r.created_at))).slice(0,2e3),t.length}}async function ln({keyword:e="",limit:t=200}={}){let s=e.trim().toLowerCase(),a=r=>s?`${r.dataset} ${r.jid} ${r.issue_month} ${r.change_type} ${r.detail}`.toLowerCase().includes(s):!0;try{let i=(await lt()).transaction(Et,"readonly"),o=i.objectStore(Et),l=await yt(o.getAll());return await at(i),l.filter(a).sort((d,p)=>String(p.created_at).localeCompare(String(d.created_at))).slice(0,t)}catch{return Je=!0,Ge.audit.filter(a).slice().sort((i,o)=>String(o.created_at).localeCompare(String(i.created_at))).slice(0,t)}}async function ms(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let r=(await lt()).transaction(Tt,"readwrite");return r.objectStore(Tt).put(s),await at(r),s}catch{return Je=!0,Ge.settings.set(s.key,s),s}}async function Nt(e,t=null){try{let a=(await lt()).transaction(Tt,"readonly"),r=a.objectStore(Tt),i=await yt(r.get(String(e)));return await at(a),i?i.value:t}catch{Je=!0;let a=Ge.settings.get(String(e));return a?a.value:t}}async function cn({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await lt()).transaction(Tt,"readonly"),r=a.objectStore(Tt),i=await yt(r.getAll());return await at(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return Je=!0,Array.from(Ge.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function dn(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var Aa={};It(Aa,{buildFlowWaterfallStages:()=>zs,render:()=>mo,renderRagPipelineWaterfall:()=>Hs,renderTestFlowPanel:()=>is,renderWaterfallStages:()=>rs});var ti={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},si=new Set(["running","stopping"]);function Ns(e){let[t,s]=ti[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${n(t)}</span>`}function Es(e){return String(e).padStart(2,"0")}function as(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${Es(t.getMonth()+1)}-${Es(t.getDate())} ${Es(t.getHours())}:${Es(t.getMinutes())}`}function fs(e){return si.has(e)}function xt(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function Bt(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function Ct(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${n(e)}</span>
    <strong>${n(String(t))}</strong>
    ${s?`<small>${n(s)}</small>`:""}
  </div>`}function un(e={}){let t=e.score_components||e;return`<div class="bench-metrics">
    ${Ct("Law Recall",Bt(t.law_recall))}
    ${Ct("Article Recall",Bt(t.article_recall))}
    ${Ct("Citation Valid",Bt(t.citation_valid_rate))}
    ${Ct("Judge",xt(t.judge_overall))}
    ${Ct("Human",xt(t.human_overall))}
    ${Ct("p50",ie(e.duration_p50_ms))}
    ${Ct("p95",ie(e.duration_p95_ms))}
    ${Ct("Success",`${c(e.success||0)} / ${c(e.total||0)}`)}
  </div>`}function pn(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${n(s.replace(/^rag\./,""))}</span>
      <strong>${ie(a.p50_ms)}</strong>
      <small>p95 ${ie(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function mn(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${Bt(s.law_recall)}</span>
    <span>Article ${Bt(s.article_recall)}</span>
    <span>Judge ${xt(s.judge_overall)}</span>
    <span>p95 ${ie(t.duration_p95_ms)}</span>`}function gn(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function fn(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${n(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${n(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${n(e.status||"")}">${Ns(e.status)}</span>
      <span class="mono">${n(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${n($e(e.started_at))}</span>
      <span data-bench-slot="run-completed">${c(e.completed_cases||0)} / ${c(e.total_cases||0)} \u984C</span>
      <span>${n(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${n(gn(e))}">${mn(e)}</span>
  </button>`}function ma(e,t=[]){let s=e.metrics||{},a=e.judge||{},r=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([p])=>p.startsWith("rag.")).map(([p,v])=>`<span class="chip">${n(p)} ${ie(v)}</span>`).join(""),d=(e.law_sources||[]).map(p=>`<span class="chip">${n(p.law_name||"\u6CD5\u898F")} ${c((p.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${n(e.question)}</span>
      ${Ns(e.status)}
      <span class="bench-case-time">${ie(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${xt(i.deterministic)} \xB7 Judge ${xt(i.judge)} \xB7 Human ${xt(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${n((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${n(e.fingerprint||"")}">${m("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
      </div>
      <div class="bench-case-stages">${l||'<span class="qb-muted">\u6C92\u6709 stage timing</span>'}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${Bt(s.law_recall)}</span>
        <span>Article recall ${Bt(s.article_recall)}</span>
        <span>Citation ${s.citation_valid?"valid":"invalid"}</span>
        <span>Refusal ${s.refusal_correct===null?"\u2014":s.refusal_correct?"correct":"wrong"}</span>
      </div>
      <div class="chips">${d||'<span class="qb-muted">\u6C92\u6709\u6CD5\u898F\u4F86\u6E90</span>'}</div>
      <div class="bench-answer"><strong>\u56DE\u7B54</strong><p>${n(e.answer||"\u2014")}</p></div>
      <div class="bench-judge"><strong>LLM judge</strong><p>${n(a.rationale||a.reason||"\u2014")}</p><span>${[["correctness",a.correctness],["grounding",a.grounding],["citation",a.citation],["clarity",a.clarity],["overall",a.overall]].map(([p,v])=>`${p} ${v??"\u2014"}`).join(" \xB7 ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${e.id}">
        <div class="bench-human-grid">
          ${[["correctness","\u6B63\u78BA\u6027",r.scores?.correctness??4],["grounding","\u6709\u64DA\u6027",r.scores?.grounding??4],["citation","\u5F15\u7528",r.scores?.citation??4],["clarity","\u6E05\u695A",r.scores?.clarity??4],["overall","\u6574\u9AD4",r.overall??4]].map(([p,v,k])=>`<label class="field"><span class="field-label">${v} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${p}" value="${n(String(k))}" /></label>`).join("")}
        </div>
        <label class="field"><span class="field-label">\u4EBA\u5DE5\u6279\u6CE8</span><input class="input" name="comment" value="${n(r.comment||"")}" placeholder="\u56DE\u7B54\u54C1\u8CEA\u3001\u5F15\u7528\u6216\u4E8B\u5BE6\u932F\u8AA4" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${m("check",13)}<span>\u5132\u5B58\u4EBA\u5DE5\u8A55\u5206</span></button>
      </form>
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(p=>`<div class="bench-history-row"><span>${n($e(p.run?.started_at))}</span><span>${n(p.run?.config?.llm_model||"\u2014")}</span><span>Det ${xt(p.metrics?.scores?.deterministic)}</span><span>Judge ${xt(p.metrics?.scores?.judge)}</span><span>Human ${xt(p.metrics?.scores?.human)}</span><span>${ie(p.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function pa(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function bn(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${ma(e,t)}
  </details>`}function vn(e){return`${Ns(e.status)}
    <span class="mono">${n(e.run_id)}</span>
    ${fs(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${n(e.run_id)}">${m("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function ai(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${n(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${m("activity",14)}${n(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${n((e.status||"")+":"+e.run_id)}">
        ${vn(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${un(e.summary||{})}</div>
    <div data-bench-detail="stages">${pn(e.summary||{})}</div>
    <div class="bench-run-config">
      <span><strong>Suite</strong> v${e.suite_version} \xB7 ${c((e.suite_snapshot?.items||[]).length)} \u984C</span>
      <span><strong>Embedding</strong> ${n(e.config?.embedding_model||"\u2014")}</span>
      <span><strong>LLM</strong> ${n(e.config?.llm_model||"\u2014")}</span>
      <span><strong>Judge</strong> ${n(e.config?.judge_model||"\u2014")}</span>
      <span><strong>Index</strong> ${n(e.index_version?.physical_collection||"\u2014")}</span>
      <span><strong>Top K</strong> ${n(String(e.config?.top_k??"\u2014"))}</span>
      <span><strong>Law retrieval</strong> ${e.config?.enable_law_retrieval?"on":"off"}</span>
      <span><strong>Config hash</strong> <span class="mono">${n((e.config_hash||"").slice(0,16))}</span></span>
    </div>
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>bn(a,t[a.fingerprint]||[])).join(""):ye({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function hn(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${m("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${n(e.run_id)}">${m("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function $n(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),r=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,r-i):0,l=(t||[]).filter(h=>["success","failed"].includes(h.status)).map(h=>Number(h.duration_ms)||0).filter(h=>h>0),d=null;if(l.length)d=l.reduce((h,w)=>h+w,0)/l.length;else if(a>0){let h=Date.parse(e.updated_at||""),w=Number.isFinite(h)?h:i;Number.isFinite(w)&&w>i?d=(w-i)/a:o>0&&(d=o/a)}let p=(t||[]).find(h=>h.status==="running")||null,v=0;if(a<s&&d&&d>0){let h=p?Date.parse(p.started_at||""):NaN,w=Date.parse(e.updated_at||""),A=Number.isFinite(h)?h:w;Number.isFinite(A)&&(v=Math.max(0,Math.min(.95,(r-A)/d)))}let k=Math.min(s,a+v),$=s>0?Math.max(0,Math.min(100,k/s*100)):0,b=d===null?null:Math.max(0,s-k)*d;return{total:s,completed:a,elapsedMs:o,averageMs:d,progress:$,etaMs:b,ratePerMin:d?6e4/d:null,running:p}}function yn(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${ie(e)}`}function wn(e,t=[]){let s=$n(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${n(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${c(s.completed)} / ${c(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${yn(s.etaMs)}</span>
      <span data-bench-slot="progress-rate">${s.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${s.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`}</span>
    </div>
    <div class="processing-bar processing-bar-lg bench-progress-bar${s.completed===0?" is-waiting":""}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.progress.toFixed(1)}" data-bench-slot="progress-bar">
      <span class="processing-bar-fill" data-bench-slot="progress-fill" style="width:${s.progress.toFixed(2)}%"></span>
    </div>
    <div class="bench-progress-foot">
      <span data-bench-slot="progress-elapsed">\u5DF2\u57F7\u884C ${ie(s.elapsedMs)}</span>
      <span data-bench-slot="progress-average">${s.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${ie(s.averageMs)}\uFF0F\u984C`}</span>
      <span>\u5373\u6642\u9810\u4F30 \xB7 \u6BCF\u5B8C\u6210\u4E00\u984C\u6821\u6B63</span>
    </div>
  </div>`}function ni(e){let t=e.models?.models||{},s=e.suites||[],a=gs(e),r=e.selectedRun;return`<section class="report-card bench-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("brain",14)}RAG Benchmark</span>
      <span class="badge ${e.indexVersion?.physical_collection?"badge-ok":"badge-warn"}">${n(e.indexVersion?.physical_collection||"\u7D22\u5F15\u672A\u8A2D\u5B9A")}</span>
    </div>
    <form class="bench-form" data-bench-form="run">
      <div class="bench-form-grid">
        <label class="field"><span class="field-label">Benchmark \u984C\u5EAB</span><select class="select" name="suite_id">${s.map(i=>`<option value="${i.id}" ${e.selectedSuiteId===i.id?"selected":""}>${n(i.name)} \xB7 ${c(i.item_count)} \u984C</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Embedding</span><select class="select" name="embedding_model">${(t.embedding||[]).map(i=>`<option value="${n(i)}" ${i===e.config.embedding_model?"selected":""}>${n(i)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">LLM</span><select class="select" name="llm_model">${(t.llm||[]).map(i=>`<option value="${n(i)}" ${i===e.config.llm_model?"selected":""}>${n(i)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Judge model</span><select class="select" name="judge_model"><option value="">\u4E0D\u57F7\u884C LLM judge</option>${(t.llm||[]).map(i=>`<option value="${n(i)}" ${i===e.config.judge_model?"selected":""}>${n(i)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Top K</span><input class="input" type="number" min="1" max="20" name="top_k" value="${n(String(e.config.top_k||4))}" /></label>
        <label class="field"><span class="field-label">Score threshold</span><input class="input" type="number" min="0" max="1" step="0.01" name="score_threshold" value="${n(String(e.config.score_threshold||.35))}" /></label>
        <label class="field"><span class="field-label">\u91CD\u8907\u6B21\u6578</span><input class="input" type="number" min="1" max="5" name="repeats" value="${n(String(e.config.repeats||1))}" /></label>
        <label class="checkbox-field bench-check"><input type="checkbox" name="enable_law_retrieval" ${e.config.enable_law_retrieval?"checked":""} /><span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22</span></label>
        <label class="checkbox-field bench-check"><input type="checkbox" name="judge_enabled" ${e.config.judge_enabled?"checked":""} /><span>LLM judge</span></label>
      </div>
      <label class="field"><span class="field-label">Run \u6A19\u7C64</span><input class="input" name="label" value="${n(e.config.label||as())}" /></label>
      <div class="qb-actions" data-bench-actions data-signature="${n(a?`${a.run_id}:${a.status}`:"")}">
        ${hn(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${n(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?wn(a,ga(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>fn(i,r?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${r?ai(r,e.history):""}
  </section>`}function gs(e){let t=(e.runs||[]).find(s=>fs(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!fs(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function ga(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function _n(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:as(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",pollTimer:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),r=E=>{let S=new FormData(E);return{label:String(S.get("label")||"").trim()||as(),embedding_model:String(S.get("embedding_model")||""),llm_model:String(S.get("llm_model")||""),judge_model:String(S.get("judge_model")||""),top_k:Number(S.get("top_k")||4),score_threshold:Number(S.get("score_threshold")||.35),repeats:Number(S.get("repeats")||1),enable_law_retrieval:E.elements.enable_law_retrieval?.checked??!0,judge_enabled:E.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(E=>`${E.id}:${E.name}:${E.item_count}:${E.version}:${E.status}`)]:null,runs:(s.runs||[]).map(E=>`${E.run_id}:${E.label||""}:${E.suite_version||1}`)}),o=()=>{let S=a()?.querySelector("[data-bench-live]"),C=gs(s);if(!S||!C)return;let ee=$n(C,ga(s,C)),re=(Y,ue)=>{let ae=S.querySelector(`[data-bench-slot="${Y}"]`);ae&&ae.textContent!==ue&&(ae.textContent=ue)};re("progress-count",`${c(ee.completed)} / ${c(ee.total)} \u984C`),re("progress-percent",`${ee.progress.toFixed(1)}%`),re("progress-eta",yn(ee.etaMs)),re("progress-rate",ee.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${ee.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),re("progress-elapsed",`\u5DF2\u57F7\u884C ${ie(ee.elapsedMs)}`),re("progress-average",ee.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${ie(ee.averageMs)}\uFF0F\u984C`),re("progress-state",C.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let T=S.querySelector('[data-bench-slot="progress-bar"]');T&&(T.setAttribute("aria-valuenow",ee.progress.toFixed(1)),T.classList.toggle("is-waiting",ee.completed===0));let z=S.querySelector('[data-bench-slot="progress-fill"]');z&&(z.style.width=`${ee.progress.toFixed(2)}%`)},l=E=>{let S=E.querySelector("[data-bench-actions]");if(!S)return;let C=gs(s),ee=C?`${C.run_id}:${C.status}`:"";S.dataset.signature!==ee&&(S.dataset.signature=ee,S.innerHTML=hn(C))},d=E=>{let S=E.querySelector("[data-bench-live-wrap]");if(!S)return;let C=gs(s),ee=C?`${C.run_id}:${C.status}:${C.total_cases}`:"";S.dataset.signature!==ee&&(S.dataset.signature=ee,S.innerHTML=C?wn(C,ga(s,C)):"")},p=E=>{let S=E.querySelector("[data-bench-runs]");if(!S)return;let C=s.runs||[],ee=[...S.querySelectorAll("[data-run-id]")].map(T=>T.dataset.runId),re=C.map(T=>T.run_id);if(ee.join("|")!==re.join("|")){S.innerHTML=C.length?C.map(T=>fn(T,s.selectedRun?.run_id===T.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let T of C){let z=S.querySelector(`[data-run-id="${T.run_id}"]`);if(!z)continue;z.classList.toggle("is-active",s.selectedRun?.run_id===T.run_id);let Y=z.querySelector('[data-bench-slot="run-label"]');Y&&Y.textContent!==(T.label||"RAG Benchmark")&&(Y.textContent=T.label||"RAG Benchmark");let ue=z.querySelector('[data-bench-slot="run-status"]');ue&&ue.dataset.status!==(T.status||"")&&(ue.dataset.status=T.status||"",ue.innerHTML=Ns(T.status));let ae=z.querySelector('[data-bench-slot="run-completed"]');if(ae){let _e=`${c(T.completed_cases||0)} / ${c(T.total_cases||0)} \u984C`;ae.textContent!==_e&&(ae.textContent=_e)}let X=z.querySelector('[data-bench-slot="run-scores"]'),ge=gn(T);X&&X.dataset.signature!==ge&&(X.dataset.signature=ge,X.innerHTML=mn(T))}},v=E=>{let S=s.selectedRun;if(!S)return;let C=E.querySelector(`.bench-detail[data-run-id="${S.run_id}"]`);if(!C)return;let ee=C.querySelector("[data-bench-detail-actions]");if(ee){let X=`${S.status||""}:${S.run_id}`;ee.dataset.signature!==X&&(ee.dataset.signature=X,ee.innerHTML=vn(S))}let re=C.querySelector('[data-bench-detail="metrics"]');if(re){let X=JSON.stringify(S.summary||{});re.dataset.signature!==X&&(re.dataset.signature=X,re.innerHTML=un(S.summary||{}))}let T=C.querySelector('[data-bench-detail="stages"]');if(T){let X=JSON.stringify((S.summary||{}).stages||{});T.dataset.signature!==X&&(T.dataset.signature=X,T.innerHTML=pn(S.summary||{}))}let z=C.querySelector("[data-bench-cases]");if(!z)return;let Y=S.cases||[];if(!Y.length)return;let ue=z.querySelector(".notice");ue&&ue.remove();let ae=new Map([...z.querySelectorAll("details.bench-case")].map(X=>[Number(X.dataset.resultId),X]));for(let X of Y){let ge=s.history[X.fingerprint]||[],_e=pa(X,ge),je=ae.get(Number(X.id));if(!je){z.insertAdjacentHTML("beforeend",bn(X,ge)),je=z.lastElementChild,je&&(je._benchSignature=_e);continue}if(je._benchSignature===_e||!s.forcedCaseIds.delete(Number(X.id))&&je.contains(document.activeElement))continue;let ce=je.open;je.innerHTML=ma(X,ge),je.open=ce,je._benchSignature=_e}},k=()=>{gs(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},$=()=>{let E=a();E&&(l(E),d(E),p(E),v(E),o(),k())},b=E=>{let S=s.selectedRun;if(!S)return;let C=E.querySelector('[data-bench-detail="metrics"]');C&&(C.dataset.signature=JSON.stringify(S.summary||{}));let ee=E.querySelector('[data-bench-detail="stages"]');ee&&(ee.dataset.signature=JSON.stringify((S.summary||{}).stages||{}));let re=E.querySelector("[data-bench-cases]");if(!re)return;let T=new Map((S.cases||[]).map(z=>[Number(z.id),z]));for(let z of re.querySelectorAll("details.bench-case")){let Y=T.get(Number(z.dataset.resultId));Y&&(z._benchSignature=pa(Y,s.history[Y.fingerprint]||[]))}},h=(E=!1)=>{let S=a();if(!S)return;let C=i();if(!E&&s.renderSignature===C){$();return}s.renderSignature=C,s.forcedCaseIds.clear(),S.innerHTML=ni(s),b(S),$()},w=async({refreshAll:E=!1}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||E;return}s.loading=!0;try{if(!s.referenceLoaded||E){let[Y,ue]=await Promise.all([F.benchmarkModels(),F.benchmarkSuites()]);s.models=Y,s.suites=ue.suites||[],s.indexVersion=Y.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=Y.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=Y.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(Y.models?.llm||[]).find(ae=>ae!==s.config.llm_model)||"")}let S=await F.benchmarkRuns(30);s.runs=S.runs||[];let C=s.activeRunId,ee=s.runs.find(Y=>fs(Y.status))||null;s.activeRunId=ee?.run_id||"";let re=s.selectedRun?.run_id||"";re||(re=ee?.run_id||s.runs[0]?.run_id||"");let T=!!(s.selectedRun&&C&&s.selectedRun.run_id===C);re&&(!s.selectedRun||s.selectedRun.run_id!==re||re===ee?.run_id||T)?s.selectedRun=await F.benchmarkRun(re,!0):re||(s.selectedRun=null),s.loaded=!0,h()}catch(S){if(!s.loaded){s.renderSignature="";let C=a();C&&(C.innerHTML=ye({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:n(S.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let S=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,w({refreshAll:S})}else A()}},A=()=>{s.pollTimer&&window.clearTimeout(s.pollTimer),s.pollTimer=null,(s.runs||[]).some(E=>fs(E.status))&&(s.pollTimer=window.setTimeout(()=>{w()},2500))},B=async E=>{try{s.selectedRun=await F.benchmarkRun(E,!0),h(),A()}catch(S){L(S.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},Q=async E=>{!s.labelTouched&&E.elements.label&&(E.elements.label.value=as());let S=r(E);s.config=S;let C=Number(E.elements.suite_id?.value||0);if(!C){L("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await F.startBenchmarkRun({suite_id:C,config:S,actor:"anonymous"}),L("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=as(),s.labelTouched=!1,await w()}catch(ee){L(ee.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},D=async E=>{try{await F.stopBenchmarkRun(E),L("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await w()}catch(S){L(S.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},H=async E=>{let S=Number(E.dataset.resultId||0),C=new FormData(E),ee={};for(let re of["correctness","grounding","citation","clarity","overall"]){let T=Number(C.get(`score_${re}`));Number.isFinite(T)&&(ee[re]=T)}try{await F.reviewBenchmarkResult(S,{reviewer:"anonymous",scores:ee,comment:String(C.get("comment")||"")}),L("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await F.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(S)),h()}catch(re){L(re.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},te=async E=>{if(E)try{let S=await F.benchmarkFingerprintHistory(E,50);s.history[E]=S.cases||[];let C=s.selectedRun,ee=a();if(!C||!ee)return;let re=(C.cases||[]).filter(T=>T.fingerprint===E);for(let T of re){let z=ee.querySelector(`details.bench-case[data-result-id="${T.id}"]`);if(!z)continue;let Y=z.open;z.innerHTML=ma(T,s.history[E]),z.open=Y,z._benchSignature=pa(T,s.history[E])}}catch(S){L(S.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},de=async E=>{let S=E.target.closest("[data-bench-action]");if(!S)return;let C=S.dataset.benchAction;C==="open-run"?await B(S.dataset.runId||""):C==="stop"?await D(S.dataset.runId||""):C==="fingerprint-history"&&await te(S.dataset.fingerprint||"")},ke=async E=>{let S=E.target.closest("[data-bench-form]");S&&(E.preventDefault(),S.dataset.benchForm==="run"?await Q(S):S.dataset.benchForm==="human"&&await H(S))},we=E=>{E&&(E.elements.label&&E.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=r(E),E.elements.suite_id&&(s.selectedSuiteId=Number(E.elements.suite_id.value)||s.selectedSuiteId))},W=E=>{let S=E.target.closest('[data-bench-form="run"]');S&&we(S)};return e.addEventListener("click",de),e.addEventListener("submit",ke),e.addEventListener("input",W),e.addEventListener("change",W),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=as();let E=a()?.querySelector('input[name="label"]');E&&(E.value=s.config.label)}w({refreshAll:!s.referenceLoaded})},refresh(){return w({refreshAll:!0})},destroy(){e.removeEventListener("click",de),e.removeEventListener("submit",ke),e.removeEventListener("input",W),e.removeEventListener("change",W),s.pollTimer&&window.clearTimeout(s.pollTimer),s.tickTimer&&window.clearInterval(s.tickTimer)}}}var _a={};It(_a,{exportCsv:()=>Bs,exportableResult:()=>Ds,render:()=>Fi,renderReport:()=>Ps,reportError:()=>Os,reportLoading:()=>bs});var Mn=[10,25,50,100],kn=500,ri=["law_name","law_level","law_category","law_modified_date","article_count"],ii=["jid","court_normalized","title","jdate","matched_laws","citation_count"],oi={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function Is(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function Cs(e,t){let s={};for(let a of e.fields||[]){let r=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?r:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{},fuzzyTerms:[]}}function li(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,r]of Object.entries(s))if(Array.isArray(r)&&!r.map(String).includes(String(t[a]??"")))return!1;return!0}function wa(e,t){return(e.fields||[]).filter(s=>li(s,t))}function ci(e,t){return`filter-${e.id}-${t}`}function Dt(e){return e==null?"":n(String(e))}function fa(e,t,s){let a=s[t.key],r=ci(e,t.key),i=t.help?`<span class="field-help">${n(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
      <label class="checkbox-field" for="${r}">
        <input type="checkbox" id="${r}" name="${n(t.key)}" ${a?"checked":""} />
        <span class="checkbox-copy">
          <strong>${n(t.label)}</strong>
          ${t.help?`<span>${n(t.help)}</span>`:""}
        </span>
      </label>
    </div>`;let o=`<label class="field-label" for="${r}">
      <span>${n(t.label)}</span>
      <span class="field-tag">${n(t.key)}</span>
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(d=>`<option value="${Dt(d.value)}" ${String(d.value)===String(a??"")?"selected":""}>${n(d.label??d.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${r}" name="${n(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),d=(t.options||[]).map(p=>`<label class="multi-option">
          <input type="checkbox" name="${n(t.key)}" value="${Dt(p.value)}" ${l.has(String(p.value))?"checked":""} />
          <span>${n(p.label??p.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${d}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${r}" name="${n(t.key)}"
        value="${Dt(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${Dt(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${r}" name="${n(t.key)}"
        value="${Dt(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${r}" name="${n(t.key)}"
      value="${Dt(a)}"
      placeholder="${Dt(t.placeholder||"")}" />
    ${i}
  </div>`}function Sn(e,t,{focusTable:s=!1}={}){let a=wa(e,t.values),r=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(r.push(`<div class="field-row">${fa(e,o,t.values)}${fa(e,l,t.values)}</div>`),i+=1):r.push(fa(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
    <div class="filter-block">
      <div class="filter-head">
        <span class="filter-title">Metadata \u689D\u4EF6</span>
        <button class="filter-reset" type="button" data-action="reset">\u91CD\u8A2D</button>
      </div>
      <div class="filter-fields">${r.join("")}</div>
    </div>
    <div class="sidebar-actions">
      <button class="btn btn-primary" type="submit" id="run-query" ${s?'data-focus-table="true"':""}>
        ${m("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
      </button>
    </div>
  </form>`}function Rs(e,t,s){let a={...s.values};for(let r of wa(t,a))if(r.type==="checkbox"){let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=!!i?.checked}else if(r.type==="multiselect")a[r.key]=Array.from(e.querySelectorAll(`[name="${r.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=i?i.value:""}return a}function Tn(e,t){let s={};for(let a of wa(e,t.values)){let r=t.values[a.key];a.type==="checkbox"?s[a.key]=!!r:a.type==="multiselect"?s[a.key]=Array.isArray(r)?r:[]:a.type==="number"?s[a.key]=r===""||r===null?"":Number(r):s[a.key]=r??""}return s}function ba(e,t){let s=Tn(e,t);return Array.isArray(t.fuzzyTerms)&&t.fuzzyTerms.length&&(s.keywords=[...t.fuzzyTerms]),(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function di(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${ye({tone:t,title:`${Is(e)} ${ht(e.status).label}`,text:n(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function ui(e,t){return`<label class="field data-source-field">
    <span class="field-label">\u8CC7\u6599\u4F86\u6E90</span>
    <select class="select" name="database">
      ${e.map(s=>{let a=ht(s.status);return`<option value="${n(s.id)}" ${s.id===t?"selected":""}>${n(s.label)} \xB7 ${n(a.label)}</option>`}).join("")}
    </select>
  </label>`}function xn(e,t){return`<nav class="data-nav" aria-label="\u8CC7\u6599\u67E5\u8A62\u529F\u80FD">
    ${[{id:"law",label:"\u67E5\u8A62\u6CD5\u898F\u547D\u4EE4",hint:"Fuzzy \u6CD5\u898F\u540D\u7A31\u3001\u985E\u5225\u8207\u547D\u4EE4",icon:"file"},{id:"judgment",label:"\u67E5\u8A62\u5224\u6C7A",hint:"Fuzzy \u6CD5\u9662\u3001\u6848\u865F\u8207\u6848\u7531",icon:"layers"},{id:"schema",label:"\u8CC7\u6599\u5EAB Schema",hint:"\u8CC7\u6599\u8868\u3001\u6B04\u4F4D\u8207\u9810\u89BD",icon:"table"}].map(a=>{let r=a.id==="schema"?t==="schema":t==="query"&&e===a.id;return`<button class="data-nav-item${r?" is-active":""}" type="button"
          data-action="data-nav" data-tab="${a.id}" ${r?'aria-current="page"':""}>
          <span class="data-nav-icon">${m(a.icon,15)}</span>
          <span class="data-nav-copy">
            <strong>${n(a.label)}</strong>
            <small>${n(a.hint)}</small>
          </span>
        </button>`}).join("")}
  </nav>`}function pi(e,t,s){if(t.id!=="postgres"&&t.id!=="parquet")return"";let a=Array.isArray(s.fuzzyTerms)?s.fuzzyTerms:[],r=e==="law"?"Fuzzy \u6CD5\u898F\uFF0F\u547D\u4EE4":"Fuzzy \u5224\u6C7A",i=e==="law"?"\u8F38\u5165\u6CD5\u898F\u540D\u7A31\u6216\u76F8\u8FD1\u5B57\u2026":"\u8F38\u5165\u6CD5\u9662\u3001\u6848\u865F\u3001\u6848\u7531\u6216\u76F8\u8FD1\u5B57\u2026";return`<div class="data-fuzzy" data-data-fuzzy data-fuzzy-kind="${e}">
    <div class="data-fuzzy-head">
      <span class="filter-title">${r}</span>
      <span class="field-tag">\u591A\u689D\u4EF6 AND</span>
    </div>
    <div class="data-fuzzy-row">
      <div class="data-fuzzy-values">
        ${a.length?a.map(o=>`<span class="chip data-fuzzy-chip">${n(o)}<button class="data-fuzzy-remove" type="button" data-action="remove-fuzzy-term" data-term="${n(o)}" aria-label="\u79FB\u9664 ${n(o)}">${m("x",9)}</button></span>`).join(""):`<span class="data-fuzzy-placeholder">${i}</span>`}
      </div>
      <button class="data-fuzzy-add" type="button" data-action="open-fuzzy" aria-label="\u52A0\u5165 fuzzy \u689D\u4EF6" aria-haspopup="listbox">${m("plus",13)}</button>
    </div>
    <div class="data-fuzzy-popover" data-data-fuzzy-popover hidden>
      <input class="input" type="search" data-data-fuzzy-search placeholder="${i}" autocomplete="off" />
      <div class="data-fuzzy-results" data-data-fuzzy-results role="listbox" aria-live="polite"></div>
    </div>
  </div>`}function va(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],r=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
            data-action="select-schema-table"
            data-table-id="${n(i.id)}">
            <span class="schema-item-top">
              <span class="schema-item-name">${n(i.label||i.id)}</span>
              <span class="schema-item-action">${e.id==="qdrant"?"\u6AA2\u8996":"\u9810\u89BD"}</span>
            </span>
            <span class="schema-item-id mono">${n(i.id)}</span>
            <span class="schema-item-desc">${n(i.description||"")}</span>
          </button>`).join(""):'<div class="report-empty-inline">\u9019\u500B\u8CC7\u6599\u5EAB\u6C92\u6709\u53EF\u986F\u793A\u7684\u8CC7\u6599\u8868\u3002</div>';return`<div class="schema-panel">
    <div class="filter-head">
      <span class="filter-title">${n(t||"\u8CC7\u6599\u8868")} \xB7 Schema</span>
      <span class="field-tag">${n(e.label||e.id)}</span>
    </div>
    <div class="schema-list">${r}</div>
    <div class="sidebar-note">\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u5728\u53F3\u5074\u9810\u89BD\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002</div>
  </div>`}function mi(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||n(e.detail||"")}function gi(e){return`<div class="report-empty">
    ${Ke({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:n({postgres:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u6CD5\u898F\u6216\u5224\u6C7A\u689D\u4EF6\uFF0C\u518D\u8996\u9700\u8981\u5C55\u958B\u9032\u968E metadata \u689D\u4EF6\u3002",parquet:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u689D\u4EF6\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\uFF1B\u53EF\u5C55\u958B\u9032\u968E\u689D\u4EF6\u8ABF\u6574\u6B04\u4F4D\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
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
  </div>`}function bs(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(Is(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function Os(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(Is(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${ye({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function fi(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,r=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${n(s.label||"\u672A\u5206\u985E")}">${n(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${r.toFixed(1)}%"></span></span>
          <span class="dist-value">${c(a)}</span>
        </div>`}).join("")}
  </div>`}function En(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function bi(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function vi(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function hi(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${n(String(t))}"
    title="\u6AA2\u8996\u300C${n(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${n(String(t))}${m("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var $i={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function yi(e,t,s,a=!1,r=!0,i=!1){let o=a?e.key:e.label||e.key,l=r?t?$i[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${n(o)}</th>`;let d=s?.key===l,p=d?s.direction:null,v=p==="asc"?"ascending":p==="desc"?"descending":"none",k=p==="asc"?"\u2191":p==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${v}">
    <button class="table-sort${d?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${n(l)}"
      title="\u4F9D${n(o)}\u6392\u5E8F">
      <span>${n(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${k}</span>
    </button>
  </th>`}function wi(e,t){if(!En(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,r=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(r||""),lawName:String(t.law_name||"")}}function _i(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${n(s.lawKey)}"
    data-law-source="${n(s.sourceType)}"
    data-law-name="${n(s.lawName)}"
    title="\u6AA2\u8996\u300C${n(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(String(a))}${m("chevronRight",12,"law-link-icon")}</button>`}function Nn(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:r=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],d=(e.page-1)*e.page_size,p=En(e),v=bi(e),k=vi(e),$=e.meta?.sort||null,b=r?`<tr class="schema-search-row">
        <th scope="col" class="cell-index-head"></th>
        ${o.map(h=>`<th scope="col">
              <div class="schema-search-wrap">
                <input class="schema-search-input" type="search"
                  data-schema-search="${n(h.key)}"
                  value="${n(String(r[h.key]??""))}"
                  placeholder="\u641C\u5C0B ${n(h.key)}"
                  autocomplete="off" />
              </div>
            </th>`).join("")}
      </tr>`:"";return o.length?l.length?`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">${c(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${p?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":v?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":k?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${b}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(h=>yi(h,v,$,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((h,w)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${d+w+1}</td>
                ${o.map(A=>{if((v||k)&&A.key==="jid")return`<td class="cell-jid">${hi(h)}</td>`;let B=p&&A.key==="law_name"?wi(e,h):null;if(B)return`<td>${_i(h,A,B)}</td>`;let D={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[A.type];return`<td${D?` class="${D}"`:""}>${js(h[A.key],A.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${Ke({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function ki(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Mn.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${m("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${m("chevronRight",13)}</button>
    </div>
  </div>`}function Cn(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${n(t)}</div>`).join("")}</div>`}function Ps(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],r=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",d=e.status||"ok",p=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${n(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${n(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${n(e.label||l)}
          ${Le(d)}
          <span class="chip">${n(p)}</span>
        </div>
        <div class="report-sub">
          ${c(i)} \u7B46\u7B26\u5408 \xB7
          ${ie(e.duration_ms)} \xB7
          ${n(String(l).toUpperCase())} / ${n(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${m("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${m("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${ye({tone:d==="not_configured"?"info":d==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:""}

    ${a.length?`<div class="summary-strip">
            ${a.slice(0,4).map(v=>`<div class="summary-item">
                  <div class="summary-label">${n(v.label)}</div>
                  <div class="summary-value">${n(v.value)}</div>
                </div>`).join("")}
          </div>`:""}

    <div class="report-grid">
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u7D50\u679C\u5206\u5E03</span>
          <span class="muted" style="font-size:9.5px">${r.length} groups</span>
        </div>
        ${fi(r)}
      </div>
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5BE6\u969B\u67E5\u8A62\u8A9E\u53E5</span>
          <span class="muted" style="font-size:9.5px">${n(e.database==="indexeddb"?"client-side":"read-only")}</span>
        </div>
        <div class="query-box">
          <pre class="query-code">${n(o||"\u2014")}</pre>
          <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
            ${m("copy",12)}<span>\u8907\u88FD</span>
          </button>
        </div>
        ${Cn(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?Nn(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?ki({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function qn(e){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${n(e||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u6B63\u5728\u8B80\u53D6\u6B04\u4F4D\u8207\u524D 10 \u7B46\u8CC7\u6599\u2026</div>
      </div>
      <span class="spinner" aria-hidden="true"></span>
    </div>
    <div class="report-loading">
      <div class="skeleton skeleton-line" style="width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>
  </div>`}function ha(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let r=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${ye({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${n(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${n(t||e.table||"\u8CC7\u6599\u8868")}
          ${Le(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${n(String(e.database||""))} / ${n(String(e.table||"\u2014"))} \xB7 ${r.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${Nn({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${Cn(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${c(i.length)} \u7B46</span>
      <strong>\u5171 ${c(e.total)} \u7B46</strong>
    </div>
  </div>`}function An(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${n(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${ye({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function Si(e){return`<div class="report-empty">
    ${Ke({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${Is(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function $a(e){return e.is_current===!0?Le("ok","\u73FE\u884C"):e.law_abandon_note?Le("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?Le("empty","\u6B77\u53F2\u7248\u672C"):Le("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function Oe(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${n(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function Ft(e){return e?vt(e):"\u2014"}function xi(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function ya(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${n(e)}</span>
    </div>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </div>`:""}function qi(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${n(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${m("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </details>`:""}function Ai(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let r=a?.name||a?.url||"";return r?a.url?`<a class="law-attachment" href="${n(a.url)}" target="_blank" rel="noopener noreferrer">
          ${m("file",12)}<span>${n(r)}</span>${m("external",11)}
        </a>`:`<span class="law-attachment">${m("file",12)}<span>${n(r)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${c(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function Rn(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function ji(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,r=s?`${c(a)} \u689D \xB7 ${c(s)} \u7AE0\u7BC0`:`${c(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${n(l)}</div>`;let d=oi[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${n(Rn(o.article_no))}">
        <div class="law-article-head">
          <span class="law-article-no">${n(o.article_no||"\u689D\u6587")}</span>
          ${d&&d!=="\u689D\u6587"?`<span class="chip">${n(d)}</span>`:""}
        </div>
        <div class="law-article-text">${n(l)}</div>
      </article>`}).join("");return`<div class="report-section law-articles-section">
    <div class="report-section-head">
      <span class="report-section-title">\u689D\u6587\u5167\u5BB9</span>
      <div class="law-article-controls">
        <span class="muted">${r}</span>
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
  </div>`}function Li(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function ns(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${m("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function Mi(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${ns()}
      <span class="law-report-origin">\u6B63\u5728\u8F09\u5165\u6CD5\u898F\u5831\u8868\u2026</span>
    </div>
    <div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT</div>
          <div class="report-title">${n(e||"\u6CD5\u898F")}</div>
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
  </div>`}function Ti(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${ns()}
      <span class="law-report-origin">\u6CD5\u898F\u5831\u8868\u8F09\u5165\u5931\u6557</span>
    </div>
    <div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT</div>
          <div class="report-title">${n(t||"\u6CD5\u898F")}</div>
          <div class="report-sub">\u7121\u6CD5\u53D6\u5F97\u9019\u500B\u6CD5\u898F\u7684\u5B8C\u6574\u5831\u8868\u3002</div>
        </div>
      </div>
      <div class="report-section">
        ${ye({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function Ei(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let r=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",r,a.article_count_for_law?`${c(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${n(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${n(i)}</option>`}).join("")}
    </select>
  </label>`}function Ni(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let r={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${r[o]} ${c(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">\u7248\u672C\u8B8A\u66F4</span>
      <span class="muted">${n(i)}</span>
    </summary>
    <div class="law-version-change-list">
      ${a.length?a.slice(0,20).map(o=>{let l=o.change_type==="added"?"badge-ok":o.change_type==="removed"?"badge-danger":"badge-warn",d=o.before_content?`<details><summary>\u8B8A\u66F4\u524D</summary><pre>${n(o.before_content)}</pre></details>`:"",p=o.after_content?`<details><summary>\u8B8A\u66F4\u5F8C</summary><pre>${n(o.after_content)}</pre></details>`:"";return`<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${l}">${n(r[o.change_type]||o.change_type)}</span>
                    <strong>${n(o.article_no||o.article_key)}</strong>
                  </div>
                  ${d}${p}
                </div>`}).join(""):'<div class="report-empty-inline">\u6B64\u7248\u672C\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u8B8A\u66F4\u3002</div>'}
      ${e.changes_truncated?'<div class="report-empty-inline">\u50C5\u986F\u793A\u524D 20 \u7B46\u8B8A\u66F4\uFF1BAPI \u56DE\u50B3\u4E0A\u9650 200 \u7B46\u3002</div>':""}
    </div>
  </details>`}function Ci(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let r=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(w=>w.article_type!=="C").length,l=xi(e),d=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",p=e.meta?.snapshot||"",v=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",k=[l,d,v,p].filter(Boolean).join(" \xB7 "),$=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",b=e.version||{},h=[Oe("\u6CD5\u898F\u4F4D\u968E",n(e.law_level||"\u2014")),Oe("\u6CD5\u898F\u985E\u5225",n(e.law_category||"\u2014")),Oe("\u7570\u52D5\u65E5\u671F",Ft(e.law_modified_date)),Oe("\u751F\u6548\u65E5\u671F",Ft(e.law_effective_date)),Oe("\u689D\u6587\u6578",c(e.article_count)),Oe("\u8CC7\u6599\u72C0\u614B",$a(e)),Oe("\u82F1\u8B6F\u540D\u7A31",n(e.eng_law_name||"\u2014")),Oe("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${n(e.law_key||"\u2014")}</span>`)];return b.first_seen_version_id!==null&&b.first_seen_version_id!==void 0&&h.push(Oe("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${n(b.first_seen_version_id)}`)),b.last_seen_version_id!==null&&b.last_seen_version_id!==void 0&&h.push(Oe("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${n(b.last_seen_version_id)}`)),b.last_seen_at&&h.push(Oe("\u6700\u5F8C\u6536\u9304\u6642\u9593",n($e(b.last_seen_at)))),b.selected_version_id!==null&&b.selected_version_id!==void 0&&h.push(Oe("\u689D\u6587\u7248\u672C",`#${n(b.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${ns()}
      <span class="law-report-origin" title="${n(k)}">${n(k)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${n(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${n(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${n(i)}
            ${$a(e)}
            <span class="chip">${n($)}</span>
          </div>
          <div class="report-sub">
            ${n([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${c(e.article_count)} \u689D \xB7 \u7570\u52D5 ${Ft(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${Ei(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">${m("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${r.length?`<div class="report-alert">${ye({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r.map(w=>n(w)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${c(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${Ft(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${n(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${$a(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${n(l)}</span>
        </div>
        <div class="law-meta-grid">${h.join("")}</div>
      </div>

      ${Ni(e)}
      ${ya("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${qi("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${ya("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${ya("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${Ai(e.attachments)}
      ${ji(e)}
    </div>
    ${o>100?Li():""}
  </div>`}function Ri(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${ns()}
      <span class="law-report-origin">\u6B63\u5728\u8F09\u5165\u5224\u6C7A\u539F\u6587\u2026</span>
    </div>
    <div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">JUDGMENT REPORT</div>
          <div class="report-title">${n(e||"\u5224\u6C7A")}</div>
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
  </div>`}function Pi(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${ns()}
      <span class="law-report-origin">\u5224\u6C7A\u539F\u6587\u8F09\u5165\u5931\u6557</span>
    </div>
    <div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">JUDGMENT REPORT</div>
          <div class="report-title">${n(t||"\u5224\u6C7A")}</div>
          <div class="report-sub">\u7121\u6CD5\u53D6\u5F97\u9019\u7B46\u5224\u6C7A\u7684\u5B8C\u6574\u5167\u5BB9\u3002</div>
        </div>
      </div>
      <div class="report-section">
        ${ye({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function Ii(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${n(t)}"
    data-law-source=""
    data-law-name="${n(t)}"
    title="\u6AA2\u8996\u300C${n(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(t)}${m("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function Oi(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let r=String(s.article_no||"").trim();r&&t.get(a).add(r)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${Ii(s)}
          <span class="judgment-citation-articles">${[...a].map(r=>n(r)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function Bi(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",r=String(e.full_text||""),i=Number(e.full_text_length)||r.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[Oe("\u6848\u865F",n(e.jid||"\u2014")),Oe("\u5E74\u5EA6",n(e.jyear||"\u2014")),Oe("\u5B57\u5225",n(e.jcase||"\u2014")),Oe("\u865F\u78BC",n(e.jno||"\u2014")),Oe("\u6CD5\u9662",n(e.court||"\u2014")),Oe("\u6848\u7531",n(e.title||"\u2014")),Oe("\u88C1\u5224\u65E5\u671F",Ft(e.jdate)),Oe("\u4F86\u6E90\u58D3\u7E2E\u6A94",n(e.source_archive||"\u2014")),Oe("\u5168\u6587\u9577\u5EA6",`${c(i)} \u5B57`),Oe("\u5F15\u7528\u6578",c(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(Oe("\u532F\u5165 Run",`#${n(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${ns()}
      <span class="law-report-origin" title="${n(o)}">${n(o)}</span>
    </div>
    <div class="report-card law-report-card judgment-report-card" data-database="${n(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">JUDGMENT REPORT \xB7 ${n(String(t).toUpperCase())}</div>
          <div class="report-title">
            ${n(a)}
            <span class="chip">\u5224\u6C7A\u6587\u4EF6</span>
          </div>
          <div class="report-sub">
            ${n(e.court||"\u2014")} \xB7 ${Ft(e.jdate)} \xB7
            ${c(i)} \u5B57
          </div>
        </div>
        <div class="report-actions">
          ${e.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(e.pdf_url)}" target="_blank" rel="noopener noreferrer">${m("external",14)}<span>PDF</span></a>`:""}
        </div>
      </div>

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u88C1\u5224\u65E5\u671F</div>
          <div class="summary-value">${Ft(e.jdate)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u9662</div>
          <div class="summary-value summary-value-text">${n(e.court||"\u2014")}</div>
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
          <span class="muted" style="font-size:9.5px">${n(e.jid||"")}</span>
        </div>
        <div class="law-meta-grid">${l.join("")}</div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u547D\u4E2D\u6CD5\u898F\u8207\u5F15\u7528</span>
          <span class="muted">${c(s.length)} \u6CD5\u898F \xB7 ${c(e.citation_count)} \u5F15\u7528</span>
        </div>
        ${Oi(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${c(i)} \u5B57</span>
        </div>
        ${r?`<div class="judgment-fulltext">${n(r)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function jn(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function Bs(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(jn).join(",")],r=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([r+o+1,...t.map(l=>i[l.key])].map(jn).join(","))}),`\uFEFF${a.join(`\r
`)}`}function Ds(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,r]of Object.entries(t))a.startsWith("_")||(s[a]=r);return s})}}function Di(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function Ln(e,t){let s=performance.now(),a=Tn(e,t),r=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,d=[],p=[],v=[],k=[];if(r==="audit_events"){try{let D=Number(await Nt("audit.last_event_id",0))||0,H=await F.versioningAudit({since_id:D,limit:500}),te=Array.isArray(H?.events)?H.events:[];te.length&&await on(te.map(ke=>({...ke,dataset:"judgment"})));let de=Number(H?.latest_event_id||0);de>D&&await ms("audit.last_event_id",de)}catch(D){d.push(`\u7248\u672C audit \u540C\u6B65\u5931\u6557\uFF1A${D.message||D}`)}p=(await ln({keyword:i,limit:kn})).map(D=>({created_at:D.created_at,dataset:D.dataset,issue_month:D.issue_month,change_type:D.change_type,jid:D.jid,detail:D.detail})),v=[{key:"created_at",label:"\u6642\u9593",type:"datetime"},{key:"dataset",label:"\u8CC7\u6599\u96C6",type:"text"},{key:"issue_month",label:"\u6708\u4EFD",type:"mono"},{key:"change_type",label:"\u8B8A\u66F4",type:"status"},{key:"jid",label:"\u6848\u865F",type:"mono"},{key:"detail",label:"\u6458\u8981",type:"longtext"}];let Q=new Map;p.forEach(D=>Q.set(D.change_type||"unknown",(Q.get(D.change_type||"unknown")||0)+1)),k=Array.from(Q.entries()).map(([D,H])=>({label:D,value:H})).sort((D,H)=>H.value-D.value)}else if(r==="settings"){p=(await cn({keyword:i})).map(D=>({key:D.key,value:dn(D.value),updated_at:D.updated_at})),v=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let Q=new Map;p.forEach(D=>{let H=String(D.key||"").split(".")[0]||"\u5176\u4ED6";Q.set(H,(Q.get(H)||0)+1)}),k=Array.from(Q.entries()).map(([D,H])=>({label:D,value:H})).sort((D,H)=>H.value-D.value)}else{p=(await Ts({keyword:i,limit:kn})).map(D=>({kind:Di(D.kind),title:D.title,detail:D.detail,created_at:D.created_at})),v=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let Q=new Map;p.forEach(D=>Q.set(D.kind,(Q.get(D.kind)||0)+1)),k=Array.from(Q.entries()).map(([D,H])=>({label:D,value:H})).sort((D,H)=>H.value-D.value)}let $=p.length,b=(o-1)*l,h=p.slice(b,b+l),w=Math.round(performance.now()-s),A=an();return A&&d.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:A?"degraded":"ok",message:A?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:r,columns:v,rows:h,total:$,page:o,page_size:l,duration_ms:w,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String($)},{label:"\u76EE\u524D\u9801\u9762",value:`${h.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:Ms()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${w} ms`}],distribution:k,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${r}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${b}`,warnings:d,meta:{store:r,filters:a,client_side:!0}}}async function Fi(e,t){let s=!1,a=null,r=[],i="law",o=null,l={},d=0,p=25,v="query",k=null,$=null,b=0,h=[],w=null,A=-1,B=0,Q=0,D=null,H=null,te=null;e.innerHTML=`<section class="page data-page">
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
  </section>`;let de=e.querySelector("#query-sidebar"),ke=e.querySelector("#data-nav"),we=e.querySelector("#db-options-wrap"),W=e.querySelector("#filter-area"),E=e.querySelector("#schema-area"),S=e.querySelector("#query-main"),C=e.querySelector("#schema-suggest-popover"),ee=e.querySelector("#catalog-meta"),re=e.querySelector("#refresh-catalog"),T=y=>r.find(x=>x.id===y),z=()=>T(i)?.databases||[],Y=y=>z().find(x=>x.id===y),ue=(y,x)=>`${y}:${x}`,ae=(y,x=i)=>l[ue(x,y.id)],X=(y,x)=>{ms(y,x).catch(()=>{})},ge=()=>{if(!a){ee.textContent="CATALOG \xB7 \u96E2\u7DDA",ee.className="badge badge-danger badge-mono";return}let y=z(),x=y.filter(u=>u.available).length,q=T(i);ee.textContent=`CATALOG \xB7 ${q?.label||i} \xB7 ${x}/${y.length} \u53EF\u7528`,ee.className="badge badge-neutral badge-mono"},_e=y=>{S.innerHTML=gi(y)},je=()=>{let y=H?.returnScroll??te?.returnScroll;H=null,te=null;let x=Y(o),q=x?ae(x):null;v==="schema"&&$?.result?S.innerHTML=ha($.result,Be(x,$.tableId),{columnFilters:$.columnFilters||{},searchEnabled:x.id==="postgres"||x.id==="parquet"}):q?.result?S.innerHTML=Ps(q.result):x&&_e(x),typeof y=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:y,behavior:"smooth"}))},se=(y="law-article-jump")=>{let x=S.querySelector(`#${y}`),q=Rn(x?.value);if(!q){L("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),x?.focus();return}let g=[...S.querySelectorAll("[data-article-no]")].find(_=>_.dataset.articleNo===q);if(!g){L(`\u627E\u4E0D\u5230\u7B2C ${q} \u689D\u3002`,"warn");return}g.scrollIntoView({behavior:"instant",block:"center"}),g.classList.add("is-jump-target"),window.setTimeout(()=>g.classList.remove("is-jump-target"),2400)},ce=async({lawKey:y,sourceType:x="",lawName:q="",versionId:u=""})=>{let g=Y(o),_=g?ae(g):null,M=v==="schema"?$?.result:null;if(!g||!_?.result&&!M||!y)return;let G=++d;H={seq:G,lawKey:y,sourceType:x,lawName:q,versionId:u?String(u):"",page:1,detail:null,database:g.id,returnScroll:window.scrollY},te=null,S.innerHTML=Mi(q||y),S.scrollIntoView({behavior:"smooth",block:"start"});try{let J=await F.lawDetail(y,x,H.versionId);if(s||!H||H.seq!==G)return;H.detail=J,H.page=1,S.innerHTML=Ci(J,{database:H.database,lawPage:H.page})}catch(J){if(s||!H||H.seq!==G)return;S.innerHTML=Ti(J,q||y),L(J.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},ve=async({jid:y})=>{let x=Y(o),q=x?ae(x):null,u=v==="schema"?$?.result:null;if(!x||!q?.result&&!u||!y)return;let g=++d;H=null;let _=x.id==="parquet"?"parquet":"postgres";te={seq:g,jid:y,detail:null,database:x.id,source:_,returnScroll:window.scrollY},S.innerHTML=Ri(y),S.scrollIntoView({behavior:"smooth",block:"start"});try{let M=await F.judgmentDetail(y,_);if(s||!te||te.seq!==g)return;te.detail=M,S.innerHTML=Bi(M,{database:te.database})}catch(M){if(s||!te||te.seq!==g)return;S.innerHTML=Pi(M,y),L(M.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},Se=(y,x)=>`${i}:${y.id}:${x}`,Be=(y,x)=>(y.tables||[]).find(q=>q.id===x)?.label||x,De=(y,x,{sort:q=null,columnFilters:u={}}={})=>{let g={column_filters:u};return y.id==="postgres"?(g.table=x,g.schema_preview=!0):y.id==="parquet"&&i==="judgment"?(g.table="judgment_documents",g.columns=ii):y.id==="parquet"&&(g.dataset="all",g.columns=ri),q?.key&&(g.sort=`${q.key}:${q.direction}`),g},Pe=async(y,x,{sort:q=null,columnFilters:u={},quiet:g=!1}={})=>{if(!x)return;Me();let _=Se(y,x),M=++b,G=!!(g&&$?.result&&$.key===_);k={tableId:x},$={key:_,tableId:x,loading:!0,result:null,error:null,sort:q,columnFilters:u},G?S.setAttribute("aria-busy","true"):(E.innerHTML=va(y,T(i)?.label||i,x),S.innerHTML=qn(Be(y,x)));try{let J;if(y.id==="indexeddb"){let ne=Cs(y,10);ne.values.store=x,ne.page=1,J=await Ln(y,ne)}else y.id==="qdrant"?J={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:x,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(J=await F.query({database:y.id,filters:De(y,x,{sort:q,columnFilters:u}),page:1,pageSize:10}),q?.key&&(J.meta={...J.meta||{},sort:q}));if(s||M!==b)return;$={key:_,tableId:x,loading:!1,result:J,error:null,sort:q,columnFilters:u},S.removeAttribute("aria-busy"),v==="schema"&&k?.tableId===x&&(E.innerHTML=va(y,T(i)?.label||i,x),S.innerHTML=ha(J,Be(y,x),{columnFilters:u,searchEnabled:y.id==="postgres"||y.id==="parquet"}))}catch(J){if(s||M!==b)return;$={key:_,tableId:x,loading:!1,result:null,error:J,sort:q,columnFilters:u},S.removeAttribute("aria-busy"),v==="schema"&&k?.tableId===x&&(S.innerHTML=An(J,Be(y,x)))}},j=()=>{let y=Y(o);if(!y)return null;if(v==="schema"&&$?.result)return{db:y,tableId:$.tableId,columnFilters:$.columnFilters||{},sort:$.sort||null,mode:"schema"};let x=y?ae(y):null,q=x?.result;return q&&(y.id==="postgres"||y.id==="parquet")?{db:y,tableId:q.table,columnFilters:x.columnFilters||{},sort:x.sort||null,mode:"query"}:null},R=(y,x,q)=>{if(!y)return;let u=`${y.db.id}:${y.tableId}:${x}`,g=O.get(u);g&&(window.clearTimeout(g),O.delete(u)),Me();let _={...y.columnFilters||{}},M=String(q||"").trim();if(M?_[x]=M:delete _[x],y.mode==="schema"){Pe(y.db,y.tableId,{sort:y.sort,columnFilters:_,quiet:!0});return}let G=ae(y.db);G.columnFilters=_,G.page=1,Ve(1)},O=new Map,U=()=>{(!C||C.hidden)&&!h.length&&!w||(B+=1,h=[],w=null,A=-1,C&&(C.hidden=!0,C.innerHTML=""))},oe=(y,x)=>{let q=String(y||""),u=q.toLocaleLowerCase(),g=String(x||"").toLocaleLowerCase(),_=new Array(q.length).fill(!1),M=(fe,Ae)=>{for(let Ne=fe;Ne<fe+Ae;Ne+=1)Ne>=0&&Ne<_.length&&(_[Ne]=!0)},G=u.indexOf(g);if(G>=0)for(;G>=0;)M(G,g.length),G=u.indexOf(g,G+g.length);else{let fe=[];for(let Ae of g.match(/[一-鿿]{2,}/g)||[])for(let Ne=0;Ne<Ae.length-1;Ne+=1)fe.push(Ae.slice(Ne,Ne+2));fe.push(...g.match(/[a-z0-9]+/g)||[]);for(let Ae of fe){let Ne=u.indexOf(Ae);for(;Ne>=0;)M(Ne,Ae.length),Ne=u.indexOf(Ae,Ne+Ae.length)}}let J="",ne=0;for(;ne<q.length;)if(_[ne]){let fe=ne;for(;fe<q.length&&_[fe];)fe+=1;J+=`<mark>${n(q.slice(ne,fe))}</mark>`,ne=fe}else{let fe=ne;for(;fe<q.length&&!_[fe];)fe+=1;J+=n(q.slice(ne,fe)),ne=fe}return J||n(q)},V=(y,x)=>{if(!C)return;let q=y.getBoundingClientRect(),u=Math.min(420,Math.max(220,q.width)),g=Math.min(360,34+x*30),_=q.bottom+4;_+g>window.innerHeight-8&&(_=Math.max(8,q.top-g-4));let M=Math.min(window.innerWidth-u-8,Math.max(8,q.left));C.style.width=`${u}px`,C.style.left=`${M}px`,C.style.top=`${_}px`},qe=y=>{if(!C)return;let x=[...C.querySelectorAll(".schema-suggest-item")];x.length&&(A=Math.max(0,Math.min(x.length-1,y)),x.forEach((q,u)=>{q.classList.toggle("is-active",u===A)}),x[A].scrollIntoView({block:"nearest"}))},I=y=>{let x=h[y],q=w;!x||!q||(U(),R(q,q.column,x))},me=async(y,x,q,u)=>{if(!y||!q.trim()){U();return}let g=++B;w={...y,column:x,input:u},A=-1;try{let _=await F.schemaSuggest({database:y.db.id,table:y.tableId,column:x,query:q,limit:1e3});if(g!==B||document.activeElement!==u||!C)return;let M=Array.isArray(_.values)?_.values:[];if(h=M,!M.length){U();return}let G=Number(_.total)>M.length?`\u5171 ${c(_.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${c(M.length)} \u500B`:`\u5171 ${c(_.total)} \u500B\u7B26\u5408`;C.innerHTML=`<div class="schema-suggest-head">${n(G)}</div>${M.map((J,ne)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${ne}"
            title="${n(J)}">${oe(J,q)}</button>`).join("")}`,V(u,M.length),C.hidden=!1}catch{U()}},Me=()=>{let y=document.activeElement;y instanceof HTMLElement&&y.matches("[data-schema-search]")&&y.blur(),U()},Ie=(y,{resetReport:x=!1}={})=>{Me();let q=ae(y);if(ke.innerHTML=xn(i,v),we.innerHTML=ui(z(),y.id),v==="schema")W.hidden=!0,W.innerHTML="",E.hidden=!1,E.innerHTML=`<div class="schema-category-switch" role="tablist" aria-label="Schema \u985E\u5225">
        ${["law","judgment"].map(u=>{let g=r.find(_=>_.id===u);return g?`<button class="chip${i===u?" is-active":""}" type="button" role="tab" aria-selected="${i===u}" data-action="schema-category" data-category="${u}">${n(g.label)}</button>`:""}).join("")}
      </div>${va(y,T(i)?.label||i,k?.tableId||"")}`;else{E.hidden=!0,E.innerHTML="",W.hidden=!1;let u=pi(i,y,q),g=Sn(y,q);W.innerHTML=`${di(y)}${u?`${u}<details class="data-advanced"><summary>\u9032\u968E metadata \u689D\u4EF6</summary>${g}</details>`:g}<div class="sidebar-note">${mi(y)}</div>`}if(ge(),v==="schema"){let u=k?Se(y,k.tableId):"";if($&&$.key===u){let g=Be(y,$.tableId);$.loading?S.innerHTML=qn(g):$.error?S.innerHTML=An($.error,g):S.innerHTML=ha($.result,g,{columnFilters:$.columnFilters||{},searchEnabled:y.id==="postgres"||y.id==="parquet"})}else S.innerHTML=Si(y);return}x?_e(y):q.result?S.innerHTML=Ps(q.result):_e(y)},He=(y,{persist:x=!0,resetReport:q=!1}={})=>{let u=z(),g=u.find(M=>M.id===y)||u[0];if(!g)return;H=null,te=null,k=null,$=null,b+=1,o=g.id;let _=ue(i,g.id);l[_]||(l[_]=Cs(g,p)),Ie(g,{resetReport:q}),x&&(X(`data.last_database.${i}`,g.id),X("data.last_category",i))},it=(y,{persist:x=!0,resetReport:q=!0,databaseId:u=null}={})=>{let g=T(y)||r[0];if(!g)return;i=g.id,H=null,te=null;let _=g.databases||[],M=u&&_.find(G=>G.id===u)||_.find(G=>G.id===o)||_[0];if(o=M?.id||null,!M){ke.innerHTML=xn(i,v),we.innerHTML=`<div class="sidebar-notice">${ye({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,W.innerHTML="",ge();return}He(M.id,{persist:!1,resetReport:q}),x&&(X("data.last_category",g.id),X(`data.last_database.${g.id}`,M.id))},qt=y=>{let x=ae(y),q=W.querySelector("#data-filter-form");q&&(x.values=Rs(q,y,x))},Ve=async(y=null,{quiet:x=!1}={})=>{let q=Y(o);if(!q)return;Me();let u=ae(q);qt(q),y!==null&&(u.page=y),(!Number.isFinite(u.page)||u.page<1)&&(u.page=1);let g=++d;H=null,te=null;let _=S.querySelector(".report-card"),M=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!_?S.setAttribute("aria-busy","true"):(S.removeAttribute("aria-busy"),S.innerHTML=bs(q));let J=W.querySelector("#run-query");x||pe(J,!0,"\u67E5\u8A62\u4E2D\u2026");try{let ne;if(q.id==="indexeddb"?ne=await Ln(q,u):ne=await F.query({database:q.id,filters:ba(q,u),page:u.page,pageSize:u.pageSize}),s||g!==d)return;if(ne.meta={...ne.meta||{},column_filters:u.columnFilters||{},searchable:q.id==="postgres"||q.id==="parquet",sort:u.sort||ne.meta?.sort||null},u.result=ne,u.page=Number(ne.page)||u.page,u.pageSize=Number(ne.page_size)||u.pageSize,S.removeAttribute("aria-busy"),S.innerHTML=Ps(ne),M!==null){let Ae=S.querySelector("[data-page-size]");Ae&&(Ae.value=String(u.pageSize),Ae.focus({preventScroll:!0}))}let fe=T(i)?.label||i;await us({kind:"data",title:`${fe} \xB7 ${q.label} \xB7 ${ne.table||ne.label||"query"}`,detail:`${c(ne.total)} \u7B46 \xB7 ${ie(ne.duration_ms)}`,payload:{category:i,database:q.id,filters:ba(q,u),page:u.page,page_size:u.pageSize}}),X("data.last_query",{category:i,database:q.id,filters:ba(q,u),page:u.page,page_size:u.pageSize,at:new Date().toISOString()})}catch(ne){if(s||g!==d)return;S.removeAttribute("aria-busy"),S.innerHTML=Os(ne,q),L(ne.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&g===d&&pe(J,!1)}},Qt=(y,x)=>{let q=y?.querySelector("[data-data-fuzzy-results]");q&&(q.innerHTML=x.length?x.map(u=>`<button class="data-fuzzy-option" type="button" role="option" data-action="select-fuzzy-term" data-term="${n(u.value)}"><span>${n(u.label||u.value)}</span><small>${n(u.meta||"")}</small></button>`).join(""):'<div class="data-fuzzy-empty">\u6C92\u6709\u76F8\u8FD1\u7D50\u679C\uFF1B\u6309 Enter \u53EF\u76F4\u63A5\u52A0\u5165\u76EE\u524D\u8F38\u5165\u7684\u95DC\u9375\u5B57\u3002</div>')},ct=async(y,x="")=>{if(!y)return;let q=Y(o),u=q?ae(q):null;if(!u)return;let g=y.dataset.fuzzyKind||i,_=y.querySelector("[data-data-fuzzy-results]"),M=++Q;_&&(_.innerHTML='<div class="data-fuzzy-loading"><span class="spinner"></span><span>\u641C\u5C0B\u76F8\u8FD1\u7D50\u679C\u2026</span></div>');try{let G=await F.dataSuggest({kind:g,query:x,limit:12});if(M!==Q)return;let J=(G.suggestions||[]).filter(ne=>!u.fuzzyTerms.includes(ne.value));Qt(y,J)}catch(G){if(M!==Q)return;_&&(_.innerHTML=`<div class="data-fuzzy-empty">${n(G.message||"\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},Ze=(y,{focus:x=!1}={})=>{if(!y)return;let q=y.querySelector("[data-data-fuzzy-popover]"),u=y.querySelector("[data-data-fuzzy-search]");!q||!u||(q.hidden&&(q.hidden=!1,u.value="",ct(y,"")),x&&(u.focus(),u.select()))},ft=y=>{D&&(window.clearTimeout(D),D=null);let x=y?.querySelector("[data-data-fuzzy-popover]");x&&(x.hidden=!0)},At=async y=>{let x=Y(o);if(!x)return;let q=ae(x),u=String(y||"").trim();!u||q.fuzzyTerms.includes(u)||(q.fuzzyTerms=[...q.fuzzyTerms,u],ft(W.querySelector("[data-data-fuzzy]")),Ie(x),await Ve(1))},Gt=async y=>{let x=Y(o);if(!x)return;let q=ae(x),u=String(y||"").trim();q.fuzzyTerms=q.fuzzyTerms.filter(g=>g!==u),Ie(x),await Ve(1)},Rt=async()=>{re.disabled=!0,pe(re,!0,"\u6574\u7406\u4E2D\u2026");try{let[y,x,q,u,g]=await Promise.all([F.catalog(),Nt("data.last_category","law"),Nt("data.last_database.law","postgres"),Nt("data.last_database.judgment","postgres"),Nt("data.page_size",25)]);if(s)return;a=y,r=Array.isArray(a.categories)?a.categories:[],p=Mn.includes(Number(g))?Number(g):25;for(let ne of r)for(let fe of ne.databases||[]){let Ae=ue(ne.id,fe.id);l[Ae]||(l[Ae]=Cs(fe,p))}let _=r.find(ne=>ne.id===x)||r[0];if(!_){ke.innerHTML="",we.innerHTML=`<div class="sidebar-notice">${ye({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let M=_.id==="judgment"?u:q;if(i=_.id,o=null,it(_.id,{persist:!1,resetReport:!0,databaseId:M}),s)return;let G=Y(o),J=G?ae(G):null;G&&J&&v==="query"&&!J.result&&(G.id==="postgres"||G.id==="parquet")&&Ve(1),L("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(y){if(s)return;a=null,r=[],ke.innerHTML="",ge(),we.innerHTML=`<div class="sidebar-notice">${ye({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:n(y.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${m("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,S.innerHTML=`<div class="report-empty">${Ke({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(re.disabled=!1,pe(re,!1))}};de.addEventListener("change",y=>{let x=y.target;if(x.name==="category"){it(x.value);return}if(x.name==="database"){He(x.value);let _=Y(o),M=_?ae(_):null;_&&M&&!M.result&&v==="query"&&(_.id==="postgres"||_.id==="parquet")&&Ve(1);return}let q=Y(o);if(!q)return;let u=ae(q),g=W.querySelector("#data-filter-form");!g||!x.name||(u.values=Rs(g,q,u),u.page=1,x.name==="table"&&(H=null,te=null,u.sort=null,u.columnFilters={},u.result=null,W.innerHTML=Sn(q,u),_e(q)))}),de.addEventListener("input",y=>{let x=y.target.closest("[data-data-fuzzy-search]");if(x){let _=x.closest("[data-data-fuzzy]");D&&window.clearTimeout(D),D=window.setTimeout(()=>{ct(_,x.value)},160);return}let q=Y(o);if(!q)return;let u=W.querySelector("#data-filter-form");if(!u||!y.target.name||y.target.name==="table")return;let g=ae(q);g.values=Rs(u,q,g)}),de.addEventListener("keydown",y=>{let x=y.target.closest("[data-data-fuzzy-search]");if(!x)return;let q=x.closest("[data-data-fuzzy]");if(y.key==="Escape")y.preventDefault(),ft(q),x.blur();else if(y.key==="Enter"){y.preventDefault();let u=q?.querySelector("[data-action='select-fuzzy-term']");u?u.click():At(x.value)}else y.key==="ArrowDown"&&(y.preventDefault(),q?.querySelector("[data-action='select-fuzzy-term']")?.focus())}),de.addEventListener("mouseover",y=>{let x=y.target.closest("[data-action='open-fuzzy']");x&&Ze(x.closest("[data-data-fuzzy]"))}),de.addEventListener("mouseout",y=>{let x=y.target.closest("[data-data-fuzzy]");x&&(y.relatedTarget&&x.contains(y.relatedTarget)||ft(x))}),de.addEventListener("submit",y=>{y.target.id==="data-filter-form"&&(y.preventDefault(),Ve(1))}),de.addEventListener("click",async y=>{let x=W.querySelector("[data-data-fuzzy] [data-data-fuzzy-popover]:not([hidden])")?.closest("[data-data-fuzzy]");x&&!y.target.closest("[data-data-fuzzy]")&&ft(x);let q=y.target.closest("[data-action]"),u=q?.dataset.action;if(u==="data-nav"){let g=q.dataset.tab,_=Y(o);if(g==="schema"){if(v!=="schema"){if(_){let ne=ae(_),fe=W.querySelector("#data-filter-form");fe&&(ne.values=Rs(fe,_,ne))}v="schema",_&&Ie(_)}return}let M=g==="judgment"?"judgment":"law";v==="schema"&&(v="query"),i!==M?it(M,{databaseId:o,resetReport:!1}):_&&Ie(_);let G=Y(o),J=G?ae(G):null;G&&J&&!J.result&&(G.id==="postgres"||G.id==="parquet")&&Ve(1);return}if(u==="open-fuzzy"){Ze(q.closest("[data-data-fuzzy]"),{focus:!0});return}if(u==="select-fuzzy-term"){await At(q.dataset.term);return}if(u==="remove-fuzzy-term"){await Gt(q.dataset.term);return}if(u==="schema-category"){v="schema",it(q.dataset.category||"law",{resetReport:!0});return}if(u==="select-schema-table"){let g=Y(o);if(!g)return;Pe(g,q.dataset.tableId||"");return}if(u==="reset"){let g=Y(o);if(!g)return;H=null,te=null;let _=ae(g);l[ue(i,g.id)]=Cs(g,_.pageSize),Ie(g),_e(g),L("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}y.target.closest("#catalog-retry")&&Rt()}),S.addEventListener("input",y=>{let x=y.target.closest("[data-schema-search]");if(!x)return;let q=j();if(!q)return;let u=x.dataset.schemaSearch||"",g=x.value,_=`${q.mode}:${q.db.id}:${q.tableId}:${u}`,M=O.get(_);if(M&&window.clearTimeout(M),!g.trim()){O.delete(_),U(),R(q,u,"");return}let G=window.setTimeout(()=>{O.delete(_),me(q,u,g,x)},250);O.set(_,G)}),S.addEventListener("keydown",y=>{let x=y.target.closest("[data-schema-search]");if(!x)return;let q=j();if(q){if(y.key==="Escape"){U();return}if(y.key==="ArrowDown"||y.key==="ArrowUp"){if(!C||C.hidden)return;y.preventDefault();let u=y.key==="ArrowDown"?1:-1;qe(A<0?u>0?0:h.length-1:A+u);return}if(y.key==="Enter"){if(y.preventDefault(),C&&!C.hidden&&A>=0){I(A);return}R(q,x.dataset.schemaSearch||"",x.value)}}}),C?.addEventListener("mousedown",y=>{y.preventDefault()}),C?.addEventListener("click",y=>{let x=y.target.closest("[data-schema-suggest-index]");x&&I(Number(x.dataset.schemaSuggestIndex))});let Jt=y=>{y.target.closest("[data-schema-search]")||C?.contains(y.target)||U()};return document.addEventListener("click",Jt),window.addEventListener("scroll",U,{capture:!0,passive:!0}),window.addEventListener("resize",U),S.addEventListener("keydown",y=>{y.target.matches(".law-jump-input")&&y.key==="Enter"&&(y.preventDefault(),se(y.target.id))}),S.addEventListener("click",async y=>{let x=y.target.closest("[data-action]");if(!x)return;let q=x.dataset.action,u=Y(o),g=u?ae(u):null,_=g?.result;if(q==="back-to-results"){je();return}if(q==="open-law"){ce({lawKey:x.dataset.lawKey||"",sourceType:x.dataset.lawSource||"",lawName:x.dataset.lawName||""});return}if(q==="open-judgment"){ve({jid:x.dataset.jid||""});return}if(q==="jump-article"){se(x.dataset.jumpInput||"law-article-jump");return}if(q==="sort-column"){let M=x.dataset.sortKey||"";if(!M||!u)return;if(v==="schema"&&$?.result){let ne=$.sort,fe=M==="jdate"||M==="law_modified_date"||M==="article_count"||M==="citation_count"||M==="full_text_length"||M==="created_at"||M==="updated_at",Ae=ne?.key===M?ne.direction==="asc"?"desc":"asc":fe?"desc":"asc";Pe(u,$.tableId,{sort:{key:M,direction:Ae},columnFilters:$.columnFilters||{},quiet:!0});return}if(!g)return;let G=g.sort,J=G?.key===M?G.direction==="asc"?"desc":"asc":M==="jdate"?"desc":"asc";g.sort={key:M,direction:J},Ve(1,{quiet:!0});return}if(q==="retry"){Ve(g?.page||1);return}if(_){if(q==="prev-page"){Ve(Math.max(1,Number(_.page)-1),{quiet:!0});return}if(q==="next-page"){let M=Math.max(1,Math.ceil(Number(_.total)/Number(_.page_size)));Ve(Math.min(M,Number(_.page)+1),{quiet:!0});return}if(q==="copy-query"){let M=await ss(_.query_text||"");L(M?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",M?"ok":"warn");return}if(q==="export-json"){let M=`${_.database}-${_.table||"query"}-page-${_.page}.json`;$t(M,JSON.stringify(Ds(_),null,2),"application/json;charset=utf-8"),L(`\u5DF2\u532F\u51FA ${M}`,"ok");return}if(q==="export-csv"){let M=`${_.database}-${_.table||"query"}-page-${_.page}.csv`;$t(M,Bs(_),"text/csv;charset=utf-8"),L(`\u5DF2\u532F\u51FA ${M}`,"ok")}}}),S.addEventListener("change",y=>{let x=y.target.closest("[data-action='select-law-version']");if(x&&H){ce({lawKey:H.lawKey,sourceType:H.sourceType,lawName:H.lawName,versionId:x.value});return}if(!y.target.matches("[data-page-size]"))return;let q=Y(o);if(!q)return;let u=ae(q);u.pageSize=Number(y.target.value)||25,u.page=1,X("data.page_size",u.pageSize),Ve(1,{quiet:!0})}),re.addEventListener("click",()=>{Rt()}),await Rt(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0,D&&window.clearTimeout(D);for(let y of O.values())window.clearTimeout(y);O.clear(),U(),document.removeEventListener("click",Jt),window.removeEventListener("scroll",U,{capture:!0}),window.removeEventListener("resize",U)}}var Dn=[10,25,50,100],Hi=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function ka(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function zi(e,t=e){return`<option value="${n(e)}">${n(t)}</option>`}function vs(e,t,s,a,r=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${n(t)}</span>
      <span class="field-tag">${n(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${n(e)}">
      ${zi("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${n(i)}" ${String(i)===String(a)?"selected":""}>${n(i)}</option>`).join("")}
    </select>
    ${r?`<span class="field-help">${n(r)}</span>`:""}
  </div>`}function Ui(e,t){let s=Hi.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${vs("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${vs("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${vs("model","\u6A21\u578B",e.models||[],t.model)}
    ${vs("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${vs("method","\u65B9\u6CD5",e.methods||[],t.method)}
    <div class="field">
      <label class="field-label" for="performance-keyword">
        <span>\u95DC\u9375\u5B57</span>
        <span class="field-tag">keyword</span>
      </label>
      <input class="input" type="text" id="performance-keyword" name="keyword"
        value="${n(t.keyword)}" placeholder="\u7A0B\u5E8F\u3001\u6A21\u7D44\u3001\u8DEF\u5F91\u6216 Request ID" />
    </div>
    <div class="field-row">
      <div class="field">
        <label class="field-label" for="performance-from_date">
          <span>\u65E5\u671F\u8D77</span>
          <span class="field-tag">from_date</span>
        </label>
        <input class="input" type="date" id="performance-from_date" name="from_date"
          value="${n(t.from_date)}" />
      </div>
      <div class="field">
        <label class="field-label" for="performance-to_date">
          <span>\u65E5\u671F\u8FC4</span>
          <span class="field-tag">to_date</span>
        </label>
        <input class="input" type="date" id="performance-to_date" name="to_date"
          value="${n(t.to_date)}" />
      </div>
    </div>
    <div class="field">
      <label class="field-label" for="performance-min_duration">
        <span>\u8017\u6642\u4E0B\u9650\uFF08ms\uFF09</span>
        <span class="field-tag">min_duration</span>
      </label>
      <input class="input" type="number" min="0" step="1" id="performance-min_duration"
        name="min_duration" value="${n(t.min_duration)}" placeholder="\u4F8B\u5982 100" />
    </div>
    <div class="field">
      <label class="field-label" for="performance-sort">
        <span>\u6392\u5E8F</span>
        <span class="field-tag">sort</span>
      </label>
      <select class="select" id="performance-sort" name="sort">${s}</select>
    </div>`}function Pn(){let e=document.getElementById("performance-filter-form");if(!e)return ka();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function In(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function On(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),r=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${r}.${i}`}var Qi=[{key:"parsing",label:"Parsing",hint:"\u8F38\u5165\u9577\u5EA6\u3001\u89E3\u6790\u6642\u9593",names:["rag.parse_question"],color:"#64748b"},{key:"embedding",label:"Embedding",hint:"Model\u3001Token\u3001Batch\u3001\u8017\u6642",names:["rag.embed_query"],color:"#3984c6"},{key:"qdrant",label:"Qdrant Search",hint:"Collection\u3001Filter\u3001Top K\u3001\u8017\u6642",names:["rag.qdrant_search"],color:"#d97706"},{key:"reranker",label:"Reranker",hint:"Model\u3001\u5019\u9078\u7B46\u6578\u3001\u8017\u6642",names:["rag.rerank"],color:"#8b5cf6"},{key:"context",label:"Context",hint:"Chunk \u6578\u3001Token \u6578\u3001\u8017\u6642",names:["rag.context"],fallbackNames:["rag.fetch_documents","rag.build_citations"],color:"#64748b"},{key:"llm",label:"LLM",hint:"Model\u3001Input/Output Token\u3001TTFT\u3001\u8017\u6642",names:["rag.llm_request"],color:"#16a34a"}],Fs={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"};function Fn(e){let t=e?.metadata?.rag_response||{},s=String(t.status||e?.metadata?.rag_status||e?.status||"");return s==="operational"||s==="success"?{label:"Completed",tone:"ok"}:s==="retrieval_only"?{label:"Abstain",tone:"warn"}:s==="preview"?{label:"Preview",tone:"info"}:s==="failed"||s==="error"?{label:"Failed",tone:"danger"}:{label:s||"Unknown",tone:"idle"}}function Sa(e){let t=Math.max(0,Number(e?.offset_ms)||0),s=Math.max(0,Number(e?.duration_ms)||0),a=Math.max(t,Number(e?.end_offset_ms)||t+s);return{...e,offset:t,end:a,duration:Math.max(s,a-t)}}function Hn(e,t=0){let s=Array.isArray(e?.segments)?[...e.segments].sort((v,k)=>Number(v.offset_ms||0)-Number(k.offset_ms||0)):[],a=Math.max(Number(e?.total_ms)||0,Number(t)||0,...s.map(v=>Sa(v).end),1),r=Qi.map(v=>{let k=s.filter(w=>v.names.includes(w.name));!k.length&&v.fallbackNames&&(k=s.filter(w=>v.fallbackNames.includes(w.name)));let $=k.map(Sa),b=$.length?Math.min(...$.map(w=>w.offset)):null,h=$.length?Math.max(...$.map(w=>w.end)):null;return{...v,spans:$,start:b,end:h,duration:b===null?null:h-b}}),i=[];for(let v of r)if(!(v.key!=="embedding"&&v.key!=="llm"))for(let k of v.spans){let $=k.metadata||{},b=Number($.load_duration_ms),h=Number.isFinite(b)&&b>0?b:0,w=Math.max(0,Number(k.duration)||0);i.push({...k,offset:k.offset,end:k.offset+h,duration:h,metadata:{...$,source_stage:v.label,model_load_ms:h,request_duration_ms:w,warm_duration_ms:Math.max(0,w-h),cold_start:h>=100},params:{...k.params||{},source_stage:v.label}})}if(i.length){let v=i.reduce((k,$)=>k+$.duration,0);r.push({key:"model_load",label:"Model Load",hint:"\u51B7\u555F\u52D5\u8F09\u5165 vs \u71B1\u555F\u52D5\u63A8\u8AD6",color:"#0ea5e9",spans:i,start:Math.min(...i.map(k=>k.offset)),end:Math.max(...i.map(k=>k.end)),duration:v})}let o=Math.max(0,...r.flatMap(v=>v.spans.map(k=>k.end))),l=e?.metadata?.rag_response||{},d=Fn(e),p=Math.min(a,o);return r.push({key:"response",label:"Response",hint:"\u7E3D\u8017\u6642\u3001\u5F15\u7528\u6578\u3001\u6210\u529F\u6216 Abstain",color:"#0f766e",spans:[{offset:p,end:a,duration:Math.max(0,a-p),status:d.tone==="danger"?"error":"ok",metadata:l,params:{},started_at:e?.started_at,finished_at:e?.finished_at}],start:p,end:a,duration:Math.max(0,a-p),responseMetadata:l}),{total:a,stages:r,response:l,traceStatus:d,requestId:e?.request_id||"",startedAt:e?.started_at,finishedAt:e?.finished_at,client:e?.client||{},models:Array.isArray(e?.summary?.models)?e.summary.models:[]}}function zn(e){let t=[],s=(d,p)=>{p==null||p===""||t.push([d,String(p)])},a=e.spans[0]||null;if(!a)return s("\u72C0\u614B","\u6B64\u7D00\u9304\u6C92\u6709\u9019\u500B span"),t;let r=a.params||{},i=a.metadata||{},o=Un(a),l=xa(a);if(e.key==="response")return s("Trace \u72C0\u614B",e.responseMetadata.status||"\u2014"),s("Answer source",e.responseMetadata.answer_source||"\u2014"),s("Abstain",e.responseMetadata.abstain?"\u662F":"\u5426"),s("\u5F15\u7528\u7E3D\u6578",e.responseMetadata.citation_count??"\u2014"),s("\u5224\u6C7A\uFF0F\u6CD5\u898F\u5F15\u7528",`${e.responseMetadata.judgment_citations??"\u2014"} / ${e.responseMetadata.law_citations??"\u2014"}`),s("\u7E3D\u8017\u6642",ie(e.duration)),t;if(s("\u958B\u59CB",`${On(a.started_at)||"\u2014"} \xB7 +${a.offset.toFixed(1)} ms`),s("\u7D50\u675F",`${On(a.finished_at)||"\u2014"} \xB7 +${a.end.toFixed(1)} ms`),s("\u8017\u6642",ie(a.duration)),e.key==="parsing")s("\u8F38\u5165\u9577\u5EA6",i.input_length??r.input_length),s("\u6B63\u898F\u5316\u9577\u5EA6",i.normalized_length??r.normalized_length),s("\u79FB\u9664\u7A7A\u767D",i.trimmed_chars);else if(e.key==="embedding")s("Model",l||i.model||r.model),s("\u4E3B\u6A5F",o),s("Endpoint",i.active_base_url||i.base_url),s("Input tokens",i.prompt_eval_count),s("Batch",i.batch),s("\u5411\u91CF\u7DAD\u5EA6",i.dimensions),s("Fallback",i.fallback_used?"\u662F":"\u5426");else if(e.key==="qdrant")s("Collection",i.collection||r.collection),i.filter&&s("Filter",In(i.filter)),s("Top K",i.top_k??r.limit),s("Hits",i.hits),s("Unique judgments",i.unique_judgments),s("Top score",i.top_score);else if(e.key==="reranker")s("Model",l||i.model||r.model),s("\u4E3B\u6A5F",o),s("\u5019\u9078\u7B46\u6578",i.candidates),s("\u9078\u7528\u7B46\u6578",i.selected);else if(e.key==="context")s("Chunks",i.chunks),s("\u5224\u6C7A chunks",i.judgment_chunks),s("\u6CD5\u898F chunks",i.law_chunks),s("Token \u4F30\u7B97",i.token_estimate),s("Context \u5B57\u5143",i.context_chars),s("\u6587\u4EF6\u6578",i.documents);else if(e.key==="llm")s("Model",l||i.model||r.model),s("\u4E3B\u6A5F",o),s("Endpoint",i.base_url||r.url),s("Input tokens",i.input_tokens),s("Output tokens",i.output_tokens),s("TTFT",i.ttft_ms===null||i.ttft_ms===void 0?"\u2014":ie(i.ttft_ms)),s("API \u7E3D\u8017\u6642",i.total_duration_ms===null||i.total_duration_ms===void 0?"\u2014":ie(i.total_duration_ms)),s("\u8F09\u5165\u8017\u6642",i.load_duration_ms===null||i.load_duration_ms===void 0?"\u2014":ie(i.load_duration_ms)),s("Strict retry",i.strict?"\u662F":"\u5426");else if(e.key==="model_load"){if(s("Model",l||i.model||r.model),s("\u4E3B\u6A5F",o),s("\u4F86\u6E90\u968E\u6BB5",i.source_stage),s("\u51B7\u555F\u52D5",i.cold_start?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09"),s("\u6A21\u578B\u547C\u53EB\u7E3D\u8017\u6642",i.request_duration_ms===null||i.request_duration_ms===void 0?"\u2014":ie(i.request_duration_ms)),s("\u8F09\u5165\u8017\u6642",i.model_load_ms===null||i.model_load_ms===void 0?"\u2014":ie(i.model_load_ms)),s("\u6263\u9664\u8F09\u5165\u5F8C\u6D41\u7A0B\u6642\u9593",i.warm_duration_ms===null||i.warm_duration_ms===void 0?"\u2014":ie(i.warm_duration_ms)),Number(i.request_duration_ms)>0&&Number(i.model_load_ms)>=0){let d=Number(i.model_load_ms)/Number(i.request_duration_ms)*100;s("\u8F09\u5165\u5360\u6BD4",`${d.toFixed(d>=10?0:1)}%`)}i.eval_duration_ms!==null&&i.eval_duration_ms!==void 0&&s("\u63A8\u8AD6\u8017\u6642",ie(i.eval_duration_ms))}else if(e.key==="segment"||e.key==="test_stage")if(s("Model",l||i.model||r.model),s("\u72C0\u614B",i.status||a.status),e.key==="test_stage")s("\u9032\u5EA6",i.progress===null||i.progress===void 0?"":`${Number(i.progress)||0}%`),a.error&&s("\u932F\u8AA4",a.error);else{a.error&&s("\u932F\u8AA4",a.error);for(let[d,p]of Object.entries(r).slice(0,10))s(d,In(p))}return e.spans.length>1&&(e.key==="model_load"?s("\u5404\u6A21\u578B\u8F09\u5165",e.spans.map(d=>`${d.metadata?.source_stage||"model"} ${xa(d)} ${ie(d.metadata?.model_load_ms||0)}`).join(" \xB7 ")):(s("Span \u6578",e.spans.length),s("Span \u660E\u7D30",e.spans.map((d,p)=>`#${p+1} +${d.offset.toFixed(0)}ms/${ie(d.duration)}`).join(" \xB7 ")))),a.module&&s("Module",a.module),a.function&&s("Function",a.function),t}function Gi(e){let t=String(e||"").trim();if(!t)return"";try{return new URL(t.includes("://")?t:`http://${t}`).hostname||t}catch{return t}}function Un(e){let t=e?.metadata||{},s=String(t.provider_name||"").trim();if(s)return s;let a=String(t.active_base_url||t.base_url||e?.params?.url||"").trim();return Gi(a)}function Ji(e){let t=e?.metadata||{};return String(t.model||e?.params?.model||"").trim()}function xa(e){let t=Un(e),s=Ji(e);return s?t?`${t}:${s}`:s:""}function Vi(e){let t=new Set;for(let s of e?.spans||[]){let a=xa(s);a&&t.add(a)}return[...t]}function Wi(e,t){let s=zn({...e,spans:[t]});return[String(e.label||""),...s.map(([a,r])=>`${a}: ${r}`)].join(`
`)}function Ki(e,t){let s=e.spans||[],a=Vi(e),r=Math.max(1,Math.min(4,s.length)),i=s.length>1,o=i?Math.max(12,r*7):12,l=s.slice(0,4).map((k,$)=>{if(Number(k.duration)<=0)return"";let b=Math.max(0,Math.min(100,k.offset/t*100)),h=Math.max(.35,Math.min(100-b,k.duration/t*100)),w=i?$*7:0,A=i?6:12,B=Wi(e,k);return`<span class="rag-wf-bar" style="left:${b.toFixed(3)}%;width:${h.toFixed(3)}%;top:${w}px;height:${A}px"
        data-rag-wf-tip="${n(B)}"
        aria-label="${n(B)}" role="img"></span>`}).join(""),d=zn(e).map(([k,$])=>`<span class="rag-wf-detail"><span>${n(k)}</span><strong>${n($)}</strong></span>`).join(""),p=s.length?s.some(k=>k.status==="error")?"is-error":"":"is-missing",v=s.length?ie(e.duration):"\u672A\u8A18\u9304";return`<details class="rag-wf-stage ${p}" style="--stage-color:${e.color}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong>${n(e.label)}</strong><small>${n(e.hint)}</small>${a.length?`<small class="rag-wf-model-line">${n(a.join(" \xB7 "))}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${v} \xB7 ${s.length?`${s.length} span`:"\u2014"} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:${o}px">${l}</span>
    </summary>
    <div class="rag-wf-details">${d}</div>
  </details>`}function Qn(e,t,s=!1){let a=e.response||{},r=e.client||{},i=e.models||[];return`<div class="rag-wf-summary">
      <span>\u7E3D\u8017\u6642 <strong>${n(ie(e.total))}</strong></span>
      <span>Server <strong>${n(ie(t))}</strong></span>
      ${r.total_ms?`<span>Client <strong>${n(ie(r.total_ms))}</strong></span>`:""}
      ${r.render_ms!==void 0?`<span>Render <strong>${n(ie(r.render_ms))}</strong></span>`:""}
      <span>\u5F15\u7528 <strong>${n(String(a.citation_count??"\u2014"))}</strong></span>
      <span>Abstain <strong>${a.abstain?"\u662F":"\u5426"}</strong></span>
      ${i.length?`<span>Model <strong>${n(i.join(" \xB7 "))}</strong></span>`:""}
      ${s?'<span class="rag-wf-updating">\u66F4\u65B0\u4E2D\u2026</span>':""}
    </div>`}function rs(e,t,s="\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\uFF0C\u67E5\u770B\u53C3\u6578\u3001Token\u3001TTFT\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u4F86\u6E90\u6578\u91CF\u3002Waterfall \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u5E73\u884C\u57F7\u884C\u7684 span \u6703\u4F9D\u5BE6\u969B\u6642\u9593\u91CD\u758A\u986F\u793A\u3002"){return`<div class="rag-wf-axis"><span>0 ms</span><span>${n(ie(t))}</span></div>
    <div class="rag-wf-stages">${(e||[]).map(a=>Ki(a,t)).join("")}</div>
    <p class="rag-wf-hint">${n(s)}</p>`}function Gn(e){return rs(e.stages,e.total)}function Hs(e,{serverDurationMs:t=0,loading:s=!1,embedded:a=!1}={}){if(!e||typeof e!="object")return"";let r=Hn(e,t),i=r.traceStatus;return`<section class="report-card rag-wf-card${a?" rag-wf-embedded":""}">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${Fs[i.tone]||Fs.idle}">${n(i.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${n(r.requestId||"\u2014")}</span>
          \xB7 ${n($e(r.startedAt))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <a class="btn btn-secondary btn-sm" href="#/performance">
          ${m("activity",14)}<span>\u5B8C\u6574 Flow</span>
        </a>
      </div>
    </div>
    ${Qn(r,t,s)}
    ${Gn(r)}
  </section>`}var Ye=null;function Yi(){return Ye||(Ye=document.createElement("div"),Ye.className="rag-wf-tooltip",Ye.hidden=!0,document.body.appendChild(Ye),Ye)}function qa(){Ye&&(Ye.hidden=!0)}function Jn(e){if(!Ye||Ye.hidden)return;let t=14,s=10,a=Ye.getBoundingClientRect(),r=e.clientX+t,i=e.clientY+t;r+a.width>window.innerWidth-s&&(r=e.clientX-a.width-t),i+a.height>window.innerHeight-s&&(i=e.clientY-a.height-t),Ye.style.left=`${Math.max(s,r)}px`,Ye.style.top=`${Math.max(s,i)}px`}document.addEventListener("pointerover",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=Yi(),a=t.dataset.ragWfTip||"";a&&(s.textContent=a,s.hidden=!1,Jn(e))});document.addEventListener("pointermove",e=>{if(!(!Ye||Ye.hidden)){if(!e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]")){qa();return}Jn(e)}});document.addEventListener("pointerout",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=e.relatedTarget;s instanceof Node&&t.contains(s)||qa()});window.addEventListener("scroll",qa,{capture:!0,passive:!0});function Xi(e,t,s,a){if(a&&!e.length)return`<div class="report-card rag-wf-card">
      ${ye({tone:"danger",title:"RAG Pipeline \u8B80\u53D6\u5931\u6557",text:n(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">${m("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;if(!e.length)return`<div class="report-card rag-wf-card">
      ${Ke({iconName:"activity",title:s?"\u8B80\u53D6 RAG Pipeline\u2026":"\u5C1A\u7121 RAG Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684 RAG \u554F\u7B54 Trace\u3002":"\u7522\u751F\u65B0\u7684 RAG \u554F\u7B54\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A Parsing\u3001Embedding\u3001Qdrant\u3001Context\u3001LLM \u8207 Response \u7684 waterfall\u3002"})}
    </div>`;let r=e.find(p=>String(p.id)===String(t))||e[0],i=r.flow&&typeof r.flow=="object"?r.flow:{},o=Hn(i,r.duration_ms),l=o.traceStatus,d=e.map(p=>{let v=Fn(p.flow||{});return`<option value="${n(String(p.id))}" ${String(p.id)===String(r.id)?"selected":""}>#${n(String(p.id))} \xB7 ${n($e(p.started_at))} \xB7 ${n(ie(p.duration_ms))} \xB7 ${n(v.label)}</option>`}).join("");return`<section class="report-card rag-wf-card">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${Fs[l.tone]||Fs.idle}">${n(l.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${n(o.requestId||r.request_id||"\u2014")}</span>
          \xB7 ${n($e(r.started_at))}
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
    ${Qn(o,r.duration_ms,s)}
    ${Gn(o)}
  </section>`}function Zi(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},r=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?ie(a.avg_total_ms??0):"\u2014",o=a.samples?ie(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
                    <span class="chip">${n(l.label||"\u2014")}</span>
                    <span class="perf-model-count">${c(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${ie(l.avg_ms)}`:""}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u65B0\u7684 Flow \u6703\u5F9E params.model \u81EA\u52D5\u5F59\u6574\u3002</p>'}
      </div>
      <div class="perf-flow-stat-panel">
        <div class="report-section-head">
          <span class="report-section-title">\u6700\u6162\u5340\u6BB5\uFF08\u5E73\u5747\uFF09</span>
          <span class="muted" style="font-size:9.5px">\u6700\u8FD1 ${c(e?.sample_size??0)} \u7B46</span>
        </div>
        ${t.length?`<div class="perf-seg-list">${t.slice(0,6).map(l=>`<div class="perf-seg-row">
                    <span class="perf-seg-name" title="${n(l.label)}">${n(l.label)}</span>
                    <span class="perf-seg-track"><span style="width:${Math.max(2,(Number(l.avg_ms)||0)/r*100).toFixed(1)}%"></span></span>
                    <span class="perf-seg-ms">${ie(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function nt(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),r=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(r).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:r?`${r}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function Vn(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function eo(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let r=Number(a.points_per_second)||0,i=Math.max(2,r/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${n(Vn(a))}</strong>
          <span>${n($e(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${n(`${c(a.indexed_count)} \u7B46 \xB7 ${nt(a.duration_ms)} \xB7 ${c(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${r.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${c(a.indexed_count)} \u7B46 \xB7 ${nt(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function to(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${n(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${n(`${s.label} ${nt(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${n(s.key)}"></i>
            <span>${n(s.label)}</span>
            <strong>${nt(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 Ollama Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function so(e,t){let s=(Array.isArray(e)?e:[]).map(B=>({elapsed:Math.max(0,Number(B.elapsed_s)||0),indexed:Math.max(0,Number(B.indexed)||0)})).filter(B=>B.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(B=>B.elapsed),(Number(t)||0)/1e3,1),r=Math.max(...s.map(B=>B.indexed),1),i=760,o=150,l=12,d=12,p=i-l*2,v=o-d*2,k=s.map(B=>[l+B.elapsed/a*p,o-d-B.indexed/r*v]),$=k.map(([B,Q],D)=>`${D===0?"M":"L"}${B.toFixed(1)},${Q.toFixed(1)}`).join(" "),b=`${$} L${k[k.length-1][0].toFixed(1)},${o-d} L${k[0][0].toFixed(1)},${o-d} Z`,h=Math.max(1,Math.ceil(k.length/14)),w=k.map(([B,Q],D)=>D%h===0||D===k.length-1?`<circle cx="${B.toFixed(1)}" cy="${Q.toFixed(1)}" r="2.6" />`:"").join(""),A=[0,1,2,3].map(B=>{let Q=d+v/3*B;return`<line x1="${l}" y1="${Q.toFixed(1)}" x2="${i-l}" y2="${Q.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${c(r)} \u7B46 \xB7 ${nt(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${A}
      <path d="${b}" class="index-progress-area"></path>
      <path d="${$}" class="index-progress-line"></path>
      ${w}
      <line x1="${l}" y1="${o-d}" x2="${i-l}" y2="${o-d}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${d}" x2="${l}" y2="${o-d}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${nt(a*500)}</span>
      <span>${nt(a*1e3)}</span>
    </div>
  </div>`}function ao(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},r=t.coverage||{},i=r.total_judgments>0?`${c(r.indexed_judgments)} / ${c(r.total_judgments)}\uFF08${(100*r.indexed_judgments/r.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:c(t.indexed_count),note:`${c(t.batch_count)} \u6279 \xD7 ${c(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:nt(t.duration_ms),note:`${c(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:nt(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${nt(t.batch_min_ms)} \xB7 \u6700\u6162 ${nt(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${c(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${n(Vn(t))}</span>
    </div>
    <div class="index-perf-summary">
      ${o.map(l=>`<div class="index-perf-stat">
            <div class="summary-label">${n(l.label)}</div>
            <div class="index-perf-value">${n(l.value)}</div>
            <div class="index-perf-note">${n(l.note)}</div>
          </div>`).join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${n($e(t.started_at))}</span>
      <span><strong>batch</strong> ${c(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${c(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${c(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${n(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${nt(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${eo(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${nt(t.duration_ms)}</span>
        </div>
        ${to(t)}
      </div>
    </div>
    ${so(t.progress,t.duration_ms)}
  </section>`}function no(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Dn.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${m("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${m("chevronRight",13)}</button>
    </div>
  </div>`}function ro(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"#65a30d":t.includes("judgment.rag")?"#8b5cf6":t.includes("judgment.web.app")?"#3b82f6":t.includes("judgment.web.query")?"#d97706":t.includes("judgment.judgment_index")?"#0d9488":"#64748b"}function io(e){let t=Sa(e),s=Math.max(0,Math.min(8,Number(e.depth)||0));return{key:"segment",label:`${"\u203A ".repeat(s)}${e.name||"unnamed"}`,hint:[e.module||"\u2014",e.function||"\u2014"].join(" \xB7 "),color:ro(e),spans:[{...t,status:e.status||"ok",error:e.error,metadata:e.metadata||{},params:e.params||{},started_at:e.started_at,finished_at:e.finished_at}],start:t.offset,end:t.end,duration:t.duration}}function zs(e){return(e||[]).map(io)}function oo(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort(($,b)=>Number($.seq)-Number(b.seq)):[],r=s?.summary||{},i=Array.isArray(r.models)?r.models:[],o=s?.client||{},l=s?.metadata||{},d=l.question||"",p=l.answer||"",v=d||p?`<div class="perf-flow-qa">
          ${d?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${n(d)}</span></div>`:""}
          ${p?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${n(p)}</span></div>`:""}
        </div>`:"",k=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map($=>(Number($.offset_ms)||0)+(Number($.duration_ms)||0)),1);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${n(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${n(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${n(e.method||"")} ${n(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${$e(e.started_at)}</span>
      <span class="perf-record-duration">${ie(e.duration_ms)}</span>
      ${Le(e.status)}
      <span class="perf-record-chevron">${m("chevronRight",14)}</span>
    </summary>
    <div class="perf-record-body">
      <div class="perf-flow-meta">
        <span><strong>Request</strong> <span class="mono">${n(e.request_id||s?.request_id||"\u2014")}</span></span>
        <span><strong>Server</strong> ${ie(e.duration_ms)}</span>
        ${o.total_ms?`<span><strong>Client \u5168\u6D41\u7A0B</strong> ${ie(o.total_ms)}</span>`:""}
        ${o.render_ms!==void 0?`<span><strong>Render</strong> ${ie(o.render_ms)}</span>`:""}
        <span><strong>Flow</strong> ${a.length} \u6BB5</span>
        ${a.length?"<span><strong>Waterfall</strong> \u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\u3001\u53EF\u9EDE\u9078\u5C55\u958B\u53C3\u6578</span>":""}
      </div>
      ${v}
      ${i.length?`<div class="chips perf-record-models">${i.map($=>`<span class="chip">${n($)}</span>`).join("")}</div>`:""}
      ${a.length?rs(zs(a),k,"\u6B64 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002"):`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${n(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${n(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var Bn={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"};function lo(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}var co={embedding:"#3984c6",retrieval:"#d97706",context:"#64748b",llm:"#16a34a",validation:"#8b5cf6"};function uo(e,t){let s=Date.parse(e.started_at||""),a=Date.now(),r=Array.isArray(e.stage_order)?[...e.stage_order]:Object.keys(Bn);for(let p of t)p.stage&&!r.includes(p.stage)&&r.push(p.stage);let i=[],o=0;for(let p of r){let v=t.filter(b=>b.stage===p);if(!v.length)continue;let k=v.map(b=>{let h=Date.parse(b.started_at||""),w=Number.isFinite(s)&&Number.isFinite(h)?Math.max(0,h-s):0,A=Math.max(0,Number(b.duration_ms)||0);b.status==="running"&&Number.isFinite(h)&&(A=Math.max(A,a-h));let B=w+A;return o=Math.max(o,B),{offset:w,end:B,duration:A,status:b.status==="failed"?"error":b.status==="running"?"running":"ok",started_at:b.started_at,finished_at:b.finished_at,error:b.error_message,metadata:{...b.details||{},model:b.model,status:b.status,progress:Number(b.progress)||0,module:b.module,function:b.function},params:{model:b.model}}}),$=k.reduce((b,h)=>b+h.duration,0);i.push({key:"test_stage",label:Bn[p]||p,hint:`${k.length} \u500B\u7A0B\u5E8F`,color:co[p]||"#64748b",spans:k,start:k.length?Math.min(...k.map(b=>b.offset)):null,end:k.length?Math.max(...k.map(b=>b.end)):null,duration:$})}let l=e.status==="running"&&Number.isFinite(s)?Math.max(0,a-s):0,d=Math.max(Number(e.total_ms)||0,l,o,1);return{stages:i,total:d}}function is(e,t,s,a={}){let r=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(w=>`<option value="${n(w.run_id)}" ${w.run_id===s?"selected":""}>${n(lo(w.status))} \xB7 ${n((w.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${n($e(w.started_at))}</option>`)].join(""),o=r?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${m("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${m("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?Le(e.status):""}</div>
      <div class="test-flow-question">${e?n(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${Ke({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let d=Array.isArray(e.steps)?e.steps:[],p=uo(e,d),v=e.models||{},k=e.status==="running"?`${ie(p.total)}\uFF08\u4F30\u7B97\uFF09`:ie(e.total_ms),$=d.find(w=>w.stage==="llm"&&w.model===e.summary?.primary_model)||d.find(w=>w.stage==="llm"&&w.details?.answer_preview),b=e.answer||$?.details?.answer_preview||"",h=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${e.summary?.primary_model?`<span class="mono">${n(e.summary.primary_model)}</span>`:""}
    </div>
    <p>${b?n(b):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${n(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${n($e(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${k}</span>
      <span><strong>Embedding</strong> ${Array.isArray(v.embedding)?v.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(v.llm)?v.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${n(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${h}
    ${p.stages.length?rs(p.stages,p.total,"\u6E2C\u8A66 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B\u7A0B\u5E8F\u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u6A21\u578B\u3001\u72C0\u614B\u3001\u9032\u5EA6\u3001module\uFF0Ffunction \u8207\u932F\u8AA4\u3002"):'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":r?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${e.summary?.primary_model?`<span class="mono">primary=${n(e.summary.primary_model)}</span>`:""}
    </div>
  </div>`}function po(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},r=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${Le(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${c(e.total)} \u7B46\u7B26\u5408 \xB7 ${ie(e.duration_ms)} \xB7
          \u6BCF\u6B21\u57F7\u884C\u6309\u9215\u7684\u5B8C\u6574 Flow
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${m("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${m("file",14)}<span>JSON</span></button>
      </div>
    </div>
    ${s.length?`<div class="summary-strip">${s.map(i=>`<div class="summary-item">
                <div class="summary-label">${n(i.label)}</div>
                <div class="summary-value">${n(i.value)}</div>
              </div>`).join("")}</div>`:""}
    ${ao(r)}
    ${Zi(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>oo(i,o)).join(""):Ke({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${no(e)}
    <details class="perf-query-details">
      <summary>\u67E5\u8A62\u8A9E\u53E5\u8207\u8B66\u544A</summary>
      <div class="query-box">
        <pre class="query-code">${n(e.query_text||"\u2014")}</pre>
        <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
          ${m("copy",12)}<span>\u8907\u88FD</span>
        </button>
      </div>
      ${Array.isArray(e.warnings)&&e.warnings.length?`<div class="warnings">${e.warnings.map(i=>`<div class="warning-line">${n(i)}</div>`).join("")}</div>`:""}
    </details>
  </div>`}async function mo(e,t){let s=!1,a=ka(),r={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null,d=[],p="",v=!1,k=null,$=!1;e.innerHTML=`<section class="page data-page performance-page">
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
              <div id="performance-report">${bs({label:"\u6548\u80FD\u5831\u8868"})}</div>
            </section>
          </div>
        </div>
        <div id="performance-panel-pipeline" hidden></div>
        <div id="performance-panel-benchmark" hidden></div>
      </section>
    </div>
  </section>`;let b=e.querySelector("#performance-filter-fields"),h=e.querySelector("#performance-filter-form"),w=e.querySelector("#performance-test-flow"),A=e.querySelector("#performance-report"),B=e.querySelector("#performance-panel-pipeline"),Q=e.querySelector("#performance-meta"),D=e.querySelector("#performance-refresh"),H=[...e.querySelectorAll("[data-performance-tab]")],te={overview:e.querySelector("#performance-panel-overview"),pipeline:e.querySelector("#performance-panel-pipeline"),benchmark:e.querySelector("#performance-panel-benchmark")},de="overview",ke=se=>{de=se;for(let ce of H){let ve=ce.dataset.performanceTab===se;ce.classList.toggle("is-active",ve),ve?ce.setAttribute("aria-current","page"):ce.removeAttribute("aria-current")}for(let[ce,ve]of Object.entries(te))ve&&(ve.hidden=ce!==se);se==="benchmark"?Q.textContent="BENCHMARK \xB7 RAG":se==="pipeline"?Q.textContent="PERFORMANCE \xB7 RAG WATERFALL":l&&(Q.textContent=`PERFORMANCE \xB7 ${c(l.total)} \u7B46`)},we=_n(e,{onNavigate:se=>ke(se)}),W=()=>{B&&(B.innerHTML=Xi(d,p,v,k))},E=async({force:se=!1}={})=>{if(!(s||v)){if($&&!se){W();return}v=!0,d.length||W();try{let ce=await F.performance({keyword:"/api/rag"},1,50);if(s)return;let ve=(Array.isArray(ce.rows)?ce.rows:[]).filter(Se=>Se.flow&&(String(Se.path||"").includes("/api/rag")||String(Se.process||"").includes("RAG")));d=ve,(!p||!ve.some(Se=>String(Se.id)===String(p)))&&(p=ve[0]?String(ve[0].id):""),k=null,$=!0}catch(ce){if(s)return;k=ce}finally{s||(v=!1,W())}}},S=se=>{ke(se),se==="benchmark"&&we.show(),se==="pipeline"&&E()};e.addEventListener("click",se=>{let ce=se.target.closest("[data-performance-tab]");ce&&S(ce.dataset.performanceTab||"overview")}),B?.addEventListener("change",se=>{se.target.matches("[data-rag-trace-select]")&&(p=String(se.target.value||""),W())}),B?.addEventListener("click",se=>{se.target.closest('[data-action="refresh-rag-waterfall"]')&&E({force:!0})});let C=null,ee=[],re="",T=null,z="",Y=()=>{b.innerHTML=Ui(r,a)},ue=()=>{let se=JSON.stringify({selected:re,tick:C?.status==="running"?Math.floor(Date.now()/1e3):0,runs:ee.map(ce=>`${ce.run_id}:${ce.status}`),run:C?{run_id:C.run_id,status:C.status,progress:C.progress,total_ms:C.total_ms,steps:(C.steps||[]).map(ce=>`${ce.stage}:${ce.model}:${ce.status}:${ce.progress}:${ce.duration_ms}`)}:null});se!==z&&(z=se,w.innerHTML=is(C,ee,re))},ae=async()=>{try{let se=await F.testRuns(30);if(s)return;ee=Array.isArray(se.runs)?se.runs:[]}catch{if(s)return;ee=[]}},X=async()=>{try{let se=re?await F.testRun(re):await F.testRunCurrent();if(s)return;C=se.run||null,!re&&C&&C.status!=="running"&&!ee.some(ce=>ce.run_id===C.run_id)&&await ae(),ue()}catch{if(s)return;C=null,ue()}},ge=async()=>{s||(re||await X(),s||(T=window.setTimeout(ge,1500)))};w.addEventListener("change",async se=>{se.target.id==="test-run-select"&&(re=String(se.target.value||""),await X())}),w.addEventListener("click",async se=>{se.target.closest("#test-flow-refresh")&&(re="",await ae(),await X())});let _e=async(se=i,{quiet:ce=!1}={})=>{i=Math.max(1,Number(se)||1),a=Pn();let ve=A.querySelector(".report-card"),Se=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!ve?A.setAttribute("aria-busy","true"):(A.removeAttribute("aria-busy"),A.innerHTML=bs({label:"\u6548\u80FD\u5831\u8868"}));let De=e.querySelector("#performance-run");ce||pe(De,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Pe=await F.performance(a,i,o);if(s)return;if(l=Pe,i=Number(Pe.page)||i,o=Number(Pe.page_size)||o,A.removeAttribute("aria-busy"),A.innerHTML=po(Pe),Se!==null){let j=A.querySelector("[data-page-size]");j&&(j.value=String(o),j.focus({preventScroll:!0}))}Q.textContent=`PERFORMANCE \xB7 ${c(Pe.total)} \u7B46`,Q.className="badge badge-neutral badge-mono"}catch(Pe){if(s)return;A.removeAttribute("aria-busy"),A.innerHTML=Os(Pe,{label:"\u6548\u80FD\u5831\u8868"}),L(Pe.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||pe(De,!1)}},je=async()=>{try{r=await F.performanceOptions()}catch{r={processes:[],modules:[],statuses:[],methods:[],models:[]}}Y()};return h.addEventListener("submit",se=>{se.preventDefault(),_e(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=ka(),i=1,Y(),_e(1)}),D.addEventListener("click",async()=>{if(de==="pipeline"){pe(D,!0,"\u6574\u7406\u4E2D\u2026");try{await E({force:!0})}finally{s||pe(D,!1)}return}if(de==="benchmark"){pe(D,!0,"\u6574\u7406\u4E2D\u2026");try{await we.refresh()}finally{s||pe(D,!1)}return}a=Pn(),D.disabled=!0,pe(D,!0,"\u6574\u7406\u4E2D\u2026"),await je(),await ae(),s||await X(),s||await _e(1),s||(D.disabled=!1,pe(D,!1))}),A.addEventListener("click",async se=>{let ce=se.target.closest("[data-action]");if(!ce||!l)return;let ve=ce.dataset.action;if(ve==="retry"){_e(i);return}if(ve==="prev-page"){_e(Math.max(1,Number(l.page)-1),{quiet:!0});return}if(ve==="next-page"){let Se=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));_e(Math.min(Se,Number(l.page)+1),{quiet:!0});return}if(ve==="copy-query"){let Se=await ss(l.query_text||"");L(Se?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",Se?"ok":"warn");return}if(ve==="export-json"){let Se=`performance-page-${l.page}.json`;$t(Se,JSON.stringify(Ds(l),null,2),"application/json;charset=utf-8"),L(`\u5DF2\u532F\u51FA ${Se}`,"ok");return}if(ve==="export-csv"){let Se=`performance-page-${l.page}.csv`;$t(Se,Bs(l),"text/csv;charset=utf-8"),L(`\u5DF2\u532F\u51FA ${Se}`,"ok")}}),A.addEventListener("change",se=>{se.target.matches("[data-page-size]")&&(o=Number(se.target.value)||25,Dn.includes(o)||(o=25),_e(1,{quiet:!0}))}),await Promise.allSettled([je(),ae()]),s||(await X(),await _e(1),ge()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,T&&window.clearTimeout(T),we.destroy()}}var go=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function fo(){return`<div class="answer-placeholder">
    <span class="empty-icon">${m("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function ja(){return`<section class="card answer-card rag-empty-answer">${fo()}</section>`}function Wn(e,t){return`<div class="rag-turn">
    <div class="rag-user-bubble">${n(e)}</div>
    <section class="card rag-assistant-turn" data-rag-answer>${t}</section>
  </div>`}function bo(e,t){return Promise.race([e,new Promise((s,a)=>{window.setTimeout(()=>a(new Error("pipeline lookup timed out")),t)})])}async function vo(e){if(!e||e.pipeline_flow)return e;let t=String(e._client_request_id||e.request_id||"").trim();if(!t)return e;for(let s=0;s<3;s+=1){try{let a=await bo(F.performance({keyword:t},1,5),1800),r=(Array.isArray(a.rows)?a.rows:[]).find(i=>String(i.request_id||"")===t&&i.flow&&typeof i.flow=="object");if(r)return e.pipeline_flow=r.flow,e}catch{}s<2&&await new Promise(a=>window.setTimeout(a,250))}return e}function ho(e){return{status:e.status,answer:e.answer,answer_source:e.answer_source,notice:e.notice,citations:Array.isArray(e.citations)?e.citations:[],judgments:Array.isArray(e.judgments)?e.judgments:[],law_sources:Array.isArray(e.law_sources)?e.law_sources:[],matched_terms:Array.isArray(e.matched_terms)?e.matched_terms:[],law_answer:e.law_answer,law_framework:e.law_framework,llm_model:e.llm_model,embedding_model:e.embedding_model,duration_ms:e.duration_ms,show_sources:e.show_sources,pipeline_flow:e.pipeline_flow||null,test_run:e.test_run||null,partial:!1,streaming:!1}}var $o={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"Ollama embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"Ollama LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function yo(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`Ollama run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`Ollama embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:$o[t]||t||"backend step"}function Kn(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function Yn(e){let t=Number(e);return Number.isFinite(t)?`${c(Math.max(0,Math.round(t)))} ms`:"\u2014"}function La(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function wo(){return`<div class="rag-process is-open" id="rag-process">
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
  </div>`}function _o(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),r=performance.now(),i=new Map,o=new Map,l=(b,h,w)=>{let A=b.querySelector(h);A&&(A.textContent=w)},d=b=>{if(b.failed){l(b.element,".rag-process-meta","\u5931\u6557");return}if(b.hasChildren){l(b.element,".rag-process-meta","");return}l(b.element,".rag-process-meta",Yn(b.durationMs))},p=b=>{let h=b-1,w=[...i.values()].reverse();for(let A of w){if(h<0)break;A.depth<=h&&(A.hasChildren||(A.hasChildren=!0,A.element.dataset.hasChildren="true",A.finished&&d(A)),h=A.depth-1)}},v=b=>{if(!s)return null;let h=String(b?.seq??`step-${i.size+1}`),w=i.get(h);if(!w){let A=Math.max(0,Math.min(6,Number(b?.depth)||0));p(A);let B=document.createElement("div");B.className="rag-process-item is-running",B.dataset.processKey=h,B.style.setProperty("--depth",String(A)),B.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(B),w={element:B,depth:A,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(h,w)}return l(w.element,".rag-process-label",yo(b)),w.element.title=Kn(b),w};return{step:b=>{let h=b?.segment;if(!h)return;o.set(String(h.seq??h.name??o.size),{...h});let w=v(h);if(w){if(b.type==="segment_start"){w.element.classList.add("is-running"),l(w.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(b.type==="segment_end"){let A=h.status==="error";w.element.classList.remove("is-running"),w.element.classList.toggle("is-error",A),w.finished=!0,w.failed=A,w.durationMs=Number(h.duration_ms)||0,d(w),w.element.title=[Kn(h),A&&h.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(b=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(B=>{B.classList.remove("is-running");let Q=B.dataset.hasChildren==="true";l(B,".rag-process-meta",Q?"":b?"\u5B8C\u6210":"\u4E2D\u65B7")});let h=s?.children.length||i.size,w=Yn(Math.max(0,performance.now()-r));a&&(a.textContent=b?`\u5B8C\u6210 \xB7 ${h} \u6B65 \xB7 ${w}`:`\u5931\u6557 \xB7 ${h} \u6B65`);let A=[...o.values()].filter(B=>B?.name).sort((B,Q)=>Number(B.offset_ms||0)-Number(Q.offset_ms||0));if(s&&A.length){let B=Math.max(1,...A.map(Q=>Number(Q.end_offset_ms)||(Number(Q.offset_ms)||0)+(Number(Q.duration_ms)||0)));s.classList.add("is-waterfall"),s.innerHTML=rs(zs(A),B,"\u5F8C\u7AEF Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B span \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002")}return t.classList.add("is-complete"),La(t,!1),t.outerHTML},collapse:()=>La(t,!1)}}function ko(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${m("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":wo()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${n(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function Xn(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Qs(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let r=String(e||"").trim();return r?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${n(t||r)}"
    data-source-type="${n(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${n(r)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${n(r)} \u7684\u5B8C\u6574\u689D\u6587">${n(a||r)}</button>`:""}function So(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(l=>`<span>${n(l)}</span>`).join(""),r=(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(l=>Qs(l)).join(""),i=e.jid?` data-action="open-parquet-judgment"
        data-jid="${n(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${n(e.jid)}"`:"",o=e.pdf_url?`<a class="citation-link" href="${n(e.pdf_url)}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${m("external",11)}</a>`:"";return`<article class="citation">
    <span class="citation-index">[${e.index??t+1}]</span>
    <div class="citation-body">
      <div class="citation-head"${i}>
        <h4 class="citation-name">${n(e.jid||"\u672A\u77E5\u6848\u865F")}</h4>
        <div class="citation-meta">${a||"<span>\u5224\u6C7A metadata</span>"}</div>
        ${e.title?`<div class="citation-meta"><span>\u6848\u7531\uFF1A${n(e.title)}</span></div>`:""}
      </div>
      ${r?`<div class="chips" style="margin-top:8px">${r}</div>`:""}
      ${e.snippet?`<p class="citation-snippet">${n(e.snippet)}</p>`:""}
    </div>
    <div class="citation-links">${o}</div>
  </article>`}function xo(e,t){let s=[e.law_level,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${n(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${m("external",11)}</a>`:"",r=e.law_key||e.law_name||"",i=r?` data-action="open-law-source"
        data-law-key="${n(r)}"
        data-source-type=""
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body"${i}>
      <h4 class="citation-name">${n(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${s||"<span>\u6CD5\u898F metadata</span>"}</div>
      ${e.snippet?`<p class="citation-snippet">${n(e.snippet)}</p>`:""}
    </div>
    ${a}
  </article>`}function qo(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",r=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${n(s)}</span>`,a,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${vt(e.law_modified_date)}`:""].filter(Boolean).map(b=>`<span>${b}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${n(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${n(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${n(o.entity||"")}\u300D\u7684\u5224\u6C7A ${c(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${c(o.law_count||0)} \u6B21</span>
      </div>`:"",d=e.law_key||"",p=e.source_type||"",v=(Array.isArray(e.articles)?e.articles:[]).map(b=>{let h=String(b.article_no||"");return`<div class="law-source-article"${d&&h?` data-action="open-law-source"
        data-law-key="${n(d)}"
        data-source-type="${n(p)}"
        data-article-no="${n(h)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${n(h)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} ${n(h)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${n(b.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${n(b.article_content||"")}</p>
      </div>`}).join(""),k=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${m("external",11)}</a>`:"",$=e.law_key?` data-action="open-law-source"
        data-law-key="${n(e.law_key)}"
        data-source-type="${n(e.source_type||"")}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u672C\u5730 Parquet \u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation law-source">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body"${$}>
      <h4 class="citation-name">${n(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${r}</div>
      ${i}
      ${l}
      ${v}
    </div>
    <div class="citation-links">${k}</div>
  </article>`}function Ao(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function jo(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${n(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",r=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(r==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),d=s.index!=null?`<span class="law-answer-index">[${n(String(s.index))}]</span>`:"",p=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${n(a)}"
            data-source-type="${n(r)}"
            title="\u9EDE\u64CA\u958B\u555F ${n(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${n(i)} \u7684\u5B8C\u6574\u689D\u6587">${n(i)}</button>`:`<strong>${n(i)}</strong>`,v=Array.isArray(s.articles)?s.articles:[],k=v.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${v.map($=>{let b=String($.article_no||"").trim(),h=Ao($.article_content);return!a||!b?`<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${n(b||"\u689D\u6587")}</span>
                  <span class="law-answer-article-text">${n(h)}</span>
                </div>`:`<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${n(a)}"
                data-source-type="${n(r)}"
                data-article-no="${n(b)}"
                title="\u9EDE\u64CA\u67E5\u770B ${n(b)} \u7684\u5B8C\u6574\u5167\u5BB9"
                aria-label="\u958B\u555F ${n(i)} ${n(b)} \u7684\u5B8C\u6574\u689D\u6587">
                <span class="law-answer-article-no">${n(b)}</span>
                <span class="law-answer-article-text">${n(h)}</span>
              </button>`}).join("")}</div>`:"";return`<div class="law-answer-source">
        <div class="law-answer-source-head">
          ${p}
          <span class="law-answer-source-meta">\uFF08${n(o)}\uFF0C${c(l)} \u689D\uFF09</span>
          ${d}
        </div>
        ${k}
      </div>`}).join("")}</div>`}function Lo(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let r=s.get(String(a));return r?.law_key?Qs(a,{lawKey:r.law_key,sourceType:r.source_type||""}):`<span class="chip">${n(a)}</span>`}).join("")}</div>`}function Us({tone:e,title:t,text:s,models:a,currentModel:r,currentProviderName:i,baseUrl:o,modelState:l,untestedProviders:d=[],busy:p,refreshing:v}){let k=e==="ok"?"is-ok":e==="warn"?"is-warn":"is-info",$=e==="ok"?"check":e==="warn"?"alert":"info",b=e==="ok"?"badge-ok":e==="warn"?"badge-warn":"badge-info",h=Array.isArray(a)?a:[],w=[...new Set(h.map(H=>H.providerName).filter(Boolean))],A=r&&i?`${i}:${r}`:r,B=h.map(H=>{let te=H.model===r&&(!i||H.providerName===i),de=H.providerName?`${H.providerName}:${H.model}`:H.model;return`<button class="rag-model-button${te?" is-active":""}" type="button" data-rag-model="${n(H.model)}"
        data-rag-provider="${n(H.hostId===null||H.hostId===void 0?"":String(H.hostId))}"
        title="${n(de)}"
        aria-pressed="${te}" ${p||v?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${n(de)}</span>
        ${te?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`}).join(""),Q=(l?.models||[]).filter(H=>H.status==="untested").length,D=l?Q?`\u5C1A\u6709 ${c(Q)} \u500B\u6A21\u578B\u672A\u6E2C\u8A66 chat \u80FD\u529B\uFF1B\u6309\u300C\u6AA2\u67E5\u6A21\u578B\u300D\u5F8C\u5373\u53EF\u5207\u63DB\u3002`:"\u76EE\u524D provider \u6C92\u6709\u53EF\u7528\u7684 chat \u6A21\u578B\u3002":"\u7121\u6CD5\u53D6\u5F97\u6A21\u578B\u6E05\u55AE\uFF1B\u8ACB\u78BA\u8A8D Ollama \u670D\u52D9\u662F\u5426\u555F\u52D5\u3002";return`<section class="rag-mode-card ${k}">
    <div class="rag-mode-head">
      <span class="rag-mode-icon" aria-hidden="true">${m($,14)}</span>
      <div class="rag-mode-copy">
        <strong>${n(t)}</strong>
        <p>${n(s)}</p>
      </div>
      <span class="badge ${b}">${c(h.length)} \u500B chat model${w.length?` \xB7 ${w.length} \u53F0\u4E3B\u6A5F`:""}</span>
    </div>
    <div class="rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${m("brain",13)} Chat models</span>
        ${o?`<span class="rag-model-strip-base mono">${n(o)}</span>`:""}
        <span class="rag-model-strip-current">${A?`\u76EE\u524D\uFF1A<strong>${n(A)}</strong>`:"\u5C1A\u672A\u9078\u64C7"}</span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-rag-action="refresh-chat-models"
          ${p||v?"disabled":""}>
          ${m("refresh",12)}<span>${v?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6A21\u578B"}</span>
        </button>
      </div>
      ${B?`<div class="rag-model-buttons">${B}</div>
             <p class="rag-model-hint">\u9EDE\u9078\u6A21\u578B\u5207\u63DB\uFF1B\u5207\u63DB\u5F8C\u5957\u7528\u4E0B\u4E00\u6B21\u63D0\u554F\uFF0C\u4E0D\u5F71\u97FF\u5DF2\u5B8C\u6210\u7684\u56DE\u7B54\u3002</p>`:`<p class="rag-model-empty">${n(D)}</p>`}
      ${d.length?`<p class="rag-model-hint rag-model-untested-hint">${n(d.join("\u3001"))} \u5C1A\u6709\u6A21\u578B\u5C1A\u672A\u6AA2\u67E5 chat \u80FD\u529B\uFF1B\u8ACB\u6309\u300C\u6AA2\u67E5\u6A21\u578B\u300D\u3002</p>`:""}
    </div>
  </section>`}function tr(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.law_sources)?e.law_sources:[],r=Array.isArray(e.matched_terms)?e.matched_terms:[],i=e.status||"preview",o=!!e.partial,l=!!e.streaming,d=!!e.show_sources||!o,p=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((X,ge)=>So(X,ge)).join("")}</div>`:"",v=a.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${a.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${a.map((X,ge)=>qo(X,ge)).join("")}</div>`:"",k=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((X,ge)=>xo(X,ge)).join("")}</div>`:"",$=d?p+v+k:"";!$&&!o&&($=`<div class="answer-divider"></div>
      ${Ke({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:i==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let b=Lo(r,a),h=e.test_run,w=String(e.llm_model||h?.primary_model||"").trim(),A=String(e.embedding_model||"").trim(),B=[w?`LLM\uFF1A${w}`:"",A?`Embedding\uFF1A${A}`:""].filter(Boolean).join(" \xB7 "),Q=e.answer_source==="structured",D=String(e.law_answer||"").trim(),H=e.law_framework||null,te=Array.isArray(H?.rows)?H.rows:[],de=Array.isArray(H?.sources)?H.sources:[],ke=te.length>0,we=!!D&&!Q&&!ke,W=l||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",E=ke?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${n(H.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${te.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${te.map(X=>`<tr>
                    <td>${n(X.law_name||"\u2014")}</td>
                    <td class="cell-number">${n(X.article_no||"\u2014")}</td>
                    <td>${n(X.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${de.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${de.map(X=>{let ge=String(X?.law_name||X||"").trim(),_e=X&&X.index!==null&&X.index!==void 0?` [${n(X.index)}]`:"";return Qs(ge,{label:`${ge}${_e}`})}).join("")}
              </div>`:""}
      </div>`:"",S=e.answer_source==="llm"&&w?`<span class="answer-model" title="${n(B)}">${m("brain",11)}${n(w)}</span>`:Q?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${m("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",C=l?`${w||"LLM"} \xB7 \u751F\u6210\u4E2D`:S?w||"structured":"retrieval",ee=h?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${Le(h.status)}
          <span class="mono">${n(h.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(h.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(h.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${n(h.primary_model||"\u2014")}</span>
          <span>${Number(h.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",re=e.pipeline_flow&&typeof e.pipeline_flow=="object"?e.pipeline_flow:null,T=!o&&re?Hs(re,{serverDurationMs:Number(e.duration_ms)||0,embedded:!0}):"",Y=String(e.answer||"").trim()||(l?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":o?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),ue=l?" data-partial-answer":"",ae=l?" is-streaming":"";return`${E}
      ${we?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${o&&!d?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${a.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${jo(a,D)}</div>
            </div>`:""}
      <div class="answer-block">
        ${we||ke?`<div class="answer-block-head">
                <span>${n(W)}</span>
                <span>${n(C)}</span>
              </div>`:""}
        <p class="answer-text${ae}"${ue}>${n(Y)}</p>
      </div>
      ${e.notice?`<div class="answer-notice">${n(e.notice)}</div>`:""}
      ${ee}
      ${b}
      ${$}
      ${T}`}function Zn(e,t,s=""){let a=t.status||"preview",r=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),d=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),p=t.answer_source==="structured",v=t.answer_source==="llm"&&o?`<span class="answer-model" title="${n(d)}">${m("brain",11)}${n(o)}</span>`:p?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${m("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${m("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${Le(a,r)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${v}
      </div>
      ${s}
    </div>
    <div class="answer-body">${tr(t)}</div>`}function Mo(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${m("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${ye({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function To(e){let t=Array.isArray(e.turns)?e.turns:[],s=t.length?t[t.length-1].payload||{}:e.payload||{},a=Array.isArray(s.citations)?s.citations.length:0,r=Array.isArray(s.judgments)?s.judgments.length:0,i=Array.isArray(s.law_sources)?s.law_sources.length:0;return a+r+i}function Eo(e,t,s,a=null){let r=e.id??s,i=To(e),o=t.get(String(e.project_id||"")),l=Array.isArray(e.turns)?e.turns:[],d=e.updated_at||e.created_at,p=a!=null&&String(a)===String(r);return`<div class="rag-history-item${e.pinned?" is-pinned":""}${p?" is-active":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${n(String(r))}">
      <span class="history-question">${n(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${n(ts(d))}</span>
        ${o?`<span>\xB7 ${n(o.name)}</span>`:""}
        <span>\xB7 ${i?`${i} \u7B46\u4F86\u6E90`:"\u7121\u5F15\u7528"}</span>
        ${l.length>1?`<span>\xB7 ${l.length} \u8F2A</span>`:""}
      </span>
    </button>
    <div class="rag-history-actions">
      <button class="rag-history-pin${e.pinned?" is-pinned":""}" type="button"
        data-rag-action="toggle-pin" data-history-id="${n(String(r))}"
        data-tooltip="${e.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}"
        aria-label="${e.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078\u6B64\u9805\u76EE"}"
        aria-pressed="${e.pinned?"true":"false"}">${m("pin",14)}</button>
      <button class="rag-history-more" type="button"
        data-rag-action="open-history-menu" data-history-id="${n(String(r))}"
        title="\u66F4\u591A\u64CD\u4F5C" aria-label="\u66F4\u591A\u64CD\u4F5C" aria-haspopup="menu" aria-expanded="false">${m("more",14)}</button>
    </div>
  </div>`}function er(e,t,s){let a=new Map;for(let i of t){let o=String(i.project_id||"");o&&a.set(o,(a.get(o)||0)+1)}let r=[`<button class="rag-project${s?"":" is-active"}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${s?"false":"true"}">
      <span class="rag-project-name">${m("grid",13)}<span>\u5168\u90E8</span></span>
      <span class="rag-project-count">${t.length}</span>
    </button>`];for(let i of e){let o=String(i.id),l=a.get(o)||0;r.push(`<button class="rag-project${s===o?" is-active":""}" type="button" data-rag-action="select-project" data-project-id="${n(o)}" aria-pressed="${s===o?"true":"false"}">
      <span class="rag-project-name">${m("folder",13)}<span>${n(i.name)}</span></span>
      <span class="rag-project-count">${l}</span>
    </button>`)}return e.length||r.push('<div class="rag-library-empty">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\u3002</div>'),r.push(`<div class="rag-project-add-wrap">
    <button class="rag-project-add" type="button" data-rag-action="show-project-form">${m("plus",13)}<span>\u5EFA\u7ACB\u5C08\u6848</span></button>
    <form class="rag-project-form" data-rag-form="project" hidden>
      <input class="input" type="text" name="project_name" maxlength="60" placeholder="\u5C08\u6848\u540D\u7A31" aria-label="\u5C08\u6848\u540D\u7A31" autocomplete="off" />
      <div class="rag-project-form-actions">
        <button class="btn btn-primary btn-sm" type="submit">\u5EFA\u7ACB</button>
        <button class="btn btn-ghost btn-sm" type="button" data-rag-action="cancel-project">\u53D6\u6D88</button>
      </div>
    </form>
  </div>`),r.join("")}async function No(e){let t=!1,s=[],a=!1,r=[],i=!1,o="",l=8,d="",p=0,v=null,k=[],$=!1,b=!1,h={embedding:[],llm:[]},w=null,A=null,B=null,Q=!1,D=!1;e.innerHTML=`<section class="page rag-page">
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
        <header class="rag-hero">
      <span class="eyebrow">JUDGMENT \xB7 LEGAL RAG</span>
      <h1 class="rag-title">\u8B93\u6BCF\u4E00\u500B\u7B54\u6848\uFF0C\u90FD\u80FD\u56DE\u5230\u6CD5\u898F\u8207\u5224\u6C7A</h1>
      <p class="rag-lead">\u4EE5\u91D1\u878D\u6CD5\u898F\u7684\u73FE\u884C\u689D\u6587\u8207\u5224\u6C7A\u7247\u6BB5\u70BA\u6AA2\u7D22\u57FA\u790E\u3002
        \u5148\u5F9E Qdrant \u6AA2\u7D22\u76F8\u4F3C\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\uFF1B\u82E5\u7D22\u5F15\u6216\u6A21\u578B\u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u53EF\u9A57\u8B49\u7684\u6AA2\u7D22\u7D50\u679C\u3002</p>
      <div id="rag-mode-notice">${ye({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
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
        ${go.map(f=>`<button class="example-chip" type="button" data-question="${n(f)}">${n(f)}</button>`).join("")}
      </div>
    </header>

    <section class="rag-conversation" id="rag-conversation" aria-live="polite">
      <div class="rag-turns" id="rag-turns">
        ${ja()}
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
  </section>`;let H=e.querySelector("#rag-form"),te=e.querySelector("#rag-question"),de=e.querySelector("#rag-submit"),ke=e.querySelector(".rag-page"),we=e.querySelector("#rag-turns"),W=e.querySelector("#rag-followup-form"),E=e.querySelector("#rag-followup-question"),S=e.querySelector("#rag-followup-submit"),C=e.querySelector("#rag-history"),ee=e.querySelector("#rag-storage-note"),re=e.querySelector("#rag-clear-history"),T=e.querySelector(".rag-library"),z=e.querySelector("#rag-pinned-body"),Y=e.querySelector("#rag-projects-body"),ue=e.querySelector("#rag-pinned-count"),ae=e.querySelector("#rag-projects-count"),X=e.querySelector("#rag-recent-count"),ge=e.querySelector("#rag-library-context"),_e=e.querySelector("#rag-test-mode"),je=e.querySelector("#rag-test-flow"),se=e.querySelector("#rag-history-menu"),ce=e.querySelector("#rag-judgment-dialog"),ve=e.querySelector("#rag-law-dialog"),Se=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};ce?.addEventListener("close",Se),ve?.addEventListener("close",Se);let Be=null,De=null,Pe,j=null,R=null,O=()=>{te.style.height="auto",te.style.height=`${Math.min(te.scrollHeight,220)}px`},U=()=>{E.style.height="auto",E.style.height=`${Math.min(E.scrollHeight,160)}px`},oe=f=>{$=!!f,ke.classList.toggle("has-conversation",$)},V=()=>{$&&(W.hidden=!1,U())},qe=()=>{W.hidden=!0},I=()=>{se.hidden&&!R||(se.hidden=!0,se.innerHTML="",R&&R.setAttribute("aria-expanded","false"),j=null,R=null)},me=(f,N)=>{let P=we.querySelector(".rag-empty-answer");P&&P.remove(),we.insertAdjacentHTML("beforeend",Wn(f,N));let K=we.lastElementChild,le=K?.querySelector("[data-rag-answer]");return window.requestAnimationFrame(()=>{K?.scrollIntoView({behavior:"smooth",block:"start"})}),{turnElement:K,answerElement:le}},Me=()=>{we.innerHTML=k.length?k.map(f=>Wn(f.question,Zn(f.question,f.payload||{},""))).join(""):ja()},Ie=f=>{let N=Array.isArray(f.turns)?f.turns:[];return N.length?(p+=1,et(),Xe(null),v=f.id??null,k=N.map(P=>({...P})),d=k[k.length-1]?.question||"",oe(!0),Me(),V(),He(),pe(de,!1),pe(S,!1),window.setTimeout(()=>{W.scrollIntoView({behavior:"smooth",block:"end"})},50),!0):!1},He=()=>{if(t)return;if(I(),!a){C.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',z.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',ue.textContent="0",X.textContent="0",i&&(Y.innerHTML=er(r,[],o));return}let f=r.find(xe=>String(xe.id)===o)||null;o&&!f&&(o="");let N=new Map(r.map(xe=>[String(xe.id),xe])),P=s.filter(xe=>!!xe.pinned),K=s.filter(xe=>!xe.pinned),le=o?K.filter(xe=>String(xe.project_id||"")===o):K,he=le.slice(0,l),Fe=(xe,Ue)=>Eo(xe,N,Ue,v);z.innerHTML=P.length?P.map(Fe).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',Y.innerHTML=er(r,s,o),C.innerHTML=he.length?he.map(Fe).join(""):`<div class="rag-library-empty">${o?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u672A\u91D8\u9078\u7684\u9805\u76EE\u3002":P.length?"\u6700\u8FD1\u7684\u9805\u76EE\u90FD\u5DF2\u91D8\u9078\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,le.length>l&&C.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${c(le.length-l)} \u7B46</button>`),ue.textContent=String(P.length),ae.textContent=String(r.length),X.textContent=String(le.length),f?(ge.hidden=!1,ge.innerHTML=`<span>${m("folder",12)}<strong>${n(f.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${m("x",12)}</button>`):(ge.hidden=!0,ge.innerHTML="")},it=async()=>{try{let f=await Nt("rag.projects",[]);r=Array.isArray(f)?f.map(N=>({id:String(N?.id||""),name:String(N?.name||"").trim()})).filter(N=>N.id&&N.name):[]}catch{r=[]}i=!0,t||He()},qt=f=>{o=String(f||""),l=8,He()},Ve=()=>{let f=Y.querySelector('[data-rag-form="project"]');f&&(f.hidden=!1,f.querySelector("input")?.focus())},Qt=()=>{let f=Y.querySelector('[data-rag-form="project"]');f&&(f.hidden=!0,f.reset())},ct=async f=>{let N=f.elements.project_name,P=String(N?.value||"").trim();if(!P){L("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),N?.focus();return}if(r.some(le=>le.name.toLowerCase()===P.toLowerCase())){L("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),N?.focus();return}let K=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;r=[...r,{id:K,name:P.slice(0,60),created_at:new Date().toISOString()}],o=K,l=8,await ms("rag.projects",r),He(),L(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${P}\u300D\u3002`,"ok")},Ze=async f=>{let N=s.find(le=>String(le.id)===String(f));if(!N)return;let P=!N.pinned;if(!await ps(N.id,{pinned:P})){L("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}N.pinned=P,He(),L(P?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},ft=()=>{p+=1,et(),Xe(null),d="",v=null,k=[],oe(!1),qe(),we.innerHTML=ja(),te.value="",O(),E.value="",U(),pe(de,!1),pe(S,!1),He(),ce?.open&&ce.close(),ve?.open&&ve.close(),te.focus(),window.scrollTo({top:0,behavior:"smooth"})},At=f=>{if(!f||se.hidden)return;let N=f.getBoundingClientRect(),P=se.getBoundingClientRect(),K=6,le=N.bottom+K;le+P.height>window.innerHeight-8&&(le=Math.max(8,N.top-P.height-K));let he=N.right-P.width;he=Math.max(8,Math.min(he,window.innerWidth-P.width-8)),se.style.left=`${Math.round(he)}px`,se.style.top=`${Math.round(le)}px`},Gt=f=>{se.innerHTML=`
      <button type="button" role="menuitem" data-menu-action="rename">${m("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${m("pin",13)}<span>${f.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${m("link",13)}<span>\u5206\u4EAB</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${m("trash",13)}<span>\u522A\u9664</span></button>`},Rt=f=>{let N=String(f.project_id||""),P=[{id:"",name:"\u672A\u5206\u985E"},...r.map(K=>({id:String(K.id),name:K.name}))];se.innerHTML=`
      <div class="rag-history-menu-head">${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${P.map(K=>`<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${n(K.id)}">
            <span class="rag-history-menu-check">${N===K.id?m("check",12):""}</span>
            <span>${n(K.name)}</span>
          </button>`).join("")}
      ${r.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${m("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},Jt=(f,N)=>{let P=s.find(K=>String(K.id)===String(N));P&&(I(),j=String(P.id),R=f,Gt(P),se.hidden=!1,f.setAttribute("aria-expanded","true"),At(f))},y=async f=>{let N=window.prompt("\u91CD\u65B0\u547D\u540D\u5C0D\u8A71",f.title||"");if(N===null)return;let P=N.trim();if(!P){L("\u540D\u7A31\u4E0D\u80FD\u7A7A\u767D\u3002","warn");return}if(P===f.title)return;if(!await ps(f.id,{title:P})){L("\u91CD\u65B0\u547D\u540D\u5931\u6557\u3002","danger");return}f.title=P,He(),L("\u5C0D\u8A71\u5DF2\u91CD\u65B0\u547D\u540D\u3002","ok")},x=async f=>{let N=Array.isArray(f.turns)?f.turns:[],P=[`# ${f.title||"\u672A\u547D\u540D\u5C0D\u8A71"}`,""];if(N.length)for(let le of N){P.push("## \u554F\u984C","",le.question||"",""),P.push("## \u56DE\u7B54","",le.payload?.answer||"\uFF08\u6C92\u6709\u56DE\u7B54\u5167\u5BB9\uFF09","");let he=Array.isArray(le.payload?.law_sources)?le.payload.law_sources.map(Fe=>Fe.law_name).filter(Boolean):[];he.length&&P.push(`\u5F15\u7528\uFF1A${[...new Set(he)].join("\u3001")}`,"")}else P.push(f.title||"");let K=await ss(P.join(`
`));L(K?"\u5C0D\u8A71\u5167\u5BB9\u5DF2\u8907\u88FD\uFF0C\u53EF\u76F4\u63A5\u8CBC\u4E0A\u5206\u4EAB\u3002":"\u7121\u6CD5\u8907\u88FD\u5C0D\u8A71\u5167\u5BB9\u3002",K?"ok":"warn")},q=async f=>{if(!window.confirm(`\u522A\u9664\u5C0D\u8A71\u300C${f.title||"\u672A\u547D\u540D\u5C0D\u8A71"}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002`))return;if(!await nn(f.id)){L("\u522A\u9664\u5931\u6557\u3002","danger");return}let P=v!==null&&String(v)===String(f.id);s=s.filter(K=>String(K.id)!==String(f.id)),P?ft():He(),L("\u5C0D\u8A71\u5DF2\u522A\u9664\u3002","ok")},u=async(f,N)=>{if(!await ps(f.id,{project_id:N})){L("\u79FB\u81F3\u5C08\u6848\u5931\u6557\u3002","danger");return}f.project_id=N;let K=r.find(le=>String(le.id)===String(N));He(),L(K?`\u5DF2\u79FB\u81F3\u5C08\u6848\u300C${K.name}\u300D\u3002`:"\u5DF2\u79FB\u51FA\u5C08\u6848\u3002","ok")},g=async f=>{let N=f.target.closest("[data-menu-action]");if(!N)return;let P=s.find(le=>String(le.id)===j);if(!P){I();return}let K=N.dataset.menuAction;K==="rename"?(I(),await y(P)):K==="toggle-pin"?(I(),await Ze(P.id)):K==="share"?(I(),await x(P)):K==="move"?(Rt(P),At(R)):K==="assign-project"?(I(),await u(P,N.dataset.projectId||"")):K==="back"?(Gt(P),At(R)):K==="delete"&&(I(),await q(P))},_=f=>{se.hidden||(typeof f.composedPath=="function"?f.composedPath():[]).includes(se)||se.contains(f.target)||f.target.closest('[data-rag-action="open-history-menu"]')||I()},M=f=>{f.key==="Escape"&&I()},G=f=>{f.target instanceof Node&&se.contains(f.target)||I()},J=async()=>{try{if(s=await Ts({limit:120}),t)return;a=!0,He(),ee.textContent=Ms()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;s=[],a=!0,He(),C.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},ne=async(f,N,P,K)=>{let le=k,he=v;le.push({question:f,asked_at:new Date().toISOString(),payload:ho(N)});let Fe=Array.isArray(N.citations)?N.citations:[],xe=Array.isArray(N.judgments)?N.judgments:[],Ue={question:f,status:N.status,citations:Fe.map(Qe=>Qe.law_name),judgments:xe.map(Qe=>Qe.jid)},pt=`${N.status||"preview"} \xB7 ${le.length} \u8F2A`,ot=new Date().toISOString(),Re=Qe=>{K===p&&(v=Qe)};if(he){if(!await ps(he,{turns:le,detail:pt,payload:Ue,updated_at:ot})){let Pt=await us({kind:"rag",title:le[0]?.question||f,detail:pt,project_id:P,turns:le,payload:Ue,updated_at:ot});Re(Pt)}}else{let Qe=await us({kind:"rag",title:le[0]?.question||f,detail:pt,project_id:P,turns:le,payload:Ue,updated_at:ot});Re(Qe)}await J()},fe=()=>(w?.services||[]).find(f=>f.id==="llm")||null,Ae=()=>{let f=e.querySelector("#rag-mode-notice");if(!f)return;let N=Array.isArray(A?.providers)?A.providers:[],P=[];for(let Re of N)if(!(!Re||!Array.isArray(Re.chat_models)))for(let Qe of Re.chat_models)P.push({model:Qe,providerName:String(Re.name||"").trim(),hostId:Re.host_id===null||Re.host_id===void 0?null:Number(Re.host_id)});if(!P.length&&Array.isArray(A?.chat_models)){let Re=String(A?.provider_name||"").trim(),Qe=A?.provider?.host_id;for(let Pt of A.chat_models)P.push({model:Pt,providerName:Re,hostId:Qe==null?null:Number(Qe)})}let K=N.filter(Re=>Array.isArray(Re?.models)&&Re.models.length>0&&(!Array.isArray(Re.chat_models)||Re.chat_models.length===0)).map(Re=>String(Re.name||"").trim()).filter(Boolean),le=String(fe()?.model||"").trim(),he=String(A?.base_url||"").trim(),Fe=String(A?.provider_name||"").trim();if(!w){if(!B)return;f.innerHTML=Us({tone:"warn",title:"\u7121\u6CD5\u53D6\u5F97 RAG \u670D\u52D9\u72C0\u614B",text:B.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u524D\u5F80\u7CFB\u7D71\u72C0\u614B\u9801\u67E5\u770B\u3002",models:P,currentModel:le,currentProviderName:Fe,baseUrl:he,modelState:A,untestedProviders:K,busy:Q,refreshing:D});return}let xe=w.data||{},Ue=(w.services||[]).find(Re=>Re.id==="rag"),pt=Number(xe.judgment_indexed_count||0),ot=Number(xe.judgment_count||0);Ue?.status==="operational"?f.innerHTML=Us({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${c(pt)} / ${c(ot)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`,models:P,currentModel:le,currentProviderName:Fe,baseUrl:he,modelState:A,untestedProviders:K,busy:Q,refreshing:D}):Ue?.status==="degraded"?f.innerHTML=Us({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:Ue.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002",models:P,currentModel:le,currentProviderName:Fe,baseUrl:he,modelState:A,untestedProviders:K,busy:Q,refreshing:D}):f.innerHTML=Us({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:Ue?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002",models:P,currentModel:le,currentProviderName:Fe,baseUrl:he,modelState:A,untestedProviders:K,busy:Q,refreshing:D})},Ne=async()=>{let[f,N]=await Promise.allSettled([F.status(),F.llmModels()]);t||(w=f.status==="fulfilled"?f.value:null,A=N.status==="fulfilled"?N.value:null,B=f.status==="rejected"?f.reason:null,Ae())},Vt=async(f,N=null)=>{if(!f||Q||D)return;let P=String(fe()?.model||"").trim(),K=String(A?.provider_name||"").trim(),le=(A?.providers||[]).find(xe=>N!==null&&xe?.host_id!==null&&xe?.host_id!==void 0&&Number(xe.host_id)===Number(N)),he=String(le?.name||(N===null?K:"")).trim();if(f===P&&(!N||!he||he===K))return;let Fe=he?`${he}:${f}`:f;Q=!0,Ae();try{await F.selectLlmModel(f,N),L(`\u5DF2\u5207\u63DB chat model\uFF1A${Fe}`,"ok",3500)}catch(xe){L(xe.message||"\u7121\u6CD5\u5207\u63DB chat model\u3002","danger",6e3)}finally{Q=!1,t||await Ne()}},dt=async()=>{if(!(D||Q)){D=!0,Ae();try{await F.testLlmModels(),L("\u5DF2\u66F4\u65B0 chat model \u6E05\u55AE\u3002","ok",3500)}catch(f){L(f.message||"\u7121\u6CD5\u6AA2\u67E5 chat model\u3002","danger",6e3)}finally{D=!1,t||await Ne()}}},kt=()=>{if(!_e)return;if(!b){_e.innerHTML="";return}let f=Array.isArray(h.embedding)?h.embedding.length:0,N=Array.isArray(h.llm)?h.llm.length:0;_e.innerHTML=ye({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${f} \u500B embedding \u8207 ${N} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},Wt=async()=>{try{let f=await F.testMode();if(t)return;b=!!f.enabled,h=f.models||{embedding:[],llm:[]},kt()}catch{if(t)return;b=!1,kt()}},cs=f=>{b=!!f.detail?.enabled,h=f.detail?.models||{embedding:[],llm:[]},kt()};window.addEventListener("judgment:test-mode",cs);let Xe=f=>{if(!je)return;De=f||null;let N=JSON.stringify(f?{run_id:f.run_id,status:f.status,progress:f.progress,total_ms:f.total_ms,stage:f.stage,answer:f.answer||"",steps:(f.steps||[]).map(P=>`${P.stage}:${P.model}:${P.status}:${P.progress}:${P.duration_ms}`)}:null);N!==Pe&&(Pe=N,je.innerHTML=f?is(f,[],"",{showHistory:!1}):"")},et=()=>{Be&&(window.clearTimeout(Be),Be=null)},Kt=()=>{et();let f=async()=>{if(!t){try{let N=await F.testRunCurrent();if(t)return;let P=N.run;P&&P.status==="running"&&Xe(P)}catch{}t||(Be=window.setTimeout(f,1500))}};f()},ks=async f=>{if(!f){Xe(null);return}try{let N=await F.testRun(f);if(t)return;Xe(N.run||null)}catch{t||L("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},Ss=async()=>{if(b)try{let f=await F.testRunCurrent();if(t)return;f.run?.status==="running"&&(Xe(f.run),Kt())}catch{}},Yt=0,Xt=(f,N)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${n(f)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${m("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${N}</div>`,Ce=f=>{let N=(Array.isArray(f.matched_laws)?f.matched_laws:[]).map(he=>Qs(he)).join(""),P=[f.court,f.jdate,f.title?`\u6848\u7531\uFF1A${f.title}`:"",f.full_text_length?`${c(f.full_text_length)} \u5B57`:"",f.citation_count?`\u5F15\u7528 ${c(f.citation_count)} \u7B46`:""].filter(Boolean).map(he=>`<span>${n(he)}</span>`).join(""),K=f.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${n(String(f.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",le=f.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(f.pdf_url)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return Xt(f.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${n(f.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${P}
      </div>
      ${N?`<div class="chips" style="margin:8px 0 10px">${N}</div>`:""}
      <div class="judgment-dialog-source">${K}</div>
      <pre class="judgment-dialog-text">${n(f.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${le}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},St=async f=>{if(!ce||!f)return;let N=++Yt;ce.open||ce.showModal(),Se(),ce.innerHTML=Xt("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${n(f)}\u2026</span>
      </div>`);try{let P=await F.judgmentDetail(f,"parquet");if(t||N!==Yt)return;ce.innerHTML=Ce(P)}catch(P){if(t||N!==Yt)return;ce.innerHTML=Xt("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(P.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},ut=0,Zt=(f,N)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${n(f)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${m("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${N}</div>`,xs=(f,N="")=>{let P=String(f.selected_article_no||N||"").trim(),K=!!P,le=Array.isArray(f.articles)?f.articles:[],he=le.map(gt=>{let ea=String(gt.article_content||"").trim();return ea?gt.article_type==="C"?`<div class="law-chapter">${n(ea)}</div>`:`<article class="law-article" data-article-no="${n(Xn(gt.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${n(gt.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${n(ea)}</div>
        </article>`:""}).join(""),Fe=(Array.isArray(f.warnings)?f.warnings:[]).map(gt=>n(gt)).join("<br />"),xe=f.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",Ue=f.meta?.articles_source,pt=Ue==="parquet"?"Parquet \u689D\u6587":Ue==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",ot=f.meta?.snapshot||"",Re=[f.law_level,f.law_category,f.article_count?`${c(f.article_count)} \u689D`:"",f.law_modified_date?`\u7570\u52D5 ${vt(f.law_modified_date)}`:""].filter(Boolean).map(gt=>`<span>${n(gt)}</span>`).join(""),Qe=f.law_url?`<a class="btn btn-secondary btn-sm" href="${n(f.law_url)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",Pt=!K&&f.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${n(f.law_histories)}</div>
        </details>`:"",Te=K?`<span class="badge badge-mono">${n(P)}</span>`:"",mt=!K&&le.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",bt=K?`${f.law_name||f.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${P}`:f.law_name||f.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return Zt(bt,`<div class="judgment-dialog-meta">
        <span class="badge ${f.source_type==="order"?"badge-warn":"badge-info"}">${n(xe)}</span>
        ${Te}
        ${Re}
      </div>
      <div class="judgment-dialog-source">${n([pt,ot].filter(Boolean).join(" \xB7 "))}</div>
      ${Fe?`<div class="law-dialog-warning">${Fe}</div>`:""}
      ${Pt}
      ${mt}
      <div class="law-dialog-articles">${he||`<div class="report-empty-inline">${K?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${Qe}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},ds=(f,N)=>{let P=f?.querySelector(`#${N}`),K=Xn(P?.value||"");if(!K){L("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),P?.focus();return}let le=[...f?.querySelectorAll("[data-article-no]")||[]].find(he=>he.dataset.articleNo===K);if(!le){L(`\u627E\u4E0D\u5230\u7B2C ${K} \u689D\u3002`,"warn");return}le.scrollIntoView({behavior:"instant",block:"center"}),le.classList.add("is-jump-target"),window.setTimeout(()=>le.classList.remove("is-jump-target"),2400)},es=async(f,N="",P="")=>{if(!ve||!f)return;let K=++ut;ve.open||ve.showModal(),Se(),ve.innerHTML=Zt(P?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${n([f,P].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let le=await F.lawDetail(f,N,"",P);if(t||K!==ut)return;ve.innerHTML=xs(le,P)}catch(le){if(t||K!==ut)return;ve.innerHTML=Zt("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(le.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};ve?.addEventListener("click",f=>{let N=f.target.closest('[data-action="jump-law-article"]');if(N){ds(ve,N.dataset.jumpInput||"rag-law-article-jump");return}if(f.target.closest('[data-action="close-law-source"]')){ve.close();return}let P=ve.getBoundingClientRect();(f.clientX<P.left||f.clientX>P.right||f.clientY<P.top||f.clientY>P.bottom)&&ve.close()}),ve?.addEventListener("keydown",f=>{!f.target.matches(".law-jump-input")||f.key!=="Enter"||(f.preventDefault(),ds(ve,f.target.id))}),ce?.addEventListener("click",f=>{let N=f.target.closest('[data-action="open-law-source"]');if(N){es(N.dataset.lawKey||"",N.dataset.sourceType||"",N.dataset.articleNo||"");return}if(f.target.closest('[data-action="close-parquet-judgment"]')){ce.close();return}let P=ce.getBoundingClientRect();(f.clientX<P.left||f.clientX>P.right||f.clientY<P.top||f.clientY>P.bottom)&&ce.close()}),we.addEventListener("click",f=>{let N=f.target.closest(".rag-process-toggle");if(N){let K=N.closest(".rag-process"),le=N.getAttribute("aria-expanded")==="true";La(K,!le);return}let P=f.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(P){if(P.dataset.action==="open-law-source"){es(P.dataset.lawKey||"",P.dataset.sourceType||"",P.dataset.articleNo||"");return}St(P.dataset.jid||"")}}),we.addEventListener("keydown",f=>{if(f.key!=="Enter"&&f.key!==" ")return;let N=f.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!N||N.closest("a, button"))){if(f.preventDefault(),N.dataset.action==="open-law-source"){es(N.dataset.lawKey||"",N.dataset.sourceType||"",N.dataset.articleNo||"");return}St(N.dataset.jid||"")}});let Zs=async(f,{fresh:N=!1,source:P="hero"}={})=>{let K=f.trim();if(!K){L("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),(P==="followup"?E:te).focus();return}(N||!$)&&(v=null,k=[],we.innerHTML="",He());let le=++p,he=()=>t||le!==p,Fe=o;d=K,oe(!0),qe(),P==="followup"?(E.value="",U()):(te.value="",O());let{answerElement:xe}=me(K,ko(K,b)),Ue=b?null:_o(xe);b?(Xe(null),Kt()):(et(),Xe(null)),pe(de,!0,"\u6AA2\u7D22\u4E2D\u2026"),pe(S,!0,"\u6AA2\u7D22\u4E2D\u2026");let pt=null,ot="",Re=Te=>{if(he()||!Te?.partial)return;let mt=xe.querySelector(".answer-body");if(!mt)return;pt=Te,ot=String(Te.answer||""),mt.innerHTML=tr(Te),Ue?.collapse?.();let bt=xe.querySelector(".answer-head-title");bt&&(bt.textContent=Te.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},Qe=Te=>{if(he()||!Te||!pt?.streaming)return;ot+=Te;let mt=xe.querySelector("[data-partial-answer]");mt&&(mt.textContent=ot)},Pt=()=>{if(he()||!pt?.streaming)return;ot="";let Te=xe.querySelector("[data-partial-answer]");Te&&(Te.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")};try{let Te=b?await F.rag(K,{testMode:b}):await F.ragStream(K,{onStep:bt=>{he()||Ue?.step(bt)},onPartial:Re,onToken:Qe,onTokenReset:Pt});if(he())return;et();let mt=Ue?.finish(!0)||"";if(xe.innerHTML=Zn(K,Te,mt),Te.pipeline_flow||vo(Te).then(()=>{if(he()||!Te.pipeline_flow)return;let bt=xe.querySelector(".answer-body");if(!bt||bt.querySelector(".rag-wf-card"))return;let gt=Hs(Te.pipeline_flow,{serverDurationMs:Number(Te.duration_ms)||0,embedded:!0});gt&&bt.insertAdjacentHTML("beforeend",gt)}),Te.test_run?.run_id?await ks(Te.test_run.run_id):Xe(null),await ne(K,Te,Fe,le),he())return;V()}catch(Te){if(he())return;et();let mt=Ue?.finish(!1)||"";xe.innerHTML=Mo(Te,mt),V(),L(Te.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{he()||(et(),pe(de,!1),pe(S,!1))}};return H.addEventListener("submit",f=>{f.preventDefault(),Zs(te.value,{fresh:!0,source:"hero"})}),W.addEventListener("submit",f=>{f.preventDefault(),Zs(E.value,{fresh:!1,source:"followup"})}),te.addEventListener("input",O),te.addEventListener("keydown",f=>{f.key==="Enter"&&!f.shiftKey&&!f.isComposing&&(f.preventDefault(),H.requestSubmit())}),E.addEventListener("input",U),E.addEventListener("keydown",f=>{f.key==="Enter"&&!f.shiftKey&&!f.isComposing&&(f.preventDefault(),W.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",f=>{let N=f.target.closest("[data-question]");N&&(te.value=N.dataset.question,O(),H.requestSubmit())}),e.addEventListener("click",async f=>{let N=f.target.closest("[data-rag-model]");if(N){let P=N.dataset.ragProvider?Number(N.dataset.ragProvider):null;await Vt(N.dataset.ragModel||"",Number.isFinite(P)?P:null);return}f.target.closest('[data-rag-action="refresh-chat-models"]')&&await dt()}),T.addEventListener("click",async f=>{let N=f.target.closest("[data-rag-toggle]");if(N){let xe=N.closest(".rag-library-section").classList.toggle("is-collapsed");N.setAttribute("aria-expanded",String(!xe));return}let P=f.target.closest("[data-rag-action]"),K=P?.dataset.ragAction||"";if(K==="new-chat"){ft();return}if(K==="open-history-menu"){Jt(P,P.dataset.historyId);return}if(K==="toggle-pin"){await Ze(P.dataset.historyId);return}if(K==="select-project"){qt(P.dataset.projectId||"");return}if(K==="show-project-form"){Ve();return}if(K==="cancel-project"){Qt();return}if(K==="more-recent"){l+=12,He();return}if(K==="clear-project"){qt("");return}let le=f.target.closest("[data-history-open]");if(!le)return;let he=s.find(Fe=>String(Fe.id)===String(le.dataset.historyId));he&&(o=String(he.project_id||""),He(),!Ie(he)&&(v=null,k=[],Zs(he.title,{fresh:!0,source:"history"})))}),T.addEventListener("submit",async f=>{let N=f.target.closest('[data-rag-form="project"]');N&&(f.preventDefault(),await ct(N))}),se.addEventListener("click",g),document.addEventListener("click",_),document.addEventListener("keydown",M),window.addEventListener("scroll",G,{capture:!0,passive:!0}),window.addEventListener("resize",I),re.addEventListener("click",async()=>{if(!s.length){L("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await rn(),await J(),L("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),O(),await Promise.allSettled([Ne(),J(),it(),Wt()]),await Ss(),()=>{t=!0,et(),I(),document.removeEventListener("click",_),document.removeEventListener("keydown",M),window.removeEventListener("scroll",G,{capture:!0}),window.removeEventListener("resize",I),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",cs),d&&we.setAttribute("data-last-question",d)}}var Pa={};It(Pa,{render:()=>Ml});var Co=2e3,sr=3e4,Ta=new Set(["full_update","judgment_import","index_versions"]),Ro={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},partial:{label:"\u90E8\u5206\u5B8C\u6210",tone:"warn"},update:{label:"\u66F4\u65B0",tone:"warn"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"},provided:{label:"\u5916\u90E8\u63D0\u4F9B",tone:"info"}},ar={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},nr={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},pr={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"},Gs={judgment:"#a78bfa",law:"#22d3ee",order:"#f472b6",system:"#94a3b8"},Po={extract:"file",raw_parquet:"cube",filter:"filter",postgres:"database",qdrant:"brain",ollama:"cloud",validate:"shield",download:"download",parse:"sliders"},Io={raw_parquet:"\u539F\u59CB Parquet",postgres:"PostgreSQL"},rr={law_download:"law",order_download:"order",judgment_download:"judgment"},ir={law_download:"\u6CD5\u898F\u4E0B\u8F09",order_download:"\u547D\u4EE4\u4E0B\u8F09",judgment_download:"\u5224\u6C7A\u4E0B\u8F09"},Oo={law_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",order_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",judgment_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u5224\u6C7A RAR \u55CE\uFF1F\uFF08\u4E0D\u6703\u81EA\u52D5\u532F\u5165 PostgreSQL \u6216\u5EFA\u7ACB Qdrant \u7D22\u5F15\uFF09"},Bo={law_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u6CD5\u898F RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",order_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u547D\u4EE4 RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",judgment_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u53EA\u4E0B\u8F09\u5224\u6C7A RAR\u3002PostgreSQL\uFF0FParquet \u532F\u5165\u8207 Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\u300C\u5224\u6C7A\u532F\u5165\u300D\u6216\u5B8C\u6574\u8CC7\u6599\u66F4\u65B0\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_import:"\u6D41\u7A0B\u7BC4\u570D\uFF1ARAR \u2192 \u539F\u59CB Parquet \u2192 \u91D1\u878D\u6CD5\u898F\u7BE9\u9078 \u2192 PostgreSQL\u3002Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_parquet:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5F9E PostgreSQL \u532F\u51FA\u67E5\u8A62\u7528 Parquet \u5FEB\u7167\uFF1B\u4E0D\u5BEB\u5165 Qdrant\uFF0FIndexedDB\u3002",index_versions:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5EFA\u7ACB\u4E26\u9A57\u8B49\u65B0\u7684 Qdrant collection\uFF0C\u5B8C\u6210\u5F8C\u539F\u5B50\u5207\u63DB alias\uFF1BIndexedDB \u4E0D\u53C3\u8207\u3002"};function zt(e){return Ro[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function ze(e,t){let s=zt(e);return`<span class="badge ${ar[s.tone]||ar.idle}"><span class="status-dot ${nr[s.tone]||nr.idle}"></span>${n(t||s.label)}</span>`}function rt(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function or(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":c(e)}function wt(e){return e&&e.color?String(e.color):"var(--accent)"}function hs(e,t=""){let s=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),a=e.status==="running"&&s===null,r=a?' aria-valuetext="\u9032\u5EA6\u672A\u77E5"':` aria-valuenow="${s??0}"`;return`<div class="processing-bar${a?" is-indeterminate":""}${t?` ${t}`:""}" role="progressbar" aria-valuemin="0" aria-valuemax="100"${r}>
    <span class="processing-bar-fill" style="width:${s??0}%;background:${n(wt(e))}"></span>
  </div>`}function Na(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return["skipped","pending","idle"].includes(e.status)?"\u2014":s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${be(s)} / ${be(a)}`:be(s):a?`${c(s)} / ${c(a)} ${t}`:`${c(s)} ${t}`}function Do(e){let t=[`<span>${n(Na(e))}</span>`];return e.percent===null||e.percent===void 0?e.status==="running"&&t.push('<span class="mono">\u9032\u5EA6\u672A\u77E5</span>'):t.push(`<span class="mono">${rt(e.percent)}</span>`),e.duration_ms&&t.push(`<span class="mono">${ie(e.duration_ms)}</span>`),t.join("")}function Fo(e){let s=(Array.isArray(e.stats)?e.stats:[]).map(r=>`<span class="processing-stage-stat"><span>${n(r.label)}</span><strong>${n(r.value)}</strong></span>`),a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&s.push(`<span class="processing-stage-stat"><span>\u7D22\u5F15\u8986\u84CB</span><strong>${c(a.indexed)} / ${c(a.total)}</strong></span>`),s.length?`<div class="processing-stage-stats">${s.join("")}</div>`:""}function Ho(e,{compact:t=!1,step:s=null}={}){let a=zt(e.status),r=e.status==="running";return`<div class="processing-stage${t?" is-compact":""} is-${a.tone}${r?" is-live":""}" style="--stage-color:${n(wt(e))}"${r?' aria-current="step"':""}>
    <div class="processing-stage-head">
      ${s===null?"":`<span class="processing-stage-step">${String(s).padStart(2,"0")}</span>`}
      <span class="processing-stage-swatch" style="background:${n(wt(e))}"></span>
      <span class="processing-stage-label">${n(e.label||e.key)}</span>
      ${ze(e.status)}
    </div>
    ${hs(e)}
    <div class="processing-stage-meta">${Do(e)}</div>
    ${e.message?`<div class="processing-stage-message" title="${n(e.message)}">${n(e.message)}</div>`:""}
    ${t?"":Fo(e)}
  </div>`}function mr(e){let t=zt(e);return`<span class="flow-status is-${t.tone}"><span class="flow-status-dot"></span>${n(t.label)}</span>`}function lr(e,t){return t==null||t===""?"\u2014":e.unit==="bytes"?be(t):c(t)}function zo(e){let t=[{label:"\u76EE\u524D",value:lr(e,e.current)},{label:"\u7E3D\u91CF",value:lr(e,e.total)},{label:"\u767E\u5206\u6BD4",value:e.percent===null||e.percent===void 0?e.status==="running"?"\u8A08\u7B97\u4E2D":"\u2014":rt(e.percent)},{label:"\u8017\u6642",value:e.duration_ms?ie(e.duration_ms):"\u2014"}],s=Array.isArray(e.stats)?e.stats:[];for(let r of s){if(t.length>=6)break;r&&r.label&&r.value&&t.push({label:String(r.label),value:String(r.value)})}let a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&!t.some(r=>r.label==="\u7D22\u5F15\u8986\u84CB")&&t.push({label:"\u7D22\u5F15\u8986\u84CB",value:`${c(a.indexed)} / ${c(a.total)}`}),t}function Uo(e,t){let s=zt(e.status),a=e.status==="running",r=zo(e);return`<article class="flow-node is-${s.tone}${a?" is-live":""}" style="--stage-color:${n(wt(e))}"${a?' aria-current="step"':""}>
    <div class="flow-node-head">
      <span class="flow-node-icon">${m(Po[e.key]||"cube",14)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">STEP ${String(t+1).padStart(2,"0")}</span>
        <strong>${n(Io[e.key]||e.label||e.key)}</strong>
      </div>
      ${mr(e.status)}
    </div>
    <div class="flow-node-body">
      ${hs(e,"flow-progress")}
      <div class="flow-node-props">${r.map(i=>`<div class="flow-prop"><span>${n(i.label)}</span><strong>${n(i.value)}</strong></div>`).join("")}</div>
      ${e.message?`<div class="flow-node-note" title="${n(e.message)}">${n(e.message)}</div>`:""}
    </div>
  </article>`}function Qo(e,t,s,a){let r=wt(e),i=a||"#8b5cf6",o=e.status==="running",l=`${s}-${t}`,d=`flow-gradient-${l}`,p=`flow-marker-${l}`,v=t%2===0?"M2 60 C8 42 16 78 22 60":"M2 60 C8 78 16 42 22 60";return`<div class="flow-link${o?" is-live":""}" style="color:${n(r)}" aria-hidden="true">
    <svg viewBox="0 0 28 120" width="28" height="120" fill="none">
      <defs>
        <linearGradient id="${d}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${n(i)}"/>
          <stop offset="1" stop-color="${n(r)}"/>
        </linearGradient>
        <marker id="${p}" viewBox="0 0 8 8" refX="6.2" refY="4" markerWidth="4.6" markerHeight="4.6" orient="auto">
          <path d="M0 0 8 4 0 8Z" fill="${n(r)}"/>
        </marker>
      </defs>
      <path class="flow-link-line" d="${v}" stroke="url(#${d})" stroke-width="1.7" stroke-linecap="round" marker-end="url(#${p})"/>
      <circle class="flow-link-port" cx="2" cy="60" r="3.6" stroke="${n(i)}" stroke-width="1.5"/>
      <circle class="flow-link-port" cx="26" cy="60" r="3.6" stroke="${n(r)}" stroke-width="1.5"/>
    </svg>
  </div>`}function gr(e){if(!e)return"";let t=[];return e.started_at&&t.push(`\u958B\u59CB ${$e(e.started_at)}`),e.duration_ms&&t.push(`\u8017\u6642 ${ie(e.duration_ms)}`),e.pid&&t.push(`PID ${e.pid}`),t.join(" \xB7 ")}function Go(e,{active:t,focus:s,status:a,runLine:r,runningStage:i}){let o=e.label||pr[e.key]||e.key;return`<div class="flow-source${t?" is-live":""}" style="--branch-accent:${Gs[e.key]||Gs.system}">
    <div class="flow-source-head">
      <span class="flow-source-icon">${m(e.icon||"database",15)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">SOURCE</span>
        <strong>${n(o)}</strong>
      </div>
      ${mr(a)}
    </div>
    <div class="flow-source-body">
      <p class="flow-source-desc">${n(e.description||"")}</p>
      <div class="flow-source-meta">${r}</div>
      ${i?`<div class="flow-source-current"><span class="flow-current-dot"></span>\u76EE\u524D\u968E\u6BB5\uFF1A<strong>${n(i.label||i.key)}</strong></div>`:""}
      ${s&&s.message?`<div class="flow-source-note" title="${n(s.message)}">${n(s.message)}</div>`:""}
    </div>
  </div>`}function Jo(e){let t=e.active_run,s=t||e.focus_run||e.last_run,a=t?"running":s?s.status:"idle",r=s?n(gr(s)||ts(s.started_at||s.finished_at)):"\u5C1A\u7121\u57F7\u884C\u7D00\u9304",i=Array.isArray(e.stages)?e.stages:[],o=i.find(k=>k.status==="running"),l=Gs[e.key]||Gs.system,d=String(e.key||"branch").replace(/[^a-zA-Z0-9_-]/g,""),p=Go(e,{active:t,focus:s,status:a,runLine:r,runningStage:o}),v=i.length?i.map((k,$)=>{let b=$?wt(i[$-1]):l;return`${Qo(k,$,d,b)}${Uo(k,$)}`}).join(""):'<div class="flow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u968E\u6BB5\u3002</div>';return`<article class="flow-lane" style="--branch-accent:${l}"><div class="flow-row">${p}${v}</div></article>`}function Vo(e){return`<div class="flow-canvas-open">
    <div class="processing-branches">${(Array.isArray(e.branches)?e.branches:[]).map(Jo).join("")}</div>
  </div>`}function Ht(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${n(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function Wo(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},r=e.raw_backups||{},i=r.totals||{},o=e.state||{},l=e.capabilities||{},d=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",p=t.status==="operational",v=s.status==="operational",k=a.available!==!1,$=r.available!==!1,b=v?`${c(s.indexed)} / ${c(s.total)}`:ze(s.status||"unavailable"),h=v?`${rt(s.percent)} \xB7 \u5C1A\u9918 ${c(s.remaining)} \u7B46`:n(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),w=k?`${c(a.unprocessed)} / ${c(a.total)}`:ze("unavailable"),A=k?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${be(a.unprocessed_bytes)} \u5F85\u8655\u7406`:n(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${Ht("\u8655\u7406\u72C0\u614B",ze(e.status||"unknown"),`${n(d)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${Ht("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",n(w),A)}
    ${Ht("\u539F\u59CB Parquet \u5099\u4EFD",$?`${c(r.count)} \u6A94`:ze("unavailable"),$?`\u5171 ${c(i.row_count)} \u7B46 \xB7 ${be(i.compressed_bytes)}`:n(r.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB Parquet \u5099\u4EFD\u3002"))}
    ${Ht("PostgreSQL \u5224\u6C7A",p?c(t.judgment_count):ze("unavailable"),p?`\u6CD5\u898F ${or(t.law_count)} \xB7 \u547D\u4EE4 ${or(t.order_count)}`:n(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${Ht("Qdrant \u7D22\u5F15",b,h)}
    ${Ht("\u72C0\u614B\u6A94",ze(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${n($e(o.updated_at))}`:n(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${Ht("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?n(l.start_blocked_reason):`\u672A\u8655\u7406 ${c(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${c(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${c(l.external_processes)} \u500B`:""}`)}
  </div>`}function Ko(e){if(e.available===!1)return ye({tone:"warn",title:"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304",text:n(e.error||"\u7121\u6CD5\u6383\u63CF .rar \u6A94\u6848\u3002")});let t=Number(e.total)||0,s=Number(e.processed)||0,a=Number(e.unprocessed)||0,r=t?100*s/t:null;return`<div class="processing-archive-summary">
    <div class="processing-archive-summary-head">
      <span class="mono">${n(e.data_dir||"")}</span>
      <span>${c(s)} / ${c(t)} \u5DF2\u8655\u7406 \xB7 ${c(a)} \u5F85\u8655\u7406 \xB7 ${be(e.unprocessed_bytes)} \u5F85\u8655\u7406</span>
    </div>
    ${hs({percent:r,status:a?"pending":"success",color:"var(--success)"},"processing-bar-lg")}
    <div class="processing-archive-summary-meta">
      <span>\u58D3\u7E2E\u6A94\u532F\u5165\u8986\u84CB ${rt(r)}</span>
      <span>\u5168\u90E8 ${be(e.total_bytes)}</span>
    </div>
  </div>`}function Yo(e){let t=e.stages||{},a=["extract","filter","postgres"].map(r=>t[r]).filter(Boolean).map(r=>Ho(r,{compact:!0}));return a.length?`<div class="processing-archive-stages">${a.join("")}</div>`:""}function Xo(e){let t=e.status||"pending",s=t==="running",a=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),r=s&&a===null,i=[];return e.message&&i.push(e.message),e.error&&i.push(e.error),(e.scanned||e.matched||e.stored)&&i.push(`\u6383\u63CF ${c(e.scanned)} \xB7 \u547D\u4E2D ${c(e.matched)} \xB7 \u5BEB\u5165 ${c(e.stored)}`),`<div class="processing-archive is-${zt(t).tone}">
    <div class="processing-archive-head">
      <span class="processing-archive-name mono">${n(e.name)}</span>
      <div class="processing-archive-bar-wrap">
        ${hs({percent:a,status:t,color:s?"var(--accent)":"var(--success)"})}
      </div>
      <span class="processing-archive-percent mono">${r?"\u9032\u884C\u4E2D":rt(a)}</span>
      ${ze(t)}
      <span class="processing-archive-size faint">${be(e.size_bytes)}</span>
    </div>
    ${Yo(e)}
    ${i.length?`<div class="processing-archive-note">${i.map(o=>`<span>${n(o)}</span>`).join("")}</div>`:""}
  </div>`}function Zo(e){let t=e.archives||{},s=e.local_archives||{},a=Array.isArray(t.items)?t.items:[],r=t.run,i=`<div class="report-section-head">
    <div>
      <div class="report-kicker">ARCHIVE PIPELINE</div>
      <h2 class="report-section-title">\u5224\u6C7A\u58D3\u7E2E\u6A94</h2>
      <p class="processing-section-sub">\u6BCF\u500B\u58D3\u7E2E\u6A94\u540D\u7A31\u5F8C\u65B9\u5373\u6642\u986F\u793A\u8655\u7406\u9032\u5EA6\uFF1B\u672A\u53D6\u5F97\u53EF\u8A08\u7B97\u7684\u7E3D\u91CF\u6642\u6A19\u793A\u300C\u9032\u5EA6\u672A\u77E5\u300D\uFF0C\u4E0D\u4EE5\u63A8\u6E2C\u6578\u503C\u4EE3\u66FF\u3002</p>
    </div>
  </div>`,o=t.source==="run"?`${ze(r?r.status:"idle")} <span>\u76EE\u524D\u986F\u793A ${r?n(r.title||"\u5224\u6C7A\u532F\u5165"):"\u6700\u8FD1\u4E00\u6B21\u532F\u5165"} \u7684\u9010\u6A94\u9032\u5EA6${r&&r.started_at?` \xB7 ${n(gr(r))}`:""}</span>`:t.external?`${ze("running")} <span>${n(t.note||"\u5916\u90E8\u532F\u5165\u7A0B\u5E8F\u672A\u5BEB\u5165\u9010\u6A94\u72C0\u614B\uFF1B\u4EE5\u4E0B\u70BA PostgreSQL \u8986\u84CB\u7387\u3002")}</span>`:'<span class="faint">\u76EE\u524D\u6C92\u6709\u53EF\u8B80\u53D6\u7684\u532F\u5165 run \u72C0\u614B\uFF1B\u4EE5\u4E0B\u4EE5 PostgreSQL \u7684 source_archive \u5224\u5B9A\u662F\u5426\u5DF2\u8655\u7406\u3002</span>';return`<section class="report-card processing-card">
    <div class="report-head">${i}</div>
    <div class="report-section">
      ${Ko(s)}
      <div class="processing-archive-run">${o}</div>
      ${a.length?`<div class="processing-archive-list">${a.map(Xo).join("")}</div>`:`<div class="processing-empty">\u627E\u4E0D\u5230 .rar \u58D3\u7E2E\u6A94\uFF1B\u8ACB\u78BA\u8A8D ${n(s.data_dir||"\u5224\u6C7A\u8CC7\u6599\u76EE\u9304")}\u3002</div>`}
    </div>
  </section>`}function el(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">ELAPSED COMPOSITION</div>
      <h2 class="report-section-title">\u6574\u9AD4\u8655\u7406\u6642\u9593</h2>
      <p class="processing-section-sub">\u9577\u5EA6\u4F9D\u5F8C\u7AEF\u8A18\u9304\u7684\u5BE6\u969B\u968E\u6BB5\u8017\u6642\u6BD4\u4F8B\u6392\u5217\uFF1B\u672A\u57F7\u884C\u6216\u7121\u6CD5\u53D6\u5F97\u7684\u968E\u6BB5\u4E0D\u6703\u88AB\u8A08\u5165\u3002</p>
    </div>
  </div>`;if(!t.available||!s.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section">
        <div class="processing-empty">${n(t.label||"\u5C1A\u7121\u53EF\u8A08\u7B97\u7684\u968E\u6BB5\u8017\u6642\uFF1B\u57F7\u884C\u8CC7\u6599\u66F4\u65B0\u6216\u7D22\u5F15\u5F8C\u6703\u986F\u793A\u3002")}</div>
      </div>
    </section>`;let r=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${n(o.color||"var(--accent)")}" title="${n(`${o.label} ${ie(o.duration_ms)} (${rt(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${n(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${n(o.label)}</span>
        <span class="mono">${ie(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${rt(o.percent)}</span>
        ${ze(o.status)}
      </div>`).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section">
      <div class="processing-timeline-label">
        <span>${n(t.label||"\u968E\u6BB5\u8017\u6642")}</span>
        <span class="mono">\u7E3D\u8A08 ${ie(t.total_ms)}</span>
      </div>
      <div class="processing-stack" role="img" aria-label="\u968E\u6BB5\u8017\u6642\u6BD4\u4F8B">${r}</div>
      <div class="processing-legend">${i}</div>
    </div>
  </section>`}function tl(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let r=t.map(i=>{let o=s.get(i.branch)||pr[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${n(o)}</span>
          <strong>${n(i.title||"\u8655\u7406")}</strong>
          ${ze(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${n($e(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?ie(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${n(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${r}</div></div>
  </section>`}function sl(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>ye({tone:s.tone||"info",title:s.title,text:n(s.message||"")})).join("")}</div>`:""}function cr(e){return`${sl(e)}
    ${Wo(e)}
    <section class="processing-flow-section">
      <div class="processing-section-head">
        <div>
          <div class="report-kicker">PIPELINE CANVAS</div>
          <h2 class="report-section-title">\u8655\u7406\u6D41\u7A0B</h2>
          <p class="processing-section-sub">\u5224\u6C7A\u3001\u6CD5\u898F\u3001\u547D\u4EE4\u4E09\u689D\u6D41\u7A0B\u5373\u6642\u53CD\u6620\u76EE\u524D\u57F7\u884C\u968E\u6BB5\uFF1B\u66F2\u7DDA\u7531\u4F86\u6E90\u7BC0\u9EDE\u9023\u5230\u5404\u968E\u6BB5\uFF0C\u767C\u5149\u7BC0\u9EDE\u8207\u6D41\u52D5\u66F2\u7DDA\u8868\u793A\u76EE\u524D\u57F7\u884C\u4F4D\u7F6E\u3002</p>
        </div>
      </div>
      ${Vo(e)}
    </section>
    ${Zo(e)}
    ${el(e)}
    ${tl(e)}`}function al(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${ye({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:n(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${n($e(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${m("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}var fr={overview:"activity",full_update:"download",law_download:"layers",order_download:"file",judgment_download:"download",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function nl(e){let s=(Array.isArray(e.workflows)?e.workflows:[]).map(r=>{let i=r.active_run||null,o=i||r.last_run||null;return{...r,activeRun:i,lastRun:o,status:i?i.status||"running":r.update_available?"update":o?.status||"idle"}}),a=s.find(r=>r.id==="judgment_parquet");return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...s.filter(r=>r.id!=="judgment_parquet"),...a?[a]:[]]}function dr(e,t){return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${nl(e).map(a=>{let r=a.id===t,i=fr[a.id]||"terminal";return`${a.id==="normalize_courts"?'<div class="status-tab-divider" role="separator" aria-hidden="true"></div>':""}<button class="status-tab${r?" is-active":""}" type="button"
            data-processing-workflow="${n(a.id)}"
            ${r?'aria-current="page"':""}>
            <span class="status-tab-icon">${m(i,15)}</span>
            <span class="status-tab-copy">
              <strong>${n(a.label)}</strong>
              <small>${n(a.description||"")}</small>
            </span>
            ${ze(a.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${n(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function rl(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${ze(e.status)}
      <span class="mono">${n(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${n($e(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${ie(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${n(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${n(t.log_path)}</strong>`:""}
    </div>
  </div>`}function $s(e){return`${e.year}-${String(e.month_no).padStart(2,"0")}`}function br(e){let t={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"},s=e.status||"red";return[$s(e),t[s]||s,e.latest_fileset_id?`fileset ${e.latest_fileset_id}`:"",e.filename||"",e.local_filename&&e.local_filename!==e.filename?`\u672C\u6A5F\uFF1A${e.local_filename}`:""].filter(Boolean).join(" \xB7 ")}function vr(e){if(!e.download_url)return"";let t=$s(e);return`<a class="judgment-month-download" href="${n(st(e.download_url))}" target="_blank" rel="noreferrer" title="\u4E0B\u8F09 ${t} \u5224\u6C7A" aria-label="\u4E0B\u8F09 ${t} \u5224\u6C7A">${m("download",11)}</a>`}function il(e){let t=e.status||"red";return`<td class="judgment-month is-${n(t)}" data-judgment-month-key="${n($s(e))}" title="${n(br(e))}"><span>${e.month_no}</span>${vr(e)}</td>`}function ol(e){return e?.off_hours_enabled===!0}function hr(e){return`\u7DA0\u8272\uFF1A\u6700\u65B0\u7248\u5DF2\u4E0B\u8F09\u5230 raw_rar\uFF1B\u7070\u8272\uFF1A\u672C\u6A5F\u4ECD\u662F\u820A\u7248\uFF0C\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u6703\u66F4\u65B0\uFF1B\u7D05\u8272\uFF1A\u8A72\u6708\u4EFD\u7F3A\u5C11\u5224\u6C7A\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u958B\u555F\u4E0B\u8F09\u9023\u7D50\uFF08${ol(e)?"\u975E API \u6642\u6BB5\u4E5F\u53EF\u4E0B\u8F09\uFF0C\u5EFA\u8B70\u4E00\u6B21\u53EA\u4E0B\u8F09\u4E00\u500B\u6A94\u6848":"\u4E0B\u8F09\u9023\u7D50\u50C5\u5728 00:00\u201306:00 API \u6642\u6BB5\u53EF\u7528"}\uFF09\u3002\u5F85\u88DC\u9F4A\u6708\u4EFD\u6703\u512A\u5148\u4E0B\u8F09\uFF0C\u5168\u90E8\u88DC\u9F4A\u5F8C\u624D\u7531\u6700\u65B0\u6708\u4EFD\u5F80\u56DE\u9A57\u8B49\u65E2\u6709\u6A94\u6848\uFF1B\u4E2D\u65B7\u7684\u4E0B\u8F09\u6703\u4FDD\u7559 .part\uFF0C\u4F3A\u670D\u5668\u652F\u63F4 Range \u6642\u7E8C\u50B3\uFF0C\u5426\u5247\u5F9E\u96F6\u91CD\u65B0\u4E0B\u8F09\u3002\u9996\u6B21\u5B8C\u6574\u540C\u6B65\u53EF\u80FD\u9700\u4E0B\u8F09\u6578\u767E\u500B\u6708\u4EFD\uFF0C\u9810\u8A2D\u975E\u6642\u6BB5\u4E5F\u53EF\u7E8C\u50B3\uFF1B\u56B4\u683C\u6A21\u5F0F\u6703\u5728 00:00\u201306:00 \u4EE5\u5916\u505C\u6B62\u3002`}var ll={completed:"\u5B8C\u6210",window_closed:"API \u6642\u6BB5\u7D50\u675F",deadline:"\u63A5\u8FD1 06:00\uFF0C\u4FDD\u7559\u5F85\u4E0B\u8F09\u6708\u4EFD",verification_window_closed:"API \u6642\u6BB5\u7D50\u675F\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",verification_deadline:"\u63A5\u8FD1 06:00\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",errors:"\u90E8\u5206\u6708\u4EFD\u4E0B\u8F09\u5931\u6557\uFF0C\u4E0B\u6B21\u91CD\u8A66",pending:"\u4ECD\u6709\u5F85\u4E0B\u8F09\u6708\u4EFD",check_only:"\u50C5\u6AA2\u67E5\uFF0C\u672A\u4E0B\u8F09",incremental:"\u589E\u91CF\u6AA2\u67E5\u5B8C\u6210",status_only:"\u50C5\u66F4\u65B0\u6708\u4EFD\u72C0\u614B",running:"\u57F7\u884C\u4E2D"};function $r(e){let t=e?.backfill||{},s=t.verification||{},a=t.last_run||{},r=Number(t.pending_count)||0,i=Number(t.failure_count)||0,o=String(t.resume_from_month||""),l="\u9A57\u8B49\uFF1A\u672A\u958B\u59CB";s.status==="completed"?l="\u9A57\u8B49\u5B8C\u6210":s.next_month?l=`\u9A57\u8B49\u7E8C\u50B3 ${s.next_month}`:s.status==="in_progress"&&(l="\u9A57\u8B49\u9032\u884C\u4E2D");let d=String(a.stop_reason||""),p=d?`\u4E0A\u6B21\u505C\u6B62\uFF1A${ll[d]||d}`:"";return{pending:r,failures:i,resume:o,verificationText:l,lastText:p}}function cl(e){let t=$r(e),s=t.pending>0?`\u5F85\u88DC\u9F4A ${c(t.pending)} \u500B\u6708${t.failures>0?`\uFF08${c(t.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708";return`<div class="judgment-backfill" data-judgment-backfill>
    <span class="badge ${t.pending>0?"badge-danger":"badge-ok"}" data-judgment-backfill-pending>${s}</span>
    <span class="badge badge-neutral" data-judgment-backfill-resume ${t.resume&&t.pending>0?"":"hidden"}>\u5F9E ${n(t.resume)} \u7E8C\u50B3</span>
    <span class="badge badge-info" data-judgment-backfill-verification>${n(t.verificationText)}</span>
    <span class="muted" data-judgment-backfill-last ${t.lastText?"":"hidden"}>${n(t.lastText)}</span>
  </div>`}function dl(e,t){let s=$r(t),a=e.querySelector("[data-judgment-backfill-pending]");a&&(a.textContent=s.pending>0?`\u5F85\u88DC\u9F4A ${c(s.pending)} \u500B\u6708${s.failures>0?`\uFF08${c(s.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708",a.classList.toggle("badge-danger",s.pending>0),a.classList.toggle("badge-ok",s.pending===0));let r=e.querySelector("[data-judgment-backfill-resume]");if(r){let l=!!s.resume&&s.pending>0;r.hidden=!l,r.textContent=l?`\u5F9E ${s.resume} \u7E8C\u50B3`:""}let i=e.querySelector("[data-judgment-backfill-verification]");i&&(i.textContent=s.verificationText);let o=e.querySelector("[data-judgment-backfill-last]");o&&(o.hidden=!s.lastText,o.textContent=s.lastText)}function Ca(){return'<div class="judgment-months-loading"><span class="spinner"></span><span>\u8B80\u53D6\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B\u2026</span></div>'}function ul(e){if(e?.loading&&!e?.months?.length)return Ca();if(e?.error&&!e?.months?.length)return ye({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:n(e.error)});let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return'<div class="processing-empty">\u5C1A\u672A\u6709\u6708\u4EFD\u72C0\u614B\uFF1B\u8ACB\u5148\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u3002</div>';let s=new Map(t.map(o=>[$s(o),o])),r=[...new Set(t.map(o=>o.year))].sort((o,l)=>l-o).map(o=>{let l=Array.from({length:12},(d,p)=>{let v=s.get(`${o}-${String(p+1).padStart(2,"0")}`);return v?il(v):`<td class="judgment-month is-empty"><span>${p+1}</span></td>`}).join("");return`<tr><th scope="row">${o}</th>${l}</tr>`}).join(""),i=e.summary||{};return`<div class="judgment-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" data-judgment-summary="green">\u6700\u65B0\u7248 ${c(i.green||0)}</span>
      <span class="badge badge-neutral" data-judgment-summary="gray">\u820A\u7248 ${c(i.gray||0)}</span>
      <span class="badge badge-danger" data-judgment-summary="red">\u7F3A\u5931 ${c(i.red||0)}</span>
      <span class="muted" data-judgment-total>\u5171 ${c(e.total_months||t.length)} \u500B\u6708</span>
    </div>
    ${cl(e)}
    <div class="judgment-months-scroll">
      <table class="judgment-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(o,l)=>`<th scope="col">${l+1}</th>`).join("")}</tr></thead>
        <tbody>${r}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint" data-judgment-hint>${n(hr(e))}</p>
  </div>`}function pl(e,t){let s=Array.isArray(t?.months)?t.months:[],a=t.summary||{},r={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"};e.querySelectorAll("[data-judgment-summary]").forEach(l=>{let d=l.dataset.judgmentSummary||"";l.textContent=`${r[d]||d} ${c(a[d]||0)}`});let i=e.querySelector("[data-judgment-total]");i&&(i.textContent=`\u5171 ${c(t.total_months||s.length)} \u500B\u6708`),dl(e,t);let o=e.querySelector("[data-judgment-hint]");if(o){let l=hr(t);o.textContent!==l&&(o.textContent=l)}for(let l of s){let d=$s(l),p=e.querySelector(`[data-judgment-month-key="${d}"]`);if(!p)continue;let v=l.status||"red";p.classList.contains(`is-${v}`)||(p.classList.remove("is-green","is-gray","is-red","is-empty"),p.classList.add(`is-${v}`));let k=br(l);p.title!==k&&(p.title=k);let $=p.querySelector(".judgment-month-download");if(l.download_url){let b=st(l.download_url);$?$.getAttribute("href")!==b&&($.href=b):p.insertAdjacentHTML("beforeend",vr(l))}else $&&$.remove()}}function ml(e){let t=Array.isArray(e)?e:[];return t.length?`<div class="processing-workflow-history">
    ${t.map(s=>`<div class="processing-workflow-history-row">
          <span class="processing-workflow-history-status">${ze(s.status||"idle")}</span>
          <span class="mono">${n($e(s.started_at))}</span>
          <span class="mono">${n(ie(s.duration_ms||0))}</span>
          <span class="processing-workflow-history-message">${n(s.message||"\u2014")}</span>
        </div>`).join("")}
  </div>`:'<div class="processing-workflow-empty">\u5C1A\u7121\u57F7\u884C\u7D00\u9304\u3002</div>'}function gl(e){let t=Array.isArray(e.update_history)?e.update_history:[];if(!t.length)return'<div class="processing-workflow-empty">\u5C1A\u7121\u7248\u672C\u6AA2\u67E5\u7D00\u9304\u3002</div>';let s={up_to_date:["\u5DF2\u662F\u6700\u65B0","badge-ok"],update_available:["\u6709\u66F4\u65B0","badge-warn"],error:["\u6AA2\u67E5\u5931\u6557","badge-danger"]};return`<div class="processing-workflow-history">
    ${t.map(a=>{let[r,i]=s[a.status]||[a.status||"\u672A\u77E5","badge-neutral"],o=a.remote_content_length!=null?be(a.remote_content_length):"\u2014",l=a.local_version_id?`v${a.local_version_id}`:"\u2014";return`<div class="processing-workflow-history-row">
          <span class="badge ${i}">${n(r)}</span>
          <span class="mono">${n($e(a.checked_at))}</span>
          <span class="mono">\u9060\u7AEF ${n(o)}</span>
          <span class="mono">\u672C\u5730 ${n(l)}</span>
          <span class="processing-workflow-history-message">${n(a.message||"\u2014")}</span>
        </div>`}).join("")}
  </div>`}function Ea(e){let t=String(e.key||""),s=zt(e.status);return[`data-stage-key="${n(t)}"`,`data-stage-label="${n(e.label||t)}"`,`data-stage-color="${n(wt(e))}"`,`data-stage-status-key="${n(e.status||"idle")}"`,`data-stage-status="${n(s.label)}"`,`data-stage-percent="${n(rt(e.percent))}"`,`data-stage-counts="${n(Na(e))}"`,`data-stage-duration="${n(ie(e.duration_ms||0))}"`,`data-stage-contribution="${n(rt(e.contribution_percent))}"`,`data-stage-message="${n(e.message||"")}"`].join(" ")}function fl(e){let t=String(e.status||"idle");return`<div class="processing-workflow-stage${t==="running"?" is-running":""}" style="--stage-color:${n(wt(e))}" ${Ea(e)}>
    <div class="processing-workflow-stage-head">
      <span class="processing-workflow-stage-swatch"></span>
      <span class="processing-workflow-stage-label">${n(e.label||e.key||"\u968E\u6BB5")}</span>
      ${ze(t)}
      <span class="processing-workflow-stage-percent mono">${rt(e.percent)}</span>
    </div>
    ${hs(e)}
    <div class="processing-workflow-stage-meta">
      <span>${n(Na(e))}</span>
      <span class="mono">${ie(e.duration_ms||0)}</span>
      <span class="processing-workflow-stage-message">${n(e.message||"\u2014")}</span>
    </div>
  </div>`}function bl(e){let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${m("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u5404\u968E\u6BB5\u8207\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </section>`;let a=t.overall_percent,i=s.filter($=>$.status!=="skipped").filter($=>Number($.contribution_percent)>0).map($=>`<span class="processing-workflow-progress-segment" style="width:${Number($.contribution_percent)||0}%;background:${n(wt($))}" ${Ea($)}></span>`).join(""),o=s.map($=>`<div class="processing-workflow-progress-legend-item${$.status==="skipped"?" is-skipped":""}" ${Ea($)}>
        <span class="processing-workflow-progress-swatch" style="background:${n(wt($))}"></span>
        <span class="processing-workflow-progress-legend-label">${n($.label||$.key||"\u968E\u6BB5")}</span>
        <span class="mono">${rt($.percent)}</span>
      </div>`).join(""),l=Number(t.completed_stages)||0,d=Number(t.total_stages)||0,p=s.filter($=>$.status==="skipped").length,v=p?`\u5B8C\u6210 ${l} \xB7 \u7565\u904E ${p}`:`${l} / ${d} \u968E\u6BB5`,k=Bo[e.id]||"";return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${m("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
      <span class="badge ${t.run_status==="running"?"badge-info":"badge-neutral"}">${v}</span>
    </div>
    <div class="processing-workflow-stage-list">${s.map(fl).join("")}</div>
    <div class="processing-workflow-overall">
      <div class="processing-workflow-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${rt(a)}</span>
      </div>
      <div class="processing-workflow-progress-stack" role="img" aria-label="\u5404\u968E\u6BB5\u9032\u5EA6\u52A0\u7E3D">${i||'<span class="processing-workflow-progress-empty">\u5C1A\u7121\u53EF\u8A08\u7B97\u9032\u5EA6</span>'}</div>
      <div class="processing-workflow-progress-legend">${o}</div>
      <div class="processing-workflow-progress-hint">\u5C07\u6ED1\u9F20\u79FB\u5230\u4EFB\u4E00\u968E\u6BB5\u6216\u8272\u584A\uFF0C\u53EA\u6703\u4FDD\u7559\u8A72\u9805\u76EE\u4E26\u986F\u793A\u8AAA\u660E\uFF1B\u7565\u904E\u968E\u6BB5\u4E0D\u5217\u5165\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </div>
    ${k?`<p class="processing-workflow-scope-note">${m("info",12)}<span>${n(k)}</span></p>`:""}
  </section>`}function vl(e){let t=String(e||"");return t.length===6?`${t.slice(0,4)}-${t.slice(4)}`:t||"\u2014"}function hl(e,t){let s={primary:"\u4E3B\u8981",fallback:"\u5099\u63F4",provided:"\u5916\u90E8"},a=Array.isArray(e.models)?e.models:[],r=a.length?a.join("\u3001"):"\u2014";return`<div class="index-host-row${e.url&&e.url===t?" is-selected":""}">
    <div class="index-host-head">
      <span class="badge badge-neutral">${n(s[e.role]||e.role||"\u4E3B\u6A5F")}</span>
      <strong class="mono">${n(e.host||"\u2014")}:${n(e.port??"\u2014")}</strong>
      ${ze(e.status||"unavailable")}
      <span class="index-host-model">${n(e.model||"\u2014")}</span>
    </div>
    <div class="index-host-url mono">${n(e.url||"\u2014")}</div>
    <div class="index-host-models" title="${n(r)}">\u6A21\u578B\uFF1A${n(r)}</div>
    ${e.detail?`<div class="index-host-detail">${n(e.detail)}</div>`:""}
  </div>`}function $l(e){let t=Array.isArray(e.months)?e.months:[],s=e.current||{},a=new Map;for(let l of t){let d=String(l.month||"");if(!/^\d{6}$/.test(d))continue;let p=Number(d.slice(4,6));if(p<1||p>12)continue;let v=a.get(d);v||(v={key:d,year:d.slice(0,4),monthNo:p,total:0,processed:0,reused:0,embedded:0,archives:[],current:!1,jid:""},a.set(d,v)),v.total+=Number(l.total)||0,v.processed+=Number(l.processed)||0,v.reused+=Number(l.reused)||0,v.embedded+=Number(l.embedded)||0,l.archive&&v.archives.push(String(l.archive)),s.month===d&&(!s.archive||s.archive===l.archive)&&(v.current=!0,v.jid=String(s.jid||""))}if(!a.size)return'<div class="processing-workflow-empty">\u5C1A\u7121\u53EF\u986F\u793A\u7684\u7D22\u5F15\u6708\u4EFD\uFF1B\u958B\u59CB\u7D22\u5F15\u5F8C\u6703\u4F9D\u6642\u9593\u5217\u51FA\u6708\u4EFD\u72C0\u614B\u3002</div>';let r={green:0,red:0,gray:0};for(let l of a.values())l.total>0&&l.processed>=l.total?(l.status="green",r.green+=1):l.processed>0?(l.status="red",r.red+=1):(l.status="gray",r.gray+=1);let o=[...new Set([...a.values()].map(l=>l.year))].sort((l,d)=>d.localeCompare(l)).map(l=>{let d=Array.from({length:12},(p,v)=>{let k=v+1,$=`${l}${String(k).padStart(2,"0")}`,b=a.get($);if(!b)return`<td class="judgment-month is-empty"><span>${k}</span></td>`;let h=b.total?`${Math.min(100,Math.round(b.processed/b.total*1e3)/10)}%`:"\u2014",w=b.current&&e.run_status==="running",A=[`${b.year}-${String(b.monthNo).padStart(2,"0")}`,b.archives.join("\u3001")||"\u2014",`\u5DF2\u8655\u7406 ${c(b.processed)} / ${c(b.total)}\uFF08${h}\uFF09`,`\u91CD\u7528 ${c(b.reused)} \xB7 \u65B0 embedding ${c(b.embedded)}`,b.current?`${w?"\u76EE\u524D\u7D22\u5F15":"\u6700\u5F8C\u7D22\u5F15"}${b.jid?` \xB7 ${b.jid}`:""}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month index-month is-${b.status}${w?" is-active":""}" title="${n(A)}"${w?' aria-current="true"':""}><span>${k}</span></td>`}).join("");return`<tr><th scope="row">${n(l)}</th>${d}</tr>`}).join("");return`<div class="judgment-months index-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok">\u5B8C\u6210 ${c(r.green)}</span>
      <span class="badge badge-danger">\u672A\u5B8C\u6210 ${c(r.red)}</span>
      <span class="badge badge-neutral">\u5F85\u7D22\u5F15 ${c(r.gray)}</span>
      <span class="muted">\u5171 ${c(a.size)} \u500B\u6708</span>
    </div>
    <div class="judgment-months-scroll">
      <table class="judgment-months-table index-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(l,d)=>`<th scope="col">${d+1}</th>`).join("")}</tr></thead>
        <tbody>${o}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u7D22\u5F15\u5B8C\u6210\uFF1B\u7070\u8272\uFF1A\u65B0\u6A94\uFF0F\u5C1A\u672A\u7D22\u5F15\uFF1B\u7D05\u8272\uFF1A\u5DF2\u958B\u59CB\u4F46\u672A\u5B8C\u6210\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u4F86\u6E90\u6A94\u6848\u3001\u5DF2\u8655\u7406\u7B46\u6578\u8207\u76EE\u524D\u6848\u865F\u3002</p>
  </div>`}function yl(e){let t=e.import_timeline||{},s=Array.isArray(t.months)?t.months:[];if(!s.length)return`<section class="report-card processing-card import-files-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u672A\u53D6\u5F97\u5224\u6C7A\u4E0B\u8F09 manifest \u6216\u672C\u6A5F\u58D3\u7E2E\u6A94\uFF1B\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u5F8C\u6703\u986F\u793A\u6708\u4EFD\u72C0\u614B\u3002</div>
    </section>`;let a=new Map(s.map(v=>[String(v.month),v])),r=[...new Set(s.map(v=>v.year))].sort((v,k)=>k-v),i={green:"\u5DF2\u532F\u5165",red:"\u672A\u532F\u5165",gray:"\u6709\u66F4\u65B0"},o=s.find(v=>v.active),l=r.map(v=>{let k=Array.from({length:12},($,b)=>{let h=b+1,w=`${v}${String(h).padStart(2,"0")}`,A=a.get(w);if(!A)return`<td class="judgment-month is-empty"><span>${h}</span></td>`;let B=i[A.status]?A.status:"red",Q=[`${v}-${String(h).padStart(2,"0")}`,i[B],`\u672C\u6A5F ${A.local_files?.join("\u3001")||"\u2014"}`,`\u5DF2\u532F\u5165 ${A.imported_files?.join("\u3001")||"\u2014"}`,A.unimported_files?.length?`\u5F85\u532F\u5165 ${A.unimported_files.join("\u3001")}`:"",A.manifest_status==="gray"?"\u9060\u7AEF\u6709\u65B0\u7248\u672C":"",A.active?`\u76EE\u524D\u532F\u5165${A.active_archive?` \xB7 ${A.active_archive}`:""}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month import-month is-${B}${A.active?" is-active":""}" title="${n(Q)}"${A.active?' aria-current="true"':""}><span>${h}</span></td>`}).join("");return`<tr><th scope="row">${n(v)}</th>${k}</tr>`}).join(""),d=t.summary||{},p=o?`<div class="index-current-row">
        <span class="badge badge-info">${m("activity",11)}\u76EE\u524D\u532F\u5165</span>
        <strong class="mono">${n(`${String(o.year)}-${String(o.month_no).padStart(2,"0")}`)}</strong>
        <span class="mono">${n(o.active_archive||"\u2014")}</span>
      </div>`:"";return`<section class="report-card processing-card import-files-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
      <span class="badge badge-neutral">${c(t.total_months||s.length)} \u500B\u6708</span>
    </div>
    <div class="judgment-months index-months">
      <div class="judgment-months-meta">
        <span class="badge badge-ok">\u5DF2\u532F\u5165 ${c(d.green||0)}</span>
        <span class="badge badge-danger">\u672A\u532F\u5165 ${c(d.red||0)}</span>
        <span class="badge badge-neutral">\u6709\u66F4\u65B0 ${c(d.gray||0)}</span>
        <span class="muted">\u5171 ${c(t.total_months||s.length)} \u500B\u6708</span>
      </div>
      ${p}
      <div class="judgment-months-scroll">
        <table class="judgment-months-table import-months-table">
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(v,k)=>`<th scope="col">${k+1}</th>`).join("")}</tr></thead>
          <tbody>${l}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u5DF2\u532F\u5165 PostgreSQL\uFF1B\u7070\u8272\uFF1A\u6709\u65B0\u6A94\u6216\u9060\u7AEF\u65B0\u7248\u672C\u5F85\u532F\u5165\uFF1B\u7D05\u8272\uFF1A\u5C1A\u672A\u532F\u5165\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u672C\u6A5F\u6A94\u6848\u8207\u5DF2\u532F\u5165\u6A94\u6848\u3002</p>
    </div>
  </section>`}function wl(e){let t=e.index_runtime||{};if(!t.available)return`<section class="report-card processing-card index-runtime-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("cloud",14)}Ollama \u9023\u7DDA\u6E2C\u8A66</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C Qdrant \u7248\u672C\u5EFA\u7F6E\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u6E2C\u8A66\u7684\u4E3B\u6A5F\u3001\u6A21\u578B\u8207\u9078\u7528\u7D50\u679C\u3002</div>
    </section>`;let s=!!t.coverage_only,a=t.embedding||{},r=Array.isArray(a.hosts)?a.hosts:[],i=a.selected||{},o=a.active||{},l=t.current||{},d=t.summary||{},p=i.url||"",v=o.url||"",k=r.map(h=>hl(h,p)).join(""),$=t.run_status==="running"?"\u76EE\u524D\u8655\u7406":"\u6700\u5F8C\u8655\u7406",b=l.jid?`<div class="index-current-row">
        <span class="badge badge-info">${m("activity",11)}${$}</span>
        <strong class="mono">${n(vl(l.month))}</strong>
        <span class="mono">${n(l.archive||"\u2014")}</span>
        <span class="mono">${n(l.jid||"\u2014")}</span>
        <span class="index-current-copy">${n([l.court,l.title].filter(Boolean).join(" \xB7 ")||"\u2014")}</span>
        <span class="faint">\u6279\u6B21 ${c(l.batch_size)} \u7B46</span>
      </div>`:"";return`<section class="report-card processing-card index-runtime-card"${s?" hidden":""}>
    <div class="side-card-head">
      <span class="side-card-title">${m("cloud",14)}Ollama \u9023\u7DDA\u6E2C\u8A66</span>
      ${ze(a.status||"idle")}
    </div>
    ${t.error?`<div class="processing-update-notice index-runtime-error">${m("alert",13)}<span>${n(t.error)}</span></div>`:""}
    <div class="index-selected-host">
      <span class="faint">\u6700\u5F8C\u9078\u7528</span>
      <strong class="mono">${n(i.url||"\u2014")}</strong>
      <span>${n(i.model||a.model||"\u2014")}</span>
      <span class="mono">port ${n(i.port??"\u2014")}</span>
      ${v&&v!==p?`<span class="badge badge-warn">\u76EE\u524D\u4F7F\u7528 ${n(v)}</span>`:""}
      ${o.using_fallback?'<span class="badge badge-warn">\u5DF2\u5207\u63DB\u5099\u63F4</span>':""}
    </div>
    <div class="index-host-list">${k||'<div class="processing-workflow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u4E3B\u6A5F\u6E2C\u8A66\u7D50\u679C\u3002</div>'}</div>
    ${a.tested_at?`<div class="index-runtime-foot">\u6E2C\u8A66\u6642\u9593 ${n($e(a.tested_at))}</div>`:""}
  </section>
  <section class="report-card processing-card index-files-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("table",14)}\u7D22\u5F15\u6A94\u6848\u6642\u9593\u8868</span>
      <span class="badge badge-neutral">${c(d.indexed)} / ${c(d.total)} \u7B46</span>
    </div>
    <div class="index-runtime-summary">
      <span>\u7248\u672C <strong class="mono">v${n(t.version_id??"\u2014")}</strong></span>
      <span>Collection <code>${n(t.collection||"\u2014")}</code></span>
      <span>\u6A21\u5F0F <strong>${n(t.build_mode||"\u2014")}</strong></span>
      ${s?"":`<span>\u91CD\u7528 <strong class="mono">${c(d.reused)}</strong></span>
            <span>\u65B0 embedding <strong class="mono">${c(d.embedded)}</strong></span>`}
    </div>
    ${b}
    ${$l(t)}
    ${s?'<p class="judgment-months-hint index-coverage-note">\u76EE\u524D\u986F\u793A active collection \u7684\u6708\u4EFD\u7D22\u5F15\u8986\u84CB\uFF1B\u57F7\u884C Qdrant \u7248\u672C\u5EFA\u7F6E\u5F8C\u6703\u986F\u793A\u672C\u6B21 Ollama \u6E2C\u8A66\u8207\u5373\u6642\u9032\u5EA6\u3002</p>':""}
  </section>`}function _l(e={}){let{storage:t,loading:s,error:a}=e;if(a)return`<section class="report-card processing-card index-storage-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
        <button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-index-storage">${m("refresh",12)}<span>\u91CD\u65B0\u6574\u7406</span></button>
      </div>
      <div class="processing-workflow-empty">${n(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card index-storage-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
        <span class="badge badge-neutral">${s?"\u8B80\u53D6\u4E2D":"\u5C1A\u7121"}</span>
      </div>
      <div class="processing-workflow-empty">${s?"\u6B63\u5728\u53D6\u5F97 Docker \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u2026":"\u5207\u63DB\u5230\u6B64\u6D41\u7A0B\u5F8C\u6703\u8B80\u53D6 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002"}</div>
    </section>`;let r=t.qdrant_storage||{},o=(Array.isArray(t.databases)?t.databases:[]).find(v=>v.id==="qdrant")||{},l=r.volume_bytes??o.volume_bytes??null,d=r.points_count??o.points_count,p=r.segments_count??o.segments_count;return`<section class="report-card processing-card index-storage-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
      <button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-index-storage">${m("refresh",12)}<span>\u91CD\u65B0\u6574\u7406</span></button>
    </div>
    <div class="index-storage-grid">
      <span>Docker \u4E3B\u6A5F</span><strong>${n(r.host||"\u2014")} <span class="faint">(${n(r.docker_context||"default")})</span></strong>
      <span>Container</span><strong class="mono">${n(r.container||"judgment-qdrant")} \xB7 ${n(r.container_state||"unknown")}</strong>
      <span>Image</span><strong class="mono">${n(r.image||"\u2014")}</strong>
      <span>\u5BB9\u5668\u5167\u8DEF\u5F91</span><strong class="mono">${n(r.container_path||"\u2014")}</strong>
      <span>Docker volume</span><strong class="mono">${n(r.volume_name||"\u2014")}</strong>
      <span>Volume \u5BB9\u91CF</span><strong class="mono">${be(l)}${r.volume_size?` \xB7 ${n(r.volume_size)}`:""}</strong>
      <span>Volume \u4F86\u6E90\u8DEF\u5F91</span><strong class="mono index-storage-path">${n(r.host_path||"\u2014")}</strong>
      <span>Collection</span><strong class="mono">${n(r.collection||o.collection||"\u2014")}</strong>
      <span>Alias</span><strong class="mono">${n(r.alias||"\u2014")}</strong>
      <span>Points\uFF0FSegments</span><strong class="mono">${c(d)} / ${c(p)}</strong>
    </div>
    <div class="index-runtime-foot">\u8CC7\u6599\u6642\u9593 ${n($e(t.checked_at))}</div>
  </section>`}function Ra({badge:e="",lead:t="",rows:s=[],note:a=""}){return`<section class="report-card processing-card parquet-help-card workflow-help-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("info",14)}\u529F\u80FD\u8AAA\u660E</span>
      ${e?`<span class="badge badge-neutral">${n(e)}</span>`:""}
    </div>
    <div class="parquet-help-body">
      <p class="parquet-help-lead">${t}</p>
      <div class="parquet-help-grid">${s.map(([r,i])=>`<span>${n(r)}</span><strong>${i}</strong>`).join("")}</div>
      ${a?`<p class="parquet-help-note">${a}</p>`:""}
    </div>
  </section>`}function kl(){return Ra({badge:"\u552F\u8B80\u532F\u51FA",lead:"\u5C07 PostgreSQL \u76EE\u524D\u6709\u6548\u7684\u5224\u6C7A\uFF08<code>judgment_documents.is_current = true</code>\uFF09\u532F\u51FA\u6210\u7368\u7ACB\u7684 Parquet \u5FEB\u7167\uFF0C\u4F9B\u96E2\u7DDA\u5206\u6790\u3001\u8CC7\u6599\u4EA4\u63DB\u6216\u4FDD\u5B58\u3002",rows:[["\u4F86\u6E90","PostgreSQL <code>judgment_documents</code>\uFF0C\u53EA\u542B\u76EE\u524D\u6709\u6548\u4E14\u5DF2\u547D\u4E2D\u91D1\u878D\u6CD5\u898F\u6E05\u55AE\u7684\u5224\u6C7A\u3002"],["\u8F38\u51FA",'<span class="mono">JUDGMENT_DATA_DIR/parquet/judgments/YYYYMMDD/HHMMSS-xxxxxxxx/judgments.parquet</span>'],["\u9644\u5E36\u6A94",'<span class="mono">\u540C\u76EE\u9304 manifest.json\uFF08\u7B46\u6578\u3001\u6A94\u6848\u5927\u5C0F\u3001\u6B04\u4F4D\u3001\u7522\u751F\u6642\u9593\uFF09</span>'],["\u5167\u5BB9","\u6848\u865F\u3001\u6CD5\u9662\u3001\u6848\u7531\u3001\u5168\u6587\u3001\u547D\u4E2D\u6CD5\u898F\u3001\u5F15\u7528\u3001\u4F86\u6E90\u58D3\u7E2E\u6A94\u8207\u6642\u9593\u6B04\u4F4D\uFF1B<code>citations</code> \u4EE5 JSON \u5B57\u4E32\u4FDD\u5B58\u3002"],["\u8207\u539F\u59CB Parquet","\u8CC7\u6599\u9801\u8207 <code>source=parquet</code> \u4F7F\u7528 <code>parquet/raw_judgments/.../raw.parquet</code>\uFF1B\u672C\u6D41\u7A0B\u7684 <code>parquet/judgments/...</code> \u662F\u53E6\u4E00\u500B\u6B63\u898F\u5316\u5FEB\u7167\u3002"],["\u4E0D\u6703","\u4E0D\u5BEB\u56DE PostgreSQL\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u820A\u5FEB\u7167\uFF1B\u53EA\u532F\u51FA current \u8CC7\u6599\uFF0C\u4E0D\u542B\u6B77\u53F2\u7248\u672C\u3002"],["\u4E2D\u65B7","\u6BCF\u6B21\u57F7\u884C\u5EFA\u7ACB\u65B0\u7684\u5B8C\u6574\u5FEB\u7167\uFF1B\u4E2D\u65B7\u5F8C\u91CD\u65B0\u57F7\u884C\u4E0D\u6703\u7E8C\u5BEB\u540C\u4E00\u500B Parquet \u6A94\u3002"]],note:"\u9069\u5408 DuckDB\u3001pandas\u3001Spark \u7B49\u96E2\u7DDA\u5206\u6790\uFF0C\u6216\u9700\u8981\u56FA\u5B9A\u6642\u9593\u9EDE\u7684\u53EF\u91CD\u73FE\u8CC7\u6599\u5FEB\u7167\u3002\u65E5\u5E38 RAG \u67E5\u8A62\u8207\u8CC7\u6599\u9801\u700F\u89BD\u4E0D\u9700\u8981\u57F7\u884C\u6B64\u6D41\u7A0B\u3002"})}function Sl(){return Ra({badge:"PostgreSQL \u56DE\u586B",lead:"\u5C07\u5224\u6C7A\u7684 <code>court</code> \u8F49\u6210\u6A19\u6E96\u6CD5\u9662\u540D\u7A31\u4E26\u5BEB\u5165 <code>court_normalized</code>\uFF1B\u539F\u59CB <code>court</code> \u6703\u4FDD\u7559\u4F9B\u8FFD\u6EAF\u3002",rows:[["\u8655\u7406\u7BC4\u570D","\u9810\u8A2D\u53EA\u8655\u7406 <code>court_normalized</code> \u70BA\u7A7A\u7684\u8CC7\u6599\uFF1B\u5DF2\u6B63\u898F\u5316\u8CC7\u6599\u6703\u8DF3\u904E\uFF0C\u53EF\u7528 <code>--all</code> \u91CD\u65B0\u8A08\u7B97\u5168\u90E8\u3002"],["\u89E3\u6790\u9806\u5E8F","\u539F\u59CB\u6CD5\u9662\u503C\u958B\u982D\u7B26\u5408\u6A19\u6E96\u540D\u7A31 \u2192 \u5224\u6C7A\u5168\u6587\u524D 8,000 \u5B57\u6700\u65E9\u51FA\u73FE\u7684\u6CD5\u9662 \u2192 \u539F\u59CB\u6CD5\u9662\u503C\u4EFB\u610F\u4F4D\u7F6E\u7684\u6A19\u6E96\u540D\u7A31 \u2192 JID \u5B98\u65B9\u6CD5\u9662\u4EE3\u78BC\u3002"],["\u8F38\u51FA","\u5BEB\u5165 <code>judgment_documents.court_normalized</code>\uFF1B\u4E0D\u4FEE\u6539\u539F\u59CB <code>court</code>\u3001\u5168\u6587\u6216\u5176\u4ED6\u5224\u6C7A\u6B04\u4F4D\u3002"],["\u672A\u89E3\u6790","\u7121\u6CD5\u5224\u65B7\u6642\u4FDD\u7559\u7A7A\u503C\uFF0C\u4E0D\u731C\u6E2C\uFF1B\u6458\u8981\u6703\u5217\u51FA\u672A\u89E3\u6790\u7B46\u6578\u8207\u5E38\u898B\u6A23\u672C\u3002"],["\u5F71\u97FF","\u8CC7\u6599\u9801\u7684\u6CD5\u9662\u4E0B\u62C9\u3001\u7CBE\u78BA\u7BE9\u9078\u3001\u6392\u5E8F\u3001\u7D50\u679C\u6B04\u4F4D\u8207\u5224\u6C7A\u539F\u6587\u4F7F\u7528\u6B63\u898F\u5316\u540D\u7A31\uFF1BAPI \u4ECD\u56DE\u50B3 <code>court_raw</code>\u3002"],["\u4E0D\u6703","\u4E0D\u91CD\u65B0\u532F\u5165\u5224\u6C7A\u3001\u4E0D\u6539\u5168\u6587\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u8CC7\u6599\u3002"],["\u91CD\u8DD1","\u9810\u8A2D\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u898F\u5247\u66F4\u65B0\u5F8C\u53EF\u7528 <code>--all</code> \u91CD\u7B97\uFF0C\u6216\u5148\u7528 <code>--dry-run</code> \u7D71\u8A08\u3002"]],note:"\u9069\u5408\u5728\u5224\u6C7A\u532F\u5165\u5F8C\u3001\u6CD5\u9662\u540D\u7A31\u898F\u5247\u66F4\u65B0\u5F8C\uFF0C\u6216\u8CC7\u6599\u9801\u6CD5\u9662\u9078\u9805\u51FA\u73FE\u7F3A\u6F0F\u6642\u57F7\u884C\u3002\u7D50\u679C\u4E5F\u6703\u5BEB\u5165\u6548\u80FD\u7D00\u9304\u3002"})}function xl(){return Ra({badge:"\u689D\u6587\u6B77\u53F2\u5EFA\u6A94",lead:"\u70BA\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u5EFA\u7ACB <code>law_article_versions</code> \u6B77\u53F2\u689D\u6587\u5FEB\u7167\u8207 <code>law_article_change_events</code> \u8B8A\u66F4\u7D00\u9304\uFF0C\u8B93\u8CC7\u6599\u9801\u80FD\u5207\u63DB\u6B77\u53F2\u7248\u672C\u4E26\u67E5\u770B\u689D\u6587\u5DEE\u7570\u3002",rows:[["\u4F86\u6E90","PostgreSQL \u6CD5\u898F\u7248\u672C\uFF0C\u4EE5\u53CA <code>LAW_DATA_DIR/raw_parquet</code> \u5167\u5C0D\u61C9\u7684\u539F\u59CB\u6CD5\u898F Parquet \u5FEB\u7167\u3002"],["\u5339\u914D\u65B9\u5F0F","\u4EE5 raw Parquet manifest \u7684 <code>zip_sha256</code>\uFF0F<code>raw_json_sha256</code> \u5C0D\u61C9\u6CD5\u898F\u7248\u672C\uFF0C\u4E0D\u731C\u6E2C\u5167\u5BB9\u3002"],["\u7522\u751F\u5167\u5BB9","<code>article_key</code>\uFF08\u689D\u6587\u985E\u578B\uFF0B\u689D\u865F\uFF09\u3001<code>content_hash</code>\u3001\u689D\u6587\u5168\u6587\u8207\u751F\u6548\u65E5\uFF1B\u8207\u524D\u4E00\u7248\u672C\u6BD4\u8F03\u5F8C\u8A18\u9304 <code>added</code>\uFF0F<code>modified</code>\uFF0F<code>removed</code>\u3002"],["\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB","\u5206\u9801\u4E0A\u65B9\u7684\u552F\u8B80\u6AA2\u67E5\u6703\u8B80\u53D6 <code>law_article_versions</code> \u8207\u539F\u59CB Parquet\uFF0C\u5224\u65B7\u7248\u672C\u662F\u5426\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\uFF1B\u6AA2\u67E5\u672C\u8EAB\u4E0D\u6703\u4FEE\u6539\u8CC7\u6599\u5EAB\u3002"],["\u53EF\u5EFA\u7ACB","\u627E\u5230\u5C0D\u61C9\u539F\u59CB Parquet \u7684\u7248\u672C\uFF0C\u53EF\u76F4\u63A5\u57F7\u884C\u6B64\u6D41\u7A0B\u5EFA\u7ACB\u689D\u6587\u6B77\u53F2\u3002"],["\u7F3A\u539F\u59CB\u6A94","\u627E\u4E0D\u5230\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u6A19\u793A\u7121\u6CD5\u5EFA\u7ACB\uFF0C\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD\uFF1B\u6B64\u6D41\u7A0B\u6703\u8DF3\u904E\u4E26\u5217\u5728 <code>missing_versions</code>\u3002"],["\u6AA2\u67E5\u7D50\u679C","\u5E74\u4EFD\xD7\u6708\u4EFD\u8868\u986F\u793A\u5DF2\u5EFA\u7ACB\uFF0F\u672A\u5EFA\u7ACB\uFF0F\u90E8\u5206\u5EFA\u7ACB\uFF1B\u4E0B\u65B9\u5217\u51FA\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u7248\u672C\u65E5\u671F\u8207\u53EF\u5EFA\u7ACB\u72C0\u614B\u3002\u76EE\u524D\u72C0\u614B\u4EE5\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u5361\u7247\u5373\u6642\u986F\u793A\u3002"],["\u8DF3\u904E\u689D\u4EF6","\u5DF2\u6709\u689D\u6587\u5FEB\u7167\u7684\u7248\u672C\u6703\u8DF3\u904E\uFF1B\u627E\u4E0D\u5230\u53EF\u8B80\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u5217\u5165 <code>missing_versions</code>\uFF0C\u4E0D\u5EFA\u7ACB\u865B\u69CB\u689D\u6587\u3002"],["\u4E0D\u6703","\u4E0D\u4E0B\u8F09\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u4E0D\u89E3\u6790\u65B0 ZIP\u3001\u4E0D\u4FEE\u6539 <code>law_documents</code> \u6216\u76EE\u524D\u7248\u672C\u3001\u4E0D\u66F4\u65B0 Qdrant\uFF0FIndexedDB\u3002"],["\u8F38\u51FA\u6458\u8981","\u7248\u672C\u6578\u3001\u8DF3\u904E\u7248\u672C\u6578\u3001\u7F3A\u5C11\u5FEB\u7167\u7248\u672C\u3001\u5BEB\u5165\u689D\u6587\u6578\u8207\u689D\u6587\u8B8A\u66F4\u4E8B\u4EF6\u6578\u3002"],["\u91CD\u8DD1","\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u5DF2\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u4E0D\u6703\u91CD\u8907\u63D2\u5165\u3002"]],note:"\u9069\u5408\u5F9E\u820A\u7248 schema \u5347\u7D1A\u3001\u65E2\u6709\u6CD5\u898F\u7248\u672C\u7F3A\u5C11\u6B77\u53F2\u689D\u6587\uFF0C\u6216\u8CC7\u6599\u9801\u6B77\u53F2\u689D\u6587\u7248\u672C\u8207\u8B8A\u66F4\u7D00\u9304\u4E0D\u5B8C\u6574\u6642\u57F7\u884C\u3002\u57F7\u884C\u524D\u53EF\u5148\u7528\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u78BA\u8A8D\u54EA\u4E9B\u7248\u672C\u53EF\u5EFA\u7ACB\u3001\u54EA\u4E9B\u7F3A\u539F\u59CB\u6A94\u3002"})}function ql(e={}){let t=e.courtCheck,s=!!e.courtCheckLoading,a=e.courtCheckError,r=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-court-check"${s?" disabled":""}>${m("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31"}</span></button>`;if(a)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${r}
      </div>
      <div class="processing-workflow-empty">${n(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${r}
      </div>
      <div class="processing-workflow-empty">${s?'<span class="spinner" aria-hidden="true"></span> \u6B63\u5728\u6AA2\u67E5\u5404\u6708\u4EFD\u6CD5\u9662\u540D\u7A31\u2026':"\u9032\u5165\u6B64\u5206\u9801\u5F8C\u6703\u81EA\u52D5\u6AA2\u67E5\uFF1B\u4E5F\u53EF\u6309\u300C\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u300D\u91CD\u65B0\u8B80\u53D6\u3002"}</div>
    </section>`;let i=Array.isArray(t.months)?t.months:[],o=t.summary||{},l=t.totals||{};if(!i.length)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${r}
      </div>
      <div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u6AA2\u67E5\u7684\u5224\u6C7A\u8CC7\u6599\u3002</div>
    </section>`;let d={green:"\u5DF2\u6AA2\u67E5",red:"\u672A\u6AA2\u67E5",gray:"\u9700\u6B63\u898F\u5316"},p=new Map(i.map($=>[String($.month),$])),k=[...new Set(i.map($=>$.year))].sort(($,b)=>b-$).map($=>{let b=Array.from({length:12},(h,w)=>{let A=w+1,B=`${$}${String(A).padStart(2,"0")}`,Q=p.get(B);if(!Q)return`<td class="judgment-month is-empty"><span>${A}</span></td>`;let D=d[Q.status]?Q.status:"red",H=[`${$}-${String(A).padStart(2,"0")}`,d[D],`\u7E3D ${c(Q.total)} \u7B46`,`\u5DF2\u6AA2\u67E5 ${c(Q.checked)} \u7B46`,`\u672A\u6AA2\u67E5 ${c(Q.unchecked)} \u7B46`,Q.invalid?`\u7121\u6548\u503C ${c(Q.invalid)} \u7B46`:"",`\u6709\u6548 ${rt(Q.percent)}`].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month court-check-month is-${D}" title="${n(H)}"><span>${A}</span></td>`}).join("");return`<tr><th scope="row">${n($)}</th>${b}</tr>`}).join("");return`<section class="report-card processing-card court-check-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
      ${r}
    </div>
    <div class="judgment-months">
      <div class="judgment-months-meta">
        <span class="badge badge-ok">\u5DF2\u6AA2\u67E5 ${c(o.green||0)}</span>
        <span class="badge badge-danger">\u672A\u6AA2\u67E5 ${c(o.red||0)}</span>
        <span class="badge badge-neutral">\u9700\u6B63\u898F\u5316 ${c(o.gray||0)}</span>
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},($,b)=>`<th scope="col">${b+1}</th>`).join("")}</tr></thead>
          <tbody>${k}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u5168\u90E8\u5DF2\u6B63\u898F\u5316\uFF1B\u7D05\u8272\uFF1A\u5B8C\u5168\u672A\u6AA2\u67E5\uFF1B\u7070\u8272\uFF1A\u90E8\u5206\u672A\u6B63\u898F\u5316\u6216\u6709\u7121\u6548\u503C\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7B46\u6578\u8207\u6709\u6548\u6BD4\u4F8B\u3002</p>
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${n($e(t.checked_at))} \xB7 \u6A19\u6E96\u6CD5\u9662\u540D\u7A31 ${c(t.canonical_count)} \u500B</div>
    </div>
  </section>`}function Al(e={}){let t=e.lawVersionCheck,s=!!e.lawVersionCheckLoading,a=e.lawVersionCheckError,r=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-law-version-check"${s?" disabled":""}>${m("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB"}</span></button>`;if(a)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${r}
      </div>
      <div class="processing-workflow-empty">${n(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${r}
      </div>
      <div class="processing-workflow-empty">${s?'<span class="spinner" aria-hidden="true"></span> \u6B63\u5728\u6AA2\u67E5\u7248\u672C\u8207\u6B77\u53F2\u689D\u6587\u2026':"\u9032\u5165\u6B64\u5206\u9801\u5F8C\u6703\u81EA\u52D5\u6AA2\u67E5\uFF1B\u4E5F\u53EF\u6309\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u91CD\u65B0\u8B80\u53D6\u3002"}</div>
    </section>`;let i=Array.isArray(t.months)?t.months:[],o=t.summary||{},l=t.totals||{};if(!i.length)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${r}
      </div>
      <div class="processing-workflow-empty">\u8CC7\u6599\u5EAB\u76EE\u524D\u6C92\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u8CC7\u6599\u3002</div>
    </section>`;let d={green:"\u5DF2\u5EFA\u7ACB",red:"\u672A\u5EFA\u7ACB",gray:"\u90E8\u5206\u5EFA\u7ACB"},p=new Map(i.map(W=>[String(W.month),W])),k=[...new Set(i.map(W=>W.year))].sort((W,E)=>E-W).map(W=>{let E=Array.from({length:12},(S,C)=>{let ee=C+1,re=`${W}${String(ee).padStart(2,"0")}`,T=p.get(re);if(!T)return`<td class="judgment-month is-empty"><span>${ee}</span></td>`;let z=d[T.status]?T.status:"red",Y=[`${W}-${String(ee).padStart(2,"0")}`,d[z],`\u7248\u672C ${c(T.version_count)}\uFF08\u6CD5\u898F ${c(T.law_versions)}\uFF0F\u547D\u4EE4 ${c(T.order_versions)}\uFF09`,`\u5DF2\u5EFA\u7ACB ${c(T.backfilled_count)}`,`\u672A\u5EFA\u7ACB ${c(T.missing_count)}`,`\u9700\u5EFA\u7ACB ${c(T.needs_backfill_count)}\uFF08\u53EF\u5EFA\u7ACB ${c(T.backfillable_count)}\uFF0F\u7F3A\u539F\u59CB\u6A94 ${c(T.blocked_count)}\uFF09`,`\u689D\u6587\u5217 ${c(T.article_rows)} / \u9810\u671F ${c(T.article_count)}`,T.current?"\u76EE\u524D\u7248\u672C":"",T.versions?.length?`\u7248\u672C ${T.versions.map(ue=>`#${ue.version_id}`).join("\u3001")}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month law-version-month is-${z}${T.current?" is-current":""}" title="${n(Y)}"><span>${ee}</span></td>`}).join("");return`<tr><th scope="row">${n(W)}</th>${E}</tr>`}).join(""),$={law:"\u6CD5\u898F",order:"\u547D\u4EE4"},b=i.flatMap(W=>(W.versions||[]).filter(E=>E.needs_backfill).map(E=>({...E,month:W.month}))).sort((W,E)=>E.version_id-W.version_id),h=b.slice(0,20),w=h.map(W=>{let E=W.backfillable?"badge-info":W.blocked?"badge-danger":"badge-neutral",S=W.backfillable?"\u53EF\u5EFA\u7ACB":W.blocked?"\u7F3A\u539F\u59CB\u6A94":"\u5F85\u6AA2\u67E5";return`<div class="law-backfill-needed-row">
        <strong class="mono">#${W.version_id}</strong>
        <span class="badge ${E}">${S}</span>
        <span>${n($[W.source_type]||W.source_type||"\u2014")}</span>
        <span class="mono">${n(W.update_date||W.month||"\u2014")}</span>
        <span class="law-backfill-needed-reason">${n(W.reason||"\u2014")}</span>
      </div>`}).join(""),A=b.length?`<div class="law-backfill-needed">
        <div class="law-backfill-needed-head">\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C <span class="badge badge-warn">${c(b.length)}</span></div>
        <div class="law-backfill-needed-list">${w}</div>
        ${b.length>h.length?`<div class="law-backfill-needed-more">\u53E6\u6709 ${c(b.length-h.length)} \u500B\u7248\u672C\u672A\u5217\u51FA</div>`:""}
      </div>`:'<div class="law-backfill-needed is-clear">\u76EE\u524D\u6C92\u6709\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3002</div>',B=Number(l.needs_backfill_versions)||0,Q=Number(l.backfillable_versions)||0,D=Number(l.blocked_versions)||0,H=Number(l.backfilled_versions)||0,te=Number(l.versions)||0,de=B<=0?"ok":D>0?"danger":"warn",ke=B<=0?"\u4E0D\u9700\u8981\u5EFA\u7ACB":"\u9700\u8981\u5EFA\u7ACB",we=B>0?`\u9700\u8981\u5EFA\u7ACB ${c(B)} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF1A\u53EF\u5EFA\u7ACB ${c(Q)}\u3001\u7F3A\u539F\u59CB\u6A94 ${c(D)}\u3002\u5DF2\u6709\u6B77\u53F2\u689D\u6587 ${c(H)} \u500B\u7248\u672C${D>0?"\uFF1B\u7F3A\u539F\u59CB\u6A94\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD":""}\u3002`:`\u76EE\u524D ${c(te)} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`;return`<section class="report-card processing-card law-version-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
      ${r}
    </div>
    <div class="law-version-check-status is-${de}" role="status" aria-live="polite">
      <span class="badge badge-${de}">${ke}</span>
      <span>${n(we)}</span>
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(W,E)=>`<th scope="col">${E+1}</th>`).join("")}</tr></thead>
          <tbody>${k}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u8A72\u6708\u4EFD\u6240\u6709\u7248\u672C\u90FD\u6709\u6B77\u53F2\u689D\u6587\uFF1B\u7D05\u8272\uFF1A\u5B8C\u5168\u672A\u5EFA\u7ACB\uFF1B\u7070\u8272\uFF1A\u90E8\u5206\u7248\u672C\u5DF2\u5EFA\u7ACB\uFF1B\u5916\u6846\uFF1A\u76EE\u524D\u7248\u672C\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u7248\u672C\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u6578\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u6578\u8207\u689D\u6587\u5217\u3002</p>
      ${A}
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${n($e(t.checked_at))}</div>
    </div>
  </section>`}function yr(){return`<div class="processing-ollama-loading">
    <span class="spinner" aria-hidden="true"></span>
    <span>\u6B63\u5728\u6AA2\u67E5 Ollama \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span>
  </div>`}function jl(e,t,s){let a=Array.isArray(e?.hosts)?e.hosts:[];if(s&&!a.length)return`${ye({tone:"danger",title:"Ollama \u4E3B\u6A5F\u8B80\u53D6\u5931\u6557",text:n(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
    <div class="processing-ollama-empty">
      <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh-ollama">
        ${m("refresh",13)}<span>\u91CD\u65B0\u6AA2\u67E5</span>
      </button>
    </div>`;if(!a.length)return t?yr():'<div class="processing-ollama-empty">\u5C1A\u672A\u8A2D\u5B9A Ollama \u4E3B\u6A5F\uFF1B\u8ACB\u5230\u300C\u7CFB\u7D71\u72C0\u614B \u2192 Model Provider\u300D\u65B0\u589E\u4E26\u9023\u63A5\u6A21\u578B\u3002</div>';let r=a.map((o,l)=>{let d=o.status==="operational",p=Array.isArray(o.models)?o.models:[],v=p.length?p.map($=>`<span class="processing-ollama-model ${d?"is-online":"is-offline"}">${n($.name||"")}</span>`).join(""):'<span class="processing-ollama-model is-offline">\u6C92\u6709\u53EF\u7528\u6A21\u578B</span>',k=[o.embedding_model?`<span class="processing-ollama-role ${d?"is-online":"is-offline"}">\u5D4C\u5165 \xB7 ${n(o.embedding_model)}</span>`:'<span class="processing-ollama-role is-offline">\u672A\u8A2D\u5B9A\u5D4C\u5165\u6A21\u578B</span>',o.chat_model?`<span class="processing-ollama-role is-offline">\u804A\u5929 \xB7 ${n(o.chat_model)}</span>`:""].filter(Boolean).join("");return`<article class="processing-ollama-host ${d?"is-online":"is-offline"}" data-ollama-host data-host-id="${Number(o.id)}">
        <span class="processing-ollama-handle" aria-hidden="true">${m("grid",14)}</span>
        <span class="processing-ollama-rank">${l+1}</span>
        <div class="processing-ollama-main">
          <div class="processing-ollama-title">
            <strong>${n(o.name||o.base_url||`\u4E3B\u6A5F #${o.id}`)}</strong>
            <span class="processing-ollama-status">${d?"\u53EF\u7528":"\u7121\u6CD5\u9023\u7DDA"}</span>
          </div>
          <span class="processing-ollama-url mono">${n(o.base_url||"\u2014")}</span>
          <div class="processing-ollama-models">${v}</div>
          <div class="processing-ollama-meta">${k}${o.detail?`<span class="processing-ollama-detail">${n(o.detail)}</span>`:""}</div>
        </div>
        <div class="processing-ollama-order">
          <button class="btn btn-ghost btn-sm" type="button"
            data-processing-action="move-ollama-host" data-direction="up"
            data-host-id="${Number(o.id)}"
            title="\u4E0A\u79FB\u512A\u5148\u9806\u5E8F" aria-label="\u4E0A\u79FB ${n(o.name||o.base_url||`\u4E3B\u6A5F #${o.id}`)}" ${l===0?"disabled":""}>\u2191</button>
          <button class="btn btn-ghost btn-sm" type="button"
            data-processing-action="move-ollama-host" data-direction="down"
            data-host-id="${Number(o.id)}"
            title="\u4E0B\u79FB\u512A\u5148\u9806\u5E8F" aria-label="\u4E0B\u79FB ${n(o.name||o.base_url||`\u4E3B\u6A5F #${o.id}`)}" ${l===a.length-1?"disabled":""}>\u2193</button>
        </div>
      </article>`}).join(""),i=a.find(o=>Number(o.id)===Number(e?.active_host_id))?.name||a[0]?.name||a[0]?.base_url||"\u2014";return`<div class="processing-ollama-summary">
      <span>\u5171 ${c(a.length)} \u53F0\u4E3B\u6A5F</span>
      <span>\u7B2C\u4E00\u512A\u5148\uFF1A<strong>${n(i)}</strong></span>
      <span class="muted">${t?"\u91CD\u65B0\u6AA2\u67E5\u4E2D\u2026":"\u6BCF 30 \u79D2\u81EA\u52D5\u6AA2\u67E5"}</span>
    </div>
    <div class="processing-ollama-list" data-ollama-list>${r}</div>
    <p class="processing-ollama-hint">\u62D6\u79FB\u6216\u4F7F\u7528\u7BAD\u982D\u8ABF\u6574 embedding \u512A\u5148\u9806\u5E8F\uFF1B\u76EE\u524D\u4E3B\u6A5F\u7121\u6CD5\u4F7F\u7528\u6642\uFF0C\u6703\u4F9D\u5E8F\u81EA\u52D5\u6539\u7528\u4E0B\u4E00\u53F0\uFF08\u5404\u53F0\u9700\u5177\u5099\u76F8\u540C\u7684 embedding \u6A21\u578B\uFF09\uFF0C\u76F4\u5230\u6709\u4E3B\u6A5F\u56DE\u50B3\u5411\u91CF\u3002</p>`}function Ll(e,t={}){let s=e.active_run||null,a=s||e.last_run||null,r=!!s,i=!!e.can_run&&!r,o=e.id==="full_update",l=Array.isArray(e.command)?e.command.join(" "):"";return`<div class="processing-workflow-panel">
    ${ye({tone:"info",title:e.label,text:e.description||""})}
    ${e.update_available?`<div class="processing-update-notice" role="status">
            ${m("refresh",13)}
            <span>${n(e.update_status&&e.update_status.message||"\u7DDA\u4E0A\u5075\u6E2C\u5230\u65B0\u7248")}</span>
            <span class="badge badge-warn">\u66F4\u65B0</span>
          </div>`:""}
    ${e.id==="normalize_courts"?ql(t):""}
    ${e.id==="backfill_law_articles"?Al(t):""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m(fr[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
        <span class="badge badge-neutral badge-mono">${n(e.branch||"")}</span>
      </div>
      <div class="processing-workflow-command-grid">
        <span>\u7A0B\u5F0F</span><code>${n(e.program||"\u2014")}</code>
        <span>Shell\uFF0F\u5165\u53E3</span><code>${n(e.script||"\u2014")}</code>
        <span>\u5BE6\u969B\u547D\u4EE4</span><code class="processing-workflow-command">${n(l||"\u2014")}</code>
      </div>
      <div class="processing-workflow-actions">
        <button class="btn btn-primary btn-sm" type="button"
          data-processing-action="run-workflow"
          data-workflow-id="${n(e.id)}"
          ${i?"":"disabled"}>
          ${m("play",14)}<span>${r?"\u57F7\u884C\u4E2D":o?"\u57F7\u884C\u8CC7\u6599\u66F4\u65B0":"\u57F7\u884C\u6B64\u6D41\u7A0B"}</span>
        </button>
        ${["law_download","order_download","judgment_download"].includes(e.id)?`<button class="btn btn-secondary btn-sm" type="button"
                data-processing-action="check-updates"
                data-workflow-id="${n(e.id)}">
                ${m("refresh",14)}<span>\u6AA2\u67E5\u66F4\u65B0</span>
              </button>`:""}
        ${s?`<button class="btn btn-secondary btn-sm processing-stop" type="button"
                data-processing-action="stop">${m("x",14)}<span>\u505C\u6B62</span></button>`:""}
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
              </div>`:""}
      </div>
      ${Ta.has(e.id)?`<div class="processing-ollama-block">
              <div class="processing-ollama-head">
                <span class="side-card-title">${m("server",14)}Ollama \u4E3B\u6A5F\uFF0F\u6A21\u578B</span>
                <button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-ollama">
                  ${m("refresh",13)}<span>\u91CD\u65B0\u6AA2\u67E5</span>
                </button>
              </div>
              <div class="processing-ollama-subtitle">\u4F9D\u512A\u5148\u9806\u5E8F\u81EA\u52D5\u9078\u7528 embedding \u4E3B\u6A5F\uFF1B\u7B2C\u4E00\u53F0\u540C\u6642\u8A2D\u70BA\u76EE\u524D\u4E3B\u6A5F\uFF0C\u7121\u6CD5\u9023\u7DDA\u7684\u4E3B\u6A5F\u6703\u986F\u793A\u70BA\u7070\u8272\u3002</div>
              <div data-processing-ollama>${yr()}</div>
            </div>`:""}
      <div class="side-card-foot">
        ${o?"\u6703\u4F9D\u5E8F\u57F7\u884C\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u8207\u53EF\u9078\u7684 Qdrant \u7D22\u5F15\u3002":"\u57F7\u884C\u7D50\u679C\u6703\u5BEB\u5165\u5171\u7528\u8655\u7406\u72C0\u614B\u6A94\uFF0C\u53EF\u5F9E\u8655\u7406\u7E3D\u89BD\u67E5\u770B\u3002"}
      </div>
    </section>
    ${bl(e)}
    ${e.id==="judgment_parquet"?kl():""}
    ${e.id==="normalize_courts"?Sl():""}
    ${e.id==="backfill_law_articles"?xl():""}
    ${e.id==="judgment_import"?yl(e):""}
    ${e.id==="index_versions"?wl(e):""}
    ${e.id==="index_versions"?_l(t):""}
    ${e.id==="judgment_download"?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${m("calendar",14)}\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B</span>
              <button class="btn btn-ghost btn-sm" type="button" title="\u91CD\u65B0\u6383\u63CF raw_rar \u76EE\u9304\u8207\u6708\u4EFD\u72C0\u614B" data-processing-action="refresh-judgment-months">${m("refresh",13)}<span>\u91CD\u65B0\u6574\u7406</span></button>
            </div>
            <div data-judgment-months-slot>${Ca()}</div>
          </section>`:""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${ze(a?.status||"idle")}
      </div>
      ${rl(a)}
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("history",14)}\u57F7\u884C\u7D00\u9304</span>
        <span class="badge badge-neutral">\u6700\u8FD1 ${c((e.recent_runs||[]).length)} \u7B46</span>
      </div>
      ${ml(e.recent_runs)}
    </section>
    ${["law_download","order_download","judgment_download"].includes(e.id)?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${m("search",14)}\u7248\u672C\u6AA2\u67E5\u7D00\u9304</span>
              <span class="badge badge-neutral">\u6700\u8FD1 ${c((e.update_history||[]).length)} \u7B46</span>
            </div>
            ${gl(e)}
          </section>`:""}
  </div>`}function ur(e,t,s={}){if(t==="overview")return cr(e);let r=(Array.isArray(e.workflows)?e.workflows:[]).find(i=>i.id===t);return r?Ll(r,s):cr(e)}async function Ml(e){e.innerHTML=`<section class="page processing-page">
    <div class="page-header">
      <div>
        <div class="page-kicker">DATA PIPELINE</div>
        <h1 class="page-title">\u8CC7\u6599\u8655\u7406</h1>
        <p class="page-subtitle">\u5373\u6642\u8FFD\u8E64\u5224\u6C7A\u3001\u6CD5\u898F\u8207\u547D\u4EE4\u7684\u8655\u7406\u9032\u5EA6\uFF0C\u6AA2\u67E5\u672C\u6A5F\u672A\u8655\u7406\u58D3\u7E2E\u6A94\uFF0C\u4E26\u53EF\u63A5\u7E8C\u7DDA\u4E0A\u8CC7\u6599\u66F4\u65B0\u3002</p>
      </div>
      <div class="page-actions processing-actions">
        <label class="processing-index-toggle" title="\u52FE\u9078\u5F8C\uFF0C\u8CC7\u6599\u66F4\u65B0\u5B8C\u6210\u532F\u5165\u8207 Parquet \u6703\u63A5\u7E8C\u53EF\u4E2D\u65B7\u7E8C\u8DD1\u7684 Qdrant \u7D22\u5F15">
          <input type="checkbox" id="processing-index-toggle" />
          <span>\u5B8C\u6210\u5F8C\u63A5\u7E8C Qdrant \u7D22\u5F15</span>
        </label>
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh" id="processing-refresh">
          ${m("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
        <button class="btn btn-secondary btn-sm processing-stop" type="button" data-processing-action="stop" id="processing-stop" hidden>
          ${m("x",14)}<span>\u505C\u6B62\u66F4\u65B0</span>
        </button>
        <button class="btn btn-primary btn-sm" type="button" data-processing-action="update" id="processing-update">
          ${m("download",14)}<span data-update-label>\u8CC7\u6599\u66F4\u65B0</span>
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
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-workflows"),r=e.querySelector("#processing-update"),i=e.querySelector("#processing-stop"),o=e.querySelector("#processing-refresh"),l=e.querySelector("#processing-index-toggle"),d=document.createElement("div");d.className="processing-stage-tooltip",d.hidden=!0,t.appendChild(d);let p=!1,v=!1,k=!1,$=null,b="",h="",w="overview",A=null,B=!1,Q=null,D=null,H=!1,te=null,de=0,ke=null,we=!1,W=null,E=0,S=null,C=!1,ee=null,re=0,T=null,z=!1,Y=null,ue=0,ae=0,X=!1,ge=null,_e=!1,je="",se=null,ce=()=>({storage:D,loading:H,error:te,courtCheck:ke,courtCheckLoading:we,courtCheckError:W,lawVersionCheck:S,lawVersionCheckLoading:C,lawVersionCheckError:ee}),ve=()=>{if(w!=="judgment_download")return;let u=s.querySelector(".processing-workflow-panel");if(!u)return;u.querySelectorAll(".judgment-month.is-active").forEach(Ce=>{Ce.classList.remove("is-active"),Ce.removeAttribute("aria-current")});let g=u.querySelector("[data-judgment-progress]");if(!g)return;let _=A?.progress,G=!!($?.workflows||[]).find(Ce=>Ce.id==="judgment_download")?.active_run;if((!_||_.active===!1)&&!G){g.hidden=!0,g.classList.remove("is-indeterminate");return}if(g.hidden=!1,!_||_.active===!1){let Ce=g.querySelector("[data-judgment-progress-phase]");Ce&&(Ce.textContent="\u6E96\u5099\u4E2D");let St=g.querySelector("[data-judgment-progress-month]");St&&(St.textContent="\u2014");let ut=g.querySelector("[data-judgment-progress-filename]");ut&&(ut.textContent="\u7B49\u5F85\u4E0B\u8F09\u7A0B\u5E8F\u56DE\u5831\u9032\u5EA6\u2026",ut.title=""),g.classList.add("is-indeterminate");let Zt=g.querySelector("[data-judgment-progress-bar]");Zt&&(Zt.style.width="");let xs=g.querySelector("[data-judgment-progress-percent]");xs&&(xs.textContent="\u2014");let ds=g.querySelector("[data-judgment-progress-size]");ds&&(ds.textContent="\u2014");let es=g.querySelector("[data-judgment-progress-note]");es&&(es.textContent="\u5DF2\u555F\u52D5\uFF0C\u7B49\u5F85\u9032\u5EA6\u56DE\u5831");return}let ne={preparing:"\u6E96\u5099\u4E2D",scanning:"\u6383\u63CF\u4E2D",checking:"\u6AA2\u67E5\u4E2D",downloading:"\u4E0B\u8F09\u4E2D",saving:"\u5132\u5B58\u4E2D",finalizing:"\u6574\u7406\u4E2D"}[_.phase]||"\u8655\u7406\u4E2D",fe=g.querySelector("[data-judgment-progress-phase]");fe&&(fe.textContent=ne);let Ae=_.month||"",Ne=g.querySelector("[data-judgment-progress-month]");Ne&&(Ne.textContent=Ae||"\u2014");let Vt=_.filename||"",dt=g.querySelector("[data-judgment-progress-filename]");if(dt&&(dt.textContent=Vt||"\u2014",dt.title=Vt),Ae){let Ce=u.querySelector(`[data-judgment-month-key="${Ae}"]`);Ce&&(Ce.classList.add("is-active"),Ce.setAttribute("aria-current","true"))}let kt=Number(_.bytes_written),Wt=Number(_.total_bytes),cs=Number.isFinite(Wt)&&Wt>0,Xe=null,et=_.percent;et!=null&&et!==""&&Number.isFinite(Number(et))?Xe=Number(et):cs&&Number.isFinite(kt)&&(Xe=kt/Wt*100);let Kt=Xe===null;g.classList.toggle("is-indeterminate",Kt);let ks=g.querySelector("[data-judgment-progress-bar]");ks&&(ks.style.width=Kt?"":`${Math.min(100,Math.max(0,Xe)).toFixed(1)}%`);let Ss=g.querySelector("[data-judgment-progress-percent]");if(Ss){let Ce=Kt?null:Math.min(100,Math.max(0,Xe));Ss.textContent=Ce===null?"\u2014":`${Ce.toFixed(Ce>=10?0:1)}%`}let Yt=g.querySelector("[data-judgment-progress-size]");if(Yt){let Ce=Number.isFinite(kt)&&kt>0?be(kt):"\u2014";Yt.textContent=cs?`${Ce} / ${be(Wt)}`:Ce}let Xt=g.querySelector("[data-judgment-progress-note]");if(Xt){let Ce=[],St=Number(_.candidate_index),ut=Number(_.candidate_total);Number.isFinite(St)&&St>0&&Number.isFinite(ut)&&ut>0&&Ce.push(`\u7B2C ${c(St)} / ${c(ut)} \u500B\u6708`),_.fileset_id&&Ce.push(`fileset ${_.fileset_id}`),_.message&&_.phase!=="downloading"&&Ce.push(String(_.message)),Xt.textContent=Ce.join(" \xB7 ")}},Se=()=>{if(w!=="judgment_download")return;let u=s.querySelector("[data-judgment-months-slot]");if(u){let g=Array.isArray(A?.months)?A.months:[];Q&&!A?(u.innerHTML=ye({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:n(Q)}),delete u.dataset.judgmentMonthCount):A?u.dataset.judgmentMonthCount!==String(g.length)?(u.innerHTML=ul(A),u.dataset.judgmentMonthCount=String(g.length)):pl(u,A):(u.querySelector(".judgment-months-loading")||(u.innerHTML=Ca()),delete u.dataset.judgmentMonthCount)}ve()},Be=()=>{let u=Array.isArray(T?.hosts)?T.hosts:[];return JSON.stringify({loading:!u.length&&z,error:!u.length&&Y?Y.message||String(Y):"",active:T?.active_host_id??null,hosts:u.map(g=>({id:g.id,name:g.name,url:g.base_url,status:g.status,detail:g.detail,embedding:g.embedding_model,chat:g.chat_model,models:(g.models||[]).map(_=>_.name)}))})},De=()=>{let u=s.querySelector("[data-processing-ollama]");if(!u||ae)return;let g=Be();u.dataset.ollamaSignature!==g&&(u.dataset.ollamaSignature=g,u.innerHTML=jl(T,z,T?null:Y))},Pe=async({quiet:u=!1,button:g=null}={})=>{if(!(p||z)){z=!0,Y=null,T||De(),g&&pe(g,!0,"\u6AA2\u67E5\u4E2D\u2026");try{let _=await F.ollamaHosts();if(p)return;T=_}catch(_){if(p)return;Y=_,u||L(_.message||"\u7121\u6CD5\u6AA2\u67E5 Ollama \u4E3B\u6A5F\u3002","danger",6e3)}finally{p||(z=!1,ue=Date.now(),g&&pe(g,!1),De())}}},j=async u=>{if(_e)return;let g=(T?.hosts||[]).map(J=>Number(J.id)),_=u.map(J=>Number(J));if(!_.length||_.length!==g.length||_.every((J,ne)=>J===g[ne])){De();return}_e=!0;let M=new Map((T?.hosts||[]).map(J=>[Number(J.id),J])),G=_.map(J=>M.get(J)).filter(Boolean);if(T&&G.length===g.length){T={...T,hosts:G,active_host_id:_[0]};let J=s.querySelector("[data-processing-ollama]");J&&(J.dataset.ollamaSignature=""),De()}try{await F.reorderOllamaHosts(_),L("\u5DF2\u66F4\u65B0 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","ok",3500)}catch(J){L(J.message||"\u7121\u6CD5\u66F4\u65B0 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","danger",6e3),ue=0,await Pe({quiet:!0})}finally{_e=!1}},R=()=>{let u=s.querySelector("[data-processing-ollama]");u&&(u.dataset.ollamaSignature=""),De()},O=()=>{let u=ge;if(!u)return;if(s.querySelector(`[data-ollama-host][data-host-id="${u.hostId}"]`)?.classList.remove("is-dragging"),u.captureTarget?.hasPointerCapture?.(u.pointerId))try{u.captureTarget.releasePointerCapture(u.pointerId)}catch{}document.documentElement.classList.remove("processing-ollama-dragging"),window.removeEventListener("pointermove",U),window.removeEventListener("pointerup",oe),window.removeEventListener("pointercancel",V),ge=null,ae=0},U=u=>{let g=ge;if(!g||u.pointerId!==g.pointerId)return;if(!g.dragging){if(Math.hypot(u.clientX-g.startX,u.clientY-g.startY)<5)return;g.dragging=!0,ae=g.hostId,X=!1,s.querySelector(`[data-ollama-host][data-host-id="${g.hostId}"]`)?.classList.add("is-dragging"),document.documentElement.classList.add("processing-ollama-dragging")}u.preventDefault();let _=64;u.clientY<_?window.scrollBy(0,-12):u.clientY>window.innerHeight-_&&window.scrollBy(0,12);let M=s.querySelector("[data-ollama-list]"),G=document.elementFromPoint(u.clientX,u.clientY)?.closest?.("[data-ollama-host]");if(!M||!G||!M.contains(G))return;let J=M.querySelector(`[data-ollama-host][data-host-id="${g.hostId}"]`);if(!J||J===G)return;let ne=G.getBoundingClientRect(),fe=u.clientY>ne.top+ne.height/2;M.insertBefore(J,fe?G.nextSibling:G),X=!0},oe=u=>{let g=ge;if(!g||u.pointerId!==g.pointerId)return;let _=g.dragging,M=X,G=s.querySelector("[data-ollama-list]"),J=_&&G?[...G.querySelectorAll("[data-ollama-host]")].map(ne=>Number(ne.dataset.hostId)):[];O(),_&&M&&J.length&&j(J)},V=()=>{let u=!!ge?.dragging;O(),u&&R()},qe=u=>{if(u.button!==0||u.pointerType==="mouse"&&u.buttons!==1||_e||ge)return;let g=u.target.closest("[data-ollama-host]");if(!g||!s.contains(g)||u.target.closest("button")||u.pointerType==="touch"&&!u.target.closest(".processing-ollama-handle"))return;let _=Number(g.dataset.hostId)||0;if(_){u.preventDefault(),ae=_,ge={hostId:_,pointerId:u.pointerId,startX:u.clientX,startY:u.clientY,dragging:!1,captureTarget:g};try{g.setPointerCapture(u.pointerId)}catch{}window.addEventListener("pointermove",U,{passive:!1}),window.addEventListener("pointerup",oe),window.addEventListener("pointercancel",V)}},I=async({quiet:u=!1}={})=>{if(!B){B=!0,!A&&w==="judgment_download"&&Se();try{A=await F.judgmentDownloadStatus(),Q=null}catch(g){Q=g.message||"\u8B80\u53D6\u6708\u4EFD\u72C0\u614B\u5931\u6557\u3002",u||L(Q,"danger",7e3)}finally{B=!1,w==="judgment_download"&&Se()}}},me=async({quiet:u=!0,force:g=!1}={})=>{if(!H&&!(!g&&D&&Date.now()-de<3e4)){H=!0;try{D=await F.systemUsage(),te=null,de=Date.now()}catch(_){te=_.message||"\u7121\u6CD5\u53D6\u5F97 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002",u||L(te,"danger",7e3)}finally{H=!1}}},Me=async({quiet:u=!0,force:g=!1}={})=>{if(!we&&!(!g&&ke&&Date.now()-E<6e4)){we=!0;try{ke=await F.checkCourts(),W=null,E=Date.now()}catch(_){W=_.message||"\u7121\u6CD5\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u3002",u||L(W,"danger",7e3)}finally{we=!1}}},Ie=async({quiet:u=!0,force:g=!1,button:_=null}={})=>{if(!C&&!(!g&&S&&Date.now()-re<6e4)){C=!0,_&&pe(_,!0,"\u6AA2\u67E5\u4E2D\u2026");try{if(S=await F.checkLawVersions(),ee=null,re=Date.now(),!u){let M=S.totals||{},G=Number(M.needs_backfill_versions)||0,J=Number(M.backfillable_versions)||0,ne=Number(M.blocked_versions)||0;G>0?L(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u9700\u8981\u5EFA\u7ACB ${G} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF08\u53EF\u5EFA\u7ACB ${J}\u3001\u7F3A\u539F\u59CB\u6A94 ${ne}\uFF09\u3002`,ne>0?"danger":"warn",7e3):L(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D ${Number(M.versions)||0} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`,"ok",5e3)}}catch(M){ee=M.message||"\u7121\u6CD5\u6AA2\u67E5\u689D\u6587\u6B77\u53F2\u72C0\u614B\u3002",u||L(ee,"danger",7e3)}finally{C=!1,_&&pe(_,!1)}}},He=u=>Array.from(s.querySelectorAll("[data-stage-key]")).find(g=>g.dataset.stageKey===u)||null,it=()=>{je&&(je="",d.hidden=!0,s.querySelectorAll("[data-workflow-progress]").forEach(u=>{u.classList.remove("is-stage-hovering")}),s.querySelectorAll("[data-stage-key]").forEach(u=>{u.classList.remove("is-stage-hovered")}))},qt=u=>{let g=u.dataset.stageKey||"";if(!g)return;je=g;let _=u.closest("[data-workflow-progress]");s.querySelectorAll("[data-workflow-progress]").forEach(dt=>{dt.classList.toggle("is-stage-hovering",dt===_)}),s.querySelectorAll("[data-stage-key]").forEach(dt=>{dt.classList.toggle("is-stage-hovered",dt.dataset.stageKey===g)});let M=u.dataset.stageStatusKey||"idle",G=u.dataset.stageStatus||zt(M).label,J=u.dataset.stageColor||"var(--accent)";d.innerHTML=`<div class="processing-stage-tooltip-head">
      <span class="processing-stage-tooltip-swatch" style="background:${n(J)}"></span>
      <strong>${n(u.dataset.stageLabel||g)}</strong>
      ${ze(M,G)}
    </div>
    <div class="processing-stage-tooltip-meta">
      <span>\u968E\u6BB5\u9032\u5EA6 <strong>${n(u.dataset.stagePercent||"\u2014")}</strong></span>
      <span>\u6574\u9AD4\u5360\u6BD4 <strong>${n(u.dataset.stageContribution||"\u2014")}</strong></span>
      <span class="mono">${n(u.dataset.stageDuration||"\u2014")}</span>
    </div>
    <div class="processing-stage-tooltip-counts">${n(u.dataset.stageCounts||"\u2014")}</div>
    ${u.dataset.stageMessage?`<div class="processing-stage-tooltip-message">${n(u.dataset.stageMessage)}</div>`:""}`,d.hidden=!1;let ne=Math.min(300,Math.max(220,window.innerWidth-24));d.style.width=`${ne}px`;let fe=u.getBoundingClientRect(),Ae=Math.min(window.innerWidth-ne-12,Math.max(12,fe.left)),Ne=fe.top-d.offsetHeight-10,Vt=Ne>=12?Ne:Math.min(window.innerHeight-d.offsetHeight-12,fe.bottom+10);d.style.left=`${Ae}px`,d.style.top=`${Math.max(12,Vt)}px`},Ve=u=>{let g=u.target.closest("[data-stage-key]");!g||!s.contains(g)||g.contains(u.relatedTarget)||qt(g)},Qt=u=>{let g=u.target.closest("[data-stage-key]");if(!g||!s.contains(g)||g.contains(u.relatedTarget))return;let _=u.relatedTarget?.closest?.("[data-stage-key]");_&&_.dataset.stageKey===g.dataset.stageKey||it()},ct=u=>{let g=u.capabilities||{},_=!!(l&&l.checked),M=_?g.can_start_update_with_index!==!1:g.can_start_update!==!1,G=_&&g.index_blocked_reason||g.start_blocked_reason;if(!k){r.disabled=!M,r.title=G||"\u6AA2\u67E5\u7DDA\u4E0A\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0C\u4E26\u8655\u7406\u672A\u532F\u5165\u7684\u5224\u6C7A\u58D3\u7E2E\u6A94\u3002";let J=r.querySelector("[data-update-label]");J&&(J.textContent=M?"\u8CC7\u6599\u66F4\u65B0":g.active_update_id?"\u66F4\u65B0\u57F7\u884C\u4E2D":"\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D"),i.hidden=!g.can_stop_update,l&&(l.disabled=g.can_start_update===!1)}},Ze=async({silent:u=!1}={})=>{if(!(p||v)){v=!0,u||pe(o,!0,"\u66F4\u65B0\u4E2D\u2026");try{let g=await F.processing();if(p)return;$=g;let _=dr(g,w);_!==h&&(a.innerHTML=_,h=_);let M=ur(g,w,ce());if(M!==b&&(s.innerHTML=M,b=M),Se(),De(),Ta.has(w)&&!z&&Date.now()-ue>=sr&&Pe({quiet:!0}),je){let J=He(je);J?qt(J):it()}let G=s.querySelector("[data-processing-updated-at]");if(G){let J=$e(g.generated_at);G.textContent!==J&&(G.textContent=J)}ct(g),w==="judgment_download"&&I({quiet:!0}),w==="index_versions"&&me({quiet:!0}),w==="normalize_courts"&&Me({quiet:!0}),w==="backfill_law_articles"&&Ie({quiet:!0})}catch(g){if(p)return;let _=al(g.message,$);_!==b&&(s.innerHTML=_,b=_),u||L(g.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{v=!1,u||pe(o,!1)}}},ft=async u=>{if(!k){k=!0,pe(u,!0,"\u555F\u52D5\u4E2D\u2026");try{let g=!!(l&&l.checked),_=await F.startProcessingUpdate(g);L(`\u5DF2\u555F\u52D5\u8CC7\u6599\u66F4\u65B0${g?"\uFF0C\u5B8C\u6210\u5F8C\u63A5\u7E8C Qdrant \u7D22\u5F15":""}\u3002`,"ok",6e3),_&&_.run_id&&console.info("processing update started",_),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await Ze({silent:!0})}catch(g){L(g.message||"\u7121\u6CD5\u555F\u52D5\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{k=!1,pe(u,!1),$&&ct($)}}},At=async(u,g="")=>{if(k)return;k=!0,pe(u,!0,"\u6AA2\u67E5\u4E2D\u2026");let _=rr[g]||"";try{let M=await F.checkUpdates(_?[_]:[]);if(M&&M.checking)L("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u8ACB\u7A0D\u5F8C\u91CD\u65B0\u6574\u7406\u3002","info",6e3);else if(_){let G=(M.sources||{})[_]||{},J=ir[g]||"\u8CC7\u6599";G.status==="error"?L(`${J}\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF1A${G.message||"\u7121\u6CD5\u53D6\u5F97\u7DDA\u4E0A\u7248\u672C"}`,"danger",7e3):L(G.update_available?`${J}\u7DDA\u4E0A\u5DF2\u6709\u66F4\u65B0\u7248\u672C\u3002`:`${J}\u7DDA\u4E0A\u5DF2\u662F\u6700\u65B0\u7248\u672C\u3002`,G.update_available?"warn":"ok",6e3)}else{let G=Number(M.update_count)||0;L(G>0?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${G} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",G>0?"warn":"ok",6e3)}window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await Ze({silent:!0})}catch(M){L(M.message||"\u66F4\u65B0\u6AA2\u67E5\u5931\u6557\u3002","danger",7e3)}finally{k=!1,pe(u,!1),$&&ct($)}},Gt=async(u,g)=>{let _=rr[g]||"";if(!_)return!0;pe(u,!0,"\u6AA2\u67E5\u7248\u672C\u2026");let M=null;try{M=await F.checkUpdates([_])}catch(J){return L(`\u7121\u6CD5\u5B8C\u6210\u7248\u672C\u6AA2\u67E5\uFF08${J.message||"\u7DB2\u8DEF\u932F\u8AA4"}\uFF09\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002`,"warn",7e3),!0}finally{pe(u,!1)}if(!M||M.checking)return M&&M.checking&&L("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","info",6e3),!0;let G=(M.sources||{})[_];if(!G)return!0;if(window.dispatchEvent(new CustomEvent("judgment:updates-changed")),G.status==="up_to_date"&&!G.update_available){let J=ir[g]||"\u8CC7\u6599",ne=G.checked_at?`\uFF08${$e(G.checked_at)} \u6AA2\u67E5\uFF09`:"",fe=Oo[g]||"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u55CE\uFF1F";return window.confirm(`${J}\u7DDA\u4E0A\u6AA2\u67E5\u70BA\u6700\u65B0\u7248\u672C${ne}\u3002

${fe}`)}return G.status==="error"&&L("\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","warn",6e3),!0},Rt=async(u,g)=>{if(!k){k=!0;try{if(!await Gt(u,g)){await Ze({silent:!0});return}pe(u,!0,"\u555F\u52D5\u4E2D\u2026");let M=await F.startProcessingWorkflow(g);L("\u5DF2\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","ok",6e3),M&&M.run_id&&console.info("processing workflow started",M),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await Ze({silent:!0})}catch(_){L(_.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{k=!1,pe(u,!1),$&&ct($)}}},Jt=async u=>{if(!k){k=!0,pe(u,!0,"\u505C\u6B62\u4E2D\u2026");try{let g=await F.stopProcessingUpdate();L(g.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3),await Ze({silent:!0})}catch(g){L(g.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{k=!1,pe(u,!1),$&&ct($)}}},y=u=>{let g=u.target.closest("[data-processing-action]");if(!g||g.disabled)return;let _=g.dataset.processingAction;if(_==="refresh")Ze({silent:!1});else if(_==="refresh-judgment-months")I({quiet:!1});else if(_==="refresh-index-storage")me({quiet:!1,force:!0});else if(_==="refresh-court-check")Me({quiet:!1,force:!0});else if(_==="refresh-law-version-check")Ie({quiet:!1,force:!0,button:g});else if(_==="refresh-ollama")Pe({quiet:!1,button:g});else if(_==="move-ollama-host"){let M=T?.hosts||[],G=M.findIndex(Ae=>Number(Ae.id)===Number(g.dataset.hostId)),J=g.dataset.direction,ne=J==="up"?G-1:J==="down"?G+1:-1;if(G<0||ne<0||ne>=M.length)return;let fe=M.map(Ae=>Number(Ae.id));[fe[G],fe[ne]]=[fe[ne],fe[G]],j(fe)}else if(_==="update")ft(g);else if(_==="check-updates")At(g,g.dataset.workflowId||"");else if(_==="run-workflow"){let M=g.dataset.workflowId||"";M==="full_update"?ft(g):Rt(g,M)}else _==="stop"&&Jt(g)},x=u=>{u.target===l&&$&&ct($)},q=u=>{let g=u.target.closest("[data-processing-workflow]");if(g){if(w=g.dataset.processingWorkflow||"overview",$){let _=dr($,w);a.innerHTML=_,h=_;let M=ur($,w,ce());if(s.innerHTML=M,b=M,Se(),De(),Ta.has(w)&&!z&&Date.now()-ue>=sr&&Pe({quiet:!0}),je){let G=He(je);G?qt(G):it()}}w==="judgment_download"&&I({quiet:!0}),w==="index_versions"&&me({quiet:!0}),w==="normalize_courts"&&Me({quiet:!0}),w==="backfill_law_articles"&&Ie({quiet:!0})}};return t.addEventListener("click",y),a.addEventListener("click",q),s.addEventListener("pointerover",Ve),s.addEventListener("pointerout",Qt),s.addEventListener("pointerdown",qe),window.addEventListener("scroll",it,{capture:!0,passive:!0}),l&&l.addEventListener("change",x),await Ze({silent:!1}),se=window.setInterval(()=>{document.hidden||Ze({silent:!0})},Co),()=>{p=!0,se!==null&&window.clearInterval(se),t.removeEventListener("click",y),a.removeEventListener("click",q),O(),s.removeEventListener("pointerover",Ve),s.removeEventListener("pointerout",Qt),s.removeEventListener("pointerdown",qe),window.removeEventListener("scroll",it,{capture:!0}),l&&l.removeEventListener("change",x)}}var Fa={};It(Fa,{render:()=>dc});var Ia={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u522A\u9664\uFF0F\u9000\u5F79",badge:"badge-neutral"}},_t={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},os={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},wr={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function _s(e){let t=Ia[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${n(t.label)}</span>`}function Oa(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function Tl(e){return Oa(e).map(t=>{let[s,a]=t.split("|").map(r=>r.trim());return{law_name:s||"",source_type:a||""}})}function El(e){return Oa(e).map(t=>{let[s,a]=t.split("|").map(r=>r.trim());return{law_name:s||"",article_no:a||""}})}function Nl(e){return Oa(e).map(t=>({jid:t.trim()}))}function Cl(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function Rl(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function Pl(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function Il(e){return(e?.tags||[]).join(", ")}function ws(e){return`<div class="qb-empty">${m("info",18)}<span>${n(e)}</span></div>`}function Ba(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),r=[...t.map(i=>`<span class="chip">${n(i)}</span>`),...s.map(i=>`<span class="chip">${n(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${n(i)}</span>`)];return r.length?`<div class="chips qb-labels">${r.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function Da(){return`<details class="qb-import">
    <summary>${m("upload",14)}JSON \u6279\u6B21\u532F\u5165</summary>
    <p class="qb-muted">\u683C\u5F0F\uFF1A<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>\u3002\u76F8\u540C\u984C\u76EE fingerprint \u9810\u8A2D\u66F4\u65B0\u3002</p>
    <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
    <div class="qb-actions">
      <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${m("upload",13)}<span>\u532F\u5165 JSON</span></button>
    </div>
  </details>`}function Ol(e){let t=e?.item||{},s=Array.isArray(e?.warnings)?e.warnings:[],a=Array.isArray(t.tags)?t.tags:[];return`<section class="report-card qb-card qb-ai-result">
    <div class="side-card-head">
      <span class="side-card-title">${m("sparkles",14)}Ollama \u5DF2\u5EFA\u7ACB\u984C\u76EE #${t.id}</span>
      ${_s(t.status)}
    </div>
    <div class="qb-ai-answer">
      <strong>${n(t.question||"")}</strong>
      <div class="qb-ai-meta">
        ${n(_t[t.question_type]||t.question_type||"")}
        \xB7 ${n(os[t.difficulty]||t.difficulty||"")}
        \xB7 ${n(e?.model||"\u672C\u6A5F Ollama")}
      </div>
      ${Ba(t)}
      ${t.reference_answer?`<div class="qb-reference"><span class="summary-label">Ollama \u53C3\u8003\u7B54\u6848</span><p>${n(t.reference_answer)}</p></div>`:""}
      ${a.length?`<div class="chips">${a.map(r=>`<span class="chip">${n(r)}</span>`).join("")}</div>`:""}
      ${s.length?`<div class="qb-ai-warnings"><strong>\u9700\u8981\u6CE8\u610F</strong><ul>${s.map(r=>`<li>${n(r)}</li>`).join("")}</ul></div>`:""}
      <div class="qb-actions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="review-ai-item">${m("shield",13)}<span>\u524D\u5F80\u9A57\u6536</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="reset-ai">${m("plus",13)}<span>\u518D\u65B0\u589E\u4E00\u984C</span></button>
      </div>
    </div>
    ${Da()}
  </section>`}function Bl(e){return e.aiResult?Ol(e.aiResult):`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("sparkles",14)}AI \u984C\u5EAB\u65B0\u589E</span>
      <span class="badge badge-neutral">\u672C\u6A5F Ollama</span>
    </div>
    <form class="qb-form qb-ai-form" data-qb-form="ai-create" id="qb-create-form">
      <label class="field qb-wide">
        <span class="field-label">\u984C\u76EE <span class="field-tag">question</span></span>
        <textarea class="input" name="question" rows="4" required placeholder="\u8F38\u5165\u554F\u984C\uFF0COllama \u6703\u56DE\u7B54\u4E26\u81EA\u52D5\u5224\u65B7\u984C\u578B\u3001\u96E3\u5EA6\u3001\u6CD5\u898F\uFF0F\u689D\u6587\u3001\u53C3\u8003\u7B54\u6848\u8207\u6A19\u7C64\u3002">${n(e.aiQuestion||"")}</textarea>
      </label>
      <p class="qb-form-hint">\u9001\u51FA\u5F8C\u7531\u672C\u6A5F Ollama \u56DE\u7B54\u4E26\u81EA\u52D5\u5EFA\u7ACB\u6B04\u4F4D\uFF1B\u984C\u76EE\u6703\u4EE5\u300C\u5F85\u5BE9\u300D\u5EFA\u7ACB\uFF0C\u4ECD\u9700\u4EBA\u5DE5\u8986\u6838\u5F8C\u624D\u6703\u6210\u70BA benchmark-ready\u3002</p>
      <div class="qb-actions">
        <button class="btn btn-primary" type="submit" ${e.aiLoading?"disabled":""}>${e.aiLoading?'<span class="spinner"></span><span>Ollama \u7522\u751F\u4E2D\u2026</span>':`${m("sparkles",14)}<span>\u8B93 Ollama \u7522\u751F\u4E26\u5EFA\u7ACB</span>`}</button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-ai" ${e.aiLoading?"disabled":""}>\u6E05\u9664</button>
      </div>
    </form>
    ${Da()}
  </section>`}function Dl(e){return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("edit",14)}\u7DE8\u8F2F\u984C\u76EE #${e.id}</span>
      <button class="btn btn-ghost btn-sm" type="button" data-qb-action="new">\u53D6\u6D88\u7DE8\u8F2F</button>
    </div>
    <form class="qb-form" data-qb-form="create" id="qb-create-form">
      <input type="hidden" name="item_id" value="${e.id}" />
      <label class="field qb-wide">
        <span class="field-label">\u984C\u76EE <span class="field-tag">question</span></span>
        <textarea class="input" name="question" rows="3" required placeholder="\u4F8B\u5982\uFF1A\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F">${n(e?.question||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u984C\u578B</span>
          <select class="select" name="question_type">${Object.entries(_t).map(([t,s])=>`<option value="${t}" ${e?.question_type===t?"selected":""}>${s}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u96E3\u5EA6</span>
          <select class="select" name="difficulty">${Object.entries(os).map(([t,s])=>`<option value="${t}" ${e?.difficulty===t?"selected":""}>${s}</option>`).join("")}</select>
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
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${n(Cl(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${n(Rl(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${n(Pl(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${n(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${n(Il(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
        </label>
        <label class="field"><span class="field-label">\u5099\u8A3B</span>
          <input class="input" name="notes" value="${n(e?.notes||"")}" placeholder="\u4F86\u6E90\u3001\u6A19\u8A3B\u7406\u7531\u6216\u5F85\u78BA\u8A8D\u4E8B\u9805" />
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
    ${Da()}
  </section>`}function Fl(e,t){return e?Dl(e):Bl(t)}function Hl(e){let t=e.status==="retired"||!!e.deleted_at;return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${n(e.question)}</strong>
        <span class="qb-meta">
          ${n(_t[e.question_type]||e.question_type)}
          \xB7 ${n(os[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${_s(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${n(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${Ba(e)}
    <div class="qb-item-foot">
      <span>\u66F4\u65B0 ${n($e(e.updated_at))}</span>
      ${e.reviewed_by?`<span>\u5BE9\u6838 ${n(e.reviewed_by)}</span>`:""}
      ${e.review_comment?`<span class="qb-comment">${n(e.review_comment)}</span>`:""}
      <div class="qb-actions">
        ${t?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="restore" data-id="${e.id}">${m("refresh",13)}<span>\u5FA9\u539F\u984C\u76EE</span></button>`:`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${m("edit",13)}<span>\u7DE8\u8F2F</span></button>
               ${["pending_review","changes_requested"].includes(e.status)?"":`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="submit-review" data-id="${e.id}">${m("upload",13)}<span>${e.status==="draft"?"\u9001\u5BE9":"\u91CD\u65B0\u9001\u5BE9"}</span></button>`}
               <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${e.id}">${m("shield",13)}<span>\u9A57\u6536</span></button>
               <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${m("trash",13)}<span>\u522A\u9664</span></button>`}
      </div>
    </div>
  </article>`}function zl(e){return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}\u984C\u5EAB\u7BA1\u7406</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="new">${m("plus",13)}<span>\u65B0\u589E</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="revalidate">${m("refresh",13)}<span>\u91CD\u65B0\u9A57\u8B49</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="export">${m("download",13)}<span>\u532F\u51FA JSON</span></button>
      </div>
    </div>
    <form class="qb-filters" data-qb-form="filter">
      <input class="input" name="query" type="search" placeholder="\u641C\u5C0B\u984C\u76EE\u6216\u53C3\u8003\u7B54\u6848" value="${n(e.filters.query)}" />
      <select class="select" name="status">
        <option value="">\u5168\u90E8\u72C0\u614B</option>
        ${Object.entries(Ia).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(_t).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(os).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <div class="qb-tag-filter" data-qb-tag-filter>
        <div class="qb-tag-values">
          ${e.filters.tags.length?e.filters.tags.map(t=>`<span class="chip qb-tag-chip">${n(t)}<button class="qb-tag-remove" type="button" data-qb-action="remove-tag" data-tag="${n(t)}" aria-label="\u79FB\u9664\u6A19\u7C64 ${n(t)}">${m("x",9)}</button></span>`).join(""):'<span class="qb-tag-placeholder">\u6A19\u7C64</span>'}
        </div>
        <button class="qb-tag-add" type="button" data-qb-action="open-tag-search" aria-label="\u52A0\u5165\u6A19\u7C64" aria-haspopup="listbox">${m("plus",13)}</button>
        ${e.filters.tags.map(t=>`<input type="hidden" name="tags" value="${n(t)}" />`).join("")}
        <div class="qb-tag-popover" data-qb-tag-popover hidden>
          <input class="input" type="search" data-qb-tag-search placeholder="\u8F38\u5165\u76F8\u8FD1\u5B57\u641C\u5C0B\u6A19\u7C64\u2026" autocomplete="off" />
          <div class="qb-tag-results" data-qb-tag-results role="listbox" aria-live="polite"></div>
        </div>
      </div>
      <button class="btn btn-primary btn-sm" type="submit">${m("search",13)}<span>\u7BE9\u9078</span></button>
    </form>
    <div class="qb-list">
      ${e.items.length?e.items.map(t=>Hl(t)).join(""):ws("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${c(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}var kr=[["queue","\u5F85\u5BE9\uFF0F\u9000\u56DE"],["accepted","\u5DF2\u6838\u51C6"],["rejected","\u5DF2\u62D2\u7D55"],["draft","\u8349\u7A3F"]];function Ul(e){let t=e.stats||{};return{queue:Number(t.pending_review||0)+Number(t.changes_requested||0),accepted:Number(t.accepted||0),rejected:Number(t.rejected||0),draft:Number(t.draft||0)}}function Ql(e,t){let s=e.reviewFilter||"queue",a={queue:{title:"\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u6216\u9000\u56DE\u4FEE\u6539\u7684\u984C\u76EE\u3002",text:t.accepted?`\u5DF2\u6709 ${c(t.accepted)} \u984C\u6838\u51C6\u3002\u65B0\u984C\u76EE\u5EFA\u7ACB\u5F8C\u6703\u81EA\u52D5\u9001\u5BE9\uFF0C\u4E5F\u53EF\u4EE5\u5207\u63DB\u5230\u300C\u5DF2\u6838\u51C6\u300D\u91CD\u65B0\u9A57\u6536\u65E2\u6709\u984C\u76EE\u3002`:"\u5EFA\u7ACB\u984C\u76EE\u5F8C\u6703\u9810\u8A2D\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\uFF1B\u82E5\u53EA\u60F3\u5148\u4FDD\u5B58\uFF0C\u5EFA\u7ACB\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5373\u53EF\u5B58\u6210\u8349\u7A3F\u3002"},accepted:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u6838\u51C6\u984C\u76EE\u3002",text:"\u984C\u76EE\u901A\u904E\u4EBA\u5DE5\u9A57\u6536\u5F8C\u6703\u5217\u5728\u9019\u88E1\uFF1B\u4E5F\u53EF\u4EE5\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u9001\u51FA\u9A57\u6536\u3002"},rejected:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u62D2\u7D55\u984C\u76EE\u3002",text:"\u88AB\u62D2\u7D55\u7684\u984C\u76EE\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u4E2D\uFF0C\u53EF\u4FEE\u6539\u5F8C\u91CD\u65B0\u9001\u5BE9\u3002"},draft:{title:"\u76EE\u524D\u6C92\u6709\u8349\u7A3F\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u984C\u76EE\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5C31\u6703\u5B58\u6210\u8349\u7A3F\uFF0C\u4E4B\u5F8C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002"}}[s]||{title:"\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u65B0\u984C\u76EE\u5F8C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"},r=[s!=="draft"?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="new">${m("plus",13)}<span>\u65B0\u589E\u984C\u76EE</span></button>`:"",s==="queue"&&t.accepted?`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="review-filter" data-filter="accepted">${m("shield",13)}<span>\u67E5\u770B\u5DF2\u6838\u51C6 ${c(t.accepted)}</span></button>`:"",`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="go-manage">${m("database",13)}<span>\u524D\u5F80\u984C\u5EAB\u7BA1\u7406</span></button>`].filter(Boolean).join("");return`<div class="qb-empty qb-empty-block">
    <span class="qb-empty-icon">${m("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>${n(a.title)}</strong>
      <p>${n(a.text)}</p>
      <div class="qb-actions">${r}</div>
    </div>
  </div>`}function Gl(e){let t=kr.find(([s])=>s===e);return t?t[1]:"\u5F85\u5BE9\uFF0F\u9000\u56DE"}function Jl(e,t){return`<button class="qb-review-item${t?" is-active":""}" type="button" data-qb-action="select-review-item" data-id="${e.id}" aria-pressed="${t?"true":"false"}">
    <span class="qb-review-item-top">
      <span class="qb-id">#${e.id}</span>
      <span class="qb-review-item-meta">
        ${n(_t[e.question_type]||e.question_type)}
        \xB7 ${n(os[e.difficulty]||e.difficulty)}
        \xB7 v${e.version}
        ${e.benchmark_ready?" \xB7 Benchmark ready":""}
        ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
      </span>
      ${_s(e.status)}
    </span>
    <strong>${n(e.question)}</strong>
  </button>`}function Vl(e){return`<article class="qb-review-pane-card">
    <div class="qb-review-pane-head">
      <div class="qb-review-pane-title">
        <span class="qb-review-item-meta">#${e.id} \xB7 v${e.version} \xB7 ${n(_t[e.question_type]||e.question_type)} \xB7 ${n(os[e.difficulty]||e.difficulty)}</span>
        <strong>${n(e.question)}</strong>
      </div>
      <div class="qb-review-pane-side">
        ${_s(e.status)}
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${m("edit",13)}<span>\u7DE8\u8F2F</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
        </div>
      </div>
    </div>
    <div class="qb-fingerprint mono">fingerprint ${n(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${Ba(e)}
    ${e.review_comment?`<div class="qb-review-note"><span class="summary-label">\u6700\u8FD1\u6279\u6CE8${e.reviewed_by?` \xB7 ${n(e.reviewed_by)}`:""}</span><p>${n(e.review_comment)}</p></div>`:""}
    ${e.reference_answer?`<div class="qb-reference"><span class="summary-label">\u53C3\u8003\u7B54\u6848</span><p>${n(e.reference_answer)}</p></div>`:""}
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
    ${e.reviews?.length?`<div class="qb-review-history"><span class="summary-label">\u5BE9\u6838\u7D00\u9304</span>${e.reviews.map(t=>`<div class="qb-review-row"><span>${n(t.reviewer||"\u533F\u540D")}</span>${_s(t.decision==="approved"?"accepted":t.decision)}<span>${n($e(t.created_at))}</span><p>${n(t.comment||"\u2014")}</p></div>`).join("")}</div>`:""}
  </article>`}function Wl(){return`<div class="qb-empty qb-empty-block qb-review-placeholder">
    <span class="qb-empty-icon">${m("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>\u5F9E\u5DE6\u5074\u9078\u64C7\u984C\u76EE</strong>
      <p>\u9EDE\u9078\u984C\u76EE\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u984C\u5E79\u3001\u9810\u671F\u6A19\u8A3B\u3001\u53C3\u8003\u7B54\u6848\u8207\u6838\u51C6\u9078\u9805\u3002</p>
    </div>
  </div>`}function Kl(e){let t=e.reviewDetail,s=Ul(e),a=e.reviewFilter||"queue",r=kr.map(([l,d])=>`<button class="chip qb-review-tab${a===l?" is-active":""}" type="button" role="tab" aria-selected="${a===l?"true":"false"}" data-qb-action="review-filter" data-filter="${l}"><span>${d}</span><span class="qb-review-tab-count">${c(s[l]||0)}</span></button>`).join(""),i=e.reviewItems.length?e.reviewItems.map(l=>Jl(l,Number(t?.id)===Number(l.id))).join(""):`<div class="qb-empty qb-empty-compact">${m("info",16)}<span>\u76EE\u524D\u6C92\u6709${n(Gl(a))}\u984C\u76EE\u3002</span></div>`,o=t?Vl(t):e.reviewItems.length?Wl():Ql(e,s);return`<section class="report-card qb-card qb-review-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("shield",14)}\u984C\u5EAB\u4EBA\u5DE5\u9A57\u6536\u6279\u6CE8</span>
      <span class="badge ${s.queue?"badge-warn":"badge-neutral"}">\u5F85\u5BE9 ${c(s.queue)}</span>
    </div>
    <p class="qb-review-hint">\u65B0\u984C\u76EE\u5EFA\u7ACB\u6216\u4FEE\u6539\u5F8C\u6703\u9032\u5165\u5F85\u5BE9\uFF1B\u9EDE\u9078\u5DE6\u5074\u984C\u76EE\u5373\u53EF\u5728\u53F3\u5074\u67E5\u770B\u5167\u5BB9\u3001\u6838\u51C6\u3001\u9000\u56DE\u6216\u522A\u9664\u3002</p>
    <div class="qb-review-split">
      <aside class="qb-review-list-pane" aria-label="\u9A57\u6536\u984C\u76EE\u6E05\u55AE">
        <div class="qb-review-tabs" role="tablist" aria-label="\u9A57\u6536\u72C0\u614B">${r}</div>
        <div class="qb-review-list">${i}</div>
      </aside>
      <section class="qb-review-detail-pane" aria-live="polite">${o}</section>
    </div>
  </section>`}function ys(e){if(e==null||e==="")return"";let t=Number(e);return Number.isFinite(t)?`${Math.round(t*100)}%`:""}function Yl(e){if(!e||typeof e!="object")return"\u5F15\u7528";let t=String(e.jid||"").trim();if(t)return t;let s=String(e.law_name||"").trim(),a=String(e.article_no||"").trim(),r=`${s} ${a}`.trim();return r||String(e.title||e.text||"\u5F15\u7528").slice(0,80)}function Xl(e){let t=e?.metrics||{},s=t.scores||{},a=[["\u6CD5\u898F\u53EC\u56DE",ys(t.law_recall)],["\u689D\u6587\u53EC\u56DE",ys(t.article_recall)],["\u898F\u5247\u5206",ys(s.deterministic)],["Judge",ys(s.judge)],["\u4EBA\u5DE5",ys(s.human)]].filter(([,r])=>r);return a.length?`<div class="qb-bank-stats">${a.map(([r,i])=>`<span class="qb-bank-stat"><span>${n(r)}</span><strong>${n(i)}</strong></span>`).join("")}</div>`:""}function Zl(e){let t=Array.isArray(e?.law_sources)?e.law_sources:[],s=Array.isArray(e?.citations)?e.citations:[],a=t.length?`<div class="qb-bank-sources">${t.map(i=>{let o=String(i.law_name||"\u672A\u547D\u540D\u6CD5\u898F"),l=(i.articles||[]).map(p=>String(p.article_no||"").trim()).filter(Boolean),d=`<strong>${n(o)}</strong>${l.length?`<small>${n(l.join("\u3001"))}</small>`:""}`;return i.law_url?`<a class="qb-bank-law" href="${n(i.law_url)}" target="_blank" rel="noreferrer">${d}</a>`:`<span class="qb-bank-law">${d}</span>`}).join("")}</div>`:"",r=s.length?`<div class="qb-bank-sources qb-bank-citations">${s.map(i=>`<span class="chip chip-mono">${n(Yl(i))}</span>`).join("")}</div>`:"";return!a&&!r?"":`<div class="qb-bank-answer-block">
    <div class="qb-bank-section-label"><span>\u5F15\u7528\u4F86\u6E90</span><span>${c(t.length+s.length)} \u7B46</span></div>
    ${a}${r}
  </div>`}function Sr(e,t){if(!e)return`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("history",20)}</span>
      <strong>\u5C1A\u7121 RAG \u7B54\u6848</strong>
      <span>\u8DD1\u4E00\u6B21 Benchmark \u5F8C\uFF0C\u6700\u8FD1\u4E00\u6B21\u6210\u529F\u56DE\u7B54\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</span>
    </div>`;let s=Number(e.item_version||0),a=Number(t?.version||0),r=s&&a&&s!==a?`<span class="badge badge-warn">\u7B54\u6848 v${s} \xB7 \u984C\u76EE v${a}</span>`:"",i=e.answer_source==="llm"?"LLM \u751F\u6210":e.answer_source==="structured"?"\u6CD5\u898F\u8CC7\u6599\u5EAB":String(e.answer_source||"RAG");return`<div class="qb-bank-answer-meta">
      <span class="badge badge-ok"><span class="status-dot is-ok"></span>RAG \u5B8C\u6210</span>
      <span class="badge badge-neutral">${n(i)}</span>
      ${r}
      <span class="mono">${n(e.run_label||e.run_id||"")}</span>
      <span>${n($e(e.finished_at))}</span>
      <span>${n(ie(e.duration_ms))}</span>
      ${e.llm_model?`<span class="mono">${n(e.llm_model)}</span>`:""}
    </div>
    <div class="qb-bank-answer-block">
      <div class="qb-bank-section-label"><span>\u56DE\u7B54</span><span>${c(String(e.answer||"").length)} \u5B57</span></div>
      <p class="qb-bank-answer-text">${n(String(e.answer||"").trim()||"\uFF08\u7A7A\u767D\u56DE\u7B54\uFF09")}</p>
    </div>
    ${Zl(e)}
    ${Xl(e)}`}function xr(e,t){let s=e.selectedSuiteId,a=t&&e.suiteAnswers?.[String(s)]?.[String(t.id)]||null;return t?`<div class="qb-bank-answer-head">
      <div class="qb-bank-answer-heading">
        <span class="qb-bank-answer-kicker">${m("sparkles",12)}RAG \u6700\u8FD1\u4E00\u6B21\u7B54\u6848</span>
        <strong class="qb-bank-answer-question">#${t.id} ${n(t.question)}</strong>
      </div>
      ${a?`<span class="qb-bank-answer-state">${n(_t[t.question_type]||t.question_type)} \xB7 v${t.version}</span>`:""}
    </div>
    ${Sr(a,t)}`:`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("cube",20)}</span>
      <strong>\u9078\u64C7\u984C\u76EE</strong>
      <span>\u5F9E\u5DE6\u5074\u6E05\u55AE\u9078\u64C7\u4E00\u984C\uFF0C\u67E5\u770B\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`}function qr(e){return`<span class="qb-bank-actions">
    <button class="qb-bank-icon" type="button" data-qb-action="edit" data-id="${e.id}" title="\u7DE8\u8F2F\u984C\u76EE" aria-label="\u7DE8\u8F2F\u984C\u76EE #${e.id}">${m("edit",13)}</button>
    <button class="qb-bank-icon is-danger" type="button" data-qb-action="delete" data-id="${e.id}" title="\u5F9E\u984C\u5EAB\u79FB\u9664" aria-label="\u5F9E\u984C\u5EAB\u79FB\u9664 #${e.id}">${m("trash",13)}</button>
  </span>`}function ec(e,t,{selected:s,hasAnswer:a}){return`<div class="qb-bank-row${s?" is-active":""}" data-id="${e.id}">
    <button class="qb-bank-select" type="button" data-qb-action="select-bank-item" data-id="${e.id}" aria-pressed="${s?"true":"false"}">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <span class="qb-bank-item-copy">
        <strong>${n(e.question)}</strong>
        <small>${n(_t[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${a?"\u5DF2\u6709 RAG \u7B54\u6848":"\u5C1A\u7121 RAG \u7B54\u6848"}</small>
      </span>
    </button>
    ${qr(e)}
  </div>`}function tc(e,t,s){return`<article class="qb-bank-full-item" data-id="${e.id}">
    <div class="qb-bank-full-head">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <div class="qb-bank-full-title">
        <strong>${n(e.question)}</strong>
        <small>${n(_t[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${n(Ia[e.status]?.label||e.status||"")}</small>
      </div>
      ${qr(e)}
    </div>
    ${Sr(s,e)}
  </article>`}function _r(e){let t=e.editingSuite,s=Array.isArray(e.suites)?e.suites:[],a=s.find(b=>Number(b.id)===Number(e.selectedSuiteId))||s[0]||null,r=Array.isArray(a?.items)?a.items:[],i=e.suiteAnswers?.[String(a?.id)]||{},o=r.find(b=>Number(b.id)===Number(e.selectedBankItemId))||null,l=!!e.suiteAnswersLoading,d=String(e.suiteAnswersError||""),p=!!e.suiteManageOpen||!s.length,v=e.bankTab==="full"?"full":"split",k=s.length?`<div class="qb-bank-tabs" role="tablist" aria-label="Benchmark \u984C\u5EAB\u6AA2\u8996">
        <button class="qb-bank-tab${v==="split"?" is-active":""}" type="button" role="tab" aria-selected="${v==="split"?"true":"false"}" data-qb-action="bank-tab" data-tab="split">${m("grid",13)}<span>Benchmark \u984C\u5EAB</span><span class="badge badge-neutral">${c(r.length)}</span></button>
        <button class="qb-bank-tab${v==="full"?" is-active":""}" type="button" role="tab" aria-selected="${v==="full"?"true":"false"}" data-qb-action="bank-tab" data-tab="full">${m("table",13)}<span>\u984C\u5EAB\u5168\u5217\u8868</span><span class="badge badge-neutral">${c(r.length)}</span></button>
      </div>`:"",$="";if(!s.length)$=`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("cube",20)}</span>
      <strong>\u5C1A\u672A\u5EFA\u7ACB Benchmark \u984C\u5EAB</strong>
      <span>\u5C55\u958B\u4E0B\u65B9 Suite \u8A2D\u5B9A\u4E26\u5EFA\u7ACB\u984C\u5EAB\u5F8C\uFF0C\u5C31\u80FD\u5728\u9019\u88E1\u700F\u89BD\u984C\u76EE\u8207\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`;else if(l)$='<div class="qb-bank-loading"><span class="spinner" aria-hidden="true"></span><span>\u8B80\u53D6\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u4E2D\u2026</span></div>';else{let b=d?ye({tone:"warn",title:"\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u8B80\u53D6\u5931\u6557",text:n(d)}):"";v==="full"?$=`${b}<div class="qb-bank-full" data-qb-bank-view="full">${r.length?r.map((h,w)=>tc(h,w,i[String(h.id)]||null)).join(""):ws("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>`:$=`${b}<div class="qb-bank-split" data-qb-bank-view="split">
        <div class="qb-bank-list" data-qb-bank-list>${r.length?r.map((h,w)=>ec(h,w,{selected:Number(h.id)===Number(o?.id),hasAnswer:!!i[String(h.id)]})).join(""):ws("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>
        <div class="qb-bank-answer-pane" data-qb-bank-answer>${xr(e,o)}</div>
      </div>`}return`<section class="report-card qb-card qb-bank-card">
    <div class="side-card-head qb-bank-head">
      <div class="qb-bank-heading">
        <span class="side-card-title">${m("cube",14)}Benchmark \u984C\u5EAB</span>
        <span class="qb-bank-sub">${a?`${n(a.name)} \xB7 v${a.version} \xB7 ${c(a.item_count)} \u984C`:"\u5C1A\u672A\u5EFA\u7ACB suite"}</span>
      </div>
      <div class="qb-bank-controls">
        ${s.length?`<label class="qb-suite-picker"><span>Suite</span><select class="select" data-qb-suite-select aria-label="\u9078\u64C7 benchmark suite">${s.map(b=>`<option value="${b.id}" ${Number(b.id)===Number(a?.id)?"selected":""}>${n(b.name)} \xB7 ${c(b.item_count)} \u984C</option>`).join("")}</select></label>`:""}
        ${a?`<span class="badge ${a.status==="frozen"?"badge-ok":"badge-neutral"}">${a.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>`:""}
      </div>
    </div>
    ${k}
    ${$}
    <details class="qb-suite-manage" ${p?"open":""}>
      <summary>${m("sliders",14)}Suite \u8A2D\u5B9A\u8207\u7248\u672C <span class="qb-muted">${c(s.length)} \u500B suite \xB7 ${c(e.ready.length)} \u984C benchmark-ready</span></summary>
      <div class="qb-suite-manage-body">
        <form class="qb-suite-form" data-qb-form="suite">
          <input type="hidden" name="suite_id" value="${t?.id||""}" />
          <div class="qb-form-grid">
            <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${n(t?.name||"Pilot 30")}" /></label>
            <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(wr).map(([b,h])=>`<option value="${b}" ${t?.tier===b?"selected":""}>${h}</option>`).join("")}</select></label>
          </div>
          <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${n(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
          <div class="qb-check-list">
            ${e.ready.length?e.ready.map(b=>{let h=t?t.items?.some(w=>Number(w.id)===Number(b.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${b.id}" ${h?"checked":""}/><span><strong>#${b.id}</strong> ${n(b.question)} <small>${n(_t[b.question_type]||b.question_type)}</small></span></label>`}).join(""):ws("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
          </div>
          <div class="qb-actions">
            <button class="btn btn-primary" type="submit">${m("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
            ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
          </div>
        </form>
        <div class="qb-list">
          ${s.length?s.map(b=>`<article class="qb-suite">
            <div class="qb-item-head">
              <div class="qb-item-title"><strong>${n(b.name)}</strong><span class="qb-meta">${n(wr[b.tier]||b.tier)} \xB7 v${b.version} \xB7 ${c(b.item_count)} \u984C</span></div>
              <span class="badge ${b.status==="frozen"?"badge-ok":"badge-neutral"}">${b.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
            </div>
            <div class="qb-suite-items">${(b.items||[]).slice(0,8).map(h=>`<span class="chip">#${h.id} ${n(h.question.slice(0,22))}${h.question.length>22?"\u2026":""}</span>`).join("")}${b.item_count>8?`<span class="qb-muted">+${b.item_count-8}</span>`:""}</div>
            <div class="qb-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${b.id}">${m("edit",13)}<span>\u7DE8\u8F2F suite</span></button>
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${b.id}">${m("shield",13)}<span>\u51CD\u7D50</span></button>
              <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${b.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
            </div>
          </article>`).join(""):ws("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
        </div>
      </div>
    </details>
  </section>`}function sc(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),r=Number(a?.value);Number.isFinite(r)&&(t[s]=Math.max(1,Math.min(5,Math.round(r))))}return t}function ac(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:Tl(t.get("expected_laws")),expected_articles:El(t.get("expected_articles")),expected_judgments:Nl(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function Ar(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},r={tab:"",editing:null,editingFrom:"",editingSuite:null,aiQuestion:"",aiLoading:!1,aiResult:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tags:[]},stats:{},suites:[],ready:[],selectedSuiteId:null,selectedBankItemId:null,bankTab:"split",suiteAnswers:{},suiteAnswersLoading:!1,suiteAnswersError:"",suiteManageOpen:!1,reviewItems:[],reviewDetail:null,reviewFilter:"queue"},i=j=>e.querySelector(`#quality-panel-${a[j]}`),o=(j,R)=>{j&&(j.childElementCount?j.setAttribute("aria-busy","true"):j.innerHTML=`<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>${R}</span></div></section>`)},l=j=>{j?.removeAttribute("aria-busy")},d=0,p=null,v=()=>"anonymous",k=()=>{s&&s(r.stats)},$=j=>{t&&t(j),z(j)},b=async()=>{try{r.stats=await F.questionBankStats()}catch{r.stats={}}k()},h=()=>{let j=i("create");j&&(j.innerHTML=Fl(r.editing,r))},w=(j,R)=>{let O=j?.querySelector("[data-qb-tag-results]");O&&(O.innerHTML=R.length?R.map(U=>`<button class="qb-tag-option" type="button" role="option" data-qb-action="select-tag" data-tag="${n(U.tag)}"><span>${n(U.tag)}</span><small>${c(U.count)}</small></button>`).join(""):'<div class="qb-tag-empty">\u6C92\u6709\u5176\u4ED6\u76F8\u7B26\u6A19\u7C64</div>')},A=async(j,R="")=>{if(!j)return;let O=j.querySelector("[data-qb-tag-results]"),U=++d;O&&(O.innerHTML='<div class="qb-tag-loading"><span class="spinner"></span><span>\u641C\u5C0B\u6A19\u7C64\u2026</span></div>');try{let oe=await F.questionBankTags(R,12);if(U!==d)return;let V=(oe.tags||[]).filter(qe=>!r.filters.tags.includes(qe.tag));w(j,V)}catch(oe){if(U!==d)return;O&&(O.innerHTML=`<div class="qb-tag-empty">${n(oe.message||"\u6A19\u7C64\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},B=(j,{focus:R=!1}={})=>{if(!j)return;let O=j.querySelector("[data-qb-tag-popover]"),U=j.querySelector("[data-qb-tag-search]");!O||!U||(O.hidden&&(O.hidden=!1,U.value="",A(j,"")),R&&(U.focus(),U.select()))},Q=j=>{p&&(window.clearTimeout(p),p=null);let R=j?.querySelector("[data-qb-tag-popover]");R&&(R.hidden=!0)},D=async j=>{let R=String(j||"").trim();R&&(r.filters.tags.includes(R)?r.filters.tags=r.filters.tags.filter(O=>O!==R):r.filters.tags=[...r.filters.tags,R],r.offset=0,await S())},H=()=>{let j=Array.isArray(r.suites)?r.suites:[];if(!j.length)return r.selectedSuiteId=null,r.selectedBankItemId=null,null;let R=j.find(U=>Number(U.id)===Number(r.selectedSuiteId));R||(R=j[0],r.selectedSuiteId=R.id,r.selectedBankItemId=null);let O=Array.isArray(R.items)?R.items:[];return O.some(U=>Number(U.id)===Number(r.selectedBankItemId))||(r.selectedBankItemId=O[0]?.id??null),R},te=()=>{let j=i("suite");j&&(j.innerHTML=_r(r))},de=0,ke=async(j,{force:R=!1}={})=>{if(!j)return;let O=++de;if(!R&&r.suiteAnswers[String(j)]){r.suiteAnswersLoading=!1,r.suiteAnswersError="",te();return}r.suiteAnswersLoading=!0,r.suiteAnswersError="",te();try{let U=await F.benchmarkSuiteLatestAnswers(j);if(O!==de)return;r.suiteAnswers[String(j)]=U.answers||{}}catch(U){if(O!==de)return;r.suiteAnswersError=U.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}finally{O===de&&(r.suiteAnswersLoading=!1,te())}},we=async j=>{r.selectedSuiteId=j,r.selectedBankItemId=null,r.suiteAnswersError="";let R=H();if(!R){te();return}await ke(R.id)},W=j=>{r.bankTab=j==="full"?"full":"split",te()},E=()=>{let j=i("suite");if(!j)return;let R=H(),U=(Array.isArray(R?.items)?R.items:[]).find(V=>Number(V.id)===Number(r.selectedBankItemId))||null;for(let V of j.querySelectorAll(".qb-bank-row")){let qe=Number(V.dataset.id)===Number(r.selectedBankItemId);V.classList.toggle("is-active",qe);let I=V.querySelector("[data-qb-action='select-bank-item']");I&&I.setAttribute("aria-pressed",qe?"true":"false")}let oe=j.querySelector("[data-qb-bank-answer]");oe&&(oe.innerHTML=xr(r,U))},S=async()=>{let j=i("manage");if(j){p&&(window.clearTimeout(p),p=null),o(j,"\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026");try{let R=await F.questionBankItems({...r.filters,...r.filters.status==="retired"?{include_deleted:!0}:{}},r.limit,r.offset);r.items=R.items||[],r.total=Number(R.total||0),r.stats=R.stats||r.stats,l(j),j.innerHTML=zl(r),k()}catch(R){l(j),j.innerHTML=`<section class="report-card qb-card">${ye({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:n(R.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},C=async({refreshAnswers:j=!1}={})=>{let R=i("suite");if(R){o(R,"\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026");try{let[O,U]=await Promise.all([F.benchmarkSuites(),F.benchmarkReadyQuestions(300)]);r.suites=O.suites||[],r.ready=U.items||[];let oe=H();if(r.suiteAnswersError="",r.suiteAnswersLoading=!1,oe&&(j||!r.suiteAnswers[String(oe.id)]))try{let V=await F.benchmarkSuiteLatestAnswers(oe.id);r.suiteAnswers[String(oe.id)]=V.answers||{}}catch(V){r.suiteAnswersError=V.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}l(R),R.innerHTML=_r(r)}catch(O){l(R),R.innerHTML=`<section class="report-card qb-card">${ye({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:n(O.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},ee=()=>{let j=i("review");j&&(j.innerHTML=Kl(r))},re=async j=>{let R=r.reviewItems.find(U=>Number(U.id)===Number(j));if(!R)return;r.reviewDetail=R,ee();let O=i("review")?.querySelector(".qb-review-detail-pane");O&&window.matchMedia("(max-width: 1020px)").matches&&O.scrollIntoView({behavior:"smooth",block:"start"});try{let U=await F.questionBankItem(R.id);Number(r.reviewDetail?.id)===Number(R.id)&&(r.reviewDetail=U,ee())}catch(U){L(U.message||"\u984C\u76EE\u5167\u5BB9\u8B80\u53D6\u5931\u6557\u3002","danger")}},T=async()=>{let j=i("review");if(!j)return;o(j,"\u8B80\u53D6\u9A57\u6536\u984C\u76EE\u4E2D\u2026");let R=r.reviewFilter||"queue",O=R==="queue"?["pending_review","changes_requested"]:R==="accepted"?["accepted"]:R==="rejected"?["rejected"]:["draft"];try{let U=await Promise.all(O.map(I=>F.questionBankItems({status:I},200,0)));r.reviewItems=U.flatMap(I=>I.items||[]),r.stats=U[0]?.stats||r.stats;let oe=Number(r.reviewDetail?.id||0),qe=r.reviewItems.some(I=>Number(I.id)===oe)?oe:Number(r.reviewItems[0]?.id||0);r.reviewDetail=qe?await F.questionBankItem(qe):null,l(j),ee(),k()}catch(U){l(j),j.innerHTML=`<section class="report-card qb-card">${ye({tone:"danger",title:"\u9A57\u6536\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:n(U.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}};function z(j){let R=r.tab;r.tab=j;for(let O of Object.keys(a)){let U=i(O);U&&(U.hidden=O!==j)}j==="create"?(R!=="create"&&!r.editing&&(r.aiQuestion="",r.aiResult=null),h()):j==="manage"?S():j==="suite"?C():j==="review"&&T()}let Y=j=>{let O=[...r.items,...r.reviewItems,...r.reviewDetail?[r.reviewDetail]:[]].find(oe=>Number(oe.id)===Number(j));r.reviewDetail=O||{id:Number(j)};let U=O?.status;["accepted","rejected","draft"].includes(U)?r.reviewFilter=U:U&&(r.reviewFilter="queue"),$("review")},ue=async j=>{let R=ac(j),O=Number(j.elements.item_id?.value||0);O||(R.status=j.elements.submit_for_review?.checked?"pending_review":"draft");try{O?(await F.updateQuestionBankItem(O,{...R,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),L("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await F.createQuestionBankItem(R),L(R.status==="draft"?"\u984C\u76EE\u5DF2\u5B58\u70BA\u8349\u7A3F\uFF0C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002":"\u984C\u76EE\u5DF2\u5EFA\u7ACB\u4E26\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok")),r.editing=null;let U=["manage","suite","review"].includes(r.editingFrom)?r.editingFrom:"manage";r.editingFrom="",r.suiteAnswers={},await b(),$(U)}catch(U){let oe=U.detail||U.payload?.detail,V=oe?.errors?.join(" \xB7 ")||oe?.message||U.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";L(V,"danger",8e3)}},ae=async j=>{let R=String(new FormData(j).get("question")||"").trim();if(R.length<4){L("\u984C\u76EE\u81F3\u5C11\u9700\u8981 4 \u500B\u5B57\u3002","danger");return}r.aiQuestion=R,r.aiLoading=!0,r.aiResult=null,h();try{let O=await F.createQuestionBankItemWithAI({question:R});r.aiResult=O,r.aiQuestion="",await b(),L(`Ollama \u5DF2\u5EFA\u7ACB\u984C\u76EE #${O.item.id}\uFF0C\u72C0\u614B\u70BA\u5F85\u5BE9\uFF0C\u8ACB\u4EBA\u5DE5\u8986\u6838\u3002`,"ok",8e3)}catch(O){let U=O.detail||O.payload?.detail,oe=U?.errors?.join(" \xB7 ")||U?.message||O.message||"Ollama \u7522\u751F\u5931\u6557\u3002";L(oe,"danger",12e3)}finally{r.aiLoading=!1,h()}},X=async(j,R)=>{let O=Number(j.dataset.id||0);if(O)try{await F.reviewQuestionBankItem(O,{decision:R,reviewer:v(),rubric_scores:sc(j),comment:String(j.querySelector('[name="comment"]')?.value||"")}),L(R==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":R==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",R==="approved"?"ok":"info"),await b(),await T()}catch(U){let oe=U.detail||U.payload?.detail,V=oe?.errors?.join(" \xB7 ")||oe?.message||U.message||"\u9A57\u6536\u5931\u6557\u3002";L(V,"danger",8e3)}},ge=async j=>{let R=new FormData(j),O=Number(R.get("suite_id")||0),U=Array.from(j.querySelectorAll('input[name="item_ids"]:checked')).map(V=>Number(V.value)),oe={name:String(R.get("name")||"").trim(),tier:String(R.get("tier")||"core"),description:String(R.get("description")||"").trim(),item_ids:U};try{O?(await F.updateBenchmarkSuite(O,oe),L("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await F.createBenchmarkSuite(oe),L("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),r.editingSuite=null,r.suiteManageOpen=!0,r.suiteAnswers={},await C()}catch(V){let qe=V.detail||V.payload?.detail,I=qe?.errors?.join(" \xB7 ")||qe?.message||V.message||"Suite \u5132\u5B58\u5931\u6557\u3002";L(I,"danger",8e3)}},_e=async j=>{let R=e.querySelector("[data-qb-tag-filter] [data-qb-tag-popover]:not([hidden])")?.closest("[data-qb-tag-filter]");R&&!j.target.closest("[data-qb-tag-filter]")&&Q(R);let O=j.target.closest("[data-qb-action]")?.dataset.qbAction;if(!O)return;let U=j.target.closest("[data-qb-action]"),oe=Number(U.dataset.id||0);if(O==="open-tag-search"){let V=U.closest("[data-qb-tag-filter]");B(V,{focus:!0});return}if(O==="select-tag"){await D(U.dataset.tag);return}if(O==="remove-tag"){await D(U.dataset.tag);return}if(O==="bank-tab"){W(U.dataset.tab);return}if(O==="select-bank-item"){r.selectedBankItemId=oe,E();return}if(O==="new"){r.editing=null,r.editingFrom="",r.aiQuestion="",r.aiResult=null,r.aiLoading=!1,$("create");return}if(O==="reset-create"){r.editing=null,h();return}if(O==="reset-ai"){r.aiQuestion="",r.aiResult=null,r.aiLoading=!1,h();return}if(O==="edit"){let V=r.suites.find(me=>Number(me.id)===Number(r.selectedSuiteId)),I=[...r.items,...r.reviewItems,...V?.items||[],...r.reviewDetail?[r.reviewDetail]:[]].find(me=>Number(me.id)===oe);if(!I)return;r.editing=I,r.editingFrom=r.tab,$("create");return}if(O==="review"){Y(oe);return}if(O==="review-ai-item"){let V=r.aiResult?.item;if(!V)return;r.reviewFilter="queue",r.reviewDetail=V,$("review");return}if(O==="review-filter"){let V=String(U.dataset.filter||"queue");r.reviewFilter=["queue","accepted","rejected","draft"].includes(V)?V:"queue",r.reviewDetail=null,await T();return}if(O==="select-review-item"){await re(oe);return}if(O==="go-manage"){$("manage");return}if(O==="submit-review"){try{await F.submitQuestionBankItemForReview(oe),L("\u5DF2\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok"),await b(),r.tab==="manage"?await S():r.tab==="review"&&await T()}catch(V){let qe=V.detail||V.payload?.detail,I=qe?.errors?.join(" \xB7 ")||qe?.message||V.message||"\u9001\u5BE9\u5931\u6557\u3002";L(I,"danger",8e3)}return}if(O==="restore"){if(!window.confirm(`\u78BA\u5B9A\u5FA9\u539F\u984C\u76EE #${oe}\uFF1F\u5FA9\u539F\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\u72C0\u614B\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002`))return;try{await F.restoreQuestionBankItem(oe),L("\u984C\u76EE\u5DF2\u5FA9\u539F\u4E26\u56DE\u5230\u5F85\u5BE9\u3002","ok"),await b(),await S()}catch(V){let qe=V.detail||V.payload?.detail,I=qe?.errors?.join(" \xB7 ")||qe?.message||V.message||"\u5FA9\u539F\u5931\u6557\u3002";L(I,"danger",8e3)}return}if(O==="delete"){if(r.tab==="suite"){let V=H();if(!V||!(V.items||[]).find(I=>Number(I.id)===oe)||!window.confirm(`\u78BA\u5B9A\u5F9E\u300C${V.name}\u300D\u79FB\u9664\u984C\u76EE #${oe}\uFF1F\u984C\u76EE\u4ECD\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u7BA1\u7406\u4E2D\u3002`))return;try{await F.removeBenchmarkSuiteItem(V.id,oe),L("\u5DF2\u5F9E Benchmark \u984C\u5EAB\u79FB\u9664\u3002","info"),delete r.suiteAnswers[String(V.id)],Number(r.selectedBankItemId)===oe&&(r.selectedBankItemId=null),await C()}catch(I){L(I.message||"\u79FB\u9664\u5931\u6557\u3002","danger")}return}if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${oe}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await F.deleteQuestionBankItem(oe),L("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await b(),r.tab==="review"?(r.reviewDetail=null,await T()):await S()}catch(V){L(V.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(O==="revalidate"){try{let V=await F.revalidateQuestionBank();L(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${c(V.checked||0)} \u984C\uFF0C${c(V.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await b(),await S()}catch(V){L(V.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(O==="export"){try{let V=await F.exportQuestionBank({status:""});$t(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(V,null,2),"application/json;charset=utf-8")}catch(V){L(V.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(O==="import-json"){let V=e.querySelector("#qb-import-json");try{let qe=JSON.parse(String(V?.value||"").trim()),I=await F.importQuestionBank(qe);L(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${I.created}\u3001\u66F4\u65B0 ${I.updated}\u3001\u932F\u8AA4 ${(I.errors||[]).length}\u3002`,(I.errors||[]).length?"warn":"ok",8e3),V&&(V.value=""),await b(),await S()}catch(qe){L(qe.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(O==="prev"||O==="next"){r.offset=Math.max(0,r.offset+(O==="next"?r.limit:-r.limit)),await S();return}if(O==="suite-edit"){let V=r.suites.find(qe=>Number(qe.id)===oe);if(!V)return;r.editingSuite=V,r.suiteManageOpen=!0,C();return}if(O==="suite-new"){r.editingSuite=null,r.suiteManageOpen=!0,C();return}if(O==="suite-freeze"){try{await F.updateBenchmarkSuite(oe,{freeze:!0}),L("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),r.editingSuite=null,r.suiteManageOpen=!0,await C()}catch(V){L(V.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(O==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${oe}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await F.deleteBenchmarkSuite(oe),L("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),r.editingSuite=null,r.suiteAnswers={},r.suiteManageOpen=!0,await C()}catch(V){L(V.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(O==="decide"){let V=U.closest("form[data-qb-form='review']");V&&await X(V,String(U.dataset.decision||""))}},je=async j=>{let R=j.target.closest("[data-qb-form]");if(!R)return;j.preventDefault();let O=R.dataset.qbForm;if(O==="create")await ue(R);else if(O==="ai-create")await ae(R);else if(O==="filter"){let U=new FormData(R);r.filters={query:String(U.get("query")||"").trim(),status:String(U.get("status")||""),question_type:String(U.get("question_type")||""),difficulty:String(U.get("difficulty")||""),tags:U.getAll("tags").map(oe=>String(oe).trim()).filter(Boolean)},r.offset=0,await S()}else O==="suite"&&await ge(R)},se=async j=>{let R=j.target.closest?.("form[data-qb-form='filter'] select");if(R){R.form.requestSubmit();return}let O=j.target.closest?.("[data-qb-suite-select]");if(!O)return;let U=Number(O.value||0);!U||U===Number(r.selectedSuiteId)||await we(U)},ce=j=>{let R=j.target;R?.matches?.(".qb-suite-manage")&&(r.suiteManageOpen=!!R.open)},ve=j=>{let R=j.target.closest?.("[data-qb-action='open-tag-search']");R&&B(R.closest("[data-qb-tag-filter]"))},Se=j=>{let R=j.target.closest?.("[data-qb-tag-filter]");R&&(j.relatedTarget&&R.contains(j.relatedTarget)||Q(R))},Be=j=>{let R=j.target.closest?.("[data-qb-tag-search]");if(!R)return;let O=R.closest("[data-qb-tag-filter]");p&&window.clearTimeout(p),p=window.setTimeout(()=>{A(O,R.value)},160)},De=j=>{let R=j.target.closest?.("[data-qb-tag-search]");if(!R)return;let O=R.closest("[data-qb-tag-filter]");j.key==="Escape"?(j.preventDefault(),Q(O),R.blur()):j.key==="Enter"?(j.preventDefault(),O?.querySelector("[data-qb-action='select-tag']")?.click()):j.key==="ArrowDown"&&(j.preventDefault(),O?.querySelector("[data-qb-action='select-tag']")?.focus())};e.addEventListener("click",_e),e.addEventListener("submit",je),e.addEventListener("change",se),e.addEventListener("toggle",ce,!0),e.addEventListener("mouseover",ve),e.addEventListener("mouseout",Se),e.addEventListener("input",Be),e.addEventListener("keydown",De);let Pe=async()=>{await b(),r.tab==="create"?h():r.tab==="manage"?await S():r.tab==="suite"?await C({refreshAnswers:!0}):r.tab==="review"&&await T()};return b(),{show:z,refresh:Pe,destroy(){p&&window.clearTimeout(p),e.removeEventListener("click",_e),e.removeEventListener("submit",je),e.removeEventListener("change",se),e.removeEventListener("toggle",ce,!0),e.removeEventListener("mouseover",ve),e.removeEventListener("mouseout",Se),e.removeEventListener("input",Be),e.removeEventListener("keydown",De)},getStats:()=>r.stats}}function Vs(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function jr(e){return e==null?"\u2014":c(e)}function nc(e){return e.count?e.severity==="danger"?Le("failed","\u9700\u8655\u7406"):e.severity==="warn"?Le("warning","\u6CE8\u610F"):Le("preview","\u63D0\u793A"):Le("success","\u901A\u904E")}function rc(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function ic(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${rc(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${n(e.label)}</span>
      ${nc(e)}
    </div>
    <div class="quality-check-value">
      <strong>${c(t)}</strong>
      <span>\u7B46</span>
      <em>${n(Vs(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${n(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function Js(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
      <div class="index-chart-head"><span>${n(e)}</span><span>${n(t)}</span></div>
      <div class="index-chart-empty">DuckDB \u6383\u63CF\u5F8C\u6C92\u6709\u53EF\u5448\u73FE\u7684\u8CC7\u6599\u3002</div>
    </div>`;let r=Math.max(...a.map(i=>Number(i.value)||0),1);return`<div class="index-chart-card">
    <div class="index-chart-head"><span>${n(e)}</span><span>${n(t)}</span></div>
    <div class="distribution">
      ${a.map(i=>{let o=Number(i.value)||0,l=Math.max(1.5,o/r*100);return`<div class="dist-row">
            <span class="dist-label" title="${n(i.label||"\u672A\u5206\u985E")}">${n(i.label||"\u672A\u5206\u985E")}</span>
            <span class="dist-track"><span class="dist-bar" style="width:${l.toFixed(2)}%"></span></span>
            <span class="dist-value">${c(o)}</span>
          </div>`}).join("")}
    </div>
  </div>`}function oc(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},r=t.postgres_diff,i=r==null?"\u2014":r===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${c(Math.abs(r))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${c(t.vector_indexed)} / ${c(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${m("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${c(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${c(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${jr(t.postgres_judgments)}</div>
      <div class="metric-foot">${n(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${n(Vs(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${n(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${jr(a.candidate_total)}</div>
      <div class="metric-foot">${c(a.candidate_archive_count)} / ${c(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function lc(e){return e.length?`<div class="table-wrap">
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
                <span class="mono">${n(t.archive||"\u2014")}</span>
                ${t.version?`<span class="chip">v${n(t.version)}</span>`:""}
              </td>
              <td class="cell-number">${c(t.rows)}</td>
              <td class="cell-number">${a}</td>
              <td class="cell-number">${c(t.matched_rows)}</td>
              <td class="cell-number">${n(Vs(t.match_rate))}</td>
              <td class="cell-number">${c(t.short_text_rows)}</td>
              <td class="cell-number">${c(s)}</td>
              <td class="cell-number">${c(t.duplicate_content_rows)}</td>
              <td class="cell-date">${n(vt(t.date_min))} \u2013 ${n(vt(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:Ke({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function cc(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],r=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=be(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${Le(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${c(t.rows)} \u7B46 \xB7 ${c(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${ie(e.scan_ms||0)} \xB7
          ${n($e(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${m("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${ye({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(d=>n(d)).join("<br>")})}</div>`:""}
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
        <div class="summary-value">${n(Vs(t.match_rate))}</div>
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
          ${c(r.ok_count)} \u9805\u901A\u904E \xB7
          ${c(r.warning_count)} \u9805\u6CE8\u610F \xB7
          ${c(r.danger_count)} \u9805\u9700\u8655\u7406 \xB7
          ${c(r.info_count)} \u9805\u63D0\u793A
        </span>
      </div>
      <div class="quality-checks">${a.map(ic).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${oc(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${c(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${lc(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${Js("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${Js("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${Js("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${Js("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function dc(e){e.innerHTML=`<section class="page data-page quality-page">
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),r=[...e.querySelectorAll("[data-quality-tab]")],i={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},o=null,l="overview",d=()=>{if(!o)return;t.innerHTML=cc(o),a.textContent=`DUCKDB \xB7 ${c(o.totals?.rows)} \u7B46 \xB7 ${ie(o.scan_ms||0)}`;let h=e.querySelector("#quality-badge-overview");h&&(h.textContent=c(o.totals?.rows||0))},p=h=>{l=h==="overview"?"overview":h;for(let w of r){let A=w.dataset.qualityTab===l;w.classList.toggle("is-active",A),A?w.setAttribute("aria-current","page"):w.removeAttribute("aria-current")}for(let[w,A]of Object.entries(i))A&&(A.hidden=w!==l);l!=="overview"?a.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":o&&d()},v=Ar(e,{onNavigate:h=>p(h),onStats:h=>{let w=h||{},A=e.querySelector("#quality-badge-manage"),B=e.querySelector("#quality-badge-suite"),Q=e.querySelector("#quality-badge-review");A&&(A.textContent=c(w.total||0)),B&&(B.textContent=c(w.benchmark_ready||0)),Q&&(Q.textContent=c((w.pending_review||0)+(w.changes_requested||0)))}}),k=h=>{p(h),h!=="overview"&&v.show(h)},$=async()=>{pe(s,!0,"\u6383\u63CF\u4E2D\u2026");try{o=await F.quality(),d()}catch(h){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${ye({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:n(h.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",L("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{pe(s,!1)}},b=async()=>{l==="overview"?await $():await v.refresh()};s.addEventListener("click",b),e.addEventListener("click",h=>{let w=h.target.closest("[data-quality-tab]");w&&k(w.dataset.qualityTab||"overview")}),t.addEventListener("click",h=>{!h.target.closest("[data-action='export-quality']")||!o||$t(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(o,null,2),"application/json;charset=utf-8")}),p("overview"),await $()}var za={};It(za,{render:()=>Dc});var Ws={};It(Ws,{render:()=>Ha});var Lr={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function Mr(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${n(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${n(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function uc(e){let t=e?.supports_chat,s=t===!0?"badge-ok":t===!1?"badge-danger":"badge-neutral",a=t===!0?"\u652F\u63F4 chat":t===!1?"\u4E0D\u652F\u63F4 chat":"\u672A\u6E2C\u8A66",r=(Array.isArray(e?.capabilities)?e.capabilities:[]).map(i=>`<span class="chip chip-mono">${n(i)}</span>`).join("");return`<div class="tests-llm-row">
    <div class="tests-llm-model">
      <strong class="mono">${n(e?.model||"\u2014")}</strong>
      <small>${n(e?.detail||"")}</small>
    </div>
    <div class="tests-llm-meta">
      <span class="badge ${s}">${a}</span>
      ${e?.tested_now?'<span class="badge badge-info">\u672C\u6B21\u65B0\u6E2C</span>':""}
      ${r}
      <span class="tests-llm-time">${e?.tested_at?`\u6E2C\u8A66\u65BC ${n($e(e.tested_at))}`:"\u5C1A\u7121\u6E2C\u8A66\u7D00\u9304"}</span>
    </div>
  </div>`}function pc(e){let t=Array.isArray(e?.models)?e.models:[],s=e?.counts||{},a=Array.isArray(e?.failures)?e.failures:[];return{summary:e?`<span>Ollama <strong>${s.available??t.length}</strong> \u500B\u6A21\u578B</span>
      <span>\u652F\u63F4 chat <strong>${s.chat??0}</strong></span>
      <span>\u4E0D\u652F\u63F4 <strong>${s.unsupported??0}</strong></span>
      <span>\u672A\u6E2C\u8A66 <strong>${s.untested??0}</strong></span>
      <span>\u672C\u6B21\u65B0\u6E2C <strong>${(e.tested_now||[]).length}</strong></span>
      <span class="muted">${n(e.detail||"")}</span>`:"<span>\u6B63\u5728\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u2026</span>",list:t.length?t.map(uc).join(""):'<div class="tests-llm-empty">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u8ACB\u78BA\u8A8D Ollama \u5DF2\u555F\u52D5\u4E26\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66\u3002</div>',failures:a.length?`<div class="tests-llm-failures">${a.map(i=>`<span><strong class="mono">${n(i.model||"\u2014")}</strong> ${n(i.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function mc(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,total_ms:e.total_ms,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}:${a.duration_ms}`)}:null})}async function Ha(e,t,{embedded:s=!1}={}){let a=!1,r=!1,i={embedding:[],llm:[]},o=!1,l=null,d=!1,p=null,v=[],k="",$=null,b="",h=`<div class="page-actions">
      <span class="badge badge-neutral badge-mono" id="tests-mode-badge">\u8B80\u53D6\u4E2D</span>
      <button class="btn btn-secondary" type="button" id="tests-refresh">
        ${m("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
      </button>
    </div>`,w=s?`<div class="tests-embed-head">
        <div>
          <div class="eyebrow">SYSTEM TEST</div>
          <div class="tests-embed-title">\u7CFB\u7D71\u6E2C\u8A66</div>
          <div class="tests-embed-copy">\u5F8C\u7AEF API \u9023\u7DDA\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u591A\u6A21\u578B\u6E2C\u8A66 Flow\u3002\u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207\u5177\u5099 chat \u80FD\u529B\u7684 LLM \u6A21\u578B\u3002</div>
        </div>
        ${h}
      </div>`:`<div class="page-header">
      <div>
        <div class="eyebrow">SYSTEM TEST</div>
        <h1 class="page-title">\u7CFB\u7D71\u6E2C\u8A66</h1>
        <p class="page-subtitle">\u5408\u4F75\u5F8C\u7AEF API \u9023\u7DDA\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u591A\u6A21\u578B\u6E2C\u8A66 Flow\u3002
          \u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207\u5177\u5099 chat \u80FD\u529B\u7684 LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002</p>
      </div>
      ${h}
    </div>`;e.innerHTML=`<section class="${s?"tests-page tests-page-embedded":"page tests-page"}">
    ${w}

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

    <div id="tests-flow"></div>
  </section>`;let A=e.querySelector("#tests-mode-badge"),B=e.querySelector("#tests-mode-toggle"),Q=e.querySelector("#tests-mode-summary"),D=e.querySelector("#tests-mode-models"),H=e.querySelector("#tests-mode-status"),te=e.querySelector("#tests-api-form"),de=e.querySelector("#tests-api-input"),ke=e.querySelector("#tests-api-preview"),we=e.querySelector("#tests-api-status"),W=e.querySelector("#tests-api-note"),E=e.querySelector("#tests-api-test"),S=e.querySelector("#tests-api-reset"),C=e.querySelector("#tests-api-save"),ee=e.querySelector("#tests-refresh"),re=e.querySelector("#tests-flow"),T=e.querySelector("#tests-llm-summary"),z=e.querySelector("#tests-llm-list"),Y=e.querySelector("#tests-llm-failures"),ue=e.querySelector("#tests-llm-status"),ae=e.querySelector("#tests-llm-test"),X=(I,me,Me="")=>{I&&(I.textContent=me,I.className=`tests-status${Me?` is-${Me}`:""}`)},ge=(I,me="")=>{we&&(we.textContent=I,we.className=`api-dialog-status${me?` is-${me}`:""}`)},_e=()=>Mt()==="query",je=()=>{let I=jt(de.value);return I||(window.location.protocol==="file:"?sa:"")},se=()=>{let I=je(),me=Lt(),Me=Lr[Mt()]||Mt()||"\u540C\u6E90";ke.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${n(Ot(me))}</strong>${me?`\uFF08${n(Me)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${n(st("/api/health",I))}`},ce=()=>{let I=Mt(),me=`\u76EE\u524D\u4F86\u6E90\uFF1A${Lr[I]||I||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,Me="";I==="query"?(Me="is-warn",me="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):qs()?(Me="is-warn",me="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(I==="file-default"||window.location.protocol==="file:")&&(me="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),W.textContent=me,W.className=`api-dialog-note${Me?` ${Me}`:""}`;let Ie=I==="query";C.disabled=Ie,S.disabled=Ie,de.readOnly=Ie},ve=()=>{if(!aa(de.value))return ge("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),de.focus(),null;let I=je();return window.location.protocol==="https:"&&/^http:\/\//i.test(I)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(I)?(ge("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),de.focus(),null):I},Se=()=>{de.value=Lt(),se(),ce(),ge("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},Be=()=>{let I=Array.isArray(i.embedding)?i.embedding.length:0,me=Array.isArray(i.llm)?i.llm.length:0;if(A&&(A.textContent=o?"\u5207\u63DB\u4E2D\u2026":r?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",A.className=`badge badge-mono ${o?"badge-info":r?"badge-warn":"badge-neutral"}`),B){B.disabled=o,B.classList.toggle("is-on",r),B.classList.toggle("is-off",!r&&!o),B.classList.toggle("is-busy",o),B.setAttribute("aria-checked",r?"true":"false"),B.setAttribute("aria-busy",o?"true":"false"),B.setAttribute("aria-label",o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":r?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),B.title=o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":r?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let Me=B.querySelector(".header-power-label");Me&&(Me.textContent=o?"\u2026":r?"ON":"OFF")}Q&&(Q.textContent=r?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${I} \u500B embedding \u8207 ${me} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),D&&(D.innerHTML=Mr("Embedding",i.embedding)+Mr("LLM",i.llm))},De=async()=>{try{let I=await F.testMode();if(a)return;r=!!I.enabled,i=I.models||{embedding:[],llm:[]},X(H,"")}catch(I){if(a)return;r=!1,i={embedding:[],llm:[]},X(H,I.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}a||Be()},Pe=async()=>{if(o)return;let I=!r;o=!0,Be(),X(H,I?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let me=await F.setTestMode(I);if(a)return;r=!!me.enabled,i=me.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:r,models:i}}));let Me=i.embedding?.length||0,Ie=i.llm?.length||0;X(H,r?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${Me} \u500B embedding \u8207 ${Ie} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),L(r?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${Me} \u500B embedding\u3001${Ie} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",r?"ok":"info",6e3),await V()}catch(me){a||(X(H,me.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),L(me.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{o=!1,a||Be()}},j=()=>{let I=pc(l);if(T&&(T.innerHTML=I.summary),z&&(z.innerHTML=I.list),Y&&(Y.innerHTML=I.failures),ae){ae.disabled=d,ae.setAttribute("aria-busy",d?"true":"false");let me=ae.querySelector("span");me&&(me.textContent=d?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66")}},R=async()=>{try{let I=await F.llmModels();if(a)return;l=I,X(ue,"")}catch(I){if(a)return;l=null,X(ue,I.message||"\u7121\u6CD5\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u3002","error")}a||j()},O=async()=>{if(!d){d=!0,j(),X(ue,"\u6B63\u5728\u6AA2\u67E5 Ollama \u6A21\u578B\u8207 chat \u80FD\u529B\u2026");try{let I=await F.testLlmModels();if(a)return;l=I;let me=I.tested_now?.length||0,Me=I.chat_models?.length||0,Ie=I.failures?.length||0;X(ue,`${me?`\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u672C\u6B21\u65B0\u6E2C ${me} \u500B\u6A21\u578B`:"\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u6C92\u6709\u65B0\u6A21\u578B"}\uFF0C\u76EE\u524D ${Me} \u500B\u6A21\u578B\u652F\u63F4 chat${Ie?`\uFF1B${Ie} \u500B\u6A21\u578B\u66AB\u6642\u7121\u6CD5\u5224\u5B9A\uFF0C\u4E0B\u6B21\u6703\u91CD\u8A66`:""}\u3002`,Ie?"warn":"ok"),L(me?`LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u65B0\u589E ${me} \u7B46\u80FD\u529B\u7D00\u9304\u3002`:"LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u6C92\u6709\u65B0\u6A21\u578B\u9700\u8981\u6E2C\u8A66\u3002",Ie?"warn":"ok",5e3),await De()}catch(I){a||(X(ue,I.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),L(I.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{d=!1,a||j()}}},U=()=>{if(!re)return;let I=mc(p,v,k);I!==b&&(b=I,re.innerHTML=is(p,v,k))},oe=async()=>{try{let I=await F.testRuns(30);if(a)return;v=Array.isArray(I.runs)?I.runs:[]}catch{if(a)return;v=[]}},V=async()=>{try{let I=k?await F.testRun(k):await F.testRunCurrent();if(a)return;p=I.run||null,!k&&p&&p.status!=="running"&&!v.some(me=>me.run_id===p.run_id)&&await oe()}catch{if(a)return;p=null}a||U()};de?.addEventListener("input",()=>{se(),ge("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),E?.addEventListener("click",async()=>{let I=ve();if(I!==null){pe(E,!0,"\u6E2C\u8A66\u4E2D\u2026"),ge(`\u6B63\u5728\u9023\u7DDA\u5230 ${Ot(I)||"\u540C\u6E90"}\u2026`);try{let me=await Ka(I);if(a)return;ge(`\u9023\u7DDA\u6210\u529F \xB7 v${me.version} \xB7 ${me.duration_ms} ms \xB7 GET ${st("/api/health",I)}`,"ok")}catch(me){a||ge(me.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{a||pe(E,!1)}}}),te?.addEventListener("submit",I=>{if(I.preventDefault(),_e())return;let me=ve();me!==null&&(oa(me),L(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${Ot(me)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),S?.addEventListener("click",()=>{_e()||(oa(""),L("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),B?.addEventListener("click",Pe),ae?.addEventListener("click",O),re?.addEventListener("change",async I=>{I.target.id==="test-run-select"&&(k=String(I.target.value||""),await V())}),re?.addEventListener("click",async I=>{I.target.closest("#test-flow-refresh")&&(k="",await oe(),await V())}),ee?.addEventListener("click",async()=>{pe(ee,!0,"\u66F4\u65B0\u4E2D\u2026"),Se(),await Promise.allSettled([De(),oe(),R()]),a||await V(),a||(pe(ee,!1),L("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let qe=I=>{r=!!I.detail?.enabled,i=I.detail?.models||{embedding:[],llm:[]},Be()};return window.addEventListener("judgment:test-mode",qe),Se(),Be(),j(),await Promise.allSettled([De(),oe(),R()]),await V(),$=window.setInterval(async()=>{a||document.hidden||k||await V()},2500),!s&&typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{a=!0,$&&window.clearInterval($),window.removeEventListener("judgment:test-mode",qe)}}var Tr={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var Cr={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},Rr=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"tests",label:"\u7CFB\u7D71\u6E2C\u8A66",hint:"API\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u6A21\u578B Flow",icon:"terminal"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"local-model",label:"Model Provider",hint:"Ollama \u4E3B\u6A5F\u8207\u6A21\u578B",icon:"server"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 Data \u2192 AI",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}];function gc(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:ht(e).label,tone:ht(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function fc(e){let t=ht(e.status),s=Tr[e.kind]||Tr.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${c(e.latency_ms)} ms</span>`;return`<article class="service-card">
    <div class="service-top">
      <span class="service-icon">${m(s,14)}</span>
      <span class="service-name" title="${n(e.name)}">${n(e.name)}</span>
      <span class="service-kind">${n(e.kind||"")}</span>
    </div>
    <div class="service-status">
      <span class="status-dot ${t.tone==="ok"?"is-ok":t.tone==="warn"?"is-warn":t.tone==="danger"?"is-danger":"is-idle"}" aria-hidden="true"></span>
      ${n(t.label)}
      ${a}
    </div>
    <p class="service-detail" title="${n(e.detail||"")}">${n(e.detail||"")}</p>
  </article>`}function bc(e,t){return`<div class="arch-node ${e?"":"is-muted"}" ${e?"":'title="\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"'}>${n(t)}</div>`}function vc(e,t){if(e==="IndexedDB")return sn();let a={PostgreSQL:"postgres",Parquet:"parquet",Qdrant:"qdrant",Embedding:"embedding",Retriever:"rag","RAG Engine":"rag",LLM:"llm"}[e];return a?t.find(i=>i.id===a)?.status==="operational":!0}function hc(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>bc(vc(l,t),l)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${n(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),r=[];return a.forEach((i,o)=>{o&&r.push(`<div class="arch-arrow" aria-hidden="true">${m("arrowRight",15)}</div>`),r.push(i)}),`<div class="arch-flow">${r.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${m("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>`}function $c(e){return!Array.isArray(e)||!e.length?'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>':`<div class="endpoint-list">
    ${e.map(t=>`<div class="endpoint-row">
          <span class="endpoint-method">${n(t.method)}</span>
          <span class="endpoint-path" title="${n(t.path)}">${n(t.path)}</span>
          <span class="endpoint-label">${n(t.label||"")}</span>
        </div>`).join("")}
  </div>`}function Ee(e,t){return`<div class="detail-row">
    <span class="detail-label">${n(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function yc(e){return e?`<div class="detail-list">
    ${Ee("\u7248\u672C ID",`<strong>#${c(e.id)}</strong>`)}
    ${Ee("\u8CC7\u6599\u985E\u578B",Le("operational",e.source_type==="law"?"\u6CD5\u898F":"\u547D\u4EE4"))}
    ${Ee("\u4F86\u6E90\u66F4\u65B0\u65E5",`<strong>${n(e.update_date||"\u2014")}</strong>`)}
    ${Ee("\u6CD5\u898F / \u689D\u6587",`<strong>${c(e.law_count)} / ${c(e.article_count)}</strong>`)}
    ${Ee("\u4E0B\u8F09\u6642\u9593",`<span class="mono">${$e(e.downloaded_at)}</span>`)}
    ${Ee("Parquet",`<code title="${n(e.parquet_path||"")}">${n(e.parquet_path||"\u2014")}</code>`)}
  </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}function wc(e){if(!Array.isArray(e)||!e.length)return Ke({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${n(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${js(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function _c(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=new Map(s.map(w=>[w.id,w])),r=a.get("qdrant"),i=a.get("embedding"),o=a.get("rag"),l=a.get("llm"),d=Number(t.judgment_indexed_count||0),p=Number(t.judgment_count||0),v=p?(d/p*100).toFixed(1):"0.0",k=t.judgment_vector_points===null||t.judgment_vector_points===void 0?"\u2014":c(t.judgment_vector_points),$=Number(t.judgment_index_remaining||0),b=o?.status==="operational"?"RAG \u5C31\u7DD2":o?.status==="not_configured"?"\u672A\u8A2D\u5B9A":o?.status==="degraded"?"\u964D\u7D1A":"\u672A\u77E5",h=[["cube","Qdrant \u5411\u91CF\u7D22\u5F15",r],["layers",`Embedding\uFF08${t.judgment_vector_model||"\u2014"}\uFF09`,i],["brain","RAG \u56DE\u7B54\u7BA1\u7DDA",o],["sparkles","LLM \u6A21\u578B",l]];return`<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}RAG \u8CC7\u6599\u73FE\u6CC1</span>
      ${Le(o?.status,b)}
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
          <div class="mini-stat-value">${v}%</div>
          <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
        </div>
      </div>
      <div class="side-status-list">
        ${h.map(([w,A,B])=>`<div class="side-status-row">
              <span>${m(w,13)}${n(A)}</span>
              ${Le(B?.status,B?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
            </div>`).join("")}
      </div>
      <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
        Collection\uFF1A${n(t.judgment_vector_collection||"\u2014")} \xB7
        ${k} points \xB7 \u5269\u9918 ${c($)} \u7B46\u5F85\u7D22\u5F15
      </div>
    </div>
    <div class="side-card-foot">
      PostgreSQL \u5224\u6C7A\u6587\u4EF6\u3001Qdrant \u5411\u91CF\u7D22\u5F15\u8207 Ollama \u6A21\u578B\u72C0\u614B\u7686\u70BA\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u5C31\u7DD2\u6642\u6703\u660E\u78BA\u964D\u7D1A\u3002
    </div>
  </section>`}function kc(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=gc(e.status),r=s.find(p=>p.id==="qdrant"),i=s.find(p=>p.id==="rag"),o=s.find(p=>p.id==="llm"),l=Mt(),d=Cr[l]||l;return`<section class="status-hero">
      <div class="status-hero-main">
        <div class="overall-row">
          <span class="overall-badge ${a.tone==="warn"?"is-warn":a.tone==="danger"?"is-danger":""}">
            <span class="status-dot ${a.tone==="ok"?"is-ok":a.tone==="warn"?"is-warn":"is-danger"}" aria-hidden="true"></span>
            ${n(a.label)}
          </span>
          <span class="badge badge-neutral badge-mono">v${n(e.version||"\u2014")}</span>
          <span class="badge badge-neutral badge-mono">${n(e.environment||"\u2014")}</span>
        </div>
        <h2 class="status-headline">${n(a.headline)}</h2>
        <p class="status-copy">${n(a.copy)}</p>
        <div class="status-meta">
          <span>${m("clock",11)} \u6AA2\u67E5\u6642\u9593 ${$e(e.checked_at)} \xB7 ${n(ts(e.checked_at))}</span>
          <span>${m("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${m("database",11)} ${c(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${m("layers",11)} ${c(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${n(d)}">${m("link",11)} ${n(Ot())}</span>
        </div>
      </div>
    </section>

    <div class="service-grid">${s.map(fc).join("")}</div>

    ${_c(e)}

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

    ${r?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${ye({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${n(r?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${n(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${n(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}`}function Sc(e){let t=Array.isArray(e.services)?e.services:[],s=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Data \u2192 Intelligence</div>
      </div>
      <span class="badge badge-neutral badge-mono">${c((s.flow||[]).length)} layers</span>
    </div>
    ${hc(s,t)}
  </div>`}function xc(e){let t=Mt(),s=Cr[t]||t,a=st("/api/docs"),r=st("/api/openapi.json");return`<div class="status-columns is-single">
    <section class="card">
      <div class="side-card-head">
        <span class="side-card-title">${m("terminal",14)}API \u7AEF\u9EDE</span>
        <a href="${n(a)}" target="_blank" rel="noopener noreferrer" class="chip"
          >OpenAPI ${m("external",11)}</a>
      </div>
      ${$c(e.endpoints)}
      <div class="side-card-foot">
        \u76EE\u524D API Base\uFF1A<code>${n(Ot())}</code>\uFF08${n(s)}\uFF09\u3002\u4E92\u52D5\u5F0F API \u6587\u4EF6\u4F4D\u65BC <a href="${n(a)}" target="_blank" rel="noopener noreferrer"><code>${n(a)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${n(r)}" target="_blank" rel="noopener noreferrer"><code>${n(r)}</code></a>\u3002
      </div>
    </section>
  </div>`}function qc(e){let t=e.data||{},s=Number(t.judgment_indexed_count||0),a=Number(t.judgment_count||0),r=a?(s/a*100).toFixed(1):"0.0",i=Number(t.judgment_index_remaining||0);return`<div class="status-summary">
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
        <div class="metric-label">\u5224\u6C7A\u7D22\u5F15</div>
        <div class="metric-value">${c(t.judgment_indexed_count)}</div>
        <div class="metric-foot">/ ${c(t.judgment_count)} \u7B46\u5224\u6C7A \xB7 \u8986\u84CB ${r}%</div>
      </div>
    </div>
    <div class="status-columns is-single">
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${m("layers",14)}\u6700\u65B0\u8CC7\u6599\u7248\u672C</span>
          ${Le("operational","Parquet")}
        </div>
        ${yc(t.last_version)}
        <div class="side-card-foot">
          \u539F\u59CB Parquet \u5408\u8A08 ${be(t.parquet_bytes)}\uFF1BPostgreSQL \u4FDD\u5B58 metadata \u8207\u7248\u672C\u72C0\u614B\u3002
        </div>
      </section>
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${m("database",14)}\u8CC7\u6599\u96C6\u7D71\u8A08</span>
          <span class="badge badge-neutral badge-mono">${c(t.parquet_files)} FILES</span>
        </div>
        <div class="detail-list">
          ${Ee("\u73FE\u884C\u6CD5\u898F",`<strong>${c(t.law_count)}</strong>`)}
          ${Ee("\u73FE\u884C\u547D\u4EE4",`<strong>${c(t.order_count)}</strong>`)}
          ${Ee("\u689D\u6587\u7E3D\u6578",`<strong>${c(t.article_count)}</strong>`)}
          ${Ee("\u539F\u59CB Parquet",`<strong>${be(t.parquet_bytes)}</strong>`)}
          ${Ee("\u5224\u6C7A\u6587\u4EF6",`<strong>${c(t.judgment_count)}</strong>`)}
          ${Ee("\u5411\u91CF\u7D22\u5F15",`<strong>${c(t.judgment_indexed_count)}</strong> / ${c(t.judgment_count)}\uFF08${c(t.judgment_vector_points)} points\uFF09`)}
          ${Ee("\u7D22\u5F15\u8986\u84CB",`<strong>${r}%</strong> \xB7 \u5269\u9918 ${c(i)} \u7B46`)}
          ${Ee("\u7D22\u5F15\u7248\u672C",`<strong>#${c(t.judgment_vector_version_id)}</strong> \xB7 ${n(t.judgment_vector_version_status||"legacy")}`)}
          ${Ee("Alias",`<code>${n(t.judgment_vector_alias||"\u2014")}</code> \u2192 <code>${n(t.judgment_vector_collection||"\u2014")}</code>`)}
          ${Ee("\u7D22\u5F15\u6A21\u578B",`<code>${n(t.judgment_vector_model||"\u2014")}</code>`)}
          ${Ee("\u6700\u8FD1\u7D22\u5F15",`<span class="mono">${$e(t.judgment_indexed_at)}</span>`)}
        </div>
      </section>
    </div>`}function Ac(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${c(t.run_count)} TOTAL</span>
    </div>
    ${wc(e.recent_runs)}
  </section>`}function jc(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function Pr(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function Ut(e,t,s,a,r){let i=jc(r);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${m(t,14)}${n(e)}</span>
      <strong>${n(s)}</strong>
    </div>
    ${Pr(r,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function Lc(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${m("layers",14)}Docker</span>
        ${Le("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${n(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,d=o.service?0:1;return l-d||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${n(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${n(i.service)}</span>`:""}</td>
        <td>${Le(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
        <td class="cell-number">${i.cpu_percent===null||i.cpu_percent===void 0?"\u2014":`${c(i.cpu_percent)}%`}</td>
        <td class="cell-number">${be(i.memory_used)}${i.memory_limit?` / ${be(i.memory_limit)}`:""}</td>
        <td class="mono">${n(i.net_io||"\u2014")}</td>
        <td class="mono">${n(i.block_io||"\u2014")}</td>
        <td class="cell-number">${c(i.pids)}</td>
      </tr>`).join(""),r=(t.system||[]).map(i=>`<span class="resource-docker-pill">
        <strong>${n(i.type||"\u2014")}</strong>
        <span>${c(i.count)} \xB7 ${n(i.size||"\u2014")}</span>
      </span>`).join("");return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("layers",14)}Docker \u5BB9\u5668\u4F7F\u7528\u8CC7\u6E90</span>
      <span class="badge badge-ok badge-mono">${c(s.length)} \u500B\u5BB9\u5668</span>
    </div>
    ${r?`<div class="resource-docker-system">${r}</div>`:""}
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
    <div class="side-card-foot">${n(t.detail||"Docker \u8CC7\u6E90\u7D71\u8A08")}</div>
  </section>`}function Mc(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",r=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${Ee("\u8CC7\u6599\u5EAB",`<code>${n(s.database||"\u2014")}</code>`)}
           ${Ee("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${be(s.storage_bytes)}</strong>`)}
           ${Ee("Docker volume",`<strong>${be(s.volume_bytes)}</strong>${s.volume_name?` <code>${n(s.volume_name)}</code>`:""}`)}
           ${Ee("\u9023\u7DDA\u6578",`<strong>${c(s.connections)}</strong>`)}`:`${Ee("Collection",`<code>${n(s.collection||"\u2014")}</code>`)}
           ${Ee("Docker volume",`<strong>${be(s.volume_bytes)}</strong>${s.volume_name?` <code>${n(s.volume_name)}</code>`:""}`)}
           ${Ee("\u5411\u91CF\u9EDE\u6578",`<strong>${c(s.points_count)}</strong>`)}
           ${Ee("Collections",`<strong>${c(s.collections)}</strong>`)}
           ${Ee("Segments",`<strong>${c(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${n(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${n(s.kind||"")}</div>
          </div>
          ${Le(i)}
        </div>
        <div class="resource-db-metrics">
          <div><span>CPU</span><strong>${s.cpu_percent===null||s.cpu_percent===void 0?"\u2014":`${c(s.cpu_percent)}%`}</strong></div>
          <div><span>RAM</span><strong>${be(s.memory_used)}</strong><small>${s.memory_limit?` / ${be(s.memory_limit)}`:""}</small></div>
          <div><span>\u5BB9\u5668</span><strong class="mono">${n(s.container||"\u2014")}</strong><small>${n(s.container_status||"\u2014")}</small></div>
        </div>
        <div class="detail-list">${o}</div>
        ${r.length?`<div class="resource-table-wrap">
                <table class="data-table is-compact">
                  <thead><tr><th scope="col">\u8CC7\u6599\u8868</th><th scope="col">\u5927\u5C0F</th></tr></thead>
                  <tbody>${r.map(l=>`<tr>
                        <td class="mono">${n(l.name||"\u2014")}</td>
                        <td class="cell-number">${be(l.bytes)}</td>
                      </tr>`).join("")}</tbody>
                </table>
              </div>`:""}
        <div class="side-card-foot">${n(s.detail||"")}</div>
      </article>`}).join("")}</div>`}function ls(e,t,s,a){let r=Number(t)||0,i=a?r/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${n(e)}</span>
      <strong>${be(r)}</strong>
    </div>
    ${Pr(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function Tc(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},r=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},d=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${be(d)}</span>
    </div>
    <div class="storage-list">
      ${ls("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${n(s.frontend_path||"\u2014")}</span>`,d)}
      ${ls("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${n(s.backend_path||"\u2014")}</span>`,d)}
      ${ls("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",r.layers_bytes,`Images ${be(r.images_bytes)} \xB7 Containers ${be(r.containers_bytes)} \xB7 Build cache ${be(r.build_cache_bytes)}`,d)}
      ${ls("PostgreSQL volume",o.size_bytes,`<span class="mono">${n(o.name||"\u2014")}</span>`,d)}
      ${ls("Qdrant volume",l.size_bytes,`<span class="mono">${n(l.name||"\u2014")}</span>`,d)}
      ${ls("Parquet",a.total_bytes,`\u6CD5\u898F ${be(a.law_bytes)} \xB7 \u5224\u6C7A ${be(a.judgment_bytes)}`,d)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${be(d)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function Ec(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},r=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),d=Array.isArray(e.disk)?e.disk:[],p=d[0]||{},v=Number(o.total_bytes||p.total||0),k=v?l/v*100:0,$=[s.load_1,s.load_5,s.load_15].map(w=>w??"\u2014").join(" / "),b=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":ie(Number(t.uptime_seconds)*1e3),h=[p.label?Ut("HDD \u5DF2\u4F7F\u7528","database",`${c(p.percent)}%`,`${be(p.used)} / ${be(p.total)} \xB7 \u5269\u9918 ${be(p.free)}<br><span class="mono">${n(p.path||"")}</span>`,p.percent):"",l?Ut("Judgment \u5143\u4EF6\u5408\u8A08","layers",be(l),`\u7D04\u5360 HDD ${c(k)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,k):"",...d.slice(1).map(w=>Ut(`\u786C\u789F \xB7 ${w.label}`,"layers",`${c(w.percent)}%`,`${be(w.used)} / ${be(w.total)} \xB7 \u5269\u9918 ${be(w.free)}<br><span class="mono">${n(w.path||"")}</span>`,w.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${$e(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${Ut("CPU \u4F7F\u7528\u7387","cpu",`${c(s.percent)}%`,`${c(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${c(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${n($)}`,s.percent)}
      ${Ut("\u8A18\u61B6\u9AD4","server",`${c(a.percent)}%`,`${be(a.used)} / ${be(a.total)} \xB7 \u53EF\u7528 ${be(a.available)}`,a.percent)}
      ${Ut("Swap","layers",`${c(r.percent)}%`,`${be(r.used)} / ${be(r.total)}`,r.percent)}
      ${Ut("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${c(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${n(b)}<br>${n(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${h||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${Tc(e)}
    ${Lc(e)}
    ${Mc(e)}`}function Er(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function Nc(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SYSTEM RESOURCE USAGE</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${ye({tone:"danger",title:"\u8CC7\u6E90 API \u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-resources-retry">
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Cc(e){return e.status==="operational"?{label:"\u5DF2\u9023\u7DDA",badge:"badge-ok"}:{label:"\u7121\u6CD5\u9023\u7DDA",badge:"badge-danger"}}function Rc(e,t){let s=Cc(e),a=Array.isArray(e.models)?e.models:[],r=a.length?a.map(i=>{let o=String(i.name||""),l=e.chat_model===o,d=e.embedding_model===o,p=i.size?be(i.size):"",v=i.modified_at?$e(i.modified_at):"",k=new Set((i.capabilities||[]).map(b=>String(b||"").toLowerCase())),$=[];return i.supports_chat===!0&&$.push(["Chat","badge-ok"]),k.has("embedding")&&$.push(["Embedding","badge-info"]),k.has("vision")&&$.push(["Vision","badge-neutral"]),k.has("tools")&&$.push(["Tools","badge-neutral"]),k.has("thinking")&&$.push(["Thinking","badge-neutral"]),k.has("speech")&&$.push(["Speech","badge-warn"]),i.is_reranker&&$.push(["Reranker","badge-neutral"]),$.length||$.push([i.capability_status==="untested"?"\u672A\u6E2C\u8A66":"\u7121 chat \u80FD\u529B","badge-neutral"]),`<div class="ollama-model-row">
            <div class="ollama-model-main">
              <strong>${n(o)}</strong>
              <span class="ollama-model-meta">${[p,v].filter(Boolean).map(b=>n(b)).join(" \xB7 ")||"\u2014"}</span>
              <div class="ollama-model-capabilities">${$.map(([b,h])=>`<span class="badge ${h}">${n(b)}</span>`).join("")}</div>
            </div>
            <div class="ollama-model-roles">
              ${l?'<span class="badge badge-ok">\u804A\u5929</span>':""}
              ${d?'<span class="badge badge-ok">\u5D4C\u5165</span>':""}
            </div>
            <div class="ollama-model-actions">
              <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="${l?"clear-model":"select-model"}" data-id="${e.id}" data-model="${n(o)}" data-role="chat">
                ${l?"\u65B7\u958B\u804A\u5929":"\u9023\u63A5\u804A\u5929"}
              </button>
              <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="${d?"clear-model":"select-model"}" data-id="${e.id}" data-model="${n(o)}" data-role="embedding">
                ${d?"\u65B7\u958B\u5D4C\u5165":"\u9023\u63A5\u5D4C\u5165"}
              </button>
            </div>
          </div>`}).join(""):`<div class="ollama-empty">${e.status==="operational"?"\u6B64\u4E3B\u6A5F\u6C92\u6709\u53EF\u7528\u6A21\u578B\u3002":"\u7121\u6CD5\u53D6\u5F97\u6A21\u578B\u5217\u8868\uFF0C\u8ACB\u78BA\u8A8D\u4E3B\u6A5F\u72C0\u614B\u3002"}</div>`;return`<article class="ollama-host-card${e.is_active?" is-active":""}">
    <div class="ollama-host-head">
      <div class="ollama-host-title">
        <div class="ollama-host-name">
          <strong>${n(e.name||e.base_url)}</strong>
          ${e.is_active?'<span class="badge badge-ok">\u76EE\u524D\u4F7F\u7528</span>':""}
          <span class="badge ${s.badge}">${s.label}</span>
        </div>
        <span class="mono ollama-host-url">${n(e.base_url)}</span>
        ${e.detail?`<span class="ollama-host-detail">${n(e.detail)}</span>`:""}
      </div>
      <div class="qb-actions">
        ${e.is_active?'<button class="btn btn-secondary btn-sm" type="button" data-ollama-action="deactivate-host">\u505C\u7528\u4E3B\u6A5F</button>':`<button class="btn btn-primary btn-sm" type="button" data-ollama-action="activate-host" data-id="${e.id}">\u4F7F\u7528\u6B64\u4E3B\u6A5F</button>`}
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="edit-host" data-id="${e.id}">${m("edit",13)}<span>\u7DE8\u8F2F</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="delete-host" data-id="${e.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
      </div>
    </div>
    <div class="ollama-model-list">${r}</div>
  </article>`}function Pc(e,t,s,a){if(s)return`<div class="report-card">
      ${ye({tone:"danger",title:"Model Provider \u8B80\u53D6\u5931\u6557",text:n(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${m("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let r=e||{hosts:[],active_host_id:null},i=Array.isArray(r.hosts)?r.hosts:[],o=a?i.find(p=>Number(p.id)===Number(a)):null,l=o?o.base_url.replace(new RegExp(`:${o.port}$`),""):"http://127.0.0.1",d=o?"\u5132\u5B58\u8B8A\u66F4":"\u65B0\u589E\u4E3B\u6A5F";return`<div class="report-card ollama-card">
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
          <input class="input" name="name" value="${n(o?.name||"")}" placeholder="\u4F8B\u5982\uFF1Ax570 Ollama" />
        </label>
        <label class="field"><span class="field-label">\u4E3B\u6A5F\u7DB2\u5740</span>
          <input class="input" name="url" value="${n(l)}" placeholder="http://127.0.0.1" required />
        </label>
        <label class="field"><span class="field-label">Port</span>
          <input class="input" name="port" type="number" min="1" max="65535" value="${o?.port||11434}" required />
        </label>
        <div class="ollama-host-form-actions">
          <button class="btn btn-primary btn-sm" type="submit">${m("check",13)}<span>${d}</span></button>
          ${o?'<button class="btn btn-ghost btn-sm" type="button" data-ollama-action="cancel-host-edit">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
        </div>
      </form>
      ${t?'<div class="ollama-loading"><span class="spinner"></span><span>\u8B80\u53D6 Ollama \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span></div>':i.length?`<div class="ollama-host-list">${i.map(p=>Rc(p,a)).join("")}</div>`:Ke({iconName:"server",title:"\u5C1A\u672A\u8A2D\u5B9A Ollama \u4E3B\u6A5F",text:"\u8ACB\u5728\u4E0A\u65B9\u8F38\u5165\u7DB2\u5740\u8207 Port \u65B0\u589E\uFF0C\u6216\u4F7F\u7528 .env \u7684\u9810\u8A2D\u9023\u7DDA\u3002"})}
      <p class="report-sub" style="margin-top:12px">\u8A2D\u70BA\u804A\u5929\u6216\u5D4C\u5165\u6A21\u578B\u5F8C\uFF0C\u7CFB\u7D71\u6703\u4F7F\u7528\u76EE\u524D\u4E3B\u6A5F\u7684\u5C0D\u61C9\u6A21\u578B\u57F7\u884C AI \u51FA\u984C\u8207 RAG\uFF1B\u672A\u8A2D\u5B9A\u6642\u6CBF\u7528 .env \u7684 LLM_MODEL\uFF0FEMBEDDING_MODEL\u3002</p>
    </div>
  </div>`}function Ic(e,t,s){let a=e?.data||{},r=e?ht(e.status):null,i=s?ht(s.status):null,o={overview:r?`<span class="badge ${r.tone==="ok"?"badge-ok":r.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${n(r.label)}</span>`:"",resources:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${n(i.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${c(a.version_count)}</span>`,tests:'<span class="badge badge-neutral badge-mono">TEST</span>',"local-model":'<span class="badge badge-neutral badge-mono">OLLAMA</span>',runs:`<span class="badge badge-neutral badge-mono">${c(a.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${Rr.map(l=>{let d=l.id===t;return`<button class="status-tab${d?" is-active":""}" type="button"
          data-status-tab="${l.id}" ${d?'aria-current="page"':""}>
          <span class="status-tab-icon">${m(l.icon,15)}</span>
          <span class="status-tab-copy">
            <strong>${n(l.label)}</strong>
            <small>${n(l.hint)}</small>
          </span>
          ${o[l.id]||""}
        </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u6AA2\u67E5\u6642\u9593</span>
      <span class="mono">${n(e?$e(e.checked_at):"\u2014")}</span>
    </div>`}function Oc(e,t,s,a,r,i){if(e==="resources")return s?Ec(s):a?Er():r?Nc(r):Er();if(e==="local-model"){let o=i||{},l=!!o.loading||!o.hosts&&!o.error;return Pc(o.hosts||null,l,o.error||null,o.editingId||null)}return e==="architecture"?Sc(t):e==="api"?xc(t):e==="data"?qc(t):e==="runs"?Ac(t):kc(t)}function Bc(){return`<div class="status-hero">
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
    </div>`}function Nr(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u5FEB\u53D6\u6216\u63A8\u6E2C\u7684\u670D\u52D9\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${ye({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function Dc(e,t){let s=!1,a=null,r=null,i="overview",o=null,l=!1,d=null,p=null,v=!1,k=null,$=null,b=!1,h=!1,w=null,A=0,B="",Q="";e.innerHTML=`<section class="page status-page">
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
          \u81EA\u52D5\u66F4\u65B0 30s
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
      <section class="status-panel" id="status-content">${Bc()}</section>
    </div>
  </section>`;let D=e.querySelector("#status-nav"),H=e.querySelector("#status-content"),te=e.querySelector("#refresh-status"),de=e.querySelector("#auto-refresh"),ke=()=>{if(A+=1,typeof w=="function")try{w()}catch{}w=null,b=!1,h=!1},we=async()=>{let T=++A;h=!0,Q="",H.innerHTML="";try{let z=await Ha(H,{setTitle:()=>{}},{embedded:!0});if(T!==A||i!=="tests"){typeof z=="function"&&z();return}w=typeof z=="function"?z:null,b=!0}catch(z){T===A&&i==="tests"&&(H.innerHTML=Nr(z))}finally{T===A&&(h=!1)}},W=()=>{if(!r)return;let T=Ic(r,i,o);if(T!==B&&(D.innerHTML=T,B=T),i==="tests"){!b&&!h&&we();return}ke();let z=Oc(i,r,o,l,d,{hosts:p,loading:v,error:k,editingId:$});z!==Q&&(H.innerHTML=z,Q=z)},E=async({quiet:T=!1}={})=>{if(!l){l=!0,d=null,i==="resources"&&!o&&W();try{let z=await F.systemUsage();if(s)return;o=z}catch(z){if(s)return;d=z,T||L(z.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{s||(l=!1,i==="resources"&&W())}}},S=async({quiet:T=!1}={})=>{if(!v){v=!0,k=null,i==="local-model"&&!p&&W();try{let z=await F.ollamaHosts();if(s)return;p=z}catch(z){if(s)return;k=z,T||L(z.message||"\u7121\u6CD5\u53D6\u5F97 Ollama \u4E3B\u6A5F\u3002","danger")}finally{s||(v=!1,i==="local-model"&&W())}}},C=async()=>{await S({quiet:!0}),await ee({quiet:!0})},ee=async({quiet:T=!1}={})=>{T||(te.disabled=!0,pe(te,!0,"\u6AA2\u67E5\u4E2D\u2026"));try{let z=await F.status();if(s)return;r=z,W(),T||L("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(z){if(s)return;i!=="tests"&&(Q="",H.innerHTML=Nr(z)),T||L(z.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(te.disabled=!1,pe(te,!1))}},re=async({quiet:T=!1}={})=>{if(await ee({quiet:T}),i==="resources"&&await E({quiet:T}),i==="local-model"&&await S({quiet:T}),!T&&i==="tests"){let z=H.querySelector("#tests-refresh");z&&z.click()}};return D.addEventListener("click",T=>{let z=T.target.closest("[data-status-tab]");if(!z)return;let Y=z.dataset.statusTab;Rr.some(ue=>ue.id===Y)&&(i=Y,W(),i==="resources"&&!o&&!l&&E(),i==="local-model"&&S())}),H.addEventListener("click",T=>{T.target.closest("#status-retry")&&ee(),T.target.closest("#status-resources-retry")&&E()}),H.addEventListener("click",async T=>{let z=T.target.closest("[data-ollama-action]");if(!z)return;let Y=z.dataset.ollamaAction,ue=Number(z.dataset.id||0);if(Y==="refresh-hosts"){await S();return}if(Y==="edit-host"){$=ue,W(),e.querySelector(".ollama-host-form")?.scrollIntoView({behavior:"smooth",block:"center"});return}if(Y==="cancel-host-edit"){$=null,W();return}if(Y==="delete-host"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 Ollama \u4E3B\u6A5F #${ue}\uFF1F`))return;try{await F.deleteOllamaHost(ue),Number($)===ue&&($=null),L("Ollama \u4E3B\u6A5F\u5DF2\u522A\u9664\u3002","info"),await C()}catch(ae){L(ae.message||"\u522A\u9664\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(Y==="activate-host"){try{await F.activateOllamaHost(ue),L("\u5DF2\u5207\u63DB\u4F7F\u7528\u7684 Ollama \u4E3B\u6A5F\u3002","ok"),await C()}catch(ae){L(ae.message||"\u5207\u63DB\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(Y==="deactivate-host"){try{await F.deactivateOllamaHosts(),L("\u5DF2\u505C\u7528\u6307\u5B9A\u7684 Ollama \u4E3B\u6A5F\uFF0C\u5C07\u6CBF\u7528 .env \u8A2D\u5B9A\u3002","info"),await C()}catch(ae){L(ae.message||"\u505C\u7528\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(Y==="check-capabilities"){pe(z,!0,"\u6AA2\u67E5\u4E2D\u2026");try{await F.checkOllamaCapabilities(),L("\u5DF2\u66F4\u65B0\u6240\u6709\u4E3B\u6A5F\u7684\u6A21\u578B\u80FD\u529B\u3002","ok",4e3),await C()}catch(ae){L(ae.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u80FD\u529B\u3002","danger",7e3)}finally{pe(z,!1)}return}if(Y==="select-model"||Y==="clear-model"){let ae=String(z.dataset.model||""),X=String(z.dataset.role||"");try{Y==="select-model"?(await F.selectOllamaModel(ue,{model:ae,role:X}),L(`\u5DF2\u8A2D\u5B9A ${X==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\uFF1A${ae}`,"ok")):(await F.clearOllamaModel(ue,{model:ae,role:X}),L(`\u5DF2\u53D6\u6D88 ${X==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\u3002`,"info")),await C()}catch(ge){L(ge.message||"\u6A21\u578B\u8A2D\u5B9A\u5931\u6557\u3002","danger")}}}),H.addEventListener("submit",async T=>{let z=T.target.closest("form[data-ollama-form='host']");if(!z)return;T.preventDefault();let Y=new FormData(z),ue=Number(Y.get("host_id")||0),ae={name:String(Y.get("name")||"").trim(),url:String(Y.get("url")||"").trim(),port:Number(Y.get("port")||11434)};try{ue?(await F.updateOllamaHost(ue,ae),L("Ollama \u4E3B\u6A5F\u5DF2\u66F4\u65B0\u3002","ok")):(await F.addOllamaHost(ae),L("Ollama \u4E3B\u6A5F\u5DF2\u65B0\u589E\u3002","ok")),$=null,await C()}catch(X){let ge=X.detail||X.payload?.detail,_e=ge?.errors?.join(" \xB7 ")||ge?.message||X.message||"\u5132\u5B58\u4E3B\u6A5F\u5931\u6557\u3002";L(_e,"danger",8e3)}}),te.addEventListener("click",()=>re()),de.addEventListener("change",()=>{a&&(window.clearInterval(a),a=null),de.checked&&(a=window.setInterval(()=>re({quiet:!0}),3e4),L("\u5DF2\u555F\u7528\u6BCF 30 \u79D2\u81EA\u52D5\u66F4\u65B0\u3002","info",2200))}),await ee({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,ke(),a&&window.clearInterval(a)}}var Ir="rag",Xs={rag:{page:Ma,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:_a,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:Fa,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:Aa,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:Pa,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:za,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:Ws,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"}},Ua=document.getElementById("app-main"),Ks=null,Ys=0;function Ga(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||Ir;return Object.prototype.hasOwnProperty.call(Xs,t)?t:Ir}function Fc(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function Hc(e){return`<section class="page">
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
            <p>${n(e.message||"\u672A\u77E5\u932F\u8AA4")}</p>
          </div>
        </div>
        <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
          <button class="btn btn-secondary btn-sm" type="button" id="route-retry">
            ${m("refresh",14)}<span>\u91CD\u65B0\u8F09\u5165</span>
          </button>
        </div>
      </div>
    </div>
  </section>`}async function Qa(){let e=Ga(),t=++Ys;if(Fc(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof Ks=="function"){try{Ks()}catch{}Ks=null}document.title=Xs[e].title;let s={route:e,navigate(a){Xs[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===Ys&&a&&(document.title=a)}};try{let a=Xs[e].page.render(Ua,s);window.scrollTo({top:0,behavior:"auto"}),Ua.focus({preventScroll:!0});let r=await a;if(t!==Ys){typeof r=="function"&&r();return}Ks=typeof r=="function"?r:null}catch(a){if(t!==Ys)return;console.error("Failed to render route",e,a),Ua.innerHTML=Hc(a);let r=document.getElementById("route-retry");r&&r.addEventListener("click",()=>Qa()),L("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function zc(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable)||Ga()!=="rag")return;let a=document.getElementById("rag-question");a&&(e.preventDefault(),a.focus())})}function Uc(){let e=document.querySelector('[data-route="processing"]');if(!e)return;let t=e.querySelector(".nav-update-badge");t||(t=document.createElement("span"),t.className="nav-update-badge",t.hidden=!0,e.appendChild(t));let s=async()=>{try{let a=await F.updatesStatus(),r=Number(a.update_count)||0;r>0?(t.textContent=String(r),t.title=`\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0F\u5224\u6C7A\u6709 ${r} \u9805\u66F4\u65B0`,t.hidden=!1):t.hidden=!0}catch{t.hidden=!0}};s(),window.setInterval(s,6e4),window.addEventListener("focus",s),window.addEventListener("judgment:updates-changed",s)}function Or(){tn(),zc(),Uc(),window.addEventListener("hashchange",Qa),Qa(),qs()&&window.setTimeout(()=>{Ga()!=="tests"&&(window.location.hash="#/tests")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Or):Or();})();
