(()=>{var Qr=Object.defineProperty;var Mt=(e,t)=>{for(var s in t)Qr(e,s,{get:t[s],enumerable:!0})};var na="judgment.api_base",ra="http://127.0.0.1:9200",Ve=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function Za(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function jt(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${Za(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function ia(e){let t=jt(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function oa(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?jt(e.get("api")):null}catch{return null}}function la(){try{let e=window.localStorage.getItem(na);return e===null?null:jt(e)}catch{return null}}function ca(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return jt(e||"")}function Tt(){let e=oa();if(e!==null)return e;let t=la();if(t!==null)return t;let s=ca();return s||(window.location.protocol==="file:"?ra:"")}function Gr(){if(oa()!==null)return!0;let e=la();return e!==null?!!e:!!ca()}function Et(){return oa()!==null?"query":la()!==null?"storage":ca()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function Ls(){return Gr()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!Za(window.location.hostname)}function da(e){let t=jt(e);try{t?window.localStorage.setItem(na,t):window.localStorage.removeItem(na)}catch{}return t}function zt(e=Tt()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function tt(e,t=Tt()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function ua(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function X(e,t={}){let s=Tt(),a=new AbortController,r=t.timeout===void 0?3e4:t.timeout,i=r>0?window.setTimeout(()=>a.abort(),r):null,o=Date.now(),l=performance.now(),d=t.requestId||en(),m={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":d,"X-Judgment-Client-Started-At":String(o),...t.headers||{}},v;try{v=await fetch(tt(e,s),{...t,headers:m,signal:a.signal})}catch(y){throw y.name==="AbortError"?new Ve("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new Ve(ua(s),0,y)}finally{i&&window.clearTimeout(i)}let w=null;if((v.headers.get("content-type")||"").includes("application/json"))try{w=await v.json()}catch{w=null}else try{w=await v.text()}catch{w=null}let g=performance.now(),h=v.headers.get("X-Judgment-Request-Id")||d;if(t.trackClient!==!1&&h){let y=Math.round(performance.now()-l);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{tn({request_id:h,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:y,render_ms:Math.max(0,Math.round(performance.now()-g)),status:v.ok?"success":"failed"})})})}if(!v.ok){let y=w&&typeof w=="object"?w.detail||w.message:w,S=typeof y=="string"&&y?y:`\u4F3A\u670D\u5668\u56DE\u61C9 ${v.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new Ve(S,v.status,y)}return w}function en(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function tn(e){try{fetch(tt("/api/performance/client",Tt()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),keepalive:!0}).catch(()=>{})}catch{}}async function sn(e){let t=jt(e);if(!ia(t))throw new Ve("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,r=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(tt("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new Ve(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof Ve?i:i.name==="AbortError"?new Ve("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new Ve(ua(t),0,i)}finally{window.clearTimeout(r)}}var H={health(){return X("/api/health")},status(){return X("/api/status",{trackClient:!1})},ollamaHosts(){return X("/api/ollama/hosts",{timeout:3e4,trackClient:!1})},addOllamaHost(e){return X("/api/ollama/hosts",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},updateOllamaHost(e,t){return X(`/api/ollama/hosts/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},deleteOllamaHost(e){return X(`/api/ollama/hosts/${encodeURIComponent(e)}`,{method:"DELETE",timeout:3e4,trackClient:!1})},activateOllamaHost(e){return X(`/api/ollama/hosts/${encodeURIComponent(e)}/activate`,{method:"POST",timeout:3e4,trackClient:!1})},deactivateOllamaHosts(){return X("/api/ollama/hosts/deactivate",{method:"POST",timeout:3e4,trackClient:!1})},reorderOllamaHosts(e){return X("/api/ollama/hosts/reorder",{method:"POST",body:JSON.stringify({host_ids:e}),timeout:3e4,trackClient:!1})},checkOllamaCapabilities(){return X("/api/ollama/hosts/capabilities/test",{method:"POST",timeout:18e4,trackClient:!1})},selectOllamaModel(e,t){return X(`/api/ollama/hosts/${encodeURIComponent(e)}/models/select`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},clearOllamaModel(e,t){return X(`/api/ollama/hosts/${encodeURIComponent(e)}/models/clear`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},systemUsage(){return X("/api/system-usage",{trackClient:!1})},indexVersions(){return X("/api/index-versions",{trackClient:!1})},indexVersion(e){return X(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return X(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return X(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return X("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){let t=new URLSearchParams({repair:e?"true":"false"});return X(`/api/index-alias/reconcile?${t.toString()}`,{trackClient:!1})},catalog(){return X("/api/catalog")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return X("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},dataSuggest({kind:e,query:t="",limit:s=12}){let a=new URLSearchParams({kind:e,query:t,limit:String(s)});return X(`/api/data/suggest?${a.toString()}`,{timeout:45e3,trackClient:!1})},schemaSuggest({database:e,table:t,column:s,query:a,limit:r=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(r)});return X(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let r=new URLSearchParams({law_key:e});return t&&r.set("source_type",t),s&&r.set("version_id",String(s)),a&&r.set("article_no",String(a)),X(`/api/law?${r.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),X(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return X("/api/test-mode",{trackClient:!1})},llmModels(){return X("/api/llm/models",{timeout:6e4,trackClient:!1})},testLlmModels(){return X("/api/llm/models/test",{method:"POST",timeout:12e4,trackClient:!1})},selectLlmModel(e,t=null){return X("/api/llm/model",{method:"POST",body:JSON.stringify({model:e,host_id:t}),timeout:3e4,trackClient:!1})},setTestMode(e){return X("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return X(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return X("/api/test-runs/current",{trackClient:!1})},testRun(e){return X(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return X("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[r,i]of Object.entries(e))i==null||i===""||a.set(r,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),X(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return X("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return X("/api/processing",{timeout:45e3,trackClient:!1})},judgmentDownloadStatus(){return X("/api/judgment-download/status",{timeout:3e4,trackClient:!1})},versioningSummary(){return X("/api/versioning/summary",{trackClient:!1})},updatesStatus(){return X("/api/updates/status",{trackClient:!1})},checkCourts(){return X("/api/courts/check",{timeout:6e4,trackClient:!1})},checkLawVersions(){return X("/api/law-versions/check",{timeout:6e4,trackClient:!1})},checkUpdates(e=[]){let t=Array.isArray(e)&&e.length?{source_types:e}:{};return X("/api/updates/check",{method:"POST",body:JSON.stringify(t),timeout:12e4,trackClient:!1})},versioningSnapshots(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.limit&&t.set("limit",String(e.limit)),X(`/api/versioning/judgments/snapshots?${t.toString()}`,{trackClient:!1})},versioningChanges(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit)),X(`/api/versioning/judgments/changes?${t.toString()}`,{trackClient:!1})},versioningJudgment(e){return X(`/api/versioning/judgments/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVersion(e){return X(`/api/versioning/judgments/versions/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVector(e,t){return X(`/api/versioning/judgments/${encodeURIComponent(e)}/vectors/${encodeURIComponent(t)}`,{trackClient:!1})},versioningAudit(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit||500)),X(`/api/versioning/audit?${t.toString()}`,{trackClient:!1})},questionBankStats(){return X("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[r,i]of Object.entries(e))if(!(i==null||i==="")){if(Array.isArray(i)){for(let o of i)o==null||o===""||a.append(r,String(o));continue}a.set(r,String(i))}return a.set("limit",String(t)),a.set("offset",String(s)),X(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankTags(e="",t=12){let s=new URLSearchParams({query:e,limit:String(t)});return X(`/api/question-bank/tags?${s.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return X(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return X("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},createQuestionBankItemWithAI(e){return X("/api/question-bank/ai-items",{method:"POST",body:JSON.stringify(e),timeout:42e4,trackClient:!1})},updateQuestionBankItem(e,t){return X(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return X(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},restoreQuestionBankItem(e){return X(`/api/question-bank/items/${encodeURIComponent(e)}/restore`,{method:"POST",timeout:45e3,trackClient:!1})},submitQuestionBankItemForReview(e){return X(`/api/question-bank/items/${encodeURIComponent(e)}/submit`,{method:"POST",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return X(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return X("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return X(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return X("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return X(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return X("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},benchmarkSuiteLatestAnswers(e){return X(`/api/benchmark/suites/${encodeURIComponent(e)}/latest-answers`,{timeout:45e3,trackClient:!1})},removeBenchmarkSuiteItem(e,t){return X(`/api/benchmark/suites/${encodeURIComponent(e)}/items/${encodeURIComponent(t)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return X("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return X(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return X(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return X(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return X("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return X(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return X(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return X(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return X("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return X(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return X("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return X(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return X("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return X("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return X("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onToken:r=null,onTokenReset:i=null}={}){let o=Tt(),l=new AbortController,d=t?0:3e5,m=d>0?window.setTimeout(()=>l.abort(),d):null,v=Date.now(),w=performance.now(),$=en(),g={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":$,"X-Judgment-Client-Started-At":String(v)},h;try{h=await fetch(tt("/api/rag/query/stream",o),{method:"POST",headers:g,body:JSON.stringify({question:e}),signal:l.signal})}catch(ne){throw ne.name==="AbortError"?new Ve("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new Ve(ua(o),0,ne)}finally{m&&window.clearTimeout(m)}if(!h.ok){let ne=null;try{ne=await h.json()}catch{ne=null}let te=ne&&typeof ne=="object"&&ne.detail?String(ne.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${h.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new Ve(te,h.status,ne)}if(!h.body)throw new Ve("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let y=h.body.getReader(),S=new TextDecoder,N="",D=null,B=null;try{for(;;){let{value:ne,done:te}=await y.read();if(te)break;N+=S.decode(ne,{stream:!0});let $e=N.indexOf(`

`);for(;$e>=0;){let qe=N.slice(0,$e).replace(/\r/g,"");N=N.slice($e+2);let J="message",R=[];for(let x of qe.split(`
`))x.startsWith("event:")?J=x.slice(6).trim():x.startsWith("data:")&&R.push(x.slice(5).trimStart());if(R.length){let x=null;try{x=JSON.parse(R.join(`
`))}catch{x=null}if(x)if(J==="step"&&typeof s=="function")try{s(x)}catch{}else if(J==="partial"){if(typeof a=="function")try{a(x)}catch{}}else if(J==="token"){if(typeof r=="function")try{r(String(x.text||""))}catch{}}else if(J==="token_reset"){if(typeof i=="function")try{i()}catch{}}else J==="result"?D=x:J==="error"&&(B=new Ve(x.message||x.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,x))}$e=N.indexOf(`

`)}}}finally{try{await y.cancel()}catch{}m&&window.clearTimeout(m)}if(B)throw B;if(!D)throw new Ve("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let Q=Math.round(performance.now()-w);return tn({request_id:$,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:Q,render_ms:0,status:"success"}),D&&typeof D=="object"&&(D._client_request_id=$),D}};var Jr={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Vr={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},Wr={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},Kr={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},an={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',more:'<circle cx="4.2" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="19.8" cy="12" r="2.6" fill="currentColor" stroke="none"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function n(e){return String(e??"").replace(/[&<>"']/g,t=>Jr[t])}function u(e,t=16,s=""){let a=an[e]||an.info;return`<svg${s?` class="${n(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function c(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function be(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function pa(e){if(e instanceof Date)return e;if(typeof e=="number"){let r=new Date(e);return Number.isNaN(r.getTime())?null:r}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function bt(e){let t=pa(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?n(e):"\u2014"}function ye(e){let t=pa(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?n(e):"\u2014"}function ss(e){let t=pa(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:bt(t)}function re(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function vt(e){return Vr[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function je(e,t){let s=vt(e);return`<span class="badge ${Wr[s.tone]}"><span class="status-dot ${Kr[s.tone]}"></span>${n(t||s.label)}</span>`}function Yr(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${n(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function Ms(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function js(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return je(String(e));case"source":return Yr(String(e));case"number":return`<span class="mono">${c(e)}</span>`;case"duration":return`<span class="mono">${re(e)}</span>`;case"datetime":return`<span class="mono">${ye(e)}</span>`;case"date":return`<span class="mono">${bt(e)}</span>`;case"url":{let s=String(e),a=Ms(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${n(s)}" target="_blank" rel="noopener noreferrer" title="${n(s)}">${u("external",10)}${n(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${n(s)}">${n(Ms(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(Ms(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(Ms(s,90))}</span>`}}}function _e({tone:e="info",title:t,text:s,iconName:a="info"}){let r=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${r==="i"?"i":u(r,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${n(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function We({iconName:e="search",title:t,text:s="",actions:a="",className:r=""}){return`<div class="empty-state ${r}">
    <span class="empty-icon">${u(e,24)}</span>
    <h3 class="empty-title">${n(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function me(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${n(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function L(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let r={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${r[t]||"i"}</span>
    <div class="toast-body">${n(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function as(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function ht(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),r=URL.createObjectURL(a),i=document.createElement("a");i.href=r,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(r),1e3)}var rn="judgment.theme",ma="nvidia",on=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#171717","#0070f3","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#1d1d1f","#0071e3","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#5e6ad2","#010102","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#f24e1e","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#191918","#0075de","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],ga=new Map(on.map(e=>[e.id,e]));function Xr(e){return ga.has(e)}function Zr(e){return ga.get(e)||ga.get(ma)}function ei(){try{let e=window.localStorage.getItem(rn);return Xr(e)?e:ma}catch{return ma}}function nn(e,{persist:t=!0}={}){let s=Zr(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");if(a&&a.setAttribute("content",s.metaColor),document.querySelectorAll(".theme-option").forEach(r=>{let i=r.dataset.themeId===s.id;r.classList.toggle("is-active",i),r.setAttribute("aria-checked",i?"true":"false")}),t)try{window.localStorage.setItem(rn,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}function ti(e){let t=on.map((s,a)=>{let r=s.swatches.map(i=>`<i style="--swatch:${n(i)}"></i>`).join("");return`<button class="theme-option" type="button" role="menuitemradio"
        data-theme-id="${s.id}" aria-checked="false">
        <span class="theme-option-index">${String(a+1).padStart(2,"0")}</span>
        <span class="theme-option-body">
          <span class="theme-option-name">${n(s.name)}</span>
          <span class="theme-option-desc">${n(s.description)}</span>
        </span>
        <span class="theme-option-swatches" aria-hidden="true">${r}</span>
        <span class="theme-option-check" aria-hidden="true">${u("check",14)}</span>
      </button>`}).join("");e.innerHTML=`<div class="style-menu-head">
      <strong>\u9078\u64C7\u4ECB\u9762\u98A8\u683C</strong>
      <span>10 \u7A2E\u79D1\u6280\u54C1\u724C\u8A9E\u8A00</span>
    </div>${t}`}function ln(){let e=document.getElementById("style-picker"),t=document.getElementById("style-trigger"),s=document.getElementById("style-menu");if(!e||!t||!s)return;ti(s),nn(ei(),{persist:!1});let a=()=>Array.from(s.querySelectorAll(".theme-option")),r=()=>{s.hidden=!1,t.setAttribute("aria-expanded","true");let o=s.querySelector(".theme-option.is-active")||a()[0];o&&o.focus()},i=({restoreFocus:o=!1}={})=>{s.hidden||(s.hidden=!0,t.setAttribute("aria-expanded","false"),o&&t.focus())};t.addEventListener("click",()=>{s.hidden?r():i({restoreFocus:!0})}),t.addEventListener("keydown",o=>{(o.key==="ArrowDown"||o.key==="ArrowUp")&&(o.preventDefault(),r())}),s.addEventListener("click",o=>{let l=o.target.closest(".theme-option");l&&(nn(l.dataset.themeId),i({restoreFocus:!0}))}),s.addEventListener("keydown",o=>{let l=a(),d=l.indexOf(document.activeElement);if(o.key==="Escape"){o.preventDefault(),i({restoreFocus:!0});return}if(o.key==="ArrowDown"||o.key==="ArrowUp"){o.preventDefault();let m=o.key==="ArrowDown"?1:-1,v=l[(d+m+l.length)%l.length];v&&v.focus();return}if(o.key==="Home"||o.key==="End"){o.preventDefault();let m=o.key==="Home"?l[0]:l[l.length-1];m&&m.focus()}}),document.addEventListener("pointerdown",o=>{e.contains(o.target)||i()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&i()})}var fa={};Mt(fa,{render:()=>ai});var cn=[{route:"rag",icon:"message",kicker:"RAG",title:"RAG \u63D0\u554F",summary:"\u7528\u81EA\u7136\u8A9E\u8A00\u627E\u5230\u6CD5\u898F\u8207\u5224\u6C7A\uFF0C\u7B54\u6848\u9644\u4E0A\u53EF\u56DE\u6EAF\u7684\u5F15\u7528\u4F86\u6E90\u3002",description:"Qdrant \u5411\u91CF\u6AA2\u7D22\u3001LLM \u751F\u6210\u56DE\u7B54\u3001\u5F15\u7528\u9A57\u8B49\u8207 pipeline waterfall\uFF0C\u90FD\u5728\u540C\u4E00\u500B\u5DE5\u4F5C\u5340\u5B8C\u6210\u3002",metric:"Citations first",tone:"feature"},{route:"data",icon:"database",kicker:"EXPLORE",title:"\u8CC7\u6599\u5EAB\u67E5\u8A62",summary:"\u8DE8 PostgreSQL\u3001Parquet\u3001Qdrant \u8207 IndexedDB \u63A2\u7D22\u8CC7\u6599\u3002",description:"\u4EE5 metadata\u3001SQL \u6216\u8A9E\u610F\u67E5\u8A62\u6AA2\u8996\u8CC7\u6599\u8868\uFF0C\u652F\u63F4\u5206\u9801\u3001\u6392\u5E8F\u8207 CSV\uFF0FJSON \u532F\u51FA\u3002",metric:"4 \u7A2E\u8CC7\u6599\u4F86\u6E90",tone:"blue"},{route:"quality",icon:"shield",kicker:"QUALITY",title:"\u8CC7\u6599\u54C1\u8CEA",summary:"\u7528 DuckDB \u76F4\u63A5\u6AA2\u67E5\u539F\u59CB\u5224\u6C7A\u8CC7\u6599\u7684\u5B8C\u6574\u6027\u3002",description:"\u6AA2\u67E5\u91CD\u8907\u3001\u7F3A\u6F0F\u3001\u5F15\u7528\u4E00\u81F4\u6027\u8207 archive \u7D71\u8A08\uFF0C\u4E26\u7DAD\u8B77\u984C\u5EAB\u8207 benchmark \u984C\u7D44\u3002",metric:"DuckDB native",tone:"green"},{route:"performance",icon:"activity",kicker:"OBSERVE",title:"\u6548\u80FD\u5831\u8868",summary:"\u5F9E\u55AE\u6B21\u8ACB\u6C42\u5230\u6574\u9AD4\u7D22\u5F15\uFF0C\u8FFD\u8E64\u6BCF\u4E00\u500B\u6642\u9593\u7247\u6BB5\u3002",description:"\u5B8C\u6574 Flow\u3001RAG Pipeline waterfall\u3001Token\u3001TTFT\u3001\u7D22\u5F15\u541E\u5410\u8207 RAG Benchmark \u4E00\u6B21\u770B\u5B8C\u3002",metric:"ms-level trace",tone:"amber"},{route:"processing",icon:"sliders",kicker:"PIPELINE",title:"\u8CC7\u6599\u8655\u7406",summary:"\u4E0B\u8F09\u3001\u532F\u5165\u3001\u5099\u4EFD\u3001\u7D22\u5F15\uFF0C\u96C6\u4E2D\u7BA1\u7406\u8CC7\u6599\u751F\u547D\u9031\u671F\u3002",description:"\u8FFD\u8E64\u6CD5\u898F\u3001\u547D\u4EE4\u8207\u5224\u6C7A\u6D41\u7A0B\uFF0C\u7BA1\u7406 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u8207\u7DDA\u4E0A\u66F4\u65B0\u6AA2\u67E5\u3002",metric:"End-to-end",tone:"violet"},{route:"status",icon:"server",kicker:"STATUS",title:"\u7CFB\u7D71\u72C0\u614B",summary:"\u5373\u6642\u638C\u63E1\u6BCF\u4E00\u500B\u670D\u52D9\u8207\u57FA\u790E\u8A2D\u65BD\u7684\u904B\u4F5C\u72C0\u614B\u3002",description:"FastAPI\u3001PostgreSQL\u3001Qdrant\u3001Ollama\u3001Docker\uFF0Fvolume\u3001\u78C1\u789F\u8207\u8CC7\u6599\u7248\u672C\u3002",metric:"Live health",tone:"slate"},{route:"tests",icon:"check",kicker:"VERIFY",title:"\u7CFB\u7D71\u6E2C\u8A66",summary:"\u5728\u4E0A\u7DDA\u524D\u78BA\u8A8D API\u3001\u6A21\u578B\u8207\u6E2C\u8A66 Flow \u90FD\u6E96\u5099\u597D\u4E86\u3002",description:"\u8A2D\u5B9A API Base\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207 LLM chat \u80FD\u529B\uFF0C\u57F7\u884C\u591A\u6A21\u578B\u6E2C\u8A66\u4E26\u6AA2\u67E5\u7D50\u679C\u3002",metric:"Model ready",tone:"rose"}];function si(e){return`<a class="home-tile tone-${n(e.tone)}" href="#/${e.route}">
    <span class="home-tile-watermark" aria-hidden="true">${u(e.icon,132)}</span>
    <span class="home-tile-head">
      <span class="home-tile-icon">${u(e.icon,22)}</span>
      <span class="home-tile-kicker">${n(e.kicker)}</span>
    </span>
    <span class="home-tile-copy">
      <strong>${n(e.title)}</strong>
      <span>${n(e.summary)}</span>
    </span>
    <span class="home-tile-foot">
      <span class="home-tile-metric">${n(e.metric)}</span>
      <span class="home-tile-cta">\u63A2\u7D22 ${u("arrowRight",13)}</span>
    </span>
  </a>`}async function ai(e,t){let s=cn[0],a=cn.slice(1).map(si).join("");e.innerHTML=`<section class="page home-page">
    <div class="home-stage">
      <span class="home-stage-halo" aria-hidden="true"></span>
      <div class="home-stage-inner">
        <span class="home-eyebrow">JUDGMENT \xB7 LEGAL RAG</span>
        <h1 class="home-title">\u8B93\u6BCF\u4E00\u500B\u7B54\u6848\uFF0C<span>\u90FD\u80FD\u56DE\u5230\u6CD5\u898F\u8207\u5224\u6C7A\u3002</span></h1>
        <p class="home-lead">\u4EE5\u91D1\u878D\u6CD5\u898F\u7684\u73FE\u884C\u689D\u6587\u8207\u5224\u6C7A\u7247\u6BB5\u70BA\u6AA2\u7D22\u57FA\u790E\u3002
          \u5148\u5F9E Qdrant \u627E\u51FA\u76F8\u4F3C\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u751F\u6210\u9644\u5F15\u7528\u4F86\u6E90\u7684\u56DE\u7B54\uFF1B\u82E5\u6A21\u578B\u5C1A\u672A\u5C31\u7DD2\uFF0C\u7CFB\u7D71\u53EA\u986F\u793A\u53EF\u9A57\u8B49\u7684\u6AA2\u7D22\u7D50\u679C\u3002</p>
        <form class="home-ask" id="home-ask-form" autocomplete="off">
          <label class="sr-only" for="home-question">\u8F38\u5165\u6CD5\u5F8B\u554F\u984C</label>
          <div class="home-ask-box">
            <textarea class="home-ask-input" id="home-question" name="question" rows="1"
              maxlength="500" placeholder="\u554F\u4E00\u500B\u6CD5\u5F8B\u554F\u984C\uFF0C\u4F8B\u5982\uFF1A\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F"
              aria-describedby="home-ask-help"></textarea>
            <button class="btn btn-primary home-ask-submit" type="submit">
              ${u("sparkles",16)}<span>\u958B\u59CB\u6AA2\u7D22</span>
            </button>
          </div>
          <div class="home-ask-help" id="home-ask-help">
            <span><kbd>Enter</kbd> \u9001\u51FA</span>
            <span><kbd>Shift</kbd> + <kbd>Enter</kbd> \u63DB\u884C</span>
            <span>\u9001\u51FA\u5F8C\u5728 RAG \u63D0\u554F\u4E2D\u958B\u555F</span>
          </div>
        </form>
        <div class="home-hero-meta">
          <span>${u("shield",13)}\u53EF\u56DE\u6EAF\u5F15\u7528</span>
          <span>${u("database",13)}\u6CD5\u898F\uFF0B\u5224\u6C7A</span>
          <span>${u("activity",13)}Pipeline waterfall</span>
        </div>
      </div>
    </div>

    <div class="home-showcase">
      <div class="home-showcase-head">
        <div>
          <span class="home-kicker">EXPLORE THE CONSOLE</span>
          <h2>\u4E00\u5957\u7CFB\u7D71\uFF0C\u5F9E\u63D0\u554F\u8D70\u5230\u8CC7\u6599\u7DAD\u904B\u3002</h2>
        </div>
        <p>\u6BCF\u500B\u5DE5\u4F5C\u5340\u90FD\u76F4\u63A5\u9023\u5230\u53EF\u9A57\u8B49\u7684\u8CC7\u6599\u4F86\u6E90\u8207\u6A21\u578B\u670D\u52D9\uFF0C\u6C92\u6709\u6A21\u64EC\u8CC7\u6599\uFF0C\u4E5F\u4E0D\u4EE5\u63A8\u6E2C\u88DC\u9F4A\u3002</p>
      </div>

      <a class="home-feature" href="#/${s.route}">
        <span class="home-feature-glow" aria-hidden="true"></span>
        <div class="home-feature-copy">
          <span class="home-feature-kicker">${n(s.kicker)} \xB7 ${n(s.metric)}</span>
          <h3>${n(s.title)}<br /><span>${n(s.summary)}</span></h3>
          <p>${n(s.description)}</p>
          <span class="home-feature-cta">\u958B\u59CB\u63D0\u554F ${u("arrowRight",14)}</span>
        </div>
        <div class="home-feature-art" aria-hidden="true">
          <span class="home-feature-orbit orbit-one"></span>
          <span class="home-feature-orbit orbit-two"></span>
          <span class="home-feature-core">${u(s.icon,46)}</span>
          <span class="home-feature-chip chip-qdrant">Qdrant</span>
          <span class="home-feature-chip chip-llm">LLM</span>
          <span class="home-feature-chip chip-cite">Citations</span>
        </div>
      </a>

      <div class="home-tile-grid">${a}</div>
    </div>

    <section class="home-trust" aria-label="\u7CFB\u7D71\u539F\u5247">
      <div class="home-trust-item">
        <span class="home-trust-icon">${u("shield",18)}</span>
        <strong>\u4F86\u6E90\u512A\u5148</strong>
        <p>\u56DE\u7B54\u53EA\u6839\u64DA\u6AA2\u7D22\u5230\u7684\u6CD5\u898F\u8207\u5224\u6C7A\u7247\u6BB5\u751F\u6210\uFF0C\u5F15\u7528\u7DE8\u865F\u53EF\u56DE\u5230\u539F\u59CB\u8CC7\u6599\u3002</p>
      </div>
      <div class="home-trust-item">
        <span class="home-trust-icon">${u("server",18)}</span>
        <strong>\u672C\u6A5F\u6A21\u578B</strong>
        <p>\u900F\u904E Ollama \u4F7F\u7528\u672C\u6A5F\u6216\u5340\u7DB2\u6A21\u578B\uFF0C\u6A21\u578B\u8207\u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u90FD\u53EF\u8ABF\u6574\u3002</p>
      </div>
      <div class="home-trust-item">
        <span class="home-trust-icon">${u("layers",18)}</span>
        <strong>\u7248\u672C\u53EF\u8FFD\u6EAF</strong>
        <p>\u6CD5\u898F\u3001\u5224\u6C7A\u8207\u5411\u91CF\u7D22\u5F15\u4FDD\u7559\u7248\u672C\u8207\u66F4\u65B0\u7D00\u9304\uFF0C\u8CC7\u6599\u8B8A\u66F4\u4E0D\u6703\u9ED8\u9ED8\u6D88\u5931\u3002</p>
      </div>
    </section>
  </section>`;let r=e.querySelector("#home-ask-form"),i=e.querySelector("#home-question"),o=()=>{let d=String(i?.value||"").trim().slice(0,500);if(!d){i?.focus();return}try{window.sessionStorage.setItem("judgment.pending_question",d)}catch{}window.__judgmentPendingQuestion=d,t&&typeof t.navigate=="function"?t.navigate("rag"):window.location.hash="#/rag"},l=()=>{i&&(i.style.height="auto",i.style.height=`${Math.min(i.scrollHeight,140)}px`)};i?.addEventListener("input",l),r?.addEventListener("submit",d=>{d.preventDefault(),o()}),i?.addEventListener("keydown",d=>{d.key==="Enter"&&!d.shiftKey&&!d.isComposing&&(d.preventDefault(),o())}),l(),i?.focus({preventScroll:!0})}var Ra={};Mt(Ra,{render:()=>zo});var ni="judgment-console";var Xe="query_history",Nt="settings",Ct="audit_events";var Qe={history:[],settings:new Map,audit:[],nextId:1},Ts=null,Ge=!("indexedDB"in window);function $t(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function st(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function it(){return Ts||(Ts=new Promise((e,t)=>{if(!("indexedDB"in window)){Ge=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(ni,2)}catch(a){Ge=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(Xe)){let r=a.createObjectStore(Xe,{keyPath:"id",autoIncrement:!0});r.createIndex("created_at","created_at"),r.createIndex("kind","kind")}if(a.objectStoreNames.contains(Nt)||a.createObjectStore(Nt,{keyPath:"key"}),!a.objectStoreNames.contains(Ct)){let r=a.createObjectStore(Ct,{keyPath:"key"});r.createIndex("created_at","created_at"),r.createIndex("dataset","dataset"),r.createIndex("jid","jid"),r.createIndex("issue_month","issue_month")}},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{Ge=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{Ge=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),Ts)}function dn(){return"indexedDB"in window}function un(){return Ge}function Es(){return Ge?"memory":"indexeddb"}function ri(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},turns:Array.isArray(e.turns)?e.turns:[],pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t,updated_at:e.updated_at||t}}async function ii(){try{let t=(await it()).transaction(Xe,"readwrite"),s=t.objectStore(Xe),a=await $t(s.count());if(a>120){let r=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let d=i.result;if(!d||r<=0){o();return}d.delete(),r-=1,d.continue()},i.onerror=()=>l(i.error)})}await st(t)}catch{Ge=!0}}async function ps(e){let t=ri(e);try{let a=(await it()).transaction(Xe,"readwrite"),r=a.objectStore(Xe),i=await $t(r.add(t));return await st(a),await ii(),i}catch{Ge=!0;let a=Qe.nextId++;return Qe.history.push({id:a,...t}),Qe.history.length>120&&Qe.history.shift(),a}}async function ms(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let r=(await it()).transaction(Xe,"readwrite"),i=r.objectStore(Xe),o=await $t(i.get(s));if(!o)return await st(r),null;let l={...o,...t,id:s};return await $t(i.put(l)),await st(r),l}catch{Ge=!0;let r=Qe.history.findIndex(i=>Number(i.id)===s);return r===-1?null:(Qe.history[r]={...Qe.history[r],...t,id:s},Qe.history[r])}}async function pn(e){let t=Number(e);if(!Number.isFinite(t))return!1;try{let a=(await it()).transaction(Xe,"readwrite");return a.objectStore(Xe).delete(t),await st(a),!0}catch{Ge=!0;let a=Qe.history.findIndex(r=>Number(r.id)===t);return a===-1?!1:(Qe.history.splice(a,1),!0)}}async function Ns({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let r=(await it()).transaction(Xe,"readonly"),i=r.objectStore(Xe),o=await $t(i.getAll());return await st(r),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,d)=>String(d.updated_at||d.created_at).localeCompare(String(l.updated_at||l.created_at))).slice(0,t)}catch{return Ge=!0,Qe.history.filter(r=>s?`${r.kind} ${r.title} ${r.detail}`.toLowerCase().includes(s):!0).slice().sort((r,i)=>String(i.updated_at||i.created_at).localeCompare(String(r.updated_at||r.created_at))).slice(0,t)}}async function mn(){try{let t=(await it()).transaction(Xe,"readwrite");t.objectStore(Xe).clear(),await st(t)}catch{Ge=!0}Qe.history=[]}function oi(e){let t=Number(e.id??e.event_id??0)||0,s=String(e.dataset||e.kind||"judgment"),a=String(e.key||`${s}:${t||`${Date.now()}:${Math.random().toString(36).slice(2)}`}`),r=String(e.jid||""),i=String(e.issue_month||""),o=String(e.change_type||""),l=String(e.detected_at||e.created_at||new Date().toISOString());return{key:a,event_id:t,dataset:s,jid:r,issue_month:i,change_type:o,title:String(e.title||r||i||"\u7248\u672C\u8B8A\u66F4"),detail:String(e.detail||[o,i,r].filter(Boolean).join(" \xB7 ")),created_at:l,payload:e}}async function li(){try{let t=(await it()).transaction(Ct,"readwrite"),s=t.objectStore(Ct),a=await $t(s.count());if(a>2e3){let r=a-2e3,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let d=i.result;if(!d||r<=0){o();return}d.delete(),r-=1,d.continue()},i.onerror=()=>l(i.error)})}await st(t)}catch{Ge=!0}}async function gn(e){let t=(Array.isArray(e)?e:[]).filter(s=>s&&typeof s=="object").map(oi);if(!t.length)return 0;try{let a=(await it()).transaction(Ct,"readwrite"),r=a.objectStore(Ct);for(let i of t)await $t(r.put(i));return await st(a),await li(),t.length}catch{Ge=!0;let a=new Map(Qe.audit.map(r=>[r.key,r]));for(let r of t)a.set(r.key,r);return Qe.audit=Array.from(a.values()).sort((r,i)=>String(i.created_at).localeCompare(String(r.created_at))).slice(0,2e3),t.length}}async function fn({keyword:e="",limit:t=200}={}){let s=e.trim().toLowerCase(),a=r=>s?`${r.dataset} ${r.jid} ${r.issue_month} ${r.change_type} ${r.detail}`.toLowerCase().includes(s):!0;try{let i=(await it()).transaction(Ct,"readonly"),o=i.objectStore(Ct),l=await $t(o.getAll());return await st(i),l.filter(a).sort((d,m)=>String(m.created_at).localeCompare(String(d.created_at))).slice(0,t)}catch{return Ge=!0,Qe.audit.filter(a).slice().sort((i,o)=>String(o.created_at).localeCompare(String(i.created_at))).slice(0,t)}}async function gs(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let r=(await it()).transaction(Nt,"readwrite");return r.objectStore(Nt).put(s),await st(r),s}catch{return Ge=!0,Qe.settings.set(s.key,s),s}}async function Rt(e,t=null){try{let a=(await it()).transaction(Nt,"readonly"),r=a.objectStore(Nt),i=await $t(r.get(String(e)));return await st(a),i?i.value:t}catch{Ge=!0;let a=Qe.settings.get(String(e));return a?a.value:t}}async function bn({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await it()).transaction(Nt,"readonly"),r=a.objectStore(Nt),i=await $t(r.getAll());return await st(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return Ge=!0,Array.from(Qe.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function vn(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var Ea={};Mt(Ea,{buildFlowWaterfallStages:()=>Gs,render:()=>_o,renderRagPipelineWaterfall:()=>Qs,renderTestFlowPanel:()=>os,renderWaterfallStages:()=>is});var ci={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},di=new Set(["running","stopping"]);function Rs(e){let[t,s]=ci[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${n(t)}</span>`}function Cs(e){return String(e).padStart(2,"0")}function ns(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${Cs(t.getMonth()+1)}-${Cs(t.getDate())} ${Cs(t.getHours())}:${Cs(t.getMinutes())}`}function bs(e){return di.has(e)}function St(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function Ut(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function Pt(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${n(e)}</span>
    <strong>${n(String(t))}</strong>
    ${s?`<small>${n(s)}</small>`:""}
  </div>`}function hn(e={}){let t=e.score_components||e;return`<div class="bench-metrics">
    ${Pt("Law Recall",Ut(t.law_recall))}
    ${Pt("Article Recall",Ut(t.article_recall))}
    ${Pt("Citation Valid",Ut(t.citation_valid_rate))}
    ${Pt("Judge",St(t.judge_overall))}
    ${Pt("Human",St(t.human_overall))}
    ${Pt("p50",re(e.duration_p50_ms))}
    ${Pt("p95",re(e.duration_p95_ms))}
    ${Pt("Success",`${c(e.success||0)} / ${c(e.total||0)}`)}
  </div>`}function $n(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${n(s.replace(/^rag\./,""))}</span>
      <strong>${re(a.p50_ms)}</strong>
      <small>p95 ${re(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function yn(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${Ut(s.law_recall)}</span>
    <span>Article ${Ut(s.article_recall)}</span>
    <span>Judge ${St(s.judge_overall)}</span>
    <span>p95 ${re(t.duration_p95_ms)}</span>`}function wn(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function _n(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${n(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${n(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${n(e.status||"")}">${Rs(e.status)}</span>
      <span class="mono">${n(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${n(ye(e.started_at))}</span>
      <span data-bench-slot="run-completed">${c(e.completed_cases||0)} / ${c(e.total_cases||0)} \u984C</span>
      <span>${n(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${n(wn(e))}">${yn(e)}</span>
  </button>`}function va(e,t=[]){let s=e.metrics||{},a=e.judge||{},r=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([m])=>m.startsWith("rag.")).map(([m,v])=>`<span class="chip">${n(m)} ${re(v)}</span>`).join(""),d=(e.law_sources||[]).map(m=>`<span class="chip">${n(m.law_name||"\u6CD5\u898F")} ${c((m.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${n(e.question)}</span>
      ${Rs(e.status)}
      <span class="bench-case-time">${re(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${St(i.deterministic)} \xB7 Judge ${St(i.judge)} \xB7 Human ${St(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${n((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${n(e.fingerprint||"")}">${u("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
      </div>
      <div class="bench-case-stages">${l||'<span class="qb-muted">\u6C92\u6709 stage timing</span>'}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${Ut(s.law_recall)}</span>
        <span>Article recall ${Ut(s.article_recall)}</span>
        <span>Citation ${s.citation_valid?"valid":"invalid"}</span>
        <span>Refusal ${s.refusal_correct===null?"\u2014":s.refusal_correct?"correct":"wrong"}</span>
      </div>
      <div class="chips">${d||'<span class="qb-muted">\u6C92\u6709\u6CD5\u898F\u4F86\u6E90</span>'}</div>
      <div class="bench-answer"><strong>\u56DE\u7B54</strong><p>${n(e.answer||"\u2014")}</p></div>
      <div class="bench-judge"><strong>LLM judge</strong><p>${n(a.rationale||a.reason||"\u2014")}</p><span>${[["correctness",a.correctness],["grounding",a.grounding],["citation",a.citation],["clarity",a.clarity],["overall",a.overall]].map(([m,v])=>`${m} ${v??"\u2014"}`).join(" \xB7 ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${e.id}">
        <div class="bench-human-grid">
          ${[["correctness","\u6B63\u78BA\u6027",r.scores?.correctness??4],["grounding","\u6709\u64DA\u6027",r.scores?.grounding??4],["citation","\u5F15\u7528",r.scores?.citation??4],["clarity","\u6E05\u695A",r.scores?.clarity??4],["overall","\u6574\u9AD4",r.overall??4]].map(([m,v,w])=>`<label class="field"><span class="field-label">${v} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${m}" value="${n(String(w))}" /></label>`).join("")}
        </div>
        <label class="field"><span class="field-label">\u4EBA\u5DE5\u6279\u6CE8</span><input class="input" name="comment" value="${n(r.comment||"")}" placeholder="\u56DE\u7B54\u54C1\u8CEA\u3001\u5F15\u7528\u6216\u4E8B\u5BE6\u932F\u8AA4" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${u("check",13)}<span>\u5132\u5B58\u4EBA\u5DE5\u8A55\u5206</span></button>
      </form>
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(m=>`<div class="bench-history-row"><span>${n(ye(m.run?.started_at))}</span><span>${n(m.run?.config?.llm_model||"\u2014")}</span><span>Det ${St(m.metrics?.scores?.deterministic)}</span><span>Judge ${St(m.metrics?.scores?.judge)}</span><span>Human ${St(m.metrics?.scores?.human)}</span><span>${re(m.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function ba(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function kn(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${va(e,t)}
  </details>`}function Sn(e){return`${Rs(e.status)}
    <span class="mono">${n(e.run_id)}</span>
    ${bs(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${n(e.run_id)}">${u("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function ui(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${n(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${u("activity",14)}${n(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${n((e.status||"")+":"+e.run_id)}">
        ${Sn(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${hn(e.summary||{})}</div>
    <div data-bench-detail="stages">${$n(e.summary||{})}</div>
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
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>kn(a,t[a.fingerprint]||[])).join(""):_e({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function xn(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${u("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${n(e.run_id)}">${u("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function qn(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),r=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,r-i):0,l=(t||[]).filter(h=>["success","failed"].includes(h.status)).map(h=>Number(h.duration_ms)||0).filter(h=>h>0),d=null;if(l.length)d=l.reduce((h,y)=>h+y,0)/l.length;else if(a>0){let h=Date.parse(e.updated_at||""),y=Number.isFinite(h)?h:i;Number.isFinite(y)&&y>i?d=(y-i)/a:o>0&&(d=o/a)}let m=(t||[]).find(h=>h.status==="running")||null,v=0;if(a<s&&d&&d>0){let h=m?Date.parse(m.started_at||""):NaN,y=Date.parse(e.updated_at||""),S=Number.isFinite(h)?h:y;Number.isFinite(S)&&(v=Math.max(0,Math.min(.95,(r-S)/d)))}let w=Math.min(s,a+v),$=s>0?Math.max(0,Math.min(100,w/s*100)):0,g=d===null?null:Math.max(0,s-w)*d;return{total:s,completed:a,elapsedMs:o,averageMs:d,progress:$,etaMs:g,ratePerMin:d?6e4/d:null,running:m}}function An(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${re(e)}`}function Ln(e,t=[]){let s=qn(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${n(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${c(s.completed)} / ${c(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${An(s.etaMs)}</span>
      <span data-bench-slot="progress-rate">${s.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${s.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`}</span>
    </div>
    <div class="processing-bar processing-bar-lg bench-progress-bar${s.completed===0?" is-waiting":""}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.progress.toFixed(1)}" data-bench-slot="progress-bar">
      <span class="processing-bar-fill" data-bench-slot="progress-fill" style="width:${s.progress.toFixed(2)}%"></span>
    </div>
    <div class="bench-progress-foot">
      <span data-bench-slot="progress-elapsed">\u5DF2\u57F7\u884C ${re(s.elapsedMs)}</span>
      <span data-bench-slot="progress-average">${s.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${re(s.averageMs)}\uFF0F\u984C`}</span>
      <span>\u5373\u6642\u9810\u4F30 \xB7 \u6BCF\u5B8C\u6210\u4E00\u984C\u6821\u6B63</span>
    </div>
  </div>`}function pi(e){let t=e.models?.models||{},s=e.suites||[],a=fs(e),r=e.selectedRun;return`<section class="report-card bench-card">
    <div class="side-card-head">
      <span class="side-card-title">${u("brain",14)}RAG Benchmark</span>
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
      <label class="field"><span class="field-label">Run \u6A19\u7C64</span><input class="input" name="label" value="${n(e.config.label||ns())}" /></label>
      <div class="qb-actions" data-bench-actions data-signature="${n(a?`${a.run_id}:${a.status}`:"")}">
        ${xn(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${n(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?Ln(a,ha(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>_n(i,r?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${r?ui(r,e.history):""}
  </section>`}function fs(e){let t=(e.runs||[]).find(s=>bs(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!bs(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function ha(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function Mn(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:ns(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",pollTimer:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),r=R=>{let x=new FormData(R);return{label:String(x.get("label")||"").trim()||ns(),embedding_model:String(x.get("embedding_model")||""),llm_model:String(x.get("llm_model")||""),judge_model:String(x.get("judge_model")||""),top_k:Number(x.get("top_k")||4),score_threshold:Number(x.get("score_threshold")||.35),repeats:Number(x.get("repeats")||1),enable_law_retrieval:R.elements.enable_law_retrieval?.checked??!0,judge_enabled:R.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(R=>`${R.id}:${R.name}:${R.item_count}:${R.version}:${R.status}`)]:null,runs:(s.runs||[]).map(R=>`${R.run_id}:${R.label||""}:${R.suite_version||1}`)}),o=()=>{let x=a()?.querySelector("[data-bench-live]"),C=fs(s);if(!x||!C)return;let Z=qn(C,ha(s,C)),ie=(Y,pe)=>{let se=x.querySelector(`[data-bench-slot="${Y}"]`);se&&se.textContent!==pe&&(se.textContent=pe)};ie("progress-count",`${c(Z.completed)} / ${c(Z.total)} \u984C`),ie("progress-percent",`${Z.progress.toFixed(1)}%`),ie("progress-eta",An(Z.etaMs)),ie("progress-rate",Z.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${Z.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),ie("progress-elapsed",`\u5DF2\u57F7\u884C ${re(Z.elapsedMs)}`),ie("progress-average",Z.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${re(Z.averageMs)}\uFF0F\u984C`),ie("progress-state",C.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let T=x.querySelector('[data-bench-slot="progress-bar"]');T&&(T.setAttribute("aria-valuenow",Z.progress.toFixed(1)),T.classList.toggle("is-waiting",Z.completed===0));let U=x.querySelector('[data-bench-slot="progress-fill"]');U&&(U.style.width=`${Z.progress.toFixed(2)}%`)},l=R=>{let x=R.querySelector("[data-bench-actions]");if(!x)return;let C=fs(s),Z=C?`${C.run_id}:${C.status}`:"";x.dataset.signature!==Z&&(x.dataset.signature=Z,x.innerHTML=xn(C))},d=R=>{let x=R.querySelector("[data-bench-live-wrap]");if(!x)return;let C=fs(s),Z=C?`${C.run_id}:${C.status}:${C.total_cases}`:"";x.dataset.signature!==Z&&(x.dataset.signature=Z,x.innerHTML=C?Ln(C,ha(s,C)):"")},m=R=>{let x=R.querySelector("[data-bench-runs]");if(!x)return;let C=s.runs||[],Z=[...x.querySelectorAll("[data-run-id]")].map(T=>T.dataset.runId),ie=C.map(T=>T.run_id);if(Z.join("|")!==ie.join("|")){x.innerHTML=C.length?C.map(T=>_n(T,s.selectedRun?.run_id===T.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let T of C){let U=x.querySelector(`[data-run-id="${T.run_id}"]`);if(!U)continue;U.classList.toggle("is-active",s.selectedRun?.run_id===T.run_id);let Y=U.querySelector('[data-bench-slot="run-label"]');Y&&Y.textContent!==(T.label||"RAG Benchmark")&&(Y.textContent=T.label||"RAG Benchmark");let pe=U.querySelector('[data-bench-slot="run-status"]');pe&&pe.dataset.status!==(T.status||"")&&(pe.dataset.status=T.status||"",pe.innerHTML=Rs(T.status));let se=U.querySelector('[data-bench-slot="run-completed"]');if(se){let ke=`${c(T.completed_cases||0)} / ${c(T.total_cases||0)} \u984C`;se.textContent!==ke&&(se.textContent=ke)}let ee=U.querySelector('[data-bench-slot="run-scores"]'),fe=wn(T);ee&&ee.dataset.signature!==fe&&(ee.dataset.signature=fe,ee.innerHTML=yn(T))}},v=R=>{let x=s.selectedRun;if(!x)return;let C=R.querySelector(`.bench-detail[data-run-id="${x.run_id}"]`);if(!C)return;let Z=C.querySelector("[data-bench-detail-actions]");if(Z){let ee=`${x.status||""}:${x.run_id}`;Z.dataset.signature!==ee&&(Z.dataset.signature=ee,Z.innerHTML=Sn(x))}let ie=C.querySelector('[data-bench-detail="metrics"]');if(ie){let ee=JSON.stringify(x.summary||{});ie.dataset.signature!==ee&&(ie.dataset.signature=ee,ie.innerHTML=hn(x.summary||{}))}let T=C.querySelector('[data-bench-detail="stages"]');if(T){let ee=JSON.stringify((x.summary||{}).stages||{});T.dataset.signature!==ee&&(T.dataset.signature=ee,T.innerHTML=$n(x.summary||{}))}let U=C.querySelector("[data-bench-cases]");if(!U)return;let Y=x.cases||[];if(!Y.length)return;let pe=U.querySelector(".notice");pe&&pe.remove();let se=new Map([...U.querySelectorAll("details.bench-case")].map(ee=>[Number(ee.dataset.resultId),ee]));for(let ee of Y){let fe=s.history[ee.fingerprint]||[],ke=ba(ee,fe),Ae=se.get(Number(ee.id));if(!Ae){U.insertAdjacentHTML("beforeend",kn(ee,fe)),Ae=U.lastElementChild,Ae&&(Ae._benchSignature=ke);continue}if(Ae._benchSignature===ke||!s.forcedCaseIds.delete(Number(ee.id))&&Ae.contains(document.activeElement))continue;let ue=Ae.open;Ae.innerHTML=va(ee,fe),Ae.open=ue,Ae._benchSignature=ke}},w=()=>{fs(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},$=()=>{let R=a();R&&(l(R),d(R),m(R),v(R),o(),w())},g=R=>{let x=s.selectedRun;if(!x)return;let C=R.querySelector('[data-bench-detail="metrics"]');C&&(C.dataset.signature=JSON.stringify(x.summary||{}));let Z=R.querySelector('[data-bench-detail="stages"]');Z&&(Z.dataset.signature=JSON.stringify((x.summary||{}).stages||{}));let ie=R.querySelector("[data-bench-cases]");if(!ie)return;let T=new Map((x.cases||[]).map(U=>[Number(U.id),U]));for(let U of ie.querySelectorAll("details.bench-case")){let Y=T.get(Number(U.dataset.resultId));Y&&(U._benchSignature=ba(Y,s.history[Y.fingerprint]||[]))}},h=(R=!1)=>{let x=a();if(!x)return;let C=i();if(!R&&s.renderSignature===C){$();return}s.renderSignature=C,s.forcedCaseIds.clear(),x.innerHTML=pi(s),g(x),$()},y=async({refreshAll:R=!1}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||R;return}s.loading=!0;try{if(!s.referenceLoaded||R){let[Y,pe]=await Promise.all([H.benchmarkModels(),H.benchmarkSuites()]);s.models=Y,s.suites=pe.suites||[],s.indexVersion=Y.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=Y.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=Y.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(Y.models?.llm||[]).find(se=>se!==s.config.llm_model)||"")}let x=await H.benchmarkRuns(30);s.runs=x.runs||[];let C=s.activeRunId,Z=s.runs.find(Y=>bs(Y.status))||null;s.activeRunId=Z?.run_id||"";let ie=s.selectedRun?.run_id||"";ie||(ie=Z?.run_id||s.runs[0]?.run_id||"");let T=!!(s.selectedRun&&C&&s.selectedRun.run_id===C);ie&&(!s.selectedRun||s.selectedRun.run_id!==ie||ie===Z?.run_id||T)?s.selectedRun=await H.benchmarkRun(ie,!0):ie||(s.selectedRun=null),s.loaded=!0,h()}catch(x){if(!s.loaded){s.renderSignature="";let C=a();C&&(C.innerHTML=_e({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:n(x.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let x=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,y({refreshAll:x})}else S()}},S=()=>{s.pollTimer&&window.clearTimeout(s.pollTimer),s.pollTimer=null,(s.runs||[]).some(R=>bs(R.status))&&(s.pollTimer=window.setTimeout(()=>{y()},2500))},N=async R=>{try{s.selectedRun=await H.benchmarkRun(R,!0),h(),S()}catch(x){L(x.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},D=async R=>{!s.labelTouched&&R.elements.label&&(R.elements.label.value=ns());let x=r(R);s.config=x;let C=Number(R.elements.suite_id?.value||0);if(!C){L("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await H.startBenchmarkRun({suite_id:C,config:x,actor:"anonymous"}),L("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=ns(),s.labelTouched=!1,await y()}catch(Z){L(Z.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},B=async R=>{try{await H.stopBenchmarkRun(R),L("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await y()}catch(x){L(x.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},Q=async R=>{let x=Number(R.dataset.resultId||0),C=new FormData(R),Z={};for(let ie of["correctness","grounding","citation","clarity","overall"]){let T=Number(C.get(`score_${ie}`));Number.isFinite(T)&&(Z[ie]=T)}try{await H.reviewBenchmarkResult(x,{reviewer:"anonymous",scores:Z,comment:String(C.get("comment")||"")}),L("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await H.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(x)),h()}catch(ie){L(ie.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},ne=async R=>{if(R)try{let x=await H.benchmarkFingerprintHistory(R,50);s.history[R]=x.cases||[];let C=s.selectedRun,Z=a();if(!C||!Z)return;let ie=(C.cases||[]).filter(T=>T.fingerprint===R);for(let T of ie){let U=Z.querySelector(`details.bench-case[data-result-id="${T.id}"]`);if(!U)continue;let Y=U.open;U.innerHTML=va(T,s.history[R]),U.open=Y,U._benchSignature=ba(T,s.history[R])}}catch(x){L(x.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},te=async R=>{let x=R.target.closest("[data-bench-action]");if(!x)return;let C=x.dataset.benchAction;C==="open-run"?await N(x.dataset.runId||""):C==="stop"?await B(x.dataset.runId||""):C==="fingerprint-history"&&await ne(x.dataset.fingerprint||"")},$e=async R=>{let x=R.target.closest("[data-bench-form]");x&&(R.preventDefault(),x.dataset.benchForm==="run"?await D(x):x.dataset.benchForm==="human"&&await Q(x))},qe=R=>{R&&(R.elements.label&&R.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=r(R),R.elements.suite_id&&(s.selectedSuiteId=Number(R.elements.suite_id.value)||s.selectedSuiteId))},J=R=>{let x=R.target.closest('[data-bench-form="run"]');x&&qe(x)};return e.addEventListener("click",te),e.addEventListener("submit",$e),e.addEventListener("input",J),e.addEventListener("change",J),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=ns();let R=a()?.querySelector('input[name="label"]');R&&(R.value=s.config.label)}y({refreshAll:!s.referenceLoaded})},refresh(){return y({refreshAll:!0})},destroy(){e.removeEventListener("click",te),e.removeEventListener("submit",$e),e.removeEventListener("input",J),e.removeEventListener("change",J),s.pollTimer&&window.clearTimeout(s.pollTimer),s.tickTimer&&window.clearInterval(s.tickTimer)}}}var qa={};Mt(qa,{exportCsv:()=>Fs,exportableResult:()=>Hs,render:()=>Wi,renderReport:()=>Os,reportError:()=>Ds,reportLoading:()=>vs});var In=[10,25,50,100],jn=500,mi=["law_name","law_level","law_category","law_modified_date","article_count"],gi=["jid","court_normalized","title","jdate","matched_laws","citation_count"],fi={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function Bs(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function Ps(e,t){let s={};for(let a of e.fields||[]){let r=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?r:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{},fuzzyTerms:[]}}function bi(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,r]of Object.entries(s))if(Array.isArray(r)&&!r.map(String).includes(String(t[a]??"")))return!1;return!0}function xa(e,t){return(e.fields||[]).filter(s=>bi(s,t))}function vi(e,t){return`filter-${e.id}-${t}`}function Qt(e){return e==null?"":n(String(e))}function $a(e,t,s){let a=s[t.key],r=vi(e,t.key),i=t.help?`<span class="field-help">${n(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(d=>`<option value="${Qt(d.value)}" ${String(d.value)===String(a??"")?"selected":""}>${n(d.label??d.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${r}" name="${n(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),d=(t.options||[]).map(m=>`<label class="multi-option">
          <input type="checkbox" name="${n(t.key)}" value="${Qt(m.value)}" ${l.has(String(m.value))?"checked":""} />
          <span>${n(m.label??m.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${d}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${r}" name="${n(t.key)}"
        value="${Qt(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${Qt(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${r}" name="${n(t.key)}"
        value="${Qt(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${r}" name="${n(t.key)}"
      value="${Qt(a)}"
      placeholder="${Qt(t.placeholder||"")}" />
    ${i}
  </div>`}function Tn(e,t,{focusTable:s=!1}={}){let a=xa(e,t.values),r=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(r.push(`<div class="field-row">${$a(e,o,t.values)}${$a(e,l,t.values)}</div>`),i+=1):r.push($a(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
    <div class="filter-block">
      <div class="filter-head">
        <span class="filter-title">Metadata \u689D\u4EF6</span>
        <button class="filter-reset" type="button" data-action="reset">\u91CD\u8A2D</button>
      </div>
      <div class="filter-fields">${r.join("")}</div>
    </div>
    <div class="sidebar-actions">
      <button class="btn btn-primary" type="submit" id="run-query" ${s?'data-focus-table="true"':""}>
        ${u("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
      </button>
    </div>
  </form>`}function Is(e,t,s){let a={...s.values};for(let r of xa(t,a))if(r.type==="checkbox"){let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=!!i?.checked}else if(r.type==="multiselect")a[r.key]=Array.from(e.querySelectorAll(`[name="${r.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=i?i.value:""}return a}function On(e,t){let s={};for(let a of xa(e,t.values)){let r=t.values[a.key];a.type==="checkbox"?s[a.key]=!!r:a.type==="multiselect"?s[a.key]=Array.isArray(r)?r:[]:a.type==="number"?s[a.key]=r===""||r===null?"":Number(r):s[a.key]=r??""}return s}function ya(e,t){let s=On(e,t);return Array.isArray(t.fuzzyTerms)&&t.fuzzyTerms.length&&(s.keywords=[...t.fuzzyTerms]),(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function hi(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${_e({tone:t,title:`${Bs(e)} ${vt(e.status).label}`,text:n(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function $i(e,t){return`<label class="field data-source-field">
    <span class="field-label">\u8CC7\u6599\u4F86\u6E90</span>
    <select class="select" name="database">
      ${e.map(s=>{let a=vt(s.status);return`<option value="${n(s.id)}" ${s.id===t?"selected":""}>${n(s.label)} \xB7 ${n(a.label)}</option>`}).join("")}
    </select>
  </label>`}function En(e,t){return`<nav class="data-nav" aria-label="\u8CC7\u6599\u67E5\u8A62\u529F\u80FD">
    ${[{id:"law",label:"\u67E5\u8A62\u6CD5\u898F\u547D\u4EE4",hint:"Fuzzy \u6CD5\u898F\u540D\u7A31\u3001\u985E\u5225\u8207\u547D\u4EE4",icon:"file"},{id:"judgment",label:"\u67E5\u8A62\u5224\u6C7A",hint:"Fuzzy \u6CD5\u9662\u3001\u6848\u865F\u8207\u6848\u7531",icon:"layers"},{id:"schema",label:"\u8CC7\u6599\u5EAB Schema",hint:"\u8CC7\u6599\u8868\u3001\u6B04\u4F4D\u8207\u9810\u89BD",icon:"table"}].map(a=>{let r=a.id==="schema"?t==="schema":t==="query"&&e===a.id;return`<button class="data-nav-item${r?" is-active":""}" type="button"
          data-action="data-nav" data-tab="${a.id}" ${r?'aria-current="page"':""}>
          <span class="data-nav-icon">${u(a.icon,15)}</span>
          <span class="data-nav-copy">
            <strong>${n(a.label)}</strong>
            <small>${n(a.hint)}</small>
          </span>
        </button>`}).join("")}
  </nav>`}function yi(e,t,s){if(t.id!=="postgres"&&t.id!=="parquet")return"";let a=Array.isArray(s.fuzzyTerms)?s.fuzzyTerms:[],r=e==="law"?"Fuzzy \u6CD5\u898F\uFF0F\u547D\u4EE4":"Fuzzy \u5224\u6C7A",i=e==="law"?"\u8F38\u5165\u6CD5\u898F\u540D\u7A31\u6216\u76F8\u8FD1\u5B57\u2026":"\u8F38\u5165\u6CD5\u9662\u3001\u6848\u865F\u3001\u6848\u7531\u6216\u76F8\u8FD1\u5B57\u2026";return`<div class="data-fuzzy" data-data-fuzzy data-fuzzy-kind="${e}">
    <div class="data-fuzzy-head">
      <span class="filter-title">${r}</span>
      <span class="field-tag">\u591A\u689D\u4EF6 AND</span>
    </div>
    <div class="data-fuzzy-row">
      <div class="data-fuzzy-values">
        ${a.length?a.map(o=>`<span class="chip data-fuzzy-chip">${n(o)}<button class="data-fuzzy-remove" type="button" data-action="remove-fuzzy-term" data-term="${n(o)}" aria-label="\u79FB\u9664 ${n(o)}">${u("x",9)}</button></span>`).join(""):`<span class="data-fuzzy-placeholder">${i}</span>`}
      </div>
      <button class="data-fuzzy-add" type="button" data-action="open-fuzzy" aria-label="\u52A0\u5165 fuzzy \u689D\u4EF6" aria-haspopup="listbox">${u("plus",13)}</button>
    </div>
    <div class="data-fuzzy-popover" data-data-fuzzy-popover hidden>
      <input class="input" type="search" data-data-fuzzy-search placeholder="${i}" autocomplete="off" />
      <div class="data-fuzzy-results" data-data-fuzzy-results role="listbox" aria-live="polite"></div>
    </div>
  </div>`}function wa(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],r=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function wi(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||n(e.detail||"")}function _i(e){return`<div class="report-empty">
    ${We({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:n({postgres:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u6CD5\u898F\u6216\u5224\u6C7A\u689D\u4EF6\uFF0C\u518D\u8996\u9700\u8981\u5C55\u958B\u9032\u968E metadata \u689D\u4EF6\u3002",parquet:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u689D\u4EF6\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\uFF1B\u53EF\u5C55\u958B\u9032\u968E\u689D\u4EF6\u8ABF\u6574\u6B04\u4F4D\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
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
  </div>`}function vs(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(Bs(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function Ds(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(Bs(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${_e({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${u("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function ki(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,r=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${n(s.label||"\u672A\u5206\u985E")}">${n(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${r.toFixed(1)}%"></span></span>
          <span class="dist-value">${c(a)}</span>
        </div>`}).join("")}
  </div>`}function Bn(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function Si(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function xi(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function qi(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${n(String(t))}"
    title="\u6AA2\u8996\u300C${n(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${n(String(t))}${u("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var Ai={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function Li(e,t,s,a=!1,r=!0,i=!1){let o=a?e.key:e.label||e.key,l=r?t?Ai[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${n(o)}</th>`;let d=s?.key===l,m=d?s.direction:null,v=m==="asc"?"ascending":m==="desc"?"descending":"none",w=m==="asc"?"\u2191":m==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${v}">
    <button class="table-sort${d?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${n(l)}"
      title="\u4F9D${n(o)}\u6392\u5E8F">
      <span>${n(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${w}</span>
    </button>
  </th>`}function Mi(e,t){if(!Bn(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,r=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(r||""),lawName:String(t.law_name||"")}}function ji(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${n(s.lawKey)}"
    data-law-source="${n(s.sourceType)}"
    data-law-name="${n(s.lawName)}"
    title="\u6AA2\u8996\u300C${n(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(String(a))}${u("chevronRight",12,"law-link-icon")}</button>`}function Dn(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:r=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],d=(e.page-1)*e.page_size,m=Bn(e),v=Si(e),w=xi(e),$=e.meta?.sort||null,g=r?`<tr class="schema-search-row">
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
      <span class="muted" style="font-size:10px">${c(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${m?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":v?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":w?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${g}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(h=>Li(h,v,$,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((h,y)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${d+y+1}</td>
                ${o.map(S=>{if((v||w)&&S.key==="jid")return`<td class="cell-jid">${qi(h)}</td>`;let N=m&&S.key==="law_name"?Mi(e,h):null;if(N)return`<td>${ji(h,S,N)}</td>`;let B={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[S.type];return`<td${B?` class="${B}"`:""}>${js(h[S.key],S.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${We({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function Ti(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${In.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${u("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${u("chevronRight",13)}</button>
    </div>
  </div>`}function Fn(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${n(t)}</div>`).join("")}</div>`}function Os(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],r=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",d=e.status||"ok",m=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${n(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${n(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${n(e.label||l)}
          ${je(d)}
          <span class="chip">${n(m)}</span>
        </div>
        <div class="report-sub">
          ${c(i)} \u7B46\u7B26\u5408 \xB7
          ${re(e.duration_ms)} \xB7
          ${n(String(l).toUpperCase())} / ${n(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${u("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${u("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${_e({tone:d==="not_configured"?"info":d==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:""}

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
        ${ki(r)}
      </div>
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5BE6\u969B\u67E5\u8A62\u8A9E\u53E5</span>
          <span class="muted" style="font-size:9.5px">${n(e.database==="indexeddb"?"client-side":"read-only")}</span>
        </div>
        <div class="query-box">
          <pre class="query-code">${n(o||"\u2014")}</pre>
          <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
            ${u("copy",12)}<span>\u8907\u88FD</span>
          </button>
        </div>
        ${Fn(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?Dn(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?Ti({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function Nn(e){return`<div class="report-card schema-preview">
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
  </div>`}function _a(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let r=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${_e({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${n(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${n(t||e.table||"\u8CC7\u6599\u8868")}
          ${je(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${n(String(e.database||""))} / ${n(String(e.table||"\u2014"))} \xB7 ${r.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${Dn({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${Fn(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${c(i.length)} \u7B46</span>
      <strong>\u5171 ${c(e.total)} \u7B46</strong>
    </div>
  </div>`}function Cn(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${n(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${_e({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function Ei(e){return`<div class="report-empty">
    ${We({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${Bs(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function ka(e){return e.is_current===!0?je("ok","\u73FE\u884C"):e.law_abandon_note?je("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?je("empty","\u6B77\u53F2\u7248\u672C"):je("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function De(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${n(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function Gt(e){return e?bt(e):"\u2014"}function Ni(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function Sa(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${n(e)}</span>
    </div>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </div>`:""}function Ci(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${n(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${u("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </details>`:""}function Ri(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let r=a?.name||a?.url||"";return r?a.url?`<a class="law-attachment" href="${n(a.url)}" target="_blank" rel="noopener noreferrer">
          ${u("file",12)}<span>${n(r)}</span>${u("external",11)}
        </a>`:`<span class="law-attachment">${u("file",12)}<span>${n(r)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${c(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function Hn(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Pi(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,r=s?`${c(a)} \u689D \xB7 ${c(s)} \u7AE0\u7BC0`:`${c(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${n(l)}</div>`;let d=fi[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${n(Hn(o.article_no))}">
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
  </div>`}function Ii(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function rs(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${u("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function Oi(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${rs()}
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
  </div>`}function Bi(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${rs()}
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
        ${_e({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function Di(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let r=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",r,a.article_count_for_law?`${c(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${n(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${n(i)}</option>`}).join("")}
    </select>
  </label>`}function Fi(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let r={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${r[o]} ${c(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">\u7248\u672C\u8B8A\u66F4</span>
      <span class="muted">${n(i)}</span>
    </summary>
    <div class="law-version-change-list">
      ${a.length?a.slice(0,20).map(o=>{let l=o.change_type==="added"?"badge-ok":o.change_type==="removed"?"badge-danger":"badge-warn",d=o.before_content?`<details><summary>\u8B8A\u66F4\u524D</summary><pre>${n(o.before_content)}</pre></details>`:"",m=o.after_content?`<details><summary>\u8B8A\u66F4\u5F8C</summary><pre>${n(o.after_content)}</pre></details>`:"";return`<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${l}">${n(r[o.change_type]||o.change_type)}</span>
                    <strong>${n(o.article_no||o.article_key)}</strong>
                  </div>
                  ${d}${m}
                </div>`}).join(""):'<div class="report-empty-inline">\u6B64\u7248\u672C\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u8B8A\u66F4\u3002</div>'}
      ${e.changes_truncated?'<div class="report-empty-inline">\u50C5\u986F\u793A\u524D 20 \u7B46\u8B8A\u66F4\uFF1BAPI \u56DE\u50B3\u4E0A\u9650 200 \u7B46\u3002</div>':""}
    </div>
  </details>`}function Hi(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let r=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(y=>y.article_type!=="C").length,l=Ni(e),d=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",m=e.meta?.snapshot||"",v=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",w=[l,d,v,m].filter(Boolean).join(" \xB7 "),$=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",g=e.version||{},h=[De("\u6CD5\u898F\u4F4D\u968E",n(e.law_level||"\u2014")),De("\u6CD5\u898F\u985E\u5225",n(e.law_category||"\u2014")),De("\u7570\u52D5\u65E5\u671F",Gt(e.law_modified_date)),De("\u751F\u6548\u65E5\u671F",Gt(e.law_effective_date)),De("\u689D\u6587\u6578",c(e.article_count)),De("\u8CC7\u6599\u72C0\u614B",ka(e)),De("\u82F1\u8B6F\u540D\u7A31",n(e.eng_law_name||"\u2014")),De("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${n(e.law_key||"\u2014")}</span>`)];return g.first_seen_version_id!==null&&g.first_seen_version_id!==void 0&&h.push(De("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${n(g.first_seen_version_id)}`)),g.last_seen_version_id!==null&&g.last_seen_version_id!==void 0&&h.push(De("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${n(g.last_seen_version_id)}`)),g.last_seen_at&&h.push(De("\u6700\u5F8C\u6536\u9304\u6642\u9593",n(ye(g.last_seen_at)))),g.selected_version_id!==null&&g.selected_version_id!==void 0&&h.push(De("\u689D\u6587\u7248\u672C",`#${n(g.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${rs()}
      <span class="law-report-origin" title="${n(w)}">${n(w)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${n(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${n(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${n(i)}
            ${ka(e)}
            <span class="chip">${n($)}</span>
          </div>
          <div class="report-sub">
            ${n([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${c(e.article_count)} \u689D \xB7 \u7570\u52D5 ${Gt(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${Di(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">${u("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${r.length?`<div class="report-alert">${_e({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r.map(y=>n(y)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${c(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${Gt(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${n(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${ka(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${n(l)}</span>
        </div>
        <div class="law-meta-grid">${h.join("")}</div>
      </div>

      ${Fi(e)}
      ${Sa("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${Ci("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${Sa("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${Sa("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${Ri(e.attachments)}
      ${Pi(e)}
    </div>
    ${o>100?Ii():""}
  </div>`}function zi(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${rs()}
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
  </div>`}function Ui(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${rs()}
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
        ${_e({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function Qi(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${n(t)}"
    data-law-source=""
    data-law-name="${n(t)}"
    title="\u6AA2\u8996\u300C${n(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(t)}${u("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function Gi(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let r=String(s.article_no||"").trim();r&&t.get(a).add(r)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${Qi(s)}
          <span class="judgment-citation-articles">${[...a].map(r=>n(r)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function Ji(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",r=String(e.full_text||""),i=Number(e.full_text_length)||r.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[De("\u6848\u865F",n(e.jid||"\u2014")),De("\u5E74\u5EA6",n(e.jyear||"\u2014")),De("\u5B57\u5225",n(e.jcase||"\u2014")),De("\u865F\u78BC",n(e.jno||"\u2014")),De("\u6CD5\u9662",n(e.court||"\u2014")),De("\u6848\u7531",n(e.title||"\u2014")),De("\u88C1\u5224\u65E5\u671F",Gt(e.jdate)),De("\u4F86\u6E90\u58D3\u7E2E\u6A94",n(e.source_archive||"\u2014")),De("\u5168\u6587\u9577\u5EA6",`${c(i)} \u5B57`),De("\u5F15\u7528\u6578",c(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(De("\u532F\u5165 Run",`#${n(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${rs()}
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
            ${n(e.court||"\u2014")} \xB7 ${Gt(e.jdate)} \xB7
            ${c(i)} \u5B57
          </div>
        </div>
        <div class="report-actions">
          ${e.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(e.pdf_url)}" target="_blank" rel="noopener noreferrer">${u("external",14)}<span>PDF</span></a>`:""}
        </div>
      </div>

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u88C1\u5224\u65E5\u671F</div>
          <div class="summary-value">${Gt(e.jdate)}</div>
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
        ${Gi(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${c(i)} \u5B57</span>
        </div>
        ${r?`<div class="judgment-fulltext">${n(r)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function Rn(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function Fs(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(Rn).join(",")],r=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([r+o+1,...t.map(l=>i[l.key])].map(Rn).join(","))}),`\uFEFF${a.join(`\r
`)}`}function Hs(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,r]of Object.entries(t))a.startsWith("_")||(s[a]=r);return s})}}function Vi(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function Pn(e,t){let s=performance.now(),a=On(e,t),r=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,d=[],m=[],v=[],w=[];if(r==="audit_events"){try{let B=Number(await Rt("audit.last_event_id",0))||0,Q=await H.versioningAudit({since_id:B,limit:500}),ne=Array.isArray(Q?.events)?Q.events:[];ne.length&&await gn(ne.map($e=>({...$e,dataset:"judgment"})));let te=Number(Q?.latest_event_id||0);te>B&&await gs("audit.last_event_id",te)}catch(B){d.push(`\u7248\u672C audit \u540C\u6B65\u5931\u6557\uFF1A${B.message||B}`)}m=(await fn({keyword:i,limit:jn})).map(B=>({created_at:B.created_at,dataset:B.dataset,issue_month:B.issue_month,change_type:B.change_type,jid:B.jid,detail:B.detail})),v=[{key:"created_at",label:"\u6642\u9593",type:"datetime"},{key:"dataset",label:"\u8CC7\u6599\u96C6",type:"text"},{key:"issue_month",label:"\u6708\u4EFD",type:"mono"},{key:"change_type",label:"\u8B8A\u66F4",type:"status"},{key:"jid",label:"\u6848\u865F",type:"mono"},{key:"detail",label:"\u6458\u8981",type:"longtext"}];let D=new Map;m.forEach(B=>D.set(B.change_type||"unknown",(D.get(B.change_type||"unknown")||0)+1)),w=Array.from(D.entries()).map(([B,Q])=>({label:B,value:Q})).sort((B,Q)=>Q.value-B.value)}else if(r==="settings"){m=(await bn({keyword:i})).map(B=>({key:B.key,value:vn(B.value),updated_at:B.updated_at})),v=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let D=new Map;m.forEach(B=>{let Q=String(B.key||"").split(".")[0]||"\u5176\u4ED6";D.set(Q,(D.get(Q)||0)+1)}),w=Array.from(D.entries()).map(([B,Q])=>({label:B,value:Q})).sort((B,Q)=>Q.value-B.value)}else{m=(await Ns({keyword:i,limit:jn})).map(B=>({kind:Vi(B.kind),title:B.title,detail:B.detail,created_at:B.created_at})),v=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let D=new Map;m.forEach(B=>D.set(B.kind,(D.get(B.kind)||0)+1)),w=Array.from(D.entries()).map(([B,Q])=>({label:B,value:Q})).sort((B,Q)=>Q.value-B.value)}let $=m.length,g=(o-1)*l,h=m.slice(g,g+l),y=Math.round(performance.now()-s),S=un();return S&&d.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:S?"degraded":"ok",message:S?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:r,columns:v,rows:h,total:$,page:o,page_size:l,duration_ms:y,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String($)},{label:"\u76EE\u524D\u9801\u9762",value:`${h.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:Es()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${y} ms`}],distribution:w,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${r}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${g}`,warnings:d,meta:{store:r,filters:a,client_side:!0}}}async function Wi(e,t){let s=!1,a=null,r=[],i="law",o=null,l={},d=0,m=25,v="query",w=null,$=null,g=0,h=[],y=null,S=-1,N=0,D=0,B=null,Q=null,ne=null;e.innerHTML=`<section class="page data-page">
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
          ${u("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
  </section>`;let te=e.querySelector("#query-sidebar"),$e=e.querySelector("#data-nav"),qe=e.querySelector("#db-options-wrap"),J=e.querySelector("#filter-area"),R=e.querySelector("#schema-area"),x=e.querySelector("#query-main"),C=e.querySelector("#schema-suggest-popover"),Z=e.querySelector("#catalog-meta"),ie=e.querySelector("#refresh-catalog"),T=_=>r.find(q=>q.id===_),U=()=>T(i)?.databases||[],Y=_=>U().find(q=>q.id===_),pe=(_,q)=>`${_}:${q}`,se=(_,q=i)=>l[pe(q,_.id)],ee=(_,q)=>{gs(_,q).catch(()=>{})},fe=()=>{if(!a){Z.textContent="CATALOG \xB7 \u96E2\u7DDA",Z.className="badge badge-danger badge-mono";return}let _=U(),q=_.filter(p=>p.available).length,A=T(i);Z.textContent=`CATALOG \xB7 ${A?.label||i} \xB7 ${q}/${_.length} \u53EF\u7528`,Z.className="badge badge-neutral badge-mono"},ke=_=>{x.innerHTML=_i(_)},Ae=()=>{let _=Q?.returnScroll??ne?.returnScroll;Q=null,ne=null;let q=Y(o),A=q?se(q):null;v==="schema"&&$?.result?x.innerHTML=_a($.result,Fe(q,$.tableId),{columnFilters:$.columnFilters||{},searchEnabled:q.id==="postgres"||q.id==="parquet"}):A?.result?x.innerHTML=Os(A.result):q&&ke(q),typeof _=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:_,behavior:"smooth"}))},le=(_="law-article-jump")=>{let q=x.querySelector(`#${_}`),A=Hn(q?.value);if(!A){L("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),q?.focus();return}let b=[...x.querySelectorAll("[data-article-no]")].find(k=>k.dataset.articleNo===A);if(!b){L(`\u627E\u4E0D\u5230\u7B2C ${A} \u689D\u3002`,"warn");return}b.scrollIntoView({behavior:"instant",block:"center"}),b.classList.add("is-jump-target"),window.setTimeout(()=>b.classList.remove("is-jump-target"),2400)},ue=async({lawKey:_,sourceType:q="",lawName:A="",versionId:p=""})=>{let b=Y(o),k=b?se(b):null,j=v==="schema"?$?.result:null;if(!b||!k?.result&&!j||!_)return;let G=++d;Q={seq:G,lawKey:_,sourceType:q,lawName:A,versionId:p?String(p):"",page:1,detail:null,database:b.id,returnScroll:window.scrollY},ne=null,x.innerHTML=Oi(A||_),x.scrollIntoView({behavior:"smooth",block:"start"});try{let W=await H.lawDetail(_,q,Q.versionId);if(s||!Q||Q.seq!==G)return;Q.detail=W,Q.page=1,x.innerHTML=Hi(W,{database:Q.database,lawPage:Q.page})}catch(W){if(s||!Q||Q.seq!==G)return;x.innerHTML=Bi(W,A||_),L(W.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},we=async({jid:_})=>{let q=Y(o),A=q?se(q):null,p=v==="schema"?$?.result:null;if(!q||!A?.result&&!p||!_)return;let b=++d;Q=null;let k=q.id==="parquet"?"parquet":"postgres";ne={seq:b,jid:_,detail:null,database:q.id,source:k,returnScroll:window.scrollY},x.innerHTML=zi(_),x.scrollIntoView({behavior:"smooth",block:"start"});try{let j=await H.judgmentDetail(_,k);if(s||!ne||ne.seq!==b)return;ne.detail=j,x.innerHTML=Ji(j,{database:ne.database})}catch(j){if(s||!ne||ne.seq!==b)return;x.innerHTML=Ui(j,_),L(j.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},ge=(_,q)=>`${i}:${_.id}:${q}`,Fe=(_,q)=>(_.tables||[]).find(A=>A.id===q)?.label||q,Ie=(_,q,{sort:A=null,columnFilters:p={}}={})=>{let b={column_filters:p};return _.id==="postgres"?(b.table=q,b.schema_preview=!0):_.id==="parquet"&&i==="judgment"?(b.table="judgment_documents",b.columns=gi):_.id==="parquet"&&(b.dataset="all",b.columns=mi),A?.key&&(b.sort=`${A.key}:${A.direction}`),b},Be=async(_,q,{sort:A=null,columnFilters:p={},quiet:b=!1}={})=>{if(!q)return;Te();let k=ge(_,q),j=++g,G=!!(b&&$?.result&&$.key===k);w={tableId:q},$={key:k,tableId:q,loading:!0,result:null,error:null,sort:A,columnFilters:p},G?x.setAttribute("aria-busy","true"):(R.innerHTML=wa(_,T(i)?.label||i,q),x.innerHTML=Nn(Fe(_,q)));try{let W;if(_.id==="indexeddb"){let ae=Ps(_,10);ae.values.store=q,ae.page=1,W=await Pn(_,ae)}else _.id==="qdrant"?W={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:q,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(W=await H.query({database:_.id,filters:Ie(_,q,{sort:A,columnFilters:p}),page:1,pageSize:10}),A?.key&&(W.meta={...W.meta||{},sort:A}));if(s||j!==g)return;$={key:k,tableId:q,loading:!1,result:W,error:null,sort:A,columnFilters:p},x.removeAttribute("aria-busy"),v==="schema"&&w?.tableId===q&&(R.innerHTML=wa(_,T(i)?.label||i,q),x.innerHTML=_a(W,Fe(_,q),{columnFilters:p,searchEnabled:_.id==="postgres"||_.id==="parquet"}))}catch(W){if(s||j!==g)return;$={key:k,tableId:q,loading:!1,result:null,error:W,sort:A,columnFilters:p},x.removeAttribute("aria-busy"),v==="schema"&&w?.tableId===q&&(x.innerHTML=Cn(W,Fe(_,q)))}},M=()=>{let _=Y(o);if(!_)return null;if(v==="schema"&&$?.result)return{db:_,tableId:$.tableId,columnFilters:$.columnFilters||{},sort:$.sort||null,mode:"schema"};let q=_?se(_):null,A=q?.result;return A&&(_.id==="postgres"||_.id==="parquet")?{db:_,tableId:A.table,columnFilters:q.columnFilters||{},sort:q.sort||null,mode:"query"}:null},O=(_,q,A)=>{if(!_)return;let p=`${_.db.id}:${_.tableId}:${q}`,b=I.get(p);b&&(window.clearTimeout(b),I.delete(p)),Te();let k={..._.columnFilters||{}},j=String(A||"").trim();if(j?k[q]=j:delete k[q],_.mode==="schema"){Be(_.db,_.tableId,{sort:_.sort,columnFilters:k,quiet:!0});return}let G=se(_.db);G.columnFilters=k,G.page=1,Ue(1)},I=new Map,z=()=>{(!C||C.hidden)&&!h.length&&!y||(N+=1,h=[],y=null,S=-1,C&&(C.hidden=!0,C.innerHTML=""))},ce=(_,q)=>{let A=String(_||""),p=A.toLocaleLowerCase(),b=String(q||"").toLocaleLowerCase(),k=new Array(A.length).fill(!1),j=(ve,Me)=>{for(let Ne=ve;Ne<ve+Me;Ne+=1)Ne>=0&&Ne<k.length&&(k[Ne]=!0)},G=p.indexOf(b);if(G>=0)for(;G>=0;)j(G,b.length),G=p.indexOf(b,G+b.length);else{let ve=[];for(let Me of b.match(/[一-鿿]{2,}/g)||[])for(let Ne=0;Ne<Me.length-1;Ne+=1)ve.push(Me.slice(Ne,Ne+2));ve.push(...b.match(/[a-z0-9]+/g)||[]);for(let Me of ve){let Ne=p.indexOf(Me);for(;Ne>=0;)j(Ne,Me.length),Ne=p.indexOf(Me,Ne+Me.length)}}let W="",ae=0;for(;ae<A.length;)if(k[ae]){let ve=ae;for(;ve<A.length&&k[ve];)ve+=1;W+=`<mark>${n(A.slice(ae,ve))}</mark>`,ae=ve}else{let ve=ae;for(;ve<A.length&&!k[ve];)ve+=1;W+=n(A.slice(ae,ve)),ae=ve}return W||n(A)},V=(_,q)=>{if(!C)return;let A=_.getBoundingClientRect(),p=Math.min(420,Math.max(220,A.width)),b=Math.min(360,34+q*30),k=A.bottom+4;k+b>window.innerHeight-8&&(k=Math.max(8,A.top-b-4));let j=Math.min(window.innerWidth-p-8,Math.max(8,A.left));C.style.width=`${p}px`,C.style.left=`${j}px`,C.style.top=`${k}px`},xe=_=>{if(!C)return;let q=[...C.querySelectorAll(".schema-suggest-item")];q.length&&(S=Math.max(0,Math.min(q.length-1,_)),q.forEach((A,p)=>{A.classList.toggle("is-active",p===S)}),q[S].scrollIntoView({block:"nearest"}))},F=_=>{let q=h[_],A=y;!q||!A||(z(),O(A,A.column,q))},oe=async(_,q,A,p)=>{if(!_||!A.trim()){z();return}let b=++N;y={..._,column:q,input:p},S=-1;try{let k=await H.schemaSuggest({database:_.db.id,table:_.tableId,column:q,query:A,limit:1e3});if(b!==N||document.activeElement!==p||!C)return;let j=Array.isArray(k.values)?k.values:[];if(h=j,!j.length){z();return}let G=Number(k.total)>j.length?`\u5171 ${c(k.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${c(j.length)} \u500B`:`\u5171 ${c(k.total)} \u500B\u7B26\u5408`;C.innerHTML=`<div class="schema-suggest-head">${n(G)}</div>${j.map((W,ae)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${ae}"
            title="${n(W)}">${ce(W,A)}</button>`).join("")}`,V(p,j.length),C.hidden=!1}catch{z()}},Te=()=>{let _=document.activeElement;_ instanceof HTMLElement&&_.matches("[data-schema-search]")&&_.blur(),z()},Oe=(_,{resetReport:q=!1}={})=>{Te();let A=se(_);if($e.innerHTML=En(i,v),qe.innerHTML=$i(U(),_.id),v==="schema")J.hidden=!0,J.innerHTML="",R.hidden=!1,R.innerHTML=`<div class="schema-category-switch" role="tablist" aria-label="Schema \u985E\u5225">
        ${["law","judgment"].map(p=>{let b=r.find(k=>k.id===p);return b?`<button class="chip${i===p?" is-active":""}" type="button" role="tab" aria-selected="${i===p}" data-action="schema-category" data-category="${p}">${n(b.label)}</button>`:""}).join("")}
      </div>${wa(_,T(i)?.label||i,w?.tableId||"")}`;else{R.hidden=!0,R.innerHTML="",J.hidden=!1;let p=yi(i,_,A),b=Tn(_,A);J.innerHTML=`${hi(_)}${p?`${p}<details class="data-advanced"><summary>\u9032\u968E metadata \u689D\u4EF6</summary>${b}</details>`:b}<div class="sidebar-note">${wi(_)}</div>`}if(fe(),v==="schema"){let p=w?ge(_,w.tableId):"";if($&&$.key===p){let b=Fe(_,$.tableId);$.loading?x.innerHTML=Nn(b):$.error?x.innerHTML=Cn($.error,b):x.innerHTML=_a($.result,b,{columnFilters:$.columnFilters||{},searchEnabled:_.id==="postgres"||_.id==="parquet"})}else x.innerHTML=Ei(_);return}q?ke(_):A.result?x.innerHTML=Os(A.result):ke(_)},It=(_,{persist:q=!0,resetReport:A=!1}={})=>{let p=U(),b=p.find(j=>j.id===_)||p[0];if(!b)return;Q=null,ne=null,w=null,$=null,g+=1,o=b.id;let k=pe(i,b.id);l[k]||(l[k]=Ps(b,m)),Oe(b,{resetReport:A}),q&&(ee(`data.last_database.${i}`,b.id),ee("data.last_category",i))},Pe=(_,{persist:q=!0,resetReport:A=!0,databaseId:p=null}={})=>{let b=T(_)||r[0];if(!b)return;i=b.id,Q=null,ne=null;let k=b.databases||[],j=p&&k.find(G=>G.id===p)||k.find(G=>G.id===o)||k[0];if(o=j?.id||null,!j){$e.innerHTML=En(i,v),qe.innerHTML=`<div class="sidebar-notice">${_e({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,J.innerHTML="",fe();return}It(j.id,{persist:!1,resetReport:A}),q&&(ee("data.last_category",b.id),ee(`data.last_database.${b.id}`,j.id))},Ot=_=>{let q=se(_),A=J.querySelector("#data-filter-form");A&&(q.values=Is(A,_,q))},Ue=async(_=null,{quiet:q=!1}={})=>{let A=Y(o);if(!A)return;Te();let p=se(A);Ot(A),_!==null&&(p.page=_),(!Number.isFinite(p.page)||p.page<1)&&(p.page=1);let b=++d;Q=null,ne=null;let k=x.querySelector(".report-card"),j=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!k?x.setAttribute("aria-busy","true"):(x.removeAttribute("aria-busy"),x.innerHTML=vs(A));let W=J.querySelector("#run-query");q||me(W,!0,"\u67E5\u8A62\u4E2D\u2026");try{let ae;if(A.id==="indexeddb"?ae=await Pn(A,p):ae=await H.query({database:A.id,filters:ya(A,p),page:p.page,pageSize:p.pageSize}),s||b!==d)return;if(ae.meta={...ae.meta||{},column_filters:p.columnFilters||{},searchable:A.id==="postgres"||A.id==="parquet",sort:p.sort||ae.meta?.sort||null},p.result=ae,p.page=Number(ae.page)||p.page,p.pageSize=Number(ae.page_size)||p.pageSize,x.removeAttribute("aria-busy"),x.innerHTML=Os(ae),j!==null){let Me=x.querySelector("[data-page-size]");Me&&(Me.value=String(p.pageSize),Me.focus({preventScroll:!0}))}let ve=T(i)?.label||i;await ps({kind:"data",title:`${ve} \xB7 ${A.label} \xB7 ${ae.table||ae.label||"query"}`,detail:`${c(ae.total)} \u7B46 \xB7 ${re(ae.duration_ms)}`,payload:{category:i,database:A.id,filters:ya(A,p),page:p.page,page_size:p.pageSize}}),ee("data.last_query",{category:i,database:A.id,filters:ya(A,p),page:p.page,page_size:p.pageSize,at:new Date().toISOString()})}catch(ae){if(s||b!==d)return;x.removeAttribute("aria-busy"),x.innerHTML=Ds(ae,A),L(ae.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&b===d&&me(W,!1)}},Kt=(_,q)=>{let A=_?.querySelector("[data-data-fuzzy-results]");A&&(A.innerHTML=q.length?q.map(p=>`<button class="data-fuzzy-option" type="button" role="option" data-action="select-fuzzy-term" data-term="${n(p.value)}"><span>${n(p.label||p.value)}</span><small>${n(p.meta||"")}</small></button>`).join(""):'<div class="data-fuzzy-empty">\u6C92\u6709\u76F8\u8FD1\u7D50\u679C\uFF1B\u6309 Enter \u53EF\u76F4\u63A5\u52A0\u5165\u76EE\u524D\u8F38\u5165\u7684\u95DC\u9375\u5B57\u3002</div>')},ot=async(_,q="")=>{if(!_)return;let A=Y(o),p=A?se(A):null;if(!p)return;let b=_.dataset.fuzzyKind||i,k=_.querySelector("[data-data-fuzzy-results]"),j=++D;k&&(k.innerHTML='<div class="data-fuzzy-loading"><span class="spinner"></span><span>\u641C\u5C0B\u76F8\u8FD1\u7D50\u679C\u2026</span></div>');try{let G=await H.dataSuggest({kind:b,query:q,limit:12});if(j!==D)return;let W=(G.suggestions||[]).filter(ae=>!p.fuzzyTerms.includes(ae.value));Kt(_,W)}catch(G){if(j!==D)return;k&&(k.innerHTML=`<div class="data-fuzzy-empty">${n(G.message||"\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},Ze=(_,{focus:q=!1}={})=>{if(!_)return;let A=_.querySelector("[data-data-fuzzy-popover]"),p=_.querySelector("[data-data-fuzzy-search]");!A||!p||(A.hidden&&(A.hidden=!1,p.value="",ot(_,"")),q&&(p.focus(),p.select()))},mt=_=>{B&&(window.clearTimeout(B),B=null);let q=_?.querySelector("[data-data-fuzzy-popover]");q&&(q.hidden=!0)},Bt=async _=>{let q=Y(o);if(!q)return;let A=se(q),p=String(_||"").trim();!p||A.fuzzyTerms.includes(p)||(A.fuzzyTerms=[...A.fuzzyTerms,p],mt(J.querySelector("[data-data-fuzzy]")),Oe(q),await Ue(1))},Dt=async _=>{let q=Y(o);if(!q)return;let A=se(q),p=String(_||"").trim();A.fuzzyTerms=A.fuzzyTerms.filter(b=>b!==p),Oe(q),await Ue(1)},xt=async()=>{ie.disabled=!0,me(ie,!0,"\u6574\u7406\u4E2D\u2026");try{let[_,q,A,p,b]=await Promise.all([H.catalog(),Rt("data.last_category","law"),Rt("data.last_database.law","postgres"),Rt("data.last_database.judgment","postgres"),Rt("data.page_size",25)]);if(s)return;a=_,r=Array.isArray(a.categories)?a.categories:[],m=In.includes(Number(b))?Number(b):25;for(let ae of r)for(let ve of ae.databases||[]){let Me=pe(ae.id,ve.id);l[Me]||(l[Me]=Ps(ve,m))}let k=r.find(ae=>ae.id===q)||r[0];if(!k){$e.innerHTML="",qe.innerHTML=`<div class="sidebar-notice">${_e({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let j=k.id==="judgment"?p:A;if(i=k.id,o=null,Pe(k.id,{persist:!1,resetReport:!0,databaseId:j}),s)return;let G=Y(o),W=G?se(G):null;G&&W&&v==="query"&&!W.result&&(G.id==="postgres"||G.id==="parquet")&&Ue(1),L("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(_){if(s)return;a=null,r=[],$e.innerHTML="",fe(),qe.innerHTML=`<div class="sidebar-notice">${_e({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:n(_.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${u("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,x.innerHTML=`<div class="report-empty">${We({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(ie.disabled=!1,me(ie,!1))}};te.addEventListener("change",_=>{let q=_.target;if(q.name==="category"){Pe(q.value);return}if(q.name==="database"){It(q.value);let k=Y(o),j=k?se(k):null;k&&j&&!j.result&&v==="query"&&(k.id==="postgres"||k.id==="parquet")&&Ue(1);return}let A=Y(o);if(!A)return;let p=se(A),b=J.querySelector("#data-filter-form");!b||!q.name||(p.values=Is(b,A,p),p.page=1,q.name==="table"&&(Q=null,ne=null,p.sort=null,p.columnFilters={},p.result=null,J.innerHTML=Tn(A,p),ke(A)))}),te.addEventListener("input",_=>{let q=_.target.closest("[data-data-fuzzy-search]");if(q){let k=q.closest("[data-data-fuzzy]");B&&window.clearTimeout(B),B=window.setTimeout(()=>{ot(k,q.value)},160);return}let A=Y(o);if(!A)return;let p=J.querySelector("#data-filter-form");if(!p||!_.target.name||_.target.name==="table")return;let b=se(A);b.values=Is(p,A,b)}),te.addEventListener("keydown",_=>{let q=_.target.closest("[data-data-fuzzy-search]");if(!q)return;let A=q.closest("[data-data-fuzzy]");if(_.key==="Escape")_.preventDefault(),mt(A),q.blur();else if(_.key==="Enter"){_.preventDefault();let p=A?.querySelector("[data-action='select-fuzzy-term']");p?p.click():Bt(q.value)}else _.key==="ArrowDown"&&(_.preventDefault(),A?.querySelector("[data-action='select-fuzzy-term']")?.focus())}),te.addEventListener("mouseover",_=>{let q=_.target.closest("[data-action='open-fuzzy']");q&&Ze(q.closest("[data-data-fuzzy]"))}),te.addEventListener("mouseout",_=>{let q=_.target.closest("[data-data-fuzzy]");q&&(_.relatedTarget&&q.contains(_.relatedTarget)||mt(q))}),te.addEventListener("submit",_=>{_.target.id==="data-filter-form"&&(_.preventDefault(),Ue(1))}),te.addEventListener("click",async _=>{let q=J.querySelector("[data-data-fuzzy] [data-data-fuzzy-popover]:not([hidden])")?.closest("[data-data-fuzzy]");q&&!_.target.closest("[data-data-fuzzy]")&&mt(q);let A=_.target.closest("[data-action]"),p=A?.dataset.action;if(p==="data-nav"){let b=A.dataset.tab,k=Y(o);if(b==="schema"){if(v!=="schema"){if(k){let ae=se(k),ve=J.querySelector("#data-filter-form");ve&&(ae.values=Is(ve,k,ae))}v="schema",k&&Oe(k)}return}let j=b==="judgment"?"judgment":"law";v==="schema"&&(v="query"),i!==j?Pe(j,{databaseId:o,resetReport:!1}):k&&Oe(k);let G=Y(o),W=G?se(G):null;G&&W&&!W.result&&(G.id==="postgres"||G.id==="parquet")&&Ue(1);return}if(p==="open-fuzzy"){Ze(A.closest("[data-data-fuzzy]"),{focus:!0});return}if(p==="select-fuzzy-term"){await Bt(A.dataset.term);return}if(p==="remove-fuzzy-term"){await Dt(A.dataset.term);return}if(p==="schema-category"){v="schema",Pe(A.dataset.category||"law",{resetReport:!0});return}if(p==="select-schema-table"){let b=Y(o);if(!b)return;Be(b,A.dataset.tableId||"");return}if(p==="reset"){let b=Y(o);if(!b)return;Q=null,ne=null;let k=se(b);l[pe(i,b.id)]=Ps(b,k.pageSize),Oe(b),ke(b),L("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}_.target.closest("#catalog-retry")&&xt()}),x.addEventListener("input",_=>{let q=_.target.closest("[data-schema-search]");if(!q)return;let A=M();if(!A)return;let p=q.dataset.schemaSearch||"",b=q.value,k=`${A.mode}:${A.db.id}:${A.tableId}:${p}`,j=I.get(k);if(j&&window.clearTimeout(j),!b.trim()){I.delete(k),z(),O(A,p,"");return}let G=window.setTimeout(()=>{I.delete(k),oe(A,p,b,q)},250);I.set(k,G)}),x.addEventListener("keydown",_=>{let q=_.target.closest("[data-schema-search]");if(!q)return;let A=M();if(A){if(_.key==="Escape"){z();return}if(_.key==="ArrowDown"||_.key==="ArrowUp"){if(!C||C.hidden)return;_.preventDefault();let p=_.key==="ArrowDown"?1:-1;xe(S<0?p>0?0:h.length-1:S+p);return}if(_.key==="Enter"){if(_.preventDefault(),C&&!C.hidden&&S>=0){F(S);return}O(A,q.dataset.schemaSearch||"",q.value)}}}),C?.addEventListener("mousedown",_=>{_.preventDefault()}),C?.addEventListener("click",_=>{let q=_.target.closest("[data-schema-suggest-index]");q&&F(Number(q.dataset.schemaSuggestIndex))});let Yt=_=>{_.target.closest("[data-schema-search]")||C?.contains(_.target)||z()};return document.addEventListener("click",Yt),window.addEventListener("scroll",z,{capture:!0,passive:!0}),window.addEventListener("resize",z),x.addEventListener("keydown",_=>{_.target.matches(".law-jump-input")&&_.key==="Enter"&&(_.preventDefault(),le(_.target.id))}),x.addEventListener("click",async _=>{let q=_.target.closest("[data-action]");if(!q)return;let A=q.dataset.action,p=Y(o),b=p?se(p):null,k=b?.result;if(A==="back-to-results"){Ae();return}if(A==="open-law"){ue({lawKey:q.dataset.lawKey||"",sourceType:q.dataset.lawSource||"",lawName:q.dataset.lawName||""});return}if(A==="open-judgment"){we({jid:q.dataset.jid||""});return}if(A==="jump-article"){le(q.dataset.jumpInput||"law-article-jump");return}if(A==="sort-column"){let j=q.dataset.sortKey||"";if(!j||!p)return;if(v==="schema"&&$?.result){let ae=$.sort,ve=j==="jdate"||j==="law_modified_date"||j==="article_count"||j==="citation_count"||j==="full_text_length"||j==="created_at"||j==="updated_at",Me=ae?.key===j?ae.direction==="asc"?"desc":"asc":ve?"desc":"asc";Be(p,$.tableId,{sort:{key:j,direction:Me},columnFilters:$.columnFilters||{},quiet:!0});return}if(!b)return;let G=b.sort,W=G?.key===j?G.direction==="asc"?"desc":"asc":j==="jdate"?"desc":"asc";b.sort={key:j,direction:W},Ue(1,{quiet:!0});return}if(A==="retry"){Ue(b?.page||1);return}if(k){if(A==="prev-page"){Ue(Math.max(1,Number(k.page)-1),{quiet:!0});return}if(A==="next-page"){let j=Math.max(1,Math.ceil(Number(k.total)/Number(k.page_size)));Ue(Math.min(j,Number(k.page)+1),{quiet:!0});return}if(A==="copy-query"){let j=await as(k.query_text||"");L(j?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",j?"ok":"warn");return}if(A==="export-json"){let j=`${k.database}-${k.table||"query"}-page-${k.page}.json`;ht(j,JSON.stringify(Hs(k),null,2),"application/json;charset=utf-8"),L(`\u5DF2\u532F\u51FA ${j}`,"ok");return}if(A==="export-csv"){let j=`${k.database}-${k.table||"query"}-page-${k.page}.csv`;ht(j,Fs(k),"text/csv;charset=utf-8"),L(`\u5DF2\u532F\u51FA ${j}`,"ok")}}}),x.addEventListener("change",_=>{let q=_.target.closest("[data-action='select-law-version']");if(q&&Q){ue({lawKey:Q.lawKey,sourceType:Q.sourceType,lawName:Q.lawName,versionId:q.value});return}if(!_.target.matches("[data-page-size]"))return;let A=Y(o);if(!A)return;let p=se(A);p.pageSize=Number(_.target.value)||25,p.page=1,ee("data.page_size",p.pageSize),Ue(1,{quiet:!0})}),ie.addEventListener("click",()=>{xt()}),await xt(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0,B&&window.clearTimeout(B);for(let _ of I.values())window.clearTimeout(_);I.clear(),z(),document.removeEventListener("click",Yt),window.removeEventListener("scroll",z,{capture:!0}),window.removeEventListener("resize",z)}}var Jn=[10,25,50,100],Ki=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function Aa(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function Yi(e,t=e){return`<option value="${n(e)}">${n(t)}</option>`}function hs(e,t,s,a,r=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${n(t)}</span>
      <span class="field-tag">${n(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${n(e)}">
      ${Yi("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${n(i)}" ${String(i)===String(a)?"selected":""}>${n(i)}</option>`).join("")}
    </select>
    ${r?`<span class="field-help">${n(r)}</span>`:""}
  </div>`}function Xi(e,t){let s=Ki.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${hs("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${hs("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${hs("model","\u6A21\u578B",e.models||[],t.model)}
    ${hs("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${hs("method","\u65B9\u6CD5",e.methods||[],t.method)}
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
    </div>`}function zn(){let e=document.getElementById("performance-filter-form");if(!e)return Aa();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Un(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function Qn(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),r=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${r}.${i}`}function Zi(e,t){if(!e)return"";let s=new Date(e);return Number.isNaN(s.getTime())?"":new Date(s.getTime()+Math.max(0,Number(t)||0)).toISOString()}var eo=[{key:"parsing",label:"Parsing",hint:"\u8F38\u5165\u9577\u5EA6\u3001\u89E3\u6790\u6642\u9593",names:["rag.parse_question"],color:"#64748b"},{key:"embedding",label:"Embedding",hint:"Model\u3001Token\u3001Batch\u3001\u8017\u6642",names:["rag.embed_query"],color:"#3984c6"},{key:"qdrant",label:"Qdrant Search",hint:"Collection\u3001Filter\u3001Top K\u3001\u8017\u6642",names:["rag.qdrant_search"],color:"#d97706"},{key:"reranker",label:"Reranker",hint:"Model\u3001\u5019\u9078\u7B46\u6578\u3001\u8017\u6642",names:["rag.rerank"],color:"#8b5cf6"},{key:"context",label:"Context",hint:"Chunk \u6578\u3001Token \u6578\u3001\u8017\u6642",names:["rag.context"],fallbackNames:["rag.fetch_documents","rag.build_citations"],color:"#64748b"},{key:"llm",label:"LLM",hint:"Model\u3001Input/Output Token\u3001TTFT\u3001\u8017\u6642",names:["rag.llm_request"],color:"#16a34a"}],Us={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"};function Vn(e){let t=e?.metadata?.rag_response||{},s=String(t.status||e?.metadata?.rag_status||e?.status||"");return s==="operational"||s==="success"?{label:"Completed",tone:"ok"}:s==="retrieval_only"?{label:"Abstain",tone:"warn"}:s==="preview"?{label:"Preview",tone:"info"}:s==="failed"||s==="error"?{label:"Failed",tone:"danger"}:{label:s||"Unknown",tone:"idle"}}function La(e){let t=Math.max(0,Number(e?.offset_ms)||0),s=Math.max(0,Number(e?.duration_ms)||0),a=Math.max(t,Number(e?.end_offset_ms)||t+s);return{...e,offset:t,end:a,duration:Math.max(s,a-t)}}function Wn(e,t=0){let s=Array.isArray(e?.segments)?[...e.segments].sort((v,w)=>Number(v.offset_ms||0)-Number(w.offset_ms||0)):[],a=Math.max(Number(e?.total_ms)||0,Number(t)||0,...s.map(v=>La(v).end),1),r=eo.map(v=>{let w=s.filter(y=>v.names.includes(y.name));!w.length&&v.fallbackNames&&(w=s.filter(y=>v.fallbackNames.includes(y.name)));let $=w.map(La),g=$.length?Math.min(...$.map(y=>y.offset)):null,h=$.length?Math.max(...$.map(y=>y.end)):null;return{...v,spans:$,start:g,end:h,duration:g===null?null:h-g}});for(let v of r){if(v.key!=="embedding"&&v.key!=="llm")continue;let w=[];for(let h of v.spans){let y=h.metadata||{},S=Number(y.load_duration_ms),N=Number.isFinite(S)&&S>0?S:0,D=Math.max(0,Number(h.duration)||0);w.push({...h,offset:h.offset,end:h.offset+N,duration:N,metadata:{...y,source_stage:v.label,model_load_ms:N,request_duration_ms:D,warm_duration_ms:Math.max(0,D-N),cold_start:N>=100},params:{...h.params||{},source_stage:v.label}})}if(!w.length)continue;let $=w.reduce((h,y)=>h+y.duration,0),g=v.spans.reduce((h,y)=>h+Math.max(0,Number(y.duration)||0),0);v.loadInfo={spans:w,total:$,requestTotal:g,ratio:g>0?Math.min(1,Math.max(0,$/g)):0}}let i=[...r],o=Math.max(0,...i.flatMap(v=>v.spans.map(w=>w.end))),l=e?.metadata?.rag_response||{},d=Vn(e),m=Math.min(a,o);return i.push({key:"response",label:"Response",hint:"\u7E3D\u8017\u6642\u3001\u5F15\u7528\u6578\u3001\u6210\u529F\u6216 Abstain",color:"#0f766e",spans:[{offset:m,end:a,duration:Math.max(0,a-m),status:d.tone==="danger"?"error":"ok",metadata:l,params:{},started_at:e?.started_at,finished_at:e?.finished_at}],start:m,end:a,duration:Math.max(0,a-m),responseMetadata:l}),to(i,a),{total:a,stages:i,response:l,traceStatus:d,requestId:e?.request_id||"",startedAt:e?.started_at,finishedAt:e?.finished_at,client:e?.client||{},models:Array.isArray(e?.summary?.models)?e.summary.models:[],hasLoad:i.some(v=>!!v.loadInfo)}}function to(e,t){let s=e.reduce((i,o)=>i+Math.max(0,Number(o.duration)||0),0),a=s>0?t/s:1,r=0;for(let i of e){let o=Math.max(0,Number(i.duration)||0)*a;i.displayStart=r,i.displayDuration=o,i.displayEnd=r+o;let l=i.spans[0]||null,d=[],m=!1;if(l){let w=Math.max(0,Number(l.duration)||0),$=i.loadInfo?Math.max(0,Number(i.loadInfo.total)||0):0;if(i.loadInfo&&$>0&&i.spans.length===1&&w>0){let g=Math.min(l.end,l.offset+$),h=Math.max(0,g-l.offset),y=Math.max(0,l.end-g);if(h>0&&y>0){let S=Zi(l.started_at,h),N={...l,offset:l.offset,end:g,duration:h,finished_at:S,metadata:{...l.metadata||{},source_stage:i.label,model_load_ms:h,request_duration_ms:w,warm_duration_ms:Math.max(0,w-h),cold_start:h>=100},params:{...l.params||{},source_stage:i.label}},D={...l,offset:g,end:l.end,duration:y,started_at:S,finished_at:l.finished_at};d.push({kind:"load",label:"Model Load",span:N,duration:h}),d.push({kind:"stage",label:`${i.label} \u63A8\u8AD6`,span:D,duration:y}),m=!0}}m||d.push({kind:"stage",label:i.label,span:l,duration:w})}i.detailSegments=d;let v=[];if(l&&o>0)if(m){let[w,$]=d,g=w.duration+$.duration,h=g>0?o*(w.duration/g):0,y={...i,key:"model_load",label:`Model Load \xB7 ${i.label}`,spans:[w.span],duration:w.duration},S={...i,label:`${i.label} \u63A8\u8AD6`,spans:[$.span],duration:$.duration};v.push({offset:r,duration:h,color:"#0ea5e9",kind:"load",tip:zs(y,w.span)}),v.push({offset:r+h,duration:Math.max(0,o-h),color:i.color,kind:"stage",tip:zs(S,$.span,{includeLoad:!1})})}else v.push({offset:r,duration:o,color:i.color,kind:"stage",tip:zs(i,l)});i.displaySegments=v,r+=o}}function Ma(e,{includeLoad:t=!0}={}){let s=[],a=(v,w)=>{w==null||w===""||s.push([v,String(w)])},r=e.spans[0]||null;if(!r)return a("\u72C0\u614B","\u6B64\u7D00\u9304\u6C92\u6709\u9019\u500B span"),s;let i=r.params||{},o=r.metadata||{},l=Kn(r),d=ja(r),m=(v,w)=>{let $=Number(v?.load_duration_ms);if(!Number.isFinite($))return;let g=Math.max(0,$);a("Model Load",re(g)),a("\u51B7\u555F\u52D5",g>=100?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09");let h=Math.max(0,Number(w)||0);if(h>0){let y=Math.max(0,h-g);a("\u6263\u9664\u8F09\u5165\u5F8C",re(y)),a("\u8F09\u5165\u5360\u6BD4",`${(g/h*100).toFixed(g/h>=.1?0:1)}%`)}};if(e.key==="response")return a("Trace \u72C0\u614B",e.responseMetadata.status||"\u2014"),a("Answer source",e.responseMetadata.answer_source||"\u2014"),a("Abstain",e.responseMetadata.abstain?"\u662F":"\u5426"),a("\u5F15\u7528\u7E3D\u6578",e.responseMetadata.citation_count??"\u2014"),a("\u5224\u6C7A\uFF0F\u6CD5\u898F\u5F15\u7528",`${e.responseMetadata.judgment_citations??"\u2014"} / ${e.responseMetadata.law_citations??"\u2014"}`),a("\u7E3D\u8017\u6642",re(e.duration)),s;if(a("\u958B\u59CB",`${Qn(r.started_at)||"\u2014"} \xB7 +${r.offset.toFixed(1)} ms`),a("\u7D50\u675F",`${Qn(r.finished_at)||"\u2014"} \xB7 +${r.end.toFixed(1)} ms`),a("\u8017\u6642",re(r.duration)),e.key==="parsing")a("\u8F38\u5165\u9577\u5EA6",o.input_length??i.input_length),a("\u6B63\u898F\u5316\u9577\u5EA6",o.normalized_length??i.normalized_length),a("\u79FB\u9664\u7A7A\u767D",o.trimmed_chars);else if(e.key==="embedding")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.active_base_url||o.base_url),a("Input tokens",o.prompt_eval_count),a("Batch",o.batch),a("\u5411\u91CF\u7DAD\u5EA6",o.dimensions),a("Fallback",o.fallback_used?"\u662F":"\u5426"),t&&m(o,r.duration);else if(e.key==="qdrant")a("Collection",o.collection||i.collection),o.filter&&a("Filter",Un(o.filter)),a("Top K",o.top_k??i.limit),a("Hits",o.hits),a("Unique judgments",o.unique_judgments),a("Top score",o.top_score);else if(e.key==="reranker")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Rerank \u72C0\u614B",o.status),a("Fallback",o.fallback_used?"\u662F":"\u5426"),a("\u5019\u9078\u7B46\u6578",o.candidates),a("\u9078\u7528\u7B46\u6578",o.selected),a("Top score",o.top_score),Array.isArray(o.errors)&&o.errors.length&&a("\u932F\u8AA4",o.errors.join(" \xB7 "));else if(e.key==="context")a("Chunks",o.chunks),a("\u5224\u6C7A chunks",o.judgment_chunks),a("\u6CD5\u898F chunks",o.law_chunks),a("Token \u4F30\u7B97",o.token_estimate),a("Context \u5B57\u5143",o.context_chars),a("\u6587\u4EF6\u6578",o.documents);else if(e.key==="llm")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Input tokens",o.input_tokens),a("Output tokens",o.output_tokens),a("TTFT",o.ttft_ms===null||o.ttft_ms===void 0?"\u2014":re(o.ttft_ms)),a("API \u7E3D\u8017\u6642",o.total_duration_ms===null||o.total_duration_ms===void 0?"\u2014":re(o.total_duration_ms)),t&&m(o,r.duration),a("Strict retry",o.strict?"\u662F":"\u5426");else if(e.key==="model_load"){if(a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("\u4F86\u6E90\u968E\u6BB5",o.source_stage),a("\u51B7\u555F\u52D5",o.cold_start?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09"),a("\u6A21\u578B\u547C\u53EB\u7E3D\u8017\u6642",o.request_duration_ms===null||o.request_duration_ms===void 0?"\u2014":re(o.request_duration_ms)),a("\u8F09\u5165\u8017\u6642",o.model_load_ms===null||o.model_load_ms===void 0?"\u2014":re(o.model_load_ms)),a("\u6263\u9664\u8F09\u5165\u5F8C\u6D41\u7A0B\u6642\u9593",o.warm_duration_ms===null||o.warm_duration_ms===void 0?"\u2014":re(o.warm_duration_ms)),Number(o.request_duration_ms)>0&&Number(o.model_load_ms)>=0){let v=Number(o.model_load_ms)/Number(o.request_duration_ms)*100;a("\u8F09\u5165\u5360\u6BD4",`${v.toFixed(v>=10?0:1)}%`)}o.eval_duration_ms!==null&&o.eval_duration_ms!==void 0&&a("\u63A8\u8AD6\u8017\u6642",re(o.eval_duration_ms))}else if(e.key==="segment"||e.key==="test_stage")if(a("Model",d||o.model||i.model),a("\u72C0\u614B",o.status||r.status),e.key==="test_stage")a("\u9032\u5EA6",o.progress===null||o.progress===void 0?"":`${Number(o.progress)||0}%`),r.error&&a("\u932F\u8AA4",r.error);else{r.error&&a("\u932F\u8AA4",r.error);for(let[v,w]of Object.entries(i).slice(0,10))a(v,Un(w))}return e.spans.length>1&&(e.key==="model_load"?a("\u5404\u6A21\u578B\u8F09\u5165",e.spans.map(v=>`${v.metadata?.source_stage||"model"} ${ja(v)} ${re(v.metadata?.model_load_ms||0)}`).join(" \xB7 ")):(a("Span \u6578",e.spans.length),a("Span \u660E\u7D30",e.spans.map((v,w)=>`#${w+1} +${v.offset.toFixed(0)}ms/${re(v.duration)}`).join(" \xB7 ")))),r.module&&a("Module",r.module),r.function&&a("Function",r.function),s}function so(e){let t=String(e||"").trim();if(!t)return"";try{return new URL(t.includes("://")?t:`http://${t}`).hostname||t}catch{return t}}function Kn(e){let t=e?.metadata||{},s=String(t.provider_name||"").trim();if(s)return s;let a=String(t.active_base_url||t.base_url||e?.params?.url||"").trim();return so(a)}function ao(e){let t=e?.metadata||{};return String(t.model||e?.params?.model||"").trim()}function ja(e){let t=Kn(e),s=ao(e);return s?t?`${t}:${s}`:s:""}function no(e){let t=new Set;for(let s of e?.spans||[]){let a=ja(s);a&&t.add(a)}return[...t]}function zs(e,t,s={}){let a=Ma({...e,spans:[t]},s);return[String(e.label||""),...a.map(([r,i])=>`${r}: ${i}`)].join(`
`)}function ro(e,t){let s=e.spans||[],a=no(e),r=Array.isArray(e.displaySegments)?e.displaySegments:null,i=7,o=Math.max(1,Math.min(4,s.length)),l=s.length>1,d=r?12:l?Math.max(12,o*i):12,m=r?r.map(S=>{if(Number(S.duration)<=0)return"";let N=Math.max(0,Math.min(100,S.offset/t*100)),D=Math.min(100-N,S.duration/t*100);return`<span class="rag-wf-bar is-sequential${S.kind==="load"?" is-load":""}" style="left:${N.toFixed(3)}%;width:${D.toFixed(4)}%;top:0;height:12px;--bar-color:${S.color}"
            data-rag-wf-tip="${n(S.tip)}"
            aria-label="${n(S.tip)}" role="img"></span>`}).join(""):s.slice(0,4).map((S,N)=>{if(Number(S.duration)<=0)return"";let D=Math.max(0,Math.min(100,S.offset/t*100)),B=Math.max(.35,Math.min(100-D,S.duration/t*100)),Q=l?N*i:0,ne=l?6:12,te=zs(e,S);return`<span class="rag-wf-bar" style="left:${D.toFixed(3)}%;width:${B.toFixed(3)}%;top:${Q}px;height:${ne}px"
            data-rag-wf-tip="${n(te)}"
            aria-label="${n(te)}" role="img"></span>`}).join(""),v=Array.isArray(e.detailSegments)?e.detailSegments:[],w=v.length>1?v.map(S=>{let N=S.kind==="load"?{...e,key:"model_load",label:`Model Load \xB7 ${e.label}`,spans:[S.span],duration:S.duration}:{...e,label:`${e.label} \u63A8\u8AD6`,spans:[S.span],duration:S.duration},D=Ma(N,{includeLoad:S.kind!=="stage"});return`<div class="rag-wf-detail-group">
              <div class="rag-wf-detail-group-head">
                <strong>${n(S.label)}</strong>
                <span>${n(re(S.duration))}</span>
              </div>
              <div class="rag-wf-detail-grid">${D.map(([B,Q])=>`<span class="rag-wf-detail"><span>${n(B)}</span><strong>${n(Q)}</strong></span>`).join("")}</div>
            </div>`}).join(""):"",$=Ma(e).map(([S,N])=>`<span class="rag-wf-detail"><span>${n(S)}</span><strong>${n(N)}</strong></span>`).join(""),g=v.length>1?`<div class="rag-wf-details is-split">${w}</div>`:`<div class="rag-wf-details">${$}</div>`,h=s.length?s.some(S=>S.status==="error")?"is-error":"":"is-missing",y=s.length?re(e.duration):"\u672A\u8A18\u9304";return`<details class="rag-wf-stage ${h}" style="--stage-color:${e.color}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong>${n(e.label)}</strong><small>${n(e.hint)}</small>${a.length?`<small class="rag-wf-model-line">${n(a.join(" \xB7 "))}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${y} \xB7 ${s.length?`${s.length} span`:"\u2014"} <span class="rag-wf-chevron">${u("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:${d}px">${m}</span>
    </summary>
    ${g}
  </details>`}function Yn(e,t,s=!1){let a=e.response||{},r=e.client||{},i=e.models||[];return`<div class="rag-wf-summary">
      <span>\u7E3D\u8017\u6642 <strong>${n(re(e.total))}</strong></span>
      <span>Server <strong>${n(re(t))}</strong></span>
      ${r.total_ms?`<span>Client <strong>${n(re(r.total_ms))}</strong></span>`:""}
      ${r.render_ms!==void 0?`<span>Render <strong>${n(re(r.render_ms))}</strong></span>`:""}
      <span>\u5F15\u7528 <strong>${n(String(a.citation_count??"\u2014"))}</strong></span>
      <span>Abstain <strong>${a.abstain?"\u662F":"\u5426"}</strong></span>
      ${i.length?`<span>Model <strong>${n(i.join(" \xB7 "))}</strong></span>`:""}
      ${s?'<span class="rag-wf-updating">\u66F4\u65B0\u4E2D\u2026</span>':""}
    </div>`}function is(e,t,s="\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\uFF0C\u67E5\u770B\u53C3\u6578\u3001Token\u3001TTFT\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u4F86\u6E90\u6578\u91CF\u3002Waterfall \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u5E73\u884C\u57F7\u884C\u7684 span \u6703\u4F9D\u5BE6\u969B\u6642\u9593\u91CD\u758A\u986F\u793A\u3002",{legend:a=""}={}){return`<div class="rag-wf-axis"><span>0 ms</span><span>${n(re(t))}</span></div>
    ${a}
    <div class="rag-wf-stages">${(e||[]).map(r=>ro(r,t)).join("")}</div>
    <p class="rag-wf-hint">${n(s)}</p>`}function Xn(e){let t=(e.stages||[]).some(r=>r.loadInfo),s=t?'<div class="rag-wf-legend"><span><i class="is-load"></i>Model Load\uFF08\u968E\u6BB5 bar \u524D\u6BB5\uFF09</span></div>':"",a=t?"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\uFF1BEmbedding\uFF0FLLM \u7684\u85CD\u8272\u524D\u6BB5\u70BA Model Load\uFF0C\u5F8C\u6BB5\u70BA\u63A8\u8AD6\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001Token \u8207\u8F09\u5165\u5360\u6BD4\u53EF\u5C55\u958B\u67E5\u770B\u3002":"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207 Token \u53EF\u5C55\u958B\u67E5\u770B\u3002";return is(e.stages,e.total,a,{legend:s})}function Qs(e,{serverDurationMs:t=0,loading:s=!1,embedded:a=!1}={}){if(!e||typeof e!="object")return"";let r=Wn(e,t),i=r.traceStatus;return`<section class="report-card rag-wf-card${a?" rag-wf-embedded":""}">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${Us[i.tone]||Us.idle}">${n(i.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${n(r.requestId||"\u2014")}</span>
          \xB7 ${n(ye(r.startedAt))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <a class="btn btn-secondary btn-sm" href="#/performance">
          ${u("activity",14)}<span>\u5B8C\u6574 Flow</span>
        </a>
      </div>
    </div>
    ${Yn(r,t,s)}
    ${Xn(r)}
  </section>`}var Ke=null;function io(){return Ke||(Ke=document.createElement("div"),Ke.className="rag-wf-tooltip",Ke.hidden=!0,document.body.appendChild(Ke),Ke)}function Ta(){Ke&&(Ke.hidden=!0)}function Zn(e){if(!Ke||Ke.hidden)return;let t=14,s=10,a=Ke.getBoundingClientRect(),r=e.clientX+t,i=e.clientY+t;r+a.width>window.innerWidth-s&&(r=e.clientX-a.width-t),i+a.height>window.innerHeight-s&&(i=e.clientY-a.height-t),Ke.style.left=`${Math.max(s,r)}px`,Ke.style.top=`${Math.max(s,i)}px`}document.addEventListener("pointerover",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=io(),a=t.dataset.ragWfTip||"";a&&(s.textContent=a,s.hidden=!1,Zn(e))});document.addEventListener("pointermove",e=>{if(!(!Ke||Ke.hidden)){if(!e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]")){Ta();return}Zn(e)}});document.addEventListener("pointerout",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=e.relatedTarget;s instanceof Node&&t.contains(s)||Ta()});window.addEventListener("scroll",Ta,{capture:!0,passive:!0});function oo(e,t,s,a){if(a&&!e.length)return`<div class="report-card rag-wf-card">
      ${_e({tone:"danger",title:"RAG Pipeline \u8B80\u53D6\u5931\u6557",text:n(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">${u("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;if(!e.length)return`<div class="report-card rag-wf-card">
      ${We({iconName:"activity",title:s?"\u8B80\u53D6 RAG Pipeline\u2026":"\u5C1A\u7121 RAG Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684 RAG \u554F\u7B54 Trace\u3002":"\u7522\u751F\u65B0\u7684 RAG \u554F\u7B54\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A Parsing\u3001Embedding\u3001Qdrant\u3001Context\u3001LLM \u8207 Response \u7684 waterfall\u3002"})}
    </div>`;let r=e.find(m=>String(m.id)===String(t))||e[0],i=r.flow&&typeof r.flow=="object"?r.flow:{},o=Wn(i,r.duration_ms),l=o.traceStatus,d=e.map(m=>{let v=Vn(m.flow||{});return`<option value="${n(String(m.id))}" ${String(m.id)===String(r.id)?"selected":""}>#${n(String(m.id))} \xB7 ${n(ye(m.started_at))} \xB7 ${n(re(m.duration_ms))} \xB7 ${n(v.label)}</option>`}).join("");return`<section class="report-card rag-wf-card">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${Us[l.tone]||Us.idle}">${n(l.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${n(o.requestId||r.request_id||"\u2014")}</span>
          \xB7 ${n(ye(r.started_at))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <label class="rag-wf-select">Trace
          <select class="select" data-rag-trace-select aria-label="\u9078\u64C7 RAG Trace">${d}</select>
        </label>
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">
          ${u("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    ${Yn(o,r.duration_ms,s)}
    ${Xn(o)}
  </section>`}function lo(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},r=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?re(a.avg_total_ms??0):"\u2014",o=a.samples?re(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
                    <span class="perf-model-count">${c(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${re(l.avg_ms)}`:""}</span>
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
                    <span class="perf-seg-ms">${re(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function at(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),r=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(r).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:r?`${r}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function er(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function co(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let r=Number(a.points_per_second)||0,i=Math.max(2,r/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${n(er(a))}</strong>
          <span>${n(ye(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${n(`${c(a.indexed_count)} \u7B46 \xB7 ${at(a.duration_ms)} \xB7 ${c(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${r.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${c(a.indexed_count)} \u7B46 \xB7 ${at(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function uo(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${n(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${n(`${s.label} ${at(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${n(s.key)}"></i>
            <span>${n(s.label)}</span>
            <strong>${at(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 Ollama Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function po(e,t){let s=(Array.isArray(e)?e:[]).map(N=>({elapsed:Math.max(0,Number(N.elapsed_s)||0),indexed:Math.max(0,Number(N.indexed)||0)})).filter(N=>N.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(N=>N.elapsed),(Number(t)||0)/1e3,1),r=Math.max(...s.map(N=>N.indexed),1),i=760,o=150,l=12,d=12,m=i-l*2,v=o-d*2,w=s.map(N=>[l+N.elapsed/a*m,o-d-N.indexed/r*v]),$=w.map(([N,D],B)=>`${B===0?"M":"L"}${N.toFixed(1)},${D.toFixed(1)}`).join(" "),g=`${$} L${w[w.length-1][0].toFixed(1)},${o-d} L${w[0][0].toFixed(1)},${o-d} Z`,h=Math.max(1,Math.ceil(w.length/14)),y=w.map(([N,D],B)=>B%h===0||B===w.length-1?`<circle cx="${N.toFixed(1)}" cy="${D.toFixed(1)}" r="2.6" />`:"").join(""),S=[0,1,2,3].map(N=>{let D=d+v/3*N;return`<line x1="${l}" y1="${D.toFixed(1)}" x2="${i-l}" y2="${D.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${c(r)} \u7B46 \xB7 ${at(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${S}
      <path d="${g}" class="index-progress-area"></path>
      <path d="${$}" class="index-progress-line"></path>
      ${y}
      <line x1="${l}" y1="${o-d}" x2="${i-l}" y2="${o-d}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${d}" x2="${l}" y2="${o-d}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${at(a*500)}</span>
      <span>${at(a*1e3)}</span>
    </div>
  </div>`}function mo(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},r=t.coverage||{},i=r.total_judgments>0?`${c(r.indexed_judgments)} / ${c(r.total_judgments)}\uFF08${(100*r.indexed_judgments/r.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:c(t.indexed_count),note:`${c(t.batch_count)} \u6279 \xD7 ${c(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:at(t.duration_ms),note:`${c(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:at(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${at(t.batch_min_ms)} \xB7 \u6700\u6162 ${at(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${c(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${n(er(t))}</span>
    </div>
    <div class="index-perf-summary">
      ${o.map(l=>`<div class="index-perf-stat">
            <div class="summary-label">${n(l.label)}</div>
            <div class="index-perf-value">${n(l.value)}</div>
            <div class="index-perf-note">${n(l.note)}</div>
          </div>`).join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${n(ye(t.started_at))}</span>
      <span><strong>batch</strong> ${c(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${c(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${c(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${n(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${at(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${co(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${at(t.duration_ms)}</span>
        </div>
        ${uo(t)}
      </div>
    </div>
    ${po(t.progress,t.duration_ms)}
  </section>`}function go(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Jn.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${u("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${u("chevronRight",13)}</button>
    </div>
  </div>`}function fo(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"#65a30d":t.includes("judgment.rag")?"#8b5cf6":t.includes("judgment.web.app")?"#3b82f6":t.includes("judgment.web.query")?"#d97706":t.includes("judgment.judgment_index")?"#0d9488":"#64748b"}function bo(e){let t=La(e),s=Math.max(0,Math.min(8,Number(e.depth)||0));return{key:"segment",label:`${"\u203A ".repeat(s)}${e.name||"unnamed"}`,hint:[e.module||"\u2014",e.function||"\u2014"].join(" \xB7 "),color:fo(e),spans:[{...t,status:e.status||"ok",error:e.error,metadata:e.metadata||{},params:e.params||{},started_at:e.started_at,finished_at:e.finished_at}],start:t.offset,end:t.end,duration:t.duration}}function Gs(e){return(e||[]).map(bo)}function vo(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort(($,g)=>Number($.seq)-Number(g.seq)):[],r=s?.summary||{},i=Array.isArray(r.models)?r.models:[],o=s?.client||{},l=s?.metadata||{},d=l.question||"",m=l.answer||"",v=d||m?`<div class="perf-flow-qa">
          ${d?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${n(d)}</span></div>`:""}
          ${m?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${n(m)}</span></div>`:""}
        </div>`:"",w=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map($=>(Number($.offset_ms)||0)+(Number($.duration_ms)||0)),1);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${n(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${n(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${n(e.method||"")} ${n(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${ye(e.started_at)}</span>
      <span class="perf-record-duration">${re(e.duration_ms)}</span>
      ${je(e.status)}
      <span class="perf-record-chevron">${u("chevronRight",14)}</span>
    </summary>
    <div class="perf-record-body">
      <div class="perf-flow-meta">
        <span><strong>Request</strong> <span class="mono">${n(e.request_id||s?.request_id||"\u2014")}</span></span>
        <span><strong>Server</strong> ${re(e.duration_ms)}</span>
        ${o.total_ms?`<span><strong>Client \u5168\u6D41\u7A0B</strong> ${re(o.total_ms)}</span>`:""}
        ${o.render_ms!==void 0?`<span><strong>Render</strong> ${re(o.render_ms)}</span>`:""}
        <span><strong>Flow</strong> ${a.length} \u6BB5</span>
        ${a.length?"<span><strong>Waterfall</strong> \u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\u3001\u53EF\u9EDE\u9078\u5C55\u958B\u53C3\u6578</span>":""}
      </div>
      ${v}
      ${i.length?`<div class="chips perf-record-models">${i.map($=>`<span class="chip">${n($)}</span>`).join("")}</div>`:""}
      ${a.length?is(Gs(a),w,"\u6B64 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002"):`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${n(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${n(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var Gn={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"};function ho(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}var $o={embedding:"#3984c6",retrieval:"#d97706",context:"#64748b",llm:"#16a34a",validation:"#8b5cf6"};function yo(e,t){let s=Date.parse(e.started_at||""),a=Date.now(),r=Array.isArray(e.stage_order)?[...e.stage_order]:Object.keys(Gn);for(let m of t)m.stage&&!r.includes(m.stage)&&r.push(m.stage);let i=[],o=0;for(let m of r){let v=t.filter(g=>g.stage===m);if(!v.length)continue;let w=v.map(g=>{let h=Date.parse(g.started_at||""),y=Number.isFinite(s)&&Number.isFinite(h)?Math.max(0,h-s):0,S=Math.max(0,Number(g.duration_ms)||0);g.status==="running"&&Number.isFinite(h)&&(S=Math.max(S,a-h));let N=y+S;return o=Math.max(o,N),{offset:y,end:N,duration:S,status:g.status==="failed"?"error":g.status==="running"?"running":"ok",started_at:g.started_at,finished_at:g.finished_at,error:g.error_message,metadata:{...g.details||{},model:g.model,status:g.status,progress:Number(g.progress)||0,module:g.module,function:g.function},params:{model:g.model}}}),$=w.reduce((g,h)=>g+h.duration,0);i.push({key:"test_stage",label:Gn[m]||m,hint:`${w.length} \u500B\u7A0B\u5E8F`,color:$o[m]||"#64748b",spans:w,start:w.length?Math.min(...w.map(g=>g.offset)):null,end:w.length?Math.max(...w.map(g=>g.end)):null,duration:$})}let l=e.status==="running"&&Number.isFinite(s)?Math.max(0,a-s):0,d=Math.max(Number(e.total_ms)||0,l,o,1);return{stages:i,total:d}}function os(e,t,s,a={}){let r=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(y=>`<option value="${n(y.run_id)}" ${y.run_id===s?"selected":""}>${n(ho(y.status))} \xB7 ${n((y.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${n(ye(y.started_at))}</option>`)].join(""),o=r?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${u("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${u("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?je(e.status):""}</div>
      <div class="test-flow-question">${e?n(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${We({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let d=Array.isArray(e.steps)?e.steps:[],m=yo(e,d),v=e.models||{},w=e.status==="running"?`${re(m.total)}\uFF08\u4F30\u7B97\uFF09`:re(e.total_ms),$=d.find(y=>y.stage==="llm"&&y.model===e.summary?.primary_model)||d.find(y=>y.stage==="llm"&&y.details?.answer_preview),g=e.answer||$?.details?.answer_preview||"",h=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${e.summary?.primary_model?`<span class="mono">${n(e.summary.primary_model)}</span>`:""}
    </div>
    <p>${g?n(g):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${n(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${n(ye(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${w}</span>
      <span><strong>Embedding</strong> ${Array.isArray(v.embedding)?v.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(v.llm)?v.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${n(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${h}
    ${m.stages.length?is(m.stages,m.total,"\u6E2C\u8A66 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B\u7A0B\u5E8F\u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u6A21\u578B\u3001\u72C0\u614B\u3001\u9032\u5EA6\u3001module\uFF0Ffunction \u8207\u932F\u8AA4\u3002"):'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":r?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${e.summary?.primary_model?`<span class="mono">primary=${n(e.summary.primary_model)}</span>`:""}
    </div>
  </div>`}function wo(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},r=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${je(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${c(e.total)} \u7B46\u7B26\u5408 \xB7 ${re(e.duration_ms)} \xB7
          \u6BCF\u6B21\u57F7\u884C\u6309\u9215\u7684\u5B8C\u6574 Flow
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${u("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${u("file",14)}<span>JSON</span></button>
      </div>
    </div>
    ${s.length?`<div class="summary-strip">${s.map(i=>`<div class="summary-item">
                <div class="summary-label">${n(i.label)}</div>
                <div class="summary-value">${n(i.value)}</div>
              </div>`).join("")}</div>`:""}
    ${mo(r)}
    ${lo(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>vo(i,o)).join(""):We({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${go(e)}
    <details class="perf-query-details">
      <summary>\u67E5\u8A62\u8A9E\u53E5\u8207\u8B66\u544A</summary>
      <div class="query-box">
        <pre class="query-code">${n(e.query_text||"\u2014")}</pre>
        <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
          ${u("copy",12)}<span>\u8907\u88FD</span>
        </button>
      </div>
      ${Array.isArray(e.warnings)&&e.warnings.length?`<div class="warnings">${e.warnings.map(i=>`<div class="warning-line">${n(i)}</div>`).join("")}</div>`:""}
    </details>
  </div>`}async function _o(e,t){let s=!1,a=Aa(),r={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null,d=[],m="",v=!1,w=null,$=!1;e.innerHTML=`<section class="page data-page performance-page">
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
          ${u("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
            <span class="status-tab-icon">${u("activity",15)}</span>
            <span class="status-tab-copy"><strong>\u6548\u80FD\u7E3D\u89BD</strong><small>Flow\u3001\u5340\u6BB5\u8017\u6642\u8207\u7D22\u5F15\u6548\u80FD</small></span>
          </button>
          <button class="status-tab" type="button" data-performance-tab="pipeline">
            <span class="status-tab-icon">${u("activity",15)}</span>
            <span class="status-tab-copy"><strong>RAG Pipeline</strong><small>Span waterfall\u3001Token \u8207 TTFT</small></span>
          </button>
          <button class="status-tab" type="button" data-performance-tab="benchmark">
            <span class="status-tab-icon">${u("brain",15)}</span>
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
                    ${u("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
                  </button>
                </div>
              </form>
              <div class="sidebar-note">Flow \u5BEB\u5165 PostgreSQL \u7684 performance_records.flow\uFF08JSON\uFF09\uFF0C\u9810\u8A2D\u4FDD\u7559\u81F3\u5C11 90 \u5929\uFF1B\u53EF\u4F9D\u6A21\u578B\u3001\u7A0B\u5E8F\u3001\u6A21\u7D44\u8207\u8017\u6642\u7BE9\u9078\u3002</div>
            </aside>
            <section class="query-main" id="performance-main" aria-label="\u6548\u80FD\u5831\u8868" aria-live="polite">
              <div id="performance-test-flow"></div>
              <div id="performance-report">${vs({label:"\u6548\u80FD\u5831\u8868"})}</div>
            </section>
          </div>
        </div>
        <div id="performance-panel-pipeline" hidden></div>
        <div id="performance-panel-benchmark" hidden></div>
      </section>
    </div>
  </section>`;let g=e.querySelector("#performance-filter-fields"),h=e.querySelector("#performance-filter-form"),y=e.querySelector("#performance-test-flow"),S=e.querySelector("#performance-report"),N=e.querySelector("#performance-panel-pipeline"),D=e.querySelector("#performance-meta"),B=e.querySelector("#performance-refresh"),Q=[...e.querySelectorAll("[data-performance-tab]")],ne={overview:e.querySelector("#performance-panel-overview"),pipeline:e.querySelector("#performance-panel-pipeline"),benchmark:e.querySelector("#performance-panel-benchmark")},te="overview",$e=le=>{te=le;for(let ue of Q){let we=ue.dataset.performanceTab===le;ue.classList.toggle("is-active",we),we?ue.setAttribute("aria-current","page"):ue.removeAttribute("aria-current")}for(let[ue,we]of Object.entries(ne))we&&(we.hidden=ue!==le);le==="benchmark"?D.textContent="BENCHMARK \xB7 RAG":le==="pipeline"?D.textContent="PERFORMANCE \xB7 RAG WATERFALL":l&&(D.textContent=`PERFORMANCE \xB7 ${c(l.total)} \u7B46`)},qe=Mn(e,{onNavigate:le=>$e(le)}),J=()=>{N&&(N.innerHTML=oo(d,m,v,w))},R=async({force:le=!1}={})=>{if(!(s||v)){if($&&!le){J();return}v=!0,d.length||J();try{let ue=await H.performance({keyword:"/api/rag"},1,50);if(s)return;let we=(Array.isArray(ue.rows)?ue.rows:[]).filter(ge=>ge.flow&&(String(ge.path||"").includes("/api/rag")||String(ge.process||"").includes("RAG")));d=we,(!m||!we.some(ge=>String(ge.id)===String(m)))&&(m=we[0]?String(we[0].id):""),w=null,$=!0}catch(ue){if(s)return;w=ue}finally{s||(v=!1,J())}}},x=le=>{$e(le),le==="benchmark"&&qe.show(),le==="pipeline"&&R()};e.addEventListener("click",le=>{let ue=le.target.closest("[data-performance-tab]");ue&&x(ue.dataset.performanceTab||"overview")}),N?.addEventListener("change",le=>{le.target.matches("[data-rag-trace-select]")&&(m=String(le.target.value||""),J())}),N?.addEventListener("click",le=>{le.target.closest('[data-action="refresh-rag-waterfall"]')&&R({force:!0})});let C=null,Z=[],ie="",T=null,U="",Y=()=>{g.innerHTML=Xi(r,a)},pe=()=>{let le=JSON.stringify({selected:ie,tick:C?.status==="running"?Math.floor(Date.now()/1e3):0,runs:Z.map(ue=>`${ue.run_id}:${ue.status}`),run:C?{run_id:C.run_id,status:C.status,progress:C.progress,total_ms:C.total_ms,steps:(C.steps||[]).map(ue=>`${ue.stage}:${ue.model}:${ue.status}:${ue.progress}:${ue.duration_ms}`)}:null});le!==U&&(U=le,y.innerHTML=os(C,Z,ie))},se=async()=>{try{let le=await H.testRuns(30);if(s)return;Z=Array.isArray(le.runs)?le.runs:[]}catch{if(s)return;Z=[]}},ee=async()=>{try{let le=ie?await H.testRun(ie):await H.testRunCurrent();if(s)return;C=le.run||null,!ie&&C&&C.status!=="running"&&!Z.some(ue=>ue.run_id===C.run_id)&&await se(),pe()}catch{if(s)return;C=null,pe()}},fe=async()=>{s||(ie||await ee(),s||(T=window.setTimeout(fe,1500)))};y.addEventListener("change",async le=>{le.target.id==="test-run-select"&&(ie=String(le.target.value||""),await ee())}),y.addEventListener("click",async le=>{le.target.closest("#test-flow-refresh")&&(ie="",await se(),await ee())});let ke=async(le=i,{quiet:ue=!1}={})=>{i=Math.max(1,Number(le)||1),a=zn();let we=S.querySelector(".report-card"),ge=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!we?S.setAttribute("aria-busy","true"):(S.removeAttribute("aria-busy"),S.innerHTML=vs({label:"\u6548\u80FD\u5831\u8868"}));let Ie=e.querySelector("#performance-run");ue||me(Ie,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Be=await H.performance(a,i,o);if(s)return;if(l=Be,i=Number(Be.page)||i,o=Number(Be.page_size)||o,S.removeAttribute("aria-busy"),S.innerHTML=wo(Be),ge!==null){let M=S.querySelector("[data-page-size]");M&&(M.value=String(o),M.focus({preventScroll:!0}))}D.textContent=`PERFORMANCE \xB7 ${c(Be.total)} \u7B46`,D.className="badge badge-neutral badge-mono"}catch(Be){if(s)return;S.removeAttribute("aria-busy"),S.innerHTML=Ds(Be,{label:"\u6548\u80FD\u5831\u8868"}),L(Be.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||me(Ie,!1)}},Ae=async()=>{try{r=await H.performanceOptions()}catch{r={processes:[],modules:[],statuses:[],methods:[],models:[]}}Y()};return h.addEventListener("submit",le=>{le.preventDefault(),ke(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=Aa(),i=1,Y(),ke(1)}),B.addEventListener("click",async()=>{if(te==="pipeline"){me(B,!0,"\u6574\u7406\u4E2D\u2026");try{await R({force:!0})}finally{s||me(B,!1)}return}if(te==="benchmark"){me(B,!0,"\u6574\u7406\u4E2D\u2026");try{await qe.refresh()}finally{s||me(B,!1)}return}a=zn(),B.disabled=!0,me(B,!0,"\u6574\u7406\u4E2D\u2026"),await Ae(),await se(),s||await ee(),s||await ke(1),s||(B.disabled=!1,me(B,!1))}),S.addEventListener("click",async le=>{let ue=le.target.closest("[data-action]");if(!ue||!l)return;let we=ue.dataset.action;if(we==="retry"){ke(i);return}if(we==="prev-page"){ke(Math.max(1,Number(l.page)-1),{quiet:!0});return}if(we==="next-page"){let ge=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));ke(Math.min(ge,Number(l.page)+1),{quiet:!0});return}if(we==="copy-query"){let ge=await as(l.query_text||"");L(ge?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",ge?"ok":"warn");return}if(we==="export-json"){let ge=`performance-page-${l.page}.json`;ht(ge,JSON.stringify(Hs(l),null,2),"application/json;charset=utf-8"),L(`\u5DF2\u532F\u51FA ${ge}`,"ok");return}if(we==="export-csv"){let ge=`performance-page-${l.page}.csv`;ht(ge,Fs(l),"text/csv;charset=utf-8"),L(`\u5DF2\u532F\u51FA ${ge}`,"ok")}}),S.addEventListener("change",le=>{le.target.matches("[data-page-size]")&&(o=Number(le.target.value)||25,Jn.includes(o)||(o=25),ke(1,{quiet:!0}))}),await Promise.allSettled([Ae(),se()]),s||(await ee(),await ke(1),fe()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,T&&window.clearTimeout(T),qe.destroy()}}var ko=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function So(){return`<div class="answer-placeholder">
    <span class="empty-icon">${u("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function Na(){return`<section class="card answer-card rag-empty-answer">${So()}</section>`}function tr(e,t){return`<div class="rag-turn">
    <div class="rag-user-bubble">${n(e)}</div>
    <section class="card rag-assistant-turn" data-rag-answer>${t}</section>
  </div>`}function xo(e,t){return Promise.race([e,new Promise((s,a)=>{window.setTimeout(()=>a(new Error("pipeline lookup timed out")),t)})])}async function qo(e){if(!e||e.pipeline_flow)return e;let t=String(e._client_request_id||e.request_id||"").trim();if(!t)return e;for(let s=0;s<3;s+=1){try{let a=await xo(H.performance({keyword:t},1,5),1800),r=(Array.isArray(a.rows)?a.rows:[]).find(i=>String(i.request_id||"")===t&&i.flow&&typeof i.flow=="object");if(r)return e.pipeline_flow=r.flow,e}catch{}s<2&&await new Promise(a=>window.setTimeout(a,250))}return e}function Ao(e){return{status:e.status,answer:e.answer,answer_source:e.answer_source,notice:e.notice,citations:Array.isArray(e.citations)?e.citations:[],judgments:Array.isArray(e.judgments)?e.judgments:[],law_sources:Array.isArray(e.law_sources)?e.law_sources:[],matched_terms:Array.isArray(e.matched_terms)?e.matched_terms:[],law_answer:e.law_answer,law_framework:e.law_framework,llm_model:e.llm_model,embedding_model:e.embedding_model,duration_ms:e.duration_ms,show_sources:e.show_sources,pipeline_flow:e.pipeline_flow||null,test_run:e.test_run||null,partial:!1,streaming:!1}}var Lo={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"Ollama embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"Ollama LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function Mo(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`Ollama run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`Ollama embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:Lo[t]||t||"backend step"}function sr(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function ar(e){let t=Number(e);return Number.isFinite(t)?`${c(Math.max(0,Math.round(t)))} ms`:"\u2014"}function Ca(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function jo(){return`<div class="rag-process is-open" id="rag-process">
    <div class="rag-process-control">
      <button type="button" class="rag-process-toggle" id="rag-process-toggle"
        aria-expanded="true" aria-controls="rag-process-body" title="\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B">
        <span class="rag-process-toggle-label-collapsed">\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
        <span class="rag-process-toggle-label-expanded">\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
        ${u("chevronDown",11)}
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
  </div>`}function To(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),r=performance.now(),i=new Map,o=new Map,l=(g,h,y)=>{let S=g.querySelector(h);S&&(S.textContent=y)},d=g=>{if(g.failed){l(g.element,".rag-process-meta","\u5931\u6557");return}if(g.hasChildren){l(g.element,".rag-process-meta","");return}l(g.element,".rag-process-meta",ar(g.durationMs))},m=g=>{let h=g-1,y=[...i.values()].reverse();for(let S of y){if(h<0)break;S.depth<=h&&(S.hasChildren||(S.hasChildren=!0,S.element.dataset.hasChildren="true",S.finished&&d(S)),h=S.depth-1)}},v=g=>{if(!s)return null;let h=String(g?.seq??`step-${i.size+1}`),y=i.get(h);if(!y){let S=Math.max(0,Math.min(6,Number(g?.depth)||0));m(S);let N=document.createElement("div");N.className="rag-process-item is-running",N.dataset.processKey=h,N.style.setProperty("--depth",String(S)),N.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(N),y={element:N,depth:S,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(h,y)}return l(y.element,".rag-process-label",Mo(g)),y.element.title=sr(g),y};return{step:g=>{let h=g?.segment;if(!h)return;o.set(String(h.seq??h.name??o.size),{...h});let y=v(h);if(y){if(g.type==="segment_start"){y.element.classList.add("is-running"),l(y.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(g.type==="segment_end"){let S=h.status==="error";y.element.classList.remove("is-running"),y.element.classList.toggle("is-error",S),y.finished=!0,y.failed=S,y.durationMs=Number(h.duration_ms)||0,d(y),y.element.title=[sr(h),S&&h.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(g=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(N=>{N.classList.remove("is-running");let D=N.dataset.hasChildren==="true";l(N,".rag-process-meta",D?"":g?"\u5B8C\u6210":"\u4E2D\u65B7")});let h=s?.children.length||i.size,y=ar(Math.max(0,performance.now()-r));a&&(a.textContent=g?`\u5B8C\u6210 \xB7 ${h} \u6B65 \xB7 ${y}`:`\u5931\u6557 \xB7 ${h} \u6B65`);let S=[...o.values()].filter(N=>N?.name).sort((N,D)=>Number(N.offset_ms||0)-Number(D.offset_ms||0));if(s&&S.length){let N=Math.max(1,...S.map(D=>Number(D.end_offset_ms)||(Number(D.offset_ms)||0)+(Number(D.duration_ms)||0)));s.classList.add("is-waterfall"),s.innerHTML=is(Gs(S),N,"\u5F8C\u7AEF Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B span \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002")}return t.classList.add("is-complete"),Ca(t,!1),t.outerHTML},collapse:()=>Ca(t,!1)}}function Eo(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${u("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":jo()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${n(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function nr(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Vs(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let r=String(e||"").trim();return r?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${n(t||r)}"
    data-source-type="${n(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${n(r)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${n(r)} \u7684\u5B8C\u6574\u689D\u6587">${n(a||r)}</button>`:""}function No(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(l=>`<span>${n(l)}</span>`).join(""),r=(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(l=>Vs(l)).join(""),i=e.jid?` data-action="open-parquet-judgment"
        data-jid="${n(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${n(e.jid)}"`:"",o=e.pdf_url?`<a class="citation-link" href="${n(e.pdf_url)}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${u("external",11)}</a>`:"";return`<article class="citation">
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
  </article>`}function Co(e,t){let s=[e.law_level,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${n(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${u("external",11)}</a>`:"",r=e.law_key||e.law_name||"",i=r?` data-action="open-law-source"
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
  </article>`}function Ro(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",r=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${n(s)}</span>`,a,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${bt(e.law_modified_date)}`:""].filter(Boolean).map(g=>`<span>${g}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${n(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${n(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${n(o.entity||"")}\u300D\u7684\u5224\u6C7A ${c(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${c(o.law_count||0)} \u6B21</span>
      </div>`:"",d=e.law_key||"",m=e.source_type||"",v=(Array.isArray(e.articles)?e.articles:[]).map(g=>{let h=String(g.article_no||"");return`<div class="law-source-article"${d&&h?` data-action="open-law-source"
        data-law-key="${n(d)}"
        data-source-type="${n(m)}"
        data-article-no="${n(h)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${n(h)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} ${n(h)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${n(g.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${n(g.article_content||"")}</p>
      </div>`}).join(""),w=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${u("external",11)}</a>`:"",$=e.law_key?` data-action="open-law-source"
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
    <div class="citation-links">${w}</div>
  </article>`}function Po(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function Io(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${n(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",r=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(r==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),d=s.index!=null?`<span class="law-answer-index">[${n(String(s.index))}]</span>`:"",m=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${n(a)}"
            data-source-type="${n(r)}"
            title="\u9EDE\u64CA\u958B\u555F ${n(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${n(i)} \u7684\u5B8C\u6574\u689D\u6587">${n(i)}</button>`:`<strong>${n(i)}</strong>`,v=Array.isArray(s.articles)?s.articles:[],w=v.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${v.map($=>{let g=String($.article_no||"").trim(),h=Po($.article_content);return!a||!g?`<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${n(g||"\u689D\u6587")}</span>
                  <span class="law-answer-article-text">${n(h)}</span>
                </div>`:`<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${n(a)}"
                data-source-type="${n(r)}"
                data-article-no="${n(g)}"
                title="\u9EDE\u64CA\u67E5\u770B ${n(g)} \u7684\u5B8C\u6574\u5167\u5BB9"
                aria-label="\u958B\u555F ${n(i)} ${n(g)} \u7684\u5B8C\u6574\u689D\u6587">
                <span class="law-answer-article-no">${n(g)}</span>
                <span class="law-answer-article-text">${n(h)}</span>
              </button>`}).join("")}</div>`:"";return`<div class="law-answer-source">
        <div class="law-answer-source-head">
          ${m}
          <span class="law-answer-source-meta">\uFF08${n(o)}\uFF0C${c(l)} \u689D\uFF09</span>
          ${d}
        </div>
        ${w}
      </div>`}).join("")}</div>`}function Oo(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let r=s.get(String(a));return r?.law_key?Vs(a,{lawKey:r.law_key,sourceType:r.source_type||""}):`<span class="chip">${n(a)}</span>`}).join("")}</div>`}function Bo(e,t){if(!e)return"";let s=Array.isArray(e.providers)?e.providers:[],a=e.active||s.find(m=>m.active),r=String(e.status||""),i=String(e.model||"").trim(),o=a?`${a.name}:${i}`:r==="not_configured"?"\u672A\u555F\u7528":"\u7121\u53EF\u7528\u6A21\u578B",l=s.map(m=>{let v=m.status==="operational",w=!!m.active||m===a,$=`${m.name||"reranker"}:${i}`,g=w?"\u4F7F\u7528\u4E2D":v?m.role==="fallback"?"fallback":"\u4E3B\u8981":"\u96E2\u7DDA";return`<span class="rag-model-button is-static${w?" is-active":""}${v?"":" is-unavailable"}"
        title="${n(`${$} \xB7 ${m.url||""}`)}"
        aria-label="${n(`${$}\uFF0C${g}`)}">
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${n($)}</span>
        <span class="rag-model-current">${n(g)}</span>
      </span>`}).join(""),d=s.length?"":'<p class="rag-model-empty">\u5C1A\u672A\u8A2D\u5B9A reranker URL\u3002</p>';return`<div class="rag-model-strip rag-model-strip-rerank">
    <div class="rag-model-strip-head">
      <span class="rag-model-strip-title">${u("layers",13)} Rerank models</span>
      ${i?`<span class="rag-model-strip-base mono">${n(i)}</span>`:""}
      <span class="rag-model-strip-current">\u76EE\u524D\uFF1A<strong>${n(o)}</strong></span>
      <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
        data-rag-action="refresh-rerank-models"
        ${t?"disabled":""}>
        ${u("refresh",12)}<span>${t?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6A21\u578B"}</span>
      </button>
    </div>
    ${l?`<div class="rag-model-buttons">${l}</div>`:d}
    <p class="rag-model-hint">Reranker \u7531 llama.cpp \u63D0\u4F9B\uFF1B\u4E0D\u53EF\u7528\u6642\u6703\u56DE\u9000 Qdrant \u6392\u5E8F\u3002</p>
  </div>`}function Js({tone:e,title:t,text:s,models:a,currentModel:r,currentProviderName:i,baseUrl:o,modelState:l,untestedProviders:d=[],rerank:m=null,rerankRefreshing:v=!1,busy:w,refreshing:$}){let g=e==="ok"?"is-ok":e==="warn"?"is-warn":"is-info",h=e==="ok"?"check":e==="warn"?"alert":"info",y=e==="ok"?"badge-ok":e==="warn"?"badge-warn":"badge-info",S=Array.isArray(a)?a:[],N=[...new Set(S.map(te=>te.providerName).filter(Boolean))],D=r&&i?`${i}:${r}`:r,B=S.map(te=>{let $e=te.model===r&&(!i||te.providerName===i),qe=te.providerName?`${te.providerName}:${te.model}`:te.model;return`<button class="rag-model-button${$e?" is-active":""}" type="button" data-rag-model="${n(te.model)}"
        data-rag-provider="${n(te.hostId===null||te.hostId===void 0?"":String(te.hostId))}"
        title="${n(qe)}"
        aria-pressed="${$e}" ${w||$?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${n(qe)}</span>
        ${$e?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`}).join(""),Q=(l?.models||[]).filter(te=>te.status==="untested").length,ne=l?Q?`\u5C1A\u6709 ${c(Q)} \u500B\u6A21\u578B\u672A\u6E2C\u8A66 chat \u80FD\u529B\uFF1B\u6309\u300C\u6AA2\u67E5\u6A21\u578B\u300D\u5F8C\u5373\u53EF\u5207\u63DB\u3002`:"\u76EE\u524D provider \u6C92\u6709\u53EF\u7528\u7684 chat \u6A21\u578B\u3002":"\u7121\u6CD5\u53D6\u5F97\u6A21\u578B\u6E05\u55AE\uFF1B\u8ACB\u78BA\u8A8D Ollama \u670D\u52D9\u662F\u5426\u555F\u52D5\u3002";return`<section class="rag-mode-card ${g}">
    <div class="rag-mode-head">
      <span class="rag-mode-icon" aria-hidden="true">${u(h,14)}</span>
      <div class="rag-mode-copy">
        <strong>${n(t)}</strong>
        <p>${n(s)}</p>
      </div>
      <span class="badge ${y}">${c(S.length)} \u500B chat model${N.length?` \xB7 ${N.length} \u53F0\u4E3B\u6A5F`:""}</span>
    </div>
    <div class="rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${u("brain",13)} Chat models</span>
        ${o?`<span class="rag-model-strip-base mono">${n(o)}</span>`:""}
        <span class="rag-model-strip-current">${D?`\u76EE\u524D\uFF1A<strong>${n(D)}</strong>`:"\u5C1A\u672A\u9078\u64C7"}</span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-rag-action="refresh-chat-models"
          ${w||$?"disabled":""}>
          ${u("refresh",12)}<span>${$?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6A21\u578B"}</span>
        </button>
      </div>
      ${B?`<div class="rag-model-buttons">${B}</div>
             <p class="rag-model-hint">\u9EDE\u9078\u6A21\u578B\u5207\u63DB\uFF1B\u5207\u63DB\u5F8C\u5957\u7528\u4E0B\u4E00\u6B21\u63D0\u554F\uFF0C\u4E0D\u5F71\u97FF\u5DF2\u5B8C\u6210\u7684\u56DE\u7B54\u3002</p>`:`<p class="rag-model-empty">${n(ne)}</p>`}
      ${d.length?`<p class="rag-model-hint rag-model-untested-hint">${n(d.join("\u3001"))} \u5C1A\u6709\u6A21\u578B\u5C1A\u672A\u6AA2\u67E5 chat \u80FD\u529B\uFF1B\u8ACB\u6309\u300C\u6AA2\u67E5\u6A21\u578B\u300D\u3002</p>`:""}
    </div>
    ${Bo(m,v)}
  </section>`}function or(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.law_sources)?e.law_sources:[],r=Array.isArray(e.matched_terms)?e.matched_terms:[],i=e.status||"preview",o=!!e.partial,l=!!e.streaming,d=!!e.show_sources||!o,m=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((ee,fe)=>No(ee,fe)).join("")}</div>`:"",v=a.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${a.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${a.map((ee,fe)=>Ro(ee,fe)).join("")}</div>`:"",w=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((ee,fe)=>Co(ee,fe)).join("")}</div>`:"",$=d?m+v+w:"";!$&&!o&&($=`<div class="answer-divider"></div>
      ${We({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:i==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let g=Oo(r,a),h=e.test_run,y=String(e.llm_model||h?.primary_model||"").trim(),S=String(e.embedding_model||"").trim(),N=[y?`LLM\uFF1A${y}`:"",S?`Embedding\uFF1A${S}`:""].filter(Boolean).join(" \xB7 "),D=e.answer_source==="structured",B=String(e.law_answer||"").trim(),Q=e.law_framework||null,ne=Array.isArray(Q?.rows)?Q.rows:[],te=Array.isArray(Q?.sources)?Q.sources:[],$e=ne.length>0,qe=!!B&&!D&&!$e,J=l||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",R=$e?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${n(Q.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${ne.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${ne.map(ee=>`<tr>
                    <td>${n(ee.law_name||"\u2014")}</td>
                    <td class="cell-number">${n(ee.article_no||"\u2014")}</td>
                    <td>${n(ee.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${te.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${te.map(ee=>{let fe=String(ee?.law_name||ee||"").trim(),ke=ee&&ee.index!==null&&ee.index!==void 0?` [${n(ee.index)}]`:"";return Vs(fe,{label:`${fe}${ke}`})}).join("")}
              </div>`:""}
      </div>`:"",x=e.answer_source==="llm"&&y?`<span class="answer-model" title="${n(N)}">${u("brain",11)}${n(y)}</span>`:D?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${u("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",C=l?`${y||"LLM"} \xB7 \u751F\u6210\u4E2D`:x?y||"structured":"retrieval",Z=h?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${je(h.status)}
          <span class="mono">${n(h.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(h.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(h.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${n(h.primary_model||"\u2014")}</span>
          <span>${Number(h.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",ie=e.pipeline_flow&&typeof e.pipeline_flow=="object"?e.pipeline_flow:null,T=!o&&ie?Qs(ie,{serverDurationMs:Number(e.duration_ms)||0,embedded:!0}):"",Y=String(e.answer||"").trim()||(l?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":o?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),pe=l?" data-partial-answer":"",se=l?" is-streaming":"";return`${R}
      ${qe?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${o&&!d?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${a.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${Io(a,B)}</div>
            </div>`:""}
      <div class="answer-block">
        ${qe||$e?`<div class="answer-block-head">
                <span>${n(J)}</span>
                <span>${n(C)}</span>
              </div>`:""}
        <p class="answer-text${se}"${pe}>${n(Y)}</p>
      </div>
      ${e.notice?`<div class="answer-notice">${n(e.notice)}</div>`:""}
      ${Z}
      ${g}
      ${$}
      ${T}`}function rr(e,t,s=""){let a=t.status||"preview",r=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),d=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),m=t.answer_source==="structured",v=t.answer_source==="llm"&&o?`<span class="answer-model" title="${n(d)}">${u("brain",11)}${n(o)}</span>`:m?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${u("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${u("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${je(a,r)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${v}
      </div>
      ${s}
    </div>
    <div class="answer-body">${or(t)}</div>`}function Do(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${u("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${_e({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function Fo(e){let t=Array.isArray(e.turns)?e.turns:[],s=t.length?t[t.length-1].payload||{}:e.payload||{},a=Array.isArray(s.citations)?s.citations.length:0,r=Array.isArray(s.judgments)?s.judgments.length:0,i=Array.isArray(s.law_sources)?s.law_sources.length:0;return a+r+i}function Ho(e,t,s,a=null){let r=e.id??s,i=Fo(e),o=t.get(String(e.project_id||"")),l=Array.isArray(e.turns)?e.turns:[],d=e.updated_at||e.created_at,m=a!=null&&String(a)===String(r);return`<div class="rag-history-item${e.pinned?" is-pinned":""}${m?" is-active":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${n(String(r))}">
      <span class="history-question">${n(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${n(ss(d))}</span>
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
        aria-pressed="${e.pinned?"true":"false"}">${u("pin",14)}</button>
      <button class="rag-history-more" type="button"
        data-rag-action="open-history-menu" data-history-id="${n(String(r))}"
        title="\u66F4\u591A\u64CD\u4F5C" aria-label="\u66F4\u591A\u64CD\u4F5C" aria-haspopup="menu" aria-expanded="false">${u("more",14)}</button>
    </div>
  </div>`}function ir(e,t,s){let a=new Map;for(let i of t){let o=String(i.project_id||"");o&&a.set(o,(a.get(o)||0)+1)}let r=[`<button class="rag-project${s?"":" is-active"}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${s?"false":"true"}">
      <span class="rag-project-name">${u("grid",13)}<span>\u5168\u90E8</span></span>
      <span class="rag-project-count">${t.length}</span>
    </button>`];for(let i of e){let o=String(i.id),l=a.get(o)||0;r.push(`<button class="rag-project${s===o?" is-active":""}" type="button" data-rag-action="select-project" data-project-id="${n(o)}" aria-pressed="${s===o?"true":"false"}">
      <span class="rag-project-name">${u("folder",13)}<span>${n(i.name)}</span></span>
      <span class="rag-project-count">${l}</span>
    </button>`)}return e.length||r.push('<div class="rag-library-empty">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\u3002</div>'),r.push(`<div class="rag-project-add-wrap">
    <button class="rag-project-add" type="button" data-rag-action="show-project-form">${u("plus",13)}<span>\u5EFA\u7ACB\u5C08\u6848</span></button>
    <form class="rag-project-form" data-rag-form="project" hidden>
      <input class="input" type="text" name="project_name" maxlength="60" placeholder="\u5C08\u6848\u540D\u7A31" aria-label="\u5C08\u6848\u540D\u7A31" autocomplete="off" />
      <div class="rag-project-form-actions">
        <button class="btn btn-primary btn-sm" type="submit">\u5EFA\u7ACB</button>
        <button class="btn btn-ghost btn-sm" type="button" data-rag-action="cancel-project">\u53D6\u6D88</button>
      </div>
    </form>
  </div>`),r.join("")}async function zo(e){let t=!1,s=[],a=!1,r=[],i=!1,o="",l=8,d="",m=0,v=null,w=[],$=!1,g=!1,h={embedding:[],llm:[]},y=null,S=null,N=null,D=!1,B=!1,Q=!1;e.innerHTML=`<section class="page rag-page">
    <div class="rag-layout">
      <aside class="rag-library" aria-label="\u5C0D\u8A71\u5EAB">
        <button class="rag-new-chat" type="button" data-rag-action="new-chat">
          <span class="rag-new-chat-mark">${u("plus",16)}</span>
          <span class="rag-new-chat-copy"><strong>\u65B0\u5C0D\u8A71</strong><small>\u958B\u59CB\u65B0\u7684\u6CD5\u5F8B\u6AA2\u7D22</small></span>
        </button>
        <div class="rag-library-context" id="rag-library-context" hidden></div>
        <section class="rag-library-section" data-rag-section="pinned">
          <button class="rag-library-head" type="button" data-rag-toggle="pinned" aria-expanded="true">
            <span class="rag-library-title">${u("pin",13)}\u5DF2\u91D8\u9078</span>
            <span class="rag-library-count" id="rag-pinned-count">0</span>
            ${u("chevronDown",12,"rag-library-chevron")}
          </button>
          <div class="rag-library-body" id="rag-pinned-body">
            <div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002</div>
          </div>
        </section>
        <section class="rag-library-section" data-rag-section="projects">
          <button class="rag-library-head" type="button" data-rag-toggle="projects" aria-expanded="true">
            <span class="rag-library-title">${u("folder",13)}\u5C08\u6848</span>
            <span class="rag-library-count" id="rag-projects-count">0</span>
            ${u("chevronDown",12,"rag-library-chevron")}
          </button>
          <div class="rag-library-body" id="rag-projects-body"></div>
        </section>
        <section class="rag-library-section rag-library-recent">
          <div class="rag-library-head is-static">
            <span class="rag-library-title">${u("history",13)}\u6700\u8FD1\u9805\u76EE <span class="rag-library-count" id="rag-recent-count">0</span></span>
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
      <div id="rag-mode-notice">${_e({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
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
            ${u("sparkles",16)}<span>\u958B\u59CB\u6AA2\u7D22</span>
          </button>
        </div>
      </form>
      <div class="example-chips" id="example-chips" aria-label="\u7BC4\u4F8B\u554F\u984C">
        ${ko.map(f=>`<button class="example-chip" type="button" data-question="${n(f)}">${n(f)}</button>`).join("")}
      </div>
    </header>

    <section class="rag-conversation" id="rag-conversation" aria-live="polite">
      <div class="rag-turns" id="rag-turns">
        ${Na()}
      </div>
      <form class="rag-followup" id="rag-followup-form" hidden>
        <label class="sr-only" for="rag-followup-question">\u7E7C\u7E8C\u63D0\u554F</label>
        <textarea class="rag-followup-input" id="rag-followup-question" name="question" rows="1"
          maxlength="500" placeholder="\u7E7C\u7E8C\u554F\u4E0B\u4E00\u500B\u554F\u984C\u2026" aria-label="\u7E7C\u7E8C\u63D0\u554F"></textarea>
        <div class="rag-followup-actions">
          <span class="rag-followup-hint"><kbd>Enter</kbd> \u9001\u51FA \xB7 <kbd>Shift</kbd> + <kbd>Enter</kbd> \u63DB\u884C</span>
          <button class="btn btn-primary" type="submit" id="rag-followup-submit">
            ${u("sparkles",15)}<span>\u7E7C\u7E8C\u6AA2\u7D22</span>
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
  </section>`;let ne=e.querySelector("#rag-form"),te=e.querySelector("#rag-question"),$e=e.querySelector("#rag-submit"),qe=e.querySelector(".rag-page"),J=e.querySelector("#rag-turns"),R=e.querySelector("#rag-followup-form"),x=e.querySelector("#rag-followup-question"),C=e.querySelector("#rag-followup-submit"),Z=e.querySelector("#rag-history"),ie=e.querySelector("#rag-storage-note"),T=e.querySelector("#rag-clear-history"),U=e.querySelector(".rag-library"),Y=e.querySelector("#rag-pinned-body"),pe=e.querySelector("#rag-projects-body"),se=e.querySelector("#rag-pinned-count"),ee=e.querySelector("#rag-projects-count"),fe=e.querySelector("#rag-recent-count"),ke=e.querySelector("#rag-library-context"),Ae=e.querySelector("#rag-test-mode"),le=e.querySelector("#rag-test-flow"),ue=e.querySelector("#rag-history-menu"),we=e.querySelector("#rag-judgment-dialog"),ge=e.querySelector("#rag-law-dialog"),Fe=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};we?.addEventListener("close",Fe),ge?.addEventListener("close",Fe);let Ie=null,Be=null,M,O=null,I=null,z=()=>{te.style.height="auto",te.style.height=`${Math.min(te.scrollHeight,220)}px`},ce=()=>{x.style.height="auto",x.style.height=`${Math.min(x.scrollHeight,160)}px`},V=f=>{$=!!f,qe.classList.toggle("has-conversation",$)},xe=()=>{$&&(R.hidden=!1,ce())},F=()=>{R.hidden=!0},oe=()=>{ue.hidden&&!I||(ue.hidden=!0,ue.innerHTML="",I&&I.setAttribute("aria-expanded","false"),O=null,I=null)},Te=(f,E)=>{let P=J.querySelector(".rag-empty-answer");P&&P.remove(),J.insertAdjacentHTML("beforeend",tr(f,E));let K=J.lastElementChild,de=K?.querySelector("[data-rag-answer]");return window.requestAnimationFrame(()=>{K?.scrollIntoView({behavior:"smooth",block:"start"})}),{turnElement:K,answerElement:de}},Oe=()=>{J.innerHTML=w.length?w.map(f=>tr(f.question,rr(f.question,f.payload||{},""))).join(""):Na()},It=f=>{let E=Array.isArray(f.turns)?f.turns:[];return E.length?(m+=1,ct(),et(null),v=f.id??null,w=E.map(P=>({...P})),d=w[w.length-1]?.question||"",V(!0),Oe(),xe(),Pe(),me($e,!1),me(C,!1),window.setTimeout(()=>{R.scrollIntoView({behavior:"smooth",block:"end"})},50),!0):!1},Pe=()=>{if(t)return;if(oe(),!a){Z.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',Y.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',se.textContent="0",fe.textContent="0",i&&(pe.innerHTML=ir(r,[],o));return}let f=r.find(Se=>String(Se.id)===o)||null;o&&!f&&(o="");let E=new Map(r.map(Se=>[String(Se.id),Se])),P=s.filter(Se=>!!Se.pinned),K=s.filter(Se=>!Se.pinned),de=o?K.filter(Se=>String(Se.project_id||"")===o):K,he=de.slice(0,l),He=(Se,Je)=>Ho(Se,E,Je,v);Y.innerHTML=P.length?P.map(He).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',pe.innerHTML=ir(r,s,o),Z.innerHTML=he.length?he.map(He).join(""):`<div class="rag-library-empty">${o?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u672A\u91D8\u9078\u7684\u9805\u76EE\u3002":P.length?"\u6700\u8FD1\u7684\u9805\u76EE\u90FD\u5DF2\u91D8\u9078\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,de.length>l&&Z.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${c(de.length-l)} \u7B46</button>`),se.textContent=String(P.length),ee.textContent=String(r.length),fe.textContent=String(de.length),f?(ke.hidden=!1,ke.innerHTML=`<span>${u("folder",12)}<strong>${n(f.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${u("x",12)}</button>`):(ke.hidden=!0,ke.innerHTML="")},Ot=async()=>{try{let f=await Rt("rag.projects",[]);r=Array.isArray(f)?f.map(E=>({id:String(E?.id||""),name:String(E?.name||"").trim()})).filter(E=>E.id&&E.name):[]}catch{r=[]}i=!0,t||Pe()},Ue=f=>{o=String(f||""),l=8,Pe()},Kt=()=>{let f=pe.querySelector('[data-rag-form="project"]');f&&(f.hidden=!1,f.querySelector("input")?.focus())},ot=()=>{let f=pe.querySelector('[data-rag-form="project"]');f&&(f.hidden=!0,f.reset())},Ze=async f=>{let E=f.elements.project_name,P=String(E?.value||"").trim();if(!P){L("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),E?.focus();return}if(r.some(de=>de.name.toLowerCase()===P.toLowerCase())){L("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),E?.focus();return}let K=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;r=[...r,{id:K,name:P.slice(0,60),created_at:new Date().toISOString()}],o=K,l=8,await gs("rag.projects",r),Pe(),L(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${P}\u300D\u3002`,"ok")},mt=async f=>{let E=s.find(de=>String(de.id)===String(f));if(!E)return;let P=!E.pinned;if(!await ms(E.id,{pinned:P})){L("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}E.pinned=P,Pe(),L(P?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},Bt=()=>{m+=1,ct(),et(null),d="",v=null,w=[],V(!1),F(),J.innerHTML=Na(),te.value="",z(),x.value="",ce(),me($e,!1),me(C,!1),Pe(),we?.open&&we.close(),ge?.open&&ge.close(),te.focus(),window.scrollTo({top:0,behavior:"smooth"})},Dt=f=>{if(!f||ue.hidden)return;let E=f.getBoundingClientRect(),P=ue.getBoundingClientRect(),K=6,de=E.bottom+K;de+P.height>window.innerHeight-8&&(de=Math.max(8,E.top-P.height-K));let he=E.right-P.width;he=Math.max(8,Math.min(he,window.innerWidth-P.width-8)),ue.style.left=`${Math.round(he)}px`,ue.style.top=`${Math.round(de)}px`},xt=f=>{ue.innerHTML=`
      <button type="button" role="menuitem" data-menu-action="rename">${u("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${u("pin",13)}<span>${f.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${u("link",13)}<span>\u5206\u4EAB</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${u("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${u("trash",13)}<span>\u522A\u9664</span></button>`},Yt=f=>{let E=String(f.project_id||""),P=[{id:"",name:"\u672A\u5206\u985E"},...r.map(K=>({id:String(K.id),name:K.name}))];ue.innerHTML=`
      <div class="rag-history-menu-head">${u("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${P.map(K=>`<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${n(K.id)}">
            <span class="rag-history-menu-check">${E===K.id?u("check",12):""}</span>
            <span>${n(K.name)}</span>
          </button>`).join("")}
      ${r.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${u("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},_=(f,E)=>{let P=s.find(K=>String(K.id)===String(E));P&&(oe(),O=String(P.id),I=f,xt(P),ue.hidden=!1,f.setAttribute("aria-expanded","true"),Dt(f))},q=async f=>{let E=window.prompt("\u91CD\u65B0\u547D\u540D\u5C0D\u8A71",f.title||"");if(E===null)return;let P=E.trim();if(!P){L("\u540D\u7A31\u4E0D\u80FD\u7A7A\u767D\u3002","warn");return}if(P===f.title)return;if(!await ms(f.id,{title:P})){L("\u91CD\u65B0\u547D\u540D\u5931\u6557\u3002","danger");return}f.title=P,Pe(),L("\u5C0D\u8A71\u5DF2\u91CD\u65B0\u547D\u540D\u3002","ok")},A=async f=>{let E=Array.isArray(f.turns)?f.turns:[],P=[`# ${f.title||"\u672A\u547D\u540D\u5C0D\u8A71"}`,""];if(E.length)for(let de of E){P.push("## \u554F\u984C","",de.question||"",""),P.push("## \u56DE\u7B54","",de.payload?.answer||"\uFF08\u6C92\u6709\u56DE\u7B54\u5167\u5BB9\uFF09","");let he=Array.isArray(de.payload?.law_sources)?de.payload.law_sources.map(He=>He.law_name).filter(Boolean):[];he.length&&P.push(`\u5F15\u7528\uFF1A${[...new Set(he)].join("\u3001")}`,"")}else P.push(f.title||"");let K=await as(P.join(`
`));L(K?"\u5C0D\u8A71\u5167\u5BB9\u5DF2\u8907\u88FD\uFF0C\u53EF\u76F4\u63A5\u8CBC\u4E0A\u5206\u4EAB\u3002":"\u7121\u6CD5\u8907\u88FD\u5C0D\u8A71\u5167\u5BB9\u3002",K?"ok":"warn")},p=async f=>{if(!window.confirm(`\u522A\u9664\u5C0D\u8A71\u300C${f.title||"\u672A\u547D\u540D\u5C0D\u8A71"}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002`))return;if(!await pn(f.id)){L("\u522A\u9664\u5931\u6557\u3002","danger");return}let P=v!==null&&String(v)===String(f.id);s=s.filter(K=>String(K.id)!==String(f.id)),P?Bt():Pe(),L("\u5C0D\u8A71\u5DF2\u522A\u9664\u3002","ok")},b=async(f,E)=>{if(!await ms(f.id,{project_id:E})){L("\u79FB\u81F3\u5C08\u6848\u5931\u6557\u3002","danger");return}f.project_id=E;let K=r.find(de=>String(de.id)===String(E));Pe(),L(K?`\u5DF2\u79FB\u81F3\u5C08\u6848\u300C${K.name}\u300D\u3002`:"\u5DF2\u79FB\u51FA\u5C08\u6848\u3002","ok")},k=async f=>{let E=f.target.closest("[data-menu-action]");if(!E)return;let P=s.find(de=>String(de.id)===O);if(!P){oe();return}let K=E.dataset.menuAction;K==="rename"?(oe(),await q(P)):K==="toggle-pin"?(oe(),await mt(P.id)):K==="share"?(oe(),await A(P)):K==="move"?(Yt(P),Dt(I)):K==="assign-project"?(oe(),await b(P,E.dataset.projectId||"")):K==="back"?(xt(P),Dt(I)):K==="delete"&&(oe(),await p(P))},j=f=>{ue.hidden||(typeof f.composedPath=="function"?f.composedPath():[]).includes(ue)||ue.contains(f.target)||f.target.closest('[data-rag-action="open-history-menu"]')||oe()},G=f=>{f.key==="Escape"&&oe()},W=f=>{f.target instanceof Node&&ue.contains(f.target)||oe()},ae=async()=>{try{if(s=await Ns({limit:120}),t)return;a=!0,Pe(),ie.textContent=Es()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;s=[],a=!0,Pe(),Z.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},ve=async(f,E,P,K)=>{let de=w,he=v;de.push({question:f,asked_at:new Date().toISOString(),payload:Ao(E)});let He=Array.isArray(E.citations)?E.citations:[],Se=Array.isArray(E.judgments)?E.judgments:[],Je={question:f,status:E.status,citations:He.map(Le=>Le.law_name),judgments:Se.map(Le=>Le.jid)},Ye=`${E.status||"preview"} \xB7 ${de.length} \u8F2A`,rt=new Date().toISOString(),Lt=Le=>{K===m&&(v=Le)};if(he){if(!await ms(he,{turns:de,detail:Ye,payload:Je,updated_at:rt})){let dt=await ps({kind:"rag",title:de[0]?.question||f,detail:Ye,project_id:P,turns:de,payload:Je,updated_at:rt});Lt(dt)}}else{let Le=await ps({kind:"rag",title:de[0]?.question||f,detail:Ye,project_id:P,turns:de,payload:Je,updated_at:rt});Lt(Le)}await ae()},Me=()=>(y?.services||[]).find(f=>f.id==="llm")||null,Ne=()=>{let f=e.querySelector("#rag-mode-notice");if(!f)return;let E=Array.isArray(S?.providers)?S.providers:[],P=[];for(let Le of E)if(!(!Le||!Array.isArray(Le.chat_models)))for(let dt of Le.chat_models)P.push({model:dt,providerName:String(Le.name||"").trim(),hostId:Le.host_id===null||Le.host_id===void 0?null:Number(Le.host_id)});if(!P.length&&Array.isArray(S?.chat_models)){let Le=String(S?.provider_name||"").trim(),dt=S?.provider?.host_id;for(let Ee of S.chat_models)P.push({model:Ee,providerName:Le,hostId:dt==null?null:Number(dt)})}let K=E.filter(Le=>Array.isArray(Le?.models)&&Le.models.length>0&&(!Array.isArray(Le.chat_models)||Le.chat_models.length===0)).map(Le=>String(Le.name||"").trim()).filter(Boolean),de=String(Me()?.model||"").trim(),he=String(S?.base_url||"").trim(),He=String(S?.provider_name||"").trim(),Se=y&&(y.services||[]).find(Le=>Le.id==="reranker")||null;if(!y){if(!N)return;f.innerHTML=Js({tone:"warn",title:"\u7121\u6CD5\u53D6\u5F97 RAG \u670D\u52D9\u72C0\u614B",text:N.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u524D\u5F80\u7CFB\u7D71\u72C0\u614B\u9801\u67E5\u770B\u3002",models:P,currentModel:de,currentProviderName:He,baseUrl:he,modelState:S,untestedProviders:K,rerank:Se,rerankRefreshing:Q,busy:D,refreshing:B});return}let Je=y.data||{},Ye=(y.services||[]).find(Le=>Le.id==="rag"),rt=Number(Je.judgment_indexed_count||0),Lt=Number(Je.judgment_count||0);Ye?.status==="operational"?f.innerHTML=Js({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${c(rt)} / ${c(Lt)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`,models:P,currentModel:de,currentProviderName:He,baseUrl:he,modelState:S,untestedProviders:K,rerank:Se,rerankRefreshing:Q,busy:D,refreshing:B}):Ye?.status==="degraded"?f.innerHTML=Js({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:Ye.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002",models:P,currentModel:de,currentProviderName:He,baseUrl:he,modelState:S,untestedProviders:K,rerank:Se,rerankRefreshing:Q,busy:D,refreshing:B}):f.innerHTML=Js({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:Ye?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002",models:P,currentModel:de,currentProviderName:He,baseUrl:he,modelState:S,untestedProviders:K,rerank:Se,rerankRefreshing:Q,busy:D,refreshing:B})},qt=async()=>{let[f,E]=await Promise.allSettled([H.status(),H.llmModels()]);t||(y=f.status==="fulfilled"?f.value:null,S=E.status==="fulfilled"?E.value:null,N=f.status==="rejected"?f.reason:null,Ne())},lt=async(f,E=null)=>{if(!f||D||B)return;let P=String(Me()?.model||"").trim(),K=String(S?.provider_name||"").trim(),de=(S?.providers||[]).find(Se=>E!==null&&Se?.host_id!==null&&Se?.host_id!==void 0&&Number(Se.host_id)===Number(E)),he=String(de?.name||(E===null?K:"")).trim();if(f===P&&(!E||!he||he===K))return;let He=he?`${he}:${f}`:f;D=!0,Ne();try{await H.selectLlmModel(f,E),L(`\u5DF2\u5207\u63DB chat model\uFF1A${He}`,"ok",3500)}catch(Se){L(Se.message||"\u7121\u6CD5\u5207\u63DB chat model\u3002","danger",6e3)}finally{D=!1,t||await qt()}},Ft=async()=>{if(!(B||D)){B=!0,Ne();try{await H.testLlmModels(),L("\u5DF2\u66F4\u65B0 chat model \u6E05\u55AE\u3002","ok",3500)}catch(f){L(f.message||"\u7121\u6CD5\u6AA2\u67E5 chat model\u3002","danger",6e3)}finally{B=!1,t||await qt()}}},Xt=async()=>{if(!Q){Q=!0,Ne();try{let f=await H.status();if(t)return;y=f,N=null,L("\u5DF2\u66F4\u65B0 rerank model \u72C0\u614B\u3002","ok",3e3)}catch(f){L(f.message||"\u7121\u6CD5\u6AA2\u67E5 rerank model\u3002","danger",6e3)}finally{Q=!1,t||Ne()}}},Zt=()=>{if(!Ae)return;if(!g){Ae.innerHTML="";return}let f=Array.isArray(h.embedding)?h.embedding.length:0,E=Array.isArray(h.llm)?h.llm.length:0;Ae.innerHTML=_e({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${f} \u500B embedding \u8207 ${E} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},Ht=async()=>{try{let f=await H.testMode();if(t)return;g=!!f.enabled,h=f.models||{embedding:[],llm:[]},Zt()}catch{if(t)return;g=!1,Zt()}},At=f=>{g=!!f.detail?.enabled,h=f.detail?.models||{embedding:[],llm:[]},Zt()};window.addEventListener("judgment:test-mode",At);let et=f=>{if(!le)return;Be=f||null;let E=JSON.stringify(f?{run_id:f.run_id,status:f.status,progress:f.progress,total_ms:f.total_ms,stage:f.stage,answer:f.answer||"",steps:(f.steps||[]).map(P=>`${P.stage}:${P.model}:${P.status}:${P.progress}:${P.duration_ms}`)}:null);E!==M&&(M=E,le.innerHTML=f?os(f,[],"",{showHistory:!1}):"")},ct=()=>{Ie&&(window.clearTimeout(Ie),Ie=null)},ds=()=>{ct();let f=async()=>{if(!t){try{let E=await H.testRunCurrent();if(t)return;let P=E.run;P&&P.status==="running"&&et(P)}catch{}t||(Ie=window.setTimeout(f,1500))}};f()},Ss=async f=>{if(!f){et(null);return}try{let E=await H.testRun(f);if(t)return;et(E.run||null)}catch{t||L("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},xs=async()=>{if(g)try{let f=await H.testRunCurrent();if(t)return;f.run?.status==="running"&&(et(f.run),ds())}catch{}},Ce=0,gt=(f,E)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${n(f)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${u("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${E}</div>`,_t=f=>{let E=(Array.isArray(f.matched_laws)?f.matched_laws:[]).map(he=>Vs(he)).join(""),P=[f.court,f.jdate,f.title?`\u6848\u7531\uFF1A${f.title}`:"",f.full_text_length?`${c(f.full_text_length)} \u5B57`:"",f.citation_count?`\u5F15\u7528 ${c(f.citation_count)} \u7B46`:""].filter(Boolean).map(he=>`<span>${n(he)}</span>`).join(""),K=f.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${n(String(f.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",de=f.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(f.pdf_url)}" target="_blank" rel="noopener noreferrer">${u("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return gt(f.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${n(f.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${P}
      </div>
      ${E?`<div class="chips" style="margin:8px 0 10px">${E}</div>`:""}
      <div class="judgment-dialog-source">${K}</div>
      <pre class="judgment-dialog-text">${n(f.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${de}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},us=async f=>{if(!we||!f)return;let E=++Ce;we.open||we.showModal(),Fe(),we.innerHTML=gt("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${n(f)}\u2026</span>
      </div>`);try{let P=await H.judgmentDetail(f,"parquet");if(t||E!==Ce)return;we.innerHTML=_t(P)}catch(P){if(t||E!==Ce)return;we.innerHTML=gt("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(P.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},es=0,ts=(f,E)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${n(f)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${u("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${E}</div>`,qs=(f,E="")=>{let P=String(f.selected_article_no||E||"").trim(),K=!!P,de=Array.isArray(f.articles)?f.articles:[],he=de.map(pt=>{let aa=String(pt.article_content||"").trim();return aa?pt.article_type==="C"?`<div class="law-chapter">${n(aa)}</div>`:`<article class="law-article" data-article-no="${n(nr(pt.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${n(pt.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${n(aa)}</div>
        </article>`:""}).join(""),He=(Array.isArray(f.warnings)?f.warnings:[]).map(pt=>n(pt)).join("<br />"),Se=f.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",Je=f.meta?.articles_source,Ye=Je==="parquet"?"Parquet \u689D\u6587":Je==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",rt=f.meta?.snapshot||"",Lt=[f.law_level,f.law_category,f.article_count?`${c(f.article_count)} \u689D`:"",f.law_modified_date?`\u7570\u52D5 ${bt(f.law_modified_date)}`:""].filter(Boolean).map(pt=>`<span>${n(pt)}</span>`).join(""),Le=f.law_url?`<a class="btn btn-secondary btn-sm" href="${n(f.law_url)}" target="_blank" rel="noopener noreferrer">${u("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",dt=!K&&f.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${n(f.law_histories)}</div>
        </details>`:"",Ee=K?`<span class="badge badge-mono">${n(P)}</span>`:"",ut=!K&&de.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",ft=K?`${f.law_name||f.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${P}`:f.law_name||f.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return ts(ft,`<div class="judgment-dialog-meta">
        <span class="badge ${f.source_type==="order"?"badge-warn":"badge-info"}">${n(Se)}</span>
        ${Ee}
        ${Lt}
      </div>
      <div class="judgment-dialog-source">${n([Ye,rt].filter(Boolean).join(" \xB7 "))}</div>
      ${He?`<div class="law-dialog-warning">${He}</div>`:""}
      ${dt}
      ${ut}
      <div class="law-dialog-articles">${he||`<div class="report-empty-inline">${K?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${Le}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},Xa=(f,E)=>{let P=f?.querySelector(`#${E}`),K=nr(P?.value||"");if(!K){L("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),P?.focus();return}let de=[...f?.querySelectorAll("[data-article-no]")||[]].find(he=>he.dataset.articleNo===K);if(!de){L(`\u627E\u4E0D\u5230\u7B2C ${K} \u689D\u3002`,"warn");return}de.scrollIntoView({behavior:"instant",block:"center"}),de.classList.add("is-jump-target"),window.setTimeout(()=>de.classList.remove("is-jump-target"),2400)},sa=async(f,E="",P="")=>{if(!ge||!f)return;let K=++es;ge.open||ge.showModal(),Fe(),ge.innerHTML=ts(P?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${n([f,P].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let de=await H.lawDetail(f,E,"",P);if(t||K!==es)return;ge.innerHTML=qs(de,P)}catch(de){if(t||K!==es)return;ge.innerHTML=ts("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(de.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};ge?.addEventListener("click",f=>{let E=f.target.closest('[data-action="jump-law-article"]');if(E){Xa(ge,E.dataset.jumpInput||"rag-law-article-jump");return}if(f.target.closest('[data-action="close-law-source"]')){ge.close();return}let P=ge.getBoundingClientRect();(f.clientX<P.left||f.clientX>P.right||f.clientY<P.top||f.clientY>P.bottom)&&ge.close()}),ge?.addEventListener("keydown",f=>{!f.target.matches(".law-jump-input")||f.key!=="Enter"||(f.preventDefault(),Xa(ge,f.target.id))}),we?.addEventListener("click",f=>{let E=f.target.closest('[data-action="open-law-source"]');if(E){sa(E.dataset.lawKey||"",E.dataset.sourceType||"",E.dataset.articleNo||"");return}if(f.target.closest('[data-action="close-parquet-judgment"]')){we.close();return}let P=we.getBoundingClientRect();(f.clientX<P.left||f.clientX>P.right||f.clientY<P.top||f.clientY>P.bottom)&&we.close()}),J.addEventListener("click",f=>{let E=f.target.closest(".rag-process-toggle");if(E){let K=E.closest(".rag-process"),de=E.getAttribute("aria-expanded")==="true";Ca(K,!de);return}let P=f.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(P){if(P.dataset.action==="open-law-source"){sa(P.dataset.lawKey||"",P.dataset.sourceType||"",P.dataset.articleNo||"");return}us(P.dataset.jid||"")}}),J.addEventListener("keydown",f=>{if(f.key!=="Enter"&&f.key!==" ")return;let E=f.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!E||E.closest("a, button"))){if(f.preventDefault(),E.dataset.action==="open-law-source"){sa(E.dataset.lawKey||"",E.dataset.sourceType||"",E.dataset.articleNo||"");return}us(E.dataset.jid||"")}});let As=async(f,{fresh:E=!1,source:P="hero"}={})=>{let K=f.trim();if(!K){L("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),(P==="followup"?x:te).focus();return}(E||!$)&&(v=null,w=[],J.innerHTML="",Pe());let de=++m,he=()=>t||de!==m,He=o;d=K,V(!0),F(),P==="followup"?(x.value="",ce()):(te.value="",z());let{answerElement:Se}=Te(K,Eo(K,g)),Je=g?null:To(Se);g?(et(null),ds()):(ct(),et(null)),me($e,!0,"\u6AA2\u7D22\u4E2D\u2026"),me(C,!0,"\u6AA2\u7D22\u4E2D\u2026");let Ye=null,rt="",Lt=Ee=>{if(he()||!Ee?.partial)return;let ut=Se.querySelector(".answer-body");if(!ut)return;Ye=Ee,rt=String(Ee.answer||""),ut.innerHTML=or(Ee),Je?.collapse?.();let ft=Se.querySelector(".answer-head-title");ft&&(ft.textContent=Ee.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},Le=Ee=>{if(he()||!Ee||!Ye?.streaming)return;rt+=Ee;let ut=Se.querySelector("[data-partial-answer]");ut&&(ut.textContent=rt)},dt=()=>{if(he()||!Ye?.streaming)return;rt="";let Ee=Se.querySelector("[data-partial-answer]");Ee&&(Ee.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")};try{let Ee=g?await H.rag(K,{testMode:g}):await H.ragStream(K,{onStep:ft=>{he()||Je?.step(ft)},onPartial:Lt,onToken:Le,onTokenReset:dt});if(he())return;ct();let ut=Je?.finish(!0)||"";if(Se.innerHTML=rr(K,Ee,ut),Ee.pipeline_flow||qo(Ee).then(()=>{if(he()||!Ee.pipeline_flow)return;let ft=Se.querySelector(".answer-body");if(!ft||ft.querySelector(".rag-wf-card"))return;let pt=Qs(Ee.pipeline_flow,{serverDurationMs:Number(Ee.duration_ms)||0,embedded:!0});pt&&ft.insertAdjacentHTML("beforeend",pt)}),Ee.test_run?.run_id?await Ss(Ee.test_run.run_id):et(null),await ve(K,Ee,He,de),he())return;xe()}catch(Ee){if(he())return;ct();let ut=Je?.finish(!1)||"";Se.innerHTML=Do(Ee,ut),xe(),L(Ee.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{he()||(ct(),me($e,!1),me(C,!1))}};ne.addEventListener("submit",f=>{f.preventDefault(),As(te.value,{fresh:!0,source:"hero"})}),R.addEventListener("submit",f=>{f.preventDefault(),As(x.value,{fresh:!1,source:"followup"})}),te.addEventListener("input",z),te.addEventListener("keydown",f=>{f.key==="Enter"&&!f.shiftKey&&!f.isComposing&&(f.preventDefault(),ne.requestSubmit())}),x.addEventListener("input",ce),x.addEventListener("keydown",f=>{f.key==="Enter"&&!f.shiftKey&&!f.isComposing&&(f.preventDefault(),R.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",f=>{let E=f.target.closest("[data-question]");E&&(te.value=E.dataset.question,z(),ne.requestSubmit())}),e.addEventListener("click",async f=>{let E=f.target.closest("[data-rag-model]");if(E){let P=E.dataset.ragProvider?Number(E.dataset.ragProvider):null;await lt(E.dataset.ragModel||"",Number.isFinite(P)?P:null);return}if(f.target.closest('[data-rag-action="refresh-rerank-models"]')){await Xt();return}f.target.closest('[data-rag-action="refresh-chat-models"]')&&await Ft()}),U.addEventListener("click",async f=>{let E=f.target.closest("[data-rag-toggle]");if(E){let Se=E.closest(".rag-library-section").classList.toggle("is-collapsed");E.setAttribute("aria-expanded",String(!Se));return}let P=f.target.closest("[data-rag-action]"),K=P?.dataset.ragAction||"";if(K==="new-chat"){Bt();return}if(K==="open-history-menu"){_(P,P.dataset.historyId);return}if(K==="toggle-pin"){await mt(P.dataset.historyId);return}if(K==="select-project"){Ue(P.dataset.projectId||"");return}if(K==="show-project-form"){Kt();return}if(K==="cancel-project"){ot();return}if(K==="more-recent"){l+=12,Pe();return}if(K==="clear-project"){Ue("");return}let de=f.target.closest("[data-history-open]");if(!de)return;let he=s.find(He=>String(He.id)===String(de.dataset.historyId));he&&(o=String(he.project_id||""),Pe(),!It(he)&&(v=null,w=[],As(he.title,{fresh:!0,source:"history"})))}),U.addEventListener("submit",async f=>{let E=f.target.closest('[data-rag-form="project"]');E&&(f.preventDefault(),await Ze(E))}),ue.addEventListener("click",k),document.addEventListener("click",j),document.addEventListener("keydown",G),window.addEventListener("scroll",W,{capture:!0,passive:!0}),window.addEventListener("resize",oe),T.addEventListener("click",async()=>{if(!s.length){L("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await mn(),await ae(),L("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),z(),await Promise.allSettled([qt(),ae(),Ot(),Ht()]),await xs();let kt="";try{kt=window.sessionStorage.getItem("judgment.pending_question")||"",window.sessionStorage.removeItem("judgment.pending_question")}catch{kt=""}return!kt&&typeof window.__judgmentPendingQuestion=="string"&&(kt=window.__judgmentPendingQuestion),delete window.__judgmentPendingQuestion,kt=String(kt||"").trim().slice(0,500),kt&&te&&(te.value=kt,z(),window.setTimeout(()=>{t||As(kt,{fresh:!0,source:"home"})},40)),()=>{t=!0,ct(),oe(),document.removeEventListener("click",j),document.removeEventListener("keydown",G),window.removeEventListener("scroll",W,{capture:!0}),window.removeEventListener("resize",oe),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",At),d&&J.setAttribute("data-last-question",d)}}var Fa={};Mt(Fa,{render:()=>Dl});var Uo=2e3,lr=3e4,Pa=new Set(["full_update","judgment_import","index_versions"]),Qo={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},partial:{label:"\u90E8\u5206\u5B8C\u6210",tone:"warn"},update:{label:"\u66F4\u65B0",tone:"warn"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"},provided:{label:"\u5916\u90E8\u63D0\u4F9B",tone:"info"}},cr={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},dr={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},hr={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"},Ws={judgment:"#a78bfa",law:"#22d3ee",order:"#f472b6",system:"#94a3b8"},Go={extract:"file",raw_parquet:"cube",filter:"filter",postgres:"database",qdrant:"brain",ollama:"cloud",validate:"shield",download:"download",parse:"sliders"},Jo={raw_parquet:"\u539F\u59CB Parquet",postgres:"PostgreSQL"},ur={law_download:"law",order_download:"order",judgment_download:"judgment"},pr={law_download:"\u6CD5\u898F\u4E0B\u8F09",order_download:"\u547D\u4EE4\u4E0B\u8F09",judgment_download:"\u5224\u6C7A\u4E0B\u8F09"},Vo={law_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",order_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",judgment_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u5224\u6C7A RAR \u55CE\uFF1F\uFF08\u4E0D\u6703\u81EA\u52D5\u532F\u5165 PostgreSQL \u6216\u5EFA\u7ACB Qdrant \u7D22\u5F15\uFF09"},Wo={law_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u6CD5\u898F RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",order_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u547D\u4EE4 RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",judgment_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u53EA\u4E0B\u8F09\u5224\u6C7A RAR\u3002PostgreSQL\uFF0FParquet \u532F\u5165\u8207 Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\u300C\u5224\u6C7A\u532F\u5165\u300D\u6216\u5B8C\u6574\u8CC7\u6599\u66F4\u65B0\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_import:"\u6D41\u7A0B\u7BC4\u570D\uFF1ARAR \u2192 \u539F\u59CB Parquet \u2192 \u91D1\u878D\u6CD5\u898F\u7BE9\u9078 \u2192 PostgreSQL\u3002Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_parquet:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5F9E PostgreSQL \u532F\u51FA\u67E5\u8A62\u7528 Parquet \u5FEB\u7167\uFF1B\u4E0D\u5BEB\u5165 Qdrant\uFF0FIndexedDB\u3002",index_versions:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5EFA\u7ACB\u4E26\u9A57\u8B49\u65B0\u7684 Qdrant collection\uFF0C\u5B8C\u6210\u5F8C\u539F\u5B50\u5207\u63DB alias\uFF1BIndexedDB \u4E0D\u53C3\u8207\u3002"};function Vt(e){return Qo[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function ze(e,t){let s=Vt(e);return`<span class="badge ${cr[s.tone]||cr.idle}"><span class="status-dot ${dr[s.tone]||dr.idle}"></span>${n(t||s.label)}</span>`}function nt(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function mr(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":c(e)}function yt(e){return e&&e.color?String(e.color):"var(--accent)"}function $s(e,t=""){let s=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),a=e.status==="running"&&s===null,r=a?' aria-valuetext="\u9032\u5EA6\u672A\u77E5"':` aria-valuenow="${s??0}"`;return`<div class="processing-bar${a?" is-indeterminate":""}${t?` ${t}`:""}" role="progressbar" aria-valuemin="0" aria-valuemax="100"${r}>
    <span class="processing-bar-fill" style="width:${s??0}%;background:${n(yt(e))}"></span>
  </div>`}function Oa(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return["skipped","pending","idle"].includes(e.status)?"\u2014":s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${be(s)} / ${be(a)}`:be(s):a?`${c(s)} / ${c(a)} ${t}`:`${c(s)} ${t}`}function Ko(e){let t=[`<span>${n(Oa(e))}</span>`];return e.percent===null||e.percent===void 0?e.status==="running"&&t.push('<span class="mono">\u9032\u5EA6\u672A\u77E5</span>'):t.push(`<span class="mono">${nt(e.percent)}</span>`),e.duration_ms&&t.push(`<span class="mono">${re(e.duration_ms)}</span>`),t.join("")}function Yo(e){let s=(Array.isArray(e.stats)?e.stats:[]).map(r=>`<span class="processing-stage-stat"><span>${n(r.label)}</span><strong>${n(r.value)}</strong></span>`),a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&s.push(`<span class="processing-stage-stat"><span>\u7D22\u5F15\u8986\u84CB</span><strong>${c(a.indexed)} / ${c(a.total)}</strong></span>`),s.length?`<div class="processing-stage-stats">${s.join("")}</div>`:""}function Xo(e,{compact:t=!1,step:s=null}={}){let a=Vt(e.status),r=e.status==="running";return`<div class="processing-stage${t?" is-compact":""} is-${a.tone}${r?" is-live":""}" style="--stage-color:${n(yt(e))}"${r?' aria-current="step"':""}>
    <div class="processing-stage-head">
      ${s===null?"":`<span class="processing-stage-step">${String(s).padStart(2,"0")}</span>`}
      <span class="processing-stage-swatch" style="background:${n(yt(e))}"></span>
      <span class="processing-stage-label">${n(e.label||e.key)}</span>
      ${ze(e.status)}
    </div>
    ${$s(e)}
    <div class="processing-stage-meta">${Ko(e)}</div>
    ${e.message?`<div class="processing-stage-message" title="${n(e.message)}">${n(e.message)}</div>`:""}
    ${t?"":Yo(e)}
  </div>`}function $r(e){let t=Vt(e);return`<span class="flow-status is-${t.tone}"><span class="flow-status-dot"></span>${n(t.label)}</span>`}function gr(e,t){return t==null||t===""?"\u2014":e.unit==="bytes"?be(t):c(t)}function Zo(e){let t=[{label:"\u76EE\u524D",value:gr(e,e.current)},{label:"\u7E3D\u91CF",value:gr(e,e.total)},{label:"\u767E\u5206\u6BD4",value:e.percent===null||e.percent===void 0?e.status==="running"?"\u8A08\u7B97\u4E2D":"\u2014":nt(e.percent)},{label:"\u8017\u6642",value:e.duration_ms?re(e.duration_ms):"\u2014"}],s=Array.isArray(e.stats)?e.stats:[];for(let r of s){if(t.length>=6)break;r&&r.label&&r.value&&t.push({label:String(r.label),value:String(r.value)})}let a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&!t.some(r=>r.label==="\u7D22\u5F15\u8986\u84CB")&&t.push({label:"\u7D22\u5F15\u8986\u84CB",value:`${c(a.indexed)} / ${c(a.total)}`}),t}function el(e,t){let s=Vt(e.status),a=e.status==="running",r=Zo(e);return`<article class="flow-node is-${s.tone}${a?" is-live":""}" style="--stage-color:${n(yt(e))}"${a?' aria-current="step"':""}>
    <div class="flow-node-head">
      <span class="flow-node-icon">${u(Go[e.key]||"cube",14)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">STEP ${String(t+1).padStart(2,"0")}</span>
        <strong>${n(Jo[e.key]||e.label||e.key)}</strong>
      </div>
      ${$r(e.status)}
    </div>
    <div class="flow-node-body">
      ${$s(e,"flow-progress")}
      <div class="flow-node-props">${r.map(i=>`<div class="flow-prop"><span>${n(i.label)}</span><strong>${n(i.value)}</strong></div>`).join("")}</div>
      ${e.message?`<div class="flow-node-note" title="${n(e.message)}">${n(e.message)}</div>`:""}
    </div>
  </article>`}function tl(e,t,s,a){let r=yt(e),i=a||"#8b5cf6",o=e.status==="running",l=`${s}-${t}`,d=`flow-gradient-${l}`,m=`flow-marker-${l}`,v=t%2===0?"M2 60 C8 42 16 78 22 60":"M2 60 C8 78 16 42 22 60";return`<div class="flow-link${o?" is-live":""}" style="color:${n(r)}" aria-hidden="true">
    <svg viewBox="0 0 28 120" width="28" height="120" fill="none">
      <defs>
        <linearGradient id="${d}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${n(i)}"/>
          <stop offset="1" stop-color="${n(r)}"/>
        </linearGradient>
        <marker id="${m}" viewBox="0 0 8 8" refX="6.2" refY="4" markerWidth="4.6" markerHeight="4.6" orient="auto">
          <path d="M0 0 8 4 0 8Z" fill="${n(r)}"/>
        </marker>
      </defs>
      <path class="flow-link-line" d="${v}" stroke="url(#${d})" stroke-width="1.7" stroke-linecap="round" marker-end="url(#${m})"/>
      <circle class="flow-link-port" cx="2" cy="60" r="3.6" stroke="${n(i)}" stroke-width="1.5"/>
      <circle class="flow-link-port" cx="26" cy="60" r="3.6" stroke="${n(r)}" stroke-width="1.5"/>
    </svg>
  </div>`}function yr(e){if(!e)return"";let t=[];return e.started_at&&t.push(`\u958B\u59CB ${ye(e.started_at)}`),e.duration_ms&&t.push(`\u8017\u6642 ${re(e.duration_ms)}`),e.pid&&t.push(`PID ${e.pid}`),t.join(" \xB7 ")}function sl(e,{active:t,focus:s,status:a,runLine:r,runningStage:i}){let o=e.label||hr[e.key]||e.key;return`<div class="flow-source${t?" is-live":""}" style="--branch-accent:${Ws[e.key]||Ws.system}">
    <div class="flow-source-head">
      <span class="flow-source-icon">${u(e.icon||"database",15)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">SOURCE</span>
        <strong>${n(o)}</strong>
      </div>
      ${$r(a)}
    </div>
    <div class="flow-source-body">
      <p class="flow-source-desc">${n(e.description||"")}</p>
      <div class="flow-source-meta">${r}</div>
      ${i?`<div class="flow-source-current"><span class="flow-current-dot"></span>\u76EE\u524D\u968E\u6BB5\uFF1A<strong>${n(i.label||i.key)}</strong></div>`:""}
      ${s&&s.message?`<div class="flow-source-note" title="${n(s.message)}">${n(s.message)}</div>`:""}
    </div>
  </div>`}function al(e){let t=e.active_run,s=t||e.focus_run||e.last_run,a=t?"running":s?s.status:"idle",r=s?n(yr(s)||ss(s.started_at||s.finished_at)):"\u5C1A\u7121\u57F7\u884C\u7D00\u9304",i=Array.isArray(e.stages)?e.stages:[],o=i.find(w=>w.status==="running"),l=Ws[e.key]||Ws.system,d=String(e.key||"branch").replace(/[^a-zA-Z0-9_-]/g,""),m=sl(e,{active:t,focus:s,status:a,runLine:r,runningStage:o}),v=i.length?i.map((w,$)=>{let g=$?yt(i[$-1]):l;return`${tl(w,$,d,g)}${el(w,$)}`}).join(""):'<div class="flow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u968E\u6BB5\u3002</div>';return`<article class="flow-lane" style="--branch-accent:${l}"><div class="flow-row">${m}${v}</div></article>`}function nl(e){return`<div class="flow-canvas-open">
    <div class="processing-branches">${(Array.isArray(e.branches)?e.branches:[]).map(al).join("")}</div>
  </div>`}function Jt(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${n(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function rl(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},r=e.raw_backups||{},i=r.totals||{},o=e.state||{},l=e.capabilities||{},d=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",m=t.status==="operational",v=s.status==="operational",w=a.available!==!1,$=r.available!==!1,g=v?`${c(s.indexed)} / ${c(s.total)}`:ze(s.status||"unavailable"),h=v?`${nt(s.percent)} \xB7 \u5C1A\u9918 ${c(s.remaining)} \u7B46`:n(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),y=w?`${c(a.unprocessed)} / ${c(a.total)}`:ze("unavailable"),S=w?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${be(a.unprocessed_bytes)} \u5F85\u8655\u7406`:n(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${Jt("\u8655\u7406\u72C0\u614B",ze(e.status||"unknown"),`${n(d)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${Jt("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",n(y),S)}
    ${Jt("\u539F\u59CB Parquet \u5099\u4EFD",$?`${c(r.count)} \u6A94`:ze("unavailable"),$?`\u5171 ${c(i.row_count)} \u7B46 \xB7 ${be(i.compressed_bytes)}`:n(r.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB Parquet \u5099\u4EFD\u3002"))}
    ${Jt("PostgreSQL \u5224\u6C7A",m?c(t.judgment_count):ze("unavailable"),m?`\u6CD5\u898F ${mr(t.law_count)} \xB7 \u547D\u4EE4 ${mr(t.order_count)}`:n(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${Jt("Qdrant \u7D22\u5F15",g,h)}
    ${Jt("\u72C0\u614B\u6A94",ze(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${n(ye(o.updated_at))}`:n(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${Jt("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?n(l.start_blocked_reason):`\u672A\u8655\u7406 ${c(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${c(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${c(l.external_processes)} \u500B`:""}`)}
  </div>`}function il(e){if(e.available===!1)return _e({tone:"warn",title:"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304",text:n(e.error||"\u7121\u6CD5\u6383\u63CF .rar \u6A94\u6848\u3002")});let t=Number(e.total)||0,s=Number(e.processed)||0,a=Number(e.unprocessed)||0,r=t?100*s/t:null;return`<div class="processing-archive-summary">
    <div class="processing-archive-summary-head">
      <span class="mono">${n(e.data_dir||"")}</span>
      <span>${c(s)} / ${c(t)} \u5DF2\u8655\u7406 \xB7 ${c(a)} \u5F85\u8655\u7406 \xB7 ${be(e.unprocessed_bytes)} \u5F85\u8655\u7406</span>
    </div>
    ${$s({percent:r,status:a?"pending":"success",color:"var(--success)"},"processing-bar-lg")}
    <div class="processing-archive-summary-meta">
      <span>\u58D3\u7E2E\u6A94\u532F\u5165\u8986\u84CB ${nt(r)}</span>
      <span>\u5168\u90E8 ${be(e.total_bytes)}</span>
    </div>
  </div>`}function ol(e){let t=e.stages||{},a=["extract","filter","postgres"].map(r=>t[r]).filter(Boolean).map(r=>Xo(r,{compact:!0}));return a.length?`<div class="processing-archive-stages">${a.join("")}</div>`:""}function ll(e){let t=e.status||"pending",s=t==="running",a=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),r=s&&a===null,i=[];return e.message&&i.push(e.message),e.error&&i.push(e.error),(e.scanned||e.matched||e.stored)&&i.push(`\u6383\u63CF ${c(e.scanned)} \xB7 \u547D\u4E2D ${c(e.matched)} \xB7 \u5BEB\u5165 ${c(e.stored)}`),`<div class="processing-archive is-${Vt(t).tone}">
    <div class="processing-archive-head">
      <span class="processing-archive-name mono">${n(e.name)}</span>
      <div class="processing-archive-bar-wrap">
        ${$s({percent:a,status:t,color:s?"var(--accent)":"var(--success)"})}
      </div>
      <span class="processing-archive-percent mono">${r?"\u9032\u884C\u4E2D":nt(a)}</span>
      ${ze(t)}
      <span class="processing-archive-size faint">${be(e.size_bytes)}</span>
    </div>
    ${ol(e)}
    ${i.length?`<div class="processing-archive-note">${i.map(o=>`<span>${n(o)}</span>`).join("")}</div>`:""}
  </div>`}function cl(e){let t=e.archives||{},s=e.local_archives||{},a=Array.isArray(t.items)?t.items:[],r=t.run,i=`<div class="report-section-head">
    <div>
      <div class="report-kicker">ARCHIVE PIPELINE</div>
      <h2 class="report-section-title">\u5224\u6C7A\u58D3\u7E2E\u6A94</h2>
      <p class="processing-section-sub">\u6BCF\u500B\u58D3\u7E2E\u6A94\u540D\u7A31\u5F8C\u65B9\u5373\u6642\u986F\u793A\u8655\u7406\u9032\u5EA6\uFF1B\u672A\u53D6\u5F97\u53EF\u8A08\u7B97\u7684\u7E3D\u91CF\u6642\u6A19\u793A\u300C\u9032\u5EA6\u672A\u77E5\u300D\uFF0C\u4E0D\u4EE5\u63A8\u6E2C\u6578\u503C\u4EE3\u66FF\u3002</p>
    </div>
  </div>`,o=t.source==="run"?`${ze(r?r.status:"idle")} <span>\u76EE\u524D\u986F\u793A ${r?n(r.title||"\u5224\u6C7A\u532F\u5165"):"\u6700\u8FD1\u4E00\u6B21\u532F\u5165"} \u7684\u9010\u6A94\u9032\u5EA6${r&&r.started_at?` \xB7 ${n(yr(r))}`:""}</span>`:t.external?`${ze("running")} <span>${n(t.note||"\u5916\u90E8\u532F\u5165\u7A0B\u5E8F\u672A\u5BEB\u5165\u9010\u6A94\u72C0\u614B\uFF1B\u4EE5\u4E0B\u70BA PostgreSQL \u8986\u84CB\u7387\u3002")}</span>`:'<span class="faint">\u76EE\u524D\u6C92\u6709\u53EF\u8B80\u53D6\u7684\u532F\u5165 run \u72C0\u614B\uFF1B\u4EE5\u4E0B\u4EE5 PostgreSQL \u7684 source_archive \u5224\u5B9A\u662F\u5426\u5DF2\u8655\u7406\u3002</span>';return`<section class="report-card processing-card">
    <div class="report-head">${i}</div>
    <div class="report-section">
      ${il(s)}
      <div class="processing-archive-run">${o}</div>
      ${a.length?`<div class="processing-archive-list">${a.map(ll).join("")}</div>`:`<div class="processing-empty">\u627E\u4E0D\u5230 .rar \u58D3\u7E2E\u6A94\uFF1B\u8ACB\u78BA\u8A8D ${n(s.data_dir||"\u5224\u6C7A\u8CC7\u6599\u76EE\u9304")}\u3002</div>`}
    </div>
  </section>`}function dl(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let r=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${n(o.color||"var(--accent)")}" title="${n(`${o.label} ${re(o.duration_ms)} (${nt(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${n(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${n(o.label)}</span>
        <span class="mono">${re(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${nt(o.percent)}</span>
        ${ze(o.status)}
      </div>`).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section">
      <div class="processing-timeline-label">
        <span>${n(t.label||"\u968E\u6BB5\u8017\u6642")}</span>
        <span class="mono">\u7E3D\u8A08 ${re(t.total_ms)}</span>
      </div>
      <div class="processing-stack" role="img" aria-label="\u968E\u6BB5\u8017\u6642\u6BD4\u4F8B">${r}</div>
      <div class="processing-legend">${i}</div>
    </div>
  </section>`}function ul(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let r=t.map(i=>{let o=s.get(i.branch)||hr[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${n(o)}</span>
          <strong>${n(i.title||"\u8655\u7406")}</strong>
          ${ze(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${n(ye(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?re(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${n(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${r}</div></div>
  </section>`}function pl(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>_e({tone:s.tone||"info",title:s.title,text:n(s.message||"")})).join("")}</div>`:""}function fr(e){return`${pl(e)}
    ${rl(e)}
    <section class="processing-flow-section">
      <div class="processing-section-head">
        <div>
          <div class="report-kicker">PIPELINE CANVAS</div>
          <h2 class="report-section-title">\u8655\u7406\u6D41\u7A0B</h2>
          <p class="processing-section-sub">\u5224\u6C7A\u3001\u6CD5\u898F\u3001\u547D\u4EE4\u4E09\u689D\u6D41\u7A0B\u5373\u6642\u53CD\u6620\u76EE\u524D\u57F7\u884C\u968E\u6BB5\uFF1B\u66F2\u7DDA\u7531\u4F86\u6E90\u7BC0\u9EDE\u9023\u5230\u5404\u968E\u6BB5\uFF0C\u767C\u5149\u7BC0\u9EDE\u8207\u6D41\u52D5\u66F2\u7DDA\u8868\u793A\u76EE\u524D\u57F7\u884C\u4F4D\u7F6E\u3002</p>
        </div>
      </div>
      ${nl(e)}
    </section>
    ${cl(e)}
    ${dl(e)}
    ${ul(e)}`}function ml(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${_e({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:n(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${n(ye(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${u("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}var wr={overview:"activity",full_update:"download",law_download:"layers",order_download:"file",judgment_download:"download",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function gl(e){let s=(Array.isArray(e.workflows)?e.workflows:[]).map(r=>{let i=r.active_run||null,o=i||r.last_run||null;return{...r,activeRun:i,lastRun:o,status:i?i.status||"running":r.update_available?"update":o?.status||"idle"}}),a=s.find(r=>r.id==="judgment_parquet");return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...s.filter(r=>r.id!=="judgment_parquet"),...a?[a]:[]]}function br(e,t){return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${gl(e).map(a=>{let r=a.id===t,i=wr[a.id]||"terminal";return`${a.id==="normalize_courts"?'<div class="status-tab-divider" role="separator" aria-hidden="true"></div>':""}<button class="status-tab${r?" is-active":""}" type="button"
            data-processing-workflow="${n(a.id)}"
            ${r?'aria-current="page"':""}>
            <span class="status-tab-icon">${u(i,15)}</span>
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
    </div>`}function fl(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${ze(e.status)}
      <span class="mono">${n(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${n(ye(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${re(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${n(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${n(t.log_path)}</strong>`:""}
    </div>
  </div>`}function ys(e){return`${e.year}-${String(e.month_no).padStart(2,"0")}`}function _r(e){let t={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"},s=e.status||"red";return[ys(e),t[s]||s,e.latest_fileset_id?`fileset ${e.latest_fileset_id}`:"",e.filename||"",e.local_filename&&e.local_filename!==e.filename?`\u672C\u6A5F\uFF1A${e.local_filename}`:""].filter(Boolean).join(" \xB7 ")}function kr(e){if(!e.download_url)return"";let t=ys(e);return`<a class="judgment-month-download" href="${n(tt(e.download_url))}" target="_blank" rel="noreferrer" title="\u4E0B\u8F09 ${t} \u5224\u6C7A" aria-label="\u4E0B\u8F09 ${t} \u5224\u6C7A">${u("download",11)}</a>`}function bl(e){let t=e.status||"red";return`<td class="judgment-month is-${n(t)}" data-judgment-month-key="${n(ys(e))}" title="${n(_r(e))}"><span>${e.month_no}</span>${kr(e)}</td>`}function vl(e){return e?.off_hours_enabled===!0}function Sr(e){return`\u7DA0\u8272\uFF1A\u6700\u65B0\u7248\u5DF2\u4E0B\u8F09\u5230 raw_rar\uFF1B\u7070\u8272\uFF1A\u672C\u6A5F\u4ECD\u662F\u820A\u7248\uFF0C\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u6703\u66F4\u65B0\uFF1B\u7D05\u8272\uFF1A\u8A72\u6708\u4EFD\u7F3A\u5C11\u5224\u6C7A\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u958B\u555F\u4E0B\u8F09\u9023\u7D50\uFF08${vl(e)?"\u975E API \u6642\u6BB5\u4E5F\u53EF\u4E0B\u8F09\uFF0C\u5EFA\u8B70\u4E00\u6B21\u53EA\u4E0B\u8F09\u4E00\u500B\u6A94\u6848":"\u4E0B\u8F09\u9023\u7D50\u50C5\u5728 00:00\u201306:00 API \u6642\u6BB5\u53EF\u7528"}\uFF09\u3002\u5F85\u88DC\u9F4A\u6708\u4EFD\u6703\u512A\u5148\u4E0B\u8F09\uFF0C\u5168\u90E8\u88DC\u9F4A\u5F8C\u624D\u7531\u6700\u65B0\u6708\u4EFD\u5F80\u56DE\u9A57\u8B49\u65E2\u6709\u6A94\u6848\uFF1B\u4E2D\u65B7\u7684\u4E0B\u8F09\u6703\u4FDD\u7559 .part\uFF0C\u4F3A\u670D\u5668\u652F\u63F4 Range \u6642\u7E8C\u50B3\uFF0C\u5426\u5247\u5F9E\u96F6\u91CD\u65B0\u4E0B\u8F09\u3002\u9996\u6B21\u5B8C\u6574\u540C\u6B65\u53EF\u80FD\u9700\u4E0B\u8F09\u6578\u767E\u500B\u6708\u4EFD\uFF0C\u9810\u8A2D\u975E\u6642\u6BB5\u4E5F\u53EF\u7E8C\u50B3\uFF1B\u56B4\u683C\u6A21\u5F0F\u6703\u5728 00:00\u201306:00 \u4EE5\u5916\u505C\u6B62\u3002`}var hl={completed:"\u5B8C\u6210",window_closed:"API \u6642\u6BB5\u7D50\u675F",deadline:"\u63A5\u8FD1 06:00\uFF0C\u4FDD\u7559\u5F85\u4E0B\u8F09\u6708\u4EFD",verification_window_closed:"API \u6642\u6BB5\u7D50\u675F\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",verification_deadline:"\u63A5\u8FD1 06:00\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",errors:"\u90E8\u5206\u6708\u4EFD\u4E0B\u8F09\u5931\u6557\uFF0C\u4E0B\u6B21\u91CD\u8A66",pending:"\u4ECD\u6709\u5F85\u4E0B\u8F09\u6708\u4EFD",check_only:"\u50C5\u6AA2\u67E5\uFF0C\u672A\u4E0B\u8F09",incremental:"\u589E\u91CF\u6AA2\u67E5\u5B8C\u6210",status_only:"\u50C5\u66F4\u65B0\u6708\u4EFD\u72C0\u614B",running:"\u57F7\u884C\u4E2D"};function xr(e){let t=e?.backfill||{},s=t.verification||{},a=t.last_run||{},r=Number(t.pending_count)||0,i=Number(t.failure_count)||0,o=String(t.resume_from_month||""),l="\u9A57\u8B49\uFF1A\u672A\u958B\u59CB";s.status==="completed"?l="\u9A57\u8B49\u5B8C\u6210":s.next_month?l=`\u9A57\u8B49\u7E8C\u50B3 ${s.next_month}`:s.status==="in_progress"&&(l="\u9A57\u8B49\u9032\u884C\u4E2D");let d=String(a.stop_reason||""),m=d?`\u4E0A\u6B21\u505C\u6B62\uFF1A${hl[d]||d}`:"";return{pending:r,failures:i,resume:o,verificationText:l,lastText:m}}function $l(e){let t=xr(e),s=t.pending>0?`\u5F85\u88DC\u9F4A ${c(t.pending)} \u500B\u6708${t.failures>0?`\uFF08${c(t.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708";return`<div class="judgment-backfill" data-judgment-backfill>
    <span class="badge ${t.pending>0?"badge-danger":"badge-ok"}" data-judgment-backfill-pending>${s}</span>
    <span class="badge badge-neutral" data-judgment-backfill-resume ${t.resume&&t.pending>0?"":"hidden"}>\u5F9E ${n(t.resume)} \u7E8C\u50B3</span>
    <span class="badge badge-info" data-judgment-backfill-verification>${n(t.verificationText)}</span>
    <span class="muted" data-judgment-backfill-last ${t.lastText?"":"hidden"}>${n(t.lastText)}</span>
  </div>`}function yl(e,t){let s=xr(t),a=e.querySelector("[data-judgment-backfill-pending]");a&&(a.textContent=s.pending>0?`\u5F85\u88DC\u9F4A ${c(s.pending)} \u500B\u6708${s.failures>0?`\uFF08${c(s.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708",a.classList.toggle("badge-danger",s.pending>0),a.classList.toggle("badge-ok",s.pending===0));let r=e.querySelector("[data-judgment-backfill-resume]");if(r){let l=!!s.resume&&s.pending>0;r.hidden=!l,r.textContent=l?`\u5F9E ${s.resume} \u7E8C\u50B3`:""}let i=e.querySelector("[data-judgment-backfill-verification]");i&&(i.textContent=s.verificationText);let o=e.querySelector("[data-judgment-backfill-last]");o&&(o.hidden=!s.lastText,o.textContent=s.lastText)}function Ba(){return'<div class="judgment-months-loading"><span class="spinner"></span><span>\u8B80\u53D6\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B\u2026</span></div>'}function wl(e){if(e?.loading&&!e?.months?.length)return Ba();if(e?.error&&!e?.months?.length)return _e({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:n(e.error)});let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return'<div class="processing-empty">\u5C1A\u672A\u6709\u6708\u4EFD\u72C0\u614B\uFF1B\u8ACB\u5148\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u3002</div>';let s=new Map(t.map(o=>[ys(o),o])),r=[...new Set(t.map(o=>o.year))].sort((o,l)=>l-o).map(o=>{let l=Array.from({length:12},(d,m)=>{let v=s.get(`${o}-${String(m+1).padStart(2,"0")}`);return v?bl(v):`<td class="judgment-month is-empty"><span>${m+1}</span></td>`}).join("");return`<tr><th scope="row">${o}</th>${l}</tr>`}).join(""),i=e.summary||{};return`<div class="judgment-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" data-judgment-summary="green">\u6700\u65B0\u7248 ${c(i.green||0)}</span>
      <span class="badge badge-neutral" data-judgment-summary="gray">\u820A\u7248 ${c(i.gray||0)}</span>
      <span class="badge badge-danger" data-judgment-summary="red">\u7F3A\u5931 ${c(i.red||0)}</span>
      <span class="muted" data-judgment-total>\u5171 ${c(e.total_months||t.length)} \u500B\u6708</span>
    </div>
    ${$l(e)}
    <div class="judgment-months-scroll">
      <table class="judgment-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(o,l)=>`<th scope="col">${l+1}</th>`).join("")}</tr></thead>
        <tbody>${r}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint" data-judgment-hint>${n(Sr(e))}</p>
  </div>`}function _l(e,t){let s=Array.isArray(t?.months)?t.months:[],a=t.summary||{},r={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"};e.querySelectorAll("[data-judgment-summary]").forEach(l=>{let d=l.dataset.judgmentSummary||"";l.textContent=`${r[d]||d} ${c(a[d]||0)}`});let i=e.querySelector("[data-judgment-total]");i&&(i.textContent=`\u5171 ${c(t.total_months||s.length)} \u500B\u6708`),yl(e,t);let o=e.querySelector("[data-judgment-hint]");if(o){let l=Sr(t);o.textContent!==l&&(o.textContent=l)}for(let l of s){let d=ys(l),m=e.querySelector(`[data-judgment-month-key="${d}"]`);if(!m)continue;let v=l.status||"red";m.classList.contains(`is-${v}`)||(m.classList.remove("is-green","is-gray","is-red","is-empty"),m.classList.add(`is-${v}`));let w=_r(l);m.title!==w&&(m.title=w);let $=m.querySelector(".judgment-month-download");if(l.download_url){let g=tt(l.download_url);$?$.getAttribute("href")!==g&&($.href=g):m.insertAdjacentHTML("beforeend",kr(l))}else $&&$.remove()}}function kl(e){let t=Array.isArray(e)?e:[];return t.length?`<div class="processing-workflow-history">
    ${t.map(s=>`<div class="processing-workflow-history-row">
          <span class="processing-workflow-history-status">${ze(s.status||"idle")}</span>
          <span class="mono">${n(ye(s.started_at))}</span>
          <span class="mono">${n(re(s.duration_ms||0))}</span>
          <span class="processing-workflow-history-message">${n(s.message||"\u2014")}</span>
        </div>`).join("")}
  </div>`:'<div class="processing-workflow-empty">\u5C1A\u7121\u57F7\u884C\u7D00\u9304\u3002</div>'}function Sl(e){let t=Array.isArray(e.update_history)?e.update_history:[];if(!t.length)return'<div class="processing-workflow-empty">\u5C1A\u7121\u7248\u672C\u6AA2\u67E5\u7D00\u9304\u3002</div>';let s={up_to_date:["\u5DF2\u662F\u6700\u65B0","badge-ok"],update_available:["\u6709\u66F4\u65B0","badge-warn"],error:["\u6AA2\u67E5\u5931\u6557","badge-danger"]};return`<div class="processing-workflow-history">
    ${t.map(a=>{let[r,i]=s[a.status]||[a.status||"\u672A\u77E5","badge-neutral"],o=a.remote_content_length!=null?be(a.remote_content_length):"\u2014",l=a.local_version_id?`v${a.local_version_id}`:"\u2014";return`<div class="processing-workflow-history-row">
          <span class="badge ${i}">${n(r)}</span>
          <span class="mono">${n(ye(a.checked_at))}</span>
          <span class="mono">\u9060\u7AEF ${n(o)}</span>
          <span class="mono">\u672C\u5730 ${n(l)}</span>
          <span class="processing-workflow-history-message">${n(a.message||"\u2014")}</span>
        </div>`}).join("")}
  </div>`}function Ia(e){let t=String(e.key||""),s=Vt(e.status);return[`data-stage-key="${n(t)}"`,`data-stage-label="${n(e.label||t)}"`,`data-stage-color="${n(yt(e))}"`,`data-stage-status-key="${n(e.status||"idle")}"`,`data-stage-status="${n(s.label)}"`,`data-stage-percent="${n(nt(e.percent))}"`,`data-stage-counts="${n(Oa(e))}"`,`data-stage-duration="${n(re(e.duration_ms||0))}"`,`data-stage-contribution="${n(nt(e.contribution_percent))}"`,`data-stage-message="${n(e.message||"")}"`].join(" ")}function xl(e){let t=String(e.status||"idle");return`<div class="processing-workflow-stage${t==="running"?" is-running":""}" style="--stage-color:${n(yt(e))}" ${Ia(e)}>
    <div class="processing-workflow-stage-head">
      <span class="processing-workflow-stage-swatch"></span>
      <span class="processing-workflow-stage-label">${n(e.label||e.key||"\u968E\u6BB5")}</span>
      ${ze(t)}
      <span class="processing-workflow-stage-percent mono">${nt(e.percent)}</span>
    </div>
    ${$s(e)}
    <div class="processing-workflow-stage-meta">
      <span>${n(Oa(e))}</span>
      <span class="mono">${re(e.duration_ms||0)}</span>
      <span class="processing-workflow-stage-message">${n(e.message||"\u2014")}</span>
    </div>
  </div>`}function ql(e){let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${u("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u5404\u968E\u6BB5\u8207\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </section>`;let a=t.overall_percent,i=s.filter($=>$.status!=="skipped").filter($=>Number($.contribution_percent)>0).map($=>`<span class="processing-workflow-progress-segment" style="width:${Number($.contribution_percent)||0}%;background:${n(yt($))}" ${Ia($)}></span>`).join(""),o=s.map($=>`<div class="processing-workflow-progress-legend-item${$.status==="skipped"?" is-skipped":""}" ${Ia($)}>
        <span class="processing-workflow-progress-swatch" style="background:${n(yt($))}"></span>
        <span class="processing-workflow-progress-legend-label">${n($.label||$.key||"\u968E\u6BB5")}</span>
        <span class="mono">${nt($.percent)}</span>
      </div>`).join(""),l=Number(t.completed_stages)||0,d=Number(t.total_stages)||0,m=s.filter($=>$.status==="skipped").length,v=m?`\u5B8C\u6210 ${l} \xB7 \u7565\u904E ${m}`:`${l} / ${d} \u968E\u6BB5`,w=Wo[e.id]||"";return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${u("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
      <span class="badge ${t.run_status==="running"?"badge-info":"badge-neutral"}">${v}</span>
    </div>
    <div class="processing-workflow-stage-list">${s.map(xl).join("")}</div>
    <div class="processing-workflow-overall">
      <div class="processing-workflow-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${nt(a)}</span>
      </div>
      <div class="processing-workflow-progress-stack" role="img" aria-label="\u5404\u968E\u6BB5\u9032\u5EA6\u52A0\u7E3D">${i||'<span class="processing-workflow-progress-empty">\u5C1A\u7121\u53EF\u8A08\u7B97\u9032\u5EA6</span>'}</div>
      <div class="processing-workflow-progress-legend">${o}</div>
      <div class="processing-workflow-progress-hint">\u5C07\u6ED1\u9F20\u79FB\u5230\u4EFB\u4E00\u968E\u6BB5\u6216\u8272\u584A\uFF0C\u53EA\u6703\u4FDD\u7559\u8A72\u9805\u76EE\u4E26\u986F\u793A\u8AAA\u660E\uFF1B\u7565\u904E\u968E\u6BB5\u4E0D\u5217\u5165\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </div>
    ${w?`<p class="processing-workflow-scope-note">${u("info",12)}<span>${n(w)}</span></p>`:""}
  </section>`}function Al(e){let t=String(e||"");return t.length===6?`${t.slice(0,4)}-${t.slice(4)}`:t||"\u2014"}function Ll(e,t){let s={primary:"\u4E3B\u8981",fallback:"\u5099\u63F4",provided:"\u5916\u90E8"},a=Array.isArray(e.models)?e.models:[],r=a.length?a.join("\u3001"):"\u2014";return`<div class="index-host-row${e.url&&e.url===t?" is-selected":""}">
    <div class="index-host-head">
      <span class="badge badge-neutral">${n(s[e.role]||e.role||"\u4E3B\u6A5F")}</span>
      <strong class="mono">${n(e.host||"\u2014")}:${n(e.port??"\u2014")}</strong>
      ${ze(e.status||"unavailable")}
      <span class="index-host-model">${n(e.model||"\u2014")}</span>
    </div>
    <div class="index-host-url mono">${n(e.url||"\u2014")}</div>
    <div class="index-host-models" title="${n(r)}">\u6A21\u578B\uFF1A${n(r)}</div>
    ${e.detail?`<div class="index-host-detail">${n(e.detail)}</div>`:""}
  </div>`}function Ml(e){let t=Array.isArray(e.months)?e.months:[],s=e.current||{},a=new Map;for(let l of t){let d=String(l.month||"");if(!/^\d{6}$/.test(d))continue;let m=Number(d.slice(4,6));if(m<1||m>12)continue;let v=a.get(d);v||(v={key:d,year:d.slice(0,4),monthNo:m,total:0,processed:0,reused:0,embedded:0,archives:[],current:!1,jid:""},a.set(d,v)),v.total+=Number(l.total)||0,v.processed+=Number(l.processed)||0,v.reused+=Number(l.reused)||0,v.embedded+=Number(l.embedded)||0,l.archive&&v.archives.push(String(l.archive)),s.month===d&&(!s.archive||s.archive===l.archive)&&(v.current=!0,v.jid=String(s.jid||""))}if(!a.size)return'<div class="processing-workflow-empty">\u5C1A\u7121\u53EF\u986F\u793A\u7684\u7D22\u5F15\u6708\u4EFD\uFF1B\u958B\u59CB\u7D22\u5F15\u5F8C\u6703\u4F9D\u6642\u9593\u5217\u51FA\u6708\u4EFD\u72C0\u614B\u3002</div>';let r={green:0,red:0,gray:0};for(let l of a.values())l.total>0&&l.processed>=l.total?(l.status="green",r.green+=1):l.processed>0?(l.status="red",r.red+=1):(l.status="gray",r.gray+=1);let o=[...new Set([...a.values()].map(l=>l.year))].sort((l,d)=>d.localeCompare(l)).map(l=>{let d=Array.from({length:12},(m,v)=>{let w=v+1,$=`${l}${String(w).padStart(2,"0")}`,g=a.get($);if(!g)return`<td class="judgment-month is-empty"><span>${w}</span></td>`;let h=g.total?`${Math.min(100,Math.round(g.processed/g.total*1e3)/10)}%`:"\u2014",y=g.current&&e.run_status==="running",S=[`${g.year}-${String(g.monthNo).padStart(2,"0")}`,g.archives.join("\u3001")||"\u2014",`\u5DF2\u8655\u7406 ${c(g.processed)} / ${c(g.total)}\uFF08${h}\uFF09`,`\u91CD\u7528 ${c(g.reused)} \xB7 \u65B0 embedding ${c(g.embedded)}`,g.current?`${y?"\u76EE\u524D\u7D22\u5F15":"\u6700\u5F8C\u7D22\u5F15"}${g.jid?` \xB7 ${g.jid}`:""}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month index-month is-${g.status}${y?" is-active":""}" title="${n(S)}"${y?' aria-current="true"':""}><span>${w}</span></td>`}).join("");return`<tr><th scope="row">${n(l)}</th>${d}</tr>`}).join("");return`<div class="judgment-months index-months">
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
  </div>`}function jl(e){let t=e.import_timeline||{},s=Array.isArray(t.months)?t.months:[];if(!s.length)return`<section class="report-card processing-card import-files-card">
      <div class="side-card-head">
        <span class="side-card-title">${u("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u672A\u53D6\u5F97\u5224\u6C7A\u4E0B\u8F09 manifest \u6216\u672C\u6A5F\u58D3\u7E2E\u6A94\uFF1B\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u5F8C\u6703\u986F\u793A\u6708\u4EFD\u72C0\u614B\u3002</div>
    </section>`;let a=new Map(s.map(v=>[String(v.month),v])),r=[...new Set(s.map(v=>v.year))].sort((v,w)=>w-v),i={green:"\u5DF2\u532F\u5165",red:"\u672A\u532F\u5165",gray:"\u6709\u66F4\u65B0"},o=s.find(v=>v.active),l=r.map(v=>{let w=Array.from({length:12},($,g)=>{let h=g+1,y=`${v}${String(h).padStart(2,"0")}`,S=a.get(y);if(!S)return`<td class="judgment-month is-empty"><span>${h}</span></td>`;let N=i[S.status]?S.status:"red",D=[`${v}-${String(h).padStart(2,"0")}`,i[N],`\u672C\u6A5F ${S.local_files?.join("\u3001")||"\u2014"}`,`\u5DF2\u532F\u5165 ${S.imported_files?.join("\u3001")||"\u2014"}`,S.unimported_files?.length?`\u5F85\u532F\u5165 ${S.unimported_files.join("\u3001")}`:"",S.manifest_status==="gray"?"\u9060\u7AEF\u6709\u65B0\u7248\u672C":"",S.active?`\u76EE\u524D\u532F\u5165${S.active_archive?` \xB7 ${S.active_archive}`:""}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month import-month is-${N}${S.active?" is-active":""}" title="${n(D)}"${S.active?' aria-current="true"':""}><span>${h}</span></td>`}).join("");return`<tr><th scope="row">${n(v)}</th>${w}</tr>`}).join(""),d=t.summary||{},m=o?`<div class="index-current-row">
        <span class="badge badge-info">${u("activity",11)}\u76EE\u524D\u532F\u5165</span>
        <strong class="mono">${n(`${String(o.year)}-${String(o.month_no).padStart(2,"0")}`)}</strong>
        <span class="mono">${n(o.active_archive||"\u2014")}</span>
      </div>`:"";return`<section class="report-card processing-card import-files-card">
    <div class="side-card-head">
      <span class="side-card-title">${u("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
      <span class="badge badge-neutral">${c(t.total_months||s.length)} \u500B\u6708</span>
    </div>
    <div class="judgment-months index-months">
      <div class="judgment-months-meta">
        <span class="badge badge-ok">\u5DF2\u532F\u5165 ${c(d.green||0)}</span>
        <span class="badge badge-danger">\u672A\u532F\u5165 ${c(d.red||0)}</span>
        <span class="badge badge-neutral">\u6709\u66F4\u65B0 ${c(d.gray||0)}</span>
        <span class="muted">\u5171 ${c(t.total_months||s.length)} \u500B\u6708</span>
      </div>
      ${m}
      <div class="judgment-months-scroll">
        <table class="judgment-months-table import-months-table">
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(v,w)=>`<th scope="col">${w+1}</th>`).join("")}</tr></thead>
          <tbody>${l}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u5DF2\u532F\u5165 PostgreSQL\uFF1B\u7070\u8272\uFF1A\u6709\u65B0\u6A94\u6216\u9060\u7AEF\u65B0\u7248\u672C\u5F85\u532F\u5165\uFF1B\u7D05\u8272\uFF1A\u5C1A\u672A\u532F\u5165\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u672C\u6A5F\u6A94\u6848\u8207\u5DF2\u532F\u5165\u6A94\u6848\u3002</p>
    </div>
  </section>`}function Tl(e){let t=e.index_runtime||{};if(!t.available)return`<section class="report-card processing-card index-runtime-card">
      <div class="side-card-head">
        <span class="side-card-title">${u("cloud",14)}Ollama \u9023\u7DDA\u6E2C\u8A66</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C Qdrant \u7248\u672C\u5EFA\u7F6E\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u6E2C\u8A66\u7684\u4E3B\u6A5F\u3001\u6A21\u578B\u8207\u9078\u7528\u7D50\u679C\u3002</div>
    </section>`;let s=!!t.coverage_only,a=t.embedding||{},r=Array.isArray(a.hosts)?a.hosts:[],i=a.selected||{},o=a.active||{},l=t.current||{},d=t.summary||{},m=i.url||"",v=o.url||"",w=r.map(h=>Ll(h,m)).join(""),$=t.run_status==="running"?"\u76EE\u524D\u8655\u7406":"\u6700\u5F8C\u8655\u7406",g=l.jid?`<div class="index-current-row">
        <span class="badge badge-info">${u("activity",11)}${$}</span>
        <strong class="mono">${n(Al(l.month))}</strong>
        <span class="mono">${n(l.archive||"\u2014")}</span>
        <span class="mono">${n(l.jid||"\u2014")}</span>
        <span class="index-current-copy">${n([l.court,l.title].filter(Boolean).join(" \xB7 ")||"\u2014")}</span>
        <span class="faint">\u6279\u6B21 ${c(l.batch_size)} \u7B46</span>
      </div>`:"";return`<section class="report-card processing-card index-runtime-card"${s?" hidden":""}>
    <div class="side-card-head">
      <span class="side-card-title">${u("cloud",14)}Ollama \u9023\u7DDA\u6E2C\u8A66</span>
      ${ze(a.status||"idle")}
    </div>
    ${t.error?`<div class="processing-update-notice index-runtime-error">${u("alert",13)}<span>${n(t.error)}</span></div>`:""}
    <div class="index-selected-host">
      <span class="faint">\u6700\u5F8C\u9078\u7528</span>
      <strong class="mono">${n(i.url||"\u2014")}</strong>
      <span>${n(i.model||a.model||"\u2014")}</span>
      <span class="mono">port ${n(i.port??"\u2014")}</span>
      ${v&&v!==m?`<span class="badge badge-warn">\u76EE\u524D\u4F7F\u7528 ${n(v)}</span>`:""}
      ${o.using_fallback?'<span class="badge badge-warn">\u5DF2\u5207\u63DB\u5099\u63F4</span>':""}
    </div>
    <div class="index-host-list">${w||'<div class="processing-workflow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u4E3B\u6A5F\u6E2C\u8A66\u7D50\u679C\u3002</div>'}</div>
    ${a.tested_at?`<div class="index-runtime-foot">\u6E2C\u8A66\u6642\u9593 ${n(ye(a.tested_at))}</div>`:""}
  </section>
  <section class="report-card processing-card index-files-card">
    <div class="side-card-head">
      <span class="side-card-title">${u("table",14)}\u7D22\u5F15\u6A94\u6848\u6642\u9593\u8868</span>
      <span class="badge badge-neutral">${c(d.indexed)} / ${c(d.total)} \u7B46</span>
    </div>
    <div class="index-runtime-summary">
      <span>\u7248\u672C <strong class="mono">v${n(t.version_id??"\u2014")}</strong></span>
      <span>Collection <code>${n(t.collection||"\u2014")}</code></span>
      <span>\u6A21\u5F0F <strong>${n(t.build_mode||"\u2014")}</strong></span>
      ${s?"":`<span>\u91CD\u7528 <strong class="mono">${c(d.reused)}</strong></span>
            <span>\u65B0 embedding <strong class="mono">${c(d.embedded)}</strong></span>`}
    </div>
    ${g}
    ${Ml(t)}
    ${s?'<p class="judgment-months-hint index-coverage-note">\u76EE\u524D\u986F\u793A active collection \u7684\u6708\u4EFD\u7D22\u5F15\u8986\u84CB\uFF1B\u57F7\u884C Qdrant \u7248\u672C\u5EFA\u7F6E\u5F8C\u6703\u986F\u793A\u672C\u6B21 Ollama \u6E2C\u8A66\u8207\u5373\u6642\u9032\u5EA6\u3002</p>':""}
  </section>`}function El(e={}){let{storage:t,loading:s,error:a}=e;if(a)return`<section class="report-card processing-card index-storage-card">
      <div class="side-card-head">
        <span class="side-card-title">${u("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
        <button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-index-storage">${u("refresh",12)}<span>\u91CD\u65B0\u6574\u7406</span></button>
      </div>
      <div class="processing-workflow-empty">${n(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card index-storage-card">
      <div class="side-card-head">
        <span class="side-card-title">${u("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
        <span class="badge badge-neutral">${s?"\u8B80\u53D6\u4E2D":"\u5C1A\u7121"}</span>
      </div>
      <div class="processing-workflow-empty">${s?"\u6B63\u5728\u53D6\u5F97 Docker \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u2026":"\u5207\u63DB\u5230\u6B64\u6D41\u7A0B\u5F8C\u6703\u8B80\u53D6 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002"}</div>
    </section>`;let r=t.qdrant_storage||{},o=(Array.isArray(t.databases)?t.databases:[]).find(v=>v.id==="qdrant")||{},l=r.volume_bytes??o.volume_bytes??null,d=r.points_count??o.points_count,m=r.segments_count??o.segments_count;return`<section class="report-card processing-card index-storage-card">
    <div class="side-card-head">
      <span class="side-card-title">${u("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
      <button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-index-storage">${u("refresh",12)}<span>\u91CD\u65B0\u6574\u7406</span></button>
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
      <span>Points\uFF0FSegments</span><strong class="mono">${c(d)} / ${c(m)}</strong>
    </div>
    <div class="index-runtime-foot">\u8CC7\u6599\u6642\u9593 ${n(ye(t.checked_at))}</div>
  </section>`}function Da({badge:e="",lead:t="",rows:s=[],note:a=""}){return`<section class="report-card processing-card parquet-help-card workflow-help-card">
    <div class="side-card-head">
      <span class="side-card-title">${u("info",14)}\u529F\u80FD\u8AAA\u660E</span>
      ${e?`<span class="badge badge-neutral">${n(e)}</span>`:""}
    </div>
    <div class="parquet-help-body">
      <p class="parquet-help-lead">${t}</p>
      <div class="parquet-help-grid">${s.map(([r,i])=>`<span>${n(r)}</span><strong>${i}</strong>`).join("")}</div>
      ${a?`<p class="parquet-help-note">${a}</p>`:""}
    </div>
  </section>`}function Nl(){return Da({badge:"\u552F\u8B80\u532F\u51FA",lead:"\u5C07 PostgreSQL \u76EE\u524D\u6709\u6548\u7684\u5224\u6C7A\uFF08<code>judgment_documents.is_current = true</code>\uFF09\u532F\u51FA\u6210\u7368\u7ACB\u7684 Parquet \u5FEB\u7167\uFF0C\u4F9B\u96E2\u7DDA\u5206\u6790\u3001\u8CC7\u6599\u4EA4\u63DB\u6216\u4FDD\u5B58\u3002",rows:[["\u4F86\u6E90","PostgreSQL <code>judgment_documents</code>\uFF0C\u53EA\u542B\u76EE\u524D\u6709\u6548\u4E14\u5DF2\u547D\u4E2D\u91D1\u878D\u6CD5\u898F\u6E05\u55AE\u7684\u5224\u6C7A\u3002"],["\u8F38\u51FA",'<span class="mono">JUDGMENT_DATA_DIR/parquet/judgments/YYYYMMDD/HHMMSS-xxxxxxxx/judgments.parquet</span>'],["\u9644\u5E36\u6A94",'<span class="mono">\u540C\u76EE\u9304 manifest.json\uFF08\u7B46\u6578\u3001\u6A94\u6848\u5927\u5C0F\u3001\u6B04\u4F4D\u3001\u7522\u751F\u6642\u9593\uFF09</span>'],["\u5167\u5BB9","\u6848\u865F\u3001\u6CD5\u9662\u3001\u6848\u7531\u3001\u5168\u6587\u3001\u547D\u4E2D\u6CD5\u898F\u3001\u5F15\u7528\u3001\u4F86\u6E90\u58D3\u7E2E\u6A94\u8207\u6642\u9593\u6B04\u4F4D\uFF1B<code>citations</code> \u4EE5 JSON \u5B57\u4E32\u4FDD\u5B58\u3002"],["\u8207\u539F\u59CB Parquet","\u8CC7\u6599\u9801\u8207 <code>source=parquet</code> \u4F7F\u7528 <code>parquet/raw_judgments/.../raw.parquet</code>\uFF1B\u672C\u6D41\u7A0B\u7684 <code>parquet/judgments/...</code> \u662F\u53E6\u4E00\u500B\u6B63\u898F\u5316\u5FEB\u7167\u3002"],["\u4E0D\u6703","\u4E0D\u5BEB\u56DE PostgreSQL\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u820A\u5FEB\u7167\uFF1B\u53EA\u532F\u51FA current \u8CC7\u6599\uFF0C\u4E0D\u542B\u6B77\u53F2\u7248\u672C\u3002"],["\u4E2D\u65B7","\u6BCF\u6B21\u57F7\u884C\u5EFA\u7ACB\u65B0\u7684\u5B8C\u6574\u5FEB\u7167\uFF1B\u4E2D\u65B7\u5F8C\u91CD\u65B0\u57F7\u884C\u4E0D\u6703\u7E8C\u5BEB\u540C\u4E00\u500B Parquet \u6A94\u3002"]],note:"\u9069\u5408 DuckDB\u3001pandas\u3001Spark \u7B49\u96E2\u7DDA\u5206\u6790\uFF0C\u6216\u9700\u8981\u56FA\u5B9A\u6642\u9593\u9EDE\u7684\u53EF\u91CD\u73FE\u8CC7\u6599\u5FEB\u7167\u3002\u65E5\u5E38 RAG \u67E5\u8A62\u8207\u8CC7\u6599\u9801\u700F\u89BD\u4E0D\u9700\u8981\u57F7\u884C\u6B64\u6D41\u7A0B\u3002"})}function Cl(){return Da({badge:"PostgreSQL \u56DE\u586B",lead:"\u5C07\u5224\u6C7A\u7684 <code>court</code> \u8F49\u6210\u6A19\u6E96\u6CD5\u9662\u540D\u7A31\u4E26\u5BEB\u5165 <code>court_normalized</code>\uFF1B\u539F\u59CB <code>court</code> \u6703\u4FDD\u7559\u4F9B\u8FFD\u6EAF\u3002",rows:[["\u8655\u7406\u7BC4\u570D","\u9810\u8A2D\u53EA\u8655\u7406 <code>court_normalized</code> \u70BA\u7A7A\u7684\u8CC7\u6599\uFF1B\u5DF2\u6B63\u898F\u5316\u8CC7\u6599\u6703\u8DF3\u904E\uFF0C\u53EF\u7528 <code>--all</code> \u91CD\u65B0\u8A08\u7B97\u5168\u90E8\u3002"],["\u89E3\u6790\u9806\u5E8F","\u539F\u59CB\u6CD5\u9662\u503C\u958B\u982D\u7B26\u5408\u6A19\u6E96\u540D\u7A31 \u2192 \u5224\u6C7A\u5168\u6587\u524D 8,000 \u5B57\u6700\u65E9\u51FA\u73FE\u7684\u6CD5\u9662 \u2192 \u539F\u59CB\u6CD5\u9662\u503C\u4EFB\u610F\u4F4D\u7F6E\u7684\u6A19\u6E96\u540D\u7A31 \u2192 JID \u5B98\u65B9\u6CD5\u9662\u4EE3\u78BC\u3002"],["\u8F38\u51FA","\u5BEB\u5165 <code>judgment_documents.court_normalized</code>\uFF1B\u4E0D\u4FEE\u6539\u539F\u59CB <code>court</code>\u3001\u5168\u6587\u6216\u5176\u4ED6\u5224\u6C7A\u6B04\u4F4D\u3002"],["\u672A\u89E3\u6790","\u7121\u6CD5\u5224\u65B7\u6642\u4FDD\u7559\u7A7A\u503C\uFF0C\u4E0D\u731C\u6E2C\uFF1B\u6458\u8981\u6703\u5217\u51FA\u672A\u89E3\u6790\u7B46\u6578\u8207\u5E38\u898B\u6A23\u672C\u3002"],["\u5F71\u97FF","\u8CC7\u6599\u9801\u7684\u6CD5\u9662\u4E0B\u62C9\u3001\u7CBE\u78BA\u7BE9\u9078\u3001\u6392\u5E8F\u3001\u7D50\u679C\u6B04\u4F4D\u8207\u5224\u6C7A\u539F\u6587\u4F7F\u7528\u6B63\u898F\u5316\u540D\u7A31\uFF1BAPI \u4ECD\u56DE\u50B3 <code>court_raw</code>\u3002"],["\u4E0D\u6703","\u4E0D\u91CD\u65B0\u532F\u5165\u5224\u6C7A\u3001\u4E0D\u6539\u5168\u6587\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u8CC7\u6599\u3002"],["\u91CD\u8DD1","\u9810\u8A2D\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u898F\u5247\u66F4\u65B0\u5F8C\u53EF\u7528 <code>--all</code> \u91CD\u7B97\uFF0C\u6216\u5148\u7528 <code>--dry-run</code> \u7D71\u8A08\u3002"]],note:"\u9069\u5408\u5728\u5224\u6C7A\u532F\u5165\u5F8C\u3001\u6CD5\u9662\u540D\u7A31\u898F\u5247\u66F4\u65B0\u5F8C\uFF0C\u6216\u8CC7\u6599\u9801\u6CD5\u9662\u9078\u9805\u51FA\u73FE\u7F3A\u6F0F\u6642\u57F7\u884C\u3002\u7D50\u679C\u4E5F\u6703\u5BEB\u5165\u6548\u80FD\u7D00\u9304\u3002"})}function Rl(){return Da({badge:"\u689D\u6587\u6B77\u53F2\u5EFA\u6A94",lead:"\u70BA\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u5EFA\u7ACB <code>law_article_versions</code> \u6B77\u53F2\u689D\u6587\u5FEB\u7167\u8207 <code>law_article_change_events</code> \u8B8A\u66F4\u7D00\u9304\uFF0C\u8B93\u8CC7\u6599\u9801\u80FD\u5207\u63DB\u6B77\u53F2\u7248\u672C\u4E26\u67E5\u770B\u689D\u6587\u5DEE\u7570\u3002",rows:[["\u4F86\u6E90","PostgreSQL \u6CD5\u898F\u7248\u672C\uFF0C\u4EE5\u53CA <code>LAW_DATA_DIR/raw_parquet</code> \u5167\u5C0D\u61C9\u7684\u539F\u59CB\u6CD5\u898F Parquet \u5FEB\u7167\u3002"],["\u5339\u914D\u65B9\u5F0F","\u4EE5 raw Parquet manifest \u7684 <code>zip_sha256</code>\uFF0F<code>raw_json_sha256</code> \u5C0D\u61C9\u6CD5\u898F\u7248\u672C\uFF0C\u4E0D\u731C\u6E2C\u5167\u5BB9\u3002"],["\u7522\u751F\u5167\u5BB9","<code>article_key</code>\uFF08\u689D\u6587\u985E\u578B\uFF0B\u689D\u865F\uFF09\u3001<code>content_hash</code>\u3001\u689D\u6587\u5168\u6587\u8207\u751F\u6548\u65E5\uFF1B\u8207\u524D\u4E00\u7248\u672C\u6BD4\u8F03\u5F8C\u8A18\u9304 <code>added</code>\uFF0F<code>modified</code>\uFF0F<code>removed</code>\u3002"],["\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB","\u5206\u9801\u4E0A\u65B9\u7684\u552F\u8B80\u6AA2\u67E5\u6703\u8B80\u53D6 <code>law_article_versions</code> \u8207\u539F\u59CB Parquet\uFF0C\u5224\u65B7\u7248\u672C\u662F\u5426\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\uFF1B\u6AA2\u67E5\u672C\u8EAB\u4E0D\u6703\u4FEE\u6539\u8CC7\u6599\u5EAB\u3002"],["\u53EF\u5EFA\u7ACB","\u627E\u5230\u5C0D\u61C9\u539F\u59CB Parquet \u7684\u7248\u672C\uFF0C\u53EF\u76F4\u63A5\u57F7\u884C\u6B64\u6D41\u7A0B\u5EFA\u7ACB\u689D\u6587\u6B77\u53F2\u3002"],["\u7F3A\u539F\u59CB\u6A94","\u627E\u4E0D\u5230\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u6A19\u793A\u7121\u6CD5\u5EFA\u7ACB\uFF0C\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD\uFF1B\u6B64\u6D41\u7A0B\u6703\u8DF3\u904E\u4E26\u5217\u5728 <code>missing_versions</code>\u3002"],["\u6AA2\u67E5\u7D50\u679C","\u5E74\u4EFD\xD7\u6708\u4EFD\u8868\u986F\u793A\u5DF2\u5EFA\u7ACB\uFF0F\u672A\u5EFA\u7ACB\uFF0F\u90E8\u5206\u5EFA\u7ACB\uFF1B\u4E0B\u65B9\u5217\u51FA\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u7248\u672C\u65E5\u671F\u8207\u53EF\u5EFA\u7ACB\u72C0\u614B\u3002\u76EE\u524D\u72C0\u614B\u4EE5\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u5361\u7247\u5373\u6642\u986F\u793A\u3002"],["\u8DF3\u904E\u689D\u4EF6","\u5DF2\u6709\u689D\u6587\u5FEB\u7167\u7684\u7248\u672C\u6703\u8DF3\u904E\uFF1B\u627E\u4E0D\u5230\u53EF\u8B80\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u5217\u5165 <code>missing_versions</code>\uFF0C\u4E0D\u5EFA\u7ACB\u865B\u69CB\u689D\u6587\u3002"],["\u4E0D\u6703","\u4E0D\u4E0B\u8F09\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u4E0D\u89E3\u6790\u65B0 ZIP\u3001\u4E0D\u4FEE\u6539 <code>law_documents</code> \u6216\u76EE\u524D\u7248\u672C\u3001\u4E0D\u66F4\u65B0 Qdrant\uFF0FIndexedDB\u3002"],["\u8F38\u51FA\u6458\u8981","\u7248\u672C\u6578\u3001\u8DF3\u904E\u7248\u672C\u6578\u3001\u7F3A\u5C11\u5FEB\u7167\u7248\u672C\u3001\u5BEB\u5165\u689D\u6587\u6578\u8207\u689D\u6587\u8B8A\u66F4\u4E8B\u4EF6\u6578\u3002"],["\u91CD\u8DD1","\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u5DF2\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u4E0D\u6703\u91CD\u8907\u63D2\u5165\u3002"]],note:"\u9069\u5408\u5F9E\u820A\u7248 schema \u5347\u7D1A\u3001\u65E2\u6709\u6CD5\u898F\u7248\u672C\u7F3A\u5C11\u6B77\u53F2\u689D\u6587\uFF0C\u6216\u8CC7\u6599\u9801\u6B77\u53F2\u689D\u6587\u7248\u672C\u8207\u8B8A\u66F4\u7D00\u9304\u4E0D\u5B8C\u6574\u6642\u57F7\u884C\u3002\u57F7\u884C\u524D\u53EF\u5148\u7528\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u78BA\u8A8D\u54EA\u4E9B\u7248\u672C\u53EF\u5EFA\u7ACB\u3001\u54EA\u4E9B\u7F3A\u539F\u59CB\u6A94\u3002"})}function Pl(e={}){let t=e.courtCheck,s=!!e.courtCheckLoading,a=e.courtCheckError,r=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-court-check"${s?" disabled":""}>${u("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31"}</span></button>`;if(a)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${u("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${r}
      </div>
      <div class="processing-workflow-empty">${n(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${u("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${r}
      </div>
      <div class="processing-workflow-empty">${s?'<span class="spinner" aria-hidden="true"></span> \u6B63\u5728\u6AA2\u67E5\u5404\u6708\u4EFD\u6CD5\u9662\u540D\u7A31\u2026':"\u9032\u5165\u6B64\u5206\u9801\u5F8C\u6703\u81EA\u52D5\u6AA2\u67E5\uFF1B\u4E5F\u53EF\u6309\u300C\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u300D\u91CD\u65B0\u8B80\u53D6\u3002"}</div>
    </section>`;let i=Array.isArray(t.months)?t.months:[],o=t.summary||{},l=t.totals||{};if(!i.length)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${u("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${r}
      </div>
      <div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u6AA2\u67E5\u7684\u5224\u6C7A\u8CC7\u6599\u3002</div>
    </section>`;let d={green:"\u5DF2\u6AA2\u67E5",red:"\u672A\u6AA2\u67E5",gray:"\u9700\u6B63\u898F\u5316"},m=new Map(i.map($=>[String($.month),$])),w=[...new Set(i.map($=>$.year))].sort(($,g)=>g-$).map($=>{let g=Array.from({length:12},(h,y)=>{let S=y+1,N=`${$}${String(S).padStart(2,"0")}`,D=m.get(N);if(!D)return`<td class="judgment-month is-empty"><span>${S}</span></td>`;let B=d[D.status]?D.status:"red",Q=[`${$}-${String(S).padStart(2,"0")}`,d[B],`\u7E3D ${c(D.total)} \u7B46`,`\u5DF2\u6AA2\u67E5 ${c(D.checked)} \u7B46`,`\u672A\u6AA2\u67E5 ${c(D.unchecked)} \u7B46`,D.invalid?`\u7121\u6548\u503C ${c(D.invalid)} \u7B46`:"",`\u6709\u6548 ${nt(D.percent)}`].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month court-check-month is-${B}" title="${n(Q)}"><span>${S}</span></td>`}).join("");return`<tr><th scope="row">${n($)}</th>${g}</tr>`}).join("");return`<section class="report-card processing-card court-check-card">
    <div class="side-card-head">
      <span class="side-card-title">${u("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},($,g)=>`<th scope="col">${g+1}</th>`).join("")}</tr></thead>
          <tbody>${w}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u5168\u90E8\u5DF2\u6B63\u898F\u5316\uFF1B\u7D05\u8272\uFF1A\u5B8C\u5168\u672A\u6AA2\u67E5\uFF1B\u7070\u8272\uFF1A\u90E8\u5206\u672A\u6B63\u898F\u5316\u6216\u6709\u7121\u6548\u503C\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7B46\u6578\u8207\u6709\u6548\u6BD4\u4F8B\u3002</p>
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${n(ye(t.checked_at))} \xB7 \u6A19\u6E96\u6CD5\u9662\u540D\u7A31 ${c(t.canonical_count)} \u500B</div>
    </div>
  </section>`}function Il(e={}){let t=e.lawVersionCheck,s=!!e.lawVersionCheckLoading,a=e.lawVersionCheckError,r=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-law-version-check"${s?" disabled":""}>${u("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB"}</span></button>`;if(a)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${u("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${r}
      </div>
      <div class="processing-workflow-empty">${n(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${u("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${r}
      </div>
      <div class="processing-workflow-empty">${s?'<span class="spinner" aria-hidden="true"></span> \u6B63\u5728\u6AA2\u67E5\u7248\u672C\u8207\u6B77\u53F2\u689D\u6587\u2026':"\u9032\u5165\u6B64\u5206\u9801\u5F8C\u6703\u81EA\u52D5\u6AA2\u67E5\uFF1B\u4E5F\u53EF\u6309\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u91CD\u65B0\u8B80\u53D6\u3002"}</div>
    </section>`;let i=Array.isArray(t.months)?t.months:[],o=t.summary||{},l=t.totals||{};if(!i.length)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${u("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${r}
      </div>
      <div class="processing-workflow-empty">\u8CC7\u6599\u5EAB\u76EE\u524D\u6C92\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u8CC7\u6599\u3002</div>
    </section>`;let d={green:"\u5DF2\u5EFA\u7ACB",red:"\u672A\u5EFA\u7ACB",gray:"\u90E8\u5206\u5EFA\u7ACB"},m=new Map(i.map(J=>[String(J.month),J])),w=[...new Set(i.map(J=>J.year))].sort((J,R)=>R-J).map(J=>{let R=Array.from({length:12},(x,C)=>{let Z=C+1,ie=`${J}${String(Z).padStart(2,"0")}`,T=m.get(ie);if(!T)return`<td class="judgment-month is-empty"><span>${Z}</span></td>`;let U=d[T.status]?T.status:"red",Y=[`${J}-${String(Z).padStart(2,"0")}`,d[U],`\u7248\u672C ${c(T.version_count)}\uFF08\u6CD5\u898F ${c(T.law_versions)}\uFF0F\u547D\u4EE4 ${c(T.order_versions)}\uFF09`,`\u5DF2\u5EFA\u7ACB ${c(T.backfilled_count)}`,`\u672A\u5EFA\u7ACB ${c(T.missing_count)}`,`\u9700\u5EFA\u7ACB ${c(T.needs_backfill_count)}\uFF08\u53EF\u5EFA\u7ACB ${c(T.backfillable_count)}\uFF0F\u7F3A\u539F\u59CB\u6A94 ${c(T.blocked_count)}\uFF09`,`\u689D\u6587\u5217 ${c(T.article_rows)} / \u9810\u671F ${c(T.article_count)}`,T.current?"\u76EE\u524D\u7248\u672C":"",T.versions?.length?`\u7248\u672C ${T.versions.map(pe=>`#${pe.version_id}`).join("\u3001")}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month law-version-month is-${U}${T.current?" is-current":""}" title="${n(Y)}"><span>${Z}</span></td>`}).join("");return`<tr><th scope="row">${n(J)}</th>${R}</tr>`}).join(""),$={law:"\u6CD5\u898F",order:"\u547D\u4EE4"},g=i.flatMap(J=>(J.versions||[]).filter(R=>R.needs_backfill).map(R=>({...R,month:J.month}))).sort((J,R)=>R.version_id-J.version_id),h=g.slice(0,20),y=h.map(J=>{let R=J.backfillable?"badge-info":J.blocked?"badge-danger":"badge-neutral",x=J.backfillable?"\u53EF\u5EFA\u7ACB":J.blocked?"\u7F3A\u539F\u59CB\u6A94":"\u5F85\u6AA2\u67E5";return`<div class="law-backfill-needed-row">
        <strong class="mono">#${J.version_id}</strong>
        <span class="badge ${R}">${x}</span>
        <span>${n($[J.source_type]||J.source_type||"\u2014")}</span>
        <span class="mono">${n(J.update_date||J.month||"\u2014")}</span>
        <span class="law-backfill-needed-reason">${n(J.reason||"\u2014")}</span>
      </div>`}).join(""),S=g.length?`<div class="law-backfill-needed">
        <div class="law-backfill-needed-head">\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C <span class="badge badge-warn">${c(g.length)}</span></div>
        <div class="law-backfill-needed-list">${y}</div>
        ${g.length>h.length?`<div class="law-backfill-needed-more">\u53E6\u6709 ${c(g.length-h.length)} \u500B\u7248\u672C\u672A\u5217\u51FA</div>`:""}
      </div>`:'<div class="law-backfill-needed is-clear">\u76EE\u524D\u6C92\u6709\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3002</div>',N=Number(l.needs_backfill_versions)||0,D=Number(l.backfillable_versions)||0,B=Number(l.blocked_versions)||0,Q=Number(l.backfilled_versions)||0,ne=Number(l.versions)||0,te=N<=0?"ok":B>0?"danger":"warn",$e=N<=0?"\u4E0D\u9700\u8981\u5EFA\u7ACB":"\u9700\u8981\u5EFA\u7ACB",qe=N>0?`\u9700\u8981\u5EFA\u7ACB ${c(N)} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF1A\u53EF\u5EFA\u7ACB ${c(D)}\u3001\u7F3A\u539F\u59CB\u6A94 ${c(B)}\u3002\u5DF2\u6709\u6B77\u53F2\u689D\u6587 ${c(Q)} \u500B\u7248\u672C${B>0?"\uFF1B\u7F3A\u539F\u59CB\u6A94\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD":""}\u3002`:`\u76EE\u524D ${c(ne)} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`;return`<section class="report-card processing-card law-version-card">
    <div class="side-card-head">
      <span class="side-card-title">${u("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
      ${r}
    </div>
    <div class="law-version-check-status is-${te}" role="status" aria-live="polite">
      <span class="badge badge-${te}">${$e}</span>
      <span>${n(qe)}</span>
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(J,R)=>`<th scope="col">${R+1}</th>`).join("")}</tr></thead>
          <tbody>${w}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u8A72\u6708\u4EFD\u6240\u6709\u7248\u672C\u90FD\u6709\u6B77\u53F2\u689D\u6587\uFF1B\u7D05\u8272\uFF1A\u5B8C\u5168\u672A\u5EFA\u7ACB\uFF1B\u7070\u8272\uFF1A\u90E8\u5206\u7248\u672C\u5DF2\u5EFA\u7ACB\uFF1B\u5916\u6846\uFF1A\u76EE\u524D\u7248\u672C\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u7248\u672C\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u6578\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u6578\u8207\u689D\u6587\u5217\u3002</p>
      ${S}
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${n(ye(t.checked_at))}</div>
    </div>
  </section>`}function qr(){return`<div class="processing-ollama-loading">
    <span class="spinner" aria-hidden="true"></span>
    <span>\u6B63\u5728\u6AA2\u67E5 Ollama \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span>
  </div>`}function Ol(e,t,s){let a=Array.isArray(e?.hosts)?e.hosts:[];if(s&&!a.length)return`${_e({tone:"danger",title:"Ollama \u4E3B\u6A5F\u8B80\u53D6\u5931\u6557",text:n(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
    <div class="processing-ollama-empty">
      <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh-ollama">
        ${u("refresh",13)}<span>\u91CD\u65B0\u6AA2\u67E5</span>
      </button>
    </div>`;if(!a.length)return t?qr():'<div class="processing-ollama-empty">\u5C1A\u672A\u8A2D\u5B9A Ollama \u4E3B\u6A5F\uFF1B\u8ACB\u5230\u300C\u7CFB\u7D71\u72C0\u614B \u2192 Model Provider\u300D\u65B0\u589E\u4E26\u9023\u63A5\u6A21\u578B\u3002</div>';let r=a.map((o,l)=>{let d=o.status==="operational",m=Array.isArray(o.models)?o.models:[],v=m.length?m.map($=>`<span class="processing-ollama-model ${d?"is-online":"is-offline"}">${n($.name||"")}</span>`).join(""):'<span class="processing-ollama-model is-offline">\u6C92\u6709\u53EF\u7528\u6A21\u578B</span>',w=[o.embedding_model?`<span class="processing-ollama-role ${d?"is-online":"is-offline"}">\u5D4C\u5165 \xB7 ${n(o.embedding_model)}</span>`:'<span class="processing-ollama-role is-offline">\u672A\u8A2D\u5B9A\u5D4C\u5165\u6A21\u578B</span>',o.chat_model?`<span class="processing-ollama-role is-offline">\u804A\u5929 \xB7 ${n(o.chat_model)}</span>`:""].filter(Boolean).join("");return`<article class="processing-ollama-host ${d?"is-online":"is-offline"}" data-ollama-host data-host-id="${Number(o.id)}">
        <span class="processing-ollama-handle" aria-hidden="true">${u("grid",14)}</span>
        <span class="processing-ollama-rank">${l+1}</span>
        <div class="processing-ollama-main">
          <div class="processing-ollama-title">
            <strong>${n(o.name||o.base_url||`\u4E3B\u6A5F #${o.id}`)}</strong>
            <span class="processing-ollama-status">${d?"\u53EF\u7528":"\u7121\u6CD5\u9023\u7DDA"}</span>
          </div>
          <span class="processing-ollama-url mono">${n(o.base_url||"\u2014")}</span>
          <div class="processing-ollama-models">${v}</div>
          <div class="processing-ollama-meta">${w}${o.detail?`<span class="processing-ollama-detail">${n(o.detail)}</span>`:""}</div>
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
    <p class="processing-ollama-hint">\u62D6\u79FB\u6216\u4F7F\u7528\u7BAD\u982D\u8ABF\u6574 embedding \u512A\u5148\u9806\u5E8F\uFF1B\u76EE\u524D\u4E3B\u6A5F\u7121\u6CD5\u4F7F\u7528\u6642\uFF0C\u6703\u4F9D\u5E8F\u81EA\u52D5\u6539\u7528\u4E0B\u4E00\u53F0\uFF08\u5404\u53F0\u9700\u5177\u5099\u76F8\u540C\u7684 embedding \u6A21\u578B\uFF09\uFF0C\u76F4\u5230\u6709\u4E3B\u6A5F\u56DE\u50B3\u5411\u91CF\u3002</p>`}function Bl(e,t={}){let s=e.active_run||null,a=s||e.last_run||null,r=!!s,i=!!e.can_run&&!r,o=e.id==="full_update",l=Array.isArray(e.command)?e.command.join(" "):"";return`<div class="processing-workflow-panel">
    ${_e({tone:"info",title:e.label,text:e.description||""})}
    ${e.update_available?`<div class="processing-update-notice" role="status">
            ${u("refresh",13)}
            <span>${n(e.update_status&&e.update_status.message||"\u7DDA\u4E0A\u5075\u6E2C\u5230\u65B0\u7248")}</span>
            <span class="badge badge-warn">\u66F4\u65B0</span>
          </div>`:""}
    ${e.id==="normalize_courts"?Pl(t):""}
    ${e.id==="backfill_law_articles"?Il(t):""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${u(wr[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
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
          ${u("play",14)}<span>${r?"\u57F7\u884C\u4E2D":o?"\u57F7\u884C\u8CC7\u6599\u66F4\u65B0":"\u57F7\u884C\u6B64\u6D41\u7A0B"}</span>
        </button>
        ${["law_download","order_download","judgment_download"].includes(e.id)?`<button class="btn btn-secondary btn-sm" type="button"
                data-processing-action="check-updates"
                data-workflow-id="${n(e.id)}">
                ${u("refresh",14)}<span>\u6AA2\u67E5\u66F4\u65B0</span>
              </button>`:""}
        ${s?`<button class="btn btn-secondary btn-sm processing-stop" type="button"
                data-processing-action="stop">${u("x",14)}<span>\u505C\u6B62</span></button>`:""}
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
      ${Pa.has(e.id)?`<div class="processing-ollama-block">
              <div class="processing-ollama-head">
                <span class="side-card-title">${u("server",14)}Ollama \u4E3B\u6A5F\uFF0F\u6A21\u578B</span>
                <button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-ollama">
                  ${u("refresh",13)}<span>\u91CD\u65B0\u6AA2\u67E5</span>
                </button>
              </div>
              <div class="processing-ollama-subtitle">\u4F9D\u512A\u5148\u9806\u5E8F\u81EA\u52D5\u9078\u7528 embedding \u4E3B\u6A5F\uFF1B\u7B2C\u4E00\u53F0\u540C\u6642\u8A2D\u70BA\u76EE\u524D\u4E3B\u6A5F\uFF0C\u7121\u6CD5\u9023\u7DDA\u7684\u4E3B\u6A5F\u6703\u986F\u793A\u70BA\u7070\u8272\u3002</div>
              <div data-processing-ollama>${qr()}</div>
            </div>`:""}
      <div class="side-card-foot">
        ${o?"\u6703\u4F9D\u5E8F\u57F7\u884C\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u8207\u53EF\u9078\u7684 Qdrant \u7D22\u5F15\u3002":"\u57F7\u884C\u7D50\u679C\u6703\u5BEB\u5165\u5171\u7528\u8655\u7406\u72C0\u614B\u6A94\uFF0C\u53EF\u5F9E\u8655\u7406\u7E3D\u89BD\u67E5\u770B\u3002"}
      </div>
    </section>
    ${ql(e)}
    ${e.id==="judgment_parquet"?Nl():""}
    ${e.id==="normalize_courts"?Cl():""}
    ${e.id==="backfill_law_articles"?Rl():""}
    ${e.id==="judgment_import"?jl(e):""}
    ${e.id==="index_versions"?Tl(e):""}
    ${e.id==="index_versions"?El(t):""}
    ${e.id==="judgment_download"?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${u("calendar",14)}\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B</span>
              <button class="btn btn-ghost btn-sm" type="button" title="\u91CD\u65B0\u6383\u63CF raw_rar \u76EE\u9304\u8207\u6708\u4EFD\u72C0\u614B" data-processing-action="refresh-judgment-months">${u("refresh",13)}<span>\u91CD\u65B0\u6574\u7406</span></button>
            </div>
            <div data-judgment-months-slot>${Ba()}</div>
          </section>`:""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${u("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${ze(a?.status||"idle")}
      </div>
      ${fl(a)}
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${u("history",14)}\u57F7\u884C\u7D00\u9304</span>
        <span class="badge badge-neutral">\u6700\u8FD1 ${c((e.recent_runs||[]).length)} \u7B46</span>
      </div>
      ${kl(e.recent_runs)}
    </section>
    ${["law_download","order_download","judgment_download"].includes(e.id)?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${u("search",14)}\u7248\u672C\u6AA2\u67E5\u7D00\u9304</span>
              <span class="badge badge-neutral">\u6700\u8FD1 ${c((e.update_history||[]).length)} \u7B46</span>
            </div>
            ${Sl(e)}
          </section>`:""}
  </div>`}function vr(e,t,s={}){if(t==="overview")return fr(e);let r=(Array.isArray(e.workflows)?e.workflows:[]).find(i=>i.id===t);return r?Bl(r,s):fr(e)}async function Dl(e){e.innerHTML=`<section class="page processing-page">
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
          ${u("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
        <button class="btn btn-secondary btn-sm processing-stop" type="button" data-processing-action="stop" id="processing-stop" hidden>
          ${u("x",14)}<span>\u505C\u6B62\u66F4\u65B0</span>
        </button>
        <button class="btn btn-primary btn-sm" type="button" data-processing-action="update" id="processing-update">
          ${u("download",14)}<span data-update-label>\u8CC7\u6599\u66F4\u65B0</span>
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
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-workflows"),r=e.querySelector("#processing-update"),i=e.querySelector("#processing-stop"),o=e.querySelector("#processing-refresh"),l=e.querySelector("#processing-index-toggle"),d=document.createElement("div");d.className="processing-stage-tooltip",d.hidden=!0,t.appendChild(d);let m=!1,v=!1,w=!1,$=null,g="",h="",y="overview",S=null,N=!1,D=null,B=null,Q=!1,ne=null,te=0,$e=null,qe=!1,J=null,R=0,x=null,C=!1,Z=null,ie=0,T=null,U=!1,Y=null,pe=0,se=0,ee=!1,fe=null,ke=!1,Ae="",le=null,ue=()=>({storage:B,loading:Q,error:ne,courtCheck:$e,courtCheckLoading:qe,courtCheckError:J,lawVersionCheck:x,lawVersionCheckLoading:C,lawVersionCheckError:Z}),we=()=>{if(y!=="judgment_download")return;let p=s.querySelector(".processing-workflow-panel");if(!p)return;p.querySelectorAll(".judgment-month.is-active").forEach(Ce=>{Ce.classList.remove("is-active"),Ce.removeAttribute("aria-current")});let b=p.querySelector("[data-judgment-progress]");if(!b)return;let k=S?.progress,G=!!($?.workflows||[]).find(Ce=>Ce.id==="judgment_download")?.active_run;if((!k||k.active===!1)&&!G){b.hidden=!0,b.classList.remove("is-indeterminate");return}if(b.hidden=!1,!k||k.active===!1){let Ce=b.querySelector("[data-judgment-progress-phase]");Ce&&(Ce.textContent="\u6E96\u5099\u4E2D");let gt=b.querySelector("[data-judgment-progress-month]");gt&&(gt.textContent="\u2014");let _t=b.querySelector("[data-judgment-progress-filename]");_t&&(_t.textContent="\u7B49\u5F85\u4E0B\u8F09\u7A0B\u5E8F\u56DE\u5831\u9032\u5EA6\u2026",_t.title=""),b.classList.add("is-indeterminate");let us=b.querySelector("[data-judgment-progress-bar]");us&&(us.style.width="");let es=b.querySelector("[data-judgment-progress-percent]");es&&(es.textContent="\u2014");let ts=b.querySelector("[data-judgment-progress-size]");ts&&(ts.textContent="\u2014");let qs=b.querySelector("[data-judgment-progress-note]");qs&&(qs.textContent="\u5DF2\u555F\u52D5\uFF0C\u7B49\u5F85\u9032\u5EA6\u56DE\u5831");return}let ae={preparing:"\u6E96\u5099\u4E2D",scanning:"\u6383\u63CF\u4E2D",checking:"\u6AA2\u67E5\u4E2D",downloading:"\u4E0B\u8F09\u4E2D",saving:"\u5132\u5B58\u4E2D",finalizing:"\u6574\u7406\u4E2D"}[k.phase]||"\u8655\u7406\u4E2D",ve=b.querySelector("[data-judgment-progress-phase]");ve&&(ve.textContent=ae);let Me=k.month||"",Ne=b.querySelector("[data-judgment-progress-month]");Ne&&(Ne.textContent=Me||"\u2014");let qt=k.filename||"",lt=b.querySelector("[data-judgment-progress-filename]");if(lt&&(lt.textContent=qt||"\u2014",lt.title=qt),Me){let Ce=p.querySelector(`[data-judgment-month-key="${Me}"]`);Ce&&(Ce.classList.add("is-active"),Ce.setAttribute("aria-current","true"))}let Ft=Number(k.bytes_written),Xt=Number(k.total_bytes),Zt=Number.isFinite(Xt)&&Xt>0,Ht=null,At=k.percent;At!=null&&At!==""&&Number.isFinite(Number(At))?Ht=Number(At):Zt&&Number.isFinite(Ft)&&(Ht=Ft/Xt*100);let et=Ht===null;b.classList.toggle("is-indeterminate",et);let ct=b.querySelector("[data-judgment-progress-bar]");ct&&(ct.style.width=et?"":`${Math.min(100,Math.max(0,Ht)).toFixed(1)}%`);let ds=b.querySelector("[data-judgment-progress-percent]");if(ds){let Ce=et?null:Math.min(100,Math.max(0,Ht));ds.textContent=Ce===null?"\u2014":`${Ce.toFixed(Ce>=10?0:1)}%`}let Ss=b.querySelector("[data-judgment-progress-size]");if(Ss){let Ce=Number.isFinite(Ft)&&Ft>0?be(Ft):"\u2014";Ss.textContent=Zt?`${Ce} / ${be(Xt)}`:Ce}let xs=b.querySelector("[data-judgment-progress-note]");if(xs){let Ce=[],gt=Number(k.candidate_index),_t=Number(k.candidate_total);Number.isFinite(gt)&&gt>0&&Number.isFinite(_t)&&_t>0&&Ce.push(`\u7B2C ${c(gt)} / ${c(_t)} \u500B\u6708`),k.fileset_id&&Ce.push(`fileset ${k.fileset_id}`),k.message&&k.phase!=="downloading"&&Ce.push(String(k.message)),xs.textContent=Ce.join(" \xB7 ")}},ge=()=>{if(y!=="judgment_download")return;let p=s.querySelector("[data-judgment-months-slot]");if(p){let b=Array.isArray(S?.months)?S.months:[];D&&!S?(p.innerHTML=_e({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:n(D)}),delete p.dataset.judgmentMonthCount):S?p.dataset.judgmentMonthCount!==String(b.length)?(p.innerHTML=wl(S),p.dataset.judgmentMonthCount=String(b.length)):_l(p,S):(p.querySelector(".judgment-months-loading")||(p.innerHTML=Ba()),delete p.dataset.judgmentMonthCount)}we()},Fe=()=>{let p=Array.isArray(T?.hosts)?T.hosts:[];return JSON.stringify({loading:!p.length&&U,error:!p.length&&Y?Y.message||String(Y):"",active:T?.active_host_id??null,hosts:p.map(b=>({id:b.id,name:b.name,url:b.base_url,status:b.status,detail:b.detail,embedding:b.embedding_model,chat:b.chat_model,models:(b.models||[]).map(k=>k.name)}))})},Ie=()=>{let p=s.querySelector("[data-processing-ollama]");if(!p||se)return;let b=Fe();p.dataset.ollamaSignature!==b&&(p.dataset.ollamaSignature=b,p.innerHTML=Ol(T,U,T?null:Y))},Be=async({quiet:p=!1,button:b=null}={})=>{if(!(m||U)){U=!0,Y=null,T||Ie(),b&&me(b,!0,"\u6AA2\u67E5\u4E2D\u2026");try{let k=await H.ollamaHosts();if(m)return;T=k}catch(k){if(m)return;Y=k,p||L(k.message||"\u7121\u6CD5\u6AA2\u67E5 Ollama \u4E3B\u6A5F\u3002","danger",6e3)}finally{m||(U=!1,pe=Date.now(),b&&me(b,!1),Ie())}}},M=async p=>{if(ke)return;let b=(T?.hosts||[]).map(W=>Number(W.id)),k=p.map(W=>Number(W));if(!k.length||k.length!==b.length||k.every((W,ae)=>W===b[ae])){Ie();return}ke=!0;let j=new Map((T?.hosts||[]).map(W=>[Number(W.id),W])),G=k.map(W=>j.get(W)).filter(Boolean);if(T&&G.length===b.length){T={...T,hosts:G,active_host_id:k[0]};let W=s.querySelector("[data-processing-ollama]");W&&(W.dataset.ollamaSignature=""),Ie()}try{await H.reorderOllamaHosts(k),L("\u5DF2\u66F4\u65B0 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","ok",3500)}catch(W){L(W.message||"\u7121\u6CD5\u66F4\u65B0 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","danger",6e3),pe=0,await Be({quiet:!0})}finally{ke=!1}},O=()=>{let p=s.querySelector("[data-processing-ollama]");p&&(p.dataset.ollamaSignature=""),Ie()},I=()=>{let p=fe;if(!p)return;if(s.querySelector(`[data-ollama-host][data-host-id="${p.hostId}"]`)?.classList.remove("is-dragging"),p.captureTarget?.hasPointerCapture?.(p.pointerId))try{p.captureTarget.releasePointerCapture(p.pointerId)}catch{}document.documentElement.classList.remove("processing-ollama-dragging"),window.removeEventListener("pointermove",z),window.removeEventListener("pointerup",ce),window.removeEventListener("pointercancel",V),fe=null,se=0},z=p=>{let b=fe;if(!b||p.pointerId!==b.pointerId)return;if(!b.dragging){if(Math.hypot(p.clientX-b.startX,p.clientY-b.startY)<5)return;b.dragging=!0,se=b.hostId,ee=!1,s.querySelector(`[data-ollama-host][data-host-id="${b.hostId}"]`)?.classList.add("is-dragging"),document.documentElement.classList.add("processing-ollama-dragging")}p.preventDefault();let k=64;p.clientY<k?window.scrollBy(0,-12):p.clientY>window.innerHeight-k&&window.scrollBy(0,12);let j=s.querySelector("[data-ollama-list]"),G=document.elementFromPoint(p.clientX,p.clientY)?.closest?.("[data-ollama-host]");if(!j||!G||!j.contains(G))return;let W=j.querySelector(`[data-ollama-host][data-host-id="${b.hostId}"]`);if(!W||W===G)return;let ae=G.getBoundingClientRect(),ve=p.clientY>ae.top+ae.height/2;j.insertBefore(W,ve?G.nextSibling:G),ee=!0},ce=p=>{let b=fe;if(!b||p.pointerId!==b.pointerId)return;let k=b.dragging,j=ee,G=s.querySelector("[data-ollama-list]"),W=k&&G?[...G.querySelectorAll("[data-ollama-host]")].map(ae=>Number(ae.dataset.hostId)):[];I(),k&&j&&W.length&&M(W)},V=()=>{let p=!!fe?.dragging;I(),p&&O()},xe=p=>{if(p.button!==0||p.pointerType==="mouse"&&p.buttons!==1||ke||fe)return;let b=p.target.closest("[data-ollama-host]");if(!b||!s.contains(b)||p.target.closest("button")||p.pointerType==="touch"&&!p.target.closest(".processing-ollama-handle"))return;let k=Number(b.dataset.hostId)||0;if(k){p.preventDefault(),se=k,fe={hostId:k,pointerId:p.pointerId,startX:p.clientX,startY:p.clientY,dragging:!1,captureTarget:b};try{b.setPointerCapture(p.pointerId)}catch{}window.addEventListener("pointermove",z,{passive:!1}),window.addEventListener("pointerup",ce),window.addEventListener("pointercancel",V)}},F=async({quiet:p=!1}={})=>{if(!N){N=!0,!S&&y==="judgment_download"&&ge();try{S=await H.judgmentDownloadStatus(),D=null}catch(b){D=b.message||"\u8B80\u53D6\u6708\u4EFD\u72C0\u614B\u5931\u6557\u3002",p||L(D,"danger",7e3)}finally{N=!1,y==="judgment_download"&&ge()}}},oe=async({quiet:p=!0,force:b=!1}={})=>{if(!Q&&!(!b&&B&&Date.now()-te<3e4)){Q=!0;try{B=await H.systemUsage(),ne=null,te=Date.now()}catch(k){ne=k.message||"\u7121\u6CD5\u53D6\u5F97 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002",p||L(ne,"danger",7e3)}finally{Q=!1}}},Te=async({quiet:p=!0,force:b=!1}={})=>{if(!qe&&!(!b&&$e&&Date.now()-R<6e4)){qe=!0;try{$e=await H.checkCourts(),J=null,R=Date.now()}catch(k){J=k.message||"\u7121\u6CD5\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u3002",p||L(J,"danger",7e3)}finally{qe=!1}}},Oe=async({quiet:p=!0,force:b=!1,button:k=null}={})=>{if(!C&&!(!b&&x&&Date.now()-ie<6e4)){C=!0,k&&me(k,!0,"\u6AA2\u67E5\u4E2D\u2026");try{if(x=await H.checkLawVersions(),Z=null,ie=Date.now(),!p){let j=x.totals||{},G=Number(j.needs_backfill_versions)||0,W=Number(j.backfillable_versions)||0,ae=Number(j.blocked_versions)||0;G>0?L(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u9700\u8981\u5EFA\u7ACB ${G} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF08\u53EF\u5EFA\u7ACB ${W}\u3001\u7F3A\u539F\u59CB\u6A94 ${ae}\uFF09\u3002`,ae>0?"danger":"warn",7e3):L(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D ${Number(j.versions)||0} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`,"ok",5e3)}}catch(j){Z=j.message||"\u7121\u6CD5\u6AA2\u67E5\u689D\u6587\u6B77\u53F2\u72C0\u614B\u3002",p||L(Z,"danger",7e3)}finally{C=!1,k&&me(k,!1)}}},It=p=>Array.from(s.querySelectorAll("[data-stage-key]")).find(b=>b.dataset.stageKey===p)||null,Pe=()=>{Ae&&(Ae="",d.hidden=!0,s.querySelectorAll("[data-workflow-progress]").forEach(p=>{p.classList.remove("is-stage-hovering")}),s.querySelectorAll("[data-stage-key]").forEach(p=>{p.classList.remove("is-stage-hovered")}))},Ot=p=>{let b=p.dataset.stageKey||"";if(!b)return;Ae=b;let k=p.closest("[data-workflow-progress]");s.querySelectorAll("[data-workflow-progress]").forEach(lt=>{lt.classList.toggle("is-stage-hovering",lt===k)}),s.querySelectorAll("[data-stage-key]").forEach(lt=>{lt.classList.toggle("is-stage-hovered",lt.dataset.stageKey===b)});let j=p.dataset.stageStatusKey||"idle",G=p.dataset.stageStatus||Vt(j).label,W=p.dataset.stageColor||"var(--accent)";d.innerHTML=`<div class="processing-stage-tooltip-head">
      <span class="processing-stage-tooltip-swatch" style="background:${n(W)}"></span>
      <strong>${n(p.dataset.stageLabel||b)}</strong>
      ${ze(j,G)}
    </div>
    <div class="processing-stage-tooltip-meta">
      <span>\u968E\u6BB5\u9032\u5EA6 <strong>${n(p.dataset.stagePercent||"\u2014")}</strong></span>
      <span>\u6574\u9AD4\u5360\u6BD4 <strong>${n(p.dataset.stageContribution||"\u2014")}</strong></span>
      <span class="mono">${n(p.dataset.stageDuration||"\u2014")}</span>
    </div>
    <div class="processing-stage-tooltip-counts">${n(p.dataset.stageCounts||"\u2014")}</div>
    ${p.dataset.stageMessage?`<div class="processing-stage-tooltip-message">${n(p.dataset.stageMessage)}</div>`:""}`,d.hidden=!1;let ae=Math.min(300,Math.max(220,window.innerWidth-24));d.style.width=`${ae}px`;let ve=p.getBoundingClientRect(),Me=Math.min(window.innerWidth-ae-12,Math.max(12,ve.left)),Ne=ve.top-d.offsetHeight-10,qt=Ne>=12?Ne:Math.min(window.innerHeight-d.offsetHeight-12,ve.bottom+10);d.style.left=`${Me}px`,d.style.top=`${Math.max(12,qt)}px`},Ue=p=>{let b=p.target.closest("[data-stage-key]");!b||!s.contains(b)||b.contains(p.relatedTarget)||Ot(b)},Kt=p=>{let b=p.target.closest("[data-stage-key]");if(!b||!s.contains(b)||b.contains(p.relatedTarget))return;let k=p.relatedTarget?.closest?.("[data-stage-key]");k&&k.dataset.stageKey===b.dataset.stageKey||Pe()},ot=p=>{let b=p.capabilities||{},k=!!(l&&l.checked),j=k?b.can_start_update_with_index!==!1:b.can_start_update!==!1,G=k&&b.index_blocked_reason||b.start_blocked_reason;if(!w){r.disabled=!j,r.title=G||"\u6AA2\u67E5\u7DDA\u4E0A\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0C\u4E26\u8655\u7406\u672A\u532F\u5165\u7684\u5224\u6C7A\u58D3\u7E2E\u6A94\u3002";let W=r.querySelector("[data-update-label]");W&&(W.textContent=j?"\u8CC7\u6599\u66F4\u65B0":b.active_update_id?"\u66F4\u65B0\u57F7\u884C\u4E2D":"\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D"),i.hidden=!b.can_stop_update,l&&(l.disabled=b.can_start_update===!1)}},Ze=async({silent:p=!1}={})=>{if(!(m||v)){v=!0,p||me(o,!0,"\u66F4\u65B0\u4E2D\u2026");try{let b=await H.processing();if(m)return;$=b;let k=br(b,y);k!==h&&(a.innerHTML=k,h=k);let j=vr(b,y,ue());if(j!==g&&(s.innerHTML=j,g=j),ge(),Ie(),Pa.has(y)&&!U&&Date.now()-pe>=lr&&Be({quiet:!0}),Ae){let W=It(Ae);W?Ot(W):Pe()}let G=s.querySelector("[data-processing-updated-at]");if(G){let W=ye(b.generated_at);G.textContent!==W&&(G.textContent=W)}ot(b),y==="judgment_download"&&F({quiet:!0}),y==="index_versions"&&oe({quiet:!0}),y==="normalize_courts"&&Te({quiet:!0}),y==="backfill_law_articles"&&Oe({quiet:!0})}catch(b){if(m)return;let k=ml(b.message,$);k!==g&&(s.innerHTML=k,g=k),p||L(b.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{v=!1,p||me(o,!1)}}},mt=async p=>{if(!w){w=!0,me(p,!0,"\u555F\u52D5\u4E2D\u2026");try{let b=!!(l&&l.checked),k=await H.startProcessingUpdate(b);L(`\u5DF2\u555F\u52D5\u8CC7\u6599\u66F4\u65B0${b?"\uFF0C\u5B8C\u6210\u5F8C\u63A5\u7E8C Qdrant \u7D22\u5F15":""}\u3002`,"ok",6e3),k&&k.run_id&&console.info("processing update started",k),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await Ze({silent:!0})}catch(b){L(b.message||"\u7121\u6CD5\u555F\u52D5\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{w=!1,me(p,!1),$&&ot($)}}},Bt=async(p,b="")=>{if(w)return;w=!0,me(p,!0,"\u6AA2\u67E5\u4E2D\u2026");let k=ur[b]||"";try{let j=await H.checkUpdates(k?[k]:[]);if(j&&j.checking)L("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u8ACB\u7A0D\u5F8C\u91CD\u65B0\u6574\u7406\u3002","info",6e3);else if(k){let G=(j.sources||{})[k]||{},W=pr[b]||"\u8CC7\u6599";G.status==="error"?L(`${W}\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF1A${G.message||"\u7121\u6CD5\u53D6\u5F97\u7DDA\u4E0A\u7248\u672C"}`,"danger",7e3):L(G.update_available?`${W}\u7DDA\u4E0A\u5DF2\u6709\u66F4\u65B0\u7248\u672C\u3002`:`${W}\u7DDA\u4E0A\u5DF2\u662F\u6700\u65B0\u7248\u672C\u3002`,G.update_available?"warn":"ok",6e3)}else{let G=Number(j.update_count)||0;L(G>0?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${G} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",G>0?"warn":"ok",6e3)}window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await Ze({silent:!0})}catch(j){L(j.message||"\u66F4\u65B0\u6AA2\u67E5\u5931\u6557\u3002","danger",7e3)}finally{w=!1,me(p,!1),$&&ot($)}},Dt=async(p,b)=>{let k=ur[b]||"";if(!k)return!0;me(p,!0,"\u6AA2\u67E5\u7248\u672C\u2026");let j=null;try{j=await H.checkUpdates([k])}catch(W){return L(`\u7121\u6CD5\u5B8C\u6210\u7248\u672C\u6AA2\u67E5\uFF08${W.message||"\u7DB2\u8DEF\u932F\u8AA4"}\uFF09\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002`,"warn",7e3),!0}finally{me(p,!1)}if(!j||j.checking)return j&&j.checking&&L("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","info",6e3),!0;let G=(j.sources||{})[k];if(!G)return!0;if(window.dispatchEvent(new CustomEvent("judgment:updates-changed")),G.status==="up_to_date"&&!G.update_available){let W=pr[b]||"\u8CC7\u6599",ae=G.checked_at?`\uFF08${ye(G.checked_at)} \u6AA2\u67E5\uFF09`:"",ve=Vo[b]||"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u55CE\uFF1F";return window.confirm(`${W}\u7DDA\u4E0A\u6AA2\u67E5\u70BA\u6700\u65B0\u7248\u672C${ae}\u3002

${ve}`)}return G.status==="error"&&L("\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","warn",6e3),!0},xt=async(p,b)=>{if(!w){w=!0;try{if(!await Dt(p,b)){await Ze({silent:!0});return}me(p,!0,"\u555F\u52D5\u4E2D\u2026");let j=await H.startProcessingWorkflow(b);L("\u5DF2\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","ok",6e3),j&&j.run_id&&console.info("processing workflow started",j),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await Ze({silent:!0})}catch(k){L(k.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{w=!1,me(p,!1),$&&ot($)}}},Yt=async p=>{if(!w){w=!0,me(p,!0,"\u505C\u6B62\u4E2D\u2026");try{let b=await H.stopProcessingUpdate();L(b.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3),await Ze({silent:!0})}catch(b){L(b.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{w=!1,me(p,!1),$&&ot($)}}},_=p=>{let b=p.target.closest("[data-processing-action]");if(!b||b.disabled)return;let k=b.dataset.processingAction;if(k==="refresh")Ze({silent:!1});else if(k==="refresh-judgment-months")F({quiet:!1});else if(k==="refresh-index-storage")oe({quiet:!1,force:!0});else if(k==="refresh-court-check")Te({quiet:!1,force:!0});else if(k==="refresh-law-version-check")Oe({quiet:!1,force:!0,button:b});else if(k==="refresh-ollama")Be({quiet:!1,button:b});else if(k==="move-ollama-host"){let j=T?.hosts||[],G=j.findIndex(Me=>Number(Me.id)===Number(b.dataset.hostId)),W=b.dataset.direction,ae=W==="up"?G-1:W==="down"?G+1:-1;if(G<0||ae<0||ae>=j.length)return;let ve=j.map(Me=>Number(Me.id));[ve[G],ve[ae]]=[ve[ae],ve[G]],M(ve)}else if(k==="update")mt(b);else if(k==="check-updates")Bt(b,b.dataset.workflowId||"");else if(k==="run-workflow"){let j=b.dataset.workflowId||"";j==="full_update"?mt(b):xt(b,j)}else k==="stop"&&Yt(b)},q=p=>{p.target===l&&$&&ot($)},A=p=>{let b=p.target.closest("[data-processing-workflow]");if(b){if(y=b.dataset.processingWorkflow||"overview",$){let k=br($,y);a.innerHTML=k,h=k;let j=vr($,y,ue());if(s.innerHTML=j,g=j,ge(),Ie(),Pa.has(y)&&!U&&Date.now()-pe>=lr&&Be({quiet:!0}),Ae){let G=It(Ae);G?Ot(G):Pe()}}y==="judgment_download"&&F({quiet:!0}),y==="index_versions"&&oe({quiet:!0}),y==="normalize_courts"&&Te({quiet:!0}),y==="backfill_law_articles"&&Oe({quiet:!0})}};return t.addEventListener("click",_),a.addEventListener("click",A),s.addEventListener("pointerover",Ue),s.addEventListener("pointerout",Kt),s.addEventListener("pointerdown",xe),window.addEventListener("scroll",Pe,{capture:!0,passive:!0}),l&&l.addEventListener("change",q),await Ze({silent:!1}),le=window.setInterval(()=>{document.hidden||Ze({silent:!0})},Uo),()=>{m=!0,le!==null&&window.clearInterval(le),t.removeEventListener("click",_),a.removeEventListener("click",A),I(),s.removeEventListener("pointerover",Ue),s.removeEventListener("pointerout",Kt),s.removeEventListener("pointerdown",xe),window.removeEventListener("scroll",Pe,{capture:!0}),l&&l.removeEventListener("change",q)}}var Ga={};Mt(Ga,{render:()=>yc});var Ha={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u522A\u9664\uFF0F\u9000\u5F79",badge:"badge-neutral"}},wt={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},ls={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},Ar={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function ks(e){let t=Ha[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${n(t.label)}</span>`}function za(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function Fl(e){return za(e).map(t=>{let[s,a]=t.split("|").map(r=>r.trim());return{law_name:s||"",source_type:a||""}})}function Hl(e){return za(e).map(t=>{let[s,a]=t.split("|").map(r=>r.trim());return{law_name:s||"",article_no:a||""}})}function zl(e){return za(e).map(t=>({jid:t.trim()}))}function Ul(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function Ql(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function Gl(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function Jl(e){return(e?.tags||[]).join(", ")}function _s(e){return`<div class="qb-empty">${u("info",18)}<span>${n(e)}</span></div>`}function Ua(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),r=[...t.map(i=>`<span class="chip">${n(i)}</span>`),...s.map(i=>`<span class="chip">${n(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${n(i)}</span>`)];return r.length?`<div class="chips qb-labels">${r.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function Qa(){return`<details class="qb-import">
    <summary>${u("upload",14)}JSON \u6279\u6B21\u532F\u5165</summary>
    <p class="qb-muted">\u683C\u5F0F\uFF1A<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>\u3002\u76F8\u540C\u984C\u76EE fingerprint \u9810\u8A2D\u66F4\u65B0\u3002</p>
    <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
    <div class="qb-actions">
      <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${u("upload",13)}<span>\u532F\u5165 JSON</span></button>
    </div>
  </details>`}function Vl(e){let t=e?.item||{},s=Array.isArray(e?.warnings)?e.warnings:[],a=Array.isArray(t.tags)?t.tags:[];return`<section class="report-card qb-card qb-ai-result">
    <div class="side-card-head">
      <span class="side-card-title">${u("sparkles",14)}Ollama \u5DF2\u5EFA\u7ACB\u984C\u76EE #${t.id}</span>
      ${ks(t.status)}
    </div>
    <div class="qb-ai-answer">
      <strong>${n(t.question||"")}</strong>
      <div class="qb-ai-meta">
        ${n(wt[t.question_type]||t.question_type||"")}
        \xB7 ${n(ls[t.difficulty]||t.difficulty||"")}
        \xB7 ${n(e?.model||"\u672C\u6A5F Ollama")}
      </div>
      ${Ua(t)}
      ${t.reference_answer?`<div class="qb-reference"><span class="summary-label">Ollama \u53C3\u8003\u7B54\u6848</span><p>${n(t.reference_answer)}</p></div>`:""}
      ${a.length?`<div class="chips">${a.map(r=>`<span class="chip">${n(r)}</span>`).join("")}</div>`:""}
      ${s.length?`<div class="qb-ai-warnings"><strong>\u9700\u8981\u6CE8\u610F</strong><ul>${s.map(r=>`<li>${n(r)}</li>`).join("")}</ul></div>`:""}
      <div class="qb-actions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="review-ai-item">${u("shield",13)}<span>\u524D\u5F80\u9A57\u6536</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="reset-ai">${u("plus",13)}<span>\u518D\u65B0\u589E\u4E00\u984C</span></button>
      </div>
    </div>
    ${Qa()}
  </section>`}function Wl(e){return e.aiResult?Vl(e.aiResult):`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${u("sparkles",14)}AI \u984C\u5EAB\u65B0\u589E</span>
      <span class="badge badge-neutral">\u672C\u6A5F Ollama</span>
    </div>
    <form class="qb-form qb-ai-form" data-qb-form="ai-create" id="qb-create-form">
      <label class="field qb-wide">
        <span class="field-label">\u984C\u76EE <span class="field-tag">question</span></span>
        <textarea class="input" name="question" rows="4" required placeholder="\u8F38\u5165\u554F\u984C\uFF0COllama \u6703\u56DE\u7B54\u4E26\u81EA\u52D5\u5224\u65B7\u984C\u578B\u3001\u96E3\u5EA6\u3001\u6CD5\u898F\uFF0F\u689D\u6587\u3001\u53C3\u8003\u7B54\u6848\u8207\u6A19\u7C64\u3002">${n(e.aiQuestion||"")}</textarea>
      </label>
      <p class="qb-form-hint">\u9001\u51FA\u5F8C\u7531\u672C\u6A5F Ollama \u56DE\u7B54\u4E26\u81EA\u52D5\u5EFA\u7ACB\u6B04\u4F4D\uFF1B\u984C\u76EE\u6703\u4EE5\u300C\u5F85\u5BE9\u300D\u5EFA\u7ACB\uFF0C\u4ECD\u9700\u4EBA\u5DE5\u8986\u6838\u5F8C\u624D\u6703\u6210\u70BA benchmark-ready\u3002</p>
      <div class="qb-actions">
        <button class="btn btn-primary" type="submit" ${e.aiLoading?"disabled":""}>${e.aiLoading?'<span class="spinner"></span><span>Ollama \u7522\u751F\u4E2D\u2026</span>':`${u("sparkles",14)}<span>\u8B93 Ollama \u7522\u751F\u4E26\u5EFA\u7ACB</span>`}</button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-ai" ${e.aiLoading?"disabled":""}>\u6E05\u9664</button>
      </div>
    </form>
    ${Qa()}
  </section>`}function Kl(e){return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${u("edit",14)}\u7DE8\u8F2F\u984C\u76EE #${e.id}</span>
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
          <select class="select" name="question_type">${Object.entries(wt).map(([t,s])=>`<option value="${t}" ${e?.question_type===t?"selected":""}>${s}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u96E3\u5EA6</span>
          <select class="select" name="difficulty">${Object.entries(ls).map(([t,s])=>`<option value="${t}" ${e?.difficulty===t?"selected":""}>${s}</option>`).join("")}</select>
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
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${n(Ul(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${n(Ql(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${n(Gl(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${n(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${n(Jl(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
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
        <button class="btn btn-primary" type="submit">${u("check",14)}<span>\u5132\u5B58\u65B0\u7248\u672C</span></button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-create">\u6E05\u9664</button>
      </div>
      <div class="qb-form-hint">\u4FEE\u6539\u5DF2\u5B58\u5728\u7684\u984C\u76EE\u6703\u5EFA\u7ACB\u65B0\u7248\u672C\uFF1B\u5DF2\u6838\u51C6\u984C\u76EE\u4FEE\u6539\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002</div>
    </form>
    ${Qa()}
  </section>`}function Yl(e,t){return e?Kl(e):Wl(t)}function Xl(e){let t=e.status==="retired"||!!e.deleted_at;return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${n(e.question)}</strong>
        <span class="qb-meta">
          ${n(wt[e.question_type]||e.question_type)}
          \xB7 ${n(ls[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${ks(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${n(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${Ua(e)}
    <div class="qb-item-foot">
      <span>\u66F4\u65B0 ${n(ye(e.updated_at))}</span>
      ${e.reviewed_by?`<span>\u5BE9\u6838 ${n(e.reviewed_by)}</span>`:""}
      ${e.review_comment?`<span class="qb-comment">${n(e.review_comment)}</span>`:""}
      <div class="qb-actions">
        ${t?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="restore" data-id="${e.id}">${u("refresh",13)}<span>\u5FA9\u539F\u984C\u76EE</span></button>`:`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${u("edit",13)}<span>\u7DE8\u8F2F</span></button>
               ${["pending_review","changes_requested"].includes(e.status)?"":`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="submit-review" data-id="${e.id}">${u("upload",13)}<span>${e.status==="draft"?"\u9001\u5BE9":"\u91CD\u65B0\u9001\u5BE9"}</span></button>`}
               <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${e.id}">${u("shield",13)}<span>\u9A57\u6536</span></button>
               <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${u("trash",13)}<span>\u522A\u9664</span></button>`}
      </div>
    </div>
  </article>`}function Zl(e){return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${u("database",14)}\u984C\u5EAB\u7BA1\u7406</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="new">${u("plus",13)}<span>\u65B0\u589E</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="revalidate">${u("refresh",13)}<span>\u91CD\u65B0\u9A57\u8B49</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="export">${u("download",13)}<span>\u532F\u51FA JSON</span></button>
      </div>
    </div>
    <form class="qb-filters" data-qb-form="filter">
      <input class="input" name="query" type="search" placeholder="\u641C\u5C0B\u984C\u76EE\u6216\u53C3\u8003\u7B54\u6848" value="${n(e.filters.query)}" />
      <select class="select" name="status">
        <option value="">\u5168\u90E8\u72C0\u614B</option>
        ${Object.entries(Ha).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(wt).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(ls).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <div class="qb-tag-filter" data-qb-tag-filter>
        <div class="qb-tag-values">
          ${e.filters.tags.length?e.filters.tags.map(t=>`<span class="chip qb-tag-chip">${n(t)}<button class="qb-tag-remove" type="button" data-qb-action="remove-tag" data-tag="${n(t)}" aria-label="\u79FB\u9664\u6A19\u7C64 ${n(t)}">${u("x",9)}</button></span>`).join(""):'<span class="qb-tag-placeholder">\u6A19\u7C64</span>'}
        </div>
        <button class="qb-tag-add" type="button" data-qb-action="open-tag-search" aria-label="\u52A0\u5165\u6A19\u7C64" aria-haspopup="listbox">${u("plus",13)}</button>
        ${e.filters.tags.map(t=>`<input type="hidden" name="tags" value="${n(t)}" />`).join("")}
        <div class="qb-tag-popover" data-qb-tag-popover hidden>
          <input class="input" type="search" data-qb-tag-search placeholder="\u8F38\u5165\u76F8\u8FD1\u5B57\u641C\u5C0B\u6A19\u7C64\u2026" autocomplete="off" />
          <div class="qb-tag-results" data-qb-tag-results role="listbox" aria-live="polite"></div>
        </div>
      </div>
      <button class="btn btn-primary btn-sm" type="submit">${u("search",13)}<span>\u7BE9\u9078</span></button>
    </form>
    <div class="qb-list">
      ${e.items.length?e.items.map(t=>Xl(t)).join(""):_s("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${c(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}var Mr=[["queue","\u5F85\u5BE9\uFF0F\u9000\u56DE"],["accepted","\u5DF2\u6838\u51C6"],["rejected","\u5DF2\u62D2\u7D55"],["draft","\u8349\u7A3F"]];function ec(e){let t=e.stats||{};return{queue:Number(t.pending_review||0)+Number(t.changes_requested||0),accepted:Number(t.accepted||0),rejected:Number(t.rejected||0),draft:Number(t.draft||0)}}function tc(e,t){let s=e.reviewFilter||"queue",a={queue:{title:"\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u6216\u9000\u56DE\u4FEE\u6539\u7684\u984C\u76EE\u3002",text:t.accepted?`\u5DF2\u6709 ${c(t.accepted)} \u984C\u6838\u51C6\u3002\u65B0\u984C\u76EE\u5EFA\u7ACB\u5F8C\u6703\u81EA\u52D5\u9001\u5BE9\uFF0C\u4E5F\u53EF\u4EE5\u5207\u63DB\u5230\u300C\u5DF2\u6838\u51C6\u300D\u91CD\u65B0\u9A57\u6536\u65E2\u6709\u984C\u76EE\u3002`:"\u5EFA\u7ACB\u984C\u76EE\u5F8C\u6703\u9810\u8A2D\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\uFF1B\u82E5\u53EA\u60F3\u5148\u4FDD\u5B58\uFF0C\u5EFA\u7ACB\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5373\u53EF\u5B58\u6210\u8349\u7A3F\u3002"},accepted:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u6838\u51C6\u984C\u76EE\u3002",text:"\u984C\u76EE\u901A\u904E\u4EBA\u5DE5\u9A57\u6536\u5F8C\u6703\u5217\u5728\u9019\u88E1\uFF1B\u4E5F\u53EF\u4EE5\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u9001\u51FA\u9A57\u6536\u3002"},rejected:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u62D2\u7D55\u984C\u76EE\u3002",text:"\u88AB\u62D2\u7D55\u7684\u984C\u76EE\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u4E2D\uFF0C\u53EF\u4FEE\u6539\u5F8C\u91CD\u65B0\u9001\u5BE9\u3002"},draft:{title:"\u76EE\u524D\u6C92\u6709\u8349\u7A3F\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u984C\u76EE\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5C31\u6703\u5B58\u6210\u8349\u7A3F\uFF0C\u4E4B\u5F8C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002"}}[s]||{title:"\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u65B0\u984C\u76EE\u5F8C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"},r=[s!=="draft"?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="new">${u("plus",13)}<span>\u65B0\u589E\u984C\u76EE</span></button>`:"",s==="queue"&&t.accepted?`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="review-filter" data-filter="accepted">${u("shield",13)}<span>\u67E5\u770B\u5DF2\u6838\u51C6 ${c(t.accepted)}</span></button>`:"",`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="go-manage">${u("database",13)}<span>\u524D\u5F80\u984C\u5EAB\u7BA1\u7406</span></button>`].filter(Boolean).join("");return`<div class="qb-empty qb-empty-block">
    <span class="qb-empty-icon">${u("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>${n(a.title)}</strong>
      <p>${n(a.text)}</p>
      <div class="qb-actions">${r}</div>
    </div>
  </div>`}function sc(e){let t=Mr.find(([s])=>s===e);return t?t[1]:"\u5F85\u5BE9\uFF0F\u9000\u56DE"}function ac(e,t){return`<button class="qb-review-item${t?" is-active":""}" type="button" data-qb-action="select-review-item" data-id="${e.id}" aria-pressed="${t?"true":"false"}">
    <span class="qb-review-item-top">
      <span class="qb-id">#${e.id}</span>
      <span class="qb-review-item-meta">
        ${n(wt[e.question_type]||e.question_type)}
        \xB7 ${n(ls[e.difficulty]||e.difficulty)}
        \xB7 v${e.version}
        ${e.benchmark_ready?" \xB7 Benchmark ready":""}
        ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
      </span>
      ${ks(e.status)}
    </span>
    <strong>${n(e.question)}</strong>
  </button>`}function nc(e){return`<article class="qb-review-pane-card">
    <div class="qb-review-pane-head">
      <div class="qb-review-pane-title">
        <span class="qb-review-item-meta">#${e.id} \xB7 v${e.version} \xB7 ${n(wt[e.question_type]||e.question_type)} \xB7 ${n(ls[e.difficulty]||e.difficulty)}</span>
        <strong>${n(e.question)}</strong>
      </div>
      <div class="qb-review-pane-side">
        ${ks(e.status)}
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${u("edit",13)}<span>\u7DE8\u8F2F</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${u("trash",13)}<span>\u522A\u9664</span></button>
        </div>
      </div>
    </div>
    <div class="qb-fingerprint mono">fingerprint ${n(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${Ua(e)}
    ${e.review_comment?`<div class="qb-review-note"><span class="summary-label">\u6700\u8FD1\u6279\u6CE8${e.reviewed_by?` \xB7 ${n(e.reviewed_by)}`:""}</span><p>${n(e.review_comment)}</p></div>`:""}
    ${e.reference_answer?`<div class="qb-reference"><span class="summary-label">\u53C3\u8003\u7B54\u6848</span><p>${n(e.reference_answer)}</p></div>`:""}
    <form class="qb-review-form" data-qb-form="review" data-id="${e.id}">
      <div class="qb-score-grid">
        ${[["clarity","\u984C\u76EE\u6E05\u6670"],["labels","\u6CD5\u689D\u6A19\u6CE8"],["answer","\u53C3\u8003\u7B54\u6848"],["difficulty","\u96E3\u5EA6\u8207\u6A19\u7C64"],["overall","\u6574\u9AD4"]].map(([t,s])=>`<label class="field"><span class="field-label">${s} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${t}" value="4" /></label>`).join("")}
      </div>
      <label class="field"><span class="field-label">\u6279\u6CE8</span><textarea class="input" name="comment" rows="3" placeholder="\u6A19\u8A3B\u7406\u7531\u3001\u9700\u8981\u4FEE\u6539\u7684\u6B04\u4F4D\uFF0C\u6216\u9A57\u6536\u7D50\u8AD6\u3002"></textarea></label>
      <div class="qb-actions qb-review-decisions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="decide" data-decision="approved">${u("check",13)}<span>\u6838\u51C6</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="decide" data-decision="changes_requested">${u("edit",13)}<span>\u9000\u56DE\u4FEE\u6539</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-qb-action="decide" data-decision="rejected">${u("x",13)}<span>\u62D2\u7D55</span></button>
      </div>
    </form>
    ${e.reviews?.length?`<div class="qb-review-history"><span class="summary-label">\u5BE9\u6838\u7D00\u9304</span>${e.reviews.map(t=>`<div class="qb-review-row"><span>${n(t.reviewer||"\u533F\u540D")}</span>${ks(t.decision==="approved"?"accepted":t.decision)}<span>${n(ye(t.created_at))}</span><p>${n(t.comment||"\u2014")}</p></div>`).join("")}</div>`:""}
  </article>`}function rc(){return`<div class="qb-empty qb-empty-block qb-review-placeholder">
    <span class="qb-empty-icon">${u("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>\u5F9E\u5DE6\u5074\u9078\u64C7\u984C\u76EE</strong>
      <p>\u9EDE\u9078\u984C\u76EE\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u984C\u5E79\u3001\u9810\u671F\u6A19\u8A3B\u3001\u53C3\u8003\u7B54\u6848\u8207\u6838\u51C6\u9078\u9805\u3002</p>
    </div>
  </div>`}function ic(e){let t=e.reviewDetail,s=ec(e),a=e.reviewFilter||"queue",r=Mr.map(([l,d])=>`<button class="chip qb-review-tab${a===l?" is-active":""}" type="button" role="tab" aria-selected="${a===l?"true":"false"}" data-qb-action="review-filter" data-filter="${l}"><span>${d}</span><span class="qb-review-tab-count">${c(s[l]||0)}</span></button>`).join(""),i=e.reviewItems.length?e.reviewItems.map(l=>ac(l,Number(t?.id)===Number(l.id))).join(""):`<div class="qb-empty qb-empty-compact">${u("info",16)}<span>\u76EE\u524D\u6C92\u6709${n(sc(a))}\u984C\u76EE\u3002</span></div>`,o=t?nc(t):e.reviewItems.length?rc():tc(e,s);return`<section class="report-card qb-card qb-review-card">
    <div class="side-card-head">
      <span class="side-card-title">${u("shield",14)}\u984C\u5EAB\u4EBA\u5DE5\u9A57\u6536\u6279\u6CE8</span>
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
  </section>`}function ws(e){if(e==null||e==="")return"";let t=Number(e);return Number.isFinite(t)?`${Math.round(t*100)}%`:""}function oc(e){if(!e||typeof e!="object")return"\u5F15\u7528";let t=String(e.jid||"").trim();if(t)return t;let s=String(e.law_name||"").trim(),a=String(e.article_no||"").trim(),r=`${s} ${a}`.trim();return r||String(e.title||e.text||"\u5F15\u7528").slice(0,80)}function lc(e){let t=e?.metrics||{},s=t.scores||{},a=[["\u6CD5\u898F\u53EC\u56DE",ws(t.law_recall)],["\u689D\u6587\u53EC\u56DE",ws(t.article_recall)],["\u898F\u5247\u5206",ws(s.deterministic)],["Judge",ws(s.judge)],["\u4EBA\u5DE5",ws(s.human)]].filter(([,r])=>r);return a.length?`<div class="qb-bank-stats">${a.map(([r,i])=>`<span class="qb-bank-stat"><span>${n(r)}</span><strong>${n(i)}</strong></span>`).join("")}</div>`:""}function cc(e){let t=Array.isArray(e?.law_sources)?e.law_sources:[],s=Array.isArray(e?.citations)?e.citations:[],a=t.length?`<div class="qb-bank-sources">${t.map(i=>{let o=String(i.law_name||"\u672A\u547D\u540D\u6CD5\u898F"),l=(i.articles||[]).map(m=>String(m.article_no||"").trim()).filter(Boolean),d=`<strong>${n(o)}</strong>${l.length?`<small>${n(l.join("\u3001"))}</small>`:""}`;return i.law_url?`<a class="qb-bank-law" href="${n(i.law_url)}" target="_blank" rel="noreferrer">${d}</a>`:`<span class="qb-bank-law">${d}</span>`}).join("")}</div>`:"",r=s.length?`<div class="qb-bank-sources qb-bank-citations">${s.map(i=>`<span class="chip chip-mono">${n(oc(i))}</span>`).join("")}</div>`:"";return!a&&!r?"":`<div class="qb-bank-answer-block">
    <div class="qb-bank-section-label"><span>\u5F15\u7528\u4F86\u6E90</span><span>${c(t.length+s.length)} \u7B46</span></div>
    ${a}${r}
  </div>`}function jr(e,t){if(!e)return`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${u("history",20)}</span>
      <strong>\u5C1A\u7121 RAG \u7B54\u6848</strong>
      <span>\u8DD1\u4E00\u6B21 Benchmark \u5F8C\uFF0C\u6700\u8FD1\u4E00\u6B21\u6210\u529F\u56DE\u7B54\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</span>
    </div>`;let s=Number(e.item_version||0),a=Number(t?.version||0),r=s&&a&&s!==a?`<span class="badge badge-warn">\u7B54\u6848 v${s} \xB7 \u984C\u76EE v${a}</span>`:"",i=e.answer_source==="llm"?"LLM \u751F\u6210":e.answer_source==="structured"?"\u6CD5\u898F\u8CC7\u6599\u5EAB":String(e.answer_source||"RAG");return`<div class="qb-bank-answer-meta">
      <span class="badge badge-ok"><span class="status-dot is-ok"></span>RAG \u5B8C\u6210</span>
      <span class="badge badge-neutral">${n(i)}</span>
      ${r}
      <span class="mono">${n(e.run_label||e.run_id||"")}</span>
      <span>${n(ye(e.finished_at))}</span>
      <span>${n(re(e.duration_ms))}</span>
      ${e.llm_model?`<span class="mono">${n(e.llm_model)}</span>`:""}
    </div>
    <div class="qb-bank-answer-block">
      <div class="qb-bank-section-label"><span>\u56DE\u7B54</span><span>${c(String(e.answer||"").length)} \u5B57</span></div>
      <p class="qb-bank-answer-text">${n(String(e.answer||"").trim()||"\uFF08\u7A7A\u767D\u56DE\u7B54\uFF09")}</p>
    </div>
    ${cc(e)}
    ${lc(e)}`}function Tr(e,t){let s=e.selectedSuiteId,a=t&&e.suiteAnswers?.[String(s)]?.[String(t.id)]||null;return t?`<div class="qb-bank-answer-head">
      <div class="qb-bank-answer-heading">
        <span class="qb-bank-answer-kicker">${u("sparkles",12)}RAG \u6700\u8FD1\u4E00\u6B21\u7B54\u6848</span>
        <strong class="qb-bank-answer-question">#${t.id} ${n(t.question)}</strong>
      </div>
      ${a?`<span class="qb-bank-answer-state">${n(wt[t.question_type]||t.question_type)} \xB7 v${t.version}</span>`:""}
    </div>
    ${jr(a,t)}`:`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${u("cube",20)}</span>
      <strong>\u9078\u64C7\u984C\u76EE</strong>
      <span>\u5F9E\u5DE6\u5074\u6E05\u55AE\u9078\u64C7\u4E00\u984C\uFF0C\u67E5\u770B\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`}function Er(e){return`<span class="qb-bank-actions">
    <button class="qb-bank-icon" type="button" data-qb-action="edit" data-id="${e.id}" title="\u7DE8\u8F2F\u984C\u76EE" aria-label="\u7DE8\u8F2F\u984C\u76EE #${e.id}">${u("edit",13)}</button>
    <button class="qb-bank-icon is-danger" type="button" data-qb-action="delete" data-id="${e.id}" title="\u5F9E\u984C\u5EAB\u79FB\u9664" aria-label="\u5F9E\u984C\u5EAB\u79FB\u9664 #${e.id}">${u("trash",13)}</button>
  </span>`}function dc(e,t,{selected:s,hasAnswer:a}){return`<div class="qb-bank-row${s?" is-active":""}" data-id="${e.id}">
    <button class="qb-bank-select" type="button" data-qb-action="select-bank-item" data-id="${e.id}" aria-pressed="${s?"true":"false"}">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <span class="qb-bank-item-copy">
        <strong>${n(e.question)}</strong>
        <small>${n(wt[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${a?"\u5DF2\u6709 RAG \u7B54\u6848":"\u5C1A\u7121 RAG \u7B54\u6848"}</small>
      </span>
    </button>
    ${Er(e)}
  </div>`}function uc(e,t,s){return`<article class="qb-bank-full-item" data-id="${e.id}">
    <div class="qb-bank-full-head">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <div class="qb-bank-full-title">
        <strong>${n(e.question)}</strong>
        <small>${n(wt[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${n(Ha[e.status]?.label||e.status||"")}</small>
      </div>
      ${Er(e)}
    </div>
    ${jr(s,e)}
  </article>`}function Lr(e){let t=e.editingSuite,s=Array.isArray(e.suites)?e.suites:[],a=s.find(g=>Number(g.id)===Number(e.selectedSuiteId))||s[0]||null,r=Array.isArray(a?.items)?a.items:[],i=e.suiteAnswers?.[String(a?.id)]||{},o=r.find(g=>Number(g.id)===Number(e.selectedBankItemId))||null,l=!!e.suiteAnswersLoading,d=String(e.suiteAnswersError||""),m=!!e.suiteManageOpen||!s.length,v=e.bankTab==="full"?"full":"split",w=s.length?`<div class="qb-bank-tabs" role="tablist" aria-label="Benchmark \u984C\u5EAB\u6AA2\u8996">
        <button class="qb-bank-tab${v==="split"?" is-active":""}" type="button" role="tab" aria-selected="${v==="split"?"true":"false"}" data-qb-action="bank-tab" data-tab="split">${u("grid",13)}<span>Benchmark \u984C\u5EAB</span><span class="badge badge-neutral">${c(r.length)}</span></button>
        <button class="qb-bank-tab${v==="full"?" is-active":""}" type="button" role="tab" aria-selected="${v==="full"?"true":"false"}" data-qb-action="bank-tab" data-tab="full">${u("table",13)}<span>\u984C\u5EAB\u5168\u5217\u8868</span><span class="badge badge-neutral">${c(r.length)}</span></button>
      </div>`:"",$="";if(!s.length)$=`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${u("cube",20)}</span>
      <strong>\u5C1A\u672A\u5EFA\u7ACB Benchmark \u984C\u5EAB</strong>
      <span>\u5C55\u958B\u4E0B\u65B9 Suite \u8A2D\u5B9A\u4E26\u5EFA\u7ACB\u984C\u5EAB\u5F8C\uFF0C\u5C31\u80FD\u5728\u9019\u88E1\u700F\u89BD\u984C\u76EE\u8207\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`;else if(l)$='<div class="qb-bank-loading"><span class="spinner" aria-hidden="true"></span><span>\u8B80\u53D6\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u4E2D\u2026</span></div>';else{let g=d?_e({tone:"warn",title:"\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u8B80\u53D6\u5931\u6557",text:n(d)}):"";v==="full"?$=`${g}<div class="qb-bank-full" data-qb-bank-view="full">${r.length?r.map((h,y)=>uc(h,y,i[String(h.id)]||null)).join(""):_s("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>`:$=`${g}<div class="qb-bank-split" data-qb-bank-view="split">
        <div class="qb-bank-list" data-qb-bank-list>${r.length?r.map((h,y)=>dc(h,y,{selected:Number(h.id)===Number(o?.id),hasAnswer:!!i[String(h.id)]})).join(""):_s("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>
        <div class="qb-bank-answer-pane" data-qb-bank-answer>${Tr(e,o)}</div>
      </div>`}return`<section class="report-card qb-card qb-bank-card">
    <div class="side-card-head qb-bank-head">
      <div class="qb-bank-heading">
        <span class="side-card-title">${u("cube",14)}Benchmark \u984C\u5EAB</span>
        <span class="qb-bank-sub">${a?`${n(a.name)} \xB7 v${a.version} \xB7 ${c(a.item_count)} \u984C`:"\u5C1A\u672A\u5EFA\u7ACB suite"}</span>
      </div>
      <div class="qb-bank-controls">
        ${s.length?`<label class="qb-suite-picker"><span>Suite</span><select class="select" data-qb-suite-select aria-label="\u9078\u64C7 benchmark suite">${s.map(g=>`<option value="${g.id}" ${Number(g.id)===Number(a?.id)?"selected":""}>${n(g.name)} \xB7 ${c(g.item_count)} \u984C</option>`).join("")}</select></label>`:""}
        ${a?`<span class="badge ${a.status==="frozen"?"badge-ok":"badge-neutral"}">${a.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>`:""}
      </div>
    </div>
    ${w}
    ${$}
    <details class="qb-suite-manage" ${m?"open":""}>
      <summary>${u("sliders",14)}Suite \u8A2D\u5B9A\u8207\u7248\u672C <span class="qb-muted">${c(s.length)} \u500B suite \xB7 ${c(e.ready.length)} \u984C benchmark-ready</span></summary>
      <div class="qb-suite-manage-body">
        <form class="qb-suite-form" data-qb-form="suite">
          <input type="hidden" name="suite_id" value="${t?.id||""}" />
          <div class="qb-form-grid">
            <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${n(t?.name||"Pilot 30")}" /></label>
            <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(Ar).map(([g,h])=>`<option value="${g}" ${t?.tier===g?"selected":""}>${h}</option>`).join("")}</select></label>
          </div>
          <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${n(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
          <div class="qb-check-list">
            ${e.ready.length?e.ready.map(g=>{let h=t?t.items?.some(y=>Number(y.id)===Number(g.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${g.id}" ${h?"checked":""}/><span><strong>#${g.id}</strong> ${n(g.question)} <small>${n(wt[g.question_type]||g.question_type)}</small></span></label>`}).join(""):_s("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
          </div>
          <div class="qb-actions">
            <button class="btn btn-primary" type="submit">${u("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
            ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
          </div>
        </form>
        <div class="qb-list">
          ${s.length?s.map(g=>`<article class="qb-suite">
            <div class="qb-item-head">
              <div class="qb-item-title"><strong>${n(g.name)}</strong><span class="qb-meta">${n(Ar[g.tier]||g.tier)} \xB7 v${g.version} \xB7 ${c(g.item_count)} \u984C</span></div>
              <span class="badge ${g.status==="frozen"?"badge-ok":"badge-neutral"}">${g.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
            </div>
            <div class="qb-suite-items">${(g.items||[]).slice(0,8).map(h=>`<span class="chip">#${h.id} ${n(h.question.slice(0,22))}${h.question.length>22?"\u2026":""}</span>`).join("")}${g.item_count>8?`<span class="qb-muted">+${g.item_count-8}</span>`:""}</div>
            <div class="qb-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${g.id}">${u("edit",13)}<span>\u7DE8\u8F2F suite</span></button>
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${g.id}">${u("shield",13)}<span>\u51CD\u7D50</span></button>
              <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${g.id}">${u("trash",13)}<span>\u522A\u9664</span></button>
            </div>
          </article>`).join(""):_s("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
        </div>
      </div>
    </details>
  </section>`}function pc(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),r=Number(a?.value);Number.isFinite(r)&&(t[s]=Math.max(1,Math.min(5,Math.round(r))))}return t}function mc(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:Fl(t.get("expected_laws")),expected_articles:Hl(t.get("expected_articles")),expected_judgments:zl(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function Nr(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},r={tab:"",editing:null,editingFrom:"",editingSuite:null,aiQuestion:"",aiLoading:!1,aiResult:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tags:[]},stats:{},suites:[],ready:[],selectedSuiteId:null,selectedBankItemId:null,bankTab:"split",suiteAnswers:{},suiteAnswersLoading:!1,suiteAnswersError:"",suiteManageOpen:!1,reviewItems:[],reviewDetail:null,reviewFilter:"queue"},i=M=>e.querySelector(`#quality-panel-${a[M]}`),o=(M,O)=>{M&&(M.childElementCount?M.setAttribute("aria-busy","true"):M.innerHTML=`<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>${O}</span></div></section>`)},l=M=>{M?.removeAttribute("aria-busy")},d=0,m=null,v=()=>"anonymous",w=()=>{s&&s(r.stats)},$=M=>{t&&t(M),U(M)},g=async()=>{try{r.stats=await H.questionBankStats()}catch{r.stats={}}w()},h=()=>{let M=i("create");M&&(M.innerHTML=Yl(r.editing,r))},y=(M,O)=>{let I=M?.querySelector("[data-qb-tag-results]");I&&(I.innerHTML=O.length?O.map(z=>`<button class="qb-tag-option" type="button" role="option" data-qb-action="select-tag" data-tag="${n(z.tag)}"><span>${n(z.tag)}</span><small>${c(z.count)}</small></button>`).join(""):'<div class="qb-tag-empty">\u6C92\u6709\u5176\u4ED6\u76F8\u7B26\u6A19\u7C64</div>')},S=async(M,O="")=>{if(!M)return;let I=M.querySelector("[data-qb-tag-results]"),z=++d;I&&(I.innerHTML='<div class="qb-tag-loading"><span class="spinner"></span><span>\u641C\u5C0B\u6A19\u7C64\u2026</span></div>');try{let ce=await H.questionBankTags(O,12);if(z!==d)return;let V=(ce.tags||[]).filter(xe=>!r.filters.tags.includes(xe.tag));y(M,V)}catch(ce){if(z!==d)return;I&&(I.innerHTML=`<div class="qb-tag-empty">${n(ce.message||"\u6A19\u7C64\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},N=(M,{focus:O=!1}={})=>{if(!M)return;let I=M.querySelector("[data-qb-tag-popover]"),z=M.querySelector("[data-qb-tag-search]");!I||!z||(I.hidden&&(I.hidden=!1,z.value="",S(M,"")),O&&(z.focus(),z.select()))},D=M=>{m&&(window.clearTimeout(m),m=null);let O=M?.querySelector("[data-qb-tag-popover]");O&&(O.hidden=!0)},B=async M=>{let O=String(M||"").trim();O&&(r.filters.tags.includes(O)?r.filters.tags=r.filters.tags.filter(I=>I!==O):r.filters.tags=[...r.filters.tags,O],r.offset=0,await x())},Q=()=>{let M=Array.isArray(r.suites)?r.suites:[];if(!M.length)return r.selectedSuiteId=null,r.selectedBankItemId=null,null;let O=M.find(z=>Number(z.id)===Number(r.selectedSuiteId));O||(O=M[0],r.selectedSuiteId=O.id,r.selectedBankItemId=null);let I=Array.isArray(O.items)?O.items:[];return I.some(z=>Number(z.id)===Number(r.selectedBankItemId))||(r.selectedBankItemId=I[0]?.id??null),O},ne=()=>{let M=i("suite");M&&(M.innerHTML=Lr(r))},te=0,$e=async(M,{force:O=!1}={})=>{if(!M)return;let I=++te;if(!O&&r.suiteAnswers[String(M)]){r.suiteAnswersLoading=!1,r.suiteAnswersError="",ne();return}r.suiteAnswersLoading=!0,r.suiteAnswersError="",ne();try{let z=await H.benchmarkSuiteLatestAnswers(M);if(I!==te)return;r.suiteAnswers[String(M)]=z.answers||{}}catch(z){if(I!==te)return;r.suiteAnswersError=z.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}finally{I===te&&(r.suiteAnswersLoading=!1,ne())}},qe=async M=>{r.selectedSuiteId=M,r.selectedBankItemId=null,r.suiteAnswersError="";let O=Q();if(!O){ne();return}await $e(O.id)},J=M=>{r.bankTab=M==="full"?"full":"split",ne()},R=()=>{let M=i("suite");if(!M)return;let O=Q(),z=(Array.isArray(O?.items)?O.items:[]).find(V=>Number(V.id)===Number(r.selectedBankItemId))||null;for(let V of M.querySelectorAll(".qb-bank-row")){let xe=Number(V.dataset.id)===Number(r.selectedBankItemId);V.classList.toggle("is-active",xe);let F=V.querySelector("[data-qb-action='select-bank-item']");F&&F.setAttribute("aria-pressed",xe?"true":"false")}let ce=M.querySelector("[data-qb-bank-answer]");ce&&(ce.innerHTML=Tr(r,z))},x=async()=>{let M=i("manage");if(M){m&&(window.clearTimeout(m),m=null),o(M,"\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026");try{let O=await H.questionBankItems({...r.filters,...r.filters.status==="retired"?{include_deleted:!0}:{}},r.limit,r.offset);r.items=O.items||[],r.total=Number(O.total||0),r.stats=O.stats||r.stats,l(M),M.innerHTML=Zl(r),w()}catch(O){l(M),M.innerHTML=`<section class="report-card qb-card">${_e({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:n(O.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},C=async({refreshAnswers:M=!1}={})=>{let O=i("suite");if(O){o(O,"\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026");try{let[I,z]=await Promise.all([H.benchmarkSuites(),H.benchmarkReadyQuestions(300)]);r.suites=I.suites||[],r.ready=z.items||[];let ce=Q();if(r.suiteAnswersError="",r.suiteAnswersLoading=!1,ce&&(M||!r.suiteAnswers[String(ce.id)]))try{let V=await H.benchmarkSuiteLatestAnswers(ce.id);r.suiteAnswers[String(ce.id)]=V.answers||{}}catch(V){r.suiteAnswersError=V.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}l(O),O.innerHTML=Lr(r)}catch(I){l(O),O.innerHTML=`<section class="report-card qb-card">${_e({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:n(I.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},Z=()=>{let M=i("review");M&&(M.innerHTML=ic(r))},ie=async M=>{let O=r.reviewItems.find(z=>Number(z.id)===Number(M));if(!O)return;r.reviewDetail=O,Z();let I=i("review")?.querySelector(".qb-review-detail-pane");I&&window.matchMedia("(max-width: 1020px)").matches&&I.scrollIntoView({behavior:"smooth",block:"start"});try{let z=await H.questionBankItem(O.id);Number(r.reviewDetail?.id)===Number(O.id)&&(r.reviewDetail=z,Z())}catch(z){L(z.message||"\u984C\u76EE\u5167\u5BB9\u8B80\u53D6\u5931\u6557\u3002","danger")}},T=async()=>{let M=i("review");if(!M)return;o(M,"\u8B80\u53D6\u9A57\u6536\u984C\u76EE\u4E2D\u2026");let O=r.reviewFilter||"queue",I=O==="queue"?["pending_review","changes_requested"]:O==="accepted"?["accepted"]:O==="rejected"?["rejected"]:["draft"];try{let z=await Promise.all(I.map(F=>H.questionBankItems({status:F},200,0)));r.reviewItems=z.flatMap(F=>F.items||[]),r.stats=z[0]?.stats||r.stats;let ce=Number(r.reviewDetail?.id||0),xe=r.reviewItems.some(F=>Number(F.id)===ce)?ce:Number(r.reviewItems[0]?.id||0);r.reviewDetail=xe?await H.questionBankItem(xe):null,l(M),Z(),w()}catch(z){l(M),M.innerHTML=`<section class="report-card qb-card">${_e({tone:"danger",title:"\u9A57\u6536\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:n(z.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}};function U(M){let O=r.tab;r.tab=M;for(let I of Object.keys(a)){let z=i(I);z&&(z.hidden=I!==M)}M==="create"?(O!=="create"&&!r.editing&&(r.aiQuestion="",r.aiResult=null),h()):M==="manage"?x():M==="suite"?C():M==="review"&&T()}let Y=M=>{let I=[...r.items,...r.reviewItems,...r.reviewDetail?[r.reviewDetail]:[]].find(ce=>Number(ce.id)===Number(M));r.reviewDetail=I||{id:Number(M)};let z=I?.status;["accepted","rejected","draft"].includes(z)?r.reviewFilter=z:z&&(r.reviewFilter="queue"),$("review")},pe=async M=>{let O=mc(M),I=Number(M.elements.item_id?.value||0);I||(O.status=M.elements.submit_for_review?.checked?"pending_review":"draft");try{I?(await H.updateQuestionBankItem(I,{...O,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),L("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await H.createQuestionBankItem(O),L(O.status==="draft"?"\u984C\u76EE\u5DF2\u5B58\u70BA\u8349\u7A3F\uFF0C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002":"\u984C\u76EE\u5DF2\u5EFA\u7ACB\u4E26\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok")),r.editing=null;let z=["manage","suite","review"].includes(r.editingFrom)?r.editingFrom:"manage";r.editingFrom="",r.suiteAnswers={},await g(),$(z)}catch(z){let ce=z.detail||z.payload?.detail,V=ce?.errors?.join(" \xB7 ")||ce?.message||z.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";L(V,"danger",8e3)}},se=async M=>{let O=String(new FormData(M).get("question")||"").trim();if(O.length<4){L("\u984C\u76EE\u81F3\u5C11\u9700\u8981 4 \u500B\u5B57\u3002","danger");return}r.aiQuestion=O,r.aiLoading=!0,r.aiResult=null,h();try{let I=await H.createQuestionBankItemWithAI({question:O});r.aiResult=I,r.aiQuestion="",await g(),L(`Ollama \u5DF2\u5EFA\u7ACB\u984C\u76EE #${I.item.id}\uFF0C\u72C0\u614B\u70BA\u5F85\u5BE9\uFF0C\u8ACB\u4EBA\u5DE5\u8986\u6838\u3002`,"ok",8e3)}catch(I){let z=I.detail||I.payload?.detail,ce=z?.errors?.join(" \xB7 ")||z?.message||I.message||"Ollama \u7522\u751F\u5931\u6557\u3002";L(ce,"danger",12e3)}finally{r.aiLoading=!1,h()}},ee=async(M,O)=>{let I=Number(M.dataset.id||0);if(I)try{await H.reviewQuestionBankItem(I,{decision:O,reviewer:v(),rubric_scores:pc(M),comment:String(M.querySelector('[name="comment"]')?.value||"")}),L(O==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":O==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",O==="approved"?"ok":"info"),await g(),await T()}catch(z){let ce=z.detail||z.payload?.detail,V=ce?.errors?.join(" \xB7 ")||ce?.message||z.message||"\u9A57\u6536\u5931\u6557\u3002";L(V,"danger",8e3)}},fe=async M=>{let O=new FormData(M),I=Number(O.get("suite_id")||0),z=Array.from(M.querySelectorAll('input[name="item_ids"]:checked')).map(V=>Number(V.value)),ce={name:String(O.get("name")||"").trim(),tier:String(O.get("tier")||"core"),description:String(O.get("description")||"").trim(),item_ids:z};try{I?(await H.updateBenchmarkSuite(I,ce),L("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await H.createBenchmarkSuite(ce),L("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),r.editingSuite=null,r.suiteManageOpen=!0,r.suiteAnswers={},await C()}catch(V){let xe=V.detail||V.payload?.detail,F=xe?.errors?.join(" \xB7 ")||xe?.message||V.message||"Suite \u5132\u5B58\u5931\u6557\u3002";L(F,"danger",8e3)}},ke=async M=>{let O=e.querySelector("[data-qb-tag-filter] [data-qb-tag-popover]:not([hidden])")?.closest("[data-qb-tag-filter]");O&&!M.target.closest("[data-qb-tag-filter]")&&D(O);let I=M.target.closest("[data-qb-action]")?.dataset.qbAction;if(!I)return;let z=M.target.closest("[data-qb-action]"),ce=Number(z.dataset.id||0);if(I==="open-tag-search"){let V=z.closest("[data-qb-tag-filter]");N(V,{focus:!0});return}if(I==="select-tag"){await B(z.dataset.tag);return}if(I==="remove-tag"){await B(z.dataset.tag);return}if(I==="bank-tab"){J(z.dataset.tab);return}if(I==="select-bank-item"){r.selectedBankItemId=ce,R();return}if(I==="new"){r.editing=null,r.editingFrom="",r.aiQuestion="",r.aiResult=null,r.aiLoading=!1,$("create");return}if(I==="reset-create"){r.editing=null,h();return}if(I==="reset-ai"){r.aiQuestion="",r.aiResult=null,r.aiLoading=!1,h();return}if(I==="edit"){let V=r.suites.find(oe=>Number(oe.id)===Number(r.selectedSuiteId)),F=[...r.items,...r.reviewItems,...V?.items||[],...r.reviewDetail?[r.reviewDetail]:[]].find(oe=>Number(oe.id)===ce);if(!F)return;r.editing=F,r.editingFrom=r.tab,$("create");return}if(I==="review"){Y(ce);return}if(I==="review-ai-item"){let V=r.aiResult?.item;if(!V)return;r.reviewFilter="queue",r.reviewDetail=V,$("review");return}if(I==="review-filter"){let V=String(z.dataset.filter||"queue");r.reviewFilter=["queue","accepted","rejected","draft"].includes(V)?V:"queue",r.reviewDetail=null,await T();return}if(I==="select-review-item"){await ie(ce);return}if(I==="go-manage"){$("manage");return}if(I==="submit-review"){try{await H.submitQuestionBankItemForReview(ce),L("\u5DF2\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok"),await g(),r.tab==="manage"?await x():r.tab==="review"&&await T()}catch(V){let xe=V.detail||V.payload?.detail,F=xe?.errors?.join(" \xB7 ")||xe?.message||V.message||"\u9001\u5BE9\u5931\u6557\u3002";L(F,"danger",8e3)}return}if(I==="restore"){if(!window.confirm(`\u78BA\u5B9A\u5FA9\u539F\u984C\u76EE #${ce}\uFF1F\u5FA9\u539F\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\u72C0\u614B\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002`))return;try{await H.restoreQuestionBankItem(ce),L("\u984C\u76EE\u5DF2\u5FA9\u539F\u4E26\u56DE\u5230\u5F85\u5BE9\u3002","ok"),await g(),await x()}catch(V){let xe=V.detail||V.payload?.detail,F=xe?.errors?.join(" \xB7 ")||xe?.message||V.message||"\u5FA9\u539F\u5931\u6557\u3002";L(F,"danger",8e3)}return}if(I==="delete"){if(r.tab==="suite"){let V=Q();if(!V||!(V.items||[]).find(F=>Number(F.id)===ce)||!window.confirm(`\u78BA\u5B9A\u5F9E\u300C${V.name}\u300D\u79FB\u9664\u984C\u76EE #${ce}\uFF1F\u984C\u76EE\u4ECD\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u7BA1\u7406\u4E2D\u3002`))return;try{await H.removeBenchmarkSuiteItem(V.id,ce),L("\u5DF2\u5F9E Benchmark \u984C\u5EAB\u79FB\u9664\u3002","info"),delete r.suiteAnswers[String(V.id)],Number(r.selectedBankItemId)===ce&&(r.selectedBankItemId=null),await C()}catch(F){L(F.message||"\u79FB\u9664\u5931\u6557\u3002","danger")}return}if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${ce}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await H.deleteQuestionBankItem(ce),L("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await g(),r.tab==="review"?(r.reviewDetail=null,await T()):await x()}catch(V){L(V.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(I==="revalidate"){try{let V=await H.revalidateQuestionBank();L(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${c(V.checked||0)} \u984C\uFF0C${c(V.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await g(),await x()}catch(V){L(V.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(I==="export"){try{let V=await H.exportQuestionBank({status:""});ht(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(V,null,2),"application/json;charset=utf-8")}catch(V){L(V.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(I==="import-json"){let V=e.querySelector("#qb-import-json");try{let xe=JSON.parse(String(V?.value||"").trim()),F=await H.importQuestionBank(xe);L(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${F.created}\u3001\u66F4\u65B0 ${F.updated}\u3001\u932F\u8AA4 ${(F.errors||[]).length}\u3002`,(F.errors||[]).length?"warn":"ok",8e3),V&&(V.value=""),await g(),await x()}catch(xe){L(xe.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(I==="prev"||I==="next"){r.offset=Math.max(0,r.offset+(I==="next"?r.limit:-r.limit)),await x();return}if(I==="suite-edit"){let V=r.suites.find(xe=>Number(xe.id)===ce);if(!V)return;r.editingSuite=V,r.suiteManageOpen=!0,C();return}if(I==="suite-new"){r.editingSuite=null,r.suiteManageOpen=!0,C();return}if(I==="suite-freeze"){try{await H.updateBenchmarkSuite(ce,{freeze:!0}),L("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),r.editingSuite=null,r.suiteManageOpen=!0,await C()}catch(V){L(V.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(I==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${ce}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await H.deleteBenchmarkSuite(ce),L("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),r.editingSuite=null,r.suiteAnswers={},r.suiteManageOpen=!0,await C()}catch(V){L(V.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(I==="decide"){let V=z.closest("form[data-qb-form='review']");V&&await ee(V,String(z.dataset.decision||""))}},Ae=async M=>{let O=M.target.closest("[data-qb-form]");if(!O)return;M.preventDefault();let I=O.dataset.qbForm;if(I==="create")await pe(O);else if(I==="ai-create")await se(O);else if(I==="filter"){let z=new FormData(O);r.filters={query:String(z.get("query")||"").trim(),status:String(z.get("status")||""),question_type:String(z.get("question_type")||""),difficulty:String(z.get("difficulty")||""),tags:z.getAll("tags").map(ce=>String(ce).trim()).filter(Boolean)},r.offset=0,await x()}else I==="suite"&&await fe(O)},le=async M=>{let O=M.target.closest?.("form[data-qb-form='filter'] select");if(O){O.form.requestSubmit();return}let I=M.target.closest?.("[data-qb-suite-select]");if(!I)return;let z=Number(I.value||0);!z||z===Number(r.selectedSuiteId)||await qe(z)},ue=M=>{let O=M.target;O?.matches?.(".qb-suite-manage")&&(r.suiteManageOpen=!!O.open)},we=M=>{let O=M.target.closest?.("[data-qb-action='open-tag-search']");O&&N(O.closest("[data-qb-tag-filter]"))},ge=M=>{let O=M.target.closest?.("[data-qb-tag-filter]");O&&(M.relatedTarget&&O.contains(M.relatedTarget)||D(O))},Fe=M=>{let O=M.target.closest?.("[data-qb-tag-search]");if(!O)return;let I=O.closest("[data-qb-tag-filter]");m&&window.clearTimeout(m),m=window.setTimeout(()=>{S(I,O.value)},160)},Ie=M=>{let O=M.target.closest?.("[data-qb-tag-search]");if(!O)return;let I=O.closest("[data-qb-tag-filter]");M.key==="Escape"?(M.preventDefault(),D(I),O.blur()):M.key==="Enter"?(M.preventDefault(),I?.querySelector("[data-qb-action='select-tag']")?.click()):M.key==="ArrowDown"&&(M.preventDefault(),I?.querySelector("[data-qb-action='select-tag']")?.focus())};e.addEventListener("click",ke),e.addEventListener("submit",Ae),e.addEventListener("change",le),e.addEventListener("toggle",ue,!0),e.addEventListener("mouseover",we),e.addEventListener("mouseout",ge),e.addEventListener("input",Fe),e.addEventListener("keydown",Ie);let Be=async()=>{await g(),r.tab==="create"?h():r.tab==="manage"?await x():r.tab==="suite"?await C({refreshAnswers:!0}):r.tab==="review"&&await T()};return g(),{show:U,refresh:Be,destroy(){m&&window.clearTimeout(m),e.removeEventListener("click",ke),e.removeEventListener("submit",Ae),e.removeEventListener("change",le),e.removeEventListener("toggle",ue,!0),e.removeEventListener("mouseover",we),e.removeEventListener("mouseout",ge),e.removeEventListener("input",Fe),e.removeEventListener("keydown",Ie)},getStats:()=>r.stats}}function Ys(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function Cr(e){return e==null?"\u2014":c(e)}function gc(e){return e.count?e.severity==="danger"?je("failed","\u9700\u8655\u7406"):e.severity==="warn"?je("warning","\u6CE8\u610F"):je("preview","\u63D0\u793A"):je("success","\u901A\u904E")}function fc(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function bc(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${fc(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${n(e.label)}</span>
      ${gc(e)}
    </div>
    <div class="quality-check-value">
      <strong>${c(t)}</strong>
      <span>\u7B46</span>
      <em>${n(Ys(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${n(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function Ks(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
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
  </div>`}function vc(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},r=t.postgres_diff,i=r==null?"\u2014":r===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${c(Math.abs(r))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${c(t.vector_indexed)} / ${c(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${u("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${c(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${c(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${u("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${Cr(t.postgres_judgments)}</div>
      <div class="metric-foot">${n(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${u("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${n(Ys(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${n(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${u("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${Cr(a.candidate_total)}</div>
      <div class="metric-foot">${c(a.candidate_archive_count)} / ${c(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function hc(e){return e.length?`<div class="table-wrap">
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
              <td class="cell-number">${n(Ys(t.match_rate))}</td>
              <td class="cell-number">${c(t.short_text_rows)}</td>
              <td class="cell-number">${c(s)}</td>
              <td class="cell-number">${c(t.duplicate_content_rows)}</td>
              <td class="cell-date">${n(bt(t.date_min))} \u2013 ${n(bt(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:We({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function $c(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],r=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=be(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${je(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${c(t.rows)} \u7B46 \xB7 ${c(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${re(e.scan_ms||0)} \xB7
          ${n(ye(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${u("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${_e({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(d=>n(d)).join("<br>")})}</div>`:""}
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
        <div class="summary-value">${n(Ys(t.match_rate))}</div>
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
      <div class="quality-checks">${a.map(bc).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${vc(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${c(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${hc(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${Ks("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${Ks("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${Ks("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${Ks("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function yc(e){e.innerHTML=`<section class="page data-page quality-page">
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
          ${u("refresh",15)}<span>\u91CD\u65B0\u6383\u63CF</span>
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
            <span class="status-tab-icon">${u("activity",15)}</span>
            <span class="status-tab-copy"><strong>\u54C1\u8CEA\u7E3D\u89BD</strong><small>DuckDB \u539F\u59CB\u8CC7\u6599\u8207\u8986\u84CB\u6AA2\u67E5</small></span>
            <span class="badge badge-neutral" id="quality-badge-overview">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="create">
            <span class="status-tab-icon">${u("plus",15)}</span>
            <span class="status-tab-copy"><strong>\u984C\u5EAB\u65B0\u589E</strong><small>Ollama \u81EA\u52D5\u51FA\u984C\u8207 JSON \u532F\u5165</small></span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="manage">
            <span class="status-tab-icon">${u("database",15)}</span>
            <span class="status-tab-copy"><strong>\u984C\u5EAB\u7BA1\u7406</strong><small>\u7248\u672C\u3001\u72C0\u614B\u3001\u6A19\u7C64\u8207\u522A\u9664</small></span>
            <span class="badge badge-neutral" id="quality-badge-manage">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="suite">
            <span class="status-tab-icon">${u("cube",15)}</span>
            <span class="status-tab-copy"><strong>Benchmark \u984C\u5EAB</strong><small>\u51CD\u7D50 suite \u8207 benchmark-ready \u984C\u76EE</small></span>
            <span class="badge badge-neutral" id="quality-badge-suite">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="review">
            <span class="status-tab-icon">${u("shield",15)}</span>
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),r=[...e.querySelectorAll("[data-quality-tab]")],i={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},o=null,l="overview",d=()=>{if(!o)return;t.innerHTML=$c(o),a.textContent=`DUCKDB \xB7 ${c(o.totals?.rows)} \u7B46 \xB7 ${re(o.scan_ms||0)}`;let h=e.querySelector("#quality-badge-overview");h&&(h.textContent=c(o.totals?.rows||0))},m=h=>{l=h==="overview"?"overview":h;for(let y of r){let S=y.dataset.qualityTab===l;y.classList.toggle("is-active",S),S?y.setAttribute("aria-current","page"):y.removeAttribute("aria-current")}for(let[y,S]of Object.entries(i))S&&(S.hidden=y!==l);l!=="overview"?a.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":o&&d()},v=Nr(e,{onNavigate:h=>m(h),onStats:h=>{let y=h||{},S=e.querySelector("#quality-badge-manage"),N=e.querySelector("#quality-badge-suite"),D=e.querySelector("#quality-badge-review");S&&(S.textContent=c(y.total||0)),N&&(N.textContent=c(y.benchmark_ready||0)),D&&(D.textContent=c((y.pending_review||0)+(y.changes_requested||0)))}}),w=h=>{m(h),h!=="overview"&&v.show(h)},$=async()=>{me(s,!0,"\u6383\u63CF\u4E2D\u2026");try{o=await H.quality(),d()}catch(h){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${_e({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:n(h.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",L("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{me(s,!1)}},g=async()=>{l==="overview"?await $():await v.refresh()};s.addEventListener("click",g),e.addEventListener("click",h=>{let y=h.target.closest("[data-quality-tab]");y&&w(y.dataset.qualityTab||"overview")}),t.addEventListener("click",h=>{!h.target.closest("[data-action='export-quality']")||!o||ht(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(o,null,2),"application/json;charset=utf-8")}),m("overview"),await $()}var Va={};Mt(Va,{render:()=>Kc});var Xs={};Mt(Xs,{render:()=>Ja});var Rr={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function Pr(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${n(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${n(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function wc(e){let t=e?.supports_chat,s=t===!0?"badge-ok":t===!1?"badge-danger":"badge-neutral",a=t===!0?"\u652F\u63F4 chat":t===!1?"\u4E0D\u652F\u63F4 chat":"\u672A\u6E2C\u8A66",r=(Array.isArray(e?.capabilities)?e.capabilities:[]).map(i=>`<span class="chip chip-mono">${n(i)}</span>`).join("");return`<div class="tests-llm-row">
    <div class="tests-llm-model">
      <strong class="mono">${n(e?.model||"\u2014")}</strong>
      <small>${n(e?.detail||"")}</small>
    </div>
    <div class="tests-llm-meta">
      <span class="badge ${s}">${a}</span>
      ${e?.tested_now?'<span class="badge badge-info">\u672C\u6B21\u65B0\u6E2C</span>':""}
      ${r}
      <span class="tests-llm-time">${e?.tested_at?`\u6E2C\u8A66\u65BC ${n(ye(e.tested_at))}`:"\u5C1A\u7121\u6E2C\u8A66\u7D00\u9304"}</span>
    </div>
  </div>`}function _c(e){let t=Array.isArray(e?.models)?e.models:[],s=e?.counts||{},a=Array.isArray(e?.failures)?e.failures:[];return{summary:e?`<span>Ollama <strong>${s.available??t.length}</strong> \u500B\u6A21\u578B</span>
      <span>\u652F\u63F4 chat <strong>${s.chat??0}</strong></span>
      <span>\u4E0D\u652F\u63F4 <strong>${s.unsupported??0}</strong></span>
      <span>\u672A\u6E2C\u8A66 <strong>${s.untested??0}</strong></span>
      <span>\u672C\u6B21\u65B0\u6E2C <strong>${(e.tested_now||[]).length}</strong></span>
      <span class="muted">${n(e.detail||"")}</span>`:"<span>\u6B63\u5728\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u2026</span>",list:t.length?t.map(wc).join(""):'<div class="tests-llm-empty">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u8ACB\u78BA\u8A8D Ollama \u5DF2\u555F\u52D5\u4E26\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66\u3002</div>',failures:a.length?`<div class="tests-llm-failures">${a.map(i=>`<span><strong class="mono">${n(i.model||"\u2014")}</strong> ${n(i.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function kc(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,total_ms:e.total_ms,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}:${a.duration_ms}`)}:null})}async function Ja(e,t,{embedded:s=!1}={}){let a=!1,r=!1,i={embedding:[],llm:[]},o=!1,l=null,d=!1,m=null,v=[],w="",$=null,g="",h=`<div class="page-actions">
      <span class="badge badge-neutral badge-mono" id="tests-mode-badge">\u8B80\u53D6\u4E2D</span>
      <button class="btn btn-secondary" type="button" id="tests-refresh">
        ${u("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
      </button>
    </div>`,y=s?`<div class="tests-embed-head">
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
    ${y}

    <div class="tests-grid">
      <section class="card tests-card tests-api-card" aria-labelledby="tests-api-title">
        <form class="api-dialog-form tests-api-form" id="tests-api-form" novalidate>
          <div class="api-dialog-head">
            <span class="api-dialog-icon" aria-hidden="true">${u("link",17)}</span>
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
              ${u("activity",14)}<span>\u6E2C\u8A66\u9023\u7DDA</span>
            </button>
            <span class="grow"></span>
            <button class="btn btn-ghost btn-sm" type="button" id="tests-api-reset">\u6062\u5FA9\u9810\u8A2D</button>
            <button class="btn btn-primary btn-sm" type="submit" id="tests-api-save">
              ${u("check",14)}<span>\u5132\u5B58\u4E26\u91CD\u65B0\u8F09\u5165</span>
            </button>
          </div>
        </form>
      </section>

      <section class="card tests-card" aria-labelledby="tests-mode-title">
        <div class="tests-card-head">
          <span class="tests-card-icon">${u("terminal",16)}</span>
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
            ${u("sparkles",13)}<span>\u524D\u5F80 RAG \u63D0\u554F</span>
          </a>
          <a class="btn btn-secondary btn-sm" href="#/performance">
            ${u("activity",13)}<span>\u6548\u80FD Flow</span>
          </a>
        </div>
        <div class="tests-status" id="tests-mode-status" role="status"></div>
      </section>
    </div>

    <section class="card tests-card tests-llm-card" aria-labelledby="tests-llm-title">
      <div class="tests-card-head">
        <span class="tests-card-icon">${u("brain",16)}</span>
        <div>
          <div class="tests-card-title" id="tests-llm-title">LLM \u670D\u52D9\u6E2C\u8A66</div>
          <div class="tests-card-copy">\u6AA2\u67E5 Ollama \u4E0A\u6BCF\u500B\u6A21\u578B\u662F\u5426\u652F\u63F4 chat\uFF0C\u4E26\u628A\u7D50\u679C\u5BEB\u5165\u80FD\u529B\u6E05\u55AE\uFF1B\u5DF2\u6709\u6E2C\u8A66\u7D00\u9304\u7684\u6A21\u578B\u4E0D\u6703\u91CD\u6E2C\u3002LLM \u6548\u80FD\u8A55\u4F30\u53EA\u6703\u7D0D\u5165\u652F\u63F4 chat \u7684\u6A21\u578B\u3002</div>
        </div>
      </div>
      <div class="tests-llm-head">
        <div class="tests-llm-summary" id="tests-llm-summary">\u6B63\u5728\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u2026</div>
        <button class="btn btn-primary btn-sm" type="button" id="tests-llm-test">
          ${u("activity",14)}<span>\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66</span>
        </button>
      </div>
      <div class="tests-llm-list" id="tests-llm-list"></div>
      <div id="tests-llm-failures"></div>
      <div class="tests-status" id="tests-llm-status" role="status"></div>
    </section>

    <div id="tests-flow"></div>
  </section>`;let S=e.querySelector("#tests-mode-badge"),N=e.querySelector("#tests-mode-toggle"),D=e.querySelector("#tests-mode-summary"),B=e.querySelector("#tests-mode-models"),Q=e.querySelector("#tests-mode-status"),ne=e.querySelector("#tests-api-form"),te=e.querySelector("#tests-api-input"),$e=e.querySelector("#tests-api-preview"),qe=e.querySelector("#tests-api-status"),J=e.querySelector("#tests-api-note"),R=e.querySelector("#tests-api-test"),x=e.querySelector("#tests-api-reset"),C=e.querySelector("#tests-api-save"),Z=e.querySelector("#tests-refresh"),ie=e.querySelector("#tests-flow"),T=e.querySelector("#tests-llm-summary"),U=e.querySelector("#tests-llm-list"),Y=e.querySelector("#tests-llm-failures"),pe=e.querySelector("#tests-llm-status"),se=e.querySelector("#tests-llm-test"),ee=(F,oe,Te="")=>{F&&(F.textContent=oe,F.className=`tests-status${Te?` is-${Te}`:""}`)},fe=(F,oe="")=>{qe&&(qe.textContent=F,qe.className=`api-dialog-status${oe?` is-${oe}`:""}`)},ke=()=>Et()==="query",Ae=()=>{let F=jt(te.value);return F||(window.location.protocol==="file:"?ra:"")},le=()=>{let F=Ae(),oe=Tt(),Te=Rr[Et()]||Et()||"\u540C\u6E90";$e.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${n(zt(oe))}</strong>${oe?`\uFF08${n(Te)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${n(tt("/api/health",F))}`},ue=()=>{let F=Et(),oe=`\u76EE\u524D\u4F86\u6E90\uFF1A${Rr[F]||F||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,Te="";F==="query"?(Te="is-warn",oe="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):Ls()?(Te="is-warn",oe="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(F==="file-default"||window.location.protocol==="file:")&&(oe="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),J.textContent=oe,J.className=`api-dialog-note${Te?` ${Te}`:""}`;let Oe=F==="query";C.disabled=Oe,x.disabled=Oe,te.readOnly=Oe},we=()=>{if(!ia(te.value))return fe("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),te.focus(),null;let F=Ae();return window.location.protocol==="https:"&&/^http:\/\//i.test(F)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(F)?(fe("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),te.focus(),null):F},ge=()=>{te.value=Tt(),le(),ue(),fe("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},Fe=()=>{let F=Array.isArray(i.embedding)?i.embedding.length:0,oe=Array.isArray(i.llm)?i.llm.length:0;if(S&&(S.textContent=o?"\u5207\u63DB\u4E2D\u2026":r?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",S.className=`badge badge-mono ${o?"badge-info":r?"badge-warn":"badge-neutral"}`),N){N.disabled=o,N.classList.toggle("is-on",r),N.classList.toggle("is-off",!r&&!o),N.classList.toggle("is-busy",o),N.setAttribute("aria-checked",r?"true":"false"),N.setAttribute("aria-busy",o?"true":"false"),N.setAttribute("aria-label",o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":r?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),N.title=o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":r?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let Te=N.querySelector(".header-power-label");Te&&(Te.textContent=o?"\u2026":r?"ON":"OFF")}D&&(D.textContent=r?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${F} \u500B embedding \u8207 ${oe} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),B&&(B.innerHTML=Pr("Embedding",i.embedding)+Pr("LLM",i.llm))},Ie=async()=>{try{let F=await H.testMode();if(a)return;r=!!F.enabled,i=F.models||{embedding:[],llm:[]},ee(Q,"")}catch(F){if(a)return;r=!1,i={embedding:[],llm:[]},ee(Q,F.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}a||Fe()},Be=async()=>{if(o)return;let F=!r;o=!0,Fe(),ee(Q,F?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let oe=await H.setTestMode(F);if(a)return;r=!!oe.enabled,i=oe.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:r,models:i}}));let Te=i.embedding?.length||0,Oe=i.llm?.length||0;ee(Q,r?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${Te} \u500B embedding \u8207 ${Oe} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),L(r?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${Te} \u500B embedding\u3001${Oe} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",r?"ok":"info",6e3),await V()}catch(oe){a||(ee(Q,oe.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),L(oe.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{o=!1,a||Fe()}},M=()=>{let F=_c(l);if(T&&(T.innerHTML=F.summary),U&&(U.innerHTML=F.list),Y&&(Y.innerHTML=F.failures),se){se.disabled=d,se.setAttribute("aria-busy",d?"true":"false");let oe=se.querySelector("span");oe&&(oe.textContent=d?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66")}},O=async()=>{try{let F=await H.llmModels();if(a)return;l=F,ee(pe,"")}catch(F){if(a)return;l=null,ee(pe,F.message||"\u7121\u6CD5\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u3002","error")}a||M()},I=async()=>{if(!d){d=!0,M(),ee(pe,"\u6B63\u5728\u6AA2\u67E5 Ollama \u6A21\u578B\u8207 chat \u80FD\u529B\u2026");try{let F=await H.testLlmModels();if(a)return;l=F;let oe=F.tested_now?.length||0,Te=F.chat_models?.length||0,Oe=F.failures?.length||0;ee(pe,`${oe?`\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u672C\u6B21\u65B0\u6E2C ${oe} \u500B\u6A21\u578B`:"\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u6C92\u6709\u65B0\u6A21\u578B"}\uFF0C\u76EE\u524D ${Te} \u500B\u6A21\u578B\u652F\u63F4 chat${Oe?`\uFF1B${Oe} \u500B\u6A21\u578B\u66AB\u6642\u7121\u6CD5\u5224\u5B9A\uFF0C\u4E0B\u6B21\u6703\u91CD\u8A66`:""}\u3002`,Oe?"warn":"ok"),L(oe?`LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u65B0\u589E ${oe} \u7B46\u80FD\u529B\u7D00\u9304\u3002`:"LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u6C92\u6709\u65B0\u6A21\u578B\u9700\u8981\u6E2C\u8A66\u3002",Oe?"warn":"ok",5e3),await Ie()}catch(F){a||(ee(pe,F.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),L(F.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{d=!1,a||M()}}},z=()=>{if(!ie)return;let F=kc(m,v,w);F!==g&&(g=F,ie.innerHTML=os(m,v,w))},ce=async()=>{try{let F=await H.testRuns(30);if(a)return;v=Array.isArray(F.runs)?F.runs:[]}catch{if(a)return;v=[]}},V=async()=>{try{let F=w?await H.testRun(w):await H.testRunCurrent();if(a)return;m=F.run||null,!w&&m&&m.status!=="running"&&!v.some(oe=>oe.run_id===m.run_id)&&await ce()}catch{if(a)return;m=null}a||z()};te?.addEventListener("input",()=>{le(),fe("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),R?.addEventListener("click",async()=>{let F=we();if(F!==null){me(R,!0,"\u6E2C\u8A66\u4E2D\u2026"),fe(`\u6B63\u5728\u9023\u7DDA\u5230 ${zt(F)||"\u540C\u6E90"}\u2026`);try{let oe=await sn(F);if(a)return;fe(`\u9023\u7DDA\u6210\u529F \xB7 v${oe.version} \xB7 ${oe.duration_ms} ms \xB7 GET ${tt("/api/health",F)}`,"ok")}catch(oe){a||fe(oe.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{a||me(R,!1)}}}),ne?.addEventListener("submit",F=>{if(F.preventDefault(),ke())return;let oe=we();oe!==null&&(da(oe),L(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${zt(oe)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),x?.addEventListener("click",()=>{ke()||(da(""),L("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),N?.addEventListener("click",Be),se?.addEventListener("click",I),ie?.addEventListener("change",async F=>{F.target.id==="test-run-select"&&(w=String(F.target.value||""),await V())}),ie?.addEventListener("click",async F=>{F.target.closest("#test-flow-refresh")&&(w="",await ce(),await V())}),Z?.addEventListener("click",async()=>{me(Z,!0,"\u66F4\u65B0\u4E2D\u2026"),ge(),await Promise.allSettled([Ie(),ce(),O()]),a||await V(),a||(me(Z,!1),L("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let xe=F=>{r=!!F.detail?.enabled,i=F.detail?.models||{embedding:[],llm:[]},Fe()};return window.addEventListener("judgment:test-mode",xe),ge(),Fe(),M(),await Promise.allSettled([Ie(),ce(),O()]),await V(),$=window.setInterval(async()=>{a||document.hidden||w||await V()},2500),!s&&typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{a=!0,$&&window.clearInterval($),window.removeEventListener("judgment:test-mode",xe)}}var Ir={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var Dr={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},Fr=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"tests",label:"\u7CFB\u7D71\u6E2C\u8A66",hint:"API\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u6A21\u578B Flow",icon:"terminal"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"local-model",label:"Model Provider",hint:"Ollama \u4E3B\u6A5F\u8207\u6A21\u578B",icon:"server"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 Data \u2192 AI",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}];function Sc(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:vt(e).label,tone:vt(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function xc(e){let t=vt(e.status),s=Ir[e.kind]||Ir.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${c(e.latency_ms)} ms</span>`;return`<article class="service-card">
    <div class="service-top">
      <span class="service-icon">${u(s,14)}</span>
      <span class="service-name" title="${n(e.name)}">${n(e.name)}</span>
      <span class="service-kind">${n(e.kind||"")}</span>
    </div>
    <div class="service-status">
      <span class="status-dot ${t.tone==="ok"?"is-ok":t.tone==="warn"?"is-warn":t.tone==="danger"?"is-danger":"is-idle"}" aria-hidden="true"></span>
      ${n(t.label)}
      ${a}
    </div>
    <p class="service-detail" title="${n(e.detail||"")}">${n(e.detail||"")}</p>
  </article>`}function qc(e,t){return`<div class="arch-node ${e?"":"is-muted"}" ${e?"":'title="\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"'}>${n(t)}</div>`}function Ac(e,t){if(e==="IndexedDB")return dn();let a={PostgreSQL:"postgres",Parquet:"parquet",Qdrant:"qdrant",Embedding:"embedding",Retriever:"rag",Reranker:"reranker","RAG Engine":"rag",LLM:"llm"}[e];return a?t.find(i=>i.id===a)?.status==="operational":!0}function Lc(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>qc(Ac(l,t),l)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${n(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),r=[];return a.forEach((i,o)=>{o&&r.push(`<div class="arch-arrow" aria-hidden="true">${u("arrowRight",15)}</div>`),r.push(i)}),`<div class="arch-flow">${r.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${u("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>`}function Mc(e){return!Array.isArray(e)||!e.length?'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>':`<div class="endpoint-list">
    ${e.map(t=>`<div class="endpoint-row">
          <span class="endpoint-method">${n(t.method)}</span>
          <span class="endpoint-path" title="${n(t.path)}">${n(t.path)}</span>
          <span class="endpoint-label">${n(t.label||"")}</span>
        </div>`).join("")}
  </div>`}function Re(e,t){return`<div class="detail-row">
    <span class="detail-label">${n(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function jc(e){return e?`<div class="detail-list">
    ${Re("\u7248\u672C ID",`<strong>#${c(e.id)}</strong>`)}
    ${Re("\u8CC7\u6599\u985E\u578B",je("operational",e.source_type==="law"?"\u6CD5\u898F":"\u547D\u4EE4"))}
    ${Re("\u4F86\u6E90\u66F4\u65B0\u65E5",`<strong>${n(e.update_date||"\u2014")}</strong>`)}
    ${Re("\u6CD5\u898F / \u689D\u6587",`<strong>${c(e.law_count)} / ${c(e.article_count)}</strong>`)}
    ${Re("\u4E0B\u8F09\u6642\u9593",`<span class="mono">${ye(e.downloaded_at)}</span>`)}
    ${Re("Parquet",`<code title="${n(e.parquet_path||"")}">${n(e.parquet_path||"\u2014")}</code>`)}
  </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}function Tc(e){if(!Array.isArray(e)||!e.length)return We({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${n(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${js(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function Ec(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=new Map(s.map(y=>[y.id,y])),r=a.get("qdrant"),i=a.get("embedding"),o=a.get("rag"),l=a.get("llm"),d=Number(t.judgment_indexed_count||0),m=Number(t.judgment_count||0),v=m?(d/m*100).toFixed(1):"0.0",w=t.judgment_vector_points===null||t.judgment_vector_points===void 0?"\u2014":c(t.judgment_vector_points),$=Number(t.judgment_index_remaining||0),g=o?.status==="operational"?"RAG \u5C31\u7DD2":o?.status==="not_configured"?"\u672A\u8A2D\u5B9A":o?.status==="degraded"?"\u964D\u7D1A":"\u672A\u77E5",h=[["cube","Qdrant \u5411\u91CF\u7D22\u5F15",r],["layers",`Embedding\uFF08${t.judgment_vector_model||"\u2014"}\uFF09`,i],["brain","RAG \u56DE\u7B54\u7BA1\u7DDA",o],["sparkles","LLM \u6A21\u578B",l]];return`<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${u("database",14)}RAG \u8CC7\u6599\u73FE\u6CC1</span>
      ${je(o?.status,g)}
    </div>
    <div class="side-card-body">
      <div class="mini-stats">
        <div class="mini-stat">
          <div class="mini-stat-value">${c(m)}</div>
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
        ${h.map(([y,S,N])=>`<div class="side-status-row">
              <span>${u(y,13)}${n(S)}</span>
              ${je(N?.status,N?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
            </div>`).join("")}
      </div>
      <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
        Collection\uFF1A${n(t.judgment_vector_collection||"\u2014")} \xB7
        ${w} points \xB7 \u5269\u9918 ${c($)} \u7B46\u5F85\u7D22\u5F15
      </div>
    </div>
    <div class="side-card-foot">
      PostgreSQL \u5224\u6C7A\u6587\u4EF6\u3001Qdrant \u5411\u91CF\u7D22\u5F15\u8207 Ollama \u6A21\u578B\u72C0\u614B\u7686\u70BA\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u5C31\u7DD2\u6642\u6703\u660E\u78BA\u964D\u7D1A\u3002
    </div>
  </section>`}function Nc(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=Sc(e.status),r=s.find(m=>m.id==="qdrant"),i=s.find(m=>m.id==="rag"),o=s.find(m=>m.id==="llm"),l=Et(),d=Dr[l]||l;return`<section class="status-hero">
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
          <span>${u("clock",11)} \u6AA2\u67E5\u6642\u9593 ${ye(e.checked_at)} \xB7 ${n(ss(e.checked_at))}</span>
          <span>${u("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${u("database",11)} ${c(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${u("layers",11)} ${c(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${n(d)}">${u("link",11)} ${n(zt())}</span>
        </div>
      </div>
    </section>

    <div class="service-grid">${s.map(xc).join("")}</div>

    ${Ec(e)}

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

    ${r?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${_e({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${n(r?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${n(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${n(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}`}function Cc(e){let t=Array.isArray(e.services)?e.services:[],s=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Data \u2192 Intelligence</div>
      </div>
      <span class="badge badge-neutral badge-mono">${c((s.flow||[]).length)} layers</span>
    </div>
    ${Lc(s,t)}
  </div>`}function Rc(e){let t=Et(),s=Dr[t]||t,a=tt("/api/docs"),r=tt("/api/openapi.json");return`<div class="status-columns is-single">
    <section class="card">
      <div class="side-card-head">
        <span class="side-card-title">${u("terminal",14)}API \u7AEF\u9EDE</span>
        <a href="${n(a)}" target="_blank" rel="noopener noreferrer" class="chip"
          >OpenAPI ${u("external",11)}</a>
      </div>
      ${Mc(e.endpoints)}
      <div class="side-card-foot">
        \u76EE\u524D API Base\uFF1A<code>${n(zt())}</code>\uFF08${n(s)}\uFF09\u3002\u4E92\u52D5\u5F0F API \u6587\u4EF6\u4F4D\u65BC <a href="${n(a)}" target="_blank" rel="noopener noreferrer"><code>${n(a)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${n(r)}" target="_blank" rel="noopener noreferrer"><code>${n(r)}</code></a>\u3002
      </div>
    </section>
  </div>`}function Pc(e){let t=e.data||{},s=Number(t.judgment_indexed_count||0),a=Number(t.judgment_count||0),r=a?(s/a*100).toFixed(1):"0.0",i=Number(t.judgment_index_remaining||0);return`<div class="status-summary">
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
          <span class="side-card-title">${u("layers",14)}\u6700\u65B0\u8CC7\u6599\u7248\u672C</span>
          ${je("operational","Parquet")}
        </div>
        ${jc(t.last_version)}
        <div class="side-card-foot">
          \u539F\u59CB Parquet \u5408\u8A08 ${be(t.parquet_bytes)}\uFF1BPostgreSQL \u4FDD\u5B58 metadata \u8207\u7248\u672C\u72C0\u614B\u3002
        </div>
      </section>
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${u("database",14)}\u8CC7\u6599\u96C6\u7D71\u8A08</span>
          <span class="badge badge-neutral badge-mono">${c(t.parquet_files)} FILES</span>
        </div>
        <div class="detail-list">
          ${Re("\u73FE\u884C\u6CD5\u898F",`<strong>${c(t.law_count)}</strong>`)}
          ${Re("\u73FE\u884C\u547D\u4EE4",`<strong>${c(t.order_count)}</strong>`)}
          ${Re("\u689D\u6587\u7E3D\u6578",`<strong>${c(t.article_count)}</strong>`)}
          ${Re("\u539F\u59CB Parquet",`<strong>${be(t.parquet_bytes)}</strong>`)}
          ${Re("\u5224\u6C7A\u6587\u4EF6",`<strong>${c(t.judgment_count)}</strong>`)}
          ${Re("\u5411\u91CF\u7D22\u5F15",`<strong>${c(t.judgment_indexed_count)}</strong> / ${c(t.judgment_count)}\uFF08${c(t.judgment_vector_points)} points\uFF09`)}
          ${Re("\u7D22\u5F15\u8986\u84CB",`<strong>${r}%</strong> \xB7 \u5269\u9918 ${c(i)} \u7B46`)}
          ${Re("\u7D22\u5F15\u7248\u672C",`<strong>#${c(t.judgment_vector_version_id)}</strong> \xB7 ${n(t.judgment_vector_version_status||"legacy")}`)}
          ${Re("Alias",`<code>${n(t.judgment_vector_alias||"\u2014")}</code> \u2192 <code>${n(t.judgment_vector_collection||"\u2014")}</code>`)}
          ${Re("\u7D22\u5F15\u6A21\u578B",`<code>${n(t.judgment_vector_model||"\u2014")}</code>`)}
          ${Re("\u6700\u8FD1\u7D22\u5F15",`<span class="mono">${ye(t.judgment_indexed_at)}</span>`)}
        </div>
      </section>
    </div>`}function Ic(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${u("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${c(t.run_count)} TOTAL</span>
    </div>
    ${Tc(e.recent_runs)}
  </section>`}function Oc(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function Hr(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function Wt(e,t,s,a,r){let i=Oc(r);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${u(t,14)}${n(e)}</span>
      <strong>${n(s)}</strong>
    </div>
    ${Hr(r,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function Bc(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${u("layers",14)}Docker</span>
        ${je("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${n(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,d=o.service?0:1;return l-d||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${n(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${n(i.service)}</span>`:""}</td>
        <td>${je(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
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
      <span class="side-card-title">${u("layers",14)}Docker \u5BB9\u5668\u4F7F\u7528\u8CC7\u6E90</span>
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
  </section>`}function Dc(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",r=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${Re("\u8CC7\u6599\u5EAB",`<code>${n(s.database||"\u2014")}</code>`)}
           ${Re("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${be(s.storage_bytes)}</strong>`)}
           ${Re("Docker volume",`<strong>${be(s.volume_bytes)}</strong>${s.volume_name?` <code>${n(s.volume_name)}</code>`:""}`)}
           ${Re("\u9023\u7DDA\u6578",`<strong>${c(s.connections)}</strong>`)}`:`${Re("Collection",`<code>${n(s.collection||"\u2014")}</code>`)}
           ${Re("Docker volume",`<strong>${be(s.volume_bytes)}</strong>${s.volume_name?` <code>${n(s.volume_name)}</code>`:""}`)}
           ${Re("\u5411\u91CF\u9EDE\u6578",`<strong>${c(s.points_count)}</strong>`)}
           ${Re("Collections",`<strong>${c(s.collections)}</strong>`)}
           ${Re("Segments",`<strong>${c(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${n(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${n(s.kind||"")}</div>
          </div>
          ${je(i)}
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
      </article>`}).join("")}</div>`}function cs(e,t,s,a){let r=Number(t)||0,i=a?r/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${n(e)}</span>
      <strong>${be(r)}</strong>
    </div>
    ${Hr(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function Fc(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},r=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},d=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${u("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${be(d)}</span>
    </div>
    <div class="storage-list">
      ${cs("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${n(s.frontend_path||"\u2014")}</span>`,d)}
      ${cs("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${n(s.backend_path||"\u2014")}</span>`,d)}
      ${cs("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",r.layers_bytes,`Images ${be(r.images_bytes)} \xB7 Containers ${be(r.containers_bytes)} \xB7 Build cache ${be(r.build_cache_bytes)}`,d)}
      ${cs("PostgreSQL volume",o.size_bytes,`<span class="mono">${n(o.name||"\u2014")}</span>`,d)}
      ${cs("Qdrant volume",l.size_bytes,`<span class="mono">${n(l.name||"\u2014")}</span>`,d)}
      ${cs("Parquet",a.total_bytes,`\u6CD5\u898F ${be(a.law_bytes)} \xB7 \u5224\u6C7A ${be(a.judgment_bytes)}`,d)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${be(d)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function Hc(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},r=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),d=Array.isArray(e.disk)?e.disk:[],m=d[0]||{},v=Number(o.total_bytes||m.total||0),w=v?l/v*100:0,$=[s.load_1,s.load_5,s.load_15].map(y=>y??"\u2014").join(" / "),g=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":re(Number(t.uptime_seconds)*1e3),h=[m.label?Wt("HDD \u5DF2\u4F7F\u7528","database",`${c(m.percent)}%`,`${be(m.used)} / ${be(m.total)} \xB7 \u5269\u9918 ${be(m.free)}<br><span class="mono">${n(m.path||"")}</span>`,m.percent):"",l?Wt("Judgment \u5143\u4EF6\u5408\u8A08","layers",be(l),`\u7D04\u5360 HDD ${c(w)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,w):"",...d.slice(1).map(y=>Wt(`\u786C\u789F \xB7 ${y.label}`,"layers",`${c(y.percent)}%`,`${be(y.used)} / ${be(y.total)} \xB7 \u5269\u9918 ${be(y.free)}<br><span class="mono">${n(y.path||"")}</span>`,y.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${ye(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${Wt("CPU \u4F7F\u7528\u7387","cpu",`${c(s.percent)}%`,`${c(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${c(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${n($)}`,s.percent)}
      ${Wt("\u8A18\u61B6\u9AD4","server",`${c(a.percent)}%`,`${be(a.used)} / ${be(a.total)} \xB7 \u53EF\u7528 ${be(a.available)}`,a.percent)}
      ${Wt("Swap","layers",`${c(r.percent)}%`,`${be(r.used)} / ${be(r.total)}`,r.percent)}
      ${Wt("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${c(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${n(g)}<br>${n(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${h||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${Fc(e)}
    ${Bc(e)}
    ${Dc(e)}`}function Or(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function zc(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SYSTEM RESOURCE USAGE</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${_e({tone:"danger",title:"\u8CC7\u6E90 API \u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-resources-retry">
          ${u("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Uc(e){return e.status==="operational"?{label:"\u5DF2\u9023\u7DDA",badge:"badge-ok"}:{label:"\u7121\u6CD5\u9023\u7DDA",badge:"badge-danger"}}function Qc(e,t){let s=Uc(e),a=Array.isArray(e.models)?e.models:[],r=a.length?a.map(i=>{let o=String(i.name||""),l=e.chat_model===o,d=e.embedding_model===o,m=i.size?be(i.size):"",v=i.modified_at?ye(i.modified_at):"",w=new Set((i.capabilities||[]).map(g=>String(g||"").toLowerCase())),$=[];return i.supports_chat===!0&&$.push(["Chat","badge-ok"]),w.has("embedding")&&$.push(["Embedding","badge-info"]),w.has("vision")&&$.push(["Vision","badge-neutral"]),w.has("tools")&&$.push(["Tools","badge-neutral"]),w.has("thinking")&&$.push(["Thinking","badge-neutral"]),w.has("speech")&&$.push(["Speech","badge-warn"]),i.is_reranker&&$.push(["Reranker","badge-neutral"]),$.length||$.push([i.capability_status==="untested"?"\u672A\u6E2C\u8A66":"\u7121 chat \u80FD\u529B","badge-neutral"]),`<div class="ollama-model-row">
            <div class="ollama-model-main">
              <strong>${n(o)}</strong>
              <span class="ollama-model-meta">${[m,v].filter(Boolean).map(g=>n(g)).join(" \xB7 ")||"\u2014"}</span>
              <div class="ollama-model-capabilities">${$.map(([g,h])=>`<span class="badge ${h}">${n(g)}</span>`).join("")}</div>
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
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="edit-host" data-id="${e.id}">${u("edit",13)}<span>\u7DE8\u8F2F</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="delete-host" data-id="${e.id}">${u("trash",13)}<span>\u522A\u9664</span></button>
      </div>
    </div>
    <div class="ollama-model-list">${r}</div>
  </article>`}function Gc(e,t,s,a){if(s)return`<div class="report-card">
      ${_e({tone:"danger",title:"Model Provider \u8B80\u53D6\u5931\u6557",text:n(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${u("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let r=e||{hosts:[],active_host_id:null},i=Array.isArray(r.hosts)?r.hosts:[],o=a?i.find(m=>Number(m.id)===Number(a)):null,l=o?o.base_url.replace(new RegExp(`:${o.port}$`),""):"http://127.0.0.1",d=o?"\u5132\u5B58\u8B8A\u66F4":"\u65B0\u589E\u4E3B\u6A5F";return`<div class="report-card ollama-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">MODEL PROVIDER</div>
        <div class="report-title">Ollama \u4E3B\u6A5F\u8207\u6A21\u578B</div>
        <div class="report-sub">\u7BA1\u7406\u53EF\u7528\u7684 Ollama \u9023\u7DDA\u3001\u76EE\u524D\u4F7F\u7528\u7684\u4E3B\u6A5F\uFF0C\u4EE5\u53CA\u4E3B\u6A5F\u4E0A\u7684\u804A\u5929\uFF0F\u5D4C\u5165\u6A21\u578B\u3002\u6BCF\u6B21\u958B\u555F\u6B64\u9801\u90FD\u6703\u91CD\u65B0\u53D6\u5F97\u4E3B\u6A5F\u8207\u6A21\u578B\u5217\u8868\uFF1Bembedding \u4E3B\u6A5F\u7684\u512A\u5148\u9806\u5E8F\u53EF\u5230\u300C\u8CC7\u6599\u8655\u7406\u300D\u7684\u57F7\u884C\u8CC7\u8A0A\u5361\u7247\u62D6\u79FB\u8ABF\u6574\u3002</div>
      </div>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="check-capabilities">${u("shield",14)}<span>\u6AA2\u67E5\u6A21\u578B\u80FD\u529B</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${u("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span></button>
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
          <button class="btn btn-primary btn-sm" type="submit">${u("check",13)}<span>${d}</span></button>
          ${o?'<button class="btn btn-ghost btn-sm" type="button" data-ollama-action="cancel-host-edit">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
        </div>
      </form>
      ${t?'<div class="ollama-loading"><span class="spinner"></span><span>\u8B80\u53D6 Ollama \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span></div>':i.length?`<div class="ollama-host-list">${i.map(m=>Qc(m,a)).join("")}</div>`:We({iconName:"server",title:"\u5C1A\u672A\u8A2D\u5B9A Ollama \u4E3B\u6A5F",text:"\u8ACB\u5728\u4E0A\u65B9\u8F38\u5165\u7DB2\u5740\u8207 Port \u65B0\u589E\uFF0C\u6216\u4F7F\u7528 .env \u7684\u9810\u8A2D\u9023\u7DDA\u3002"})}
      <p class="report-sub" style="margin-top:12px">\u8A2D\u70BA\u804A\u5929\u6216\u5D4C\u5165\u6A21\u578B\u5F8C\uFF0C\u7CFB\u7D71\u6703\u4F7F\u7528\u76EE\u524D\u4E3B\u6A5F\u7684\u5C0D\u61C9\u6A21\u578B\u57F7\u884C AI \u51FA\u984C\u8207 RAG\uFF1B\u672A\u8A2D\u5B9A\u6642\u6CBF\u7528 .env \u7684 LLM_MODEL\uFF0FEMBEDDING_MODEL\u3002</p>
    </div>
  </div>`}function Jc(e,t,s){let a=e?.data||{},r=e?vt(e.status):null,i=s?vt(s.status):null,o={overview:r?`<span class="badge ${r.tone==="ok"?"badge-ok":r.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${n(r.label)}</span>`:"",resources:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${n(i.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${c(a.version_count)}</span>`,tests:'<span class="badge badge-neutral badge-mono">TEST</span>',"local-model":'<span class="badge badge-neutral badge-mono">OLLAMA</span>',runs:`<span class="badge badge-neutral badge-mono">${c(a.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${Fr.map(l=>{let d=l.id===t;return`<button class="status-tab${d?" is-active":""}" type="button"
          data-status-tab="${l.id}" ${d?'aria-current="page"':""}>
          <span class="status-tab-icon">${u(l.icon,15)}</span>
          <span class="status-tab-copy">
            <strong>${n(l.label)}</strong>
            <small>${n(l.hint)}</small>
          </span>
          ${o[l.id]||""}
        </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u6AA2\u67E5\u6642\u9593</span>
      <span class="mono">${n(e?ye(e.checked_at):"\u2014")}</span>
    </div>`}function Vc(e,t,s,a,r,i){if(e==="resources")return s?Hc(s):a?Or():r?zc(r):Or();if(e==="local-model"){let o=i||{},l=!!o.loading||!o.hosts&&!o.error;return Gc(o.hosts||null,l,o.error||null,o.editingId||null)}return e==="architecture"?Cc(t):e==="api"?Rc(t):e==="data"?Pc(t):e==="runs"?Ic(t):Nc(t)}function Wc(){return`<div class="status-hero">
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
    </div>`}function Br(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u5FEB\u53D6\u6216\u63A8\u6E2C\u7684\u670D\u52D9\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${_e({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${u("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function Kc(e,t){let s=!1,a=null,r=null,i="overview",o=null,l=!1,d=null,m=null,v=!1,w=null,$=null,g=!1,h=!1,y=null,S=0,N="",D="";e.innerHTML=`<section class="page status-page">
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
          ${u("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
      <section class="status-panel" id="status-content">${Wc()}</section>
    </div>
  </section>`;let B=e.querySelector("#status-nav"),Q=e.querySelector("#status-content"),ne=e.querySelector("#refresh-status"),te=e.querySelector("#auto-refresh"),$e=()=>{if(S+=1,typeof y=="function")try{y()}catch{}y=null,g=!1,h=!1},qe=async()=>{let T=++S;h=!0,D="",Q.innerHTML="";try{let U=await Ja(Q,{setTitle:()=>{}},{embedded:!0});if(T!==S||i!=="tests"){typeof U=="function"&&U();return}y=typeof U=="function"?U:null,g=!0}catch(U){T===S&&i==="tests"&&(Q.innerHTML=Br(U))}finally{T===S&&(h=!1)}},J=()=>{if(!r)return;let T=Jc(r,i,o);if(T!==N&&(B.innerHTML=T,N=T),i==="tests"){!g&&!h&&qe();return}$e();let U=Vc(i,r,o,l,d,{hosts:m,loading:v,error:w,editingId:$});U!==D&&(Q.innerHTML=U,D=U)},R=async({quiet:T=!1}={})=>{if(!l){l=!0,d=null,i==="resources"&&!o&&J();try{let U=await H.systemUsage();if(s)return;o=U}catch(U){if(s)return;d=U,T||L(U.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{s||(l=!1,i==="resources"&&J())}}},x=async({quiet:T=!1}={})=>{if(!v){v=!0,w=null,i==="local-model"&&!m&&J();try{let U=await H.ollamaHosts();if(s)return;m=U}catch(U){if(s)return;w=U,T||L(U.message||"\u7121\u6CD5\u53D6\u5F97 Ollama \u4E3B\u6A5F\u3002","danger")}finally{s||(v=!1,i==="local-model"&&J())}}},C=async()=>{await x({quiet:!0}),await Z({quiet:!0})},Z=async({quiet:T=!1}={})=>{T||(ne.disabled=!0,me(ne,!0,"\u6AA2\u67E5\u4E2D\u2026"));try{let U=await H.status();if(s)return;r=U,J(),T||L("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(U){if(s)return;i!=="tests"&&(D="",Q.innerHTML=Br(U)),T||L(U.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(ne.disabled=!1,me(ne,!1))}},ie=async({quiet:T=!1}={})=>{if(await Z({quiet:T}),i==="resources"&&await R({quiet:T}),i==="local-model"&&await x({quiet:T}),!T&&i==="tests"){let U=Q.querySelector("#tests-refresh");U&&U.click()}};return B.addEventListener("click",T=>{let U=T.target.closest("[data-status-tab]");if(!U)return;let Y=U.dataset.statusTab;Fr.some(pe=>pe.id===Y)&&(i=Y,J(),i==="resources"&&!o&&!l&&R(),i==="local-model"&&x())}),Q.addEventListener("click",T=>{T.target.closest("#status-retry")&&Z(),T.target.closest("#status-resources-retry")&&R()}),Q.addEventListener("click",async T=>{let U=T.target.closest("[data-ollama-action]");if(!U)return;let Y=U.dataset.ollamaAction,pe=Number(U.dataset.id||0);if(Y==="refresh-hosts"){await x();return}if(Y==="edit-host"){$=pe,J(),e.querySelector(".ollama-host-form")?.scrollIntoView({behavior:"smooth",block:"center"});return}if(Y==="cancel-host-edit"){$=null,J();return}if(Y==="delete-host"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 Ollama \u4E3B\u6A5F #${pe}\uFF1F`))return;try{await H.deleteOllamaHost(pe),Number($)===pe&&($=null),L("Ollama \u4E3B\u6A5F\u5DF2\u522A\u9664\u3002","info"),await C()}catch(se){L(se.message||"\u522A\u9664\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(Y==="activate-host"){try{await H.activateOllamaHost(pe),L("\u5DF2\u5207\u63DB\u4F7F\u7528\u7684 Ollama \u4E3B\u6A5F\u3002","ok"),await C()}catch(se){L(se.message||"\u5207\u63DB\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(Y==="deactivate-host"){try{await H.deactivateOllamaHosts(),L("\u5DF2\u505C\u7528\u6307\u5B9A\u7684 Ollama \u4E3B\u6A5F\uFF0C\u5C07\u6CBF\u7528 .env \u8A2D\u5B9A\u3002","info"),await C()}catch(se){L(se.message||"\u505C\u7528\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(Y==="check-capabilities"){me(U,!0,"\u6AA2\u67E5\u4E2D\u2026");try{await H.checkOllamaCapabilities(),L("\u5DF2\u66F4\u65B0\u6240\u6709\u4E3B\u6A5F\u7684\u6A21\u578B\u80FD\u529B\u3002","ok",4e3),await C()}catch(se){L(se.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u80FD\u529B\u3002","danger",7e3)}finally{me(U,!1)}return}if(Y==="select-model"||Y==="clear-model"){let se=String(U.dataset.model||""),ee=String(U.dataset.role||"");try{Y==="select-model"?(await H.selectOllamaModel(pe,{model:se,role:ee}),L(`\u5DF2\u8A2D\u5B9A ${ee==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\uFF1A${se}`,"ok")):(await H.clearOllamaModel(pe,{model:se,role:ee}),L(`\u5DF2\u53D6\u6D88 ${ee==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\u3002`,"info")),await C()}catch(fe){L(fe.message||"\u6A21\u578B\u8A2D\u5B9A\u5931\u6557\u3002","danger")}}}),Q.addEventListener("submit",async T=>{let U=T.target.closest("form[data-ollama-form='host']");if(!U)return;T.preventDefault();let Y=new FormData(U),pe=Number(Y.get("host_id")||0),se={name:String(Y.get("name")||"").trim(),url:String(Y.get("url")||"").trim(),port:Number(Y.get("port")||11434)};try{pe?(await H.updateOllamaHost(pe,se),L("Ollama \u4E3B\u6A5F\u5DF2\u66F4\u65B0\u3002","ok")):(await H.addOllamaHost(se),L("Ollama \u4E3B\u6A5F\u5DF2\u65B0\u589E\u3002","ok")),$=null,await C()}catch(ee){let fe=ee.detail||ee.payload?.detail,ke=fe?.errors?.join(" \xB7 ")||fe?.message||ee.message||"\u5132\u5B58\u4E3B\u6A5F\u5931\u6557\u3002";L(ke,"danger",8e3)}}),ne.addEventListener("click",()=>ie()),te.addEventListener("change",()=>{a&&(window.clearInterval(a),a=null),te.checked&&(a=window.setInterval(()=>ie({quiet:!0}),3e4),L("\u5DF2\u555F\u7528\u6BCF 30 \u79D2\u81EA\u52D5\u66F4\u65B0\u3002","info",2200))}),await Z({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,$e(),a&&window.clearInterval(a)}}var zr="home",ta={home:{page:fa,title:"Judgment RAG Console \xB7 \u6CD5\u898F\u8207\u5224\u6C7A\u6AA2\u7D22"},rag:{page:Ra,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:qa,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:Ga,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:Ea,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:Fa,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:Va,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:Xs,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"}},Wa=document.getElementById("app-main"),Zs=null,ea=0;function Ya(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||zr;return Object.prototype.hasOwnProperty.call(ta,t)?t:zr}function Yc(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function Xc(e){return`<section class="page">
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
          <span class="notice-icon" aria-hidden="true">${u("alert",12)}</span>
          <div class="notice-body">
            <strong>\u7121\u6CD5\u5EFA\u7ACB\u9801\u9762</strong>
            <p>${n(e.message||"\u672A\u77E5\u932F\u8AA4")}</p>
          </div>
        </div>
        <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
          <button class="btn btn-secondary btn-sm" type="button" id="route-retry">
            ${u("refresh",14)}<span>\u91CD\u65B0\u8F09\u5165</span>
          </button>
        </div>
      </div>
    </div>
  </section>`}async function Ka(){let e=Ya(),t=++ea;if(Yc(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof Zs=="function"){try{Zs()}catch{}Zs=null}document.title=ta[e].title;let s={route:e,navigate(a){ta[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===ea&&a&&(document.title=a)}};try{let a=ta[e].page.render(Wa,s);window.scrollTo({top:0,behavior:"auto"}),Wa.focus({preventScroll:!0});let r=await a;if(t!==ea){typeof r=="function"&&r();return}Zs=typeof r=="function"?r:null}catch(a){if(t!==ea)return;console.error("Failed to render route",e,a),Wa.innerHTML=Xc(a);let r=document.getElementById("route-retry");r&&r.addEventListener("click",()=>Ka()),L("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function Zc(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable))return;let a=Ya(),r=a==="home"?"home-question":a==="rag"?"rag-question":"";if(!r)return;let i=document.getElementById(r);i&&(e.preventDefault(),i.focus())})}function ed(){let e=document.querySelector('[data-route="processing"]');if(!e)return;let t=e.querySelector(".nav-update-badge");t||(t=document.createElement("span"),t.className="nav-update-badge",t.hidden=!0,e.appendChild(t));let s=async()=>{try{let a=await H.updatesStatus(),r=Number(a.update_count)||0;r>0?(t.textContent=String(r),t.title=`\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0F\u5224\u6C7A\u6709 ${r} \u9805\u66F4\u65B0`,t.hidden=!1):t.hidden=!0}catch{t.hidden=!0}};s(),window.setInterval(s,6e4),window.addEventListener("focus",s),window.addEventListener("judgment:updates-changed",s)}function Ur(){ln(),Zc(),ed(),window.addEventListener("hashchange",Ka),Ka(),Ls()&&window.setTimeout(()=>{Ya()==="rag"&&(window.location.hash="#/tests")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ur):Ur();})();
